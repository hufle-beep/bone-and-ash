/**
 * The Meditate card (v0.9.5, task mode): on every screen except fights and a few urgent moments.
 * Inside: Cultivate (condensation lives here now), the meridian lines (v0.11.13, E1: one card each, no screen), Break through. The scene stays open:
 * the meridian and breakthrough screens come back to it without running its enter again (`med_back`).
 * On a task hub, Cultivate is the hub's own cultivate card (queueable; same id, same familiarity), shown in this group.
 * Pure — no DOM.
 */
import { condense, jamesQiMax, canBreakThrough, breakReady, breakBlock, btMinutes, sitGain, sitMinutes, actSpeed, actUses, nightLock, endsLate, sitUseless, DAY_END_HOUR } from './game.js';
import { CONDENSE_SIT_COST } from './formulas.js';
import { goTo, checkDeath, choose, choiceOpen } from './story.js';
import { btTarget, MER_LINES, lineWindow, lineWait, lineIndex, lineName } from '../story/meridians.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { BT_TASK, SIT_TASK, QI_TASK, QI_MINUTES, qiNotFull, qiFed, sitOpen, merLineTask, merLineChoice, isQueueScreen, sitLoop, sitLoopPlan, SIT_STOP_TEXT, sitSummary } from './tasks.js';
const hrs = (m) => (m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);

/** No meditating here: urgent moments and screens that are already about it. */
export const NO_MEDITATE = new Set(['herb_girl', 'tribute', 'rt_elder', 'rt_truth', 'coil_end', 'coil_dawn', 'breakthrough', 'ns_warn', 'col_warn', 'meridians', 'yuki_form', 'yuki_tiger_awaken', 'yuki_human_awaken']);
/** v0.11.15: which activity a Meditate card or queue id belongs to ('sit' | 'mer' | 'bt'), for its speed by use. */
export const medActivity = (id) => (/^(med:)?mer:/.test(id) ? 'mer' : /^(med:bt|bt:next)$/.test(id) ? 'bt' : /^(med:sit|sit:next)$/.test(id) ? 'sit' : null);
/** v0.11.15: the tooltip line: its speed and uses. */
export const useLine = (g, k) => { const n = actUses(g, k); return `Familiar: ×${actSpeed(g, k).toFixed(1)} (${n} ${k === 'sit' ? (n === 1 ? 'sit' : 'sits') : k === 'mer' ? (n === 1 ? 'sitting' : 'sittings') : (n === 1 ? 'breakthrough' : 'breakthroughs')}). It goes faster the more you do it, up to ×10.`; };

/** Is a choice one of the plain "cultivate one sit and come back" choices (hub chores)? */
export const isSitChoice = (c, sceneId) => c.to === sceneId && /^(Cultivate|Condense)/.test(String(typeof c.text === 'function' ? '' : c.text)) && /condense\(g\)/.test(String(c.do));
/** The old hub choices that the Meditate card replaces in task mode (break through, open a meridian). */

/** v0.11.14 (owner 18:53, pick A): Meditate only where James rests: the task screens and Act 1's resting places. */
export const MED_SCREENS = new Set(['camp', 'stream', 'wilds', 'village', 'ashfall', 'lf_hub', 'fo_ashfall', 'rr_hub', 'dw_hub', 'ah_hub', 'heart_hub', 'rt_camp', 'rt_ashfall']);
export const canMeditate = (g, scenes) => !g.combat && MED_SCREENS.has(g.scene) && !NO_MEDITATE.has(g.scene) && !scenes[g.scene]?.end;

