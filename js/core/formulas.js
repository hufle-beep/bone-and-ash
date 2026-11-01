/* Copied unchanged from Rules Engine C (Shared-ST st/rules-engine-c/lib/formulas.js, engine 0.1.219) — the same Qi math as the SillyTavern game. */
/**
 * Rules Engine C — Layer 2 formulas (Cluster 1).
 *
 * Pure functions only. NEW attribute-free math — not a fork of the live
 * 0.75 / d20 / Roll Floor curve in ../rules-engine/lib/formulas.js.
 *
 * Source of truth: REDESIGN_C_FREEZE.md (playtest) + HANDOFF Part 1.
 * Cluster 1: Rank/check, skillXpCost(k), Max HP, pool Max + RealmBonus,
 * 5% OOC regen + Cycle minutes, XP split / lost-at-cap, meridian cost 2 + refusals.
 */

function requireFinite(name, value) {
    if (!Number.isFinite(value)) {
        throw new TypeError(`rules-engine-c: ${name} must be a finite number, got ${value}`);
    }
    return value;
}

function requirePositiveInt(name, value) {
    requireFinite(name, value);
    if (!Number.isInteger(value) || value < 1) {
        throw new RangeError(`rules-engine-c: ${name} must be an integer >= 1, got ${value}`);
    }
    return value;
}

/** Rank = (Tier-1)*10 + LevelInTier. T1 L1 = 1 … T4 L10 = 40. */
export function rankFromTierLevel(tier, levelInTier) {
    requirePositiveInt('tier', tier);
    requirePositiveInt('levelInTier', levelInTier);
    if (levelInTier > 10) {
        throw new RangeError(`rules-engine-c: levelInTier must be 1..10, got ${levelInTier}`);
    }
    return (tier - 1) * 10 + levelInTier;
}

/** Check = 0.5 * Rank. T1 L1 = 0.5 … T4 L10 = 20. */
export function checkFromRank(rank) {
    requireFinite('rank', rank);
    return 0.5 * rank;
}

export function checkFromTierLevel(tier, levelInTier) {
    return checkFromRank(rankFromTierLevel(tier, levelInTier));
}

/**
 * skillXpCost = 50 * k * Tier * LevelInTier.
 * k is campaign pace: 0.5 short / 1 standard / 2 long. N=1 everyone.
 */
export function skillXpCost(k, tier, levelInTier) {
    requireFinite('k', k);
    requirePositiveInt('tier', tier);
    requirePositiveInt('levelInTier', levelInTier);
    return 50 * k * tier * levelInTier;
}

export const HP_MORTAL_CAP = 60;
export const FORCE_HP_CAP = 30;
export const IMMORTAL_ASCENSION_INDEX = 9;
export const METAHUMAN_MAX_RANK = 6;

/**
 * Qi Max RealmBonus (freeze 2.4.18): even steps, about doubles every two names.
 * Not HP. HP fills toward 60 by Immortal Ascension instead.
 * Names: freeze 2.4.17 (Gábor 2026-10-07).
 */
export const REALM_BONUS_TABLE = Object.freeze([
    0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128,
]);

export const REALM_STEP_NAMES = Object.freeze([
    'Mortal Vessel',
    'Foundation',
    'Core Formation',
    'True Core',
    'Golden Core',
    'Origin Core',
    'Soul Embryo',
    'Nascent Soul',
    'Spirit Transformation',
    'Immortal Ascension',
    'Mahayana',
    'Earth Immortal',
    'True Immortal',
    'Golden Immortal',
    'Heavenly Immortal',
]);

export function realmStepLabel(realmIndex) {
    const idx = Math.trunc(Number(realmIndex) || 0);
    return REALM_STEP_NAMES[idx] || `idx ${idx}`;
}

