#!/usr/bin/env node
// The check runner (v0.11.20): every check of tools/check.sh, run in parallel on a job pool.
//   node tools/check.mjs          the full check (2,000 bot games each, the browser test, the sanity check). Before every push.
//   node tools/check.mjs quick    200 bot games each, no browser or sanity check (about 15 s), while building.
//   node tools/check.mjs --jobs N run at most N jobs at once (default: the cores + 1; the browser parts mostly wait).
// `bash tools/check.sh [quick]` calls this. The first failure stops the rest and prints its output; exit code 1.
// The full check writes each step's time to tools/timings.json and warns (never fails) when a step is more than
// 25% slower than the time stored there. See tests/README.md.
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir, availableParallelism, cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const QUICK = argv.includes('quick');
const CORES = availableParallelism?.() ?? cpus().length;
const ji = argv.indexOf('--jobs');
const JOBS = ji >= 0 ? Math.max(1, Number(argv[ji + 1]) || 1) : CORES + 1;
const GAMES = QUICK ? 200 : 2000;
const ST = mkdtempSync(path.join(tmpdir(), 'boneash-check-'));
const TIMINGS = path.join(ROOT, 'tools/timings.json');
const SLOWER = 1.25, MIN_WARN_S = 3;

const node = (...a) => [process.execPath, a];
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.js', '*.mjs'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

/** The jobs, in start order (longest first). `after`: names that must pass first. `heavy`: uses every core by itself. */
const jobs = [
    { name: `tasks (${GAMES} bot games each way${QUICK ? ', quick' : ''})`, key: 'tasks', cmd: node('tests/tasks.test.mjs', '--games', String(GAMES), '--stats-out', path.join(ST, 'tasks.json')), heavy: true },
    ...(QUICK ? [] : [
        { name: 'browser part 1 (Incremental, reload, Story, two tabs)', key: 'browser1', cmd: ['python3', ['tools/browser.py', '--part', '1']] },
        { name: 'browser part 2 (saves, menu, tooltip, resting places)', key: 'browser2', cmd: ['python3', ['tools/browser.py', '--part', '2']] },
    ]),
    { name: `story (${GAMES} full games${QUICK ? ', quick' : ''})`, key: 'story', cmd: node('tests/story.test.mjs', '--games', String(GAMES), '--stats-out', path.join(ST, 'story.json')), heavy: true },
    { name: 'syntax', key: 'syntax', fn: syntax },
    { name: 'consistency (offline files, versions)', key: 'consistency', cmd: node('tools/consistency.mjs') },
    { name: 'engine numbers', key: 'rules', cmd: node('tests/rules.test.mjs') },
    { name: "engine's own formula tests", key: 'engine', cmd: node('tests/engine.test.mjs') },
    { name: 'old saves (saves/)', key: 'saves', cmd: node('tests/saves.test.mjs') },
    { name: 'data integrity (ids, markers)', key: 'data', cmd: node('tests/data.test.mjs') },
    { name: 'content lint (log only, never fails)', key: 'lint', cmd: node('tools/lint.mjs') },
    ...['fallout', 'blackroot', 'heart', 'return'].map((p) => ({ name: `Act 1 part: ${p}`, key: `part:${p}`, cmd: node('tests/part.test.mjs', p) })),
    ...(QUICK ? [] : [{ name: 'sanity (invariants, drift ±5)', key: 'sanity', cmd: node('tools/sanity.mjs', '--tasks', path.join(ST, 'tasks.json'), '--story', path.join(ST, 'story.json')), after: ['tasks', 'story'] }]),
];

/** Every .js / .mjs file must parse (node --check), a few at a time. */
async function syntax() {
    const bad = [];
    for (let i = 0; i < files.length; i += 8) {
        const r = await Promise.all(files.slice(i, i + 8).map((f) => run(process.execPath, ['--check', f]).then((o) => (o.code ? `Syntax error in ${f}\n${o.out}` : null))));
        bad.push(...r.filter(Boolean));
    }
    return bad.length ? { code: 1, out: bad.join('\n') } : { code: 0, out: `all ${files.length} .js and .mjs files` };
}

const children = new Set();
function run(cmd, args) {
    return new Promise((resolve) => {
        const ch = spawn(cmd, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
        children.add(ch);
        let out = '';
        ch.stdout.on('data', (d) => { out += d; });
        ch.stderr.on('data', (d) => { out += d; });
        ch.on('error', (e) => { out += String(e); });
        ch.on('close', (code) => { children.delete(ch); resolve({ code: code ?? 1, out }); });
    });
}

const last = (out) => out.trim().split('\n').pop() || '';
const old = existsSync(TIMINGS) ? JSON.parse(readFileSync(TIMINGS, 'utf8')) : null;
const t0 = Date.now();
const done = new Map(); // key → { ok, s }
const times = {};
let failed = null, running = 0, heavyRunning = 0;
const queue = [...jobs];

await new Promise((finish) => {
    const next = () => {
        if (failed) { if (!running) finish(); return; }
        if (!queue.length && !running) { finish(); return; }
        while (running < JOBS && queue.length) {
            const i = queue.findIndex((j) => (j.after || []).every((a) => done.get(a)?.ok) && !(j.heavy && heavyRunning));
            if (i < 0) break;
            const j = queue.splice(i, 1)[0];
            running++; if (j.heavy) heavyRunning++;
            const s0 = Date.now();
            (j.fn ? j.fn() : run(j.cmd[0], j.cmd[1])).then((r) => {
                running--; if (j.heavy) heavyRunning--;
                const s = (Date.now() - s0) / 1000;
                times[j.key] = Math.round(s * 10) / 10;
                done.set(j.key, { ok: r.code === 0, s });
                const was = old?.steps?.[j.key];
                const slow = !QUICK && was && s > MIN_WARN_S && s > was * SLOWER ? `  (slower: ${was} s before)` : '';
                if (r.code === 0) console.log(`${j.name.padEnd(56)}ok  ${String(times[j.key]).padStart(5)} s  ${last(r.out)}${slow}`);
                else if (!failed) {
                    failed = j;
                    console.log(`${j.name.padEnd(56)}FAILED  (${times[j.key]} s)`);
                    console.log(r.out.trim().split('\n').slice(-20).join('\n'));
                    for (const ch of children) ch.kill();
                }
                next();
            });
        }
    };
    next();
});

rmSync(ST, { recursive: true, force: true });
const total = Math.round((Date.now() - t0) / 100) / 10;
if (failed) { console.log(`\nStopped at the first failure (${total} s).`); process.exit(1); }
if (!QUICK) {
    writeFileSync(TIMINGS, JSON.stringify({ note: 'Written by every full check (tools/check.mjs); committed with each push.', when: new Date().toISOString(), cores: CORES, jobs: JOBS, total, steps: times }, null, 2) + '\n');
    console.log(`All checks passed in ${total} s (${JOBS} jobs on ${CORES} cores${old ? `; last stored run ${old.total} s` : ''}).`);
} else console.log(`All quick checks passed in ${total} s (not enough for a push: run bash tools/check.sh).`);
