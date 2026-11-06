// Run: node tests/tools.test.mjs — the test tools themselves (v0.11.21).
// tests/lib/shard.mjs: mergeInto's rules, seedOf, and that 1 worker gives the same bot stats as 2 (story 100 games,
// tasks 51 games with --bots-only: the fewest that still get 2 workers, since shard.mjs allows one worker per 50 games).
// tools/lib/noise.mjs: the noise-scaled drift band of tools/sanity.mjs (log only).
// tools/check.mjs: its job list (--list, both modes) and tools/lib/jobs.mjs's validateJobs on a broken list.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeInto, seedOf } from './lib/shard.mjs';
import { validateJobs } from '../tools/lib/jobs.mjs';
import { noise, band, flagged, K, MIN } from '../tools/lib/noise.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) pass++; else { fail++; console.error('  FAIL ', l); } };
const t0 = Date.now();

// start the bot runs first (they take the time); the quick checks below run while they play
const TMP = mkdtempSync(path.join(tmpdir(), 'boneash-tools-'));
// v0.11.21: the tasks runs play their games with --bots-only (no rule checks): that was 20 s of the full check, for nothing this compares
const RUNS = [['story', 'tests/story.test.mjs', 100, []], ['tasks', 'tests/tasks.test.mjs', 51, ['--bots-only']]];
const bot = (file, games, workers, out, extra = []) => new Promise((resolve) => {
    const ch = spawn(process.execPath, [file, ...extra, '--games', String(games), '--workers', String(workers), '--stats-out', out], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    ch.stdout.on('data', (d) => { log += d; });
    ch.stderr.on('data', (d) => { log += d; });
    ch.on('close', (code) => resolve({ code, log }));
});
const pending = RUNS.flatMap(([name, file, games, extra]) => [1, 2].map((w) => bot(file, games, w, path.join(TMP, `${name}-${w}.json`), extra).then((r) => ({ name, w, ...r }))));

// 1. mergeInto: numbers add, max* keys take the largest, objects merge per key, { __set } → Set union
{
    const into = { n: 2, maxSteps: 7, fights: { a: { won: 1, lost: 2 } }, seen: new Set(['x']) };
    mergeInto(into, { n: 3, maxSteps: 5, fights: { a: { won: 4 }, b: { won: 1 } }, seen: { __set: ['y', 'x'] }, fresh: 1, maxNew: -3 });
    assert(into.n === 5, 'mergeInto: numbers add');
    assert(into.maxSteps === 7, 'mergeInto: max* keeps the larger (7 over 5)');
    mergeInto(into, { maxSteps: 9 });
    assert(into.maxSteps === 9, 'mergeInto: max* takes a larger new value');
    assert(into.maxNew === -3, 'mergeInto: a new max* key takes its value (even below 0)');
    assert(into.fresh === 1, 'mergeInto: a new number key starts at its value');
    assert(into.fights.a.won === 5 && into.fights.a.lost === 2, 'mergeInto: nested objects merge per key');
    assert(into.fights.b?.won === 1, 'mergeInto: a new nested object is added');
    assert(into.seen instanceof Set && into.seen.size === 2 && into.seen.has('x') && into.seen.has('y'), 'mergeInto: { __set } is a Set union');
    const fromNothing = mergeInto({}, { s: { __set: [1, 2] }, o: { k: 1 } });
    assert(fromNothing.s instanceof Set && fromNothing.s.size === 2 && fromNothing.o.k === 1, 'mergeInto: into an empty object');
}

// 2. seedOf: deterministic, 32-bit, different for neighbouring games and streams
{
    assert(seedOf(5, 3) === seedOf(5, 3), 'seedOf: same game and stream, same seed');
    const seeds = new Set();
    let ok32 = true;
    for (let r = 0; r < 2000; r++) { const s = seedOf(r, 0); seeds.add(s); if (!Number.isInteger(s) || s < 0 || s > 0xffffffff) ok32 = false; }
    assert(ok32, 'seedOf: unsigned 32-bit integers');
    assert(seeds.size === 2000, `seedOf: 2,000 games give 2,000 seeds (${seeds.size})`);
    let neighbours = true;
    for (let r = 0; r < 200; r++) if (seedOf(r, 0) === seedOf(r + 1, 0) || seedOf(r, 0) === seedOf(r, 1)) neighbours = false;
    assert(neighbours, 'seedOf: neighbouring games and streams differ');
}

// 3. tools/check.mjs --list and the job lists of both modes
const list = (...a) => { try { return { code: 0, jobs: JSON.parse(execFileSync(process.execPath, ['tools/check.mjs', '--list', ...a], { cwd: ROOT, encoding: 'utf8' })) }; } catch (e) { return { code: e.status ?? 1, jobs: null, err: String(e.stdout || e) }; } };
for (const mode of ['full', 'quick']) {
    const r = list(...(mode === 'quick' ? ['quick'] : []));
    assert(r.code === 0 && Array.isArray(r.jobs), `check.mjs --list ${mode}: exit 0 and a JSON list${r.err ? `: ${r.err}` : ''}`);
    const jobs = r.jobs || [];
    const keys = jobs.map((j) => j.key);
    assert(jobs.length >= 10, `${mode}: at least 10 jobs (${jobs.length})`);
    assert(new Set(keys).size === keys.length, `${mode}: keys unique`);
    assert(jobs.every((j) => typeof j.name === 'string' && Array.isArray(j.after) && typeof j.heavy === 'boolean'), `${mode}: every job has name, after, heavy`);
    for (const j of jobs) for (const a of j.after) assert(keys.includes(a), `${mode}: ${j.key} waits for ${a}, a job of this mode`);
    for (const k of ['tasks', 'story', 'syntax', 'data']) assert(keys.includes(k), `${mode}: has ${k}`);
    assert(jobs.filter((j) => j.heavy).map((j) => j.key).sort().join() === 'story,tasks', `${mode}: the heavy jobs are tasks and story`);
    assert(validateJobs(jobs.map((j) => ({ ...j, cmd: ['x', []] }))).length === 0, `${mode}: validateJobs finds no problem`);
    if (mode === 'full') {
        const s = jobs.find((j) => j.key === 'sanity');
        assert(s && s.after.includes('tasks') && s.after.includes('story'), 'full: sanity waits for tasks and story');
        assert(keys.includes('browser1') && keys.includes('browser2'), 'full: has both browser parts');
    } else assert(!keys.some((k) => k.startsWith('browser') || k === 'sanity'), 'quick: no browser or sanity jobs');
}

// 4. validateJobs flags a broken list
{
    const ok = [{ key: 'a', name: 'A', cmd: ['x', []] }, { key: 'b', name: 'B', fn: () => {}, after: ['a'] }];
    assert(validateJobs(ok).length === 0, 'validateJobs: a good list has no problems');
    const dup = validateJobs([...ok, { key: 'a', name: 'A again', cmd: ['x', []] }]);
    assert(dup.length === 1 && /duplicate key "a"/.test(dup[0]), `validateJobs: duplicate key (${dup.join('; ')})`);
    const typo = validateJobs([...ok, { key: 'c', name: 'C', cmd: ['x', []], after: ['tsks'] }]);
    assert(typo.length === 1 && /"c" waits for "tsks"/.test(typo[0]), `validateJobs: unknown after (${typo.join('; ')})`);
    const loop = validateJobs([{ key: 'a', name: 'A', cmd: ['x', []], after: ['b'] }, { key: 'b', name: 'B', cmd: ['x', []], after: ['a'] }]);
    assert(loop.length === 1 && /loop/.test(loop[0]), `validateJobs: a loop of afters (${loop.join('; ')})`);
    assert(validateJobs([{ name: 'no key', cmd: ['x', []] }]).length === 1, 'validateJobs: a job without a key');
    assert(validateJobs([{ key: 'a', name: 'A' }]).length === 1, 'validateJobs: a job without cmd or fn');
}

// 5. tools/lib/noise.mjs (v0.11.21): the standard error of a difference of two rates, and the band built on it
{
    const near = (a, b) => Math.abs(a - b) < 0.01;
    assert(near(noise(50, 2000, 2000), 100 * Math.sqrt(0.25 * (2 / 2000))), `noise at 50%, n 2,000 / 2,000 is ${noise(50, 2000, 2000).toFixed(2)} points`);
    assert(noise(50, 100, 100) > noise(50, 1000, 1000) && noise(50, 1000, 1000) > noise(90, 1000, 1000), 'noise shrinks with n and away from 50%');
    assert(noise(0, 500, 500) > 0 && noise(100, 500, 500) > 0, 'a rate at 0% or 100% still has some noise');
    assert(K === 3 && MIN === 2, `the band is ${K} × noise, at least ${MIN} points`);
    assert(band(50, 100000, 100000) === MIN, 'a huge sample: the band is the 2-point floor');
    assert(near(band(81, 107, 107), 3 * noise(81, 107, 107)) && band(81, 107, 107) > 5, `tribute C6 (81%, n 107): band ±${band(81, 107, 107).toFixed(1)}, wider than ±5`);
    assert(!flagged({ v: 50, n: 2000 }, { v: 50, n: 2000 }), 'no change: not flagged');
    assert(flagged({ v: 50, n: 2000 }, { v: 55, n: 2000 }), 'n 2,000: a 5-point move is flagged');
    assert(!flagged({ v: 81, n: 107 }, { v: 75, n: 107 }), 'n 107: a 6-point move is within the noise');
}

// 6. 1 worker = 2 workers: the same stats, object keys sorted
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const results = await Promise.all(pending);
for (const [name] of RUNS) {
    const [r1, r2] = [1, 2].map((w) => results.find((r) => r.name === name && r.w === w));
    for (const r of [r1, r2]) assert(r.code === 0, `${name} --workers ${r.w}: exit 0${r.code ? `\n${r.log.slice(-1500)}` : ''}`);
    let a = null, b = null;
    try { a = JSON.stringify(canon(JSON.parse(readFileSync(path.join(TMP, `${name}-1.json`), 'utf8')))); b = JSON.stringify(canon(JSON.parse(readFileSync(path.join(TMP, `${name}-2.json`), 'utf8')))); } catch (e) { assert(false, `${name}: stats files readable (${e.message})`); }
    assert(a && a.length > 50, `${name}: stats written (${a?.length ?? 0} chars)`);
    assert(a === b, `${name}: 1 worker and 2 workers give the same stats`);
}
rmSync(TMP, { recursive: true, force: true });

console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
