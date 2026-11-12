/**
 * Bone and Ash — the line picker (v0.11.134, owner pick LP2: PK; research-2.md #97, research.md #48).
 * A pool of repeating lines (again.js's memory lines today) is picked in this order: lines whose condition fails drop out;
 * then the fewest plays this Coil; then the most specific (`spec`); then a stable order from the save's seed, shuffled anew
 * for each round through the pool; never the line played last when another is open. So a pool of N lines shows every line
 * once before any comes back, and never the same line twice running.
 * A play counts once per visit: the caller (again.js) draws only when the screen is a new visit, so a redraw shows the same line.
 * The save's `lines` record (reset at every new Coil; an old save gets it on first use; an older version ignores it):
 *   { c: "act:n", p: { pool: [plays per line] }, last: { pool: index }, cur: { pool: index }, at: scene id, said: [keys] }
 * `said` (QR): the reply parts already shown this Coil (replies.js quietFilter / noteSaid).
 * v0.11.135 (owner picks NT1, EV1): `d`, the days this Coil each scene (or a scene's event, `dayKey`) was entered, in order
 * (story.js go() records them; a day runs from 05:00, RN2 H1); `byDay` gives a scene's text for the day: its first text on the first day, the next one on the next
 * day it shows, and so on (a pool in order; past the last, it starts again).
 */
import { fnv1a, clockParts } from './game.js';

/** A usable record: a plain object for this Coil. */
const isRec = (r) => !!r && typeof r === 'object' && !Array.isArray(r);
export const coilStamp = (g) => `${g?.coil?.act || 0}:${g?.coil?.n || 1}`;
/** QR: the most reply keys kept in one Coil (the bots' most: 87; a bound on the save, the oldest go first). */
export const SAID_MAX = 400;

/** The record for this Coil (a new Coil, a missing or broken record: a fresh one). */
export function linesOf(g) {
    const c = coilStamp(g);
    let L = g.lines;
    if (!isRec(L) || L.c !== c || !isRec(L.p) || !isRec(L.cur) || !isRec(L.last) || !Array.isArray(L.said)) {
        L = { c, p: {}, last: {}, cur: {}, at: isRec(L) && typeof L.at === 'string' ? L.at : null, said: [], d: {} };
        g.lines = L;
    }
    if (!isRec(L.d)) L.d = {}; // v0.11.135: a v0.11.134 record gains the day list
    return L;
}

/** A stable rank for line `i` of a pool in a round, from the save's seed. */
const rank = (g, pool, round, i) => parseInt(fnv1a(`${g.seed >>> 0}#${pool}#${coilStamp(g)}#${round}#${i}`), 16);

/**
 * Pick a line of `pool` (an array of strings or { text, when(g), spec }) and count its play. Returns its index, or -1 when
 * every line's condition fails.
 */
export function pickLine(g, pool, items) {
    const L = linesOf(g);
    const n = items.length;
    // v0.11.152 (RV1, L4; Fable's review): a pool that grew (Yuki's closers 3 → 14) keeps its counts this Coil, the new lines at 0
    const old = Array.isArray(L.p[pool]) ? L.p[pool] : [];
    const plays = old.length === n ? old : (L.p[pool] = Array.from({ length: n }, (_, i) => (Number(old[i]) > 0 ? Number(old[i]) : 0)));
    let open = [];
    for (let i = 0; i < n; i++) { const it = items[i]; if (!(it && typeof it === 'object' && typeof it.when === 'function' && !it.when(g))) open.push(i); }
    if (!open.length) return -1;
    const least = Math.min(...open.map((i) => plays[i] || 0));
    open = open.filter((i) => (plays[i] || 0) === least);
    const spec = (i) => (items[i] && typeof items[i] === 'object' ? Number(items[i].spec) || 0 : 0);
    const top = Math.max(...open.map(spec));
    open = open.filter((i) => spec(i) === top);
    if (open.length > 1 && L.last[pool] != null) open = open.filter((i) => i !== L.last[pool]);
    open.sort((a, b) => rank(g, pool, least, a) - rank(g, pool, least, b) || a - b);
    const i = open[0];
    plays[i] = (plays[i] || 0) + 1;
    L.last[pool] = i;
    return i;
}

