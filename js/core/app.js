/** Bone and Ash — the game's files inside the Android app (v0.11.148, owner pick EX1; Selene's exportText, from
 * hufle-beep/Long-patience). No DOM here, so tests/appfiles.test.mjs runs it. The app (MainActivity.java) gives the page
 * AndroidBridge.shareFile(name, text) (Android's share sheet: Drive, Gmail, Files, a chat; it reports nothing back) and
 * AndroidBridge.exportFile(name, text) (Android's "save as" file picker; it answers window.onAndroidExport(ok, msg)).
 * A browser has neither and downloads as before. */
import { inApp } from './update.js';

/** Where a file goes: 'share' (the app's share sheet), 'file' (the app's file picker) or 'download' (a browser).
 * toFile asks for the file picker (the app's "Save to a file" buttons); without one, the share sheet. */
export function exportRoute(bridge, toFile) {
    const share = !!bridge && typeof bridge.shareFile === 'function';
    const file = !!bridge && typeof bridge.exportFile === 'function';
    if (share && !toFile) return 'share';
    if (file) return 'file';
    if (share) return 'share';
    return 'download';
}

/** The app's "Save to a file" buttons show only where the file picker is. */
export const canSaveToFile = (bridge) => exportRoute(bridge, true) === 'file';

/** The service worker (the browser's offline copy) only outside the app: the app's files are in the APK. */
export const wantsServiceWorker = (w, protocol) => !inApp(w) && protocol !== 'file:' && !!w?.navigator && 'serviceWorker' in w.navigator;

/** v0.11.148 (RX1, FN): the name to show after the file picker. Android hands back the last part of the file's address, which
 * is the file name only on the phone's own storage (Downloads gives "msf:1000012345", Drive an encoded id): a name that ends in
 * .json is shown as it is, anything else gives way to the name the game asked for. */
export const savedName = (msg, asked) => (/\.json$/i.test(String(msg || '')) || !asked ? String(msg || '') : asked);

/** RX1 (NL): where the app's answer shows: under the buttons on the Saves page or the recovery screen, else the notice bar. */
export const resultPlace = (menu, recoveryShown) => (menu === 'saves' || (!menu && recoveryShown) ? 'note' : 'bar');

/** The lines the game shows for the app's files (the app's own messages are shown as they come). */
export const FILE_TEXT = {
    saved: (name) => `Saved ${name}.`,
    failed: (msg) => `Export failed: ${msg}`,
    share: 'Choose where the file goes.',
    allDownloaded: 'All saves downloaded.',
    statusShared: 'The status could not be copied; it went to the share sheet as a text file.',
    errorShared: 'Shared',
    ghShared: 'The save could not be copied; it went to the share sheet as a text file. To share it, open the game\'s saves folder on GitHub and upload it there.', // RX1 (GW): no GitHub page opens
};

/* ---------- v0.11.283 (owner pick P51-A, SV-p): a long save shared to GitHub in parts ---------- */
/** Two saves shared with "Share to GitHub" arrived cut at exactly 20,001 bytes (where it is cut is not known: the paste on GitHub's
 *  page, or the phone's clipboard); late saves are 16–35 KB packed. A save longer than this goes in parts, each its own GitHub page
 *  and its own "Commit changes". The parts are slices of the same text: joined in order they are the save, so the save format is
 *  unchanged (tools/joinsave.mjs reads the names back and joins them). */
export const SAVE_PART_MAX = 18000;
/** The text in slices of at most `max` characters (one slice when it fits). */
export function saveParts(text, max = SAVE_PART_MAX) {
    const s = String(text || '');
    if (s.length <= max) return [s];
    const out = [];
    for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max));
    return out;
}
/** Part i of n's file name: "…-ashfall.txt" → "…-ashfall-part1of2.txt". */
export const partName = (name, i, n) => String(name).replace(/(\.\w+)?$/, (ext) => `-part${i}of${n}${ext || ''}`);
export const PART_TEXT = {
    copied: (i, n, kb) => `Part ${i} of ${n} copied (${kb} KB). On GitHub, paste it into the empty file, then tap "Commit changes".${i < n ? ` Then come back here and tap "Share part ${i + 1} of ${n}".` : ' That was the last part.'}`,
    button: (i, n) => `Share part ${i} of ${n}`,
    note: 'A long save goes in parts: one GitHub page and one "Commit changes" for each.',
};

