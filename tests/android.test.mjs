// Run: node tests/android.test.mjs — v0.11.145 (owner pick AP1): the Android app (android/, .github/workflows/android.yml),
// Selene's wrapper adapted. The APK can't be built here (Gradle and Maven are blocked), so this checks what can go wrong
// before GitHub builds it: the app ID in every place, the key opens, the version name read from sw.js, the build's
// trigger paths and copy step (every file the game loads ends up in the app; the copies git-ignored; a dropped folder fails
// the step), the Java (the bridge, the close save through 'pagehide', compiled with javac against tests/android-stubs/),
// and the resources the manifest and styles name.
import { readFileSync, existsSync, mkdtempSync, cpSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const R = (p) => path.join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
let pass = 0, fail = 0, skip = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };
const skipped = (l) => { skip++; console.log('  SKIP ', l); };
const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;

const APP_ID = 'io.github.hufle.boneandash';
const JAVA = `android/app/src/main/java/${APP_ID.replace(/\./g, '/')}/MainActivity.java`;
const gradle = read('android/app/build.gradle');
const wf = read('.github/workflows/android.yml');
const java = existsSync(R(JAVA)) ? read(JAVA) : '';
const sw = read('sw.js');

// A. the app ID, the same everywhere
assert(new RegExp(`namespace '${APP_ID}'`).test(gradle) && new RegExp(`applicationId '${APP_ID}'`).test(gradle), `A: build.gradle's namespace and applicationId are ${APP_ID}`);
assert(java.startsWith(`package ${APP_ID};`), 'A: MainActivity.java sits under the app ID\'s folders with the same package');
assert(/include ':app'/.test(read('android/settings.gradle')) && /compileSdk 34/.test(gradle) && /targetSdk 34/.test(gradle) && /minSdk 26/.test(gradle), 'A: one app module; compile and target SDK 34, min 26 (S34, Selene\'s tested setup)');
assert(/version '8\.5\.2'/.test(read('android/build.gradle')) && /gradle-version: '8\.7'/.test(wf) && /java-version: '17'/.test(wf), 'A: AGP 8.5.2, Gradle 8.7, Java 17 (Selene\'s)');
{
    const leftovers = [];
    const walk = (d) => { for (const e of readdirSync(R(d), { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) { if (e.name !== 'assets') walk(p); } else if (!/\.keystore$/.test(e.name) && /LongPatience|longpatience|Tidelocked|LP_|\bsave\(\)\}/.test(read(p))) leftovers.push(p); } };
    walk('android');
    if (/LongPatience|longpatience|Tidelocked|LP_/.test(wf)) leftovers.push('android.yml');
    assert(leftovers.length === 0, `A: no Selene app name, file name, secret or save() call left in android/ and the workflow (${leftovers.join(', ')})`);
}

// LK1 (owner pick, v0.11.145): the leftovers scan keeps the app's folder and the stand-ins on purpose, nothing else of them
{
    const files = JSON.parse(read('tools/leftovers-keep.json')).keep.files;
    assert(/Gradle builds the app/.test(files['android/*'] || '') && /javac compiles them/.test(files['tests/android-stubs/*'] || '') && Object.keys(files).filter((k) => /android/.test(k)).length === 2, 'LK1: the keep-list holds android/* (Gradle) and tests/android-stubs/* (javac), with their reasons');
}

