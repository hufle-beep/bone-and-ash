// Run: node tests/story.test.mjs — story graph integrity + 1,000 random playthroughs (2,000 before v0.11.34) (no crash, no dead end, always reaches the end);
// Incremental Mode since v0.11.34 (D1: Story Mode dropped from the game)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, itemCap } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { actionOpen } from '../js/core/forms.js';
import { btTarget } from '../js/story/meridians.js';
import { loveLine } from '../js/story/yuki_path.js'; // v0.11.122 (RL1, T)
import { writeFileSync } from 'node:fs';
import { smartAction } from './lib/smartfight.mjs'; // v0.11.96 (BT1)
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
    assert(/^Stay there, the three of you/.test(fo[0].text) && fo[1].text === '"Stay."' && fo[1].to === 'fo_ya_night' && typeof fo[2].text === 'function' && fo[2].text(t2) === 'Sleep.' && /^Tonight, Ya\./.test(fo[3].text) && /^Tonight, Mei Lin\./.test(fo[4].text) && fo.length === 5, 'RL1 (TP): fo_last_night keeps choices 0–2, the new ones last');
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
