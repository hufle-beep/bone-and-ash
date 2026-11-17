/**
 * v0.11.204 (owner pick W1; roadmap-time.md TS2 + TS3): the week on the long calendar. Pure, no DOM. Long calendar only: on the old
 * calendar nothing here runs (every entry point checks `longCal` / `weekHub` first).
 *
 *  - R3, the quiet nights (`foldNight`): on a stay, a night or morning screen with one plain choice whose text is the one it showed
 *    on an earlier night of this Coil (its numbers aside) is walked at once (with `choose`, exactly as a tap would take it). A screen with a real choice,
 *    a check, a fight, or a text not shown before (an event night) stops the walk and is shown. The text last shown per screen is
 *    kept in `g.tasks.nf` (scene → hash; a rewind starts it over).
 *  - P1, the week planner (`runWeek`): on a stay hub, the week's cards (S1's ×7 cards, by count) and the Meditate cards (by count a
 *    day) run day by day, with the day's routine (R1 + R2, tasks.js) and the quiet nights between. It stops for: a story stop it
 *    can't take alone (two or more ways on in the evening, or a night with a choice: `evening`, the plan keeps running after it), a
 *    story beat or a door (`story`), HP under 60% (`hurt`), Fed under 30 with no food (`hungry`), a breakthrough ready (`breakthrough`,
 *    once a realm; Yuki's new forms come only after one), the week's end (`week`, the plan is done), nothing it can do (`stuck`).
 *    The plan is `g.tasks.plan`: { hub, coil, lastDay, items: { cardId: count }, med: { sit, mer, qi } a day, done: { d, sit, mer, qi },
 *    running, stop, bt }.
 */
import { longCal, storyDay, storyDayOf, calEnd, weekNights, LONG_CAL, STAY_DAYS } from './calendar.js';
import { sceneView, choose } from './story.js';
import { advance, jamesHpMax, canBreakThrough, clockParts, clockLabel, fnv1a, takeSpoilNotes, wakeDay } from './game.js';
import { taskCards, taskOpen, runTask, taskState, taskOutcome, isTaskChoice, sitTaskId, QI_TASK, carryHere, carriesHere, carriesRead, carryTaskId, isCarryTask, weekHub, workDay, workRoom, dayMeal, cardSpeed, NEW_LENGTH, WEEK_MULT } from './tasks.js';
import { farewellNow } from '../story/act1_fallout.js'; // RV1 (L4)
import { foodCount, preservable, unspaced, spacedNext, SPACE_DAYS } from '../story/common.js'; // v0.11.213 (FQ1, S3): the spacing
import { EVENING_HOUR } from '../story/oneoff.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { unreadLines } from '../story/again.js'; // v0.11.214 (owner pick RD1): the lines never shown in this game

/** The night and morning screens of the stays that fold (the suppers and the camp's night keep their choices, so they never do). */
export const FOLD_SCENES = new Set(['village_night', 'village_morning', 'fo_night', 'fo_morning', 'morning', 'heart_night', 'heart_morning']);
/** The evening and night screens between a stay hub's evening and its next morning: a stop there keeps the plan running. */
export const NIGHT_SCENES = new Set(['camp', 'night', 'supper', 'supper_roof', 'village_night', 'village_morning', 'fo_supper', 'fo_night', 'fo_morning', 'morning', 'heart_camp', 'heart_night', 'heart_morning', 'mei_walk']);
const META = /^(Yuki: change form|Story Mode only)/;
export const STOP_TEXT = {
    evening: 'the evening has a choice', story: 'the story needs you', hurt: 'HP is under 60%', hungry: 'Fed is under 30 and there is no food',
    breakthrough: 'a breakthrough is ready', week: 'the week is over', stuck: 'nothing left it can do here', left: 'the story moved on',
    read: 'a card with text you have not read yet', // v0.11.214 (owner pick RD1, RB): tap it yourself, then run the week again
    door: 'a talk has a choice', // v0.11.210 (owner pick N1, DC-a): a daily door's scene with a real choice; the plan goes on after it
};
/** v0.11.210 (owner pick N1, DC-a): the daily door cards the plan can take once a day after the day's work (Yuki's sit, Old Wen's and
 *  Mei Lin's mother's visits, Mei Lin's and Ya's talks on the Fallout). Yuki's row starts at 1 on a new plan, the others at 0.
 *  RV1 (M2): taken in this order, the two-hour talks last, so the visits (closed from 19:00, HT_UNTIL) get the hours after a work day. */
export const DAILY_DOORS = ['yk_time', 'wen_time', 'mother_time', 'fo_mei', 'fo_ya_time'];
export const DOOR_START = { yk_time: 1 };
/** v0.11.213 (owner pick VQ1 + FQ1, 2026-11-17 15:31 / 15:35; his 15:19 report: "not all the around the village options are in the
 *  queuable list"): every door card of a stay hub has a plan row: the daily doors above, then WL Old Wen's lesson, FH the far hunt and
 *  ST the one-off doors (the village's, the Fallout's, the Heart's), the two talks last (RV1, M2). `REPEAT` the ones that come back
 *  (every SPACE_DAYS-th day on a stay, common.js S3), the rest once (a row taken is set back to 0). Each with the daily key its card
 *  is spaced by (`spacedNext`); `heart_spring` by the calendar day. */
export const PLAN_DOORS = [...DAILY_DOORS.slice(0, 3), 'wen_lesson', 'far_hunt', 'herb_slopes', 'heal', 'village_hunt', 'scout', 'pot_cook', 'fo_mother', 'fo_spy', 'fo_pot_cook', 'hall_listen', 'ring_chambers', 'heart_spring', ...DAILY_DOORS.slice(3)]; // the owner 16:42: the communal pot's cooking too (once a Coil)
export const DOOR_KEY = { yk_time: 'yk_time', wen_time: 'wen_time', mother_time: 'mother_time', wen_lesson: 'wen', far_hunt: 'far', herb_slopes: 'slopes', heart_spring: 'spring', fo_mei: 'a1_mei', fo_ya_time: 'a1_ya' };
export const doorRepeats = (s) => s in DOOR_KEY;
/** v0.11.213 (VQ1, RS): "Rest an hour" on each stay hub, by the day (a count, as the sits). */
export const REST_LABEL = /^Rest\b/;
/** RV1 (L2, the owner 12:39): the day's line before a talk's choice the plan took as last time. */
export const AGAIN_LINE = 'As before: ';
/* ---------- v0.11.214 (owner pick RD1: RU + RB, 2026-11-17 16:54; the owner 16:42: "if a card or it's result haven't been read yet
 * in the game, it should stop to be read. Effectively making the first runs manual  that's by design.") ----------
 * Before each card or door the plan takes, the step is run on a copy (`readProbe`: one step of runWeek itself, so its lines are the
 * real step's): a line of the card's text or result, or of a door's screens walked, never shown on screen in this game (again.js
 * RU, its numbers aside) stops the plan before it (`read`; `p.read` the card to tap). The player taps it, reads it, and runs the
 * week again; the forecast stops there too. Not checked: the day's routine before a card (the meals, the day's sit: `pre`), a card
 * the routine left no time for, the plan's own "As before: " line (a label shown when it was picked). `READ_STOP.on`: the tests
 * from before v0.11.214 pin the plan without it. */
