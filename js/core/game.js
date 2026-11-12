/**
 * James RPG — game core. Same Qi rules as Rules Engine C (formulas.js is the engine's own file):
 * check = 0.5 × rank, XP cost = 50·k·T·L (k 0.5), Qi Max = 20 + Use check + open primaries + realm bonus,
 * Convergence ×1.25, HP = 20 + 2 × GU check (realm-filled), regen per Cycle (T1 = 30 min) 5% HP, 5% + 0.1 per
 * open collateral Qi. New for a game without a narrator: every check is value ÷ DC (no dice; value + d6 until v0.9.3 / v0.11.45).
 * Pure — no DOM. The UI (main.js) and the tests drive it.
 */
import { actionOpen, actionLabel, fragileKnife, knifeSwings, lineState, FORM_LINES, hasForm, fightStyle, cuRank } from './forms.js';
/** v0.11.4: how far along a form line James is (0 = its first form, −1 = none yet). */
const formStep = (g, line) => { const n = lineState(g, line).now; return n ? FORM_LINES[line].forms.findIndex((f) => f.id === n.id) : -1; };
import {
    checkFromTierLevel, skillXpCost, maxHp, qiPoolMax, qiRegenPercent, cycleTimeMinutes,
    realmBonus, realmStepLabel, CONDENSE_SIT_COST, FAIL_XP_FRACTION, realmDr, realmShockHpBonus, dampenMultiplier,
} from './formulas.js';

export const K = 0.5;
export const CONVERGENCE_MULTIPLIER = 1.25;
export const START_MINUTES = 6 * 60 + 40; // Day 1, 06:40
export const SATIETY_PER_HOUR = 3;
export const HUNGRY_AT = 30;
export const STARVE_HP_PER_HOUR = 1.5; // task mode (v0.10.0, owner pick b): 1.5 HP per starving hour; classic keeps its old rule
export const XP_BANDS = { routine: 0, standard: 30, challenging: 60, major: 120 };
export const SAVE_VERSION = 5; // 2 (v0.9.0): the task queue; 3 (v0.9.2): familiarity, adaptation, Yuki's lane; 4 (v0.9.4): the Coil; 5 (v0.9.6): the Coil's act

const node = (tier = 1, level = 1) => ({ tier, level, xp: 0 });

/**
 * A fresh game: James (40, fresh doctorate), Yuki, an empty hammerspace.
 * closed (v0.9.6, task mode): every primary and collateral starts closed (0/12, 0/66); classic games start open.
 */
export function newGame(seed = Date.now(), { closed = false } = {}) {
    const g = {
        v: SAVE_VERSION,
        seed: seed >>> 0,
        rng: seed >>> 0,
        scene: 'arrival',
        minutes: START_MINUTES,
        regenCarry: 0,
        location: 'Unknown forest',
        james: {
            name: 'James Green',
            gu: node(),
            skills: { 'Convergence Use': node() },
            realm: 0,
            saturation: 0,
            primaries: closed ? 0 : 12,
            collaterals: closed ? 0 : 66,
            colSealed: false,
            extra8: 0,
            extraCollaterals: 0,
            junctions: 0,
            hp: null,
            qi: null,
            satiety: 70,
            dr: 1, // Ouroboros Axiom
            injuries: [],
        },
        yuki: {
            name: 'Yuki',
            form: 'cat',
            realm: 0,
            primaries: closed ? 0 : 12,
            collaterals: closed ? 0 : 66,
            fight: node(),
            qiUse: node(),
            hp: null,
            qi: null,
        },
        inventory: {},
        flags: {},
        rel: {},
        log: [],
        stats: { checks: 0, wins: 0, kills: 0, meals: 0 },
        combat: null,
        tasks: { queue: [], fam: {}, adapt: {}, yuki: { on: false, progress: 0 } },
    };
    g.coil = makeCoil(g);
    g.seen = { [g.scene]: 1 }; // v0.11.35 (P1-a): the start scene, first read on Coil 1
    g.read = {}; // v0.11.133 (FP2): the paragraphs read (again.js noteRead); the screen records what it shows
    return g;
}

/* ---------------- the Coil (v0.9.4, step 3c-1) ---------------- */

/** A copy of the state to rewind to: the act's first dawn (a new game), or an old save as it was loaded. */
export function coilSnap(g) {
    const s = JSON.parse(JSON.stringify({ ...g, coil: undefined }));
    delete s.coil;
    s.log = []; s.combat = null; s.lastWin = null;
    if (s.tasks) s.tasks.queue = [];
    delete s.read; // v0.11.133 (RF1, L1): a rewind takes the record from the game itself (coil.js), never from the snapshot
    delete s.lines; // v0.11.134 (LP2): the line picker's record is per Coil (js/core/lines.js); a rewind starts a new one
    return s;
}
/** What James is at the start of a Coil (the Coil screen compares against it). */
export function coilStart(g) {
    const tl = (n) => [n.tier, n.level];
    return { realm: g.james.realm, gu: tl(g.james.gu), cu: tl(g.james.skills['Convergence Use']), yf: tl(g.yuki.fight), fam: { ...(g.tasks?.fam || {}) } };
}
/** act: 0 the prologue (rewinds to Day 1 dawn), 1 Act 1 (rewinds to Day 8 dawn, v0.9.6). */
export function makeCoil(g, act = 0) {
    const peak = {};
    for (const [who, r] of Object.entries(g.rel || {})) peak[who] = { f: r.f, a: r.a };
    return { act, n: 1, snap: coilSnap(g), start: coilStart(g), peak, why: null, back: null, known: [], skipEnter: false, one: true }; // v0.11.26: one count per save (`one`), no "same days again"
}
/** Act 1 begins (v0.9.6): a new Coil whose rewind point is this moment (Day 8 dawn, the prologue's outcome kept). */
export function startActCoil(g, act = 1) {
    const old = g.coil;
    g.coil = makeCoil(g, act);
    g.coil.wake = g.scene;
    if (old) { g.coil.n = old.n || 1; g.coil.known = [...(old.known || [])]; g.stats[`coils${old.act || 0}`] = old.n; // v0.11.26 (owner 11:12, N1): crossing into Act 1 continues the Coil (one count per save)
        if (old.best) g.coil.best = JSON.parse(JSON.stringify(old.best));
        if (old.free) g.coil.free = old.free; } // v0.11.86 (#53): the Coils ended by choice carry into Act 1 // v0.11.16: best-ever relationships carry into Act 1
}
/** Is a state in Act 1? (Act 1 starts on Day 8 06:00, after the tribute's outcome and the epilogue.) */
export const inAct1 = (g) => !!g.flags?.ending && g.scene !== 'epilogue' && g.minutes >= 7 * 1440 + 6 * 60;

/* ---------------- numbers ---------------- */

export const skillCheck = (n) => checkFromTierLevel(n.tier, n.level);
export const xpToNext = (n) => skillXpCost(K, n.tier, n.level);

/**
 * Realm toughness (v0.8.1, Gábor's option C with the engine DR). The HP limit stays (60 by Immortal Ascension).
 *   HP regen % per Cycle (out of fights) by realm: MV 5, +1 per realm to Soul Embryo 11, NS 15, ST 20, IA 30, Mahayana 50,
 *   Earth Immortal+ 100 (full every Cycle).
 *   DR = Ouroboros 1 + engine realm DR (Immortal Ascension 2, then ×2 a realm … Heavenly Immortal 64). Yuki: realm DR.
 *   In fights, from Immortal Ascension: heal the engine's shock bonus (2, 4, 8 …) every round, James and Yuki.
 *   Realm gap (from Nascent Soul): damage from an enemy below your realm is halved per realm of difference; from
 *   Earth Immortal, anyone two or more realms below does nothing. Enemies are realm 0 unless tagged (power.js).
 */
export const HP_REGEN = [5, 6, 7, 8, 9, 10, 11, 15, 20, 30, 50, 100, 100, 100, 100];
export const hpRegenPct = (realm) => HP_REGEN[Math.max(0, Math.min(HP_REGEN.length - 1, realm || 0))];
export const jamesDr = (g) => (g.james.dr || 0) + realmDr(g.james.realm || 0) + armourDr(g);
export const yukiDr = (g) => realmDr(g.yuki.realm || 0);
/** Damage after the realm gap and DR. */
export function hitDamage(dmg, enemyRealm, realm, dr) {
    let f = 1;
    const gap = (realm || 0) - (enemyRealm || 0);
    if ((realm || 0) >= 7 && gap > 0) f = (realm >= 11 && gap >= 2) ? 0 : 0.5 ** gap;
    return Math.max(0, Math.floor(dmg * f - dr));
}
export function jamesHpMax(g) {
    return maxHp({ body: skillCheck(g.james.gu), realmIndex: g.james.realm });
}
/**
 * The extra meridians (v0.8): Extraordinary 8 (Golden Core → Soul Embryo since v0.11.66, Foundation before; closes at Nascent Soul), their 28 collaterals
 * (after the 8, the same window since v0.11.46; opened in pairs since v0.11.66; closes at Nascent Soul) and 10 junctions (Nascent Soul+). Gábor 2026-11-02: each raises the Qi regen percentage per Cycle — Extraordinary
 * +0.5, collateral +0.1 (engine), junction +0.3 (all 46: +9.8 points). Yuki opens the same ones through the bond.
 * Old saves: all 0.
 */
export const extraMeridians = (g) => ({ extra8: g.james.extra8 || 0, extraCollaterals: g.james.extraCollaterals || 0, junctions: g.james.junctions || 0 });
export function extraRegen(g) {
    const m = extraMeridians(g);
    return Math.round((0.5 * m.extra8 + 0.1 * m.extraCollaterals + 0.3 * m.junctions) * 10) / 10;
}
/** Qi regen % per Cycle: 5 + 0.1 per collateral (66) + the extra meridians. */
export const qiRegenPct = (g, collaterals) => Math.round((qiRegenPercent({ openedCollaterals: collaterals }) + extraRegen(g)) * 10) / 10;
export function jamesQiMax(g) {
    const base = qiPoolMax({ useCheck: skillCheck(g.james.skills['Convergence Use']), openedPrimaries: g.james.primaries, realmBonusValue: realmBonus(g.james.realm) });
    return Math.round(base * CONVERGENCE_MULTIPLIER * 2) / 2;
}
export function yukiHpMax(g) {
    return maxHp({ body: 5, realmIndex: g.yuki.realm });
}
export function yukiQiMax(g) {
    return qiPoolMax({ useCheck: skillCheck(g.yuki.qiUse), openedPrimaries: g.yuki.primaries, realmBonusValue: realmBonus(g.yuki.realm) });
}
export function ensureBars(g) {
    const fix = (o, key, max) => { if (o[key] == null || o[key] > max) o[key] = max; if (o[key] < 0) o[key] = 0; };
    fix(g.james, 'hp', jamesHpMax(g));
    fix(g.james, 'qi', jamesQiMax(g));
    fix(g.yuki, 'hp', yukiHpMax(g));
    fix(g.yuki, 'qi', yukiQiMax(g));
    g.james.satiety = Math.max(0, Math.min(100, g.james.satiety));
    return g;
}
export const realmName = (i) => realmStepLabel(i);

/* ---------------- the save's random numbers ---------------- */

/** v0.11.118 (owner pick YK1, D8): a d8 from the same stream as d6 (Yuki's haul on her job). */
export function d8(g) {
    let x = g.rng || 1;
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    g.rng = x;
    return (x % 8) + 1;
}
/** Deterministic d6 from the save's own seed (a reload does not reroll). Since v0.11.45 no check or fight rolls it (no dice
 *  anywhere); the story still uses it for random events (night visitors, the far trail, Yuki's lone hunt…). */
export function d6(g) {
    let x = g.rng || 1;
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    g.rng = x;
    return (x % 6) + 1;
}

/* ---------------- skills and XP ---------------- */

export function getSkill(g, name) {
    if (name === 'GU') return g.james.gu;
    return g.james.skills[name] || null;
}
/** The value James rolls with: his skill, or GU when he has no such skill (he is a chosen one). */
export function actingCheck(g, name) {
    const n = getSkill(g, name) || g.james.gu;
    let v = skillCheck(n);
    if (g.james.satiety < HUNGRY_AT) v -= 1;
    if (g.james.satiety <= 0) v -= 1;
    return v;
}
export function actingName(g, name) {
    return getSkill(g, name) ? name : 'GU';
}

/** Every skill (James's, Yuki's) stops at T10 L10; XP past the cap is lost (engine: lost-at-cap). */
export const SKILL_MAX_TIER = 10;
export const atSkillCap = (n) => n.tier >= SKILL_MAX_TIER && n.level >= 10;
/**
 * The Coil bonus (v0.11.0, owner 2026-11-06: picks 1b, per act): in Incremental Mode every earlier Coil of this act
 * makes James and Yuki learn faster: ×(1 + 0.5 × earlier Coils); ×(1 + 0.25 × earlier Coils) since v0.11.29 (RB-1). Since v0.11.15 (B1-b) it multiplies XP only (James's
 * skills, Yuki's Qi Use and fights); time is sped up by use instead (below). Story Mode: ×1.
 */
export const COIL_GROWTH = 0.25; // v0.11.29 (owner pick RB-1): was 0.5
/** v0.11.29: the Coil bonus as text, up to two decimals (×1.25, ×1.5, ×2). */
export const fmtMult = (x) => String(Math.round(x * 100) / 100);
/**
 * v0.11.86 (owner 2026-11-09 01:06, picks C1 + G1 + W1, roadmap #53): a Coil ended by choice ("Bite the tail" on the
 * James tab, "Go round again" at Act 1's end) still counts as a Coil, but adds nothing to the bonus: `coil.free` counts
 * them. A collapse, a beast, a lost tribute and Shen Qiu add as before. A save from before has no `free`: ×as it was.
 * v0.11.106 (owner pick RA1): except at the end of an Act 1 James won (victory, accord, revelation): that bite adds (why 'clear', coil.js `actWon`).
 */
export const coilMult = (g) => 1 + COIL_GROWTH * Math.max(0, (g?.coil?.n || 1) - 1 - (g?.coil?.free || 0));
/** The bonus the next Coil will have, if this one ends now; `chosen`: ended by choice (adds nothing). */
export const coilMultNext = (g, chosen) => 1 + COIL_GROWTH * Math.max(0, (g?.coil?.n || 1) - (g?.coil?.free || 0) - (chosen ? 1 : 0));
/**
 * v0.11.85 (owner 2026-11-09 00:05, pick D: "the game at least twice as hard"): every XP award (James's skills, Yuki's
 * bond share and her fights) is ×0.6, after the Coil bonus. The models: the Completionist's prologue 2.06 → 3.94 Coils,
 * Act 1 2.75 → 5.89; the Coil bonus and familiarity unchanged.
 */
export const XP_RATE = 0.6;
/**
 * Speed by use (v0.11.15, B1-b, owner 19:12, Selene's familiarity): each activity speeds up with its own use, kept across
 * Coils: speed = 1 + 9 × (uses ÷ N), up to ×10. Cards N 18 (tasks.js, the familiarity count), the sit N 30, meridian
 * work N 30 (a sitting), the breakthrough N 6. Uses of the sit, meridian work and the breakthrough live in
 * `g.tasks.use['act:sit' | 'act:mer' | 'act:bt']`. Incremental Mode only.
 */