// B. the signing key (decision 2026-11-05 #7: in the repo)
{
    const store = /BA_KEYSTORE'\) \?: '\.\.\/([^']+)'/.exec(gradle)?.[1];
    const pass_ = /BA_STORE_PASS'\) \?: '([^']+)'/.exec(gradle)?.[1], alias = /BA_KEY_ALIAS'\) \?: '([^']+)'/.exec(gradle)?.[1], keyPass = /BA_KEY_PASS'\) \?: '([^']+)'/.exec(gradle)?.[1];
    assert(store === 'boneandash.keystore' && existsSync(R(`android/${store}`)), 'B: the key is android/boneandash.keystore, in the repo');
    assert(pass_ && pass_ === keyPass, 'B: the store and key passwords are the same (a PKCS12 store needs that)');
    if (has('keytool')) {
        const r = spawnSync('keytool', ['-list', '-v', '-storetype', 'PKCS12', '-keystore', R(`android/${store}`), '-storepass', pass_, '-alias', alias], { encoding: 'utf8' });
        const until = /until: .* (\d{4})\s*$/m.exec(r.stdout)?.[1];
        assert(r.status === 0 && /Entry type: PrivateKeyEntry/.test(r.stdout) && /Owner: CN=Bone and Ash/.test(r.stdout), `B: the key opens with build.gradle's password and alias (${alias}), a private key in a PKCS12 store, owner Bone and Ash`);
        assert(Number(until) >= 2056, `B: the key is valid until ${until} (30 years; every later APK must be signed with it)`);
    } else skipped('B: keytool not installed, the key not opened');
}

// C. the version: code from the run number, name from sw.js
{
    const game = /VERSION = 'bone-ash-([^']+)'/.exec(sw)?.[1];
    assert(/System\.getenv\('GITHUB_RUN_NUMBER'\)/.test(gradle) && /versionCode ciBuild/.test(gradle), 'C: the version code is the build workflow\'s run number');
    const re = /swFile\.text =~ \/(.+)\/\)/.exec(gradle)?.[1];
    const m = re && new RegExp(re).exec(sw);
    assert(m && m[1] === game && /^\d+\.\d+\.\d+$/.test(game), `C: build.gradle's pattern reads the game's version from sw.js (${m?.[1]})`);
    assert(/rootProject\.file\('\.\.\/sw\.js'\)/.test(gradle) && /versionName "\$\{gameVersion\} \(build \$\{ciBuild\}\)"/.test(gradle), 'C: the version name is "<game> (build N)", from the repo\'s sw.js');
    const sed = /GAME=\$\(sed -n "([^"]+)" sw\.js\)/.exec(wf)?.[1];
    const out = sed ? execFileSync('sed', ['-n', sed, R('sw.js')], { encoding: 'utf8' }).trim() : '';
    assert(out === game, `C: the release notes' sed reads the same version (${out})`);
}

// D. the workflow: when it runs, what it copies, the release
const steps = wf.split(/\n      - /).slice(1);
const runOf = (name) => {
    const s = steps.find((x) => x.startsWith(`name: ${name}\n`));
    const m = s && /\n        run: \|\n([\s\S]*)$/.exec(s);
    return m ? m[1].split('\n').map((l) => l.replace(/^ {10}/, '')).join('\n') : '';
};
{
    const paths = /paths:\n((?:\s+- '[^']+'\n)+)/.exec(wf)?.[1].match(/'([^']+)'/g).map((x) => x.slice(1, -1)) || [];
    const listed = [...sw.matchAll(/'((?:js|css|art|icons)\/[^']+|index\.html|manifest\.webmanifest)'/g)].map((m) => m[1]);
    const tops = [...new Set(listed.map((f) => (f.includes('/') ? `${f.split('/')[0]}/**` : f)))];
    assert(listed.length > 250, `D: sw.js lists the game's files (${listed.length})`);
    assert(tops.every((t) => paths.includes(t)) && paths.includes('android/**') && paths.includes('.github/workflows/android.yml'), `D: a push touching any game folder, android/ or the workflow builds (${tops.join(' ')})`);
    assert(!paths.some((p) => /sw\.js/.test(p)), 'D: sw.js is not a trigger (bumped on every push: docs pushes would build an APK)');
    assert(/branches: \[main\]/.test(wf) && /contents: write/.test(wf) && /group: android-build/.test(wf), 'D: main only, write access for the release, one build at a time');
    const copy = runOf('Copy the game into the app');
    assert(/cp index\.html manifest\.webmanifest sw\.js "\$A\/"/.test(copy) && /cp -r js css art icons "\$A\/"/.test(copy), 'D: the copy step copies index.html, the manifest, sw.js (the version label) and js/ css/ art/ icons/');
    if (has('node') && has('cp')) {
        const tmp = mkdtempSync(path.join(tmpdir(), 'ba-android-'));
        try {
            for (const f of ['index.html', 'manifest.webmanifest', 'sw.js', 'js', 'css', 'art', 'icons']) cpSync(R(f), path.join(tmp, f), { recursive: true });
            cpSync(R('android/app/src/main/assets'), path.join(tmp, 'android/app/src/main/assets'), { recursive: true });
            const run = (script) => spawnSync('bash', ['-e', '-c', script], { cwd: tmp, encoding: 'utf8' });
            const ok = run(copy);
            const n = Number(/(\d+) files from sw\.js are in the app/.exec(ok.stdout)?.[1]);
            assert(ok.status === 0 && n === listed.length, `D: the copy step runs and finds every file sw.js lists in the app (${n} of ${listed.length})`);
            const A = path.join(tmp, 'android/app/src/main/assets');
            assert(['index.html', 'js/main.js', 'js/core/game.js', 'css/style.css', 'art/bg/forest.jpg', 'icons/icon.svg', 'sw.js'].every((f) => existsSync(path.join(A, f))), 'D: the copies sit where the page asks for them (assets/index.html, assets/js/main.js, …)');
            rmSync(A, { recursive: true }); cpSync(R('android/app/src/main/assets'), A, { recursive: true });
            const bad = run(copy.replace('cp -r js css art icons', 'cp -r js css icons'));
            assert(bad.status !== 0 && /missing in the app/.test(bad.stderr), 'D: a copy without art/ fails the step (a missing picture or a blank screen never reaches a release)');
        } finally { rmSync(tmp, { recursive: true, force: true }); }
    } else skipped('D: node or cp missing, the copy step not run');
    if (has('git') && existsSync(R('.git'))) {
        const ign = (p) => spawnSync('git', ['check-ignore', '-q', p], { cwd: ROOT }).status === 0;
        assert(['index.html', 'sw.js', 'js/main.js', 'art/pic/camp.webp', 'icons/icon-512.png'].every((f) => ign(`android/app/src/main/assets/${f}`)) && !ign('android/app/src/main/assets/.gitkeep'), 'D: the copied game is git-ignored; only assets/.gitkeep is kept');
        assert(!ign('android/boneandash.keystore') && !ign(JAVA), 'D: the key and the Java are not ignored');
    } else skipped('D: no git, the ignore rules not checked');
    assert(/BoneAndAsh\.apk/.test(wf) && /BoneAndAsh-next\.apk/.test(wf) && /gh release edit android-latest --title "\$TITLE"/.test(wf) && /TITLE="Bone and Ash for Android \(build \$\{GITHUB_RUN_NUMBER\}\)"/.test(wf), 'D: BoneAndAsh.apk on android-latest, uploaded as -next then swapped, the build number in the title last');
    assert(/TAG="android-build-\$\{GITHUB_RUN_NUMBER\}"/.test(wf) && /--prerelease/.test(wf) && /tail -n \+6/.test(wf), 'D: each build kept as the pre-release android-build-N, the newest 5');
    assert(/cp app\/build\/outputs\/apk\/release\/app-release\.apk "\$RUNNER_TEMP\/BoneAndAsh\.apk"/.test(wf) && /gradle assembleRelease/.test(wf), 'D: the signed release APK is what goes up');
}

// E. the Java: the page, the bridge, the close save
{
    assert(/START_URL = "https:\/\/appassets\.androidplatform\.net\/assets\/index\.html"/.test(java) && /addPathHandler\("\/assets\/", new WebViewAssetLoader\.AssetsPathHandler\(this\)\)/.test(java), 'E: the game is served from https://appassets.androidplatform.net/assets/ (a real origin: modules load, saves persist)');
    const bridge = [...java.matchAll(/@JavascriptInterface\s+public \w+ (\w+)\(/g)].map((m) => m[1]);
    assert(JSON.stringify(bridge) === JSON.stringify(['exportFile', 'shareFile', 'isApp', 'downloadUpdate', 'versionCode']) && /addJavascriptInterface\(new Bridge\(\), "AndroidBridge"\)/.test(java), `E: window.AndroidBridge has Selene's five methods (${bridge.join(', ')})`);
    assert(/SAVE_JS = "try\{window\.dispatchEvent\(new Event\('pagehide'\)\)\}catch\(e\)\{\}"/.test(java) && (java.match(/evaluateJavascript\(SAVE_JS/g) || []).length === 2 && !/save\(\)\}/.test(java), 'E: onPause and onDestroy fire the game\'s pagehide (no global save() in Bone and Ash)');
    assert(/window\.addEventListener\('pagehide', closeSave\)/.test(read('js/main.js')), 'E: js/main.js still saves on pagehide (closeSave): the app\'s background save depends on it');
    assert(/web\.setBackgroundColor\(0xFFECE8DF\)/.test(java) && /--paper: #ece8df/.test(read('css/style.css')), 'E: the WebView\'s background is the game\'s paper');
    assert(/new File\(dir, "BoneAndAsh\.apk"\)/.test(java) && /moveTaskToBack\(true\)/.test(java) && /onShowFileChooser/.test(java), 'E: the update file is BoneAndAsh.apk; Back sends the app to the background; the file chooser opens Android\'s picker');
    const cache = [...java.matchAll(/new File\(getCacheDir\(\), "(\w+)"\)/g)].map((m) => m[1]);
    const shared = [...read('android/app/src/main/res/xml/file_paths.xml').matchAll(/path="(\w+)\/"/g)].map((m) => m[1]);
    assert(cache.length === 2 && cache.every((c) => shared.includes(c)), `E: the folders the Java shares from (${cache.join(', ')}) are in file_paths.xml`);
    if (has('javac')) {
        const out = mkdtempSync(path.join(tmpdir(), 'ba-javac-'));
        try {
            const stubs = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.java')) stubs.push(p); } };
            walk(R('tests/android-stubs'));
            const r = spawnSync('javac', ['--release', '17', '-nowarn', '-d', out, ...stubs, R(JAVA)], { encoding: 'utf8' });
            const errs = (r.stderr || '').split('\n').filter((l) => /error:/.test(l));
            assert(r.status === 0, `E: MainActivity.java compiles with javac (Java 17) against the Android stand-ins (${errs.slice(0, 3).join(' | ') || 'no errors'})`);
            assert(existsSync(path.join(out, ...APP_ID.split('.'), 'MainActivity$Bridge.class')), 'E: the bridge class is built');
        } finally { rmSync(out, { recursive: true, force: true }); }
    } else skipped('E: javac not installed, the Java not compiled');
}

// F. the resources the manifest and the styles name exist
{
    const res = 'android/app/src/main/res';
    const xmls = []; const walk = (d) => { for (const e of readdirSync(R(d), { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else if (p.endsWith('.xml')) xmls.push(p); } };
    walk(res);
    const values = xmls.filter((p) => /\/values[^/]*\//.test(p)).map(read).join('\n');
    const defined = (type, name) => {
        if (['string', 'color', 'style'].includes(type)) return new RegExp(`<${type} name="${name}"`).test(values);
        return readdirSync(R(res)).filter((d) => d === type || d.startsWith(`${type}-`)).some((d) => existsSync(R(`${res}/${d}/${name}.xml`)) || existsSync(R(`${res}/${d}/${name}.png`)));
    };
    const refs = [...[read('android/app/src/main/AndroidManifest.xml'), ...xmls.map(read)].join('\n').matchAll(/@(string|color|style|xml|drawable|mipmap)\/(\w+)/g)].map((m) => [m[1], m[2]]);
    const missing = refs.filter(([t, n]) => !defined(t, n)).map(([t, n]) => `@${t}/${n}`);
    assert(refs.length >= 15 && missing.length === 0, `F: every resource the manifest and resources name exists (${refs.length} references; missing ${missing.join(', ') || 'none'})`);
    assert(/<string name="app_name">Bone and Ash<\/string>/.test(values), 'F: the app is called Bone and Ash');
    const fg = read(`${res}/drawable/ic_launcher_foreground.xml`);
    assert(/android:viewportWidth="108"/.test(fg) && (fg.match(/<path /g) || []).length === 4 && /#9E2B35/.test(fg) && /#1B2421/.test(read(`${res}/drawable/ic_launcher_background.xml`)), 'F: the launcher icon is icons/icon.svg redrawn as an adaptive icon (its ground, the sun, the blade, the pommel, the stroke)');
    assert(!/windowLightNavigationBar/.test(read(`${res}/values/styles.xml`)) && /windowLightNavigationBar/.test(read(`${res}/values-v27/styles.xml`)), 'F: the light navigation bar only from Android 8.1 (API 27), where it exists');
}

console.log(`\n${pass} passed, ${fail} failed${skip ? `, ${skip} skipped` : ''}`);
process.exit(fail === 0 ? 0 : 1);
