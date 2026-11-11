// Run: node tests/part.test.mjs <part>   (fallout | blackroot | heart | return)
// Tests one Act 1 part on its own: links, reachability from its entry, 1,000 random walks to its exit, fights resolve.
// Other parts' entry scenes count as exits, so parts can be written in parallel.
// v0.11.44 (E step 1, owner pick P2): Incremental Mode (no dice), like the game; James's strength comes from the bots' range
// at each part's entry (BANDS below), plus test-only runs with a weak James, so every failed check and "lost" scene is walked.
import { newGame, ensureBars, startCombat, combatStep, jamesHpMax, jamesQiMax } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';
import { fillItemNames } from './lib/items.mjs';
import { smartAction } from './lib/smartfight.mjs'; // v0.11.96 (BT1)
fillItemNames(); // v0.11.25: the item names, so gives() (the full-stock hide, the hauls) works in the walks
const part = process.argv[2];
const NAME = { fallout: 'FALLOUT', blackroot: 'BLACKROOT', heart: 'HEART', return: 'RETURN' }[part];
const ENTRY = { fallout: 'fo_start', blackroot: 'bl_start', heart: 'ht_start', return: 'rt_start' }[part];
const EXITS = new Set(['bl_start', 'ht_start', 'rt_start', 'fo_start', 'a1_end'].filter((x) => x !== ENTRY));
const mod = await import(`../js/story/act1_${part}.js`);
const S = { ...mod[NAME] };
// prologue scenes a part may link back to (hubs reused); stub them as exits
const stub = (id) => ({ id, title: id, art: 'village', place: '', text: 'x'.repeat(60), end: true, choices: [] });
for (const id of EXITS) if (!S[id]) S[id] = stub(id);
// v0.11.44 (P2): the bots' range at each part's entry (low / middle / high): [GU tier, level, Convergence tier, level, realm, Yuki fight]
const BANDS = {
    fallout: [[1, 8, 1, 5, 0, 4], [1, 9, 1, 6, 0, 8], [2, 4, 1, 8, 1, 9]],
    blackroot: [[1, 10, 1, 6, 0, 2], [2, 3, 1, 7, 0, 7], [2, 7, 1, 9, 1, 10]],
    heart: [[2, 10, 1, 10, 1, 4], [3, 3, 2, 2, 1, 8], [3, 9, 2, 7, 1, 10]],
    return: [[3, 2, 2, 1, 1, 3], [3, 5, 2, 5, 1, 8], [3, 10, 2, 9, 2, 10]],
};
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
        gao_broken: run % 6 === 1, gao_spared: run % 6 === 2, gao_humiliated: run % 6 > 2, militia: run % 3, mei_party: part !== 'fallout', ya_party: part !== 'fallout' && run % 7 !== 0, ya_met: part !== 'fallout',
        ya_romance: run % 4 === 1, trio: part === 'return' ? run % 5 : part === 'heart' ? run % 4 : 0 };
    g.rel = { 'Mei Lin': { f: 30 + (run % 20), a: run % 3 === 0 ? 25 : run % 30 }, Village: { f: 40, a: 0 }, Ya: { f: part === 'fallout' ? 0 : 20, a: part === 'fallout' ? 0 : run % 30 } };
    // v0.11.44 (P2): a focused start: 1 run in 40 after the fallout with Ya's affection at 86 (likesYa needed 85, 72 since v0.11.123; the walks reached
    // ya_romance once in 1,000 runs with dice, never without), and without the Ya romance flag (run % 4 === 3)
    if (part !== 'fallout' && run % 40 === 7) g.rel.Ya.a = 86;
    // v0.11.44 (P2): James's strength from the bot models at this part's entry (fo_start, bl_start, ht_start, rt_start; 300 games each of
    // Random, Careful and Completionist, v0.11.43, p10 / p50 / p90): [GU tier, level, Convergence tier, level, realm, Yuki fight level]
    const b = BANDS[part][[0, 0, 0, 1, 1, 1, 1, 2, 2, 1][run % 10]].slice();
    // test-only: at the bots' strength James wins every fight even arriving at 2 HP (the return part, v0.11.44), so 2 runs in 40 that
    // arrive hurt (run % 10 === 9) play the old fixed James (GU T1 L7, Convergence T1 L5, realm 0, Yuki fight 3), so every "lost" scene
    // is walked. run % 40 === 39 also fails its GU checks (below), for the losses behind a failed check: in the return part it is a
    // James at T1 L1 in everything, the only one who loses the ford serpent (rt_serpent_lost; GU T1 L7 at 1% HP still wins it in
    // 2 rounds); not in the heart, where a James who can neither win a fight nor pass a check loops on the roots forever
    if (run % 40 === 29) b.splice(0, 6, 1, 7, 1, 5, 0, 3);
    if (run % 40 === 39 && part === 'return') b.splice(0, 6, 1, 1, 1, 1, 0, 1);
    // v0.11.109 (owner pick FL1, C): from Foundation the ford is flown, so the GU-failing run 18 walks it at Mortal realm (its skills
    // kept): it fails the far bank and wins the serpent (rt_serpent_won); the flown crossings are tested in the tasks test
    if (run % 40 === 18 && part === 'return') b[4] = 0;
    g.james.gu = { tier: b[0], level: b[1], xp: 0 }; g.james.skills['Convergence Use'] = { tier: b[2], level: b[3], xp: 0 }; g.james.realm = b[4]; g.yuki.fight.level = b[5];
    ensureBars(g); g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g); // full, as the bots arrive (newGame's bars were kept before)
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
        // test-only (v0.11.44, P2): a real player at these parts passes every check, so 3 runs in 40 fail theirs on purpose: they
        // take a check half the time one is open, and its skill is set to T1 L1 for that one pick, then put back (the fights behind it are
        // fought at that run's strength; run % 40 === 39 arrives hurt, and in the return part is the weak fighter). Two of them fail GU checks only, one Convergence checks too.
        const r40 = run % 40, weak = r40 === 18 || r40 === 39 ? ['GU'] : r40 === 38 ? ['GU', 'Convergence Use'] : null;
        const checkOf = (c) => (c.index < 1000 ? S[g.scene].choices?.[c.index]?.check : null);
        const tries = weak ? open.filter((c) => weak.includes(checkOf(c)?.skill)) : [];
        // half the time (a hash of the run and step, not rnd: rnd's picks run in step with run % 40 and would always pick the same),
        // so a weak run can't loop on a repeatable check forever
        const pool = tries.length && ((Math.imul(steps + 1, 2654435761) ^ Math.imul(run + 1, 40503)) >>> 9) % 2 === 0 ? tries : open;
        const pickI = pool[rnd(pool.length)].index;
        const ck = checkOf({ index: pickI });
        const held = weak && ck && weak.includes(ck.skill) ? (ck.skill === 'GU' ? g.james.gu : g.james.skills[ck.skill]) : null;
        if (held) { const low = { tier: 1, level: 1, xp: 0 }; if (ck.skill === 'GU') g.james.gu = low; else g.james.skills[ck.skill] = low; }
        let r;
        try { r = choose(g, S, pickI); } finally { if (held) { if (ck.skill === 'GU') g.james.gu = held; else g.james.skills[ck.skill] = held; } }
        if (r.combat) {
            const enc = r.combat(g);
            // 1 run in 10 arrives hurt (1-20% HP), the way real losses happen (v0.8.6), so every "lost" scene is walked
            if (run % 10 === 9) g.james.hp = Math.max(1, Math.round(jamesHpMax(g) * (0.01 + 0.19 * rnd(100) / 99)));
            startCombat(g, enc); let out;
            for (let t = 0; t < 80 && g.combat; t++) { out = combatStep(g, smartAction(g, t)) /* v0.11.96 (BT1) */; if (out?.done) { goTo(g, S, out.next); break; } }
            ok(!g.combat, `combat ${enc.id} ends`);
            // v0.11.44: the win rates count the bot-like runs only (not the hurt ones, run % 10 === 9, nor the check-failing ones)
            if (run % 10 !== 9 && run % 40 !== 18 && run % 40 !== 38) { const k = fights[enc.id] ||= { win: 0, n: 0 }; k.n++; if (out?.done === 'win') k.win++; }
        }
    }
    ok(steps < 1500, `run ${run} reaches an exit`);
}
const unreached = Object.keys(S).filter((k) => !seen.has(k) && !EXITS.has(k));
ok(unreached.length === 0, `every scene reachable (unreached: ${unreached.join(', ')})`);
console.log('scenes', Object.keys(S).length - EXITS.size, 'fights won (bot-like runs)', Object.fromEntries(Object.entries(fights).map(([k, v]) => [k, `${Math.round(100 * v.win / v.n)}% of ${v.n}`])));
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
