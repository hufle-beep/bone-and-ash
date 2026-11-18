// Run: node tests/story.test.mjs — story graph integrity + 1,000 random playthroughs (2,000 before v0.11.34) (no crash, no dead end, always reaches the end);
import { deadMenuOk, DEAD_MENUS } from './lib/deadmenus.mjs'; // v0.11.177 (P9A): the emptied menu texts
// Incremental Mode since v0.11.34 (D1: Story Mode dropped from the game)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, itemCap, yukiSitsOut, migrate, REL_HIDDEN, REL_MAX, serialize, deserialize, sleepUntil, startActCoil, jamesHpMax, jamesQiMax, clockParts } from '../js/core/game.js'; // v0.11.172 (P5A RV1, TG1): jamesHpMax, jamesQiMax, clockParts; v0.11.166 (RV1, M2): startActCoil // v0.11.127 (LQ2, TG): yukiSitsOut, migrate; v0.11.137 (HV1): REL_HIDDEN, REL_MAX
import { sceneView, choose, goTo, wasPicked, threatOf } from '../js/core/story.js'; // v0.11.136 (RV2, TG): threatOf
import { actionOpen } from '../js/core/forms.js';
import { btTarget } from '../js/story/meridians.js';
import { loveLine, YK_QUESTION, ykAskAgain, YK_HERE, YK_LATER_RESULT } from '../js/story/yuki_path.js'; // v0.11.122 (RL1, T); v0.11.137 (TR1, YR; QA2); v0.11.192 (K1, L5): YK_LATER_RESULT
import { YT_HUBS, YT_BODY, YT_CLOSE, YT_LABEL, YT_GAIN, ytPool } from '../js/story/yuki_time.js'; // v0.11.137 (TR1)
import { TASK_HUBS } from '../js/story/task_hubs.js'; // v0.11.137 (TR1, YB)
import { HT_HUBS, HT_BODY, HT_CLOSE, HT_LABEL, HT_GAIN, HT_MID, htPool, htSlot } from '../js/story/house_time.js'; // v0.11.139 (MW1)
import { likesMei, likesYa, rel } from '../js/story/act1_common.js'; // v0.11.123 (EQ1, AB); v0.11.172 (P5A): rel
import { KEEP_FLAGS, rewind, endCoil } from '../js/core/coil.js'; // v0.11.137 (HV1, Fable L2): rewind on an old save // v0.11.123 (ER1, T3)
import { againView, noteRead, MEMORY_LINES } from '../js/story/again.js'; // v0.11.167 (CA1): MEMORY_LINES // v0.11.125 (RW1, T); v0.11.133 (FP2): noteRead
import { STOMP } from '../js/story/power.js'; import { ASHFALL } from '../js/story/ashfall.js'; import { FALLOUT } from '../js/story/act1_fallout.js'; import { BLACKROOT } from '../js/story/act1_blackroot.js'; // v0.11.172 (P5A): BLACKROOT; v0.11.170 (NX2): FALLOUT // v0.11.169 (P3A): ASHFALL // v0.11.126 (NQ1)
import { coilStamp, dayIndex, textDay, DAY_REPLIES, COIL_SETS, actCoil, noteDay, linesOf, pickLine } from '../js/core/lines.js'; // v0.11.166 (RW1): COIL_SETS, actCoil; // v0.11.135 (NT1, EV1); v0.11.136 (NC1): DAY_REPLIES
import { splitReply, splitLine, landReply, noteSaid } from '../js/core/replies.js'; // v0.11.136 (NC1); RV2 (TG): landReply, noteSaid
import { runTask, taskOutcome, cardCheck, taskCards, yukiSays as yukiSaysS } from '../js/core/tasks.js'; // v0.11.169 (CA1, YH): yukiSays // v0.11.136 (RV2, TG); v0.11.139 (MW1): taskCards
import { DRILL_AGAIN } from '../js/story/act1_return.js'; // v0.11.179 (LB1, RV2 TG): the drill replies' tics
import { BT_CLOSER as BT_CLOSER_195 } from '../js/story/flight_texts.js'; // v0.11.195 (F1, D1)
import { HEART } from '../js/story/act1_heart.js'; import { createHash } from 'node:crypto'; // v0.11.173 (P6A): the Heart's scenes, for its block
import { writeFileSync, readFileSync, readdirSync } from 'node:fs'; // v0.11.137 (HV1, T): the story files read for bumpRel
import { smartAction } from './lib/smartfight.mjs'; // v0.11.96 (BT1)
import { DAY21_BREAKFAST } from '../js/story/act1_return.js'; // v0.11.152 (E1, BK)
import { carriesRead as CR0 } from '../js/core/tasks.js'; const CY = (g) => Object.values(CR0(g))[0] || null; // v0.11.215 (CF1, UB): the first carried work (the tests from before: one at a time)
import { READ_STOP } from '../js/core/week.js'; READ_STOP.on = false; // v0.11.214 (owner pick RD1): the plan's blocks before RD1 pin it without the read stop; the RD1 block turns it on
const clockHour = (g) => Math.floor(((g.minutes % 1440) + 1440) % 1440 / 60); // v0.11.152 (E1, BK)
import { GAMES, FULL, SHARD, WORKERS, STATS_OUT, myRuns, seedOf, launch, collect, emit, mergeInto } from './lib/shard.mjs';
import { seen as touched, track as watchGame, noteView, mergeSeen, seenOut as touchedOut } from './lib/seen.mjs'; // v0.11.22: for tools/leftovers.mjs
/** v0.11.22: flags and items are watched only with --track (tools/check.mjs: a separate 300-game run); the shown choices always. */
const track = process.argv.includes('--track') ? watchGame : () => {};

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; console.error('  FAIL ', l); } };
const kids = launch(import.meta.url); // v0.11.1: the random playthroughs in worker processes
const fresh = (seed) => newGame(seed, { closed: true });
const STEP_CAP = 5000; // v0.11.34: Incremental Mode games go round the Coil (one game took 2,512 steps over 19 Act 1 Coils), was 2,500 in Story Mode

// static: every literal target exists
const src = SHARD ? [] : Object.values(SCENES);
for (const s of src) {
    assert(s.id && SCENES[s.id] === s, `scene id matches key: ${s.id}`);
    for (const c of s.choices || []) {
        for (const k of ['to', 'fail']) if (typeof c[k] === 'string') assert(!!SCENES[c[k]], `${s.id} → ${c[k]} exists`);
    }
    assert(s.end || (s.choices || []).length > 0, `${s.id} has choices or is the end`);
}

const seen = new Set();
const endings = {};
let maxSteps = 0;
let rs = 12345;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };
const fights = {};
for (const run of kids ? [] : myRuns()) {
    rs = seedOf(run, 3); // v0.11.1: every game its own random stream
    const g = ensureBars(fresh(run + 1));
    let steps = 0;
    for (; steps < STEP_CAP; steps++) {
        seen.add(g.scene);
        track(g); // v0.11.22
        const v = sceneView(g, SCENES);
        noteView(g, v);
        // v0.11.21: per-step checks build their label only when they fail (about 14% of this test's time)
        if (!(typeof v.text === 'string' && (v.text.length > 40 || deadMenuOk(g.scene, v.text)))) assert(false, `text renders in ${g.scene}`); else pass++;
        if (/undefined|NaN|\[object/.test(v.text)) assert(false, `no undefined/NaN in ${g.scene}`); else pass++;
        if (v.end) { endings[g.flags.ending || 'none'] = (endings[g.flags.ending || 'none'] || 0) + 1; break; }
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene} (run ${run})`); break; }
        const pick = open[rnd(open.length)];
        const r = choose(g, SCENES, pick.index);
        if (r.combat) {
            startCombat(g, r.combat(g));
            for (let t = 0; t < 400 && g.combat; t++) {
                const acts = Object.keys(COMBAT_ACTIONS).filter((a) => actionOpen(g, a)); // v0.11.4: only the actions this mode shows
                const id = g.combat.id;
                const smart = run % 2 === 0;
                const act = smart ? smartAction(g, t) : acts[rnd(acts.length)]; // v0.11.96 (BT1): the shared smart rule
                const out = (!smart && t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, act);
                if (out?.done) { const k = `${id}:${smart ? 'smart' : 'random'}`; fights[k] = fights[k] || { win: 0, lose: 0, flee: 0 }; fights[k][out.done] += 1; goTo(g, SCENES, out.next); break; }
            }
            assert(!g.combat, `combat ends (${g.scene}, run ${run})`);
        }
        if (!(Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.qi))) assert(false, `bars finite in ${g.scene}`); else pass++;
        if ((g.yuki.realm || 0) > (g.james.realm || 0)) assert(false, `Yuki's realm above James's in ${g.scene} (the great root-kin must always fly: v0.11.131, RC2 TG)`); else pass++;
    }
    maxSteps = Math.max(maxSteps, steps);
    assert(steps < STEP_CAP, `run ${run} finishes`);
}
if (SHARD) emit({ seen, endings, fights, maxSteps, pass, fail, touched });
if (kids) for (const r of await collect(kids)) { for (const id of r.seen.__set) seen.add(id); mergeInto(endings, r.endings); mergeInto(fights, r.fights); maxSteps = Math.max(maxSteps, r.maxSteps); pass += r.pass; fail += r.fail; mergeSeen(r.touched); }
rs = 12346; // the focused walks below draw from their own stream
// focused walks: the Long Forest at every power level (realm 0–7, tiers 1–3), and the Blackroot with a Ya-leaning heart
function walkFrom(g, entry, stopAt, budget = 1500, entered = false) { // v0.11.34: entered = the scene's enter already ran (choose() took it there)
    g.scene = entry; const e = SCENES[entry].enter; if (e && !entered) e(g);
    for (let st = 0; st < budget; st++) {
        seen.add(g.scene);
        if (stopAt.has(g.scene)) return true;
        track(g); // v0.11.22
        const v = sceneView(g, SCENES);
        noteView(g, v);
        if (!(typeof v.text === 'string' && (v.text.length > 40 || deadMenuOk(g.scene, v.text)))) assert(false, `text renders in ${g.scene}`); else pass++;
        if (v.end) return 'end'; // v0.11.21: an ending is not the target (the walk checks below want `=== true`)
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene}`); return false; }
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 200 && g.combat; t++) { const o = combatStep(g, g.james.qi >= 3 ? 'blade' : 'dart'); if (o?.done) { goTo(g, SCENES, o.next); break; } } }
    }
    return false;
}
for (let run = 0; run < 600; run++) {
    const g = ensureBars(fresh(run + 77777));
    const r = run % 8; g.james.realm = r; g.yuki.realm = r; g.james.gu.tier = 1 + (run % 3); g.james.skills['Convergence Use'].tier = 1 + ((run + 1) % 3); g.james.gu.level = 1 + (run % 9); ensureBars(g);
    assert(walkFrom(g, 'lf_enter', new Set(['dawn']), 1200) === true, `v0.11.21: the Long Forest walk reaches dawn (run ${run})`); // was `|| true`: could never fail
}
for (let run = 0; run < 300; run++) {
    const g = ensureBars(fresh(run + 55555)); g.minutes = 10 * 1440 + 360;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true });
    g.rel = { 'Mei Lin': { f: 20, a: 5 }, Ya: { f: 40, a: 60 + (run % 40) }, Village: { f: 30, a: 0 } }; g.james.gu.level = 7; g.james.skills['Convergence Use'].level = 5; ensureBars(g);
    assert(walkFrom(g, 'bl_start', new Set(['ht_start']), 1500) === true, `v0.11.21: the Blackroot walk reaches the Heart (run ${run})`);
}
// Yuki's path: every last-night arrangement (lover / sister, with Mei Lin and Ya at different heats)
for (let run = 0; run < 240; run++) {
    const g = ensureBars(fresh(run + 44444)); g.minutes = 18 * 1440 + 360;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true, yk_path: run % 4 === 3 ? 'sister' : 'lover', trio: run % 3, yk_mei: run % 3 });
    g.rel = { 'Mei Lin': { f: 40, a: run % 2 ? 80 : 10 }, Ya: { f: 40, a: (run >> 1) % 2 ? 95 : 10 }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } };
    g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; if (run % 8 !== 5) g.yuki.realm = 7; ensureBars(g); // v0.11.122 (LG1, YG): her human scenes need her human; 1 in 8 walks with her a cat
    assert(walkFrom(g, run % 2 ? 'rt_start' : 'bl_start', new Set(['a1_end']), 2500) === true, `v0.11.21: Yuki's path walk reaches the end of Act 1 (run ${run})`);
}
// v0.11.21: "All of you" (yk_night_all) on purpose: the random walks above reach it only by luck (missed under 4 of 10
// other seeds), so the scene-coverage check held by chance. Yuki's lover path, Mei Lin and Ya both warm, the trio ready.
for (let run = 0; run < 20; run++) {
    const g = ensureBars(fresh(run + 43434)); g.minutes = 18 * 1440 + 360;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true, yk_path: 'lover', trio: 3, yk_mei: 2 });
    g.rel = { 'Mei Lin': { f: 40, a: 80 }, Ya: { f: 40, a: 95 }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } };
    g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; g.yuki.realm = 7; ensureBars(g); // v0.11.122 (LG1, YG): her nights need her human this Coil
    g.scene = 'rt_evening'; const e = SCENES.rt_evening.enter; if (e) e(g); seen.add('rt_evening');
    const all = sceneView(g, SCENES).choices.find((c) => !c.disabled && /^All of you/.test(c.label));
    assert(!!all, `v0.11.21: the last night offers "All of you" on Yuki's lover path with both warm (run ${run})`);
    if (!all) continue;
    choose(g, SCENES, all.index);
    assert(g.scene === 'yk_night_all', `v0.11.21: "All of you" leads to yk_night_all (${g.scene})`);
    assert(walkFrom(g, g.scene, new Set(['a1_end']), 1500) === true, `v0.11.21: from yk_night_all to the end of Act 1 (run ${run})`);
}
// a full hammerspace: every common item at its cap — no dead ends from hidden gathering choices
const COMMON = ['jade_bracket', 'ghost_gill', 'river_cress', 'honeycomb', 'spirit_grass', 'beast_core', 'fowl_raw', 'crow_feather', 'hare_raw', 'bone_meal', 'venison', 'crimson_berry', 'crab_meat', 'lizard_egg'];
for (let run = 0; run < 200; run++) {
    const g = ensureBars(fresh(run + 33333));
    for (const id of COMMON) g.inventory[id] = itemCap(id);
    const r = run % 8; g.james.realm = r; g.yuki.realm = r; ensureBars(g);
    assert(walkFrom(g, run % 2 ? 'lf_enter' : 'arrival', new Set(['fo_start']), 1500) === true, `v0.11.21: the full-hammerspace walk reaches Act 1 (run ${run})`);
    for (const id of COMMON) assert(g.inventory[id] <= itemCap(id) || !g.inventory[id], `cap holds for ${id}`);
}
// the Coil (v0.9.4): a lost tribute, the Coil screen, the first dawn again, back into Day 1
for (let run = 0; run < 40; run++) {
    const g = ensureBars(fresh(run + 22222)); g.scene = 'collectors_lost'; g.flags.ending = 'lost'; g.flags.long = true;
    if (run % 2) { assert(walkFrom(g, 'collectors_lost', new Set(['stream', 'fo_start']), 400) === true, `v0.11.21: a lost tribute walks back to Day 1 (run ${run})`); continue; }
    SCENES.collectors_lost.enter(g); seen.add('collectors_lost');
    choose(g, SCENES, SCENES.collectors_lost.choices.findIndex((c) => c.to === 'coil_end')); // half the runs bite the tail
    assert(walkFrom(g, 'coil_end', new Set(['stream', 'fo_start']), 400) === true, `v0.11.21: the Coil screen walks back to Day 1 (run ${run})`);
}
// v0.9.6: the warning before a sealing Foundation, and Act 1's Coil at Shen Qiu
for (let run = 0; run < 40; run++) {
    const g = ensureBars(newGame(run + 44444, { closed: true })); g.james.primaries = 12; g.james.collaterals = 9 * (run % 3); g.james.saturation = 96; g.flags.bt_return = 'stream';
    assert(walkFrom(g, 'col_warn', new Set(['stream']), 400) === true, `v0.11.21: the seal warning walks back to the stream (run ${run})`);
    const a = ensureBars(fresh(run + 45454)); a.scene = 'epilogue'; a.flags.ending = 'bluff'; a.minutes = 6 * 1440 + 900;
    choose(a, SCENES, 0); seen.add('fo_start');
    a.scene = 'rt_taken'; SCENES.rt_taken.enter(a); seen.add('rt_taken');
    choose(a, SCENES, SCENES.rt_taken.choices.findIndex((c) => c.to === 'coil_end'));
    assert(walkFrom(a, 'coil_end', new Set(['fo_start', 'arrival']), 400), `v0.11.21: Act 1's Coil screen walks back to its first dawn or an ending (run ${run})`); // an ending is fine here (1 run in 40 reaches a1_end)
}
// v0.11.26: the end of Act 1 goes round again (Incremental Mode): a1_end → a1_again → back to a first dawn, or not yet
for (let run = 0; run < 10; run++) {
    const e = ensureBars(fresh(run + 46464)); e.scene = 'epilogue'; e.flags.ending = 'paid'; e.minutes = 6 * 1440 + 900; choose(e, SCENES, 0);
    e.flags.a1_outcome = ['victory', 'taken', 'revelation'][run % 3]; goTo(e, SCENES, 'a1_end'); seen.add('a1_end');
    const go = sceneView(e, SCENES).choices.find((c) => /Go round again/.test(c.label));
    assert(!!go, `v0.11.26: the end of Act 1 offers Go round again (run ${run})`);
    choose(e, SCENES, go.index);
    assert(walkFrom(e, 'a1_again', new Set(['fo_start', 'arrival', 'a1_end']), 400), `v0.11.26: going round again walks to a first dawn or back to the end (run ${run})`);
}
// v0.11.34 (D1): two scenes Incremental Mode does reach, which the random walks above miss
for (let run = 0; run < 20; run++) { // the Nascent Soul warning: realm 6 with the Extraordinary vessels closed, from the Meditate card's breakthrough
    const g = ensureBars(fresh(run + 47474)); g.james.realm = 6; g.yuki.realm = 6; g.james.extra8 = run % 8; g.james.saturation = 96; g.flags.bt_return = 'stream'; ensureBars(g);
    assert(btTarget(g) === 'ns_warn', `v0.11.34: realm 6 with ${run % 8} of 8 vessels open warns first (${btTarget(g)})`);
    assert(walkFrom(g, 'ns_warn', new Set(['stream', 'breakthrough']), 400) === true, `v0.11.34: the Nascent Soul warning walks on (run ${run})`);
}
for (let run = 0; run < 20; run++) { // Yuki's sister path: the interrogation at the Blackroot camp
    const g = ensureBars(fresh(run + 48484)); g.minutes = 18 * 1440 + 1200;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true, yk_path: 'sister' });
    g.rel = { 'Mei Lin': { f: 40, a: 10 }, Ya: { f: 40, a: 10 }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } }; ensureBars(g);
    goTo(g, SCENES, 'bl_camp'); seen.add('bl_camp');
    const talk = sceneView(g, SCENES).choices.find((c) => !c.disabled && /^Let Yuki interrogate you/.test(c.label));
    assert(!!talk, `v0.11.34: the Blackroot camp offers Yuki's interrogation on the sister path (run ${run})`);
    if (!talk) continue;
    choose(g, SCENES, talk.index);
    assert(g.scene === 'yk_sister_talk', `v0.11.34: it leads to yk_sister_talk (${g.scene})`);
    assert(walkFrom(g, g.scene, new Set(['a1_end']), 1500, true) === true, `v0.11.34: from yk_sister_talk to the end of Act 1 (run ${run})`);
}
// v0.11.91 (owner pick Y1): Yuki's choice at the Long Forest's last fire (yk_choice) and both answers, on purpose: the random
// games reached "More." (yk_lover) about once in 1,000, and the new night clock (bed from 21:00, the day's end at 00:00) shifted that
for (const [run, re, to] of [[0, /^"Family/, 'yk_sister'], [1, /^"More\."/, 'yk_lover'], [2, /^"Family/, 'yk_sister'], [3, /^"More\."/, 'yk_lover']]) {
    const g = ensureBars(fresh(run + 49494)); g.minutes = 10 * 1440 + 21 * 60; g.james.realm = 7; g.yuki.realm = 7;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true, yk_back: 'bl_camp', lf_active: true }); // v0.11.137 (QA2): the Long Forest's fire
    g.rel = { 'Mei Lin': { f: 40, a: 10 }, Ya: { f: 40, a: 10 }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } }; ensureBars(g);
    goTo(g, SCENES, 'yk_choice'); seen.add('yk_choice');
    const ans = sceneView(g, SCENES).choices.find((c) => !c.disabled && re.test(c.label));
    assert(!!ans, `v0.11.91 (Y1): yk_choice offers ${to} (run ${run})`);
    if (!ans) continue;
    choose(g, SCENES, ans.index);
    assert(g.scene === to && g.flags.yk_path === (to === 'yk_lover' ? 'lover' : 'sister'), `v0.11.91 (Y1): the answer leads to ${to} (${g.scene}, ${g.flags.yk_path})`);
    assert(walkFrom(g, g.scene, new Set(['bl_camp']), 50, true) === true, `v0.11.91 (Y1): from ${to} on to the Blackroot camp (run ${run}, at ${g.scene})`);
}
// v0.11.135 (owner picks NT1, EV1): the 27 scenes that repeated across days in a Coil: on each later day a new text (Fable's),
// every form, the original first; the event scenes per event; the talks' beats follow the day too.
{
    const onDay = (g, k) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; return g; };
    // [scene, texts that must differ day by day, flags]
    const NT = [
        ['bl_night_won', 4, { bl_ev: 'drowned' }], ['bl_night_won', 4, { bl_ev: 'wolves' }], ['guardian_approach', 3, {}], ['heart_spring', 3, {}],
        ['talk_mei', 5, {}], ['talk_ya', 5, {}], ['heart_morning', 3, {}], ['rr_elk_won', 2, {}], ['bl_fireside', 2, { bl_region: 'dw' }],
        ['rr_hunt', 2, {}], ['ah_hunt', 2, {}], ['night', 2, { fire: true }], ['wen_lesson', 2, { lore_realms: true }], ['ah_hawks_won', 2, {}],
        ['bl_night', 2, { bl_region: 'dw' }], ['far_won', 2, {}],
        ...['lights'].map((e) => ['bl_night_event', 3, { bl_ev: e }]), ...['drowned', 'serpent', 'mei', 'warm', 'rain'].map((e) => ['bl_night_event', 2, { bl_ev: e }]),
        ...['rats', 'rain', 'gift', 'crows', 'lights'].map((e) => ['night_event', 2, { night_ev: e }]),
        ['heart_night', 3, { heart_night_roll: 1 }], ['heart_night', 3, { heart_night_roll: 5 }],
        ...['wolves', 'bull', 'deer'].map((e) => ['far_hunt', 2, { far_kind: e }]),
        ['fo_ashfall', 2, {}], ['camp', 2, {}], ['ashfall', 2, {}], ['wilds', 2, {}],
    ];
    // v0.11.154 (RV1, CF + FX): the camp goes by the night in the forest, the Fallout hub by the story's day, not by the day record
    const SETDAY = { camp: (g, k) => { g.flags.forest_day = k + 1; }, fo_ashfall: (g, k) => { g.minutes = (7 + k) * 1440 + 9 * 60; } };
    let n = 0;
    for (const [id, want, flags] of NT) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
        const texts = [];
        for (let k = 0; k < want; k++) {
            const g = ensureBars(fresh(5100)); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; Object.assign(g.flags, flags);
            g.scene = id; onDay(g, k); if (SETDAY[id]) SETDAY[id](g, k); texts.push(sceneView(g, SCENES).text);
        }
        const g0 = ensureBars(fresh(5100)); g0.yuki.realm = realm; g0.james.realm = realm; g0.yuki.form = form; Object.assign(g0.flags, flags); g0.scene = id;
        if (SETDAY[id]) SETDAY[id](g0, 0);
        assert(texts[0] === sceneView(g0, SCENES).text, `NT1: ${id} ${JSON.stringify(flags)} (${form}): the first day's text is the original`);
        assert(new Set(texts).size === want && texts.every((t) => t && !/undefined|\$\{|\bNaN\b/.test(t)), `NT1: ${id} ${JSON.stringify(flags)} (${form}): ${want} different texts on ${want} days (${new Set(texts).size})`);
        n++;
    }
    // RN2 (M1; Fable's review): the screens that never show on a second day keep one text (their later texts were taken out)
    for (const [id, flags] of [['rr_hub', { bl_day: 2 }], ['dw_hub', {}], ['rt_camp', {}], ['village', {}]]) {
        const t = [0, 1, 2].map((k) => { const g = ensureBars(fresh(5101)); Object.assign(g.flags, flags); g.scene = id; onDay(g, k); return sceneView(g, SCENES).text; });
        assert(t[0] === t[1] && t[1] === t[2], `RN2 (M1): ${id} has one text`);
    }
    // RN2 (M2): the talks' order: beats 0 and 1, the settled text at 2, the two new beats at 3 and 4, the settled text again from 5
    for (const [id, settled] of [['talk_mei', /^For a while you walk and neither of you talks/], ['talk_ya', /^Ya is in a good mood/]]) {
        const t = [0, 1, 2, 3, 4, 5].map((k) => { const g = ensureBars(fresh(5103)); g.scene = id; onDay(g, k); return sceneView(g, SCENES).text; });
        assert(settled.test(t[2]) && settled.test(t[5]) && !settled.test(t[3]) && !settled.test(t[4]) && new Set(t.slice(0, 5)).size === 5, `RN2 (M2): ${id}: the settled text third, the new beats fourth and fifth`);
    }
    // RN2 (H1): a night scene entered before midnight and shown after it is still that night (the text day runs from 05:00)
    for (const id of ['night', 'bl_night_event']) {
        const g = ensureBars(fresh(5104)); g.flags.fire = true; g.flags.bl_region = 'dw';
        g.minutes = Math.floor(g.minutes / 1440) * 1440 + 2 * 1440 + 23 * 60 + 50; goTo(g, SCENES, id);
        const before = sceneView(g, SCENES).text; g.minutes += 25; const after = sceneView(g, SCENES).text;
        assert(before === after && dayIndex(g, id) === 0, `RN2 (H1): ${id} entered at 23:50 shows the same, first, text at 00:15`);
    }
    // RN2 (L1): the whispering night has its own key
    { const g = ensureBars(fresh(5105)); g.flags.ya_party = true; g.flags.trio = 2; g.flags.heart_night_roll = 5; assert(SCENES.heart_night.dayKey(g) === 'heart_night:whisper' && /whispering/.test(sceneView(Object.assign(g, { scene: 'heart_night' }), SCENES).text), 'RN2 (L1): the whispering night is keyed as whisper'); g.flags.trio = 0; assert(SCENES.heart_night.dayKey(g) === 'heart_night:quiet', 'RN2 (L1): the quiet night as quiet'); }
    // the talks' beat follows the day even when a talk was left without a beat counted
    const tm = ensureBars(fresh(5102)); tm.scene = 'talk_mei'; tm.flags.mei_talks = 0; onDay(tm, 2);
    const tm2 = ensureBars(fresh(5102)); tm2.scene = 'talk_mei'; tm2.flags.mei_talks = 2;
    assert(sceneView(tm, SCENES).text === sceneView(tm2, SCENES).text, 'NT1: talk_mei on its third day shows the third beat even if the counter stayed at 0');
    assert(dayIndex(tm2, 'talk_mei') === 0, 'NT1: dayIndex reads 0 with no record');
    assert(n === NT.length * 3, `NT1: ${n} scene × form checks`);
}
// v0.11.136 (owner pick NC1, NT1's push 2): the replies that came back on another day of a Coil (38 lists, 52 new texts, Fable's):
// the first day's reply is the old one (as the bots measured it before), each later day the next text, the gains the same every day.
{
    const onDay = (g, k) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; return g; };
    // [key, the old reply (the small cat's, where it goes by her form)]
    const NC = [
        ["bl_camp:2", "White points in a ring, all tilted outward. Ya approves of anything sharp at one end."],
        ["heart_camp:1", "She goes through her grandmother's songs about the Old Tree for you. Here and there a word is one of yours, a word from home, rubbed smooth by four centuries of mouths that never knew what it meant."],
        ["talk_ya:0", "She sizes you up like a bone-elk at the end of a hungry winter."],
        ["talk_ya:3", "Her teeth come out, and she walks on ahead. She will get over it. Probably."],
        ["supper:2", "Her mother washes the bowls, and over the water she gives you the village, low-voiced and in correct form: what each family owes the Sect, which houses the road has cost a child, which neighbours would hand you over for a measure of millet. Not one smile in all of it. No hour on this world has taught you more."],
        ["wen_lesson:forest", "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, on your knee, has not once looked away from the forest."],
        ["bl_night_event:1", "You follow until the roots knit shut across the way. The lights pass through a gap no person could use, and the song goes through with them."],
        ["talk_mei:1", "\"Impossible,\" she says. The smile gets out before the word is finished."],
        ["herb_slopes:0", "Mei Lin concedes, with reluctance, that you have hands."],
        ["heart_spring:0", "Ya gives the first half to drowning you and the second to making you less stiff. Then, briefly and to great effect, she drops every project but one, which is sitting closer."],
        ["heart_spring:1", "Mei Lin washes next to you, eyes front, and informs the wall that you are a coward. She says it fondly enough."],
        ["night_event:11", "Yuki accepts the praise as simple fact."],
        ["heart_spring:2", "You put your back against a warm stretch of wall, with Yuki in your lap, and listen to the water. For half an hour not one person needs a thing from you."],
        ["rr_hunt:1", "Ya mourns the elk until dark, aloud, in instalments."],
        ["bl_fireside:2", "What happens is that Ya eats off your plate and Mei Lin goes to sleep against your shoulder. You score it a draw."],
        ["night_event:2", "A ribbed white roof. Dry, smug, asleep."],
        ["heart_camp:2", "She gives you the very edge of the ledge, and laughs when you hold on to it. Then, with great seriousness, she tells you how many days she tracked you through the forest before she decided you were interesting. All of them, it turns out. Your fire settled it, she says: a man who gives Yuki the best piece is not as cold as he talks."],
        ["heart_camp:3", "You play the opening again: only Wren's voice, only the planting. Yuki purrs against your chest from her first word to her last."],
        ["night_event:0", "Mapped: every light is bound for the dead tree, like blood still running to a heart that has quit."],
        ["bl_train:0", "Two throws to her, one to you. She could not be happier."],
        ["ah_forage:0", "Earth, smoke. Magnificent. Your career peaks here."],
        ["wild_forage:2", "The bees are still arguing about it."],
        ["wild_train:2:f", "Scratched."],
        ["workshop:0:f", "A few come out brittle. Fishhooks, all the same."],
        ["fo_palisade:0:f", "Every other stake crumbles at a mallet's first tap. The hunters cut pine for the gaps, wordlessly, and the silence says the rest."],
        ["clinic:1:f", "You do what two hands can. The line was longer than that."],
        ["fo_drill:1:f", "Yuki wins. Decisively."],
        ["workshop:2:f", "It breaks on a root. The farmers bow to the two halves and say nothing. You would have preferred words."],
        ["bl_train:0:f", "Four throws, all hers. She enjoys each one."],
        ["wild_forage:2:f", "Stung. A lot."],
        ["drill:1:f", "The twelve-year-old tips you onto your back, hauls you up again, and begs pardon in full form for the disrespect. Of the two, the pardon hurts more."],
        ["ah_forage:1", "She holds one out on her palm for you to eat, and her hand seems not to know it."],
        ["rr_forage:1", "Her hand resets your knife-grip. Her eyes stay put."],
        ["wild_hunt:2:f", "It pinches back."],
        ["wild_forage:1:f", "Leeches."],
        ["drill:0:f", "Two of them hit each other. The apologies are faultless."],
        ["fo_council:0:f", "The words come out lame. The council takes the meaning regardless, and bows a finger's width short."],
        ["fo_clinic:0:f", "Mostly. You'll check the split scalp again tonight."]
    ];
    // v0.11.172 (owner picks P5A, CA1): the Blackroot's twelve first-day texts above (bl_camp:2, talk_ya:0 / :3, bl_night_event:1, talk_mei:1, rr_hunt:1,
    // bl_fireside:2, bl_train:0 / :0:f, ah_forage:0 / :1, rr_forage:1) are Fable's rewrite of the old ones (set 1 for the lists by Coil)
    // v0.11.169 (owner picks P3A, CA1): Ashfall's seven first-day texts above (supper:2 … drill:0:f) are Fable's rewrite of the old ones
    // the Results lines each reply sat with before NC1 (the game as of v0.11.135, the same state), so a gain dropped or changed on every day is caught
    const OLD_GAINS = {"bl_camp:2":[],"heart_camp:1":[],"talk_ya:0":[],"talk_ya:3":[],"supper:2":[],"wen_lesson:forest":[],"bl_night_event:1":[],"talk_mei:1":[],"herb_slopes:0":["+2 Ninefold spirit grass (trade goods)."],"heart_spring:0":["+6 HP."],"heart_spring:1":["+4 HP."],"night_event:11":["+1 Mire fowl (dressed).","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"heart_spring:2":[],"rr_hunt:1":["+2 root-hares (as hare)."],"bl_fireside:2":[],"night_event:2":[],"heart_camp:2":[],"heart_camp:3":[],"night_event:0":[],"bl_train:0":[],"ah_forage:0":["+2 ash-truffles (as jade bracket), and one eaten on the spot: +10 satiety."],"wild_forage:2":["+2 Wild honeycomb."],"wild_train:2:f":["−1 HP.","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"workshop:0:f":[],"fo_palisade:0:f":[],"clinic:1:f":[],"fo_drill:1:f":["−2 HP.","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"workshop:2:f":[],"bl_train:0:f":["−2 HP."],"wild_forage:2:f":["+1 Wild honeycomb, −3 HP."],"drill:1:f":["−2 HP.","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"ah_forage:1":["+6 cinderberries (as needleberries)."],"rr_forage:1":["+4 root-sorrel (counts as river cress)."],"wild_hunt:2:f":["−2 HP."],"wild_forage:1:f":["+2 River cress anyway."],"drill:0:f":[],"fo_council:0:f":[],"fo_clinic:0:f":[]};
    // RV2 (TG, Fable's review): the old first-day replies of the three lists that go by Yuki's form (the game as of v0.11.135)
    const OLD_FORMS = {"tiger":{"heart_camp:3":"You play the opening again: only Wren's voice, only the planting. Yuki's head is on your chest, and she purrs from her first word to her last.","heart_spring:2":"You put your back against a warm stretch of wall, with Yuki's head in your lap, and listen to the water. For half an hour not one person needs a thing from you.","wen_lesson:forest":"You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, her chin on your knee, has not once looked away from the forest."},"human":{"heart_camp:3":"You play the opening again: only Wren's voice, only the planting. Yuki leans on your shoulder and purrs, very quietly, from her first word to her last.","heart_spring:2":"You put your back against a warm stretch of wall, with Yuki's shoulder against yours, and listen to the water. For half an hour not one person needs a thing from you.","wen_lesson:forest":"You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, beside you, has not once looked away from the forest."}};
    const ST6K = ['rr_forage:2', 'rr_forage:2:after', 'ah_forage:2', 'ah_forage:2:after', 'ah_hunt:1:part', 'ah_hunt:1:full']; // v0.11.154 (PS1, ST6): their own test (RP1 push 2's block)
    const SWK = ['wild_forage:0', 'wild_forage:1', 'wild_forage:3', 'wild_hunt:0', 'wild_hunt:1', 'wild_hunt:2', 'wild_train:0', 'wild_train:1', 'wild_train:2', 'wild_train:3']; // v0.11.168 (P2A, SW): their own test (P2A's block)
    const SRK = ['clinic:0', 'clinic:1', 'workshop:0', 'drill:0', 'drill:1']; // v0.11.169 (P3A, SR): their own test (P3A's block)
    const SR4K = ['fo_palisade:0', 'fo_palisade:1', 'fo_palisade:1:f', 'fo_council:0', 'fo_council:1', 'fo_drill:0', 'fo_drill:0:f', 'fo_drill:1', 'fo_clinic:0', 'fo_clinic:1', 'fo_clinic:1:f']; // v0.11.170 (NX2, SR): their own test (NX2's block)
    const P5K = ['bl_camp:0', 'bl_train:1', 'bl_train:2']; // v0.11.172 (P5A, CW + SW): their own test (P5A's block)
    const P9K = ['wild_train:0:f', 'wild_train:1:f', 'wild_train:3:f']; // v0.11.177 (P9A, P2): the Wilds drills' failures, their own test (P9A's block)
    const D1K = ['bl_train:1:f', 'bl_train:2:f']; // D1 (the merged text push, b1): the Blackroot drills' failures, their own test (D1's block)
    const D1_FIRST = { 'rr_hunt:1': 'Your Convergence sings the snares out of nothing along the hare-runs, loops of white bone no thicker than a grass stem, and by the time Ya has finished looking down on the method they have closed on root-hares.' }; // D1 (a9): the sung snare, in front of the first day's old reply
    const keys = Object.keys(DAY_REPLIES).filter((k) => !ST6K.includes(k) && !SWK.includes(k) && !SRK.includes(k) && !SR4K.includes(k) && !P5K.includes(k) && !P9K.includes(k) && !D1K.includes(k));
    const first = (k) => COIL_SETS[k]?.[0] ?? DAY_REPLIES[k]; // v0.11.166 (RW1): a Coil's set for the lists by Coil
    assert(keys.length === 38 && keys.reduce((s, k) => s + first(k).length - 1, 0) === 67, `NC1 (v0.11.177, P9A FF: the Fallout's four failure lists' third texts): 38 reply lists with 52 new texts; v0.11.152 (RP1): 11 more (${keys.length}, ${keys.reduce((s, k) => s + first(k).length - 1, 0)})`);
    assert(JSON.stringify([...keys].sort()) === JSON.stringify(NC.map(([k]) => k).sort()), 'NC1: a list for every reply the bots saw on two days, and no other');
    const state = (g) => { const { lines, log, ...rest } = g; return JSON.stringify(rest); }; // RV2 (TG): the whole game but the day record and the log
    let n = 0;
    for (const [key, old] of NC) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
        const fail = key.endsWith(':f');
        const [scene, i] = key === 'wen_lesson:forest' ? ['wen_lesson', 0] : key.replace(/:f$/, '').split(':');
        const c = SCENES[scene]?.choices?.[Number(i)];
        if (!c) { assert(false, `NC1: ${key} has no choice`); continue; }
        const run = (k) => {
            const g = ensureBars(fresh(5200)); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; g.scene = scene;
            g.minutes = Math.floor(g.minutes / 1440) * 1440 + 2 * 1440 + 12 * 60; g.inventory.hearth_log = 1;
            if (key === 'wen_lesson:forest') g.flags.lore_realms = true;
            onDay(g, k); const before = state(ensureBars(g));
            const lines = (fail ? c.failDo : c.do)(g, { success: !fail, ratio: fail ? 0.2 : 1 }) || [];
            const sp = splitReply(lines);
            return { reply: sp.reply.join(' '), gains: JSON.stringify(sp.gains), delta: [before, state(g)] };
        };
        const list = first(key).map((t) => { const g = ensureBars(fresh(5200)); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; return typeof t === 'function' ? t(g) : t; });
        const days = list.map((_, k) => run(k));
        const want = D1_FIRST[key] ? `${D1_FIRST[key]} ${old}` : old; // D1 (a9)
        if (form === 'cat') assert(days[0].reply === want && days[0].gains === JSON.stringify(OLD_GAINS[key]), `NC1: ${key}: the first day's reply and its gains are the old ones (${days[0].reply} | ${days[0].gains})`);
        else if (OLD_FORMS[form][key]) assert(days[0].reply === OLD_FORMS[form][key], `NC1 (RV2, TG): ${key} (${form}): the first day's reply is the old one`);
        else assert(days[0].reply === want, `NC1 (RV2, TG): ${key} (${form}): one first-day reply in every form, the old one`);
        assert(days.every((d, k) => d.reply === list[k]), `NC1: ${key} (${form}): day k shows text k`);
        assert(new Set(days.map((d) => d.reply)).size === list.length, `NC1: ${key} (${form}): a different reply each day`);
        assert(days.every((d) => d.gains === days[0].gains && JSON.stringify(d.delta) === JSON.stringify(days[0].delta)), `NC1: ${key} (${form}): the same gains and effects every day`);
        assert(list.every((t) => t && !/undefined|\$\{|\bNaN\b/.test(t) && splitLine(t).gain === '' && splitLine(t).reply === t), `NC1: ${key} (${form}): every text is reply only (no sentence the screen would move to Results)`);
        assert(run(list.length).reply === list[0], `NC1: ${key}: past the last text, from the first again`);
        n++;
    }
    assert(n === NC.length * 3, `NC1: ${n} reply × form checks`);
    // the day is noted under r:<key> as the reply is drawn: the same day twice is one day, the next day the next text, a new Coil the first again
    const g = ensureBars(fresh(5201)); g.minutes = Math.floor(g.minutes / 1440) * 1440 + 2 * 1440 + 12 * 60; g.scene = 'bl_camp';
    const stakes = () => splitReply(SCENES.bl_camp.choices[2].do(g)).reply[0];
    const a = stakes(), b = stakes(); g.minutes += 1440; const c2 = stakes();
    assert(a === DAY_REPLIES['bl_camp:2'][0] && b === a && c2 === DAY_REPLIES['bl_camp:2'][1] && g.lines.d['r:bl_camp:2'].length === 2, 'NC1: the stakes reply by the day it is drawn (noted as r:bl_camp:2)');
    g.coil.n += 1; assert(stakes() === DAY_REPLIES['bl_camp:2'][0], 'NC1: a new Coil starts the replies on their first text again');
    // RV2 (TG, Fable's review): end to end through the card and the screen's landing: day 2 shows text 2, the wrap on day 3 goes
    // quiet (said this Coil), a thin haul keeps the reply; the dry run and the threat word leave the day record alone
    {
        const h = ensureBars(fresh(5300)); h.scene = 'wilds'; const d0 = Math.floor(h.minutes / 1440) * 1440 + 2 * 1440 + 9 * 60;
        const L = DAY_REPLIES['wild_forage:2:f'];
        const shown = [0, 1, 2].map((k) => {
            h.minutes = d0 + k * 1440; h.james.hp = 40; h.james.qi = 20; h.james.satiety = 80; h.scene = 'wilds';
            const rec = JSON.stringify(h.lines?.d || {}); taskOutcome(h, SCENES, 'wild_forage:2');
            assert(JSON.stringify(h.lines?.d || {}) === rec, `NC1 (RV2, TG): the dry run leaves the day record alone (day ${k + 1})`);
            const r = runTask(h, SCENES, 'wild_forage:2'); const s2 = landReply(h, splitReply(r.lines).reply, { entry: true }); noteSaid(h, s2); return s2;
        });
        assert(shown[0].includes(L[0]) && shown[1].includes(L[1]) && !shown[2].includes(L[0]) && !shown[2].includes(L[1]), `NC1 (RV2, TG): the honey card's failure: day 1 the old reply, day 2 the new one, day 3's wrap quiet (${JSON.stringify(shown)})`);
        const p = ensureBars(fresh(5301)); p.scene = 'wilds'; p.james.gu = { tier: 1, level: 4, xp: 0 }; ensureBars(p); p.minutes = d0 + 1440; p.lines = null;
        p.lines = { c: coilStamp(p), p: {}, last: {}, cur: {}, at: null, said: [], d: { 'r:wild_forage:2': [textDay(p) - 1] } };
        assert(cardCheck(p, 'wild_forage:2', SCENES.wild_forage.choices[2]).band === 'partial', 'NC1 (RV2, TG): the honey card is a thin haul at GU T1 L4');
        const pr = splitReply(runTask(p, SCENES, 'wild_forage:2').lines).reply;
        assert(pr.includes(DAY_REPLIES['wild_forage:2'][1]), `NC1 (RV2, TG): a thin haul keeps the day's reply (${JSON.stringify(pr)})`);
        const t = ensureBars(fresh(5302)); t.scene = 'talk_ya'; const rec = JSON.stringify(t.lines || null);
        assert(threatOf(t, SCENES, 0) === null && JSON.stringify(t.lines || null) === rec, 'NC1 (RV2, TG): the threat word leaves the day record alone');
        const c = ensureBars(fresh(5303)); c.scene = 'talk_ya'; const r0 = splitReply(choose(c, SCENES, 0).lines).reply;
        assert(r0.includes(DAY_REPLIES['talk_ya:0'][0]) && c.lines.d['r:talk_ya:0'].length === 1, 'NC1 (RV2, TG): a story choice through choose() shows the first text and notes its day');
    }
    // v0.11.166 (owner picks RW1, FT1; Fable's texts): the flirts by Coil: three sets of five, the first the old replies; the act's
    // first Coil the first set, the next the second, then the third, then round again; a day's text within the Coil's set as before
    {
        const OLD = { 'talk_ya:0': "She sizes you up like a bone-elk at the end of a hungry winter.", 'talk_mei:1': "\"Impossible,\" she says. The smile gets out before the word is finished." }; // v0.11.172 (P5A, FL): set 1 is Fable's rewrite of the old replies
        const NEW1 = { 'talk_ya:0': 'She stops dead and watches your mouth, in case more falls out.', 'talk_mei:1': 'One eyebrow goes up. She asks whether that line works where you come from.' };
        const NEW2 = { 'talk_ya:0': 'Ya squints at you. "Is that the thing villages do?', 'talk_mei:1': 'She tells you, gravely, that a respectable woman would walk away.' };
        assert(JSON.stringify(Object.keys(COIL_SETS).sort()) === JSON.stringify(['talk_mei:1', 'talk_ya:0', 'talk_ya:3']), `RW1: the two flirts and (v0.11.172, P5A KO) Ya's "Knock it off" go by Coil, nothing else (${Object.keys(COIL_SETS)})`);
        const all = [];
        for (const [key, idx] of [['talk_ya:0', 0], ['talk_mei:1', 1]]) {
            const sets = COIL_SETS[key];
            assert(sets.length === 3 && sets.every((x) => x.length === 5) && DAY_REPLIES[key].length === 15, `RW1: ${key}: three sets of five, all fifteen for the lint`);
            assert(sets[0][0] === OLD[key] && sets[1][0].startsWith(NEW1[key]) && sets[2][0].startsWith(NEW2[key]), `RW1: ${key}: set 1 the old replies, sets 2 and 3 Fable's`);
            all.push(...sets.flat());
            for (const t of sets.flat()) assert(typeof t === 'string' && (sets[0].includes(t) || t.split(/\s+/).length >= 20) && t.split(/\s+/).length <= 45 && !/undefined|\$\{/.test(t) && splitLine(t).gain === '' && splitLine(t).reply === t, `RW1: ${key}: a reply only, 20–45 words (${t.slice(0, 40)})`);
            for (const coil of [0, 1, 2, 3, 4]) for (const day of [0, 1, 2, 3, 4, 5]) {
                const g = ensureBars(fresh(5400 + coil)); g.scene = key === 'talk_ya:0' ? 'talk_ya' : 'talk_mei'; g.coil.act = 1; g.stats.coils0 = 3; g.coil.n = 3 + coil;
                g.minutes = Math.floor(g.minutes / 1440) * 1440 + 11 * 1440 + 9 * 60;
                for (let d = 0; d < day; d++) { noteDay(g, `r:${key}`); g.minutes += 1440; }
                const r = splitReply(SCENES[g.scene].choices[idx].do(g)).reply.join(' ');
                assert(actCoil(g) === coil && r === sets[coil % 3][day % 5], `RW1: ${key}: the act's Coil ${coil + 1}, day ${day + 1} shows set ${(coil % 3) + 1}, text ${(day % 5) + 1} (${r.slice(0, 40)})`);
            }
        }
        assert(new Set(all).size === 30, 'RW1: the thirty flirt replies all differ');
        const shingles = (t) => { const w = t.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean); const o = new Set(); for (let i = 0; i + 4 < w.length; i++) o.add(w.slice(i, i + 5).join(' ')); return o; };
        const seen = new Map(); let shared = 0;
        for (const t of all) for (const sh of shingles(t)) { if (seen.has(sh) && seen.get(sh) !== t) shared++; seen.set(sh, t); }
        assert(shared === 0, `RW1: no five-word passage shared between two flirt replies (${shared})`);
        // the old count without coilsN (a save before the crossing count): the one count's Coil from its start
        const o = ensureBars(fresh(5410)); o.coil.act = 1; delete o.stats.coils0; o.coil.n = 2;
        assert(actCoil(o) === 1 && actCoil({ coil: { act: 0, n: 1 } }) === 0 && actCoil(null) === 0, 'RW1: actCoil on a save without coils0, the prologue and no game');
        // RV1 (L1, Fable's review): a hand-edited count (not a number, a fraction, below 1) reads as the default, never NaN
        for (const [n, c0, want] of [['x', 1, 0], [2.5, 1, 1], [4, 'y', 3], [-3, 1, 0], [3, 0, 2], [3, 1.9, 2]]) {
            const b = { coil: { act: 1, n }, stats: { coils0: c0 } };
            assert(actCoil(b) === want, `RW1 (RV1, L1): actCoil with n ${n}, coils0 ${c0} is ${want} (${actCoil(b)})`);
        }
        const bad = ensureBars(fresh(5411)); bad.scene = 'talk_ya'; bad.coil.act = 1; bad.coil.n = 'x'; bad.stats.coils0 = 'y';
        assert(splitReply(SCENES.talk_ya.choices[0].do(bad)).reply.join(' ') === COIL_SETS['talk_ya:0'][0][0], 'RW1 (RV1, L1): a hand-edited save still flirts (set 1)');
        // RV1 (M2, Fable's review): the real Coil flow: the crossing, Act 1 rewinds (set 2, 3, then 1 again), the whole game again and
        // the next crossing (set 1 again), each Coil starting on its set's first text, a day's text within the Coil's set
        const ya = (g) => splitReply(SCENES.talk_ya.choices[0].do(g)).reply.join(' ');
        const S = COIL_SETS['talk_ya:0'];
        const g = ensureBars(fresh(5420)); g.coil.n = 3; g.scene = 'bl_start'; g.minutes = 10 * 1440 + 6 * 60;
        startActCoil(g, 1); g.scene = 'talk_ya';
        const atDay = (d) => { g.minutes = (10 + d) * 1440 + 9 * 60; g.scene = 'talk_ya'; return ya(g); };
        const seq = [];
        seq.push(atDay(0), atDay(0), atDay(1)); for (const d of [2, 3, 4]) atDay(d); seq.push(atDay(5)); // the sixth day it is drawn wraps
        assert(seq[0] === S[0][0] && seq[1] === S[0][0] && seq[2] === S[0][1] && seq[3] === S[0][0] && actCoil(g) === 0, `RW1 (RV1, M2): the crossing Coil: set 1, the same day twice the same, day 2 text 2, day 6 wraps (${seq.map((t) => t.slice(0, 20)).join(' | ')})`);
        for (const want of [1, 2, 0]) {
            rewind(g); assert(g.coil.act === 1 && actCoil(g) % 3 === want && atDay(0) === S[want][0] && atDay(1) === S[want][1], `RW1 (RV1, M2): an Act 1 rewind: set ${want + 1}, from its first text (Coil ${g.coil.n})`);
        }
        rewind(g, { to: 'game' }); assert(g.coil.act === 0, 'RW1 (RV1, M2): the whole game again is the prologue');
        g.coil.n += 1; startActCoil(g, 1); g.scene = 'talk_ya';
        assert(actCoil(g) === 0 && atDay(0) === S[0][0] && g.stats.coils0 === g.coil.n, `RW1 (RV1, M2): the next crossing starts over with set 1 (Coil ${g.coil.n})`);
        rewind(g); assert(actCoil(g) === 1 && atDay(0) === S[1][0], 'RW1 (RV1, M2): and its Act 1 rewind brings set 2');
        // RV1 (L2, Fable's review): the old Act 1 saves load with the right set (v0.11.7's Coil 1 and Coil 2, through deserialize's count)
        for (const [f, want] of [['v0.11.7-act1-coil1.json', 0], ['v0.11.7-act1-coil2.json', 1]]) {
            const o2 = deserialize(readFileSync(new URL(`../saves/${f}`, import.meta.url), 'utf8'), { force: true });
            assert(o2.coil.act === 1 && actCoil(o2) === want, `RW1 (RV1, L2): ${f} loads with set ${want + 1} (n ${o2.coil.n}, coils0 ${o2.stats.coils0})`);
            const r2 = deserialize(serialize(o2));
            assert(actCoil(r2) === want, `RW1 (RV1, L2): ${f} keeps its set through a save and load`);
        }
    }
    // v0.11.167 (owner picks P1A, CA1; Fable's rewrite of part 1): the riders in the text, the camp by night, the 48 memory lines
    {
        const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
        const g0 = ensureBars(fresh(5500));
        const herb = txt('herb_girl', g0);
        assert(/white jacket, red sash/.test(herb) && !/patched brown/.test(herb), 'CA1: Mei Lin wears her white jacket and red sash on the herb slope (rider 1)');
        assert(/glasses/.test(txt('arrival', g0)) && /ouroboros/.test(txt('arrival', g0)), 'CA1: the arrival names his glasses and the ouroboros (rider 2)');
        assert(/Foundation/.test(txt('gao_talked', g0)), 'CA1: Gao Feng names himself of the Foundation (rider 6)');
        const camp = [1, 2, 3].map((night) => { const g = ensureBars(fresh(5501)); g.flags.fire = true; g.flags.stakes = true; g.flags.forest_day = night; g.scene = 'camp'; return txt('camp', g); }); // byNight reads the forest night
        const fire = camp.map((t) => t.split('\n').find((l) => /fire/i.test(l) && /stake|bone/i.test(l)) || '');
        assert(new Set(fire).size === 3 && fire.every(Boolean), `CA1: the camp's fire and stakes line differs on each of three nights (rider 5) (${fire.map((f) => f.slice(0, 30)).join(' | ')})`);
        assert(MEMORY_LINES.length === 48 && new Set(MEMORY_LINES).size === 48 && MEMORY_LINES.every((l) => l.split(/\s+/).length <= 22 && !/\$\{|undefined/.test(l)), `CA1 (MX): 48 memory lines, none twice, short (${MEMORY_LINES.length})`);
        assert(MEMORY_LINES.slice(24).every((l) => !/shoulder|I am a cat|I'm a cat|lap\b/i.test(l)), 'CA1 (MX): the new memory lines fit every form of Yuki');
        // RV1 (the Opus review): the camp's nights 2–3 don't presume the night before; the jackals' label fits the thin night; Yuki's last night
        assert(camp.slice(1).every((t) => !/last night|three nights|as you left it/i.test(t)), 'CA1 (RV1, H1): the camp on nights 2 and 3 reads true without an earlier fire or ring');
        assert(SCENES.jackals_won.choices[0].text === "Sleep. What's left of the night." && /thin/.test(txt('jackals_won', g0)), 'CA1 (RV1, M4): the jackals label and the thin night agree');
        assert(readFileSync(new URL('../js/story/yuki_path.js', import.meta.url), 'utf8').includes('He will look at me and not see what I am.'), 'CA1 (RV1, H3): Yuki\'s last night no longer says Shen Qiu will not look twice');
        assert(!MEMORY_LINES.some((l) => /^You are the whole audience/.test(l)), 'CA1 (RV1, L8): Yuki remembers too');
    }
    // v0.11.168 (owner picks P2A, CA1; Fable's rewrite of part 2, the Wilds): SW the silent work cards' successes speak by day; the fixes
    {
        const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
        for (const k of SWK) {
            const l = DAY_REPLIES[k];
            assert(Array.isArray(l) && l.length === 2 && l[0] !== l[1] && l.every((t) => typeof t === 'string' && !/TODO|\$\{|undefined/.test(t) && t.split(/\s+/).length >= 8 && t.split(/\s+/).length <= 24), `P2A (SW): ${k} has two different short texts`);
        }
        const SW_GAIN = { 'wild_forage:0': ['+3 Jade bracket fungus.', 'jade_bracket', 3], 'wild_forage:1': ['+4 River cress.', 'river_cress', 4], 'wild_forage:3': ['+5 Crimson needleberries.', 'crimson_berry', 5],
            'wild_hunt:0': ['+2 Glassback hare.', 'hare_raw', 2], 'wild_hunt:1': ['+1 Mire fowl.', 'fowl_raw', 1], 'wild_hunt:2': ['+2 Stone-shell crab meat.', 'crab_meat', 2],
            'wild_train:0': [null], 'wild_train:1': [null], 'wild_train:2': [null], 'wild_train:3': [null] };
        for (const [k, [gain, item, n]] of Object.entries(SW_GAIN)) {
            const [scene, i] = k.split(':');
            const outs = [0, 1].map((d) => {
                const g = ensureBars(fresh(5600)); g.scene = scene; onDay(g, d); const before = item ? (g.inventory[item] || 0) : 0;
                const out = SCENES[scene].choices[Number(i)].do(g);
                if (item) assert((g.inventory[item] || 0) - before === n, `P2A (SW): ${k} still gives +${n} ${item}`);
                return out;
            });
            const first = outs.map((o) => o[0]);
            assert(first[0] !== first[1] && first.every((t, d) => t.includes(DAY_REPLIES[k][d])), `P2A (SW): ${k} says its day's text (${first.join(' | ')})`);
            if (gain) assert(first.every((t) => t.startsWith(gain + ' ')), `P2A (SW): ${k} keeps its gain first, exactly (${first[0]})`);
            if (k === 'wild_train:2') assert(outs.every((o) => o.length > 1), 'P2A (SW): footwork still adds Yuki\'s XP line after its text');
        }
        const g0 = ensureBars(fresh(5601));
        const yh = SCENES.wild_hunt.choices[3].do(ensureBars(fresh(5602)))[0];
        const haul = [TASK_HUBS.wilds.yuki.got(1), TASK_HUBS.wilds.yuki.got(2), TASK_HUBS.wilds.yuki.none];
        assert(!haul.some((h) => yh.includes(h.replace(/^Yuki /, ''))) && !/mild contempt/.test(haul.join(' ')), 'P2A (OT): Yuki\'s haul in the Wilds and the yukihunt reply are different texts');
        assert(!/three good spots/.test(txt('wild_forage', g0)) && !/Two rats/.test(txt('mire_won', g0)), 'P2A (OT): four forage spots, three mire-rats (no wrong count)');
        g0.flags.night_ev = 'rats'; assert(/sleep is left will not be enough/.test(txt('night_won', g0)), 'P2A (OT, rider 1; RV1 L6): a won night says the sleep left is short');
        // RV1 (TG, Fable's review): TG1 every SW card through the engine (runTask) in each band it can reach: a failure (and a drill's partial) shows no success
        // text and notes no day; a thin, full or double haul shows the day's text; M1 no text names a count or a whole haul
        const mkW = (gu, seed) => { const g = ensureBars(fresh(seed)); g.scene = 'wilds'; g.james.skills['Convergence Use'] = { tier: 1, level: 1, xp: 0 }; g.james.gu = { tier: gu[0], level: gu[1], xp: 0 }; ensureBars(g);
            g.minutes = Math.floor(g.minutes / 1440) * 1440 + 2 * 1440 + 9 * 60; g.james.qi = 99; g.james.hp = 40; return g; };
        let bands = 0;
        for (const k of SWK) {
            const [scene, i] = k.split(':'); const c = SCENES[scene].choices[Number(i)]; const L = DAY_REPLIES[k]; const seen = new Set();
            for (let t = 1; t <= 3; t++) for (let l = 1; l <= 10; l++) {
                const g = mkW([t, l], 5610); const band = cardCheck(g, k, c).band; if (seen.has(band)) continue; seen.add(band); bands++;
                const r = splitReply(runTask(g, SCENES, k).lines); const all = r.reply.concat(r.gains).join(' | ');
                const failed = band === 'fail' || (band === 'partial' && scene === 'wild_train'); // a drill's partial runs its failure (half XP)
                if (failed) assert(!L.some((x) => all.includes(x)) && !g.lines?.d?.[`r:${k}`], `P2A (RV1, TG1): ${k} failed: no success text, no day noted (${all})`);
                else assert(r.reply.some((x) => x.includes(L[0])), `P2A (RV1, TG1): ${k} ${band}: the first day's text (${all})`);
            }
            assert(seen.has('partial') && seen.has('full'), `P2A (RV1, TG1): ${k} reached a thin and a full haul (${[...seen]})`);
        }
        assert(bands >= 37, `P2A (RV1, TG1): the bands run (${bands})`);
        assert(['wild_forage:0', 'wild_hunt:0'].every((k) => DAY_REPLIES[k].every((t) => !/\bfull ring\b|\beach\b|\btwo\b|\bboth\b/i.test(t))), 'P2A (RV1, M1): the ring and hare texts name no count or whole haul');
        // TG2: a real two days (no faked day record): Day 2 a failure, Day 3 a success shows the first text; Day 4 a success the second
        {
            const g = mkW([1, 1], 5611); const k = 'wild_forage:1'; const L = DAY_REPLIES[k];
            assert(cardCheck(g, k, SCENES.wild_forage.choices[1]).band === 'fail', 'P2A (RV1, TG2): the cress fails at GU T1 L1');
            const r1 = splitReply(runTask(g, SCENES, k).lines); assert(!r1.reply.concat(r1.gains).some((x) => L.some((y) => x.includes(y))), 'P2A (RV1, TG2): Day 2 failed, no success text');
            g.james.gu = { tier: 1, level: 5, xp: 0 }; ensureBars(g); g.minutes += 1440; g.scene = 'wilds';
            const r2 = splitReply(runTask(g, SCENES, k).lines); g.minutes += 1440; g.scene = 'wilds';
            const r3 = splitReply(runTask(g, SCENES, k).lines);
            assert(r2.reply.some((x) => x.includes(L[0])) && r3.reply.some((x) => x.includes(L[1])), `P2A (RV1, TG2): the first success shows text 1 (no "yesterday"), the next day text 2 (${r2.reply} | ${r3.reply})`);
        }
        // TG3: Yuki's watched hunt, both ways, against her own haul lines
        {
            const yk = SCENES.wild_hunt.choices[3]; const outs = new Map();
            for (let s = 5620; s < 5680 && outs.size < 2; s++) { const g = ensureBars(fresh(s)); const before = g.inventory.hare_raw || 0; const o = yk.do(g)[0]; outs.set((g.inventory.hare_raw || 0) > before, o); }
            assert(outs.size === 2 && /\+1 Glassback hare\.$/.test(outs.get(true)) && !/Glassback/.test(outs.get(false)), `P2A (RV1, TG3): the watched hunt catches and misses (${[...outs.values()].join(' | ')})`);
            assert(haul.every((h) => ![...outs.values()].some((o) => o.includes(h.replace(/^Yuki comes back with /, '')))), 'P2A (RV1, TG3): neither branch repeats her haul lines');
        }
        // TG4: the Wilds' own lines keep the openings the screen sorts by; TG5: the lost night keeps its mechanical words
        {
            const g = ensureBars(fresh(5690)); g.scene = 'wilds'; g.minutes = Math.floor(g.minutes / 1440) * 1440 + 2 * 1440 + 10 * 60;
            const rest = SCENES.wilds.choices.find((c) => /^Rest in the shade/.test(c.text)).do(g);
            assert(rest.some((l) => /^An hour of rest/.test(l)), `P2A (RV1, TG4): the Wilds' rest line opens "An hour of rest" (${rest.slice(-1)})`);
            const m = ensureBars(fresh(5691)); m.scene = 'morning'; m.inventory.hare_raw = 1; m.minutes = Math.floor(m.minutes / 1440) * 1440 + 1440 + 7 * 60;
            const fed = SCENES.morning.enter(m); m.inventory = {}; const hungry = SCENES.morning.enter(m);
            assert(fed.some((l) => /^Breakfast\. /.test(l)) && hungry.some((l) => /^No breakfast\. /.test(l)), `P2A (RV1, TG4): the Wilds' morning opens "Breakfast. " / "No breakfast. " (${fed.concat(hungry).join(' | ')})`);
            const n = ensureBars(fresh(5692)); n.james.hp = 20; const lost = SCENES.night_lost.choices[0].do(n);
            assert(lost.some((l) => /HP partly back, Qi full\.$/.test(l)), `P2A (RV1, TG5): the lost night keeps "HP partly back, Qi full." (${lost})`);
        }
    }
    // v0.11.169 (owner picks P3A, CA1; Fable's rewrite of part 3, Ashfall): SR the five repeatable successes speak by day; YF every
    // Yuki text in every form; YH the barley-field haul by form; ST the three fights' stomp texts; LB the labels; the continuity fixes
    {
        const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
        const F = (seed, form, vday = 2) => { const g = ensureBars(fresh(seed)); const r = { cat: 0, tiger: 2, human: 7 }[form]; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.flags.long = true; g.flags.vday = vday; return ensureBars(g); };
        const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b/.test(t);
        const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
        let seed = 5700;
        // SR: two texts a list (Day 5, Day 6), different, short, in every form; the card's day shows its text, the gains the same both days
        const SR = { 'clinic:0': ['clinic', 0], 'clinic:1': ['clinic', 1], 'workshop:0': ['workshop', 0], 'drill:0': ['drill', 0], 'drill:1': ['drill', 1] };
        for (const [k, [scene, i]] of Object.entries(SR)) {
            assert(DAY_REPLIES[k]?.length === 2, `P3A (SR): ${k} has two texts`);
            for (const [form] of FORMS) {
                const L = DAY_REPLIES[k].map((t) => (typeof t === 'function' ? t(F(seed++, form)) : t));
                assert(L.every((t) => !bad(t) && t.split(/\s+/).length >= 5 && t.split(/\s+/).length <= 40) && L[0] !== L[1], `P3A (SR): ${k} (${form}): two different short texts (${L.join(' | ')})`);
                const runs = [0, 1].map((d) => { const g = F(5790, form, 2 + d); onDay(g, 0); /* v0.11.170 (RV1, P3D): by the village day */ g.scene = scene; g.inventory.jade_bracket = 3; onDay(g, d); const out = SCENES[scene].choices[i].do(g, { success: true, ratio: 1 }); const { lines, log, ...rest } = g; return { out, rel: JSON.stringify(g.rel), flags: JSON.stringify(Object.fromEntries(Object.entries(g.flags).filter(([f]) => !/^oo:|@|^vday$/.test(f)))), inv: JSON.stringify(g.inventory) }; });
                assert(runs.every((r, d) => r.out[0] === L[d]), `P3A (SR): ${k} (${form}): day ${'1 and 2'} show their texts (${runs.map((r) => r.out[0]).join(' | ')})`);
                assert(runs[0].rel === runs[1].rel && runs[0].flags === runs[1].flags && runs[0].inv === runs[1].inv, `P3A (SR): ${k} (${form}): the same gains both days`);
            }
            assert(DAY_REPLIES[k][0] !== undefined && SCENES[scene].choices[i].failDo, `P3A (SR): ${k} keeps its failure`);
        }
        // YF: the seven texts written for the cat only now read by form: three different texts, none broken, on every Ashfall day
        const YF = [
            ['supper', 1, {}, (t) => t.split('\n\n').slice(1).join('\n\n')],
            ['village_night', 1, {}, (t) => t],
            ['village_night', 2, {}, (t) => t.split('\n\n')[0]],
            ['mei_walk', 2, {}, (t) => t],
        ];
        for (const [id, vday, flags, part] of YF) {
            const v = FORMS.map(([form]) => { const g = F(seed++, form, vday); Object.assign(g.flags, flags); return part(txt(id, g)); });
            assert(v.every((t) => !bad(t) && t.length > 40) && new Set(v).size === 3, `P3A (YF): ${id} (day ${vday}) reads differently in each form`);
        }
        { const v = FORMS.map(([form]) => { const g = F(seed++, form, 2); return SCENES.mei_walk.choices[0].do(g)[0]; }); assert(new Set(v).size === 3 && v.every((t) => !bad(t)), 'P3A (YF): the Day 5 walk home reads differently in each form'); }
        for (const id of Object.keys(ASHFALL)) for (const vday of [1, 2, 3]) for (const [form] of FORMS) {
            const g = F(seed++, form, vday); g.flags.far_kind = 'wolves'; let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
            assert(!bad(t) && !/four hundred pounds of cat|a bone needle/.test(t), `P3A (YF): ${id} renders as ${form} on Ashfall day ${vday}, without the listed tics`);
        }
        assert(/"Your great beast has been staring/.test(txt('wen_lesson', Object.assign(F(seed++, 'tiger'), { flags: { ...F(seed++, 'tiger').flags, lore_realms: true } }))), 'P3A (YF): Old Wen names the great root-kin as such');
        // YH: Ashfall's haul lines by form (tasks.js hands g to them), the count kept, the venison the big forms' only
        const J = TASK_HUBS.ashfall.yuki;
        assert(TASK_HUBS.fo_ashfall.yuki === J && TASK_HUBS.rt_ashfall.yuki === J, 'P3A (YH): Act 1\'s Ashfall uses the same job');
        const hv = FORMS.map(([form]) => { const g = F(seed++, form); return [J.got(3, g), J.got(1, g), yukiSaysS(g, J.none), yukiSaysS(g, J.full), J.alts[0].got(2, g), J.alts[0].got(1, g)]; });
        assert(hv.every((r) => r.every((t) => !bad(t)) && r[0].includes('3 hares')), 'P3A (YH): every haul line renders, the count kept');
        for (let i = 0; i < 6; i++) assert(new Set(hv.map((r) => r[i])).size === (i === 3 ? 2 : 3), `P3A (YH): haul line ${i} by form (${hv.map((r) => r[i].slice(0, 30)).join(' | ')})`);
        { const t = F(seed++, 'tiger'), h = F(seed++, 'human'); assert(J.alts[1].big && J.alts[1].got(1, t) !== J.alts[1].got(1, h) && J.alts[1].got(2, t) !== J.alts[1].got(2, h), 'P3A (YH): the venison lines, the great root-kin\'s and the woman\'s'); }
        assert(/pick\.got\(n, g\)/.test(readFileSync(new URL('../js/core/tasks.js', import.meta.url), 'utf8')) && /yukiSays\(g, job\.none\)/.test(readFileSync(new URL('../js/core/tasks.js', import.meta.url), 'utf8')), 'P3A (YH): Yuki\'s lane hands the game to her lines');
        // ST: the stomp texts of the three fights, every degree and form; the arson's degree-2 win no longer the scene's twin
        for (const id of ['wolves', 'thornback', 'arson']) for (const [form] of FORMS) {
            const g = F(seed++, form); const S = STOMP[id];
            const all = [1, 2, 3].map((d) => S.posture(g, d)).concat([S.win[2](g), S.win[3](g), S.one(g)]);
            assert(all.every((t) => !bad(t) && t.length > 20), `P3A (ST): ${id}'s stomp texts render as ${form}`);
        }
        { const v = FORMS.map(([form]) => STOMP.thornback.win[3](F(seed++, form)).split('\n\n')[0]); assert(new Set(v).size === 3, 'P3A (ST): the thornback\'s crushing win in each form'); }
        { const g = F(seed++, 'cat'); const w2 = STOMP.arson.win[2](g), w = txt('arson_won', g); const sent = 'You came by night to burn a widow\'s house. Your ancestors will hear of it from me.';
          assert(w2 !== w && w2.includes(sent) && w.includes(sent) && STOMP.arson.win[3](g).includes(sent), 'P3A (ST): the arson\'s wins keep the mother\'s sentence, and degree 2 is its own text'); }
        // LB and the continuity fixes
        const lab = (id) => SCENES[id].choices.map((c) => c.text);
        assert(lab('ashfall').includes('Drill the village hunters. They\'ll be standing next to you at the post.') && lab('workshop').includes('Spearheads for the hunters. They\'ll need them when the collectors come.') && lab('arson_start')[0] === 'Then it\'s the hard way.', 'P3A (LB): the three labels');
        assert(FORMS.every(([form]) => !/tomorrow/i.test(txt('mei_walk', F(seed++, form, 2)))), 'P3A (rider 1): the Day 5 walk says no "tomorrow"');
        assert(!/older than Old Wen/.test(txt('drill', F(seed++, 'cat'))), 'P3A (rider 2): no hunter older than Old Wen');
        // RV1 (Fable's review): TG4 every Ashfall scene in every form under each flag set; TG3 the listed tics nowhere in those texts, the
        // choices' results or the stomp texts; TG5 a success twice on one day, a failure first, a save with no day record; TG6 the stomp facts;
        // TG8 the clinic's second-day lines name no first-day patient, and supper's form paragraph follows both openings
        const TICS = /four hundred pounds of cat|a bone needle|a long moment|for a moment|the way a\b|something like|a long time/i;
        const FLAGSETS = [{}, { ignored: true, mei_bruised: true }, { loft_burned: true }, { gao_broken: true }, { gao_spared: true }, { night5_done: true }, { militia: 1 }, { far_kind: 'bull' }, { far_kind: 'deer' }, { far_kind: 'wolves' }, { lore_realms: true }, { lore_realms: true, lore_tree: true }];
        let rendered = 0;
        for (const id of Object.keys(ASHFALL)) for (const flags of FLAGSETS) for (const vday of [1, 2, 3]) for (const [form] of FORMS) for (const d of [0, 1]) {
            const g = F(seed++, form, vday); Object.assign(g.flags, flags); if (!g.flags.far_kind) g.flags.far_kind = 'wolves'; onDay(g, d); g.scene = id;
            let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
            if (bad(t) || TICS.test(t)) { assert(false, `P3A (RV1, TG4/TG3): ${id} as ${form}, day ${vday}, ${JSON.stringify(flags)}, text day ${d + 1} (${String(t).slice(0, 90)})`); continue; }
            rendered++;
            for (const c of SCENES[id].choices || []) {
                for (const fn of [c.do, c.failDo]) {
                    if (typeof fn !== 'function') continue;
                    const h = F(seed++, form, vday); Object.assign(h.flags, g.flags); onDay(h, d); h.scene = id; h.inventory.jade_bracket = 2; h.inventory.ghost_gill = 1; h.james.qi = 99; let out;
                    try { out = (fn(h, { success: fn === c.do, ratio: fn === c.do ? 1 : 0.2 }) || []).filter((x) => typeof x === 'string'); } catch (e) { out = [`THREW ${e.message}`]; }
                    if (out.some((x) => bad(x) || TICS.test(x))) assert(false, `P3A (RV1, TG3): ${id} "${String(c.text).slice(0, 30)}" as ${form}: ${out.join(' | ').slice(0, 120)}`);
                }
            }
        }
        assert(rendered === Object.keys(ASHFALL).length * FLAGSETS.length * 3 * 3 * 2, `P3A (RV1, TG4): every Ashfall scene rendered (${rendered})`);
        for (const id of ['wolves', 'thornback', 'arson']) for (const [form] of FORMS) {
            const g = F(seed++, form); const S = STOMP[id]; const all = [1, 2, 3].map((d) => S.posture(g, d)).concat([S.win[2](g), S.win[3](g), S.one(g)]);
            assert(!all.some((t) => TICS.test(t)), `P3A (RV1, TG3): ${id}'s stomp texts as ${form} without the listed tics`);
        }
        // TG5
        {
            const g = F(seed++, 'cat'); g.scene = 'workshop'; const c = SCENES.workshop.choices[0];
            delete g.lines; ensureBars(g);
            const f1 = c.failDo(g)[0]; const s1 = c.do(g)[0]; const s2 = c.do(g)[0];
            assert(s1 === DAY_REPLIES['workshop:0'][0] && s2 === s1 && !DAY_REPLIES['workshop:0'].includes(f1), `P3A (RV1, TG5): a failure, then two successes on one day: the first text twice (${s1} | ${s2})`);
            g.minutes += 1440; g.flags.vday = 3; /* v0.11.170 (RV1, P3D): by the village day */ const s3 = c.do(g)[0];
            assert(s3 === DAY_REPLIES['workshop:0'][1], `P3A (RV1, TG5): the next day the second text (${s3})`);
            const h = F(seed++, 'cat'); delete h.lines; const r = deserialize(serialize(h)); r.scene = 'workshop';
            assert(SCENES.workshop.choices[0].do(r)[0] === DAY_REPLIES['workshop:0'][0], 'P3A (RV1, TG5): a save with no day record starts from the first text');
        }
        // TG6
        {
            const g = F(seed++, 'tiger'); const W = STOMP.wolves, T = STOMP.thornback, A = STOMP.arson;
            assert([T.win[2](g), T.win[3](g)].every((t) => /eggs/.test(t)) && [W.win[2](g), W.win[3](g), T.win[2](g), T.win[3](g)].every((t) => /\bbow/.test(t)), 'P3A (RV1, TG6): the thornback\'s eggs in both wins; the hunters\' bows in every win');
            assert(/the wolf first/.test(W.win[3](g)) && [A.win[2](g), A.win[3](g)].every((t) => /Ashfall decides you are theirs\.$/.test(t)) && /Elder Brother Gao will hear/.test(A.win[3](g)), 'P3A (RV1, TG6): one wolf home; the arson ends on Ashfall\'s decision; Pock-Face\'s threat');
            assert(new Set([W.one(g), T.one(g), A.one(g)].map((t) => t.split(/\s+/).slice(0, 3).join(' '))).size === 3, 'P3A (RV1, TG6, L5): the three one-move lines open differently');
        }
        // TG8
        assert(['clinic:0', 'clinic:1'].every((k) => !/purple|burn|first day/i.test(DAY_REPLIES[k][1])), 'P3A (RV1, TG8, M2): the clinic\'s second-day lines name no patient of the queue');
        for (const [form] of FORMS) {
            const a = F(seed++, form, 1), b = F(seed++, form, 1); b.flags.ignored = true;
            const pa = txt('supper', a).split('\n\n').slice(1).join('\n\n'), pb = txt('supper', b).split('\n\n').slice(1).join('\n\n');
            assert(pa === pb && /Three days/.test(pa) && !/lower than she did to you/.test(pa), `P3A (RV1, TG8, M1): supper's form paragraph the same after both openings as ${form}`);
        }
    }
    // v0.11.170 (owner picks NX2, CA1; Fable's rewrite of part 4, the Fallout): SR the hub's repeatable cards speak by day (Days 8–10)
    // and the council has a Day 10 text; YF every Yuki text in every form; CW the six lines on who he is; ST the three fights' stomp
    // texts; LB five labels; the continuity fixes; every Fallout scene rendered in every form and day under each flag set
    {
        const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
        const F = (seed, form, d = 9, flags = {}) => { const g = ensureBars(fresh(seed)); const r = { cat: 0, tiger: 2, human: 7 }[form]; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.minutes = (d - 1) * 1440 + 12 * 60; Object.assign(g.flags, { ending: 'fought' }, flags); return ensureBars(g); };
        const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b/.test(t);
        const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
        const SRC = readFileSync(new URL('../js/story/act1_fallout.js', import.meta.url), 'utf8');
        let seed = 7700;
        // SR: three texts a list (Days 8, 9, 10), different, short, in every form; the card's day shows its text, the gains the same each day
        const SR = { 'fo_palisade:0': ['fo_palisade', 0, 'do'], 'fo_palisade:1': ['fo_palisade', 1, 'do'], 'fo_palisade:1:f': ['fo_palisade', 1, 'failDo'], 'fo_council:0': ['fo_council', 0, 'do'], 'fo_council:1': ['fo_council', 1, 'do'], 'fo_drill:0': ['fo_drill', 0, 'do'], 'fo_drill:0:f': ['fo_drill', 0, 'failDo'], 'fo_drill:1': ['fo_drill', 1, 'do'], 'fo_clinic:0': ['fo_clinic', 0, 'do'], 'fo_clinic:1': ['fo_clinic', 1, 'do'], 'fo_clinic:1:f': ['fo_clinic', 1, 'failDo'] };
        for (const [k, [scene, i, fn]] of Object.entries(SR)) {
            assert(DAY_REPLIES[k]?.length === 3, `NX2 (SR): ${k} has three texts`);
            for (const [form] of FORMS) {
                const L = DAY_REPLIES[k].map((t) => (typeof t === 'function' ? t(F(seed++, form)) : t));
                assert(L.every((t) => !bad(t) && t.split(/\s+/).length >= 5 && t.split(/\s+/).length <= 45) && new Set(L).size === 3, `NX2 (SR): ${k} (${form}): three different short texts (${L.join(' | ')})`);
                const runs = [0, 1, 2].map((d) => { const g = fn === 'do' ? F(7790, form, 8 + d) : F(7790, form); g.scene = scene; g.inventory.jade_bracket = 3; g.james.qi = 99; onDay(g, fn === 'do' ? 0 : d); /* v0.11.170 (RV1, SD): a success by the story's day, a failure by the count of days */ const out = SCENES[scene].choices[i][fn](g, { success: fn === 'do', ratio: fn === 'do' ? 1 : 0.2 }); const fl = { ...g.flags }; for (const f of Object.keys(fl)) if (/^council\d+$/.test(f)) delete fl[f]; return { out, rel: JSON.stringify(g.rel), flags: JSON.stringify(fl), inv: JSON.stringify(g.inventory), hp: g.james.hp }; });
                assert(runs.every((r, d) => r.out[0].endsWith(L[d]) && (scene !== 'fo_palisade' || fn === 'failDo' || /^Palisade: \d\/3 stretches\. /.test(r.out[0]))), `NX2 (SR): ${k} (${form}): days 1–3 show their texts (${runs.map((r) => r.out[0]).join(' | ')})`);
                assert(runs.every((r) => r.rel === runs[0].rel && r.flags === runs[0].flags && r.inv === runs[0].inv && r.hp === runs[0].hp), `NX2 (SR): ${k} (${form}): the same gains every day`);
            }
        }
        { // the council: its own text on each day; Day 10 leads to Day 9's choices
            const t = FORMS.map(([f]) => [8, 9, 10].map((d) => txt('fo_council', F(seed++, f, d))));
            assert(t.every((r) => r.every((x) => !bad(x)) && new Set(r).size === 3 && !/Second council/.test(r[2])), 'NX2 (SR): the council reads differently on Days 8, 9 and 10');
            const labs = (d) => JSON.stringify(SCENES.fo_council.choices.map((c) => (typeof c.text === 'function' ? c.text(F(seed++, 'cat', d)) : c.text)));
            assert(labs(10) === labs(9) && labs(9) !== labs(8), 'NX2 (SR): Day 10 offers Day 9\'s choices');
        }
        // YF: the three texts written for the cat only now read by form; Old Wen and Old Hu name the great root-kin as such
        for (const [id, d, flags] of [['fo_supper', 8, {}], ['fo_wolf', 8, {}], ['fo_ya_night', 10, { ya_met: true }]]) {
            const v = FORMS.map(([form]) => txt(id, F(seed++, form, d, flags)));
            assert(v.every((t) => !bad(t) && t.length > 40) && new Set(v).size === 3, `NX2 (YF): ${id} reads differently in each form`);
        }
        assert(/"Your great beast," Old Wen says/.test(txt('fo_council', F(seed++, 'tiger', 9))), 'NX2 (YF): Old Wen names the great root-kin as such');
        assert(DAY_REPLIES['fo_drill:1'].every((t) => !/bows to the cat/.test(t(F(seed++, 'tiger')))), 'NX2 (YF): Old Hu never bows to the great root-kin as "the cat"');
        // CW: the six lines (the owner 23:15), generic music only (no artist, title or lyric in the Fallout)
        for (const [where, frag] of [['fo_supper', 'whoever salted her pot'], ['fo_mother', 'that the best of your bowl ends in hers'], ['fo_farewell', 'decided is a hymn'], ['ya_talk', 'the best of the meat before you ate'], ['fo_mei', 'a man watching a child cross a river'], ['DR_FO_BOY', 'a boiled egg appears at your elbow']]) assert(SRC.includes(frag), `NX2 (CW): ${where}: "${frag}"`);
        assert(!/Sabbath|Maiden|Purple|Gojira|Disturbed|Lacuna|Birthday Massacre|Ashbury|The Cure|Nitzer|VNV|Depeche|Saor|Alcest|Hololive|Gura|Mumei|Calliope|Nerissa|Ironmouse|Nyanners|Athelstan|Neuro|Rachie|Miracle of Sound|Eivør|Trøllabundin|Clamavi|Dúrin|Hammerdeep/i.test(SRC), 'NX2 (CW): no artist or song named in the Fallout (CM and the editions are open)');
        // ST: the stomp texts of the three fights, every degree and form, with the facts kept
        for (const id of ['sect_watcher', 'palisade_wolf', 'ya_brawl']) for (const [form] of FORMS) {
            const g = F(seed++, form); const S = STOMP[id];
            const all = [1, 2, 3].map((d) => S.posture(g, d)).concat([S.win[2](g), S.win[3](g), S.one(g)]);
            assert(all.every((t) => !bad(t) && t.length > 20 && !/a bone needle/.test(t)), `NX2 (ST): ${id}'s stomp texts render as ${form}`); // "four hundred pounds" only from yuShort (stomp_act1.js; other fights share it)
        }
        { const g = F(seed++, 'cat'); const W = STOMP.sect_watcher, P = STOMP.palisade_wolf, Y = STOMP.ya_brawl;
          assert([W.win[2](g), W.win[3](g)].every((t) => /ledger/i.test(t) && /\bbow/.test(t)) && [1, 2, 3].every((d) => !/gap in the stakes/.test(P.posture(g, d)) && !/No Qi/.test(Y.posture(g, d))), 'NX2 (ST): the watcher\'s ledger and bow; no stakes on the wolves\' night; Ya smells, she doesn\'t sense Qi'); }
        // LB and the continuity fixes
        const lab = (id, g = F(seed++, 'cat', 10)) => SCENES[id].choices.map((c) => (typeof c.text === 'function' ? c.text(g) : c.text));
        assert(lab('fo_ashfall').includes('Somebody has been watching Ashfall from the ridge. Go and see.') && lab('fo_clinic')[1] === 'Treat the youngest first, and take the old woman\'s disapproval.' && lab('fo_wolf')[0] === 'Go down and meet them in the field.' && lab('fo_wolf_forced')[0] === 'Then it\'s the hard way.' && lab('fo_ya_time')[0] === '"Thank you. I mean that."', 'NX2 (LB): the five labels');
        assert(SRC.includes('Thirteen days, where we had a year') && !/gap in the stakes/.test(SRC) && !/Ten days sooner/.test(SRC), 'NX2 (continuity): Old Hu\'s count; no stakes on the wolves\' night');
        // every Fallout scene in every form, on Days 8–10, under each flag set; the choices' results too
        const TICS = /four hundred pounds|a bone needle/i;
        const FLAGSETS = [{}, { ending: 'bluff' }, { ending: 'paid' }, { ending: 'lost' }, { ya_met: true }, { ya_met: true, ya_party: true }, { romance: true }, { loft_burned: true }, { palisade: 1 }, { palisade: 3, militia: 2 }, { sky_witness: true, gao_broken: true }, { gao_turned: true, spy: true }];
        let rendered = 0;
        for (const id of Object.keys(FALLOUT)) for (const flags of FLAGSETS) for (const d of [8, 9, 10]) for (const [form] of FORMS) {
            const g = F(seed++, form, d, flags); g.scene = id;
            let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
            if (bad(t) || TICS.test(t)) { assert(false, `NX2 (render): ${id} as ${form}, Day ${d}, ${JSON.stringify(flags)} (${String(t).slice(0, 90)})`); continue; }
            rendered++;
            for (const c of SCENES[id].choices || []) for (const fn of [c.do, c.failDo]) {
                if (typeof fn !== 'function') continue;
                const h = F(seed++, form, d, flags); h.scene = id; h.inventory.jade_bracket = 2; h.james.qi = 99; let out;
                try { out = (fn(h, { success: fn === c.do, ratio: fn === c.do ? 1 : 0.2 }) || []).filter((x) => typeof x === 'string'); } catch (e) { out = [`THREW ${e.message}`]; }
                if (out.some((x) => bad(x) || TICS.test(x))) assert(false, `NX2 (render): ${id} "${String(typeof c.text === 'function' ? c.text(h) : c.text).slice(0, 30)}" as ${form}: ${out.join(' | ').slice(0, 120)}`);
            }
        }
        assert(rendered === Object.keys(FALLOUT).length * FLAGSETS.length * 3 * 3, `NX2 (render): every Fallout scene rendered (${rendered})`);
        // RV1 (TG1, Fable's review M1): through the engine (runTask), a real game on each day. A success closes its card for the Coil
        // (ONCE_MENUS), so the successes go by the story's day: each day's first success shows that day's text, and the card is gone the
        // next day; a failure leaves the card open, and the failures go by the count of days (Days 8, 9, 10: the first, second, third)
        const mkG = (seed, hub, d, strong, flags = {}) => { const g = F(seed, 'cat', d, flags); g.scene = hub; g.minutes = (d - 1) * 1440 + 8 * 60; const sk = () => (strong ? { tier: 4, level: 10, xp: 0 } : { tier: 1, level: 1, xp: 0 }); g.james.gu = sk(); g.james.skills['Convergence Use'] = sk(); g.james.qi = 99; g.james.hp = 40; g.inventory.jade_bracket = 3; return ensureBars(g); };
        const openCard = (g, id) => taskCards(g, SCENES).some((c) => c.id === id && c.status === 'open');
        const said = (g, id, w) => { const r = splitReply(runTask(g, SCENES, id).lines); return r.reply.concat(r.gains).some((x) => x.includes(w)); };
        const pickT = (t, g) => (typeof t === 'function' ? t(g) : t);
        let flowed = 0;
        for (const [k, [scene, i, fn]] of Object.entries(SR)) {
            const id = `${scene}:${i}`;
            if (fn === 'do') for (const d of [8, 9, 10]) {
                const g = mkG(7900 + d, 'fo_ashfall', d, true);
                if (!openCard(g, id)) { assert(false, `NX2 (RV1, TG1): ${id} open on Day ${d}`); continue; }
                const w = pickT(DAY_REPLIES[k][d - 8], g);
                assert(said(g, id, w), `NX2 (RV1, TG1): ${id} on Day ${d} shows that day's text (${w})`);
                g.minutes += 1440; g.scene = 'fo_ashfall';
                assert(!openCard(g, id), `NX2 (RV1, TG1): ${id} closed for the Coil after a success`);
                flowed++;
            } else {
                const g = mkG(7950, 'fo_ashfall', 8, false);
                for (const d of [8, 9, 10]) {
                    if (d > 8) { g.minutes = (d - 1) * 1440 + 8 * 60; g.scene = 'fo_ashfall'; }
                    const c = SCENES[scene].choices[i];
                    assert(openCard(g, id) && ['fail', 'partial'].includes(cardCheck(g, id, c).band), `NX2 (RV1, TG1): ${id} open and failing on Day ${d}`); // a partial with nothing in hand runs the failure (the XP of the failures before it can lift a fail to a partial)
                    assert(said(g, id, pickT(DAY_REPLIES[k][d - 8], g)), `NX2 (RV1, TG1): ${id} failed on its ${d - 7}. day shows text ${d - 7}`);
                    g.scene = 'fo_ashfall'; flowed++;
                }
            }
        }
        // RV1 (P3D): the prologue Ashfall's five the same way, by the village day (Day 5: the first text; Day 6: the second)
        for (const [k, id] of [['clinic:0', 'clinic:0'], ['clinic:1', 'clinic:1'], ['workshop:0', 'workshop:0'], ['drill:0', 'drill:0'], ['drill:1', 'drill:1']]) for (const vd of [2, 3]) {
            const g = mkG(7980 + vd, 'ashfall', 3 + vd, true, { long: true, vday: vd, healed_try: true }); if (k === 'clinic:1') delete g.inventory.jade_bracket;
            if (!openCard(g, id)) { assert(false, `P3A (RV1, P3D): ${id} open on village day ${vd} (${taskCards(g, SCENES).map((c) => `${c.id}:${c.status}`).join(' ')})`); continue; }
            assert(said(g, id, pickT(DAY_REPLIES[k][vd - 2], g)), `P3A (RV1, P3D): ${id} on Day ${3 + vd} shows its day's text`);
            g.minutes += 1440; g.flags.vday = vd + 1; g.scene = 'ashfall';
            assert(!openCard(g, id), `P3A (RV1, P3D): ${id} closed for the Coil after a success`);
            flowed++;
        }
        assert(flowed === 8 * 3 + 3 * 3 + 5 * 2, `NX2 (RV1, TG1): every card played (${flowed})`);
        // RV1 (TG3): the relationship branches render, and the last night reads four ways over the romance and the two affections
        {
            const RELS = [[0, 0], [60, 0], [0, 90], [60, 90]]; const last = new Set();
            for (const romance of [false, true]) for (const [a, b] of RELS) for (const [form] of FORMS) for (const id of ['fo_last_night', 'fo_ya_night', 'fo_mei_night', 'fo_mei_insists', 'ya_share', 'fo_farewell']) {
                const g = F(seed++, form, 10, { romance, ya_met: true, ya_party: true, fo_pick: b ? 'ya' : undefined }); g.minutes = 9 * 1440 + 22 * 60; g.rel['Mei Lin'] = { f: 50, a }; g.rel.Ya = { f: 50, a: b };
                let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
                assert(!bad(t), `NX2 (RV1, TG3): ${id} as ${form}, romance ${romance}, Mei Lin ${a}, Ya ${b}`);
                if (id === 'fo_last_night' && form === 'cat') last.add(t);
            }
            assert(last.size === 4, `NX2 (RV1, TG3): the last night reads four ways over the two affections (${last.size})`);
        }
        // RV1 (TG4, TG5): the night hours (01:00, 21:00) render; the calendar words follow the day
        for (const id of ['fo_wolf', 'fo_wolf_won', 'fo_wolf_forced', 'fo_wolf_lost', 'fo_night', 'fo_morning', 'fo_last_night']) for (const [form] of FORMS) for (const [d, h] of [[8, 21], [9, 1], [9, 21], [10, 1]]) {
            const g = F(seed++, form, d, { romance: true }); g.minutes = (d - 1) * 1440 + h * 60; let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
            assert(!bad(t), `NX2 (RV1, TG4): ${id} as ${form} on Day ${d} at ${h}:00`);
        }
        const at = (id, d, h, flags = {}) => { const g = F(seed++, 'cat', d, flags); g.minutes = (d - 1) * 1440 + h * 60; return txt(id, g); };
        assert(/There is no palisade yet/.test(at('fo_night', 8, 21, { palisade: 0 })) && /Thirteen/.test(at('fo_night', 8, 21, { romance: true })) && /Twelve/.test(at('fo_night', 9, 21, { romance: true })), 'NX2 (RV1, TG4/TG5): the loft at night: no palisade on Day 8; thirteen, then twelve');
        assert(/Twelve days to the Elder/.test(at('fo_morning', 9, 7)) && /eleven days/i.test(at('fo_council', 10, 12)) && /Ten days to the Elder/.test(at('fo_depart', 11, 6)) && /Five days in, maybe six/.test(at('fo_price', 10, 12, { ya_met: true })) && !/Tomorrow I take you to the tree/.test(SRC), 'NX2 (RV1, TG5): the calendar words by day');
        // RV1 (TG6, M3): each of the six lines once; the mother's names no supper that hasn't happened on Day 8
        for (const frag of ['whoever salted her pot', 'that the best of your bowl ends in hers', 'decided is a hymn', 'the best of the meat before you ate', 'a man watching a child cross a river', 'a boiled egg appears at your elbow']) assert(SRC.split(frag).length === 2, `NX2 (RV1, TG6): "${frag}" once`);
        assert(!/drawing on my table/.test(at('fo_mother', 8, 9)), 'NX2 (RV1, M3): the mother\'s line true from Day 8\'s morning');
        // RV1 (TG7): the stomp wins keep their scenes' facts
        for (const [form] of FORMS) {
            const g = F(seed++, form); const W = STOMP.sect_watcher, P = STOMP.palisade_wolf, Y = STOMP.ya_brawl;
            assert([W.win[2](g), W.win[3](g)].every((t) => ['north road', 'morning', 'twelve disciples', 'herb-girl who laughs', 'wolf\'s skull', 'hilt'].every((x) => t.includes(x))), `NX2 (RV1, TG7): the watcher's wins keep the ledger's facts (${form})`);
            assert([P.win[2](g), P.win[3](g)].every((t) => ['skulls', 'chalk line', 'Old Hu'].every((x) => t.includes(x))) && P.win[2](g).includes('skinned') && (form !== 'tiger' || P.win[3](g).includes('large, white and in no doubt')), `NX2 (RV1, TG7): the wolves' wins keep the skulls, the chalk line and Old Hu; Yuki by form (${form})`);
            assert([1, 2, 3].every((d) => /coat/.test(Y.posture(g, d)) && /salt/.test(Y.posture(g, d))), `NX2 (RV1, TG7): Ya goes by smell: the coat and the salt (${form})`);
        }
        // RV1 (TG8, M4, PF): the farewell's palisade at 0–3 stretches
        assert([0, 1].every((p) => /more chalk than stakes/.test(at('fo_farewell', 10, 19, { palisade: p }))) && [2, 3].every((p) => { const t = at('fo_farewell', 10, 19, { palisade: p }); return /two thirds/.test(t) && !/to finish it/.test(t); }), 'NX2 (RV1, TG8): the farewell\'s palisade reads true at every count');
    }
    // RV2 (M1, Fable's review): Ya names the ship on her ledge only once it has been found
    {
        const y = ensureBars(fresh(5304)); onDay(y, 1); const t0 = SCENES.heart_camp.choices[2].do(y)[0];
        y.flags.ship_found = true; const t1 = SCENES.heart_camp.choices[2].do(y)[0];
        assert(!/the ship/.test(t0) && /water somewhere under the roots/.test(t0) && /bark settling, the ship,/.test(t1), 'NC1 (RV2, M1): the ledge names the ship only after ship_found');
    }
    // v0.11.172 (owner picks P5A, CA1; Fable's rewrite of part 5, the Blackroot): KO Ya's "Knock it off" by Coil (three sets of five);
    // CW the cooking replies by day and the six lines on who he is; SW the Practice drills' successes by day; CL the calendar and Ya's
    // tracks; LB three labels; YF the cat-only texts; ST the ten fights' stomp texts; every Blackroot scene in every form and region
    {
        const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
        const B = (seed, form, region = 'rr', bday = 1, flags = {}) => { const g = ensureBars(fresh(seed)); const r = { cat: 0, tiger: 2, human: 7 }[form]; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.minutes = (9 + bday) * 1440 + 12 * 60; Object.assign(g.flags, { bl_region: region, bl_day: bday }, flags); return ensureBars(g); };
        const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b/.test(t);
        const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
        const SRC = readFileSync(new URL('../js/story/act1_blackroot.js', import.meta.url), 'utf8');
        const words = (t) => t.split(/\s+/).length;
        let seed = 7900;
        // KO: three sets of five, all fifteen different, replies only; the act's Coil picks the set, the day the text; −2 / −2 to Ya every time
        const KO = COIL_SETS['talk_ya:3'];
        assert(KO?.length === 3 && KO.every((s) => s.length === 5) && new Set(KO.flat()).size === 15 && DAY_REPLIES['talk_ya:3'].length === 15, 'P5A (KO): "Knock it off" has three sets of five, all different');
        assert(KO.flat().every((t) => !bad(t) && words(t) >= 8 && words(t) <= 45 && splitLine(t).gain === '' && splitLine(t).reply === t), 'P5A (KO): each a reply only, 8–45 words');
        const ko = SCENES.talk_ya.choices.find((c) => c.text === '"Ya. Knock it off."');
        for (const coil of [0, 1, 2, 3]) for (const day of [0, 1, 4]) {
            const g = B(seed++, 'cat'); g.scene = 'talk_ya'; g.coil.act = 1; g.stats.coils0 = 2; g.coil.n = 2 + coil; onDay(g, day);
            g.rel = { ...g.rel, Ya: { f: 40, a: 40 } }; const before = { ...rel(g, 'Ya') }; const r = splitReply(ko.do(g)).reply.join(' '); const after = { ...rel(g, 'Ya') };
            assert(r === KO[coil % 3][day] && after.f === before.f - 2 && after.a === before.a - 2, `P5A (KO): the act's Coil ${coil + 1}, day ${day + 1}: set ${(coil % 3) + 1}, text ${day + 1}, −2 / −2 (${r.slice(0, 30)})`);
        }
        // CW: "Cook and eat." says the satiety line, then the day's reply (five, in every form); the six throwaway lines; no artist or song
        const cook = SCENES.bl_camp.choices.find((c) => c.text === 'Cook and eat.');
        assert(DAY_REPLIES['bl_camp:0']?.length === 4, 'P5A (CW; RV1 M1): four cooking replies, one a camp (Days 11–14)');
        for (const [form] of FORMS) {
            const L = DAY_REPLIES['bl_camp:0'].map((t) => (typeof t === 'function' ? t(B(seed++, form)) : t));
            assert(L.every((t) => !bad(t) && words(t) >= 10 && words(t) <= 45 && splitLine(t).gain === '' && splitLine(t).reply === t) && new Set(L).size === 4, `P5A (CW): the cooking replies as ${form}: four different, 10–45 words, replies only (RV1, TG6)`);
            for (const day of [0, 1, 2, 3]) {
                const g = B(seed++, form, 'ah', 4); g.scene = 'bl_camp'; g.inventory.venison = 2; g.james.satiety = 40; onDay(g, day);
                const out = cook.do(g);
                const sp = splitReply(out);
                assert(out.length === 2 && /^You eat: .*, cooked\. \+\d+ satiety\.$/.test(out[0]) && out[1] === L[day] && sp.gains.length === 1 && sp.reply.length === 1, `P5A (CW): cooking as ${form}, day ${day + 1}: the satiety line, then its reply (${String(out[1]).slice(0, 30)})`);
            }
        }
        { const g = B(seed++, 'cat'); g.scene = 'bl_camp'; assert(cook.do(g).length === 0, 'P5A (CW): nothing to cook, nothing said'); }
        { const g = B(seed++, 'cat'); g.scene = 'bl_camp'; g.inventory.honeycomb = 1; const out = cook.do(g); assert(out.length === 1 && /honeycomb/.test(out[0]) && !/cooked/.test(out[0]), `P5A (RV1, L4): food that isn't cooked gets no word from the others (${out.join(' | ')})`); }
        assert(new Set(['cat', 'tiger', 'human'].map((f) => DAY_REPLIES['bl_camp:0'][2](B(seed++, f)))).size === 3, 'P5A (CW, YF): the third cooking reply has Yuki in her own form');
        for (const frag of ['You fed the cat first, so: not Sect', 'cook twice as much for them', 'You put her on when one of us is cold', 'you gave the best piece away, which', 'you hum when you cook', 'kept the last of the meat warm for whoever came off watch']) assert(SRC.includes(frag), `P5A (CW): the line "${frag}"`);
        const CWL = ['You fed the cat first', 'cook twice as much for them', 'You put her on when one of us is cold', 'you gave the best piece away', 'you hum when you cook', 'kept the last of the meat warm'];
        assert(CWL.every((f) => SRC.split(f).length === 2) && (SRC.match(/your arm (?:plays|is playing)|Your arm is playing/gi) || []).length === 1 && !/only put that one on for people you like|best piece away again/.test(SRC), 'P5A (RV1, L10, L13, TG6): the six CW lines once each, one music line, no "again" on the first night');
        assert(!/\b(?:Sabbath|Maiden|Purple|Gojira|Disturbed|Lacuna|Birthday Massacre|Ashbury|The Cure|Nitzer|VNV|Depeche|Saor|Alcest|Hololive|Gura|Mumei|Calliope|Nerissa|Ironmouse|Nyanners|Athelstan|Neuro|Rachie|Miracle of Sound|Eivør|Trøllabundin|Clamavi|Dúrin|Hammerdeep)\b/.test(SRC), 'P5A (CW): no artist or song named in the Blackroot');
        // SW: the darts' and the needles' successes say a line by day (five each, different); their failures stay silent
        for (const [i, key, label] of [[1, 'bl_train:1', 'Darts at a mark, from farther and farther.'], [2, 'bl_train:2', 'Needle drills, slow and exact.']]) {
            const c = SCENES.bl_train.choices[i]; const L = DAY_REPLIES[key];
            assert(c.text === label && L?.length === 5 && new Set(L).size === 5 && L.every((t) => !bad(t) && words(t) >= 8 && words(t) <= 35), `P5A (SW): ${key}: five different lines (${label})`);
            for (const day of [0, 1, 4]) { const g = B(seed++, 'cat'); g.scene = 'bl_train'; onDay(g, day); const out = c.do(g); assert(out.length === 1 && out[0] === L[day], `P5A (SW): ${key} day ${day + 1} says its line`); }
            { const g = B(seed++, 'cat'); g.scene = 'bl_train'; const out = c.failDo(g); assert(out.length === 1 && out[0] === DAY_REPLIES[`${key}:f`]?.[0], `P5A (SW) → D1 (b1): ${key}'s failure says its first line (it was silent)`); }
        }
        // CL and LB: five days, not three or four; Ya's tracks ten days back; the three labels
        { const g = B(seed++, 'cat'); g.scene = 'bl_start'; const t = txt('bl_start', g); assert(/Five days in/.test(t) && !/Three days in|four-day/.test(SRC), 'P5A (CL): the expedition is five days (bl_start, the label)'); }
        { const g = B(seed++, 'cat'); g.scene = 'rr_scout'; const t = txt('rr_scout', g); assert(/Ten days back, before the village/.test(t) && !/Three days ago/.test(t) && /three nights/i.test(t), 'P5A (CL; v0.11.179 H1): Ya smelled his stream camp ten days back, and followed him three nights'); }
        // RV1 (M2, TG2): the menu's text is never drawn on a task screen, so the fix and the CW line are in the card's reply, which is
        { const g = B(seed++, 'cat', 'rr', 1); g.scene = 'rr_hub'; const r = runTask(g, SCENES, 'rr_scout:1'); const j = r.lines.join(' '); assert(g.scene === 'rr_hub' && /Ten days back\. Your first camp, by the stream/.test(j) && /You fed the cat first, so: not Sect/.test(j), `P5A (RV1, M2): "You followed me for three nights?" says ten days back and the cat fed first, on the hub (${j.slice(0, 80)})`); }
        { const g = B(seed++, 'cat', 'rr', 1); g.scene = 'rr_hub'; g.james.gu = { tier: 4, level: 10, xp: 0 }; const r = runTask(g, SCENES, 'rr_scout:0'); assert(/Eyes lie\. Ears lie\. Nose doesn't/.test(r.lines.join(' ')), 'P5A (RV1, M2): the lesson\'s first words in its success line'); }
        const labs = (id) => SCENES[id].choices.map((c) => c.text);
        assert(labs('ya_mocks').includes('Defuse it. "We have a five-day walk and no doctor. Pick a fight with the forest."') && labs('bl_train').includes('Darts at a mark, from farther and farther.') && labs('bl_night').includes('Mei Lin and Ya together; you and a watch-thread after.'), 'P5A (LB): the three labels');
        assert(!/finish what the darts began|Your darts have one of its eyes/.test(SRC) && !/The day after tomorrow you walk inside/.test(SRC), 'P5A (DG, CL): the ape lure needs no darts; the Ashen Hills fireside is true on both nights');
        // YF: the cat-only texts read in every form (the wolves see Yuki; no laugh "of a cat"; the spring; the serpent's "Your cat")
        assert(!/They have seen the cat|sound of a cat laughing|Nobody here but trees and the cat/.test(SRC) && !/"Your cat," Ya says/.test(readFileSync(new URL('../js/story/stomp_act1.js', import.meta.url), 'utf8')), 'P5A (YF): no cat-only text without a switch');
        // ST: the ten fights' stomp texts in every degree and form
        for (const id of ['bone_elk', 'root_wyrm', 'mire_serpent', 'drowned', 'cinder_hawks', 'rot_ape', 'night_wolves', 'night_drowned', 'night_serpent', 'night_hawks']) for (const [form] of FORMS) {
            const g = B(seed++, form, id.includes('hawks') || id === 'rot_ape' ? 'ah' : id.includes('drowned') || id.includes('serpent') ? 'dw' : 'rr'); const S = STOMP[id];
            const all = [1, 2, 3].map((d) => S.posture(g, d)).concat([S.win[2](g), S.win[3](g), S.one(g)]);
            assert(all.every((t) => !bad(t) && t.length > 20 && !/a bone needle/.test(t)) && new Set([1, 2, 3].map((d) => S.posture(g, d))).size === 3, `P5A (ST): ${id}'s stomp texts render as ${form}`);
        }
        { const g = B(seed++, 'cat', 'rr'); assert(!/mother's spear/.test(STOMP.root_wyrm.posture(g, 1)) && /Fifteen years/.test(STOMP.rot_ape.win[2](g) + STOMP.rot_ape.win[3](g)), 'P5A (FX): the wyrm never had her mother\'s spear; the ape: fifteen years'); }
        // every Blackroot scene in every form, region and expedition day, under each flag set; the choices' results too
        const TICS = /\bundefined\b/; // (the tics are the text lint's to count, log only)
        const FLAGSETS = [{}, { ya_party: true, mei_party: true }, { romance: true }, { ya_romance: true }, { mei_bond: true }, { saw_lights: true }, { bl_tracker: true }, { trio: 3 }, { bl_ev: 'wolves' }, { bl_ev: 'drowned' }, { bl_ev: 'hawks' }, { bl_ev: 'serpent' }, ...['song', 'lights', 'rut', 'warm', 'rain', 'stars', 'mei'].map((e) => ({ bl_ev: e, saw_lights: e === 'lights' }))];
        let rendered = 0;
        for (const id of Object.keys(BLACKROOT)) for (const flags of FLAGSETS) for (const [region, bday] of [['rr', 1], ['rr', 2], ['dw', 3], ['ah', 4], ['ah', 5]]) for (const [form] of FORMS) {
            if (id === 'bl_night_event' && !flags.bl_ev) { rendered++; continue; } // a seeded event: rendered under its four bl_ev flag sets (and 'song', 'rain', … below)
            const g = B(seed++, form, region, bday, flags); g.scene = id;
            let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
            if (bad(t) || TICS.test(t)) { assert(false, `P5A (render): ${id} as ${form}, ${region} day ${bday}, ${JSON.stringify(flags)} (${String(t).slice(0, 90)})`); continue; }
            rendered++;
            for (const c of SCENES[id].choices || []) for (const fn of [c.do, c.failDo]) {
                if (typeof fn !== 'function') continue;
                const h = B(seed++, form, region, bday, flags); h.scene = id; h.inventory.venison = 2; h.james.qi = 99; let out;
                try { out = (fn(h, { success: fn === c.do, ratio: fn === c.do ? 1 : 0.2 }) || []).filter((x) => typeof x === 'string'); } catch (e) { out = [`THREW ${e.message}`]; }
                if (out.some((x) => bad(x) || TICS.test(x))) assert(false, `P5A (render): ${id} "${String(typeof c.text === 'function' ? c.text(h) : c.text).slice(0, 30)}" as ${form}: ${out.join(' | ').slice(0, 120)}`);
            }
        }
        assert(rendered === Object.keys(BLACKROOT).length * FLAGSETS.length * 5 * 3, `P5A (render): every Blackroot scene rendered (${rendered})`);
        // RV1 (TG3): the scene texts behind the day record, the relationships and eight more flags (texts only; the pass above runs the choices)
        let rendered2 = 0;
        const MORE = [{ yr_day: true }, { mb_day: true }, { ya_waited: true }, { ya_respected: true }, { romance: true, mei_first: 'raft' }, { drowned_done: true }, { ape_lured: true }, { bl_watch: 'thread' }, { bl_watch: 'both' }, {}];
        for (const id of Object.keys(BLACKROOT)) for (const flags of MORE) for (const k of [1, 2, 3]) for (const rl of [[0, 0], [80, 0], [0, 80], [80, 80]]) for (const [region, bday] of [['rr', 1], ['dw', 3], ['ah', 4]]) for (const [form] of FORMS) {
            const fl = id === 'bl_night_event' ? { ...flags, bl_ev: ['song', 'wolves', 'lights', 'warm'][k] } : flags;
            const g = B(seed++, form, region, bday, fl); g.scene = id; g.rel = { ...g.rel, 'Mei Lin': { f: 60, a: rl[0] }, Ya: { f: 60, a: rl[1] } }; onDay(g, k);
            let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
            if (bad(t)) { assert(false, `P5A (RV1, TG3): ${id} as ${form}, ${region}, day ${k + 1}, ${JSON.stringify(fl)} ${rl} (${String(t).slice(0, 90)})`); continue; }
            rendered2++;
            // TG9: one form's words in another form's text
            const tq = t.replace(/\*[^*]+\*/g, '');
            if (form === 'human' && /\bpaws?\b|\bpurr|whiskers|on your shoulder, claws in/.test(tq)) assert(false, `P5A (RV1, TG9): ${id}: a cat's body on the woman (${t.match(/.{40}(?:paws?|purr|whiskers|on your shoulder, claws in).{20}/)?.[0]})`);
            if (form !== 'human' && /"[^"]+," (?:says Yuki|Yuki says)|her foot on it|her heel on it/.test(t)) assert(false, `P5A (RV1, TG9): ${id}: Yuki speaks aloud or stands as a woman in the ${form}'s text`);
            if (form === 'tiger' && /Yuki, on your shoulder|from your lap/.test(t)) assert(false, `P5A (RV1, TG9): ${id}: the great root-kin on his shoulder`);
        }
        assert(rendered2 === Object.keys(BLACKROOT).length * MORE.length * 3 * 4 * 3 * 3, `P5A (RV1, TG3): every scene behind the day record (${rendered2})`);
        // TG4: the stomp wins keep their scenes' facts, at both degrees and in every form
        const FACTS = { bone_elk: [/antler-tine/, /hammerspace/], root_wyrm: [/nine/], mire_serpent: [/That was beautiful/], drowned: [/You came in after me/], cinder_hawks: [/Little queen/], rot_ape: [/spear-head/, /Mei Lin/] };
        for (const [id, res] of Object.entries(FACTS)) for (const [form] of FORMS) {
            const g = B(seed++, form, id === 'cinder_hawks' || id === 'rot_ape' ? 'ah' : id === 'bone_elk' || id === 'root_wyrm' ? 'rr' : 'dw');
            for (const d of [2, 3]) { const t = STOMP[id].win[d](g); assert(res.every((re) => re.test(t)), `P5A (RV1, TG4): ${id}'s degree-${d} win as ${form} keeps ${res.filter((re) => !re.test(t)).join(', ') || 'its facts'}`); }
        }
        { const g = B(seed++, 'cat', 'rr'); assert(!/Antlers first/.test(STOMP.root_wyrm.posture(g, 1)) && !/off its rock|leaves its rock/.test(STOMP.rot_ape.posture(g, 1) + SRC), 'P5A (RV1, L6, L7): the wyrm\'s posture doesn\'t repeat rr_end; the ape no longer comes off its rock'); }
        // TG5: the nights' rule: no full night after a night fight
        const NIGHT_RE = /full night|sleep(?:s|ing)? (?:soundly|through)|the rest of the night asleep/i;
        for (const [form] of FORMS) for (const ev of ['wolves', 'drowned', 'serpent', 'hawks']) for (const k of [0, 1, 2, 3]) {
            const g = B(seed++, form, ev === 'hawks' ? 'ah' : ev === 'wolves' ? 'rr' : 'dw', 2, { bl_ev: ev }); onDay(g, k);
            for (const id of ['bl_night_won', 'bl_night_lost']) { g.scene = id; const t = txt(id, g); assert(!NIGHT_RE.test(t), `P5A (RV1, TG5): ${id} (${ev}, day ${k + 1}, ${form}) promises no full night`); }
            const S = STOMP[`night_${ev}`]; assert(![S.win[2](g), S.win[3](g)].some((t) => NIGHT_RE.test(t)), `P5A (RV1, TG5): night_${ev}'s stomp wins promise no full night (${form})`);
        }
        // TG7: the calendar words, and the drills and cooking that go by the count (no "yesterday")
        assert(/in two days/.test(SRC) && /"Two days,"/.test(SRC) && /Not tonight, but soon now/.test(SRC) && /a few days and a dead tree/.test(SRC) && /when I was twelve/.test(SRC) && /Fifteen years/.test(SRC) && !/two days and a dead tree|Three days ago|a thousand years/.test(SRC), 'P5A (RV1, TG7): the calendar words of the walk');
        assert(['bl_train:1', 'bl_train:2', 'talk_ya:3'].every((k) => DAY_REPLIES[k].every((t) => !/yesterday/i.test(t))) && DAY_REPLIES['bl_camp:0'].every((t) => !/yesterday/i.test(typeof t === 'function' ? t(B(seed++, 'cat')) : t)), 'P5A (RV1, L1, TG7): the lists by count say no "yesterday"');
        assert(!/the knot|Fifty paces/.test(DAY_REPLIES['bl_train:1'].join(' ')) && /A white spike has one of its eyes/.test(SRC) && /finish what the spike began/.test(SRC), 'P5A (RV1, L2, L3, L8): the darts\' lines fit every place; the lure\'s white spike');
        assert(/as far as the next rise/.test(SRC) && /she observes, on the bond, where it will not carry/.test(SRC) && /the joke goes cold in your mouth/.test(SRC), 'P5A (RV1, L9, L11, L12): the waited branch outside the camp; the bond line beside the woman; set 3\'s first line');
        assert(/three loops running/.test(readFileSync(new URL('../js/core/news.js', import.meta.url), 'utf8')), 'P5A (RV1, L14): What\'s new says three loops');
    }
}
// v0.11.173 (owner picks P6A, CA1; Fable's rewrite of part 6, the Heart): SM the seam with the Blackroot (the doorway, the label, Mei
// Lin and Yuki by form); LG the log against lore.md (no outlier; Wren's measure); NC the night unnumbered, the ship only once found; TY the
// years; YF / FB the woman's three lines and no eye colour; CW three lines; FX the leaving scene, the gate, the cup, the guardian; ST the
// three fights' stomp texts; every Heart scene in every form, day and flag set, with its choices' results
{
    const onDay = (g, k) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; return g; }; // (as NC1's)
    const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
    const H = (seed, form, d = 16, flags = {}, hour = 10) => { const g = ensureBars(fresh(seed)); const r = { cat: 0, tiger: 2, human: 7 }[form]; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.minutes = (d - 1) * 1440 + hour * 60; g.flags.ya_party = true; g.flags.mei_party = true; Object.assign(g.flags, flags); return ensureBars(g); };
    const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b/.test(t);
    const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
    const SRC = readFileSync(new URL('../js/story/act1_heart.js', import.meta.url), 'utf8');
    const STSRC = readFileSync(new URL('../js/story/stomp_act1.js', import.meta.url), 'utf8');
    const heartStomp = STSRC.slice(STSRC.indexOf('PART 3 — THE HEART'), STSRC.indexOf('PART 4 — RETURN'));
    let seed = 8100;
    // SM: the first screen starts at the doorway, not a clearing; last night it sang back; the label; Mei Lin and Yuki in each form, hers alone
    const MY = { cat: /laid two fingers on Yuki's back/, tiger: /sunk to the wrist in white fur/, human: /taken hold of Yuki's sleeve/ };
    for (const [form] of FORMS) {
        const t = txt('ht_start', H(seed++, form));
        assert(!/clearing|The forest stops|Stand up/.test(t) && /Last night something in there sang, faint as breathing, and your Convergence sang back/.test(t) && /the doorway stands a little wider/.test(t) && /gets nothing at all/.test(t), `P6A (SM; RV1 L1, TG10): ht_start begins at the doorway, as bl_end left it (${form})`);
        assert(MY[form].test(t) && Object.values(MY).filter((re) => re.test(t)).length === 1, `P6A (SM): Mei Lin reaches for Yuki as the ${form}, that line alone`);
    }
    assert(SCENES.ht_start.choices.length === 1 && SCENES.ht_start.choices[0].text === 'Walk to the doorway.' && SCENES.ht_start.choices[0].to === 'heart_gate' && SCENES.ht_start.choices[0].time === 30, 'P6A (SM): the label "Walk to the doorway." (was "Cross the clearing."), same time and target');
    assert(/^Seen close, by daylight, the doorway is no doorway\. It is a cut\./.test(txt('heart_gate', H(seed++, 'cat'))), 'P6A (SM): the gate opens on the doorway seen close');
    // LG: no outlier anywhere in the Heart; the log's last paragraph says what he understands; Wren measures against home
    assert(!/outlier/i.test(SRC) && !/the Crimson Lotus poisoned it/.test(SRC), 'P6A (LG): the Heart names no outlier (lore.md: James\'s world, found in Act 2)');
    { const t = txt('ship_log3', H(seed++, 'cat')); assert(/This world had its cure once\. It was a tree\./.test(t) && /let the old poison back up/.test(t) && /Crimson Lotus/.test(t), 'P6A (LG): ship_log3: the cure was a tree, the Lotus let the poison back'); }
    assert(/hard, and hungry, and short-lived\. Short as we measure a life, at least/.test(txt('ship_log', H(seed++, 'cat'))), 'P6A (LG): Wren\'s "short-lived" is her measure (lore.md quotes it)');
    // NC: the camp's night is not numbered by the act's day; the quiet nights name the ship only once it is found (three texts, by the night)
    for (const d of [16, 17, 18]) { const g = H(seed++, 'cat', d, {}, 20); g.scene = 'heart_camp'; const t = txt('heart_camp', g); assert(!/Night \d|expedition's end/.test(t) && /^Night inside the Old Tree/.test(t), `P6A (NC): heart_camp on Day ${d} names no number`); }
    for (const k of [0, 1, 2, 3]) for (const found of [false, true]) {
        const g = H(seed++, 'cat', 16, { ship_found: found, heart_night_roll: 3 }, 23); g.scene = 'heart_night'; onDay(g, k); const t = txt('heart_night', g);
        if (k < 3) assert(/\bship\b/.test(t) === found, `P6A (NC): the quiet night ${k + 1} names the ship only once it is found (${found})`);
        else assert(!/\bship\b/.test(t), 'P6A (NC): the 4th quiet night names no ship');
    }
    // TY: four centuries of dust, six hundred years of elbows; the cup keeps its thousand years, without "the ship" before it is found
    assert(/Four centuries of dust/.test(txt('heart_hall', H(seed++, 'cat'))) && /centuries of elbows/.test(SRC) && !/six hundred years of elbows/.test(SRC) && !/thousand years to get this soft/.test(SRC), 'P6A (TY; RV1 L4): the dust by the tree\'s years, the elbows without a number he can\'t know'); // v0.11.174 (P7A, RV1): the Heart's leftovers rewritten
    { const t = txt('ring_won', H(seed++, 'cat')); assert(/older, by the grain, than the wall grown to hold it/.test(t) && !/\bship\b|thousand/.test(t) && /Tamsin/.test(t), 'P6A (TY, FX; RV1 L4): the cup is older than its wall, with no number and no ship'); }
    assert(!/a thousand years(?! late)/.test(SRC) && (SRC.match(/a thousand years late/g) || []).length === 1 && !/for four hundred years/.test(SRC), 'P6A (TY; RV1 L4): no "a thousand years" in the Heart\'s scenes (v0.11.174, P7A: but Selene\'s night, "somebody who is a thousand years late"); no "for four hundred years"');
    // YF / FB: the woman's three lines (each hers alone; the cat's text the base) and no eye colour in the heart-chamber
    for (const [id, flags, re] of [['ring_forced', {}, /I have watched you make thicker soup/], ['ring_lost', {}, /I don't see why they need us as well/], ['guardian_half', {}, /They sang it over both of us/]]) {
        const [cat, tiger, human] = FORMS.map(([f]) => { const g = H(seed++, f, 17, flags); goTo(g, SCENES, id); return sceneView(g, SCENES).text; });
        assert(re.test(human) && !re.test(cat) && !re.test(tiger), `P6A (FB): ${id}: the woman's own line`);
    }
    for (const [form] of FORMS) assert(!/yellow|gold/.test(txt('heart_core', H(seed++, form, 18, { guardian: 'won' }))), `P6A (YF): heart_core gives Yuki's eyes no colour (${form})`);
    // CW: the three lines, once each; no artist, song or communal pot
    for (const frag of ['a man who gives Yuki the best piece is not as cold as he talks', 'since the cook, she says, eats last']) assert(SRC.split(frag).length === 2, `P6A (CW): "${frag.slice(0, 30)}…" once`);
    assert(!/who has watched you feed everyone else first/.test(SRC) && /No breakfast\. Ya feeds you/.test(SRC), 'P6A (RV1, L3): the foodless morning has no cooking line (it comes back every such morning)');
    { const g = H(seed++, 'cat', 17); g.flags.trio = 0; g.scene = 'heart_morning'; onDay(g, 0); assert(/since the cook, she says, eats last/.test(txt('heart_morning', g)), 'P6A (CW): Mei Lin\'s tea on the first morning'); }
    { const g = H(seed++, 'cat', 17, {}, 22); g.scene = 'heart_camp'; const c = SCENES.heart_camp.choices.find((x) => x.text === 'Climb up to Ya\'s ledge.'); onDay(g, 0); assert(/gives Yuki the best piece/.test(c.do(g)[0]), 'P6A (CW): Ya on the ledge, the first night'); }
    // FX: leaving names no clearing or forest edge; the gate's line fits a failed listen too; the guardian's note is the night in the roots
    { const g = H(seed++, 'cat', 19, { seed: true, guardian: 'won' }, 6); const t = txt('ht_leave', g); assert(!/clearing|edge of the trees/.test(t), 'P6A (FX): ht_leave names no clearing'); }
    { const g = H(seed++, 'cat', 16, { gate_listened: true }); const t = txt('heart_gate', g); assert(/You have put your hands to it and listened already/.test(t) && !/You heard it already/.test(t), 'P6A (FX): the gate\'s line fits either result'); }
    assert(/the note that came out of the doorway the night you slept in the roots/.test(SRC) && !/note you heard at the gate/.test(SRC), 'P6A (FX): the guardian\'s note is the one every game heard');
    // ST: the three fights' stomp texts render in every degree and form, keep their facts, and name no ship before it is found
    const FACTS = { husks: [/Tamsin/], root_husks: [/\*hull\*/i], guardian: [/two/i] };
    for (const id of ['husks', 'root_husks', 'guardian']) for (const [form] of FORMS) {
        const g = H(seed++, form, 17); const S = STOMP[id];
        const all = [1, 2, 3].map((d) => S.posture(g, d)).concat([S.win[2](g), S.win[3](g), S.one(g)]);
        assert(all.every((t) => !bad(t) && t.length > 20) && new Set([1, 2, 3].map((d) => S.posture(g, d))).size === 3, `P6A (ST): ${id}'s stomp texts render as ${form}`);
        for (const d of [2, 3]) assert(FACTS[id].every((re) => re.test(S.win[d](g))), `P6A (ST): ${id}'s degree-${d} win keeps its facts (${form})`);
    }
    { const g = H(seed++, 'cat', 17); assert(![1, 2, 3].some((d) => /\bship\b/.test(STOMP.root_husks.posture(g, d))) && !/smile/.test(STOMP.guardian.posture(g, 1)) && !/for four hundred years/.test(heartStomp) && (heartStomp.match(/a thousand years/g) || []).length <= 2, 'P6A (ST, FX): no ship before it is found, no face on the guardian, the years'); }
    // v0.11.173 (owner pick OL1): HW the heart lay below, the high wound its way out (the inscription unchanged); CR the crawl an hour, as the
    // clock charges; GL the guardian's light its own, its head to the pit at "Keep it" (scene and stomp); GW the outclassed win's half-song branch
    { const t = txt('sect_cut', H(seed++, 'cat')); assert(/\bchimney\b/.test(t) && /Here the Crimson Lotus took the heart of the Old Tree, and from it refined the first true core/.test(t), 'P6A (OL1, HW): the high wound was the way out; the inscription as it was'); }
    { const g = H(seed++, 'cat', 18); assert(/takes an hour\. It is the worst hour of your life/.test(txt('guardian_bypass', g)) && !/four hours/.test(SRC) && SCENES.heart_hub.choices.find((c) => c.to === 'guardian_bypass').time === 60, 'P6A (OL1, CR): the crawl is the hour the clock charges'); }
    { const g = H(seed++, 'cat', 18, { log_heard: true }); assert(/the last of its sap/.test(txt('guardian_approach', g)) && /toward the dark behind it, where the chamber floor falls away/.test(txt('guardian_calmed', g)) && !/The green light is waiting|scorched pit/.test(SRC + STOMP.guardian.win[3](g)) && /toward the dark at its back/.test(STOMP.guardian.win[3](g)), 'P6A (OL1, GL; RV1 L2): its light its own; "Keep it" turns its head to the dark below, the hollow not shown before heart_core'); }
    for (const [form] of FORMS) { const a = STOMP.guardian.win[2](H(seed++, form, 18)), b = STOMP.guardian.win[2](H(seed++, form, 18, { guardian_weak: true })); assert(!/whole lullaby/.test(a) && /three heartbeats of the whole lullaby/.test(b) && !bad(a) && !bad(b), `P6A (OL1, GW): the outclassed win hears the half-song only after it (${form})`); }
    // RV1 (Fable's review, M4: 8 of 18 planted faults got through): TG1 the structure pin; TG2 the mechanical parts; TG3 the log's facts; TG4
    // nothing named before it is found; TG5 the guardian's win by state through sceneView; TG6 the stomp facts; TG7 the forms at the source;
    // TG9 the years in Yuki's hall lines; TG10 the high wound read off the wood
    {   // TG1: each rewritten file's code with its string contents blanked (every ${…} kept), hashed. A push that means to change the code
        // of these files updates the pin (and says so); a rewrite push must leave it alone: an id, flag, gain, time, check, choice order or
        // label changed by accident fails here
        const skel = (src) => { let i = 0; const n = src.length; const code = (stop) => { let out = '', depth = 0; while (i < n) { const c = src[i];
            if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
            if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
            if (c === "'" || c === '"') { const q = c; const st = i; let j = i + 1; while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; } const lit = src.slice(st + 1, j); i = j + 1; out += /^[\w:.@-]{1,40}$/.test(lit) ? `'${lit}'` : 'S'; continue; }
            if (c === '`') { i++; out += '`'; while (i < n && src[i] !== '`') { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '$' && src[i + 1] === '{') { i += 2; out += '${' + code(true) + '}'; continue; } i++; } i++; out += '`'; continue; }
            if (stop) { if (c === '{') depth++; if (c === '}') { if (depth === 0) { i++; return out; } depth--; } }
            if (!/\s/.test(c)) out += c; i++; } return out; }; return code(false); };
        const LABELS = Object.values(HEART).flatMap((sc) => (sc.choices || []).map((c) => (typeof c.text === 'string' ? c.text : '(fn)')));
        const PIN = { 'act1_heart.js': '2f16ebb99efd4fad', /* v0.11.213 (FQ1, S3): re-pinned: the spring's and the fireside talks' days spaced (spacedFree); v0.11.203 (T1, TS1): re-pinned for the long calendar (late and the leave by the story's day) */ 'stomp_act1.js': '1a2e6d1e8cb25a0b', 'yuki_time.js': '746d1873838bd5ca', labels: 'f5407fff487a26e2' }; // v0.11.209 (TF1, K): the labels re-pinned ("Smoke the catch." appended on heart_hub); v0.11.182 (RS1, RV1 L6): the labels re-pinned ("Read to Ya from your archive." appended on heart_camp)
        const hash = (t) => createHash('sha256').update(t).digest('hex').slice(0, 16);
        const got = { labels: hash(JSON.stringify(LABELS)) };
        for (const f of ['act1_heart.js', 'stomp_act1.js', 'yuki_time.js']) got[f] = hash(skel(readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8')));
        for (const [k, v] of Object.entries(PIN)) assert(got[k] === v, `P6A (RV1, TG1): ${k}'s code and ids as pinned in v0.11.174 (P7A: act1_heart.js's three nights and Ya's ledge by log_heard; v0.11.173 before; ${got[k]}; update the pin only with a push that means to change them)`);
    }
    // TG2: the mechanical parts of the Heart's result lines, exactly
    for (const [frag, k] of [['Slept until 06:00. HP and Qi full.', 1], ['+1 Hull-shard', 1], ['+2 Hull-shards', 1], ['+1 Seed-sliver.', 2], ['+1 Hearth-log (memory seed).', 1], ['−2 HP.', 1], ['−4 HP.', 1], ['+6 HP.', 1], ['+4 HP.', 1], ['about 40% of your HP and 10 Qi', 1], ['HP and Qi full.', 3], ['`Breakfast. ', 1], ['`Supper. ', 1]]) assert(SRC.split(frag).length - 1 === k, `P6A (RV1, TG2): "${frag}" ${k}× in act1_heart.js (${SRC.split(frag).length - 1})`);
    // TG3: the log's facts
    { const g = H(seed++, 'cat', 17, { ship_found: true }); const L1 = txt('ship_log', g), L2 = txt('ship_log2', g), L3 = txt('ship_log3', g);
      assert(/Wren Aldous/.test(L1) && /of Selene,/.test(L1) && /Ninth Grove/.test(L1) && /Forty souls/.test(L1) && /three centuries in/.test(L2) && /Four hundred years ago/.test(L3) && /three hundred disciples/.test(L3) && /nine days/.test(L3) && /six hundred years/.test(L3) && /Crimson Lotus/.test(L3), 'P6A (RV1, TG3): the hearth-log keeps its facts (Wren, Selene (v0.11.174; the Patient Root before), the Ninth Grove, forty; three centuries; four hundred years ago, three hundred, nine days, six hundred years)'); }
    // TG4: nothing named before it is found: no ship, Wren, forty gardeners or the Ninth Grove before ship_found, in any form, day, night or flag set
    {   const EARLY = /\bship\b|Selene|Patient Root|Wren|Ninth Grove|forty (?:souls|gardeners)/i; // v0.11.174 (P7A): Selene too
        const PRE = ['ht_start', 'heart_gate', 'heart_gate_marks', 'heart_hall', 'heart_hub', 'hall_listen', 'ring_chambers', 'ring_forced', 'ring_won', 'ring_lost', 'heart_spring', 'sect_cut', 'heart_roots', 'roots_fall', 'roots_dark', 'roots_caught', 'roots_won', 'roots_lost', 'heart_camp', 'heart_night', 'heart_morning'];
        let k4 = 0;
        for (const id of PRE) for (const flags of [{}, { trio: 3 }, { romance: true, ya_romance: true, trio: 2 }, { gate_listened: true, hall_song: true, sect_marks: true, cut_read: true, rings_done: true, roots_done: true }]) for (const d of [16, 17]) for (const k of [0, 1, 2, 3, 4]) for (const [form] of FORMS) {
            const g = H(seed++, form, d, flags, id === 'heart_camp' ? 20 : id === 'heart_night' ? 23 : 10); g.scene = id; g.flags.heart_night_roll = 1 + (k4 % 6); onDay(g, k);
            const t = txt(id, g); k4++;
            if (EARLY.test(t)) assert(false, `P6A (RV1, TG4): ${id} names ${t.match(EARLY)[0]} before it is found (${form}, Day ${d}, day ${k + 1}, ${JSON.stringify(flags)})`);
            for (const c of SCENES[id].choices || []) for (const fn of [c.do, c.failDo]) { if (typeof fn !== 'function') continue; const h = H(seed++, form, d, flags); h.scene = id; onDay(h, k); if (c.show && !c.show(h)) continue; // a choice the screen doesn't show (the hearth-log's, before the ship)
                const out = (fn(h, { success: fn === c.do, ratio: 1 }) || []).filter((x) => typeof x === 'string').join(' '); if (EARLY.test(out)) assert(false, `P6A (RV1, TG4): ${id}'s result names ${out.match(EARLY)[0]} before it is found (${form})`); }
        }
        for (const [id, d] of [['husks', 3], ['root_husks', 3]]) for (const [form] of FORMS) { const g = H(seed++, form, 17); const S = STOMP[id]; const all = [1, 2, d].map((x) => S.posture(g, x)).concat([S.win[2](g), S.win[3](g), S.one(g)]).join(' '); assert(!EARLY.test(all), `P6A (RV1, TG4): ${id}'s stomp texts name nothing before it is found (${form})`); }
        assert(k4 === PRE.length * 4 * 2 * 5 * 3, `P6A (RV1, TG4): every scene before the ship read (${k4})`);
    }
    // TG5: the guardian's win by state, through the screen: the scene's own text at degree 1, the stomp's at 2 and 3; the half-song's whole lullaby
    // exactly when it was sung to (degrees 1 and 2; degree 3 sings it itself); the same choice after
    for (const degree of [1, 2, 3]) for (const weak of [false, true]) for (const [form] of FORMS) {
        const g = H(seed++, form, 18, { log_heard: true, guardian_weak: weak, guardian: 'won' }); g.scene = 'guardian_won'; g.lastWin = { id: 'guardian', next: 'guardian_won', degree };
        const v = sceneView(g, SCENES); const whole = /three heartbeats (?:of the whole lullaby|it is the whole lullaby)|For three heartbeats it is the whole lullaby/.test(v.text);
        assert(degree === 3 ? !whole : whole === weak, `P6A (RV1, TG5): guardian_won at degree ${degree}, half-song ${weak} (${form}): the whole lullaby ${degree === 3 ? 'never (it sings it itself)' : weak ? 'heard' : 'not heard'}`);
        assert(v.choices.some((c) => /heart/i.test(c.label)) && !bad(v.text), `P6A (RV1, TG5): guardian_won leads on to the heart (degree ${degree}, ${form})`);
    }
    // TG6: the stomp wins keep their scenes' facts (both degrees, every form)
    const SF = { husks: [/Tamsin/, /shoulder/, /a thousand years old/], root_husks: [/Ya/, /Hull|\*hull\*/i], guardian: [/green in its chest/, /didn't want to stop/, /doesn't have to/, /[Tt]wo pieces/, /warm/] };
    for (const [id, res] of Object.entries(SF)) for (const [form] of FORMS) for (const d of [2, 3]) { const t = STOMP[id].win[d](H(seed++, form, 18)); const miss = res.filter((re) => !re.test(t)); if (id === 'guardian' && d === 3) continue; assert(!miss.length, `P6A (RV1, TG6): ${id}'s degree-${d} win keeps ${miss.join(', ') || 'its facts'} (${form})`); }
    { const t = STOMP.guardian.win[3](H(seed++, 'cat', 18)); assert(/[Tt]wo pieces/.test(t) && /warm/.test(t) && /kneels/.test(t), 'P6A (RV1, TG6): the guardian\'s degree-3 win: it kneels, two warm pieces'); }
    assert(/That\* I liked/.test(STOMP.root_husks.win[2](H(seed++, 'cat', 17))), 'P6A (RV1, TG6): Ya\'s "*That* I liked" on the husk');
    // TG7: the forms at the source: every byForm(g, cat, tiger, human) of string literals in the Heart's two files: no speech aloud for the cat or
    // the great root-kin, no bond speech for the woman, no cat's body on her, the great root-kin on no shoulder
    {   let k7 = 0;
        for (const src of [SRC, heartStomp]) for (const m of src.matchAll(/byForm\(g, ((?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"))\s*,\s*((?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"))\s*,\s*((?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"))\s*\)/g)) {
            const [cat, tiger, human] = [m[1], m[2], m[3]].map((x) => x.slice(1, -1).replace(/\\(.)/g, '$1')); k7++;
            for (const [f, t] of [['cat', cat], ['tiger', tiger]]) if (/" ?(?:she says|says Yuki|Yuki says)\b|^"|, she says/.test(t.replace(/\*[^*]+\*/g, ''))) assert(false, `P6A (RV1, TG7): the ${f} speaks aloud: ${t.slice(0, 80)}`);
            if (/says the bond|through the bond/.test(human)) assert(false, `P6A (RV1, TG7): the woman speaks by the bond: ${human.slice(0, 80)}`);
            if (/\bpaws?\b|whiskers|four hundred pounds/.test(human)) assert(false, `P6A (RV1, TG7): a cat's body on the woman: ${human.slice(0, 80)}`);
            if (/on your shoulder|rides your shoulder|curled in your lap|Yuki in your lap/.test(tiger)) assert(false, `P6A (RV1, TG7): the great root-kin on a shoulder or in a lap: ${tiger.slice(0, 80)}`);
        }
        assert(k7 >= 15, `P6A (RV1, TG7): the Heart's form switches read at the source (${k7})`);
    }
    // TG9: the dust's years in Yuki's hall lines too (yuki_time.js heart_hub)
    { const Y = readFileSync(new URL('../js/story/yuki_time.js', import.meta.url), 'utf8'); const hub = Y.slice(Y.indexOf('"heart_hub:1"'), Y.indexOf('"heart_hub:5"') + 2000); assert(!/thousand years/.test(hub) && /four centuries deep/.test(hub) && /The rot keeps to the roots/.test(hub), 'P6A (RV1, TG9, M2, L10): Yuki\'s hall lines: four centuries of dust, the rot in the roots'); }
    // TG10: the high wound read off the wood (M1): with only the carvings seen, no "lay far below" as known fact; the chimney stays
    { const g = H(seed++, 'cat', 16, { sect_marks: true }); const t = txt('sect_cut', g); assert(!/lay far below/.test(t) && /scorching runs on down the inside of the trunk/.test(t) && /\bchimney\b/.test(t), 'P6A (RV1, TG10, M1): sect_cut reads where the heart lay off the wood'); }
    // L5, L7, L9: the camp after the crawl hears the guardian still; ht_leave from the last of the roots; Yuki in the chamber after the crawl in any form
    { const g = H(seed++, 'cat', 18, { log_heard: true, guardian: 'lost' }, 20); g.scene = 'heart_camp'; const t = txt('heart_camp', g); assert(/still sings its one broken line, to nobody/.test(t) && !/The singing has stopped/.test(t), 'P6A (RV1, L5): after the crawl the camp still hears the guardian'); }
    { const g = H(seed++, 'cat', 18, { log_heard: true, guardian: 'won' }, 20); g.scene = 'heart_camp'; assert(/The singing has stopped/.test(txt('heart_camp', g)), 'P6A (RV1, L5): after a won or calmed guardian the singing has stopped'); }
    assert(/[Ff]rom the last of the roots/.test(SRC) && !/first black ridge/.test(SRC) && /Yuki is in the chamber before any of you, without a mark on her\. You do not ask\./.test(SRC), 'P6A (RV1, L7, L9): leaving from the roots; Yuki past the crawl in any form');
    // every Heart scene in every form, on Days 16–19, under each flag set; and its choices' results
    const FLAGSETS = [{}, { ship_found: true }, { log_heard: true, ship_found: true }, { log_heard: true, ship_found: true, guardian: 'won' }, { guardian: 'calmed', seed: true }, { trio: 3 }, { romance: true, ya_romance: true, trio: 2 }, { gate_listened: true, hall_song: true }, { guardian_weak: true }, { reaction: 'rage', regrow_idea: true }, { ya_party: false }];
    let rendered = 0;
    for (const id of Object.keys(HEART)) for (const flags of FLAGSETS) for (const d of [16, 17, 19]) for (const [form] of FORMS) {
        const g = H(seed++, form, d, flags); g.scene = id; if (id === 'heart_night') g.flags.heart_night_roll = 1 + (rendered % 6);
        // RV1 (TG8): the later days' texts too (byDay / byDayLast lists), texts only
        for (const k of [1, 2, 3, 4]) { const gk = H(seed++, form, d, flags); gk.scene = id; gk.flags.heart_night_roll = 1 + ((rendered + k) % 6); onDay(gk, k); let tk; try { tk = txt(id, gk); } catch (e) { tk = `THREW ${e.message}`; } if (bad(tk)) assert(false, `P6A (RV1, TG8): ${id} on its day ${k + 1} as ${form}, Day ${d}, ${JSON.stringify(flags)} (${String(tk).slice(0, 80)})`); }
        let t; try { t = txt(id, g); } catch (e) { t = `THREW ${e.message}`; }
        if (bad(t)) { assert(false, `P6A (render): ${id} as ${form}, Day ${d}, ${JSON.stringify(flags)} (${String(t).slice(0, 90)})`); continue; }
        rendered++;
        const tq = t.replace(/\*[^*]+\*/g, '');
        if (form === 'human' && /\bpaws?\b|\bpurrs?\b|whiskers|four hundred pounds/.test(tq)) assert(false, `P6A (render, YF): ${id}: a cat's body on the woman`);
        if (form !== 'human' && /"[^"]+," (?:says Yuki|Yuki says)/.test(t)) assert(false, `P6A (render, YF): ${id}: Yuki speaks aloud as the ${form}`);
        for (const c of SCENES[id].choices || []) for (const fn of [c.do, c.failDo]) {
            if (typeof fn !== 'function') continue;
            const h = H(seed++, form, d, flags); h.scene = id; h.inventory.venison = 2; h.inventory.hearth_log = 1; h.james.qi = 99; let out;
            try { out = (fn(h, { success: fn === c.do, ratio: fn === c.do ? 1 : 0.2 }) || []).filter((x) => typeof x === 'string'); } catch (e) { out = [`THREW ${e.message}`]; }
            if (out.some((x) => bad(x))) assert(false, `P6A (render): ${id} "${String(typeof c.text === 'function' ? c.text(h) : c.text).slice(0, 30)}" as ${form}: ${out.join(' | ').slice(0, 120)}`);
        }
    }
    assert(rendered === Object.keys(HEART).length * FLAGSETS.length * 3 * 3, `P6A (render): every Heart scene rendered (${rendered})`);
}

// v0.11.172 (owner picks P5A, RV1; Fable's review TG1, TG8): the Blackroot played for real, three Coils with a real rewind, Days 11 to
// 16 06:00: every day's Practice card through taskCards / runTask, "Knock it off" through choose, cooking at every camp; what each by-day
// list showed (the darts and the needles five of five, the cooking four of four, "Knock it off" the Coil's set from its first text)
for (const form of ['cat', 'human']) {
    const g = ensureBars(newGame(77, { closed: true }));
    g.minutes = 7 * 1440 + 6 * 60; Object.assign(g.flags, { ending: 'fought', long: true, ya_met: true });
    const strong = () => { const r = { cat: 0, tiger: 2, human: 7 }[form]; g.james.realm = r; g.yuki.realm = r; g.yuki.form = form; g.james.gu = { tier: 4, level: 5, xp: 0 }; g.james.skills['Convergence Use'] = { tier: 4, level: 5, xp: 0 }; ensureBars(g); g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g); g.rel['Mei Lin'] = { f: 60, a: 30 }; g.rel.Ya = { f: 60, a: 30 }; g.inventory.venison = 20; g.james.satiety = 50; };
    strong(); g.scene = 'fo_start'; startActCoil(g, 1);
    const KEYS = ['bl_camp:0', 'bl_train:1', 'bl_train:2', 'talk_ya:3'];
    const idxOf = (key, text) => DAY_REPLIES[key].findIndex((t) => text.includes(typeof t === 'function' ? t(g) : t));
    const pick = (label) => sceneView(g, SCENES).choices.find((c) => !c.disabled && (label instanceof RegExp ? label.test(c.label) : c.label === label)) || null;
    const fight = (r) => { startCombat(g, r.combat(g)); for (let t = 0; t < 120 && g.combat; t++) { const out = combatStep(g, smartAction(g, t)); if (out?.done) { goTo(g, SCENES, out.next); break; } } };
    for (let coil = 0; coil < 3; coil++) {
        const log = {}; const note = (lines) => { const text = (lines || []).join(' | '); for (const k of KEYS) { const i = idxOf(k, text); if (i >= 0) (log[k] ||= []).push(i); } };
        const take = (c) => { const r = choose(g, SCENES, c.index); note(r.lines); if (r.combat) fight(r); return r; };
        goTo(g, SCENES, 'bl_start'); let steps = 0;
        for (; steps < 900 && g.scene !== 'ht_start'; steps++) {
            const id = g.scene; const v = sceneView(g, SCENES);
            if (TASK_HUBS[id] && /_hub$/.test(id)) {
                const card = taskCards(g, SCENES).find((c) => c.group === 'Practice' && c.status === 'open');
                if (card) { note(runTask(g, SCENES, card.id).lines); continue; }
                const ty = pick('Talk to Ya.'); if (ty) { take(ty); take(pick('"Ya. Knock it off."')); continue; }
                const next = pick('Eat with the others.') || pick('Cross the mourning hollow.') || pick(/^Push on to the end/) || pick(/^Climb to the pass/) || pick(/^Make camp/) || pick('Rest an hour.') || pick(/^Cultivate/);
                if (!next) break; take(next); continue;
            }
            if (id === 'bl_camp') { take(pick('Cook and eat.') || pick(/^Sing a ring/) || pick('Sit by the fire with the others.') || pick('Sleep.')); continue; }
            const open = v.choices.filter((c) => !c.disabled); if (!open.length) break;
            take(open.find((c) => /^Fight|^Through it|Straight at it|Sleep/.test(c.label)) || open[0]);
        }
        const day = clockParts(g.minutes).day;
        assert(g.scene === 'ht_start' && day === 16, `P5A (RV1, TG1): the Blackroot walked to the Heart, Day 16 (${form}, Coil ${coil + 1}: ${g.scene}, Day ${day}, ${steps} steps)`);
        const seq = (k, n, off = 0) => JSON.stringify(log[k] || []) === JSON.stringify([...Array(n).keys()].map((i) => i + off));
        assert(seq('bl_train:1', DAY_REPLIES['bl_train:1'].length) && seq('bl_train:2', DAY_REPLIES['bl_train:2'].length), `P5A (RV1, TG1): the darts and the needles show all five lines, Days 11–15 (${form}, Coil ${coil + 1}: ${log['bl_train:1']} / ${log['bl_train:2']})`);
        assert(seq('bl_camp:0', DAY_REPLIES['bl_camp:0'].length), `P5A (RV1, TG1, M1): the cooking shows all four lines at the four camps (${form}, Coil ${coil + 1}: ${log['bl_camp:0']})`);
        assert(seq('talk_ya:3', COIL_SETS['talk_ya:3'][coil].length, 5 * coil) && actCoil(g) === coil, `P5A (RV1, TG8): "Knock it off" shows set ${coil + 1} from its first text after ${coil} real rewind(s) (${form}: ${log['talk_ya:3']})`);
        if (coil < 2) { rewind(g); strong(); g.flags.long = true; }
    }
}
// v0.11.174 (owner picks P7A, SL1, CN1, CA1; Fable's rewrite of part 7, the Return; Selene): DR the practice drill's four lines a
// kind (the picker), SD Mei Lin carrying the seed, SZ / TY / FX the seed's size, the years, nine days; YC Ya's childhood her way; YF / FB
// the woman's lines; ST the four fights' stomp texts; SC the Selene story at the last camp (appended last: no card id moves); NM / GS her
// name (the log, the places, the nights, Ya's ledge, the item notes) and never "the ship" once the log is heard; HN no name on the hull;
// AS the anomaly; C1–C7 Fable's continuity notes; every Return scene in every form, day and flag set, with its choices' results
{
    const { RETURN, DRILL_AGAIN, drillAgain, SELENE_CHOICE } = await import('../js/story/act1_return.js');
    const { ACT1_ITEMS } = await import('../js/story/act1_common.js');
    const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
    const R = (seed, form, d = 20, flags = {}, hour = 10) => { const g = ensureBars(fresh(seed)); const r = { cat: 0, tiger: 2, human: 7 }[form]; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.coil.act = 1; g.minutes = (d - 1) * 1440 + hour * 60; g.flags.ya_party = true; g.flags.mei_party = true; Object.assign(g.flags, flags); return ensureBars(g); };
    const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b|\[object/.test(t);
    const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
    const SHIP = /\bthe ship\b|\bship Selene\b|\bthe Selene\b|Patient Root|PATIENT ROOT/i;
    const words = (t) => t.split(/\s+/).filter(Boolean).length;
    const rd = (f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8');
    const RSRC = rd('act1_return.js'), HSRC = rd('act1_heart.js'), PSRC = rd('prologue.js'), STSRC = rd('stomp_act1.js');
    const returnStomp = STSRC.slice(STSRC.indexOf('PART 4 — RETURN'));
    const results = (g, c) => { const out = []; for (const f of [c.do, c.failDo]) if (typeof f === 'function') { const h = JSON.parse(JSON.stringify(g)); try { out.push(...(f(ensureBars(h)) || []).filter((x) => typeof x === 'string')); } catch (e) { out.push(`ERR ${e.message}`); } } return out; };
    let seed = 8400;
    // every Return scene: each form, days 19–21, four flag sets: renders clean, never "the ship", and its choices' results too
    const SETS = [{ log_heard: true, seed: true }, { log_heard: true, seed: true, mei_carried_seed: true, trio: 3, romance: true, ya_romance: true, grove: 'strong', a1_militia: true },
        { log_heard: true, throuple: true, trio: 4, ending: 'fought', a1_outcome: 'taken', grove: 'weak' }, { log_heard: true, a1_outcome: 'victory', ending: 'bluff', grove: 'gentle', council_unity: true }];
    let nR = 0, badR = [], shipR = [];
    for (const id of Object.keys(RETURN)) for (const flags of SETS) for (const d of [19, 20, 21]) for (const [form] of FORMS) {
        const g = R(seed++, form, d, flags, id === 'rt_camp' || /night|evening|trio|selene|fire_talk|watch/.test(id) ? 20 : 10); g.scene = id;
        let t; try { t = txt(id, g); } catch (e) { t = `ERR ${e.message}`; }
        const res = (SCENES[id].choices || []).flatMap((c) => results(g, c));
        nR++; if (bad(t) || res.some(bad)) badR.push(`${id}/${form}/${d}`); if (SHIP.test(t) || res.some((x) => SHIP.test(x))) shipR.push(`${id}/${form}`);
    }
    assert(nR > 1500 && !badR.length, `P7A: every Return scene renders clean in every form, day and flag set, with its choices' results (${nR}; ${badR.slice(0, 5)})`);
    assert(!shipR.length, `P7A (SL1, GS): never "the ship" in the Return, after the log (${[...new Set(shipR)].slice(0, 6)})`);
    // NM / HN / AS / JR: the hull keeps no name; the log names her, James knows her, the anomaly; the lore quotes word for word
    { const g = R(seed++, 'cat', 17, { ship_found: true }); const W = txt('ship_wreck', g), L1 = txt('ship_log', g);
      assert(!/Selene|PATIENT ROOT|Patient Root/.test(W) && /nothing you can read/.test(W) && /You're crying/.test(W), 'P7A (HN): the hull\'s name is lost; Mei Lin\'s line stays');
      assert(/of Selene, out of the Ninth Grove/.test(L1) && /first seed-ships/.test(L1) && /Nobody ever learned what became of her/.test(L1) && /the stars were wrong/.test(L1) && /space folded/.test(L1) && /Then her drive failed/.test(L1) && /We can't mend her drive/.test(L1), 'P7A (NM, JR, AS): the log names her; James knows her from home; the anomaly, then her drive');
      assert(L1.includes('Something died here, long before us. A lot of somethings.') && L1.includes('hard, and hungry, and short-lived. Short as we measure a life, at least; I have no other measure with me.') && /They planted a Hearth/.test(L1) && /Forty souls/.test(L1), 'P7A (AS): the lore\'s quotes of Wren, word for word');
      assert(!/Patient Root|PATIENT ROOT/i.test(Object.values(SCENES).map((s) => (typeof s.place === 'string' ? s.place : '')).join('|') + HSRC + RSRC + STSRC), 'P7A (NM): the old name is gone from the game'); }
    // the places: the seed-ship until Wren names her (RV1, M1: ship_log's header too), Selene from the second log on
    for (const [id, p] of [['ship_touch', 'the seed-ship'], ['ship_bridge', 'the seed-ship'], ['ship_log', 'the seed-ship'], ['ship_log2', 'Selene'], ['ship_log3', 'Selene'], ['log_reaction', 'Selene'], ['log_comfort', 'Selene']]) {
        const pl = SCENES[id].place; const t = typeof pl === 'function' ? pl(R(seed++, 'cat', 17)) : pl;
        assert(t.endsWith(` — ${p}`), `P7A (NM): ${id}'s place ends "— ${p}" (${t})`);
    }
    // GS in the Heart after the log: the log's scenes, the comfort, the hub's door line, the guardian, the quiet nights and Ya's ledge
    { let k = 0; const hits = [];
      for (const id of ['ship_log', 'ship_log2', 'ship_log3', 'log_reaction', 'log_comfort', 'heart_hub', 'heart_camp', 'heart_night', 'heart_morning', 'guardian_approach', 'heart_core', 'heart_core_after', 'ht_leave'])
          for (const flags of [{ ship_found: true, log_heard: true, roots_done: true }, { ship_found: true, log_heard: true, roots_done: true, guardian: 'calmed', trio: 3, romance: true, ya_romance: true }, { ship_found: true, log_heard: true, roots_done: true, guardian: 'lost', seed: true }])
              for (const [form] of FORMS) for (const roll of [1, 2, 3, 4, 5, 6]) { const g = R(seed++, form, 17, flags, id === 'heart_camp' ? 20 : id === 'heart_night' ? 23 : 10); g.scene = id; g.flags.heart_night_roll = roll; g.coil.act = 1;
                  let t; try { t = txt(id, g); } catch (e) { t = `ERR ${e.message}`; } const res = (SCENES[id].choices || []).flatMap((c) => results(g, c)); k++;
                  if (bad(t) || SHIP.test(t) || res.some((x) => bad(x) || SHIP.test(x))) hits.push(`${id}/${form}/${roll}`); }
      assert(k > 600 && !hits.length, `P7A (GS): the Heart after the log never says "the ship" (${k}; ${[...new Set(hits)].slice(0, 6)})`); }
    { const night = (log) => { const out = new Set(); for (let r = 0; r < 4; r++) for (const d of [16, 17, 18]) { const g = R(seed++, 'cat', d, { ship_found: true, log_heard: log, heart_night_roll: 6 }, 23); g.scene = 'heart_night'; out.add(txt('heart_night', g)); } return [...out].join('\n'); };
      const pre = night(false), post = night(true);
      assert(/the ship/.test(pre) && !/Selene|forty/i.test(pre) && /Selene/.test(post) && !SHIP.test(post), 'P7A (GS): the quiet nights say "the ship" before the log (and know no forty gardeners) and Selene after it'); }
    { const f = DAY_REPLIES['heart_camp:2'][1]; const g0 = R(seed++, 'cat', 17, { ship_found: true }), g1 = R(seed++, 'cat', 17, { ship_found: true, log_heard: true });
      assert(typeof f === 'function' && /the ship/.test(f(g0)) && /Selene/.test(f(g1)) && !SHIP.test(f(g1)), 'P7A (YL): Ya on the ledge names the ship before the log, Selene after it'); }
    assert(!/\bthe ship\b|Selene/.test(ACT1_ITEMS.hearth_log.note) && !SHIP.test(ACT1_ITEMS.seed_sliver.note), `P7A (GS): the item notes hold true before and after the log (${ACT1_ITEMS.hearth_log.note} / ${ACT1_ITEMS.seed_sliver.note})`);
    // SC: the Selene story, appended last on the last camp (every older card keeps its id), once a Coil after the log, no gains
    { const L = SCENES.rt_camp.choices.map((c) => (typeof c.text === 'string' ? c.text : '(fn)'));
      assert(JSON.stringify(L) === JSON.stringify(['Story Mode only (removed in v0.11.41).', '(fn)', 'Take the first watch with Ya.', 'Cultivate by the fire: one sit, 10 Qi.', 'Sleep.', 'Story Mode only (removed in v0.11.41).', 'Yuki: change form.', '(fn)', 'Tell them who Selene was named for.']) && SCENES.rt_camp.choices.at(-1) === SELENE_CHOICE, `P7A (SC): the Selene choice comes last on rt_camp; every card before it at its v0.11.173 place (${L})`);
      const g = R(seed++, 'human', 19, {}, 20); g.scene = 'rt_camp';
      assert(!SELENE_CHOICE.show(g), 'P7A (SC): not offered without the log');
      g.flags.log_heard = true; assert(SELENE_CHOICE.show(g) && SELENE_CHOICE.time === 30 && SELENE_CHOICE.to === 'rt_selene', 'P7A (SC): offered after the log, 30 minutes, to rt_selene');
      const rel0 = JSON.stringify(g.rel); SELENE_CHOICE.do(g); assert(g.flags.rt_selene && !SELENE_CHOICE.show(g) && JSON.stringify(g.rel) === rel0, 'P7A (SC): once a Coil, no relationship moves');
      assert(!KEEP_FLAGS.includes('rt_selene') && SCENES.rt_selene.choices.length === 1 && SCENES.rt_selene.choices[0].to === 'rt_camp', 'P7A (SC): the flag is a world flag (each Coil); back to the fire');
      for (const [form] of FORMS) { const t = txt('rt_selene', R(seed++, form, 19, { log_heard: true }, 20));
          assert(!bad(t) && !SHIP.test(t) && /Endymion/.test(t) && /Selene was the Moon/.test(t) && /romantic/.test(t) && /She doesn't stop/.test(t) && /every night she comes down to him/.test(t) && words(t) >= 380 && words(t) <= 520, `P7A (SC): rt_selene as ${form}: the myth, Mei Lin's romance, Ya's perseverance (${words(t)} words)`); }
      const [c, tg, h] = FORMS.map(([form]) => txt('rt_selene', R(seed++, form, 19, { log_heard: true }, 20)));
      assert(/yellow eye/.test(c) && /says the bond/.test(c) && /drift of snow/.test(tg) && /says the bond/.test(tg) && /" she says/.test(h) && !/says the bond/.test(h), 'P7A (SC, YF): Yuki by form (the cat and the great root-kin by the bond, the woman aloud)'); }
    // DR: each practice outcome four lines, all drawn before any comes back, never the same twice running; no gain
    { assert(['hard', 'hardFail', 'ya'].every((k) => DRILL_AGAIN[k].length === 4 && new Set(DRILL_AGAIN[k]).size === 4 && DRILL_AGAIN[k].every((t) => !bad(t) && words(t) >= 12 && words(t) <= 30 && !SHIP.test(t))), 'P7A (DR): three sets of four practice lines, 12–30 words, all different');
      assert(DRILL_AGAIN.ya[0] === "Ya runs them round the threshing floor until they stop looking like villagers. 'Better,' she says. 'Still handsome but afraid.'", 'P7A (DR): Ya\'s old line first');
      for (const k of ['hard', 'hardFail', 'ya']) { const g = R(seed++, 'cat', 20, { a1_militia: true }); const got = [0, 1, 2, 3].map(() => drillAgain(g, k)); const fifth = drillAgain(g, k);
          assert(new Set(got).size === 4 && fifth !== got[3] && got.every((t) => DRILL_AGAIN[k].includes(t)), `P7A (DR): four "${k}" drills in a day show four lines; the fifth is not the fourth again`);
          const g2 = R(seed++, 'cat', 20, { a1_militia: true }); g2.coil.n = 2; assert(DRILL_AGAIN[k].includes(drillAgain(g2, k)), `P7A (DR): a new Coil draws again (${k})`); }
      const g = R(seed++, 'cat', 20, { a1_militia: true }); const rel0 = JSON.stringify(g.rel); const ya = SCENES.rt_hunters.choices.find((c) => /Ya teach/.test(c.text));
      const seen = new Set([0, 1, 2, 3].map(() => ya.do(g)[0])); assert(seen.size === 4 && JSON.stringify(g.rel) === rel0, 'P7A (DR, SF1): "Let Ya teach them" four times on Day 20: four different lines, no relationship moves'); }
    // SD / SZ: the seed in his hammerspace, or in Mei Lin's sleeve; no longer than his hand
    { for (const [mei, re, not] of [[false, /hammerspace/, /sleeve/], [true, /sleeve/, /hammerspace/]]) {
          const g = R(seed++, 'cat', 19, { seed: true, mei_carried_seed: mei }); const s = txt('rt_start', g); const p = txt('rt_plant', g);
          assert(re.test(s) && !not.test(s.split('\n\n')[1] || '') && re.test(p) && !not.test(p.split('\n\n')[0]) && /no longer than your hand/.test(p) && !/longer than your finger/.test(p), `P7A (SD, SZ): ${mei ? 'Mei Lin carried it' : 'his hammerspace'}: rt_start and rt_plant agree; no longer than his hand`); }
      assert(/Mei Lin/.test(txt('rt_plant', R(seed++, 'cat', 20, { seed: true, mei_carried_seed: true })).split('\n\n')[0]), 'P7A (SD): she hands it over at the planting'); }
    // TY / FX / YC: the years, nine days, Ya's childhood her way
    { const mt = txt('rt_mei_talk', R(seed++, 'cat', 19)); assert(/six hundred years/.test(mt) && !/thousand/.test(mt), 'P7A (TY): the tree sang six hundred years');
      const end = txt('a1_end', R(seed++, 'cat', 21, { a1_outcome: 'taken' })); assert(/four centuries/.test(end) && !/for a thousand years/.test(end), 'P7A (TY): the Sect four centuries, not a thousand years');
      assert(/nine days/.test(txt('rt_mother', R(seed++, 'cat', 20))) && !/four days in the deep forest/.test(RSRC), 'P7A (FX): nine days away, not four');
      const ft = txt('rt_fire_talk', R(seed++, 'cat', 19, {}, 20)); assert(/wolf den/.test(ft) && /twelve/.test(ft) && /fifteen/i.test(ft) && !/burned village/.test(ft), 'P7A (YC): Ya\'s childhood as she tells it in her talk'); }
    // FB: the woman's lines filled (a brawl lost, a parley failed, a duel lost); a1_end's last line aloud
    for (const id of ['rt_brawl_lost', 'rt_parley_fail', 'rt_duel_lost']) { const [c, , h] = FORMS.map(([form]) => txt(id, R(seed++, form, 21, { log_heard: true })));
        assert(h !== c && /Yuki/.test(h.replace(c, '')) || h.length > c.length + 40, `P7A (FB): ${id} has a line for the woman`); }
    { const h = txt('a1_end', R(seed++, 'human', 21, { a1_outcome: 'victory' })); assert(/Not dead,' she says|Not dead," she says/.test(h) && !/says the bond/.test(h.slice(h.lastIndexOf('Yuki'))), 'P7A (YF): a1_end\'s last line aloud for the woman'); }
    // C1–C7: Fable's continuity notes
    { const both = { romance: true, ya_romance: true }; const mt = txt('rt_mei_talk', R(seed++, 'cat', 19, both)); const mo = txt('rt_mother', R(seed++, 'cat', 20, both));
      assert(!/By the water/i.test(mt) && !/kissed you at the river/.test(mo), 'P7A (C1): no kiss by the water before one happens; the street has only rumour');
      assert(!/Maybe four|four (ash-)?wolves|Four ash-wolves/i.test(RSRC + returnStomp), 'P7A (C2): three wolves, as the fight has');
      assert(!/riders/.test(txt('rt_wen', R(seed++, 'cat', 20))), 'P7A (C3): no riders: Shen Qiu comes on foot');
      assert(!/smell the seed/.test(RSRC), 'P7A (C4): the wolves smell what he carries, seed or none');
      assert(/fan/.test(returnStomp) && /fan/.test(txt('rt_duel_won', R(seed++, 'cat', 21))), 'P7A (C5): the fan shown before it is named');
      const tk = txt('a1_end', R(seed++, 'cat', 21, { a1_outcome: 'taken' })), st = txt('a1_end', R(seed++, 'cat', 21, { a1_outcome: 'victory' }));
      assert(!/grove's song/.test(tk) && /grove's song/.test(st), 'P7A (C6): after being taken he cannot hear the grove\'s song; after a win he can');
      assert(!/through the white stems/.test(RSRC), 'P7A (C7): knee-high stems: no stars through them'); }
    // RB: the ford's bridge line and its Incremental Mode twin changed together (prologue.js swaps them by exact words)
    { const m = PSRC.match(/reword\('rt_ford', \/bridge of bone\/, '[^']*', \['((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)'\]\)/);
      assert(m && RSRC.includes(m[1]) && !RSRC.includes(m[2]) && !/A white bridge, ribbed like a spine/.test(RSRC), `P7A (RB): the bridge line in act1_return.js is the one prologue.js swaps (${m && m[1].slice(0, 40)})`); }
    // ST: the four fights' stomp texts by degree, clean, never the ship; the Elder keeps "Ashfall does not kneel" for power.js
    for (const id of ['rt_wolves', 'rt_serpent', 'rt_brawl', 'elder']) for (const [form] of FORMS) { const g = R(seed++, form, id === 'elder' ? 21 : 19, { log_heard: true });
        const st = STOMP[id]; const ts = [1, 2, 3].map((d) => st.posture(g, d)).concat([st.win[2](g), st.win[3](g), st.one(g)]);
        assert(ts.every((t) => !bad(t) && !SHIP.test(t)) && new Set(ts).size === 6, `P7A (ST): ${id}'s stomp texts as ${form}, clean`); }
    assert(RSRC.includes("if (p) enc.intro += ' Behind you, Ashfall does not kneel.';") && readFileSync(new URL('../js/story/power.js', import.meta.url), 'utf8').includes("enc.intro?.includes('Ashfall does not kneel')"), 'P7A (ST): the Elder\'s intro keeps the words power.js keeps after the posture');
    // the canon in lore.md (rule 6): the owner's words of 04:38–05:01
    { const lore = readFileSync(new URL('../project/lore.md', import.meta.url), 'utf8');
      assert(['**The owner, 04:38:**', '**The owner, 04:44:**', '**The owner, 04:54:**', '**The owner, 05:01:**', 'She was called Selene, after tbe Greek Moon Goddess.', 'the ship\'s are sentient, but not sapient', 'Selene was one of the first colonization attempts by his Earth\'s humans.', 'Reading UV-a'].every((s) => lore.includes(s)) && !/seed-ship \*\*Patient Root\*\*,/.test(lore), 'P7A (rule 6, CN1): the owner\'s Selene canon word for word in lore.md'); }
}
// v0.11.174 (owner pick RV1; Fable's cold review of part 7, TG1–TG10): the Return's code pinned, its mechanical parts, the fights' numbers,
// Shen Qiu's facts, nine days, Selene never before the log and never "the ship" after it (every Heart scene by day, the card texts), the
// Selene story end to end, nobody senses them, the seam and the picker through a save
{
    const { RETURN, DRILL_AGAIN } = await import('../js/story/act1_return.js');
    const { ACT1_ITEMS } = await import('../js/story/act1_common.js');
    const { HT_BODY } = await import('../js/story/house_texts.js');
    const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
    const R = (seed, form, d = 20, flags = {}, hour = 10) => { const g = ensureBars(fresh(seed)); const r = { cat: 0, tiger: 2, human: 7 }[form]; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.coil.act = 1; g.minutes = (d - 1) * 1440 + hour * 60; g.flags.ya_party = true; g.flags.mei_party = true; Object.assign(g.flags, flags); return ensureBars(g); };
    const onDay = (g, k) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; return g; };
    const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
    const SHIP = /\bthe ship\b|\bship Selene\b|\bthe Selene\b/i;
    const rd = (f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8');
    const RSRC = rd('act1_return.js'), STSRC = rd('stomp_act1.js'); const returnStomp = STSRC.slice(STSRC.indexOf('PART 4 — RETURN'));
    const flat = (v, g) => (typeof v === 'function' ? [v(g)] : Array.isArray(v) ? v.flatMap((x) => flat(x, g)) : v && typeof v === 'object' ? Object.values(v).flatMap((x) => flat(x, g)) : typeof v === 'string' ? [v] : []);
    let seed = 8900;
    // TG1: act1_return.js's code and the Return's labels, pinned (strings blanked, ${…} kept, ids kept; as P6A's TG1)
    { const skel = (src) => { let i = 0; const n = src.length; const code = (stop) => { let out = '', depth = 0; while (i < n) { const c = src[i];
            if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; } if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
            if (c === "'" || c === '"') { const q = c; const st = i; let j = i + 1; while (j < n && src[j] !== q) { if (src[j] === '\\') j++; j++; } const lit = src.slice(st + 1, j); i = j + 1; out += /^[\w:.@-]{1,40}$/.test(lit) ? `'${lit}'` : 'S'; continue; }
            if (c === '`') { i++; out += '`'; while (i < n && src[i] !== '`') { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '$' && src[i + 1] === '{') { i += 2; out += '${' + code(true) + '}'; continue; } i++; } i++; out += '`'; continue; }
            if (stop) { if (c === '{') depth++; if (c === '}') { if (depth === 0) { i++; return out; } depth--; } }
            if (!/\s/.test(c)) out += c; i++; } return out; }; return code(false); };
      const hash = (t) => createHash('sha256').update(t).digest('hex').slice(0, 16);
      const LABELS = Object.values(RETURN).flatMap((sc) => (sc.choices || []).map((c) => (typeof c.text === 'string' ? c.text : '(fn)')));
      const PIN = { 'act1_return.js': 'c7ebb0a55ca9d7c1', labels: '58e59f4e08e64332' }; // v0.11.198 (S1, D1, SX; RV1 L1, M3): the code re-pinned (rt_start, rt_road and rt_ambush read party_flew; the SX block; sxRide; partyCarry imported; the labels unchanged); v0.11.190 (N1, SW): the code re-pinned (the parley's +1 reads a1_sky_seen too); v0.11.179 (LB1): the labels re-pinned (the label pass); v0.11.181 (KG1): again, the mother's card label on rt_ashfall became a function (by the kitchen's stage); v0.11.188 (N1, RV1 M4): again, rt_wen's and rt_elder's sky lines by sky_witness / a1_sky_seen; v0.11.185 (BR1, RV1 M2): the code re-pinned (the street reads a1_sky_seen too)
      const got = { 'act1_return.js': hash(skel(RSRC)), labels: hash(JSON.stringify(LABELS)) };
      for (const [k, v] of Object.entries(PIN)) assert(got[k] === v, `P7A (RV1, TG1): ${k}'s code and ids as pinned in v0.11.174 (${got[k]}; update the pin only with a push that means to change them)`); }
    // TG2: the mechanical parts of the Return's result lines, exactly
    for (const [frag, k] of [['Slept until 06:00. HP and Qi full.', 5], ['+30 satiety', 1], ['+2 Smoked meat', 1], ['+1 Murky beast core.', 1], ['An hour of rest.', 1], ['no Qi spent', 1]]) assert(RSRC.split(frag).length - 1 === k, `P7A (RV1, TG2): "${frag}" ×${k} in act1_return.js (${RSRC.split(frag).length - 1})`);
    assert(/: \+20 satiety\.$/.test(DAY21_BREAKFAST), 'P7A (RV1, TG2): breakfast ends ": +20 satiety."');
    // TG3: the fights' numbers: three wolves, Bao and one cousin, and the texts count them so
    { const g = R(seed++, 'cat', 19); const wolves = SCENES.rt_ambush.choices.find((c) => c.combat)?.combat(g); const brawl = SCENES.rt_brawl_start.choices.find((c) => c.combat)?.combat(R(seed++, 'cat', 20));
      assert(wolves?.enemies.length === 3 && !/four (ash-)?wolves|other three|Maybe four/i.test(returnStomp.slice(0, returnStomp.indexOf('rt_serpent'))), `P7A (RV1, TG3): three wolves in the fight and in its stomp texts (${wolves?.enemies.length})`);
      assert(brawl?.enemies.length === 2 && !/Bao and both cousins|Three grown hunters/i.test(RSRC + returnStomp), `P7A (RV1, TG3, L3): the brawl is Bao and one cousin, in the fight and the texts (${brawl?.enemies.length})`); }
    // TG4: Shen Qiu's facts: on foot, twelve, the morning, three hundred years, the fan; no horse
    { const el = txt('rt_elder', R(seed++, 'cat', 21, {}, 8));
      assert(/on foot/.test(el) && /twelve disciples/.test(el) && /hour of the dragon/.test(el) && /fan/.test(el) && !/horse|rider|mounted|saddle|hour of the snake/i.test(el), 'P7A (RV1, TG4, M2): Shen Qiu comes on foot at the hour of the dragon, twelve disciples, a fan');
      const yrs = (RSRC + returnStomp).match(/(\w+) hundred years/g) || []; assert(yrs.every((y) => /three|four|six|^a hundred/i.test(y)), `P7A (RV1, TG4): every "hundred years" is three (Shen Qiu), four (the Sect, the dead tree) or six (the song) (${[...new Set(yrs)]})`);
      const FSRC = rd('act1_fallout.js'); assert(/in the morning, by the north road, with twelve disciples/.test(FSRC) && /twelve disciples/.test(STSRC.slice(0, STSRC.indexOf('palisade_wolf'))) && !/noon, four disciples|with four disciples/.test(FSRC + STSRC), 'P7A (RV1, TG4, M2): the watcher\'s ledger agrees: the morning, twelve disciples'); }
    // TG5: nine days away, everywhere
    assert(!/(four|five|six|seven) days in the (Blackroot|deep forest)/i.test(RSRC) && /Nine days/.test(txt('rt_evening', R(seed++, 'cat', 20, {}, 19))) && /five days/.test(txt('rt_start', R(seed++, 'cat', 19, { seed: true }, 6))), 'P7A (RV1, TG5, L5): nine days away; the long way five days');
    // TG6: Selene never before the log: every Heart scene by day with ship_found and no log_heard, the camp replies, the item notes, the log's place
    { const hits = []; let k = 0;
      for (const id of Object.keys(SCENES).filter((s) => SCENES[s].place && /Inside the Old Tree|Old Tree/.test(String(typeof SCENES[s].place === 'function' ? '' : SCENES[s].place)) || /^(heart_|ship_|ring_|roots_|guardian_|hall_|sect_cut|log_|ht_)/.test(s)).filter((s) => !/^(guardian_|heart_core|ht_leave)/.test(s))) // the guardian, the heart and the way out come only after the log (guardianOpen)
          for (const d of [16, 17, 18]) for (const day of [0, 1, 2, 3, 4]) for (const [form] of FORMS) { const g = onDay(R(seed++, form, d, { ship_found: true, roots_done: true }, id === 'heart_camp' ? 20 : id === 'heart_night' ? 23 : 10), day); g.scene = id; g.flags.heart_night_roll = 1 + (k % 6);
              let t; try { t = txt(id, g); } catch (e) { t = ''; } k++; if (/Selene/.test(t) && !/^ship_log/.test(id) && id !== 'log_reaction' && id !== 'log_comfort') hits.push(`${id}/${day}`); }
      const replies = Object.keys(DAY_REPLIES).filter((key) => /^heart_/.test(key)).flatMap((key) => flat(DAY_REPLIES[key], R(seed++, 'cat', 17, { ship_found: true })));
      assert(k > 1000 && !hits.length && !replies.some((t) => /Selene/.test(t)) && !/Selene/.test(ACT1_ITEMS.hearth_log.note + ACT1_ITEMS.seed_sliver.note) && /the seed-ship$/.test(SCENES.ship_log.place), `P7A (RV1, TG6, M1): nobody names Selene before Wren does (${k}; ${[...new Set(hits)].slice(0, 5)})`); }
    // TG7: never "the ship" after the log: every Heart scene by day and form, Yuki's and the houses' card texts, the Heart's replies
    { const hits = []; let k = 0;
      for (const id of Object.keys(SCENES).filter((s) => /^(heart_|ship_log|ring_|roots_|guardian_|hall_|sect_cut|log_|ht_)/.test(s)))
          for (const day of [0, 1, 2, 3, 4]) for (const [form] of FORMS) for (const g0 of [{ guardian: 'calmed', seed: true }, { guardian: 'lost' }, {}]) { const g = onDay(R(seed++, form, 17, { ship_found: true, log_heard: true, roots_done: true, ...g0 }, id === 'heart_camp' ? 20 : id === 'heart_night' ? 23 : 10), day); g.scene = id; g.flags.heart_night_roll = 1 + (k % 6);
              let t; try { t = txt(id, g); } catch (e) { t = ''; } k++; if (SHIP.test(t)) hits.push(`${id}/${day}/${form}`); }
      const g = R(seed++, 'human', 17, { ship_found: true, log_heard: true });
      const cards = [...Object.entries(YT_BODY).filter(([key]) => /^(heart_hub|rt_)/.test(key)).flatMap(([, v]) => flat(v, g)), ...flat(HT_BODY.wen['rt_ashfall:1'], g), ...flat(HT_BODY.mother['rt_ashfall:1'], g), ...Object.keys(DAY_REPLIES).filter((key) => /^heart_/.test(key)).flatMap((key) => flat(DAY_REPLIES[key], g))];
      assert(k > 1500 && !hits.length && !cards.some((t) => SHIP.test(t)), `P7A (RV1, TG7): never "the ship" after the log, any Heart scene, day or form, nor in the cards (${k}; ${[...new Set(hits)].slice(0, 5)}; ${cards.filter((t) => SHIP.test(t)).map((t) => t.slice(0, 40))})`); }
    // TG8: the Selene story end to end: there and back by choose, nothing gained or spent but time
    { const g = R(seed++, 'cat', 19, { log_heard: true, seed: true }, 20); goTo(g, SCENES, 'rt_camp'); const before = JSON.stringify({ rel: g.rel, items: g.inventory, xp: g.james.gu }); const m0 = g.minutes;
      const i = sceneView(g, SCENES).choices.find((c) => c.label === 'Tell them who Selene was named for.')?.index; choose(g, SCENES, i);
      assert(g.scene === 'rt_selene' && !SCENES.rt_selene.choices[0].do, 'P7A (RV1, TG8): to the story; its way back does nothing but go back');
      choose(g, SCENES, 0); const after = JSON.stringify({ rel: g.rel, items: g.inventory, xp: g.james.gu });
      assert(g.scene === 'rt_camp' && after === before && g.minutes - m0 >= 30 && g.minutes - m0 <= 45 && !sceneView(g, SCENES).choices.some((c) => c.label === 'Tell them who Selene was named for.'), `P7A (RV1, TG8): back at the fire, nothing gained or spent, ${g.minutes - m0} minutes, not offered again`); }
    // TG9: nobody senses James or Yuki in the Return (Shen Qiu feels nothing)
    assert(!/(feels?|senses?|smells?) (your|his|her) Qi|your Qi is (strong|great|vast)/i.test(RSRC + returnStomp), 'P7A (RV1, TG9): nobody in the Return senses his Qi or hers');
    // TG10: the seam (whoever carries the seed) and the picker through a save
    { const lv = txt('ht_leave', R(seed++, 'cat', 19, { seed: true, mei_carried_seed: true })); assert(!/in your hand|near your heart/i.test(lv.slice(lv.lastIndexOf('\n'))), 'P7A (RV1, TG10, M3): the Heart\'s last line holds whoever carries the seed');
      let g = R(seed++, 'cat', 20, { a1_militia: true }); const got = [];
      for (let i = 0; i < 8; i++) { got.push(SCENES.rt_hunters.choices.find((c) => /Ya teach/.test(c.text)).do(g)[0]); g = ensureBars(deserialize(serialize(g))); }
      assert(new Set(got.slice(0, 4)).size === 4 && new Set(got.slice(4)).size === 4 && got.every((t, i) => i === 0 || t !== got[i - 1]) && got.every((t) => DRILL_AGAIN.ya.includes(t)), 'P7A (RV1, TG10): eight practice drills through a save round trip: two full rounds, never the same twice running'); }
}
// v0.11.177 (owner pick P9A; Fable's rewrite, part 9, the leftovers): ST the prologue's eight older stomp texts (jackals, Gao, boar, Lu
// Han's men, crows, rats, lizard, mire), YV no verb straight after Yuki's phrase, FM four men at the tribute, TB the far hunt's kill
// (the core comes out of a dead beast) and its second-day twin (byDay on far_won's record); P5 the stake line as the fight's tail; P8
// the Long Forest's places remembered across Coils (`lf_known`, kept; the Tans and Fang Wei forget)
{
    const { prepare } = await import('../js/story/power.js');
    const { LONGFOREST } = await import('../js/story/longforest.js');
    const PSTOMP = readFileSync(new URL('../js/story/stomp_prologue.js', import.meta.url), 'utf8');
    const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b|\[object|\bnull\b/.test(t);
    const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
    const G = (seed, form, scene = 'far_won') => { const g = ensureBars(fresh(seed)); g.yuki.realm = { cat: 0, tiger: 2, human: 7 }[form]; g.james.realm = g.yuki.realm; g.yuki.form = form; g.scene = scene; return g; };
    // ST: the old openings are gone
    const OLD = ['The ashfangs come out of the dark low and slow', "It isn't a fight so much as a correction", 'Gao Feng straightens his crimson sleeves', 'Gao Feng discovers, in rapid succession',
        'The ironhide boar comes out of the oak hollow like a cart', 'Lu Han does not hurry', 'The three rot-crows spread their moulting wings', 'The mire-rats come up the bank shoulder to shoulder',
        'The thornback lifts its ridge of hollow spines', 'The mire-rats come out of the black water in a rush'];
    const left = OLD.filter((o) => PSTOMP.includes(o));
    assert(!left.length, `P9A (ST): the eight fights' older openings rewritten (${left})`);
    // YV + FM: every prologue stomp text, three forms, every degree, clean; no verb straight after Yuki's phrase; Lu Han's men never "two"
    const IDS = ['jackals', 'gao', 'boar', 'collectors', 'crows', 'rats', 'lizard', 'mire', 'wolves', 'thornback', 'arson'];
    let n = 0; const badS = [];
    for (const id of IDS) for (const [form] of FORMS) {
        const g = G(9100 + n, form); const st = STOMP[id];
        const outs = [1, 2, 3].map((d) => st.posture(g, d)).concat([2, 3].map((d) => (typeof st.win[d] === 'function' ? st.win[d](g) : st.win[d])), [typeof st.one === 'function' ? st.one(g) : st.one]);
        for (const o of outs) { n++; if (bad(o) || /(arms folded|twice as bored|Yuki, eleven pounds of white cat) [a-z]+s\b/.test(o) || (id === 'collectors' && /\btwo (men|disciples)\b/i.test(o))) badS.push(`${id}/${form}`); }
    }
    assert(n === IDS.length * 3 * 6 && !badS.length, `P9A (ST, YV, FM): the prologue's stomp texts render clean in every form and degree (${n}; ${[...new Set(badS)]})`);
    // TB: the far hunt's wins name the core (it comes out of a dead beast) and read a second text on the second day, on far_won's own record
    for (const id of ['wolves', 'thornback']) for (const d of [2, 3]) for (const [form] of FORMS) {
        const g = G(9300, form); g.lines = null; const first = STOMP[id].win[d](g);
        noteDay(g, 'far_won'); g.minutes += 1440; noteDay(g, 'far_won');
        const second = STOMP[id].win[d](g);
        assert(/\bcore\b/.test(first) && /\bcore\b/.test(second) && first !== second && !bad(second) && dayIndex(g, 'far_won') === 1, `P9A (TB): ${id} win ${d} (${form}) names the core and has its second-day twin`);
    }
    assert(!/not moving at all\. I\n/.test(PSTOMP), 'P9A (TB): no stray fragment after the thornback plays dead');
    // P5: the stake line is the night fight's tail: after the plain intro, and after a stomp posture at degree 3
    {
        const g = ensureBars(fresh(9400)); g.scene = 'bl_night_event'; g.flags.bl_region = 'rr'; g.flags.bl_ev = 'wolves'; g.flags.bl_stakes_night = true;
        const c = SCENES.bl_night_event.choices.find((x) => x.text === 'Fight.'); const enc = c.combat(g);
        assert(enc.tail && /stakes/.test(enc.tail) && !enc.intro.includes(enc.tail), `P9A (P5): the stake line rides as the fight's tail (${enc.tail})`);
        g.james.gu = { tier: 9, level: 10, xp: 0 }; ensureBars(g); const p = prepare(g, c.combat(g));
        assert(p.degree >= 2 && p.intro.endsWith(enc.tail), `P9A (P5): at degree ${p.degree} the stake line follows the posture`);
        const h = ensureBars(fresh(9401)); h.scene = 'bl_night_event'; h.flags.bl_region = 'rr'; h.flags.bl_ev = 'wolves';
        assert(!c.combat(h).tail, 'P9A (P5): no stakes, no stake line');
    }
    // P8: lf_known is kept across Coils; a later Coil's first visit reads the later text; the Tans and Fang Wei forget
    {
        assert(KEEP_FLAGS.includes('lf_known'), 'P9A (P8): lf_known is a knowledge flag kept across Coils');
        const L = (seed, coilN) => { const g = ensureBars(fresh(seed)); g.coil.n = coilN; g.minutes = 2 * 1440 + 10 * 60; g.scene = 'lf_hub'; return g; };
        const a = L(9500, 2); goTo(a, SCENES, 'lf_falls'); const first = sceneView(a, SCENES).text; goTo(a, SCENES, 'lf_hub'); a.minutes += 1440; goTo(a, SCENES, 'lf_falls'); const again = sceneView(a, SCENES).text;
        assert(a.flags.lf_known?.falls === 2 && first !== again, `P9A (P8): the first visit is noted with its Coil (${JSON.stringify(a.flags.lf_known)})`);
        const b = L(9501, 3); b.flags.lf_known = { ...a.flags.lf_known }; goTo(b, SCENES, 'lf_falls');
        assert(b.flags.lf_seen_falls === 1 && sceneView(b, SCENES).text === again, 'P9A (P8): from a later Coil the first visit reads the later text');
        const c2 = L(9502, 2); c2.flags.lf_known = { falls: 2 }; goTo(c2, SCENES, 'lf_falls');
        assert(sceneView(c2, SCENES).text === first, 'P9A (P8): the Coil of the first visit still reads the first text');
        for (const who of ['lf_bandits', 'lf_rogue']) {
            const g = L(9503, 3); g.flags.lf_known = { [who]: 2 }; g.flags.lf_human = who; g.flags.lf_last = who; g.flags[`lf_seen_${who}`] = 1;
            const t1 = LONGFOREST.lf_human_talked.text(g); g.flags[`lf_seen_${who}`] = 2; const t2 = LONGFOREST.lf_human_talked.text(g);
            assert(t1 !== t2, `P9A (P8): ${who} remember nothing of an earlier Coil (their first meeting this Coil reads the first text)`);
        }
        // RV1 TG2: a real rewind keeps lf_known and clears the counters; the next Coil's first visit reads the later text; a save keeps it
        { const g = L(9504, 2); goTo(g, SCENES, 'lf_falls'); goTo(g, SCENES, 'lf_hub'); goTo(g, SCENES, 'lf_wanderers'); const known = JSON.stringify(g.flags.lf_known);
          assert(!('lf_bandits' in g.flags.lf_known) && !('lf_rogue' in g.flags.lf_known), 'P9A (RV1, C6): the two people are not stored');
          endCoil(g, 'choice'); rewind(g); g.coil.n = 3; g.scene = 'lf_hub';
          assert(JSON.stringify(g.flags.lf_known) === known && !Object.keys(g.flags).some((k) => /^lf_seen_/.test(k)), `TG2: a rewind keeps lf_known (${JSON.stringify(g.flags.lf_known)}) and clears the counters`);
          goTo(g, SCENES, 'lf_falls'); const t3 = sceneView(g, SCENES).text;
          assert(t3 === again, 'TG2: after the rewind the first visit reads the later text');
          assert(JSON.stringify(deserialize(serialize(g)).flags.lf_known) === JSON.stringify(g.flags.lf_known), 'TG2: lf_known survives a save'); }
    }
    // P1 (run C): Old Wen and Lu Han judge Yuki by what they see (no sensing), every branch and form; the road's direction agrees;
    // the bond-only path lines are their own texts; Wen's needle line not on the ignored path; no "for three days"
    {
        const PSRC = readFileSync(new URL('../js/story/prologue.js', import.meta.url), 'utf8'), YSRC = readFileSync(new URL('../js/story/yuki_path.js', import.meta.url), 'utf8');
        const CSRC = readFileSync(new URL('../js/story/coil_scenes.js', import.meta.url), 'utf8');
        const elder = PSRC.match(/const yukiMerElder = [^\n]*/)[0] + PSRC.match(/const yukiMerLu = [^\n]*/)[0];
        assert(!/\bsens(e|es|ed)\b[^`]{0,40}\bmeridian|carries twelve open meridians|meridians open like/.test(elder), 'P9A (P1, MS): Old Wen and Lu Han read no meridians by sense');
        assert(!/up the mountain, the crimson robes/.test(CSRC) || !/down the mountain/.test(CSRC), 'P9A (P1, RD): the Sect is one way up or down in both Coil texts');
        assert(!/for three days/.test(YSRC), 'P9A (P1, TD): no "for three days" in the chopsticks talk');
        for (const ign of [false, true]) {
            const g = ensureBars(fresh(9600 + ign)); g.flags.ignored = ign; g.scene = 'elder';
            const ids = Object.keys(SCENES).filter((k) => { const s = SCENES[k]; try { return typeof s.text === 'function' && /you made a needle|You eat no pills/.test(s.text(g)); } catch { return false; } });
            const hits = ids.map((k) => SCENES[k].text(g)).filter((x) => /You eat no pills/.test(x));
            assert(hits.length >= 1 && hits.every((x) => /made a needle/.test(x) === !ign), `P9A (P1, NE): Wen's needle line only where Mei Lin saw it (ignored ${ign})`);
        }
    }
    // run D: FF the Fallout's failure lists a third text; P5 the places by branch and region; P8 the Heartless's win grave, the spar's own failure pool
    {
        for (const k of ['fo_palisade:0:f', 'fo_council:0:f', 'fo_drill:1:f', 'fo_clinic:0:f']) {
            const l = DAY_REPLIES[k]; assert(Array.isArray(l) && l.length === 3 && new Set(l).size === 3 && l.every((x) => !bad(x)), `P9A (FF): ${k} has three failure texts (${l?.length})`);
        }
        const pl = (id, flags) => { const g = ensureBars(fresh(9800)); Object.assign(g.flags, flags); g.scene = id; const p = SCENES[id].place; return typeof p === 'function' ? p(g) : p; };
        assert(pl('ya_found', { ya_waited: true }) !== pl('ya_found', {}), 'P9A (P5): ya_found is placed by the branch');
        assert(new Set(['rr', 'dw', 'ah'].map((r) => pl('mei_bond', { bl_region: r }))).size === 3, 'P9A (P5): mei_bond is placed by the region');
        const { LF_DRILL } = await import('../js/story/longforest.js');
        assert(Array.isArray(LF_DRILL.t3Fail) && LF_DRILL.t3Fail.length === 3, 'P9A (P8): the spar has its own failure pool');
        { const g = ensureBars(fresh(9810)); g.coil.n = 2; g.scene = 'lf_spar'; const out = SCENES.lf_train.choices[2].failDo(g); assert(out.some((x) => LF_DRILL.t3Fail.includes(x)), 'P9A (P8): the spar\'s failure draws its pool'); }
        { const g = ensureBars(fresh(9820)); g.coil.n = 2; g.flags.lf_last = 'lf_heartless'; g.flags.lf_trials_won = 1; g.scene = 'lf_trial_won'; const t = SCENES.lf_trial_won.text(g);
          assert(/Heartless/.test(t) && !bad(t), 'P9A (P8): the Heartless has its own grave win text'); }
    }
    // RV1 TG1: a failed Wilds drill still uses up its day; TG3 the Heartless's own win; TG4 ya_found's two places; TG6 the road;
    // TG10 mei_bond's day branch takes 10 minutes in every region (C1); C2 a save resting in an emptied menu opens on its hub
    {
        for (const i of [0, 1, 3]) { const g = ensureBars(fresh(9900 + i)); g.scene = 'wild_train'; g.minutes += 1440; g.james.skills['Convergence Use'] = { tier: 2, level: 1, xp: 0 }; ensureBars(g); const c = SCENES.wild_train.choices[i];
            assert(c.show(g), `TG1: wild_train:${i} shows before`); c.failDo(g); assert(!c.show(g), `TG1: a failed wild_train:${i} uses up its day`); }
        for (const [form, r] of [['cat', 0], ['tiger', 2], ['human', 7]]) for (const won of [1, 3]) {
            const g = ensureBars(fresh(9910)); g.coil.n = 2; g.yuki.realm = r; g.james.realm = r; g.yuki.form = form; g.flags.lf_trials_won = won; g.scene = 'lf_trial_won';
            g.flags.lf_last = 'lf_heartless'; const h = SCENES.lf_trial_won.text(g); g.flags.lf_last = 'lf_root_lurkers'; const o = SCENES.lf_trial_won.text(g);
            assert(/^It is done\. Among the white roots/.test(h) && h !== o && !bad(h), `TG3: the Heartless's own grave win (${form}, won ${won})`);
        }
        { const pl = (flags) => { const g = ensureBars(fresh(9920)); Object.assign(g.flags, flags); const p = SCENES.ya_found.place; return typeof p === 'function' ? p(g) : p; };
          const ah = pl({ ya_waited: true }), other = pl({}); assert(/Ashen/.test(ah) && /burnt gully/.test(other), `TG4: ya_found's places (${ah} / ${other})`); }
        { const g = ensureBars(fresh(9930)); g.flags.a1_outcome = 'taken'; g.scene = 'a1_again'; const again = SCENES.a1_again.text(g); const CS = readFileSync(new URL('../js/story/coil_scenes.js', import.meta.url), 'utf8');
          assert(/up the mountain|up into the mountains/.test(again) && !/down the mountain/.test(again) && !/down the mountain/.test(CS), 'TG6: the Sect is up the mountain in both Coil texts'); }
        for (const r of ['rr', 'dw', 'ah']) {
            const g = ensureBars(fresh(9940)); g.flags.bl_region = r; goTo(g, SCENES, 'mei_bond'); g.flags.mb_day = true; const m0 = g.minutes;
            const v = sceneView(g, SCENES); const i = v.choices.findIndex((x) => /^Catch up with the others/.test(x.label));
            assert(i >= 0, `TG10 (C1): mei_bond's day branch has its way out (${r})`); if (i >= 0) { choose(g, SCENES, v.choices[i].index ?? i);
            assert(g.minutes - m0 === 10, `TG10 (C1): leaving mei_bond's day branch in ${r} takes 10 minutes (${g.minutes - m0})`); }
        }
        const { deadMenuHub } = await import('../js/core/tasks.js');
        for (const [sc, flags, hub] of [['wild_hunt', {}, 'wilds'], ['wild_train', {}, 'wilds'], ['bl_train', { bl_region: 'rr' }, 'rr_hub'], ['bl_train', { bl_region: 'dw' }, 'dw_hub'], ['bl_train', { bl_region: 'ah' }, 'ah_hub'], ['lf_trials', {}, 'lf_hub'], ['wilds', {}, null]]) {
            const g = ensureBars(fresh(9950)); g.scene = sc; Object.assign(g.flags, flags);
            assert(deadMenuHub(g, SCENES) === hub, `P9A (RV1, C2): a save resting in ${sc} opens on ${hub} (${deadMenuHub(g, SCENES)})`);
        }
    }
    // RV1 TG5: the notebook's sky count at realms 0, 1, 2; TG7: Wen and Lu Han's middle branch by measure, not by count (n 1, 5, 9)
    {
        for (const [r, want] of [[0, /has not yet tried to strike me/], [1, /strike me 1 time and/], [2, /strike me 2 times and/]]) {
            const g = ensureBars(fresh(9960)); g.coil.n = 2; g.james.realm = r; g.yuki.realm = r; g.scene = 'lf_notes'; const t = SCENES.lf_notes.text(g);
            assert(want.test(t) && !/\b0 time/.test(t), `TG5: the notebook's sky at realm ${r}`);
        }
        const PS = readFileSync(new URL('../js/story/prologue.js', import.meta.url), 'utf8');
        for (const [n, w] of [[1, 'faintly'], [5, 'plainly'], [9, '']]) {
            const g = ensureBars(fresh(9970)); g.yuki.primaries = n;
            const lines = Object.keys(SCENES).map((k) => { const s = SCENES[k]; if (typeof s.text !== 'function') return ''; try { return s.text(g); } catch { return ''; } }).filter((x) => /You eat no pills|No pill-smell/.test(x));
            assert(lines.length >= 2 && lines.every((x) => !/\b\d+ times\b|\bOnce the steam\b|\bonce since\b/.test(x)) && (!w || lines.some((x) => x.includes(w))), `TG7: n ${n}: Wen and Lu Han by measure (${lines.length})`);
        }
        void PS;
    }
    // P2 (run C): the emptied menus are menus and empty; the Wilds drills' failures speak by day
    {
        const menuOf = (id) => Object.values(TASK_HUBS).some((h) => (h.menus || {})[id] || (h.doorMenus || {})[id]);
        for (const id of DEAD_MENUS) {
            const g = ensureBars(fresh(9700)); g.scene = id; const s = SCENES[id]; const tx = typeof s.text === 'function' ? s.text(g) : s.text;
            assert(menuOf(id) && tx === '' && (s.choices || []).length >= 2, `P9A (P2, P5, P8): ${id} is a work menu whose never-drawn text is empty`);
        }
        for (const [i, k] of [[0, 'wild_train:0:f'], [1, 'wild_train:1:f'], [3, 'wild_train:3:f']]) {
            const l = DAY_REPLIES[k];
            assert(Array.isArray(l) && l.length === 2 && l[0] !== l[1] && l.every((x) => typeof x === 'string' && x.split(/\s+/).length >= 8 && !bad(x)), `P9A (P2): ${k} has two failure lines`);
            const c = SCENES.wild_train.choices[i]; const g = ensureBars(fresh(9710 + i)); g.scene = 'wild_train'; const out = c.failDo(g);
            assert(out.some((x) => l.includes(x)), `P9A (P2): the ${['darts', 'blade', '', 'needles'][i]} drill's failure says its line`);
        }
    }
}

// v0.11.175 (owner pick P8A; Fable's rewrite of part 8, the Long Forest): OT the older text, CO the second Coil (he knows the week),
// DY the first screen on day 0, YF Yuki's three forms (the morning, the autumn season, the trials' win, the storm, Fang Wei's look),
// FX (no weeks counted, eight or nine hundred years, the hare's miss, the pony, the secret of her voice), RP the daily scenes' later
// visits (world flags lf_seen_<key>, per Coil), SW the drills' lines (the picker), SS a season line per rung, IN the ten intros
// emptied (never shown), YA Yuki's form scenes, ST the ten fights' stomp texts; the scenes' ids, labels, places, art, targets, times
// and checks pinned as in v0.11.174
{
    const { LONGFOREST, LF_DRILL } = await import('../js/story/longforest.js');
    const { lfSeason } = await import('../js/story/prologue.js');
    const LSRC = readFileSync(new URL('../js/story/longforest.js', import.meta.url), 'utf8'), PSRC = readFileSync(new URL('../js/story/prologue.js', import.meta.url), 'utf8');
    const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
    const L = (seed, form, realm, flags = {}, hour = 10) => { const g = ensureBars(fresh(seed)); g.coil.n = 2; g.yuki.realm = Math.max(realm, { cat: 0, tiger: 2, human: 7 }[form]); g.james.realm = g.yuki.realm; g.yuki.form = form; g.minutes = 2 * 1440 + hour * 60; Object.assign(g.flags, { longforest: true, lf_active: true, lf_days: 0 }, flags); return ensureBars(g); };
    const bad = (t) => typeof t !== 'string' || /TODO|\$\{|undefined|\bNaN\b|\[object|\bnull\b/.test(t);
    const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
    const results = (g, c) => { const out = []; if (c.show && !c.show(g)) return out; for (const f of [c.do, c.failDo]) if (typeof f === 'function') { const h = JSON.parse(JSON.stringify(g)); try { out.push(...(f(ensureBars(h)) || []).filter((x) => typeof x === 'string')); } catch (e) { out.push(`ERR ${e.message}`); } } return out; }; // only the choices on screen
    let seed = 8800;
    // every Long Forest scene: three forms, realms 0/3/9, days 0 and 4, both encounters, first and later visits, with its choices' results
    const KEYS = ['falls', 'ride', 'notes', 'bored', 'bathe', 'bone', 'mire', 'ridge', 'storm', 'roots', 'trial_lost', 'lf_bandits', 'lf_rogue'];
    let n = 0; const badL = [];
    for (const id of Object.keys(LONGFOREST)) for (const [form, r0] of FORMS) for (const realm of [r0, 3, 9]) for (const days of [0, 4]) for (const who of ['lf_bandits', 'lf_rogue']) for (const vis of [0, 2]) {
        const flags = { lf_days: days, lf_human: who, lf_last: who, lf_trials_won: vis ? 3 : 1, lf_seasons: 1 + (realm % 4) };
        for (const k of KEYS) if (vis) flags[`lf_seen_${k}`] = vis;
        const g = L(seed++, form, realm, flags); g.scene = id;
        let t; try { t = txt(id, g); } catch (e) { t = `ERR ${e.message}`; }
        const res = (SCENES[id].choices || []).flatMap((c) => results(g, c));
        n++; if (bad(t) || res.some(bad)) badL.push(`${id}/${form}/${realm}/${vis}`);
    }
    assert(n > 2000 && !badL.length, `P8A: every Long Forest scene renders clean in every form, realm, day, encounter and visit, with its choices' results (${n}; ${[...new Set(badL)].slice(0, 6)})`);
    // RP: the first visit reads the first text, a later visit another; the counter is a plain world flag per key
    for (const [id, k] of [['lf_falls', 'falls'], ['lf_ride', 'ride'], ['lf_notes', 'notes'], ['lf_bored', 'bored'], ['lf_bathe', 'bathe'], ['lf_bone_depths', 'bone'], ['lf_black_mire', 'mire'], ['lf_thunder_ridge', 'ridge'], ['lf_storm', 'storm'], ['lf_old_roots', 'roots'], ['lf_trial_lost', 'trial_lost']]) {
        const g = L(seed++, 'cat', 3, { lf_last: 'lf_bone_hounds' }); const m0 = g.minutes;
        goTo(g, SCENES, id); const first = sceneView(g, SCENES).text;
        assert(g.flags[`lf_seen_${k}`] === 1, `P8A (RP): ${id} counts its first visit (${g.flags[`lf_seen_${k}`]})`);
        goTo(g, SCENES, 'lf_hub'); g.minutes += 1440; goTo(g, SCENES, id); const again = sceneView(g, SCENES).text; // v0.11.175 (RV1, C7): a later visit is another day
        assert(g.flags[`lf_seen_${k}`] === 2 && first !== again && again.length > 60 && !bad(again), `P8A (RP): ${id}'s later visit has its own text`);
        void m0;
    }
    for (const who of ['lf_bandits', 'lf_rogue']) {
        const g = L(seed++, 'cat', 3); const meet = () => { goTo(g, SCENES, 'lf_wanderers'); g.flags.lf_human = who; g.flags.lf_last = who; g.flags[`lf_seen_${who}`] = (g.flags[`lf_seen_${who}`] || 1); return txt('lf_wanderers', g); };
        const a = meet(); const ta = txt('lf_human_talked', g), wa = txt('lf_human_won', g), la = txt('lf_human_lost', g);
        g.flags[`lf_seen_${who}`] = 2; const b = txt('lf_wanderers', g), tb = txt('lf_human_talked', g), wb = txt('lf_human_won', g), lb = txt('lf_human_lost', g);
        assert(a !== b && ta !== tb && wa !== wb && la !== lb && ![b, tb, wb, lb].some(bad), `P8A (RP): ${who} met again: their own meeting, talk, win and robbery texts`);
    }
    { const g = L(seed++, 'cat', 3, { lf_last: 'lf_ossuary' }); goTo(g, SCENES, 'lf_trial_won'); const w1 = sceneView(g, SCENES).text; goTo(g, SCENES, 'lf_trial_won'); const w2 = sceneView(g, SCENES).text;
      assert(g.flags.lf_trials_won === 2 && w1 !== w2 && /Ossuary Wyrm/.test(w2), `P8A (RP): the second trial won reads its own text and names the beast (${w2.slice(0, 80)})`); }
    { const g = L(seed++, 'human', 7); goTo(g, SCENES, 'lf_ride'); g.minutes += 1440; goTo(g, SCENES, 'lf_ride'); const c = SCENES.lf_ride.choices[0]; const r = c.do(g);
      assert(typeof r[0] === 'string' && !/The flat ones from the slow water/.test(r[0]) && !bad(r[0]), 'P8A (RP): the ride\'s later thanks is its own line'); }
    { const g = L(seed++, 'cat', 3); goTo(g, SCENES, 'lf_falls'); const snap = JSON.parse(JSON.stringify(g)); const s2 = deserialize(serialize(g));
      assert(s2.flags.lf_seen_falls === 1 && snap.flags.lf_seen_falls === 1, 'P8A (RP): the visit counter survives a save'); }
    // SW: the drills speak, each list in turn (all three before any comes back)
    for (const [i, k, kf] of [[0, 't1', 't1Fail'], [1, 't2', 't2Fail'], [2, 't3', 't3Fail'], [3, 't4', 't4Fail']]) {
        const c = SCENES.lf_train.choices[i]; const g = L(seed++, 'cat', 3);
        const seen = new Set(); for (let j = 0; j < 3; j++) seen.add(c.do(g).find((x) => LF_DRILL[k].includes(x)));
        assert(seen.size === 3, `P8A (SW): ${k}'s three lines before any comes back (${seen.size})`);
        if (kf) { const f = new Set(); for (let j = 0; j < 3; j++) f.add(c.failDo(g).find((x) => LF_DRILL[kf].includes(x))); assert(f.size === 3, `P8A (SW): ${kf}'s three lines (${f.size})`); }
    }
    assert(Object.values(LF_DRILL).flat().every((x) => !bad(x) && x.length > 30) && new Set(Object.values(LF_DRILL).flat()).size === 24, 'P8A (SW): 24 drill lines, all different (v0.11.177, P9A: the spar\'s three failure lines)');
    // SS: a season line per rung
    { const g = L(seed++, 'cat', 0); g.james.realm = 0; g.yuki.realm = 0; const got = [];
      for (let r = 1; r <= 14; r++) { const out = lfSeason(g); got.push(out[0]); assert(/^Realm: /.test(out[1]) && g.james.realm === r, `P8A (SS): the season to rung ${r} keeps its mechanical line`); }
      assert(new Set(got).size === 14 && got.every((x) => !bad(x) && x.length > 40) && !/SS TODO/.test(PSRC), `P8A (SS): fourteen season lines, one per rung (${new Set(got).size})`); }
    // DY, YF
    { const g0 = L(seed++, 'cat', 0, { lf_days: 0 }), g1 = L(seed++, 'cat', 0, { lf_days: 1 });
      assert(!/stopped counting/.test(txt('lf_hub', g0)) && /stopped counting/.test(txt('lf_hub', g1)), 'P8A (DY): the hub counts nothing on day 0, has stopped counting from day 1'); }
    for (const [id, flags] of [['lf_morning', { lf_days: 6 }], ['lf_seclusion', { lf_seasons: 4 }], ['lf_trial_won', { lf_last: 'lf_ossuary', lf_trials_won: 1 }], ['lf_storm', {}], ['lf_wanderers', { lf_human: 'lf_rogue' }]]) {
        const t = FORMS.map(([form]) => txt(id, L(seed++, form, 7, flags)));
        assert(new Set(t).size === 3 && t.every((x) => !bad(x)), `P8A (YF): ${id} by Yuki's form`);
    }
    // FX, CO, IN
    assert(!/several weeks|for a long moment|a good deal|size of a pony|Don't tell anyone I can talk|I know nothing about this world|Your people live for nine hundred|Rainbows, then nothing|gold eyes, level/.test(LSRC) && /eight or nine hundred/.test(LSRC), 'P8A (FX, CO): the fixed phrases are gone; his people\'s eight or nine hundred years');
    { const intros = [...LSRC.matchAll(/intro: '([^']*)'/g)].map((m) => m[1]);
      const ids = ['lf_bone_hounds', 'lf_ossuary', 'lf_mire_brood', 'lf_bog_mother', 'lf_storm_hawks', 'lf_thunder_ram', 'lf_root_lurkers', 'lf_heartless', 'lf_bandits', 'lf_rogue'];
      assert(intros.length === 10 && intros.every((x) => x === '') && ids.every((id) => typeof STOMP[id]?.posture === 'function' && STOMP[id].win?.[2] && STOMP[id].win?.[3] && STOMP[id].one), 'P8A (IN): the ten intros emptied, each fight opened by its posture at every degree');
      let k = 0; for (const id of ids) for (const [form] of FORMS) for (const d of [1, 2, 3]) { const g = L(seed++, form, 7); const p = STOMP[id].posture(g, d), w = STOMP[id].win[d === 1 ? 2 : d](g), o = STOMP[id].one(g); k++; assert(![p, w, o].some(bad), `P8A (ST): ${id} as ${form} at degree ${d}`); }
      assert(k === 90, 'P8A (ST): ninety stomp renders'); }
    // the scenes' frame as in v0.11.174 (ids, titles, places, art, labels, targets, times, checks)
    { const lab = (c) => (typeof c.text === 'function' ? '(fn)' : c.text); const out = {};
      for (const id of Object.keys(LONGFOREST)) { const s = SCENES[id]; out[id] = [s.title, typeof s.place === 'string' ? s.place : '(fn)', typeof s.art === 'string' ? s.art : '(fn)', (s.choices || []).map((c) => [lab(c), typeof c.to === 'string' ? c.to : '(fn)', c.time || 0, c.check ? `${c.check.skill}/${c.check.dc}` : ''].join('|'))]; }
      const h = createHash('sha1').update(JSON.stringify(out)).digest('hex');
      assert(h === '43a749b3c08ec57ad5bd516a36862fb7b300e3ab', // v0.11.179 (LB1): re-pinned for the label pass's Long Forest labels; v0.11.203 (T1, TS1): the way back's label names its day by the calendar ((fn))
         `P8A: the Long Forest's ids, titles, places, art, labels, targets, times and checks as in v0.11.174 (${h}; update only with a push that means to change them)`); }
}
// v0.11.175 (owner pick RV1; Fable's cold review of part 8, TG1–TG14): a visit counted once a day (C1/C2: the storm's way down the
// ridge, a zone twice a day), the encounters' second fight openings (T6/C3), the great form's scene before the human one (T8), the
// lint reading the later texts (C4); first and later texts each in their place, the drills' pools, the season by rung, the forms, the
// real flow of a second meeting, the people named, the beasts named, the daily marks, the rewind, the frame, no weeks on day 0
{
    const { LONGFOREST, LF_DRILL } = await import('../js/story/longforest.js');
    const { lfSeason, SEASON_LINES } = await import('../js/story/prologue.js');
    const FORMS = [['cat', 0], ['tiger', 2], ['human', 7]];
    const L = (seed, form, realm, flags = {}, hour = 10) => { const g = ensureBars(fresh(seed)); g.coil.n = 2; g.yuki.realm = Math.max(realm, { cat: 0, tiger: 2, human: 7 }[form]); g.james.realm = g.yuki.realm; g.yuki.form = form; g.minutes = 2 * 1440 + hour * 60; Object.assign(g.flags, { longforest: true, lf_active: true, lf_days: 0 }, flags); return ensureBars(g); };
    const txt = (id, g) => { const t = SCENES[id].text; return typeof t === 'function' ? t(g) : t; };
    const nextDay = (g) => { goTo(g, SCENES, 'lf_hub'); g.minutes += 1440; };
    let seed = 9100;
    // TG12 (C1, C2): the ridge, the storm and back down: one visit; a zone twice in a day: one; the next day: the later text
    { const g = L(seed++, 'cat', 3); goTo(g, SCENES, 'lf_thunder_ridge'); const r1 = sceneView(g, SCENES).text; goTo(g, SCENES, 'lf_storm'); goTo(g, SCENES, 'lf_thunder_ridge'); const r2 = sceneView(g, SCENES).text;
      assert(g.flags.lf_seen_ridge === 1 && g.flags.lf_seen_storm === 1 && r1 === r2, `TG12 (C1): the storm's way back down counts no second visit (${g.flags.lf_seen_ridge})`);
      for (let i = 0; i < 3; i++) { goTo(g, SCENES, 'lf_hub'); goTo(g, SCENES, 'lf_bone_depths'); }
      assert(g.flags.lf_seen_bone === 1, `TG12 (C2): a zone three times in a day is one visit (${g.flags.lf_seen_bone})`);
      nextDay(g); goTo(g, SCENES, 'lf_thunder_ridge'); assert(g.flags.lf_seen_ridge === 2 && sceneView(g, SCENES).text !== r1, 'TG12: the next day reads the later text'); }
    // TG2: one save, three days, the drills each day through a save: three different lines each, seven pools of their own
    { let g = L(seed++, 'cat', 3); const got = {};
      for (let d = 0; d < 3; d++) {
          for (const [i, k, kf] of [[0, 't1', 't1Fail'], [1, 't2', 't2Fail'], [2, 't3', 't3Fail'], [3, 't4', 't4Fail']]) { const c = SCENES.lf_train.choices[i]; (got[k] ||= []).push(c.do(g).find((x) => LF_DRILL[k].includes(x))); if (kf) (got[kf] ||= []).push(c.failDo(g).find((x) => LF_DRILL[kf].includes(x))); }
          g = ensureBars(deserialize(serialize(g))); g.minutes += 1440;
      }
      assert(Object.entries(got).every(([, v]) => new Set(v).size === 3 && v.every(Boolean)), `TG2: each drill's three lines over three days, through saves (${Object.entries(got).map(([k, v]) => `${k} ${new Set(v).size}`)})`);
      const pools = Object.keys(g.lines?.p || {}).filter((k) => /^lf_t/.test(k)).sort();
      assert(JSON.stringify(pools) === JSON.stringify(['lf_t1', 'lf_t1Fail', 'lf_t2', 'lf_t2Fail', 'lf_t3', 'lf_t3Fail', 'lf_t4', 'lf_t4Fail']), `TG2: eight drill pools, by name (v0.11.177, P9A: the spar's lf_t3Fail) (${pools})`); }
    // TG1: each scene's first text on the first visit and its later text after (markers of each)
    for (const [id, k, f, l] of [['lf_falls', 'falls', /An hour upstream a waterfall/, /The cliff has not moved/], ['lf_ride', 'ride', /In her great form Yuki is the size of a Bengal tiger/, /still does not do saddles/],
        ['lf_notes', 'notes', /\*Key finding/, /\*Further entries/], ['lf_bored', 'bored', /a bone mouse on a thread/, /So you compete with yourself/], ['lf_bathe', 'bathe', /a flat rock for your coat/, /The same cold black river/],
        ['lf_bone_depths', 'bone', /Beyond the giant skulls/, /raked smooth, by wind or by something tidy/], ['lf_black_mire', 'mire', /The mire beyond the mire/, /The ink has closed over/],
        ['lf_thunder_ridge', 'ridge', /A spine of black rock above the treeline/, /The ridge again/], ['lf_storm', 'storm', /like the idiot in a/, /You take the top rock again/],
        ['lf_old_roots', 'roots', /Deeper in than the Hollow/, /The white roots lie as you left them/], ['lf_trial_lost', 'trial_lost', /You lose\. It happens\./, /You lose again\./]]) {
        const g = L(seed++, 'cat', 3, { lf_last: 'lf_bone_hounds' }); goTo(g, SCENES, id); const a = sceneView(g, SCENES).text; nextDay(g); goTo(g, SCENES, id); const b = sceneView(g, SCENES).text;
        assert(f.test(a) && !l.test(a) && l.test(b) && !f.test(b), `TG1: ${id}: the first text first, the later one after`);
    }
    // TG3: the season line by rung (with the old count of seasons set, which no longer decides)
    { const g = L(seed++, 'cat', 0); g.james.realm = 0; g.yuki.realm = 0; g.flags.lf_seasons = 5; const got = [];
      for (let r = 1; r <= 14; r++) got.push(lfSeason(g)[0]);
      assert(/ledge above the falls/.test(got[0]) && /poured soft at/.test(got[2]) && /second attention/.test(got[5]) && /committee/.test(got[6]) && /top rung/.test(got[13]) && got.every((x, i) => x === SEASON_LINES[i]), `TG3: rung 1 the ledge, 3 the set centre, 6 the second attention, 7 the committee, 14 the top rung (${got.map((x) => x.slice(0, 20))})`); }
    // TG4: the form spots, first and later: the cat and the great root-kin never speak aloud, the woman does
    { const SPOTS = [['lf_morning', { lf_days: 6 }], ['lf_seclusion', { lf_seasons: 4 }], ['lf_trial_won', { lf_last: 'lf_ossuary', lf_trials_won: 1 }], ['lf_trial_won', { lf_last: 'lf_ossuary', lf_trials_won: 2 }], ['lf_storm', {}], ['lf_storm', { lf_seen_storm: 2 }]];
      for (const [id, flags] of SPOTS) {
          const t = FORMS.map(([form]) => txt(id, L(seed++, form, 7, flags)));
          const own = t.map((x, i) => x.split(/(?<=[.!?*"])\s+/).filter((sen) => !t.some((y, j) => j !== i && y.includes(sen))).join(' '));
          assert(new Set(t).size === 3 && !/["“]/.test(own[0]) && !/["“]/.test(own[1]) && (id === 'lf_morning' || /["“]/.test(own[2])), `TG4: ${id} ${JSON.stringify(flags)}: the cat and the great root-kin through the bond, the woman aloud (${own.map((x) => x.slice(0, 50))})`);
      } }
    // TG5: a second meeting by the real flow (the test writes no counter): first texts, then the later ones; the fight opens on it too
    for (const who of ['lf_bandits', 'lf_rogue']) {
        const g = L(seed++, 'cat', 3); let met = 0, first = null, later = null, p1 = null, p2 = null;
        for (let day = 0; day < 40 && met < 2; day++) {
            goTo(g, SCENES, 'lf_wanderers');
            if (g.flags.lf_human === who) { met++; const t = sceneView(g, SCENES).text, p = STOMP[who].posture(g, 2); if (met === 1) { first = t; p1 = p; assert(g.flags[`lf_seen_${who}`] === 1, `TG5: ${who} counted once at the first meeting`); } else { later = t; p2 = p; } }
            nextDay(g);
        }
        assert(met === 2 && g.flags[`lf_seen_${who}`] === 2 && first !== later && p1 !== p2 && !/TODO/.test(later + p2), `TG5 (T6): ${who} met twice: the later meeting and its own fight opening (${met})`);
    }
    // TG6: the later texts name their own people (and Fang Wei's later meeting doesn't name him before he says it)
    for (const who of ['lf_bandits', 'lf_rogue']) {
        const g = L(seed++, 'cat', 3, { lf_human: who, lf_last: who, [`lf_seen_${who}`]: 2 });
        const t = ['lf_wanderers', 'lf_human_talked', 'lf_human_won'].map((id) => txt(id, g)).join('\n') + STOMP[who].posture(g, 1);
        assert(who === 'lf_bandits' ? /Tan/.test(t) && !/Fang Wei/.test(t) : !/\bTan\b|Tans/.test(t), `TG6: ${who}'s later texts are their own`);
        if (who === 'lf_rogue') assert(!/Fang Wei/.test(txt('lf_wanderers', g)), 'TG6 (T6): the later meeting doesn\'t name Fang Wei before he does');
    }
    // TG7: the first trial win names its beast, every fight of the zones
    for (const id of ['lf_bone_hounds', 'lf_ossuary', 'lf_mire_brood', 'lf_bog_mother', 'lf_storm_hawks', 'lf_thunder_ram', 'lf_root_lurkers', 'lf_heartless']) {
        const g = L(seed++, 'cat', 3, { lf_last: id, lf_trials_won: 1 }); const t = txt('lf_trial_won', g);
        assert(/Bone-hound|Ossuary Wyrm|Mire-brood|Bog-Mother|Storm-hawk|Thunder-horn Ram|Root-lurker|Heartless/.test(t) && !/\b[Tt]he [Tt]he\b/.test(t), `TG7: ${id}'s win names it (${t.slice(0, 120)})`);
    }
    // TG8: each daily scene marks its day: its hub card is gone after a visit
    for (const [id, re] of [['lf_falls', /cold falls/], ['lf_ride', /Ride Yuki/], ['lf_notes', /Take stock/], ['lf_bored', /Yuki is bored/], ['lf_bathe', /Wash in the river/], ['lf_wanderers', /game trails/]]) {
        const g = L(seed++, 'tiger', 3, { lf_days: 2 }); const card = () => SCENES.lf_hub.choices.find((c) => typeof c.text === 'string' && re.test(c.text));
        assert(card() && card().show(g), `TG8: ${id}'s card shows before`); goTo(g, SCENES, id); assert(!card().show(g), `TG8: ${id} marks its day`);
    }
    // TG9: a rewind clears the counters, the day flags and the drill pools
    { const g = L(seed++, 'cat', 3); goTo(g, SCENES, 'lf_falls'); SCENES.lf_train.choices[0].do(g); rewind(g);
      assert(!Object.keys(g.flags).some((k) => /^lf_seen_/.test(k)) && !Object.keys(g.lines?.p || {}).some((k) => /^lf_t/.test(k)) && !KEEP_FLAGS.some((f) => /lf_seen/.test(f)), 'TG9: a rewind forgets the visits and the drills'); }
    // TG10: the frame, wider: Qi costs, the checks' bands and bonuses and xpTo, gives, and the code of every do, failDo and enter with its strings taken out
    { const strip = (f) => (typeof f === 'function' ? f.toString().replace(/`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, 'S') : String(f ?? ''));
      const out = {}; for (const id of Object.keys(LONGFOREST)) { const s = SCENES[id]; out[id] = [strip(s.enter), (s.choices || []).map((c) => [c.qi || 0, c.check ? `${c.check.band || ''}/${c.check.xpTo || ''}/${c.check.bonus ? strip(c.check.bonus) : ''}` : '', (c.gives || []).join(','), strip(c.do), strip(c.failDo), strip(c.show)].join('|'))]; }
      const h = createHash('sha1').update(JSON.stringify(out)).digest('hex');
      assert(h === '5ffabaa6ff1cfbdb9aa71d8ce83f31bc0906845e', `TG10: the Long Forest's code with its strings taken out, as in v0.11.213 (re-pinned: daily()'s body, the S3 spacing in common.js; no Long Forest key is spaced) (v0.11.177's P9A: the dead menus, the spar's pool, the Heartless's win; v0.11.207's RV1 L2: the seclusion's Saturation ÷satDiv) (${h}; update only with a push that means to change it)`); }
    // TG11: the first visits on day 0 count no weeks, months or days
    for (const id of Object.keys(LONGFOREST)) for (const [form] of FORMS) { const g = L(seed++, form, 7); g.scene = id; let t = ''; try { t = txt(id, g); } catch { t = ''; } const SPENT = /\b(?:several|many|for|after) (?:weeks|months|days)\b|\bweeks of\b|\ba while ago\b/; assert(!SPENT.test(t), `TG11: ${id} as ${form} on day 0 counts no time spent here (${(t.match(/.{0,30}(?:weeks|months|days|a while ago).{0,20}/) || [''])[0]})`); } // a week's walk, this week (the prologue's), a lie's month: not time spent here
    // TG13 (C5): a drill card on the task screen shows a drill line in every band it reaches
    { const lf0 = deserialize(readFileSync(new URL('../saves/v0.11.7-long-forest-coil2.json', import.meta.url), 'utf8')); const bands = new Set();
      for (const tier of [1, 3, 6, 9]) for (let i = 0; i < 4; i++) { const g = ensureBars(deserialize(serialize(lf0))); g.james.gu = { tier, level: 5, xp: 0 }; g.james.qi = 60; g.james.satiety = 80; g.seed += i;
          const card = taskCards(g, SCENES).find((c) => c.id === `lf_train:${i}`); if (!card || card.status !== 'open') continue;
          const r = runTask(g, SCENES, card.id); bands.add(card.check?.band); const all = Object.values(LF_DRILL).flat();
          assert(r.lines.some((x) => all.includes(x)), `TG13 (C5; v0.11.177 RV1 TG9: the spar has its own pool, no exceptions): lf_train:${i} at T${tier} (${card.check?.band}) shows a drill line (${r.lines.slice(0, 3)})`); }
      assert(bands.size >= 2, `TG13: more than one band reached (${[...bands]})`); }
    // TG14 (C4): the lint reads the Long Forest's later texts, the drills and the season lines (the saved snapshot; v0.11.177, P9A: 24 drill lines with the spar's three)
    { const snap = JSON.parse(readFileSync(new URL('../tools/text-baseline.json', import.meta.url), 'utf8'));
      assert(snap.pools?.lf_drill?.lines === 24 && snap.pools?.lf_season?.lines === 14 && snap.areas.longforest.variantWords > 4000, `TG14 (C4): the lint's pools and the later-visit samples (${snap.pools?.lf_drill?.lines}, ${snap.pools?.lf_season?.lines}, ${snap.areas?.longforest?.variantWords})`); }
    // T8: the great form's scene before the human one
    { const g = L(seed++, 'human', 7); g.flags.yuki_tiger_seen = false; g.flags.yuki_human_seen = false;
      const hum = SCENES.lf_hub.choices.find((c) => c.to === 'yuki_human_awaken'), tig = SCENES.lf_hub.choices.find((c) => c.to === 'yuki_tiger_awaken');
      assert(tig.show(g) && !hum.show(g), 'T8: the great form\'s scene comes first'); g.flags.yuki_tiger_seen = true; assert(hum.show(g) && !tig.show(g), 'T8: then the human one'); }
}
// v0.11.137 (owner pick HV1): whose relationships are tracked (RL): Yuki, Mei Lin and Ya (romance), Old Wen and Mother (non-romantic),
// the Village (friendship only); Old Hu dropped (HD): nothing moves him, an old save keeps his numbers. The James tab: tools/browser.py hv1.
{
    const dir = new URL('../js/', import.meta.url);
    const src = ['story', 'core'].flatMap((d) => readdirSync(new URL(`${d}/`, dir)).filter((f) => f.endsWith('.js')).map((f) => readFileSync(new URL(`${d}/${f}`, dir), 'utf8'))).join('\n');
    const lit = [...src.matchAll(/bumpRel\(g, '([^']+)'/g)];
    const who = new Set(lit.map((m) => m[1]));
    const main = readFileSync(new URL('main.js', dir), 'utf8');
    assert(lit.length === (src.match(/bumpRel\(/g) || []).length - 1 && !/bumpRel\(/.test(main), `HV1 (T, Fable L4): every bumpRel call names its person (${lit.length} of ${(src.match(/bumpRel\(/g) || []).length - 1}), none in main.js`); // −1: its own definition
    assert(JSON.stringify([...who].sort()) === JSON.stringify(['Mei Lin', 'Mother', 'Old Wen', 'Village', 'Ya', 'Yuki']), `HV1 (HD): only the tracked people are moved (${[...who].sort().join(', ')})`);
    assert(REL_HIDDEN.length === 1 && REL_HIDDEN[0] === 'Old Hu' && REL_HIDDEN.every((k) => !who.has(k)), 'HV1 (HD): Old Hu hidden and moved nowhere');
    const vil = [...src.matchAll(/bumpRel\(g, 'Village', ([^)]*)\)/g)].map((m) => m[1]);
    assert(vil.length > 0 && vil.every((a) => /^[^,]+, 0$/.test(a.trim())), `HV1 (VD; Fable L3): every Village move leaves affection at 0 (${vil.filter((a) => !/^[^,]+, 0$/.test(a.trim())).join(' | ') || vil.length})`);
    for (const id of ['ya_won', 'ya_lost']) {
        const g = ensureBars(fresh(5401)); g.rel['Old Hu'] = { f: 9, a: 0 }; g.scene = id;
        SCENES[id].enter(g);
        assert(g.rel['Old Hu'].f === 9 && g.rel.Ya.f > 0, `HV1 (HD): ${id} leaves Old Hu where he was and still moves Ya`);
    }
    const old = ensureBars(migrate(JSON.parse(JSON.stringify({ ...fresh(5402), rel: { 'Old Hu': { f: 12, a: 0 }, Village: { f: 30, a: 0 } } }))));
    assert(old.rel['Old Hu']?.f === 12 && old.rel.Village.f === 30, 'HV1 (T): an old save keeps Old Hu\'s numbers');
    const back = deserialize(serialize(old)); // Fable L2: the save round trip and a rewind, the paths that rebuild g.rel
    assert(back.rel['Old Hu']?.f === 12, `HV1 (T, Fable L2): Old Hu survives a save and load (${JSON.stringify(back.rel['Old Hu'])})`);
    back.coil.peak = { ...(back.coil.peak || {}), 'Old Hu': { f: 12, a: 0 } }; // a real old save: every move of his wrote the Coil's peak
    rewind(back); rewind(back);
    assert(back.rel['Old Hu'] && Number.isFinite(back.rel['Old Hu'].f), `HV1 (T, Fable L2): Old Hu's key survives two rewinds, with the head start (${JSON.stringify(back.rel['Old Hu'])})`);
    assert(REL_MAX === 150, 'HV1 (VD): the Village has the same cap, 150');
}
// v0.11.137 (owner pick TR1, the tree's push 1): Yuki's daily scene (YB), her closing lines by level (YT), her pace (YG-A), her question (YR)
{
    const D = 1440;
    // YB: every resting place has the card, last (no choice position changes), a door card, once a waking day
    for (const hub of Object.keys(YT_HUBS)) {
        const cs = SCENES[hub].choices.filter((c) => !/^(wen|mother)_time$/.test(c.to) && c.to !== 'rt_selene' && !/^(fo_)?pot_cook$/.test(c.to) && !c.preserve), last = cs[cs.length - 1]; // v0.11.209 (TF1, K): and "Smoke the catch."; v0.11.139 (MW1): Wen's and the mother's cards follow hers; v0.11.174 (SL1, SC): and the Selene story on rt_camp; v0.11.181 (SP1, PS): and the cook cards
        assert(last.to === 'yk_time' && last.time === 10 && cs.filter((c) => c.to === 'yk_time').length === 1, `TR1 (YB; DR2): ${hub}'s last choice is Yuki's card, 10 min`);
        assert((TASK_HUBS[hub].doors || []).includes('yk_time'), `TR1 (YB): ${hub} shows it as a door card`);
    }
    // every slot has three texts, every text is used, every pool three lines
    const used = new Set(Object.values(YT_HUBS).flat().flatMap((k) => (typeof k === 'function' ? [k({ flags: { ya_met: true } }), k({ flags: {} })] : [k])));
    assert(used.size === Object.keys(YT_BODY).length && [...used].every((k) => YT_BODY[k]?.length === 3 && YT_BODY[k].every((t) => typeof t === 'string' && t.length > 80)), `TR1 (YB): ${used.size} slots, each with its three texts (${Object.keys(YT_BODY).length} written)`);
    assert(Object.keys(YT_CLOSE).length === 11 && Object.values(YT_CLOSE).every((l) => l.length === 14), 'TR1 (YT); v0.11.152 (RP1, YT14): 11 closing pools of fourteen');
    assert(YT_LABEL.CAT && YT_LABEL.GREAT && YT_LABEL.HUMAN, 'TR1 (YB): a label per form');
    const YG = (seed, form, hub, rel = { f: 0, a: 0 }, flags = {}) => {
        const g = ensureBars(fresh(seed)); g.minutes = (hub.startsWith('fo_') ? 8 : hub.startsWith('rr') ? 10 : 3) * D + 600;
        const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0; g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
        Object.assign(g.flags, flags); g.rel = { ...g.rel, Yuki: { ...rel } }; goTo(ensureBars(g), SCENES, hub); return g;
    };
    const tap = (g) => { const i = SCENES[g.scene].choices.findIndex((c) => c.to === 'yk_time'); return choose(g, SCENES, i); };
    // YG-A: +3 then +2, friendship and affection; once a waking day; by form; the closer by level
    {
        const g = YG(63001, 'cat', 'ashfall'); tap(g);
        assert(g.scene === 'yk_time' && g.rel.Yuki.f === 3 && g.rel.Yuki.a === 3, `TR1 (YG-A): the first scene +3 / +3 (${JSON.stringify(g.rel.Yuki)})`);
        const t = sceneView(g, SCENES).text;
        assert(t.startsWith(YT_BODY['ashfall:1'][0]) && YT_CLOSE['CAT LOW'].some((l) => t.endsWith(l)), 'TR1 (YB, YT): the cat\'s first Ashfall text, a CAT LOW closer');
        assert(sceneView(g, SCENES).text === t, 'TR1 (YT): the closer stays the same on a redraw');
        choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => c.label === 'Go on.').index);
        assert(g.scene === 'ashfall' && !SCENES.ashfall.choices.at(-1).show(g), `TR1 (YB): back at the place, the card done for today (${g.scene})`);
        sleepUntil(g, 6); goTo(g, SCENES, 'ashfall'); tap(g);
        assert(g.rel.Yuki.f === 5 && g.rel.Yuki.a === 5 && sceneView(g, SCENES).text.startsWith(YT_BODY['ashfall:2'][0]), `TR1 (YG-A, YB): the next day +2 / +2 and the second text (${JSON.stringify(g.rel.Yuki)})`);
    }
    for (const [form, k] of [['tiger', 1], ['human', 2]]) {
        const g = YG(63010 + k, form, 'rr_hub', { f: 40, a: 10 }); tap(g);
        const t = sceneView(g, SCENES).text, pool = form === 'tiger' ? 'GREAT MID' : 'HUMAN MID';
        assert(t.startsWith(YT_BODY['rr_hub:1'][k]) && YT_CLOSE[pool].some((l) => t.endsWith(l)), `TR1 (YB, YT): ${form} reads its own text and a ${pool} closer`);
    }
    for (const [path, pool] of [['lover', 'HUMAN HIGH LOVER'], ['sister', 'HUMAN HIGH SISTER'], [null, 'HUMAN HIGH UNDECIDED']]) {
        const g = YG(63020, 'human', 'rr_hub', { f: 20, a: 80 }, path ? { yk_path: path } : {});
        assert(ytPool(g) === pool, `TR1 (YT): human at 72+ with ${path || 'no'} path reads ${pool} (${ytPool(g)})`);
    }
    assert(ytPool(YG(63021, 'tiger', 'rr_hub', { f: 90, a: 0 })) === 'GREAT HIGH', 'TR1 (YT): the higher of the two numbers sets the level');
    // the Fallout's second day: before or after Ya's arrival
    for (const [met, key] of [[false, 'fo_ashfall:2-before-ya'], [true, 'fo_ashfall:2']]) {
        const g = YG(63030, 'cat', 'fo_ashfall', undefined, met ? { ya_met: true } : {}); tap(g); choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => c.label === 'Go on.').index);
        sleepUntil(g, 6); goTo(g, SCENES, 'fo_ashfall'); tap(g);
        assert(sceneView(g, SCENES).text.startsWith(YT_BODY[key][0]), `TR1 (YB): the Fallout's second day reads ${key}`);
    }
    // YR: "More." from affection 72; below it "Not yet" (kept across Coils); the daily scene reopens it
    {
        const g = YG(63040, 'human', 'rr_hub', { f: 50, a: 60 }, { yk_back: 'rr_hub' }); goTo(g, SCENES, 'yk_choice');
        const v = sceneView(g, SCENES).choices;
        assert(!v.some((c) => /^"More\."/.test(c.label)) && v.some((c) => c.label === YK_QUESTION.notYet && c.index === 2), 'TR1 (YR): at 60 no "More.", "Not yet" in third place');
        const r = choose(g, SCENES, 2);
        assert(g.flags.yk_wait === true && !g.flags.yk_path && r.lines.includes(YK_QUESTION.notYetResult) && g.scene === 'rr_hub', `TR1 (YR): Not yet: the path open, her reply, back (${g.scene})`);
        assert(!KEEP_FLAGS.includes('yk_wait') && KEEP_FLAGS.includes('yk_last'), 'TR1 (YR); v0.11.191 (Y1, RP): "Not yet" belongs to the Coil, kept as her last answer');
        assert(!ykAskAgain(g), 'TR1 (YR): below the bar her scene does not reopen it');
        g.rel.Yuki.a = 72; tap(g);
        const ask = sceneView(g, SCENES).choices.find((c) => c.label === YK_QUESTION.answer);
        assert(!!ask, 'TR1 (YR): at 72 her daily scene in human form reopens the question');
        choose(g, SCENES, ask.index);
        const w = sceneView(g, SCENES);
        seen.add('yk_time'); seen.add('yk_choice_again'); // walked on purpose (the random games rarely say "Not yet" and reach 72 later)
        assert(g.scene === 'yk_choice_again' && w.choices.some((c) => /^"More\."/.test(c.label)) && w.choices.some((c) => /^"Family/.test(c.label)), 'TR1 (YR): the question again, both answers');
        choose(g, SCENES, w.choices.find((c) => /^"More\."/.test(c.label)).index);
        assert(g.flags.yk_path === 'lover' && !g.flags.yk_wait && g.scene === 'yk_lover_here', `TR1 (YR; QA2): "More." sets the path, clears the wait, away from the fire (${g.scene})`);
        const h = YG(63041, 'human', 'rr_hub', { f: 50, a: 72 }); goTo(h, SCENES, 'yk_choice');
        const hv = sceneView(h, SCENES).choices;
        assert(hv.some((c) => /^"More\."/.test(c.label) && c.index === 1) && !hv.some((c) => c.label === YK_QUESTION.notYet), 'TR1 (YR): at 72 "More." in its old place, no "Not yet"');
        const o = YG(63042, 'cat', 'rr_hub', { f: 50, a: 0 }, { yk_path: 'lover' });
        assert(o.flags.yk_path === 'lover', 'TR1 (YR): a save already on a path keeps it');
    }
    assert(YT_GAIN.reduce((a, b) => a + b, 0) / YT_GAIN.length === 2.5, 'TR1 (YG-A): 2.5 a scene on average');
}
// v0.11.137 (owner pick RT1): Fable's review of TR1 push 1: M1 the closer on a redraw, M2 the question only in human form, M3 her shape
// back after the question, L1 "Family." below 72, L4 the text by the day at the place, and its test gaps (the Long Forest's card, the minutes)
{
    const D = 1440;
    const base = (seed, form, hub = 'rr_hub', rel = { f: 0, a: 0 }, flags = {}, day = 10) => {
        const g = ensureBars(fresh(seed)); g.minutes = day * D + 600; const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0;
        g.yuki.realm = Math.max(realm, flags.realm || 0); g.james.realm = g.yuki.realm; g.yuki.form = form; delete flags.realm;
        Object.assign(g.flags, flags); g.rel = { ...g.rel, Yuki: { ...rel } }; goTo(ensureBars(g), SCENES, hub); return g;
    };
    const tap = (g) => choose(g, SCENES, SCENES[g.scene].choices.findIndex((c) => c.to === 'yk_time'));
    const labels = (g) => sceneView(g, SCENES).choices.map((c) => c.label);
    // M1: the screen draws the text, then records the visit; the closer must not change on the redraw
    {
        const g = base(65001, 'cat'); tap(g);
        const v1 = sceneView(g, SCENES); againView(g, v1, null); const v2 = sceneView(g, SCENES); againView(g, v2, null);
        assert(v1.text === v2.text && v2.text === sceneView(g, SCENES).text, 'RT1 (M1): the closer stays the same across redraws in the screen\'s order');
    }
    // M2: a cat who could be human doesn't get the question; the human does
    for (const [form, want] of [['cat', false], ['human', true]]) {
        const g = base(65010, form, 'rr_hub', { f: 50, a: 80 }, { yk_wait: true, realm: 7 }); tap(g);
        assert(labels(g).includes(YK_QUESTION.answer) === want, `RT1 (M2): as ${form} at 80 the question ${want ? 'is' : 'is not'} offered`);
    }
    // M3: "Promise." (the cat), then the question, then "Not yet": the cat again
    {
        const g = base(65020, 'human', 'rr_hub', { f: 50, a: 40 }, { yk_back: 'rr_hub' }); goTo(g, SCENES, 'yuki_human_after');
        choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => c.label === 'Promise. No occasion.').index);
        assert(g.scene === 'yk_choice' && g.yuki.form === 'human' && g.flags.yk_form_before === 'cat', `RT1 (M3): "Promise." (the cat) leads into the question, asked in her human shape (${g.scene}, ${g.flags.yk_form_before})`);
        choose(g, SCENES, 2);
        assert(g.yuki.form === 'cat' && g.flags.yk_wait && !g.flags.yk_form_before, `RT1 (M3): after "Not yet" the cat again (${g.yuki.form})`);
    }
    // L1: below 72 the human can still be told "Family."; an old save that saw her human with no answer gets the question
    {
        const g = base(65030, 'human', 'rr_hub', { f: 50, a: 50 }, { yk_wait: true }); tap(g);
        const fam = sceneView(g, SCENES).choices.find((c) => /^"Family/.test(c.label));
        assert(!!fam && !labels(g).includes(YK_QUESTION.answer), 'RT1 (L1): below 72 "Family." from her scene, not the question');
        choose(g, SCENES, fam.index);
        assert(g.scene === 'yk_sister_here' && g.flags.yk_path === 'sister' && !g.flags.yk_wait, `RT1 (L1): on to the sister's scene (${g.scene})`);
        choose(g, SCENES, 0);
        assert(g.scene === 'rr_hub' && g.yuki.form === 'human', `RT1 (L1): back at the place, still human (${g.scene}, ${g.yuki.form})`);
        const o = base(65031, 'human', 'rr_hub', { f: 50, a: 80 }, { yuki_human_seen: true }); tap(o);
        assert(labels(o).includes(YK_QUESTION.answer), 'RT1 (L1): an old save that saw her human with no answer gets the question at 72');
        const p = base(65032, 'human', 'rr_hub', { f: 50, a: 80 }, { yk_path: 'lover', yuki_human_seen: true }); tap(p);
        assert(!labels(p).includes(YK_QUESTION.answer) && !labels(p).some((l) => /^"Family/.test(l)), 'RT1 (L1): a chosen path is never asked again');
    }
    // L4: the first scene on the Fallout's third day reads the third day's text
    {
        const g = ensureBars(fresh(65040)); g.flags.ya_met = true;
        for (const day of [8, 9, 10]) { g.minutes = day * D + 480; goTo(g, SCENES, 'fo_ashfall'); }
        tap(g);
        assert(sceneView(g, SCENES).text.startsWith(YT_BODY['fo_ashfall:3'][0]), 'RT1 (L4): the place\'s third day, the third text');
    }
    // the Long Forest's card, and the minutes: 10 on the card, 10 on "Go on."
    {
        const g = ensureBars(fresh(65050)); g.minutes = 12 * D + 600; goTo(g, SCENES, 'lf_hub');
        const i = SCENES.lf_hub.choices.findIndex((c) => c.to === 'yk_time');
        assert(i >= 0 && SCENES.lf_hub.choices[i].show(g), 'RT1 (TG): the Long Forest has the card');
        const m0 = g.minutes; choose(g, SCENES, i);
        assert(sceneView(g, SCENES).text.startsWith(YT_BODY['lf_hub:1'][0]) && g.minutes - m0 === 10, `RT1 (TG): its first text, 10 minutes (${g.minutes - m0})`);
        choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => c.label === 'Go on.').index);
        assert(g.minutes - m0 === 20 && g.scene === 'lf_hub', `RT1 (L2): 20 minutes in all, like the talks (${g.minutes - m0})`);
    }
}
// v0.11.139 (owner pick MW1, the tree's push 2): Old Wen's and Mei Lin's mother's daily scenes (MS, MG3, MT) and their gains in
// the scenes they are already in (MB)
{
    const D = 1440;
    const HT_SLOTS = ['ashfall:1', 'ashfall:2', 'fo_ashfall:1', 'fo_ashfall:2', 'fo_ashfall:3', 'rt_ashfall:1'];
    // MS: on Ashfall's three resting places, after Yuki's card, door cards of 10 minutes, once a waking day
    for (const hub of Object.keys(HT_HUBS)) {
        const cs = SCENES[hub].choices.filter((c) => !/^(fo_)?pot_cook$/.test(c.to) && !c.preserve), tail = cs.slice(-3).map((c) => c.to); // v0.11.209 (TF1, K): "Smoke the catch." last; v0.11.181 (SP1, PS): the cook cards come after (kitchen_install.js)
        assert(JSON.stringify(tail) === '["yk_time","wen_time","mother_time"]', `MW1 (MS): ${hub} ends with Yuki's, Wen's and the mother's cards (${tail})`);
        for (const k of ['wen', 'mother']) {
            const c = cs.find((x) => x.to === `${k}_time`);
            assert(c.time === 10 && (typeof c.text === 'function' ? c.text(ensureBars(fresh(1))) : c.text) === HT_LABEL[k] && c.show.dailyKey === `${k}_time` && (TASK_HUBS[hub].doors || []).includes(`${k}_time`), `MW1 (MS): ${hub}'s ${k} card: 10 min, its label, daily, a door`);
        }
    }
    for (const k of ['wen', 'mother']) {
        assert(HT_SLOTS.every((sl) => typeof HT_BODY[k][sl] === 'string' && HT_BODY[k][sl].length > 200) && Object.keys(HT_BODY[k]).filter((x) => !x.endsWith('-burned')).length === HT_SLOTS.length, `MW1 (MS): ${k}: a text for each of the ${HT_SLOTS.length} slots`);
        assert(['LOW', 'MID'].every((lv) => HT_CLOSE[`${k} ${lv}`]?.length === 4), `MW1 (MT); v0.11.152 (RP1, HT): ${k}: four closers per level`);
    }
    assert(new Set([...Object.values(HT_BODY.wen), ...Object.values(HT_BODY.mother)]).size === 13, 'MW1 (MS): thirteen different texts (MR1: the burned eve)');
    const MW = (seed, hub, day, flags = {}) => {
        const g = ensureBars(fresh(seed)); g.minutes = (day - 1) * D + 600; Object.assign(g.flags, flags); goTo(ensureBars(g), SCENES, hub); return g;
    };
    const idx = (g, k) => SCENES[g.scene].choices.findIndex((c) => c.to === `${k}_time`);
    const open = (g, k) => SCENES[g.scene].choices[idx(g, k)].show(g);
    // the prologue: Wen after the elder's house (its world flag), the mother after her supper this Coil; hidden before, not "back tomorrow"
    {
        const g = MW(65001, 'ashfall', 2, { long: true, vday: 2 });
        assert(!open(g, 'wen') && !open(g, 'mother'), 'MW1 (MS): not met this Coil: neither card');
        const ids = taskCards(g, SCENES).map((c) => c.id);
        assert(!ids.includes(`ashfall:${idx(g, 'wen')}`) && !ids.includes(`ashfall:${idx(g, 'mother')}`), 'MW1 (MS): not met: not shown as "back tomorrow" either');
        g.flags.elder = true;
        assert(open(g, 'wen') && !open(g, 'mother'), 'MW1 (MS): after the elder\'s house, Wen\'s card');
        goTo(g, SCENES, 'supper'); g.minutes = D + 600; goTo(g, SCENES, 'ashfall'); // supper moves the clock to 19:00 (the cards shut then, M2)
        assert(open(g, 'mother'), 'MW1 (MS): after her supper this Coil, the mother\'s card');
        // MR1 (TG, L8): a save from before the text-day record: her supper's daily flag is enough
        const old = JSON.parse(JSON.stringify(g)); delete old.lines;
        assert(open(old, 'mother'), 'MR1 (L8): an old save without the text-day record: the mother met by her supper\'s flag');
        // MR1 (TG): a real rewind starts the Coil over: neither met
        const r = ensureBars(fresh(65003)); r.minutes = D + 600; Object.assign(r.flags, { long: true, vday: 2 }); goTo(r, SCENES, 'supper'); r.minutes = D + 600; r.flags.elder = true; goTo(r, SCENES, 'ashfall');
        assert(open(r, 'wen') && open(r, 'mother'), 'MR1 (TG): both met before the rewind');
        rewind(r); r.minutes = D + 600; Object.assign(r.flags, { long: true, vday: 2 }); goTo(r, SCENES, 'ashfall');
        assert(!open(r, 'wen') && !open(r, 'mother'), 'MR1 (TG): after a rewind neither card until met again');
    }
    // MR1 (M2): shut from 19:00, like every villager's door; MR1 (M1): the Fallout's text day runs from 05:00
    {
        const g = MW(65004, 'fo_ashfall', 8); g.minutes = 7 * D + 18 * 60 + 50;
        assert(open(g, 'wen') && open(g, 'mother'), 'MR1 (M2): open at 18:50');
        g.minutes = 7 * D + 19 * 60;
        assert(!open(g, 'wen') && !open(g, 'mother'), 'MR1 (M2): shut at 19:00');
        g.flags.wen_time_hub = 'fo_ashfall'; g.minutes = 8 * D + 2 * 60;
        assert(htSlot(g, 'wen') === 'fo_ashfall:1', `MR1 (M1): 02:00 on Day 9 still reads Day 8's text (${htSlot(g, 'wen')})`);
    }
    // MR1 (TG, L12): 20 minutes in all (10 on the card, 10 on "Go on."), the scene at its own place, the text stable on a redraw
    for (const k of ['wen', 'mother']) {
        const g = MW(65005, 'fo_ashfall', 9); const m0 = g.minutes;
        choose(g, SCENES, idx(g, k));
        const v = sceneView(g, SCENES).text;
        assert(/the elder's house|Mei Lin's house/.test(g.location) && sceneView(g, SCENES).text === v, `MR1 (L12, TG): ${k}: at ${g.location}, the same text on a redraw`);
        choose(g, SCENES, 0);
        assert(g.scene === 'fo_ashfall' && g.minutes - m0 === 20 && g.location === 'Ashfall Hamlet', `MR1 (TG): ${k}: 20 minutes in all, back in the village (${g.minutes - m0}, ${g.location})`);
    }
    {
        const g = MW(65002, 'fo_ashfall', 8);
        assert(open(g, 'wen') && open(g, 'mother'), 'MW1 (MS): in Act 1\'s villages both cards from the start');
    }
    // MG3 + MT + the slot by the story's day; once a waking day
    for (const [k, who] of [['wen', 'Old Wen'], ['mother', 'Mother']]) {
        const g = MW(65010, 'fo_ashfall', 8);
        choose(g, SCENES, idx(g, k)); seen.add(`${k}_time`);
        assert(g.scene === `${k}_time` && g.rel[who].f === HT_GAIN && g.rel[who].a === 0, `MW1 (MG3): ${who} +${HT_GAIN} friendship, no affection (${JSON.stringify(g.rel[who])})`);
        const t = sceneView(g, SCENES).text;
        assert(t.startsWith(HT_BODY[k]['fo_ashfall:1']) && HT_CLOSE[`${k} LOW`].some((l) => t.endsWith(l)) && sceneView(g, SCENES).text === t, `MW1 (MS, MT): ${k}: Day 8's text, a LOW closer, the same on a redraw`);
        choose(g, SCENES, 0);
        assert(g.scene === 'fo_ashfall' && !open(g, k), `MW1 (MS): back at the place, ${k}'s card done for today`);
        g.rel[who] = { f: HT_MID, a: 0 }; g.minutes = 9 * D + 600; goTo(g, SCENES, 'fo_ashfall'); choose(g, SCENES, idx(g, k));
        const t2 = sceneView(g, SCENES).text;
        assert(t2.startsWith(HT_BODY[k]['fo_ashfall:3']) && HT_CLOSE[`${k} MID`].some((l) => t2.endsWith(l)) && htPool(g, k) === `${k} MID`, `MW1 (MS, MT): ${k}: Day 10 (Day 9 skipped) reads Day 10's text, a MID closer at ${HT_MID}`);
    }
    for (const [hub, day, flags, slot] of [['ashfall', 2, { long: true, vday: 2, elder: true }, 'ashfall:1'], ['ashfall', 3, { long: true, vday: 3, elder: true }, 'ashfall:2'], ['fo_ashfall', 9, {}, 'fo_ashfall:2'], ['fo_ashfall', 11, {}, 'fo_ashfall:3'], ['rt_ashfall', 20, {}, 'rt_ashfall:1']]) {
        const g = MW(65020 + day, hub, day, flags); choose(g, SCENES, idx(g, 'wen'));
        assert(htSlot(g, 'wen') === slot && sceneView(g, SCENES).text.startsWith(HT_BODY.wen[slot]), `MW1 (MS): ${hub} on Day ${day} reads ${slot} (${htSlot(g, 'wen')})`);
    }
    // MR1 (M4): after the arson night, the mother's eve reads its own text (Wen's is the same)
    for (const burned of [false, true]) {
        const g = MW(65030, 'ashfall', 3, { long: true, vday: 3, elder: true, 'supper@2': true, ...(burned ? { loft_burned: true } : {}) });
        choose(g, SCENES, idx(g, 'mother'));
        assert(sceneView(g, SCENES).text.startsWith(HT_BODY.mother[burned ? 'ashfall:2-burned' : 'ashfall:2']), `MR1 (M4): the loft ${burned ? 'burned' : 'standing'}: the mother's eve text`);
    }
    assert(Object.keys(HT_BODY.mother).filter((k) => k.endsWith('-burned')).join() === 'ashfall:2-burned' && !Object.keys(HT_BODY.wen).some((k) => k.endsWith('-burned')), 'MR1 (M4): one burned text, the mother\'s eve');
    // MB: the gains in the scenes they are already in
    const MB = [['elder', 0, 'Old Wen', 3], ['fo_plan', 0, 'Old Wen', 3], ['fo_farewell', 0, 'Old Wen', 3], ['fo_farewell', 0, 'Mother', 3], ['rt_wen', 0, 'Old Wen', 4], ['supper', 2, 'Mother', 2], ['rt_mother', 0, 'Mother', 4], ['fo_depart', 0, 'Mother', 2]];
    for (const [id, i, who, n] of MB) {
        const g = ensureBars(fresh(65100)); g.rel = {};
        SCENES[id].choices[i].do(g);
        assert((g.rel[who]?.f || 0) === n && (g.rel[who]?.a || 0) === 0, `MW1 (MB): ${id}'s choice ${i}: ${who} +${n} (${JSON.stringify(g.rel[who])})`);
    }
    assert(/her mother with the dishes/.test(SCENES.supper.choices[2].text), 'MW1 (MB): supper\'s choice 2 is the dishes');
}
// v0.11.137 (owner pick QA2): her question away from the Long Forest's fire: its own text, label and answer scenes; at the fire, as before
{
    for (const fire of [true, false]) for (const [k, to] of [[0, 'sister'], [1, 'lover']]) {
        const g = ensureBars(fresh(64000 + k + (fire ? 10 : 0))); g.yuki.realm = 7; g.james.realm = 7; g.yuki.form = fire ? 'human' : 'cat';
        g.rel.Yuki = { f: 50, a: 72 }; g.flags.yk_back = fire ? 'lf_hub' : 'rr_hub'; if (fire) g.flags.lf_active = true;
        goTo(g, SCENES, 'yk_choice');
        const v = sceneView(g, SCENES);
        assert(fire ? v.text.startsWith('The last night before you walk out of the Long Forest') : v.text === YK_HERE.first, `QA2: the question's text ${fire ? 'at the fire' : 'away from it'}`);
        const more = v.choices.find((c) => c.index === 1);
        assert(fire ? /across the fire/.test(more.label) : more.label === YK_HERE.more, `QA2: "More." ${fire ? 'across the fire' : 'without it'}`);
        choose(g, SCENES, k);
        const here = `yk_${to}${fire ? '' : '_here'}`;
        assert(g.scene === here && g.flags.yk_path === to, `QA2: ${to} leads to ${here} (${g.scene})`);
        if (fire) continue;
        seen.add(here);
        const w = sceneView(g, SCENES);
        assert(!/fire|treeline|smoke|dawn/i.test(w.text + w.choices.map((c) => c.label).join(' ')), `QA2: ${here} names no fire, treeline, smoke or dawn`);
        const r = choose(g, SCENES, 0);
        assert(g.yuki.form === 'cat' && g.scene === 'rr_hub' && r.lines.includes(to === 'lover' ? YK_LATER_RESULT.lover : YK_LATER_RESULT.sister) && (to !== 'lover' || g.flags.yk_kissed), `QA2 (RT1, M3); v0.11.192 (K1, L5): ${here}: back to the shape she had (the cat), "Back in her own shape", back (${g.yuki.form}, ${g.scene})`);
    }
}
// v0.11.122 (owner pick LG1): Yuki's human scenes need her human form this Coil (YG), her bond lines below it (YV, Fable's
// A1–A5), the first kisses at Mei Lin 30 / Ya 45 (K, S), and a choice of Ya or Mei Lin alone where both like him (BC, B0–B7).
{
    const LG = (seed, flags, rel, yr) => {
        const g = ensureBars(fresh(seed)); g.minutes = 18 * 1440 + 1200;
        Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true }, flags);
        g.rel = { 'Mei Lin': { f: 40, a: rel[0] }, Ya: { f: 40, a: rel[1] }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } };
        g.yuki.realm = yr; g.james.realm = yr; return ensureBars(g);
    };
    const labels = (g) => sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => !x.disabled && re.test(x.label)); if (c) choose(g, SCENES, c.index); return !!c; };
    for (const yr of [0, 2, 5, 7]) {
        const human = yr >= 7;
        // the lover's camp walk and last nights
        const c = LG(52000 + yr, { yk_path: 'lover', trio: 3, yk_mei: 2 }, [80, 95], yr);
        goTo(c, SCENES, 'bl_camp');
        assert(labels(c).some((l) => /^Walk out past the firelight/.test(l)) === human, `LG1 (YG): the lover's camp walk ${human ? 'shows' : 'is hidden'} at Yuki's realm ${yr}`);
        const e = LG(52100 + yr, { yk_path: 'lover', trio: 3, yk_mei: 2 }, [80, 95], yr);
        e.minutes = 19 * 1440 + 1200; goTo(e, SCENES, 'rt_evening');
        const ev = labels(e);
        for (const re of [/^Go out to the grove with Yuki/, /^(Call the cat off the|Ask Yuki up off the bench)/, /^Go after Ya to the grove, and leave/, /^All of you/]) assert(ev.some((l) => re.test(l)) === human, `LG1 (YG): "${re.source}" ${human ? 'shows' : 'is hidden'} at Yuki's realm ${yr}`);
        assert(ev.some((l) => /^Climb to the herb loft with Mei Lin\.$/.test(l)) && ev.some((l) => /^Follow Ya out to the grove\.$/.test(l)) && ev.some((l) => /^Let Ya say/.test(l)), `LG1: the last night offers Mei Lin, Ya and the shared night when both like him (realm ${yr})`);
        assert(/I share a sunbeam/.test(sceneView(e, SCENES).text) === human, `LG1 (YG): the lover's last-night line only when she is human (realm ${yr})`);
        // the sister's interrogation: offered either way, in the bond below Nascent Soul
        const s2 = LG(52200 + yr, { yk_path: 'sister' }, [10, 10], yr);
        s2.yuki.form = yr >= 2 ? 'tiger' : 'cat';
        goTo(s2, SCENES, 'bl_camp');
        assert(pick(s2, /^Let Yuki interrogate you/), `LG1 (YV): the interrogation is offered at Yuki's realm ${yr}`);
        const v = sceneView(s2, SCENES);
        assert(s2.scene === 'yk_sister_talk' && /says the bond/.test(v.text) !== human && /in her human form/.test(v.text) === human, `LG1 (YV): the interrogation ${human ? 'in her human form' : 'through the bond'} at realm ${yr}`);
        assert(v.art === (human ? 'yuki_human' : yr >= 2 ? 'yuki_tiger' : 'yuki_close'), `LG1 (YV): its picture follows her form at realm ${yr} (${v.art})`);
        for (let n = 2; n <= 3; n++) { s2.flags.yk_sis_talks = n; assert(/human/.test(sceneView(s2, SCENES).text) === false || human, `LG1 (YV): talk ${n} never has her human below Nascent Soul`); }
        // the beats
        for (const path of ['sister', 'lover']) {
            const b = LG(52300 + yr, { yk_path: path }, [10, 10], yr);
            if (human) b.yuki.form = 'human'; // v0.11.125 (FM1, PM): the log scene's beat follows her current form (the FM1 block covers a cat at realm 7)
            goTo(b, SCENES, 'log_comfort');
            const t = sceneView(b, SCENES).text;
            assert(/beside you, human/.test(t) === human && /purr going through you/.test(t) === !human, `LG1 (YG, YV): the log comfort has her ${human ? 'human' : 'as a cat'} (${path}, realm ${yr})`);
            const r = LG(52400 + yr, { yk_path: path }, [10, 10], yr);
            r.minutes = 19 * 1440 + 1200; goTo(r, SCENES, 'rt_camp');
            const rt = sceneView(r, SCENES).text;
            assert(!/isn't a cat|filthy gesture/.test(rt) || human, `LG1 (YG): the camp on the way home has her human only when she is (${path}, realm ${yr})`);
            const x = LG(52500 + yr, { yk_path: path }, [10, 10], yr);
            goTo(x, SCENES, 'lf_exit');
            const xt = sceneView(x, SCENES).text;
            assert(!/human shape|holds your hand/.test(xt) || human, `LG1 (YG): the Long Forest's walk-out has her human only when she is (${path}, realm ${yr})`);
            if (path === 'sister') assert(/tail straight up/.test(xt) === !human, `LG1 (YV): the sister's walk-out as a cat below Nascent Soul (realm ${yr})`);
        }
    }
    // K: the prologue kiss from Mei Lin 30
    for (const [a, ok] of [[8, false], [29, false], [30, true], [60, true]]) {
        const g = ensureBars(fresh(52600 + a)); g.rel['Mei Lin'] = { f: 20, a }; g.scene = 'evening2';
        const k = sceneView(g, SCENES).choices.find((c) => !c.disabled && /^Kiss her\.$/.test(c.label)); // a locked choice is hidden in Incremental Mode
        assert(!!k === ok, `LG1 (K): the prologue kiss ${ok ? 'offered' : 'not offered'} at Mei Lin ${a}`);
    }
    // S: Ya's "Stay." and the path kiss from 45
    for (const [a, ok] of [[10, false], [44, false], [45, true], [70, true]]) {
        const f = LG(52700 + a, {}, [10, a], 0); f.minutes = 10 * 1440 + 1320; goTo(f, SCENES, 'fo_last_night');
        assert(labels(f).includes('"Stay."') === ok, `LG1 (S): "Stay." ${ok ? 'shows' : 'is hidden'} at Ya ${a}`);
        assert(/Do you want me to stay\?/.test(sceneView(f, SCENES).text) === ok, `LG1 (S): Ya's loft text matches the choice at Ya ${a}`);
        const p = LG(52800 + a, {}, [10, a], 0); p.minutes = 19 * 1440 + 600; goTo(p, SCENES, 'rt_ya_talk');
        assert(labels(p).some((l) => /^Kiss Ya before she gets there/.test(l)) === ok, `LG1 (S): the path kiss ${ok ? 'shows' : 'is hidden'} at Ya ${a}`);
    }
    // BC: the hot spring, both like him: the shared night or Ya alone
    {
        const g = LG(52900, {}, [80, 95], 0); g.minutes = 13 * 1440 + 1200; goTo(g, SCENES, 'spring_ya');
        assert(/waiting to see what you do/.test(sceneView(g, SCENES).text), 'LG1 (BC, B0): the spring leaves Mei Lin on the bank when both like him');
        assert(labels(g).some((l) => /^Stay as long as the heat lasts/.test(l)) && labels(g).some((l) => /^Tonight, just Ya/.test(l)), 'LG1 (BC, B1): the spring offers the shared night and Ya alone');
        const y = LG(52901, {}, [80, 95], 0); y.minutes = 13 * 1440 + 1200; goTo(y, SCENES, 'spring_ya');
        const c = sceneView(y, SCENES).choices.find((x) => /^Tonight, just Ya/.test(x.label)); const r = choose(y, SCENES, c.index);
        assert(y.scene === 'dw_hub' && y.flags.ya_romance === true && r.lines.some((l) => /loud coming back/.test(l)), `LG1 (BC, B2): just Ya goes back to camp with her romance (${y.scene})`);
        const s = LG(52902, {}, [80, 95], 0); s.minutes = 13 * 1440 + 1200; goTo(s, SCENES, 'spring_ya');
        const sc = sceneView(s, SCENES).choices.find((x) => /^Stay as long/.test(x.label)); const sr = choose(s, SCENES, sc.index);
        assert(s.scene === 'mei_curious' && sr.lines.some((l) => /Turn around, both of you/.test(l)), 'LG1 (BC, B0): the shared night keeps the splash');
        const o = LG(52903, {}, [10, 95], 0); o.minutes = 13 * 1440 + 1200; goTo(o, SCENES, 'spring_ya');
        assert(!labels(o).some((l) => /^Tonight, just Ya/.test(l)) && labels(o).includes('Let the steam close over everything.'), 'LG1 (BC): with Ya alone the spring is as before');
    }
    // BC: the Ashen Hollow camp, both like him, no Ya romance yet
    {
        const g = LG(53000, { bl_region: 'ah' }, [80, 95], 0); g.minutes = 14 * 1440 + 1260; goTo(g, SCENES, 'bl_fireside');
        assert(pick(g, /^Ya's hand finds yours/), 'LG1 (BC): the Ashen Hollow camp offers Ya\'s night when both like him');
        assert(g.scene === 'ya_romance' && /so much thread/.test(sceneView(g, SCENES).text), `LG1 (BC, B3; RL1 L3): Mei Lin watching from the fire (${g.scene})`);
        const d = LG(53001, { bl_region: 'ah', yr_day: true }, [80, 95], 0); goTo(d, SCENES, 'ya_romance');
        assert(!/so much thread/.test(sceneView(d, SCENES).text), 'LG1 (BC, B3): not on the daytime route');
        const o = LG(53002, { bl_region: 'ah' }, [10, 95], 0); goTo(o, SCENES, 'ya_romance');
        assert(!/so much thread/.test(sceneView(o, SCENES).text), 'LG1 (BC, B3): not with Ya alone');
    }
    // BC: the Fallout's last night, both like him: the roof, Ya alone, or Mei Lin alone
    {
        const y = LG(53100, { romance: true, ya_romance: true }, [80, 95], 0); y.minutes = 10 * 1440 + 1320; goTo(y, SCENES, 'fo_last_night');
        const l = labels(y);
        assert(l.some((x) => /^Stay there, the three of you/.test(x)) && l.some((x) => /^Tonight, Ya\./.test(x)) && l.some((x) => /^Tonight, Mei Lin\./.test(x)), 'LG1 (BC, B4, B6): the roof offers the shared night, Ya and Mei Lin');
        const ya0 = y.rel.Ya.a;
        pick(y, /^Tonight, Ya\./);
        assert(y.scene === 'fo_ya_night' && /^"Ya," you say\. "Stay\."/.test(sceneView(y, SCENES).text) && y.rel.Ya.a > ya0, `LG1 (BC, B5): Ya alone bridges into her night (${y.scene})`);
        assert(walkFrom(y, y.scene, new Set(['fo_depart']), 20, true) === true, 'LG1 (BC): from Ya\'s night to the north path');
        const m = LG(53101, { ya_romance: true }, [80, 95], 0); m.minutes = 10 * 1440 + 1320; goTo(m, SCENES, 'fo_last_night');
        const mei0 = m.rel['Mei Lin'].a;
        pick(m, /^Tonight, Mei Lin\./); seen.add('fo_mei_night');
        assert(m.scene === 'fo_mei_night' && m.flags.romance === true && m.rel['Mei Lin'].a > mei0 && /Bite him once for me/.test(sceneView(m, SCENES).text), `LG1 (BC, B7): Mei Lin alone has her night (${m.scene})`);
        assert(walkFrom(m, m.scene, new Set(['fo_depart']), 20, true) === true, 'LG1 (BC): from Mei Lin\'s night to the north path');
        const old = LG(53102, {}, [10, 50], 0); old.minutes = 10 * 1440 + 1320; goTo(old, SCENES, 'fo_last_night');
        pick(old, /^"Stay\."$/);
        assert(old.scene === 'fo_ya_night' && !/^"Ya," you say/.test(sceneView(old, SCENES).text), 'LG1 (BC): the old "Stay." has no bridge');
    }
}
// v0.11.122 (owner pick RL1, Fable's review of LG1): saved choice positions kept (TP), the review's test gaps (T), L2–L4, NT
{
    const LG = (seed, flags, rel, yr) => {
        const g = ensureBars(fresh(seed)); g.minutes = 18 * 1440 + 1200;
        Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true }, flags);
        g.rel = { 'Mei Lin': { f: 40, a: rel[0] }, Ya: { f: 40, a: rel[1] }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } };
        g.yuki.realm = yr; g.james.realm = yr; return ensureBars(g);
    };
    const labels = (g) => sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => !x.disabled && re.test(x.label)); if (c) choose(g, SCENES, c.index); return !!c; };
    // TP: the old choices keep their positions (g.picked stores positions); the new ones come last
    const sp = SCENES.spring_ya.choices, fo = SCENES.fo_last_night.choices;
    assert(sp[0].text === 'Stay as long as the heat lasts.' && sp[1].text === 'Let the steam close over everything.' && sp[2].text === 'Get out. Get dry. Get back to camp.' && /^Tonight, just Ya/.test(sp[3].text) && sp.length === 4, 'RL1 (TP): spring_ya keeps choices 0–2, the new one last');
    const t2 = LG(53200, {}, [10, 10], 0);
    assert(/^Stay there, the three of you/.test(fo[0].text) && fo[1].text === '"Stay."' && fo[1].to === 'fo_ya_night' && typeof fo[2].text === 'function' && fo[2].text(t2) === 'Sleep.' && /^Tonight, Ya\./.test(fo[3].text) && /^Tonight, Mei Lin\./.test(fo[4].text) && fo[5].to === 'yk_night_fo' && fo.length === 6, 'RL1 (TP; EQ1): fo_last_night keeps choices 0–4, the new ones last');
    // T: walks below Nascent Soul over path × entry × hearts (her human scenes hidden, every walk reaches the end)
    let run = 0;
    for (const path of ['sister', 'lover']) for (const entry of ['bl_start', 'rt_start']) for (const mei of [10, 80]) for (const ya of [10, 95]) {
        const g = LG(53300 + run++, { yk_path: path, trio: 3, yk_mei: 2 }, [mei, ya], 5); g.minutes = (entry === 'bl_start' ? 10 : 18) * 1440 + 360;
        g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; ensureBars(g);
        assert(walkFrom(g, entry, new Set(['a1_end']), 2500) === true, `RL1 (T): a ${path} walk from ${entry} with Yuki a cat reaches the end of Act 1 (Mei ${mei}, Ya ${ya})`);
        for (const id of ['yk_camp', 'yk_night_solo', 'yk_night_mei', 'yk_night_ya', 'yk_night_all']) assert(g.seen?.[id] == null, `RL1 (T): ${id} never seen with Yuki below Nascent Soul (${path}, ${entry}, Mei ${mei}, Ya ${ya})`);
    }
    // T: the lover lines of Act 1's epilogue and the prologue's epilogue, by her form
    for (const yr of [5, 7]) {
        const human = yr >= 7;
        for (const fl of [{ throuple: true }, { ya_romance: true }, { romance: true }, {}]) {
            const g = LG(53400 + yr, { yk_path: 'lover', ...fl }, [10, 10], yr);
            const l = loveLine(g);
            assert(/isn't a cat|in whatever shape|very quiet conversations|started sleeping there too/.test(l) === human, `RL1 (T): the lover's epilogue line has her human only at Nascent Soul (${JSON.stringify(fl)}, realm ${yr}): ${l.slice(0, 60)}`);
        }
        const p = LG(53410 + yr, { yk_path: 'lover' }, [10, 10], yr); p.scene = 'epilogue';
        assert(/instead of a paw/.test(sceneView(p, SCENES).text) === human, `RL1 (T): the prologue's lover beat only at Nascent Soul (realm ${yr})`);
        const s = LG(53420 + yr, { yk_path: 'sister' }, [10, 10], yr); s.minutes = 19 * 1440 + 1200; goTo(s, SCENES, 'rt_evening');
        assert(/I am disowning you/.test(sceneView(s, SCENES).text), `RL1 (T): the sister's last-night line at any form (realm ${yr})`);
    }
    // NT: the first interrogation by her form
    for (const [form, re] of [['cat', /For a cat this means/], ['tiger', /paw the size of a plate/]]) {
        const g = LG(53500, { yk_path: 'sister', yk_sis_talks: 1 }, [10, 10], 5); g.yuki.form = form; g.scene = 'yk_sister_talk';
        assert(re.test(sceneView(g, SCENES).text), `RL1 (NT): the first interrogation as the ${form}`);
    }
    // T: exact gains and the −1 at 44 / 45; L2 the trio step; the camp's Ya choice gone after "just Ya"
    {
        const y = LG(53600, {}, [80, 95], 0); y.minutes = 13 * 1440 + 1200; goTo(y, SCENES, 'spring_ya');
        const a0 = y.rel.Ya.a, f0 = y.rel.Ya.f;
        pick(y, /^Tonight, just Ya/);
        assert(y.rel.Ya.a === a0 + 8 && y.rel.Ya.f === f0 + 4, `RL1 (T): just Ya at the spring +4 / +8 (${y.rel.Ya.f - f0} / ${y.rel.Ya.a - a0})`);
        assert((y.flags.trio || 0) >= 2, `RL1 (L2): just Ya keeps the trio step (${y.flags.trio})`);
        y.flags.bl_region = 'ah'; y.minutes = 14 * 1440 + 1260; goTo(y, SCENES, 'bl_fireside');
        assert(!labels(y).some((l) => /^Ya's hand finds yours/.test(l)), 'RL1 (T): the camp\'s Ya night is gone after "just Ya"');
        const r = LG(53601, { romance: true, ya_romance: true }, [80, 95], 0); r.minutes = 10 * 1440 + 1320; goTo(r, SCENES, 'fo_last_night');
        const ra = r.rel.Ya.a, rf = r.rel.Ya.f; pick(r, /^Tonight, Ya\./);
        assert(r.rel.Ya.a === ra + 10 && r.rel.Ya.f === rf + 6, `RL1 (T): Ya on the roof +6 / +10 (${r.rel.Ya.f - rf} / ${r.rel.Ya.a - ra})`);
        assert(walkFrom(r, r.scene, new Set(['fo_depart']), 20, true) === true && r.flags.fo_pick === undefined, 'RL1 (L4): the bridge\'s flag cleared on the north path');
        const m = LG(53602, { ya_romance: true }, [80, 95], 0); m.minutes = 10 * 1440 + 1320; goTo(m, SCENES, 'fo_last_night');
        const ma = m.rel['Mei Lin'].a, mf = m.rel['Mei Lin'].f; pick(m, /^Tonight, Mei Lin\./);
        assert(m.rel['Mei Lin'].a === ma + 6 && m.rel['Mei Lin'].f === mf + 3, `RL1 (T): Mei Lin on the roof +3 / +6 (${m.rel['Mei Lin'].f - mf} / ${m.rel['Mei Lin'].a - ma})`);
        for (const [a, d] of [[44, 0], [45, -1]]) {
            const g = LG(53610 + a, {}, [10, a], 0); g.minutes = 10 * 1440 + 1320; goTo(g, SCENES, 'fo_last_night');
            const f1 = g.rel.Ya.f; pick(g, /^Sleep\.$/);
            assert(g.rel.Ya.f - f1 === d, `RL1 (T): turning Ya down at ${a} costs ${d} friendship (${g.rel.Ya.f - f1})`);
        }
    }
}
// v0.11.123 (owner picks EQ1, EB1): one bar of 72 for Mei Lin and Ya (AB), a kiss's flag no longer counts (KN), the same solo beats
// for the three (SC, Fable's D1–D4): Mei Lin's raft night and road kiss, Yuki's Fallout night (hidden when Mei Lin is his lover there, YH)
// and her road walk; the new choices last (saved positions).
{
    const LG = (seed, flags, rel, yr) => {
        const g = ensureBars(fresh(seed)); g.minutes = 18 * 1440 + 1200;
        Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true }, flags);
        g.rel = { 'Mei Lin': { f: 40, a: rel[0] }, Ya: { f: 40, a: rel[1] }, Yuki: { f: 50, a: 50 }, Village: { f: 30, a: 0 } };
        g.yuki.realm = yr; g.james.realm = yr; return ensureBars(g);
    };
    const labels = (g) => sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => !x.disabled && re.test(x.label)); if (c) choose(g, SCENES, c.index); return !!c; };
    // AB: the bar
    for (const [a, ok] of [[71, false], [72, true]]) {
        const g = LG(54000 + a, {}, [a, a], 0);
        assert(likesMei(g) === ok && likesYa(g) === ok, `EQ1 (AB): both liked ${ok ? 'from' : 'not below'} 72 (at ${a})`);
    }
    assert(likesMei(LG(54002, { romance: true }, [10, 10], 0)) && likesYa(LG(54003, { ya_romance: true }, [10, 10], 0)), 'EQ1 (AB): a night\'s flag still counts');
    // KN and D2: the road kisses set no flag; Mei Lin's from 30
    {
        const y = LG(54010, {}, [10, 50], 0); y.minutes = 19 * 1440 + 600; goTo(y, SCENES, 'rt_ya_talk');
        assert(pick(y, /^Kiss Ya before she gets there/) && !y.flags.ya_romance && !likesYa(y), `EB1 (KN): Ya's path kiss leaves her romance flag unset (${y.flags.ya_romance})`);
        for (const [a, ok] of [[29, false], [30, true]]) {
            const m = LG(54020 + a, {}, [a, 10], 0); m.minutes = 19 * 1440 + 600; goTo(m, SCENES, 'rt_mei_talk');
            assert(labels(m).some((l) => /^Kiss her before she finds something/.test(l)) === ok, `EQ1 (D2): Mei Lin's road kiss ${ok ? 'offered' : 'hidden'} at ${a}`);
        }
        const m = LG(54040, {}, [50, 10], 0); m.minutes = 19 * 1440 + 600; goTo(m, SCENES, 'rt_mei_talk');
        const a0 = m.rel['Mei Lin'].a, f0 = m.rel['Mei Lin'].f; pick(m, /^Kiss her before she finds something/);
        assert(m.scene === 'rt_road' && !m.flags.romance && !likesMei(m) && m.rel['Mei Lin'].a === a0 + 8 && m.rel['Mei Lin'].f === f0 + 3, `EB1 (KN; D2): Mei Lin's road kiss +3 / +8, no flag (${m.scene}, ${m.flags.romance})`);
    }
    // D1: Mei Lin's raft night, at the Drowned Wood's fire, once a Coil
    {
        const g = LG(54100, { bl_region: 'dw' }, [80, 10], 0); g.minutes = 13 * 1440 + 1260; goTo(g, SCENES, 'bl_fireside');
        const a0 = g.rel['Mei Lin'].a, f0 = g.rel['Mei Lin'].f;
        assert(pick(g, /^When the fire burns low, follow Mei Lin/), 'EQ1 (D1): the raft night is offered at the Drowned Wood when Mei Lin likes him');
        const t = sceneView(g, SCENES).text;
        seen.add('mei_raft');
        assert(g.scene === 'mei_raft' && g.flags.romance === true && g.flags.mei_raft === true && g.rel['Mei Lin'].a === a0 + 10 && g.rel['Mei Lin'].f === f0 + 5 && !/Tonight I guard/.test(t) && /Let it hear/.test(t), `EQ1 (D1): her night, +5 / +10, without Ya's lead-in (${g.scene})`);
        assert(walkFrom(g, g.scene, new Set(['bl_night']), 5, true) === true, 'EQ1 (D1): from the raft to the night');
        const b = LG(54101, { bl_region: 'dw' }, [80, 80], 0); goTo(b, SCENES, 'mei_raft');
        assert(/Tonight I guard/.test(sceneView(b, SCENES).text), 'EQ1 (D1): Ya\'s lead-in when both like him');
        for (const [fl, rel, why] of [[{ bl_region: 'ah' }, [80, 10], 'the Ashen Hills'], [{ bl_region: 'rr' }, [80, 10], 'the Root Road'], [{ bl_region: 'dw' }, [71, 10], 'Mei Lin 71'], [{ bl_region: 'dw', mei_raft: true }, [80, 10], 'a second time']]) {
            const n = LG(54110, fl, rel, 0); n.minutes = 13 * 1440 + 1260; goTo(n, SCENES, 'bl_fireside');
            assert(!labels(n).some((l) => /^When the fire burns low/.test(l)), `EQ1 (D1): no raft night at ${why}`);
        }
    }
    // D3: Yuki's Fallout night, lover and human; the lead-in by the loft's state; hidden when Mei Lin is his lover there (YH)
    for (const [fl, rel, lead, label, ok, why] of [
        [{}, [10, 10], /Forty years have taught you that look/, /^Follow the cat out onto the roof\.$/, true, 'the quiet loft'],
        [{}, [10, 50], /The not-cat/, /^Follow the cat out onto the roof\.$/, true, 'Ya at the window'],
        [{ romance: true, ya_romance: true }, [80, 95], /sleep on a god/, /^Tonight, Yuki\./, true, 'the three on the roof'],
        [{ romance: true }, [80, 10], null, /^Follow the cat|^Tonight, Yuki/, false, 'Mei Lin in the hay (YH)']]) {
        for (const yr of [5, 7]) for (const path of ['lover', 'sister']) {
            const g = LG(54200 + yr, { yk_path: path, ...fl }, rel, yr); g.minutes = 10 * 1440 + 1320; goTo(g, SCENES, 'fo_last_night');
            const want = ok && yr >= 7 && path === 'lover';
            assert(labels(g).some((l) => label.test(l)) === want, `EQ1 (D3): Yuki's Fallout night ${want ? 'offered' : 'hidden'} (${why}, ${path}, realm ${yr})`);
            if (!want) continue;
            const ya0 = g.rel.Ya.f, yk0 = g.rel.Yuki.a; pick(g, label);
            assert(g.scene === 'yk_night_fo' && lead.test(sceneView(g, SCENES).text) && g.rel.Yuki.a === yk0 + 8, `EQ1 (D3): her night with the lead-in of ${why} (${g.scene})`);
            assert(g.rel.Ya.f === ya0 - (why === 'Ya at the window' ? 1 : 0), `EQ1 (D3): turning Ya down costs 1, as "Sleep." (${why}: ${g.rel.Ya.f - ya0})`);
            assert(walkFrom(g, g.scene, new Set(['fo_depart']), 5, true) === true && g.flags.fo_pick === undefined, `EQ1 (D3): on to the north path, fo_pick cleared (${why})`);
        }
    }
    // D4: Yuki's road walk, once a day, lover and human
    for (const yr of [5, 7]) for (const path of ['lover', 'sister']) {
        const g = LG(54300 + yr, { yk_path: path }, [10, 10], yr); g.minutes = 19 * 1440 + 600; goTo(g, SCENES, 'rt_road');
        const want = yr >= 7 && path === 'lover';
        assert(labels(g).some((l) => /^Let the other two get ahead/.test(l)) === want, `EQ1 (D4): the road walk ${want ? 'offered' : 'hidden'} (${path}, realm ${yr})`);
        if (!want) continue;
        pick(g, /^Let the other two get ahead/);
        assert(g.scene === 'rt_yk_talk' && /Forty gardeners/.test(sceneView(g, SCENES).text), `EQ1 (D4): the walk (${g.scene})`);
        const yk0 = g.rel.Yuki.a; pick(g, /^Stop at the bend\. Kiss Yuki/);
        assert(g.scene === 'rt_road' && g.rel.Yuki.a === yk0 + 6 && !labels(g).some((l) => /^Let the other two get ahead/.test(l)), `EQ1 (D4): the kiss +6, back on the road, once a day (${g.scene})`);
        const n = LG(54310 + yr, { yk_path: path }, [10, 10], yr); n.minutes = 19 * 1440 + 600; goTo(n, SCENES, 'rt_yk_talk');
        const n0 = n.rel.Yuki.a; pick(n, /^"The best spot/);
        assert(n.scene === 'rt_road' && n.rel.Yuki.a === n0 + 3, 'EQ1 (D4): the other answer +3, back on the road');
    }
    // TP: the old choices keep their positions; the new ones last
    const fs = SCENES.bl_fireside.choices, mt = SCENES.rt_mei_talk.choices, rr = SCENES.rt_road.choices;
    assert(fs[fs.length - 2].text === 'Sleep.' && fs[fs.length - 1].to === 'mei_raft' && fs.length === 8, 'EQ1 (TP): bl_fireside keeps choices 0–6, the raft night last');
    assert(mt.length === 4 && /^"Your father/.test(mt[2].text) && /^Kiss her before she finds something/.test(mt[3].text), 'EQ1 (TP): rt_mei_talk keeps choices 0–2, the kiss last');
    assert(rr.length === 4 && rr[0].to === 'rt_ya_talk' && rr[1].to === 'rt_mei_talk' && rr[2].to === 'rt_ambush' && rr[3].to === 'rt_yk_talk', 'EQ1 (TP): rt_road keeps choices 0–2, Yuki\'s walk last');
}
// v0.11.123 (owner pick ER1, Fable's review of EQ1): a started throuple keeps both liked (GF), the raft-first lines and the other text
// fixes (TX, Fable's R1–R5), and the review's test gaps 1–8 (T)
{
    const LG = (seed, flags, rel, yr) => {
        const g = ensureBars(fresh(seed)); g.minutes = 18 * 1440 + 1200;
        Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true }, flags);
        g.rel = { 'Mei Lin': { f: 40, a: rel[0] }, Ya: { f: 40, a: rel[1] }, Yuki: { f: 50, a: 50 }, Village: { f: 30, a: 0 } };
        g.yuki.realm = yr; g.james.realm = yr; return ensureBars(g);
    };
    const labels = (g) => sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => !x.disabled && re.test(x.label)); if (c) choose(g, SCENES, c.index); return !!c; };
    // GF and gap 7: a started throuple keeps both liked; such a save keeps its thread and walks to the end of Act 1
    for (const t of [0, 1, 3]) {
        const g = LG(55000 + t, { trio: t }, [65, 65], 0);
        assert(likesMei(g) === (t >= 1) && likesYa(g) === (t >= 1), `ER1 (GF): Mei Lin 65 / Ya 65 liked ${t >= 1 ? 'with' : 'without'} the throuple started (trio ${t})`);
    }
    {
        const g = LG(55010, { trio: 3 }, [65, 65], 0); g.minutes = 19 * 1440 + 600; goTo(g, SCENES, 'rt_mei_talk');
        assert(/I keep looking at Ya/.test(sceneView(g, SCENES).text), 'ER1 (GF): the old save at Mei Lin 65 keeps Mei Lin\'s confession (v0.11.174, C1: "I keep looking at Ya"; "Ya kissed me" before)');
        const w = LG(55011, { trio: 3 }, [65, 65], 0); w.minutes = 18 * 1440 + 360; w.james.gu.level = 9; w.james.skills['Convergence Use'].level = 6; ensureBars(w);
        assert(walkFrom(w, 'rt_start', new Set(['a1_end']), 2500) === true, 'ER1 (T7): trio 3 at Mei Lin 65 walks to the end of Act 1');
    }
    // gap 6: a romance flag below the bar (an old path kiss, or a night) still offers her night
    {
        const g = LG(55020, { ya_romance: true }, [10, 50], 0); g.minutes = 19 * 1440 + 1200; goTo(g, SCENES, 'rt_evening');
        assert(likesYa(g) && labels(g).includes('Follow Ya out to the grove.'), 'ER1 (T6): Ya\'s flag at Ya 50 still offers her last night');
    }
    // gap 2 and R5: Mei Lin's road kiss through her romance flag below 30, with the lover's line
    {
        const g = LG(55030, { romance: true }, [10, 10], 0); g.minutes = 19 * 1440 + 600; goTo(g, SCENES, 'rt_mei_talk');
        const c = sceneView(g, SCENES).choices.find((x) => !x.disabled && /^Kiss her before she finds something/.test(x.label));
        const r = c && choose(g, SCENES, c.index);
        assert(!!c && r.lines.some((l) => /this time she says when/.test(l)), 'ER1 (T2, R5): the road kiss offered through her flag at 10, with the lover\'s line');
        const n = LG(55031, {}, [50, 10], 0); n.minutes = 19 * 1440 + 600; goTo(n, SCENES, 'rt_mei_talk');
        const nc = sceneView(n, SCENES).choices.find((x) => !x.disabled && /^Kiss her before she finds something/.test(x.label)); const nr = choose(n, SCENES, nc.index);
        assert(nr.lines.some((l) => /does not say when/.test(l)), 'ER1 (R5): the first-kiss line when she is not yet his lover');
    }
    // gap 5 and R1: where the first time was
    {
        const raft = LG(55040, { bl_region: 'dw' }, [80, 10], 0); goTo(raft, SCENES, 'mei_raft');
        assert(raft.flags.mei_first === 'raft', `ER1 (R1): the raft as her first night sets mei_first (${raft.flags.mei_first})`);
        raft.flags.bl_region = 'ah'; goTo(raft, SCENES, 'mei_bond');
        assert(/no swamp to shock/.test(sceneView(raft, SCENES).text) && !/herb loft/.test(sceneView(raft, SCENES).text), 'ER1 (R1b ii): the embers after the raft');
        raft.minutes = 19 * 1440 + 1300; goTo(raft, SCENES, 'rt_mei_night');
        assert(/Four walls this time/.test(sceneView(raft, SCENES).text) && !/hundred years/.test(sceneView(raft, SCENES).text), 'ER1 (R1a): the last night after a raft-first romance');
        const loft = LG(55041, { romance: true, bl_region: 'dw' }, [80, 10], 0); goTo(loft, SCENES, 'mei_raft');
        assert(loft.flags.mei_first === undefined, 'ER1 (R1): the raft after the loft leaves mei_first unset');
        loft.flags.bl_region = 'ah'; goTo(loft, SCENES, 'mei_bond');
        assert(/with none of the herb loft's hurry/.test(sceneView(loft, SCENES).text), 'ER1 (R1b): the loft clause after a loft-first romance');
        goTo(loft, SCENES, 'rt_mei_night');
        assert(/That other night feels a hundred years gone/.test(sceneView(loft, SCENES).text), 'ER1 (R1a): the loft-again opener after a loft-first romance');
        const none = LG(55042, { bl_region: 'ah' }, [80, 10], 0); goTo(none, SCENES, 'mei_bond');
        assert(/a first kiss, with nothing clever ready/.test(sceneView(none, SCENES).text), 'ER1 (R1b i): the embers with no first time yet');
    }
    // gap 1: Yuki's Fallout night with Mei Lin liked by the bar alone (the quiet loft), and with her flag and Ya at 72 (the roof)
    {
        const q = LG(55050, { yk_path: 'lover' }, [80, 10], 7); q.minutes = 10 * 1440 + 1320; goTo(q, SCENES, 'fo_last_night');
        assert(labels(q).includes('Follow the cat out onto the roof.'), 'ER1 (T1): offered with Mei Lin liked by the bar, no flag');
        const r = LG(55051, { yk_path: 'lover', romance: true }, [80, 72], 7); r.minutes = 10 * 1440 + 1320; goTo(r, SCENES, 'fo_last_night');
        assert(labels(r).some((l) => /^Tonight, Yuki\./.test(l)), 'ER1 (T1): the roof version with her flag and Ya at 72');
    }
    // gap 4 and R2–R4: the lead-in with fo_pick unset; the any-form lines
    {
        const g = LG(55060, { yk_path: 'lover' }, [10, 10], 7); goTo(g, SCENES, 'yk_night_fo');
        const t = sceneView(g, SCENES).text;
        assert(/gets up from beside you/.test(t) && /whatever she went up as/.test(t) && /pulling/.test(t) && !/since the barley|uncurls from your neck/.test(t), 'ER1 (T4, R3, R4): the quiet lead-in when fo_pick is unset; any form; the north');
        const w = LG(55061, { yk_path: 'lover' }, [10, 10], 7); w.minutes = 19 * 1440 + 600; goTo(w, SCENES, 'rt_yk_talk');
        const wt = sceneView(w, SCENES).text;
        assert(/I was in your lap for the log/.test(wt) && /feel her decide something/.test(wt) && !/read the log|weight goes off/.test(wt), 'ER1 (R2, R4): the road walk: the log as a memory; any form');
    }
    // gap 3: a rewind clears this Coil's flags
    assert(!['mei_raft', 'mei_first', 'fo_pick'].some((f) => KEEP_FLAGS.includes(f)), 'ER1 (T3): mei_raft, mei_first and fo_pick are not kept across Coils');
    {
        const g = ensureBars(fresh(55070));
        if (g.coil?.snap) { Object.assign(g.flags, { mei_raft: true, mei_first: 'raft', fo_pick: 'yk' }); rewind(g); assert(!g.flags.mei_raft && !g.flags.mei_first && !g.flags.fo_pick, 'ER1 (T3): a rewind clears them'); }
    }
    // gap 8: lover walks at Nascent Soul reach Yuki's two new scenes in play (not by hand)
    const before = { fo: seen.has('yk_night_fo'), rt: seen.has('rt_yk_talk') };
    let fo = 0, rt = 0;
    for (let run = 0; run < 80; run++) { // v0.11.141 (FX1): 24 → 80 walks (about 1 Fallout walk in 8 reaches the roof: 12 missed it about 1 time in 5, 40 about 1 in 200)
        const from = run % 2 ? 'rt_start' : 'fo_start';
        const g = LG(55100 + run, { yk_path: 'lover' }, [10 + (run % 3) * 40, 10 + (run % 4) * 30], 7); g.minutes = (from === 'fo_start' ? 7 : 18) * 1440 + 360;
        g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; ensureBars(g);
        walkFrom(g, from, new Set(from === 'fo_start' ? ['bl_start'] : ['a1_end']), 2500);
        if (g.seen?.yk_night_fo != null) fo++; if (g.seen?.rt_yk_talk != null) rt++;
    }
    assert(fo > 0 && rt > 0, `ER1 (T8): random lover walks at Nascent Soul reach yk_night_fo (${fo} of 40) and rt_yk_talk (${rt} of 40)`);
    void before;
}

// v0.11.124 (owner picks NX1, NF1; texts by Fable): the log scene's Yuki lines by her shape (HS: human when her human form is open this Coil,
// else her current form), placed once (LC1, FB: the path beat skips the trio branch, the fallback drops its clause when the beat follows)
{
    const LS = (seed, path, shape, rel, trio) => {
        const g = ensureBars(fresh(seed)); g.minutes = 16 * 1440 + 900;
        Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, mei_party: true, ya_party: true, ya_met: true, log_heard: true }, path ? { yk_path: path } : {}, trio ? { trio } : {});
        g.rel = { 'Mei Lin': { f: 40, a: rel[0] }, Ya: { f: 40, a: rel[1] }, Yuki: { f: 50, a: 50 }, Village: { f: 30, a: 0 } };
        const realm = shape === 'human' ? 7 : shape === 'tiger' || shape === 'cat2' ? 2 : 0;
        g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = shape === 'tiger' ? 'tiger' : shape === 'human' ? 'human' : 'cat'; // v0.11.125 (FM1, PM): the lines follow her current form
        return ensureBars(g);
    };
    const shapeOf = (s) => (s === 'cat2' ? 'cat' : s);
    const HOLD = { cat: 'Say nothing. Hold the log. Hold the cat.', tiger: 'Say nothing. Hold the log. Lean on the cat.', human: 'Say nothing. Hold the log. Hold Yuki\'s hand.' };
    const LOOK = { cat: /Yuki looks up at you\. Through the bond: \*what do we do\.\*/, tiger: /gold eye to eye\. Through the bond: \*what do we do\.\*/, human: /Yuki looks down at you\. "What do we do," she says\./ };
    const JUDGE = { cat: /like a small white judge/, tiger: /like a large white verdict/, human: /like a small judge in a high black collar\. "About time,"/ };
    const SEAT = { cat: /, and Yuki sits on the hearth-log, and Selene hums/, tiger: /, and Yuki lies round the foot of the chair like a white rug with opinions, and Selene hums/, human: /, and Yuki sits on the arm of the chair with her tail round your wrist, and Selene hums/ };
    const BEAT = /And Yuki: /;
    let n = 0;
    for (const path of [null, 'sister', 'lover']) for (const shape of ['cat', 'cat2', 'tiger', 'human']) {
        const sh = shapeOf(shape), tag = `${path || 'no path'}, ${shape}`;
        // the reaction: the look and the silent choice's label (LC3, LU), the label still 4th and still +3 Yuki
        const r = LS(56000 + n++, path, shape, [80, 80], 3); goTo(r, SCENES, 'log_reaction');
        const rv = sceneView(r, SCENES);
        assert(LOOK[sh].test(rv.text) && Object.values(LOOK).filter((re) => re.test(rv.text)).length === 1, `NF1 (LU): log_reaction's look for ${tag}`);
        assert(rv.choices[3]?.label === HOLD[sh] && rv.choices.length === 4, `NF1 (LC3): the silent choice reads "${HOLD[sh]}" and stays 4th (${tag}; ${rv.choices[3]?.label})`);
        const f0 = r.rel.Yuki.f; choose(r, SCENES, 3);
        assert(r.scene === 'log_comfort' && r.flags.reaction === 'silent' && r.rel.Yuki.f === f0 + 3, `NF1 (LC3): the silent choice still leads on, +3 Yuki (${tag})`);
        // the trio branch: her line by shape, once, no path beat (LC1, LC2)
        const t = LS(56100 + n++, path, shape, [80, 80], 3); goTo(t, SCENES, 'log_comfort');
        const tt = sceneView(t, SCENES).text;
        assert(/Between Them/.test(sceneView(t, SCENES).title) && JUDGE[sh].test(tt) && Object.values(JUDGE).filter((re) => re.test(tt)).length === 1 && !BEAT.test(tt), `NF1 (LC1, LC2): the trio branch places Yuki once, as ${sh} (${tag})`);
        // the fallback branch: the clause by shape without a path; with a path, no clause and the beat (FB)
        const f = LS(56200 + n++, path, shape, [10, 10], 0); goTo(f, SCENES, 'log_comfort');
        const ft = sceneView(f, SCENES).text;
        assert(/^Nobody comforts anybody/.test(ft), `NF1: the fallback branch (${tag})`);
        if (path) assert(!/and Yuki (sits|lies)/.test(ft) && /in your lap, and Selene hums/.test(ft) && (ft.match(BEAT) || []).length === 1, `NF1 (FB): with her path the fallback drops its clause and the beat places her (${tag})`);
        else assert(SEAT[sh].test(ft) && !BEAT.test(ft), `NF1 (FB): without a path the fallback's clause by shape (${tag})`);
        // the beat by shape (HS; BT): human when open this Coil, the great root-kin's own line, else the cat's
        if (path) {
            const want = sh === 'human' ? /not on your shoulder but beside you, human/ : sh === 'tiger' ? /a hand's width sideways/ : /a purr going through you that you feel in your teeth/;
            assert(want.test(ft) && (sh !== 'tiger' || !/in your teeth/.test(ft)), `NF1 (BT, HS): the path beat as ${sh} (${tag})`);
            assert(new RegExp(path === 'lover' ? "She doesn't need to" : "Sisters don't need to").test(ft), `NF1: the beat's ${path} ending (${tag})`);
        }
        // Mei Lin's branch: the beat alone places her (no Yuki line of its own)
        const m = LS(56300 + n++, path, shape, [80, 10], 0); goTo(m, SCENES, 'log_comfort');
        const mt = sceneView(m, SCENES).text;
        assert(/^Mei Lin gets down on the floor of the bridge next to you/.test(mt) && (mt.match(/\bYuki\b/g) || []).length === (path ? 1 : 0), `NF1: Mei Lin's branch names Yuki ${path ? 'once (the beat)' : 'never'} (${tag})`);
    }
    // v0.11.125 (FM1, PM; was NF1's HS): her human form open but a cat on the shoulder now: the lines follow the cat, as the picture
    {
        const g = LS(56400, 'sister', 'human', [10, 10], 0); g.yuki.form = 'cat'; goTo(g, SCENES, 'log_reaction');
        assert(sceneView(g, SCENES).choices[3].label === HOLD.cat && LOOK.cat.test(sceneView(g, SCENES).text), 'FM1 (PM): human open this Coil, a cat now: the look and the label follow the cat');
        goTo(g, SCENES, 'log_comfort');
        assert(/feel in your teeth/.test(sceneView(g, SCENES).text) && !/beside you, human/.test(sceneView(g, SCENES).text), 'FM1 (PM): human open, a cat now: the path beat is the cat\'s');
    }
    // Fable's review of NF1 (test gaps), under FM1's rule: human open with the great root-kin now: every line the great root-kin's
    {
        const r = LS(56410, 'lover', 'human', [80, 80], 3); r.yuki.form = 'tiger'; goTo(r, SCENES, 'log_reaction');
        const rv = sceneView(r, SCENES);
        assert(LOOK.tiger.test(rv.text) && rv.choices[3].label === HOLD.tiger, 'FM1 (PM): human open, the great root-kin now: the look and the label hers');
        choose(r, SCENES, 3);
        assert(wasPicked(r, 'log_reaction', 3) && JUDGE.tiger.test(sceneView(r, SCENES).text) && !BEAT.test(sceneView(r, SCENES).text), 'NF1 (review): the silent choice recorded at position 3; the trio line by her form, reached through the choice');
        const f = LS(56411, null, 'human', [10, 10], 0); f.yuki.form = 'tiger'; goTo(f, SCENES, 'log_comfort');
        assert(SEAT.tiger.test(sceneView(f, SCENES).text), 'FM1 (PM): human open, the great root-kin now: the fallback clause hers');
        const b = LS(56412, 'sister', 'human', [10, 10], 0); b.yuki.form = 'tiger'; goTo(b, SCENES, 'log_comfort');
        assert(/sideways/.test(sceneView(b, SCENES).text) && !/beside you, human/.test(sceneView(b, SCENES).text), 'FM1 (PM): human open, the great root-kin now: the beat hers');
    }
    // stale stored forms (old saves): a form not open this Coil reads as the cat
    for (const [form, realm] of [['human', 0], ['tiger', 0], ['human', 2]]) {
        const g = LS(56420 + realm, 'sister', 'cat', [10, 10], 0); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; goTo(g, SCENES, 'log_reaction');
        assert(sceneView(g, SCENES).choices[3].label === HOLD.cat && LOOK.cat.test(sceneView(g, SCENES).text), `NF1 (review): a stored ${form} at realm ${realm} reads as the cat`);
    }
    // the trio raised by the scene's own step (0–2 → 3 with both liked and Ya along); both liked without Ya: Mei Lin's branch and the beat
    for (const t of [0, 1, 2]) {
        const g = LS(56430 + t, 'lover', 'tiger', [80, 80], t); goTo(g, SCENES, 'log_comfort');
        const tt = sceneView(g, SCENES).text;
        assert(g.flags.trio === 3 && JUDGE.tiger.test(tt) && !BEAT.test(tt), `NF1 (LC1, review): trio ${t} raised to 3 on entering: the trio line, no beat`);
    }
    {
        const g = LS(56440, 'lover', 'tiger', [80, 80], 0); g.flags.ya_party = false; goTo(g, SCENES, 'log_comfort');
        const tt = sceneView(g, SCENES).text;
        assert(/^Mei Lin gets down on the floor of the bridge next to you/.test(tt) && (tt.match(BEAT) || []).length === 1 && /sideways/.test(tt), 'NF1 (review): both liked, Ya not along: Mei Lin\'s branch and the great root-kin beat');
    }
    // Ya's branch (Ya liked, Mei Lin not): Yuki once with a path, never without
    for (const path of [null, 'sister']) {
        const g = LS(56450 + (path ? 1 : 0), path, 'cat', [10, 80], 0); goTo(g, SCENES, 'log_comfort');
        const tt = sceneView(g, SCENES).text;
        assert(/^Ya does not do comfort/.test(tt) && (tt.match(/\bYuki\b/g) || []).length === (path ? 1 : 0), `NF1 (review): Ya's branch names Yuki ${path ? 'once (the beat)' : 'never'}`);
    }
}

// v0.11.125 (owner pick FM1; texts by Fable): the 18 lines that put the small cat on his shoulder, in his lap or on his chest now follow
// her current form, as the pictures do (the cat keeps the old line)
{
    const FM = (seed, form, flags = {}, rel = [40, 40]) => {
        const g = ensureBars(fresh(seed)); g.minutes = 9 * 1440 + 600;
        Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, mei_party: true, ya_party: true, ya_met: true, fire: true }, flags);
        g.rel = { ...g.rel, 'Mei Lin': { f: 40, a: rel[0] }, Ya: { f: 40, a: rel[1] }, Yuki: { f: 50, a: 50 }, Village: { f: 30, a: 0 } };
        const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0;
        g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; return ensureBars(g);
    };
    // [scene, flags, the cat's text, the great root-kin's, the human's]
    const CASES = [
        ['epilogue', {}, /ridge, with Yuki on your shoulder/, /ridge, with Yuki pacing at your side/, /ridge, with Yuki at your elbow/],
        ['rt_road', {}, /Yuki rides on your shoulder and supervises\./, /Yuki pads at your side and supervises\./, /Yuki walks at your elbow and supervises\./],
        ['ya_meets', {}, /Yuki, on your shoulder, sets her ears back and lets it happen/, /Yuki, at your hip, sets her ears back/, /Yuki, at your elbow, sets her ears back/], // v0.11.174 (RV1): the Fallout's leftovers
        ['village_morning', { vday: 2 }, /on the doorstep like a small white guard dog\./, /across the doorstep like a large white guard dog\./, /eyes shut, like a white guard dog in a high black collar\./],
        ['ya_mocks', {}, /Yuki, on your shoulder, sends a single thought/, /Yuki, at your side, sends/, /Yuki, at your elbow, sends/],
        ['rt_quiet_night', {}, /^You bed down by the stove, and Yuki settles on your chest\. /, /^You bed down by the stove, and Yuki rests her chin on your breastbone\. /, /^You bed down by the stove, your back against Yuki's\. /], // v0.11.174 (P7A): Fable's
        ['night', {}, /Yuki climbs into your lap, a habit she saves/, /Yuki lies down around you, a habit she saves/, /Yuki sits down against your side, a habit she saves/],
        ['rt_evening', {}, /four bowls and a saucer for the cat\./, /four bowls and, after a long look at Yuki, the stew pot\./, /four bowls and a fifth for Yuki, with the saucer beside it out of habit\./],
        ['rt_elder', {}, /Yuki, on your shoulder, has gone perfectly still\./, /Yuki, at your side, has gone perfectly still\./, /Yuki, at your elbow, has gone perfectly still\./], // v0.11.174 (P7A): Fable's
        ['ship_bridge', {}, /Yuki gets into your lap without being asked\./, /Yuki lays her head in your lap without being asked\./, /Yuki sits on the arm of your seat without being asked\./],
        ['ht_leave', {}, /Yuki rides on your shoulder with her tail wrapped round your neck\./, /Yuki pads at your side with her tail hooked round your wrist\./, /Yuki walks at your shoulder with her tail wrapped round your wrist\./],
        ['bl_end', {}, /Yuki is on your shoulder, claws in\./, /Yuki is at your side, claws out\./, /Yuki is at your shoulder, claws out\./],
        ['hall_listen', {}, /Yuki puts her paw on the back of your hand\. Through the bond/, /Yuki rests her chin on the back of your hand\. Through the bond/, /Yuki puts her hand on the back of yours\. "Someone did this,"/], // v0.11.174 (P7A, RV1): aloud,
        ['bl_start', {}, /A biologist, a cat, a herb-woman/, /A biologist, a very large cat, a herb-woman/, /A biologist, a cat on two legs, a herb-woman/],
        ['ah_hunt', {}, /"It's the cat they want\."\n\nYuki, on your shoulder, lays her ears back/, /"They won't go for the cat\. Not that cat\."\n\nYuki, at your side, lays her ears back/, /"They'll go for the small one\."\n\nYuki, at your elbow, lays her ears back/], // v0.11.172 (P5A): Fable's rewrite
    ];
    let n = 0;
    for (const [id, flags, ...want] of CASES) {
        assert(!!SCENES[id], `FM1: scene ${id} exists`);
        ['cat', 'tiger', 'human'].forEach((form, i) => {
            const g = FM(57000 + n++, form, flags); goTo(g, SCENES, id);
            const t = sceneView(g, SCENES).text;
            assert(want[i].test(t) && want.filter((re) => re.test(t)).length === 1, `FM1: ${id} as ${form} (${t.slice(0, 80)}…)`);
        });
    }
    // the locals' lines (tribute: Lu Han; elder: the village elder): where they see her, by form; "at its size" only for the cat
    for (const [id, who] of [['tribute', 'Lu Han'], ['elder', 'the elder']]) {
        for (const [form, spot] of [['cat', 'the beast on your shoulder'], ['tiger', 'the beast at your side'], ['human', 'the beast beside you']]) {
            for (const prim of [12, 5, 0]) {
                const g = FM(57200 + n++, form); g.yuki.primaries = prim; goTo(g, SCENES, id);
                const t = sceneView(g, SCENES).text;
                const others = ['the beast on your shoulder', 'the beast at your side', 'the beast beside you'].filter((x) => x !== spot);
                assert(t.includes(spot) && !others.some((x) => t.includes(x)), `FM1: ${who}'s line as ${form}, ${prim} meridians`);
                if (id === 'elder' && prim === 5) assert(t.includes({ cat: 'small as it is', tiger: 'no hand ever trained it', human: 'young as it looks' }[form]), `FM1: the elder's "at its size" as ${form} (v0.11.177, P9A MS: Fable's words)`);
            }
        }
    }
    // the sister's epilogue line (loveLine, a1_end)
    for (const [form, re] of [['cat', /with Yuki on your chest\. She says you're hopeless/], ['tiger', /with Yuki's head on your chest, which is all of her that fits\. She says/], ['human', /back to back with Yuki, her tail across your shins\. She says/]]) {
        const g = FM(57400 + n++, form, { yk_path: 'sister', ending: 'bluff' }, [10, 10]);
        const line = loveLine(g);
        assert(re.test(line), `FM1: the sister's last line as ${form} (${line.slice(0, 70)})`);
    }
    // v0.11.125 (owner pick XS1): XL, three more lines (the epilogue's tail, Act 1's last "Not dead", the sister's "Disowned"), and RB,
    // the ridge's two path beats (standing, so never "on your chest")
    for (const [form, tail, notDead, disowned, notBad, lover] of [
        ['cat', /Yuki's tail curls around your neck\. Down the bond/, /Yuki, on your chest, opens one yellow eye\. \*Not dead/, /Yuki, on your chest, mutters: \*Disowned/, /Yuki, on your shoulder, opens one gold eye\. \*Not bad/, /Yuki, on your shoulder, purrs\. Just for a moment, in the dusk, it is a hand on the back of your neck/],
        ['tiger', /Yuki's tail curls around your wrist\. Down the bond/, /Yuki, her head on your chest, opens one gold eye\. \*Not dead/, /Yuki, head still on your chest, mutters: \*Disowned/, /Yuki, at your side, gives you one sidelong gold eye\. \*Not bad/, /Yuki, against your hip, purrs; you feel it in your teeth\./],
        ['human', /Yuki's tail curls around your wrist\. Down the bond/, /Somewhere near, Yuki opens one gold eye\. "Not dead," she says/, /Yuki, at your back, mutters: \*Disowned/, /Yuki, at your elbow, gives you one sidelong gold eye\. \*Not bad/, /Yuki, at your elbow, does not purr\. Just for a moment, in the dusk, her hand is in yours, and it stays a hand\./],
    ]) {
        const e = FM(57600 + n++, form); goTo(e, SCENES, 'epilogue');
        assert(tail.test(sceneView(e, SCENES).text), `XS1 (XL): the epilogue's tail as ${form}`);
        const a = FM(57700 + n++, form, { ending: 'bluff' }); a.minutes = 21 * 1440 + 600; goTo(a, SCENES, 'a1_end');
        assert(notDead.test(sceneView(a, SCENES).text), `XS1 (XL): Act 1's last "Not dead" as ${form}`);
        const q = FM(57800 + n++, form, { yk_path: 'sister' }); goTo(q, SCENES, 'rt_quiet_night');
        const qt = sceneView(q, SCENES).text;
        assert(disowned.test(qt) && !/Yuki, on your chest, mutters/.test(qt) === (form !== 'cat'), `XS1 (XL): the sister's "Disowned" as ${form}`);
        const r = FM(57900 + n++, form, { yk_path: 'sister' }); goTo(r, SCENES, 'epilogue');
        assert(notBad.test(sceneView(r, SCENES).text) && !/on your chest/.test(sceneView(r, SCENES).text), `XS1 (RB): the ridge's sister beat as ${form}, standing`);
        const l = FM(58000 + n++, form, { yk_path: 'lover' }); l.yuki.realm = 7; l.james.realm = 7; goTo(l, SCENES, 'epilogue');
        assert(lover.test(sceneView(l, SCENES).text) && !/on your chest|in the dark/.test(sceneView(l, SCENES).text), `XS1 (RB): the ridge's lover beat as ${form} (human open this Coil)`);
        const l0 = FM(58100 + n++, form, { yk_path: 'lover' }); goTo(l0, SCENES, 'epilogue');
        assert(!/Just for a moment, in the dusk/.test(sceneView(l0, SCENES).text) === (form !== 'human'), `XS1 (RB): the ridge's lover beat only with her human form open (${form})`);
    }
    // v0.11.125 (owner pick RW1, Fable's review of FM1 + XS1): BC the scenes' own beats, SL the leftovers, AJ the next scene in each flow
    const RW = [
        // [scene, flags, minutes, cat, great root-kin, human]
        ['rt_evening', {}, 19 * 1440 + 1200, /Yuki takes the stove\./, /Yuki takes the floor in front of the stove\. All of it\./, /Yuki takes the bench by the stove\./],
        ['rt_quiet_night', {}, null, /Toward dawn Yuki puts her nose against your chin\./, /Toward dawn Yuki's nose bumps your chin\./, /Toward dawn Yuki's elbow finds your ribs\. "Stop thinking," she says/], // v0.11.174 (RV1, L1): aloud,
        ['epilogue', {}, null, /a fresh doctorate, a cat, an empty closet/, /a fresh doctorate, a cat the size of a tiger, an empty closet/, /a fresh doctorate, a cat who is currently a woman, an empty closet/],
        ['ya_fight_start', {}, null, /Yuki climbs down off your shoulder and sits at a safe distance/, /Yuki walks off a little way and lies down at a safe distance/, /Yuki steps back and sits on a root at a safe distance/],
        ['ah_hawks_won', {}, null, /who rode out the whole fight on your shoulder, claws sunk in, spitting — jumps down onto it, and sits there/, /at your flank through the whole thing, claws out, snarling — puts one paw on it, and sits there/, /at your back through the whole thing, claws out, spitting — puts her foot on it, and stands there/],
        ['rt_taken', {}, 21 * 1440 + 600, /"You may bring the cat\. The Sect Master will want to see the cat\."[\s\S]*Yuki, on your shoulder, gives him/, /"You may bring the beast\. The Sect Master will want to see the beast\."[\s\S]*Yuki, at your side, gives him/, /"You may bring the root-kin\. The Sect Master will want to see the root-kin\."[\s\S]*Yuki, at your elbow, gives him/],
        ['fo_depart', {}, 10 * 1440 + 360, /Yuki rides your shoulder facing north, tail curled round your neck\./, /Yuki paces at your knee facing north, tail laid against your leg\./, /Yuki walks half a step ahead of you facing north, tail curled round your sleeve\./],
        ['night_event', { night_ev: 'lights' }, null, /Yuki is awake on your chest, ears flat, not hissing\./, /Yuki is awake against your side, ears flat, not growling\./, /Yuki is awake beside you, ears flat, not speaking\./],
        ['night_lost', {}, null, /Yuki sits on your chest until your heartbeat slows/, /Yuki rests one paw on your chest until your heartbeat slows/, /Yuki sits with her hand flat on your chest until your heartbeat slows/],
    ];
    for (const [id, flags, min, ...want] of RW) {
        ['cat', 'tiger', 'human'].forEach((form, i) => {
            const g = FM(58200 + n++, form, flags); if (min) g.minutes = min; goTo(g, SCENES, id);
            if (id === 'night_event') g.flags.night_ev = 'lights';
            const t = sceneView(g, SCENES).text;
            assert(want[i].test(t) && want.filter((re) => re.test(t)).length === 1, `RW1: ${id} as ${form} (${t.slice(0, 70)}…)`);
        });
    }
    // BC: the last evening's bowl, its stove line and her path beat agree in every form (sister any realm; lover with her human form open)
    for (const path of ['sister', 'lover']) for (const [form, bowl, beat] of [
        ['cat', /a saucer for the cat/, path === 'lover' ? /Yuki is on the stove in her small shape/ : /Yuki, on the stove, cracks one eye/],
        ['tiger', /the stew pot/, path === 'lover' ? /Yuki lies before the stove in her great shape/ : /Yuki, in front of the stove, cracks one eye/],
        ['human', /a fifth for Yuki/, path === 'lover' ? /Yuki sits on the bench by the stove, watching/ : /Yuki, on the bench by the stove, cracks one eye/],
    ]) {
        const g = FM(58400 + n++, form, { yk_path: path }); g.minutes = 19 * 1440 + 1200; if (path === 'lover') { g.yuki.realm = 7; g.james.realm = 7; }
        goTo(g, SCENES, 'rt_evening');
        const t = sceneView(g, SCENES).text;
        assert(bowl.test(t) && beat.test(t) && (form === 'cat' || !/on the stove in her small shape|Yuki, on the stove|Yuki takes the stove\./.test(t)), `RW1 (BC): the last evening agrees with itself (${path}, ${form})`);
    }
    // BC: Ya's path beat at the meeting, by form
    for (const [form, re] of [['cat', /near your shoulder[\s\S]*the white cat\. "That," she says, "isn't a cat\."/], ['tiger', /near your hip[\s\S]*the great white cat\. "That," she says, "isn't a cat\."/], ['human', /near your elbow[\s\S]*the white-haired woman\. "That," she says, "isn't a woman\."/]]) {
        const g = FM(58500 + n++, form, { yk_path: 'sister' }); goTo(g, SCENES, 'ya_meets');
        const t = sceneView(g, SCENES).text;
        assert(re.test(t) && (form === 'cat' || !/near your shoulder|on your shoulder/.test(t)), `RW1 (BC): Ya's path beat as ${form}`);
    }
    // T (review gap): every touched scene, with its beats, never puts the great root-kin or the human on his shoulder, in his lap as the cat, or on the stove
    const SMALL = /Yuki, on your shoulder|Yuki rides (on )?your shoulder|Yuki is on your shoulder|Yuki on your shoulder|Yuki climbs into your lap|Yuki gets into your lap|Yuki, on your chest|Yuki on your chest|in her small shape|Yuki, on the stove|Yuki takes the stove\.|beast on your shoulder|riding your shoulder|off your shoulder|Yuki is awake on your chest|Yuki sits on your chest|puts her paw on the back/;
    const TOUCHED = ['epilogue', 'rt_road', 'ya_meets', 'tribute', 'elder', 'village_morning', 'ya_mocks', 'rt_quiet_night', 'night', 'rt_evening', 'rt_elder', 'ship_bridge', 'ht_leave', 'bl_end', 'hall_listen', 'bl_start', 'ah_hunt', 'log_reaction', 'log_comfort', 'a1_end', 'ya_fight_start', 'ah_hawks_won', 'rt_taken', 'fo_depart', 'night_event', 'night_lost'];
    for (const id of TOUCHED) for (const form of ['tiger', 'human']) for (const path of [null, 'sister', 'lover']) {
        const g = FM(58600 + n++, form, path ? { yk_path: path, night_ev: 'lights', ending: 'bluff' } : { night_ev: 'lights', ending: 'bluff' });
        if (id === 'a1_end' || id === 'rt_taken') g.minutes = 21 * 1440 + 600;
        goTo(g, SCENES, id); g.flags.night_ev = 'lights';
        const t = sceneView(g, SCENES).text;
        const m = t.match(SMALL);
        assert(!m, `RW1 (T): ${id} as ${form} (${path || 'no path'}) never places her as the small cat (${m?.[0]})`);
    }
    // T (review gap): the five scenes whose text became a function still fold on a later Coil
    for (const id of ['ya_mocks', 'bl_start', 'ah_hunt', 'bl_end', 'hall_listen', 'ya_fight_start', 'ah_hawks_won', 'night_lost']) {
        const g = FM(58900 + n++, 'tiger'); goTo(g, SCENES, id); g.seen[id] = 1; g.coil.n = 2;
        const v = sceneView(g, SCENES); noteRead(g, v.text, 1); const a = againView(g, v); // v0.11.133 (FP2): read on Coil 1
        assert(typeof v.text === 'string' && (a.fold || v.text.split(/\n\s*\n/).filter((x) => x.trim()).length < 2), `RW1 (T): ${id} folds on a later Coil`);
    }
    // T (review gap): the lover's quiet night and the ridge beat with her human form open but a cat or the great root-kin now
    for (const form of ['cat', 'tiger']) {
        const g = FM(59000 + n++, form, { yk_path: 'lover' }); g.yuki.realm = 7; g.james.realm = 7; g.yuki.form = form; goTo(g, SCENES, 'epilogue');
        const t = sceneView(g, SCENES).text;
        assert((form === 'cat' ? /Yuki, on your shoulder, purrs/ : /Yuki, against your hip, purrs/).test(t) && !/and it stays a hand/.test(t), `RW1 (T): the ridge's lover beat follows her current form (${form}, human open)`);
        const q = FM(59100 + n++, form, { yk_path: 'lover' }); goTo(q, SCENES, 'rt_quiet_night');
        assert(!SMALL.test(sceneView(q, SCENES).text) || form === 'cat', `RW1 (T): the lover's quiet night as ${form}`);
    }
    // a stale stored form (old saves): a form not open this Coil reads as the cat
    {
        const g = FM(57500, 'cat'); g.yuki.form = 'human'; goTo(g, SCENES, 'rt_road');
        assert(/Yuki rides on your shoulder and supervises\./.test(sceneView(g, SCENES).text), 'FM1: a stored human form below Nascent Soul reads as the cat');
    }
    // v0.11.126 (owner pick NQ1; texts by Fable): the second pass: S1 the lines the bots met in another form, S0 the lines only a player
    // reaches, RV the sister's "out loud" while she can't speak aloud. The cat keeps every old line; "keep" = the great root-kin keeps it too.
    const NQ = [
        // [scene, flags, minutes, cat, great root-kin, human]
        ['fo_last_night', {}, null, /fingering the thatch\. Yuki curls into the hollow of your neck, and the bond carries you/, /Yuki lies down along the length of you and fits her chin into the hollow of your neck, which is all of her that fits, and the bond carries you/, /Yuki lies down at your back, her tail across your shins, and the bond carries you/],
        ['tribute_dawn_sleep', {}, null, /^You sleep by the stove with a cat on your chest and the sound/, /^You sleep by the stove with a cat's head on your chest, which is all of her that fits, and the sound/, /^You sleep by the stove, back to back with Yuki, with the sound/],
        ['tribute_dawn_talk', {}, null, /Yuki climbs into the gap between you as if she'd been invited\./, /Yuki lies down across both your feet as if she'd been invited\./, /Yuki sits down on your other side and takes the other shoulder, as if she'd been invited\./],
        ['mei_lin', {}, null, /Yuki, from your shoulder, offers Mei Lin one slow blink\./, /Yuki, from your side, offers Mei Lin one slow blink\./, /Yuki, at your elbow, offers Mei Lin one slow blink\./],
        ['gao_talked', {}, null, /with a cat on his shoulder and the voice of a man/, /with a cat the size of a tiger at his side and the voice of a man/, /with a cat-eared woman in a black qipao at his elbow and the voice of a man/],
        ['friends_watch', {}, null, /the three of you and the cat, and keep the watch/, /the three of you and one very large cat, and keep the watch/, /on the ridge instead, all four of you, and keep the watch/], // v0.11.172 (P5A, YF): the great root-kin's own wording
        ['rt_grove', {}, null, /Yuki walks into the middle of the ring, lies down, and purrs/, /Yuki walks into the middle of the ring, lies down, and purrs/, /Yuki walks into the middle of the ring, sits down with her tail curled in her lap, and purrs/], // v0.11.174 (P7A): no black dress in prose
        ['roots_fall', {}, null, /Yuki climbs down after you, perfectly, and sits on your chest, and looks at you\./, /perfectly, the whole white length of her, and puts one paw on your chest, and looks at you\./, /perfectly, in a floor-length qipao, and stands over you, and looks at you\./],
        ['fo_spy_lost', {}, null, /Yuki sits on your chest\. \*He folded his mat,\* the bond observes/, /Yuki rests one paw on your chest\. \*He folded his mat,\* the bond observes/, /Yuki sits down beside you\. "He folded his mat," she observes\. "While you were bleeding\."/],
        ['rt_serpent_lost', {}, null, /with Yuki standing on your chest, soaked/, /with Yuki standing over you, soaked/, /with Yuki kneeling on your chest, soaked/],
        ['night_event', { night_ev: 'gift' }, null, /Yuki is sitting on you, very upright[\s\S]*nearly as big as she is[\s\S]*Through the bond: \*you hunt like a tree/, /The weight is one of Yuki's paws\.[\s\S]*about one mouthful to her[\s\S]*Through the bond: \*you hunt like a tree/, /Yuki is kneeling beside you[\s\S]*neck neatly wrung[\s\S]*"You hunt like a tree," she says\./],
        ['jackals_fled', {}, null, /Yuki — perched on your shoulder, dry, smug —/, /Yuki — stretched out on the one rock in midstream, dry, smug —/, /Yuki — standing on the one rock in midstream with her hem held up, dry, smug —/],
        ['lf_notes', {}, null, /adds an entry of her own with one claw: a single scratch, which you decide/, /adds an entry of her own with one claw: a single scratch, through that page and the next six, which you decide/, // v0.11.175 (P8A): Fable's rewrite
            /takes the notebook and adds her own entry: a single stroke, which you decide/],
        ['lf_human_lost', {}, null, /Yuki sits on your chest until you move\. Through the bond: \*we are coming back/, /Yuki plants one forepaw on your sternum, which is plenty, until you move\. Through the bond: \*we are coming back/, // v0.11.175 (P8A)
            /Yuki sits beside you until you get up\. "We are coming back here," she says\./],
    ];
    for (const [id, flags, min, ...want] of NQ) {
        assert(!!SCENES[id], `NQ1: scene ${id} exists`);
        ['cat', 'tiger', 'human'].forEach((form, i) => {
            const g = FM(59200 + n++, form, flags); if (min) g.minutes = min; goTo(g, SCENES, id);
            Object.assign(g.flags, flags); // the night's draw on entering (night_event) is set back to the case's
            const t = sceneView(g, SCENES).text;
            const hits = want.filter((re) => re.test(t)).length;
            const same = want.filter((re) => re.source === want[i].source).length; // a "keep" form shares the cat's line
            assert(want[i].test(t) && hits === same, `NQ1: ${id} as ${form} (${t.slice(0, 70)}…)`);
        });
    }
    // the choices' results (scene, the choice's text, flags, cat, great root-kin, human)
    const RES = [
        ['fo_drill', /^Go a round with Yuki while they watch/, {}, /Then Old Hu bows to the cat\./, /Then Old Hu bows to the great beast, from a distance/, // v0.11.170 (NX2, SR): the great root-kin's own
        /Then Old Hu bows to Yuki, and to nobody else\./],
        ['heart_spring', /^Sit by the water/, {}, /warm stretch of wall, with Yuki in your lap, and listen/, /warm stretch of wall, with Yuki's head in your lap, and listen/, /warm stretch of wall, with Yuki's shoulder against yours, and listen/],
        ['heart_camp', /^Sit up with Yuki and the hearth-log/, {}, /Yuki purrs against your chest from her first word to her last\./, /Yuki's head is on your chest, and she purrs from her first word to her last\./, /Yuki leans on your shoulder and purrs, very quietly, from her first word to her last\./],
        ['wen_lesson', /^Listen\. Ask\./, { lore_realms: true }, /exactly right\. Yuki, on your knee, has not once/, /exactly right\. Yuki, her chin on your knee, has not once/, /exactly right\. Yuki, beside you, has not once/], // v0.11.169 (P3A): Fable's rewrite
        ['rt_ford', /^Cross carefully, stone by stone/, {}, /On the far bank Yuki shakes a wet paw at the river, formally/, /On the far bank Yuki shakes a wet paw at the river, formally/, /On the far bank Yuki wrings out the hem of her dress at the river, formally/],
    ];
    for (const [id, label, flags, ...want] of RES) {
        const c = SCENES[id]?.choices?.find((x) => label.test(typeof x.text === 'function' ? '' : x.text));
        assert(!!c && typeof c.do === 'function', `NQ1: ${id}'s choice exists`);
        if (!c) continue;
        ['cat', 'tiger', 'human'].forEach((form, i) => {
            const g = FM(59400 + n++, form, flags); g.scene = id; if (id === 'fo_drill') g.minutes = 7 * 1440 + 600; // v0.11.170 (RV1, SD): the spar's Day 8 text (by the story's day)
            const t = (c.do(g) || []).filter((x) => typeof x === 'string').join('\n');
            const same = want.filter((re) => re.source === want[i].source).length; // NR1 (T): its own line and no other form's
            assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `NQ1: ${id}'s result as ${form} (${t.slice(0, 70)}…)`);
        });
    }
    // the Tans' crushing win (lf_bandits, degree 3)
    const TANS = [['cat', /eating their jerky, with Yuki in your lap\./], ['tiger', /eating their jerky, with Yuki's head in your lap\./], ['human', /eating their jerky, with Yuki next to you, eating the rest\./]]; // v0.11.175 (P8A): Fable's rewrite
    for (const [form, re] of TANS) {
        const t = STOMP.lf_bandits.win[3](FM(59500 + n++, form));
        assert(re.test(t) && TANS.filter(([, r]) => r.test(t)).length === 1, `NQ1: the Tans' crushing win as ${form}`);
    }
    // RV: the sister's last line in Act 1's epilogue: aloud only as a human
    const COOK = [['cat', /grades everybody's cooking through the bond, which leaves you to read out the marks\./], ['tiger', /grades everybody's cooking by how much of the pot comes back\./], ['human', /grades everybody's cooking out loud\./]];
    for (const host of [{ romance: true }, { ya_romance: true }, { throuple: true }]) for (const [form, re] of COOK) { // NR1 (T): every host of the clause
        const line = loveLine(FM(59600 + n++, form, { yk_path: 'sister', ending: 'bluff', ...host }, [10, 10]));
        assert(re.test(line) && COOK.filter(([, r]) => r.test(line)).length === 1, `NQ1 (RV): the sister's cooking line as ${form}, ${Object.keys(host)[0]} (${line.slice(0, 60)})`);
    }
    // T: the scenes whose text became a function still fold on a later Coil
    for (const id of ['tribute_dawn_sleep', 'tribute_dawn_talk', 'mei_lin', 'gao_talked', 'friends_watch', 'fo_spy_lost', 'rt_serpent_lost', 'jackals_fled', 'lf_human_lost', 'gao_fight_start', 'jackals_lost', 'gao_lost']) {
        for (const form of ['cat', 'tiger', 'human']) { // NR1 (T): every form, and the fold keeps the whole text
            const g = FM(59700 + n++, form); goTo(g, SCENES, id); g.seen[id] = 1; g.coil.n = 2;
            const v = sceneView(g, SCENES); noteRead(g, v.text, 1); const a = againView(g, v); // v0.11.133 (FP2): read on Coil 1
            const paras = v.text.split(/\n\s*\n/).filter((x) => x.trim()).length;
            assert(typeof v.text === 'string' && (paras < 2 || (a.fold && JSON.stringify(a).length >= v.text.length)), `NQ1 (T): ${id} folds on a later Coil as ${form}`);
        }
    }
    // T: the new texts never place the great root-kin or the human as the small cat
    const NQ_SMALL = /Yuki, from your shoulder|a cat on his shoulder|perched on your shoulder|Yuki in your lap|Yuki, on your knee|Yuki sits on your chest|Yuki standing on your chest|Yuki purrs against your chest|curls into the hollow of your neck,|climbs into the gap|a cat on your chest|Yuki is sitting on you|nearly as big as she is|grades everybody's cooking out loud/;
    for (const [id, flags] of NQ.map(([id, f]) => [id, f])) for (const form of ['tiger', 'human']) {
        const g = FM(59800 + n++, form, flags); goTo(g, SCENES, id); Object.assign(g.flags, flags);
        const m = sceneView(g, SCENES).text.match(NQ_SMALL);
        assert(!m, `NQ1 (T): ${id} as ${form} never places her as the small cat (${m?.[0]})`);
    }
    // v0.11.126 (owner pick NR1; texts by Fable): the leftovers of Fable's review: ST the lovers' loft, LV loveLine's hosts, PC "your cat"
    // to a woman, TN the Tans' taunt, RT the rats and the rain, GA Gao and the great root-kin, JL the jackals' loss
    const NR = [
        // [scene, flags, minutes, cat, great root-kin, human]
        ['fo_last_night', { romance: true }, null, /not even Yuki's, who goes and sleeps on the stove in protest\./, /not even Yuki's, who goes down and sleeps in front of the stove in protest, across the whole floor\./, /not even Yuki's, who goes and sleeps on the bench by the stove in protest\./],
        ['fo_council', {}, 12240, /"Your cat," Old Wen says, "faces north/, /"Your great beast," Old Wen says, "faces north/, // v0.11.170 (NX2): Day 9 (Day 10 has its own council); YF the great root-kin's
        /"Your companion," Old Wen says, "faces north/],
        ['night_event', { night_ev: 'rats' }, null, /They've smelled the cat\. They seem to think she's dinner\. Yuki finds/, /They seem to think she's dinner, which means they haven't seen her yet\. Yuki finds/, /They've smelled a cat and found a woman\. They seem to think she's dinner either way\. Yuki finds/],
        ['night_event', { night_ev: 'rain' }, null, /Yuki lets you know, through the bond and through her claws, that/, /Yuki lets you know, through the bond and by shaking herself dry all over you, that/, /Yuki lets you know, aloud and at some length, from under your lab coat, that/],
        ['gao_fight_start', {}, null, /you are alone, unarmed, and wearing a lab coat\. He has looked at you with his Qi-sense and felt nothing at all: a mortal\./, /you are unarmed, wearing a lab coat, and alone but for a cat\. He has looked at you both[\s\S]*a mortal's very large cat\./, /you are unarmed, wearing a lab coat, and alone but for a slight woman in a high-collared qipao\./], // v0.11.130 (YB1, GA): the human's own
        ['herb_girl', {}, null, /slide off a fence post\. By his reckoning/, /slide off a fence post, and off Yuki the way they'd slide off a second, larger fence post\./, /off Yuki the way they'd slide off a second, shorter fence post: they catch on the ears/], // v0.11.130 (YB1, HG): the human's own
        ['gao_lost', {}, null, /Eleven pounds of white cat land on his face, all claws, and while he's screaming and spinning, Mei Lin/, /A tiger\'s weight of white cat takes him off your neck and a fair way across the herb bed, and while he's screaming and rolling, Mei Lin/, /Yuki lands on his back, white tail lashing, all nails, and while he's screaming and spinning, Mei Lin/], // NS1 (GL)
        ['jackals_lost', {}, null, /Yuki — all eleven pounds of her —[\s\S]*and covered in cat\./, /Yuki — every tiger-sized inch of her —[\s\S]*underneath a good deal of cat\./, /Yuki — all of her, qipao and all —[\s\S]*with your head in Yuki's lap\./],
    ];
    for (const [id, flags, min, ...want] of NR) {
        ['cat', 'tiger', 'human'].forEach((form, i) => {
            const g = FM(60000 + n++, form, flags, flags.romance ? [80, 10] : [40, 40]); if (min) g.minutes = min; goTo(g, SCENES, id);
            Object.assign(g.flags, flags);
            const t = sceneView(g, SCENES).text;
            const same = want.filter((re) => re.source === want[i].source).length;
            assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `NR1: ${id} (${Object.values(flags).join(', ') || 'plain'}) as ${form} (${t.slice(0, 70)}…)`);
        });
    }
    // PC: Old Wen's lesson (the scene's quote; v0.11.169, P3A YF: "Your great beast" of the great root-kin) and the Tans' taunt (the fight's posture)
    for (const [form, wen, tans] of [
        ['cat', /"Your cat has been staring toward it/, /In the deep forest\. With a \*cat\*\." Little Tan/],
        ['tiger', /"Your great beast has been staring toward it/, /With a—" He looks at Yuki properly, and at some length\. A rehearsed man does not improvise\. "\*Cat\*\." Little Tan/], // v0.11.175 (P8A)
        ['human', /"Your companion has been staring toward it/, /With a \*lady\*\. In \*silk\*\." Little Tan/],
    ]) {
        const g = FM(60200 + n++, form, { lore_realms: true }); goTo(g, SCENES, 'wen_lesson'); // the forest lesson, after the realms
        assert(wen.test(sceneView(g, SCENES).text), `NR1 (PC): Old Wen's lesson as ${form}`);
        assert(tans.test(STOMP.lf_bandits.posture(FM(60300 + n++, form), 3)), `NR1 (TN): the Tans' taunt as ${form}`);
    }
    // LV: loveLine's hosts by her form (the lover's 'yuki_mei' and 'yuki_ya' keep theirs; the human lover keeps the throuple's cat)
    const HOSTS = [
        // [flags, cat, great root-kin, human]
        [{ yk_path: 'sister', romance: true }, /four places at the table now: three and a saucer\./, /four places at the table now: three and the stew pot\./, /four places at the table now, with a saucer by the fourth, out of habit\./],
        [{ yk_path: 'sister', throuple: true }, /hair and one aggrieved cat\./, /in whatever room one aggrieved cat has left you\./, /one aggrieved white-haired woman on the bench by the stove below\./],
        [{ yk_path: 'lover', throuple: true }, /hair and one aggrieved cat\. Some nights the cat isn't a cat/, /in whatever room one aggrieved cat has left you\. Some nights/, /hair and one aggrieved cat\. Some nights the cat isn't a cat/],
        [{ yk_path: 'lover', final_night: 'all' }, /and the smallest of you is a white cat on top of the pile\. Mei Lin's mother sets five places at the table now — four and a saucer/, /the largest of you is a white cat and most of the bedding\.[\s\S]*four and the stew pot;/, /and one white tail, which ends up on top of the pile[\s\S]*five places at the table now, and a saucer/], // NS1 (AC): Yuki counted once in the cat's line
        [{ yk_path: 'lover', final_night: 'yuki_mei' }, /why the cat needs a pillow\./, /why the cat needs a pillow\./, /has stopped asking where the lady with the ears sleeps\./], // v0.11.129 (CB1, LV): the human's own
        [{ yk_path: 'lover', final_night: 'yuki' }, /the cat who curls up on your chest is[\s\S]*a lonely man with a cat\./, /the cat who lays her head on your chest, which is all of her that fits, is[\s\S]*a lonely man with a very large cat\./, /Yuki sleeps there too, and walks back in at dawn beside you with moss in her hair\. The village has agreed, gravely and without a meeting, that the ears are not to be mentioned\./], // NS1 (YN); LP1 (CP), LQ2 (TN): the human's own
        [{ yk_path: 'lover', final_night: 'yuki_ya' }, /the huntress and the cat arguing/, /the huntress and the cat arguing/, /the huntress and the woman she still calls the cat arguing/], // v0.11.129 (CB1, LV)
    ];
    for (const [flags, ...want] of HOSTS) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = FM(60400 + n++, form, { ending: 'bluff', ...flags }, [10, 10]); g.yuki.realm = 7; g.james.realm = 7; g.yuki.form = form; // her human form open: the lover lines
        const line = loveLine(g);
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(line) && want.filter((re) => re.test(line)).length === same, `NR1 (LV): ${Object.entries(flags).map(([k, v]) => `${k} ${v}`).join(', ')} as ${form} (${line.slice(0, 60)})`);
    });
    // T: the results through choose(), with the scene read first (a strong James, so every check passes); the positions pinned
    for (const [id, idx, flags, wantRe] of [
        ['fo_drill', 1, {}, { cat: /bows to the cat\./, tiger: /bows to the great beast, from a distance he has plainly measured\./, /* v0.11.170 (NX2) */ human: /bows to Yuki, and to nobody else\./ }],
        ['heart_spring', 2, {}, { cat: /Yuki in your lap/, tiger: /Yuki's head in your lap/, human: /Yuki's shoulder against yours/ }],
        ['heart_camp', 3, {}, { cat: /purrs against your chest/, tiger: /head is on your chest, and she purrs/, human: /leans on your shoulder and purrs/ }],
        ['wen_lesson', 0, { lore_realms: true }, { cat: /Yuki, on your knee,/, tiger: /Yuki, her chin on your knee,/, human: /Yuki, beside you,/ }],
    ]) for (const form of ['cat', 'tiger', 'human']) {
        const g = FM(60600 + n++, form, flags); if (id === 'fo_drill') g.minutes = 7 * 1440 + 600; /* v0.11.170 (RV1, SD): Day 8 */ g.inventory.hearth_log = 1; g.james.gu = { tier: 10, level: 10, xp: 0 }; ensureBars(g);
        goTo(g, SCENES, id); Object.assign(g.flags, flags);
        const host = sceneView(g, SCENES);
        const c = host.choices.find((x) => x.index === idx);
        assert(!!c && !c.disabled, `NR1 (T): ${id}'s choice ${idx} shown as ${form}`);
        if (!c) continue;
        const r = choose(g, SCENES, idx);
        const t = r.lines.filter((x) => typeof x === 'string').join('\n');
        const others = Object.entries(wantRe).filter(([f, re]) => f !== form && re.source !== wantRe[form].source).map(([, re]) => re);
        assert(wantRe[form].test(t) && !others.some((re) => re.test(t)), `NR1 (T): ${id}'s result through choose() as ${form} (${t.slice(0, 60)})`);
        if (form === 'human') assert(!/Your cat|on your knee|in your lap\b(?! and)/.test(host.text) || id === 'heart_spring', `NR1 (T): ${id}'s own text as the human`);
    }
    // NS1 (TR): the rats night's trunk, by form (a label that is a function; its place on the scene kept)
    for (const [form, re] of [['cat', /^Up the fallen trunk with Yuki and wait them out\.$/], ['tiger', /^Step up off the ground behind Yuki and wait them out\.$/], ['human', /^Step up off the ground with Yuki and wait them out\.$/]]) { // v0.11.195 (F1, D1: NE-8): the great and human forms fly
        const g = FM(60700 + n++, form, { night_ev: 'rats' }); goTo(g, SCENES, 'night_event'); g.flags.night_ev = 'rats';
        const c = sceneView(g, SCENES).choices.find((x) => /^(Up the fallen trunk|Step up off the ground)/.test(x.label));
        assert(!!c && re.test(c.label) && SCENES.night_event.choices[c.index] && /fallen trunk|off the ground/.test(SCENES.night_event.choices[c.index].text(g)), `NS1 (TR): the trunk choice as ${form} (${c?.label})`);
    }
    // T: the positions of the touched choices (saves keep picks by position)
    for (const [id, idx, re] of [['fo_drill', 1, /^Go a round with Yuki/], ['heart_spring', 2, /^Sit by the water/], ['heart_camp', 3, /^Sit up with Yuki/], ['wen_lesson', 0, /^Listen\. Ask/], ['rt_ford', 0, /^Cross carefully/]]) {
        assert(re.test(SCENES[id].choices[idx].text), `NR1 (T): ${id}'s touched choice stays at ${idx}`);
    }
    // T: the sweep, every touched scene with each path, the forms that are not the cat: no small-cat placement, and no voice aloud from
    // the cat or the great root-kin
    const NOT_SMALL = { tiger: /Yuki, from your shoulder|a cat on his shoulder|perched on your shoulder|Yuki in your lap|Yuki, on your knee|Yuki sits on your chest|Yuki standing on your chest|purrs against your chest|curls into the hollow of your neck,|climbs into the gap|with a cat on your chest|Yuki is sitting on you|nearly as big as she is|sleeps on the stove in protest|three and a saucer|alone, unarmed|eleven pounds|Eleven pounds|covered in cat|through her claws/, human: /Yuki, from your shoulder|a cat on his shoulder|perched on your shoulder|Yuki in your lap|Yuki, on your knee|Yuki sits on your chest|Yuki standing on your chest|purrs against your chest|curls into the hollow of your neck,|climbs into the gap|a cat on your chest|Yuki is sitting on you|nearly as big as she is|sleeps on the stove in protest|three and a saucer|eleven pounds|Eleven pounds|covered in cat|through her claws|Your cat|bows to the cat|the three of you and the cat|shakes a wet paw/ };
    const ALOUD = /"He folded his mat," she observes|"You hunt like a tree," she says|"We are coming back here," she says|aloud and at some length|grades everybody's cooking out loud/;
    const SWEEP = [...NQ.map(([id, f]) => [id, f]), ...NR.map(([id, f]) => [id, f]), ['wen_lesson', { lore_realms: true }]];
    for (const [id, flags] of SWEEP) for (const form of ['cat', 'tiger', 'human']) for (const path of [null, 'sister', 'lover']) {
        const g = FM(60800 + n++, form, path ? { ...flags, yk_path: path } : flags); goTo(g, SCENES, id); Object.assign(g.flags, flags);
        const t = sceneView(g, SCENES).text;
        const m = form !== 'cat' && t.match(NOT_SMALL[form]);
        assert(!m, `NR1 (T): ${id} as ${form} (${path || 'no path'}) never places her as the small cat (${m?.[0]})`);
        assert(form === 'human' || !ALOUD.test(t), `NR1 (T): ${id} as ${form} (${path || 'no path'}): no voice aloud`);
    }
    // v0.11.127 (owner pick LP1; texts by Fable): LF the lover's pick puts her back in her small shape, as its text says; CP the
    // lover's lines for her openly human, RC the camp beat for the great root-kin, FL gao_fled and boar_lost for the great root-kin.
    // LPG: her human form open (realm 7), her current form `form`, the lover's path.
    const LPG = (seed, form, flags = {}, rel) => { const g = FM(seed, 'human', { yk_path: 'lover', ...flags }, rel); g.yuki.form = form; return g; };
    // LF: through the game: yk_choice → "More." → yk_lover → its one choice (and the sister's, as before)
    for (const [re, to] of [[/^"More\."/, 'yk_lover'], [/^"Family/, 'yk_sister']]) {
        const g = FM(61000 + n++, 'human', { ending: 'bluff', yk_back: 'bl_camp', lf_active: true }); g.rel.Yuki.a = 72; // v0.11.137 (QA2): the fire's scenes // v0.11.137 (TR1, YR): "More." from affection 72
        goTo(g, SCENES, 'yk_choice');
        const ans = sceneView(g, SCENES).choices.find((c) => !c.disabled && re.test(c.label));
        assert(!!ans && g.yuki.form === 'human', `LP1 (LF): yk_choice offers ${to} with her human`);
        if (!ans) continue;
        choose(g, SCENES, ans.index);
        assert(g.scene === to && sceneView(g, SCENES).choices.length === 1, `LP1 (LF): on to ${to} (${g.scene})`);
        const r = choose(g, SCENES, 0);
        assert(g.yuki.form === 'cat' && g.scene === 'bl_camp', `LP1 (LF): after ${to} she is the cat (${g.yuki.form}, ${g.scene})`);
        assert(to !== 'yk_lover' || (g.flags.yk_kissed === true && r.lines.some((l) => /flows back into a cat on your shoulder/.test(l))), 'LP1 (LF): the lover\'s pick keeps its flag and its line');
    }
    // the texts: each form reads its own line only (the cat keeps every old line; "keep" = the great root-kin shares it)
    const LPT = [
        // [scene, flags, rel, cat, great root-kin, human]
        ['rt_camp', {}, undefined, /the warmest lap is yours, and the cat in it isn't a cat/, /the great white wall at your back gets a good deal smaller/, /Yuki moves her bedroll the last arm's length without a sound/],
        ['yk_night_solo', {}, undefined, /the white cat goes with you[\s\S]*is a cat again before you can answer/, /the great white cat goes with you[\s\S]*is a tiger's length of cat again before you can answer/, /Yuki goes with you, on two feet, down the middle of the lane[\s\S]*is asleep again before you can answer/],
        ['yk_camp', {}, [90, 10], /a white cat pads after you[\s\S]*Yuki falls into step[\s\S]*the white cat on your shoulder[\s\S]*human, and very deliberately so/, /a white cat pads after you[\s\S]*Yuki falls into step[\s\S]*the great white cat stretched out along the far side of the fire[\s\S]*human, and very deliberately so/, /so does Yuki\. She falls into step[\s\S]*eating breakfast with perfect composure[\s\S]*who has plainly chosen her moment/],
    ];
    for (const [id, flags, rel, ...want] of LPT) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(61100 + n++, form, flags, rel); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `LP1: ${id} as ${form} (${t.slice(0, 70)}…)`);
    });
    for (const [id, cat, tiger] of [['gao_fled', /backs off down the slope, lackey in tow\. "The Crimson Lotus/, /He keeps his eyes on Yuki the whole way down[\s\S]*yawns at him/], ['boar_lost', /^(The fight ends with you in a tree and the boar underneath it|You finish the fight in one tree and Yuki in the next)/, // v0.11.174 (RV1, run 5): the woman has her own line now
         /Yuki ends up across the hollow with a mouthful of ironhide bristle[\s\S]*\*I have standards\.\*/]]) {
        for (const form of ['cat', 'tiger', 'human']) for (const path of [null, 'sister', 'lover']) {
            const g = FM(61200 + n++, form, path ? { yk_path: path } : {}); g.scene = id;
            const t = sceneView(g, SCENES).text;
            const want = form === 'tiger' ? tiger : cat, other = form === 'tiger' ? cat : tiger;
            assert(want.test(t) && !other.test(t), `LP1 (FL): ${id} as ${form} (${path || 'no path'})`);
        }
    }
    // the labels: by her form, at their old places (saves keep picks by position)
    const lbl = (sc, to) => { const i = SCENES[sc].choices.findIndex((c) => c.to === to); return [i, SCENES[sc].choices[i]]; };
    for (const [sc, to, idx, cat, human] of [['bl_camp', 'yk_camp', 4, 'Walk out past the firelight. The cat follows.', 'Walk out past the firelight. Yuki follows.'], ['rt_road', 'rt_yk_talk', 3, 'Let the other two get ahead, and walk a stretch with the cat.', 'Let the other two get ahead, and keep Yuki at your elbow.']]) {
        const [i, c] = lbl(sc, to);
        assert(i === idx && typeof c?.text === 'function', `LP1 (CP): ${sc}'s choice to ${to} stays at ${idx} (${i})`);
        if (!c) continue;
        for (const form of ['cat', 'tiger', 'human']) assert(c.text(LPG(61300 + n++, form)) === (form === 'human' ? human : cat), `LP1 (CP): ${sc}'s label as ${form}`);
    }
    {   // the bl_camp label through the screen, with her human
        const g = LPG(61350 + n++, 'human'); goTo(g, SCENES, 'bl_camp');
        assert(sceneView(g, SCENES).choices.some((c) => !c.disabled && c.label === 'Walk out past the firelight. Yuki follows.'), 'LP1 (CP): bl_camp shows the human label');
    }
    // the walk's results, also through choose(): by her form, the bond still bumped
    const WALK = [
        [/^Stop at the bend\. Kiss Yuki/, /Then there's a cat on your shoulder, washing a paw/, /Then there is a great white cat filling the path beside you/, /Then she walks on, hands clasped behind her back, innocent of everything\./], // LQ2 (TS): the great root-kin's own
        [/^"The best spot is still yours/, /On the twelfth there's a cat on your shoulder again/, /On the twelfth your hand is on a great white shoulder instead/, /On the twelfth the path straightens, and she lets go, and purrs through the bond/],
    ];
    for (const [label, cat, tiger, human] of WALK) for (const form of ['cat', 'tiger', 'human']) {
        const g = LPG(61400 + n++, form); goTo(g, SCENES, 'rt_yk_talk');
        const c = sceneView(g, SCENES).choices.find((x) => label.test(x.label));
        assert(!!c, `LP1 (CP): rt_yk_talk offers ${label} as ${form}`);
        if (!c) continue;
        const a0 = g.rel.Yuki.a;
        const t = choose(g, SCENES, c.index).lines.join('\n');
        const all = { cat, tiger, human }, want = all[form];
        assert(want.test(t) && Object.values(all).filter((re) => re.test(t)).length === 1 && g.rel.Yuki.a > a0 && g.scene === 'rt_road', `LP1 (CP): rt_yk_talk's result as ${form} (${t.slice(0, 60)}…)`);
    }
    // the sweep: the touched scenes, each path, her human form open: the human is never the small cat or "the cat" in these lines,
    // the great root-kin never in a lap
    const NOT_LP = { human: /a white cat pads after you|the white cat goes with you|is a cat again before|the white cat on your shoulder|the cat in it isn't a cat|Yuki in the warmest lap/, tiger: /the warmest lap is yours|Yuki in the warmest lap|in her small shape, purring/ }; // v0.11.128 (OF2, WL + SD)
    for (const id of ['rt_camp', 'yk_night_solo', 'yk_camp']) for (const form of ['tiger', 'human']) for (const path of ['sister', 'lover']) {
        const g = FM(61500 + n++, 'human', { yk_path: path }, [90, 10]); g.yuki.form = form; goTo(g, SCENES, id);
        const m = sceneView(g, SCENES).text.match(NOT_LP[form]);
        assert(!m, `LP1 (T): ${id} as ${form} (${path}) (${m?.[0]})`);
    }
    // v0.11.127 (owner pick LQ2, TG): the review's gaps
    {   // LF through "Ask her to stay like this for a while." (yuki_human_after) → yk_choice → "More." → the pick: the cat (the pick's text decides; KP not picked)
        const g = FM(61600 + n++, 'human', { ending: 'bluff', yk_back: 'bl_camp', lf_active: true }); g.yuki.form = 'cat'; g.rel.Yuki.a = 72; goTo(g, SCENES, 'yuki_human_after'); // v0.11.137 (TR1, YR): "More." from 72; (QA2) at the fire
        const stay = sceneView(g, SCENES).choices.find((c) => /^Ask her to stay like this/.test(c.label));
        assert(!!stay, 'LQ2 (TG): yuki_human_after offers "Ask her to stay"');
        if (stay) {
            choose(g, SCENES, stay.index);
            const more = g.scene === 'yk_choice' && sceneView(g, SCENES).choices.find((c) => /^"More\."/.test(c.label));
            assert(!!more && g.yuki.form === 'human', `LQ2 (TG): on to yk_choice with her human (${g.scene}, ${g.yuki.form})`);
            if (more) { choose(g, SCENES, more.index); choose(g, SCENES, 0); }
            assert(g.yuki.form === 'cat' && g.flags.yk_path === 'lover' && g.scene === 'lf_hub', `LQ2 (TG): after the lover's pick she is the cat, back at the Long Forest's fire (${g.yuki.form}, ${g.scene})`);
            assert(yukiSitsOut(g, { style: 'spar' }) && yukiSitsOut(g, { style: 'brawl' }), 'LQ2 (TG): as the cat she sits out a spar and a brawl (Y1)');
            g.yuki.form = 'human';
            assert(!yukiSitsOut(g, { style: 'spar' }), 'LQ2 (TG): switched back to human she joins a spar');
        }
    }
    {   // the rt_road label on screen, by her form
        for (const [form, label] of [['cat', 'Let the other two get ahead, and walk a stretch with the cat.'], ['tiger', 'Let the other two get ahead, and walk a stretch with the cat.'], ['human', 'Let the other two get ahead, and keep Yuki at your elbow.']]) {
            const g = LPG(61650 + n++, form); goTo(g, SCENES, 'rt_road');
            const labels = sceneView(g, SCENES).choices.filter((c) => !c.disabled).map((c) => c.label);
            assert(labels.includes(label) && labels.filter((l) => /^Let the other two get ahead/.test(l)).length === 1, `LQ2 (TG): rt_road shows the walk as ${form}`);
        }
    }
    {   // OS kept: a save past the lover's pick with her human keeps its form through migrate() and reads the human's lines
        const g = LPG(61700 + n++, 'human', { yk_kissed: true }); migrate(g); ensureBars(g); goTo(g, SCENES, 'rt_camp');
        assert(g.yuki.form === 'human' && /Yuki moves her bedroll the last arm's length/.test(sceneView(g, SCENES).text), 'LQ2 (TG, OS kept): an old lover save with her human keeps her human');
    }
    // LQ2 (HL, CN; Fable's MAINs): each form reads its own line only
    const LQT = [
        // [scene, flags, rel, cat, great root-kin, human]
        ['yk_night_fo', { fo_pick: 'yk' }, undefined, /with a small white cat in the hollow of your neck[\s\S]*\*Up,\* says the bond/, /with a great white cat laid along the ridge beside you[\s\S]*The thatch has held[\s\S]*\*Up,\* says the bond/, /with Yuki asleep against your neck, one arm across you[\s\S]*"Up," she says, without moving\./],
        ['rt_yk_talk', {}, undefined, /When you look round, Yuki is walking beside you on two bare feet[\s\S]*as if she'd been doing it all morning/, /When you look round, Yuki is walking beside you on two bare feet[\s\S]*as if she'd been doing it all morning/, /When you look round, Yuki has dropped back to walk beside you[\s\S]*as if she had merely happened to be there/],
        ['yk_camp', { yk_nights: 1 }, [10, 10], /The second time[\s\S]*She simply turns human in your bedroll, which is efficient/, /The second time[\s\S]*She simply turns human in your bedroll, which is efficient/, /The second time[\s\S]*She simply gets into your bedroll, which is efficient/],
        ['yk_camp', { yk_nights: 2 }, [10, 10], /It has become a thing: the fire burns low, the cat goes out into the dark, and a little later/, /It has become a thing: the fire burns low, the cat goes out into the dark, and a little later/, /It has become a thing: the fire burns low, Yuki gets up and walks out into the dark without a word of excuse, and a little later/],
    ];
    for (const [id, flags, rel, ...want] of LQT) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(61800 + n++, form, flags, rel); goTo(g, SCENES, id); // yk_camp's enter counts the night: yk_nights 1 → the second, 2 → the third
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `LQ2: ${id} ${JSON.stringify(flags)} as ${form} (${t.slice(0, 70)}…)`);
    });
    {   // HL: the loft label by her form, at its place (saves keep picks by position)
        const i = SCENES.rt_evening.choices.findIndex((c) => c.to === 'yk_night_mei'), c = SCENES.rt_evening.choices[i];
        assert(typeof c?.text === 'function', `LQ2 (HL): rt_evening's loft choice is a label function (at ${i})`);
        if (c) for (const form of ['cat', 'tiger', 'human']) assert(c.text(LPG(61900 + n++, form)) === ({ cat: 'Call the cat off the stove, and follow Mei Lin up to the loft.', tiger: 'Call the cat off the floor, and follow Mei Lin up the ladder.', human: 'Ask Yuki up off the bench, and follow Mei Lin to the loft.' }[form]), `LQ2 (HL): the loft label as ${form}`);
    }
    // v0.11.128 (owner pick OF2; Fable's MAINs): the camp's lap, Mei Lin's confession, the last nights' openings and dawns, the roof label, Ya's fence
    const OF = [
        // [scene, flags, rel, the cat's, the great root-kin's, the human's]
        ['rt_camp', {}, [80, 80], /Yuki in the warmest lap available, which tonight is Mei Lin's, and Ya keeps/, /Yuki laid behind you all like a white wall, her head in the warmest lap available, which tonight is Mei Lin's, and Ya keeps/, /Yuki leaning on the warmest shoulder available, which tonight is Mei Lin's, and Ya keeps/], // WL
        ['rt_camp', {}, [0, 80], /Yuki in the warmest lap available, which tonight is Ya's, to everyone's surprise/, /a white wall, her head in the warmest lap available, which tonight is Ya's, to everyone's surprise/, /Yuki leaning on the warmest shoulder available, which tonight is Ya's, to everyone's surprise/],
        ['rt_camp', {}, [80, 0], /Yuki in the warmest lap available, which tonight is Mei Lin's\./, /a white wall, her head in the warmest lap available, which tonight is Mei Lin's\./, /Yuki leaning on the warmest shoulder available, which tonight is Mei Lin's\./],
        ['mei_curious', {}, [80, 80], /Yuki, from your lap, sends one very clear thought/, /Yuki, a white hill at your back, sends one very clear thought/, /Yuki, across the fire and apparently asleep, sends one very clear thought/], // CL
        ['yk_night_solo', {}, undefined, /Toward dawn she is on your chest in her small shape[\s\S]*is a cat again before you can answer\./, /Toward dawn she is round you in her great shape[\s\S]*is a tiger's length of cat again before you can answer\./, /Toward dawn she is asleep on your chest, as she has been for forty years[\s\S]*is asleep again before you can answer\./], // SD
        ['yk_night_fo', { fo_pick: 'yk' }, undefined, /a village that put down a saucer of fish scraps for her at supper\./, /a village that set the stew pot down for her at supper, with great ceremony and from a distance\./, /a village that set a bowl for her at supper and then, after grave consideration, a saucer of fish scraps beside it\./], // FD
        ['yk_night_mei', {}, undefined, /^Mei Lin climbs the ladder to the loft ahead of you, and a white cat climbs it ahead of her/, /^Mei Lin climbs the ladder to the loft ahead of you, past two rungs that a very large cat cracked/, /^Mei Lin climbs the ladder to the loft ahead of you, and the lamp at the top is already lit/], // MO
        ['yk_night_mei', {}, undefined, /sitting in the hay in her human shape, ears forward[\s\S]*"In Ashfall," says Yuki, "they think I'm a cat\."/, /sitting in the hay in her human shape, ears forward[\s\S]*"In Ashfall," says Yuki, "they think I'm a cat\."/, /sitting in the hay, ears forward[\s\S]*"In Ashfall," says Yuki, "they have all looked at my ears, gravely, and agreed not to see them\."/],
        ['yk_night_ya', {}, undefined, /and a white cat curled in the small of her back, purring/, /and a great white cat curled round the pair of you, purring/, /and Yuki curled into the small of her back, white hair over both of them/], // YA
        ['yk_night_all', {}, [80, 80], /where the cat was sitting, in front of everybody\. "So am I," says Yuki, which makes Mei Lin's mother[\s\S]*and Yuki, a white cat again since some time in the night, on top of the whole pile, as high as she can get, purring like an engine\./, /^"Right,"[^\n]*\n\nThe great white cat on the floor by the stove gets up too, and goes on getting up[\s\S]*"So am I," says Yuki, which makes Mei Lin's mother[\s\S]*and a great white cat round the whole pile, since at some point in the night she went back to being one and can no longer get on top of it/, /stands up too, from the bench by the stove[\s\S]*leaving them the lamp[\s\S]*her tail across somebody's face\. "Best spot," she says, without opening her eyes\./],
        ['ya_lost', {}, undefined, /Yuki sits on the fence and offers no help whatsoever\./, /Yuki leans on the fence, which leans, and offers no help whatsoever\./, /Yuki, who was asked to stand on the left and not to rescue anyone/], // YF (the human's line since v0.11.82)
    ];
    for (const [id, flags, rel, ...want] of OF) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(62000 + n++, form, flags, rel); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `OF2: ${id} ${JSON.stringify(rel || [])} as ${form} (${t.slice(0, 70)}…)`);
        if (form !== 'cat' && ['rt_camp', 'mei_curious'].includes(id)) assert(!/from your lap|Yuki in the warmest lap/.test(t), `OF2 (WL, CL): ${id} has no small-cat lap as ${form}`);
        if (form === 'human' && /^yk_night_/.test(id)) assert(!/\bis a cat again\b|\ba white cat\b|\bthey think I'm a cat\b|\bsaucer of fish scraps for her at supper\./.test(t), `OF2: ${id} has the openly human as no cat`);
        if (form === 'tiger' && /^yk_night_/.test(id)) assert(!/small shape[^.]*again|small white cat|\ba white cat (?:curled|on top)/.test(t), `OF2: ${id} keeps the great root-kin great at dawn`);
    });
    // v0.11.128 (owner pick RV2; Fable's MAINs): the review's and Fable's notes
    const RV = [
        // [scene, flags, rel, the cat's, the great root-kin's, the human's]
        ['yk_night_all', {}, [80, 80], /where the cat was sitting, in front of everybody\. "So am I," says Yuki, which makes Mei Lin's mother[\s\S]*the scholar, the huntress, the cat —/, /on the hearthstones, in front of everybody\. "So am I," says Yuki, which makes Mei Lin's mother[\s\S]*the scholar, the huntress, the woman who was a cat at supper —/, /stands up too, from the bench by the stove, which makes Mei Lin's mother[\s\S]*the white-haired woman she set a fifth bowl for this evening[\s\S]*the scholar, the huntress, the woman with the ears —/], // M1, M2
        ['yk_night_ya', {}, undefined, /So, it turns out, is Yuki: human, sitting[\s\S]*"Your cat," Ya says, without looking round, "is a woman\."/, /So, it turns out, is Yuki: human, sitting[\s\S]*"Your cat," Ya says, without looking round, "is a woman\."/, /So, it turns out, is Yuki: sitting[\s\S]*"Your woman," Ya says, without looking round, "is a cat\."/], // M3
        ['rt_camp', { yk_path: 'sister' }, [80, 80], /catches your eye from the lap in question and looks, slowly, at the two women[\s\S]*\*It needs hands\. Imagine it\.\*/, /the tip of her tail, which is as thick as your wrist, points at the two women[\s\S]*\*It needs hands\. Imagine it\.\*/, /catches your eye and makes a small, filthy gesture at the two women/], // M4
        ['yk_night_fo', { fo_pick: 'yk' }, undefined, /goes to the loft window, and looks back at you, once\.[\s\S]*whatever she went up as, it is a woman sitting there now[\s\S]*"I know\. I rehearsed it on the stove\."/, /goes to the loft window, considers it, and looks back[\s\S]*She goes through a shoulder at a time, and the frame survives, narrowly\.[\s\S]*whatever she went up as[\s\S]*"I know\. I rehearsed it in front of the stove\. I no longer fit on it\."/, /goes to the loft window, and looks back at you, once\.[\s\S]*she has had time to arrange herself as if she had never been anywhere else[\s\S]*"I know\. I rehearsed it on the bench by the stove\."/], // FO (b–d)
        ['yk_night_fo', { fo_pick: 'yk_ya' }, undefined, /"Tonight is the cat's\."[\s\S]*"The not-cat," Ya says/, /"Tonight is the cat's\."[\s\S]*"The not-cat," Ya says/, /"Tonight is Yuki's\."[\s\S]*"The not-woman," Ya says/], // FO (a)
        ['yk_night_solo', {}, undefined, /and the white cat goes with you, and inside the ring of white trunks the cat is a woman/, /and the great white cat goes with you, down the middle of the lane, there being no other part of the lane left/, /and Yuki goes with you, on two feet, down the middle of the lane/], // SO
        ['rt_yk_talk', {}, undefined, /"I was in your lap for the log\. It poured/, /"I had my head in your lap for the log\. It poured/, /"I was on the arm of your chair for the log\. It poured/], // YT
        ['yk_sister_talk', { yk_path: 'sister' }, undefined, /^Yuki corners you by the water, in her human form, which she only uses/, /^Yuki corners you by the water, in her human form, which she only uses/, /^Yuki corners you by the water, which she does by standing exactly where you meant to go\. She only does it/], // ST
    ];
    for (const [id, flags, rel, ...want] of RV) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(62200 + n++, form, flags, rel); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `RV2: ${id} ${JSON.stringify(flags)} as ${form} (${t.slice(0, 70)}…)`);
    });
    {   // MT: the title by her form
        for (const form of ['cat', 'tiger', 'human']) { const g = LPG(62300 + n++, form); goTo(g, SCENES, 'yk_night_mei'); assert(sceneView(g, SCENES).title === (form === 'human' ? 'The Herb Loft, and Yuki' : 'The Herb Loft, and the Cat'), `RV2 (MT): yk_night_mei's title as ${form}`); }
    }
    {   // T (the review's gaps): the cat's whole lines pinned; the human's nights call her "the cat" only in speech; the great root-kin's "Best spot" stays the bond's
        const PIN = [
            ['yk_night_solo', {}, `Toward dawn she is on your chest in her small shape, purring, as if nothing ever happened, and then — just for a second, as the light comes up — she isn't, and she kisses you once, and says, "Go and win," and is a cat again before you can answer.`],
            ['yk_night_fo', { fo_pick: 'yk' }, `You wake in grey light with a small white cat in the hollow of your neck, purring as if she had never been anything else. Down in the lane the first doors are opening. *Up,* says the bond. *They're going to bow at you. Try to look like a man who slept.*`],
            ['yk_night_fo', { fo_pick: 'yk' }, `Below you sleeps a village that put down a saucer of fish scraps for her at supper. She laughs about it, without a sound, against your throat.`],
            ['yk_night_ya', {}, `Toward dawn you wake in the moss with Ya sprawled across your legs, snoring, and a white cat curled in the small of her back, purring, and the grove singing over all three of you.`],
            ['yk_night_all', {}, `Toward dawn: Mei Lin's head on your chest; Ya across both of you like a fallen tree; and Yuki, a white cat again since some time in the night, on top of the whole pile, as high as she can get, purring like an engine. *Best spot,* says the bond.`],
            ['yk_night_mei', {}, `Mei Lin climbs the ladder to the loft ahead of you, and a white cat climbs it ahead of her, and at the top there is no cat.`],
            ['rt_camp', {}, `The three of you sit round it with Yuki in the warmest lap available, which tonight is Mei Lin's, and Ya keeps finding reasons to lean across her to poke the fire.`],
        ];
        for (const [id, flags, line] of PIN) { const g = LPG(62400 + n++, 'cat', flags, [80, 80]); goTo(g, SCENES, id); assert(sceneView(g, SCENES).text.includes(line), `RV2 (T): ${id}: the cat's line word for word`); }
        for (const id of ['yk_night_solo', 'yk_night_mei', 'yk_night_ya', 'yk_night_all']) for (const fo_pick of [undefined]) {
            const g = LPG(62500 + n++, 'human', {}, [80, 80]); goTo(g, SCENES, id);
            const prose = sceneView(g, SCENES).text.replace(/"[^"]*"/g, '');
            const m = prose.match(/\bthe cat\b|\ba white cat\b|\bsmall shape\b/);
            assert(!m, `RV2 (T): ${id}'s narration doesn't call the human a cat (${m?.[0]})`);
        }
        for (const pick of ['yk', 'yk_ya', 'yk_roof']) { const g = LPG(62600 + n++, 'human', { fo_pick: pick }); goTo(g, SCENES, 'yk_night_fo'); const prose = sceneView(g, SCENES).text.replace(/"[^"]*"/g, ''); assert(!/\bthe cat\b|small white cat|whatever she went up as/.test(prose), `RV2 (T): yk_night_fo (${pick})'s narration doesn't make the human a cat`); }
        { const g = LPG(62700 + n++, 'tiger', {}, [80, 80]); goTo(g, SCENES, 'yk_night_all'); assert(/purring like a larger engine\. \*Best spot,\* says the bond\.$/.test(sceneView(g, SCENES).text), "RV2 (T): the great root-kin's \"Best spot\" stays the bond's"); }
    }
    {   // FL: the roof label by her form, at its place (saves keep picks by position); both hosts keep their own label
        const i = SCENES.fo_last_night.choices.findIndex((c) => c.to === 'yk_night_fo'), c = SCENES.fo_last_night.choices[i];
        assert(i === SCENES.fo_last_night.choices.length - 1 && typeof c?.text === 'function', `OF2 (FL): fo_last_night's roof choice is a label function, last (at ${i})`);
        if (c) for (const form of ['cat', 'tiger', 'human']) {
            assert(c.text(LPG(62100 + n++, form, {}, [0, 0])) === (form === 'human' ? 'Follow Yuki out onto the roof.' : 'Follow the cat out onto the roof.'), `OF2 (FL): the roof label as ${form}`);
            assert(c.text(LPG(62100 + n++, form, {}, [80, 80])) === 'Tonight, Yuki. Wait until the roof is yours.', `OF2 (FL): both hosts keep their label as ${form}`);
        }
    }
    // v0.11.129 (owner pick CB1; Fable's MAINs): the human makes four (CA, TL, FT, HV, BF, MO); v0.11.128's leftovers (YF2, LV, LX, YA, RF, NA)
    const CB = [
        // [scene, flags, rel, the cat's, the great root-kin's, the human's]
        ['rt_camp', {}, [80, 80], /The three of you sit round it with Yuki in the warmest lap available, which tonight is Mei Lin's, and Ya keeps/, /The three of you sit round it with Yuki laid behind you all like a white wall/, /The four of you sit round it, Yuki leaning on the warmest shoulder available, which tonight is Mei Lin's, and Ya keeps/], // CA
        ['rt_camp', {}, [0, 80], /with Yuki in the warmest lap available, which tonight is Ya's, to everyone's surprise/, /a white wall, her head in the warmest lap available, which tonight is Ya's/, /The four of you sit round it, Yuki leaning on the warmest shoulder available, which tonight is Ya's, to everyone's surprise/],
        ['rt_fire_talk', {}, [80, 80], /only sad\.\n\nMei Lin's: /, /only sad\.\n\nMei Lin's: /, /according to Ya and Mei Lin, no crime at all, only sad\. Yuki, in her turn, says she has never done anything wrong in her life, and looks at each of you until the subject closes\.\n\nMei Lin's: /], // FT
        ['rt_fire_talk', {}, [0, 0], /people you'll never know about\.\n\nWhen the fire/, /people you'll never know about\.\n\nWhen the fire/, /people you'll never know about\. Yuki says only that she slept through the blast, which is true, and that she has not forgiven the chamber, which is also true\.\n\nWhen the fire/],
        ['heart_view', {}, [0, 0], /The three of you lie down close together, for warmth and for courage\. Yuki takes the exact centre\./, /The three of you lie down close together, for warmth and for courage\. Yuki lies down round all of you, and counts that as the exact centre\./, /The four of you lie down close together, for warmth and for courage\. Yuki takes the exact centre\./], // HV
        ['bl_fireside', { bl_region: 'ah' }, [0, 0], /The three of you sit in a loose ring, as people do/, /The three of you sit in a loose ring, as people do/, /The four of you sit in a loose ring, as people do/], // BF
        ['rt_mother', {}, [0, 0], /She looks at you\. At Ya she looks longest of all\.[\s\S]*"Wash\. All three of you\./, /She looks at you\. At Ya she looks longest of all\.[\s\S]*"Wash\. All three of you\./, /She looks at you\. She looks at Yuki, ears and all, and lets that wait\. At Ya she looks longest of all\.[\s\S]*"Wash\. All four of you\./], // MO
        ['lf_exit', { yk_path: 'sister' }, undefined, /then turns into a cat on your shoulder at the treeline\. \*If the first woman/, /in her great shape, her shoulder at your hip, and takes most of the path\. At the treeline she stops and looks the world over\. \*If the first woman/, /on two bare feet, and at the treeline does not turn into anything\. "If the first woman we meet is pretty," she says, "I am telling her about the lab coat\. All of it\."$/], // LX
        ['lf_exit', { yk_path: 'lover' }, undefined, /Then she's a cat on your shoulder again, tail curled round your neck/, /with your hand on her great white shoulder[\s\S]*with all of her weight, purring like she owns you\. Which, you reflect, is fair\.$/, /Then she goes on holding it, out into the open, tail curled round your wrist, as if she owns you\. Which, you reflect, is fair\.$/],
        ['yk_night_fo', { yk_path: 'lover', fo_pick: 'yk_ya' }, undefined, /is gone\. Yuki goes out after her, the other way, up\. You follow\./, /is gone\. Yuki goes out after her, a shoulder at a time, and the frame survives, narrowly; then the other way, up\. You follow\./, /is gone\. Yuki goes out after her, the other way, up\. You follow\./], // YA
    ];
    for (const [id, flags, rel, ...want] of CB) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(62800 + n++, form, flags, rel); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `CB1: ${id} ${JSON.stringify(flags)} ${JSON.stringify(rel || [])} as ${form} (${t.slice(0, 70)}…)`);
        if (form === 'human') { const m = t.replace(/"[^"]*"/g, '').match(/\b(?:the )?three of you\b|\bAll three\b|\bturns into a cat\b|\ba cat on your shoulder\b/i); assert(!m, `CB1: ${id} counts the human as one of you and keeps her human (${m?.[0]})`); }
        if (form === 'tiger' && id === 'lf_exit') assert(!/on your shoulder|turns into a cat/.test(t), 'CB1 (LX): the great root-kin ends great at the treeline');
    });
    {   // TL: the talk's label by her form, a function at its place (saves keep picks by position)
        const i = SCENES.rt_camp.choices.findIndex((c) => c.to === 'rt_fire_talk'), c = SCENES.rt_camp.choices[i];
        assert(i === 1 && typeof c?.text === 'function', `CB1 (TL): rt_camp's talk is a label function, at its old place 1 (at ${i})`);
        if (c) for (const form of ['cat', 'tiger', 'human']) assert(c.text(LPG(62900 + n++, form)) === (form === 'human' ? 'Talk, the four of you, until the fire burns down.' : 'Talk, the three of you, until the fire burns down.'), `CB1 (TL): the label as ${form}`);
    }
    {   // RF: the roof's first sentences after all three leads, in every form; NA: the great root-kin changes in plain view
        for (const pick of ['yk', 'yk_ya', 'yk_roof']) for (const form of ['cat', 'tiger', 'human']) {
            const g = LPG(63000 + n++, form, { fo_pick: pick }); goTo(g, SCENES, 'yk_night_fo'); const t = sceneView(g, SCENES).text;
            assert(/\n\nThe night is cold, and the stars are the wrong stars, as they have been every night since the lab\. When you look for her she is up on the ridge, facing north, and /.test(t) && !/The thatch is cold|By the time you are out on the thatch/.test(t), `CB1 (RF): yk_night_fo (${pick}) as ${form}`);
        }
        const g = LPG(63100 + n++, 'tiger', {}, [80, 80]); goTo(g, SCENES, 'yk_night_all'); const t = sceneView(g, SCENES).text;
        assert(!/stands up too, in her human shape/.test(t) && /there is a white-haired woman with cat's ears standing on the hearthstones, in front of everybody\./.test(t), 'CB1 (NA): the great root-kin rises from the floor and changes in plain view');
    }
    {   // YF2: the spar's fence by her form (the great root-kin leans, as in ya_lost); LV: the human's epilogue lines
        const c = SCENES.ya_challenge.choices.find((x) => x.combat);
        for (const [form, re] of [['cat', /Yuki takes the fence — on it, or along the whole top of it, depending on the day — and does not so much as twitch an ear\./], ['tiger', /Yuki takes the fence — her shoulder against it, since the top of it would not survive her — and does not so much as twitch an ear\./], ['human', /Yuki steps off the fence, shakes out her sleeves/]]) {
            const tail = c ? c.combat(LPG(63200 + n++, form)).tail : '';
            assert(re.test(tail) && (form !== 'tiger' || !/on it, or along the whole top/.test(tail)), `CB1 (YF2): the spar's fence as ${form}`);
        }
        for (const [fn, re] of [['yuki_mei', /\bthe cat\b/], ['yuki_ya', /the huntress and the cat\b/]]) assert(!re.test(loveLine(LPG(63300 + n++, 'human', { final_night: fn }))), `CB1 (LV): ${fn} doesn't make the human a cat in narration`);
    }
    {   // T: the cat's changed lines word for word
        const PIN = [
            ['rt_camp', {}, [80, 80], `The three of you sit round it with Yuki in the warmest lap available, which tonight is Mei Lin's, and Ya keeps finding reasons to lean across her to poke the fire.`],
            ['rt_mother', {}, [0, 0], `"Your father," she says finally, "was exactly the same." She moves out of the doorway. "Wash. All three of you. You smell as if the forest had died on you."`],
            ['lf_exit', { yk_path: 'sister' }, undefined, `Yuki walks the first mile beside you in her human shape, then turns into a cat on your shoulder at the treeline. *If the first woman we meet is pretty,* says the bond, *I am telling her about the lab coat. All of it.*`],
            ['lf_exit', { yk_path: 'lover' }, undefined, `Yuki holds your hand to the treeline. Then she's a cat on your shoulder again, tail curled round your neck, purring like she owns you. Which, you reflect, is fair.`],
            ['heart_view', {}, [0, 0], `The three of you lie down close together, for warmth and for courage. Yuki takes the exact centre.`],
        ];
        for (const [id, flags, rel, line] of PIN) { const g = LPG(63400 + n++, 'cat', flags, rel); goTo(g, SCENES, id); assert(sceneView(g, SCENES).text.includes(line), `CB1 (T): ${id}: the cat's line word for word`); }
    }
    {   // T (Fable's review): the cat's other changed lines pinned; the sister's path and no path read the same; the label on screen and picked at 1; the great root-kin's yk_night_all
        const PIN2 = [
            ['bl_fireside', { bl_region: 'ah' }, [0, 0], `The three of you sit in a loose ring, as people do who have come through things together and have no name yet for what it has made of them.`],
            ['rt_fire_talk', {}, [80, 80], `Yours has a grant committee in it and is, according to both women, no crime at all, only sad.\n\nMei Lin's: she laughed at Gao Feng.`],
            ['rt_fire_talk', {}, [0, 0], `Mei Lin tells of her father. You tell of the lab, and the blast, and the people you'll never know about.\n\nWhen the fire is down to embers`],
        ];
        for (const [id, flags, rel, line] of PIN2) { const g = LPG(63500 + n++, 'cat', flags, rel); goTo(g, SCENES, id); assert(sceneView(g, SCENES).text.includes(line), `CB1 (T): ${id}: the cat's line word for word`); }
        for (const path of ['sister', undefined]) for (const [id, flags, rel, re] of [['rt_camp', {}, [80, 0], /The four of you sit round it, Yuki leaning/], ['rt_mother', {}, [0, 0], /"Wash\. All four of you\./], ['heart_view', {}, [0, 0], /The four of you lie down close/], ['bl_fireside', { bl_region: 'ah' }, [0, 0], /The four of you sit in a loose ring/]]) {
            const g = LPG(63600 + n++, 'human', { ...flags, yk_path: path }, rel); goTo(g, SCENES, id);
            assert(re.test(sceneView(g, SCENES).text), `CB1 (T): ${id} as the human on ${path || 'no'} path`);
        }
        {   const g = LPG(63700 + n++, 'human', {}, [80, 0]); goTo(g, SCENES, 'rt_camp');
            const c = sceneView(g, SCENES).choices.find((x) => x.label === 'Talk, the four of you, until the fire burns down.');
            assert(c?.index === 1 && !c.disabled, `CB1 (TL): the human's label on screen, at 1 (${c?.index})`);
            if (c) { choose(g, SCENES, c.index); assert(g.scene === 'rt_fire_talk' && wasPicked(g, 'rt_camp', 1), 'CB1 (TL): the pick goes to the talk and is recorded at 1'); }
        }
        {   const g = LPG(63800 + n++, 'tiger', {}, [80, 80]); goTo(g, SCENES, 'yk_night_all'); const t = sceneView(g, SCENES).text;
            assert(t.indexOf('in front of everybody') < t.indexOf('"So am I,"') && !/stands up too, in her human shape|small white cat/.test(t), 'CB1 (NA): the great root-kin changes before she speaks');
        }
    }
    // v0.11.129 (owner pick CS1; Fable's MAINs): the review's and Fable's notes (BF2, NM, FW, TM, LB, RA, HG, HC, ML, ND, YC)
    const CS = [
        // [scene, flags, rel, the cat's, the great root-kin's, the human's]
        ['bl_fireside', { bl_region: 'dw' }, [80, 80], /Later, when you all settle, the three of you lie nearer together than the cold requires/, /Later, when you all settle, the three of you lie nearer together than the cold requires/, /Later, when you all settle, the four of you lie nearer together than the cold requires/], // BF2
        ['rt_fire_talk', {}, [80, 80], /according to both women, no crime at all, only sad\.\n/, /according to both women, no crime at all, only sad\.\n/, /according to Ya and Mei Lin, no crime at all, only sad\. Yuki, in her turn/], // FW
        ['heart_view', {}, [0, 0], /\n\*Tomorrow,\* says Yuki, and there is no sarcasm in it anywhere\.$/, /\n\*Tomorrow,\* says Yuki, and there is no sarcasm in it anywhere\.$/, /\n"Tomorrow," says Yuki, and there is no sarcasm in it anywhere\.$/], // TM
        ['heart_view', { ya_romance: true }, [0, 80], /Mei Lin lies down on Yuki's other side, close by, and wishes you both goodnight/, /Mei Lin lies down against Yuki's great white flank, close by, and wishes you both goodnight/, /Mei Lin lies down on Yuki's other side, close by, and wishes you both goodnight/], // HG
        ['lf_exit', { yk_path: undefined }, undefined, /Yuki's opinion, through the bond: \*both\.\*$/, /Yuki's opinion, through the bond: \*both\.\*$/, /Yuki's opinion, delivered aloud: "Both\."$/], // LB (no path: nothing follows)
        ['lf_exit', { yk_path: 'sister' }, undefined, /Yuki's opinion, through the bond: \*both\.\*\n\n/, /Yuki's opinion, through the bond: \*both\.\*\n\n/, /Yuki's opinion, delivered aloud: "Both\."\n\nYuki walks the first mile beside you on two bare feet/],
        ['rt_arrive', {}, [0, 0], /\n\nTheir eyes go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first: white, long as a handcart[\s\S]*Then they go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first — the white hair, the ears, the tail — and move on, gravely, as from a matter that belongs to the outlander and is therefore not to be looked at twice\. Then they go to Ya and stay there\. Bare arms/], // RA; v0.11.130 (YB1, RA): the great root-kin's own
        ['heart_camp', { trio: 3 }, [80, 80], /The three of you sleep in a heap by the fire now\./, /The three of you sleep in a heap by the fire now\./, /The four of you sleep in a heap by the fire now\./], // HC
        ['log_comfort', { trio: 3 }, [80, 80], /You fall asleep there, the three of you, on Selene's bridge/, /You fall asleep there, the three of you, on Selene's bridge/, /You fall asleep there, all four of you, on Selene's bridge/], // v0.11.174 (P7A): she is asleep, not dead
        ['mei_lin', { yk_path: 'sister' }, undefined, /\n\n\*Pretty,\* the bond announces, at a volume your skull/, /\n\n\*Pretty,\* the bond announces, at a volume your skull/, /blinks back\.\n\nMei Lin's eyes go to the ears, then to the tail, then back to the ears\.[\s\S]*"Are those real\?" asks Mei Lin\.[\s\S]*\n\n\*She's pretty,\* says the bond instead, for you alone, appallingly loud inside your skull, from a woman standing at your elbow/], // ML
        ['mei_lin', { yk_path: 'lover' }, undefined, /\n\n\*Pretty,\* the bond remarks, in the tone of a buyer[\s\S]*\*I approve/, /\n\n\*Pretty,\* the bond remarks, in the tone of a buyer[\s\S]*\*I approve/, /"Are those real\?" asks Mei Lin\.[\s\S]*\*She's pretty,\* says the bond instead, for you alone, appraising, unbothered, while its owner stands at your elbow and looks at the hills\./],
        ['yk_night_all', {}, [80, 80], /^"Right,"[^\n]*\n\nThe white cat on the bench beside you stands up too, and goes on standing up[\s\S]*the scholar, the huntress, the cat —[\s\S]*and Yuki, a white cat again since some time in the night, on top/, /the scholar, the huntress, the woman who was a cat at supper —[\s\S]*since at some point in the night she went back to being one and can no longer get on top of it/, /stands up too, from the bench by the stove[\s\S]*the scholar, the huntress, the woman with the ears —/], // YC, NM, ND
    ];
    for (const [id, flags, rel, ...want] of CS) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(64000 + n++, form, flags, rel); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `CS1: ${id} ${JSON.stringify(flags)} ${JSON.stringify(rel || [])} as ${form} (${t.slice(0, 70)}…)`);
    });
    {   // FW: her word in the joke's result, the human only; ML: no path, no beat; the romance beats unchanged
        for (const form of ['cat', 'tiger', 'human']) {
            const g = LPG(64100 + n++, form, {}, [80, 80]); goTo(g, SCENES, 'rt_fire_talk');
            const r = choose(g, SCENES, 0);
            assert(r.lines[0] === 'Ya laughs. Mei Lin lasts one breath longer, then laughs too, like a lock giving way.' + (form === 'human' ? ' Yuki does not laugh. She was right here too.' : ''), `CS1 (FW): the joke's result as ${form}`);
        }
        const g = LPG(64200 + n++, 'human', { yk_path: undefined }); goTo(g, SCENES, 'mei_lin');
        assert(!/Are those real|She's pretty/.test(sceneView(g, SCENES).text), 'CS1 (ML): no path, no beat as the human');
        for (const path of ['sister', 'lover']) { const h = LPG(64300 + n++, 'human', { yk_path: path }); goTo(h, SCENES, 'romance'); assert(/Through the bond, (?:from somewhere very far away|sleepy and amused from the stove)/.test(sceneView(h, SCENES).text), `CS1 (ML): the ${path}'s romance beat stays the bond's, from a distance`); }
    }
    // v0.11.130 (owner pick YB1; Fable's MAINs): LL the 19 lose / flee / fail scenes place the great root-kin; the cat's and the
    // human's texts unchanged (the tiger's text less its line is the cat's, word for word); roots_lost's no-Ya clause by form
    const YB = [
        // [scene, flags, the great root-kin's line, [her clause, the cat's clause] where the text also swaps one]
        ["ah_hawks_lost", {}, "\n\nYuki sits upwind with a hawk's tail feathers in her teeth and a scorched stripe down one flank. *Mine is also holy,* says the bond. *Nobody is reviewing mine.*", null, null, "\n\nYuki stands upwind with a hawk's tail feathers in one fist and a scorched sleeve. \"Mine is also holy,\" she says. \"Nobody is reviewing mine.\""], // v0.11.172 (P5A RV1, L5): and the woman's own line (Fable's)
        ["ape_lost", {}, "\n\nYuki lies along your other side with one foreleg held off the ground. The ape threw her before it hit you, and she came back on three legs, in time to see it go. She is purring, low, the purr that isn't for pleasure.", null, null, "\n\nYuki sits against your other side with one arm held close. The ape threw her before it hit you, and she was back on her feet in time to see it go. She says nothing. Her tail lies across your knees and does not move."], // v0.11.172 (P5A RV1, L5): and the woman's own line (Fable's)
        ["arson_lost", {}, " Yuki has one of them flat in the lane under both forepaws, and it is the wrong one: the torch was in the other man's hand. She keeps him all the same, and when the street has finished with the fire it finds it still has somebody to be grave at.", null, [" Yuki has one of them pinned in the lane with her knee between his shoulders, and it is the wrong one: the other man had the torch. She keeps him all the same, so that when the street has finished with the fire there is still somebody left for it to be grave at.", '']], // v0.11.169 (P3A, YF): and the woman's line // v0.11.131 (XB2, AP): she keeps him
        ["bl_night_lost", {}, " Yuki, who had hold of it until it had hold of her ear, lies across your feet with the ear at half-mast. *Three voices,* says the bond. *I am also telling you off. I am just doing it quietly.*", null, null, " Yuki, who had hold of it until it had hold of her sleeve, sits on your feet. \"Three voices,\" she says. \"I am also telling you off. I am doing it quietly.\""], // v0.11.172 (P5A RV1, L5): and the woman's own line (Fable's)
        ["collectors_lost", {}, "\n\nThen he flicks two fingers, and the net comes off Yuki: a spirit-beast net, thrown from his sleeve in the first breath of the fight, before he so much as drew. She has been under it since your knees went. She walks over on legs that aren't quite steady and stands across you. Nobody asks her to move."],
        ["dw_serpent_lost", { fly: true }, "\n\nYuki surfaces a moment later with a length of serpent in her mouth that is no longer attached to anything, climbs out, and shakes a tiger's worth of swamp over all three of you. *It let go,* says the bond. *Eventually. You're welcome.*", null, null, "\n\nYuki comes up last, some way off, with her hair plastered flat and a length of serpent in one fist that is attached to nothing any more. She wades out and wrings her tail over all three of you. \"It let go,\" she says. \"Eventually. You're welcome.\""], // v0.11.172 (P5A, FB): and the woman's own line (Fable's)
        ["far_lost", {}, " Yuki comes in behind you on three good legs and lies down across the doorway. Mei Lin steps over her without breaking off, comes back with the salve, and starts on the cat. The lecture now covers you both.", null, [" Yuki comes in behind you holding one arm with the other, and sits on the doorstep without a word. Mei Lin does not break off. She fetches the salve, turns the arm to the light, and starts on it. The lecture now covers you both.", '']], // v0.11.169 (P3A, YF): and the woman's line
        // fo_spy_fled: v0.11.170 (NX2, CA1 FB) its own check below (the cat's and the woman's lines now too)
        ["fo_wolf_lost", {}, " Yuki comes out of the barley the other way a moment later, with grey fur in her teeth and no goat: she went after the one that came at her, the lame one, while the other went round. Wolves do that."],
        ["mire_lost", { fly: true }, " Yuki rises beside you, black to the shoulder, having learnt that the mire holds a tiger's weight far better than it holds a cat's, and lets go of it far more slowly. *We do not speak of this,* says the bond."], // v0.11.131 (XB2, FY): for a flier
        ["night_fled", {}, " Yuki walks behind with the blanket in her mouth, which keeps her from saying what she thinks of running from something she outweighs. The bond says it anyway."],
        ["ring_lost", {}, " Yuki is already out: she backed the whole length of the gallery ahead of you, because the rings were grown for gardeners and there is nowhere in them to turn that much cat round. She sits down and starts on the splinters in her forepaw.", null, null, " Yuki is out already, standing clear with her tail held up off the floor, taking splinters out of her sleeve one by one. \"They have the shelves,\" she says. \"I don't see why they need us as well.\""], // v0.11.173 (P6A, FB): and the woman's own line (Fable's)
        ['roots_lost', {}, " The collar is in Yuki's teeth. She climbs the shaft backwards with you swinging under her chin like a kitten, and when she sets you down at the top there are husk-lines raked down both her flanks, which neither of you mentions."],
        ["rr_bridge_fail", {}, " Yuki goes with her, low and silent, which is how you learn the two of them have been waiting for the bridge to fail.", null, null, " Yuki is half a step behind her, tail lashing. \"You tried,\" she tells you over her shoulder, with no regret in it at all."], // v0.11.172 (P5A, FB): and the woman's own line (Fable's)
        ["rr_elk_lost", {}, " The elk put Yuki through a thornbrake first, which is how it got to you. She comes out of it backwards, bristling, and sits down beside Mei Lin to wait her turn.", null, null, " The elk threw Yuki into a thornbrake first, which is how it reached you. She walks out with her hair full of thorns and her face full of nothing, and holds a scratched arm out to Mei Lin without being asked."], // v0.11.172 (P5A, FB): and the woman's own line (Fable's)
        ["rt_brawl_lost", {}, "\n\nFrom the wine-shop bench, most of which she is, Yuki yawns to the back teeth. *Fists only,* says the bond. *Your rule. I kept it for you.*", null, null, "\n\nYuki is neither in the trough nor on the roof. She stands where she stood, straightening one sleeve. \"Fists only,\" she says. \"Your rule. I kept it for you. You're welcome.\""], // v0.11.174 (P7A, FB): the woman's line
        ["rt_duel_lost", {}, "One hand was for you. The other, you gather, was for Yuki, who lies ten paces up the road, a long white shape getting its legs under it one at a time.\n\n", null, null, "One hand was for you. The other, you gather, was for Yuki: she is on one knee ten paces up the road, hair across her face, ears flat. \"Both hands,\" she tells the dust, with precision. \"I counted.\"\n\n"], // v0.11.174 (P7A, FB): the woman's line
        ["rt_parley_fail", {}, " The two on Yuki's side stop a spear's length further off than the others. She watches them do it without getting up.", null, null, " The two who draw Yuki's side look at the ears, then at each other. \"Further back,\" she advises, and they have obeyed before they wonder why."], // v0.11.174 (P7A, FB): the woman's line
        ["wyrm_lost", { fly: true }, " Yuki lets go of the wyrm's neck when she is ready and comes down the forty metres at a walk, on nothing. She stops a hand's width above the water. Cats, it turns out, don't have to swim. This one looks at the three of you who did.", null, null, " Yuki lets go of the wyrm when it suits her and comes down the forty metres of air like a woman on a staircase. She stops a hand above the water and looks the three of you over. \"I didn't jump,\" she says. \"I'd like that noted.\""], // v0.11.172 (P5A, FB): and the woman's own line (Fable's) // v0.11.131 (XB2, FY): for a flier
        ['roots_lost', { ya_party: false }, " The collar is in Yuki's teeth. She climbs the shaft backwards with you swinging under her chin like a kitten, and when she sets you down at the top there are husk-lines raked down both her flanks, which neither of you mentions.", ['Mei Lin calling the handholds down from the lip above in a voice that is very nearly steady', 'Mei Lin and Yuki between them, which ought not to be physically possible'], ['Yuki in a qipao that has not picked up so much as a thread of husk, ', '']], // v0.11.131 (XB2, RH): the human's own clause
        ['ring_lost', { ya_party: false }, " Yuki is already out: she backed the whole length of the gallery ahead of you, because the rings were grown for gardeners and there is nowhere in them to turn that much cat round. She sits down and starts on the splinters in her forepaw.", null, null, " Yuki is out already, standing clear with her tail held up off the floor, taking splinters out of her sleeve one by one. \"They have the shelves,\" she says. \"I don't see why they need us as well.\""], // v0.11.173 (P6A, FB)
    ];
    for (const [id, { fly, ...flags }, line, swap, hswap, hline] of YB) {
        // v0.11.131 (XB2, FY): a flight row compares her with the cat at Foundation (who flies too: realm 1), as she always flies
        const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => { const g = FM(65000 + n++, form, flags); if (fly && form === 'cat') { g.yuki.realm = 1; g.james.realm = 1; } goTo(g, SCENES, id); return sceneView(g, SCENES).text; });
        assert(tiger.includes(line) && !cat.includes(line) && !human.includes(line), `YB1 (LL): ${id} ${JSON.stringify(flags)}: the great root-kin's line, hers alone`);
        if (hline) { assert(human.includes(hline) && human.replace(hline, '') === cat && !cat.includes(hline) && !tiger.includes(hline) && tiger.replace(line, '') === cat, `YB1 (LL) / P5A (FB): ${id} ${JSON.stringify(flags)}: the woman's line, hers alone, the cat's text the base`); continue; }
        assert((swap ? tiger.replace(swap[0], swap[1]) : tiger).replace(line, '') === cat && (hswap ? human.replace(hswap[0], hswap[1]) : human) === cat, `YB1 (LL): ${id} ${JSON.stringify(flags)}: the cat's and the human's texts unchanged`);
    }
    {   // v0.11.170 (owner picks NX2, CA1 FB; Fable's): fo_spy_fled has the great root-kin's line and now the cat's and the woman's, each hers alone
        const L = { cat: "\n\nYuki is in the portrait as well: a small smudge on your drawn shoulder, labelled *pet?*. The bond says nothing, at some length.", tiger: "\n\nYuki's portrait has the whole facing page, and its margin says only *large*, underlined twice. She watches the mountain until he is off the last switchback. *Uphill,* says the bond. *No.*", human: "\n\nYuki has the facing page to herself, ears and tail drawn with care, and a margin that says *the lady: do not approach*. \"Accurate,\" she says, and closes the ledger for you." };
        const v = ['cat', 'tiger', 'human'].map((form) => { const g = FM(65900 + n++, form, {}); goTo(g, SCENES, 'fo_spy_fled'); return [form, sceneView(g, SCENES).text]; });
        const base = v[1][1].replace(L.tiger, '');
        assert(v.every(([f, t]) => t.includes(L[f]) && t.replace(L[f], '') === base), 'YB1 (LL) / NX2 (FB): fo_spy_fled: her line in each form, hers alone');
    }
    {   // v0.11.130 (owner pick RB2; Fable's review of YB1): WC two wolves, RL out before the shelf, NK no foe's body part, CL no count
        // and no "his disciples" with Gao broken or turned or the militia, BR the camp's blanket
        const tiger = (id, flags) => { const g = FM(65800 + n++, 'tiger', flags); goTo(g, SCENES, id); return sceneView(g, SCENES).text; };
        assert(!/\bthree\b|the rest went round/.test(tiger('fo_wolf_lost', {})) && /the lame one, while the other went round/.test(tiger('fo_wolf_lost', {})), 'RB2 (WC): two wolves');
        for (const f of [{}, { ya_party: false }]) { const t = tiger('ring_lost', f); assert(t.indexOf('drops a shelf') < t.indexOf('Yuki is already out') && !/comes out last/.test(t), `RB2 (RL): she is out before the shelf ${JSON.stringify(f)}`); }
        assert(!/haunch|wing|tail|coil/.test(tiger('bl_night_lost', {}).split('Yuki, who')[1] || 'x') && /had hold of it until it had hold of her ear/.test(tiger('bl_night_lost', {})), 'RB2 (NK): no foe\'s body in her line');
        for (const f of [{}, { gao_broken: true }, { gao_turned: true }, { militia: true }]) { const t = tiger('collectors_lost', f); assert(/the net comes off Yuki/.test(t) && !/three of them|his disciples/.test(t), `RB2 (CL): no count, no "his disciples" ${JSON.stringify(f)}`); }
        assert(/with the blanket in her mouth/.test(tiger('night_fled', {})) && !/bedroll/.test(tiger('night_fled', {})), 'RB2 (BR): the blanket');
    }
    {   // the sweep: no lose / flee / fail scene leaves the great root-kin out (gao_dead is a win; bluff_fail names her by the bond)
        // v0.11.131 (owner picks XB2, FQ1; SW): also every choice's fail target and the _forced / _caught / _wake lead-ins; not the
        // fail targets that are no fight (NOT_FIGHT), nor U4: reached only by failing a crossing that is flown from Foundation, so
        // never as the great root-kin (checked: every way in is a flown check, and nothing leads there otherwise)
        const NOT_FIGHT = ['scan_bad', 'stream', 'ya_found'], U4 = ['roots_caught', 'rt_ambush_forced', 'rt_ford_wake', 'rt_serpent_forced'];
        const ways = (id) => Object.values(SCENES).flatMap((s) => (Array.isArray(s.choices) ? s.choices : []).filter((c) => c.fail === id || c.to === id));
        for (const id of U4) assert(ways(id).length > 0 && ways(id).every((c) => c.fail === id && c.to !== id && c.check && c.fly), `XB2 (FQ1): ${id} is reached only by failing a flown crossing`);
        const FAILS = Object.values(SCENES).flatMap((s) => (Array.isArray(s.choices) ? s.choices : []).map((c) => c.fail)).filter((f) => typeof f === 'string');
        const LOSE = [...new Set([...Object.keys(SCENES).filter((k) => /(_lost|_fled|_fail|_taken|_forced|_caught|_wake)$/.test(k)), ...FAILS])].filter((k) => SCENES[k] && !NOT_FIGHT.includes(k) && !U4.includes(k));
        const miss = [];
        for (const id of LOSE) for (const flags of [{}, { ya_party: false }]) { const g = FM(65500 + n++, 'tiger', flags); goTo(g, SCENES, id); if (!/\bYuki\b|\bcat\b|says the bond/.test(sceneView(g, SCENES).text)) miss.push(`${id}${flags.ya_party === false ? ' (no Ya)' : ''}`); }
        assert(LOSE.length >= 36 && !miss.length, `YB1 (LL): every lose / flee / fail scene places the great root-kin (${LOSE.length} scenes; missing: ${miss.join(', ') || 'none'})`);
    }
    // RA, BL, GA, HG, SR: [scene, flags, the cat's, the great root-kin's, the human's]
    const YB2 = [
        ['rt_arrive', {}, /\n\nTheir eyes go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first: white, long as a handcart, pacing at your heel like a dog that has never heard of dogs\. Ashfall has seen the outlander's beast before\. It has not got smaller\. They look, gravely, once, as at a matter that belongs to the outlander and is therefore not to be remarked on\. Then they go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first — the white hair, the ears, the tail — and move on/],
        ['bluff_fail', {}, /announce himself\. You have dishonoured yourself[\s\S]*"Of the two, only the second matters\."$/, /announce himself\. Nor is a great beast at a man's heel a senior's Qi\. It is a treasure, and treasures are carried by servants\. You have dishonoured yourself[\s\S]*"Of the two, only the second matters\."\n\n\*Servant,\* says the bond, as rather a lot of treasure gets to its feet beside you\. \*He's half right\. You do carry things\.\*$/, /announce himself\. You have dishonoured yourself[\s\S]*"Of the two, only the second matters\."$/],
        ['gao_fight_start', {}, /^Gao Feng decides that whatever you are, you are alone, unarmed, and wearing a lab coat\. He has looked at you with his Qi-sense and felt nothing at all: a mortal\. "Pock-Face\."/, /^Gao Feng decides that whatever you are, you are unarmed, wearing a lab coat, and alone but for a cat\./, /^Gao Feng decides that whatever you are, you are unarmed, wearing a lab coat, and alone but for a slight woman in a high-collared qipao\. He has looked at you both with his Qi-sense and felt nothing at all: a mortal, and a mortal's woman, with something about her ears that it is beneath an outer disciple to notice\. "Pock-Face\."/],
        ['herb_girl', {}, /Not a flicker\. His eyes slide off you the way they'd slide off a fence post\. By his reckoning/, /Not a flicker\. His eyes slide off you the way they'd slide off a fence post, and off Yuki the way they'd slide off a second, larger fence post\. By his reckoning/, /Not a flicker\. His eyes slide off you the way they'd slide off a fence post, and off Yuki the way they'd slide off a second, shorter fence post: they catch on the ears for exactly as long as dignity permits, which is not long\. By his reckoning/],
    ];
    for (const [id, flags, ...want] of YB2) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = FM(66000 + n++, form, flags); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `YB1: ${id} as ${form} (${t.slice(0, 70)}…)`);
    });
    {   // v0.11.131 (owner picks XB2, FQ1; Fable's MAINs): FL the great root-kin in the eight fight lead-ins she can reach (the cat's
        // and the human's texts unchanged); HP Lu Han answers the hairpin, not a bluff; FY James's fall, the mire and the serpent by flight
        const view = (id, form, flags = {}, realm) => { const g = FM(67000 + n++, form, flags); if (realm !== undefined) { g.yuki.realm = realm; g.james.realm = realm; } goTo(g, SCENES, id); return sceneView(g, SCENES).text; };
        const FL = [
            ['night_attack_forced', {}, ' Yuki, who was never going to run, gets up. *Good,* says the bond. *I outweigh them. All of them, together.*'],
            ['night_lizard_forced', {}, ' Yuki, who has crossed the whole rise without bending a grass stem, turns her head and looks at you. *Four hundred pounds,* says the bond. *Not a sound. Remarkable what one can do.*'],
            ['rt_brawl_start', {}, ' Yuki looks at the wine-shop bench, which both cousins have now left, and steps up onto it. Ritual has its uses.'], // v0.11.174 (RV1, L3)
        ];
        for (const [id, flags, line] of FL) {
            const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => view(id, form, flags));
            assert(tiger.includes(line) && tiger.replace(line, '') === cat && human === cat, `XB2 (FL): ${id} ${JSON.stringify(flags)}: her line, hers alone`);
        }
        for (const [id, flags, T, H] of [ // v0.11.173 (owner picks P6A, CA1 FB; Fable's): the woman's lines in the Heart's three lead-ins (the great root-kin's from XB2), each hers alone
            ['ring_forced', {}, " Yuki has the gallery behind you, all of it, wall to wall. *I can't turn round in here,* says the bond. *So we are going forward.*", " Yuki looks at the hole, then at you. \"I have watched you make thicker soup,\" she says, and comes up level with your shoulder."],
            ['guardian_half', {}, ' So is Yuki, ears forward, quite still. She heard that song in the same grove you did.', " So is Yuki, ears forward, quite still. \"I know that one,\" she says, to nobody. \"They sang it over both of us.\""],
            ['guardian_half', { ya_party: false }, ' So is Yuki, ears forward, quite still. She heard that song in the same grove you did.', " So is Yuki, ears forward, quite still. \"I know that one,\" she says, to nobody. \"They sang it over both of us.\""],
        ]) {
            const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => view(id, form, flags));
            assert(tiger.includes(T) && tiger.replace(T, '') === cat && human.includes(H) && human.replace(H, '') === cat && !cat.includes(H), `XB2 (FL) / P6A (FB): ${id} ${JSON.stringify(flags)}: the great root-kin's line and the woman's, each hers alone`);
        }
        {   // v0.11.169 (P3A, YF): arson_start has the great root-kin's line (Fable's rewrite) and now the woman's, each hers alone
            const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => view('arson_start', form));
            const T = " Behind you the loft boards creak as Yuki gets up, all of her. *He's only counted one of us,* says the bond.", H = " Behind you Yuki is standing already. \"He has counted one of us,\" she says, without much interest.";
            assert(tiger.includes(T) && tiger.replace(T, '') === cat && human.includes(H) && human.replace(H, '') === cat, 'XB2 (FL) / P3A (YF): arson_start: the great root-kin\'s line and the woman\'s, each hers alone');
        }
        for (const [id, T, H] of [ // v0.11.170 (owner picks NX2, CA1 FB; Fable's): the woman's lines in two of the Fallout's lead-ins, each hers alone
            ['fo_wolf_forced', ' Yuki did not stop for a headband. She is sitting in the middle of the lane, washing one paw, and the wolves have slowed. They have not stopped.', ' Yuki did not stop for anything. She is standing in the middle of the lane in black silk, hands in her sleeves, and the wolves, who can count, are counting again.'],
            ['ya_forced', ' Then the whole village looks at Yuki. Yuki looks at the fence. This is, evidently, between people.', ' Then every eye goes to the woman in black by the fence. Yuki inspects a cuff. "He has another cheek," she says, aloud.'],
        ]) {
            const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => view(id, form));
            assert(tiger.includes(T) && tiger.replace(T, '') === cat && human.includes(H) && human.replace(H, '') === cat, `XB2 (FL) / NX2 (FB): ${id}: the great root-kin's line and the woman's, each hers alone`);
        }
        assert(/step through it/.test(view('night_attack_forced', 'tiger')), 'XB2 (FL): night_attack_forced keeps Incremental Mode\'s hedge');
        // HP: each offer marks itself when it fails; both fail to bluff_fail
        const tc = SCENES.tribute.choices;
        assert(tc[1].fail === 'bluff_fail' && tc[2].fail === 'bluff_fail' && /^Bluff/.test(tc[1].text) && /hairpin/.test(tc[2].text), 'XB2 (HP): the bluff and the hairpin fail to bluff_fail');
        for (const [i, want] of [[1, 'bluff'], [2, 'hairpin']]) { const g = FM(67500 + n++, 'cat'); tc[i].failDo(g); assert(g.flags.tribute_fail === want, `XB2 (HP): a failed ${want} sets tribute_fail`); }
        const T1 = ' Nor does a mortal bargain with a trinket while the true treasure stands at his heel. That one would have paid for thirty years.';
        const T2 = "\n\n*Thirty years,* says the bond, as a tiger's weight of the true treasure gets to its feet beside you. *I'd have said forty. He's rounding down.*"; // RC2 (M2): his own words
        const [hc, ht, hh] = ['cat', 'tiger', 'human'].map((form) => view('bluff_fail', form, { tribute_fail: 'hairpin' }));
        assert(/^The song goes wrong in the first bar\./.test(hc) && /"The second is the one that matters\."$/.test(hc) && !/performance|announce himself|nearly|crack|Servant/.test(hc + ht + hh), 'XB2 (HP); RC2 (L1, M2): the hairpin\'s own text, a clear failure, no bluff and no "Servant" in it');
        assert(ht.includes(T1) && ht.includes(T2) && ht.replace(T1, '').replace(T2, '') === hc && hh === hc, 'XB2 (HP): the great root-kin\'s two lines, hers alone');
        for (const f of [{}, { tribute_fail: 'bluff' }]) assert(/^Lu Han hears the whole performance out/.test(view('bluff_fail', 'cat', f)), `XB2 (HP): the bluff's text ${JSON.stringify(f)}`);
        // RC2 (TG): through the real picks (a failed bluff, a failed hairpin), then a rewind clears the flag; M1: never folded
        for (const [i, want] of [[1, 'bluff'], [2, 'hairpin']]) {
            const g = ensureBars(fresh(67600 + n++)); g.minutes = 2 * 1440 + 480; goTo(g, SCENES, 'tribute'); g.james.qi = 99;
            choose(g, SCENES, i);
            const t = sceneView(g, SCENES).text;
            assert(g.scene === 'bluff_fail' && g.flags.tribute_fail === want && t === (want === 'hairpin' ? hc : view('bluff_fail', 'cat')), `RC2 (TG): a failed ${want} reads its own bluff_fail`);
            g.seen.bluff_fail = 0; g.coil.n = 2; // read in an earlier Coil, maybe by the other offer
            assert(!againView(g, sceneView(g, SCENES)).fold, `RC2 (M1): bluff_fail is never folded (${want})`);
            rewind(g);
            assert(!g.flags.tribute_fail && !KEEP_FLAGS.includes('tribute_fail'), `RC2 (TG): a rewind clears tribute_fail (${want})`);
        }
        // FY: by flight (any form from Foundation; the cat below it keeps the old text)
        for (const [id, walk, fly] of [['wyrm_lost', /takes you off the root and you fall[\s\S]*Wyrms, it turns out, don't swim\./, /takes you out of the air like a shuttlecock[\s\S]*Wyrms, it turns out, neither swim nor fly\./], ['mire_lost', /^You retreat with a bitten calf/, /^You leave straight up, with a bitten calf[\s\S]*As replies go, it isn't one\./], ['dw_serpent_lost', /^The serpent drags you under\. For a long/, /^The serpent takes you out of the air by one ankle[\s\S]*drags you under\. For a long/]]) {
            const t0 = view(id, 'cat', {}, 0), t1 = view(id, 'cat', {}, 1);
            assert(walk.test(t0) && !fly.test(t0) && fly.test(t1) && !walk.test(t1) && fly.test(view(id, 'tiger')) && fly.test(view(id, 'human')), `XB2 (FY): ${id} by flight`);
        }
        // RH: the human's own clause in roots_lost with no Ya; the cat's joke stays the cat's
        assert(/Mei Lin and Yuki between them, Yuki in a qipao that has not picked up so much as a thread of husk, which ought not to be physically possible\./.test(view('roots_lost', 'human', { ya_party: false })) && !/qipao/.test(view('roots_lost', 'cat', { ya_party: false })), 'XB2 (RH): the human\'s clause');
    }
    {   // SR: the sister's beat by form; the lover's unchanged
        const ROOF = 'Through the bond, from somewhere very far away and getting farther: *I am moving to the roof. I am living on the roof now. Do not look for me.*';
        // v0.11.177 (P9A, YP): the cat's and the great root-kin's bond lines are their own texts (Fable's); the woman's unchanged
        const CATR = 'The bond, already distant and still receding: *I am going up on the roof. The roof is my address from tonight. Forward nothing.*';
        const SHED = 'The bond, already distant and still receding: *I am going up on the roof.* Thatch groans, at length. A silence follows, in which engineering is reconsidered. *The goat shed. My address is the goat shed. Forward nothing.*';
        const BY = { cat: CATR, tiger: SHED, human: ROOF };
        for (const form of ['cat', 'tiger', 'human']) {
            const g = LPG(66500 + n++, form, { yk_path: 'sister' }); goTo(g, SCENES, 'romance'); const t = sceneView(g, SCENES).text;
            assert(t.includes(BY[form]) && Object.entries(BY).every(([f, s]) => f === form || !t.includes(s)), `YB1 (SR): the sister's beat as ${form}`);
            const h = LPG(66600 + n++, form, { yk_path: 'lover' }); goTo(h, SCENES, 'romance'); assert(/Through the bond, sleepy and amused from the stove downstairs/.test(sceneView(h, SCENES).text), `YB1 (SR): the lover's beat as ${form} unchanged`);
        }
    }
}
// v0.11.34 (owner pick A, 1,000 games): two scenes the random walks reached only by luck at 2,000 games, now on purpose
for (let run = 0; run < 20; run++) { // running from the mire-rats at night: night_fled
    const g = ensureBars(fresh(run + 49494)); g.james.gu = { tier: 2, level: 5, xp: 0 }; ensureBars(g); // GU 7.5: past the rats' attack (DC 7)
    Object.assign(g.flags, { long: true, forest_day: 2, night_ev: 'rats' }); g.minutes += 1440 + 22 * 60;
    g.scene = 'night_event'; seen.add('night_event'); // the scene as entered on a rats night (its enter would draw the night again)
    const fight = sceneView(g, SCENES).choices.find((c) => !c.disabled && /^Fight\. Rats/.test(c.label));
    assert(!!fight, `v0.11.34: the rats night offers its fight (run ${run})`);
    if (!fight) continue;
    const r = choose(g, SCENES, fight.index); startCombat(g, r.combat(g));
    const out = combatFlee(g);
    assert(out?.done === 'flee' && out.next === 'night_fled', `v0.11.34: a fast James runs from the rats (${out?.done})`);
    if (out?.done) goTo(g, SCENES, out.next);
    assert(g.scene === 'night_fled' && walkFrom(g, 'night_fled', new Set(['stream', 'wilds', 'morning', 'camp', 'fo_start', 'coil_end']), 400) === true, `v0.11.34: from night_fled the walk goes on (run ${run})`);
}
for (let run = 0; run < 20; run++) { // the hunters too slow for the wolves: fo_wolf_forced (a weak James fails the GU check)
    const g = ensureBars(fresh(run + 50505)); g.scene = 'epilogue'; g.flags.ending = ['fought', 'bluff', 'paid'][run % 3]; g.minutes = 6 * 1440 + 900;
    choose(g, SCENES, 0); // into Act 1 the real way (its Coil starts)
    g.minutes = 9 * 1440 + 2 * 60;
    goTo(g, SCENES, 'fo_wolf'); seen.add('fo_wolf');
    const wake = sceneView(g, SCENES).choices.find((c) => !c.disabled && /^Wake the hunters/.test(c.label));
    assert(!!wake, `v0.11.34: the wolves in the barley offer to wake the hunters (run ${run})`);
    if (!wake) continue;
    choose(g, SCENES, wake.index);
    assert(g.scene === 'fo_wolf_forced', `v0.11.34: a weak James fails it: fo_wolf_forced (${g.scene})`);
    assert(walkFrom(g, g.scene, new Set(['bl_start', 'coil_end', 'fo_start', 'arrival']), 1500) === true, `v0.11.34: from fo_wolf_forced the walk goes on (run ${run})`);
}
// v0.11.181 (owner picks SP1, KG1, D1; group e's CM, push 1): the mother's kitchen by her friendship (K), the communal pot by the
// village's (PS) and the cook-with-the-women scenes (kitchen.js, kitchen_texts.js, kitchen_install.js)
{
    const K = await import('../js/story/kitchen.js');
    const D = 1440;
    const { SOCIAL, EAT: EATLIKE } = await import('./lib/social.mjs'); // RV1 (TG7): the bots' own regexes
    const all = [...Object.values(K.KT_LABEL), ...Object.values(K.KT_UP), ...Object.values(K.KT_DAY).flat(), ...Object.values(K.KT_RETURN), ...K.POT_LINE.ashfall, ...K.POT_LINE.fo, ...Object.values(K.POT_COOK).flatMap((o) => Object.values(o))];
    assert(all.length === 31 && all.every((t) => typeof t === 'string' && t.length > 10 && !/\[|\]|TODO/.test(t)) && new Set(all).size === 31, `CM (KG1, PS): 31 texts, all filled and distinct (${all.length})`);
    assert(JSON.stringify(K.KG) === '[8,15,30]' && K.POT_GATE === 90, 'CM (KG1; P1 L5a): the gates 8 / 15 / 30; PS: the village\'s 90');
    { const H = await import('../js/story/house_time.js'); assert(K.KG[2] === H.HT_MID, 'P1 (L5a): the take-over comes with her warm closers (HT_MID), not below them'); }
    const labels = [...Object.values(K.KT_LABEL), K.POT_COOK.ashfall.label, K.POT_COOK.fo.label];
    assert(labels.every((t) => !EATLIKE.test(t) && !SOCIAL.test(t) && /\.$/.test(t) && t.length < 45), 'CM: the card labels are not read as eating or a talk by the bots, end with a full stop, under 45 characters');
    assert([...K.POT_LINE.ashfall, ...K.POT_LINE.fo, K.POT_COOK.ashfall.result, K.POT_COOK.fo.result].every((t) => !/[.!?:]$/.test(t)), 'CM (PS): the pot lines and results end bare (the code adds ": +25 satiety.")');
    { const { GAIN_LINES } = await import('../js/core/replies.js'); // B1: a pot line with speech in it is a meal line (as the old prologue one)
      const q = [...K.POT_LINE.ashfall, ...K.POT_LINE.fo].filter((t) => /"/.test(t));
      assert(q.length === 2 && q.every((t) => GAIN_LINES.some((r) => r.test(`${t}: +25 satiety.`))), `CM (B1): the two pot lines with speech are meal lines (${q.length})`); }
    assert(!/dödölle[\s\S]*dödölle/.test(all.join(' ')) && all.filter((t) => /dödölle|shakshuka/i.test(t)).length === 2, 'CM: two dishes named in all (KU3, KD3b)');
    // the stage by her friendship
    const at = (f) => { const g = ensureBars(fresh(66001)); g.rel.Mother = { f, a: 0 }; return g; };
    assert([0, 7, 8, 14, 15, 29, 30, 150].map((f) => K.kitchenStage(at(f))).join() === '0,0,1,1,2,2,3,3', 'CM (KG1; P1 L5a): the stage by her friendship');
    // her card on the Fallout: the label by stage before the gain, the text after it; body, kitchen, closer
    const MK = (seed, hub, day, f, flags = {}) => { const g = ensureBars(fresh(seed)); g.coil.act = hub === 'ashfall' ? 0 : 1; g.minutes = (day - 1) * D + 600; Object.assign(g.flags, flags); g.rel.Mother = { f, a: 0 }; goTo(g, SCENES, hub); return g; };
    const mIdx = (g) => SCENES[g.scene].choices.findIndex((c) => c.to === 'mother_time');
    const label = (g) => SCENES[g.scene].choices[mIdx(g)].text(g);
    {
        const g = MK(66002, 'fo_ashfall', 8, 12);
        assert(label(g) === K.KT_LABEL[1], `CM (KG1): at 12 the label is stage 1's (${label(g)})`);
        choose(g, SCENES, mIdx(g));
        const t = sceneView(g, SCENES).text, paras = t.split('\n\n');
        assert(g.rel.Mother.f === 15 && paras.length === 3 && paras[0] === HT_BODY.mother['fo_ashfall:1'] && paras[1] === K.KT_UP[2], `CM (KG1): 12 + 3 = 15: stage 2's paragraph, between her day's text and the closer (${paras.length})`);
        assert(sceneView(g, SCENES).text === t, 'CM: the same text on a redraw');
        choose(g, SCENES, 0);
        g.minutes = 8 * D + 600; goTo(g, SCENES, 'fo_ashfall');
        assert(label(g) === K.KT_LABEL[2], 'CM (KG1): the next day the label is stage 2\'s');
        choose(g, SCENES, mIdx(g));
        const p2 = sceneView(g, SCENES).text.split('\n\n');
        assert(K.KT_DAY[2].includes(p2[1]) && p2[0] === HT_BODY.mother['fo_ashfall:2'], 'CM (KG1): a stage already seen this Coil: a short line of its stage');
    }
    {
        const g = MK(66003, 'fo_ashfall', 9, 0);
        assert(label(g) === HT_LABEL.mother, 'CM (KG1): stage 0 keeps the old label');
        choose(g, SCENES, mIdx(g));
        const p = sceneView(g, SCENES).text.split('\n\n');
        assert(p.length === 2 && p[0] === HT_BODY.mother['fo_ashfall:2'] && !g.flags.mother_kitchen, 'CM (KG1): below 8 her text as before (body and closer)');
    }
    {
        const g = MK(66004, 'fo_ashfall', 10, 30);
        choose(g, SCENES, mIdx(g));
        assert(sceneView(g, SCENES).text.split('\n\n')[1] === K.KT_UP[3] && g.flags.kitchen_seen === 3, 'CM (KG1): a Coil that starts high shows the highest stage\'s paragraph, not the ones below');
    }
    for (const [f, s] of [[6, 1], [13, 2], [27, 3]]) { // the return's day: its own line by stage (P1, L5a: 27 + 3 = 30)
        const g = MK(66005 + s, 'rt_ashfall', 20, f);
        choose(g, SCENES, mIdx(g));
        assert(sceneView(g, SCENES).text.split('\n\n')[1] === K.KT_RETURN[s], `CM (KG1): the return's day, stage ${s}: its line`);
    }
    {
        const g = MK(66009, 'fo_ashfall', 8, 20, { kitchen_seen: 2 });
        assert(!KEEP_FLAGS.includes('kitchen_seen') && !KEEP_FLAGS.includes('mother_kitchen') && !KEEP_FLAGS.includes('pot_cook') && !KEEP_FLAGS.includes('fo_pot_cook'), 'CM: the kitchen\'s and the cook scenes\' flags are world flags (they reset with the Coil)');
        rewind(g); assert(!g.flags.kitchen_seen, 'CM: a rewind forgets the kitchen');
    }
    { // RV1 (TG1): the usual path: a stage reached in the Fallout, then the return's day shows its return line
        const g = MK(66030, 'fo_ashfall', 8, 12); choose(g, SCENES, mIdx(g)); choose(g, SCENES, 0);
        assert(g.flags.kitchen_seen === 2, 'CM (TG1): stage 2 seen in the Fallout');
        g.minutes = 19 * D + 600; goTo(g, SCENES, 'rt_ashfall'); choose(g, SCENES, mIdx(g));
        assert(sceneView(g, SCENES).text.split('\n\n')[1] === K.KT_RETURN[2] && g.rel.Mother.f === 18, 'CM (TG1): then the return\'s day: its stage 2 line, not a day line');
    }
    { // RV1 (TG6): the later days' lines vary (pickLine)
        const g = MK(66031, 'fo_ashfall', 8, 5); const got = []; // 8, 11, 14: stage 1 all three days
        for (const day of [8, 9, 10]) { g.minutes = (day - 1) * D + 600; goTo(g, SCENES, 'fo_ashfall'); choose(g, SCENES, mIdx(g)); got.push(sceneView(g, SCENES).text.split('\n\n')[1]); choose(g, SCENES, 0); }
        assert(got[0] === K.KT_UP[1] && K.KT_DAY[1].includes(got[1]) && K.KT_DAY[1].includes(got[2]) && got[1] !== got[2], `CM (TG6): stage 1's paragraph, then two different day lines (${got.map((t) => t.slice(0, 20)).join(' | ')})`);
    }
    { // RV1 (TG5; M1, L1): every new result line puts its stat in the gains, none in the reply
        const { splitLine } = await import('../js/core/replies.js');
        const res = [...K.POT_LINE.ashfall, ...K.POT_LINE.fo, K.POT_COOK.ashfall.result, K.POT_COOK.fo.result].map((t) => `${t}: +25 satiety.`);
        const bad = res.filter((t) => { const sp = splitLine(t); return sp.reply !== '' || !/\+25 satiety/.test(sp.gain); });
        assert(bad.length === 0, `CM (TG5): the stat in the gains, no reply fragment (${bad.map((t) => t.slice(0, 30)).join(' | ')})`);
    }
    { // RV1 (TG4): the canon card's tics and the review's habit words in none of the new texts
        const card = readFileSync(new URL('../project/canon-card.md', import.meta.url), 'utf8');
        const tics = [...(card.split('\n').find((l) => /\*\*Tics to avoid:\*\*/.test(l)) || '').matchAll(/"([^"]{4,40})"/g)].map((m) => m[1].toLowerCase()).filter((t) => !/[{}]/.test(t));
        const txt = all.join(' ').toLowerCase();
        const hit = tics.filter((t) => txt.includes(t));
        assert(tics.length > 5 && hit.length === 0, `CM (TG4): no canon-card tic in the new texts (${hit.join(', ')})`);
        const legal = (all.join(' ').match(/acquittal|jurisdiction|objection|charge sheet|finding|ruling|treaty|boundary stone|hostage|concede|witness|argument/gi) || []).length;
        assert(legal <= 4, `CM (RV1, M4): legal images at most 4 (${legal})`);
    }
    // PS: the pot's line by the village's friendship and the day
    const pot = (hub, day, v, flags = {}) => { const g = ensureBars(fresh(66010 + day)); g.coil.act = hub === 'ashfall' ? 0 : 1; g.minutes = (day - 1) * D + 600; Object.assign(g.flags, flags); g.rel.Village = { f: v, a: 0 }; g.james.satiety = 40; goTo(g, SCENES, hub);
        const i = SCENES[hub].choices.findIndex((c) => c.text === 'Eat at the communal pot.'); return { g, out: choose(g, SCENES, i) }; };
    for (const [day, i] of [[8, 0], [9, 1], [10, 2]]) {
        const hi = pot('fo_ashfall', day, 90), lo = pot('fo_ashfall', day, 89);
        assert(K.potLine(hi.g, 'fo') === `${K.POT_LINE.fo[i]}: +25 satiety.`, `CM (PS): the Fallout's Day ${day}, from 90: its line`);
        assert(K.potLine(lo.g, 'fo') === null, 'CM (PS): below 90 the old line');
        assert([hi, lo].every((r) => r.g.james.satiety > 60 && r.g.james.satiety <= 65), `CM (PS): the pot still gives 25 (less the half hour's hunger: ${hi.g.james.satiety})`);
    }
    assert(K.potLine(pot('ashfall', 5, 120, { vday: 2, long: true }).g, 'ashfall') === `${K.POT_LINE.ashfall[0]}: +25 satiety.` && /banners/.test(K.POT_LINE.ashfall[1]) && !/banners/.test(K.POT_LINE.ashfall[0]), 'CM (RV1, TG2): vday 2 reads the first slot; the red banners only on the eve\'s');
    assert(K.potLine(pot('ashfall', 4, 120, { vday: 1, long: true }).g, 'ashfall') === `${K.POT_LINE.ashfall[0]}: +25 satiety.` && K.potLine(pot('ashfall', 6, 120, { vday: 3, long: true }).g, 'ashfall') === `${K.POT_LINE.ashfall[1]}: +25 satiety.`, 'CM (PS): the prologue\'s two slots (the eve from vday 3, as the house texts)');
    {
        const src = readFileSync(new URL('../js/story/ashfall.js', import.meta.url), 'utf8') + readFileSync(new URL('../js/story/act1_fallout.js', import.meta.url), 'utf8');
        assert((src.match(/potLine\(g, '(ashfall|fo)'\) \?\? '/g) || []).length === 2, 'CM (PS): both pots fall back to their old line');
    }
    // PS: the cook scene: the gate, the hours, once a Coil, 30 + 60 minutes, the gains, the pot closed for the day
    for (const [hub, scene, flag, day, act] of [['ashfall', 'pot_cook', 'pot_cook', 5, 0], ['fo_ashfall', 'fo_pot_cook', 'fo_pot_cook', 9, 1]]) {
        const mk = (v, h) => { const g = ensureBars(fresh(66020)); g.coil.act = act; g.minutes = (day - 1) * D + h * 60; Object.assign(g.flags, { long: true, vday: 2 }); g.rel.Village = { f: v, a: 0 }; g.rel.Mother = { f: 10, a: 0 }; g.james.satiety = 40; goTo(g, SCENES, hub); return g; };
        const ci = (g) => SCENES[hub].choices.findIndex((c) => c.to === scene);
        const open = (g) => SCENES[hub].choices[ci(g)].show(g);
        assert((TASK_HUBS[hub].doors || []).includes(scene) && ci(mk(150, 10)) === SCENES[hub].choices.filter((c) => !c.preserve).length - 1, `CM (PS): ${hub}: the cook card is the last choice (before v0.11.209's "Smoke the catch."), a door card`);
        assert(!open(mk(89, 10)) && open(mk(90, 10)) && !open(mk(150, 8)) && open(mk(150, 9)) && open(mk(150, 14)) && !open(mk(150, 15)), `CM (PS): ${hub}: from the village's 90, 09:00–14:59`);
        const g = mk(150, 10), m0 = g.minutes;
        choose(g, SCENES, ci(g));
        assert(g.scene === scene && g.flags[flag] === true && sceneView(g, SCENES).text === K.POT_COOK[hub === 'ashfall' ? 'ashfall' : 'fo'].text, `CM (PS): ${scene}: its text, the flag set`);
        choose(g, SCENES, 0);
        const mum = hub === 'fo_ashfall' ? 12 : 10; // RV1 (L4): Mother +2 only in the Fallout's, where she is in the scene
        assert(g.scene === hub && g.minutes - m0 === 90 && g.james.satiety > 58 && g.james.satiety <= 65 && g.rel.Mother.f === mum && g.rel.Village.f === 150, `CM (PS): ${scene}: 90 minutes, +25 satiety, Mother ${mum - 10 ? '+2' : 'unchanged'}, the village capped (${g.minutes - m0}, ${g.james.satiety}, ${g.rel.Mother.f}, ${g.rel.Village.f})`);
        assert(!open(g) && !SCENES[hub].choices.find((c) => c.text === 'Eat at the communal pot.').show(g), `CM (PS): ${scene}: then neither the card nor the pot today`);
        g.minutes += D; assert(!open(g), `CM (PS): ${scene}: once a Coil`);
        { const e = mk(150, 10); choose(e, SCENES, SCENES[hub].choices.findIndex((c) => c.text === 'Eat at the communal pot.'));
          assert(e.scene === hub && !open(e), `CM (RV1, TG3): ${hub}: once the pot was used today, no cook card`); }
        const v = mk(100, 10); choose(v, SCENES, ci(v)); choose(v, SCENES, 0);
        assert(v.rel.Village.f === 103, 'CM (PS): Village +3 below the cap');
    }
}
/** v0.11.34 (D1): scenes only Story Mode reached; kept in the files (D2 deletes Story Mode's code later), never reached in
 * Incremental Mode's games. The owner decides keep-list or removal. Log only if one is reached after all. */
const STORY_ONLY = {
    lost: ['jackals_lost', 'night_lost', 'mire_lost', 'far_lost', 'fo_wolf_lost', 'lf_trial_lost'], // a lost beast fight ends the Coil
    screen: ['meridians'], // the meridian screen (Meditate cards since v0.11.13)
    failed: ['scan_bad', 'first_bone_fail', 'night_attack_forced', 'ring_forced', 'rt_ambush_forced'], // failed checks: possible for a very weak James, never failed in these games (roots_caught is: the sister walk)
    never: ['rt_serpent_won'], // the ford serpent never fights (both ways across always pass)
};
/** v0.11.151 (owner pick WD1, SO): reached in Incremental Mode now, in some full runs, not all (a weak James's lost fights and
 *  failed checks; the ford's far bank since flight, v0.11.109): not required each run, no note when reached, and still walked
 *  as an old save below. Moved from STORY_ONLY's lost and failed lists. */
const RARE = ['ring_lost', 'rt_serpent_lost', 'hunt_got', 'arson_start', 'rt_ford_wake', 'rt_serpent_forced'];
const storyOnly = new Set(Object.values(STORY_ONLY).flat());
const rare = new Set(RARE); // v0.11.151 (WD1, SO)
assert(RARE.every((k) => SCENES[k] && !storyOnly.has(k)), 'v0.11.151 (SO): every rare scene exists and is not also Story-only');
const unreached = Object.keys(SCENES).filter((k) => !seen.has(k) && !storyOnly.has(k) && !rare.has(k));
assert(!FULL || unreached.length === 0, `every scene reachable (unreached: ${unreached.join(', ')})`);
assert([...storyOnly].every((k) => SCENES[k]), 'v0.11.34: every Story-only scene still exists');
const reachedAnyway = [...storyOnly].filter((k) => seen.has(k));
const rareMissed = RARE.filter((k) => !seen.has(k)); // v0.11.151 (RV1, RL; Fable's L5): a full run names the rare scenes it didn't reach (log only)
// v0.11.34 (cold review): an old Story Mode save may sit on one of them; each walks on with no dead end, open meridians (as an old save) and closed
const ACT1 = (k) => /^(fo_|ring_|roots_|rt_)/.test(k);
for (const k of [...storyOnly, ...rare]) for (let run = 0; run < 30; run++) { // v0.11.151 (SO): the rare scenes walk on as old saves too
    const g = ensureBars(run % 2 ? fresh(run + 51515) : newGame(run + 51515));
    if (ACT1(k)) { g.scene = 'epilogue'; g.flags.ending = ['fought', 'bluff', 'paid'][run % 3]; g.minutes = 6 * 1440 + 900; choose(g, SCENES, 0); g.minutes = (k.startsWith('rt_') ? 18 : k.startsWith('fo_') ? 9 : 15) * 1440 + 8 * 60; Object.assign(g.flags, { mei_party: true, ya_party: true, ya_met: true }); }
    else if (k === 'lf_trial_lost') Object.assign(g.flags, { longforest: true, lf_active: true, bone_ok: true });
    else { g.flags.long = true; g.flags.forest_day = 2; g.minutes += 1440; }
    g.flags.mer_return = 'stream'; g.flags.bt_return = 'stream';
    const before = seen.has(k);
    const r = walkFrom(g, k, new Set(['fo_start', 'bl_start', 'ht_start', 'a1_end', 'coil_end', 'arrival', 'dawn', 'stream', 'wilds', 'lf_hub']), 1500);
    if (!before) seen.delete(k); // these walks start on the scene: they don't count as reaching it
    assert(r === true || r === 'end', `v0.11.34: an old save on Story-only ${k} walks on (run ${run}: ${r}, at ${g.scene})`);
}
if (reachedAnyway.length) console.log(`  NOTE  Story-only scenes reached in Incremental Mode (log only): ${reachedAnyway.join(', ')}`);
if (FULL && rareMissed.length) console.log(`  NOTE  rare scenes not reached in this full run (log only; one never reached again may have become unreachable): ${rareMissed.join(', ')}`);
if (!FULL) console.log(`  coverage (quick, log only): ${Object.keys(SCENES).length - storyOnly.size - unreached.length} of ${Object.keys(SCENES).length - storyOnly.size} scenes reached (${storyOnly.size} Story-only left out)`); // v0.11.21
// v0.11.152 (owner 21:11, pick E1, BK): Day 21's breakfast. Every last night leads to the Elder's arrival at 08:00, which now
// serves breakfast at Mei Lin's (+20 satiety, at once, capped at 100), once a Coil.
{
    const NIGHTS = ['rt_quiet_night', 'rt_mei_night', 'rt_ya_night', 'rt_trio_night', 'yk_night_solo', 'yk_night_mei', 'yk_night_ya', 'yk_night_all'];
    let n = 0;
    for (const id of NIGHTS) {
        assert(!!SCENES[id], `E1 (BK): the last night ${id} exists`);
        const g = ensureBars(newGame(58100 + n++));
        g.minutes = 19 * 1440 + 22 * 60; g.james.satiety = 40;
        goTo(g, SCENES, id);
        const open = sceneView(g, SCENES).choices.filter((c) => !c.disabled);
        const w = JSON.parse(JSON.stringify(g)); w.flags.a1_breakfast = true; choose(w, SCENES, open[0].index); // the same night without the breakfast
        const s0 = w.james.satiety; // Fed at the Elder's arrival before breakfast (the night's sleep drains some)
        const r = choose(g, SCENES, open[0].index);
        const lines = (r.lines || []).map(String);
        assert(g.scene === 'rt_elder', `E1 (BK): ${id} leads to the Elder's arrival (at ${g.scene})`);
        assert(lines.includes(DAY21_BREAKFAST), `E1 (BK): ${id} → rt_elder serves breakfast (lines: ${lines.join(' | ')})`);
        assert(Math.abs(g.james.satiety - Math.min(100, s0 + 20)) < 1e-9, `E1 (BK): ${id}: Fed at arrival ${s0} → ${g.james.satiety} after breakfast, +20`);
        assert(g.flags.a1_breakfast === true, `E1 (BK): ${id}: the once-a-Coil flag is set`);
    }
    const g = ensureBars(newGame(58200)); g.minutes = 20 * 1440 + 7 * 60; g.james.satiety = 95;
    const first = goTo(g, SCENES, 'rt_elder').map(String);
    assert(first.includes(DAY21_BREAKFAST) && g.james.satiety === 100, `E1 (BK): capped at 100 (Fed ${g.james.satiety})`);
    g.james.satiety = 50;
    const again = goTo(g, SCENES, 'rt_elder').map(String);
    assert(!again.includes(DAY21_BREAKFAST) && g.james.satiety === 50, 'E1 (BK): once a Coil: entering the arrival again serves nothing');
    const h = ensureBars(newGame(58201)); h.minutes = 20 * 1440 + 7 * 60; h.james.satiety = 10;
    goTo(h, SCENES, 'rt_elder');
    assert(h.james.satiety === 30 && clockHour(h) === 8, `E1 (BK): the lowest bot arrival (Fed 10) leaves breakfast at Fed 30, at 08:00 (${h.james.satiety}, ${clockHour(h)}:00)`);
}

// v0.11.152 (owner picks RP1 push 1, "ok for texts" 21:37): the repeats inside a Coil, mapped from the code (2026-11-12): the
// romance texts (RM1–RM9), Yuki's closing lines at fourteen a group (RM10, YT14), Wen's and Mother's at four (HT), and the
// same-day fold (SD). Each slot below gets a different text on each occurrence the calendar allows.
{
    const D = 1440;
    const distinct = (a) => new Set(a).size === a.length;
    const forms = ['cat', 'tiger', 'human'];
    const RG = (seed, form, flags = {}, rel = {}) => {
        const g = ensureBars(fresh(seed));
        const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0; g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
        Object.assign(g.flags, flags); g.rel = { ...g.rel, ...rel }; return ensureBars(g);
    };
    // RM1–RM3, RM6, RM8: the replies by day, as long as the days the choice can come up (talks 5, the fireside 3, the Heart's nights 4, its spring 3)
    const WANT = { 'talk_mei:1': 5, 'talk_ya:0': 5, 'talk_ya:3': 5, 'bl_fireside:2': 3, 'heart_camp:1': 4, 'heart_camp:2': 4, 'heart_camp:3': 4, 'heart_spring:0': 3 };
    for (const [k, n] of Object.entries(WANT)) {
        const l = COIL_SETS[k]?.[0] ?? DAY_REPLIES[k]; // v0.11.166 (RW1): the first Coil's set for the lists by Coil
        assert(l?.length === n, `RP1 (RM): ${k} has ${n} replies (${l?.length})`);
        for (const form of forms) { const g = RG(58300, form, { ship_found: true }); assert(distinct(l.map((t) => (typeof t === 'function' ? t(g) : t))), `RP1 (RM): ${k}'s replies all differ (${form})`); }
    }
    // RM4: Yuki's camp nights 1–4 and the Mei Lin mornings after them, every form she can take there
    for (const form of forms) {
        const ts = [], ms = [];
        const g = RG(58310, form, { yk_path: 'lover' }, { 'Mei Lin': { f: 90, a: 90 } }); // RV1 (L9): through go(), so the count in enter is covered
        for (let n = 1; n <= 4; n++) {
            g.minutes = (10 + n) * D + 21 * 60; goTo(g, SCENES, 'yk_camp');
            assert(g.flags.yk_nights === n && g.flags.yk_mei === n, `RP1 (RM4): night ${n} counted in enter (${g.flags.yk_nights}, ${g.flags.yk_mei})`);
            const t = sceneView(g, SCENES).text; const [night, mei] = t.split('\n\n*\n\n');
            ts.push(night); ms.push(mei);
        }
        assert(distinct(ts), `RP1 (RM4): yk_camp's four nights differ (${form})`);
        assert(ms.every(Boolean) && distinct(ms), `RP1 (RM4): the Mei Lin mornings after nights 1–4 differ (${form})`);
    }
    // RM5: the sister's four talks, human and through the bond
    for (const form of forms) {
        const ts = [];
        const g = RG(58320, form, { yk_path: 'sister' }); // RV1 (L9): through go()
        for (let n = 1; n <= 4; n++) { g.minutes = (10 + n) * D + 20 * 60; goTo(g, SCENES, 'yk_sister_talk'); ts.push(sceneView(g, SCENES).text); }
        assert(g.flags.yk_sis_talks === 4, `RP1 (RM5): four talks counted in enter (${g.flags.yk_sis_talks})`);
        assert(ts.every((t) => typeof t === 'string' && t.length > 100) && distinct(ts), `RP1 (RM5): the four sister talks differ (${form})`);
    }
    // RM6: the Heart camp's second paragraph over four nights, for the heap, Ya's watch and Mei Lin's watch
    const HC = { heap: { trio: 3, ya_party: true }, ya: { ya_party: true }, mei: {} };
    for (const [kind, flags] of Object.entries(HC)) for (const form of forms) {
        const g = RG(58330, form, flags, { 'Mei Lin': { f: 90, a: 90 }, Ya: { f: 90, a: 90 } });
        const paras = [];
        for (let k = 0; k < 4; k++) { g.minutes = (16 + k) * D + 20 * 60; goTo(g, SCENES, 'heart_camp'); paras.push(sceneView(g, SCENES).text.split('\n\n')[1]); }
        assert(distinct(paras), `RP1 (RM6): heart_camp's ${kind} paragraph differs on each of four nights (${form})`);
    }
    // RV1 (M2): the heap formed mid-stay starts at the heap's own first text; (L7) the human's heap leaves him off the edge
    {
        const g = RG(58335, 'human', { ya_party: true }, { 'Mei Lin': { f: 90, a: 90 }, Ya: { f: 90, a: 90 } });
        const p2 = () => sceneView(g, SCENES).text.split('\n\n')[1];
        const got = [];
        for (let k = 0; k < 4; k++) { if (k === 2) g.flags.trio = 3; g.minutes = (16 + k) * D + 20 * 60; goTo(g, SCENES, 'heart_camp'); got.push(p2()); }
        assert(got[0].startsWith('Ya takes the first watch') && got[1].startsWith('Ya is on her ledge again'), 'RV1 (M2): Ya\'s watch, nights 1 and 2');
        assert(/sleep in a heap by the fire now/.test(got[2]) && /^Nobody lays out four bedrolls/.test(got[3]), `RV1 (M2): the heap formed on night 3 starts at its first text, then its second (${got[2].slice(0, 40)} | ${got[3].slice(0, 40)})`);
        assert(!/You have the edge/.test(got[3]) && /Yuki has the edge/.test(got[3]), 'RV1 (L7): the human heap: Yuki has the edge, not James');
    }
    // RM7: whispering nights
    {
        const g = RG(58340, 'cat', { trio: 2, ya_party: true }, { 'Mei Lin': { f: 90, a: 90 }, Ya: { f: 90, a: 90 } });
        const ts = []; // RV1 (L9): through go(), the scene's own roll and dayKey; RV1 (L3): four whispering nights, four texts
        for (let k = 0; k < 80 && ts.length < 4; k++) { g.minutes = (16 + k) * D + 23 * 60; goTo(g, SCENES, 'heart_night'); if (g.flags.heart_night_roll >= 4) ts.push(sceneView(g, SCENES).text); }
        assert(ts.length === 4 && ts.every((t) => /whisper/i.test(t)) && distinct(ts), `RP1 (RM7; RV1 L3): four whispering nights, four texts (${ts.length})`);
    }
    // RM9: the Fallout's two nights (Days 8 and 9): the opening line and Mei Lin's paragraph differ, lovers or not
    for (const lovers of [false, true]) {
        const at = (day) => { const g = RG(58350 + day, 'cat', { palisade: 1, romance: lovers }); g.minutes = (day - 1) * D + 22 * 60; goTo(g, SCENES, 'fo_night'); return sceneView(g, SCENES).text.split('\n\n'); };
        const [a, b] = [at(8), at(9)];
        assert(a[0] !== b[0] && a[1] !== b[1], `RP1 (RM9): fo_night's Day 8 and Day 9 differ (${lovers ? 'lovers' : 'her lamp'})`);
    }
    assert(YT_CLOSE['HUMAN HIGH LOVER'].some((t) => /inside of the forearm, where the omnitool/.test(t)) && !YT_CLOSE['HUMAN HIGH LOVER'].some((t) => /inside of the wrist, where the omnitool/.test(t)), 'RV1 (L6): the omnitool in his forearm');
    // RM10 + HT: every line distinct, everywhere
    const yt = Object.values(YT_CLOSE).flat(), ht = Object.values(HT_CLOSE).flat();
    assert(distinct(yt) && distinct(ht), `RP1 (RM10, HT): ${yt.length} closing lines for Yuki, ${ht.length} for Wen and Mother, none twice`);
    assert(Object.values(YT_CLOSE).every((l) => l.every((t) => typeof t === 'string' && t.length > 30)), 'RP1 (RM10): every closing line is a sentence');
    // SD: a scene entered again the same day with the same text folds to its first paragraph; the next day it shows in full; hubs never fold
    {
        const g = ensureBars(fresh(58360)); g.minutes = 3 * D + 9 * 60;
        const show = (id) => { g.scene = id; const v = sceneView(g, SCENES); return againView(g, v, null); };
        const id = 'herb_girl';
        const v0 = show(id);
        assert(!v0.fold && v0.first.split('\n\n').length >= 2, `RP1 (SD): ${id} shows in full the first time (it has paragraphs to fold)`);
        assert(!show(id).fold, 'RP1 (SD): a redraw of the same visit is the same view');
        show('wilds');
        const v1 = show(id);
        assert(v1.fold && v1.same && v1.memory === null && v1.rest.length > 0, 'RP1 (SD): back the same day, the same text folds under "Read it all again", no memory line');
        assert(show(id).fold, 'RP1 (SD): and every redraw of that visit keeps the fold');
        show('wilds');
        g.minutes += D;
        assert(!show(id).fold, 'RP1 (SD): the next day it shows in full again');
        show('ashfall'); const h1 = show('wilds'); show('ashfall'); const h2 = show('wilds');
        assert(!h1.fold && !h2.fold, 'RP1 (SD): a task screen never folds');
        assert(typeof linesOf(g).sd === 'object' && linesOf(g).sd[id], 'RP1 (SD): the day record sits in the Coil\'s lines record');
        // RV1 (M1): a folded visit whose text changes shows the new text in full
        const vx = (t) => againView(g, { id, text: t }, null);
        g.minutes += D; show('wilds'); vx('One.\n\nTwo.'); show('wilds');
        assert(vx('One.\n\nTwo.').fold, 'RV1 (M1): back the same day with the same text: folded');
        const changed = vx('One.\n\nTwo.\n\nThree, new.');
        assert(!changed.fold, 'RV1 (M1): the text changed within the visit: in full');
        // RV1 (L1) + LB1 (owner 22:30): out to a meta screen and back folds (same day, same text), but is no new visit for "Read it all again"
        g.minutes += D; show('wilds'); vx('Alpha.\n\nBeta.');
        const m1 = againView(g, { id: 'yuki_form', text: 'Which?\n\nForms.' }, null);
        const back = vx('Alpha.\n\nBeta.');
        assert(back.fold && back.newVisit === false, 'RV1 (L1) + LB1: back from the form menu: folded, not a new visit');
        const bt = againView(g, { id: 'breakthrough', text: 'Sky.\n\nNothing.' }, null); const back2 = vx('Alpha.\n\nBeta.');
        assert(back2.fold && back2.newVisit === false, 'RV1 (L1) + LB1: back from a breakthrough: folded, not a new visit');
        // RV1 (L2): main.js shuts "Read it all again" on newVisit: a new visit says so, a redraw does not
        show('wilds'); const nv = vx('Alpha.\n\nBeta.'); const rd = vx('Alpha.\n\nBeta.');
        assert(nv.newVisit === true && rd.newVisit === false, 'RV1 (L2): newVisit on a new visit only');
    }
    // RV1 (L4): a pool that grows mid-Coil keeps its counts
    {
        const g = ensureBars(fresh(58370)); linesOf(g).p['yt:TEST'] = [1, 1, 1];
        const items = Array.from({ length: 14 }, (_, i) => `line ${i}`);
        const picks = []; for (let k = 0; k < 11; k++) picks.push(pickLine(g, 'yt:TEST', items));
        assert(picks.every((i) => i >= 3) && distinct(picks), `RV1 (L4): the three lines already played stay played; the eleven new ones come first (${picks.join(',')})`);
        assert(linesOf(g).p['yt:TEST'].slice(0, 3).join() === '1,1,1', 'RV1 (L4): the old counts kept');
    }
}

// v0.11.154 (owner pick PS1, RP1 push 2; Fable's texts, "ok for texts" 23:05): ST1–ST6, the last repeats inside a Coil from the map.
// Each slot is walked through go() on every day the calendar allows, and each occurrence must read differently.
{
    const D = 1440;
    const distinct = (a) => new Set(a).size === a.length;
    const forms = ['cat', 'tiger', 'human'];
    const RG = (seed, form, flags = {}) => {
        const g = ensureBars(fresh(seed));
        const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0; g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
        Object.assign(g.flags, flags); return ensureBars(g);
    };
    const at = (g, day, hh, id) => { g.minutes = (day - 1) * D + hh * 60; goTo(g, SCENES, id); return sceneView(g, SCENES).text; };
    // ST1: the prologue's camp and night, three nights, fire or not, food or not, every form
    for (const form of forms) for (const fire of [false, true]) for (const food of [false, true]) {
        const g = RG(58400, form, { fire }); if (food) g.inventory.hare_raw = 2; else { g.inventory.hare_raw = 0; g.inventory.jade_bracket = 0; }
        const camps = [], nights = [];
        for (let d = 1; d <= 3; d++) { g.flags.forest_day = d; camps.push(at(g, d, 19, 'camp')); nights.push(at(g, d, 21, 'night')); }
        assert(distinct(camps.map((t) => t.split('\n\n')[0])) && distinct(camps.map((t) => t.split('\n\n')[1].split('\n')[0])), `ST1: the camp's opener and food line differ on three nights (${form}, fire ${fire}, food ${food})`);
        assert(distinct(nights.map((t) => t.split('\n\n')[0])) && distinct(nights.map((t) => t.split('\n\n')[1])) && distinct(nights.map((t) => t.split('\n\n')[2])), `ST1: the night's three paragraphs differ on three nights (${form}, fire ${fire})`);
    }
    // ST2: the Fallout hub's first line and Ya's line on Days 8, 9 and 10, each time of day, Ya in the party or not
    for (const party of [false, true]) for (const hh of [8, 12, 17, 20]) {
        const g = RG(58410 + hh, 'cat', { ya_met: true, ya_party: party });
        const ts = [8, 9, 10].map((d) => at(g, d, hh, 'fo_ashfall').split('\n\n'));
        assert(distinct(ts.map((t) => t[0].replace(/\d+ days until/, ''))) && distinct(ts.map((t) => t[1])), `ST2: fo_ashfall's time line and Ya's line differ on Days 8–10 (${hh}:00, party ${party})`);
    }
    // ST3: the Blackroot's four nights (the Root Road, the Drowned Wood twice, the Ashen Hills): the watch paragraph differs every night,
    // the Drowned Wood's opener on its two nights, and its camp paragraph on its two days
    {
        const g = RG(58420, 'cat');
        const nights = [], camps = [];
        for (const [d, r] of [[11, 'rr'], [12, 'dw'], [13, 'dw'], [14, 'ah']]) { g.flags.bl_region = r; camps.push(at(g, d, 19, 'bl_camp')); nights.push(at(g, d, 21, 'bl_night').split('\n\n')); }
        assert(distinct(nights.map((n) => n[1])), 'ST3: the watch paragraph differs on all four nights');
        assert(nights[1][0] !== nights[2][0], 'ST3: the Drowned Wood night\'s opener differs on its second night');
        assert(camps[1].split('\n\n')[0] !== camps[2].split('\n\n')[0] && g.lines.d['bl_camp:dw']?.length === 2, 'ST3: the Drowned Wood camp differs on its second day (bl_camp keyed by region)');
        assert(nights[0][1].startsWith('Watches to set. Ya claims she never sleeps') && camps[1].startsWith('Camp is a raft of fallen trunks'), 'ST3: the Root Road\'s watches and the Drowned Wood\'s first camp keep the old texts');
    }
    // ST4: a breakthrough text for each realm from 2 to 14, by night and by day; the village's closer, but not where the sky didn't come
    const BTR = await import('../js/story/prologue.js');
    {
        const bodies = [], nights = [], days = [];
        for (let r = 2; r <= 14; r++) {
            const g = RG(58430 + r, 'cat'); g.james.realm = r; g.flags.bt_return = 'stream';
            g.minutes = 10 * D + 23 * 60; const n = SCENES.breakthrough.text(g); g.minutes = 10 * D + 12 * 60; const d = SCENES.breakthrough.text(g);
            const p = n.split('\n\n'); bodies.push(p.slice(0, -1).join('\n\n')); nights.push(p.at(-1)); days.push(d.split('\n\n').at(-1));
            if (r >= 3) { const { BT_REALMS: B } = BTR; assert(nights.at(-1) === B[r].night && days.at(-1) === B[r].day, `RV1 (TG): realm ${r}: the night closer by night, the day closer by day`); }
            g.flags.bt_return = 'ashfall'; const seen = SCENES.breakthrough.text(g);
            assert(/Ashfall watches it go/.test(seen) === ![10, 11, 12, 14].includes(r), `ST4: realm ${r}: the village's closer ${[10, 11, 12, 14].includes(r) ? 'left out (no sky came, or its own text ends in silence or holding clouds; v0.11.185 RV1 L2)' : 'kept'}`);
        }
        assert(distinct(bodies) && distinct(nights) && distinct(days), 'ST4: thirteen realms, thirteen texts, each closer its own');
        assert(bodies[0].startsWith('Once more the loop closes, a rung further up. Core Formation.') && bodies[12].startsWith('Heavenly Immortal.'), 'ST4: Core Formation keeps the old text; the top realm has its own');
    }
    // ST5: the Heart: the hall's time line over five days, the mornings over four, the quiet and knocking nights over four, Yuki's fifth day
    for (const hh of [3, 8, 13, 18]) {
        const g = RG(58440 + hh, 'cat', { ship_found: true });
        const ts = [16, 17, 18, 19, 20].map((d) => at(g, d, hh, 'heart_hub').split('\n\n')[0]);
        assert(distinct(ts), `ST5: the hall's ${hh}:00 line differs on five days`);
    }
    for (const [trio, party] of [[0, false], [0, true], [3, true]]) {
        const g = RG(58450, 'cat', { trio, ya_party: party });
        const ts = [17, 18, 19, 20].map((d) => at(g, d, 6, 'heart_morning'));
        assert(distinct(ts) && ts.every((t) => !/undefined/.test(t)), `ST5: four Heart mornings differ (trio ${trio}, Ya ${party})`);
        assert(/Today\.$/.test(ts[3].trim()) === true, 'ST5: the 4th morning says the tree is done waiting (Day 20, late)');
    }
    { // RV1 (TG): through go(), the scene's own roll and dayKey: four quiet and four knocking nights, each its own text
        const g = RG(58460, 'cat'); const got = { quiet: [], knock: [] };
        for (let d = 16; d < 120 && (got.quiet.length < 4 || got.knock.length < 4); d++) {
            g.minutes = (d - 1) * D + 23 * 60; goTo(g, SCENES, 'heart_night'); const kind = SCENES.heart_night.dayKey(g).split(':')[1];
            if (got[kind] && got[kind].length < 4) got[kind].push(sceneView(g, SCENES).text);
        }
        for (const kind of ['quiet', 'knock']) assert(got[kind].length === 4 && distinct(got[kind]), `ST5: four ${kind} nights through go(), four texts (${got[kind].length})`);
    }
    assert(YT_HUBS.heart_hub.length === 5 && YT_BODY['heart_hub:5']?.length === 3 && distinct(YT_HUBS.heart_hub.flatMap((k) => YT_BODY[k])), 'ST5: Yuki\'s scene has a 5th Heart day in every form, none twice');
    // the text lint's broken-text check on the texts it samples only at realms 0, 2 and 7 (ST4) or not at all (the lists)
    {
        const { broken, spacing } = await import('../tools/lib/textlint.mjs');
        const { BT_REALMS } = await import('../js/story/prologue.js');
        const all = [...Object.values(BT_REALMS).flatMap((o) => [o.body, o.night, o.day]), ...YT_BODY['heart_hub:5']];
        const bad = all.filter((t) => broken(t).length || spacing(t));
        assert(Object.keys(BT_REALMS).join() === '3,4,5,6,7,8,9,10,11,12,13,14' && !bad.length, `ST4/ST5: ${all.length} new texts, none broken (${bad.map((t) => t.slice(0, 30))})`);
    }
    // RV1 (CF): the camp goes by the night in the forest: a breakthrough that ends after 05:00 on the first night doesn't move it ahead
    {
        const g = RG(58480, 'cat', { fire: true }); g.flags.forest_day = 1;
        const first = at(g, 1, 19, 'camp').split('\n\n')[0];
        const after = at(g, 2, 5.2, 'camp').split('\n\n')[0]; // 05:12 on Day 2, still the first night (the day record now has two days)
        assert(g.lines.d.camp.length === 2 && after === first, 'RV1 (CF): still the first night\'s camp after a breakthrough past 05:00');
    }
    // RV1 (CL): a stay in the Heart past its texts' days keeps the last one, not the first
    {
        const g = RG(58481, 'cat', { ship_found: true });
        const ts = [16, 17, 18, 19, 20, 21].map((d) => at(g, d, 13, 'heart_hub').split('\n\n')[0]);
        assert(ts[5] === ts[4] && ts[5] !== ts[0], 'RV1 (CL): the hall\'s sixth day keeps the fifth day\'s line');
        const m = RG(58482, 'cat'); const ms = [17, 18, 19, 20, 21].map((d) => at(m, d, 6, 'heart_morning'));
        assert(ms[4] === ms[3] && ms[4] !== ms[0], 'RV1 (CL): a fifth Heart morning keeps the fourth\'s text');
    }
    // RV1 (FX): the Fallout hub by the story's day from 05:00: up past midnight stays the day before; a Day 11 morning stays Day 10's set
    {
        const g = RG(58483, 'cat');
        const set = (day, hh) => at(g, day, hh, 'fo_ashfall').split('\n\n')[0].replace(/ \d+ days until.*/, '');
        assert(set(9, 1) === set(8, 21), 'RV1 (FX): 01:00 on Day 9 (the hub\'s dusk) still shows Day 8\'s set');
        assert(set(11, 7) === set(10, 9) && set(10, 9) !== set(8, 9), 'RV1 (FX): Day 11 shows Day 10\'s set, not Day 8\'s');
    }
    // ST6: the grub, the fire-beetle and the darts: a second day's text; the first day's as before; the darts follow the day, not the outcome
    for (const k of ['rr_forage:2', 'rr_forage:2:after', 'ah_forage:2', 'ah_forage:2:after', 'ah_hunt:1:part', 'ah_hunt:1:full']) assert(DAY_REPLIES[k]?.length === 2 && distinct(DAY_REPLIES[k]), `ST6: ${k} has two texts`);
    {
        const g = RG(58470, 'cat'); g.flags.bl_region = 'rr';
        const eatGrub = (d) => { g.minutes = (d - 1) * D + 10 * 60; g.scene = 'rr_forage'; const i = SCENES.rr_forage.choices.findIndex((c) => c.text === 'Eat the grub.'); return SCENES.rr_forage.choices[i].do(g).join(' '); };
        assert(eatGrub(11) === 'It pops. Nutty cream, and under the cream, regret. +10 satiety. Ya cheers.', 'ST6: the grub\'s first day reads as before (v0.11.172, P5A: Fable\'s rewrite)');
        assert(/^It pops again\..* \+10 satiety\. Ya is already/.test(eatGrub(12)), 'ST6: the grub\'s second day, the gain in its place');
        const beetle = (d) => { g.minutes = (d - 1) * D + 10 * 60; g.scene = 'ah_forage'; return SCENES.ah_forage.choices.find((c) => /fire-beetle/.test(c.text)).do(g).join(' '); };
        assert(beetle(14) === 'Spicy. Not figuratively: chemically spicy. +6 satiety. Ya looks at you as if that was a proposal.', 'RV1 (TG): the beetle\'s first day reads as before (through its choice)');
        assert(/^Still spicy\..* \+6 satiety\. Ya holds up two fingers/.test(beetle(15)), 'RV1 (TG): the beetle\'s second day, the gain in its place');
        const darts = SCENES.ah_hunt.choices.find((c) => /^Darts/.test(c.text));
        g.minutes = 13 * D + 10 * 60; const p1 = darts.do(g, { ratio: 0.5 })[0];
        g.minutes = 14 * D + 10 * 60; const f2 = darts.do(g, { ratio: 1.2 })[0];
        assert(p1 === `The darts go out flat through the ash haze and most of them hit ash. One hare stops being fast. Ya fetches it without being asked and holds it up by the ears, considering it. "Thin," she says. "Like you." Above you the hawks wheel off, unimpressed, trailing sparks.` && DAY_REPLIES['ah_hunt:1:full'][0] === `The darts go out flat through the ash haze and the hares stop being fast. Ya fetches them without being asked and comes back holding them up by the ears. "Small," she says. "But you hit what you aimed at. Rare, for you." Above you the hawks wheel off, disappointed, trailing sparks.`, 'RV1 (TG): the darts\' old first-day texts, word for word');
        assert(p1 === DAY_REPLIES['ah_hunt:1:part'][0] && f2 === DAY_REPLIES['ah_hunt:1:full'][1], 'ST6: the darts: day 1 some hares (old), day 2 all hares (its second-day text)');
    }
}

// v0.11.179 (owner pick LB1): the label pass. Each changed label reads its new words where the scene draws it; K3 and K4 switch.
{
    const LB = (seed, form) => { const g = ensureBars(fresh(seed)); const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0; g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; return ensureBars(g); };
    const lab = (id, re) => (SCENES[id].choices || []).find((c) => re.test(typeof c.text === 'function' ? c.text(LB(1, 'cat')) : c.text));
    const say = (c, g) => (typeof c.text === 'function' ? c.text(g) : c.text);
    const NEW = [ // [scene, the old label's start, the new label]
        ['lf_hub', /^Wash in the river/, 'Wash in the river. The forest has been accumulating on you.'],
        ['lf_hub', /^Follow the smoke/, 'Follow the smoke toward people. (Advances the story.)'], // RV2 R9: lf_exit's label, the next screen, says "(Day 4 begins.)"
        ['night_won', /^Sleep/, "Sleep. What's left of the night."],
        ['night_fled', /^Sleep/, "Sleep. What's left of the night."],
        ['mei_lin', /^"Tell me about the tribute/, '"Tell me about the tribute. And the tribulations. And why the air here tastes like a funeral."'],
        ['wilds', /^Train:/, 'Train: darts, blade, footwork, and a sparring partner with views.'],
        ['rt_elder', /^Show him the truth/, 'Show him the truth: take him to the grove and let him breathe clean Qi, which he has not done in three hundred years.'],
        ['gao_dead', /^Go with her/, 'Go with her. Behind you, Gao Feng is still swearing, slowly and in great detail, what his Sect will do to you.'],
        ['evening', /^Flirt/, 'Flirt. Shamelessly. You\'re forty, not dead.'],
        ['rt_taken', /^Bite the tail/, 'Bite the tail. (Wake at the start of Act 1 or of the whole game; you keep what you learned.)'],
        ['collectors_lost', /^Bite the tail/, 'Bite the tail. (Wake at the first dawn; you keep what you learned.)'],
        ['rt_ya_village', /^Step between them/, 'Step between them. Talk everyone down, formally, as Ashfall likes it.'],
        ['yuki_form', /^Human\./, 'Human. Someone who answers aloud.'],
        ['yuki_human_after', /^Promise/, 'Promise. No occasion.'],
    ];
    for (const [id, re, want] of NEW) { const c = lab(id, re); assert(c && say(c, LB(2, 'cat')) === want, `LB1: ${id} reads "${want}"`); }
    for (const id of ['boar_won', 'boar_lost']) { const g = LB(3, 'cat'); assert(say(SCENES[id].choices[0], g) === 'Evening, and Mei Lin\'s table.', `LB1 (S3): ${id}'s evening label names the table`); }
    assert(readFileSync(new URL('../js/story/act1_return.js', import.meta.url), 'utf8').includes("hard: ['Cleaner than before."), 'LB1 (T2; RV2 R3): the drill reply has no time of day in it');
    // K3: Fang Wei alone is "him", the Tans are "them"
    for (const [who, pro] of [['lf_rogue', 'him'], ['lf_bandits', 'them']]) {
        const g = LB(4, 'cat'); g.flags.lf_human = who; const [a, b] = SCENES.lf_wanderers.choices.map((c) => say(c, g));
        assert(a === `Let ${pro} make ${pro === 'him' ? 'his' : 'their'} speech. Then answer it.` && b === `Talk your way past ${pro}. You're very good at being underestimated.`, `LB1 (K3): ${who} reads "${pro}" (${a} / ${b})`);
    }
    // K4 (RV2 R5): the hawks are no threat to the great root-kin (Ya: "looking somewhere else"); the cat and the woman are ("They want the small one")
    for (const [form, want] of [['cat', 'Take the hawks before they take Yuki.'], ['tiger', 'Take the hawks.'], ['human', 'Take the hawks before they take Yuki.']]) {
        const c = SCENES.ah_hunt.choices.find((x) => x.combat); assert(say(c, LB(5, form)) === want, `LB1 (K4): ${form} reads "${want}"`);
    }
    // none of the old words are left anywhere in the story files
    const all = readdirSync(new URL('../js/story/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8')).join('\n');
    for (const old of ['You have been in a forest for a long time', 'you will meet Mei Lin.)', 'everyone here tastes like a funeral', 'very unwilling sparring partner', 'for the first time in three hundred years', 'Cleaner than the first time', 'Flirt back. Shamelessly', 'the way Ashfall likes it', 'Someone to talk to', '(The Coil: wake at', 'still swearing — slowly']) assert(!all.includes(old), `LB1: "${old}" is gone`);
}

// v0.11.179 (LB1, X1, D1, F1): the full read's finds (Fable's wordings, F1's cuts), O2's "It", O3's tic, O4's three nights.
{
    const LB = (seed, form) => { const g = ensureBars(fresh(seed)); const realm = form === 'human' ? 7 : form === 'tiger' ? 2 : 0; g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; return ensureBars(g); };
    const say = (c, g) => (typeof c.text === 'function' ? c.text(g) : c.text);
    const has = (id, want, form = 'cat') => (SCENES[id].choices || []).some((c) => { try { return say(c, LB(6, form)) === want; } catch { return false; } });
    const NEW = [
        ['rt_evening', 'Call the cat off the stove, and follow Mei Lin up to the loft.', 'cat'], ['rt_evening', 'Call the cat off the floor, and follow Mei Lin up the ladder.', 'tiger'], ['rt_evening', 'Ask Yuki up off the bench, and follow Mei Lin to the loft.', 'human'],
        ['rt_evening', 'Go after Ya to the grove, and leave the door open.'], ['rr_scout', '"You followed me for three nights?"'], ['ya_offended', 'Track her. Nose first, since that\'s how she\'d do it.'],
        ['rt_road', 'Let the other two get ahead, and keep Yuki at your elbow.', 'human'], ['fo_drill', 'Run the line: bone in front, spears through the gaps, no one out on their own.'],
        ['fo_drill', 'Go a round with Yuki while they watch, and let them count what they missed.'], ['rt_hunters', 'Drill them hard: line tight, spears set, a shoulder on either side of everyone.'],
        ['rr_roots', 'Cultivate on the root. The song knows its way in.'], ['rt_grove', 'Cultivate in the grove, and let the song do the rest.'],
        ['rt_ya_talk', 'Kiss Ya before she gets there first.'], ['rt_mei_talk', 'Kiss her before she finds something else to hold.'], ['rt_yk_talk', 'Stop at the bend. Kiss Yuki while the others can\'t see round it.'],
        ['bl_fireside', 'Ya\'s hand finds yours and pulls toward the dark. Let it.'], ['lf_train', 'Needle drills: one point, one knuckle-width, a thousand times.'] /* RV2 R2: the old label, as its results count a thousand at a knuckle's width */, ['lf_hub', 'Sit out a season in seclusion. No realm to climb, only time.'],
        ['fo_wolf_lost', 'Bandage the arm. Sleep.'], ['ya_found', '"I\'m keeping this. Come back to camp, and bring Mei Lin a tooth too. She\'s been looking for you."'], ['scan_ok', '"Help" can wait. The clearing ahead can\'t.'],
    ];
    for (const [id, want, form] of NEW) assert(has(id, want, form), `LB1 (FR): ${id} offers "${want}"${form ? ` as ${form}` : ''}`);
    assert(YT_LABEL.HUMAN === 'Keep Yuki company.' && YT_LABEL.CAT === 'Sit with Yuki.' && YT_LABEL.GREAT === 'Lean on Yuki a while.', 'LB1 (FR, W6): Yuki time\'s human label, the other two unchanged');
    const scout = SCENES.rr_scout; const sg = LB(7, 'cat');
    assert(/Three nights it took me, working out what you were\./.test(say({ text: scout.text }, sg)) && !/Two days I followed/.test(say({ text: scout.text }, sg)), 'LB1 (O4): Ya followed three nights, as in the Fallout');
    const sc = scout.choices.find((c) => /three nights\?/.test(say(c, sg))); // RV2 TG: a missing label fails here, it doesn't throw
    assert(!!sc && /^"Ten days back\. Your first camp, by the stream/.test(sc.do(LB(8, 'cat'))[0]), 'LB1 (H1): the card\'s answer keeps the calendar fact (the menu\'s text is never drawn in task mode)');
    const all = readdirSync(new URL('../js/story/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8')).join('\n');
    for (const old of ['Gold eyes, level', 'You followed me for two days', 'Two days I followed', 'like she taught you', 'wait for Yuki to drop back', 'Sit down beside Yuki', 'nobody alone.\', check: { skill: \'GU\', dc: 4', 'what fast looks like', 'Let the song in. Cultivate', 'Sit among them and cultivate', 'Kiss her, there on the path', 'Kiss her before the path straightens', 'tugs you toward the dark, go', '(A season passes.)', 'Bandage it.', 'give one to Mei Lin, too', 'Later. First: the clearing', 'The cat is already up there', 'Yuki follows you.\'']) assert(!all.includes(old), `LB1 (FR): "${old}" is gone`);
    // O2: a save on the win screen with no fight on record reads "It", never "The it"
    const g = LB(9, 'cat'); g.flags.lf_last = 'no_such_fight'; const t = SCENES.lf_trial_won.text(g);
    assert(!/The it\b/.test(t) && /\bIt (won't|will)/.test(t), `LB1 (O2): no fight on record reads "It" (${t.slice(0, 80)})`);
    { const g2 = LB(10, 'cat'); g2.flags.lf_last = 'no_such_fight'; g2.flags.lf_trials_won = 2; const t2 = SCENES.lf_trial_won.text(g2); // RV2 TG (O2a): the later wins' branch
      assert(!/The it\b/.test(t2) && /\bIt will be back tomorrow/.test(t2), `LB1 (O2): a later win with no fight on record reads "It will be back" (${t2.slice(0, 120)})`); }
    // RV2 TG (TIC1–TIC3, RD1): the card's tic list over every text this push touched, and the four beats that replaced "Gold eyes, level"
    const card = readFileSync(new URL('../project/canon-card.md', import.meta.url), 'utf8');
    const TICS = [...(card.split('\n').find((l) => l.includes('Tics to avoid')) || '').matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((x) => x !== 'a black dress');
    assert(TICS.length >= 15 && TICS.includes('gold eyes level'), `LB1 (TG): the card's tic list read (${TICS.length})`);
    const KNOWN = []; // D1 (a11): the four older tics (the fire night's "a long time" twice, the first asking's "the first time" and "a good deal") are gone // older than this push (the fire night's "a long time" twice, the first asking's "the first time" and "a good deal"): on the roadmap, open, options later
    const tic = (t) => { let u = String(t); for (const re of KNOWN) u = u.replace(re, '.'); return TICS.find((x) => u.toLowerCase().replace(/[,.]/g, '').includes(x)); };
    const yk = LB(11, 'human'); yk.flags.lf_active = true;
    const touched = [YK_HERE.first, YK_QUESTION.again, SCENES.yk_choice.text(yk), ...['cat', 'tiger', 'human'].map((f) => SCENES.rt_yk_talk.text(LB(12, f))), ...Object.values(DRILL_AGAIN).flat(),
        ...NEW.map(([, w]) => w), ...Object.values(YT_LABEL)];
    for (const t of touched) assert(!tic(t), `LB1 (TG): no tic ("${tic(t)}") in a touched text (${String(t).slice(0, 60)})`);
    assert(!/gold eyes/i.test(all.match(/[^\n]*/g).filter((l) => /lecture is going well|answer with ears|I like my odds/.test(l)).join(' ')), 'LB1 (TG): no "gold eyes" beat left in the four texts');
    for (const [where, beat] of [[YK_QUESTION.again, 'She looks at you and waits.'], [YK_HERE.first, "She doesn't blink."], [SCENES.yk_choice.text(yk), 'Her gaze stays on you.']]) assert(where.includes(beat), `LB1 (O3): "${beat}" in its text`);
    assert(['cat', 'tiger', 'human'].every((f) => /I like my odds\." Very dry\./.test(SCENES.rt_yk_talk.text(LB(13, f)))), 'LB1 (O3, F1): rt_yk_talk\'s "Very dry."');
}

// v0.11.182 (owner picks CB1, DF1; group e's CM, push 2): the editions (core/edition.js), James's music and archive lines
// (music.js, music_texts.js): ET the slots and the table, ES the setting, EK both editions, ML one a text day, MR reactions,
// AR the archive's day, PC the stretches and the Act 1 Coil gate
{
    const E = await import('../js/core/edition.js');
    const M = await import('../js/story/music.js');
    const SG = await import('../js/story/songs.js'); // v0.11.183 (SG2): the CM2 checks below play with every song heard (CM3 tests the songs)
    const ALL_SONGS = Object.keys(SG.SONG_TEXTS).join(',');
    const D = 1440;
    // ES / ET: the default is general (DF1); a slot fills by edition; an unknown id throws
    assert(E.getEdition() === 'general' && E.EDITION_KEY === 'boneash.edition', 'CM2 (DF1): the general edition by default; the per-phone key');
    assert(E.setEdition('named') === 'named' && E.fillRefs('a {ref:x} b', { x: { named: 'N', general: 'g' } }) === 'a N b', 'CM2 (ET): the named edition fills the name');
    assert(E.setEdition('anything') === 'general' && E.fillRefs('a {ref:x} b', { x: { named: 'N', general: 'g' } }) === 'a g b', 'CM2 (ES): anything but named is general');
    { let threw = false; try { E.fillRefs('{ref:nope}', {}); } catch { threw = true; } assert(threw, 'CM2 (ET): an unknown slot throws'); }
    E.setEdition('general');
    // the lines: counts, fields, places, steps, gates
    const PLACES = { wilds: ['any'], ashfall: ['any', 'house', 'loft', 'lamp'], fallout: ['any', 'house', 'loft'], journey: ['any', 'camp', 'tree'], return: ['any', 'house', 'stove'] }; // RV1 (M3): no walk
    const COUNT = { wilds: 8, ashfall: 7, fallout: 15, journey: 28, return: 7 }; // RV1 (M3c-1): the prologue's five house reactions at the Fallout's supper
    const ARCH = { wilds: 1, ashfall: 2, fallout: 2, journey: 5, return: 1 };
    const every = Object.entries(M.MUSIC_LINES).flatMap(([s, p]) => Object.entries(p).flatMap(([k, l]) => l.map((x) => ({ ...x, s, k }))));
    assert(Object.keys(M.MUSIC_LINES).sort().join() === Object.keys(COUNT).sort().join(), 'CM2 (PC): five stretches');
    for (const [s, n] of Object.entries(COUNT)) {
        const l = every.filter((x) => x.s === s);
        assert(l.length === n && l.filter((x) => x.k === 'archive').length === ARCH[s], `CM2 (CB1): ${s} has ${n} lines, ${ARCH[s]} of them the archive (${l.length})`);
        { const plain = l.filter((x) => x.who === '-'); assert(l.every((x) => PLACES[s].includes(x.place)) && plain.filter((x) => x.place === 'any').length * 2 >= plain.length, `CM2: ${s}'s places are its own, at least half of its lines with no person any`); }
        if (['wilds', 'ashfall'].includes(s)) assert(l.every((x) => x.from === 0), `CM2 (PC): the prologue's ${s} has no Coil gate`);
    }
    for (const [s, want] of [['fallout', [5, 5, 5]], ['journey', [10, 9, 9]], ['return', [3, 2, 2]]]) assert([0, 1, 2].map((f) => every.filter((x) => x.s === s && x.from === f).length).join() === want.join(), `CM2 (PC): ${s} opens ${want.join(' / ')} on the act's Coils 1 / 2 / 3`);
    const WHO = { yuki: ['-'], mei: ['low', 'mid', 'high'], ya: ['low', 'mid', 'high'], mother: ['low', 'mid'], neighbour: ['high'] };
    const reacts = every.filter((x) => x.who !== '-');
    assert(reacts.length === 18 && reacts.every((x) => (WHO[x.who] || []).includes(x.step) && x.k === 'music'), `CM2 (MR): 18 reactions, each a person in a step it can reach (${reacts.length})`);
    assert(every.filter((x) => x.who === '-').every((x) => x.step === '-'), 'CM2 (MR): a line with no person has no step');
    assert(reacts.every((x) => x.who === 'yuki' || x.place !== 'any' || x.s === 'journey'), 'CM2 (MR): a village reaction names its place');
    // RV1 (TG7): who is there at the end of the screen (M1): the prologue's Dinner leaves Mei Lin; the Return's supper empties the house, so its reactions are told in the past
    assert(M.present({ flags: {} }, 'ashfall', 'house', 'mei') && !M.present({ flags: {} }, 'ashfall', 'house', 'mother') && every.filter((x) => x.s === 'ashfall' && x.who !== '-' && x.who !== 'yuki').length === 0, 'RV1 (M1, M3c-1): no reaction from the mother at the prologue\'s Dinner (she has gone to bed); its five house reactions are the Fallout\'s');
    assert(every.filter((x) => x.s === 'return' && ['mother', 'ya'].includes(x.who)).every((x) => /[Aa]t supper/.test(x.text) && !/\b(says|asks|wants|looks)\b/.test(x.text)), 'RV1 (M1): the Return\'s reactions are told in the past, at supper');
    // M2: the singing lines only while the guardian sings
    { const sl = every.filter((x) => x.singing); const G = (f) => ({ flags: f, rel: {}, coil: { act: 1, n: 1 }, stats: { coils0: 1 } });
      assert(sl.length === 2 && sl.every((x) => x.place === 'tree' && /singing/.test(x.text)) && every.filter((x) => /singing behind/.test(x.text)).every((x) => x.singing), 'RV1 (M2): the two lines with the singing behind the door are marked');
      assert(sl.map((x) => ({ ...x, from: 0 })).every((x) => !M.lineOpen(G({}), x, 'journey', 'tree') && M.lineOpen(G({ log_heard: true }), x, 'journey', 'tree') && M.lineOpen(G({ log_heard: true, guardian: 'lost' }), x, 'journey', 'tree') && !M.lineOpen(G({ log_heard: true, guardian: 'calmed' }), x, 'journey', 'tree')), 'RV1 (M2): heard from the log, on after the crawl, gone once the guardian is calmed'); }
    // ET / EK: every slot has a table entry, every entry is used; both editions fill; the general edition shows no name
    const RD = await import('../js/story/reading.js'); // RS1: the reading's slots share the table
    const readAll = [RD.READ.text, ...Object.values(RD.READ.ship), RD.READ.lover];
    const slots = new Set([...every.map((x) => x.text), ...readAll].flatMap((t) => [...t.matchAll(E.SLOT)].map((m) => m[1])));
    assert([...slots].every((id) => M.MUSIC_REFS[id]) && Object.keys(M.MUSIC_REFS).every((id) => slots.has(id)), `CM2 (ET): every slot in the table and every entry used (${slots.size} / ${Object.keys(M.MUSIC_REFS).length})`);
    const allMusicTexts = (ed) => every.map((x) => E.fillRefs(x.text, M.MUSIC_REFS, ed));
    const named = allMusicTexts('named'), general = allMusicTexts('general');
    assert(named.length === 65 && general.length === 65 && named.concat(general).every((t) => !/\{|\}/.test(t)), 'CM2 (EK): 65 lines in each edition, every slot filled');
    const NAMES = Object.values(M.MUSIC_REFS).flatMap((r) => r.named.replace(/[*]/g, '').split(/'s |, | of /)).map((n) => n.trim()).filter((n) => n.length > 3 && /^[A-Z]/.test(n));
    for (const t of general) { const hit = NAMES.find((n) => t.includes(n)); assert(!hit, `CM2 (EK): the general edition names no one ("${hit}" in ${t.slice(0, 60)})`); }
    assert(Object.values(M.MUSIC_REFS).every((r) => r.general && !/[A-Z]/.test(r.general.replace(/^\*/, '')[0]) && r.general !== r.named), 'CM2 (ET): each general phrase is its own, starting lower case');
    const RESERVED = /Trøllabundin|Dúrin|Hammerdeep|Dwarven Forge|Music Box of Fate|\bBreathe\b|Eater's Call|Boof Pack|Genesis|Non-Fiction|\bReflect\b|Lyfjaberg|Eivør|Clamavi|Wardruna|Ironmouse|Nyanners|Athelstan|Holoadvent|Holomyth/i;
    assert(named.every((t) => !RESERVED.test(t)) && !RESERVED.test(JSON.stringify(M.MUSIC_REFS)), 'CM2 (SG): the songs and artists kept for push 3 are not used');
    assert(every.every((x) => !/(^|[.!?]\s+|"\s*)\{ref:/.test(x.text) && !/\{ref:[a-z0-9_]+\}'s/.test(x.text)), 'CM2 (ET): no slot opens a sentence or takes an \'s');
    // ML: the screens; the five lines of the game's own count as the day's
    assert(Object.keys(M.MUSIC_SCREENS).length === 18 && Object.keys(M.MUSIC_SCREENS).every((id) => SCENES[id]) && !M.MUSIC_SCREENS.supper && !M.MUSIC_SCREENS.mei_walk && !M.MUSIC_SCREENS.yk_camp, 'CM2 (ML, W1; RV1 M3): 18 evening screens, all real; not the supper or the sunset walk (the roof and the third supper follow them), nor Yuki\'s walk (a romance night)');
    const src = readdirSync(new URL('../js/story/', import.meta.url)).filter((f) => f.endsWith('.js') && !/^music/.test(f)).map((f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8')).join('\n');
    assert((src.match(new RegExp(M.OWN_MUSIC.source, 'gi')) || []).length === 5, 'CM2 (ML): the five music lines already in the game are the ones OWN_MUSIC finds');
    const at = (seed, scene, hour, extra = {}) => { const g = ensureBars(fresh(seed)); g.scene = scene; g.minutes = 2 * D + hour * 60; g.flags.songs = ALL_SONGS; Object.assign(g.flags, extra.flags || {}); if (extra.act) { g.coil = { ...(g.coil || {}), act: extra.act }; } for (const [w, f] of Object.entries(extra.rel || {})) g.rel[w] = { f, a: 0 }; linesOf(g).at = scene; return g; };
    const view = (g, text = 'A screen.') => ({ id: g.scene, text });
    { const g = at(77001, 'camp', 14); g.minutes += 59; assert(M.musicLine(g, view(g)) === null, 'CM2 (ML): none before 15:00 (14:59)'); g.minutes += 1; assert(M.musicLine(g, view(g)) !== null, 'RV1 (TG2): one from 15:00'); }
    { const g = at(77005, 'camp', 20); const a = M.musicLine(g, view(g)); linesOf(g).cur = {}; // RV1 (L1): back from a form change or a breakthrough: the same visit
      const b = M.musicLine(g, view(g), { newVisit: false }); assert(a && b && a.key === b.key, 'RV1 (L1): the line stays when the same visit comes back from a meta screen');
      linesOf(g).cur = {}; assert(M.musicLine(g, view(g), { newVisit: true }) === null, 'RV1 (L1): a new visit the same day shows none'); }
    { const g = at(77002, 'camp', 20); const a = M.musicLine(g, view(g)); const b = M.musicLine(g, view(g));
      assert(a && b && a.text === b.text && a.key === b.key, 'CM2 (ML): a line at 20:00, the same on a redraw of the visit');
      linesOf(g).at = 'night'; linesOf(g).cur = {}; g.scene = 'night'; assert(M.musicLine(g, view(g)) === null, 'CM2 (ML): one a text day: the next evening screen shows none');
      g.scene = 'camp'; linesOf(g).cur = {}; assert(M.musicLine(g, view(g)) === null, 'CM2 (ML): a later visit the same day shows none');
      g.minutes += D; g.scene = 'night'; linesOf(g).cur = {}; const c = M.musicLine(g, view(g)); assert(c && c.key !== a.key, 'CM2 (ML): the next day a line again, another one'); }
    { const g = at(77003, 'camp', 20); assert(M.musicLine(g, { id: 'mei_curious', text: 'Your arm is playing low.' }) === null, 'CM2 (ML): a screen with its own music line shows no pool line');
      assert(M.musicLine(g, view(g)) === null, 'CM2 (ML): and uses up the day'); }
    { const g = at(77004, 'wild_forage', 20); assert(M.musicLine(g, view(g)) === null, 'CM2 (ML): never on another screen (a forage, a hunt)'); }
    // MR: a reaction only where its person is, in its step
    const reactAt = (who, step) => reacts.find((x) => x.who === who && x.step === step);
    for (const [who, step, lo, hi] of [['mei', 'mid', 30, 79], ['mei', 'high', 80, 150], ['mother', 'low', -10, 29], ['mother', 'mid', 30, 79]]) { // RV1 (TG2): the boundaries 29 / 30, 79 / 80
        const x = reactAt(who, step); if (!x) { assert(false, `CM2 (MR): ${who} ${step} exists`); continue; }
        const place = x.place === 'any' ? (x.s === 'journey' ? 'camp' : 'house') : x.place;
        const R = { mei: 'Mei Lin', mother: 'Mother' }[who];
        const ok = (f) => M.lineOpen(at(77010, 'x', 20, { act: x.s === 'fallout' || x.s === 'return' || x.s === 'journey' ? 1 : 0, rel: { [R]: f }, flags: { mei_party: true } }), { ...x, from: 0 }, x.s, place);
        assert(ok(lo) && ok(hi) && (step === 'low' || !ok(lo - 1)) && (hi >= 150 || !ok(hi + 1)), `CM2 (MR): ${who} ${step} opens from ${lo} to ${hi} only`);
    }
    { const x = reactAt('ya', 'high'); if (x && x.s === 'journey') { const g = at(77011, 'bl_camp', 20, { act: 1, rel: { Ya: 120 } });
        assert(!M.lineOpen(g, { ...x, from: 0 }, 'journey', 'camp'), 'CM2 (MR): Ya reacts on the journey only once in the party');
        g.flags.ya_party = true; assert(M.lineOpen(g, { ...x, from: 0 }, 'journey', 'camp') && !M.lineOpen(g, { ...x, from: 0 }, 'journey', 'walk'), 'CM2 (MR): in the party she does, never on Yuki\'s walk'); } }
    // PC: a line opening on the act's second Coil is shut on its first and comes first on its second
    { const x = every.find((y) => y.s === 'journey' && y.from === 1 && y.who === '-' && y.place === 'any');
      const g = at(77020, 'bl_camp', 20, { act: 1 }); g.stats.coils0 = 1; g.coil.n = 1;
      assert(x && actCoil(g) === 0 && !M.lineOpen(g, x, 'journey', 'camp'), 'CM2 (PC): the second Coil\'s lines are shut on the first');
      g.coil.n = 2; assert(actCoil(g) === 1 && M.lineOpen(g, x, 'journey', 'camp'), 'CM2 (PC): and open on the second');
      // RV1 (F4): each night shows a line opening on this Coil while one is open in that night's pool (music, or the archive one day in four)
      const openNew = { music: M.MUSIC_LINES.journey.music.filter((y) => y.from === 1 && M.lineOpen(g, y, 'journey', 'camp')).length, archive: M.MUSIC_LINES.journey.archive.filter((y) => y.from === 1 && M.lineOpen(g, y, 'journey', 'camp')).length };
      const used = { music: 0, archive: 0 }; let fresh2 = 0, want = 0;
      for (let d = 0; d < 9; d++) { g.minutes = (12 + d) * D + 20 * 60; linesOf(g).cur = {}; const r = M.musicLine(g, view(g)); if (!r) continue;
          const [, k, i] = r.key.split('.'); if (used[k] < openNew[k]) want++; used[k]++; if (M.MUSIC_LINES.journey[k][Number(i)].from === 1) fresh2++; }
      assert(openNew.music >= 4 && fresh2 === want && want >= 5, `CM2 (PC): on the second Coil its new lines come first (${fresh2} of ${want} nights that had one open; RV1, F4)`); }
    // AR: the archive's day, one in four
    { let n = 0; const g = at(77030, 'camp', 20); for (let d = 0; d < 4000; d++) if (M.archiveDay(g, d)) n++; assert(n > 920 && n < 1080, `CM2 (AR; RV1 TG3): the archive's day one in four (${n} of 4000)`); }
    // RV1 (TG5): the card's tics, Yuki's forms and proper names in the general edition, on every music line and the reading
    { const card = readFileSync(new URL('../project/canon-card.md', import.meta.url), 'utf8');
      const TICS = [...(card.split('\n').find((l) => l.includes('Tics to avoid')) || '').matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((x) => x !== 'a black dress');
      const RD0 = await import('../js/story/reading.js');
      const texts = [...every.map((x) => x.text), RD0.READ.text, ...Object.values(RD0.READ.ship), RD0.READ.lover, ...Object.values(M.MUSIC_REFS).flatMap((r) => [r.named, r.general])];
      for (const t of texts) { const low = t.toLowerCase().replace(/[,.;:!?"]/g, ''); const hit = TICS.find((x) => low.includes(x)); assert(TICS.length >= 15 && !hit, `RV1 (TG5): no tic ("${hit}") in ${t.slice(0, 50)}`); }
      for (const x of every.filter((y) => /Yuki/.test(y.text))) assert(!/shoulder|paw|purr|whisker|\btail\b|says the bond|\*[^*]+\*/.test(x.text.replace(/\{ref:[a-z0-9_]+\}/g, '')), `RV1 (TG5): Yuki's line fits every form (${x.key})`);
      const capsOk = new Set(Object.values(SCENES).flatMap((sc) => { try { return [...String(typeof sc.text === 'function' ? sc.text(ensureBars(fresh(1))) : sc.text || '').matchAll(/\b[A-Z][a-z'-]+/g)].map((m) => m[0]); } catch { return []; } }));
      for (const w of ['Yuki', 'Mei', 'Lin', 'Ya', 'Old', 'Wen', 'Sect', 'Blackroot', 'Selene', 'Ashfall', 'Seedlings', 'Parallel', 'Cognition', 'J-pop', 'K-pop', 'Synthwave', 'Synthpop', 'Futurepop', 'Darkwave', 'Nerdcore', 'Folk', 'Death', 'My', 'We', 'You', 'It', 'One', 'Forty']) capsOk.add(w);
      for (const t of [...every.map((x) => E.fillRefs(x.text, M.MUSIC_REFS, 'general')), ...Object.values(M.MUSIC_REFS).map((r) => r.general)]) {
          const mid = [...t.matchAll(/(?<![.!?"*:]\s|^|\*)\b([A-Z][A-Za-z'-]+)/g)].map((m) => m[1]).filter((w) => !capsOk.has(w));
          assert(!mid.length, `RV1 (TG5): the general edition names no one ("${mid.join(', ')}" in ${t.slice(0, 50)})`); } }
    // a random walk drawing every screen as main.js does: one line a day at most, only on the evening screens from 15:00
    {
        const { isTaskHub: hubQ, taskCards: tc, taskOpen: to, runTask: rt, taskState: ts, isTaskChoice: itc } = await import('../js/core/tasks.js');
        let days = 0, withLine = 0, twice = 0, bad = 0; let s = 7; const shownKeys = new Set(); // RV1 (TG1): every line shows in a real game
        const rnd = (n) => { s = (s * 1103515245 + 12345) >>> 0; return (s >>> 8) % n; };
        const songsSeen = {}, beforeSong = {}; let afterSong = 0, dupSong = 0; // v0.11.183 (SG2; RV1 TG1)
        for (let n = 0; n < 160; n++) {
            const gameSongs = [];
            const g = ensureBars(fresh(78000 + n)); const per = {};
            for (let st = 0; st < 3000; st++) {
                const v = sceneView(g, SCENES); if (v.end) break;
                const av = againView(g, v); // RV1 (TG3): newVisit passed as main.js does
                const r0 = M.musicLine(g, v, { newVisit: av?.newVisit }); const k = `${coilStamp(g)}|${textDay(g)}`;
                const e = per[k] || (per[k] = new Set());
                // v0.11.183 (SG2): a song is counted apart (any screen, any hour), once a game (ON-S); no line after an evening one that day (DU-A)
                if (r0 && r0.key.startsWith('song.')) { const evening = M.MUSIC_SCREENS[g.scene] && clockHour(g) >= 15; if (!e.has(r0.key)) { songsSeen[r0.key] = (songsSeen[r0.key] || 0) + 1; gameSongs.push(r0.key); if (evening && [...e].some((x) => x !== 'song' && !x.startsWith('song.'))) beforeSong[r0.key] = (beforeSong[r0.key] || 0) + 1; } e.add(r0.key); if (evening) e.add('song'); } // DU-A: an evening song takes the day; RV1 (TG1): and no line before it that evening
                const r = r0 && !r0.key.startsWith('song.') ? r0 : null; if (r && e.has('song')) afterSong++;
                if (M.OWN_MUSIC.test(v.text || '')) e.add('own');
                if (r) { e.add(r.key); shownKeys.add(r.key); if (!M.MUSIC_SCREENS[g.scene] || clockHour(g) < 15 && clockHour(g) >= 5) bad++; }
                if (hubQ(g)) { const cards = tc(g, SCENES).filter((c) => c.status === 'open'); const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !itc(SCENES, g.scene, c.index)));
                    if (cards.length && (rnd(10) < 8 || !stops.length)) { const id = cards[rnd(cards.length)].id; if (to(g, SCENES, id)) rt(g, SCENES, id); ts(g).queue.length = 0; continue; }
                    if (!stops.length) break; const c = stops[rnd(stops.length)]; const out = choose(g, SCENES, c.index); if (out.combat) { startCombat(g, out.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const o = combatStep(g, smartAction(g, t)); if (o?.done) { goTo(g, SCENES, o.next); break; } } } continue; }
                const open = v.choices.filter((c) => !c.disabled); if (!open.length) break;
                const bite = open.filter((c) => /Bite the tail/.test(c.label)); const c = bite.length ? bite[0] : open[rnd(open.length)];
                const out = choose(g, SCENES, c.index); if (out.combat) { startCombat(g, out.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const o = combatStep(g, smartAction(g, t)); if (o?.done) { goTo(g, SCENES, o.next); break; } } }
            }
            for (const e0 of Object.values(per)) { const e = [...e0].filter((x) => x !== 'song' && !x.startsWith('song.')); days++; if (e.length) withLine++; if (e.length > 1) twice++; }
            if (new Set(gameSongs).size !== gameSongs.length) dupSong++;
        }
        assert(dupSong === 0 && afterSong === 0, `CM3 (ON-S, DU): 160 random games: no song twice in a game (${dupSong}), no music line after an evening song the same day (${afterSong})`);
        assert(Object.keys(songsSeen).length === 13, `CM3 (PL; RV1 TG2): all 13 songs show in 160 random games (${Object.keys(songsSeen).length}: ${Object.keys(songsSeen).map((k) => k.slice(5)).join(', ')})`);
        assert(Object.keys(beforeSong).length === 0, `CM3 (RV1 M1, TG1): no music line earlier the same evening as an evening song (${JSON.stringify(beforeSong)})`);
        assert(twice === 0 && bad === 0 && withLine > days * 0.4, `CM2 (ML): 160 random games, ${days} text days, ${withLine} with a music line, ${twice} with two (the game's own lines counted), ${bad} off the evening screens`);
        { const allKeys = Object.entries(M.MUSIC_LINES).flatMap(([st, p]) => Object.entries(p).flatMap(([k, l]) => l.map((x, i) => [`${st}.${k}.${i}`, x.key])));
          const miss = allKeys.filter(([k]) => !shownKeys.has(k)).map(([, key]) => key);
          assert(miss.length === 0, `RV1 (TG1): every music and archive line shows in 160 random games (never: ${miss.join(', ') || 'none'})`); }
    }

    // CM3 (v0.11.183, owner picks SG2, D1): the songs: PL each once in its scene, ON-S once a save (kept across the Coil), DU the day's music, ED both editions
    {
        const T = SG.SONG_TEXTS, A = SG.SONG_AT;
        const keys = Object.keys(T);
        assert(JSON.stringify(A) === JSON.stringify({ night: 'reflect', fo_elder_named: 'hammerdeep', fo_depart: 'genesis', bl_camp: 'boof_pack', dw_enter: 'waters_call', ah_enter: 'lyfjaberg', ape_lured: 'trollabundin', heart_view: 'music_box', heart_hall: 'durin', ship_wreck: 'mumei_song', rt_camp: 'non_fiction', rt_arrive: 'breathe', rt_elder: 'dwarven_forge' }), 'CM3 (PL, RV1 F11): the placement map the owner picked (SG2)');
        assert(keys.length === 13 && Object.keys(A).length === 13 && Object.keys(A).every((id) => SCENES[id]) && new Set(Object.values(A)).size === 13 && Object.values(A).every((k) => T[k]), 'CM3 (PL): 13 songs, each in one real scene, every song placed (FC: the notes hold 13)');
        const songSlots = new Set(keys.flatMap((k) => [...T[k].text.matchAll(E.SLOT)].map((m) => m[1])));
        assert([...songSlots].every((id) => SG.ALL_REFS[id]) && Object.keys(SG.SONG_REFS).every((id) => songSlots.has(id)), `CM3 (ET): every song slot in a table and every song entry used (${songSlots.size})`);
        assert(Object.values(SG.SONG_REFS).every((r) => r.general && r.general !== r.named && !/[A-Z]/.test(r.general.replace(/^\*/, '')[0])), 'CM3 (ET): each general phrase is its own, starting lower case');
        assert(keys.every((k) => !/(^|[.!?]\s+|"\s*)\{ref:/.test(T[k].text) && !/\{ref:[a-z0-9_]+\}'s/.test(T[k].text)), 'CM3 (ET): no slot opens a sentence or takes an \'s');
        const forms = [{ realm: 0, form: 'cat' }, { realm: 2, form: 'tiger' }, { realm: 7, form: 'human' }];
        const outs = (ed) => keys.flatMap((k) => forms.map((y) => SG.songText({ flags: {}, yuki: y }, k, ed)));
        const named = outs('named'), general = outs('general');
        assert(named.concat(general).every((t) => !/[{}]/.test(t)), 'CM3 (EK): both editions fill every slot and Yuki\'s line');
        const NAMES = Object.values(SG.ALL_REFS).flatMap((r) => r.named.replace(/[*"]/g, '').split(/'s |, | of |, with | singing/)).map((n) => n.trim()).filter((n) => n.length > 3 && /^[A-Z]/.test(n));
        for (const t of general) { const hit = NAMES.find((n) => t.includes(n)) || (t.match(/Ironmouse|Aethelstan|Nyanners|Eivør|Wardruna|Clamavi|hololive|Mumei|Gura|Miranda|Heights|Hammerdeep|Dúrin|Lyfjaberg|Trøllabundin/) || [])[0]; assert(!hit, `CM3 (EK): the general edition names no one ("${hit}" in ${t.slice(0, 60)})`); }
        assert(named.every((t) => !/Eater's Call|\bAthelstan/.test(t)), 'CM3 (FC): The Water\'s Call and Aethelstan, as the search found them');
        assert(T.music_box.text.includes('{ref:ironmouse}') && /bed/.test(T.music_box.text) && /bottled air/.test(T.music_box.text) && /Mei Lin/.test(T.music_box.text) && /\bYa\b/.test(T.music_box.text), 'CM3 (PL): Music Box of Fate shown to Ya and Mei Lin, with her circumstances');
        assert(/Ya/.test(T.boof_pack.text) && /Mei Lin/.test(T.boof_pack.text) && T.boof_pack.yuki, 'CM3 (PL): Boof Pack: Ya, Mei Lin and Yuki react');
        assert(/hunt was over/.test(T.trollabundin.text), 'CM3 (lore): no music while hunting: Trøllabundin starts once it is a fight');
        assert(!/bed-woman/.test(T.breathe.text), 'CM3 (D1, C7): Ya does not remember the roots song (only James and Yuki remember other Coils)');
        for (const k of keys) {
            const x = T[k];
            assert((x.text.match(/\{YUKI\}/g) || []).length === (x.yuki ? 1 : 0), `CM3 (Yuki): ${k}: one {YUKI} exactly when it has her line`);
            if (x.yuki) assert(/^\*[^*]+\*/.test(x.yuki.bond) && /says Yuki/.test(x.yuki.bond) && /^"/.test(x.yuki.aloud) && !/\*/.test(x.yuki.aloud) && /says Yuki/.test(x.yuki.aloud), `CM3 (Yuki): ${k}: through the bond in italics, aloud in quotes`);
            assert(!/paw|purr|whisker|\btail\b|shoulder/.test(x.text), `CM3 (Yuki): ${k} fits all three of her forms`);
        }
        { const y = T.reflect.yuki; assert(SG.songText({ flags: {}, yuki: { realm: 7, form: 'human' } }, 'reflect').includes(y.aloud) && SG.songText({ flags: {}, yuki: { realm: 2, form: 'tiger' } }, 'reflect').includes(y.bond), 'CM3 (Yuki): aloud as a human, through the bond as a cat'); }
        { const card = readFileSync(new URL('../project/canon-card.md', import.meta.url), 'utf8');
          const TICS = [...(card.split('\n').find((l) => l.includes('Tics to avoid')) || '').matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((x) => x !== 'a black dress');
          for (const t of named) { const low = t.toLowerCase().replace(/[,.;:!?"]/g, ''); const hit = TICS.find((x) => low.includes(x)); assert(!hit, `CM3: no tic ("${hit}") in ${t.slice(0, 50)}`); } }
        // ON-S, DU: once a save, the same on a redraw of its visit, the day's music, kept across every Coil
        const sat = (seed, scene, day, hour, flags = {}) => { const g = ensureBars(fresh(seed)); g.scene = scene; g.minutes = day * D + hour * 60; Object.assign(g.flags, flags); linesOf(g).at = scene; return g; };
        { const g = sat(77101, 'night', 1, 22);
          assert(SG.heardSongs(g).size === 0 && SG.songDue(g, 'night') === 'reflect', 'CM3 (ON-S): a new game (or an older save) has heard none');
          const a = M.musicLine(g, view(g));
          assert(a && a.key === 'song.reflect' && /Reflect|shark/.test(a.text) && SG.heardSongs(g).has('reflect'), 'CM3 (PL): the song under its scene, marked heard');
          const b = M.musicLine(g, view(g)); linesOf(g).cur = {}; const c = M.musicLine(g, view(g), { newVisit: false }); // RV1 (TG3): a meta screen's way back clears the visit mark
          assert(b && c && b.key === a.key && c.key === a.key, 'CM3: the same on every redraw of that visit (and back from a meta screen)');
          linesOf(g).cur = {}; assert(M.musicLine(g, view(g)) === null, 'CM3 (ON-S, DU): a new visit the same day: no song again, no other line');
          g.scene = 'camp'; linesOf(g).at = 'camp'; linesOf(g).cur = {}; assert(M.musicLine(g, view(g)) === null, 'CM3 (DU): no music line after the song that day');
          g.minutes += D; g.scene = 'night'; linesOf(g).at = 'night'; linesOf(g).cur = {}; const d2 = M.musicLine(g, view(g));
          assert(!d2 || !d2.key.startsWith('song.'), 'CM3 (ON-S): the next day the song does not come back (a music line may)');
          assert(KEEP_FLAGS.includes('songs'), 'CM3 (ON-S): the heard songs are kept across the Coil');
          g.flags.songs = 'reflect,boof_pack'; rewind(g); assert(SG.heardSongs(g).has('reflect') && SG.heardSongs(g).has('boof_pack'), 'CM3 (ON-S): and survive a rewind'); }
        { const g = sat(77102, 'fo_elder_named', 8, 6, { songs: 'reflect' }); g.coil = { ...(g.coil || {}), act: 1 };
          const r = M.musicLine(g, view(g)); assert(r && r.key === 'song.hammerdeep', 'CM3 (PL): a song shows at any hour (Thirteen Days, 06:00)');
          assert(String(g.flags.songs).split(',').sort().join() === 'hammerdeep,reflect', 'CM3 (ON-S): the flag a comma list of keys');
          assert(!(linesOf(g).mu && linesOf(g).mu.d === textDay(g)), 'CM3 (DU-A): a morning song leaves the day its evening line');
          g.scene = 'fo_supper'; linesOf(g).at = 'fo_supper'; linesOf(g).cur = {}; g.minutes += 13 * 60; Object.assign(g.flags, { songs: ALL_SONGS });
          const ev = M.musicLine(g, view(g)); assert(ev && !ev.key.startsWith('song.'), 'CM3 (DU-A): and the evening has its line'); }
        { const g = sat(77103, 'night', 1, 22, { songs: 'reflect,nonsense' }); assert(SG.heardSongs(g).size === 1, 'CM3: an unknown key in the flag is ignored'); }
        { const g = sat(77104, 'heart_view', 15, 19, { mei_party: true, ya_party: true }); g.coil = { ...(g.coil || {}), act: 1 };
          E.setEdition('named'); const r = M.musicLine(g, view(g)); E.setEdition('general');
          assert(r && /Ironmouse/.test(r.text) && /Music Box of Fate/.test(r.text), 'CM3 (ED): the named edition names her and the song');
          const gen = SG.songText(g, 'music_box', 'general'); assert(!/Ironmouse|Music Box/.test(gen) && /a drawing of the singer/.test(gen), 'CM3 (ED): the general one does not'); }
        // RV1 (TG4): the DU-A boundary: an evening song at 14:59 leaves the day its line, at 15:00 it is the day's music
        for (const [hr, taken] of [[14 + 59 / 60, false], [15, true]]) { const g = sat(77105 + Math.round(hr), 'bl_camp', 11, hr, { mei_party: true, ya_party: true, songs: 'reflect' }); g.coil = { ...(g.coil || {}), act: 1 };
          const r = M.musicLine(g, view(g)); const mu = linesOf(g).mu;
          assert(r && r.key === 'song.boof_pack' && !!(mu && mu.d === textDay(g)) === taken, `CM3 (DU-A, TG4): a song at ${taken ? '15:00 takes' : '14:59 leaves'} the day's line`); }
        // RV1 (M1): the Wilds' camp has no line while Reflect is to come; after it, it has
        { const g = sat(77107, 'camp', 1, 19); assert(M.DEFER.camp(g) === true && M.musicLine(g, view(g)) === null, 'CM3 (RV1 M1): the Wilds camp waits for Reflect');
          g.flags.songs = 'reflect'; assert(M.DEFER.camp(g) === false, 'CM3 (RV1 M1): and not once it has played'); }
        // RV1 (TG5): the facts and the owner's fixed reactions, pinned by a word or two
        { const mb = T.music_box.text;
          assert(/opera/.test(mb) && /Every week/.test(mb) && /part of the blood she can't make/.test(mb) && /give it\./.test(mb) && !/give blood/.test(mb) && /bottled air/.test(mb) && !/Can't breathe/.test(mb), 'CM3 (FC, TG5): Music Box: opera, weekly plasma, the plasma appeal, oxygen (RV1 M6, L1)');
          assert(/I'm going to stop/.test(mb) && /That's the strong/.test(mb), 'CM3 (TG5): Mei Lin moved and inspired, Ya the true inner strength');
          assert(/laughs so hard/.test(T.boof_pack.text) && /hands over her ears/.test(T.boof_pack.text) && /cart roll/.test(T.boof_pack.text), 'CM3 (TG5): Boof Pack: Ya delighted, Mei Lin horrified, Yuki amused');
          assert(/^The hunt was over/.test(T.trollabundin.text) && !/stalk|creep|lure/.test(T.trollabundin.text), 'CM3 (lore, TG5): Trøllabundin starts after the hunt, never during it'); }
        // RV1 (TG6): who is present against each scene's always-shown text
        assert(!/\bYa (says|asks|calls)|says Ya/.test(T.mumei_song.text) && /Ya, who has said nothing/.test(T.mumei_song.text), 'CM3 (RV1 M4, TG6): mumei keeps Ya silent, as ship_wreck has her');
        assert(!/four of you|holds its bow/.test(T.genesis.text) && /You don't\.$/.test(T.genesis.text), "CM3 (RV1 M2, TG6): Genesis stops before bl_start's send-off");
        assert(keys.filter((k) => /made (them )?up|a story too/.test(T[k].text)).join() === 'durin', 'CM3 (RV1 M5): the dwarves-are-made-up beat once (Dúrin)');
        assert(/give him the words/.test(T.hammerdeep.text) && !/Play it at the well/.test(T.hammerdeep.text), 'CM3 (RV1 M3, L7): James translates for Old Wen');
        assert(SG.songText({ flags: {}, yuki: { realm: 0, form: 'cat' } }, 'breathe', 'general').includes('the singer from the roots') && !/on a stream/.test(T.breathe.text) && !/her streams/.test(T.waters_call.text), "CM3 (RV1 L2): the general edition reads right (Breathe, The Water's Call)");

    }
    // RS1 (D1, R1): "Read to Ya" at the Heart's camp: the gate, the scene, the ship's sentence, the lover's, the editions, the day's line
    {
        const R = RD; const L1 = R.READ.label;
        const { SOCIAL, EAT: EATLIKE } = await import('./lib/social.mjs');
        assert(L1.length < 45 && /\.$/.test(L1) && !SOCIAL.test(L1) && !EATLIKE.test(L1) && R.READ.sleep.length < 45 && /\.$/.test(R.READ.sleep), 'RS1: the labels end with a full stop, under 45 characters, not read as a talk or a meal by the bots');
        const idx = SCENES.heart_camp.choices.findIndex((c) => c.to === 'heart_read');
        assert(idx === SCENES.heart_camp.choices.length - 1 && SCENES.heart_camp.choices[idx].time === 30 && !SCENES.heart_camp.choices[idx].check, 'RS1: the choice appended last on heart_camp (no position changes), 30 minutes, no check');
        const camp = (seed, h, flags = {}) => { const g = ensureBars(fresh(seed)); g.coil = { ...(g.coil || {}), act: 1 }; g.scene = 'heart_camp'; g.minutes = 16 * D + h * 60; Object.assign(g.flags, { ya_party: true }, flags); return g; };
        const shows = (g) => sceneView(g, SCENES).choices.some((c) => c.index === idx);
        assert(!shows((() => { const g = camp(79001, 15); g.minutes += 59; return g; })()) && shows(camp(79006, 16)) && shows(camp(79002, 20)) && !shows(camp(79003, 20, { ya_party: false })) && !shows(camp(79004, 20, { hc_read: true })), 'RS1: from 16:00 (RV1 TG2: not 15:59), only with Ya in the party, once a Coil');
        { const g = camp(79005, 20); const ya0 = JSON.stringify(g.rel.Ya || null), m0 = g.minutes; choose(g, SCENES, idx);
          assert(g.scene === 'heart_read' && g.flags.hc_read && g.minutes - m0 === 30 && JSON.stringify(g.rel.Ya || null) === ya0, 'RS1: the scene, 30 minutes, her flag, no gain');
          const v = sceneView(g, SCENES); assert(v.choices.length === 1 && v.choices[0].label === R.READ.sleep, 'RS1: one way out');
          choose(g, SCENES, v.choices[0].index); assert(g.scene === 'heart_night', 'RS1: then the night');
          assert(!KEEP_FLAGS.includes('hc_read'), 'RS1: hc_read resets with the Coil'); }
        const txt = (flags, ed = 'general') => { E.setEdition(ed); const t = R.readText(camp(79010, 20, flags)); E.setEdition('general'); return t; };
        const nf = txt({}), fd = txt({ ship_found: true }), nm = txt({ ship_found: true, log_heard: true });
        assert(!/Selene|this floor/.test(nf) && /under this floor/.test(fd) && !/Selene/.test(fd) && /Selene grew them/.test(nm) && !/the ship/i.test(nm), 'RS1 (RS-N): "the ship" before the log, Selene after, neither before the ship is found');
        assert(!nf.includes(R.READ.lover.trim()) && txt({ ya_romance: true }).endsWith(R.READ.lover.trim()), 'RS1: the lover\'s sentence only when she is his lover, last');
        for (const t of [nf, fd, nm, txt({ ya_romance: true })]) { const n = t.split(/\s+/).length; assert(n >= 200 && n <= 360 && !/\{|\}/.test(t) && !/Ents|Treebeard|Lord of the Rings|Entwives/.test(t), `RS1 (EK): the general edition fills every slot and names nothing (${n} words)`); }
        assert(/the Ents/.test(txt({}, 'named')) && /Treebeard/.test(txt({}, 'named')), 'RS1 (ET): the named edition names them');
        // RS-M: the camp shows no music line while the reading is open; the reading uses up the day
        { const g = camp(79020, 20); linesOf(g).at = 'heart_camp'; assert(M.musicLine(g, { id: 'heart_camp', text: 'x' }) === null && !(linesOf(g).mu && linesOf(g).mu.d === textDay(g)), 'RS1 (RS-M): the camp waits while the reading is open');
          g.flags.hc_read = true; g.scene = 'heart_read'; linesOf(g).at = 'heart_read'; linesOf(g).cur = {}; assert(M.musicLine(g, { id: 'heart_read', text: 'x' }) === null, 'RS1 (RS-M): no line under the reading');
          g.scene = 'heart_night'; linesOf(g).at = 'heart_night'; linesOf(g).cur = {}; assert(M.musicLine(g, { id: 'heart_night', text: 'x' }) === null, 'RS1 (RS-M): and none after it that day'); }
        { const g = camp(79021, 20, { hc_read: true }); linesOf(g).at = 'heart_camp'; assert(M.musicLine(g, { id: 'heart_camp', text: 'x' }) !== null, 'RS1 (RS-M): once read, the camp has its line on later days'); }
    }
}

// v0.11.184 (owner picks N1, S1, D1; group e's #95 and the Day 2 morning): memory lines of their own (js/story/remember.js,
// remember_texts.js, Fable's with Claude's cuts). KP the Day 2 morning's second paragraph from the second Coil; ML the scene's own
// line above a fold (the morning's, the talks' beats 0, 1, 3, 4), the general pool for everything else; the same line on a redraw.
{
    const RM = await import('../js/story/remember.js'); const RT = await import('../js/story/remember_texts.js');
    const PINS_RM = [['talk_mei', 0, /a fourth/, /Three, then/], ['talk_mei', 1, /\bstem\b/, /\bstem\b/], ['talk_mei', 3, /question/, /twenty-six/], ['talk_mei', 4, /\bbird\b/, /a bird fell/],
        ['talk_ya', 0, /inspection/, /boots to hair/], ['talk_ya', 1, /to her it is/, /wolf den/], ['talk_ya', 3, /definition/, /\*improper\*/i], ['talk_ya', 4, /count/, /I count/]];
    // RV1 (TG2): the day record faked for one key only, so a line or text reading another talk's record fails
    const onDayR = (g, k, key) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: { [key]: days } }; return g; };
    const at = (seed, id, coil, flags = {}) => { const g = ensureBars(fresh(seed)); g.coil.n = coil; Object.assign(g.flags, flags); g.scene = id; return g; };
    // a scene shown on Coil `coil`, its text read on Coil `readOn` (or never): the view and the fold
    const folded = (g, readOn) => { const v = sceneView(g, SCENES); if (readOn) { g.seen = { ...(g.seen || {}), [g.scene]: 1 }; noteRead(g, v.text, readOn); } return { v, a: againView(g, v, null) }; };
    const NOTHING = /you know nothing about this world/;
    // KP: the morning's paragraph by Coil; Day 3 untouched
    { const m1 = sceneView(at(84001, 'morning', 1, { forest_day: 2 }), SCENES).text, m2 = sceneView(at(84002, 'morning', 2, { forest_day: 2 }), SCENES).text;
      assert(NOTHING.test(m1) && !m1.includes(RT.MORNING_AGAIN), 'S1 (KP): the first Coil keeps "you know nothing"');
      assert(!NOTHING.test(m2) && m2.endsWith(RT.MORNING_AGAIN) && m2.split(/\n\s*\n/).length === 2 && m2.split(/\n\s*\n/)[0] === m1.split(/\n\s*\n/)[0], 'S1 (KP): from the second Coil the new paragraph replaces it, the first unchanged');
      const d3a = sceneView(at(84003, 'morning', 1, { forest_day: 3 }), SCENES).text, d3b = sceneView(at(84003, 'morning', 4, { forest_day: 3 }), SCENES).text;
      assert(d3a === d3b && !d3a.includes(RT.MORNING_AGAIN), 'S1 (KP): Day 3 reads the same on every Coil'); }
    // ML: the morning folds under its own line once its new text was read; Day 3 under the pool's
    { const { a } = folded(at(84010, 'morning', 3, { forest_day: 2 }), 2);
      assert(a.fold && a.memory === RT.SCENE_MEMORY_LINES.morning, 'S1 (ML): the Day 2 morning folds under its own line');
      const a1 = (() => { const g = at(84011, 'morning', 2, { forest_day: 2 }); g.seen = { ...(g.seen || {}), morning: 1 }; noteRead(g, sceneView(at(84013, 'morning', 1, { forest_day: 2 }), SCENES).text, 1); return againView(g, sceneView(g, SCENES), null); })(); // Coil 1's text read on Coil 1
      assert(!a1.fold && a1.memory === null, 'S1 (KP): on the second Coil the new paragraph shows the morning in full once (it was never read)');
      const { a: a3 } = folded(at(84012, 'morning', 3, { forest_day: 3 }), 1);
      assert(a3.fold && MEMORY_LINES.includes(a3.memory), 'S1 (ML): Day 3 keeps the general pool'); }
    // ML: the talks, by beat (the counter and the day's index both), the settled text under the pool's
    let nT = 0;
    for (const [id, flag] of [['talk_mei', 'mei_talks'], ['talk_ya', 'ya_talks']]) {
        for (const k of [0, 1, 2, 3, 4, 5, 7]) {
            for (const how of ['count', 'day']) {
                const g = at(84100 + nT, id, 3, { [flag]: how === 'count' ? k : 0, ya_party: true }); if (how === 'day') onDayR(g, k, id);
                assert(RM.talkBeat(g, flag, id) === k, `S1: ${id} beat ${k} by ${how}`);
                const { a } = folded(g, 2), own = RT.SCENE_MEMORY_LINES[id][k];
                assert(a.fold, `S1: ${id} beat ${k} (${how}) read on an earlier Coil folds`);
                if (own) assert(a.memory === own && linesOf(g).cur.mem === undefined && !Object.keys(linesOf(g).p || {}).some((x) => /mem/.test(x)), `S1 (ML, RV1 TG5): ${id} beat ${k} (${how}) folds under its own line, the pool not drawn`);
                else assert(MEMORY_LINES.includes(a.memory), `S1 (ML): ${id} beat ${k} (${how}), the settled text, keeps the pool (${a.memory})`);
                const again = againView(g, sceneView(g, SCENES), null); assert(again.memory === a.memory, `S1 (ML): ${id} beat ${k}: the same line on a redraw`);
                nT++;
            }
        }
        // the text itself follows the same beat as the line (talkBeat drives both)
        const t = (k) => sceneView(at(84300 + k, id, 1, { [flag]: k }), SCENES).text;
        assert(new Set([0, 1, 2, 3, 4].map(t)).size === 5 && t(2) === t(5), `S1: ${id}'s five texts by beat, the settled text at 2 and 5`);
        // not read before: no fold, no line
        const { a } = folded(at(84400, id, 2, { [flag]: 1 }), 0);
        assert(!a.fold && a.memory === null, `S1: ${id} heard for the first time shows in full`);
    }
    assert(nT === 28, `S1: ${nT} beat × way checks`);
    // RV1 (TG2): the other talk's record moves neither the text nor the line
    for (const [id, other, flag] of [['talk_mei', 'talk_ya', 'mei_talks'], ['talk_ya', 'talk_mei', 'ya_talks']]) {
        const g = onDayR(at(84600, id, 3, { ya_party: true }), 3, other);
        assert(RM.talkBeat(g, flag, id) === 0 && sceneView(g, SCENES).text === sceneView(at(84601, id, 1, { ya_party: true }), SCENES).text, `S1 (RV1 TG2): ${id} ignores ${other}'s days`);
        const { a } = folded(g, 2); assert(a.memory === RT.SCENE_MEMORY_LINES[id][0], `S1 (RV1 TG2): ${id}'s line ignores ${other}'s days`);
    }
    // RV1 (TG2): a real walk: Mei Lin on two days, Ya first on the third (goTo notes the days as play does)
    { const g = at(84610, 'rr_hub', 3, { ya_party: true }); const ref = (id, k) => sceneView(at(84611 + k, id, 1, { ya_party: true, [id === 'talk_mei' ? 'mei_talks' : 'ya_talks']: k }), SCENES).text;
      goTo(g, SCENES, 'talk_mei'); const t1 = sceneView(g, SCENES).text; g.minutes += 24 * 60;
      goTo(g, SCENES, 'talk_mei'); const t2 = sceneView(g, SCENES).text, m2 = RM.sceneMemory(g, 'talk_mei'); g.minutes += 24 * 60;
      goTo(g, SCENES, 'talk_ya'); const ty = sceneView(g, SCENES).text, my = RM.sceneMemory(g, 'talk_ya');
      assert(t1 === ref('talk_mei', 0) && t2 === ref('talk_mei', 1) && m2 === RT.SCENE_MEMORY_LINES.talk_mei[1], 'S1 (RV1 TG2): Mei Lin\'s first two days walk beats 0 and 1, the line with them');
      assert(ty === ref('talk_ya', 0) && my === RT.SCENE_MEMORY_LINES.talk_ya[0], 'S1 (RV1 TG2): Ya first on the third day starts at her beat 0, the line with it'); }
    // RV1 (TG3): each line pinned to its own beat's text (a word in the line, a word in the beat)
    for (const [id, k, inLine, inBeat] of PINS_RM) {
        const t = sceneView(at(84700 + k, id, 1, { ya_party: true, [id === 'talk_mei' ? 'mei_talks' : 'ya_talks']: k }), SCENES).text;
        assert(inLine.test(RT.SCENE_MEMORY_LINES[id][k]) && inBeat.test(t), `S1 (RV1 TG3): ${id} beat ${k}'s line points at its own beat (${inLine} ↔ ${inBeat})`);
    }
    assert(PINS_RM.length === 8, 'S1 (RV1 TG3): every line pinned');
    // the pool untouched; every new line its own; none in the pool; no other scene has one
    const own = [RT.SCENE_MEMORY_LINES.morning, ...Object.values(RT.SCENE_MEMORY_LINES.talk_mei), ...Object.values(RT.SCENE_MEMORY_LINES.talk_ya)];
    assert(own.length === 9 && new Set(own).size === 9 && own.every((l) => !MEMORY_LINES.includes(l) && l.split(/\s+/).length <= 25), 'S1 (ML): nine lines, distinct, none from the pool, each under 25 words');
    assert(MEMORY_LINES.length === 48, `S1: the general pool unchanged (${MEMORY_LINES.length})`);
    assert(RM.sceneMemory(at(84500, 'wilds', 3), 'wilds') === null && RM.sceneMemory(at(84501, 'morning', 3, { forest_day: 4 }), 'morning') === null, 'S1: other scenes and days have none');
    const words = RT.MORNING_AGAIN.split(/\s+/).length; assert(words >= 45 && words <= 70 && !/Ashfall|cage|village|tribute|seventh|Day \d|\bonce\b|twice|times|every version/i.test(RT.MORNING_AGAIN) && !/^So the data/m.test(RT.MORNING_AGAIN), `S1 (KP, C1): the paragraph claims nothing a Coil may not have shown (${words} words)`);
}

// v0.11.185 (owner picks BR1, D1; group e's breakthroughs under a roof): Act 1's Ashfall saw it (AW1 Foundation's own witness
// block, AW2 the village's closer for realms 2+, but not where no sky came); inside the Old Tree a frame line first and the
// Foundation bolt in dead bark (HF); everywhere else unchanged; `sky_witness` still the prologue village's only.
{
    const P = await import('../js/story/prologue.js');
    const { runMed } = await import('../js/core/meditate.js');
    const D = 1440, VC = /^Ashfall watches it go in total silence\./, OWN = [10, 11, 12, 14]; // RV1 (L2): 12 and 14 keep their own closers
    const DAY = { fo_ashfall: 9, rt_ashfall: 20, heart_hub: 16, ashfall: 3, village: 3 }; // RV1 (TG4): the places' own days, Mei Lin known as in Act 1
    const bt = (back, realm, hh, seed = 85000) => { const g = ensureBars(newGame(seed + realm)); g.flags.bt_return = back; g.james.realm = realm; g.rel['Mei Lin'] = 20; g.minutes = (DAY[back] || 12) * D + hh * 60; return SCENES.breakthrough.text(g); };
    for (const back of P.BT_ASHFALL_A1) for (const hh of [10, 23]) {
        const t = bt(back, 1, hh);
        assert(t.includes(`\n\n${P.BT_A1_WITNESS}\n\n*Foundation.*`) && /fizzles out in the dust/.test(t) && !/Nobody saw it|Not in the history of the mountain|Crimson Lotus/.test(t) && !t.startsWith(P.BT_TREE_FRAME), `BR1 (AW1): Foundation at ${back} ${hh}:00 has Ashfall's own witness block, in the dust`);
        for (let r = 2; r <= 14; r++) {
            const last = bt(back, r, hh).split('\n\n').at(-1), out = bt('rr_hub', r, hh).split('\n\n').at(-1);
            assert(OWN.includes(r) ? last === out : VC.test(last), `BR1 (AW2): realm ${r} at ${back} ${hh}:00: ${OWN.includes(r) ? 'its own closer (no sky came, or its text ends in silence or holding clouds)' : 'the village\'s closer'}`);
            assert(!/Off in the dark|Out in the dark|Nothing in the dark/.test(last) || OWN.includes(r), `BR1 (AW2): realm ${r} at ${back} ${hh}:00: no dark beyond the camp`);
        }
    }
    for (let r = 1; r <= 14; r++) for (const hh of [10, 23]) {
        const t = bt('heart_hub', r, hh), out = bt('rr_hub', r, hh);
        const rest = t.slice(P.BT_TREE_FRAME.length + 2);
        assert(t.startsWith(`${P.BT_TREE_FRAME}\n\n`) && (r === 1 ? rest === out.replace('fizzles out in the moss', 'fizzles out in the dead bark') : rest === out), `BR1 (HF): realm ${r} in the Old Tree ${hh}:00: the frame first, then the outdoor text${r === 1 ? ' (the bolt in dead bark)' : ''}`);
        for (const back of ['stream', 'camp', 'rr_hub', 'ah_hub', 'dw_hub', 'rt_camp', 'lf_hub']) { const o = bt(back, r, hh); assert(!o.startsWith(P.BT_TREE_FRAME) && !o.includes(P.BT_A1_WITNESS) && !(r > 1 && VC.test(o.split('\n\n').at(-1))) && (r > 1 || (back === 'ah_hub' ? /in the ash with/ : /in the moss/).test(o)), `BR1: realm ${r} at ${back} ${hh}:00 unchanged (v0.11.188, N1 RV1 L4: the Ashen Hills' bolt in the ash)`); }
    }
    assert(/Not in the history of the mountain/.test(bt('village', 1, 10)) && !bt('village', 1, 10).includes(P.BT_A1_WITNESS), 'BR1: the prologue village keeps its own witness block');
    // the real path: the Meditate card's breakthrough at each place; `sky_witness` only from the prologue's village
    for (const [hub, wit, frame, sw] of [['fo_ashfall', true, false, undefined], ['rt_ashfall', true, false, undefined], ['heart_hub', false, true, undefined], ['ashfall', false, false, 1]]) {
        const g = ensureBars(newGame(85100)); g.scene = hub; g.james.saturation = 96; g.rel['Mei Lin'] = 20; g.minutes = DAY[hub] * D + 10 * 60;
        runMed(g, SCENES, 'med:bt'); const t = g.scene === 'breakthrough' ? sceneView(g, SCENES).text : '';
        assert(g.james.realm === 1 && t.includes(P.BT_A1_WITNESS) === wit && t.startsWith(P.BT_TREE_FRAME) === frame && g.flags.sky_witness === sw && !!g.flags.a1_sky_seen === wit, `BR1: the Meditate card's breakthrough at ${hub} (witness ${wit}, frame ${frame}, sky_witness ${sw}, a1_sky_seen ${wit})`);
    }
    // RV1 (M2): the Return's street reads a1_sky_seen as it reads sky_witness; the GU check reads sky_witness only; the flag resets with the Coil
    {
        const street = (flags) => { const g = ensureBars(newGame(85150)); Object.assign(g.flags, { ending: 'fought', ya_met: true, ya_party: true }, flags); g.minutes = 20 * D + 9 * 60; goTo(g, SCENES, 'rt_arrive'); return sceneView(g, SCENES).text; };
        const weather = /as they did once the sky had come for you and left again: as weather/, sum = /like a sum that has stopped adding up/;
        const none = street({}), a1 = street({ a1_sky_seen: true }), pro = street({ sky_witness: 1 });
        assert(sum.test(none) && !weather.test(none) && weather.test(a1) && !sum.test(a1) && weather.test(pro), 'BR1 (RV1, M2): the Return\'s street saw the sky with a1_sky_seen, as with sky_witness');
        const ret = readFileSync(new URL('../js/story/act1_return.js', import.meta.url), 'utf8'), coil = readFileSync(new URL('../js/core/coil.js', import.meta.url), 'utf8');
        // v0.11.190 (N1, SW): the parley's GU check reads it too (+1, as sky_witness); still in no other check, not kept across the Coil
        assert((ret.match(/a1_sky_seen/g) || []).length === 4 && ret.split('\n').filter((l) => /a1_sky_seen/.test(l) && /check|bonus|dc:/.test(l)).length === 1 && /check: \{ skill: 'GU', dc: 9, band: 'major', bonus: .*\(g\.flags\.sky_witness \|\| g\.flags\.a1_sky_seen \? 1 : 0\)/.test(ret) && !/a1_sky_seen/.test(coil), 'BR1 (RV1, M2; N1 SW): a1_sky_seen read by text only (the street; v0.11.188 N1 RV1 M4: rt_wen, rt_elder), in no check, not kept across the Coil');
    }
    // RV1 (TG1): Claude's cuts pinned (C1, C2, C3, and L1's "go up"); (TG2) the old text unchanged where nothing changed: renders hashed against v0.11.184
    assert(/They got as far as one, and it missed\./.test(P.BT_A1_WITNESS) && /A hunter bows to you, gravely, as one signs for a delivery nobody ordered\./.test(P.BT_A1_WITNESS) && !/like a man|\bnone\b/.test(P.BT_A1_WITNESS), 'BR1 (RV1, TG1): C1 and C2 as cut');
    assert(/^Not in here\. .* You go up the widest crack to where it opens on the sky, and find a level place on the lip\.$/.test(P.BT_TREE_FRAME) && !/crown|bough|climb/i.test(P.BT_TREE_FRAME), 'BR1 (RV1, TG1, L1): C3 and "go up" as cut (James flies from Foundation)');
    {
        const PIN_BT = [['stream', 1, 10, '81ef0e1c8a433e91'], ['camp', 1, 23, '1c2b702fa53d56e2'], ['village', 1, 10, 'dcf6caab493838f2'], ['village', 1, 22, 'ff5136872a9add43'], ['rr_hub', 2, 23, 'da992b67610dfde9'], ['ah_hub', 2, 10, '02f8ae1f5859205d'], ['ashfall', 3, 10, '48c49ed71ec38639'], ['dw_hub', 13, 23, '8739ed4b9081d57b']];
        for (const [back, realm, hh, h] of PIN_BT) {
            const g = ensureBars(newGame(85200 + realm)); g.flags.bt_return = back; g.james.realm = realm; g.minutes = 9 * D + hh * 60; g.rel['Mei Lin'] = 20;
            // v0.11.195 (F1, D1: BT, S3): the two swaps undone first, so the pin still shows nothing else moved
            const was = SCENES.breakthrough.text(g).replace(BT_CLOSER_195, '*Foundation.* Mortal Vessel no longer: the rung where this world\'s sect disciples stand, and you came by it without a pill. You feel heavier, and steadier, and precisely as sarcastic as before.').replace('\nIt goes on looking.\n', '\nIt looks for a long time.\n');
            assert(createHash('sha256').update(was).digest('hex').slice(0, 16) === h, `BR1 (RV1, TG2): realm ${realm} at ${back} ${hh}:00 renders as in v0.11.184 (v0.11.195's BT and S3 aside)`);
        }
    }
    const w = P.BT_A1_WITNESS.split(/\s+/).length, f = P.BT_TREE_FRAME.split(/\s+/).length;
    assert(w >= 90 && w <= 160 && !/Mei Lin|\bYa\b|mother|Gao|Pock|morning|night|tonight|today|evening|dawn|dusk|noon|\bsun\b|palisade|tribute/i.test(P.BT_A1_WITNESS), `BR1 (AW1, RV1 M1): ${w} words, no one whose state varies (Pock-Face is Gao's lackey), no time words, no tribute ending or palisade`);
    assert(f <= 40 && !/You sit|\bsit\b|lightning|cloud|storm/i.test(P.BT_TREE_FRAME), `BR1 (HF): ${f} words; ends before "You sit" and promises no sky (realms 10, 11)`);
}

// v0.11.188 (owner picks N1, D1, E1; group e): lines that assumed witnesses nobody had. TR: Foundation with Mei Lin and Ya there
// (party flags; not a village) has their block, not "Nobody saw it except the trees"; L7: the first morning's work-chant has the
// hymn in it when the hymn played this Coil and this story day; LL: the lost letter without a tribulation seen; EN: the thirteen
// days' "refuses tribulation" only with one seen.
{
    const P = await import('../js/story/prologue.js');
    const F = await import('../js/story/act1_fallout.js');
    const M = await import('../js/story/music.js');
    const D = 1440, TREES = /Nobody saw it except the trees/;
    const bt = (back, realm, hh, party = true) => { const g = ensureBars(newGame(88000 + realm)); g.flags.bt_return = back; g.james.realm = realm; g.rel['Mei Lin'] = 20; g.minutes = 12 * D + hh * 60; if (party) { g.flags.mei_party = true; g.flags.ya_party = true; } return SCENES.breakthrough.text(g); };
    for (const back of ['rr_hub', 'ah_hub', 'dw_hub', 'rt_camp', 'camp']) for (const [hh, k] of [[10, 'day'], [23, 'night'], [5, 'night'], [20, 'night']]) {
        const t = bt(back, 1, hh);
        const ash = back === 'ah_hub', kk = back === 'rt_camp' && hh === 20 ? 'night' : k, blk = ash ? P.BT_PARTY[kk].replace('scorched moss', 'scorched ash') : P.BT_PARTY[kk];
        assert(t.includes(`\n\n${blk}\n\n*Foundation.*`) && !TREES.test(t) && (ash ? /fizzles out in the ash/ : /fizzles out in the moss/).test(t) && !/moss/.test(ash ? t : '') && !t.startsWith(P.BT_TREE_FRAME), `N1 (TR; RV1 L4): Foundation at ${back} ${hh}:00 with the party: their ${kk} block, the bolt in the ${ash ? 'ash' : 'moss'}`);
        assert(TREES.test(bt(back, 1, hh, false)), `N1 (TR): Foundation at ${back} ${hh}:00 alone keeps the trees line`);
        for (const r of [2, 5, 10, 13]) assert(bt(back, r, hh) === `${bt(back, r, hh, false)}\n\n${P.BT_LATE[back === 'heart_hub' ? 'T' : 'P'][P.btStep(r)]}`, `N1 (TR); v0.11.189 (P1, PL): realm ${r} at ${back} ${hh}:00: the party's line after Yuki's`);
    }
    for (const hh of [10, 23]) {
        const t = bt('heart_hub', 1, hh);
        assert(t.startsWith(`${P.BT_TREE_FRAME}\n\n`) && t.includes(`\n\n${P.BT_PARTY.tree}\n\n*Foundation.*`) && /fizzles out in the dead bark/.test(t) && !TREES.test(t), `N1 (TR): Foundation in the Old Tree ${hh}:00 with the party: the frame, their block, the bolt in dead bark`);
    }
    for (const back of ['fo_ashfall', 'rt_ashfall']) assert(bt(back, 1, 10).includes(P.BT_A1_WITNESS) && !Object.values(P.BT_PARTY).some((x) => bt(back, 1, 10).includes(x)), `N1 (TR): at ${back} Ashfall's own witness block comes first`);
    for (const back of ['village', 'ashfall']) assert(/Not in the history of the mountain/.test(bt(back, 1, 10)) && !Object.values(P.BT_PARTY).some((x) => bt(back, 1, 10).includes(x)), `N1 (TR): the prologue's ${back} keeps its own block`);
    for (const [k, x] of Object.entries(P.BT_PARTY)) {
        const w = x.split(/\s+/).length;
        assert(w >= 50 && w <= 100 && /Mei Lin/.test(x) && /\bYa\b/.test(x) && /you say\.$/.test(x) && !/Ashfall|bow|butt of her spear|Mei Lin looks at the/i.test(x), `N1 (TR, C2 C3): the ${k} block: ${w} words, both women, James's line last, not villagers, the cuts kept`);
        assert(k === 'tree' ? /dead bark/.test(x) && !/night|morning|evening|dawn|dusk|\bsun\b/i.test(x) : /scorched moss/.test(x), `N1 (TR): the ${k} block's ground${k === 'tree' ? ', no time words' : ''}`);
    }
    assert(/^A few steps off,/.test(P.BT_PARTY.night) && !/fire/.test(P.BT_PARTY.night), 'N1 (TR, C1): no fire assumed at night');
    // L7: the real path; the hymn's record is read only on the same Coil and story day
    const fo = (hymn, hh = 8, seed = 88100) => {
        const g = ensureBars(fresh(seed)); startActCoil(g, 1); Object.assign(g.flags, { ending: 'fought', ya_met: true });
        g.flags.songs = ''; g.minutes = 7 * D + 7 * 60; goTo(g, SCENES, 'fo_elder_named');
        if (hymn) { const r = M.musicLine(g, sceneView(g, SCENES)); assert(r && r.key === 'song.hammerdeep', 'N1 (L7): the hymn plays at fo_elder_named'); }
        g.minutes = 7 * D + hh * 60; goTo(g, SCENES, 'fo_ashfall'); return g;
    };
    const OLD7 = /^Morning\. Axes, hammers, and a work-chant kept going so that nobody has to think\./;
    { const g = fo(true); const t = sceneView(g, SCENES).text; assert(t.startsWith(`${F.HYMN_MORNING} `) && !OLD7.test(t) && F.hymnToday(g), 'N1 (L7): Day 8 morning after the hymn: the work-chant keeps its beat'); }
    { const g = fo(false); assert(OLD7.test(sceneView(g, SCENES).text) && !F.hymnToday(g), 'N1 (L7): no hymn heard this Coil: the old line'); }
    { const g = fo(true, 12); assert(!/dwarves' song/.test(sceneView(g, SCENES).text), 'N1 (L7): the midday line unchanged'); }
    { const g = fo(true); g.minutes = 8 * D + 8 * 60; assert(!F.hymnToday(g) && !/dwarves' song/.test(sceneView(g, SCENES).text), 'N1 (L7): the next day, not'); }
    { const g = fo(true); g.coil = { ...g.coil, n: (g.coil.n || 1) + 1 }; g.minutes = 7 * D + 8 * 60; assert(!F.hymnToday(g) && OLD7.test(sceneView(g, SCENES).text), 'N1 (L7): a later Coil (the record is per Coil): the old line'); }
    { const g = fo(true); delete g.lines; assert(!F.hymnToday(g), 'N1 (L7): no record, no hymn'); }
    assert(/^Morning\. /.test(F.HYMN_MORNING) && F.HYMN_MORNING.split(/\s+/).length <= 40 && !/Hammerdeep|Clamavi|\{ref/.test(F.HYMN_MORNING), 'N1 (L7): one short morning line, no song or singer named');
    // LL and EN: by sky_witness
    const scr = (id, ending, sw) => { const g = ensureBars(fresh(88200)); startActCoil(g, 1); Object.assign(g.flags, { ending, ya_met: true }); if (sw) g.flags.sky_witness = sw; g.minutes = 7 * D + 7 * 60; goTo(g, SCENES, id); return sceneView(g, SCENES).text; };
    const unseen = scr('fo_letter', 'lost'), seen = scr('fo_letter', 'lost', 1);
    assert(unseen.includes('report of inner disciple Lu Han') && !/tribulation|the sky|Heaven|sense him|feel him|cannot feel|could not sense|cannot sense|root in him|empty chair/i.test(unseen) && /to collect the Bone-Maker with his own hands/.test(unseen) && /the boards at your feet/.test(unseen) && !/floor in front of/.test(unseen), 'N1 (LL, C4): the lost letter with no tribulation seen: Lu Han\'s report, no sky, the reveal kept for later');
    assert(/gathered tribulation over a stranger/.test(seen) && !seen.includes('Lu Han'), 'N1 (LL): with a tribulation seen, the old letter');
    assert(/lifted its hand against the Sect/.test(scr('fo_letter', 'fought')) && /lifted its hand against the Sect/.test(scr('fo_letter', 'fought', 1)), 'N1 (LL): the fought letter unchanged either way');
    for (const e of ['fought', 'lost', 'bluff', 'paid']) {
        const a = scr('fo_elder_named', e), b = scr('fo_elder_named', e, 1);
        assert((e === 'bluff' ? /A senior of a mountain no one can name, who sings bone out of the air, and to a cultivator's senses he is an empty chair\./ : /A man of no sect and no master, who sings bone out of the air/).test(a) && !/tribulation/.test(a) && /A man who refuses tribulation and sings bone out of the air/.test(b), `N1 (EN, E1; RV1 M2, L6, TG3): the thirteen days (${e}): "refuses tribulation" only with one seen; the bluff's own clause`);
    }
    // v0.11.188 (owner picks RV1, DB1; the Opus review's M1–M4, L1–L8, TG1–TG10)
    const BR = await import('../js/story/act1_blackroot.js');
    const R = await import('../js/story/act1_return.js');
    const btw = (back, hh, flags) => { const g = ensureBars(newGame(88300)); Object.assign(g.flags, { bt_return: back, mei_party: true, ya_party: true }, flags); g.james.realm = 1; g.rel['Mei Lin'] = 20; g.minutes = 14 * D + hh * 60; return SCENES.breakthrough.text(g); };
    // TG1 (M1): Ya away at the Ashen Hills: Mei Lin's own block; both away for water: the trees line; Ya away elsewhere: no matter
    for (const [hh, k] of [[10, 'day'], [23, 'night']]) {
        const t = btw('ah_hub', hh, { bl_day: 4 });
        assert(t.includes(`\n\n${P.BT_MEI[k]}\n\n*Foundation.*`) && !Object.values(P.BT_PARTY).some((x) => t.includes(x.slice(0, 40))) && /fizzles out in the ash/.test(t), `N1 (RV1 M1, TG1): Ya away at the Ashen Hills ${hh}:00: Mei Lin's ${k} block, the ash`);
        assert(btw('ah_hub', hh, { bl_day: 4, ya_off_done: true }).includes(P.BT_PARTY[k].replace('scorched moss', 'scorched ash')), `N1 (RV1 M1): Ya back (ya_off_done) ${hh}:00: the party's block`);
        const g = ensureBars(newGame(88301)); Object.assign(g.flags, { bt_return: 'ah_hub', mei_party: true, ya_party: true, bl_day: 2, trio: 2 }); g.rel['Mei Lin'] = { f: 90, a: 90 }; g.rel['Ya'] = { f: 90, a: 90 }; g.james.realm = 1; g.minutes = 14 * D + hh * 60;
        assert(BR.bothAway(g), 'N1 (TG1): the water state set up'); { const w = SCENES.breakthrough.text(g); assert(TREES.test(w) && !w.includes(P.BT_MEI[k]), `N1 (RV1 M1, TG1): both away for water ${hh}:00: the trees line`); }
        assert(btw('dw_hub', hh, { bl_day: 6 }).includes(P.BT_PARTY[k]), `N1 (RV1 M1): Ya's door is the Ashen Hills' only: at dw_hub ${hh}:00 the party's block`);
    }
    { const g = ensureBars(newGame(88302)); g.flags.bl_day = 4; assert(BR.yaAway(g) && !BR.yaAway(Object.assign(g, { flags: { ...g.flags, ya_off_done: true } })), 'N1 (RV1 M1): yaAway is the door\'s state'); }
    assert(BR.BLACKROOT.ah_hub.choices.some((c) => c.to === 'ya_offended' && /yaAway\(g\) && !late\(g\)/.test(String(c.show))) && BR.BLACKROOT.ah_hub.choices.some((c) => c.to === 'trio_kiss' && /bothAway\(g\) && !late\(g\)/.test(String(c.show))), 'N1 (RV1 M1): the doors read the same states');
    for (const [k, x] of Object.entries(P.BT_MEI)) {
        const w = x.split(/\s+/).length;
        assert(w >= 40 && w <= 90 && /Mei Lin/.test(x) && /\bYa\b/.test(x) && /laugh/.test(x) && (k === 'day' || /\bash\b/.test(x)) && !/moss|Ya (prods|crouches|hauls)/.test(x) && /you say\./.test(x.split('\n\n').at(-1)), `N1 (RV1 M1, TG4): Mei Lin's ${k} block: ${w} words, she laughs, Ya only named, the ash, James last`);
    }
    // TG5: time words by block; L7: the Return's camp is night from 19:00
    const NIGHTW = /\b(night\w*|dark\w*|star\w*|moon\w*|lamp\w*)/i, DAYW = /\b(sun\w*|noon\w*|morning|daylight|dawn|afternoon)/i; // TG5 (F8: "starlight")
    for (const B of [P.BT_PARTY, P.BT_MEI]) { assert(!DAYW.test(B.night) && !NIGHTW.test(B.day), 'N1 (TG5): no day word at night, no night word by day'); }
    assert(!NIGHTW.test(P.BT_PARTY.tree) && !DAYW.test(P.BT_PARTY.tree), 'N1 (TG5): no time word in the Old Tree');
    assert(btw('rt_camp', 19, {}).includes(P.BT_PARTY.night) && btw('rt_camp', 18, {}).includes(P.BT_PARTY.day) && btw('rr_hub', 19, {}).includes(P.BT_PARTY.day), 'N1 (RV1 L7): the Return\'s camp is night from 19:00, the roads at 20:00');
    // TG4: the tone words pinned; the cuts kept (L3, L5)
    assert(/scholar/.test(P.BT_PARTY.night) && /scholar/.test(P.BT_PARTY.day) && /laughs/.test(P.BT_PARTY.day) && /grins/.test(P.BT_PARTY.night) && /the strike that never came/.test(P.BT_PARTY.day) && !/flash that never arrived|as evidence/.test(P.BT_PARTY.day + P.BT_PARTY.tree), 'N1 (TG4; RV1 L3, L5): Ya\'s "scholar", Mei Lin\'s laugh, the cuts');
    assert(/gravely and wrong/.test(F.HYMN_MORNING), 'N1 (TG4): the hunters hum it gravely');
    // TG2 (M3): an Act 1 that starts on Day 9 has the hymn on its first morning
    { const g = ensureBars(fresh(88310)); startActCoil(g, 1); Object.assign(g.flags, { ending: 'fought', ya_met: true, songs: '' }); g.minutes = 8 * D + 7 * 60; goTo(g, SCENES, 'fo_elder_named'); M.musicLine(g, sceneView(g, SCENES)); g.minutes = 8 * D + 9 * 60; goTo(g, SCENES, 'fo_ashfall');
      assert(sceneView(g, SCENES).text.startsWith(`${F.HYMN_MORNING} `), 'N1 (RV1 M3, TG2): Day 9\'s first morning after the hymn'); }
    // TG8: another song's record the same day is not the hymn
    { const g = fo(false); linesOf(g).sg = { d: textDay(g), song: 'genesis', at: 'fo_depart' }; assert(!F.hymnToday(g), 'N1 (TG8): another song the same day is not the hymn'); linesOf(g).sg.song = 'hammerdeep'; assert(F.hymnToday(g), 'N1 (TG8): the hymn\'s key'); }
    // TG6, TG7, L1, L2: the lost letter
    assert(/on the twenty-first day, to collect the Bone-Maker/.test(unseen) && /The Sect does not send an Elder to carry what a disciple could drag/.test(unseen) && /and that the disciple cannot account for it/.test(unseen) && !/nowhere in the room fit/.test(unseen), 'N1 (TG6, TG7, TG4; RV1 L1, L2): Day 21, Old Hu\'s line, "the disciple", the clause cut');
    assert(/in the days of the tribute the sky above Ashfall/.test(seen) && !/on the day of the tribute/.test(seen), 'N1 (RV1 L8): the old letter: in the days of the tribute');
    // TG10 (M4): the Return's two sky lines by sky_witness or a1_sky_seen
    const ret = (id, flags) => { const g = ensureBars(fresh(88320)); startActCoil(g, 1); Object.assign(g.flags, { ya_met: true, ya_party: true, mei_party: true }, flags); g.minutes = 19 * D + 18 * 60; goTo(g, SCENES, id); return sceneView(g, SCENES).text; };
    for (const e of ['fought', 'lost', 'bluff', 'paid']) {
        const wn = ret('rt_wen', { ending: e }), ws = ret('rt_wen', { ending: e, sky_witness: 1 }), wa = ret('rt_wen', { ending: e, a1_sky_seen: true });
        const tail = e === 'fought' ? ', and of the disciples you sent home bleeding.' : '.';
        assert(wn.includes(`He will have heard of the stranger no envoy of theirs could sense${tail}`) && !/tribulation/.test(wn) && ws.includes(`the tribulation that refused to fall${tail}`) && wa.includes('the tribulation that refused to fall'), `N1 (RV1 M4, TG10): rt_wen (${e}) by what was seen`);
        const en = ret('rt_elder', { ending: e }), es = ret('rt_elder', { ending: e, a1_sky_seen: true });
        assert(/And you are the one\. Every report that crossed my table said there was nothing in you to report\. I have lived three hundred years/.test(en) && !/the sky came for you/.test(en) && /And the sky came for you, and went away ashamed\./.test(es), `N1 (RV1 M4, TG10): rt_elder (${e}) by what was seen`);
    }
}
// v0.11.189 (owner picks P1, D1; group e): Mei Lin and Ya at realm 2+ (PL: a line of theirs after the realm's Yuki line, by step
// and place, away from a village); L5a the kitchen's take-over at 30 with her warm closers; L5b the supper's pot clause by the kitchen.
{
    const P = await import('../js/story/prologue.js');
    const F = await import('../js/story/act1_fallout.js');
    const K = await import('../js/story/kitchen.js');
    const { runMed } = await import('../js/core/meditate.js');
    const D = 1440;
    const STEPS = 'ABCDGEF';
    // the texts: 3 places × 7 steps, filled, distinct, 20–55 words, no time or ground words, no Yuki, nothing that claims an earlier one seen
    const NIGHTW = /\b(night\w*|dark\w*|stars?|starlight|starlit|moon\w*|lamp\w*|evening|dusk|fire\w*|ember\w*|torch\w*)\b/i, DAYW = /\b(sun\w*|noon\w*|morning|daylight|dawn|afternoon)\b/i;
    const all = Object.entries(P.BT_LATE).flatMap(([pl, o]) => Object.entries(o).map(([s, x]) => [pl + s, x]));
    assert(all.length === 21 && Object.values(P.BT_LATE).every((o) => Object.keys(o).join('') === STEPS) && new Set(all.map((a) => a[1])).size === 21, `P1 (PL, D1): 21 texts, steps ${STEPS} in each place (${all.length})`);
    for (const [k, x] of all) {
        const w = x.split(/\s+/).length;
        assert(w >= 20 && w <= 55 && !/@|TODO|\[|\]/.test(x) && !NIGHTW.test(x) && !DAYW.test(x) && !/\bYuki\b|\bagain\b|last time|every time|as before/i.test(x), `P1 (PL): ${k}: ${w} words, no time word, no Yuki, nothing seen before`);
        assert(k[0] === 'T' ? !/\b(moss|ash|ashes|dust|soil|mud)\b/i.test(x) : !/\b(moss|ash|ashes|dust|soil|mud|bark)\b/i.test(x), `P1 (PL; RV1 TG4): ${k}: no ground word${k[0] === 'T' ? ' but the dead bark' : ''}`);
        assert(/Mei Lin/.test(x) && (k[0] === 'M' || /\bYa\b/.test(x)), `P1 (PL): ${k} has Mei Lin${k[0] === 'M' ? '' : ' and Ya'}`);
        // RV1 (TG3): in Mei Lin's own texts Ya is named only inside speech, or as "the way Ya went"
        if (k[0] === 'M') assert(x.replace(/"[^"]*"/g, '').replace(/the way Ya went/g, '').search(/\bYa\b/) < 0, `P1 (PL; RV1 TG3): ${k}: Ya named, not there`);
        // RV1 (TG2): the Old Tree's texts climb up to him; the others never do
        assert(k[0] === 'T' ? /crack|climbs up|hauls herself|dead bark/.test(x) : !/\bcrack\b|dead bark|hollow trunk|the ledge/.test(x), `P1 (PL; RV1 TG2): ${k}: ${k[0] === 'T' ? 'they come up the tree' : 'no tree'}`);
    }
    // C1–C3 of the drafts' check and the cuts kept (pl-drafts.md: Claude's cuts)
    assert(!/laughs until she has to|Mei Lin sits on the|Mei Lin looks at the|You go up like/.test(all.map((a) => a[1]).join(' ')), 'P1 (D1): the shared runs reworded, PC in the future');
    // RV1 (TG1, TG5; M1): each step's content: A and B name their realm; E has no sky; G its one thunder or a name asked;
    // C, D, G, F: the realm is asked for or told before anyone reacts to it (nobody can sense it); F's "Immortal" after that
    const ASK = /Which (one|rung|is this)\?|What is (it|this one|this) (now|called)?\?|What are you\?|How high|Tell me\.|Say the name|Name\?|Name it|[Yy]ou (tell|give) (her|them|it)|You say it|You name it|You do\.|asks what this one is called/;
    for (const [pl, o] of Object.entries(P.BT_LATE)) {
        assert(/Core Formation/.test(o.A) && /True Core/.test(o.B), `P1 (RV1 TG1): ${pl}A says Core Formation, ${pl}B True Core`);
        assert(/(didn't|isn't|not) com(e|ing)|stopped coming|Nothing (came|arrives)/.test(o.E) && !/lightning|thunder|bolt|struck/i.test(o.E), `P1 (RV1 TG1): ${pl}E: the sky did not come`);
        for (const s of 'CDGF') { const x = o[s], m = x.search(ASK); assert(m >= 0, `P1 (RV1 TG5, M1): ${pl}${s}: the realm asked for or told`);
            assert(!/sect master|Immortal|elder/i.test(x.slice(0, m)), `P1 (RV1 TG5, M1): ${pl}${s}: no level named before it is told`); }
        assert(/Immortal/.test(o.F) && !/Golden Core|Origin Core/.test(o.C), `P1 (RV1 TG1): ${pl}F says Immortal; ${pl}C names neither of its two realms`);
    }
    assert(/neither of them can feel it/.test(P.BT_LATE.P.B), 'P1 (RV1 TG5): PB pinned: they cannot feel it');
    assert(/"It has stopped coming," you say/.test(P.BT_LATE.P.E) && /"It isn't coming," you tell her/.test(P.BT_LATE.M.E) && /"It didn't come," you tell her/.test(P.BT_LATE.T.E), 'P1 (RV1 TG1, L8): E\'s lines pinned: the sky did not come, and James says so');
    assert(/^"One thunder," Ya says/.test(P.BT_LATE.P.G) && /"One thunder\./.test(P.BT_LATE.T.G) && !/\b(two|three|four|many) thunder/i.test(Object.values(P.BT_LATE).map((o) => o.G).join(' ')), 'P1 (RV1 TG1): G\'s one thunder (realm 8 one bolt, realm 9 one mutter)');
    // the step by realm
    assert([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(P.btStep).join('') === 'ABCCDDGGEEFFF', 'P1 (PL, D1): the steps by realm');
    // the scene: by place, step, day and night
    const bt = (back, realm, hh, flags = {}, party = true) => { const g = ensureBars(newGame(89000 + realm)); Object.assign(g.flags, { bt_return: back }, party ? { mei_party: true, ya_party: true } : {}, flags); g.james.realm = realm; g.rel['Mei Lin'] = 20; g.minutes = 14 * D + hh * 60; return SCENES.breakthrough.text(g); };
    for (let r = 2; r <= 14; r++) for (const hh of [10, 23]) {
        const s = P.btStep(r);
        for (const [back, flags, pl] of [['rr_hub', {}, 'P'], ['rt_camp', {}, 'P'], ['dw_hub', { bl_day: 6 }, 'P'], ['ah_hub', { bl_day: 4 }, 'M'], ['ah_hub', { bl_day: 4, ya_off_done: true }, 'P'], ['heart_hub', {}, 'T']]) {
            const t = bt(back, r, hh, flags), alone = bt(back, r, hh, flags, false);
            assert(t === `${alone}\n\n${P.BT_LATE[pl][s]}` && !Object.values(P.BT_LATE).some((o) => Object.values(o).some((x) => alone.includes(x))), `P1 (PL): realm ${r} at ${back}${flags.ya_off_done ? ' (Ya back)' : ''} ${hh}:00: ${pl}${s} after the Yuki line; alone, none`);
        }
        for (const back of ['village', 'ashfall', 'fo_ashfall', 'rt_ashfall']) assert(!Object.values(P.BT_LATE).some((o) => Object.values(o).some((x) => bt(back, r, hh).includes(x))), `P1 (PL): realm ${r} in ${back}: the village's closers, no line of theirs`);
    }
    { // both away for water at the Ashen Hills: Yuki's line alone
        const g = ensureBars(newGame(89100)); Object.assign(g.flags, { bt_return: 'ah_hub', mei_party: true, ya_party: true, bl_day: 2, trio: 2 }); g.rel['Mei Lin'] = { f: 90, a: 90 }; g.rel['Ya'] = { f: 90, a: 90 }; g.james.realm = 4; g.minutes = 14 * D + 600;
        const t = SCENES.breakthrough.text(g); assert(t.endsWith(P.BT_REALMS[4].day) && !Object.values(P.BT_LATE).some((o) => Object.values(o).some((x) => t.includes(x))), 'P1 (PL): both away: the realm\'s Yuki line ends it');
    }
    // RV1 (TG6): one party flag alone: no line of theirs
    for (const fl of [{ mei_party: true }, { ya_party: true }]) assert(!Object.values(P.BT_LATE).some((o) => Object.values(o).some((x) => bt('rr_hub', 4, 10, fl, false).includes(x))), `P1 (RV1 TG6): ${Object.keys(fl)[0]} alone: no line of theirs`);
    // RV1 (TG9): the real path, the Meditate card at rr_hub with the party
    { const g = ensureBars(newGame(89150)); g.scene = 'rr_hub'; Object.assign(g.flags, { mei_party: true, ya_party: true, ya_met: true }); g.james.realm = 1; g.james.saturation = 96; g.rel['Mei Lin'] = 20; g.minutes = 12 * D + 10 * 60;
      runMed(g, SCENES, 'med:bt'); const t = g.scene === 'breakthrough' ? sceneView(g, SCENES).text : '';
      assert(g.james.realm === 2 && t.endsWith(`\n\n${P.BT_LATE.P.A}`), `P1 (RV1 TG9): the Meditate card's breakthrough to realm 2 at rr_hub ends on PA (${g.scene}, realm ${g.james.realm})`); }
    // RV1 (TG10): the text lint reads the 21 and the supper's two clauses as a pool
    { const src = readFileSync(new URL('../tools/textlint.mjs', import.meta.url), 'utf8'); assert(/btPlaceLines = \[[^\n]*BT_LATE[^\n]*SUPPER_POT\[2\], SUPPER_POT\[3\], \.\.\.Object\.values\(BTX\.BT_ASK_WOMEN\)\]/.test(src), 'P1 (RV1 TG10): the text lint\'s bt_place pool holds BT_LATE and SUPPER_POT 2, 3; D1 (c1): and BT_ASK_WOMEN'); }
    // L5a: the take-over at 30, with her warm closer; 25–29 the shared hearth with a LOW closer
    const MK = (seed, f) => { const g = ensureBars(fresh(seed)); g.coil.act = 1; g.minutes = 8 * D + 600; g.rel.Mother = { f, a: 0 }; goTo(g, SCENES, 'fo_ashfall'); const i = SCENES[g.scene].choices.findIndex((c) => c.to === 'mother_time'); choose(g, SCENES, i); return g; };
    for (const [f, s, lv] of [[22, 2, 'LOW'], [26, 2, 'LOW'], [27, 3, 'MID'], [40, 3, 'MID']]) {
        const g = MK(89200 + f, f), p = sceneView(g, SCENES).text.split('\n\n');
        assert(g.rel.Mother.f === f + HT_GAIN && p[1] === K.KT_UP[s] && HT_CLOSE[`mother ${lv}`].includes(p.at(-1)), `P1 (L5a): Mother ${f} + ${HT_GAIN}: stage ${s}'s paragraph, a ${lv} closer`);
    }
    // RV1 (M2, TG7): a save already handed the hearth (kitchen_seen 3) at friendship 25–29 keeps it: label, day line, return line
    for (const f of [22, 26]) {
        const g = ensureBars(fresh(89250 + f)); g.coil.act = 1; g.minutes = 8 * D + 600; g.rel.Mother = { f, a: 0 }; g.flags.kitchen_seen = 3; goTo(g, SCENES, 'fo_ashfall');
        const i = SCENES[g.scene].choices.findIndex((c) => c.to === 'mother_time');
        assert(SCENES[g.scene].choices[i].text(g) === K.KT_LABEL[3], `P1 (RV1 M2, TG7): Mother ${f}, the hearth handed over: stage 3's label`);
        choose(g, SCENES, i); const p = sceneView(g, SCENES).text.split('\n\n');
        assert(K.KT_DAY[3].includes(p[1]) && g.flags.kitchen_seen === 3, `P1 (RV1 M2, TG7): Mother ${f}: a stage 3 day line, kitchen_seen kept`);
        const r = ensureBars(fresh(89260 + f)); r.coil.act = 1; r.minutes = 19 * D + 600; r.rel.Mother = { f, a: 0 }; r.flags.kitchen_seen = 3; goTo(r, SCENES, 'rt_ashfall');
        const j = SCENES[r.scene].choices.findIndex((c) => c.to === 'mother_time'); choose(r, SCENES, j);
        assert(sceneView(r, SCENES).text.split('\n\n')[1] === K.KT_RETURN[3], `P1 (RV1 M2, TG7): Mother ${f} on the return's day: stage 3's line`);
    }
    // L5b: the supper's clause by the kitchen she has shown him this Coil
    const sup = (seed, ks) => { const g = ensureBars(fresh(seed)); startActCoil(g, 1); Object.assign(g.flags, { ending: 'fought', ya_met: true }, ks == null ? {} : { kitchen_seen: ks }); g.minutes = 8 * D + 19 * 60; goTo(g, SCENES, 'fo_supper'); return sceneView(g, SCENES).text; };
    for (const [ks, n] of [[null, 1], [1, 1], [2, 2], [3, 3]]) {
        const t = sup(89300 + (ks || 0), ks);
        assert(t.includes(`Your bowl she fills past the line, ${F.SUPPER_POT[n]}`) && Object.values(F.SUPPER_POT).filter((x) => t.includes(x)).length === 1, `P1 (L5b): kitchen_seen ${ks}: the clause of stage ${n}`);
    }
    assert(Object.values(F.SUPPER_POT).every((x) => /^informing the ladle that /.test(x) && /\.$/.test(x) && !/[{}@]/.test(x)) && new Set(Object.values(F.SUPPER_POT)).size === 3, 'P1 (L5b): three clauses, each joins the sentence and ends it');
    assert(/half her fire is given over to error now,/.test(F.SUPPER_POT[2]) && /no longer her doing/.test(F.SUPPER_POT[3]) && /supervised every grain/.test(F.SUPPER_POT[3]) && /was not seen/.test(F.SUPPER_POT[1]), 'P1 (L5b; RV1 L7, TG8): the clauses pinned');
}

// v0.11.190 (owner pick N1, D1): L9 the women at Yuki's new forms (AWAKE_WOMEN, after a breakthrough they saw: btWho); L8b the
// day's second song opens on a sentence of its own (SONG_SECOND, kept on a redraw by the `sg` record's `p`, SK1); SW the parley's
// GU check +1 with a1_sky_seen as with sky_witness
{
    const P = await import('../js/story/prologue.js');
    const M = await import('../js/story/music.js');
    const SG = await import('../js/story/songs.js');
    const { RETURN } = await import('../js/story/act1_return.js');
    const { runMed } = await import('../js/core/meditate.js');
    const D = 1440;
    const words = (x) => x.split(/\s+/).filter(Boolean).length;
    // the texts: 2 forms × 2 places, 30–60 words, no time or ground words, Yuki unnamed; Claude's cuts C1, C2 pinned
    const AWT = Object.entries(P.AWAKE_WOMEN).flatMap(([f, o]) => Object.entries(o).map(([w, x]) => [f + w, x])); // D1 (c3): and the Old Tree's T (tiger only)
    const AW = AWT.filter(([k]) => k !== 'tigerT');
    assert(AW.length === 4 && Object.values(P.AWAKE_WOMEN).every((o) => Object.keys(o).filter((k) => k !== 'T').join('') === 'PM') && new Set(AW.map((a) => a[1])).size === 4, 'N1 (L9): four texts, P and M for each form');
    { const T = P.AWAKE_WOMEN.tiger.T; // D1 (c3; Fable's): on the lip, no half-circle; Mei Lin's first line and Ya's throat line kept
      assert(AWT.length === 5 && !P.AWAKE_WOMEN.human.T && words(T) >= 50 && words(T) <= 90 && !/half-circle|walks|Yuki|\b(night|dawn|dusk|morning|evening)\b/i.test(T) && T.startsWith('Mei Lin\'s hands have gone to her herb bag, where nothing helps. "I moved her off my blanket. With one hand."') && /"Throat's too high\. I'd want the ground, a pit, and friends\." "You'd want a wider ledge," says Mei Lin, who is not looking down\.$/.test(T), `D1 (c3): the Old Tree's T, 50–90 words (${words(T)}), no half-circle, no time word, Yuki unnamed; the kept lines`); }
    for (const [k, x] of AW) assert(words(x) >= 30 && words(x) <= 60 && !/\b(night|dawn|dusk|sun|morning|evening|moss|ash|dust|bark|Yuki)\b/i.test(x) && !/[{}@`]|TODO/.test(x), `N1 (L9): ${k} 30–60 words (${words(x)}), no time, ground or Yuki`);
    assert(/"Mine would have\. I have questions\."$/.test(P.AWAKE_WOMEN.tiger.M) && !/fish|set bones/.test(P.AWAKE_WOMEN.tiger.M), 'N1 (D1 C2; RV1 L2): TM ends on her questions, no fish heads, no bone-setting');
    assert(/Mei Lin is checking: fingers, the turn of an ear, the tail\. "It's all real," she says, faintly\.$/.test(P.AWAKE_WOMEN.human.P) && !/talk|throat|counting/.test(P.AWAKE_WOMEN.human.P), 'N1 (RV1 M2, L1, L3): HP ends on "faintly", Yuki\'s own joke left to her; no throat under the collar');
    assert(/^Mei Lin starts to speak and, for once, has nothing\./.test(P.AWAKE_WOMEN.human.M) && /from wrist to ears to tail, hunting for the seam\. She finds none\.$/.test(P.AWAKE_WOMEN.human.M) && !/\bYa\b|mouth|collarbone|Badly/.test(P.AWAKE_WOMEN.human.M), 'N1 (RV1 M3, L1, L4): HM ends on Mei Lin, no Ya joke, no "mouth" before the anchor\'s');
    assert(!/\bYa\b/.test(P.AWAKE_WOMEN.tiger.M) && !/\bYa\b/.test(P.AWAKE_WOMEN.human.M), 'N1 (L9; RV1 TG4): Ya, away, is not in the M texts at all');
    // RV1 (TG4): Fable's words pinned, a few a text
    assert(/different cat/.test(P.AWAKE_WOMEN.tiger.P) && /Ya walks a slow half-circle, counting claws/.test(P.AWAKE_WOMEN.tiger.P) && /^Mei Lin's hands have gone to her herb bag/.test(P.AWAKE_WOMEN.tiger.P) && /being a healer, one step forward/.test(P.AWAKE_WOMEN.tiger.M) && /^Ya's spear comes halfway up/.test(P.AWAKE_WOMEN.human.P) && /"It sat on my foot\."/.test(P.AWAKE_WOMEN.human.P), 'N1 (RV1 TG4): Fable\'s words pinned (who does what)');
    // the scenes: from the breakthrough the women saw, the paragraph goes in before the anchor; otherwise the text as before
    const form = (id, back, flags = {}, party = true, ret) => {
        const g = ensureBars(newGame(89300)); Object.assign(g.flags, { bt_return: back, yuki_return: ret || back }, party ? { mei_party: true, ya_party: true } : {}, flags);
        g.minutes = 12 * D + 10 * 60; g.james.realm = id === 'yuki_human_awaken' ? 7 : 2; g.yuki.realm = g.james.realm; goTo(g, SCENES, id); return sceneView(g, SCENES).text;
    };
    for (const [f, id] of [['tiger', 'yuki_tiger_awaken'], ['human', 'yuki_human_awaken']]) {
        const alone = form(id, 'rr_hub', {}, false);
        assert(createHash('sha256').update(alone).digest('hex').slice(0, 16) === { tiger: '0af86b8c3b16508c', human: 'd351d6c495162fd7' }[f] && /^Then she/.test(P.AWAKE_AT[f]), `N1 (RV1 TG3): ${id} without the women renders as in v0.11.189`);
        assert(alone.includes(`\n\n${P.AWAKE_AT[f]}`) && !AW.some((a) => alone.includes(a[1])), `N1 (L9): ${id} without the party as before`);
        for (const [back, flags, w0] of [['rr_hub', {}, 'P'], ['dw_hub', { bl_day: 6 }, 'P'], ['heart_hub', {}, 'T'], ['rt_camp', {}, 'P'], ['ah_hub', { bl_day: 4 }, 'M'], ['ah_hub', { bl_day: 4, ya_off_done: true }, 'P']]) {
            const w = w0 === 'T' && !P.AWAKE_WOMEN[f].T ? 'P' : w0; // D1 (c3): the Old Tree's own text for the great form, P for the human
            const x = form(id, back, flags);
            assert(x === alone.replace(`\n\n${P.AWAKE_AT[f]}`, () => `\n\n${P.AWAKE_WOMEN[f][w]}\n\n${P.AWAKE_AT[f].replace(/^Then she/, 'Then Yuki')}`), `N1 (L9; RV1 M1): ${id} after ${back}${flags.ya_off_done ? ' (Ya back)' : ''}: ${w} before "${P.AWAKE_AT[f]}", the sentence naming Yuki`);
        }
        for (const [back, flags, party, ret, why] of [['fo_ashfall', {}, true, null, "Act 1's Ashfall"], ['rt_ashfall', {}, true, null, 'the Return\'s Ashfall'], ['village', {}, true, null, "the prologue's village"],
            ['ah_hub', { bl_day: 2, trio: 2 }, true, null, 'both away'], ['rr_hub', { ya_party: false }, true, null, 'Mei Lin alone in the party'], ['rr_hub', {}, true, 'lf_hub', "the Long Forest's hub"]]) {
            const x = form(id, back, flags, party, ret);
            assert(!AW.some((a) => x.includes(a[1])), `N1 (L9): ${id}: none for ${why}`);
        }
    }
    { // both away needs her friendships: as P1's block
        const g = ensureBars(newGame(89310)); Object.assign(g.flags, { bt_return: 'ah_hub', yuki_return: 'ah_hub', mei_party: true, ya_party: true, bl_day: 2, trio: 2 }); g.rel['Mei Lin'] = { f: 90, a: 90 }; g.rel['Ya'] = { f: 90, a: 90 };
        g.james.realm = 2; g.yuki.realm = 2; assert(P.btWho(g) === null && !AW.some((a) => SCENES.yuki_tiger_awaken.text(g).includes(a[1])), 'N1 (L9): both away for water: none'); }
    // btWho is the breakthrough's own test: the realm's line and the form scene agree
    for (const [back, flags, w] of [['rr_hub', {}, 'P'], ['heart_hub', {}, 'T'], ['ah_hub', { bl_day: 4 }, 'M'], ['fo_ashfall', {}, null], ['village', {}, null]]) {
        const g = ensureBars(newGame(89320)); Object.assign(g.flags, { bt_return: back, mei_party: true, ya_party: true }, flags); g.james.realm = 2; g.minutes = 12 * D + 10 * 60;
        const t = SCENES.breakthrough.text(g);
        assert(P.btWho(g) === w && (w ? t.endsWith(`\n\n${P.BT_LATE[w].A}`) : !Object.values(P.BT_LATE).some((o) => t.includes(o.A))), `N1 (L9): btWho ${back} → ${w}, as the breakthrough's line`);
    }
    // the real path: the Meditate card's breakthrough at rr_hub, Get up, the great form with both women
    { const g = ensureBars(newGame(89330)); g.scene = 'rr_hub'; Object.assign(g.flags, { mei_party: true, ya_party: true, ya_met: true }); g.james.realm = 1; g.james.saturation = 96; g.rel['Mei Lin'] = 20; g.minutes = 11 * D + 10 * 60;
      runMed(g, SCENES, 'med:bt');
      if (g.scene === 'breakthrough') choose(g, SCENES, 0);
      const t = g.scene === 'yuki_tiger_awaken' ? sceneView(g, SCENES).text : '';
      assert(t.includes(`\n\n${P.AWAKE_WOMEN.tiger.P}\n\nThen Yuki is eleven pounds again, in the space of one breath.`) && t.indexOf(P.AWAKE_WOMEN.tiger.P) > t.indexOf('*Finally. I have been small for long enough.*'), `N1 (L9; RV1 M1): the real path from rr_hub's breakthrough to the great form with both women (${g.scene})`); }
    // RV1 (TG2): the real path to the human form, through Nascent Soul's warning, both women (rr_hub) and Mei Lin alone (ah_hub)
    for (const [hub, extra, w] of [['rr_hub', {}, 'P'], ['ah_hub', { bl_day: 4 }, 'M']]) {
      const g = ensureBars(newGame(89331)); g.scene = hub; Object.assign(g.flags, { mei_party: true, ya_party: true, ya_met: true, yuki_tiger_seen: true }, extra); g.coil = { ...(g.coil || {}), act: 1 };
      g.james.realm = 6; g.yuki.realm = 6; g.james.saturation = 96; g.rel['Mei Lin'] = 20; g.minutes = 11 * D + 10 * 60;
      runMed(g, SCENES, 'med:bt'); if (g.scene === 'ns_warn') choose(g, SCENES, 1); if (g.scene === 'breakthrough') choose(g, SCENES, 0);
      const t = g.scene === 'yuki_human_awaken' ? sceneView(g, SCENES).text : '';
      assert(g.james.realm === 7 && t.includes(`\n\n${P.AWAKE_WOMEN.human[w]}\n\nThen Yuki looks at you and opens her mouth`) && t.indexOf(P.AWAKE_WOMEN.human[w]) < t.indexOf('"You," says Yuki'), `N1 (RV1 TG2): the real path at ${hub} to the human form: ${w} before her first words (${g.scene}, realm ${g.james.realm})`); }
    // L8b: the second songs
    const SONG_KEYS = new Set(Object.values(SG.SONG_AT));
    assert(Object.keys(SG.SONG_SECOND).sort().join() === 'boof_pack,durin,mumei_song,music_box,waters_call' && Object.keys(SG.SONG_SECOND).every((k) => SONG_KEYS.has(k)), 'N1 (L8b): five songs that come second, all real');
    // RV1 (TG5): each sentence pinned whole (they are short)
    assert(JSON.stringify(SG.SONG_SECOND) === JSON.stringify({ mumei_song: 'The archive has been opened once already, and it turns out that does not close it.', music_box: 'Whatever you played earlier has worn off everyone by now, which you take as permission.', boof_pack: 'The omnitool has already played once today, and nobody has asked it to stop.', waters_call: 'The omnitool, asked for music twice in a day, offers no opinion and the whole list.', durin: 'Nobody here would say the day was short of songs, but the others were for other things.' }), 'N1 (L8b; RV1 L5, L6, L7, TG5): the five sentences as picked');
    for (const [k, x] of Object.entries(SG.SONG_SECOND)) assert(!/\b(morning|evening|night|dawn|dusk|sun|tonight|yesterday)\b/i.test(x) && words(x) >= 8 && words(x) <= 25 && /\.$/.test(x) && !/[{}]/.test(x) && !/Dúrin|mumei|Trøllabundin|Genesis|Boof|Music Box|Water's Call|Eivør|Aethelstan|Ironmouse|Nyanners/i.test(x), `N1 (L8b): ${k} one sentence, 8–25 words, names no song or singer`);
    assert(new Set(Object.values(SG.SONG_SECOND)).size === 5, 'N1 (L8b): five different sentences');
    const sat = (seed, scene, day, hour, flags = {}) => { const g = ensureBars(fresh(seed)); g.scene = scene; g.minutes = day * D + hour * 60; Object.assign(g.flags, { mei_party: true, ya_party: true }, flags); g.coil = { ...(g.coil || {}), act: 1 }; linesOf(g).at = scene; return g; };
    const view = (g) => ({ id: g.scene, text: 'A screen.' });
    { const g = sat(89400, 'heart_hall', 15, 14, { songs: 'reflect' });
      const a = M.musicLine(g, view(g)); assert(a && a.key === 'song.durin' && a.text === SG.songText(g, 'durin'), 'N1 (L8b): the day\'s first song as before (no opening sentence)');
      g.scene = 'ship_wreck'; linesOf(g).at = 'ship_wreck'; linesOf(g).cur = {}; g.minutes += 2 * 60;
      const b = M.musicLine(g, view(g)); assert(b && b.key === 'song.mumei_song' && b.text === `${SG.SONG_SECOND.mumei_song} ${SG.songText(g, 'mumei_song')}`, 'N1 (L8b): the second song the same day opens on its sentence');
      assert(linesOf(g).sg.p === 'durin', 'N1 (SK1): the day\'s earlier song kept in the record');
      const c = M.musicLine(g, view(g)); linesOf(g).cur = {}; const e = M.musicLine(g, view(g), { newVisit: false });
      assert(c && e && c.text === b.text && e.text === b.text, 'N1 (SK1): the same on a redraw and back from a meta screen');
      delete linesOf(g).sg.p; linesOf(g).cur = {}; const old = M.musicLine(g, view(g), { newVisit: false });
      assert(old && old.text === SG.songText(g, 'mumei_song'), 'N1 (SK1): an older save\'s record (no p): the passage alone');
      linesOf(g).sg.p = 'nonsense'; linesOf(g).cur = {}; const junk = M.musicLine(g, view(g), { newVisit: false });
      assert(junk && junk.text === SG.songText(g, 'mumei_song'), 'N1 (RV1 L9): a junk p on redraw: the passage alone'); }
    { const g = sat(89403, 'ship_wreck', 15, 16, { songs: 'reflect,durin' }); linesOf(g).sg = { d: textDay(g), song: 'nonsense', at: 'heart_hall' };
      const r = M.musicLine(g, view(g)); assert(r && r.text === SG.songText(g, 'mumei_song') && !linesOf(g).sg.p, 'N1 (RV1 L9): a junk earlier song the same day: no opening sentence'); }
    // RV1 (TG6): each measured pair, on its own scenes, and a third song the same day (p = the second)
    for (const [a, b, day, ha, hb, act] of [['ape_lured', 'heart_view', 15, 13, 21, 1], ['heart_view', 'heart_hall', 15, 21, 22, 1], ['fo_depart', 'bl_camp', 10, 7, 19, 1], ['bl_camp', 'dw_enter', 11, 19, 21, 1]]) {
      const g = sat(89410 + day + ha, a, day, ha, { songs: 'reflect' }); g.coil = { ...(g.coil || {}), act };
      const x = M.musicLine(g, view(g)); g.scene = b; linesOf(g).at = b; linesOf(g).cur = {}; g.minutes += (hb - ha) * 60;
      const y = M.musicLine(g, view(g)), kb = SG.SONG_AT[b];
      assert(x && x.key === `song.${SG.SONG_AT[a]}` && y && y.key === `song.${kb}` && y.text === `${SG.SONG_SECOND[kb]} ${SG.songText(g, kb)}` && linesOf(g).sg.p === SG.SONG_AT[a], `N1 (RV1 TG6): ${a} then ${b} the same day: ${kb} opens on its sentence`); }
    { const g = sat(89420, 'ape_lured', 15, 13, { songs: 'reflect' }); M.musicLine(g, view(g));
      for (const [s, h] of [['heart_view', 21], ['heart_hall', 22]]) { g.scene = s; linesOf(g).at = s; linesOf(g).cur = {}; g.minutes = 15 * D + h * 60; M.musicLine(g, view(g)); }
      assert(linesOf(g).sg.song === 'durin' && linesOf(g).sg.p === 'music_box', 'N1 (RV1 TG6): a third song the same day keeps the second as p'); }
    { const g = sat(89401, 'ship_wreck', 15, 16, { songs: 'reflect,durin' }); linesOf(g).sg = { d: textDay(g) - 1, song: 'durin', at: 'heart_hall' };
      const r = M.musicLine(g, view(g)); assert(r && r.text === SG.songText(g, 'mumei_song') && !linesOf(g).sg.p, 'N1 (L8b): a song the day before: no opening sentence'); }
    { const g = sat(89402, 'night', 1, 22, {}); g.coil = { ...(g.coil || {}), act: 0 }; linesOf(g).sg = { d: textDay(g), song: 'nonsense', at: 'x' };
      const r = M.musicLine(g, view(g)); assert(r && r.key === 'song.reflect' && r.text === SG.songText(g, 'reflect'), 'N1 (L8b): a song with no opening sentence of its own stays as it is'); }
    // RV1 (TG1): both new pools read by the text lint (its sample states set no bt_return, no song record)
    { const TL = readFileSync(new URL('../tools/textlint.mjs', import.meta.url), 'utf8');
      assert(/awake: \[\.\.\.Object\.values\(BTX\.AWAKE_WOMEN\)\.flatMap\(\(o\) => Object\.values\(o\)\), BTX\.AWAKE_VILLAGE, BTX\.AWAKE_A1_ASHFALL \/\* D1 \(c2\) \*\/, \.\.\.Object\.values\(BTX\.AFTER_ANSWER_WOMEN\), \.\.\.Object\.values\(BTX\.ASK_WOMEN\)\]/.test(TL) && /song_second: Object\.values\(SGX\.SONG_SECOND\)/.test(TL), 'N1 (RV1 TG1): textlint\'s POOLS hold the awake and song_second pools'); }
    // SW: the parley's GU check
    const ck = RETURN.rt_parley.choices.map((c) => c.check).find((c) => c && c.skill === 'GU' && c.dc === 9);
    const bonus = (flags) => { const g = ensureBars(newGame(89500)); Object.assign(g.flags, flags); return ck.bonus(g); };
    assert(ck && bonus({}) === 0 && bonus({ a1_sky_seen: true }) === 1 && bonus({ sky_witness: 1 }) === 1 && bonus({ sky_witness: 1, a1_sky_seen: true }) === 1, 'N1 (SW): the parley +1 with a1_sky_seen, as with sky_witness, not twice');
}
// v0.11.191 (owner pick Y1; the owner's report 2026-11-15 21:00): Yuki asks every Coil. RP her answer belongs to the Coil (yk_path,
// yk_wait out of KEEP_FLAGS; the rewind keeps it as yk_last; a snapshot keeps one only with her human in it); AK a later Coil's first
// human shape (the breakthrough's "Get up.") goes to her question, by the Long Forest's fire too; TX the later question by last answer,
// the fire's, the answers the same or changed (Fable's texts)
{
    const Y = await import('../js/story/yuki_path.js');
    const C = await import('../js/core/coil.js');
    const D = 1440;
    const words = (x) => x.split(/\s+/).filter(Boolean).length;
    // RP: the kept flags
    assert(!KEEP_FLAGS.includes('yk_path') && !KEEP_FLAGS.includes('yk_wait') && KEEP_FLAGS.includes('yk_last'), 'Y1 (RP): her answer is not kept, her last answer is');
    assert(C.ykLastOf({ yk_path: 'lover', yk_last: 'sister' }) === 'lover' && C.ykLastOf({ yk_wait: true, yk_last: 'lover' }) === 'wait' && C.ykLastOf({ yk_last: 'sister' }) === 'sister' && C.ykLastOf({}) === undefined, 'Y1 (RP): this Coil\'s answer, else "Not yet", else the one before');
    // RP: the rewind
    const coilWith = (seed, flags, snapFlags = null, snapRealm = 0) => {
        const g = ensureBars(fresh(seed)); g.scene = 'ashfall'; Object.assign(g.flags, flags);
        if (snapFlags) { Object.assign(g.coil.snap.flags, snapFlags); g.coil.snap.yuki.realm = snapRealm; g.coil.snap.james.realm = snapRealm; }
        endCoil(g, 'choice', 'ashfall'); rewind(g); return g;
    };
    for (const [flags, want] of [[{ yk_path: 'lover' }, 'lover'], [{ yk_path: 'sister', yk_last: 'lover' }, 'sister'], [{ yk_wait: true }, 'wait'], [{ yk_last: 'sister' }, 'sister'], [{}, undefined]]) {
        const g = coilWith(91000, flags);
        assert(g.flags.yk_last === want && !g.flags.yk_path && !g.flags.yk_wait, `Y1 (RP): ${JSON.stringify(flags)} → yk_last ${want} (${JSON.stringify([g.flags.yk_last, g.flags.yk_path, g.flags.yk_wait])})`);
    }
    const old = coilWith(91010, { yk_path: 'sister' }, { yk_path: 'sister', yk_wait: true }, 3);
    assert(!old.flags.yk_path && !old.flags.yk_wait && old.flags.yk_last === 'sister', 'Y1 (RP): a snapshot\'s answer from the old keep (her not human in it) goes, so she asks');
    const lf = coilWith(91020, { yk_path: 'lover' }, { yk_path: 'sister' }, 7);
    assert(!lf.flags.yk_path && lf.flags.yk_last === 'lover', `Y1 (RV1 M1): a snapshot with her human (asked by its prologue's Long Forest fire) drops its answer too (${lf.flags.yk_path})`);
    const lf2 = coilWith(91021, { yk_path: 'sister', yuki_human_seen: true }, { yk_path: 'sister' }, 7);
    assert(!lf2.flags.yk_path && lf2.flags.yk_last === 'sister' && lf2.yuki.realm === 7 && Y.ykAskNow(lf2), 'Y1 (RV1 M1, TG2): an Act 1 begun with her human: no answer, so she is to ask (ykAskNow)');
    // TX: the texts
    const T = [...Object.entries(Y.YK_LATER.q).map(([k, x]) => ['Q-' + k, x]), ['F', Y.YK_LATER.fire], ...['sister', 'lover'].flatMap((p) => Object.entries(Y.YK_LATER[p]).map(([k, x]) => [`A-${p}-${k}`, x]))];
    assert(T.length === 8 && new Set(T.map((t) => t[1])).size === 8, 'Y1 (TX): eight texts, all different');
    for (const [k, x] of T) {
        const [lo, hi] = k.startsWith('A-') ? [55, 130] : [85, 175];
        assert(typeof x === 'string' && !/@@|[{}`]|TODO/.test(x) && words(x) >= lo && words(x) <= hi, `Y1 (TX): ${k} written, ${lo}–${hi} words (${words(String(x))})`);
        assert(!/\b(night|tonight|morning|dawn|dusk|sun|sunrise|sunset|moss|ash|dust|bark)\b/i.test(x), `Y1 (TX): ${k} has no time or ground words`);
        if (k.startsWith('A-') || k.startsWith('Q-')) assert(!/\bfire\b|\bcamp\b/i.test(x), `Y1 (TX): ${k} names no fire or camp (place-neutral)`);
    }
    assert(/"The question\." Her ears are pricked\./.test(Y.YK_LATER.q.sister) && !/looks up at you/.test(Y.YK_LATER.q.sister), 'Y1 (D1 C1): no run shared with rr_elk_won');
    assert(/and kisses you lightly: the corner of your mouth, then the middle of it\./.test(Y.YK_LATER.lover.changed) && !/kisses you once/.test(Y.YK_LATER.lover.changed), 'Y1 (D1 C2): "once" cut');
    assert(/I have references, though none of them remember\./.test(Y.YK_LATER.q.sister) && /put back in its box/.test(Y.YK_LATER.q.lover) && /I'm explaining the delay\./.test(Y.YK_LATER.q.wait) && /wants watching and not feeding/.test(Y.YK_LATER.fire)
        && /I retire undefeated\./.test(Y.YK_LATER.sister.changed) && /Aloud counts\./.test(Y.YK_LATER.sister.same) && /It kept through the world ending\./.test(Y.YK_LATER.lover.same) && /I've only just arrived\."$/.test(Y.YK_LATER.lover.changed), 'Y1 (TX): Fable\'s words pinned');
    for (const p of ['sister', 'lover']) assert(/^Yuki: your (sister|lover)\. Back in her own shape, she /.test(Y.YK_LATER_RESULT[p]), `Y1 (D1 RL): ${p}'s later result line`);
    // AK: the breakthrough's "Get up." on a later Coil
    const later = (seed, last, { a = 40, back = 'rr_hub', lfA = false, realm = 7, flags = {} } = {}) => {
        const g = ensureBars(fresh(seed)); g.minutes = 12 * D + 600;
        Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, bt_return: back }, last ? { yk_last: last } : {}, lfA ? { lf_active: true } : {}, flags);
        g.james.realm = realm; g.yuki.realm = realm; g.yuki.form = 'cat'; g.rel = { ...g.rel, Yuki: { f: 50, a } };
        goTo(g, SCENES, 'breakthrough'); choose(g, SCENES, 0); return g;
    };
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => re.test(x.label)); assert(!!c, `Y1: a choice ${re} on ${g.scene}`); if (c) choose(g, SCENES, c.index); };
    for (const last of ['sister', 'lover', 'wait']) {
        const g = later(91100, last, { a: 80 });
        assert(g.scene === 'yk_choice' && g.yuki.form === 'human' && sceneView(g, SCENES).text === Y.YK_LATER.q[last], `Y1 (AK, TX): last ${last}: "Get up." leads to her later question (${g.scene})`);
        const f = later(91110, last, { a: 80, back: 'lf_hub', lfA: true });
        assert(f.scene === 'yk_choice' && sceneView(f, SCENES).text === Y.YK_LATER.fire, `Y1 (AK, TX): last ${last}: by the Long Forest's fire, the fire's later text`);
    }
    // the answers: the same, changed, or (after "Not yet") the first texts; by the fire and away; back to the place, in the shape she had
    for (const [last, ans, re, here, fire, want] of [
        ['sister', 'sister', /^"Family\./, 'yk_sister_here', 'yk_sister', Y.YK_LATER.sister.same], ['lover', 'sister', /^"Family\./, 'yk_sister_here', 'yk_sister', Y.YK_LATER.sister.changed],
        ['lover', 'lover', /^"More\."/, 'yk_lover_here', 'yk_lover', Y.YK_LATER.lover.same], ['sister', 'lover', /^"More\."/, 'yk_lover_here', 'yk_lover', Y.YK_LATER.lover.changed],
        ['wait', 'sister', /^"Family\./, 'yk_sister_here', 'yk_sister', Y.YK_LATER.afterWait.sister], ['wait', 'lover', /^"More\."/, 'yk_lover_here', 'yk_lover', Y.YK_LATER.afterWait.lover]]) {
        const g = later(91200, last, { a: 80 }); pick(g, re);
        assert(g.scene === here && g.flags.yk_path === ans && sceneView(g, SCENES).text === want, `Y1 (TX): last ${last}, ${ans} again away from the fire reads its text (${g.scene})`);
        const res = choose(g, SCENES, 0), rl = Y.YK_LATER_RESULT[ans];
        assert((res?.lines || g.log.at(-1)?.lines || []).some((l) => l === rl), `Y1 (D1 RL): the later result line, back in her own shape (${ans})`);
        assert(g.scene === 'rr_hub' && g.yuki.form === 'cat' && g.flags.yk_last === last, `Y1 (AK): back at the place, the cat again, the last answer unchanged until the rewind (${g.scene}, ${g.yuki.form})`);
        const f = later(91210, last, { a: 80, back: 'lf_hub', lfA: true }); pick(f, re);
        const ft = sceneView(f, SCENES).text;
        assert(f.scene === fire && (last === 'wait' ? ft === Y.YK_LATER.afterWait[ans] : ft === want), `Y1 (TX; RV1 M2): last ${last}, ${ans} by the fire reads ${last === 'wait' ? 'the after-"Not yet" text' : 'the later text'} (${f.scene})`);
        const r = coilWith(91220, { yk_path: ans, yk_last: last });
        assert(r.flags.yk_last === ans, `Y1 (RP): the next rewind keeps this Coil's answer (${r.flags.yk_last})`);
    }
    // patient: below the bar "Not yet", and then no second ask this Coil at the next breakthrough; one ask a Coil
    {
        const g = later(91300, 'sister', { a: 40 }); pick(g, /^"Not yet\./);
        assert(g.flags.yk_wait === true && g.scene === 'rr_hub' && g.yuki.form === 'cat', `Y1 (AK): "Not yet" this Coil, back (${g.scene})`);
        g.james.realm = 8; g.yuki.realm = 8; goTo(g, SCENES, 'breakthrough'); choose(g, SCENES, 0);
        assert(g.scene === 'rr_hub', `Y1 (AK): she doesn't ask again at the next breakthrough after "Not yet" (${g.scene})`);
        const h = later(91310, 'lover', { a: 80 }); pick(h, /^"More\."/); choose(h, SCENES, 0);
        h.james.realm = 8; h.yuki.realm = 8; goTo(h, SCENES, 'breakthrough'); choose(h, SCENES, 0);
        assert(h.scene === 'rr_hub' && h.flags.yk_path === 'lover', `Y1 (AK): answered this Coil, no second ask (${h.scene})`);
    }
    {   // RL only where she goes back: a later Coil's reopened question (after "Not yet", her daily scene at 72) leaves her human and keeps the first line
        const g = later(91320, 'sister', { a: 40 }); pick(g, /^"Not yet\./); g.rel.Yuki.a = 80; g.yuki.form = 'human'; goTo(g, SCENES, 'yk_choice_again'); pick(g, /^"Family\./);
        assert(g.scene === 'yk_sister_here' && sceneView(g, SCENES).text === Y.YK_LATER.sister.same, `Y1 (TX): the reopened question's family reads the later text (${g.scene})`);
        const r = choose(g, SCENES, 0);
        assert(g.yuki.form === 'human' && (r?.lines || []).includes(Y.YK_HERE.sisterResult), `Y1 (D1 RL): still human after it, the first result line (${g.yuki.form})`);
    }
    // not before her human shape, the first time as before, and no last answer (a save that never answered) no ask
    assert(later(91400, 'sister', { realm: 6 }).scene === 'rr_hub', 'Y1 (AK): below Nascent Soul, no question');
    const first = later(91410, null, { flags: { yuki_human_seen: false } });
    assert(first.scene === 'yuki_human_awaken', `Y1 (AK): the first time ever, her human scene first, as before (${first.scene})`);
    assert(later(91420, null).scene === 'rr_hub', 'Y1 (AK): no last answer recorded, no later question');
    assert(later(91430, 'sister', { flags: { yk_path: 'sister' } }).scene === 'rr_hub', 'Y1 (AK): an old save mid-Coil with its kept answer: no ask until its next rewind');
    // RV1 (M2, L4, TG9): after a last "Not yet", the answers claim no first time; a later "Not yet" has its own reply (D1 C3: no "next time round")
    for (const [ans, re, here, fire] of [['sister', /^"Family\./, 'yk_sister_here', 'yk_sister'], ['lover', /^"More\."/, 'yk_lover_here', 'yk_lover']]) {
        for (const [h, lfA, id] of [['away', false, here], ['fire', true, fire]]) {
            const g = later(91700, 'wait', { a: 80, back: lfA ? 'lf_hub' : 'rr_hub', lfA }); pick(g, re);
            const t = sceneView(g, SCENES).text;
            assert(g.scene === id && t === Y.YK_LATER.afterWait[ans] && !/having not had|not once did it occur|never heard with your ears|never crossed your mind|never had/i.test(t), `Y1 (RV1 M2, TG9): after a "Not yet", ${ans} ${h} reads its own text, no first-time claim (${g.scene})`);
        }
    }
    assert(/Worth the queue\./.test(Y.YK_LATER.afterWait.sister) && /I'd begun to think of it as furniture\./.test(Y.YK_LATER.afterWait.lover) && /"I'll put it to you again\. It's a decent question\./.test(Y.YK_LATER.notYet) && !/next time round/.test(Y.YK_LATER.notYet), 'Y1 (RV1 D1, C3): Fable\'s words pinned, "next time round" cut');
    for (const [k, x, lo, hi] of [['W-sister', Y.YK_LATER.afterWait.sister, 60, 115], ['W-lover', Y.YK_LATER.afterWait.lover, 60, 115], ['N-again', Y.YK_LATER.notYet, 30, 70]]) assert(words(x) >= lo && words(x) <= hi && !/\b(night|tonight|tomorrow|morning|dawn|day|fire|camp|laugh\w*)\b/i.test(x), `Y1 (RV1 M2, L4): ${k} ${lo}–${hi} words, no time, place or laugh words (${words(x)})`);
    for (const last of ['sister', 'lover', 'wait']) {
        const g = later(91710, last, { a: 40 }); const r = choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => /^"Not yet\./.test(c.label)).index);
        assert((r?.lines || []).includes(Y.YK_LATER.notYet) && !(r?.lines || []).includes(Y.YK_QUESTION.notYetResult), `Y1 (RV1 L4): a later "Not yet" (last ${last}) reads her later reply`);
    }
    // RV1 (H1, TG1): the Long Forest's seasons: no breakthrough, so her daily door asks; F's James line; a later fire's title and labels (L3)
    {
        const P = await import('../js/story/prologue.js');
        const g = ensureBars(fresh(91800)); g.minutes = 3 * D + 600;
        Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, yk_last: 'sister', lf_active: true, longforest: true });
        g.james.realm = 6; g.yuki.realm = 6; g.yuki.form = 'cat'; g.rel = { ...g.rel, Yuki: { f: 50, a: 40 } }; goTo(g, SCENES, 'lf_hub'); P.lfSeason(g);
        assert(g.yuki.realm >= 7 && Y.ykAskNow(g), `Y1 (RV1 H1): a season gives her the human shape, and she is to ask (${g.yuki.realm})`);
        g.yuki.form = 'human'; assert(!Y.ykAskOpen(g), 'Y1 (RV1 H1b): no "You said not yet" reopen without this Coil\'s "Not yet"'); g.yuki.form = 'cat';
        goTo(g, SCENES, 'lf_hub'); choose(g, SCENES, SCENES.lf_hub.choices.findIndex((c) => c.to === 'yk_time'));
        const v = sceneView(g, SCENES);
        assert(g.scene === 'yk_choice' && v.text === Y.YK_LATER.fire && /"For a while\."/.test(v.text) && !/Since the breakthrough/.test(v.text) && g.yuki.form === 'human', `Y1 (RV1 H1a, H1c): her daily door asks by the fire, "For a while." (${g.scene})`);
        assert(SCENES.yk_choice.title(g) === 'The Fire', 'Y1 (RV1 L3): a later fire is not "The Last Fire"');
        pick(g, /^"Family\./);
        assert(g.scene === 'yk_sister' && sceneView(g, SCENES).choices[0].label === 'Sleep.', `Y1 (RV1 L3): the label loses "Tomorrow, the smoke" (${sceneView(g, SCENES).choices[0]?.label})`);
        choose(g, SCENES, 0);
        assert(g.scene === 'lf_hub' && g.flags.yk_path === 'sister', `Y1 (RV1 H1a): back at the fire's hub, answered (${g.scene})`);
        g.minutes += D; goTo(g, SCENES, 'lf_hub'); choose(g, SCENES, SCENES.lf_hub.choices.findIndex((c) => c.to === 'yk_time'));
        assert(g.scene === 'yk_time', `Y1 (RV1 H1a): once answered, her door is her company again (${g.scene})`);
        const a = ensureBars(fresh(91810)); a.minutes = 12 * D + 600; Object.assign(a.flags, { yuki_tiger_seen: true, yuki_human_seen: true, yk_last: 'lover' });
        a.james.realm = 7; a.yuki.realm = 7; a.yuki.form = 'cat'; a.rel = { ...a.rel, Yuki: { f: 50, a: 80 } }; goTo(a, SCENES, 'rr_hub'); choose(a, SCENES, SCENES.rr_hub.choices.findIndex((c) => c.to === 'yk_time'));
        assert(a.scene === 'yk_choice' && sceneView(a, SCENES).text === Y.YK_LATER.q.lover && a.flags.yk_back === 'rr_hub', `Y1 (RV1 H1a, TG2): an Act 1 begun with her human: her door asks, back to the hub (${a.scene})`);
        const first = ensureBars(fresh(91820)); first.minutes = 12 * D + 600; Object.assign(first.flags, { yuki_human_seen: true, yk_wait: true });
        first.james.realm = 7; first.yuki.realm = 7; first.yuki.form = 'human'; first.rel = { ...first.rel, Yuki: { f: 50, a: 80 } };
        assert(Y.ykAskOpen(first) && !Y.ykAskNow(first), 'Y1 (RV1 H1b): this Coil\'s "Not yet" still reopens at 72');
    }
    // RV1 (M3, TG10): before she can ask this Coil, the lines without her human read her last answer; once she can, only this Coil's
    {
        const at = (last, realm, flags = {}) => { const g = ensureBars(fresh(91900)); Object.assign(g.flags, { yuki_human_seen: true, yk_last: last }, flags); g.james.realm = realm; g.yuki.realm = realm; g.yuki.form = 'cat'; return g; };
        assert(Y.ykPath(at('sister', 0)) === 'sister' && Y.ykPath(at('lover', 2)) === 'lover' && Y.ykPath(at('wait', 0)) === null && Y.ykPath(at('sister', 7)) === null && Y.ykPath(at('sister', 7, { yk_path: 'lover' })) === 'lover', 'Y1 (RV1 M3): the remembered answer below her human shape; none after a "Not yet"; at Nascent Soul only this Coil\'s');
        const x = at('sister', 0, { long: true, forest_day: 3, vday: 3, lf_active: true }); goTo(x, SCENES, 'lf_exit');
        assert(/waits at the treeline for you to catch up\. \*If the first woman we meet is pretty,\*/.test(sceneView(x, SCENES).text), 'Y1 (RV1 M3, TG10): the Long Forest walk-out\'s sister-and-cat line on a later Coil');
        const door = Object.values(SCENES).flatMap((sc) => (sc.choices || []).map((c) => [sc.id, c])).find(([, c]) => c.to === 'yk_sister_talk');
        assert(!!door && door[1].show(at('sister', 0)) && !door[1].show(at('wait', 0)), `Y1 (RV1 M3, TG10): her love-life talk (${door?.[0]}) shows on the remembered "family", not after a "Not yet"`);
    }
    // RV1 (TG4–TG8): place, form, names, the kiss limit, the result lines
    const ALLY = (o) => (typeof o === 'string' ? [o] : Object.values(o).flatMap(ALLY));
    for (const x of [...ALLY(Y.YK_LATER.sister), ...ALLY(Y.YK_LATER.lover), ...ALLY(Y.YK_LATER.afterWait), Y.YK_LATER.notYet]) assert(!/\b(stove|hearth|loft|grove|stream|water|road|tree|hut|bench|fire|camp|toes|steps? (in|close))\b/i.test(x), `Y1 (RV1 TG4, L1): an answer names no place and no standing posture: ${x.slice(0, 40)}`);
    for (const x of Object.values(Y.YK_LATER.q)) assert(!/\b(shoulder|eleven pounds|small)\b/i.test(x), `Y1 (RV1 TG5): a later question holds for the cat and the great root-kin: ${x.slice(0, 40)}`);
    for (const x of [...ALLY(Y.YK_LATER), ...ALLY(Y.YK_LATER_RESULT)]) assert(!/\b(Mei Lin|Ya|Wen|Hu)\b/.test(x), `Y1 (RV1 TG6): nobody else named: ${x.slice(0, 40)}`);
    assert(/The kiss is brief and exact/.test(Y.YK_LATER.lover.same) && /The kiss she gives you is short/.test(Y.YK_LATER.afterWait.lover) && [Y.YK_LATER.lover.same, Y.YK_LATER.lover.changed, Y.YK_LATER.afterWait.lover].every((x) => !/\b(undress\w*|unbutton\w*|naked|bare|collar comes|bed|no dress)\b/i.test(x)), 'Y1 (RV1 TG7): a kiss at most');
    // RV1 (after the planted faults T3, W4, P6): the canon card's tics and no first-time claim in any of them; "Not yet" last time, below Nascent Soul: no question
    const CARD_TICS = /something like|for a moment|in a way that|the way a\b|a long moment|a long time|the first time|a thousand years|four hundred pounds|a great deal|a good deal|the far side|sits down beside|a black dress|since the lab|light comes down|gold eyes level/i;
    for (const x of [...ALLY(Y.YK_LATER), ...ALLY(Y.YK_LATER_RESULT)]) assert(!CARD_TICS.test(x) && !/\bfirst time\b|\bnever (heard|seen|had)\b/i.test(x), `Y1 (RV1 TG): no canon-card tic and no first-time claim: ${x.slice(0, 40)}`);
    assert(later(91410, 'wait', { realm: 6 }).scene === 'rr_hub' && !Y.ykAskNow(later(91411, 'wait', { realm: 6 })), 'Y1 (AK): after a "Not yet", below Nascent Soul, no question either');
    for (const x of Object.values(Y.YK_LATER_RESULT)) assert(!/"/.test(x) && splitLine(x).reply === x, `Y1 (RV1 TG8): a result line with no speech, read whole: ${x.slice(0, 30)}`);
    assert(/The arrangement stands\./.test(Y.YK_LATER.sister.same) && /She leans in\. The kiss/.test(Y.YK_LATER.lover.same) && /Then she shifts closer, rests her free hand over your heart/.test(Y.YK_LATER.lover.changed) && / She leans her shoulder into your ribs/.test(Y.YK_LATER.sister.changed) && !/steps in/.test(Y.YK_LATER.sister.changed), 'Y1 (RV1 L1, L2): Claude\'s cuts');
    // the first texts unchanged where no last answer: the question away and by the fire
    const g0 = ensureBars(fresh(91500)); Object.assign(g0.flags, { yuki_human_seen: true }); g0.james.realm = 7; g0.yuki.realm = 7; g0.rel = { ...g0.rel, Yuki: { f: 50, a: 80 } };
    goTo(g0, SCENES, 'yk_choice'); assert(sceneView(g0, SCENES).text === Y.YK_HERE.first, 'Y1: the first question away from the fire as before');
    g0.flags.lf_active = true; assert(/^The last night before you walk out of the Long Forest/.test(sceneView(g0, SCENES).text), 'Y1: the first question by the fire as before');
}

// v0.11.192 (owner pick K1, F1; Claude's words): L5 the first Coil's result line when she goes back to a cat; M2b "everyone" after the
// women's paragraph; LF a later fire's result lines; QH the later questions (and FQ the later fire's) when she is already human; QW the
// "Not yet" one when the Coil began with her human shape (the snapshot)
{
    const Y = await import('../js/story/yuki_path.js');
    const P = await import('../js/story/prologue.js');
    const D = 1440;
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => re.test(x.label)); assert(!!c, `K1: a choice ${re} on ${g.scene}`); return c ? choose(g, SCENES, c.index) : null; };
    const lines = (r, g) => r?.lines || g.log.at(-1)?.lines || [];
    // L5: the first time, through yuki_human_after's two choices: back to a cat → "Back in her own shape"; kept human → "She stays as she is"
    for (const [re, form, want] of [[/^Promise/, 'cat', 'later'], [/^Ask her to stay/, 'human', 'here']]) {
        for (const [ans, are, scene] of [['sister', /^"Family\./, 'yk_sister_here'], ['lover', /^"More\."/, 'yk_lover_here']]) {
            const g = ensureBars(fresh(92000)); g.minutes = 12 * D + 600;
            Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, bt_return: 'rr_hub', yuki_return: 'rr_hub' });
            g.james.realm = 7; g.yuki.realm = 7; g.yuki.form = 'human'; g.rel = { ...g.rel, Yuki: { f: 50, a: 80 } };
            goTo(g, SCENES, 'yuki_human_after'); pick(g, re);
            assert(g.scene === 'yk_choice' && g.flags.yk_form_before === form, `K1 (L5): ${re} leads to her question with her ${form} before it (${g.scene}, ${g.flags.yk_form_before})`);
            pick(g, are); assert(g.scene === scene, `K1 (L5): ${ans} away from the fire (${g.scene})`);
            const r = choose(g, SCENES, 0), rl = want === 'later' ? Y.YK_LATER_RESULT[ans] : Y.YK_HERE[`${ans}Result`];
            assert(g.yuki.form === form && lines(r, g).includes(rl), `K1 (L5): the first Coil, ${ans}, her ${form} after it: "${rl.slice(0, 40)}…" (${g.yuki.form})`);
        }
    }
    assert(/She stays as she is/.test(Y.YK_HERE.sisterResult) && /She stays as she is/.test(Y.YK_HERE.loverResult), 'K1 (L5): the first lines kept for her staying human');
    // M2b: yuki_human_after names everyone after the women's paragraph, "the two of you" without it
    {
        const at = (party, ret = 'rr_hub') => { const g = ensureBars(fresh(92100)); Object.assign(g.flags, { bt_return: 'rr_hub', yuki_return: ret }, party ? { mei_party: true, ya_party: true } : {}); g.minutes = 12 * D + 600; g.james.realm = 7; g.yuki.realm = 7; goTo(g, SCENES, 'yuki_human_after'); return sceneView(g, SCENES).text; };
        const alone = at(false), both = at(true);
        assert(alone.includes(P.AFTER_WOMEN[0]) && !alone.includes(P.AFTER_WOMEN[1]), 'K1 (M2b): without the women, "the two of you" as before');
        assert(both === alone.replace(P.AFTER_WOMEN[0], P.AFTER_WOMEN[1]).replace(P.AFTER_ANSWER, P.AFTER_ANSWER_WOMEN.P), 'K1 (M2b); v0.11.193 (N1, HA): with the women, "everyone" and her last paragraph for them, nothing else changed');
        assert(/Then the great form, which leaves everyone rather less room than before, yawning/.test(both) && /which leaves the two of you rather less room than before/.test(alone), 'K1 (RV1 TG1): the word as shown to the owner, pinned');
        assert(at(true, 'lf_hub') === alone, 'K1 (M2b): reached from elsewhere than the breakthrough they saw, as before');
    }
    // the later question's helper state: a later Coil (last answer), at the breakthrough or her daily door
    const later = (last, { form = 'cat', lfA = false, snap = 0, a = 80 } = {}) => {
        const g = ensureBars(fresh(92200)); g.minutes = 12 * D + 600;
        Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, bt_return: lfA ? 'lf_hub' : 'rr_hub', yk_last: last }, lfA ? { lf_active: true } : {});
        g.james.realm = 7; g.yuki.realm = 7; g.yuki.form = form; g.rel = { ...g.rel, Yuki: { f: 50, a } }; g.coil.snap.yuki.realm = snap;
        goTo(g, SCENES, 'breakthrough'); choose(g, SCENES, 0); return g;
    };
    // QH + FQ: already human as it starts: no change of shape (all four texts); a cat or the great root-kin: the texts as written
    for (const [k, lfA] of [['sister', false], ['lover', false], ['wait', false], ['fire', true]]) {
        const last = k === 'fire' ? 'sister' : k, base = k === 'fire' ? Y.YK_LATER.fire : Y.YK_LATER.q[k];
        for (const form of ['cat', 'tiger']) {
            const g = later(last, { form, lfA });
            assert(g.scene === 'yk_choice' && sceneView(g, SCENES).text === base, `K1 (QH): ${k}, her ${form} before it: the text as written (${g.scene})`);
        }
        const h = later(last, { form: 'human', lfA }); const t = sceneView(h, SCENES).text;
        let want = base; for (const [from, to] of Y.YK_LATER_HUMAN[k]) want = want.replace(from, to);
        assert(h.scene === 'yk_choice' && t === want && t !== base, `K1 (QH${k === 'fire' ? ', FQ' : ''}): ${k}, already human: her own opening (${h.scene})`);
        assert(!/\bchanges there|one step she is a cat|out of the cat's shape|takes her human shape|is a woman by the end|Hands again|has thumbs\b/.test(t), `K1 (QH): ${k}, already human: no change of shape in it`);
    }
    // RV1 (TG2): each opening pinned as built (M1, L1, L2, L3), and no new-hands beat in a first paragraph
    assert(JSON.stringify(Object.fromEntries(Object.entries(Y.YK_LATER_HUMAN).map(([k, ps]) => [k, ps.map((x) => x[1])]))) === JSON.stringify({ sister: ['and stops there, shaking her sleeves straight.', '"Right," she says. "You know'], lover: ['. She tugs her collar level.'], wait: ['and rolls her shoulders there.'], fire: ['Across it Yuki gets up, stretches, and kneels again:', 'She holds her palms to the heat.'] }), 'K1 (RV1 TG2): the QH and FQ words as the owner picked them');
    for (const k of ['sister', 'lover', 'wait']) assert(!/\b(again|thumbs|fingers|coat|hook|There,)/.test(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, k).split('\n\n')[0]) && !/"There,|Hands again/.test(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, k).split('\n\n')[1]), `K1 (RV1 TG2): ${k}, already human: no new-hands beat in its opening`);
    assert(!/pleased with them/.test(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, 'fire')) && /pleased with them/.test(Y.YK_LATER.fire), 'K1 (RV1 L3): the fire\'s palms, already human, without "pleased with them"');
    assert(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, 'sister').startsWith('Yuki leads you off until nobody is near enough to hear, and stops there, shaking her sleeves straight.\n\n"Right," she says. "You know what comes with the hands."'), 'K1 (RV1 M1): the sister opening as shown');
    assert(Y.ykLaterQ({ flags: { yk_form_before: 'human' }, coil: { snap: { yuki: { realm: 0 } } } }, 'sister').startsWith('Yuki leads you off until nobody is near enough to hear, and stops there, shaking her sleeves straight.'), 'K1 (QH): the sister opening as shown to the owner');
    assert(/^Yuki waits until no one is close enough to overhear\. She tugs her collar level\.\n\n/.test(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, 'lover')), 'K1 (QH; RV1 L1): the lover opening as picked; v0.11.202 (RV1 M2): opens on her name');
    assert(/^Yuki picks a spot out of everyone's hearing and rolls her shoulders there\.\n\n/.test(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, 'wait')), 'K1 (QH; RV1 L2): the "Not yet" opening as picked');
    assert(/Across it Yuki gets up, stretches, and kneels again: sleeves neat, hair already everywhere\./.test(Y.ykLaterQ({ flags: { yk_form_before: 'human' } }, 'fire')), 'K1 (F1, FQ): the fire opening as asked');
    // QW: the "Not yet" one when this Coil began with her human shape: no voice grown back; otherwise as written
    for (const [snap, form, cut] of [[7, 'cat', true], [7, 'human', true], [0, 'cat', false], [6, 'cat', false]]) {
        const g = later('wait', { form, snap }); const t = sceneView(g, SCENES).text;
        assert(t.includes('"We stopped at \'not yet\'," she says. "Then it all began again."\n\n') === cut && t.includes('until now to grow a voice back') === !cut, `K1 (QW): the snapshot at realm ${snap}, her ${form}: ${cut ? 'cut' : 'as written'}`);
    }
    assert(!Y.ykLaterQ({ flags: {}, coil: { snap: { yuki: { realm: 7 } } } }, 'sister').includes(Y.YK_WAIT_SINCE_DAWN[1]) && Y.ykLaterQ({ flags: {} }, null) === null, 'K1 (QW): only the "Not yet" text; no last answer, no later text');
    // LF: a later fire's results on a stay that goes on; the first fire's as before; RV1 (L4): the sister keeps her first line; (TG3) every last answer
    for (const last of ['sister', 'lover', 'wait']) for (const [ans, are, fire] of [['sister', /^"Family\./, 'yk_sister'], ['lover', /^"More\."/, 'yk_lover']]) {
        const g = later(last, { lfA: true }); pick(g, are); assert(g.scene === fire, `K1 (LF): ${ans} by a later fire, last ${last} (${g.scene})`);
        const r = choose(g, SCENES, 0), want = ans === 'lover' ? Y.YK_FIRE_LATER_RESULT.lover : 'Yuki: your sister. Back in her small form, on your chest, purring like a smug engine.';
        assert(lines(r, g).includes(want) && g.yuki.form === 'cat', `K1 (LF; RV1 L4, TG3): a later fire's ${ans} result line, last ${last} (${lines(r, g)[0]?.slice(0, 40)})`);
    }
    for (const [ans, are] of [['sister', /^"Family\./], ['lover', /^"More\."/]]) {
        const f = ensureBars(fresh(92300)); Object.assign(f.flags, { yuki_human_seen: true, lf_active: true, yk_back: 'lf_hub' }); f.james.realm = 7; f.yuki.realm = 7; f.rel = { ...f.rel, Yuki: { f: 50, a: 80 } };
        goTo(f, SCENES, 'yk_choice'); pick(f, are); const r0 = choose(f, SCENES, 0);
        assert(lines(r0, f).some((l) => (ans === 'sister' ? /on your chest, purring like a smug engine\.$/ : /She stays human until the treeline/).test(l)), `K1 (LF): the first fire's ${ans} result as before`);
    }
    assert(Object.keys(Y.YK_FIRE_LATER_RESULT).join() === 'lover' && Y.YK_FIRE_LATER_RESULT.lover === 'Yuki: your lover. She stays human a while, holding your hand, and then flows back into a cat on your shoulder. "Nobody needs to know yet," she says, before she does. "I like being underestimated."', 'K1 (LF; RV1 L4): the lover\'s later line as shown, the sister\'s first kept');
    assert(!/\b(treeline|tomorrow|smoke|dawn|night)\b/i.test(Y.YK_FIRE_LATER_RESULT.lover), 'K1 (LF): no leaving in a later fire\'s lover line');
    // RV1 (TG5): QW on a real rewind: an Act 1 begun with her human cuts it through her daily door; the whole game again does not
    {
        const C = await import('../js/core/coil.js');
        const g = ensureBars(fresh(92400)); Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true });
        g.james.realm = 7; g.yuki.realm = 7; g.yuki.form = 'cat'; g.rel = { ...g.rel, Yuki: { f: 50, a: 40 } };
        startActCoil(g, 1); g.scene = 'rr_hub'; g.flags.yk_wait = true; C.endCoil(g, 'choice', 'rr_hub'); C.rewind(g);
        assert(g.flags.yk_last === 'wait' && g.yuki.realm === 7 && Y.ykHumanAtStart(g) && Y.ykAskNow(g), `K1 (RV1 TG5): an Act 1 rewind with her human at its dawn (${g.flags.yk_last}, ${g.yuki.realm})`);
        goTo(g, SCENES, 'yk_time');
        const t = sceneView(g, SCENES).text;
        assert(g.scene === 'yk_choice' && t.includes('"Then it all began again."\n\n') && !t.includes('grow a voice back'), `K1 (RV1 TG5): her daily door asks, "Not yet" without "until now" (${g.scene})`);
        C.endCoil(g, 'choice', 'rr_hub'); C.rewind(g, { to: 'game' });
        assert(!Y.ykHumanAtStart(g), 'K1 (RV1 TG5): the whole game again starts without her human shape');
    }
    // RV1 (TG6): QH through her daily door with her already human
    for (const last of ['sister', 'lover', 'wait']) {
        const g = ensureBars(fresh(92500)); g.minutes = 12 * D + 600;
        Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, yk_last: last }); g.james.realm = 7; g.yuki.realm = 7; g.yuki.form = 'human'; g.rel = { ...g.rel, Yuki: { f: 50, a: 80 } };
        goTo(g, SCENES, 'yk_time');
        assert(g.scene === 'yk_choice' && g.flags.yk_form_before === 'human' && sceneView(g, SCENES).text === Y.ykLaterQ(g, last) && sceneView(g, SCENES).text !== Y.YK_LATER.q[last], `K1 (RV1 TG6): her daily door, already human, last ${last}: her own opening (${g.scene})`);
    }
    // RV1 (L6, L7): the shape rule is the game's own; a pair never throws at play time
    assert(Y.ykHumanAtStart({ coil: { snap: { yuki: { realm: 7 } } } }) && !Y.ykHumanAtStart({ coil: { snap: { yuki: { realm: 6 } } } }) && !Y.ykHumanAtStart({}), 'K1 (RV1 L6): ykHumanAtStart by yukiForms');
    {
        const src = readFileSync(new URL('../js/story/yuki_path.js', import.meta.url), 'utf8');
        const body = src.slice(src.indexOf('export const ykLaterQ'), src.indexOf('export const ykLaterQ') + 600);
        assert(/for \(const \[k, pairs\] of Object\.entries\(YK_LATER_HUMAN\)\) for \(const p of pairs\) swap\(/.test(src) && /^swap\(YK_LATER\.q\.wait, YK_WAIT_SINCE_DAWN\);$/m.test(src), 'K1 (RV1 TG8): the load-time check of every pair is there');
        assert(/t = put\(t, p\)/.test(body) && !/swap\(/.test(body) && /yukiForms\(\{ yuki: g\.coil\?\.snap\?\.yuki/.test(src), 'K1 (RV1 L6, L7): ykLaterQ uses the non-throwing put; the load check keeps swap');
    }
}

// v0.11.193 (owner pick N1, D1; Fable's, Claude's C1 + C2): HA yuki_human_after's last paragraph when the women heard her; HQ the
// first question opens on them leaving; GV the prologue's Ashfall answers her great form. RV1: H1 "spirit-beast", M1 "Yuki is in the tall
// shape" after HQ, M2 HQ's first sentences not a look (Claude's), L2 'supper' unreachable, L3 not after a realm with its own closer, TG1–TG6
{
    const P = await import('../js/story/prologue.js');
    const D = 1440;
    const { runMed } = await import('../js/core/meditate.js');
    const pick = (g, re) => { const c = sceneView(g, SCENES).choices.find((x) => re.test(x.label)); assert(!!c, `N1 (193): a choice ${re} on ${g.scene}`); return c ? choose(g, SCENES, c.index) : null; };
    const PROMISE = '"Promise you won\'t make an occasion of it."';
    // the words as picked (D1): Fable's, with C1 (M) and C2 (GV)
    assert(Object.keys(P.AFTER_ANSWER_WOMEN).join('') === 'PM' && Object.keys(P.ASK_WOMEN).join('') === 'PM', 'N1 (HA, HQ): P and M each');
    assert(P.AFTER_ANSWER_WOMEN.P.endsWith(PROMISE) && P.AFTER_ANSWER_WOMEN.M.endsWith(PROMISE) && P.AFTER_ANSWER.endsWith(PROMISE.slice(1)), 'N1 (HA): the closing request word for word, so "Promise. No occasion." answers it');
    assert(!/choose who hears me answer back, and when/.test(P.AFTER_ANSWER_WOMEN.P + P.AFTER_ANSWER_WOMEN.M) && /to everyone else I stay one, and I choose who hears me answer back\./.test(P.AFTER_ANSWER_WOMEN.P) && /You two have heard\. It can't be undone, so you are chosen\. Don't be flattered\./.test(P.AFTER_ANSWER_WOMEN.P), 'N1 (HA-P): the women have heard; Fable\'s words pinned');
    assert(/"You have heard already\. It was not planned\. Keep it\." "Who would believe me\?" Mei Lin says\./.test(P.AFTER_ANSWER_WOMEN.M) && !/the first/.test(P.AFTER_ANSWER_WOMEN.M) && !/\bYa\b/.test(P.AFTER_ANSWER_WOMEN.M), 'N1 (HA-M; D1 C1): no "the first" (James heard her first); Ya, away, not named');
    assert(/^Yuki waits, in Mei Lin and Ya's direction, with great patience\. Mei Lin reads it first\./.test(P.ASK_WOMEN.P) && /^Yuki says nothing to Mei Lin, pointedly\. Mei Lin lifts both hands\. "I know that silence\. My mother has it\."/.test(P.ASK_WOMEN.M) && !/\blooks?\b|\bgaze\b|\beyes\b/.test(P.ASK_WOMEN.P + P.ASK_WOMEN.M), 'N1 (RV1 M2): HQ opens on a wait and a silence, not a look');
    assert(/takes Ya by the elbow/.test(P.ASK_WOMEN.P) && /Ya looking back twice\.$/.test(P.ASK_WOMEN.P) && /My mother has it\./.test(P.ASK_WOMEN.M) && /Shout if he falls over\."$/.test(P.ASK_WOMEN.M) && !/\bYa\b/.test(P.ASK_WOMEN.M), 'N1 (HQ): Fable\'s words pinned; Ya not in M');
    const TIME = /\b(night|nights|dawn|dusk|sun|sunlit|sunset|sunrise|morning|evening|noon|midday|dark|darkness|moon|moonlit|stars?|today|tonight|lamp|lamplight|torch|torchlight)\b/i;
    assert(!TIME.test(P.ASK_WOMEN.P + P.ASK_WOMEN.M) && !/\b(moss|ash|dust|bark|cat|tall|small|human|shoulder|lap|paws?|tail|ears|fur|whiskers)\b/i.test(P.ASK_WOMEN.P + P.ASK_WOMEN.M), 'N1 (HQ; RV1 TG2): no time, ground or shape words (camps, the Old Tree, the road; her shape varies)');
    assert(/Ya shuts her mouth; Mei Lin nods, carefully\./.test(P.AFTER_ANSWER_WOMEN.P) && /Her gaze goes over Mei Lin and Ya, unhurried\./.test(P.AFTER_ANSWER_WOMEN.P) && /Her eyes move to Mei Lin\./.test(P.AFTER_ANSWER_WOMEN.M) && /Yuki turns back to you\./.test(P.AFTER_ANSWER_WOMEN.M) && /"And you," Yuki says to you\./.test(P.AFTER_ANSWER_WOMEN.P), 'N1 (HA; RV1 TG3): the middle beats pinned');
    assert(P.ASK_AT.join('|') === 'She is in the tall shape|Yuki is in the tall shape' && YK_HERE.first.startsWith(P.ASK_AT[0]), 'N1 (RV1 M1): YK_HERE.first opens on the anchor');
    assert(/a spirit-beast of rank/.test(P.AWAKE_VILLAGE) && !/root-kin/.test(P.AWAKE_VILLAGE) && !TIME.test(P.AWAKE_VILLAGE) && /^Nobody in the street runs\./.test(P.AWAKE_VILLAGE) && /Yuki's ears turn at "fish"\.$/.test(P.AWAKE_VILLAGE) && /and bows again, to her this time, lower than he bowed to you\./.test(P.AWAKE_VILLAGE) && !/disciple/.test(P.AWAKE_VILLAGE) && !/\b(Mei Lin|night|dawn|sun|morning|dust)\b/.test(P.AWAKE_VILLAGE), 'N1 (GV; RV1 H1, TG6: the locals\' "spirit-beast", never "root-kin"; G1 the bow as a callback to the closer): the locals\' word, no Mei Lin, no time words, no dust');
    // HA: rendered after the breakthrough the women saw
    const after = (back, flags = {}, party = true, ret) => { const g = ensureBars(fresh(93000)); Object.assign(g.flags, { bt_return: back, yuki_return: ret || back }, party ? { mei_party: true, ya_party: true } : {}, flags); g.minutes = 12 * D + 600; g.james.realm = 7; g.yuki.realm = 7; goTo(g, SCENES, 'yuki_human_after'); return sceneView(g, SCENES).text; };
    const alone = after('rr_hub', {}, false);
    assert(alone.endsWith(P.AFTER_ANSWER) && alone.includes(P.AFTER_WOMEN[0]), 'N1 (HA): without the women, as before');
    for (const [back, flags, w] of [['rr_hub', {}, 'P'], ['heart_hub', {}, 'P'], ['ah_hub', { bl_day: 4 }, 'M'], ['ah_hub', { bl_day: 4, ya_off_done: true }, 'P']]) {
        const x = after(back, flags);
        assert(x === alone.replace(P.AFTER_WOMEN[0], P.AFTER_WOMEN[1]).replace(P.AFTER_ANSWER, P.AFTER_ANSWER_WOMEN[w]), `N1 (HA): ${back}${flags.ya_off_done ? ' (Ya back)' : ''}: ${w}'s last paragraph, "everyone"`);
    }
    for (const [back, ret, why] of [['rr_hub', 'lf_hub', "the Long Forest's hub"], ['fo_ashfall', null, "Act 1's Ashfall"], ['village', null, "the prologue's village"]]) assert(after(back, {}, true, ret) === alone, `N1 (HA): ${why}: as before`);
    // HQ: the first question through yuki_human_after's two choices; the women leave first
    for (const [re, back, flags, w] of [[/^Promise/, 'rr_hub', {}, 'P'], [/^Ask her to stay/, 'rr_hub', {}, 'P'], [/^Promise/, 'ah_hub', { bl_day: 4 }, 'M'], [/^Ask her to stay/, 'ah_hub', { bl_day: 4 }, 'M'], [/^Promise/, 'heart_hub', {}, 'P'], [/^Promise/, 'rr_hub', null, null]]) {
        const g = ensureBars(fresh(93100)); g.minutes = 12 * D + 600;
        Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, bt_return: back, yuki_return: back }, flags ? { mei_party: true, ya_party: true, ...flags } : {});
        g.james.realm = 7; g.yuki.realm = 7; g.yuki.form = 'human'; g.rel = { ...g.rel, Yuki: { f: 50, a: 80 } };
        goTo(g, SCENES, 'yuki_human_after'); pick(g, re);
        const t = g.scene === 'yk_choice' ? sceneView(g, SCENES).text : '';
        assert(w ? t === `${P.ASK_WOMEN[w]}\n\n${YK_HERE.first.replace(P.ASK_AT[0], P.ASK_AT[1])}` && t.includes('\n\nYuki is in the tall shape') && !t.includes('\n\nShe is in the tall shape') : t === YK_HERE.first, `N1 (HQ): ${re} at ${back}: ${w ? `${w} leave, then her question naming her` : 'alone, her question as before'} (${g.scene})`);
        if (w) { pick(g, /^"Family\./); assert(g.scene === 'yk_sister_here', `N1 (HQ): the answer as before (${g.scene})`); }
    }
    { // a later Coil's question (asked before) at the breakthrough the women saw: its own text, not this opening (open, options later)
        const g = ensureBars(fresh(93200)); g.minutes = 12 * D + 600;
        Object.assign(g.flags, { yuki_tiger_seen: true, yuki_human_seen: true, bt_return: 'rr_hub', yuki_return: 'rr_hub', mei_party: true, ya_party: true, yk_last: 'sister' });
        g.james.realm = 7; g.yuki.realm = 7; g.yuki.form = 'human'; goTo(g, SCENES, 'yk_choice');
        const t = sceneView(g, SCENES).text; assert(!Object.values(P.ASK_WOMEN).some((a) => t.includes(a)) && t !== YK_HERE.first, 'N1 (HQ): a later Coil\'s question unchanged');
    }
    // GV: the great form after the prologue village's breakthrough
    const tiger = (back, party = false, ret) => { const g = ensureBars(fresh(93300)); Object.assign(g.flags, { bt_return: back, yuki_return: ret || back }, party ? { mei_party: true, ya_party: true } : {}); g.minutes = 3 * D + 600; g.james.realm = 2; g.yuki.realm = 2; goTo(g, SCENES, 'yuki_tiger_awaken'); return sceneView(g, SCENES).text; };
    const tAlone = tiger('rr_hub');
    for (const back of ['village', 'ashfall']) { // RV1 (L2): 'supper' is never a breakthrough's place
        const x = tiger(back);
        assert(x === tAlone.replace(`\n\n${P.AWAKE_AT.tiger}`, () => `\n\n${P.AWAKE_VILLAGE}\n\nThen Yuki is eleven pounds again`) && x.indexOf(P.AWAKE_VILLAGE) > x.indexOf('*Finally. I have been small for long enough.*'), `N1 (GV): ${back}: the street's paragraph while she is still great, then "Then Yuki"`);
    }
    for (const [back, ret, why] of [['fo_ashfall', null, "Act 1's Ashfall"], ['rt_ashfall', null, "the Return's Ashfall"], ['village', 'lf_hub', "the Long Forest's hub"], ['camp', null, 'the camp']]) assert(!tiger(back, false, ret).includes(P.AWAKE_VILLAGE), `N1 (GV): none at ${why}`);
    for (const [realm, want] of [[3, true], [9, true], [10, false], [11, false], [12, false], [14, false]]) { // RV1 (L3): an old save's first great form at a realm with its own closer
        const g = ensureBars(fresh(93305)); Object.assign(g.flags, { bt_return: 'village', yuki_return: 'village' }); g.james.realm = realm; g.yuki.realm = realm; goTo(g, SCENES, 'yuki_tiger_awaken');
        assert(sceneView(g, SCENES).text.includes(P.AWAKE_VILLAGE) === want, `N1 (RV1 L3): realm ${realm}: GV ${want ? 'shown' : 'not shown (no "people bow" before it)'}`);
    }
    { const g = ensureBars(fresh(93310)); Object.assign(g.flags, { bt_return: 'village', yuki_return: 'village', yuki_tiger_seen: true }); g.james.realm = 7; g.yuki.realm = 7; goTo(g, SCENES, 'yuki_human_awaken');
      assert(!sceneView(g, SCENES).text.includes(P.AWAKE_VILLAGE), 'N1 (GV): the great form only'); }
    // RV1 (TG4): the real path to HA and HQ: the realm-7 breakthrough at rr_hub with both women, "Hello, Yuki.", "Promise. No occasion."
    { const g = ensureBars(newGame(93330)); g.scene = 'rr_hub'; Object.assign(g.flags, { mei_party: true, ya_party: true, ya_met: true, yuki_tiger_seen: true }); g.coil = { ...(g.coil || {}), act: 1 };
      g.james.realm = 6; g.yuki.realm = 6; g.james.saturation = 96; g.rel['Mei Lin'] = 20; g.rel = { ...g.rel, Yuki: { f: 50, a: 80 } }; g.minutes = 11 * D + 10 * 60;
      runMed(g, SCENES, 'med:bt'); if (g.scene === 'ns_warn') choose(g, SCENES, 1); if (g.scene === 'breakthrough') choose(g, SCENES, 0);
      const s1 = g.scene; if (g.scene === 'yuki_human_awaken') pick(g, /^"Hello, Yuki\."/);
      const ha = g.scene === 'yuki_human_after' ? sceneView(g, SCENES).text : '';
      if (g.scene === 'yuki_human_after') pick(g, /^Promise/);
      const hq = g.scene === 'yk_choice' ? sceneView(g, SCENES).text : '';
      assert(s1 === 'yuki_human_awaken' && ha.endsWith(P.AFTER_ANSWER_WOMEN.P) && ha.includes(P.AFTER_WOMEN[1]) && hq === `${P.ASK_WOMEN.P}\n\n${YK_HERE.first.replace(P.ASK_AT[0], P.ASK_AT[1])}`, `N1 (RV1 TG4): the real path at rr_hub: HA-P, then HQ-P naming her (${s1} → ${g.scene})`); }
    // the real path: the prologue village's Meditate breakthrough, Get up, the great form with the street
    { const g = ensureBars(newGame(93320)); g.scene = 'village'; g.james.realm = 1; g.james.saturation = 96; g.minutes = 3 * D + 10 * 60;
      runMed(g, SCENES, 'med:bt'); const bt = g.scene === 'breakthrough' ? sceneView(g, SCENES).text : '';
      if (g.scene === 'breakthrough') choose(g, SCENES, 0);
      const t = g.scene === 'yuki_tiger_awaken' ? sceneView(g, SCENES).text : '';
      assert(/Ashfall watches it go in total silence\./.test(bt) && g.james.realm === 2 && t.includes(`\n\n${P.AWAKE_VILLAGE}\n\nThen Yuki is eleven pounds again, in the space of one breath.`), `N1 (GV): the real path from the village's breakthrough (${g.scene})`); }
}

// v0.11.195 (owner picks F1, D1; Fable's, BT and NA the alts; the FW read of v0.11.194): the prologue's lines for a James who can fly
// (canFly, Foundation+), shown in place of the mortal line only while he flies; LW `lore` [0] walks beside Mei Lin at every realm;
// EW / LH after a tribulation the village saw (sky_witness); BT the Foundation closer and S1–S4, X for everyone. RV1: M1 no WD-3 (never drawn),
// M2 one "ninety" fewer, M3 Lu Han's tail "Villages exaggerate.", M4 BT's "let go of you", L1 the slope seen from the ridge, L5 "All along the
// post"; TG1 a fact word or two pinned inside every line, TG2 EW / LH with Yuki's other primaries, healed, gao_broken, TG4 a real fetch
{
    const { FW, BT_CLOSER } = await import('../js/story/flight_texts.js');
    const { WALKS, FLY_LABELS } = await import('../js/story/walks.js');
    const T = 'F1 (195)';
    const TICS = /something like|for a moment|in a way that|the way a|a long moment|a long time|the first time|a thousand years|four hundred pounds|a great deal|a good deal|the far side|sits down beside|since the lab|light comes down|gold eyes level/i;
    const all = [...Object.values(FW), BT_CLOSER, ...Object.values(FLY_LABELS)];
    assert(all.every((t) => typeof t === 'string' && t.length > 0 && !TICS.test(t)), `${T}: every line set, no canon-card tic`);
    assert(Object.keys(FW).length === 17 && Object.keys(FLY_LABELS).join() === 'stream#5,dawn#0,bone_field#2,mire_lost#0', `${T}: 17 lines and 3 flown walk labels; D1 (a1): and mire_lost's`);
    assert(/^You land out of sight/.test(FW.healAgain) && /You went nowhere near that high\.$/.test(FW.healAgain) && /two hours, nearly all of it cutting and carrying\.$/.test(FW.healLabel), `${T} (HL): Fable's words`);
    assert(BT_CLOSER.endsWith('precisely as sarcastic as before. The ground, it seems, has let go of you.') && !/withdraw|verdict|claim/.test(BT_CLOSER) && FW.jackalsRun.endsWith('Flying wants a clearer head.'), `${T} (D1; RV1 M4): BT and NA as the alts, BT not in Wen's words`);
    // RV1 (TG1): the facts inside each line, so a word changed in the middle fails too
    const PIN = {
        healLabel: [/^Fly back to the stream for the fungus\./, /two hours/], healAgain: [/two shelves of pale green fungus/, /as if you had brought her the moon/, /out of sight/],
        elderSky: [/watched Heaven come for the man in that chair, and Heaven left with nothing\./, /My sense and my eye cannot both be honest, and I do not know which of them to bury\.$/], elderRung: [/until Heaven declined to stop you/],
        morningOut: [/^\*Then\* fly out\.$/], luHanSky: [/^"A tribulation was reported over this village," he says, to the road in general\./, /a man whom it did not burn/, /All along the post, heads go lower\. Nobody points\. Nobody needs to\.$/], luHanTail: [/^Villages exaggerate\.$/],
        scout: [/switchback/, /a bench under a roof, a shrine with a red lotus cut into the stone/, /because dust can't be read from above/, /The marks in it are fresh\. Somebody has been standing here, watching the village\.$/],
        jackalsRun: [/^A hedge of bone spikes between you and them, then run for the water\./], dawnNothing: [/You eat nothing, a meal you are getting very good at/, /about to go up/, /when the scream comes\.$/], dawnLeft: [/You eat what's left/, /about to go up/, /when the scream comes\.$/],
        streamOutLabel: [/^Enough of the forest\. Fly the stream out, low — today\.$/], streamOut: [/it is your only map/, /The trees draw apart, the stones grow, the stream raises its voice\.$/],
        trunk: [/^Step up off the ground with Yuki/], trunkGreat: [/^Step up off the ground behind Yuki/], ridgeOpen: [/^You come down on the ridge with the lie of the land already in your head:$/],
        ridgeSlope: [/^Below, on the herb slope, a basket lies spilled\. A boulder has blood on it\. Whoever was there has gone\.$/],
    };
    assert(Object.keys(PIN).sort().join() === Object.keys(FW).sort().join() && Object.entries(PIN).every(([k, res]) => res.every((re) => re.test(FW[k]))), `${T} (RV1 TG1): every line's facts pinned (${Object.entries(PIN).filter(([k, res]) => !res.every((re) => re.test(FW[k] || ''))).map(([k]) => k).join(', ')})`);
    assert(!('explore' in FW), `${T} (RV1 M1): no WD-3 (task mode draws wilds [3] as the Explore card)`);
    assert(/^Yet I stood in my own street/.test(FW.elderSky) && /^Foundation, a rung no one in Ashfall had stood on, until Heaven declined to stop you\.$/.test(FW.elderRung) && /Nobody needs to\.$/.test(FW.luHanSky), `${T} (EW, LH): Fable's words`);
    // the screens by realm: realm 0 the old line, realm 1 the new one
    const at = (realm, id, flags = {}) => { const g = ensureBars(fresh(95000 + realm)); g.james.realm = realm; g.yuki.realm = realm; Object.assign(g.flags, flags); goTo(g, SCENES, id); Object.assign(g.flags, flags); return { g, v: sceneView(g, SCENES) }; };
    const lbl = (v, re) => v.choices.find((c) => re.test(c.label))?.label || '';
    for (const [id, mortal, flown] of [
        ['heal_again', /^You come back mud to the knees/, FW.healAgain],
        ['scout', /^Out of Ashfall the road goes up/, FW.scout],
        ['ridge_alone', /^The ridge shows you the lie of the land:/, FW.ridgeOpen],
        ['stream_out', /^You go where the water goes\. The trees draw apart/, FW.streamOut],
    ]) {
        const m = at(0, id).v.text; const f = at(1, id).v.text;
        assert(mortal.test(m) && !m.includes(flown) && f.startsWith(flown) && !mortal.test(f), `${T}: ${id} by flight`);
    }
    { const m = at(0, 'ridge_alone').v.text; const f = at(1, 'ridge_alone').v.text;
        assert(/The way down crosses the herb slope\./.test(m) && f.includes(FW.ridgeSlope) && !/The way down crosses/.test(f) && /all the way down\.$/.test(f), `${T} (RA-3): the slope crossed coming in`); }
    { const m = at(0, 'heal').v; const f = at(1, 'heal').v;
        assert(lbl(m, /stream for the fungus/) === "Go back to the stream for the fungus. It's two hours there and back." && lbl(f, /stream for the fungus/) === FW.healLabel, `${T} (HL-L): the label by flight`);
        assert(SCENES.heal.choices[2].time === 120 && !SCENES.heal.choices[2].walk, `${T} (HL-L): still 120 min of work, not a walk`); }
    for (const food of [0, 1]) {
        const flags = {}; const mk = (r) => { const x = at(r, 'dawn', flags); x.g.inventory = food ? { hare_raw: 1 } : {}; return sceneView(x.g, SCENES); };
        const m = mk(0); const f = mk(1);
        assert(/working out which direction counts as \*away\*/.test(m.text) && f.text.startsWith(food ? FW.dawnLeft : FW.dawnNothing), `${T} (DW-1): dawn ¶1 by flight, ${food ? 'with food' : 'without'}`);
        assert(/plenty of swearing folded in/.test(f.text) && !/a good deal/.test(m.text + f.text), `${T} (X): dawn ¶2's swap`);
        assert(lbl(m, /toward it\.$/) === 'Run straight toward it.' && lbl(f, /toward it\.$/) === 'Go straight toward it.', `${T} (DW-0): the walk's label by flight`);
    }
    { const m = at(0, 'wilds', { forest_day: 2 }).v; const f = at(1, 'wilds', { forest_day: 2 }).v;
        assert(lbl(m, /^Explore deeper/) === 'Explore deeper into the forest (takes the afternoon).' && lbl(f, /^Explore deeper/) === lbl(m, /^Explore deeper/), `${T} (RV1 M1): Explore's label as before at every realm`);
        assert(lbl(m, /^Enough of the forest/) === 'Enough of the forest. Follow the stream out — today.' && lbl(f, /^Enough of the forest/) === FW.streamOutLabel, `${T} (WD-10): the stream out by flight`); }
    { const m = at(0, 'bone_field').v; const f = at(1, 'bone_field').v;
        assert(lbl(m, /before the light goes\.$/) === 'Walk back before the light goes.' && lbl(f, /before the light goes\.$/) === 'Head back before the light goes.', `${T} (BF)`); }
    { const m = at(0, 'stream').v; const f = at(1, 'stream').v;
        assert(lbl(m, /downstream until dark\.$/) === 'Keep walking downstream until dark.' && lbl(f, /downstream until dark\.$/) === 'Keep going downstream until dark.', `${T} (ST)`); }
    { const c = SCENES.night_attack.choices.find((x) => /hedge of bone spikes/.test(String(x.text)));
        assert(!!c && c.text(at(0, 'night_attack').g) === 'A hedge of bone spikes between you and them, then run for the water.' && c.text(at(1, 'night_attack').g) === FW.jackalsRun && c.to === 'jackals_fled', `${T} (NA): the label by flight, still into the water`); }
    // MW and S4: the second morning's closing words; the third morning names the forest, not the Blackroot
    for (const replay of [false, true]) {
        const mk = (r) => { const x = at(r, 'morning', { forest_day: 2 }); if (replay) { x.g.coil.n = 2; Object.assign(x.g.flags, { v_bone: true }); } return sceneView(x.g, SCENES).text; };
        const m = mk(0); const f = mk(1);
        assert(m.endsWith('*Then* walk out.') && f.endsWith(FW.morningOut) && m.slice(0, -16) === f.slice(0, -15), `${T} (MW): the closing three words by flight${replay ? ' (a later Coil)' : ''}`);
    }
    { const t = at(0, 'morning', { forest_day: 3 }).v.text; assert(/^Day three in the forest\./.test(t) && !/Blackroot/.test(t), `${T} (S4): the third morning`); }
    // EW and LH: after a tribulation the village saw; without it, as before (flying or not)
    for (const [realm, sky] of [[0, 0], [1, 0], [1, 1], [3, 2]]) {
        const e = at(realm, 'elder', sky ? { sky_witness: sky } : {}).v.text; const t = at(realm, 'tribute', sky ? { sky_witness: sky } : {}).v.text;
        if (sky) assert(e.includes(FW.elderSky) && e.includes(`An inner disciple leads them: ${FW.elderRung}`) && !/Mei Lin says you made a needle|a rung no one in Ashfall has stood on/.test(e) && /That chair might as well be empty\." He frowns at the chair\. "Yet I stood/.test(e), `${T} (EW): Wen watched it (realm ${realm})`);
        else assert(!e.includes(FW.elderSky) && /a rung no one in Ashfall has stood on\./.test(e), `${T} (EW): no sky, as before (realm ${realm})`);
        if (sky) assert(t.includes(`There it stays.\n\n${FW.luHanSky}\n\n"Interesting." His Qi-sense reaches for you`) && t.includes(`No cultivation at all. A mortal. ${FW.luHanTail}" The same sense`), `${T} (LH; RV1 M3): between ¶3 and ¶4, ¶4 on "Interesting." alone, the tail (realm ${realm})`);
        else assert(!t.includes(FW.luHanSky) && !t.includes(FW.luHanTail) && /There it stays\.\n\n"Interesting," he says\. His Qi-sense/.test(t) && /A mortal\." The same sense/.test(t), `${T} (LH): no sky, as before (realm ${realm})`);
    }
    // RV1 (TG2): with Yuki's other primaries (the beast's sentence can say "I am ninety"), and with healed and gao_broken
    for (const prim of [0, 5, 12]) for (const extra of [{}, { healed: true }, { gao_broken: true }, { long: true, gao_beaten: true }]) {
        const mk = (id) => { const x = at(1, id, { sky_witness: 1, ...extra }); x.g.yuki.primaries = prim; return sceneView(x.g, SCENES).text; };
        const e = mk('elder'); const t = mk('tribute');
        assert(e.includes(FW.elderSky) && (e.match(/ninety/g) || []).length <= 3 && !/at ninety I/.test(e) && (e.split('\n\n')[1].match(/ninety/g) || []).length <= 2, `${T} (RV1 M2, TG2): Wen's paragraph, primaries ${prim} ${Object.keys(extra).join('+') || 'plain'}`);
        assert(t.includes(FW.luHanSky) && t.includes(FW.luHanTail) && (t.match(/\bline\b/g) || []).length <= 2 && (t.match(/," he says/g) || []).length <= 1, `${T} (RV1 M3, L5, TG2): Lu Han's screen, primaries ${prim} ${Object.keys(extra).join('+') || 'plain'}`);
    }
    // RV1 (TG4): a real fetch at Foundation: heal [2] → heal_again, 120 min, the flown line
    { const { g } = at(1, 'heal'); g.inventory = {}; const v = sceneView(g, SCENES); const c = v.choices.find((x) => x.label === FW.healLabel); const m0 = g.minutes;
        if (c) choose(g, SCENES, c.index);
        assert(!!c && g.scene === 'heal_again' && g.minutes - m0 === 120 && sceneView(g, SCENES).text === FW.healAgain && (g.inventory.jade_bracket || 0) === 2, `${T} (RV1 TG4): heal → heal_again flown, 120 min (${g.minutes - m0})`); }
    { const e = at(1, 'elder', { sky_witness: 1, ignored: true }).v.text; assert(e.includes(FW.elderSky) && !/walked down out of the Blackroot/.test(e), `${T} (EW): the sky before "ignored"`); }
    // LW: lore [0] is no longer a walk: 40 min beside Mei Lin at every realm, no flown line
    assert(!WALKS.some(([id]) => id === 'lore') && !SCENES.lore.choices[0].walk && SCENES.lore.choices[0].time === 40, `${T} (LW): lore [0] unmarked, 40 min`);
    for (const realm of [0, 1, 3]) {
        const { g } = at(realm, 'lore'); const m0 = g.minutes; const out = choose(g, SCENES, 0) || [];
        const lines = Array.isArray(out) ? out.join(' ') : String(out?.lines || '');
        assert(g.scene === 'village' && g.minutes - m0 === 40 && !/instead of|min by air|not 40|Flown:/.test(lines), `${T} (LW): realm ${realm}: 40 min on foot (${g.minutes - m0})`);
    }
    // S1, S2, S3, BT: for everyone
    assert(/in exact detail, to the last hailstone\./.test(at(0, 'wen_lesson').v.text), `${T} (S1): Wen's first lesson`);
    { const src = readFileSync(new URL('../js/story/ashfall.js', import.meta.url), 'utf8'); const pro = readFileSync(new URL('../js/story/prologue.js', import.meta.url), 'utf8');
        assert(/is considerably stronger than one confused mycologist/.test(src) && !/a good deal stronger|a great deal of exact/.test(src), `${T} (S1, S2): the swaps in ashfall.js`);
        assert(/\nIt goes on looking\.\n/.test(pro) && !/It looks for a long time\./.test(pro) && /\$\{BT_CLOSER /.test(pro) && !/You feel heavier, and steadier, and precisely as sarcastic as before\.`/.test(pro), `${T} (S3, BT): the tribulation's look, the closer`); }
    { const g = ensureBars(fresh(95100)); g.james.realm = 1; g.yuki.realm = 1; g.flags.bt_return = 'wilds'; goTo(g, SCENES, 'breakthrough'); const t = sceneView(g, SCENES).text;
        assert(t.endsWith(BT_CLOSER) && /\nIt goes on looking\.\n/.test(t), `${T} (BT, S3): the Foundation breakthrough's screen`); }
}

// v0.11.197 (owner pick C1; the owner 2026-11-16 12:28): a walk with Mei Lin and Ya along is flown only when they are carried
// (game.js `partyCarry`): James carries Mei Lin; Ya rides Yuki's great form (realm 2+) or is carried by her human form; each woman
// friendship and affection both at 30+. Otherwise the whole party walks the full time, with a FOOT_LINES line; `hot_spring` [2]
// leaves them behind (`alone`) and flies as his own; `lore` [0] stays on foot (F1's LW block above).
{
    const { partyCarry, CARRY_F, CARRY_A, flightMinutes } = await import('../js/core/game.js');
    const { CARRY_LINES, FOOT_LINES, FLOWN_LINES } = await import('../js/core/story.js');
    const { WALKS } = await import('../js/story/walks.js');
    const T = 'C1 (197)';
    const fill = (l, min, walk) => l.replace('{min}', min).replace('{walk}', walk);
    const pools = [...CARRY_LINES.great, ...CARRY_LINES.human, ...FOOT_LINES.yuki, ...FOOT_LINES.mei, ...FOOT_LINES.ya];
    assert(CARRY_F === 30 && CARRY_A === 30, `${T}: the bars are 30 / 30`);
    assert(pools.every((l) => typeof l === 'string' && l.split('{min}').length === 2 && l.split('{walk}').length === 2), `${T}: each line with both numbers, once each`);
    assert([CARRY_LINES.great, CARRY_LINES.human, FOOT_LINES.yuki, FOOT_LINES.mei, FOOT_LINES.ya].map((p) => p.length).join() === '4,3,8,2,2', `${T} (D1; v0.11.198 L3): Fable's 19 lines, 4 / 3 / 8 / 2 / 2`);
    // D1: Fable's words, a fact or two pinned in each line (N1: the first great line without "tiger-sized")
    const PINS = [[CARRY_LINES.great, ['Ya rides Yuki and whoops at every turn.', 'issuing corrections', 'steers by the ears', 'You split the difference']],
        [CARRY_LINES.human, ['makes it look like an errand', 'somewhere interesting', 'a woman with a tail']],
        [FOOT_LINES.yuki, ['carries what a cat carries', 'I could carry her spear', 'a cat of the right size']],
        [FOOT_LINES.mei, ['with her whole spine', 'a mother who would hear of it']], [FOOT_LINES.ya, ["I'm not luggage, scholar.", 'declines to be cargo']]];
    assert(PINS.every(([p, w]) => w.every((x, k) => p[k].includes(x))) && !pools.some((l) => /tiger-sized|\bagain\b|\bfirst\b|this time/.test(l)), `${T} (D1): the words as picked, no time words`);
    const party = (realm, { mei = [50, 50], ya = [50, 50], form = 'cat', yr = realm } = {}) => {
        const g = ensureBars(fresh(19700 + realm)); g.james.realm = realm; g.yuki.realm = yr; g.yuki.form = form;
        g.flags.mei_party = true; g.flags.ya_party = true; g.rel['Mei Lin'] = { f: mei[0], a: mei[1] }; g.rel.Ya = { f: ya[0], a: ya[1] };
        g.minutes = 14 * 1440 + 8 * 60; g.james.satiety = 90; return g;
    };
    // the rule
    { const g = ensureBars(fresh(19700)); g.james.realm = 3; g.yuki.realm = 3; assert(partyCarry(g) === null, `${T}: nobody along: no rule`); }
    assert(partyCarry(party(1)).why === 'yuki' && partyCarry(party(1, { mei: [0, 0] })).why === 'yuki', `${T}: below Core Formation Yuki can't carry Ya (checked first)`);
    assert(partyCarry(party(2, { mei: [29, 50] })).why === 'mei' && partyCarry(party(2, { mei: [50, 29] })).why === 'mei' && partyCarry(party(2, { ya: [50, 29] })).why === 'ya' && partyCarry(party(2, { ya: [29, 99] })).why === 'ya', `${T}: each woman needs both meters at 30`);
    { const c = partyCarry(party(2, { mei: [30, 30], ya: [30, 30] })); assert(c.carried && c.ya === 'great', `${T}: 30 / 30 is enough; Ya on the great form`); }
    { const c = partyCarry(party(7, { form: 'human' })); assert(c.carried && c.ya === 'human', `${T}: Yuki in her human form carries Ya`); }
    { const c = partyCarry(party(7, { form: 'cat' })); assert(c.carried && c.ya === 'great', `${T}: human form open, Yuki a cat now: she takes the great form for the trip`); }
    // the walks: rt_road [2] (120 min to rt_ambush) and heart_core_after [0] (60 min), no `enter` on either destination
    // (RV1: log_comfort is a quiet walk now, tested below)
    const walk = (id) => { const w = WALKS.find(([wid]) => wid === id); return [w[1], SCENES[id].choices[w[1]]]; };
    for (const id of ['rt_road', 'heart_core_after']) {
        const [i, c] = walk(id);
        { const g = party(1); g.scene = id; g.stats.flown = 4; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
          assert(g.minutes - m0 === c.time && r.lines.includes(fill(FOOT_LINES.yuki[4 % FOOT_LINES.yuki.length], fl, c.time)) && g.stats.flown === 5 && !FLOWN_LINES.some((l) => r.lines.includes(fill(l, fl, c.time))), `${T}: ${id} at Foundation with the party: on foot, ${c.time} min (${g.minutes - m0}), the Yuki line in turn`); }
        { const g = party(2); g.scene = id; g.stats.flown = 2; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
          assert(fl < c.time && g.minutes - m0 === fl && r.lines.includes(fill(CARRY_LINES.great[2 % CARRY_LINES.great.length], fl, c.time)), `${T}: ${id} at Core Formation, both ready: carried, ${fl} min (${g.minutes - m0}), a great-form line`); }
        { const g = party(7, { form: 'human' }); g.scene = id; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
          assert(g.minutes - m0 === fl && r.lines.includes(fill(CARRY_LINES.human[0], fl, c.time)), `${T}: ${id} with Yuki human: carried, a human-form line`); }
        for (const [who, opt] of [['mei', { mei: [10, 50] }], ['ya', { ya: [50, 10] }]]) {
            const g = party(3, opt); g.scene = id; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
            assert(g.minutes - m0 === c.time && r.lines.includes(fill(FOOT_LINES[who][0], fl, c.time)), `${T}: ${id}, ${who} not ready: on foot, the ${who} line`);
        }
        { const g = party(0); g.scene = id; const m0 = g.minutes; const r = choose(g, SCENES, i); assert(g.minutes - m0 === c.time && !pools.some((l) => r.lines.includes(fill(l, c.time, c.time))) && !g.stats.flown, `${T}: ${id} mortal: walked, no line`); }
        { const g = party(1); g.scene = id; const m0 = g.minutes; choose(g, SCENES, i, { task: true }); assert(g.minutes - m0 === c.time && !g.stats.flown, `${T}: ${id} as a card: never a walk line`); }
    }
    // hot_spring [2] "Leave them to it": alone, flown as his own with the party flags set
    { const [i, c] = walk('hot_spring'); assert(c.walkAlone === true && WALKS.filter((w) => w[3] === 'alone').length === 2, `${T}: hot_spring [2] an 'alone' mark (RV1 M1: rt_brawl_won the other)`);
      const g = party(1); g.scene = 'hot_spring'; g.stats.flown = 0; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
      assert(g.minutes - m0 === fl && r.lines.includes(fill(FLOWN_LINES[0], fl, c.time)), `${T}: hot_spring [2] flown alone at Foundation (${g.minutes - m0} of ${c.time})`); }
    // RV1 (the Opus review)
    const { QUIET_LINE } = await import('../js/core/story.js');
    const { realmName } = await import('../js/core/game.js');
    // TG2: the form-bound words, and {min} first in a carried line, {walk} first on foot
    const B2 = "Ya asks how long you'd have taken flying it alone. {min} min, you tell her. She thinks about that for all {walk} min of the walk and arrives angry at the ground.";
    const at = (p, k) => p[k];
    assert(at(CARRY_LINES.great, 0).startsWith('You carry Mei Lin.') && at(CARRY_LINES.great, 2).startsWith('*She steers by the ears,* Yuki reports') && at(CARRY_LINES.great, 3).includes('from your arms')
        && at(CARRY_LINES.human, 0).includes('a head shorter than you') && at(CARRY_LINES.human, 0).includes('You take Mei Lin.') && at(CARRY_LINES.human, 1).includes('Yuki tells Ya, aloud,')
        && at(FOOT_LINES.yuki, 1).includes('the four of you together') && at(FOOT_LINES.yuki, 1).includes('Yuki offers from your shoulder'), `${T} (RV1 TG2): the form-bound words`);
    assert(Object.values(CARRY_LINES).flat().every((l) => l.indexOf('{min}') < l.indexOf('{walk}')) && Object.values(FOOT_LINES).flat().every((l) => l.indexOf('{walk}') < l.indexOf('{min}') || l === B2), `${T} (RV1 TG2): {min} first when carried, {walk} first on foot (v0.11.198 T1: B2 the one exception)`);
    // v0.11.198 (owner pick T1): Fable's B2 asks the flight first and names the walk as the walk; the only on-foot line with {min} first
    assert(FOOT_LINES.yuki.filter((l) => l.indexOf('{min}') < l.indexOf('{walk}')).join() === B2 && /^Ya asks how long you'd have taken flying it alone\. \{min\} min, you tell her\. .*all \{walk\} min of the walk/.test(B2), `${T} (T1): B2 word for word, the only exception`);
    // L4, L5: the reviewer's words
    assert(CARRY_LINES.great[2].includes("Ya, who can't hear it, denies nothing.") && FOOT_LINES.ya[1].endsWith("Yuki's silence has a point to it.") && !pools.some((l) => /says nothing, pointedly/.test(l)), `${T} (RV1 L4, L5): the reviewer's words`);
    // TG3: the form read through yukiForm: a human form below realm 7 is not open, so Ya rides the great form
    { const c = partyCarry(party(2, { form: 'human' })); assert(c.carried && c.ya === 'great', `${T} (RV1 TG3): form 'human' at realm 2 reads as great`); }
    // TG1: the second time spot (no own time: the default move after go): ht_leave [0] → rt_start, carried and on foot
    { const [i] = walk('ht_leave'); assert(SCENES.ht_leave.choices[i].time == null, `${T} (RV1 TG1): ht_leave [0] has no own time`);
      const a = party(1); a.scene = 'ht_leave'; a.stats.flown = 0; const ra = choose(a, SCENES, i);
      assert(ra.lines.some((l) => FOOT_LINES.yuki.some((y) => l === fill(y, 10, 20))) && a.stats.flown === 1 && a.scene === 'rt_start', `${T} (RV1 TG1): ht_leave at Foundation: on foot, the yuki line with 20 / 10`);
      const b = party(2); b.scene = 'ht_leave'; b.stats.flown = 0; const rb = choose(b, SCENES, i);
      assert(rb.lines.includes(fill(CARRY_LINES.great[QUIET_LINE.great], 7, 20)) && b.stats.flown === 1, `${T} (RV1 TG1): ht_leave at Core Formation: carried, 7 of 20 (v0.11.198 RV1 M2: quiet, the calm line)`); }
    // M2: the quiet walks take only the calm line of each pool, whatever the turn
    { const q = WALKS.filter((w) => w[3] === 'quiet').map((w) => w[0]).sort().join(); assert(q === 'ape_won,dw_drowned_won,ht_leave,log_comfort' && JSON.stringify(QUIET_LINE) === '{"great":1,"human":0,"yuki":0,"mei":0,"ya":1}', `${T} (RV1 M2): three quiet walks (${q}), the calm lines`);
      const [i, c] = walk('log_comfort');
      for (const [opt, realm, key, pool] of [[{}, 1, 'yuki', FOOT_LINES], [{}, 2, 'great', CARRY_LINES], [{ form: 'human' }, 7, 'human', CARRY_LINES], [{ mei: [10, 50] }, 2, 'mei', FOOT_LINES], [{ ya: [50, 10] }, 2, 'ya', FOOT_LINES]]) for (const turn of [0, 1, 5]) {
          const g = party(realm, opt); g.scene = 'log_comfort'; g.stats.flown = turn; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
          assert(r.lines.includes(fill(pool[key][QUIET_LINE[key]], fl, c.time)) && g.stats.flown === turn + 1, `${T} (RV1 M2): log_comfort ${key} at turn ${turn}: the calm line`);
      } }
    // M1 + TG6: rt_brawl_won [0] in Ashfall after the Return, the flags set by a real path (rt_start's own enter): flown alone
    { const [i, c] = walk('rt_brawl_won'); assert(c.walkAlone === true && WALKS.filter((w) => w[3] === 'alone').map((w) => w[0]).sort().join() === 'hot_spring,rt_brawl_won', `${T} (RV1 M1): two alone marks`);
      const g = ensureBars(fresh(19799)); g.james.realm = 1; g.yuki.realm = 1; g.minutes = 18 * 1440 + 5 * 60; g.james.satiety = 90; goTo(g, SCENES, 'rt_start');
      assert(g.flags.mei_party && g.flags.ya_party, `${T} (RV1 TG6): rt_start's enter sets the party flags`);
      g.scene = 'rt_brawl_won'; g.stats.flown = 0; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
      assert(g.minutes - m0 >= fl && r.lines.includes(fill(FLOWN_LINES[0], fl, c.time)) && !r.lines.some((l) => /Mei Lin/.test(l)), `${T} (RV1 M1, TG6): rt_brawl_won flown alone, no Mei Lin (${g.minutes - m0})`); }
    // TG4: the FAQ and What's new against the bars
    { const { FAQ } = await import('../js/core/faq.js'); const { NOTES } = await import('../js/core/news.js');
      const fq = FAQ.find(([q]) => q === 'Flight'); const t = typeof fq[1] === 'function' ? fq[1](party(1)) : fq[1];
      const note = NOTES.find(([v]) => v === '0.11.197')[1];
      assert(t.includes(`friendship ${CARRY_F} and affection ${CARRY_A} or more`) && t.includes(`great form (from ${realmName(2)};`) && /ferries them over whatever the numbers say/.test(t), `${T} (RV1 L1, L2, TG4): the FAQ's With company`);
      assert(CARRY_F === CARRY_A && note.includes(`friendship and affection of ${CARRY_F} or more`), `${T} (RV1 TG4): What's new's bar`);
      // the two bars are equal today, so the rendered text can't tell them apart: the source names each (RV-f, an equivalent fault)
      assert(readFileSync(new URL('../js/core/faq.js', import.meta.url), 'utf8').includes('needs friendship ${CARRY_F} and affection ${CARRY_A} or more'), `${T} (RV1 TG4): the FAQ names each bar`); }
    // without the party the old rule: flown, FLOWN_LINES
    { const [i, c] = walk('rt_road'); const g = party(1); delete g.flags.mei_party; delete g.flags.ya_party; g.scene = 'rt_road'; g.stats.flown = 0; const m0 = g.minutes; const r = choose(g, SCENES, i); const fl = flightMinutes(g, c.time);
      assert(g.minutes - m0 === fl && r.lines.includes(fill(FLOWN_LINES[0], fl, c.time)), `${T}: rt_road [2] without the party: flown as before`); }
}

// v0.11.198 (owner picks S1, D1; Fable's words, rule 10): SX, the road home after a carried flight: `party_flew` set by the last
// walk with the women along (story.js `choose`), read by rt_start ¶1, rt_road ¶1–¶3 and rt_ambush ¶1 + Ya's "paced" sentence
// (act1_return.js `SX`); L3, five more lines in the yuki pool (8).
{
    const { flightMinutes } = await import('../js/core/game.js');
    const { FOOT_LINES, QUIET_LINE } = await import('../js/core/story.js');
    const { SX } = await import('../js/story/act1_return.js');
    const { WALKS } = await import('../js/story/walks.js');
    const T = 'SX (198)';
    const party = (realm, { mei = [50, 50], ya = [50, 50], form = 'cat' } = {}) => {
        const g = ensureBars(fresh(19800 + realm)); g.james.realm = realm; g.yuki.realm = realm; g.yuki.form = form;
        g.flags.mei_party = true; g.flags.ya_party = true; g.rel['Mei Lin'] = { f: mei[0], a: mei[1] }; g.rel.Ya = { f: ya[0], a: ya[1] };
        g.minutes = 18 * 1440 + 5 * 60; g.james.satiety = 90; return g;
    };
    const text = (g, id) => { g.scene = id; return sceneView(g, SCENES).text; };
    const walkIdx = (id) => WALKS.find(([w]) => w === id)[1];
    // L3: the pool, Fable's words pinned, the calm line unchanged
    const Y = FOOT_LINES.yuki;
    assert(Y.length === 8 && ['Nobody asks the cat to grow', 'arrives angry at the ground', 'Then we\'re worth the difference', 'I\'d have slept through every one', 'what the air would have charged you alone'].every((w, k) => Y[3 + k].includes(w)) && QUIET_LINE.yuki === 0 && Y[0].startsWith('Yuki weighs what a cat weighs'), `${T} (L3): the yuki pool 8, the five new lines in order, the calm line still [0]`);
    assert(new Set(Y).size === 8 && !Y.some((l) => /\bagain\b|\bfirst\b|\blast\b|this time|\bstill\b|instead of/.test(l)), `${T} (L3): no repeats, no time words`);
    // the flag: set by every walk with company (carried true, on foot false), not by a mortal walk, an alone walk or a card
    { const g = party(1); g.scene = 'rt_road'; choose(g, SCENES, walkIdx('rt_road')); assert(g.flags.party_flew === false && g.scene === 'rt_ambush', `${T}: on foot at Foundation: false`); }
    { const g = party(2); g.scene = 'rt_road'; choose(g, SCENES, walkIdx('rt_road')); assert(g.flags.party_flew === true, `${T}: carried at Core Formation: true`); }
    { const g = party(2, { ya: [50, 10] }); g.flags.party_flew = true; g.scene = 'rt_road'; choose(g, SCENES, walkIdx('rt_road')); assert(g.flags.party_flew === false, `${T}: a walk on foot clears it`); }
    { const g = party(0); g.scene = 'rt_road'; choose(g, SCENES, walkIdx('rt_road')); assert(g.flags.party_flew === undefined, `${T}: a mortal walk leaves it unset`); }
    { const g = party(2); g.scene = 'hot_spring'; choose(g, SCENES, walkIdx('hot_spring')); assert(g.flags.party_flew === undefined, `${T}: an alone walk leaves it unset`); }
    { const g = party(2); g.scene = 'rt_road'; choose(g, SCENES, walkIdx('rt_road'), { task: true }); assert(g.flags.party_flew === undefined, `${T}: a card leaves it unset`); }
    assert(!(await import('../js/core/coil.js')).KEEP_FLAGS.includes('party_flew'), `${T}: not kept across Coils`);
    // the screens, by a real path: ht_leave → rt_start → rt_road → rt_ambush, carried and on foot
    const WALKED = { start: 'You climb out between the roots of the dead tree into a grey morning', road: "Ya's way is no path. It is an opinion", ambush: 'Ya stops dead and you walk into her back.', paced: "They've paced us since the tree." };
    for (const [realm, opt, carried, ride] of [[2, {}, true, 'great'], [7, { form: 'human' }, true, 'human'], [1, {}, false], [2, { mei: [10, 50] }, false], [0, {}, false]]) {
        const g = party(realm, opt); g.scene = 'ht_leave'; choose(g, SCENES, walkIdx('ht_leave'));
        const s = text(g, 'rt_start'); choose(g, SCENES, walkIdx('rt_start')); const r = text(g, 'rt_road'); choose(g, SCENES, walkIdx('rt_road')); const a = text(g, 'rt_ambush');
        const tag = `${T}: realm ${realm} ${JSON.stringify(opt)}`;
        if (carried) {
            assert(s.startsWith(SX.start) && !s.includes(WALKED.start) && s.includes('Ya is ten paces ahead already'), `${tag}: rt_start carried ¶1, ¶2+ unchanged`);
            assert(r === `${SX.road}\n\n${SX[ride]}` && /\*She calls me 'pony',\*|"She calls me 'pony',"/.test(r), `${tag}: rt_road carried, the ${ride} Yuki line`);
            assert(a.startsWith(SX.ambush) && a.includes(`"Three. ${WALKED.paced}" She tests the air`) && !a.includes(WALKED.ambush), `${tag}: rt_ambush carried (RV1 M3: Ya's sentence as before)`);
            const lbl = sceneView((() => { g.scene = 'rt_road'; return g; })(), SCENES).choices.map((c) => c.label);
            assert(lbl.includes('Walk with Ya at the front.') && lbl.includes('Push on toward the birch ridge.'), `${tag}: rt_road's labels stay`);
        } else {
            assert(s.startsWith(WALKED.start) && r.startsWith(WALKED.road) && a.startsWith(WALKED.ambush) && a.includes(WALKED.paced) && ![SX.start, SX.road, SX.ambush].some((x) => (s + r + a).includes(x)), `${tag}: walked, the old texts`);
        }
    }
    // an old save on the road (no flag): the walked texts (RV1 TG3: Ya's sentence too)
    { const g = party(3); delete g.flags.party_flew; const a = text(g, 'rt_ambush'); assert(text(g, 'rt_start').startsWith(WALKED.start) && text(g, 'rt_road').startsWith(WALKED.road) && a.startsWith(WALKED.ambush) && a.includes(WALKED.paced), `${T}: an old save reads walked`); }
    // RV1 (the Opus review)
    // TG1: the words as picked, a fact or two each (M1, L2, L3, L4 the reviewer's words)
    assert(SX.start.includes('blinking like a clutch of things newly hatched') && SX.start.includes('Ya has jumped clear of Yuki before the landing is finished.')
        && SX.road.startsWith("Ya's way is no path, and from the air it is less than one: a gap in the canopy") && SX.road.includes('She points out each landing, and you fly it in hops.') && SX.road.includes('as a landlord inspects a house in arrears')
        && SX.road.includes("\n\nParts of her way, by Ya's lights, have to be walked.") && SX.road.includes('like a woman stepping out of a sedan chair') && SX.road.includes('Ya stops for her without being asked')
        && SX.great.startsWith('Yuki crouches at each landing to let Ya off') && SX.great.includes("*She calls me 'pony',* she tells you. *I am keeping a tally.*")
        && SX.human.startsWith('Yuki sets Ya down at each landing') && SX.human.includes('a head shorter than her cargo') && SX.human.includes('"She calls me \'pony\'," she says. "I am keeping a tally."')
        && SX.ambush.includes('Ya slides to the ground and stops dead, and you, a pace too close behind, walk into her back.')
        && !/steers|Because|and more shorter|landing a pace/.test(Object.values(SX).join(' ')) && !('paced' in SX), `${T} (RV1 TG1, M1, L2, L3, L4): the words as picked`);
    // RV1 (after the planted faults: R2, a word inside ¶2, passed the facts): every word of the five texts pinned (update only with a push that means to change them)
    assert(createHash('sha256').update(JSON.stringify(SX)).digest('hex').slice(0, 16) === '07d2a7774b0c1676', `${T} (RV1 TG1): SX word for word`);
    // TG2: the five lines' form words (the cat through the bond, on James's shoulder)
    assert(Y[3].includes('*Nobody asks the cat to grow,* Yuki says. *I notice that.*') && Y[4].includes("arrives angry at the ground") && Y[5].includes('"Then we\'re worth the difference," she says.')
        && Y[6].includes("*{min} by air,* Yuki says from your shoulder, *and I'd have slept through every one.*") && Y[7].includes('the cat who can is too small to carry either'), `${T} (RV1 TG2): the form words`);
    // TG3 (L1): flown in, then a woman under the bar, Yuki human: the human line by her form
    { const g = party(7, { form: 'human', ya: [29, 50] }); g.flags.party_flew = true; assert(text(g, 'rt_road').endsWith(SX.human), `${T} (RV1 L1, TG3): flew, Ya at 29, Yuki human: the human line`); }
    { const g = party(2, { ya: [29, 50] }); g.flags.party_flew = true; assert(text(g, 'rt_road').endsWith(SX.great), `${T} (RV1 L1, TG3): flew, Ya at 29, Yuki a cat: the great line`); }
    // TG3 (M3): walked from the tree, a talk lifts Ya to 30, the ridge flown: carried ¶1, Ya's sentence as before
    { const g = party(2, { ya: [28, 50] }); g.scene = 'ht_leave'; choose(g, SCENES, walkIdx('ht_leave')); choose(g, SCENES, walkIdx('rt_start'));
      assert(g.flags.party_flew === false && text(g, 'rt_road').startsWith(WALKED.road), `${T} (RV1 M3): walked from the tree`);
      g.rel.Ya.f = 32; g.scene = 'rt_road'; choose(g, SCENES, walkIdx('rt_road')); const a = text(g, 'rt_ambush');
      assert(g.flags.party_flew === true && a.startsWith(SX.ambush) && a.includes(WALKED.paced), `${T} (RV1 M3, TG3): the ridge flown, "paced us since the tree" kept`); }
    // M2 + TG5: ht_leave [0] is quiet (the calm line of each pool) and, like every quiet walk, sets the flag
    { const w = WALKS.find(([id]) => id === 'ht_leave'); assert(w[3] === 'quiet', `${T} (RV1 M2): ht_leave [0] quiet`);
      for (const [realm, opt, key, pool, flag] of [[1, {}, 'yuki', FOOT_LINES, false], [2, {}, 'great', null, true], [7, { form: 'human' }, 'human', null, true]]) for (const turn of [0, 1, 2, 3, 5]) {
          const { CARRY_LINES } = await import('../js/core/story.js'); const P = pool || CARRY_LINES;
          const g = party(realm, opt); g.scene = 'ht_leave'; g.stats.flown = turn; const c = SCENES.ht_leave.choices[walkIdx('ht_leave')]; const r = choose(g, SCENES, walkIdx('ht_leave'));
          const line = P[key][QUIET_LINE[key]].split('{')[0];
          assert(r.lines.some((l) => l.startsWith(line) && (line.length > 0)) && g.flags.party_flew === flag, `${T} (RV1 M2, TG5): ht_leave ${key} at turn ${turn}: the calm line, flag ${flag}`);
      } }
    { const g = party(1); g.scene = 'log_comfort'; g.flags.party_flew = true; choose(g, SCENES, walkIdx('log_comfort')); assert(g.flags.party_flew === false, `${T} (RV1 TG5): log_comfort (quiet) on foot clears the flag`); }
    // D1's fixes: ST (no "steers" on the screen), RA (the original sentence), RU (no reused openers)
    assert(!/steers with/.test(SX.great + SX.human) && SX.ambush.endsWith('She lets it pass without a word, and that tells you how bad it is.') && SX.start.startsWith('You fly up out of') && SX.ambush.startsWith('You land on the birch ridge.'), `${T} (D1): ST, RA, RU`);
    assert(flightMinutes(party(2), 120) < 120, `${T}: sanity, realm 2 flies`);
}

// D1 (the merged text push, owner pick M1 then D1; Fable's, Claude's cuts): A the small text swaps (a1–a12), B part 9's leftovers (b1, b3–b6),
// C Yuki's forms (c1–c3), X the prologue's night; e1, e2, b2, b7 found done before (the docs)
{
    const P = await import('../js/story/prologue.js');
    const Y = await import('../js/story/yuki_path.js');
    const { FLY_LABELS } = await import('../js/story/walks.js');
    const T = 'D1 (merged text push)';
    const SRC = readdirSync(new URL('../js/story/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => readFileSync(new URL(`../js/story/${f}`, import.meta.url), 'utf8')).join('\n');
    const count = (re) => (SRC.match(re) || []).length;
    const G = (seed, realm = 0, form = 'cat') => { const g = ensureBars(newGame(seed)); g.james.realm = realm; g.yuki.realm = realm; g.yuki.form = form; return g; };
    const view = (g, id) => { goTo(g, SCENES, id); return sceneView(g, SCENES).text; };
    const onDay = (g, k) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; return g; }; // as NC1's
    // a1: the flown label; the walking one kept
    assert(FLY_LABELS['mire_lost#0'] === 'Drip your way back to the stream.' && SCENES.mire_lost.choices[0].text(G(97001, 0)) === 'Limp back to the stream.' && SCENES.mire_lost.choices[0].text(G(97002, 1)) === 'Drip your way back to the stream.', `${T}: a1 mire_lost's label by flight`);
    // a2, a3, X: the prologue names the wilds, not Act 1's Blackroot, in these three
    { const g = G(97003); g.flags.ignored = true; const e = view(g, 'elder');
      const g2 = G(97004); g2.flags.forest_day = 2; const n = view(g2, 'night');
      assert(/walked down out of the wilds alive/.test(e) && !/Blackroot/.test(e) && /any branch in the forest/.test(SRC) && !/any branch in the Blackroot/.test(SRC) && count(/Another night in the wilds\./g) === 2 && !/Another night in the Blackroot/.test(SRC) && /Another night in the wilds\./.test(n), `${T}: a2, a3, X no Blackroot in the prologue's elder, wen_lesson and night`); }
    // a4, a5, a11, a12: the tics gone from their lines; the story test's old KNOWN list is empty now
    assert(!/the far side of the hollow|a great deal better than it holds|a great deal more slowly|for a long time without saying anything|for a very long time\.|It is the first time you have seen her need one|a good deal lower down|and for a moment it's almost like working|It will take me a long time/.test(SRC), `${T}: a4, a5, a11, a12 the tics gone`);
    // a6: no loads with a bottomless hammerspace
    assert(!/carry it home in loads/.test(SRC) && /It rides home in the hammerspace as far as the oak hollow, and on your shoulders after that[\s\S]{0,60}This time the hunters meet you at the oak hollow/.test(SRC), `${T}: a6 far_won rides home in the hammerspace to the oak hollow, where the hunters take it (RV1 M1)`);
    // a7: Shen Qiu's crown matches his picture
    assert(count(/red jade crown|crown of red jade/g) === 0 && count(/(small|little) black crown/g) === 4 && /bound up under a small black crown/.test(SCENES.rt_elder.text(G(97007, 2))), `${T}: a7 four black crowns, no red jade (RV1 H1, TG1: rt_elder's arrival too)`);
    // a8: Fang Wei alone robs you alone; the Tans as before
    { const r = G(97005); r.flags.lf_last = 'lf_rogue'; const b = G(97006); b.flags.lf_last = 'lf_bandits';
      const tr = SCENES.lf_human_lost.text(r), tb = SCENES.lf_human_lost.text(b);
      assert(/Fang Wei goes through your pockets by himself/.test(tr) && !/laughter/.test(tr) && /to the sound of laughter about the mortal in white/.test(tb) && !/Fang Wei/.test(tb), `${T}: a8 Fang Wei alone, the Tans as before`); }
    // a9: the snare is sung, on the first day
    assert(DAY_REPLIES['rr_hunt:1'][0].startsWith('Your Convergence sings the snares out of nothing') && DAY_REPLIES['rr_hunt:1'].length === 2, `${T}: a9 the sung snare, the first day`);
    // a10: the later-Coil phrases thinned
    assert(count(/for forty years/g) === 4 && count(/palm flat on/g) === 5 && count(/round your wrist/g) === 6 && count(/lets out a breath she/g) === 1 && count(/[Ss]he comes closer/g) === 0 && !/steps in, rests/.test(SRC), `${T}: a10 forty years 4, palm flat 5, round your wrist 6 (8 before), the shared breath 1, she comes closer 0 (${count(/for forty years/g)}, ${count(/palm flat on/g)}, ${count(/round your wrist/g)})`);
    assert(/I've slept on you every night since\./.test(YK_HERE.first) && /You have never before seen her need one\./.test(YK_HERE.first) && /from much nearer the floor\./.test(YK_HERE.first), `${T}: a10, a11 YK_HERE.first's swaps`);
    // b1: the Blackroot drills' failures, three lines each, different, 8–35 words, by day
    for (const [i, key] of [[1, 'bl_train:1'], [2, 'bl_train:2']]) {
        const L = DAY_REPLIES[`${key}:f`]; const c = SCENES.bl_train.choices[i];
        assert(L?.length === 3 && new Set(L).size === 3 && L.every((x) => x.split(/\s+/).length >= 8 && x.split(/\s+/).length <= 35 && !/yesterday|\d/.test(x)), `${T}: b1 ${key}'s failures, three lines`);
        for (const day of [0, 1, 2]) { const g = G(97010 + day + 3 * i); g.scene = 'bl_train'; onDay(g, day); const out = c.failDo(g); assert(out.length === 1 && out[0] === L[day], `${T}: b1 ${key} failure day ${day + 1} says its line`); }
    }
    // b3, b5: no fire assumed, no yesterday claimed
    assert(/dries under a grey film\. The camp, such as it is, takes it badly\./.test(SRC) && !/The fire spits and sulks/.test(SRC) && DAY_REPLIES['wild_train:0'][1].startsWith('Five paces further back than is sensible') && !DAY_REPLIES['wild_train:0'].some((x) => /yesterday/.test(x)), `${T}: b3 the rain night, b5 the darts`);
    // RV1 (L1, TG4): the second rain text names the fire only when there is one
    { const rain = (fire) => { const g = G(97060 + fire); g.flags.night_ev = 'rain'; if (fire) g.flags.fire = true; onDay(g, 1); g.scene = 'night_event'; return SCENES.night_event.text(g); };
      const a = rain(0), b = rain(1); assert(/first the grey film creeps/.test(a) && !/fire sulks/.test(a) && /first the fire sulks, then the grey film creeps/.test(b), `${T} (RV1 L1, TG4): the rain's second night, fire or none`); }
    assert(/the dark settles beside you like an acquaintance/.test(SRC) && !/dark sits down beside you/.test(SRC) && /for the length of one tissue test/.test(SRC), `${T} (RV1 L5, L6): the night's tic, the tissue test`);
    // the owner's report (19:10): yk_choice had lost its art and place to a comment in v0.11.191; every scene has art now
    { const none = Object.entries(SCENES).filter(([, s]) => s.art === undefined || s.art === null || s.art === '').map(([id]) => id);
      const g = G(97070, 7); g.flags.lf_active = true; const h = G(97071, 7);
      assert(none.length === 0 && SCENES.yk_choice.art === 'yuki_human' && SCENES.yk_choice.place(g) === 'The Long Forest' && SCENES.yk_choice.place(h) === h.location, `${T} (RV1, the art bug): every scene has art (${none.join(', ') || 'none missing'}); yk_choice draws Yuki's picture and its place`); }
    // b4: the litter has porters
    { const g = G(97020); g.flags.gao_broken = true; const t = view(g, 'tribute'); assert(/carried in a litter at the rear, his sword arm bound to his chest and his face grey; at its poles are two porters/.test(t), `${T}: b4 the tribute's litter`); }
    // c1: a later Coil's question straight after a breakthrough the women saw: their line closes the breakthrough screen
    const asker = (seed, back, flags = {}) => { const g = G(seed, 8); Object.assign(g.flags, { bt_return: back, mei_party: true, ya_party: true, yuki_tiger_seen: true, yuki_human_seen: true, yk_last: 'sister' }, flags); return g; };
    for (const [back, flags, w] of [['rr_hub', {}, 'P'], ['heart_hub', {}, 'T'], ['ah_hub', { bl_day: 4 }, 'M']]) {
        const g = asker(97030, back, flags); const t = view(g, 'breakthrough');
        assert(P.btAsksNext(g) && t.endsWith(`\n\n${P.BT_ASK_WOMEN[w]}`), `${T}: c1 ${back}: the breakthrough ends on ${w}`);
        choose(g, SCENES, 0); assert(g.scene === 'yk_choice', `${T}: c1 ${back}: Get up goes to her question (${g.scene})`);
    }
    for (const [why, g] of [['answered this Coil', asker(97040, 'rr_hub', { yk_path: 'sister' })], ['no party', asker(97041, 'rr_hub', { mei_party: false, ya_party: false })], ['the village', asker(97042, 'village')], ['a new form first', asker(97043, 'rr_hub', { yuki_human_seen: false })]]) {
        const t = view(g, 'breakthrough'); assert(!Object.values(P.BT_ASK_WOMEN).some((x) => t.includes(x)), `${T}: c1 none for ${why}`);
    }
    assert(Object.values(P.BT_ASK_WOMEN).every((x) => !/\b(night|dawn|morning|evening|yesterday|tomorrow)\b/i.test(x)) && /no backward glance/.test(P.BT_ASK_WOMEN.P) && /keeps her mouth shut and a firm hold of the tree\.$/.test(P.BT_ASK_WOMEN.T), `${T}: c1 no time words; Claude's cuts`);
    // RV1: L2 none at step F (realms 12–14); TG2 M's speaker is Mei Lin, Ya not in it; L7 "goes off" for every form; L8, M2 the next screen names Yuki
    { const g = asker(97035, 'rr_hub'); g.james.realm = 12; g.yuki.realm = 12; const t = view(g, 'breakthrough'); assert(P.btAsksNext(g) && !Object.values(P.BT_ASK_WOMEN).some((x) => t.includes(x)), `${T} (RV1 L2): c1 none at realm 12 (step F)`); }
    assert(/"Go on," Mei Lin says\./.test(P.BT_ASK_WOMEN.M) && !/\bYa\b/.test(P.BT_ASK_WOMEN.M) && /\bYa\b/.test(P.BT_ASK_WOMEN.P) && /^Yuki goes off along the lip/.test(P.BT_ASK_WOMEN.T), `${T} (RV1 TG2, L7): M is Mei Lin's alone; T "goes off"`);
    assert(/^Yuki waits until no one is close enough to overhear/.test(Y.YK_LATER.q.lover) && Object.values(Y.YK_LATER.q).every((x) => /^(Yuki|The fire)/.test(x)) && /Yuki exhales, like someone spending a ration\./.test(Y.YK_LATER.afterWait.sister), `${T} (RV1 M2, L8): every later question opens on Yuki, not "She"; the ration`);
    // c2: Act 1's Ashfall street at the great form; the prologue's village keeps its own; none elsewhere
    for (const back of ['fo_ashfall', 'rt_ashfall']) {
        const g = G(97050, 2); Object.assign(g.flags, { bt_return: back, yuki_return: back }); const t = view(g, 'yuki_tiger_awaken');
        assert(t.includes(`\n\n${P.AWAKE_A1_ASHFALL}\n\nThen Yuki is eleven pounds again`) && !t.includes(P.AWAKE_VILLAGE), `${T}: c2 ${back}: the street's paragraph, then "Then Yuki"`);
    }
    { const g = G(97052, 2); Object.assign(g.flags, { bt_return: 'village', yuki_return: 'village' }); const t = view(g, 'yuki_tiger_awaken'); assert(t.includes(P.AWAKE_VILLAGE) && !t.includes(P.AWAKE_A1_ASHFALL), `${T}: c2 the prologue's village keeps AWAKE_VILLAGE`); }
    { const g = G(97053, 2); Object.assign(g.flags, { bt_return: 'fo_ashfall', yuki_return: 'rr_hub' }); const t = view(g, 'yuki_tiger_awaken'); assert(!t.includes(P.AWAKE_A1_ASHFALL), `${T}: c2 none when the form scene doesn't follow that breakthrough`); }
    { const g = G(97054, 7); Object.assign(g.flags, { bt_return: 'fo_ashfall', yuki_return: 'fo_ashfall', yuki_tiger_seen: true }); const t = view(g, 'yuki_human_awaken'); assert(!t.includes(P.AWAKE_A1_ASHFALL) && !t.includes(P.AWAKE_VILLAGE), `${T} (RV1 TG3): c2 never in the human form's scene`); }
    assert(!/Old Hu|once already|watched the sky/.test(P.AWAKE_A1_ASHFALL) && /^The street, already silent, stays so in good order; nobody screams\./.test(P.AWAKE_A1_ASHFALL), `${T}: c2 Claude's cuts (no Old Hu, who is only in the Fallout; RV1 L3: no restating the closer before)`);
}

// v0.11.203 (owner pick T1, TS1 + TS8): the long calendar behind the test switch (js/core/calendar.js). Old saves and plain new games keep
// the old calendar (every helper the identity); a long-calendar game keeps `cal` through saves and both rewinds; the stays are weeks.
{
    const C = await import('../js/core/calendar.js');
    const W = await import('../js/story/wilds.js');
    const A = await import('../js/story/ashfall.js');
    const { FAQ } = await import('../js/core/faq.js');
    const { inAct1 } = await import('../js/core/game.js');
    const T = 'TS1 (the long calendar)';
    const old = ensureBars(newGame(98001, { closed: true })), lg = ensureBars(newGame(98002, { closed: true, cal: C.LONG_CAL }));
    assert(!('cal' in old) && lg.cal === 7 && !C.longCal(old) && C.longCal(lg), `${T}: plain New game has no cal; the switch's game has cal 7`);
    let id = true; for (let d = 1; d <= 30; d++) id = id && C.calStart(old, d) === d && C.calEnd(old, d) === d && C.storyDayOf(old, d) === d; assert(id, `${T}: the old calendar is the identity (Days 1–30)`);
    const starts = [[1, 1], [2, 8], [4, 22], [7, 43], [8, 44], [10, 58], [11, 65], [15, 69], [16, 70], [19, 91], [20, 92], [21, 93], [22, 94]];
    assert(starts.every(([d, c]) => C.calStart(lg, d) === c), `${T}: story days to calendar days (${starts.map(([d]) => `${d}→${C.calStart(lg, d)}`).join(' ')})`);
    const back = [[7, 1], [21, 3], [22, 4], [42, 6], [43, 7], [44, 8], [64, 10], [65, 11], [90, 18], [91, 19], [93, 21], [94, 22]];
    assert(back.every(([c, d]) => C.storyDayOf(lg, c) === d), `${T}: calendar days back to story days (${back.map(([c]) => `${c}→${C.storyDayOf(lg, c)}`).join(' ')})`);
    assert(C.calMinutes(old, 8, 6) === 7 * 1440 + 360 && C.calMinutes(lg, 8, 6) === 43 * 1440 + 360, `${T}: Act 1's first dawn: Day 8 / Day 44`);
    // the save and the rewinds keep it
    { const g2 = deserialize(serialize(lg)); assert(g2.cal === 7, `${T}: a save keeps cal`); const o2 = deserialize(serialize(old)); assert(!('cal' in o2), `${T}: an old-calendar save gets no cal`); }
    { const g = ensureBars(newGame(98003, { closed: true, cal: 7 })); g.minutes += 3 * 1440; rewind(g); assert(g.cal === 7 && g.minutes === newGame(1).minutes, `${T}: the act's rewind keeps cal (and the first dawn)`); }
    { const g = ensureBars(newGame(98004, { closed: true, cal: 7 })); g.coil.act = 1; g.flags.ending = 'paid'; rewind(g, { to: 'game' }); assert(g.cal === 7, `${T}: the whole game's rewind keeps cal`); }
    // inAct1 at the long calendar's Day 44
    { const g = ensureBars(newGame(98005, { closed: true, cal: 7 })); g.flags.ending = 'paid'; g.scene = 'fo_start'; g.minutes = C.calMinutes(g, 8, 6) - 1; const before = inAct1(g); g.minutes += 1; assert(!before && inAct1(g), `${T}: Act 1 from Day 44 06:00`); }
    // the wilds: six quiet nights, then the story's night; forest_day once a week; the old calendar's night 1 is an event
    const nightsOf = (g) => { const out = []; for (let k = 0; k < 21; k++) { goTo(g, SCENES, 'night'); const nx = W.nightNext(g); out.push(nx); goTo(g, SCENES, 'morning'); } return out; };
    { const g = ensureBars(newGame(98006, { closed: true, cal: 7 })); g.minutes = 21 * 60; const n = nightsOf(g); const story = n.map((x, i) => [x, i]).filter(([x]) => x !== 'morning').map(([x, i]) => `${i + 1}:${x}`);
      assert(story.join(' ') === '7:night_event 14:night_event 21:night_attack', `${T}: the forest's story nights on nights 7, 14 and 21 (${story.join(' ')})`);
      assert(g.flags.forest_day === 4 && g.flags.long === true, `${T}: forest_day once a week, and a quiet night makes the long road (${g.flags.forest_day})`); }
    { const g = ensureBars(newGame(98007, { closed: true })); g.minutes = 21 * 60; goTo(g, SCENES, 'night'); assert(W.nightNext(g) === 'night_event', `${T}: the old calendar's first night is the event`); goTo(g, SCENES, 'morning'); assert(g.flags.forest_day === 2 && !('cal_night' in g.flags), `${T}: the old calendar's morning turns the day, no cal_night`); }
    // the village: the arson on vday 2's seventh night; the eve of the tribute on vday 3's seventh night
    { const g = ensureBars(newGame(98008, { closed: true, cal: 7 })); g.flags.long = true; goTo(g, SCENES, 'village'); assert(g.flags.vday === 1 && g.flags.cal_night === 0, `${T}: the village's first week starts at night 0`);
      const ev = []; for (let k = 0; k < 21; k++) { if (k >= 7 && k < 14) ev.push(SCENES.village_night.enter ? (A.nextEvening(g) === 'supper' && sceneView((goTo(g, SCENES, 'village_night'), g), SCENES).choices.some((c) => /Sleep\./.test(c.label)) ? 'q' : 'A') : '?'); else ev.push(A.nextEvening(g) === 'supper' ? 's' : 'E'); g.minutes = Math.floor(g.minutes / 1440) * 1440 + 21 * 60; goTo(g, SCENES, 'village_morning'); }
      assert(ev.join('') === 'sssssssqqqqqqAssssssE', `${T}: the village's three weeks: suppers, the arson on night 14, the eve on night 21 (${ev.join('')})`); }
    // the Fallout and the Heart by the story's day
    { const g = ensureBars(newGame(98009, { closed: true, cal: 7 })); g.flags.ending = 'paid';
      for (const [cal, d] of [[44, 8], [50, 8], [51, 9], [58, 10], [64, 10]]) { g.minutes = (cal - 1) * 1440 + 17 * 60; goTo(g, SCENES, 'fo_ashfall'); const ev = sceneView(g, SCENES).choices.find((c) => /^Evening/.test(c.label))?.label || ''; assert(/The last one in Ashfall/.test(ev) === (cal === 64), `${T}: Day ${cal} (story ${d}): the farewell only on its last week's last day (${ev})`); } }
    { const g = ensureBars(newGame(98010, { closed: true, cal: 7 })); g.minutes = (90 - 1) * 1440 + 8 * 60; goTo(g, SCENES, 'heart_hub'); const a = sceneView(g, SCENES).choices.some((c) => /^Explore the ring/.test(c.label)); g.minutes = (91 - 1) * 1440 + 8 * 60; goTo(g, SCENES, 'heart_hub'); const b = sceneView(g, SCENES).choices.some((c) => /^Explore the ring/.test(c.label)); assert(a && !b, `${T}: the Heart's last day is Day 90; from Day 91 (story 19) only the way on`); }
    // RV1 (the planted faults F4, F10, F12, F15, F16): the jumps between parts and the slots by the story's day
    { const g = ensureBars(newGame(98011, { closed: true, cal: 7 })); g.flags.long = true; g.flags.cal_night = 6; goTo(g, SCENES, 'village'); assert(g.flags.cal_night === 0 && C.storyNight(g) === false, `${T}: the forest's last night count does not leak into the village (F4)`); }
    for (const [cal, want] of [[0, 11], [7, 65]]) { const g = ensureBars(newGame(98012, { closed: true, cal })); g.flags.ending = 'paid'; g.minutes = (C.calEnd(g, 10) - 1) * 1440 + 20 * 60; goTo(g, SCENES, 'fo_depart'); const i = sceneView(g, SCENES).choices.findIndex((c) => /^Into the Blackroot/.test(c.label)); choose(g, SCENES, i);
      assert(g.scene === 'bl_start' && clockParts(g.minutes).day === want && clockParts(g.minutes).hh === 6, `${T}: the Blackroot starts on Day ${want} at 06:00 (${cal ? 'long' : 'old'} calendar; F10; Day ${clockParts(g.minutes).day})`); }
    for (const [cal, want] of [[0, 8], [7, 44]]) { const g = ensureBars(newGame(98013, { closed: true, cal })); g.flags.ending = 'paid'; g.minutes = 6 * 1440 + 18 * 60; goTo(g, SCENES, 'epilogue'); const i = sceneView(g, SCENES).choices.findIndex((c) => /^Act 1: The Hearth Tree/.test(c.label)); choose(g, SCENES, i);
      assert(clockParts(g.minutes).day === want && clockParts(g.minutes).hh === 6, `${T}: Act 1 starts on Day ${want} (${cal ? 'long' : 'old'} calendar; F12; Day ${clockParts(g.minutes).day})`); }
    for (const [cal, want] of [[0, 4], [7, 22]]) { const g = ensureBars(newGame(98014, { closed: true, cal })); g.flags.lf_active = true; goTo(g, SCENES, 'lf_exit'); const v = sceneView(g, SCENES); const i = v.choices.findIndex((c) => /^Walk toward the smoke/.test(c.label)); const lab = v.choices[i]?.label || ''; choose(g, SCENES, i);
      assert(clockParts(g.minutes).day === want && lab.includes(`(Day ${want} begins.)`) && g.flags.forest_day === 3, `${T}: the Long Forest's way back: Day ${want} (${cal ? 'long' : 'old'} calendar; F15; Day ${clockParts(g.minutes).day}, "${lab}")`); }
    { const g = ensureBars(newGame(98015, { closed: true, cal: 7 })); g.flags.ending = 'paid'; const got = [44, 50, 51, 57, 58, 64].map((cal) => { g.minutes = (cal - 1) * 1440 + 12 * 60; return HT_HUBS.fo_ashfall[0](g); });
      assert(got.join() === 'fo_ashfall:1,fo_ashfall:1,fo_ashfall:2,fo_ashfall:2,fo_ashfall:3,fo_ashfall:3', `${T}: the Fallout's house-time slots by the story's day (F16; ${got.join()})`); }
    // RV1 (TG2, TG7): 20 random games on each calendar, played as the games above: within a Coil the clock never goes back, and the
    // Blackroot, the Heart and the road home start on their story days (11, 16, 19 or 20: the Heart's leave waits for the next dawn after 09:00)
    { const starts = { 0: {}, 7: {} }; let back = 0, stuck = 0, ended = 0;
      for (const cal of [0, 7]) for (let run = 0; run < 20; run++) {
        rs = seedOf(run, 31 + cal); const g = ensureBars(newGame(run + 98100, { closed: true, cal })); let key = '', last = g.minutes, k = 0; const met = new Set();
        for (; k < 40000; k++) {
            const ck = `${g.coil.act || 0}:${g.coil.n}`; if (ck !== key) { key = ck; last = g.minutes; met.clear(); }
            if (g.minutes < last) back++; last = g.minutes;
            for (const [id, want] of [['bl_start', 'bl'], ['ht_start', 'ht'], ['rt_start', 'rt']]) if (g.scene === id && !met.has(id)) { met.add(id); const d = C.storyDay(g); starts[cal][`${want}${d}`] = (starts[cal][`${want}${d}`] || 0) + 1; }
            const v = sceneView(g, SCENES); if (v.end || g.scene === 'a1_end') { ended++; break; }
            const open = v.choices.filter((c) => !c.disabled && !/Stay lost|whole game/.test(c.label)); if (!open.length) break;
            const r = choose(g, SCENES, open[rnd(open.length)].index);
            if (r?.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const out = combatStep(g, smartAction(g, t)); if (out?.done) { goTo(g, SCENES, out.next); break; } } }
        }
        if (k >= 40000) stuck++;
      }
      const keys = (o) => Object.keys(o).sort().join(' ');
      const ok = (o) => Object.keys(o).every((x) => ['bl11', 'ht16', 'rt19', 'rt20'].includes(x)) && o.bl11 > 0 && o.ht16 > 0 && (o.rt19 || 0) + (o.rt20 || 0) > 0;
      assert(!back && !stuck && ended === 40, `${T} (RV1, TG7): 40 random games end, the clock never goes back within a Coil (back ${back}, stuck ${stuck}, ended ${ended})`);
      assert(ok(starts[0]) && ok(starts[7]), `${T} (RV1, TG2): the Blackroot, the Heart and the road home start on story days 11, 16, 19–20 in both calendars (old: ${keys(starts[0])}; long: ${keys(starts[7])})`); }
    // the FAQ and the menu
    { const goal = FAQ.find(([q]) => q === 'What is the goal?')[1], a1 = FAQ.find(([q]) => q === 'Act 1')[1]; assert(/tribute on Day 7\./.test(goal(old)) && /tribute on Day 43\./.test(goal(lg)) && /Day 8 .*Day 21\./.test(a1(old)) && /Day 44 .*Day 93\./.test(a1(lg)), `${T}: the FAQ's days by the save's calendar`); }
    { const M = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); assert(/data-new="long">New game: the long calendar \(test\)/.test(M) && /freshGame\(b\.dataset\.new === 'long' \? LONG_CAL : 0\)/.test(M), `${T}: the main menu's test switch`); }
}

// v0.11.204 (owner pick W1; roadmap-time.md TS2 + TS3): the week on the long calendar (js/core/tasks.js S1, R1, R2; js/core/week.js R3, P1).
// The old calendar: no week's card, no routine, no fold, no plan (every helper returns early).
{
    const Tk = await import('../js/core/tasks.js');
    const Wk = await import('../js/core/week.js');
    const C = await import('../js/core/calendar.js');
    const T = 'W1 (the week)';
    const at = (cal, seed = 99001) => { const g = ensureBars(newGame(seed, { closed: true, cal })); goTo(g, SCENES, 'wilds'); g.minutes = 1440 + 7 * 60; g.james.satiety = 50; g.inventory.hare_raw = 3; g.james.qi = 20; return g; };
    // S1: ×7 the time, today's share to the evening hour, the rest carried; the result once, as on the old calendar
    { const o = at(0), l = at(7); const mo = o.minutes, ml = l.minutes;
      const ro = runTask(o, SCENES, 'wild_forage:1'), rl = runTask(l, SCENES, 'wild_forage:1');
      const once = o.minutes - mo, cy = l.tasks.carries?.['wild_forage:1']; // v0.11.215 (CF1, UB): one record per card
      assert(!CY(o) && !o.tasks.routine && !ro.lines.some((x) => /^(Breakfast|Midday|Supper):|day's sit|A week's work/.test(x)), `${T}: the old calendar: no carry, no routine (${ro.lines.slice(0, 3).join(' | ')})`);
      assert(cy && cy.id === 'wild_forage:1' && cy.total === once * Tk.WEEK_MULT && cy.left > 0 && cy.left < cy.total && rl.lines.some((x) => /^A week's work: /.test(x)), `${T}: a week's card is ×7 its time, the rest carried (${once} min → ${cy?.total}, ${cy?.left} left)`);
      assert(clockParts(l.minutes).hh === 15 && clockParts(l.minutes).mm === 0, `${T}: today's share ends at the wilds' evening hour (15:00; ${clockParts(l.minutes).hh}:${clockParts(l.minutes).mm})`);
      // v0.11.215 (FP1, FS): a food card pays at its start, as on the old calendar; its work goes on already paid
      assert((l.inventory.river_cress || 0) === (o.inventory.river_cress || 0) && l.tasks.fam['wild_forage:1'] === o.tasks.fam['wild_forage:1'] && cy.paid === true && Tk.foodCard(SCENES.wild_forage.choices[1]), `${T} (FP1, FS): a food card's result and familiarity at its start, as on the old calendar (cress ${o.inventory.river_cress}/${l.inventory.river_cress})`);
      const gid = Tk.carryTaskId('wild_forage:1');
      { const cards = taskCards(l, SCENES), carry = cards.find((c) => c.id === gid);
        assert(carry && carry.status === 'evening' && !/then its result/.test(carry.tag) && cards.filter((c) => c.week && c.status === 'busy').length === 0, `${T} (CF1, UB): no other card waits behind it; its Go on waits for the morning (${carry?.status}, ${carry?.tag})`); }
      l.minutes = 2 * 1440 + 7 * 60; const left0 = l.tasks.carries['wild_forage:1'].left; const r2 = runTask(l, SCENES, gid);
      assert(r2.lines.some((x) => /still to go|done, /.test(x)) && (!l.tasks.carries['wild_forage:1'] || l.tasks.carries['wild_forage:1'].left < left0), `${T}: "Go on" works the next day's share (${left0} → ${l.tasks.carries['wild_forage:1']?.left ?? 0})`);
      let r3 = null; if (l.tasks.carries['wild_forage:1']) { l.minutes = 3 * 1440 + 7 * 60; r3 = runTask(l, SCENES, gid); }
      assert(!l.tasks.carries['wild_forage:1'] && (l.inventory.river_cress || 0) === (o.inventory.river_cress || 0) && !(r3 || r2).lines.some((x) => /\+\d+ River cress/.test(x)), `${T} (FP1): its end pays nothing more (cress ${l.inventory.river_cress})`); }
    // v0.11.215 (owner pick CF1, RE + UB + BL): a card that gives no food (Practice) pays when its work is done; only its own card waits
    { const o = at(0, 99011), l = at(7, 99011); l.tasks.routine = { d: Tk.workDay(l), meals: 'bls', sit: true }; const x0 = JSON.stringify(l.james.skills); // the day's sit done: its XP apart
      runTask(o, SCENES, 'wild_train:1'); const rl = runTask(l, SCENES, 'wild_train:1'); const cy = l.tasks.carries?.['wild_train:1'];
      assert(cy && cy.paid === false && !l.tasks.fam['wild_train:1'] && JSON.stringify(l.james.skills) === x0 && !rl.lines.some((x) => / \/ DC /.test(x)) && rl.lines.some((x) => /its result when it is done/.test(x)) && !Tk.foodCard(SCENES.wild_train.choices[1]), `${T} (CF1, RE): nothing at the start: no check, no XP, no familiarity (${rl.lines.slice(-2).join(' | ')})`);
      l.minutes = 1440 + 9 * 60; delete l.tasks.routine; // a second card the same day? the first took the day: tomorrow
      const gid = Tk.carryTaskId('wild_train:1'), cards = taskCards(l, SCENES), busy = cards.filter((c) => c.week && c.status === 'busy').map((c) => c.id), carry = cards.find((c) => c.id === gid);
      assert(busy.join() === 'wild_train:1' && /its work goes on, .* to go/.test(cards.find((c) => c.id === 'wild_train:1').busy) && /then its result/.test(carry?.tag || '') && cards.some((c) => c.week && c.id !== 'wild_train:1' && c.status === 'open'), `${T} (CF1, UB + BL): only its own card waits, saying how long; the other week's cards open (${busy.join()}; ${carry?.tag})`);
      let last = null; for (let d = 2; d < 8 && l.tasks.carries?.['wild_train:1']; d++) { l.minutes = d * 1440 + 7 * 60; delete l.tasks.routine; last = runTask(l, SCENES, gid); }
      assert(!l.tasks.carries['wild_train:1'] && last.lines.some((x) => / \/ DC /.test(x)) && last.lines.some((x) => /: done, .* in all\./.test(x)) && l.tasks.fam['wild_train:1'] === o.tasks.fam['wild_train:1'], `${T} (CF1, RE): at its end the check, XP and familiarity, once (fam ${l.tasks.fam['wild_train:1']} / ${o.tasks.fam['wild_train:1']}; ${last?.lines.slice(-3).join(' | ')})`);
      const p = deserialize(serialize(l)); assert(p.tasks.routine && p.cal === 7, `${T}: the routine's record goes through a save`); }
    // the carry is dropped off its stay and by the rewind; never shown on another hub
    { const l = at(7, 99002); runTask(l, SCENES, 'wild_hunt:2'); assert(!!l.tasks.carries?.['wild_hunt:2'], `${T}: a hunt is a week's card too`);
      const s2 = deserialize(serialize(l)); assert(s2.tasks.carries?.['wild_hunt:2']?.id === 'wild_hunt:2', `${T}: the carry goes through a save`);
      goTo(l, SCENES, 'ashfall'); assert(!Tk.carryHere(l) && !taskCards(l, SCENES).some((c) => Tk.isCarryTask(c.id)), `${T}: not on another hub`);
      const g3 = at(7, 99003); runTask(g3, SCENES, 'wild_forage:1'); rewind(g3); assert(!g3.tasks.carries && !CY(g3) && !g3.tasks.plan && !g3.tasks.routine, `${T}: a rewind drops the week`); }
    // the Blackroot is a journey: its cards keep their time
    { const g = ensureBars(newGame(99004, { closed: true, cal: 7 })); g.flags.ending = 'paid'; g.minutes = (C.calStart(g, 12) - 1) * 1440 + 7 * 60; goTo(g, SCENES, 'rr_hub');
      assert(!Tk.weekHub(g) && !taskCards(g, SCENES).some((c) => c.week), `${T}: the Blackroot's cards are not week's cards (Day ${clockParts(g.minutes).day})`); }
    // the Fallout's: a week's card by the story's day
    { const g = ensureBars(newGame(99005, { closed: true, cal: 7 })); g.flags.ending = 'paid'; g.minutes = 50 * 1440 + 7 * 60; goTo(g, SCENES, 'fo_ashfall');
      assert(Tk.weekHub(g) && taskCards(g, SCENES).some((c) => c.week && /^fo_palisade:/.test(c.id)), `${T}: the Fallout's Palisade is a week's card`); }
    // R1 + R2: a meal in each part of the day when Fed is under 85, the day's sit once
    { const g = at(7, 99006); const r = runTask(g, SCENES, 'wild_train:1');
      assert(r.lines.some((x) => /^Breakfast: /.test(x)) && r.lines.some((x) => /day's sit/.test(x)), `${T}: the first card of the day brings breakfast and the day's sit`);
      g.tasks.carries = {}; g.minutes = 1440 + 9 * 60; g.james.satiety = 40; const r2 = runTask(g, SCENES, 'wild_train:2');
      assert(!r2.lines.some((x) => /^Breakfast: |day's sit/.test(x)), `${T}: once a part of the day, the sit once a day`);
      g.tasks.carries = {}; g.minutes = 1440 + 12 * 60; g.james.satiety = 90; const r3 = runTask(g, SCENES, 'wild_train:3');
      assert(!r3.lines.some((x) => /^Midday: /.test(x)), `${T}: no meal at Fed 90`);
      const s = at(7, 99007); const before = s.james.saturation; const rs1 = runTask(s, SCENES, Tk.sitTaskId(s, SCENES)); assert(!rs1.lines.some((x) => /day's sit/.test(x)) && s.tasks.routine.sit === true, `${T}: a sit card first: no extra sit (Saturation ${before} → ${s.james.saturation})`); }
    // R3: a quiet night folds once its screens were shown; an event's text does not; the old calendar never folds
    { const g = ensureBars(newGame(99008, { closed: true, cal: 7 })); g.flags.ending = 'paid'; g.flags.palisade = true; g.flags.wolf = 'driven'; g.minutes = 44 * 1440 + 22 * 60;
      goTo(g, SCENES, 'fo_night'); const f1 = Wk.foldNight(g, SCENES); assert(f1.steps === 0 && g.scene === 'fo_night', `${T}: a night's first showing is shown (${g.scene})`);
      const i = sceneView(g, SCENES).choices.find((c) => !c.disabled).index; choose(g, SCENES, i); const f2 = Wk.foldNight(g, SCENES); assert(g.scene === 'fo_morning' && f2.steps === 0, `${T}: the morning's first showing too`);
      g.minutes = 45 * 1440 + 22 * 60; goTo(g, SCENES, 'fo_night'); const f3 = Wk.foldNight(g, SCENES);
      assert(f3.steps === 2 && g.scene === 'fo_ashfall', `${T}: the next quiet night walks to the village at once (${f3.steps} steps, ${g.scene}; the day's numbers aside)`);
      const o = ensureBars(newGame(99009, { closed: true })); o.flags.ending = 'paid'; o.flags.palisade = true; o.flags.wolf = 'driven'; goTo(o, SCENES, 'fo_night'); o.tasks.nf = { fo_night: 'x' }; const fo = Wk.foldNight(o, SCENES); assert(fo.steps === 0 && o.scene === 'fo_night', `${T}: the old calendar never folds`); }
    // P1: the plan runs day by day to the evening's choice, goes on, and ends with the week; the clock never goes back
    { const g = at(7, 99010); Tk.setYuki(g, true); const pc = Wk.planCards(g, SCENES); assert(pc.length >= 6, `${T}: the plan lists the week's cards (${pc.length})`);
      for (const c of pc.slice(0, 3)) Wk.planSet(g, c.id, 1); Wk.planSet(g, 'med:mer', 1); Wk.planSet(g, 'med:sit', 99);
      assert(g.tasks.plan.med.sit === Wk.MED_MAX.sit && Wk.planSet(g, pc[0].id, -3) && !(pc[0].id in g.tasks.plan.items), `${T}: counts stay in range`); Wk.planSet(g, pc[0].id, 1);
      const o = ensureBars(newGame(99011, { closed: true })); goTo(o, SCENES, 'wilds'); assert(!Wk.planEnsure(o) && Wk.runWeek(o, SCENES).stop === 'left', `${T}: no plan on the old calendar`);
      let stops = [], last = g.minutes, back = 0, k = 0;
      for (; k < 30; k++) {
        const r = Wk.runWeek(g, SCENES); stops.push(r.stop); if (g.minutes < last) back++; last = g.minutes;
        if (r.stop === 'week' || r.stop === 'stuck') break;
        if (r.stop !== 'evening') { if (r.stop === 'breakthrough' || r.stop === 'hurt') { g.james.hp = jamesHpMax(g); continue; } break; }
        for (let j = 0; j < 8 && g.scene !== 'wilds'; j++) { if (Wk.foldNight(g, SCENES).steps && g.scene === 'wilds') break; const v = sceneView(g, SCENES); const op = v.choices.filter((c) => !c.disabled && !/change form/.test(c.label)); if (!op.length) break; const r2 = choose(g, SCENES, op[op.length - 1].index); if (r2?.combat) { startCombat(g, r2.combat(g)); for (let t = 0; t < 400 && g.combat; t++) { const out = combatStep(g, smartAction(g, t)); if (out?.done) { goTo(g, SCENES, out.next); break; } } } }
        if (g.scene === 'wilds') Wk.foldNight(g, SCENES);
      }
      assert(stops.at(-1) === 'week' && !back && Object.keys(g.tasks.plan.items).length === 0, `${T}: the plan ends with its week, every card run, the clock forward (${stops.join(' ')})`);
      assert(stops.filter((x) => x === 'evening').length >= 5, `${T}: it stops for the camp's night (watch or sleep) and goes on (${stops.filter((x) => x === 'evening').length})`);
      const p2 = Wk.planEnsure(g); assert(p2 && Wk.planEmpty(p2) && p2.lastDay > g.tasks.plan.lastDay - 7 && Wk.runWeek(g, SCENES).days.some((d) => d.lines.includes('The rest of the day off.')), `${T}: an empty plan rests out the next week`); }
    // RV1 (the Opus review's H1, M1, M2, L1–L7 and TG1–TG11)
    { const R = 'W1 RV1';
      const fresh = (seed, h = 7, m = 0, day = 1) => { const g = at(7, seed); g.minutes = day * 1440 + h * 60 + m; return g; };
      // TG1 (H1): "Go on" as the day's first card mid-afternoon: the meal and the sit run, the card is not run and says so; no throw
      { const g = fresh(99101); runTask(g, SCENES, 'wild_forage:1'); g.minutes = 2 * 1440 + 14 * 60 + 30; g.james.qi = 20; g.james.satiety = 50; const left = CY(g).left;
        let out = null, err = null; try { taskOutcome(g, SCENES, Tk.CARRY_TASK); } catch (e) { err = e; } try { out = runTask(g, SCENES, Tk.CARRY_TASK); } catch (e) { err = e; }
        assert(!err && out?.skipped && out.lines.includes(Tk.SKIP_LINE) && CY(g).left === left, `${R} (TG1, H1): "Go on" after the day's sit pushed past evening: skipped, said, the carry kept (${err?.message || out?.lines?.slice(-1)})`); }
      // TG2 (M1): Yuki's lane counts the minutes once with the day's sit (her job made too long to haul, for the count)
      { const job = TASK_HUBS.wilds.yuki, len0 = job.minutes; job.minutes = 1e6;
        try { const g = fresh(99102); Tk.setYuki(g, true); g.tasks.yuki.progress = 0; const m0 = g.minutes; runTask(g, SCENES, 'wild_train:1');
          assert(g.tasks.yuki.progress === g.minutes - m0, `${R} (TG2, M1): Yuki's progress is the minutes passed (${g.tasks.yuki.progress} / ${g.minutes - m0})`); } finally { job.minutes = len0; } }
      // TG3 (M2, the stops): an empty plan rests out a week with food and never starves; the hungry, hurt and breakthrough stops
      { const g = fresh(99103); g.inventory.smoked_meat = 12; Wk.planEnsure(g); /* v0.11.209 (TF1, S): kept food (raw hare spoils in 3 days) */ let low = 100, ate = 0;
        for (let k = 0; k < 20; k++) { const r = Wk.runWeek(g, SCENES); ate += r.days.reduce((a, d) => a + d.lines.filter((x) => /^(Breakfast|Midday|Supper): /.test(x)).length, 0); low = Math.min(low, g.james.satiety);
          if (r.stop === 'week' || r.stop === 'stuck' || g.scene === 'wilds') { if (r.stop === 'week' || r.stop === 'stuck') break; }
          for (let j = 0; j < 8 && g.scene !== 'wilds'; j++) { const v = sceneView(g, SCENES); const op = v.choices.filter((c) => !c.disabled && !/change form/.test(c.label)); if (!op.length) break; choose(g, SCENES, op[op.length - 1].index); Wk.foldNight(g, SCENES); low = Math.min(low, g.james.satiety); } }
        assert(low > 0 && ate >= 7, `${R} (TG3, M2): resting out a week with food: meals on the days off, Fed never 0 (lowest ${Math.round(low)}, ${ate} meals)`); }
      { const g = fresh(99104); g.inventory = {}; g.james.satiety = 20; Wk.planSet(g, 'wild_train:1', 1); assert(Wk.runWeek(g, SCENES).stop === 'hungry', `${R} (TG3): Fed under 30 with no food stops it`);
        const h = fresh(99105); h.james.hp = 0.5 * jamesHpMax(h); Wk.planSet(h, 'wild_train:1', 1); assert(Wk.runWeek(h, SCENES).stop === 'hurt', `${R} (TG3): HP under 60% stops it`);
        const b = ensureBars(newGame(99106, { closed: false, cal: 7 })); goTo(b, SCENES, 'wilds'); b.minutes = 1440 + 7 * 60; b.inventory.hare_raw = 3; b.james.saturation = 100; Wk.planSet(b, 'wild_train:1', 1); const r1 = Wk.runWeek(b, SCENES).stop; const r2 = Wk.runWeek(b, SCENES).stop;
        assert(r1 === 'breakthrough' && r2 !== 'breakthrough', `${R} (TG3): a breakthrough ready stops it once a realm (${r1}, then ${r2})`); }
      // TG4: weeks only on stay days; the Heart is a week hub
      { const g = ensureBars(newGame(99107, { closed: true, cal: 7 })); goTo(g, SCENES, 'ashfall'); g.minutes = (C.calStart(g, 7) - 1) * 1440 + 8 * 60; assert(!Tk.weekHub(g), `${R} (TG4): the tribute's day is no week (Day ${clockParts(g.minutes).day})`);
        const h = ensureBars(newGame(99108, { closed: true, cal: 7 })); h.flags.ending = 'paid'; h.minutes = (C.calStart(h, 16) - 1) * 1440 + 8 * 60; goTo(h, SCENES, 'heart_hub'); assert(Tk.weekHub(h) && !!Wk.planEnsure(h), `${R} (TG4): the Heart is a stay with a plan`); }
      // TG5: a card the routine leaves no time for: not run, nothing gained, the plan keeps its count
      { const g = fresh(99109, 14, 25); g.james.qi = 20; const inv = { ...g.inventory }; const r = runTask(g, SCENES, 'wild_forage:1');
        const gained = Object.keys(g.inventory).some((k) => k !== 'hare_raw' && (g.inventory[k] || 0) > (inv[k] || 0));
        assert(r.skipped && r.lines.includes(Tk.SKIP_LINE) && !gained && !CY(g) && !g.tasks.fam['wild_forage:1'], `${R} (TG5, L2): the card is not run and says so`);
        const p = fresh(99110, 14, 25); p.james.qi = 20; Wk.planSet(p, 'wild_forage:1', 1); Wk.runWeek(p, SCENES); assert(p.tasks.plan.items['wild_forage:1'] === 1, `${R} (TG5): the plan keeps the card it could not run (${JSON.stringify(p.tasks.plan.items)})`); }
      // TG6: a stale carry goes when a card runs on another hub; a carry from another Coil is not here
      { const g = fresh(99111); runTask(g, SCENES, 'wild_forage:1'); const c = { ...CY(g) }; g.tasks.carries[c.id].coil = '9|0'; assert(!Tk.carryHere(g), `${R} (TG6): another Coil's carry is not here`); g.tasks.carries[c.id] = c;
        goTo(g, SCENES, 'ashfall'); g.minutes = (C.calStart(g, 4) - 1) * 1440 + 8 * 60; g.james.qi = 0; g.james.satiety = 80; const id = 'qi:next'; runTask(g, SCENES, id); assert(!CY(g), `${R} (TG6): a card on another hub drops the wilds' carry (${JSON.stringify(CY(g))})`); }
      // TG7: the parts of the day; no sit before a meridian session or an hour of gathering
      { const g = fresh(99112); const at2 = (h, m) => { g.minutes = 1440 + h * 60 + m; return Tk.mealSlot(g); }; assert(at2(10, 59) === 'b' && at2(11, 0) === 'l' && at2(14, 59) === 'l' && at2(15, 0) === 's' && at2(2, 0) === 's', `${R} (TG7): the parts of the day at 10:59, 11:00, 14:59, 15:00 and 02:00`);
        const q = fresh(99113); q.james.qi = 5; const r = runTask(q, SCENES, 'qi:next'); assert(!r.lines.some((x) => /day's sit/.test(x)) && q.tasks.routine.sit === true, `${R} (TG7): gathering Qi first is the day's sitting`);
        const mm = fresh(99114); mm.james.qi = 20; const mid = taskCards(mm, SCENES).find((c) => c.kind === 'mer' && c.status === 'open')?.id; if (mid) { const r2 = runTask(mm, SCENES, mid); assert(!r2.lines.some((x) => /day's sit/.test(x)), `${R} (TG7): a meridian session first is the day's sitting`); } }
      // TG8: a week's card with under 30 minutes left is over for the day; "Go on" eats as work does
      { const g = fresh(99115, 14, 40); g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true }; assert(taskCards(g, SCENES).filter((c) => c.week).every((c) => c.status === 'evening'), `${R} (TG8): 20 minutes before the evening hour the week's cards wait for tomorrow`);
        const w = fresh(99116); runTask(w, SCENES, 'wild_forage:1'); w.minutes = 2 * 1440 + 7 * 60; w.tasks.routine = { d: Tk.workDay(w), meals: 'bls', sit: true }; w.james.satiety = 100; const m0 = w.minutes; runTask(w, SCENES, Tk.CARRY_TASK);
        const hrs = (w.minutes - m0) / 60; assert(Math.abs((100 - w.james.satiety) - 4 * hrs) < 0.6, `${R} (TG8): "Go on" costs Fed 4 an hour, as work (${(100 - w.james.satiety).toFixed(1)} over ${hrs.toFixed(1)} h)`); }
      // TG9: the fold leaves alone a screen with two choices, a check, or a night off a stay
      { const g = fresh(99117); goTo(g, SCENES, 'night'); Wk.foldNight(g, SCENES); assert(Wk.foldNight(g, SCENES).steps === 0 && g.scene === 'night', `${R} (TG9): two choices are a real choice`);
        const S2 = { ...SCENES, morning: { ...SCENES.morning, choices: [{ text: 'Get up.', check: { skill: 'GU', dc: 1 }, to: 'wilds' }] } };
        const c = fresh(99118); goTo(c, SCENES, 'morning'); Wk.foldNight(c, S2); const f = Wk.foldNight(c, S2); assert(f.steps === 0 && c.scene === 'morning', `${R} (TG9): a check never folds`);
        const S4 = { ...SCENES, morning: { ...SCENES.morning, choices: [{ text: 'Get up.', to: 'wilds' }, { text: 'Stay in bed.', to: 'wilds' }] } };
        const d = fresh(99126); goTo(d, SCENES, 'morning'); Wk.foldNight(d, S4); const f4 = Wk.foldNight(d, S4); assert(f4.steps === 0 && d.scene === 'morning', `${R} (TG9): a stay's morning with two ways on never folds`);
        const j = ensureBars(newGame(99119, { closed: true, cal: 7 })); j.flags.ending = 'paid'; j.flags.palisade = true; j.flags.wolf = 'driven'; j.minutes = (C.calStart(j, 11) - 1) * 1440 + 22 * 60; goTo(j, SCENES, 'fo_night'); j.tasks.nf = { fo_night: '*' }; Wk.foldNight(j, SCENES); assert(Wk.foldNight(j, SCENES).steps === 0, `${R} (TG9, L3): no fold off a stay's days`); }
      // TG10, L7: a counter stay's plan started mid-week; a Fallout plan made after midnight; the counts stay under 10
      { const g = fresh(99120); g.flags.cal_night = 3; delete g.tasks.plan; const p = Wk.planEnsure(g); assert(p.lastDay === Tk.workDay(g) + 3, `${R} (TG10): four days left of the wilds' week (${p.lastDay - Tk.workDay(g) + 1})`);
        Wk.planSet(g, 'wild_train:1', 50); assert(p.items['wild_train:1'] === 9, `${R} (TG10): at most 9 of a card`);
        const f = ensureBars(newGame(99121, { closed: true, cal: 7 })); f.flags.ending = 'paid'; f.minutes = C.calEnd(f, 8) * 1440 + 2 * 60; goTo(f, SCENES, 'fo_ashfall'); assert(Wk.planEnsure(f).lastDay === C.calEnd(f, 8) - 1, `${R} (L7): a plan made at 02:00 after the week's last day ends that night (${Wk.planEnsure(f).lastDay + 1} / ${C.calEnd(f, 8)})`); }
      // TG11, L1: the resume after a story choice, the week's end reported, Clear
      { const g = fresh(99122); Wk.planSet(g, 'wild_train:1', 1); Wk.planSet(g, 'med:mer', 2); g.tasks.plan.running = true; assert(Wk.weekResume(g), `${R} (TG11): a running plan goes on after the evening's choice`);
        Wk.planClear(g); assert(Wk.planEmpty(g.tasks.plan) && g.tasks.plan.med.mer === 0 && !g.tasks.plan.running && !Wk.weekResume(g), `${R} (TG11): Clear empties the cards and the Meditate counts and stops the plan`);
        g.tasks.plan.running = true; g.tasks.plan.lastDay = Tk.workDay(g) - 1; assert(Wk.weekResume(g) && Wk.runWeek(g, SCENES).stop === 'week' && !g.tasks.plan.running, `${R} (L1): a running plan whose week ended reports it`); }
      // L6: a week's card done for today stays on the plan's list (the Fallout's Council, once a day)
      { const g = ensureBars(newGame(99125, { closed: true, cal: 7 })); g.flags.ending = 'paid'; g.minutes = 44 * 1440 + 7 * 60; goTo(g, SCENES, 'fo_ashfall'); g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true };
        const cid = taskCards(g, SCENES).find((c) => c.week && c.status === 'open' && /^fo_council:/.test(c.id))?.id; if (cid) { runTask(g, SCENES, cid); delete g.tasks.carries; }
        const row = Wk.planCards(g, SCENES).find((c) => c.id === cid); assert(cid && row && row.status === 'tomorrow', `${R} (L6): the Council done for today is still on the plan's list (${cid}, ${row?.status})`); }
      // L4, L5: the Fallout's farewell evening and a fight are never taken alone
      { const g = ensureBars(newGame(99123, { closed: true, cal: 7 })); g.flags.ending = 'paid'; g.flags.palisade = true; g.minutes = (C.calEnd(g, 10) - 1) * 1440 + 17 * 60; goTo(g, SCENES, 'fo_ashfall'); Wk.planEnsure(g); g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true };
        const r = Wk.runWeek(g, SCENES); assert(r.stop === 'story' && g.scene === 'fo_ashfall', `${R} (L4): the farewell evening stops the plan (${r.stop}, ${g.scene})`);
        const S3 = { ...SCENES, camp: { ...SCENES.camp, choices: SCENES.camp.choices.map((c) => (/^Night falls/.test(String(c.text)) ? { ...c, combat: SCENES.night_attack.choices.find((x) => x.combat).combat } : c)) } };
        const w = fresh(99124, 15, 30); w.tasks.routine = { d: Tk.workDay(w), meals: 'bls', sit: true }; Wk.planEnsure(w);
        const r2 = Wk.runWeek(w, S3); assert(w.scene === 'camp' && r2.stop === 'evening', `${R} (L5): a fight on the camp's way on is not taken (${r2.stop}, ${w.scene})`); }
    }
    // the screen: the fold and the plan's resume after a story choice; the plan's panel on a stay hub
    { const M = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/else weekAfter\(\);/.test(M) && /function weekAfter\(\)/.test(M) && /hub && weekHub\(g\) \? weekHtml\(\)/.test(M) && /data-week="run"/.test(M) && /b\.dataset\.plan/.test(M), `${T}: main.js folds after a story choice, resumes the plan and draws its panel`); }
}

// v0.11.206 (owner pick FC1, with the Opus review's fixes RV1): the plan's forecast (js/core/week.js planForecast, planHours,
// planNotes, forecastNow, noteEvening, storyTap, afterStory, eveningPick, fightHere; js/main.js weekHtml, playChoice, weekAfter).
// The forecast is a dry run of the plan on a copy. Here the real run plays the save itself with the steps main.js takes on the
// taps (Run the week = runWeek; a story tap = storyTap; then afterStory: the fold, and the plan goes on by itself or not), the
// player taking at each evening the forecast's own pick (E4), and it watches the run its own way (RV1, TG1): a card is done when
// its result says the week's work is done ("A week's work: …, done." or the carried work's "done, … in all."), a skipped card
// (the day's meal and sit came first) never counts, and a Meditate day counts its own runs. Every number the panel shows must be
// the one the real run reaches.
{
    const Tk = await import('../js/core/tasks.js');
    const Wk = await import('../js/core/week.js');
    const C = await import('../js/core/calendar.js');
    const T = 'FC1 (the forecast)';
    const { clockLabel } = await import('../js/core/game.js');
    const base = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true });
    const copy = (g = base) => JSON.parse(JSON.stringify(g));
    const food = (g) => { g.james.satiety = 100; g.inventory.smoked_meat = 30; }; // v0.11.209 (TF1, S): kept food (30 raw hare would spoil in 3 days; the 'save as it is' cases keep their raw food)
    const isFight = (g, S) => Wk.fightHere(g, S);
    /** The real run on the save itself, as main.js takes it. */
    const realRun = (g, S = SCENES) => {
        const p0 = Wk.planEnsure(g), hub = p0.hub, day0 = Tk.workDay(g), last = p0.lastDay, want = { ...p0.items };
        const units = {}, rows = Object.fromEntries(Object.keys(want).filter((id) => want[id] > 0).map((id) => [id, null]));
        const runs = {}, mornings = {}, started = new Set(); let owner = CY(g) ? 'before the plan' : null;
        const sid = () => Tk.sitTaskId(g, S);
        if (p0.done?.d === day0) runs[day0] = { sit: p0.done.sit, mer: p0.done.mer, qi: p0.done.qi };
        const onStep = (cg, l) => {
            const d = Tk.workDay(cg);
            if (cg.scene === hub && d > day0 && mornings[d] == null) mornings[d] = cg.minutes - d * 1440;
            if (!l || l.r.skipped) return;
            const L = l.r.lines || [];
            let doneOf = null;
            // v0.11.215 (CF1, UB): each card's own Go on; a work started before the plan is not the plan's
            if (Tk.isCarryTask(l.id)) { if (L.some((x) => /: done, .* in all\.$/.test(x))) { const k = l.id.startsWith(`${Tk.CARRY_TASK}:`) ? l.id.slice(Tk.CARRY_TASK.length + 1) : owner; doneOf = started.delete(k) ? k : null; } }
            else if (L.some((x) => /^A week's work: .*, done\.$/.test(x))) doneOf = l.id;
            else if (L.some((x) => /^A week's work: .*still to go/.test(x))) { owner = l.id; started.add(l.id); }
            if (doneOf && doneOf in rows) { units[doneOf] = (units[doneOf] || 0) + 1; if (units[doneOf] === want[doneOf]) rows[doneOf] = cg.minutes; }
            const kind = l.id === sid() ? 'sit' : l.id === Tk.QI_TASK ? 'qi' : /^mer|meridian/i.test(l.id) || l.id === Tk.MER_TASK ? 'mer' : null;
            if (kind && d >= day0) { const x = runs[d] || (runs[d] = { sit: 0, mer: 0, qi: 0 }); x[kind]++; }
        };
        let stop = 'stuck';
        for (let k = 0; k < 60; k++) {
            stop = Wk.runWeek(g, S, { onStep }).stop;
            if (stop === 'story' && isFight(g, S)) stop = 'fight';
            if (stop !== 'evening') break;
            let on = false;
            for (let j = 0; j < 12 && !on; j++) {
                if (Tk.workDay(g) > last) { stop = 'week'; break; }
                const r = Wk.storyTap(g, S, Wk.eveningPick(g, S));
                if (r.combat) { stop = 'fight'; break; }
                if (Wk.afterStory(g, S).resume) on = true;
                else if (!Wk.NIGHT_SCENES.has(g.scene) && g.scene !== hub) { stop = isFight(g, S) ? 'fight' : 'story'; break; }
            }
            if (!on) break;
        }
        const med = Object.fromEntries(Object.keys(p0.med).map((k) => [k, p0.med[k] > 0 ? Object.entries(runs).filter(([d, x]) => Number(d) <= last && x[k] >= p0.med[k]).length : 0]));
        return { rows, med, stop, minutes: g.minutes, fed: Math.round(g.james.satiety), hp: Math.round(g.james.hp), mornings };
    };
    const cmp = (name, g, S = SCENES) => {
        const j0 = JSON.stringify(g), f = Wk.planForecast(g, S);
        assert(JSON.stringify(g) === j0, `${T}: the forecast changes nothing in the save (${name})`);
        const r = realRun(copy(g), S);
        const same = !!f && f.stop === r.stop && f.minutes === r.minutes && f.fed === r.fed && f.hp === r.hp && JSON.stringify(f.rows) === JSON.stringify(r.rows) && JSON.stringify(f.med) === JSON.stringify(r.med);
        assert(same, `${T} (TG1): the forecast equals the real run: ${name} (forecast ${JSON.stringify(f && { ...f, hpMax: undefined, mornings: undefined })} / real ${JSON.stringify({ ...r, mornings: undefined })})`);
        return { f, r };
    };
    const cards = Wk.planCards(base, SCENES).map((c) => c.id);
    const seen = {};
    const plans = {
        'the save as it is, 2 cards': (g) => { Wk.planSet(g, cards[0], 1); Wk.planSet(g, cards[1], 1); },
        'the save as it is, a card and 2 sits a day': (g) => { Wk.planSet(g, 'wild_forage:3', 1); Wk.planSet(g, 'med:sit', 2); },
        'with food, 4 mixed cards, a sit and a session a day': (g) => { food(g); for (const id of ['wild_forage:3', 'wild_hunt:2', 'wild_train:1', 'wild_forage:1']) Wk.planSet(g, id, 1); Wk.planSet(g, 'med:sit', 1); Wk.planSet(g, 'med:mer', 1); },
        'with food, Forage 0–3': (g) => { food(g); for (const id of ['wild_forage:0', 'wild_forage:1', 'wild_forage:2', 'wild_forage:3']) Wk.planSet(g, id, 1); },
        'with food, Practice 1–3': (g) => { food(g); for (const id of ['wild_train:1', 'wild_train:2', 'wild_train:3']) Wk.planSet(g, id, 1); },
        'with food, all 8 cards': (g) => { food(g); for (const id of cards) Wk.planSet(g, id, 1); },
        'with food, a card twice': (g) => { food(g); Wk.planSet(g, 'wild_forage:3', 2); },
        'with food, Meditate only (2, 2, 3)': (g) => { food(g); Wk.planSet(g, 'med:sit', 2); Wk.planSet(g, 'med:mer', 2); Wk.planSet(g, 'med:qi', 3); Wk.planSet(g, 'door:yk_time', 0); }, // v0.11.210 (N1, DC-a): Yuki's row at 0, so the day's hours are as M1 measured them (with her 20 minutes Gather Qi fits 6 of 6); v0.11.207 (SC2): was (2, 2, 2): it stopped for Foundation's breakthrough on its last day then (Gather Qi 5 of 6); with SC2's pace no breakthrough this week (6 of 6), so the short row is 3 a day
        'with food, the night\'s other choice last time (E4)': (g) => { food(g); Wk.planSet(g, cards[0], 1); g.tasks.evc = { night: 3 }; },
        'with food, an empty plan': (g) => { food(g); },
        // TG2: a plan made late (the day's sit still due; H1: the card skipped today, done on Day 4), work carried from before the plan, a card never open
        'TG2: made at 14:00 with the day\'s sit due': (g) => { food(g); g.james.satiety = 60; g.james.qi = 50; delete g.tasks.routine; g.minutes = 1440 + 14 * 60; Wk.planSet(g, 'wild_forage:0', 1); },
        'TG2: made at 13:45 with the day\'s sit due': (g) => { food(g); g.james.satiety = 60; g.james.qi = 50; delete g.tasks.routine; g.minutes = 1440 + 13 * 60 + 45; Wk.planSet(g, 'wild_forage:0', 1); },
        'TG2: work carried from before the plan': (g) => { food(g); runTask(g, SCENES, 'wild_forage:0'); Wk.planSet(g, 'wild_forage:0', 1); Wk.planSet(g, 'wild_forage:3', 1); },
        'TG2: a card never open': (g) => { food(g); Wk.planSet(g, 'wild_forage:3', 1); Wk.planEnsure(g).items['wild_forage:99'] = 1; },
    };
    for (const [name, set] of Object.entries(plans)) { const g = copy(); set(g); seen[name] = { g, ...cmp(name, g) }; }
    { const a = seen['the save as it is, 2 cards'].f, b = seen['with food, 4 mixed cards, a sit and a session a day'].f, c = seen['with food, all 8 cards'].f, m = seen['with food, Meditate only (2, 2, 3)'].f, s2 = seen['the save as it is, a card and 2 sits a day'].f;
      assert(a.stop === 'hungry' && clockParts(a.minutes).day === 3 && Object.values(a.rows).includes(null), `${T} (E3): the save as it is stops hungry on Day 3, a card not this week (${a.stop}, ${clockLabel(a.minutes)})`);
      assert(b.stop === 'story' && clockParts(b.minutes).day === 8 && Object.values(b.rows).every((x) => x != null) && b.med.sit === b.days && b.days === 6, `${T} (E2b, E3, M1): with food 4 mixed cards finish, the 7th night's event stops it, a sit every day (${b.stop} ${clockLabel(b.minutes)}, ${JSON.stringify(b.med)} of ${b.days})`);
      const fin = Object.values(c.rows).filter((x) => x != null).length; assert(fin >= 1 && fin < 8, `${T} (E2b): all 8 cards: some not this week (${fin} of 8 finish)`);
      assert(m.med.sit === m.days && m.med.mer === m.days && m.med.qi < m.days, `${T} (M1): Meditate only: every sit and session a day, Gather Qi short a day (${JSON.stringify(m.med)} of ${m.days}, ${m.stop})`);
      assert(s2.med.sit === 1 && s2.days === 6, `${T} (M1): the save as it is: the sits a day 1 of 6 days (it stops hungry; ${JSON.stringify(s2.med)})`);
      const late = seen['TG2: made at 14:00 with the day\'s sit due'].f.rows['wild_forage:0']; assert(late != null && clockParts(late).day === 4, `${T} (TG2, H1): a card the day's sit left no time for today is not done today (${clockLabel(late)})`);
      const never = seen['TG2: a card never open'].f.rows['wild_forage:99']; assert(never === null, `${T} (TG2): a card never open is not this week`);
      const tw = seen['with food, a card twice'].f.rows['wild_forage:3']; const o1 = copy(); food(o1); Wk.planSet(o1, 'wild_forage:3', 1); const once = Wk.planForecast(o1, SCENES).rows['wild_forage:3']; assert(tw != null && once != null && tw > once, `${T} (E2b): a card twice finishes after its second run`); }
    // TG3 (M2): the hours line counts each later day from the dry run's own morning, and agrees with the rows on the wilds plans
    for (const name of ['with food, Forage 0–3', 'with food, Practice 1–3', 'with food, 4 mixed cards, a sit and a session a day', 'with food, all 8 cards', 'the save as it is, 2 cards']) {
        const { g, f, r } = seen[name]; const h = Wk.planHours(g, SCENES, Wk.planHere(g), f); const p = Wk.planHere(g), d0 = Tk.workDay(g);
        let want = Tk.workRoom(g, 'wilds'), mo = Wk.MORNING_HOUR * 60; for (let d = d0 + 1; d <= p.lastDay; d++) { if (r.mornings[d] != null) mo = r.mornings[d]; want += Math.max(0, 15 * 60 - mo); }
        const all = Object.values(f.rows).every((x) => x != null);
        assert(JSON.stringify(f.mornings) === JSON.stringify(r.mornings) && Object.keys(f.mornings).every((d) => Number(d) > d0), `${T} (E1, TG3): ${name}: the dry run's mornings are the real run's, later days only (${JSON.stringify(f.mornings)})`);
        assert(h.left === want && (f.stop === 'hungry' || (h.work <= h.left) === all), `${T} (E1, TG3): ${name}: ${h.left} min to the evenings (the real run's mornings: ${want}); cards ${h.work} min, all done ${all}`); }
    { const g = copy(); g.james.hp = 1; Wk.planSet(g, 'wild_forage:0', 1); const f = Wk.planForecast(g, SCENES), h = Wk.planHours(g, SCENES, Wk.planHere(g), f);
      assert(f.stop === 'hurt' && Wk.MORNING_HOUR === 7 && h.left === (15 * 60 - (6 * 60 + 40)) + 5 * (15 - 7) * 60, `${T} (E1): with no morning in the dry run the day counts from 07:00 (${f.stop}, ${h.left}; 500 + 5 × 480)`); }
    // TG4: the carried work is in the plan's total, exactly
    { const g = copy(); Wk.planSet(g, 'wild_forage:3', 1); runTask(g, SCENES, 'wild_forage:0'); const per = Object.fromEntries(Wk.planCards(g, SCENES).map((c) => [c.id, Wk.cardWeekMinutes(c)])); const h = Wk.planHours(g, SCENES);
      assert(CY(g) && h.work === CY(g).left + per['wild_forage:3'], `${T} (E1, TG4): the carried work's rest and the planned card (${h.work} = ${CY(g)?.left} + ${per['wild_forage:3']})`); }
    // TG5: a hub's evening with two ways on (never a card), a fight as the hub's only way on, a fight from the evening's tap, a fight among other ways
    { const night = SCENES.night, wilds = SCENES.wilds, fightC = SCENES.night_attack.choices.find((x) => x.combat).combat;
      const wayOn = wilds.choices.findIndex((c, i) => !Tk.isTaskChoice(SCENES, 'wilds', i) && /camp|Night/i.test(String(typeof c.text === 'function' ? '' : c.text)));
      const S2 = { ...SCENES, wilds: { ...wilds, choices: [...wilds.choices, { ...wilds.choices[wayOn], text: 'Walk the shore before the fire.' }] } };
      const g = copy(); food(g); Wk.planSet(g, 'wild_forage:3', 1); g.minutes = 1440 + 15 * 60 + 30; g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true };
      const pick = Wk.eveningPick(g, S2); assert(wayOn >= 0 && pick != null && !Tk.isTaskChoice(S2, 'wilds', pick), `${T} (TG5, E4): the hub's evening pick is a way on, never a card (${pick})`);
      const { f } = cmp('TG5: the hub\'s evening with two ways on', g, S2); assert(f && f.stop !== 'stuck', `${T} (TG5): two ways on: the plan goes on (${f?.stop})`);
      const S3 = { ...SCENES, wilds: { ...wilds, choices: wilds.choices.map((c, i) => (i === wayOn ? { ...c, combat: fightC } : c)) } };
      const h = copy(); food(h); Wk.planSet(h, 'wild_forage:3', 1); h.minutes = 1440 + 15 * 60 + 30; h.tasks.routine = { d: Tk.workDay(h), meals: 'bls', sit: true };
      const f3 = cmp('TG5: a fight as the hub\'s only way on', h, S3).f; assert(f3?.stop === 'fight', `${T} (TG5, L3): a fight as the only way on is a fight (${f3?.stop})`);
      const S4 = { ...SCENES, night: { ...night, choices: night.choices.map((c, i) => (i === 1 ? { ...c, combat: fightC } : c)) } };
      const k = copy(); food(k); Wk.planSet(k, 'wild_forage:3', 1);
      const f4 = cmp('TG5: a fight from the evening\'s tap', k, S4).f; assert(f4?.stop === 'fight' && clockParts(f4.minutes).day === 2, `${T} (TG5): a fight from the night's tap stops it that night (${f4?.stop} ${f4 && clockLabel(f4.minutes)})`);
      const e = copy(seen['with food, 4 mixed cards, a sit and a session a day'].g); const fe = Wk.planForecast(e, SCENES);
      assert(fe.stop === 'story' && /the story needs you/.test(Wk.planNotes(e, SCENES).outlook), `${T} (L3): the 7th night's event (a fight is one way) is the story's, not "a fight" (${fe.stop})`); }
    // TG6: the Fallout (its supper's choice each night; the week's end into Ya's arrival: M1), the Heart, the village
    { const fo = ensureBars(newGame(99300, { closed: true, cal: 7 })); fo.flags.ending = 'paid'; fo.flags.palisade = true; fo.flags.wolf = 'driven'; fo.minutes = 44 * 1440 + 7 * 60; goTo(fo, SCENES, 'fo_ashfall'); food(fo);
      const pid = Wk.planCards(fo, SCENES).find((c) => /^fo_palisade/.test(c.id))?.id; Wk.planSet(fo, pid, 1);
      const { f } = cmp('TG6: the Fallout, a Palisade card', fo); assert(f?.stop === 'week' && f.rows[pid] != null && /runs to the week's end/.test(Wk.planNotes(fo, SCENES).outlook), `${T} (TG6, M1): the Fallout's week ends at its last morning, not in Ya's arrival (${f?.stop} ${f && clockLabel(f.minutes)})`);
      const he = ensureBars(newGame(99301, { closed: true, cal: 7 })); he.flags.ending = 'paid'; he.minutes = (C.calStart(he, 16) - 1) * 1440 + 8 * 60; goTo(he, SCENES, 'heart_hub'); food(he);
      const hc = Wk.planCards(he, SCENES).map((c) => c.id); if (hc[0]) Wk.planSet(he, hc[0], 1); Wk.planSet(he, 'med:sit', 1);
      const fh = cmp('TG6: the Heart, a card and a sit a day', he).f; assert(Tk.weekHub(he) && fh && fh.stop !== 'stuck', `${T} (TG6): the Heart's forecast (${fh?.stop} ${fh && clockLabel(fh.minutes)})`);
      const vi = ensureBars(newGame(99302, { closed: true, cal: 7 })); vi.minutes = (C.calStart(vi, 5) - 1) * 1440 + 8 * 60; goTo(vi, SCENES, 'ashfall'); food(vi);
      const vc = Wk.planCards(vi, SCENES).map((c) => c.id); if (vc[0]) Wk.planSet(vi, vc[0], 1);
      const fv = Tk.weekHub(vi) ? cmp('TG6: the village, a card', vi).f : null; assert(Tk.weekHub(vi) && fv && fv.stop !== 'stuck', `${T} (TG6): the village's forecast (${fv?.stop})`); }
    // E4: the evening's choice taken last time; else the first way on; noted by a tap before it is taken (TG8), a stay's days only (L4)
    { const g = copy(); food(g); goTo(g, SCENES, 'night'); g.minutes = 1440 + 21 * 60;
      const first = Wk.eveningPick(g, SCENES); g.tasks.evc = { night: 3 }; const again = Wk.eveningPick(g, SCENES); g.tasks.evc = { night: 99 }; const gone = Wk.eveningPick(g, SCENES);
      assert(first === 1 && again === 3 && gone === 1, `${T} (E4): the night's first way on, the one taken last time, the first again when that one is gone (${first}, ${again}, ${gone})`);
      const n = copy(); goTo(n, SCENES, 'night'); n.minutes = 1440 + 21 * 60; delete n.tasks.evc; Wk.storyTap(n, SCENES, 3);
      assert(n.tasks.evc?.night === 3 && Object.keys(n.tasks.evc).length === 1 && n.scene !== 'night', `${T} (E4, TG8): a tap notes the night's choice before it is taken (${JSON.stringify(n.tasks.evc)}, now ${n.scene})`);
      const h = copy(); Wk.noteEvening(h, 'wilds', 2); assert(!h.tasks.evc?.wilds, `${T} (E4): a hub's choice in the day is not an evening's`);
      h.minutes = 1440 + 16 * 60; Wk.noteEvening(h, 'wilds', 2); assert(h.tasks.evc?.wilds === 2, `${T} (E4): a hub's choice in its evening is`);
      const o = ensureBars(newGame(99201, { closed: true })); goTo(o, SCENES, 'night'); Wk.noteEvening(o, 'night', 3); assert(!o.tasks?.evc, `${T} (E4): the old calendar notes nothing`);
      const t7 = ensureBars(newGame(99203, { closed: true, cal: 7 })); t7.minutes = (C.calStart(t7, 7) - 1) * 1440 + 22 * 60; goTo(t7, SCENES, 'night'); Wk.noteEvening(t7, 'night', 3); assert(!t7.tasks?.evc?.night, `${T} (E4, L4): a night off the stays notes nothing (story day ${C.storyDay(t7)})`);
      const d = deserialize(serialize(n)); assert(d.tasks.evc?.night === 3, `${T} (E4): the note goes through a save`);
      const f1 = seen['with food, the night\'s other choice last time (E4)'].f, g1 = copy(); food(g1); Wk.planSet(g1, cards[0], 1); const f0 = Wk.planForecast(g1, SCENES);
      assert(JSON.stringify(f1) !== JSON.stringify(f0), `${T} (E4): the night's other choice changes the forecast (${f0.stop} ${clockLabel(f0.minutes)} HP ${f0.hp} / ${f1.stop} ${clockLabel(f1.minutes)} HP ${f1.hp})`); }
    // TG7: the panel's texts; the forecast kept until the save changes, and redone when it does (each − / + tap)
    { const g = copy(); Wk.planSet(g, 'wild_forage:0', 1); Wk.planSet(g, 'wild_forage:1', 1); Wk.planSet(g, 'med:sit', 2);
      const N = Wk.planNotes(g, SCENES), f = Wk.forecastNow(g, SCENES);
      assert(f === Wk.forecastNow(g, SCENES), `${T} (TG7): the forecast is kept while the save is the same`);
      assert(N.rows['wild_forage:0'] === ` · done ${clockLabel(f.rows['wild_forage:0']).replace(',', '')}` && N.rows['wild_forage:1'] === ' · not this week' && N.med.sit === '1 of 6 days' && !('mer' in N.med), `${T} (TG7): the rows: done, not this week, the sits' days (${JSON.stringify(N)})`);
      assert(/^Cards \d+ h( \d+ m)?; \d+ h( \d+ m)? left to the evenings this week\.$/.test(N.total) && N.outlook === `Forecast: it stops ${clockLabel(f.minutes).replace(',', '')}: Fed is under 30 and there is no food. Fed ${f.fed}, HP ${f.hp}/${f.hpMax} then.`, `${T} (TG7): the total and the outlook (${N.total} | ${N.outlook})`);
      Wk.planSet(g, 'wild_forage:1', 0); const N2 = Wk.planNotes(g, SCENES); assert(Wk.forecastNow(g, SCENES) !== f && !('wild_forage:1' in N2.rows), `${T} (TG7, F9): a − tap redoes the forecast`);
      const e = copy(); food(e); const NE = Wk.planNotes(e, SCENES); assert(NE.total === '' && /^Forecast: it stops /.test(NE.outlook), `${T} (L1): an empty plan: no hours line, the outlook kept (${NE.outlook})`);
    }
    // L2: a dry run that fails shows no forecast (not "nothing left it can do")
    { const g = copy(); food(g); Wk.planSet(g, 'wild_forage:0', 1); const S5 = { ...SCENES, night: { ...SCENES.night, get choices() { throw new Error('planted'); } } };
      assert(Wk.planForecast(g, S5) === null, `${T} (L2): a dry run that throws gives no forecast`); }
    // nothing off a stay hub, nothing on the old calendar
    { const o = ensureBars(newGame(99202, { closed: true })); goTo(o, SCENES, 'wilds'); assert(Wk.planForecast(o, SCENES) === null && Wk.planHours(o, SCENES) === null, `${T}: no forecast on the old calendar`);
      const g = copy(); goTo(g, SCENES, 'night'); assert(Wk.planForecast(g, SCENES) === null, `${T}: no forecast off the stay hub`); }
    // the screen: main.js takes the shared steps and draws planNotes; the scene's text before the panels (L5)
    { const M = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/storyTap\(g, SCENES, idx\)/.test(M) && !/\bchoose\(g, SCENES, idx\)/.test(M) && /afterStory\(g, SCENES\)/.test(M) && /planNotes\(g, SCENES\)/.test(M) && M.indexOf('const proseOut = proseHtml(v)') < M.indexOf("hub && weekHub(g) ? weekHtml()"), `${T}: main.js takes the shared steps, draws planNotes, the scene's text first`); }
}

// v0.11.207 (owner pick SC2; roadmap-time.md S6): the long calendar's pace until the retune (js/core/game.js LONG_SAT_DIV, LONG_MER_MULT,
// LONG_XP; satDiv, merMult, xpPace; sitGain, awardXp, awardYukiFightXp; js/story/meridians.js need). The old calendar: ×1. RV1 (the Opus review): the root (M1), the seclusion (L2), the XP's
// rounding (L1), the What's new line (M2t), TG1–TG6.
{
    const Gm = await import('../js/core/game.js');
    const M = await import('../js/story/meridians.js');
    const C = await import('../js/core/calendar.js');
    const T = 'SC2 (the long calendar\'s pace)';
    const fresh = (cal, seed = 99301) => ensureBars(newGame(seed, { closed: true, ...(cal ? { cal } : {}) }));
    const old = fresh(0), lg = fresh(C.LONG_CAL);
    assert(Gm.LONG_SAT_DIV === 4 && Gm.LONG_MER_MULT === 4 && Gm.LONG_XP === 0.7, `${T}: the knobs ÷4 / ×4 / ×0.7`);
    assert(Gm.satDiv(old) === 1 && Gm.merMult(old) === 1 && Gm.xpPace(old) === 1 && Gm.satDiv(lg) === 4 && Gm.merMult(lg) === 4 && Gm.xpPace(lg) === 0.7, `${T}: ×1 on the old calendar, the knobs on the long one`);
    assert(Gm.satDiv(null) === 1 && Gm.merMult({}) === 1 && Gm.xpPace({ cal: 3 }) === 1, `${T}: anything but cal 7 is the old pace`);
    // a sit's Saturation: the old formula unchanged, a quarter of it on the long calendar, at every realm
    { let okOld = true, okLong = true;
      for (let r = 0; r <= Gm.MAX_REALM; r++) { old.james.realm = lg.james.realm = r;
        okOld = okOld && Gm.sitGain(old) === Math.round((100 / Gm.SAT_HOURS(r)) * 10) / 10 && Gm.sitGain(old, 2) === Math.round((200 / Gm.SAT_HOURS(r)) * 10) / 10;
        const q = Math.round((100 / Gm.SAT_HOURS(r) / 4) * 10) / 10, q2 = Math.round((200 / Gm.SAT_HOURS(r) / 4) * 10) / 10;
        okLong = okLong && (r < Gm.MAX_REALM ? Gm.sitGain(lg) === Math.max(0.1, q) && Gm.sitGain(lg, 2) === Math.max(0.2, q2) && !Gm.sitUseless(lg) : Gm.sitGain(lg) === 0 && Gm.sitUseless(lg)); }
      old.james.realm = lg.james.realm = 0;
      { const g = fresh(C.LONG_CAL, 99308); const at = (r) => { g.james.realm = r; return Gm.sitGain(g); };
        assert(Gm.LONG_SIT_MIN === 0.1 && [9, 10, 11, 12, 13].every((r) => at(r) === 0.1) && at(14) === 0 && at(6) === 0.2 && at(7) === 0.1, `${T} (FL1): realms 10–13 a sit 0.1% on the long calendar (÷4 rounds to 0), 0 at the top (${[6, 7, 9, 10, 13, 14].map((r) => `${r}: ${at(r)}`).join(', ')})`); }
      assert(okOld && okLong && Gm.sitGain(old) === 10 && Gm.sitGain(lg) === 2.5, `${T}: a sit +10% / +2.5% at Mortal Vessel, the old formula at every realm, a quarter on the long calendar, at least 0.1% a sit below the top (FL1)`); }
    // condense on both: Saturation and the sit's XP (a third of a standard award, then ×0.6, ×0.7 on the long calendar)
    { const a = fresh(0, 99302), b = fresh(C.LONG_CAL, 99302); a.james.qi = b.james.qi = 50;
      const ra = Gm.condense(a), rb = Gm.condense(b);
      const xpOf = (r, re) => Number((r.xp.find((l) => re.test(l)) || '').match(/\+(\d+)/)?.[1] ?? -1);
      const sitPool = Math.floor(30 * Gm.SIT_XP_FACTOR);
      assert(ra.ok && rb.ok && a.james.saturation === 10 && b.james.saturation === 2.5, `${T}: one sit +10% old, +2.5% long (${a.james.saturation}, ${b.james.saturation})`);
      assert(xpOf(ra, /^Convergence Use/) === Math.floor(Math.floor(sitPool * 0.6) / 2) && xpOf(rb, /^Convergence Use/) === Math.floor(Math.floor(sitPool * 0.6 * 0.7) / 2), `${T}: a sit's XP ×0.7 on the long calendar (${xpOf(ra, /^Convergence Use/)} → ${xpOf(rb, /^Convergence Use/)})`); }
    // every award: James's (each band, tier, Coil) and Yuki's fights
    { let ok = true; const bad = [];
      for (const band of ['standard', 'challenging', 'major']) for (const tier of [1, 3]) for (const n of [1, 3]) {
        const a = fresh(0, 99303), b = fresh(C.LONG_CAL, 99303);
        for (const g of [a, b]) { g.james.gu.tier = tier; g.coil.n = n; g.coil.free = 0; }
        const ga = Number(Gm.awardXp(a, 'GU', band)[0].match(/\+(\d+)/)[1]), gb = Number(Gm.awardXp(b, 'GU', band)[0].match(/\+(\d+)/)[1]);
        const base = Gm.XP_BANDS[band] * tier * Gm.coilMult(a);
        const want = [Math.floor(base * Gm.XP_RATE), Math.floor(base * Gm.XP_RATE * 0.7)];
        if (ga !== want[0] || gb !== want[1]) { ok = false; bad.push(`${band} T${tier} C${n}: ${ga}/${gb} want ${want}`); } }
      assert(ok, `${T}: every award ×0.7 on the long calendar after the Coil bonus and the XP rate, unchanged on the old (${bad.slice(0, 3).join('; ') || 'all'})`); }
    { const a = fresh(0, 99304), b = fresh(C.LONG_CAL, 99304);
      for (const g of [a, b]) { g.james.gu.tier = 2; g.yuki.fight.tier = 2; g.yuki.fight.level = 1; g.yuki.fight.xp = 0; g.james.gu.level = 9; }
      const xa = a.yuki.fight.xp, xb = b.yuki.fight.xp; Gm.awardYukiFightXp(a, 'challenging'); Gm.awardYukiFightXp(b, 'challenging');
      const da = a.yuki.fight.xp - xa + 0, db = b.yuki.fight.xp - xb + 0;
      const want = Math.floor(60 * 2 * Gm.XP_RATE), wantL = Math.floor(60 * 2 * Gm.XP_RATE * 0.7);
      assert((da === want || a.yuki.fight.level > 1) && (db === wantL || b.yuki.fight.level > 1) && (a.yuki.fight.level > b.yuki.fight.level || da > db), `${T}: Yuki's fight XP ×0.7 on the long calendar (${da} / ${db}; want ${want} / ${wantL})`); }
    // a meridian channel's hours: ×4 on the long calendar for every line, the tables themselves unchanged
    { const lines = [['pri', (g) => {}], ['col', (g) => { g.james.primaries = 12; }], ['e8', (g) => { g.james.realm = 4; }], ['ec', (g) => { g.james.realm = 4; g.james.extra8 = 8; }], ['jn', (g) => { g.james.realm = 7; }]];
      const bad = [];
      for (const [k, set] of lines) { const a = fresh(0, 99305), b = fresh(C.LONG_CAL, 99305); set(a); set(b);
        const hoursOf = (g) => { goTo(g, SCENES, 'meridians'); g.james.qi = 50; g.james.satiety = 100; const i = SCENES.meridians.choices.findIndex((c) => c.merLine === k); const l = sceneView(g, SCENES).choices.find((c) => c.index === i)?.label || ''; return Number(/ of ([\d.]+) h done/.exec(l)?.[1] ?? NaN); };
        const na = hoursOf(a), nb = hoursOf(b); if (!(na > 0) || Math.abs(nb - 4 * na) > 0.05) bad.push(`${k} ${na}/${nb}`); }
      assert(!bad.length && M.priHours(0) === 2 && M.colHours(0) === 3, `${T}: every line's hours ×4 on the long calendar (${bad.join(', ') || 'pri 2 → 8, col 3 → 12, …'})`); }
    // the meridian screen: a session on the long calendar does 2 h of the channel's 8 h, and the card says so
    { const g = fresh(C.LONG_CAL, 99306); goTo(g, SCENES, 'meridians'); g.james.qi = 50; g.james.satiety = 100;
      const i = SCENES.meridians.choices.findIndex((c) => c.merLine === 'pri');
      const label0 = sceneView(g, SCENES).choices.find((c) => c.index === i)?.label || '';
      choose(g, SCENES, i);
      const label1 = sceneView(g, SCENES).choices.find((c) => c.index === i)?.label || '';
      assert(/0 h of 8 h done; 120 min/.test(label0) && /2 h of 8 h done/.test(label1) && (g.james.primaries || 0) === 0, `${T}: a primary takes 8 h on the long calendar, in 2 h sittings ("${label0.slice(-40)}" → "${label1.slice(-40)}")`); }
    // the old calendar's meridian screen as before
    { const g = fresh(0, 99307); goTo(g, SCENES, 'meridians'); g.james.qi = 50; g.james.satiety = 100;
      const i = SCENES.meridians.choices.findIndex((c) => c.merLine === 'pri'); choose(g, SCENES, i);
      assert((g.james.primaries || 0) === 1, `${T}: on the old calendar a 2 h sitting still opens the first primary (${g.james.primaries})`); }
    // RV1 (TG1, TG2, M1, L2): the double sits and the flat gains: the hollow, the grove's kin, the Blackroot root, a Long Forest seclusion
    { const BR = await import('../js/story/act1_blackroot.js');
      const sat = (cal, seed, setup, scene, re) => { const g = fresh(cal, seed); g.james.skills['Convergence Use'].tier = 5; g.james.qi = 50; setup(g); const s0 = g.james.saturation; goTo(g, SCENES, scene);
        if (re) { const i = SCENES[scene].choices.findIndex((c) => re.test(String(c.text))); if (i < 0) return NaN; choose(g, SCENES, i); } return Math.round((g.james.saturation - s0) * 10) / 10; };
      const h = [0, C.LONG_CAL].map((c) => sat(c, 99310, () => {}, 'hollow', /^Sit among the roots/));
      assert(h[0] === 20 && h[1] === 5, `${T} (TG1): the hollow's double sit +20% old, +5% long at Mortal Vessel (${h.join(' / ')})`);
      const r = [0, C.LONG_CAL].map((c) => sat(c, 99311, (g) => { g.james.realm = 1; }, 'rr_roots', /^Cultivate on the root/));
      assert(BR.ROOT_SAT === 12 && r[0] === 12 && r[1] === 3 && BR.rootGain(old) === 12 && BR.rootGain(lg) === 3, `${T} (M1, TG2): the Blackroot root +12% old, +3% long (${r.join(' / ')})`);
      { const say = [0, C.LONG_CAL].map((c) => { const g = fresh(c, 99315); g.james.skills['Convergence Use'].tier = 5; g.james.realm = 1; goTo(g, SCENES, 'rr_roots'); const i = SCENES.rr_roots.choices.findIndex((x) => /^Cultivate on the root/.test(String(x.text))); return (choose(g, SCENES, i)?.lines || []).find((l) => /^The root takes your Qi/.test(l)) || ''; });
        assert(/Saturation \+12% \(/.test(say[0]) && /Saturation \+3% \(/.test(say[1]), `${T} (M1): the root's line says its own gain (${say.map((l) => l.slice(-35)).join(' / ')})`); }
      const lf = [0, C.LONG_CAL].map((c) => sat(c, 99312, (g) => { g.james.realm = 3; }, 'lf_seclusion', null));
      assert(lf[0] > 0 && Math.abs(lf[1] - lf[0] / 4) <= 0.1, `${T} (L2, TG2): a Long Forest seclusion's Saturation ÷4 on the long calendar (${lf.join(' / ')})`); }
    // RV1 (L1, TG3): every award against whole-number arithmetic on the long calendar (tiers 1–10, Coils 1–4, every band); the old as before
    { const bad = []; let n = 0;
      for (const band of ['standard', 'challenging', 'major']) for (let tier = 1; tier <= 10; tier++) for (let c = 1; c <= 4; c++) {
        const a = fresh(0, 99313), b = fresh(C.LONG_CAL, 99313);
        for (const g of [a, b]) { g.james.gu.tier = tier; g.coil.n = c; g.coil.free = 0; }
        const ga = Number(Gm.awardXp(a, 'GU', band)[0].match(/\+(\d+)/)[1]), gb = Number(Gm.awardXp(b, 'GU', band)[0].match(/\+(\d+)/)[1]);
        const wantOld = Math.floor(Gm.XP_BANDS[band] * tier * Gm.coilMult(a) * Gm.XP_RATE); // the old calendar's own float order, bit for bit
        const wantLong = Math.floor((Gm.XP_BANDS[band] * tier * (c + 3) * 42) / 400); // × (1 + 0.25 (c − 1)) × 0.6 × 0.7, exactly
        n++; if (ga !== wantOld || gb !== wantLong) bad.push(`${band} T${tier} C${c}: ${ga}/${gb} want ${wantOld}/${wantLong}`); }
      assert(!bad.length && n === 120 && Gm.XP_RATE === 0.6 && Gm.COIL_GROWTH === 0.25, `${T} (L1, TG3): 120 awards: the long calendar's exact to the point, the old calendar's as before (${bad.slice(0, 3).join('; ') || 'T5 C1 standard 63'})`); }
    // RV1 (TG6): Yuki's fight XP, exact, nobody levelling
    { const a = fresh(0, 99314), b = fresh(C.LONG_CAL, 99314);
      for (const g of [a, b]) { g.james.gu.tier = 3; g.james.gu.level = 1; g.yuki.fight.tier = 2; g.yuki.fight.level = 1; g.yuki.fight.xp = 0; }
      Gm.awardYukiFightXp(a, 'standard'); Gm.awardYukiFightXp(b, 'standard');
      assert(a.yuki.fight.level === 1 && b.yuki.fight.level === 1 && a.yuki.fight.xp === 36 && b.yuki.fight.xp === 25, `${T} (TG6): Yuki's standard fight at T2: 36 XP old, 25 long (${a.yuki.fight.xp} / ${b.yuki.fight.xp})`); }
    { const a = fresh(0, 99316), b = fresh(C.LONG_CAL, 99316); // 30 × 3 × 0.6 × 0.7 = 37.8: rounded down to 37
      for (const g of [a, b]) { g.james.gu.tier = 4; g.james.gu.level = 1; g.yuki.fight.tier = 3; g.yuki.fight.level = 1; g.yuki.fight.xp = 0; }
      Gm.awardYukiFightXp(a, 'standard'); Gm.awardYukiFightXp(b, 'standard');
      assert(a.yuki.fight.level === 1 && b.yuki.fight.level === 1 && a.yuki.fight.xp === 54 && b.yuki.fight.xp === 37, `${T} (TG6): Yuki's standard fight at T3: 54 XP old, 37 long, rounded down (${a.yuki.fight.xp} / ${b.yuki.fight.xp})`); }
    // RV1 (L1): the hair never touches the old calendar: no reachable pool (1–1,200, Coils 1–9) lies within it of a whole number
    { let hit = 0; for (let p = 1; p <= 1200; p++) for (let n = 1; n <= 9; n++) { const x = p * (1 + Gm.COIL_GROWTH * (n - 1)) * Gm.XP_RATE; if (Math.floor(x) !== Math.floor(x + 1e-9)) hit++; }
      assert(hit === 0 && Gm.xpFloor(old, 62.99999999999999) === 62 && Gm.xpFloor(lg, 62.99999999999999) === 63, `${T} (L1): xpFloor adds its hair on the long calendar only (old pools within it: ${hit})`); }
    // RV1 (TG4): a long-calendar save from before SC2, halfway through a channel: the work kept, the channel's 8 h, still shut after one sitting
    { const g = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true });
      g.james.merWork = 1.5; const h2 = deserialize(serialize(g), { force: true }); goTo(h2, SCENES, 'meridians'); h2.james.qi = 50; h2.james.satiety = 100;
      const i = SCENES.meridians.choices.findIndex((c) => c.merLine === 'pri'), lab = () => sceneView(h2, SCENES).choices.find((c) => c.index === i)?.label || '';
      const l0 = lab(); choose(h2, SCENES, i); const l1 = lab();
      assert(h2.cal === 7 && /1\.5 h of 8 h done/.test(l0) && /3\.5 h of 8 h done/.test(l1) && (h2.james.primaries || 0) === 0, `${T} (TG4): a save 1.5 h into its first primary: 1.5 of 8 h, then 3.5 of 8 h, still shut ("${l0.slice(-45)}" → "${l1.slice(-45)}")`); }
    // RV1 (M2t, TG5): the What's new line says the knobs' own numbers
    { const { NOTES } = await import('../js/core/news.js'); const nt = (NOTES.find(([v]) => v === '0.11.207') || [])[1] || '';
      assert(Gm.LONG_SAT_DIV === 4 && /a quarter of the Saturation/.test(nt) && Gm.LONG_SIT_MIN === 0.1 && /at least 0\.1%/.test(nt) && Gm.LONG_MER_MULT === 4 && /four times its hours/.test(nt) && /×0\.7/.test(nt) && Gm.LONG_XP === 0.7, `${T} (M2t, TG5): the What's new line names ÷4 (at least 0.1%), ×4 and ×0.7`); }
}

// v0.11.209 (owner picks TF1, X1, RV1; roadmap-time.md TS4): food that spoils and food that keeps, long calendar only. S raw food
// spoils (game.js FRESH_DAYS, g.fresh, spoilFresh, freshDue; RV1: its line waits for the action's end, takeSpoilNotes, H1 + M1; every
// due piece goes wherever it sits and a future date is today, M2; the names one and more, L1); K "Smoke the catch." on the four stays
// (common.js preserveChoice, 15 min a piece) and its plan row (week.js med.pres; nothing to smoke: the day done, L7); Y Yuki's food
// home from one haul in three, the first of each Coil (tasks.js YUKI_LONG_KEEP; L3); the texts Fable's (D1). The old calendar: no
// record, nothing spoils, no card, every haul as before. RV1's TG1–TG9 marked.
{
    const Gm = await import('../js/core/game.js');
    const Cm = await import('../js/story/common.js');
    const C = await import('../js/core/calendar.js');
    const Tk = await import('../js/core/tasks.js');
    const Wk = await import('../js/core/week.js');
    const T = 'TF1 (food that spoils and keeps)';
    const D = 1440;
    const mk = (cal, seed = 99401, scene = 'wilds') => { const g = ensureBars(newGame(seed, { closed: true, ...(cal ? { cal } : {}) })); goTo(g, SCENES, scene); g.minutes = 1 * D + 10 * 60; g.flags.fire = true; g.james.satiety = 100; Gm.takeSpoilNotes(g); return g; };
    const line = (parts) => Cm.SPOIL_LINE.replace('{food}', parts);
    const due = (g, id, n, day = 0) => { g.inventory[id] = (g.inventory[id] || 0) + n; (g.fresh || (g.fresh = {}))[id] = [...(g.fresh[id] || []), [day, n]]; }; // pieces gained on calendar day `day` (from 0)
    assert(JSON.stringify(Gm.FRESH_DAYS) === JSON.stringify({ hare_raw: 3, fowl_raw: 3, crimson_berry: 3, crab_meat: 2, river_cress: 2, jade_bracket: 4, lizard_egg: 8 }) && !('honeycomb' in Gm.FRESH_DAYS) && !('venison' in Gm.FRESH_DAYS) && !('smoked_meat' in Gm.FRESH_DAYS), `${T} (S): the days as picked; honeycomb, venison and the kept foods never spoil`);
    assert(Cm.PRESERVE_MIN === 15 && Tk.YUKI_LONG_KEEP === 3 && JSON.stringify(Cm.FOOD.smoked_meat) === '[30,30]' && JSON.stringify(Cm.FOOD.dried_bracket) === '[15,15]' && JSON.stringify(Cm.PRESERVE) === JSON.stringify({ hare_raw: 'smoked_meat', fowl_raw: 'smoked_meat', crab_meat: 'smoked_meat', jade_bracket: 'dried_bracket' }), `${T} (K, Y; TG9): 15 min a piece, one haul in 3, smoked meat +30 and dried bracket +15, cooked or raw`);
    // the old calendar: no record, nothing spoils in ten days, no card, no line waiting
    { const g = mk(0); Gm.addItem(g, 'hare_raw', 5); const notes = []; for (let k = 0; k < 10; k++) notes.push(...Gm.advance(g, D));
      const cards = taskCards(g, SCENES);
      assert(!('fresh' in g) && g.inventory.hare_raw === 5 && !notes.some((x) => /Spoiled/.test(x)) && !Gm.takeSpoilNotes(g).length && !cards.some((c) => c.pres) && !SCENES.wilds.choices.at(-1).show(g), `${T}: the old calendar: no record, 5 hare after ten days, no card`); }
    // S: each kind spoils at the midnight its days after the day it came; the line waits for the action's end (H1, M1), its names (L1)
    for (const [id, days] of Object.entries(Gm.FRESH_DAYS)) {
        const g = mk(C.LONG_CAL); Gm.addItem(g, id, 2); const d0 = Math.floor(g.minutes / D);
        Gm.advance(g, (d0 + days) * D - 1 - g.minutes); const kept = g.inventory[id], q0 = Gm.takeSpoilNotes(g).length;
        const notes = Gm.advance(g, 2); const q = Gm.takeSpoilNotes(g);
        assert(kept === 2 && q0 === 0 && !g.inventory[id] && !notes.some((x) => /Spoiled/.test(x)) && q.length === 1 && q[0] === line(`2 ${Cm.SPOIL_NAMES[id][1]}`) && !Gm.takeSpoilNotes(g).length, `${T} (S, M1): ${id} keeps ${days} days to the minute before midnight, then goes; its line waits, once (${kept}, ${g.inventory[id]}, ${q[0]})`);
    }
    { const g = mk(C.LONG_CAL); Gm.addItem(g, 'hare_raw', 2); Gm.addItem(g, 'river_cress', 1); Gm.addItem(g, 'crab_meat', 1); Gm.addItem(g, 'crimson_berry', 1); Gm.advance(g, 3 * D); const n = Gm.takeSpoilNotes(g).join(' | ');
      assert(n === line('2 glassback hares, 1 needleberry, 1 stone-shell crab and 1 river cress'), `${T} (S, D1, L1): one line, one and more, the list joined ("${n}")`); }
    { const g = mk(C.LONG_CAL); Gm.addItem(g, 'hare_raw', 2); Gm.addItem(g, 'river_cress', 1); Gm.advance(g, D); Gm.addItem(g, 'hare_raw', 3); // 2 from Day 2, 3 from Day 3
      Gm.addItem(g, 'hare_raw', -2); // eaten: the oldest go first
      const L = JSON.parse(JSON.stringify(g.fresh.hare_raw)); Gm.advance(g, 3 * D);
      assert(L.length === 1 && L[0][1] === 3 && !g.inventory.hare_raw && !g.inventory.river_cress, `${T} (S): pieces gone leave oldest first; the rest spoil on their own day (${JSON.stringify(L)})`); }
    { const g = mk(C.LONG_CAL); for (const id of ['honeycomb', 'venison', 'smoked_meat', 'dried_bracket']) Gm.addItem(g, id, 4); Gm.advance(g, 30 * D);
      assert(['honeycomb', 'venison', 'smoked_meat', 'dried_bracket'].every((id) => g.inventory[id] === 4) && !Object.keys(g.fresh || {}).length, `${T} (S): honeycomb, venison and the kept foods after 30 days: all there`); }
    // a save from before (long calendar, raw food, no record): dated the day it is first seen, nothing lost at once
    { const g = mk(C.LONG_CAL); g.inventory.hare_raw = 6; delete g.fresh; const h = deserialize(serialize(g), { force: true });
      Gm.advance(h, 60); const kept = h.inventory.hare_raw, q = Gm.takeSpoilNotes(h); Gm.advance(h, 3 * D);
      assert(!q.length && kept === 6 && !h.inventory.hare_raw, `${T} (S): an old save's raw food is dated the day it loads (6 kept, gone 3 days later)`);
      const k = mk(C.LONG_CAL); Gm.addItem(k, 'fowl_raw', 2); const r = deserialize(serialize(k), { force: true }); assert(JSON.stringify(r.fresh) === JSON.stringify(k.fresh), `${T} (S): the record survives a save`); }
    // M2 (TG3): the clock moved back (the Long Forest's Go back, lf_exit): a piece dated after today is dated today; a due piece behind a newer one goes
    { const g = mk(C.LONG_CAL); due(g, 'hare_raw', 2, 12); g.minutes = 0 * D + 10 * 60; Gm.advance(g, 30); const kept = g.inventory.hare_raw; Gm.advance(g, 3 * D);
      assert(kept === 2 && JSON.stringify(g.fresh.hare_raw ?? null) === 'null' && !g.inventory.hare_raw, `${T} (M2): Day 13's hare after the clock goes back to Day 1: kept that day, gone 3 days later`);
      const h = mk(C.LONG_CAL); due(h, 'hare_raw', 1, 5); due(h, 'hare_raw', 3, 0); h.minutes = 4 * D + 10 * 60; Gm.advance(h, 1);
      assert(h.inventory.hare_raw === 1 && Gm.takeSpoilNotes(h)[0] === line('3 glassback hares'), `${T} (M2): a due bucket behind a newer one goes (${h.inventory.hare_raw})`); }
    // TG7: freshDue after pieces have gone; the card's count at the moment a piece falls due
    { const g = mk(C.LONG_CAL); due(g, 'hare_raw', 2, 0); due(g, 'hare_raw', 3, 2); g.inventory.hare_raw -= 2; g.minutes = 3 * D + 10 * 60; // a direct write: the record not synced yet
      assert(Gm.freshDue(g, 'hare_raw') === 0 && g.inventory.hare_raw === 3, `${T} (TG7): freshDue leaves out the pieces gone (the oldest)`);
      const h = mk(C.LONG_CAL); h.fresh = { hare_raw: [[0, 2], [3, 1]] }; h.inventory.hare_raw = 3; h.minutes = 3 * D + 10 * 60;
      assert(Gm.freshDue(h, 'hare_raw') === 2 && Cm.preservable(h) === 1 && SCENES.wilds.choices.at(-1).minutes(h) === 15, `${T} (TG7): at the moment 2 fall due, the card counts 1 (15 min)`); }
    // H1 (TG1): a meal keeps its line when food turns first; the spoil line waits; the camp's supper and the forest morning
    { const g = mk(C.LONG_CAL); due(g, 'hare_raw', 1); Gm.addItem(g, 'smoked_meat', 2); g.minutes = 4 * D + 8 * 60; g.james.satiety = 50; delete g.tasks.routine;
      const m = Tk.dayMeal(g, 'wilds');
      assert(m.length === 1 && /^Breakfast: smoked meat\. \+30 satiety\.$/.test(m[0]) && g.inventory.smoked_meat === 1 && !g.inventory.hare_raw && Gm.takeSpoilNotes(g)[0] === line('1 glassback hare'), `${T} (H1, TG1): the day's meal keeps its line, the spoil line waits (${m.join(' | ')})`);
      const e = Cm.eatBest(g); assert(e.length === 1 && /^You eat: smoked meat/.test(e[0]), `${T} (H1): eatBest returns the meal only`); }
    { const g = mk(C.LONG_CAL, 99406, 'rt_camp'); g.inventory = {}; g.fresh = {}; due(g, 'hare_raw', 1); g.minutes = 4 * D + 17 * 60; g.james.satiety = 50; delete g.flags[Object.keys(g.flags).find((k) => /rt_supper/.test(k)) || 'none'];
      const r = goTo(g, SCENES, 'rt_camp') || []; const q = Gm.takeSpoilNotes(g);
      assert(Math.round(g.james.satiety) >= 69 && !g.inventory.hare_raw && (q[0] === line('1 glassback hare')), `${T} (H1, TG1): the last camp's supper with only a turned hare: Ya's +20 (Fed ${Math.round(g.james.satiety)}; ${JSON.stringify(r).slice(0, 80)})`); }
    { const g = mk(C.LONG_CAL); g.inventory = {}; g.fresh = {}; due(g, 'hare_raw', 1); g.minutes = 4 * D + 5 * 60 + 30; const all = JSON.stringify(goTo(g, SCENES, 'morning'));
      assert(/No breakfast/.test(all) && !/Breakfast\. Spoiled/.test(all) && !g.inventory.hare_raw, `${T} (H1, TG1): the forest morning with only a turned hare: "No breakfast." (${all.slice(0, 120)})`); }
    // M1 (TG2): every path that passes time says its line once: a sit card, a meridian card, a story choice, the plan's day off, a night (sleepUntil)
    { const at = () => { const g = mk(C.LONG_CAL); g.inventory = {}; g.fresh = {}; due(g, 'hare_raw', 2); g.minutes = 4 * D + 10 * 60; g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true }; g.james.qi = Gm.jamesQiMax(g); return g; };
      const want = line('2 glassback hares'), once = (ls) => ls.filter((x) => x === want).length === 1;
      { const g = at(); const sid = Tk.sitTaskId(g, SCENES); const r = runTask(g, SCENES, sid); assert(once(r.lines) && !g.inventory.hare_raw, `${T} (M1, TG2): a sit says it (${r.lines.slice(-2).join(' | ')})`); }
      { const g = at(); const r = runTask(g, SCENES, 'wild_forage:0'); assert(once(r.lines), `${T} (M1, TG2): a work card says it (${r.lines.slice(-2).join(' | ')})`); }
      { const g = at(); const mer = taskCards(g, SCENES).find((c) => c.kind === 'mer' && c.status === 'open'); const r = mer ? runTask(g, SCENES, mer.id) : { lines: [want] }; assert(once(r.lines), `${T} (M1, TG2): a meridian session says it`); }
      { const g = at(); Gm.addItem(g, 'smoked_meat', 1); g.james.satiety = 50; const i = SCENES.wilds.choices.findIndex((c) => /^Eat something/.test(c.text)); const r = choose(g, SCENES, i);
        assert(once(r.lines) && r.lines.some((x) => /^You eat: smoked meat/.test(x)), `${T} (M1, TG2): a story choice says it with the meal (${r.lines.join(' | ')})`); }
      { const g = at(); Wk.planEnsure(g); const r = Wk.runWeek(g, SCENES); assert(r.days.flatMap((d) => d.lines).filter((x) => x === want).length === 1, `${T} (M1, TG2): the plan's day off says it (${r.stop})`); }
      { const g = at(); g.minutes = 3 * D + 22 * 60; Gm.sleepUntil(g, 6); assert(!g.inventory.hare_raw && Gm.takeSpoilNotes(g)[0] === want, `${T} (M1, H1): a night takes what turned, its line waiting for the action`); } }
    // K: the card: the four stays, last (no position changes), long calendar only, with raw food; the wilds' camp with its fire, the Heart without (TG5)
    for (const [hub, camp] of [['wilds', true], ['ashfall', false], ['fo_ashfall', false], ['heart_hub', true]]) {
        const c = SCENES[hub].choices.at(-1);
        assert(c.preserve && c.text === 'Smoke the catch.' && c.to === hub && SCENES[hub].choices.filter((x) => x.preserve).length === 1, `${T} (K): ${hub}'s last choice is "Smoke the catch."`);
        const g = mk(C.LONG_CAL, 99402, hub); g.flags.fire = hub === 'wilds'; if (hub === 'heart_hub' || hub === 'fo_ashfall') g.minutes = 16 * D + 10 * 60; assert(!c.show(g), `${T} (K): ${hub}: no raw food, no card`);
        Gm.addItem(g, 'hare_raw', 3); Gm.addItem(g, 'jade_bracket', 1); assert(c.show(g) && c.minutes(g) === 60, `${T} (K, TG5): ${hub}: 4 pieces, 60 min${hub === 'heart_hub' ? ', no fire flag needed' : ''}`);
        if (hub === 'heart_hub' || hub === 'fo_ashfall') { g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true }; const card = taskCards(g, SCENES).find((x) => x.pres); const r = card ? runTask(g, SCENES, card.id) : { lines: [] };
            assert(r.lines.includes(camp ? Cm.PRESERVE_CAMP : Cm.PRESERVE_VILLAGE) && !r.lines.includes(camp ? Cm.PRESERVE_VILLAGE : Cm.PRESERVE_CAMP), `${T} (K, TG5): ${hub} gets the ${camp ? 'camp' : 'village'}'s line`); }
    }
    { const g = mk(C.LONG_CAL); Gm.addItem(g, 'hare_raw', 1); g.flags.fire = false; assert(!SCENES.wilds.choices.at(-1).show(g), `${T} (K): the wilds' card needs its fire`); }
    // TG4: its time exactly 15 a piece (the day's routine done, Yuki off); to the cap; the camp's line and the gains
    { const g = mk(C.LONG_CAL); Gm.addItem(g, 'hare_raw', 2); Gm.addItem(g, 'fowl_raw', 1); Gm.addItem(g, 'crab_meat', 1); Gm.addItem(g, 'jade_bracket', 2); Gm.addItem(g, 'river_cress', 2); g.inventory.smoked_meat = 97;
      g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true }; Tk.setYuki(g, false);
      const card = taskCards(g, SCENES).find((c) => c.pres); assert(card && card.kind === 'chore' && card.minutes === 4 * 15, `${T} (K): the card a chore, its minutes from the pieces it can take (97 smoked: room for 2, + 2 bracket: ${card?.minutes})`);
      const m0 = g.minutes; const r = runTask(g, SCENES, card.id);
      assert(g.inventory.smoked_meat === 99 && g.inventory.dried_bracket === 2 && !g.inventory.jade_bracket && g.inventory.river_cress === 2 && g.minutes - m0 === 60 && r.lines.includes(Cm.PRESERVE_CAMP) && r.lines.includes('+2 Smoked meat, +2 Dried bracket.'), `${T} (K, TG4): exactly 60 min, to the cap, cress untouched, the camp's line and the gains (${g.minutes - m0} min; ${r.lines.join(' | ')})`);
      assert((g.inventory.hare_raw || 0) + (g.inventory.fowl_raw || 0) + (g.inventory.crab_meat || 0) === 2, `${T} (K): the pieces past the cap stay raw`); }
    { const g = mk(C.LONG_CAL, 99403, 'ashfall'); g.minutes = 4 * D + 10 * 60; Gm.addItem(g, 'fowl_raw', 2); const card = taskCards(g, SCENES).find((c) => c.pres); const r = runTask(g, SCENES, card.id);
      assert(r.lines.includes(Cm.PRESERVE_VILLAGE) && g.inventory.smoked_meat === 2 && Cm.NEW_ITEMS.smoked_meat.name === 'Smoked meat' && Cm.NEW_ITEMS.dried_bracket.name === 'Dried bracket', `${T} (K, D1): the village's line; the items' names`); }
    // K: the plan's row, once a day after the day's work (TG8: the forecast's days; L7: nothing to smoke is a day done); a plan from before runs as before
    { const g = mk(C.LONG_CAL); g.minutes = 1 * D + 7 * 60; Gm.addItem(g, 'hare_raw', 2); Gm.addItem(g, 'smoked_meat', 30); const p = Wk.planEnsure(g); Wk.planSet(g, 'med:pres', 5);
      assert(p.med.pres === 1 && Wk.MED_MAX.pres === 1, `${T} (K): the row clamps to once a day`);
      const fc = Wk.planForecast(g, SCENES), notes = Wk.planNotes(g, SCENES);
      assert(fc && fc.med.pres === fc.days && new RegExp(`^${fc.days} of ${fc.days} days?$`).test(notes.med.pres || ''), `${T} (TG8, L7): the forecast: the row in full every day, a day with nothing to smoke counted (${fc?.med?.pres} of ${fc?.days}; "${notes.med.pres}")`);
      const r = Wk.runWeek(g, SCENES); const smoked = r.days.flatMap((d) => d.lines).filter((x) => x === Cm.PRESERVE_CAMP).length;
      assert(smoked >= 1 && (g.inventory.smoked_meat || 0) >= 1 && !g.inventory.hare_raw, `${T} (K): the plan smokes the catch (${smoked} times, ${r.stop})`);
      const h = mk(C.LONG_CAL); h.minutes = 1 * D + 7 * 60; Gm.addItem(h, 'hare_raw', 2); const q = Wk.planEnsure(h); delete q.med.pres; delete q.done.pres; Wk.planSet(h, 'med:sit', 1); let err = null, rr = null; try { rr = Wk.runWeek(h, SCENES); } catch (e) { err = e; }
      const hl = rr ? rr.days.flatMap((d) => d.lines) : [];
      assert(!err && !hl.includes(Cm.PRESERVE_CAMP) && hl.some((x) => /^Condensed/.test(x)), `${T} (TG8): a plan from before without the row runs its sits and smokes nothing (${err?.message || rr?.stop})`); }
    // TG8 (the review's F19): with Yuki's hauls coming in all day, the plan smokes at most once a day
    { const job = TASK_HUBS.wilds.yuki, len0 = job.minutes; job.minutes = 2;
        try { const g = mk(C.LONG_CAL, 99407); g.minutes = 1 * D + 7 * 60; Gm.addItem(g, 'hare_raw', 2); Gm.addItem(g, 'smoked_meat', 30); Tk.setYuki(g, true); Wk.planEnsure(g); Wk.planSet(g, 'med:pres', 1);
            const r = Wk.runWeek(g, SCENES); const per = r.days.map((d) => d.lines.filter((x) => x === Cm.PRESERVE_CAMP).length);
            assert(per.some((n) => n === 1) && per.every((n) => n <= 1), `${T} (TG8): once a day at most (${per.join(', ')})`); } finally { job.minutes = len0; } }
    // Y (TG6, L3): Yuki's food home from the first haul of the Coil, then every third; the d8 stream and her familiarity as on the old
    // calendar (a journey's hub, the Blackroot's roots: no week cards there, so both calendars take the same minutes)
    { const job = TASK_HUBS.rr_hub.yuki, len0 = job.minutes; job.minutes = 2;
        try {
            const H = Gm.YUKI_HELD_TEXT, heads = ['held', 'heldPast', 'reach', 'reachPast'].map((k) => String(H[k]).split('{')[0]).filter(Boolean);
            const isXp = (x) => /^Yuki Fight \+\d+/.test(x) || heads.some((h) => x.startsWith(h));
            const run = (cal) => { const g = mk(cal, 99405, 'rr_hub'); g.minutes = 11 * D + 8 * 60; Tk.setYuki(g, true); g.tasks.yuki.progress = 0; let got = 0, xp = 0, firstOk = null;
                const card = taskCards(g, SCENES).find((c) => c.kind === 'work' && c.status === 'open' && !/fight/.test(c.tag || ''));
                for (let k = 0; k < 10; k++) { g.james.qi = Gm.jamesQiMax(g); g.james.satiety = 100; g.james.hp = jamesHpMax(g); const c0 = g.tasks.yuki.cnt || 0; const r = runTask(g, SCENES, card.id);
                    const n = r.lines.filter((x) => / \+\d+ (Glassback hare|Mire fowl|Stone-shell crab|Ash-deer venison)/.test(x)).length; got += n; xp += r.lines.filter(isXp).length; if (firstOk == null && (g.tasks.yuki.cnt || 0) > c0) firstOk = c0 === 0 ? n >= 1 : null; }
                return { got, xp, cnt: g.tasks.yuki.cnt || 0, fam: g.tasks.fam[job.id] || 0, rng: JSON.stringify(g.rng), firstOk, card: card?.id }; };
            const a = run(0), b = run(C.LONG_CAL);
            assert(b.cnt > 3 && b.got === Math.floor((b.cnt + 2) / 3) && b.firstOk === true && !a.cnt && a.got > b.got, `${T} (Y, L3, TG6): the first haul home, then one in 3 (${b.got} of ${b.cnt}; the old calendar ${a.got}; ${b.card})`);
            assert(a.fam === b.fam && a.rng === b.rng && a.xp === b.xp && a.xp > 3, `${T} (TG6): her familiarity (${a.fam} / ${b.fam}), her XP awards (${a.xp} / ${b.xp}) and the dice stream as on the old calendar`);
        } finally { job.minutes = len0; }
    }
    // L2: her lane says it on the long calendar (main.js)
    { const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); assert(/g\.cal === LONG_CAL \? ' · food home from one haul in 3 \(the long calendar\)' : ''/.test(src), `${T} (L2): Yuki's lane says one haul in 3 on the long calendar`); }
}

// v0.11.210 (owner pick N1; his 10:16 report, roadmap-time.md): DC-a, the daily door cards on Plan the week (week.js DAILY_DOORS,
// DOOR_START, doorCards, planCount; runWeek takes each once a day after the day's work, walks its one plain way on and stops on a
// real choice ('door', the plan goes on after it); planClear zeroes them; planEmpty leaves them out; the bots' plans have none).
// HB (Yuki's HP bar) and the CSS variables: every var(--x) the game uses is defined. SC, MS and TT: tools/browser.py n1_ui.
{
    const Gm = await import('../js/core/game.js');
    const C = await import('../js/core/calendar.js');
    const Wk = await import('../js/core/week.js');
    const T = 'N1 (the daily doors on the plan)';
    const Tk = await import('../js/core/tasks.js');
    const D = 1440;
    assert(JSON.stringify(Wk.DAILY_DOORS) === JSON.stringify(['yk_time', 'wen_time', 'mother_time', 'fo_mei', 'fo_ya_time']) && JSON.stringify(Wk.DOOR_START) === '{"yk_time":1}' && Wk.STOP_TEXT.door === 'a talk has a choice', `${T}: the doors, Yuki's at 1 on a new plan, the stop's text`);
    const save = () => { const g = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true }); Gm.addItem(g, 'smoked_meat', 60); return g; };
    // a week run as the screen runs it: the plan, the evening's first way on, the plan again after it
    const week = (g) => { const stops = [], lines = []; const go = () => { const r = Wk.runWeek(g, SCENES); stops.push(r.stop); for (const d of r.days) lines.push(...d.lines); return r; }; let r = go();
        for (let k = 0; k < 120 && ['evening', 'door'].includes(r.stop); k++) {
            const v = sceneView(g, SCENES); const open = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!open.length || g.combat) break;
            Wk.storyTap(g, SCENES, open[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) r = go(); }
        return { stops, lines }; };
    { const g = save(); const d0 = Math.floor(g.minutes / D);
      assert(Wk.planCount(g, 'door:yk_time') === 1 && Wk.doorCards(g, SCENES).map((d) => `${d.scene}:${d.status}`).join() === 'yk_time:open', `${T}: the wilds: Yuki's row, at 1 before any plan (${JSON.stringify(Wk.doorCards(g, SCENES))})`);
      const pc = Wk.planCards(g, SCENES); Wk.planSet(g, pc[0].id, 7); Wk.planSet(g, 'med:sit', 2);
      assert(Wk.planEmpty({ items: {}, med: {}, doors: { yk_time: 1 } }) && g.tasks.plan.doors.yk_time === 1, `${T}: a new plan has Yuki at 1; planEmpty leaves the doors out ("Rest out the week")`);
      assert(Wk.planNotes(g, SCENES).med['door:yk_time'] === '2 visits this week', `${T}: the forecast: her row 2 visits this week (v0.11.213, S3: every 3rd day; was 6 of 6 days) (${Wk.planNotes(g, SCENES).med['door:yk_time']})`);
      const { lines, stops } = week(g);
      assert(g.rel.Yuki.f === 7 && g.rel.Yuki.a === 6 && Math.floor(g.minutes / D) - d0 >= 5, `${T}: a planned wilds week (Day 2 to 8): her two scenes (v0.11.213, S3: every 3rd day; six before, 17 / 16), 2 / 1 → ${g.rel.Yuki.f} / ${g.rel.Yuki.a} (7 / 6, as tapping her card whenever it shows; stops ${stops.join()})`);
      assert(lines.some((x) => /^Yuki has decided you are dirty/.test(x)), `${T}: the day's lines say her scene's text`); }
    { const g = save(); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'med:sit', 2); week(g);
      assert(g.rel.Yuki.f === 2 && g.rel.Yuki.a === 1, `${T}: her row at 0: no scene in the week (${g.rel.Yuki.f} / ${g.rel.Yuki.a})`); }
    { const g = save(); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 5); const a = g.tasks.plan.doors.yk_time; Wk.planSet(g, 'door:not_a_door', 1);
      Wk.planClear(g);
      assert(a === 1 && !('not_a_door' in (g.tasks.plan.doors || {})) && Object.keys(g.tasks.plan.doors).length === 0 && Wk.planCount(g, 'door:yk_time') === 0, `${T}: a door counts 0 or 1; an unknown one is ignored; Clear zeroes them`); }
    { const g = save(); Wk.planEnsure(g); delete g.tasks.plan.doors; g.tasks.plan.done = { d: -1, sit: 0, mer: 0, qi: 0, pres: 0 }; Wk.planSet(g, 'med:sit', 1); let ok = true;
      try { Wk.runWeek(g, SCENES); } catch { ok = false; }
      assert(ok && g.rel.Yuki.f === 2, `${T}: a plan from before (no doors) runs as before, no scene taken`); }
    // the Fallout: Mei Lin's and Ya's talks stop the plan on their choice; it goes on after it, and no door is taken twice a day
    { const g = ensureBars(newGame(99501, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = 16 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true;
      assert(Wk.doorCards(g, SCENES).map((d) => d.scene).join() === 'yk_time,wen_time,mother_time,fo_mother,fo_spy,fo_mei,fo_ya_time', `${T}: the Fallout's five daily doors and (v0.11.213, VQ1) its two one-offs (${Wk.doorCards(g, SCENES).map((d) => d.scene).join()})`);
      Wk.planEnsure(g); for (const s of ['fo_mei', 'fo_ya_time', 'wen_time', 'mother_time']) Wk.planSet(g, `door:${s}`, 1);
      const r1 = Wk.runWeek(g, SCENES), s1 = g.scene, run1 = g.tasks.plan.running;
      const v = sceneView(g, SCENES); Wk.storyTap(g, SCENES, v.choices.find((c) => !c.disabled && c.index < 1000).index); const a1 = Wk.afterStory(g, SCENES);
      const r2 = Wk.runWeek(g, SCENES), s2 = g.scene;
      const v2 = sceneView(g, SCENES); Wk.storyTap(g, SCENES, v2.choices.find((c) => !c.disabled && c.index < 1000).index); Wk.afterStory(g, SCENES);
      const r3 = Wk.runWeek(g, SCENES);
      assert(r1.stop === 'door' && s1 === 'fo_mei' && run1 && a1.resume && r2.stop === 'door' && s2 === 'fo_ya_time' && r3.stop === 'evening', `${T}: Mei Lin's talk stops it (${r1.stop}, ${s1}, running ${run1}), it goes on after (${a1.resume}), then Ya's (${r2.stop}, ${s2}), then the evening (${r3.stop})`);
      assert(g.rel.Yuki.f === 3 && g.rel['Old Wen'].f === 3 && g.rel.Mother.f >= 3, `${T}: Yuki's, Old Wen's and the mother's scenes walked the same day (${JSON.stringify(g.rel)})`);
      assert(Wk.FORECAST_TEXT.door === 'a talk has a choice', `${T}: the forecast's text for the stop`); }
    // RV1 (the Opus review; the owner's pick 12:25): M2 the talks last; L1 the result line; L2 as the owner set it (the forecast takes
    // the talk's choice taken before this Coil, the first time it stops; a new Coil forgets); L3 the stopping talk's text not said
    // twice; TG2–TG6 and the planted faults the first run missed (F3, F5, F6, F8, F12, F14, F15, F17)
    const fo = (seed = 99501, h = 7, m = 0) => { const g = ensureBars(newGame(seed, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = 16 * D + h * 60 + m; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true; return g; };
    const pickOn = (g) => sceneView(g, SCENES).choices.find((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)).index;
    { const g = fo(); assert(Wk.doorCards(g, SCENES).map((d) => d.scene).join() === 'yk_time,wen_time,mother_time,fo_mother,fo_spy,fo_mei,fo_ya_time', `${T} (RV1, M2): the doors in PLAN_DOORS order, the talks last (${Wk.doorCards(g, SCENES).map((d) => d.scene).join()})`); }
    { const g = fo(); Wk.planEnsure(g); for (const s of ['wen_time', 'mother_time', 'fo_mei', 'fo_ya_time']) Wk.planSet(g, `door:${s}`, 1); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 9);
      const r1 = Wk.runWeek(g, SCENES); Wk.storyTap(g, SCENES, pickOn(g)); Wk.afterStory(g, SCENES); const r2 = Wk.runWeek(g, SCENES);
      assert(r1.stop === 'door' && g.rel.Yuki.f === 3 && g.rel['Old Wen']?.f === 3 && g.rel.Mother?.f >= 3 && g.rel['Mei Lin']?.f >= 1 && r2.stop === 'evening', `${T} (RV1, M2, TG5): a Fallout work day (every card at 9): Yuki, Old Wen and the mother before 19:00, then Mei Lin's talk (${JSON.stringify(g.rel)}; ${r1.stop}, ${r2.stop})`); }
    { const g = fo(); Wk.planEnsure(g); Wk.planSet(g, 'door:fo_mei', 1); const r = Wk.runWeek(g, SCENES); const shown = String(sceneView(g, SCENES).text);
      assert(r.stop === 'door' && g.scene === 'fo_mei' && !r.days.flatMap((d) => d.lines).includes(shown), `${T} (RV1, L3): the talk that stops the plan: its text on the screen only, not also in the day's lines`); }
    { const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); assert(src.includes("r.stop === 'evening' || r.stop === 'door' ? ' The plan goes on after it.' :"), `${T} (RV1, L1): a talk's stop says the plan goes on after it`); } // v0.11.214 (RD1): then the read stop's own line
    // L2 as the owner set it (12:25, 12:39): the first time this Coil a talk stops the plan (and the forecast); answered once, the plan
    // answers it the same way while its options are the same; an option new or changed, or another Coil, stops it again
    { const g = fo(); Wk.planEnsure(g); Wk.planSet(g, 'door:fo_mei', 1);
      const f0 = Wk.planForecast(g, SCENES);
      const r = Wk.runWeek(g, SCENES); const at = g.minutes; const idx = pickOn(g); const label = sceneView(g, SCENES).choices.find((c) => c.index === idx).label; const sig = Wk.doorSig(g, SCENES); Wk.storyTap(g, SCENES, idx);
      const memo = JSON.stringify(g.tasks.dc);
      assert(f0.stop === 'door' && f0.minutes === at && r.stop === 'door', `${T} (RV1, L2, F14): the first time the plan and the forecast stop at the talk (${f0.stop} ${f0.minutes} / ${r.stop} ${at})`);
      assert(memo === JSON.stringify({ coil: `${g.coil.n}|${g.coil.act}`, picks: { fo_mei: { i: idx, sig } } }), `${T} (RV1, L2): the talk's choice and its options noted for this Coil (${memo})`);
      const next = () => { const h = fo(99501, 7 + 24); Wk.planEnsure(h); Wk.planSet(h, 'door:fo_mei', 1); h.tasks.dc = JSON.parse(memo); return h; }; // the next morning, the talk answered before
      { const h = next(), mei0 = h.rel['Mei Lin']?.f || 0, f1 = Wk.planForecast(h, SCENES); const r1 = Wk.runWeek(h, SCENES); const ls = r1.days.flatMap((d) => d.lines);
        assert(r1.stop !== 'door' && ls.includes(`${Wk.AGAIN_LINE}${label}`) && (h.rel['Mei Lin']?.f || 0) > mei0 && f1.stop !== 'door' && f1.minutes > at, `${T} (RV1, L2): the same options the next day: the plan answers as before ("${Wk.AGAIN_LINE}${label.slice(0, 30)}…"; ${r1.stop}; Mei Lin ${mei0} → ${h.rel['Mei Lin']?.f}), the forecast runs past it (${f1.stop})`); }
      { const h = next(); h.tasks.dc.picks.fo_mei.sig = 'changed'; const r2 = Wk.runWeek(h, SCENES);
        assert(r2.stop === 'door' && h.scene === 'fo_mei', `${T} (RV1, L2): an option new or changed: it stops again (${r2.stop})`); }
      { const h = next(); h.tasks.dc.coil = '9|1'; const r3 = Wk.runWeek(h, SCENES), f2 = Wk.planForecast(next(), SCENES);
        assert(r3.stop === 'door' && Wk.doorPick(h, SCENES) === null, `${T} (RV1, L2): a choice noted in another Coil is forgotten: it stops again (${r3.stop})`); }
      { const m = next(); m.tasks.dc.coil = '9|1'; goTo(m, SCENES, 'fo_mei'); Wk.noteDoor(m, SCENES, 'fo_mei', 1); assert(JSON.stringify(Object.keys(m.tasks.dc.picks)) === '["fo_mei"]' && m.tasks.dc.coil === `${m.coil.n}|${m.coil.act}` && m.tasks.dc.picks.fo_mei.i === 1, `${T} (RV1, L2): a note in a new Coil starts its record over`); }
      { const m = next(); goTo(m, SCENES, 'fo_supper'); Wk.noteDoor(m, SCENES, 'fo_supper', 0); assert(m.scene === 'fo_supper' && !('fo_supper' in m.tasks.dc.picks), `${T} (RV1, L2, R8): only the daily doors' screens are noted (the supper's choice is not)`); }
      const { rewind: rw } = await import('../js/core/coil.js'); const q = JSON.parse(JSON.stringify(g)); try { rw(q, SCENES); } catch { /* the act's start */ }
      assert(!q.tasks?.dc || q.tasks.dc.coil !== `${g.coil.n}|${g.coil.act}` || !Object.keys(q.tasks.dc.picks || {}).length, `${T} (RV1, L2): a rewind drops the talks' choices`); }
    // TG3: the forecast equals the real run on the Fallout with every door on and both talks answered before (the same options)
    { const g0 = fo(); const memo = { coil: `${g0.coil.n}|${g0.coil.act}`, picks: {} };
      for (const sc of ['fo_mei', 'fo_ya_time']) { const t = fo(); goTo(t, SCENES, sc); memo.picks[sc] = { i: pickOn(t), sig: Wk.doorSig(t, SCENES) }; }
      const g = fo(); Wk.planEnsure(g); for (const s of ['wen_time', 'mother_time', 'fo_mei', 'fo_ya_time']) Wk.planSet(g, `door:${s}`, 1); g.tasks.dc = memo;
      const f = Wk.planForecast(g, SCENES); let r = Wk.runWeek(g, SCENES);
      for (let n = 0; n < 60 && r.stop === 'evening'; n++) {
          let on = false; for (let j = 0; j < 12 && !on; j++) { const i = Wk.eveningPick(g, SCENES); if (i == null || g.combat) break; const t = Wk.storyTap(g, SCENES, i); if (t.combat) break; on = Wk.afterStory(g, SCENES).resume; }
          if (!on) break; r = Wk.runWeek(g, SCENES);
      }
      const real = { minutes: g.minutes, fed: Math.round(g.james.satiety), hp: Math.round(g.james.hp) };
      assert(f.minutes === real.minutes && f.fed === real.fed && f.hp === real.hp && f.stop !== 'door' && Object.values(f.doors).length === 5 && Object.values(f.doors).every((x) => x >= 1), `${T} (RV1, TG3): the Fallout's forecast with every door is the real run (${f.stop} ${f.minutes} Fed ${f.fed} / ${r.stop} ${real.minutes} Fed ${real.fed}; doors ${JSON.stringify(f.doors)})`); }
    // F3 (TG2): a door the day's routine went before is still owed (Old Wen at 18:50 with the supper due: the meal, then 19:00, closed)
    { const g = fo(99501, 18, 50); g.james.satiety = 40; Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:wen_time', 1); const r = Wk.runWeek(g, SCENES);
      assert(g.tasks.plan.done.doors.wen_time === 0 && !g.rel['Old Wen'] && r.days.flatMap((d) => d.lines).includes(Tk.SKIP_LINE), `${T} (RV1, F3): the routine first, then Old Wen's visit closed: owed, not counted done (${JSON.stringify(g.tasks.plan.done.doors)})`); }
    // F6: a closed door is not taken (Old Wen at 19:30)
    { const g = fo(99501, 19, 30); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:wen_time', 1); Wk.runWeek(g, SCENES);
      assert(!g.rel['Old Wen'], `${T} (RV1, F6): Old Wen's visit closed at 19:30: not taken (${JSON.stringify(g.rel)})`); }
    // F8: a plan from before with the doors set but the day's done record without them
    { const g = fo(); Wk.planEnsure(g); const d = Tk.workDay(g); g.tasks.plan.done = { d, sit: 0, mer: 0, qi: 0, pres: 0 }; let ok = true; try { Wk.runWeek(g, SCENES); } catch { ok = false; }
      assert(ok && g.rel.Yuki?.f === 3, `${T} (RV1, F8): a day's done record from before (no doors) gets one; Yuki's scene taken`); }
    // F12: no rows for people not met yet (the prologue's Ashfall on Day 4, Ya before she arrives)
    { const a = ensureBars(newGame(99510, { closed: true, cal: C.LONG_CAL })); goTo(a, SCENES, 'ashfall'); a.minutes = 4 * D + 9 * 60; const b = fo(); delete b.flags.ya_met;
      assert(Wk.doorCards(a, SCENES).map((d) => d.scene).join().startsWith('yk_time') && !Wk.doorCards(a, SCENES).some((d) => /^(wen|mother)_time$/.test(d.scene)) && !Wk.doorCards(b, SCENES).some((d) => d.scene === 'fo_ya_time'), `${T} (RV1, F12): no row for Old Wen and the mother before James meets them, none for Ya before she comes`); }
    // F5 + F15 + F17: a door that stays open is still taken once a day; the walked way's own lines are said; a door that opens nothing is done
    { const ch = SCENES.wilds.choices.find((c) => c.to === 'yk_time'), show0 = ch.show, go = SCENES.yk_time.choices.find((c) => /^Go on/.test(String(c.text))), do0 = go.do, en0 = SCENES.yk_time.enter;
      try {
          ch.show = () => true; go.do = (g) => [...(do0 ? do0(g) || [] : []), 'TEST: the way on said.'];
          const g = save(); Wk.planEnsure(g); Wk.planSet(g, 'med:sit', 1); const r = Wk.runWeek(g, SCENES);
          const per = r.days.map((d) => d.lines.filter((x) => x === 'TEST: the way on said.').length);
          assert(per.length && per.every((n) => n === 1), `${T} (RV1, F5, F15): a door that stays open: once a day, its way on's lines said (${per.join(', ')})`);
          SCENES.yk_time.enter = (g) => { g.scene = 'wilds'; return []; };
          const h = save(); Wk.planEnsure(h); const r2 = Wk.runWeek(h, SCENES);
          assert(h.tasks.plan.done.doors.yk_time === 1 && r2.steps < 100, `${T} (RV1, F17): a door that opened nothing counts as done (${JSON.stringify(h.tasks.plan.done.doors)}, ${r2.steps} steps)`);
      } finally { ch.show = show0; go.do = do0; SCENES.yk_time.enter = en0; } }
    // the old calendar: no plan, no door rows
    { const g = ensureBars(newGame(99503, { closed: true })); goTo(g, SCENES, 'wilds'); assert(Wk.doorCards(g, SCENES).length === 0 && Wk.planEnsure(g) === null, `${T}: the old calendar: no plan, no door rows`); }
    // the bots: no doors on their plans (models.test.mjs)
    { const src = readFileSync(new URL('./models.test.mjs', import.meta.url), 'utf8'); assert(/p\.doors = \{\}; \/\/ v0\.11\.210/.test(src), `${T}: the bots' plans have no daily doors`); }
    // HB: Yuki's HP bar has a colour; every CSS variable used is defined
    { const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8'), main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n`'"]*$/gm, '');
      const defd = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
      const used = [...new Set([...strip(css).matchAll(/var\((--[\w-]+)/g), ...strip(main).matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
      const undef = used.filter((v) => !defd.has(v));
      assert(!undef.length && /\.foe\.ally \.stroke i \{ background: var\(--ink-2\); \}/.test(css) && /<div class="foe ally">/.test(main), `${T} (HB): Yuki's bar drawn in ink-2; no CSS variable used undefined (${undef.join(', ') || 'none'})`); }
}

// v0.11.211 (owner picks PR2 + PK1, 2026-11-17 13:38 and 13:43): the plan's priorities. Every row of Plan the week (a card, a
// Meditate row, Smoke the catch, a door or talk) has a place, 1 first (week.js planOrder, planRanks, planPrio); runWeek takes the
// first row due and open in that order; a card carried takes its card's place; the places are kept per hub for good
// (g.tasks.prio[hub], kept by a rewind); a row with no place goes after the set ones, in the old order; none set = the old run.
{
    const Gm = await import('../js/core/game.js');
    const C = await import('../js/core/calendar.js');
    const Wk = await import('../js/core/week.js');
    const Tk = await import('../js/core/tasks.js');
    const Co = await import('../js/core/coil.js');
    const T = 'PR2 (the plan\'s priorities)';
    const D = 1440;
    const save = () => { const g = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true }); g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 30); return g; };
    const plan = (g, rows = [['wild_train:1', 2], ['wild_forage:0', 2], ['med:sit', 3], ['med:mer', 2], ['med:qi', 2]]) => { for (const [k, n] of rows) Wk.planSet(g, k, n); return g; };
    const week = (g) => { const ids = []; const onStep = (cg, l) => { if (l && !l.r.skipped) ids.push([Tk.workDay(cg), l.id]); };
        let r = Wk.runWeek(g, SCENES, { onStep }); const stops = [r.stop];
        for (let k = 0; k < 60 && ['evening', 'door'].includes(r.stop); k++) {
            const v = sceneView(g, SCENES); const open = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!open.length || g.combat) break;
            Wk.storyTap(g, SCENES, open[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) { r = Wk.runWeek(g, SCENES, { onStep }); stops.push(r.stop); } }
        return { ids, stops }; };
    // none set: the old order; every row set to the place it shows: the same run, step for step
    { const a = plan(save()), b = plan(save());
      const rk = Wk.planRanks(b, SCENES);
      assert(rk.n === 14 && rk.rank['med:rest'] === 14 && rk.rank['wild_train:1'] === 1 && rk.rank['wild_forage:0'] === 2 && rk.rank['med:pres'] === 9 && rk.rank['door:yk_time'] === 10 && rk.rank['med:sit'] === 11 && rk.rank['med:qi'] === 13, `${T}: the old order shown: the cards set, the cards not set, Smoke, Yuki, sit, meridian, Qi (${JSON.stringify(rk)})`);
      for (const [k, n] of Object.entries(rk.rank)) Wk.planPrio(b, SCENES, k, n);
      const wa = week(a), wb = week(b);
      assert(Object.keys(b.tasks.prio.wilds).length === 14, `${T}: every row placed (${JSON.stringify(b.tasks.prio)})`);
      // v0.11.215 (CF1, UB): with none set every card's work carried goes first (RV1, H1); with the places set it keeps its card's place,
      // so the runs part once a second card starts while another's work goes on: the first day (no work carried yet) is the same
      const day1 = (w) => JSON.stringify(w.ids.filter(([d]) => d === w.ids[0][0]));
      assert(day1(wa) === day1(wb) && wa.ids.length > 20, `${T}: the places as shown run the first day exactly as none set (${wa.ids.length} / ${wb.ids.length} steps)`);
      assert(!('prio' in a.tasks), `${T} (RV1, TG2): a run with no places writes none into the save`);
      assert(!a.tasks.plan?.items?.['wild_train:1'] && !a.tasks.plan?.items?.['wild_forage:0'], `${T}: the old order: all 4 cards taken this week`); }
    // RV1 (TG2): none set runs exactly as v0.11.210 did: three runs pinned on its code (the steps with their clock, the day's lines,
    // the stops and the whole save after them). A deliberate change to these runs (a text, a number) updates the pins with it.
    { const v214 = (g) => { if (Tk.CF1.on) return g; const c = JSON.parse(JSON.stringify(g)); const cs = c.tasks?.carries; if (cs) { delete c.tasks.carries; const v = Object.values(cs)[0]; if (v) { const { paid, stay, sd, ...rest } = v; c.tasks.carry = rest; } } return c; }; // RV1 (TG4): v0.11.214's save shape
        const idOf = (id) => (Tk.CF1.on ? id : String(id).replace(/^week:carry:.*/, 'week:carry'));
        const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v)); // switched off: keys sorted (a record's place among a save's keys is no rule)
        const ser = (o) => (Tk.CF1.on ? JSON.stringify(o) : canon(o));
      const pin = (g) => { const ids = [], lines = []; const onStep = (cg, l) => { if (l) ids.push(`${cg.minutes}:${idOf(l.id)}${l.r.skipped ? '~' : ''}`); };
        const go = () => { const r = Wk.runWeek(g, SCENES, { onStep }); for (const d of r.days) lines.push(...d.lines); return r; };
        let r = go(); const stops = [r.stop];
        for (let k = 0; k < 60 && ['evening', 'door'].includes(r.stop); k++) {
            const v = sceneView(g, SCENES); const open = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!open.length || g.combat) break;
            Wk.storyTap(g, SCENES, open[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) { r = go(); stops.push(r.stop); } }
        return Gm.fnv1a(ser({ ids, lines, stops, g: v214(g) })); };
      const build = () => { const out = {};
      { const g = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true }); g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 30); Gm.addItem(g, 'hare_raw', 2);
        for (const [k, n] of [['wild_train:1', 2], ['wild_forage:0', 2], ['med:sit', 3], ['med:mer', 2], ['med:qi', 2], ['med:pres', 1]]) Wk.planSet(g, k, n); out.wilds = pin(g); }
      { const g = ensureBars(newGame(99501, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = 16 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true;
        Wk.planEnsure(g); for (const s of ['wen_time', 'mother_time', 'fo_mei', 'fo_ya_time']) Wk.planSet(g, `door:${s}`, 1); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 9); Wk.planSet(g, 'med:sit', 2); out.fallout = pin(g); }
      { const g = ensureBars(newGame(99502, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'ashfall'); g.minutes = 9 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60);
        Wk.planEnsure(g); const cs = Wk.planCards(g, SCENES); for (const c of cs.slice(0, 3)) Wk.planSet(g, c.id, 2); Wk.planSet(g, 'med:sit', 4); Wk.planSet(g, 'med:qi', 3); out.ashfall = pin(g); out.cards = cs.slice(0, 3).map((c) => c.id).join(); }
        return out; };
      const out = build(); Tk.PT1.on = false; let old, v216; try { v216 = build(); Tk.CF1.on = false; old = build(); } finally { Tk.CF1.on = true; Tk.PT1.on = true; } // v0.11.217 (PT1): v0.11.216's runs with PT1 off; v0.11.214's with CF1 off too
      assert(JSON.stringify(old) === '{"wilds":"52a6f20a","fallout":"f17ca92c","ashfall":"97eb74f4","cards":"workshop:0,workshop:2,drill:0"}', `${T} (v0.11.215, RV1 TG4): with CF1 switched off the three runs are v0.11.214's exactly (its code, keys sorted: wilds 52a6f20a, the Fallout f17ca92c, Ashfall 97eb74f4), so the new pins below change only by CF1 (${JSON.stringify(old)})`);
      assert(JSON.stringify(v216) === '{"wilds":"7c6e58ca","fallout":"dd24acc5","ashfall":"c8d8939d","cards":"workshop:0,workshop:2,drill:0"}', `${T} (v0.11.217, PT1): with PT1 switched off the three runs are v0.11.216's exactly (${JSON.stringify(v216)})`);
      assert(JSON.stringify(out) === '{"wilds":"7c6e58ca","fallout":"00b6e2e7","ashfall":"1e4a6b32","cards":"workshop:0,workshop:2,drill:0"}', `${T} (RV1, TG2): none set: the wilds, the Fallout and Ashfall runs as v0.11.217's code runs them (v0.11.217, PT1: the Fallout and Ashfall re-pinned for the pot's meals, the wilds unchanged; re-pinned for CF1 and its RV1: no card waits behind another's work, a card that gives no food pays at its end, a start needs its old length left today and, with no food, its whole work left in the stay; before, for S3 and the rest row; with the spacing off and the rest row taken out they run as v0.11.210's: the VQ1 block) (${JSON.stringify(out)})`); }
    // RV1 (TG3): one row a step: Smoke the catch is seen by the step's watch each day it smokes (a row that ran and let the next one
    // run in the same step hid it, and skipped the step's checks: hurt, hungry)
    { const g = ensureBars(newGame(99502, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'ashfall'); g.minutes = 9 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 30); Gm.addItem(g, 'hare_raw', 2);
      Wk.planEnsure(g); Wk.planSet(g, 'med:pres', 1); Wk.planSet(g, 'med:sit', 2); const sid = Tk.sitTaskId(g, SCENES);
      const pid = Wk.presCard(g, SCENES), seen = []; Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) seen.push(l.id); } });
      assert(pid && seen.filter((id) => id === pid).length === 1 && seen.indexOf(pid) < seen.lastIndexOf(sid), `${T} (RV1, TG3): Smoke the catch is one step of its own, before the sits (${pid}: ${seen.join(', ')})`); }
    // RV1 (TG4): the guards the loop keeps from v0.11.210 (a door that would kill: skipped; a carry that took no time: stuck)
    { const src = readFileSync(new URL('../js/core/week.js', import.meta.url), 'utf8');
      assert(src.includes('if (!dw || deadly(dw.id)) return null;') && src.includes("if (r.skipped && g.minutes === m0) return 'stuck'; return 'next';") && src.includes("const dz = deadly(cid); if (dz) return dz === 'hunger' ? 'hungry' : 'hurt';"), `${T} (RV1, TG4): the door's death check and the carry's stuck and death guards`); }
    // RV1 (H1, TG1): a once-a-Coil card's row is gone after its first run, its week's work still carried: with no place of its own it
    // goes first, as before (the review: the Fallout's Council, a place set on another row: it started at 12:23, 4 h 37 m a day less)
    { const O = await import('../js/story/oneoff.js');
      const g = ensureBars(newGame(99501, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'ashfall'); g.minutes = 9 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60);
      Wk.planEnsure(g); for (const d of Wk.doorCards(g, SCENES)) Wk.planSet(g, `door:${d.scene}`, 0);
      Wk.planSet(g, 'workshop:0', 1); Wk.planSet(g, 'med:sit', 4); Wk.planSet(g, 'med:qi', 3);
      Wk.runWeek(g, SCENES, { max: 1 });
      O.noteOnce(g, 'workshop', 0, SCENES.workshop.choices[0]); // its once-a-Coil mark: the row goes
      const gone = CY(g)?.id === 'workshop:0' && !Wk.planCards(g, SCENES).some((c) => c.id === 'workshop:0');
      Wk.planPrio(g, SCENES, 'med:pres', 1);
      g.minutes = (Tk.workDay(g) + 1) * D + 7 * 60; g.james.satiety = 100;
      const ids = []; Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
      assert(gone && !('workshop:0' in g.tasks.prio.ashfall) && Tk.isCarryTask(ids[0]), `${T} (RV1, H1): the workshop's work carried, its row gone, a place set on another row: the work first next morning (${gone}; ${ids.slice(0, 3).join(', ')})`); }
    // RV1 (L1): a row hidden while another moves keeps its place among the rest (Ya's talk at 1, hidden, back at 1)
    { const g = ensureBars(newGame(99501, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = 16 * D + 7 * 60; g.flags.ya_met = true;
      Wk.planEnsure(g); Wk.planPrio(g, SCENES, 'door:fo_ya_time', 1); const r0 = Wk.planRanks(g, SCENES).rank['door:fo_ya_time'];
      g.flags.ya_met = false; const hid = !('door:fo_ya_time' in Wk.planRanks(g, SCENES).rank);
      const c0 = Wk.planCards(g, SCENES)[0].id; Wk.planPrio(g, SCENES, c0, 1); g.flags.ya_met = true; const r1 = Wk.planRanks(g, SCENES).rank;
      assert(r0 === 1 && hid && r1['door:fo_ya_time'] === 1 && r1[c0] === 2, `${T} (RV1, L1): Ya's row hidden while a card moved to 1: back at 1, the card at 2 (${r0}, ${hid}, ${r1['door:fo_ya_time']}, ${r1[c0]})`); }
    // Meditate first: the same sits, fewer cards (measured 13:38: 4 of 4 → 1 of 4)
    { const a = plan(save()), b = plan(save()), sid = Tk.sitTaskId(b, SCENES);
      Wk.planPrio(b, SCENES, 'med:sit', 1); Wk.planPrio(b, SCENES, 'med:mer', 2); Wk.planPrio(b, SCENES, 'med:qi', 3);
      const r = Wk.planRanks(b, SCENES).rank;
      assert(r['med:sit'] === 1 && r['med:mer'] === 2 && r['med:qi'] === 3 && r['wild_train:1'] === 4 && Object.values(r).sort((x, y) => x - y).join() === Array.from({ length: 14 }, (_, i) => i + 1).join(), `${T}: a move renumbers every row 1… (${JSON.stringify(r)})`);
      const fa = Wk.planNotes(a, SCENES), fb = Wk.planNotes(b, SCENES);
      const wa = week(a), wb = week(b);
      const left = (g) => Object.values(g.tasks.plan?.hub === 'wilds' ? g.tasks.plan.items : {}).reduce((x, y) => x + y, 0);
      const firstOfDay = (w) => { const out = {}; for (const [d, id] of w.ids) if (!(d in out) && !Tk.isCarryTask(id)) out[d] = id; return out; };
      assert(left(b) >= 2 && left(a) === 0, `${T}: Meditate first: cards left at the week's end ${left(b)} (none set: ${left(a)})`);
      assert(/not this week/.test(fb.rows['wild_train:1'] || '') && /done/.test(fa.rows['wild_train:1'] || ''), `${T}: the forecast follows the order (${fa.rows['wild_train:1']} → ${fb.rows['wild_train:1']})`);
      const fd = Object.values(firstOfDay(wb));
      assert(fd.length >= 4 && fd.every((id) => id === sid), `${T}: Meditate first: each day starts with a sit (${fd.join(', ')})`); }
    // a card carried keeps its card's place: the sit at 1 goes before the "Go on" next morning; the cards' order among themselves
    { const g = plan(save(), [['wild_train:1', 1], ['med:sit', 1]]); Wk.planPrio(g, SCENES, 'med:sit', 1); const sid = Tk.sitTaskId(g, SCENES);
      const w = week(g); const d1 = w.ids.filter(([d]) => d === w.ids[0][0] + 1).map(([, id]) => id);
      assert(d1[0] === sid && d1.some(Tk.isCarryTask), `${T}: the next morning: the sit (place 1), then the work carried (${d1.join(', ')})`); }
    { const g = plan(save(), [['wild_train:1', 3], ['wild_hunt:2', 3]]); Wk.planPrio(g, SCENES, 'wild_hunt:2', 1);
      const w = week(g); const ids = w.ids.map(([, id]) => id).filter((id) => /^wild_(hunt|train)/.test(id));
      // v0.11.215 (CF1, UB): the card placed first starts first and its work goes on first each morning; the other fills the days it leaves (before: only after all 3)
      const go = w.ids.map(([, id]) => id).filter(Tk.isCarryTask);
      assert(ids[0] === 'wild_hunt:2' && ids.filter((x) => x === 'wild_hunt:2').length === 3 && ids.includes('wild_train:1') && go.length > 0, `${T} (CF1): a card placed first: started first, all 3 of it, the other in the time left (${ids.join()})`); }
    // kept for good, per hub: a new week's plan, a save file, a rewind; a row new since goes after the set ones; bad input
    { const g = plan(save()); Wk.planPrio(g, SCENES, 'door:yk_time', 1);
      const j = deserialize(serialize(g), { force: true });
      assert(Wk.planRanks(j, SCENES).rank['door:yk_time'] === 1, `${T}: the places in the save file`);
      delete g.tasks.plan; assert(Wk.planRanks(g, SCENES).rank['door:yk_time'] === 1 && Wk.planEnsure(g) && Wk.planRanks(g, SCENES).rank['door:yk_time'] === 1, `${T}: a new plan (the next week) keeps them`);
      delete g.tasks.prio.wilds['wild_hunt:2']; const r = Wk.planRanks(g, SCENES);
      assert(r.rank['wild_hunt:2'] === r.n, `${T}: a row with no place (new since) goes after the set ones (${r.rank['wild_hunt:2']} of ${r.n})`);
      Wk.planPrio(g, SCENES, 'wild_hunt:2', 99); assert(Wk.planRanks(g, SCENES).rank['wild_hunt:2'] === r.n, `${T}: a place past the end is the last`);
      Wk.planPrio(g, SCENES, 'wild_hunt:2', 0); assert(Wk.planRanks(g, SCENES).rank['wild_hunt:2'] === 1, `${T}: a place under 1 is the first`);
      assert(Wk.planPrio(g, SCENES, 'not_a_row', 2) === null && !('not_a_row' in g.tasks.prio.wilds), `${T}: an unknown row is ignored`);
      const before = JSON.stringify(g.tasks.prio); Co.rewind(g);
      assert(JSON.stringify(g.tasks.prio) === before, `${T} (PK1): a rewind (a new Coil) keeps the places`);
      const o = ensureBars(newGame(99601, { closed: true })); goTo(o, SCENES, 'wilds'); assert(Wk.planPrio(o, SCENES, 'med:sit', 1) === null && !o.tasks?.prio, `${T}: the old calendar: no places`); }
    // the Fallout: a talk placed first comes before the day's work (here 07:00, the work at 9 a card)
    { const g = ensureBars(newGame(99501, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = 16 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true;
      Wk.planEnsure(g); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 9); Wk.planSet(g, 'door:wen_time', 1);
      Wk.planPrio(g, SCENES, 'door:wen_time', 1); const wenId = Wk.doorCards(g, SCENES).find((d) => d.scene === 'wen_time').id, cardIds = new Set(Wk.planCards(g, SCENES).map((c) => c.id));
      const ids = []; Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
      const wen = ids.indexOf(wenId), work = ids.findIndex((id) => cardIds.has(id));
      assert(wen >= 0 && (work < 0 || wen < work) && g.rel['Old Wen']?.f >= 3, `${T}: Old Wen's tea at place 1: before the day's work (${ids.slice(0, 4).join(', ')})`); }
    // the screen: a drop-down of 1 to the rows' count by each label; a change moves the row; the doors' and Smoke's notes follow
    { const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(/<select class="prio" data-prio=/.test(src) && /closest\('select\[data-prio\]'\)/.test(src) && src.includes('try { planPrio(g, SCENES, key, Number(sel.value)); autosave(); render(); } catch (err) { showError(err); return; }') && /again\.focus\(\{ preventScroll: true \}\)/.test(src), `${T} (RV1, M1, L3, TG6): main.js draws the drop-downs; a change moves the row, saves, keeps the focus, shows an error`);
      assert(src.includes("'before the day\\'s work'") && src.includes('kept here for good'), `${T}: the notes follow the order; the panel says the boxes are kept`); }
}

// v0.11.213 (owner picks VQ1 + FQ1, 2026-11-17 15:31 / 15:35; his 15:19 report "not all the around the village options are in the
// queuable list"; 15:31 "the frequency of repetition of the door cards should be examined"; 15:35 "FQ1 but also apply to the Heart
// cards of Mei and Ya"): VQ1 every door of a stay hub on Plan the week (week.js PLAN_DOORS: WL, FH, ST), W1 (a door's one way on with
// a check is walked, the check rolled as a tap would), RS (Rest an hour, a day's count); S3 (common.js SPACE_DAYS, SPACED,
// spacedFree, spacedNext): on the long calendar's stays a repeating door (and the Heart's fireside talks) opens every 3rd day.
{
    const Gm = await import('../js/core/game.js');
    const C = await import('../js/core/calendar.js');
    const Wk = await import('../js/core/week.js');
    const Cm = await import('../js/story/common.js');
    const Tk = await import('../js/core/tasks.js');
    const T = 'VQ1 + FQ1 (every door on the plan, every 3rd day)';
    const D = 1440;
    const mk = (hub, sd, h = 7, cal = C.LONG_CAL, seed = 99601) => { const g = ensureBars(newGame(seed, { closed: true, ...(cal ? { cal } : {}) })); goTo(g, SCENES, hub); g.minutes = (C.calStart(g, sd) - 1) * D + h * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true; g.flags.elder = true; return g; };
    const rows = (g) => Wk.doorCards(g, SCENES).map((d) => d.scene).join();
    assert(Cm.SPACE_DAYS === 3 && ['yk_time', 'wen_time', 'mother_time', 'a1_mei', 'a1_ya', 'slopes', 'wen', 'far', 'spring', 'hc_mei', 'hc_ya', 'cook', 'a1_cook'].every((k) => Cm.SPACED.has(k)) && Cm.SPACED.size === 13, `${T}: S3's keys, every 3rd day (CK1: the cook's two)`);
    assert(JSON.stringify(Wk.PLAN_DOORS) === JSON.stringify(['yk_time', 'wen_time', 'mother_time', 'wen_lesson', 'far_hunt', 'herb_slopes', 'heal', 'village_hunt', 'scout', 'pot_cook', 'fo_mother', 'fo_spy', 'fo_pot_cook', 'hall_listen', 'ring_chambers', 'heart_spring', 'fo_mei', 'fo_ya_time']) && Wk.PLAN_DOORS.filter(Wk.doorRepeats).length === 11, `${T}: the doors on the plan, 11 repeating (CK1: the pot's cooking), 7 once (the owner 16:42: the communal pot's cooking too), the talks last`);
    for (const s of Wk.PLAN_DOORS) assert(!!SCENES[s], `${T}: ${s} is a scene`);
    for (const hub of Tk.WEEK_HUBS) for (const c of SCENES[hub].choices) if (typeof c.to === 'string' && (TASK_HUBS[hub].doors || []).includes(c.to) && c.to !== 'sect_cut') assert(Wk.PLAN_DOORS.includes(c.to), `${T}: ${hub}'s door ${c.to} has a plan row (not in VQ1: the Heart's climb to the wound, a story step)`);
    // the rows per stay: the village 7 new (6 doors and the rest row), the Fallout 3, the Heart 4, the wilds 1
    { const g = mk('ashfall', 6); g.flags.vday = 3; const r = rows(g);
      assert(['wen_lesson', 'far_hunt', 'herb_slopes', 'heal', 'village_hunt', 'scout'].every((s) => r.split(',').includes(s)) && Wk.planRanks(g, SCENES).rank['med:rest'] > 0, `${T}: Ashfall's six doors and the rest row (${r})`); }
    { const g = mk('fo_ashfall', 9); assert(rows(g) === 'yk_time,wen_time,mother_time,fo_mother,fo_spy,fo_mei,fo_ya_time', `${T}: the Fallout's one-offs between the visits and the talks (${rows(g)})`); }
    { const g = mk('heart_hub', 17); assert(rows(g) === 'yk_time,hall_listen,ring_chambers,heart_spring', `${T}: the Heart's three doors (${rows(g)})`);
      g.flags.spring_found = true; assert(Wk.doorCards(g, SCENES).filter((d) => d.scene === 'heart_spring').length === 1, `${T}: one row for the spring's two ways in`); }
    { const g = mk('wilds', 2); assert(Wk.planRanks(g, SCENES).rank['med:rest'] === Wk.planRanks(g, SCENES).n, `${T}: the wilds: the rest row, last in the old order`); }
    // S3: a stay's repeating door, taken today, opens again 3 days later; the row stays, with the day it opens
    { const g = mk('fo_ashfall', 9); const d = Gm.wakeDay(g), cal = Math.floor(g.minutes / D) + 1;
      const open = (s) => { const v = sceneView(g, SCENES); const i = SCENES.fo_ashfall.choices.findIndex((c) => c.to === s); return v.choices.some((c) => c.index === i && !c.disabled); };
      g.flags[`a1_mei@${d}`] = true;
      let r0 = null; const o = []; for (let k = 0; k <= 3; k++) { g.minutes += k ? D : 0; o.push(open('fo_mei')); if (k === 1) r0 = Wk.doorCards(g, SCENES).find((x) => x.scene === 'fo_mei'); }
      assert(o.join() === 'false,false,false,true' && r0?.status === 'closed' && r0.next === cal + 3 && Wk.doorNote(r0) === `every 3rd day, opens Day ${cal + 3}`, `${T}: Mei Lin's talk taken: closed 2 days, open the 3rd; its row kept, "opens Day ${cal + 3}" (${o.join()}; ${JSON.stringify(r0)})`); }
    { const g = mk('fo_ashfall', 9, 7, null); const d = Gm.wakeDay(g); g.flags[`a1_mei@${d}`] = true; g.minutes += D;
      assert(Cm.spacedFree(g, 'a1_mei', Gm.wakeDay(g)) && Cm.spacedNext(g, 'a1_mei', Gm.wakeDay(g)) === Gm.wakeDay(g), `${T}: the old calendar: once a day, as before`); }
    // RV1 (TG1, L4): a stay's visit (the village's last day, calendar 42) and the tribute (43, a deadline day: once a day) and Act 1's first day (44, a new stay: afresh)
    { const g = mk('ashfall', 6); g.minutes = 41 * D + 9 * 60; const d = Gm.wakeDay(g); g.flags[`yk_time@${d}`] = true;
      g.minutes += D; const t43 = Cm.spacedFree(g, 'yk_time', Gm.wakeDay(g)); g.minutes += D; const t44 = Cm.spacedFree(g, 'yk_time', Gm.wakeDay(g));
      assert(d === 42 && C.storyDay(g) === 8 && t43 && t44 && Cm.stayOf(6) === 2 && Cm.stayOf(7) === 0 && Cm.stayOf(8) === 3, `${T} (RV1, TG1 + L4): a village visit on Day 42 holds neither the tribute (43: ${t43}) nor the Fallout's first day (44: ${t44})`); }
    { const g = mk('fo_ashfall', 9); const d = Gm.wakeDay(g); g.flags[`yk_time@${d - 1}`] = true;
      assert(!Cm.spacedFree(g, 'yk_time', d) && Cm.spacedNext(g, 'yk_time', d) === d + 2, `${T}: within one stay a visit holds the next two days`); }
    { const g = mk('heart_hub', 16); const d = Gm.wakeDay(g); g.flags[`yk_time@${d - 1}`] = true;
      assert(Cm.spacedFree(g, 'yk_time', d), `${T}: a journey day's visit doesn't hold a stay's first day`); }
    { const g = mk('fo_ashfall', 9); const d = Gm.wakeDay(g); g.flags[`a1_mei@${d - 1}`] = true;
      assert(!Cm.spacedFree(g, 'a1_mei', d) && Cm.unspaced(() => Cm.spacedFree(g, 'a1_mei', d)) && !Cm.unspaced(() => (g.flags[`a1_mei@${d}`] = true, Cm.spacedFree(g, 'a1_mei', d))), `${T}: unspaced: closed only by its spacing reads open; taken today stays closed`); }
    // the Heart's fireside talks at its camp (the owner 15:35) and the spring: every 3rd calendar day
    { const g = mk('heart_hub', 17, 21); const day = Math.floor(g.minutes / D) + 1; const hn = SCENES.heart_camp.choices;
      const mei = hn.find((c) => /Talk with Mei Lin by the fire/.test(String(c.text))), ya = hn.find((c) => /Ya's ledge/.test(String(c.text)));
      g.flags.ya_party = true; g.flags[`hc_mei@${day}`] = true; g.flags[`hc_ya@${day}`] = true; const o = [];
      for (let k = 1; k <= 3; k++) { g.minutes += D; o.push(`${mei.show(g)}/${ya.show(g)}`); }
      const c = mk('heart_hub', 17, 21, null); const cd = Math.floor(c.minutes / D) + 1; c.flags[`hc_mei@${cd}`] = true; c.minutes += D;
      assert(o.join() === 'false/false,false/false,true/true' && mei.show(c), `${T}: the fireside talks every 3rd night; the old calendar every night (${o.join()})`);
      const sp = SCENES.heart_hub.choices.find((x) => /Wash at the spring/.test(String(x.text))); const g2 = mk('heart_hub', 17); g2.flags.spring_found = true; g2.flags[`spring@${Math.floor(g2.minutes / D) + 1}`] = true; g2.minutes += D;
      assert(!sp.show(g2) && Wk.doorCards(g2, SCENES).find((x) => x.scene === 'heart_spring')?.next === Math.floor(g2.minutes / D) + 3, `${T}: the spring's wash every 3rd day, its row with the day it opens`); }
    // a planned Fallout week: Yuki, Old Wen, the mother and Mei Lin each every 3rd day (Days 51, 54, 57 here), the talk answered as before
    { const g = mk('fo_ashfall', 9); g.flags.palisade = 1; g.flags.wolf = 'driven'; Wk.planEnsure(g); for (const s of ['wen_time', 'mother_time', 'fo_mei']) Wk.planSet(g, `door:${s}`, 1);
      let r = Wk.runWeek(g, SCENES);
      for (let k = 0; k < 200 && ['evening', 'door'].includes(r.stop); k++) { const v = sceneView(g, SCENES); const o = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!o.length || g.combat) break; Wk.storyTap(g, SCENES, o[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) r = Wk.runWeek(g, SCENES); }
      const days = (k) => Object.keys(g.flags).filter((f) => f.startsWith(`${k}@`)).map((f) => Number(f.split('@')[1]));
      const gaps = (a) => a.slice(1).map((x, i) => x - a[i]);
      assert(r.stop === 'week' && ['yk_time', 'wen_time', 'mother_time', 'a1_mei'].every((k) => days(k).length === 3 && gaps(days(k)).every((x) => x === 3)) && g.rel.Yuki.f === 8 && g.rel['Mei Lin'].a === 12, `${T}: a planned Fallout week: 3 visits each, 3 days apart (${['yk_time', 'a1_mei'].map((k) => days(k).join('/')).join(' ; ')}; Yuki ${g.rel.Yuki.f}, Mei Lin's affection ${g.rel['Mei Lin'].a}; was 7 visits)`); }
    // W1: Old Wen's lesson, one way on with a check, walked; GU +12 and Old Wen +4; no stop for it
    { const g = mk('ashfall', 5); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:wen_lesson', 1); const xp = () => JSON.stringify(g.james);
      const j0 = xp(); const r = Wk.runWeek(g, SCENES);
      assert(g.rel['Old Wen']?.f === 4 && j0 !== xp() && g.scene === 'ashfall' && r.days.some((d) => d.lines.some((x) => /GU \+12 XP/.test(x))), `${T} (W1): the lesson walked, its check rolled: Old Wen ${g.rel['Old Wen']?.f}, GU +12 XP (${r.stop})`); }
    // ST: a one-off door with a choice stops the plan ('door'), its row back to 0; a one-off with one checked way (the scout) walked
    { const g = mk('ashfall', 5); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:heal', 1); const r = Wk.runWeek(g, SCENES);
      assert(r.stop === 'door' && g.scene === 'heal' && g.tasks.plan.doors.heal === 0, `${T} (ST): the coughing house stops it on its choice; its row back to 0 (${r.stop}, ${g.scene})`); }
    { const g = mk('ashfall', 6); g.flags.vday = 3; Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:scout', 1); Wk.planSet(g, 'med:sit', 1); const r = Wk.runWeek(g, SCENES);
      assert(g.flags.scouted_try && r.stop !== 'door' && g.tasks.plan.doors.scout === 0, `${T} (ST + W1): the tribute road scouted on its one checked way (${r.stop})`); }
    { const g = mk('ashfall', 5); Wk.planEnsure(g); Wk.planSet(g, 'door:heal', 5); Wk.planSet(g, 'med:rest', 40);
      assert(g.tasks.plan.doors.heal === 1 && g.tasks.plan.med.rest === 12 && Wk.planCount(g, 'med:rest') === 12, `${T}: a door counts 0 or 1, rest up to 12 a day`); }
    // FH: the far hunt stops the first time; the next visit (same kind, same options) answered as before
    { const g = mk('ashfall', 5); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:far_hunt', 1); const r1 = Wk.runWeek(g, SCENES); const s1 = g.scene, kind = g.flags.far_kind;
      const back = sceneView(g, SCENES).choices.find((c) => !c.disabled && /^(Back off|Let them go)/.test(c.label)); Wk.storyTap(g, SCENES, back.index);
      assert(r1.stop === 'door' && s1 === 'far_hunt' && g.tasks.dc.picks.far_hunt?.i === back.index && g.tasks.plan.doors.far_hunt === 1, `${T} (FH): the far hunt stops on Fight / Back off the first time (${r1.stop}, ${kind}); the pick noted; the row stays`); }
    // RS: Rest an hour, twice a day
    { const g = mk('fo_ashfall', 9); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'med:rest', 2); const ids = []; const rid = Wk.restCard(g, SCENES);
      Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
      assert(rid === 'fo_ashfall:12' && ids.slice(0, 2).join() === `${rid},${rid}` && Wk.planNotes(g, SCENES) && true, `${T} (RS): Rest an hour taken twice a day (${ids.slice(0, 3).join()})`); }
    { const g = mk('wilds', 2); Wk.planEnsure(g); delete g.tasks.plan.med.rest; g.tasks.plan.done = { d: -1, sit: 0, mer: 0, qi: 0, pres: 0, doors: {} }; Wk.planSet(g, 'med:sit', 1); let ok = true;
      try { Wk.runWeek(g, SCENES); Wk.planNotes(g, SCENES); } catch { ok = false; } assert(ok, `${T}: a plan from before (no rest row) runs`); }
    // the old calendar: no plan; the Fallout's doors open every day
    { const g = mk('fo_ashfall', 9, 7, null); assert(Wk.doorCards(g, SCENES).length === 0 && Wk.planEnsure(g) === null, `${T}: the old calendar: no plan rows`); }
    // TG: with the spacing off and the rest row taken out, PR2's three pinned runs are v0.11.210's, step for step
    { const v214 = (g) => { if (Tk.CF1.on) return g; const c = JSON.parse(JSON.stringify(g)); const cs = c.tasks?.carries; if (cs) { delete c.tasks.carries; const v = Object.values(cs)[0]; if (v) { const { paid, stay, sd, ...rest } = v; c.tasks.carry = rest; } } return c; }; // RV1 (TG4): v0.11.214's save shape
        const idOf = (id) => (Tk.CF1.on ? id : String(id).replace(/^week:carry:.*/, 'week:carry'));
        const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v)); // switched off: keys sorted (a record's place among a save's keys is no rule)
        const ser = (o) => (Tk.CF1.on ? JSON.stringify(o) : canon(o));
      const strip = (g) => { const c = v214(JSON.parse(JSON.stringify(g))); const q = c.tasks?.plan; if (q) { delete q.med.rest; if (q.done) delete q.done.rest; } return c; };
      const pin = (g) => { const ids = [], lines = []; const onStep = (cg, l) => { if (l) ids.push(`${cg.minutes}:${idOf(l.id)}${l.r.skipped ? '~' : ''}`); };
        const go = () => { const r = Wk.runWeek(g, SCENES, { onStep }); for (const d of r.days) lines.push(...d.lines); return r; };
        let r = go(); const stops = [r.stop];
        for (let k = 0; k < 60 && ['evening', 'door'].includes(r.stop); k++) {
            const v = sceneView(g, SCENES); const open = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!open.length || g.combat) break;
            Wk.storyTap(g, SCENES, open[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) { r = go(); stops.push(r.stop); } }
        return Gm.fnv1a(ser({ ids, lines, stops, g: strip(g) })); };
      const build = () => Cm.unspaced(() => {
        const o = {};
        { const g = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true }); g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 30); Gm.addItem(g, 'hare_raw', 2);
          for (const [k, n] of [['wild_train:1', 2], ['wild_forage:0', 2], ['med:sit', 3], ['med:mer', 2], ['med:qi', 2], ['med:pres', 1]]) Wk.planSet(g, k, n); o.wilds = pin(g); }
        { const g = ensureBars(newGame(99501, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = 16 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true;
          Wk.planEnsure(g); for (const s of ['wen_time', 'mother_time', 'fo_mei', 'fo_ya_time']) Wk.planSet(g, `door:${s}`, 1); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 9); Wk.planSet(g, 'med:sit', 2); o.fallout = pin(g); }
        { const g = ensureBars(newGame(99502, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'ashfall'); g.minutes = 9 * D + 7 * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60);
          Wk.planEnsure(g); const cs = Wk.planCards(g, SCENES); for (const c of cs.slice(0, 3)) Wk.planSet(g, c.id, 2); Wk.planSet(g, 'med:sit', 4); Wk.planSet(g, 'med:qi', 3); o.ashfall = pin(g); }
        return o; });
      const out = build(); Tk.PT1.on = false; let old, v216; try { v216 = build(); Tk.CF1.on = false; old = build(); } finally { Tk.CF1.on = true; Tk.PT1.on = true; } // v0.11.217 (PT1): v0.11.216's runs with PT1 off; v0.11.214's with CF1 off too
      assert(JSON.stringify(old) === '{"wilds":"647d2274","fallout":"6aade2dc","ashfall":"55bb2cae"}', `${T} (v0.11.215, RV1 TG4): with CF1 switched off, v0.11.214's runs exactly (its code, keys sorted) (${JSON.stringify(old)})`);
      assert(JSON.stringify(v216) === '{"wilds":"ad1fa63b","fallout":"be0db1d7","ashfall":"eb5b2dc3"}', `${T} (v0.11.217, PT1): with PT1 switched off, v0.11.216's runs exactly (${JSON.stringify(v216)})`);
      assert(JSON.stringify(out) === '{"wilds":"ad1fa63b","fallout":"71b7fbc9","ashfall":"d853a742"}', `${T} (TG): spacing off, rest row out: v0.11.210's three runs exactly as v0.11.217 runs them (v0.11.217, PT1: the Fallout and Ashfall re-pinned for the pot's meals, the wilds unchanged; re-pinned for CF1: no card waits behind another's work, a card that gives no food pays at its end) (${JSON.stringify(out)})`); }
    // RV1 (TG2, L1): the spring found, its row at 1 and the wash open: one row, the wash's, and the run washes
    { const g = mk('heart_hub', 17); g.flags.spring_found = true; Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:heart_spring', 1);
      const rs = Wk.doorCards(g, SCENES).filter((x) => x.scene === 'heart_spring'); const r = Wk.runWeek(g, SCENES);
      assert(rs.length === 1 && rs[0].id === 'heart_hub:4' && rs[0].status === 'open' && Object.keys(g.flags).some((k) => /^spring@/.test(k)), `${T} (RV1, TG2): the wash's row (${JSON.stringify(rs)}), taken (${r.stop})`);
      const c = mk('heart_hub', 17); c.flags.spring_found = true; c.flags[`spring@${Math.floor(c.minutes / D) + 1}`] = true; c.minutes += D; Wk.planEnsure(c); Wk.planSet(c, 'door:heart_spring', 1);
      const r2 = Wk.doorCards(c, SCENES).filter((x) => x.scene === 'heart_spring');
      assert(r2.length === 1 && r2[0].id === 'heart_hub:4' && r2[0].label === 'Wash at the spring.' && r2[0].status === 'closed', `${T} (RV1, L1): closed by its spacing, at 1: still the wash's row (${JSON.stringify(r2)})`); }
    // RV1 (TG3): exactly the rest row's hours a day, every day of the week
    { const g = mk('fo_ashfall', 9); g.flags.palisade = 1; g.flags.wolf = 'driven'; Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'med:rest', 2); const per = {}; const rid = Wk.restCard(g, SCENES);
      const onStep = (cg, l) => { if (l && !l.r.skipped && l.id === rid) { const d = Tk.workDay(cg); per[d] = (per[d] || 0) + 1; } };
      let r = Wk.runWeek(g, SCENES, { onStep });
      for (let k = 0; k < 100 && ['evening', 'door'].includes(r.stop); k++) { const v = sceneView(g, SCENES); const o = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!o.length || g.combat) break; Wk.storyTap(g, SCENES, o[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) r = Wk.runWeek(g, SCENES, { onStep }); }
      const v = Object.values(per); assert(v.length >= 5 && v.every((n) => n === 2), `${T} (RV1, TG3): Rest an hour exactly twice each day (${JSON.stringify(per)})`); }
    // RV1 (F5, F15 the second run): a journey day taken today opens tomorrow (spacedNext); a door closed by its hours (the slopes from 15:00, untaken) says no day
    { const g = mk('fo_ashfall', 12); const d = Gm.wakeDay(g); g.flags[`yk_time@${d}`] = true;
      const h = mk('ashfall', 5, 16); Wk.planEnsure(h); Wk.planSet(h, 'door:herb_slopes', 1); const hs = Wk.doorCards(h, SCENES).find((x) => x.scene === 'herb_slopes');
      assert(Cm.spacedNext(g, 'yk_time', d) === d + 1 && hs?.status === 'closed' && hs.next === null && Wk.doorNote(hs) === 'every 3rd day', `${T} (F5, F15): a journey day's next is tomorrow (${Cm.spacedNext(g, 'yk_time', d) - d}); the slopes closed at 16:00, untaken: no day (${JSON.stringify(hs)})`); }
    // RV1 (TG4): the notes: a one-off "once"; an open repeating row no day; a closed one its day
    assert(Wk.doorNote({ repeat: false }) === 'once' && Wk.doorNote({ repeat: true, next: null }) === 'every 3rd day' && Wk.doorNote({ repeat: true, next: 51 }) === 'every 3rd day, opens Day 51', `${T} (RV1, TG4): doorNote`);
    { const g = mk('fo_ashfall', 9); const ds = Wk.doorCards(g, SCENES);
      assert(ds.filter((d) => d.status === 'open').every((d) => d.next === null) && Wk.doorNote(ds.find((d) => d.scene === 'fo_mother')) === 'once' && !/opens/.test(Wk.doorNote(ds.find((d) => d.scene === 'fo_mei'))), `${T} (RV1, TG4): open rows say no day; the mother's first visit "once"`); }
    // RV1 (TG5, M1): the forecast says "this week" for a one-off it takes, "not this week" for one it doesn't reach
    { const g = mk('fo_ashfall', 9); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:fo_mother', 1); const n = Wk.planNotes(g, SCENES).med;
      const h = mk('ashfall', 5); Wk.planEnsure(h); Wk.planSet(h, 'door:yk_time', 0); Wk.planSet(h, 'door:heal', 1); for (const c of Wk.planCards(h, SCENES)) Wk.planSet(h, c.id, 9); Wk.planPrio(h, SCENES, 'door:heal', Wk.planRanks(h, SCENES).n); const nh = Wk.planNotes(h, SCENES).med;
      assert(n['door:fo_mother'] === 'this week' && ['this week', 'not this week'].includes(nh['door:heal']), `${T} (RV1, TG5 + M1): the mother's visit "this week" (${n['door:fo_mother']}); the coughing house ${nh['door:heal']}`); }
    { const g = mk('ashfall', 6, 18); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:heal', 1); g.flags.healed_try = true; const fc = Wk.planForecast(g, SCENES);
      assert(fc && fc.doors.heal === 0 && Wk.planNotes(g, SCENES).med['door:heal'] === 'not this week', `${T} (RV1, TG5): a one-off that never opens: "not this week"`); }
    // RV1 (TG6): each repeating door spaced by its own key: Old Wen's lesson, the far hunt, the herb slopes taken today open on day d+3
    { const g = mk('ashfall', 5, 8); const cal = Math.floor(g.minutes / D) + 1, wd = Gm.wakeDay(g);
      for (const k of ['wen', 'far', 'slopes']) g.flags[`${k}@${wd}`] = true; g.minutes += D;
      const ds = Wk.doorCards(g, SCENES), nx = (s) => ds.find((d) => d.scene === s)?.next;
      assert(['wen_lesson', 'far_hunt', 'herb_slopes'].every((s) => nx(s) === cal + 3) && Wk.DOOR_KEY.wen_lesson === 'wen' && Wk.DOOR_KEY.far_hunt === 'far' && Wk.DOOR_KEY.herb_slopes === 'slopes', `${T} (RV1, TG6): the lesson, the far hunt, the slopes: Day ${cal + 3} (${['wen_lesson', 'far_hunt', 'herb_slopes'].map(nx).join()})`); }
    // RV1 (TG7, M2): a remembered "Fight." is never replayed: the plan stops on the far hunt again (the player's), the pick kept
    { let g = null, kind = null; for (let seed = 99600; seed < 99640 && !g; seed++) { const t = mk('ashfall', 5, 8, C.LONG_CAL, seed); goTo(t, SCENES, 'far_hunt'); if (t.flags.far_kind !== 'deer') { g = t; kind = t.flags.far_kind; } }
      const fi = sceneView(g, SCENES).choices.find((c) => c.label === 'Fight.').index; Wk.noteDoor(g, SCENES, 'far_hunt', fi);
      assert(Wk.doorPick(g, SCENES) === null && g.tasks.dc.picks.far_hunt.i === fi, `${T} (RV1, TG7 + M2): Fight. remembered against the ${kind}: not replayed (${Wk.doorPick(g, SCENES)})`);
      const b = sceneView(g, SCENES).choices.find((c) => /^Back off/.test(c.label)).index; Wk.noteDoor(g, SCENES, 'far_hunt', b);
      assert(Wk.doorPick(g, SCENES) === b, `${T} (RV1, M2): Back off is replayed`); }
    // RV1 (L3): a one-off door tapped by hand sets its row back to 0; a repeating one keeps its row
    { const g = mk('fo_ashfall', 9); Wk.planEnsure(g); Wk.planSet(g, 'door:fo_mother', 1); Wk.planSet(g, 'door:fo_mei', 1);
      Wk.noteCardTap(g, SCENES, 'fo_ashfall:6'); Wk.noteCardTap(g, SCENES, 'fo_ashfall:5'); Wk.noteCardTap(g, SCENES, 'not:a:card'); Wk.noteCardTap(g, SCENES, 'mer:pri');
      assert(g.tasks.plan.doors.fo_mother === 0 && g.tasks.plan.doors.fo_mei === 1, `${T} (RV1, L3): the mother's first visit tapped: its row 0; Mei Lin's talk kept at 1`);
      const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); assert(/noteCardTap\(g, SCENES, id\);[^\n]*\n\s*const r = runTask\(g, SCENES, id\);/.test(src), `${T} (RV1, L3): doTask notes the tap before runTask`); }
    // the owner 16:42: the communal pot's cooking on the plan (its Village 90, 09:00 to 14:59); v0.11.218 (CK1, RF3): a repeating row
    { const g = mk('ashfall', 5, 10); Gm.bumpRel(g, 'Village', 95, 0); const f = mk('fo_ashfall', 9, 10); Gm.bumpRel(f, 'Village', 95, 0);
      const a = Wk.doorCards(g, SCENES).find((d) => d.scene === 'pot_cook'), b = Wk.doorCards(f, SCENES).find((d) => d.scene === 'fo_pot_cook');
      assert(a?.status === 'open' && a.repeat && b?.status === 'open' && b.repeat && Wk.doorNote(a) !== 'once', `${T} (the owner 16:42; CK1): the pot's cooking rows, repeating (${JSON.stringify([a, b])})`);
      Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:pot_cook', 1); const r = Wk.runWeek(g, SCENES);
      assert((r.stop === 'door' && g.scene === 'pot_cook') || g.flags.pot_cook, `${T}: the plan opens the pot (${r.stop}, ${g.scene})`); }
    // the screen: the door rows' note from doorNote, the rest row
    { const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(src.includes('[doorNote(d), when(`door:${d.scene}`)]') && src.includes("planRow('med:rest', 'Rest, hours a day'"), `${T}: the panel's door notes and the rest row`); }
}

// v0.11.214 (owner pick RD1: RU + RB, 2026-11-17 16:54; RN1: NT + NL, 18:24; the owner 16:42 "if a card or it's result haven't been read
// yet in the game, it should stop to be read. Effectively making the first runs manual  that's by design."): the plan stops before a card
// or door with a line never shown on screen in this game (again.js RU, numbers aside; the number-only lines left out, NL); the card tapped
// by hand counts as the plan's step (NT); the forecast stops there too.
{
    const Gm = await import('../js/core/game.js');
    const C = await import('../js/core/calendar.js');
    const Wk = await import('../js/core/week.js');
    const Tk = await import('../js/core/tasks.js');
    const A = await import('../js/story/again.js');
    const T = 'RD1 (the plan stops for a text not read yet)';
    const D = 1440;
    const mk = (hub, sd, h = 7, cal = C.LONG_CAL, seed = 99601) => { const g = ensureBars(newGame(seed, { closed: true, ...(cal ? { cal } : {}) })); goTo(g, SCENES, hub); g.minutes = (C.calStart(g, sd) - 1) * D + h * 60; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60); g.flags.ya_met = true; g.flags.elder = true; g.flags.palisade = 1; g.flags.wolf = 'driven'; return g; };
    const strip = (g) => { const c = JSON.parse(JSON.stringify(g)); delete c.read; delete c.log; if (c.tasks?.plan) { delete c.tasks.plan.read; delete c.tasks.plan.readKey; delete c.tasks.plan.stop; delete c.tasks.plan.running; if (c.tasks.plan.done && !Object.values(c.tasks.plan.done).some((v) => v && typeof v !== 'object' && v !== c.tasks.plan.done.d)) delete c.tasks.plan.done; } return JSON.stringify(c); }; // a day's record started and still empty is no change
    // RU: the keys, numbers aside (a time with its unit as one); the record; the number-only lines (NL)
    assert(A.lineKey('Sing: 8 h 44 min more, 29 h 56 min still to go.') === A.lineKey('Sing: 45 min more, 2 h still to go.') && A.lineKey('Qi 19.9 → 25.') === A.lineKey('Qi 3 → 4.5.') && A.lineKey('A hare.') === A.paraKey('A hare.') && A.lineKey('3 hares.') !== A.lineKey('3 crabs.'), `${T} (RU): numbers aside, times with their units as one, words kept`);
    { const old = { coil: { n: 1 } }; A.noteLines(old, ['A line.']); A.noteRead(old, 'Day 4. A line with a number.', 1);
      assert(!old.read?.[A.lineKey('A line.')] && Object.keys(old.read).length === 1, `${T} (RV1, L3): the old calendar's record as before (no result lines, no numbers-aside keys: ${JSON.stringify(old.read)})`); }
    { const g = { coil: { n: 2 }, cal: C.LONG_CAL }; A.noteLines(g, ['+4 River cress. Cold water.', 'Two lines.\n\nIn one.', 7, null]);
      assert(A.unreadLines(g, ['+9 River cress. Cold water.', 'In one.', 'Two lines.', 'A new one.']).join('|') === 'A new one.' && g.read[A.lineKey('In one.')] === 2, `${T} (RU): a line read with other numbers, a line's own paragraphs, read on Coil 2; non-strings skipped`);
      A.noteRead(g, 'Day 45. Forty days to the Elder.\n\nNo number.', 1);
      assert(A.unreadLines(g, ['Day 46. Forty days to the Elder.', 'No number.']).length === 0 && g.read[A.paraKey('Day 45. Forty days to the Elder.')] === 1, `${T} (RU): a scene paragraph with numbers counts with other numbers too (its own key kept for the fold)`); }
    { const num = ['GU 3 / DC 3 — done', 'GU +12 XP', 'Yuki (bond) Qi Use +6 → T1 L2', "GU +6 XP → T1 L3, from what Yuki couldn't keep", "Yuki Fight held at T1 L2, where James's GU stood", "Yuki Fight +2 → T1 L3, level with James's GU (held)", 'Qi Max +1.25 (Yuki +1).', 'Qi regen now 5.9% of Max per Cycle (Yuki\'s too, through the bond).', '+3 Smoked meat, +2 Dried bracket.', 'A thin haul — you keep: +2 River cress.', 'Double haul — in total: +8 River cress.', 'Sing a full stretch of the line: 8 h 44 min more, 29 h 56 min still to go.', 'Sing a full stretch of the line: done, 46 h 40 min in all.', "A week's work: 6 h 32 min, done.", 'Meditated an hour: Qi 19.9 → 25.', 'Condensed: Saturation 45%.', '−3 HP.', 'GU at T10 L10 (cap)', 'Convergence Use at T10 L10 (cap)', 'Yuki (bond) Qi Use at T10 L10 (cap)'];
      const txt = ['+4 River cress. Same shallows, colder water.', 'Stung. A lot. +1 Wild honeycomb, −3 HP.', 'It pinches back. −2 HP.', 'Opened the Lung meridian (1/12). It opens on an inhale.', 'Yuki comes back with a hare. +1 Glassback hare (dressed).', 'An hour of rest.', 'Two Qi and 120 minutes into the ash around the Lung meridian. It gives a little. (2 h of 8 h.)', '−2 HP. The thorns are worse than they look.', 'GU at T10 L10 (cap). Nobody told the thorns.'];
      const bad = [...num.filter((l) => !A.numberLine(l)), ...txt.filter(A.numberLine)];
      assert(!bad.length && A.unreadLines({}, num).length === 0 && A.unreadLines({}, txt).length === txt.length, `${T} (RN1, NL): ${num.length} number lines left out, ${txt.length} text lines kept (${bad.join(' | ')})`); }
    READ_STOP.on = true;
    try {
        // RB: a fresh Fallout plan stops before its first card; nothing changed but the stop; the forecast stops there too
        { const g = mk('fo_ashfall', 9); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'med:mer', 1); const s0 = strip(g), m0 = g.minutes;
          const fc = Wk.planForecast(g, SCENES); const r = Wk.runWeek(g, SCENES); const p = g.tasks.plan, u = Wk.readProbe(g, SCENES);
          assert(r.stop === 'read' && p.read === u?.id && p.readKey === 'med:mer' && /meridian/.test(Tk.taskLabel(g, SCENES, p.read)) && g.minutes === m0 && strip(g) === s0 && !p.running, `${T} (RB): stopped before the meridian session, nothing taken (${r.stop}, ${p.read}, ${JSON.stringify(u?.lines)})`);
          assert(fc?.stop === 'read' && /a card with text you have not read yet/.test(Wk.planNotes(g, SCENES).outlook) && Wk.STOP_TEXT.read === 'a card with text you have not read yet', `${T} (RB): the forecast stops there too (${fc?.stop}; ${Wk.planNotes(g, SCENES).outlook})`);
          // NT: the card tapped by hand counts as the plan's step: the day's session done, the plan doesn't take it again today
          if (r.stop !== 'read' || !p.read) { assert(false, `${T} (RV1, TG7): no read stop to tap (${r.stop}, ${g.scene})`); throw new Error('RD1: no read stop'); }
          const id = p.read, d = Tk.workDay(g); const rr = Tk.runTask(g, SCENES, id); Wk.noteReadTap(g, SCENES, id, rr); A.noteLines(g, rr.lines);
          assert(p.stop === '', `${T} (RV1, L4): the stop line cleared by the tap (${p.stop})`);
          assert(p.done.d === d && p.done.mer === 1 && !p.read && !p.readKey, `${T} (RN1, NT): the session tapped counts as the day's (${JSON.stringify(p.done)})`);
          const ids = []; const r2 = Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && Tk.workDay(cg) === d) ids.push(l.id); } });
          assert(!ids.includes(id) && r2.stop !== 'read' || Tk.workDay(g) > d, `${T} (NT): no second session today (${ids.join()}; ${r2.stop})`); }
        // NT for a card (its count one fewer), a door (done today; a one-off's row to 0); any other tap leaves the plan alone
        { const g = mk('fo_ashfall', 9); Wk.planEnsure(g); const card = Wk.planCards(g, SCENES).find((c) => c.status === 'open'); Wk.planSet(g, card.id, 2); Wk.planSet(g, 'door:fo_mother', 1);
          const p = g.tasks.plan; p.read = card.id; p.readKey = card.id; Wk.noteReadTap(g, SCENES, 'other:1'); const kept = p.read === card.id;
          Wk.noteReadTap(g, SCENES, card.id, { lines: [] }); const n1 = p.items[card.id];
          p.read = 'fo_ashfall:6'; p.readKey = 'door:fo_mother'; Wk.noteReadTap(g, SCENES, 'fo_ashfall:6', { lines: [] });
          p.read = Tk.CARRY_TASK; p.readKey = card.id; Wk.noteReadTap(g, SCENES, Tk.CARRY_TASK, { lines: [] });
          assert(kept && n1 === 1 && p.items[card.id] === 1 && p.done.doors.fo_mother === 1 && p.doors.fo_mother === 0 && !p.read, `${T} (NT): a card 2 → 1; the mother's visit done and its row 0; the carried work changes nothing; another card's tap keeps the stop`);
          // RV1 (L1, TG6): a skipped tap keeps the stop (nothing counted); the next tap that runs counts
          Wk.planSet(g, card.id, 2); p.read = card.id; p.readKey = card.id; p.stop = 'read'; Wk.noteReadTap(g, SCENES, card.id, { lines: [], skipped: true });
          const kept2 = p.read === card.id && p.readKey === card.id && p.items[card.id] === 2 && p.stop === 'read';
          Wk.noteReadTap(g, SCENES, card.id, { lines: [] });
          assert(kept2 && p.items[card.id] === 1 && !p.read && p.stop === '', `${T} (RV1, L1 + TG6): a skipped tap keeps the stop; the retap counts (2 → ${p.items[card.id]})`);
          // RV1 (TG4): a door already done once today: one more
          p.done.doors.fo_mei = 1; p.read = 'fo_ashfall:5'; p.readKey = 'door:fo_mei'; Wk.noteReadTap(g, SCENES, 'fo_ashfall:5', { lines: [] });
          assert(p.done.doors.fo_mei === 2, `${T} (RV1, TG4): a door's day count 1 → ${p.done.doors.fo_mei}`);
          // RV1 (TG3): stopped on day N, tapped on day N + 1: it counts toward N + 1's row
          const dN = Tk.workDay(g); p.done = { d: dN, sit: 0, mer: 1, qi: 0, pres: 0, rest: 0, doors: {} }; p.read = 'mer:pri'; p.readKey = 'med:mer'; g.minutes += D;
          Wk.noteReadTap(g, SCENES, 'mer:pri', { lines: [] });
          assert(p.done.d === dN + 1 && p.done.mer === 1, `${T} (RV1, TG3): a tap the next day counts there (${JSON.stringify(p.done)})`); }
        // RV1 (TG2): the day's routine before a card (an unread breakfast and day's sit) never stops it; a card the routine leaves no time for isn't checked
        { const g = mk('fo_ashfall', 9); g.james.satiety = 60; g.james.qi = Math.max(g.james.qi, 30); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); const card = Wk.planCards(g, SCENES).find((c) => c.status === 'open'); Wk.planSet(g, card.id, 1);
          const c = JSON.parse(JSON.stringify(g)); const rr = Tk.runTask(c, SCENES, card.id); const pre = rr.lines.slice(0, rr.pre);
          const u = Wk.readProbe(g, SCENES); if (u) A.noteLines(g, u.lines);
          assert(rr.pre >= 2 && A.unreadLines(g, pre).length > 0 && Wk.readProbe(g, SCENES) === null && Wk.runWeek(g, SCENES).stop !== 'read', `${T} (RV1, TG2): the card's own lines read, its breakfast and day's sit not: no stop (${rr.pre} routine lines: ${pre.map((l) => l.slice(0, 30)).join(' | ')})`); }
        // v0.11.215 (RV1, SR): open at 11:00 (its old length left), the routine then takes the time
        { const g = mk('fo_ashfall', 9, 11); g.james.satiety = 60; g.james.qi = Math.max(g.james.qi, 30); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); const card = Wk.planCards(g, SCENES).find((c) => c.status === 'open'); Wk.planSet(g, card.id, 1);
          const c = JSON.parse(JSON.stringify(g)); const rr = Tk.runTask(c, SCENES, card.id);
          assert(rr.skipped && Wk.readProbe(g, SCENES) === null, `${T} (RV1, TG2): a card the routine left no time for (${card.id} at 11:00: skipped ${!!rr.skipped}) is not checked`); }
        // RV1 (TG1): a player as main.js plays: every read stop tapped (the tap's lines recorded, as land), the screens that can fold recorded,
        // the talks and evenings tapped (their lines recorded). No stop comes back for a line the tap showed; at the end every line of the
        // plan's reports (the routine's meals and the day's sit, "As before: ", the number lines and the plan's own lines aside) is read.
        for (const [hub, sd] of [['fo_ashfall', 9], ['wilds', 2], ['ashfall', 5]]) {
            const g = mk(hub, sd); Wk.planEnsure(g); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 1); for (const k of ['sit', 'mer', 'qi', 'rest']) Wk.planSet(g, `med:${k}`, 1); for (const d of Wk.doorCards(g, SCENES)) if (d.repeat) Wk.planSet(g, `door:${d.scene}`, 1);
            const show = () => { const v = sceneView(g, SCENES); if (!A.noFold(v.id) && !v.end && v.text) A.noteRead(g, v.text); };
            const said = [], again = []; let reads = 0, pend = null;
            for (let k = 0; k < 400; k++) {
                const r = Wk.runWeek(g, SCENES); for (const d of r.days) said.push(...d.lines);
                if (r.stop === 'read') { reads++; const u = Wk.readProbe(g, SCENES), id = g.tasks.plan.read; const rr = Tk.runTask(g, SCENES, id); Wk.noteReadTap(g, SCENES, id, rr); A.noteLines(g, rr.lines); show(); pend = u ? u.lines : null; } // the tap's lines (land), then the screen it shows
                else if (['evening', 'door', 'story'].includes(r.stop) || g.scene !== hub) { show(); const v = sceneView(g, SCENES); const o = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!o.length || g.combat || v.end) break; const r2 = Wk.storyTap(g, SCENES, (o.find((c) => c.index === Wk.eveningPick(g, SCENES)) || o[0]).index); A.noteLines(g, r2.lines); if (g.combat) break; Wk.afterStory(g, SCENES); }
                else break;
                for (let j = 0; j < 20 && g.scene !== hub && !g.combat; j++) { show(); const v = sceneView(g, SCENES); const o = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!o.length || v.end) break; const r3 = Wk.storyTap(g, SCENES, o[0].index); A.noteLines(g, r3.lines); if (g.combat) break; Wk.afterStory(g, SCENES); }
                if (pend) { again.push(...A.unreadLines(g, pend)); pend = null; } // once the door's screens are walked by hand
                if (Tk.workDay(g) > (g.tasks.plan?.lastDay ?? 1e9) || g.combat) break;
            }
            const own = /^(Breakfast|Midday|Supper): |^The day's sit:|^The rest of the day off\.$|^As before: |: \+\d+ satiety\.$/; // the meals: the routine's and the evening's supper (the evening's usual way on, not checked by design)
            const left = A.unreadLines(g, said.filter((l) => !own.test(String(l)) && String(l) !== Tk.SKIP_LINE));
            assert(reads > 0 && again.length === 0 && left.length === 0, `${T} (RV1, TG1): ${hub}: ${reads} read stops as a player; none came back for a line the tap showed (${again.slice(0, 2).join(' | ')}); every line the plan's report showed is read (${left.length}: ${left.slice(0, 2).map((l) => l.slice(0, 60)).join(' | ')})`);
        }
        // a door: Old Wen's lesson (W1's walk) stops before the door the first time
        { const g = mk('ashfall', 5); Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planSet(g, 'door:wen_lesson', 1); const r = Wk.runWeek(g, SCENES);
          assert(r.stop === 'read' && g.tasks.plan.readKey === 'door:wen_lesson' && g.scene === 'ashfall' && !g.rel['Old Wen']?.f, `${T} (RB): the lesson stops before its door (${r.stop}, ${g.tasks.plan.readKey})`); }
        // every line the week shows read (the probe's own lines noted, never tapped): the plan runs exactly as with the stop off, step for step
        for (const [hub, sd] of [['fo_ashfall', 9], ['ashfall', 5], ['wilds', 2]]) {
            const set = (g) => { Wk.planEnsure(g); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 1); for (const k of ['sit', 'mer', 'qi', 'rest']) Wk.planSet(g, `med:${k}`, 1); for (const d of Wk.doorCards(g, SCENES)) if (d.repeat) Wk.planSet(g, `door:${d.scene}`, 1); };
            const a = mk(hub, sd), b = mk(hub, sd); set(a); set(b);
            const walk = (g, on) => { READ_STOP.on = on; let r = null; const stops = []; for (let k = 0; k < 400; k++) { r = Wk.runWeek(g, SCENES); if (r.stop === 'read') { A.noteLines(g, Wk.readProbe(g, SCENES).lines); continue; } stops.push(r.stop); if (!['evening', 'door'].includes(r.stop)) break; const v = sceneView(g, SCENES); const o = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!o.length || g.combat) break; Wk.storyTap(g, SCENES, o[0].index); if (g.combat) break; Wk.afterStory(g, SCENES); } READ_STOP.on = true; return stops.join(); };
            const sa = walk(a, false), sb = walk(b, true);
            assert(sa === sb && strip(a) === strip(b) && Object.keys(b.read || {}).length > 0, `${T} (RB, NL): ${hub}: every line read, the week as with the stop off (${sa} / ${sb}; Day ${Math.floor(a.minutes / D) + 1} / ${Math.floor(b.minutes / D) + 1})`);
        }
        // the routine's lines (the day's meal and sit) and the plan's "As before: " never stop it; the old calendar has no plan
        { const src = readFileSync(new URL('../js/core/week.js', import.meta.url), 'utf8');
          assert(src.includes(".slice(first.r?.pre || 0).filter((l) => !String(l).startsWith(AGAIN_LINE))") && /return \{ lines, fail, stopped, pre: pre0 \};/.test(readFileSync(new URL('../js/core/tasks.js', import.meta.url), 'utf8')), `${T} (RB): the routine's lines and "As before: " left out`); }
        { const g = mk('fo_ashfall', 9, 7, null); assert(Wk.planEnsure(g) === null && Wk.runWeek(g, SCENES).stop === 'left', `${T}: the old calendar: no plan, nothing to stop`); }
        // main.js: what a tap shows is read (land), the stopped card's tap counted (doTask), the stop names the card
        { const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
          assert(/function land\([^)]*\) \{\n\s*noteLines\(g, lines\);/.test(src) && /const r = runTask\(g, SCENES, id\);\n\s*noteReadTap\(g, SCENES, id, r\);/.test(src) && src.includes("r.stop === 'read' ? ' Tap it yourself, then run the week again.'") && src.includes('`Stopped: ${stopText(p.stop)}.`'), `${T}: main.js records what it shows, counts the tap, names the card`); }
    } finally { READ_STOP.on = false; }
}

// v0.11.215 (owner picks CF1: UB + RE + BL, 2026-11-17 20:31; FP1: FS, 20:58; his report 20:24 "a serious bug. actions take more than a day.
// I cannot take them at all.", 20:28 "it was all over from the beginning of ashfall", with saves/v0.11.214-long-fallout-day64.json): every
// week's card keeps its own work carried (no card waits behind another's), a card that gives no food pays when its work is done, a card
// that gives food (the wilds' Forage and Hunt) pays at its start (FS), a busy card says how long is left; an old save's one carry, paid.
{
    const Gm = await import('../js/core/game.js');
    const C = await import('../js/core/calendar.js');
    const Wk = await import('../js/core/week.js');
    const Tk = await import('../js/core/tasks.js');
    const T = 'CF1 (every card its own work)';
    const D = 1440;
    const own = () => deserialize(readFileSync(new URL('../saves/v0.11.214-long-fallout-day64.json', import.meta.url), 'utf8'), { force: true });
    // the owner's save: one old carry (Sing a full stretch of the line), 7 cards planned, all 7 "busy" behind it at v0.11.214
    { const g = own(); const old = g.tasks.carry;
      assert(old?.id === 'fo_palisade:0' && old.left === 1191 && !g.tasks.carries && Tk.carriesRead(g)['fo_palisade:0']?.paid === true && Tk.carryHere(g, 'fo_ashfall')?.id === 'fo_palisade:0', `${T}: the owner's save: its one carry read as paid (${JSON.stringify(old)})`);
      { // Day 65 is the road (no stay): the same save on its own last morning, Day 64 07:00, before the farewell
        const h = own(); h.minutes = 63 * D + 7 * 60; goTo(h, SCENES, 'fo_ashfall'); h.james.satiety = 100; delete h.tasks.routine;
        const cards = taskCards(h, SCENES).filter((c) => c.week), busy = cards.filter((c) => c.status === 'busy').map((c) => c.id), go = taskCards(h, SCENES).find((c) => c.id === Tk.carryTaskId('fo_palisade:0'));
        // RV1 (SG, TG2): on the stay's last morning no card that gives no food can end before the stay: "too long", and his plan starts none
        assert(Tk.weekHub(h) && busy.join() === '' && cards.filter((c) => c.status === 'long').length === 7 && go?.status === 'open' && !/then its result/.test(go.tag), `${T} (RV1, SG): Day 64 07:00: none waits behind Sing; the 7 planned cards too long for the day left (busy: ${busy.join() || 'none'}; ${cards.map((c) => c.status).join()}; ${go?.tag})`);
        { const k = JSON.parse(JSON.stringify(h)); const ids = []; Wk.runWeek(k, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
          assert(!ids.some((id) => /^fo_(clinic|drill|council|palisade):/.test(id)), `${T} (RV1, SG, TG2): his plan starts no card it could not end (${ids.slice(0, 8).join(', ')})`); }
        // a week earlier in the same stay (Day 58 07:00, Sing's work still open): the cards open, and his plan starts one
        { const k = JSON.parse(JSON.stringify(h)); k.minutes = 57 * D + 7 * 60; const ids = []; const open = taskCards(k, SCENES).filter((c) => c.week && c.status === 'open').length;
          Wk.runWeek(k, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
          assert(open === 7 && ids.some((id) => /^fo_(clinic|drill|council|palisade):/.test(id) && !Tk.isCarryTask(id)), `${T} (UB): Day 58: the 7 cards open beside Sing's work, and his plan starts one (${open}; ${ids.slice(0, 8).join(', ')})`); }
        const r = Tk.runTask(h, SCENES, Tk.CARRY_TASK);
        assert(r.lines.some((x) => /Sing a full stretch of the line: /.test(x)) && Tk.carriesRead(h)['fo_palisade:0'] && !('carry' in h.tasks) && !r.lines.some((x) => / \/ DC /.test(x)), `${T}: the old carry goes on (the bare Go on id), moved into the record, nothing paid twice (${r.lines.slice(-1)})`);
      }
    }
    // UB: two cards' work carried at once, each with its own Go on; the plan takes both; the forecast's rows follow each card's end
    { const g = ensureBars(newGame(99701, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, 'fo_ashfall'); g.minutes = (C.calStart(g, 8) - 1) * D + 7 * 60; g.flags.palisade = 1; g.flags.wolf = 'driven'; g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 60);
      const [a, b] = Wk.planCards(g, SCENES).filter((c) => c.status === 'open').map((c) => c.id);
      Tk.runTask(g, SCENES, a); g.minutes += D; g.minutes = Math.floor(g.minutes / D) * D + 7 * 60; delete g.tasks.routine; Tk.runTask(g, SCENES, b);
      const here = Tk.carriesHere(g).map((cy) => cy.id).sort().join(), gos = taskCards(g, SCENES).filter((c) => Tk.isCarryTask(c.id)).map((c) => c.id).sort().join();
      assert(here === [a, b].sort().join() && gos === [a, b].map(Tk.carryTaskId).sort().join() && Tk.carriesHere(g).every((cy) => cy.paid === false), `${T} (UB): two works carried, two Go on cards (${gos})`);
      const h = Wk.planHours(g, SCENES); assert(h.work === Tk.carriesHere(g).reduce((x, cy) => x + cy.left, 0), `${T} (UB): the plan's hours count every work carried (${h.work})`);
      Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); const ran = new Set(); const done = []; g.minutes += D; g.minutes = Math.floor(g.minutes / D) * D + 7 * 60; delete g.tasks.routine;
      const onStep = (cg, l) => { if (l && !l.r.skipped) { ran.add(l.id); if (l.r.lines.some((x) => / \/ DC /.test(x))) done.push(l.id); } };
      let r = Wk.runWeek(g, SCENES, { onStep });
      for (let k = 0; k < 80 && ['evening', 'door'].includes(r.stop) && !(done.length >= 2); k++) { const v = sceneView(g, SCENES); const o = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!o.length || g.combat) break; Wk.storyTap(g, SCENES, o[0].index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) r = Wk.runWeek(g, SCENES, { onStep }); }
      assert([a, b].every((k) => ran.has(Tk.carryTaskId(k))) && done.length >= 1 && done.every(Tk.isCarryTask), `${T} (UB, RE): the plan goes on with both; each pays at its own end (${[...ran].join(', ')}; paid by ${done.join()}; ${r.stop})`); }
    // FS: every week card that gives food is a wilds Forage or Hunt card; Practice and the village's and Fallout's give none
    { const food = [], none = []; for (const hub of Tk.WEEK_HUBS) for (const m of Object.keys(TASK_HUBS[hub].menus || {})) SCENES[m].choices.forEach((c, i) => { if (c.check || c.time != null) (Tk.foodCard(c) ? food : none).push(`${m}:${i}`); });
      assert(food.length >= 7 && food.every((id) => /^wild_(forage|hunt):/.test(id)) && none.some((id) => /^wild_train:/.test(id)) && none.some((id) => /^fo_/.test(id)), `${T} (FS): the food cards are the wilds' Forage and Hunt (${food.join()})`); }
    // main.js: the planned cards' notes count every work carried
    { const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
      assert(src.includes('const carried = new Set(carriesHere(g, g.scene).map((cy) => cy.id))') && !/tasks\?\.carry\b/.test(src), `${T}: main.js reads every work carried`); }
    // the old calendar: no carry ever
    { const g = ensureBars(newGame(99702, { closed: true })); goTo(g, SCENES, 'wilds'); g.minutes = D + 7 * 60; Tk.runTask(g, SCENES, 'wild_train:1'); assert(!g.tasks.carries && !g.tasks.carry, `${T}: the old calendar: nothing carried`); }
}

// v0.11.215 (owner pick RV1 after the Opus review: KS, SG, DL, MS, SR, TG1–TG10): a carried work lives through its stay (the camp and the
// village between keep it), an unpaid one dropped at the stay's end says so, a card that gives no food starts only if its whole work fits
// in the stay, a start needs its old length left today, the result reads the story day its work started.
{
    const Gm = await import('../js/core/game.js');
    const C = await import('../js/core/calendar.js');
    const Wk = await import('../js/core/week.js');
    const Tk = await import('../js/core/tasks.js');
    const A = await import('../js/story/again.js');
    const T = 'CF1 RV1';
    const D = 1440;
    const at = (hub, sd, h = 7, seed = 99801) => { const g = ensureBars(newGame(seed, { closed: true, cal: C.LONG_CAL })); goTo(g, SCENES, hub); g.minutes = (C.calStart(g, sd) - 1) * D + h * 60; g.james.satiety = 100; g.james.qi = 30; Gm.addItem(g, 'smoked_meat', 40); g.flags.palisade = 1; g.flags.wolf = 'driven'; g.flags.ya_met = true; return g; };
    // TG1 (H1, KS): unpaid work through the wilds' camp and back; the prologue village between Ashfall's days
    { const g = at('wilds', 2); g.flags.fire = true; Tk.runTask(g, SCENES, 'wild_train:1'); const left = g.tasks.carries['wild_train:1']?.left;
      goTo(g, SCENES, 'camp'); const ci = taskCards(g, SCENES).find((c) => c.status === 'open' && !Tk.isCarryTask(c.id))?.id; if (ci) Tk.runTask(g, SCENES, ci);
      assert(left > 0 && ci && g.tasks.carries['wild_train:1']?.left === left && g.tasks.carries['wild_train:1'].paid === false, `${T} (TG1, KS): a card at camp keeps the wilds' unpaid work (${ci}; ${left} → ${g.tasks.carries['wild_train:1']?.left})`);
      goTo(g, SCENES, 'wilds'); g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine; assert(taskCards(g, SCENES).some((c) => c.id === Tk.carryTaskId('wild_train:1') && c.status === 'open'), `${T} (TG1): back on the wilds its Go on opens`); }
    { const g = at('ashfall', 5); const card = taskCards(g, SCENES).find((c) => c.week && c.status === 'open' && !Tk.foodCard(SCENES[c.id.split(':')[0]].choices[Number(c.id.split(':')[1])])); Tk.runTask(g, SCENES, card.id);
      goTo(g, SCENES, 'village'); const vi = taskCards(g, SCENES).find((c) => c.status === 'open' && !Tk.isCarryTask(c.id))?.id; if (vi) Tk.runTask(g, SCENES, vi);
      assert(vi && Tk.carriesRead(g)[card.id]?.paid === false, `${T} (TG1, KS): a card in the village keeps Ashfall's unpaid work (${card.id}, ${vi})`); }
    // TG1 (H2, DL): the stay over, the next task hub drops the unpaid work and says so; a paid one goes quietly
    { const g = at('fo_ashfall', 10); const card = taskCards(g, SCENES).find((c) => c.week && c.status === 'open'); Tk.runTask(g, SCENES, card.id);
      g.tasks.carries.extra = { id: 'extra', hub: 'fo_ashfall', left: 60, total: 600, label: 'Paid work', coil: g.tasks.carries[card.id].coil, paid: true, stay: 3 };
      g.flags.ending = 'paid'; g.minutes = (C.calStart(g, 12) - 1) * D + 8 * 60; goTo(g, SCENES, 'rr_hub'); const ri = taskCards(g, SCENES).find((c) => c.status === 'open')?.id; const r = Tk.runTask(g, SCENES, ri);
      const line = r.lines.find((x) => /left unfinished when the stay ended; nothing comes of it\./.test(x));
      assert(!g.tasks.carries[card.id] && !g.tasks.carries.extra && line && line.startsWith(g.tasks.carries[card.id]?.label || '') && r.pre >= 1 && r.lines.filter((x) => /left unfinished/.test(x)).length === 1, `${T} (TG1, DL): at the Root Road the Fallout's works dropped, the unpaid one said once (${line}; pre ${r.pre})`); }
    // SG: a card that gives no food is "too long" when its whole work can't fit in the stay; the plan and the forecast skip it
    { const g = at('fo_ashfall', 10, 7); g.minutes += 6 * D; delete g.tasks.routine; // the stay's last morning
      const long = taskCards(g, SCENES).filter((c) => c.week && c.status === 'long').map((c) => c.id), room = Tk.stayRoom(g);
      Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); for (const id of long) Wk.planSet(g, id, 1); const ids = []; Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
      assert(long.length >= 6 && room <= 540 && !ids.some((id) => long.includes(id)) && Object.values(Wk.planNotes(g, SCENES).rows).every((x) => / not this week/.test(x)), `${T} (SG): the stay's last morning: ${long.length} cards too long (${room} min left), none started, all "not this week"`);
      const e = at('fo_ashfall', 8, 7); assert(taskCards(e, SCENES).filter((c) => c.week && c.status === 'long').length === 0 && Tk.stayRoom(e) > 7000, `${T} (SG): the stay's first morning: none too long (${Tk.stayRoom(e)} min)`);
      const src = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8'); assert(src.includes("c.status === 'long' ? 'too long for what is left of this stay'") && src.includes("|| c.status === 'long'));"), `${T} (SG): the card shown, locked, with its reason`); }
    // SR (TG10, M2): a week's card opens only with its old-calendar length left today; the late-start food path is closed
    { const g = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true }); g.james.satiety = 100; Gm.addItem(g, 'smoked_meat', 20);
      g.minutes = Math.floor(g.minutes / D) * D + 14 * 60 + 30; g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true };
      const food = taskCards(g, SCENES).filter((c) => c.week && Tk.foodCard(SCENES[c.id.split(':')[0]].choices[Number(c.id.split(':')[1])]));
      assert(food.length >= 5 && food.every((c) => c.status !== 'open'), `${T} (SR, TG10): at 14:30 (30 min left) no food card starts (${food.map((c) => `${c.id} ${c.status}`).join(', ')})`);
      const h = deserialize(readFileSync(new URL('../saves/v0.11.204-long-wilds-day2.json', import.meta.url), 'utf8'), { force: true }); h.minutes = Math.floor(h.minutes / D) * D + 7 * 60; h.tasks.routine = { d: Tk.workDay(h), meals: 'bls', sit: true };
      assert(taskCards(h, SCENES).filter((c) => c.week && c.status === 'open').length >= 5, `${T} (SR): at 07:00 they open`); }
    // TG3 (M1, MS): the Fallout council card started on story day 8, ended on day 9: day 8's reply and flag
    { const g = at('fo_ashfall', 8, 7); g.minutes = (C.calEnd(g, 8) - 1) * D + 7 * 60; const id = 'fo_council:0'; Tk.runTask(g, SCENES, id); const sd0 = C.storyDay(g); // started on day 8's last day
      for (let d = 1; d < 12 && g.tasks.carries?.[id]; d++) { g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine; if (Tk.taskOpen(g, SCENES, Tk.carryTaskId(id))) Tk.runTask(g, SCENES, Tk.carryTaskId(id)); }
      assert(sd0 === 8 && C.storyDay(g) === 9 && !g.tasks.carries?.[id] && g.flags.council8 && !g.flags.council9, `${T} (TG3, MS): started on day 8, ended on day ${C.storyDay(g)}: day 8's flag (${Object.keys(g.flags).filter((f) => /^council/.test(f)).join()})`); }
    // TG5: two works carried, both paid at their own ends
    { const g = at('fo_ashfall', 8, 7); const [a, b] = taskCards(g, SCENES).filter((c) => c.week && c.status === 'open').map((c) => c.id);
      Tk.runTask(g, SCENES, a); g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine; Tk.runTask(g, SCENES, b);
      const paid = new Set(); for (let d = 0; d < 14 && Tk.carriesHere(g).length; d++) { g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine; for (const cy of Tk.carriesHere(g)) { if (!Tk.taskOpen(g, SCENES, Tk.carryTaskId(cy.id))) continue; const r = Tk.runTask(g, SCENES, Tk.carryTaskId(cy.id)); if (r.lines.some((x) => / \/ DC /.test(x))) paid.add(cy.id); } }
      assert(paid.size === 2 && paid.has(a) && paid.has(b), `${T} (TG5): both works paid at their ends (${[...paid].join()})`); }
    // the plan goes on with each card's own work at its card's place: the newer work placed first goes on first (F17)
    { const g = at('fo_ashfall', 8, 7); const [a, b] = taskCards(g, SCENES).filter((c) => c.week && c.status === 'open').map((c) => c.id);
      Tk.runTask(g, SCENES, a); g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine; Tk.runTask(g, SCENES, b); g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine;
      Wk.planEnsure(g); Wk.planSet(g, 'door:yk_time', 0); Wk.planPrio(g, SCENES, b, 1); const ids = []; Wk.runWeek(g, SCENES, { onStep: (cg, l) => { if (l && !l.r.skipped) ids.push(l.id); } });
      assert(ids.find(Tk.isCarryTask) === Tk.carryTaskId(b), `${T} (F17): ${b} placed first: its Go on first, though ${a}'s work is older (${ids.slice(0, 4).join(', ')})`); }
    // TG6 (F15): an old save's work, followed to its end, pays nothing (the owner's Sing)
    { const h = deserialize(readFileSync(new URL('../saves/v0.11.214-long-fallout-day64.json', import.meta.url), 'utf8'), { force: true }); h.minutes = 57 * D + 7 * 60; goTo(h, SCENES, 'fo_ashfall'); h.james.satiety = 100;
      const fam = h.tasks.fam['fo_palisade:0'], checks = h.stats.checks; let last = null;
      for (let d = 0; d < 5 && Tk.carriesRead(h)['fo_palisade:0']; d++) { delete h.tasks.routine; if (Tk.taskOpen(h, SCENES, Tk.carryTaskId('fo_palisade:0'))) last = Tk.runTask(h, SCENES, Tk.carryTaskId('fo_palisade:0')); h.minutes = Math.floor(h.minutes / D + 1) * D + 7 * 60; }
      assert(!Tk.carriesRead(h)['fo_palisade:0'] && last?.lines.some((x) => /Sing a full stretch of the line: done/.test(x)) && h.stats.checks === checks && h.tasks.fam['fo_palisade:0'] === fam, `${T} (TG6): the owner's Sing ends and pays nothing twice (checks ${checks} → ${h.stats.checks})`); }
    // TG7 (F12): an unpaid start still charges the work's Fed
    { const g = at('wilds', 2); g.tasks.routine = { d: Tk.workDay(g), meals: 'bls', sit: true }; const f0 = g.james.satiety, m0 = g.minutes; Tk.runTask(g, SCENES, 'wild_train:1');
      const hrs = (g.minutes - m0) / 60; assert(Math.abs((f0 - g.james.satiety) - 4 * hrs) < 0.6, `${T} (TG7): an unpaid start costs Fed 4 an hour (${(f0 - g.james.satiety).toFixed(1)} over ${hrs.toFixed(1)} h)`); }
    // TG8 (F1): a once-a-Coil card closes at its end, not its start
    { const g = at('fo_ashfall', 8, 7); const id = 'fo_council:1'; Tk.runTask(g, SCENES, id); const before = !!g.flags['oo:fo_council#1']; // no check: it always succeeds
      for (let d = 0; d < 8 && g.tasks.carries?.[id]; d++) { g.minutes = Math.floor(g.minutes / D + 1) * D + 7 * 60; delete g.tasks.routine; if (Tk.taskOpen(g, SCENES, Tk.carryTaskId(id))) Tk.runTask(g, SCENES, Tk.carryTaskId(id)); }
      assert(!before && g.flags['oo:fo_council#1'] && !taskCards(g, SCENES).some((c) => c.id === id), `${T} (TG8): the once-a-Coil card open while its work goes on, closed at its end`); }
    // TG9 (F18): a Go on tapped at a read stop clears the stop and leaves its card's count
    { const g = at('fo_ashfall', 8, 7); Wk.planEnsure(g); const card = Wk.planCards(g, SCENES)[0].id; Wk.planSet(g, card, 2); const p = g.tasks.plan; p.read = Tk.carryTaskId(card); p.readKey = card; p.stop = 'read';
      Wk.noteReadTap(g, SCENES, Tk.carryTaskId(card), { lines: [] });
      assert(!p.read && p.items[card] === 2 && p.stop === '', `${T} (TG9): the Go on's tap: stop cleared, ${card} still 2`); }
}

// v0.11.217 (owner picks PT1 = PM, 2026-11-17 19:26, and PC1 = PM + CG, 2026-11-18 01:01; the owner 17:42 "eating at the pot is not
// among the schedualble options"): on the village's and the Fallout's stays the day's meal is the communal pot's when its card is open
// (as its card: time, line, the pot used), else the hammerspace; not while the cook-with-the-women card can still show today (CG);
// the pot's card tapped by hand is that part of the day's meal.
{
    const Gm = await import('../js/core/game.js');
    const Wk = await import('../js/core/week.js');
    const Tk = await import('../js/core/tasks.js');
    const K = await import('../js/story/kitchen.js');
    const T = 'PT1 (the routine eats at the pot)';
    const D = 1440, MEAL = /^(Breakfast|Midday|Supper): /, POT = /\+25 satiety\.$/;
    // the owner's Day 64 save set back to Day 51 07:00 (the Fallout's second week), the cook not done yet, Fed 60
    const wk2 = (vil = null) => { const g = deserialize(readFileSync(new URL('../saves/v0.11.214-long-fallout-day64.json', import.meta.url), 'utf8'), { force: true });
        g.minutes = 50 * D + 7 * 60; delete g.wake; delete g.flags.fo_pot_cook; delete g.tasks.plan; delete g.tasks.carries; delete g.tasks.carry; delete g.tasks.routine;
        g.james.satiety = 60; g.james.qi = 20; Gm.addItem(g, 'smoked_meat', 40); if (vil != null) g.rel.Village.f = vil; return g; };
    const week = (g) => { const lines = []; const go = () => { const r = Wk.runWeek(g, SCENES); for (const d of r.days) lines.push(...d.lines.map((l) => `D${d.day} ${l}`)); return r; }; let r = go();
        for (let k = 0; k < 160 && ['evening', 'door'].includes(r.stop); k++) {
            const v = sceneView(g, SCENES); const open = v.choices.filter((c) => !c.disabled && c.index < 1000 && !/^(Yuki: change form|Story Mode only)/.test(c.label)); if (!open.length || g.combat) break;
            const ev = open.find((c) => /^Evening\.|loft|Sleep|bed/i.test(c.label)) || open[open.length - 1]; Wk.storyTap(g, SCENES, ev.index); if (g.combat) break; if (Wk.afterStory(g, SCENES).resume) r = go(); }
        return lines; };
    const plan = (g, cookFirst = true) => { Wk.planEnsure(g); for (const c of Wk.planCards(g, SCENES)) Wk.planSet(g, c.id, 1); Wk.planSet(g, 'med:sit', 1); Wk.planSet(g, 'door:fo_pot_cook', 1);
        const pr = Wk.prioHere(g, 'fo_ashfall', true); for (const k of Object.keys(pr)) delete pr[k]; if (cookFirst) pr['door:fo_pot_cook'] = 1; };
    const meals = (ls) => ls.filter((x) => MEAL.test(x.replace(/^D\d+ /, '')));
    const pots = (ls) => meals(ls).filter((x) => POT.test(x)).map((x) => x.split(' ').slice(0, 2).join(' ').replace(/:$/, ''));
    const cookDay = (ls) => (ls.find((x) => POT.test(x) && !MEAL.test(x.replace(/^D\d+ /, ''))) || '').split(' ')[0];
    // the measured week (shown to the owner before PC1): v0.11.216 eats 11 hammerspace meals and cooks on Day 54
    { const g = wk2(); plan(g); Tk.PT1.on = false; let ls; try { ls = week(g); } finally { Tk.PT1.on = true; }
      assert(pots(ls).length === 0 && meals(ls).length === 11 && cookDay(ls) === 'D54' && g.flags.fo_pot_cook, `${T}: PT1 off: v0.11.216's week, 11 hammerspace meals, the cook on Day 54 (${meals(ls).length}, ${cookDay(ls)})`); }
    // PC1 (PM + CG): 6 pot meals (suppers until the cook, then from breakfast), 7 from the hammerspace, the cook kept on Day 54
    { const g = wk2(); plan(g); const ls = week(g);
      assert(pots(ls).join() === 'D51 Supper,D52 Supper,D53 Supper,D55 Supper,D56 Breakfast,D57 Supper' && meals(ls).length === 13 && cookDay(ls) === 'D54' && g.flags.fo_pot_cook, `${T} (PC1): 6 pot meals, 13 in all, the cook on Day 54 (${pots(ls).join()}; ${meals(ls).length}; ${cookDay(ls)})`);
      assert(meals(ls).filter((x) => POT.test(x)).every((x) => /^D\d+ (Breakfast|Midday|Supper): .+: \+25 satiety\.$/.test(x)), `${T}: a pot meal reads "<part of the day>: <the pot's line>: +25 satiety."`); }
    // CG lifted below the village's 90 (no cook card): the pot from breakfast, one a day
    { const g = wk2(50); plan(g); const ls = week(g);
      assert(pots(ls).length === 7 && pots(ls)[0] === 'D51 Breakfast' && !g.flags.fo_pot_cook, `${T} (CG): Village 50: the pot every day from breakfast, no cook (${pots(ls).join()})`); }
    // CG by the hour: before 15:00 the pot is left for the cook, from 15:00 it is the routine's
    { const g = wk2(); g.minutes = 50 * D + 14 * 60 + 59; const before = Tk.potCardOpen(g, SCENES); g.minutes = 50 * D + 15 * 60; const after = Tk.potCardOpen(g, SCENES);
      assert(K.potCookDue(g, 'fo_ashfall') === false && before === null && after === Tk.potCardId(SCENES, 'fo_ashfall'), `${T} (CG): 14:59 left for the cook, 15:00 the routine's (${before}, ${after})`);
      g.minutes = 50 * D + 9 * 60; g.flags.fo_pot_cook = true; (await import('../js/story/common.js')).markDaily(g, 'a1_cook'); assert(Tk.potCardOpen(g, SCENES) === Tk.potCardId(SCENES, 'fo_ashfall'), `${T} (CG; CK1): cooked today: the pot from the morning`); }
    // the pot's meal takes its card's time, its line and the day's pot
    { const g = wk2(50); const id = Tk.potCardId(SCENES, 'fo_ashfall'), mins = taskCards(g, SCENES).find((c) => c.id === id)?.minutes, m0 = g.minutes, f0 = g.james.satiety;
      const ls = Tk.dayMeal(g, 'fo_ashfall', SCENES);
      assert(ls.length >= 1 && /^Breakfast: .+: \+25 satiety\.$/.test(ls[0]) && g.minutes - m0 === mins && Math.abs(g.james.satiety - f0 - 25) < 2 && !Tk.taskOpen(g, SCENES, id), `${T} (PM): the card's ${mins} min, +25 (less the half hour's hunger), the pot shut for the day (${g.minutes - m0}, ${(g.james.satiety - f0).toFixed(1)}, ${ls[0]})`);
      assert(Tk.dayMeal(g, 'fo_ashfall', SCENES).length === 0, `${T}: one meal a part of the day`); }
    // the pot's card tapped by hand: that part of the day's meal (no routine meal before it, no "no time left" line); the next card eats nothing more
    { const g = wk2(50); g.james.satiety = 50; const id = Tk.potCardId(SCENES, 'fo_ashfall'); const r = runTask(g, SCENES, id);
      assert(!r.skipped && !r.lines.includes(Tk.SKIP_LINE) && r.lines.filter((x) => POT.test(x)).length === 1 && !r.lines.some((x) => MEAL.test(x)), `${T}: the pot tapped by hand is the breakfast (${r.lines.join(' | ').slice(0, 200)})`);
      const sm = g.inventory.smoked_meat, card = taskCards(g, SCENES).find((c) => c.week && c.status === 'open'); const r2 = runTask(g, SCENES, card.id);
      assert(g.inventory.smoked_meat === sm && !r2.lines.some((x) => MEAL.test(x)), `${T}: the breakfast taken: the next card eats nothing (Fed ${Math.round(g.james.satiety)})`); }
    // the plan's day off and its evening eat at the pot too (an empty plan: the rest of the day off)
    { const g = wk2(50); g.james.satiety = 70; Wk.planEnsure(g); const r = Wk.runWeek(g, SCENES, { max: 3 }); const ls = r.days.flatMap((d) => d.lines);
      assert(ls.some((x) => /^Breakfast: .+: \+25 satiety\.$/.test(x)) && ls.includes('The rest of the day off.'), `${T}: the day off's breakfast at the pot (${ls.slice(0, 3).join(' | ').slice(0, 160)})`); }
    { const g = wk2(50); g.james.satiety = 70; g.minutes = 50 * D + 16 * 60 + 10; Wk.planEnsure(g); const r = Wk.runWeek(g, SCENES); const ls = r.days.flatMap((d) => d.lines);
      assert(/^Supper: .+: \+25 satiety\.$/.test(ls[0] || ''), `${T}: the evening's meal at the pot (${(ls[0] || '').slice(0, 120)})`); }
    // a pot meal that runs past the evening hour ends the day off there: the clock never goes back, the evening comes once
    { const g = wk2(50); g.james.satiety = 70; g.minutes = 50 * D + 15 * 60 + 40; delete g.tasks.fam; Wk.planEnsure(g); const ms = [];
      const r = Wk.runWeek(g, SCENES, { onStep: (cg) => ms.push(cg.minutes) }); const ls = r.days.flatMap((d) => d.lines);
      assert(ms.every((m, k) => k === 0 || m >= ms[k - 1]) && ms.length < 40 && /^Supper: /.test(ls[0] || '') && ls.filter((x) => x === 'The rest of the day off.').length === 0, `${T}: a pot meal from 15:40 runs past 16:00: no day off after it, no clock back (${ms.length} steps, ${ls.slice(0, 2).join(' | ').slice(0, 140)})`); }
    // RV1 (the Opus review's fixes and test gaps)
    const sitDone = (g) => { g.tasks.routine = { d: Tk.workDay(g), meals: '', sit: true }; return g; };
    const at = (min, vil = 50, fed = 60) => { const g = wk2(vil); g.minutes = 50 * D + min; delete g.wake; g.james.satiety = fed; return sitDone(g); };
    // TG1 (R8): an empty hammerspace: the pot still feeds
    { const g = at(8 * 60); g.inventory = {}; const ls = Tk.dayMeal(g, 'fo_ashfall', SCENES); assert(/^Breakfast: .+: \+25 satiety\.$/.test(ls[0] || ''), `${T} (RV1, TG1): no food in the hammerspace: breakfast at the pot (${ls[0]})`); }
    // TG2 (R3): Village exactly 90, the cook not done, 10:00: the pot is left for the cook; at 89 it is the routine's
    { const g = at(10 * 60, 90); const h = at(10 * 60, 89);
      assert(K.potCookDue(g, 'fo_ashfall') && Tk.potCardOpen(g, SCENES) === null && Tk.potCardOpen(h, SCENES) === Tk.potCardId(SCENES, 'fo_ashfall'), `${T} (RV1, TG2): Village 90 waits for the cook, 89 eats`); }
    // TG3 (R9): the meal is named by the part of the day it starts in (10:40 to 11:10 is the breakfast)
    { const g = at(10 * 60 + 40); const ls = Tk.dayMeal(g, 'fo_ashfall', SCENES); assert(/^Breakfast: /.test(ls[0] || '') && Gm.clockParts(g.minutes).hh === 11 && g.tasks.routine.meals === 'b', `${T} (RV1, TG3): 10:40 → 11:10 reads Breakfast (${ls[0]?.slice(0, 30)}, ${g.tasks.routine.meals})`); }
    // TG4 (R7): the pot's meal keeps every line of its card (only the satiety line gets the part of the day)
    { const g = at(8 * 60), h = JSON.parse(JSON.stringify(g)); const ls = Tk.dayMeal(g, 'fo_ashfall', SCENES); const r = runTask(h, SCENES, Tk.potCardId(SCENES, 'fo_ashfall'));
      const strip = (x) => x.replace(MEAL, ''); assert(ls.length === r.lines.length && ls.map(strip).join('|') === r.lines.join('|'), `${T} (RV1, TG4): the routine's pot lines are the card's (${ls.length} / ${r.lines.length})`); }
    // TG5 (R6): PT1 off, the pot tapped by hand: v0.11.216's way (the routine's hammerspace breakfast first, then the pot shut: skipped)
    { const g = at(8 * 60, 50, 50); Tk.PT1.on = false; let r; try { r = runTask(g, SCENES, Tk.potCardId(SCENES, 'fo_ashfall')); } finally { Tk.PT1.on = true; }
      assert(r.skipped && r.lines.some((x) => /^Breakfast: /.test(x) && !POT.test(x)) && g.tasks.routine.meals === 'b', `${T} (RV1, TG5): PT1 off: the hand tap as v0.11.216 (${r.lines.slice(0, 2).join(' | ').slice(0, 120)})`); }
    // TG6 (M1): the day off: a pot breakfast past 11:00, then the midday meal (Fed at 15:00 as v0.11.216's 88)
    { const g = at(10 * 60 + 50, 50, 40); Wk.planEnsure(g); let fed15 = null; const r = Wk.runWeek(g, SCENES, { onStep: (cg) => { if (fed15 == null && Gm.clockParts(cg.minutes).hh >= 15) fed15 = cg.james.satiety; } });
      const ls = r.days.flatMap((d) => d.lines).filter((x) => MEAL.test(x));
      assert(/^Breakfast: .+\+25 satiety\.$/.test(ls[0] || '') && /^Midday: /.test(ls[1] || '') && fed15 >= 85, `${T} (RV1, M1): 10:50 Fed 40: the pot's breakfast, then midday (Fed at 15:00 ${Math.round(fed15)}; ${ls.map((x) => x.split(':')[0]).join(', ')})`); }
    // TG6 (L1): the pot tapped at 18:56: the day's sit runs it past 19:00, the tap skipped and no meal marked; the next tap has the supper
    { const g = at(18 * 60 + 56); g.tasks.routine.sit = false; const r = runTask(g, SCENES, Tk.potCardId(SCENES, 'fo_ashfall'));
      const c = taskCards(g, SCENES).find((x) => x.status === 'open' && !/^Eat /.test(x.label)); const r2 = runTask(g, SCENES, c.id);
      assert(r.skipped && r2.lines.some((x) => /^Supper: /.test(x)), `${T} (RV1, L1): skipped, then the supper with ${c.label.slice(0, 30)}`); }
    // L2: "Eat something." tapped at 10:00 (Fed 70) is the breakfast: it runs, no routine meal before it
    { const g = at(10 * 60, 50, 70); const id = taskCards(g, SCENES).find((x) => x.label === 'Eat something.')?.id; const r = runTask(g, SCENES, id);
      assert(Tk.mealCard(SCENES, 'fo_ashfall', id) && !r.skipped && r.lines.some((x) => /^You eat: /.test(x)) && !r.lines.some((x) => MEAL.test(x)) && g.tasks.routine.meals === 'b', `${T} (RV1, L2): the eat card tapped is the breakfast (${r.lines.slice(0, 2).join(' | ').slice(0, 100)})`); }
    // L2: "Rest an hour" tapped at 18:35 (Fed 60): the pot's 30 minutes would shut it at 19:00, so the supper is the hammerspace's and the rest runs
    { const g = at(18 * 60 + 35); const id = taskCards(g, SCENES).find((x) => /^Rest an hour/.test(x.label))?.id; const r = runTask(g, SCENES, id);
      assert(!r.skipped && r.lines.some((x) => /^Supper: /.test(x) && !POT.test(x)) && Tk.taskOpen(g, SCENES, Tk.potCardId(SCENES, 'fo_ashfall')) === false, `${T} (RV1, L2): the rest runs, the supper from the hammerspace (${r.lines.filter((x) => MEAL.test(x)).join('|').slice(0, 80)})`); }
    // F4: the pot's meal marks its part of the day (Fed 40 → 65 is still under 85: no second meal)
    { const g = at(8 * 60, 50, 40); const a = Tk.dayMeal(g, 'fo_ashfall', SCENES), b = Tk.dayMeal(g, 'fo_ashfall', SCENES);
      assert(POT.test(a.find((x) => MEAL.test(x)) || '') && b.length === 0 && g.james.satiety < 85 && g.tasks.routine.meals === 'b', `${T} (F4): one meal a part of the day, Fed under 85 after it (${Math.round(g.james.satiety)}, ${b.join('|').slice(0, 60)})`); }
    // R6: PT1 off, no food, the pot tapped by hand: v0.11.216 marks no part of the day
    { const g = at(8 * 60, 50, 50); g.inventory = {}; Tk.PT1.on = false; let r; try { r = runTask(g, SCENES, Tk.potCardId(SCENES, 'fo_ashfall')); } finally { Tk.PT1.on = true; }
      assert(!r.skipped && r.lines.some((x) => POT.test(x)) && g.tasks.routine.meals === '', `${T} (R6): PT1 off: the hand-tapped pot marks nothing (${JSON.stringify(g.tasks.routine)})`); }
    assert(!Tk.mealCard(SCENES, 'wilds', 'wilds:0') && !Tk.mealCard(SCENES, 'fo_ashfall', null), `${T} (RV1): meal cards only on the village's and the Fallout's hubs`);
    // TG7: with the read stop on and nothing read, the day off's pot meals never stop the plan (the routine's lines are not probed)
    { const g = at(7 * 60); g.read = {}; Wk.planEnsure(g); Wk.READ_STOP.on = true; let r; try { r = Wk.runWeek(g, SCENES, { max: 6 }); } finally { Wk.READ_STOP.on = false; }
      assert(r.stop !== 'read' && r.days.flatMap((d) => d.lines).some((x) => /^Breakfast: .+\+25 satiety\.$/.test(x)), `${T} (RV1, TG7): the read stop never stops for the routine's pot (${r.stop})`); }
    // PT1 off: the pot is never the routine's; the wilds and the old calendar have no pot
    { const g = wk2(50); Tk.PT1.on = false; try { assert(Tk.potCardOpen(g, SCENES) === null && !Tk.dayMeal(g, 'fo_ashfall', SCENES).some((x) => POT.test(x)), `${T}: PT1 off: the hammerspace, as before`); } finally { Tk.PT1.on = true; } }
    assert(Tk.potCardId(SCENES, 'wilds') === null && Tk.potCardId(SCENES, 'heart_hub') === null && /^ashfall:\d+$/.test(Tk.potCardId(SCENES, 'ashfall')), `${T}: only the village's and the Fallout's hubs have the pot`);
    { const o = ensureBars(newGame(99601, { closed: true })); goTo(o, SCENES, 'ashfall'); o.minutes = 4 * D + 8 * 60; o.james.satiety = 50; const f0 = o.james.satiety, m0 = o.minutes;
      assert(Tk.dayMeal(o, 'ashfall', SCENES).length === 0 && o.james.satiety === f0 && o.minutes === m0, `${T}: the old calendar: no routine meal`); }
}

// v0.11.218 (owner pick CK1 = RF3 + G1 + TX3, 2026-11-18 01:01): cooking with the village women every 3rd day on the long
// calendar; the gains on the first cook a Coil only; from the second, one of three repeat scenes per act (Fable's), never twice running.
{
    const C = await import('../js/core/calendar.js');
    const K = await import('../js/story/kitchen.js');
    const Wk = await import('../js/core/week.js');
    const Gm = await import('../js/core/game.js');
    const { SOCIAL, EAT: EATLIKE } = await import('./lib/social.mjs');
    const T = 'CK1 (the cook with the women, every 3rd day)';
    const D = 1440;
    // TX3: the texts
    const all = Object.values(K.POT_AGAIN).flat(), vals = all.flatMap((o) => ['label', 'text', 'go', 'result'].map((f) => o[f]));
    assert(K.POT_AGAIN.ashfall.length === 3 && K.POT_AGAIN.fo.length === 3 && vals.every((t) => typeof t === 'string' && t.length > 8 && !/PLACEHOLDER|TODO|\[|\]/.test(t)) && new Set(vals).size === 24, `${T} (TX3): 3 repeats an act, every text filled and distinct`);
    const labels = all.map((o) => o.label);
    assert(labels.every((t) => !EATLIKE.test(t) && !SOCIAL.test(t) && /\.$/.test(t) && t.length < 45) && !labels.includes(K.POT_COOK.ashfall.label) && !labels.includes(K.POT_COOK.fo.label), `${T} (TX3): the labels end with a full stop, under 45 characters, not read as eating or a talk, not the first cook's`);
    assert(all.every((o) => !/[.!?:]$/.test(o.result) && /\.$|\?$|!$/.test(o.go)) && all.every((o) => o.text.split(/\n\n/).length === 2), `${T} (TX3): the results end bare (the code adds ": +25 satiety."), the buttons end, two paragraphs`);
    assert(vals.every((t) => !/\b(morning|noon|midday|afternoon|evening|dawn|dusk|tonight|today|tomorrow|yesterday|breakfast|lunch|dinner|supper|night\w*|sunrise|sunset)\b/i.test(t)), `${T} (TX3; RV1, TG3): no time words, meal names or night (the card shows 09:00–14:59, on any day of the stay)`);
    assert(vals.every((t) => !/\b(every (other|second|third|few|\w+) days?|(second|third|fourth|fifth|sixth|seventh|last) (time|visit|cook)|(two|three|four|five|six|seven|several) (days|visits|times|cooks))\b/i.test(t) && (t.match(/\bagain\b/gi) || []).length <= 1), `${T} (RV1, TG3): no count of days or visits, "again" once at most (any repeat can be the 2nd cook or the 7th)`);
    // RV1 (TG1, TG2, TG4, TG7): the canon card's tics; Claude's cuts and label change kept; a result read whole as the gain; canon
    { const CARD_TICS = /something like|for a moment|in a way that|the way a\b|a long moment|a long time|the first time|a thousand years|four hundred pounds|a great deal|a good deal|the far side|sits down beside|a black dress|since the lab|light comes down|gold eyes level/i;
      assert(vals.every((t) => !CARD_TICS.test(t)), `${T} (RV1, TG1): no canon-card tic in the six`);
      assert(readFileSync(new URL('../tools/textlint.mjs', import.meta.url), 'utf8').includes('...Object.values(KT.POT_AGAIN).flat().flatMap((o) => [o.label, o.text, o.go, o.result])'), `${T} (RV1, TG1): the text lint's kitchen pool reads the six`);
      const [p1, p2] = K.POT_AGAIN.ashfall;
      assert(!/says nothing/.test(p1.text) && /She tastes it, and moves the mortar/.test(p1.text) && !/lets it be known/.test(p2.text) && /She informs you that in her house eggs are finished\./.test(p2.text) && p2.label === 'See to the greens at the village pot.', `${T} (RV1, TG2): Claude's two cuts and P2's label kept`);
      const { splitLine } = await import('../js/core/replies.js');
      assert(all.every((o) => { const l = `${o.result}: +25 satiety.`; const r = splitLine(l); return !/"/.test(o.result) && !/[.!?] /.test(o.result) && r.reply === '' && r.gain === l; }), `${T} (RV1, TG4): each result one sentence, no speech, read whole as the gain`);
      assert(K.POT_AGAIN.fo.filter((o) => /Mei Lin's mother/.test(o.text + o.result)).length <= 2 && vals.every((t) => !/\b(senses?|sensed|cultivation|qi|realm|meridian\w*|dantian)\b/i.test(t)), `${T} (RV1, TG7): Mei Lin's mother in at most two of the Fallout's three; no local senses his cultivation`); }
    assert(!K.POT_AGAIN.ashfall.some((o) => /Mei Lin's mother/.test(o.text + o.result)), `${T} (TX3): Mei Lin's mother not at the prologue's pot (RV1, L4 of v0.11.181)`);
    assert(!KEEP_FLAGS.some((f) => /pot_cook|(^|_)cook$/.test(f)), `${T}: the cook's flags reset with the Coil`);
    const mk = (hub, sd, act, long = true, seed = 99181) => { const g = ensureBars(newGame(seed, { closed: true, ...(long ? { cal: C.LONG_CAL } : {}) })); g.coil.act = act; goTo(g, SCENES, hub);
        g.minutes = (long ? C.calStart(g, sd) - 1 : sd - 1) * D + 10 * 60; delete g.wake; g.rel.Village = { f: 100, a: 0 }; g.rel.Mother = { f: 10, a: 0 }; g.james.satiety = 40; g.flags.ya_met = true; return g; };
    const ci = (hub) => SCENES[hub].choices.findIndex((c) => c.to === K.POT_HUBS[hub].scene);
    const cook = (g, hub) => { g.james.satiety = 40; const label = sceneView(g, SCENES).choices.find((c) => c.index === ci(hub))?.label; choose(g, SCENES, ci(hub)); const v = sceneView(g, SCENES);
        const r = choose(g, SCENES, 0); return { label, text: v.text, go: v.choices[0]?.label, lines: r.lines || [], fed: g.james.satiety, back: g.scene === hub }; };
    for (const [hub, act, sd, t] of [['ashfall', 0, 4, 'ashfall'], ['fo_ashfall', 1, 8, 'fo']]) {
        const flag = K.POT_HUBS[hub].flag, P = K.POT_AGAIN[t], F = K.POT_COOK[t];
        // the old calendar: once a Coil, the first scene, no new flag
        { const o = mk(hub, sd + 1, act, false); const r = cook(o, hub);
          assert(r.label === F.label && r.text === F.text && r.back && o.rel.Village.f === 103 && !(`${flag}_v` in o.flags) && !(`${flag}_next` in o.flags) && !Object.keys(o.flags).some((k) => /^(a1_)?cook@/.test(k)), `${T}: ${hub}, the old calendar: the first scene and its gains, no new flag`);
          o.minutes += D; assert(!K.potCookOpen(o, hub) && !K.potCookDue(o, hub), `${T}: ${hub}, the old calendar: once a Coil`); }
        // RV1 (H1, HA, TG6): a week after the first cook, its plan's cook row 0: the routine's pot meals as v0.11.217 (Ashfall 7, the Fallout 6;
        // 2 each before RV1); row 1: two repeat cooks, the pot held on their days only
        for (const row of [0, 1]) {
            const w = mk(hub, sd, act, true, 7); w.james.satiety = 50; Gm.addItem(w, 'smoked_meat', 99); Object.assign(w.flags, { elder: true, palisade: 1, wolf: 'driven' }); w.rel.Village = { f: 100, a: 0 };
            choose(w, SCENES, ci(hub)); choose(w, SCENES, 0);
            const endDay = C.calStart(w, sd + 3) - 1; w.minutes = Math.floor(w.minutes / D + 1) * D + 7 * 60; delete w.wake;
            Wk.planEnsure(w); for (const s0 of Wk.PLAN_DOORS) Wk.planSet(w, `door:${s0}`, 0); Wk.planSet(w, `door:${K.POT_HUBS[hub].scene}`, row); Wk.planSet(w, 'med:sit', 4); Wk.planSet(w, 'med:rest', 4);
            let pot = 0, ham = 0;
            for (let i = 0; i < 40 && Math.floor(w.minutes / D) < endDay; i++) {
                const r = Wk.runWeek(w, SCENES); for (const d of r.days) for (const l of d.lines) if (/^(Breakfast|Midday|Supper)/.test(l)) { if (/smoked meat/.test(l)) ham++; else pot++; }
                if (w.scene === K.POT_HUBS[hub].scene) { choose(w, SCENES, 0); continue; }
                w.minutes = Math.floor(w.minutes / D + 1) * D + 7 * 60; delete w.wake; w.james.satiety = 50; if (w.scene !== hub) goTo(w, SCENES, hub); if (!Wk.planHere(w)) break; }
            const cooks = Object.keys(w.flags).filter((k) => new RegExp(`^${K.POT_HUBS[hub].key}@`).test(k)).length;
            if (row === 0) assert(pot >= (act ? 6 : 7) && cooks === 1, `${T} (RV1, H1): ${hub}: cook row 0 after the first cook: ${pot} pot meals, ${ham} from the hammerspace, no repeat`);
            else assert(cooks === 3 && pot >= (act ? 4 : 5), `${T} (RV1, HA): ${hub}: cook row 1: two repeat cooks, ${pot} pot meals, ${ham} from the hammerspace`);
        }
        // the long calendar: the stay's cooks, 3 days apart
        const g = mk(hub, sd, act); const d0 = g.minutes, len = C.calStart(g, sd + 3) - C.calStart(g, sd);
        assert(K.potCookOpen(g, hub) && K.potCookDue(g, hub), `${T}: ${hub}: open on the stay's first day`);
        const r1 = cook(g, hub), mum = act === 1 ? 12 : 10;
        assert(r1.label === F.label && r1.text === F.text && r1.go === F.go && r1.lines.includes(`${F.result}: +25 satiety.`) && g.rel.Village.f === 103 && g.rel.Mother.f === mum && g.flags[`${flag}_v`] === -1 && [0, 1, 2].includes(g.flags[`${flag}_next`]), `${T} (G1): ${hub}: the first cook: its scene, Village +3${act ? ', Mother +2' : ''}, the next repeat drawn (${g.flags[`${flag}_next`]})`);
        g.minutes = d0 + D; assert(!K.potCookOpen(g, hub) && !K.potCookDue(g, hub), `${T} (RF3): ${hub}: closed the day after (the routine has the pot)`);
        { const row = Wk.doorCards(g, SCENES).find((d) => d.scene === K.POT_HUBS[hub].scene); assert(row?.repeat && row.status !== 'open' && row.next === Math.floor(g.minutes / D) + 3, `${T} (RF3): ${hub}: the plan's row repeats, opens in 2 days (${JSON.stringify(row)})`); }
        g.minutes = d0 + 2 * D; assert(!K.potCookOpen(g, hub), `${T} (RF3): ${hub}: closed 2 days after`);
        const seq = [];
        for (let k = 1; 3 * k < len && k <= 6; k++) {
            g.minutes = d0 + 3 * k * D; delete g.wake; const v0 = g.flags[`${flag}_next`], vil = g.rel.Village.f, mo = g.rel.Mother.f;
            assert(K.potCookOpen(g, hub) && !K.potCookDue(g, hub) && K.cookLabel(g, hub) === P[v0].label, `${T} (RF3; RV1, HA): ${hub}: open again ${3 * k} days on, no plan row: CG does not hold the pot; the label the drawn repeat's (${v0})`);
            if (k === 1) { const h = JSON.parse(JSON.stringify(g)); Wk.planEnsure(h); Wk.planSet(h, `door:${K.POT_HUBS[hub].scene}`, 1); const due1 = K.potCookDue(h, hub); Wk.planSet(h, `door:${K.POT_HUBS[hub].scene}`, 0);
              assert(due1 && !K.potCookDue(h, hub), `${T} (RV1, HA): ${hub}: a repeat holds the pot only while the plan's cook row is 1`); }
            const r = cook(g, hub); seq.push(v0);
            assert(r.label === P[v0].label && r.text === P[v0].text && r.go === P[v0].go && r.lines.includes(`${P[v0].result}: +25 satiety.`) && r.fed > 58 && r.fed <= 65 && r.back && g.rel.Village.f === vil && g.rel.Mother.f === mo && g.flags[`${flag}_v`] === v0, `${T} (G1, TX3): ${hub}: repeat ${k}: its scene, the meal, no gain (${v0})`);
            assert(!K.potCookOpen(g, hub) && !SCENES[hub].choices.find((c) => c.text === 'Eat at the communal pot.').show(g), `${T}: ${hub}: then neither the card nor the pot that day`);
        }
        assert(seq.length >= 3 && JSON.stringify([...seq.slice(0, 3)].sort()) === '[0,1,2]' && seq.every((v, i) => i === 0 || v !== seq[i - 1]), `${T} (TX3): ${hub}: each repeat once before any comes back, never twice running (${seq.join()})`);
        // an old long-calendar save that cooked this Coil before v0.11.218 (the flag, no repeat drawn): the first repeat, no gain
        { const h = mk(hub, sd, act); h.flags[flag] = true; const vil = h.rel.Village.f; const r = cook(h, hub);
          assert(r.label === P[0].label && r.text === P[0].text && h.rel.Village.f === vil, `${T}: ${hub}: an old save that cooked: the first repeat, no gain`); }
        // RV1 (M1, TG5): and the draw after it is never repeat 0 again (40 seeds; 10–11 of 40 before the fix)
        { const twice = []; for (let sd0 = 0; sd0 < 40; sd0++) { const h = mk(hub, sd, act, true, 99300 + sd0); h.flags[flag] = true; cook(h, hub); if (h.flags[`${flag}_next`] === 0) twice.push(sd0); }
          assert(twice.length === 0, `${T} (RV1, M1): ${hub}: an old save's repeat 0 never comes twice running (${twice.length} of 40)`); }
        // RV1 (L5, TG8): a repeat number out of range shows the first-time scene and gives its gains, alike
        { const h = mk(hub, sd, act); h.flags[flag] = true; h.flags[`${flag}_next`] = 0; choose(h, SCENES, ci(hub)); h.flags[`${flag}_v`] = 9; const vil = h.rel.Village.f;
          const tx = sceneView(h, SCENES).text; choose(h, SCENES, 0);
          assert(tx === F.text && h.rel.Village.f === vil + 3, `${T} (RV1, L5): ${hub}: a bad repeat number: the first scene and its gain together`); }
    }
}

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
console.log('fights', sorted(fights));
console.log('endings', sorted(endings), 'longest run', maxSteps, 'scenes', Object.keys(SCENES).length);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, fights, endings, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs; v0.11.22: `seen` for tools/leftovers.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
