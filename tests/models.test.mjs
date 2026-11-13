// v0.11.27: bot models (owner 2026-11-07 11:22, pick B-a): players that play like people, for the rebalance.
// Incremental Mode only; the game is not changed. Log only (owner 12:12): only a stuck game or a broken same-seed
// replay fails; everything else is printed (NOTE lines for what a model did against its own rules).
//
//   node tests/models.test.mjs                        every model, 1,000 games each, plus 300 each with Yuki's lane off
//   node tests/models.test.mjs --games 50 --off 0     quick (the models finish their games)
//   node tests/models.test.mjs --model completionist  one model (careful | completionist | rusher | random)
//   node tests/models.test.mjs --json FILE            also write the merged numbers as JSON
//   node tests/models.test.mjs --off-models careful   v0.11.28: only these models play the Yuki-off games (default: all but Random)
//   node tests/models.test.mjs --sitter-games 200     v0.11.85: the Sitter's own game count (default: --games; it plays ~20× the cards)
//   node tests/models.test.mjs --farmer-games 100     v0.11.86: the Farmer's own game count (default: --games)
//   node tests/models.test.mjs --model cultivator     v0.11.142 (owner pick CV1): the Cultivator alone
//   node tests/models.test.mjs --model sociable       v0.11.160 (owner pick NX2, CN): the Sociable alone
//   node tests/models.test.mjs --texts                v0.11.132 (owner picks PL1, E1, RP): count the screens whose text the game already
//                                                     showed in full this Coil (hubs and menus left out); the full check passes it
//   node tests/models.test.mjs --save-baseline        v0.11.132 (E1, EB): save the Act 1 endings, last nights and repeated screens as
//                                                     tools/models-baseline.json; without it they are compared with it, log only (a NOTE
//                                                     past 5 points and past 3 × the noise; tools/lib/textlint.mjs shareNote). Save
//                                                     only with the owner's go on an intended change, as tools/baseline.json.
//
// The models (tests/README.md has the details):
//   random         the tasks test's bot (tests/tasks.test.mjs): random cards and story choices, half its games fight at
//                  random, Yuki's lane switched on and off, the Meditate card now and then, a lost tribute rewound while
//                  the Coil is under 3, a bite at Shen Qiu in 1 game in 5
//   careful        eats below Fed 50, rests below 60% HP, every work card once a waking day (food first when Fed is under
//                  70, then training, then the rest and meditation), no doors, story choices without a fight where it can
//   completionist  every open card once a waking day, doors too; breaks through as soon as it can; untried choices first
//   rusher         the story with the least work: only meals (below Fed 15), and a screen's cards only when it has no exit
//   sitter         v0.11.85 (owner pick M1): cultivates whenever it can, like the owner's saves (747 sits by Coil 4): a sit
//                  while Qi ≥ 10 and Saturation < 95, else a meridian session, else "Meditate: gather Qi" (up to 6 h a waking
//                  day, Fed over 30); otherwise plays like the completionist
//   farmer         v0.11.86 (#53, owner picks C1 + G1 + W1): bites the tail by choice 10 times at the first dawn (the James
//                  tab's path, through the Coil screens), then plays like the completionist; its Coils are counted from its
//                  first real one (so its line reads like the completionist's), and the bites by choice add no bonus
//   cultivator     v0.11.142 (owner pick CV1; the owner 13:19: the freed time goes to manual cultivation): plays like the
//                  completionist; when a task screen's cards for the day are done and it is 05:00–17:59, it sits (Qi ≥ 10,
//                  Saturation < 95), else a meridian session (Qi ≥ 10), else "Meditate: gather Qi" (up to 6 h a waking day, or
//                  any time Qi is under 10; Fed over 30); then the story, as the completionist (tests/lib/spare.mjs)
//   sociable       v0.11.160 (owner pick NX2, CN; RV1): Careful, but once a waking day it takes each talk door with Ya and
//                  Mei Lin first (Talk to / Find Ya, Talk to / Find Mei Lin, Eat with the others, Ya's gone, Find Mei Lin and Ya;
//                  SOCIAL in tests/lib/social.mjs); Careful stays as it is (the retune's reference player); its story choices,
//                  meals and rests are Careful's, and so are its dice (PS: each game the same as Careful's until a talk door)
// Careful, Completionist and Rusher fight smart, keep Yuki's lane on (the "yukiOff" lines: the same with it off), rewind a
// lost tribute up to 3 times, bite the tail when Shen Qiu takes James up to 3 times (the start of Act 1), and stop after
// Coil 8. A rewind forgets the cards done (the days start over).
import { SCENES } from '../js/story/prologue.js';
import { endCoil } from '../js/core/coil.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, jamesHpMax, clockParts, coilMult } from '../js/core/game.js';
import { INC_ONLY_ACTIONS, actionOpen } from '../js/core/forms.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, runTask, taskState, setYuki, yukiLane } from '../js/core/tasks.js';
import { medCards, runMed, canMeditate } from '../js/core/meditate.js';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { noFold, OUTCOME_SCENES, againView, noteRead } from '../js/story/again.js'; // v0.11.132 (E1, RP); v0.11.133 (FP2): noteRead
import { shareNote } from '../tools/lib/textlint.mjs'; // v0.11.132 (E1, EB)
import { smartAction } from './lib/smartfight.mjs'; // v0.11.96 (BT1)
import { SOCIAL } from './lib/social.mjs'; // v0.11.160 (NX2, CN): the Sociable's talk doors
import { sparePlan } from './lib/spare.mjs'; // v0.11.142 (owner pick CV1): the Cultivator's spare time
import { SHARD, myRuns, seedOf, launch, collect, emit, mergeInto } from './lib/shard.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
export const MODELS = ['random', 'careful', 'completionist', 'rusher', 'sitter', 'farmer', 'cultivator', 'sociable']; // v0.11.160 (NX2, CN): the Sociable last, so the others' seeds don't move; v0.11.85: the Sitter last, so the others' seeds don't move; v0.11.86: the Farmer after it; v0.11.142 (CV1): the Cultivator after it
const ONLY = opt('model', 'all');
const PLAY = ONLY === 'all' ? MODELS : ONLY.split(',');
for (const m of PLAY) if (!MODELS.includes(m)) { console.error(`unknown model ${m} (${MODELS.join(', ')})`); process.exit(2); }
const JSON_OUT = opt('json', null);
const TEXTS = argv.includes('--texts'); // v0.11.132 (E1, RP)
const SAVE_BASE = argv.includes('--save-baseline'); // v0.11.132 (E1, EB)
const MODELS_BASE = new URL('../tools/models-baseline.json', import.meta.url);
const OFF = Math.max(0, Number(opt('off', 300)) || 0);
const SITTER_GAMES = opt('sitter-games', null); // v0.11.85
if (SITTER_GAMES != null && !(Number(SITTER_GAMES) >= 0)) { console.error(`--sitter-games needs a number of games (${SITTER_GAMES})`); process.exit(2); }
const FARMER_GAMES = opt('farmer-games', null); // v0.11.86
if (FARMER_GAMES != null && !(Number(FARMER_GAMES) >= 0)) { console.error(`--farmer-games needs a number of games (${FARMER_GAMES})`); process.exit(2); }
export const FARM_BITES = 10;
const OWN_GAMES = { sitter: SITTER_GAMES, farmer: FARMER_GAMES };
const ownCount = (m, run) => OWN_GAMES[m] == null || run < Number(OWN_GAMES[m]);
// v0.11.28: which models also play the Yuki-off games (default: every model played but Random)
const OFF_MODELS = opt('off-models', 'careful,completionist,rusher').split(',');
for (const m of OFF_MODELS) if (!MODELS.includes(m)) { console.error(`unknown model ${m} in --off-models (${MODELS.join(', ')})`); process.exit(2); }
const MAX_COIL = 8;
const STEPS = 30000;
const STEPS_SITTER = 120000; // v0.11.85: the Sitter takes a step per sit

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
const careLike = (m) => m === 'careful' || m === 'sociable';
const dayKey = (g) => `${g.scene}@${g.wake?.n ?? clockParts(g.minutes).day}`;
const doneSet = (mem, g) => { const k = dayKey(g); return mem.done[k] || (mem.done[k] = new Set()); };

