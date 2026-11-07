// Run: node tests/data.test.mjs — data integrity (v0.11.7, from Selene's data.test.js).
// Every id the game refers to exists: task-hub scenes and menus, form ids on story choices, items given or needed,
// and every data-* marker in the page has code that reads it (a renamed marker once stuck every Selene player).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { PICTURES, pictureOf, sceneArt, setArtState, YUKI_CAT_ONLY } from '../js/art/art.js';
import { SCENES, ITEMS } from '../js/story/prologue.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { FORM_LINES } from '../js/core/forms.js';
import { gunzipSync } from 'node:zlib';
import { deserialize, newGame, ensureBars, itemCap } from '../js/core/game.js';
import { gives, sceneView } from '../js/core/story.js';

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) pass++; else { fail++; console.error('  FAIL ', l); } };

// 1. task hubs: the hub, its menus, door menus, doors and evening scene all exist
for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
    assert(!!SCENES[hub], `task hub ${hub} is a scene`);
    for (const m of [...Object.keys(cfg.menus || {}), ...Object.keys(cfg.doorMenus || {})]) assert(!!SCENES[m], `${hub}: menu ${m} is a scene`);
    for (const d of cfg.doors || []) assert(!!SCENES[d], `${hub}: door ${d} is a scene`);
    const eve = typeof cfg.evening === 'function' ? [...cfg.evening.toString().matchAll(/'([a-z_0-9]+)'/g)].map((m) => m[1]) : cfg.evening ? [cfg.evening] : [];
    for (const e of eve) assert(!!SCENES[e], `${hub}: evening ${e} is a scene`);
}

// 1b. v0.11.21: every door is a place a choice on its hub leads to, and the doors and menus of each hub are pinned
// (the mutation test removed the stream's hunt door and only the drift check noticed). A deliberate change updates this list.
const HUB_CARDS = {"camp":"","stream":"forage hunt","wilds":"menu:wild_explore menu:wild_forage menu:wild_hunt menu:wild_train","village":"heal village_hunt","ashfall":"far_hunt heal herb_slopes menu:clinic menu:drill menu:workshop scout village_hunt wen_lesson","fo_ashfall":"fo_mei fo_mother fo_spy fo_ya_time menu:fo_clinic menu:fo_council menu:fo_drill menu:fo_palisade","rr_hub":"bl_train menu:rr_forage menu:rr_scout rr_hunt rr_roots talk_mei talk_ya ya_mocks","dw_hub":"bl_train dw_hunt dw_scout hot_spring menu:dw_forage talk_mei talk_ya","ah_hub":"ah_hunt ah_scout bl_train menu:ah_forage talk_mei talk_ya trio_kiss ya_offended","heart_hub":"hall_listen heart_spring ring_chambers sect_cut","rt_camp":"rt_fire_talk rt_watch","rt_ashfall":"menu:rt_hunters rt_council rt_grove rt_ya_village","lf_hub":""};
for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
    const targets = new Set((SCENES[hub]?.choices || []).map((c) => c.to).filter((t) => typeof t === 'string'));
    for (const d of cfg.doors || []) assert(targets.has(d), `v0.11.21: ${hub}: door ${d} is a choice on the hub`);
    const now = [...(cfg.doors || []), ...Object.keys(cfg.doorMenus || {}).map((m) => 'menu:' + m), ...Object.keys(cfg.menus || {}).map((m) => 'menu:' + m)].sort().join(' ');
    assert(now === HUB_CARDS[hub], `v0.11.21: ${hub}'s doors and menus are the pinned ones (now: ${now || 'none'}; pinned: ${HUB_CARDS[hub] ?? 'not listed'})`);
}
assert(Object.keys(HUB_CARDS).every((h) => TASK_HUBS[h]), 'v0.11.21: every pinned hub is still a task hub');

// 2. form ids on story choices exist in forms.js
const formIds = new Set(Object.values(FORM_LINES).flatMap((l) => l.forms.map((f) => f.id)));
let formChoices = 0;
for (const s of Object.values(SCENES)) for (const c of s.choices || []) if (c.form) { formChoices++; assert(formIds.has(c.form), `${s.id}: form ${c.form} exists`); }
assert(formChoices >= 18, `story choices with a form: ${formChoices} (at least 18)`);

