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
import { daily, markDaily, hour, spacedFree, dayKey } from './common.js';
import { pickLine, textDay, linesOf } from '../core/lines.js';
import { storyDayOf } from '../core/calendar.js'; // v0.11.203 (owner pick T1, TS1): the Fallout's story day in the long calendar
import { KT_LABEL, KT_UP, KT_DAY, KT_RETURN, POT_LINE, POT_COOK, POT_AGAIN } from './kitchen_texts.js';

export { KT_LABEL, KT_UP, KT_DAY, KT_RETURN, POT_LINE, POT_COOK, POT_AGAIN };
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
    const i = where === 'ashfall' ? ((g.flags.vday || 1) >= 3 ? 1 : 0) : Math.max(1, Math.min(3, storyDayOf(g, textDay(g)) - 7)) - 1;
    return `${POT_LINE[where][i]}: +${POT_SAT} satiety.`;
}

/* v0.11.218 (owner pick CK1 = RF3 + G1 + TX3, 2026-11-18 01:01; the owner 00:57: "cooking with the village women should be a
 * regular occasion"): on the long calendar the cook card opens every SPACE_DAYS-th day of the stay (common.js S3, the keys `cook`
 * and `a1_cook`), not once a Coil; the plan's row repeats (week.js DOOR_KEY). G1: the gains (Village +3, Mother +2 in the Fallout's)
 * on the first cook a Coil only; every cook gives the meal (+25 satiety, the pot closed for the day). TX3: the first cook a Coil
 * keeps its scene (POT_COOK); each later one shows one of three repeat scenes (POT_AGAIN, texts by Fable, rule 10), drawn by the line
 * picker after each cook (`<flag>_next`, so the card's label and its scene agree; never the same twice running), the one shown kept
 * in `<flag>_v` (-1 the first). World flags: they reset with the Coil. */
export const POT_HUBS = { ashfall: { scene: 'pot_cook', flag: 'pot_cook', daily: 'pot', key: 'cook', t: 'ashfall' }, fo_ashfall: { scene: 'fo_pot_cook', flag: 'fo_pot_cook', daily: 'a1_pot', key: 'a1_cook', t: 'fo' } };
/** CK1 (RF3): the cook not yet taken: its spacing (every 3rd day of a stay). */
const cookFree = (g, c) => spacedFree(g, c.key, dayKey(g));
/** The cook card shows: not cooked (CK1: cookFree), the village's 90, 09:00–14:59, the pot not yet used today. */
export const potCookOpen = (g, hub) => {
    const c = POT_HUBS[hub];
    return cookFree(g, c) && relF(g, 'Village') >= POT_GATE && hour(g) >= POT_FROM && hour(g) < POT_UNTIL && daily(c.daily)(g);
};

/** v0.11.218 (RV1, HA): is the cook's row on this stay's week plan at 1? Set by week.js (which imports this file, not the reverse). */
export const COOK_PLAN = { row: (g, scene) => false };
/** v0.11.217 (owner pick PC1, CG; 2026-11-18 01:01): the cook card can still show today (not cooked, the village's 90, before 15:00,
 *  the pot not yet used today): the day's routine leaves the pot for it (tasks.js dayMeal). v0.11.218 (owner pick RV1, HA; the
 *  review's H1: a repeat skipped left the card open every day after, so the hold kept the pot from the routine for the rest of the
 *  stay, 2 pot meals a week instead of 7): on the long calendar after the Coil's first cook, only while the plan's cook row is 1. */
export const potCookDue = (g, hub) => {
    const c = POT_HUBS[hub];
    return !!c && cookFree(g, c) && (!g.flags[c.flag] || COOK_PLAN.row(g, c.scene)) && relF(g, 'Village') >= POT_GATE && hour(g) < POT_UNTIL && daily(c.daily)(g);
};

/** CK1 (TX3): the repeat drawn for the next cook (an old save's, or a hand-edited value: the first). */
const nextAgain = (g, c) => { const v = g.flags[`${c.flag}_next`]; return Number.isInteger(v) && v >= 0 && v < POT_AGAIN[c.t].length ? v : 0; };
/** CK1 (TX3): which text the cook card shows now: -1 the first-time scene (not cooked this Coil), else a repeat. */
export const cookVariant = (g, hub) => { const c = POT_HUBS[hub]; return !g.flags[c.flag] ? -1 : nextAgain(g, c); };
/** The cook's texts { label, text, go, result } for variant `v` (-1 the first). */
export const cookTexts = (hub, v) => { const c = POT_HUBS[hub]; return v >= 0 && v < POT_AGAIN[c.t].length ? POT_AGAIN[c.t][v] : POT_COOK[c.t]; };
/** The card's label now. */
export const cookLabel = (g, hub) => cookTexts(hub, cookVariant(g, hub)).label;
/** The scene's variant, as `enter` kept it (a save from before: the first). */
const shown = (g, c) => { const v = g.flags[`${c.flag}_v`]; return Number.isInteger(v) && v < POT_AGAIN[c.t].length ? v : -1; }; // RV1 (L5): out of range → the first, text and gains alike
/** RV1 (M1): a repeat shown without a draw (an old save's first, repeat 0) counted as the pool's last play, so the next draw differs. */
function countShown(g, c, v) {
    const L = linesOf(g), pool = `cook_${c.t}`, n = POT_AGAIN[c.t].length;
    if (v < 0 || L.last[pool] != null) return;
    const p = Array.isArray(L.p[pool]) && L.p[pool].length === n ? L.p[pool] : (L.p[pool] = Array.from({ length: n }, () => 0));
    p[v] = (Number(p[v]) || 0) + 1;
    L.last[pool] = v;
}

function cookScene(hub) {
    const c = POT_HUBS[hub];
    return {
        id: c.scene, title: 'The Communal Pot', art: 'village', place: 'Ashfall Hamlet — the communal pot',
        enter: (g) => {
            g.flags[`${c.flag}_v`] = cookVariant(g, hub); markDaily(g, c.key); // CK1
            g.flags[c.flag] = true;
            return [];
        },
        text: (g) => cookTexts(hub, shown(g, c)).text,
        choices: [{
            text: (g) => cookTexts(hub, shown(g, c)).go, time: POT_COOK_MIN,
            do: (g) => {
                const T = cookTexts(hub, shown(g, c));
                markDaily(g, c.daily); eat(g, POT_SAT);
                if (shown(g, c) < 0) { if (POT_MOTHER[hub]) bumpRel(g, 'Mother', POT_MOTHER[hub], 0); bumpRel(g, 'Village', POT_VILLAGE, 0); } // G1: the first cook a Coil
                countShown(g, c, shown(g, c)); g.flags[`${c.flag}_next`] = pickLine(g, `cook_${c.t}`, POT_AGAIN[c.t]); // TX3: the next cook's repeat
                return [`${T.result}: +${POT_SAT} satiety.`];
            },
            to: hub,
        }],
    };
}
export const SCENES_KITCHEN = { pot_cook: cookScene('ashfall'), fo_pot_cook: cookScene('fo_ashfall') };
