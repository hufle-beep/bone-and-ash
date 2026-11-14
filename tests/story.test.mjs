// Run: node tests/story.test.mjs — story graph integrity + 1,000 random playthroughs (2,000 before v0.11.34) (no crash, no dead end, always reaches the end);
import { deadMenuOk, DEAD_MENUS } from './lib/deadmenus.mjs'; // v0.11.177 (P9A): the emptied menu texts
// Incremental Mode since v0.11.34 (D1: Story Mode dropped from the game)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, itemCap, yukiSitsOut, migrate, REL_HIDDEN, REL_MAX, serialize, deserialize, sleepUntil, startActCoil, jamesHpMax, jamesQiMax, clockParts } from '../js/core/game.js'; // v0.11.172 (P5A RV1, TG1): jamesHpMax, jamesQiMax, clockParts; v0.11.166 (RV1, M2): startActCoil // v0.11.127 (LQ2, TG): yukiSitsOut, migrate; v0.11.137 (HV1): REL_HIDDEN, REL_MAX
import { sceneView, choose, goTo, wasPicked, threatOf } from '../js/core/story.js'; // v0.11.136 (RV2, TG): threatOf
import { actionOpen } from '../js/core/forms.js';
import { btTarget } from '../js/story/meridians.js';
import { loveLine, YK_QUESTION, ykAskAgain, YK_HERE } from '../js/story/yuki_path.js'; // v0.11.122 (RL1, T); v0.11.137 (TR1, YR; QA2)
import { YT_HUBS, YT_BODY, YT_CLOSE, YT_LABEL, YT_GAIN, ytPool } from '../js/story/yuki_time.js'; // v0.11.137 (TR1)
import { TASK_HUBS } from '../js/story/task_hubs.js'; // v0.11.137 (TR1, YB)
import { HT_HUBS, HT_BODY, HT_CLOSE, HT_LABEL, HT_GAIN, HT_MID, htPool, htSlot } from '../js/story/house_time.js'; // v0.11.139 (MW1)
import { likesMei, likesYa, rel } from '../js/story/act1_common.js'; // v0.11.123 (EQ1, AB); v0.11.172 (P5A): rel
import { KEEP_FLAGS, rewind } from '../js/core/coil.js'; // v0.11.137 (HV1, Fable L2): rewind on an old save // v0.11.123 (ER1, T3)
import { againView, noteRead, MEMORY_LINES } from '../js/story/again.js'; // v0.11.167 (CA1): MEMORY_LINES // v0.11.125 (RW1, T); v0.11.133 (FP2): noteRead
import { STOMP } from '../js/story/power.js'; import { ASHFALL } from '../js/story/ashfall.js'; import { FALLOUT } from '../js/story/act1_fallout.js'; import { BLACKROOT } from '../js/story/act1_blackroot.js'; // v0.11.172 (P5A): BLACKROOT; v0.11.170 (NX2): FALLOUT // v0.11.169 (P3A): ASHFALL // v0.11.126 (NQ1)
import { coilStamp, dayIndex, textDay, DAY_REPLIES, COIL_SETS, actCoil, noteDay, linesOf, pickLine } from '../js/core/lines.js'; // v0.11.166 (RW1): COIL_SETS, actCoil; // v0.11.135 (NT1, EV1); v0.11.136 (NC1): DAY_REPLIES
import { splitReply, splitLine, landReply, noteSaid } from '../js/core/replies.js'; // v0.11.136 (NC1); RV2 (TG): landReply, noteSaid
import { runTask, taskOutcome, cardCheck, taskCards, yukiSays as yukiSaysS } from '../js/core/tasks.js'; // v0.11.169 (CA1, YH): yukiSays // v0.11.136 (RV2, TG); v0.11.139 (MW1): taskCards
import { HEART } from '../js/story/act1_heart.js'; import { createHash } from 'node:crypto'; // v0.11.173 (P6A): the Heart's scenes, for its block
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
    const keys = Object.keys(DAY_REPLIES).filter((k) => !ST6K.includes(k) && !SWK.includes(k) && !SRK.includes(k) && !SR4K.includes(k) && !P5K.includes(k) && !P9K.includes(k));
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
            { const g = B(seed++, 'cat'); g.scene = 'bl_train'; assert(c.failDo(g).length === 0, `P5A (SW): ${key}'s failure stays silent`); }
        }
        // CL and LB: five days, not three or four; Ya's tracks ten days back; the three labels
        { const g = B(seed++, 'cat'); g.scene = 'bl_start'; const t = txt('bl_start', g); assert(/Five days in/.test(t) && !/Three days in|four-day/.test(SRC), 'P5A (CL): the expedition is five days (bl_start, the label)'); }
        { const g = B(seed++, 'cat'); g.scene = 'rr_scout'; const t = txt('rr_scout', g); assert(/Ten days back, before the village/.test(t) && !/Three days ago/.test(t) && /two days/i.test(t), 'P5A (CL): Ya smelled his stream camp ten days back, and followed him two days'); }
        // RV1 (M2, TG2): the menu's text is never drawn on a task screen, so the fix and the CW line are in the card's reply, which is
        { const g = B(seed++, 'cat', 'rr', 1); g.scene = 'rr_hub'; const r = runTask(g, SCENES, 'rr_scout:1'); const j = r.lines.join(' '); assert(g.scene === 'rr_hub' && /Ten days back\. Your first camp, by the stream/.test(j) && /You fed the cat first, so: not Sect/.test(j), `P5A (RV1, M2): "You followed me for two days?" says ten days back and the cat fed first, on the hub (${j.slice(0, 80)})`); }
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
        const PIN = { 'act1_heart.js': '2d572e3036fe378a', 'stomp_act1.js': '1a2e6d1e8cb25a0b', 'yuki_time.js': '57766f1f892f764a', labels: '0958b6a7e10b662a' };
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
      const PIN = { 'act1_return.js': 'b8f64404a59727db', labels: '09639549cbc1df4e' };
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
        const s = serialize(L(9504, 2)); void s;
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
    for (const [i, k, kf] of [[0, 't1', 't1Fail'], [1, 't2', 't2Fail'], [2, 't3', null], [3, 't4', 't4Fail']]) {
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
      assert(h === '47cdc01d6b4ab6a7e13145655586d82285767d62', `P8A: the Long Forest's ids, titles, places, art, labels, targets, times and checks as in v0.11.174 (${h}; update only with a push that means to change them)`); }
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
          for (const [i, k, kf] of [[0, 't1', 't1Fail'], [1, 't2', 't2Fail'], [2, 't3', null], [3, 't4', 't4Fail']]) { const c = SCENES.lf_train.choices[i]; (got[k] ||= []).push(c.do(g).find((x) => LF_DRILL[k].includes(x))); if (kf) (got[kf] ||= []).push(c.failDo(g).find((x) => LF_DRILL[kf].includes(x))); }
          g = ensureBars(deserialize(serialize(g))); g.minutes += 1440;
      }
      assert(Object.entries(got).every(([, v]) => new Set(v).size === 3 && v.every(Boolean)), `TG2: each drill's three lines over three days, through saves (${Object.entries(got).map(([k, v]) => `${k} ${new Set(v).size}`)})`);
      const pools = Object.keys(g.lines?.p || {}).filter((k) => /^lf_t/.test(k)).sort();
      assert(JSON.stringify(pools) === JSON.stringify(['lf_t1', 'lf_t1Fail', 'lf_t2', 'lf_t2Fail', 'lf_t3', 'lf_t4', 'lf_t4Fail']), `TG2: seven drill pools, by name (${pools})`); }
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
      assert(h === '8324a18ec679bf78dc059d2dd4afd6e5712067cd', `TG10: the Long Forest's code with its strings taken out, as in v0.11.177 (P9A: the dead menus, the spar's pool, the Heartless's win) (${h}; update only with a push that means to change it)`); }
    // TG11: the first visits on day 0 count no weeks, months or days
    for (const id of Object.keys(LONGFOREST)) for (const [form] of FORMS) { const g = L(seed++, form, 7); g.scene = id; let t = ''; try { t = txt(id, g); } catch { t = ''; } const SPENT = /\b(?:several|many|for|after) (?:weeks|months|days)\b|\bweeks of\b|\ba while ago\b/; assert(!SPENT.test(t), `TG11: ${id} as ${form} on day 0 counts no time spent here (${(t.match(/.{0,30}(?:weeks|months|days|a while ago).{0,20}/) || [''])[0]})`); } // a week's walk, this week (the prologue's), a lie's month: not time spent here
    // TG13 (C5): a drill card on the task screen shows a drill line in every band it reaches
    { const lf0 = deserialize(readFileSync(new URL('../saves/v0.11.7-long-forest-coil2.json', import.meta.url), 'utf8')); const bands = new Set();
      for (const tier of [1, 3, 6, 9]) for (let i = 0; i < 4; i++) { const g = ensureBars(deserialize(serialize(lf0))); g.james.gu = { tier, level: 5, xp: 0 }; g.james.qi = 60; g.james.satiety = 80; g.seed += i;
          const card = taskCards(g, SCENES).find((c) => c.id === `lf_train:${i}`); if (!card || card.status !== 'open') continue;
          const r = runTask(g, SCENES, card.id); bands.add(card.check?.band); const all = Object.values(LF_DRILL).flat();
          assert((r.lines.some((x) => all.includes(x) || (i === 2 && /−3 HP\.$/.test(x))) || (i === 2 && /partly/.test(r.lines[0] || ''))), `TG13 (C5): lf_train:${i} at T${tier} (${card.check?.band}) shows a drill line (${r.lines.slice(0, 3)})`); }
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
        const cs = SCENES[hub].choices.filter((c) => !/^(wen|mother)_time$/.test(c.to) && c.to !== 'rt_selene'), last = cs[cs.length - 1]; // v0.11.139 (MW1): Wen's and the mother's cards follow hers; v0.11.174 (SL1, SC): and the Selene story on rt_camp
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
        ['fo_drill', /^Spar with Yuki in front of them/, {}, /Then Old Hu bows to the cat\./, /Then Old Hu bows to the great beast, from a distance/, // v0.11.170 (NX2, SR): the great root-kin's own
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
         /Yuki ends up on the far side of the hollow with a mouthful of ironhide bristle[\s\S]*\*I have standards\.\*/]]) {
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
        [/^Stop walking\. Kiss her/, /Then there's a cat on your shoulder, washing a paw/, /Then there is a great white cat filling the path beside you/, /Then she walks on, hands clasped behind her back, innocent of everything\./], // LQ2 (TS): the great root-kin's own
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
        ["mire_lost", { fly: true }, " Yuki rises beside you, black to the shoulder, having learnt that the mire holds a tiger's weight a great deal better than it holds a cat's, and lets go of it a great deal more slowly. *We do not speak of this,* says the bond."], // v0.11.131 (XB2, FY): for a flier
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
            assert(/Ashfall watches it go/.test(seen) === ![10, 11].includes(r), `ST4: realm ${r}: the village's closer ${[10, 11].includes(r) ? 'left out (no sky came)' : 'kept'}`);
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

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
console.log('fights', sorted(fights));
console.log('endings', sorted(endings), 'longest run', maxSteps, 'scenes', Object.keys(SCENES).length);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, fights, endings, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs; v0.11.22: `seen` for tools/leftovers.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
