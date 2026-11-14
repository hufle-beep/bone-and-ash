/**
 * Power gap, Long Forest scaling with a ceiling, and the "stomp" texts.
 *
 * DEGREE (how badly the enemy is outclassed), measured when a fight starts:
 *   jp  = GU check + 0.3 × realm                                     (James's power)
 *   (v0.11.101, owner pick DG1: GU alone, as every strike and the defence read it; it was max(GU, Convergence Use),
 *    the same number in play, since every Convergence award gives GU the same XP, so GU is never behind)
 *   ep  = for the strongest enemy, max(DC, attack − 1)              (their power)
 *   (v0.11.40, E1: in Incremental Mode ep includes the fight's no-dice raise, noDiceUp: the fight as it will be fought;
 *    v0.11.100, owner pick SB1, E: and the no-dice shift, −NO_DICE_DC_SHIFT, that every combat check takes off the DC)
 *   gap = jp − ep  →  1 "beaten" (gap < 1)   2 "outclassed" (1 ≤ gap < 4)   3 "roflstomp" (gap ≥ 4)
 *   A fight with STOMP texts opens with its posture at every degree (its degree-1 branch at degree 1); its own `intro` shows
 *   only for a fight without a posture (v0.11.174, RV1 L10: the comment said degree 1 showed the original texts; the code never did).
 *   Degrees 2 and 3 also use the STOMP win texts.
 *   Degree 3 also offers "End it in one move." (skips the combat screen).
 *
 * LONG FOREST SCALING (g.flags.longforest): enemies grow with James's actual checks, but only up to a ceiling
 * (DC_CAP, ATK_CAP — about a fully trained Act 1 James). Past the ceiling they stop growing: a massacre.
 * Normal runs are untouched (their day-based and Act 1 tuning stays as it was).
 *
 * STOMP texts (registered by js/story/stomp_*.js and longforest.js):
 *   STOMP[encounterId] = {
 *     posture: (g, degree) => string   // replaces the combat intro: the enemy postures (locals think James is a
 *                                      // mortal — they can't sense his cultivation); James's dry aside can vary by degree
 *     win: { 2: (g) => string, 3: (g) => string }  // full replacement text of the win scene at degree 2 / 3; must keep
 *                                      // every story fact of the original win scene (the same choices follow)
 *     one: (g) => string               // the one-move finish, shown in the result panel (degree 3 only)
 *   }
 * James never kills humans: he knocks them out and very nearly cripples them. Beaten humans grovel or swear revenge.
 */
import { skillCheck, combatHooks, noDiceUp, NO_DICE_DC_SHIFT } from '../core/game.js';
import { HP_TUNE } from './fight_tune.js';

/** Cultivators' realms (for the realm-gap rule; everyone else is realm 0). Locals can't sense James; he can sense them. */
export const ENEMY_REALM = { 'Outer Elder Shen Qiu': 2, 'Gao Feng': 1, 'Lu Han': 1, 'Fang Wei, Outer Disciple (lapsed)': 1, 'Sect watcher': 1 };
/** The skill ceiling (T10 L10 = check 50) applies to enemies too. */
export const ENEMY_CAP = 50;
export const DC_CAP = 7;
export const ATK_CAP = 9;
export const STOMP = {};
export const registerStomp = (table) => Object.assign(STOMP, table);

/** v0.11.101 (DG1): GU alone (the fists' own reading since v0.11.82 is now every fight's). */
export const jamesPower = (g) => skillCheck(g.james.gu) + 0.3 * (g.james.realm || 0);
export const enemyPower = (enemies) => Math.max(...enemies.map((e) => Math.max(e.dc || 0, (e.atk || 0) - 1)));
/** v0.11.40 (E1): `up` is the fight's no-dice raise (noDiceUp), so the degree (and "End it in one move.") reads the fight as it will be fought. */
export function degreeOf(g, enemies, up = 0, power = jamesPower(g)) {
    const gap = power - (enemyPower(enemies) + up);
    return gap >= 4 ? 3 : gap >= 1 ? 2 : 1;
}

const half = (n) => Math.round(n * 2) / 2;
/** Long Forest: lift each enemy toward James (DC ≈ his GU + 1.5, attack ≈ his GU + 3), never past the caps. */
export function lfScale(g, enemies) {
    if (!g.flags.longforest) return enemies;
    const gu = skillCheck(g.james.gu);
    return enemies.map((e) => {
        const dc = Math.max(e.dc, Math.min(half(gu + 1.5), DC_CAP));
        const atk = Math.max(e.atk, Math.min(half(gu + 3), ATK_CAP));
        const lift = Math.max(0, dc - e.dc);
        return { ...e, dc, atk, hp: Math.round(e.hp * (1 + 0.12 * lift)) };
    });
}

/** The hook the combat engine calls on every encounter. */
export function prepare(g, enc) {
    if (enc._prepared) return enc;
    const f = HP_TUNE[enc.id] || 1;
    const tuned = f !== 1 ? enc.enemies.map((e) => ({ ...e, hp: Math.max(1, Math.round(e.hp * f)) })) : enc.enemies;
    const enemies = lfScale(g, tuned)
        .map((e) => (e.realm == null && ENEMY_REALM[e.name] != null ? { ...e, realm: ENEMY_REALM[e.name] } : e))
        // enemies share the T10 L10 ceiling: no defence or attack above a check of 50
        .map((e) => (e.dc > ENEMY_CAP || e.atk > ENEMY_CAP ? { ...e, dc: Math.min(e.dc, ENEMY_CAP), atk: Math.min(e.atk, ENEMY_CAP) } : e));
    const degree = degreeOf(g, enemies, noDiceUp(enc.id) - NO_DICE_DC_SHIFT); // v0.11.82: fists on GU alone; v0.11.101 (DG1): every fight
    const st = STOMP[enc.id];
    const keepTail = enc.intro?.includes('Ashfall does not kneel') ? ' Behind you, Ashfall does not kneel.' : '';
    const intro = (st?.posture ? st.posture(g, degree) + keepTail : enc.intro) + (enc.tail ? `\n\n${enc.tail}` : ''); // v0.11.82: a spar's or a brawl's tail (its terms, Yuki)
    return { ...enc, enemies, degree, intro, _prepared: true };
}
combatHooks.before = prepare;

/** For the scene runner: the degree a combat choice would start at. */
export const degreeForChoice = (g, combat) => prepare(g, combat(g)).degree;