export const READ_STOP = { on: true };
/** A copy for the probe: the save without its journal and its read record (neither changes a step), the Coil's snapshot shared. */
function probeClone(g) {
    const { log, read, coil, ...rest } = g;
    const c = JSON.parse(JSON.stringify(rest));
    c.log = [];
    if (coil) { const { snap, ...cr } = coil; c.coil = JSON.parse(JSON.stringify(cr)); if (snap !== undefined) c.coil.snap = snap; }
    return c;
}
/** RD1 (RB): the plan's next step on a copy: { id: the card it runs, lines: those never shown } when it has such lines, else null. */
export function readProbe(g, scenes) {
    const c = probeClone(g);
    let first = null;
    const r = runWeek(c, scenes, { max: 1, probe: false, onStep: (cg, l) => { if (l && !first) first = l; } });
    if (!first || first.r?.skipped) return null;
    const all = r.days.flatMap((d) => d.lines).slice(first.r?.pre || 0).filter((l) => !String(l).startsWith(AGAIN_LINE));
    const lines = unreadLines(g, all);
    return lines.length ? { id: first.id, key: first.key, lines } : null;
}
/** RD1 (RB): the card the plan stopped for, tapped by hand (main.js doTask, after runTask): it counts as the plan's step, so the
 *  plan doesn't take it again (a card one fewer, the day's Meditate, Smoke or Rest row one more done, a door done today, a one-off's
 *  row back to 0). Any other tap leaves the plan as it is. */
export function noteReadTap(g, scenes, id, r = null) {
    const p = planHere(g);
    if (!p || !p.read || p.read !== id || r?.skipped) return; // RV1 (L1): the day's routine went first (not run): the stop stays for the next tap
    const k = p.readKey;
    delete p.read; delete p.readKey;
    if (p.stop === 'read') p.stop = ''; // RV1 (L4): no stale "Stopped: …" line for a card now read
    if (typeof k !== 'string' || isCarryTask(id)) return; // the week's work carried keeps its own count
    const d = workDay(g), grp = keyGroup(k);
    if (!isRec(p.done) || p.done.d !== d) p.done = { d, sit: 0, mer: 0, qi: 0, pres: 0, rest: 0, doors: {} };
    if (!isRec(p.done.doors)) p.done.doors = {};
    if (grp === 'card') { if (p.items?.[k] > 0) { p.items[k] -= 1; if (p.items[k] <= 0) delete p.items[k]; } return; }
    if (grp === 'door') { const s = k.slice(5); p.done.doors[s] = (p.done.doors[s] || 0) + 1; if (!doorRepeats(s) && isRec(p.doors)) p.doors[s] = 0; return; }
    p.done[grp] = (p.done[grp] || 0) + 1; // sit, mer, qi, pres, rest
}
/** The stops after which the plan keeps running (it goes on by itself once the story is back on the hub). */
const GOES_ON = new Set(['evening', 'door']);
const hash = (t) => fnv1a(String(t || '').replace(/\d+/g, '#')); // the day's numbers ("Day 45. 48 days to the Elder.") don't make a night new
const calDay = (g) => Math.floor((g.minutes || 0) / 1440) + 1;
const hourNow = (g) => clockParts(g.minutes).hh;
const coilKey = (g) => `${g.coil?.n || 1}|${g.coil?.act || 0}`;
const plainChoice = (c) => !!c && !c.check && !c.combat && !c.fail && !c.qi;
/** v0.11.213 (VQ1, W1): a door's one way on that the plan walks: a plain one, or one with a check (rolled as a tap would), never a fight. */
const walkChoice = (c) => plainChoice(c) || (!!c && !!c.check && !c.combat);
const isRec = (o) => !!o && typeof o === 'object' && !Array.isArray(o);

/** R3: walk the quiet night's screens shown before. Returns { steps, lines }. */
export function foldNight(g, scenes, max = 12) {
    const lines = [];
    let steps = 0;
    if (!longCal(g)) return { steps, lines };
    const t = taskState(g);
    if (!isRec(t.nf)) t.nf = {};
    for (; steps < max; steps++) {
        if (g.combat || !FOLD_SCENES.has(g.scene) || !scenes[g.scene] || !STAY_DAYS.has(storyDay(g))) break; // RV1 (L3): a stay's nights only
        const v = sceneView(g, scenes);
        if (v.end) break;
        const open = v.choices.filter((c) => !c.disabled && !META.test(String(c.label)));
        const h = hash(v.text);
        const ok = open.length === 1 && open[0].index < 1000 && plainChoice(scenes[g.scene].choices[open[0].index]) && t.nf[g.scene] === h;
        if (!ok) { t.nf[g.scene] = h; break; }
        const from = g.scene;
        const r = choose(g, scenes, open[0].index);
        lines.push(...(r.lines || []));
        if (r.combat || g.scene === from) { steps++; break; }
    }
    return { steps, lines };
}

/* ---------- P1: the week planner ---------- */