export function realmBonus(realmIndex) {
    requireFinite('realmIndex', realmIndex);
    if (!Number.isInteger(realmIndex) || realmIndex < 0 || realmIndex >= REALM_BONUS_TABLE.length) {
        throw new RangeError(`rules-engine-c: realmIndex out of range 0..${REALM_BONUS_TABLE.length - 1}, got ${realmIndex}`);
    }
    return REALM_BONUS_TABLE[realmIndex];
}

/** Body HP term: 2 × min(Body, 20 + 5×physique stacks). */
export function bodyHpTerm(body, physiqueStacks = 0) {
    requireFinite('body', body);
    requireFinite('physiqueStacks', physiqueStacks);
    const clamp = 20 + 5 * physiqueStacks;
    return 2 * Math.min(body, clamp);
}

/**
 * Cultivation fills missing HP toward 60 by Immortal Ascension (idx 9).
 * Already at/over 60 (peak Body or named physique) stays. Idx 10–14 do not raise Max.
 */
export function realmFilledHp(bodyHp, realmIndex = 0) {
    requireFinite('bodyHp', bodyHp);
    const idx = Math.max(0, Math.min(REALM_BONUS_TABLE.length - 1, Math.trunc(Number(realmIndex) || 0)));
    const fillIdx = Math.min(idx, IMMORTAL_ASCENSION_INDEX);
    if (bodyHp >= HP_MORTAL_CAP) return bodyHp;
    if (fillIdx <= 0) return bodyHp;
    return bodyHp + (fillIdx / IMMORTAL_ASCENSION_INDEX) * (HP_MORTAL_CAP - bodyHp);
}

/** Realm DR from Immortal Ascension: 2, 4, 8, 16, 32, 64. Below IA = 0. */
export function realmDr(realmIndex = 0) {
    const idx = Math.trunc(Number(realmIndex) || 0);
    if (idx < IMMORTAL_ASCENSION_INDEX) return 0;
    return 2 ** (idx - 8);
}

/** Extra HP on a fight shock tick from realm (same numbers as realm DR). OOC stays 5%. */
export function realmShockHpBonus(realmIndex = 0) {
    return realmDr(realmIndex);
}

export function clampMetahumanRank(rank) {
    const r = Math.trunc(Number(rank) || 1);
    return Math.max(1, Math.min(METAHUMAN_MAX_RANK, r));
}

/** Super/metahuman HP after the 60 cap (breaker): +10 per rank. */
export function metahumanHpBonus(rank) {
    return 10 * clampMetahumanRank(rank);
}

/** Extra Max on each energy pool the actor actually has (Qi / Force / named). */
export function metahumanPoolBonus(rank) {
    return Object.freeze([0, 8, 16, 32, 64, 96, 128])[clampMetahumanRank(rank)];
}

/** Metahuman DR (and shock extra): rank 1→2 … 6→64. */
export function metahumanDr(rank) {
    return 2 ** clampMetahumanRank(rank);
}

export function metahumanShockHpBonus(rank) {
    return metahumanDr(rank);
}

/** Extra weapon dice from a metahuman perk (ceil(rank/2)). */
export function metahumanDamageDice(rank) {
    return Math.ceil(clampMetahumanRank(rank) / 2);
}

/**
 * Max HP = floor(realm-filled Body HP + min(Force Use, 30) + perk HP).
 * Body HP = 20 + 2×min(Body, clamp). Peak mundane without breaker = 60.
 * Named physique: Body clamp +5 per stack (can exceed 60). Force after the 60 fill.
 */
export function maxHp({
    body,
    realmIndex = 0,
    forceUseCheck = 0,
    physiqueStacks = 0,
    perkHpBonus = 0,
} = {}) {
    requireFinite('body', body);
    requireFinite('forceUseCheck', forceUseCheck);
    requireFinite('physiqueStacks', physiqueStacks);
    requireFinite('perkHpBonus', perkHpBonus);
    const bodyHp = 20 + bodyHpTerm(body, physiqueStacks);
    const filled = realmFilledHp(bodyHp, realmIndex);
    const forceTerm = Math.min(forceUseCheck, FORCE_HP_CAP);
    return Math.floor(filled + forceTerm + perkHpBonus);
}

