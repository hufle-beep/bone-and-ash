// Run: node tests/news.test.mjs — v0.11.150 (owner pick BL1): the build label, What's new and the new-version notice
// (js/core/news.js, Selene's). A the notes list (versions, order, the newest not past sw.js's VERSION, plain text); B the seen rule
// (first run with and without a save, an older seen, the same, a newer, junk, an unknown version); C the label, the status line,
// the takeover notice and the re-ask timing; D main.js's wiring (read as text: it imports the DOM) and sw.js (the module offline,
// sw.js never cached by the worker). Mutation: each mutant of news.js must fail part A, B or C.
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };
const SW = read('sw.js');
const VERSION = /VERSION = 'bone-ash-([^']+)'/.exec(SW)[1];
// the checks run before VERSION is bumped with the docs (reference.md), so the push being built may note the next patch
const NEXT = VERSION.replace(/(\d+)$/, (d) => String(Number(d) + 1));

/** Parts A–C on one copy of news.js (the real one, or a mutant): the failures' labels. */
async function suite(m) {
    const bad = [];
    const ok = (c, l) => { if (!c) bad.push(l); };
    const N = [['0.11.148', 'a'], ['0.11.150', 'b'], ['0.11.152', 'c']];
    // A the list
    ok(m.SEEN_KEY === 'boneash.seen', 'the key');
    ok(m.NOTES.length >= 1 && m.NOTES.every(([v, t]) => m.cmpVer(v, '0.0.1') > 0 && typeof t === 'string' && t.length > 20 && !/[<>]/.test(t)), 'each note: a version and plain text');
    ok(m.NOTES.every((n, i) => i === 0 || m.cmpVer(n[0], m.NOTES[i - 1][0]) > 0), 'oldest first, no version twice');
    ok(m.NOTES.some(([v]) => v === '0.11.150'), 'the first note is 0.11.150');
    ok(m.cmpVer(m.NOTES[m.NOTES.length - 1][0], NEXT) <= 0, 'no note past sw.js\'s VERSION (or the next patch, before the bump)');
    ok(m.cmpVer('0.11.150', '0.11.99') === 1 && m.cmpVer('0.11.99', '0.11.150') === -1 && m.cmpVer('0.11.150', '0.11.150') === 0 && m.cmpVer('1.0', '0.99.99') === 1 && m.cmpVer('0.11', '0.11.0') === 0, 'versions compared by number');
    ok(m.cmpVer('?', '0.11.150') === null && m.cmpVer('0.11.150', 'x') === null && m.cmpVer(null, '1') === null, 'junk compares as null');
    // B the seen rule
    const s = (seen, cur, had) => m.newsSince(seen, cur, had, N);
    ok(JSON.stringify(s(null, '0.11.150', true)) === JSON.stringify({ list: [['0.11.150', 'b']], record: '0.11.150' }), 'first run with a save: this version\'s note, kept');
    ok(JSON.stringify(s(null, '0.11.150', false)) === JSON.stringify({ list: [], record: '0.11.150' }), 'first run, a new player: nothing, kept');
    ok(JSON.stringify(s('', '0.11.151', true)) === JSON.stringify({ list: [], record: '0.11.151' }), 'first run on a version with no note: nothing');
    ok(JSON.stringify(s('0.11.147', '0.11.152', false).list) === JSON.stringify([['0.11.152', 'c'], ['0.11.150', 'b'], ['0.11.148', 'a']]), 'an older seen: every note after it, newest first');
    ok(JSON.stringify(s('0.11.148', '0.11.151', true)) === JSON.stringify({ list: [['0.11.150', 'b']], record: '0.11.151' }), 'not past the running version, not the seen one');
    ok(JSON.stringify(s('0.11.150', '0.11.150', true)) === JSON.stringify({ list: [], record: null }), 'the same version: nothing, nothing written');
    ok(JSON.stringify(s('0.11.152', '0.11.150', true)) === JSON.stringify({ list: [], record: null }), 'an older copy opened: nothing, the kept version not stepped back');
    ok(JSON.stringify(s('junk', '0.11.150', true)) === JSON.stringify({ list: [], record: '0.11.150' }), 'junk kept: nothing shown, the version kept');
    ok(JSON.stringify(s('0.11.148', '?', true)) === JSON.stringify({ list: [], record: null }), 'an unknown running version: nothing shown or kept');
    // C the label, the status line, the notice, the re-ask
    ok(m.versionLabel('0.11.150', 6) === '0.11.150 · build 6' && m.versionLabel('0.11.150', 0) === '0.11.150' && m.versionLabel('0.11.150', undefined) === '0.11.150', 'the label: the build in the app only');
    ok(m.statusPlace(true, 6) === 'Android app build 6' && m.statusPlace(true, 0) === 'Android app build unknown' && m.statusPlace(false, 6) === 'browser', 'the status line\'s place');
    const t = (o) => m.takeoverNotice({ inApp: false, hadController: true, running: '0.11.150', arrived: '0.11.151', ...o });
    ok(t({}) && !t({ inApp: true }) && !t({ hadController: false }) && !t({ arrived: '0.11.150' }) && !t({ arrived: '?' }), 'the notice: a browser, a page that had a version, a different known version');
    ok(m.RECHECK_MS === 30 * 60e3 && m.recheckDue(1e9, null) && !m.recheckDue(1e9, 1e9 - 29 * 60e3) && m.recheckDue(1e9, 1e9 - 30 * 60e3) && m.recheckDue(1e9, 1e9 + 1), 'the re-ask: 30 minutes, a clock gone back counts as due');
    ok(m.READY_TEXT('0.11.151') === 'Version 0.11.151 is ready. Reload saves your game and opens it.', 'the notice\'s line');
    return bad;
}

