// Run: node tests/update.test.mjs — v0.11.147 (owner pick UP1): the Android app's update check (js/core/update.js, Selene's).
// A the links match the workflow (the repo, the android-latest release, BoneAndAsh.apk, the API address); B the build number is
// read from the very title the workflow writes, and the workflow writes it only after the file is in place; C the reader, the
// comparison, the 404 retry and the switches; D main.js's wiring (read as text: it imports the DOM) and the app's side
// (MainActivity.java's bridge, its messages and its 404 wording); E sw.js keeps the module offline (and so in the app);
// F (v0.11.147, owner pick RV1, after the cold review) makeUpdater on a fake app, fake GitHub and fake timers: the busy, retry,
// redraw and auto-install rules. Mutation: each mutant of update.js must fail part A, C or F.
import { readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };

const wf = read('.github/workflows/android.yml');
const main = read('js/main.js');
const java = read('android/app/src/main/java/io/github/hufle/boneandash/MainActivity.java');
const src = read('js/core/update.js');

/** The checks on one copy of update.js (the real one, or a mutant): the failures' labels. */
async function suite(U) {
    const bad = [];
    const t = (c, l) => { if (!c) bad.push(l); };
    // A. the links against the workflow
    const fixed = /https:\/\/github\.com\/[^\s]+\/releases\/download\/[^\s]+\.apk/.exec(wf)?.[0];
    t(U.APK_URL === fixed, `A: APK_URL is the workflow's fixed link (${U.APK_URL} / ${fixed})`);
    t(U.APK_URL === `https://github.com/${U.REPO}/releases/download/${U.RELEASE_TAG}/${U.APK_NAME}` && U.REPO === 'hufle-beep/bone-and-ash', 'A: the link from the repo, the tag and the file name');
    t(new RegExp(`gh release upload ${U.RELEASE_TAG} `).test(wf) && new RegExp(`-f name=${U.APK_NAME.replace('.', '\\.')}`).test(wf), 'A: the workflow uploads to the same release and renames to the same file');
    t(U.RELEASE_API === `https://api.github.com/repos/${U.REPO}/releases/tags/${U.RELEASE_TAG}`, 'A: the API address is the release by its tag');
    // B. the title the workflow writes
    const title = /TITLE="([^"]+)"/.exec(wf)?.[1] || '';
    t(U.buildOf(title.replace('${GITHUB_RUN_NUMBER}', '7')) === 7 && U.buildOf(title.replace('${GITHUB_RUN_NUMBER}', '123')) === 123, `B: the build read from the workflow's title (${title})`);
    t(U.buildOf(/--title "(Bone and Ash for Android)"/.exec(wf)?.[1]) === null, 'B: the first-time title names no build');
    // C. the reader, the comparison, the retry, the switches
    t(U.buildOf('Bone and Ash for Android (build 2)') === 2 && U.buildOf('x (build 0)') === null && U.buildOf('x (build -3)') === null && U.buildOf('build 5') === null && U.buildOf(null) === null && U.buildOf(undefined) === null && U.buildOf('x (build 99999999999999999999)') === null, 'C: buildOf: only "(build N)" with N ≥ 1');
    const s = (ti, m) => JSON.stringify(U.updateState(ti, m));
    t(s('A (build 3)', 2) === '{"build":3,"mine":2,"newer":true}' && s('A (build 3)', 3) === '{"build":3,"mine":3,"newer":false}' && s('A (build 3)', 4) === '{"build":3,"mine":4,"newer":false}' && s('A (build 3)', 'x') === '{"build":3,"mine":0,"newer":true}' && U.updateState('A', 2) === null, 'C: updateState: newer only when GitHub\'s build is higher');
    const msg404 = 'Download failed: GitHub answered 404';
    t([0, 1, 2].every((n) => U.retryDownload('error', msg404, n)) && !U.retryDownload('error', msg404, 3) && U.RETRY_MAX === 3, 'C: a 404 is tried again three times, not a fourth');
    t(!U.retryDownload('error', 'Download failed: GitHub answered 500', 0) && !U.retryDownload('progress', '404', 0) && !U.retryDownload('ready', '404', 0) && !U.retryDownload('error', 'answered 1404', 0), 'C: no retry for other errors, other states or a 404 inside a number');
    t(U.RETRY_MS === 30e3 && U.CHECK_DELAY === 2500 && /30 s \(1\/3\)/.test(U.UPDATE_TEXT.retry(1)), 'C: Selene\'s timings: 30 s between tries, the check 2.5 s after start; the retry line says so');
    const p = (raw) => JSON.stringify(U.updPrefs(raw));
    t(p(null) === '{"auto":true,"autoInstall":false}' && p('junk') === '{"auto":true,"autoInstall":false}' && p('[]') === '{"auto":true,"autoInstall":false}' && p('{"auto":false}') === '{"auto":false,"autoInstall":false}' && p('{"auto":"no","autoInstall":1}') === '{"auto":true,"autoInstall":false}' && p('{"autoInstall":true,"x":1}') === '{"auto":true,"autoInstall":true}', 'C: the switches: check at start on, install automatically off; only true or false kept');
    t(U.UPDATE_KEY === 'boneash.update', 'C: the storage key (never renamed)');
    t(!U.inApp(undefined) && !U.inApp({}) && !U.inApp({ AndroidBridge: {} }) && !U.inApp({ AndroidBridge: { versionCode: 2 } }) && U.inApp({ AndroidBridge: { versionCode() { return 2; } } }), 'C: inApp only with the bridge\'s versionCode');
    // F. v0.11.147 (RV1, TC): makeUpdater on a fake app, fake GitHub and fake timers
    if (typeof U.makeUpdater !== 'function') { bad.push('F: makeUpdater exported'); return bad; }
    const rig = (o = {}) => {
        const env = { screen: 'main', auto: false, mine: 2, title: 'Bone and Ash for Android (build 5)', http: 200, net: false, app: true, throwOnRedraw: false, ...o };
        const log = { dl: 0, saves: 0, redraws: 0, fetch: 0, order: [], status: undefined, url: null };
        const timers = new Map(); let tid = 0;
        const bridge = { versionCode: () => env.mine, ...(o.noSelf ? {} : { downloadUpdate: (u) => { log.dl++; log.url = u; log.order.push('dl'); } }) };
        const up = U.makeUpdater({
            bridge: () => (env.app ? bridge : null),
            fetch: (url) => { log.fetch++; log.fetchUrl = url; return env.net ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve({ ok: env.http === 200, status: env.http, json: async () => ({ name: env.title }) }); },
            setTimeout: (f, ms) => { const id = ++tid; timers.set(id, { f, ms }); return id; },
            clearTimeout: (id) => { timers.delete(id); },
            save: () => { log.saves++; log.order.push('save'); },
            screen: () => env.screen,
            redraw: () => { log.redraws++; if (env.throwOnRedraw) throw new Error('a mistake in the page'); },
            status: (m) => { log.status = m; },
            autoInstall: () => env.auto,
        });
        const fire = () => { const all = [...timers.values()]; timers.clear(); for (const x of all) x.f(); return all.length; };
        return { up, env, log, timers, fire };
    };
    const T = U.UPDATE_TEXT, e404 = 'Download failed: GitHub answered 404';
    { const r = rig({ app: false }); await r.up.check(true); t(r.log.fetch === 0 && r.log.status === undefined && r.up.start() === false, 'F: in a browser nothing is asked or downloaded'); }
    { const r = rig({ mine: 5 }); await r.up.check(false); t(r.log.fetchUrl === U.RELEASE_API && r.log.redraws === 0 && r.log.status === T.latest({ mine: 5 }) && !r.up.st.found.newer, 'F: "latest" on the menu: no redraw (RD)'); }
    { const r = rig(); await r.up.check(false); t(r.log.redraws === 1 && r.up.st.found.newer && r.up.st.found.build === 5 && r.log.dl === 0, 'F: a newer build on the menu: one redraw, no download with the switch off'); }
    { const r = rig({ screen: 'main-armed' }); await r.up.check(false); t(r.log.redraws === 0 && r.up.st.found.newer, 'F: no redraw while New game is armed (NA)'); }
    { const r = rig({ screen: null }); await r.up.check(false); t(r.log.redraws === 0, 'F: no redraw in the game'); }
    { const r = rig({ screen: 'settings', mine: 5 }); await r.up.check(true); t(r.log.redraws === 1, 'F: Settings redrawn with the result'); }
    { const r = rig({ screen: null, auto: true }); await r.up.check(false); t(r.log.dl === 0, 'F: install automatically never starts in the game (AM)'); }
    { const r = rig({ auto: true }); await r.up.check(false); t(r.log.dl === 1 && r.log.url === U.APK_URL && r.log.order.join() === 'save,dl' && r.up.st.busy, 'F: install automatically from the menu: saved, then one download'); }
    { const r = rig({ auto: true }); await r.up.check(true); t(r.log.dl === 0, 'F: Check now never installs by itself'); }
    { const r = rig({ mine: 0, auto: true }); await r.up.check(false); t(r.up.st.found.unknown && !r.up.st.found.newer && r.log.redraws === 0 && r.log.dl === 0 && r.log.status === T.unknown({ build: 5 }), 'F: build 0 is unknown, not old: no button, no download (UB)'); }
    { const r = rig(); r.up.start(); r.up.onMessage('error', e404);
      const waiting = r.up.st.busy && r.timers.size === 1 && [...r.timers.values()][0].ms === U.RETRY_MS && r.log.status === T.retry(1);
      const again = r.up.start(); const cleared = r.timers.size === 0 && r.log.dl === 2;
      r.up.onMessage('ready', 'Installer opened.'); const n = r.fire();
      t(waiting && again && cleared && n === 0 && r.log.dl === 2 && !r.up.st.busy, 'F: a 404, busy through the wait; a start by hand ends the wait: one download, one installer (R2)'); }
    { const r = rig(); r.up.start(); for (let i = 0; i < 3; i++) { r.up.onMessage('error', e404); r.fire(); } r.up.onMessage('error', e404);
      t(r.log.dl === 4 && !r.up.st.busy && r.timers.size === 0 && r.log.status === T.missing && r.up.st.tries === 0, 'F: three retries, then the file is said to be missing (LM)'); }
    { const r = rig(); r.up.start(); r.up.onMessage('progress', '45'); const p1 = r.log.status === T.progress('45') && r.up.st.busy;
      r.up.onMessage('permission', 'Allow Bone and Ash to install apps'); const p2 = r.up.st.busy && r.up.start() === false && r.log.dl === 1;
      r.up.onMessage('ready', 'Installer opened.'); t(p1 && p2 && !r.up.st.busy && r.up.start() === true && r.log.dl === 2, 'F: progress; busy after "permission" until the app answers (R2)'); }
    { const r = rig({ screen: 'settings' }); r.up.start(); r.up.onMessage('error', 'Download failed: GitHub answered 500'); t(!r.up.st.busy && r.timers.size === 0 && r.log.status === 'Download failed: GitHub answered 500', 'F: another error: shown as the app says, no retry'); }
    for (const [o, want, l] of [[{ http: 403 }, T.limited, '403'], [{ http: 429 }, T.limited, '429'], [{ http: 404 }, T.none, '404'], [{ net: true }, T.offline, 'no network']]) {
        const r = rig(o); await r.up.check(true); const q = rig(o); await q.up.check(false);
        t(r.log.status === want && q.log.status === undefined, `F: a failed check (${l}): "${want}" on Check now, nothing at start (RL)`);
    }
    { const r = rig({ title: 'Bone and Ash for Android' }); await r.up.check(true); t(r.log.status === T.none && !r.up.st.found, 'F: a title with no build: none found'); }
    { const r = rig({ screen: 'settings', throwOnRedraw: true }); let threw = false; try { await r.up.check(true); } catch { threw = true; } t(threw && r.log.status !== T.offline, 'F: a mistake in the page is not reported as offline (RL)'); }
    { const r = rig({ noSelf: true }); t(r.up.start() === false && r.log.status === T.noSelf && r.log.saves === 0, 'F: an app without downloadUpdate says so'); }
    return bad;
}

