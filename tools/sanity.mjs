#!/usr/bin/env node
// The mechanics sanity check (v0.11.3, hard rule 2): run after every build, before the docs. Part of the full
// tools/check.sh (a flag fails it); `quick` skips it.
//
// 1. Invariants: the cultivation formulas, the Coil bonus (Story Mode's numbers dropped in v0.11.34, D1).
// 2. Drift: every per-Coil rate of the tasks test's bots and every fight's win rate (both bot styles; Incremental Mode only since v0.11.34)
//    against tools/baseline.json. More than LIMIT points off, with at least MIN_N samples on both sides, is flagged.
//    v0.11.37 (owner 17:03, pick T1): LIMIT 5 → 20 until the retune; a move of more than NOTE_AT (5) points is still
//    printed, as a log-only NOTE line.
//
//   node tools/sanity.mjs --tasks t.json --story s.json   compare the stats the two tests wrote (tools/check.sh does this)
//   node tools/sanity.mjs                                 run both tests itself first (about 50 s)
// v0.11.21: also a log-only line, the noise-scaled drift (tools/lib/noise.mjs): each number against its own chance
// wobble (3 × its noise, at least 2 points); it never fails the check.
// v0.11.251 (owner pick P21-E, DG): --long m.json (the long calendar's models, tests/models.test.mjs --json) compares those numbers with
// tools/baseline-long.json, log only (40 games a model: most numbers have small n); --update saves it too.
// v0.11.268 (owner pick P36-A; tools/lib/longguard.mjs): LG, the long numbers are a guard like tools/baseline.json (±20 points, n ≥ 50
// both sides, fails the check; past 5 with n ≥ 20 a NOTE); TT, one log-only TARGET line per target of tools/targets.json (the owner's
// 2026-11-22 targets); LU, --update needs the long numbers and saves tools/baseline-long.json and tools/models-baseline.json with
// tools/baseline.json (v0.11.266 and v0.11.267 re-saved without --long, so the long file went stale); KS, --last reads the stats the
// last full check kept (tools/.last-check/) and refuses if js/ or tests/ changed since.
// v0.11.273 (owner pick P41-A, FZ + RR): one FROZEN line per frozen section's key number (tools/targets.json's `frozen`); a number out
// of its band (by more than 2 × its standard error) fails the check. A section is frozen only on the owner's word (working-agreement.md).
//   node tools/sanity.mjs --update --last                 save the last full check's numbers as the new baselines — ONLY after the
//                                                         owner has seen the numbers of an intended change and said go
//   node tools/sanity.mjs --update --tasks t --story s --long m   the same from given stats files
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { band, flagged, K as NOISE_K, MIN as NOISE_MIN, LIMIT, NOTE_AT, driftKind } from './lib/noise.mjs';
import { longMetricsOf, compareLong, shareTable, targetLines, frozenLines, readKept } from './lib/longguard.mjs'; // v0.11.268 (P36-A); frozenLines v0.11.273 (P41-A, FZ)
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

// LIMIT 20 points (v0.11.37, owner 17:03: was 5), NOTE_AT 5: tools/lib/noise.mjs
const MIN_N = 50; // samples (v0.11.42, owner pick B1: was 100; 9 more numbers compared)
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
for (const coil of [1, 2, 3, 5]) { // v0.11.15 (B1-b): the Coil bonus is XP only; sit, breakthrough and meridian time go by uses
    const mult = 1 + 0.25 * (coil - 1); // v0.11.29 (RB-1): 0.5 → 0.25
    const g = G.ensureBars(G.newGame(7, { closed: true })); g.coil.n = coil; // v0.11.259 (owner pick OC-A, M1): the long calendar, newGame's default
    ok(G.coilMult(g) === mult, `Coil ${coil}: XP bonus ×${mult} (${G.coilMult(g)})`);
    for (const uses of [0, 3, 6, 30]) {
        g.tasks.use = { 'act:sit': uses * 5, 'act:mer': uses * 5, 'act:bt': uses };
        const spSit = Math.min(10, 1 + (9 * uses * 5) / 30), spBt = Math.min(10, 1 + (9 * uses) / 6);
        for (const realm of [0, 1, 3, 7, 13]) {
            g.james.realm = realm;
            ok(near(G.sitGain(g), Math.max(G.LONG_SIT_MIN, Math.round((100 / (10 * 1.5 ** realm) / G.satDiv(g)) * 10) / 10)), `sit gain, realm ${realm}, Coil ${coil} (×1.5 a realm since v0.11.66, S1; no Coil bonus; v0.11.259 OC-A, M1: the long calendar's ÷${G.satDiv(g)}, at least ${G.LONG_SIT_MIN}%)`);
            ok(G.btMinutes(g) === Math.round((120 * (realm + 1)) / spBt), `breakthrough length, realm ${realm}, Coil ${coil}, ${uses} uses`);
        }
        g.james.realm = 0;
        ok(G.sitMinutes(g) === Math.max(1, Math.round(60 / spSit)), `sit length, Coil ${coil}, ${uses * 5} uses`);
        ok(M.merMinutesOf(g, 'pri') === Math.max(10, Math.min(120, Math.ceil((2 * 60 * G.merMult(g)) / spSit / 10) * 10)), `first primary's sitting, Coil ${coil}, ${uses * 5} uses (v0.11.259 OC-A, M1: its hours ×${G.merMult(g)} on the long calendar)`);
    }
}
const sum = (n, f) => Array.from({ length: n }, (_, k) => f(k)).reduce((a, b) => a + b, 0);
ok(near(sum(12, M.priHours), 36) && near(sum(8, M.colHours), 32), 'meridian hours: 36 h primaries, 32 h groups');
ok(M.MER_FED_MIN === 20, 'meridian work locks below Fed 20');
{ const g = G.ensureBars(G.newGame(8)); const q = g.james.qi; const r = G.condense(g); ok(r.ok && g.minutes - G.START_MINUTES === 60 && q - g.james.qi <= 10, 'Incremental: a sit is 1 h and 10 Qi'); }
// v0.11.34 (D1): Story Mode's invariants dropped (Incremental Mode only)