/** The cards the planner can count here: the week's cards (tasks.js S1) open, busy or over for today. */
export function planCards(g, scenes) {
    if (!weekHub(g)) return [];
    return taskCards(g, scenes).filter((c) => c.week);
}
/** The calendar's last waking day of this story day's week (a counter stay: 7 nights from its start). */
export function weekLastDay(g) {
    const wd = workDay(g); // RV1 (L7): the waking day throughout (a plan made between 00:00 and 03:59 belongs to the evening before)
    if (g.scene === 'wilds' || g.scene === 'ashfall') return wd + Math.max(1, LONG_CAL - weekNights(g)) - 1;
    return Math.max(wd, calEnd(g, storyDayOf(g, wd + 1)) - 1);
}
/** The plan for this stay's week, or null (a plan from another hub, Coil or week is dropped). */
export function planHere(g) {
    const p = g.tasks?.plan;
    if (!isRec(p)) return null;
    if (!weekHub(g) || p.hub !== g.scene || p.coil !== coilKey(g) || workDay(g) > p.lastDay) return null;
    return p;
}
/** The plan here, made empty if there is none. */
export function planEnsure(g) {
    const p = planHere(g);
    if (p) return p;
    if (!weekHub(g)) return null;
    const t = taskState(g);
    t.plan = { hub: g.scene, coil: coilKey(g), lastDay: weekLastDay(g), items: {}, med: { sit: 0, mer: 0, qi: 0, pres: 0, rest: 0 }, doors: { ...DOOR_START }, done: { d: -1, sit: 0, mer: 0, qi: 0, pres: 0, rest: 0, doors: {} }, running: false, stop: '', bt: -1 };
    return t.plan;
}
export const MED_MAX = { sit: 12, mer: 6, qi: 8, pres: 1, rest: 12 }; // v0.11.213 (VQ1, RS): hours of rest a day, as the sits // v0.11.209 (owner pick TF1, K): "Smoke the catch." by the day (0 or 1)
/** Change a count (`key`: a card id, 'med:sit' / 'med:mer' / 'med:qi' / 'med:pres', or 'door:<scene>' of DAILY_DOORS), from 0 up to
 *  9 cards, MED_MAX a day, or 0 / 1 a day for a door. */
export function planSet(g, key, n) {
    const p = planEnsure(g);
    if (!p) return null;
    const m = /^med:(sit|mer|qi|pres|rest)$/.exec(key), dm = /^door:(\w+)$/.exec(key);
    if (m) p.med[m[1]] = Math.max(0, Math.min(MED_MAX[m[1]], Math.round(n) || 0));
    else if (dm) { if (!PLAN_DOORS.includes(dm[1])) return p; if (!isRec(p.doors)) p.doors = {}; p.doors[dm[1]] = Math.max(0, Math.min(1, Math.round(n) || 0)); }
    else { const v = Math.max(0, Math.min(9, Math.round(n) || 0)); if (v) p.items[key] = v; else delete p.items[key]; }
    p.stop = '';
    return p;
}
/** Clear: every count to 0, the plan stopped (RV1, TG11: here, so the tests can run it). */
export function planClear(g) { const p = planHere(g); if (!p) return null; p.items = {}; p.med = { sit: 0, mer: 0, qi: 0, pres: 0, rest: 0 }; p.doors = {}; p.stop = ''; p.running = false; return p; }
/** v0.11.210 (DC-a): a plan row's count now (a card, a Meditate row, a door; with no plan the new plan's start). */
export function planCount(g, key) {
    const p = planHere(g);
    if (/^med:/.test(key)) return p?.med?.[key.slice(4)] || 0;
    if (/^door:/.test(key)) { const s = key.slice(5); return p ? (isRec(p.doors) ? p.doors[s] || 0 : 0) : DOOR_START[s] || 0; }
    return p?.items?.[key] || 0;
}
/* ---------- v0.11.211 (owner pick PR2 + PK1, 2026-11-17 13:38 and 13:43): the plan's priorities ----------
 * Every row of Plan the week (a card, a Meditate row, Smoke the catch, a door or talk) has a place, 1 first, set with a drop-down by
 * its label. The plan takes the first row in that order that is due and open now, step by step (a card carried takes its card's
 * place). The places are kept per hub for good (`g.tasks.prio[hub]`: row key → place; a rewind keeps them, coil.js), so a new week or
 * a new Coil keeps the order. A row with no place yet (none set on this hub, or new since: a card or a person met later) takes the
 * old order's place after every set one: the cards carried and in the order set, Smoke the catch, the doors (DAILY_DOORS), the sits,
 * the meridian sessions, Gather Qi. With no places set the plan runs exactly as before. */
const PRIO_AT = { pres: 200, door: 300, sit: 400, mer: 500, qi: 600, rest: 700 }; // v0.11.213 (VQ1, RS): Rest an hour last
const keyGroup = (k) => (k.startsWith('door:') ? 'door' : k === 'med:pres' ? 'pres' : /^med:/.test(k) ? k.slice(4) : 'card'); // med:rest → 'rest' (v0.11.213)
/** This hub's places ({ key: place }), or {} (with `make`, created). */
export function prioHere(g, hub = g.scene, make = false) {
    const t = make ? taskState(g) : g.tasks;
    if (!t) return {};
    if (!isRec(t.prio)) { if (!make) return {}; t.prio = {}; }
    if (!isRec(t.prio[hub])) { if (!make) return {}; t.prio[hub] = {}; }
    return t.prio[hub];
}
/** A row's place in the old order (a row with no place set): the work carried, the cards set (in the order set), the cards not set,
 *  Smoke the catch, the doors, the sits, the meridian sessions, Gather Qi. */
function oldPlace(p, k, cards, cys) {
    const grp = keyGroup(k);
    if (grp === 'door') return PRIO_AT.door + Math.max(0, PLAN_DOORS.indexOf(k.slice(5)));
    if (grp !== 'card') return PRIO_AT[grp];
    const set = Object.keys(p?.items || {}).filter((id) => p.items[id] > 0), i = set.indexOf(k);
    if (i >= 0) return 100 + i / 100;
    if (cys.has(k)) return 99;
    const j = cards.indexOf(k);
    return 150 + (j >= 0 ? j / 100 : 0.99);
}
/** The rows in the plan's order: { keys: every row the plan can take or shows, shown: the rows on the screen }. `cards` (the card
 *  rows' ids) and `doors` (the door rows' scenes) only for the screen; the run passes none (it takes the rows with a count). */