/** A fight to its end: smart (the shared smart rule, tests/lib/smartfight.mjs, v0.11.96) or random (its random branch, fleeing now and then). */
const rankOf = (n) => 10 * ((n?.tier || 1) - 1) + (n?.level || 1);
function fight(g, st, smart) {
    const id0 = g.combat?.id || '?';
    if (rankOf(g.james.gu) < rankOf(g.james.skills['Convergence Use'])) st.cuAhead++; // v0.11.101 (DG1): the degree reads GU alone; GU should never be behind
    for (let t = 0; t < 400 && g.combat; t++) {
        let out;
        if (smart) {
            out = combatStep(g, smartAction(g, t)); // v0.11.96 (BT1): the shared smart rule
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
    if (model === 'cultivator') { // v0.11.142 (CV1; tests/lib/spare.mjs): the completionist's plan, else the spare time
        const base = hubPlan('completionist', g, cards, mem, noExit);
        if (base) return base;
        const sp = sparePlan(g, cards, mem, dayKey(g));
        if (sp && mem.st) mem.st.spare = (mem.st.spare || 0) + 1;
        return sp;
    }
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
    if (eat && fed < (careLike(model) ? 50 : 60)) return [eat.id];
    if (rest && hp < 0.6) return [rest.id];
    const bt = open.find((c) => c.kind === 'bt');
    if (bt && fresh(bt)) return [bt.id];
    if (model === 'sitter') { // v0.11.85 (M1): sit, then the meridians, then gather Qi; the rest like the completionist
        const sit = open.find((c) => c.kind === 'sit' || (c.kind === 'chore' && /^(Cultivate|Condense)/.test(c.label)));
        if (sit && g.james.qi >= 10 && g.james.saturation < 95) return [sit.id];
        const mer = open.find((c) => c.kind === 'mer');
        if (mer && g.james.qi >= 10) return [mer.id];
        const qi = open.find((c) => c.kind === 'qi');
        const dk = `qi@${dayKey(g)}`; mem.qi = mem.qi || {};
        if (qi && (sit || mer) && (mem.qi[dk] || 0) < 6 && g.james.satiety > 30) { mem.qi[dk] = (mem.qi[dk] || 0) + 1; return [qi.id]; }
    }
    const todo = open.filter((c) => fresh(c) && !EAT.test(c.label) && !REST.test(c.label));
    if (model === 'sociable') { // v0.11.160 (NX2, CN): its talk doors first, once a waking day each, then Careful's plan
        const d = open.find((c) => c.kind === 'door' && fresh(c) && SOCIAL.test(c.label));
        if (d) return [d.id]; // RV1 (TC): counted once it has run (the main loop)
    }
    if (careLike(model)) {
        const work = todo.filter((c) => c.kind !== 'door');
        const want = (fed < 70 && work.find((c) => FOOD_GROUP.test(c.group || ''))) || work.find((c) => TRAIN_GROUP.test(c.group || '')) || work[0];
        return want ? [want.id] : null;
    }
    const work = todo.filter((c) => c.kind !== 'door'); // completionist: the work first, then the doors
    return work.length ? [work[0].id] : todo.length ? [todo[0].id] : null;
}

/** A story choice (index) for a model. */
function storyPick(model, g, choices, mem) {
    if (model === 'cultivator') model = 'completionist'; // v0.11.142 (CV1)
    if (careLike(model)) { const calm = choices.filter((c) => !/fight/.test(c.tag || '')); return pick(calm.length ? calm : choices).index; }
    if (model === 'completionist') { const untried = choices.filter((c) => !mem.tried.has(`${g.scene}:${c.index}`)); return pick(untried.length ? untried : choices).index; }
    return pick(choices).index;
}

/** One game. Returns 'end' (an Act 1 ending), 'gaveUp' (past Coil 8) or 'stuck'. */
function play(run, model, st, yuki) {
    rs = seedOf(run, 7 + MODELS.indexOf(model === 'sociable' ? 'careful' : model) + (yuki === 'off' ? 50 : 0)); // RV1 (PS): the Sociable on Careful's dice, so the two compare game for game
    const smart = model !== 'random' || run % 2 === 0;
    const g = ensureBars(newGame(run + 1 + 900000, { closed: true }));
    let off = 0; // v0.11.86: the Farmer's bites by choice, through the scenes the James tab's button leads to
    if (model === 'farmer') {
        for (let k = 0; k < FARM_BITES; k++) {
            endCoil(g, 'choice', g.scene); goTo(g, SCENES, 'coil_end');
            const w = sceneView(g, SCENES).choices.find((c) => /Wake at the first dawn/.test(c.label));
            if (!w) { assert(false, `farmer: no first dawn on the Coil screen (run ${run})`); return 'stuck'; }
            choose(g, SCENES, w.index); choose(g, SCENES, 0); // the Coil screen, then the first dawn's Get up
        }
        off = FARM_BITES; st.farmMult = (st.farmMult || 0) + coilMult(g); st.farmN = (st.farmN || 0) + 1;
        model = 'completionist';
    }
    const cn = () => g.coil.n - off;
    const mem = { done: {}, tried: new Set(), tribLost: 0, shenBites: 0, st }; // v0.11.142 (CV1): st for the spare-time count
    let coilKey = '', deadKey = '', takenKey = '', nightKey = '', crossed = false, bitShen = false;
    let lastShown = null; // v0.11.134 (LP2, SV)
    const seenTrib = new Set();
    const maxSteps = model === 'sitter' ? STEPS_SITTER : STEPS;
    for (let steps = 0; steps < maxSteps; steps++) {
        if (cn() > MAX_COIL) { st.gaveUp++; return 'gaveUp'; }
        const act = g.coil.act || 0;
        const key = `${act}:${cn()}`;
        if (key !== coilKey) { // a new Coil: the days start over
            coilKey = key; mem.done = {}; mem.qi = {}; mem.texts = new Set(); // v0.11.132 (E1, RP): the texts shown this Coil; v0.11.85 (Fable review): the Sitter's gather-Qi hours start over too (a rewind restores the day count)
            const d = st.deaths[act] || (st.deaths[act] = {});
            (d[cn()] || (d[cn()] = { coils: 0, dead: 0, beast: 0, starve: 0, taken: 0 })).coils++;
        }
        const row = st.deaths[act][cn()];
        if (act === 1 && !crossed) { crossed = true; st.prologueClear[cn()] = (st.prologueClear[cn()] || 0) + 1; }
        if (act === 1 && g.scene === 'rt_taken' && takenKey !== coilKey) { takenKey = coilKey; row.taken++; } // lost to people: Shen Qiu takes James
        if (g.scene === 'coil_end' && (g.coil.why === 'collapse' || g.coil.why === 'beast') && deadKey !== coilKey) {
            deadKey = coilKey; row.dead++; if (g.coil.why === 'beast') row.beast++; else if (g.james.satiety <= 0) row.starve++;
        }
        // v0.11.130 (owner pick YB1, LN): the last night taken, once a Coil (g.flags.final_night: Act 1's last evening)
        if (g.flags.final_night && nightKey !== coilKey) { nightKey = coilKey; const k = NIGHT_KIND[g.flags.final_night] || 'other'; st.nights[k] = (st.nights[k] || 0) + 1; }
        const tOut = { bluff_win: 'won', collectors_won: 'won', tribute_paid: 'paid', collectors_lost: 'lost' }[g.scene];
        if (tOut && !seenTrib.has(cn())) { seenTrib.add(cn()); const b = st.tribute[cn()] || (st.tribute[cn()] = { won: 0, paid: 0, lost: 0 }); b[tOut]++; }
        const v = sceneView(g, SCENES);
        // v0.11.134 (LP2, SV): the screen before this step's view, when the last action kept the bot on it (every step after the first follows an action)
        const prevShown = TEXTS && lastShown && lastShown.id === g.scene ? lastShown : null;
        const av = TEXTS && v.text ? againView(g, v, prevShown) : null; // every screen, as main.js draws it (the visit and its memory line)
        if (TEXTS) lastShown = v.text ? { id: g.scene, text: v.text } : null;
        if (TEXTS && v.text && !(noFold(g.scene) && !OUTCOME_SCENES.has(g.scene))) { // v0.11.132 (E1, RP): hubs and menus left out
            const tx = st.texts || (st.texts = { screens: 0, repeats: 0, scenes: {} });
            const k = `${g.scene}\n${v.text}`;
            tx.screens++;
            if (mem.texts.has(k)) { if (!av.fold) { tx.repeats++; tx.scenes[g.scene] = (tx.scenes[g.scene] || 0) + 1; } } else mem.texts.add(k);
        }
        if (TEXTS && v.text && !noFold(g.scene) && !v.end) noteRead(g, v.text); // v0.11.133 (FP2, RF1): the bot reads what the screen shows, as main.js records it
        if (v.end || g.scene === 'a1_end') {
            st.endRealm[g.james.realm] = (st.endRealm[g.james.realm] || 0) + 1; // v0.11.142 (CV1): the realm at Act 1's end (the realm starts over each Coil)
            const o = g.flags.a1_outcome || 'none';
            st.endings[o] = (st.endings[o] || 0) + 1;
            if (o !== 'taken' && o !== 'none') { st.act1Clear[cn()] = (st.act1Clear[cn()] || 0) + 1; if (cn() === 1) st.oneCoil++; }
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
                const q = taskState(g).queue; q.push(...plan); // v0.11.64: the plan in the save's old queue field, as before
                while (q.length && isTaskHub(g)) {
                    const id = q.shift();
                    if (!taskOpen(g, SCENES, id)) continue;
                    doneSet(mem, g).add(id);
                    const c = cards.find((x) => x.id === id);
                    if (c && !EAT.test(c.label)) st.work++;
                    const m0 = g.minutes;
                    runTask(g, SCENES, id); st.cards++;
                    if (model === 'sociable' && c?.kind === 'door' && SOCIAL.test(c.label)) st.talks = (st.talks || 0) + 1; // v0.11.160 (NX2, CN; RV1 TC)
                    const ck = c && (c.kind === 'chore' && /^(Cultivate|Condense)/.test(c.label) ? 'sit' : c.kind); // a hub's own Cultivate chore is a sit
                    if (CULT_KINDS.includes(ck)) st.cult[ck] = (st.cult[ck] || 0) + (g.minutes - m0); // v0.11.142 (CV1): cultivation on task screens
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
        if (careLike(model) && g.james.satiety < 30 && foodLeft(g)) st.hungry++; // RV1 (HN): the Sociable too
    }
    assert(false, `${model}: run ${run} finishes in ${maxSteps} steps (at ${g.scene})`);
    return 'stuck';
}
const foodLeft = (g) => Object.entries(g.inventory || {}).some(([k, n]) => n > 0 && /raw|meat|berry|cress|honey|crab|fowl|hare|venison|egg/.test(k));

/** v0.11.130 (YB1, LN): the last-night split, by g.flags.final_night (yuki_path.js): her four nights count as Yuki's. */
const NIGHT_KIND = { none: 'quiet', mei: 'Mei Lin', ya: 'Ya', trio: 'trio', yuki: 'Yuki', yuki_mei: 'Yuki', yuki_ya: 'Yuki', all: 'Yuki' };
const NIGHT_ORDER = ['quiet', 'Mei Lin', 'Ya', 'trio', 'Yuki', 'other'];
const ENDING_ORDER = ['accord', 'revelation', 'victory', 'taken', 'none']; // v0.11.132 (E1, EB): g.flags.a1_outcome (act1_return.js)
const CULT_KINDS = ['sit', 'mer', 'qi', 'bt']; // v0.11.142 (CV1)
const CULT_NAMES = { sit: 'sits', mer: 'meridians', qi: 'gather Qi', bt: 'breakthroughs' };
const blank = () => ({ cult: {}, endRealm: {}, spare: 0, nights: {}, games: 0, finished: 0, gaveUp: 0, stuck: 0, cards: 0, work: 0, forced: 0, oneCoil: 0, hungry: 0, cuAhead: 0, deaths: {}, tribute: {}, prologueClear: {}, act1Clear: {}, endings: {}, fights: {} });
const all = {};
const playInto = (st, run, m, yuki) => { st.games++; const r = play(run, m, st, yuki); if (r === 'end') st.finished++; else if (r === 'stuck') st.stuck++; };
for (const m of PLAY) {
    all[m] = blank();
    if (m !== 'random' && OFF && OFF_MODELS.includes(m)) all[`${m}:yukiOff`] = blank();
    if (kids) continue; // with workers the parent only merges
    for (const run of myRuns()) if (ownCount(m, run)) playInto(all[m], run, m, 'on'); // v0.11.85: the Sitter's own count (at most --games); v0.11.86: the Farmer's
    if (all[`${m}:yukiOff`]) for (const run of myRuns()) if (run < OFF && ownCount(m, run)) playInto(all[`${m}:yukiOff`], run, m, 'off');
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
for (const [m, st] of Object.entries(all)) if (st.cuAhead) notes.push(`${m}: GU behind Convergence Use at ${st.cuAhead} fights (v0.11.101, DG1: the degree reads GU alone; it should never be)`);
for (const m of ['careful', 'sociable']) if (all[m]?.hungry) notes.push(`${m}: under Fed 30 with food in the hammerspace ${all[m].hungry} times`); // RV1 (HN)
if (!SHARD) { // the completionist really runs every open card of the wilds before it leaves
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

// v0.11.130 (YB1, LN): every last night the story can set has its bucket in the split, and no game lands in 'other'
{
    const src = ['yuki_path.js', 'act1_return.js', 'act1_fallout.js'].map((f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8')).join('\n');
    const kinds = new Set([...src.matchAll(/final_night = '(\w+)'/g), ...src.matchAll(/\['rt_\w+_night', '(\w+)'\]/g)].map((m) => m[1]));
    const miss = [...kinds].filter((k) => !NIGHT_KIND[k]);
    assert(kinds.size >= 8 && !miss.length, `the last-night split names every final_night the story sets (${[...kinds].join(', ')}; missing: ${miss.join(', ') || 'none'})`);
    for (const [m, st] of Object.entries(all)) assert(!st.nights?.other, `${m}: no last night outside the split (${st.nights?.other || 0})`);
    // RB2 (TG; Fable's review): once a Coil: never more last nights than Act 1 Coils played
    for (const [m, st] of Object.entries(all)) { const nt = Object.values(st.nights || {}).reduce((a, b) => a + b, 0), a1 = Object.values(st.deaths[1] || {}).reduce((a, d) => a + d.coils, 0); assert(nt <= a1, `${m}: at most one last night a Coil (${nt} nights, ${a1} Act 1 Coils)`); }
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
    if (st.talks) console.log(`  talk doors: ${(st.talks / Math.max(1, st.games)).toFixed(1)} a game (Ya and Mei Lin)`); // v0.11.160 (NX2, CN)
    if (st.farmN) console.log(`  farmer: ${FARM_BITES} bites by choice at the first dawn first, then ×${(st.farmMult / st.farmN).toFixed(2)} (a bite by choice adds no bonus); Coils above counted from its first real one`);
    const fl = KEY_FIGHTS.filter((k) => st.fights[k]).map((k) => { const f = st.fights[k]; const n = f.win + f.lose + (f.flee || 0); return `${k} ${pct(f.win, n)} (${n})`; });
    console.log(`  key fights won: ${fl.join(' · ') || '—'}`);
    const nt = Object.values(st.nights || {}).reduce((a, b) => a + b, 0); // v0.11.130 (YB1, LN)
    const en = Object.values(st.endings || {}).reduce((a, b) => a + b, 0); // v0.11.132 (E1, EB)
    console.log(`  Act 1 endings: ${en ? ENDING_ORDER.filter((k) => k !== 'none' || st.endings.none).map((k) => `${k} ${st.endings[k] || 0}`).join(' / ') + ` (of ${en})` : '—'}`);
    if (st.texts) { const tx = st.texts; const top = Object.entries(tx.scenes).sort((a, b) => b[1] - a[1]).slice(0, 5); console.log(`  repeated screens (the same text again in a Coil, shown in full; hubs and menus left out): ${tx.repeats} of ${tx.screens} (${pct(tx.repeats, tx.screens)})${top.length ? `: ${top.map(([k, n]) => `${k} ${n}`).join(', ')}` : ''}`); }
    { // v0.11.142 (owner pick CV1): hours a game on the Meditate cards of task screens, and the realm at Act 1's end
        const h = (m) => Math.round((10 * m) / 60 / Math.max(1, st.games)) / 10;
        const tot = CULT_KINDS.reduce((a, k) => a + (st.cult[k] || 0), 0);
        const en = sum(st.endRealm);
        console.log(`  cultivation: ${h(tot)} h a game on task screens (${CULT_KINDS.map((k) => `${CULT_NAMES[k]} ${h(st.cult[k] || 0)}`).join(', ')}) · realm at Act 1's end ${en ? `${avg(st.endRealm)} (n ${en})` : '—'} · spare-time cards ${h(60 * (st.spare || 0))} a game`);
    }
    console.log(`  last nights: ${nt ? NIGHT_ORDER.filter((k) => k !== 'other' || st.nights.other).map((k) => `${k} ${st.nights[k] || 0}`).join(' / ') + ` (of ${nt} last evenings)` : '—'}`);
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(all));

// v0.11.132 (owner picks PL1, E1, EB and RP): the Act 1 endings, the last nights and the repeated screens against the saved copy, log only
function shareTable(all) {
    const out = {};
    const shares = (o) => { const n = Object.values(o || {}).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, { v: Math.round((1000 * v) / n) / 10, n }])); };
    for (const [m, st] of Object.entries(all)) {
        out[m] = { games: st.games, endings: shares(st.endings), nights: shares(st.nights) };
        if (st.texts?.screens) out[m].repeats = { v: Math.round((1000 * st.texts.repeats) / st.texts.screens) / 10, n: st.texts.screens };
    }
    return out;
}
if (!SHARD) {
    const now = shareTable(all);
    if (SAVE_BASE) { writeFileSync(MODELS_BASE, `${JSON.stringify({ saved: new Date().toISOString().slice(0, 10), args: argv.filter((a) => a !== '--save-baseline').join(' '), models: now }, null, 1)}\n`); console.log(`\n  models baseline saved: tools/models-baseline.json`); }
    else if (existsSync(MODELS_BASE)) {
        const was = JSON.parse(readFileSync(MODELS_BASE, 'utf8')).models || {};
        for (const [m, t] of Object.entries(now)) {
            const w = was[m]; if (!w) continue;
            for (const part of ['endings', 'nights']) for (const k of new Set([...Object.keys(w[part] || {}), ...Object.keys(t[part] || {})])) {
                const a = w[part]?.[k] || { v: 0, n: Object.values(w[part] || {})[0]?.n || 0 }, b = t[part]?.[k] || { v: 0, n: Object.values(t[part] || {})[0]?.n || 0 };
                if (shareNote(a, b) === 'note') notes.push(`${part === 'endings' ? 'Act 1 endings' : 'last nights'} (log only): ${m} ${k} ${a.v}% → ${b.v}% (n ${a.n} → ${b.n})`);
            }
            if (w.repeats && t.repeats && shareNote(w.repeats, t.repeats) === 'note') notes.push(`repeated screens (log only): ${m} ${w.repeats.v}% → ${t.repeats.v}% of screens (n ${w.repeats.n} → ${t.repeats.n})`);
        }
    }
}
for (const n of notes) console.log(`  NOTE  ${n}`);
for (const f of fails) console.error(`  FAIL  ${f}`);
console.log(`\n${pass} passed, ${fail} failed${notes.length ? `, ${notes.length} notes` : ''}`);
process.exit(fail ? 1 : 0);