/* ---------- 2. drift ---------- */
let tasksFile = opt('tasks'), storyFile = opt('story'), longFile = opt('long');
if (argv.includes('--last')) { // v0.11.268 (P36-A, KS): the last full check's kept stats
    const k = readKept(root);
    if (k.error) { console.log(`  --last: ${k.error}`); process.exit(1); }
    ({ tasks: tasksFile, story: storyFile, long: longFile } = k);
    console.log(`  --last: the full check's stats of ${k.when}`);
}
if (update && !(longFile && existsSync(longFile))) { console.log('  --update needs the long calendar\'s numbers too: --last (after a full check) or --long m.json (v0.11.268, P36-A LU); nothing saved'); process.exit(1); }
if (!tasksFile || !storyFile) {
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'boneash-sanity-')); process.on('exit', () => rmSync(tmp, { recursive: true, force: true })); // v0.11.21: its own folder (two runs at once no longer share files)
    tasksFile = path.join(tmp, 'tasks.json'); storyFile = path.join(tmp, 'story.json');
    for (const [t, f] of [['tasks', tasksFile], ['story', storyFile]]) {
        const r = spawnSync(process.execPath, [path.join(root, `tests/${t}.test.mjs`), '--stats-out', f], { cwd: root, encoding: 'utf8' });
        if (r.status !== 0) { console.log(`  the ${t} test failed; run it alone for details`); process.exit(1); }
    }
}
const T = JSON.parse(readFileSync(tasksFile, 'utf8')), S = JSON.parse(readFileSync(storyFile, 'utf8'));
ok(T.games >= 1000 && S.games >= 1000, `drift needs the full 1,000 games (tasks ${T.games}, story ${S.games})`);
ok(!T.badBars, `no NaN / Infinity bar after the bot games (${T.badBars})`);

/** Every compared number: { name: { v: percent, n: samples } }. */
const metrics = {};
const put = (name, k, n) => { if (n > 0) metrics[name] = { v: Math.round((1000 * k) / n) / 10, n }; };
for (const [c, d] of Object.entries(T.deaths.pro)) if (+c <= 4) { put(`prologue C${c} dead before Mei Lin`, d.early, d.coils); put(`prologue C${c} dead after Mei Lin`, d.late, d.coils); put(`prologue C${c} beast deaths`, d.beast, d.coils); }
for (const [c, d] of Object.entries(T.deaths.a1)) if (+c <= 4) { put(`Act 1 C${c} dead`, d.late, d.coils); put(`Act 1 C${c} beast deaths`, d.beast, d.coils); }
for (const [c, b] of Object.entries(T.byCoil)) if (+c <= 6) { const t = b.won + b.paid + b.lost; put(`tribute C${c} won`, b.won, t); put(`tribute C${c} paid`, b.paid, t); put(`tribute C${c} lost`, b.lost, t); }
for (const [k, f] of Object.entries(T.fights)) put(`fight ${k}`, f.win, f.win + f.lose + f.flee);
for (const [k, f] of Object.entries(S.fights)) put(`fight story-test:${k}`, f.win, f.win + f.lose + f.flee);

/* ---------- 3. the long calendar's drift (v0.11.251, DG; log only until v0.11.268, P36-A LG: a guard) ---------- */
const BASE_LONG = path.join(root, 'tools/baseline-long.json');
const MODELS_BASE = path.join(root, 'tools/models-baseline.json');
const TARGETS = path.join(root, 'tools/targets.json');
const L = longFile && existsSync(longFile) ? JSON.parse(readFileSync(longFile, 'utf8')) : null;
const longMetrics = L ? longMetricsOf(L) : {};

