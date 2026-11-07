// v0.11.27: bot models (owner 2026-11-07 11:22, pick B-a): players that play like people, for the rebalance.
// Incremental Mode only; the game is not changed. Log only (owner 12:12): only a stuck game or a broken same-seed
// replay fails; everything else is printed (NOTE lines for what a model did against its own rules).
//
//   node tests/models.test.mjs                        every model, 1,000 games each, plus 300 each with Yuki's lane off
//   node tests/models.test.mjs --games 50 --off 0     quick (the models finish their games)
//   node tests/models.test.mjs --model completionist  one model (careful | completionist | rusher | random)
//   node tests/models.test.mjs --json FILE            also write the merged numbers as JSON
//   node tests/models.test.mjs --off-models careful   v0.11.28: only these models play the Yuki-off games (default: all but Random)
//
// The models (tests/README.md has the details):
//   random         the tasks test's bot (tests/tasks.test.mjs): random cards and story choices, half its games fight at
//                  random, Yuki's lane switched on and off, the Meditate card now and then, a lost tribute rewound while
//                  the Coil is under 3, a bite at Shen Qiu in 1 game in 5
//   careful        eats below Fed 50, rests below 60% HP, every work card once a waking day (food first when Fed is under
//                  70, then training, then the rest and meditation), no doors, story choices without a fight where it can
//   completionist  every open card once a waking day, doors too; breaks through as soon as it can; untried choices first
//   rusher         the story with the least work: only meals (below Fed 15), and a screen's cards only when it has no exit
// Careful, Completionist and Rusher fight smart, keep Yuki's lane on (the "yukiOff" lines: the same with it off), rewind a
// lost tribute up to 3 times, bite the tail when Shen Qiu takes James up to 3 times (the start of Act 1), and stop after
// Coil 8. A rewind forgets the cards done (the days start over).
import { SCENES } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, setNoDice, jamesHpMax, clockParts } from '../js/core/game.js';
import { INC_ONLY_ACTIONS, actionOpen } from '../js/core/forms.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, runTask, taskQueue, setYuki, yukiLane } from '../js/core/tasks.js';
import { medCards, runMed, canMeditate } from '../js/core/meditate.js';
import { writeFileSync } from 'node:fs';
import { SHARD, myRuns, seedOf, launch, collect, emit, mergeInto } from './lib/shard.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
export const MODELS = ['random', 'careful', 'completionist', 'rusher'];
const ONLY = opt('model', 'all');
const PLAY = ONLY === 'all' ? MODELS : ONLY.split(',');
for (const m of PLAY) if (!MODELS.includes(m)) { console.error(`unknown model ${m} (${MODELS.join(', ')})`); process.exit(2); }
const JSON_OUT = opt('json', null);
const OFF = Math.max(0, Number(opt('off', 300)) || 0);
// v0.11.28: which models also play the Yuki-off games (default: every model played but Random)
const OFF_MODELS = opt('off-models', 'careful,completionist,rusher').split(',');
for (const m of OFF_MODELS) if (!MODELS.includes(m)) { console.error(`unknown model ${m} in --off-models (${MODELS.join(', ')})`); process.exit(2); }
const MAX_COIL = 8;
const STEPS = 30000;

let pass = 0, fail = 0;
const fails = [];
const assert = (ok, label) => { if (ok) pass++; else { fail++; if (fails.length < 40) fails.push(label); } };

const kids = launch(import.meta.url);

let rs = 1;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };
const pick = (a) => a[rnd(a.length)];

const EAT = /^(Eat|Cook|Roast)\b|communal pot|Cook and eat/i;
const REST = /^(Rest|Sleep)\b/;
const FOOD_GROUP = /Forage|Hunt|food/i;
const TRAIN_GROUP = /Practice|Militia|Workshop|Train|Drill/i;
const dayKey = (g) => `${g.scene}@${g.wake?.n ?? clockParts(g.minutes).day}`;
const doneSet = (mem, g) => { const k = dayKey(g); return mem.done[k] || (mem.done[k] = new Set()); };

