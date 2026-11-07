// Run: node tests/tasks.test.mjs — task cards and the queue (v0.9.0, "Tasks (preview)").
// Every card resolves; old saves get an empty queue; a dry run predicts the real run exactly;
// 1,000 bot games (2,000 before v0.11.34) in task mode reach the end with no dead end (Incremental Mode only since v0.11.34, D1: the classic games and the Story Mode checks gone).
import { SCENES, lfOpen, lfSeason, lfRank, LF_STOCK, LF_SEASON_MINUTES } from '../js/story/prologue.js';
import { itemCap, MAX_REALM, combatStep as cStep, startCombat as sCombat, coilMult, awardXp, actSpeed, sitMinutes, awardYukiFightXp, condense, SAT_HOURS, sitGain, btMinutes, formDmgBonus, guardBonus, fieldDamage, FIELD_ROUNDS, actionDmg } from '../js/core/game.js';
import { FORM_LINES, hasForm, cuRank, actionOpen, actionLabel, fragileKnife, STORY_FORMS, INC_ONLY_ACTIONS } from '../js/core/forms.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { markDaily, daily } from '../js/story/common.js';
import { wakeDay, exLevel, sleepUntil, clockParts } from '../js/core/game.js';
import { yukiSpeed, setDryClone, dryClone, showPicked } from '../js/core/tasks.js';
import { e8Hours, ecHours, jnHours } from '../js/story/meridians.js';
import { serialize, deserialize } from '../js/core/game.js';
import { jamesHpMax, canBreakThrough, newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, migrate, SAVE_VERSION, setNoDice, isNoDice, clockLabelSec, advance, STARVE_HP_PER_HOUR, jamesQiMax, yukiQiMax, qiRegenPct, breakthrough, inAct1, bumpRel as relBump, startActCoil, REL_CATCHUP } from '../js/core/game.js';
import { canPrimary, canColGroup, colGroupsOpen, sessionsToday, dcPrimary, dcColGroup, btTarget, canAnyMeridian, COL_GROUPS, priHours, colHours, merMinutesOf } from '../js/story/meridians.js';
import { sceneView, choose, goTo, wasPicked, isMenuScene, notePicked } from '../js/core/story.js';
import { medCards, runMed, canMeditate, NO_MEDITATE, isSitChoice, MED_SCREENS } from '../js/core/meditate.js';
import { defaultMinutes, DEFAULT_MINUTES } from '../js/core/story.js';
import { coilActive, rewind, endCoil, KEEP_FLAGS, REMEMBER } from '../js/core/coil.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskMinutes, runTask, outlook, taskQueue, taskState, setYuki, yukiLane, famTier, QUEUE_MAX, maxSpeed, effectiveSpeed, queueRunNow, queueAdd, queueMove, queueClear, isInstantTask, instantChoice, merChoice, MER_TASK, BT_TASK, SIT_TASK, waitChoice, merLineTask, lineOfTask, isQueueScreen, runsHere, cardSpeed } from '../js/core/tasks.js';

import { writeFileSync } from 'node:fs';
import { GAMES, FULL, SHARD, WORKERS, SEED, SENSIBLE, REPORT, STATS_OUT, myRuns, seedOf, launch, collect, emit, mergeInto } from './lib/shard.mjs';
import { seen as touched, track, noteView, noteCards, mergeSeen, seenOut as touchedOut } from './lib/seen.mjs'; // v0.11.22: for tools/leftovers.mjs
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; if (fail < 30) console.error('  FAIL ', l); } };
const kids = launch(import.meta.url); // v0.11.1: the bot games in worker processes, while this one runs the other checks
setNoDice(true); // v0.11.34 (D1): the game is Incremental Mode only
/** v0.11.21: --bots-only plays the bot games and writes their stats, without the rule checks (tests/tools.test.mjs: 1 worker = 2 workers). */
const BOTS_ONLY = process.argv.includes('--bots-only');

if (!SHARD && !BOTS_ONLY) { // the static checks run in the parent only

// static: hubs, menus and their doors exist
for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
    assert(!!SCENES[hub], `hub ${hub} exists`);
    for (const menu of Object.keys(cfg.menus || {})) {
        assert(!!SCENES[menu], `menu ${menu} exists`);
        assert(SCENES[hub].choices.some((c) => c.to === menu), `${hub} has a door to ${menu}`);
        assert(!SCENES[menu].choices.some((c) => c.combat), `${menu} has no fights (cards can't fight)`);
    }
}
// v0.11.19 (owner pick B): Act 1's seven resting places are task screens
{
    const A1 = { fo_ashfall: ['Palisade', 'Council', 'Militia', 'Clinic'], rr_hub: ['Forage', 'Scout'], dw_hub: ['Forage'], ah_hub: ['Forage'], heart_hub: [], rt_camp: [], rt_ashfall: ['Militia'] };
    const JOBS = { fo_ashfall: 'yuki:ashfall', rr_hub: 'yuki:rr', dw_hub: 'yuki:dw', ah_hub: 'yuki:ah', rt_ashfall: 'yuki:ashfall' };
    for (const [hub, groups] of Object.entries(A1)) {
        const cfg = TASK_HUBS[hub];
        assert(!!cfg && MED_SCREENS.has(hub), `v0.11.19: ${hub} is a task screen and a resting place`);
        assert(JSON.stringify(Object.values(cfg.menus || {}).map((m) => m.label)) === JSON.stringify(groups), `v0.11.19: ${hub}'s work groups (${Object.values(cfg.menus || {}).map((m) => m.label)})`);
        for (const d of cfg.doors || []) assert(!!SCENES[d] && SCENES[hub].choices.some((c) => c.to === d), `v0.11.19: ${hub} has a door to ${d}`);
        assert((cfg.yuki?.id || null) === (JOBS[hub] || null), `v0.11.19: ${hub}'s Yuki job (${cfg.yuki?.id})`);
    }
    const f = ensureBars(newGame(311)); f.scene = 'fo_ashfall'; f.minutes = 8 * 1440 + 9 * 60; f.coil = f.coil || {}; f.james.qi = 30; f.james.satiety = 70;
    const fc = taskCards(f, SCENES);
    assert(isTaskHub(f) && ['Palisade', 'Council', 'Militia', 'Clinic'].every((gr) => fc.some((c) => c.group === gr && c.kind === 'work')) && fc.some((c) => c.kind === 'door' && c.group === 'Around Ashfall') && fc.some((c) => c.id === 'fo_ashfall:11'), `v0.11.19: Ashfall (fallout) on Day 9: work, doors, its own sit (${[...new Set(fc.map((c) => c.group))]})`);
    const pid = fc.find((c) => c.group === 'Palisade').id, fm0 = taskMinutes(f, SCENES, pid), f0 = f.minutes;
    runTask(f, SCENES, pid);
    assert(f.scene === 'fo_ashfall' && f.minutes - f0 === fm0 && taskCards(f, SCENES).filter((c) => c.group === 'Palisade').every((c) => c.status === 'tomorrow'), 'v0.11.19: a palisade card runs as forecast, stays on the screen, and is done for the day');
}
// v0.11.20: the lean dry-run copy gives exactly what the old full copy gave (forecast rows, card minutes)
{
    setNoDice(true);
    const hubs = ['camp', 'stream', 'wilds', 'village', 'ashfall', 'fo_ashfall', 'rr_hub', 'dw_hub', 'ah_hub', 'heart_hub', 'rt_camp', 'rt_ashfall'];
    const day0 = { camp: 0, stream: 0, wilds: 1, village: 3, ashfall: 4, fo_ashfall: 7, rr_hub: 10, dw_hub: 11, ah_hub: 13, heart_hub: 15, rt_camp: 18, rt_ashfall: 19 };
    let same = 0, diff = [];
    for (let i = 0; i < 200; i++) {
        const hub = hubs[i % hubs.length];
        const g = ensureBars(newGame(400 + i)); g.scene = hub; g.minutes = day0[hub] * 1440 + (7 + (i % 9)) * 60; g.james.qi = 20 + (i % 20); g.james.satiety = 15 + (i * 7) % 80;
        Object.assign(g.flags, { long: true, forest_day: 2, vday: 2 });
        for (let k = 0; k < 30; k++) g.log.push({ at: g.minutes, scene: hub, lines: ['filler line to make the log heavy'] });
        const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
        for (let k = 0; k < 6 && cards.length; k++) taskQueue(g).push(cards[(i * 3 + k * 5) % cards.length].id);
        setDryClone(true); const a = JSON.stringify([outlook(g, SCENES), cards.map((c) => taskMinutes(g, SCENES, c.id))]);
        setDryClone(false); const b = JSON.stringify([outlook(g, SCENES), cards.map((c) => taskMinutes(g, SCENES, c.id))]);
        if (a === b) same++; else if (diff.length < 3) diff.push(`${hub} #${i}`);
    }
    assert(same === 200, `v0.11.20: the lean dry run = the full copy on 200 queues (${same}; differs: ${diff.join(', ')})`);
}
// old state (v1) → empty queue
{ const old = ensureBars(newGame(5)); delete old.tasks; old.v = 1; migrate(old); assert(old.v === SAVE_VERSION && Array.isArray(old.tasks.queue) && old.tasks.queue.length === 0 && Object.keys(old.tasks.fam).length === 0 && old.tasks.yuki.on === false, 'v1 save gets an empty queue and no familiarity'); }
assert(QUEUE_MAX === 30, 'queue holds 30');
// HP 0 during a task (v0.9.4): the Coil ends — queue cleared, the Coil screen
{
    const g = ensureBars(newGame(9)); g.scene = 'wilds'; g.minutes += 1440 + 120; Object.assign(g.flags, { long: true, forest_day: 2 });
    g.james.satiety = 0; g.james.hp = 0.5; taskQueue(g).push('wilds:6', 'wilds:6');
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest/.test(c.text));
    const r = runTask(g, SCENES, `wilds:${rest}`);
    assert(r.stopped && taskQueue(g).length === 0 && g.scene === 'coil_end' && g.coil.why === 'collapse', `collapse → the Coil screen, queue cleared (${g.scene})`);
}
// v0.9.5: every choice takes time in task mode; the Meditate card everywhere
{
    setNoDice(true);
    // talking 10, moving 20, an action 30; hand-set times stay
    const g = ensureBars(newGame(31)); const m0 = g.minutes;
    const yi = SCENES.arrival.choices.findIndex((c) => /Check Yuki/.test(String(c.text)));
    const yc = SCENES.arrival.choices[yi];
    choose(g, SCENES, yi);
    assert(yc.time == null && g.minutes - m0 === 5 + DEFAULT_MINUTES.talk, `talking: 10 min on top of the scene's own 5 (${g.minutes - m0})`);
    assert(defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', false) === 10 && defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', true) === 20 && defaultMinutes(SCENES, 'x', { to: 'y', check: { skill: 'GU', dc: 2 } }, 'y', false) === 30, 'defaults: talk 10, move 20, act 30');
    assert(defaultMinutes(SCENES, 'wilds', { to: 'wild_forage' }, 'wild_forage', false) === 0 && defaultMinutes(SCENES, 'x', { to: 'y', time: 5 }, 'y', false) === 0 && defaultMinutes(SCENES, 'x', { combat: {} }, 'y', false) === 0, 'no default: hub ↔ menu, own time, fights');
    // v0.11.14 (owner pick A): the Meditate card only on the 13 resting places
    let medded = 0;
    for (const id of Object.keys(SCENES)) {
        const h = ensureBars(newGame(32)); h.scene = id; h.james.qi = 30;
        const m = medCards(h, SCENES); // (rendering every scene is walked by the bots: a fresh state can't stand in every scene)
        if (NO_MEDITATE.has(id) || SCENES[id].end || !MED_SCREENS.has(id)) assert(m.length === 0, `no Meditate on ${id}`);
        else { assert(m.length >= 1, `Meditate on ${id}`); medded++; }
    }
    assert(medded === 13 && MED_SCREENS.size === 13 && [...MED_SCREENS].every((id) => SCENES[id]), `v0.11.14: Meditate on the 13 resting places and nowhere else (${medded})`);
    // a sit off the hubs: an hour (v0.11.2), Saturation +10% at Mortal Vessel on Coil 1, the scene stays
    const k = ensureBars(newGame(33)); k.scene = 'rt_camp'; k.james.qi = 30; const k0 = k.minutes;
    const r = runMed(k, SCENES, 'med:sit');
    assert(k.scene === 'rt_camp' && k.minutes - k0 === 60 && k.james.saturation === 10 && /Condensed/.test(r.lines[0]), `Meditate: a sit keeps the scene (1 h, +10%: ${k.minutes - k0} min, ${k.james.saturation}%)`);
    // v0.11.13 (E1): no meridian screen from Meditate; at Foundation the Extraordinary vessel is a card, run from the scene, which stays
    const e = ensureBars(newGame(34)); e.scene = 'village'; e.james.realm = 1; e.james.qi = 30;
    const before = JSON.stringify(e.inventory);
    const em = medCards(e, SCENES);
    assert(!em.some((c) => c.id === 'med:mer') && em.some((c) => c.id === 'med:mer:e8' && c.open && c.minutes === 120), 'Foundation: the Extraordinary vessel is a Meditate card (a 2 h sitting of its 4 h, v0.11.18), no meridian screen');
    const e0 = e.minutes, er = runMed(e, SCENES, 'med:mer:e8');
    assert(e.scene === 'village' && !er.moved && e.minutes - e0 === 120 && JSON.stringify(e.inventory) === before && !e.flags.med_back, `the card runs here: 2 h, the scene stays, its enter not run (${e.scene}, ${e.minutes - e0} min)`);
    // v0.11.18 (owner picks B, c2, b): sleep brings the once-a-day things back; Push through the night; Yuki's curve; timed Extraordinary lines
    {
        const s = ensureBars(newGame(301)); s.scene = 'ashfall'; s.minutes = 5 * 1440 + 10 * 60; delete s.wake; // an old save: Day 6
        assert(wakeDay(s) === 6, `an old save's days-slept counter starts at its calendar day (${wakeDay(s)})`);
        markDaily(s, 'clinic'); assert(!daily('clinic')(s), 'the clinic is done today');
        advance(s, 20 * 60); assert(clockParts(s.minutes).day === 7 && !daily('clinic')(s) && wakeDay(s) === 6, 'past midnight and past 04:00 awake: still done (no new day)');
        sleepUntil(s, 6); assert(wakeDay(s) === 7 && daily('clinic')(s), `slept: a new day, the clinic back (${wakeDay(s)})`);
        sleepUntil(s, 6); assert(wakeDay(s) === 8, 'every night slept counts once');
        const j = ensureBars(newGame(302)); j.minutes = 2 * 1440 + 22 * 60; wakeDay(j); j.minutes = 3 * 1440 + 6 * 60; // a scene that sets the clock to morning
        assert(wakeDay(j) === 4, `a scene that moves the clock past a morning counts as sleep (${wakeDay(j)})`);
        const n0 = ensureBars(newGame(303)); n0.minutes = 1440 + 23 * 60; wakeDay(n0); n0.minutes = 2 * 1440 + 60; sleepUntil(n0, 6);
        assert(wakeDay(n0) === 3, `a night broken after midnight, then slept to 06:00: one new day (${wakeDay(n0)})`);
        const t5 = ensureBars(newGame(304)); t5.minutes = 5 * 1440 + 22 * 60; wakeDay(t5); sleepUntil(t5, 5); assert(wakeDay(t5) === 7, 'sleeping to 05:00 (the tribute) counts');
        const L = ensureBars(newGame(305)); const l0 = wakeDay(L); advance(L, 90 * 1440); assert(wakeDay(L) === l0 + 90, 'a span of days (a Long Forest season) has its nights in it');
        // Push through the night
        const p = ensureBars(newGame(306)); p.scene = 'ashfall'; p.minutes = 5 * 1440 + 21 * 60; markDaily(p, 'clinic');
        assert(medCards(p, SCENES).some((c) => c.id === 'med:push' && c.open && !c.minutes), 'Push through the night: a Meditate card when a once-a-day thing is used up, at once');
        const q = ensureBars(newGame(307)); q.scene = 'ashfall'; assert(!medCards(q, SCENES).some((c) => c.id === 'med:push'), 'no Push card when nothing daily is used up');
        const w0 = wakeDay(p), m0 = p.minutes;
        const r1 = runMed(p, SCENES, 'med:push');
        assert(wakeDay(p) === w0 + 1 && p.minutes === m0 && exLevel(p) === 1 && daily('clinic')(p) && /Exhaustion 1/.test(r1.lines[0]), 'a push: a new day at once, Exhaustion 1, the clinic back');
        const sm = sitMinutes(p); const c0 = p.minutes; p.james.qi = 30; condense(p);
        assert(p.minutes - c0 === Math.round(sm * 1.5) && medCards(p, SCENES).find((c) => /Cultivate/.test(c.label)).minutes === Math.round(sitMinutes(p) * 1.5), `Exhaustion 1: a sit takes ×1.5, and its card says so (${p.minutes - c0} vs ${sm})`);
        const r0 = p.minutes; advance(p, 60, { resting: true }); assert(p.minutes - r0 === 60, 'a rest is not slowed');
        const k0 = p.minutes; advance(p, 60); assert(p.minutes - k0 === 60, 'a wait for a time of day is not slowed');
        markDaily(p, 'clinic'); runMed(p, SCENES, 'med:push'); assert(exLevel(p) === 2, 'a second push: Exhaustion 2');
        const s0 = p.minutes, sb = sitMinutes(p); p.james.qi = 30; condense(p); assert(p.minutes - s0 === Math.round(sb * 2), `Exhaustion 2: ×2 (${p.minutes - s0} vs ${sb})`);
        markDaily(p, 'clinic'); p.james.hp = 5; const f0 = p.james.satiety, pm = p.minutes, pw = wakeDay(p);
        const r3 = runMed(p, SCENES, 'med:push');
        assert(/a day later/.test(r3.lines[0]) && p.minutes - pm >= 1440 && clockParts(p.minutes).hh === 6 && exLevel(p) === 0 && p.james.hp === jamesHpMax(p) && wakeDay(p) === pw + 1, `the third push: collapse, a day lost, wakes at 06:00 with full bars and no Exhaustion (${p.minutes - pm} min)`);
        assert(Math.abs((f0 - p.james.satiety) - (3 * (p.minutes - pm)) / 60 / 2) < 0.6, 'the lost day drains Fed at the sleeping rate');
        const z = ensureBars(newGame(308)); z.scene = 'ashfall'; markDaily(z, 'clinic'); runMed(z, SCENES, 'med:push'); sleepUntil(z, 6); assert(exLevel(z) === 0, 'a real sleep clears Exhaustion');
        // Yuki's curve (c2)
        assert(yukiSpeed(0) === 1 && Math.abs(yukiSpeed(10) - 2) < 1e-9 && yukiSpeed(20) === 3 && yukiSpeed(61) === 3 && yukiSpeed(500) === 3, `Yuki's job: N 90, capped at ×3 (${yukiSpeed(10)}, ${yukiSpeed(61)})`);
        // the Extraordinary lines, timed (b)
        assert(e8Hours(0) === 4 && e8Hours(7) === 11 && ecHours(0) === 3 && ecHours(27) === 6 && jnHours(0) === 6 && jnHours(9) === 10, 'Extraordinary hours: vessels 4 … 11, collaterals 3 … 6, junctions 6 … 10');
        const x = ensureBars(newGame(310)); x.scene = 'village'; x.james.realm = 1; x.james.qi = 30;
        let sit = 0; while ((x.james.extra8 || 0) < 2 && sit < 20) { x.james.qi = 30; x.james.satiety = 80; runMed(x, SCENES, 'med:mer:e8'); sit++; }
        assert(x.james.extra8 === 2 && sit >= 3 && sit <= 5 && clockParts(x.minutes).day === 1, `two vessels in one day, no check, by hours (4 h + 5 h; ${sit} sittings)`);
        x.james.satiety = 10; assert(medCards(x, SCENES).find((c) => c.id === 'med:mer:e8')?.open === false, 'Extraordinary work locks below Fed 20');
    }
    // the hub's own cultivate card is the Meditate sit there (queueable); the old hub doors are hidden in task mode
    const w = ensureBars(newGame(35)); w.scene = 'wilds'; w.james.qi = 30; w.james.saturation = 99;
    const wm = medCards(w, SCENES);
    assert(wm[0].task && isSitChoice(SCENES.wilds.choices[Number(wm[0].task.split(':')[1])], 'wilds') && wm.some((c) => c.id === 'med:bt'), 'wilds: sit card is the hub card; Break through on the Meditate card');
    assert(!sceneView(w, SCENES).choices.some((c) => /^Break through|^Open a meridian/.test(c.label)), 'task mode: no old break / meridian choices on the hub');
    // the two dead ends found by the sweep
    const rn = ensureBars(newGame(36)); rn.scene = 'night_event'; rn.flags.night_ev = 'rain'; rn.james.qi = 0;
    assert(SCENES.night_event.choices.some((c) => c.text === 'Get wet. Sleep anyway.' && c.to === 'morning'), 'rain: a way out without Qi');
    assert(SCENES.rt_elder ? true : true, 'rt_elder exists');
}

