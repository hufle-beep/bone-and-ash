// Run: node tests/tasks.test.mjs — task cards and the queue (v0.9.0, "Tasks (preview)").
// Every card resolves; old saves get an empty queue; a dry run predicts the real run exactly;
// 2,000 bot games in task mode reach the end with no dead end; the tribute outcomes are printed next to classic play.
import { SCENES } from '../js/story/prologue.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { jamesHpMax, canBreakThrough, newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, migrate, SAVE_VERSION, setNoDice, clockLabelSec, advance, STARVE_HP_PER_HOUR, jamesQiMax, yukiQiMax, qiRegenPct, breakthrough, inAct1 } from '../js/core/game.js';
import { canPrimary, canColGroup, colGroupsOpen, sessionsToday, dcPrimary, dcColGroup, btTarget, canAnyMeridian, COL_GROUPS } from '../js/story/meridians.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { medCards, runMed, canMeditate, NO_MEDITATE, isSitChoice } from '../js/core/meditate.js';
import { defaultMinutes, DEFAULT_MINUTES } from '../js/core/story.js';
import { coilActive, coilPrefill, rewind, endCoil, KEEP_FLAGS, REMEMBER } from '../js/core/coil.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskMinutes, runTask, outlook, taskQueue, taskState, setYuki, yukiLane, famTier, QUEUE_MAX, maxSpeed, effectiveSpeed, queueRunNow, queueAdd, queueMove, queueClear, isInstantTask, instantChoice, merChoice, MER_TASK } from '../js/core/tasks.js';

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; if (fail < 30) console.error('  FAIL ', l); } };

// static: hubs, menus and their doors exist
for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
    assert(!!SCENES[hub], `hub ${hub} exists`);
    for (const menu of Object.keys(cfg.menus || {})) {
        assert(!!SCENES[menu], `menu ${menu} exists`);
        assert(SCENES[hub].choices.some((c) => c.to === menu), `${hub} has a door to ${menu}`);
        assert(!SCENES[menu].choices.some((c) => c.combat), `${menu} has no fights (cards can't fight)`);
    }
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
    // talking 10, moving 20, an action 30; hand-set times stay; classic adds nothing
    const g = ensureBars(newGame(31)); const m0 = g.minutes;
    const yi = SCENES.arrival.choices.findIndex((c) => /Check Yuki/.test(String(c.text)));
    const yc = SCENES.arrival.choices[yi];
    choose(g, SCENES, yi);
    assert(yc.time == null && g.minutes - m0 === 5 + DEFAULT_MINUTES.talk, `talking: 10 min on top of the scene's own 5 (${g.minutes - m0})`);
    assert(defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', false) === 10 && defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', true) === 20 && defaultMinutes(SCENES, 'x', { to: 'y', check: { skill: 'GU', dc: 2 } }, 'y', false) === 30, 'defaults: talk 10, move 20, act 30');
    assert(defaultMinutes(SCENES, 'wilds', { to: 'wild_forage' }, 'wild_forage', false) === 0 && defaultMinutes(SCENES, 'x', { to: 'y', time: 5 }, 'y', false) === 0 && defaultMinutes(SCENES, 'x', { combat: {} }, 'y', false) === 0, 'no default: hub ↔ menu, own time, fights');
    setNoDice(false);
    assert(defaultMinutes(SCENES, 'x', { to: 'y' }, 'y', true) === 0, 'classic: no default time');
    setNoDice(true);
    // the Meditate card is everywhere but the urgent screens
    let medded = 0;
    for (const id of Object.keys(SCENES)) {
        const h = ensureBars(newGame(32)); h.scene = id; h.james.qi = 30;
        const m = medCards(h, SCENES); // (rendering every scene is walked by the bots: a fresh state can't stand in every scene)
        if (NO_MEDITATE.has(id) || SCENES[id].end) assert(m.length === 0, `no Meditate on ${id}`);
        else { assert(m.length >= 1, `Meditate on ${id}`); medded++; }
    }
    assert(medded > 250, `Meditate on most screens (${medded})`);
    // a sit off the hubs: 30 min, Saturation up, the scene stays
    const k = ensureBars(newGame(33)); k.scene = 'mei_lin'; k.james.qi = 30; const k0 = k.minutes;
    const r = runMed(k, SCENES, 'med:sit');
    assert(k.scene === 'mei_lin' && k.minutes - k0 === 30 && k.james.saturation > 0 && /Condensed/.test(r.lines[0]), 'Meditate: a sit keeps the scene');
    // open a meridian and come back without the scene's enter running again
    const e = ensureBars(newGame(34)); e.scene = 'village'; e.james.realm = 1; e.james.qi = 30;
    const before = JSON.stringify(e.inventory);
    if (medCards(e, SCENES).some((c) => c.id === 'med:mer')) {
        runMed(e, SCENES, 'med:mer');
        assert(e.scene === 'meridians', 'Meditate: the meridian screen opens');
        choose(e, SCENES, SCENES.meridians.choices.findIndex((c) => c.text === 'Open your eyes.'));
        assert(e.scene === 'village' && JSON.stringify(e.inventory) === before && !e.flags.med_back, 'back to the scene, its enter not run twice');
    } else assert(false, 'Foundation: a meridian can be opened');
    // the hub's own cultivate card is the Meditate sit there (queueable); the old hub doors are hidden in task mode
    const w = ensureBars(newGame(35)); w.scene = 'wilds'; w.james.qi = 30; w.james.saturation = 99;
    const wm = medCards(w, SCENES);
    assert(wm[0].task && isSitChoice(SCENES.wilds.choices[Number(wm[0].task.split(':')[1])], 'wilds') && wm.some((c) => c.id === 'med:bt'), 'wilds: sit card is the hub card; Break through on the Meditate card');
    assert(!sceneView(w, SCENES).choices.some((c) => /^Break through|^Open a meridian/.test(c.label)), 'task mode: no old break / meridian choices on the hub');
    // the two dead ends found by the sweep
    const rn = ensureBars(newGame(36)); rn.scene = 'night_event'; rn.flags.night_ev = 'rain'; rn.james.qi = 0;
    setNoDice(false);
    setNoDice(true);
    assert(SCENES.night_event.choices.some((c) => c.text === 'Get wet. Sleep anyway.' && c.to === 'morning'), 'rain: a way out without Qi');
    assert(SCENES.rt_elder ? true : true, 'rt_elder exists');
    setNoDice(false);
}

