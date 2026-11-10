// v0.11.96 (owner pick BT1, N + S): the smart bot's move in a fight, one rule for every bot that fights smart (the tasks,
// story and part tests, the models, the fight lab's "smart" tactic, tools/snap.mjs). Before it, each played "the needle
// every third round, else the blade, else darts", which lost to "the blade every round" (the fight lab: 67.0 against
// 71.2% of 5,553 fight states); this rule won 71.8% (v0.11.96; with v0.11.97's reserve 73.1% of 6,242; with v0.11.98's
// no shield on the fragile knife 73.2% of 6,259, against 72.9% on the same states). Tool code only: no game file imports it.
import { COMBAT_ACTIONS, actionCost, jamesHpMax, airStrike, bigBlowDue, moodOf } from '../../js/core/game.js';
import { actionOpen, fragileKnife, fightStyle } from '../../js/core/forms.js';

/** The share of James's max HP at or under which the bot raises the Qi shield (S). */
export const SMART_SHIELD_AT = 0.35;
const cost = (g, id) => actionCost(g, COMBAT_ACTIONS[id]);

/**
 * v0.11.97 (owner pick RQ1; Fable's review of v0.11.96, medium 1): the Qi an attack still needs after the field or the
 * shield: 0 when the spear or the blade is formed (and not the fragile knife, which shatters after its few swings; v0.11.110,
 * GD1 review low: its swings left are free, but the reserve still counts a new one, and the spike field's 6-Qi gate leaves no state where that changes the pick), else the cheaper
 * of the blade and darts (when open); the spear costs what the blade costs, so it is covered too (a test pins it). Without it the bot could spend its last Qi on them and guard to the round cap.
 */
export function attackReserve(g) {
    const c = g.combat;
    if (c.spearFormed || c.flailFormed || (c.bladeFormed && !fragileKnife(g))) return 0; // v0.11.107 (NK1): a sung flail is a paid attack too
    return Math.min(cost(g, 'blade'), actionOpen(g, 'dart') ? cost(g, 'dart') : Infinity);
}

/**
 * The smart move (`t`, the round counter, is kept for the callers; the rule doesn't use it):
 * in a brawl a strike (fists cost no Qi; as before, when every move became one); the spike field once while Qi ≥ 6 (kept from the old rule); the Qi shield at or under 35% HP while a foe will still strike this round (S); both only when Qi still pays for an attack after them (`attackReserve`, v0.11.97);
 * no Qi shield while the knife is fragile (below T1 L8, where the spear isn't open either; v0.11.98, owner pick KR1, NS:
 * Fable's review of v0.11.97, medium 2: the reserve paid one swing, then the bot could guard to the cap); since v0.11.100
 * (owner pick SB1, M; Fable's review of v0.11.98, medium 1) the shield only once a weapon is formed (the spear, or a knife
 * that holds), so its attack is already paid and the reserve binds the field alone (lab: 0 of 6,461 fights changed);
 * then (v0.11.107, owner pick NK1, FL) the bone flail while two or more foes stand (sung, or Qi for it), then (N) the spear if James can sing it (since v0.11.110, FB1, not paid for while a holding blade is out), else the blade (free once formed; since v0.11.110 (GD1, KN) the fragile knife's swings left too), a sung flail
 * (free), darts when the blade can't be paid, else guard. Never the needle or the Qi blast (v0.11.96: the blast for every swing measured no gain;
 * v0.11.102, owner pick QB1: the blast in place of the fragile knife against an armoured foe does gain, lab 72.3 → 73.4% at
 * the old +1 and 74.9% at QB1's 0, but it moves the bots' numbers a lot (14 moves past 5 points, 2 past 20 with QB1), so it
 * waits for the retune: roadmap section 2). In a spar or a brawl the game turns a move that isn't open there into its own (`fightAction`).
 */
