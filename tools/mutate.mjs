#!/usr/bin/env node
// The planted-fault check (v0.11.178, owner pick U1, PF): plants faults one at a time in scratch copies of the repo and runs a
// test command on each, so a review can say which faults the tests catch without a model doing the planting (the cold reviews of
// parts 6 and 7 planted 18 and 26 by hand). Nothing in the working copy is touched.
//
//   node tools/mutate.mjs faults.json                       each fault against `node tests/story.test.mjs --games 50 --workers 1` (DEFAULT_CMD)
//   node tools/mutate.mjs faults.json --cmd "node x.mjs"     another test command (run in the scratch copy's root)
//   node tools/mutate.mjs faults.json --jobs 2 --out r.md    copies run side by side (default 2: the workspace's cores); a report file
//   node tools/mutate.mjs faults.json --root dir             plant in a copy of another tree (the tests use a tiny one)
//
// faults.json: [{ "id": "F1", "file": "js/story/x.js", "find": "exact old text", "replace": "new text", "note": "what it breaks" }]
// `find` must occur exactly once in the file. Exit code: 0 when every fault was caught, 1 when one was missed or not applied.
import { readFileSync, writeFileSync, cpSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules']); // v0.11.192 (owner pick A1): art/ is copied (17 MB, 0.03 s): the consistency check and the art hash test read it
/** v0.11.185 (RV1, TG5): what a scratch copy keeps: SKIP only at the tree's top (a basename match dropped `js/art/` too, so
 *  `tests/data.test.mjs` and `check.sh quick` failed in every copy and a harmless fault came out "caught"). Pure. */
export const keepInCopy = (src, f) => !SKIP.has(path.relative(path.resolve(src), path.resolve(f)));
/** v0.11.192 (owner pick RV1, M2; the K1 review): a copy has no `.git`, so `git ls-files` (tools/check.mjs, the leftovers and consistency
 *  tests) died in it and every fault measured with `check.sh quick` came out "caught". Each copy gets a git index of its own files
 *  (no commit, nothing pushed); a machine without git keeps the copy as it was. Returns whether it worked. */
export function gitCopy(dir) {
    try { execFileSync('git', ['init', '-q'], { cwd: dir, stdio: 'ignore' }); execFileSync('git', ['add', '-A'], { cwd: dir, stdio: 'ignore' }); return true; } catch { return false; }
}

/** One fault applied to a file's text: { ok: true, text } or { ok: false, why }. Pure. */
export function applyFault(text, fault) {
    if (!fault || typeof fault.find !== 'string' || !fault.find || typeof fault.replace !== 'string') return { ok: false, why: 'needs find and replace' };
    const at = text.indexOf(fault.find);
    if (at < 0) return { ok: false, why: 'find not in the file' };
    if (text.indexOf(fault.find, at + 1) >= 0) return { ok: false, why: 'find occurs more than once' };
    if (fault.find === fault.replace) return { ok: false, why: 'replace is the same text' };
    return { ok: true, text: text.slice(0, at) + fault.replace + text.slice(at + fault.find.length) };
}

/** The report: a markdown table and the counts. Pure. results: [{ id, file, note, status: 'caught'|'missed'|'not applied', detail }] */
export function report(results) {
    const n = (s) => results.filter((r) => r.status === s).length;
    const cell = (t) => String(t ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 160);
    const lines = ['| Fault | File | What it breaks | Result | Detail |', '|---|---|---|---|---|', ...results.map((r) => `| ${cell(r.id)} | ${cell(r.file)} | ${cell(r.note)} | ${r.status} | ${cell(r.detail)} |`)];
    return { caught: n('caught'), missed: n('missed'), notApplied: n('not applied'), text: `${lines.join('\n')}\n\n${n('caught')} caught, ${n('missed')} missed, ${n('not applied')} not applied (of ${results.length}).` };
}

const run = (cmd, cwd) => new Promise((resolve) => {
    const p = spawn(cmd, { cwd, shell: true });
    let out = '';
    p.stdout.on('data', (d) => { out = (out + d).slice(-20000); });
    p.stderr.on('data', (d) => { out = (out + d).slice(-20000); });
    p.on('close', (code) => resolve({ code, out }));
});
/** The last line that names a failure, for the report. */
const failLine = (out) => out.split('\n').filter((l) => /fail|✗|not ok|Error|assert/i.test(l) && !/\b0 failed\b/.test(l)).pop() || out.trim().split('\n').pop() || '';

/** v0.11.257 (owner pick P27-A, MQ; P25-A review L6): the default test command. `--quick` was never a flag of the story test, so it
 *  ran the full 1,000 games a fault (313 s on 2 workers in the full check); 50 games on one worker, as the reviews pass by hand: 112 s. */
export const DEFAULT_CMD = 'node tests/story.test.mjs --games 50 --workers 1';

async function main(argv) {
    const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
    const list = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
    if (!list) { console.error('usage: node tools/mutate.mjs faults.json [--cmd "…"] [--jobs 2] [--out report.md] [--root dir]'); return 2; }
    const faults = JSON.parse(readFileSync(list, 'utf8'));
    const cmd = opt('--cmd', DEFAULT_CMD), jobs = Math.max(1, Number(opt('--jobs', 2)) || 1);
    const src = path.resolve(opt('--root', ROOT)), out = opt('--out', null);
    const base = await run(cmd, src);
    if (base.code !== 0) { console.error(`The test command fails before any fault is planted (exit ${base.code}): ${failLine(base.out)}`); return 2; }
    const copies = [...Array(Math.min(jobs, faults.length || 1))].map(() => {
        const dir = mkdtempSync(path.join(tmpdir(), 'boneash-mutate-'));
        cpSync(src, dir, { recursive: true, filter: (f) => keepInCopy(src, f) });
        gitCopy(dir); // RV1 (M2)
        return dir;
    });
    const results = [];
    let next = 0;
    await Promise.all(copies.map(async (dir) => {
        while (next < faults.length) {
            const i = next++, f = { ...faults[i], i };
            const file = path.join(dir, f.file || '');
            let orig;
            try { orig = readFileSync(file, 'utf8'); } catch { results.push({ ...f, status: 'not applied', detail: 'no such file' }); continue; }
            const a = applyFault(orig, f);
            if (!a.ok) { results.push({ ...f, status: 'not applied', detail: a.why }); continue; }
            writeFileSync(file, a.text);
            const r = await run(cmd, dir);
            writeFileSync(file, orig);
            results.push({ ...f, status: r.code !== 0 ? 'caught' : 'missed', detail: r.code !== 0 ? failLine(r.out) : '' });
        }
    }));
    for (const dir of copies) rmSync(dir, { recursive: true, force: true });
    results.sort((a, b) => a.i - b.i);
    const rep = report(results);
    if (out) writeFileSync(out, `${rep.text}\n`);
    console.log(rep.text);
    return rep.missed || rep.notApplied ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