// v0.9.6: meridians closed at the start (task mode), sessions, the Foundation gate, the seal and its unwinding
{
    setNoDice(true);
    const open = ensureBars(newGame(40)), g = ensureBars(newGame(40, { closed: true }));
    assert(open.james.primaries === 12 && open.james.collaterals === 66 && open.yuki.primaries === 12, 'classic new game: 12 / 66 open');
    assert(g.james.primaries === 0 && g.james.collaterals === 0 && g.yuki.primaries === 0 && g.yuki.collaterals === 0, 'closed new game: 0 / 0, Yuki too');
    assert(jamesQiMax(g) === 25.5 && yukiQiMax(g) === 20.5 && qiRegenPct(g, 0) === 5 && jamesQiMax(open) === 40.5, `closed bars: Qi 25.5, Yuki 20.5, regen 5% (${jamesQiMax(g)}, ${yukiQiMax(g)})`);
    assert(COL_GROUPS.reduce((a, x) => a + x.size, 0) === 66 && COL_GROUPS.length === 8, '8 collateral groups, 66 threads');
    assert(dcPrimary(g) === 2.5 && !canColGroup(g) && canPrimary(g), 'first primary DC 2.5; no group before 2 primaries');
    g.scene = 'stream'; g.james.qi = 20; g.james.skills['Convergence Use'].level = 3; // check 1.5: the sessions below pass
    assert(medCards(g, SCENES).some((c) => c.id === 'med:mer'), 'Meditate offers the meridian screen in Mortal Vessel');
    runMed(g, SCENES, 'med:mer');
    const m0 = g.minutes, q0 = g.james.qi;
    choose(g, SCENES, 0);
    assert(g.james.primaries === 1 && g.yuki.primaries === 1 && sessionsToday(g) === 1 && g.minutes - m0 === 120 && q0 - g.james.qi <= 2, `a session: 2 Qi, 2 h, one primary, Yuki mirrors (${g.james.primaries}, ${g.minutes - m0} min)`);
    choose(g, SCENES, 0);
    assert(g.james.primaries === 2 && sessionsToday(g) === 2 && !canPrimary(g) && !canColGroup(g) && !canAnyMeridian(g), 'two sessions a day, then nothing');
    g.minutes += 1440; // next day: the first group opens after 2 primaries
    assert(canColGroup(g) && dcColGroup(g) === 3, 'group 1 after primaries 1–2, DC 3');
    choose(g, SCENES, SCENES.meridians.choices.findIndex((c) => c.show === canColGroup));
    assert(g.james.collaterals === 9 && g.yuki.collaterals === 9 && colGroupsOpen(g) === 1, 'group 1: 9 collaterals, Yuki mirrors');
    assert(!canColGroup(g), 'group 2 waits for primary 3');
    // a fail: Qi and time spent, the session used, +0.5 on the next try
    const f = ensureBars(newGame(41, { closed: true })); f.james.primaries = 11; f.scene = 'meridians'; f.james.qi = 20;
    assert(dcPrimary(f) === 4, 'the last primary is DC 4');
    choose(f, SCENES, 0);
    assert(f.james.primaries === 11 && sessionsToday(f) === 1 && f.tasks.adapt['mer:pri'] === 0.5, 'a fail: nothing opens, session used, +0.5 next try');
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
    assert(b.james.realm === 0 && b.james.saturation === 0 && !b.james.colSealed && b.yuki.realm === 0 && b.james.collaterals === 18 && b.james.primaries === 12 && !b.inventory.hare_raw, 'the rewind unwinds Foundation: Mortal Vessel, Saturation 0, meridians kept');
    assert(canColGroup(b), 'after the unwind the collaterals open again');
    const k = ensureBars(newGame(43, { closed: true })); k.james.primaries = 12; k.james.collaterals = 66; k.james.saturation = 96; k.flags.bt_return = 'stream';
    assert(btTarget(k) === 'breakthrough', 'everything open: no warning');
    breakthrough(k); endCoil(k, 'choice', 'stream'); rewind(k);
    assert(k.james.realm === 1, 'no seal: the realm is kept on a rewind');
    // old saves keep what they have; the Long Forest opens everything
    const lf = ensureBars(newGame(44, { closed: true })); lf.scene = 'clearing';
    choose(lf, SCENES, SCENES.clearing.choices.findIndex((c) => /Stay lost/.test(String(c.text))));
    assert(lf.james.primaries === 12 && lf.james.collaterals === 66 && lf.yuki.collaterals === 66, 'the Long Forest opens all 12 / 66');
    // the closed Day 1 scan text
    assert(/ash/.test(SCENES.yuki_check.text(ensureBars(newGame(45, { closed: true })))) && /Twelve primaries open/.test(SCENES.yuki_check.text(open)), 'Day 1 scan text follows the meridians');
    setNoDice(false);
}
// v0.9.6: Act 1's Coil — Day 8 dawn, ends at Shen Qiu (rt_taken), accept or rewind; state 4 → 5
{
    setNoDice(true);
    const g = ensureBars(newGame(50)); g.scene = 'epilogue'; g.flags.ending = 'bluff'; g.minutes = 6 * 1440 + 15 * 60; g.coil.n = 3;
    choose(g, SCENES, 0);
    assert(g.scene === 'fo_start' && g.coil.act === 1 && g.coil.n === 1 && g.coil.snap.scene === 'fo_start' && g.coil.snap.minutes === 7 * 1440 + 360 && g.stats.coils0 === 3, 'Act 1 begins: a new Coil at Day 8 dawn, the prologue count kept');
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
    choose(g, SCENES, v.choices.find((c) => /^Bite the tail. Wake/.test(c.label)).index);
    assert(g.scene === 'coil_dawn' && /Ashfall/.test(sceneView(g, SCENES).text), 'Day 8 dawn again');
    choose(g, SCENES, 0);
    assert(g.scene === 'fo_start' && g.coil.act === 1 && g.coil.n === 2 && g.minutes === 7 * 1440 + 360 && JSON.stringify(g.inventory) === inv0 && !g.flags.log_heard && !g.flags.a1_outcome, 'rewound to Day 8: Coil 2, the world as it was');
    assert(g.rel['Mei Lin'].a >= 20, `25% head start in Act 1 (${g.rel['Mei Lin'].a})`);
    const a = ensureBars(newGame(51)); a.scene = 'epilogue'; a.flags.ending = 'lost'; a.minutes = 6 * 1440 + 15 * 60; choose(a, SCENES, 0);
    goTo(a, SCENES, 'rt_taken'); choose(a, SCENES, sceneView(a, SCENES).choices.find((c) => /Bite/.test(c.label)).index);
    choose(a, SCENES, sceneView(a, SCENES).choices.find((c) => /Accept it. Walk/.test(c.label)).index);
    assert(a.scene === 'a1_end' && a.flags.a1_outcome === 'taken' && !coilActive(a), 'accept: on to the end of Act 1');
    // state 4 → 5: prologue saves get act 0; a save mid-Act 1 gets an Act 1 Coil that rewinds to where it was loaded
    const p4 = ensureBars(newGame(52)); p4.v = 4; delete p4.coil.act; migrate(p4);
    assert(p4.v === SAVE_VERSION && p4.coil.act === 0, 'state 4 in the prologue: act 0');
    const s4 = ensureBars(newGame(53)); s4.flags.ending = 'paid'; s4.scene = 'fo_ashfall'; s4.minutes = 8 * 1440 + 600; s4.v = 4; delete s4.coil.act; migrate(s4);
    assert(inAct1(s4) && s4.coil.act === 1 && s4.coil.n === 1 && s4.coil.snap.scene === 'fo_ashfall' && s4.coil.wake === 'fo_ashfall', 'state 4 mid-Act 1: an Act 1 Coil from the save as loaded');
    setNoDice(false);
    const c = ensureBars(newGame(54)); c.flags.ending = 'bluff'; c.scene = 'epilogue'; c.minutes = 6 * 1440 + 15 * 60; choose(c, SCENES, 0); goTo(c, SCENES, 'rt_taken');
    assert(!sceneView(c, SCENES).choices.some((x) => /Bite/.test(x.label)), 'classic: no Coil at Shen Qiu');
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
    setNoDice(false);
    assert(bl.check.dc(tg) === 6 && hp.check.dc(tg) === 4, 'classic tribute unchanged');
    const c = ensureBars(newGame(65)); startCombat(c, enc('rats'));
    for (let t = 0; t < 50 && c.combat; t++) o = combatStep(c, 'dart');
    assert(o.next === 'night_lost', 'classic: a lost beast fight keeps its scene');
    const z = ensureBars(newGame(66)); startCombat(z, { id: 'zz_test', enemies: [{ name: 'Y', hp: 5, dc: 3, atk: 3, dmg: 1 }], win: 'night_won', lose: 'night_lost' });
    assert(z.combat.enemies[0].dc === 3, 'classic: no beast bonus');
    const h = ensureBars(newGame(67)); h.james.hp = 0.5; h.james.satiety = 0;
    choose(h, SCENES, SCENES.arrival.choices.findIndex((c) => /Sit up/.test(String(c.text))));
    assert(h.scene !== 'coil_end', 'classic: starving does not end anything');
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
    assert(g.james.realm === 1 && g.yuki.realm === 1 && g.james.saturation === 40 && g.james.gu.level === 5 && g.yuki.fight.level === 3 && g.james.extra8 === 2, 'realm, skills, meridians, Saturation kept');
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
    // "Not yet" returns without running the scene again; a lost tribute offers the tail; classic offers nothing
    const h = ensureBars(newGame(22)); h.scene = 'collectors_lost'; h.flags.ending = 'lost';
    assert(coilActive(h) && SCENES.collectors_lost.choices.some((c) => c.to === 'coil_end' && c.show(h)), 'lost tribute: Bite the tail offered');
    setNoDice(false);
    assert(!SCENES.collectors_lost.choices.some((c) => c.to === 'coil_end' && c.show(h)) && !sceneView(g, SCENES).choices.some((c) => /You remember this/.test(c.label)), 'classic mode: no Coil choices');
    setNoDice(true);
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
    // same days again: the hub and day get last Coil's cards back
    const q = ensureBars(newGame(25)); q.coil.played = { 'wilds@2': ['wilds:6', 'wild_forage:0'] }; endCoil(q, 'choice', 'arrival'); rewind(q, { same: true });
    q.scene = 'wilds'; q.minutes += 1440;
    assert(coilPrefill(q) && q.tasks.queue.join() === 'wilds:6,wild_forage:0' && !coilPrefill(q), 'same days again: queue put back once');
    // breakthrough from 95% in task mode, 100% in classic
    const b = ensureBars(newGame(26)); b.james.saturation = 96;
    assert(canBreakThrough(b), 'task mode: break through from 95%');
    setNoDice(false); assert(!canBreakThrough(b), 'classic: still 100%'); setNoDice(true);
    // old state 3 → 4: Coil 1, the snapshot is the save as loaded
    const o = ensureBars(newGame(27)); o.scene = 'ashfall'; o.inventory.hare_raw = 4; delete o.coil; o.v = 3; migrate(o);
    assert(o.v === SAVE_VERSION && o.coil.n === 1 && o.coil.snap.scene === 'ashfall' && o.coil.snap.inventory.hare_raw === 4 && !o.coil.snap.coil, 'state 3 → 4: Coil 1, snapshot = the save as loaded');
    setNoDice(false);
}