export const USE_N = { card: 18, sit: 30, mer: 30, bt: 6 };
export const USE_CAP = 10;
export const useSpeed = (uses, n) => Math.min(USE_CAP, 1 + ((USE_CAP - 1) * (uses || 0)) / n);
const ACT_KEY = { sit: 'act:sit', mer: 'act:mer', bt: 'act:bt' };
export const actUses = (g, k) => g?.tasks?.use?.[ACT_KEY[k]] || 0;
export const actSpeed = (g, k) => useSpeed(actUses(g, k), USE_N[k]);
export function actUse(g, k) {
    if (!g.tasks || typeof g.tasks !== 'object') g.tasks = {};
    if (!g.tasks.use || typeof g.tasks.use !== 'object') g.tasks.use = {};
    g.tasks.use[ACT_KEY[k]] = actUses(g, k) + 1;
}
function addXp(n, amount) {
    const ups = [];
    if (n.tier > SKILL_MAX_TIER) { n.tier = SKILL_MAX_TIER; n.level = 10; }
    if (atSkillCap(n)) { n.xp = 0; return ups; }
    n.xp += amount;
    for (;;) {
        if (atSkillCap(n)) { n.xp = 0; break; }
        const need = xpToNext(n);
        if (n.xp < need) break;
        n.xp -= need;
        if (n.level < 10) n.level += 1;
        else { n.tier += 1; n.level = 1; }
        ups.push(`T${n.tier} L${n.level}`);
    }
    return ups;
}

/**
 * Standard award, as in the engine: pool = band × the skill's tier, split equally between the skill and GU;
 * Yuki (bonded) gets a share of the same size to her Qi Use. A failed attempt pays 25%.
 */
export function awardXp(g, skillName, band = 'standard', { fail = false, factor = 1, poolTier = null } = {}) {
    const name = actingName(g, skillName);
    const n = getSkill(g, name);
    let pool = (XP_BANDS[band] ?? 30) * (poolTier ?? n.tier); // poolTier: v0.11.89, the unarmed brawl (awardFightXp)
    if (fail) pool = Math.floor(pool * FAIL_XP_FRACTION);
    if (factor !== 1) pool = Math.floor(pool * factor); // a partial result on a task card (v0.9.2)
    pool = Math.floor(pool * coilMult(g) * XP_RATE); // the Coil bonus (v0.11.0), the XP rate (v0.11.85)
    if (!pool) return [];
    const out = [];
    const heads = name === 'GU' ? 1 : 2;
    const share = Math.floor(pool / heads);
    const up1 = addXp(n, share);
    out.push(atSkillCap(n) && !up1.length ? `${name} at T10 L10 (cap)` : `${name} +${share} XP${up1.length ? ` → ${up1.at(-1)}` : ''}`);
    if (name !== 'GU') {
        const up2 = addXp(g.james.gu, share);
        out.push(atSkillCap(g.james.gu) && !up2.length ? 'GU at T10 L10 (cap)' : `GU +${share} XP${up2.length ? ` → ${up2.at(-1)}` : ''}`);
    }
    const yShare = Math.floor(pool / 2);
    const up3 = addXp(g.yuki.qiUse, yShare);
    out.push(atSkillCap(g.yuki.qiUse) && !up3.length ? 'Yuki (bond) Qi Use at T10 L10 (cap)' : `Yuki (bond) Qi Use +${yShare}${up3.length ? ` → ${up3.at(-1)}` : ''}`);
    ensureBars(g);
    return out;
}
/** v0.11.89 (owner pick X1): a won fight's XP. The pool sized on CU's tier like every fight; an unarmed fight (Bao's brawl)
 *  gives all of it to GU (no CU half), so a brawl pays the same total as any small fight. */
export function awardFightXp(g, style, band = 'standard') {
    if (style !== 'unarmed') return awardXp(g, 'Convergence Use', band);
    return awardXp(g, 'GU', band, { poolTier: getSkill(g, actingName(g, 'Convergence Use')).tier });
}
/**
 * v0.11.118 (owner pick YK1, CG): Yuki's Fight never passes James's GU. While it is at his GU or above it learns nothing
 * (from her hauls, fights and story beats alike); an award that would carry her past it stops at his rank (LX1: a tenth of the rest goes to his GU, `yukiShareToJames`).
 * FE: in a fight she strikes and dodges with the lower of the two (`yukiFightSkill`), so a save from before YK1 with her
 * already above him fights at his level at once; the saved number is not changed.
 */
const rankOf = (n) => 10 * ((n?.tier || 1) - 1) + (n?.level || 1);
export const yukiHeld = (g) => rankOf(g.yuki.fight) >= rankOf(g.james.gu);
export const yukiAbove = (g) => rankOf(g.yuki.fight) > rankOf(g.james.gu); // a save from before YK1 (also a Coil snapshot: coil.js, SN)
export const yukiFightSkill = (g) => (yukiAbove(g) ? g.james.gu : g.yuki.fight);
export const YUKI_HELD_TEXT = { // Fable's texts (owner 2026-11-10 20:23, the MAINs)
    held: 'Yuki Fight held at James\'s GU (T{t} L{l})',
    reach: 'Yuki Fight +{xp} → T{t} L{l}, level with James\'s GU (held)',
    tab: 'level with James\'s GU: she waits for him to catch up',
    above: 'above James\'s GU: in a fight she uses his, T{t} L{l}',
    share: 'from what Yuki couldn\'t keep', // LX1: the tail of his share's line (GU +{xp} XP[ → T L], {share})
    // v0.11.130 (owner pick YB1, HL; Fable's MAINs): when his share raises his GU in the same award, "held at James's GU" named a rank he had just passed
    heldPast: 'Yuki Fight held at T{t} L{l}, where James\'s GU stood',
    reachPast: 'Yuki Fight +{xp} → T{t} L{l}, where James\'s GU stood (held)',
};
/** The Yuki tab's note on her Fight (YK1): level with his GU, above it (a save from before YK1), or nothing (both at T1 L1). */
export const yukiHeldNote = (g) => {
    const y = rankOf(g.yuki.fight), j = rankOf(g.james.gu);
    if (y === 1 && j === 1) return ''; // TN (the review's low 8): not on a new game, where both start at T1 L1
    return y > j ? YUKI_HELD_TEXT.above.replace('{t}', g.james.gu.tier).replace('{l}', g.james.gu.level) : y === j ? YUKI_HELD_TEXT.tab : '';
};
/** The XP that takes skill `n` from where it is to `rank` exactly (0 when it is there or above). */
const xpToRank = (n, rank) => {
    const c = { tier: n.tier, level: n.level, xp: n.xp || 0 };
    let k = 0;
    while (rankOf(c) < rank) { k += xpToNext(c) - c.xp; c.xp = 0; if (c.level < 10) c.level += 1; else { c.tier += 1; c.level = 1; } }
    return k;
};
/**
 * v0.11.120 (owner pick LX1): a tenth of the Fight XP she can't keep (held, or past his rank) goes to James's GU. The
 * models: Act 1 mean Coil Careful 4.07 → 3.90, Completionist 3.68 → 3.45 (all of it would be 2.88 / 2.57).
 */
export const YUKI_LOST_SHARE = 0.1;
function yukiShareToJames(g, lost) {
    const xp = Math.floor(lost * YUKI_LOST_SHARE);
    if (xp <= 0 || atSkillCap(g.james.gu)) return []; // at T10 L10 nothing to give (the old "(cap)" line isn't shown)
    const ups = addXp(g.james.gu, xp);
    ensureBars(g);
    return [`GU +${xp} XP${ups.length ? ` → ${ups.at(-1)}` : ''}, ${YUKI_HELD_TEXT.share}`];
}
export function awardYukiFightXp(g, band = 'standard') {
    const y = g.yuki.fight, gu = g.james.gu;
    const pool = Math.floor((XP_BANDS[band] ?? 30) * Math.min(y.tier, gu.tier) * coilMult(g) * XP_RATE); // v0.11.85: the XP rate; LX1 review (AP): an old save above him sized on his tier (under him hers is never higher)
    const r0 = rankOf(gu); // YB1 (HL): his rank before his share
    if (yukiHeld(g)) { // at T10 L10 too (CP); LX1: his share
        const t = gu.tier, l = gu.level, share = yukiShareToJames(g, pool);
        const past = rankOf(g.james.gu) > r0 && rankOf(y) === r0; // RB2 (HA; Fable's review, medium 1): above him (a save from before YK1) the held line stays
        return [YUKI_HELD_TEXT[past ? 'heldPast' : 'held'].replace('{t}', t).replace('{l}', l), ...share];
    }
    const room = xpToRank(y, rankOf(gu));
    if (pool >= room) { // CG: it stops at his rank; RX (the review's low 6): the line shows the XP she kept, not the whole pool
        const t = gu.tier, l = gu.level; // LX1: her line names the rank she reached, before his share can raise it
        y.tier = t; y.level = l; y.xp = 0;
        const share = yukiShareToJames(g, pool - room);
        return [YUKI_HELD_TEXT[rankOf(g.james.gu) > r0 ? 'reachPast' : 'reach'].replace('{xp}', room).replace('{t}', t).replace('{l}', l), ...share]; // YB1 (HL)
    }
    const ups = addXp(y, pool);
    return [`Yuki Fight +${pool}${ups.length ? ` → ${ups.at(-1)}` : ''}`];
}

/* No dice (v0.9.3; the only rules since v0.11.45, E step 2, when the dice code went): check ÷ DC decides; DCs move down by
 * NO_DICE_DC_SHIFT (the d6 averaged 3.5). The "no-dice" names (noDiceDc, NO_DICE_TUNE, noDiceUp…) are kept from that time. */
export const NO_DICE_DC_SHIFT = 2;
let noDiceTune = {};
/** The story layer hands over its per-fight no-dice tuning (js/story/nodice_tune.js). */
export const setNoDiceTune = (t) => { noDiceTune = t || {}; };
export const noDiceDc = (dc) => Math.max(0.5, Math.round((dc - NO_DICE_DC_SHIFT) * 10) / 10);
/** v0.11.110 (owner pick GD1, CV): the value a check uses (hunger counted), to one decimal; the fight's cards show this same value. */
export const checkValue = (g, skillName, bonus = 0) => Math.round((actingCheck(g, skillName) + bonus) * 10) / 10;

/** How a check reads in the log: "GU 1 / DC 2". */
export const checkText = (r) => `${r.skill} ${r.value} / DC ${r.dc}`;

/**
 * A check: the acting value (plus any bonus) ÷ the DC moved down by NO_DICE_DC_SHIFT; 1 or more succeeds, 2 or more is a double.
 * @returns {{ skill, value, dc, ratio, success, crit }}
 */
export function rollCheck(g, skillName, dc, bonus = 0) {
    const value = checkValue(g, skillName, bonus);
    const d = noDiceDc(dc);
    const ratio = value / d;
    g.stats.checks += 1;
    const success = ratio >= 1;
    if (success) g.stats.wins += 1;
    return { skill: actingName(g, skillName), value, dc: d, ratio, success, crit: ratio >= 2 };
}

/* ---------------- time ---------------- */

export function clockParts(minutes) {
    const day = Math.floor(minutes / 1440) + 1;
    const m = ((minutes % 1440) + 1440) % 1440;
    return { day, hh: Math.floor(m / 60), mm: m % 60 };
}
export function clockLabelG(g, minutes = g.minutes) {
    return g.flags?.lf_active ? 'The Long Forest' : clockLabel(minutes);
}
export function clockLabel(minutes) {
    const p = clockParts(minutes);
    return `Day ${p.day}, ${String(p.hh).padStart(2, '0')}:${String(p.mm).padStart(2, '0')}`;
}

/** Time passes: hunger, then regen per Cycle (T1 30 min) — HP 5%, Qi 5% + 0.1 per open collateral. */
/* v0.11.18 (owner pick B): once-a-day things come back after sleep, not at midnight (Incremental Mode).
 * g.wake.n counts waking days: +1 for each night slept (sleepUntil to a new morning, a scene that moves the clock past
 * a morning by itself, a span of a day or more). Old saves start at their calendar day.
 * v0.11.91 (owner 2026-11-09 09:05, pick B, push 1): no Push through the night and no Exhaustion any more; an old save's
 * `wake.ex` and `wake.push` are dropped when it is read (nothing reads them). */
const X4 = (m) => Math.floor((m - 240) / 1440) + 1;
export function wakeState(g) {
    const d = clockParts(g.minutes).day;
    if (!g.wake) g.wake = { n: d, lastX: X4(g.minutes), slept: d };
    if ('ex' in g.wake || 'push' in g.wake) { delete g.wake.ex; delete g.wake.push; } // v0.11.91: an old save's Exhaustion and push, gone
    const x = X4(g.minutes);
    if (x > g.wake.lastX) { g.wake.n += x - g.wake.lastX; g.wake.slept = d; } // the clock passed a morning by itself: slept
    g.wake.lastX = x;
    return g.wake;
}
export const wakeDay = (g) => wakeState(g).n;
/** v0.11.109 (owner pick FL1, W): from Foundation James and Yuki fly; a walk to another place takes its time ÷ (1 + realm),
 *  at least FLY_MIN minutes (never longer than walking). The numbers before the pick (200 games each, a scratch copy):
 *  Act 1 travel at Foundation+ −51% (Careful 1,448 → 704 min a game, Completionist 1,958 → 972); Act 1 Coils Careful
 *  3.67 → 3.56, Completionist 3.50 → 3.48; the full check 0 drifted. Work cards keep their own times (their walks are work). */
export const FLY_FROM_REALM = 1, FLY_MIN = 5;
export const canFly = (g) => (g.james?.realm || 0) >= FLY_FROM_REALM;
/** v0.11.112 (owner pick FF1, TD): from Foundation, in an armed fight, a round James throws darts or the Qi blast he does it
 *  from the air: that round foes that don't fly (`flies` on the enemy) get no attack on him. Not in a spar or a brawl. */
export const AIR_STRIKE_ACTIONS = new Set(['dart', 'blast']);
export const AIR_TEXT = { reach: "{foe} can't reach you up there.", hold: "Done from the air: foes that don't fly can't reach you this round, so they get no attack on you.", tag: 'from the air' }; // Fable's (rule 10)
/** v0.11.121 (owner pick AS1, EL6 + W): the air stalemate. A round thrown from the air in which nobody takes damage (no foe,
 *  not James) while every foe standing can't fly is a stuck round; at AIR_STALL_WARN in a row the log warns, at AIR_STALL_END
 *  in a row the fight is lost (as at the round cap). Any damage starts the count again. Measured before the pick (a scratch
 *  copy; the fight lab, 300 games, the same states; the models, 500 games): the rot ape's and the mire serpent's 30-round
 *  losses (46 and 59, every one from the air) end in round 6; ape 81.1 → 79.0%, serpent 67.8 → 61.1%, elder 95.8 → 93.8%;
 *  Act 1 Coils Careful 3.90 → 3.92, Completionist 3.45 → 3.48. */
