/**
 * James RPG — game core. Same Qi rules as Rules Engine C (formulas.js is the engine's own file):
 * check = 0.5 × rank, XP cost = 50·k·T·L (k 0.5), Qi Max = 20 + Use check + open primaries + realm bonus,
 * Convergence ×1.25, HP = 20 + 2 × GU check (realm-filled), regen per Cycle (T1 = 30 min) 5% HP, 5% + 0.1 per
 * open collateral Qi. New for a game without a narrator: every check is value + d6 against the DC.
 * Pure — no DOM. The UI (main.js) and the tests drive it.
 */
import {
    checkFromTierLevel, skillXpCost, maxHp, qiPoolMax, qiRegenPercent, cycleTimeMinutes,
    realmBonus, realmStepLabel, condensationSatGain, CONDENSE_SIT_COST, FAIL_XP_FRACTION, realmDr, realmShockHpBonus,
} from './formulas.js';

export const K = 0.5;
export const CONVERGENCE_MULTIPLIER = 1.25;
export const START_MINUTES = 6 * 60 + 40; // Day 1, 06:40
export const SATIETY_PER_HOUR = 3;
export const HUNGRY_AT = 30;
export const XP_BANDS = { routine: 0, standard: 30, challenging: 60, major: 120 };
export const SAVE_VERSION = 1;

const node = (tier = 1, level = 1) => ({ tier, level, xp: 0 });

/** A fresh game: James (40, fresh doctorate), Yuki, an empty hammerspace. */
export function newGame(seed = Date.now()) {
    return {
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
            primaries: 12,
            collaterals: 66,
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
            primaries: 12,
            collaterals: 66,
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
    };
}

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
export const jamesDr = (g) => (g.james.dr || 0) + realmDr(g.james.realm || 0);
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

function addXp(n, amount) {
    const ups = [];
    n.xp += amount;
    for (;;) {
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
export function awardXp(g, skillName, band = 'standard', { fail = false } = {}) {
    const name = actingName(g, skillName);
    const n = getSkill(g, name);
    let pool = (XP_BANDS[band] ?? 30) * n.tier;
    if (fail) pool = Math.floor(pool * FAIL_XP_FRACTION);
    if (!pool) return [];
    const out = [];
    const heads = name === 'GU' ? 1 : 2;
    const share = Math.floor(pool / heads);
    const up1 = addXp(n, share);
    out.push(`${name} +${share} XP${up1.length ? ` → ${up1.at(-1)}` : ''}`);
    if (name !== 'GU') {
        const up2 = addXp(g.james.gu, share);
        out.push(`GU +${share} XP${up2.length ? ` → ${up2.at(-1)}` : ''}`);
    }
    const yShare = Math.floor(pool / 2);
    const up3 = addXp(g.yuki.qiUse, yShare);
    out.push(`Yuki (bond) Qi Use +${yShare}${up3.length ? ` → ${up3.at(-1)}` : ''}`);
    ensureBars(g);
    return out;
}
export function awardYukiFightXp(g, band = 'standard') {
    const pool = (XP_BANDS[band] ?? 30) * g.yuki.fight.tier;
    const ups = addXp(g.yuki.fight, pool);
    return [`Yuki Fight +${pool}${ups.length ? ` → ${ups.at(-1)}` : ''}`];
}

/**
 * A check: acting value + d6 against the DC. Returns everything the UI shows.
 * @returns {{ skill, value, die, total, dc, success, crit, fumble }}
 */
export function rollCheck(g, skillName, dc, bonus = 0) {
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
    g.james.satiety -= (SATIETY_PER_HOUR * m) / 60;
    if (g.james.satiety <= 0) {
        g.james.satiety = 0;
        const loss = Math.max(1, Math.floor(m / 60));
        g.james.hp -= loss;
        notes.push(`Starving: −${loss} HP`);
    }
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
    const gain = condensationSatGain(CONDENSE_SIT_COST, jamesQiMax(g));
    g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10);
    advance(g, 30);
    return { ok: true, gain, saturation: g.james.saturation };
}

/**
 * Breakthrough: at 100% Saturation, the next realm. Saturation resets, both bars refill to the new Max.
 * Yuki is root-kin and rises with James. No herbs, no pills, no tribulation (the Ouroboros Axiom).
 */
export const MAX_REALM = 14;
export const canBreakThrough = (g) => g.james.saturation >= 100 && g.james.realm < MAX_REALM;
export function breakthrough(g) {
    if (!canBreakThrough(g)) return { ok: false };
    const before = { hp: jamesHpMax(g), qi: jamesQiMax(g), yhp: yukiHpMax(g), yqi: yukiQiMax(g) };
    advance(g, 120, { resting: true });
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

/** Bonesinger at Convergence Use tier (the T1 rung added for this game; T2+ as in the SillyTavern preset). */
export const BONESINGER_TIERS = [
    null,
    'T1: bone as hard as fresh antler; needles, darts and a knife-length wraithbone blade; thrown to about 15 m; a few pieces at once.',
    'T2: natural bone and tough fabric, rising to mild steel by L10; arm-length pieces; simple shapes.',
    'T3: hardened steel that holds an edge; body-volume pieces within 2-3 m; fine detail and moving parts.',
];

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
    return r;
}

/* ---------------- combat ---------------- */

/**
 * One exchange. James acts (dart / blade / dodge / Yuki-strike), Yuki strikes on her own, then every enemy
 * still standing attacks: James defends with GU + d6 against the enemy's attack DC; a hit deals its damage
 * minus DR 1 (Ouroboros).
 */
export const COMBAT_ACTIONS = {
    dart: { label: 'Bone darts', skill: 'Convergence Use', qi: 2, dmg: [2, 4], dcMod: 0 },
    blade: { label: 'Wraithbone blade', skill: 'GU', qi: 3, dmg: [3, 6], dcMod: 1, keeps: 'blade' },
    needle: { label: 'Needle to a joint', skill: 'Convergence Use', qi: 4, dmg: [1, 2], dcMod: 2, stagger: true },
    guard: { label: 'Guard and give ground', skill: 'GU', qi: 0, dmg: [0, 0], dcMod: -1, guard: true },
};

function dmgRoll(g, [lo, hi]) {
    if (hi <= 0) return 0;
    return lo + ((d6(g) - 1) % (hi - lo + 1));
}

/** Story-layer hooks: `before(g, enc)` may adjust an encounter (Long Forest scaling, posture text, degree). */
export const combatHooks = { before: null };

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
        enemies: enc.enemies.map((e) => ({ ...e, hpMax: e.hp, staggered: false })),
        log: [enc.intro || 'Combat!'],
    };
    return g.combat;
}