const real = await import('../js/core/news.js');
const bad = await suite(real);
assert(!bad.length, `news.js: parts A–C (${bad.length ? bad.join('; ') : 'all'})`);

// D the wiring
const MAIN = read('js/main.js');
assert(/import \{[^}]*newsSince[^}]*\} from '\.\/core\/news\.js'/.test(MAIN), 'main.js imports news.js');
assert(MAIN.includes('newsSince(store.get(SEEN_KEY), v, hadSaveAtLoad)') && MAIN.indexOf('const hadSaveAtLoad = hadSave;') > MAIN.indexOf('\nload();\n') && MAIN.includes('if (r.record) store.set(SEEN_KEY, r.record);'), 'main.js: What\'s new from the kept version, the version kept');
assert(MAIN.includes('${newsBox()}<div class="mbtns">') && MAIN.includes('data-newsclose="1"') && MAIN.includes("if (b.dataset.newsclose) { news = []; render(); return; }"), 'main.js: the box on the menu, its ✕ closes it');
assert(MAIN.includes('<h2>What\'s new</h2>') && MAIN.includes('${notesHtml([...NOTES].reverse())}'), 'main.js: Settings → What\'s new, the whole list');
assert(/const notesHtml = \(list\) => `<ul class="wnew">\$\{list\.map\(\(\[v, t\]\) => `<li><b>\$\{esc\(v\)\}<\/b>: \$\{esc\(t\)\}<\/li>`\)/.test(MAIN), 'main.js: the notes escaped');
assert(MAIN.includes('versionLabel(v, inApp(window) ? updater.mine() : 0)') && MAIN.includes('statusPlace(inApp(window), updater.mine())'), 'main.js: the label and Copy status carry the app\'s build');
assert(MAIN.includes("let controlled = !!navigator.serviceWorker.controller;") && MAIN.includes('const hadController = controlled; controlled = true;') && MAIN.includes('settled.then(cacheVersion)') && MAIN.includes("addEventListener('controllerchange'") && MAIN.includes('showNotice(READY_TEXT(arrived), false, true)'), 'main.js: the notice on a takeover, with Reload and no Download');
assert(MAIN.includes("if (b.dataset.note === 'reload') { closeSave(); location.reload(); }") && MAIN.includes('data-note="reload" hidden'), 'main.js: Reload saves first; hidden unless asked for');
assert(MAIN.includes('recheckDue(Date.now(), asked)') && MAIN.includes('reg?.update()'), 'main.js: the re-ask when the game comes back on screen');
assert(MAIN.indexOf("addEventListener('controllerchange'") > MAIN.indexOf('if (wantsServiceWorker(window, location.protocol)) {'), 'main.js: the notice and the re-ask only where a service worker runs (never in the app)');
assert(/async function gameVersion\(\) \{\n {4}const signal = [^\n]+\n {4}try \{ const t = await \(await fetch\('sw\.js', \{ cache: 'no-store', signal \}\)\)/.test(MAIN) && MAIN.includes('return cacheVersion();'), 'main.js: the version from sw.js first, the cache\'s name offline');
// v0.11.150 (owner pick RW1, after the cold review)
assert(SW.includes("self.addEventListener('message', (e) => { if (e.data === 'version' && e.ports && e.ports[0]) e.ports[0].postMessage(VERSION); });") && MAIN.includes("w.postMessage('version', [ch.port2])") && MAIN.includes("const wv = /^bone-ash-(.+)$/.exec(await workerVersion() || ''); if (wv) return wv[1];"), 'RW1 (OL): the version offline and on a takeover from the serving worker itself, the caches\' names only as a fallback');
assert(MAIN.includes("if (news.length && menu === 'main' && Date.now() - newArmed >= 4000) render();"), 'RW1 (AR): What\'s new never redraws the menu while New game is armed');
assert(MAIN.includes('const VERSION_WAIT = 3000;') && MAIN.includes('AbortSignal.timeout(VERSION_WAIT)') && MAIN.includes("fetch('sw.js', { cache: 'no-store', signal })"), 'RW1 (TO): sw.js is waited for 3 s at most, then the cache\'s name');
assert(MAIN.includes('if (reloadShown()) return;') && MAIN.indexOf('if (reloadShown()) return;') < MAIN.indexOf('const pl = bakMeta().play, now = Date.now();') && MAIN.includes(`const reloadShown = () => !notebar.hidden && !notebar.querySelector('[data-note="reload"]').hidden;`), 'RW1 (KR): the export reminder waits while a Reload notice is on screen (before it marks itself shown)');
assert(MAIN.includes('data-wnew="1"${wnewOpen ? \' open\' : \'\'}') && MAIN.includes("if (d.matches?.('[data-wnew]') && d.isConnected) wnewOpen = d.open;"), 'RW1 (KO): Settings → What\'s new stays open across redraws');
assert(SW.includes("'js/core/news.js'") && SW.includes('if (url.pathname === `${SCOPE}sw.js`) return;'), 'sw.js: the module offline (and in the app), sw.js itself never cached by the worker');

// Mutation: each mutant must fail parts A–C
{
    const src = read('js/core/news.js');
    const dir = mkdtempSync(path.join(tmpdir(), 'news-mut-'));
    const mutants = [
        ['the key renamed', "SEEN_KEY = 'boneash.seen'", "SEEN_KEY = 'boneash.news'"],
        ['by text, not number', 'const d = (x[i] || 0) - (y[i] || 0);', 'const d = String(x[i] || 0) < String(y[i] || 0) ? -1 : String(x[i] || 0) > String(y[i] || 0) ? 1 : 0;'],
        ['a new player sees notes', 'list = hadSave ? notes.filter', 'list = true ? notes.filter'],
        ['first run: every note', 'notes.filter(([v]) => cmpVer(v, current) === 0) : []', 'notes.filter(([v]) => cmpVer(v, current) <= 0) : []'],
        ['the seen note again', 'cmpVer(v, seen) > 0 && upTo(v)', 'cmpVer(v, seen) >= 0 && upTo(v)'],
        ['notes past the running one', 'cmpVer(v, seen) > 0 && upTo(v)', 'cmpVer(v, seen) > 0'],
        ['oldest first shown', 'list: [...list].reverse()', 'list: [...list]'],
        ['stepped back', 'cmpVer(seen, current) > 0 ? seen : current', 'current'],
        ['always written', 'record: keep === seen ? null : keep', 'record: keep'],
        ['unknown kept', "if (!parts(current)) return { list: [], record: null };", ''],
        ['junk shows all', 'cmpVer(v, seen) > 0 && upTo(v)', '(cmpVer(v, seen) > 0 || cmpVer(v, seen) === null) && upTo(v)'],
        ['the build in a browser', "Number(build) > 0 ? `${version} · build ${Number(build)}` : String(version)", '`${version} · build ${Number(build)}`'],
        ['the notice in the app', '!inApp && !!hadController', '!!hadController'],
        ['the notice on a first install', '!inApp && !!hadController && ', '!inApp && '],
        ['the notice for the same version', ' && arrived !== running', ''],
        ['an hour', 'RECHECK_MS = 30 * 60e3', 'RECHECK_MS = 60 * 60e3'],
        ['a clock gone back waits', 'last == null || now < last || ', 'last == null || '],
        ['html in a note', "saves and shares files through Android", "saves and shares files <b>through</b> Android"],
    ];
    let caught = 0;
    for (const [name, from, to] of mutants) {
        if (!src.includes(from)) { assert(false, `mutant "${name}": its text is in news.js`); continue; }
        const f = path.join(dir, `m${caught}-${Math.random().toString(36).slice(2)}.mjs`);
        writeFileSync(f, src.replace(from, to));
        let b;
        try { b = await suite(await import(pathToFileURL(f).href)); } catch (e) { b = [String(e)]; }
        if (b.length) caught++; else console.error('        mutant survived:', name);
    }
    rmSync(dir, { recursive: true, force: true });
    assert(caught === mutants.length, `mutation: ${caught} of ${mutants.length} mutants of news.js fail the checks`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
