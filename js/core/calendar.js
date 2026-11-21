/**
 * v0.11.203 (owner pick T1, TS1; roadmap-time.md): the long calendar, behind a test switch ("New game: the long calendar (test)").
 * A save with `g.cal === LONG_CAL` plays every story day of a stay as a week: the wilds (Days 1–3), the village (4–6), Ashfall's
 * Fallout (8–10) and the Heart (16–18). Journeys and deadline days keep one day: the tribute (7), the Blackroot (11–15), the road
 * home (19–20) and the Elder (21). So the prologue's tribute comes on Day 43 and the Elder on Day 93 (Day 103 since v0.11.222, TS9: the
 * Blackroot's five days at its camps, three days each, `blSpan`). Saves without `cal` (every
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
/** v0.11.222 (owner pick J2, TS9: MH + K3 + SV): the Blackroot's story days (11–15) at its camps, BL_SPAN days each on a long-calendar game
 *  that carries `g.calBl` (written by newGame and, for a long-calendar save from before the Blackroot, by game.js `blFill`); a save
 *  without it, or with 1 (one already in or past the Blackroot when it was loaded), keeps the 5-day road. */
export const BL_DAYS = new Set([11, 12, 13, 14, 15]);
export const BL_SPAN = 3;
export const blSpan = (g) => (longCal(g) && Number.isInteger(g?.calBl) && g.calBl > 1 ? g.calBl : 1);
const span = (g, d) => (longCal(g) && STAY_DAYS.has(d) ? LONG_CAL : BL_DAYS.has(d) ? blSpan(g) : 1);
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
/** v0.11.249 (P19-A RV, C L3): the pinned story day, or null (game.js `gainCounts`). */
export const pinnedStoryDay = () => pinnedDay;
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

/* ---------- v0.11.224 (owner pick TX2, TS6: DC) the texts' counts, from the calendar ----------
 * The lines that count days to the tribute or the Elder, or name the day, take the count from here, so they read right on both
 * calendars (the old one gives the old numbers: "Thirteen days", "Day nine") and on any later calendar. Spelled out, as the story writes them. */
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORD = { one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth', nine: 'ninth', twelve: 'twelfth' };
/** `n` in words (0–999): 59 → "fifty-nine", 103 → "a hundred and three". */
export function numWord(n) {
    n = Math.max(0, Math.round(Number(n) || 0));
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
    const h = Math.floor(n / 100), r = n % 100;
    return `${h === 1 ? 'a hundred' : `${ONES[h]} hundred`}${r ? ` and ${numWord(r)}` : ''}`;
}
/** The ordinal in words: 21 → "twenty-first", 103 → "hundred and third" (no article). */
export function ordWord(n) {
    const w = numWord(n).replace(/^a hundred/, 'hundred');
    return w.replace(/([a-z]+)$/, (last) => ORD[last] || (last.endsWith('y') ? `${last.slice(0, -1)}ieth` : `${last}th`));
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
/** "one day" / "fifty-nine days". */
export const daysWord = (n) => `${numWord(n)} ${n === 1 ? 'day' : 'days'}`;
export const DaysWord = (n) => cap(daysWord(n));
const today = (g) => calDayOf(g?.minutes);
/** The days left to the tribute (1 = tomorrow). The village is counted by its weeks (`vday`, the nights slept this story day);
 *  the short road (no `long` flag: straight to the village on the tribute's eve) has 1; before the village's first week begins, all of it. */
export function tributeLeft(g) {
    if (!g?.flags?.long) return 1;
    const s = longCal(g) ? LONG_CAL : 1;
    if (!g.flags.vday) return 3 * s;
    const v = Math.max(1, Math.min(3, g.flags.vday));
    return (3 - v) * s + (s - weekNights(g));
}
/** The days left to the Elder (Day 21 on the old calendar; 1 = tomorrow). */
export const elderLeft = (g) => calStart(g, 21) - today(g);
/** The days left to the start for the tree (story day 11's first day; 1 = tomorrow). */
export const departLeft = (g) => calStart(g, 11) - today(g);
/** The days since the start for the tree (the old calendar on the eve of the Elder: 9). */
export const sinceDepart = (g) => today(g) - calStart(g, 11);
/** "Day nine" / "Day fifty-one": today. */
export const dayWord = (g) => `Day ${numWord(today(g)).replace(/^a hundred/, 'one hundred')}`;
/** "the twenty-first day" / "the hundred and third day": the Elder's day. */
export const elderDayWord = (g) => `the ${ordWord(calStart(g, 21))} day`;
/** v0.11.224 (TX2, DC): a text's count slots filled: `{days}` / `{Days}` the days left to the story's next deadline (up to the tribute's
 *  story day the tribute, after it the Elder), `{Day}` today ("Day nine"), `{elderDay}` the Elder's day ("the twenty-first day"),
 *  `{OnElder}` Lu Han's "On the twenty-first" (the long calendar: "On the hundred and third day"; RV1 L2), `{since}` / `{Since}` the days since the start for the tree. A text without slots comes back as it is. */
export function countsFill(g, s) {
    if (typeof s !== 'string' || !s.includes('{')) return s;
    const left = storyDay(g) <= 7 ? tributeLeft(g) : elderLeft(g);
    return s.replace(/\{days\}/g, daysWord(left)).replace(/\{Days\}/g, DaysWord(left)).replace(/\{Day\}/g, dayWord(g))
        .replace(/\{elderDay\}/g, elderDayWord(g)).replace(/\{OnElder\}/g, longCal(g) ? `On ${elderDayWord(g)}` : `On the ${ordWord(calStart(g, 21))}`)
        .replace(/\{since\}/g, daysWord(sinceDepart(g))).replace(/\{Since\}/g, DaysWord(sinceDepart(g)));
}
/** RV1 (MC): "Twenty-Two" for a title. */
export const titleCase = (s) => String(s).replace(/(^|[\s-])([a-z])/g, (_, a, b) => a + b.toUpperCase()).replace(/ And /g, ' and ');
/** RV1 (MC): today as a screen title: "Day Fifty-One". */
export const dayTitle = (g) => titleCase(dayWord(g));
/** RV1 (VK): the numbers in words the counts above write, set aside (as "#") where a text's own numbers must not make it new: the
 *  later-day fold's key (again.js) and the planned week's night fold (week.js). */
export const NUM_WORDS = /\b(?:(?:(?:a|one) hundred(?: and)? )?(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-(?:one|two|three|four|five|six|seven|eight|nine))?|(?:(?:a|one) hundred(?: and)? )?(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)|(?:a|one) hundred)\b/gi;
