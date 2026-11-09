// v0.11.96 (owner pick BT1, N + S): the smart bot's move in a fight, one rule for every bot that fights smart (the tasks,
// story and part tests, the models, the fight lab's "smart" tactic, tools/snap.mjs). Before it, each played "the needle
// every third round, else the blade, else darts", which lost to "the blade every round" (the fight lab: 67.0 against
// 71.2% of 5,553 fight states); this rule won 71.8%. Tool code only: no game file imports it.
import { COMBAT_ACTIONS, actionCost, jamesHpMax } from '../../js/core/game.js';
import { actionOpen, fragileKnife, fightStyle } from '../../js/core/forms.js';

/** The share of James's max HP at or under which the bot raises the Qi shield (S). */
export const SMART_SHIELD_AT = 0.35;
const cost = (g, id) => actionCost(g, COMBAT_ACTIONS[id]);

/**
 * The smart move (`t`, the round counter, is kept for the callers; the rule doesn't use it):
 * in a brawl a strike (fists cost no Qi; as before, when every move became one); the spike field once while Qi ≥ 6 (a margin over its cost, 4 at T1; kept from the old rule); the Qi shield at or under 35% HP while a foe will still strike this round (S);
 * then (N) the spear if James can sing it, else the blade (free once formed, unless it is the fragile knife), darts when
 * the blade can't be paid, else guard. Never the needle or the Qi blast (measured: no gain; the blast is checked on
 * Convergence). In a spar or a brawl the game turns a move that isn't open there into its own (`fightAction`).
 */
export function smartAction(g, t = 0) { // eslint-disable-line no-unused-vars
    const c = g.combat, qi = g.james.qi;
    if (fightStyle(g) === 'unarmed') return 'strike';
    const living = c.enemies.filter((e) => e.hp > 0);
    if (actionOpen(g, 'spikes') && !c.fieldUsed && qi >= 6) return 'spikes';
    if (actionOpen(g, 'qshield') && g.james.hp <= SMART_SHIELD_AT * jamesHpMax(g) && qi >= cost(g, 'qshield')
        && living.some((e) => !e.staggered && !e.atBay)) return 'qshield';
    if (actionOpen(g, 'spear') && (c.spearFormed || qi >= cost(g, 'spear'))) return 'spear';
    if ((c.bladeFormed && !fragileKnife(g)) || qi >= cost(g, 'blade')) return 'blade';
    if (actionOpen(g, 'dart') && qi >= cost(g, 'dart')) return 'dart';
    return 'guard';
}
