#!/usr/bin/env node
// The mechanics sanity check (v0.11.3, hard rule 2): run after every build, before the docs. Part of the full
// tools/check.sh (a flag fails it); `quick` skips it.
//
// 1. Invariants: the cultivation formulas, the Coil bonus, Story Mode's numbers.
// 2. Drift: every per-Coil rate of the tasks test's bots and every fight's win rate (both modes, both bot styles)
//    against tools/baseline.json. More than LIMIT points off, with at least MIN_N samples on both sides, is flagged.
//
//   node tools/sanity.mjs --tasks t.json --story s.json   compare the stats the two tests wrote (tools/check.sh does this)
//   node tools/sanity.mjs                                 run both tests itself first (about 50 s)
// v0.11.21: also a log-only line, the noise-scaled drift (tools/lib/noise.mjs): each number against its own chance
// wobble (3 × its noise, at least 2 points); it never fails the check, ±5 stays the rule until the owner says otherwise.
//   node tools/sanity.mjs --update                        save the current numbers as the new baseline — ONLY after the
//                                                         owner has seen the numbers of an intended change and said go
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { band, flagged, K as NOISE_K, MIN as NOISE_MIN } from './lib/noise.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const LIMIT = 5; // points
const MIN_N = 100; // samples
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(root, 'tools/baseline.json');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const update = argv.includes('--update');

let fails = 0;
const ok = (c, label) => { if (!c) { fails++; console.log(`  INVARIANT FAILED  ${label}`); } };

/* ---------- 1. invariants ---------- */
const G = await import(path.join(root, 'js/core/game.js'));
const M = await import(path.join(root, 'js/story/meridians.js'));
await import(path.join(root, 'js/story/prologue.js')); // installs every scene and hook
const near = (a, b) => Math.abs(a - b) < 0.051;
G.setNoDice(true);
for (const coil of [1, 2, 3, 5]) { // v0.11.15 (B1-b): the Coil bonus is XP only; sit, breakthrough and meridian time go by uses
    const mult = 1 + 0.5 * (coil - 1);
    const g = G.ensureBars(G.newGame(7, { closed: true })); g.coil.n = coil;
    ok(G.coilMult(g) === mult, `Coil ${coil}: XP bonus ×${mult} (${G.coilMult(g)})`);
    for (const uses of [0, 3, 6, 30]) {
        g.tasks.use = { 'act:sit': uses * 5, 'act:mer': uses * 5, 'act:bt': uses };
        const spSit = Math.min(10, 1 + (9 * uses * 5) / 30), spBt = Math.min(10, 1 + (9 * uses) / 6);
        for (const realm of [0, 1, 3, 7, 13]) {
            g.james.realm = realm;
            ok(near(G.sitGain(g), Math.round((100 / (10 * 2 ** realm)) * 10) / 10), `sit gain, realm ${realm}, Coil ${coil} (no Coil bonus)`);
            ok(G.btMinutes(g) === Math.round((120 * (realm + 1)) / spBt), `breakthrough length, realm ${realm}, Coil ${coil}, ${uses} uses`);
        }
        g.james.realm = 0;
        ok(G.sitMinutes(g) === Math.max(1, Math.round(60 / spSit)), `sit length, Coil ${coil}, ${uses * 5} uses`);
        ok(M.merMinutesOf(g, 'pri') === Math.max(10, Math.min(120, Math.ceil((2 * 60) / spSit / 10) * 10)), `first primary's sitting, Coil ${coil}, ${uses * 5} uses`);
    }
}
const sum = (n, f) => Array.from({ length: n }, (_, k) => f(k)).reduce((a, b) => a + b, 0);
ok(near(sum(12, M.priHours), 36) && near(sum(8, M.colHours), 32), 'meridian hours: 36 h primaries, 32 h groups');
ok(M.MER_FED_MIN === 20, 'meridian work locks below Fed 20');
{ const g = G.ensureBars(G.newGame(8)); const q = g.james.qi; const r = G.condense(g); ok(r.ok && g.minutes - G.START_MINUTES === 60 && q - g.james.qi <= 10, 'Incremental: a sit is 1 h and 10 Qi'); }
G.setNoDice(false);
{ const g = G.ensureBars(G.newGame(9)); g.coil.n = 4; ok(G.coilMult(g) === 1, 'Story Mode: no Coil bonus'); g.tasks = { use: { 'act:sit': 30, 'act:bt': 6 } }; const r = G.condense(g); ok(r.ok && g.minutes - G.START_MINUTES === 30, 'Story Mode: a sit is 30 min'); g.james.realm = 9; ok(G.btMinutes(g) === 120, 'Story Mode: a breakthrough is 2 h'); }

