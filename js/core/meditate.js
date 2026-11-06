/**
 * The Meditate card (v0.9.5, task mode): on every screen except fights and a few urgent moments.
 * Inside: Cultivate (condensation lives here now), Open a meridian, Break through. The scene stays open:
 * the meridian and breakthrough screens come back to it without running its enter again (`med_back`).
 * On a task hub, Cultivate is the hub's own cultivate card (queueable; same id, same familiarity), shown in this group.
 * Pure — no DOM.
 */
import { condense, canBreakThrough } from './game.js';
import { CONDENSE_SIT_COST } from './formulas.js';
import { goTo } from './story.js';
import { canAnyMeridian } from '../story/meridians.js';
import { TASK_HUBS } from '../story/task_hubs.js';

/** No meditating here: urgent moments and screens that are already about it. */
export const NO_MEDITATE = new Set(['herb_girl', 'tribute', 'rt_elder', 'coil_end', 'coil_dawn', 'breakthrough', 'ns_warn', 'meridians', 'yuki_form', 'yuki_tiger_awaken', 'yuki_human_awaken']);
export const SIT_MINUTES = 30;

/** Is a choice one of the plain "cultivate one sit and come back" choices (hub chores)? */
export const isSitChoice = (c, sceneId) => c.to === sceneId && /^(Cultivate|Condense)/.test(String(typeof c.text === 'function' ? '' : c.text)) && /condense\(g\)/.test(String(c.do));
/** The old hub choices that the Meditate card replaces in task mode (break through, open a meridian). */
export const isMedDoor = (c) => typeof c.text === 'function' ? /Break through/.test(String(c.text)) && /bt_return/.test(String(c.do)) : /^Open a meridian/.test(String(c.text));

export const canMeditate = (g, scenes) => !g.combat && !NO_MEDITATE.has(g.scene) && !scenes[g.scene]?.end;

/** The Meditate cards here: [{ id, label, tag, open, reason, minutes, task? }] — `task` = a hub card id (queueable). */
export function medCards(g, scenes) {
    if (!canMeditate(g, scenes)) return [];
    const out = [];
    const s = scenes[g.scene];
    const hubSit = TASK_HUBS[g.scene] ? (s.choices || []).findIndex((c) => isSitChoice(c, g.scene)) : -1;
    const qiOk = g.james.qi >= CONDENSE_SIT_COST;
    const sit = { label: `Cultivate: one sit, ${CONDENSE_SIT_COST} Qi toward Saturation (${g.james.saturation}%).`, tag: qiOk ? `${CONDENSE_SIT_COST} Qi` : `needs ${CONDENSE_SIT_COST} Qi`, open: qiOk, minutes: SIT_MINUTES };
    if (hubSit >= 0) out.push({ ...sit, id: `${g.scene}:${hubSit}`, task: `${g.scene}:${hubSit}` });
    else out.push({ ...sit, id: 'med:sit' });
    if (canAnyMeridian(g)) out.push({ id: 'med:mer', label: 'Open a meridian.', tag: 'opens the meridian screen', open: true, minutes: 0 });
    if (canBreakThrough(g)) out.push({ id: 'med:bt', label: `Break through. (Saturation ${g.james.saturation}%.)`, tag: 'opens the breakthrough', open: true, minutes: 0 });
    return out;
}

/** Run a Meditate card that isn't a hub task. Returns { lines, moved }. */
export function runMed(g, scenes, id) {
    if (!canMeditate(g, scenes)) throw new Error('Not here');
    if (id === 'med:sit') {
        const r = condense(g);
        return { lines: r.ok ? [`Condensed: Saturation ${r.saturation}%.`] : ['Not enough Qi to sit.'], moved: false };
    }
    const back = g.scene;
    if (id === 'med:mer' && canAnyMeridian(g)) {
        g.flags.mer_return = back; g.flags.med_back = back;
        return { lines: goTo(g, scenes, 'meridians'), moved: true };
    }
    if (id === 'med:bt' && canBreakThrough(g)) {
        g.flags.bt_return = back; g.flags.med_back = back;
        return { lines: goTo(g, scenes, g.james.realm === 6 && (g.james.extra8 || 0) < 8 ? 'ns_warn' : 'breakthrough'), moved: true };
    }
    throw new Error(`No meditate card ${id}`);
}