export const AIR_STALL_WARN = 3, AIR_STALL_END = 6;
export const AIR_STALL_TEXT = { // Fable's (rule 10; the MAINs; RV1 PT: no weapon named, nothing that can be false, people never "it")
    warn: "Three rounds from the air, and nothing you send down has hurt {foe}. {foe} can't reach you either. *We could do this all day,* Yuki says. *We shouldn't.*",
    end: 'Six rounds from the air, and none of them hurt {foe}. It still stands below. Finishing this means coming down, and it has had time to get ready.',
    warnPerson: 'Three rounds from the air, and nothing you send down has hurt {foe}. {foe} cannot reach you, and waits below with the patience of someone owed an apology.',
    endPerson: 'Six rounds from the air, and none of them hurt {foe}. {foe} still stands below, unhurried. To finish this you have to come down, and they are ready for you.',
};
/** RV1 (PT): the line for this fight: people's wording in a people fight (PEOPLE_FIGHTS). */
export const airStallLine = (c, kind, name) => foeFillAll(AIR_STALL_TEXT[PEOPLE_FIGHTS.has(c.id) ? `${kind}Person` : kind], name);
/** Every {foe} in a line; "The …" lower-cased only mid-sentence (RV1, TG: a later {foe} can start a sentence). */
export const foeFillAll = (t, name) => t.replace(/\{foe\}/g, (m, at) => (/^The /.test(name) && !/(^|[.!?*]\s*)$/.test(t.slice(0, at)) ? `t${name.slice(1)}` : name));
/** v0.11.112 (owner pick AG1, G1): fights from the air only from Act 1 on (a Sitter at Foundation in the prologue won its tribute
 *  from the air: whole game on Coil 1 16 → 52.7%); walks and crossings fly from Foundation everywhere. */
export const airFights = (g) => canFly(g) && inAct1(g);
/** Would this action be done from the air now (for the card and the smart rule): Foundation+, armed, a foe that doesn't fly standing. */
export const airStrike = (g, actionId) => !!(g.combat && airFights(g) && !g.combat.style && AIR_STRIKE_ACTIONS.has(actionId) && g.combat.enemies.some((e) => e.hp > 0 && !e.flies));
export const flightMinutes = (g, m) => (canFly(g) ? Math.min(m, Math.max(FLY_MIN, Math.round(m / (1 + g.james.realm)))) : m);

export function advance(g, minutes, { resting = false } = {}) {
    const m = Math.max(0, Math.round(minutes));
    if (!m) return [];
    const notes = [];
    const w = wakeState(g);
    if (m >= 1440) { w.n += Math.floor(m / 1440); w.slept = clockParts(g.minutes + m).day; } // a span of a day or more has its nights in it
    w.lastX = X4(g.minutes + m); // a morning passed awake: no new day
    g.minutes += m;
    const fed0 = Math.max(0, g.james.satiety);
    g.james.satiety -= (SATIETY_PER_HOUR * m) / 60;
    if (g.james.satiety <= 0) {
        // task mode (v0.10.0): STARVE_HP_PER_HOUR per starving hour, the minutes carried over
        g.james.satiety = 0;
        g.starveCarry = (g.starveCarry || 0) + Math.max(0, m - (fed0 * 60) / SATIETY_PER_HOUR);
        const loss = Math.floor((g.starveCarry * STARVE_HP_PER_HOUR) / 60);
        g.starveCarry -= (loss * 60) / STARVE_HP_PER_HOUR;
        if (loss > 0) { g.james.hp -= loss; notes.push(`Starving: −${loss} HP`); }
    } else g.starveCarry = 0;
    const cycle = cycleTimeMinutes(Math.max(g.james.gu.tier, g.james.skills['Convergence Use'].tier));
    g.regenCarry += m * (resting ? 2 : 1);
    const ticks = Math.floor(g.regenCarry / cycle);
    g.regenCarry -= ticks * cycle;
    if (ticks > 0 && g.james.satiety > 0) {
        const qiPct = qiRegenPct(g, g.james.collaterals);
        g.james.hp = Math.min(jamesHpMax(g), g.james.hp + (jamesHpMax(g) * hpRegenPct(g.james.realm) * ticks) / 100);
        g.james.qi = Math.min(jamesQiMax(g), g.james.qi + (jamesQiMax(g) * qiPct * ticks) / 100);
        g.yuki.hp = Math.min(yukiHpMax(g), g.yuki.hp + (yukiHpMax(g) * hpRegenPct(g.yuki.realm) * ticks) / 100);
        g.yuki.qi = Math.min(yukiQiMax(g), g.yuki.qi + (yukiQiMax(g) * qiRegenPct(g, g.yuki.collaterals) * ticks) / 100);
    }
    ensureBars(g);
    return notes;
}

/*
 * v0.11.37 (owner 14:17 / 14:27, picks D-a + E-a): the waking day has an end (Incremental Mode). From 00:00 to 03:59 the
 * hour tests read 24–27 (the evening before, `dayHour`), so day cards don't come back at midnight. From the day's end the
 * task screens and resting places offer only the night (tasks.js, meditate.js), and a card that would end past it doesn't
 * start. v0.11.91 (owner 2026-11-09 09:05, pick B, push 1): the day ends at 00:00 (it was 02:00), and Push through the
 * night is gone, so the night is always for sleep; the night encounters come at 01:00 (01:20 the jackals) and end by 02:00.
 */
export const DAY_END_HOUR = 0, NIGHT_TO = 4;
/** The night hours belong to the day before. */
export const dayHour = (g) => { const hh = clockParts(g.minutes).hh; return hh < NIGHT_TO ? hh + 24 : hh; };
/** The minute this waking day ends (the next 00:00). */
export function dayEnd(g) {
    const p = clockParts(g.minutes), d0 = (p.day - 1) * 1440 + DAY_END_HOUR * 60;
    return p.hh < NIGHT_TO ? d0 : d0 + 1440;
}
export const nightLock = (g) => g.minutes >= dayEnd(g);
/** Would `minutes` of work from now run past the day's end? */
export const endsLate = (g, minutes) => g.minutes + Math.max(0, minutes || 0) > dayEnd(g);

/** v0.11.91 (owner 2026-11-09 09:16, with pick B's push 1): no bed before 21:00 anywhere: an earlier bed first spends the
 *  evening by the fire until 21:00 (time passes, resting). Dinner and night scenes before the bed are untouched. */
export const BED_FROM_HOUR = 21;
export function eveningTo(g, h = BED_FROM_HOUR) {
    const dh = dayHour(g);
    if (dh >= 6 && dh < h) { const p = clockParts(g.minutes); advance(g, (p.day - 1) * 1440 + h * 60 - g.minutes, { resting: true }); }
}
/** v0.11.91: a night encounter comes after the bed (from 21:00), at `at` minutes past the coming midnight (01:00; the jackals
 *  01:20), never back; the wait is asleep (Fed at the sleeping rate), so the fight is over before 02:00. */
export function nightTo(g, at = 60) {
    eveningTo(g);
    const p = clockParts(g.minutes), n0 = (p.hh < 6 ? p.day - 1 : p.day) * 1440; // before 06:00 it is still this night
    const t = Math.max(g.minutes, n0 + at), span = t - g.minutes;
    wakeState(g); g.minutes = t; g.wake.lastX = X4(t);
    g.james.satiety = Math.max(0, g.james.satiety - (SATIETY_PER_HOUR * span) / 60 / 2);
}
/** A full night (or long rest): bars to Max, clock to the given hour of the next morning (v0.11.91: never a bed before 21:00;
 *  `bed: false` for a rest that isn't a bed, the Long Forest's seclusion, owner pick S1). */
export function sleepUntil(g, hour = 6, { bed = true } = {}) {
    if (bed) eveningTo(g);
    delete g.flags.night_fight; // v0.11.92: any full night clears a night fight's mark
    const p = clockParts(g.minutes);
    let target = (p.day - 1) * 1440 + hour * 60;
    if (target <= g.minutes) target += 1440;
    const span = target - g.minutes;
    wakeState(g);
    g.minutes = target;
    { const w = g.wake, d = clockParts(target).day; if (d > w.slept) { w.n += 1; w.slept = d; } w.lastX = X4(target); }
    g.james.satiety = Math.max(0, g.james.satiety - (SATIETY_PER_HOUR * span) / 60 / 2);
    g.james.hp = jamesHpMax(g);
    g.james.qi = jamesQiMax(g);
    g.yuki.hp = yukiHpMax(g);
    g.yuki.qi = yukiQiMax(g);
    ensureBars(g);
    return span;
}

/**
 * v0.11.92 (owner 2026-11-09 10:17, pick O1, B push 2; 10:42 X1): a night fight costs sleep. A fight after bed (`enc.night`:
 * the jackals, the forest nights' crows, rats and thornback, the Blackroot's camp nights, Ashfall's arson, the fallout's barley
 * wolves) marks `g.flags.night_fight` when it starts (`'run'` for the jackals' escape without a fight, F). The next morning only half of what is missing comes back, HP and Qi, James's
 * and Yuki's (W1 + Q); without the mark a night fills every bar as before. Any full night (`sleepUntil`) clears the mark,
 * and a rewind resets it with the other world flags.
 */
export const NIGHT_FIGHT_HEAL = 0.5;
const halfBack = (v0, max) => { const v = Number.isFinite(v0) ? Math.max(0, v0) : 0; return Math.min(max, Math.ceil(v + (max - v) * NIGHT_FIGHT_HEAL)); };
/** A night after a night fight: sleep to `hour`, then half the missing HP and Qi back. Returns the result line. */
export function shortNight(g, hour = 6) {
    const before = { hp: g.james.hp, qi: g.james.qi, yhp: g.yuki.hp, yqi: g.yuki.qi }, what = g.flags.night_fight === 'run' ? 'run' : 'fight';
    sleepUntil(g, hour);
    const hm = jamesHpMax(g), qm = jamesQiMax(g);
    g.james.hp = halfBack(before.hp, hm);
    g.james.qi = halfBack(before.qi, qm);
    g.yuki.hp = halfBack(before.yhp, yukiHpMax(g));
    g.yuki.qi = halfBack(before.yqi, yukiQiMax(g));
    ensureBars(g);
    // no numbers: the choice's own minutes still pass after this line (a regen tick may land; the bars show it)
    return `Slept until ${String(hour).padStart(2, '0')}:00, what was left of the night after the ${what}: HP and Qi only half back.`;
}
/** The morning after a camp night: a short night after a night fight, a full one otherwise. Returns the result line. */
export function nightRest(g, hour = 6) {
    if (g.flags.night_fight) return shortNight(g, hour);
    sleepUntil(g, hour);
    return `Slept until ${String(hour).padStart(2, '0')}:00. HP and Qi full.`;
}

/* ---------------- Qi ---------------- */

export function spendQi(g, amount) {
    if (g.james.qi < amount) return false;
    g.james.qi = Math.round((g.james.qi - amount) * 1000) / 1000;
    return true;
}

/**
 * Timed cultivation (v0.11.2, Incremental Mode): Saturation is earned by hours. A realm takes SAT_HOURS(realm) hours of
 * sitting at ×1 (Mortal Vessel 10, ×1.5 each realm since v0.11.66, owner pick S1; ×2 before). Story Mode kept the engine's Qi-based gain.
 */
export const SAT_HOURS = (realm) => 10 * 1.5 ** (realm || 0);
export const SIT_MINUTES_INC = 60;
/** v0.11.15: a sit's length: an hour ÷ its speed by use (at least a minute). */
export const sitMinutes = (g) => Math.max(1, Math.round(SIT_MINUTES_INC / actSpeed(g, 'sit')));
/** Saturation % from `sits` sits (one hour each in Incremental Mode; the hollow and the grove count as two). */
export const sitGain = (g, sits = 1) => Math.round(((100 * sits) / SAT_HOURS(g.james.realm)) * 10) / 10; // v0.11.15: no Coil bonus
/** v0.11.37 (owner 13:06, pick B2): a sit that changes nothing (the top realm, or a gain that rounds to 0%: from realm 14 since v0.11.66's ×1.5, so only the top realm) is not offered (Incremental Mode). */
export const sitUseless = (g) => (g.james.realm >= MAX_REALM || sitGain(g) <= 0);
/** The breakthrough's length: 2 h × (realm + 1) (Foundation 2 h … Heavenly Immortal 28 h). */
export const btMinutes = (g) => Math.round((120 * ((g.james.realm || 0) + 1)) / actSpeed(g, 'bt')); // v0.11.15: ÷ its speed by use
/** v0.11.66 (owner pick X1): every sit pays a third of a standard award to Convergence Use and GU, with Yuki's bond share. */
export const SIT_XP_FACTOR = 1 / 3;
/** Condensation: a conscious sit, 10 Qi a sit; raises Saturation and pays SIT_XP_FACTOR of a standard award (`xp`: its lines). Spends Qi, never refills it. */
export function condense(g) {
    if (!spendQi(g, CONDENSE_SIT_COST)) return { ok: false, xp: [] };
    const gain = sitGain(g);
    g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10);
    advance(g, sitMinutes(g), { work: true });
    actUse(g, 'sit');
    const xp = awardXp(g, 'Convergence Use', 'standard', { factor: SIT_XP_FACTOR });
    return { ok: true, gain, saturation: g.james.saturation, xp };
}

/**
 * Breakthrough: at 100% Saturation, the next realm. Saturation resets, both bars refill to the new Max.
 * Yuki is root-kin and rises with James. No herbs, no pills, no tribulation (the Ouroboros Axiom).
 */
export const MAX_REALM = 14;
/** Engine rule L (v0.9.4): from 95% Saturation (anything over 100% is lost; nothing carries over). */
export const breakAt = () => 95;
export const PRIMARIES_FOR_FOUNDATION = 12;
/** Saturation is ready but the realm's gate isn't met (v0.9.6: Foundation needs all 12 primaries). '' if nothing blocks. */
export const breakBlock = (g) => (g.james.realm === 0 && (g.james.primaries ?? 12) < PRIMARIES_FOR_FOUNDATION ? `needs all 12 primaries (${g.james.primaries}/12)` : '');
export const breakReady = (g) => g.james.saturation >= breakAt() && g.james.realm < MAX_REALM;
export const canBreakThrough = (g) => breakReady(g) && !breakBlock(g);
export function breakthrough(g) {
    if (!canBreakThrough(g)) return { ok: false };
    const before = { hp: jamesHpMax(g), qi: jamesQiMax(g), yhp: yukiHpMax(g), yqi: yukiQiMax(g) };
    advance(g, btMinutes(g), { resting: true }); actUse(g, 'bt');
    if (g.james.realm === 0 && (g.james.collaterals ?? 66) < 66) g.james.colSealed = true; // the engine window: collaterals are Mortal Vessel only
    g.james.realm += 1;
    g.james.saturation = 0;
    g.yuki.realm = Math.max(g.yuki.realm, g.james.realm);
    g.james.hp = jamesHpMax(g);
    g.james.qi = jamesQiMax(g);
    g.yuki.hp = yukiHpMax(g);
    g.yuki.qi = yukiQiMax(g);
    ensureBars(g);
    const r1 = (n) => Math.round(n * 10) / 10;
    return { ok: true, realm: g.james.realm, lines: [
        `Realm: ${realmName(g.james.realm)}. Saturation 0%.`,
        `HP ${r1(before.hp)} → ${r1(jamesHpMax(g))}, Convergence ${r1(before.qi)} → ${r1(jamesQiMax(g))}. Both full.`,
        `Yuki rises with you: HP ${r1(before.yhp)} → ${r1(yukiHpMax(g))}, Qi ${r1(before.yqi)} → ${r1(yukiQiMax(g))}.`,
    ] };
}