export function planOrder(g, p = planHere(g), { cards = [], doors = [], extra = [] } = {}) {
    const hub = p?.hub || g.scene, pr = prioHere(g, hub), cys = new Set(carriesHere(g, hub).map((cy) => cy.id)); // v0.11.215 (CF1, UB): each card's work carried
    const shown = [...cards, 'med:sit', 'med:mer', 'med:qi', 'med:pres', 'med:rest', ...doors.map((s) => `door:${s}`)];
    const all = new Set(shown);
    for (const id of Object.keys(p?.items || {})) if (p.items[id] > 0) all.add(id);
    for (const [s, n] of Object.entries(isRec(p?.doors) ? p.doors : {})) if (n > 0 && PLAN_DOORS.includes(s)) all.add(`door:${s}`);
    for (const k of cys) all.add(k);
    for (const k of extra) all.add(k);
    const old = (k) => oldPlace(p, k, cards, cys);
    // RV1 (H1): the work carried with no place set goes first, as before v0.11.211 (a once-a-Coil card's row is gone after its first run)
    const at = (k) => (Number.isFinite(pr[k]) ? pr[k] : cys.has(k) ? 0 : old(k));
    const keys = [...all].sort((a, b) => at(a) - at(b) || old(a) - old(b));
    const on = new Set(shown);
    return { keys, shown: keys.filter((k) => on.has(k)) };
}
/** The screen's rows with their places ({ key: 1… }) and how many there are. */
export function planRanks(g, scenes) {
    const p = planHere(g);
    const { shown } = planOrder(g, p, { cards: planCards(g, scenes).map((c) => c.id), doors: doorCards(g, scenes).map((d) => d.scene) });
    return { rank: Object.fromEntries(shown.map((k, i) => [k, i + 1])), n: shown.length };
}
/** Move a row to place `n` (1 first) among the screen's rows; the rows on the screen and the rows hidden now that have a place are then
 *  numbered 1… on this hub in that order (RV1, L1: a hidden row keeps its place among the others), kept for good. */
export function planPrio(g, scenes, key, n) {
    if (!weekHub(g)) return null;
    const p = planHere(g), pr0 = prioHere(g);
    const cards = planCards(g, scenes).map((c) => c.id), doors = doorCards(g, scenes).map((d) => d.scene);
    const { keys, shown } = planOrder(g, p, { cards, doors, extra: Object.keys(pr0) });
    if (!shown.includes(key)) return null;
    const on = new Set(shown);
    const list = keys.filter((k) => k !== key && (on.has(k) || Number.isFinite(pr0[k])));
    const rest = list.filter((k) => on.has(k));
    const i = Math.max(0, Math.min(rest.length, (Math.round(n) || 1) - 1));
    list.splice(i < rest.length ? list.indexOf(rest[i]) : list.indexOf(rest[rest.length - 1]) + 1, 0, key);
    const pr = prioHere(g, g.scene, true);
    list.forEach((k, j) => { pr[k] = j + 1; });
    if (p) p.stop = '';
    return pr;
}
/** After a story choice: should the plan go on by itself here? A running plan on its hub, or (RV1, L1) a running plan whose week has
 *  just ended (runWeek then reports the week's end). */
export function weekResume(g) {
    if (!longCal(g) || g.combat) return false;
    const p = g.tasks?.plan;
    return isRec(p) && !!p.running && p.hub === g.scene && p.coil === coilKey(g);
}
export const planEmpty = (p) => !p || (!Object.values(p.items || {}).some((n) => n > 0) && !Object.values(p.med || {}).some((n) => n > 0));
/** The plan's last waking day as a calendar day (for the button). */
export const planEndDay = (g, p) => (p ? p.lastDay : weekLastDay(g)) + 1;

/** The story stops on the hub (not its cards), without the meta ones. */
function hubStops(g, scenes) {
    const v = sceneView(g, scenes);
    return v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(scenes, g.scene, c.index)) && !META.test(String(c.label)));
}
/** v0.11.210 (DC-a): the hub's door rows: [{ id, scene, label, status, repeat, next }], `status` 'open' when its card is on the hub
 *  now. A row shows when its card is open, when the plan counts it, when the plan took it today, and always for Yuki's (she is always
 *  there): a person not met yet, or not here yet (Ya), has no row. v0.11.213 (VQ1): every door of PLAN_DOORS; a repeating door
 *  closed only by its spacing (S3) keeps its row, `next` the calendar day it opens again; one row a scene (the spring's two ways in). */
export function doorCards(g, scenes) {
    if (!weekHub(g) || !scenes[g.scene]) return [];
    const p = planHere(g), open = new Map(taskCards(g, scenes).filter((c) => c.kind === 'door').map((c) => [c.id, c]));
    const by = new Map();
    scenes[g.scene].choices.forEach((c, i) => {
        if (typeof c.to !== 'string' || !PLAN_DOORS.includes(c.to)) return;
        const id = `${g.scene}:${i}`, card = open.get(id), rep = doorRepeats(c.to);
        let spaced = false;
        if (!card && rep && c.to !== 'yk_time') { try { spaced = !!unspaced(() => !c.show || c.show(g)); } catch { spaced = false; } }
        const keep = !!card || spaced || c.to === 'yk_time' || (p?.doors?.[c.to] || 0) > 0 || (p?.done?.d === workDay(g) && (p.done.doors?.[c.to] || 0) > 0);
        if (!keep) return;
        const rank = card ? 2 : spaced ? 1 : 0; // one row a scene (RV1, L1): the open way in, else the one closed only by its spacing
        if (by.has(c.to) && by.get(c.to).rank >= rank) return;
        let label = card?.label;
        if (!label) { try { label = typeof c.text === 'function' ? c.text(g) : c.text; } catch { label = ''; } }
        const k = DOOR_KEY[c.to], cal = k === 'spring' ? calDay(g) : null;
        const nx = rep && !card ? (cal != null ? spacedNext(g, k, cal) : spacedNext(g, k, wakeDay(g)) - wakeDay(g) + calDay(g)) : null;
        by.set(c.to, { id, scene: c.to, label: String(label || ''), status: card?.status === 'open' ? 'open' : 'closed', repeat: rep, next: nx != null && nx > calDay(g) ? nx : null, rank });
    });
    return [...by.values()].map(({ rank, ...d }) => d).sort((a, b) => PLAN_DOORS.indexOf(a.scene) - PLAN_DOORS.indexOf(b.scene)); // RV1 (M2): the talks last
}
/** v0.11.213 (RV1, L3): a door card tapped by hand (main.js doTask, before runTask): a one-off's plan row back to 0, as the plan does. */
export function noteCardTap(g, scenes, id) {
    const p = planHere(g);
    if (!p || !isRec(p.doors) || typeof id !== 'string' || !scenes[g.scene]) return;
    const m = /^([\w]+):(\d+)$/.exec(id);
    const c = m && m[1] === g.scene ? scenes[g.scene].choices[Number(m[2])] : null;
    if (c && typeof c.to === 'string' && PLAN_DOORS.includes(c.to) && !doorRepeats(c.to) && p.doors[c.to] > 0) p.doors[c.to] = 0;
}
/** v0.11.213 (VQ1 + FQ1): a door row's note: a repeating door's spacing (and the day it opens again, closed now), a one-off's "once". */
export const doorNote = (d) => (d.repeat ? `every ${SPACE_DAYS === 3 ? '3rd' : `${SPACE_DAYS}th`} day${d.next ? `, opens Day ${d.next}` : ''}` : 'once');
/** v0.11.213 (VQ1, RS): the hub's "Rest an hour" card when it is open now, or null. */
export const restCard = (g, scenes) => taskCards(g, scenes).find((c) => c.kind === 'chore' && REST_LABEL.test(String(c.label)) && c.status === 'open')?.id || null;
const firstMer = (g, scenes) => taskCards(g, scenes).find((c) => c.kind === 'mer' && c.status === 'open')?.id || null;
/** v0.11.209 (TF1, K): the hub's "Smoke the catch." card when it is open now, or null. */
export const presCard = (g, scenes) => taskCards(g, scenes).find((c) => c.pres && c.status === 'open')?.id || null;