/** Qi Max = 20 + Use check + openedPrimaries + EffectiveRealmBonus */
export function qiPoolMax({ useCheck, openedPrimaries = 0, realmBonusValue = 0 } = {}) {
    requireFinite('useCheck', useCheck);
    requireFinite('openedPrimaries', openedPrimaries);
    requireFinite('realmBonusValue', realmBonusValue);
    return 20 + useCheck + openedPrimaries + realmBonusValue;
}

/** Force / generic Max = 20 + Use check */
export function genericPoolMax({ useCheck } = {}) {
    requireFinite('useCheck', useCheck);
    return 20 + useCheck;
}

/**
 * Cycle minutes from max(GU Tier, acting Use Tier):
 * T1→30, T2→15, T3→8, T4→4, T5→2, T6+→1.
 */
export function cycleTimeMinutes(tier) {
    requirePositiveInt('tier', tier);
    if (tier <= 1) return 30;
    if (tier === 2) return 15;
    if (tier === 3) return 8;
    if (tier === 4) return 4;
    if (tier === 5) return 2;
    return 1;
}

export const OOC_REGEN_BASE_PERCENT = 5;
/** Freeze amendment 2026-10-02 (Gábor): each open collateral / extra-collateral adds +0.1 points to that body's Qi regen. */
export const COLLATERAL_REGEN_PERCENT = 0.1;
/** Unique perk soul-well (Azarath's Well): Qi regen uses 10% of Max instead of 5%. */
export const SOUL_WELL_REGEN_PERCENT = 10;
/** Unique perk soul-well: +50% of base Max per realm rung (MV counts as 1). */
export const SOUL_WELL_REALM_PCT = 0.5;
/** Unique perk soul-well: +25% of base Max per opened primary. */
export const SOUL_WELL_MERIDIAN_PCT = 0.25;

export function soulWellMultiplier({ realmIndex = 0, openedPrimaries = 0 } = {}) {
    requireFinite('realmIndex', realmIndex);
    requireFinite('openedPrimaries', openedPrimaries);
    const rungs = Math.max(0, Math.trunc(realmIndex)) + 1;
    const pri = Math.max(0, Math.trunc(openedPrimaries));
    return 1 + SOUL_WELL_REALM_PCT * rungs + SOUL_WELL_MERIDIAN_PCT * pri;
}

export function soulWellPoolMax(baseMax, opts = {}) {
    requireFinite('baseMax', baseMax);
    return baseMax * soulWellMultiplier(opts);
}

export function qiRegenPercent({ openedCollaterals = 0, openedExtraCollaterals = 0, soulWell = false } = {}) {
    const n = (Number(openedCollaterals) || 0) + (Number(openedExtraCollaterals) || 0);
    const base = soulWell ? SOUL_WELL_REGEN_PERCENT : OOC_REGEN_BASE_PERCENT;
    return Math.round((base + COLLATERAL_REGEN_PERCENT * n) * 10) / 10;
}

/** OOC regen per Cycle tick = percent of that bar's Max (5% for HP, Force and generic pools). */
export function oocRegenTickAmount(maxValue, percent = OOC_REGEN_BASE_PERCENT) {
    requireFinite('maxValue', maxValue);
    requireFinite('percent', percent);
    return Math.round(maxValue * percent * 1e4) / 1e6;
}

/**
 * Optional qi-beast bond flow: % of the smaller Max moved toward equal fill
 * per Cycle. Gated to the lower realm so a Mortal Vessel cannot gulp a
 * Nascent Soul tank. Idx 0 → 1% (RealmBonus 0 would otherwise stall starters).
 */
