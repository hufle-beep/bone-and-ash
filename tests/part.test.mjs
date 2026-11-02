// Run: node tests/part.test.mjs <part>   (fallout | blackroot | heart | return)
// Tests one Act 1 part on its own: links, reachability from its entry, 1,000 random walks to its exit, fights resolve.
// Other parts' entry scenes count as exits, so parts can be written in parallel.
import { newGame, ensureBars, startCombat, combatStep, skillCheck } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
const part = process.argv[2];
const NAME = { fallout: 'FALLOUT', blackroot: 'BLACKROOT', heart: 'HEART', return: 'RETURN' }[part];
const ENTRY = { fallout: 'fo_start', blackroot: 'bl_start', heart: 'ht_start', return: 'rt_start' }[part];
const EXITS = new Set(['bl_start', 'ht_start', 'rt_start', 'fo_start', 'a1_end'].filter((x) => x !== ENTRY));
const mod = await import(`../js/story/act1_${part}.js`);
const S = { ...mod[NAME] };
// prologue scenes a part may link back to (hubs reused); stub them as exits
const stub = (id) => ({ id, title: id, art: 'village', place: '', text: 'x'.repeat(60), end: true, choices: [] });
for (const id of EXITS) if (!S[id]) S[id] = stub(id);
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) pass++; else { fail++; if (fail < 25) console.error('  FAIL', l); } };
for (const s of Object.values(S)) {
    ok(s.id && S[s.id] === s, `id matches key ${s.id}`);
    for (const c of s.choices || []) for (const k of ['to', 'fail']) if (typeof c[k] === 'string') ok(!!S[c[k]], `${s.id} → ${c[k]} exists`);
    ok(s.end || (s.choices || []).length > 0, `${s.id} has choices`);
}
const seen = new Set(); const fights = {};
let rs = 4242; const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };
function seedState(g, run) {
    g.minutes = { fallout: 7, blackroot: 10, heart: 15, return: 18 }[part] * 1440 + 6 * 60;
    g.flags = { long: true, forest_day: 3, vday: 3, ending: ['fought', 'bluff', 'paid', 'lost'][run % 4], romance: run % 3 === 0, healed: true, boar: run % 2 === 0, sky_witness: run % 5 === 0 ? 1 : 0,
        gao_dead: run % 6 === 1, gao_spared: run % 6 === 2, gao_humiliated: run % 6 > 2, militia: run % 3, mei_party: part !== 'fallout', ya_party: part !== 'fallout' && run % 7 !== 0, ya_met: part !== 'fallout',
        ya_romance: run % 4 === 1, trio: part === 'return' ? run % 5 : part === 'heart' ? run % 4 : 0 };
    g.rel = { 'Mei Lin': { f: 30 + (run % 20), a: run % 3 === 0 ? 25 : run % 30 }, Village: { f: 40, a: 0 }, Ya: { f: part === 'fallout' ? 0 : 20, a: part === 'fallout' ? 0 : run % 30 } };
    g.james.gu.level = 7; g.james.skills['Convergence Use'].level = 5; g.yuki.fight.level = 3; g.james.realm = run % 3; ensureBars(g);
}
for (let run = 0; run < 1000; run++) {
    const g = ensureBars(newGame(run + 7)); seedState(g, run); g.scene = ENTRY; const e = S[ENTRY].enter; if (e) e(g);
    let steps = 0;
    for (; steps < 1500; steps++) {
        seen.add(g.scene);
        if (EXITS.has(g.scene)) break;
        const v = sceneView(g, S);
        ok(typeof v.text === 'string' && v.text.length > 40, `text renders in ${g.scene}`);
        ok(!/undefined|NaN|\[object/.test(v.text + v.title), `no undefined/NaN in ${g.scene}`);
        if (v.end) break;
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { ok(false, `dead end at ${g.scene}`); break; }
        const r = choose(g, S, open[rnd(open.length)].index);
        if (r.combat) {
            const enc = r.combat(g); startCombat(g, enc); let out;
            for (let t = 0; t < 80 && g.combat; t++) { out = combatStep(g, g.james.qi >= 4 && t % 3 === 1 ? 'needle' : g.james.qi >= 3 ? 'blade' : 'dart'); if (out?.done) { goTo(g, S, out.next); break; } }
            ok(!g.combat, `combat ${enc.id} ends`); const k = fights[enc.id] ||= { win: 0, n: 0 }; k.n++; if (out?.done === 'win') k.win++;
        }
    }
    ok(steps < 1500, `run ${run} reaches an exit`);
}
const unreached = Object.keys(S).filter((k) => !seen.has(k) && !EXITS.has(k));
ok(unreached.length === 0, `every scene reachable (unreached: ${unreached.join(', ')})`);
console.log('scenes', Object.keys(S).length - EXITS.size, 'fights', Object.fromEntries(Object.entries(fights).map(([k, v]) => [k, `${Math.round(100 * v.win / v.n)}% of ${v.n}`])));
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
