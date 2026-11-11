// Run: node tests/story.test.mjs — story graph integrity + 1,000 random playthroughs (2,000 before v0.11.34) (no crash, no dead end, always reaches the end);
// Incremental Mode since v0.11.34 (D1: Story Mode dropped from the game)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS, itemCap } from '../js/core/game.js';
import { sceneView, choose, goTo, wasPicked } from '../js/core/story.js';
import { actionOpen } from '../js/core/forms.js';
import { btTarget } from '../js/story/meridians.js';
import { loveLine } from '../js/story/yuki_path.js'; // v0.11.122 (RL1, T)
import { likesMei, likesYa } from '../js/story/act1_common.js'; // v0.11.123 (EQ1, AB)
import { KEEP_FLAGS, rewind } from '../js/core/coil.js'; // v0.11.123 (ER1, T3)
import { againView } from '../js/story/again.js'; // v0.11.125 (RW1, T)
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
    for (let run = 0; run < 24; run++) {
        const from = run % 2 ? 'rt_start' : 'fo_start';
        const g = LG(55100 + run, { yk_path: 'lover' }, [10 + (run % 3) * 40, 10 + (run % 4) * 30], 7); g.minutes = (from === 'fo_start' ? 7 : 18) * 1440 + 360;
        g.james.gu.level = 9; g.james.skills['Convergence Use'].level = 6; ensureBars(g);
        walkFrom(g, from, new Set(from === 'fo_start' ? ['bl_start'] : ['a1_end']), 2500);
        if (g.seen?.yk_night_fo != null) fo++; if (g.seen?.rt_yk_talk != null) rt++;
    }
    assert(fo > 0 && rt > 0, `ER1 (T8): random lover walks at Nascent Soul reach yk_night_fo (${fo} of 12) and rt_yk_talk (${rt} of 12)`);
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
        const v = sceneView(g, SCENES); const a = againView(g, v);
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