/**
 * Run the plan from here until a stop. Returns { stop, days: [{ day, lines }], steps }. `max`: a guard on the steps.
 * Every card is run with runTask and every story choice with choose, exactly as a tap would take them.
 */
export function runWeek(g, scenes, { max = 600, onStep = null, probe = true } = {}) {
    const days = [];
    let cur = null;
    const say = (ls) => { if (!ls || !ls.length) return; const d = calDay(g); if (!cur || cur.day !== d) { cur = { day: d, lines: [] }; days.push(cur); } cur.lines.push(...ls); };
    let p = planHere(g);
    if (!p) { const t = taskState(g); if (isRec(t.plan) && t.plan.hub === g.scene && t.plan.coil === coilKey(g)) { t.plan.running = false; t.plan.stop = 'week'; return { stop: 'week', days, steps: 0 }; } return { stop: 'left', days, steps: 0 }; }
    const hub = p.hub;
    p.running = true; p.stop = ''; delete p.read; delete p.readKey;
    // FC1 (RV1, H1): the forecast's watch, called at each step's start (after the last step's bookkeeping: a card the day's
    // routine left no time for is owed again by then) and at the stop, with the last card run and its result
    let last = null;
    const watch = () => { if (onStep) onStep(g, last); last = null; };
    const end = (stop) => { watch(); if (p) { p.stop = stop; if (!GOES_ON.has(stop)) p.running = false; } return { stop, days, steps }; };
    let steps = 0;
    for (; steps < max; steps++) {
        watch();
        const m0 = g.minutes, s0 = g.scene;
        if (g.combat) return end('story');
        if (g.scene !== hub) {
            const f = foldNight(g, scenes); say(f.lines);
            if (g.scene === hub) continue;
            if (TASK_HUBS[g.scene] && NIGHT_SCENES.has(g.scene)) { // the camp: its one way on to the night, as on the hub in the evening
                const st = hubStops(g, scenes);
                if (st.length === 1 && !scenes[g.scene].choices[st[0].index]?.combat) { const r = choose(g, scenes, st[0].index); say(r.lines || []); if (r.combat) return end('story'); if (g.scene !== s0 || g.minutes !== m0) continue; }
            }
            return end(NIGHT_SCENES.has(g.scene) ? 'evening' : 'story');
        }
        p = planHere(g);
        if (!p) { const t = taskState(g); if (isRec(t.plan) && t.plan.hub === hub) { t.plan.running = false; t.plan.stop = 'week'; } watch(); return { stop: 'week', days, steps }; }
        if (g.james.hp < 0.6 * jamesHpMax(g)) return end('hurt');
        if (g.james.satiety < 30 && foodCount(g) === 0) return end('hungry');
        if (canBreakThrough(g) && p.bt !== g.james.realm) { p.bt = g.james.realm; return end('breakthrough'); }
        const d = workDay(g);
        if (p.done.d !== d) p.done = { d, sit: 0, mer: 0, qi: 0, pres: 0, rest: 0, doors: {} };
        if (!isRec(p.done.doors)) p.done.doors = {}; // a plan from before v0.11.210
        // RV1 (M3): the forecast's death check, as a tap's ("Starves here"): stop before a card that would end the Coil
        const deadly = (id) => { try { return taskOutcome(g, scenes, id)?.death || null; } catch { return null; } };
        let rowKey = null; // RD1 (RB): the row being taken (the probe's `key`)
        const run = (id) => { const r = runTask(g, scenes, id); say(r.lines); last = { id, r, key: rowKey }; return r; }; // FC1 (RV1, H1): seen by the next watch
        const done1 = () => (g.scene !== hub ? 'story' : 'next');
        let dc = null; const doorsNow = () => (dc ||= doorCards(g, scenes));
        /** One row's step now: 'next' (it ran: the next step), a stop, or null (not due or not open now: the next row). */
        const rowStep = (k) => {
            const grp = keyGroup(k);
            if (grp === 'card') {
                // the week's work carried, in its card's place (RV: before v0.11.211 always first)
                const cy = carryHere(g, hub, k); // v0.11.215 (CF1, UB): this card's own work carried
                if (cy && cy.id === k) {
                    const cid = carryTaskId(k);
                    if (!taskOpen(g, scenes, cid)) return null;
                    const dz = deadly(cid); if (dz) return dz === 'hunger' ? 'hungry' : 'hurt';
                    const r = run(cid); if (g.scene !== hub) return 'story'; if (r.skipped && g.minutes === m0) return 'stuck'; return 'next';
                }
                if (!(p.items[k] > 0) || !taskOpen(g, scenes, k)) return null;
                const dz = deadly(k); if (dz) return dz === 'hunger' ? 'hungry' : 'hurt';
                p.items[k] -= 1; if (p.items[k] <= 0) delete p.items[k];
                const r = run(k);
                if (r.skipped) p.items[k] = (p.items[k] || 0) + 1; // the day's routine went first; the card is still owed
                if (r.stopped || g.scene !== hub) return 'story';
                return 'next';
            }
            if (grp === 'pres') { // v0.11.209 (owner pick TF1, K): the day's catch smoked (a plan from before has no `pres`: 0)
                const pid = (p.done.pres || 0) < (p.med.pres || 0) ? presCard(g, scenes) : null;
                if (pid && !deadly(pid)) { p.done.pres = (p.done.pres || 0) + 1; run(pid); return done1(); }
                if ((p.done.pres || 0) < (p.med.pres || 0) && preservable(g) === 0) p.done.pres = p.med.pres; // RV1 (L7): nothing to smoke: the day's row is done
                return null;
            }
            if (grp === 'door') { // v0.11.210 (owner pick N1, DC-a): a daily door, once a day: the scene's text said, its one plain way
                // on walked ("Go on."), a real choice (her question, Mei Lin's or Ya's talk) a stop the plan goes on after
                const s = k.slice(5);
                if (!isRec(p.doors) || !((p.doors[s] || 0) > (p.done.doors[s] || 0))) return null;
                const dw = doorsNow().find((c) => c.scene === s && c.status === 'open');
                if (!dw || deadly(dw.id)) return null;
                p.done.doors[s] = (p.done.doors[s] || 0) + 1;
                const r = run(dw.id);
                if (r.skipped) { p.done.doors[s] -= 1; return 'next'; } // the day's routine went first; the door is still owed today
                if (!doorRepeats(s)) p.doors[s] = 0; // v0.11.213 (VQ1, ST): a one-off door, taken: its row back to 0
                if (g.scene === hub) return 'next'; // nothing opened (a guard): counted as done today
                for (let k2 = 0; k2 < 6 && g.scene !== hub && !g.combat; k2++) {
                    const v = sceneView(g, scenes);
                    if (v.end) return 'story';
                    const open = v.choices.filter((c) => !c.disabled && !META.test(String(c.label)));
                    const plain = open.length === 1 && open[0].index < 1000 && walkChoice(scenes[g.scene].choices[open[0].index]); // v0.11.213 (VQ1, W1): a check too
                    const again = plain ? null : doorPick(g, scenes); // RV1 (L2, the owner 12:39): a talk answered as last time, the same options
                    if (!plain && again == null) return 'door'; // the first time, or a new option: the player's; the screen shows its own text
                    say([String(v.text || '')].filter(Boolean)); // RV1 (L3): a screen's text said only when the plan walks past it
                    if (!plain) say([`${AGAIN_LINE}${open.find((c) => c.index === again).label}`]);
                    const r2 = choose(g, scenes, plain ? open[0].index : again); say(r2.lines || []);
                    if (r2.combat) return 'story';
                }
                return g.scene !== hub || g.combat ? 'story' : 'next';
            }
            // the day's meditation
            if (grp === 'sit') { const sid = sitTaskId(g, scenes); if (p.done.sit < p.med.sit && taskOpen(g, scenes, sid) && !deadly(sid)) { p.done.sit++; run(sid); return done1(); } return null; }
            if (grp === 'mer') { const mer = p.done.mer < p.med.mer ? firstMer(g, scenes) : null; if (mer && !deadly(mer)) { p.done.mer++; run(mer); return done1(); } return null; }
            if (grp === 'qi') { if (p.done.qi < p.med.qi && taskOpen(g, scenes, QI_TASK) && !deadly(QI_TASK)) { p.done.qi++; run(QI_TASK); return done1(); } return null; }
            if (grp === 'rest') { const rid = (p.done.rest || 0) < (p.med.rest || 0) ? restCard(g, scenes) : null; if (rid && !deadly(rid)) { p.done.rest = (p.done.rest || 0) + 1; run(rid); return done1(); } return null; } // v0.11.213 (VQ1, RS)
            return null;
        };
        // v0.11.214 (owner pick RD1, RB): the next card or door with a line not read yet: stop before it
        if (probe && READ_STOP.on) { const u = readProbe(g, scenes); if (u) { p.read = u.id; p.readKey = u.key; return end('read'); } }
        // v0.11.211 (owner pick PR2 + PK1): the rows in the hub's order, the first one due and open now
        let did = null;
        for (const k of planOrder(g, p).keys) { rowKey = k; did = rowStep(k); if (did) break; }
        if (did === 'next') continue;
        if (did) return end(did);
        // the day's end: the rest of the day off, then the evening's one way on
        const ev = EVENING_HOUR[hub] ?? 16;
        // RV1 (M2): the day off has its meals too: the rest of the day in steps to the next part of the day (11:00, 15:00), a meal at each
        if (hourNow(g) >= 4 && hourNow(g) < ev) {
            const mins = workRoom(g, hub);
            if (mins > 0) {
                say(dayMeal(g, hub));
                const hh = hourNow(g), next = hh < 11 ? 11 : hh < 15 ? 15 : ev;
                const step = Math.min(mins, Math.max(1, (Math.min(next, ev) - hh) * 60 - clockParts(g.minutes).mm));
                advance(g, step, { resting: true });
                if (!cur?.lines?.includes('The rest of the day off.')) say(['The rest of the day off.']);
                say(takeSpoilNotes(g)); // RV1 (M1): the food that turned in the day off
                continue;
            }
        }
        say(dayMeal(g, hub)); say(takeSpoilNotes(g)); // the evening's meal before the evening (RV1, M1: and what turned)
        const stops = hubStops(g, scenes);
        if (stops.length !== 1) return end(stops.length ? 'evening' : 'stuck');
        // RV1 (L4, L5): the one way on is taken only when it is the usual evening: not a fight, not the Fallout's farewell, not a new label
        const sc = scenes[g.scene].choices[stops[0].index];
        const lab = String(stops[0].label).replace(/\d+/g, '#'); // numbers aside, as the fold
        if (sc?.combat || (g.scene === 'fo_ashfall' && farewellNow(g)) || (p.ev && p.ev !== lab)) return end('story');
        p.ev = lab;
        const r = choose(g, scenes, stops[0].index);
        say(r.lines || []);
        if (r.combat) return end('story');
        if (g.minutes === m0 && g.scene === s0) return end('stuck');
    }
    return end('stuck');
}

