#!/usr/bin/env node
// The check runner (v0.11.20; v0.11.22: the leftover check, strict since v0.11.23): every check of tools/check.sh, run in parallel on a job pool.
//   node tools/check.mjs          the full check (2,000 bot games each, the browser test, the sanity check). Before every push.
//   node tools/check.mjs quick    200 bot games each, no browser or sanity check (about 15 s), while building.
//   node tools/check.mjs --jobs N run at most N jobs at once (default: the cores + 1; the browser parts mostly wait).
//   node tools/check.mjs --list [quick]  print the job list (key, name, after, heavy) as JSON, run nothing (v0.11.21).
// v0.11.21: the job list is checked first (unique keys, every `after` a job of this mode); a stuck queue stops the run;
// a failure or Ctrl-C kills each job's whole process tree (bot workers, Chromium, http.server). The pool: tools/lib/jobs.mjs.
// `bash tools/check.sh [quick]` calls this. The first failure stops the rest and prints its output; exit code 1.
// The full check writes each step's time to tools/timings.json and warns (never fails) when a step is more than
// 25% slower than the time stored there. See tests/README.md.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir, availableParallelism, cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateJobs, run, runPool, onSignals } from './lib/jobs.mjs'; // v0.11.21

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const QUICK = argv.includes('quick');
const LIST = argv.includes('--list'); // v0.11.21
const CORES = availableParallelism?.() ?? cpus().length;
const ji = argv.indexOf('--jobs');
const JOBS = ji >= 0 ? Math.max(1, Number(argv[ji + 1]) || 1) : CORES + 1;
const GAMES = QUICK ? 200 : 2000;
const ST = LIST ? path.join(tmpdir(), 'boneash-check-list') : mkdtempSync(path.join(tmpdir(), 'boneash-check-')); // v0.11.21: --list makes no temp dir
const TIMINGS = path.join(ROOT, 'tools/timings.json');
const SLOWER = 1.25, MIN_WARN_S = 3;

const node = (...a) => [process.execPath, a];
const files = LIST ? [] : execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.js', '*.mjs'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

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
    { name: 'content lint (old names, duplicate labels)', key: 'lint', cmd: node('tools/lint.mjs') }, // v0.11.21: those two strict
    { name: 'test tools (shard merge, 1 = 2 workers, job list)', key: 'tools', cmd: node('tests/tools.test.mjs') }, // v0.11.21
    ...['fallout', 'blackroot', 'heart', 'return'].map((p) => ({ name: `Act 1 part: ${p}`, key: `part:${p}`, cmd: node('tests/part.test.mjs', p) })),
    // v0.11.22: the leftover check (strict since v0.11.23, choices log only). Full runs add what the bot games touched: the story test watches its flags and items
    // itself; the tasks games get a separate small watched run (a Proxy slows every game in its process, so not in the big test).
    ...(QUICK ? [{ name: 'leftovers (strict, static scan)', key: 'leftovers', show: true, cmd: node('tools/leftovers.mjs', '--strict') }] : [
        { name: 'watched bot games (300 each way, flags, items)', key: 'track', cmd: node('tests/tasks.test.mjs', '--bots-only', '--track', '--games', '300', '--workers', '1', '--stats-out', path.join(ST, 'track.json')), after: ['tasks'] },
        { name: 'watched story games (300 and the walks)', key: 'track-story', cmd: node('tests/story.test.mjs', '--track', '--games', '300', '--workers', '1', '--stats-out', path.join(ST, 'track-story.json')), after: ['tasks'] },
        { name: 'leftovers (strict; choices log only)', key: 'leftovers', show: true, cmd: node('tools/leftovers.mjs', '--strict', '--seen', ...['story', 'tasks', 'track', 'track-story'].map((k) => path.join(ST, `${k}.json`))), after: ['tasks', 'story', 'track', 'track-story'] },
    ]),
    ...(QUICK ? [] : [{ name: 'sanity (invariants, drift ±5)', key: 'sanity', cmd: node('tools/sanity.mjs', '--tasks', path.join(ST, 'tasks.json'), '--story', path.join(ST, 'story.json')), after: ['tasks', 'story'] }]),
];

/** Every .js / .mjs file must parse (node --check), a few at a time. */
async function syntax() {
    const bad = [];
    for (let i = 0; i < files.length; i += 8) {
        const r = await Promise.all(files.slice(i, i + 8).map((f) => run(process.execPath, ['--check', f], ROOT).then((o) => (o.code ? `Syntax error in ${f}\n${o.out}` : null))));
        bad.push(...r.filter(Boolean));
    }
    return bad.length ? { code: 1, out: bad.join('\n') } : { code: 0, out: `all ${files.length} .js and .mjs files` };
}

const last = (out) => out.trim().split('\n').pop() || '';
const old = existsSync(TIMINGS) ? JSON.parse(readFileSync(TIMINGS, 'utf8')) : null;
const t0 = Date.now();
const times = {};

// v0.11.21: a broken job list stops before anything runs (a mistyped `after` once left a job waiting forever)
const problems = validateJobs(jobs);
if (problems.length) {
    console.log(`The job list in tools/check.mjs is broken${QUICK ? ' (quick mode)' : ''}:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    if (!LIST) rmSync(ST, { recursive: true, force: true });
    process.exit(1);
}
if (LIST) { console.log(JSON.stringify(jobs.map((j) => ({ key: j.key, name: j.name, after: j.after || [], heavy: !!j.heavy })), null, 2)); process.exit(0); }
onSignals(() => rmSync(ST, { recursive: true, force: true })); // v0.11.21: Ctrl-C kills the job trees too

const { failed, stuck } = await runPool(jobs, {
    limit: JOBS, cwd: ROOT,
    onDone: (j, r, s, first) => {
        times[j.key] = Math.round(s * 10) / 10;
        const was = old?.steps?.[j.key];
        const slow = !QUICK && was && s > MIN_WARN_S && s > was * SLOWER ? `  (slower: ${was} s before)` : '';
        if (!first) {
            console.log(`${j.name.padEnd(56)}ok  ${String(times[j.key]).padStart(5)} s  ${last(r.out)}${slow}`);
            if (j.show) console.log(r.out.trim().split('\n').slice(0, -1).join('\n')); // v0.11.22: the leftover report in full
        } else {
            console.log(`${j.name.padEnd(56)}FAILED  (${times[j.key]} s)`);
            console.log(r.out.trim().split('\n').slice(-20).join('\n'));
        }
    },
});

rmSync(ST, { recursive: true, force: true });
const total = Math.round((Date.now() - t0) / 100) / 10;
if (failed) { console.log(`\nStopped at the first failure (${total} s).`); process.exit(1); }
if (stuck.length) { // v0.11.21: should not happen after validateJobs; never end without a verdict
    console.log(`\nStuck: these jobs could never start (${total} s):\n${stuck.map((j) => `  - ${j.key} (after: ${(j.after || []).join(', ') || 'nothing'})`).join('\n')}`);
    process.exit(1);
}
if (!QUICK) {
    writeFileSync(TIMINGS, JSON.stringify({ note: 'Written by every full check (tools/check.mjs); committed with each push.', when: new Date().toISOString(), cores: CORES, jobs: JOBS, total, steps: times }, null, 2) + '\n');
    console.log(`All checks passed in ${total} s (${JOBS} jobs on ${CORES} cores${old ? `; last stored run ${old.total} s` : ''}).`);
} else console.log(`All quick checks passed in ${total} s (not enough for a push: run bash tools/check.sh).`);