/* ---------- v0.11.283 (owner pick P51-A, WB-y): Welcome back, the third notice in design.md ---------- */
/** Storage key on the phone (never renamed): { seen: the last time the game was on screen (ms), on: the switch }. Never in a save. */
export const WELCOME_KEY = 'boneash.welcome';
/** The card shows when the game comes back after this long away. */
export const WELCOME_AFTER = 6 * 3600e3;
/** The kept record; junk or a missing value gives { seen: 0, on: true }. */
export function welcomePrefs(raw) {
    const o = { seen: 0, on: true };
    try { const p = JSON.parse(raw || '{}'); if (p && typeof p === 'object') { if (Number.isFinite(p.seen) && p.seen > 0) o.seen = p.seen; if (typeof p.on === 'boolean') o.on = p.on; } } catch { /* defaults */ }
    return o;
}
/** True when the card is due: the switch on, a time on record and at least WELCOME_AFTER since. */
export const welcomeDue = (p, now) => !!p?.on && p.seen > 0 && now - p.seen >= WELCOME_AFTER;
/** The card's content from a game: { when, scene, lines } (the journal's last entry, up to 12 lines; none for a new game). */
export function welcomeView(g) {
    if (!g) return null;
    const last = Array.isArray(g.log) ? g.log[g.log.length - 1] : null;
    return { minutes: g.minutes, scene: g.scene, lines: last && Array.isArray(last.lines) ? last.lines.slice(0, 12).map(String) : [] };
}
/** How long away, in plain words ("7 hours", "2 days"). */
export function awayText(ms) {
    const h = Math.floor(ms / 3600e3);
    if (h < 48) return `${h} hour${h === 1 ? '' : 's'}`;
    const d = Math.floor(h / 24);
    return `${d} days`;
}
export const WELCOME_TEXT = {
    head: 'Welcome back',
    away: (t) => `You were away ${t}. Where you left off:`,
    none: 'Nothing has happened yet in this game.',
    last: 'The last thing that happened:',
    setting: (on) => `Welcome back after 6 hours away: ${on ? 'on' : 'off'}`,
};

/* ---------- v0.11.283 (owner pick P51-A, L7-f): the held card's tooltip on a PC ---------- */
/** On a screen 1100 px or wider (the PC layout) the tooltip opens beside the held card: under it when it fits, else above it,
 *  its left edge with the card's and kept inside the window (`gap` px from each edge). Before, it sat bottom left, under the
 *  story column (above 112 rem, outside the centred app). The phone keeps its bar along the bottom. `r`: the card's
 *  getBoundingClientRect(); `w`, `h`: the tooltip's size; `vw`, `vh`: the window's. Returns { left, top } in px. */
export const TIP_WIDE = 1100;
export function tipBox(r, w, h, vw, vh, gap = 8) {
    const left = Math.max(gap, Math.min(r.left, vw - w - gap));
    const below = r.bottom + gap, above = r.top - gap - h;
    const top = below + h <= vh - gap ? below : above >= gap ? above : Math.max(gap, vh - h - gap);
    return { left: Math.round(left), top: Math.round(top) };
}

/* ---------- v0.11.285 (owner pick G3-A, 2026-11-27 02:04): file names, the second tap before a load or an overwrite, keys ---------- */
/** FS-s: a save file's name, from the real date and time, the Coil and the build (`bone-and-ash-2026-11-27-0158-coil8-0.11.285.json`).
 *  Before: the game clock only (two downloads at the same game minute had one name). `ver` unknown ('' or '?'): left out. */
export function fileStamp(d, coil, ver) {
    const p = (n) => String(n).padStart(2, '0');
    const when = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
    const v = /^\d+(\.\d+)+$/.test(String(ver || '')) ? `-${ver}` : '';
    return `bone-and-ash-${when}${Number(coil) > 0 ? `-coil${Number(coil)}` : ''}${v}.json`;
}
/** OS-a: a load or an overwrite asks for a second tap, naming both games (`there`: the slot's or file's line, `here`: this game's).
 *  ASK_MS: the second tap counts within this time (as New game). Save here on an empty slot, and Load into no game, ask nothing. */