/* ---------- 2. drift ---------- */
let tasksFile = opt('tasks'), storyFile = opt('story');
if (!tasksFile || !storyFile) {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'boneash-sanity-')); process.on('exit', () => rmSync(tmp, { recursive: true, force: true })); // v0.11.21: its own folder (two runs at once no longer share files)
    tasksFile = path.join(tmp, 'tasks.json'); storyFile = path.join(tmp, 'story.json');
    for (const [t, f] of [['tasks', tasksFile], ['story', storyFile]]) {
        const r = spawnSync(process.execPath, [path.join(root, `tests/${t}.test.mjs`), '--stats-out', f], { cwd: root, encoding: 'utf8' });
        if (r.status !== 0) { console.log(`  the ${t} test failed; run it alone for details`); process.exit(1); }
    }
}
const T = JSON.parse(readFileSync(tasksFile, 'utf8')), S = JSON.parse(readFileSync(storyFile, 'utf8'));
ok(T.games >= 2000 && S.games >= 2000, `drift needs the full 2,000 games (tasks ${T.games}, story ${S.games})`);
ok(!T.badBars, `no NaN / Infinity bar after the bot games (${T.badBars})`);

/** Every compared number: { name: { v: percent, n: samples } }. */
const metrics = {};
const put = (name, k, n) => { if (n > 0) metrics[name] = { v: Math.round((1000 * k) / n) / 10, n }; };
for (const [c, d] of Object.entries(T.deaths.pro)) if (+c <= 4) { put(`prologue C${c} dead before Mei Lin`, d.early, d.coils); put(`prologue C${c} dead after Mei Lin`, d.late, d.coils); put(`prologue C${c} beast deaths`, d.beast, d.coils); }
for (const [c, d] of Object.entries(T.deaths.a1)) if (+c <= 4) { put(`Act 1 C${c} dead`, d.late, d.coils); put(`Act 1 C${c} beast deaths`, d.beast, d.coils); }
for (const [c, b] of Object.entries(T.byCoil)) if (+c <= 6) { const t = b.won + b.paid + b.lost; put(`tribute C${c} won`, b.won, t); put(`tribute C${c} paid`, b.paid, t); put(`tribute C${c} lost`, b.lost, t); }
for (const [k, f] of Object.entries(T.fights)) put(`fight ${k}`, f.win, f.win + f.lose + f.flee);
for (const [k, f] of Object.entries(S.fights)) put(`fight story-test:${k}`, f.win, f.win + f.lose + f.flee);

if (update) {
    if (fails) { console.log(`${fails} invariant(s) failed: baseline NOT saved.`); process.exit(1); }
    writeFileSync(BASE, `${JSON.stringify({ saved: new Date().toISOString().slice(0, 10), limit: LIMIT, minN: MIN_N, metrics }, null, 1)}\n`);
    console.log(`Baseline saved: ${Object.keys(metrics).length} numbers → tools/baseline.json`);
    process.exit(0);
}
if (!existsSync(BASE)) { console.log('  no tools/baseline.json yet (node tools/sanity.mjs --update)'); process.exit(1); }
const base = JSON.parse(readFileSync(BASE, 'utf8')).metrics;
const flags = [];
const wobble = []; // v0.11.21: log only
let compared = 0, small = 0;
for (const [name, b] of Object.entries(base)) {
    const m = metrics[name];
    if (!m) { if (b.n >= MIN_N) flags.push(`${name}: was ${b.v}% (n ${b.n}), now never happens`); continue; }
    if (flagged(b, m)) wobble.push(`${name}: ${b.v}% → ${m.v}% (band ±${band((b.v + m.v) / 2, b.n, m.n).toFixed(1)}; n ${b.n} → ${m.n})`);
    if (b.n < MIN_N || m.n < MIN_N) { small++; continue; }
    compared++;
    const d = Math.round((m.v - b.v) * 10) / 10;
    if (Math.abs(d) > LIMIT) flags.push(`${name}: ${b.v}% → ${m.v}% (${d > 0 ? '+' : ''}${d}; n ${b.n} → ${m.n})`);
}
for (const [name, m] of Object.entries(metrics)) if (!base[name] && m.n >= MIN_N) flags.push(`${name}: new, ${m.v}% (n ${m.n})`);
for (const f of flags) console.log(`  DRIFT  ${f}`);
for (const w of wobble) console.log(`  noise-scaled (log only)  ${w}`);
console.log(`  noise-scaled drift (log only, ${NOISE_K} × each number's noise, at least ${NOISE_MIN} points, every n): ${wobble.length} would flag; ${small} numbers under n ${MIN_N} are not compared by the ±${LIMIT} rule`);
const total = fails + flags.length;
console.log(`${compared} numbers compared (±${LIMIT} points, n ≥ ${MIN_N}): ${flags.length} drifted, ${fails} invariant(s) failed`);
process.exit(total ? 1 : 0);