/** A fight to its end: smart (the tasks test's smart branch) or random (its random branch, fleeing now and then). */
function fight(g, st, smart) {
    const id0 = g.combat?.id || '?';
    for (let t = 0; t < 400 && g.combat; t++) {
        let out;
        if (smart) {
            const act = actionOpen(g, 'spikes') && !g.combat.fieldUsed && g.james.qi >= 6 ? 'spikes'
                : actionOpen(g, 'spear') && g.james.qi >= 3 && t % 2 === 0 ? 'spear'
                : g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'dart';
            out = combatStep(g, !INC_ONLY_ACTIONS.has(act) || actionOpen(g, act) ? act : 'dart');
        } else {
            const acts = Object.keys(COMBAT_ACTIONS).filter((id) => !INC_ONLY_ACTIONS.has(id) || actionOpen(g, id));
            out = (t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, pick(acts));
        }
        if (out?.done) { const f = st.fights[id0] || (st.fights[id0] = { win: 0, lose: 0, flee: 0 }); f[out.done] = (f[out.done] || 0) + 1; goTo(g, SCENES, out.next); return; }
    }
}
const runCombat = (g, r, st, smart) => { if (r?.combat) { startCombat(g, r.combat(g)); fight(g, st, smart); } };

/** What a model queues on a task screen this visit (card ids), or null to take a story stop. */
export function hubPlan(model, g, cards, mem, noExit = false) {
    const open = cards.filter((c) => c.status === 'open');
    const fed = g.james.satiety, hp = g.james.hp / jamesHpMax(g);
    const eat = open.find((c) => EAT.test(c.label));
    const rest = open.find((c) => REST.test(c.label));
    const done = doneSet(mem, g);
    const fresh = (c) => !done.has(c.id);
    if (model === 'random') {
        if (!open.length || (rnd(10) >= 8 && !noExit)) return null; // like the tasks test's bot: a screen with no exit always gets cards
        const q = []; for (let k = 1 + rnd(4); k > 0; k--) q.push(pick(open).id); return q;
    }
    if (model === 'rusher') return eat && fed < 15 ? [eat.id] : null;
    if (eat && fed < (model === 'careful' ? 50 : 60)) return [eat.id];
    if (rest && hp < 0.6) return [rest.id];
    const bt = open.find((c) => c.kind === 'bt');
    if (bt && fresh(bt)) return [bt.id];
    const todo = open.filter((c) => fresh(c) && !EAT.test(c.label) && !REST.test(c.label));
    if (model === 'careful') {
        const work = todo.filter((c) => c.kind !== 'door');
        const want = (fed < 70 && work.find((c) => FOOD_GROUP.test(c.group || ''))) || work.find((c) => TRAIN_GROUP.test(c.group || '')) || work[0];
        return want ? [want.id] : null;
    }
    const work = todo.filter((c) => c.kind !== 'door'); // completionist: the work first, then the doors
    return work.length ? [work[0].id] : todo.length ? [todo[0].id] : null;
}

/** A story choice (index) for a model. */
function storyPick(model, g, choices, mem) {
    if (model === 'careful') { const calm = choices.filter((c) => !/fight/.test(c.tag || '')); return pick(calm.length ? calm : choices).index; }
    if (model === 'completionist') { const untried = choices.filter((c) => !mem.tried.has(`${g.scene}:${c.index}`)); return pick(untried.length ? untried : choices).index; }
    return pick(choices).index;
}

