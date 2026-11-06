// Run: node tests/saves.test.mjs — every file in saves/ must load and play on; the save format's safety checks.
import { readdirSync, readFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { SCENES } from '../js/story/prologue.js';
import { newGame, ensureBars, startCombat, combatStep, serialize, deserialize, peekSave, SaveError, SAVE_VERSION, fnv1a } from '../js/core/game.js';
import { sceneView, choose, goTo } from '../js/core/story.js';

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; } else { fail++; console.error('  FAIL ', l); } };
const kindOf = (fn) => { try { fn(); return 'ok'; } catch (e) { return e instanceof SaveError ? e.kind : `other: ${e.message}`; } };

// 1. every file in saves/ loads, round-trips and plays 200 steps
const dir = new URL('../saves/', import.meta.url);
const files = readdirSync(dir).filter((f) => /\.(json|txt)$/.test(f));
// v0.11.9: a save shared to GitHub is packed: 'BAZ1:' + base64(gzip(save)), as main.js packText writes it
const unpack = (t) => (t.trim().startsWith('BAZ1:') ? gunzipSync(Buffer.from(t.trim().slice(5), 'base64')).toString('utf8') : t);
assert(files.length > 0, 'saves/ has files');
let rs = 4242;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };
for (const f of files) {
    const raw = unpack(readFileSync(new URL(f, dir), 'utf8'));
    let g;
    try { g = deserialize(raw); } catch (e) { assert(false, `${f} loads (${e.message})`); continue; }
    assert(true, `${f} loads`);
    assert(!!SCENES[g.scene], `${f}: scene ${g.scene} exists`);
    const again = deserialize(serialize(g));
    assert(JSON.stringify(again) === JSON.stringify(g), `${f}: save → load round trip is exact`);
    assert(peekSave(raw)?.scene === g.scene, `${f}: peek works`);
    for (let s = 0; s < 200; s++) {
        if (g.combat) { const o = combatStep(g, g.james.qi >= 3 ? 'blade' : 'dart'); if (o?.done) goTo(g, SCENES, o.next); continue; }
        const v = sceneView(g, SCENES);
        if (v.end) break;
        const open = v.choices.filter((c) => !c.disabled);
        if (!open.length) { assert(false, `${f}: dead end at ${g.scene}`); break; }
        const r = choose(g, SCENES, open[rnd(open.length)].index);
        if (r.combat) startCombat(g, r.combat(g));
    }
    assert(kindOf(() => deserialize(serialize(g))) === 'ok', `${f}: still saves and loads after 200 steps`);
}

// 2. the format's safety checks
const g = ensureBars(newGame(7));
const good = serialize(g);
assert(unpack('BAZ1:' + gzipSync(good).toString('base64')) === good, 'a packed save unpacks to the same text');
const outer = JSON.parse(good);
assert(outer.fmt === 1 && outer.sum === fnv1a(outer.data), 'wrapper has fmt and checksum');
assert(kindOf(() => deserialize(good)) === 'ok', 'a good save loads');
assert(kindOf(() => deserialize(JSON.stringify(g))) === 'ok', 'an old plain save loads');
const tampered = JSON.stringify({ ...outer, data: outer.data.replace('"minutes":', '"minutes":1') });
assert(kindOf(() => deserialize(tampered)) === 'checksum', 'a changed save fails its checksum');
assert(kindOf(() => deserialize(tampered, { force: true })) === 'ok', '"load anyway" ignores the checksum');
assert(kindOf(() => deserialize(good.slice(0, good.length / 2))) === 'unreadable', 'a cut-off save is unreadable');
assert(kindOf(() => deserialize(null)) === 'empty' && kindOf(() => deserialize('')) === 'empty', 'no save is "empty"');
assert(kindOf(() => deserialize('{"hello":1}')) === 'notSave', 'a foreign file is not a save');
const newer = { ...g, v: SAVE_VERSION + 1 };
assert(kindOf(() => deserialize(JSON.stringify(newer))) === 'tooNew', 'a newer state is reported, not wiped');
assert(kindOf(() => deserialize(JSON.stringify(newer), { force: true })) === 'ok', '"load anyway" reads a newer state');
const broken = ensureBars(newGame(8)); broken.james.qi = NaN;
assert(kindOf(() => serialize(broken)) === 'badNumbers', 'a state with NaN is never written');
const nanText = JSON.stringify({ ...g, minutes: '__X__' }).replace('"__X__"', '1e999');
assert(kindOf(() => deserialize(nanText)) === 'badNumbers', 'a save with Infinity is reported');
assert(kindOf(() => deserialize(nanText, { force: true })) === 'ok', '"load anyway" zeroes broken numbers');
const noV = { ...g }; delete noV.v;
assert(kindOf(() => deserialize(JSON.stringify(noV))) === 'ok', 'a save without a state version migrates');

console.log(`saves: ${files.length} files · ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
