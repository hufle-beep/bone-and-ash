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
    t(has('function showNotice(msg, exportBtn = true) {') && has(`notebar.querySelector('[data-note="export"]').hidden = !exportBtn;`), 'B: the notice bar keeps Download now unless a result line asks otherwise');
    t(/expMark\(\); showNotice\('No save downloaded for over a day\.[^']*'\);/.test(src), 'B: the export reminder keeps its Download now button');
    t(/const fail = \(\) => \{ if \(shareText\(`bone-and-ash-error-\$\{stamp\(\)\}\.txt`, text\)\) \{[^\n]*\n    if \(navigator\.clipboard\?\.writeText\) navigator\.clipboard\.writeText\(text\)\.then\(done, \(\) => fallbackCopy\(text, done, fail\)\); else fallbackCopy\(text, done, fail\);\n\}\);/.test(src), 'B: the error bar\'s Copy falls back to the share sheet (CP)');
    t(has("if (!ok && shareText(ghFileName('txt'), body)) { note(FILE_TEXT.ghShared); return; }"), 'B: Share to GitHub\'s long save falls back to the share sheet only when the copy failed (CP, GW)');
    t(has("note(shareText(`bone-and-ash-status-${stamp()}.txt`, text) ? FILE_TEXT.statusShared : 'The status could not be copied.')"), 'B: Copy status falls back to the share sheet (CP)');
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
        ['the reminder loses Download now', 'function showNotice(msg, exportBtn = true) {', 'function showNotice(msg, exportBtn = false) {'],
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
