// Run: node tests/tools.test.mjs — the test tools themselves (v0.11.21).
// tests/lib/shard.mjs: mergeInto's rules, seedOf, and that 1 worker gives the same bot stats as 2 (story 51 games since v0.11.28,
// tasks 51 games with --bots-only: the fewest that still get 2 workers, since shard.mjs allows one worker per 50 games).
// tools/lib/noise.mjs: the noise-scaled drift band of tools/sanity.mjs (log only).
// tools/check.mjs: its job list (--list, both modes) and tools/lib/jobs.mjs's validateJobs on a broken list.
// v0.11.28: tools/lib/report.mjs (the compact output) and the models step's --off-models, on a tiny real models run.
// v0.11.39: tools/arthash.mjs (the ART fingerprints in sw.js) on a made-up folder and on the real repo.
// v0.11.62: tools/art/patch.py on a made-up picture.
// v0.11.22: tools/leftovers.mjs on small made-up inputs (every kind found, kept entries skipped) and tests/lib/seen.mjs's watch.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeInto, seedOf } from './lib/shard.mjs';
import { validateJobs } from '../tools/lib/jobs.mjs';
import { noise, band, flagged, K, MIN, LIMIT, NOTE_AT, driftKind } from '../tools/lib/noise.mjs';
import { strip, scanFunctions, scanFlags, flagFindings, scanCss, scanMarkers, scanStorage, scanFiles, applyKeep, loadKeep, KINDS, strictFailures, STRICT_KINDS } from '../tools/leftovers.mjs'; // v0.11.22; strict v0.11.23
import { seen as touched, track, noteView, seenOut } from './lib/seen.mjs'; // v0.11.22
import { stepLine, flagLines, leftoverFound, modelDigest } from '../tools/lib/report.mjs'; // v0.11.28
import { artFiles, fingerprint, readArt, checkArt, writeArt, ART_RE } from '../tools/arthash.mjs'; // v0.11.39
import { docFindings, newestHistory, newestResearch, HANDOVER_MAX, HISTORY_MAX, RESEARCH_MAX, DOC_TOOL_MAX } from '../tools/lib/docs.mjs'; // v0.11.73; v0.11.78 the research parts

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) pass++; else { fail++; console.error('  FAIL ', l); } };
const t0 = Date.now();

// start the bot runs first (they take the time); the quick checks below run while they play
const TMP = mkdtempSync(path.join(tmpdir(), 'boneash-tools-'));
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
    assert(dg?.length === 3 && dg.every((l) => /prologue C1 dead [\d.]+% · mean Coil ([\d.]+|—) \/ ([\d.]+|—) · whole game C1 [\d.]+%( · \d+ gave up)?$/.test(l)), `modelDigest reads the real report, one line per model (${dg?.join(' | ') ?? 'null'})`);
    assert(modelDigest(rep, 3)?.length === 3 && modelDigest(rep, 4) === null, 'modelDigest: a missing model block prints the whole report');
    const gaveUp = modelDigest('[rusher] 9 games, 1 cards (1 forced: a screen with no story exit), 7 gave up after Coil 8\n  prologue: C1 dead 100% (n 9)\n  cleared: prologue 22.2% (mean Coil 7.00) · Act 1 22.2% (mean Coil 7.00) · the whole game on Coil 1 0%');
    assert(/· 7 gave up$/.test(gaveUp?.[0] ?? ''), `modelDigest keeps the games that gave up (${gaveUp?.[0]})`);
    let bad = 0;
    try { execFileSync(process.execPath, ['tests/models.test.mjs', '--games', '1', '--off-models', 'nobody'], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { bad = e.status; }
    assert(bad === 2, `models --off-models with an unknown model exits 2 (${bad})`);
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
// v0.11.74 (group i round 1, I1; v0.11.75: round 2's wave 1, W1; v0.11.76: wave 2, V1; v0.11.78: read across the research parts, S1): every group i candidate in project/research.md is placed in the roadmap, and every roadmap line marked "from group i" (or "from group i round 2") names a real one
{
    const parts = readdirSync(path.join(ROOT, 'project')).filter((f) => /^research(-\d+)?\.md$/.test(f)).sort((x, y) => (x === 'research.md' ? 1 : Number(x.match(/\d+/)[0])) - (y === 'research.md' ? 1 : Number(y.match(/\d+/)[0])));
    assert(parts[0] === 'research.md' && parts[1] === 'research-2.md' && parts.every((f, i) => i === 0 || f === `research-${i + 1}.md`), `research: the parts run research.md, research-2.md, ... with no gap (${parts.join(', ')})`);
    for (const [i, f] of parts.entries()) if (i + 1 < parts.length) assert(/\*Continued in `[^`]+`/.test(readFileSync(path.join(ROOT, 'project', f), 'utf8').trimEnd().split('\n').pop()) && readFileSync(path.join(ROOT, 'project', f), 'utf8').trimEnd().split('\n').pop().includes(parts[i + 1]), `research: ${f} ends pointing on to ${parts[i + 1]}`);
    const research = parts.map((f) => readFileSync(path.join(ROOT, 'project', f), 'utf8')).join('\n');
    const roadmap = readFileSync(path.join(ROOT, 'project/roadmap.md'), 'utf8');
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
    const roadmap = readFileSync(path.join(ROOT, 'project/roadmap.md'), 'utf8');
    const sec = (h) => { const a = lore.indexOf(h); const b = lore.indexOf('\n## ', a + 1); return a < 0 ? '' : lore.slice(a, b < 0 ? undefined : b); };
    assert(/\*\*Flight \(owner[^\n]*Foundation[^\n]*realm and GU/.test(sec('## James Green')), 'lore: James flies from Foundation, limited only by realm and GU');
    assert(/\*\*Flight:\*\*/.test(sec('## Yuki')), 'lore: Yuki flies too');
    assert(/\*\*Flight on this world[^\n]*Golden Core/.test(sec('## The world')), 'lore: locals fly only from Golden Core');
    for (const t of ['**Story, flight', '**Mechanics, flight', "**Flight's walk times"]) assert(roadmap.includes(t), `roadmap: the flight line "${t.replace(/\*/g, '')}" is there`);
}
rmSync(TMP, { recursive: true, force: true });

console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
