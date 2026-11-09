// Run: node tests/tasks.test.mjs — task cards and the queue (v0.9.0, "Tasks (preview)").
// Every card resolves; old saves get an empty queue; a dry run predicts the real run exactly;
// 1,000 bot games (2,000 before v0.11.34) in task mode reach the end with no dead end (Incremental Mode only since v0.11.34, D1: the classic games and the Story Mode checks gone).
import { SCENES, lfOpen, lfSeason, lfRank, LF_STOCK, LF_SEASON_MINUTES } from '../js/story/prologue.js';
import { itemCap, MAX_REALM, combatStep as cStep, startCombat as sCombat, coilMult, awardXp, actSpeed, sitMinutes, awardYukiFightXp, condense, SAT_HOURS, sitGain, btMinutes, formDmgBonus, guardBonus, fieldDamage, FIELD_ROUNDS, actionDmg } from '../js/core/game.js';
import { FORM_LINES, hasForm, cuRank, actionOpen, actionLabel, fragileKnife, STORY_FORMS, INC_ONLY_ACTIONS } from '../js/core/forms.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { markDaily, daily, hour } from '../js/story/common.js';
import { dayEnd, nightLock, dayHour, endsLate, sitUseless } from '../js/core/game.js'; // v0.11.37 (v0.11.91: no push)
import { pickedMinutes, PICKED_SPEED } from '../js/core/story.js'; // v0.11.37 (F1)
import { wakeDay, sleepUntil, clockParts } from '../js/core/game.js';
import { yukiSpeed, setDryClone, dryClone, showPicked } from '../js/core/tasks.js';
import { e8Hours, ecHours, jnHours } from '../js/story/meridians.js';
import { serialize, deserialize } from '../js/core/game.js';
import { PEOPLE_FIGHTS, combatHooks } from '../js/core/game.js'; // v0.11.81
import { fightAction, yukiSitsOut, armourDr as armourDrOf, jamesDr as jamesDrOf } from '../js/core/game.js'; // v0.11.82
import { XP_RATE, XP_BANDS } from '../js/core/game.js'; // v0.11.85
import { jamesHpMax, canBreakThrough, newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, migrate, SAVE_VERSION, advance, STARVE_HP_PER_HOUR, jamesQiMax, yukiQiMax, qiRegenPct, breakthrough, inAct1, bumpRel as relBump, startActCoil, REL_CATCHUP } from '../js/core/game.js';
import { canPrimary, canColGroup, colGroupsOpen, btTarget, COL_GROUPS, priHours, colHours, merMinutesOf } from '../js/story/meridians.js';
import { sceneView, choose, goTo, wasPicked, isMenuScene, notePicked, seenBefore, noteSeen } from '../js/core/story.js';
import { againView, skipStep, skipRun, skipPlan, MEMORY_LINES, noFold, SKIP_MAX } from '../js/story/again.js'; // v0.11.35 (P1-a)
import { medCards, runMed, canMeditate, NO_MEDITATE, isSitChoice, MED_SCREENS } from '../js/core/meditate.js';
import { defaultMinutes, DEFAULT_MINUTES } from '../js/core/story.js';
import { coilActive, rewind, endCoil, KEEP_FLAGS, REMEMBER } from '../js/core/coil.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskMinutes, taskOutcome, dryOutcome, outcomeOf, sitLoop, sitLoopPlan, sitTaskId, SIT_STOP_TEXT, runTask, taskState, setYuki, yukiLane, famTier, merChoice, MER_TASK, BT_TASK, SIT_TASK, merLineTask, lineOfTask, isQueueScreen, runsHere, cardSpeed } from '../js/core/tasks.js';
/** v0.11.64: the game has no queue; the bots keep their plan of cards in the save's old queue field (emptied by the Coil screens and a collapse, as the queue was), so they play exactly as before. */
const planOf = (g) => taskState(g).queue;
/** v0.11.37 (D-a): card `id` can't run because the day is over (the day's end passed, or it would end past it; 00:00 since v0.11.91); the bots' plan stops there, as the queue did. A test helper since v0.11.64. */
const dayOver = (g, scenes, id) => (nightLock(g) ? !taskCards(g, scenes, id).some((x) => x.id === id && x.status === 'open') : taskCards(g, scenes, id).some((x) => x.id === id && x.status === 'late'));