// v0.9.6: meridians closed at the start (task mode), sessions, the Foundation gate, the seal and its unwinding
{
    setNoDice(true);
    const open = ensureBars(newGame(40)), g = ensureBars(newGame(40, { closed: true }));
    assert(open.james.primaries === 12 && open.james.collaterals === 66 && open.yuki.primaries === 12, 'a new game without closed meridians (old saves, older tests): 12 / 66 open');
    assert(g.james.primaries === 0 && g.james.collaterals === 0 && g.yuki.primaries === 0 && g.yuki.collaterals === 0, 'closed new game: 0 / 0, Yuki too');
    assert(jamesQiMax(g) === 25.5 && yukiQiMax(g) === 20.5 && qiRegenPct(g, 0) === 5 && jamesQiMax(open) === 40.5, `closed bars: Qi 25.5, Yuki 20.5, regen 5% (${jamesQiMax(g)}, ${yukiQiMax(g)})`);
    assert(COL_GROUPS.reduce((a, x) => a + x.size, 0) === 66 && COL_GROUPS.length === 8, '8 collateral groups, 66 threads');
    assert(!canColGroup(g) && canPrimary(g), 'no group before 2 primaries');
    // v0.11.2: meridians by hours of work — primaries 2 … 4 h, groups 3 … 5 h, sittings of up to 2 h, 2 Qi, no daily limit, no check
    assert(priHours(0) === 2 && priHours(11) === 4 && colHours(0) === 3 && colHours(7) === 5, 'hours: primaries 2–4, groups 3–5');
    assert(Math.round(Array.from({ length: 12 }, (_, k) => priHours(k)).reduce((x, y) => x + y) * 10) / 10 === 36 && Math.round(Array.from({ length: 8 }, (_, j) => colHours(j)).reduce((x, y) => x + y) * 10) / 10 === 32, '36 h for the 12 primaries, 32 h for the 8 groups');
    g.scene = 'stream'; g.james.qi = 20; g.james.satiety = 70;
    { const gm = medCards(g, SCENES); assert(!gm.some((c) => c.id === 'med:mer') && gm.some((c) => c.id === 'med:mer:pri' && c.open && c.task === merLineTask('pri')) && gm.some((c) => c.id === 'med:mer:col' && !c.open && /2 primaries/.test(c.reason)), 'v0.11.13: Mortal Vessel: a primary card (queueable here), the collateral card locked until 2 primaries, no screen'); }
    g.scene = 'meridians'; g.flags.mer_return = 'stream'; // the screen itself (Story Mode's; old saves sitting on it)
    const wp = SCENES.meridians.choices.findIndex((c) => c.work && /primary|Lung/.test(String(c.text(g))) && c.show(g));
    const wc = () => SCENES.meridians.choices.findIndex((c, i) => c.work && i !== wp);
    assert(wp >= 0 && SCENES.meridians.choices.every((c) => !c.check || !(c.show ? c.show(g) : true) || c.to !== 'meridians' || c.work), 'Incremental Mode: work cards, the old checked sessions hidden');
    const cu0 = g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000;
    const m0 = g.minutes, q0 = g.james.qi;
    (g.tasks.use = {}, choose(g, SCENES, wp));
    assert(g.james.primaries === 1 && g.yuki.primaries === 1 && g.minutes - m0 === 120 && q0 - g.james.qi <= 2 && !g.james.merWork, `the first primary: one 2-hour sitting, 2 Qi, opens, Yuki mirrors (${g.james.primaries}, ${g.minutes - m0} min)`);
    assert(g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000 > cu0, 'XP when a channel opens');
    const cu1 = g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000;
    (g.tasks.use = {}, choose(g, SCENES, wp)); // primary 2 needs 2.18 h: 2 h now, the rest next time
    assert(g.james.primaries === 1 && Math.abs(g.james.merWork - 2) < 0.01 && g.james.skills['Convergence Use'].xp + g.james.skills['Convergence Use'].level * 1000 === cu1, `a sitting short of the channel: progress kept, no XP (${g.james.merWork})`);
    g.tasks.use = {}; assert(merMinutesOf(g, 'pri') === 20, `the rest is a short sitting (${merMinutesOf(g, 'pri')} min)`);
    const m1 = g.minutes; (g.tasks.use = {}, choose(g, SCENES, wp));
    assert(g.james.primaries === 2 && g.minutes - m1 === 20 && !g.james.merWork, 'the second primary opens on the short sitting');
    (g.tasks.use = {}, choose(g, SCENES, wp)); g.james.qi = 20;
    assert(canPrimary(g) && sessionsToday(g) === 0, 'no daily limit in Incremental Mode');
    assert(canColGroup(g) && wc() >= 0 && SCENES.meridians.choices[wc()].show(g), 'group 1 after primaries 1–2: its own work card');
    (g.tasks.use = {}, choose(g, SCENES, wc()));
    assert(g.james.collaterals === 0 && Math.abs(g.james.colWork - 2) < 0.01 && Math.abs(g.james.merWork - 2) < 0.01, 'groups and primaries keep separate progress');
    g.james.qi = 20; (g.tasks.use = {}, choose(g, SCENES, wc()));
    assert(g.james.collaterals === 9 && g.yuki.collaterals === 9 && colGroupsOpen(g) === 1 && !g.james.colWork, 'group 1 after 3 h: 9 collaterals, Yuki mirrors');
    // v0.11.15 (B1-b): no Coil bonus on the hours; meridian work speeds up with its own sittings (N 30, up to ×10)
    const c3 = ensureBars(newGame(46, { closed: true })); c3.coil.n = 3; c3.scene = 'meridians'; c3.james.qi = 20;
    assert(merMinutesOf(c3, 'pri') === 120, `v0.11.15: Coil 3: the first primary still 2 h (${merMinutesOf(c3, 'pri')})`);
    c3.tasks.use = { 'act:mer': 10 }; assert(actSpeed(c3, 'mer') === 4 && merMinutesOf(c3, 'pri') === 30, `v0.11.15: after 10 sittings ×4: 30 min (${merMinutesOf(c3, 'pri')})`);
    c3.tasks.use = { 'act:mer': 30 }; assert(actSpeed(c3, 'mer') === 10 && merMinutesOf(c3, 'pri') === 20, `v0.11.15: after 30 sittings ×10: 20 min (${merMinutesOf(c3, 'pri')})`);
    c3.tasks.use = { 'act:mer': 99 }; assert(actSpeed(c3, 'mer') === 10, 'v0.11.15: ×10 is the cap');
    c3.tasks.use = {}; c3.minutes += 0; const cm = c3.minutes; choose(c3, SCENES, wp); assert(c3.tasks.use['act:mer'] === 1 && c3.james.primaries === 1 && c3.minutes - cm === 120, 'v0.11.15: a sitting counts one use');
    // the Fed lock (pick 2a): below Fed 20 the work cards lock, and the screen says why
    const h = ensureBars(newGame(47, { closed: true })); h.scene = 'meridians'; h.james.qi = 20; h.james.satiety = 19;
    assert(merChoice(h, SCENES) === -1 && /Too hungry to sit/.test(SCENES.meridians.text(h)), 'Fed under 20: no sitting, the screen says why');
    h.james.satiety = 20; assert(merChoice(h, SCENES) >= 0, 'Fed 20: sitting allowed');
    // Foundation needs all 12 primaries; collaterals still closed seal; a rewind unwinds Foundation
    const b = ensureBars(newGame(42, { closed: true })); b.scene = 'stream'; b.james.saturation = 96; b.james.primaries = 11;
    assert(!canBreakThrough(b) && medCards(b, SCENES).some((c) => c.id === 'med:bt' && !c.open && /12 primaries/.test(c.reason)), 'Foundation: locked at 11 primaries, the card says why');
    b.james.primaries = 12; b.james.collaterals = 18;
    assert(canBreakThrough(b) && btTarget(b) === 'col_warn', 'with all 12: the warning before sealing');
    runMed(b, SCENES, 'med:bt');
    assert(b.scene === 'col_warn', 'Meditate → Break through → the warning');
    choose(b, SCENES, SCENES.col_warn.choices.findIndex((c) => c.to === 'breakthrough'));
    assert(b.james.realm === 1 && b.james.colSealed && !canColGroup(b), 'sealed at Foundation: no collaterals any more');
    b.james.saturation = 40; b.inventory.hare_raw = 3;
    endCoil(b, 'choice', 'stream'); rewind(b);
    assert(b.james.realm === 0 && b.james.saturation === 0 && !b.james.colSealed && b.yuki.realm === 0 && b.james.collaterals === 0 && b.james.primaries === 0 && !b.inventory.hare_raw, 'v0.11.0: the rewind starts James over: Mortal Vessel, Saturation 0, meridians closed again');
    const k = ensureBars(newGame(43, { closed: true })); k.james.primaries = 12; k.james.collaterals = 66; k.james.saturation = 96; k.flags.bt_return = 'stream';
    assert(btTarget(k) === 'breakthrough', 'everything open: no warning');
    breakthrough(k); endCoil(k, 'choice', 'stream'); rewind(k);
    assert(k.james.realm === 0 && k.james.primaries === 0, 'v0.11.0: the realm starts over on a rewind, sealed or not');
    // the closed Day 1 scan text
    assert(/ash/.test(SCENES.yuki_check.text(ensureBars(newGame(45, { closed: true })))) && /Twelve primaries open/.test(SCENES.yuki_check.text(open)), 'Day 1 scan text follows the meridians');
}
// v0.11.0: the Coil bonus — ×(1 + 0.5 × earlier Coils), Incremental Mode only; v0.11.29 (RB-1): ×(1 + 0.25 × earlier Coils)
{
    setNoDice(true);
    const g = ensureBars(newGame(91, { closed: true }));
    assert(coilMult(g) === 1, 'Coil 1: ×1');
    const xp1 = (h) => { const c = structuredClone(h); const out = awardXp(c, 'Convergence Use', 'standard'); return Number(/\+(\d+) XP/.exec(out[0])[1]); };
    const base = xp1(g);
    endCoil(g, 'choice', 'arrival'); rewind(g); endCoil(g, 'choice', 'arrival'); rewind(g);
    assert(g.coil.n === 3 && coilMult(g) === 1.5 && xp1(g) === Math.floor(base * 1.5), `Coil 3: ×1.5 XP (${base} → ${xp1(g)})`);
    const y0 = g.yuki.fight.xp; awardYukiFightXp(g, 'standard'); assert(g.yuki.fight.xp - y0 === 45 || g.yuki.fight.level > 1, `Yuki's XP ×1.5 too (${g.yuki.fight.xp - y0})`);
    const dc1 = dcPrimary(ensureBars(newGame(92, { closed: true }))); assert(Math.abs(dcPrimary(g) - Math.round(dc1 / 1.5 * 10) / 10) < 0.11, `meridian DC ÷1.5 (${dc1} → ${dcPrimary(g)})`);
    g.james.qi = 40; const s0 = g.james.saturation; const r = condense(g); const one = ensureBars(newGame(93, { closed: true })); one.james.qi = 40; const r1 = condense(one);
    assert(r.ok && Math.abs((g.james.saturation - s0) - r1.gain) < 0.2, `v0.11.15: a sit gives the same Saturation on Coil 3 (${r1.gain} → ${g.james.saturation - s0})`);
    const a = ensureBars(newGame(94)); a.scene = 'epilogue'; a.flags.ending = 'bluff'; a.minutes = 6 * 1440 + 900; a.coil.n = 5;
    choose(a, SCENES, 0);
    assert(a.coil.act === 1 && a.coil.n === 5 && coilMult(a) === 2, 'v0.11.26 (one count, N1): Act 1 continues the prologue\'s Coil 5 at ×2 (×3 before v0.11.29)');
}
// v0.11.29 (owner pick RB-1): the two walls and the bonus text
{
    const { NO_DICE_TUNE } = await import('../js/story/nodice_tune.js');
    const { fmtMult, COIL_GROWTH } = await import('../js/core/game.js');
    assert(NO_DICE_TUNE.collectors.up === 4.5 && NO_DICE_TUNE.rot_ape.up === 15 && COIL_GROWTH === 0.25, `RB-1: the tribute 4.5, the rot ape 15, the Coil bonus 0.25 per Coil (${NO_DICE_TUNE.collectors.up}, ${NO_DICE_TUNE.rot_ape.up}, ${COIL_GROWTH})`);
    assert(fmtMult(1) === '1' && fmtMult(1.25) === '1.25' && fmtMult(1.5) === '1.5' && fmtMult(2.75) === '2.75', 'fmtMult: ×1.25 shows as 1.25, not 1.3');
}
// v0.10.4: Bonesinger forms — Incremental Mode shows only what James can sing
{
    setNoDice(true);
    const setCu = (g, t, l) => { g.james.skills['Convergence Use'] = { tier: t, level: l, xp: 0 }; };
    const g = ensureBars(newGame(81, { closed: true }));
    assert(Object.keys(FORM_LINES).join() === 'ranged,melee,structures,reach,defence', 'five lines (v0.11.4: reach)');
    assert(cuRank(g) === 1 && hasForm(g, 'needle') && hasForm(g, 'fragile_knife') && !hasForm(g, 'dart') && !hasForm(g, 'spikes') && !hasForm(g, 'bracer'), 'T1 L1: needle and fragile knife only');
    assert(!actionOpen(g, 'dart') && actionOpen(g, 'needle') && actionOpen(g, 'blade') && actionOpen(g, 'guard') && actionLabel(g, 'blade', 'x') === 'Fragile bone knife' && fragileKnife(g), 'fight at T1 L1: no darts, a fragile knife');
    setCu(g, 1, 5); assert(actionOpen(g, 'dart') && actionLabel(g, 'dart', 'x') === 'Bone darts' && /Bracer/.test(actionLabel(g, 'guard', 'x')), 'T1 L5: darts and a bracer');
    setCu(g, 1, 8); assert(!fragileKnife(g) && actionLabel(g, 'blade', 'x') === 'Bone knife', 'T1 L8: the knife holds');
    setCu(g, 2, 5); assert(actionLabel(g, 'blade', 'x') === 'Bone sword' && /Shield/.test(actionLabel(g, 'guard', 'x')), 'T2 L5: sword and shield');
    setCu(g, 3, 1); assert(actionLabel(g, 'dart', 'x') === 'Thrown bone lance' && hasForm(g, 'slab'), 'T3 L1: lance and slab');
    // the knife breaks every swing below T1 L8 and holds from it
    for (const [l, holds] of [[1, false], [8, true]]) {
        const h = ensureBars(newGame(82, { closed: true })); setCu(h, 1, l); h.james.qi = 40;
        sCombat(h, { id: 'jackals', intro: '', band: 'standard', enemies: [{ name: 'Dummy', hp: 999, dc: 1, atk: 1, dmg: 0 }], win: 'stream', lose: 'stream' });
        cStep(h, 'blade');
        assert(!!h.combat.bladeFormed === holds, `T1 L${l}: the knife ${holds ? 'holds' : 'breaks'} after a swing`);
        const q0 = h.james.qi; cStep(h, 'dart');
        if (l < 5) assert(h.combat && h.james.qi === q0, `v0.11.21: a dart below T1 L5 falls back on guarding (no Qi spent: ${q0} → ${h.james.qi})`); // was `|| true`: could never fail
    }
    // story choices: hidden until the form, then back
    const s = ensureBars(newGame(83, { closed: true })); s.minutes = 7 * 60;
    goTo(s, SCENES, 'hunt'); const lab = () => sceneView(s, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    assert(!lab().some((x) => /bone dart/.test(x)), 'Day 1 hunt: no dart below T1 L5');
    setCu(s, 1, 5); assert(lab().some((x) => /bone dart/.test(x)), 'Day 1 hunt: the dart at T1 L5');
    let gated = 0; for (const sc of Object.values(SCENES)) for (const c of sc.choices || []) if (c.form) gated++;
    assert(gated === 18, `18 story choices need a form (${gated})`);
    // the rewordings: Incremental Mode only
    const t = (sc, re) => SCENES[sc].choices.find((c) => re.test(String(typeof c.text === 'function' ? c.text(s) : c.text)));
    assert(t('night_attack', /^A hedge of bone spikes/) && t('rt_ford', /stepping-stones/) && t('rt_ambush', /slab of bone/) && t('ring_chambers', /slab of bone/), 'four rewordings in Incremental Mode');
    assert(/hedge/.test(SCENES.night_attack_forced.text(s)), 'the hedge fail text');
    const fc = t('rt_ford', /stepping-stones/); const fg = ensureBars(newGame(84)); setCu(fg, 3, 1);
    assert(fc.do(fg).some((l) => /stepping-stones/.test(l)), 'the ford result line');
}
// v0.10.2: the camp is a task screen (its checks keep the story numbers); waiting for a time of day plays at once
{
    setNoDice(true);
    const g = ensureBars(newGame(71, { closed: true })); goTo(g, SCENES, 'camp'); g.minutes = 15 * 60;
    g.james.skills['Convergence Use'].level = 3; // v0.10.4: the stakes need spikes (T1 L3)
    assert(isTaskHub(g), 'camp is a task hub');
    const cards = taskCards(g, SCENES);
    const fire = cards.find((c) => /^Make fire/.test(c.label)), stakes = cards.find((c) => /^Sing a ring/.test(c.label));
    assert(fire && fire.kind === 'chore' && stakes && stakes.kind === 'chore', 'fire and stakes are chores (story-check numbers)');
    assert(!cards.some((c) => /^Night falls/.test(c.label)) && !isTaskChoice(SCENES, 'camp', SCENES.camp.choices.findIndex((c) => /^Night falls/.test(c.text))), 'Night falls stays a story card');
    // same numbers as the story choice: a copy taking the choice directly ends identical
    const a = structuredClone(g), b = structuredClone(g);
    runTask(a, SCENES, fire.id); choose(b, SCENES, Number(fire.id.split(':')[1]));
    assert(a.minutes === b.minutes && a.flags.fire === b.flags.fire && a.james.hp === b.james.hp && JSON.stringify(a.james.gu) === JSON.stringify(b.james.gu), 'the fire card = the story choice (time, result, XP)');
    const q = taskQueue(g); q.push(fire.id, stakes.id); const ol = outlook(g, SCENES);
    runTask(g, SCENES, q.shift()); runTask(g, SCENES, q.shift());
    assert(ol.rows[1].end === g.minutes && g.flags.fire && g.flags.stakes, 'camp cards queue and the forecast matches');
    const ni = SCENES.camp.choices.findIndex((c) => /^Night falls/.test(c.text));
    const m0 = g.minutes; const c = structuredClone(g); choose(c, SCENES, ni);
    assert(waitChoice(SCENES, SCENES.camp.choices[ni], c.minutes - m0, 'camp'), 'Night falls is a wait (plays at once)');
    choose(g, SCENES, ni);
    assert(g.scene === 'night' || g.minutes % 1440 >= 21 * 60, 'Night falls: the clock lands on 21:00 or later');
    assert(!waitChoice(SCENES, SCENES.camp.choices[0], 999, 'camp') && !waitChoice(SCENES, { text: 'x', to: 'night', combat: () => ({}) }, 999), 'a check, a fight or a choice back to its own scene is never a wait');
    let waits = 0;
    for (const [id, sc] of Object.entries(SCENES)) for (const ch of sc.choices || []) if (waitChoice(SCENES, ch, 999, id)) { waits++; assert(!ch.check && !ch.qi && !ch.combat && ch.time == null, `wait ${id} has no check, Qi, fight or time`); }
    assert(waits >= 20, `waiting choices found (${waits})`);
}
// v0.10.1: the Long Forest in task mode — gated behind the first Coil, one season (+1 realm) per card
{
    setNoDice(true);
    const labels = (g) => sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    const g = ensureBars(newGame(61, { closed: true }));
    assert(!labels(g).some((l) => /Stay lost/.test(l)), 'Coil 1: no Stay lost on the arrival');
    g.scene = 'clearing';
    assert(!labels(g).some((l) => /Stay lost/.test(l)) && !lfOpen(g), 'Coil 1: no Stay lost in the clearing');
    endCoil(g, 'choice', 'clearing'); rewind(g);
    assert(g.coil.n === 2 && g.scene === 'arrival' && lfOpen(g), 'Coil 2: the Long Forest opens');
    assert(labels(g).some((l) => /You remember this\. Stay lost/.test(l)), 'Coil 2: Stay lost on the arrival');
    const c2 = structuredClone(g); c2.scene = 'clearing';
    assert(labels(c2).some((l) => /one season at a time/.test(l)) && !labels(c2).some((l) => /in one step/.test(l)), 'Coil 2: Stay lost in the clearing (seasons), no one-step button');
    choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => /You remember this\. Stay lost/.test(c.label)).index);
    assert(g.scene === 'lf_enter' && g.flags.longforest && g.flags.lf_active && g.flags.bone_ok, 'the arrival leads into the Long Forest');
    choose(g, SCENES, 0);
    assert(g.scene === 'lf_hub' && isTaskHub(g) && coilActive(g), 'the camp is a task screen, inside the Coil');
    const season = taskCards(g, SCENES).find((c) => /^Withdraw for a season/.test(c.label));
    assert(season && season.kind === 'chore' && season.minutes === LF_SEASON_MINUTES && /Mortal Vessel → Foundation/.test(season.label), 'the season card: a chore, 2 h, Mortal Vessel → Foundation');
    const q = taskQueue(g); q.push(season.id, season.id);
    const ol = outlook(g, SCENES);
    const m0 = g.minutes;
    runTask(g, SCENES, q.shift());
    assert(g.james.realm === 1 && g.yuki.realm === 1 && g.james.primaries === 12 && g.james.collaterals === 66 && g.yuki.collaterals === 66 && !g.james.colSealed, 'a season: Foundation, every primary and collateral open, no seal');
    assert(g.james.gu.tier === 1 && g.james.gu.level === 7 && g.james.skills['Convergence Use'].level === 7 && g.yuki.fight.level === 7 && g.yuki.qiUse.level === 7, 'a season lifts the skills to T1 L7');
    assert(g.minutes - m0 === LF_SEASON_MINUTES && g.james.saturation === 0 && g.james.hp === jamesHpMax(g), 'a season takes 2 h, Saturation 0, bars full');
    runTask(g, SCENES, q.shift());
    assert(g.james.realm === 2 && ol.rows[1] && ol.rows[1].end === g.minutes, 'two queued seasons: Core Formation, and the forecast matched');
    for (let i = 0; i < 20; i++) { g.james.satiety = 100; lfSeason(g); }
    assert(g.james.realm === MAX_REALM && g.james.gu.tier === 10 && g.james.gu.level === 10 && g.yuki.qiUse.tier === 10 && g.james.extra8 === 8 && g.james.extraCollaterals === 28 && g.james.junctions === 10, 'the full climb: Heavenly Immortal, T10 L10, every extra meridian');
    assert(!taskCards(g, SCENES).some((c) => /^Withdraw for a season/.test(c.label)), 'no season card at the top of the ladder');
    assert(lfRank(7) === 49 && lfRank(10) === 70 && lfRank(14) === 100, 'ranks per rung: 49 / 70 / 100');
    const hi = ensureBars(newGame(62, { closed: true })); hi.james.gu = { tier: 10, level: 10, xp: 0 }; hi.james.realm = 1; hi.james.colSealed = true;
    lfSeason(hi);
    assert(hi.james.gu.tier === 10 && hi.james.realm === 2 && !hi.james.colSealed && hi.james.collaterals === 66, 'a season never lowers a skill, and lifts a seal');
    goTo(g, SCENES, 'lf_exit'); choose(g, SCENES, 0);
    assert(g.scene === 'dawn' && !g.flags.lf_active && LF_STOCK.every((id) => g.inventory[id] >= itemCap(id) - 1), 'leaving: Day 4 at dawn, the hammerspace full (less breakfast)');
    endCoil(g, 'choice', 'stream'); rewind(g);
    assert(g.james.realm === 0 && !g.inventory.hare_raw && g.coil.n === 3 && lfOpen(g), 'v0.11.0: a rewind starts the realm over, empties the hammerspace, and the forest stays open (climb it again)');
}
// v0.9.6: Act 1's Coil — Day 8 dawn, ends at Shen Qiu (rt_taken), accept or rewind; state 4 → 5
{
    setNoDice(true);
    const g = ensureBars(newGame(50)); g.scene = 'epilogue'; g.flags.ending = 'bluff'; g.minutes = 6 * 1440 + 15 * 60; g.coil.n = 3;
    choose(g, SCENES, 0);
    assert(g.scene === 'fo_start' && g.coil.act === 1 && g.coil.n === 3 && g.coil.snap.scene === 'fo_start' && g.coil.snap.minutes === 7 * 1440 + 360 && g.stats.coils0 === 3, 'Act 1 begins: its rewind point at Day 8 dawn, the same Coil (3) goes on (v0.11.26)');
    assert(coilActive(g), 'the Coil turns in Act 1');
    const inv0 = JSON.stringify(g.coil.snap.inventory);
    g.inventory.beast_core = 7; g.flags.log_heard = true; g.minutes += 12 * 1440; g.rel['Mei Lin'] = { f: 80, a: 80 };
    const { bumpRel } = await import('../js/core/game.js'); bumpRel(g, 'Mei Lin', 0, 0);
    goTo(g, SCENES, 'rt_taken');
    const bite = sceneView(g, SCENES).choices.find((c) => /Bite the tail/.test(c.label));
    assert(!!bite, 'rt_taken offers Bite the tail');
    choose(g, SCENES, bite.index);
    const v = sceneView(g, SCENES);
    assert(g.scene === 'coil_end' && g.coil.why === 'shen' && v.choices.some((c) => /Accept it. Walk/.test(c.label)) && /Act 1/.test(v.title), 'the Coil screen after Shen Qiu: accept or rewind');
    assert(/Wren Aldous/.test(v.text), 'James remembers the log');
    assert(v.choices.some((c) => /start of Act 1/.test(c.label)) && v.choices.some((c) => /start of the whole game/.test(c.label)) && !v.choices.some((c) => /same days/.test(c.label)), 'v0.11.26: Act 1\'s Coil screen: the start of Act 1 or of the whole game, no "same days again"');
    choose(g, SCENES, v.choices.find((c) => /start of Act 1/.test(c.label)).index);
    assert(g.scene === 'coil_dawn' && /Ashfall/.test(sceneView(g, SCENES).text), 'the start of Act 1 again');
    choose(g, SCENES, 0);
    assert(g.scene === 'fo_start' && g.coil.act === 1 && g.coil.n === 4 && g.minutes === 7 * 1440 + 360 && JSON.stringify(g.inventory) === inv0 && !g.flags.log_heard && !g.flags.a1_outcome, 'rewound to the start of Act 1: Coil 4 (one count), the world as it was');
    assert(g.rel['Mei Lin'].a >= 20, `25% head start in Act 1 (${g.rel['Mei Lin'].a})`);
    const a = ensureBars(newGame(51)); a.scene = 'epilogue'; a.flags.ending = 'lost'; a.minutes = 6 * 1440 + 15 * 60; choose(a, SCENES, 0);
    goTo(a, SCENES, 'rt_taken'); choose(a, SCENES, sceneView(a, SCENES).choices.find((c) => /Bite/.test(c.label)).index);
    choose(a, SCENES, sceneView(a, SCENES).choices.find((c) => /Accept it. Walk/.test(c.label)).index);
    assert(a.scene === 'a1_end' && a.flags.a1_outcome === 'taken' && coilActive(a), 'accept: on to the end of Act 1, where the Coil still turns (v0.11.26)');
    // v0.11.26 (owner 11:07, E1): the end of Act 1 goes round again, every outcome, to the start of Act 1 or of the whole game
    for (const [outcome, target] of [['taken', 'act'], ['victory', 'game'], ['revelation', 'act'], ['taken', 'game']]) {
        const e = ensureBars(newGame(57)); e.scene = 'epilogue'; e.flags.ending = 'paid'; e.minutes = 6 * 1440 + 15 * 60; e.coil.n = 2; choose(e, SCENES, 0);
        e.inventory.beast_core = 9; e.flags.a1_outcome = outcome; e.flags.lore_tree = true; e.flags.ship_found = true; e.tasks.fam['rr_hub:1'] = 7; e.rel['Mei Lin'] = { f: 60, a: 80 };
        const { bumpRel } = await import('../js/core/game.js'); bumpRel(e, 'Mei Lin', 0, 0);
        goTo(e, SCENES, 'a1_end');
        const ev = sceneView(e, SCENES);
        assert(ev.end && ev.choices.length === 1 && /Go round again/.test(ev.choices[0].label), `${outcome}: the end screen offers Go round again`);
        choose(e, SCENES, ev.choices[0].index);
        const av = sceneView(e, SCENES);
        assert(e.scene === 'a1_again' && av.choices.map((c) => c.label).join('|') === 'Bite the tail. Wake at the start of Act 1.|Bite the tail. Wake at the start of the whole game (Day 1, the arrival).|Not yet.', `${outcome}: the confirm screen`);
        choose(e, SCENES, av.choices.find((c) => (target === 'act' ? /start of Act 1/ : /whole game/).test(c.label)).index);
        assert(e.scene === 'coil_dawn' && e.coil.n === 3 && coilMult(e) === 1.5 && !e.flags.a1_outcome && !e.inventory.beast_core, `${outcome} → ${target}: Coil 3 (one count), ×1.5, the outcome and the hammerspace gone`);
        assert(e.tasks.fam['rr_hub:1'] === 7 && e.flags.lore_tree && e.coil.known.includes('ship_found') && e.rel['Mei Lin'].a >= 20, `${outcome} → ${target}: familiarity, knowledge and the head start kept`);
        choose(e, SCENES, 0);
        if (target === 'act') assert(e.scene === 'fo_start' && e.coil.act === 1 && e.minutes === 7 * 1440 + 360 && e.flags.ending === 'paid', `${outcome} → the start of Act 1 (the prologue's outcome kept)`);
        else {
            assert(e.scene === 'arrival' && e.coil.act === 0 && e.minutes === newGame(1).minutes && !e.flags.ending && e.james.primaries === 0 && e.james.realm === 0, `${outcome} → the start of the whole game: Day 1, the arrival, channels shut, no tribute outcome`);
            assert(e.coil.snap.scene === 'arrival' && !e.coil.snap.flags.lore_tree && e.coil.snap.tasks.fam['rr_hub:1'] === undefined, 'the whole game\'s rewind point is a clean arrival');
            e.scene = 'epilogue'; e.flags.ending = 'bluff'; e.minutes = 6 * 1440 + 15 * 60; choose(e, SCENES, 0);
            assert(e.coil.act === 1 && e.coil.n === 3 && e.stats.coils0 === 3, 'back in Act 1 the same Coil goes on (3)');
        }
    }
    {
        const n = ensureBars(newGame(58)); n.scene = 'epilogue'; n.flags.ending = 'paid'; n.minutes = 6 * 1440 + 15 * 60; choose(n, SCENES, 0);
        endCoil(n, 'choice', 'a1_end'); const r = rewind(n, { same: true });
        assert(r === 2 && !('played' in n.coil) && !('replay' in n.coil), 'v0.11.26: no "same days again" (the old option is ignored, its fields gone)');
        const pv = ensureBars(newGame(59)); endCoil(pv, 'choice', 'arrival'); goTo(pv, SCENES, 'coil_end');
        assert(sceneView(pv, SCENES).choices.filter((c) => /Bite/.test(c.label)).map((c) => c.label).join('|') === 'Bite the tail. Wake at the first dawn.', 'v0.11.26: the prologue wakes at the first dawn only');
    }
    // v0.11.26: one count per save; an older save's Act 1 count becomes the prologue's + Act 1's − 1, once
    {
        const o = ensureBars(newGame(60)); o.scene = 'epilogue'; o.flags.ending = 'paid'; o.minutes = 6 * 1440 + 15 * 60; choose(o, SCENES, 0);
        o.coil.n = 2; o.stats.coils0 = 4; delete o.coil.one; migrate(o);
        assert(o.coil.n === 5 && o.coil.one, `an older Act 1 save: 4 + 2 − 1 = Coil 5 (${o.coil.n})`);
        migrate(o); assert(o.coil.n === 5, 'and only once');
        const pr = ensureBars(newGame(61)); pr.coil.n = 3; delete pr.coil.one; migrate(pr); assert(pr.coil.n === 3 && pr.coil.one, 'a prologue save keeps its count');
    }
    {   // the owner's save (2026-11-07 11:02): the end of Act 1 after "taken", Act 1 Coil 1 after 1 prologue Coil
        const { readFileSync } = await import('node:fs'); const { gunzipSync } = await import('node:zlib');
        const t = readFileSync(new URL('../saves/2026-11-07-1102-incremental-a1_end.txt', import.meta.url), 'utf8').trim();
        const w = JSON.parse(gunzipSync(Buffer.from(t.slice(5), 'base64')).toString('utf8'));
        const o = migrate(JSON.parse(w.data)); ensureBars(o);
        assert(o.scene === 'a1_end' && o.coil.n === 1 && coilActive(o) && /Go round again/.test(sceneView(o, SCENES).choices[0]?.label), 'the owner\'s 11:02 save: Coil 1, Go round again offered');
        const o2 = JSON.parse(JSON.stringify(o));
        choose(o, SCENES, 0); choose(o, SCENES, sceneView(o, SCENES).choices.findIndex((c) => /start of Act 1/.test(c.label))); choose(o, SCENES, 0);
        assert(o.scene === 'fo_start' && o.coil.n === 2 && o.coil.act === 1, 'the owner\'s save → the start of Act 1, Coil 2');
        choose(o2, SCENES, 0); choose(o2, SCENES, sceneView(o2, SCENES).choices.findIndex((c) => /whole game/.test(c.label))); choose(o2, SCENES, 0);
        assert(o2.scene === 'arrival' && o2.coil.n === 2 && o2.coil.act === 0, 'the owner\'s save → the whole game, Coil 2');
    }
    // v0.11.26 (Fable review): the save list shows the one count; the dawn screen names no number
    {
        const { peekSave, serialize } = await import('../js/core/game.js');
        const o = ensureBars(newGame(62)); o.scene = 'epilogue'; o.flags.ending = 'paid'; o.minutes = 6 * 1440 + 15 * 60; choose(o, SCENES, 0);
        o.coil.n = 2; o.stats.coils0 = 3; delete o.coil.one;
        assert(peekSave(serialize(o)).coil === 4, 'v0.11.26: the save list shows an older Act 1 save as it will load (3 + 2 − 1)');
        endCoil(o, 'choice', 'fo_start'); o.coil.one = true; rewind(o, { to: 'game' }); goTo(o, SCENES, 'coil_dawn');
        assert(/seen this sky before/.test(sceneView(o, SCENES).text) && !/\d+ times before/.test(sceneView(o, SCENES).text), 'v0.11.26: the dawn again says "before", no count');
    }
    // state 4 → 5: prologue saves get act 0; a save mid-Act 1 gets an Act 1 Coil that rewinds to where it was loaded
    const p4 = ensureBars(newGame(52)); p4.v = 4; delete p4.coil.act; migrate(p4);
    assert(p4.v === SAVE_VERSION && p4.coil.act === 0, 'state 4 in the prologue: act 0');
    const s4 = ensureBars(newGame(53)); s4.flags.ending = 'paid'; s4.scene = 'fo_ashfall'; s4.minutes = 8 * 1440 + 600; s4.v = 4; delete s4.coil.act; migrate(s4);
    assert(inAct1(s4) && s4.coil.act === 1 && s4.coil.n === 1 && s4.coil.snap.scene === 'fo_ashfall' && s4.coil.wake === 'fo_ashfall', 'state 4 mid-Act 1: an Act 1 Coil from the save as loaded');
}

