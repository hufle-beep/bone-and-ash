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
    ['0.11.152', 'Fewer repeats: the romance scenes and replies that came back on a later day of the same Coil now have new texts (Mei Lin\'s and Ya\'s talks, the Blackroot fireside, Yuki\'s camp nights and her talks, the nights and the spring inside the Old Tree, the Fallout\'s second night). Yuki\'s daily scene has fourteen closing lines for each mood instead of three, and Old Wen and Mei Lin\'s mother one more each. A scene you come back to on the same day folds to its first paragraph (Read it all again opens it). And Day 21 starts with breakfast at Mei Lin\'s (+20 satiety) before the Elder comes.'],
    ['0.11.154', 'Fewer repeats, part two: the prologue\'s third night in the Blackroot, Ashfall\'s Day 10, the expedition\'s nights and the Drowned Wood\'s second camp, five days inside the Old Tree (the hall\'s light, the mornings, the quiet and knocking nights, Yuki\'s fifth day) and three work replies now read differently each time. Every breakthrough from True Core up to Heavenly Immortal has its own text, and the sky has opinions.'],
    ['0.11.155', 'Work and door cards now name the next step of familiarity: "Practised · 5/8 to Skilled", "Skilled · 12/18 to Mastered", then "Mastered". Every card uses the same steps (2, 8 and 18); the number was always the count to the next step, not to Mastered. The FAQ says so too.'],
    ['0.11.156', 'More than one card a day in Act 1. On the Blackroot road, in the Drowned Wood and the Ashen Hills you can forage again the same day, as in the Wilds (the grub and the fire-beetle stay once a day, and a card\'s friendship with Mei Lin or Ya still counts once a day), and take both Scout cards on one day. In Ashfall before the Old Tree, the Palisade, Militia and Clinic cards no longer close after the first one each day (each card is still once a Coil; the Council still sits once a day). On the last day in Ashfall, once the hunters are ready, you can drill them again for practice: XP and familiarity, nothing more; the heading says so, and the replies are new lines by Fable.'],
    ['0.11.157', 'The same in the prologue\'s Ashfall: the Clinic, the Bone Workshop and the Militia no longer close after the first card each day. You can treat the queue at the well, make needles and spearheads, and drill the hunters on the same day; each card is still once a Coil, and a failed try can be made again the same day.'],
    ['0.11.158', 'Yuki\'s job line now shows how fast she really is: "×1.8 of ×3 · 8/20 to her best", and "×3, her best" once she gets there (a haul that brings nothing counts half). Before, it showed the cards\' steps (Practised, Skilled, Mastered), which promise ×5 and ×10, speeds she never reaches.'],
    ['0.11.159', 'The Coil screen now gives Yuki her own line, "Yuki\'s hunting", with each job she practised that Coil and how fast she is at it in brackets, the same as her job line; she no longer counts among the cards closest to their next step or in the cards that went up a step. The FAQ\'s Yuki\'s job entry says she is at her best at 20 practice, and that a haul with no catch counts half (a catch she eats herself still counts 1).'],
    ['0.11.160', 'The Coil screen of the Coil that carries you from the prologue into Act 1 now counts that whole Coil, from its first dawn: the cards and Yuki\'s jobs you practised before Day 8 show there too. Before, it counted only from Day 8.'],
    ['0.11.161', 'On the Blackroot road, in the Drowned Wood and in the Ashen Hills, each forage card is now once a day, as in the Wilds (a failed try counts), and so is each hunt: the fight (the elk, the serpent, the hawks) and the small game are each once a day, so the Hunt card stays open while either is left to take. Each hunt also has "Not now.", so going back for the small game never forces the fight.'],
    ['0.11.166', 'Flirting with Mei Lin and Ya in the Blackroot now reads differently from Coil to Coil: each has three sets of five replies (one a day). Your first Coil of Act 1 has the old set; each rewind of Act 1 or "Go round again" brings the next new set (by Fable), then round again. Playing the whole game again starts over with the old set. What they give is unchanged.'],
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