/**
 * Bonesinger at Convergence Use tier, T1–T10 (v0.8.3). Gábor's james3/james3b ladder (T2–T9) rearranged to ten rungs:
 * the T1 rung was added for this game; "T9 L10: conceptual mastery" became T10.
 */
export const BONESINGER_TIERS = [
    null,
    'T1 — as hard as fresh antler. Needles, darts and a knife-length wraithbone blade; thrown to about 15 m; a few pieces at once.',
    'T2 — natural bone and tough fabric, rising to mild steel by L10. Hand-sized to arm-length pieces; simple shapes (tools, splints, simple blades, clothing).',
    'T3 — hardened steel that holds an edge. Up to his own body\'s volume within 2–3 m; fine detail and moving parts (armour plates, mechanisms).',
    'T4 — ceramic and tungsten-carbide. Room-sized pieces within about 10 m; several pieces at once; load-bearing structures (walls, a bridge, a shelter).',
    'T5 — diamond-hard but tough, not brittle. Within about 30 m; many pieces at once; it conducts his Qi, so techniques can run through it.',
    'T6 — harder than diamond, like the rarest natural crystals. Building-sized within about 100 m; damaged bone knits back when he touches it.',
    'T7 — Qi-bone beyond any natural material, flexing without breaking. Area-scale at line of sight; simple constructs that follow simple orders.',
    'T8 — living bone. Grows, heals itself unattended and lasts when he leaves; battlefield-scale; constructs act on their own judgement.',
    'T9 — near-indestructible. He sets its density from feather-light to crushing mass; whole structures at a thought.',
    'T10 — conceptual mastery. It ignores basic physical laws: it holds its shape in vacuum or fire, and cuts what should not be cut.',
];
/**
 * What the tier does in a fight (Convergence Use tier; the weapons are Bonesinger constructs, all checked on GU since v0.11.95):
 *   damage × the bone multiplier (boneMult: v0.11.104, owner pick GW2: the tier, plus half a step over the tier's ten levels;
 *   darts 2–4 → T10 20–40); Qi cost × engine dampen max(0.25, 1 − 0.0375·(m−1)); v0.11.95 (P2): the Qi blast's
 *   cost ×1.2 a step, its damage on the weapons' multiplier until ×1.4 a step passes it (T7; GW2, Bw), the Qi shield's
 *   soak 3 × the multiplier and cost +10% a step (actionCost, actionDmg);
 *   T2+ the bone flail (v0.11.107, owner pick NK1): sung once, each swing hits the target and one more foe (COMBAT_ACTIONS.flail);
 *   T3+ pierces enemy DR (hardened steel) and James wears wraithbone plates: DR 1 at T3 L1, +0.1 a level (GW2, U; T10: 8);
 *   T4+ darts strike two enemies (several pieces), T5+ every enemy (many pieces);
 *   T7+ a bone construct fights beside him (2 × the bone multiplier, rounded, a round on the first enemy standing: T7 L1 14);
 *   T8+ the construct, on its own judgement, steps into the first blow aimed at him each round;
 *   T10 his constructs never miss (they cut what should not be cut); not the Qi blast, which is raw Qi, no bone (v0.11.100).
 */
export const boneTier = (g) => Math.min(SKILL_MAX_TIER, g.james.skills['Convergence Use'].tier);
/** v0.11.104 (owner 2026-11-09 20:13, pick GW2, D: DH): the bone multiplier. Today's tier at every L1, then half a step over
 *  the tier's ten levels (T1 L1 1, T1 L8 1.39, T1 L10 1.5, T2 L1 2 …; T10 10). Damage, the Qi blast and shield, the dampened
 *  costs, the plates and the construct read it; the gates (T3 pierce, T4–T5 volleys, T7–T8 constructs, T10 no miss) stay on the tier.
 *  GW2_NOTE (the numbers before the pick, 300 bot games, 6,618 fight states each played both ways): smart 74.3 → 77.7%,
 *  Act 1 86.9 → 90.3%; blade only 73.1 → 77.2%, blast only 74.3 → 77.0%; the rot ape 14.2 → 18.7%; the models' Act 1 Coil
 *  Careful 4.07 → 3.70, Completionist 4.07 → 3.46 (the target 6: the retune, section 2). */
export const LEVEL_STEP = 0.5;
export const boneMult = (g) => {
    const T = boneTier(g);
    if (T >= SKILL_MAX_TIER) return T;
    const L = Math.max(1, Math.min(10, g.james.skills['Convergence Use'].level || 1));
    return T + LEVEL_STEP * (L - 1) / 9;
};
/** v0.11.95 (owner 12:47, pick P2 at 13:19): the Qi blast's damage ×1.4 and its cost ×1.2 a Convergence tier (K2); the Qi
 *  shield's cost +10% of its base a tier (S1). Every other move's cost falls with the engine's dampening, as before.
 *  v0.11.104 (GW2, Bw): each by the bone multiplier, so by level too; the blast's damage keeps pace with the weapons'
 *  (the larger of the multiplier and ×1.4 a step: the weapons' until T7, then ×1.4 a tier as P2's table). */
export const BLAST_DMG_STEP = 1.4, BLAST_COST_STEP = 1.2, QSHIELD_COST_STEP = 0.1;
export const actionCost = (g, a) => {
    const m = boneMult(g), r = (x) => Math.round(x * 10) / 10; // v0.11.104 (GW2): by level, not only by tier
    if (a.pierce) return r(a.qi * BLAST_COST_STEP ** (m - 1));
    if (a.qshield) return r(a.qi * (1 + QSHIELD_COST_STEP * (m - 1)));
    return a.qi ? r(a.qi * dampenMultiplier(m)) : 0;
};
/** v0.11.104 (GW2, Bw): the Qi blast's damage multiplier: the weapons' until ×1.4 a step passes it (T7). */
export const blastMult = (g) => { const m = boneMult(g); return Math.max(m, BLAST_DMG_STEP ** (m - 1)); };
/** Damage × the bone multiplier (the Convergence Use tier until v0.11.104); v0.11.4: dagger +1, sword +2 on the blade; the thrown lance +2 on darts. */
export const formDmgBonus = (g, a) => (a.keeps === 'blade' ? Math.max(0, formStep(g, 'melee') - 1) : a.id === 'dart' && hasForm(g, 'lance') ? 2 : 0);
export const actionDmg = (g, a) => {
    if (a.unarmed) { const t = Math.min(SKILL_MAX_TIER, g.james.gu.tier); return [a.dmg[0] * t, a.dmg[1] * t]; } // v0.11.82: fists by the GU tier
    if (a.pierce) { const m = blastMult(g); return [a.dmg[0] * m, a.dmg[1] * m]; } // v0.11.95 (P2): ×1.4 a tier; v0.11.104 (GW2, Bw): the weapons' pace until T7
    const b = formDmgBonus(g, a), m = boneMult(g); return [a.dmg[0] * m + b, a.dmg[1] * m + b]; // v0.11.104 (GW2): by level
};
/** Guard's defence bonus: 2; v0.11.4: +0.5 per personal-defence form (bracer 2.5 … full armour 4.5). v0.11.104 (GW2, U): and
 *  level by level toward the next form (rank 8, between the bracer at 5 and the buckler at 11: 2.75 → 2.8 shown), to 0.1. */
export const guardBonus = (g) => {
    if (fightStyle(g)) return 2 + (fightStyle(g) === 'unarmed' ? unarmedMastery(g) : 0); // v0.11.82: no armour in a spar or a brawl; v0.11.114 (PA2, UM): Cover learns
    const st = formStep(g, 'defence'), fs = FORM_LINES.defence.forms, nx = fs[st + 1];
    let b = 2 + 0.5 * (st + 1);
    if (nx) { const lo = st >= 0 ? fs[st].at : 1; b += 0.5 * (cuRank(g) - lo) / (nx.at - lo); }
    return Math.round(b * 10) / 10;
};
/** v0.11.4 spike field: rounds, and the damage each attacker takes (1; 2 from the slab). */
export const FIELD_ROUNDS = 2;
export const fieldDamage = (g) => (hasForm(g, 'slab') ? 2 : 1);
/** v0.11.95 (Q1): what the Qi shield soaks this round (3 × the Convergence Use tier), and its lines (Fable's, rule 10). */
export const qiShield = (g) => Math.round(QI_SHIELD_PER_TIER * boneMult(g) * 10) / 10; // v0.11.104 (GW2, Bw): by level
export const QI_SHIELD_TEXT = {
    raise: 'Qi tightens over your skin like a held breath. It will not hold for long.',
    soak: '{foe} hits the Qi, not you: {n} soaked.',
    spent: 'The shell cracks and goes; the rest is yours to take.',
};
/** v0.11.95 (Q1): the first time in a fight the Qi blast goes through armour the bone would have met (Fable's). */
export const QI_BLAST_PIERCE = 'Raw Qi doesn\'t care what {foe} is wearing. It goes straight in.';
/** v0.11.82: no bone plates in a spar or a brawl. v0.11.104 (GW2, U): DR 1 at T3 L1 (the plates), +0.1 a level (T4 L1 2, as
 *  before at every L1), T10 8 as before. */
export const armourDr = (g) => {
    const T = boneTier(g);
    if (fightStyle(g) || T < 3) return 0;
    if (T >= SKILL_MAX_TIER) return 8;
    return Math.round((1 + (cuRank(g) - 21) / 10) * 10) / 10;
};

/* ---------------- inventory and food ---------------- */

/** Hammerspace caps: 99 of anything, 999 of crafting stock. Old saves above a cap keep their pieces; they just can't add more. */
export const ITEM_CAP = 99;
export const BIG_CAP = { beast_core: 999, spirit_grass: 999 };
export const itemCap = (id) => BIG_CAP[id] || ITEM_CAP;
export const itemFull = (g, id) => (g.inventory[id] || 0) >= itemCap(id);
const capNotes = [];
/** Item names for messages (filled by the story: Object.assign(itemNames, ITEMS)). */
export const itemNames = {};
/** Notes about items that didn't fit, gathered since the last call. */
export const takeCapNotes = () => capNotes.splice(0);
let lootMult = 1;
/** While a critical hunt or forage resolves, every item gained is multiplied (story.js sets it around the choice). */
export const setLootMult = (m) => { lootMult = m; };
export function addItem(g, id, n = 1) {
    const have = g.inventory[id] || 0;
    if (n > 0) {
        n *= lootMult;
        const room = Math.max(0, itemCap(id) - have);
        if (room < n) capNotes.push(id);
        n = Math.min(n, room);
    }
    g.inventory[id] = have + n;
    if (g.inventory[id] <= 0) delete g.inventory[id];
}
export const hasItem = (g, id, n = 1) => (g.inventory[id] || 0) >= n;
export function eat(g, satiety, { yuki = true } = {}) {
    g.james.satiety = Math.min(100, g.james.satiety + satiety);
    g.stats.meals += 1;
    if (yuki) g.yuki.hp = Math.min(yukiHpMax(g), g.yuki.hp + 3);
}

/* ---------------- relationships ---------------- */

/**
 * v0.11.16 (C1, owner 19:48): the catch-up. In Incremental Mode, while a person's friendship or affection is below its
 * best-ever value (`g.coil.best`, kept across Coils and into Act 1), gains count ×3 until they reach it; above it, ×1.
 * Losses are never multiplied; Yuki is never caught up (she is never reset).
 */
export const REL_CATCHUP = 3;
export const REL_MAX = 150; // v0.11.83: friendship and affection run −150 to 150 (named for the FAQ; unchanged)
/** v0.11.137 (owner pick HV1, HD): people no longer tracked: nothing moves them and the James tab leaves them out; an old save keeps their numbers (no key removed). */
export const REL_HIDDEN = ['Old Hu'];
function catchUp(cur, d, top) {
    if (d <= 0 || cur >= top) return cur + d;
    const fast = Math.min(top - cur, d * REL_CATCHUP);
    return Math.round(cur + fast + (d - fast / REL_CATCHUP));
}
export function bumpRel(g, who, f = 0, a = 0) {
    const r = g.rel[who] || (g.rel[who] = { f: 0, a: 0 });
    let b = null;
    if (g.coil && who !== 'Yuki') {
        const best = g.coil.best || (g.coil.best = {});
        const p = g.coil.peak?.[who];
        b = best[who] || (best[who] = { f: Math.max(r.f, p?.f ?? r.f), a: Math.max(r.a, p?.a ?? r.a) }); // an old save starts from this Coil's peak
    }
    r.f = Math.max(-REL_MAX, Math.min(REL_MAX, b ? catchUp(r.f, f, b.f) : r.f + f));
    r.a = Math.max(-REL_MAX, Math.min(REL_MAX, b ? catchUp(r.a, a, b.a) : r.a + a));
    if (b) { b.f = Math.max(b.f, r.f); b.a = Math.max(b.a, r.a); }
    if (g.coil) { const p = g.coil.peak[who] || (g.coil.peak[who] = { f: r.f, a: r.a }); p.f = Math.max(p.f, r.f); p.a = Math.max(p.a, r.a); } // the Coil's head start (v0.9.4)
    return r;
}

/* ---------------- combat ---------------- */

/**
 * One exchange. James acts (dart / blade / dodge / Yuki-strike), Yuki strikes on her own, then every enemy
 * still standing attacks: James defends with GU ÷ the enemy's attack DC (stepNoDice has the bands); a hit deals its
 * damage minus DR 1 (Ouroboros).
 * v0.11.95 (owner 2026-11-09 12:26, pick Q1 at 12:43): every weapon is sung with Convergence and checked on GU, with one
 * hit modifier (+1); the weapons differ only in damage and what they do. Convergence's own moves: the Qi blast (checked on
 * Convergence Use, ignores armour) and the Qi shield (soaks QI_SHIELD_PER_TIER × the Convergence tier that round).
 * BLAST_DC_NOTE, v0.11.102 (owner 2026-11-09 18:18, pick QB1): the Qi blast's hit modifier 0, one point under the weapons'
 * +1. Convergence Use is never ahead of GU (equal at the start; every Convergence award gives GU the same XP): at the bots' fights GU leads by a median 3 ranks,
 * 1.5 check points, nearly all at Convergence T1. With +1 the blast missed 85.8% of first swings (the knife 35.9%) and 56.9%
 * in whole fights (the knife 25.7%); with 0, 73.3% and 46.7%; blast only wins 72.6% against the knife's 71.0% (was 69.0%).
 */