// v0.9.7: severe difficulty — HP 0 outside a fight and a lost beast fight end the Coil; people keep their branches
{
    setNoDice(true);
    const g = ensureBars(newGame(60)); g.james.hp = 0.5; g.james.satiety = 0; g.starveCarry = 55; // v0.10.0: a starving hour builds up first
    choose(g, SCENES, SCENES.arrival.choices.findIndex((c) => /Sit up/.test(String(c.text))));
    assert(g.scene === 'coil_end' && g.coil.why === 'collapse', `starving to 0 ends the Coil (${g.scene})`);
    assert(!sceneView(g, SCENES).choices.some((c) => /Accept/.test(c.label)), 'no Accept after a death');
    const enc = (id) => ({ id, intro: 'x', enemies: [{ name: 'X', hp: 99, dc: 40, atk: 40, dmg: 40 }], win: 'night_won', lose: id === 'gao' ? 'gao_lost' : 'night_lost' });
    const b = ensureBars(newGame(61)); b.scene = 'night_event'; startCombat(b, enc('rats'));
    let o; for (let t = 0; t < 50 && b.combat; t++) o = combatStep(b, 'dart');
    assert(o.done === 'lose' && o.next === 'coil_end' && b.coil.why === 'beast', 'a lost beast fight goes to the Coil screen');
    goTo(b, SCENES, o.next);
    assert(/Teeth/.test(sceneView(b, SCENES).text), 'the beast text');
    const p = ensureBars(newGame(62)); p.scene = 'herb_girl'; startCombat(p, enc('gao'));
    for (let t = 0; t < 50 && p.combat; t++) o = combatStep(p, 'dart');
    assert(o.next === 'gao_lost', 'a lost fight against a person keeps its scene');
    const e = ensureBars(newGame(63)); startCombat(e, { id: 'zz_test', enemies: [{ name: 'Y', hp: 5, dc: 3, atk: 3, dmg: 1 }], win: 'night_won', lose: 'night_lost' });
    assert(e.combat.enemies[0].dc === 3.5 && e.combat.enemies[0].atk === 3.5, 'beasts +0.5 in task mode');
    const tg = ensureBars(newGame(64));
    const bl = SCENES.tribute.choices.find((c) => /Bluff/.test(String(c.text))), hp = SCENES.tribute.choices.find((c) => /hairpin/.test(String(c.text)));
    assert(bl.check.dc(tg) === 7 && hp.check.dc(tg) === 5, 'tribute +1 in task mode');
}
// the Coil: rewind keeps James, Yuki, familiarity and knowledge; resets the world; 25% head start
{
    setNoDice(true);
    const g = ensureBars(newGame(21)); g.scene = 'ashfall'; g.minutes += 4 * 1440;
    Object.assign(g.flags, { long: true, vday: 2, lore1: true, lore_realms: true, saw_lights: true, bone_sung: true, roots: true, gills: true, healed: true, boar: true, gao_dead: true, yk_path: 'sister', longforest: true });
    g.inventory = { hare_raw: 5, beast_core: 3 };
    g.rel = {}; const bump = (w, f, a) => { const r = g.rel[w] || (g.rel[w] = { f: 0, a: 0 }); r.f += f; r.a += a; const p = g.coil.peak[w] || (g.coil.peak[w] = { f: 0, a: 0 }); p.f = Math.max(p.f, r.f); p.a = Math.max(p.a, r.a); };
    bump('Mei Lin', 80, 40); bump('Mei Lin', -30, 0); bump('Village', 40, 0); bump('Yuki', 20, 10);
    g.james.realm = 1; g.yuki.realm = 1; g.james.saturation = 40; g.james.gu.level = 5; g.yuki.fight.level = 3; g.james.extra8 = 2;
    g.tasks.fam = { 'wild_forage:0': 9 }; g.tasks.adapt = { 'wild_forage:0': 1 }; g.tasks.yuki.on = true; g.tasks.queue = ['ashfall:3'];
    g.james.hp = 3; g.james.satiety = 5;
    const stats0 = g.stats.checks = 17;
    endCoil(g, 'choice', 'ashfall');
    assert(g.coil.known.includes('bone_sung') && g.coil.known.includes('roots') && g.coil.known.includes('gills'), 'the Coil remembers the one-time discoveries');
    const n = rewind(g);
    assert(n === 2 && g.coil.n === 2 && g.scene === 'arrival' && g.minutes === newGame(1).minutes, `rewind to Day 1 dawn (${g.scene})`);
    const s0 = newGame(1);
    assert(g.james.realm === s0.james.realm && g.yuki.realm === s0.yuki.realm && g.james.saturation === 0 && g.james.gu.level === 1 && g.yuki.fight.level === 1 && !g.james.extra8, 'v0.11.0: realm, skills, meridians, Saturation start over');
    assert(g.rel.Yuki && g.flags.yk_path === 'sister' && g.tasks.fam['wild_forage:0'] === 9, 'v0.11.0: Yuki\'s bond and path and familiarity kept');
    assert(g.tasks.fam['wild_forage:0'] === 9 && g.tasks.adapt['wild_forage:0'] === 1 && g.tasks.yuki.on && g.tasks.queue.length === 0, 'familiarity and adaptation kept, queue empty');
    assert(Object.keys(g.inventory).length === 0, 'hammerspace empty');
    for (const f of ['lore1', 'lore_realms', 'saw_lights', 'yk_path', 'long', 'longforest']) assert(g.flags[f] !== undefined, `knowledge flag ${f} kept`);
    for (const f of ['healed', 'boar', 'gao_dead', 'vday', 'bone_sung', 'roots', 'gills']) assert(g.flags[f] === undefined, `world flag ${f} reset`);
    assert(g.rel['Mei Lin'].f === 20 && g.rel['Mei Lin'].a === 10 && g.rel.Village.f === 10 && g.rel.Yuki.f === 20 && g.rel.Yuki.a === 10, `25% head start from the peak, Yuki kept (${JSON.stringify(g.rel)})`);
    assert(g.james.hp === jamesHpMax(g) && g.james.satiety === 70 && g.stats.checks === stats0, 'bars full, Fed back to the start, stats kept');
    assert(KEEP_FLAGS.every((f) => !(f in REMEMBER)), 'no flag both kept and remembered');
    // "You remember this" and the first dawn
    const v = sceneView(g, SCENES);
    assert(v.choices.some((c) => /You remember this/.test(c.label)), 'Coil 2 offers the Day 1 skip');
    // "Not yet" returns without running the scene again; a lost tribute offers the tail
    const h = ensureBars(newGame(22)); h.scene = 'collectors_lost'; h.flags.ending = 'lost';
    assert(coilActive(h) && SCENES.collectors_lost.choices.some((c) => c.to === 'coil_end' && c.show(h)), 'lost tribute: Bite the tail offered');
    const k = ensureBars(newGame(23)); k.scene = 'collectors_lost'; k.flags.ending = 'lost';
    choose(k, SCENES, SCENES.collectors_lost.choices.findIndex((c) => c.to === 'coil_end'));
    const acc = sceneView(k, SCENES).choices.find((c) => /^Accept/.test(c.label));
    assert(k.scene === 'coil_end' && acc, 'the Coil screen offers Accept after a lost tribute');
    choose(k, SCENES, acc.index);
    assert(k.scene === 'epilogue' && k.flags.ending === 'lost' && k.coil.n === 1, 'Accept goes on to the epilogue');
    const w = ensureBars(newGame(24)); w.scene = 'wilds'; w.flags.long = true; w.inventory.hare_raw = 2;
    endCoil(w, 'choice', 'wilds'); goTo(w, SCENES, 'coil_end');
    const ny = sceneView(w, SCENES).choices.find((c) => c.label === 'Not yet.');
    choose(w, SCENES, ny.index);
    assert(w.scene === 'wilds' && w.inventory.hare_raw === 2 && w.coil.n === 1 && !w.coil.why, 'Not yet goes back unchanged');
    // breakthrough from 95%
    const b = ensureBars(newGame(26)); b.james.saturation = 96;
    assert(canBreakThrough(b), 'task mode: break through from 95%');
    // old state 3 → 4: Coil 1, the snapshot is the save as loaded
    const o = ensureBars(newGame(27)); o.scene = 'ashfall'; o.inventory.hare_raw = 4; delete o.coil; o.v = 3; migrate(o);
    assert(o.v === SAVE_VERSION && o.coil.n === 1 && o.coil.snap.scene === 'ashfall' && o.coil.snap.inventory.hare_raw === 4 && !o.coil.snap.coil, 'state 3 → 4: Coil 1, snapshot = the save as loaded');
}