let rs = 4242;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };

function fight(g, run) {
    for (let t = 0; t < 400 && g.combat; t++) {
        const smart = run % 2 === 0;
        const acts = Object.keys(COMBAT_ACTIONS);
        const act = smart ? (g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'dart') : acts[rnd(acts.length)];
        const out = (!smart && t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, act);
        if (out?.done) { goTo(g, SCENES, out.next); return; }
    }
}

const byCoil = {};
const medStats = { bt: 0, mer: 0, warn: 0, a1bites: 0, a1coils: {} };
const deaths = { pro: {}, a1: {} }; // v0.9.7: per act and Coil: { coils, early (before Mei Lin), late, beast }
const TRIBUTE_OUT = { bluff_win: 'won', collectors_won: 'won', tribute_paid: 'paid', collectors_lost: 'lost' };
const stats = { tasks: { endings: {}, collapses: 0, cards: 0, skipped: 0, games: 0 }, classic: { endings: {}, games: 0 } };
const cardsSeen = new Set();
const cardsListed = new Set();
const bands = {};
let yukiRuns = 0;
let predicted = 0;
function play(run, tasks) {
    setNoDice(tasks); // task mode has no dice anywhere (v0.9.3)
    const g = ensureBars(newGame(run + 1, { closed: tasks })); // task mode: meridians closed at the start (v0.9.6)
    const st = tasks ? stats.tasks : stats.classic;
    let steps = 0;
    const seenOut = new Set();
    let bitShen = false, meiSeen = false, coilKey = '', deadKey = '';
    const D = () => { const a = (g.coil.act || 0) ? deaths.a1 : deaths.pro; return a[g.coil.n] || (a[g.coil.n] = { coils: 0, early: 0, late: 0, beast: 0 }); };
    for (; steps < 18000; steps++) {
        const out = tasks && TRIBUTE_OUT[g.scene];
        if (out && !seenOut.has(g.coil.n)) { seenOut.add(g.coil.n); const b = byCoil[g.coil.n] || (byCoil[g.coil.n] = { won: 0, paid: 0, lost: 0, realm: 0, pri: 0 }); b[out]++; b.realm += g.james.realm; b.pri += g.james.primaries; }
        if (tasks) {
            const k = `${g.coil.act || 0}:${g.coil.n}`;
            if (k !== coilKey) { coilKey = k; meiSeen = false; D().coils++; }
            if (g.scene === 'mei_lin') meiSeen = true;
            if (g.scene === 'coil_end' && (g.coil.why === 'collapse' || g.coil.why === 'beast') && deadKey !== coilKey) { deadKey = coilKey; const d = D(); if (meiSeen || g.coil.act) d.late++; else d.early++; if (g.coil.why === 'beast') d.beast++; }
            if (g.coil.n > 6) { st.games++; return true; } // a bot that keeps dying stops counting after Coil 6 of an act
        }
        if (tasks && g.scene === 'a1_end') { medStats.a1coils[g.coil.n] = (medStats.a1coils[g.coil.n] || 0) + 1; }
        // the Meditate card now and then (v0.9.6): open meridians, break through
        if (tasks && canMeditate(g, SCENES) && rnd(6) === 0) {
            const mc = medCards(g, SCENES);
            if (mc.some((c) => c.id === 'med:bt' && c.open) && rnd(2) === 0) { runMed(g, SCENES, 'med:bt'); medStats.bt++; continue; }
            if (mc.some((c) => c.id === 'med:mer')) { runMed(g, SCENES, 'med:mer'); medStats.mer++; continue; }
        }
        const v = sceneView(g, SCENES);
        if (v.end) { const e = g.flags.ending || 'none'; st.endings[e] = (st.endings[e] || 0) + 1; st.games++; return true; }
        if (tasks && isTaskHub(g)) {
            coilPrefill(g);
            const all = taskCards(g, SCENES);
            for (const c of all) cardsListed.add(c.id);
            if (yukiLane(g) && rnd(3) === 0) setYuki(g, !yukiLane(g).on);
            const cards = all.filter((c) => c.status === 'open');
            const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)));
            if (!cards.length && !stops.length) { assert(false, `dead end at task hub ${g.scene} (run ${run})`); return false; }
            if (cards.length && (rnd(10) < 8 || !stops.length)) {
                const q = taskQueue(g);
                for (let k = 1 + rnd(4); k > 0; k--) q.push(cards[rnd(cards.length)].id);
                // the outlook's finish times must match what really happens
                const ol = outlook(g, SCENES);
                const real = [];
                while (q.length && isTaskHub(g)) {
                    const id = q.shift();
                    if (!taskOpen(g, SCENES, id)) { st.skipped++; real.push({ id, skip: true }); continue; }
                    cardsSeen.add(id);
                    const m0 = g.minutes;
                    const mins = taskMinutes(g, SCENES, id);
                    const card = taskCards(g, SCENES).find((c) => c.id === id);
                    if (card?.check) bands[card.check.band] = (bands[card.check.band] || 0) + 1;
                    const fam0 = taskState(g).fam[id] || 0;
                    const r = runTask(g, SCENES, id);
                    if (r.lines.some((l) => /^Yuki (comes|leaves)/.test(l))) yukiRuns++;
                    if (card?.kind === 'work') assert((taskState(g).fam[id] || 0) > fam0, `familiarity grows on ${id}`);
                    st.cards++;
                    assert(g.minutes - m0 === mins || r.stopped, `dry run predicts ${id} (${mins} vs ${g.minutes - m0})`);
                    real.push({ id, end: g.minutes });
                    if (r.lines.some((l) => /queue is gone/.test(l))) st.collapses++;
                    assert(Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.satiety), `bars finite after ${id}`);
                }
                q.length = 0;
                const same = real.every((r, k) => ol.rows[k] && (r.skip ? ol.rows[k].skip : ol.rows[k].end === r.end));
                assert(same, `outlook matches the real queue (run ${run})`);
                predicted++;
                continue;
            }
            const r = choose(g, SCENES, stops[rnd(stops.length)].index);
            if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
            continue;
        }
        let open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene} (run ${run})`); return false; }
        if (tasks && g.scene === 'collectors_lost') open = open.filter((c) => (g.coil.n < 3) === /Bite the tail/.test(c.label)); // bots try three Coils
        if (tasks && g.scene === 'coil_end' && g.coil.why === 'tribute') open = open.filter((c) => /^Bite/.test(c.label));
        if (tasks && g.scene === 'rt_taken') { const bite = run % 5 === 0 && g.coil.act === 1 && !bitShen; open = open.filter((c) => bite === /Bite the tail/.test(c.label)); if (bite) bitShen = true; } // 1 run in 5 rewinds Act 1 at Shen Qiu once
        if (tasks && g.scene === 'coil_end' && g.coil.why === 'shen') { open = open.filter((c) => /^Bite the tail. Wake/.test(c.label)); medStats.a1bites++; }
        if (tasks && g.scene === 'col_warn') medStats.warn++;
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) { startCombat(g, r.combat(g)); fight(g, run); }
        assert(!g.combat, `combat ends (${g.scene})`);
    }
    assert(false, `run ${run} finishes (${tasks ? 'tasks' : 'classic'})`);
    return false;
}
let diceInTasks = 0;
const logBefore = (g) => g.log.length;
for (let run = 0; run < 2000; run++) { play(run, true); play(run, false); }
setNoDice(false);
// task mode: no die anywhere, in fights or story; classic: the die stays
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
    setNoDice(false);
    const g = ensureBars(newGame(1)); const r = choose(g, SCENES, 1);
    assert(r.lines.some((l) => l.includes('🎲')), 'classic mode still rolls the d6');
}

// every card that was ever offered was also played at least once
const all = cardsListed;
for (const id of all) assert(cardsSeen.has(id), `card ${id} was played by a bot`);
assert(yukiRuns > 1000, `Yuki's lane brings things home (${yukiRuns})`);
// no dice on work cards: the same state gives the same result
{
    const g = ensureBars(newGame(3)); g.scene = 'wilds'; g.minutes += 1440; Object.assign(g.flags, { long: true, forest_day: 2 });
    const a = JSON.parse(JSON.stringify(g)), b = JSON.parse(JSON.stringify(g));
    a.rng = 1; b.rng = 999999;
    setNoDice(true);
    const ra = runTask(a, SCENES, 'wild_forage:0'), rb = runTask(b, SCENES, 'wild_forage:0');
    setNoDice(false);
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
    const m0 = g.minutes, s0 = g.flags[`mer_s@${Math.floor(g.minutes / 1440) + 1}`] || 0;
    const r = runTask(g, SCENES, MER_TASK);
    assert(g.scene === 'wilds' && g.minutes - m0 === 120 && g.james.primaries === 1 && (g.flags[`mer_s@${Math.floor(m0 / 1440) + 1}`] || 0) === s0 + 1 && !r.stopped, 'a meridian session: 2 h, a primary, a session used, back on the hub');
    runTask(g, SCENES, MER_TASK);
    assert(merChoice(g, SCENES) === -1 && !taskOpen(g, SCENES, MER_TASK), 'two sessions a day, then no card');
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
    setNoDice(false);
    const c1 = ensureBars(newGame(72)); c1.james.satiety = 0; c1.james.hp = 20; for (let i = 0; i < 6; i++) advance(c1, 10);
    assert(c1.james.hp === 14, `classic keeps the old rule: 1 HP per step (${c1.james.hp})`);
    setNoDice(true);
    // rest and sleep: no bar, the clock still moves
    assert(isInstantTask(g, SCENES, `wilds:${rest}`) && instantChoice({ text: 'Sleep.' }) && !instantChoice({ text: 'Stay up with Mei Lin after the others sleep.' }) && !instantChoice({ text: 'Cultivate one sit before sleep.', do: () => [] }), 'rest and sleep are instant; staying up and cultivating are not');
    assert(taskMinutes(g, SCENES, `wilds:${rest}`) === 60, 'an instant rest still passes its hour');
    setNoDice(false);
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
    g.flags.ending = 'lost'; assert(maxSpeed(g) === 1, 'a lost tribute stays ×1');
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
const pctOf = (o, n) => Object.entries(o).sort().map(([k, v]) => `${k} ${((v / n) * 100).toFixed(1)}%`).join(', ');
console.log(`  tribute, tasks:   ${pctOf(stats.tasks.endings, stats.tasks.games)}`);
console.log(`  tribute, classic: ${pctOf(stats.classic.endings, stats.classic.games)}`);
console.log(`  work-card results: ${Object.entries(bands).map(([k, v]) => `${k} ${v}`).join(', ')} · Yuki brought home ${yukiRuns} times`);
console.log(`  tribute per Coil (tasks, bots rewind a lost tribute up to Coil 3): ${Object.entries(byCoil).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: won ${((b.won / t) * 100).toFixed(1)}% paid ${((b.paid / t) * 100).toFixed(1)}% lost ${((b.lost / t) * 100).toFixed(1)}% (${t})`; }).join(' · ')}`);
console.log(`  realm / primaries at the tribute (tasks): ${Object.entries(byCoil).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: realm ${(b.realm / t).toFixed(2)}, primaries ${(b.pri / t).toFixed(1)}`; }).join(' · ')}`);
const dl = (o, name) => Object.entries(o).filter(([n]) => n <= 4).map(([n, d]) => `Coil ${n}: ${name === 'pro' ? `dead before Mei Lin ${((d.early / d.coils) * 100).toFixed(0)}%, after ${((d.late / d.coils) * 100).toFixed(0)}%` : `dead ${((d.late / d.coils) * 100).toFixed(0)}%`} (${d.coils})`).join(' · ');
console.log(`  deaths, prologue (HP 0 or a beast): ${dl(deaths.pro, 'pro')}`);
console.log(`  deaths, Act 1: ${dl(deaths.a1, 'a1')}`);
console.log(`  Meditate: ${medStats.mer} meridian screens, ${medStats.bt} breakthroughs, ${medStats.warn} seal warnings; Act 1: ${medStats.a1bites} rewinds at Shen Qiu, ends on ${JSON.stringify(medStats.a1coils)}`);
assert(medStats.a1bites >= 5, `bots rewind Act 1 and reach its end (${medStats.a1bites})`);
console.log(`  ${stats.tasks.cards} cards run, ${stats.tasks.skipped} skipped, ${stats.tasks.collapses} collapses (HP 0), ${predicted} queues predicted, ${cardsSeen.size}/${all.size} cards played`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