/* ---------- v0.11.206 (owner pick FC1, with the Opus review's fixes RV1): the plan's forecast ---------- */
/**
 * E1: the plan's cards (and the week's work carried) against the hours left to the evenings this week: today's to the evening,
 * then each later day's from its morning (the dry run's own mornings, RV1 M2; MORNING_HOUR only where the dry run has none).
 * E2b + E3: a dry run of the plan on a copy of the save (`runWeek` itself, so it is exact: no dice, every number from the save):
 * each planned card's finish (calendar minutes) or null (not this week), and where the plan stops and why, with Fed and HP then.
 * M1 (the owner's pick mid-build): each Meditate row's days in full this week.
 * E4: at an evening's choice the dry run takes the one taken there last time (`g.tasks.evc`, scene → index, noted by `storyTap`,
 * the story taps of the long calendar's stays; dropped by every rewind like the rest of `g.tasks`), else the first way on.
 * The dry run and the screen take the same steps: `storyTap` (a story choice), `afterStory` (the quiet night's fold, then the plan
 * goes on by itself or not) are what main.js runs on a tap (RV1, TG1). Nothing here changes the save it is given.
 */
export const FORECAST_TEXT = { ...STOP_TEXT, fight: 'a fight' };
/** E1: the hour a stay's working day is counted from where the dry run has no morning (it stopped first). */
export const MORNING_HOUR = 7;
/** A stay hub's own evening (two or more ways on): the hubs with an evening hour. */
const WEEK_EVENING = new Set(Object.keys(EVENING_HOUR));
/** E4: note the choice taken on an evening or night screen (long calendar, a stay's days only (RV1, L4); a hub only in its evening). */
export function noteEvening(g, sceneId, index) {
    if (!longCal(g) || !STAY_DAYS.has(storyDay(g)) || !(index >= 0) || index >= 1000) return;
    if (!NIGHT_SCENES.has(sceneId) && !(WEEK_EVENING.has(sceneId) && sceneId === g.scene && weekHub(g) && workRoom(g, sceneId) <= 0)) return;
    const t = taskState(g);
    if (!isRec(t.evc)) t.evc = {};
    t.evc[sceneId] = index;
}
/** v0.11.210 (owner pick RV1, L2 as the owner set it, 12:25: "It should take the choice I took before, that's ok, but the first time
 *  should stop, so I can choose. Also, choice resets per coil."; 12:39: "yes, repeat talks should be also answered, unless a new option
 *  comes up. If a new option comes up, it should stop again"): the choice taken last in each daily door's scene (a talk), with the
 *  screen's options as they were then (`sig`: their labels, numbers aside), this Coil only (`g.tasks.dc`: { coil, picks: scene →
 *  { i, sig } }; a new Coil starts it empty). The plan (and so the forecast's dry run) answers a talk with it when the options are the
 *  same; the first time, or with an option new or changed, it stops for the player. */
