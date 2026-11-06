// Run: node tests/tasks.test.mjs — task cards and the queue (v0.9.0, "Tasks (preview)").
// Every card resolves; old saves get an empty queue; a dry run predicts the real run exactly;
// 2,000 bot games in task mode reach the end with no dead end; the tribute outcomes are printed next to classic play.
import { SCENES } from '../js/story/prologue.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { jamesHpMax, canBreakThrough, newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, migrate, SAVE_VERSION, setNoDice } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { coilActive, coilPrefill, rewind, endCoil, KEEP_FLAGS, REMEMBER } from '../js/core/coil.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskMinutes, runTask, outlook, taskQueue, taskState, setYuki, yukiLane, famTier, QUEUE_MAX } from '../js/core/tasks.js';

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
const TRIBUTE_OUT = { bluff_win: 'won', collectors_won: 'won', tribute_paid: 'paid', collectors_lost: 'lost' };
const stats = { tasks: { endings: {}, collapses: 0, cards: 0, skipped: 0, games: 0 }, classic: { endings: {}, games: 0 } };
const cardsSeen = new Set();
const cardsListed = new Set();
const bands = {};
let yukiRuns = 0;
let predicted = 0;
function play(run, tasks) {
    setNoDice(tasks); // task mode has no dice anywhere (v0.9.3)
    const g = ensureBars(newGame(run + 1));
    const st = tasks ? stats.tasks : stats.classic;
    let steps = 0;
    const seenOut = new Set();
    for (; steps < 18000; steps++) {
        const out = tasks && TRIBUTE_OUT[g.scene];
        if (out && !seenOut.has(g.coil.n)) { seenOut.add(g.coil.n); const b = byCoil[g.coil.n] || (byCoil[g.coil.n] = { won: 0, paid: 0, lost: 0 }); b[out]++; }
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

const pctOf = (o, n) => Object.entries(o).sort().map(([k, v]) => `${k} ${((v / n) * 100).toFixed(1)}%`).join(', ');
console.log(`  tribute, tasks:   ${pctOf(stats.tasks.endings, stats.tasks.games)}`);
console.log(`  tribute, classic: ${pctOf(stats.classic.endings, stats.classic.games)}`);
console.log(`  work-card results: ${Object.entries(bands).map(([k, v]) => `${k} ${v}`).join(', ')} · Yuki brought home ${yukiRuns} times`);
console.log(`  tribute per Coil (tasks, bots rewind a lost tribute up to Coil 3): ${Object.entries(byCoil).map(([n, b]) => { const t = b.won + b.paid + b.lost; return `Coil ${n}: won ${((b.won / t) * 100).toFixed(1)}% paid ${((b.paid / t) * 100).toFixed(1)}% lost ${((b.lost / t) * 100).toFixed(1)}% (${t})`; }).join(' · ')}`);
console.log(`  ${stats.tasks.cards} cards run, ${stats.tasks.skipped} skipped, ${stats.tasks.collapses} collapses (HP 0), ${predicted} queues predicted, ${cardsSeen.size}/${all.size} cards played`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
