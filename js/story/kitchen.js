/**
 * v0.11.181 (owner picks SP1, KG1; group e's CM, push 1; texts by Fable, rule 10, in kitchen_texts.js): the mother's kitchen
 * and the communal pot (the owner 2026-11-08 13:17 and 2026-11-13 22:17, word for word in `lore.md` and `roadmap-e.md`).
 *  - K (KG1): Mei Lin's mother's card (`mother_time`, house_time.js) gains a kitchen paragraph by her friendship, after its
 *    gain: stage 1 from 8 (he helps), 2 from 15 (they share it), 3 from 30 (he takes it over; 25 until v0.11.189, L5a: below the closers' 30 it met a cold closer). The first time a stage is reached
 *    this Coil, its paragraph (KT_UP); later days a short line by stage (KT_DAY); the return's day its own line (KT_RETURN). The
 *    card's label by her friendship before the gain (KT_LABEL; stage 0 keeps HT_LABEL.mother). No gain changed: texts only.
 *    `kitchen_seen` and `mother_kitchen` are world flags: they reset with the Coil, as her friendship does (she forgets; he
 *    keeps the recipes).
 *  - PS: the communal pot's result line from the village's friendship 90 (POT_LINE; below it the old line), and the
 *    cook-with-the-women scene (`pot_cook` in the prologue, `fo_pot_cook` in the Fallout), once a Coil in each act, from the
 *    village's 90, 09:00–15:00, while the pot is still open today: a door card of 30 minutes and the scene's 60 (90 in all, the
 *    pot's 30 before), +25 satiety as the pot (it closes the pot for the day), Mother +2 in the Fallout's (RV1, L4: she is in that
 *    scene; the prologue's has no gain for her), Village +3 (a balance change, numbers shown in chat before the pick).
 * The cards are installed by kitchen_install.js (task_hubs.js imports ashfall.js, which reads potLine here: no cycle).
 */
import { bumpRel, eat } from '../core/game.js';
import { daily, markDaily, hour } from './common.js';
import { pickLine, textDay } from '../core/lines.js';
import { KT_LABEL, KT_UP, KT_DAY, KT_RETURN, POT_LINE, POT_COOK } from './kitchen_texts.js';

export { KT_LABEL, KT_UP, KT_DAY, KT_RETURN, POT_LINE, POT_COOK };
export const KG = [8, 15, 30]; // KG1: helps / shares / takes over; v0.11.189 (owner pick P1, L5a): the take-over from 30 (was 25), with her warm closers (house_time.js HT_MID)
export const POT_GATE = 90; // PS: the village's friendship
export const POT_FROM = 9, POT_UNTIL = 15; // the cook scene's hours (the card shows 09:00–14:59)
export const POT_CARD_MIN = 30, POT_COOK_MIN = 60;
export const POT_SAT = 25, POT_VILLAGE = 3;
export const POT_MOTHER = { ashfall: 0, fo_ashfall: 2 }; // RV1 (L4): only where she is in the scene

const relF = (g, who) => g.rel?.[who]?.f || 0;
/** KG1: the kitchen's stage by Mei Lin's mother's friendship (0 none, 1 helps, 2 shares, 3 takes over). */
export const kitchenStage = (g) => KG.filter((t) => relF(g, 'Mother') >= t).length;
/** The card's label by her friendship now (before the visit's gain). */
/** v0.11.189 (RV1, M2): the stage she has reached this Coil: her friendship's, or a higher one she has already shown him (a save
 *  from before the take-over moved from 25 to 30 keeps its hearth; she does not take it back). */
export const kitchenShown = (g) => Math.max(kitchenStage(g), Math.min(3, Number(g.flags.kitchen_seen) || 0));
export const kitchenLabel = (g, base) => KT_LABEL[kitchenShown(g)] || base;

/** Drawn once when her scene opens (after its gain): which kitchen text it shows, kept in `mother_kitchen` (as closeOnce). */
export function kitchenOnce(g, slot) {
    const up = kitchenStage(g), seen = Number(g.flags.kitchen_seen) || 0, s = kitchenShown(g); // RV1 (M2): never below what she has shown
    if (!s) { delete g.flags.mother_kitchen; return; }
    if (up > seen) g.flags.kitchen_seen = up;
    if (String(slot).startsWith('rt_ashfall')) g.flags.mother_kitchen = `rt|${s}`;
    else if (up > seen) g.flags.mother_kitchen = `up|${up}`;
    else g.flags.mother_kitchen = `day|${s}|${pickLine(g, `kitchen:${s}`, KT_DAY[s])}`;
}
/** The kitchen paragraph her scene shows ('' at stage 0). */
export function kitchenText(g) {
    const [kind, s, i] = String(g.flags.mother_kitchen || '').split('|');
    if (kind === 'up') return KT_UP[s] || '';
    if (kind === 'rt') return KT_RETURN[s] || '';
    if (kind === 'day') return KT_DAY[s]?.[Number(i)] || '';
    return '';
}

/** PS: the pot's result line from the village's 90, by the place's day; null below it (the caller keeps its old line). */
export function potLine(g, where) {
    if (relF(g, 'Village') < POT_GATE) return null;
    const i = where === 'ashfall' ? ((g.flags.vday || 1) >= 3 ? 1 : 0) : Math.max(1, Math.min(3, textDay(g) - 7)) - 1;
    return `${POT_LINE[where][i]}: +${POT_SAT} satiety.`;
}

export const POT_HUBS = { ashfall: { scene: 'pot_cook', flag: 'pot_cook', daily: 'pot', t: 'ashfall' }, fo_ashfall: { scene: 'fo_pot_cook', flag: 'fo_pot_cook', daily: 'a1_pot', t: 'fo' } };
/** The cook card shows: not cooked this Coil, the village's 90, 09:00–14:59, the pot not yet used today. */
export const potCookOpen = (g, hub) => {
    const c = POT_HUBS[hub];
    return !g.flags[c.flag] && relF(g, 'Village') >= POT_GATE && hour(g) >= POT_FROM && hour(g) < POT_UNTIL && daily(c.daily)(g);
};

function cookScene(hub) {
    const c = POT_HUBS[hub], T = POT_COOK[c.t];
    return {
        id: c.scene, title: 'The Communal Pot', art: 'village', place: 'Ashfall Hamlet — the communal pot',
        enter: (g) => { g.flags[c.flag] = true; return []; },
        text: () => T.text,
        choices: [{
            text: T.go, time: POT_COOK_MIN,
            do: (g) => { markDaily(g, c.daily); eat(g, POT_SAT); if (POT_MOTHER[hub]) bumpRel(g, 'Mother', POT_MOTHER[hub], 0); bumpRel(g, 'Village', POT_VILLAGE, 0); return [`${T.result}: +${POT_SAT} satiety.`]; },
            to: hub,
        }],
    };
}
export const SCENES_KITCHEN = { pot_cook: cookScene('ashfall'), fo_pot_cook: cookScene('fo_ashfall') };
