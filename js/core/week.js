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
import { advance, jamesHpMax, canBreakThrough, clockParts, fnv1a } from './game.js';
import { taskCards, taskOpen, runTask, taskState, taskOutcome, isTaskChoice, sitTaskId, QI_TASK, CARRY_TASK, carryHere, weekHub, workDay, workRoom, dayMeal } from './tasks.js';
import { farewellNow } from '../story/act1_fallout.js'; // RV1 (L4)
import { foodCount } from '../story/common.js';
import { EVENING_HOUR } from '../story/oneoff.js';
import { TASK_HUBS } from '../story/task_hubs.js';

/** The night and morning screens of the stays that fold (the suppers and the camp's night keep their choices, so they never do). */
export const FOLD_SCENES = new Set(['village_night', 'village_morning', 'fo_night', 'fo_morning', 'morning', 'heart_night', 'heart_morning']);
/** The evening and night screens between a stay hub's evening and its next morning: a stop there keeps the plan running. */
export const NIGHT_SCENES = new Set(['camp', 'night', 'supper', 'supper_roof', 'village_night', 'village_morning', 'fo_supper', 'fo_night', 'fo_morning', 'morning', 'heart_camp', 'heart_night', 'heart_morning', 'mei_walk']);
const META = /^(Yuki: change form|Story Mode only)/;
export const STOP_TEXT = {
    evening: 'the evening has a choice', story: 'the story needs you', hurt: 'HP is under 60%', hungry: 'Fed is under 30 and there is no food',
    breakthrough: 'a breakthrough is ready', week: 'the week is over', stuck: 'nothing left it can do here', left: 'the story moved on',
};
const hash = (t) => fnv1a(String(t || '').replace(/\d+/g, '#')); // the day's numbers ("Day 45. 48 days to the Elder.") don't make a night new
const calDay = (g) => Math.floor((g.minutes || 0) / 1440) + 1;
const hourNow = (g) => clockParts(g.minutes).hh;
const coilKey = (g) => `${g.coil?.n || 1}|${g.coil?.act || 0}`;
const plainChoice = (c) => !!c && !c.check && !c.combat && !c.fail && !c.qi;
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
    t.plan = { hub: g.scene, coil: coilKey(g), lastDay: weekLastDay(g), items: {}, med: { sit: 0, mer: 0, qi: 0 }, done: { d: -1, sit: 0, mer: 0, qi: 0 }, running: false, stop: '', bt: -1 };
    return t.plan;
}
export const MED_MAX = { sit: 12, mer: 6, qi: 8 };
/** Change a count (`key`: a card id, or 'med:sit' / 'med:mer' / 'med:qi'), from 0 up to 9 cards or MED_MAX a day. */
export function planSet(g, key, n) {
    const p = planEnsure(g);
    if (!p) return null;
    const m = /^med:(sit|mer|qi)$/.exec(key);
    if (m) p.med[m[1]] = Math.max(0, Math.min(MED_MAX[m[1]], Math.round(n) || 0));
    else { const v = Math.max(0, Math.min(9, Math.round(n) || 0)); if (v) p.items[key] = v; else delete p.items[key]; }
    p.stop = '';
    return p;
}
/** Clear: every count to 0, the plan stopped (RV1, TG11: here, so the tests can run it). */
export function planClear(g) { const p = planHere(g); if (!p) return null; p.items = {}; p.med = { sit: 0, mer: 0, qi: 0 }; p.stop = ''; p.running = false; return p; }
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
const firstMer = (g, scenes) => taskCards(g, scenes).find((c) => c.kind === 'mer' && c.status === 'open')?.id || null;

/**
 * Run the plan from here until a stop. Returns { stop, days: [{ day, lines }], steps }. `max`: a guard on the steps.
 * Every card is run with runTask and every story choice with choose, exactly as a tap would take them.
 */
export function runWeek(g, scenes, { max = 600 } = {}) {
    const days = [];
    let cur = null;
    const say = (ls) => { if (!ls || !ls.length) return; const d = calDay(g); if (!cur || cur.day !== d) { cur = { day: d, lines: [] }; days.push(cur); } cur.lines.push(...ls); };
    let p = planHere(g);
    if (!p) { const t = taskState(g); if (isRec(t.plan) && t.plan.hub === g.scene && t.plan.coil === coilKey(g)) { t.plan.running = false; t.plan.stop = 'week'; return { stop: 'week', days, steps: 0 }; } return { stop: 'left', days, steps: 0 }; }
    const hub = p.hub;
    p.running = true; p.stop = '';
    const end = (stop) => { if (p) { p.stop = stop; if (stop !== 'evening') p.running = false; } return { stop, days, steps }; };
    let steps = 0;
    for (; steps < max; steps++) {
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
        if (!p) { const t = taskState(g); if (isRec(t.plan) && t.plan.hub === hub) { t.plan.running = false; t.plan.stop = 'week'; } return { stop: 'week', days, steps }; }
        if (g.james.hp < 0.6 * jamesHpMax(g)) return end('hurt');
        if (g.james.satiety < 30 && foodCount(g) === 0) return end('hungry');
        if (canBreakThrough(g) && p.bt !== g.james.realm) { p.bt = g.james.realm; return end('breakthrough'); }
        const d = workDay(g);
        if (p.done.d !== d) p.done = { d, sit: 0, mer: 0, qi: 0 };
        // RV1 (M3): the forecast's death check, as a tap's ("Starves here"): stop before a card that would end the Coil
        const deadly = (id) => { try { return taskOutcome(g, scenes, id)?.death || null; } catch { return null; } };
        const run = (id) => { const r = runTask(g, scenes, id); say(r.lines); return r; };
        // the week's work: what is carried first, then the planned cards in order
        if (carryHere(g, hub) && taskOpen(g, scenes, CARRY_TASK)) { const dz = deadly(CARRY_TASK); if (dz) return end(dz === 'hunger' ? 'hungry' : 'hurt'); const r = run(CARRY_TASK); if (g.scene !== hub) return end('story'); if (r.skipped && g.minutes === m0) return end('stuck'); continue; }
        const next = Object.keys(p.items).find((id) => p.items[id] > 0 && taskOpen(g, scenes, id));
        if (next) {
            const dz = deadly(next); if (dz) return end(dz === 'hunger' ? 'hungry' : 'hurt');
            p.items[next] -= 1; if (p.items[next] <= 0) delete p.items[next];
            const r = run(next);
            if (r.skipped) p.items[next] = (p.items[next] || 0) + 1; // the day's routine went first; the card is still owed
            if (r.stopped || g.scene !== hub) return end('story');
            continue;
        }
        // the day's meditation, in the hours the work leaves
        const sid = sitTaskId(g, scenes);
        if (p.done.sit < p.med.sit && taskOpen(g, scenes, sid) && !deadly(sid)) { p.done.sit++; run(sid); if (g.scene !== hub) return end('story'); continue; }
        const mer = p.done.mer < p.med.mer ? firstMer(g, scenes) : null;
        if (mer && !deadly(mer)) { p.done.mer++; run(mer); if (g.scene !== hub) return end('story'); continue; }
        if (p.done.qi < p.med.qi && taskOpen(g, scenes, QI_TASK) && !deadly(QI_TASK)) { p.done.qi++; run(QI_TASK); if (g.scene !== hub) return end('story'); continue; }
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
                continue;
            }
        }
        say(dayMeal(g, hub)); // the evening's meal before the evening
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