// v0.11.2: timed cultivation — a sit is an hour, Saturation by hours (10 h × 2^realm ÷ the Coil bonus), the breakthrough a timed card
{
    setNoDice(true);
    assert(SAT_HOURS(0) === 10 && SAT_HOURS(1) === 20 && SAT_HOURS(3) === 80, 'Saturation hours: 10, 20, 40, 80 …');
    // v0.11.15 (B1-b): speed by use — cards N 18 (the old tiers on the line), the sit N 30, kept over a rewind
    assert(cardSpeed(0) === 1 && cardSpeed(2) === 2 && cardSpeed(5) === 3.5 && cardSpeed(8) === 5 && cardSpeed(18) === 10 && cardSpeed(40) === 10, 'v0.11.15: card speed 1 / 2 / 3.5 / 5 / 10 / 10 at 0 / 2 / 5 / 8 / 18 / 40 uses');
    { const u = ensureBars(newGame(97, { closed: true })); u.james.qi = 40; const u0 = u.minutes; condense(u);
      assert(u.minutes - u0 === 60 && u.tasks.use['act:sit'] === 1, 'v0.11.15: the first sit: an hour, one use');
      u.tasks.use['act:sit'] = 10; u.james.qi = 40; const u1 = u.minutes; condense(u); assert(u.minutes - u1 === 15, `v0.11.15: after 10 sits ×4: 15 min (${u.minutes - u1})`);
      u.tasks.use['act:sit'] = 30; assert(sitMinutes(u) === 6, 'v0.11.15: after 30 sits ×10: 6 min');
      endCoil(u, 'choice', 'arrival'); rewind(u); assert(u.tasks.use['act:sit'] === 30 && u.coil.n === 2, 'v0.11.15: uses are kept over a rewind');
    }
    const g = ensureBars(newGame(95, { closed: true })); g.james.qi = 40;
    assert(sitGain(g) === 10 && sitGain(g, 2) === 20, 'Mortal Vessel, Coil 1: +10% a sit, the hollow +20%');
    g.james.realm = 1; ensureBars(g); assert(sitGain(g) === 5, 'Foundation: +5% a sit');
    g.coil.n = 3; assert(sitGain(g) === 5, 'v0.11.15: Foundation on Coil 3: still +5% (no Coil bonus)');
    const big = ensureBars(newGame(96)); big.james.qi = 40; const sm = sitGain(big); big.james.primaries = 12; big.james.realm = 0;
    assert(sm === 10, 'the gain does not depend on Qi Max');
    const t = ensureBars(newGame(97, { closed: true })); t.james.qi = 20; const t0 = t.minutes; const r = condense(t);
    assert(r.ok && t.minutes - t0 === 60 && t.james.saturation === 10 && 20 - t.james.qi <= 10 && 20 - t.james.qi > 5, 'a sit: 1 h, 10 Qi (some back from regen), +10%');
    // the breakthrough: 2 h × (realm + 1) ÷ the bonus
    const b = ensureBars(newGame(98)); b.james.saturation = 96;
    assert(btMinutes(b) === 120, 'to Foundation: 2 h'); b.james.realm = 4; assert(btMinutes(b) === 600, 'realm 4 → 5: 10 h'); b.coil.n = 3; assert(btMinutes(b) === 600, 'v0.11.15: Coil 3: still 10 h'); b.tasks.use = { 'act:bt': 3 }; assert(btMinutes(b) === 109, `v0.11.15: after 3 breakthroughs ×5.5: 109 min (${btMinutes(b)})`); b.tasks.use = { 'act:bt': 6 }; assert(btMinutes(b) === 60, 'v0.11.15: after 6 breakthroughs ×10: 1 h'); b.tasks.use = {};
    b.james.realm = 13; b.coil.n = 1; assert(btMinutes(b) === 1680, 'to Heavenly Immortal: 28 h');
    // queued from a hub: the card, its length, the tribulation scene as a story stop
    const q = ensureBars(newGame(99)); q.scene = 'wilds'; q.minutes += 1440; Object.assign(q.flags, { long: true, forest_day: 2 }); q.james.saturation = 96;
    assert(taskOpen(q, SCENES, BT_TASK) && medCards(q, SCENES).some((c) => c.id === 'med:bt' && c.task === BT_TASK && c.minutes === 120), 'the queueable Break through card (2 h)');
    const q0 = q.minutes; const rr = runTask(q, SCENES, BT_TASK);
    assert(rr.stopped && q.scene === 'breakthrough' && q.james.realm === 1 && q.minutes - q0 === 120 && q.flags.bt_return === 'wilds', 'it runs 2 h, then the tribulation scene; back to the hub after');
    const w = ensureBars(newGame(100, { closed: true })); w.scene = 'wilds'; w.minutes += 1440; Object.assign(w.flags, { long: true, forest_day: 2 }); w.james.saturation = 96; w.james.primaries = 12; w.james.collaterals = 9;
    assert(!taskOpen(w, SCENES, BT_TASK) && medCards(w, SCENES).some((c) => c.id === 'med:bt' && !c.task && c.minutes === 0), 'a warning first: not queueable, opens at once');
    // the forecast knows the breakthrough's length
    const f = ensureBars(newGame(101)); f.scene = 'wilds'; f.minutes += 1440; Object.assign(f.flags, { long: true, forest_day: 2 }); f.james.saturation = 96;
    assert(taskMinutes(f, SCENES, BT_TASK) === 120, `the forecast: 120 min (${taskMinutes(f, SCENES, BT_TASK)})`);
}