function doorMemo(g) {
    const t = taskState(g);
    if (!isRec(t.dc) || t.dc.coil !== coilKey(g) || !isRec(t.dc.picks)) t.dc = { coil: coilKey(g), picks: {} };
    return t.dc.picks;
}
/** The open options of the screen (labels, numbers aside), as one hash. */
const doorOpen = (g, scenes) => sceneView(g, scenes).choices.filter((c) => !c.disabled && c.index < 1000 && !META.test(String(c.label)));
export const doorSig = (g, scenes) => hash(doorOpen(g, scenes).map((c) => `${c.index}:${c.label}`).join('|'));
export function noteDoor(g, scenes, sceneId, index) {
    if (!longCal(g) || !PLAN_DOORS.includes(sceneId) || sceneId !== g.scene || !(index >= 0) || index >= 1000) return;
    doorMemo(g)[sceneId] = { i: index, sig: doorSig(g, scenes) };
}
/** The choice taken last on this door's screen this Coil, when the screen's options are the same as then and it is open; else null. */
export function doorPick(g, scenes) {
    const t = g.tasks?.dc;
    if (!isRec(t) || t.coil !== coilKey(g) || !isRec(t.picks) || !isRec(t.picks[g.scene])) return null;
    const { i, sig } = t.picks[g.scene];
    if (scenes[g.scene]?.choices?.[i]?.combat) return null; // v0.11.213 (RV1, M2): a fight is never replayed (W1); the player's again
    return sig === doorSig(g, scenes) && doorOpen(g, scenes).some((c) => c.index === i) ? i : null;
}
/** RV1 (TG1, TG8): a story choice as a tap takes it: the evening's choice (and a talk's, v0.11.210) noted first, then taken. Returns choose's result. */
export function storyTap(g, scenes, index) {
    noteEvening(g, g.scene, index);
    noteDoor(g, scenes, g.scene, index);
    return choose(g, scenes, index);
}
/** RV1 (TG1): after a story choice (no fight): the quiet night's fold, then whether the plan goes on by itself. */
export function afterStory(g, scenes) {
    const fold = foldNight(g, scenes);
    return { fold, resume: weekResume(g) };
}
/** The ways on of the screen (no card, no meta, no "one move"). */
const waysOn = (g, scenes) => (TASK_HUBS[g.scene] ? hubStops(g, scenes) : sceneView(g, scenes).choices.filter((c) => !c.disabled && !META.test(String(c.label)))).filter((c) => c.index < 1000);
/** E4: the choice the dry run takes here: the one taken last time, else the first way on; null if none. */
export function eveningPick(g, scenes) {
    const open = waysOn(g, scenes);
    const last = g.tasks?.evc?.[g.scene];
    return (open.find((c) => c.index === last) || open[0])?.index ?? null;
}
/** E3 (RV1, L3): a fight stops the plan when every way on of the screen starts one (a fight among other ways is the story's). */
export const fightHere = (g, scenes) => {
    if (g.combat) return true;
    if (!scenes[g.scene]) return false;
    const w = waysOn(g, scenes);
    return w.length > 0 && w.every((c) => !!scenes[g.scene].choices[c.index]?.combat);
};
/** A week's card's whole time, as its row shows it (×7; its familiarity in). */
export const cardWeekMinutes = (c) => Math.round(((c.minutes || 0) * NEW_LENGTH) / cardSpeed(c.fam || 0)) * WEEK_MULT;
/** Minutes of the waking day `d` (from its midnight). */
const ofDay = (g, d) => g.minutes - d * 1440;
/**
 * E2b + E3 + E4 + M1: the dry run. Returns { rows: { cardId: minutes | null }, med: { sit, mer, qi } days in full, days, stop,
 * minutes, fed, hp, hpMax, mornings: { workDay: minutes of that day } }, or null (not a stay hub, or the dry run failed: RV1, L2).
 * `max`: a guard on the evenings walked; `json`: the save as JSON, when the caller has it already.
 */