export const QI_SHIELD_PER_TIER = 3;
/** v0.11.107 (owner pick NK1): the line when the bone flail is sung (Fable's, rule 10). */
export const FLAIL_SUNG = 'A short white haft sets in your fist; a length of knuckled bone swings from its end, looking for company: a bone flail.';
export const COMBAT_ACTIONS = {
    dart: { id: 'dart', label: 'Bone darts', skill: 'GU', qi: 2, dmg: [2, 4], dcMod: 1 },
    blade: { label: 'Wraithbone blade', skill: 'GU', qi: 3, dmg: [3, 6], dcMod: 1, keeps: 'blade' },
    needle: { label: 'Needle to a joint', skill: 'GU', qi: 4, dmg: [1, 2], dcMod: 1, stagger: true },
    guard: { label: 'Guard and give ground', skill: 'GU', qi: 0, dmg: [0, 0], dcMod: -1, guard: true },
    // v0.11.95 (Q1): Convergence's own moves, open from the start (not in a spar or a brawl: forms.js SPAR_ACTIONS / UNARMED_ACTIONS)
    blast: { id: 'blast', label: 'Qi blast', skill: 'Convergence Use', qi: 4, dmg: [4, 6], dcMod: 0, pierce: true }, // P2: 4–6, the middle 5 × 1.4 a tier (the table the owner picked); v0.11.102 (QB1): hit modifier +1 → 0, see BLAST_DC_NOTE
    qshield: { id: 'qshield', label: 'Qi shield', skill: 'Convergence Use', qi: 3, dmg: [0, 0], dcMod: 0, qshield: true },
    // v0.11.4 (actionOpen hides them until James can sing them):
    spear: { id: 'spear', label: 'Bone spear', skill: 'GU', qi: 3, dmg: [3, 6], dcMod: 1, reach: true, keeps: 'spear' }, // sung once (Convergence), thrust with GU (v0.11.95: dcMod 2 → 1, Q1); a full hit holds the enemy off for the round
    spikes: { id: 'spikes', label: 'Sing a field of bone spikes', skill: 'Convergence Use', qi: 4, dmg: [0, 0], dcMod: 0, field: true }, // once per fight, 2 rounds
    // v0.11.107 (owner pick NK1, FL): sung once (Convergence) at T2 L1, swung with GU; each swing hits the target and one more foe standing
    flail: { id: 'flail', label: 'Bone flail', skill: 'GU', qi: 3, dmg: [2, 4], dcMod: 1, keeps: 'flail', sweep: 2 },
    // v0.11.82 (owner pick B1; labels Fable's): the unarmed brawl (a fight with style 'unarmed'): GU, no Qi, damage × the GU tier
    strike: { id: 'strike', label: 'Step in and hit', skill: 'GU', qi: 0, dmg: [2, 4], dcMod: 0, unarmed: true },
    throw: { id: 'throw', label: 'Hook and throw', skill: 'GU', qi: 0, dmg: [1, 2], dcMod: 2, stagger: true, unarmed: true },
    cover: { id: 'cover', label: 'Cover up and circle', skill: 'GU', qi: 0, dmg: [0, 0], dcMod: -1, guard: true, unarmed: true },
    // v0.11.114 (owner pick PA2, SS; research.md #132): against people who posture; no check, no Qi (forms.js actionOpen). Label Fable's.
    remark: { id: 'remark', label: 'Say something', skill: 'GU', qi: 0, dmg: [0, 0], dcMod: 0, remark: true },
};
/** v0.11.82: what a closed action becomes: in a brawl a strike (guard: cover), in a spar the blade (guard stays), else guard. */
export function fightAction(g, id) {
    if (actionOpen(g, id)) return id;
    const st = fightStyle(g), guardish = !!COMBAT_ACTIONS[id]?.guard;
    if (st === 'unarmed') return guardish ? 'cover' : 'strike';
    if (st === 'spar') return guardish ? 'guard' : 'blade';
    return 'guard';
}
/** v0.11.82 (Y1): Yuki joins a spar or a brawl only in her human form; otherwise she watches. */
export const yukiSitsOut = (g, enc) => !!enc?.style && yukiForm(g) !== 'human';

/** A hit's damage: the middle of its range (no dice). */
function dmgRoll(g, [lo, hi]) {
    if (hi <= 0) return 0;
    return Math.round((lo + hi) / 2);
}

/** Story-layer hooks: `before(g, enc)` may adjust an encounter (Long Forest scaling, posture text, degree). */
export const combatHooks = { before: null, lose: null, steal: null }; // v0.11.113 (DA1, CS): steal(g) → a food item id the hammerspace holds, or null (story/common.js)
/** Fights against people (v0.9.7): losing them keeps their written branches. Every other fight is a beast. */
export const PEOPLE_FIGHTS = new Set(['gao', 'collectors', 'arson', 'ya_brawl', 'rt_brawl', 'elder', 'sect_watcher', 'lf_rogue', 'lf_bandits']); // v0.11.81 (T1): the Tan brothers too
/** v0.11.114 (owner pick PA2, PT + SP; research.md #132): people posture every TELL_EVERY rounds, shown a round early, from the
 *  prologue on; not Ya (she is not one of the overly serious), not a heavy foe (Act 1: its stance is its big blow; in the prologue nobody is heavy).
 *  "Say something" on a posture costs that foe this round's attack and the next (SAY_ROUNDS). */
export const NO_POSTURE = new Set(['ya_brawl']);
export const SAY_ROUNDS = 2;
/** Does this foe posture this round? */
export const postureDue = (c, e) => !!(e.postures && e.hp > 0 && c.round % TELL_EVERY === 0);
/** v0.11.114 (owner pick PA2, UM; research.md #63): every round fought bare-handed counts (g.stats.unarmed, kept across every
 *  Coil); each UNARMED_EVERY rounds give +UNARMED_STEP to the brawl's three moves (Cover's defence too), up to UNARMED_MAX. */
export const UNARMED_EVERY = 10, UNARMED_STEP = 0.5, UNARMED_MAX = 2;
export const unarmedMastery = (g) => Math.min(UNARMED_MAX, Math.floor((g.stats?.unarmed || 0) / UNARMED_EVERY) * UNARMED_STEP);
/** v0.11.115 (owner pick MA3, FX; research.md #44): foes remembered. Every meeting with a fight (its id; won, lost or ended in one
 *  move, any Coil) counts in g.stats.foes, kept across every Coil; each earlier one starts James's attacks in that fight at
 *  +FOE_MEMORY_STEP, up to FOE_MEMORY_MAX together with the fight's own learning (c.adapt shares the cap). Not the tribute
 *  (NO_MEMORY; measured on a scratch copy: Careful's tribute 8.7 → 37.2%, its Coils 3.25 / 3.42 → 2.61 / 2.85). A fight run from or
 *  yielded is not a meeting (MB1, FY; Fable's review, medium 1: yielding a spar at once would farm it). */
export const FOE_MEMORY_STEP = 0.5, FOE_MEMORY_MAX = 2; // MB1 (CC): also the fight's own learning's cap (ADAPT_FIGHT_MAX)
export const NO_MEMORY = new Set(['collectors']);
/** Count a meeting with fight `id`; returns the memory bonus from the meetings before it. */
export function meetFoe(g, id) {
    const foes = g.stats.foes || (g.stats.foes = {});
    const met = foes[id] || 0;
    foes[id] = met + 1;
    return NO_MEMORY.has(id) ? 0 : Math.min(FOE_MEMORY_MAX, met * FOE_MEMORY_STEP);
}
/** MB1 (FY): take a meeting back (a yield, a run that got clear). */
export const unmeet = (g, id) => { if (g.stats.foes?.[id] > 0) g.stats.foes[id] -= 1; };
/** v0.11.115 (owner pick MA3, W50; research.md #65): weapon familiarity. Every round a sung move or the Qi blast is used to
 *  attack counts in g.stats.weapons (by move id; the blade from knife to sword is one move), kept across every Coil; each
 *  WEAPON_EVERY rounds give +WEAPON_STEP to that move's check, up to WEAPON_MAX, on top of the fight's own learning (as
 *  the fists' mastery). Both, as built (v0.11.115): the fight lab's smart bots 81.3 → 83.3%, random 72.3 → 74.0%; the models'
 *  Coils within 0.06 (Careful 3.25 / 3.43 unchanged). */
export const WEAPON_EVERY = 50, WEAPON_STEP = 0.5, WEAPON_MAX = 2;
export const weaponMastery = (g, id) => Math.min(WEAPON_MAX, Math.floor((g.stats?.weapons?.[id] || 0) / WEAPON_EVERY) * WEAPON_STEP);
/** v0.11.116 (owner pick WA2, CDB; research.md #64): the rhythm. A sung weapon needs time to sing itself again: after the blade,
 *  the spear, the flail or the Qi blast attacks it waits a round, the needle two (c.wait[id]: the first round it is ready).
 *  Darts, guard, the Qi shield, the spike field (once a fight) and the fists don't wait. Measured (the fight lab, 300 games,
 *  the same 7,552 states; with SG below): smart 83.3 → 83.6%, blade only 79.5 → 77.8%, random 74.1 → 74.2%. */
export const WAIT = { blade: 1, spear: 1, flail: 1, blast: 1, needle: 2 };
/** Rounds until move `id` is ready again (0: ready now). */
export const waitLeft = (g, id) => (g.combat ? Math.max(0, (g.combat.wait?.[id] || 0) - g.combat.round) : 0);
/** v0.11.116 (owner pick WA2, SG; research.md #142): the song. Each round a blade, spear or flail hit lands (full or glancing)
 *  the song rises by 1, up to SONG_MAX, for that fight only; the needle can be paid with SONG_COST.needle song instead of its Qi,
 *  the spike field with SONG_COST.spikes. A needle the song pays for uses the blade's practice (its learning in the fight and its
 *  familiarity, SH) and staggers even on a glancing hit (NS); measured: without SH and NS the song lost (smart 83.3 → 82.0%). */
export const SONG_MAX = 3, SONG_COST = { needle: 2, spikes: 3 };
/** Can the song pay for move `id` now? */
export const songPays = (g, id) => !!g.combat && SONG_COST[id] != null && (g.combat.song || 0) >= SONG_COST[id] && actionOpen(g, id) && !(id === 'spikes' && g.combat.fieldUsed);
/** v0.11.116 (WB1, SP; Fable's review, medium 1): whose practice a needle the song pays for uses: the blade's, unless the
 *  needle's own (its learning in this fight plus its familiarity) is higher. That one also gets the round. Lab: 0 of 7,561 fights change. */
export const sungKey = (g) => { const c = g.combat, prac = (k) => fightAdapt(c, k) + weaponMastery(g, k); return prac('needle') > prac('blade') ? 'needle' : 'blade'; };
/** The rhythm and the song (Fable's, rule 10). */
export const SONG_TEXT = {
    rise: '{weapon} lands, and the bone hums a little louder for it. Song {n} / {max}.',
    needle: 'The song pays for the needle, {n} of it and no Qi. It goes in on the blade\'s rhythm.',
    spikes: 'The song goes into the ground, {n} of it, and comes up as spikes. Your Qi stays where it is.',
    waiting: '{move} is still singing itself back together. You guard instead.',
    tagNext: 'next round', tagIn: 'in {n} rounds',
    price: '{n} song',
    label: 'Song {n} / {max}',
    holdNext: '{move} needs time to sing itself again: ready next round.',
    holdIn: '{move} needs time to sing itself again: ready in {n} rounds.',
    holdNeedle: 'The song pays for this one: {n} song and no Qi, struck with the blade\'s practice or the needle\'s own, whichever is better, and it staggers even on a glancing hit.', // WB1 (SP): Fable's revision
    holdSpikes: 'The song pays for this one: {n} song and no Qi, and the spikes come up exactly as they would have.', // WB1 (FT; review low 8)
};
/** The memory bonus a fight's attack gets now: its own learning plus the memory, within FOE_MEMORY_MAX (both start from 0). */
export const fightAdapt = (c, key) => Math.min(FOE_MEMORY_MAX, (c.adapt?.[key] || 0) + (c.mem || 0));
/** Task mode (v0.9.7, owner's pick 3a): every beast fight +0.5 DC and attack on top of its no-dice tuning. */
export const BEAST_UP = 0.5;
/** v0.11.40 (E1): the no-dice raise to a fight's DC and attack (its tune plus BEAST_UP for a beast), as startCombat applies it. */
export function noDiceUp(id) {
    const t0 = noDiceTune[id];
    return ((t0 && t0.up) || 0) + (PEOPLE_FIGHTS.has(id) ? 0 : BEAST_UP);
}
/** Where a lost fight leads: its lose scene, unless the Coil takes it (combatHooks.lose, set by coil_scenes.js). */
const loseTo = (g, c) => (combatHooks.lose && combatHooks.lose(g, c)) || c.lose;

/** Yuki's forms: 'cat' always; 'tiger' (a root-kin the size of a Bengal tiger) from Core Formation; 'human' from Nascent Soul. */
export const YUKI_FORMS = {
    cat: { label: 'cat', hit: 0, dmg: [1, 2], name: 'Yuki' },
    tiger: { label: 'great root-kin', hit: 2, dmg: [3, 6], name: 'Yuki (great form)' },
    human: { label: 'human form', hit: 1, dmg: [2, 4], name: 'Yuki' },
};
export const yukiForms = (g) => ['cat', ...(g.yuki.realm >= 2 ? ['tiger'] : []), ...(g.yuki.realm >= 7 ? ['human'] : [])];
export const yukiForm = (g) => (yukiForms(g).includes(g.yuki.form) ? g.yuki.form : 'cat');

/** Win a fight outright (the one-move finish): XP and kills as a normal win, no combat screen. */
export function instantWin(g, enc) {
    const e = combatHooks.before ? (combatHooks.before(g, enc) || enc) : enc;
    meetFoe(g, e.id); // v0.11.115 (MA3, FX): a meeting all the same
    if (e.night) g.flags.night_fight = true; // v0.11.92 (O1): a night fight costs sleep, even one ended in one move
    g.stats.kills += e.enemies.length;
    const xp = awardFightXp(g, e.style, e.band || 'standard').concat(yukiSitsOut(g, e) ? [] : awardYukiFightXp(g, e.band || 'standard')); // v0.11.82; v0.11.89 (X1) awardFightXp
    g.lastWin = { id: e.id, degree: e.degree || 3, next: e.win };
    advance(g, 1);
    return { lines: xp, next: e.win, enc: e };
}