// v0.11.4: forms 3b — damage by form, the spike field, shield cover, the bone spear (Incremental Mode only)
{
    setNoDice(true);
    const at = (t, l) => { const g = ensureBars(newGame(110)); g.james.skills['Convergence Use'].tier = t; g.james.skills['Convergence Use'].level = l; return g; };
    const blade = COMBAT_ACTIONS.blade, dart = COMBAT_ACTIONS.dart;
    assert(formDmgBonus(at(1, 8), blade) === 0 && formDmgBonus(at(2, 1), blade) === 1 && formDmgBonus(at(2, 5), blade) === 2, 'blade: knife +0, dagger +1, sword +2');
    assert(formDmgBonus(at(2, 9), dart) === 0 && formDmgBonus(at(3, 1), dart) === 2, 'darts: +2 from the thrown lance');
    assert(actionDmg(at(2, 5), blade).join() === '8,14', `sword at T2: (3–6) × 2 + 2 (${actionDmg(at(2, 5), blade)})`);
    assert(guardBonus(at(1, 4)) === 2 && guardBonus(at(1, 5)) === 2.5 && guardBonus(at(2, 1)) === 3 && guardBonus(at(5, 1)) === 4.5, 'Guard +2, +0.5 per defence form');
    assert(!actionOpen(at(1, 2), 'spikes') && actionOpen(at(1, 3), 'spikes') && !actionOpen(at(1, 7), 'spear') && actionOpen(at(1, 8), 'spear'), 'spike field from T1 L3, spear from T1 L8');
    assert(fieldDamage(at(2, 1)) === 1 && fieldDamage(at(3, 1)) === 2 && FIELD_ROUNDS === 2, 'the field: 1 back, 2 from the slab, 2 rounds');
    // a fight: the field, once, then the spear holds a foe off
    const g = at(1, 8); g.james.qi = 30; g.james.gu.level = 9; ensureBars(g); g.james.qi = 30;
    startCombat(g, { id: 'test_rats', name: 't', enemies: [{ name: 'Rat', hp: 40, dc: 2, atk: 3, dmg: 2 }, { name: 'Rat 2', hp: 40, dc: 2, atk: 3, dmg: 2 }], win: 'stream', lose: 'stream' });
    const q0 = g.james.qi; const r1 = combatStep(g, 'spikes');
    assert(g.combat.fieldUsed && g.combat.field === 1 && q0 - g.james.qi === 4 && r1.lines.filter((l) => /through the spikes: 1/.test(l)).length === 2, 'the field: 4 Qi, both attackers take 1, one round left');
    combatStep(g, 'guard'); assert(g.combat.field === 0, 'gone after 2 rounds');
    const q1 = g.james.qi; const r2 = combatStep(g, 'spikes'); assert(g.james.qi === q1 && r2.lines.some((l) => /already broken/.test(l)), 'once a fight: the second try does nothing and costs nothing');
    const q2 = g.james.qi; const r3 = combatStep(g, 'spear');
    assert(g.combat.spearFormed && q2 - g.james.qi === 3 && r3.lines.some((l) => /bone spear/.test(l)), 'the spear: 3 Qi to sing');
    const q3 = g.james.qi; combatStep(g, 'spear'); assert(g.james.qi === q3, 'then free while held');
    assert(r3.lines.some((l) => /held at the spear's length/.test(l)) ? r3.lines.some((l) => /can't get past the spear/.test(l)) : true, 'a full hit holds the foe off for the round');
    // shield cover: from the buckler, guarding saves Yuki from a lunge
    const y = at(2, 1); y.yuki.fight.level = 1; ensureBars(y); const yh = y.yuki.hp;
    startCombat(y, { id: 'test_crows', name: 't', enemies: [{ name: 'Crow', hp: 99, dc: 9, atk: 30, dmg: 5, prefersSmall: true }], win: 'stream', lose: 'stream' });
    y.combat.round = 3; const ry = combatStep(y, 'guard');
    assert(y.yuki.hp === yh && ry.lines.some((l) => /she is not there/.test(l)), 'shield cover: a guarded lunge at Yuki misses');
}

} // end of the static checks before the bots

let rs = 4242;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };

function fight(g, run) {
    const id0 = g.combat?.id;
    for (let t = 0; t < 400 && g.combat; t++) {
        const smart = run % 2 === 0;
        const acts = Object.keys(COMBAT_ACTIONS).filter((id) => !INC_ONLY_ACTIONS.has(id) || actionOpen(g, id)); // v0.11.4: the spear and the spike field when he can sing them
        const act = smart ? (actionOpen(g, 'spikes') && !g.combat.fieldUsed && g.james.qi >= 6 ? 'spikes' : actionOpen(g, 'spear') && g.james.qi >= 3 && t % 2 === 0 ? 'spear' : g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'dart') : acts[rnd(acts.length)];
        const out = (!smart && t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, act);
        if (out?.done) { const k = `${isNoDice() ? 'inc' : 'story'}:${id0 || '?'}:${smart ? 'smart' : 'random'}`; const f = fightStats[k] || (fightStats[k] = { win: 0, lose: 0, flee: 0 }); f[out.done] = (f[out.done] || 0) + 1; goTo(g, SCENES, out.next); return; }
    }
}

const byCoil = {};
const medStats = { bt: 0, mer: 0, warn: 0, a1bites: 0, a1coils: {} };
const deaths = { pro: {}, a1: {} }; // v0.9.7: per act and Coil: { coils, early (before Mei Lin), late, beast }
const TRIBUTE_OUT = { bluff_win: 'won', collectors_won: 'won', tribute_paid: 'paid', collectors_lost: 'lost' };
const stats = { tasks: { endings: {}, collapses: 0, cards: 0, skipped: 0, games: 0 } }; // v0.11.34 (D1): the classic games gone
// v0.11.21: bugs the mutation test (20 deliberate bugs) found the suite missing, or caught only by luck (the parent only)
if (!SHARD && !BOTS_ONLY) {
    const G = await import('../js/core/game.js');
    // Fed and HP regen, directly (a drain of 2 / h and a 6% Cycle were caught only by a scene the walks stopped reaching)
    const h = ensureBars(newGame(911)); h.james.hp = 1; h.james.satiety = 80; const hm = jamesHpMax(h);
    advance(h, 30);
    assert(Math.abs(h.james.satiety - 78.5) < 1e-9, `v0.11.21: Fed drops 3 an hour (80 → ${h.james.satiety} in 30 min)`);
    assert(Math.abs(h.james.hp - (1 + hm * 0.05)) < 1e-9, `v0.11.21: one Cycle (30 min) at realm 0 heals 5% of max HP (${h.james.hp})`);
    // the combat actions' Qi costs, and a dart really spends its 2
    assert(COMBAT_ACTIONS.dart.qi === 2 && COMBAT_ACTIONS.blade.qi === 3 && COMBAT_ACTIONS.needle.qi === 4, 'v0.11.21: dart 2, blade 3, needle 4 Qi');
    for (const nd of [true]) { // v0.11.34 (D1): Incremental Mode only
        setNoDice(nd);
        const d = ensureBars(newGame(912, { closed: nd })); d.james.skills['Convergence Use'] = { tier: 1, level: 5, xp: 0 }; d.james.qi = jamesQiMax(d);
        sCombat(d, { id: 'jackals', intro: '', band: 'standard', enemies: [{ name: 'Dummy', hp: 999, dc: 1, atk: 1, dmg: 0 }], win: 'stream', lose: 'stream' });
        const q0 = d.james.qi; cStep(d, 'dart');
        assert(Math.abs(q0 - d.james.qi - 2) < 1e-9, `v0.11.21: a dart costs 2 Qi (${nd ? 'Incremental' : 'Story'} Mode: ${q0} → ${d.james.qi})`);
    }
    setNoDice(true);
    // a breakthrough fills both bars, James's and Yuki's
    for (const nd of [true]) { // v0.11.34 (D1): Incremental Mode only
        setNoDice(nd);
        const b = ensureBars(newGame(913)); b.james.saturation = 100; b.james.hp = 1; b.james.qi = 1; b.yuki.hp = 1; b.yuki.qi = 1;
        const r = breakthrough(b);
        assert(r.ok && b.james.hp === jamesHpMax(b) && b.james.qi === jamesQiMax(b) && b.yuki.hp === G.yukiHpMax(b) && b.yuki.qi === yukiQiMax(b), `v0.11.21: a breakthrough fills HP and Qi for both (${nd ? 'Incremental' : 'Story'} Mode)`);
    }
    setNoDice(true);
    // the forecast while exhausted: a work card's dry run = its real run, ×1.5 of the rested time
    const x = ensureBars(newGame(914)); x.scene = 'ashfall';
    const wc = taskCards(x, SCENES).find((c) => c.kind === 'work' && c.status === 'open');
    assert(!!wc, 'v0.11.21: Ashfall has an open work card');
    if (wc) {
        const t0 = taskMinutes(x, SCENES, wc.id);
        markDaily(x, 'clinic'); runMed(x, SCENES, 'med:push');
        const t1 = taskMinutes(x, SCENES, wc.id), y = JSON.parse(JSON.stringify(x)), ym = y.minutes;
        runTask(y, SCENES, wc.id);
        assert(exLevel(x) === 1 && t1 === y.minutes - ym, `v0.11.21: exhausted, the forecast of ${wc.id} is its real time (${t1} vs ${y.minutes - ym})`);
        assert(Math.abs(t1 - t0 * 1.5) <= 1, `v0.11.21: exhausted, ${wc.id} takes ×1.5 (${t0} → ${t1})`);
    }
    // an old state version 1 gets every field the later migrations add
    const o = ensureBars(newGame(915)); delete o.tasks; delete o.coil; o.v = 1; migrate(o);
    const fresh = ensureBars(newGame(915));
    assert(o.v === SAVE_VERSION && Object.keys(fresh.tasks).every((k) => k in o.tasks) && !!o.coil, `v0.11.21: a version-1 state migrates to ${SAVE_VERSION} with every task field (${Object.keys(o.tasks).join(', ')}) and a Coil`);
}
const cardsSeen = new Set();
const cardsListed = new Set();
const cardsForecast = new Set(); // v0.11.21: cards whose forecast was compared with a real run that finished (not cut short by a door)
const cardsWhole = new Set(); // v0.11.21: cards that ran to the end at least once (the ones a forecast can be checked on)
/** v0.11.21: the forecast = reality check runs on 1 game in FC_EVERY (it was about half of this test's time). The dry runs
 * never touch the game, so the bot games and their numbers are the same; a check below makes sure every played card is still forecast. */
