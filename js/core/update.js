/** Bone and Ash — the Android app's update check (v0.11.147, owner pick UP1; Selene's, from hufle-beep/Long-patience).
 * No DOM here, so tests/update.test.mjs runs it: the links, the build number read from the release title, the comparison,
 * the 404 retry and the switches kept on the phone. main.js draws Settings → App updates and the menu button, and talks to
 * the app (AndroidBridge.versionCode, AndroidBridge.downloadUpdate, window.onAppUpdate in MainActivity.java).
 * The workflow (.github/workflows/android.yml, never renamed: its run number is the version code) uploads BoneAndAsh.apk to
 * the android-latest release first and only then writes "(build N)" into the release's title, so the title never names a
 * build whose file isn't there yet. */

export const REPO = 'hufle-beep/bone-and-ash';
export const RELEASE_TAG = 'android-latest';
export const APK_NAME = 'BoneAndAsh.apk';
export const APK_URL = `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${APK_NAME}`;
export const RELEASE_API = `https://api.github.com/repos/${REPO}/releases/tags/${RELEASE_TAG}`;
/** Storage key on the phone (never renamed): the two switches. */
export const UPDATE_KEY = 'boneash.update';
/** The check at start waits this long, so the menu is drawn first (Selene's 2.5 s). */
export const CHECK_DELAY = 2500;
/** A 404 on the download (the file still uploading): try again this many times, this far apart. */
export const RETRY_MAX = 3;
export const RETRY_MS = 30e3;

/** The switches: check at start (on), install automatically (off). Junk or a missing value keeps the default. */
export function updPrefs(raw) {
    const o = { auto: true, autoInstall: false };
    try { const p = JSON.parse(raw || '{}'); if (p && typeof p === 'object') for (const k of Object.keys(o)) if (typeof p[k] === 'boolean') o[k] = p[k]; } catch { /* defaults */ }
    return o;
}

/** The build number in a release title ("Bone and Ash for Android (build 12)" → 12); null when it names none. */
export function buildOf(title) {
    const m = /\(build (\d+)\)/.exec(String(title || ''));
    const n = m ? Number(m[1]) : 0;
    return n > 0 && Number.isSafeInteger(n) ? n : null;
}

/** What GitHub has against what is installed: { build, mine, newer } or null when the title names no build. */
export function updateState(title, mine) {
    const build = buildOf(title);
    if (build == null) return null;
    const m = Number(mine) || 0;
    return { build, mine: m, newer: build > m };
}

/** True inside the Android app (the bridge with a version code); false in a browser. */
export const inApp = (w) => !!(w && w.AndroidBridge && typeof w.AndroidBridge.versionCode === 'function');

/** Whether a message from the app should be tried again: a 404 on the download, fewer than RETRY_MAX tries so far. */
export const retryDownload = (state, msg, tries) => state === 'error' && /\b404\b/.test(String(msg)) && tries < RETRY_MAX;

/** The panel's lines (the app's own messages come from MainActivity.java and are shown as they are). */
export const UPDATE_TEXT = {
    checking: 'Checking GitHub…',
    none: 'No app build found on GitHub.',
    offline: 'Couldn\'t reach GitHub. Check your connection.',
    newer: (u) => `Build ${u.build} is available (you have ${u.mine}).`,
    latest: (u) => `You have the latest build (${u.mine}).`,
    noSelf: 'This app build can\'t update itself. Download the new version once from the link in a browser.',
    downloading: 'Downloading…',
    progress: (pct) => `Downloading… ${pct}%`,
    retry: (n) => `The build is still uploading; trying again in ${RETRY_MS / 1000} s (${n}/${RETRY_MAX})…`,
    limited: 'GitHub limits update checks; try again in an hour.', // v0.11.147 (RV1, RL): a 403 or 429
    unknown: (u) => `This app can't tell its own build; GitHub's newest is build ${u.build}.`, // RV1 (UB)
    missing: 'The app\'s file is missing on GitHub right now; the next build puts it back.', // RV1 (LM): a 404 after the last retry
};

