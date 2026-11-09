// Run: node tests/story.test.mjs — story graph integrity + 1,000 random playthroughs (2,000 before v0.11.34) (no crash, no dead end, always reaches the end);
// Incremental Mode since v0.11.34 (D1: Story Mode dropped from the game)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, itemCap } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { actionOpen } from '../js/core/forms.js';
import { btTarget } from '../js/story/meridians.js';
import { writeFileSync } from 'node:fs';
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
                const act = smart ? (g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'dart') : acts[rnd(acts.length)];
                const out = (!smart && t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, act);
                if (out?.done) { const k = `${id}:${smart ? 'smart' : 'random'}`; fights[k] = fights[k] || { win: 0, lose: 0, flee: 0 }; fights[k][out.done] += 1; goTo(g, SCENES, out.next); break; }
            }
            assert(!g.combat, `combat ends (${g.scene}, run ${run})`);
        }
        if (!(Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.qi))) assert(false, `bars finite in ${g.scene}`); else pass++;
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
    g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; ensureBars(g);
    assert(walkFrom(g, run % 2 ? 'rt_start' : 'bl_start', new Set(['a1_end']), 2500) === true, `v0.11.21: Yuki's path walk reaches the end of Act 1 (run ${run})`);
}
// v0.11.21: "All of you" (yk_night_all) on purpose: the random walks above reach it only by luck (missed under 4 of 10
// other seeds), so the scene-coverage check held by chance. Yuki's lover path, Mei Lin and Ya both warm, the trio ready.
for (let run = 0; run < 20; run++) {
    const g = ensureBars(fresh(run + 43434)); g.minutes = 18 * 1440 + 360;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true, yk_path: 'lover', trio: 3, yk_mei: 2 });
    g.rel = { 'Mei Lin': { f: 40, a: 80 }, Ya: { f: 40, a: 95 }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } };
    g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; ensureBars(g);
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
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true, yk_back: 'bl_camp' });
    g.rel = { 'Mei Lin': { f: 40, a: 10 }, Ya: { f: 40, a: 10 }, Yuki: { f: 150, a: 150 }, Village: { f: 30, a: 0 } }; ensureBars(g);
    goTo(g, SCENES, 'yk_choice'); seen.add('yk_choice');
    const ans = sceneView(g, SCENES).choices.find((c) => !c.disabled && re.test(c.label));
    assert(!!ans, `v0.11.91 (Y1): yk_choice offers ${to} (run ${run})`);
    if (!ans) continue;
    choose(g, SCENES, ans.index);
    assert(g.scene === to && g.flags.yk_path === (to === 'yk_lover' ? 'lover' : 'sister'), `v0.11.91 (Y1): the answer leads to ${to} (${g.scene}, ${g.flags.yk_path})`);
    assert(walkFrom(g, g.scene, new Set(['bl_camp']), 50, true) === true, `v0.11.91 (Y1): from ${to} on to the Blackroot camp (run ${run}, at ${g.scene})`);
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
    lost: ['jackals_lost', 'night_lost', 'mire_lost', 'far_lost', 'fo_wolf_lost', 'ring_lost', 'lf_trial_lost', 'rt_serpent_lost'], // a lost beast fight ends the Coil
    screen: ['meridians'], // the meridian screen (Meditate cards since v0.11.13)
    failed: ['scan_bad', 'first_bone_fail', 'hunt_got', 'night_attack_forced', 'arson_start', 'ring_forced', 'rt_ambush_forced', 'rt_ford_wake', 'rt_serpent_forced'], // failed checks: possible for a very weak James, never failed in these games (roots_caught is: the sister walk)
    never: ['rt_serpent_won'], // the ford serpent never fights (both ways across always pass)
};
const storyOnly = new Set(Object.values(STORY_ONLY).flat());
const unreached = Object.keys(SCENES).filter((k) => !seen.has(k) && !storyOnly.has(k));
assert(!FULL || unreached.length === 0, `every scene reachable (unreached: ${unreached.join(', ')})`);
assert([...storyOnly].every((k) => SCENES[k]), 'v0.11.34: every Story-only scene still exists');
const reachedAnyway = [...storyOnly].filter((k) => seen.has(k));
// v0.11.34 (cold review): an old Story Mode save may sit on one of them; each walks on with no dead end, open meridians (as an old save) and closed
const ACT1 = (k) => /^(fo_|ring_|roots_|rt_)/.test(k);
for (const k of storyOnly) for (let run = 0; run < 30; run++) {
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
if (!FULL) console.log(`  coverage (quick, log only): ${Object.keys(SCENES).length - storyOnly.size - unreached.length} of ${Object.keys(SCENES).length - storyOnly.size} scenes reached (${storyOnly.size} Story-only left out)`); // v0.11.21
const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
console.log('fights', sorted(fights));
console.log('endings', sorted(endings), 'longest run', maxSteps, 'scenes', Object.keys(SCENES).length);
if (STATS_OUT) writeFileSync(STATS_OUT, JSON.stringify({ games: GAMES, fights, endings, seen: touchedOut() })); // v0.11.3: for tools/sanity.mjs; v0.11.22: `seen` for tools/leftovers.mjs
console.log(`  ${GAMES} games in ${WORKERS} worker${WORKERS > 1 ? 's' : ''}${FULL ? '' : ' (quick: coverage logged, not checked)'}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