export function planForecast(g, scenes, { max = 60, json = null } = {}) {
    if (!weekHub(g)) return null;
    try {
        const c = JSON.parse(json || JSON.stringify(g));
        const p = planEnsure(c);
        if (!p) return null;
        p.running = false; p.stop = '';
        const hub = p.hub, day0 = workDay(c), want = Object.keys(p.items).filter((id) => p.items[id] > 0);
        const doors0 = isRec(p.doors) ? { ...p.doors } : {}; // v0.11.213 (RV1, M1): as set before the run (a one-off taken goes back to 0)
        const rows = Object.fromEntries(want.map((id) => [id, null]));
        const days = Math.max(1, p.lastDay - day0 + 1), med = { ...p.med }, done = {}, mornings = {};
        if (isRec(p.done) && p.done.d === day0) done[day0] = { ...p.done };
        // the watch (RV1, H1: after each step's bookkeeping): a card is done when its count is gone and no carry of it is left
        const onStep = (cg) => {
            const q = cg.tasks.plan;
            for (const id of want) if (rows[id] == null && !(q?.items?.[id] > 0) && !carriesRead(cg)[id]) rows[id] = cg.minutes; // v0.11.215 (CF1, RE): done when its work is
            if (isRec(q?.done) && q.done.d >= day0) done[q.done.d] = { ...q.done };
            const d = workDay(cg); // M2: the morning is the first moment on the hub of a later day
            if (cg.scene === hub && d > day0 && mornings[d] == null) mornings[d] = ofDay(cg, d);
        };
        const evening = () => NIGHT_SCENES.has(c.scene) || c.scene === hub;
        let stop = 'stuck';
        for (let k = 0; k < max; k++) {
            stop = runWeek(c, scenes, { onStep }).stop;
            if (stop === 'story' && fightHere(c, scenes)) stop = 'fight';
            if (stop !== 'evening') break; // v0.11.210 (RV1, L2): a talk the plan can't answer ('door') is the player's: the forecast stops there
            let on = false;
            for (let j = 0; j < 12 && !on; j++) { // the evening's screens, a tap each, until the plan goes on by itself
                if (workDay(c) > p.lastDay) { stop = 'week'; break; } // RV1 (M1): past the plan's last day the week is over
                const idx = eveningPick(c, scenes);
                if (idx == null) { stop = 'stuck'; break; }
                const r = storyTap(c, scenes, idx);
                if (r.combat) { stop = 'fight'; break; }
                if (afterStory(c, scenes).resume) on = true;
                else if (!evening()) { stop = fightHere(c, scenes) ? 'fight' : 'story'; break; }
            }
            if (!on) break;
        }
        const full = Object.fromEntries(Object.keys(med).map((k) => [k, med[k] > 0 ? Object.entries(done).filter(([d, x]) => Number(d) <= p.lastDay && (x[k] || 0) >= med[k]).length : 0]));
        const doors = {}; // v0.11.210 (DC-a): each door row's days in full, apart from the Meditate rows
        for (const [s, n] of Object.entries(doors0)) if (n > 0) doors[s] = Object.entries(done).filter(([d, x]) => Number(d) <= p.lastDay && (x.doors?.[s] || 0) >= n).length;
        return { rows, med: full, doors, days, stop, minutes: c.minutes, fed: Math.round(c.james.satiety), hp: Math.round(c.james.hp), hpMax: jamesHpMax(c), mornings };
    } catch { return null; }
}
/** E1: minutes of work in the plan (each card's ×7 time; the carried work's rest) and minutes left to the evenings this week. */
export function planHours(g, scenes, p = planHere(g), fc = null) {
    if (!weekHub(g)) return null;
    const hub = g.scene, ev = (EVENING_HOUR[hub] ?? 16) * 60;
    let work = carriesHere(g, hub).reduce((a, cy) => a + cy.left, 0); // v0.11.215 (CF1, UB): every card's work carried
    const cards = planCards(g, scenes);
    for (const [id, n] of Object.entries(p?.items || {})) { const c = cards.find((x) => x.id === id); if (c && n > 0) work += n * cardWeekMinutes(c); }
    const last = p ? p.lastDay : weekLastDay(g), today = workDay(g);
    let left = workRoom(g, hub), morn = MORNING_HOUR * 60;
    for (let d = today + 1; d <= last; d++) { if (fc?.mornings?.[d] != null) morn = fc.mornings[d]; left += Math.max(0, ev - morn); }
    return { work, left };
}
/** The forecast, kept until the save changes (each − / + tap, each card): a plain redraw costs one JSON copy. */
let memo = { key: '', out: null };
export function forecastNow(g, scenes) {
    let key;
    try { key = JSON.stringify(g); } catch { return null; }
    if (key !== memo.key) memo = { key, out: planForecast(g, scenes, { json: key }) };
    return memo.out;
}
const durText = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} m` : ''}` : `${m} m`);
const whenText = (m) => clockLabel(m).replace(',', '');
/**
 * RV1 (TG7): the plan panel's forecast texts, from the forecast: { rows: { cardId: ' · done Day 3 14:56' | ' · not this week' },
 * med: { sit: '6 of 6 days', … }, total: the E1 line ('' for an empty plan: RV1, L1), outlook: the E3 line ('' with no forecast) }.
 */
export function planNotes(g, scenes) {
    const p = planHere(g), fc = forecastNow(g, scenes), items = p?.items || {}, med = p?.med || {};
    const rows = {}, mt = {};
    if (fc) {
        for (const id of Object.keys(items)) if (items[id] > 0) rows[id] = fc.rows[id] != null ? ` · done ${whenText(fc.rows[id])}` : ' · not this week';
        for (const k of Object.keys(med)) if (med[k] > 0) mt[k] = `${fc.med[k] || 0} of ${fc.days} day${fc.days > 1 ? 's' : ''}`;
        // v0.11.210 (DC-a); v0.11.213 (FQ1, S3): the visits this week (a repeating door opens every SPACE_DAYS-th day), a one-off's if or not
        for (const [s, n] of Object.entries(fc.doors || {})) mt[`door:${s}`] = doorRepeats(s) ? `${n} visit${n === 1 ? '' : 's'} this week` : n ? 'this week' : 'not this week';
    }
    const h = planEmpty(p) ? null : planHours(g, scenes, p, fc);
    const total = h ? `Cards ${durText(h.work)}; ${durText(h.left)} left to the evenings this week.` : '';
    const then = fc ? ` Fed ${fc.fed}, HP ${fc.hp}/${fc.hpMax} then.` : '';
    const outlook = !fc ? '' : fc.stop === 'week' ? `Forecast: it runs to the week's end (${whenText(fc.minutes)}).${then}` : `Forecast: it stops ${whenText(fc.minutes)}: ${FORECAST_TEXT[fc.stop] || fc.stop}.${then}`;
    return { rows, med: mt, total, outlook };
}