const asStr = (t, g) => String(typeof t === 'function' ? t(g) : t);
/** v0.11.13 (E1): the meridian cards: one per line in reach; locked with the reason when it can't run now. */
function merCards(g, scenes) {
    const out = [];
    for (const line of MER_LINES) {
        if (!lineWindow(g, line)) continue;
        const i = lineIndex(scenes, line);
        if (i < 0) continue;
        const c = scenes.meridians.choices[i];
        const wait = lineWait(g, line);
        const shown = !c.show || c.show(g);
        const req = c.req ? c.req(g) : true;
        const reason = wait || (req !== true ? req : g.james.qi < (c.qi || 0) ? `needs ${c.qi} Qi` : !shown ? 'not now' : '');
        const open = !reason && merLineChoice(g, scenes, line) >= 0;
        const minutes = c.minutes ? c.minutes(g) : c.time || 0;
        out.push({ id: `med:mer:${line}`, line, label: shown ? asStr(c.text, g) : lineName(g, line), tag: open ? `${c.qi} Qi` : reason, open, ...(open ? {} : { reason }), minutes, ...(open && isQueueScreen(g, scenes) ? { task: merLineTask(line) } : {}) });
    }
    return out;
}

/** The Meditate cards here: [{ id, label, tag, open, reason, minutes, task? }] — `task` = a hub card id (queueable). */
export function medCards(g, scenes) {
    if (!canMeditate(g, scenes)) return [];
    const out = [];
    if (nightLock(g)) return []; // v0.11.37 (D-a): from the day's end only the night (v0.11.91: 00:00, no Push through the night)
    const s = scenes[g.scene];
    const hubSit = TASK_HUBS[g.scene] ? (s.choices || []).findIndex((c) => isSitChoice(c, g.scene)) : -1;
    const hubShut = hubSit >= 0 && !choiceOpen(g, s.choices[hubSit]); // v0.11.64 (the Fable review): the screen hides its own Cultivate (most hubs in the evening): so does Meditate
    const qiOk = g.james.qi >= CONDENSE_SIT_COST;
    const sm0 = sitMinutes(g), sm = sm0;
    const sit = { label: `Cultivate: ${sm0 === 60 ? 'an hour' : `${sm0} min`}, ${CONDENSE_SIT_COST} Qi, Saturation +${sitGain(g)}% (${g.james.saturation}%).`, tag: qiOk ? `${CONDENSE_SIT_COST} Qi` : `needs ${CONDENSE_SIT_COST} Qi (you have ${Math.round(g.james.qi * 10) / 10})`, open: qiOk, minutes: sm, ...(qiOk ? {} : { show: true }) }; // v0.11.46 (Q1): short of Qi, it shows locked with the reason
    if ((sit.open || sit.show) && endsLate(g, sm)) Object.assign(sit, LATE); // v0.11.47: a sit short of Qi past the day's end says so too
    if (sitUseless(g) || hubShut) { /* v0.11.37 (B2): a sit that changes nothing is not offered; v0.11.64: nor one the screen hides */ }
    else if (hubSit >= 0) out.push({ ...sit, id: `${g.scene}:${hubSit}`, task: `${g.scene}:${hubSit}` }); // its task id keeps the hub's own chore off the card list even when locked
    else out.push({ ...sit, id: 'med:sit', ...((sit.open || sit.late) && sitOpen(g, scenes) ? { task: SIT_TASK } : {}) }); // v0.11.12: queueable on a task screen with no Cultivate of its own
    if (sit.open && !sit.late && !sitUseless(g) && !hubShut) { // v0.11.64 (owner 02:07, pick C1): sit after sit until the limit; shown when two sits or more fit
        const p = sitLoopPlan(g, scenes);
        if (p.sits >= 2) out.push({ id: 'med:sitall', label: `Cultivate until the limit: ${p.sits} sits, ${hrs(p.minutes)}, ${p.qi} Qi → Saturation ${p.saturation}% (${SIT_STOP_TEXT[p.stop] || 'then it stops'}).`, tag: `${p.qi} Qi`, open: true, minutes: p.minutes, plan: p });
    }
    if (qiNotFull(g)) { // v0.11.46 (owner 19:26, pick Q1): recover Qi by meditating, an hour at the resting rate
        const fed = qiFed(g); // v0.11.47 (the Fable review of v0.11.46): at Fed 0 there is no regen, so it is locked with the reason
        const q = { id: 'med:qi', label: `Meditate: gather Qi. (An hour; Qi ${Math.round(g.james.qi * 10) / 10} / ${Math.round(jamesQiMax(g) * 10) / 10}.)`, tag: fed ? 'an hour, resting' : 'too hungry: eat first', open: fed, minutes: QI_MINUTES, ...(fed ? {} : { show: true, reason: 'too hungry: eat first' }), ...(fed && isQueueScreen(g, scenes) ? { task: QI_TASK } : {}) };
        if (endsLate(g, QI_MINUTES)) Object.assign(q, LATE);
        out.push(q);
    }
    out.push(...merCards(g, scenes).map((m) => (m.open && endsLate(g, m.minutes) ? { ...m, ...LATE } : m))); // a late card keeps its task id: the hub list doesn't show it twice (Fable review) // v0.11.13 (E1): replaces "Next meridian session" and "Open a meridian"
    if (canBreakThrough(g)) {
        const warn = btTarget(g) !== 'breakthrough';
        out.push({ id: 'med:bt', label: `Break through. (Saturation ${g.james.saturation}%; ${hrs(btMinutes(g))}.)`, tag: warn ? 'a warning first' : 'queueable', open: true, minutes: warn ? 0 : btMinutes(g), ...(warn || !isQueueScreen(g, scenes) ? {} : { task: BT_TASK }) });
    }
    else if (breakReady(g) && breakBlock(g)) out.push({ id: 'med:bt', label: `Break through. (Saturation ${g.james.saturation}%.)`, tag: breakBlock(g), open: false, reason: breakBlock(g), minutes: 0 });
    return out;
}
/** v0.11.37 (D-a): a card that would run past the day's end doesn't start (v0.11.91: midnight). */
export const LATE_TAG = DAY_END_HOUR === 0 ? 'ends past midnight' : `ends past ${String(DAY_END_HOUR).padStart(2, '0')}:00`;
const LATE = { open: false, late: true, tag: LATE_TAG, reason: LATE_TAG };
/** Run a Meditate card that isn't a hub task. Returns { lines, moved }. */
export function runMed(g, scenes, id) {
    if (g.tasks?.door) delete g.tasks.door; // v0.11.141 (RW1, CL): a Meditate card ends a door's scenes, as any card (tasks.js runTask)
    if (!canMeditate(g, scenes)) throw new Error('Not here');
    const back0 = g.scene;
    if (id === 'med:sitall') { // v0.11.64 (C1): each sit exactly one tap of the sit card
        const r = sitLoop(g, scenes);
        if (!r.sits) throw new Error('No sit possible');
        return { lines: [`${r.sits} sits, ${hrs(r.minutes)}, ${r.qi} Qi: Saturation ${r.saturation}% (${SIT_STOP_TEXT[r.stop] || 'then it stops'}).`, ...sitSummary(r.lines)], moved: g.scene !== back0 };
    }
    if (id === 'med:sit') {
        const r = condense(g);
        const dead = checkDeath(g, scenes);
        return { lines: [...(r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : ['Not enough Qi to sit.']), ...dead], moved: dead.length > 0 };
    }
    const back = g.scene;
    const line = /^med:mer:(\w+)$/.exec(id)?.[1];
    if (line) { // v0.11.13 (E1): the line's work, run from here (its bar has filled); the scene stays
        const i = merLineChoice(g, scenes, line);
        if (i < 0) throw new Error(`No meridian work on ${line} now`);
        g.scene = 'meridians';
        const r = choose(g, scenes, i, { task: true });
        if (g.scene === 'meridians') g.scene = back; // back without running the scene's enter again
        const dead = g.scene === back ? checkDeath(g, scenes) : [];
        return { lines: [...r.lines, ...dead], moved: g.scene !== back };
    }
    if (id === 'med:bt' && canBreakThrough(g)) {
        g.flags.bt_return = back; g.flags.med_back = back;
        return { lines: goTo(g, scenes, btTarget(g)), moved: true };
    }
    throw new Error(`No meditate card ${id}`);
}