export function qiFlowRatePercent(minRealmIndex) {
    requireFinite('minRealmIndex', minRealmIndex);
    const idx = Math.trunc(minRealmIndex);
    return 1 + realmBonus(idx);
}

/** Max qi moved between two tanks in one Cycle of flow. */
export function qiFlowCapPerTick({ minRealmIndex, smallerMax } = {}) {
    requireFinite('smallerMax', smallerMax);
    if (!(smallerMax > 0)) return 0;
    return (qiFlowRatePercent(minRealmIndex) / 100) * smallerMax;
}

/**
 * Move qi toward equal fill fraction (pressure), conserving the sum.
 * cap is the max |delta| this tick. Does not share a tank or snap Max.
 */
export function qiFlowEqualizeStep({ aCur, aMax, bCur, bMax, cap } = {}) {
    requireFinite('aCur', aCur);
    requireFinite('aMax', aMax);
    requireFinite('bCur', bCur);
    requireFinite('bMax', bMax);
    requireFinite('cap', cap);
    if (!(aMax > 0) || !(bMax > 0) || !(cap > 0)) {
        return { aCur, bCur, moved: 0 };
    }
    const total = aCur + bCur;
    const f = total / (aMax + bMax);
    const targetA = Math.min(aMax, Math.max(0, f * aMax));
    const need = Math.abs(targetA - aCur);
    const moved = Math.min(need, cap);
    if (!(moved > 0)) return { aCur, bCur, moved: 0 };
    if (targetA > aCur) {
        return { aCur: aCur + moved, bCur: bCur - moved, moved };
    }
    return { aCur: aCur - moved, bCur: bCur + moved, moved };
}

export const SKILL_USE_XP_BANDS = Object.freeze({
    routine: 0,
    standard: 30,
    challenging: 60,
    major: 120,
});

/** Quest subgoal lumps (freeze 2.5.1). No T*. Pay on tick; last tick closes. */
export const QUEST_LUMP_AMOUNTS = Object.freeze([120, 240, 480]);
export const QUEST_LUMP_BANDS = Object.freeze({
    standard: 120,
    challenging: 240,
    major: 480,
});

/**
 * Parse a quest-subgoal lump: 120 / 240 / 480 or standard / challenging / major.
 * Unknown or empty → fallback (default 120).
 */
export function parseQuestLump(raw, fallback = 120) {
    if (raw == null || raw === '') return fallback;
    const s = String(raw).trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(QUEST_LUMP_BANDS, s)) return QUEST_LUMP_BANDS[s];
    const n = Number(s);
    if (QUEST_LUMP_AMOUNTS.includes(n)) return n;
    return fallback;
}

/** Failed attempt XP = floor(successPool * this). Meaningful but not generous. */
export const FAIL_XP_FRACTION = 0.25;

/**
 * XP pool = band * T*, T* = floor(avg of used skills' Tiers).
 * Equal split among skills on the check. Routine = 0. Fail awards FAIL_XP_FRACTION of success pool.
 */
export function xpPool(band, skillTiers) {
    if (!Array.isArray(skillTiers) || skillTiers.length === 0) {
        throw new TypeError('rules-engine-c: skillTiers must be a non-empty array');
    }
    const bandXp = typeof band === 'string' ? SKILL_USE_XP_BANDS[band] : band;
    if (!Number.isFinite(bandXp)) {
        throw new TypeError(`rules-engine-c: unknown XP band ${band}`);
    }
    if (bandXp === 0) return 0;
    const avg = skillTiers.reduce((a, t) => a + requireFinite('skillTier', t), 0) / skillTiers.length;
    const tStar = Math.floor(avg);
    return bandXp * tStar;
}

