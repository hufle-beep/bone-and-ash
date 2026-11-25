// Run: node tests/tools.test.mjs — the test tools themselves (v0.11.21).
// tests/lib/shard.mjs: mergeInto's rules, seedOf, and that 1 worker gives the same bot stats as 2 (story 51 games since v0.11.28,
// tasks 51 games with --bots-only: the fewest that still get 2 workers, since shard.mjs allows one worker per 50 games).
// tools/lib/noise.mjs: the noise-scaled drift band of tools/sanity.mjs (log only).
// tools/check.mjs: its job list (--list, both modes) and tools/lib/jobs.mjs's validateJobs on a broken list.
// v0.11.28: tools/lib/report.mjs (the compact output) and the models step's --off-models, on a tiny real models run.
// v0.11.39: tools/arthash.mjs (the ART fingerprints in sw.js) on a made-up folder and on the real repo.
// v0.11.62: tools/art/patch.py on a made-up picture.
// v0.11.22: tools/leftovers.mjs on small made-up inputs (every kind found, kept entries skipped) and tests/lib/seen.mjs's watch.
// v0.11.126: tools/lint.mjs reads function texts on sample states (a planted old name in one form fails it).
// v0.11.132 (owner picks PL1, E1): the story-text lint (tools/textlint.mjs, tools/lib/textlint.mjs) and the bot models' Act 1 endings,
// repeated screens and their saved copy (tests/models.test.mjs --texts, tools/models-baseline.json).
// v0.11.271 (owner picks P39-A, JW-A): the moves of v0.11.268's handover items into history-54.md (a new part) and the rows (MD).
// v0.11.270 (owner pick P38-A): systems before Act 2 in the Order line and the headings.
// v0.11.269 (owner pick P37-A): the dangling open items' moves and rule 2's command.
// v0.11.268 (owner pick P36-A): tools/lib/longguard.mjs (LG the long calendar's guard, TT the targets, MB the share table, KS the
// kept stats) on made-up numbers and a made-up root; sanity --update refuses without the long numbers (LU), in a copy.
// v0.11.80: the fight lab (tools/fightlab.mjs, tools/lib/fightlab.mjs): its summary on made-up samples, one fight on a real
// state, and a tiny real run (1 worker = 2 workers; the bots' own fights the same with and without the lab).
import { spawn, execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeInto, seedOf } from './lib/shard.mjs';
import { validateJobs } from '../tools/lib/jobs.mjs';
import { noise, band, flagged, K, MIN, LIMIT, NOTE_AT, driftKind } from '../tools/lib/noise.mjs';
import { strip, scanFunctions, scanFlags, flagFindings, scanCss, scanMarkers, scanStorage, scanFiles, applyKeep, loadKeep, KINDS, strictFailures, STRICT_KINDS } from '../tools/leftovers.mjs'; // v0.11.22; strict v0.11.23
import { seen as touched, track, noteView, seenOut } from './lib/seen.mjs'; // v0.11.22
import { stepLine, flagLines, leftoverFound, modelDigest } from '../tools/lib/report.mjs'; // v0.11.28
import { applyFault, report as mutateReport, keepInCopy, gitCopy, DEFAULT_CMD as MUTATE_CMD } from '../tools/mutate.mjs'; // v0.11.178 (owner pick U1, PF); v0.11.185 (RV1, TG5): keepInCopy
import { sparePlan, SPARE_FROM, SPARE_UNTIL, SPARE_QI_HOURS, SPARE_FED_MIN } from './lib/spare.mjs'; // v0.11.142 (owner pick CV1)
import { artFiles, fingerprint, readArt, checkArt, writeArt, ART_RE } from '../tools/arthash.mjs'; // v0.11.39
import { TACTICS, FIXED, rank, rankLabel, stream, isOneMove, playFight, sampleFight, sampleOrder, labId, tacticStats, thirds, guNeeded, summarize, summarizeAll, tableLines } from '../tools/lib/fightlab.mjs'; // v0.11.80
import { SCENES } from '../js/story/prologue.js'; // v0.11.80: the story's hooks, for the fight lab's real fight
import { newGame, ensureBars, combatHooks, startCombat, combatStep } from '../js/core/game.js'; // v0.11.80
import { shingles, reusedPassages, favouritePhrases, tics, broken, spacing, snapshotDiff, shareNote, poolCounts } from '../tools/lib/textlint.mjs'; // v0.11.132 (E1); v0.11.134 (LP2, LR): poolCounts
import { frozenLines } from '../tools/lib/longguard.mjs'; // v0.11.273 (owner pick P41-A, FZ)
import { XP_LINE, skillPrint, linesOf, silentSkill, skillWatchLine } from './lib/skillwatch.mjs'; // v0.11.273 (P41-A, SW)
import { ENGINE_MINUTES, KINDS as TL_KINDS, kindOf, engineFor, lintTimes, timeLintLines, CLOCKED } from '../tools/lib/timelint.mjs'; // v0.11.273 (P41-A, TL)
import { defaultMinutes } from '../js/core/story.js'; // v0.11.273 (TL)
import '../js/core/tasks.js'; // v0.11.273 (TL): the hubs' menus timeless, as in the game
import { longMetricsOf, compareLong, shareTable, measure, verdict, targetLines, codeStamp, keepStats, readKept, KEPT_DIR, KEPT_FILES } from '../tools/lib/longguard.mjs'; // v0.11.268 (owner pick P36-A)
import { docFindings, newestHistory, newestResearch, HANDOVER_MAX, HISTORY_MAX, RESEARCH_MAX, DOC_TOOL_MAX, MIRROR_MAX, PER_PUSH } from '../tools/lib/docs.mjs'; // v0.11.73; v0.11.78 the research parts

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) pass++; else { fail++; console.error('  FAIL ', l); } };
const t0 = Date.now();

