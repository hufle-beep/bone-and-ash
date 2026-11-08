// Run: node tests/data.test.mjs — data integrity (v0.11.7, from Selene's data.test.js).
// Every id the game refers to exists: task-hub scenes and menus, form ids on story choices, items given or needed,
// and every data-* marker in the page has code that reads it (a renamed marker once stuck every Selene player).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { PICTURES, pictureOf, sceneArt, setArtState, YUKI_PICS, YUKI_PIC_FORMS, YUKI_HUMAN_PICS, YUKI_TIGER_PICS } from '../js/art/art.js';
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
assert(!sceneArt('lf_hub').includes('data-pic') && sceneArt('lf_hub').startsWith('<svg'), 'v0.11.24: a key without a picture keeps its code art (an Act 1 key not drawn yet; envoy until v0.11.54, heart_hall until v0.11.58)');
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
    assert(Object.keys(PICTURES).length === 8 + 42 + 20 + 15, `v0.11.58: 85 keys have pictures (50 in v0.11.38; Act 1 push 1 adds 20, push 2 adds 15) (${Object.keys(PICTURES).length})`);
    assert(!sceneArt('no_such_key').includes('data-pic'), 'v0.11.38: an unknown key still falls back to code art');
}
// v0.11.54 (Act 1 art, push 1; owner picks 2026-11-08 A1 F1 Y1 T1): Fallout and the Blackroot, each file named after its key
const ACT1_P1 = 'council envoy palisade ashfall_dawn ya_arrives ya_fight root_road bone_elk root_wyrm drowned_wood drowned_dead mire_serpent drowned_camp hot_spring ashen_hills cinder_hawks rot_ape night_watch trio trio_fire'.split(' ');
const ACT1_YUKI_P1 = 'council ashfall_dawn ya_fight root_road drowned_wood drowned_camp ashen_hills rot_ape night_watch trio_fire'.split(' ');
{
    assert(ACT1_P1.length === 20, `v0.11.54: 20 keys in Act 1 push 1 (${ACT1_P1.length})`);
    const artSrc = readFileSync('js/art/art.js', 'utf8');
    const act1 = artSrc.slice(artSrc.indexOf('/* ---------------- Act 1 ---------------- */'));
    setArtState({ yukiForm: 'cat' });
    for (const k of ACT1_P1) {
        assert(new RegExp(`^ {4}${k}: \\{`, 'm').test(act1), `v0.11.54: ${k} is an Act 1 key of the art table`);
        assert(PICTURES[k] === k && pictureOf(k, 'cat') === `art/pic/${k}.webp` && sceneArt(k).includes(`data-pic="${k}"`), `v0.11.54: ${k} shows art/pic/${k}.webp while Yuki is the cat`);
        // Y1: Yuki is drawn exactly where the key's code art draws her (YU(...))
        const code = act1.slice(act1.search(new RegExp(`^ {4}${k}: \\{`, 'm'))).split(/\n {4}\w+: \{/)[0];
        assert(/YU\(/.test(code) === ACT1_YUKI_P1.includes(k) && YUKI_PICS.has(k) === ACT1_YUKI_P1.includes(k), `v0.11.54 (Y1): ${k} draws Yuki in its picture exactly when its code art does`);
    }
    // Claude's limits (rule 7): the spring shows them to the collarbones, the trio three clothed shadows
    const rec = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8')).pictures;
    assert(/Seen from behind/.test(rec.hot_spring.at(-1).prompt) && /up to their shoulders/.test(rec.hot_spring.at(-1).prompt) && !/nude|naked|breast|bust/i.test(rec.hot_spring.at(-1).prompt), 'v0.11.54: hot_spring shows them from behind, in the water to the shoulders, nothing more');
    // the red-eye fix on drowned_dead is a recorded local step, and the tool exists
    assert(rec.drowned_dead.at(-1).op === 'local' && /eyes\.py/.test(rec.drowned_dead.at(-1).note) && existsSync('tools/art/eyes.py'), 'v0.11.54: drowned_dead\'s red eyes made grey by a recorded local step (tools/art/eyes.py)');
    // after the cold review (owner pick R1): the stray tails painted out (recorded inpaints with their masks), Ya's red eyes grey in trio_fire
    const masks = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8')).masks;
    for (const k of ['drowned_camp', 'rot_ape']) { const st = rec[k].at(-1); assert(st.op === 'inpaint' && masks[st.mask] && st.source === rec[k].at(-2).file, `v0.11.54: ${k}'s stray tail painted out by a recorded inpaint on its picture`); }
    assert(rec.trio_fire.at(-1).op === 'local' && /eyes\.py/.test(rec.trio_fire.at(-1).note), 'v0.11.54: trio_fire\'s red eyes made grey by a recorded local step');
    assert(/fully clothed/.test(rec.trio.at(-1).prompt) && /three black shadow silhouettes/.test(rec.trio.at(-1).prompt), 'v0.11.54: trio is three clothed shadows on a paper door');
}
// v0.11.58 (Act 1 art, push 2; owner picks 2026-11-08 S1 P1 D1 W1): the Heart and the Return, each file named after its key
const ACT1_P2 = 'heart_gate heart_hall heart_roots heart_core guardian seed ship_bridge ship_log ship_wreck return_road seed_planting grove_sprout elder_duel elder_parley a1_end'.split(' ');
const ACT1_YUKI_P2 = 'heart_gate heart_hall heart_roots heart_core guardian ship_bridge ship_wreck return_road grove_sprout a1_end'.split(' ');
{
    assert(ACT1_P2.length === 15, `v0.11.58: 15 keys in Act 1 push 2 (${ACT1_P2.length})`);
    const artSrc = readFileSync('js/art/art.js', 'utf8');
    const act1 = artSrc.slice(artSrc.indexOf('/* ---------------- Act 1 ---------------- */'));
    setArtState({ yukiForm: 'cat' });
    for (const k of ACT1_P2) {
        assert(new RegExp(`^ {4}${k}: \\{`, 'm').test(act1), `v0.11.58: ${k} is an Act 1 key of the art table`);
        assert(PICTURES[k] === k && pictureOf(k, 'cat') === `art/pic/${k}.webp` && sceneArt(k).includes(`data-pic="${k}"`), `v0.11.58: ${k} shows art/pic/${k}.webp while Yuki is the cat`);
        const code = act1.slice(act1.search(new RegExp(`^ {4}${k}: \\{`, 'm'))).split(/\n {4}\w+: \{/)[0];
        assert(/YU\(/.test(code) === ACT1_YUKI_P2.includes(k) && YUKI_PICS.has(k) === ACT1_YUKI_P2.includes(k), `v0.11.58 (Y1): ${k} draws Yuki in its picture exactly when its code art does`);
    }
    const R = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8'));
    const last = (k) => R.pictures[k].find((st) => st.op === 'generate').prompt; // the picture's own prompt (elder_duel adds a repair inpaint after it)
    // S1: Shen Qiu from his portrait (cast `shen`), word for word in both his scenes; W1: Wren Aldous (cast `wren`) as a memory in ship_log
    assert(R.cast.shen && /small black crown/.test(R.cast.shen) && /hands are completely hidden/.test(R.cast.shen) && /eyes calmly shut/.test(R.cast.shen), 'v0.11.58 (S1): Shen Qiu\'s cast is his portrait (black crown, eyes shut, hands in his sleeves)');
    for (const k of ['elder_duel', 'elder_parley']) assert(last(k).includes(R.cast.shen), `v0.11.58 (S1): ${k} draws Shen Qiu from his cast`);
    assert(R.cast.wren && last('ship_log').includes(R.cast.wren) && /as if made of light/.test(last('ship_log')), 'v0.11.58 (W1): ship_log shows Wren Aldous as a memory of light');
    // P1: the parley on the road at the tribute post, as its text says; D1: the duel's standoff, with James's blade of bone
    assert(/tribute post/.test(last('elder_parley')) && !/\btable\b|\btea\b/i.test(last('elder_parley')), 'v0.11.58 (P1): elder_parley is on the road at the tribute post');
    assert(/bone/.test(last('elder_duel')) && /face each other/.test(last('elder_duel')) && !/kneel/i.test(last('elder_duel')), 'v0.11.58 (D1): elder_duel is the standoff, James with a weapon of bone, nobody kneeling');
    // the owner's note (02:26-02:27): the seed-ship is an original organic starship of grown wood, never a copy of a named design
    assert(/starship grown from living pale wood/.test(last('ship_wreck')) && !/white star(?!s)|moya|babylon|farscape/i.test(JSON.stringify(R)), 'v0.11.58: ship_wreck is an original grown-wood starship; no named design in any recipe');
    for (const k of ACT1_P2) assert(!/nude|naked|breast|bust/i.test(last(k)), `v0.11.58: ${k}'s prompt asks for nothing unclothed`);
    // after the cold review (owner pick R2): the rename table maps every Act 1 picture's last file to its key (a wrong name failed nothing before)
    // after the cold review (owner pick R2): Mei Lin (and Ya) drawn as grown women where she had looked young; elder_duel's poles painted out by a recorded inpaint on its picture
    for (const k of ['a1_end', 'return_road', 'ship_wreck']) assert(/a tall grown village herbalist woman of twenty-six/.test(last(k)), `v0.11.58: ${k} draws Mei Lin as a grown woman`);
    assert(/grown woman in her twenties, an adult as tall as the man/.test(last('ship_wreck')), 'v0.11.58: ship_wreck draws Ya as a grown woman too');
    { const st = R.pictures.elder_duel.at(-1); assert(st.op === 'inpaint' && R.masks[st.mask] && st.source === R.pictures.elder_duel.at(-2).file, 'v0.11.58: elder_duel\'s leftover poles painted out by a recorded inpaint on its picture'); }
    for (const k of [...ACT1_P1, ...ACT1_P2]) assert(R.palette.rename[R.pictures[k].at(-1).file] === k, `v0.11.58: palette.rename maps ${k}'s last file (${R.pictures[k].at(-1).file}) to ${k}`);
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
    assert([...drawsCat].sort().join(' ') === [...YUKI_PICS].sort().join(' '), `v0.11.38: YUKI_PICS is exactly the pictures whose recipe draws the cat (recipes ${drawsCat.size}, list ${YUKI_PICS.size})`);
    assert(YUKI_PICS.size === 49, `v0.11.58: 49 pictures draw Yuki (29 since v0.11.49; Act 1 push 1 adds 10, push 2 adds 10) (${YUKI_PICS.size})`);
    assert(!YUKI_PICS.has('ridge') && pictureOf('ridge', 'tiger') === 'art/pic/ridge.webp' && pictureOf('ridge', 'human') === 'art/pic/ridge.webp', 'v0.11.49: ridge shows the landscape without Yuki in every form');
    // v0.11.49 (Y3, part 1): the great-cat versions. v0.11.50 (Y3 part 2a): human for 15 keys; v0.11.51 (part 2b): all 29
    assert([...YUKI_PIC_FORMS].join(' ') === 'cat tiger human', `v0.11.50: Yuki's pictures exist for the cat, the great cat and the human (${[...YUKI_PIC_FORMS]})`);
    assert(YUKI_HUMAN_PICS.size === 29 && [...YUKI_HUMAN_PICS].every((k) => YUKI_PICS.has(k)), `v0.11.51: the prologue's 29 keys of YUKI_PICS have a human picture (${YUKI_HUMAN_PICS.size})`);
    // v0.11.54 (pick F1): the great cat is gated like the human form; the prologue's 29 have both, Act 1's keys only the cat until push 4
    assert([...YUKI_TIGER_PICS].sort().join(' ') === [...YUKI_HUMAN_PICS].sort().join(' '), `v0.11.54: the great-cat list is the prologue's 29 (${YUKI_TIGER_PICS.size})`);
    assert([...YUKI_PICS].filter((k) => !YUKI_TIGER_PICS.has(k)).sort().join(' ') === [...ACT1_YUKI_P1, ...ACT1_YUKI_P2].sort().join(' '), 'v0.11.58: the Yuki keys without a great-cat picture are exactly Act 1 push 1\'s ten and push 2\'s ten');
    const drawnIn = (key, form) => YUKI_PIC_FORMS.has(form) && (form !== 'human' || YUKI_HUMAN_PICS.has(key)) && (form !== 'tiger' || YUKI_TIGER_PICS.has(key));
    for (const key of Object.keys(PICTURES)) {
        if (key.startsWith('yuki_')) continue;
        for (const form of ['tiger', 'human']) {
            setArtState({ yukiForm: form });
            const art = sceneArt(key);
            if (YUKI_PICS.has(key) && drawnIn(key, form)) {
                const f = `${fileOf(key)}_${form}`;
                assert(pictureOf(key, form) === `art/pic/${f}.webp` && art.includes(`data-pic="${key}"`) && art.includes(`art/pic/${f}.webp`), `v0.11.49: with Yuki in ${form} form ${key} shows ${f}`);
                const r = recipes[f];
                if (form === 'tiger') assert(r && /great cat|white tiger/i.test(JSON.stringify(r)) && !/small white cat/i.test(r[r.length - 1].prompt || ''), `v0.11.49: ${f} has a recipe whose last step draws the great cat`);
                else assert(r && r.some((st) => /cat ears/.test(st.prompt || '') && /qipao/.test(st.prompt || '')) && !/white cat with|great cat|white tiger/i.test(JSON.stringify(r)), `v0.11.50: ${f} has a recipe that draws her human form (cat ears, the qipao) and no cat`);
            } else if (YUKI_PICS.has(key)) {
                assert(pictureOf(key, form) === '' && !art.includes('data-pic') && !art.includes('art/pic/'), `v0.11.38: with Yuki in ${form} form ${key} keeps its code art (no ${form} picture yet)`);
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

// v0.11.51 (Y3 part 2b, owner pick C1): the code-art human Yuki (Act 1's code-art scenes, the form-change plate) has no red choker
{
    const C2 = await import('../js/art/clamp2.js');
    const svg = C2.yukiHuman(0, 0);
    const reds = svg.match(new RegExp(`<path [^>]*${C2.RED}[^>]*>`, 'g')) || [];
    assert(reds.length === 1 && !svg.includes(`fill="${C2.RED}"`), `v0.11.51: the code-art human Yuki's only red is her mouth (no choker, no knot) (${reds.length} red paths)`);
    const close = C2.yukiHumanCloseUp('t');
    assert(close.includes('<path') && !close.includes(C2.RED), 'v0.11.51: the code-art human close-up draws no red at all (its only red was the choker and knot)');
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
