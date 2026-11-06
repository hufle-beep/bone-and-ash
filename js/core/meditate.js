/**
 * The Meditate card (v0.9.5, task mode): on every screen except fights and a few urgent moments.
 * Inside: Cultivate (condensation lives here now), the meridian lines (v0.11.13, E1: one card each, no screen), Break through. The scene stays open:
 * the meridian and breakthrough screens come back to it without running its enter again (`med_back`).
 * On a task hub, Cultivate is the hub's own cultivate card (queueable; same id, same familiarity), shown in this group.
 * Pure — no DOM.
 */
import { condense, canBreakThrough, breakReady, breakBlock, btMinutes, sitGain, isNoDice, sitMinutes, actSpeed, actUses } from './game.js';
import { CONDENSE_SIT_COST } from './formulas.js';
import { goTo, checkDeath, choose, choiceOpen } from './story.js';
import { btTarget, MER_LINES, lineWindow, lineWait, lineIndex, lineName } from '../story/meridians.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { BT_TASK, SIT_TASK, sitOpen, merLineTask, merLineChoice, isQueueScreen } from './tasks.js';
const hrs = (m) => (m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);

/** No meditating here: urgent moments and screens that are already about it. */
export const NO_MEDITATE = new Set(['herb_girl', 'tribute', 'rt_elder', 'rt_truth', 'coil_end', 'coil_dawn', 'breakthrough', 'ns_warn', 'col_warn', 'meridians', 'yuki_form', 'yuki_tiger_awaken', 'yuki_human_awaken']);
export const SIT_MINUTES = 60; // v0.11.2: an hour at ×1 (v0.11.15: ÷ its speed by use, game.js sitMinutes)
/** v0.11.15: which activity a Meditate card or queue id belongs to ('sit' | 'mer' | 'bt'), for its speed by use. */
export const medActivity = (id) => (/^(med:)?mer:/.test(id) ? 'mer' : /^(med:bt|bt:next)$/.test(id) ? 'bt' : /^(med:sit|sit:next)$/.test(id) ? 'sit' : null);
/** v0.11.15: the tooltip line: its speed and uses. */
export const useLine = (g, k) => { const n = actUses(g, k); return `Familiar: ×${actSpeed(g, k).toFixed(1)} (${n} ${k === 'sit' ? (n === 1 ? 'sit' : 'sits') : k === 'mer' ? (n === 1 ? 'sitting' : 'sittings') : (n === 1 ? 'breakthrough' : 'breakthroughs')}). It goes faster the more you do it, up to ×10.`; };

/** Is a choice one of the plain "cultivate one sit and come back" choices (hub chores)? */
export const isSitChoice = (c, sceneId) => c.to === sceneId && /^(Cultivate|Condense)/.test(String(typeof c.text === 'function' ? '' : c.text)) && /condense\(g\)/.test(String(c.do));
/** The old hub choices that the Meditate card replaces in task mode (break through, open a meridian). */
export const isMedDoor = (c) => typeof c.text === 'function' ? /Break through/.test(String(c.text)) && /bt_return/.test(String(c.do)) : /^Open a meridian/.test(String(c.text));

/** v0.11.14 (owner 18:53, pick A): Meditate only where James rests: the task screens and Act 1's resting places. */
export const MED_SCREENS = new Set(['camp', 'stream', 'wilds', 'village', 'ashfall', 'lf_hub', 'fo_ashfall', 'rr_hub', 'dw_hub', 'ah_hub', 'heart_hub', 'rt_camp', 'rt_ashfall']);
export const canMeditate = (g, scenes) => !g.combat && MED_SCREENS.has(g.scene) && !NO_MEDITATE.has(g.scene) && !scenes[g.scene]?.end;

const asStr = (t, g) => String(typeof t === 'function' ? t(g) : t);
/** v0.11.13 (E1): the meridian cards: one per line in reach; locked with the reason when it can't run now. */
function merCards(g, scenes) {
    if (!isNoDice()) return []; // Story Mode keeps the meridian screen (its hub choice)
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
    const s = scenes[g.scene];
    const hubSit = TASK_HUBS[g.scene] ? (s.choices || []).findIndex((c) => isSitChoice(c, g.scene)) : -1;
    const qiOk = g.james.qi >= CONDENSE_SIT_COST;
    const sm = sitMinutes(g);
    const sit = { label: `Cultivate: ${sm === 60 ? 'an hour' : `${sm} min`}, ${CONDENSE_SIT_COST} Qi, Saturation +${sitGain(g)}% (${g.james.saturation}%).`, tag: qiOk ? `${CONDENSE_SIT_COST} Qi` : `needs ${CONDENSE_SIT_COST} Qi`, open: qiOk, minutes: sm };
    if (hubSit >= 0) out.push({ ...sit, id: `${g.scene}:${hubSit}`, task: `${g.scene}:${hubSit}` });
    else out.push({ ...sit, id: 'med:sit', ...(sitOpen(g, scenes) ? { task: SIT_TASK } : {}) }); // v0.11.12: queueable on a task screen with no Cultivate of its own
    out.push(...merCards(g, scenes)); // v0.11.13 (E1): replaces "Next meridian session" and "Open a meridian"
    if (canBreakThrough(g)) {
        const warn = btTarget(g) !== 'breakthrough';
        out.push({ id: 'med:bt', label: `Break through. (Saturation ${g.james.saturation}%; ${hrs(btMinutes(g))}.)`, tag: warn ? 'a warning first' : 'queueable', open: true, minutes: warn ? 0 : btMinutes(g), ...(warn || !isQueueScreen(g, scenes) ? {} : { task: BT_TASK }) });
    }
    else if (breakReady(g) && breakBlock(g)) out.push({ id: 'med:bt', label: `Break through. (Saturation ${g.james.saturation}%.)`, tag: breakBlock(g), open: false, reason: breakBlock(g), minutes: 0 });
    return out;
}

/** Run a Meditate card that isn't a hub task. Returns { lines, moved }. */
export function runMed(g, scenes, id) {
    if (!canMeditate(g, scenes)) throw new Error('Not here');
    if (id === 'med:sit') {
        const r = condense(g);
        const dead = checkDeath(g, scenes);
        return { lines: [...(r.ok ? [`Condensed: Saturation ${r.saturation}%.`] : ['Not enough Qi to sit.']), ...dead], moved: dead.length > 0 };
    }
    const back = g.scene;
    const line = /^med:mer:(\w+)$/.exec(id)?.[1];
    if (line) { // v0.11.13 (E1): the line's work, run from here (its bar has filled); the scene stays
        const i = merLineChoice(g, scenes, line);
        if (i < 0) throw new Error(`No meridian work on ${line} now`);
        g.scene = 'meridians';
        const r = choose(g, scenes, i);
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