export function splitXpEqual(totalXp, n) {
    requireFinite('totalXp', totalXp);
    requirePositiveInt('n', n);
    if (totalXp % n !== 0) {
        // Playtest cases are exact; keep shares equal integers when divisible.
        // If not divisible, floor-split with remainder ignored (lost) — not hit by Cluster 1 tests.
        const each = Math.floor(totalXp / n);
        return Array.from({ length: n }, () => each);
    }
    const each = totalXp / n;
    return Array.from({ length: n }, () => each);
}

/**
 * Merged technique XP: equal split among participants (GU + every merged Use).
 */
export function techniqueXpShares({ band, participants } = {}) {
    if (!Array.isArray(participants) || participants.length === 0) {
        throw new TypeError('rules-engine-c: participants must be a non-empty array');
    }
    const tiers = participants.map((p) => requireFinite('participant.tier', p.tier));
    const total = xpPool(band, tiers);
    const shares = splitXpEqual(total, participants.length);
    return participants.map((p, i) => ({ id: p.id, xp: shares[i] }));
}

export const MERIDIAN_COST = 2;

/** Freeze 2.4.3 (2026-10-08): a sit dumps this much Qi (or the leftover). Meridians stay 2. */
export const CONDENSE_SIT_COST = 10;
/** Two full bars of Max = 100% sat. Heavenly Immortal ~34 sits of 10. */
export const CONDENSE_FILL_MAX_MULT = 2;

/**
 * Sat% gained for Qi spent against live Max.
 * sat += 100 * spent / (2 * Max). Empty Max → 0.
 */
export function condensationSatGain(qiSpent, poolMax) {
    const spent = Number(qiSpent);
    const max = Number(poolMax);
    if (!(spent > 0) || !(max > 0)) return 0;
    return 100 * spent / (CONDENSE_FILL_MAX_MULT * max);
}

export const MERIDIAN_CAPS = Object.freeze({
    primaries: 12,
    extra8: 8,
    collaterals: 66,
    extraCollaterals: 28,
    junctions: 10,
});

/** Realm index for Nascent Soul — Extra-8 window ends here. */
export const NASCENT_SOUL_REALM_INDEX = 7;

/**
 * Weighted meridian portfolio (display only — does not change Max; collateral regen is qiRegenPercent).
 * Primaries 1.0, Extra-8 0.5, collaterals 0.1, junctions 0.3.
 */
export function meridianSum({
    openedPrimaries = 0,
    openedExtra8 = 0,
    openedCollaterals = 0,
    openedExtraCollaterals = 0,
    openedJunctions = 0,
} = {}) {
    requireFinite('openedPrimaries', openedPrimaries);
    requireFinite('openedExtra8', openedExtra8);
    requireFinite('openedCollaterals', openedCollaterals);
    requireFinite('openedExtraCollaterals', openedExtraCollaterals);
    requireFinite('openedJunctions', openedJunctions);
    return openedPrimaries * 1
        + openedExtra8 * 0.5
        + (openedCollaterals + openedExtraCollaterals) * 0.1
        + openedJunctions * 0.3;
}

/** Normalize extranet kind from marker/slash input. */
export function normalizeExtranetKind(raw) {
    const k = String(raw || '').toLowerCase().replace(/[_\s]/g, '-');
    if (['extra8', 'extra', 'extraordinary8', 'extraordinary'].includes(k)) return 'extra8';
    if (['collateral', 'collaterals', 'primary-collateral', 'primary-collaterals'].includes(k)) {
        return 'collateral';
    }
    if (['extra-collateral', 'extracollateral', 'extra-collaterals'].includes(k)) {
        return 'extra-collateral';
    }
    if (['junction', 'junctions'].includes(k)) return 'junction';
    return null;
}

/**
 * Meridian tick: cost 2 Qi. Refusals (no spend):
 * 1) !meridians flag
 * 2) not Mortal Vessel (Primaries window)
 * 3) Qi < 2
 * 4) no closed Primary left
 */