export function startCombat(g, enc0) {
    const enc = combatHooks.before ? (combatHooks.before(g, enc0) || enc0) : enc0;
    if (enc.night) g.flags.night_fight = true; // v0.11.92 (O1): a night fight costs sleep
    g.combat = {
        id: enc.id,
        round: 1,
        win: enc.win,
        lose: enc.lose,
        flee: enc.flee || null,
        degree: enc.degree || 1,
        band: enc.band || 'standard',
        bladeFormed: false,
        enemies: enc.enemies.map((e) => {
            const t0 = noDiceTune[enc.id]; // v0.9.3: per-fight tuning for the no-dice rules
            const t = !PEOPLE_FIGHTS.has(enc.id) ? { ...(t0 || {}), up: ((t0 && t0.up) || 0) + BEAST_UP } : t0; // v0.9.7: beasts +0.5
            const x = t ? { ...e, dc: e.dc + (t.up || 0), atk: e.atk + (t.up || 0), hp: Math.max(1, Math.round(e.hp * (t.hp || 1))) } : e;
            const heavy = isHeavy(g, enc, e);
            return { ...x, hpMax: x.hp, staggered: false, ...(heavy ? { heavy: true } : {}), ...(!heavy && PEOPLE_FIGHTS.has(enc.id) && !NO_POSTURE.has(enc.id) ? { postures: true } : {}) }; // v0.11.113 (DA1, TL); v0.11.114 (PA2, PT)
        }),
        log: [enc.intro || 'Combat!'],
    };
    const mem = meetFoe(g, enc.id); // v0.11.115 (MA3, FX)
    if (mem > 0) { g.combat.mem = mem; g.combat.log.push(memoryLine(g.stats.foes[enc.id] - 1, mem)); }
    g.combat.log.push(...traitLines(g, g.combat.enemies, enc.id)); // v0.11.113 (DA1, TD)
    if (enc.style) {
        Object.assign(g.combat, { style: enc.style, yukiOut: yukiSitsOut(g, enc), ...(enc.opening ? { opening: enc.opening } : {}) }); // v0.11.82
        g.combat.log.push(SPAR_TEXT.terms); // v0.11.114 (PA2, SF + YD)
        if (enc.style === 'unarmed' && unarmedMastery(g) > 0) g.combat.log.push(SPAR_TEXT.mastery.replace('{n}', g.stats.unarmed).replace('{b}', unarmedMastery(g))); // UM
    }
    return g.combat;
}

/** v0.11.113 (owner pick DA1; research.md #43, #45, #133): foes show their hand. Each trait, read off the foe's fields, has a
 *  tag (after its name on the fight screen) and a line (once, when the fight starts). Texts Fable's (rule 10). */
export const FOE_TRAITS = {
    yuki: { tag: 'goes for Yuki', line: '{foe} has looked you both over and settled on the smaller one.' },
    flies: { tag: 'flies', line: '{foe} has wings. The air will not keep you out of its reach.', grounded: '{foe} has wings. You have the ground, for now.' },
    plated: { tag: 'plated', line: '{foe} is armoured. Bone will lose some of itself on that; raw Qi will not.', pierced: '{foe} is armoured. Sung bone no longer minds; raw Qi never did.' },
    heavy: { tag: 'hits hard', line: '{foe} hits hard, and winds up before its worst. Watch for it.', person: '{foe} hits hard, and settles into a stance before the worst of it. Watch for the stance.' },
    postures: { tag: 'postures', line: '{foe} came with things to say about face, and will stop the fight to say them. Listen for the breath before it.' }, // v0.11.114 (PA2, PT; Fable's)
    moods: { tag: 'moods', line: '{foe} has moods, and wears them a round early. The singing inside it changes key.' },
    thief: { tag: 'thief', line: '{foe} is watching your supplies more closely than it is watching you.' },
};
/** A foe's traits, in FOE_TRAITS order. */
export const foeTraits = (e) => Object.keys(FOE_TRAITS).filter((k) => ({ yuki: e.prefersSmall, flies: e.flies, plated: (e.dr || 0) > 0, heavy: e.heavy, postures: e.postures, moods: e.moods, thief: e.thief })[k]);
/** v0.11.113 (DB1, C): a foe's name into a line; "The …" is lower-cased when it doesn't start the line. */
export const foeFill = (t, name) => t.replace('{foe}', t.indexOf('{foe}') > 0 && /^The /.test(name) ? `t${name.slice(1)}` : name);
/** v0.11.113 (DB1, P, W): the line for a trait in this fight: people's wording for a heavy person (PEOPLE_FIGHTS); plated
 *  once sung bone pierces armour (bone tier 3+); flies while James can't fight from the air. Texts Fable's. */
export const traitLine = (g, k, id) => (k === 'heavy' && PEOPLE_FIGHTS.has(id) ? FOE_TRAITS.heavy.person : k === 'plated' && boneTier(g) >= 3 ? FOE_TRAITS.plated.pierced
    : k === 'flies' && !airFights(g) ? FOE_TRAITS.flies.grounded : FOE_TRAITS[k].line);
/** The trait lines for a fight's start: each trait once, named for the first foe that has it. */
export const traitLines = (g, enemies, id) => Object.keys(FOE_TRAITS).map((k) => { const e = enemies.find((x) => foeTraits(x).includes(k)); return e ? foeFill(traitLine(g, k, id), e.name) : null; }).filter(Boolean);
/** DA1 (TL): from Act 1, an armed fight's foes that hit for HEAVY_DMG or more land a big blow every TELL_EVERY rounds (× BIG_BLOW
 *  damage), shown the round before; guard avoids it outright, the needle's stagger and the spear's hold stop it as any attack.
 *  Not the rot ape (NO_TELL; measured: the story test's smart bots 47.4 → 35.0% there, Act 1's wall is the retune's). */
export const HEAVY_DMG = 5, TELL_EVERY = 3, BIG_BLOW = 2;
export const NO_TELL = new Set(['rot_ape']);
const isHeavy = (g, enc, e) => !enc.style && (e.dmg || 0) >= HEAVY_DMG && inAct1(g) && !NO_TELL.has(enc.id);
/** Is this foe's big blow (or, for a foe that goes for Yuki, its lunge) due this round? */
export const bigBlowDue = (c, e) => !!(e.heavy && e.hp > 0 && c.round % TELL_EVERY === 0);
/** DA1 (HD): a foe with moods (the Gardeners' Guardian): hungry rounds (James's hits heal it), proud rounds (his hits do double), plain. */
export const moodOf = (c, e) => (e?.moods ? (c.round % 3 === 2 ? 'hungry' : c.round % 3 === 0 ? 'proud' : 'plain') : 'plain');
export const TELL_TEXT = {
    big: ['{foe} draws back and sets its weight. The next one will be the big one.', '{foe} goes very still, gathering. Something large is coming next round.', '{foe} rears up and takes its time about it. Next round, the big blow.'],
    bigPerson: ['{foe} draws back a pace and sets both feet. The next one will be the big one.', '{foe} goes very still, gathering Qi. Something decisive is coming next round.', '{foe} lowers one hand and takes a long breath over it. Next round, the big blow.'], // DB1 (P): people's wording (Shen Qiu, Fang Wei)
    bigAvoided: '{foe} brings the big blow down on the place you have just left.',
    bigLands: '  The big blow: double.',
    lunge: '{foe} has stopped looking at you. It is looking at Yuki. Next round it lunges.',
    covered: '{foe} lunges at Yuki — and meets you instead. She watches from behind your guard.',
    hungry: 'The singing inside {foe} thins to a whine. It is hungry: next round, your hits feed it.',
    proud: '{foe} draws itself up to its full height, the voice swelling. Proud: next round, hits land double.',
    fed: '{foe} takes the blow in and grows over it, pleased. +{n} HP.',
    proudHit: '  It was too proud to move: double.',
    theft: '{foe} makes off with your {item}.',
    guardBig: 'avoids the big blow', guardYuki: 'covers Yuki',
    holdBig: 'A big blow is coming this round: guarding avoids it outright.',
    holdYuki: 'A lunge at Yuki is coming this round: guarding puts you between it and her.',
};
/** v0.11.114 (owner pick PA2; texts Fable's, rule 10): posture and Say something (#132). */
export const SAY_TEXT = {
    tells: ['{foe} steps back, straightens, and arranges a grave expression. Next round, a speech about face.',
        '{foe} lifts a chin and draws the breath of someone with ancestors to mention. Next round they get mentioned.',
        '{foe} lowers both hands and looks at you the way a magistrate looks at a stain. Next round, a few words on what is owed.'],
    landed: ['"Is there much more of this?" you ask. {foe} stops mid-sentence, loses the place, and will spend the next round looking for it.',
        '"Sorry, how many generations was that? I lost count at the third." {foe} goes back to count, and is busy this round and the next.',
        'You wait for the first pause. "Noted," you say. {foe} had a good deal more prepared and cannot now find any of it, this round or the next.'],
    unheard: 'You say something dry. Nobody had stopped to make a speech, so it lands as a man talking with his hands down.',
    stunned: '{foe} is still looking for the place in the speech.',
    tag: 'cuts a speech short · no guard', tagNow: 'the speech is now',
    hold: 'A dry word. Said into a speech, it costs the speaker this round\'s attack and the next; said at any other time it does nothing, and you are not guarding while you say it.',
    holdNow: 'A speech is coming this round: say something and it never finishes.',
};
/** v0.11.114 (owner pick PA2; texts Fable's): spar rules (#136), Yield, unarmed mastery (#63). */
export const SPAR_TEXT = {
    out: '{foe} is in the dust, and by the terms stays there.',
    terms: 'The terms: anyone you wear down to half is in the dust and stays there. You may yield whenever you like.',
    yieldLabel: 'Yield', yieldTag: 'lose now · keep your HP',
    yieldHold: 'Concede at once. The fight counts as lost, but you walk away with the HP you have instead of being beaten down to 3.',
    yielded: 'You step back and open your hands. "Yours." It costs some face. You were not using it.',
    yieldConfirm: 'Tap Yield again to concede the fight.', // PB1 (YC): as Bite the tail's
    mastery: 'Your hands remember {n} rounds of this, whatever the Coil forgot: +{b} to your fists.',
    masteryUp: 'Something in your knuckles settles into place. Bare-handed, you are now at +{b}.',
};
/** v0.11.115 (owner pick MA3; texts Fable's, rule 10): foes remembered (FX), weapon familiarity (W50). */
export const MEMORY_TEXT = {
    met: 'You have fought this fight {times} before. Nobody else here has: +{b} to your attacks.',
    up: '{move}, {n} rounds in. Your hands have stopped consulting you about it: +{b} to hit.',
    upQi: 'Qi blast, {n} rounds in. There is no bone to blame, so it must be you getting better: +{b} to hit.',
};
const timesText = (n) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);
/** The memory line at a fight's start: `n` earlier meetings, bonus `b`. */
export const memoryLine = (n, b) => MEMORY_TEXT.met.replace('{times}', timesText(n)).replace('{b}', b);
/** The familiarity line when a move's bonus rises (the Qi blast has its own wording). */
export const weaponLine = (label, id, n, b) => (id === 'blast' ? MEMORY_TEXT.upQi : MEMORY_TEXT.up).replace('{move}', label).replace('{n}', n).replace('{b}', b);
/** v0.11.114 (PA2): a foe postures this round (for the Say something card). */
export const postureNow = (g) => !!g.combat && g.combat.enemies.some((e) => postureDue(g.combat, e) && !e.staggered && !e.atBay && !(e.flustered > 0));
/** v0.11.114 (PA2, SF): in a spar or a brawl a foe worn down to half its HP is out. */
const sparOut = (c, e, lines) => { if (c.style && e.hp > 0 && e.hp <= e.hpMax / 2) { e.hp = 0; lines.push(foeFill(SPAR_TEXT.out, e.name)); } };
/** For the Guard card (this round): a big blow due from a foe guard would meet; a lunge at Yuki due. */
export const bigBlowNow = (g) => !!g.combat && g.combat.enemies.some((e) => bigBlowDue(g.combat, e) && !e.staggered && !e.atBay);
export const lungeNow = (g) => !!g.combat && !g.combat.style && g.yuki.hp > 0 && g.combat.round % TELL_EVERY === 0 && g.combat.enemies.some((e) => e.prefersSmall && e.hp > 0 && !e.staggered && !e.atBay);
export const NO_DICE_ROUND_CAP = 30; // a no-dice fight still undecided after this many rounds is lost: James is spent
const ADAPT_FIGHT_STEP = 0.5, ADAPT_FIGHT_MAX = FOE_MEMORY_MAX; // v0.11.115 (MB1, CC): one cap, shared with the memory
const bandOf = (ratio) => (ratio >= 2 ? 'double' : ratio >= 1 ? 'full' : ratio >= 0.5 ? 'glance' : 'miss');

/** A no-dice round (v0.9.3): check ÷ DC in bands. Hits: ≥ 2 double, ≥ 1 full, ≥ 0.5 a glancing blow (half), below a miss.
 *  Defence the same way round: ≥ 1 avoided, ≥ 0.5 half the damage, below the full blow. Intuitive Aptitude: each miss
 *  or glance raises that action's check by 0.5 for the rest of the fight (up to +2); Yuki adapts the same way. */
