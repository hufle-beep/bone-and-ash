// Run: node tests/tasks.test.mjs — task cards and the queue (v0.9.0, "Tasks (preview)").
// Every card resolves; old saves get an empty queue; a dry run predicts the real run exactly;
// 2,000 bot games in task mode reach the end with no dead end; the tribute outcomes are printed next to classic play.
import { SCENES } from '../js/story/prologue.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, migrate, SAVE_VERSION, setNoDice } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
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
// HP 0 during a task (stand-in until the Coil): queue cleared, 1 HP, dusk, the camp stop
{
    const g = ensureBars(newGame(9)); g.scene = 'wilds'; g.minutes += 1440 + 120; Object.assign(g.flags, { long: true, forest_day: 2 });
    g.james.satiety = 0; g.james.hp = 0.5; taskQueue(g).push('wilds:6', 'wilds:6');
    const rest = SCENES.wilds.choices.findIndex((c) => /^Rest/.test(c.text));
    const r = runTask(g, SCENES, `wilds:${rest}`);
    assert(r.stopped && g.james.hp === 1 && taskQueue(g).length === 0 && g.scene === 'camp', `collapse → camp at 1 HP, queue cleared (${g.scene}, ${g.james.hp})`);
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
    for (; steps < 3000; steps++) {
        const v = sceneView(g, SCENES);
        if (v.end) { const e = g.flags.ending || 'none'; st.endings[e] = (st.endings[e] || 0) + 1; st.games++; return true; }
        if (tasks && isTaskHub(g)) {
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
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene} (run ${run})`); return false; }
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
console.log(`  ${stats.tasks.cards} cards run, ${stats.tasks.skipped} skipped, ${stats.tasks.collapses} collapses (HP 0), ${predicted} queues predicted, ${cardsSeen.size}/${all.size} cards played`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
