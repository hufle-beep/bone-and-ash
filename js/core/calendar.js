/**
 * v0.11.203 (owner pick T1, TS1; roadmap-time.md): the long calendar, behind a test switch ("New game: the long calendar (test)").
 * A save with `g.cal === LONG_CAL` plays every story day of a stay as a week: the wilds (Days 1–3), the village (4–6), Ashfall's
 * Fallout (8–10) and the Heart (16–18). Journeys and deadline days keep one day: the tribute (7), the Blackroot (11–15), the road
 * home (19–20) and the Elder (21). So the prologue's tribute comes on Day 43 and the Elder on Day 93. Saves without `cal` (every
 * save before this version, and every new game started with plain New game) keep the old calendar: every helper here is then the
 * identity, so the game plays exactly as before.
 *
 * Two kinds of stays:
 *  - by the calendar (Ashfall's Fallout, the Heart, the jumps between parts): the story reads `storyDay` (the old day number) in
 *    place of the calendar's day; a beat that ends a story day (the Fallout's farewell) waits for that week's last day (`lastOfWeek`).
 *  - by a counter (the wilds' `forest_day`, the village's `vday`): the counter moves once a week; the nights in between are quiet
 *    and the story's night (the forest's night events and the jackals, the arson) comes on the week's seventh night (`storyNight`).
 *    The nights already slept this story day are kept in the world flag `cal_night` (0–6).
 * No helper here imports from game.js (game.js imports this file).
 */
export const LONG_CAL = 7;
/** The story days that are stays (a week each in the long calendar). */
export const STAY_DAYS = new Set([1, 2, 3, 4, 5, 6, 8, 9, 10, 16, 17, 18]);
export const longCal = (g) => g?.cal === LONG_CAL;
const span = (g, d) => (longCal(g) && STAY_DAYS.has(d) ? LONG_CAL : 1);
const calDayOf = (minutes) => Math.floor((minutes || 0) / 1440) + 1;

/** The first calendar day of story day `d` (the old calendar: `d`). */
export function calStart(g, d) {
    if (!longCal(g)) return d;
    let c = 1;
    for (let k = 1; k < d; k++) c += span(g, k);
    return c;
}
/** The last calendar day of story day `d`. */
export const calEnd = (g, d) => calStart(g, d) + span(g, d) - 1;
/** The story day (the old day number) of calendar day `cal`; past the Elder's day, one for one. */
export function storyDayOf(g, cal) {
    if (!longCal(g)) return cal;
    let d = 1;
    while (calEnd(g, d) < cal) d++;
    return d;
}
/** The story day now. v0.11.215 (RV1, MS): inside `atStoryDay` the story day a carried work started (its result's texts and flags). */
let pinnedDay = null;
export const storyDay = (g) => (pinnedDay != null && longCal(g) ? pinnedDay : storyDayOf(g, calDayOf(g.minutes)));
/** v0.11.215 (owner pick RV1, MS): run `fn` as on story day `d` (a week's card's result, read on the day its work started). */
export function atStoryDay(d, fn) { const o = pinnedDay; pinnedDay = d; try { return fn(); } finally { pinnedDay = o; } }
/** The minute of story day `d`'s first day at `h`:`m` (the old calendar: `(d - 1) * 1440 + h * 60 + m`). */
export const calMinutes = (g, d, h = 0, m = 0) => (calStart(g, d) - 1) * 1440 + h * 60 + m;
/** Is today the last day of its story day's week (the old calendar: always)? */
export const lastOfWeek = (g) => { const c = calDayOf(g.minutes); return calEnd(g, storyDayOf(g, c)) === c; };

/* ---------- the counter stays (the wilds, the village) ---------- */

export const weekNights = (g) => (longCal(g) ? Math.max(0, Math.min(LONG_CAL - 1, g.flags?.cal_night || 0)) : 0);
/** Is tonight the story's night (the seventh of the week; the old calendar: every night)? */
export const storyNight = (g) => !longCal(g) || weekNights(g) >= LONG_CAL - 1;
/** At a counter stay's morning: true when the story day turns (the old calendar: every morning). */
export function weekMorning(g) {
    if (!longCal(g)) return true;
    const n = weekNights(g) + 1;
    if (n >= LONG_CAL) { g.flags.cal_night = 0; return true; }
    g.flags.cal_night = n;
    return false;
}
/** A counter stay begins (the village): its first story day starts with no nights slept. */
export const weekBegins = (g) => { if (longCal(g)) g.flags.cal_night = 0; };