// start the bot runs first (they take the time); the quick checks below run while they play
const TMP = mkdtempSync(path.join(tmpdir(), 'boneash-tools-'));
// v0.11.103 (owner pick BF1, T): the browser test's wait helper is quiet only on a timeout; any other error in a wait (the
// part 2 flake: "Yuki's job" pasted into a JS string) is a failure naming the wait. Played on fake pages, no browser.
{
    const py = `
import sys, json; sys.path.insert(0, 'tools')
import browser as b
from playwright.sync_api import TimeoutError as PWTimeout
class Page:
    def __init__(s, exc): s.exc = exc
    def wait_for_function(s, what, arg=None, timeout=0):
        if s.exc: raise s.exc
    def wait_for_selector(s, what, state=None, timeout=0):
        if s.exc: raise s.exc
out = {}
b.fails.clear(); out['ok'] = [b.until(Page(None), '1'), len(b.fails)]
b.fails.clear(); out['timeout'] = [b.until(Page(PWTimeout('Timeout 3000ms exceeded.')), '0', 3000), len(b.fails)]
b.fails.clear(); out['syntax'] = [b.until(Page(Exception('SyntaxError: missing ) after argument list')), "() => f('Yuki's job')"), list(b.fails)]
b.fails.clear(); out['selector'] = [b.until(Page(Exception('Unexpected token')), 'div[', 1000, 'attached'), list(b.fails)]
b.fails.clear(); out['empty'] = [b.until(Page(ValueError()), '1'), list(b.fails)]
print(json.dumps(out))
`;
    let o = null;
    try { o = JSON.parse(execFileSync('python3', ['-c', py], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').pop()); } catch (e) { assert(false, `BF1 T: the wait helper's fake-page run (${String(e).slice(0, 160)})`); }
    if (o) {
        assert(o.ok[0] === true && o.ok[1] === 0, `BF1 T: a wait that holds returns true, no failure (${JSON.stringify(o.ok)})`);
        assert(o.timeout[0] === false && o.timeout[1] === 0, `BF1 T: a timeout returns false quietly (${JSON.stringify(o.timeout)})`);
        assert(o.syntax[0] === false && o.syntax[1].length === 1 && /until: the wait itself failed .*Yuki's job.*missing \) after argument list/.test(o.syntax[1][0]), `BF1 T: a broken expression is a failure naming the wait (${JSON.stringify(o.syntax)})`);
        assert(o.empty[0] === false && o.empty[1].length === 1 && /ValueError/.test(o.empty[1][0]), `BF1 T: an error with no message names its type (review low 1) (${JSON.stringify(o.empty)})`);
        assert(o.selector[0] === false && o.selector[1].length === 1 && /until: the wait itself failed \(div\[\)/.test(o.selector[1][0]), `BF1 T: a broken selector too (${JSON.stringify(o.selector)})`);
    }
    const src = readFileSync(path.join(ROOT, 'tools/browser.py'), 'utf8');
    assert(!/until\(pg, f"[^"]*data-faq=\\"\{/.test(src), 'BF1 F: the FAQ wait no longer pastes an entry name into the JS text');
    // v0.11.253 (owner pick P23-A, BT): the browser flows play the long calendar (no old-calendar key) and read a hand-built save as the game loads it
    assert(!/boneash\.oldcal|evaluate\(OLD_CAL\)|^OLD_CAL =/m.test(src) && (src.match(/const c = ensureBars\(migrate\(JSON\.parse\(JSON\.stringify\(st\)\)\)\); flipFill\(c\); (const read|co)/g) || []).length === 3 && !/flipFill\((?!c\))/.test(src), 'P23-A (BT; the review\'s TG6): the browser flows set no old-calendar key; the three read records come from the save flipped in place, as the game loads it');
}
// v0.11.21: the tasks runs play their games with --bots-only (no rule checks): that was 20 s of the full check, for nothing this compares
const RUNS = [['story', 'tests/story.test.mjs', 51, []], // v0.11.28 (owner pick S2): 100 → 51, the fewest that still get 2 workers
    ['tasks', 'tests/tasks.test.mjs', 51, ['--bots-only']]];
const bot = (file, games, workers, out, extra = []) => new Promise((resolve) => {
    const ch = spawn(process.execPath, [file, ...extra, '--games', String(games), '--workers', String(workers), '--stats-out', out], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    ch.stdout.on('data', (d) => { log += d; });
    ch.stderr.on('data', (d) => { log += d; });
    ch.on('close', (code) => resolve({ code, log }));
});
// v0.11.80: the fight lab's tiny real runs (1 and 2 workers) and the same bot games without it
const labRun = (w) => new Promise((resolve) => {
    const out = path.join(TMP, `lab-${w}.json`);
    const ch = spawn(process.execPath, ['tools/fightlab.mjs', '--games', '12', '--workers', String(w), '--min', '1', '--json', out], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = ''; ch.stdout.on('data', (d) => { log += d; }); ch.stderr.on('data', (d) => { log += d; });
    ch.on('close', (code) => { let j = null; try { j = JSON.parse(readFileSync(out, 'utf8')); } catch { /* checked below */ } resolve({ code, log, j }); });
});
const labPending = Promise.all([labRun(1), labRun(2), bot('tests/tasks.test.mjs', 12, 1, path.join(TMP, 'lab-plain.json'), ['--bots-only'])]);
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
    assert(jobs.filter((j) => j.heavy).map((j) => j.key).sort().join() === 'models,models-kept,story,tasks', `${mode}: the heavy jobs are tasks, story and the bot models and the realm kept (v0.11.27; v0.11.227 KA1, KM: models-kept; v0.11.253 P23-A, LB: models-long folded into models)`);
    { const ml = jobs.find((j) => j.key === 'models'); assert(ml && /^bot models, the long calendar \(/.test(ml.name) && !keys.includes('models-long'), `${mode}: the models step plays the long calendar, no separate long step (v0.11.253, P23-A LB)`); }
    assert(validateJobs(jobs.map((j) => ({ ...j, cmd: ['x', []] }))).length === 0, `${mode}: validateJobs finds no problem`);
    if (mode === 'full') {
        const s = jobs.find((j) => j.key === 'sanity');
        assert(s && s.after.includes('tasks') && s.after.includes('story'), 'full: sanity waits for tasks and story');
        { const src = readFileSync(new URL('../tools/sanity.mjs', import.meta.url), 'utf8'), chk = readFileSync(new URL('../tools/check.mjs', import.meta.url), 'utf8');
          assert(s.after.includes('models') && (chk.match(/models-long\.json/g) || []).length === 2 && /'--long', path\.join\(ST, 'models-long\.json'\)/.test(chk) && /compareLong\(lb, longMetrics/.test(src) && /const total = fails \+ flags\.length \+ longFlags( \+ frozenFails)?;/.test(src) && /baseline-long\.json/.test(src), 'v0.11.251 (P21-E, DG): sanity reads the long calendar\'s models; v0.11.268 (P36-A, LG): a guard, its drifts fail sanity');
          assert(/if \(!QUICK && keepStats\(ROOT, ST\)\)/.test(chk) && chk.indexOf('keepStats(ROOT, ST)') < chk.lastIndexOf('rmSync(ST'), 'v0.11.268 (P36-A, KS): the full check keeps its stats before it deletes them'); }
        assert(['browser1', 'browser2', 'browser3', 'browser4'].every((k) => keys.includes(k)), 'full: has the four browser parts (part 3 v0.11.39, part 4 v0.11.41)');
        const lo = jobs.find((j) => j.key === 'leftovers'), tr = jobs.find((j) => j.key === 'track');
        const ts = jobs.find((j) => j.key === 'track-story');
        assert(lo && tr && ts && ['tasks', 'story', 'track', 'track-story'].every((a) => lo.after.includes(a)) && [tr, ts].every((j) => j.after.includes('tasks') && !j.heavy), 'v0.11.22 full: leftovers waits for tasks, story and both watched runs; the watched runs after tasks, not heavy');
    } else {
        assert(!keys.some((k) => k.startsWith('browser') || k === 'sanity' || k.startsWith('track')), 'quick: no browser, sanity or watched-run jobs');
        assert(jobs.find((j) => j.key === 'leftovers')?.after.length === 0, 'v0.11.22 quick: the static leftover scan, waiting for nothing');
    }
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
    // v0.11.37 (owner 17:03, pick T1): the drift rule ±20 fails, past ±5 is listed log only
    assert(LIMIT === 20 && NOTE_AT === 5, `the drift rule: ±${LIMIT} fails, past ±${NOTE_AT} a log-only note`);
    assert(driftKind(0) === 'ok' && driftKind(5) === 'ok' && driftKind(-5.1) === 'note' && driftKind(11.5) === 'note' && driftKind(20) === 'note' && driftKind(-20.1) === 'drift' && driftKind(30) === 'drift', 'driftKind: ok ≤ 5 < note ≤ 20 < drift, both signs');
}

// 6. 1 worker = 2 workers: the same stats, object keys sorted
// v0.11.22: the leftover check (tools/leftovers.mjs) on made-up inputs: every kind is found, and the keep-list skips
{
    const src = (raw) => ({ raw, ...strip(raw) });
    // the tokenizer: comments go, string text is kept apart, ${…} code stays, a regex is not a string, a division is not a regex
    const t = strip("const a = 'x // y'; // gone\n/* gone */ const b = `t ${f('q')} u`; const r = /'[a-z]/g; const d = a / b / 2; const e = \"it\\'s\";");
    assert(!/gone/.test(t.code) && t.strings.includes('x // y') && t.strings.includes('q') && t.strings.includes('t ') && t.strings.includes(' u'), `strip: comments gone, strings apart (${JSON.stringify(t.strings)})`);
    assert(/\bf\(/.test(t.code) && /\/r\//.test(t.code) && /a \/ b \/ 2/.test(t.code) && !t.strings.includes('[a-z'), `strip: template code kept, regex not a string, division kept (${t.code})`);
    const inc = strip("let i = 0; const h = i++ / 2; const s = 'q';");
    assert(inc.strings.join() === 'q' && /i\+\+ \/ 2/.test(inc.code), `strip: x++ / 2 is a division (${inc.code})`);
    const nest = strip('const s = `a ${b ? `c ${d}` : "e"} f`; g();');
    assert(/\bb\b/.test(nest.code) && /\bd\b/.test(nest.code) && /\bg\(\)/.test(nest.code) && nest.strings.includes('e'), `strip: nested templates (${nest.code})`);
    // functions: unused, used only by tests, used only by main.js; a skipped file is not scanned
    const game = {
        'js/a.js': src('export function used() {}\nexport function lonely() {}\nexport const ALONE = 3;\nexport function forTests() {}\nexport function forUi() {}\nexport const { p, q: renamed } = obj;\nused(); p();'),
        'js/main.js': src('import { forUi } from "./a.js"; forUi();'),
        'js/core/formulas.js': src('export function engineOnly() {}'),
    };
    const other = { 'tests/x.mjs': src('forTests();') };
    const fn = scanFunctions(game, other, ['js/core/formulas.js']);
    const names = (l) => l.map((x) => x.replace(/ \(.*/, '')).sort().join();
    assert(names(fn.unused) === 'ALONE,lonely,renamed', `scanFunctions: unused (${names(fn.unused)})`);
    assert(names(fn.testOnly) === 'forTests' && names(fn.browserOnly) === 'forUi', `scanFunctions: tests only (${names(fn.testOnly)}), main.js only (${names(fn.browserOnly)})`);
    // flags: every write and read form; a flag set and never read, one read and never set; the bots' reads clear a static hit
    const fl = scanFlags({ 'js/s.js': src([
        "g.flags.w1 = true; g.flags.both = 1; if (g.flags.both) x(); g.flags.n2 += 1; delete g.flags.d1;",
        "enter: set('s1', 's2'), show: once('s2'); markDaily(g, 'mk'); daily('mk'); if (g.flags?.opt) y(); g.flags['br'] = 1; if (g.flags['rd']) z();",
        "Object.assign(g.flags, { oa: true }); for (const f of ['l1', 'l2']) g.flags[f] = true; if (g.flags.ghost === 2) w(); const art = 'w1';",
        "const f = (g && g.flags) || {}; if (f.viaAlias) v(); g.flags.viaAlias = 1; g.myflags.notAFlag = 1; g.flags.div /= 2;",
        "const TABLE = { tk: 'a', tk2: 'b' }; g.flags.tk = 1; g.flags.tk2 = 1; for (const k of Object.keys(TABLE)) if (g.flags[k]) u();",
    ].join('\n')) });
    const ff = flagFindings(fl, null);
    assert(ff.unread.join() === 'd1,div,n2,oa' && ff.unset.join() === 'ghost,opt' && !fl.W.has('notAFlag') && fl.R.has('viaAlias') && fl.R.has('tk2'), `flags (static; a plain-string name may be a built key, so it hides): unread ${ff.unread.join()} · unset ${ff.unset.join()}`);
    const fs2 = flagFindings(fl, { flagsRead: new Set(['oa', 'l1']), flagsWritten: new Set(['opt']) });
    assert(fs2.unread.join() === 'br,d1,div,l2,n2,s1,w1' && fs2.unset.join() === 'ghost,rd', `flags (with the bots): a read in play clears it; a plain-string mention no longer hides one (${fs2.unread.join()} · ${fs2.unset.join()})`);
    // CSS, data-* markers, storage keys, files
    const css = scanCss('.used { a: 1 } .gone, #lost:hover { b: url(x.png) } .tag.used-2 {} .b-fail {} /* .comment */', 'class="used used-2 tag" id="here" `card b-${band}`');
    assert(css.join() === '#lost,.gone', `scanCss: a class built in a template (b-\${band}) counts (${css.join()})`);
    const mk = scanMarkers('<b data-run="1" data-gone="2" data-tip-text="3">', 'x.closest("[data-run]"); el.dataset.tipText; page.locator("[data-other]")');
    assert(mk.join() === 'gone', `scanMarkers (${mk.join()})`);
    const sk = scanStorage([
        "const A = 'boneash.a';", "localStorage.setItem(A, 1);", "localStorage.getItem(A);", "localStorage.setItem('boneash.lost', 2);", "localStorage.getItem('boneash.only');",
        "const B = 'boneash.b', C = 'boneash.bc'; store.set(B, 1); store.set(C, 1); store.get(C);", // a read of boneash.bc is not a read of boneash.b
        "const S = (n) => `boneash.slot${n}`; store.set(S(1), 'x'); store.get(S(2));",
        "const P = (k) => `boneash.p.${k}`; store.set(P(1), 1); for (const k of keys) if (k.startsWith('boneash.p.')) n++;",
    ].join('\n'));
    assert(sk.join() === 'boneash.b,boneash.lost', `scanStorage: constants, the store wrapper, exact keys, a prefix scan (${sk.join()})`);
    const files = scanFiles(['js/a.js', 'js/b.js', 'art/bg/pine.jpg', 'art/bg/gone.jpg', 'tools/hand.py'], { 'index.html': '<script src="js/a.js">', 'js/a.js': "import './b.js'; img(`art/bg/${'pine'}.jpg`);", 'js/b.js': '' });
    assert(files.join() === 'art/bg/gone.jpg,tools/hand.py', `scanFiles (${files.join()})`);
    // the keep-list: exact names and prefixes skip, entries that match nothing are listed, a reason is required
    const k = applyKeep({ files: ['saves/a.json', 'tools/x.py'], functions: ['f (js/a.js)', 'g (js/a.js)'] }, { files: { 'saves/*': 'the saves test' }, functions: { f: 'hook', h: 'gone' } });
    assert(k.left.files.join() === 'tools/x.py' && k.left.functions.join() === 'g (js/a.js)' && k.kept.files === 1 && k.stale.join() === 'functions: h', `applyKeep (${JSON.stringify(k.left)} · stale ${k.stale.join()})`);
    assert(KINDS.every((kd) => Array.isArray(k.left[kd])), 'applyKeep: every kind listed');
    // v0.11.23: strict mode fails on any kind but choices; the real repo passes it (static scan)
    const sf = strictFailures({ functions: ['f (js/a.js)'], choices: ['s#1 (x)'], flagsUnread: [] });
    assert(sf.join() === 'functions: f (js/a.js)' && !STRICT_KINDS.includes('choices') && STRICT_KINDS.length === KINDS.length - 1, `strict: a function fails, a choice doesn't (${sf.join()})`);
    let strictOut = '', strictCode = 0;
    try { strictOut = execFileSync(process.execPath, ['tools/leftovers.mjs', '--strict'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { strictCode = e.status ?? 1; strictOut = String(e.stdout || e); }
    assert(strictCode === 0 && /strict: 0 leftovers outside the keep-list/.test(strictOut), `v0.11.23: the game has no leftover outside the keep-list (static scan; exit ${strictCode}): ${strictOut.trim().split('\n').pop()}`);
    const real = loadKeep(path.join(ROOT, 'tools/leftovers-keep.json'));
    assert(real.errors.length === 0 && Object.keys(real.keep).length > 0, `tools/leftovers-keep.json: valid, every entry has a reason (${real.errors.join('; ')})`);
    const bad = path.join(TMP, 'keep.json');
    writeFileSync(bad, JSON.stringify({ keep: { files: { a: '' }, nonsense: {} } }));
    assert(loadKeep(bad).errors.length === 2, `loadKeep: a missing reason and an unknown kind are errors (${loadKeep(bad).errors.join('; ')})`);
}
// v0.11.22: tests/lib/seen.mjs watches flags and items without changing them
{
    for (const s of Object.values(touched)) s.clear();
    const g = { scene: 'here', flags: { old: 1, 'job@3': true }, inventory: { herb: 2 } };
    track(g);
    const copy = JSON.parse(JSON.stringify(g)); const spread = { ...g.flags };
    assert(copy.flags.old === 1 && spread['job@3'] === true && touched.flagsRead.size === 0, `seen: a JSON copy and a spread are not reads (${[...touched.flagsRead]})`);
    assert(touched.flagsWritten.size === 0, `seen: the first watch seeds nothing (what a test set up by hand is not the game's writing: ${[...touched.flagsWritten]})`);
    const r = g.flags.old; g.flags.fresh = true; const h = 'nope' in g.flags; delete g.flags.old; g.inventory.herb -= 1;
    assert(r === 1 && h === false && touched.flagsRead.has('old') && touched.flagsRead.has('nope') && touched.flagsWritten.has('fresh') && touched.itemsRead.has('herb') && touched.itemsWritten.has('herb'), 'seen: reads, `in`, writes and deletes are recorded');
    assert(JSON.stringify(g.flags) === '{"job@3":true,"fresh":true}' && g.inventory.herb === 1, 'seen: the watched objects behave like the plain ones');
    g.flags = { swapped: 1, 'day@4': true }; track(g); void g.flags.swapped;
    assert(touched.flagsRead.has('swapped') && touched.flagsWritten.has('swapped') && touched.flagsWritten.has('day') && !touched.flagsWritten.has('day@4'), 'seen: a replaced flags object (a rewind) is watched again, its keys count as written, a daily key under its name');
    void Object.keys(g.flags).length; void g.flags.afterKeys;
    assert(touched.flagsRead.has('afterKeys'), 'seen: a read right after Object.keys is still a read');
    noteView(g, { choices: [{ index: 0 }, { index: 2 }, { index: 1002 }] });
    const out = seenOut();
    assert(out.choices.join() === 'here#0,here#2' && out.flagsRead.join() === [...out.flagsRead].sort().join(), `seen: shown choices (not card rows), sorted output (${out.choices.join()})`);
    for (const s of Object.values(touched)) s.clear();
}
// 8. v0.11.28: the full check's compact output (tools/lib/report.mjs) and the models step's Yuki-off list
{
    assert(/^ok {2}tasks {10} {2}70\.8 s$/.test(stepLine('tasks', 70.8)) && stepLine('sanity', 0.2, '  (slower: 0.1 s before)').endsWith('(slower: 0.1 s before)'), `stepLine (${stepLine('tasks', 70.8)})`);
    const out = ['  noise-scaled (log only)  x: 50% → 58% (band ±3; n 2000 → 2000)', '  noise-scaled drift (log only, 3 × …): 1 would flag', '  DRIFT  y: 10% → 20%', '  NOTE  careful: hungry', 'NOTE not indented', '208 numbers compared'].join('\n');
    assert(flagLines(out).join('|') === '  noise-scaled (log only)  x: 50% → 58% (band ±3; n 2000 → 2000)|  DRIFT  y: 10% → 20%|  NOTE  careful: hungry', `flagLines keeps the flags, not the summaries (${flagLines(out).join('|')})`);
    assert(flagLines('  keep-list entries that match nothing now (log only): flags: x').length === 1, 'flagLines keeps the stale keep-list line');
    assert(leftoverFound('strict: 0 leftovers outside the keep-list (63 kept on purpose); choices log only: 2') && !leftoverFound('strict: 0 leftovers outside the keep-list (63 kept on purpose); choices log only: 0'), 'leftoverFound: only log-only choices count on a pass');
    assert(modelDigest('no report here') === null && modelDigest('[careful] 5 games, 1 cards\n  prologue: —') === null, 'modelDigest: an unreadable report gives null (the whole report is printed then)');
    assert(/200 games each/.test(list().jobs?.find((j) => j.key === 'models')?.name ?? '') && /50 games each/.test(list('quick').jobs?.find((j) => j.key === 'models')?.name ?? ''), 'the models step: 200 games each in the full check (v0.11.254, P24-A CM: was 500), 50 in quick (v0.11.28)');
    // the real report format: a tiny models run, Yuki off only for the listed model
    let rep = '';
    try { rep = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful,rusher', '--games', '4', '--off', '2', '--off-models', 'careful', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { rep = String(e.stdout || e); }
    const heads = [...rep.matchAll(/^\[([^\]]+)\] (\d+) games/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    assert(heads === 'careful 4,careful:yukiOff 2,rusher 4', `models --off-models careful: Yuki off only for Careful, no Random (${heads})`);
    const dg = modelDigest(rep);
    assert(dg?.length === 3 && dg.every((l) => /prologue C1 dead [\d.]+% · mean Coil ([\d.]+|—) \/ ([\d.]+|—) · whole game C1 [\d.]+%( · realm [\d.]+)?( · tribute Day ([\d.]+|—), Act 1 ends Day ([\d.]+|—))?( · \d+ gave up)?$/.test(l)), `modelDigest reads the real report, one line per model (${dg?.join(' | ') ?? 'null'})`);
    assert(modelDigest(rep, 3)?.length === 3 && modelDigest(rep, 4) === null, 'modelDigest: a missing model block prints the whole report');
    const gaveUp = modelDigest('[rusher] 9 games, 1 cards (1 forced: a screen with no story exit), 7 gave up after Coil 8\n  prologue: C1 dead 100% (n 9)\n  cleared: prologue 22.2% (mean Coil 7.00) · Act 1 22.2% (mean Coil 7.00) · the whole game on Coil 1 0%');
    assert(/· 7 gave up$/.test(gaveUp?.[0] ?? ''), `modelDigest keeps the games that gave up (${gaveUp?.[0]})`);
    let bad = 0;
    try { execFileSync(process.execPath, ['tests/models.test.mjs', '--games', '1', '--off-models', 'nobody'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { bad = e.status; }
    assert(bad === 2, `models --off-models with an unknown model exits 2 (${bad})`);
    // v0.11.203 (owner pick T1, TS8): --cal 7, a tiny real run on the long calendar: every game ends, its days line read by the digest
    { let lr = ''; try { lr = execFileSync(process.execPath, ['tests/models.test.mjs', '--cal', '7', '--model', 'careful', '--games', '2', '--off', '0', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { lr = `FAILED ${e.status} ${String(e.stdout || e)}`; }
      const ld = modelDigest(lr, 1);
      assert(/0 failed/.test(lr) && /days: tribute Day [\d.]+ \(n \d+\) · Act 1's end Day 10[34]\.0 \(n 2\) · the long calendar/.test(lr) && /· tribute Day [\d.]+, Act 1 ends Day 10[34]\.0$/.test(ld?.[0] ?? ''), `models --cal 7: two long-calendar games end on Day 103 or 104 (93 or 94 before v0.11.222, TS9), the digest names the days (${ld?.[0] ?? lr.slice(-300)})`);
      let bc = 0; try { execFileSync(process.execPath, ['tests/models.test.mjs', '--games', '1', '--cal', '5'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { bc = e.status; }
      let b0 = 0; try { execFileSync(process.execPath, ['tests/models.test.mjs', '--games', '1', '--cal', '0'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { b0 = e.status; }
      assert(bc === 2 && b0 === 2, `models --cal with another number exits 2, the old calendar's 0 too (v0.11.260, the cold review's L2, TG5: ${bc} / ${b0})`); }
    { // RV1 (TG6): the long calendar's step plays the long calendar (its arguments read from the source, as the Sitter's below)
      const cs = readFileSync(path.join(ROOT, 'tools/check.mjs'), 'utf8'), line = cs.split('\n').find((l) => l.includes("key: 'models',")) || '';
      const mt = readFileSync(path.join(ROOT, 'tests/models.test.mjs'), 'utf8');
      assert(line.includes("'--texts', '--json', path.join(ST, 'models-long.json'))") && !line.includes("'--cal'") && /const CAL = Number\(opt\('cal', LONG_CAL\)\) \|\| 0;/.test(mt), 'v0.11.253 (P23-A, LB): the models step plays the models\' default, the long calendar, and writes the long log\'s numbers (RV1 TG6\'s pin, moved)'); }
    { // v0.11.227 (owner pick KA1, KM): a tiny real --kept run: both passes play, the first pass's clear is counted, the digest reads the block
      let kr = ''; try { kr = execFileSync(process.execPath, ['tests/models.test.mjs', '--cal', '7', '--model', 'completionist', '--games', '2', '--off', '0', '--kept'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { kr = String(e.stdout || ''); }
      assert(/0 failed/.test(kr) && /^\[completionist:kept\] 2 games/m.test(kr) && /kept \(KA1, KM\): the first pass won 2 of 2 \(realm at its clear [\d.]+, mean Coil [\d.]+\); this second pass starts at realm 1\.00/.test(kr) && modelDigest(kr, 1), `models --kept: two games play both passes, the second from Foundation (${kr.slice(-300)})`); }
    { // v0.11.227 (owner picks KA1 + KM-40): the second pass after a won Act 1, 40 games of the four long-calendar bots (10 in quick), log only
      const cs = readFileSync(path.join(ROOT, 'tools/check.mjs'), 'utf8'), line = cs.split('\n').find((l) => l.includes("key: 'models-kept'")) || '';
      assert(line.includes("node('tests/models.test.mjs', '--cal', '7', '--model', 'careful,sociable,completionist,cultivator', '--games', QUICK ? '10' : '20', '--off', '0', '--kept')") /* v0.11.254 (P24-A, CK): 40 → 20 */ && line.includes('blocks: 4') && line.includes('heavy: true'), 'models-kept: --cal 7 --kept, the four models, 40 games (10 in quick), four blocks (KA1, KM-40)'); }
    // v0.11.85 (owner pick M1): the Sitter in the models step (its own game count), and a tiny real Sitter run
    const mj = list().jobs?.find((j) => j.key === 'models'), mq = list('quick').jobs?.find((j) => j.key === 'models');
    const src = readFileSync(path.join(ROOT, 'tools/check.mjs'), 'utf8'); // --list gives names only: the job's arguments read from the source
    assert(/the Sitter 60/.test(mj?.name ?? '') && /the Sitter 20/.test(mq?.name ?? '') && src.includes("'--model', 'careful,completionist,rusher,sitter,farmer,cultivator,sociable'") && src.includes("'--sitter-games', QUICK ? '20' : '60'") && src.includes("blocks: QUICK ? 7 : 9") && /the Sociable 200/.test(mj?.name ?? '') && /the Sociable 50,/.test(mq?.name ?? ''), `the models step plays the Sitter: 60 games (20 quick; v0.11.254 P24-A, CM: 150 → 60), 9 / 7 blocks (v0.11.86: with the Farmer; v0.11.142: the Cultivator; v0.11.160: the Sociable) (${mj?.name}; ${mq?.name})`);
    let sit = '';
    try { sit = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful,sitter', '--games', '3', '--sitter-games', '2', '--off', '0', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { sit = String(e.stdout || e); }
    const sh = [...sit.matchAll(/^\[([^\]]+)\] (\d+) games, (\d+) cards/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    const sCards = Number(sit.match(/^\[sitter\] \d+ games, (\d+) cards/m)?.[1] || 0), cCards = Number(sit.match(/^\[careful\] \d+ games, (\d+) cards/m)?.[1] || 0);
    assert(sh === 'careful 3,sitter 2' && / 0 failed/.test(sit), `models --sitter-games 2: the Sitter plays its own count, nothing fails (${sh})`);
    assert(sCards / 2 > 2 * (cCards / 3), `the Sitter runs far more cards a game than Careful (${sCards / 2} vs ${cCards / 3}: the sits; v0.11.87: per game, ×2, since O1 shut the Heart's endless sits)`);
    let badS = 0;
    try { execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'sitter', '--games', '1', '--sitter-games', 'abc'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { badS = e.status; }
    assert(badS === 2, `models --sitter-games abc exits 2 (${badS})`);
    // v0.11.86 (#53): the Farmer in the models step (its own count), a tiny real run: 10 bites by choice, then ×1
    assert(/the Farmer 40/.test(mj?.name ?? '') && /the Farmer 20/.test(mq?.name ?? '') && src.includes("'--farmer-games', QUICK ? '20' : '40'") /* v0.11.254 (P24-A, CM): 100 → 40 */ && src.includes("'--games', QUICK ? '50' : '200'") && src.includes("'--off', QUICK ? '0' : '120'"), `the models step plays the Farmer: 100 games (20 quick) (${mj?.name}; ${mq?.name})`);
    let farm = '';
    try { farm = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful,farmer', '--games', '3', '--farmer-games', '2', '--off', '0', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { farm = String(e.stdout || e); }
    const fh = [...farm.matchAll(/^\[([^\]]+)\] (\d+) games, (\d+) cards/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    assert(fh === 'careful 3,farmer 2' && / 0 failed/.test(farm) && /farmer: 10 bites by choice at the first dawn first, then ×1\.00/.test(farm), `models --farmer-games 2: the Farmer plays its own count, ten bites leave ×1, nothing fails (${fh})`);
    let badF = 0;
    try { execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'farmer', '--games', '1', '--farmer-games', 'abc'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { badF = e.status; }
    assert(badF === 2, `models --farmer-games abc exits 2 (${badF})`);
    // v0.11.142 (owner pick CV1): the Cultivator in the models step (500 games, 50 quick), its spare-time rule, the cultivation line
    assert(/the Cultivator 200/.test(mj?.name ?? '') && /the Cultivator 50/.test(mq?.name ?? ''), `the models step plays the Cultivator: 200 games (50 quick; v0.11.254 P24-A, CM) (${mj?.name}; ${mq?.name})`);
    {
        const card = (id, kind, label = id) => ({ id, kind, label, status: 'open' });
        const at = (hh, qi = 20, sat = 50, fed = 80) => ({ minutes: 2 * 1440 + hh * 60, james: { qi, saturation: sat, satiety: fed } });
        const all = [card('w', 'work', 'Forage'), card('sit', 'sit', 'Cultivate: one sit'), card('m', 'mer'), card('q', 'qi')];
        const p = (g, cards = all, mem = {}) => sparePlan(g, cards, mem, 'hub@3')?.join() ?? 'story';
        assert(p(at(SPARE_FROM)) === 'sit' && p(at(SPARE_UNTIL - 1)) === 'sit' && p(at(SPARE_UNTIL)) === 'story' && p(at(SPARE_FROM - 1)) === 'story' && p(at(23)) === 'story',
            `CV1: spare time is ${SPARE_FROM}:00–${SPARE_UNTIL - 1}:59 (${[SPARE_FROM - 1, SPARE_FROM, SPARE_UNTIL - 1, SPARE_UNTIL, 23].map((h) => p(at(h))).join(', ')})`);
        assert(p(at(10, 20, 95)) === 'm' && p(at(10, 9)) === 'q' && p(at(10, 20, 50), [card('h', 'chore', 'Cultivate an hour.'), card('q', 'qi')]) === 'h' && p(at(10, 20, 50), [card('q', 'qi')]) === 'q',
            'CV1: a sit first (the screen\'s own Cultivate too), a meridian session at Saturation 95, gather Qi under 10 Qi');
        const mem = {}; const six = Array.from({ length: 7 }, () => p(at(10, 20, 95), [card('q', 'qi')], mem));
        assert(six.slice(0, SPARE_QI_HOURS).every((x) => x === 'q') && six[SPARE_QI_HOURS] === 'story' && p(at(10, 5, 95), [card('q', 'qi')], mem) === 'q' && p(at(10, 20, 95), [card('q', 'qi')], {}) === 'q',
            `CV1: gather Qi ${SPARE_QI_HOURS} h a waking day, more only under 10 Qi (${six.join()})`);
        assert(p(at(10, 5, 50, SPARE_FED_MIN)) === 'story' && p(at(10, 20, 50), [card('w', 'work'), { ...card('sit', 'sit'), status: 'locked' }]) === 'story', 'CV1: no gather Qi at Fed 30 or under; locked and work cards are not spare time');
    }
    let cul = '';
    try { cul = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'completionist,cultivator', '--games', '3', '--off', '0', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { cul = String(e.stdout || e); }
    const ch = [...cul.matchAll(/^\[([^\]]+)\] (\d+) games/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    const cult = (m) => Number(cul.match(new RegExp(`^\\[${m}\\][\\s\\S]*?\\n {2}cultivation(?: \\([^)]*\\))?: ([\\d.]+) h a game on task screens \\(sits [\\d.]+, meridians [\\d.]+, gather Qi [\\d.]+, breakthroughs [\\d.]+\\) · realm at Act 1's end ([\\d.]+|—)`, 'm'))?.[1] ?? NaN);
    const spare = (m) => Number(cul.match(new RegExp(`^\\[${m}\\][\\s\\S]*?· spare-time cards ([\\d.]+) a game`, 'm'))?.[1] ?? NaN);
    assert(ch === 'completionist 3,cultivator 3' && / 0 failed/.test(cul) && cult('cultivator') > 0 && spare('cultivator') > 0 && spare('completionist') === 0, `CV1: a tiny real run: the Cultivator plays, nothing fails, it queues cards in its spare time and the completionist doesn't (${ch}; ${cult('cultivator')} h; spare ${spare('cultivator')} / ${spare('completionist')} a game)`);
    const dgC = modelDigest(cul, 2);
    assert(dgC?.length === 2 && dgC.every((l) => / · realm [\d.]+( · tribute Day [\d.]+, Act 1 ends Day [\d.]+)?$/.test(l)), `CV1: modelDigest shows the realm at Act 1's end (${dgC?.join(' | ') ?? 'null'})`);
    // v0.11.160 (owner pick NX2, CN; RV1): the Sociable takes the talk doors with Ya and Mei Lin, Careful none (no talk line at all);
    // every label it looks for is a door card on a task screen, and every hub card its pattern matches is one of its labels (SX, Opus's M2)
    let soc = '';
    try { soc = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful,sociable', '--games', '3', '--off', '0', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { soc = String(e.stdout || e); }
    const sh2 = [...soc.matchAll(/^\[([^\]]+)\] (\d+) games/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    const block = (m) => soc.split(/\n(?=\[)/).find((b) => b.trim().startsWith(`[${m}]`)) || '';
    const talks = (m) => Number(block(m).match(/\n {2}talk doors: ([\d.]+) a game/)?.[1] ?? NaN);
    assert(sh2 === 'careful 3,sociable 3' && / 0 failed/.test(soc) && talks('sociable') >= 5 && block('careful').length > 0 && !/talk doors:/.test(block('careful')), `CN: a tiny real run: the Sociable plays and takes talk doors, Careful shows no talk line (${sh2}; ${talks('sociable')} a game)`);
    const { SOCIAL, SOCIAL_LABELS } = await import('./lib/social.mjs');
    const { SCENES: SC } = await import('../js/story/prologue.js');
    const { TASK_HUBS: TH } = await import('../js/story/task_hubs.js');
    const hubDoors = []; // every door card on a task screen: [hub, label]
    for (const [hid, cfg] of Object.entries(TH)) for (const c of SC[hid]?.choices || []) if (typeof c.text === 'string' && (cfg.doors || []).includes(c.to)) hubDoors.push([hid, c.text]);
    const stem = (t) => t.replace(/\..*$/s, '');
    const missing = SOCIAL_LABELS.filter((l) => !hubDoors.some(([, t]) => stem(t) === l));
    const extra = hubDoors.filter(([, t]) => SOCIAL.test(t) && !SOCIAL_LABELS.includes(stem(t))).map(([h, t]) => `${h}: ${t}`);
    const everyCard = Object.keys(TH).flatMap((h) => (SC[h]?.choices || []).filter((c) => typeof c.text === 'string' && SOCIAL.test(c.text)).map((c) => `${h}: ${c.text}`));
    assert(SOCIAL_LABELS.length === 7 && !missing.length && !extra.length && everyCard.length === hubDoors.filter(([, t]) => SOCIAL.test(t)).length, `CN + SX: the seven labels are door cards on task screens, and the pattern takes no other card (missing: ${missing.join(', ') || 'none'}; extra: ${[...extra, ...everyCard.filter((x) => !hubDoors.some(([h, t]) => `${h}: ${t}` === x))].join(', ') || 'none'})`);
    assert(SOCIAL.test('Find Mei Lin.') && SOCIAL.test('Find Mei Lin and Ya. They went for water an hour ago.') && !SOCIAL.test('Find Mei Lining') && !SOCIAL.test('Talk to Yan.'), 'SX: each label is matched whole, up to its first full stop');
}

{ // v0.11.163 (owner picks W1 + HN1; tests/lib/forced.mjs): RS, NN and the hungry log line
    const { forcedPick, oldForcedPick, skipNotNow, hungryLine, NOT_NOW, REST_HOUR } = await import('./lib/forced.mjs');
    const L = (label, extra = {}) => ({ label, ...extra });
    const ch = [L('Go for the serpent.', { tag: 'fight' }), L('Darts at the roosting fowl.'), L('Not now.')];
    assert(skipNotNow(ch).map((c) => c.label).join('|') === 'Go for the serpent.|Darts at the roosting fowl.' && skipNotNow([L('Not now.')]).length === 1 && skipNotNow([]).length === 0, 'NN: "Not now." left out while another choice is open, kept when it is the only one');
    const A = { id: 'h:2', kind: 'door', label: 'Hunt.' }, B = { id: 'h:5', kind: 'door', label: 'Talk to Ya.' }, R = { id: 'h:8', kind: 'chore', label: 'Rest an hour.' }, W = { id: 'h:1', kind: 'work', label: 'Forage.' };
    const walked = new Set(), done = new Set();
    const seq = [forcedPick([A, B, R, W], done, walked, 'h@3'), forcedPick([A, B, R, W], done, walked, 'h@3'), forcedPick([A, B, R, W], done, walked, 'h@3'), forcedPick([A, B, R, W], done, walked, 'h@3'), forcedPick([A, B, R, W], done, walked, 'h@4')].map((c) => c.id);
    assert(seq.join() === 'h:2,h:5,h:8,h:8,h:2', `RS: each door once a day, then "Rest an hour.", the doors again the next day (${seq.join()})`);
    assert(forcedPick([A, W], done, new Set(['h:2@h@3']), 'h@3') === A && forcedPick([B, A, W], done, new Set(['h:5@h@3', 'h:2@h@3']), 'h@3') === B && forcedPick([W], new Set(), new Set(), 'h@3') === W && oldForcedPick([W, A], new Set()) === A && oldForcedPick([W], new Set(['h:1'])) === W, 'RS: every door walked and no rest card: the old rule (the first door, else a card not done today, else the first; RV1, Opus\'s M2: the walked keys as forcedPick writes them)');
    { const w2 = new Set(); forcedPick([A, R], done, w2, 'h@3'); assert([...w2].join() === 'h:2@h@3', `RS: the walked key is id@day (${[...w2].join()})`); }
    const { SCENES: SC } = await import('../js/story/prologue.js');
    const labels = (id) => (SC[id]?.choices || []).map((c) => (typeof c.text === 'string' ? c.text : ''));
    const hunts = ['rr_hunt', 'dw_hunt', 'ah_hunt'].filter((id) => labels(id).some((t) => NOT_NOW.test(t)));
    const rests = ['dw_hub', 'ah_hub'].filter((id) => labels(id).some((t) => REST_HOUR.test(t)));
    assert(hunts.length === 3 && rests.length === 2, `RS + NN: the patterns match the game's cards ("Not now." on ${hunts.join(', ')}; "Rest an hour." on ${rests.join(', ')})`);
    const line = hungryLine('careful', { games: 300, hungry: 893, hungryAt: { heart_gate: 145, rt_ford: 59, a: 1, b: 1, c: 1, d: 1 }, hungryFed: { f20: 676, f10: 191, f0: 26 } });
    assert(line === 'careful: under Fed 30 with food, on story screens with no Eat card: 893 times, 3.0 a game (Fed 20–29 / 10–19 / 0–9: 676 / 191 / 26); most at heart_gate 145, rt_ford 59, a 1, b 1, c 1', `HN1: the hungry log line (${line})`);
    { // RV1 (Opus's L6): the hungry counters of two worker processes add up (tests/lib/shard.mjs mergeInto)
        const m = mergeInto(mergeInto({}, { careful: { games: 2, hungry: 3, hungryAt: { heart_gate: 2, rt_ford: 1 }, hungryFed: { f20: 2, f0: 1 } } }), { careful: { games: 1, hungry: 2, hungryAt: { heart_gate: 1, bl_end: 1 }, hungryFed: { f20: 1, f10: 1 } } }).careful;
        assert(hungryLine('careful', m) === 'careful: under Fed 30 with food, on story screens with no Eat card: 5 times, 1.7 a game (Fed 20–29 / 10–19 / 0–9: 3 / 1 / 1); most at heart_gate 3, rt_ford 1, bl_end 1', `HN1: merged across workers (${hungryLine('careful', m)})`);
    }
    const src = readFileSync(path.join(ROOT, 'tests/models.test.mjs'), 'utf8');
    assert(!/notes\.push\(`\$\{m\}: under Fed/.test(src) && /hungryLines\.push\(hungryLine\(/.test(src) && /careLike\(model\) \? forcedPick\(/.test(src) && /model !== 'random'\) choices = skipNotNow/.test(src), 'HN1 + RS + NN: models.test.mjs prints the hungry line, not a NOTE; RS for Careful and the Sociable; NN for every model but Random');
}

{ // v0.11.163 (owner pick F1): a browser part runs once more after a failure; a pass on the retry counts, with a FLAKE line the report shows
    const { retryOnce } = await import('../tools/lib/jobs.mjs');
    const seq = (...rs) => { let i = 0; const calls = []; return { go: async () => { calls.push(i); return rs[i++]; }, calls }; };
    const ok = seq({ code: 0, out: 'all good' }); const r0 = await retryOnce(ok.go);
    assert(r0.code === 0 && r0.out === 'all good' && ok.calls.length === 1, 'F1: a pass runs once, unchanged');
    assert(/stopping = true;/.test(readFileSync(path.join(ROOT, 'tools/lib/jobs.mjs'), 'utf8').split('export function killAll')[1] || ''), 'F1 (RV1, M1): killAll marks the check as stopping');
    const fl = seq({ code: 1, out: '  NOTE  a note of the first try\nVN: no notice' }, { code: 0, out: 'passed' }); const r1 = await retryOnce(fl.go, () => false);
    assert(r1.code === 0 && r1.flake === true && fl.calls.length === 2 && flagLines(r1.out).join('|') === '  FLAKE  failed once, passed on the retry (first try: VN: no notice)' && /VN: no notice[\s\S]*passed/.test(r1.out), `F1: a fail then a pass: exit 0, the FLAKE line shown by the report, both outputs kept (${flagLines(r1.out).join(' | ')})`);
    const bad = seq({ code: 1, out: 'first' }, { code: 2, out: 'second' }); const r2 = await retryOnce(bad.go, () => false);
    assert(r2.code === 2 && bad.calls.length === 2 && /second[\s\S]*failed twice; the first try ended: first/.test(r2.out), 'F1: two failures fail, with both endings');
    const killed = seq({ code: 1, out: 'killed' }, { code: 0, out: 'passed' }); const r3 = await retryOnce(killed.go, () => true);
    assert(r3.code === 1 && killed.calls.length === 1, 'F1 (RV1, Opus\'s M1): no retry once the check is stopping (a job killed by another failure is not a flake)');
    const ck = readFileSync(path.join(ROOT, 'tools/check.mjs'), 'utf8');
    assert(/times\[j\.key\] = r\.flake && was != null \? was :/.test(ck) && /!r\.flake && was/.test(ck), 'F1 (RV1, Opus\'s L3): a flaked step keeps its stored time and warns of no slowdown');
    assert((ck.match(/key: 'browser[1-4]', fn: browserPart\('[1-4]'\)/g) || []).length === 4 && !/tools\/browser\.py', '--part', '[1-4]'\]\] \}/.test(ck), 'F1: all four browser parts run through the retry');
}

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
// v0.11.39 (Z2-b): tools/arthash.mjs on a made-up folder: written, checked, a changed file and a missing or extra entry caught
{
    const d = mkdtempSync(path.join(tmpdir(), 'arthash-'));
    for (const sub of ['art/pic', 'art/bg', 'icons']) mkdirSync(path.join(d, sub), { recursive: true });
    writeFileSync(path.join(d, 'art/pic/a.webp'), 'AAA'); writeFileSync(path.join(d, 'art/bg/b.jpg'), 'BBB'); writeFileSync(path.join(d, 'icons/c.svg'), 'CCC');
    writeFileSync(path.join(d, 'art/bg/CREDITS.md'), 'not art');
    assert(artFiles(d).join(' ') === 'art/bg/b.jpg art/pic/a.webp icons/c.svg', `arthash: the art files, sorted, no CREDITS.md (${artFiles(d).join(' ')})`);
    const sw = writeArt("const X = 1;\nconst ART = {\n};\nconst Y = 2;\n", d);
    assert(sw.startsWith('const X = 1;') && sw.endsWith('const Y = 2;\n') && Object.keys(readArt(sw)).length === 3, 'arthash: writeArt fills only the ART table');
    assert(checkArt(sw, d).length === 0, 'arthash: a fresh table checks clean');
    assert(/^[0-9a-f]{10}$/.test(readArt(sw)['art/pic/a.webp']) && readArt(sw)['art/pic/a.webp'] === fingerprint(path.join(d, 'art/pic/a.webp')), 'arthash: 10 hex digits of the SHA-256');
    writeFileSync(path.join(d, 'art/pic/a.webp'), 'AAB');
    assert(checkArt(sw, d).some((f) => /a\.webp changed/.test(f)), 'arthash: a replaced file with the same name is caught (stale fingerprint)');
    writeFileSync(path.join(d, 'art/pic/new.webp'), 'N');
    assert(checkArt(sw, d).some((f) => /missing art\/pic\/new\.webp/.test(f)), 'arthash: a new picture not in ART is caught');
    rmSync(path.join(d, 'icons/c.svg'));
    assert(checkArt(sw, d).some((f) => /lists icons\/c\.svg/.test(f)), 'arthash: an ART entry with no file is caught');
    assert(checkArt('const ART_X = 1;', d)[0] === 'sw.js: no ART table', 'arthash: no table reported');
    assert(checkArt(writeArt(sw, d), d).length === 0, 'arthash: rewriting fixes all three');
    rmSync(d, { recursive: true, force: true });
    const real = readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    assert(checkArt(real, ROOT).length === 0 && Object.keys(readArt(real)).length === artFiles(ROOT).length, `arthash: the repo's sw.js is current (${artFiles(ROOT).length} art files)`);
    assert(!/'art\/|'icons\//.test((real.match(/const FILES = \[([\s\S]*?)\];/) || ['', ''])[1]), 'arthash: no picture, background or icon left in FILES');
    const artCache = (real.match(/const ART_CACHE = '([^']+)'/) || [])[1];
    assert(artCache && !/^bone-ash-/.test(artCache), `arthash: sw.js's art cache name (${artCache}) does not start with 'bone-ash-' (main.js reads the version from that prefix)`);
    assert(artFiles(ROOT).every((f) => ART_RE.test(f)) && ART_RE.test('art/bg/x.webp') && ART_RE.test('art/pic/sub/y.webp') && !ART_RE.test('art/bg/CREDITS.md'), 'arthash: one rule for art files (ART_RE), any depth under art/');
    assert(ART_RE.test('css/fonts/Literata.woff') && artFiles(ROOT).filter((f) => f.startsWith('css/fonts/')).length === 4 && !ART_RE.test('css/fonts/OFL-Literata.txt') && !ART_RE.test('css/style.css'), 'arthash: v0.11.149 (FN1): the four fonts in the art cache, not their licence texts or the stylesheet');
}

// v0.11.62: tools/art/patch.py (the second round of small fixes) on a made-up 60x40 picture: a layer pastes only inside its mask,
// a copy moves the block it names, a disc paints a white moon, a line draws a stick, a shutter darkens a box with boards, a tail turns
// a black line white with a black rim; a tail seed off the tail, a copy, a disc, a line or a shutter outside the picture each fail
{
    const py = String.raw`
import json, subprocess, sys, tempfile, pathlib, shutil
import numpy as np
from PIL import Image
d = pathlib.Path(tempfile.mkdtemp())
try:
    src = np.full((40, 60, 3), 128, 'uint8'); src[20:24, 30:50] = 0      # a grey picture with a black bar (the "tail")
    src[2:6, 2:6] = 255                                                    # a white square to copy
    Image.fromarray(src).save(d / 's.png')
    lay = np.zeros((40, 60, 3), 'uint8'); Image.fromarray(lay).save(d / 'L_00001_.png')
    m = np.zeros((40, 60), 'uint8'); m[30:36, 2:10] = 255; Image.fromarray(m).convert('RGB').save(d / 'M.png')
    spec = {"layers": [{"file": "L_00001_", "mask": "M"}], "copies": [{"from": [2, 2], "to": [10, 2, 14, 6], "feather": 0}],
            "discs": [{"center": [50, 8], "r": 4, "fill": 250, "outline": 120, "width": 1}], "lines": [{"from": [14, 12], "to": [14, 18], "width": 3, "fill": 85, "outline": 20}],
            "shutters": [{"box": [20, 2, 28, 10]}], "figures": [{"poly": [[40, 30], [50, 30], [50, 38], [40, 38]], "fill": 210, "outline": 20, "width": 1}],
            "tails": [{"limits": [[[28, 18], [52, 18], [52, 26], [28, 26]]], "seeds": [[40, 22]], "thr": 40, "grow": 2, "rim": 2}]}
    def run(sp, name):
        json.dump(sp, open(d / f'{name}.json', 'w'))
        return subprocess.run([sys.executable, '-I', sys.argv[1], str(d / 's.png'), str(d / f'{name}.json'), str(d / f'{name}.png'), '--dir', str(d)], capture_output=True, text=True).returncode
    res = {"rc": run(spec, 'p')}
    o = np.asarray(Image.open(d / 'p.png').convert('L')).astype(int)
    res.update({"layer_in": int(o[32, 5]), "layer_out": int(o[32, 20]), "copy": int(o[4, 12]), "moon": int(o[8, 50]), "line": int(o[15, 14]), "line_off": int(o[15, 18]),
                "shutter": int(o[6, 23]), "boards": int(o[6, 20]) != int(o[6, 23]), "tail_core": int(o[22, 40]), "tail_rim": int(o[18, 40]), "far": int(o[38, 58]), "figure": int(o[34, 45]), "figure_edge": int(o[29, 45])})
    bad = {"bad_seed": dict(spec, tails=[{"limits": spec["tails"][0]["limits"], "seeds": [[29, 19]], "thr": 40}]),
           "bad_copy": dict(spec, copies=[{"from": [58, 2], "to": [10, 2, 14, 6]}]), "bad_disc": dict(spec, discs=[{"center": [58, 8], "r": 4}]),
           "bad_line": dict(spec, lines=[{"from": [14, 12], "to": [70, 18]}]), "bad_shutter": dict(spec, shutters=[{"box": [20, 2, 70, 10]}]),
           "bad_figure": dict(spec, figures=[{"poly": [[40, 30], [70, 30], [70, 38]]}])}
    for k, v in bad.items(): res[k] = run(v, k)
finally:
    shutil.rmtree(d, ignore_errors=True)
print(json.dumps(res))`;
    let r = {};
    try { r = JSON.parse(execFileSync('python3', ['-I', '-c', py, path.join(ROOT, 'tools/art/patch.py')], { encoding: 'utf8' }).trim()); } catch (e) { assert(false, `patch.py: the made-up run crashed (${String(e.message).slice(0, 200)})`); }
    assert(r.rc === 0, `patch.py: runs on a good spec (${r.rc})`);
    assert(r.layer_in < 20 && r.layer_out === 128, `patch.py: a layer pastes inside its mask only (${r.layer_in}, ${r.layer_out})`);
    assert(r.copy === 255, `patch.py: a copy moves the block it names (${r.copy})`);
    assert(r.moon >= 240, `patch.py: a disc paints a white moon (${r.moon})`);
    assert(r.line < 100 && r.line_off === 128, `patch.py: a line draws a dark stick and nothing beside it (${r.line}, ${r.line_off})`);
    assert(r.shutter < 100 && r.boards, `patch.py: a shutter darkens its box, with board lines (${r.shutter})`);
    assert(r.tail_core >= 230 && r.tail_rim < 90, `patch.py: a black tail turns white with a black rim (${r.tail_core}, ${r.tail_rim})`);
    assert(r.far === 128, `patch.py: pixels outside every step are untouched (${r.far})`);
    assert(Math.abs(r.figure - 210) <= 2 && r.figure_edge < 120, `patch.py: a figure paints its flat shape with a dark outline (${r.figure}, ${r.figure_edge})`);
    for (const k of ['bad_seed', 'bad_copy', 'bad_disc', 'bad_line', 'bad_shutter', 'bad_figure']) assert(r[k] !== undefined && r[k] !== 0, `patch.py: ${k.replace('bad_', 'a bad ')} fails the run (${r[k]})`);
}
// v0.11.63: tools/art/masks.py draws every mask of recipes.json, the stored 1-bit outlines (tools/art/masks/) included, at its recorded size
{
    const out = mkdtempSync(path.join(tmpdir(), 'boneash-masks-'));
    let ok = true;
    try { execFileSync('python3', ['-I', path.join(ROOT, 'tools/art/masks.py'), out], { encoding: 'utf8' }); } catch (e) { ok = false; }
    assert(ok, 'masks.py: runs on the real recipes');
    if (ok) {
        const R = JSON.parse(readFileSync(path.join(ROOT, 'tools/art/recipes.json'), 'utf8'));
        const py = String.raw`
import json, sys, pathlib
from PIL import Image
R = json.load(open(sys.argv[1])); d = pathlib.Path(sys.argv[2]); bad = []
for n, m in R['masks'].items():
    p = d / f'{n}.png'
    if not p.exists() or list(Image.open(p).size) != m['size']: bad.append(n)
    elif 'bitmap' in m and Image.open(p).convert('L').getextrema()[1] < 200: bad.append(n)
print(json.dumps({"n": len(R['masks']), "bad": bad, "bitmaps": sum('bitmap' in m for m in R['masks'].values())}))`;
        const r = JSON.parse(execFileSync('python3', ['-I', '-c', py, path.join(ROOT, 'tools/art/recipes.json'), out], { encoding: 'utf8' }).trim());
        assert(r.bad.length === 0 && r.bitmaps >= 30, `masks.py: all ${r.n} masks drawn at their size, the ${r.bitmaps} stored outlines with white in them (bad: ${r.bad.slice(0, 5)})`);
    }
    rmSync(out, { recursive: true, force: true });
}
// v0.11.200 (owner pick D1, S6): the handover's "Other docs" names the newest history part (it said history-26.md for two versions after
// history-27.md was started), and its "now `project/history-N.md`" line in the size paragraph too
{
    const ho = readFileSync(path.join(ROOT, 'project/handover.md'), 'utf8');
    const newest = newestHistory(readdirSync(path.join(ROOT, 'project')));
    const n = (newest.match(/\d+/) || ['1'])[0];
    const other = (ho.match(/\*\*Other docs:\*\*[^\n]*/) || [''])[0];
    assert(other.includes(`**\`project/${newest}\`** … **\`project/history.md\`**`) && other.includes(`part ${n} is the newest`), `S6: the handover's "Other docs" names ${newest} as the newest history part`);
    assert(ho.includes(`(now \`project/${newest}\``), `S6: the handover's size paragraph names ${newest} as the part the old notes move to`);
}
// v0.11.73 (group h, H1): the docs' own rules in tools/lib/docs.mjs (the handover's size, the newest history part, the roadmap's version)
{
    const ok = { version: '1.2.3', handoverBytes: 34999, histories: { 'history.md': 50000, 'history-2.md': 50000, 'history-10.md': HISTORY_MAX - 1000, 'history-9.md': 46000 }, roadmap: '# Roadmap\n\nLast updated: 2026-11-08 (v1.2.3, docs): x\n' };
    assert(newestHistory(Object.keys(ok.histories)) === 'history-10.md' && newestHistory(['history.md']) === 'history.md' && newestHistory([]) === null, 'docs: the newest history part is the highest number (10 after 9, history.md is part 1)');
    const r = docFindings(ok);
    assert(r.fail.length === 0 && r.notes.length === 0, `docs: a handover under ${HANDOVER_MAX} bytes, the newest part under ${HISTORY_MAX} (older parts over it don't count), the roadmap on the version: nothing (${r.fail.concat(r.notes).join('; ')})`);
    const big = docFindings({ ...ok, handoverBytes: HANDOVER_MAX });
    assert(big.fail.length === 1 && /handover\.md is 35000 bytes/.test(big.fail[0]), `docs: a handover of ${HANDOVER_MAX} bytes fails (${big.fail.join('; ')})`);
    const hist = docFindings({ ...ok, histories: { ...ok.histories, 'history-10.md': HISTORY_MAX + 1 } });
    assert(hist.fail.length === 0 && hist.notes.length === 1 && hist.notes[0].includes(`history-10.md is ${HISTORY_MAX + 1} bytes`), `docs: the newest part past ${HISTORY_MAX} bytes is a note, not a failure (${hist.notes.join('; ')})`);
    const old = docFindings({ ...ok, roadmap: 'Last updated: 2026-11-08 (v1.2.2, docs)' });
    const none = docFindings({ ...ok, roadmap: '# Roadmap\n' });
    assert(/says 1\.2\.2, sw\.js says 1\.2\.3/.test(old.fail[0] ?? '') && /says nothing/.test(none.fail[0] ?? ''), `docs: the roadmap on an older version, or with no "Last updated" line, fails (${old.fail[0]}; ${none.fail[0]})`);
    // v0.11.78 (S1): the research parts and the docs too big for the project tool (notes, never failures)
    assert(newestResearch(['research.md', 'research-2.md', 'research-10.md', 'roadmap.md']) === 'research-10.md' && newestResearch(['research.md']) === 'research.md' && newestResearch([]) === null, 'docs: the newest research part is the highest number (research.md is part 1)');
    const rs = docFindings({ ...ok, researches: { 'research.md': RESEARCH_MAX + 5000, 'research-2.md': RESEARCH_MAX + 1 } });
    assert(rs.fail.length === 0 && rs.notes.length === 1 && /research-2\.md is 45001 bytes/.test(rs.notes[0]), `docs: only the newest research part past ${RESEARCH_MAX} bytes is a note (${rs.notes.join('; ')})`);
    const tool = docFindings({ ...ok, docs: { 'reference.md': DOC_TOOL_MAX, 'lore.md': DOC_TOOL_MAX + 1 } });
    assert(tool.fail.length === 0 && tool.notes.length === 1 && /lore\.md is 60001 bytes.*trimming pass/.test(tool.notes[0]), `docs: a doc past ${DOC_TOOL_MAX} bytes is a note naming the trim-then-split rule (${tool.notes.join('; ')})`);
    // v0.11.178 (owner pick U1, MD): the docs every push changes past MIRROR_MAX bytes are a note (never a failure); other docs are not held to it
    const mir = docFindings({ ...ok, docs: { 'roadmap.md': MIRROR_MAX, 'changelog.md': MIRROR_MAX + 1, 'restore-points.md': MIRROR_MAX + 2, 'reference.md': MIRROR_MAX + 5000 } });
    assert(HISTORY_MAX === 20000 && MIRROR_MAX === 20000 && PER_PUSH.join() === 'roadmap.md,changelog.md,restore-points.md' && mir.fail.length === 0 && mir.notes.length === 2 && mir.notes.every((n) => /past 20000: every push uploads it/.test(n)) && /changelog\.md is 20001/.test(mir.notes[0]), `MD: changelog and restore-points past ${MIRROR_MAX} bytes are notes, roadmap at the cap and reference.md are not (${mir.notes.join('; ')})`);
    let code = 0, out = '';
    try { out = execFileSync(process.execPath, ['tools/consistency.mjs'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { code = e.status ?? 1; out = String(e.stdout || e); }
    assert(code === 0 && /handover \d+ bytes/.test(out), `docs: tools/consistency.mjs passes on the real repo, with the handover's size (exit ${code}: ${out.trim().split('\n').pop()})`);
}
// v0.11.88 (owner pick A: T1 + D2 + S1 + X): the roadmap's open work in two parts, sections 0–2 in roadmap.md (with the
// "Last updated" line) and 3–6 with Decided in roadmap-2.md, each pointing at the other; the done lines in roadmap-done.md
// (closed) and roadmap-done-2.md; the tests that read the roadmap read every open part
const ROADMAP_PARTS = ['roadmap.md', 'roadmap-2.md', 'roadmap-act2.md', 'roadmap-e.md', 'roadmap-retune.md', 'roadmap-time.md']; // v0.11.201 (owner pick O1): the time scale's own part // v0.11.171 (owner pick RA1): Act 2's own part; v0.11.178 (U1, MD): group e's and section 2's older open items
{
    const [r1, r2, ra, re, rr] = ROADMAP_PARTS.map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8'));
    const secs = (t) => [...t.matchAll(/^## (\d)\. /gm)].map((m) => Number(m[1]));
    assert(secs(r1).join() === '0,1,2' && secs(r2).join() === '3,4,5,6', `roadmap: sections 0–2 in roadmap.md, 3–6 in roadmap-2.md (${secs(r1).join()} / ${secs(r2).join()})`);
    assert(/^Last updated: /m.test(r1) && !/^Last updated: /m.test(r2) && /^## Decided$/m.test(r2) && !/^## Decided$/m.test(r1), 'roadmap: the "Last updated" line in roadmap.md, Decided in roadmap-2.md');
    assert(r1.includes('`roadmap-2.md`') && r2.includes('`roadmap.md`'), 'roadmap: each part names the other');
    const d1 = readFileSync(path.join(ROOT, 'project/roadmap-done.md'), 'utf8'), d2 = readFileSync(path.join(ROOT, 'project/roadmap-done-2.md'), 'utf8');
    assert(d1.includes('`roadmap-done-2.md`') && /^## Moved in v0\.11\.88 \(word for word\)$/m.test(d2) && d2.indexOf('## Moved in v0.11.88') < d2.indexOf('### The old "Last updated" line'), 'roadmap: roadmap-done.md points at roadmap-done-2.md, which starts with v0.11.88');
    for (const t of ['**What the sitting loop\'s fix left', '**The game on a PC, a wide layout', '**Act 2** (open).']) assert((r1 + r2 + ra + re + rr).includes(t), `roadmap: the open line "${t.replace(/\*/g, '')}" is still in an open part`);
    // v0.11.151 (owner pick WD1, RF): group d closed: its section and section 0's "Next: group d" moved word for word to
    // roadmap-done-3.md (not left behind); its open parts re-filed: section 2 (the rot ape, DA2's three, the lab's table),
    // roadmap-2.md section 4 (stances, clean or barbed, #66) and section 5 (the knitting bone and the crushing mass, Act 2),
    // the weapon-to-Convergence note in reference.md
    {
        const d3 = readFileSync(path.join(ROOT, 'project/roadmap-done-3.md'), 'utf8'), ref = readFileSync(path.join(ROOT, 'project/reference.md'), 'utf8');
        const sec = (t, a, b) => t.slice(t.indexOf(a), b ? t.indexOf(b) : undefined);
        for (const t of ['**The fight lab, built:**', '**Fight ideas from the games', '**Fight ideas from the cultivation games', '**Bone weapons by Convergence', '**Mechanics, flight', '**When a weapon moves to Convergence:**', '- **Next: group d (combat)**']) assert(d3.includes(t) && !(r1 + r2).includes(t), `WD1 (RF): "${t.replace(/\*/g, '')}" moved to roadmap-done-3.md`);
        assert(/^## Moved in v0\.11\.151 /m.test(d3) && d3.indexOf('## Moved in v0.11.151') < d3.indexOf('## Moved in v0.11.150'), 'WD1 (RF): roadmap-done-3.md has v0.11.151\'s move, newest first');
        assert(/### d\. Combat\n\n\*\(v0\.11\.151, owner pick WD1: closed/.test(r1) && r1.includes('**Group d (combat): closed.**'), 'WD1 (RF): group d\'s heading says closed, section 0 says where its parts went');
        assert(sec(r1, '## 2. ', null).includes('**Group d\'s fights for the retune') && sec(r2, '## 4. ', '## 5. ').includes('**Fight ideas that wait for Insights and crafting') && ra.includes('**For Act 2, the knitting bone (T6) and the crushing mass (T9)**') /* v0.11.171 (RA1): moved to roadmap-act2.md */, 'WD1 (RF): the open parts in section 2, section 4 and section 5');
        assert(/\*\*When a weapon moves to Convergence\*\* \(moved here from group d in v0\.11\.151/.test(ref), 'WD1 (RF): the weapon-to-Convergence note in reference.md');
    }
    for (const t of ['**Round 1 done (owner picks I1 + L1 + E1', "**The owner's calls for the next pushes", '**Mechanics and story, unarmed fights']) assert(d2.includes(t) && !(r1 + r2).includes(t), `roadmap: the done line "${t.replace(/\*/g, '')}" moved to roadmap-done-2.md`);
}
// v0.11.178 (owner pick U1, MD): group e's older open items and section 2's older ones moved word for word (one block each, as they
// stood in roadmap.md) to roadmap-e.md and roadmap-retune.md, a pointer left in each place; roadmap.md under MIRROR_MAX
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const r1 = rd('roadmap.md'), body = (t) => t.slice(t.indexOf('\n- ') + 1).trimEnd();
    const { createHash } = await import('node:crypto');
    const h = (t) => createHash('sha256').update(t).digest('hex');
    // v0.11.196 (owner picks M1, H1): later additions to a moved line are tails marked " *(v0.11.19x"; cut before hashing, so the moved block stays pinned
    // v0.11.200 (D1): and the tails of v0.11.2xx (S5's on the text tools' line)
    const tails = (t) => (t.match(/ \*\(v0\.11\.(19\d|2\d\d)/g) || []).length, cut = (t) => t.replace(/ \*\(v0\.11\.(19\d|2\d\d)[^\n]*/g, '');
    const beRaw = body(rd('roadmap-e.md').split('\n\n## Placed here in v0.11.240')[0]); // v0.11.240 (RA1): the items placed from the handover under their own heading, after the pinned block
    assert(tails(beRaw) === 25 /* v0.11.258 (PL-A): −16, the done lines' tails moved word for word with them to roadmap-done-5.md */ /* v0.11.253 (RP-A): +2 (PL-GL on the story text pass, PL-YM on repeats) */ /* v0.11.248 (P18-A): +1 (repeats) */ /* v0.11.247 (P17-A): +2 (repeats, small fixes) */ /* v0.11.246 (P16-A): +4 (flight, repeats, the night's rules, small fixes); v0.11.245 (SP1 EC): −2, two tailed lines moved word for word to roadmap-2.md; v0.11.243 (P15-B): +1; v0.11.242 (P14-A): +1; v0.11.241 (P13-A): +1; v0.11.240 (RA1): +2 (the placed items on "No repeated texts", the tic on "Small text fixes"); v0.11.239 (P12-A): +1; v0.11.238 (P11-A): +1; v0.11.237 (P10-A): +1; v0.11.236 (P9-A): +1; v0.11.235 (P8-A): +1; v0.11.234 (P7-A): +1 */, `MD (H1): roadmap-e.md has the 3 marked tails of v0.11.196, v0.11.200's and v0.11.202's 5, v0.11.218's (the owner's two notes on repeated texts and read cards), v0.11.224's (V3b), v0.11.228's 3 (DR: the rule for repeated texts), v0.11.229's 2 (E2-2: the measures, NR), v0.11.230's 2 (P3-2: FT, SF), v0.11.231's 3 (P4-2: the camp and the small fixes, ST2, SN), v0.11.232's (P5-B: V3b, CW), v0.11.233's (P6-A: TK, CWx) (${tails(beRaw)})`);
    const rrRaw = rd('roadmap-retune.md'), be = cut(beRaw), br = body(rrRaw.split('\n\n## Moved here from `roadmap-time.md` in v0.11.220')[0]); // v0.11.220 (OR1): the block moved in v0.11.178 pinned; the items moved from roadmap-time.md after it
    assert(h(be) === '3940b72e7ef1638d1349c9f33ede1b0bf413966354fef2dcba98e5889b5c4c2e' /* v0.11.258 (PL-A): the done, closed and superseded lines moved word for word to roadmap-done-5.md, the flight and repeats lines kept as they stood (checked against v0.11.257's block) */ /* v0.11.245 (SP1 EC): eleven lines moved word for word to roadmap-2.md sections 4 and 5; the rest in its order (checked against v0.11.244's block) */ && h(br) === '48076f4fa63681f75ceb035b2cc348b0652ab31e761b8383aa636aaeb5efbe9b', `MD: roadmap-e.md and roadmap-retune.md hold the moved blocks exactly (sha256 ${h(be).slice(0, 12)}…, ${h(br).slice(0, 12)}…)`);
    assert(!r1.includes(be.split('\n')[0]) && !r1.includes(br.split('\n')[0]) && r1.includes("**Group e's older open items**") && r1.includes('`roadmap-e.md`') && r1.includes("**Section 2's older open items**") && r1.includes('`roadmap-retune.md`'), 'MD: not left behind in roadmap.md, a pointer in each place');
    const e = r1.indexOf('### e. '), f = r1.indexOf('### f. Romance'), s2 = r1.indexOf('## 2. The balance retune');
    assert(r1.slice(e, f).includes('`roadmap-e.md`') && r1.slice(s2).includes('`roadmap-retune.md`') && Buffer.byteLength(r1) <= MIRROR_MAX, `MD: the pointers in group e and section 2; roadmap.md ${Buffer.byteLength(r1)} bytes, under ${MIRROR_MAX}`);
}
// v0.11.220 (owner pick OR1, 2026-11-18 11:34): roadmap-time.md's open items sorted into their parts word for word (TS5's to group f,
// TS7's and the retune's to roadmap-retune.md, two UI items to roadmap-2.md section 4, the decided and done ones to roadmap-done-4.md),
// t's queue at the top of its open part; the owner's 11:34: the realm kept (KA) moved up after t, before the rest of e
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const rt = rd('roadmap-time.md'), r1 = rd('roadmap.md'), r2 = rd('roadmap-2.md'), rr = rd('roadmap-retune.md'), d4 = rd('roadmap-done-4.md'), ra = rd('roadmap-act2.md');
    const d5 = rd('roadmap-done-5.md'); // v0.11.258 (PL-A): group f's lines moved word for word to roadmap-done-5.md
    const moved = [[d5, "the evenings' real choices still a tap every night"], [d5, "a week's repeated relationship gains (the village's suppers"], [rr, "**New in v0.11.207 (open, options later; for TS7, the retune):**"], [rr, "the bots' cultivation line counts only their own cards"], [rr, 'die on Day 3 in 12.5% of games'], [rr, "L4, the Fallout's farewell opens after midnight"], [rr, "**v0.11.214's review notes (L6, for the retune)"], [rr, "Sociable bots' Mei Lin last nights 2 → 0"], [r2, "the review's L4 (the forecast's redraw 41 → 71 ms"], [r2, 'L7 (on a PC the tooltip sits bottom left'], [d4, '- ~~Every day ×7, or only the stays ×7'], [d4, "the main menu's scroll carries into the game"], [d4, "the owner's 12:42 item (done in v0.11.211, above)"]];
    for (const [doc, t] of moved) assert(doc.includes(t) && !rt.includes(t), `OR1: "${t.slice(0, 50)}" moved out of roadmap-time.md to its part`);
    assert(rt.includes("## t's queue (v0.11.220, owner pick OR1") && /1\. \*\*WF2\*\*[\s\S]*2\. \*\*TS9, the journey to the Heart Tree\*\*[\s\S]*3\. \*\*TS6, the texts\*\*[\s\S]*4\. \*\*The plan's leftovers\*\*[\s\S]*5\. \*\*The flip\*\*/.test(rt) && rt.includes('The Realms preserved for future coils if the game is won."') && d4.includes('the journey to the Heart Tree (the Blackroot, story days 11–15)'), "OR1: t's queue in order, the owner's 11:34 words, TS9's line kept (done: in roadmap-done-4.md since v0.11.223, RO1)");
    assert(/\*\*1\. t, the time scale\*\* \([^)]*\) → \*\*2\. KA, the realm kept for a won game\*\* \(\*\*done in v0\.11\.227\*\*[^)]*`roadmap-done-4\.md`[^)]*\) → \*\*3\. the rest of e\*\*/.test(d5) /* v0.11.258 (PL-A): the order line as it stood moved word for word to roadmap-done-5.md; the new one marks steps 1–4 done */ && r1.includes('~~**2. KA, the realm kept for a won game**~~ (**done in v0.11.227**) → ~~**3. the rest of e**~~ (**done in v0.11.248**) → ~~**4. f, romance**~~ (**done in v0.11.250**) → **5. section 2, the retune**') && d4.includes('## Moved from `roadmap-act2.md` in v0.11.227') && d4.includes('*(v0.11.220: moved up by the owner 2026-11-18 11:34, after t and before the rest of e') && !ra.includes('*(v0.11.220: moved up by the owner 2026-11-18 11:34') && ra.includes('**KA, the realm kept for a won game: done in v0.11.227**'), 'OR1 (the owner 11:34): KA second in the order, after t, before the rest of e (v0.11.227: done, its line moved word for word to roadmap-done-4.md)');
    assert(rr.indexOf('## Moved here from `roadmap-time.md` in v0.11.220') > 0 && Buffer.byteLength(rt) <= MIRROR_MAX && Buffer.byteLength(r1) <= MIRROR_MAX && d4.includes("- *(new in v0.11.83; done in v0.11.122, owner picks LG1, RL1:") && !r1.includes('- *(new in v0.11.83; done in v0.11.122'), 'OR1: the retune part\'s new block, both parts under the cap, group f\'s done item in roadmap-done-4.md');
}
// v0.11.223 (owner pick RO1): roadmap-time.md's "Open, options later" lines sorted word for word: the texts under the queue's item 3,
// the plan's under item 4, the Heart under the open section, two to roadmap-retune.md, the done parts and v0.11.214's L6 to roadmap-done-4.md
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const rt = rd('roadmap-time.md'), d4 = rd('roadmap-done-4.md'), rr = rd('roadmap-retune.md'), ho = rd('handover.md');
    const q3 = rt.slice(rt.indexOf('3. **TS6, the texts**'), rt.indexOf("4. **The plan's leftovers**")), q4 = rt.slice(rt.indexOf("4. **The plan's leftovers**"), rt.indexOf('5. **The flip**')), op = rt.slice(rt.indexOf('## Open, options later'));
    const q4d = d4.slice(d4.indexOf('## Moved from `roadmap-time.md` in v0.11.225')); // v0.11.225 (LO2): item 4 done; moved word for word to roadmap-done-4.md
    const q3d = d4.slice(d4.indexOf('**TS6 done**')); // v0.11.224 (TX2): TS6 done; its item moved word for word to roadmap-done-4.md
    for (const t of ['the long calendar\'s texts (TS6).', 'L6, the hint\'s "Day 43"', 'the owner 15:44, word for word:', '**For TS6 (TL, picked):**', '**For TS6 (TL and TL+, picked):**']) assert(q3d.includes(t) && !q3.includes(t) && q3.includes('**done in v0.11.224**'), `RO1 (ST); v0.11.224: "${t}" under TS6, now done (roadmap-done-4.md)`);
    for (const t of ['the companions\' daily doors', 'camp chores should be automatable', 'L5, the lost barley wolves', 'a plan with only the doors on reads as empty', 'a deer far hunt', 'the bots still plan each week afresh', 'a spaced card closed leaves the hub screen', 'Plan the week on the Blackroot\'s camps', 'never stop the plan', 'a Coil can stop up to 24 times on meridians']) assert(q4d.includes(t) && !q4.includes(t) && q4.includes('**done in v0.11.225**'), `RO1 (SP); v0.11.225: "${t}" under the plan's leftovers, now done (roadmap-done-4.md)`);
    assert(!/^- \*\*New in v0\.11\./m.test(op) && rr.includes('the Heart (Days 80–100 now) is three weeks') /* v0.11.244 (RO2): HN to the retune */ && rr.includes('every wilds card\'s familiarity rises together') && rr.includes('The long-calendar bot step 58 → 136 s') && !rt.includes('every wilds card\'s familiarity rises together'), 'RO1 (SO, SR): no loose "New in" line; the Heart open; two items in the retune part');
    for (const t of ['**TS9 done** (J2', '**WF2 done** (WB', '**KC1 done** (KA', 'The evening\'s usual way on at the day\'s end is not read-checked']) assert(d4.includes(t) && !rt.includes(t), `RO1 (SD, SX): "${t}" in roadmap-done-4.md only`);
    assert((ho + readFileSync(path.join(ROOT, 'project', 'history-53.md'), 'utf8')).includes("word for word in `history-33.md`; sorted in v0.11.223 (RO1)") /* v0.11.269 (P37-A, SH): the line moved word for word to history-53.md */ && !ho.includes("word for word on `roadmap-time.md`** (affection never stops") && Buffer.byteLength(rt) <= MIRROR_MAX, 'RO1 (HP): the handover\'s pointer fixed; roadmap-time.md under the cap');
}
// v0.11.222 (owner picks J2, RV2): TS9 done in t's queue, its TL list for TS6 and the Heart's note in roadmap-time.md, four done lines
// moved word for word to roadmap-done-4.md (the size rule), the ape's note in roadmap-retune.md, the review's two checklist lines
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const rt = rd('roadmap-time.md'), d4 = rd('roadmap-done-4.md'), rr = rd('roadmap-retune.md'), ck = rd('review-checklist-code.md');
    assert(rt.includes('2. **TS9, the journey to the Heart Tree** (the owner 22:00): **done in v0.11.222**') && rd('roadmap-done-4.md').includes('**For TS6 (TL and TL+, picked):**') /* v0.11.224: TS6 done, its item moved */ && rr.includes('the Heart (Days 80–100 now) is three weeks') /* v0.11.244 (RO2) */, 'TS9: done in the queue, the TL list and the Heart note');
    for (const t of ['- **TS2 + TS3: done in v0.11.204', '- **v0.11.205: Plan the week', '- **S6: done in v0.11.207', '- **TS4: done in v0.11.209']) assert(d4.includes(t) && !rt.includes(t), `TS9 (MD): "${t}" moved word for word to roadmap-done-4.md`);
    assert(Buffer.byteLength(rt) <= MIRROR_MAX && rr.includes('**The rot-ape on a longer road:**') && ck.includes('(v0.11.222 M1)') && ck.includes('(v0.11.222 TG2, TG3)'), 'TS9: roadmap-time.md under the cap, the ape note, the checklist lines');
}
// v0.11.201 (owner pick O1): the time scale in its own part, roadmap-time.md: the owner's 17:54 and 18:04 words word for word, TS1–TS8,
// named in roadmap.md between group e and group f (section 1's "t") and in section 0; the 18:04 words in the handover (rule 6);
// the old section 0 line and group e's closed items moved word for word to roadmap-done-3.md; roadmap.md under MIRROR_MAX
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const rt = rd('roadmap-time.md'), r1 = rd('roadmap.md'), ho = rd('handover.md'), d3 = rd('roadmap-done-3.md'), h28 = rd('history-28.md');
    const w1754 = 'everything is happening too quickly, what is a day now should take a week.', w1804 = 'so meridian opening, meditation, Qi condensation, eating and such things, also cooking, making camp should stay daily tasks';
    assert(rt.includes(w1754) && rt.includes('how much Qi per sitting is condensed."') && rt.includes(w1804) && rt.includes('optimally this should go into the part that\'s finished before Friday afternoon."'), 'O1: roadmap-time.md has both of the owner\'s messages word for word');
    for (const t of ['TS1', 'TS2', 'TS3', 'TS4', 'TS5', 'TS6', 'TS7', 'TS8']) assert(rt.includes(`- **${t}, `), `O1: roadmap-time.md has ${t}`);
    assert(/\*\*The target realm: open, options later\*\*/.test(rt) && /^## Open, options later/m.test(rt) && rt.includes('`fallback/<date>-before-time-scale`'), 'O1: the open questions and the fallback branch named');
    const e = r1.indexOf('### e. '), t = r1.indexOf('### t. The time scale'), f = r1.indexOf('### f. Romance');
    assert(e > 0 && t > e && f > t && r1.slice(t, f).includes('`roadmap-time.md`') && r1.slice(r1.indexOf('## 0. '), r1.indexOf('## 1. ')).includes('`roadmap-time.md`'), 'O1: roadmap.md names roadmap-time.md in section 0 and between groups e and f');
    const h29 = rd('history-29.md'); // v0.11.204 (W1, the 35 KB rule): v0.11.201's entry moved word for word to history-29.md
    assert((ho + h29).includes(w1804) && ho.includes('**`roadmap-time.md`**') && (ho.includes(w1804) || ho.includes('word for word in `history-29.md`')), 'O1 (rule 6): the 18:04 words in the handover or moved word for word to history-29.md, and the new part among its docs');
    assert(d3.includes('- *(v0.11.200, owner D1, F2 and 17:46)* **Bundle D: done in v0.11.200.**') && d3.includes('  - **Closed since:** a success card saying its line twice in a day') && !r1.includes('**Closed since:**') && !r1.includes('**Bundle D: done in v0.11.200.**'), 'O1: section 0\'s old line and group e\'s closed items moved word for word to roadmap-done-3.md');
    assert(h28.includes('- **The time scale (the owner 2026-11-16 17:54, mid-build of v0.11.200, word for word;') && h28.includes('## v0.11.198 — ') && h28.includes('## v0.11.197 — ') && !ho.includes('## v0.11.198 — '), 'O1: the old open items and v0.11.197–198 moved word for word to history-28.md');
    assert(Buffer.byteLength(r1) <= MIRROR_MAX && Buffer.byteLength(rt) <= MIRROR_MAX, `O1: roadmap.md ${Buffer.byteLength(r1)} and roadmap-time.md ${Buffer.byteLength(rt)} bytes, under ${MIRROR_MAX}`);
}
// v0.11.203 (owner picks T1, RV1): the time scale's shape and TS1 + TS8 in roadmap-time.md; the fallback branch listed; the handover's
// moves word for word to history-29.md (the v0.11.200 entry, the open decisions, the usage note); section 0's v0.11.202 line in
// roadmap-done-3.md; the docs gap (group e's lines) marked; the review's new kinds in the checklist
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const rt = rd('roadmap-time.md'), r1 = rd('roadmap.md'), ho = rd('handover.md'), h29 = rd('history-29.md'), d3 = rd('roadmap-done-3.md'), rp = rd('restore-points.md'), ck = rd('review-checklist.md') + rd('review-checklist-code.md'); // v0.11.212 (CK1): the checklist in two parts
    const d4now = readFileSync(path.join(ROOT, 'project', 'roadmap-done-4.md'), 'utf8'); // v0.11.220 (OR1)
    assert(rt.includes('## The shape picked (v0.11.203, owner pick T1, 2026-11-16 19:56)') && rt.includes('- **TS1 + TS8: done in v0.11.203**') && (rt + d4now).includes('**Decided in v0.11.203 (T1): only the stays.**'), 'T1: roadmap-time.md has the shape picked, TS1 + TS8 done and the decided questions (in roadmap-done-4.md since v0.11.220, OR1)');
    assert(rp.includes('| `fallback/2026-11-16-before-time-scale` | 0.11.202 (`20837ea`)'), 'T1 (rule 5, H1): the fallback branch before the time scale listed');
    assert(rp.includes('| `fallback/2026-11-19-before-flip` | 0.11.225 (`432ea55`)') && rt.includes('5. **The flip**: **done in v0.11.226**') && d4now.includes('in v0.11.226 (word for word: t\'s queue item 5'), 'FP1 (rule 5, H1): the fallback branch before the flip listed; t\'s queue item 5 done, its line moved word for word');
    assert(h29.includes('- **v0.11.200: bundle D (D1), the kept realm recorded (KA), the plan for Friday (F2)') && !ho.includes('- **v0.11.200: bundle D (D1), the kept realm recorded (KA)') && h29.includes('- **Serpent (D, owner 09:44, v0.9.9): folded into step 5**') && !ho.includes('- **Serpent (D, owner 09:44, v0.9.9)') && h29.includes('**Usage (the owner 2026-11-14 15:27, word for word):** "one important note, the fable usage is being Burnt through quickly'), 'T1: the handover\'s older entries moved word for word to history-29.md, not left behind');
    { const h30 = rd('history-30.md'); // v0.11.206 (FC1): v0.11.203's pick and note moved word for word to history-30.md (rule 5)
      const h31 = rd('history-31.md'); // v0.11.209 (TF1): v0.11.206's pick and note moved word for word to history-31.md (rule 5)
      const h32 = rd('history-32.md'); // v0.11.212 (CK1): v0.11.209's pick and note moved word for word to history-32.md (rule 5)
      assert(rd('history-50.md').includes('## v0.11.256 — ') && !ho.includes('## v0.11.256 — ') && rd('history-50.md').includes('- **v0.11.256: P26-A') && !ho.includes('- **v0.11.256: P26-A') && rd('history-50.md').includes('- **NEXT PUSH: open, options later.** PL-A done') && !ho.includes('- **NEXT PUSH: open, options later.** PL-A done') /* v0.11.259 (OC-A): v0.11.256's notes, decision and the next-push entry moved to part 50 */ && ho.includes('**`project/history-54.md`** … **`project/history.md`**') /* v0.11.262 (P30-A): part 51, v0.11.259's notes, decision and the next-push entry moved; v0.11.266 (P34-A): part 52 */ && rd('history-52.md').includes('## v0.11.263 — ') && !ho.includes('## v0.11.263 — ') && rd('history-52.md').includes('- **v0.11.263: P31-A') && !ho.includes('- **v0.11.263: P31-A') && rd('history-52.md').includes('- **NEXT PUSH: open, options later.** Section 2\'s RA1 line settled') && !ho.includes('- **NEXT PUSH: open, options later.** Section 2\'s RA1 line settled') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.266 (P34-A): v0.11.263's notes, decision and the next-push entry moved to part 52 */ && rd('history-52.md').includes('## v0.11.264 — ') && !ho.includes('## v0.11.264 — ') && rd('history-52.md').includes('- **v0.11.264: P32-A') && !ho.includes('- **v0.11.264: P32-A') && rd('history-52.md').includes('- **NEXT PUSH: open, options later.** Group d') && !ho.includes('- **NEXT PUSH: open, options later.** Group d') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.267 (P35-A): v0.11.264's notes, decision and the next-push entry moved to part 52 */ && rd('history-51.md').includes('## v0.11.259 — ') && !ho.includes('## v0.11.259 — ') && rd('history-51.md').includes('- **v0.11.259: OC-A') && !ho.includes('- **v0.11.259: OC-A') && rd('history-51.md').includes('- **NEXT PUSH: open, options later.** SL and M4 done') && !ho.includes('- **NEXT PUSH: open, options later.** SL and M4 done') /* v0.11.258 (PL-A): part 50, v0.11.255's notes, decision and the next-push entry moved */ && rd('history-50.md').includes('## v0.11.255 — ') && !ho.includes('## v0.11.255 — ') && rd('history-50.md').includes('- **v0.11.255: P25-A + SC2') && !ho.includes('- **v0.11.255: P25-A + SC2') && rd('history-50.md').includes('- **NEXT PUSH: open, options later.** P27-A done') && rd('history-50.md').includes('## v0.11.258 — ') && !ho.includes('## v0.11.258 — ') && rd('history-50.md').includes('- **v0.11.258: PL-A') && !ho.includes('- **v0.11.258: PL-A') && rd('history-50.md').includes('- **NEXT PUSH: open, options later.** OC done') && !ho.includes('- **NEXT PUSH: open, options later.** OC done') && rd('history-51.md').includes('## v0.11.261 — ') && !ho.includes('## v0.11.261 — ') && rd('history-51.md').includes('- **v0.11.261: P29-A') && !ho.includes('- **v0.11.261: P29-A') && rd('history-51.md').includes('- **NEXT PUSH: open, options later.** The one clock done') && !ho.includes('- **NEXT PUSH: open, options later.** The one clock done') && rd('history-52.md').includes('## v0.11.264 — ') /* v0.11.264 (P32-A): v0.11.261's notes, decision and the next-push entry moved to part 51; v0.11.267: its own notes to part 52 */ && rd('history-51.md').includes('## v0.11.262 — ') && !ho.includes('## v0.11.262 — ') && rd('history-51.md').includes('- **v0.11.262: P30-A') && !ho.includes('- **v0.11.262: P30-A') && rd('history-51.md').includes('- **NEXT PUSH: open, options later.** The one clock\'s leftovers done') && !ho.includes('- **NEXT PUSH: open, options later.** The one clock\'s leftovers done') /* v0.11.265 (P33-A): v0.11.262's notes, decision and the next-push entry moved to part 51; the handover's newest notes v0.11.265's */ /* v0.11.261 (P29-A): v0.11.258's notes, decision and the next-push entry moved to part 50 */ /* v0.11.256 (P26-A): v0.11.253's notes, decision and the next-push entry moved to part 49 */ && rd('history-49.md').includes('## v0.11.253 — ') && !ho.includes('## v0.11.253 — ') && rd('history-49.md').includes('- **v0.11.253: P23-A + RG-A') && !ho.includes('- **v0.11.253: P23-A + RG-A') && rd('history-49.md').includes('- **NEXT PUSH: open, options later.** P25-A done') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.255 (P25-A): part 49, v0.11.252's notes, decision and the next-push entry moved */ && rd('history-49.md').includes('## v0.11.252 — ') && !ho.includes('## v0.11.252 — ') && rd('history-49.md').includes('- **v0.11.252: P22-A + RV-A') && !ho.includes('- **v0.11.252: P22-A + RV-A') && rd('history-49.md').includes('- **NEXT PUSH: P25-A, waiting for its go') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.258: v0.11.255's notes moved to history-50.md */ /* v0.11.253 (P23-A): part 48, v0.11.250's notes, decision, the next-push entry and the Friday line moved */ && rd('history-48.md').includes('## v0.11.250 — ') && !ho.includes('## v0.11.250 — ') && rd('history-48.md').includes('- **v0.11.250: P20-A + RV-A') && !ho.includes('- **v0.11.250: P20-A + RV-A') && rd('history-48.md').includes('- **NEXT PUSH: open, options later.** P22-A + RV-A done') && rd('history-48.md').includes('- **The plan for Friday 2026-11-20') && rd('history-49.md').includes('## v0.11.254 — ') && !ho.includes('## v0.11.254 — ') /* v0.11.257 (P27-A): v0.11.254's notes, decision and the next-push entry moved to part 49 */ && rd('history-49.md').includes('- **v0.11.254: P24-A') && !ho.includes('- **v0.11.254: P24-A') && rd('history-49.md').includes('- **NEXT PUSH: open, options later.** P26-A done') && rd('history-50.md').includes('## v0.11.257 — ') && !ho.includes('## v0.11.257 — ') && rd('history-50.md').includes('- **v0.11.257: P27-A') && !ho.includes('- **v0.11.257: P27-A') && rd('history-50.md').includes('- **NEXT PUSH: open, options later.** OC-A done') && rd('history-52.md').includes('## v0.11.263 — ') /* v0.11.263 (P31-A): v0.11.260's notes, decision and the next-push entry moved to part 51; v0.11.266: its own notes to part 52 */ && rd('history-51.md').includes('## v0.11.260 — ') && !ho.includes('## v0.11.260 — ') && rd('history-51.md').includes('- **v0.11.260: P28-A') && !ho.includes('- **v0.11.260: P28-A') && rd('history-51.md').includes('- **NEXT PUSH: open, options later.** p13 §10 done') && !ho.includes('- **NEXT PUSH: open, options later.** p13 §10 done') /* v0.11.260 (P28-A): v0.11.257's notes, decision and the next-push entry moved to part 50 */ && rd('history-47.md').includes('## v0.11.248 — ') && !ho.includes('## v0.11.248 — ') && rd('history-47.md').includes('- **v0.11.248: P18-A + LC1') && !ho.includes('- **v0.11.248: P18-A + LC1') && rd('history-47.md').includes('- **NEXT PUSH: open, options later.** Group f is done') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.258: v0.11.255's notes moved to history-50.md */ && rd('history-48.md').includes('## v0.11.251 — ') && !ho.includes('## v0.11.251 — ') /* v0.11.254 (P24-A): v0.11.251's notes to part 48 */ /* v0.11.251 (P21-E): part 47, v0.11.248's notes, decision and the next-push entry moved */ /* v0.11.248 (P18-A): part 46 */ /* v0.11.245 (SP1): part 45 */ /* v0.11.234 (P7-A): part 39; v0.11.236 (P9-A): part 40; v0.11.238 (P11-A): part 41; v0.11.239 (P12-A): part 42; v0.11.240 (RA1): part 43; v0.11.242 (P14-A): part 44 */ && rd('history-43.md').includes('## v0.11.237 — The quiet night\'s weeks 2 and 3') && !ho.includes('## v0.11.237 — ') && rd('history-43.md').includes('- **v0.11.237: P10-A + D1 + H-a + RV2') && !ho.includes('- **v0.11.237: P10-A + D1 + H-a + RV2') && rd('history-43.md').includes('- **P12-A, the rest of e push 12: done in v0.11.239**') && !ho.includes('- **P12-A, the rest of e push 12: done in v0.11.239**') && rd('history-42.md').includes('## v0.11.236 — The camp three texts a region') && !ho.includes('## v0.11.236 — ') && rd('history-42.md').includes('- **v0.11.236: P9-A + D1 + RV1') && !ho.includes('- **v0.11.236: P9-A + D1 + RV1') && rd('history-42.md').includes('- **P11-A, the rest of e push 11: done in v0.11.238**') && rd('history-41.md').includes('## v0.11.235 — The supper and the sunset walk a cycle of six') && !ho.includes('## v0.11.235 — ') && rd('history-41.md').includes('- **v0.11.235: P8-A + D1 + RV1') && !ho.includes('- **v0.11.235: P8-A + D1 + RV1') && rd('history-41.md').includes('- **P10-A, the rest of e push 10: done in v0.11.237**') && rd('history-40.md').includes('## v0.11.233 — The journey talks a cycle of six') && !ho.includes('## v0.11.233 — ') && rd('history-40.md').includes('- **v0.11.233: P6-A + D1 + RV1') && !ho.includes('- **v0.11.233: P6-A + D1 + RV1') && rd('history-40.md').includes('- **P8-A, the rest of e push 8: done in v0.11.235**') && rd('history-39.md').includes('## v0.11.231 — Who is at the Ashen Hills camp') && !ho.includes('## v0.11.231 — ') && rd('history-39.md').includes('- **v0.11.231: P4-2 + D1 + RV1 + DR1') && !ho.includes('- **v0.11.231: P4-2 + D1 + RV1 + DR1') && rd('history-39.md').includes('- **P6-A, the rest of e push 6: done in v0.11.233**') && rd('history-38.md').includes('## v0.11.228 — The read stop') && !ho.includes('## v0.11.228 — ') && rd('history-38.md').includes('- **v0.11.228: RE1 + RV1') && rd('history-38.md').includes('- **P3-2, the rest of e push 3: done in v0.11.230**') /* v0.11.231 (P4-2): part 38 */ && rd('history-36.md').includes('## v0.11.223 — The open items sorted (RO1; docs only)') && !ho.includes('## v0.11.223 — ') && rd('history-36.md').includes('- **NEXT PUSH: the flip (open, options later') && rd('history-38.md').includes('## v0.11.230 — The far hunt') && !ho.includes('## v0.11.230 — ') && rd('history-38.md').includes('- **v0.11.230: P3-2 + D1 + RV1') && rd('history-38.md').includes('- **P5-B, the rest of e push 5: done in v0.11.232**') /* v0.11.233 (P6-A) */ && rd('history-38.md').includes('## v0.11.229 — One-paragraph texts fold') && !ho.includes('## v0.11.229 — ') && rd('history-38.md').includes('- **v0.11.229: E2-2 + RV1') && rd('history-38.md').includes('- **P4-2, the rest of e push 4: done in v0.11.231**') /* v0.11.232 (P5-B) */ && rd('history-37.md').includes('## v0.11.226 — The flip (FP1 + RV1)') && !ho.includes('## v0.11.226 — ') && rd('history-37.md').includes('- **v0.11.226: FP1 + RV1') && rd('history-37.md').includes('- **RE1, the read stop\'s cap: done in v0.11.228**') && rd('history-35.md').includes('## v0.11.219 — Plan the week keeps its counts') && !ho.includes('## v0.11.219 — ') && rd('history-35.md').includes('- **NEXT PUSH: TS9, the journey to the Heart Tree') && rd('history-34.md').includes('## v0.11.215 — Every card its own work') && !ho.includes('## v0.11.215 — ') && rd('history-34.md').includes('- **NEXT PUSH: CK1, cooking with the village women a regular occasion') && h30.includes('- **v0.11.203: the time scale\'s TS1 + TS8 (T1), the review\'s fixes (RV1)') && !ho.includes('- **v0.11.203: the time scale\'s TS1 + TS8 (T1)') && h30.includes('## v0.11.203 — ') && !ho.includes('## v0.11.203 — ') && h31.includes('- **v0.11.206: the plan\'s forecast (FC1)') && h31.includes('## v0.11.206 — ') && !ho.includes('## v0.11.206 — ') && h32.includes('- **v0.11.209: TS4, food that spoils and keeps (TF1)') && h32.includes('## v0.11.209 — ') && !ho.includes('## v0.11.209 — ') && rd('history-33.md').includes('- **v0.11.212: the review checklist in two parts (CK1)') && rd('history-33.md').includes('## v0.11.212 — ') && !ho.includes('## v0.11.212 — ') && rd('history-33.md').includes('## v0.11.213 — ') && !ho.includes('## v0.11.213 — ') && !ho.includes('## v0.11.216 — ') && rd('history-34.md').includes('## v0.11.216 — The new order (docs only)') && rd('history-34.md').includes('- **NEXT PUSH: KC1, the plan\'s amounts kept') && !ho.includes('## v0.11.217 — ') && rd('history-34.md').includes('## v0.11.217 — The routine eats at the communal pot') && !ho.includes('## v0.11.218 — ') && rd('history-34.md').includes('## v0.11.218 — Cooking with the village women') && rd('history-34.md').includes('- **NEXT PUSH: WF2, the wilds\' work cards every 3rd day') && rd('history-35.md').includes('## v0.11.220 — The open items sorted') && !ho.includes('## v0.11.220 — ') && rd('history-35.md').includes('## v0.11.221 — The wilds\' work cards') && !ho.includes('## v0.11.221 — ') && rd('history-35.md').includes('- **NEXT PUSH: TS6, the texts') && rd('history-35.md').includes('## v0.11.222 — The Blackroot\'s camps') && !ho.includes('## v0.11.222 — ') && rd('history-35.md').includes('- **NEXT PUSH: the plan\'s leftovers') && !ho.includes('## v0.11.225 — ') && rd('history-37.md').includes('## v0.11.225 — The plan\'s leftovers') && rd('history-37.md').includes('- **v0.11.225: LO2 + RV1') && rd('history-37.md').includes('- **NEXT PUSH: the rest of e (') && !ho.includes('- **v0.11.225: LO2 + RV1') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.258: v0.11.255's notes moved to history-50.md */ && rd('history-47.md').includes('## v0.11.249 — ') && !ho.includes('## v0.11.249 — ') /* v0.11.252 (P22-A): v0.11.249's moved */ && !ho.includes('## v0.11.243 — ') && rd('history-45.md').includes('## v0.11.243 — ') && rd('history-45.md').includes('- **v0.11.243: P15-B + D1 + W1') && !ho.includes('- **v0.11.243: P15-B + D1 + W1') && rd('history-45.md').includes("- **NEXT PUSH: the rest of e, BB's first bundle") /* v0.11.246 (P16-A): v0.11.243's notes and decision and the first bundle's entry to history-45.md */ && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.253: v0.11.250's notes moved (history-48.md); v0.11.256: v0.11.253's (history-49.md); v0.11.257: v0.11.254's (history-49.md); v0.11.258: v0.11.255's (history-50.md) */ && !ho.includes('## v0.11.247 — ') && rd('history-46.md').includes('## v0.11.247 — ') && rd('history-46.md').includes('- **v0.11.247: P17-A') && !ho.includes('- **v0.11.247: P17-A') && rd('history-46.md').includes("- **NEXT PUSH: group f's rest") /* v0.11.250 (P20-A): v0.11.247's notes and decision and the next-push entry to history-46.md */ && !ho.includes('## v0.11.244 — ') && rd('history-45.md').includes('## v0.11.244 — ') && rd('history-45.md').includes('- **v0.11.244: RO2') && !ho.includes('- **v0.11.244: RO2') /* v0.11.247 (P17-A): v0.11.244's moved */ && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ /* v0.11.258: v0.11.255's notes moved to history-50.md */ && rd('history-47.md').includes('## v0.11.249 — ') && !ho.includes('## v0.11.249 — ') /* v0.11.252 (P22-A): v0.11.249's moved */ && !ho.includes('## v0.11.245 — ') && !ho.includes('## v0.11.246 — ') && rd('history-46.md').includes('## v0.11.246 — ') && rd('history-46.md').includes('- **v0.11.246: P16-A') && !ho.includes('- **v0.11.246: P16-A') && rd('history-46.md').includes("- **NEXT PUSH: group f's first push") /* v0.11.249 (P19-A): v0.11.246's notes and decision and the next-push entry to history-46.md */ && rd('history-46.md').includes('## v0.11.245 — ') && rd('history-46.md').includes('- **v0.11.245: SP1') && !ho.includes('- **v0.11.245: SP1') && rd('history-46.md').includes('- **NEXT PUSH: the end of e (LF) and group f') /* v0.11.248 (P18-A): v0.11.245's notes and decision and the next-push entry to history-46.md, a new part */ && !ho.includes('## v0.11.242 — ') && rd('history-45.md').includes('## v0.11.242 — ') && rd('history-45.md').includes('- **v0.11.242: P14-A + D1 + C-a + RV1') && !ho.includes('- **v0.11.242: P14-A + D1 + C-a + RV1') && rd('history-45.md').includes('- **NEXT PUSH: the speed-up first') /* v0.11.245 (SP1): v0.11.242's notes and decision and the speed-up entry to history-45.md */ && !ho.includes('## v0.11.240 — ') && !ho.includes('## v0.11.241 — ') && rd('history-44.md').includes('## v0.11.240 — ') && rd('history-44.md').includes('## v0.11.241 — ') && rd('history-44.md').includes('- **v0.11.241: P13-A (WK-d)') && !ho.includes('- **v0.11.241: P13-A (WK-d)') && rd('history-44.md').includes('- **NEXT PUSH: the rest of e, push 16') /* v0.11.244 (RO2): v0.11.240's and v0.11.241's notes, v0.11.241's decision and the push-16 entry moved */ && !ho.includes('## v0.11.238 — ') && !ho.includes('## v0.11.239 — ') && rd('history-44.md').includes('## v0.11.239 — The Fallout supper six a story day') && rd('history-44.md').includes('- **v0.11.239: P12-A + D1 + RV1') && !ho.includes('- **v0.11.239: P12-A + D1 + RV1') && rd('history-44.md').includes('- **NEXT PUSH: the rest of e, push 14') /* v0.11.242: the handover keeps 240–242 */ && rd('history-43.md').includes('## v0.11.238 — The camps\' last nights') && rd('history-43.md').includes('- **v0.11.238: P11-A + D1 + RV2') && !ho.includes('- **v0.11.238: P11-A + D1 + RV2') && rd('history-43.md').includes('- **NEXT PUSH: the rest of e, push 13') /* v0.11.239: the handover keeps 237–239; v0.11.240: 238–240; v0.11.241: 239–241 */ && !ho.includes('## v0.11.234 — ') && rd('history-40.md').includes('## v0.11.234 — The roof\'s later nights a cycle of six') && rd('history-40.md').includes('- **v0.11.234: P7-A + D1 + RV1') && !ho.includes('- **v0.11.234: P7-A + D1 + RV1') && rd('history-40.md').includes('- **P9-A, the rest of e push 9: done in v0.11.236**') /* v0.11.233: v0.11.230's moved; v0.11.234: v0.11.231's; v0.11.236: v0.11.233's; v0.11.237: v0.11.234's */ && !ho.includes('## v0.11.227 — ') && rd('history-37.md').includes('## v0.11.227 — The realm kept for a won game') && rd('history-37.md').includes('- **v0.11.227: KA1') && !ho.includes('- **v0.11.227: KA1') && rd('history-37.md').includes('- **E2-2, the rest of e push 2: done in v0.11.229**') && !ho.includes('## v0.11.224 — ') && rd('history-36.md').includes('## v0.11.224 — TS6, the long calendar\'s texts') && rd('history-36.md').includes('- **NEXT PUSH: KA, the realm kept for a won game') && rd('history-36.md').includes('- **v0.11.224: TS6 = TX2 + XA + RV1'), 'T1 (rules 5, 6; v0.11.231: v0.11.228\'s notes and decision and the open items as they stood in history-38.md, a new part; v0.11.230: v0.11.227\'s notes and decision and the open items as they stood in history-37.md; v0.11.229: v0.11.226\'s notes and decision and the open items as they stood in history-37.md; v0.11.228: v0.11.225\'s notes and decision and the rest of e\'s item in history-37.md, a new part; v0.11.227: v0.11.224\'s notes and decision and the KA item in history-36.md; v0.11.226: v0.11.223\'s notes and the flip item in history-36.md; v0.11.225: v0.11.222\'s notes and the plan\'s leftovers item in history-35.md): v0.11.203\'s pick and note in history-30.md, v0.11.206\'s in history-31.md, v0.11.209\'s in history-32.md, (v0.11.215, v0.11.216) v0.11.212\'s and v0.11.213\'s in history-33.md, (v0.11.219, v0.11.220, v0.11.221) v0.11.216\'s, v0.11.217\'s, v0.11.218\'s, the KC1 and the WF2 items in history-34.md, (v0.11.222, v0.11.223, v0.11.224) v0.11.219\'s, v0.11.220\'s, v0.11.221\'s, the TS9 and the TS6 items in history-35.md, the handover names it and keeps v0.11.222\'s to v0.11.224\'s'); }
    assert(d3.includes('### From section 0, as of v0.11.202\n\n- *(v0.11.202, owner picks M1, D1)* **The merged text push done**') && !r1.includes('- *(v0.11.202, owner picks M1, D1)* **The merged text push done**') && r1.includes('- *(v0.11.190, the size rule)*'), 'T1: section 0\'s v0.11.202 line moved word for word, the v0.11.190 pointer kept');
    assert((r1 + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')).includes('~~the Blackroot\'s Practice darts and needles failing in silence~~ **done in v0.11.202** (b1)') /* v0.11.245 (SP1 EC): group e's rewrite block in roadmap-2.md section 5 */ && (r1 + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')).includes('~~the four older Yuki tics (v0.11.179\'s RV2 list)~~ **done in v0.11.202** (a10, a11)') && (r1 + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')).includes('**found done in v0.11.202** (e2)'), 'T1: the docs gap: group e\'s lines mark v0.11.202\'s items');
    assert(ck.includes('**The clock\'s day against the text day (v0.11.203 L4):**') && ck.includes('**A jump between parts walked, not computed (v0.11.203 TG2–TG4, TG7):**'), 'T1 (RV1): the review\'s new kinds in the checklist');
}
// v0.11.240 (owner pick RA1, docs only): the handover's 29 open items on no roadmap line placed word for word (the entry as it stood in
// history-43.md): roadmap-e.md's "No repeated texts" tail and its end, the tic on "Small text fixes", §10's bug at roadmap-retune.md's end,
// 4 notes closed as accepted in roadmap-done-4.md; the handover's entry pointers; group f names the romance nights' loft
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const re = rd('roadmap-e.md'), rr = rd('roadmap-retune.md'), d4 = rd('roadmap-done-4.md'), r1 = rd('roadmap.md'), ho = rd('handover.md'), h43 = rd('history-43.md');
    const lineOf = (t, start) => t.split('\n').find((l) => l.startsWith(start)) || '';
    const nr = lineOf(re, '- *(new in v0.11.65)* No repeated texts'), sm = lineOf(re, '- *(new in v0.11.65)* Small text fixes') || lineOf(rd('roadmap-done-5.md'), '- *(new in v0.11.65)* Small text fixes') /* v0.11.258 (PL-A): done, moved word for word to roadmap-done-5.md */, placed = re.slice(re.indexOf('## Placed here in v0.11.240')) + '\n' + rd('roadmap-act2.md') /* v0.11.258 (PL-A): the lore line moved word for word to roadmap-act2.md */;
    const tail = nr.slice(nr.indexOf(' *(v0.11.240, owner pick RA1'));
    const old = h43.slice(h43.indexOf('## Open items (v0.11.238;'), h43.indexOf('*(the oldest of the three decisions)*', h43.indexOf('## Open items (v0.11.238;'))); // v0.11.241: the newer move above it in the part
    const hoOpen = ho.slice(ho.indexOf('## Open items'), ho.indexOf('## Decided in chat (2026-11-07)'));
    const where = { tail: ["the burned loft (`loft_burned`, the bots 0 of 80 games): where James sleeps after a burn (a canon call first), then week 3's mornings' \"still smoking\" line, the roof's three herb lines, the quiet nights' ladder; the romance nights' loft after a burn (`fo_mei_night`, `rt_mei_night`, `yuki_path`; not measured)", "the old calendar's quiet-night index 1–2"], placed: ["the new customs not yet in `lore.md` (the boundary stones, the scarecrow, the shrine shelf, his accent; v0.11.237: the father's tablet, a weaver, the drying racks, the door bar; v0.11.238: wormwood in the loft, a fallen bough of the dead tree; v0.11.239: the late husband's jacket, kept and aired each spring; a man's tooth on Ya's necklace, \"forty-odd teeth of several species\" beside the later \"necklace of wolf teeth\" (T L5); the palisade's gate still to hang; the grain chest)", "the two talks on one day (v0.11.233 T L1)", "Ya's herb-girl lines read as before the spring (v0.11.233 T L2)", "the Drowned Wood's \"path\" and a rock (v0.11.233 T L4)", "the roof's second round under lines that point at their hidden part (v0.11.234 T L6, acceptable)", "three older fireside lines on a day with no food at all (v0.11.234 T L5)", "**from v0.11.236's reviews:** Mei Lin's millet cake gives no food beside the hub's hunger line (T L3, acceptable: her basket is hers); the basket in 5 of Mei Lin's 6 cycle texts (T L5); the YW phrase \"Where you come from,\" Mei Lin says also opens her Act 1 talk (C L3, log only)", "**from v0.11.237's reviews:** the supper the night after the tablet says she \"has not spoken of her husband since\" (T L1, log only); the bracket fungus a common real species (T L5; his world is not Earth); rain after the roof's stars (T L7)", "**from v0.11.238's build and reviews:** the camp texts' formula (Mei Lin's chore, Ya ignoring it; the fire's place; T L4, log only); time words on a late camp or a late supper (T L5, the game's own usage); week 1's bird night is week 2's fungus beat (T M2, the sound kept)", "**from v0.11.239's reviews:** the three lines for a supper without Ya are unreachable on the long calendar (Ya is met on story day 9's first morning; T L2, kept)"], small: ["a tic in old text the wider lint samples found (`rt_fire_talk` \"the worst\" ×3)"], rr: ["From p13's measure: on the old calendar a Fallout supper eaten after midnight reads the next story day's text (the Sociable 10 of 10 games, v0.11.238 too: the scene's day starts at midnight, the day records at 05:00; `p13-measure.md` §10)"], d4: ["an old save mid-week (v0.11.233 C L2, nothing breaks; v0.11.238: a save past the old lists' end reads the new index from there)", "a save from mid-Blackroot shows each camp text in full once more, then folds (C L2, once)", "a save that kept the 5-day Blackroot road (`calBl` 1) never sees the wood's fourth camp (C L4, old behaviour)", "the lint's shingle across the wood's fourth camp and its stock line (log only)"] };
    const into = { tail, placed, small: sm.slice(sm.indexOf(' *(v0.11.240')), rr: rr.slice(rr.indexOf('## Placed here in v0.11.240')), d4: d4.slice(d4.indexOf('## Closed as accepted in v0.11.240')) };
    for (const [k, list] of Object.entries(where)) for (const s of list) assert(old.includes(s) && into[k].includes(s) && !hoOpen.includes(s), `RA1: "${s.slice(0, 50)}…" word for word from the old entry (history-43.md) into ${k}, not left in the handover`);
    for (const s of ['**FS10**, the Fallout supper\'s story day 10 its own six', '`supper_roof`\'s later nights (the Cultivator 4.9 a game)', '`ah_hunt`\'s third text (with versions for when Ya is away)', 'the Blackroot\'s fight-win texts (fights may repeat; lowest priority)', 'the seventh nights past six (the Fallout supper\'s days 49 and 56, the village supper\'s days 27 and 34, the quiet night\'s week-1 night 7; 0.5–1.4 a game each)']) assert(tail.includes(s), `RA1: the v0.11.240 tail names "${s.slice(0, 40)}…"`);
    const rv = lineOf(placed.slice(placed.indexOf('\n- ') + 1), '- *(new in v0.11.240; log only)* **Review notes for the polish pass (log only):**'), rvN = (rv.match(/(?:\(|; )(?:v0\.11\.23\d )?[TC] [LM]\d/g) || []).length;
    assert(rvN === 15, `RA1: the review notes line holds 15 notes (${rvN})`);
    assert(rr.includes('the text day (05:00) against the daily reset (04:00)') && r1.includes('the text day (05:00) against the daily reset (04:00)'), 'RA1: §10\'s bug names the text-day item in roadmap.md section 2');
    const f = r1.slice(r1.indexOf('### f. Romance'), r1.indexOf('## A2. Act 2')) + rd('roadmap-done-5.md') /* v0.11.258 (PL-A): group f's lines moved word for word to roadmap-done-5.md */;
    assert(f.includes('`fo_mei_night`, `rt_mei_night`, `yuki_path`') && f.includes('with LF'), 'RA1: group f names the romance nights\' loft, with LF');
    assert(hoOpen.includes('**The open items: placed on the roadmap in v0.11.240**') && Buffer.byteLength(hoOpen.split('\n').find((l) => l.startsWith('- **The open items: placed'))) < 1400, 'RA1: the handover\'s entry is pointers (about 1 KB)');
    assert(Buffer.byteLength(re) <= DOC_TOOL_MAX && Buffer.byteLength(r1) <= MIRROR_MAX, `RA1: roadmap-e.md ${Buffer.byteLength(re)} bytes under ${DOC_TOOL_MAX}, roadmap.md under ${MIRROR_MAX}`);
}
// v0.11.245 (owner pick SP1, 2026-11-21 11:40): the speed-up's rules in CLAUDE.md and the working agreement; EC's moves word for word
{
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const cl = rd('CLAUDE.md'), wa = rd('project/working-agreement.md'), re = rd('project/roadmap-e.md'), r2 = rd('project/roadmap-2.md'), rm = rd('project/roadmap.md');
    assert(['**PG, a standing go**', '**once per push, after the review fixes**', '**A new chat every three pushes**', 'up to 6 Fable runs at once'].every((k) => cl.includes(k)) && ['**PG, a standing go**', '**BB and FP**', 'NC2'].every((k) => wa.includes(k)), 'SP1: PG, FC1, NC2, FP and BB in CLAUDE.md and the working agreement');
    const moved = ['**Relationship and text systems from the dating sims', '**Realm flavour and text systems from the cultivation games', '**Text systems from the games (each its own pick):**', '**Whose relationships to track', '**The repeating replies (moved out of group b', '**Relationship cards and texts in sequence', '**Story beats, James\'s cooking and his music', '**Story pass, realm flavour', '**The repeats map (read from the code', '**Tools for the text work, before or with the rewrite pass', '**P1-b / P1-c (optional):**', '**The rest of the rewrite, part by part**'];
    const bad = moved.filter((k) => !r2.includes(k) || re.includes(k) || rm.includes(k));
    assert(!bad.length && re.includes('**e ends after BB\'s two pushes**') && r2.includes("### Group e's design lines") && r2.includes("### Group e's later lines"), `SP1 EC: e's design and later lines in roadmap-2.md only (${bad.join(' | ')})`);
}

// v0.11.258 (owner pick PL-A, 2026-11-23): the dangling items placed: the Order line's steps 1–4 done with fresh estimates; OC and MF in
// section 2; step 5b, the polish pass (section 2b); the lore line and f's CH, LE, FR with Act 2; e's bundles, its done lines, f's lines and
// the old order line word for word in roadmap-done-5.md; the TS labels done
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const r1 = rd('roadmap.md'), re = rd('roadmap-e.md'), a2 = rd('roadmap-act2.md'), rt = rd('roadmap-time.md'), d5 = rd('roadmap-done-5.md');
    const order = r1.split('\n').find((l) => l.startsWith('**Order**')) || '';
    assert(order.includes('owner pick PL-A') && ['~~**1. t, the time scale**~~ (**done in v0.11.226**)', '~~**3. the rest of e**~~ (**done in v0.11.248**)', '~~**4. f, romance**~~ (**done in v0.11.250**)', '**5–10 pushes**' /* v0.11.260 (P28-A): OC done, 4–8 → 3–7; v0.11.270 (P38-A, SL): 3–7 → 5–10 */, '**5b. the polish pass**', '**30–50**', '**5–10**', '**12–20**', '**55–95 pushes, 7–24 working days**' /* v0.11.260: 57–100 → 56–99; v0.11.270 (P38-A, SL): 55–95, 4–9 pushes a day */].every((t) => order.includes(t)), 'PL-A: the Order line marks steps 1–4 done and gives each open step its estimate');
    const s2 = r1.slice(r1.indexOf('## 2. The balance retune'), r1.indexOf('## 2b. '));
    const s2b = r1.slice(r1.indexOf('## 2b. The polish pass'));
    assert(s2.includes('~~**OC, the old calendar\'s code:**~~ *(done in v0.11.259–v0.11.260)* about 640 hand-built test states and 105 `longCal` uses in 17 files') /* v0.11.260 (P28-A): OC done, struck through */ && s2.includes('**MF, the mother\'s friendship under WE against CMN**'), 'PL-A: OC and MF in section 2');
    assert(['**YM-3, Ya\'s manners:**', '**FC-w, Ashfall sees the first flight:**', '**NF-g, the night fold\'s earlier-day rule**', '**PK, the night packet\'s size**', '**LT, a lint rule for a form\'s demonstrative', '**PN, the polish notes (log only):**'].every((t) => s2b.includes(t)) && (s2b.match(/^- \*\*/gm) || []).length === 6 && !/^## \d[a-z]?\. /m.test(s2b.slice(1)) && s2b.indexOf('*(Sections 3–6 and Decided') > 0, 'PL-A: section 2b holds the six (FN closed in v0.11.246), before the pointer to roadmap-2.md');
    assert(a2.includes('**The lore line:** the new customs not yet in `lore.md`') && !re.includes('**The lore line:**') && a2.includes('CH, the weekly evening as a "who to spend it with" chooser; LE, a locked echo that names what is missing; FR, a finished route carried across a round again'), 'PL-A: the lore line moved word for word to roadmap-act2.md, f\'s three placed with Act 2\'s romance');
    const fSec = r1.slice(r1.indexOf('### f. Romance'), r1.indexOf('## A2. Act 2'));
    assert(!fSec.includes('**Done:**') && fSec.includes('**group f is done** (v0.11.250)') && d5.includes('- *(v0.11.250, owner picks P20-A, RV-A)* **Done:** TS5\'s weekly evening') && d5.includes('- *(v0.11.240, owner pick RA1)* The romance nights\' loft after a burn'), 'PL-A: group f\'s seven lines moved word for word to roadmap-done-5.md, a pointer left');
    for (const t of ['## The bundles (v0.11.199, owner pick P1, 2026-11-16 16:35)', '- *(new in v0.11.69)* **The Fable rewrite pass', '- *(new in v0.11.65)* Small text fixes', '- *(new in v0.11.68)* **Reactions to Yuki', '- *(was: group b, the format bullet', '- *(new in v0.11.91; owner 2026-11-09 08:55', '- *(new in v0.11.132, owner 17:19 "PL1 go")*', '- *(new in v0.11.244; open, options later; a story text)*']) assert(d5.includes(t) && !re.includes(t), `PL-A: "${t.slice(0, 40)}" moved word for word to roadmap-done-5.md`);
    assert(re.includes('- *(new in v0.11.77)* **Story, flight') && re.includes('- *(new in v0.11.65)* No repeated texts') && re.includes('owner pick PL-A, 2026-11-23: group e ended in v0.11.248'), 'PL-A: e keeps its flight and repeats lines (FC-w, YM-3, NF-g, PK) and says where the rest went');
    assert(['TS1', 'TS2', 'TS3', 'TS4', 'TS5', 'TS6', 'TS7', 'TS8'].every((t) => !new RegExp(`- \\*\\*${t}, [^*]*\\*\\* \\(open[;)]`).test(rt)), 'PL-A: no TS label still says (open)');
    assert(Buffer.byteLength(r1) <= MIRROR_MAX && Buffer.byteLength(d5) <= 45000 && d5.includes('Started in v0.11.258'), `PL-A: roadmap.md under ${MIRROR_MAX} (${Buffer.byteLength(r1)}), roadmap-done-5.md a new part under 45 KB (${Buffer.byteLength(d5)})`);
}
// v0.11.244 (owner pick RO2, 2026-11-21 11:08): t's and KA's open items placed word for word, a pointer left where each stood
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const rt = rd('roadmap-time.md'), a2 = rd('roadmap-act2.md'), r2 = rd('roadmap-2.md'), rr = rd('roadmap-retune.md'), re = rd('roadmap-e.md'), d4 = rd('roadmap-done-4.md'), ho = rd('handover.md');
    const s4 = r2.slice(r2.indexOf('## 4. Systems'), r2.indexOf('## 5. Later'));
    const at = { 'KR, the row showing the kept amount': s4, 'BP, a plan for the Blackroot\'s camps': s4, 'BD, the bots\' daily doors on the plan': rr, 'the drift guard on the long calendar (': rr, 'the Heart (Days 80–100 now) is three weeks': rr, '(a) the bots measure a kept Foundation only': rr, '(b) the Foundation closer and the first flight line': re + rd('roadmap-done-5.md') /* v0.11.258 (PL-A): done in v0.11.246, moved word for word */, '(c) old saves\' clears from before v0.11.227': d4 };
    const bad = Object.entries(at).filter(([k, where]) => !where.includes(k) || rt.includes(k) || a2.includes(k)).map(([k]) => k);
    assert(!bad.length && rt.includes('v0.11.244, owner pick RO2') && a2.includes('v0.11.244, owner pick RO2') && !ho.includes("t's KR, BD, BP and the drift guard (`roadmap-time.md`)"), `RO2: the eight items in their stages, gone from t's and KA's lines, pointers left (${bad.join(' | ')})`);
    assert(d4.indexOf('## Closed as accepted in v0.11.244') > 0 && rr.includes('## Placed here in v0.11.244') && re.includes('## Placed here in v0.11.244'), 'RO2: the headings');
}

// v0.11.212 (owner pick CK1): the review checklist split by kind under the 12,000-byte cap: the text lists in review-checklist.md
// (its head names the second part), the test gaps and the code lessons in review-checklist-code.md (it sends the reader to the first
// part's "How to read"); v0.11.210's and v0.11.211's four lessons in it; nothing lost in the move
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const a = rd('review-checklist.md'), b = rd('review-checklist-code.md');
    assert(a.includes('## How to read (cheaply)') && a.includes('also `review-checklist-code.md`') && !a.includes('## Tests (TG)'), 'CK1: the first part keeps how to read and names the second');
    assert(b.includes("`review-checklist.md`'s \"How to read\" first") && b.includes('## Tests (TG)') && b.includes('## Code and UI (v0.11.210, v0.11.211'), 'CK1: the second part has the test gaps and the code lessons');
    for (const k of ['(v0.11.210 M1)', '(v0.11.210 M2)', '(v0.11.211 H1)', '(v0.11.211 TG2)']) assert(b.includes(k), `CK1: the lesson ${k} in the second part`);
    for (const k of ['(v0.11.206 H1, TG1)', '(v0.11.207 M1, L2, TG1–TG3)', '(v0.11.181 TG1)', '(v0.11.203 TG6)']) assert(b.includes(k) && !a.includes(k), `CK1: the test gap ${k} moved, not lost`);
}

// v0.11.171 (owner pick RA1): Act 2 in its own part, roadmap-act2.md, named between group f and section 2 in roadmap.md, with the
// owner's words of 2026-11-14 01:02, the Act 2 lines moved from roadmap-2.md section 5 (not left behind) and its facts in lore.md;
// the handover's open items placed on the roadmap (group e's parts 5–9, section 2, roadmap-2.md sections 4 and 6), the handover pointing there
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const r1 = rd('roadmap.md'), r2 = rd('roadmap-2.md'), ra = rd('roadmap-act2.md'), lore = rd('lore.md'), ho = rd('handover.md'), h20 = rd('history-20.md');
    const f = r1.indexOf('### f. Romance'), a2 = r1.indexOf('## A2. Act 2'), s2 = r1.indexOf('## 2. The balance retune');
    assert(f > 0 && a2 > f && s2 > a2 && r1.slice(a2, s2).includes('`roadmap-act2.md`'), 'RA1: roadmap.md names roadmap-act2.md between group f and section 2');
    assert(ra.includes('"one item after the romance and before the act 1 retune.') && ra.includes('and he has a doctorate in biology...)"') && ra.includes('`roadmap.md`') && ra.includes('`roadmap-2.md`'), 'RA1: the owner\'s words word for word, and the parts named');
    for (const t of ['- **Act 2** (open).', '**Plot point for Act 2: James\'s world is the outlier.**', '**For Act 2, the knitting bone (T6) and the crushing mass (T9)**', '**For Act 2, from the cultivation games:**', 'Universal-service gifts (organic armour']) assert(ra.includes(t) && !r2.includes(t), `RA1: "${t.replace(/\*/g, '').slice(0, 40)}" moved to roadmap-act2.md`);
    assert(/^## Act 2 \(the owner, 2026-11-14 01:02/m.test(lore) && /never be truly alive again, nor regenerate enough to fly/.test(lore) && /biology, engineering, agriculture, horticulture and gardening are mostly the same thing/.test(lore), 'RA1: Act 2\'s facts in lore.md');
    const od = r1 + rd('roadmap-done-4.md'); // v0.11.216: the older order lines moved word for word to roadmap-done-4.md
    assert(/Now: the PC layout, the merged text push \(the rest of e\), f, section 2 \(the retune of the prologue and Act 1\), then Act 2 \(`roadmap-act2\.md`\) if there is time/.test(od), 'RA1, v0.11.200 (owner pick F2): the order names Act 2 after the retune, the PC layout first');
    assert(/\*\*Now: the PC layout, the merged text push \(the rest of e\), the time scale \(t, `roadmap-time\.md`\), f, section 2 \(the retune of the prologue and Act 1\), then Act 2 \(`roadmap-act2\.md`\) if there is time/.test(od), 'v0.11.201 (owner pick O1): the order names the time scale between the merged text push and f, in bold (F2\'s order struck)');
    assert(/\*\*1\. t, the time scale\*\*.*\*\*2\. the rest of e\*\*.*\*\*3\. f, romance\*\*.*\*\*4\. section 2, the retune\*\*.*\*\*5\. A2, Act 2\*\*/.test(rd('roadmap-done-4.md')) && /\*\*1\. t, the time scale\*\*.*\*\*2\. KA, the realm kept for a won game\*\*.*\*\*3\. the rest of e\*\*.*\*\*4\. f, romance\*\*.*\*\*5\. section 2, the retune\*\*.*\*\*7\. A2, Act 2\*\*/.test(r1) /* v0.11.270 (P38-A): Act 2 step 7, after systems */ && !/\*\*Now: the PC layout/.test(r1), /* v0.11.220 (OR1): the v0.11.216 line moved word for word, KA second */ 'v0.11.216 (the owner 2026-11-18 00:04): the order t, the rest of e, f, the retune, Act 2; the old line moved');
    // v0.11.173 (P6A): parts 5 and 6 done, their lines moved word for word to roadmap-done-3.md; the stasis note in roadmap-act2.md
    { const d3 = rd('roadmap-done-3.md'); assert((r1.slice(r1.indexOf('### e. '), f) + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')) /* v0.11.245 (SP1 EC) */.includes('**Parts 5, 6, 7 and 8: done**') && d3.includes('its stomp texts. **Done in v0.11.175**') && d3.includes('**Part 5, the Blackroot:** **done in v0.11.172**') && d3.includes('**Part 7, the Return:** **done in v0.11.174**') && d3.includes('**Part 6, the Heart:**') && d3.includes('**Done in v0.11.173**'), 'P6A: parts 5 and 6 done, their lines in roadmap-done-3.md (v0.11.174, P7A: and part 7)'); }
    assert(ra.includes('It\'s called the "Sneaky Bastard"') && ra.includes('we will square it when we get there...') && rd('roadmap-done-3.md').includes('`mei_carried_seed`'), 'P6A (rule 6): the owner\'s 03:50 and 03:57 note in roadmap-act2.md; SD in part 7');
    // v0.11.179 (LB1): the label pass done, its old line word for word in roadmap-done-3.md; group e keeps its done line and names CP next
    assert(rd('roadmap-done-3.md').includes('## Moved in v0.11.179') && rd('roadmap-done-3.md').includes('  - **The label pass:** *(v0.11.178)* measured at 14:16') && (r1.slice(r1.indexOf('### e. '), f) + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')) /* v0.11.245 (SP1 EC) */.includes('**The label pass:** **done in v0.11.179**') && (r1.slice(r1.indexOf('### e. '), f) + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')) /* v0.11.245 (SP1 EC) */.includes('**CP, context packets:** **done in v0.11.180**'), 'LB1: the label pass\'s line moved word for word; CP done in group e (v0.11.180)');
    // v0.11.180 (CP1, SZ1): the CP line word for word in roadmap-done-3.md, newest first; group e names CM next
    assert(rd('roadmap-done-3.md').indexOf('## Moved in v0.11.180') >= 0 && rd('roadmap-done-3.md').indexOf('## Moved in v0.11.180') < rd('roadmap-done-3.md').indexOf('## Moved in v0.11.179') && rd('roadmap-done-3.md').includes('  - **CP, context packets: next** *(v0.11.179, the owner 16:42') && (r1.slice(r1.indexOf('### e. '), f) + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')) /* v0.11.245 (SP1 EC) */.includes('Push 1 done in v0.11.181**'), 'CP1: the CP line moved word for word (newest first); CM in group e (v0.11.181: its push 1 done)');
    // v0.11.181 (SP1, RV1): CM's push 1 done, its open items on the CM line; Lyfjaberg in lore.md (rule 6). v0.11.182 (CB1, RS1, RV1): push 2 done,
    // push 3 next with Music Box of Fate; the owner's 20:39 and 21:16 notes word for word in lore.md (rule 6). v0.11.183 (SG2, RV1): push 3 done,
    // the fork's texts left open on the CM line; the search's facts (FC) in lore.md
    assert((r1.slice(r1.indexOf('### e. '), f) + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')) /* v0.11.245 (SP1 EC) */.includes('**Push 2 done in v0.11.182**') && (r1 + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')).includes('**Push 3 done in v0.11.183**') && (r1 + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')).includes('the fork\'s texts (not in SP1\'s three pushes; moved to the end of the roadmap in v0.11.190') /* v0.11.190: the owner 19:15 */ && rd('lore.md').includes('**Built in v0.11.183 (CM push 3') && rd('lore.md').includes('*The Water\'s Call* (Lord **Aethelstan**') && (r1 + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')).includes('the Sociable bot never takes the mother\'s card') && rd('lore.md').includes('he should also play Lyfjaberg from Wardruna at least once') && rd('lore.md').includes('"Lyfjaberg" (Wardruna'), 'CM (SP1, CB1, SG2): pushes 2 and 3 done, the open items on its line; Lyfjaberg in lore.md');
    assert(rd('lore.md').includes('Also Ironmouse\'s Music Box of Fate should definitely be shown to both Ya and Mei, with a short description of her circumstances.') && rd('lore.md').includes('They are not slaves. They do their jobs usually, but have the right to refuse, if they develop the ability to refuse.') && rd('canon-card.md').includes('**Seedlings**'), 'CB1, RS1 (rule 6): the owner\'s Music Box of Fate and Seedlings notes in lore.md; the Seedlings on the canon card');
    // v0.11.177 (P9A): part 9 done, its line word for word in roadmap-done-3.md; group e keeps its done line with part 9's open items
    assert(rd('roadmap-done-3.md').includes('## Moved in v0.11.177') && rd('roadmap-done-3.md').includes('  - **Part 9 (new), the leftovers of parts 1–4:**'), 'P9A: part 9\'s line moved word for word to roadmap-done-3.md');
    for (const t of ['**Part 9, the leftovers: done in v0.11.177**', // v0.11.175 (P8A): part 8 done, in roadmap-done-3.md
         '**The label pass:**', '**CM, after part 9**']) assert((r1.slice(r1.indexOf('### e. '), f) + readFileSync(path.join(ROOT, 'project', 'roadmap-2.md'), 'utf8')) /* v0.11.245 (SP1 EC) */.includes(t), `RA1: group e has "${t.replace(/\*/g, '')}"`);
    assert(r1.slice(s2).includes('**For the retune, from the open items:**') && r2.slice(r2.indexOf('## 4. '), r2.indexOf('## 5. ')).includes('**Systems from the open items:**') && r2.slice(r2.indexOf('## 6. ')).includes('**The owner\'s calls on the texts:**'), 'RA1: the placed items in section 2, section 4 and section 6');
    const ho0 = ho.slice(ho.indexOf('## Open items'), ho.indexOf('## Decided in chat'));
    assert(/every open, options later item is on the roadmap/i.test(ho0) && !/Open, options later \(new in v0\.11\.1\d\d/.test(ho0) && h20.includes('### Open items (v0.11.170; details where noted)'), 'RA1: the handover\'s open items point to the roadmap; the old ones in history-20.md');
}
// v0.11.174 (owner picks P7A, SL1, CN1, CA1, RV1; rule 6): the Selene canon in lore.md, Luna in roadmap-act2.md, parallel work in the
// handover, all word for word; part 7's line in roadmap-done-3.md
{
    const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const lore = rd('lore.md'), ra = rd('roadmap-act2.md'), ho = rd('handover.md');
    assert(lore.includes('## Selene (the owner, 2026-11-14; v0.11.174, picks SL1 and CN1)') && lore.includes('Instead of a meteor shower, she is knocked off course by a spacetime anomaly.') && lore.includes('Never "The ship" "The ship Selene" etc.'), 'P7A (rule 6): the owner\'s Selene words in lore.md');
    assert(ra.includes('The new, young ship should be called Luna in honour of Selene."') && ra.includes('There was a compartmentalized hammerspace on the ship too'), 'P7A (rule 6): the owner\'s Luna note in roadmap-act2.md');
    const h29p = rd('history-29.md'); // v0.11.204 (W1, the 35 KB rule): moved word for word to history-29.md, a pointer left
    assert((ho + h29p).includes('it\'s really different to spending a few more tokens vs to wait for a job to finish for an hours if it can be done in 10 minutes with parallelization...') && (ho.includes('parallelization...') || ho.includes('**parallel work (the owner 06:48) and the owner 08:14: word for word in `history-29.md`')), 'P7A (rule 6): the owner\'s note on parallel work in the handover, or moved word for word with a pointer');
}
// v0.11.144 (owner pick TB1): everything tabled; the Android app is section 0's first item, its five pushes in order, Selene's
// files named; the handover's open items start with the same; the four done lines moved word for word, not left behind
{
    const r1 = readFileSync(path.join(ROOT, 'project/roadmap.md'), 'utf8'), d2 = readFileSync(path.join(ROOT, 'project/roadmap-done-2.md'), 'utf8'), ho = readFileSync(path.join(ROOT, 'project/handover.md'), 'utf8');
    const s0r = r1.slice(r1.indexOf('## 0. '), r1.indexOf('## 1. '));
    // v0.11.172 (P5A, the roadmap under 60 KB): the done plan moved word for word to roadmap-done-3.md; these checks read it there
    const d3m = readFileSync(path.join(ROOT, 'project/roadmap-done-3.md'), 'utf8'); const mv = d3m.slice(d3m.indexOf('### From section 0, as of v0.11.171'), d3m.indexOf('## Moved in v0.11.171'));
    assert(mv.includes('- *(new in v0.11.144') && !s0r.includes('- *(new in v0.11.144') && s0r.includes('Section 0\'s Android app plan (done in v0.11.145–v0.11.150) moved word for word to `roadmap-done-3.md`'), 'P5A: section 0\'s done Android plan moved word for word to roadmap-done-3.md, a pointer left');
    const s0 = mv;
    const first = s0.split('\n').find((l) => l.startsWith('- '));
    assert(/\*\*TABLED: everything else in this roadmap waits\*\*/.test(first || '') && /NEXT: the Android app, Selene's way/.test(first || ''), 'TB1: section 0 opens with the Tabled note and the Android app');
    const order = ['1. **WR + CI', '2. **UP', '3. **EX + NS', '4. **FN', '5. **BL'].map((t) => s0.indexOf(t));
    assert(order.every((x, i) => x > 0 && (i === 0 || x > order[i - 1])), `TB1: the five Android pushes in order (${order.join(', ')})`);
    assert(['`MainActivity.java`', '`android.yml`', '`io.github.hufle.boneandash`', '`BoneAndAsh.apk`', '`android-latest`', '`hufle-beep/Long-patience`'].every((t) => s0.includes(t)), 'TB1: the plan names Selene\'s files, the app ID, the APK and the release');
    const ho0 = ho.slice(ho.indexOf('## Open items'));
    // v0.11.150 (BL1): the app done, the tabling ends: the handover's open items start with that; the Tabled bullet moved to history-18.md
    const h18 = readFileSync(path.join(ROOT, 'project/history-18.md'), 'utf8'), d3 = readFileSync(path.join(ROOT, 'project/roadmap-done-3.md'), 'utf8');
    assert(/^- \*\*The Android app: done\*\* \(v0\.11\.145–v0\.11\.150/m.test(ho0.split('\n').slice(2).join('\n')) && ho0.indexOf('**The tabling ends**') < ho0.indexOf('**Group d') && !ho0.includes('**TABLED') && h18.includes('- **TABLED: everything below waits until the Android app is done**'), 'BL1: the handover\'s open items start with the app done and the tabling ended; the Tabled bullet in history-18.md');
    assert(s0.includes('5. **BL, comfort:** **Done in v0.11.150**') && s0.includes('**the tabling ends**'), 'BL1: the roadmap marks push 5 done and the tabling ended');
    for (const t of ['v0.11.143, owner picks NF1, RN1', 'v0.11.142, owner pick CV1', 'v0.11.141, owner picks FX1, RW1']) assert(d3.includes(`- *(new in ${t}`) && !r1.includes(`- *(new in ${t}`), `BL1 (the roadmap under 60 KB): the done line of ${t.split(",")[0]} moved to roadmap-done-3.md`);
    for (const t of ['v0.11.140, owner picks FM2, RV1', 'v0.11.133, owner picks FP2, RF1', 'v0.11.132, owner picks PL1, E1', 'v0.11.119, pick NP1']) assert(d2.includes(`- *(new in ${t}`) && !r1.includes(`- *(new in ${t}`), `TB1 (TR): the done line of ${t.split(",")[0]} moved to roadmap-done-2.md`);
}
// v0.11.74 (group i round 1, I1; v0.11.75: round 2's wave 1, W1; v0.11.76: wave 2, V1; v0.11.78: read across the research parts, S1): every group i candidate in project/research.md is placed in the roadmap, and every roadmap line marked "from group i" (or "from group i round 2") names a real one
{
    const parts = readdirSync(path.join(ROOT, 'project')).filter((f) => /^research(-\d+)?\.md$/.test(f)).sort((x, y) => (x === 'research.md' ? 1 : Number(x.match(/\d+/)[0])) - (y === 'research.md' ? 1 : Number(y.match(/\d+/)[0])));
    assert(parts[0] === 'research.md' && parts[1] === 'research-2.md' && parts.every((f, i) => i === 0 || f === `research-${i + 1}.md`), `research: the parts run research.md, research-2.md, ... with no gap (${parts.join(', ')})`);
    for (const [i, f] of parts.entries()) if (i + 1 < parts.length) assert(/\*Continued in `[^`]+`/.test(readFileSync(path.join(ROOT, 'project', f), 'utf8').trimEnd().split('\n').pop()) && readFileSync(path.join(ROOT, 'project', f), 'utf8').trimEnd().split('\n').pop().includes(parts[i + 1]), `research: ${f} ends pointing on to ${parts[i + 1]}`);
    const research = parts.map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8')).join('\n');
    const roadmap = [...ROADMAP_PARTS, 'roadmap-done-5.md'].map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8')).join('\n'); // v0.11.88 (S1): every open part; v0.11.258 (PL-A): and group f's done lines (#100, #112), moved word for word to roadmap-done-5.md
    const a = research.indexOf('## Group i — the games, round 1');
    const r2 = research.indexOf('## Group i, round 2');
    const w2 = research.indexOf('### Wave 2: cultivation and xianxia games');
    const b = research.indexOf('\nSources: round 1,', w2);
    assert(a > 0 && r2 > a && w2 > r2 && b > w2, 'research: group i round 1, round 2, its wave 2 and the Sources line exist, in that order');
    const rows = new Set([...research.slice(a, b).matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1])));
    const refs = new Set();
    for (const [, list] of roadmap.matchAll(/from group i(?: round 2)?; `research\.md` ([^)]*)\)/g)) { // the marker's own list, not the other groups' numbers in the line's text
        for (const m of list.matchAll(/#(\d+)(?:–#(\d+))?/g)) { const lo = Number(m[1]); const hi = Number(m[2] || m[1]); for (let n = lo; n <= hi; n++) refs.add(n); }
    }
    const nowhere = [...research.slice(a, b).matchAll(/^\| (\d+) \|.*\| nowhere[^|]*\|$/gm)].map((m) => Number(m[1]));
    const missing = [...rows].filter((n) => !refs.has(n) && !nowhere.includes(n));
    const unknown = [...refs].filter((n) => !rows.has(n));
    assert(rows.size >= 104 && Math.min(...rows) === 43 && Math.max(...rows) === 42 + rows.size, `research: group i numbers from #43, none skipped (${rows.size} rows, up to #${Math.max(...rows)})`);
    assert(missing.length === 0, `roadmap: every group i candidate placed or marked "nowhere" (missing: ${missing.join(', ') || 'none'})`);
    assert(unknown.length === 0, `roadmap: every "from group i" number is a group i row (unknown: ${unknown.join(', ') || 'none'})`);
    for (const f of ['a-loops', 'b-narrative', 'c-incrementals', 'd-closed', 'brief', 'e-dating', 'f-vn', 'brief-2', 'g-idle', 'h-rpg', 'i-chinese', 'brief-3']) assert(existsSync(path.join(ROOT, `project/research/group-i-${f}.md`)), `research: project/research/group-i-${f}.md kept`);
}
// v0.11.77 (owner pick F1): the flight canon is in lore.md (James, Yuki, the world: locals from Golden Core) and the roadmap carries its story, mechanics and walk-times lines
{
    const lore = readFileSync(path.join(ROOT, 'project/lore.md'), 'utf8');
    const roadmap = ROADMAP_PARTS.map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8')).join('\n'); // v0.11.88 (S1): every open part
    const sec = (h) => { const a = lore.indexOf(h); const b = lore.indexOf('\n## ', a + 1); return a < 0 ? '' : lore.slice(a, b < 0 ? undefined : b); };
    assert(/\*\*Flight \(owner[^\n]*Foundation[^\n]*realm and GU/.test(sec('## James Green')), 'lore: James flies from Foundation, limited only by realm and GU');
    assert(/\*\*Flight:\*\*/.test(sec('## Yuki')), 'lore: Yuki flies too');
    assert(/\*\*Flight on this world[^\n]*Golden Core/.test(sec('## The world')), 'lore: locals fly only from Golden Core');
    for (const t of ['**Story, flight', "**Flight's walk times"]) assert(roadmap.includes(t), `roadmap: the flight line "${t.replace(/\*/g, '')}" is there`);
    assert(readFileSync(path.join(ROOT, 'project/roadmap-done-3.md'), 'utf8').includes('**Mechanics, flight'), 'roadmap: the flight line "Mechanics, flight" (done) is in roadmap-done-3.md since v0.11.151 (WD1)');
}
// v0.11.164 (owner pick N1): the realm sheet in lore.md: one row per realm in the game's order (11–14 in one row), the owner's bands and N1's placements
{
    const lore = readFileSync(path.join(ROOT, 'project/lore.md'), 'utf8');
    const { REALM_STEP_NAMES } = await import(new URL('../js/core/formulas.js', import.meta.url));
    const a = lore.indexOf('## The realms (the realm sheet)'), b = lore.indexOf('\n## ', a + 1);
    const sheet = a < 0 ? '' : lore.slice(a, b < 0 ? undefined : b);
    const rows = [...sheet.matchAll(/^\| (\d+(?:–\d+)?) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/gm)].map((m) => ({ n: m[1], name: m[2].trim(), who: m[3], many: m[4] }));
    assert(sheet && rows.length === 12, `lore: the realm sheet has 12 rows, 0–10 and 11–14 (${rows.length})`);
    const names = rows.slice(0, 11).map((r) => r.name);
    assert(names.join('|') === REALM_STEP_NAMES.slice(0, 11).join('|') && rows.slice(0, 11).every((r, i) => r.n === String(i)), 'lore: the sheet names realms 0–10 as REALM_STEP_NAMES, in order');
    assert(rows[11]?.n === '11–14' && /Immortal realms/.test(rows[11].who), 'lore: realms 11–14 in one row, the Immortal realms');
    const band = (n) => `${rows[n]?.who} ${rows[n]?.many}`;
    assert(/nearly all/.test(band(0)) && /hundreds/.test(band(1)) && /uncommon/.test(band(2)) && /uncommon/.test(band(3)) && /rare/.test(band(4)) && /very rare/.test(band(5)) && /very rare/.test(band(6)) && /almost unprecedented/.test(band(7)), 'lore: the owner\'s bands and N1\'s placements (2–3 uncommon, 5–6 very rare)');
    assert([8, 9, 10, 11].every((n) => /nobody documented/.test(band(n))), 'lore: realms 8–14 have no documented person');
    assert(/Shen Qiu/.test(band(2)) && /BT_REALMS/.test(sheet) && /#122/.test(sheet), 'lore: Shen Qiu at Core Formation; the sheet points to BT_REALMS and #122');
    // v0.11.165 (owner pick LO1, 14:17 / 14:21): the lifespans fit Shen Qiu's three hundred years; this world's lifespans are normal, James's world the outlier; his people climb by the same multiples
    const life = [...sheet.matchAll(/^\| (\d+(?:–\d+)?) \| [^|]+ \| [^|]+ \| [^|]+ \| ([^|]+) \|/gm)].map((m) => m[2]);
    const shen = (readFileSync(path.join(ROOT, 'js/story/act1_return.js'), 'utf8').match(/I have lived (\w+) hundred years/) || [])[1];
    assert(shen === 'three' && /four hundred \(Shen Qiu has lived three hundred\)/.test(life[2] || ''), `lore: Core Formation's lifespan above Shen Qiu's ${shen} hundred years (${life[2]})`);
    const words = { 'a hundred and twenty': 120, 'four hundred': 400, 'five hundred': 500, 'six hundred': 600, 'seven hundred': 700, 'nine hundred': 900, 'a thousand': 1000, sixty: 60 };
    const yrs = life.slice(0, 8).map((t) => Object.entries(words).find(([w]) => t.includes(w))?.[1] ?? NaN);
    assert(yrs.every((y, i) => y > (yrs[i - 1] ?? 0)), `lore: the lifespans rise with every realm 0–7 (${yrs.join(', ')})`);
    assert(/\*\*The lifespans are normal\*\*/.test(sheet) && !/short for the realm/.test(sheet), 'lore: the sheet calls the lifespans normal (owner 14:17)');
    const mult = (sheet.match(/\*\*James's people climb by the same multiples\*\*[^\n]*/) || [''])[0];
    const pairs = [...mult.matchAll(/×(\d+)(⅔|⅓)?[^(]*\((?:about )?([\d,]+)–([\d,]+)/g)].map((m) => [Number(m[1]) + (m[2] === '⅔' ? 2 / 3 : m[2] === '⅓' ? 1 / 3 : 0), Number(m[3].replace(',', '')), Number(m[4].replace(',', ''))]);
    assert(pairs.length === 7 && pairs.every(([k, lo, hi]) => Math.abs(lo - 800 * k) <= 0.02 * 800 * k + 5 && Math.abs(hi - 900 * k) <= 0.02 * 900 * k + 5), `lore: James's people's spans are 800–900 × each rung's multiple (${pairs.map((p) => p.join('/')).join('; ')})`);
    const ks = [2, 400 / 60, 500 / 60, 10, 700 / 60, 15, 1000 / 60];
    assert(pairs.every(([k], i) => Math.abs(k - ks[i]) < 0.01), 'lore: each multiple is the rung\'s span over a mortal\'s sixty');
    const world = (lore.match(/^- \*\*James's place in it[^\n]*/m) || [''])[0];
    assert(/James's world is the outlier/.test(world) && /ship_log3/.test(world) && /Act 2/.test(world), 'lore: James\'s world is the outlier; ship_log3 marked for the rewrite; an Act 2 plot point');
    assert(/pure, and that pure Qi was part of their evolution/.test(lore), 'lore: why his people live long (pure Qi, their evolution)');
}
// v0.11.79 (owner pick R1): hard rule 8, Claude uploads the changed docs itself after every push (no question), in CLAUDE.md and the working agreement
{
    const rules = readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
    const nums = [...rules.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    assert(nums.length === 11 && nums.every((n, i) => n === i + 1), `CLAUDE.md: eleven hard rules, numbered 1 to 11 (${nums.join(', ')})`); // v0.11.178 (U1): rule 11, usage
    // v0.11.178 (owner pick U1): cold reviews on Opus (rule 9), lean Fable packets (rule 10), a new chat per push (rule 4), small per-push docs (rule 8), usage (rule 11)
    const rule = (n) => (rules.match(new RegExp(`^${n}\\. .*$`, 'm')) || [''])[0];
    assert(/model `opus`/.test(rule(9)) && /review-checklist\.md/.test(rule(9)) && /tools\/mutate\.mjs/.test(rule(9)) && /canon-card\.md/.test(rule(10)) && /about 10 KB/.test(rule(10)) && /A new chat every three pushes/.test(rule(4)) /* v0.11.245 (SP1 NC2) */ && /under 20 KB/.test(rule(8)) && /^11\. \*\*Usage\*\*/m.test(rules) && /excerpts only/.test(rule(11)), 'U1: rules 4, 8, 9, 10 and 11 say what U1 picked');
    for (const f of ['project/review-checklist.md', 'project/review-checklist-code.md', 'project/canon-card.md']) assert(existsSync(path.join(ROOT, f)) && Buffer.byteLength(readFileSync(path.join(ROOT, f))) < 12000, `U1: ${f} there and short`);
    const r8 = (rules.match(/^8\. .*$/m) || [''])[0];
    assert(/Claude uploads the changed `project\/` docs/.test(r8) && !/asks\*\* whether/.test(r8) && /project\/research\/` stays repo only/.test(r8), 'CLAUDE.md: rule 8 says Claude uploads the changed docs itself, research/ repo only, no question');
    assert(readFileSync(path.join(ROOT, 'project/working-agreement.md'), 'utf8').includes('**Since v0.11.79 (owner 2026-11-08 20:52'), 'working-agreement: the mirror rule of v0.11.79 is there');
    // v0.11.93 (owner pick A): every option, everywhere, laid out in full, checked before sending (rule 1 and the working agreement)
    const r1 = (rules.match(/^1\. .*$/m) || [''])[0], wa = readFileSync(path.join(ROOT, 'project/working-agreement.md'), 'utf8');
    assert(/\*\*Every option, everywhere\*\*/.test(r1) && /\*\*Checked before sending:\*\*/.test(r1) && /open, options later/.test(r1), 'CLAUDE.md: rule 1 has every option, everywhere, and the check before sending (v0.11.93)');
    assert(wa.includes('**Every option, everywhere**') && wa.includes('**Checked before sending:**'), 'working-agreement: the v0.11.93 layout rule is there');
}
// v0.11.80 (owner pick L1): the fight lab
{
    // v0.11.257 (owner pick P27-A, FL; P25-A review L3): the rot ape's row by its tune (below Core Formation its own row), every other fight by its id
    { const { LOW_REALM, TUNE_LOW } = await import('../js/story/act1_tune.js');
      const low = Object.keys(TUNE_LOW);
      assert(low.includes('rot_ape') && [0, LOW_REALM - 1, null, undefined].every((r) => labId('rot_ape', r) === 'rot_ape@low') && [LOW_REALM, LOW_REALM + 1, 14].every((r) => labId('rot_ape', r) === 'rot_ape') && ['collectors', 'mire_serpent', 'toString', 'constructor'].every((id) => labId(id, 0) === id && labId(id, 5) === id), `fightlab (FL): the rot ape's row below Core Formation rot_ape@low, from it rot_ape; others and inherited names keep their id (TUNE_LOW ${low})`);
      assert(readFileSync(path.join(ROOT, 'tools/lib/fightlab.mjs'), 'utf8').includes('return { id: labId(enc.id, g.james.realm), power:'), 'fightlab (FL): a sample takes its row from labId and James\'s realm'); }
    // made-up samples: two fights; `a` easy under everything, `b` won only by blade (guard never pays), darts and spear never open
    const S = (id, power, gu, res, i = 0) => ({ id, power, gu, cu: 1, realm: 0, seed: i, at: 0, res: { smart: null, random: null, blade: null, dart: null, needle: null, spear: null, guard: null, ...res } });
    const all = (w) => Object.fromEntries(Object.keys(TACTICS).map((t) => [t, [w, 4, 80]]));
    const easy = Array.from({ length: 12 }, (_, i) => S('a', i, 5 + i, all(1), i));
    const hard = Array.from({ length: 12 }, (_, i) => S('b', i, 3 + i, { smart: [i >= 6 ? 1 : 0, 6, 50], random: [0, 9, 0], blade: [1, 5, 70], dart: [1, 5, 70], needle: [0, 9, 0], spear: [1, 5, 70], guard: [i % 2, 7, 60] }, 100 + i));
    const sa = summarize('a', easy), sb = summarize('b', hard);
    assert(rank({ tier: 2, level: 5 }) === 15 && rankLabel(15) === 'T2 L5' && rankLabel(1) === 'T1 L1' && rankLabel(100) === 'T10 L10', 'fightlab: ranks and their labels');
    assert(sa.flags.includes('easy') && !sa.flags.includes('one-tactic') && sa.flags.includes('blade-best'), `fightlab: an easy fight is flagged easy, not one-tactic (${sa.flags})`);
    assert(sb.flags.includes('one-tactic') && sb.flags.includes('guard-never') && sb.flags.includes('blade-best') && !sb.flags.includes('easy'), `fightlab: one tactic always wins, guard never pays (${sb.flags})`);
    assert(sb.best.join() === 'blade,dart,spear' && sb.bestShared.join() === 'blade,dart,spear' && sb.same.blade.win === 100 && sb.same.guard.win === 50 && sb.same.guard.hp === 60, `fightlab: the best fixed tactics, fewest rounds first, and their numbers (${sb.best})`);
    const th = thirds(hard);
    assert(th.map((p) => p.length).join() === '4,4,4' && th[0].every((s) => s.power < 4) && th[2].every((s) => s.power >= 8), 'fightlab: thirds by power (weak, middle, strong)');
    assert(sb.third.map((v) => v.win).join() === '0,50,100', `fightlab: smart's win % by thirds (${sb.third.map((v) => v.win)})`);
    assert(guNeeded(hard, 90, 3) === 9 && guNeeded(hard, 90, 20) === null, `fightlab: the GU from which smart wins 90 % (${guNeeded(hard, 90, 3)}), none with too few samples`);
    const t1 = tacticStats(hard, 'needle'), t0 = tacticStats(easy.map((s) => ({ ...s, res: { ...s.res, spear: null } })), 'spear');
    assert(t1.win === 0 && t1.hp === null && t0 === null, 'fightlab: a tactic never won has no HP left; one never open has no stats');
    const few = summarize('c', hard.slice(0, 5));
    assert(few.same === null && few.best.length === 0 && !few.flags.includes('blade-best'), 'fightlab: too few same states: no comparison flags');
    const sum = summarizeAll([...hard, ...easy, S('z', 1, 1, all(1))], 10);
    assert(sum.fights.map((f) => f.id).join() === 'a,b' && sum.few.join() === 'z (1)', 'fightlab: fights in name order, the thin ones listed apart');
    const lines = tableLines(sum).join('\n');
    assert(/^a\s+12 /m.test(lines) && /won at least 99% under every tactic: 1 of 2 \(a\)/.test(lines) && /tied for it: blade 2, dart 2, needle 1, spear 2, guard 1/.test(lines) && /Too few samples.*z \(1\)/.test(lines), 'fightlab: the table, the same-states block and the flags as text');
    const close = summarize('d', Array.from({ length: 12 }, (_, i) => S('d', i, 5, { blade: [i ? 1 : 0, 4, 70], dart: [1, 4, 80], needle: [1, 4, 70], spear: [1, 4, 70], guard: [1, 9, 90] }, 200 + i)));
    assert(close.best.join() === 'dart,needle,spear,guard' && close.bestShared.join() === 'dart' && !close.flags.includes('blade-best'), `fightlab: ties on rounds broken by HP left (blade at 91.7% out of the best) (${close.best})`);
    const tie = summarize('e', Array.from({ length: 12 }, (_, i) => S('e', i, 5, all(1), 300 + i)));
    assert(tie.bestShared.length === 5, 'fightlab: a full tie is shared by every fixed tactic');
    const tl = tableLines({ fights: [close, tie], few: [] }).join('\n');
    assert(/ 91\.7% r4/.test(tl) && /alone: blade 0, dart 1,.*tied for it: blade 1, dart 1, needle 1, spear 1, guard 1 \(of 2 fights\)/.test(tl), 'fightlab: win % to one decimal (91.7, not 92); the quickest tally alone and tied');
    assert(isOneMove('Error\n    at combatHooks.before (x)\n    at instantWin (file:///g/js/core/game.js:645:5)') && !isOneMove('Error\n    at startCombat (file:///g/js/core/game.js:654:51)'), 'fightlab: the one-move finish told from a real fight by its call');
    assert([...hard].reverse().sort(sampleOrder).map((s) => s.seed).join() === hard.map((s) => s.seed).join(), 'fightlab: samples sort into one fixed order');
    const r1 = stream(7), r2 = stream(7);
    assert(Array.from({ length: 20 }, () => r1(6)).join() === Array.from({ length: 20 }, () => r2(6)).join(), 'fightlab: the random stream repeats for the same seed');
    assert(FIXED.every((t) => TACTICS[t]) && !FIXED.includes('smart') && !FIXED.includes('random'), 'fightlab: the fixed tactics are tactics, smart and random not among them');

    // one fight on a real state: the jackals, prepared by the story's hook, played blade only by hand and by the lab
    const prepare = combatHooks.before, lose = combatHooks.lose;
    const g = ensureBars(newGame(4242, { closed: true }));
    g.james.gu.level = 6; g.james.skills['Convergence Use'].level = 8;
    const ch = SCENES.night_attack.choices.find((c) => c.combat);
    const enc = prepare(g, ch.combat(g));
    const before = JSON.stringify(g);
    const lab = playFight(g, enc, 'blade', 1);
    const h = structuredClone(g); combatHooks.before = null; combatHooks.lose = null;
    startCombat(h, structuredClone(enc)); let o = null, t = 0; for (; t < 400 && h.combat; t++) { o = combatStep(h, 'blade'); if (o?.done) break; }
    combatHooks.before = prepare; combatHooks.lose = lose;
    assert(lab && lab.win === (o?.done === 'win') && lab.rounds === t + 1, `fightlab: the lab's fight = the same fight by hand (${JSON.stringify(lab)} vs ${o?.done} in ${t + 1})`);
    assert(JSON.stringify(g) === before && combatHooks.before === prepare && combatHooks.lose === lose, 'fightlab: the state it copied is untouched, the story hooks put back');
    assert(playFight(g, enc, 'spear', 1) !== null && JSON.stringify(playFight(g, enc, 'random', 9)) === JSON.stringify(playFight(g, enc, 'random', 9)), 'fightlab: the spear open at T1 L8; random repeats for one seed');
    const weak = structuredClone(g); weak.james.skills['Convergence Use'].level = 2;
    const sw = sampleFight(weak, enc, 3);
    assert(sw.res.dart === null && sw.res.spear === null && sw.res.blade && sw.id === 'jackals' && sw.gu === 6 && sw.cu === 2, 'fightlab: darts and the spear not counted where James can\'t sing them');

    // a tiny real run: 1 worker = 2 workers, and the bots' own fights are the same as without the lab
    const [l1, l2, plain] = await labPending;
    assert(l1.code === 0 && l2.code === 0 && l1.j && l2.j, `fightlab: the tiny runs finish (exit ${l1.code} / ${l2.code})\n${l1.log.slice(-400)}`);
    if (l1.j && l2.j) {
        assert(JSON.stringify(l1.j.fights) === JSON.stringify(l2.j.fights) && l1.j.states === l2.j.states && l1.j.states > 50, `fightlab: 1 worker = 2 workers (${l1.j.states} / ${l2.j.states} fight states)`);
        assert(l1.j.fights.some((f) => f.id === 'ya_brawl') && l1.j.fights.some((f) => f.id === 'jackals'), 'fightlab: the tiny run meets the jackals and Ya');
        let pj = null; try { pj = JSON.parse(readFileSync(path.join(TMP, 'lab-plain.json'), 'utf8')); } catch { /* below */ }
        const norm = (o) => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
        for (const k of ['fights', 'deaths', 'byCoil']) assert(plain.code === 0 && pj && norm(pj[k]) === norm(l1.j.bots[k]) && norm(pj[k]) === norm(l2.j.bots[k]), `fightlab: the bots' own ${k} are the same with and without the lab (1 and 2 workers)`);
        assert(Number.isInteger(l1.j.oneMove) && l1.j.oneMove === l2.j.oneMove, `fightlab: one-move finishes counted apart, not as fights (${l1.j.oneMove})`);
        assert(/^Fight lab: 12 bot games/m.test(l1.log) && /Flags:/.test(l1.log), 'fightlab: the report prints its header and flags');
    }
}
// v0.11.126 (NQ1 review, LN): tools/lint.mjs reads scene texts that are functions of the state, on its sample states: an old mode
// name that only the great root-kin's line carries fails the lint; the real game passes.
{
    const real = (() => { try { return { code: 0, out: execFileSync(process.execPath, ['tools/lint.mjs'], { cwd: ROOT, encoding: 'utf8' }) }; } catch (e) { return { code: e.status ?? 1, out: String(e.stdout || e) }; } })();
    assert(real.code === 0 && /texts and labels that are functions read on 19 sample states/.test(real.out), `LN; v0.11.192 (K1, TL: 9 + 10 later-Coil states): the lint reads function texts and passes on the game (${real.out.split('\n').slice(-2).join(' ')})`);
    // v0.11.192 (RV1, TG4): the later-Coil states are really there: already human, the snapshot with her human shape, QH alone
    for (const f of ['tools/lint.mjs', 'tools/textlint.mjs']) {
        const src = readFileSync(path.join(ROOT, f), 'utf8');
        assert(/for \(const last of \['sister', 'lover', 'wait'\]\)/.test(src) && /if \(form === 'human'\) g\.flags\.yk_form_before = 'human';/.test(src) && /if \(form !== 'tiger'\) g\.coil\.snap = \{ \.\.\.g\.coil\.snap, yuki: \{ \.\.\.g\.coil\.snap\.yuki, realm: 7 \} \};/.test(src) && /g\.flags\.yk_last = 'wait'; g\.flags\.yk_form_before = 'human';/.test(src), `LN (RV1 TG4): ${f} has the later-Coil states`);
    }
    const dir = path.join(TMP, 'lint'); mkdirSync(path.join(dir, 'tools'), { recursive: true });
    cpSync(path.join(ROOT, 'js'), path.join(dir, 'js'), { recursive: true });
    writeFileSync(path.join(dir, 'tools', 'lint.mjs'), readFileSync(path.join(ROOT, 'tools', 'lint.mjs')));
    const pro = path.join(dir, 'js', 'story', 'prologue.js');
    const src = readFileSync(pro, 'utf8');
    assert(src.includes('a cat the size of a tiger at his side'), 'LN: the planted line is there to change');
    writeFileSync(pro, src.replace('a cat the size of a tiger at his side', 'a cat in task mode at his side'));
    let code = 0, out = '';
    try { out = execFileSync(process.execPath, ['tools/lint.mjs'], { cwd: dir, encoding: 'utf8' }); } catch (e) { code = e.status ?? 1; out = String(e.stdout || e); }
    assert(code === 1 && /gao_talked: text/.test(out), `LN: an old name in the great root-kin's line only fails the lint (exit ${code})`);
}
// v0.11.132 (owner picks PL1, E1): the story-text lint's rules (tools/lib/textlint.mjs) on made-up texts, the lint on the game
// and on a copy with planted faults (log only: exit 0 either way; the snapshot notes the change), and the bot models' Act 1
// endings, repeated screens and their saved copy (a planted copy far from the run gives a log-only NOTE).
{
    const passage = 'The wind comes down off the ridge and the reeds bow to it like tired old courtiers before a minor prince.';
    assert(!shingles('and then he said to the').size && shingles(passage).size > 5, 'SH: a chunk of small words is no chunk; a real sentence has many');
    const sh = reusedPassages([{ id: 'a', t: `First. ${passage}` }, { id: 'b', t: `${passage} Second.` }, { id: 'c', t: 'Nothing alike at all, honestly, by any measure.' }]);
    assert(sh.reused.length === 1 && sh.reused[0][0] === 'a~b' && sh.scenes.size === 2, `SH: two scenes sharing a sentence are one reused passage (${JSON.stringify(sh.reused)})`);
    const fv = favouritePhrases(['alpha', 'bravo', 'charlie', 'delta'].map((id) => ({ id, t: `${id} four hundred pounds of cat. Mei Lin walks. The Crimson Lotus waits.` })));
    assert(fv.length === 1 && fv[0].phrase === 'four hundred pounds of cat' && fv[0].scenes.size === 4, `FV: overlapping runs chained into one phrase; names ("mei lin walks") and canon terms ("the crimson lotus waits") left out (${fv.map((f) => f.phrase).join(' | ')})`);
    assert(favouritePhrases(['p', 'q', 'r'].map((id) => ({ id, t: 'four hundred pounds of cat' }))).length === 0, 'FV: three scenes are not enough');
    const tc = tics('The water was cold. The water was dark. The water was everywhere, and the water won.');
    assert(tc.length === 1 && tc[0].phrase === 'the water was' && tc[0].n === 3, `TC: a 3-word tic, its 2-word part not counted again (${JSON.stringify(tc)})`);
    assert(!tics('the cat the cat the cat').length, 'TC: no tic without a word of 5+ letters');
    assert(!broken('Slowly.\n\n*\n\nMuch later, *the lamp* is out.').length, 'BD: the lone "*" scene break and paired asterisks are fine');
    assert(broken('She says *nothing.').includes('asterisks') && broken('Gold: ${gold}').includes('code') && broken('undefined').includes('code') && broken(`${'a'.repeat(31)}`).includes('glued'), 'BD: a stray asterisk, a template leftover, undefined, glued words');
    assert(spacing('Zero snacks.  ') && spacing('One.\n\n\n\nTwo.') && !spacing('One.\n\nTwo.'), 'BD: spacing the screen drops counted apart');
    const d = snapshotDiff({ totals: { tics: 2 }, areas: { wilds: { tics: 1 } } }, { totals: { tics: 3 }, areas: { wilds: { tics: 1 }, ashfall: { tics: 2 } } });
    assert(d.length === 2 && d[0].where === 'all' && d[0].was === 2 && d[0].now === 3 && d[1].where === 'ashfall' && d[1].was === null, `SN: the totals first, then the areas that changed (${JSON.stringify(d)})`);
    assert(shareNote({ v: 50, n: 500 }, { v: 53, n: 500 }) === 'ok' && shareNote({ v: 50, n: 500 }, { v: 62, n: 500 }) === 'note' && shareNote({ v: 50, n: 60 }, { v: 62, n: 60 }) === 'ok' && shareNote({ v: 50, n: 40 }, { v: 90, n: 500 }) === 'ok',
        'EB: a note past 5 points and 3 × the noise (12 points on 60 games is noise), never under 50 samples');

    const run = (cwd, args = []) => { try { return { code: 0, out: execFileSync(process.execPath, ['tools/textlint.mjs', ...args], { cwd, encoding: 'utf8' }) }; } catch (e) { return { code: e.status ?? 1, out: String(e.stdout || e) }; } };
    const game = run(ROOT);
    assert(game.code === 0 && /^text lint \(log only\): \d+ reused passages, \d+ favourite phrases, \d+ tics, 0 broken, \d+ unrendered; 0 changed against the snapshot$/m.test(game.out), `E1: the text lint runs on the game, 0 broken, the snapshot current (${game.out.trim().split('\n').pop()})`);
    assert(/; sx 5 lines \/ \d+ words \(twice 0, shared with a scene \d+, tics 0, broken 0/.test(game.out), 'E1 (v0.11.198, S1 RV1 TG4): the carried road texts (act1_return.js SX) are a lint pool, 5 lines, no tics');
    const dir = path.join(TMP, 'textlint'); mkdirSync(path.join(dir, 'tools', 'lib'), { recursive: true });
    cpSync(path.join(ROOT, 'js'), path.join(dir, 'js'), { recursive: true });
    for (const f of ['tools/textlint.mjs', 'tools/lib/textlint.mjs', 'tools/text-baseline.json']) writeFileSync(path.join(dir, f), readFileSync(path.join(ROOT, f)));
    const pro = path.join(dir, 'js', 'story', 'prologue.js');
    const src = readFileSync(pro, 'utf8');
    assert(src.includes('a cat the size of a tiger at his side'), 'E1: the planted line is there to change');
    writeFileSync(pro, src.replace('a cat the size of a tiger at his side', 'a cat the size of a ${tiger} at his side'));
    const bad = run(dir);
    assert(bad.code === 0 && /BD broken text: 1: gao_talked \(text\) code/.test(bad.out) && /NOTE {2}text \(log only\): all broken 0 → 1/.test(bad.out) && /NOTE {2}text \(log only\): prologue\+shared broken 0 → 1/.test(bad.out),
        `E1: a template leftover in the great root-kin's line is counted and noted against the snapshot, log only (exit ${bad.code})`);
    // v0.11.134 (owner pick LP2, LR): the line pools: counted on made-up pools; printed on the game; a planted fault in a memory line noted, log only
    const pc = poolCounts({ a: ['One two three.', 'One two three.', `Here: ${passage}`], b: ['She says *nothing.'] }, [`Scene. ${passage}`]);
    assert(pc.a.lines === 3 && pc.a.dupes === 1 && pc.a.sceneShared === 1 && pc.b.broken === 1 && pc.a.words === 7 + passage.split(' ').length && pc.b.lines === 1, `LR: lines, a line twice, a line sharing a scene's passage, broken (${JSON.stringify(pc)})`);
    const dp = snapshotDiff({ totals: {}, areas: {} }, { totals: {}, areas: {}, pools: { memory: { lines: 24 } } });
    assert(dp.length === 1 && dp[0].where === 'pool memory' && dp[0].was === null && dp[0].now === 24, `LR: a pool not in the snapshot is noted (${JSON.stringify(dp)})`);
    assert(/LR line pools: memory 48 lines \/ \d+ words \(twice 0, shared with a scene \d+, tics \d+, broken 0, spacing 0\); yuki \d+ lines \/ \d+ words .*; aptitude 1 lines \/ 5 words/.test(game.out), `LR: the lint reads the memory lines, Yuki's haul lines and the aptitude reply (${(game.out.match(/LR line pools.*/) || [''])[0]})`);
    { const m = game.out.match(/; yuki (\d+) lines/); assert(m && Number(m[1]) >= 57, `P3A (RV1, TG7): the lint reads Ashfall's haul lines in every form (${m?.[1]})`); }
    writeFileSync(pro, src); // the planted line back
    { // v0.11.200 (owner pick D1, S5): the result lines as a pool (the reply part, no gains), the card's tics in them, and a planted fault in one noted
        const m = game.out.match(/; results (\d+) lines \/ (\d+) words \(twice 0, shared with a scene \d+, tics \d+, broken 0, spacing 0\)/);
        assert(m && Number(m[1]) >= 250 && Number(m[2]) >= 5000, `D1 (S5): the lint reads the result lines (${m ? `${m[1]} lines, ${m[2]} words` : 'no results pool'})`);
        assert(/CT the canon card's tics in the result lines: \d+/.test(game.out), 'D1 (S5): the card\'s tics in the result lines are printed (CT)');
        const { splitLine } = await import('../js/core/replies.js');
        assert(splitLine('Supper: +25 satiety.').reply === '', 'D1 (S5): a gain line gives no result text (the pool reads the reply part only)');
        const from = 'it\'s almost like working in a lab again'; // v0.11.202 (D1, a12): "for a moment" cut from the line
        assert(src.includes(from), 'D1 (S5): the planted result line is there to change');
        writeFileSync(pro, src.replace(from, `${from} \\$${'{'}lab}`)); // a literal \${lab} in the template source
        const rb = run(dir);
        assert(rb.code === 0 && /NOTE {2}text \(log only\): pool results broken 0 → 1/.test(rb.out) && !/NOTE {2}text \(log only\): all broken/.test(rb.out), `D1 (S5): a template leftover in forage's result is noted in the results pool, log only, the scenes untouched (exit ${rb.code})`);
        writeFileSync(pro, src);
    }
    { // v0.11.163 (owner pick TL2): the used-today sample reads a hunt's return line (shown only after a hunt option is used today)
        const bl = path.join(dir, 'js', 'story', 'act1_blackroot.js'); const bsrc = readFileSync(bl, 'utf8');
        assert(bsrc.includes('The pool has gone flat again.'), 'TL2: the planted return line is there to change');
        writeFileSync(bl, bsrc.replace('The pool has gone flat again.', 'The pool has gone \\${flat} again.'));
        const hb = run(dir);
        assert(hb.code === 0 && /BD broken text: 1: dw_hunt \(text\) code/.test(hb.out), `TL2: a template leftover in the Drowned Wood's return line is counted (${(hb.out.match(/BD broken text: [^\n]*/) || [''])[0]})`);
        // RV1 (Opus's L6): the root road's and the Ashen Hills' return lines too
        for (const [from, id] of [['the gravity of a magistrate', 'rr_hunt'], ['and Ya has stopped looking up', 'ah_hunt'] /* v0.11.231 (P4-2, AT): the away version (AW, earlier in the file) shares the first sentence */]) {
            assert(bsrc.includes(from), `TL2: the planted ${id} line is there to change`);
            writeFileSync(bl, bsrc.replace(from, `${from} \\$${'{'}x}`)); // a literal \${x} in the template source
            const h2 = run(dir);
            assert(h2.code === 0 && new RegExp(`BD broken text: 1: ${id} \\(text\\) code`).test(h2.out), `TL2: a template leftover in ${id}'s return line is counted (${(h2.out.match(/BD broken text: [^\n]*/) || [''])[0]})`);
        }
        writeFileSync(bl, bsrc);
    }
    const ag = path.join(dir, 'js', 'story', 'again.js'); const asrc = readFileSync(ag, 'utf8');
    writeFileSync(ag, asrc.replace("'The forest has not rehearsed. You have.',", "'The forest has not rehearsed. ${you} have.',"));
    const badPool = run(dir);
    assert(badPool.code === 0 && /NOTE {2}text \(log only\): pool memory broken 0 → 1/.test(badPool.out) && !/NOTE {2}text \(log only\): all /.test(badPool.out), `LR: a template leftover in a memory line is noted against the pool's snapshot, log only, the scenes untouched (exit ${badPool.code})`);
    writeFileSync(ag, asrc);

    // the bot models: Act 1 endings and repeated screens printed; a saved copy far from the run gives a log-only NOTE
    const md = path.join(TMP, 'models'); mkdirSync(path.join(md, 'tools'), { recursive: true });
    for (const f of ['js', 'tests', 'tools/lib']) cpSync(path.join(ROOT, f), path.join(md, f), { recursive: true });
    writeFileSync(path.join(md, 'tools', 'models-baseline.json'), JSON.stringify({ models: { careful: { endings: { accord: { v: 0, n: 500 }, revelation: { v: 100, n: 500 } }, nights: {}, repeats: { v: 60, n: 5000 } } } }));
    let mo = '', mc = 0;
    try { mo = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful', '--games', '60', '--off', '0', '--workers', '1', '--texts'], { cwd: md, encoding: 'utf8' }); } catch (e) { mc = e.status ?? 1; mo = String(e.stdout || e); }
    const rp = mo.match(/repeated screens \(the same text again in a Coil, shown in full; hubs and menus left out\): (\d+) of (\d+) \([\d.]+%\)(?:: (.*))?/); // v0.11.152 (RP1, SD): the list is empty when nothing repeats (60 Careful games: 0)
    assert(mc === 0 && /Act 1 endings: accord \d+ \/ revelation \d+ \/ victory \d+ \/ taken \d+ \(of 60\)/.test(mo) && rp && Number(rp[2]) > 1000, `E1 (EB, RP): the models print the Act 1 endings and the repeated screens (exit ${mc})`);
    const { TASK_HUBS } = await import('../js/story/task_hubs.js');
    assert(rp && (rp[3] || '').split(', ').filter(Boolean).every((x) => !TASK_HUBS[x.split(' ')[0]]), `E1 (RP): no hub among the repeated screens (${rp?.[3] || 'none'})`);
    assert(/NOTE {2}Act 1 endings \(log only\): careful accord 0% → [\d.]+% \(n 500 → 60\)/.test(mo) && /NOTE {2}repeated screens \(log only\): careful 60% → [\d.]+% of screens/.test(mo), 'E1 (EB): a saved copy far from the run is noted, log only');
}
const RP2_SHA = 'e5088b2cf6accc566581cf0d59f7ff00532bef028e8bef831b2f37295c4aefc2';
const RP3_SHA = '209ef1a2e40b0e12630dddd70618a67cdd098e03107d50a18bd31ad16889b517'; // v0.11.178 (U1, MD): the 102 rows moved to restore-points-3.md, as moved (part 3 never changes) // v0.11.158 (RV1, RT): the 91 rows moved to restore-points-2.md, as moved (part 2 never changes)
// v0.11.158 (owner pick NX2, RP): restore-points.md split at 0.11.69 (as the changelog in v0.11.105): every row in exactly one part,
// the old ones in restore-points-2.md, newest first in each, the first part under the project tool's limit with a pointer line
{
    const p1 = readFileSync(path.join(ROOT, 'project/restore-points.md'), 'utf8'), p2 = readFileSync(path.join(ROOT, 'project/restore-points-2.md'), 'utf8'), p3 = readFileSync(path.join(ROOT, 'project/restore-points-3.md'), 'utf8');
    const rows = (t) => t.split('\n').filter((l) => /^\| \d+\.\d+\.\d+ \|/.test(l)).map((l) => l.split('|')[1].trim().split('.').map(Number));
    const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const r1 = rows(p1), r2 = rows(p2), r3 = rows(p3), all = [...r1, ...r3, ...r2].map((v) => v.join('.'));
    // v0.11.178 (owner pick U1, MD): 0.11.70–0.11.171 moved word for word to restore-points-3.md; part 1 keeps 0.11.172 on
    assert(r2.length === 91 && r2.every((v) => cmp(v, [0, 11, 69]) <= 0) && r3.length === 102 && r3.every((v) => cmp(v, [0, 11, 70]) >= 0 && cmp(v, [0, 11, 171]) <= 0) && r1.every((v) => cmp(v, [0, 11, 172]) >= 0), `RP: 0.11.69 and before in part 2 (${r2.length}), 0.11.70–0.11.171 in part 3 (${r3.length}), the rest in part 1 (${r1.length})`);
    assert(new Set(all).size === all.length && [r1, r2, r3].every((r) => r.every((v, i) => i === 0 || cmp(r[i - 1], v) > 0)), 'RP: no row twice, each part newest first');
    const { createHash } = await import('node:crypto');
    const rowsOf = (t) => t.split('\n').filter((l) => /^\| \d+\.\d+\.\d+ \|/.test(l)).join('\n');
    const sha2 = createHash('sha256').update(rowsOf(p2)).digest('hex'), sha3 = createHash('sha256').update(rowsOf(p3)).digest('hex');
    assert(r1.length + r2.length + r3.length >= 199 && sha2 === RP2_SHA && sha3 === RP3_SHA, `RT (RV1), MD: every row kept (${r1.length} + ${r3.length} + ${r2.length}), parts 2 and 3 exactly as moved (sha256 ${sha2.slice(0, 12)}…, ${sha3.slice(0, 12)}…)`);
    assert(Buffer.byteLength(p1) <= MIRROR_MAX && p1.includes('Older versions (0.11.70–0.11.171): `restore-points-3.md`') && p1.includes('Older versions (0.11.69 and before): `restore-points-2.md`') && /\| 0\.8\.1 \| `0c82c10` \|/.test(p2) && p3.includes('Newer versions, the fallback branches'), `RP, MD: part 1 under ${MIRROR_MAX} bytes (${Buffer.byteLength(p1)}) with its pointers; part 2 ends at 0.8.1; part 3 points back`);
}

const CL3_SHA = '2eecaa7c2318459eee87ac90e7ca4d6b62c70d0939adf8a19dbb68feaf7aed48';
const CL5_SHA = '0974362369b5cded4631a0ab37c2616d49a49feade744428603b8a4b83303141'; /* v0.11.263 (MD): 0.11.240 moved; v0.11.262 (MD): 0.11.239 moved; v0.11.261 (MD): 0.11.238 moved; v0.11.260 (MD): 0.11.237 moved; v0.11.259 (MD): 0.11.236 moved; v0.11.258 (MD): 0.11.235 moved; v0.11.256 (MD): 0.11.234 moved; v0.11.253 (MD): 0.11.232–0.11.233 moved; v0.11.251 (MD): 0.11.230–0.11.231 moved; v0.11.250 (MD): 0.11.229 moved; v0.11.249 (MD): 0.11.228 moved; v0.11.248 (MD): 0.11.227 moved; v0.11.247 (MD): 0.11.226 moved; v0.11.246: 0.11.225 */ // v0.11.244 (MD): 0.11.224 moved on top of part 5 (53 rows); v0.11.243: 0.11.222–0.11.223; v0.11.242 (MD): 0.11.221 moved on top of part 5 (50 rows); v0.11.241 (MD): 0.11.220 moved on top of part 5 (49 rows); v0.11.239 (MD): 0.11.219 moved on top of part 5 (48 rows); v0.11.238 (MD): 0.11.217–0.11.218 moved on top of part 5 (47 rows); v0.11.237 (MD): 0.11.216 moved on top of part 5 (45 rows); v0.11.236 (MD): 0.11.215 moved on top of part 5 (44 rows); // v0.11.235 (MD): 0.11.213–0.11.214 moved on top of part 5 (43 rows); // v0.11.234 (MD): 0.11.212 moved on top of part 5 (41 rows); // v0.11.233 (MD): 0.11.211 moved on top of part 5 (40 rows); v0.11.232 (MD): 0.11.210 moved on top of part 5 (39 rows); v0.11.231 (MD): 0.11.208 and 0.11.209 moved on top of part 5 (38 rows); v0.11.230 (MD): 0.11.207 moved on top of part 5 (36 rows); v0.11.229 (MD): 0.11.206 moved on top of part 5 (35 rows); v0.11.227 (MD): 0.11.204 and 0.11.205 moved on top of part 5 (34 rows); v0.11.226 (MD): 0.11.203 moved on top of part 5 (32 rows); v0.11.225 (MD): 0.11.201 and 0.11.202 moved on top of part 5 (31 rows); v0.11.224 (MD): 0.11.200 moved on top of part 5 (29 rows); v0.11.223 (MD): 0.11.199 moved on top of part 5 (28 rows); v0.11.222 (MD): 0.11.198 moved on top of part 5 (27 rows); v0.11.220 (MD): 0.11.195–0.11.197 moved on top of part 5 (26 rows); v0.11.217 (MD): 0.11.191–0.11.194 moved on top of part 5 (23 rows); v0.11.209 (MD): 0.11.182–0.11.190 moved on top of part 5 (19 rows); v0.11.198 (MD): the 10 rows moved to changelog-5.md, as moved (part 5 never changes otherwise)
const CL4_SHA = 'bac3bac02069f5cc5ba315d41219d66a55cf75e0fc1aae93dd85c8de5985d1c4'; // v0.11.178 (U1, MD): the 32 rows moved to changelog-4.md, as moved (part 4 never changes) // v0.11.176 (CL1): the 70 rows moved to changelog-3.md, as moved (part 3 never changes)
// v0.11.176 (owner pick CL1): changelog.md split again at 0.11.139: 0.11.70–0.11.139 in changelog-3.md, 0.11.69 and before in changelog-2.md
// (v0.11.105, CS1); every row in exactly one part, newest first in each, part 1 under the project tool's limit with its pointer line
{
    const read = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const [p1, p2, p3, p4, p5, p6] = ['changelog.md', 'changelog-2.md', 'changelog-3.md', 'changelog-4.md', 'changelog-5.md', 'changelog-6.md'].map(read); // v0.11.264 (MD): part 6
    const rowLines = (t) => t.split('\n').filter((l) => /^\| \d+\.\d+\.\d+ \|/.test(l));
    const rows = (t) => rowLines(t).map((l) => l.split('|')[1].trim().split('.').map(Number));
    const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const r1 = rows(p1), r2 = rows(p2), r3 = rows(p3), r4 = rows(p4), r5 = rows(p5), r6 = rows(p6), all = [...r1, ...r6, ...r5, ...r4, ...r3, ...r2].map((v) => v.join('.'));
    // v0.11.178 (owner pick U1, MD): 0.11.140–0.11.171 moved word for word to changelog-4.md; part 1 keeps 0.11.172 on
    assert(r3.length === 70 && r3.every((v) => cmp(v, [0, 11, 70]) >= 0 && cmp(v, [0, 11, 139]) <= 0) && r4.length === 32 && r4.every((v) => cmp(v, [0, 11, 140]) >= 0 && cmp(v, [0, 11, 171]) <= 0) && r5.length === 69 && r5.every((v) => cmp(v, [0, 11, 172]) >= 0 && cmp(v, [0, 11, 240]) <= 0) && r6.length >= 1 && r6.every((v) => cmp(v, [0, 11, 241]) >= 0) && r1.every((v) => cmp(v, [0, 11, 241]) > 0 && r6.every((w) => cmp(v, w) > 0)) /* v0.11.264 (MD): 0.11.241 moved to part 6 */ /* v0.11.263 (MD): 0.11.240 moved; v0.11.262 (MD): 0.11.239 moved; v0.11.261 (MD): 0.11.238 moved; v0.11.260 (MD): 0.11.237 moved; */ /* v0.11.258 (MD): 0.11.235 moved; */ /* v0.11.256 (MD): 0.11.234 moved; v0.11.253 (MD): 0.11.232–0.11.233 moved; v0.11.251 (MD): 0.11.230–0.11.231 moved; v0.11.250 (MD): 0.11.229 moved; v0.11.244 (MD): 0.11.224 moved; v0.11.246: 0.11.225; v0.11.247: 0.11.226; v0.11.248: 0.11.227; v0.11.249: 0.11.228 */ && r2.every((v) => cmp(v, [0, 11, 69]) <= 0),
        `CL1, MD: 0.11.70–0.11.139 in part 3 (${r3.length}), 0.11.140–0.11.171 in part 4 (${r4.length}), 0.11.172–0.11.224 in part 5 (${r5.length}; v0.11.198, v0.11.209, v0.11.217, v0.11.220, v0.11.222, v0.11.223, v0.11.224, v0.11.225, v0.11.226, v0.11.227, v0.11.229, v0.11.230, v0.11.231, v0.11.232, v0.11.233, v0.11.234, v0.11.235, v0.11.236, v0.11.237, v0.11.238, v0.11.239, v0.11.241, v0.11.242, v0.11.243, v0.11.244), 0.11.222 on in part 1 (${r1.length}), 0.11.69 and before in part 2 (${r2.length})`);
    assert(new Set(all).size === all.length && [r1, r2, r3, r4, r5, r6].every((r) => r.every((v, i) => i === 0 || cmp(r[i - 1], v) > 0)), 'CL1: no row twice, each part newest first');
    const { createHash } = await import('node:crypto');
    const sha = createHash('sha256').update(rowLines(p3).join('\n')).digest('hex'), sha4 = createHash('sha256').update(rowLines(p4).join('\n')).digest('hex');
    const sha5 = createHash('sha256').update(rowLines(p5).join('\n')).digest('hex');
    assert(r1.length >= 6 && sha === CL3_SHA && sha4 === CL4_SHA && sha5 === CL5_SHA, `CL1, MD: parts 3 and 4's rows exactly as moved (sha256 ${sha.slice(0, 12)}…, ${sha4.slice(0, 12)}…), part 1 keeps 0.11.172 on (${r1.length})`);
    assert(Buffer.byteLength(p1) <= MIRROR_MAX && Buffer.byteLength(p3) <= DOC_TOOL_MAX && Buffer.byteLength(p4) <= DOC_TOOL_MAX && p1.includes('0.11.172–0.11.240 in `changelog-5.md`') && p1.includes('`changelog-6.md`') && Buffer.byteLength(p6) <= MIRROR_MAX && p6.includes('Newer versions: `changelog.md`') /* v0.11.264 (MD): part 6 */ /* v0.11.263 (MD); v0.11.262 (MD); v0.11.261 (MD); v0.11.260 (MD); v0.11.259; v0.11.258; v0.11.256 */ && Buffer.byteLength(p5) <= DOC_TOOL_MAX && p1.includes('0.11.140–0.11.171 in `changelog-4.md`') && p1.includes('0.11.70–0.11.139 in `changelog-3.md`') && p1.includes('0.11.69 and before in `changelog-2.md`') && p3.includes('Newer versions: `changelog.md`') && p4.includes('Newer versions: `changelog.md`'),
        `CL1, MD: part 1 under ${MIRROR_MAX} bytes (${Buffer.byteLength(p1)}), parts 3 and 4 under ${DOC_TOOL_MAX}, with their pointers`);
}

// v0.11.257 (owner pick P27-A, MQ; P25-A review L6): mutate's default command passes only flags the story test reads (`--quick` read none:
// 1,000 games a fault); SL (L4): the story test notes a longest random run past 6,000 steps, under its cap
{
    const flags = MUTATE_CMD.split(/\s+/).filter((a) => a.startsWith('--'));
    const shard = readFileSync(path.join(ROOT, 'tests/lib/shard.mjs'), 'utf8'), mu = readFileSync(path.join(ROOT, 'tools/mutate.mjs'), 'utf8');
    assert(MUTATE_CMD === 'node tests/story.test.mjs --games 50 --workers 1' && flags.every((f) => shard.includes(`opt('${f.slice(2)}'`)) && !mu.includes("'node tests/story.test.mjs --quick'") && mu.includes("opt('--cmd', DEFAULT_CMD)"), `MQ (P27-A): mutate's default command 50 games on one worker, every flag one the story test reads (${flags})`);
    const st = readFileSync(path.join(ROOT, 'tests/story.test.mjs'), 'utf8');
    const cap = Number((st.match(/^const STEP_CAP = (\d+);/m) || [])[1]), note = Number((st.match(/^const LONG_RUN_NOTE = (\d+);/m) || [])[1]);
    assert(cap === 10000 && note === 6000 && note < cap && st.includes('if (maxSteps > LONG_RUN_NOTE) console.log(`NOTE: the longest random run took ${maxSteps} steps'), `SL (P27-A): the story test notes a longest run past ${note} steps, under its cap ${cap}`);
}
// v0.11.178 (owner pick U1, PF): tools/mutate.mjs plants faults one at a time in scratch copies and runs a test command on each,
// so a cold review on Opus needs no model to plant them; here on a tiny tree with a one-line test, nothing in the repo touched
{
    assert(applyFault('a b a', { find: 'b', replace: 'c' }).text === 'a c a' && applyFault('a b a', { find: 'a', replace: 'c' }).why === 'find occurs more than once' && applyFault('x', { find: 'y', replace: 'z' }).why === 'find not in the file' && applyFault('x', { find: 'x', replace: 'x' }).why === 'replace is the same text' && applyFault('x', {}).why === 'needs find and replace', 'PF: a fault applies only to one exact, unique match');
    const rep = mutateReport([{ id: 'F1', file: 'a.js', note: 'n|1', status: 'caught', detail: 'x' }, { id: 'F2', file: 'a.js', note: '', status: 'missed', detail: '' }, { id: 'F3', file: 'b.js', note: '', status: 'not applied', detail: 'no such file' }]);
    assert(rep.caught === 1 && rep.missed === 1 && rep.notApplied === 1 && rep.text.includes('| F1 | a.js | n\\|1 | caught |') && rep.text.endsWith('1 caught, 1 missed, 1 not applied (of 3).'), 'PF: the report counts and escapes');
    const tree = path.join(TMP, 'mutate-tree'); mkdirSync(path.join(tree, 'js'), { recursive: true });
    writeFileSync(path.join(tree, 'js/a.js'), 'export const A = 1;\nexport const B = 2;\n');
    writeFileSync(path.join(tree, 'check.mjs'), "import { A, B } from './js/a.js'; process.exit(A === 1 ? 0 : 1);\n");
    writeFileSync(path.join(TMP, 'faults.json'), JSON.stringify([{ id: 'F1', file: 'js/a.js', find: 'A = 1', replace: 'A = 2', note: 'A' }, { id: 'F2', file: 'js/a.js', find: 'B = 2', replace: 'B = 3', note: 'B' }, { id: 'F3', file: 'js/a.js', find: 'C', replace: 'D' }, { id: 'F4', file: 'js/none.js', find: 'A', replace: 'B' }]));
    let code = 0, out = '';
    try { out = execFileSync(process.execPath, ['tools/mutate.mjs', path.join(TMP, 'faults.json'), '--root', tree, '--cmd', `"${process.execPath}" check.mjs`, '--jobs', '2', '--out', path.join(TMP, 'mutate.md')], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { code = e.status ?? 1; out = String(e.stdout || e); }
    const md = existsSync(path.join(TMP, 'mutate.md')) ? readFileSync(path.join(TMP, 'mutate.md'), 'utf8') : '';
    assert(code === 1 && /\| F1 \|[^\n]*\| caught \|/.test(md) && /\| F2 \|[^\n]*\| missed \|/.test(md) && /\| F3 \|[^\n]*find not in the file/.test(md) && /\| F4 \|[^\n]*no such file/.test(md) && md.indexOf('| F1 |') < md.indexOf('| F4 |') && readFileSync(path.join(tree, 'js/a.js'), 'utf8').includes('A = 1;'), `PF: caught, missed and not applied, in order, exit 1, the source tree untouched (exit ${code}: ${out.trim().split('\n').pop()})`);
    // v0.11.185 (RV1, TG5): the copy leaves out only the top-level art/, .git and node_modules, never js/art/
    assert(keepInCopy('/r', '/r/art') && !keepInCopy('/r', '/r/.git') && !keepInCopy('/r', '/r/node_modules') && keepInCopy('/r', '/r') && keepInCopy('/r', '/r/js/art') && keepInCopy('/r', '/r/js/art/art.js') && keepInCopy('/r', '/r/tests/art.txt'), 'PF (RV1, TG5); v0.11.192 (A1): only the top-level .git and node_modules are left out of a copy (art/ and js/art/ kept)');
    // v0.11.192 (RV1, M2): each copy is a git tree of its own files, so `git ls-files` (check.mjs, check.sh quick) works in it
    {
        const d = path.join(TMP, 'mutate-git'); mkdirSync(path.join(d, 'js'), { recursive: true }); writeFileSync(path.join(d, 'js/a.js'), 'x\n');
        const ok = gitCopy(d), files = ok ? execFileSync('git', ['ls-files'], { cwd: d, encoding: 'utf8' }) : '';
        assert(ok && files.split('\n').includes('js/a.js'), `PF (RV1 M2): a copy's own files are in its git index (${JSON.stringify(files)})`);
        assert(/gitCopy\(dir\); \/\/ RV1 \(M2\)/.test(readFileSync(path.join(ROOT, 'tools/mutate.mjs'), 'utf8')), 'PF (RV1 M2): every copy is made a git tree');
    }
}

// v0.11.180 (owner picks CP1, SZ1): tools/packet.mjs, the context packets: each field (C1–C7) on the lines v0.11.179's label pass
// got wrong for want of it (project/research/label-pass-*.md), so a packet that drops one fails here
{
    const P = await import('../tools/packet.mjs');
    const entry = (hub, to) => SCENES[hub].choices.findIndex((c) => c.to === to);
    // C3: a work menu's text is never drawn, and the hub's entry to it is no label at all (H, R11)
    assert(P.sceneStatus('rr_scout').kind === 'work menu' && !P.sceneStatus('rr_scout').drawn && P.sceneStatus('rr_hub').kind === 'hub' && P.sceneStatus('rt_ya_talk').kind === 'story', 'CP (C3): rr_scout a work menu (text never drawn), rr_hub a hub, rt_ya_talk a story screen');
    assert(/^NOT drawn/.test(P.choiceStatus('rr_hub', entry('rr_hub', 'rr_scout'))) && /^NOT drawn/.test(P.choiceStatus('wilds', entry('wilds', 'wild_train'))) && P.choiceStatus('rr_scout', 0) === 'a work card: label, then the result', 'CP (C3): the entries to rr_scout and wild_train not drawn; rr_scout\'s options are work cards');
    // C4: rt_evening's text by all three forms (W1, R6)
    const ev = P.byForms(SCENES.rt_evening.text).filter((r) => !r.later).map((r) => r.forms.join('/'));
    assert(ev.includes('cat') && ev.includes('great') && ev.includes('human'), `CP (C4): rt_evening's three forms apart (${ev.join(', ')})`);
    // C1: a hidden choice's result (forced), a check's success and failure, and the screen after with its labels (R7, R2, R9)
    const kiss = SCENES.rt_ya_talk.choices.findIndex((c) => c.show && /romance/.test(String(c.show)));
    const kr = P.forcedResults('rt_ya_talk', kiss);
    assert(kiss >= 0 && kr.results.some((r) => /kisses back/.test(r.t)) && /^rt_road/.test(kr.then), `CP (C1): rt_ya_talk's hidden kiss forced: its result and rt_road after (${kr.results.map((r) => r.t.slice(0, 30)).join(' | ')})`);
    const sc = P.forcedResults('rr_scout', 0).results.flatMap((r) => r.how);
    assert(sc.includes('success') && sc.includes('failure'), `CP (C1): rr_scout's check as a success and a failure (${sc.join(', ')})`);
    const adv = SCENES.lf_hub.choices.findIndex((c) => /Advances the story/.test(String(c.text)));
    assert(adv >= 0 && /lf_exit/.test(P.forcedResults('lf_hub', adv).then) && /\[its labels: /.test(P.forcedResults('lf_hub', adv).then), 'CP (C1): lf_hub\'s story choice shows lf_exit after it, with its labels');
    assert(P.storyLines(['GU 0.5 / DC 2 — failure', 'GU +2 XP', 'Starving: −2 HP', 'You see what went wrong. (Intuitive Aptitude: +0.5 on this next time.)', 'You smell moss.']).join('|') === 'You smell moss.', 'CP (C1): the engine\'s lines left out of a result');
    // C2: the bot run (20 games): days, hours, picks per game; rt_ashfall reached after noon (R3), a drill taken more than once (F1)
    const seen = P.seenAt(20, new Set(['rt_ya_talk']));
    assert(seen.rt_ashfall && seen.rt_ashfall.hours[1] > 12 && Object.keys(seen).some((k) => /^wild_train:\d+$/.test(k) && seen[k].maxPicks > 1), `CP (C2; OC4: the long calendar's Fallout drill is a week's card, taken once): rt_ashfall seen till hour ${seen.rt_ashfall?.hours[1]}; a Wilds training card picked twice in a game`);
    assert(P.whenCode({ show: Object.assign(() => true, { dailyKey: 'x' }) })[0] === 'once a day (key x)' && /^show: /.test(P.whenCode({ show: (g) => g.flags.a })[0]), 'CP (C2): a daily key in words, other conditions as code');
    // C5 + C6 + the packet: whole texts by paragraph, the labels that lead in, results only for marked lines
    const pk = P.packet(['rt_ya_talk', 'rr_scout'], { marks: new Set([`rt_ya_talk:${kiss}`]), seen });
    const yk = pk.slice(pk.indexOf('## rt_ya_talk'), pk.indexOf('## rr_scout'));
    assert(/^¶1 /m.test(pk) && /led in by \(C6\): rt_road\[\d+\]/.test(yk) && /work menu of rr_hub/.test(pk) && (yk.match(/result \(C1/g) || []).length >= 1 && (yk.match(/^> \[/gm) || []).length === SCENES.rt_ya_talk.choices.length && /◆/.test(yk), 'CP: the packet has ¶ texts, C6, C3, and every label with the marked one\'s result');
    const unmarked = yk.split(/\n(?=> \[)/).filter((b) => b.startsWith('> [') && !b.includes('◆'));
    assert(unmarked.length && unmarked.every((b) => !/result \(C1/.test(b) && /when \(C2\)/.test(b) && /drawn \(C3\)/.test(b)), 'CP: the other labels on the screen with C2 and C3, no results');
    assert(P.packet(['rr_scout'], { seen }).includes('result (C1, success'), 'CP: a scene named bare gets every line\'s result');
    // tags for whole-game reads
    const tg = P.tags(['rr_scout', 'rr_hub'], seen);
    assert(/^rr_scout \[work menu, text never drawn/m.test(tg) && /NOT drawn: the entry to the work menu rr_scout/.test(tg), 'CP (tags): rr_scout\'s text and the hub\'s entry marked never drawn');
    // C7: the check before a handover, on drafts the label pass had (F4, R10, W7, R3)
    const notes = P.checkDrafts([{ key: 'rt_yk_talk', text: 'Gold eyes, level.' }, { key: 'yuki_path', text: 'Her ears stay forward.' }, { key: 'fo_drill:0', text: 'Drill the line: shields of bone, spears behind, nobody alone.' }, { key: 'rt_ashfall', text: 'Cleaner than this morning\'s.' }, { key: 'x', text: 'A plain new line.' }], { seen });
    const has = (kind, key) => notes.some((n) => n.kind === kind && n.key === key);
    assert(has('tic', 'rt_yk_talk') && has('pair', 'yuki_path') && has('run', 'fo_drill:0') && has('time', 'rt_ashfall') && !notes.some((n) => n.key === 'x'), `CP (C7): the tic, "ears … forward", the drill's reused run, "this morning" found; a plain line passes (${notes.map((n) => `${n.kind}:${n.key}`).join(', ')})`);
    // v0.11.200 (owner pick D1): S1 the split, S2 the drafts against each other, S3 "still" as stillness, S4 a reference's phrase and a slot
    {
        const n2 = P.checkDrafts([
            { key: 'sa', text: '"Mine," says Ya: +2 HP.' }, { key: 'sb', text: 'Thorns. +2 cinderberries.' }, { key: 'sc', text: 'Supper: +25 satiety.' },
            { key: 'ta', text: 'Her face goes still.' }, { key: 'tb', text: 'Find a still place and sit.' }, { key: 'tc', text: 'It is still dark.' }, { key: 'td', text: 'You keep perfectly still until tomorrow.' },
            { key: 'ra', text: 'You read her a very long book about carrying a ring to a volcano, slowly.' },
            { key: 'da', text: 'Yuki sits by the cold river stones and counts.' }, { key: 'db', text: 'Later Yuki sits by the cold river stones and counts them.' }, { key: 'da:1', text: 'yuki sits by the cold river stones and counts' },
            { key: 'ma', text: 'Flown, {min} min aloft against {walk} on foot.' }, { key: 'mb', text: 'Carried: {min} min aloft against {walk} on foot.' },
        ], { seen });
        const at = (kind, key) => n2.some((n) => n.kind === kind && n.key === key);
        assert(at('split', 'sa') && /stat stays in the reply/.test(n2.find((n) => n.key === 'sa' && n.kind === 'split').what) && at('split', 'sb') && !at('split', 'sc'), 'D1 (S1): a stat in the reply and a fragment beside a gain noted; a plain gain line passes');
        assert(!at('time', 'ta') && !at('time', 'tb') && at('time', 'tc') && n2.some((n) => n.key === 'td' && n.kind === 'time' && /"tomorrow"/.test(n.what)), 'D1 (S3): "goes still" and "a still place" are no time words; "still dark" is; after "perfectly still" the next time word counts');
        assert(P.timeWord('Still nothing.') === 'Still' && P.timeWord('Hold still.') === null && P.timeWord('the still water') === null, 'D1 (S3): timeWord by itself');
        assert(!at('run', 'ra'), 'D1 (S4): a reference\'s general phrase in a scene (lotr in the reading) is no reused run');
        assert(at('self', 'db') && !at('self', 'da') && at('self', 'da:1'), 'D1 (S2): a run shared by drafts of two scenes noted once, on the later; v0.11.239 (P12-A, RC, CR1): two drafts of one scene too');
        assert(!at('self', 'mb') && !at('run', 'ma'), 'D1 (S2, S4): a {slot} breaks a run, so two walk lines sharing "{min} min aloft against {walk} on foot" are not noted');
        assert(P.stretches('Plays {ref:sabbath} loud, then a dwarven hymn.').length === 3, 'D1 (S4): stretches splits at a slot and at a reference\'s phrase');
    }
    // v0.11.239 (owner pick P12-A, RC; p12's measure CR1–CR3): the runs v0.11.238's build found only with the text lint: CR1 a run shared
    // inside the draft's own scene (the old check skipped its scene), CR2 a long-calendar morning's text and CR3 Yuki's fire text (texts the
    // check's six states never drew; now the text lint's renders, `lintCorpus`); a draft that replaces an own-scene text is not checked against
    // it; one scene's drafts against each other, but a text's Yuki passages by form and its line without Ya never share a screen
    {
        const lc = P.lintCorpus();
        assert(lc.length > 2000 && lc.some((x) => x.id === 'morning' && x.t.includes('was white when it got here')) && lc.some((x) => /^pool:/.test(x.id)) && lc.some((x) => x.label), `RC: the text lint's corpus (${lc.length} renders) holds the long calendar's morning, the pools and the labels`);
        { const { FS8, FS9 } = await import('../js/story/act1_fallout.js'); // v0.11.239 (P12-A, TG): the lint reads the Fallout supper's six a story day
          const sup = lc.filter((x) => x.id === 'fo_supper').map((x) => x.t).join('\n');
          assert(FS8.every((x) => x.y.every((y) => sup.includes(x.t.replace('{yuki}', y)))) && FS9.every((x) => sup.includes(x.t) && sup.includes(x.away)), 'P12-A (TG): the text lint renders every FS8 text in each form and every FS9 text with Ya and without'); }
        { const { FS10 } = await import('../js/story/act1_fallout.js'); const { SW3 } = await import('../js/story/ashfall.js'); // v0.11.241 RV1 (TG-C3): the lint reads FS10 with Ya and without, and SW3 in each form
          const sup = lc.filter((x) => x.id === 'fo_supper').map((x) => x.t).join('\n'), vs = lc.filter((x) => x.id === 'supper').map((x) => x.t).join('\n');
          assert(FS10.every((x) => sup.includes(x.t) && sup.includes(x.away)) && SW3.every((x) => (x.y ? x.y.every((y) => vs.includes(x.t.replace('{yuki}', y))) : vs.includes(x.t))), 'P13-A RV1 (TG-C3): the text lint renders every FS10 text with Ya and without and every SW3 text in each form'); }
        const n3 = P.checkDrafts([
            { key: 'bl_camp:ah:4', text: 'The wind drops. Mei Lin has hung the wet things up again, out of habit.' },
            { key: 'village_morning:x', text: 'The frost was white when it got here, and grey by noon.' },
            { key: 'village_night:w1:5', text: 'A stone about the size of your fist sits on the sill.' },
            { key: 'bl_camp:dw:1', text: 'Another raft of fallen trunks, better chosen; you are learning. The fire hisses. Mei Lin has hung the wet things up to drip with everything else. Whatever keeps surfacing out there has come no nearer. You looked.' },
            { key: 'zq:1', text: 'Plain words about a gate of green timber set in wet clay.' }, { key: 'zq:1:y:cat', text: 'Yuki looks at the gate of green timber set in wet clay. She finds it wanting in every respect.' }, { key: 'zq:1:y:great', text: 'Yuki sniffs it. She finds it wanting in every respect.' },
            { key: 'zq:1:away', text: 'Supper by a gate of green timber set in wet clay.' },
        ], { seen: {} });
        const on = (kind, key, re) => n3.some((n) => n.kind === kind && n.key === key && (!re || re.test(n.what)));
        assert(on('scene', 'bl_camp:ah:4', /mei lin has hung the/), 'RC (CR1): a run in another text of the draft\'s own scene is noted');
        assert(on('run', 'village_morning:x', /also in morning/), 'RC (CR2): a run in the long calendar\'s forest morning is noted');
        assert(on('run', 'village_night:w1:5', /the size of your fist/), 'RC (CR3): a run in Yuki\'s fire text (not drawn on the six states) is noted');
        assert(n3.filter((n) => n.key === 'bl_camp:dw:1' && n.kind === 'scene').length === 1 && on('scene', 'bl_camp:dw:1', /runs shared with one text of bl_camp: a rewrite of it, or a copy/) && !on('run', 'bl_camp:dw:1'), 'RC: a draft replacing an own-scene text is not checked run by run against it; RV1 (C M1): one note says so');
        assert(on('self', 'bl_camp:dw:1', /bl_camp:ah:4/), 'RC (CR1): two drafts of one scene are checked against each other');
        assert(on('self', 'zq:1:y:cat', /zq:1$/) && !on('self', 'zq:1:y:great') && !on('self', 'zq:1:away'), 'RC: a text and its Yuki passage share a screen (noted); the passages by form, and the line without Ya, never do');
        assert(P.exclusiveDrafts('a:1:y:cat', 'a:1:y:human') && P.exclusiveDrafts('a:1', 'a:1:away') && P.exclusiveDrafts('a:1:away', 'a:1:y:cat') && !P.exclusiveDrafts('a:1', 'a:1:y:cat') && !P.exclusiveDrafts('a:1:y:cat', 'a:2:y:great'), 'RC: exclusiveDrafts by key');
        // RV1 (the cold review's C M1, TG-C4): a new draft copying half an own-scene text or more is noted (it was silent), and a draft that
        // rewrites one text is still checked against the scene's others (C5); TG-C5: the drafts' order (an exclusive draft first); TG-C6: the
        // lint's result lines keep their scene; C L4: `tiger`
        { const n5 = P.checkDrafts([
            { key: 'fo_supper:9:7:away', text: 'Supper. Nobody says much. The mother bars the door early.' },
            { key: 'bl_camp:dw:9', text: 'Another raft of fallen trunks, better chosen; you are learning. The fire hisses. Mei Lin has hung the wet things up to drip with everything else. Now and then, a long way out, something comes up through the surface.' },
            { key: 'zr:1:y:cat', text: 'Yuki finds it wanting in every single respect.' }, { key: 'zr:2', text: 'The mother finds it wanting in every single respect.' }, { key: 'zr:1:y:great', text: 'She finds it wanting in every single respect.' },
          ], { seen: {} });
          const on5 = (kind, key, re) => n5.some((n) => n.kind === kind && n.key === key && (!re || re.test(n.what)));
          assert(on5('scene', 'fo_supper:9:7:away', /a rewrite of it, or a copy/), 'RV1 (C M1, TG-C4): a new draft copying an own-scene text is noted');
          assert(on5('scene', 'bl_camp:dw:9', /a rewrite of it, or a copy/) && on5('scene', 'bl_camp:dw:9', /a long way out something/), 'RV1 (C M1, C5): a rewrite of one text still meets the scene\'s other texts run by run');
          assert(on5('self', 'zr:2', /zr:1:y:cat/) && on5('self', 'zr:1:y:great', /zr:2/), 'RV1 (TG-C5): with an exclusive draft first, a later passage is still checked against the shared text');
          assert(!lc.some((x) => x.id === 'pool:results') && /id: p === 'results' \? resultAt\.get\(t\)/.test(readFileSync(path.join(ROOT, 'tools/textlint.mjs'), 'utf8')), 'RV1 (TG-C6): the lint\'s result lines keep their scene (none under pool:results; the lint writes each by its scene)');
          assert(P.exclusiveDrafts('a:1:y:tiger', 'a:1:y:cat') && P.exclusiveDrafts('a:1:y:tiger', 'a:1:away'), 'RV1 (C L4): exclusiveDrafts knows `tiger`'); }
        // TG-C7: the CLI's summary names the scene notes; --corpus without a file refused; the packet draws FS6's texts (C M2)
        { const f = path.join(TMP, 'rc-drafts.txt'); writeFileSync(f, 'bl_camp:ah:4 | The wind drops. Mei Lin has hung the wet things up again, out of habit.\n');
          const out = execFileSync(process.execPath, ['tools/packet.mjs', '--check', f, '--games', '0'], { cwd: ROOT, encoding: 'utf8' });
          assert(/SCENE · bl_camp:ah:4/.test(out) && /scene [1-9]/.test(out), 'RV1 (TG-C7): --check prints the scene notes and counts them');
          let code = 0; try { execFileSync(process.execPath, ['tools/textlint.mjs', '--corpus'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { code = e.status; }
          let code2 = 0; try { execFileSync(process.execPath, ['tools/textlint.mjs', '--corpus', '--list'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { code2 = e.status; }
          assert(code === 2 && code2 === 2, `RV1 (C L3, TG-C7): --corpus without a file is refused (exit ${code}, ${code2})`);
          const { FS8, FS9 } = await import('../js/story/act1_fallout.js');
          const pk = P.packet(['fo_supper'], { seen: {} });
          const first = (t) => t.split('\n\n')[0];
          assert(FS8.every((x) => pk.includes(first(x.t))) && FS8.every((x) => x.y.every((y) => pk.includes(y))) && FS9.every((x) => pk.includes(first(x.t)) && pk.includes(x.away)), 'RV1 (C M2, TG-C7): the packet draws FS8 in each form and FS9 with Ya and without'); }
        { const { FS10 } = await import('../js/story/act1_fallout.js'); const pk = P.packet(['fo_supper'], { seen: {} }); // v0.11.241 RV1 (TG-C4): story day 10 without Ya in the packet's states
          assert(FS10.every((x) => pk.includes(x.t.split('\n\n')[0]) && pk.includes(x.away)), 'P13-A RV1 (TG-C4): the packet draws FS10 with Ya and without'); }
        { const pk = P.packet(['night'], { seen: {} }); const lc = P.lintCorpus().filter((x) => x.id === 'night').map((x) => x.t).join('\n'); // v0.11.242 RV1 (P14-A, C M1, TG-C1): the forest's fifteen nights
          const OPEN = ['Night on this world is not light going away', 'The dark here has a weight', 'A still night.', 'From the rise the dark seems to come up', 'At nightfall the forest changes shifts' /* v0.11.243 (P15-B, SF: RT) */, 'Quiet has a sound here', 'After the sky goes', 'Coming up from the water as the dark drops', 'Mist lies along the stream when the dark has come'];
          const miss = OPEN.filter((o) => !pk.includes(o) || !lc.includes(o));
          assert(!miss.length && pk.includes('With no fire to drown it') && lc.includes('With no fire to drown it') && pk.includes('one fingertip to the moss') && lc.includes('one great paw to the moss'), `P14-A RV1 (TG-C1): the packet and the text lint draw the forest's fifteen nights, by form and without the fire (${miss.join(' | ')})`); }
        { const { FS7 } = await import('../js/story/act1_fallout.js'); const { SN7 } = await import('../js/story/ashfall.js'); const { MORNING_W1 } = await import('../js/story/wilds.js'); // v0.11.243 (owner picks P15-B, D1; TG): the sevenths and the first forest week's morning
          const lc = P.lintCorpus().map((x) => x.t).join('\n'); const first = (t) => t.split('\n\n')[0];
          const pk = P.packet(['fo_supper', 'supper', 'village_night', 'morning'], { seen: {} });
          const want = [first(FS7.d8.t), ...FS7.d8.y, first(FS7.d9.t), FS7.d9.away, first(SN7.supper4), first(SN7.supper5), MORNING_W1.split('\n\n')[0]];
          const miss = want.filter((w) => !pk.includes(w) || !lc.includes(w));
          assert(!miss.length && /Bed in this house is taken by rank/.test(pk) && /Bed in this house is taken by rank/.test(lc), `P15-B (TG): the packet and the text lint draw the five sevenths (by form, with Ya and without) and the first forest week's morning (${miss.map((m) => m.slice(0, 30)).join(' | ')})`); }
        { const lc = P.lintCorpus().map((x) => x.t).join('\n'); // v0.11.246 (owner pick P16-A; RV, the cold review's C M2, TG-C6): the new texts in the packet and the lint
          const pk = P.packet(['night', 'ah_hunt', 'ah_hawks_won', 'bl_fireside', 'first_flight', 'coil_dawn', 'breakthrough'], { seen: {} });
          const want = ['Somewhere beyond the stream', 'Water is the only thing here', 'Wind gets up as the dark lands', 'Upwind of the rise, something is fruiting', 'Above the rise there is a gap in the crowns', 'Somewhere at home a library book', 'The ridge wind brings a smell of struck flint', 'Ash lifts off the high ground', 'Mei Lin has smoothed a patch of cold ash', 'Mei Lin has taken her shoes off', 'The ash is still coming down', 'round the grain store', 'Mei Lin offers you a hand up', 'You stand. Mei Lin is asking', 'Your body did better', 'The flight came with it', 'The rung you can name'];
          const miss = want.filter((w) => !pk.includes(w) || !lc.includes(w)); const pkOnly = ['A cinder hawk\'s shadow crosses the slope', 'The hawks come down in ones and twos', 'That is the rung the Sect\'s elders stand on'].filter((w) => !pk.includes(w));
          assert(!miss.length && !pkOnly.length, `P16-A RV (C M2, TG-C6): the packet and the text lint draw the new texts (${miss.concat(pkOnly).map((m) => m.slice(0, 30)).join(' | ')})`); }
        { const lc = P.lintCorpus().map((x) => x.t).join('\n'); // v0.11.247 (owner pick P17-A, TG): the roof's weeks, the talks' beats 11–14, the far hunt, the walk's seventh in the packet and the lint; the stomp win texts in the lint
          const pk = P.packet(['supper_roof', 'talk_mei', 'talk_ya', 'far_hunt', 'mei_walk'], { seen: {} });
          const want = ['Mei Lin arrives with both hands stained green', 'Mei Lin asks, with some formality, what your name means', 'Mei Lin falls asleep in the middle of an argument', 'Mei Lin gives you the local sky', 'Mei Lin keeps step with you, tying herbs', 'Mei Lin has stopped beside the path over a low plant', 'Your feet are blind, scholar', 'The village geese come home along the field path'] /* RV-A: the week-3 seventh cut (C M1), the new beat 13s and roof 1:5 */;
          const miss = want.filter((w) => !pk.includes(w) || !lc.includes(w)); const lintOnly = ['The birds inside are on fire', 'Ya looks from the bone to her spear'].filter((w) => !lc.includes(w));
          // RV-A (the cold review's TG-C7): week 3's seventh evening (the tribute's eve, no supper) is in no packet state, so no draft is written for a screen nobody sees
          const w3 = P.STATES.filter((x) => /village week 3, day/.test(x.base)), w2 = P.STATES.filter((x) => /village week 2, day/.test(x.base));
          assert(w3.length && !w3.some((x) => /day 7 of/.test(x.base)) && w2.some((x) => /day 7 of/.test(x.base)), `P17-A RV-A (TG-C7): the packet's week 3 has no seventh evening (${w3.length} states), week 2 has`);
          assert(!miss.length && !lintOnly.length, `P17-A (TG): the packet and the text lint draw the new texts (${miss.concat(lintOnly).map((m) => m.slice(0, 30)).join(' | ')})`); }
        const n4 = P.checkDrafts([{ key: 'morning:9', text: 'The frost was white when it got here, and grey by noon.' }], { seen: {}, texts: [] });
        assert(!n4.some((n) => n.kind === 'run' || n.kind === 'scene'), 'RC: given texts alone, the runs are counted against those (the lint corpus only by default)');
    }
    // v0.11.235 (owner pick P8-A, TG): the states beyond the forms (C5): the village's weeks, story days 9–10, the Ashen Hills by who is there
    // and the cook mark, the Root Road cooked and not; each text once, named by every state that draws it. RV1 (the cold review's TG-C1–C4):
    // each state changes the text it should, the away states are away by the game's own rule, every new text is drawn, the merge holds
    { const fs = P.packet(['bl_fireside']), wk = P.packet(['mei_walk']), sp = P.packet(['supper']), mo = P.packet(['bl_morning']);
      const blocks = (pk) => pk.split(/\n(?=\[text · |> \[)/).filter((b) => b.startsWith('[text · state: '));
      const block = (pk, re, not) => blocks(pk).find((b) => re.test(b.split('\n')[0]) && !(not && not.test(b.split('\n')[0]))) || '';
      const BR = await import('../js/story/act1_blackroot.js');
      const st = (base) => P.STATES.find((x) => x.base === base);
      // TG-C1: the cook mark draws the cooked lines, the no-cook state the other
      const ahC = block(fs, /Ashen Hills in the evening, he cooked/), ahN = block(fs, /Ashen Hills in the evening, he did not cook/), rrC = block(fs, /Root Road in the evening, he cooked/), rrN = block(fs, /Root Road in the evening, he did not cook/);
      assert(ahC && ahN && ahC !== ahN && /lends your stew a colour/.test(ahC) && !/lends your stew a colour/.test(ahN) && /stirs it as if it could hear him/.test(rrC) && !/stirs it as if it could hear him/.test(rrN),
          'P8-A RV1 (TG-C1): "he cooked" and "he did not cook" head different blocks, each with its own meal lines');
      // TG-C2: the away states are away as the game reads it (06:00–18:59), and the camp's later morning has its away block
      assert(BR.awayNow(st('the Ashen Hills by day, Ya away').g) === 'ya' && BR.awayNow(st('the Ashen Hills by day, both away').g) === 'both' && BR.awayNow(st('the Ashen Hills by day, both there').g) === null
          && block(mo, /by day, Ya away/) && block(mo, /by day, Ya away/) !== block(mo, /by day, both there/), 'P8-A RV1 (TG-C2): the away states are away by awayNow, and the morning draws its away version');
      // TG-C3: every text of the four cycles, and Yuki's two sentences in each form
      const OPEN = ["Mei Lin's house has two rooms", 'The house has made room for you', 'By now you know which board', 'You stand your chopsticks upright', "The cooper's wife comes to the door", "Mei Lin's mother asks for your glasses",
          "Supper at Mei Lin's has acquired rules", 'The mother has let you cook', "The potter's hen has laid", 'All this time you have been asking', "After the fish Mei Lin's mother brings down"];
      const WOPEN = ['You walk the edge of the field', 'The sun goes down behind the barley', 'From the field edge you can see the road', 'Mei Lin wants to know whether your people', 'Out by the barley, Mei Lin admits', 'There are nine boundary stones',
          'The barley is nearly ready', 'From the field edge you can watch the shutters', 'The well rope is coiled', '"Tell me the dullest thing', 'Somebody has turned the scarecrow', 'Between the old pear tree'];
      const YS = ['leaves inspected by his cat', 'Then the visitor sees what is stretched out', 'Then the visitor sees the ears', 'From your shoulder Yuki inspects', 'Yuki pads behind and sets one broad paw', 'Yuki, a few paces back, trails her fingertips'];
      const miss = [...OPEN.filter((o) => !sp.includes(o)), ...WOPEN.filter((o) => !wk.includes(o)), ...YS.filter((y) => !(sp + wk).includes(y))];
      assert(!miss.length, `P8-A RV1 (TG-C3): the packet draws every text of the cycles and Yuki's sentences by form (missing: ${miss.join('; ')})`);
      // TG-C4: merged by text: a new text drawn once, its tag naming each state that draws it (the walks: week 2 and week 3 share; v0.11.241 P13-A WK-d: the suppers' week 3 its own list)
      const once = ["The potter's hen has laid", 'All this time you have been asking', 'Somebody has turned the scarecrow'].every((o) => (sp + wk).split(o).length === 2);
      assert(once && blocks(sp).some((b) => /village week 2, day 4 of its cycles:/.test(b.split('\n')[0]) && /The potter's hen has laid/.test(b)) && blocks(sp).some((b) => /village week 3, day 4 of its cycles/.test(b.split('\n')[0]) && /The lamp has been trimmed to a bead/.test(b)) && P.stateNames([{ base: 'x', form: 'cat' }, { base: 'x', form: 'great' }, { base: 'x', form: 'human' }, { base: 'y', form: 'cat' }]).join('|') === 'x|y (cat)',
          'P8-A RV1 (TG-C4): each text once, its tag naming every state that draws it; a state in all three forms by its name alone');
      // L1: the states only on the scenes of their area (no village week on the Fallout, no Ashen Hills at supper, no walk in the first week)
      const fm = P.packet(['fo_mei']);
      assert(!/state: [^\n]*village week/.test(fm) && !/state: [^\n]*(Ashen Hills|Root Road|story day)/.test(sp) && !/state: [^\n]*village week 1\b/.test(wk), 'P8-A RV1 (C L1): each state only on its own area\'s scenes'); }
    // v0.11.236 (owner pick RV1 after P9-A, PS; the cold review's C M1, TG-C3): the camps' third night and the talks' beat 5 by warmth and with
    // Ya away: the packet draws all six texts P9-A added, each branch, and the away state is away by the game's rule
    { const pk = P.packet(['bl_camp', 'talk_mei', 'talk_ya']); const BR = await import('../js/story/act1_blackroot.js');
      const NEW = ['A buttress of bark stands up', 'Nobody discusses where the fire goes', 'Ash has drifted knee-deep', 'The hill is black glass', 'Mei Lin has not spoken for some while', 'The next cake she breaks evenly', 'You say the smaller half was noted',
          'Ya is quiet, which you had taken', 'Later she wants the stone back', 'Further on she holds out her hand for it', 'The herb girl got one too'];
      const miss = NEW.filter((o) => !pk.includes(o)); const away = P.STATES.find((x) => x.base === 'the journey talks at beat 5, Ya away, Mei Lin not close');
      assert(!miss.length && away && BR.awayNow(away.g) === 'ya', `P9-A RV1 (PS, TG-C3): the packet draws every new camp and quiet-walk text and branch; the Ya-away state is away (missing: ${miss.join('; ')})`); }
    // v0.11.238 (owner pick P11-A, PKs, PKf): the camp's packet draws every camp text, the Drowned Wood's later two and CB5's five among them; `--week`
    // keeps one village week's states (the quiet night's packet 18.8 KB whole, a week's under 60%); a week outside 1–3 is refused
    { const pk = P.packet(['bl_camp']); const CAMPS = ['Another raft of fallen trunks', 'The raft holds', 'The raft you camp on has run aground', 'A lesser root joins the road', 'The road dips here', 'A bough of the dead tree fell here once', 'The wind drops at dusk'];
      const miss = CAMPS.filter((o) => !pk.includes(o));
      assert(!miss.length && /state: [^\n]*the Drowned Wood in the evening, its fourth camp/.test(pk), `P11-A (PKs): the camp's packet draws every camp text, by the states that reach it (missing: ${miss.join('; ')})`);
      const all = P.packet(['village_night']), w1 = P.packet(['village_night'], { week: 1 }), w3 = P.packet(['village_night'], { week: 3 });
      const W1 = ['The loft has one board that announces you', 'Out past the last house something calls twice', 'Your lab coat hangs from a rafter peg'];
      assert(W1.every((o) => w1.includes(o) && all.includes(o)) && !/village week [23]/.test(w1) && !/village week [12]\b/.test(w3) && w3.includes("Mei Lin's mother checks the bar") && !w3.includes('Your lab coat hangs') && w1.length < all.length * 0.6,
          `P11-A (PKf): --week keeps one week's states (${w1.length} of ${all.length} bytes), the week's new texts in it, the others' out`);
      let bad = ''; try { execFileSync(process.execPath, ['tools/packet.mjs', 'village_night', '--week', '4', '--games', '0'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { bad = `${e.status}|${e.stdout}`; }
      assert(/^2\|--week takes 1, 2 or 3/.test(bad), 'P11-A (PKf): --week outside 1–3 is refused');
      // RV2 (the cold review's C L1, L2, TG-C2): --week refused with --check, --tags or no value; a scene outside the filter keeps its states; the
      // CLI with --week 1 runs and keeps week 1 only; without --week every week stays; the camps' states on their real nights at 19:00
      const cli = (args) => { try { return `0|${execFileSync(process.execPath, ['tools/packet.mjs', ...args], { cwd: ROOT, encoding: 'utf8' })}`; } catch (e) { return `${e.status}|${e.stdout}`; } };
      const refused = [['village_night', '--week', '1', '--check', 'x.txt'], ['--tags', '--week', '1'], ['village_night', '--games', '0', '--week']].map((a) => /^2\|--week takes 1, 2 or 3/.test(cli(a)));
      const c1 = cli(['village_night', '--week', '1', '--games', '0']), c0 = cli(['village_night', '--games', '0']); // the RV2 faults C2, C3: the week's value no scene, no --week no filter
      assert(refused.every(Boolean) && /^0\|## village_night/.test(c1) && !/no such scene/.test(c1) && /village week 1/.test(c1) && !/village week [23]/.test(c1) && /village week 3/.test(all) && /^0\|/.test(c0) && /village week 2/.test(c0) && /village week 3/.test(c0), `P11-A RV2 (C L1, TG-C2): --week refused where it would be ignored (${refused}); the CLI keeps week 1 only; no --week keeps every week`);
      assert(P.packet(['bl_camp'], { week: 1 }).includes("its fourth camp (the wood's story night)"), 'P11-A RV2 (TG-C2): a scene outside the week filter keeps its states');
      const BR = await import('../js/story/act1_blackroot.js'); const C = await import('../js/core/calendar.js'); const ds = (re) => P.STATES.filter((x) => re.test(x.base));
      const days = [...ds(/^the Drowned Wood in the evening/), ...ds(/^the Root Road in the evening, its (fourth|fifth)/), ...ds(/^the Ashen Hills in the evening, its (fourth|fifth)/)].map((x) => `${Math.floor(x.g.minutes / 1440) + 1}@${Math.floor((x.g.minutes % 1440) / 60)}`);
      assert(days.join(' ') === '70@19 71@19 72@19 73@19 68@19 69@19 77@19 78@19' && typeof C.calMinutes === 'function' && BR.BLACKROOT.bl_camp, `P11-A RV2 (C L2): the camps' states on the game's own nights at 19:00 (${days.join(' ')})`); }
    // and the text lint reads the camps on their later nights (the Drowned Wood's were read on its first only)
    { const TL = readFileSync(path.join(ROOT, 'tools/textlint.mjs'), 'utf8');
      assert(/for \(const \[region, day, ks, more\] of \[\['rr', 2, \[3, 4\], \{\}\], \['dw', 3, \[1, 2, 3\], \{\}\], \['ah', 5, \[3, 4\], \{ ya_off_done: true \}\]\]\) for \(const k of ks\)/.test(TL), 'P11-A (TG): the lint samples every region\'s later camps'); }
    // and the text lint samples them: the new supper and walk texts, Yuki's three forms of their slot, story days 9–10's later texts
    { const TL = readFileSync(path.join(ROOT, 'tools/textlint.mjs'), 'utf8');
      assert(/for \(const \[vday, day\] of \[\[1, 23\], \[2, 30\], \[3, 37\]\]\) for \(const k of \(vday === 3 \? \[0, 1, 2, 3, 4, 5\] : \[0, 1, 2, 3, 4, 5, 6\]\)(?: \/\*[^*]*\*\/)?\) for \(const \[form, realm\]/.test(TL) && /for \(const day of \[44, 51, 58\]\) for \(const k of \(day === 58 \? \[0, 1, 2, 3, 4, 5\] : \[0, 1, 2, 3, 4, 5, 6\]\)(?: \/\*[^*]*\*\/)?\)/.test(TL) /* v0.11.243 (P15-B, SN7): and the seventh day */ && /for \(const ya of \(day === 44 \? \[true\] : \[true, false\]\)\)/.test(TL) /* v0.11.241 RV1 (TG-C3): story days 9 and 10 with Ya and without */,
          'P8-A (TG): the lint samples the village weeks\' cycles of six in three forms and story days 9–10 on each day of their sequences; v0.11.239 (P12-A, TG): story days 8–10 on days 0–5'); }
    // the command line writes a packet file
    let cli = '';
    try { cli = execFileSync(process.execPath, ['tools/packet.mjs', 'rr_scout:1', '--games', '3', '--out', path.join(TMP, 'pk.md')], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { cli = String(e.stdout || e); }
    const pf = existsSync(path.join(TMP, 'pk.md')) ? readFileSync(path.join(TMP, 'pk.md'), 'utf8') : '';
    assert(/^packet: /.test(cli) && pf.startsWith('## rr_scout') && pf.includes('◆'), 'CP: node tools/packet.mjs writes the packet (--out)');
    // the rules point at it
    const rules = readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
    const r10 = (rules.match(/^10\. .*$/m) || [''])[0];
    assert(/context packets/.test(r10) && /tools\/packet\.mjs/.test(r10) && /--check/.test(r10), 'CP: rule 10 names the context packets, tools/packet.mjs and its --check');
    assert(/tools\/packet\.mjs/.test(readFileSync(path.join(ROOT, 'project/review-checklist.md'), 'utf8')) && /tools\/packet\.mjs/.test(readFileSync(path.join(ROOT, 'project/working-agreement.md'), 'utf8')), 'CP: the review checklist and the working agreement name tools/packet.mjs');
}

// v0.11.268 (owner pick P36-A): the long calendar's guard (LG), the targets (TT), the share table (MB), the kept stats (KS), --update (LU)
{
    // LG: made-up long numbers
    const st = (o) => ({ games: 100, deaths: { 0: { 1: { dead: 10, coils: 100 } } }, tribute: {}, prologueClear: { 1: 40 }, act1Clear: { 1: 30, 2: 70 }, fights: { boar: { win: 60, lose: 40 } }, oneCoil: 30, ...o });
    const m = longMetricsOf({ careful: st() });
    assert(m['careful prologue C1 dead'].v === 10 && m['careful prologue cleared on Coil 1'].v === 40 && m['careful Act 1 cleared on Coil 1'].v === 30 && m['careful fight boar'].v === 60 && m['careful fight boar'].n === 100, `LG: longMetricsOf keeps v0.11.251's names (${JSON.stringify(m)})`);
    const b = { a: { v: 50, n: 100 }, small: { v: 50, n: 30 }, quiet: { v: 50, n: 100 }, gone: { v: 10, n: 60 }, goneSmall: { v: 10, n: 25 }, edge: { v: 50, n: 100 } };
    const now = { a: { v: 75, n: 100 }, small: { v: 80, n: 30 }, quiet: { v: 54, n: 100 }, edge: { v: 70, n: 100 }, fresh: { v: 5, n: 80 }, freshSmall: { v: 5, n: 20 } };
    const r = compareLong(b, now);
    const has = (arr, k) => arr.some((x) => x.startsWith(`${k}:`));
    assert(has(r.flags, 'a') && !has(r.flags, 'small') && has(r.notes, 'small') && !has(r.flags, 'quiet') && !has(r.notes, 'quiet') && !has(r.flags, 'edge') && has(r.notes, 'edge'), `LG: past 20 with n ≥ 50 both sides flags, under n 50 only a note, 20 exactly a note, 4 nothing (${JSON.stringify(r)})`);
    assert(has(r.flags, 'gone') && has(r.notes, 'goneSmall') && has(r.flags, 'fresh') && has(r.notes, 'freshSmall') && r.compared === 3 && r.big === 4 && r.total === 6, `LG: gone and new at n ≥ 50 flag, at n ≥ 20 note (${JSON.stringify(r)})`);
    assert(compareLong(now, now).flags.length === 0 && compareLong(now, now).notes.length === 0, 'LG: the same numbers flag and note nothing');
    // TT: the targets
    assert(verdict(25, 3, 20, 30) === 'in' && verdict(19.5, 2.8, 20, 30) === 'near' && verdict(14, 2.8, 20, 30) === 'out' && verdict(31, 1, 20, 30) === 'near' && verdict(33, 1, 20, 30) === 'out' && verdict(0, 0.25, 0, 0) === 'in', 'TT: in / near (2 × its error) / out');
    const oc = measure(st(), 'oneCoil'), mc = measure(st(), 'act1MeanCoil');
    assert(oc.v === 30 && Math.abs(oc.se - 100 * Math.sqrt(0.21 / 100)) < 1e-9 && mc.v === 1.7 && mc.n === 100 && mc.se > 0 && measure(null, 'oneCoil') === null, `TT: measure (${JSON.stringify([oc, mc])})`);
    const TG = JSON.parse(readFileSync(path.join(ROOT, 'tools/targets.json'), 'utf8')).targets;
    assert(TG.map((t) => t.id).join() === 'T1,T2,T3' && TG[0].min === 20 && TG[0].max === 30 && TG[0].models.join() === 'completionist,cultivator' && TG[1].max === 0 && TG[1].models.join() === 'careful,sociable' && TG[2].target === 4.38 && TG[2].about === 0.75 && TG.every((t) => /^owner 2026-11-22/.test(t.said)), 'TT: tools/targets.json holds the owner\'s three 2026-11-22 targets');
    const tl = targetLines(TG, { completionist: st({ oneCoil: 25 }), careful: st({ oneCoil: 0, act1Clear: { 4: 50, 5: 50 } }) });
    assert(tl.length === 6 && tl.every((l) => /^ {2}TARGET {2}T[123] /.test(l)) && /T1 completionist the whole game on Coil 1: 25% \(target 20–30%; n 100\): in$/.test(tl[0]) && /T1 cultivator: not played/.test(tl[1]) && /T2 careful the whole game on Coil 1: 0% \(target 0%; n 100\): in$/.test(tl[2]) && /T3 careful Act 1 cleared, mean Coil: 4\.5 \(target 4\.38 ± 0\.75: 3\.63–5\.13; n 100\): in$/.test(tl[4]), `TT: one TARGET line per target and model (${tl.join(' | ')})`);
    assert(flagLines(tl.join('\n')).length === 6, 'TT: the check\'s compact output keeps the TARGET lines');
    // MB: the share table moved, models.test.mjs uses it
    const sh = shareTable({ careful: { games: 4, endings: { accord: 3, revelation: 1 }, nights: { quiet: 4 }, texts: { screens: 10, repeats: 1 } } });
    assert(sh.careful.endings.accord.v === 75 && sh.careful.endings.accord.n === 4 && sh.careful.nights.quiet.v === 100 && sh.careful.repeats.v === 10, `MB: shareTable (${JSON.stringify(sh)})`);
    const MT = readFileSync(path.join(ROOT, 'tests/models.test.mjs'), 'utf8');
    assert(/import \{ shareTable \} from '\.\.\/tools\/lib\/longguard\.mjs'/.test(MT) && !/function shareTable/.test(MT), 'MB: tests/models.test.mjs uses the one shareTable');
    // KS: a made-up root
    const KR = path.join(TMP, 'ks-root'), KS = path.join(TMP, 'ks-stats');
    mkdirSync(path.join(KR, 'js'), { recursive: true }); mkdirSync(path.join(KR, 'tests'), { recursive: true }); mkdirSync(KS, { recursive: true });
    writeFileSync(path.join(KR, 'js', 'a.js'), 'one'); writeFileSync(path.join(KR, 'tests', 'b.mjs'), 'two');
    assert(readKept(KR).error && /no kept stats/.test(readKept(KR).error), 'KS: nothing kept yet, an error');
    writeFileSync(path.join(KS, 'tasks.json'), '{}'); writeFileSync(path.join(KS, 'story.json'), '{}');
    assert(keepStats(KR, KS) === false, 'KS: a missing stats file keeps nothing');
    writeFileSync(path.join(KS, 'models-long.json'), '{"x":1}');
    const s0 = codeStamp(KR);
    assert(keepStats(KR, KS, { when: 'then' }) === true && KEPT_FILES.every((f) => existsSync(path.join(KR, KEPT_DIR, f))), 'KS: keepStats copies the three files');
    const k = readKept(KR);
    assert(!k.error && k.when === 'then' && readFileSync(k.long, 'utf8') === '{"x":1}', `KS: readKept finds them while the code is the same (${JSON.stringify(k)})`);
    writeFileSync(path.join(KR, 'project.md'), 'docs'); writeFileSync(path.join(KR, 'tools.mjs'), 'tool');
    assert(codeStamp(KR) === s0 && !readKept(KR).error, 'KS: files outside js/ and tests/ leave the stamp alone');
    writeFileSync(path.join(KR, 'tests', 'b.mjs'), 'three');
    assert(codeStamp(KR) !== s0 && /from other code/.test(readKept(KR).error || ''), 'KS: a changed test file stops --last');
    assert(/tools\/\.last-check\//.test(readFileSync(path.join(ROOT, '.gitignore'), 'utf8')), 'KS: the kept stats stay out of git');
    // LU: sanity --update refuses without the long numbers; --last refuses without kept stats (in a copy: nothing in the repo is touched)
    const SR = path.join(TMP, 'sanity-root');
    for (const d of ['js', 'tools']) cpSync(path.join(ROOT, d), path.join(SR, d), { recursive: true });
    mkdirSync(path.join(SR, 'tests'), { recursive: true });
    rmSync(path.join(SR, KEPT_DIR), { recursive: true, force: true }); // a full check's kept stats in the real repo
    const before = readFileSync(path.join(SR, 'tools/baseline-long.json'), 'utf8');
    const run = (args) => { try { return { code: 0, out: execFileSync(process.execPath, ['tools/sanity.mjs', ...args], { cwd: SR, encoding: 'utf8' }) }; } catch (e) { return { code: e.status, out: String(e.stdout || '') }; } };
    const u = run(['--update']), ul = run(['--update', '--last']);
    { const rd = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8'), ho = rd('handover.md'), h52 = rd('history-52.md'), c6 = rd('changelog-6.md'), c0 = rd('changelog.md');
      assert(h52.includes('## v0.11.265 — ') && !ho.includes('## v0.11.265 — ') && h52.includes('- **v0.11.265: P33-A') && !ho.includes('- **v0.11.265: P33-A') && h52.includes("- **NEXT PUSH: open, options later.** The models' Coil-1 clears back (v0.11.267)") && !ho.includes("- **NEXT PUSH: open, options later.** The models' Coil-1 clears back") && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ && h52.indexOf('## Moved from the handover in v0.11.268') < h52.indexOf('## Moved from the handover in v0.11.267'), 'T1 (rule 5): v0.11.265\'s notes, decision and the next-push entry moved word for word to part 52 (v0.11.268, P36-A)');
      assert(/^\| 0\.11\.246 \|/m.test(c6) && /^\| 0\.11\.245 \|/m.test(c6) && !/^\| 0\.11\.24[56] \|/m.test(c0), 'MD: 0.11.245 and 0.11.246 moved to changelog-6.md (v0.11.268)'); }
    assert(u.code === 1 && /--update needs the long calendar's numbers too/.test(u.out) && ul.code === 1 && /no kept stats/.test(ul.out) && readFileSync(path.join(SR, 'tools/baseline-long.json'), 'utf8') === before, `LU: --update without the long numbers saves nothing (${u.code}: ${u.out.trim().split('\n').pop()} / ${ul.code}: ${ul.out.trim().split('\n').pop()})`);
}

// v0.11.269 (owner pick P37-A): the dangling open items placed: S0, SH, L3 and TC to 5b, L4 closed, RT, the moves (rule 5, MD)
{
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const ho = rd('project/handover.md'), h53 = rd('project/history-53.md'), r1 = rd('project/roadmap.md'), r2 = rd('project/roadmap-2.md'), d5 = rd('project/roadmap-done-5.md'), cl = rd('CLAUDE.md'), wa = rd('project/working-agreement.md');
    const s2b = r1.slice(r1.indexOf('## 2b. The polish pass'), r1.indexOf('*(Sections 3–6 and Decided'));
    const stale = ["- **From v0.11.214's review (for the owner, no fault)", '- **The time scale (the owner 2026-11-16 17:54 and 18:04)', '- *(v0.11.253, owner pick RP-A, PL-F)* **The plan for Friday', "- **The order (the owner's, 2026-11-09 00:43; RA1 2026-11-14):**"];
    assert(stale.every((k) => h53.includes(k) && !ho.includes(k)) && ho.includes("the one order is `roadmap.md`'s Order line"), 'P37-A SH: the four stale handover items moved word for word to history-53.md, a pointer left');
    assert(h53.startsWith('# Bone and Ash — history, part 53') && h53.includes('## v0.11.266 — ') && !ho.includes('## v0.11.266 — ') && h53.includes('- **v0.11.266: P34-A') && !ho.includes('- **v0.11.266: P34-A') && h53.includes("- **NEXT PUSH: open, options later.** The long calendar's drift guard and the targets (v0.11.268)") && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */, 'T1 (rule 5): v0.11.266\'s notes, decision and the next-push entry moved word for word to part 53 (new, v0.11.269)');
    assert(r1.includes('*(v0.11.269: the dangling open items placed') /* v0.11.270: no longer the first note */ && r1.includes('*(v0.11.268: the long calendar\'s drift guard and the targets'), 'P37-A S0: section 0 has the v0.11.268 and v0.11.269 notes');
    assert(s2b.includes('**L3, the read round\'s hold line**') && s2b.includes('**TC, the owner\'s calls on the texts**') && s2b.includes('Gao Feng as Lu Han\'s "cousin"') && !r2.includes('Gao Feng as Lu Han\'s "cousin"') && r2.includes('**The owner\'s calls on the texts:** moved word for word to `roadmap.md` section 2b'), 'P37-A L3, TC: in step 5b, TC moved word for word from roadmap-2.md section 6');
    assert(d5.includes('### Closed as accepted (P37-A, L4)') && d5.includes('- *(v0.11.266, owner picks P34-A, LF-A, TB-A;') && !r1.includes('- *(v0.11.266, owner picks P34-A, LF-A, TB-A;') && Buffer.byteLength(r1) <= MIRROR_MAX, `P37-A L4 closed; v0.11.266's done line moved (MD; roadmap.md ${Buffer.byteLength(r1)} bytes)`);
    const r2line = (cl.match(/^2\. .*$/m) || [''])[0];
    assert(r2line.includes('`node tools/sanity.mjs --update --last`') && !/`node tools\/sanity\.mjs --update`/.test(cl) && wa.includes('`node tools/sanity.mjs --update --last`') && !/`node tools\/sanity\.mjs --update`/.test(wa), 'P37-A RT: rule 2 and the working agreement name --update --last');
    assert(/^\| 0\.11\.247 \|/m.test(rd('project/changelog-6.md')) && !/^\| 0\.11\.247 \|/m.test(rd('project/changelog.md')) && /^\| 0\.11\.238 \|/m.test(rd('project/restore-points-4.md')) && !/^\| 0\.11\.238 \|/m.test(rd('project/restore-points.md')), 'MD: 0.11.247 to changelog-6.md, 0.11.238 to restore-points-4.md (v0.11.269)');
}

// v0.11.270 (owner pick P38-A): section 4, systems, before Act 2 (RO), the Order line's slips (SL), the headings (HW), section 4's note (BM)
{
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const r1 = rd('project/roadmap.md'), r2 = rd('project/roadmap-2.md'), a2 = rd('project/roadmap-act2.md'), ho = rd('project/handover.md'), h53 = rd('project/history-53.md'), d5 = rd('project/roadmap-done-5.md');
    const order = (r1.match(/^\*\*Order\*\*.*$/m) || [''])[0];
    const at = (t) => order.indexOf(t);
    assert(at('**5. section 2, the retune**') > 0 && at('**5. section 2, the retune**') < at('**5b. the polish pass**') && at('**5b. the polish pass**') < at('**6. section 4, systems**') && at('**6. section 4, systems**') < at('**7. A2, Act 2**') && at('**7. A2, Act 2**') < at('**8. section 3, the art pass**') && at('**8. section 3, the art pass**') < at('**9. section 5, later**'), 'P38-A RO: the Order line runs the retune, 5b, systems, Act 2, art, later');
    assert(order.includes('YM-3, FC-w, L3, TC, NF-g, PK, LT, the polish notes; **2–3**') && order.includes('Act 2 starts after about 19–33'), 'P38-A SL: 5b\'s eight items and the start of Act 2 in the Order line');
    assert(r1.includes('## A2. Act 2 (step 7: after section 4, systems;') && r1.includes('## 2b. The polish pass (step 5b: after the retune, before the systems and Act 2;') && r2.includes('## 4. Systems still to build (step 6: after the retune and the polish pass, before Act 2;') && a2.includes('Act 2 is step 7 of `roadmap.md`\'s Order line'), 'P38-A HW: the headings agree with the Order line');
    assert(r2.includes('*(v0.11.270, owner pick P38-A, BM,') && r2.includes('the long-calendar drift guard (both since v0.11.268)'), 'P38-A BM: section 4 says how its balance pushes are checked');
    assert(h53.includes('## v0.11.267 — ') && !ho.includes('## v0.11.267 — ') && h53.includes('- **v0.11.267: P35-A + RV-A') && !ho.includes('- **v0.11.267: P35-A + RV-A') && h53.includes('- **NEXT PUSH: open, options later.** The dangling open items placed (v0.11.269)') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ && h53.indexOf('## Moved from the handover in v0.11.270') < h53.indexOf('## Moved from the handover in v0.11.269'), 'T1 (rule 5): v0.11.267\'s notes, decision and the next-push entry moved word for word to part 53 (v0.11.270)');
    assert(d5.includes('- *(v0.11.267, owner picks P35-A, RV-A;') && !r1.includes('- *(v0.11.267, owner picks P35-A, RV-A;') && Buffer.byteLength(r1) <= MIRROR_MAX, 'MD: v0.11.267\'s done line moved to roadmap-done-5.md (v0.11.270)');
}

// v0.11.271 (owner picks P39-A, JW-A): v0.11.268's handover items and notes in history-54.md (a new part: history-53.md would pass 20 KB), the done line and the rows moved (MD)
{
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const ho = rd('project/handover.md'), h54 = rd('project/history-54.md'), h53 = rd('project/history-53.md'), r1 = rd('project/roadmap.md'), d5 = rd('project/roadmap-done-5.md');
    const cl = rd('project/changelog.md'), c6 = rd('project/changelog-6.md'), rp = rd('project/restore-points.md'), rp4 = rd('project/restore-points-4.md');
    assert(h54.startsWith('# Bone and Ash — history, part 54') && h54.includes('## v0.11.268 — ') && !ho.includes('## v0.11.268 — ') && h54.includes('- **v0.11.268: P36-A') && !ho.includes('- **v0.11.268: P36-A') && h54.includes('- **NEXT PUSH: open, options later.** Systems before Act 2 (v0.11.270)') && h54.includes('**Version:** 0.11.270 (') && ho.includes('## v0.11.272 — ') /* v0.11.274: re-pinned, the oldest kept */ && ho.includes('(now `project/history-54.md`, started in v0.11.271;') && Buffer.byteLength(h53) < 20000, 'P39-A T1 (part 54): v0.11.268\'s notes and decision, the open item and the version line as they stood in history-54.md, the handover names it');
    assert(d5.includes('## Moved in v0.11.271 (word for word;') && d5.includes('- *(v0.11.268, owner pick P36-A; `project/research/p36-measure.md`') && !r1.includes('- *(v0.11.268, owner pick P36-A; `project/research/p36-measure.md`') && (r1.includes('- *(v0.11.271, owner picks P39-A, JW-A;') || d5.includes('- *(v0.11.271, owner picks P39-A, JW-A;')) && Buffer.byteLength(r1) <= MIRROR_MAX, 'P39-A MD: v0.11.268\'s done line in roadmap-done-5.md, the P39-A line in its place');
    assert(c6.includes('| 0.11.248 | 2026-11-21 | `db00ee5` |') && !cl.includes('| 0.11.248 |') && cl.includes('| 0.11.270 | 2026-11-24 | `5ddc52c` |') && /0\.11\.241–0\.11\.(24[89]|2[5-9]\d) in `changelog-6\.md`/.test(cl) && Buffer.byteLength(cl) <= MIRROR_MAX, 'P39-A MD: the changelog\'s 0.11.248 row in part 6, 0.11.270\'s commit filled in');
    assert(rp4.includes('| 0.11.239 | `cda6a54` |') && !rp.includes('| 0.11.239 |') && /Older versions \(0\.11\.172–0\.11\.2(39|40|41)\)/.test(rp) /* v0.11.273: 0.11.240 moved too; v0.11.274: 0.11.241 */ && rp.includes('| 0.11.270 | `5ddc52c` |') && Buffer.byteLength(rp) <= MIRROR_MAX, 'P39-A MD: the restore points\' 0.11.239 row in part 4, 0.11.270\'s commit filled in');
}

// v0.11.272 (owner pick P40-A): KC, the models test's --kept-clears (a kept Core Formation reaches the bots: KA's (a), the P39 review's L3
// closed), and TG6 (the P35 review's), the fight texts as the text lint's pool `fight`
{
    const MT = readFileSync(path.join(ROOT, 'tests/models.test.mjs'), 'utf8');
    const models = (args) => { try { return { code: 0, out: execFileSync(process.execPath, ['tests/models.test.mjs', ...args], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }) }; } catch (e) { return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || '') }; } };
    assert(models(['--kept-clears', '2', '--games', '0']).code === 2 && models(['--kept', '--kept-clears', '0', '--games', '0']).code === 2 && models(['--kept', '--kept-clears', '1.5', '--games', '0']).code === 2, 'P40-A KC: --kept-clears refused without --kept, below 1, or not a whole number');
    assert(MT.includes('g.stats.clears = Math.max(g.stats.clears || 0, Number(KEPT_CLEARS) - 1)') && MT.indexOf('Number(KEPT_CLEARS) - 1') < MT.indexOf("goTo(g, SCENES, 'a1_again')"), 'P40-A KC: the clears held before the first pass\'s bite (the bite adds its own)');
    const one = models(['--model', 'completionist', '--kept', '--kept-clears', '2', '--games', '1', '--off', '0', '--workers', '1']);
    assert(one.code === 0 && /this second pass starts at realm 2\.00 \(2 won clears held, --kept-clears\)/.test(one.out), `P40-A KC: with 2 clears held the Completionist (Core Formation at its clear) starts the kept pass at Core Formation (${(one.out.match(/this second pass starts at realm [^,]*/) || ['none'])[0]})`);
    const P = await import('../tools/packet.mjs');
    const { TELL_TEXT, SAY_TEXT, FOE_TRAITS } = await import('../js/core/game.js');
    const fight = P.lintCorpus().filter((x) => x.id === 'pool:fight').map((x) => x.t);
    assert(fight.includes(TELL_TEXT.bigRead[0]) && fight.includes(SAY_TEXT.tells[0]) && fight.includes(FOE_TRAITS.plated.pierced) && !fight.includes(FOE_TRAITS.plated.tag) && new Set(fight).size === fight.length, `P40-A TG6: the fight texts in the lint's corpus as pool:fight, once each, the traits' tags left out (${fight.length} lines)`);
    const tb = JSON.parse(readFileSync(path.join(ROOT, 'tools/text-baseline.json'), 'utf8'));
    assert(tb.pools?.fight?.lines === fight.length && tb.pools.fight.tics === 0 && tb.pools.fight.broken === 0, `P40-A TG6: the snapshot holds the pool (${JSON.stringify(tb.pools?.fight)})`);
    // the moves (MD, H2): v0.11.269's handover items in history-54.md, v0.11.271's done line in roadmap-done-5.md, 0.11.249's row in changelog-6.md
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const ho = rd('project/handover.md'), h54 = rd('project/history-54.md'), r1 = rd('project/roadmap.md'), d5 = rd('project/roadmap-done-5.md'), cl = rd('project/changelog.md'), c6 = rd('project/changelog-6.md'), rt = rd('project/roadmap-retune.md');
    assert(h54.includes('## Moved from the handover in v0.11.272 (word for word)') && h54.includes('## v0.11.269 — ') && !ho.includes('## v0.11.269 — ') && h54.includes('- **v0.11.269: P37-A') && !ho.includes('- **v0.11.269: P37-A') && h54.includes('**Version:** 0.11.271 (') && ho.includes('## v0.11.272 — ') && h54.indexOf('## Moved from the handover in v0.11.272') < h54.indexOf('## Moved from the handover in v0.11.271') && Buffer.byteLength(h54) < 20000, 'P40-A H2: v0.11.269\'s notes and decision, the open item and the version line as they stood in history-54.md');
    assert(d5.indexOf('## Moved in v0.11.272 (word for word;') >= 0 && d5.indexOf('## Moved in v0.11.272 (word for word;') < d5.indexOf('## Moved in v0.11.271 (word for word;') && d5.includes('- *(v0.11.271, owner picks P39-A, JW-A;') && !r1.includes('- *(v0.11.271, owner picks P39-A, JW-A;') && (r1.includes('- *(v0.11.272, owner pick P40-A;') || d5.includes('- *(v0.11.272, owner pick P40-A;')) /* v0.11.273: moved to roadmap-done-5.md */ && r1.includes('~~TG6, the P39 review\'s L3~~ (done in v0.11.272)') && Buffer.byteLength(r1) <= MIRROR_MAX, 'P40-A MD: v0.11.271\'s done line in roadmap-done-5.md, the P40-A line in its place, the Order line');
    assert(c6.includes('| 0.11.249 | 2026-11-21 | `73e2bdd` |') && !cl.includes('| 0.11.249 |') && cl.includes('| 0.11.271 | 2026-11-24 | `fabf772` |') && Buffer.byteLength(cl) <= MIRROR_MAX && rt.includes('*(v0.11.272, owner pick P40-A: **closed**:'), 'P40-A MD: 0.11.249\'s row in changelog-6.md, 0.11.271\'s commit filled in; KA\'s (a) closed');
}

// v0.11.273 (owner pick P41-A): FZ the frozen sections, SW skillWatch, TL the times lint (roadmap-retune.md's tools line)
{
    const st = (o) => ({ games: 100, oneCoil: 25, act1Clear: { 4: 50, 5: 50 }, ...o });
    // FZ: a made-up frozen number; out fails, near and in are log only, not played fails nothing
    const FZ = [{ id: 'F1', section: 'the prologue', what: 'the whole game on Coil 1', metric: 'oneCoil', models: ['completionist', 'cultivator', 'careful'], min: 20, max: 30, said: 'test' }];
    const fz = frozenLines(FZ, { completionist: st(), cultivator: st({ oneCoil: 10 }) });
    assert(fz.lines.length === 3 && fz.fails === 1 && /^ {2}FROZEN {2}F1 the prologue completionist the whole game on Coil 1: 25% \(frozen 20–30%; n 100\): in$/.test(fz.lines[0]) && /cultivator .*: 10% .*: out \(fails the check\)$/.test(fz.lines[1]) && /careful: not played in this run$/.test(fz.lines[2]), `FZ: frozenLines (${JSON.stringify(fz)})`);
    assert(frozenLines(FZ, { completionist: st({ oneCoil: 19 }) }).fails === 0 && frozenLines(undefined, {}).fails === 0 && frozenLines([{ ...FZ[0], metric: 'act1MeanCoil', min: undefined, max: undefined, target: 4.5, about: 0.5, models: ['careful'] }], { careful: st() }).lines[0].includes('frozen 4–5'), 'FZ: near is log only; no frozen list fails nothing; target ± about');
    assert(flagLines(fz.lines.join('\n')).length === 3, 'FZ: the check\'s compact output keeps the FROZEN lines');
    const TJ = JSON.parse(readFileSync(path.join(ROOT, 'tools/targets.json'), 'utf8'));
    assert(Array.isArray(TJ.frozen) && TJ.frozen.length === 0 && /owner's word/.test(TJ.frozen_note), 'FZ: tools/targets.json has an empty frozen list until the owner freezes a section');
    const SN = readFileSync(path.join(ROOT, 'tools/sanity.mjs'), 'utf8');
    assert(/frozenLines\(TJ\.frozen, L\)/.test(SN) && /const total = fails \+ flags\.length \+ longFlags \+ frozenFails;/.test(SN), 'FZ: tools/sanity.mjs prints the FROZEN lines and an out fails the check');
    const WA = readFileSync(path.join(ROOT, 'project/working-agreement.md'), 'utf8');
    assert(/\*\*RR, the freeze rule\*\*/.test(WA) && /\*\*CO, the order for checking numbers\*\*/.test(WA), 'RR, CO: the rules are in working-agreement.md');
    // SW: skillWatch
    const sk = (t, l, x) => ({ tier: t, level: l, xp: x });
    const g = { james: { skills: { 'Convergence Use': sk(1, 2, 5) }, gu: sk(1, 1, 0) }, yuki: { qiUse: sk(1, 1, 0), fight: sk(1, 1, 0) } };
    const a = skillPrint(g); g.james.gu.xp = 9; const b = skillPrint(g);
    assert(a !== b && a.includes('Convergence Use=1.2.5') && a.includes('gu=1.1.0') && b.includes('gu=1.1.9'), `SW: skillPrint (${a} / ${b})`);
    assert(['GU +9 XP', 'Convergence Use at T10 L10 (cap)', 'Yuki (bond) Qi Use +4', 'Yuki Fight +3 → T1 L2, level with James\'s GU (held)', 'Yuki Fight held at James\'s GU (T1 L1)'].every((l) => XP_LINE.test(l)) && !XP_LINE.test('+2 cinder hawk (as fowl).'), 'SW: XP_LINE reads the XP, cap and Yuki lines, not a find');
    assert(linesOf(['a', 2, 'b']).join() === 'a,b' && linesOf({ lines: ['c'] }).join() === 'c' && linesOf({ days: [{ lines: ['d'] }, { lines: ['e'] }] }).join() === 'd,e' && linesOf(null).length === 0, 'SW: linesOf reads arrays, { lines } and runWeek\'s days');
    assert(silentSkill(a, b, ['You walk.']) && !silentSkill(a, b, ['GU +9 XP']) && !silentSkill(a, a, []), 'SW: silent = a skill moved with no XP line');
    assert(/^careful: skillWatch \(log only\): 2 silent skill changes in 40 steps that moved a skill \(0\.20 a game\); most at x 2$/.test(skillWatchLine('careful', { games: 10, skillWatch: { steps: 40, silent: 2, at: { x: 2 } } })), 'SW: the log line');
    const MT = readFileSync(path.join(ROOT, 'tests/models.test.mjs'), 'utf8');
    assert(/key === swKey/.test(MT) && (MT.match(/see\(/g) || []).length >= 15 && /skillWatchLine\(m, st\)/.test(MT), 'SW: tests/models.test.mjs watches every step (the Coil\'s restart left out) and prints the line');
    // TL: the times lint
    assert(ENGINE_MINUTES.talk === 10 && ENGINE_MINUTES.meal === 45 && ENGINE_MINUTES.wilderness === 75 && ENGINE_MINUTES.sleep === 480 && TL_KINDS.length === 8, 'TL: the engine\'s times (Rules Engine C, 37e7643)');
    assert(kindOf('Sleep. What\'s left of the night.') === 'sleep' && kindOf('"Morning."') === 'talk' && kindOf('Eat the fish.') === 'meal' && kindOf('Climb the ridge.') === null, 'TL: kindOf');
    assert(engineFor(null, 'move').by === 'travel' && engineFor(null, 'move').max === 75 && engineFor(null, 'act') === null && engineFor('talk', 'act').min === 10, 'TL: engineFor');
    assert(CLOCKED.test('(g) => sleepUntil(g, 6)') && !CLOCKED.test('(g) => addItem(g, \'fish\')'), 'TL: CLOCKED');
    const FS = { a: { place: 'x', choices: [{ text: '"Hello."', to: 'b' }, { text: 'Walk on.', to: 'c' }, { text: 'Fish.', time: 60, to: 'b' }, { text: 'Fight.', combat: () => ({}), to: 'b' }, { text: 'Sleep.', to: 'b' }, { text: 'Sleep now.', to: 'b', do: (g) => sleepUntil(g) }, { text: 'Where?', to: () => 'b' }] }, b: { place: 'x', choices: [] }, c: { place: 'y', choices: [] } };
    const sleepUntil = () => 0;
    const lt = lintTimes(FS, (sc, f, c, t, moved) => (c.time != null || c.combat ? 0 : moved ? 20 : 10), (c) => c.text);
    assert(lt.count.choices === 7 && lt.count.own === 1 && lt.count.fights === 1 && lt.count.computed === 1 && lt.count.clocked === 1 && lt.count.defaults === 3 && lt.rows.find((r) => r.at === 'a:4').off === 470 && lt.rows.find((r) => r.at === 'a:1').cls === 'move' && lt.rows.find((r) => r.at === 'a:1').off === 0 && lt.rows.find((r) => r.at === 'a:0').off === 0, `TL: lintTimes (${JSON.stringify(lt.count)})`);
    const tl = timeLintLines(lt, { list: true });
    assert(/^times lint \(log only/.test(tl[0]) && tl.some((l) => /^ {2}sleep \(engine 480 min\): 1 choices, 1 off the engine's time \(470 min in all\)$/.test(l)) && tl.some((l) => /^ {4}a:4 talk 10 → sleep 480: Sleep\.$/.test(l)), `TL: the lines (${tl.join(' | ')})`);
    const textOf = (c) => (typeof c.text === 'string' ? c.text : '');
    const real = lintTimes(SCENES, defaultMinutes, textOf);
    const off = real.rows.filter((r) => r.off).length;
    assert(real.count.choices > 800 && real.count.defaults > 150 && real.count.choices === real.count.own + real.count.fights + real.count.none + real.count.computed + real.count.clocked + real.count.defaults, `TL: the game's choices all counted (${JSON.stringify(real.count)})`);
    console.log(`  (log) TL: ${real.count.choices} choices, ${real.count.defaults} on the default time, ${off} off Rules Engine C's times`);
}

// v0.11.274 (owner pick P42-A; `claude/p42-options.md`): EB + HL the bots' eating and the hungry line, LK the kept lift's lines in
// skillWatch, TL-r the reviewed times (the game's side, EH, LK and TL-a, in tests/story.test.mjs's P42-A block)
{
    const T = 'P42-A';
    const { EAT_CHOICE, EAT_ANY, eatOpen } = await import('./lib/forced.mjs');
    assert(['Eat something.', 'Cook and eat.', 'Eat something from the hammerspace.'].every((l) => EAT_CHOICE.test(l)) && !EAT_CHOICE.test('Eat with the others.') && !EAT_CHOICE.test('Eat at the communal pot.'), `${T} (EB): EAT_CHOICE, the story screens' own Eat choices`);
    assert(eatOpen(['Go in.', 'Eat something.']) && eatOpen(['Eat at the communal pot.']) && eatOpen(['Chew a ghost-gill.']) && !eatOpen(['Eat with the others.', 'Rest an hour.']) && !eatOpen([]) && EAT_ANY.test('Cook and eat.'), `${T} (HL): eatOpen, anything to eat on the screen`);
    const MT = readFileSync(path.join(ROOT, 'tests/models.test.mjs'), 'utf8');
    assert(/if \(careLike\(model\) && g\.james\.satiety < 50\) \{ const e = choices\.find\(\(c\) => EAT_CHOICE\.test\(c\.label\)\); if \(e\) return e\.index; \}/.test(MT), `${T} (EB): Careful and the Sociable take an open Eat choice under Fed 50, before their calm pick`);
    assert(MT.indexOf('EAT_CHOICE.test(c.label)') < MT.indexOf('if (careLike(model)) { const calm'), `${T} (EB): the Eat rule comes before the calm pick`);
    assert(/g\.james\.satiety < 30 && foodLeft\(g\) && !eatOpen\(hereLabels\(g\)\)/.test(MT) && /const hereLabels = \(g\) =>/.test(MT), `${T} (HL): the hungry count only where nothing to eat is open`);
    assert(/else if \(swPrint !== null && key !== swKey && g\.coil\?\.kept\)/.test(MT) && /\(restart\)/.test(MT) && /newGame\(g\.seed, \{ closed: true \}\)/.test(MT), `${T} (LK): a kept Coil's restart compared with the skills it started over from`);
    const SWT = readFileSync(path.join(ROOT, 'tests/lib/skillwatch.mjs'), 'utf8');
    assert(/v0\.11\.274 \(owner pick P42-A, LK\)/.test(SWT), `${T} (LK): skillwatch.mjs says the restart is watched`);
    const { movedUnnamed } = await import('./lib/skillwatch.mjs');
    const p0 = 'Convergence Use=1.1.0|gu=1.1.0|yq=1.1.0|yf=1.1.0', L3 = ['Convergence Use +120 XP → T1 L3', 'GU +120 XP → T1 L3', 'Yuki (bond) Qi Use +120 → T1 L3'];
    assert(movedUnnamed(p0, 'Convergence Use=1.3.45|gu=1.3.45|yq=1.3.45|yf=1.1.0', L3).length === 0 && movedUnnamed(p0, 'Convergence Use=1.3.45|gu=1.3.45|yq=1.3.45|yf=1.2.0', L3).join() === 'yf' && movedUnnamed(p0, 'Convergence Use=1.1.5|gu=1.1.0|yq=1.1.0|yf=1.1.0', ['You walk.']).join() === 'Convergence Use', `${T} (TG5): movedUnnamed, a moved skill no line names`);
    assert(/silentSkill\(from, sp, swSeen\) \|\| movedUnnamed\(from, sp, swSeen\)\.length/.test(MT), `${T} (TG5): the restart watch counts by skill too`);
    // TL-r: the 14 reviewed choices, each with its reason; the game's lint reads 0 off
    const TLM = await import('../tools/lib/timelint.mjs');
    const R = Object.entries(TLM.REVIEWED);
    assert(R.length === 15 && R.filter(([, [, why]]) => /^the night is slept on a later screen/.test(why)).length === 7 && R.filter(([, [, why]]) => /^a misread: /.test(why)).length === 7 && /takes an hour by its own result/.test(TLM.REVIEWED['fo_spy:1'][1]), `${T} (TL-r): 7 sleeps, 7 misreads and fo_spy:1 (the review's M1) reviewed`);
    assert(TLM.reviewedOf('hunt:2', 'Leave it. Glass armour') && !TLM.reviewedOf('hunt:2', 'Fight it.') && !TLM.reviewedOf('hunt:3', 'Leave it.'), `${T} (TL-r): a key and its text's start must both match`);
    await import('../js/core/tasks.js'); const lt = TLM.lintTimes(SCENES, defaultMinutes, TLM.textOfChoice); // as tools/timelint.mjs reads them
    const off = lt.rows.filter((r) => r.off).length, rev = lt.rows.filter((r) => r.reviewed).length;
    assert(off === 0 && rev === 15, `${T} (TL-a + TL-r): the game's times lint reads 0 off, 15 reviewed (${off} off, ${rev} reviewed)`);
    assert(TLM.timeLintLines(lt).some((l) => /^ {2}sleep \(engine 480 min\): 7 choices, 0 off the engine's time, 7 reviewed and kept$/.test(l)), `${T} (TL-r): the lint's line names the reviewed`);
}
// v0.11.274 (owner pick P42-A): the moves (MD, H2): v0.11.271's handover items in history-54.md, v0.11.273's done line in the new
// roadmap-done-6.md, 0.11.251's changelog row in part 6, 0.11.241's restore point in part 4
{
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const ho = rd('project/handover.md'), h54 = rd('project/history-54.md'), r1 = rd('project/roadmap.md'), d6 = rd('project/roadmap-done-6.md'), cl = rd('project/changelog.md'), c6 = rd('project/changelog-6.md'), rp = rd('project/restore-points.md'), rp4 = rd('project/restore-points-4.md');
    assert(h54.indexOf('## Moved from the handover in v0.11.274 (word for word)') >= 0 && h54.indexOf('## Moved from the handover in v0.11.274') < h54.indexOf('## Moved from the handover in v0.11.273') && h54.includes('## v0.11.271 — ') && !ho.includes('## v0.11.271 — ') && h54.includes('- **v0.11.271: P39-A') && !ho.includes('- **v0.11.271: P39-A') && h54.includes('**Version:** 0.11.273 (') && ho.includes('## v0.11.274 — ') && ho.includes('- **v0.11.274: P42-A') && Buffer.byteLength(h54) < 20000 && Buffer.byteLength(ho) < 35000, 'P42-A (H2): v0.11.271\'s notes and decision, the open item and the version line in history-54.md; v0.11.274\'s in the handover');
    assert(d6.startsWith('# Roadmap: done, stale and moot, part 6') && d6.includes('- *(v0.11.273, owner pick P41-A;') && !r1.includes('- *(v0.11.273, owner pick P41-A;') && r1.includes('- *(v0.11.274, owner pick P42-A;') && r1.includes('~~P41\'s three leftovers~~ (done in v0.11.274') && Buffer.byteLength(r1) <= MIRROR_MAX, 'P42-A (MD): v0.11.273\'s done line in roadmap-done-6.md, the P42-A line in its place, the Order line');
    assert(c6.includes('| 0.11.251 | 2026-11-22 | `bfab4ff` |') && !cl.includes('| 0.11.251 |') && cl.includes('| 0.11.273 | 2026-11-25 | `adfd7d6` |') && Buffer.byteLength(cl) <= MIRROR_MAX && rp4.includes('| 0.11.241 | `736cee7` |') && !rp.includes('| 0.11.241 |') && rp.includes('| 0.11.273 | `adfd7d6` |') && Buffer.byteLength(rp) <= MIRROR_MAX, 'P42-A (MD): 0.11.251\'s changelog row in part 6, 0.11.241\'s restore point in part 4, 0.11.273\'s commit filled in');
}
// v0.11.273 (owner pick P41-A): the moves (MD, H2): v0.11.270's handover items in history-54.md with reference.md's dice-era balance block, v0.11.272's done line in roadmap-done-5.md, 0.11.250's and 0.11.240's rows
{
    const rd = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const ho = rd('project/handover.md'), h54 = rd('project/history-54.md'), r1 = rd('project/roadmap.md'), d5 = rd('project/roadmap-done-5.md'), cl = rd('project/changelog.md'), c6 = rd('project/changelog-6.md'), rp = rd('project/restore-points.md'), rp4 = rd('project/restore-points-4.md'), ref = rd('project/reference.md'), rt = rd('project/roadmap-retune.md'), tn = rd('project/tuning-notes.md');
    assert(h54.includes('## Moved from the handover in v0.11.273 (word for word)') && h54.includes('## v0.11.270 — ') && !ho.includes('## v0.11.270 — ') && h54.includes('- **v0.11.270: P38-A') && !ho.includes('- **v0.11.270: P38-A') && h54.includes('**Version:** 0.11.272 (') && ho.includes('## v0.11.273 — ') && ho.includes('- **v0.11.273: P41-A') && h54.indexOf('## Moved from the handover in v0.11.273') < h54.indexOf('## Moved from the handover in v0.11.272') && Buffer.byteLength(h54) < 20000 && Buffer.byteLength(ho) < 35000, 'P41-A H2: v0.11.270\'s notes and decision, the open item and the version line as they stood in history-54.md');
    assert(h54.includes('**Balance (v0.4.0, smart combat, random hub choices;') && !ref.includes('**Balance (v0.4.0, smart combat') && !/GU \+ d6/.test(ref) && !/James rolls GU/.test(ref) && ref.includes('`project/tuning-notes.md`'), 'P41-A CO: reference.md\'s dice-era balance block moved word for word to history-54.md, the combat and rules lines cleaned');
    assert(d5.indexOf('## Moved in v0.11.273 (word for word;') >= 0 && d5.indexOf('## Moved in v0.11.273 (word for word;') < d5.indexOf('## Moved in v0.11.272 (word for word;') && d5.includes('- *(v0.11.272, owner pick P40-A;') && !r1.includes('- *(v0.11.272, owner pick P40-A;') && (r1.includes('- *(v0.11.273, owner pick P41-A;') || readFileSync(path.join(ROOT, 'project/roadmap-done-6.md'), 'utf8').includes('- *(v0.11.273, owner pick P41-A;')) /* v0.11.274: moved to part 6 */ && r1.includes('~~`roadmap-retune.md`\'s tools and rules~~ (done in v0.11.273') && Buffer.byteLength(r1) <= MIRROR_MAX, 'P41-A MD: v0.11.272\'s done line in roadmap-done-5.md, the P41-A line in its place, the Order line');
    assert(c6.includes('| 0.11.250 | 2026-11-21 | `09031fa` |') && !cl.includes('| 0.11.250 |') && cl.includes('| 0.11.272 | 2026-11-25 | `907e6b7` |') && Buffer.byteLength(cl) <= MIRROR_MAX && rp4.includes('| 0.11.240 | `15e5583` |') && !rp.includes('| 0.11.240 |') && rp.includes('| 0.11.272 | `907e6b7` |') && Buffer.byteLength(rp) <= MIRROR_MAX, 'P41-A MD: 0.11.250\'s changelog row in part 6, 0.11.240\'s restore point in part 4, 0.11.272\'s commit filled in');
    assert(rt.includes('## Status notes (v0.11.273, owner pick P41-A') && rt.includes('BD, the bots\' daily doors on the plan') && rt.includes('*(v0.11.273, owner pick P41-A: closed as not taken: re-measured, T1\'s Cultivator 25.0 → 17.3%') && rt.includes('*(v0.11.273, owner pick P41-A: closed, re-measured unchanged:'), 'P41-A: the tools line\'s status, BD and HN closed in roadmap-retune.md (the pinned block untouched)');
    assert(tn.startsWith('# Tuning notes') && ['## The loop', '## The order for checking a number (CO)', '## The targets now', '## The knobs by section', '## Frozen sections', '## The log-only tools', '## The logs'].every((h) => tn.includes(h)) && tn.includes('`XP_RATE` 0.6') && tn.includes('`HP_TUNE_HIGH`'), 'P41-A TN: project/tuning-notes.md has its sections and the knobs');
}
rmSync(TMP, { recursive: true, force: true });

console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
