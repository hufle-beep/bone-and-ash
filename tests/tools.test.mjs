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
import { sparePlan, SPARE_FROM, SPARE_UNTIL, SPARE_QI_HOURS, SPARE_FED_MIN } from './lib/spare.mjs'; // v0.11.142 (owner pick CV1)
import { artFiles, fingerprint, readArt, checkArt, writeArt, ART_RE } from '../tools/arthash.mjs'; // v0.11.39
import { TACTICS, FIXED, rank, rankLabel, stream, isOneMove, playFight, sampleFight, sampleOrder, tacticStats, thirds, guNeeded, summarize, summarizeAll, tableLines } from '../tools/lib/fightlab.mjs'; // v0.11.80
import { SCENES } from '../js/story/prologue.js'; // v0.11.80: the story's hooks, for the fight lab's real fight
import { newGame, ensureBars, combatHooks, startCombat, combatStep } from '../js/core/game.js'; // v0.11.80
import { shingles, reusedPassages, favouritePhrases, tics, broken, spacing, snapshotDiff, shareNote, poolCounts } from '../tools/lib/textlint.mjs'; // v0.11.132 (E1); v0.11.134 (LP2, LR): poolCounts
import { docFindings, newestHistory, newestResearch, HANDOVER_MAX, HISTORY_MAX, RESEARCH_MAX, DOC_TOOL_MAX } from '../tools/lib/docs.mjs'; // v0.11.73; v0.11.78 the research parts

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
    assert(jobs.filter((j) => j.heavy).map((j) => j.key).sort().join() === 'models,story,tasks', `${mode}: the heavy jobs are tasks, story and the bot models (v0.11.27)`);
    assert(validateJobs(jobs.map((j) => ({ ...j, cmd: ['x', []] }))).length === 0, `${mode}: validateJobs finds no problem`);
    if (mode === 'full') {
        const s = jobs.find((j) => j.key === 'sanity');
        assert(s && s.after.includes('tasks') && s.after.includes('story'), 'full: sanity waits for tasks and story');
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
    assert(/500 games each/.test(list().jobs?.find((j) => j.key === 'models')?.name ?? '') && /50 games each/.test(list('quick').jobs?.find((j) => j.key === 'models')?.name ?? ''), 'the models step: 500 games each in the full check, 50 in quick (v0.11.28)');
    // the real report format: a tiny models run, Yuki off only for the listed model
    let rep = '';
    try { rep = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful,rusher', '--games', '4', '--off', '2', '--off-models', 'careful', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { rep = String(e.stdout || e); }
    const heads = [...rep.matchAll(/^\[([^\]]+)\] (\d+) games/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    assert(heads === 'careful 4,careful:yukiOff 2,rusher 4', `models --off-models careful: Yuki off only for Careful, no Random (${heads})`);
    const dg = modelDigest(rep);
    assert(dg?.length === 3 && dg.every((l) => /prologue C1 dead [\d.]+% · mean Coil ([\d.]+|—) \/ ([\d.]+|—) · whole game C1 [\d.]+%( · realm [\d.]+)?( · \d+ gave up)?$/.test(l)), `modelDigest reads the real report, one line per model (${dg?.join(' | ') ?? 'null'})`);
    assert(modelDigest(rep, 3)?.length === 3 && modelDigest(rep, 4) === null, 'modelDigest: a missing model block prints the whole report');
    const gaveUp = modelDigest('[rusher] 9 games, 1 cards (1 forced: a screen with no story exit), 7 gave up after Coil 8\n  prologue: C1 dead 100% (n 9)\n  cleared: prologue 22.2% (mean Coil 7.00) · Act 1 22.2% (mean Coil 7.00) · the whole game on Coil 1 0%');
    assert(/· 7 gave up$/.test(gaveUp?.[0] ?? ''), `modelDigest keeps the games that gave up (${gaveUp?.[0]})`);
    let bad = 0;
    try { execFileSync(process.execPath, ['tests/models.test.mjs', '--games', '1', '--off-models', 'nobody'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { bad = e.status; }
    assert(bad === 2, `models --off-models with an unknown model exits 2 (${bad})`);
    // v0.11.85 (owner pick M1): the Sitter in the models step (its own game count), and a tiny real Sitter run
    const mj = list().jobs?.find((j) => j.key === 'models'), mq = list('quick').jobs?.find((j) => j.key === 'models');
    const src = readFileSync(path.join(ROOT, 'tools/check.mjs'), 'utf8'); // --list gives names only: the job's arguments read from the source
    assert(/the Sitter 150/.test(mj?.name ?? '') && /the Sitter 20/.test(mq?.name ?? '') && src.includes("'--model', 'careful,completionist,rusher,sitter,farmer,cultivator,sociable'") && src.includes("'--sitter-games', QUICK ? '20' : '150'") && src.includes("blocks: QUICK ? 7 : 9") && /the Sociable 500/.test(mj?.name ?? '') && /the Sociable 50,/.test(mq?.name ?? ''), `the models step plays the Sitter: 150 games (20 quick), 9 / 7 blocks (v0.11.86: with the Farmer; v0.11.142: the Cultivator; v0.11.160: the Sociable) (${mj?.name}; ${mq?.name})`);
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
    assert(/the Farmer 100/.test(mj?.name ?? '') && /the Farmer 20/.test(mq?.name ?? '') && src.includes("'--farmer-games', QUICK ? '20' : '100'"), `the models step plays the Farmer: 100 games (20 quick) (${mj?.name}; ${mq?.name})`);
    let farm = '';
    try { farm = execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'careful,farmer', '--games', '3', '--farmer-games', '2', '--off', '0', '--workers', '1'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { farm = String(e.stdout || e); }
    const fh = [...farm.matchAll(/^\[([^\]]+)\] (\d+) games, (\d+) cards/gm)].map((m) => `${m[1]} ${m[2]}`).join();
    assert(fh === 'careful 3,farmer 2' && / 0 failed/.test(farm) && /farmer: 10 bites by choice at the first dawn first, then ×1\.00/.test(farm), `models --farmer-games 2: the Farmer plays its own count, ten bites leave ×1, nothing fails (${fh})`);
    let badF = 0;
    try { execFileSync(process.execPath, ['tests/models.test.mjs', '--model', 'farmer', '--games', '1', '--farmer-games', 'abc'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { badF = e.status; }
    assert(badF === 2, `models --farmer-games abc exits 2 (${badF})`);
    // v0.11.142 (owner pick CV1): the Cultivator in the models step (500 games, 50 quick), its spare-time rule, the cultivation line
    assert(/the Cultivator 500/.test(mj?.name ?? '') && /the Cultivator 50/.test(mq?.name ?? ''), `the models step plays the Cultivator: 500 games (50 quick) (${mj?.name}; ${mq?.name})`);
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
    const cult = (m) => Number(cul.match(new RegExp(`^\\[${m}\\][\\s\\S]*?\\n {2}cultivation: ([\\d.]+) h a game on task screens \\(sits [\\d.]+, meridians [\\d.]+, gather Qi [\\d.]+, breakthroughs [\\d.]+\\) · realm at Act 1's end ([\\d.]+|—)`, 'm'))?.[1] ?? NaN);
    const spare = (m) => Number(cul.match(new RegExp(`^\\[${m}\\][\\s\\S]*?· spare-time cards ([\\d.]+) a game`, 'm'))?.[1] ?? NaN);
    assert(ch === 'completionist 3,cultivator 3' && / 0 failed/.test(cul) && cult('cultivator') > 0 && spare('cultivator') > 0 && spare('completionist') === 0, `CV1: a tiny real run: the Cultivator plays, nothing fails, it queues cards in its spare time and the completionist doesn't (${ch}; ${cult('cultivator')} h; spare ${spare('cultivator')} / ${spare('completionist')} a game)`);
    const dgC = modelDigest(cul, 2);
    assert(dgC?.length === 2 && dgC.every((l) => / · realm [\d.]+$/.test(l)), `CV1: modelDigest shows the realm at Act 1's end (${dgC?.join(' | ') ?? 'null'})`);
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
// v0.11.73 (group h, H1): the docs' own rules in tools/lib/docs.mjs (the handover's size, the newest history part, the roadmap's version)
{
    const ok = { version: '1.2.3', handoverBytes: 34999, histories: { 'history.md': 50000, 'history-2.md': 50000, 'history-10.md': 44000, 'history-9.md': 46000 }, roadmap: '# Roadmap\n\nLast updated: 2026-11-08 (v1.2.3, docs): x\n' };
    assert(newestHistory(Object.keys(ok.histories)) === 'history-10.md' && newestHistory(['history.md']) === 'history.md' && newestHistory([]) === null, 'docs: the newest history part is the highest number (10 after 9, history.md is part 1)');
    const r = docFindings(ok);
    assert(r.fail.length === 0 && r.notes.length === 0, `docs: a handover under ${HANDOVER_MAX} bytes, the newest part under ${HISTORY_MAX} (older parts over it don't count), the roadmap on the version: nothing (${r.fail.concat(r.notes).join('; ')})`);
    const big = docFindings({ ...ok, handoverBytes: HANDOVER_MAX });
    assert(big.fail.length === 1 && /handover\.md is 35000 bytes/.test(big.fail[0]), `docs: a handover of ${HANDOVER_MAX} bytes fails (${big.fail.join('; ')})`);
    const hist = docFindings({ ...ok, histories: { ...ok.histories, 'history-10.md': HISTORY_MAX + 1 } });
    assert(hist.fail.length === 0 && hist.notes.length === 1 && /history-10\.md is 45001 bytes/.test(hist.notes[0]), `docs: the newest part past ${HISTORY_MAX} bytes is a note, not a failure (${hist.notes.join('; ')})`);
    const old = docFindings({ ...ok, roadmap: 'Last updated: 2026-11-08 (v1.2.2, docs)' });
    const none = docFindings({ ...ok, roadmap: '# Roadmap\n' });
    assert(/says 1\.2\.2, sw\.js says 1\.2\.3/.test(old.fail[0] ?? '') && /says nothing/.test(none.fail[0] ?? ''), `docs: the roadmap on an older version, or with no "Last updated" line, fails (${old.fail[0]}; ${none.fail[0]})`);
    // v0.11.78 (S1): the research parts and the docs too big for the project tool (notes, never failures)
    assert(newestResearch(['research.md', 'research-2.md', 'research-10.md', 'roadmap.md']) === 'research-10.md' && newestResearch(['research.md']) === 'research.md' && newestResearch([]) === null, 'docs: the newest research part is the highest number (research.md is part 1)');
    const rs = docFindings({ ...ok, researches: { 'research.md': RESEARCH_MAX + 5000, 'research-2.md': RESEARCH_MAX + 1 } });
    assert(rs.fail.length === 0 && rs.notes.length === 1 && /research-2\.md is 45001 bytes/.test(rs.notes[0]), `docs: only the newest research part past ${RESEARCH_MAX} bytes is a note (${rs.notes.join('; ')})`);
    const tool = docFindings({ ...ok, docs: { 'roadmap.md': DOC_TOOL_MAX, 'changelog.md': DOC_TOOL_MAX + 1 } });
    assert(tool.fail.length === 0 && tool.notes.length === 1 && /changelog\.md is 60001 bytes.*trimming pass/.test(tool.notes[0]), `docs: a doc past ${DOC_TOOL_MAX} bytes is a note naming the trim-then-split rule (${tool.notes.join('; ')})`);
    let code = 0, out = '';
    try { out = execFileSync(process.execPath, ['tools/consistency.mjs'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { code = e.status ?? 1; out = String(e.stdout || e); }
    assert(code === 0 && /handover \d+ bytes/.test(out), `docs: tools/consistency.mjs passes on the real repo, with the handover's size (exit ${code}: ${out.trim().split('\n').pop()})`);
}
// v0.11.88 (owner pick A: T1 + D2 + S1 + X): the roadmap's open work in two parts, sections 0–2 in roadmap.md (with the
// "Last updated" line) and 3–6 with Decided in roadmap-2.md, each pointing at the other; the done lines in roadmap-done.md
// (closed) and roadmap-done-2.md; the tests that read the roadmap read every open part
const ROADMAP_PARTS = ['roadmap.md', 'roadmap-2.md', 'roadmap-act2.md']; // v0.11.171 (owner pick RA1): Act 2's own part
{
    const [r1, r2, ra] = ROADMAP_PARTS.map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8'));
    const secs = (t) => [...t.matchAll(/^## (\d)\. /gm)].map((m) => Number(m[1]));
    assert(secs(r1).join() === '0,1,2' && secs(r2).join() === '3,4,5,6', `roadmap: sections 0–2 in roadmap.md, 3–6 in roadmap-2.md (${secs(r1).join()} / ${secs(r2).join()})`);
    assert(/^Last updated: /m.test(r1) && !/^Last updated: /m.test(r2) && /^## Decided$/m.test(r2) && !/^## Decided$/m.test(r1), 'roadmap: the "Last updated" line in roadmap.md, Decided in roadmap-2.md');
    assert(r1.includes('`roadmap-2.md`') && r2.includes('`roadmap.md`'), 'roadmap: each part names the other');
    const d1 = readFileSync(path.join(ROOT, 'project/roadmap-done.md'), 'utf8'), d2 = readFileSync(path.join(ROOT, 'project/roadmap-done-2.md'), 'utf8');
    assert(d1.includes('`roadmap-done-2.md`') && /^## Moved in v0\.11\.88 \(word for word\)$/m.test(d2) && d2.indexOf('## Moved in v0.11.88') < d2.indexOf('### The old "Last updated" line'), 'roadmap: roadmap-done.md points at roadmap-done-2.md, which starts with v0.11.88');
    for (const t of ['**What the sitting loop\'s fix left', '**The game on a PC, a wide layout', '**Act 2** (open).']) assert((r1 + r2 + ra).includes(t), `roadmap: the open line "${t.replace(/\*/g, '')}" is still in an open part`);
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
    assert(/Now: e, f, Act 2 \(`roadmap-act2\.md`\), then section 2/.test(r1), 'RA1: the order names Act 2 between f and the retune');
    // v0.11.173 (P6A): parts 5 and 6 done, their lines moved word for word to roadmap-done-3.md; the stasis note in roadmap-act2.md
    { const d3 = rd('roadmap-done-3.md'); assert(r1.slice(r1.indexOf('### e. '), f).includes('**Parts 5, 6, 7 and 8: done**') && d3.includes('its stomp texts. **Done in v0.11.175**') && d3.includes('**Part 5, the Blackroot:** **done in v0.11.172**') && d3.includes('**Part 7, the Return:** **done in v0.11.174**') && d3.includes('**Part 6, the Heart:**') && d3.includes('**Done in v0.11.173**'), 'P6A: parts 5 and 6 done, their lines in roadmap-done-3.md (v0.11.174, P7A: and part 7)'); }
    assert(ra.includes('It\'s called the "Sneaky Bastard"') && ra.includes('we will square it when we get there...') && rd('roadmap-done-3.md').includes('`mei_carried_seed`'), 'P6A (rule 6): the owner\'s 03:50 and 03:57 note in roadmap-act2.md; SD in part 7');
    // v0.11.177 (P9A): part 9 done, its line word for word in roadmap-done-3.md; group e keeps its done line with part 9's open items
    assert(rd('roadmap-done-3.md').includes('## Moved in v0.11.177') && rd('roadmap-done-3.md').includes('  - **Part 9 (new), the leftovers of parts 1–4:**'), 'P9A: part 9\'s line moved word for word to roadmap-done-3.md');
    for (const t of ['**Part 9, the leftovers: done in v0.11.177**', // v0.11.175 (P8A): part 8 done, in roadmap-done-3.md
         '**The label pass:**', '**CM, after part 9**']) assert(r1.slice(r1.indexOf('### e. '), f).includes(t), `RA1: group e has "${t.replace(/\*/g, '')}"`);
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
    assert(ho.includes('it\'s really different to spending a few more tokens vs to wait for a job to finish for an hours if it can be done in 10 minutes with parallelization...'), 'P7A (rule 6): the owner\'s note on parallel work in the handover');
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
    const roadmap = ROADMAP_PARTS.map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8')).join('\n'); // v0.11.88 (S1): every open part
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
    assert(nums.length === 10 && nums.every((n, i) => n === i + 1), `CLAUDE.md: ten hard rules, numbered 1 to 10 (${nums.join(', ')})`);
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
    assert(real.code === 0 && /texts and labels that are functions read on 9 sample states/.test(real.out), `LN: the lint reads function texts and passes on the game (${real.out.split('\n').slice(-2).join(' ')})`);
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
    { // v0.11.163 (owner pick TL2): the used-today sample reads a hunt's return line (shown only after a hunt option is used today)
        const bl = path.join(dir, 'js', 'story', 'act1_blackroot.js'); const bsrc = readFileSync(bl, 'utf8');
        assert(bsrc.includes('The pool has gone flat again.'), 'TL2: the planted return line is there to change');
        writeFileSync(bl, bsrc.replace('The pool has gone flat again.', 'The pool has gone \\${flat} again.'));
        const hb = run(dir);
        assert(hb.code === 0 && /BD broken text: 1: dw_hunt \(text\) code/.test(hb.out), `TL2: a template leftover in the Drowned Wood's return line is counted (${(hb.out.match(/BD broken text: [^\n]*/) || [''])[0]})`);
        // RV1 (Opus's L6): the root road's and the Ashen Hills' return lines too
        for (const [from, id] of [['the gravity of a magistrate', 'rr_hunt'], ['The haze over the ridge has nothing in it now.', 'ah_hunt']]) {
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
const RP2_SHA = 'e5088b2cf6accc566581cf0d59f7ff00532bef028e8bef831b2f37295c4aefc2'; // v0.11.158 (RV1, RT): the 91 rows moved to restore-points-2.md, as moved (part 2 never changes)
// v0.11.158 (owner pick NX2, RP): restore-points.md split at 0.11.69 (as the changelog in v0.11.105): every row in exactly one part,
// the old ones in restore-points-2.md, newest first in each, the first part under the project tool's limit with a pointer line
{
    const p1 = readFileSync(path.join(ROOT, 'project/restore-points.md'), 'utf8'), p2 = readFileSync(path.join(ROOT, 'project/restore-points-2.md'), 'utf8');
    const rows = (t) => t.split('\n').filter((l) => /^\| \d+\.\d+\.\d+ \|/.test(l)).map((l) => l.split('|')[1].trim().split('.').map(Number));
    const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const r1 = rows(p1), r2 = rows(p2), all = [...r1, ...r2].map((v) => v.join('.'));
    assert(r2.length === 91 && r2.every((v) => cmp(v, [0, 11, 69]) <= 0) && r1.every((v) => cmp(v, [0, 11, 70]) >= 0), `RP: 0.11.69 and before in part 2 (${r2.length}), the rest in part 1 (${r1.length})`);
    assert(new Set(all).size === all.length && [r1, r2].every((r) => r.every((v, i) => i === 0 || cmp(r[i - 1], v) > 0)), 'RP: no row twice, each part newest first');
    const { createHash } = await import('node:crypto');
    const part2Rows = p2.split('\n').filter((l) => /^\| \d+\.\d+\.\d+ \|/.test(l)).join('\n');
    assert(r1.length + r2.length >= 179 && createHash('sha256').update(part2Rows).digest('hex') === RP2_SHA, `RT (RV1): every row kept (${r1.length} + ${r2.length}), part 2's rows exactly as moved (sha256 ${createHash('sha256').update(part2Rows).digest('hex').slice(0, 12)}…)`);
    assert(Buffer.byteLength(p1) <= DOC_TOOL_MAX && p1.includes('Older versions (0.11.69 and before): `restore-points-2.md`') && /\| 0\.8\.1 \| `0c82c10` \|/.test(p2), `RP: part 1 under ${DOC_TOOL_MAX} bytes (${Buffer.byteLength(p1)}) with its pointer; part 2 ends at 0.8.1`);
}

const CL3_SHA = '2eecaa7c2318459eee87ac90e7ca4d6b62c70d0939adf8a19dbb68feaf7aed48'; // v0.11.176 (CL1): the 70 rows moved to changelog-3.md, as moved (part 3 never changes)
// v0.11.176 (owner pick CL1): changelog.md split again at 0.11.139: 0.11.70–0.11.139 in changelog-3.md, 0.11.69 and before in changelog-2.md
// (v0.11.105, CS1); every row in exactly one part, newest first in each, part 1 under the project tool's limit with its pointer line
{
    const read = (f) => readFileSync(path.join(ROOT, 'project', f), 'utf8');
    const [p1, p2, p3] = ['changelog.md', 'changelog-2.md', 'changelog-3.md'].map(read);
    const rowLines = (t) => t.split('\n').filter((l) => /^\| \d+\.\d+\.\d+ \|/.test(l));
    const rows = (t) => rowLines(t).map((l) => l.split('|')[1].trim().split('.').map(Number));
    const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    const r1 = rows(p1), r2 = rows(p2), r3 = rows(p3), all = [...r1, ...r3, ...r2].map((v) => v.join('.'));
    assert(r3.length === 70 && r3.every((v) => cmp(v, [0, 11, 70]) >= 0 && cmp(v, [0, 11, 139]) <= 0) && r1.every((v) => cmp(v, [0, 11, 140]) >= 0) && r2.every((v) => cmp(v, [0, 11, 69]) <= 0),
        `CL1: 0.11.70–0.11.139 in part 3 (${r3.length}), 0.11.140 on in part 1 (${r1.length}), 0.11.69 and before in part 2 (${r2.length})`);
    assert(new Set(all).size === all.length && [r1, r2, r3].every((r) => r.every((v, i) => i === 0 || cmp(r[i - 1], v) > 0)), 'CL1: no row twice, each part newest first');
    const { createHash } = await import('node:crypto');
    const sha = createHash('sha256').update(rowLines(p3).join('\n')).digest('hex');
    assert(r1.length >= 37 && sha === CL3_SHA, `CL1: part 3's rows exactly as moved (sha256 ${sha.slice(0, 12)}…), part 1 keeps 0.11.140 on (${r1.length})`);
    assert(Buffer.byteLength(p1) <= DOC_TOOL_MAX && Buffer.byteLength(p3) <= DOC_TOOL_MAX && p1.includes('0.11.70–0.11.139 in `changelog-3.md`') && p1.includes('0.11.69 and before in `changelog-2.md`') && p3.includes('Newer versions: `changelog.md`'),
        `CL1: parts 1 and 3 under ${DOC_TOOL_MAX} bytes (${Buffer.byteLength(p1)}, ${Buffer.byteLength(p3)}) with their pointers`);
}

rmSync(TMP, { recursive: true, force: true });

console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