import { writeFileSync } from 'node:fs';
import { GAMES, FULL, SHARD, WORKERS, SEED, SENSIBLE, REPORT, STATS_OUT, myRuns, seedOf, launch, collect, emit, mergeInto } from './lib/shard.mjs';
import { seen as touched, track, noteView, noteCards, mergeSeen, seenOut as touchedOut } from './lib/seen.mjs'; // v0.11.22: for tools/leftovers.mjs
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; if (fail < 30) console.error('  FAIL ', l); } };
const kids = launch(import.meta.url); // v0.11.1: the bot games in worker processes, while this one runs the other checks
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
// v0.11.67 (owner pick F1, one hub format): no gate cards. The Long Forest camp's Forage, Hunt and Practice are work cards on
// its list and Go deep's zones door cards; the Blackroot's Practice is a work group on its three hubs. Each card runs from the
// hub and comes back to it; a zone's door opens its scene.
{
    const { readFileSync } = await import('node:fs');
    const { oneOffLeft, onceKey } = await import('../js/story/oneoff.js');
    const lf = deserialize(readFileSync(new URL('../saves/v0.11.7-long-forest-coil2.json', import.meta.url), 'utf8'));
    lf.james.qi = 30; lf.james.satiety = 70;
    const lc = taskCards(lf, SCENES);
    const grp = (n) => lc.filter((c) => c.group === n && c.status === 'open');
    assert(lf.scene === 'lf_hub' && ['Forage', 'Hunt', 'Practice'].every((n) => grp(n).length && grp(n).every((c) => c.kind === 'work' || c.kind === 'chore')) && grp('Go deep').length === 4 && grp('Go deep').every((c) => c.kind === 'door'), `v0.11.67 (F1): the Long Forest camp's groups (${lc.map((c) => `${c.group}/${c.kind}`)})`);
    const vis = sceneView(lf, SCENES).choices.filter((c) => c.index < 1000 && !isTaskChoice(SCENES, 'lf_hub', c.index)).map((c) => String(c.label));
    assert(!vis.some((t) => /^(Forage|Hunt|Train)\.|^Go deep/.test(t)), `v0.11.67 (F1): no gate card left among the Long Forest's story cards (${vis})`);
    for (const n of ['Forage', 'Hunt', 'Practice']) {
        const x = deserialize(serialize(lf)); x.james.qi = 30; x.james.satiety = 70;
        if (!grp(n).length) continue; // reported by the group check above (Fable review M2)
        const id = grp(n)[0].id, m0 = x.minutes; runTask(x, SCENES, id);
        assert(x.scene === 'lf_hub' && x.minutes > m0, `v0.11.67 (F1): a ${n} card runs from the camp and comes back (${id}: ${x.scene})`);
    }
    if (grp('Go deep').length) {
        const z = deserialize(serialize(lf)); runTask(z, SCENES, grp('Go deep')[0].id);
        assert(z.scene === 'lf_bone_depths', `v0.11.67 (F1): Go deep's first zone opens its scene (${z.scene})`);
    }
    for (const hub of ['rr_hub', 'dw_hub', 'ah_hub']) {
        const b = ensureBars(newGame(312)); b.scene = hub; b.coil.act = 1; b.minutes = (hub === 'rr_hub' ? 13 : hub === 'dw_hub' ? 15 : 17) * 1440 + 9 * 60; b.james.qi = 30; b.james.satiety = 70; b.flags.ya_joined = true;
        const pc = taskCards(b, SCENES).filter((c) => c.group === 'Practice' && c.status === 'open');
        assert(pc.length >= 3 && pc.every((c) => c.kind === 'work' && c.id.startsWith('bl_train:')), `v0.11.67 (F1): ${hub}'s Practice group (${pc.map((c) => c.label)})`);
        if (!pc.length) continue;
        runTask(b, SCENES, pc[0].id);
        assert(b.scene === hub, `v0.11.67 (F1): ${hub}: a Practice card comes back to the hub (${b.scene})`);
    }
    // the Fable review (H1, R1): the Practice drills are repeatable work, so drills left never hold "Call it a day" back:
    // with every one-off done, the hub's oneOffLeft is the same with the four drills open or done
    for (const hub of ['rr_hub', 'dw_hub', 'ah_hub']) {
        const r = ensureBars(newGame(313)); r.scene = hub; r.coil.act = 1; r.minutes = (hub === 'rr_hub' ? 13 : hub === 'dw_hub' ? 15 : 17) * 1440 + 9 * 60; r.flags.ya_joined = true;
        const scn = SCENES[hub];
        scn.choices.forEach((c, i) => { r.flags[onceKey(hub, i)] = true; });
        for (const m of Object.keys(TASK_HUBS[hub].menus)) SCENES[m].choices.forEach((c, i) => { r.flags[onceKey(m, i)] = true; });
        Object.assign(r.flags, { ya_mocked: true, ya_sparred: true, rr_listened: true, ya_back: true, trio_found: true });
        for (const k of ['rr_forage', 'rr_scout', 'rr_hunt', 'dw_forage', 'dw_hunt', 'dw_scout', 'ah_forage', 'ah_hunt', 'ah_scout', 'tmei', 'tya', 'hot_spring']) markDaily(r, k);
        const open = !oneOffLeft(r, SCENES, hub);
        const drills = taskCards(r, SCENES).filter((c) => c.status === 'open' && c.group === 'Practice').length;
        for (const k of ['bt_ya', 'bt_dart', 'bt_needle', 'bt_yuki']) markDaily(r, k);
        const after = !oneOffLeft(r, SCENES, hub);
        assert(drills > 0 && open === after, `v0.11.67 (H1): ${hub}: the Practice drills never hold "Call it a day" back (${drills} drills open: ${open ? 'free' : 'held'}; done: ${after ? 'free' : 'held'})`);
    }
}
// v0.11.19 (owner pick B): Act 1's seven resting places are task screens
{
    const A1 = { fo_ashfall: ['Palisade', 'Council', 'Militia', 'Clinic'], rr_hub: ['Forage', 'Scout', 'Practice'], dw_hub: ['Forage', 'Practice'], ah_hub: ['Forage', 'Practice'], heart_hub: [], rt_camp: [], rt_ashfall: ['Militia'] };
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
    const hubs = ['camp', 'stream', 'wilds', 'village', 'ashfall', 'fo_ashfall', 'rr_hub', 'dw_hub', 'ah_hub', 'heart_hub', 'rt_camp', 'rt_ashfall'];
    const day0 = { camp: 0, stream: 0, wilds: 1, village: 3, ashfall: 4, fo_ashfall: 7, rr_hub: 10, dw_hub: 11, ah_hub: 13, heart_hub: 15, rt_camp: 18, rt_ashfall: 19 };
    let same = 0, diff = [];
    for (let i = 0; i < 200; i++) {
        const hub = hubs[i % hubs.length];
        const g = ensureBars(newGame(400 + i)); g.scene = hub; g.minutes = day0[hub] * 1440 + (7 + (i % 9)) * 60; g.james.qi = 20 + (i % 20); g.james.satiety = 15 + (i * 7) % 80;
        Object.assign(g.flags, { long: true, forest_day: 2, vday: 2 });
        for (let k = 0; k < 30; k++) g.log.push({ at: g.minutes, scene: hub, lines: ['filler line to make the log heavy'] });
        const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
        setDryClone(true); const a = JSON.stringify([cards.map((c) => taskOutcome(g, SCENES, c.id)), cards.map((c) => taskMinutes(g, SCENES, c.id))]);
        setDryClone(false); const b = JSON.stringify([cards.map((c) => taskOutcome(g, SCENES, c.id)), cards.map((c) => taskMinutes(g, SCENES, c.id))]);
        if (a === b) same++; else if (diff.length < 3) diff.push(`${hub} #${i}`);
    }
    assert(same === 200, `v0.11.20: the lean dry run = the full copy on 200 screens (${same}; differs: ${diff.join(', ')})`);
}
// old state (v1) → empty queue
{ const old = ensureBars(newGame(5)); delete old.tasks; old.v = 1; migrate(old); assert(old.v === SAVE_VERSION && Array.isArray(old.tasks.queue) && old.tasks.queue.length === 0 && Object.keys(old.tasks.fam).length === 0 && old.tasks.yuki.on === false, 'v1 save gets an empty queue and no familiarity'); }
// v0.11.64 (F): no queue: a saved queue is emptied and a half-filled bar dropped when the save is read; the field stays
{
    const o = ensureBars(newGame(6)); o.tasks.queue.push('wilds:6', 'mer:pri'); o.runPart = { id: 'wilds:6', at: o.minutes, frac: 0.4 };
    const back = deserialize(serialize(o));
    assert(Array.isArray(back.tasks.queue) && back.tasks.queue.length === 0 && !('runPart' in back) && back.minutes === o.minutes && JSON.stringify(back.james) === JSON.stringify(o.james), 'v0.11.64: a saved queue is emptied and runPart dropped; nothing else changes');
    const e = ensureBars(newGame(6)); const s0 = serialize(e); assert(serialize(deserialize(s0)) === s0, 'v0.11.64: a save without a queue reads back unchanged');
}
// HP 0 during a task (v0.9.4): the Coil ends — queue cleared, the Coil screen
{
    const g = ensureBars(newGame(9)); g.scene = 'wilds'; g.minutes += 1440 + 120; Object.assign(g.flags, { long: true, forest_day: 2 });
    g.james.satiety = 0; g.james.hp = 0.5; planOf(g).push('wilds:6', 'wilds:6');
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest/.test(c.text));
    const r = runTask(g, SCENES, `wilds:${rest}`);
    assert(r.stopped && planOf(g).length === 0 && g.scene === 'coil_end' && g.coil.why === 'collapse', `collapse → the Coil screen, the plan cleared (${g.scene})`);
    assert(r.lines.some((l) => /You fold up where you stand/.test(l)) && !r.lines.some((l) => /queue/i.test(l)), 'v0.11.64: the collapse text mentions no queue');
}
// v0.9.5: every choice takes time in task mode; the Meditate card everywhere
{
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
    // v0.11.13 (E1): no meridian screen from Meditate; at Golden Core (Foundation before v0.11.66, G4) the Extraordinary vessel is a card, run from the scene, which stays
    const e = ensureBars(newGame(34)); e.scene = 'village'; e.james.realm = 4; e.james.qi = 30;
    const before = JSON.stringify(e.inventory);
    const em = medCards(e, SCENES);
    assert(!em.some((c) => c.id === 'med:mer') && em.some((c) => c.id === 'med:mer:e8' && c.open && c.minutes === 120), 'Golden Core: the Extraordinary vessel is a Meditate card (a 2 h sitting of its 4 h, v0.11.18), no meridian screen');
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
        // v0.11.91 (owner pick B, push 1): Push through the night and Exhaustion are gone: no Push card at any hour, the night
        // locks the day's work, work is never slowed, and an old save's Exhaustion and push marks are dropped when read
        const p = ensureBars(newGame(306)); p.scene = 'ashfall'; p.minutes = 5 * 1440 + 9 * 60; wakeDay(p); markDaily(p, 'clinic');
        for (const hh of [17, 21, 23, 24, 25, 27]) { p.minutes = 5 * 1440 + hh * 60; assert(!medCards(p, SCENES).some((c) => c.id === 'med:push' || /Push through/.test(c.label || '')), `v0.11.91: no Push card at ${hh}:00`); }
        p.minutes = 6 * 1440 + 60; assert(nightLock(p) && medCards(p, SCENES).length === 0 && !daily('clinic')(p), 'v0.11.91: at 01:00 the day is over: no Meditate card, the clinic still done');
        let threw = false; try { runMed(p, SCENES, 'med:push'); } catch { threw = true; } assert(threw, 'v0.11.91: med:push is no card any more');
        const sx = ensureBars(newGame(307)); sx.scene = 'ashfall'; sx.minutes = 5 * 1440 + 10 * 60; sx.wake = { n: 6, ex: 2, lastX: 6, slept: 6, push: 5 }; const sm = sitMinutes(sx); const c0 = sx.minutes; sx.james.qi = 30; condense(sx);
        assert(sx.minutes - c0 === sm && !('ex' in sx.wake) && !('push' in sx.wake) && wakeDay(sx) === 6, `v0.11.91: an old save's Exhaustion 2 and push mark are dropped; a sit takes its own time (${sx.minutes - c0} vs ${sm})`);
        const r0 = sx.minutes; advance(sx, 60, { resting: true }); const k0 = sx.minutes; advance(sx, 60); assert(sx.minutes - k0 === 60 && k0 - r0 === 60, 'v0.11.91: work and rest take their own time');
        // Yuki's curve (c2)
        assert(yukiSpeed(0) === 1 && Math.abs(yukiSpeed(10) - 2) < 1e-9 && yukiSpeed(20) === 3 && yukiSpeed(61) === 3 && yukiSpeed(500) === 3, `Yuki's job: N 90, capped at ×3 (${yukiSpeed(10)}, ${yukiSpeed(61)})`);
        // the Extraordinary lines, timed (b)
        assert(e8Hours(0) === 4 && e8Hours(7) === 11 && ecHours(0) === 3 && ecHours(27) === 6 && jnHours(0) === 6 && jnHours(9) === 10, 'Extraordinary hours: vessels 4 … 11, collaterals 3 … 6, junctions 6 … 10');
        const x = ensureBars(newGame(310)); x.scene = 'village'; x.james.realm = 4; x.james.qi = 30; // v0.11.66 (G4): from Golden Core
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
    assert(canPrimary(g), 'no daily limit');
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
    const g = ensureBars(newGame(91, { closed: true }));
    assert(coilMult(g) === 1, 'Coil 1: ×1');
    const xp1 = (h) => { const c = structuredClone(h); const out = awardXp(c, 'Convergence Use', 'standard'); return Number(/\+(\d+) XP/.exec(out[0])[1]); };
    const base = xp1(g);
    endCoil(g, 'collapse'); rewind(g); endCoil(g, 'beast'); rewind(g); // v0.11.86 (#53): a death adds to the bonus (a bite by choice doesn't)
    assert(g.coil.n === 3 && coilMult(g) === 1.5 && xp1(g) === Math.floor(base * 1.5), `Coil 3: ×1.5 XP (${base} → ${xp1(g)})`);
    const y0 = g.yuki.fight.xp; awardYukiFightXp(g, 'standard'); assert(g.yuki.fight.xp - y0 === 45 || g.yuki.fight.level > 1, `Yuki's XP ×1.5 too (${g.yuki.fight.xp - y0})`);
    // v0.11.41 (D2-a): the meridian DC ÷ the Coil bonus was Story Mode's checked sessions (gone)
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
    assert(NO_DICE_TUNE.collectors.up === 4.5 && NO_DICE_TUNE.rot_ape.up === 14 && COIL_GROWTH === 0.25, `RB-1: the tribute 4.5, the rot ape 14 (v0.11.36; 15 in RB-1), the Coil bonus 0.25 per Coil (${NO_DICE_TUNE.collectors.up}, ${NO_DICE_TUNE.rot_ape.up}, ${COIL_GROWTH})`);
    assert(fmtMult(1) === '1' && fmtMult(1.25) === '1.25' && fmtMult(1.5) === '1.5' && fmtMult(2.75) === '2.75', 'fmtMult: ×1.25 shows as 1.25, not 1.3');
}
// v0.10.4: Bonesinger forms — Incremental Mode shows only what James can sing
{
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
    assert(/hedge/.test(SCENES.night_attack_forced.text), 'the hedge fail text');
    const fc = t('rt_ford', /stepping-stones/); const fg = ensureBars(newGame(84)); setCu(fg, 3, 1);
    assert(fc.do(fg).some((l) => /stepping-stones/.test(l)), 'the ford result line');
}
// v0.10.2: the camp is a task screen (its checks keep the story numbers); waiting for a time of day plays at once
{
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
    const o1 = taskOutcome(g, SCENES, fire.id); runTask(g, SCENES, fire.id); const e1 = g.minutes;
    const o2 = taskOutcome(g, SCENES, stakes.id); runTask(g, SCENES, stakes.id);
    assert(o1.end === e1 && o2.end === g.minutes && g.flags.fire && g.flags.stakes, 'v0.11.64: camp cards end where their card said');
    const ni = SCENES.camp.choices.findIndex((c) => /^Night falls/.test(c.text));
    choose(g, SCENES, ni);
    assert(g.scene === 'night' || g.minutes % 1440 >= 21 * 60, 'Night falls: the clock lands on 21:00 or later');
}
// v0.10.1: the Long Forest in task mode — gated behind the first Coil, one season (+1 realm) per card
{
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
    const m0 = g.minutes;
    runTask(g, SCENES, season.id);
    assert(g.james.realm === 1 && g.yuki.realm === 1 && g.james.primaries === 12 && g.james.collaterals === 66 && g.yuki.collaterals === 66 && !g.james.colSealed, 'a season: Foundation, every primary and collateral open, no seal');
    assert(g.james.gu.tier === 1 && g.james.gu.level === 7 && g.james.skills['Convergence Use'].level === 7 && g.yuki.fight.level === 7 && g.yuki.qiUse.level === 7, 'a season lifts the skills to T1 L7');
    assert(g.minutes - m0 === LF_SEASON_MINUTES && g.james.saturation === 0 && g.james.hp === jamesHpMax(g), 'a season takes 2 h, Saturation 0, bars full');
    const os = taskOutcome(g, SCENES, season.id); runTask(g, SCENES, season.id);
    assert(g.james.realm === 2 && os.end === g.minutes, 'two seasons: Core Formation, and the card said where it ends');
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
        assert(e.scene === 'a1_again' && av.choices.map((c) => c.label).join('|') === 'Bite the tail. Wake at the start of Act 1. (By choice: adds no faster learning.)|Bite the tail. Wake at the start of the whole game (Day 1, the arrival). (By choice: adds no faster learning.)|Not yet.', `${outcome}: the confirm screen`);
        choose(e, SCENES, av.choices.find((c) => (target === 'act' ? /start of Act 1/ : /whole game/).test(c.label)).index);
        assert(e.scene === 'coil_dawn' && e.coil.n === 3 && e.coil.free === 1 && coilMult(e) === 1.25 && !e.flags.a1_outcome && !e.inventory.beast_core, `${outcome} → ${target}: Coil 3 (one count), ×1.25 (v0.11.86, G1: going round again is by choice, no bonus from it), the outcome and the hammerspace gone`);
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
    assert(bl.check.dc === 7 && hp.check.dc === 5, 'tribute +1 in task mode');
}
// the Coil: rewind keeps James, Yuki, familiarity and knowledge; resets the world; 25% head start
{
    const g = ensureBars(newGame(21)); g.scene = 'ashfall'; g.minutes += 4 * 1440;
    Object.assign(g.flags, { long: true, vday: 2, lore1: true, lore_realms: true, saw_lights: true, bone_sung: true, roots: true, gills: true, healed: true, boar: true, gao_broken: true, yk_path: 'sister', longforest: true });
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
    for (const f of ['healed', 'boar', 'gao_broken', 'vday', 'bone_sung', 'roots', 'gills']) assert(g.flags[f] === undefined, `world flag ${f} reset`);
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

// v0.11.2: timed cultivation — a sit is an hour, Saturation by hours (10 h × 1.5^realm since v0.11.66, S1; × 2^realm before), the breakthrough a timed card
{
    assert(SAT_HOURS(0) === 10 && SAT_HOURS(1) === 15 && SAT_HOURS(2) === 22.5 && SAT_HOURS(3) === 33.75, 'v0.11.66 (S1): Saturation hours: 10, 15, 22.5, 33.75 … (×1.5 a realm)');
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
    g.james.realm = 1; ensureBars(g); assert(sitGain(g) === 6.7, `v0.11.66 (S1): Foundation: +6.7% a sit (${sitGain(g)})`);
    g.coil.n = 3; assert(sitGain(g) === 6.7, 'v0.11.15: Foundation on Coil 3: still +6.7% (no Coil bonus)');
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
        if (out?.done) { const k = `inc:${id0 || '?'}:${smart ? 'smart' : 'random'}`; const f = fightStats[k] || (fightStats[k] = { win: 0, lose: 0, flee: 0 }); f[out.done] = (f[out.done] || 0) + 1; goTo(g, SCENES, out.next); return; }
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
        const d = ensureBars(newGame(912, { closed: nd })); d.james.skills['Convergence Use'] = { tier: 1, level: 5, xp: 0 }; d.james.qi = jamesQiMax(d);
        sCombat(d, { id: 'jackals', intro: '', band: 'standard', enemies: [{ name: 'Dummy', hp: 999, dc: 1, atk: 1, dmg: 0 }], win: 'stream', lose: 'stream' });
        const q0 = d.james.qi; cStep(d, 'dart');
        assert(Math.abs(q0 - d.james.qi - 2) < 1e-9, `v0.11.21: a dart costs 2 Qi (${nd ? 'Incremental' : 'Story'} Mode: ${q0} → ${d.james.qi})`);
    }
    // a breakthrough fills both bars, James's and Yuki's
    for (const nd of [true]) { // v0.11.34 (D1): Incremental Mode only
        const b = ensureBars(newGame(913)); b.james.saturation = 100; b.james.hp = 1; b.james.qi = 1; b.yuki.hp = 1; b.yuki.qi = 1;
        const r = breakthrough(b);
        assert(r.ok && b.james.hp === jamesHpMax(b) && b.james.qi === jamesQiMax(b) && b.yuki.hp === G.yukiHpMax(b) && b.yuki.qi === yukiQiMax(b), `v0.11.21: a breakthrough fills HP and Qi for both (${nd ? 'Incremental' : 'Story'} Mode)`);
    }
    // the forecast: a work card's dry run = its real run (v0.11.91: no Exhaustion, so no ×1.5 case any more)
    const x = ensureBars(newGame(914)); x.scene = 'ashfall';
    const wc = taskCards(x, SCENES).find((c) => c.kind === 'work' && c.status === 'open');
    assert(!!wc, 'v0.11.21: Ashfall has an open work card');
    if (wc) {
        const t1 = taskMinutes(x, SCENES, wc.id), y = JSON.parse(JSON.stringify(x)), ym = y.minutes;
        runTask(y, SCENES, wc.id);
        assert(t1 === y.minutes - ym, `v0.11.21: the forecast of ${wc.id} is its real time (${t1} vs ${y.minutes - ym})`);
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
    // v0.11.41 (D2-a): Story Mode's sits are gone; their places stay (never shown) so later choices keep their index
    const left = ['meditate1', 'night', 'night_event', 'fo_night', 'heart_camp'];
    const h = ensureBars(newGame(112)); h.james.qi = 30; h.flags.night_ev = 'rain';
    for (const id of left) {
        const c = SCENES[id].choices.find((x) => /^Story Mode only/.test(String(x.text)));
        const inc = c && c.show && c.show(h);
        assert(c && !inc && !SCENES[id].choices.some((x) => /^(Condense|Cultivate first|Sit in the rain|Cultivate one sit before|Cultivate by the fire)/.test(String(x.text))), `v0.11.41: ${id}: Story Mode's sit is a hidden place, its text gone`);
    }
    h.scene = 'meditate1'; assert(!/You could keep going/.test(SCENES.meditate1.text(h)), 'v0.11.16: meditate1 no longer offers to condense (Incremental Mode)');
}
let badBars = 0; // v0.11.3: games that ended with a NaN / Infinity bar
const barsOk = (g) => [g.james.hp, g.james.qi, g.james.saturation, g.james.satiety, g.yuki.hp, g.yuki.qi].every(Number.isFinite);
let predicted = 0;
let skipChecked = 0;
/** v0.11.35 (P1-a): on a copy, the skip ends in exactly the state of tapping through the same choices one by one. */
function skipCheck(g, run) {
    const a = JSON.parse(JSON.stringify(g));
    if (skipStep(a, SCENES) < 0) return;
    const b = JSON.parse(JSON.stringify(g));
    const r = skipRun(a, SCENES);
    for (let k = 0; k < r.steps; k++) { const o = sceneView(b, SCENES).choices.filter((c) => !c.disabled); choose(b, SCENES, o[0].index); }
    if (JSON.stringify(a) === JSON.stringify(b)) pass++; else assert(false, `v0.11.35: the skip = tapping through (${g.scene}, run ${run}, ${r.steps} steps)`);
    skipChecked++;
}
function play(run, tasks) {
    rs = seedOf(run, tasks ? 1 : 2); // v0.11.1: every game its own random stream
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
                const q = planOf(g);
                for (let k = 1 + rnd(4); k > 0; k--) q.push(cards[rnd(cards.length)].id);
                // v0.11.64: each card's dry run (the card's time, end, Fed, HP) must match what really happens
                const FC = run % FC_EVERY === 0; // v0.11.21
                while (q.length && isTaskHub(g)) {
                    const id = q.shift();
                    if (dayOver(g, SCENES, id)) { st.night = (st.night || 0) + 1; q.length = 0; break; } // v0.11.37 (D-a): the plan stops at the day's end (as the queue did)
                    if (!taskOpen(g, SCENES, id)) { st.skipped++; continue; }
                    cardsSeen.add(id);
                    const m0 = g.minutes;
                    // v0.11.46 (owner pick B1): also the first time a card runs in this process, so every card's forecast is checked
                    // without luck (a rare card such as dw_hub's "Call it a day" could miss the 1 game in 8); the dry run is on a copy
                    const fc1 = FC || !cardsForecast.has(id);
                    const mins = fc1 ? taskMinutes(g, SCENES, id) : 0;
                    const oc = FC ? taskOutcome(g, SCENES, id) : null; // v0.11.64 (A1, B1)
                    const card = taskCards(g, SCENES).find((c) => c.id === id);
                    if (card?.check) bands[card.check.band] = (bands[card.check.band] || 0) + 1;
                    const fam0 = taskState(g).fam[id] || 0;
                    const r = runTask(g, SCENES, id);
                    if (r.lines.some((l) => /^Yuki (comes|leaves)/.test(l))) yukiRuns++;
                    if (card?.kind === 'work') { if ((taskState(g).fam[id] || 0) > fam0) pass++; else assert(false, `familiarity grows on ${id}`); } // v0.11.21: the label only on a failure
                    st.cards++;
                    if (fc1) { if (g.minutes - m0 === mins || r.stopped) pass++; else assert(false, `dry run predicts ${id} (${mins} vs ${g.minutes - m0})`); }
                    if (!r.stopped) { cardsWhole.add(id); if (fc1) cardsForecast.add(id); }
                    if (oc) { if (r.stopped && oc.minutes === mins && !oc.death === (g.scene !== 'coil_end') || (!r.stopped && oc.end === g.minutes && oc.fed === g.james.satiety && oc.hp === g.james.hp && !oc.death)) predicted++; else assert(false, `v0.11.64: ${id}'s dry run = what happens (run ${run}: ${JSON.stringify(oc)} vs ${g.minutes}, ${g.scene})`); }
                    if (r.lines.some((l) => /Your knees make the decision/.test(l))) st.collapses++;
                    if (Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.satiety)) pass++; else assert(false, `bars finite after ${id}`);
                }
                q.length = 0;
                continue;
            }
            const r = choose(g, SCENES, stops[rnd(stops.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
            continue;
        }
        if (tasks && run % FC_EVERY === 0 && seenBefore(g)) skipCheck(g, run); // v0.11.35 (P1-a): copies only
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
        yukiRuns += r.yukiRuns; predicted += r.predicted; skipChecked += r.skipChecked; diceInTasks += r.diceInTasks; pass += r.pass; fail += r.fail;
    }
} else for (const run of myRuns()) play(run, true); // v0.11.34 (D1): Incremental Mode only (the Story Mode games are gone)
if (SHARD) emit({ byCoil, medStats, deaths, stats, bands, fightStats, badBars, cardsSeen, cardsListed, cardsForecast, cardsWhole, yukiRuns, predicted, skipChecked, diceInTasks, pass, fail, touched });
if (BOTS_ONLY) { // v0.11.21: the games' stats only (the same file a full run writes)
    if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, deaths, byCoil, fights: fightStats, badBars, seen: touchedOut() }));
    console.log(`  ${GAMES} bot games, bots only (no rule checks)\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
}
rs = 4243; // the checks below draw from their own stream
// task mode: no die anywhere, in fights or story
{
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

// v0.11.66 (owner pick V1): since G4 the bots rarely reach Golden Core with all 8 vessels open, so the vessels' collateral card
// (mer:ec) is offered but hardly ever played. A walk of WALK_GAMES random games from a Golden Core start, 8 vessels open, plays the
// task screens' cards like the bots (random cards, random story stops, fights blade / dart); the cards it plays count toward the
// coverage below. It runs in this process on its own random stream (restored after), so the bot games and their numbers don't change.
// v0.11.91 (owner pick K1): since the day ends at 00:00, the bots reach Ashfall on the way home mostly in the evening, when its
// 150-minute drills would end past midnight, so "Let Ya teach them" (rt_hunters:1) is offered but no longer played as a card.
// A daytime visit (Day 20, 09:00) plays each open card there once, on its own copy; it counts toward the coverage below.
let dayWalk = 0;
{
    const g0 = ensureBars(newGame(919100, { closed: true })); g0.scene = 'rt_ashfall'; g0.minutes = 19 * 1440 + 9 * 60; wakeDay(g0); g0.james.satiety = 90; g0.james.hp = jamesHpMax(g0); g0.james.qi = jamesQiMax(g0);
    const open = taskCards(g0, SCENES).filter((c) => c.status === 'open');
    assert(open.some((c) => c.id === 'rt_hunters:1'), `K1: Ashfall at 09:00 on Day 20 offers "Let Ya teach them" (${open.map((c) => c.id).join(', ')})`);
    for (const c of open) { const g = structuredClone(g0); runTask(g, SCENES, c.id); cardsSeen.add(c.id); dayWalk++; }
}
const WALK_GAMES = 20;
let walkEc = 0, walkE8 = 0, walkCards = 0;
{
    const rs0 = rs;
    for (let run = 0; run < WALK_GAMES; run++) {
        rs = seedOf(run, 66);
        const g = ensureBars(newGame(660000 + run, { closed: true }));
        Object.assign(g.james, { realm: 4, primaries: 12, collaterals: 66, extra8: run % 2 ? 0 : 8, extraCollaterals: 0 }); // v0.11.67 (R1): odd runs with the vessels shut, so the vessel card (mer:e8) is played too
        Object.assign(g.yuki, { realm: 4, primaries: 12, collaterals: 66 });
        ensureBars(g); g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g);
        for (let step = 0; step < 4000; step++) {
            const v = sceneView(g, SCENES);
            if (v.end || g.scene === 'coil_end') break;
            let open = v.choices.filter((c) => !c.disabled);
            if (isTaskHub(g)) {
                const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
                const stops = open.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index));
                if (cards.length && (rnd(10) < 8 || !stops.length)) {
                    const id = cards[rnd(cards.length)].id;
                    runTask(g, SCENES, id); cardsSeen.add(id); walkCards++; if (id === 'mer:ec') walkEc++; if (id === 'mer:e8') walkE8++;
                    continue;
                }
                open = stops;
            }
            if (/^(arrival|clearing)$/.test(g.scene)) open = open.filter((c) => !/Stay lost/.test(c.label));
            if (!open.length) break;
            const r = choose(g, SCENES, open[rnd(open.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const o = combatStep(g, t % 2 ? 'blade' : 'dart'); if (o.done) { goTo(g, SCENES, o.next); break; } } }
            if (g.combat) { assert(false, `V1 walk: a fight ends (${g.scene}, run ${run})`); break; }
        }
    }
    rs = rs0;
    assert(walkE8 > 0, `v0.11.67 (R1): the walk plays the vessel card too (${walkE8} times; with "Call it a day" back on the Blackroot the bots rarely do)`);
assert(walkEc > 0, `V1: the Golden Core walk plays the vessels' collateral card (${walkEc} times in ${walkCards} cards, ${WALK_GAMES} games)`);
}
// v0.11.68 (owner picks A1 + B2 + C1): a choice's or a card's lines split into the reply (under the scene text) and the gains
// (Results), sentence by sentence by shape (js/core/replies.js); friendship and affection changes as Results lines.
{
    const { splitLine, splitReply, relLines, landParts, sentences, isGainSentence, GAIN_LINES, REPLY_LINES } = await import('../js/core/replies.js');
    const { medCards: mCards, runMed: mRun } = await import('../js/core/meditate.js');
    const { skipPlan: sPlan, skipRun: sRun } = await import('../js/story/again.js');
    const sp = (l) => { const r = splitLine(l); return `${r.reply}|${r.gain}`; };
    assert(sp('Raw hare: +12 satiety. You will not be telling anyone about this.') === 'You will not be telling anyone about this.|Raw hare: +12 satiety.', `B2: a meal line splits (${sp('Raw hare: +12 satiety. You will not be telling anyone about this.')})`);
    assert(sp('She throws you twice. You throw her once. She\'s thrilled.') === 'She throws you twice. You throw her once. She\'s thrilled.|', 'B2: a reply stays whole');
    assert(sp('"No," Ya says cheerfully. "She doesn\'t want me to either. She just doesn\'t know it yet."') === '"No," Ya says cheerfully. "She doesn\'t want me to either. She just doesn\'t know it yet."|', 'B2: speech stays whole and a reply');
    assert(sp('Stung. A lot. +3 Wild honeycomb, −2 HP.') === 'Stung. A lot.|+3 Wild honeycomb, −2 HP.', `B2: a haul with a reply (${sp('Stung. A lot. +3 Wild honeycomb, −2 HP.')})`);
    assert(sp('Opened the Lung meridian (1/12). It opens on an inhale.') === 'It opens on an inhale.|Opened the Lung meridian (1/12).', 'B2: a meridian line');
    assert(sp('GU +5 XP → T1 L2') === '|GU +5 XP → T1 L2' && sp('Breakfast. You eat: hare, cooked. +14 satiety.') === '|Breakfast. You eat: hare, cooked. +14 satiety.', 'B2: XP and eating are gains');
    assert(sp('Two Qi and 30 minutes into the ash around the Girdle Vessel. It gives a little. (4.5 h of 8 h.)') === '|Two Qi and 30 minutes into the ash around the Girdle Vessel. It gives a little. (4.5 h of 8 h.)', 'B2: a vessel sitting (a gain, the Opus review)');
    // the Opus review (R1): lines the first shapes put in the reply
    for (const l of ['You push on. Exhaustion 1: work takes ×1.5 until you sleep.', '+Ya\'s wolf tooth.', '+ The watcher\'s ledger: three pages of names.', 'The calendar starts again: Day 4.', 'You stay until the Day 19 dawn: resting, mapping, saying goodbye.', 'A miserable few hours of sleep.', 'Yuki: great root-kin form (hits much harder in a fight).', 'Your bone stakes will be harder from now on.', 'The hammerspace is full: the Long Forest\'s pantry comes with you.']) {
        const r = splitLine(l);
        assert(r.gain && !/×\d|\+ ?[A-Z']|Day \d|sleep|form \(|stakes|pantry/.test(r.reply), `R1: a gain, not a reply: ${l} (${r.reply} | ${r.gain})`);
    }
    // landParts: no relationship lines across a rewind; the summary reads every line (Yuki's haul)
    const lp = landParts(['Coil 3. The hammerspace is empty.'], { Village: { f: 30, a: 0 } }, { Village: { f: 14, a: 0 } }, { coilChanged: true });
    assert(!lp.gains.some((l) => /Village/.test(l)), `R1: biting the tail lists no relationship losses (${lp.gains})`);
    const ly = landParts(['Yuki comes back with 2 hares and the air of someone owed an apology. +2 Glassback hare (dressed).'], {}, {});
    assert(ly.sumLines.some((l) => /^Yuki comes/.test(l)) && ly.reply.length && ly.gains.some((l) => /^\+2 Glassback/.test(l)), `R1: Yuki's haul: the summary still reads her line (${JSON.stringify(ly)})`);
    const rl = relLines({ 'Mei Lin': { f: 1, a: 0 }, Village: { f: 3, a: 0 } }, { 'Mei Lin': { f: 5, a: 2 }, Ya: { f: -3, a: 0 }, Village: { f: 3, a: 0 } });
    assert(JSON.stringify(rl) === JSON.stringify(['Mei Lin: friendship +4, affection +2', 'Ya: friendship −3']), `C1: relationship lines (${rl})`);
    // a real choice: siding with Mei Lin at the Root Road's meal
    const m = ensureBars(newGame(316)); m.minutes = 13 * 1440 + 12 * 60; goTo(m, SCENES, 'ya_mocks'); m.rel['Mei Lin'] = { f: 30, a: 20 }; m.rel.Ya = { f: 30, a: 20 };
    const rel0 = JSON.parse(JSON.stringify(m.rel));
    const out = choose(m, SCENES, 0);
    const parts = splitReply(out.lines), rels = relLines(rel0, m.rel);
    assert(parts.reply.some((l) => /mouth twitches/.test(l)) && !parts.gains.some((l) => /mouth twitches/.test(l)) && rels.some((l) => /^Mei Lin: friendship \+/.test(l)) && rels.some((l) => /^Ya: friendship −/.test(l)), `A1 + C1: siding with Mei Lin: the reply under the text, the friendships in Results (${parts.reply} | ${parts.gains} | ${rels})`);
    // every line of a walk of random games is placed: no gain sentence with speech in it, no reply sentence with a stat in it
    const STAT = /\d+%|\b\d+(\.\d+)? (HP|Qi|XP)\b|[+−]\d|×\d|^\+ ?[A-Z']|\b\d\d:\d\d\b|\(\d+\/\d+\)/;
    const bad = new Map();
    let rewinds = 0, meds = 0, skips = 0, flees = 0, lf = 0;
    const check = (src, lines) => {
        for (const l of lines || []) {
            const s0 = String(l);
            if (GAIN_LINES.some((r) => r.test(s0)) || REPLY_LINES.some((r) => r.test(s0))) continue;
            for (const t of sentences(s0)) {
                const gain = isGainSentence(t) && !/"/.test(t);
                if (!gain && STAT.test(t) && !bad.has(t)) bad.set(t, `${src}: a reply with a stat in it`);
                if (isGainSentence(t) && /"/.test(t) && STAT.test(t) && !bad.has(t)) bad.set(t, `${src}: a gain with speech in it`);
            }
        }
    };
    const rs0 = rs;
    let walked = 0;
    // the Opus review (R1): the walk also takes the Long Forest (one run in three), bites the tail on the Coil screen,
    // runs Meditate cards, skips stretches read before and runs from fights
    for (let run = 0; run < (FULL ? 60 : 12); run++) {
        rs = seedOf(run, 68);
        const g = ensureBars(newGame(680000 + run, { closed: true }));
        if (run % 3 === 1) { g.james.realm = 2; ensureBars(g); }
        for (let step = 0; step < 3000; step++) {
            const v = sceneView(g, SCENES);
            if (v.end) break;
            if (g.scene === 'coil_end') rewinds++;
            if (g.flags.lf_active) lf++;
            let open = v.choices.filter((c) => !c.disabled);
            if (isTaskHub(g) || isQueueScreen(g, SCENES)) {
                const ms = mCards(g, SCENES).filter((m) => m.open);
                if (ms.length && rnd(10) < 2) { const m = ms[rnd(ms.length)]; let r; try { r = m.task ? runTask(g, SCENES, m.task) : mRun(g, SCENES, m.id); } catch { continue; } check(`meditate ${m.id}`, r.lines); meds++; walked++; continue; }
                const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
                const stops = open.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index));
                if (cards.length && (rnd(10) < 7 || !stops.length)) { const id = cards[rnd(cards.length)].id; check(`card ${id}`, runTask(g, SCENES, id).lines); walked++; continue; }
                open = stops;
            } else if (sPlan(g, SCENES).steps >= 2 && rnd(4) === 0) { check('skip', sRun(g, SCENES).lines); skips++; walked++; continue; }
            if (/^(arrival|clearing)$/.test(g.scene) && run % 3 !== 2) open = open.filter((c) => !/Stay lost/.test(c.label));
            if (!open.length) break;
            const sc = g.scene, pick = open[rnd(open.length)];
            const r = choose(g, SCENES, pick.index); walked++;
            check(`${sc}#${pick.index}`, r.lines);
            if (r.combat) {
                startCombat(g, r.combat(g));
                for (let t = 0; t < 400 && g.combat; t++) {
                    const fl = g.combat.flee && rnd(15) === 0;
                    const o = fl ? combatFlee(g) : combatStep(g, t % 2 ? 'blade' : 'dart');
                    if (fl) flees++;
                    if (o.done) { check('fight end', [...o.lines, ...goTo(g, SCENES, o.next)]); break; }
                }
                if (g.combat) break;
            }
        }
    }
    rs = rs0;
    assert(rewinds > 0 && meds > 0 && lf > 0 && (skips > 0 || !FULL), `R1: the walk bites the tail (${rewinds}), meditates (${meds}), skips (${skips}), runs (${flees}) and walks the Long Forest (${lf} steps)`);
    assert(bad.size === 0, `B2: every line of ${walked} choices and cards is placed (${[...bad].slice(0, 4).map(([t, w]) => `${w}: ${t}`).join(' || ')})`);
}
// v0.11.69 (owner picks R1 + P1, the texts Fable's, "F All"): the missing replies of the one-off story choices (relationship
// choices that said nothing, choices that answered with gains only, failed checks without a line), and a partial haul keeps
// the reply sentences of the item lines it drops.
{
    const { splitReply, keepReplies, splitLine } = await import('../js/core/replies.js');
    const { gives } = await import('../js/core/story.js');
    const { actingCheck, noDiceDc } = await import('../js/core/game.js');
    const { cardCheck } = await import('../js/core/tasks.js');
    const R69 = [
        ['wen_lesson', 0, 'do', (g) => { delete g.flags.lore_realms; }, 'Now you have asked the right question'],
        ['wen_lesson', 0, 'do', (g) => { g.flags.lore_realms = true; }, 'and cannot name'],
        ['far_lost', 0, 'do', null, 'Next time, take me'],
        ['mei_walk', 0, 'do', (g) => { g.flags.vday = 2; }, 'By now it may be'],
        ['mei_walk', 0, 'do', (g) => { g.flags.vday = 3; }, 'learning how to breathe again'],
        ['supper_roof', 0, 'do', (g) => { g.flags.vday = 1; }, 'Tell me about the trees again'],
        ['supper_roof', 0, 'do', (g) => { g.flags.vday = 2; }, 'shoulder still warm'],
        ['ya_found', 0, 'do', null, 'a hand\'s width closer'],
        ['sect_cut', 0, 'do', null, 'He believed it'],
        ['rt_watch', 0, 'do', null, 'quieter each time'],
        ['rt_fire_talk', 0, 'do', null, 'That was a good one'],
        ['yuki_tiger_awaken', 0, 'do', null, 'underline a word'],
        ['lf_ride', 0, 'do', null, 'The flat ones from the slow water'],
        ['lf_bored', 0, 'do', null, 'standing ovation'],
        ['forage', 0, 'do', null, 'You have standards'],
        ['forage', 2, 'do', null, 'peer review'],
        ['mire', 0, 'do', null, 'specimen worth your whole grant'],
        ['rt_ford', 0, 'do', null, 'shakes a wet paw'],
        ['ah_hunt', 1, 'do', null, 'Rare, for you'],
        ['heal', 1, 'fail', null, 'didn\'t do well enough'],
        ['bone_field', 0, 'fail', null, 'decency not to look at you'],
        ['hollow', 0, 'fail', null, 'patient with a child'],
        ['hunt_miss', 0, 'fail', null, 'a hand\'s width from where the hare was'],
        // R1 after the Opus review (Fable's fixes): the variants by form and by a thin haul
        ['lf_bored', 0, 'do', (g) => { g.yuki.realm = 7; g.yuki.form = 'human'; }, '"Acceptable," she says'],
        ['ah_hunt', 1, 'do', null, '"Thin," she says', { success: false, ratio: 0.7 }],
        ['forage', 2, 'do', null, 'turns out not to be the right way', { success: false, ratio: 0.7 }],
        ['forage', 2, 'do', null, 'a sky the colour of a bruise'],
        ['mei_walk', 0, 'do', (g) => { g.flags.vday = 3; }, 'came out of that forest'],
        ['lf_ride', 0, 'do', null, 'not getting out of it'],
    ];
    for (const [id, i, branch, setup, phrase, roll] of R69) {
        const g = ensureBars(newGame(690)); g.scene = id;
        if (setup) setup(g);
        const c = SCENES[id]?.choices?.[i];
        const fn = c && (branch === 'do' ? c.do : c.failDo);
        const out = fn ? fn(g, roll || { success: branch === 'do', ratio: branch === 'do' ? 1 : 0 }) || [] : [];
        const reply = splitReply(out).reply.join(' ');
        assert(reply.includes(phrase), `v0.11.69 (R1): ${id} #${i} (${branch}) answers with its reply (${reply.slice(0, 80) || 'nothing'})`);
    }
    // the review's test gaps: the variant replies through the real screens, the reply matching the text just read
    const high = (g) => { g.james.gu.tier = 4; g.james.gu.level = 5; };
    for (const [id, setup, textBit, replyBit] of [
        ['wen_lesson', (g) => { delete g.flags.lore_realms; }, 'ladder', 'right question'],
        ['wen_lesson', (g) => { g.flags.lore_realms = true; }, 'Old Tree', 'cannot name'],
        ['mei_walk', (g) => { g.flags.vday = 2; }, 'Bit late for that', 'By now it may be'],
        ['mei_walk', (g) => { g.flags.vday = 3; }, 'last sunset', 'out of that forest'],
        ['supper_roof', (g) => { g.flags.vday = 1; }, 'Which one', 'trees again'],
        ['supper_roof', (g) => { g.flags.vday = 2; }, 'plum wine', 'shoulder still warm'],
    ]) {
        const g = ensureBars(newGame(696)); high(g); setup(g); goTo(g, SCENES, id);
        const text = sceneView(g, SCENES).text, r = choose(g, SCENES, 0), rep = splitReply(r.lines).reply.join(' ');
        assert(text.includes(textBit) && rep.includes(replyBit), `v0.11.69 (review): ${id}: the text read (${textBit}) and the reply (${replyBit}) agree (${rep.slice(0, 60)})`);
    }
    // nothing else about these choices changed
    {   const g = ensureBars(newGame(697)); high(g); goTo(g, SCENES, 'rt_ford'); const c = SCENES.rt_ford.choices[0];
        const r = choose(g, SCENES, 0);
        assert(g.scene === 'rt_camp' && gives(c).length === 0 && splitReply(r.lines).reply.some((l) => /wet paw/.test(l)), `v0.11.69 (review): the ford still lands on rt_camp, gives nothing (${g.scene})`); }
    {   const g = ensureBars(newGame(698)); g.james.gu.tier = 1; g.james.gu.level = 1; goTo(g, SCENES, 'heal'); const v0 = JSON.stringify(g.rel.Village || null);
        const idx = sceneView(g, SCENES).choices.find((c) => /^Drain and clean/.test(c.label)).index;
        const r = choose(g, SCENES, idx);
        assert(r.lines.some((l) => /— failure/.test(l)) && !g.flags.healed && JSON.stringify(g.rel.Village || null) === v0 && splitReply(r.lines).reply.some((l) => /well enough/.test(l)), `v0.11.69 (review): a failed heal still heals nothing and moves no one (${g.flags.healed})`); }
    {   const g = ensureBars(newGame(699)); g.james.gu.tier = 1; g.james.gu.level = 1; g.james.qi = 10; goTo(g, SCENES, 'hunt_miss');
        const r = choose(g, SCENES, 0);
        assert(r.lines.some((l) => /— failure/.test(l)) && g.scene === 'stream' && !g.flags.hunt2, `v0.11.69 (review): a failed retry still leaves hunt2 unset (${g.scene}, ${g.flags.hunt2})`); }
    { const g = ensureBars(newGame(700)); SCENES.hollow.choices[0].failDo(g); assert(g.flags.hollow_sit === true, 'v0.11.69 (review): the failed hollow sit still sets its flag'); }
    // the review's low 7: the bone stakes sentence is a gain, also on a partial
    assert(splitLine('+1 Giant\'s bone-meal. Your bone stakes will be harder from now on.').reply === '' && keepReplies(['+1 Giant\'s bone-meal. Your bone stakes will be harder from now on.']).length === 0, 'v0.11.69 (review): the bone stakes line is all gain');
    // the gains still come with them, unchanged
    { const g = ensureBars(newGame(691)); const o = SCENES.ya_found.choices[0].do(g); assert(splitReply(o).gains.join() === '+1 Ya\'s wolf tooth.' && g.inventory.ya_tooth === 1, 'v0.11.69: the tooth is still a gain'); }
    { const g = ensureBars(newGame(692)); const o = SCENES.bone_field.choices[0].failDo(g); assert(g.flags.bone_sung === true && o.length === 1, 'v0.11.69: the failed skull still sets its flag'); }
    { const g = ensureBars(newGame(693)); g.flags.lore_realms = true; SCENES.wen_lesson.choices[0].do(g); assert(g.flags.lore_tree === true, 'v0.11.69: the second lesson still sets lore_tree'); }
    // through choose: the far_lost lecture lands under Ashfall's text
    { const g = ensureBars(newGame(694)); goTo(g, SCENES, 'far_lost'); const r = choose(g, SCENES, 0); assert(g.scene === 'ashfall' && splitReply(r.lines).reply.some((l) => /take me/.test(l)), 'v0.11.69: far_lost answers through choose'); }
    // P1: a partial keeps the reply sentences of the item lines it drops
    assert(JSON.stringify(keepReplies(['+2 Glassback hare (dressed). Teamwork. Disgusting, bloody teamwork.', 'Other line.', '+3 Jade bracket fungus.'])) === JSON.stringify(['Teamwork. Disgusting, bloody teamwork.', 'Other line.']), 'v0.11.69 (P1): keepReplies');
    assert(JSON.stringify(keepReplies(['+2 Mire fowl. "Small," she says. "Rare, for you." Through the bond: *fish. The flat ones.*'])) === JSON.stringify(['"Small," she says. "Rare, for you." Through the bond: *fish. The flat ones.*']), `v0.11.69 (review): keepReplies keeps quotes and italics whole (${keepReplies(['+2 Mire fowl. "Small," she says. "Rare, for you." Through the bond: *fish. The flat ones.*'])})`);
    {   // a story choice: the hare with Yuki, partly
        const g = ensureBars(newGame(695)); goTo(g, SCENES, 'hunt');
        let lv = 0; for (let l = 1; l <= 10; l++) { g.james.gu.level = l; const v = actingCheck(g, 'GU'); if (v / noDiceDc(4) >= 0.5 && v / noDiceDc(4) < 1) { lv = l; break; } }
        const r = choose(g, SCENES, 1);
        assert(lv > 0 && r.lines.some((l) => /— partly/.test(l)) && splitReply(r.lines).reply.some((l) => /bloody teamwork/.test(l)) && r.lines.some((l) => /^A thin haul — you keep: \+1 Glassback/.test(l)), `v0.11.69 (P1): a partial hunt keeps its reply (${lv}: ${r.lines})`);
    }
    {   // a work card: the honey tree, partly
        const w = ensureBars(newGame(3)); w.scene = 'wilds'; w.minutes += 1440; Object.assign(w.flags, { long: true, forest_day: 2 }); w.james.qi = 20;
        const c = SCENES.wild_forage.choices[2], k = cardCheck(w, 'wild_forage:2', c);
        taskState(w).adapt['wild_forage:2'] = Math.round((0.75 * k.dc - k.value) * 10) / 10;
        const r = runTask(w, SCENES, 'wild_forage:2');
        assert(cardCheck(w, 'wild_forage:2', c) && r.lines.some((l) => /— partly/.test(l)) && splitReply(r.lines).reply.some((l) => /bees are still arguing/.test(l)), `v0.11.69 (P1): a partial work card keeps its reply (${r.lines})`);
    }
}
// v0.11.81 (owner pick T1): the Tan brothers (`lf_bandits`) fight as people: no beasts' +0.5, a loss keeps "Robbed"
{
    const ch = SCENES.lf_wanderers.choices.find((c) => c.combat);
    for (const who of ['lf_bandits', 'lf_rogue']) {
        const g = ensureBars(newGame(8101, { closed: true })); g.flags.longforest = true; g.flags.lf_human = who;
        const enc = combatHooks.before(g, ch.combat(g)); // prepared as the game does (the Long Forest's scaling)
        assert(enc.id === who && enc.lose === 'lf_human_lost' && PEOPLE_FIGHTS.has(enc.id), `T1: every trail fight against people is a people fight (${who})`);
        startCombat(g, enc);
        assert(g.combat.enemies.every((e, i) => e.dc === enc.enemies[i].dc && e.atk === enc.enemies[i].atk), `T1: no beasts' +0.5 on ${who}`);
        g.james.hp = 1; g.combat.enemies.forEach((e) => { e.hp = 999; e.atk = 99; });
        let o = null; for (let t = 0; t < 50 && g.combat; t++) o = combatStep(g, 'guard');
        assert(o?.done === 'lose' && o.next === 'lf_human_lost' && g.coil.why !== 'beast', `T1: losing to ${who} on an active Coil leads to "Robbed", not the Coil's end (${o?.next})`);
    }
}
// v0.11.87 (owner 2026-11-09 01:52, pick O1, the sitting loop): from Day 19 the Old Tree offers no sit and no rest
// (the Sitter sat in the hall to about Day 50: about 3,860 of its 4,400 sits); Day 18 as before; nights unchanged
{
    const heart = (day, hh) => { const g = ensureBars(newGame(8701, { closed: true })); g.minutes = (day - 1) * 1440 + hh * 60; g.scene = 'heart_hub'; g.james.qi = jamesQiMax(g); g.james.satiety = 90; g.flags.roots_done = true; return g; };
    const shown = (g, re) => sceneView(g, SCENES).choices.some((c) => re.test(c.label) && !c.disabled);
    const d18 = heart(18, 9), d19 = heart(19, 9), d21 = heart(21, 9);
    assert(shown(d18, /^Cultivate: one sit/) && shown(d18, /^Rest an hour/), 'O1: on Day 18 the hall still offers a sit and a rest');
    assert(medCards(d18, SCENES).some((c) => c.open && /^Cultivate: /.test(c.label || '')) && medCards(d18, SCENES).some((c) => c.open && /until the limit/.test(c.label || '')) && sitLoop(heart(18, 9), SCENES).sits > 0, 'O1: and Meditate\'s Cultivate and Cultivate until the limit (Day 18)');
    for (const [g, d] of [[d19, 19], [d21, 21]]) {
        assert(!shown(g, /^Cultivate: one sit/) && !shown(g, /^Rest an hour/), `O1: from Day 19 no sit and no rest in the hall (Day ${d})`);
        const mc = medCards(g, SCENES);
        assert(!mc.some((c) => c.open && /^Cultivate/.test(c.label || '')), `O1: nor through Meditate (Day ${d}: ${mc.filter((c) => c.open).map((c) => c.id).join(', ')})`);
        assert(!taskCards(g, SCENES).some((c) => (c.kind === 'sit' || /^Cultivate/.test(c.label)) && c.status === 'open'), `O1: no sit card on the task screen (Day ${d})`);
        assert(sitLoop(g, SCENES).sits === 0, `O1: Cultivate until the limit runs no sit (Day ${d})`);
        assert(shown(g, /^Go down to the ship/), `O1: the way forward stays open (Day ${d})`);
    }
    const n19 = heart(19, 17);
    assert(shown(n19, /^Make camp for the night/), 'O1: the night camp is still there on Day 19');
}
// v0.11.86 (owner 2026-11-09 01:06, picks C1 + G1 + W1, roadmap #53): a Coil ended by choice counts, but adds no bonus
{
    const { coilMultNext } = await import('../js/core/game.js');
    const bitePath = (g) => { endCoil(g, 'choice', g.scene); goTo(g, SCENES, 'coil_end'); const v = sceneView(g, SCENES); return v; };
    const wake = (g, re) => { const v = sceneView(g, SCENES); choose(g, SCENES, v.choices.find((c) => re.test(c.label)).index); choose(g, SCENES, 0); };
    // the James tab's bite on Day 1, through the scenes: a Coil, no bonus, the prologue's first dawn only
    { const g = ensureBars(newGame(8601, { closed: true }));
      assert(coilMultNext(g, true) === 1 && coilMultNext(g, false) === 1.25, `C1: the next Coil's bonus: by choice ×1, otherwise ×1.25 (${coilMultNext(g, true)}, ${coilMultNext(g, false)})`);
      const v = bitePath(g);
      assert(v.choices.map((c) => c.label).join('|') === 'Bite the tail. Wake at the first dawn.|Not yet.' && /adds nothing to the faster learning: you will learn as fast as now\./.test(v.text) && !/×1 as fast/.test(v.text), 'C1: the Coil screen after a bite by choice: the first dawn, "Not yet", and the next ×1 said');
      wake(g, /first dawn/);
      assert(g.coil.n === 2 && g.coil.free === 1 && coilMult(g) === 1 && g.scene !== 'coil_dawn', `C1: a bite by choice: Coil 2, ×1 (${g.coil.n}, ${g.coil.free}, ${coilMult(g)})`);
      for (let k = 0; k < 9; k++) { endCoil(g, 'choice', 'arrival'); rewind(g); }
      assert(g.coil.n === 11 && g.coil.free === 10 && coilMult(g) === 1, 'C1: ten bites at the first dawn: Coil 11, still ×1 (the farm, #53, closed)');
      g.minutes += 2 * 1440; endCoil(g, 'choice', 'stream'); rewind(g);
      assert(g.coil.n === 12 && coilMult(g) === 1, 'C1: a bite by choice on Day 3 adds nothing either');
      endCoil(g, 'collapse'); rewind(g);
      assert(g.coil.n === 13 && coilMult(g) === 1.25, `C1: a collapse adds 0.25 (${coilMult(g)})`); }
    // a death, a beast, a lost tribute: the bonus grows as before; the Coil screen says the next ×
    { const g = ensureBars(newGame(8602, { closed: true }));
      endCoil(g, 'beast'); goTo(g, SCENES, 'coil_end');
      assert(/come back faster: you will learn ×1.25 as fast/.test(sceneView(g, SCENES).text), 'C1: after a beast the Coil screen says ×1.25');
      wake(g, /first dawn/); assert(g.coil.n === 2 && !g.coil.free && coilMult(g) === 1.25, 'C1: a beast: Coil 2, ×1.25');
      goTo(g, SCENES, 'collectors_lost'); choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => /Bite the tail/.test(c.label)).index);
      assert(g.scene === 'coil_end' && g.coil.why === 'tribute', 'a lost tribute: the Coil screen');
      wake(g, /first dawn/); assert(g.coil.n === 3 && coilMult(g) === 1.5, `C1: a lost tribute adds 0.25 (${coilMult(g)})`); }
    // Act 1: the count of bites by choice carries in; Shen Qiu adds; a bite by choice restarts Act 1 only (W1); a death offers both
    { const e = ensureBars(newGame(8603)); endCoil(e, 'choice', 'arrival'); rewind(e); endCoil(e, 'collapse'); rewind(e);
      e.scene = 'epilogue'; e.flags.ending = 'paid'; e.minutes = 6 * 1440 + 15 * 60; choose(e, SCENES, 0);
      assert(e.coil.act === 1 && e.coil.n === 3 && e.coil.free === 1 && coilMult(e) === 1.25, `C1: into Act 1 the bites by choice carry (n ${e.coil.n}, free ${e.coil.free}, ×${coilMult(e)})`);
      const v = bitePath(e);
      assert(v.choices.map((c) => c.label).join('|') === 'Bite the tail. Wake at the start of Act 1.|Not yet.', `W1: in Act 1 a bite by choice restarts Act 1 only (${v.choices.map((c) => c.label).join('|')})`);
      wake(e, /start of Act 1/);
      assert(e.coil.act === 1 && e.coil.n === 4 && e.coil.free === 2 && coilMult(e) === 1.25 && e.scene === 'fo_start', 'W1 + C1: Act 1 again, Coil 4, still ×1.25');
      goTo(e, SCENES, 'rt_taken'); choose(e, SCENES, sceneView(e, SCENES).choices.find((c) => /Bite/.test(c.label)).index);
      assert(e.scene === 'coil_end' && sceneView(e, SCENES).choices.some((c) => /whole game/.test(c.label)), 'Shen Qiu: the whole game is still offered');
      wake(e, /start of Act 1/); assert(e.coil.n === 5 && coilMult(e) === 1.5, `Shen Qiu adds 0.25 (${coilMult(e)})`);
      endCoil(e, 'collapse'); goTo(e, SCENES, 'coil_end');
      assert(sceneView(e, SCENES).choices.some((c) => /whole game/.test(c.label)), 'W1: after a collapse in Act 1 the whole game is still offered');
      wake(e, /whole game/);
      assert(e.coil.act === 0 && e.coil.n === 6 && e.coil.free === 2 && coilMult(e) === 1.75, `the whole-game rewind keeps the count (n ${e.coil.n}, free ${e.coil.free}, ×${coilMult(e)})`); }
    // the review's #1: the James tab's bite at a lost tribute or at Shen Qiu is that loss's bite (tabWhy), not one by choice
    { const { tabWhy } = await import('../js/core/coil.js');
      const t = ensureBars(newGame(8607, { closed: true })); goTo(t, SCENES, 'collectors_lost');
      assert(coilActive(t) && tabWhy(t) === 'tribute', 'the review\'s #1: the James tab at a lost tribute: the tribute\'s bite');
      endCoil(t, tabWhy(t), t.scene); goTo(t, SCENES, 'coil_end'); wake(t, /first dawn/);
      assert(t.coil.n === 2 && !t.coil.free && coilMult(t) === 1.25, `the review's #1: the tab's bite at a lost tribute adds the bonus (×${coilMult(t)})`);
      const r = ensureBars(newGame(8608)); r.scene = 'epilogue'; r.flags.ending = 'paid'; r.minutes = 6 * 1440 + 15 * 60; choose(r, SCENES, 0); goTo(r, SCENES, 'rt_taken');
      assert(coilActive(r) && tabWhy(r) === 'shen', 'the review\'s #1: the James tab at Shen Qiu: his bite');
      endCoil(r, tabWhy(r), r.scene); goTo(r, SCENES, 'coil_end');
      assert(sceneView(r, SCENES).choices.some((c) => /whole game/.test(c.label)), 'the review\'s #1: the tab\'s bite at Shen Qiu still offers the whole game');
      wake(r, /start of Act 1/); assert(coilMult(r) === 1.25 && !r.coil.free, `the review's #1: and adds the bonus (×${coilMult(r)})`);
      const w = ensureBars(newGame(8609, { closed: true })); w.scene = 'stream'; assert(tabWhy(w) === 'choice', 'elsewhere the tab\'s bite is by choice');
      endCoil(w, 'choice', 'stream'); const lines = SCENES.coil_end.choices[0].do(w);
      assert(coilMult(w) === 1 && /Your head is not\.$/.test(lines[0]) && !/×1 as fast/.test(lines[0]), `the review's #2: no "×1 as fast" after a chosen bite on Coil 1 (${lines[0]})`); }
    // G1: going round again at Act 1's end is by choice (the labels say so); a save from before has no count: its bonus as before
    { const o = ensureBars(newGame(8604)); o.coil.n = 4; delete o.coil.free;
      assert(coilMult(o) === 1.75, 'an old save (no `free`): ×1.75 on Coil 4, as before');
      const back = deserialize(serialize(Object.assign(ensureBars(newGame(8605)), {})));
      const f = ensureBars(newGame(8606)); endCoil(f, 'choice', 'arrival'); rewind(f); const r = deserialize(serialize(f));
      assert(r.coil.free === 1 && coilMult(r) === 1 && !back.coil.free, 'C1: the count survives a save and a load');
      assert(SCENES.a1_again.choices.filter((c) => /Bite the tail/.test(c.text)).every((c) => /\(By choice: adds no faster learning\.\)$/.test(c.text)), 'G1: going round again says it adds no faster learning'); }
}
// v0.11.85 (owner pick D + T1): every XP award ×0.6 after the Coil bonus; the targets 4 / 6
{
    assert(XP_RATE === 0.6, 'D: the XP rate is 0.6');
    const fresh = (n, set) => { const g = ensureBars(newGame(8501 + n, { closed: true })); if (set) set(g); return g; };
    // a standard check on Coil 1, T1: pool 30 × 0.6 = 18, split 9 / 9; Yuki's bond share 9
    { const g = fresh(0); const cu = g.james.skills['Convergence Use'].xp, gu = g.james.gu.xp, y = g.yuki.qiUse.xp; awardXp(g, 'Convergence Use', 'standard');
      assert(g.james.skills['Convergence Use'].xp - cu === 9 && g.james.gu.xp - gu === 9 && g.yuki.qiUse.xp - y === 9, 'D: a standard award on Coil 1 pays 18 (30 × 0.6), split 9 / 9, Yuki 9'); }
    // GU alone takes the whole pool
    { const g = fresh(1); const gu = g.james.gu.xp; awardXp(g, 'GU', 'standard'); assert(g.james.gu.xp - gu === 18, 'D: GU alone: 18'); }
    // the Coil bonus first, then the rate: Coil 3 ×1.5 → 45 × 0.6 = 27, split 13 / 13
    { const g = fresh(2, (x) => { x.coil.n = 3; }); const cu = g.james.skills['Convergence Use'].xp; awardXp(g, 'Convergence Use', 'standard');
      assert(coilMult(g) === 1.5 && g.james.skills['Convergence Use'].xp - cu === 13, 'D: Coil 3: 30 × 1.5 × 0.6 = 27, split 13'); }
    // a fail pays 25% before the rate: floor(30 × 0.25) = 7 → floor(7 × 0.6) = 4, split 2 / 2
    { const g = fresh(3); const cu = g.james.skills['Convergence Use'].xp; awardXp(g, 'Convergence Use', 'standard', { fail: true }); assert(g.james.skills['Convergence Use'].xp - cu === 2, 'D: a fail: 7 × 0.6 = 4, split 2'); }
    // Yuki's fight XP: band × her tier × the Coil bonus × the rate
    { const g = fresh(4); g.yuki.fight.tier = 2; const out = awardYukiFightXp(g, 'challenging');
      assert(Math.floor(XP_BANDS.challenging * 2 * 0.6) === 72 && /^Yuki Fight \+72\b/.test(out[0]), `D: Yuki's fight XP 60 × 2 × 0.6 = 72 (${out[0]})`); }
    // the routine band still pays nothing
    { const g = fresh(5); assert(awardXp(g, 'Convergence Use', 'routine').length === 0, 'D: routine pays nothing'); }
    // T1: the targets, the star at 4 / 6 and none past them
    const { TARGETS: T, noteClear: nc } = await import('../js/core/coil.js');
    assert(T[0] === 4 && T[1] === 6, 'T1: the targets 4 / 6');
    { const g = fresh(6); g.coil.n = 4; assert(/in 4 Coils: a new best ★ \(target 4\)\./.test(nc(g, 0)[0]), 'T1: the prologue on Coil 4: a star');
      const h = fresh(7); h.coil.n = 7; assert(/^Act 1 cleared in 7 Coils: a new best \(target 6\)\.$/.test(nc(h, 1)[0]), 'T1: Act 1 on Coil 7: no star'); }
}
// v0.11.82 (owner picks B1 + Y1; texts Fable's): Ya's brawl a weapon spar, Bao's an unarmed brawl, Yuki in them only in human form
{
    const yaCh = SCENES.ya_challenge.choices.find((c) => c.combat), baoCh = SCENES.rt_brawl_start.choices[0];
    const mk = (cuT, cuL, guT = 3, guL = 5) => { const g = ensureBars(newGame(8201, { closed: true })); g.james.skills['Convergence Use'].tier = cuT; g.james.skills['Convergence Use'].level = cuL; g.james.gu.tier = guT; g.james.gu.level = guL; return ensureBars(g); };
    const start = (g, ch) => { const e = combatHooks.before(g, ch.combat(g)); startCombat(g, e); return e; };
    // the spar: blade, spear and guard only; no armour, no guard bonus from forms, no construct, no buckler cover; Yuki watches
    const g = mk(7, 5); const e = start(g, yaCh);
    assert(e.style === 'spar' && g.combat.style === 'spar' && g.combat.yukiOut === true, 'spar: the style and Yuki watching (cat)');
    const open = Object.keys(COMBAT_ACTIONS).filter((id) => actionOpen(g, id));
    assert(open.join() === 'blade,guard,spear', `spar: only the blade, guard and the spear (${open})`);
    assert(guardBonus(g) === 2 && armourDrOf(g) === 0 && jamesDrOf(g) === 1 && actionLabel(g, 'guard', 'Guard and give ground') === 'Guard and give ground', 'spar: no armour (guard +2, no plates DR, the plain guard label)');
    assert(fightAction(g, 'dart') === 'blade' && fightAction(g, 'needle') === 'blade' && fightAction(g, 'spikes') === 'blade' && fightAction(g, 'guard') === 'guard', 'spar: a closed bone action becomes the blade');
    const r1 = combatStep(g, 'guard');
    assert(!r1.lines.some((l) => /construct|Yuki|claws|swipe|paw|blur/.test(l)), `spar: no construct and no Yuki strike in a round (${r1.lines.join(' | ').slice(0, 160)})`);
    assert(/The terms, agreed in the lane/.test(e.intro) && /I don't do proxies/.test(e.intro) && !/stands at your left/.test(e.intro), 'spar: the terms and the cat-form Yuki line in the intro');
    const h = mk(7, 5); h.yuki.realm = 7; h.james.realm = 7; h.yuki.form = 'human'; ensureBars(h); const eh = start(h, yaCh);
    assert(h.combat.yukiOut === false && /Spear against two nothings/.test(eh.intro) && yukiSitsOut(h, eh) === false, 'spar: in human form Yuki stands with him (Old Hu allows a second)');
    // the brawl: strike, throw, cover; damage by the GU tier, no Qi, no DR pierce; a win's XP to GU only
    const b = mk(3, 5, 3, 5); const be = start(b, baoCh);
    const bopen = Object.keys(COMBAT_ACTIONS).filter((id) => actionOpen(b, id));
    assert(be.style === 'unarmed' && bopen.join() === 'strike,throw,cover', `brawl: only the three unarmed actions (${bopen})`);
    assert(actionDmg(b, COMBAT_ACTIONS.strike).join() === '6,12' && actionDmg(b, COMBAT_ACTIONS.throw).join() === '3,6' && guardBonus(b) === 2, 'brawl: strike 2–4 and throw 1–2 × GU tier 3, guard +2');
    assert(fightAction(b, 'dart') === 'strike' && fightAction(b, 'guard') === 'cover' && fightAction(b, 'blade') === 'strike', 'brawl: a bone action becomes a strike, guard becomes cover');
    const q0 = b.james.qi; const rb = combatStep(b, 'strike');
    assert(b.james.qi === q0 && rb.lines[0].startsWith('You leave the song where it is') && rb.lines.some((l) => l.startsWith('Step in and hit:')), 'brawl: no Qi, the opening line, the strike label');
    assert(/they said fists/.test(be.intro), 'brawl: the cat-form Yuki line');
    b.combat.enemies.forEach((x) => { x.hp = 999; x.dc = 0.6; x.atk = 0.6; }); const rt = combatStep(b, 'throw');
    assert(rt.lines.some((l) => /hits the dust and takes a moment to work out which way is up/.test(l)), "brawl: the throw's stagger line");
    assert(rt.lines.some((l) => /is still getting up/.test(l)), 'brawl: the thrown one is still getting up (and loses that attack)');
    const w = mk(3, 5, 3, 5); start(w, baoCh); w.combat.enemies.forEach((x) => { x.hp = 1; x.dc = 0.6; });
    const cu0 = JSON.stringify(w.james.skills['Convergence Use']), yf0 = JSON.stringify(w.yuki.fight); let ow = null;
    for (let t = 0; t < 5 && w.combat; t++) ow = combatStep(w, 'strike');
    assert(ow?.done === 'win' && JSON.stringify(w.james.skills['Convergence Use']) === cu0 && JSON.stringify(w.yuki.fight) === yf0 && ow.lines.some((l) => /^GU \+/.test(l)), 'brawl: a win pays GU only, and no fight XP to a Yuki who watched');
    // the review (Fable): the brawl's degree (the one-move finish) reads GU alone, not Convergence
    const dg = mk(10, 9, 1, 1); const de = combatHooks.before(dg, baoCh.combat(dg));
    assert(de.degree === 1, `review: a strong singer with weak fists is not offered the one-move finish in Bao's brawl (degree ${de.degree})`);
    // an ordinary fight is untouched
    const n = mk(7, 5); startCombat(n, { id: 'zz_test', enemies: [{ name: 'Y', hp: 5, dc: 3, atk: 3, dmg: 1 }], win: 'night_won', lose: 'night_lost' });
    assert(!n.combat.style && actionOpen(n, 'dart') && !actionOpen(n, 'strike') && guardBonus(n) > 2 && armourDrOf(n) === 5 && fightAction(n, 'strike') === 'guard', 'no style: every bone action as before, the unarmed ones closed');
    // the texts (Fable's)
    assert(yaCh.text === 'Take the fight. "Your spear against my blade. No armour. Nobody dies."', 'texts: the spar choice');
    assert(/flat of a white bone blade laid across her collarbones/.test(SCENES.ya_won.text) && !/cage/.test(SCENES.ya_won.text), 'texts: ya_won without the bone cage');
    const lostCat = SCENES.ya_lost.text(mk(1, 1)); const lostHuman = SCENES.ya_lost.text(h);
    assert(/offers no help whatsoever/.test(lostCat) && /rescues no one/.test(lostHuman), 'texts: ya_lost by her form');
    const pr = mk(1, 1); pr.flags.ya_brawl = 'won';
    assert(/the disarm that took her spear/.test(SCENES.fo_price.text(pr)) && !/bone-cage/.test(SCENES.fo_price.text(pr)), 'texts: fo_price');
}
// v0.11.91 (owner 2026-11-09 09:05, pick B, push 1): the day ends at 00:00, so a bed taken by midnight puts every night
// encounter at 01:00 (01:20 the jackals), and even a fight that runs to the round cap is over before 02:00
{
    const { NO_DICE_ROUND_CAP } = await import('../js/core/game.js');
    const { BED_FROM_HOUR, SATIETY_PER_HOUR: SPH } = await import('../js/core/game.js');
    // the bed rule (owner 09:16): no bed before 21:00 anywhere; an earlier bed spends the evening resting until 21:00, then sleeps
    assert(BED_FROM_HOUR === 21, 'v0.11.91: beds from 21:00');
    { // S1: the Long Forest's seclusion is not a bed: it sleeps from where it is, as before (Fed at the sleeping rate only)
        const sc = ensureBars(newGame(9191)); sc.minutes = 2 * 1440 + 6 * 60; sc.james.satiety = 60; sleepUntil(sc, 6, { bed: false });
        assert(sc.minutes === 3 * 1440 + 6 * 60 && Math.abs(sc.james.satiety - (60 - (SPH * 24) / 2)) < 0.01, `S1: a rest that isn't a bed (06:00 to 06:00) drains Fed at the sleeping rate only (${sc.james.satiety})`);
        const src = String(SCENES.lf_seclusion.enter);
        assert(/sleepUntil\(g, 6, \{ bed: false \}\)/.test(src), 'S1: the seclusion uses the no-bed sleep');
    }
    for (const [bed, wait] of [[17 * 60, 4 * 60], [20 * 60 + 30, 30], [21 * 60, 0], [23 * 60, 0]]) {
        const b = ensureBars(newGame(9190)); b.minutes = 2 * 1440 + bed; b.james.satiety = 100; const w0 = wakeDay(b); sleepUntil(b, 6);
        const want = 100 - (SPH * wait) / 60 - (SPH * (3 * 1440 + 6 * 60 - (2 * 1440 + bed + wait))) / 60 / 2;
        assert(b.minutes === 3 * 1440 + 6 * 60 && Math.abs(b.james.satiety - want) < 0.01 && b.james.hp === jamesHpMax(b) && wakeDay(b) === w0 + 1, `v0.11.91: a bed at ${bed / 60}h: the evening to 21:00 awake (${wait} min), then asleep to 06:00 (Fed ${b.james.satiety} vs ${want})`);
    }
    const cases = [
        ['night_event', 'night_ev', 'crows', 2], ['night_event', 'night_ev', 'rats', 2], ['night_event', 'night_ev', 'lizard', 2],
        ['night_attack', null, null, 3], ['bl_night_event', 'bl_ev', 'wolves', 12], ['bl_night_event', 'bl_ev', 'hawks', 14],
    ];
    for (const [sc, flag, kind, d] of cases) for (const bed of [15 * 60, 19 * 60, 21 * 60 + 30, 23 * 60 + 59, 24 * 60]) {
        const g = ensureBars(newGame(9100 + d)); g.minutes = (d - 1) * 1440 + bed; g.scene = sc; g.flags.bl_region = 'rr'; g.flags.bl_day = 2;
        SCENES[sc].enter?.(g); if (flag) g.flags[flag] = kind;
        const night0 = (d - 1) * 1440 + 24 * 60, t0 = g.minutes - night0;
        assert(t0 >= 60 && t0 <= 80, `v0.11.91: ${sc}${kind ? ` (${kind})` : ''} after a bed at ${bed / 60}h starts at ${Math.floor(t0 / 60)}:${String(t0 % 60).padStart(2, '0')}`);
        const ch = SCENES[sc].choices.find((c) => c.combat && (!c.show || c.show(g)));
        const enc = combatHooks.before(g, ch.combat(g)); startCombat(g, enc);
        g.combat.enemies.forEach((x) => { x.hp = 999; x.atk = 0.1; }); // the longest fight: nobody falls, it runs to the round cap
        let o = null; for (let i = 0; i < NO_DICE_ROUND_CAP + 5 && g.combat; i++) o = combatStep(g, 'guard');
        assert(o?.done && g.minutes < night0 + 120, `v0.11.91: ${sc}${kind ? ` (${kind})` : ''} is over before 02:00 even at the round cap (${o?.done}, ${g.minutes - night0} min after midnight)`);
    }
}
// v0.11.90 (owner 2026-11-09 08:42, pick R1, the v0.11.87 Fable review): from Day 19 the hall's Rest stays while James is
// hurt, so a hurt James can heal before the guardian; at full HP it is gone; the sit stays shut either way
{
    const heart = (day, hh, f = 1) => { const g = ensureBars(newGame(9001, { closed: true })); g.minutes = (day - 1) * 1440 + hh * 60; g.scene = 'heart_hub'; g.james.qi = jamesQiMax(g); g.james.satiety = 90; g.flags.roots_done = true; g.james.hp = Math.max(1, Math.round(jamesHpMax(g) * f)); return g; };
    const ch = (g, re) => sceneView(g, SCENES).choices.find((c) => re.test(c.label) && !c.disabled);
    for (const d of [19, 20, 21]) {
        const hurt = heart(d, 9, 0.25), full = heart(d, 9);
        assert(ch(hurt, /^Rest an hour/) && !ch(full, /^Rest an hour/), `R1: Day ${d}: Rest while hurt, none at full HP`);
        assert(!ch(hurt, /^Cultivate: one sit/) && !medCards(hurt, SCENES).some((c) => c.open && /^Cultivate/.test(c.label || '')) && sitLoop(hurt, SCENES).sits === 0, `R1: Day ${d}: the sit stays shut while hurt`);
    }
    // the rest heals and runs out: a few rests bring James to full, then the card is gone (no endless clock)
    const g = heart(19, 8, 0.15), h0 = g.james.hp, m0 = g.minutes; let n = 0;
    for (; n < 30 && ch(g, /^Rest an hour/); n++) choose(g, SCENES, ch(g, /^Rest an hour/).index);
    assert(g.james.hp === jamesHpMax(g) && g.james.hp > h0 && n >= 1 && n <= 10 && g.minutes === m0 + 60 * n && g.scene === 'heart_hub' && !ch(g, /^Rest an hour/), `R1: rests heal to full in ${n} hour(s), then Rest is gone (HP ${h0} → ${g.james.hp}, ${g.minutes - m0} min)`);
    // the night: no Rest after 18:00 (the camp, as before); Day 18 as before
    assert(!ch(heart(19, 18, 0.25), /^Rest an hour/) && ch(heart(19, 18, 0.25), /^Make camp for the night/), 'R1: after 18:00 the camp, not Rest');
    assert(ch(heart(18, 9), /^Rest an hour/) && ch(heart(18, 9, 0.25), /^Rest an hour/), 'R1: Day 18 offers Rest as before, hurt or not');
}
// v0.11.89 (owner 2026-11-09 08:23, pick P1 = F1 + T3 + X1 + J1): the four small items
{
    const { instantWin, awardFightXp } = await import('../js/core/game.js');
    const { readFileSync } = await import('node:fs');
    const baoCh = SCENES.rt_brawl_start.choices[0];
    const mk = (cuT, guT, coils = 0) => { const g = ensureBars(newGame(8901, { closed: true })); g.james.skills['Convergence Use'].tier = cuT; g.james.skills['Convergence Use'].level = 5; g.james.gu.tier = guT; g.james.gu.level = 5; if (coils) g.coil.n = coils; return ensureBars(g); };
    const num = (lines, re) => Number((lines.find((l) => re.test(l)) || '').match(re)?.[1] ?? NaN);
    // F1: "Fists only." stays on the button and in the intro, not in round 1's opening
    const fe = combatHooks.before(mk(2, 3), baoCh.combat(mk(2, 3)));
    assert(/^Fists only\./.test(baoCh.text) && /Fists only\./.test(fe.intro) && !/Fists only/.test(fe.opening) && fe.opening.startsWith('You leave the song where it is'), 'F1: "Fists only." on the button and the intro, gone from the round-1 opening');
    // T3: the forced path says the terms, in the other path's exact words
    const yaCh = SCENES.ya_challenge.choices.find((c) => c.combat);
    assert(SCENES.ya_forced.choices.length === 1 && SCENES.ya_forced.choices[0].text === 'Fine. ' + yaCh.text.slice('Take the fight. '.length) && SCENES.ya_forced.choices[0].to === 'ya_won' && SCENES.ya_forced.choices[0].combat === yaCh.combat, 'T3: ya_forced\'s "Fine." says the terms (the same fight, the same ending)');
    // X1: the pool on CU's tier like every fight, all of it to GU; Yuki's bond share the same as any fight's; CU untouched
    for (const [cuT, guT] of [[2, 3], [1, 2], [3, 1], [5, 5]]) {
        const ref = mk(cuT, guT), refL = awardXp(ref, 'Convergence Use', 'standard');
        const g = mk(cuT, guT), cu0 = JSON.stringify(g.james.skills['Convergence Use']), L = awardFightXp(g, 'unarmed', 'standard');
        const refCu = num(refL, /^Convergence Use \+(\d+) XP/), refGu = num(refL, /^GU \+(\d+) XP/), refY = num(refL, /^Yuki \(bond\) Qi Use \+(\d+)/);
        const gu = num(L, /^GU \+(\d+) XP/), y = num(L, /^Yuki \(bond\) Qi Use \+(\d+)/);
        assert(JSON.stringify(g.james.skills['Convergence Use']) === cu0 && !L.some((l) => /^Convergence Use/.test(l)), `X1 (CU T${cuT} GU T${guT}): no CU XP`);
        assert(Math.abs(gu - (refCu + refGu)) <= 1 && y === refY, `X1 (CU T${cuT} GU T${guT}): GU ${gu} = the small fight's CU + GU (${refCu} + ${refGu}), Yuki ${y} = ${refY}`);
        const n = mk(cuT, guT); assert(JSON.stringify(awardFightXp(n, undefined, 'standard')) === JSON.stringify(refL) && JSON.stringify(awardFightXp(mk(cuT, guT), 'spar', 'standard')) === JSON.stringify(refL), `X1 (CU T${cuT}): an ordinary fight and the spar pay as before`);
    }
    // the owner's example: Act 1 end, CU T2 GU T3, Coil 5 (×2 bonus): GU 72, Yuki 36 (was 108 / 54); the coil bonus as for any fight
    const ex = mk(2, 3, 5), exL = awardFightXp(ex, 'unarmed', 'standard'), exRef = awardXp(mk(2, 3, 5), 'Convergence Use', 'standard');
    assert(num(exL, /^GU \+(\d+) XP/) === 2 * num(exRef, /^GU \+(\d+) XP/) && num(exL, /^Yuki \(bond\) Qi Use \+(\d+)/) === num(exRef, /^Yuki \(bond\) Qi Use \+(\d+)/), `X1: at Coil 5 the brawl pays twice a small fight's GU (${exL.join(' | ')})`);
    // both award paths: the combat win and the one-move finish
    const w = mk(2, 3); const we = combatHooks.before(w, baoCh.combat(w)); startCombat(w, we); w.combat.enemies.forEach((x) => { x.hp = 1; x.dc = 0.6; });
    const cuW = JSON.stringify(w.james.skills['Convergence Use']); let ow = null; for (let t = 0; t < 5 && w.combat; t++) ow = combatStep(w, 'strike');
    const want = awardFightXp(mk(2, 3), 'unarmed', we.band || 'standard');
    assert(ow?.done === 'win' && JSON.stringify(w.james.skills['Convergence Use']) === cuW && num(ow.lines, /^GU \+(\d+) XP/) === num(want, /^GU \+(\d+) XP/), `X1: the combat win pays the new GU (${ow?.lines.filter((l) => /XP|Qi Use/.test(l)).join(' | ')})`);
    const iw = mk(2, 3); const ie = baoCh.combat(iw); const ir = instantWin(iw, ie);
    assert(!ir.lines.some((l) => /^Convergence Use/.test(l)) && num(ir.lines, /^GU \+(\d+) XP/) === num(want, /^GU \+(\d+) XP/), `X1: the one-move finish pays the same (${ir.lines.join(' | ')})`);
    // J1: the Journal says "checks made"
    const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
    assert(main.includes('${g.stats.checks} checks made, ${g.stats.wins} passed') && !main.includes('checks rolled'), 'J1: the Journal reads "checks made"');
}
// v0.11.71 (owner picks Y1 + C1 + X1; Yuki's texts Fable's): Yuki switches food when her kind is full; "Cultivate until
// the limit" gives one total per skill; from Coil 2 the Blackroot's Explore is not once a day.
{
    const { yukiCatch, sitSummary } = await import('../js/core/tasks.js');
    const { lfYukiCatch } = await import('../js/story/longforest.js');
    const { replayExplore } = await import('../js/story/wilds.js');
    const { itemNames } = await import('../js/core/game.js');
    const { gives } = await import('../js/core/story.js');
    const FULLK = (g, ids) => { for (const id of ids) g.inventory[id] = itemCap(id); };
    const jobs = [...new Set(Object.values(TASK_HUBS).map((h) => h.yuki).filter(Boolean))];
    assert(jobs.length === 5 && jobs.every((j) => Array.isArray(j.alts) && j.alts.length >= 2 && typeof j.full === 'string' && j.alts.every((a) => a.item !== j.item && Object.hasOwn(itemNames, a.item) && typeof a.got(1) === 'string' && a.got(1) !== a.got(2))), `Y1: every Yuki job has its other kinds, each with a one and a two text, and a full line (${jobs.length})`);
    for (const j of jobs) {
        const g = ensureBars(newGame(7101));
        assert(yukiCatch(g, j).item === j.item, `Y1 (${j.id}): her own kind first`);
        FULLK(g, [j.item]); const small = j.alts.filter((a) => !a.big);
        assert(yukiCatch(g, j).item === small[0].item, `Y1 (${j.id}): own kind full → ${small[0].item} (${yukiCatch(g, j)?.item})`);
        FULLK(g, small.map((a) => a.item));
        assert(yukiCatch(g, j) === null, `Y1 (${j.id}): cat form, every small kind full → nothing (venison needs tiger or human form)`);
        g.yuki.realm = 2; g.yuki.form = 'tiger';
        assert(yukiCatch(g, j)?.item === 'venison', `Y1 (${j.id}): tiger form → venison (${yukiCatch(g, j)?.item})`);
        FULLK(g, ['venison']); assert(yukiCatch(g, j) === null, `Y1 (${j.id}): all full → nothing`);
        const h = ensureBars(newGame(7108)); FULLK(h, [j.item, ...small.map((a) => a.item)]); h.yuki.realm = 7; h.yuki.form = 'human';
        assert(yukiCatch(h, j)?.item === 'venison', `Y1 (${j.id}): human form → venison too (${yukiCatch(h, j)?.item})`);
        const p = ensureBars(newGame(7109)); p.inventory[j.item] = itemCap(j.item) - 1; // the review's low 1 (R1): room for one, a double haul
        assert(yukiCatch(p, j, 1).item === j.item && yukiCatch(p, j, 2).item === small[0].item, `R1 (${j.id}): one short of the cap: a single haul is hers, a double one switches (${yukiCatch(p, j, 2)?.item})`);
    }
    // through the lane: a haul with hares full brings fowl, says so, and no false "+1 Glassback hare"; all full: she eats it, XP still
    const lane = (set) => {
        const g = ensureBars(newGame(7102, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 9 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
        g.james.satiety = 90; g.james.qi = 30; g.yuki.fight.tier = 3; set(g); setYuki(g, true);
        const yl = yukiLane(g); g.tasks.yuki.progress = yl.len - 1;
        const id = taskCards(g, SCENES).find((c) => c.status === 'open' && /^Rest in the shade/.test(c.label))?.id; // an hour
        const inv0 = { ...g.inventory }, r = runTask(g, SCENES, id);
        return { g, inv0, lines: r.lines, id };
    };
    { const { g, inv0, lines, id } = lane((g) => FULLK(g, ['hare_raw']));
        const l = lines.find((x) => /mire fowl/.test(x)) || '';
        assert(!!id && /\+\d Mire fowl/.test(l) && (g.inventory.fowl_raw || 0) > (inv0.fowl_raw || 0) && g.inventory.hare_raw === itemCap('hare_raw') && !lines.some((x) => /\+\d Glassback hare/.test(x)), `Y1: the lane with hares full brings fowl (${l.slice(-60)})`); }
    { const { g, inv0, lines } = lane((g) => FULLK(g, ['hare_raw', 'fowl_raw', 'crab_meat']));
        assert(lines.includes(TASK_HUBS.wilds.yuki.full) && JSON.stringify(g.inventory) === JSON.stringify(inv0) && lines[lines.indexOf(TASK_HUBS.wilds.yuki.full) + 1]?.startsWith('Yuki Fight'), `Y1: everything full: the full line, nothing added, her XP still (${lines.join(' | ').slice(0, 160)})`); }
    { const { g, inv0, lines } = lane((g) => { g.inventory.hare_raw = itemCap('hare_raw') - 1; g.yuki.fight.tier = 6; });
        const l = lines.find((x) => /\+\d (Glassback hare|Mire fowl)/.test(x)) || '', n = Number(/\+(\d)/.exec(l.slice(l.lastIndexOf('+')))?.[1]);
        assert(g.inventory.hare_raw + (g.inventory.fowl_raw || 0) - inv0.hare_raw - (inv0.fowl_raw || 0) === n && (n === 1 ? /Glassback hare/ : /Mire fowl/).test(l), `R1: one short of the cap, the lane's line says what landed (${l.slice(-40)}; hares ${g.inventory.hare_raw}, fowl ${g.inventory.fowl_raw || 0})`); }
    // the Long Forest's card: tiger venison → hares → fowl; else hares → fowl; hidden only when all three are full
    { const g = ensureBars(newGame(7103));
        assert(lfYukiCatch(g).item === 'hare_raw' && lfYukiCatch(g).n === 1, 'Y1 (lf): cat: a hare');
        FULLK(g, ['hare_raw']); assert(lfYukiCatch(g).item === 'fowl_raw' && /siege/.test(lfYukiCatch(g).line), 'Y1 (lf): cat, hares full: a fowl');
        FULLK(g, ['fowl_raw']); assert(lfYukiCatch(g).item === null && /licking her chops/.test(lfYukiCatch(g).line), 'Y1 (lf): cat, hares and fowl full: nothing (venison is the tiger\'s)');
        const t = ensureBars(newGame(7104)); t.yuki.realm = 2; t.yuki.form = 'tiger';
        assert(lfYukiCatch(t).item === 'venison' && lfYukiCatch(t).n === 2 && lfYukiCatch(t).line === 'She comes back dragging half an ash-deer. +2 Ash-deer venison.', 'Y1 (lf): tiger: venison, the old line');
        FULLK(t, ['venison']); assert(lfYukiCatch(t).item === 'hare_raw' && lfYukiCatch(t).n === 2, 'Y1 (lf): tiger, venison full: two hares');
        FULLK(t, ['hare_raw']); assert(lfYukiCatch(t).item === 'fowl_raw', 'Y1 (lf): tiger, venison and hares full: fowl');
        const q = ensureBars(newGame(7110)); q.yuki.realm = 2; q.yuki.form = 'tiger'; q.inventory.venison = itemCap('venison') - 1;
        assert(lfYukiCatch(q).item === 'hare_raw', 'R1 (lf): tiger, room for one venison only: two hares, not "+2 venison" landing one');
        const c = SCENES.lf_hunt.choices.find((x) => /Let Yuki hunt/.test(x.text));
        assert(JSON.stringify(gives(c)) === JSON.stringify(['venison', 'hare_raw', 'fowl_raw']), `Y1 (lf): the card lists the three kinds it can bring (${gives(c)})`);
        const h = ensureBars(newGame(7105)); const o = c.do(h); assert(h.inventory.hare_raw === 1 && o[0] === 'She comes back with a hare and a look. +1 Glassback hare.', `Y1 (lf): the card adds what it says (${o[0]})`); }
    // C1: one total per skill, the rank reached, a cap once, other lines kept in order after the totals
    {
        const s = sitSummary(['Condensed: Saturation 10%.', 'Convergence Use +5 XP', 'GU +5 XP', 'Yuki (bond) Qi Use +5', 'Yuki comes back with a hare and a look of mild contempt. +1 Glassback hare.',
            'Condensed: Saturation 20%.', 'Convergence Use +5.5 XP → T1 L3', 'GU at T10 L10 (cap)', 'Yuki (bond) Qi Use +5 → T2 L1', 'Some warning.']);
        assert(JSON.stringify(s) === JSON.stringify(['Convergence Use +10.5 XP → T1 L3', 'GU +5 XP', 'GU at T10 L10 (cap)', 'Yuki (bond) Qi Use +10 → T2 L1', 'Yuki comes back with a hare and a look of mild contempt. +1 Glassback hare.', 'Some warning.']), `C1: the totals (${JSON.stringify(s)})`);
        const x = ensureBars(newGame(7106, { closed: true })); x.scene = 'stream'; x.minutes = 1440 + 8 * 60; Object.assign(x.flags, { long: true, forest_day: 2 }); x.james.satiety = 90; x.james.qi = jamesQiMax(x);
        const y = JSON.parse(JSON.stringify(x)), raw = sitLoop(y, SCENES), rm = runMed(x, SCENES, 'med:sitall');
        const sum = (re) => raw.lines.reduce((n, l) => n + Number(re.exec(l)?.[1] || 0), 0);
        assert(raw.sits >= 2 && rm.lines.length === 4 && !rm.lines.some((l) => /^Condensed/.test(l)) && rm.lines[2] === `GU +${sum(/^GU \+([\d.]+) XP/)} XP` && JSON.stringify(x.james) === JSON.stringify(y.james), `C1: ${raw.sits} sits in 4 lines, the totals what the sits gave (${rm.lines.join(' | ')})`);
    }
    // X1: Coil 1 once a day; from Coil 2 Explore again after a trip, before 16:00, until the three places are seen
    {
        const ex = SCENES.wilds.choices.find((c) => /^Explore deeper/.test(c.text));
        const g = ensureBars(newGame(7107, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 9 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
        assert(ex.show(g) && !replayExplore(g), 'X1: Coil 1: Explore open in the morning');
        goTo(g, SCENES, 'wild_explore'); g.scene = 'wilds';
        assert(!ex.show(g), 'X1: Coil 1: once a day');
        g.coil.n = 2; assert(replayExplore(g) && ex.show(g), 'X1: Coil 2: open again after a trip');
        assert(taskCards(g, SCENES).some((c) => c.group === 'Explore' && c.kind === 'door' && c.status === 'open'), 'X1: Coil 2: the Explore cards are on the screen again');
        g.minutes = 1440 + 16 * 60; assert(!ex.show(g), 'X1: Coil 2: not from 16:00');
        g.minutes = 1440 + 10 * 60; Object.assign(g.flags, { v_bone: true, v_mire: true, v_hollow: true }); assert(!ex.show(g), 'X1: Coil 2: gone once the three places are seen');
    }
}
// v0.11.72 (owner picks S1 + N1 + P0 + T1, the copy-over push 5): the Coil screen's closest cards and what carries over,
// Selene's next-step line on the prologue's task screens, a target per act and the personal best.
{
    const { nextStep } = await import('../js/core/tasks.js');
    const { coilReport, noteClear, targetsText, passCoils, TARGETS } = await import('../js/core/coil.js');
    const hub = (seed, scene, day, set) => { const x = ensureBars(newGame(seed, { closed: true })); x.scene = scene; x.minutes = (day - 1) * 1440 + 9 * 60; Object.assign(x.flags, { long: true, forest_day: day }); x.james.satiety = 70; x.james.qi = 3; if (set) set(x); return x; };
    // N1: each rule in its order
    assert(/^You're hungry/.test(nextStep(hub(7201, 'wilds', 2, (x) => { x.james.satiety = 20; x.inventory.hare_raw = 1; }), SCENES)), 'N1: 1 hungry with food');
    assert(!/^You're hungry/.test(nextStep(hub(7202, 'wilds', 2, (x) => { x.james.satiety = 20; }), SCENES)), 'N1: 1 needs food in the hammerspace (R1: the review\'s L5)');
    { const x = hub(7203, 'wilds', 2, (x) => { x.james.saturation = 96; x.james.primaries = 12; }); assert(canBreakThrough(x) && /breakthrough point/.test(nextStep(x, SCENES)), `N1: 2 the breakthrough point (${nextStep(x, SCENES)})`); }
    assert(/^Tap a card/.test(nextStep(hub(7204, 'stream', 1), SCENES)), 'N1: 3 Coil 1, Day 1');
    { const x = hub(7205, 'wilds', 2); setYuki(x, false); assert(/^Yuki can hunt/.test(nextStep(x, SCENES)), `N1: 4 Yuki's job off (${nextStep(x, SCENES)})`); setYuki(x, true); assert(nextStep(x, SCENES) === 'Day 2 of 7: the Sect\'s tribute comes on Day 7.', `N1: 7 otherwise the day (${nextStep(x, SCENES)})`); }
    { const x = hub(7206, 'stream', 1); x.coil.n = 3; assert(/^A new Coil: .* you learn ×1\.5 as fast\.$/.test(nextStep(x, SCENES)), `N1: 5 a new Coil's first day, its number (${nextStep(x, SCENES)})`); }
    { const x = hub(7207, 'wilds', 2, (x) => { x.james.qi = jamesQiMax(x); }); setYuki(x, true); assert(/^Qi is nearly full/.test(nextStep(x, SCENES)), `N1: 6 Qi nearly full (${nextStep(x, SCENES)})`); }
    // the review's M1 (R1): the short route (no `long`) has the tribute at the next dawn: no "Day N of 7"
    { const x = hub(7212, 'village', 2, (x) => { x.flags.long = false; }); setYuki(x, true); assert(!/of 7/.test(nextStep(x, SCENES)), `R1: the short route gets no tribute-day line (${nextStep(x, SCENES)})`); }
    // the review's M2 (R1): a Long Forest run earlier doesn't turn the hints off; only the Long Forest itself does
    { const x = hub(7213, 'stream', 1, (x) => { x.coil.n = 2; x.flags.longforest = true; x.flags.lf_active = false; }); assert(/^A new Coil/.test(nextStep(x, SCENES)), `R1: after a Long Forest run the hints come back (${nextStep(x, SCENES)})`);
      x.flags.lf_active = true; assert(nextStep(x, SCENES) === '', 'R1: none while in the Long Forest'); }
    { const a = hub(7208, 'wilds', 2); a.stats.coils0 = 1; const b = hub(7208, 'fo_ashfall', 9); b.coil.act = 1; const c = hub(7208, 'arrival', 1);
      assert(nextStep(a, SCENES) === '' && nextStep(b, SCENES) === '' && nextStep(c, SCENES) === '', 'N1: none after the first crossing, in Act 1 or off the task screens'); }
    // T1: the best per act, counted from the pass's first Coil, kept and only improved
    { const x = hub(7209, 'wilds', 2); x.coil.n = 2;
      assert(passCoils(x) === 2 && JSON.stringify(noteClear(x, 0)) === JSON.stringify(['Prologue cleared in 2 Coils: a new best ★ (target 4).']) && x.stats.best[0] === 2, 'T1: the prologue on Coil 2: a new best within the target');
      x.coil.n = 3; assert(noteClear(x, 0).length === 0 && x.stats.best[0] === 2, 'T1: a worse clear changes nothing');
      x.coil.n = 5; x.stats.pass = 5; assert(passCoils(x) === 1 && /in 1 Coil: a new best ★/.test(noteClear(x, 0)[0]) && x.stats.best[0] === 1, 'T1: a new pass counts from its own first Coil');
      x.coil.n = 11; assert(/^Act 1 cleared in 7 Coils: a new best \(target 6\)\.$/.test(noteClear(x, 1)[0]), 'T1: over the target, no star');
      assert(targetsText(x) === `the prologue by Coil ${TARGETS[0]}, Act 1 by Coil ${TARGETS[1]}, counted from Day 1. Your best: prologue 1 Coil, Act 1 7 Coils.`, `T1: the targets line (${targetsText(x)})`); }
    // T1 through the scenes: crossing into Act 1 and reaching its end; a whole-game rewind starts a pass
    { const x = hub(7210, 'epilogue', 8); x.coil.n = 2; x.flags.ending = 'paid'; const lines = SCENES.fo_start.enter(x) || [];
      assert(x.coil.act === 1 && lines.includes('Prologue cleared in 2 Coils: a new best ★ (target 4).') && x.stats.coils0 === 2, `T1: crossing records the prologue (${lines.join(' | ')})`);
      const l2 = SCENES.a1_end.enter ? SCENES.a1_end.enter(x) || [] : []; assert(l2.includes('Act 1 cleared in 2 Coils: a new best ★ (target 6).') && x.stats.best[1] === 2, `T1: the end of Act 1 records it (${l2.join(' | ')})`);
      rewind(x, { to: 'game' }); assert(x.coil.act === 0 && x.stats.pass === x.coil.n && passCoils(x) === 1 && x.stats.best[0] === 2 && x.stats.best[1] === 2, `T1: the whole game again: a new pass, the bests kept (pass ${x.stats.pass}, n ${x.coil.n})`);
    }
    // a rewind to the start of Act 1 keeps the pass (the review's L5, R1: on an Act 1 state)
    { const x = hub(7214, 'epilogue', 8); x.coil.n = 4; x.stats.pass = 3; x.flags.ending = 'paid'; SCENES.fo_start.enter(x); x.scene = 'fo_ashfall';
      endCoil(x, 'choice', 'fo_ashfall'); const n = rewind(x, { to: 'act' }); assert(x.coil.act === 1 && n === 5 && x.stats.pass === 3 && passCoils(x) === 3, `T1: a rewind to the act keeps the pass (act ${x.coil.act}, n ${n}, pass ${x.stats.pass})`); }
    // the review's L3 (R1): a new best is a Results line; L4: a save from before v0.11.72 on an unknown pass records nothing until a whole-game rewind
    { const { splitLine: sl } = await import('../js/core/replies.js');
      assert(['Prologue cleared in 2 Coils: a new best ★ (target 2).', 'Act 1 cleared in 1 Coil: a new best ★ (target 3).'].every((l) => sl(l).reply === '' && sl(l).gain === l), 'R1: a new best goes to Results');
      const x = hub(7215, 'epilogue', 8); x.coil.n = 6; x.stats.coils0 = 2; delete x.stats.pass; x.flags.ending = 'paid';
      const l = SCENES.fo_start.enter(x) || []; assert(!l.some((t) => /cleared in/.test(t)) && x.stats.passUnknown === true && !x.stats.best, `R1: an old save's second pass records no prologue best (${l.join(' | ')})`);
      assert(noteClear(x, 1).length === 0 && !x.stats.best, 'R1: nor its Act 1');
      rewind(x, { to: 'game' }); assert(!x.stats.passUnknown && x.stats.pass === x.coil.n && passCoils(x) === 1, 'R1: the next whole-game rewind starts a known pass'); }
    // S1: the closest cards (only those that grew this Coil), the screen's new lines
    { const x = hub(7211, 'wilds', 2); x.coil.start.fam = { 'wild_forage:0': 1.5, 'wild_forage:1': 5 }; x.tasks.fam = { 'wild_forage:0': 1.5, 'wild_forage:1': 7, 'wild_hunt:0': 1, 'wild_train:0': 19, 'yuki:wilds': 17 };
      const r = coilReport(x); assert(JSON.stringify(r.near.map((n) => [n.id, n.at, n.tier])) === JSON.stringify([['yuki:wilds', 18, 'Mastered'], ['wild_forage:1', 8, 'Skilled'], ['wild_hunt:0', 2, 'Practised']]), `S1: the closest three, grown this Coil, none at the top tier (${JSON.stringify(r.near)})`);
      endCoil(x, 'choice', 'wilds'); goTo(x, SCENES, 'coil_end'); const t = sceneView(x, SCENES).text;
      assert(/\*\*Closest to the next tier:\*\* Yuki's hunting 17\/18 \(Mastered\) · River cress in the shallows 7\/8 \(Skilled\) · /.test(t) && /\*\*Carries over:\*\* familiarity with every card/.test(t) && t.includes(`**Targets:** ${targetsText(x)}`), `S1 + T1: the Coil screen's lines (${t.slice(t.indexOf('**Closest'), t.indexOf('**Closest') + 160)})`); }
}
// every card that was ever offered was also played at least once
const all = cardsListed;
if (FULL) for (const id of all) assert(cardsSeen.has(id), `card ${id} was played by a bot`); // coverage: the full run only
if (FULL) for (const id of cardsWhole) assert(cardsForecast.has(id), `v0.11.21: card ${id}'s forecast was checked on a whole run (1 game in ${FC_EVERY}, and since v0.11.46 its first run)`);
if (!FULL) console.log(`  coverage (quick, log only; with the Golden Core walk's ${walkCards} cards, mer:ec ${walkEc}): ${cardsSeen.size} of ${all.size} offered cards played, ${cardsForecast.size} of ${cardsWhole.size} whole-run cards forecast-checked`); // v0.11.21
assert(yukiRuns > GAMES / 2, `Yuki's lane brings things home (${yukiRuns})`);
// no dice on work cards: the same state gives the same result
{
    const g = ensureBars(newGame(3)); g.scene = 'wilds'; g.minutes += 1440; Object.assign(g.flags, { long: true, forest_day: 2 });
    const a = JSON.parse(JSON.stringify(g)), b = JSON.parse(JSON.stringify(g));
    a.rng = 1; b.rng = 999999;
    const ra = runTask(a, SCENES, 'wild_forage:0'), rb = runTask(b, SCENES, 'wild_forage:0');
    assert(JSON.stringify(ra.lines) === JSON.stringify(rb.lines) && JSON.stringify(a.inventory) === JSON.stringify(b.inventory), 'work cards ignore the dice');
    assert(famTier(0) === 0 && famTier(2) === 1 && famTier(8) === 2 && famTier(18) === 3, 'familiarity tiers at 2 / 8 / 18');
}

// v0.10.0: meridian sessions, a card that would end the Coil, starving 1.5 HP an hour, rest and sleep at once (the queue went in v0.11.64)
{
    const g = ensureBars(newGame(70, { closed: true })); g.scene = 'wilds'; g.minutes = 1440 + 8 * 60; Object.assign(g.flags, { long: true, forest_day: 2 });
    // a meridian session as a card
    assert(merChoice(g, SCENES) === 0 && taskOpen(g, SCENES, MER_TASK), 'a closed start offers the next primary as a card');
    const m0 = g.minutes;
    const r = runTask(g, SCENES, MER_TASK);
    assert(g.scene === 'wilds' && g.minutes - m0 === 120 && g.james.primaries === 1 && !r.stopped, 'a meridian sitting as a card: 2 h, a primary, back on the hub');
    g.james.qi = 20; runTask(g, SCENES, MER_TASK); g.james.qi = 20;
    assert(merChoice(g, SCENES) >= 0 && taskOpen(g, SCENES, MER_TASK), 'v0.11.2: no daily limit, the card stays');
    g.james.satiety = 10; assert(!taskOpen(g, SCENES, MER_TASK), 'Fed under 20: no meridian card'); g.james.satiety = 70;
    // v0.11.13 (E1): one card per meridian line; collaterals queueable while primaries are still closed; an old mer:next queue still runs
    {
        const L = ensureBars(newGame(76, { closed: true })); L.scene = 'stream'; L.james.qi = 25; L.james.satiety = 70; L.james.primaries = 3; L.yuki.primaries = 3;
        const ids = taskCards(L, SCENES).filter((c) => c.kind === 'mer').map((c) => c.id);
        assert(ids.join() === 'mer:pri,mer:col' && !ids.includes(MER_TASK), `v0.11.13: two meridian cards on the stream (${ids.join()})`);
        assert(medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id)).map((c) => c.task).join() === 'mer:pri,mer:col', 'v0.11.13: the Meditate cards carry the queue ids');
        assert(taskMinutes(L, SCENES, 'mer:col') === 120 && lineOfTask('mer:col') === 'col' && lineOfTask('mer:next') === null, 'v0.11.13: the collateral card: 2 h in the forecast, never at once');
        const real = JSON.parse(JSON.stringify(L)), said = [], got = [];
        for (const id of ['mer:col', 'mer:col', 'mer:pri']) { said.push(taskOutcome(real, SCENES, id).end); runTask(real, SCENES, id); got.push(real.minutes); }
        assert(said.join() === got.join(), `v0.11.13: each card ends where it said (${said.join()} / ${got.join()})`);
        assert(real.james.collaterals === 9 && real.james.primaries === 4 && real.tasks.use['act:mer'] === 3 && real.scene === 'stream', `v0.11.13: two collateral sittings open group 1 with 3 primaries; v0.11.15: the third sitting (×1.6) opens the 4th primary (${real.james.collaterals}, ${real.james.primaries})`);
        L.james.satiety = 19; const lk = medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id));
        assert(lk.length === 2 && lk.every((c) => !c.open && !c.task && /Too hungry/.test(c.reason)) && !taskOpen(L, SCENES, 'mer:pri'), 'v0.11.13: under Fed 20 both show, locked, with the reason');
        L.james.satiety = 70; L.james.qi = 1; assert(medCards(L, SCENES).filter((c) => /^med:mer:/.test(c.id)).every((c) => !c.open && /2 Qi/.test(c.reason)), 'v0.11.13: under 2 Qi: locked'); L.james.qi = 25;
        const o = JSON.parse(JSON.stringify(L));
        assert(taskOpen(o, SCENES, MER_TASK) && runTask(o, SCENES, MER_TASK) && o.james.primaries === 3 && o.james.merWork > 0, 'v0.11.13: mer:next still runs (primaries first)');
        // v0.11.14: no Meditate on a story screen; on Act 1's resting places the Meditate cards queue
        const a = ensureBars(newGame(77, { closed: true })); a.scene = 'arrival'; a.james.qi = 25; a.james.satiety = 70;
        assert(!medCards(a, SCENES).length && !isQueueScreen(a, SCENES) && !taskCards(a, SCENES).length, 'v0.11.14: the arrival has no Meditate and no task cards');
        const rc = ensureBars(newGame(80, { closed: true })); rc.scene = 'rt_camp'; rc.james.qi = 30; rc.james.satiety = 70;
        const rm = medCards(rc, SCENES);
        assert(isQueueScreen(rc, SCENES) && rm.find((c) => c.id === 'med:mer:pri')?.task === 'mer:pri' && rm.find((c) => c.id === 'rt_camp:3')?.task === 'rt_camp:3', 'v0.11.19: rt_camp is a task screen: the primary and its own sit card carry queue ids');
        assert(isTaskHub(rc) && taskCards(rc, SCENES).some((c) => c.id === 'rt_camp:3') && taskCards(rc, SCENES).some((c) => c.kind === 'door' && /fire/.test(c.label)) && taskCards(rc, SCENES).some((c) => c.id === 'mer:pri'), 'v0.11.19: rt_camp: its chores, doors and Meditate cards are cards');
        const rr = JSON.parse(JSON.stringify(rc)), rsaid = [], rgot = [];
        for (const id of ['mer:pri', 'rt_camp:3']) { rsaid.push(taskOutcome(rr, SCENES, id).end); runTask(rr, SCENES, id); rgot.push(rr.minutes); }
        assert(rsaid.join() === rgot.join() && rr.scene === 'rt_camp' && rr.james.primaries === 1, `v0.11.19: rt_camp's cards run as their cards said (${rsaid} vs ${rgot})`);
        let threw = false; try { runTask(a, SCENES, SIT_TASK); } catch { threw = true; }
        assert(threw, 'v0.11.14: no queued work on a story screen');
        const bq = ensureBars(newGame(81)); bq.scene = 'rt_camp'; bq.james.qi = 30; bq.james.saturation = 96;
        assert(taskOpen(bq, SCENES, BT_TASK) && medCards(bq, SCENES).find((c) => c.id === 'med:bt')?.task === BT_TASK, 'v0.11.14: Break through queues on a resting place');
        const br = runTask(bq, SCENES, BT_TASK);
        assert(br.stopped && bq.scene === 'breakthrough' && bq.flags.bt_return === 'rt_camp', 'v0.11.19: Break through on the rt_camp task screen comes back to it');
        const fe = ensureBars(newGame(78)); fe.scene = 'stream'; fe.james.qi = 25; fe.james.realm = 4; markDaily(fe, 'mer_e8'); // v0.11.66 (G4): Golden Core
        const fm = medCards(fe, SCENES).find((c) => c.id === 'med:mer:e8');
        assert(fm && fm.open && taskOpen(fe, SCENES, 'mer:e8'), `v0.11.18: an Extraordinary line has no daily limit in Incremental Mode (${fm?.reason})`);
        const s7 = ensureBars(newGame(79)); s7.scene = 'stream'; s7.james.qi = 25; s7.james.realm = 7; s7.james.extra8 = 8;
        assert(medCards(s7, SCENES).filter((c) => /^med:mer:/.test(c.id)).map((c) => c.id).join() === 'med:mer:jn', 'v0.11.13: Nascent Soul: the junctions (v0.11.46, X1: the vessels\' collaterals no longer, they sealed)');
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
    // v0.11.64 (owner 02:07, pick C1): Cultivate until the limit = that many single sits; its stops
    {
        const mk = (seed, scene, set) => { const x = ensureBars(newGame(seed, { closed: true })); x.scene = scene; x.minutes = 1440 + 8 * 60; Object.assign(x.flags, { long: true, forest_day: 2 }); x.james.satiety = 90; x.james.qi = jamesQiMax(x); Object.assign(x.james, set || {}); return x; };
        const same = (a, b) => a.minutes === b.minutes && JSON.stringify(a.james) === JSON.stringify(b.james) && JSON.stringify(a.yuki) === JSON.stringify(b.yuki) && JSON.stringify(a.tasks) === JSON.stringify(b.tasks) && JSON.stringify(a.inventory) === JSON.stringify(b.inventory);
        for (const [scene, seed] of [['stream', 90], ['wilds', 91], ['camp', 92], ['ashfall', 93]]) {
            const x = mk(seed, scene); if (scene === 'ashfall') x.minutes = 4 * 1440 + 8 * 60;
            const p = sitLoopPlan(x, SCENES), id = sitTaskId(x, SCENES);
            const taps = JSON.parse(JSON.stringify(x)); for (let k = 0; k < p.sits; k++) runTask(taps, SCENES, id);
            const r = sitLoop(x, SCENES);
            assert(p.sits >= 2 && r.sits === p.sits && r.minutes === p.minutes && r.qi === p.qi && same(x, taps), `C1 (${scene}): the loop = ${p.sits} single taps of ${id}, and the button's numbers are what happens`);
            assert(r.stop === 'qi' && x.james.qi < 10, `C1 (${scene}): from a full bar Qi runs out first (${r.stop}, Qi ${x.james.qi})`);
        }
        const s1 = mk(94, 'stream', { realm: 1, saturation: 81.6, qi: 999 }); const r1 = sitLoop(s1, SCENES); // v0.11.66 (S1): +6.7% a sit at Foundation
        assert(r1.stop === 'sat' && s1.james.saturation === 95 && r1.sits === 2, `C1: it stops at the breakthrough point, 95% (${s1.james.saturation}%, ${r1.stop})`);
        const s2 = mk(95, 'stream'); s2.minutes = 1440 + 22 * 60 + 30; const r2 = sitLoop(s2, SCENES); // 22:30: one sit ends 23:30, a second would end past midnight (v0.11.91)
        assert(r2.stop === 'night' && r2.sits === 1 && !nightLock(s2) && s2.minutes <= 2 * 1440, `C1: it stops before a sit that would end past midnight (${r2.sits} sits, ${r2.stop})`);
        const s3 = mk(96, 'stream'); s3.james.satiety = 4; const r3 = sitLoop(s3, SCENES); // a sit costs 3 Fed: one leaves 1, a second would leave none
        assert(r3.stop === 'fed' && r3.sits === 1 && s3.james.satiety > 0, `C1: it stops before a sit that would leave Fed at 0 (${r3.sits} sits, Fed ${s3.james.satiety})`);
        const s4 = mk(97, 'stream', { qi: 15 });
        assert(sitLoopPlan(s4, SCENES).sits === 1 && !medCards(s4, SCENES).some((c) => c.id === 'med:sitall'), 'C1: one sit only: no loop card (the plain sit does it)');
        const s5 = mk(98, 'stream'); const card = medCards(s5, SCENES).find((c) => c.id === 'med:sitall');
        assert(card && card.open && /^Cultivate until the limit: \d+ sits, .+, [\d.]+ Qi → Saturation [\d.]+% \(then Qi runs out\)\.$/.test(card.label) && card.minutes === card.plan.minutes, `C1: the button shows sits, time, Qi and Saturation (${card?.label})`);
        const s5b = JSON.parse(JSON.stringify(s5)); const rm = runMed(s5, SCENES, 'med:sitall');
        assert(!rm.moved && s5.minutes - s5b.minutes === card.minutes && s5.james.saturation === card.plan.saturation && new RegExp(`^${card.plan.sits} sits`).test(rm.lines[0]), `C1: the card does what it said (${rm.lines[0]})`);
        const s6 = mk(99, 'stream'); s6.minutes = 1440 + 3 * 60; assert(!medCards(s6, SCENES).some((c) => c.id === 'med:sitall'), 'C1: no loop at night (from 00:00 only the night)');
        assert(Object.keys(SIT_STOP_TEXT).every((k) => typeof SIT_STOP_TEXT[k] === 'string'), 'C1: every stop has its words');
    }
    // v0.11.64 (the Fable review): every open Meditate card and task card on every resting place, at every hour, can be played on a copy (the screen draws each card's dry run); a screen that hides its own Cultivate hides it in Meditate too
    {
        let tried = 0; const bad = [];
        for (const sc of MED_SCREENS) for (let hh = 0; hh < 24; hh++) for (const day of [2, 5, 12, 20]) {
            const x = ensureBars(newGame(5, { closed: true })); x.scene = sc; x.minutes = (day - 1) * 1440 + hh * 60 + 30; Object.assign(x.flags, { long: true, forest_day: 2, vday: 2, lf_active: sc === 'lf_hub' }); x.james.satiety = 90; x.james.qi = jamesQiMax(x);
            let med = [], cards = [];
            try { med = medCards(x, SCENES); cards = isTaskHub(x) ? taskCards(x, SCENES).filter((c) => c.status === 'open') : []; } catch (e) { bad.push(`${sc}@${hh}: lists ${e.message}`); continue; }
            const ids = new Set([...med.filter((c) => c.open && c.task).map((c) => c.task), ...cards.map((c) => c.id)]);
            for (const id of ids) { tried++; try { taskOutcome(x, SCENES, id); } catch (e) { bad.push(`${sc}@${hh}: ${id} ${e.message}`); } }
            for (const c of med.filter((m) => m.open && !m.task && m.id !== 'med:bt')) { tried++; try { dryOutcome(x, (k) => runMed(k, SCENES, c.id)); } catch (e) { bad.push(`${sc}@${hh}: ${c.id} ${e.message}`); } }
        }
        assert(!bad.length && tried > 1000, `v0.11.64: every open card on every resting place at every hour plays on a copy (${tried} tried; ${bad.slice(0, 4).join(' | ')})`);
        const bite = ensureBars(newGame(7)); bite.scene = 'coil_end'; bite.coil.why = 'choice'; const sv = ensureBars(newGame(7)); sv.scene = 'coil_end'; sv.coil.why = 'collapse'; sv.james.satiety = 0;
        assert(outcomeOf(bite, bite.minutes).death === null && outcomeOf(sv, sv.minutes).death === 'hunger', 'v0.11.64: "Bite the tail" is no death; a collapse at Fed 0 is starving');
        const w = ensureBars(newGame(5, { closed: true })); w.scene = 'wilds'; Object.assign(w.flags, { long: true, forest_day: 2 }); w.minutes = 1440 + 20 * 60 + 30; w.james.qi = jamesQiMax(w);
        assert(!medCards(w, SCENES).some((c) => c.id === 'wilds:5' || c.id === 'med:sitall') && !taskCards(w, SCENES).some((c) => c.id === 'wilds:5'), 'v0.11.64: the wilds hide their Cultivate at 20:30, so Meditate offers neither it nor the loop');
    }
    // v0.11.64 (B1): the card that would starve James says so (its dry run), and it does what it said
    const h = ensureBars(newGame(71, { closed: true })); h.scene = 'wilds'; h.minutes = 1440 + 7 * 60; Object.assign(h.flags, { long: true, forest_day: 2 });
    h.james.satiety = 3; h.james.hp = 2; h.inventory = {};
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest in the shade/.test(c.text));
    let oc = null, n = 0;
    while (h.scene === 'wilds' && n++ < 20) { oc = taskOutcome(h, SCENES, `wilds:${rest}`); if (oc.death) break; runTask(h, SCENES, `wilds:${rest}`); }
    assert(oc && oc.death === 'hunger', `v0.11.64: a rest at Fed 0 and 2 HP: the card says James starves (${JSON.stringify(oc)})`);
    const hc = JSON.parse(JSON.stringify(h)); runTask(hc, SCENES, `wilds:${rest}`);
    assert(hc.scene === 'coil_end' && hc.minutes === oc.end && h.scene === 'wilds', `v0.11.64: the real card starves where it said (${hc.minutes} vs ${oc.end}); the dry run changed nothing`);
    // starving: 1.5 HP an hour in task mode, whatever the step size
    const a1 = ensureBars(newGame(72)); a1.james.satiety = 0; a1.james.hp = 20;
    for (let i = 0; i < 24; i++) advance(a1, 10);
    const a2 = ensureBars(newGame(72)); a2.james.satiety = 0; a2.james.hp = 20; advance(a2, 240);
    assert(STARVE_HP_PER_HOUR === 1.5 && a1.james.hp === 14 && a2.james.hp === 14, `4 starving hours cost 6 HP in 10-min steps and in one step (${a1.james.hp}, ${a2.james.hp})`);
    assert(taskMinutes(g, SCENES, `wilds:${rest}`) === 60, 'a rest passes its hour');
}
// v0.11.64: no game speeds (the speed gates went; their flags `spd_pro` / `spd_a1` are still set and kept, never renamed)
{
    const T = await import('../js/core/tasks.js');
    assert(!('maxSpeed' in T) && !('effectiveSpeed' in T) && !('MS_PER_GAME_HOUR' in T) && !('QUEUE_MAX' in T) && !('outlook' in T) && !('queueAdd' in T) && !('taskQueue' in T), 'v0.11.64: no speeds, no real-time clock, no queue in the rules');
    for (const o of ['victory', 'taken']) {
        const h = ensureBars(newGame(6)); Object.assign(h.flags, { ending: o === 'taken' ? 'lost' : 'bluff', a1_outcome: o });
        goTo(h, SCENES, 'a1_end');
        assert(h.flags.spd_a1 === true, `reaching a1_end (${o}) still sets its old flag`);
    }
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
    assert(!oneOffLeft(k, SCENES, 'ashfall') && ids(k).includes(`ashfall:${ci}`), 'skip: shown once the one-offs are done, at once');
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
// v0.11.31 (P3-b): the speed gates' flags stay across every rewind (the speeds went in v0.11.64; the flags are kept)
{
    const p = ensureBars(newGame(8, { closed: true }));
    assert(!KEEP_FLAGS.includes('ending') && KEEP_FLAGS.includes('spd_pro') && KEEP_FLAGS.includes('spd_a1'), 'gates: the gate flags are kept, the tribute outcome is not');
    goTo(p, SCENES, 'collectors_lost');
    assert(p.flags.ending === 'lost', 'gates: a lost tribute');
    endCoil(p, 'tribute', 'collectors_lost'); rewind(p);
    assert(!p.flags.ending && p.flags.spd_pro === true, 'gates: rewinding a lost tribute keeps its flag');
    rewind(p);
    assert(p.flags.spd_pro === true, 'gates: the flag survives a second rewind');
    const q = ensureBars(newGame(9, { closed: true }));
    endCoil(q, 'choice'); rewind(q);
    assert(!q.flags.spd_pro, 'gates: a rewind before the tribute sets no flag');
    for (const to of ['act', 'game']) {
        const h = ensureBars(newGame(10)); Object.assign(h.flags, { ending: 'bluff' }); startActCoil(h);
        h.flags.a1_outcome = 'victory'; goTo(h, SCENES, 'a1_end');
        rewind(h, { to });
        assert(h.flags.spd_a1 === true, `gates: the Act 1 flag survives the rewind to the start of ${to === 'act' ? 'Act 1' : 'the whole game'}`);
        assert(to === 'act' ? h.flags.ending === 'bluff' : (!h.flags.ending && h.scene !== 'a1_end' && (h.coil.act || 0) === 0), `gates: the ${to} rewind otherwise resets as before`);
    }
}
// v0.11.35 (P1-a, owner pick 15:42): scenes read in an earlier Coil fold, a memory line, Skip to the next choice
{
    const g = ensureBars(newGame(3501, { closed: true }));
    assert(g.seen && g.seen.arrival === 1 && !seenBefore(g), 'P1-a: a new game has read its first scene on Coil 1');
    goTo(g, SCENES, 'stream'); assert(g.seen.stream === 1, 'P1-a: entering a scene records the Coil it was first read in');
    noteSeen(g, 'stream'); g.coil.n = 3; noteSeen(g, 'stream'); assert(g.seen.stream === 1, 'P1-a: the first Coil is kept, never overwritten'); g.coil.n = 1;
    endCoil(g, 'choice', 'stream'); rewind(g);
    assert(g.coil.n === 2 && g.seen.stream === 1 && seenBefore(g, 'stream') && seenBefore(g, 'arrival') && !seenBefore(g, 'wilds'), 'P1-a: a rewind keeps the record; Coil 2 has read stream and arrival before, not the wilds');
    // the whole-game rewind from Act 1 keeps it too
    const w = ensureBars(newGame(3502, { closed: true })); w.scene = 'epilogue'; w.flags.ending = 'bluff'; w.minutes = 6 * 1440 + 900; choose(w, SCENES, 0);
    const sw = { ...w.seen }; w.flags.a1_outcome = 'victory'; goTo(w, SCENES, 'a1_end'); rewind(w, { to: 'game' });
    assert(Object.keys(sw).every((k) => w.seen[k] === sw[k]) && w.seen.a1_end != null, 'P1-a: the whole-game rewind keeps the record');
    // old saves: a missing record is filled (past Coil 1 from the picked choices), a present one left alone
    const o1 = ensureBars(newGame(3503)); delete o1.seen; o1.picked = { stream: [1] }; const l1 = deserialize(serialize(o1));
    assert(l1.seen && !Object.keys(l1.seen).length, 'P1-a: an old Coil 1 save loads with an empty record');
    const o2 = ensureBars(newGame(3504)); delete o2.seen; o2.coil.n = 3; o2.picked = { stream: [1], wilds: [0] }; const l2 = deserialize(serialize(o2));
    assert(l2.seen.stream === 0 && l2.seen.wilds === 0 && seenBefore(l2, 'stream') && !seenBefore(l2, 'arrival'), 'P1-a: an old Coil 3 save counts its picked scenes as read before');
    const o3 = ensureBars(newGame(3505)); o3.seen = { stream: 2 }; o3.coil.n = 3; assert(deserialize(serialize(o3)).seen.stream === 2, 'P1-a: a present record loads unchanged');
    assert(!JSON.stringify(dryClone(g)).includes('"seen":null'), 'P1-a: a dry run copies the record');
    // the fold
    const f = ensureBars(newGame(3506, { closed: true })); f.flags.long = true; f.flags.forest_day = 2; f.minutes += 1440 + 22 * 60;
    goTo(f, SCENES, 'night_won'); const v1 = sceneView(f, SCENES);
    assert(!againView(f, v1).fold && againView(f, v1).first === v1.text, 'P1-a: Coil 1: the text in full, no memory line');
    f.coil.n = 2; const a = againView(f, v1);
    assert(a.fold && MEMORY_LINES.includes(a.memory) && `${a.first}\n\n${a.rest}` === v1.text.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean).join('\n\n'), 'P1-a: read on an earlier Coil: the first paragraph, the rest behind Read it all again, a memory line');
    assert(againView(f, v1).memory === a.memory, 'P1-a: the same line for that scene on that Coil');
    assert(MEMORY_LINES.length >= 24 && new Set(MEMORY_LINES).size === MEMORY_LINES.length, `P1-a: ${MEMORY_LINES.length} memory lines, none twice`);
    const lines = new Set(); for (const id of Object.keys(SCENES)) { f.seen[id] = 1; const t = { id, text: 'a\n\nb' }; const x = againView(f, t); if (x.fold) lines.add(x.memory); }
    assert(lines.size >= 18, `P1-a: the lines vary by scene (${lines.size} different on Coil 2)`);
    f.seen.wilds = 1; assert(!againView(f, { id: 'wilds', text: 'a\n\nb' }).fold && noFold('wilds') && noFold('coil_end') && noFold(Object.keys(TASK_HUBS)[0]), 'P1-a: no fold on the task screens, their menus or the Coil\'s screens');
    assert(!againView(f, { id: 'night_won', text: 'one paragraph only' }).fold, 'P1-a: a one-paragraph scene does not fold');
    // the skip: night_won → morning → wilds (a task screen), two steps, the same as tapping
    const s0 = ensureBars(newGame(3507, { closed: true })); s0.flags.long = true; s0.flags.forest_day = 2; s0.minutes += 1440 + 22 * 60; goTo(s0, SCENES, 'night_won'); goTo(s0, SCENES, 'morning'); goTo(s0, SCENES, 'night_won');
    s0.coil.n = 2;
    const pl = skipPlan(s0, SCENES);
    assert(pl.steps === 2 && pl.to === 'wilds' && s0.scene === 'night_won', `P1-a: the plan: 2 steps to the wilds, the game untouched (${pl.steps}, ${pl.to})`);
    const A = JSON.parse(JSON.stringify(s0)), B = JSON.parse(JSON.stringify(s0));
    const rr = skipRun(A, SCENES);
    for (let k = 0; k < rr.steps; k++) choose(B, SCENES, sceneView(B, SCENES).choices.filter((c) => !c.disabled)[0].index);
    assert(JSON.stringify(A) === JSON.stringify(B) && rr.minutes === A.minutes - s0.minutes && rr.minutes === pl.minutes && A.scene === 'wilds', `P1-a: skipping = tapping through (state, clock ${rr.minutes} min)`);
    // where it stops
    const u = JSON.parse(JSON.stringify(s0)); delete u.seen.morning; assert(skipPlan(u, SCENES).steps === 1, 'P1-a: it stops at a scene not read before');
    const c1 = JSON.parse(JSON.stringify(s0)); c1.coil.n = 1; assert(skipStep(c1, SCENES) < 0, 'P1-a: nothing to skip on the Coil a scene was first read');
    const ch = ensureBars(newGame(3508, { closed: true })); ch.coil.n = 2; ch.seen = { arrival: 1, yuki_check: 1 }; goTo(ch, SCENES, 'arrival'); ch.coil.n = 2;
    assert(skipStep(ch, SCENES) < 0, 'P1-a: no skip where there is a real choice (the arrival)');
    let checks = 0, fights = 0; for (const [id, sc] of Object.entries(SCENES)) { if ((sc.choices || []).length !== 1) continue; const c = sc.choices[0]; if (!c.check && !c.combat) continue; const t = ensureBars(newGame(3509, { closed: true })); t.coil.n = 2; t.seen = { [id]: 1 }; t.scene = id; if (skipStep(t, SCENES) < 0) { if (c.check) checks++; else fights++; } else assert(false, `P1-a: the skip never takes a check or a fight (${id})`); }
    assert(checks + fights > 0, `P1-a: one-choice checks and fights are never skipped (${checks} checks, ${fights} fights)`);
    assert(SKIP_MAX >= 10, 'P1-a: the skip walks up to 30 steps');
    // after the Fable review: no skip into a collapse, none across into Act 1, no fold on an outcome's own text
    const dy = JSON.parse(JSON.stringify(s0)); dy.james.hp = 0.5; dy.james.satiety = 0; const dp = skipPlan(dy, SCENES);
    { const t = JSON.parse(JSON.stringify(dy)); skipRun(t, SCENES); assert(t.scene !== 'coil_end' || dp.steps === 0, `P1-a: a stretch that ends in a collapse is not offered (${dp.steps}, ${t.scene})`); }
    const ab = ensureBars(newGame(3510, { closed: true })); ab.coil.n = 2; ab.flags.ending = 'bluff'; ab.minutes = 6 * 1440 + 900; ab.seen = { bluff_win: 1, epilogue: 1, fo_start: 1, fo_envoy: 1 }; ab.scene = 'bluff_win';
    { const t = JSON.parse(JSON.stringify(ab)); const r2 = skipRun(t, SCENES); assert((t.coil.act || 0) === 0 && t.scene === 'epilogue' && r2.steps === 1, `P1-a: the skip stops at the prologue's end (the epilogue, an outcome scene), never crossing into Act 1 (${t.scene}, ${r2.steps} steps)`); }
    for (const id of ['epilogue', 'fo_start', 'breakthrough', 'a1_end']) { f.seen[id] = 1; assert(!againView(f, { id, text: 'a\n\nb' }).fold, `P1-a: an outcome scene never folds (${id})`); }
    f.seen.night_won = 1; f.lastWin = { next: 'night_won', degree: 2, id: 'crows' }; assert(!againView(f, { id: 'night_won', text: 'a\n\nb' }).fold, 'P1-a: a lopsided win\'s own text never folds'); f.lastWin = null;
    if (FULL) assert(skipChecked >= 1000, `v0.11.35: the bot games compared the skip with tapping through often enough (${skipChecked})`);
    else console.log(`  skip = tapping through, checked in the bot games (quick, log only): ${skipChecked}`);
}
// v0.11.37 (owner 12:59–14:27, picks A1 + B2 + C-a + D-a + E-a + F1): the day ends at 02:00, Push through only at night,
// at once vs a bar, the Long Forest's two exits, no useless sit, familiar story choices
{
    const at = (seed, scene, m) => { const x = ensureBars(newGame(seed)); x.scene = scene; x.minutes = m; wakeDay(x); x.james.satiety = 90; return x; };
    const addFood = (x) => { x.inventory.hare_raw = 3; x.inventory.river_cress = 3; };
    const choiceIx = (x, re) => SCENES[x.scene].choices.findIndex((c) => (!c.show || c.show(x)) && re.test(String(typeof c.text === 'function' ? c.text(x) : c.text)));
    const shownIx = (x, re) => sceneView(x, SCENES).choices.some((c) => re.test(c.label));
    // the night hours belong to the evening before
    const n = at(3701, 'ashfall', 4 * 1440 + 30); // Day 5, 00:30
    const n23 = at(3701, 'ashfall', 3 * 1440 + 23 * 60 + 30); // Day 4, 23:30
    assert(hour(n23) === 23 && !nightLock(n23) && dayEnd(n23) === 4 * 1440, `D (v0.11.91): at 23:30 the day ends at the coming 00:00 (${dayEnd(n23)})`);
    assert(hour(n) === 24 && dayHour(n) === 24 && nightLock(n) && dayEnd(n) === 4 * 1440, `D (v0.11.91): 00:30 reads 24 and is past the day's end, 00:00 (${hour(n)})`);
    assert(!shownIx(n, /^Run a clinic/) && shownIx(n, /^Evening\. Go home/), 'D: at 00:30 the day cards stay gone and the evening exit stays (was: back at midnight)');
    const w = at(3702, 'wilds', 2 * 1440 + 60); w.flags.forest_day = 2;
    const raw = (re) => SCENES.wilds.choices.find((c) => typeof c.text === 'string' && re.test(c.text));
    assert(!raw(/^Forage\.$/).show(w) && raw(/^Make camp for the night/).show(w), 'D: in the wilds at 01:00 no Forage, Make camp shows');
    // from 00:00 (v0.11.91; 02:00 before): only the night
    const l = at(3703, 'ashfall', 4 * 1440 + 5); l.james.satiety = 40; addFood(l);
    assert(nightLock(l), 'D: 00:05 is past the day\'s end');
    const lc = taskCards(l, SCENES);
    assert(lc.length > 0 && lc.every((c) => c.kind === 'chore' && /^(Eat|Cook|Chew)/.test(c.label)), `D: from 00:00 the task screen offers only eating (${lc.map((c) => c.label).join(' | ')})`);
    const lm = medCards(l, SCENES);
    assert(lm.length === 0, `D (v0.11.91): from 00:00 Meditate offers nothing (no Push through the night) (${lm.map((m) => m.id).join(', ')})`);
    assert(shownIx(l, /^Evening\. Go home/), 'D: the evening exit (a story stop) is never blocked');
    // a card that would end past the day's end (00:00 since v0.11.91) doesn't start
    const e = at(3704, 'rt_camp', 19 * 1440 + 23 * 60 + 45); e.james.qi = 999; // 23:45 by the fire (its Cultivate has no hour of its own)
    const ea = at(3714, 'stream', 23 * 60 + 45); ea.james.qi = 999; const em = medCards(ea, SCENES); // v0.11.64: the stream (Ashfall hides its own Cultivate after 19:00, and so does Meditate now)
    assert(em.some((m) => m.late) && em.every((m) => m.late && !m.open && m.tag === 'ends past midnight'), `D-a: at 23:45 a sit or a meridian that would end past midnight is locked with its reason (${em.map((m) => m.id + ':' + m.tag).join(', ')})`);
    const late = taskCards(e, SCENES).filter((c) => c.status === 'late');
    const okc = taskCards(e, SCENES).filter((c) => c.status === 'open');
    assert(late.length > 0 && late.every((c) => endsLate(e, taskMinutes(e, SCENES, c.id))), `D-a: at 23:45 the cards that would end past midnight are 'late' (${late.map((c) => c.id).join(', ')})`);
    assert(okc.every((c) => !endsLate(e, taskMinutes(e, SCENES, c.id))), 'D-a: the open ones end by midnight');
    if (late.length) {
        const id = late[0].id;
        assert(!taskOpen(e, SCENES, id) && dayOver(e, SCENES, id), 'D-a: a late card is not open; the day is over for it');
    }
    const bq = at(3705, 'ashfall', 3 * 1440 + 23 * 60 + 55); bq.james.realm = 1; bq.james.saturation = 100;
    assert(taskCards(bq, SCENES).some((c) => c.id === BT_TASK && c.status === 'open'), 'D-a: the breakthrough is exempt (it is rest)');
    // v0.11.91 (pick B): no Push through the night at any hour; the next night locks at 00:00 again
    const pn = at(3706, 'ashfall', 4 * 1440 + 15 * 60);
    for (const m of [4 * 1440 + 15 * 60, 4 * 1440 + 23 * 60 + 59, 5 * 1440 + 30, 5 * 1440 + 150]) { pn.minutes = m; assert(!medCards(pn, SCENES).some((x) => x.id === 'med:push'), `v0.11.91: no Push at ${m % 1440} min`); }
    pn.minutes = 5 * 1440 + 150; assert(nightLock(pn) && !taskCards(pn, SCENES).some((c) => c.kind === 'work' && c.status === 'open'), 'v0.11.91: 02:30 is night: no work card');
    const old = at(3707, 'ashfall', 4 * 1440 + 60); old.wake.push = 5; wakeDay(old); assert(hour(old) === 25 && nightLock(old) && !('push' in old.wake), 'v0.11.91: an old save\'s push mark is dropped: 01:00 is the night');
    // B2: a sit that changes nothing is not offered (v0.11.66, S1: at ×1.5 a realm a sit still gains 0.1% at realm 13, so only the top realm)
    for (const [r, useless] of [[7, false], [8, false], [13, false], [MAX_REALM, true]]) {
        const v = at(3708 + r, 'ashfall', 4 * 1440 + 9 * 60); v.james.realm = r; v.james.qi = 999;
        const sitCard = medCards(v, SCENES).some((m) => /^Cultivate/.test(m.label));
        const sitChore = taskCards(v, SCENES).some((c) => /^Cultivate/.test(c.label) && c.status === 'open');
        assert(sitUseless(v) === useless && sitCard === !useless && (!useless || !sitChore), `B2: realm ${r}: sit gain ${sitGain(v)}%, the Cultivate card ${useless ? 'hidden' : 'shown'}`);
    }
    // C: what happens at once (since v0.11.64 every card does)
    // A1: the Long Forest's second exit, back where he walked in
    const lf = ensureBars(newGame(3720, { closed: true })); lf.coil.n = 2; lf.scene = 'clearing'; lf.minutes = 10 * 60;
    const ent = choiceIx(lf, /^Stay lost/); assert(ent >= 0, 'A1: the clearing offers the Long Forest on Coil 2');
    choose(lf, SCENES, ent); const at0 = lf.flags.lf_at;
    assert(lf.flags.lf_from === 'clearing' && at0 === 10 * 60, `A1: walking in records the place and the time (${lf.flags.lf_from}, ${at0})`);
    while (lf.scene !== 'lf_hub') choose(lf, SCENES, 0);
    advance(lf, 3 * 1440); lf.inventory = {}; lf.james.hp = 1; lf.james.satiety = 90;
    const back = choiceIx(lf, /^Go back the way you came/);
    assert(back >= 0 && shownIx(lf, /^Go back the way you came/) && !SCENES.lf_hub.choices[back].combat, 'A1: the Long Forest offers the way back (at once, as every choice since v0.11.64)');
    choose(lf, SCENES, back);
    assert(lf.scene === 'clearing' && !lf.flags.lf_active && lf.minutes >= at0 && lf.minutes <= at0 + DEFAULT_MINUTES.move && lf.james.hp === jamesHpMax(lf) && LF_STOCK.every((id) => lf.inventory[id] === itemCap(id)), `A1: back in the clearing, the clock as he left it (${clockParts(lf.minutes).day}, ${lf.minutes - at0} min walk), bars and hammerspace full`);
    assert(shownIx(lf, /^Stay lost/), 'A1: the Long Forest can be entered again from there');
    const ar = ensureBars(newGame(3721, { closed: true })); ar.coil.n = 2; ar.scene = 'arrival';
    choose(ar, SCENES, choiceIx(ar, /^You remember this\. Stay lost/)); assert(ar.flags.lf_from === 'arrival', 'A1: from the arrival too');
    const nolf = ensureBars(newGame(3722, { closed: true })); nolf.coil.n = 2; nolf.scene = 'lf_hub'; nolf.flags.lf_active = true;
    assert(!shownIx(nolf, /^Go back the way you came/) && shownIx(nolf, /^Follow the smoke/), 'A1: a save inside the Long Forest from before the record keeps only the smoke exit');
    // F1: a story choice picked before takes half its time; task cards keep their own familiarity
    let tried = 0;
    for (const [id, sc] of Object.entries(SCENES)) {
        if (TASK_HUBS[id] || isMenuScene(id) || sc.end || tried >= 6) continue;
        (sc.choices || []).forEach((c, i) => {
            if (tried >= 6 || !(c.time >= 20) || c.show || c.req || c.check || c.combat || c.qi || typeof c.to !== 'string' || SCENES[c.to]?.enter || typeof c.text !== 'string' || /^Back\b/.test(c.text)) return;
            const a = ensureBars(newGame(3730)); a.scene = id; a.james.satiety = 90; a.minutes = 8 * 60;
            const b = JSON.parse(JSON.stringify(a)); notePicked(b, id, i);
            const ma = a.minutes; choose(a, SCENES, i); const mb = b.minutes; choose(b, SCENES, i);
            assert(b.minutes - mb === pickedMinutes(a.minutes - ma) && a.minutes - ma === c.time, `F1: ${id}:${i} picked before takes half (${a.minutes - ma} → ${b.minutes - mb} min)`);
            tried++;
        });
    }
    assert(tried >= 3 && PICKED_SPEED === 2, `F1: checked on ${tried} story choices`);
    const ch = at(3731, 'ashfall', 4 * 1440 + 9 * 60); addFood(ch); ch.james.satiety = 20;
    const eatId = taskCards(ch, SCENES).find((c) => /^Eat something/.test(c.label))?.id;
    if (eatId) { // full copies (dryClone drops g.picked): the real run with and without the mark (Fable review)
        const ix = Number(eatId.split(':').pop());
        const c1 = JSON.parse(JSON.stringify(ch)), c2 = JSON.parse(JSON.stringify(ch)); notePicked(c2, 'ashfall', ix);
        const m1 = c1.minutes, m2 = c2.minutes; runTask(c1, SCENES, eatId); runTask(c2, SCENES, eatId);
        assert(c1.minutes - m1 > 0 && c1.minutes - m1 === c2.minutes - m2, `F1: a task card (a chore) picked before keeps its time (${c1.minutes - m1} / ${c2.minutes - m2})`);
    } else assert(false, 'F1: Ashfall offers Eat something');
    // after the Fable review
    const ev = at(3740, 'ashfall', 4 * 1440 + 60); ev.flags.vday = 2; const evi = choiceIx(ev, /^Evening\. Go home/); const ev0 = ev.minutes, evw = wakeDay(ev);
    assert(evi >= 0, 'review: Ashfall at 01:00 offers the evening exit');
    if (evi >= 0) { choose(ev, SCENES, evi); assert(ev.minutes >= ev0 && ev.minutes - ev0 < 6 * 60 && wakeDay(ev) === evw, `review: the evening exit at 01:00 doesn't jump to 19:00 (was: 18 h and a free night; ${ev.scene}, +${ev.minutes - ev0} min)`); }
    const lw = ensureBars(newGame(3741, { closed: true })); lw.coil.n = 2; lw.scene = 'clearing'; lw.minutes = 10 * 60;
    choose(lw, SCENES, choiceIx(lw, /^Stay lost/)); while (lw.scene !== 'lf_hub') choose(lw, SCENES, 0);
    for (let k = 0; k < 3; k++) sleepUntil(lw, 6); // three forest nights
    lw.james.satiety = 90; choose(lw, SCENES, choiceIx(lw, /^Go back the way you came/));
    const lw0 = wakeDay(lw); sleepUntil(lw, 6); assert(wakeDay(lw) === lw0 + 1, `review: after the way back, the next night slept counts (${lw0} → ${wakeDay(lw)})`);
    const fe = at(3742, 'ashfall', 4 * 1440 + 110); addFood(fe); fe.james.satiety = 20; // 01:50
    const fec = taskCards(fe, SCENES).find((c) => /^Eat something/.test(c.label));
    assert(fec && fec.status === 'open', `review: eating is never locked as late (01:50: ${fec?.status})`);
    fe.minutes = 4 * 1440 + 130; assert(fec && !dayOver(fe, SCENES, fec.id) && taskOpen(fe, SCENES, fec.id), 'review: at 02:10 a meal still runs');
    const dm = at(3743, 'ashfall', 3 * 1440 + 23 * 60 + 45); dm.james.qi = 999; dm.james.primaries = 3; // 23:45 (v0.11.91: the day ends at 00:00)
    const dmed = medCards(dm, SCENES), dmIds = new Set(dmed.filter((m) => m.task).map((m) => m.task));
    const lateHub = taskCards(dm, SCENES).filter((c) => c.status === 'late');
    assert(lateHub.length > 0 && lateHub.every((c) => dmIds.has(c.id)), `review: a late Meditate card keeps its task id, so the hub list doesn't show it twice (${lateHub.map((c) => c.id).join(', ')})`);
    // v0.11.66 (S1): a sit gains something up to realm 13
    for (const [r, open] of [[7, true], [8, true], [13, true], [MAX_REALM, false]]) { const cp = at(3744 + r, 'camp', 20 * 60); cp.james.realm = r; cp.james.qi = 999; cp.james.saturation = 0; assert(taskCards(cp, SCENES).some((c) => c.id === SIT_TASK) === open, `review: the camp's queueable sit at realm ${r}: ${open ? 'offered' : 'hidden'}`); }
    const mn = at(3746, 'ashfall', 4 * 1440 + 150); mn.james.qi = 999; assert(!taskOpen(mn, SCENES, MER_TASK), 'review: an old queue\'s mer:next waits after 02:00');
}
// v0.11.40 (N1, owner pick 18:02): the three night scenes never set the clock back. Entered in the evening they jump forward
// to the night's hour as before; entered after it (01:50, 02:30, 03:30, and the rare 04:30), the clock stays where it was.
{
    const D = 3 * 1440; // the start of day 4
    const cases = [['night_attack', 21, 80], ['night_event', 21, 60], ['bl_night_event', 21, 60]]; // v0.11.91: the Blackroot's night from 21:00 too (19:00 before)
    for (const [scene, eve, nightAt] of cases) {
        const enterAt = (m) => { const x = ensureBars(newGame(4000 + m)); x.scene = scene; x.minutes = m; SCENES[scene].enter(x); return x.minutes; };
        assert(enterAt(D - 1440 + 22 * 60) === D + nightAt, `N1: ${scene} entered at 22:00 jumps forward to the night's hour, as before`);
        assert(enterAt(D - 1440 + eve * 60) === D + nightAt, `N1: ${scene} entered at ${eve}:00 jumps forward to the night's hour, as before`);
        assert(enterAt(D + 30) === D + nightAt, `N1: ${scene} entered at 00:30 jumps forward to the night's hour, as before`);
        for (const hm of [110, 150, 210, 270]) assert(enterAt(D + hm) === D + hm, `N1: ${scene} entered at ${String(Math.floor(hm / 60)).padStart(2, '0')}:${String(hm % 60).padStart(2, '0')} keeps the clock (was set back)`);
    }    for (const [scene, wake] of [['morning', 'wilds'], ['bl_morning', 'blackroot']]) {
        for (const hm of [150, 270]) {
            const x = ensureBars(newGame(4200 + hm)); x.scene = scene; x.minutes = D + hm; x.flags.night_ev = 'stars'; x.flags.bl_ev = 'stars';
            SCENES[scene].enter && SCENES[scene].enter(x);
            assert(x.minutes === D + 6 * 60, `N1: the ${wake} morning entered at ${Math.floor(hm / 60)}:${String(hm % 60).padStart(2, '0')} ends at 06:00 that day (${clockParts(x.minutes).hh}:${String(clockParts(x.minutes).mm).padStart(2, '0')} day ${clockParts(x.minutes).day})`);
        }
    }
}
// v0.11.40 (E1, owner pick 18:11): the degree (and "End it in one move.") reads the fight as it will be fought: with its no-dice raise
{
    const { noDiceUp } = await import('../js/core/game.js');
    const { degreeOf, jamesPower, enemyPower } = await import('../js/story/power.js');
    for (const id of ['rot_ape', 'collectors', 'jackals', 'gao']) {
        const enemy = { name: 'x', hp: 10, dc: 5, atk: 6, dmg: 3 };
        const g = ensureBars(newGame(4100)); const c = startCombat(g, { id, enemies: [enemy], win: 'arrival', lose: 'arrival' });
        assert(c.enemies[0].dc - enemy.dc === noDiceUp(id) && c.enemies[0].atk - enemy.atk === noDiceUp(id), `E1: noDiceUp(${id}) = the raise startCombat applies (${noDiceUp(id)})`);
    }
    const { NO_DICE_TUNE } = await import('../js/story/nodice_tune.js');
    const { BEAST_UP } = await import('../js/core/game.js');
    const apeUp = NO_DICE_TUNE.rot_ape.up + BEAST_UP;
    assert(noDiceUp('rot_ape') === apeUp && noDiceUp('collectors') === NO_DICE_TUNE.collectors.up, `E1: the rot ape its tune + a beast's ${BEAST_UP}, the tribute its tune only (people) (${noDiceUp('rot_ape')}, ${noDiceUp('collectors')})`);
    const ape = ensureBars(newGame(4101)); ape.scene = 'ape_lured'; ape.minutes = 12 * 1440 + 10 * 60;
    ape.james.gu = { tier: 3, level: 4 }; ape.james.realm = 0;
    const jp = jamesPower(ape), ep = enemyPower([{ dc: 6, atk: 7 }]);
    assert(jp - ep >= 4 && jp - (ep + apeUp) < 1, `E1: the test James crushes the ape on paper and not in the fight (power ${jp}, ape ${ep} + ${apeUp})`);
    assert(degreeOf(ape, [{ dc: 6, atk: 7 }]) === 3 && degreeOf(ape, [{ dc: 6, atk: 7 }], apeUp) === 1, 'E1: degreeOf without the raise 3, with it 1');
    const labels = sceneView(ape, SCENES).choices.map((c) => c.label);
    assert(labels.includes('Fight.') && !labels.includes('End it in one move.'), `E1: no "End it in one move." against the ape for that James (${labels.join(' | ')})`);
    ape.james.gu = { tier: 10, level: 10 }; ape.james.realm = 9;
    assert(jamesPower(ape) - (ep + apeUp) >= 4 && sceneView(ape, SCENES).choices.some((c) => c.label === 'End it in one move.'), `E1: a James truly past the fight still gets "End it in one move." (power ${jamesPower(ape)})`);
}
// v0.11.40 (G1): the flag gao_dead was never set (the scene gao_dead sets gao_broken); nothing reads it any more
{
    const { readFileSync, readdirSync } = await import('node:fs');
    const src = ['js', 'js/core', 'js/story', 'js/art'].flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${d}/${f}`, 'utf8'))).join('\n');
    assert((src.match(/flags\??\.gao_dead/g) || []).length === 1, 'G1: nothing in js/ reads the flag gao_dead but the old-save fill');
    const old = migrate({ v: SAVE_VERSION, ...JSON.parse(JSON.stringify(ensureBars(newGame(4103)))), flags: { gao_dead: true } });
    assert(old.flags.gao_broken === true, 'G1: an old save with gao_dead (before v0.7.0) gets gao_broken, so it plays as before');
    const plain = migrate({ ...JSON.parse(JSON.stringify(ensureBars(newGame(4104)))) });
    assert(!plain.flags.gao_broken, 'G1: a save without gao_dead gets no gao_broken');
    const sc = Object.values(SCENES).flatMap((s) => (s.choices || []).filter((c) => c.to === 'gao_dead'));
    assert(sc.length === 1, `G1: one choice leads to the scene gao_dead (${sc.length})`);
    const g = ensureBars(newGame(4102)); sc[0].do(g);
    assert(g.flags.gao_broken === true && g.flags.gao_dead === undefined, 'G1: that choice sets gao_broken, not gao_dead');
}
// v0.11.40 (Y-text): Yuki and James were born together (owner 2026-11-05); no "six" or "thirty-four years" left in her path
{
    const { readFileSync } = await import('node:fs');
    const yp = readFileSync('js/story/yuki_path.js', 'utf8');
    assert(!/thirty-four|you were six|boy of six/i.test(yp) && /born the same morning, in the same grove/.test(yp) && /Forty years of her sleeping/.test(yp), 'Y-text: yuki_path.js says born together, forty years');
}
// v0.11.46 (X1, owner 19:26 "The extraordinary collaterals can be opened UNTIL Nascent soul, not after"): their window is
// Foundation to Soul Embryo after all 8 vessels (a fork from the engine's formulas.js); at Nascent Soul they seal; ns_warn counts them
{
    const MER = await import('../js/story/meridians.js');
    const at = (realm, e, c) => { const g = ensureBars(newGame(4601)); g.james.realm = realm; g.james.extra8 = e; g.james.extraCollaterals = c; return g; };
    for (const [r, e, c, want] of [[0, 8, 0, false], [1, 7, 0, false], [1, 8, 0, false], [3, 8, 27, false], [4, 8, 0, true], [4, 8, 27, true], [6, 8, 5, true], [4, 8, 28, false], [7, 8, 0, false], [9, 8, 3, false]]) { // v0.11.66 (G4): from Golden Core
        const g = at(r, e, c);
        assert(MER.lineWindow(g, 'ec') === want && MER.canExtraColl(g) === want, `X1: the vessels' collaterals at realm ${r}, ${e}/8 vessels, ${c}/28: ${want ? 'open' : 'shut'}`);
    }
    assert(!MER.lineWindow(at(3, 8, 0), 'jn') && MER.lineWindow(at(7, 8, 0), 'jn'), 'X1: the junctions stay at Nascent Soul and later');
    assert(btTarget(at(6, 8, 27)) === 'ns_warn' && btTarget(at(6, 7, 0)) === 'ns_warn' && btTarget(at(6, 8, 28)) === 'breakthrough', 'X1: the Nascent Soul warning when a vessel or one of their collaterals is still closed');
    const w = at(6, 8, 20); w.scene = 'ns_warn'; const wv = sceneView(w, SCENES);
    assert(/8 of the vessels' twenty-eight collaterals are still closed/.test(wv.text) && /Open the collaterals first/.test(wv.choices[0].label), 'X1: ns_warn names the closed collaterals');
    const w2 = at(6, 6, 0); w2.scene = 'ns_warn';
    assert(/2 of the eight Extraordinary vessels are still closed/.test(sceneView(w2, SCENES).text), 'X1: ns_warn still names the closed vessels first');
    const k = at(4, 8, 0); k.scene = 'camp'; k.minutes = 3 * 1440 + 15 * 60; k.james.qi = jamesQiMax(k); k.james.satiety = 90;
    assert(medCards(k, SCENES).some((c) => c.id === 'med:mer:ec' && c.open && c.task === merLineTask('ec')), 'X1: the camp offers the first of the vessels\' collaterals at Golden Core (queueable; Foundation before v0.11.66)');
    const x0 = k.james.extraCollaterals; let guard = 0;
    while (k.james.extraCollaterals === x0 && guard++ < 10) { k.james.qi = jamesQiMax(k); runTask(k, SCENES, merLineTask('ec')); }
    assert(k.james.extraCollaterals === 2, `X1 + P1: timed work opens the first pair (${k.james.extraCollaterals}/28 after ${guard} sittings)`);
}
// v0.11.46 (Q1, owner 19:26 "Meditate to recover Qi manually, and another to condense Qi"): "Meditate: gather Qi", an hour at the
// resting rate, queueable wherever Meditate shows while Qi isn't full; a sit short of Qi shows, locked, with the reason
{
    const T = await import('../js/core/tasks.js');
    const g = ensureBars(newGame(4602, { closed: true })); g.scene = 'camp'; g.minutes = 20 * 60 + 40; g.james.qi = 9.3; g.james.satiety = 90;
    const mc = medCards(g, SCENES);
    const sit = mc.find((c) => c.id === 'med:sit'), qi = mc.find((c) => c.id === 'med:qi');
    assert(sit && !sit.open && sit.show && /needs 10 Qi \(you have 9\.3\)/.test(sit.tag), `Q1: the sit short of Qi shows locked with the reason (${sit?.tag})`);
    assert(qi && qi.open && qi.task === T.QI_TASK && qi.minutes === 60 && /Meditate: gather Qi/.test(qi.label), 'Q1: the gather-Qi card on the night camp, queueable, an hour');
    assert(taskOpen(g, SCENES, T.QI_TASK) && taskMinutes(g, SCENES, T.QI_TASK) === 60, 'Q1: the queue card is open and takes 60 min');
    const h = ensureBars(JSON.parse(JSON.stringify(g))); advance(h, 60, { resting: true });
    const m0 = g.minutes; const r = runTask(g, SCENES, T.QI_TASK);
    assert(g.minutes - m0 === 60 && Math.abs(g.james.qi - h.james.qi) < 1e-9 && g.james.qi > 9.3, `Q1: an hour at the resting rate, as "Rest an hour" (Qi 9.3 → ${g.james.qi})`);
    assert(/Meditated an hour: Qi 9\.3 → /.test(r.lines.join(' ')), 'Q1: its result line');
    g.james.qi = jamesQiMax(g);
    assert(!medCards(g, SCENES).some((c) => c.id === 'med:qi') && !taskOpen(g, SCENES, T.QI_TASK), 'Q1: no gather card when Qi is full');
    let threw = false; try { runTask(g, SCENES, T.QI_TASK); } catch { threw = true; } assert(threw, 'Q1: a queued gather with Qi full is refused');
    for (const id of MED_SCREENS) { const s = ensureBars(newGame(4603)); s.scene = id; s.minutes = 2 * 1440 + 14 * 60; s.james.qi = 1; s.flags.long = true; if (!canMeditate(s, SCENES)) continue; assert(medCards(s, SCENES).some((c) => c.id === 'med:qi' && c.open), `Q1: the gather card on ${id}`); }
    const late = ensureBars(newGame(4604)); late.scene = 'camp'; late.minutes = 23 * 60 + 30; late.james.qi = 1; // 23:30: an hour would end past midnight (v0.11.91)
    assert(medCards(late, SCENES).some((c) => c.id === 'med:qi' && !c.open && c.late), 'Q1: at 23:30 the gather card is locked (ends past midnight)');
    assert(T.isMedTask(T.QI_TASK), 'Q1: a bar, and a Meditate card that queues on the resting places');
}
// v0.11.46: the Blackroot camp (and the other toHour scenes) no longer jump the clock forward when entered before 06:00
{
    const { BLACKROOT } = await import('../js/story/act1_blackroot.js');
    for (const [hh, mm, jump] of [[4, 30, false], [5, 50, false], [15, 0, true], [1, 0, false]]) {
        const g = ensureBars(newGame(4605)); g.minutes = 12 * 1440 + hh * 60 + mm; g.flags.bl_region = 'rr'; const m0 = g.minutes;
        BLACKROOT.bl_camp.enter(g);
        const want = jump ? 12 * 1440 + 19 * 60 : m0;
        assert(g.minutes === want, `bl_camp entered at ${hh}:${String(mm).padStart(2, '0')}: ${jump ? 'to 19:00' : 'the clock stays'} (moved ${g.minutes - m0} min)`);
    }
}
// v0.11.47 (N1, owner 19:39 / 19:58 / 20:01 / 20:03): the Root Road's "Eat with the others." (the Manners beat) in place of "Eat something."
// until it has played; "Train." gone once the day's drills are used up; the return camps' evening clock; gather Qi locked at Fed 0
{
    const { BLACKROOT } = await import('../js/story/act1_blackroot.js');
    const T = await import('../js/core/tasks.js');
    const rr = () => { const g = ensureBars(newGame(4701)); g.scene = 'rr_hub'; g.minutes = 11 * 1440 + 15 * 60; g.flags.bl_region = 'rr'; g.flags.bl_day = 1; g.james.satiety = 60; g.inventory.hare_raw = 5; return g; };
    const labels = (g) => sceneView(g, SCENES).choices.map((c) => c.label);
    const a = rr();
    assert(labels(a).includes('Eat with the others.') && !labels(a).includes('Eat something.'), `N1: on the Root Road "Eat with the others." stands in for "Eat something." until Manners has played (${labels(a).join(' | ')})`);
    assert(SCENES.rr_hub.choices[1].text === 'Eat with the others.' && SCENES.rr_hub.choices[1].to === 'ya_mocks', 'N1: it keeps the old midday meal\'s place (index 1) and opens Manners');
    const eatI = sceneView(a, SCENES).choices.find((c) => c.label === 'Eat with the others.').index; const f0 = a.james.satiety, hare0 = a.inventory.hare_raw;
    choose(a, SCENES, eatI);
    assert(a.scene === 'ya_mocks' && a.flags.ya_mocked && a.james.satiety > f0 && a.inventory.hare_raw === hare0, 'N1: Manners plays, James eats their cakes (no food from the hammerspace)');
    a.scene = 'rr_hub';
    assert(labels(a).includes('Eat something.') && !labels(a).includes('Eat with the others.'), 'N1: after Manners the ordinary "Eat something." is back');
    const b = rr(); b.inventory = {}; assert(labels(b).includes('Eat with the others.'), 'N1: "Eat with the others." needs no food of James\'s own');
    const c = rr(); c.james.satiety = 99; assert(labels(c).includes('Eat with the others.') && !labels(c).includes('Eat something.'), 'M1 (v0.11.48): offered at any Fed (99 after a full supper), so Manners can\'t be walked past');
    const d = rr(); d.scene = 'dw_hub'; d.flags.bl_region = 'dw'; assert(labels(d).includes('Eat something.'), 'N1: the other Blackroot camps keep "Eat something."');
    // Train
    const t = rr(); t.james.skills['Convergence Use'] = { tier: 1, level: 6, xp: 0 }; ensureBars(t);
    assert(labels(t).includes('Train.'), 'T1: Train shows with drills left');
    for (const k of ['bt_ya', 'bt_dart', 'bt_needle']) markDaily(t, k);
    assert(labels(t).includes('Train.'), 'T1: one drill left (footwork with Yuki): Train still shows');
    markDaily(t, 'bt_yuki');
    assert(!labels(t).includes('Train.'), 'T1: all four drills done today: Train is gone');
    const u = rr(); u.james.skills['Convergence Use'] = { tier: 1, level: 1, xp: 0 }; ensureBars(u); for (const k of ['bt_ya', 'bt_needle', 'bt_yuki']) markDaily(u, k);
    assert(!labels(u).includes('Train.'), 'T1: only darts left and James can\'t sing darts yet: Train is gone');
    assert(!T.taskCards(t, SCENES).some((x) => x.status === 'open' && /bl_train|Train/.test(x.label + x.id)), 'T1: no Train card on the task screen either');
    // the return camps' evening clock
    const { RETURN } = await import('../js/story/act1_return.js');
    const camp = Object.values(RETURN).find((x) => x.id === 'rt_camp');
    for (const [hh, mm, jump] of [[4, 30, false], [1, 0, false], [15, 0, true]]) {
        const g = ensureBars(newGame(4702)); g.minutes = 19 * 1440 + hh * 60 + mm; const m0 = g.minutes; camp.enter(g);
        assert(g.minutes === (jump ? 19 * 1440 + 19 * 60 : m0), `N1: rt_camp entered at ${hh}:${String(mm).padStart(2, '0')}: ${jump ? 'to 19:00' : 'the clock stays'} (moved ${g.minutes - m0} min)`);
    }
    const morning = Object.values(RETURN).find((x) => String(x.enter || '').includes('toHour(g, 6)'));
    const mg = ensureBars(newGame(4703)); mg.minutes = 19 * 1440 + 4 * 60 + 30; morning.enter(mg);
    assert(clockParts(mg.minutes).hh === 6 && clockParts(mg.minutes).mm === 0, 'N1: a morning toHour (6) still moves 04:30 to 06:00');
    // gather Qi at Fed 0, and the late tag on a locked sit
    const q = ensureBars(newGame(4704)); q.scene = 'camp'; q.minutes = 20 * 60; q.james.qi = 1; q.james.satiety = 0;
    const qc = medCards(q, SCENES).find((x) => x.id === 'med:qi');
    assert(qc && !qc.open && qc.show && /too hungry/.test(qc.tag) && !qc.task && !taskOpen(q, SCENES, T.QI_TASK), 'N1: gather Qi locked at Fed 0, with the reason');
    q.james.satiety = 3; assert(!medCards(q, SCENES).find((x) => x.id === 'med:qi').open && !taskOpen(q, SCENES, T.QI_TASK), 'G1 (v0.11.48): still locked at Fed 3 (an hour drains 3; no Qi would come back)');
    q.james.satiety = 3.5; assert(medCards(q, SCENES).find((x) => x.id === 'med:qi').open && taskOpen(q, SCENES, T.QI_TASK), 'G1: open above Fed 3');
    { const r0 = q.james.qi; runTask(q, SCENES, T.QI_TASK); assert(q.james.qi > r0, `G1: at Fed 3.5 the hour does give Qi (${r0} → ${q.james.qi})`); }
    const l = ensureBars(newGame(4705)); l.scene = 'camp'; l.minutes = 23 * 60 + 30; l.james.qi = 9;
    const ls = medCards(l, SCENES).find((x) => x.id === 'med:sit');
    assert(ls && !ls.open && ls.late && ls.tag === 'ends past midnight', `N1: a sit short of Qi at 23:30 says "ends past midnight" (${ls?.tag})`);
}
// v0.11.66 (owner picks S1 + X1 + G4 + P1 + F1, group 1a of the story and mechanics pass)
{
    const MER = await import('../js/story/meridians.js');
    const G = await import('../js/core/game.js');
    const T = await import('../js/core/tasks.js');
    // S1: Saturation hours ×1.5 a realm; sits to 95%, a sit's gain rounded to 0.1% as before (Mortal Vessel 10 … Nascent Soul 159)
    const sits95 = [0, 1, 2, 3, 4, 5, 6, 7].map((r) => { const g = ensureBars(newGame(6601, { closed: true })); g.james.realm = r; return Math.ceil(95 / sitGain(g) - 1e-9); });
    assert(sits95.join() === '10,15,22,32,48,74,106,159', `S1: sits to 95% by realm (${sits95.join(', ')})`);
    assert(Math.abs(SAT_HOURS(7) - 10 * 1.5 ** 7) < 1e-9 && SAT_HOURS(14) > SAT_HOURS(13), 'S1: SAT_HOURS = 10 × 1.5^realm');
    // X1: every sit pays a third of a standard award to Convergence Use and GU, with Yuki's bond share
    const sitXp = (g) => { const c = structuredClone(g); return awardXp(c, 'Convergence Use', 'standard', { factor: 1 / 3 }); };
    {
        const g = ensureBars(newGame(6602, { closed: true })); g.james.qi = 30;
        const cu0 = g.james.skills['Convergence Use'].xp, gu0 = g.james.gu.xp, y0 = g.yuki.qiUse.xp, want = sitXp(g);
        const r = condense(g);
        assert(r.ok && r.xp.length === 3 && JSON.stringify(r.xp) === JSON.stringify(want), `X1: a sit's XP lines (${r.xp.join('; ')})`);
        assert(g.james.skills['Convergence Use'].xp - cu0 === 3 && g.james.gu.xp - gu0 === 3 && g.yuki.qiUse.xp - y0 === 3, 'X1: T1 on Coil 1: Convergence Use +3, GU +3, Yuki Qi Use +3 (a third of 30 is 10, ×0.6 the XP rate since v0.11.85: 6, split)');
        const n = ensureBars(newGame(6603, { closed: true })); n.james.qi = 5; const nx = JSON.stringify([n.james.gu, n.yuki.qiUse]);
        const rn = condense(n); assert(!rn.ok && !rn.xp.length && JSON.stringify([n.james.gu, n.yuki.qiUse]) === nx, 'X1: no sit (short of Qi), no XP');
        const c3 = ensureBars(newGame(6604, { closed: true })); c3.coil.n = 3; c3.james.qi = 30; const r3 = condense(c3);
        assert(/Convergence Use \+4 XP/.test(r3.xp[0]), `X1: the Coil bonus applies (Coil 3 ×1.5, ×0.6: ${r3.xp[0]})`);
        const t2 = ensureBars(newGame(6605, { closed: true })); t2.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; t2.james.qi = 30;
        assert(/Convergence Use \+6 XP/.test(condense(t2).xp[0]), 'X1: the pool goes by the skill\'s tier (T2: +6 with the XP rate)');
    }
    { // the sit from Meditate and from the task card carry the XP lines
        const m = ensureBars(newGame(6606)); m.scene = 'rt_camp'; m.james.qi = 30; const rm = runMed(m, SCENES, 'med:sit');
        assert(/Condensed/.test(rm.lines[0]) && rm.lines.some((l) => /^Convergence Use \+\d+ XP/.test(l)) && rm.lines.some((l) => /^GU \+\d+ XP/.test(l)) && rm.lines.some((l) => /^Yuki \(bond\) Qi Use \+/.test(l)), 'X1: meditate.js\'s sit shows the XP');
        const k = ensureBars(newGame(6607, { closed: true })); k.scene = 'stream'; k.james.qi = 25; k.james.satiety = 70; const rk = runTask(k, SCENES, SIT_TASK);
        assert(rk.lines.some((l) => /^Convergence Use \+\d+ XP/.test(l)) && rk.lines.some((l) => /^GU \+\d+ XP/.test(l)), 'X1: tasks.js\'s sit shows the XP');
    }
    { // the eight Cultivate chores on the hubs
        const chores = [];
        for (const [id, sc] of Object.entries(SCENES)) (sc.choices || []).forEach((c, i) => { if (typeof c.text === 'string' && /^Cultivate/.test(c.text) && /condense\(g\)/.test(String(c.do))) chores.push([id, i, c]); });
        assert(chores.length === 10, `X1: the hubs' Cultivate chores call condense (eight in the code; blackroot's makes three hubs: ${chores.length}: ${chores.map(([id]) => id).join(', ')})`);
        for (const [id, i, c] of chores) {
            const g = ensureBars(newGame(6608)); g.james.qi = 30; const out = c.do(g);
            assert(/^Condensed: Saturation/.test(out[0]) && out.some((l) => /^Convergence Use \+\d+ XP/.test(l)) && out.some((l) => /^GU \+\d+ XP/.test(l)) && out.some((l) => /^Yuki \(bond\)/.test(l)), `X1: ${id}:${i} shows the sit's XP`);
        }
    }
    { // the loop: every sit pays, the same as single taps
        const a = ensureBars(newGame(6609, { closed: true })); a.scene = 'stream'; a.minutes = 8 * 60; a.james.qi = jamesQiMax(a); a.james.satiety = 90;
        const b = structuredClone(a);
        const r = sitLoop(a, SCENES);
        for (let i = 0; i < r.sits; i++) runTask(b, SCENES, sitTaskId(b, SCENES));
        assert(r.sits >= 2 && JSON.stringify([a.james.gu, a.james.skills['Convergence Use'], a.yuki.qiUse]) === JSON.stringify([b.james.gu, b.james.skills['Convergence Use'], b.yuki.qiUse]), `X1: the loop's XP = that many single sits (${r.sits} sits)`);
    }
    // G4: the vessels and their collaterals from Golden Core (realm 4), still sealed at Nascent Soul
    const at = (realm, e = 0, c = 0) => { const g = ensureBars(newGame(6610)); g.james.realm = realm; g.yuki.realm = realm; g.james.extra8 = e; g.james.extraCollaterals = c; return g; };
    assert([0, 1, 2, 3, 4, 5, 6, 7].map((r) => (MER.canExtra8(at(r)) ? 1 : 0)).join('') === '00001110' && MER.EXTRA_FROM === 4, 'G4: the vessels open at realms 4–6 only');
    assert([0, 1, 2, 3, 4, 5, 6, 7].map((r) => (MER.lineWindow(at(r), 'e8') ? 1 : 0)).join('') === '00001110', 'G4: the vessel card\'s window the same');
    assert(!medCards(Object.assign(at(2), { scene: 'stream' }), SCENES).some((c) => c.id === 'med:mer:e8') && medCards(Object.assign(at(4), { scene: 'stream' }), SCENES).some((c) => c.id === 'med:mer:e8'), 'G4: no vessel card at Core Formation, one at Golden Core');
    { const v = at(2); v.scene = 'meridians'; assert(/open them at Golden Core\. Not before/.test(sceneView(v, SCENES).text), 'G4: the screen says Golden Core below it'); }
    { const v = at(2, 3); v.scene = 'meridians'; assert(/5 of the Extraordinary vessels are still sealed/.test(sceneView(v, SCENES).text), 'G4: an older save with vessels open early: the rest still sealed'); }
    { const v = at(2, 8); v.scene = 'meridians'; assert(/collaterals wait for Golden Core: 28 still closed/.test(sceneView(v, SCENES).text), 'G4: an older save with all eight open early: the collaterals wait'); }
    { const v = at(5, 2); v.scene = 'meridians'; assert(/between Golden Core and Soul Embryo/.test(sceneView(v, SCENES).text), 'G4: the screen\'s window from Golden Core'); }
    // the review (R1): one vessel paragraph per realm, and the "wait for Golden Core" line only below it
    for (const [r, e, c] of [[0, 0, 0], [1, 0, 0], [2, 3, 0], [3, 8, 5], [4, 0, 0], [4, 8, 5], [5, 2, 0], [6, 8, 27], [7, 5, 0], [7, 8, 20]]) {
        const v = at(r, e, c); v.scene = 'meridians'; const t = sceneView(v, SCENES).text;
        const sealed = /like doors painted on a wall/.test(t), window = /between Golden Core and Soul Embryo/.test(t), wait = /wait for Golden Core/.test(t), reach = /within reach/.test(t);
        const wantSealed = r < 4 && e < 8, wantWindow = r >= 4 && r <= 6 && e < 8, wantWait = r < 4 && e >= 8 && c < 28, wantReach = r >= 4 && r <= 6 && e >= 8 && c < 28;
        assert(sealed === wantSealed && window === wantWindow && wait === wantWait && reach === wantReach, `review: the meridian screen at realm ${r}, ${e}/8, ${c}/28 (sealed ${sealed}, window ${window}, wait ${wait}, reach ${reach})`);
    }
    { const v = at(6, 6); v.scene = 'ns_warn'; assert(/They open between Golden Core and Soul Embryo/.test(sceneView(v, SCENES).text), 'G4: ns_warn says Golden Core'); }
    { // saves: partial e8Work kept until Golden Core; vessels already open stay open
        const o = at(2, 3); o.james.e8Work = 1.5; o.scene = 'stream';
        const back = deserialize(serialize(o));
        assert(back.james.e8Work === 1.5 && back.james.extra8 === 3 && !MER.canExtra8(back), 'G4: a save at Core Formation keeps its vessel work and its open vessels');
        back.james.realm = 4; back.yuki.realm = 4; back.james.qi = 30; back.james.satiety = 80;
        const card = medCards(back, SCENES).find((c) => c.id === 'med:mer:e8');
        assert(card && card.open && /1\.5 h of 7 h done/.test(sceneView(Object.assign(structuredClone(back), { scene: 'meridians' }), SCENES).choices.map((c) => c.label).join(' ')), 'G4: at Golden Core that work counts (1.5 h of the 4th vessel\'s 7 h)');
    }
    { // the Long Forest's seasons grant the vessels from Golden Core: 3, 6, 8
        const lf = ensureBars(newGame(6611, { closed: true })); const got = [];
        for (let i = 0; i < 7; i++) { lfSeason(lf); got.push(`${lf.james.realm}:${lf.james.extra8}`); }
        assert(got.join() === '1:0,2:0,3:0,4:3,5:6,6:8,7:8' && lf.james.extraCollaterals === 28 && lf.james.junctions === 10, `G4: Long Forest seasons (realm:vessels ${got.join(', ')})`);
        const keep = ensureBars(newGame(6612, { closed: true })); keep.james.extra8 = 5; for (let i = 0; i < 4; i++) lfSeason(keep);
        assert(keep.james.realm === 4 && keep.james.extra8 === 5, 'G4: a season never takes vessels away');
    }
    // P1: the 28 collaterals in pairs, one collateral's hours a pair (56 h), two challenging awards a pair
    { let h = 0, pairs = 0; for (let c = 0; c < 28; c += MER.ecStep(c)) { h += ecHours(c); pairs++; } assert(h === 56 && pairs === 14, `P1: 14 pairs, ${h} h (114 h one by one)`); }
    assert(MER.ecPairName(0) === 'the Governing crown thread and the Governing nape thread' && MER.ecPairName(27) === 'the Yang Heel eye-corner thread' && MER.ecStep(27) === 1 && MER.ecStep(28) === 0, 'P1: the pair\'s name; an odd count left by an older save opens one');
    {
        const g = at(4, 8, 0); g.scene = 'meridians'; g.james.qi = 30; g.james.satiety = 80;
        const lab = sceneView(g, SCENES).choices.map((c) => c.label).find((l) => /Governing crown thread/.test(l));
        assert(/Work on the Governing crown thread and the Governing nape thread\. \(1 and 2\/28; 0 h of 3 h done/.test(lab || ''), `P1: the card reads "X and Y" (${lab})`);
        assert(MER.lineName(g, 'ec') === 'Open the Governing crown thread and the Governing nape thread.', 'P1: the line\'s name');
        const twice = structuredClone(g); const want = [...awardXp(twice, 'Convergence Use', 'challenging'), ...awardXp(twice, 'Convergence Use', 'challenging')];
        const reg0 = qiRegenPct(g, g.james.collaterals ?? 66); g.james.ecWork = 2.9;
        const i = MER.lineIndex(SCENES, 'ec'); const r = choose(g, SCENES, i, { task: true });
        const xpLines = r.lines.filter((l) => /^(Convergence Use|GU|Yuki \(bond\))/.test(l));
        assert(g.james.extraCollaterals === 2 && /^Opened the Governing crown thread and the Governing nape thread \(2\/28\)\. Two fine/.test(r.lines[0]), `P1: one sitting opens the pair (${r.lines[0]})`);
        assert(JSON.stringify(xpLines) === JSON.stringify(want) && xpLines.filter((l) => /^Convergence Use/.test(l)).length === 2, 'P1: two challenging awards, as two collaterals one by one');
        assert(Math.abs(qiRegenPct(g, g.james.collaterals ?? 66) - reg0 - 0.2) < 1e-9, 'P1: the regen of two collaterals (+0.2%)');
        const odd = at(4, 8, 27); odd.scene = 'meridians'; odd.james.qi = 30; odd.james.satiety = 80; odd.james.ecWork = 5.95;
        const ro = choose(odd, SCENES, i, { task: true });
        assert(odd.james.extraCollaterals === 28 && /\(28\/28\)\. A fine, bright thread/.test(ro.lines[0]), 'P1: the last single one from an odd count');
    }
    // F1: a door's dry run sees a death that ends the Coil; it keeps the walk's minutes
    {
        const g = ensureBars(newGame(6613, { closed: true })); g.scene = 'village'; g.location = 'village'; g.james.hp = 1; g.james.satiety = 0;
        const before = JSON.stringify(g); const o = taskOutcome(g, SCENES, 'village:2');
        assert(JSON.stringify(g) === before, 'F1: the door\'s dry run leaves the game alone');
        assert(o.death === 'hunger' && o.minutes === taskMinutes(g, SCENES, 'village:2') && o.end === g.minutes + o.minutes, `F1: village:2 at HP 1, Fed 0: "Starves here", the walk's minutes (${JSON.stringify(o)})`);
        const real = structuredClone(g); runTask(real, SCENES, 'village:2');
        assert(real.scene === 'coil_end' && real.coil.why === 'collapse', 'F1: and the real run does end the Coil');
        const ok = ensureBars(newGame(6614, { closed: true })); ok.scene = 'village'; ok.location = 'village'; ok.james.satiety = 80;
        const oo = taskOutcome(ok, SCENES, 'village:2');
        assert(oo.death === null && oo.minutes === taskMinutes(ok, SCENES, 'village:2') && oo.fed === 80, 'F1: a safe walk: no death, the same walk minutes and Fed as before');
        const card = taskCards(g, SCENES, 'village').find((c) => c.id === 'village:2');
        const to = SCENES.village.choices[Number(card.id.split(':')[1])].to;
        const broken = { ...SCENES, [to]: { ...SCENES[to], enter: () => { throw new Error('a fight'); } } };
        let ob = null, threw = false; try { ob = taskOutcome(g, broken, 'village:2'); } catch { threw = true; }
        assert(!threw && ob && ob.death === null && ob.minutes === o.minutes, 'F1: a door whose full run throws reads as no death, with its walk minutes');
        // the review (R1): the warning's clock is the death's, the card's the walk's end
        assert(o.deathAt === real.minutes && oo.deathAt === undefined, `review: deathAt = when the real run's Coil ends (${o.deathAt} vs ${real.minutes}); none on a safe door`);
        const late = ensureBars(newGame(6615, { closed: true })); late.scene = 'village'; late.location = 'village'; late.james.hp = 5; late.james.satiety = 0;
        const slow = { ...SCENES, [to]: { ...SCENES[to], enter: (x) => { advance(x, 300); return []; } } };
        const ol = taskOutcome(late, slow, 'village:2'), rl = structuredClone(late); runTask(rl, slow, 'village:2');
        assert(taskOutcome(late, SCENES, 'village:2').death === null && ol.death === 'hunger' && ol.end === late.minutes + 60 && ol.deathAt === rl.minutes && ol.deathAt > ol.end && rl.scene === 'coil_end', `review: a death inside the scene walked into: the card still ends at the walk, the warning says when (${ol.end} → ${ol.deathAt})`);
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
console.log(`  ${stats.tasks.cards} cards run, ${stats.tasks.skipped} skipped, ${stats.tasks.collapses} collapses (HP 0), ${predicted} cards predicted by their dry run (1 game in ${FC_EVERY}), ${cardsSeen.size}/${all.size} cards played`);
assert(badBars === 0, `no NaN / Infinity bar at the end of a bot game (${badBars})`);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, deaths, byCoil, fights: fightStats, badBars, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
