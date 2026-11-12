// v0.11.142 (owner pick CV1; the owner 2026-11-12 13:19: "my point is to use the freed time (not including the evening
// waits, that is ok) for manual cultivation, opening meridians and Qi condensation"): the Cultivator bot model's spare time
// (tests/models.test.mjs). Its own file so the tools test can check the rule without playing the models.
import { clockParts } from '../../js/core/game.js';

/** Spare time: 05:00 to 17:59 (before the evening's fixed waits). Gather Qi: up to 6 hours a waking day, or any time Qi is under 10. */
export const SPARE_FROM = 5, SPARE_UNTIL = 18, SPARE_QI_HOURS = 6, SPARE_QI_MIN = 10, SPARE_SAT_MAX = 95, SPARE_FED_MIN = 30;

/**
 * What the Cultivator queues once a task screen's cards for the day are done (the completionist's plan came back empty):
 * a sit (Qi ≥ 10, Saturation < 95; the screen's own Cultivate chore counts), else a meridian session (Qi ≥ 10), else
 * "Meditate: gather Qi" (Fed over 30); null = take the story, as the completionist. `day`: the waking day's key
 * (models.test.mjs's dayKey), for the gather-Qi hours, counted in mem.qi.
 */
export function sparePlan(g, cards, mem, day) {
    const hh = clockParts(g.minutes).hh;
    if (hh >= SPARE_UNTIL || hh < SPARE_FROM) return null;
    const open = cards.filter((c) => c.status === 'open');
    const sit = open.find((c) => c.kind === 'sit' || (c.kind === 'chore' && /^(Cultivate|Condense)/.test(c.label)));
    if (sit && g.james.qi >= SPARE_QI_MIN && g.james.saturation < SPARE_SAT_MAX) return [sit.id];
    const mer = open.find((c) => c.kind === 'mer');
    if (mer && g.james.qi >= SPARE_QI_MIN) return [mer.id];
    const qi = open.find((c) => c.kind === 'qi');
    const dk = `qi@${day}`; mem.qi = mem.qi || {};
    if (qi && ((mem.qi[dk] || 0) < SPARE_QI_HOURS || g.james.qi < SPARE_QI_MIN) && g.james.satiety > SPARE_FED_MIN) { mem.qi[dk] = (mem.qi[dk] || 0) + 1; return [qi.id]; }
    return null;
}
