/**
 * James RPG — game core. Same Qi rules as Rules Engine C (formulas.js is the engine's own file):
 * check = 0.5 × rank, XP cost = 50·k·T·L (k 0.5), Qi Max = 20 + Use check + open primaries + realm bonus,
 * Convergence ×1.25, HP = 20 + 2 × GU check (realm-filled), regen per Cycle (T1 = 30 min) 5% HP, 5% + 0.1 per
 * open collateral Qi. New for a game without a narrator: every check is value + d6 against the DC.
 * Pure — no DOM. The UI (main.js) and the tests drive it.
 */
import { setFormsActive, actionOpen, actionLabel, fragileKnife } from './forms.js';
import {
    checkFromTierLevel, skillXpCost, maxHp, qiPoolMax, qiRegenPercent, cycleTimeMinutes,
    realmBonus, realmStepLabel, condensationSatGain, CONDENSE_SIT_COST, FAIL_XP_FRACTION, realmDr, realmShockHpBonus, dampenMultiplier,
} from './formulas.js';

export const K = 0.5;
export const CONVERGENCE_MULTIPLIER = 1.25;
export const START_MINUTES = 6 * 60 + 40; // Day 1, 06:40
export const SATIETY_PER_HOUR = 3;
export const HUNGRY_AT = 30;
export let STARVE_HP_PER_HOUR = 1.5; // task mode (v0.10.0, owner pick b): 1.5 HP per starving hour; classic keeps its old rule
export const setStarveRate = (n) => { STARVE_HP_PER_HOUR = n; }; // simulations only
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
    return g;
}

/* ---------------- the Coil (v0.9.4, step 3c-1) ---------------- */