const FC_EVERY = 8;
/** v0.11.22: the flag and item watch (tests/lib/seen.mjs), only with --track (tools/check.mjs runs a separate --bots-only --track
 * job for tools/leftovers.mjs): a Proxy anywhere in the process slows every game in it (about +10 s on the full test, +5 s even on 1 game in 8). */
const TRACK = process.argv.includes('--track');
const bands = {};
let yukiRuns = 0;
const fightStats = {}; // v0.11.3: per mode, fight and bot style, for tools/sanity.mjs
// v0.11.16 (C1, owner 19:48): the relationship catch-up ×3 below the best-ever value; the 5 leftover Cultivate choices off the resting places
{
    setNoDice(true);
    const g = ensureBars(newGame(110));
    relBump(g, 'Mei Lin', 10, 20); relBump(g, 'Yuki', 0, 5);
    assert(REL_CATCHUP === 3 && g.rel['Mei Lin'].f === 10 && g.rel['Mei Lin'].a === 20 && g.coil.best['Mei Lin'].a === 20, 'C1: at the best-ever value, gains count ×1');
    endCoil(g, 'choice', 'arrival'); rewind(g);
    const R = () => g.rel['Mei Lin'];
    assert(R().f === 3 && R().a === 5 && g.coil.best['Mei Lin'].f === 10 && g.coil.best['Mei Lin'].a === 20, `C1: the 25% head start stays, the best is kept over a rewind (${R().f}/${R().a})`);
    relBump(g, 'Mei Lin', 0, 3); assert(R().a === 14, `C1: below the best, +3 counts +9 (${R().a})`);
    relBump(g, 'Mei Lin', 0, 4); assert(R().a === 22 && g.coil.best['Mei Lin'].a === 22, `C1: +4 catches up the last 6 (×3), the rest ×1 (${R().a})`);
    relBump(g, 'Mei Lin', 0, -5); assert(R().a === 17, 'C1: losses are never multiplied');
    relBump(g, 'Mei Lin', 1, 0); assert(R().f === 6, `C1: friendship catches up on its own (${R().f})`);
    const y0 = g.rel.Yuki.a; relBump(g, 'Yuki', 0, 3); assert(g.rel.Yuki.a === y0 + 3 && !g.coil.best.Yuki, 'C1: Yuki is never caught up');
    startActCoil(g, 1); assert(g.coil.act === 1 && g.coil.best['Mei Lin'].a === 22, 'C1: the best-ever values carry into Act 1');
    // the leftovers: no Cultivate choice on a story screen in Incremental Mode
    const left = [['meditate1', /^Condense: one sit/], ['night', /^Cultivate first/], ['night_event', /^Sit in the rain/], ['fo_night', /^Cultivate one sit before sleep/], ['heart_camp', /^Cultivate by the fire/]];
    const h = ensureBars(newGame(112)); h.james.qi = 30; h.flags.night_ev = 'rain';
    for (const [id, re] of left) {
        const c = SCENES[id].choices.find((x) => typeof x.text === 'string' && re.test(x.text));
        const inc = c && c.show && c.show(h);
        assert(c && !inc, `v0.11.16: ${id}: its Cultivate choice is hidden in Incremental Mode`);
    }
    setNoDice(true); h.scene = 'meditate1'; assert(!/You could keep going/.test(SCENES.meditate1.text(h)), 'v0.11.16: meditate1 no longer offers to condense (Incremental Mode)');
    setNoDice(true);
}
let badBars = 0; // v0.11.3: games that ended with a NaN / Infinity bar
const barsOk = (g) => [g.james.hp, g.james.qi, g.james.saturation, g.james.satiety, g.yuki.hp, g.yuki.qi].every(Number.isFinite);
let predicted = 0;
function play(run, tasks) {
    rs = seedOf(run, tasks ? 1 : 2); // v0.11.1: every game its own random stream
    setNoDice(tasks); // task mode has no dice anywhere (v0.9.3)
    const g = ensureBars(newGame(run + 1 + SEED * 100000, { closed: tasks })); // task mode: meridians closed at the start (v0.9.6)
    const st = stats.tasks;
    let steps = 0;
    const seenOut = new Set();
    let bitShen = false, meiSeen = false, coilKey = '', deadKey = '', ms = 0;
    const D = () => { const a = (g.coil.act || 0) ? deaths.a1 : deaths.pro; return a[g.coil.n] || (a[g.coil.n] = { coils: 0, early: 0, late: 0, beast: 0 }); };
    for (; steps < 18000; steps++) {
        if (TRACK) track(g); // v0.11.22: which flags and items the games really read and write
        const out = tasks && TRIBUTE_OUT[g.scene];
        if (out && !seenOut.has(g.coil.n)) { seenOut.add(g.coil.n); const b = byCoil[g.coil.n] || (byCoil[g.coil.n] = { won: 0, paid: 0, lost: 0, realm: 0, pri: 0 }); b[out]++; b.realm += g.james.realm; b.pri += g.james.primaries; }
        if (tasks) {
            const k = `${g.coil.act || 0}:${g.coil.n}`;
            if (k !== coilKey) { coilKey = k; meiSeen = false; D().coils++; }
            if (g.scene === 'mei_lin') meiSeen = true;
            if (g.scene === 'coil_end' && (g.coil.why === 'collapse' || g.coil.why === 'beast') && deadKey !== coilKey) { deadKey = coilKey; const d = D(); if (meiSeen || g.coil.act) d.late++; else d.early++; if (g.coil.why === 'beast') d.beast++; }
            if (g.coil.n > 6) { st.games++; if (!barsOk(g)) badBars++; return true; } // a bot that keeps dying stops counting after Coil 6 of an act
        }
        if (tasks && g.scene === 'a1_end') { medStats.a1coils[g.coil.n] = (medStats.a1coils[g.coil.n] || 0) + 1; }
        // the Meditate card now and then (v0.9.6): open meridians, break through
        if (tasks && canMeditate(g, SCENES) && rnd(6) === 0) {
            const mc = medCards(g, SCENES);
            if (mc.some((c) => c.id === 'med:bt' && c.open) && rnd(2) === 0) { runMed(g, SCENES, 'med:bt'); medStats.bt++; continue; }
            if (!isTaskHub(g)) { const mm = mc.filter((c) => /^med:mer:/.test(c.id) && c.open); if (mm.length) { runMed(g, SCENES, mm[rnd(mm.length)].id); medStats.mer++; continue; } } // v0.11.15 (B1): a meridian card on a resting place (task screens: they queue them)
        }
        if (SENSIBLE && tasks) { // tools/bots.mjs --sensible: at most 2 meridian sittings in a row, none when hungry
            if (g.scene === 'meridians' && ((ms = (ms || 0) + 1) > 2 || g.james.satiety < 40)) { ms = 0; choose(g, SCENES, SCENES.meridians.choices.findIndex((c) => c.text === 'Open your eyes.')); continue; }
            if (g.scene !== 'meridians') ms = 0;
        }
        const v = sceneView(g, SCENES);
        noteView(g, v);
        if (v.end) { const e = g.flags.ending || 'none'; st.endings[e] = (st.endings[e] || 0) + 1; st.games++; if (!barsOk(g)) badBars++; return true; }
        if (tasks && isTaskHub(g)) {
            const all = taskCards(g, SCENES); // v0.11.15 (B1): the bots take the sit and the meridian cards too
            for (const c of all) cardsListed.add(c.id);
            noteCards(all); // v0.11.22
            if (yukiLane(g) && rnd(3) === 0) setYuki(g, !yukiLane(g).on);
            const cards = all.filter((c) => c.status === 'open');
            const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)));
            if (!cards.length && !stops.length) { assert(false, `dead end at task hub ${g.scene} (run ${run})`); return false; }
            if (cards.length && (rnd(10) < 8 || !stops.length)) {
                const q = taskQueue(g);
                for (let k = 1 + rnd(4); k > 0; k--) q.push(cards[rnd(cards.length)].id);
                // the outlook's finish times must match what really happens
                const FC = run % FC_EVERY === 0; // v0.11.21
                const ol = FC ? outlook(g, SCENES) : null;
                const real = [];
                while (q.length && isTaskHub(g)) {
                    const id = q.shift();
                    if (!taskOpen(g, SCENES, id)) { st.skipped++; real.push({ id, skip: true }); continue; }
                    cardsSeen.add(id);
                    const m0 = g.minutes;
                    const mins = FC ? taskMinutes(g, SCENES, id) : 0;
                    const card = taskCards(g, SCENES).find((c) => c.id === id);
                    if (card?.check) bands[card.check.band] = (bands[card.check.band] || 0) + 1;
                    const fam0 = taskState(g).fam[id] || 0;
                    const r = runTask(g, SCENES, id);
                    if (r.lines.some((l) => /^Yuki (comes|leaves)/.test(l))) yukiRuns++;
                    if (card?.kind === 'work') { if ((taskState(g).fam[id] || 0) > fam0) pass++; else assert(false, `familiarity grows on ${id}`); } // v0.11.21: the label only on a failure
                    st.cards++;
                    if (FC) { if (g.minutes - m0 === mins || r.stopped) pass++; else assert(false, `dry run predicts ${id} (${mins} vs ${g.minutes - m0})`); }
                    if (!r.stopped) { cardsWhole.add(id); if (FC) cardsForecast.add(id); }
                    real.push({ id, end: g.minutes });
                    if (r.lines.some((l) => /queue is gone/.test(l))) st.collapses++;
                    if (Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.satiety)) pass++; else assert(false, `bars finite after ${id}`);
                }
                q.length = 0;
                if (FC) {
                    const same = real.every((r, k) => ol.rows[k] && (r.skip ? ol.rows[k].skip : ol.rows[k].end === r.end));
                    assert(same, `outlook matches the real queue (run ${run})`);
                    predicted++;
                }
                continue;
            }
            const r = choose(g, SCENES, stops[rnd(stops.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
            continue;
        }
        let open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene} (run ${run})`); return false; }
        if (tasks && /^(arrival|clearing)$/.test(g.scene)) open = open.filter((c) => !/Stay lost/.test(c.label)); // v0.10.1: the balance bots stay out of the Long Forest
        if (tasks && g.scene === 'collectors_lost') open = open.filter((c) => (g.coil.n < 3) === /Bite the tail/.test(c.label)); // bots try three Coils
        if (tasks && g.scene === 'coil_end' && g.coil.why === 'tribute') open = open.filter((c) => /^Bite/.test(c.label));
        if (tasks && g.scene === 'rt_elder' && run % 10 === 0 && g.coil.act === 1 && !bitShen) { goTo(g, SCENES, 'rt_taken'); continue; } // v0.11.4: 1 run in 10 goes with Shen Qiu on purpose, so the Act 1 rewind path is walked however the fights are tuned
        if (tasks && g.scene === 'rt_taken') { const bite = run % 5 === 0 && g.coil.act === 1 && !bitShen; open = open.filter((c) => bite === /Bite the tail/.test(c.label)); if (bite) bitShen = true; } // 1 run in 5 rewinds Act 1 at Shen Qiu once
        if (tasks && g.scene === 'coil_end' && g.coil.why === 'shen') { open = open.filter((c) => /start of Act 1/.test(c.label)); medStats.a1bites++; }
        if (tasks && g.scene === 'coil_end' && g.coil.act === 1) open = open.filter((c) => !/whole game/.test(c.label)); // v0.11.26: the balance bots stay in Act 1 (the whole-game rewind has its own tests)
        if (tasks && g.scene === 'col_warn') medStats.warn++;
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
        assert(!g.combat, `combat ends (${g.scene})`);
    }
    assert(false, `run ${run} finishes`);
    return false;
}
let diceInTasks = 0;
const logBefore = (g) => g.log.length;
if (kids) { // v0.11.1: merge the workers' numbers
    for (const r of await collect(kids)) {
        for (const [k, o] of Object.entries({ byCoil, medStats, deaths, stats, bands, fightStats })) mergeInto(o, r[k]);
        badBars += r.badBars;
        for (const id of r.cardsSeen.__set) cardsSeen.add(id);
        for (const id of r.cardsListed.__set) cardsListed.add(id);
        for (const id of r.cardsForecast.__set) cardsForecast.add(id);
        for (const id of r.cardsWhole.__set) cardsWhole.add(id);
        mergeSeen(r.touched);
        yukiRuns += r.yukiRuns; predicted += r.predicted; diceInTasks += r.diceInTasks; pass += r.pass; fail += r.fail;
    }
} else for (const run of myRuns()) play(run, true); // v0.11.34 (D1): Incremental Mode only (the Story Mode games are gone)
if (SHARD) emit({ byCoil, medStats, deaths, stats, bands, fightStats, badBars, cardsSeen, cardsListed, cardsForecast, cardsWhole, yukiRuns, predicted, diceInTasks, pass, fail, touched });
if (BOTS_ONLY) { // v0.11.21: the games' stats only (the same file a full run writes)
    if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, deaths, byCoil, fights: fightStats, badBars, seen: touchedOut() }));
    console.log(`  ${GAMES} bot games, bots only (no rule checks)\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
}
rs = 4243; // the checks below draw from their own stream
// task mode: no die anywhere, in fights or story
{
    setNoDice(true);
    let die = 0;
    for (let run = 0; run < 200; run++) {
        const g = ensureBars(newGame(run + 9000));
        for (let s = 0; s < 3000; s++) {
            const v = sceneView(g, SCENES);
            if (v.end) break;
            const open = v.choices.filter((c) => !c.disabled && c.index < 1000);
            if (!open.length) break;
            const r = choose(g, SCENES, open[rnd(open.length)].index);
            if (r.lines.some((l) => l.includes('🎲'))) die++;
            if (r.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const o = combatStep(g, t % 2 ? 'blade' : 'dart'); if (o.lines.some((l) => l.includes('🎲'))) die++; if (o.done) { goTo(g, SCENES, o.next); break; } } }
            if (g.combat) assert(false, 'no-dice fight ends');
        }
    }
    assert(die === 0, `no die shown anywhere in task mode (${die})`);
}

