// Run: node tests/appfiles.test.mjs — v0.11.148 (owner pick EX1): the game's files inside the Android app (js/core/app.js,
// Selene's exportText). A the route (share sheet, file picker or download) for every bridge; B main.js (as text: it imports
// the DOM): every place that hands a file out goes through exportText, the "Save to a file" buttons only with the file picker,
// the app's answer (onAndroidExport), the copy fallbacks, no service worker in the app; C the app's side (MainActivity.java's
// exportFile, shareFile and report); D sw.js keeps the module offline. A browser still downloads (browser part 2 checks the
// download of Export all). Mutation: each mutant of app.js must fail part A; RX1 (TB): each mutant of main.js must fail part B.
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };

const main = read('js/main.js');
const java = read('android/app/src/main/java/io/github/hufle/boneandash/MainActivity.java');
const src = read('js/core/app.js');
const fn = () => {};

/** Part A on one copy of app.js: the failures' labels. */
function suite(A) {
    const bad = [];
    const t = (c, l) => { if (!c) bad.push(l); };
    const both = { shareFile: fn, exportFile: fn, versionCode: fn }, shareOnly = { shareFile: fn, versionCode: fn }, fileOnly = { exportFile: fn, versionCode: fn };
    const r = (b, f) => A.exportRoute(b, f);
    t(r(undefined, false) === 'download' && r(null, true) === 'download' && r({}, false) === 'download' && r({ shareFile: 1, exportFile: 'x' }, true) === 'download', 'A: a browser (no bridge, or no functions) downloads');
    t(r(both, false) === 'share' && r(both, true) === 'file', 'A: the app: the share sheet, or the file picker for "Save to a file"');
    t(r(shareOnly, false) === 'share' && r(shareOnly, true) === 'share', 'A: an app with only the share sheet uses it for both');
    t(r(fileOnly, false) === 'file' && r(fileOnly, true) === 'file', 'A: an app with only the file picker uses it for both');
    t(A.canSaveToFile(both) && A.canSaveToFile(fileOnly) && !A.canSaveToFile(shareOnly) && !A.canSaveToFile(undefined), 'A: "Save to a file" only where the file picker is');
    const nav = { serviceWorker: {} };
    t(A.wantsServiceWorker({ navigator: nav }, 'https:') && !A.wantsServiceWorker({ navigator: nav, AndroidBridge: { versionCode: fn } }, 'https:') && !A.wantsServiceWorker({ navigator: nav }, 'file:') && !A.wantsServiceWorker({ navigator: {} }, 'https:'), 'A: the service worker in a browser only (NS)');
    t(A.FILE_TEXT.saved('x.json') === 'Saved x.json.' && A.FILE_TEXT.failed('no picker') === 'Export failed: no picker', 'A: the result lines');
    t(A.savedName('x.json', 'a.json') === 'x.json' && A.savedName('msf:1000012345', 'bone-and-ash-Day-1.json') === 'bone-and-ash-Day-1.json' && A.savedName('acc=1;doc=encoded=AbC', 'a.json') === 'a.json' && A.savedName('X.JSON', 'a.json') === 'X.JSON' && A.savedName('msf:1', '') === 'msf:1', 'A: the name shown after the file picker: a real .json name, else the one asked for (FN)');
    t(A.resultPlace('saves', false) === 'note' && A.resultPlace(null, true) === 'note' && A.resultPlace(null, false) === 'bar' && A.resultPlace('main', true) === 'bar' && A.resultPlace('settings', false) === 'bar', 'A: the answer under the buttons on Saves or the recovery screen, else the notice bar (NL)');
    t(!/On GitHub, add it/.test(A.FILE_TEXT.ghShared) && /upload it there/.test(A.FILE_TEXT.ghShared), 'A: the GitHub fallback line says no page opened (GW)');
    // v0.11.283 (owner pick P51-A, SV-p): a long save in parts: slices of at most 18,000 characters that join back to the save
    if (typeof A.saveParts === 'function') {
        const x = 'BAZ1:' + 'abcdefghij'.repeat(3525); // 35,255 characters, about the Coil 8 save
        const ps = A.saveParts(x);
        t(A.SAVE_PART_MAX === 18000 && ps.length === 2 && ps.every((q) => q.length <= 18000) && ps.join('') === x && ps[0].length === 18000, 'A (SV-p): a 35 KB save goes in two parts of at most 18,000 characters that join back to it');
        t(A.saveParts('x'.repeat(18000)).length === 1 && A.saveParts('x'.repeat(18001)).length === 2 && A.saveParts('y'.repeat(54001)).length === 4 && A.saveParts('').length === 1, 'A (SV-p): up to 18,000 one part; one more, two; 54,001, four');
        t(A.partName('2026-11-26-1950-incremental-ashfall.txt', 1, 2) === '2026-11-26-1950-incremental-ashfall-part1of2.txt' && A.partName('a', 2, 3) === 'a-part2of3', 'A (SV-p): the part names');
        t(/^Part 1 of 2 copied \(18 KB\)\. On GitHub, paste it/.test(A.PART_TEXT.copied(1, 2, 18)) && /tap "Share part 2 of 2"\.$/.test(A.PART_TEXT.copied(1, 2, 18)) && /That was the last part\.$/.test(A.PART_TEXT.copied(2, 2, 17)) && A.PART_TEXT.button(2, 2) === 'Share part 2 of 2', 'A (SV-p): the part lines and the button');
    } else t(false, 'A (SV-p): saveParts is there');
    // v0.11.283 (owner pick P51-A, WB-y): Welcome back after 6 hours away
    if (typeof A.welcomePrefs === 'function') {
        const H = 3600e3, p0 = A.welcomePrefs(null), pj = A.welcomePrefs('{"seen":"x","on":"no"}'), pk = A.welcomePrefs('junk'), pv = A.welcomePrefs('{"seen":5000,"on":false}');
        t(A.WELCOME_KEY === 'boneash.welcome' && A.WELCOME_AFTER === 6 * H, 'A (WB-y): its key and its 6 hours');
        t(p0.seen === 0 && p0.on === true && pj.seen === 0 && pj.on === true && pk.on === true && pv.seen === 5000 && pv.on === false, 'A (WB-y): the record read back; junk keeps the defaults');
        const now = 100 * H;
        t(A.welcomeDue({ seen: now - 6 * H, on: true }, now) && !A.welcomeDue({ seen: now - 6 * H + 1, on: true }, now) && !A.welcomeDue({ seen: now - 9 * H, on: false }, now) && !A.welcomeDue({ seen: 0, on: true }, now), 'A (WB-y): due from 6 hours away, switch on, a time on record');
        const lines = Array.from({ length: 15 }, (_, k) => `line ${k}`);
        const v = A.welcomeView({ minutes: 600, scene: 'ashfall', log: [{ lines: ['old'] }, { lines }] }), v0 = A.welcomeView({ minutes: 0, scene: 'wake', log: [] });
        t(v.minutes === 600 && v.scene === 'ashfall' && v.lines.length === 12 && v.lines[0] === 'line 0' && v0.lines.length === 0 && A.welcomeView(null) === null, 'A (WB-y): the card: the time, the place, the journal\'s last entry (up to 12 lines)');
        t(A.awayText(6 * H) === '6 hours' && A.awayText(H) === '1 hour' && A.awayText(47 * H) === '47 hours' && A.awayText(50 * H) === '2 days', 'A (WB-y): how long away, in words');
        t(A.WELCOME_TEXT.setting(true) === 'Welcome back after 6 hours away: on' && A.WELCOME_TEXT.setting(false).endsWith(': off'), 'A (WB-y): the setting\'s label');
    } else t(false, 'A (WB-y): welcomePrefs is there');
    // v0.11.283 (owner pick P51-A, L7-f): the PC tooltip beside the held card
    if (typeof A.tipBox === 'function') {
        const r = { left: 900, top: 300, bottom: 360 };
        t(A.TIP_WIDE === 1100 && JSON.stringify(A.tipBox(r, 400, 200, 1600, 900)) === '{"left":900,"top":368}', 'A (L7-f): under the card, its left edge with the card\'s');
        t(JSON.stringify(A.tipBox({ left: 900, top: 600, bottom: 660 }, 400, 300, 1600, 900)) === '{"left":900,"top":292}', 'A (L7-f): above the card when there is no room under it');
        t(JSON.stringify(A.tipBox({ left: 1500, top: 300, bottom: 360 }, 400, 200, 1600, 900)) === '{"left":1192,"top":368}' && A.tipBox({ left: -20, top: 300, bottom: 360 }, 400, 200, 1600, 900).left === 8, 'A (L7-f): kept inside the window');
        t(JSON.stringify(A.tipBox({ left: 100, top: 100, bottom: 800 }, 300, 400, 1600, 900)) === '{"left":100,"top":492}', 'A (L7-f): no room above or under: at the window\'s bottom');
        t(A.tipBox({ left: 100, top: 590, bottom: 590 }, 300, 300, 1600, 900).top === 282, 'A (L7-f): under the card only with its gap to the window\'s edge kept');
    } else t(false, 'A (L7-f): tipBox is there');
    // v0.11.285 (owner pick G3-A): FS-s the file names, OS-a the second tap's lines, HK-t the keys
    if (typeof A.fileStamp === 'function') {
        const d = new Date(2026, 10, 27, 1, 58);
        t(A.fileStamp(d, 8, '0.11.285') === 'bone-and-ash-2026-11-27-0158-coil8-0.11.285.json', 'A (FS-s): the date and time, the Coil, the build');
        t(A.fileStamp(new Date(2026, 0, 5, 9, 7), 0, '?') === 'bone-and-ash-2026-01-05-0907.json' && A.fileStamp(d, undefined, '') === 'bone-and-ash-2026-11-27-0158.json' && A.fileStamp(d, 3, 'x/y') === 'bone-and-ash-2026-11-27-0158-coil3.json', 'A (FS-s): an unknown Coil or build left out');
    } else t(false, 'A (FS-s): fileStamp is there');
    if (A.ASK_TEXT) {
        t(A.ASK_MS === 4000 && /^Slot 2 holds A\. Tap Save here again .*\(B\); the game in the slot is lost\.$/.test(A.ASK_TEXT.save(2, 'A', 'B')), 'A (OS-a): the overwrite names both games and the loss');
        t(/^Tap Load again: slot 1 \(A\) takes the place of this game \(B\), which is kept as the "before" backup\.$/.test(A.ASK_TEXT.load(1, 'A', 'B')) && /^This file holds a game at A\. Loading it takes the place of this game \(B\)/.test(A.ASK_TEXT.file('A', 'B')), 'A (OS-a): a load names both games and the backup');
        const a1 = A.askStep(null, 'save2', 1000), a2 = A.askStep(a1.armed, 'save2', 4999), a3 = A.askStep(a1.armed, 'save2', 5000), a4 = A.askStep(a1.armed, 'load2', 2000);
        t(!a1.go && a2.go && !a3.go && !a4.go && a2.armed.k === '' && a4.armed.k === 'load2' && a3.armed.at === 5000, 'A (OS-a, RV TG2): the second tap of the same button within 4 s goes; another button or later arms again');
    } else t(false, 'A (OS-a): ASK_TEXT is there');
    if (typeof A.hotkeyOf === 'function') {
        const k = (key, o = {}) => A.hotkeyOf({ key, ...o });
        t(JSON.stringify(k('1')) === '{"card":0}' && JSON.stringify(k('9')) === '{"card":8}' && k('0') === null, 'A (HK-t): 1–9 the cards in order, 0 nothing');
        t(k('Escape').esc === true && k('s').tab === 'story' && k('C').tab === 'sheet' && k('h').tab === 'bag' && k('j').tab === 'journal' && k('f').tab === 'faq' && k('m').tab === 'menu' && k('x') === null, 'A (HK-t): Esc and the tabs');
        t(k('1', { ctrlKey: true }) === null && k('s', { metaKey: true }) === null && k('2', { altKey: true }) === null && A.hotkeyOf({ key: '1' }, true) === null && A.hotkeyOf(null) === null && k('1', { repeat: true }) === null && k('Escape', { repeat: true }) === null, 'A (HK-t, RV-A H1-r): nothing with a modifier, in a field, or from a held key\'s repeats');
        t(A.HOTKEYS.length === 8 && A.HOTKEYS.every((h) => h.show && h.does) && new Set(A.HOTKEYS.map((h) => h.key)).size === 8, 'A (HK-t): one table, each key once, each with its words');
    } else t(false, 'A (HK-t): hotkeyOf is there');
    return bad;
}
{
    const A = await import(pathToFileURL(path.join(ROOT, 'js/core/app.js')).href);
    const bad = suite(A);
    assert(!bad.length, `A on js/core/app.js (${bad.join('; ') || 'all hold'})`);
}