/** One game. Returns 'end' (an Act 1 ending), 'gaveUp' (past Coil 8) or 'stuck'. */
function play(run, model, st, yuki) {
    rs = seedOf(run, 7 + MODELS.indexOf(model) + (yuki === 'off' ? 50 : 0));
    setNoDice(true);
    const smart = model !== 'random' || run % 2 === 0;
    const g = ensureBars(newGame(run + 1 + 900000, { closed: true }));
    const mem = { done: {}, tried: new Set(), tribLost: 0, shenBites: 0 };
    let coilKey = '', deadKey = '', takenKey = '', crossed = false, bitShen = false;
    const seenTrib = new Set();
    for (let steps = 0; steps < STEPS; steps++) {
        if (g.coil.n > MAX_COIL) { st.gaveUp++; return 'gaveUp'; }
        const act = g.coil.act || 0;
        const key = `${act}:${g.coil.n}`;
        if (key !== coilKey) { // a new Coil: the days start over
            coilKey = key; mem.done = {};
            const d = st.deaths[act] || (st.deaths[act] = {});
            (d[g.coil.n] || (d[g.coil.n] = { coils: 0, dead: 0, beast: 0, starve: 0, taken: 0 })).coils++;
        }
        const row = st.deaths[act][g.coil.n];
        if (act === 1 && !crossed) { crossed = true; st.prologueClear[g.coil.n] = (st.prologueClear[g.coil.n] || 0) + 1; }
        if (act === 1 && g.scene === 'rt_taken' && takenKey !== coilKey) { takenKey = coilKey; row.taken++; } // lost to people: Shen Qiu takes James
        if (g.scene === 'coil_end' && (g.coil.why === 'collapse' || g.coil.why === 'beast') && deadKey !== coilKey) {
            deadKey = coilKey; row.dead++; if (g.coil.why === 'beast') row.beast++; else if (g.james.satiety <= 0) row.starve++;
        }
        const tOut = { bluff_win: 'won', collectors_won: 'won', tribute_paid: 'paid', collectors_lost: 'lost' }[g.scene];
        if (tOut && !seenTrib.has(g.coil.n)) { seenTrib.add(g.coil.n); const b = st.tribute[g.coil.n] || (st.tribute[g.coil.n] = { won: 0, paid: 0, lost: 0 }); b[tOut]++; }
        const v = sceneView(g, SCENES);
        if (v.end || g.scene === 'a1_end') {
            const o = g.flags.a1_outcome || 'none';
            st.endings[o] = (st.endings[o] || 0) + 1;
            if (o !== 'taken' && o !== 'none') { st.act1Clear[g.coil.n] = (st.act1Clear[g.coil.n] || 0) + 1; if (g.coil.n === 1) st.oneCoil++; }
            return 'end';
        }
        if (model === 'random' && canMeditate(g, SCENES) && rnd(6) === 0) { // the tasks test's bot: the Meditate card now and then
            const mc = medCards(g, SCENES);
            if (mc.some((c) => c.id === 'med:bt' && c.open) && rnd(2) === 0) { runMed(g, SCENES, 'med:bt'); continue; }
            if (!isTaskHub(g)) { const mm = mc.filter((c) => /^med:mer:/.test(c.id) && c.open); if (mm.length) { runMed(g, SCENES, pick(mm).id); continue; } }
        }
        if (isTaskHub(g)) {
            const yl = yukiLane(g);
            if (yl) { if (model === 'random') { if (rnd(3) === 0) setYuki(g, !yl.on); } else if (yl.on !== (yuki === 'on')) setYuki(g, yuki === 'on'); }
            const cards = taskCards(g, SCENES);
            const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)));
            const plan = hubPlan(model, g, cards, mem, !stops.length);
            if (plan && plan.length) {
                const q = taskQueue(g); q.push(...plan);
                while (q.length && isTaskHub(g)) {
                    const id = q.shift();
                    if (!taskOpen(g, SCENES, id)) continue;
                    doneSet(mem, g).add(id);
                    const c = cards.find((x) => x.id === id);
                    if (c && !EAT.test(c.label)) st.work++;
                    runTask(g, SCENES, id); st.cards++;
                }
                q.length = 0;
                continue;
            }
            if (!stops.length) { // no story exit: the screen's cards are the only way on (counted as forced)
                const open = cards.filter((c) => c.status === 'open');
                if (!open.length) { assert(false, `${model}: dead end at task screen ${g.scene} (run ${run})`); return 'stuck'; }
                const done = doneSet(mem, g);
                const c = open.find((x) => x.kind === 'door') || open.find((x) => !done.has(x.id)) || open[0];
                done.add(c.id); st.forced++; st.cards++;
                runTask(g, SCENES, c.id);
                continue;
            }
            const i = storyPick(model, g, stops, mem); mem.tried.add(`${g.scene}:${i}`);
            runCombat(g, choose(g, SCENES, i), st, smart);
            continue;
        }
        let open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `${model}: dead end at ${g.scene} (run ${run})`); return 'stuck'; }
        if (/^(arrival|clearing)$/.test(g.scene)) open = open.filter((c) => !/Stay lost/.test(c.label)); // no Long Forest
        if (g.scene === 'collectors_lost') { const bite = model === 'random' ? g.coil.n < 3 : mem.tribLost < 3; open = open.filter((c) => bite === /Bite the tail/.test(c.label)); if (bite) mem.tribLost++; }
        if (g.scene === 'coil_end' && g.coil.why === 'tribute') open = open.filter((c) => /^Bite/.test(c.label));
        if (model === 'random' && g.scene === 'rt_elder' && run % 10 === 0 && act === 1 && !bitShen) { goTo(g, SCENES, 'rt_taken'); continue; } // the tasks test's bot: 1 game in 10 goes with Shen Qiu on purpose
        if (g.scene === 'rt_taken') { const bite = model === 'random' ? run % 5 === 0 && !bitShen : mem.shenBites < 3; open = open.filter((c) => bite === /Bite the tail/.test(c.label)); if (bite) { mem.shenBites++; bitShen = true; } }
        if (g.scene === 'coil_end' && act === 1) open = open.filter((c) => !/whole game/.test(c.label));
        if (g.scene === 'coil_end' && g.coil.why === 'shen') open = open.filter((c) => /start of Act 1/.test(c.label));
        if (!open.length) { assert(false, `${model}: no choice left at ${g.scene} (run ${run})`); return 'stuck'; }
        const i = storyPick(model, g, open, mem); mem.tried.add(`${g.scene}:${i}`);
        runCombat(g, choose(g, SCENES, i), st, smart);
        if (model === 'careful' && g.james.satiety < 30 && foodLeft(g)) st.hungry++;
    }
    assert(false, `${model}: run ${run} finishes in ${STEPS} steps (at ${g.scene})`);
    return 'stuck';
}
const foodLeft = (g) => Object.entries(g.inventory || {}).some(([k, n]) => n > 0 && /raw|meat|berry|cress|honey|crab|fowl|hare|venison|egg/.test(k));