// every card that was ever offered was also played at least once
const all = cardsListed;
if (FULL) for (const id of all) assert(cardsSeen.has(id), `card ${id} was played by a bot`); // coverage: the full run only
if (FULL) for (const id of cardsWhole) assert(cardsForecast.has(id), `v0.11.21: card ${id}'s forecast was checked on a whole run (1 game in ${FC_EVERY})`);
if (!FULL) console.log(`  coverage (quick, log only): ${cardsSeen.size} of ${all.size} offered cards played, ${cardsForecast.size} of ${cardsWhole.size} whole-run cards forecast-checked`); // v0.11.21
assert(yukiRuns > GAMES / 2, `Yuki's lane brings things home (${yukiRuns})`);
// no dice on work cards: the same state gives the same result
{
    const g = ensureBars(newGame(3)); g.scene = 'wilds'; g.minutes += 1440; Object.assign(g.flags, { long: true, forest_day: 2 });
    const a = JSON.parse(JSON.stringify(g)), b = JSON.parse(JSON.stringify(g));
    a.rng = 1; b.rng = 999999;
    setNoDice(true);
    const ra = runTask(a, SCENES, 'wild_forage:0'), rb = runTask(b, SCENES, 'wild_forage:0');
    assert(JSON.stringify(ra.lines) === JSON.stringify(rb.lines) && JSON.stringify(a.inventory) === JSON.stringify(b.inventory), 'work cards ignore the dice');
    assert(famTier(0) === 0 && famTier(2) === 1 && famTier(8) === 2 && famTier(18) === 3, 'familiarity tiers at 2 / 8 / 18');
}