function stepNoDice(g, actionId, targetIdx) {
    const c = g.combat;
    c.adapt = c.adapt || {};
    const lines = [];
    actionId = fightAction(g, actionId); // v0.10.4: a form he can't sing yet; v0.11.82: and the fight's style
    if (c.opening && c.round === 1) lines.push(c.opening); // v0.11.82: the brawl's first line
    if (waitLeft(g, actionId) > 0) { lines.push(SONG_TEXT.waiting.replace('{move}', actionLabel(g, actionId, COMBAT_ACTIONS[actionId].label))); actionId = 'guard'; } // v0.11.116 (WA2, CDB): a stale tap
    const act = { ...COMBAT_ACTIONS[actionId], label: actionLabel(g, actionId, COMBAT_ACTIONS[actionId].label) };
    const living = c.enemies.filter((e) => e.hp > 0);
    const target = living[Math.min(targetIdx, living.length - 1)];
    let guard = false;
    c.aloft = false; // v0.11.112 (FF1): set below when this round's darts or blast are thrown from the air
    const foeHp0 = c.enemies.map((e) => e.hp), jamesHp0 = g.james.hp; // v0.11.121 (AS1): for the stalemate; RV1 (PF): each foe's own
    const songed = songPays(g, actionId); // v0.11.116 (WA2, SG): the song pays instead of Qi
    const formed = songed || (act.keeps === 'blade' && c.bladeFormed) || (act.keeps === 'spear' && c.spearFormed) || (act.keeps === 'flail' && c.flailFormed) || (act.field && c.fieldUsed); // a used field costs nothing (and does nothing)
    const qiNeed = formed ? 0 : actionCost(g, act);
    if (songed) { c.song -= SONG_COST[actionId]; lines.push(SONG_TEXT[actionId].replace('{n}', SONG_COST[actionId])); }
    if (qiNeed && !spendQi(g, qiNeed)) {
        lines.push(`Not enough Qi for ${act.label} — you fall back on guarding.`);
        guard = true;
    } else {
        if (act.keeps === 'blade' && !c.bladeFormed) { c.bladeFormed = true; lines.push(`White wraithbone slides out of your palm and sets: ${act.label.toLowerCase()}.`); }
        if (act.keeps === 'spear' && !c.spearFormed) { c.spearFormed = true; lines.push('A long white shaft grows out of your fist and keeps growing: a bone spear.'); }
        if (act.keeps === 'flail' && !c.flailFormed) { c.flailFormed = true; lines.push(FLAIL_SUNG); } // v0.11.107 (NK1)
        if (airFights(g) && !c.style && AIR_STRIKE_ACTIONS.has(actionId)) c.aloft = true; // v0.11.112 (FF1, AG1): paid for, so thrown from the air (Act 1 on)
        if (act.guard) {
            guard = true;
            lines.push('You give ground, watching for the opening.');
        } else if (act.remark) { // v0.11.114 (PA2, SS): the target if it postures, else the first foe that does
            const pe = [target, ...living].find((e) => e && postureDue(c, e) && !e.staggered && !e.atBay && !(e.flustered > 0));
            if (pe) { pe.flustered = SAY_ROUNDS; lines.push(foeFill(SAY_TEXT.landed[Math.floor(c.round / TELL_EVERY) % SAY_TEXT.landed.length], pe.name)); } else lines.push(SAY_TEXT.unheard);
        } else if (act.qshield) {
            c.qshieldHp = qiShield(g); lines.push(QI_SHIELD_TEXT.raise); // v0.11.95 (Q1): this round only
        } else if (act.field) {
            if (c.fieldUsed) lines.push('The ground is already broken. There is nothing left in it to sing.');
            else { c.field = FIELD_ROUNDS; c.fieldUsed = true; lines.push('Bone spikes punch up through the ground around you, ankle-high and very sincere.'); }
        } else {
            if (act.keeps === 'blade' && fragileKnife(g)) { // v0.10.4: broke every swing below T1 L8; v0.11.104 (GW2, K): after knifeSwings swings
                c.knifeSw = (c.knifeSw || 0) + 1;
                if (c.knifeSw >= knifeSwings(g)) { c.knifeSw = 0; c.bladeFormed = false; lines.push('The knife shatters on the swing. You will have to sing another.'); }
            }
            const T = c.style === 'unarmed' ? 1 : boneTier(g); // v0.11.82: fists pierce nothing
            const targets = act.id === 'dart' && T >= 4 ? living.slice(0, T >= 5 ? living.length : 2)
                : act.sweep ? [target, ...living.filter((e) => e !== target).slice(0, act.sweep - 1)] : [target]; // v0.11.107 (NK1): the flail, the target and one more
            const key = songed ? sungKey(g) : actionId; // v0.11.116 (WA2, SH): a needle the song pays for uses the blade's practice; WB1 (SP): or its own, if better
            const kLabel = key === 'blade' && songed ? actionLabel(g, 'blade', COMBAT_ACTIONS.blade.label) : act.label;
            let learned = false, landed = false;
            const w0 = weaponMastery(g, key), a0 = fightAdapt(c, key); // v0.11.115 (MA3, W50): counted below, after this round's checks; MB1 (SA): every target at the value the card shows
            for (const tg of targets) {
                const r = rollCheck(g, act.skill, tg.dc + act.dcMod, a0 + (act.unarmed ? unarmedMastery(g) : w0)); // v0.11.114 (PA2, UM); v0.11.115 (MA3: the memory, FX; the move's familiarity, W50)
                const band = T >= 10 && r.ratio < 1 && act.id !== 'blast' ? 'full' : bandOf(r.ratio); // v0.11.100 (SB1, T): the T10 no-miss is the constructs' (the sung weapons'), not the Qi blast's
                lines.push(`${act.label}${targets.length > 1 ? ` → ${tg.name}` : ''}: ${checkText(r)} — ${{ double: 'a clean, deep hit', full: 'hit', glance: 'a glancing blow', miss: 'miss' }[band]}`);
                if ((band === 'glance' || band === 'miss') && !learned && fightAdapt(c, key) < ADAPT_FIGHT_MAX) { c.adapt[key] = (c.adapt[key] || 0) + ADAPT_FIGHT_STEP; learned = true; lines.push(`  You read the opening better. (+${ADAPT_FIGHT_STEP} to ${kLabel} this fight)`); } // v0.11.115 (MA3, FX): not past the cap the memory shares
                if (band === 'miss') continue;
                let dmg = dmgRoll(g, actionDmg(g, act)) * (band === 'double' ? 2 : 1);
                if (band === 'glance') dmg = Math.floor(dmg / 2);
                if (act.pierce && T < 3 && (tg.dr || 0) > 0 && !c.blastPierced) { c.blastPierced = true; lines.push(`  ${QI_BLAST_PIERCE.replace('{foe}', tg.name)}`); }
                dmg = Math.max(0, dmg - (T >= 3 || act.pierce ? 0 : (tg.dr || 0))); // v0.11.95 (Q1): the Qi blast ignores armour
                const mood = moodOf(c, tg); // v0.11.113 (DA1, HD)
                if (mood === 'hungry' && dmg > 0) { const h0 = tg.hp; tg.hp = Math.min(tg.hpMax, tg.hp + dmg); lines.push(`  ${foeFill(TELL_TEXT.fed, tg.name).replace('{n}', Math.round((tg.hp - h0) * 10) / 10)}`); continue; } // DB1 (F): what it really healed
                if (mood === 'proud' && dmg > 0) dmg *= 2;
                tg.hp -= dmg;
                if (dmg > 0) landed = true; // WB1 (SD; review low 3): only a hit that does damage raises the song (not one armour soaks to 0 or a hungry foe takes in)
                lines.push(`  ${tg.name} takes ${dmg}${band === 'double' ? ' (double damage)' : ''}.`);
                if (mood === 'proud' && dmg > 0) lines.push(TELL_TEXT.proudHit);
                sparOut(c, tg, lines); // v0.11.114 (PA2, SF)
                if (act.stagger && tg.hp > 0 && (band !== 'glance' || songed)) { tg.staggered = true; lines.push(act.unarmed ? `  ${tg.name} hits the dust and takes a moment to work out which way is up.` : `  ${tg.name} staggers.`); } // v0.11.82: the throw's line Fable's
                if (act.reach && tg.hp > 0 && band !== 'glance') { tg.atBay = true; lines.push(`  ${tg.name} is held at the spear's length.`); }
            }
            if (!act.unarmed) { // v0.11.115 (MA3, W50): a round of this move, kept across every Coil
                const w = g.stats.weapons || (g.stats.weapons = {});
                w[key] = (w[key] || 0) + 1;
                if (weaponMastery(g, key) > w0) lines.push(weaponLine(kLabel, key, w[key], weaponMastery(g, key)));
            }
            if (WAIT[actionId]) { c.wait = c.wait || {}; c.wait[actionId] = c.round + WAIT[actionId] + 1; } // v0.11.116 (WA2, CDB): the move's own wait
            if (act.keeps && landed && (c.song || 0) < SONG_MAX) { c.song = (c.song || 0) + 1; lines.push(SONG_TEXT.rise.replace('{weapon}', act.label).replace('{n}', c.song).replace('{max}', SONG_MAX)); } // SG
        }
    }
    const ct = !c.style && boneTier(g) >= 7 ? c.enemies.find((e) => e.hp > 0) : null; // v0.11.82: no construct in a spar or a brawl
    if (ct) { const dmg = Math.round(boneMult(g) * 2); ct.hp -= dmg; lines.push(`Your bone construct strikes ${ct.name}: ${dmg}.`); } // v0.11.104 (GW2): by level
    let shield = !c.style && boneTier(g) >= 8;
    const yt = c.enemies.find((e) => e.hp > 0);
    if (yt && g.yuki.hp > 0 && !c.yukiOut) { // v0.11.82 (Y1): she watches a spar or a brawl unless human
        const form = YUKI_FORMS[yukiForm(g)];
        const yv = Math.round((skillCheck(yukiFightSkill(g)) + form.hit + (c.adapt.yuki || 0)) * 10) / 10;
        const d = noDiceDc(yt.dc);
        const band = bandOf(yv / d);
        const verb = { cat: ['claws find a mark', 'a hiss and a swipe at air'], tiger: ['a paw the size of a shovel lands', 'jaws close on air'], human: ['a white blur and a strike', 'a sidestep, nothing more'] }[yukiForm(g)];
        lines.push(`${form.name}: Fight ${yv} / DC ${d} — ${band === 'miss' ? verb[1] : band === 'glance' ? 'a graze' : verb[0]}`);
        if ((band === 'glance' || band === 'miss') && (c.adapt.yuki || 0) < ADAPT_FIGHT_MAX) c.adapt.yuki = (c.adapt.yuki || 0) + ADAPT_FIGHT_STEP;
        if (band !== 'miss') {
            let dmg = Math.round((form.dmg[0] + form.dmg[1]) / 2) * (band === 'double' ? 2 : 1);
            if (band === 'glance') dmg = Math.floor(dmg / 2);
            dmg = Math.max(0, dmg - (yt.dr || 0));
            yt.hp -= dmg; lines.push(`  ${yt.name} takes ${dmg}.`); sparOut(c, yt, lines); // v0.11.114 (PA2, SF)
        }
    }
    for (const e of c.enemies) {
        if (e.hp <= 0) continue;
        if (e.flustered > 0) { const first = e.flustered === SAY_ROUNDS; e.flustered--; e.staggered = false; e.atBay = false; if (!first) lines.push(foeFill(SAY_TEXT.stunned, e.name)); continue; } // v0.11.114 (PA2, SS); PB1 (HC; Fable's review, high 1): a stagger or hold on a stunned foe is spent with it, so it loses two rounds, never more
        if (e.staggered) { e.staggered = false; lines.push(c.style === 'unarmed' ? `${e.name} is still getting up.` : `${e.name} is still reeling.`); continue; }
        if (e.atBay) { e.atBay = false; lines.push(`${e.name} can't get past the spear.`); continue; }
        if (e.prefersSmall && g.yuki.hp > 0 && c.round % 3 === 0) { // every third round it goes for the small one
            const covered = guard && !c.style; // v0.11.113 (DA1, TY): the lunge is shown a round early, so any guard covers her (v0.11.4: the buckler only)
            const dodge = covered || skillCheck(yukiFightSkill(g)) + 1 >= noDiceDc(e.atk); // v0.11.118 (YK1, FE)
            lines.push(covered ? foeFill(TELL_TEXT.covered, e.name) : `${e.name} lunges at Yuki — ${dodge ? 'she is not there' : 'it connects'}.`);
            if (!dodge) g.yuki.hp = Math.max(1, g.yuki.hp - hitDamage(e.dmg, e.realm, g.yuki.realm, yukiDr(g)));
            continue;
        }
        if (shield && !(c.aloft && !e.flies)) { shield = false; lines.push(`${e.name} attacks — your construct steps into the blow.`); continue; } // v0.11.112 (AF1, S): not spent on a foe that can't reach
        if (c.field > 0) { const th = fieldDamage(g); e.hp -= th; lines.push(`${e.name} comes through the spikes: ${th}.`); if (e.hp <= 0) continue; }
        if (c.aloft && !e.flies) { lines.push(AIR_TEXT.reach.replace('{foe}', e.name)); continue; } // v0.11.112 (FF1)
        const big = bigBlowDue(c, e); // v0.11.113 (DA1, TL)
        if (big && guard) { lines.push(foeFill(TELL_TEXT.bigAvoided, e.name)); continue; } // DB1 (P): Fable kept it for people too
        const r = rollCheck(g, 'GU', e.atk, guard ? guardBonus(g) : 0);
        if (r.ratio >= 1) { lines.push(`${e.name} attacks: you defend (${checkText(r)}) — avoided.`); continue; }
        let dmg = hitDamage(e.dmg, e.realm, g.james.realm, jamesDr(g));
        const soaked = []; // v0.11.95 (Q1): the Qi shield soaks the blow first (as measured), what gets through is halved as before; its lines after the attack's (review)
        if (c.qshieldHp > 0 && dmg > 0) {
            const t1 = (x) => Math.round(x * 10) / 10; // v0.11.104 (SH1, S1): the soak is in tenths; every step to 0.1, so no float noise reaches the log or HP
            const a = t1(Math.min(c.qshieldHp, dmg)); c.qshieldHp = t1(c.qshieldHp - a); dmg = t1(dmg - a);
            soaked.push(QI_SHIELD_TEXT.soak.replace('{foe}', e.name).replace('{n}', a));
            if (c.qshieldHp <= 0 && QI_SHIELD_TEXT.spent) soaked.push(QI_SHIELD_TEXT.spent);
            if (dmg <= 0) { lines.push(`${e.name} attacks: you defend (${checkText(r)}).`, ...soaked); continue; }
        }
        if (r.ratio >= 0.5) dmg = Math.floor(dmg / 2);
        if (big) dmg *= BIG_BLOW;
        g.james.hp = Math.max(0, g.james.hp - dmg);
        lines.push(`${e.name} attacks: you defend (${checkText(r)}) — ${r.ratio >= 0.5 ? 'it only half lands' : 'it lands'}: ${dmg} (DR ${jamesDr(g)}).`, ...soaked);
        if (big) lines.push(TELL_TEXT.bigLands);
        if (e.thief && !c.stole && dmg > 0 && combatHooks.steal) { const k = combatHooks.steal(g); if (k) { g.inventory[k]--; c.stole = true; lines.push(foeFill(TELL_TEXT.theft, e.name).replace('{item}', itemNames[k]?.name || k)); } } // v0.11.113 (DA1, CS)
    }
    // v0.11.121 (owner pick AS1): the air stalemate: a stuck round, the warning at the third, the fight lost at the sixth
    const standing = c.enemies.filter((e) => e.hp > 0);
    const stuck = c.aloft && standing.length > 0 && standing.every((e) => !e.flies) && g.james.hp >= jamesHp0
        && c.enemies.every((e, i) => e.hp >= foeHp0[i]);
    c.stall = stuck ? (c.stall || 0) + 1 : 0;
    if (c.stall === AIR_STALL_WARN) lines.push(airStallLine(c, 'warn', standing[0].name));
    if (c.stall >= AIR_STALL_END) c.stalled = standing[0].name;
    if (!c.stalled && c.enemies.some((e) => e.hp > 0) && g.james.hp > 0 && c.round + 1 <= NO_DICE_ROUND_CAP) { // v0.11.113 (DA1): next round's moves, shown now; DB1 (L): only if that round comes
        const next = c.round + 1, bigT = PEOPLE_FIGHTS.has(c.id) ? TELL_TEXT.bigPerson : TELL_TEXT.big;
        for (const e of c.enemies) {
            if (e.hp <= 0) continue;
            if (e.heavy && next % TELL_EVERY === 0) lines.push(foeFill(bigT[Math.floor(next / TELL_EVERY) % bigT.length], e.name));
            if (e.postures && next % TELL_EVERY === 0) lines.push(foeFill(SAY_TEXT.tells[Math.floor(next / TELL_EVERY) % SAY_TEXT.tells.length], e.name)); // v0.11.114 (PA2, PT)
            if (e.prefersSmall && !c.style && g.yuki.hp > 0 && next % TELL_EVERY === 0) lines.push(foeFill(TELL_TEXT.lunge, e.name));
            const m = moodOf({ round: next }, e);
            if (m !== 'plain') lines.push(foeFill(TELL_TEXT[m], e.name));
        }
    }
    if (c.field > 0) c.field--;
    delete c.qshieldHp; // v0.11.95: the shield lasts the round
    delete c.aloft; // v0.11.112 (FF1): so does the air
    return lines;
}