export function combatStep(g, actionId, targetIdx = 0) {
    const c = g.combat;
    if (!c) return null;
    const lines = [];
    const act = COMBAT_ACTIONS[actionId];
    const living = c.enemies.filter((e) => e.hp > 0);
    const target = living[Math.min(targetIdx, living.length - 1)];
    let guard = false;
    const qiNeed = act.keeps === 'blade' && c.bladeFormed ? 0 : act.qi;
    if (qiNeed && !spendQi(g, qiNeed)) {
        lines.push(`Not enough Qi for ${act.label} — you fall back on guarding.`);
        guard = true;
    } else {
        if (act.keeps === 'blade' && !c.bladeFormed) { c.bladeFormed = true; lines.push('White wraithbone slides out of your palm and sets into a blade.'); }
        if (act.guard) {
            guard = true;
            lines.push('You give ground, watching for the opening.');
        } else {
            const dc = target.dc + act.dcMod;
            const r = rollCheck(g, act.skill, dc);
            lines.push(`${act.label}: ${r.skill} ${r.value} + 🎲${r.die} = ${r.total} vs DC ${dc} — ${r.success ? 'hit' : 'miss'}`);
            if (r.success) {
                let dmg = dmgRoll(g, act.dmg) * (r.crit ? 2 : 1);
                dmg = Math.max(0, dmg - (target.dr || 0));
                target.hp -= dmg;
                lines.push(`  ${target.name} takes ${dmg}${r.crit ? ' (critical — double damage)' : ''}.`);
                if (act.stagger && target.hp > 0) { target.staggered = true; lines.push(`  ${target.name} staggers.`); }
            }
        }
    }
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
        const r = rollCheck(g, 'GU', e.atk, guard ? 2 : 0);
        if (r.success) {
            lines.push(`${e.name} attacks: you defend (GU ${r.value} + 🎲${r.die} = ${r.total} vs ${e.atk}) — avoided.`);
        } else {
            const dmg = hitDamage(e.dmg, e.realm, g.james.realm, jamesDr(g));
            g.james.hp = Math.max(0, g.james.hp - dmg);
            lines.push(`${e.name} attacks: you defend (GU ${r.value} + 🎲${r.die} = ${r.total} vs ${e.atk}) — hit for ${dmg} (DR ${jamesDr(g)}${(g.james.realm || 0) >= 7 && (g.james.realm || 0) > (e.realm || 0) ? ', realm gap' : ''}).`);
        }
    }
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
    if (g.james.hp <= 0) {
        const next = c.lose;
        g.combat = null;
        g.james.hp = 1;
        return { lines, done: 'lose', next };
    }
    return { lines, done: null };
}

export function combatFlee(g) {
    const c = g.combat;
    if (!c || !c.flee) return null;
    const worst = Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk));
    const r = rollCheck(g, 'GU', worst);
    const lines = [`You run: GU ${r.value} + 🎲${r.die} = ${r.total} vs ${worst} — ${r.success ? 'you get clear' : 'not fast enough'}.`];
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
    if (g.james.hp <= 0) { const next = c.lose; g.combat = null; g.james.hp = 1; return { lines, done: 'lose', next }; }
    return { lines, done: null };
}

/* ---------------- saves ---------------- */

export function serialize(g) {
    return JSON.stringify(g);
}
export function deserialize(text) {
    const g = JSON.parse(text);
    if (!g || g.v !== SAVE_VERSION || !g.james || !g.scene) throw new Error('Not a James RPG save');
    return ensureBars(g);
}