export function meridianAttempt({ meridiansEnabled, isMortalVessel, qiCurrent, closedPrimariesLeft } = {}) {
    if (!meridiansEnabled) return { ok: false, reason: 'meridians_disabled' };
    if (!isMortalVessel) return { ok: false, reason: 'not_mortal_vessel' };
    requireFinite('qiCurrent', qiCurrent);
    requireFinite('closedPrimariesLeft', closedPrimariesLeft);
    if (qiCurrent < MERIDIAN_COST) return { ok: false, reason: 'qi_insufficient' };
    if (closedPrimariesLeft <= 0) return { ok: false, reason: 'no_closed_primary' };
    return { ok: true };
}

/** Window/knowledge refusals for extranet — evaluated before Qi spend checks. */
function extranetWindowRefusal({
    normalized,
    realmBand,
    realmIndex,
    openedExtra8 = 0,
    knowledge = {},
} = {}) {
    const idx = realmIndex ?? 0;
    const band = realmBand || 'mortal_vessel';
    const know = {
        collaterals: knowledge.collaterals !== false,
        extraordinary8: knowledge.extraordinary8 !== false,
        junctions: knowledge.junctions !== false,
    };

    if (normalized === 'collateral') {
        if (!know.collaterals) return { ok: false, reason: 'knowledge_off' };
        if (band !== 'mortal_vessel') return { ok: false, reason: 'window_closed' };
        return null;
    }
    if (normalized === 'extra8') {
        if (!know.extraordinary8) return { ok: false, reason: 'knowledge_off' };
        if (band !== 'beyond') return { ok: false, reason: 'not_beyond' };
        if (idx >= NASCENT_SOUL_REALM_INDEX) return { ok: false, reason: 'window_closed' };
        return null;
    }
    if (normalized === 'extra-collateral') {
        if (!know.collaterals) return { ok: false, reason: 'knowledge_off' };
        if (idx < NASCENT_SOUL_REALM_INDEX) return { ok: false, reason: 'window_closed' };
        if ((openedExtra8 ?? 0) < MERIDIAN_CAPS.extra8) return { ok: false, reason: 'prerequisite' };
        return null;
    }
    if (normalized === 'junction') {
        if (!know.junctions) return { ok: false, reason: 'knowledge_off' };
        if (idx < NASCENT_SOUL_REALM_INDEX) return { ok: false, reason: 'window_closed' };
        return null;
    }
    return { ok: false, reason: 'unknown_kind' };
}

/**
 * Extra-net open (Extra-8, collaterals, extra-collaterals, junctions). Cost 2 Qi each.
 * Window/knowledge refusals run before Qi < 2 so MV extra8 says not_beyond, not qi_insufficient.
 */
export function extranetAttempt({
    kind,
    meridiansEnabled,
    realmBand,
    realmIndex,
    qiCurrent,
    closedLeft,
    openedExtra8 = 0,
    knowledge = {},
} = {}) {
    if (!meridiansEnabled) return { ok: false, reason: 'meridians_disabled' };
    const normalized = normalizeExtranetKind(kind);
    if (!normalized) return { ok: false, reason: 'unknown_kind' };

    requireFinite('qiCurrent', qiCurrent);
    requireFinite('closedLeft', closedLeft);
    requireFinite('realmIndex', realmIndex);

    const windowRefusal = extranetWindowRefusal({
        normalized,
        realmBand,
        realmIndex,
        openedExtra8,
        knowledge,
    });
    if (windowRefusal) return windowRefusal;

    if (qiCurrent < MERIDIAN_COST) return { ok: false, reason: 'qi_insufficient' };
    if (closedLeft <= 0) return { ok: false, reason: 'no_closed_left' };
    return { ok: true, kind: normalized };
}

// ---------------------------------------------------------------------------
// Injury / Strain (Phase 2b) — same severity tables as LIVE entry #4/#5.
// Attribute-free; safe to share. Not a copy of LIVE maxHp/regen curves.
// ---------------------------------------------------------------------------