/**
 * The line of `pool` for this visit of scene `id`: drawn on the visit's first view, the same on every redraw of that visit.
 * A visit starts when the scene shown differs from the last one shown (`at`, set by `noteVisit`).
 */
export function visitLine(g, pool, items) {
    const L = linesOf(g);
    const c = L.cur[pool];
    if (!(Number.isInteger(c) && c >= 0 && c < items.length)) L.cur[pool] = pickLine(g, pool, items); // RQ1 (L4): a hand-edited value is drawn again
    return L.cur[pool];
}
/** Note the scene on screen. Returns true when it starts a new visit (another scene was shown last); a new visit drops the
 *  last visit's picks. */
export function noteVisit(g, id) {
    const L = linesOf(g);
    const fresh = L.at !== id;
    L.at = id;
    if (fresh) L.cur = {};
    return fresh;
}

/** v0.11.135 (RN2, H1; Fable's review): a text's day runs from 05:00 (the earliest wake) to 05:00, not midnight, so a night scene
 *  entered before midnight and shown after it is still that night (the last camp no longer turned into its "next night" text). */
export const TEXT_DAY_FROM = 5 * 60;
export const textDay = (g) => clockParts((g.minutes || 0) - TEXT_DAY_FROM).day;
/** v0.11.135 (NT1, EV1): note that `key` (a scene id, or a scene's event) shows today. */
export function noteDay(g, key) {
    if (!g || !key) return;
    const L = linesOf(g);
    const d = textDay(g);
    const a = Array.isArray(L.d[key]) ? L.d[key] : (L.d[key] = []);
    if (!a.includes(d)) a.push(d);
}
/** v0.11.135: which day of this Coil `key` shows on today: 0 its first, 1 its second… (read only; a day not noted yet counts as the next). */
export function dayIndex(g, key) {
    const L = g?.lines;
    const a = isRec(L) && L.c === coilStamp(g) && isRec(L.d) && Array.isArray(L.d[key]) ? L.d[key] : [];
    const i = a.indexOf(textDay(g));
    return i >= 0 ? i : a.length;
}
/** v0.11.135: the text for today from `list` (strings or functions of g), by `key` (the scene by default); past the last, from the start again. */
export function byDay(g, list, key = g?.scene) {
    const t = list[dayIndex(g, key) % list.length];
    return typeof t === 'function' ? t(g) : t;
}

/** v0.11.154 (owner pick RV1, Fable's review, L2 CL): like byDay, but past the last text it stays on the last one instead of starting again (the Heart's
 *  lists: a stay past their last day shows the last day's text, not the first day's). */
export function byDayLast(g, list, key = g?.scene) {
    const t = list[Math.min(dayIndex(g, key), list.length - 1)];
    return typeof t === 'function' ? t(g) : t;
}

/**
 * v0.11.136 (owner pick NC1, NT1's push 2): replies by day. A story choice's or a task card's reply that came back on another day
 * of the same Coil now has a new text for each later day (Fable's), picked like a scene's text: `dayReply(key, list)` registers
 * the list (the first entry is the old reply, kept for the first day) and returns `(g) => text`, which notes the day under
 * `r:<key>` in the save's day record (`d`) and returns the text for that day (past the last, from the start again). Only the
 * reply sentences are in a list; the gains stay in the line around it. The text lint reads every list (`DAY_REPLIES`).
 */
export const DAY_REPLIES = {};
export function dayReply(key, list) {
    DAY_REPLIES[key] = list;
    const k = `r:${key}`;
    return (g) => { noteDay(g, k); return byDay(g, list, k); };
}
