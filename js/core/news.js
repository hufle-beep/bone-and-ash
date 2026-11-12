/** Bone and Ash — the build label, What's new and the new-version notice (v0.11.150, owner pick BL1; Selene's, from
 * hufle-beep/Long-patience "What's new (R20)" and its build label). No DOM, no storage here, so tests/news.test.mjs runs it;
 * main.js draws the menu's box, Settings → What's new and the notice bar, and keeps SEEN_KEY on the phone (never in a save).
 * The app's storage is apart from the browser's, so each keeps its own. */

/** Storage key on the phone (never renamed): the game version this phone last opened. */
export const SEEN_KEY = 'boneash.seen';

/** The browser asks for a new version when the game comes back on screen, at most this often (UC). */
export const RECHECK_MS = 30 * 60e3;

/** What's new, oldest first: [version, note]. Plain text (escaped when drawn). The working rule (WK, v0.11.150): every push
 * that changes what a player sees adds one line here, in plain words; a docs-only push adds none. */
export const NOTES = [
    ['0.11.150', 'The Android app is complete: it finds new builds by itself (Settings → App updates), saves and shares files through Android, and carries its own fonts, so it works offline from the first start. Its saves are apart from the browser\'s (FAQ: The Android app). New everywhere: this What\'s new box (the whole list is in Settings), the app\'s build number on the menu, and in the browser a Reload bar when a new version arrives while the game is open.'],
    ['0.11.151', 'A night that wakes you (an attack, a visitor, the weather) now says what the hours of sleep before it gave back: "Slept until 01:00: +12 HP, +30 Qi." The sleep itself is unchanged.'],
];

const parts = (v) => (/^\d+(\.\d+)*$/.test(String(v ?? '')) ? String(v).split('.').map(Number) : null);
/** Dotted versions compared by number ("0.11.150" > "0.11.99"); null when either isn't one. */
export function cmpVer(a, b) {
    const x = parts(a), y = parts(b);
    if (!x || !y) return null;
    for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d < 0 ? -1 : 1; }
    return 0;
}

/** The notes to show when the game opens: { list (newest first), record (the version to keep as seen, or null) }.
 * seen: the kept version (null on a phone's first run); current: the version running; hadSave: an autosave existed.
 * First run: with a save, this version's notes (someone who played before this box existed); a new player, none.
 * An older seen: every note after it up to this version. The same, a newer one (an older copy opened) or junk: none.
 * An unknown current ('?', offline with nothing cached) shows nothing and records nothing. */
export function newsSince(seen, current, hadSave, notes = NOTES) {
    if (!parts(current)) return { list: [], record: null };
    const upTo = (v) => cmpVer(v, current) <= 0;
    let list;
    if (seen == null || seen === '') list = hadSave ? notes.filter(([v]) => cmpVer(v, current) === 0) : [];
    else list = notes.filter(([v]) => cmpVer(v, seen) > 0 && upTo(v)); // junk compares as null: nothing
    const keep = parts(seen) && cmpVer(seen, current) > 0 ? seen : current; // never step the kept version back
    return { list: [...list].reverse(), record: keep === seen ? null : keep };
}

/** The menu's version line: "0.11.150 · build 6" in the app, "0.11.150" in a browser (LB). */
export const versionLabel = (version, build) => (Number(build) > 0 ? `${version} · build ${Number(build)}` : String(version));
/** Copy status's place line (LB). */
export const statusPlace = (inApp, build) => (inApp ? `Android app build ${Number(build) > 0 ? Number(build) : 'unknown'}` : 'browser');

/** VN: a new service worker took over while the game was open. A notice only in a browser, only if a version controlled the
 * page before this one (never on a first install, which takes over a page no worker had), and only if the new version is not
 * the one already running. */
export const takeoverNotice = ({ inApp, hadController, running, arrived }) => !inApp && !!hadController && !!parts(arrived) && arrived !== running;

/** UC: time to ask for a new version again (never checked, or RECHECK_MS since the last ask; a clock gone back counts as due). */
export const recheckDue = (now, last, gap = RECHECK_MS) => last == null || now < last || now - last >= gap;

/** The notice's line (VN). */
export const READY_TEXT = (v) => `Version ${v} is ready. Reload saves your game and opens it.`;