/** v0.11.117 (owner pick TW1, PW; research.md #62): the threat word. The fight a story choice leads to, played on a copy with the
 *  plainest tactic (the blade alone: under the rhythm, swing then guard) from James's state now; the word says how it went.
 *  Measured (the fight lab, 300 games, 7,642 fights): lost 22.6% (smart play still wins 28.3%, random 4.4%), won under
 *  THREAT_LOW% HP 6.6% (random 57.7%), under THREAT_HIGH% 21.0% (94.7%), the rest 49.8% (99.3%). Words, no numbers; texts Fable's. */
export const THREAT_LOW = 30, THREAT_HIGH = 70, THREAT_STEPS = 400;
export const THREAT_TEXT = {
    words: ['losing', 'narrow', 'costly', 'clean'],
    hold: ['With the blade alone, swing and guard, you lose this one. A better fight than that might not.',
        'With the blade alone, swing and guard, you win this one with very little of you left. A better fight costs less.',
        'With the blade alone, swing and guard, you win this one and pay for it. A better fight costs less.',
        'With the blade alone, swing and guard, you win this one and keep most of your HP. A better fight costs less still.'],
    fists: ['With your fists alone, stepping in and hitting every round, you lose this one. A better fight than that might not.', // TX1 (UB; review low 3): Bao's brawl
        'With your fists alone, stepping in and hitting every round, you win this one with very little of you left. A better fight costs less.',
        'With your fists alone, stepping in and hitting every round, you win this one and pay for it. A better fight costs less.',
        'With your fists alone, stepping in and hitting every round, you win this one and keep most of your HP. A better fight costs less still.'],
};
/** Play `enc` on `g` (already a copy: it is changed) with the blade alone; the story's hooks prepare it first, then stay off
 *  (no second preparation, no Coil ending). Returns the band: 0 lost; else by the share of the HP James started with that the
 *  fight cost (TX1, HL; Fable's review, mediums 1–2: an untouched win from low HP is clean): 1 more than THREAT_HIGH%,
 *  2 THREAT_LOW–THREAT_HIGH%, 3 under THREAT_LOW%. HP to a whole percent, as the fight lab rounds it (TX1, LR). From full HP the
 *  same bands as measured; from a hurt start 44 of 7,642 lab fights read better (35 costly → clean, 8 narrow → costly, 1 narrow → clean). */
export function plainFight(g, enc0) {
    const keep = { before: combatHooks.before, lose: combatHooks.lose };
    try {
        const enc = keep.before ? (keep.before(g, enc0) || enc0) : enc0;
        combatHooks.before = null; combatHooks.lose = null;
        const pct = () => Math.round((100 * Math.max(0, g.james.hp)) / jamesHpMax(g));
        const hp0 = pct();
        startCombat(g, enc);
        let o = null;
        for (let t = 0; t < THREAT_STEPS && g.combat; t++) { o = combatStep(g, 'blade'); if (o?.done) break; }
        if (o?.done !== 'win') return 0;
        const kept = hp0 > 0 ? (100 * pct()) / hp0 : 0; // the share of his starting HP he still has
        return kept < THREAT_LOW ? 1 : kept <= THREAT_HIGH ? 2 : 3; // narrow: it cost over 70% of his HP; costly: 30–70%; clean: under 30%
    } finally { combatHooks.before = keep.before; combatHooks.lose = keep.lose; }
}

export function combatStep(g, actionId, targetIdx = 0) {
    if (!g.combat) return null;
    return finishRound(g, stepNoDice(g, actionId, targetIdx));
}

/** The end of every round: realm healing, time, win / lose. */
function finishRound(g, lines) {
    const c = g.combat;
    // immortal flesh: from Immortal Ascension, wounds close mid-fight
    const hj = realmShockHpBonus(g.james.realm || 0);
    if (hj > 0 && g.james.hp > 0 && g.james.hp < jamesHpMax(g)) { const before = g.james.hp; g.james.hp = Math.min(jamesHpMax(g), g.james.hp + hj); lines.push(`Your flesh closes: +${Math.round((g.james.hp - before) * 10) / 10} HP.`); }
    const hy = realmShockHpBonus(g.yuki.realm || 0);
    if (hy > 0 && g.yuki.hp > 0) g.yuki.hp = Math.min(yukiHpMax(g), g.yuki.hp + hy);
    if (c.style === 'unarmed') { // v0.11.114 (PA2, UM): a round bare-handed, kept across every Coil (g.stats)
        const b0 = unarmedMastery(g); g.stats.unarmed = (g.stats.unarmed || 0) + 1;
        if (unarmedMastery(g) > b0) lines.push(SPAR_TEXT.masteryUp.replace('{b}', unarmedMastery(g)));
    }
    c.round += 1;
    advance(g, 1);
    c.log = lines;
    const down = c.enemies.every((e) => e.hp <= 0);
    if (down) {
        g.stats.kills += c.enemies.length;
        const xp = awardFightXp(g, c.style, c.band).concat(c.yukiOut ? [] : awardYukiFightXp(g, c.band)); // v0.11.82; v0.11.89 (X1) awardFightXp
        g.lastWin = { id: c.id, degree: c.degree || 1, next: c.win };
        lines.push('', 'It is over.', ...xp);
        const next = c.win;
        g.combat = null;
        return { lines, done: 'win', next };
    }
    if (g.james.hp <= 0 || c.round > NO_DICE_ROUND_CAP || c.stalled) { // v0.11.121 (AS1): or the air stalemate's sixth round
        if (g.james.hp > 0) lines.push('', c.stalled ? airStallLine(c, 'end', c.stalled) : 'Thirty exchanges in, your arms stop answering. You are spent, and they are not.');
        g.combat = null;
        g.james.hp = 1;
        const next = loseTo(g, c);
        return { lines, done: 'lose', next };
    }
    return { lines, done: null };
}

/** v0.11.114 (owner pick PA2, YD; research.md #136): in a spar or a brawl James may yield: the fight is lost at once (its
 *  written lost scene), and he keeps the HP he has. */
export function combatYield(g) {
    const c = g.combat;
    if (!c || !c.style) return null;
    unmeet(g, c.id); // v0.11.115 (MB1, FY): a yielded fight is not a meeting
    g.combat = null;
    advance(g, 1);
    return { lines: [SPAR_TEXT.yielded], done: 'lose', next: c.lose }; // PB1 (LY; review low 2): the fight's own lost scene, never the Coil
}

export function combatFlee(g) {
    const c = g.combat;
    if (!c || !c.flee) return null;
    const worst = Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk));
    const r = rollCheck(g, 'GU', worst);
    const lines = [`You run: ${checkText(r)} — ${r.success ? 'you get clear' : 'not fast enough'}.`];
    if (r.success) {
        unmeet(g, c.id); // v0.11.115 (MB1, FY): nor one he got clear of
        const next = c.flee;
        g.combat = null;
        advance(g, 10);
        return { lines, done: 'flee', next };
    }
    const biter = c.enemies.filter((e) => e.hp > 0).reduce((a, e) => (e.dmg > a.dmg ? e : a));
    const dmg = hitDamage(biter.dmg, biter.realm, g.james.realm, jamesDr(g));
    g.james.hp = Math.max(0, g.james.hp - dmg);
    lines.push(`Something bites on the way out: −${dmg} HP.`);
    if (c.wait) for (const k of Object.keys(c.wait)) c.wait[k] -= 1; // v0.11.116 (WB1, FR; review low 4): a failed run is a round for the rhythm
    c.stall = 0; // v0.11.121 (AS1, RV1 FR): a failed run is a round on the ground, so the air stalemate's count starts again
    if (g.james.hp <= 0) { g.combat = null; g.james.hp = 1; const next = loseTo(g, c); return { lines, done: 'lose', next }; }
    return { lines, done: null };
}

/* ---------------- saves ---------------- */

/**
 * Save format (v0.8.6): {"fmt":1,"sum":"<FNV-1a of data>","data":"<the game state as JSON>"}.
 * Old plain saves (the state as JSON, no wrapper) still load. State versions are migrated, never rejected.
 */
export const SAVE_FMT = 1;

/** FNV-1a 32-bit hash as 8 hex digits. */
export function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
}

/** Paths of numbers that are NaN or ±Infinity (a broken state must never be written). */
export function badNums(obj, path = 'g', out = []) {
    if (typeof obj === 'number') { if (!Number.isFinite(obj)) out.push(path); }
    else if (obj && typeof obj === 'object') for (const k of Object.keys(obj)) badNums(obj[k], `${path}.${k}`, out);
    return out;
}

/** A save that can't be loaded as it is. kind: empty | unreadable | checksum | tooNew | notSave | badNumbers. */
export class SaveError extends Error {
    constructor(kind, message) { super(message); this.kind = kind; }
}

/** State migrations, oldest first: MIGRATIONS[v] turns a version-v state into version v + 1. */
const MIGRATIONS = {
    1: (g) => { g.tasks = { queue: [] }; }, // v0.9.0: the task queue (empty)
    2: (g) => { Object.assign(g.tasks, { fam: {}, adapt: {}, yuki: { on: false, progress: 0 } }); }, // v0.9.2: familiarity 0 everywhere
    3: (g) => { g.coil = makeCoil(g); }, // v0.9.4: Coil 1; the rewind point is the save as loaded
    4: (g) => { if (inAct1(g)) startActCoil(g, 1); else if (g.coil) g.coil.act = 0; }, // v0.9.6: the Coil's act; mid-Act 1 = rewinds to the save as loaded
};

export function migrate(g) {
    if (g.v === undefined) g.v = 1;
    if (g.v > SAVE_VERSION) throw new SaveError('tooNew', `This save is from a newer version of the game (state ${g.v}; this version reads up to ${SAVE_VERSION}).`);
    while (g.v < SAVE_VERSION) { const step = MIGRATIONS[g.v]; if (!step) throw new SaveError('notSave', `No migration from state ${g.v}.`); step(g); g.v += 1; }
    return readFill(fliesFill(queueDrop(gaoFill(seenFill(oneCount(g))))));
}
/** v0.11.112 (owner pick AF1, M; Fable's FF1 review, low 1): a fight saved before flight in fights has no `flies` on its hawks and crows; they get it by name. Fills only. */
export function fliesFill(g) {
    for (const e of g?.combat?.enemies || []) if (e && e.flies === undefined && /hawk|crow/i.test(e.name || '')) e.flies = true;
    return g;
}
/** v0.11.64 (F): no queue any more: a saved queue is emptied (nothing in it had run) and a half-filled bar (`runPart`) dropped. The field stays, an empty list. */
export function queueDrop(g) {
    if (g?.tasks && Array.isArray(g.tasks.queue)) g.tasks.queue.length = 0;
    if (g) delete g.runPart;
    return g;
}
/** v0.11.40 (G1, Fable review): before v0.7.0 the Gao event could set `gao_dead`; the game reads only `gao_broken` now, so an old save carries it over. Fills only. */
export function gaoFill(g) {
    if (g?.flags?.gao_dead && !g.flags.gao_broken) g.flags.gao_broken = true;
    return g;
}
/**
 * v0.11.35 (P1-a): a save from before has no `seen` record. Past Coil 1, the scenes it picked a choice on count as read in an
 * earlier Coil (0); on Coil 1 it starts empty. Fills a missing field only.
 */
export function readFill(g) { // v0.11.133 (owner pick FP2, ME): a save from before starts with an empty record (its scenes show in full once more)
    if (g && !(g.read && typeof g.read === 'object' && !Array.isArray(g.read))) g.read = {}; // RF1 (L2): an array is no record
    return g;
}
export function seenFill(g) {
    if (!g || (g.seen && typeof g.seen === 'object')) return g;
    g.seen = {};
    if ((g.coil?.n || 1) > 1) for (const k of Object.keys(g.picked || {})) g.seen[k] = 0;
    return g;
}
/**
 * One Coil count per save (v0.11.26, owner 11:12). A save from before counted Act 1's Coils from 1: its count becomes the
 * prologue's Coils (stats.coils0) + Act 1's − 1. Marks the Coil (one: true) so this runs once. Called after migrate().
 */
export function oneCount(g) {
    const c = g?.coil;
    if (!c || c.one) return g;
    if ((c.act || 0) === 1) c.n = Math.max(1, (g.stats?.coils0 || 1) + (c.n || 1) - 1);
    c.one = true;
    return g;
}


export function serialize(g) {
    const bad = badNums(g);
    if (bad.length) throw new SaveError('badNumbers', `Not saved: broken numbers at ${bad.slice(0, 3).join(', ')}${bad.length > 3 ? ' …' : ''}.`);
    const data = JSON.stringify(g);
    return JSON.stringify({ fmt: SAVE_FMT, sum: fnv1a(data), data });
}

/** Unwrap a save string to its state JSON. force: ignore a checksum mismatch and a too-new format. */
export function unwrapSave(text, { force = false } = {}) {
    if (text == null || text === '') throw new SaveError('empty', 'There is no save here.');
    let outer;
    try { outer = JSON.parse(text); } catch { throw new SaveError('unreadable', 'The save is not readable (damaged or cut off).'); }
    if (outer && typeof outer === 'object' && 'fmt' in outer && typeof outer.data === 'string') {
        if (outer.fmt > SAVE_FMT && !force) throw new SaveError('tooNew', 'This save is from a newer version of the game.');
        if (fnv1a(outer.data) !== outer.sum && !force) throw new SaveError('checksum', 'The save failed its checksum (it was changed or damaged).');
        return outer.data;
    }
    return text; // an old plain save
}

/** A short description of a save without loading it ("<scene id>|<minutes>"), or null. */
export function peekSave(text) {
    try { const s = JSON.parse(unwrapSave(text, { force: true })); return s && s.scene ? { scene: s.scene, minutes: s.minutes, coil: (s.coil ? oneCount(JSON.parse(JSON.stringify(s))).coil.n : 0), act: s.coil?.act || 0 } : null; /* v0.11.26: the one count, as it loads */ } catch { return null; } // v0.11.13: with the Coil, for the save lists
}

export function deserialize(text, { force = false } = {}) {
    const data = unwrapSave(text, { force });
    let g;
    try { g = JSON.parse(data); } catch { throw new SaveError('unreadable', 'The save is not readable (damaged or cut off).'); }
    if (!g || typeof g !== 'object' || !g.james || !g.scene) throw new SaveError('notSave', 'This is not a Bone and Ash save.');
    if (force && g.v > SAVE_VERSION) g.v = SAVE_VERSION; // "load anyway": read a newer state as best it can
    migrate(g);
    const bad = badNums(g);
    if (bad.length && !force) throw new SaveError('badNumbers', `The save has broken numbers at ${bad.slice(0, 3).join(', ')}.`);
    if (bad.length) for (const p of bad) { const keys = p.split('.').slice(1); let o = g; for (const k of keys.slice(0, -1)) o = o[k]; o[keys.at(-1)] = 0; }
    return ensureBars(g);
}
