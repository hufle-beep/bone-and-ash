// Copied unchanged from hufle-beep/Shared-ST dev/rules-engine-c-tests/lib/formulas.test.mjs (engine 0.1.223-c-clock-year), v0.11.5.
// Only the import path differs. It proves js/core/formulas.js still behaves as the engine's own file.
// Plain-Node harness for Rules Engine C Cluster 1.
// Run: node formulas.test.mjs
// Stubs throw until formulas are implemented — failures are expected until then.

import {
    rankFromTierLevel,
    checkFromRank,
    checkFromTierLevel,
    skillXpCost,
    REALM_BONUS_TABLE,
    REALM_STEP_NAMES,
    realmBonus,
    realmStepLabel,
    realmFilledHp,
    realmDr,
    realmShockHpBonus,
    metahumanHpBonus,
    metahumanPoolBonus,
    metahumanDr,
    metahumanDamageDice,
    HP_MORTAL_CAP,
    IMMORTAL_ASCENSION_INDEX,
    maxHp,
    qiPoolMax,
    genericPoolMax,
    cycleTimeMinutes,
    oocRegenTickAmount,
    qiRegenPercent,
    soulWellMultiplier,
    soulWellPoolMax,
    SOUL_WELL_REGEN_PERCENT,
    qiFlowCapPerTick,
    qiFlowEqualizeStep,
    qiFlowRatePercent,
    SKILL_USE_XP_BANDS,
    QUEST_LUMP_AMOUNTS,
    parseQuestLump,
    xpPool,
    splitXpEqual,
    techniqueXpShares,
    MERIDIAN_COST,
    CONDENSE_SIT_COST,
    CONDENSE_FILL_MAX_MULT,
    condensationSatGain,
    meridianAttempt,
    extranetAttempt,
    meridianSum,
    MERIDIAN_CAPS,
    NASCENT_SOUL_REALM_INDEX,
    injuryReducedMaxHp,
    healingProgressFraction,
    healingTierCures,
} from '../js/core/formulas.js';

let pass = 0;
let fail = 0;

function assertEqual(actual, expected, label) {
    const ok = Object.is(actual, expected)
        || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
    if (ok) {
        pass++;
        console.log(`  PASS  ${label} => ${actual}`);
    } else {
        fail++;
        console.error(`  FAIL  ${label}: expected ${expected}, got ${actual}`);
    }
}