export function smartAction(g, t = 0) { // eslint-disable-line no-unused-vars
    const c = g.combat, qi = g.james.qi;
    if (fightStyle(g) === 'unarmed') return 'strike';
    // v0.11.113 (owner pick DA1, TL): a big blow shown for this round is answered (unless darts from the air already keep it off):
    // the spear when it is formed and on that foe (its hold stops it), else guard (avoids it outright). Lab: smart 81.5 → 81.6%.
    // DB1 (S; Fable's review, mediums 3 and 4): two big blows due, or a heavy flyer (the air doesn't keep it off): guard (0 fights today)
    const bigs = c.enemies.filter((e) => bigBlowDue(c, e) && !e.staggered && !e.atBay);
    const airDart = airStrike(g, 'dart') && actionOpen(g, 'dart') && qi >= cost(g, 'dart') && !bigs.some((e) => e.flies);
    if (!airDart && bigs.length) return bigs.length === 1 && c.spearFormed && c.enemies.filter((e) => e.hp > 0)[0] === bigs[0] ? 'spear' : 'guard';
    // DA1 (HD): on a foe's hungry round James's hits would feed it: guard (before the air, as measured)
    if (c.enemies.some((e) => e.hp > 0 && moodOf(c, e) === 'hungry')) return 'guard';
    // v0.11.112 (owner pick FF1, TD): from Foundation, darts from the air while a foe that doesn't fly stands (it can't reach him that round).
    // AF1, R (Fable's review, medium 1; kept as picked): below T3 darts lose to armour, so a raw-stat bench case (two root-lurkers, dr 1, T1 L6)
    // loses; in the bots' own Foundation+ fights 0 of 3,791 wins turn into losses (275 losses into wins).
    if (airStrike(g, 'dart') && actionOpen(g, 'dart') && qi >= cost(g, 'dart')) return 'dart';
    const living = c.enemies.filter((e) => e.hp > 0);
    const atk = attackReserve(g); // v0.11.97 (RQ1): the field and the shield only when an attack can still be paid after them
    if (actionOpen(g, 'spikes') && !c.fieldUsed && qi >= 6 && qi >= cost(g, 'spikes') + atk) return 'spikes';
    const formed = c.spearFormed || c.flailFormed || (c.bladeFormed && !fragileKnife(g)); // v0.11.100 (SB1, M): the shield waits for a formed weapon; v0.11.107: the flail too
    if (formed && actionOpen(g, 'qshield') && g.james.hp <= SMART_SHIELD_AT * jamesHpMax(g) && qi >= cost(g, 'qshield') + atk
        && living.some((e) => !e.staggered && !e.atBay)) return 'qshield';
    // v0.11.107 (NK1, FL): two or more foes standing. v0.11.110 (owner pick GD1, FO; Fable's NK1 review, medium 1): an
    // unsung flail is paid for only while no spear or holding blade is already formed (a formed one is free); unreachable
    // in play today (0 of 26,906 bot fights), a test builds the case.
    const freeFormed = c.spearFormed || (c.bladeFormed && !fragileKnife(g));
    if (actionOpen(g, 'flail') && living.length >= 2 && (c.flailFormed || (!freeFormed && qi >= cost(g, 'flail')))) return 'flail';
    // v0.11.110 (owner pick FB1, BS; Fable's GD1 review, medium 1): a holding blade already out swings free before a spear is paid for (0 bot fights reach it)
    if (actionOpen(g, 'spear') && (c.spearFormed || (!(c.bladeFormed && !fragileKnife(g)) && qi >= cost(g, 'spear')))) return 'spear';
    // v0.11.110 (owner pick GD1, KN): a formed fragile knife's swings left are free, so it swings them out before darts or guard
    if (c.bladeFormed || qi >= cost(g, 'blade')) return 'blade';
    if (c.flailFormed && actionOpen(g, 'flail')) return 'flail'; // v0.11.107: a sung flail is free on the last foe too
    if (actionOpen(g, 'dart') && qi >= cost(g, 'dart')) return 'dart';
    return 'guard';
}