// 3. every item id the code gives, checks or uses is in ITEMS
const jsFiles = ['js/core', 'js/story'].flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.js')).map((f) => `${d}/${f}`));
const used = new Map();
for (const f of jsFiles) for (const m of readFileSync(f, 'utf8').matchAll(/\b(addItem|hasItem)\(g,\s*'([a-z_0-9]+)'/g)) used.set(m[2], f);
assert(used.size >= 10, `item ids found in the code: ${used.size}`);
for (const [id, f] of used) assert(!!ITEMS[id], `item ${id} (${f}) is in ITEMS`);

// 4. every data-* marker written in the page or main.js is read by main.js
const main = readFileSync('js/main.js', 'utf8');
const html = readFileSync('index.html', 'utf8');
const markers = new Set([...(main + html).matchAll(/data-([a-z][a-z-]*)=/g)].map((m) => m[1]));
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
for (const k of markers) assert(main.includes(`dataset.${camel(k)}`) || main.includes(`[data-${k}`), `data-${k} is handled in main.js`);
assert(markers.size >= 20, `data markers found: ${markers.size}`);

// 5. v0.11.24: the generated pictures (art/pic): each file exists, is offline in sw.js, stays in the size budget; each key is used by a scene
const swList = readFileSync('sw.js', 'utf8');
const artKeys = new Set();
for (const s of Object.values(SCENES)) { if (typeof s.art === 'string') artKeys.add(s.art); else if (typeof s.art === 'function') for (const m of s.art.toString().matchAll(/\?\s*'([a-z_0-9]+)'|:\s*'([a-z_0-9]+)'/g)) artKeys.add(m[1] || m[2]); } // a function's returned keys only (after ? or :), not every quoted word
const picFiles = new Set();
for (const key of Object.keys(PICTURES)) {
    assert(artKeys.has(key), `v0.11.24: picture key ${key} is an art key some scene shows`);
    for (const form of ['cat', 'tiger', 'human']) { const f = pictureOf(key, form); if (f) picFiles.add(f); } // v0.11.38: '' = code art in that form
}
let picBytes = 0;
for (const f of picFiles) {
    assert(existsSync(f), `v0.11.24: ${f} exists`);
    if (!existsSync(f)) continue;
    const b = statSync(f).size; picBytes += b;
    assert(b <= 150 * 1024, `v0.11.24: ${f} is at most 150 KB (${Math.round(b / 1024)} KB)`);
    assert(new RegExp(`'${f.replace(/[.]/g, '\\.')}': '[0-9a-f]{10}'`).test(swList), `v0.11.39: ${f} is in sw.js ART with a fingerprint (offline, its own cache)`);
}
// v0.11.39 (Z2-b): the cap 8 → 40 MB (the pictures are kept across versions, so the size is paid once); a log line from 25 MB
assert(picBytes <= 40 * 1024 * 1024, `v0.11.39: all pictures together at most 40 MB (${Math.round(picBytes / 1024)} KB)`);
if (picBytes > 25 * 1024 * 1024) console.log(`  NOTE  the pictures total ${(picBytes / 1048576).toFixed(1)} MB (log from 25 MB, the cap 40 MB)`);
assert(readdirSync('art/pic').filter((f) => f.endsWith('.webp')).every((f) => picFiles.has(`art/pic/${f}`)), 'v0.11.24: every file in art/pic is a picture some key shows');
assert(pictureOf('yuki_close', 'cat') === 'art/pic/yuki_cat.webp' && pictureOf('yuki_close', 'tiger') === 'art/pic/yuki_tiger.webp' && pictureOf('yuki_close', 'human') === 'art/pic/yuki_human.webp', 'v0.11.24: yuki_close follows Yuki\'s form');
for (const [form, file] of [['tiger', 'yuki_tiger'], ['human', 'yuki_human'], ['cat', 'yuki_cat']]) { setArtState({ yukiForm: form }); assert(sceneArt('yuki_close').includes(`art/pic/${file}.webp`), `v0.11.24: with Yuki in ${form} form the yuki_close plate shows ${file}`); }
assert(sceneArt('james').includes('data-pic="james"') && sceneArt('james').includes('art/pic/james.webp'), 'v0.11.24: a key with a picture draws the picture');
assert(SCENES.arrival.art === 'james', 'v0.11.24: the arrival shows James');
assert(!sceneArt('envoy').includes('data-pic') && sceneArt('envoy').startsWith('<svg'), 'v0.11.24: a key without a picture keeps its code art (an Act 1 key since v0.11.38)');
// v0.11.38 (P-b; built as the v0.11.26 work in progress): every key of the prologue's art table shows its own picture (file named after the key)
{
    const PROLOGUE_KEYS = 'forest_dawn omnitool clearing bone_needle meditation stream forage hunt camp forest_night jackals jackals_dead herb_girl gao_down ridge village elder healer boar dinner romance collectors collectors_down hairpin tribulation lights rain crows rats lizard gift bone_field mire hollow roof village_night token gao_window arson herb_slope workshop drill wolves'.split(' ');
    assert(PROLOGUE_KEYS.length === 43, `v0.11.38: 43 prologue art keys (${PROLOGUE_KEYS.length})`);
    const artSrc = readFileSync('js/art/art.js', 'utf8');
    const table = artSrc.slice(artSrc.indexOf('const SCENES2 = {'), artSrc.indexOf('/* ---------------- Act 1 ---------------- */'));
    const inTable = [...table.matchAll(/^ {4}(\w+): \{/gm)].map((m) => m[1]);
    assert(inTable.join(' ') === PROLOGUE_KEYS.join(' '), 'v0.11.38: the list is exactly the prologue part of the art table');
    setArtState({ yukiForm: 'cat' });
    for (const k of PROLOGUE_KEYS) {
        assert(pictureOf(k, 'cat') === `art/pic/${k}.webp`, `v0.11.38: ${k} shows art/pic/${k}.webp while Yuki is the cat`);
        assert(sceneArt(k).includes(`data-pic="${k}"`), `v0.11.38: the ${k} plate draws the picture while Yuki is the cat`);
    }
    assert(Object.keys(PICTURES).length === 8 + 42, `v0.11.38: 50 keys have pictures (${Object.keys(PICTURES).length})`);
    assert(!sceneArt('no_such_key').includes('data-pic'), 'v0.11.38: an unknown key still falls back to code art');
}
// v0.11.38 (P-b): the form map. A picture whose recipe draws Yuki as the small cat shows only while she is the cat;
// in tiger or human form the plate is code art (which draws her current form). The list is checked against the recipes, so it cannot drift.
{
    const recipes = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8')).pictures;
    const fileOf = (key) => { const p = PICTURES[key]; return typeof p === 'function' ? null : p; };
    const drawsCat = new Set();
    for (const key of Object.keys(PICTURES)) {
        const file = fileOf(key);
        if (!file || key.startsWith('yuki_')) continue; // yuki_close picks by form; Yuki's own pictures are her forms
        const r = recipes[file];
        assert(r, `v0.11.38: picture ${file} has a recipe`);
        if (r && /\b(white cat|kitten|yuki)\b/i.test(JSON.stringify(r))) drawsCat.add(key);
    }
    assert([...drawsCat].sort().join(' ') === [...YUKI_CAT_ONLY].sort().join(' '), `v0.11.38: YUKI_CAT_ONLY is exactly the pictures whose recipe draws the cat (recipes ${drawsCat.size}, list ${YUKI_CAT_ONLY.size})`);
    assert(YUKI_CAT_ONLY.size === 30, `v0.11.38: 30 pictures draw Yuki as the cat (28 new, james, jackals) (${YUKI_CAT_ONLY.size})`);
    for (const key of Object.keys(PICTURES)) {
        if (key.startsWith('yuki_')) continue;
        for (const form of ['tiger', 'human']) {
            setArtState({ yukiForm: form });
            const art = sceneArt(key);
            if (YUKI_CAT_ONLY.has(key)) {
                assert(pictureOf(key, form) === '' && !art.includes('data-pic') && !art.includes('art/pic/'), `v0.11.38: with Yuki in ${form} form ${key} keeps its code art`);
            } else {
                assert(pictureOf(key, form) === `art/pic/${fileOf(key)}.webp` && art.includes(`data-pic="${key}"`), `v0.11.38: ${key} (no Yuki) shows its picture in ${form} form too`);
            }
        }
    }
    setArtState({ yukiForm: 'cat' });
    assert(sceneArt('james').includes('data-pic="james"'), 'v0.11.38: back to the cat, the arrival shows its picture again');
    // every plate in main.js goes through its wrapper, which sets Yuki's form first (the guarantee behind the form map)
    const mainSrc = readFileSync('js/main.js', 'utf8');
    assert(/const sceneArt = \(key\) => \{ ART\.setArtState\?\.\(\{ yukiForm: yukiForm\(g\) \}\); return ART\.sceneArt\(key\); \};/.test(mainSrc), 'v0.11.38: main.js draws plates through the wrapper that sets Yuki\'s form');
    assert((mainSrc.match(/ART\.sceneArt\(/g) || []).length === 1 && (mainSrc.match(/ART\.pictureOf\(|ART\.PICTURES/g) || []).length === 0, 'v0.11.38: main.js draws no plate around the wrapper');
    assert(typeof setArtState === 'function', 'v0.11.38: art.js still exports setArtState (the wrapper calls it with ?.)');
}

// v0.11.25: the item names the part test fills (tests/lib/items.mjs) are exactly the game's ITEMS
{
    const { PROLOGUE_ITEM_IDS } = await import('./lib/items.mjs');
    const { NEW_ITEMS } = await import('../js/story/common.js'); const { ACT1_ITEMS } = await import('../js/story/act1_common.js');
    const mine = [...new Set([...PROLOGUE_ITEM_IDS, ...Object.keys(NEW_ITEMS), ...Object.keys(ACT1_ITEMS)])].sort().join(' ');
    assert(mine === Object.keys(ITEMS).sort().join(' '), 'v0.11.25: tests/lib/items.mjs names exactly the game\'s items');
}
// v0.11.25 (c): gives() names only real items, so a quoted non-item inside addItem (the 'tiger' in "Let Yuki hunt") is not one
for (const sc of Object.values(SCENES)) for (const c of sc.choices || []) for (const id of gives(c)) assert(!!ITEMS[id], `v0.11.25: ${sc.id}: "${c.text}" gives ${id}, a real item`);
const yhunt = SCENES.lf_hunt.choices.find((c) => c.text.startsWith('Let Yuki hunt'));
assert(gives(yhunt).slice().sort().join(' ') === 'hare_raw venison', `v0.11.25: "Let Yuki hunt" gives hare or venison (now: ${gives(yhunt).join(' ')})`);
{
    const g = ensureBars(newGame(7)); g.scene = 'lf_hunt'; g.minutes = 3 * 1440 + 8 * 60;
    const has = () => sceneView(g, SCENES).choices.some((c) => c.label.startsWith('Let Yuki hunt'));
    assert(has(), 'v0.11.25: "Let Yuki hunt" shows with room in the stock');
    g.inventory.hare_raw = itemCap('hare_raw'); assert(has(), 'v0.11.25: "Let Yuki hunt" still shows with only the hares full');
    g.inventory.venison = itemCap('venison'); assert(!has(), 'v0.11.25: "Let Yuki hunt" hides when hares and venison are both full');
}

// v0.11.25 (b): the Blackroot camp stakes hurt the first night attacker for one night (like the prologue's), from the owner's 03:07 camp save
{
    const raw = readFileSync('saves/2026-11-07-0307-incremental-bl_camp.txt', 'utf8').trim();
    const base = deserialize(gunzipSync(Buffer.from(raw.slice(5), 'base64')).toString('utf8'));
    assert(base.scene === 'bl_camp' && base.flags.bl_stakes_night === true, 'v0.11.25: the 03:07 save is at the camp with the stakes up');
    const fight = SCENES.bl_night_event.choices.find((c) => c.text === 'Fight.');
    const enc = (kind, stakes, hard) => { const g = structuredClone(base); g.flags.bl_ev = kind; g.flags.bl_stakes_night = stakes; g.flags.stakes_hard = hard; return fight.combat(g); };
    // X2: the cut comes after the scaling and the ally floor, so it is exact: max(1, hp − 3), max(1, hp − 4) with bone-meal
    const LINE = { wolves: 'off the stakes already bleeding', drowned: 'walks onto the stakes', serpent: 'comes over the stakes', hawks: 'dives too low over the stakes' };
    for (const kind of ['wolves', 'drowned', 'serpent', 'hawks']) {
        const off = enc(kind, false, false), on = enc(kind, true, false), hard = enc(kind, true, true);
        const h0 = off.enemies[0].hp;
        assert(on.enemies[0].hp === Math.max(1, h0 - 3) && hard.enemies[0].hp === Math.max(1, h0 - 4), `v0.11.25: ${kind}: the stakes cut the first attacker exactly (${h0} → ${on.enemies[0].hp}, ${hard.enemies[0].hp} with bone-meal)`);
        if (kind === 'serpent') assert(hard.enemies[0].hp < on.enemies[0].hp, 'v0.11.25: serpent: bone-meal cuts more than plain stakes');
        assert(JSON.stringify(on.enemies.slice(1)) === JSON.stringify(off.enemies.slice(1)), `v0.11.25: ${kind}: the others are untouched`);
        assert(on.intro.includes(LINE[kind]) && !off.intro.includes('stakes'), `v0.11.25: ${kind}: its own stakes line, only with the stakes up`);
    }
    const g = structuredClone(base); g.scene = 'bl_morning'; SCENES.bl_morning.enter(g);
    assert(g.flags.bl_stakes_night === false, 'v0.11.25: the stakes last one night (cleared in the morning)');
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