function assertDeepEqual(actual, expected, label) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) {
        pass++;
        console.log(`  PASS  ${label} => ${JSON.stringify(actual)}`);
    } else {
        fail++;
        console.error(`  FAIL  ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

function assertThrows(fn, label) {
    try {
        fn();
        fail++;
        console.error(`  FAIL  ${label}: expected a throw, but it returned normally`);
    } catch {
        pass++;
        console.log(`  PASS  ${label} => threw as expected`);
    }
}

function run(label, fn) {
    console.log(`--- ${label} ---`);
    try {
        fn();
    } catch (err) {
        fail++;
        console.error(`  FAIL  ${label}: threw unexpectedly: ${err && err.message ? err.message : err}`);
    }
}

// --- Rank / check (10 rungs, check = 0.5 * Rank) ---
run('Rank / check', () => {
    assertEqual(rankFromTierLevel(1, 1), 1, 'T1 L1 Rank');
    assertEqual(rankFromTierLevel(4, 10), 40, 'T4 L10 Rank');
    assertEqual(checkFromRank(1), 0.5, 'Rank 1 check');
    assertEqual(checkFromRank(40), 20, 'Rank 40 check');
    assertEqual(checkFromTierLevel(1, 1), 0.5, 'T1 L1 check');
    assertEqual(checkFromTierLevel(4, 10), 20, 'T4 L10 check');
});

// --- XP cost with k ---
run('skillXpCost', () => {
    assertEqual(skillXpCost(1, 1, 1), 50, 'k=1 T1 L1');
    assertEqual(skillXpCost(0.5, 1, 1), 25, 'k=0.5 T1 L1');
    assertEqual(skillXpCost(2, 2, 5), 1000, 'k=2 T2 L5 = 50*2*2*5');
    assertThrows(() => skillXpCost(1, 0, 1), 'Tier 0 throws');
});

// --- RealmBonus table ---
run('RealmBonus', () => {
    assertEqual(REALM_BONUS_TABLE.length, 15, '15 realm steps');
    assertEqual(realmBonus(0), 0, 'index 0');
    assertEqual(realmBonus(1), 1, 'Foundation Qi');
    assertEqual(realmBonus(4), 4, 'Golden Core Qi');
    assertEqual(realmBonus(9), 24, 'Immortal Ascension Qi');
    assertEqual(realmBonus(14), 128, 'Heavenly Immortal Qi');
    assertEqual(REALM_STEP_NAMES.length, REALM_BONUS_TABLE.length, 'one name per bonus step');
    assertEqual(realmStepLabel(0), 'Mortal Vessel', 'idx 0 name');
    assertEqual(realmStepLabel(1), 'Foundation', 'idx 1 name');
    assertEqual(realmStepLabel(3), 'True Core', 'idx 3 invented');
    assertEqual(realmStepLabel(5), 'Origin Core', 'idx 5 sat-rate change');
    assertEqual(realmStepLabel(6), 'Soul Embryo', 'idx 6 last Extra-8');
    assertEqual(realmStepLabel(NASCENT_SOUL_REALM_INDEX), 'Nascent Soul', 'idx 7 name');
    assertEqual(realmStepLabel(9), 'Immortal Ascension', 'idx 9 name');
    assertEqual(realmStepLabel(10), 'Mahayana', 'idx 10 name');
    assertEqual(realmStepLabel(14), 'Heavenly Immortal', 'idx 14 name');
});

// --- Max HP ---
run('maxHp', () => {
    assertEqual(HP_MORTAL_CAP, 60, 'mortal cap');
    assertEqual(IMMORTAL_ASCENSION_INDEX, 9, 'IA idx');
    assertEqual(maxHp({ body: 20 }), 60, 'peak mundane Body 20');
    assertEqual(maxHp({ body: 10 }), 40, 'Body 10 => 20+20');
    assertEqual(maxHp({ body: 10.7 }), 41, 'floor after sum Body 10.7 => floor(20+21.4)=41');
    assertEqual(maxHp({ body: 20, realmIndex: 9, forceUseCheck: 10 }), 70, '60 cap + Force 10');
    assertEqual(maxHp({ body: 20, forceUseCheck: 40 }), 90, 'Force Use check capped at 30');
    assertEqual(maxHp({ body: 25, physiqueStacks: 1 }), 70, 'clamp 25 with +5 physique => 20+50');
    assertEqual(maxHp({ body: 3, realmIndex: 0 }), 26, 'James-like MV');
    assertEqual(maxHp({ body: 3, realmIndex: 1 }), 29, 'Foundation fills toward 60');
    assertEqual(maxHp({ body: 3, realmIndex: 9 }), 60, 'IA completes 60');
    assertEqual(maxHp({ body: 3, realmIndex: 14 }), 60, 'Heavenly still 60');
    assertEqual(maxHp({ body: 3, realmIndex: 9, forceUseCheck: 20 }), 80, 'Force after cap');
    assertEqual(maxHp({ body: 3, realmIndex: 1, perkHpBonus: 40 }), 69, 'metahuman HP after fill');
});

run('realm fill / DR / metahuman knobs', () => {
    assertEqual(realmFilledHp(26, 0), 26, 'MV no fill');
    assertEqual(Math.floor(realmFilledHp(26, 1)), 29, 'Foundation slice');
    assertEqual(realmFilledHp(60, 9), 60, 'already at cap');
    assertEqual(realmFilledHp(70, 9), 70, 'physique over cap stays');
    assertEqual(realmDr(8), 0, 'pre-IA no DR');
    assertEqual(realmDr(9), 2, 'IA DR 2');
    assertEqual(realmDr(14), 64, 'Heavenly DR 64');
    assertEqual(realmShockHpBonus(11), 8, 'Earth shock +8');
    assertEqual(metahumanHpBonus(4), 40, 'rank 4 HP');
    assertEqual(metahumanPoolBonus(4), 64, 'rank 4 pool');
    assertEqual(metahumanDr(1), 2, 'rank 1 DR');
    assertEqual(metahumanDr(6), 64, 'rank 6 DR');
    assertEqual(metahumanDamageDice(1), 1, 'rank 1 die');
    assertEqual(metahumanDamageDice(5), 3, 'rank 5 dice');
});

// --- Pool Max ---
run('pool Max', () => {
    assertEqual(qiPoolMax({ useCheck: 4, openedPrimaries: 2, realmBonusValue: 3 }), 29, '20+4+2+3');
    assertEqual(genericPoolMax({ useCheck: 6 }), 26, '20+6 Force/generic');
});

// --- Cycle + 5% regen ---
run('Cycle / OOC regen', () => {
    assertEqual(cycleTimeMinutes(1), 30, 'T1');
    assertEqual(cycleTimeMinutes(2), 15, 'T2');
    assertEqual(cycleTimeMinutes(3), 8, 'T3');
    assertEqual(cycleTimeMinutes(4), 4, 'T4');
    assertEqual(cycleTimeMinutes(5), 2, 'T5');
    assertEqual(cycleTimeMinutes(6), 1, 'T6');
    assertEqual(cycleTimeMinutes(10), 1, 'T10');
    assertEqual(oocRegenTickAmount(100), 5, '5% of 100');
    assertEqual(oocRegenTickAmount(60), 3, '5% of 60');
    assertEqual(qiRegenPercent({}), 5, 'no collaterals: 5%');
    assertEqual(qiRegenPercent({ openedCollaterals: 2 }), 5.2, '2 collaterals: 5.2%');
    assertEqual(qiRegenPercent({ openedCollaterals: 66 }), 11.6, 'all 66: 11.6%');
    assertEqual(qiRegenPercent({ openedCollaterals: 66, openedExtraCollaterals: 28 }), 14.4, '66 + 28 extra: 14.4%');
    assertEqual(oocRegenTickAmount(33, 5.2), 1.716, '5.2% of 33 = 1.716');
    assertEqual(oocRegenTickAmount(33, 11.6), 3.828, '11.6% of 33 = 3.828');
    assertEqual(soulWellMultiplier({ realmIndex: 0, openedPrimaries: 1 }), 1.75, 'MV + 1 pri = 1.75');
    assertEqual(soulWellPoolMax(21.5, { realmIndex: 0, openedPrimaries: 1 }), 37.625, 'Raven start 21.5×1.75');
    assertEqual(qiRegenPercent({ soulWell: true }), SOUL_WELL_REGEN_PERCENT, 'soul-well regen 10%');
    assertEqual(qiRegenPercent({ soulWell: true, openedCollaterals: 2 }), 10.2, 'soul-well + 2 coll');
});

run('Qi-beast flow rate', () => {
    assertEqual(qiFlowRatePercent(0), 1, 'MV 1%');
    assertEqual(qiFlowRatePercent(1), 2, 'Foundation 2%');
    assertEqual(qiFlowRatePercent(NASCENT_SOUL_REALM_INDEX), 13, 'NS 1+12');
    assertEqual(qiFlowCapPerTick({ minRealmIndex: 0, smallerMax: 20 }), 0.2, 'MV cap 1% of 20');
    assertEqual(qiFlowCapPerTick({ minRealmIndex: 1, smallerMax: 20 }), 0.4, 'idx1 cap 2% of 20');
    const step = qiFlowEqualizeStep({ aCur: 10, aMax: 20, bCur: 0, bMax: 20, cap: 1 });
    assertEqual(step.aCur, 9, 'A gives 1 toward even fill');
    assertEqual(step.bCur, 1, 'B receives 1');
    assertEqual(step.moved, 1, 'moved 1');
    const even = qiFlowEqualizeStep({ aCur: 10, aMax: 20, bCur: 10, bMax: 20, cap: 5 });
    assertEqual(even.moved, 0, 'already even');
});

// --- XP pool / split / merge ---
run('XP pool / split', () => {
    assertEqual(SKILL_USE_XP_BANDS.routine, 0, 'routine');
    assertEqual(SKILL_USE_XP_BANDS.standard, 30, 'standard');
    assertEqual(SKILL_USE_XP_BANDS.challenging, 60, 'challenging');
    assertEqual(SKILL_USE_XP_BANDS.major, 120, 'major');
    // band * floor(avg tiers): standard, tiers [2,4] => floor(3)=3 => 90
    assertEqual(xpPool('standard', [2, 4]), 90, 'standard avg floor 3');
    assertEqual(xpPool('routine', [5]), 0, 'routine always 0');
    assertDeepEqual(splitXpEqual(90, 2), [45, 45], 'equal split 2');
    assertDeepEqual(splitXpEqual(90, 3), [30, 30, 30], 'equal split 3');
    // merged 3-way: GU + 2 Uses, major, all T2 => T*=2, pool=240, shares 80 each
    assertDeepEqual(
        techniqueXpShares({ band: 'major', participants: [{ id: 'GU', tier: 2 }, { id: 'Qi', tier: 2 }, { id: 'Force', tier: 2 }] }),
        [
            { id: 'GU', xp: 80 },
            { id: 'Qi', xp: 80 },
            { id: 'Force', xp: 80 },
        ],
        'merged 3-way major T2',
    );
});

// --- Meridian ---
run('Meridian', () => {
    assertEqual(MERIDIAN_COST, 2, 'meridian cost stays 2');
    assertEqual(CONDENSE_SIT_COST, 10, 'sit dumps 10');
    assertEqual(CONDENSE_FILL_MAX_MULT, 2, 'two bars fill a rung');
    assertEqual(condensationSatGain(10, 40), 12.5, 'Max 40: 10 Qi = 12.5%');
    assertEqual(condensationSatGain(10, 168), 100 * 10 / 336, 'Heavenly-like Max 168');
    assertEqual(Math.ceil((2 * 168) / 10), 34, 'Heavenly ~34 sits of 10');
    assertDeepEqual(
        meridianAttempt({ meridiansEnabled: true, isMortalVessel: true, qiCurrent: 5, closedPrimariesLeft: 3 }),
        { ok: true },
        'legal tick',
    );
    assertDeepEqual(
        meridianAttempt({ meridiansEnabled: false, isMortalVessel: true, qiCurrent: 5, closedPrimariesLeft: 3 }),
        { ok: false, reason: 'meridians_disabled' },
        '!meridians',
    );
    assertDeepEqual(
        meridianAttempt({ meridiansEnabled: true, isMortalVessel: false, qiCurrent: 5, closedPrimariesLeft: 3 }),
        { ok: false, reason: 'not_mortal_vessel' },
        'not MV',
    );
    assertDeepEqual(
        meridianAttempt({ meridiansEnabled: true, isMortalVessel: true, qiCurrent: 1, closedPrimariesLeft: 3 }),
        { ok: false, reason: 'qi_insufficient' },
        'Qi < 2',
    );
    assertDeepEqual(
        meridianAttempt({ meridiansEnabled: true, isMortalVessel: true, qiCurrent: 5, closedPrimariesLeft: 0 }),
        { ok: false, reason: 'no_closed_primary' },
        'no closed Primary',
    );
});

run('MeridianSum', () => {
    assertEqual(meridianSum({ openedPrimaries: 2, openedExtra8: 4, openedCollaterals: 10 }), 2 + 2 + 1, 'weights 1/0.5/0.1');
});

run('Extranet', () => {
    const base = {
        meridiansEnabled: true,
        qiCurrent: 5,
        closedLeft: 3,
        knowledge: { collaterals: true, extraordinary8: true, junctions: true },
    };
    assertDeepEqual(
        extranetAttempt({ ...base, kind: 'collateral', realmBand: 'mortal_vessel', realmIndex: 0 }),
        { ok: true, kind: 'collateral' },
        'collateral MV',
    );
    assertDeepEqual(
        extranetAttempt({ ...base, kind: 'extra8', realmBand: 'beyond', realmIndex: 1 }),
        { ok: true, kind: 'extra8' },
        'extra8 post-MV',
    );
    assertDeepEqual(
        extranetAttempt({ ...base, kind: 'extra8', realmBand: 'mortal_vessel', realmIndex: 0 }),
        { ok: false, reason: 'not_beyond' },
        'extra8 refuse MV',
    );
    assertDeepEqual(
        extranetAttempt({
            meridiansEnabled: true,
            kind: 'extra8',
            realmBand: 'mortal_vessel',
            realmIndex: 0,
            qiCurrent: 1,
            closedLeft: 8,
            knowledge: { extraordinary8: true },
        }),
        { ok: false, reason: 'not_beyond' },
        'extra8 MV low Qi still not_beyond',
    );
    assertDeepEqual(
        extranetAttempt({
            meridiansEnabled: true,
            kind: 'junction',
            realmBand: 'mortal_vessel',
            realmIndex: 0,
            qiCurrent: 1,
            closedLeft: 10,
            knowledge: { junctions: true },
        }),
        { ok: false, reason: 'window_closed' },
        'junction pre-NS low Qi still window_closed',
    );
    assertDeepEqual(
        extranetAttempt({
            ...base,
            kind: 'extra-collateral',
            realmBand: 'beyond',
            realmIndex: NASCENT_SOUL_REALM_INDEX,
            openedExtra8: MERIDIAN_CAPS.extra8,
        }),
        { ok: true, kind: 'extra-collateral' },
        'extra-collateral NS+',
    );
    assertDeepEqual(
        extranetAttempt({
            ...base,
            kind: 'extra-collateral',
            realmBand: 'beyond',
            realmIndex: NASCENT_SOUL_REALM_INDEX,
            openedExtra8: 7,
        }),
        { ok: false, reason: 'prerequisite' },
        'extra-collateral needs 8/8',
    );
    assertDeepEqual(
        extranetAttempt({
            ...base,
            kind: 'junction',
            realmBand: 'beyond',
            realmIndex: NASCENT_SOUL_REALM_INDEX,
        }),
        { ok: true, kind: 'junction' },
        'junction NS+',
    );
});


// --- Injury / healing tier (Phase 2b) ---
run('Injury / healing', () => {
    assertEqual(injuryReducedMaxHp(100, [{ severity: 'moderate', fractionHealed: 0 }]), 85, 'moderate -15%');
    assertEqual(healingProgressFraction(0, 100), 0, 'fresh');
    assertEqual(healingProgressFraction(50, 100), 0.5, 'halfway');
    assertEqual(healingProgressFraction(100, 100), 1, 'full');
    assertEqual(healingTierCures(2, 'minor'), false, 'tier2 never cures');
    assertEqual(healingTierCures(3, 'minor'), true, 'tier3 cures minor');
    assertEqual(healingTierCures(3, 'severe'), false, 'tier3 no severe');
    assertEqual(healingTierCures(5, 'critical'), true, 'tier5 cures critical');
});

run('quest lumps 2.5.1', () => {
    assertEqual(parseQuestLump('120'), 120, '120');
    assertEqual(parseQuestLump('challenging'), 240, 'challenging word');
    assertEqual(parseQuestLump('major'), 480, 'major word');
    assertEqual(parseQuestLump(''), 120, 'empty defaults 120');
    assertEqual(QUEST_LUMP_AMOUNTS.length, 3, 'three lumps');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