/** v0.11.147 (owner pick RV1, after the cold review; TC): the check, the download and the app's messages, with what main.js
 * does passed in, so the busy, retry and redraw rules run in tests/update.test.mjs on a fake app and fake timers.
 * h: bridge() → AndroidBridge or null; fetch(url, opts) → Promise of { ok, status, json() }; setTimeout / clearTimeout;
 * save() the game; screen() → 'settings' | 'main' | 'main-armed' (the menu with New game's second tap armed) | null (in the game);
 * redraw() the page; status(msg) the panel's line; autoInstall() the switch. */
export function makeUpdater(h) {
    const st = { found: null, msg: '', busy: false, tries: 0, timer: null };
    const say = (m) => { st.msg = m; h.status(m); };
    const onSettings = () => { if (h.screen() === 'settings') h.redraw(); };
    const mine = () => { try { return Number(h.bridge()?.versionCode()) || 0; } catch { return 0; } };
    /** Start the download (the game saved first). False when it can't: no app, already downloading, or no self-update. */
    function start() {
        const b = h.bridge();
        if (!b || (st.busy && st.timer == null)) return false; // busy: downloading, or waiting for the install permission
        if (typeof b.downloadUpdate !== 'function') { say(UPDATE_TEXT.noSelf); return false; }
        if (st.timer != null) { h.clearTimeout(st.timer); st.timer = null; } // R2: a start by hand ends a retry wait
        h.save();
        st.busy = true; say(UPDATE_TEXT.downloading); onSettings();
        b.downloadUpdate(APK_URL);
        return true;
    }
    /** Ask GitHub (manual: Check now, every line shown; else the check at start, failures quiet). */
    function check(manual) {
        if (!h.bridge()) return Promise.resolve();
        const m = mine();
        if (manual) say(UPDATE_TEXT.checking);
        return h.fetch(RELEASE_API, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : Promise.reject({ http: r.status })))
            .then((j) => ({ j }), (e) => ({ e }))
            .then(({ j, e }) => { // a mistake in here is not "offline" (RL): it rejects the returned promise
                if (e) { if (manual) say(e.http === 403 || e.http === 429 ? UPDATE_TEXT.limited : e.http === 404 ? UPDATE_TEXT.none : UPDATE_TEXT.offline); return; }
                const u = updateState(j && j.name, m);
                if (!u) { say(UPDATE_TEXT.none); onSettings(); return; }
                st.found = m ? u : { ...u, newer: false, unknown: true }; // UB: build 0 is unknown, not old
                say(st.found.unknown ? UPDATE_TEXT.unknown(u) : st.found.newer ? UPDATE_TEXT.newer(u) : UPDATE_TEXT.latest(u));
                const sc = h.screen();
                if (sc === 'settings' || (sc === 'main' && st.found.newer)) h.redraw(); // RD + NA: no redraw for "latest" or while New game is armed
                if (st.found.newer && !manual && h.autoInstall() && sc) start(); // AM: only from the menu or Settings
            });
    }
    /** MainActivity.java's post: 'progress' (a percentage), 'permission' (still busy), 'ready' or 'error'. */
    function onMessage(state, msg) {
        if (state === 'progress') { say(UPDATE_TEXT.progress(msg)); return; }
        if (state === 'permission') { say(String(msg || '')); onSettings(); return; } // R2: the app installs when you come back
        if (retryDownload(state, msg, st.tries)) {
            st.tries++; say(UPDATE_TEXT.retry(st.tries));
            st.timer = h.setTimeout(() => { st.timer = null; st.busy = false; start(); }, RETRY_MS); // R2: busy through the wait
            onSettings(); return;
        }
        const gone = state === 'error' && /\b404\b/.test(String(msg));
        st.busy = false; st.tries = 0;
        say(gone ? UPDATE_TEXT.missing : String(msg || ''));
        onSettings();
    }
    return { st, start, check, onMessage, mine };
}