// A–C on the real module
{
    const U = await import(pathToFileURL(path.join(ROOT, 'js/core/update.js')).href);
    const bad = await suite(U);
    assert(!bad.length, `A–C and F (the updater, 21 cases) on js/core/update.js (${bad.join('; ') || 'all hold'})`);
    for (const l of bad) console.error('        ', l);
    // B: the order in the workflow: the file swapped in before the title names the build
    const iRename = wf.indexOf(`-f name=${U.APK_NAME}`), iTitle = wf.indexOf('gh release edit android-latest --title "$TITLE"');
    assert(iRename > 0 && iTitle > iRename, 'B: the workflow renames the new file into place before it writes the build into the title');
}

// D. main.js and the app
assert(/from '\.\/core\/update\.js'/.test(main) && !/releases\/download|api\.github\.com\/repos\/[^`'"]*android/.test(main), 'D: main.js takes the links from update.js (none written in main.js)');
assert(/if \(inApp\(window\) && upd\.auto\) setTimeout\(\(\) => checkAppUpdate\(false\), CHECK_DELAY\);/.test(main), 'D: the check at start only in the app and only with the switch on');
assert(/const updater = makeUpdater\(\{/.test(main) && /save: \(\) => \{ if \(g && !recovery\) closeSave\(\); \}/.test(main) && /autoInstall: \(\) => upd\.autoInstall/.test(main), 'D: main.js hands update.js the save, the switch and the rest');
assert(/screen: \(\) => \(menu === 'settings' \? 'settings' : menu === 'main' \? \(Date\.now\(\) - newArmed < 4000 \? 'main-armed' : 'main'\) : null\)/.test(main), 'D: the screens, with New game\'s armed second tap (NA)');
assert(/window\.onAppUpdate = \(state, msg\) => updater\.onMessage\(state, msg\);/.test(main) && /updater\.check\(manual\)\.catch\(\(err\) => console\.error/.test(main), 'D: the app\'s messages to update.js; a mistake in the check logged, not shown as offline');
assert(/\$\{updatePanel\(\)\}/.test(main) && /appUpd\(\)\?\.newer \? `<button class="btn big" data-menu="settings">App update available/.test(main) && /mine \? `build \$\{mine\}` : 'unknown build'/.test(main), 'D: Settings shows the panel (an unknown build said so); the menu a button when a newer build is found');
for (const k of ['updauto', 'updinst', 'updcheck', 'updgo']) assert(main.includes(`data-${k}="1"`) && main.includes(`b.dataset.${k}`), `D: data-${k} written and handled`);
assert(/store\.set\(UPDATE_KEY, JSON\.stringify\(upd\)\)/.test(main) && /const upd = updPrefs\(store\.get\(UPDATE_KEY\)\)/.test(main), 'D: the switches read and written under UPDATE_KEY');
{ // TK: every literal key in the game's code; update.js's own is in no other file
    const files = []; const walk = (d) => { for (const f of readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const q = `${d}/${f.name}`; if (f.isDirectory()) walk(q); else if (/\.js$/.test(f.name)) files.push(q); } };
    walk('js');
    const keys = new Map();
    for (const f of files) for (const m of read(f).matchAll(/['"`](boneash\.[\w.]+)/g)) keys.set(m[1], [...(keys.get(m[1]) || []), f]);
    const own = keys.get('boneash.update') || [];
    assert(files.length > 30 && keys.size >= 10 && own.length === 1 && own[0] === 'js/core/update.js', `D: boneash.update written only in update.js, once (${keys.size} keys in ${files.length} files)`);
}
assert(/addJavascriptInterface\(new Bridge\(\), "AndroidBridge"\)/.test(java) && /@JavascriptInterface\s+public void downloadUpdate\(final String url\)/.test(java) && /@JavascriptInterface\s+public int versionCode\(\)/.test(java), 'D: the app\'s bridge has downloadUpdate and versionCode');
assert(/window\.onAppUpdate && window\.onAppUpdate\(/.test(java) && ['progress', 'permission', 'ready', 'error'].every((s) => java.includes(`post("${s}"`)), 'D: the app calls window.onAppUpdate with progress, permission, ready and error');
{
    const U = await import(pathToFileURL(path.join(ROOT, 'js/core/update.js')).href);
    const w = /"Download failed: " \+/.test(java) && /"GitHub answered " \+ code/.test(java);
    assert(w && U.retryDownload('error', 'Download failed: GitHub answered 404', 0), 'D: the app\'s 404 message is one update.js retries');
    assert(/BoneAndAsh\.apk/.test(java) && java.includes('getCacheDir(), "updates"'), 'D: the app downloads into its cache as BoneAndAsh.apk');
}
// E. offline, and so in the app's assets (the workflow copies what sw.js lists)
assert(/'js\/core\/update\.js'/.test(read('sw.js')), 'E: sw.js lists js/core/update.js');

// Mutation: each mutant must fail the suite
{
    const dir = mkdtempSync(path.join(tmpdir(), 'upd-mut-'));
    const mutants = [
        ['the file name', "APK_NAME = 'BoneAndAsh.apk'", "APK_NAME = 'BoneAndAsh-next.apk'"],
        ['the tag', "RELEASE_TAG = 'android-latest'", "RELEASE_TAG = 'android-build-2'"],
        ['the repo', "REPO = 'hufle-beep/bone-and-ash'", "REPO = 'hufle-beep/long-patience'"],
        ['no parentheses needed', '/\\(build (\\d+)\\)/', '/build (\\d+)/'],
        ['build 0 accepted', 'n > 0 && Number', 'n >= 0 && Number'],
        ['equal counts as newer', 'newer: build > m', 'newer: build >= m'],
        ['four retries', 'RETRY_MAX = 3', 'RETRY_MAX = 4'],
        ['any number retried', "/\\b404\\b/", "/404/"],
        ['every error retried', "state === 'error' && /", "state !== 'ready' && /"],
        ['check at start off', 'auto: true, autoInstall: false', 'auto: false, autoInstall: false'],
        ['install automatically on', 'auto: true, autoInstall: false', 'auto: true, autoInstall: true'],
        ['any value kept', "typeof p[k] === 'boolean'", 'p[k] != null'],
        ['the bridge alone', "typeof w.AndroidBridge.versionCode === 'function'", 'true'],
        ['the key renamed', "UPDATE_KEY = 'boneash.update'", "UPDATE_KEY = 'boneash.upd'"],
        ['a start by hand leaves the wait', 'if (st.timer != null) { h.clearTimeout(st.timer); st.timer = null; }', ''],
        ['not busy through the wait', 'st.tries++; say(UPDATE_TEXT.retry(st.tries));', 'st.tries++; st.busy = false; say(UPDATE_TEXT.retry(st.tries));'],
        ['not busy after permission', "if (state === 'permission') { say(", "if (state === 'permission') { st.busy = false; say("],
        ['the menu redrawn for latest', "(sc === 'main' && st.found.newer)", "sc === 'main' || sc === 'main-armed'"],
        ['auto-install in the game', 'h.autoInstall() && sc) start()', 'h.autoInstall()) start()'],
        ['build 0 as old', 'st.found = m ? u : { ...u, newer: false, unknown: true };', 'st.found = u;'],
        ['no rate-limit line', 'e.http === 403 || e.http === 429 ? UPDATE_TEXT.limited : ', ''],
        ['no missing-file line', "say(gone ? UPDATE_TEXT.missing : String(msg || ''));", "say(String(msg || ''));"],
        ['no save first', '        h.save();\n', ''],
        ['mistakes as offline', '.then((j) => ({ j }), (e) => ({ e }))', '.then((j) => ({ j }))'],
    ];
    let caught = 0;
    for (const [name, from, to] of mutants) {
        if (!src.includes(from)) { assert(false, `mutant "${name}": its text is in update.js`); continue; }
        const f = path.join(dir, `m${caught}-${Math.random().toString(36).slice(2)}.mjs`);
        writeFileSync(f, src.replace(from, to));
        let bad;
        try { bad = await suite(await import(pathToFileURL(f).href)); } catch (e) { bad = [String(e)]; }
        if (bad.length) caught++; else console.error('        mutant survived:', name);
    }
    rmSync(dir, { recursive: true, force: true });
    assert(caught === mutants.length, `mutation: ${caught} of ${mutants.length} mutants of update.js fail the checks`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