/** A copy of the state to rewind to: the act's first dawn (a new game), or an old save as it was loaded. */
export function coilSnap(g) {
    const s = JSON.parse(JSON.stringify({ ...g, coil: undefined }));
    delete s.coil;
    s.log = []; s.combat = null; s.lastWin = null;
    if (s.tasks) s.tasks.queue = [];
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
    return { act, n: 1, snap: coilSnap(g), start: coilStart(g), peak, played: {}, replay: null, why: null, back: null, known: [], skipEnter: false };
}
/** Act 1 begins (v0.9.6): a new Coil whose rewind point is this moment (Day 8 dawn, the prologue's outcome kept). */
export function startActCoil(g, act = 1) {
    const old = g.coil;
    g.coil = makeCoil(g, act);
    g.coil.wake = g.scene;
    if (old) { g.coil.known = [...(old.known || [])]; g.stats[`coils${old.act || 0}`] = old.n; }
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
 * The extra meridians (v0.8): Extraordinary 8 (Foundation → Soul Embryo; closes at Nascent Soul), their 28 collaterals
 * and 10 junctions (Nascent Soul+). Gábor 2026-11-02: each raises the Qi regen percentage per Cycle — Extraordinary
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

/* ---------------- dice ---------------- */

/** Deterministic d6 from the save's own seed (a reload does not reroll). */
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
 * makes James and Yuki learn faster: ×(1 + 0.5 × earlier Coils). It multiplies XP and the Saturation a sit gives,
 * and divides the meridian session DCs. Story Mode: ×1.
 */
export const COIL_GROWTH = 0.5;
export const coilMult = (g) => (noDice ? 1 + COIL_GROWTH * Math.max(0, (g?.coil?.n || 1) - 1) : 1);
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
export function awardXp(g, skillName, band = 'standard', { fail = false, factor = 1 } = {}) {
    const name = actingName(g, skillName);
    const n = getSkill(g, name);
    let pool = (XP_BANDS[band] ?? 30) * n.tier;
    if (fail) pool = Math.floor(pool * FAIL_XP_FRACTION);
    if (factor !== 1) pool = Math.floor(pool * factor); // a partial result on a task card (v0.9.2)
    pool = Math.floor(pool * coilMult(g)); // the Coil bonus (v0.11.0)
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
export function awardYukiFightXp(g, band = 'standard') {
    const pool = Math.floor((XP_BANDS[band] ?? 30) * g.yuki.fight.tier * coilMult(g));
    const ups = addXp(g.yuki.fight, pool);
    return [atSkillCap(g.yuki.fight) && !ups.length ? 'Yuki Fight at T10 L10 (cap)' : `Yuki Fight +${pool}${ups.length ? ` → ${ups.at(-1)}` : ''}`];
}

/**
 * A check: acting value + d6 against the DC. Returns everything the UI shows.
 * @returns {{ skill, value, die, total, dc, success, crit, fumble }}
 */
/* No dice (v0.9.3, task mode): check ÷ DC decides; DCs move down by NO_DICE_DC_SHIFT (the d6 averaged 3.5). Set by the UI and the tests. */
let noDice = false;
export const setNoDice = (v) => { noDice = !!v; };
export const isNoDice = () => noDice;
setFormsActive(() => noDice); // v0.10.4: the forms ladder applies in Incremental Mode only
export const NO_DICE_DC_SHIFT = 2;
let noDiceTune = {};
/** The story layer hands over its per-fight no-dice tuning (js/story/nodice_tune.js). */
export const setNoDiceTune = (t) => { noDiceTune = t || {}; };
export const noDiceDc = (dc) => Math.max(0.5, Math.round((dc - NO_DICE_DC_SHIFT) * 10) / 10);
/** How a check reads in the log: "GU 1 / DC 2" without dice, "GU 1 + 🎲4 = 5 vs DC 3" with. */
export const checkText = (r) => (r.die == null ? `${r.skill} ${r.value} / DC ${r.dc}` : `${r.skill} ${r.value} + 🎲${r.die} = ${r.total} vs DC ${r.dc}`);

export function rollCheck(g, skillName, dc, bonus = 0) {
    if (noDice) {
        const value = Math.round((actingCheck(g, skillName) + bonus) * 10) / 10;
        const d = noDiceDc(dc);
        const ratio = value / d;
        g.stats.checks += 1;
        const success = ratio >= 1;
        if (success) g.stats.wins += 1;
        return { skill: actingName(g, skillName), value, die: null, total: value, dc: d, ratio, success, six: false, crit: ratio >= 2, fumble: false };
    }
    const value = actingCheck(g, skillName) + bonus;
    const die = d6(g);
    const total = Math.round((value + die) * 10) / 10;
    g.stats.checks += 1;
    const success = die === 6 ? true : die === 1 ? total >= dc + 2 : total >= dc;
    if (success) g.stats.wins += 1;
    return { skill: actingName(g, skillName), value, die, total, dc, success, six: die === 6, crit: success && dc > 0 && total >= 2 * dc, fumble: die === 1 };
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
/** The status-bar clock (v0.9.9): Day N, HH:MM:SS. `minutes` may be fractional (a running bar); the seconds come from the fraction. */
export function clockLabelSec(g, minutes = g.minutes) {
    if (g.flags?.lf_active) return 'The Long Forest';
    const whole = Math.floor(minutes), sec = Math.min(59, Math.floor((minutes - whole) * 60));
    return `${clockLabel(whole)}:${String(sec).padStart(2, '0')}`;
}
export function clockLabel(minutes) {
    const p = clockParts(minutes);
    return `Day ${p.day}, ${String(p.hh).padStart(2, '0')}:${String(p.mm).padStart(2, '0')}`;
}
export function isNight(g) {
    const h = clockParts(g.minutes).hh;
    return h >= 20 || h < 6;
}

/** Time passes: hunger, then regen per Cycle (T1 30 min) — HP 5%, Qi 5% + 0.1 per open collateral. */
export function advance(g, minutes, { resting = false } = {}) {
    const m = Math.max(0, Math.round(minutes));
    if (!m) return [];
    const notes = [];
    g.minutes += m;
    const fed0 = Math.max(0, g.james.satiety);
    g.james.satiety -= (SATIETY_PER_HOUR * m) / 60;
    if (g.james.satiety <= 0 && !noDice) { // classic: the old rule, at least 1 HP per clock step
        g.james.satiety = 0;
        const loss = Math.max(1, Math.floor(m / 60));
        g.james.hp -= loss;
        notes.push(`Starving: −${loss} HP`);
    } else if (g.james.satiety <= 0) {
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

/** A full night (or long rest): bars to Max, clock to the given hour of the next morning. */
export function sleepUntil(g, hour = 6) {
    const p = clockParts(g.minutes);
    let target = (p.day - 1) * 1440 + hour * 60;
    if (target <= g.minutes) target += 1440;
    const span = target - g.minutes;
    g.minutes = target;
    g.james.satiety = Math.max(0, g.james.satiety - (SATIETY_PER_HOUR * span) / 60 / 2);
    g.james.hp = jamesHpMax(g);
    g.james.qi = jamesQiMax(g);
    g.yuki.hp = yukiHpMax(g);
    g.yuki.qi = yukiQiMax(g);
    ensureBars(g);
    return span;
}

/* ---------------- Qi ---------------- */

export function spendQi(g, amount) {
    if (g.james.qi < amount) return false;
    g.james.qi = Math.round((g.james.qi - amount) * 1000) / 1000;
    return true;
}

/** Condensation: a conscious sit, 10 Qi a sit, 0 XP; raises Saturation. Spends Qi, never refills it. */
export function condense(g) {
    if (!spendQi(g, CONDENSE_SIT_COST)) return { ok: false };
    const gain = Math.round(condensationSatGain(CONDENSE_SIT_COST, jamesQiMax(g)) * coilMult(g) * 10) / 10;
    g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10);
    advance(g, 30);
    return { ok: true, gain, saturation: g.james.saturation };
}

/**
 * Breakthrough: at 100% Saturation, the next realm. Saturation resets, both bars refill to the new Max.
 * Yuki is root-kin and rises with James. No herbs, no pills, no tribulation (the Ouroboros Axiom).
 */
export const MAX_REALM = 14;
/** Engine rule L in task mode (v0.9.4): from 95% Saturation (anything over 100% is lost; nothing carries over). Classic: 100%. */
export const breakAt = () => (noDice ? 95 : 100);
export const PRIMARIES_FOR_FOUNDATION = 12;
/** Saturation is ready but the realm's gate isn't met (v0.9.6: Foundation needs all 12 primaries). '' if nothing blocks. */
export const breakBlock = (g) => (g.james.realm === 0 && (g.james.primaries ?? 12) < PRIMARIES_FOR_FOUNDATION ? `needs all 12 primaries (${g.james.primaries}/12)` : '');
export const breakReady = (g) => g.james.saturation >= breakAt() && g.james.realm < MAX_REALM;
export const canBreakThrough = (g) => breakReady(g) && !breakBlock(g);
export function breakthrough(g) {
    if (!canBreakThrough(g)) return { ok: false };
    const before = { hp: jamesHpMax(g), qi: jamesQiMax(g), yhp: yukiHpMax(g), yqi: yukiQiMax(g) };
    advance(g, 120, { resting: true });
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
 * What the tier does in a fight (Convergence Use tier; all three attacks are Bonesinger constructs, even the GU-swung blade):
 *   damage × tier (darts 2–4 → T10 20–40); Qi cost × engine dampen max(0.25, 1 − 0.0375·(T−1));
 *   T3+ pierces enemy DR (hardened steel) and James wears wraithbone plates: +1 DR per tier from T3 (T10: +8);
 *   T4+ darts strike two enemies (several pieces), T5+ every enemy (many pieces);
 *   T7+ a bone construct fights beside him (tier × 1–3 a round on the first enemy standing);
 *   T8+ the construct, on its own judgement, steps into the first blow aimed at him each round;
 *   T10 his constructs never miss (they cut what should not be cut).
 */
export const boneTier = (g) => Math.min(SKILL_MAX_TIER, g.james.skills['Convergence Use'].tier);
export const actionCost = (g, a) => (a.qi ? Math.round(a.qi * dampenMultiplier(boneTier(g)) * 10) / 10 : 0);
export const actionDmg = (g, a) => [a.dmg[0] * boneTier(g), a.dmg[1] * boneTier(g)];
export const armourDr = (g) => Math.max(0, boneTier(g) - 2);

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

export function bumpRel(g, who, f = 0, a = 0) {
    const r = g.rel[who] || (g.rel[who] = { f: 0, a: 0 });
    r.f = Math.max(-150, Math.min(150, r.f + f));
    r.a = Math.max(-150, Math.min(150, r.a + a));
    if (g.coil) { const p = g.coil.peak[who] || (g.coil.peak[who] = { f: r.f, a: r.a }); p.f = Math.max(p.f, r.f); p.a = Math.max(p.a, r.a); } // the Coil's head start (v0.9.4)
    return r;
}

/* ---------------- combat ---------------- */

/**
 * One exchange. James acts (dart / blade / dodge / Yuki-strike), Yuki strikes on her own, then every enemy
 * still standing attacks: James defends with GU + d6 against the enemy's attack DC; a hit deals its damage
 * minus DR 1 (Ouroboros).
 */
export const COMBAT_ACTIONS = {
    dart: { id: 'dart', label: 'Bone darts', skill: 'Convergence Use', qi: 2, dmg: [2, 4], dcMod: 0 },
    blade: { label: 'Wraithbone blade', skill: 'GU', qi: 3, dmg: [3, 6], dcMod: 1, keeps: 'blade' },
    needle: { label: 'Needle to a joint', skill: 'Convergence Use', qi: 4, dmg: [1, 2], dcMod: 2, stagger: true },
    guard: { label: 'Guard and give ground', skill: 'GU', qi: 0, dmg: [0, 0], dcMod: -1, guard: true },
};

function dmgRoll(g, [lo, hi]) {
    if (hi <= 0) return 0;
    if (noDice) return Math.round((lo + hi) / 2);
    return lo + ((d6(g) - 1) % (hi - lo + 1));
}

/** Story-layer hooks: `before(g, enc)` may adjust an encounter (Long Forest scaling, posture text, degree). */
export const combatHooks = { before: null, lose: null };
/** Fights against people (v0.9.7): losing them keeps their written branches. Every other fight is a beast. */
export const PEOPLE_FIGHTS = new Set(['gao', 'collectors', 'arson', 'ya_brawl', 'rt_brawl', 'elder', 'sect_watcher', 'lf_rogue']);
/** Task mode (v0.9.7, owner's pick 3a): every beast fight +0.5 DC and attack on top of its no-dice tuning. */
export const BEAST_UP = 0.5;
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
    g.stats.kills += e.enemies.length;
    const xp = awardXp(g, 'Convergence Use', e.band || 'standard').concat(awardYukiFightXp(g, e.band || 'standard'));
    g.lastWin = { id: e.id, degree: e.degree || 3, next: e.win };
    advance(g, 1);
    return { lines: xp, next: e.win, enc: e };
}

export function startCombat(g, enc0) {
    const enc = combatHooks.before ? (combatHooks.before(g, enc0) || enc0) : enc0;
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
            const t0 = noDice ? noDiceTune[enc.id] : null; // v0.9.3: per-fight tuning for the no-dice rules
            const t = noDice && !PEOPLE_FIGHTS.has(enc.id) ? { ...(t0 || {}), up: ((t0 && t0.up) || 0) + BEAST_UP } : t0; // v0.9.7: beasts +0.5
            const x = t ? { ...e, dc: e.dc + (t.up || 0), atk: e.atk + (t.up || 0), hp: Math.max(1, Math.round(e.hp * (t.hp || 1))) } : e;
            return { ...x, hpMax: x.hp, staggered: false };
        }),
        log: [enc.intro || 'Combat!'],
    };
    return g.combat;
}

export const NO_DICE_ROUND_CAP = 30; // a no-dice fight still undecided after this many rounds is lost: James is spent
const ADAPT_FIGHT_STEP = 0.5, ADAPT_FIGHT_MAX = 2;
const bandOf = (ratio) => (ratio >= 2 ? 'double' : ratio >= 1 ? 'full' : ratio >= 0.5 ? 'glance' : 'miss');

/** A no-dice round (v0.9.3): check ÷ DC in bands. Hits: ≥ 2 double, ≥ 1 full, ≥ 0.5 a glancing blow (half), below a miss.
 *  Defence the same way round: ≥ 1 avoided, ≥ 0.5 half the damage, below the full blow. Intuitive Aptitude: each miss
 *  or glance raises that action's check by 0.5 for the rest of the fight (up to +2); Yuki adapts the same way. */
function stepNoDice(g, actionId, targetIdx) {
    const c = g.combat;
    c.adapt = c.adapt || {};
    const lines = [];
    if (!actionOpen(g, actionId)) actionId = 'guard'; // v0.10.4: a form he can't sing yet
    const act = { ...COMBAT_ACTIONS[actionId], label: actionLabel(g, actionId, COMBAT_ACTIONS[actionId].label) };
    const living = c.enemies.filter((e) => e.hp > 0);
    const target = living[Math.min(targetIdx, living.length - 1)];
    let guard = false;
    const qiNeed = act.keeps === 'blade' && c.bladeFormed ? 0 : actionCost(g, act);
    if (qiNeed && !spendQi(g, qiNeed)) {
        lines.push(`Not enough Qi for ${act.label} — you fall back on guarding.`);
        guard = true;
    } else {
        if (act.keeps === 'blade' && !c.bladeFormed) { c.bladeFormed = true; lines.push(`White wraithbone slides out of your palm and sets: ${act.label.toLowerCase()}.`); }
        if (act.guard) {
            guard = true;
            lines.push('You give ground, watching for the opening.');
        } else {
            if (act.keeps === 'blade' && fragileKnife(g)) { c.bladeFormed = false; lines.push('The knife shatters on the swing. You will have to sing another.'); } // v0.10.4: breaks every swing below T1 L8
            const T = boneTier(g);
            const targets = act.id === 'dart' && T >= 4 ? living.slice(0, T >= 5 ? living.length : 2) : [target];
            const key = actionId;
            let learned = false;
            for (const tg of targets) {
                const r = rollCheck(g, act.skill, tg.dc + act.dcMod, c.adapt[key] || 0);
                const band = T >= 10 && r.ratio < 1 ? 'full' : bandOf(r.ratio);
                lines.push(`${act.label}${targets.length > 1 ? ` → ${tg.name}` : ''}: ${checkText(r)} — ${{ double: 'a clean, deep hit', full: 'hit', glance: 'a glancing blow', miss: 'miss' }[band]}`);
                if ((band === 'glance' || band === 'miss') && !learned && (c.adapt[key] || 0) < ADAPT_FIGHT_MAX) { c.adapt[key] = (c.adapt[key] || 0) + ADAPT_FIGHT_STEP; learned = true; lines.push(`  You read the opening better. (+${ADAPT_FIGHT_STEP} to ${act.label} this fight)`); }
                if (band === 'miss') continue;
                let dmg = dmgRoll(g, actionDmg(g, act)) * (band === 'double' ? 2 : 1);
                if (band === 'glance') dmg = Math.floor(dmg / 2);
                dmg = Math.max(0, dmg - (T >= 3 ? 0 : (tg.dr || 0)));
                tg.hp -= dmg;
                lines.push(`  ${tg.name} takes ${dmg}${band === 'double' ? ' (double damage)' : ''}.`);
                if (act.stagger && tg.hp > 0 && band !== 'glance') { tg.staggered = true; lines.push(`  ${tg.name} staggers.`); }
            }
        }
    }
    const ct = boneTier(g) >= 7 ? c.enemies.find((e) => e.hp > 0) : null;
    if (ct) { const dmg = boneTier(g) * 2; ct.hp -= dmg; lines.push(`Your bone construct strikes ${ct.name}: ${dmg}.`); }
    let shield = boneTier(g) >= 8;
    const yt = c.enemies.find((e) => e.hp > 0);
    if (yt && g.yuki.hp > 0) {
        const form = YUKI_FORMS[yukiForm(g)];
        const yv = Math.round((skillCheck(g.yuki.fight) + form.hit + (c.adapt.yuki || 0)) * 10) / 10;
        const d = noDiceDc(yt.dc);
        const band = bandOf(yv / d);
        const verb = { cat: ['claws find a mark', 'a hiss and a swipe at air'], tiger: ['a paw the size of a shovel lands', 'jaws close on air'], human: ['a white blur and a strike', 'a sidestep, nothing more'] }[yukiForm(g)];
        lines.push(`${form.name}: Fight ${yv} / DC ${d} — ${band === 'miss' ? verb[1] : band === 'glance' ? 'a graze' : verb[0]}`);
        if ((band === 'glance' || band === 'miss') && (c.adapt.yuki || 0) < ADAPT_FIGHT_MAX) c.adapt.yuki = (c.adapt.yuki || 0) + ADAPT_FIGHT_STEP;
        if (band !== 'miss') {
            let dmg = Math.round((form.dmg[0] + form.dmg[1]) / 2) * (band === 'double' ? 2 : 1);
            if (band === 'glance') dmg = Math.floor(dmg / 2);
            dmg = Math.max(0, dmg - (yt.dr || 0));
            yt.hp -= dmg; lines.push(`  ${yt.name} takes ${dmg}.`);
        }
    }
    for (const e of c.enemies) {
        if (e.hp <= 0) continue;
        if (e.staggered) { e.staggered = false; lines.push(`${e.name} is still reeling.`); continue; }
        if (e.prefersSmall && g.yuki.hp > 0 && c.round % 3 === 0) { // every third round it goes for the small one
            const dodge = skillCheck(g.yuki.fight) + 1 >= noDiceDc(e.atk);
            lines.push(`${e.name} lunges at Yuki — ${dodge ? 'she is not there' : 'it connects'}.`);
            if (!dodge) g.yuki.hp = Math.max(1, g.yuki.hp - hitDamage(e.dmg, e.realm, g.yuki.realm, yukiDr(g)));
            continue;
        }
        if (shield) { shield = false; lines.push(`${e.name} attacks — your construct steps into the blow.`); continue; }
        const r = rollCheck(g, 'GU', e.atk, guard ? 2 : 0);
        if (r.ratio >= 1) { lines.push(`${e.name} attacks: you defend (${checkText(r)}) — avoided.`); continue; }
        let dmg = hitDamage(e.dmg, e.realm, g.james.realm, jamesDr(g));
        if (r.ratio >= 0.5) dmg = Math.floor(dmg / 2);
        g.james.hp = Math.max(0, g.james.hp - dmg);
        lines.push(`${e.name} attacks: you defend (${checkText(r)}) — ${r.ratio >= 0.5 ? 'it only half lands' : 'it lands'}: ${dmg} (DR ${jamesDr(g)}).`);
    }
    return lines;
}

export function combatStep(g, actionId, targetIdx = 0) {
    const c = g.combat;
    if (!c) return null;
    if (noDice) return finishRound(g, stepNoDice(g, actionId, targetIdx));
    const lines = [];
    const act = COMBAT_ACTIONS[actionId];
    const living = c.enemies.filter((e) => e.hp > 0);
    const target = living[Math.min(targetIdx, living.length - 1)];
    let guard = false;
    const qiNeed = act.keeps === 'blade' && c.bladeFormed ? 0 : actionCost(g, act);
    if (qiNeed && !spendQi(g, qiNeed)) {
        lines.push(`Not enough Qi for ${act.label} — you fall back on guarding.`);
        guard = true;
    } else {
        if (act.keeps === 'blade' && !c.bladeFormed) { c.bladeFormed = true; lines.push('White wraithbone slides out of your palm and sets into a blade.'); }
        if (act.guard) {
            guard = true;
            lines.push('You give ground, watching for the opening.');
        } else {
            const T = boneTier(g);
            const targets = act.id === 'dart' && T >= 4 ? living.slice(0, T >= 5 ? living.length : 2) : [target];
            for (const tg of targets) {
                const dc = tg.dc + act.dcMod;
                const r = rollCheck(g, act.skill, dc);
                const hit = r.success || T >= 10;
                lines.push(`${act.label}${targets.length > 1 ? ` → ${tg.name}` : ''}: ${r.skill} ${r.value} + 🎲${r.die} = ${r.total} vs DC ${dc} — ${hit ? 'hit' : 'miss'}${!r.success && hit ? ' (it cuts what should not be cut)' : ''}`);
                if (!hit) continue;
                let dmg = dmgRoll(g, actionDmg(g, act)) * (r.crit ? 2 : 1);
                dmg = Math.max(0, dmg - (T >= 3 ? 0 : (tg.dr || 0)));
                tg.hp -= dmg;
                lines.push(`  ${tg.name} takes ${dmg}${r.crit ? ' (critical — double damage)' : ''}.`);
                if (act.stagger && tg.hp > 0) { tg.staggered = true; lines.push(`  ${tg.name} staggers.`); }
            }
        }
    }
    // T7+: a bone construct fights beside him
    const ct = boneTier(g) >= 7 ? c.enemies.find((e) => e.hp > 0) : null;
    if (ct) { const dmg = boneTier(g) * (1 + ((d6(g) - 1) % 3)); ct.hp -= dmg; lines.push(`Your bone construct strikes ${ct.name}: ${dmg}.`); }
    let shield = boneTier(g) >= 8;
    // Yuki
    const yt = c.enemies.find((e) => e.hp > 0);
    if (yt && g.yuki.hp > 0) {
        const form = YUKI_FORMS[yukiForm(g)];
        const yv = skillCheck(g.yuki.fight) + form.hit;
        const die = d6(g);
        const hit = yv + die >= yt.dc;
        const verb = { cat: ['claws find a mark', 'a hiss and a swipe at air'], tiger: ['a paw the size of a shovel lands', 'jaws close on air'], human: ['a white blur and a strike', 'a sidestep, nothing more'] }[yukiForm(g)];
        lines.push(`${form.name}: Fight ${yv} + 🎲${die} vs DC ${yt.dc} — ${hit ? verb[0] : verb[1]}`);
        if (hit) { const [lo, hi] = form.dmg; const raw = yukiForm(g) === 'cat' ? 1 + (die >= 5 ? 1 : 0) : lo + ((die - 1) % (hi - lo + 1)); const dmg = Math.max(0, raw - (yt.dr || 0)); yt.hp -= dmg; lines.push(`  ${yt.name} takes ${dmg}.`); }
    }
    // enemies
    for (const e of c.enemies) {
        if (e.hp <= 0) continue;
        if (e.staggered) { e.staggered = false; lines.push(`${e.name} is still reeling.`); continue; }
        const aimYuki = e.prefersSmall && g.yuki.hp > 0 && d6(g) <= 2;
        if (aimYuki) {
            const die = d6(g);
            const dodge = skillCheck(g.yuki.fight) + die + 1 >= e.atk;
            lines.push(`${e.name} lunges at Yuki — ${dodge ? 'she is not there' : 'it connects'}.`);
            if (!dodge) g.yuki.hp = Math.max(1, g.yuki.hp - hitDamage(e.dmg, e.realm, g.yuki.realm, yukiDr(g)));
            continue;
        }
        if (shield) { shield = false; lines.push(`${e.name} attacks — your construct steps into the blow.`); continue; }
        const r = rollCheck(g, 'GU', e.atk, guard ? 2 : 0);
        if (r.success) {
            lines.push(`${e.name} attacks: you defend (GU ${r.value} + 🎲${r.die} = ${r.total} vs ${e.atk}) — avoided.`);
        } else {
            const dmg = hitDamage(e.dmg, e.realm, g.james.realm, jamesDr(g));
            g.james.hp = Math.max(0, g.james.hp - dmg);
            lines.push(`${e.name} attacks: you defend (GU ${r.value} + 🎲${r.die} = ${r.total} vs ${e.atk}) — hit for ${dmg} (DR ${jamesDr(g)}${(g.james.realm || 0) >= 7 && (g.james.realm || 0) > (e.realm || 0) ? ', realm gap' : ''}).`);
        }
    }
    return finishRound(g, lines);
}

/** The end of every round, dice or not: realm healing, time, win / lose. */
function finishRound(g, lines) {
    const c = g.combat;
    // immortal flesh: from Immortal Ascension, wounds close mid-fight
    const hj = realmShockHpBonus(g.james.realm || 0);
    if (hj > 0 && g.james.hp > 0 && g.james.hp < jamesHpMax(g)) { const before = g.james.hp; g.james.hp = Math.min(jamesHpMax(g), g.james.hp + hj); lines.push(`Your flesh closes: +${Math.round((g.james.hp - before) * 10) / 10} HP.`); }
    const hy = realmShockHpBonus(g.yuki.realm || 0);
    if (hy > 0 && g.yuki.hp > 0) g.yuki.hp = Math.min(yukiHpMax(g), g.yuki.hp + hy);
    c.round += 1;
    advance(g, 1);
    c.log = lines;
    const down = c.enemies.every((e) => e.hp <= 0);
    if (down) {
        g.stats.kills += c.enemies.length;
        const xp = awardXp(g, 'Convergence Use', c.band).concat(awardYukiFightXp(g, c.band));
        g.lastWin = { id: c.id, degree: c.degree || 1, next: c.win };
        lines.push('', 'It is over.', ...xp);
        const next = c.win;
        g.combat = null;
        return { lines, done: 'win', next };
    }
    if (g.james.hp <= 0 || (noDice && c.round > NO_DICE_ROUND_CAP)) {
        if (g.james.hp > 0) lines.push('', 'Thirty exchanges in, your arms stop answering. You are spent, and they are not.');
        g.combat = null;
        g.james.hp = 1;
        const next = loseTo(g, c);
        return { lines, done: 'lose', next };
    }
    return { lines, done: null };
}

export function combatFlee(g) {
    const c = g.combat;
    if (!c || !c.flee) return null;
    const worst = Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk));
    const r = rollCheck(g, 'GU', worst);
    const lines = [`You run: ${checkText(r)} — ${r.success ? 'you get clear' : 'not fast enough'}.`];
    if (r.success) {
        const next = c.flee;
        g.combat = null;
        advance(g, 10);
        return { lines, done: 'flee', next };
    }
    const biter = c.enemies.filter((e) => e.hp > 0).reduce((a, e) => (e.dmg > a.dmg ? e : a));
    const dmg = hitDamage(biter.dmg, biter.realm, g.james.realm, jamesDr(g));
    g.james.hp = Math.max(0, g.james.hp - dmg);
    lines.push(`Something bites on the way out: −${dmg} HP.`);
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
    try { const s = JSON.parse(unwrapSave(text, { force: true })); return s && s.scene ? { scene: s.scene, minutes: s.minutes } : null; } catch { return null; }
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