if (update) {
    if (fails) { console.log(`${fails} invariant(s) failed: baseline NOT saved.`); process.exit(1); }
    const day = new Date().toISOString().slice(0, 10);
    writeFileSync(BASE, `${JSON.stringify({ saved: day, limit: LIMIT, minN: MIN_N, metrics }, null, 1)}\n`);
    console.log(`Baseline saved: ${Object.keys(metrics).length} numbers → tools/baseline.json`);
    writeFileSync(BASE_LONG, `${JSON.stringify({ saved: day, note: `a guard as tools/baseline.json: ±${LIMIT} points, n ≥ ${MIN_N} (v0.11.268, P36-A LG; log only since v0.11.251)`, metrics: longMetrics }, null, 1)}\n`);
    console.log(`Long-calendar baseline saved: ${Object.keys(longMetrics).length} numbers → tools/baseline-long.json`);
    writeFileSync(MODELS_BASE, `${JSON.stringify({ saved: day, args: `the full check's models step, saved by tools/sanity.mjs --update (v0.11.268, P36-A MB)`, models: shareTable(L) }, null, 1)}\n`);
    console.log(`Models baseline saved: ${Object.keys(L).length} models → tools/models-baseline.json`);
    process.exit(0);
}
if (!existsSync(BASE)) { console.log('  no tools/baseline.json yet (node tools/sanity.mjs --update)'); process.exit(1); }
const base = JSON.parse(readFileSync(BASE, 'utf8')).metrics;
const flags = [];
const wobble = []; // v0.11.21: log only
let compared = 0, small = 0;
const moved = []; // v0.11.37: past ±NOTE_AT, inside ±LIMIT
for (const [name, b] of Object.entries(base)) {
    const m = metrics[name];
    if (!m) { if (b.n >= MIN_N) flags.push(`${name}: was ${b.v}% (n ${b.n}), now never happens`); continue; }
    if (flagged(b, m)) wobble.push(`${name}: ${b.v}% → ${m.v}% (band ±${band((b.v + m.v) / 2, b.n, m.n).toFixed(1)}; n ${b.n} → ${m.n})`);
    if (b.n < MIN_N || m.n < MIN_N) { small++; continue; }
    compared++;
    const d = Math.round((m.v - b.v) * 10) / 10;
    const kind = driftKind(d);
    if (kind === 'drift') flags.push(`${name}: ${b.v}% → ${m.v}% (${d > 0 ? '+' : ''}${d}; n ${b.n} → ${m.n})`);
    else if (kind === 'note') moved.push(`${name}: ${b.v}% → ${m.v}% (${d > 0 ? '+' : ''}${d}; n ${b.n} → ${m.n})`);
}
for (const [name, m] of Object.entries(metrics)) if (!base[name] && m.n >= MIN_N) flags.push(`${name}: new, ${m.v}% (n ${m.n})`);
for (const f of flags) console.log(`  DRIFT  ${f}`);
for (const w of moved) console.log(`  NOTE  moved more than ${NOTE_AT} points (log only)  ${w}`);
for (const w of wobble) console.log(`  noise-scaled (log only)  ${w}`);
let longFlags = 0, longSum = '', frozenFails = 0;
if (L) { // v0.11.268 (P36-A, LG): a guard like tools/baseline.json (log only v0.11.251–267)
    const lb = existsSync(BASE_LONG) ? JSON.parse(readFileSync(BASE_LONG, 'utf8')).metrics : null;
    if (!lb) { longFlags = 1; console.log('  DRIFT  long calendar: no tools/baseline-long.json (node tools/sanity.mjs --update --last, after the owner\'s go)'); }
    else {
        const r = compareLong(lb, longMetrics, { limit: LIMIT, noteAt: NOTE_AT, minN: MIN_N });
        longFlags = r.flags.length;
        for (const f of r.flags) console.log(`  DRIFT  long calendar  ${f}`);
        for (const n of r.notes) console.log(`  NOTE  long calendar, moved more than ${NOTE_AT} points (log only)  ${n}`);
        longSum = `; long calendar: ${r.compared} compared (of ${r.total}), ${r.flags.length} drifted, ${r.notes.length} noted`;
    }
    // v0.11.268 (P36-A, TT): the owner's 2026-11-22 targets, log only
    if (existsSync(TARGETS)) {
        const TJ = JSON.parse(readFileSync(TARGETS, 'utf8'));
        for (const t of targetLines(TJ.targets, L)) console.log(t);
        // v0.11.273 (P41-A, FZ): the frozen sections' key numbers; out fails the check (none frozen until the owner's word)
        const fz = frozenLines(TJ.frozen, L);
        for (const l of fz.lines) console.log(l);
        frozenFails = fz.fails;
    }
}
console.log(`  noise-scaled drift (log only, ${NOISE_K} × each number's noise, at least ${NOISE_MIN} points, every n): ${wobble.length} would flag; ${small} numbers under n ${MIN_N} are not compared by the ±${LIMIT} rule`);
const total = fails + flags.length + longFlags + frozenFails;
console.log(`${compared} numbers compared (±${LIMIT} points, n ≥ ${MIN_N}): ${flags.length} drifted, ${moved.length} moved more than ${NOTE_AT} (log only)${longSum}, ${fails} invariant(s) failed`);
process.exit(total ? 1 : 0);