const blank = () => ({ games: 0, finished: 0, gaveUp: 0, stuck: 0, cards: 0, work: 0, forced: 0, oneCoil: 0, hungry: 0, deaths: {}, tribute: {}, prologueClear: {}, act1Clear: {}, endings: {}, fights: {} });
const all = {};
const playInto = (st, run, m, yuki) => { st.games++; const r = play(run, m, st, yuki); if (r === 'end') st.finished++; else if (r === 'stuck') st.stuck++; };
for (const m of PLAY) {
    all[m] = blank();
    if (m !== 'random' && OFF && OFF_MODELS.includes(m)) all[`${m}:yukiOff`] = blank();
    if (kids) continue; // with workers the parent only merges
    for (const run of myRuns()) playInto(all[m], run, m, 'on');
    if (all[`${m}:yukiOff`]) for (const run of myRuns()) if (run < OFF) playInto(all[`${m}:yukiOff`], run, m, 'off');
}
// the same seed plays the same game (separate totals: the replay adds nothing to the numbers)
if (!SHARD) for (const m of PLAY) {
    const a = blank(), b = blank(); play(3, m, a, 'on'); play(3, m, b, 'on');
    assert(JSON.stringify(a) === JSON.stringify(b), `${m}: the same seed plays the same game`);
}

if (SHARD) emit({ all, pass, fail, fails });
if (kids) for (const r of await collect(kids)) { mergeInto(all, r.all); pass += r.pass; fail += r.fail; fails.push(...r.fails); }