// B. main.js, as text: each check names the exact condition, so a changed condition fails it (RX1, TB: the main.js mutants below)
function checkMain(src) {
    const bad = [];
    const t = (c, l) => { if (!c) bad.push(l); };
    const has = (s) => src.includes(s);
    t((src.match(/\bdownload\(/g) || []).length === 2 && has('    else download(text, name);'), 'B: download() only inside exportText (its definition and one call)');
    t(/b\.dataset\.rec === 'export'\) return exportText\(`bone-and-ash-damaged-/.test(src), 'B: the recovery screen\'s damaged save through exportText');
    t(has("if (b.dataset.note === 'export' && g) { expMark(); exportText(saveFileName(), serialize(g)); }"), 'B: the notice bar\'s Download now through exportText');
    t(has('function exportAll(toFile = false) { autosave(); expMark(); return exportText(') && has('exportAll(!!b.dataset.exportallfile)'), 'B: Export all (and Save all to a file) through exportText, saved first');
    t(has('const how = exportText(saveFileName(), serialize(g), !!b.dataset.exportfile); expMark();'), 'B: Download save file (and Save to a file) through exportText');
    t(has(`\${canSaveToFile(window.AndroidBridge) ? '<button class="btn" data-exportfile="1">Save to a file</button>' : ''}`) && has(`\${canSaveToFile(window.AndroidBridge) ? '<button class="btn" data-exportallfile="1">Save all to a file</button>' : ''}`) && (src.match(/data-export(all)?file="1"/g) || []).length === 2, 'B: the two "Save to a file" buttons only with the file picker');
    t(has('b.dataset.exportfile') && has('b.dataset.exportallfile'), 'B: data-exportfile and data-exportallfile handled');
    t(has("    else if (how === 'file') { askedName = name; AB.exportFile(name, text); }"), 'B: the name asked of the file picker remembered (FN)');
    t(has("window.onAndroidExport = (ok, msg) => {\n    const line = ok ? FILE_TEXT.saved(savedName(msg, askedName)) : FILE_TEXT.failed(msg);\n    if (resultPlace(menu, !!recovery) === 'note' && document.getElementById('saveNote')) note(line); else showNotice(line, false);"), 'B: the app\'s answer: the asked name (FN), under the buttons on Saves or recovery, else the notice bar (RP, NL)');
    t(has('function showNotice(msg, exportBtn = true, reloadBtn = false) {') && has(`notebar.querySelector('[data-note="export"]').hidden = !exportBtn;`), 'B: the notice bar keeps Download now unless a result line asks otherwise');
    t(/expMark\(\); showNotice\('No save downloaded for over a day\.[^']*'\);/.test(src), 'B: the export reminder keeps its Download now button');
    t(/const fail = \(\) => \{ if \(shareText\(`bone-and-ash-error-\$\{stamp\(\)\}\.txt`, text\)\) \{[^\n]*\n    if \(navigator\.clipboard\?\.writeText\) navigator\.clipboard\.writeText\(text\)\.then\(done, \(\) => fallbackCopy\(text, done, fail\)\); else fallbackCopy\(text, done, fail\);\n\}\);/.test(src), 'B: the error bar\'s Copy falls back to the share sheet (CP)');
    t(has("if (!ok && shareText(ghFileName('txt'), body)) { note(FILE_TEXT.ghShared); return; }"), 'B: Share to GitHub\'s long save falls back to the share sheet only when the copy failed (CP, GW)');
    t(has("note(shareText(`bone-and-ash-status-${stamp()}.txt`, text) ? FILE_TEXT.statusShared : 'The status could not be copied.')"), 'B: Copy status falls back to the share sheet (CP)');
    t(has('const parts = saveParts(body, packed ? SAVE_PART_MAX : SAVE_PART_MAX / 3); // v0.11.283') && has("if (parts.length > 1) { const name0 = ghFileName(packed ? 'txt' : 'json'); ghParts = { parts, names: parts.map((_, i) => partName(name0, i + 1, parts.length)), next: 0, whole: body, g0: g }; sharePart(); return; }") && has('if (partsLive() && ghParts.next < ghParts.parts.length) { sharePart(); return; }'), 'B (SV-p): a long save goes in parts (an unpacked one by a third: RV L4); the next tap shares the next part');
    t(has('const partsLive = () => { if (ghParts && ghParts.g0 !== g) ghParts = null; return !!ghParts; };') && has('const shareLabelText = () => (partsLive() ?'), 'B (SV-p, RV L4): a new game or a load drops the old save\'s parts');
    // RV (TG1, M3; TG2, M4): the card only over the same, unmoved game; its lines through the same filter as the journal
    t(has("if (!welcomeCard || !g || welcomeCard.g0 !== g || g.minutes !== welcomeCard.view.minutes) return '';") && has('welcomeCard = { away: now - welcome.seen, view: welcomeView(g), g0: g };'), 'B (WB-y, RV TG1): the card goes with a new game, a load, a restore or a bite (another game object, or the clock moved)');
    t(has('const v = welcomeCard.view, shown = shownLines(v.lines);') && has('${shown.map((l) => `<div>${dieHtml(l)}</div>`).join(\'\')}') && !has('${v.lines.map('), 'B (WB-y, RV TG2): the card hides the checks as the journal does');
    // RV (TG3): the time away kept when the page hides and on pagehide; checked when it shows again
    t(has("document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') welcomeKeep(); else if (document.visibilityState === 'visible') { const had = !!welcomeCard; welcomeCheck();") && has("window.addEventListener('pagehide', welcomeKeep);") && has('const welcomeKeep = () => { welcome.seen = Date.now(); store.set(WELCOME_KEY, JSON.stringify(welcome)); };'), 'B (WB-y, RV TG3): the time kept on hide and pagehide, checked on show');
    // RV (L5): a resize closes the tooltip; a scroll closes it beside its card
    t(has("window.addEventListener('resize', () => { if (!tipEl.hidden) { tipEl.hidden = true; tipEl.classList.remove('beside');") && has("if (!tipEl.hidden && tipEl.classList.contains('beside')) tipEl.hidden = true;"), 'B (L7-f, RV L5): a resize or a scroll closes the PC tooltip');
    t(has('copyText(p.parts[i], () => {\n        p.next += 1;\n        if (p.next >= n) ghParts = null;') && has("note(shareText(ghFileName('txt'), p.whole) ? FILE_TEXT.ghShared"), 'B (SV-p): each part copied, the last one ends it; a failed copy shares the whole save as before');
    t(has('<button class="btn" data-share="1">${esc(shareLabelText())}</button>'), 'B (SV-p): the button names the next part');
    t(has('welcomeCheck(); // WB-y: on opening') && has('if (welcomeDue(welcome, now) && g && !recovery) welcomeCard =') && (src.match(/\$\{welcomeHtml\(\)\}\$\{statusHtml\(\)\}/g) || []).length === 2, 'B (WB-y): the card checked on opening, drawn above both story screens');
    t(has("if (b.dataset.welcome) { welcome.on = !welcome.on; welcomeKeep(); render(); return; }") && has("if (b.dataset.welcomeclose) { welcomeCard = null; render(); return; }") && has('    welcomeCard = null; // WB-y: the card goes with the next tap'), 'B (WB-y): the switch, the ✕ and the next tap close or switch it');
    t(has("tipEl.hidden = false; placeTip(b);") && has('const wide = window.innerWidth >= TIP_WIDE;'), 'B (L7-f): the tooltip placed beside the held card on a PC');
    t(has("    if (exportRoute(AB, false) !== 'share') return false;\n    AB.shareFile(name, text); return true;"), 'B: the copy fallback only where the share sheet is');
    t(has('if (wantsServiceWorker(window, location.protocol)) {') && (src.match(/serviceWorker\.register/g) || []).length === 1, 'B: the service worker registered only where wanted (NS)');
    t(has("from './core/app.js'") && !/AndroidBridge\.(shareFile|exportFile)\(/.test(src) && (src.match(/AB\.shareFile\(/g) || []).length === 2 && (src.match(/AB\.exportFile\(/g) || []).length === 1, 'B: main.js calls the bridge\'s file methods only in exportText and shareText');
    return bad;
}
{
    const bad = checkMain(main);
    assert(!bad.length, `B on js/main.js (${bad.join('; ') || 'all hold'})`);
    for (const l of bad) console.error('        ', l);
    const mutants = [ // the cold review's seven (RX1, TB), and the rest of the wiring
        ['the reminder loses Download now', 'function showNotice(msg, exportBtn = true, reloadBtn = false) {', 'function showNotice(msg, exportBtn = false, reloadBtn = false) {'], // v0.11.150 (BL1, VN): Reload
        ['the answer always on the notice bar', "if (resultPlace(menu, !!recovery) === 'note' && document.getElementById('saveNote')) note(line); else showNotice(line, false);", 'showNotice(line, false);'],
        ['the error bar without its fallback', '.then(done, () => fallbackCopy(text, done, fail)); else fallbackCopy(text, done, fail);\n});', '.then(done, () => fallbackCopy(text, done)); else fallbackCopy(text, done);\n});'],
        ['the GitHub fallback inverted', "if (!ok && shareText(ghFileName('txt'), body))", "if (ok && shareText(ghFileName('txt'), body))"],
        ['the error bar\'s share result inverted', 'const fail = () => { if (shareText(`bone-and-ash-error-${stamp()}.txt`, text)) {', 'const fail = () => { if (!shareText(`bone-and-ash-error-${stamp()}.txt`, text)) {'],
        ['the answer dropped', 'window.onAndroidExport = (ok, msg) => {\n', 'window.onAndroidExport = (ok, msg) => {\n    return;\n'],
        ['the reminder without its button', "showNotice('No save downloaded for over a day. Browser storage can be cleared; a downloaded file is the copy that survives.');", "showNotice('No save downloaded for over a day. Browser storage can be cleared; a downloaded file is the copy that survives.', false);"],
        ['the asked name forgotten', '{ askedName = name; AB.exportFile(name, text); }', '{ AB.exportFile(name, text); }'],
        ['Android\'s id shown', 'FILE_TEXT.saved(savedName(msg, askedName))', 'FILE_TEXT.saved(msg)'],
        ['the service worker in the app', 'if (wantsServiceWorker(window, location.protocol)) {', "if ('serviceWorker' in navigator) {"],
        ['the notice bar downloads', 'exportText(saveFileName(), serialize(g)); }', 'download(serialize(g), saveFileName()); }'],
        ['Copy status without its fallback', "note(shareText(`bone-and-ash-status-${stamp()}.txt`, text) ? FILE_TEXT.statusShared : 'The status could not be copied.')", "note('The status could not be copied.')"],
        ['Save to a file in a browser', `\${canSaveToFile(window.AndroidBridge) ? '<button class="btn" data-exportfile="1">Save to a file</button>' : ''}`, '<button class="btn" data-exportfile="1">Save to a file</button>'],
        ['Export all unsaved', 'function exportAll(toFile = false) { autosave(); expMark();', 'function exportAll(toFile = false) { expMark();'],
        ['SV-p: no parts', 'if (parts.length > 1) {', 'if (parts.length > 99) {'], // v0.11.283 (P51-A)
        ['SV-p: the first part again', '        p.next += 1;\n', ''],
        ['WB-y: never checked', 'welcomeCheck(); // WB-y: on opening', '// WB-y: on opening'],
        ['WB-y: the ✕ does nothing', 'if (b.dataset.welcomeclose) { welcomeCard = null; render(); return; }', 'if (b.dataset.welcomeclose) { render(); return; }'],
        ['L7-f: the tooltip not placed', 'tipEl.hidden = false; placeTip(b);', 'tipEl.hidden = false;'],
        ['RV M3: the card over a new game', ' || welcomeCard.g0 !== g', ''],
        ['RV M4: the checks shown', 'shown = shownLines(v.lines);', 'shown = v.lines;'],
        ['RV C5: time kept only on show', "if (document.visibilityState === 'hidden') welcomeKeep(); else", "if (document.visibilityState === 'hidden') {} else"],
        ['RV L4: the old parts kept over a load', 'if (ghParts && ghParts.g0 !== g) ghParts = null;', ''],
    ];
    let caught = 0;
    for (const [name, from, to] of mutants) {
        if (!main.includes(from)) { assert(false, `main.js mutant "${name}": its text is in main.js`); continue; }
        if (checkMain(main.replace(from, to)).length) caught++; else console.error('        main.js mutant survived:', name);
    }
    assert(caught === mutants.length, `mutation: ${caught} of ${mutants.length} mutants of main.js fail part B`);
}

// C. the app
assert(/@JavascriptInterface\s+public void exportFile\(final String name, final String content\)/.test(java) && /@JavascriptInterface\s+public void shareFile\(final String name, final String content\)/.test(java), 'C: the bridge has exportFile and shareFile (name, content)');
assert(/window\.onAndroidExport && window\.onAndroidExport\(/.test(java) && /report\(true, /.test(java) && /report\(false, /.test(java), 'C: the app answers onAndroidExport with ok or a failure');
assert(/name\.endsWith\("\.json"\) \? "application\/json" : "text\/plain"/.test(java), 'C: the share sheet sends .txt files as text');
assert(/\} else if \(resultCode == RESULT_OK && data != null && data\.getData\(\) != null\) \{[\s\S]{0,200}pendingReport = "the game was closed while the picker was open; try again";/.test(java) && /public void onPageFinished\(WebView view, String url\) \{\s+if \(pendingReport != null\) \{ String m = pendingReport; pendingReport = null; report\(false, m\); \}/.test(java), 'C: a picker result after Android closed the app is reported once the page has loaded (JE)');
assert(/Intent\.createChooser\(s, "Share file"\)/.test(java) && !/Share save file/.test(java), 'C: the share window says "Share file" (JT)');
// RV (TG4): the CSS that lets the tooltip sit beside its card (main.js sets left and top)
assert(/@media \(min-width: 1100px\) \{[\s\S]*#tip\.beside \{ bottom: auto; \}/.test(read('css/style.css')), 'L7-f (RV TG4): the PC CSS frees the tooltip\'s bottom when it sits beside the card');
// D
assert(/'js\/core\/app\.js'/.test(read('sw.js')), 'D: sw.js lists js/core/app.js');

// Mutation
{
    const dir = mkdtempSync(path.join(tmpdir(), 'app-mut-'));
    writeFileSync(path.join(dir, 'update.js'), read('js/core/update.js'));
    const mutants = [
        ['the file picker never chosen', "    if (file) return 'file';\n", ''],
        ['the share sheet even for Save to a file', "if (share && !toFile) return 'share';", "if (share) return 'share';"],
        ['no share sheet fallback', "    if (share) return 'share';\n    return 'download';", "    return 'download';"],
        ['any value counts as a bridge method', "typeof bridge.shareFile === 'function'", 'bridge.shareFile != null'],
        ['the service worker in the app', '!inApp(w) && ', ''],
        ['the service worker from file:', " && protocol !== 'file:'", ''],
        ['Save to a file on the share sheet', "exportRoute(bridge, true) === 'file'", "exportRoute(bridge, true) !== 'download'"],
        ['Android\'s id shown', "!asked ? String(msg || '') : asked", "!asked ? String(msg || '') : String(msg || '')"],
        ['the note on every page', "menu === 'saves' || (!menu && recoveryShown) ? 'note' : 'bar'", "menu ? 'note' : 'bar'"],
        ['SV-p: no split at all', 'if (s.length <= max) return [s];', 'return [s];'], // v0.11.283 (P51-A)
        ['SV-p: parts overlap', 'out.push(s.slice(i, i + max));', 'out.push(s.slice(i, i + max + 1));'],
        ['WB-y: due an hour early', 'now - p.seen >= WELCOME_AFTER', 'now - p.seen >= WELCOME_AFTER - 3600e3'],
        ['FS-s: no Coil in the name', "${Number(coil) > 0 ? `-coil${Number(coil)}` : ''}", ''], // v0.11.285 (G3-A)
        ['FS-s: the month from 0', 'p(d.getMonth() + 1)', 'p(d.getMonth())'],
        ['OS-a: the second tap any time', 'export const ASK_MS = 4000;', 'export const ASK_MS = 4e9;'],
        ['OS-a: any button confirms', 'if (armed && armed.k === k && now - armed.at < ASK_MS)', 'if (armed && now - armed.at < ASK_MS)'], // RV (TG2)
        ['OS-a: the first tap goes', "return { go: false, armed: { k, at: now } };", "return { go: true, armed: { k, at: now } };"],
        ['HK-t: keys with Ctrl too', ' || ev.ctrlKey || ev.altKey || ev.metaKey', ''],
        ['H1-r: a held key repeats', ' || ev.repeat', ''], // RV-A
        ['HK-t: 1 is the second card', "return { card: Number(k) - 1 };", "return { card: Number(k) };"],
        ['WB-y: the switch ignored', 'export const welcomeDue = (p, now) => !!p?.on && ', 'export const welcomeDue = (p, now) => '],
        ['WB-y: the first entry, not the last', 'g.log[g.log.length - 1]', 'g.log[0]'],
        ['L7-f: never above the card', 'below + h <= vh - gap ? below : above >= gap ? above :', 'below + h <= vh - gap ? below :'],
        ['L7-f: off the right edge', 'Math.min(r.left, vw - w - gap)', 'r.left'],
    ];
    let caught = 0, i = 0;
    for (const [name, from, to] of mutants) {
        if (!src.includes(from)) { assert(false, `mutant "${name}": its text is in app.js`); continue; }
        const f = path.join(dir, `m${i++}.mjs`); // beside a copy of update.js, so its import resolves outside the game's folder
        writeFileSync(f, src.replace(from, to));
        let bad;
        try { bad = suite(await import(pathToFileURL(f).href)); } catch (e) { bad = [String(e)]; }
        if (bad.length) caught++; else console.error('        mutant survived:', name);
    }
    rmSync(dir, { recursive: true, force: true });
    assert(caught === mutants.length, `mutation: ${caught} of ${mutants.length} mutants of app.js fail the checks`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
