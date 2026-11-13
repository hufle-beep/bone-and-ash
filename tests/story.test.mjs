// Run: node tests/story.test.mjs — story graph integrity + 1,000 random playthroughs (2,000 before v0.11.34) (no crash, no dead end, always reaches the end);
// Incremental Mode since v0.11.34 (D1: Story Mode dropped from the game)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, itemCap, yukiSitsOut, migrate, REL_HIDDEN, REL_MAX, serialize, deserialize, sleepUntil, startActCoil } from '../js/core/game.js'; // v0.11.166 (RV1, M2): startActCoil // v0.11.127 (LQ2, TG): yukiSitsOut, migrate; v0.11.137 (HV1): REL_HIDDEN, REL_MAX
import { sceneView, choose, goTo, wasPicked, threatOf } from '../js/core/story.js'; // v0.11.136 (RV2, TG): threatOf
import { actionOpen } from '../js/core/forms.js';
import { btTarget } from '../js/story/meridians.js';
import { loveLine, YK_QUESTION, ykAskAgain, YK_HERE } from '../js/story/yuki_path.js'; // v0.11.122 (RL1, T); v0.11.137 (TR1, YR; QA2)
import { YT_HUBS, YT_BODY, YT_CLOSE, YT_LABEL, YT_GAIN, ytPool } from '../js/story/yuki_time.js'; // v0.11.137 (TR1)
import { TASK_HUBS } from '../js/story/task_hubs.js'; // v0.11.137 (TR1, YB)
import { HT_HUBS, HT_BODY, HT_CLOSE, HT_LABEL, HT_GAIN, HT_MID, htPool, htSlot } from '../js/story/house_time.js'; // v0.11.139 (MW1)
import { likesMei, likesYa } from '../js/story/act1_common.js'; // v0.11.123 (EQ1, AB)
import { KEEP_FLAGS, rewind } from '../js/core/coil.js'; // v0.11.137 (HV1, Fable L2): rewind on an old save // v0.11.123 (ER1, T3)
import { againView, noteRead, MEMORY_LINES } from '../js/story/again.js'; // v0.11.167 (CA1): MEMORY_LINES // v0.11.125 (RW1, T); v0.11.133 (FP2): noteRead
import { STOMP } from '../js/story/power.js'; import { ASHFALL } from '../js/story/ashfall.js'; // v0.11.169 (P3A): ASHFALL // v0.11.126 (NQ1)
import { coilStamp, dayIndex, textDay, DAY_REPLIES, COIL_SETS, actCoil, noteDay, linesOf, pickLine } from '../js/core/lines.js'; // v0.11.166 (RW1): COIL_SETS, actCoil; // v0.11.135 (NT1, EV1); v0.11.136 (NC1): DAY_REPLIES
import { splitReply, splitLine, landReply, noteSaid } from '../js/core/replies.js'; // v0.11.136 (NC1); RV2 (TG): landReply, noteSaid
import { runTask, taskOutcome, cardCheck, taskCards, yukiSays as yukiSaysS } from '../js/core/tasks.js'; // v0.11.169 (CA1, YH): yukiSays // v0.11.136 (RV2, TG); v0.11.139 (MW1): taskCards
import { writeFileSync, readFileSync, readdirSync } from 'node:fs'; // v0.11.137 (HV1, T): the story files read for bumpRel
import { smartAction } from './lib/smartfight.mjs'; // v0.11.96 (BT1)
import { DAY21_BREAKFAST } from '../js/story/act1_return.js'; // v0.11.152 (E1, BK)
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
        if (!(typeof v.text === 'string' && v.text.length > 40)) assert(false, `text renders in ${g.scene}`); else pass++;
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
        if (!(typeof v.text === 'string' && v.text.length > 40)) assert(false, `text renders in ${g.scene}`); else pass++;
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
    for (const [id, settled] of [['talk_mei', /^You walk together a while without talking/], ['talk_ya', /^Ya is in a good mood/]]) {
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
        ["bl_camp:2", "A ring of white points, leaning outward. Ya approves of anything with points."],
        ["heart_camp:1", "She tells you the songs about the Old Tree her grandmother sang. Some of the words are your words, worn smooth by four hundred years of people who didn't know what they meant."],
        ["talk_ya:0", "She looks at you like you're a bone-elk and she's hungry."],
        ["talk_ya:3", "She bares her teeth at you and walks on ahead. She'll get over it. Probably."],
        ["supper:2", "Over the washing water her mother tells you, low and formal, which families owe the Sect what, which houses have lost a child to the road, and which neighbours would sell you for a sack of millet. She does not smile once. It is the most useful hour you have spent on this world."],
        ["wen_lesson:forest", "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, on your knee, has not once looked away from the forest."],
        ["bl_night_event:1", "You follow until the roots close. The lights go on into the tree, through a crack too small for a person, and the song goes with them."],
        ["talk_mei:1", "She tells you you're impossible. She's smiling while she says it."],
        ["herb_slopes:0", "Mei Lin concedes, with reluctance, that you have hands."],
        ["heart_spring:0", "Ya spends the whole time trying to drown you, then trying to get you to stop being so stiff, then, briefly, very effectively, not trying to do anything at all except sit closer."],
        ["heart_spring:1", "Mei Lin washes beside you and tells you, without looking, that you are a coward. She doesn't sound like she minds."],
        ["night_event:11", "Yuki accepts the praise as simple fact."],
        ["heart_spring:2", "You sit with your back to a warm wall and Yuki in your lap and listen to the water, and for half an hour nobody needs anything from you."],
        ["rr_hunt:1", "Ya sulks about the elk all afternoon."],
        ["bl_fireside:2", "What happens is that Ya steals your food and Mei Lin falls asleep on your shoulder. You call it a draw."],
        ["night_event:2", "A ribbed white roof. Dry, smug, asleep."],
        ["heart_camp:2", "She makes you sit on the very edge, then laughs when you hold on. Then she tells you, very seriously, how many days she followed you through the forest before she decided you were interesting. It was all of them."],
        ["heart_camp:3", "You play the first part again, just Wren's voice, just the planting. Yuki purrs against your chest the whole way through."],
        ["night_event:0", "Mapped: the lights flow toward the dead tree, like blood toward a heart that stopped."],
        ["bl_train:0", "She throws you twice. You throw her once. She's thrilled."],
        ["ah_forage:0", "Earthy. Magnificent. Your career peaks."],
        ["wild_forage:2", "The bees are still arguing about it."],
        ["wild_train:2:f", "Scratched."],
        ["workshop:0:f", "A few come out brittle. Fishhooks, all the same."],
        ["fo_palisade:0:f", "Half the stakes come out brittle. The hunters replace them with wood, without comment, which is worse than comment."],
        ["clinic:1:f", "You do what two hands can. The line was longer than that."],
        ["fo_drill:1:f", "Yuki wins. Decisively."],
        ["workshop:2:f", "It breaks on a root. The farmers bow to the two halves and say nothing. You would have preferred words."],
        ["bl_train:0:f", "She throws you four times. She's thrilled."],
        ["wild_forage:2:f", "Stung. A lot."],
        ["drill:1:f", "The twelve-year-old puts you on your back, then helps you up and apologises with great formality for the disrespect. That is somehow worse."],
        ["ah_forage:1", "She feeds you one off her palm without seeming to notice she did it."],
        ["rr_forage:1", "She corrects your knife-grip without looking up."],
        ["wild_hunt:2:f", "It pinches back."],
        ["wild_forage:1:f", "Leeches."],
        ["drill:0:f", "Two of them hit each other. The apologies are faultless."],
        ["fo_council:0:f", "You say it badly. They hear it anyway, and bow anyway, slightly less deeply."],
        ["fo_clinic:0:f", "Mostly. You'll check the split scalp again tonight."]
    ];
    // v0.11.169 (owner picks P3A, CA1): Ashfall's seven first-day texts above (supper:2 … drill:0:f) are Fable's rewrite of the old ones
    // the Results lines each reply sat with before NC1 (the game as of v0.11.135, the same state), so a gain dropped or changed on every day is caught
    const OLD_GAINS = {"bl_camp:2":[],"heart_camp:1":[],"talk_ya:0":[],"talk_ya:3":[],"supper:2":[],"wen_lesson:forest":[],"bl_night_event:1":[],"talk_mei:1":[],"herb_slopes:0":["+2 Ninefold spirit grass (trade goods)."],"heart_spring:0":["+6 HP."],"heart_spring:1":["+4 HP."],"night_event:11":["+1 Mire fowl (dressed).","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"heart_spring:2":[],"rr_hunt:1":["+2 root-hares (as hare)."],"bl_fireside:2":[],"night_event:2":[],"heart_camp:2":[],"heart_camp:3":[],"night_event:0":[],"bl_train:0":[],"ah_forage:0":["+2 ash-truffles (as jade bracket), and one eaten on the spot: +10 satiety."],"wild_forage:2":["+2 Wild honeycomb."],"wild_train:2:f":["−1 HP.","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"workshop:0:f":[],"fo_palisade:0:f":[],"clinic:1:f":[],"fo_drill:1:f":["−2 HP.","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"workshop:2:f":[],"bl_train:0:f":["−2 HP."],"wild_forage:2:f":["+1 Wild honeycomb, −3 HP."],"drill:1:f":["−2 HP.","Yuki Fight held at James's GU (T1 L1)","GU +1 XP, from what Yuki couldn't keep"],"ah_forage:1":["+6 cinderberries (as needleberries)."],"rr_forage:1":["+4 root-sorrel (counts as river cress)."],"wild_hunt:2:f":["−2 HP."],"wild_forage:1:f":["+2 River cress anyway."],"drill:0:f":[],"fo_council:0:f":[],"fo_clinic:0:f":[]};
    // RV2 (TG, Fable's review): the old first-day replies of the three lists that go by Yuki's form (the game as of v0.11.135)
    const OLD_FORMS = {"tiger":{"heart_camp:3":"You play the first part again, just Wren's voice, just the planting. Yuki purrs with her head on your chest the whole way through.","heart_spring:2":"You sit with your back to a warm wall and Yuki's head in your lap and listen to the water, and for half an hour nobody needs anything from you.","wen_lesson:forest":"You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, her chin on your knee, has not once looked away from the forest."},"human":{"heart_camp:3":"You play the first part again, just Wren's voice, just the planting. Yuki leans against your shoulder and purrs, very quietly, the whole way through.","heart_spring:2":"You sit with your back to a warm wall and Yuki's shoulder against yours and listen to the water, and for half an hour nobody needs anything from you.","wen_lesson:forest":"You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, beside you, has not once looked away from the forest."}};
    const ST6K = ['rr_forage:2', 'rr_forage:2:after', 'ah_forage:2', 'ah_forage:2:after', 'ah_hunt:1:part', 'ah_hunt:1:full']; // v0.11.154 (PS1, ST6): their own test (RP1 push 2's block)
    const SWK = ['wild_forage:0', 'wild_forage:1', 'wild_forage:3', 'wild_hunt:0', 'wild_hunt:1', 'wild_hunt:2', 'wild_train:0', 'wild_train:1', 'wild_train:2', 'wild_train:3']; // v0.11.168 (P2A, SW): their own test (P2A's block)
    const SRK = ['clinic:0', 'clinic:1', 'workshop:0', 'drill:0', 'drill:1']; // v0.11.169 (P3A, SR): their own test (P3A's block)
    const keys = Object.keys(DAY_REPLIES).filter((k) => !ST6K.includes(k) && !SWK.includes(k) && !SRK.includes(k));
    const first = (k) => COIL_SETS[k]?.[0] ?? DAY_REPLIES[k]; // v0.11.166 (RW1): a Coil's set for the lists by Coil
    assert(keys.length === 38 && keys.reduce((s, k) => s + first(k).length - 1, 0) === 63, `NC1: 38 reply lists with 52 new texts; v0.11.152 (RP1): 11 more (${keys.length}, ${keys.reduce((s, k) => s + first(k).length - 1, 0)})`);
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
        if (form === 'cat') assert(days[0].reply === old && days[0].gains === JSON.stringify(OLD_GAINS[key]), `NC1: ${key}: the first day's reply and its gains are the old ones (${days[0].reply} | ${days[0].gains})`);
        else if (OLD_FORMS[form][key]) assert(days[0].reply === OLD_FORMS[form][key], `NC1 (RV2, TG): ${key} (${form}): the first day's reply is the old one`);
        else assert(days[0].reply === old, `NC1 (RV2, TG): ${key} (${form}): one first-day reply in every form, the old one`);
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
        const OLD = { 'talk_ya:0': "She looks at you like you're a bone-elk and she's hungry.", 'talk_mei:1': "She tells you you're impossible. She's smiling while she says it." };
        const NEW1 = { 'talk_ya:0': 'She stops dead and watches your mouth, in case more falls out.', 'talk_mei:1': 'One eyebrow goes up. She asks whether that line works where you come from.' };
        const NEW2 = { 'talk_ya:0': 'Ya squints at you. "Is that the thing villages do?', 'talk_mei:1': 'She tells you, gravely, that a respectable woman would walk away.' };
        assert(JSON.stringify(Object.keys(COIL_SETS).sort()) === JSON.stringify(['talk_mei:1', 'talk_ya:0']), `RW1: the two flirts go by Coil, nothing else (${Object.keys(COIL_SETS)})`);
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
        assert(/white jacket with a red sash/.test(herb) && !/patched brown/.test(herb), 'CA1: Mei Lin wears her white jacket and red sash on the herb slope (rider 1)');
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
                const runs = [0, 1].map((d) => { const g = F(5790, form); g.scene = scene; g.inventory.jade_bracket = 3; onDay(g, d); const out = SCENES[scene].choices[i].do(g, { success: true, ratio: 1 }); const { lines, log, ...rest } = g; return { out, rel: JSON.stringify(g.rel), flags: JSON.stringify(Object.fromEntries(Object.entries(g.flags).filter(([f]) => !/^oo:|@/.test(f)))), inv: JSON.stringify(g.inventory) }; });
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
            g.minutes += 1440; const s3 = c.do(g)[0];
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
    // RV2 (M1, Fable's review): Ya names the ship on her ledge only once it has been found
    {
        const y = ensureBars(fresh(5304)); onDay(y, 1); const t0 = SCENES.heart_camp.choices[2].do(y)[0];
        y.flags.ship_found = true; const t1 = SCENES.heart_camp.choices[2].do(y)[0];
        assert(!/the ship/.test(t0) && /water somewhere under the roots/.test(t0) && /bark settling, the ship,/.test(t1), 'NC1 (RV2, M1): the ledge names the ship only after ship_found');
    }
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
        const cs = SCENES[hub].choices.filter((c) => !/^(wen|mother)_time$/.test(c.to)), last = cs[cs.length - 1]; // v0.11.139 (MW1): Wen's and the mother's cards follow hers
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
        assert(KEEP_FLAGS.includes('yk_wait'), 'TR1 (YR): "Not yet" is kept across Coils');
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
        choose(g, SCENES, sceneView(g, SCENES).choices.find((c) => c.label === 'Promise.').index);
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
        const cs = SCENES[hub].choices, tail = cs.slice(-3).map((c) => c.to);
        assert(JSON.stringify(tail) === '["yk_time","wen_time","mother_time"]', `MW1 (MS): ${hub} ends with Yuki's, Wen's and the mother's cards (${tail})`);
        for (const k of ['wen', 'mother']) {
            const c = cs.find((x) => x.to === `${k}_time`);
            assert(c.time === 10 && c.text === HT_LABEL[k] && c.show.dailyKey === `${k}_time` && (TASK_HUBS[hub].doors || []).includes(`${k}_time`), `MW1 (MS): ${hub}'s ${k} card: 10 min, its label, daily, a door`);
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
        assert(g.yuki.form === 'cat' && g.scene === 'rr_hub' && r.lines.includes(to === 'lover' ? YK_HERE.loverResult : YK_HERE.sisterResult) && (to !== 'lover' || g.flags.yk_kissed), `QA2 (RT1, M3): ${here}: back to the shape she had (the cat), her line, back (${g.yuki.form}, ${g.scene})`);
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
        for (const re of [/^Go out to the grove with Yuki/, /^Climb to the loft with Mei Lin\. The cat/, /^Follow Ya to the grove\. Yuki/, /^All of you/]) assert(ev.some((l) => re.test(l)) === human, `LG1 (YG): "${re.source}" ${human ? 'shows' : 'is hidden'} at Yuki's realm ${yr}`);
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
        assert(labels(p).some((l) => /^Kiss her, there on the path/.test(l)) === ok, `LG1 (S): the path kiss ${ok ? 'shows' : 'is hidden'} at Ya ${a}`);
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
        assert(pick(g, /^When Ya takes your hand/), 'LG1 (BC): the Ashen Hollow camp offers Ya\'s night when both like him');
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
        assert(!labels(y).some((l) => /^When Ya takes your hand/.test(l)), 'RL1 (T): the camp\'s Ya night is gone after "just Ya"');
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
        assert(pick(y, /^Kiss her, there on the path, since/) && !y.flags.ya_romance && !likesYa(y), `EB1 (KN): Ya's path kiss leaves her romance flag unset (${y.flags.ya_romance})`);
        for (const [a, ok] of [[29, false], [30, true]]) {
            const m = LG(54020 + a, {}, [a, 10], 0); m.minutes = 19 * 1440 + 600; goTo(m, SCENES, 'rt_mei_talk');
            assert(labels(m).some((l) => /^Kiss her, there on the path, before/.test(l)) === ok, `EQ1 (D2): Mei Lin's road kiss ${ok ? 'offered' : 'hidden'} at ${a}`);
        }
        const m = LG(54040, {}, [50, 10], 0); m.minutes = 19 * 1440 + 600; goTo(m, SCENES, 'rt_mei_talk');
        const a0 = m.rel['Mei Lin'].a, f0 = m.rel['Mei Lin'].f; pick(m, /^Kiss her, there on the path, before/);
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
        const yk0 = g.rel.Yuki.a; pick(g, /^Stop walking\. Kiss her/);
        assert(g.scene === 'rt_road' && g.rel.Yuki.a === yk0 + 6 && !labels(g).some((l) => /^Let the other two get ahead/.test(l)), `EQ1 (D4): the kiss +6, back on the road, once a day (${g.scene})`);
        const n = LG(54310 + yr, { yk_path: path }, [10, 10], yr); n.minutes = 19 * 1440 + 600; goTo(n, SCENES, 'rt_yk_talk');
        const n0 = n.rel.Yuki.a; pick(n, /^"The best spot/);
        assert(n.scene === 'rt_road' && n.rel.Yuki.a === n0 + 3, 'EQ1 (D4): the other answer +3, back on the road');
    }
    // TP: the old choices keep their positions; the new ones last
    const fs = SCENES.bl_fireside.choices, mt = SCENES.rt_mei_talk.choices, rr = SCENES.rt_road.choices;
    assert(fs[fs.length - 2].text === 'Sleep.' && fs[fs.length - 1].to === 'mei_raft' && fs.length === 8, 'EQ1 (TP): bl_fireside keeps choices 0–6, the raft night last');
    assert(mt.length === 4 && /^"Your father/.test(mt[2].text) && /^Kiss her, there on the path, before/.test(mt[3].text), 'EQ1 (TP): rt_mei_talk keeps choices 0–2, the kiss last');
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
        assert(/Ya kissed me/.test(sceneView(g, SCENES).text), 'ER1 (GF): the old save at Mei Lin 65 keeps "Ya kissed me"');
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
        const c = sceneView(g, SCENES).choices.find((x) => !x.disabled && /^Kiss her, there on the path, before/.test(x.label));
        const r = c && choose(g, SCENES, c.index);
        assert(!!c && r.lines.some((l) => /this time she says when/.test(l)), 'ER1 (T2, R5): the road kiss offered through her flag at 10, with the lover\'s line');
        const n = LG(55031, {}, [50, 10], 0); n.minutes = 19 * 1440 + 600; goTo(n, SCENES, 'rt_mei_talk');
        const nc = sceneView(n, SCENES).choices.find((x) => !x.disabled && /^Kiss her, there on the path, before/.test(x.label)); const nr = choose(n, SCENES, nc.index);
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
        assert(/opposite of the first time in the herb loft/.test(sceneView(loft, SCENES).text), 'ER1 (R1b): the loft clause after a loft-first romance');
        goTo(loft, SCENES, 'rt_mei_night');
        assert(/hundred years since the first time/.test(sceneView(loft, SCENES).text), 'ER1 (R1a): the loft-again opener after a loft-first romance');
        const none = LG(55042, { bl_region: 'ah' }, [80, 10], 0); goTo(none, SCENES, 'mei_bond');
        assert(/for the first time, and with nothing clever/.test(sceneView(none, SCENES).text), 'ER1 (R1b i): the embers with no first time yet');
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
    const JUDGE = { cat: /like a small white judge/, tiger: /like a large white verdict/, human: /like a small judge in a black dress\. "About time,"/ };
    const SEAT = { cat: /, and Yuki sits on the hearth-log, and the ship hums/, tiger: /, and Yuki lies round the foot of the chair like a white rug with opinions, and the ship hums/, human: /, and Yuki sits on the arm of the chair with her tail round your wrist, and the ship hums/ };
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
        if (path) assert(!/and Yuki (sits|lies)/.test(ft) && /in your lap, and the ship hums/.test(ft) && (ft.match(BEAT) || []).length === 1, `NF1 (FB): with her path the fallback drops its clause and the beat places her (${tag})`);
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
        assert(/^Mei Lin sits down next to you/.test(mt) && (mt.match(/\bYuki\b/g) || []).length === (path ? 1 : 0), `NF1: Mei Lin's branch names Yuki ${path ? 'once (the beat)' : 'never'} (${tag})`);
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
        assert(/^Mei Lin sits down next to you/.test(tt) && (tt.match(BEAT) || []).length === 1 && /sideways/.test(tt), 'NF1 (review): both liked, Ya not along: Mei Lin\'s branch and the great root-kin beat');
    }
    // Ya's branch (Ya liked, Mei Lin not): Yuki once with a path, never without
    for (const path of [null, 'sister']) {
        const g = LS(56450 + (path ? 1 : 0), path, 'cat', [10, 80], 0); goTo(g, SCENES, 'log_comfort');
        const tt = sceneView(g, SCENES).text;
        assert(/^Ya doesn't do comfort/.test(tt) && (tt.match(/\bYuki\b/g) || []).length === (path ? 1 : 0), `NF1 (review): Ya's branch names Yuki ${path ? 'once (the beat)' : 'never'}`);
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
        ['epilogue', {}, /ridge with Yuki on your shoulder/, /ridge with Yuki pacing at your side/, /ridge with Yuki at your elbow/],
        ['rt_road', {}, /Yuki rides on your shoulder and supervises\./, /Yuki pads at your side and supervises\./, /Yuki walks at your elbow and supervises\./],
        ['ya_meets', {}, /Yuki, on your shoulder, flattens her ears and allows it/, /Yuki, at your hip, flattens/, /Yuki, at your elbow, flattens/],
        ['village_morning', { vday: 2 }, /on the doorstep like a small white guard dog\./, /across the doorstep like a large white guard dog\./, /eyes shut, like a small white guard dog in a black dress\./],
        ['ya_mocks', {}, /Yuki, on your shoulder, sends a single thought/, /Yuki, at your side, sends/, /Yuki, at your elbow, sends/],
        ['rt_quiet_night', {}, /^You sleep by the stove with Yuki on your chest\. Through/, /^You sleep by the stove with Yuki's head on your chest\. Through/, /^You sleep by the stove, back to back with Yuki\. Through/],
        ['night', {}, /Yuki climbs into your lap, which she only does/, /Yuki lies down around you, which she only does/, /Yuki sits down against your side, which she only does/],
        ['rt_evening', {}, /four bowls and a saucer for the cat\./, /four bowls and, after a long look at Yuki, the stew pot\./, /four bowls and a fifth for Yuki, with the saucer beside it out of habit\./],
        ['rt_elder', {}, /Yuki, on your shoulder, goes very still\./, /Yuki, at your side, goes very still\./, /Yuki, at your elbow, goes very still\./],
        ['ship_bridge', {}, /Yuki gets into your lap without being asked\./, /Yuki lays her head in your lap without being asked\./, /Yuki sits on the arm of your seat without being asked\./],
        ['ht_leave', {}, /Yuki rides on your shoulder with her tail wrapped round your neck\./, /Yuki pads at your side with her tail hooked round your wrist\./, /Yuki walks at your shoulder with her tail wrapped round your wrist\./],
        ['bl_end', {}, /Yuki is on your shoulder, claws in\./, /Yuki is at your side, claws out\./, /Yuki is at your shoulder, claws out\./],
        ['hall_listen', {}, /Yuki puts her paw on the back of your hand\. Through the bond/, /Yuki rests her chin on the back of your hand\. Through the bond/, /Yuki puts her hand on the back of yours\. Through the bond/],
        ['bl_start', {}, /A biologist, a cat, a herb-woman/, /A biologist, a very large cat, a herb-woman/, /A biologist, a cat in a black dress, a herb-woman/],
        ['ah_hunt', {}, /"They'll go for the cat\."\n\nYuki, on your shoulder, flattens/, /"They won't go for the cat\. Not that cat\."\n\nYuki, at your side, flattens/, /"They'll go for the small one\."\n\nYuki, at your elbow, flattens/],
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
                if (id === 'elder' && prim === 5) assert(t.includes({ cat: 'at its size', tiger: 'untaught', human: 'at its age' }[form]), `FM1: the elder's "at its size" as ${form}`);
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
        ['cat', /Yuki's tail curls around your neck\. Through the bond/, /Yuki, on your chest, opens one gold eye\. \*Not dead/, /Yuki, on your chest, mutters: \*Disowned/, /Yuki, on your shoulder, opens one gold eye\. \*Not bad/, /Yuki, on your shoulder, purrs\. Just for a moment, in the dusk, it is a hand on the back of your neck/],
        ['tiger', /Yuki's tail curls around your wrist\. Through the bond/, /Yuki, her head on your chest, opens one gold eye\. \*Not dead/, /Yuki, head still on your chest, mutters: \*Disowned/, /Yuki, at your side, gives you one sidelong gold eye\. \*Not bad/, /Yuki, against your hip, purrs; you feel it in your teeth\./],
        ['human', /Yuki's tail curls around your wrist\. Through the bond/, /Yuki, beside you, opens one gold eye\. \*Not dead/, /Yuki, at your back, mutters: \*Disowned/, /Yuki, at your elbow, gives you one sidelong gold eye\. \*Not bad/, /Yuki, at your elbow, does not purr\. Just for a moment, in the dusk, her hand is in yours, and it stays a hand\./],
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
        ['rt_quiet_night', {}, null, /Toward dawn Yuki puts her nose against your chin\./, /Toward dawn Yuki's nose bumps your chin\./, /Toward dawn Yuki's elbow finds your ribs\. \*Stop thinking,\* says the bond\. \*I am trying to sleep\.\*/],
        ['epilogue', {}, null, /a fresh doctorate, a cat, an empty closet/, /a fresh doctorate, a cat the size of a tiger, an empty closet/, /a fresh doctorate, a cat who is currently a woman, an empty closet/],
        ['ya_fight_start', {}, null, /Yuki climbs down off your shoulder and sits at a safe distance/, /Yuki walks off a little way and lies down at a safe distance/, /Yuki steps back and sits on a root at a safe distance/],
        ['ah_hawks_won', {}, null, /riding your shoulder through the whole thing, claws in, spitting — leaps off and lands on it, and sits there/, /at your flank through the whole thing, claws out, snarling — puts one paw on it, and sits there/, /at your back through the whole thing, claws out, spitting — puts her foot on it, and stands there/],
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
        ['fo_last_night', {}, null, /The north wind moves in the thatch\. Yuki curls into the hollow of your neck, and through the bond/, /Yuki lies down along the length of you and fits her chin into the hollow of your neck, which is all of her that fits, and through the bond/, /Yuki lies down at your back, her tail across your shins, and through the bond/],
        ['tribute_dawn_sleep', {}, null, /^You sleep by the stove with a cat on your chest and the sound/, /^You sleep by the stove with a cat's head on your chest, which is all of her that fits, and the sound/, /^You sleep by the stove, back to back with Yuki, with the sound/],
        ['tribute_dawn_talk', {}, null, /Yuki climbs into the gap between you as if she'd been invited\./, /Yuki lies down across both your feet as if she'd been invited\./, /Yuki sits down on your other side and takes the other shoulder, as if she'd been invited\./],
        ['mei_lin', {}, null, /Yuki, from your shoulder, offers Mei Lin one slow blink\./, /Yuki, from your side, offers Mei Lin one slow blink\./, /Yuki, at your elbow, offers Mei Lin one slow blink\./],
        ['gao_talked', {}, null, /with a cat on his shoulder and the bored tone/, /with a cat the size of a tiger at his side and the bored tone/, /with a cat-eared woman in a black dress at his elbow and the bored tone/],
        ['friends_watch', {}, null, /the three of you and the cat, and keep the watch/, /the three of you and the cat, and keep the watch/, /on the ridge, all four of you, and keep the watch/],
        ['rt_grove', {}, null, /Yuki walks into the middle of the ring, lies down, and purrs/, /Yuki walks into the middle of the ring, lies down, and purrs/, /Yuki walks into the middle of the ring, sits down in her black dress, and purrs/],
        ['roots_fall', {}, null, /Yuki climbs down after you, perfectly, and sits on your chest, and looks at you\./, /perfectly, all four hundred pounds of her, and puts one paw on your chest, and looks at you\./, /perfectly, in a dress, and stands over you, and looks at you\./],
        ['fo_spy_lost', {}, null, /Yuki sits on your chest\. \*He folded his mat,\* the bond observes/, /Yuki rests one paw on your chest\. \*He folded his mat,\* the bond observes/, /Yuki sits down beside you\. "He folded his mat," she observes\. "While you were bleeding\."/],
        ['rt_serpent_lost', {}, null, /with Yuki standing on your chest, soaked/, /with Yuki standing over you, soaked/, /with Yuki kneeling on your chest, soaked/],
        ['night_event', { night_ev: 'gift' }, null, /Yuki is sitting on you, very upright[\s\S]*nearly as big as she is[\s\S]*Through the bond: \*you hunt like a tree/, /The weight is one of Yuki's paws\.[\s\S]*about one mouthful to her[\s\S]*Through the bond: \*you hunt like a tree/, /Yuki is kneeling beside you[\s\S]*neck neatly wrung[\s\S]*"You hunt like a tree," she says\./],
        ['jackals_fled', {}, null, /Yuki — perched on your shoulder, dry, smug —/, /Yuki — stretched out on the one rock in midstream, dry, smug —/, /Yuki — standing on the one rock in midstream with her hem held up, dry, smug —/],
        ['lf_notes', {}, null, /adds her own entry with one claw: a single scratch, which you decide/, /adds her own entry with one claw: a single scratch, through that page and the next six, which you decide/, /takes the notebook and adds her own entry: a single stroke, which you decide/],
        ['lf_human_lost', {}, null, /Yuki sits on your chest until you get up\. Through the bond: \*we are coming back/, /Yuki keeps one paw on your chest until you get up\. Through the bond: \*we are coming back/, /Yuki sits beside you until you get up\. "We are coming back here," she says\./],
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
        ['fo_drill', /^Spar with Yuki in front of them/, {}, /Afterwards Old Hu bows to the cat\./, /Afterwards Old Hu bows to the cat\./, /Afterwards Old Hu bows to Yuki\. Only to Yuki\./],
        ['heart_spring', /^Sit by the water/, {}, /a warm wall and Yuki in your lap and listen/, /a warm wall and Yuki's head in your lap and listen/, /a warm wall and Yuki's shoulder against yours and listen/],
        ['heart_camp', /^Sit up with Yuki and the hearth-log/, {}, /Yuki purrs against your chest the whole way through\./, /Yuki purrs with her head on your chest the whole way through\./, /Yuki leans against your shoulder and purrs, very quietly, the whole way through\./],
        ['wen_lesson', /^Listen\. Ask\./, { lore_realms: true }, /exactly right\. Yuki, on your knee, has not once/, /exactly right\. Yuki, her chin on your knee, has not once/, /exactly right\. Yuki, beside you, has not once/], // v0.11.169 (P3A): Fable's rewrite
        ['rt_ford', /^Cross carefully, stone by stone/, {}, /On the far bank Yuki shakes a wet paw at the river, formally/, /On the far bank Yuki shakes a wet paw at the river, formally/, /On the far bank Yuki wrings out the hem of her dress at the river, formally/],
    ];
    for (const [id, label, flags, ...want] of RES) {
        const c = SCENES[id]?.choices?.find((x) => label.test(typeof x.text === 'function' ? '' : x.text));
        assert(!!c && typeof c.do === 'function', `NQ1: ${id}'s choice exists`);
        if (!c) continue;
        ['cat', 'tiger', 'human'].forEach((form, i) => {
            const g = FM(59400 + n++, form, flags); g.scene = id;
            const t = (c.do(g) || []).filter((x) => typeof x === 'string').join('\n');
            const same = want.filter((re) => re.source === want[i].source).length; // NR1 (T): its own line and no other form's
            assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `NQ1: ${id}'s result as ${form} (${t.slice(0, 70)}…)`);
        });
    }
    // the Tans' crushing win (lf_bandits, degree 3)
    const TANS = [['cat', /eating their jerky, with Yuki in your lap\./], ['tiger', /eating their jerky, with Yuki's head in your lap\./], ['human', /eating their jerky, with Yuki beside you, eating the rest\./]];
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
        ['fo_council', {}, null, /"Your cat," Old Wen says, "faces north/, /"Your cat," Old Wen says, "faces north/, /"Your companion," Old Wen says, "faces north/],
        ['night_event', { night_ev: 'rats' }, null, /They've smelled the cat\. They seem to think she's dinner\. Yuki seems/, /They seem to think she's dinner, which means they haven't seen her yet\. Yuki seems/, /They've smelled a cat and found a woman\. They seem to think she's dinner either way\. Yuki seems/],
        ['night_event', { night_ev: 'rain' }, null, /Yuki makes it clear, through the bond and through her claws, that/, /Yuki makes it clear, through the bond and by shaking herself dry all over you, that/, /Yuki makes it clear, aloud and at some length, from under your lab coat, that/],
        ['gao_fight_start', {}, null, /you are alone, unarmed, and wearing a lab coat\. He has looked at you with his Qi-sense and felt nothing at all: a mortal\./, /you are unarmed, wearing a lab coat, and alone but for a cat\. He has looked at you both[\s\S]*a mortal's very large cat\./, /you are unarmed, wearing a lab coat, and alone but for a slight woman in a black dress\./], // v0.11.130 (YB1, GA): the human's own
        ['herb_girl', {}, null, /slide off a fence post\. You, apparently/, /slide off a fence post, and off Yuki the way they'd slide off a second, larger fence post\./, /off Yuki the way they'd slide off a second, shorter fence post: they catch on the ears/], // v0.11.130 (YB1, HG): the human's own
        ['gao_lost', {}, null, /Eleven pounds of white cat land on his face, all claws, and while he's screaming and spinning, Mei Lin/, /Four hundred pounds of white cat take him off your neck and a fair way across the herb bed, and while he's screaming and rolling, Mei Lin/, /Yuki lands on his back in a black dress, all nails, and while he's screaming and spinning, Mei Lin/], // NS1 (GL)
        ['jackals_lost', {}, null, /Yuki — all eleven pounds of her —[\s\S]*and covered in cat\./, /Yuki — all four hundred pounds of her —[\s\S]*underneath a good deal of cat\./, /Yuki — all of her, in a dress —[\s\S]*with your head in Yuki's lap\./],
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
        ['tiger', /"Your great beast has been staring toward it/, /With a —" He looks at Yuki properly for the first time\. He has practised this\. "\*Cat\*\." Little Tan/],
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
        ['fo_drill', 1, {}, { cat: /bows to the cat\./, tiger: /bows to the cat\./, human: /bows to Yuki\. Only to Yuki\./ }],
        ['heart_spring', 2, {}, { cat: /Yuki in your lap/, tiger: /Yuki's head in your lap/, human: /Yuki's shoulder against yours/ }],
        ['heart_camp', 3, {}, { cat: /purrs against your chest/, tiger: /purrs with her head on your chest/, human: /leans against your shoulder and purrs/ }],
        ['wen_lesson', 0, { lore_realms: true }, { cat: /Yuki, on your knee,/, tiger: /Yuki, her chin on your knee,/, human: /Yuki, beside you,/ }],
    ]) for (const form of ['cat', 'tiger', 'human']) {
        const g = FM(60600 + n++, form, flags); g.inventory.hearth_log = 1; g.james.gu = { tier: 10, level: 10, xp: 0 }; ensureBars(g);
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
    for (const [form, re] of [['cat', /^Up the fallen trunk with Yuki and wait them out\.$/], ['tiger', /^Up the fallen trunk behind Yuki and wait them out\.$/], ['human', /^Up the fallen trunk with Yuki and wait them out\.$/]]) {
        const g = FM(60700 + n++, form, { night_ev: 'rats' }); goTo(g, SCENES, 'night_event'); g.flags.night_ev = 'rats';
        const c = sceneView(g, SCENES).choices.find((x) => /^Up the fallen trunk/.test(x.label));
        assert(!!c && re.test(c.label) && SCENES.night_event.choices[c.index] && /fallen trunk/.test(SCENES.night_event.choices[c.index].text(g)), `NS1 (TR): the trunk choice as ${form} (${c?.label})`);
    }
    // T: the positions of the touched choices (saves keep picks by position)
    for (const [id, idx, re] of [['fo_drill', 1, /^Spar with Yuki/], ['heart_spring', 2, /^Sit by the water/], ['heart_camp', 3, /^Sit up with Yuki/], ['wen_lesson', 0, /^Listen\. Ask/], ['rt_ford', 0, /^Cross carefully/]]) {
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
        ['yk_night_solo', {}, undefined, /the white cat goes with you[\s\S]*is a cat again before you can answer/, /the great white cat goes with you[\s\S]*is four hundred pounds of cat again before you can answer/, /Yuki goes with you, on two feet, down the middle of the lane[\s\S]*is asleep again before you can answer/],
        ['yk_camp', {}, [90, 10], /a white cat pads after you[\s\S]*Yuki falls into step[\s\S]*the white cat on your shoulder[\s\S]*human, and very deliberately so/, /a white cat pads after you[\s\S]*Yuki falls into step[\s\S]*the great white cat stretched out along the far side of the fire[\s\S]*human, and very deliberately so/, /so does Yuki\. She falls into step[\s\S]*eating breakfast with perfect composure[\s\S]*who has plainly chosen her moment/],
    ];
    for (const [id, flags, rel, ...want] of LPT) ['cat', 'tiger', 'human'].forEach((form, i) => {
        const g = LPG(61100 + n++, form, flags, rel); goTo(g, SCENES, id);
        const t = sceneView(g, SCENES).text;
        const same = want.filter((re) => re.source === want[i].source).length;
        assert(want[i].test(t) && want.filter((re) => re.test(t)).length === same, `LP1: ${id} as ${form} (${t.slice(0, 70)}…)`);
    });
    for (const [id, cat, tiger] of [['gao_fled', /backs away with his lackey\. "The Crimson Lotus/, /He keeps his eyes on Yuki the whole way down[\s\S]*yawns at him/], ['boar_lost', /^You end up up a tree\. The boar ends up bored\. You both agree/, /Yuki ends up on the far side of the hollow with a mouthful of ironhide bristle[\s\S]*\*I have standards\.\*/]]) {
        for (const form of ['cat', 'tiger', 'human']) for (const path of [null, 'sister', 'lover']) {
            const g = FM(61200 + n++, form, path ? { yk_path: path } : {}); g.scene = id;
            const t = sceneView(g, SCENES).text;
            const want = form === 'tiger' ? tiger : cat, other = form === 'tiger' ? cat : tiger;
            assert(want.test(t) && !other.test(t), `LP1 (FL): ${id} as ${form} (${path || 'no path'})`);
        }
    }
    // the labels: by her form, at their old places (saves keep picks by position)
    const lbl = (sc, to) => { const i = SCENES[sc].choices.findIndex((c) => c.to === to); return [i, SCENES[sc].choices[i]]; };
    for (const [sc, to, idx, cat, human] of [['bl_camp', 'yk_camp', 4, 'Walk out past the firelight. The cat follows.', 'Walk out past the firelight. Yuki follows.'], ['rt_road', 'rt_yk_talk', 3, 'Let the other two get ahead, and walk a stretch with the cat.', 'Let the other two get ahead, and wait for Yuki to drop back.']]) {
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
        [/^Stop walking\. Kiss her/, /Then there's a cat on your shoulder, washing a paw/, /Then there are four hundred pounds of cat on the path beside you/, /Then she walks on, hands clasped behind her back, innocent of everything\./], // LQ2 (TS): the great root-kin's own
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
        for (const [form, label] of [['cat', 'Let the other two get ahead, and walk a stretch with the cat.'], ['tiger', 'Let the other two get ahead, and walk a stretch with the cat.'], ['human', 'Let the other two get ahead, and wait for Yuki to drop back.']]) {
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
        if (c) for (const form of ['cat', 'tiger', 'human']) assert(c.text(LPG(61900 + n++, form)) === (form === 'human' ? 'Climb to the loft with Mei Lin. Yuki is already up there.' : 'Climb to the loft with Mei Lin. The cat is already up there.'), `LQ2 (HL): the loft label as ${form}`);
    }
    // v0.11.128 (owner pick OF2; Fable's MAINs): the camp's lap, Mei Lin's confession, the last nights' openings and dawns, the roof label, Ya's fence
    const OF = [
        // [scene, flags, rel, the cat's, the great root-kin's, the human's]
        ['rt_camp', {}, [80, 80], /Yuki in the warmest lap available, which tonight is Mei Lin's, and Ya keeps/, /Yuki laid behind you all like a white wall, her head in the warmest lap available, which tonight is Mei Lin's, and Ya keeps/, /Yuki leaning on the warmest shoulder available, which tonight is Mei Lin's, and Ya keeps/], // WL
        ['rt_camp', {}, [0, 80], /Yuki in the warmest lap available, which tonight is Ya's, to everyone's surprise/, /a white wall, her head in the warmest lap available, which tonight is Ya's, to everyone's surprise/, /Yuki leaning on the warmest shoulder available, which tonight is Ya's, to everyone's surprise/],
        ['rt_camp', {}, [80, 0], /Yuki in the warmest lap available, which tonight is Mei Lin's\./, /a white wall, her head in the warmest lap available, which tonight is Mei Lin's\./, /Yuki leaning on the warmest shoulder available, which tonight is Mei Lin's\./],
        ['mei_curious', {}, [80, 80], /Yuki, from your lap, sends one very clear thought/, /Yuki, a white hill at your back, sends one very clear thought/, /Yuki, across the fire and apparently asleep, sends one very clear thought/], // CL
        ['yk_night_solo', {}, undefined, /Toward dawn she is on your chest in her small shape[\s\S]*is a cat again before you can answer\./, /Toward dawn she is round you in her great shape[\s\S]*is four hundred pounds of cat again before you can answer\./, /Toward dawn she is asleep on your chest, as she has been for forty years[\s\S]*is asleep again before you can answer\./], // SD
        ['yk_night_fo', { fo_pick: 'yk' }, undefined, /a village that put down a saucer of fish scraps for her at supper\./, /a village that set the stew pot down for her at supper, with great ceremony and from a distance\./, /a village that set a bowl for her at supper and then, after grave consideration, a saucer of fish scraps beside it\./], // FD
        ['yk_night_mei', {}, undefined, /^Mei Lin climbs the ladder to the loft ahead of you, and a white cat climbs it ahead of her/, /^Mei Lin climbs the ladder to the loft ahead of you, past two rungs that four hundred pounds of cat cracked/, /^Mei Lin climbs the ladder to the loft ahead of you, and the lamp at the top is already lit/], // MO
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
        ['rt_fire_talk', {}, [80, 80], /merely sad\.\n\nMei Lin's is/, /merely sad\.\n\nMei Lin's is/, /according to Ya and Mei Lin, not bad at all, merely sad\. Yuki, in her turn, says she has never done anything wrong in her life, and looks at each of you until the subject closes\.\n\nMei Lin's is/], // FT
        ['rt_fire_talk', {}, [0, 0], /people you'll never know about\.\n\nWhen the fire/, /people you'll never know about\.\n\nWhen the fire/, /people you'll never know about\. Yuki says only that she slept through the blast, which is true, and that she has not forgiven the chamber, which is also true\.\n\nWhen the fire/],
        ['heart_view', {}, [0, 0], /The three of you lie down close, for warmth, for courage\. Yuki takes the exact centre\./, /The three of you lie down close, for warmth, for courage\. Yuki lies down round all of you, and regards that as the exact centre\./, /The four of you lie down close, for warmth, for courage\. Yuki takes the exact centre\./], // HV
        ['bl_fireside', { bl_region: 'ah' }, [0, 0], /The three of you sit in a loose ring, the way people sit/, /The three of you sit in a loose ring, the way people sit/, /The four of you sit in a loose ring, the way people sit/], // BF
        ['rt_mother', {}, [0, 0], /She looks at you\. She looks at Ya for a very long time\.[\s\S]*"Wash\. All three of you\./, /She looks at you\. She looks at Ya for a very long time\.[\s\S]*"Wash\. All three of you\./, /She looks at you\. She looks at Yuki, ears and all, and lets that wait\. She looks at Ya for a very long time\.[\s\S]*"Wash\. All four of you\./], // MO
        ['lf_exit', { yk_path: 'sister' }, undefined, /then turns into a cat on your shoulder at the treeline\. \*If the first woman/, /in her great shape, her shoulder at your hip, and takes most of the path\. At the treeline she stops and looks the world over\. \*If the first woman/, /on two bare feet, and at the treeline does not turn into anything\. "If the first woman we meet is pretty," she says, "I am telling her about the lab coat\. All of it\."$/], // LX
        ['lf_exit', { yk_path: 'lover' }, undefined, /Then she's a cat on your shoulder again, tail curled round your neck/, /with your hand on her great white shoulder[\s\S]*all four hundred pounds, purring like she owns you\. Which, you reflect, is fair\.$/, /Then she goes on holding it, out into the open, tail curled round your wrist, as if she owns you\. Which, you reflect, is fair\.$/],
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
            ['rt_mother', {}, [0, 0], `"Your father," she says at last, "was exactly the same." She steps aside from the door. "Wash. All three of you. You smell like the forest died on you."`],
            ['lf_exit', { yk_path: 'sister' }, undefined, `Yuki walks the first mile beside you in her human shape, then turns into a cat on your shoulder at the treeline. *If the first woman we meet is pretty,* says the bond, *I am telling her about the lab coat. All of it.*`],
            ['lf_exit', { yk_path: 'lover' }, undefined, `Yuki holds your hand to the treeline. Then she's a cat on your shoulder again, tail curled round your neck, purring like she owns you. Which, you reflect, is fair.`],
            ['heart_view', {}, [0, 0], `The three of you lie down close, for warmth, for courage. Yuki takes the exact centre.`],
        ];
        for (const [id, flags, rel, line] of PIN) { const g = LPG(63400 + n++, 'cat', flags, rel); goTo(g, SCENES, id); assert(sceneView(g, SCENES).text.includes(line), `CB1 (T): ${id}: the cat's line word for word`); }
    }
    {   // T (Fable's review): the cat's other changed lines pinned; the sister's path and no path read the same; the label on screen and picked at 1; the great root-kin's yk_night_all
        const PIN2 = [
            ['bl_fireside', { bl_region: 'ah' }, [0, 0], `The three of you sit in a loose ring, the way people sit when they've been through things together and don't yet have a word for what that makes them.`],
            ['rt_fire_talk', {}, [80, 80], `Yours involves a grant committee and is, according to both women, not bad at all, merely sad.\n\nMei Lin's is that she laughed at Gao Feng.`],
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
        ['bl_fireside', { bl_region: 'dw' }, [80, 80], /Later, settling down, the three of you end up closer than strictly necessary/, /Later, settling down, the three of you end up closer than strictly necessary/, /Later, settling down, the four of you end up closer than strictly necessary/], // BF2
        ['rt_fire_talk', {}, [80, 80], /according to both women, not bad at all, merely sad\.\n/, /according to both women, not bad at all, merely sad\.\n/, /according to Ya and Mei Lin, not bad at all, merely sad\. Yuki, in her turn/], // FW
        ['heart_view', {}, [0, 0], /\n\*Tomorrow,\* says Yuki, and for once she doesn't sound sarcastic at all\.$/, /\n\*Tomorrow,\* says Yuki, and for once she doesn't sound sarcastic at all\.$/, /\n"Tomorrow," says Yuki, and for once she doesn't sound sarcastic at all\.$/], // TM
        ['heart_view', { ya_romance: true }, [0, 80], /Mei Lin lies down on Yuki's other side, close, and says goodnight/, /Mei Lin lies down against Yuki's great white flank, close, and says goodnight/, /Mei Lin lies down on Yuki's other side, close, and says goodnight/], // HG
        ['lf_exit', { yk_path: undefined }, undefined, /Yuki's opinion, through the bond: \*both\.\*$/, /Yuki's opinion, through the bond: \*both\.\*$/, /Yuki's opinion, delivered aloud: "Both\."$/], // LB (no path: nothing follows)
        ['lf_exit', { yk_path: 'sister' }, undefined, /Yuki's opinion, through the bond: \*both\.\*\n\n/, /Yuki's opinion, through the bond: \*both\.\*\n\n/, /Yuki's opinion, delivered aloud: "Both\."\n\nYuki walks the first mile beside you on two bare feet/],
        ['rt_arrive', {}, [0, 0], /\n\nTheir eyes go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first: four hundred pounds of white cat[\s\S]*Then they go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first — the white hair, the ears, the tail — and move on, gravely, as from a matter that belongs to the outlander and is therefore not to be looked at twice\. Then they go to Ya and stay there\. Bare arms/], // RA; v0.11.130 (YB1, RA): the great root-kin's own
        ['heart_camp', { trio: 3 }, [80, 80], /The three of you sleep in a heap by the fire now\./, /The three of you sleep in a heap by the fire now\./, /The four of you sleep in a heap by the fire now\./], // HC
        ['log_comfort', { trio: 3 }, [80, 80], /You fall asleep there, the three of you, in the bridge of a dead ship/, /You fall asleep there, the three of you, in the bridge of a dead ship/, /You fall asleep there, all four of you, in the bridge of a dead ship/],
        ['mei_lin', { yk_path: 'sister' }, undefined, /\n\n\*She's pretty,\* says the bond, appallingly loud inside your skull\./, /\n\n\*She's pretty,\* says the bond, appallingly loud inside your skull\./, /blinks back\.\n\nMei Lin's eyes go to the ears, then to the tail, then back to the ears\.[\s\S]*"Are those real\?" asks Mei Lin\.[\s\S]*\n\n\*She's pretty,\* says the bond instead, for you alone, appallingly loud inside your skull, from a woman standing at your elbow/], // ML
        ['mei_lin', { yk_path: 'lover' }, undefined, /\n\n\*She's pretty,\* says the bond, appraising, unbothered\. \*I approve/, /\n\n\*She's pretty,\* says the bond, appraising, unbothered\. \*I approve/, /"Are those real\?" asks Mei Lin\.[\s\S]*\*She's pretty,\* says the bond instead, for you alone, appraising, unbothered, while its owner stands at your elbow and looks at the hills\./],
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
            assert(r.lines[0] === 'Ya laughs. Mei Lin, after a moment, does too. It sounds like something breaking open.' + (form === 'human' ? ' Yuki does not laugh. She was right here too.' : ''), `CS1 (FW): the joke's result as ${form}`);
        }
        const g = LPG(64200 + n++, 'human', { yk_path: undefined }); goTo(g, SCENES, 'mei_lin');
        assert(!/Are those real|She's pretty/.test(sceneView(g, SCENES).text), 'CS1 (ML): no path, no beat as the human');
        for (const path of ['sister', 'lover']) { const h = LPG(64300 + n++, 'human', { yk_path: path }); goTo(h, SCENES, 'romance'); assert(/Through the bond, (?:from somewhere very far away|sleepy and amused from the stove)/.test(sceneView(h, SCENES).text), `CS1 (ML): the ${path}'s romance beat stays the bond's, from a distance`); }
    }
    // v0.11.130 (owner pick YB1; Fable's MAINs): LL the 19 lose / flee / fail scenes place the great root-kin; the cat's and the
    // human's texts unchanged (the tiger's text less its line is the cat's, word for word); roots_lost's no-Ya clause by form
    const YB = [
        // [scene, flags, the great root-kin's line, [her clause, the cat's clause] where the text also swaps one]
        ["ah_hawks_lost", {}, "\n\nYuki sits upwind with a hawk's tail feathers in her teeth and a scorched stripe down one flank. *Mine is also holy,* says the bond. *Nobody is reviewing mine.*"],
        ["ape_lost", {}, "\n\nYuki lies along your other side with one foreleg held off the ground. The ape threw her before it hit you, and she came back on three legs, in time to see it go. She is purring, low, the purr that isn't for pleasure."],
        ["arson_lost", {}, " Yuki has one of them flat in the lane under both forepaws, and it is the wrong one: the torch was in the other man's hand. She keeps him all the same, and when the street has finished with the fire it finds it still has somebody to be grave at.", null, [" Yuki has one of them pinned in the lane with her knee between his shoulders, and it is the wrong one: the other man had the torch. She keeps him all the same, so that when the street has finished with the fire there is still somebody left for it to be grave at.", '']], // v0.11.169 (P3A, YF): and the woman's line // v0.11.131 (XB2, AP): she keeps him
        ["bl_night_lost", {}, " Yuki, who had hold of it until it had hold of her ear, lies across your feet with the ear at half-mast. *Three voices,* says the bond. *I am also telling you off. I am just doing it quietly.*"],
        ["collectors_lost", {}, "\n\nThen he flicks two fingers, and the net comes off Yuki: a spirit-beast net, thrown from his sleeve in the first breath of the fight, before he so much as drew. She has been under it since your knees went. She walks over on legs that aren't quite steady and stands across you. Nobody asks her to move."],
        ["dw_serpent_lost", { fly: true }, "\n\nYuki surfaces a moment later with a length of serpent in her mouth that is no longer attached to anything, climbs out, and shakes four hundred pounds of swamp over all three of you. *It let go,* says the bond. *Eventually. You're welcome.*"],
        ["far_lost", {}, " Yuki comes in behind you on three good legs and lies down across the doorway. Mei Lin steps over her without breaking off, comes back with the salve, and starts on the cat. The lecture now covers you both.", null, [" Yuki comes in behind you holding one arm with the other, and sits on the doorstep without a word. Mei Lin does not break off. She fetches the salve, turns the arm to the light, and starts on it. The lecture now covers you both.", '']], // v0.11.169 (P3A, YF): and the woman's line
        ["fo_spy_fled", {}, "\n\nYuki's portrait has the whole facing page, and its margin says only *large*, underlined twice. She watches the mountain until he is off the last switchback. *Uphill,* says the bond. *No.*"],
        ["fo_wolf_lost", {}, " Yuki comes out of the barley the other way a moment later, with grey fur in her teeth and no goat: she went after the one that came at her, the lame one, while the other went round. Wolves do that."],
        ["mire_lost", { fly: true }, " Yuki rises beside you, black to the shoulder, having learnt that the mire holds four hundred pounds a great deal better than it holds eleven, and lets go of them a great deal more slowly. *We do not speak of this,* says the bond."], // v0.11.131 (XB2, FY): for a flier
        ["night_fled", {}, " Yuki walks behind with the blanket in her mouth, which keeps her from saying what she thinks of running from something she outweighs. The bond says it anyway."],
        ["ring_lost", {}, " Yuki is already out: she backed the whole length of the gallery ahead of you, because the rings were grown for gardeners and there is nowhere in them to turn four hundred pounds of cat round. She sits down and starts on the splinters in her forepaw."],
        ['roots_lost', {}, " The collar is in Yuki's teeth. She climbs the shaft backwards with you swinging under her chin like a kitten, and when she sets you down at the top there are husk-lines raked down both her flanks, which neither of you mentions."],
        ["rr_bridge_fail", {}, " Yuki goes with her, low and silent, which is how you learn the two of them have been waiting for the bridge to fail."],
        ["rr_elk_lost", {}, " The elk put Yuki through a thornbrake first, which is how it got to you. She comes out of it backwards, bristling, and sits down beside Mei Lin to wait her turn."],
        ["rt_brawl_lost", {}, "\n\nFrom the wine-shop bench, most of which she is, Yuki yawns to the back teeth. *Fists only,* says the bond. *Your rule. I kept it for you.*"],
        ["rt_duel_lost", {}, "\n\nOne hand was for you. The other, you gather, was for Yuki, who lies ten paces up the road, a long white shape getting its legs under it one at a time."],
        ["rt_parley_fail", {}, " The two on Yuki's side stop a spear's length further off than the others. She watches them do it without getting up."],
        ["wyrm_lost", { fly: true }, " Yuki lets go of the wyrm's neck when she is ready and comes down the forty metres at a walk, on nothing. She stops a hand's width above the water. Cats, it turns out, don't have to swim. This one looks at the three of you who did."], // v0.11.131 (XB2, FY): for a flier
        ['roots_lost', { ya_party: false }, " The collar is in Yuki's teeth. She climbs the shaft backwards with you swinging under her chin like a kitten, and when she sets you down at the top there are husk-lines raked down both her flanks, which neither of you mentions.", ['Mei Lin calling the handholds down from the lip of the shaft in a voice that is very nearly steady', 'Mei Lin and Yuki between them, which should not be physically possible'], ['Yuki in a black dress that has not picked up so much as one husk, ', '']], // v0.11.131 (XB2, RH): the human's own clause
        ['ring_lost', { ya_party: false }, " Yuki is already out: she backed the whole length of the gallery ahead of you, because the rings were grown for gardeners and there is nowhere in them to turn four hundred pounds of cat round. She sits down and starts on the splinters in her forepaw."],
    ];
    for (const [id, { fly, ...flags }, line, swap, hswap] of YB) {
        // v0.11.131 (XB2, FY): a flight row compares her with the cat at Foundation (who flies too: realm 1), as she always flies
        const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => { const g = FM(65000 + n++, form, flags); if (fly && form === 'cat') { g.yuki.realm = 1; g.james.realm = 1; } goTo(g, SCENES, id); return sceneView(g, SCENES).text; });
        assert(tiger.includes(line) && !cat.includes(line) && !human.includes(line), `YB1 (LL): ${id} ${JSON.stringify(flags)}: the great root-kin's line, hers alone`);
        assert((swap ? tiger.replace(swap[0], swap[1]) : tiger).replace(line, '') === cat && (hswap ? human.replace(hswap[0], hswap[1]) : human) === cat, `YB1 (LL): ${id} ${JSON.stringify(flags)}: the cat's and the human's texts unchanged`);
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
        ['rt_arrive', {}, /\n\nTheir eyes go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first: four hundred pounds of white cat, pacing at your heel like a dog that has never heard of dogs\. Ashfall has seen the outlander's beast before\. It has not got smaller\. They look, gravely, once, as at a matter that belongs to the outlander and is therefore not to be remarked on\. Then they go to Ya and stay there\. Bare arms/, /\n\nTheir eyes go to Yuki first — the white hair, the ears, the tail — and move on/],
        ['bluff_fail', {}, /announce himself\. You have dishonoured yourself[\s\S]*"The second is the one that matters\."$/, /announce himself\. Nor is a great beast at a man's heel a senior's Qi\. It is a treasure, and treasures are carried by servants\. You have dishonoured yourself[\s\S]*"The second is the one that matters\."\n\n\*Servant,\* says the bond, as four hundred pounds of treasure gets to its feet beside you\. \*He's half right\. You do carry things\.\*$/, /announce himself\. You have dishonoured yourself[\s\S]*"The second is the one that matters\."$/],
        ['gao_fight_start', {}, /^Gao Feng decides that whatever you are, you are alone, unarmed, and wearing a lab coat\. He has looked at you with his Qi-sense and felt nothing at all: a mortal\. "Pock-Face,"/, /^Gao Feng decides that whatever you are, you are unarmed, wearing a lab coat, and alone but for a cat\./, /^Gao Feng decides that whatever you are, you are unarmed, wearing a lab coat, and alone but for a slight woman in a black dress\. He has looked at you both with his Qi-sense and felt nothing at all: a mortal, and a mortal's woman, with something about her ears that it is beneath an outer disciple to notice\. "Pock-Face,"/],
        ['herb_girl', {}, /Not a flicker\. His eyes slide off you the way they'd slide off a fence post\. You, apparently/, /Not a flicker\. His eyes slide off you the way they'd slide off a fence post, and off Yuki the way they'd slide off a second, larger fence post\. You, apparently/, /Not a flicker\. His eyes slide off you the way they'd slide off a fence post, and off Yuki the way they'd slide off a second, shorter fence post: they catch on the ears for exactly as long as dignity permits, which is not long\. You, apparently/],
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
            ['fo_wolf_forced', {}, ' Yuki did not stop for a headband. She is sitting in the middle of the lane, washing one paw, and the wolves have slowed. They have not stopped.'],
            ['ring_forced', {}, " Yuki has the gallery behind you, all of it, wall to wall. *I can't turn round in here,* says the bond. *So we are going forward.*"],
            ['night_attack_forced', {}, ' Yuki, who was never going to run, gets up. *Good,* says the bond. *I outweigh them. All of them, together.*'],
            ['night_lizard_forced', {}, ' Yuki, who has crossed the whole rise without bending a grass stem, turns her head and looks at you. *Four hundred pounds,* says the bond. *Not a sound. Remarkable what one can do.*'],
            ['ya_forced', {}, ' Then the whole village looks at Yuki. Yuki looks at the fence. This is, evidently, between people.'],
            ['rt_brawl_start', {}, ' Yuki looks at the wine-shop bench, and at the cousins sitting on it. She can wait. They are about to get up.'],
            ['guardian_half', {}, ' So is Yuki, ears forward, quite still. She heard that song in the same grove you did.'],
            ['guardian_half', { ya_party: false }, ' So is Yuki, ears forward, quite still. She heard that song in the same grove you did.'],
        ];
        for (const [id, flags, line] of FL) {
            const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => view(id, form, flags));
            assert(tiger.includes(line) && tiger.replace(line, '') === cat && human === cat, `XB2 (FL): ${id} ${JSON.stringify(flags)}: her line, hers alone`);
        }
        {   // v0.11.169 (P3A, YF): arson_start has the great root-kin's line (Fable's rewrite) and now the woman's, each hers alone
            const [cat, tiger, human] = ['cat', 'tiger', 'human'].map((form) => view('arson_start', form));
            const T = " Behind you the loft boards creak as Yuki gets up, all of her. *He's only counted one of us,* says the bond.", H = " Behind you Yuki is standing already. \"He has counted one of us,\" she says, without much interest.";
            assert(tiger.includes(T) && tiger.replace(T, '') === cat && human.includes(H) && human.replace(H, '') === cat, 'XB2 (FL) / P3A (YF): arson_start: the great root-kin\'s line and the woman\'s, each hers alone');
        }
        assert(/step through it/.test(view('night_attack_forced', 'tiger')), 'XB2 (FL): night_attack_forced keeps Incremental Mode\'s hedge');
        // HP: each offer marks itself when it fails; both fail to bluff_fail
        const tc = SCENES.tribute.choices;
        assert(tc[1].fail === 'bluff_fail' && tc[2].fail === 'bluff_fail' && /^Bluff/.test(tc[1].text) && /hairpin/.test(tc[2].text), 'XB2 (HP): the bluff and the hairpin fail to bluff_fail');
        for (const [i, want] of [[1, 'bluff'], [2, 'hairpin']]) { const g = FM(67500 + n++, 'cat'); tc[i].failDo(g); assert(g.flags.tribute_fail === want, `XB2 (HP): a failed ${want} sets tribute_fail`); }
        const T1 = ' Nor does a mortal bargain with a trinket while the true treasure stands at his heel. That one would have paid for thirty years.';
        const T2 = "\n\n*Thirty years,* says the bond, as four hundred pounds of the true treasure gets to its feet beside you. *I'd have said forty. He's rounding down.*"; // RC2 (M2): his own words
        const [hc, ht, hh] = ['cat', 'tiger', 'human'].map((form) => view('bluff_fail', form, { tribute_fail: 'hairpin' }));
        assert(/^The song goes wrong in the first bar\./.test(hc) && /"The second is the one that matters\."$/.test(hc) && !/performance|announce himself|nearly|crack|Servant/.test(hc + ht + hh), 'XB2 (HP); RC2 (L1, M2): the hairpin\'s own text, a clear failure, no bluff and no "Servant" in it');
        assert(ht.includes(T1) && ht.includes(T2) && ht.replace(T1, '').replace(T2, '') === hc && hh === hc, 'XB2 (HP): the great root-kin\'s two lines, hers alone');
        for (const f of [{}, { tribute_fail: 'bluff' }]) assert(/^Lu Han watches your performance/.test(view('bluff_fail', 'cat', f)), `XB2 (HP): the bluff's text ${JSON.stringify(f)}`);
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
        assert(/Mei Lin and Yuki between them, Yuki in a black dress that has not picked up so much as one husk, which should not be physically possible\./.test(view('roots_lost', 'human', { ya_party: false })) && !/black dress/.test(view('roots_lost', 'cat', { ya_party: false })), 'XB2 (RH): the human\'s clause');
    }
    {   // SR: the sister's beat by form; the lover's unchanged
        const ROOF = 'Through the bond, from somewhere very far away and getting farther: *I am moving to the roof. I am living on the roof now. Do not look for me.*';
        const SHED = 'Through the bond, from somewhere very far away and getting farther: *I am moving to the roof.* A long creak of thatch. A pause for thought. *I am moving to the goat shed. I live in the goat shed now. Do not look for me.*';
        for (const form of ['cat', 'tiger', 'human']) {
            const g = LPG(66500 + n++, form, { yk_path: 'sister' }); goTo(g, SCENES, 'romance'); const t = sceneView(g, SCENES).text;
            assert(t.includes(form === 'tiger' ? SHED : ROOF) && !t.includes(form === 'tiger' ? ROOF : SHED), `YB1 (SR): the sister's beat as ${form}`);
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
        assert(nights[0][1].startsWith('Watches to set. Ya says she doesn') && camps[1].startsWith('Camp on a raft of fallen trunks'), 'ST3: the Root Road\'s watches and the Drowned Wood\'s first camp keep the old texts');
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
            assert(/Ashfall watches it go/.test(seen) === ![10, 11].includes(r), `ST4: realm ${r}: the village's closer ${[10, 11].includes(r) ? 'left out (no sky came)' : 'kept'}`);
        }
        assert(distinct(bodies) && distinct(nights) && distinct(days), 'ST4: thirteen realms, thirteen texts, each closer its own');
        assert(bodies[0].startsWith('The loop closes again, one rung higher. Core Formation.') && bodies[12].startsWith('Heavenly Immortal.'), 'ST4: Core Formation keeps the old text; the top realm has its own');
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
        assert(eatGrub(11) === 'It pops. It tastes like nutty cream and regret. +10 satiety. Ya cheers.', 'ST6: the grub\'s first day reads as before');
        assert(/^It pops again\..* \+10 satiety\. Ya is already/.test(eatGrub(12)), 'ST6: the grub\'s second day, the gain in its place');
        const beetle = (d) => { g.minutes = (d - 1) * D + 10 * 60; g.scene = 'ah_forage'; return SCENES.ah_forage.choices.find((c) => /fire-beetle/.test(c.text)).do(g).join(' '); };
        assert(beetle(14) === 'It is spicy. Genuinely, chemically spicy. +6 satiety. Ya looks at you like you just proposed.', 'RV1 (TG): the beetle\'s first day reads as before (through its choice)');
        assert(/^Still spicy\..* \+6 satiety\. Ya holds up two fingers/.test(beetle(15)), 'RV1 (TG): the beetle\'s second day, the gain in its place');
        const darts = SCENES.ah_hunt.choices.find((c) => /^Darts/.test(c.text));
        g.minutes = 13 * D + 10 * 60; const p1 = darts.do(g, { ratio: 0.5 })[0];
        g.minutes = 14 * D + 10 * 60; const f2 = darts.do(g, { ratio: 1.2 })[0];
        assert(p1 === `The darts go out flat through the ash haze and most of them hit ash. One hare stops being fast. Ya fetches it without being asked and holds it up by the ears, considering it. "Thin," she says. "Like you." Above you the hawks wheel off, unimpressed, trailing sparks.` && DAY_REPLIES['ah_hunt:1:full'][0] === `The darts go out flat through the ash haze and the hares stop being fast. Ya fetches them without being asked and comes back holding them up by the ears. "Small," she says. "But you hit what you aimed at. Rare, for you." Above you the hawks wheel off, disappointed, trailing sparks.`, 'RV1 (TG): the darts\' old first-day texts, word for word');
        assert(p1 === DAY_REPLIES['ah_hunt:1:part'][0] && f2 === DAY_REPLIES['ah_hunt:1:full'][1], 'ST6: the darts: day 1 some hares (old), day 2 all hares (its second-day text)');
    }
}

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
console.log('fights', sorted(fights));
console.log('endings', sorted(endings), 'longest run', maxSteps, 'scenes', Object.keys(SCENES).length);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, fights, endings, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs; v0.11.22: `seen` for tools/leftovers.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