const notes = [];
for (const [m, st] of Object.entries(all)) assert(!st.stuck, `${m}: every game ends or gives up after Coil ${MAX_COIL} (${st.stuck} stuck)`);
if (all.rusher?.work) notes.push(`rusher: ${all.rusher.work} work cards queued (it should queue only meals)`);
if (all.careful?.hungry) notes.push(`careful: under Fed 30 with food in the hammerspace ${all.careful.hungry} times`);
if (!SHARD) { // the completionist really runs every open card of the wilds before it leaves
    setNoDice(true);
    const g = ensureBars(newGame(77, { closed: true })); goTo(g, SCENES, 'wilds'); g.minutes += 1440;
    const mem = { done: {}, tried: new Set() };
    const ids = taskCards(g, SCENES).filter((c) => c.status === 'open' && c.kind !== 'door' && !EAT.test(c.label) && !REST.test(c.label)).map((c) => c.id);
    const ran = [];
    for (let k = 0; k < 60 && g.scene === 'wilds' && isTaskHub(g); k++) {
        const p = hubPlan('completionist', g, taskCards(g, SCENES), mem); if (!p) break;
        doneSet(mem, g).add(p[0]); if (taskOpen(g, SCENES, p[0])) { runTask(g, SCENES, p[0]); ran.push(p[0]); }
    }
    const stillOpen = new Set(taskCards(g, SCENES).filter((c) => c.status === 'open').map((c) => c.id)); // cards that closed for the time of day don't count
    const missed = ids.filter((id) => !ran.includes(id) && stillOpen.has(id) && g.scene === 'wilds');
    if (missed.length) notes.push(`completionist: left the wilds with these cards unrun: ${missed.join(', ')}`); else pass++;
}

const pct = (a, b) => (b ? `${Math.round((1000 * a) / b) / 10}%` : '—');
const KEY_FIGHTS = ['jackals', 'lizard', 'crows', 'rats', 'boar', 'gao', 'collectors', 'rot_ape', 'elder'];
for (const [m, st] of Object.entries(all)) {
    console.log(`\n[${m}] ${st.games} games, ${st.cards} cards (${st.forced} forced: a screen with no story exit)${st.gaveUp ? `, ${st.gaveUp} gave up after Coil ${MAX_COIL}` : ''}`);
    for (const [act, name] of [[0, 'prologue'], [1, 'Act 1']]) {
        const d = st.deaths[act] || {};
        const rows = Object.keys(d).map(Number).sort((a, b) => a - b).slice(0, 6).map((n) => `C${n} dead ${pct(d[n].dead, d[n].coils)}${act ? `, taken ${pct(d[n].taken, d[n].coils)}` : ''} (n ${d[n].coils})`);
        console.log(`  ${name}: ${rows.join(' · ') || '—'}`);
    }
    const tr = Object.keys(st.tribute).map(Number).sort((a, b) => a - b).slice(0, 4).map((n) => { const t = st.tribute[n]; const s = t.won + t.paid + t.lost; return `C${n} won ${pct(t.won, s)} lost ${pct(t.lost, s)} (n ${s})`; });
    console.log(`  tribute: ${tr.join(' · ') || '—'}`);
    const avg = (o) => { let s = 0, n = 0; for (const [k, v] of Object.entries(o)) { s += Number(k) * v; n += v; } return n ? (s / n).toFixed(2) : '—'; };
    const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    console.log(`  cleared: prologue ${pct(sum(st.prologueClear), st.games)} (mean Coil ${avg(st.prologueClear)}) · Act 1 ${pct(sum(st.act1Clear), st.games)} (mean Coil ${avg(st.act1Clear)}) · the whole game on Coil 1 ${pct(st.oneCoil, st.games)}`);
    const fl = KEY_FIGHTS.filter((k) => st.fights[k]).map((k) => { const f = st.fights[k]; const n = f.win + f.lose + (f.flee || 0); return `${k} ${pct(f.win, n)} (${n})`; });
    console.log(`  key fights won: ${fl.join(' · ') || '—'}`);
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(all));
for (const n of notes) console.log(`  NOTE  ${n}`);
for (const f of fails) console.error(`  FAIL  ${f}`);
console.log(`\n${pass} passed, ${fail} failed${notes.length ? `, ${notes.length} notes` : ''}`);
process.exit(fail ? 1 : 0);