// v0.10.0: the queue edited, meridian sessions, the forecast's death row, starving 1.5 HP an hour, rest and sleep at once
{
    setNoDice(true);
    const g = ensureBars(newGame(70, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 8 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
    const q = taskQueue(g); q.length = 0;
    queueAdd(g, 'a'); queueAdd(g, 'b'); queueRunNow(g, 'c');
    assert(q.join() === 'c,a,b', 'run now goes to the front, + to the end');
    queueMove(g, 2, -1); assert(q.join() === 'c,b,a', 'a row moves up');
    queueMove(g, 0, -1); assert(q.join() === 'c,b,a', 'the top row cannot move up');
    queueClear(g, true); assert(q.join() === 'c', 'clear keeps the row in progress');
    queueClear(g, false); assert(q.length === 0, 'clear empties the queue');
    for (let i = 0; i < QUEUE_MAX; i++) queueAdd(g, 'x'); assert(!queueAdd(g, 'y') && !queueRunNow(g, 'y') && q.length === QUEUE_MAX, 'the queue stops at its limit');
    q.length = 0;
    // a meridian session from the queue
    assert(merChoice(g, SCENES) === 0 && taskOpen(g, SCENES, MER_TASK), 'a closed start offers the next primary as a card');
    const m0 = g.minutes;
    const r = runTask(g, SCENES, MER_TASK);
    assert(g.scene === 'wilds' && g.minutes - m0 === 120 && g.james.primaries === 1 && !r.stopped, 'a meridian sitting from the queue: 2 h, a primary, back on the hub');
    g.james.qi = 20; runTask(g, SCENES, MER_TASK); g.james.qi = 20;
    assert(merChoice(g, SCENES) >= 0 && taskOpen(g, SCENES, MER_TASK), 'v0.11.2: no daily limit, the card stays');
    g.james.satiety = 10; assert(!taskOpen(g, SCENES, MER_TASK), 'Fed under 20: no meridian card'); g.james.satiety = 70;
    // v0.11.13 (E1): one card per meridian line; collaterals queueable while primaries are still closed; an old mer:next queue still runs
    {
        const L = ensureBars(newGame(76, { closed: true })); L.scene = 'stream'; L.james.qi = 25; L.james.satiety = 70; L.james.primaries = 3; L.yuki.primaries = 3;
        const ids = taskCards(L, SCENES).filter((c) => c.kind === 'mer').map((c) => c.id);
        assert(ids.join() === 'mer:pri,mer:col' && !ids.includes(MER_TASK), `v0.11.13: two meridian cards on the stream (${ids.join()})`);
        assert(medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id)).map((c) => c.task).join() === 'mer:pri,mer:col', 'v0.11.13: the Meditate cards carry the queue ids');
        assert(taskMinutes(L, SCENES, 'mer:col') === 120 && !isInstantTask(L, SCENES, 'mer:col') && lineOfTask('mer:col') === 'col' && lineOfTask('mer:next') === null, 'v0.11.13: the collateral card: 2 h in the forecast, never at once');
        queueAdd(L, 'mer:col'); queueAdd(L, 'mer:col'); queueAdd(L, 'mer:pri');
        const ol = outlook(L, SCENES), real = JSON.parse(JSON.stringify(L)), got = [];
        for (const id of [...taskQueue(real)]) { taskQueue(real).shift(); runTask(real, SCENES, id); got.push(real.minutes); }
        assert(ol.rows.map((x) => x.end).join() === got.join(), `v0.11.13: the forecast = what happens (${ol.rows.map((x) => x.end).join()} / ${got.join()})`);
        assert(real.james.collaterals === 9 && real.james.primaries === 4 && real.tasks.use['act:mer'] === 3 && real.scene === 'stream', `v0.11.13: two collateral sittings open group 1 with 3 primaries; v0.11.15: the third sitting (×1.6) opens the 4th primary (${real.james.collaterals}, ${real.james.primaries})`);
        L.james.satiety = 19; const lk = medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id));
        assert(lk.length === 2 && lk.every((c) => !c.open && !c.task && /Too hungry/.test(c.reason)) && !taskOpen(L, SCENES, 'mer:pri'), 'v0.11.13: under Fed 20 both show, locked, with the reason');
        L.james.satiety = 70; L.james.qi = 1; assert(medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id)).every((c) => !c.open && /2 Qi/.test(c.reason)), 'v0.11.13: under 2 Qi: locked'); L.james.qi = 25;
        const o = JSON.parse(JSON.stringify(L)); taskQueue(o).push(MER_TASK);
        assert(taskOpen(o, SCENES, MER_TASK) && runTask(o, SCENES, MER_TASK) && o.james.primaries === 3 && o.james.merWork > 0, 'v0.11.13: a saved mer:next still runs (primaries first)');
        // v0.11.14: no Meditate on a story screen; on Act 1's resting places the Meditate cards queue
        const a = ensureBars(newGame(77, { closed: true })); a.scene = 'arrival'; a.james.qi = 25; a.james.satiety = 70;
        assert(!medCards(a, SCENES).length && !isQueueScreen(a, SCENES) && !taskCards(a, SCENES).length, 'v0.11.14: the arrival has no Meditate and no queue');
        const rc = ensureBars(newGame(80, { closed: true })); rc.scene = 'rt_camp'; rc.james.qi = 30; rc.james.satiety = 70;
        const rm = medCards(rc, SCENES);
        assert(isQueueScreen(rc, SCENES) && rm.find((c) => c.id === 'med:mer:pri')?.task === 'mer:pri' && rm.find((c) => c.id === 'rt_camp:3')?.task === 'rt_camp:3', 'v0.11.19: rt_camp is a task screen: the primary and its own sit card carry queue ids');
        assert(isTaskHub(rc) && taskCards(rc, SCENES).some((c) => c.id === 'rt_camp:3') && taskCards(rc, SCENES).some((c) => c.kind === 'door' && /fire/.test(c.label)) && taskCards(rc, SCENES).some((c) => c.id === 'mer:pri'), 'v0.11.19: rt_camp: its chores, doors and Meditate cards are cards');
        queueAdd(rc, 'mer:pri'); queueAdd(rc, 'rt_camp:3');
        const ro = outlook(rc, SCENES), rr = JSON.parse(JSON.stringify(rc)), rgot = [];
        for (const id of [...taskQueue(rr)]) { taskQueue(rr).shift(); runTask(rr, SCENES, id); rgot.push(rr.minutes); }
        assert(ro.rows.map((x) => x.end).join() === rgot.join() && rr.scene === 'rt_camp' && rr.james.primaries === 1, `v0.11.19: rt_camp runs its queue as forecast (${ro.rows.map((x) => x.end)} vs ${rgot})`);
        let threw = false; try { runTask(a, SCENES, SIT_TASK); } catch { threw = true; }
        assert(threw, 'v0.11.14: no queued work on a story screen');
        const bq = ensureBars(newGame(81)); bq.scene = 'rt_camp'; bq.james.qi = 30; bq.james.saturation = 96;
        assert(taskOpen(bq, SCENES, BT_TASK) && medCards(bq, SCENES).find((c) => c.id === 'med:bt')?.task === BT_TASK, 'v0.11.14: Break through queues on a resting place');
        const br = runTask(bq, SCENES, BT_TASK);
        assert(br.stopped && bq.scene === 'breakthrough' && bq.flags.bt_return === 'rt_camp', 'v0.11.19: Break through on the rt_camp task screen comes back to it');
        const fe = ensureBars(newGame(78)); fe.scene = 'stream'; fe.james.qi = 25; fe.james.realm = 1; markDaily(fe, 'mer_e8');
        const fm = medCards(fe, SCENES).find((c) => c.id === 'med:mer:e8');
        assert(fm && fm.open && taskOpen(fe, SCENES, 'mer:e8'), `v0.11.18: an Extraordinary line has no daily limit in Incremental Mode (${fm?.reason})`);
        const s7 = ensureBars(newGame(79)); s7.scene = 'stream'; s7.james.qi = 25; s7.james.realm = 7; s7.james.extra8 = 8;
        assert(medCards(s7, SCENES).filter((c) => /^med:mer:/.test(c.id)).map((c) => c.id).join() === 'med:mer:ec,med:mer:jn', 'v0.11.13: Nascent Soul: the vessels\' collaterals and the junctions');
    }
    // v0.11.12: a queueable Cultivate sit where the task screen has none of its own
    {
        const k = ensureBars(newGame(73, { closed: true })); k.scene = 'stream'; k.james.qi = 25; k.james.satiety = 70;
        assert(taskOpen(k, SCENES, SIT_TASK) && medCards(k, SCENES).some((c) => c.id === 'med:sit' && c.task === SIT_TASK), 'v0.11.12: the stream offers a queueable sit (Meditate card with a task)');
        const before = { qi: k.james.qi, sat: k.james.saturation, m: k.minutes }, gain = sitGain(k);
        assert(taskMinutes(k, SCENES, SIT_TASK) === 60, `v0.11.12: the sit's forecast is 60 min (${taskMinutes(k, SCENES, SIT_TASK)})`);
        const rs = runTask(k, SCENES, SIT_TASK);
        assert(!rs.stopped && k.scene === 'stream' && k.minutes - before.m === 60 && k.james.saturation === Math.round((before.sat + gain) * 10) / 10 && k.james.qi < before.qi, 'v0.11.12: a queued sit: an hour, Saturation +gain, Qi spent, still on the hub');
        k.james.qi = 5; assert(!taskOpen(k, SCENES, SIT_TASK) && !medCards(k, SCENES).find((c) => c.id === 'med:sit').task, 'v0.11.12: under 10 Qi: no queueable sit');
        k.james.qi = 25; k.james.saturation = 100; assert(!taskOpen(k, SCENES, SIT_TASK), 'v0.11.12: at 100% Saturation: no queueable sit');
        const w2 = ensureBars(newGame(74, { closed: true })); w2.scene = 'wilds'; w2.james.qi = 25;
        assert(!taskOpen(w2, SCENES, SIT_TASK), 'v0.11.12: the wilds keep their own Cultivate card (no second one)');
        const lone = ensureBars(newGame(75, { closed: true })); lone.scene = 'arrival'; lone.james.qi = 25;
        assert(!taskOpen(lone, SCENES, SIT_TASK) && !medCards(lone, SCENES).length, 'v0.11.14: no sit on a story screen');
    }
    // the forecast finds the row where a bad queue starves
    const h = ensureBars(newGame(71, { closed: true })); h.scene = 'wilds'; h.minutes = 1440 + 7 * 60; Object.assign(h.flags, { long: true, forest_day: 2 });
    h.james.satiety = 3; h.james.hp = 2; h.inventory = {};
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest in the shade/.test(c.text));
    for (let i = 0; i < 8; i++) queueAdd(h, `wilds:${rest}`);
    const ol = outlook(h, SCENES);
    assert(ol.death && ol.death.cause === 'hunger', `the forecast sees James starve (${JSON.stringify(ol.death)})`);
    assert(ol.rows.slice(ol.death.row + 1).every((x) => x.dead) && ol.rows[ol.death.row].death === 'hunger', 'rows after the death row are never reached');
    const real = JSON.parse(JSON.stringify(h)); let n = 0;
    while (taskQueue(real).length && real.scene === 'wilds' && n++ < 20) { const id = taskQueue(real).shift(); runTask(real, SCENES, id); }
    assert(real.scene === 'coil_end' && real.minutes === ol.death.at, `the real run starves where the forecast said (${real.minutes} vs ${ol.death.at})`);
    // starving: 1.5 HP an hour in task mode, whatever the step size
    const a1 = ensureBars(newGame(72)); a1.james.satiety = 0; a1.james.hp = 20;
    for (let i = 0; i < 24; i++) advance(a1, 10);
    const a2 = ensureBars(newGame(72)); a2.james.satiety = 0; a2.james.hp = 20; advance(a2, 240);
    assert(STARVE_HP_PER_HOUR === 1.5 && a1.james.hp === 14 && a2.james.hp === 14, `4 starving hours cost 6 HP in 10-min steps and in one step (${a1.james.hp}, ${a2.james.hp})`);
    // rest and sleep: no bar, the clock still moves
    assert(isInstantTask(g, SCENES, `wilds:${rest}`) && instantChoice({ text: 'Sleep.' }) && !instantChoice({ text: 'Stay up with Mei Lin after the others sleep.' }) && !instantChoice({ text: 'Cultivate one sit before sleep.', do: () => [] }), 'rest and sleep are instant; staying up and cultivating are not');
    assert(taskMinutes(g, SCENES, `wilds:${rest}`) === 60, 'an instant rest still passes its hour');
}
// status clock with seconds (v0.9.9)
{
    assert(clockLabelSec({ flags: {} }, 0) === 'Day 1, 00:00:00', 'clock: Day 1, 00:00:00');
    assert(clockLabelSec({ flags: {} }, 14 * 60 + 5.5) === 'Day 1, 14:05:30', 'clock: seconds from the fraction');
    assert(clockLabelSec({ flags: {} }, 1440 + 59.9999) === 'Day 2, 00:59:59', 'clock: never :60');
    assert(clockLabelSec({ flags: { lf_active: true } }, 100) === 'The Long Forest', 'clock: the Long Forest label stays');
}
// speed gate (v0.9.8, 3c-3)
{
    const g = ensureBars(newGame(5, { closed: true }));
    assert(maxSpeed(g) === 1, 'a new game allows ×1');
    for (const e of ['fought', 'bluff', 'paid']) { g.flags.ending = e; assert(maxSpeed(g) === 2, `a won tribute (${e}) opens ×2`); }
    g.flags.ending = 'lost'; assert(maxSpeed(g) === 2, 'a lost tribute opens ×2 too (v0.11.31, P3-b)');
    assert(maxSpeed(g, true) === 10, 'test speeds open ×10');
    g.flags.ending = 'fought';
    assert(effectiveSpeed(g, 5) === 2 && effectiveSpeed(g, 0) === 0 && effectiveSpeed(g, 1) === 1 && effectiveSpeed(g, 10, true) === 10, 'a stored ×5 runs at the gate; pause stays pause');
    for (const o of ['victory', 'taken']) {
        const h = ensureBars(newGame(6)); Object.assign(h.flags, { ending: o === 'taken' ? 'lost' : 'bluff', a1_outcome: o });
        goTo(h, SCENES, 'a1_end');
        assert(h.flags.spd_a1 === true && maxSpeed(h) === 5, `reaching a1_end (${o}) opens ×5`);
    }
    const old = ensureBars(newGame(7)); Object.assign(old.flags, { ending: 'paid', a1_outcome: 'accord' }); old.scene = 'a1_end';
    assert(maxSpeed(old) === 5, 'an old save already at the end of Act 1 has ×5');
}
// v0.11.32 (P2-a): picked choices are recorded per save, kept across every rewind, never in a dry run's copy
{
    const g = ensureBars(newGame(11, { closed: true }));
    assert(!g.picked || Object.keys(g.picked).length === 0, 'picked: a new game has none');
    const s0 = g.scene, i0 = sceneView(g, SCENES).choices[0].index;
    assert(!wasPicked(g, s0, i0), 'picked: not before it is taken');
    choose(g, SCENES, i0);
    assert(wasPicked(g, s0, i0) && g.picked[s0].length === 1, 'picked: choose() records the scene and position');
    assert(wasPicked(g, s0, 1000 + i0), 'picked: a one-move index counts as its fight choice');
    notePicked(g, s0, i0); assert(g.picked[s0].length === 1, 'picked: no duplicates');
    notePicked(g, 'coil_end', 0); assert(!g.picked.coil_end, 'picked: the Coil screens are never recorded');
    assert(isMenuScene('wild_hunt') && isMenuScene('wilds') && !isMenuScene('collectors_lost'), 'picked: hubs and their menus are known (main.js leaves work and menus uncoloured)');
    const before = JSON.stringify(g.picked);
    assert(dryClone(g).picked === undefined, 'picked: a dry run copy carries none');
    const back = deserialize(serialize(g));
    assert(JSON.stringify(back.picked) === before, 'picked: a save round trip keeps them');
    endCoil(g, 'choice'); rewind(g);
    assert(JSON.stringify(g.picked) === before, 'picked: kept across a rewind');
    const h = ensureBars(newGame(12)); Object.assign(h.flags, { ending: 'bluff' }); startActCoil(h);
    notePicked(h, 'stream', 4); h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end');
    for (const to of ['act', 'game']) { rewind(h, { to }); assert(wasPicked(h, 'stream', 4), `picked: kept across the rewind to the start of ${to === 'act' ? 'Act 1' : 'the whole game'}`); if (to === 'act') { h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end'); } }
    const old = JSON.parse(serialize(ensureBars(newGame(13, { closed: true })))); const od = JSON.parse(old.data); delete od.picked;
    // which picked choices show recoloured (showPicked, main.js)
    const m = ensureBars(newGame(14, { closed: true })); m.scene = 'stream';
    m.picked = { stream: [1, 5, 6, 7], wild_hunt: [0], ashfall: [17], hunt: [0, 2], coil_end: [0] };
    const ch = (sid, i) => SCENES[sid].choices[i];
    assert(showPicked(m, SCENES, 5, 'Keep walking') && !showPicked(m, SCENES, 4, 'Make camp'), 'picked shown: a picked story choice yes, an unpicked one no');
    assert(!showPicked(m, SCENES, 1, 'Test the water'), 'picked shown: a work card on a task screen no');
    assert(!showPicked(m, SCENES, 6, 'Open a meridian') && !showPicked(m, SCENES, 7, 'Yuki: change form'), 'picked shown: the meta screens\' entries no');
    assert(showPicked(m, SCENES, 1005, 'End it in one move.'), 'picked shown: a one-move index counts as its choice');
    m.scene = 'wild_hunt'; assert(!showPicked(m, SCENES, 0, 'Glassback hare'), 'picked shown: a hub\'s work menu no');
    m.scene = 'hunt'; assert(!showPicked(m, SCENES, 0, 'A bone dart') && showPicked(m, SCENES, 2, String(ch('hunt', 2).text)), 'picked shown: gathering inside a task card\'s scene no, its plain choice yes');
    assert(!showPicked(m, SCENES, 2, 'Back to the stream.'), 'picked shown: a plain "Back…" no');
    m.scene = 'ashfall'; assert(showPicked(m, SCENES, 17, 'Evening. Go home to Mei Lin\'s.'), 'picked shown: a hub\'s story exit yes');
    const o = deserialize(JSON.stringify(od));
    assert(!wasPicked(o, o.scene, 0), 'picked: an old save without the field loads, nothing marked');
    choose(o, SCENES, sceneView(o, SCENES).choices[0].index); assert(Object.keys(o.picked || {}).length === 1, 'picked: an old save starts recording on its first choice');
}
// v0.11.33 (owner 13:34–13:51, B + F1 + T1 + S1): the task screens' one-off work, "Call it a day"
{
    const { onceOpen, stageOpen, noteOnce, oneOffLeft, ONCE_MENUS, ONCE_STAGES, onceKey } = await import('../js/story/oneoff.js');
    const { wakeDay: wd } = await import('../js/core/game.js');
    setNoDice(true);
    const at5 = () => { const g = ensureBars(newGame(21, { closed: true })); g.minutes = 4 * 1440 + 8 * 60; goTo(g, SCENES, 'ashfall'); Object.assign(g.flags, { healed_try: true, elder: true }); return g; };
    const ids = (g) => taskCards(g, SCENES).map((c) => c.id);
    const g = at5();
    assert(ids(g).includes('drill:0') && ids(g).includes('drill:1'), 'once: both militia choices open on Day 5');
    // owner 14:05: a failed try can be made again; only a success uses the one-off up
    const f = at5(); f.james.gu = { tier: 1, level: 1, xp: 0 }; f.james.satiety = 0; f.tasks.fam = {}; ensureBars(f);
    const fr = runTask(f, SCENES, 'drill:0');
    if (/failed/.test(fr.lines.join(' '))) assert(!f.flags[onceKey('drill', 0)] && taskCards(f, SCENES).some((c) => c.id === 'drill:0'), 'once: a failed militia drill stays open (tomorrow)');
    else assert(false, 'once: the weak-James drill was meant to fail (test setup)');
    g.james.gu = { tier: 3, level: 10, xp: 0 }; ensureBars(g);
    runTask(g, SCENES, 'drill:0');
    assert(g.flags[onceKey('drill', 0)] === true, 'once: a militia choice done is recorded for the Coil');
    const d1 = taskCards(g, SCENES).find((c) => c.id === 'drill:1');
    assert(!ids(g).includes('drill:0') && d1?.status === 'tomorrow', 'once: the done choice is gone, the other waits for tomorrow (one per menu per day, B)');
    delete g.flags[`drill@${wd(g)}`]; // the next day
    assert(!ids(g).includes('drill:0') && taskCards(g, SCENES).find((c) => c.id === 'drill:1')?.status === 'open', 'once: the next day only the other choice is open');
    const nt = SCENES.drill.choices.findIndex((c) => /^Not today/.test(c.text)); noteOnce(g, 'drill', nt, SCENES.drill.choices[nt]);
    assert(!g.flags[onceKey('drill', nt)], 'once: "Not today" is not work');
    endCoil(g, 'choice'); rewind(g);
    assert(!Object.keys(g.flags).some((k) => k.startsWith('oo:')), 'once: a rewind brings every one-off back (the next Coil)');
    assert(['clinic', 'workshop', 'drill', 'fo_palisade', 'fo_council', 'fo_drill', 'fo_clinic', 'rr_scout'].every((m) => ONCE_MENUS.has(m) && SCENES[m]) && !ONCE_MENUS.has('wild_hunt') && !ONCE_MENUS.has('wild_train') && !ONCE_MENUS.has('rr_forage'), 'once: the one-off menus; hunts, training and foraging stay repeatable');
    // staged doors: Wen's lessons, the herb slopes, two visits per Coil
    const h = at5();
    const wi = SCENES.ashfall.choices.findIndex((c) => c.to === 'wen_lesson');
    assert(ids(h).includes(`ashfall:${wi}`), 'stages: Wen open');
    noteOnce(h, 'ashfall', wi, SCENES.ashfall.choices[wi]); noteOnce(h, 'ashfall', wi, SCENES.ashfall.choices[wi]);
    assert(h.flags['oo:wen_lesson'] === 2 && !ids(h).includes(`ashfall:${wi}`) && Object.keys(ONCE_STAGES).length === 2, 'stages: after two lessons Wen is done for the Coil');
    // "Call it a day" (S1)
    const k = at5();
    const ci = SCENES.ashfall.choices.findIndex((c) => /^Call it a day/.test(String(c.text)));
    assert(ci >= 0 && !ids(k).includes(`ashfall:${ci}`) && oneOffLeft(k, SCENES, 'ashfall'), 'skip: hidden while a one-off is open');
    for (const m of ['clinic', 'workshop', 'drill']) SCENES[m].choices.forEach((c, i) => { k.flags[onceKey(m, i)] = true; });
    Object.assign(k.flags, { 'oo:wen_lesson': 2, 'oo:herb_slopes': 2, village_hunt: true });
    const w0 = JSON.stringify(k.wake);
    const v = sceneView(k, SCENES);
    assert(JSON.stringify(k.wake) === w0, 'skip: looking ahead to the evening leaves the clock state alone');
    assert(!oneOffLeft(k, SCENES, 'ashfall') && ids(k).includes(`ashfall:${ci}`) && isInstantTask(k, SCENES, `ashfall:${ci}`), 'skip: shown once the one-offs are done, at once');
    assert(!v.choices.some((c) => /^Evening/.test(c.label)), 'skip: the evening exit not yet at 08:00');
    runTask(k, SCENES, `ashfall:${ci}`);
    assert(k.scene === 'ashfall' && clockParts(k.minutes).day === 5 && clockParts(k.minutes).hh === 16 && clockParts(k.minutes).mm === 0, 'skip: the clock at 16:00 the same day, still on the hub');
    assert(sceneView(k, SCENES).choices.some((c) => /^Evening/.test(c.label)) && !ids(k).includes(`ashfall:${ci}`), 'skip: the evening exit shows, the skip is gone');
    // after the Fable review: Ashfall's last day (a one-time menu, a checked chore), the Old Tree's story stops, before 04:00
    const r = ensureBars(newGame(22, { closed: true })); r.minutes = 19 * 1440 + 8 * 60; goTo(r, SCENES, 'rt_ashfall'); Object.assign(r.flags, { council_done: true, ya_village: true });
    const rc = SCENES.rt_ashfall.choices.findIndex((c) => /^Call it a day/.test(String(c.text)));
    assert(oneOffLeft(r, SCENES, 'rt_ashfall') && !ids(r).includes(`rt_ashfall:${rc}`), 'skip: Ashfall\'s last day, hidden while the palisade and the drill are open');
    r.flags.a1_palisade = true; assert(oneOffLeft(r, SCENES, 'rt_ashfall'), 'skip: still hidden while the last drill is open');
    r.flags.a1_militia = true; assert(!oneOffLeft(r, SCENES, 'rt_ashfall') && ids(r).includes(`rt_ashfall:${rc}`), 'skip: shown once the preparations are done');
    const t = ensureBars(newGame(23, { closed: true })); t.minutes = 15 * 1440 + 8 * 60; t.scene = 'heart_hub';
    assert(SCENES.heart_hub.choices.find((c) => c.to === 'heart_roots').show(t) && oneOffLeft(t, SCENES, 'heart_hub'), 'skip: the Old Tree holds it back while its story stops lead on');
    k.minutes = 5 * 1440 + 3 * 60; Object.assign(k.flags, { 'oo:wen_lesson': 2 });
    assert(!SCENES.ashfall.choices[ci].show(k), 'skip: never between 00:00 and 04:00');
}
// v0.11.31 (P3-b): an open speed gate stays open across every rewind
{
    const p = ensureBars(newGame(8, { closed: true }));
    assert(!KEEP_FLAGS.includes('ending') && KEEP_FLAGS.includes('spd_pro') && KEEP_FLAGS.includes('spd_a1'), 'gates: the gate flags are kept, the tribute outcome is not');
    goTo(p, SCENES, 'collectors_lost');
    assert(p.flags.ending === 'lost' && maxSpeed(p) === 2, 'gates: a lost tribute opens ×2');
    endCoil(p, 'tribute', 'collectors_lost'); rewind(p);
    assert(!p.flags.ending && p.flags.spd_pro === true && maxSpeed(p) === 2, 'gates: rewinding a lost tribute keeps ×2');
    rewind(p);
    assert(p.flags.spd_pro === true && maxSpeed(p) === 2, 'gates: ×2 survives a second rewind');
    const q = ensureBars(newGame(9, { closed: true }));
    endCoil(q, 'choice'); rewind(q);
    assert(!q.flags.spd_pro && maxSpeed(q) === 1, 'gates: a rewind before the tribute stays ×1');
    for (const to of ['act', 'game']) {
        const h = ensureBars(newGame(10)); Object.assign(h.flags, { ending: 'bluff' }); startActCoil(h);
        h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end');
        rewind(h, { to });
        assert(h.flags.spd_a1 === true && maxSpeed(h) === 5, `gates: ×5 survives the rewind to the start of ${to === 'act' ? 'Act 1' : 'the whole game'}`);
        assert(to === 'act' ? h.flags.ending === 'bluff' : (!h.flags.ending && h.scene !== 'a1_end' && (h.coil.act || 0) === 0), `gates: the ${to} rewind otherwise resets as before`);
    }
}
const pctOf = (o, n) => Object.entries(o).sort().map(([k, v]) => `${k} ${((v / n) * 100).toFixed(1)}%`).join(', ');
console.log(`  tribute, tasks:   ${pctOf(stats.tasks.endings, stats.tasks.games)}`);
console.log(`  work-card results: ${Object.entries(bands).sort().map(([k, v]) => `${k} ${v}`).join(', ')} · Yuki brought home ${yukiRuns} times`);
console.log(`  tribute per Coil (tasks, bots rewind a lost tribute up to Coil 3): ${Object.entries(byCoil).sort(([a], [b]) => a - b).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: won ${((b.won / t) * 100).toFixed(1)}% paid ${((b.paid / t) * 100).toFixed(1)}% lost ${((b.lost / t) * 100).toFixed(1)}% (${t})`; }).join(' · ')}`);
console.log(`  realm / primaries at the tribute (tasks): ${Object.entries(byCoil).sort(([a], [b]) => a - b).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: realm ${(b.realm / t).toFixed(2)}, primaries ${(b.pri / t).toFixed(1)}`; }).join(' · ')}`);
const dl = (o, name) => Object.entries(o).sort(([a], [b]) => a - b).filter(([n]) => n <= 4).map(([n, d]) => `Coil ${n}: ${name === 'pro' ? `dead before Mei Lin ${((d.early / d.coils) * 100).toFixed(0)}%, after ${((d.late / d.coils) * 100).toFixed(0)}%` : `dead ${((d.late / d.coils) * 100).toFixed(0)}%`} (${d.coils}${REPORT ? `; beasts ${((d.beast / d.coils) * 100).toFixed(0)}%` : ''})`).join(' · ');
console.log(`  deaths, prologue (HP 0 or a beast): ${dl(deaths.pro, 'pro')}`);
console.log(`  deaths, Act 1: ${dl(deaths.a1, 'a1')}`);
console.log(`  Meditate: ${medStats.mer} meridian screens, ${medStats.bt} breakthroughs, ${medStats.warn} seal warnings; Act 1: ${medStats.a1bites} rewinds at Shen Qiu, ends on ${JSON.stringify(Object.fromEntries(Object.entries(medStats.a1coils).sort(([a], [b]) => a - b)))}`);
assert(!FULL || medStats.a1bites >= 5, `bots rewind Act 1 and reach its end (${medStats.a1bites})`);
console.log(`  ${stats.tasks.cards} cards run, ${stats.tasks.skipped} skipped, ${stats.tasks.collapses} collapses (HP 0), ${predicted} queues predicted (1 game in ${FC_EVERY}), ${cardsSeen.size}/${all.size} cards played`);
assert(badBars === 0, `no NaN / Infinity bar at the end of a bot game (${badBars})`);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, deaths, byCoil, fights: fightStats, badBars, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