export const INJURY_SEVERITY = Object.freeze({
    minor: 0.05,
    moderate: 0.15,
    severe: 0.30,
    critical: 0.50,
});

export const STRAIN_SEVERITY = INJURY_SEVERITY;

export function injuryReducedMaxHp(unwoundedMaxHp, injuries = []) {
    requireFinite('unwoundedMaxHp', unwoundedMaxHp);
    let totalReductionFraction = 0;
    for (const injury of injuries) {
        const base = INJURY_SEVERITY[injury.severity];
        if (base === undefined) {
            throw new TypeError(`Unknown injury severity: ${injury.severity}`);
        }
        const healed = injury.fractionHealed ?? 0;
        totalReductionFraction += base * (1 - healed);
    }
    const floorValue = unwoundedMaxHp * 0.10;
    const reduced = unwoundedMaxHp * (1 - totalReductionFraction);
    return Math.max(reduced, floorValue);
}

export function strainReducedPoolMax(unwoundedPoolMax, strains = []) {
    return injuryReducedMaxHp(unwoundedPoolMax, strains);
}

/** Checkpoints: 0, 0.5 at halfway, 1 at full — not continuous. */
export function healingProgressFraction(elapsedTime, totalHealingTime) {
    if (!Number.isFinite(elapsedTime) || elapsedTime < 0) {
        throw new TypeError(`healingProgressFraction: elapsedTime must be a non-negative number, got ${elapsedTime}`);
    }
    if (!Number.isFinite(totalHealingTime) || totalHealingTime <= 0) {
        throw new TypeError(`healingProgressFraction: totalHealingTime must be a positive number, got ${totalHealingTime}`);
    }
    if (elapsedTime >= totalHealingTime) return 1;
    if (elapsedTime >= totalHealingTime / 2) return 0.5;
    return 0;
}

/** Tier 0-2 never cures; 3-4 minor/moderate; 5+ any. */
export function healingTierCures(consumableTier, severity) {
    if (!Number.isInteger(consumableTier) || consumableTier < 0) {
        throw new TypeError(`healingTierCures: consumableTier must be a non-negative integer, got ${consumableTier}`);
    }
    if (INJURY_SEVERITY[severity] === undefined) {
        throw new TypeError(`Unknown severity: ${severity}`);
    }
    if (consumableTier <= 2) return false;
    if (consumableTier <= 4) return severity === 'minor' || severity === 'moderate';
    return true;
}

/** Technique dampen (freeze 2.4.14): MAX(0.25, 1 - 0.0375*(Tier-1)). Ticks/raw spends undampened. */
export function dampenMultiplier(tier) {
    const t = Number(tier);
    if (!Number.isFinite(t) || t < 1) {
        throw new TypeError(`dampenMultiplier: tier must be a number >= 1, got ${tier}`);
    }
    return Math.max(0.25, 1 - 0.0375 * (t - 1));
}

/** Effective technique cost = baseCost * dampenMultiplier(useTier). */
export function techniqueCost(baseCost, useTier) {
    const c = Number(baseCost);
    if (!Number.isFinite(c) || c <= 0) {
        throw new TypeError(`techniqueCost: baseCost must be a positive number, got ${baseCost}`);
    }
    const raw = c * dampenMultiplier(useTier);
    return Math.round(raw * 1000) / 1000;
}


/**
 * Playtest DC ceiling relative to the acting check value.
 * Early low checks (e.g. 0.5–4): max = ceil(check) + 3.
 * Higher checks: max = max(ceil(check)+3, ceil(check*1.5)).
 */
export function maxCalibratedDc(checkValue) {
    const c = Number(checkValue);
    if (!Number.isFinite(c)) throw new TypeError('rules-engine-c: checkValue must be finite');
    const base = Math.ceil(c) + 3;
    const scaled = Math.ceil(c * 1.5);
    return Math.max(base, scaled);
}
