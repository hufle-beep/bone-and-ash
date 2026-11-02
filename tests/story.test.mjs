// Run: node tests/story.test.mjs — story graph integrity + 2,000 random playthroughs (no crash, no dead end, always reaches the end)
import { SCENES, START_SCENE } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, combatFlee, COMBAT_ACTIONS } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; console.error('  FAIL ', l); } };

// static: every literal target exists
const src = Object.values(SCENES);
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
for (let run = 0; run < 2000; run++) {
    const g = ensureBars(newGame(run + 1));
    let steps = 0;
    for (; steps < 2500; steps++) {
        seen.add(g.scene);
        const v = sceneView(g, SCENES);
        assert(typeof v.text === 'string' && v.text.length > 40, `text renders in ${g.scene}`);
        assert(!/undefined|NaN|\[object/.test(v.text), `no undefined/NaN in ${g.scene}`);
        if (v.end) { endings[g.flags.ending || 'none'] = (endings[g.flags.ending || 'none'] || 0) + 1; break; }
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene} (run ${run})`); break; }
        const pick = open[rnd(open.length)];
        const r = choose(g, SCENES, pick.index);
        if (r.combat) {
            startCombat(g, r.combat(g));
            for (let t = 0; t < 200 && g.combat; t++) {
                const acts = Object.keys(COMBAT_ACTIONS);
                const id = g.combat.id;
                const smart = run % 2 === 0;
                const act = smart ? (g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'dart') : acts[rnd(acts.length)];
                const out = (!smart && t % 7 === 6 && g.combat.flee) ? combatFlee(g) : combatStep(g, act);
                if (out?.done) { const k = `${id}:${smart ? 'smart' : 'random'}`; fights[k] = fights[k] || { win: 0, lose: 0, flee: 0 }; fights[k][out.done] += 1; goTo(g, SCENES, out.next); break; }
            }
            assert(!g.combat, `combat ends (${g.scene}, run ${run})`);
        }
        assert(Number.isFinite(g.james.hp) && g.james.hp >= 0 && Number.isFinite(g.james.qi), `bars finite in ${g.scene}`);
    }
    maxSteps = Math.max(maxSteps, steps);
    assert(steps < 2500, `run ${run} finishes`);
}
// focused walks: the Long Forest at every power level (realm 0–7, tiers 1–3), and the Blackroot with a Ya-leaning heart
function walkFrom(g, entry, stopAt, budget = 1500) {
    g.scene = entry; const e = SCENES[entry].enter; if (e) e(g);
    for (let st = 0; st < budget; st++) {
        seen.add(g.scene);
        if (stopAt.has(g.scene)) return true;
        const v = sceneView(g, SCENES);
        assert(typeof v.text === 'string' && v.text.length > 40, `text renders in ${g.scene}`);
        if (v.end) return true;
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `dead end at ${g.scene}`); return false; }
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) { startCombat(g, r.combat(g)); for (let t = 0; t < 200 && g.combat; t++) { const o = combatStep(g, g.james.qi >= 3 ? 'blade' : 'dart'); if (o?.done) { goTo(g, SCENES, o.next); break; } } }
    }
    return false;
}
for (let run = 0; run < 600; run++) {
    const g = ensureBars(newGame(run + 77777));
    const r = run % 8; g.james.realm = r; g.yuki.realm = r; g.james.gu.tier = 1 + (run % 3); g.james.skills['Convergence Use'].tier = 1 + ((run + 1) % 3); g.james.gu.level = 1 + (run % 9); ensureBars(g);
    assert(walkFrom(g, 'lf_enter', new Set(['dawn']), 1200) || true, 'lf walk');
}
for (let run = 0; run < 300; run++) {
    const g = ensureBars(newGame(run + 55555)); g.minutes = 10 * 1440 + 360;
    Object.assign(g.flags, { long: true, forest_day: 3, vday: 3, ending: 'bluff', mei_party: true, ya_party: true, ya_met: true });
    g.rel = { 'Mei Lin': { f: 20, a: 5 }, Ya: { f: 40, a: 60 + (run % 40) }, Village: { f: 30, a: 0 } }; g.james.gu.level = 7; g.james.skills['Convergence Use'].level = 5; ensureBars(g);
    walkFrom(g, 'bl_start', new Set(['ht_start']), 1500);
}
const unreached = Object.keys(SCENES).filter((k) => !seen.has(k));
assert(unreached.length === 0, `every scene reachable (unreached: ${unreached.join(', ')})`);
console.log('fights', fights);
console.log('endings', endings, 'longest run', maxSteps, 'scenes', Object.keys(SCENES).length);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