export const ASK_MS = 4000;
/** The second tap's decision (RV TG2): { go: true } on the second tap of the same `k` within ASK_MS, else { go: false } and armed for `k`.
 *  `armed`: { k, at } from the last call. Pure, so the tests run it. */
export function askStep(armed, k, now) {
    if (armed && armed.k === k && now - armed.at < ASK_MIN_MS) return { go: false, armed, early: true }; // L5-a: a double tap is one tap
    if (armed && armed.k === k && now - armed.at < ASK_MS) return { go: true, armed: { k: '', at: 0 } };
    return { go: false, armed: { k, at: now } };
}
/** v0.11.290 (owner pick P58-A, SC-g): may this copy write the autosave? `stored`: the save in storage now; `mine`: the one this copy
 *  last wrote or loaded; `stale`: this copy already found another's save. A save written by another tab or window since stops this
 *  copy's writes until it is reloaded; an empty storage (none yet, or cleared) takes the write. Pure, so the tests run it. */
export const mayAutosave = (stored, mine, stale) => !stale && (stored == null || stored === mine);
export const COPY_TEXT = 'The game was opened in another tab or window and saved there, so this copy saves nothing more. Reload to carry on from that save, or download this copy\'s game first.'; // RV-A (L2): in the notebar, with Download now and Reload
/** v0.11.286 (owner pick G4-A, L5-a): a second tap counts only from this many ms after the first (a double tap confirms nothing). */
export const ASK_MIN_MS = 400;
/** L5-a: is a tap `now` the second tap of a confirm armed at `at`, within `win` ms? (New game, Bite the tail, Yield, a fatal card.) */
export const secondTap = (at, now, win) => now - at >= ASK_MIN_MS && now - at < win;
export const ASK_TEXT = {
    save: (n, there, here) => `Slot ${n} holds ${there}. Tap Save here again to put this game there instead (${here}); the game in the slot is lost.`,
    load: (n, there, here) => `Tap Load again: slot ${n} (${there}) takes the place of this game (${here}), which is kept as the "before" backup.`,
    file: (there, here) => `This file holds a game at ${there}. Loading it takes the place of this game (${here}), which is kept as the "before" backup.`,
    restore: (there, here) => `Tap the backup again: ${there} takes the place of this game (${here}), which is kept as the "before" backup.`, // L5-a
    fileBtn: 'Load it', cancel: 'Cancel',
};
/** HK-t: the keys, one table (a PC; the phone has none). `key` as KeyboardEvent.key; the Settings list reads `show` and `does`. */
export const HOTKEYS = [
    { key: '1-9', show: '1–9', does: 'the open cards or choices on the screen, in order' },
    { key: 'Escape', show: 'Esc', does: 'close the card details; on a menu page, back to the menu' },
    { key: 's', show: 'S', does: 'Story', tab: 'story' },
    { key: 'c', show: 'C', does: 'James', tab: 'sheet' },
    { key: 'h', show: 'H', does: 'Hammerspace', tab: 'bag' },
    { key: 'j', show: 'J', does: 'Journal', tab: 'journal' },
    { key: 'a', show: 'A', does: 'Archive', tab: 'archive' }, // v0.11.287 (owner pick P55-A, AR-t)
    { key: 'f', show: 'F', does: 'FAQ', tab: 'faq' },
    { key: 'm', show: 'M', does: 'the menu', tab: 'menu' },
];
/** What a key press does: { card: index from 0 } | { esc: true } | { tab } | null. Keys with Ctrl, Alt or Meta, a held key's repeats,
 *  and keys typed into a field, do nothing (`typing`: the focus is in an input, a select or a text area). */
export function hotkeyOf(ev, typing = false) {
    if (!ev || typing || ev.repeat || ev.ctrlKey || ev.altKey || ev.metaKey) return null; // RV-A (H1-r): a held key's repeats do nothing (they passed the 400 ms tap guard and confirmed a second-tap warning)
    const k = String(ev.key || '');
    if (/^[1-9]$/.test(k)) return { card: Number(k) - 1 };
    if (k === 'Escape') return { esc: true };
    const h = HOTKEYS.find((x) => x.tab && x.key === k.toLowerCase());
    return h ? { tab: h.tab } : null;
}
