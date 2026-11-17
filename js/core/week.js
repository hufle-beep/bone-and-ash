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
import { advance, jamesHpMax, canBreakThrough, clockParts, clockLabel, fnv1a, takeSpoilNotes } from './game.js';
import { taskCards, taskOpen, runTask, taskState, taskOutcome, isTaskChoice, sitTaskId, QI_TASK, CARRY_TASK, carryHere, weekHub, workDay, workRoom, dayMeal, cardSpeed, NEW_LENGTH, WEEK_MULT } from './tasks.js';
import { farewellNow } from '../story/act1_fallout.js'; // RV1 (L4)
import { foodCount, preservable } from '../story/common.js';
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
    t.plan = { hub: g.scene, coil: coilKey(g), lastDay: weekLastDay(g), items: {}, med: { sit: 0, mer: 0, qi: 0, pres: 0 }, done: { d: -1, sit: 0, mer: 0, qi: 0, pres: 0 }, running: false, stop: '', bt: -1 };
    return t.plan;
}
export const MED_MAX = { sit: 12, mer: 6, qi: 8, pres: 1 }; // v0.11.209 (owner pick TF1, K): "Smoke the catch." by the day (0 or 1)
/** Change a count (`key`: a card id, or 'med:sit' / 'med:mer' / 'med:qi' / 'med:pres'), from 0 up to 9 cards or MED_MAX a day. */
export function planSet(g, key, n) {
    const p = planEnsure(g);
    if (!p) return null;
    const m = /^med:(sit|mer|qi|pres)$/.exec(key);
    if (m) p.med[m[1]] = Math.max(0, Math.min(MED_MAX[m[1]], Math.round(n) || 0));
    else { const v = Math.max(0, Math.min(9, Math.round(n) || 0)); if (v) p.items[key] = v; else delete p.items[key]; }
    p.stop = '';
    return p;
}
/** Clear: every count to 0, the plan stopped (RV1, TG11: here, so the tests can run it). */
export function planClear(g) { const p = planHere(g); if (!p) return null; p.items = {}; p.med = { sit: 0, mer: 0, qi: 0, pres: 0 }; p.stop = ''; p.running = false; return p; }
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
/** v0.11.209 (TF1, K): the hub's "Smoke the catch." card when it is open now, or null. */
export const presCard = (g, scenes) => taskCards(g, scenes).find((c) => c.pres && c.status === 'open')?.id || null;

/**
 * Run the plan from here until a stop. Returns { stop, days: [{ day, lines }], steps }. `max`: a guard on the steps.
 * Every card is run with runTask and every story choice with choose, exactly as a tap would take them.
 */
export function runWeek(g, scenes, { max = 600, onStep = null } = {}) {
    const days = [];
    let cur = null;
    const say = (ls) => { if (!ls || !ls.length) return; const d = calDay(g); if (!cur || cur.day !== d) { cur = { day: d, lines: [] }; days.push(cur); } cur.lines.push(...ls); };
    let p = planHere(g);
    if (!p) { const t = taskState(g); if (isRec(t.plan) && t.plan.hub === g.scene && t.plan.coil === coilKey(g)) { t.plan.running = false; t.plan.stop = 'week'; return { stop: 'week', days, steps: 0 }; } return { stop: 'left', days, steps: 0 }; }
    const hub = p.hub;
    p.running = true; p.stop = '';
    // FC1 (RV1, H1): the forecast's watch, called at each step's start (after the last step's bookkeeping: a card the day's
    // routine left no time for is owed again by then) and at the stop, with the last card run and its result
    let last = null;
    const watch = () => { if (onStep) onStep(g, last); last = null; };
    const end = (stop) => { watch(); if (p) { p.stop = stop; if (stop !== 'evening') p.running = false; } return { stop, days, steps }; };
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
        if (p.done.d !== d) p.done = { d, sit: 0, mer: 0, qi: 0, pres: 0 };
        // RV1 (M3): the forecast's death check, as a tap's ("Starves here"): stop before a card that would end the Coil
        const deadly = (id) => { try { return taskOutcome(g, scenes, id)?.death || null; } catch { return null; } };
        const run = (id) => { const r = runTask(g, scenes, id); say(r.lines); last = { id, r }; return r; }; // FC1 (RV1, H1): seen by the next watch
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
        // v0.11.209 (owner pick TF1, K): the day's catch smoked, after the day's work (a plan from before has no `pres`: 0)
        const pid = (p.done.pres || 0) < (p.med.pres || 0) ? presCard(g, scenes) : null;
        if (pid && !deadly(pid)) { p.done.pres = (p.done.pres || 0) + 1; run(pid); if (g.scene !== hub) return end('story'); continue; }
        if ((p.done.pres || 0) < (p.med.pres || 0) && preservable(g) === 0) p.done.pres = p.med.pres; // RV1 (L7): nothing to smoke: the day's row is done
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
/** RV1 (TG1, TG8): a story choice as a tap takes it: the evening's choice noted first, then taken. Returns choose's result. */
export function storyTap(g, scenes, index) {
    noteEvening(g, g.scene, index);
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
        const rows = Object.fromEntries(want.map((id) => [id, null]));
        const days = Math.max(1, p.lastDay - day0 + 1), med = { ...p.med }, done = {}, mornings = {};
        if (isRec(p.done) && p.done.d === day0) done[day0] = { ...p.done };
        // the watch (RV1, H1: after each step's bookkeeping): a card is done when its count is gone and no carry of it is left
        const onStep = (cg) => {
            const q = cg.tasks.plan;
            for (const id of want) if (rows[id] == null && !(q?.items?.[id] > 0) && cg.tasks.carry?.id !== id) rows[id] = cg.minutes;
            if (isRec(q?.done) && q.done.d >= day0) done[q.done.d] = { ...q.done };
            const d = workDay(cg); // M2: the morning is the first moment on the hub of a later day
            if (cg.scene === hub && d > day0 && mornings[d] == null) mornings[d] = ofDay(cg, d);
        };
        const evening = () => NIGHT_SCENES.has(c.scene) || c.scene === hub;
        let stop = 'stuck';
        for (let k = 0; k < max; k++) {
            stop = runWeek(c, scenes, { onStep }).stop;
            if (stop === 'story' && fightHere(c, scenes)) stop = 'fight';
            if (stop !== 'evening') break;
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
        return { rows, med: full, days, stop, minutes: c.minutes, fed: Math.round(c.james.satiety), hp: Math.round(c.james.hp), hpMax: jamesHpMax(c), mornings };
    } catch { return null; }
}
/** E1: minutes of work in the plan (each card's ×7 time; the carried work's rest) and minutes left to the evenings this week. */
export function planHours(g, scenes, p = planHere(g), fc = null) {
    if (!weekHub(g)) return null;
    const hub = g.scene, ev = (EVENING_HOUR[hub] ?? 16) * 60;
    let work = carryHere(g, hub)?.left || 0;
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
    }
    const h = planEmpty(p) ? null : planHours(g, scenes, p, fc);
    const total = h ? `Cards ${durText(h.work)}; ${durText(h.left)} left to the evenings this week.` : '';
    const then = fc ? ` Fed ${fc.fed}, HP ${fc.hp}/${fc.hpMax} then.` : '';
    const outlook = !fc ? '' : fc.stop === 'week' ? `Forecast: it runs to the week's end (${whenText(fc.minutes)}).${then}` : `Forecast: it stops ${whenText(fc.minutes)}: ${FORECAST_TEXT[fc.stop] || fc.stop}.${then}`;
    return { rows, med: mt, total, outlook };
}
