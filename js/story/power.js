/**
 * Power gap, Long Forest scaling with a ceiling, and the "stomp" texts.
 *
 * DEGREE (how badly the enemy is outclassed), measured when a fight starts:
 *   jp  = max(GU check, Convergence Use check) + 0.3 × realm        (James's power)
 *   ep  = for the strongest enemy, max(DC, attack − 1)              (their power)
 *   gap = jp − ep  →  1 "beaten" (gap < 1)   2 "outclassed" (1 ≤ gap < 4)   3 "roflstomp" (gap ≥ 4)
 *   Degree 1 shows each fight's original texts. Degrees 2 and 3 use STOMP texts when a fight has them.
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
import { skillCheck, combatHooks } from '../core/game.js';

export const DC_CAP = 7;
export const ATK_CAP = 9;
export const STOMP = {};
export const registerStomp = (table) => Object.assign(STOMP, table);

export const jamesPower = (g) => Math.max(skillCheck(g.james.gu), skillCheck(g.james.skills['Convergence Use'])) + 0.3 * (g.james.realm || 0);
export const enemyPower = (enemies) => Math.max(...enemies.map((e) => Math.max(e.dc || 0, (e.atk || 0) - 1)));
export function degreeOf(g, enemies) {
    const gap = jamesPower(g) - enemyPower(enemies);
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
    const enemies = lfScale(g, enc.enemies);
    const degree = degreeOf(g, enemies);
    const st = STOMP[enc.id];
    const keepTail = enc.intro?.includes('Ashfall does not kneel') ? ' Behind you, Ashfall does not kneel.' : '';
    const intro = st?.posture ? st.posture(g, degree) + keepTail : enc.intro;
    return { ...enc, enemies, degree, intro, _prepared: true };
}
combatHooks.before = prepare;

/** For the scene runner: the degree a combat choice would start at. */
export const degreeForChoice = (g, combat) => prepare(g, combat(g)).degree;
