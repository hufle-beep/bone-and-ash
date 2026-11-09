// v0.11.96 (owner pick BT1, N + S): the smart bot's move in a fight, one rule for every bot that fights smart (the tasks,
// story and part tests, the models, the fight lab's "smart" tactic, tools/snap.mjs). Before it, each played "the needle
// every third round, else the blade, else darts", which lost to "the blade every round" (the fight lab: 67.0 against
// 71.2% of 5,553 fight states); this rule won 71.8% (v0.11.96; with v0.11.97's reserve 73.1% of 6,242; with v0.11.98's
// no shield on the fragile knife 73.2% of 6,259, against 72.9% on the same states). Tool code only: no game file imports it.
import { COMBAT_ACTIONS, actionCost, jamesHpMax } from '../../js/core/game.js';
import { actionOpen, fragileKnife, fightStyle } from '../../js/core/forms.js';

/** The share of James's max HP at or under which the bot raises the Qi shield (S). */
export const SMART_SHIELD_AT = 0.35;
const cost = (g, id) => actionCost(g, COMBAT_ACTIONS[id]);

/**
 * v0.11.97 (owner pick RQ1; Fable's review of v0.11.96, medium 1): the Qi an attack still needs after the field or the
 * shield: 0 when the spear or the blade is formed (and not the fragile knife, which breaks every swing), else the cheaper
 * of the blade and darts (when open); the spear costs what the blade costs, so it is covered too (a test pins it). Without it the bot could spend its last Qi on them and guard to the round cap.
 */
export function attackReserve(g) {
    const c = g.combat;
    if (c.spearFormed || (c.bladeFormed && !fragileKnife(g))) return 0;
    return Math.min(cost(g, 'blade'), actionOpen(g, 'dart') ? cost(g, 'dart') : Infinity);
}

/**
 * The smart move (`t`, the round counter, is kept for the callers; the rule doesn't use it):
 * in a brawl a strike (fists cost no Qi; as before, when every move became one); the spike field once while Qi ≥ 6 (kept from the old rule); the Qi shield at or under 35% HP while a foe will still strike this round (S); both only when Qi still pays for an attack after them (`attackReserve`, v0.11.97);
 * no Qi shield while the knife is fragile (below T1 L8, where the spear isn't open either; v0.11.98, owner pick KR1, NS:
 * Fable's review of v0.11.97, medium 2: the reserve paid one swing, then the bot could guard to the cap; from T1 L8 the
 * shield still comes before a formed weapon, so with some Qi it can still end on guard: Fable's review of v0.11.98, medium 1, open);
 * then (N) the spear if James can sing it, else the blade (free once formed, unless it is the fragile knife), darts when
 * the blade can't be paid, else guard. Never the needle or the Qi blast (measured: no gain; the blast is checked on
 * Convergence). In a spar or a brawl the game turns a move that isn't open there into its own (`fightAction`).
 */
export function smartAction(g, t = 0) { // eslint-disable-line no-unused-vars
    const c = g.combat, qi = g.james.qi;
    if (fightStyle(g) === 'unarmed') return 'strike';
    const living = c.enemies.filter((e) => e.hp > 0);
    const atk = attackReserve(g); // v0.11.97 (RQ1): the field and the shield only when an attack can still be paid after them
    if (actionOpen(g, 'spikes') && !c.fieldUsed && qi >= 6 && qi >= cost(g, 'spikes') + atk) return 'spikes';
    if (!fragileKnife(g) && actionOpen(g, 'qshield') && g.james.hp <= SMART_SHIELD_AT * jamesHpMax(g) && qi >= cost(g, 'qshield') + atk
        && living.some((e) => !e.staggered && !e.atBay)) return 'qshield';
    if (actionOpen(g, 'spear') && (c.spearFormed || qi >= cost(g, 'spear'))) return 'spear';
    if ((c.bladeFormed && !fragileKnife(g)) || qi >= cost(g, 'blade')) return 'blade';
    if (actionOpen(g, 'dart') && qi >= cost(g, 'dart')) return 'dart';
    return 'guard';
}
