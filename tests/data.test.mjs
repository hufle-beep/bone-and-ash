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
// v0.11.63 (push 5b): the 21 size redraws replaced their pictures' recipes; the earlier blocks' prompt checks skip them (the v0.11.63 block checks them)
const R5B = (f) => JSON.parse(readFileSync('tools/art/recipes.json', 'utf8')).pictures[f].some((st) => st.file.startsWith('b5_'));

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
const HUB_CARDS = {"camp":"yk_time","stream":"forage hunt yk_time","wilds":"menu:wild_explore menu:wild_forage menu:wild_hunt menu:wild_train yk_time","village":"heal village_hunt yk_time","ashfall":"far_hunt heal herb_slopes menu:clinic menu:drill menu:workshop mother_time scout village_hunt wen_lesson wen_time yk_time","fo_ashfall":"fo_mei fo_mother fo_spy fo_ya_time menu:fo_clinic menu:fo_council menu:fo_drill menu:fo_palisade mother_time wen_time yk_time","rr_hub":"menu:bl_train menu:rr_forage menu:rr_scout rr_hunt rr_roots talk_mei talk_ya ya_mocks yk_time","dw_hub":"dw_hunt dw_scout hot_spring menu:bl_train menu:dw_forage talk_mei talk_ya yk_time","ah_hub":"ah_hunt ah_scout menu:ah_forage menu:bl_train talk_mei talk_ya trio_kiss ya_offended yk_time","heart_hub":"hall_listen heart_spring ring_chambers sect_cut yk_time","rt_camp":"rt_fire_talk rt_watch yk_time","rt_ashfall":"menu:rt_hunters mother_time rt_council rt_grove rt_ya_village wen_time yk_time","lf_hub":"menu:lf_forage menu:lf_hunt menu:lf_train menu:lf_trials yk_time"}; // v0.11.137 (TR1, YB): yk_time on every resting place; v0.11.139 (MW1, MS): wen_time and mother_time on Ashfall's three
for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
    const targets = new Set((SCENES[hub]?.choices || []).map((c) => c.to).filter((t) => typeof t === 'string'));
    for (const d of cfg.doors || []) assert(targets.has(d), `v0.11.21: ${hub}: door ${d} is a choice on the hub`);
    const now = [...(cfg.doors || []), ...Object.keys(cfg.doorMenus || {}).map((m) => 'menu:' + m), ...Object.keys(cfg.menus || {}).map((m) => 'menu:' + m)].sort().join(' ');
    assert(now === HUB_CARDS[hub], `v0.11.21: ${hub}'s doors and menus are the pinned ones (now: ${now || 'none'}; pinned: ${HUB_CARDS[hub] ?? 'not listed'})`);
}
assert(Object.keys(HUB_CARDS).every((h) => TASK_HUBS[h]), 'v0.11.21: every pinned hub is still a task hub');
// v0.11.67 (owner pick F1, one hub format): no gate cards. A hub choice that opens a screen of its own work (two or more
// of its choices come back to it: a forage, hunt or practice menu) is a menu on the hub's list (or a door menu), never a
// story card or a door. Not menus: the camps (the night) and the Story Mode meridian screen (unreachable since v0.11.41).
{
    const NOT_MENUS = new Set(['camp', 'bl_camp', 'meridians']);
    for (const [hub, cfg] of Object.entries(TASK_HUBS)) {
        const folded = new Set([...Object.keys(cfg.menus || {}), ...Object.keys(cfg.doorMenus || {})]);
        for (const c of SCENES[hub].choices) {
            const y = c.to;
            if (typeof y !== 'string' || y === hub || !SCENES[y] || NOT_MENUS.has(y)) continue;
            const loops = (SCENES[y].choices || []).filter((d) => d.to === y).length;
            if (loops >= 2) assert(folded.has(y), `v0.11.67 (F1): ${hub}: "${typeof c.text === 'string' ? c.text : y}" opens a gate screen (${y}); fold it into the list`);
        }
    }
    assert(['rr_hub', 'dw_hub', 'ah_hub'].every((h) => TASK_HUBS[h].menus.bl_train?.label === 'Practice' && !TASK_HUBS[h].doors.includes('bl_train')), 'v0.11.67 (F1): the Blackroot\'s Train is a Practice group on the list');
    assert(TASK_HUBS.lf_hub.doorMenus?.lf_trials?.label === 'Go deep' && ['lf_forage', 'lf_hunt', 'lf_train'].every((m) => TASK_HUBS.lf_hub.menus[m]), 'v0.11.67 (F1): the Long Forest\'s Forage, Hunt, Train and Go deep are on the list');
}

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
// v0.11.61: every scene's key has a picture in every form of Yuki now, so the code-art case is a key with no picture (the quiet forest)
for (const form of ['cat', 'tiger', 'human']) { setArtState({ yukiForm: form }); assert(!sceneArt('no_such_key').includes('data-pic') && sceneArt('no_such_key').startsWith('<svg'), `v0.11.24: a key without a picture keeps its code art (${form}; envoy until v0.11.54, heart_hall until v0.11.58, lf_hub until v0.11.59, council's great cat until v0.11.60, council as human until v0.11.61)`); }
setArtState({ yukiForm: 'cat' });
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
    assert(Object.keys(PICTURES).length === 8 + 42 + 20 + 15 + 11, `v0.11.59: 96 keys have pictures (50 in v0.11.38; Act 1 push 1 adds 20, push 2 adds 15, push 3 adds 8, the 2 missed camps and yuki_form) (${Object.keys(PICTURES).length})`);
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
    for (const k of ['drowned_camp', 'rot_ape'].filter((k) => !R5B(k))) { const st = rec[k].at(-1); assert(st.op === 'inpaint' && masks[st.mask] && st.source === rec[k].at(-2).file, `v0.11.54: ${k}'s stray tail painted out by a recorded inpaint on its picture`); }
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
    for (const k of ['a1_end', 'return_road', 'ship_wreck'].filter((k) => !R5B(k))) assert(/a tall grown village herbalist woman of twenty-six/.test(last(k)), `v0.11.58: ${k} draws Mei Lin as a grown woman`);
    assert(R5B('ship_wreck') || /grown woman in her twenties, an adult as tall as the man/.test(last('ship_wreck')), 'v0.11.58: ship_wreck draws Ya as a grown woman too');
    { const st = R.pictures.elder_duel.at(-1); assert(st.op === 'inpaint' && R.masks[st.mask] && st.source === R.pictures.elder_duel.at(-2).file, 'v0.11.58: elder_duel\'s leftover poles painted out by a recorded inpaint on its picture'); }
    for (const k of [...ACT1_P1, ...ACT1_P2]) assert(R.palette.rename[R.pictures[k].at(-1).file] === k, `v0.11.58: palette.rename maps ${k}'s last file (${R.pictures[k].at(-1).file}) to ${k}`);
}
// v0.11.59 (Act 1 art, push 3; owner picks 2026-11-08 L2 B2 S1): the Long Forest, each file named after its key, in all three of Yuki's forms
const LF_P3 = 'lf_hub lf_seclusion lf_bone_depths lf_black_mire lf_thunder_ridge lf_old_roots lf_bandits lf_rogue'.split(' ');
{
    const artSrc = readFileSync('js/art/art.js', 'utf8');
    const R = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8'));
    const gen = (f) => R.pictures[f].find((st) => st.op === 'generate').prompt;
    // O3: every Act 1 art key a scene shows has a picture; bl_camp's Root Road and Ashen Hills camps were missed in push 1
    assert(/rr: 'root_camp', dw: 'drowned_camp', ah: 'ashen_camp'/.test(SCENES.bl_camp.art.toString()), 'v0.11.59 (O3): bl_camp shows a camp per region');
    for (const k of ['root_camp', 'drowned_camp', 'ashen_camp']) assert(PICTURES[k] === k && YUKI_PICS.has(k), `v0.11.59 (O3): ${k} has a picture with Yuki`);
    for (const k of [...LF_P3, 'root_camp', 'ashen_camp']) {
        assert(new RegExp(`^ {4}${k}: \\{`, 'm').test(artSrc.slice(artSrc.indexOf('/* ---------------- Act 1 ---------------- */'))), `v0.11.59: ${k} is an Act 1 or Long Forest key of the art table`);
        const code = artSrc.slice(artSrc.search(new RegExp(`^ {4}${k}: \\{`, 'm'))).split(/\n {4}\w+: \{/)[0];
        assert(/YU\(/.test(code) && YUKI_PICS.has(k) && YUKI_TIGER_PICS.has(k) && YUKI_HUMAN_PICS.has(k), `v0.11.59 (L2): ${k}'s code art draws Yuki, and its picture exists in all three forms`);
        for (const [form, f] of [['cat', k], ['tiger', `${k}_tiger`], ['human', `${k}_human`]]) {
            setArtState({ yukiForm: form });
            assert(pictureOf(k, form) === `art/pic/${f}.webp` && sceneArt(k).includes(`data-pic="${k}"`), `v0.11.59: with Yuki in ${form} form ${k} shows ${f}.webp`);
            assert(R.palette.rename[R.pictures[f].at(-1).file] === f, `v0.11.59: palette.rename maps ${f}'s last file (${R.pictures[f].at(-1).file}) to ${f}`);
            const pr = gen(f);
            if (R5B(f)) continue;
            assert(pr.includes(R.cast.james_shaggy) && !/nude|naked|breast|bust|bath|bare (?:chest|skin)/i.test(pr), `v0.11.59: ${f} draws James as james_shaggy and asks for nothing unclothed`);
            assert(form !== 'cat' || pr.includes(R.cast.yuki), `v0.11.59: ${f} draws the cat from her cast`);
            assert(form !== 'human' || (pr.includes(R.cast.yuki_human) && pr.startsWith(R.styles.pc)), `v0.11.59: ${f} draws her human form from her cast, in the pc style`);
        }
    }
    setArtState({ yukiForm: 'cat' });
    // B2: the trail scenes show whom you met; the Tan brothers and Fang Wei from their casts
    const { LONGFOREST } = await import('../js/story/longforest.js');
    for (const id of ['lf_wanderers', 'lf_human_talked', 'lf_human_won', 'lf_human_lost']) {
        const art = (who) => (typeof LONGFOREST[id].art === 'function' ? LONGFOREST[id].art({ flags: { lf_human: who } }) : LONGFOREST[id].art); // after the cold review: a plain key fails cleanly, not with a TypeError
        assert(art('lf_rogue') === 'lf_rogue', `v0.11.59 (B2): ${id} shows Fang Wei after meeting him`);
        assert(art('lf_bandits') === 'lf_bandits', `v0.11.59 (B2): ${id} shows the Tan brothers after meeting them`);
    }
    assert(R.cast.tan && R.cast.fang && gen('lf_bandits').includes(R.cast.tan) && gen('lf_rogue').includes(R.cast.fang) && /crimson sect robes/.test(R.cast.fang) && /straw sandals/.test(R.cast.tan), 'v0.11.59 (B2): the Tan brothers (in period clothes) and Fang Wei (crimson robes) drawn from their casts');
    // after the cold review (owner pick R3): Ya drawn clearly as a woman in the human camps; Fang Wei's lotus picked off in every form
    for (const k of ['root_camp_human', 'ashen_camp_human'].filter((k) => !R5B(k))) assert(/clearly a woman, with a feminine face/.test(gen(k)), `v0.11.59 (R3): ${k} draws Ya clearly as a woman`);
    assert(R.pictures.lf_rogue[0].seed === 55 && (R5B('ashen_camp') || R.pictures.ashen_camp[0].seed === 44), 'v0.11.59 (R3): lf_rogue (cat) is seed 55, the lotus picked off; ashen_camp (cat) seed 44, no floating speck');
    // S1: one seclusion picture for every season, the cave behind the falls
    assert(/cave behind a waterfall/.test(gen('lf_seclusion')) && !/snow|spring|summer|autumn|winter/i.test(gen('lf_seclusion')), 'v0.11.59 (S1): lf_seclusion is the cave behind the falls, in no season');
    // the form chooser shows her portrait in her current form, as yuki_close
    for (const form of ['cat', 'tiger', 'human']) assert(pictureOf('yuki_form', form) === pictureOf('yuki_close', form), `v0.11.59: yuki_form shows her ${form} portrait, as yuki_close`);
}
// v0.11.60 (Act 1 art, push 4a; owner picks 2026-11-08 M1 + P2): the great-cat version of Act 1's 20 Yuki keys, each a fresh picture from its cat prompt
{
    const R = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8'));
    const gen = (f) => R.pictures[f].find((st) => st.op === 'generate').prompt;
    const T = 'one single ' + R.cast.yuki_tiger.slice(2);
    for (const k of [...ACT1_YUKI_P1, ...ACT1_YUKI_P2]) {
        const f = `${k}_tiger`;
        assert(YUKI_TIGER_PICS.has(k), `v0.11.60: ${k} has its great-cat picture (human since v0.11.61)`);
        setArtState({ yukiForm: 'tiger' });
        assert(pictureOf(k, 'tiger') === `art/pic/${f}.webp` && sceneArt(k).includes(`data-pic="${k}"`) && sceneArt(k).includes(`art/pic/${f}.webp`), `v0.11.60: with Yuki the great cat ${k} shows ${f}.webp`);
        setArtState({ yukiForm: 'cat' });
        assert(pictureOf(k, 'cat') === `art/pic/${k}.webp`, `v0.11.60: with Yuki the cat ${k} still shows ${k}.webp`);
        assert(R.palette.rename[R.pictures[f].at(-1).file] === f, `v0.11.60: palette.rename maps ${f}'s last file (${R.pictures[f].at(-1).file}) to ${f}`);
        const pr = gen(f), cat = gen(k);
        if (R5B(f)) continue;
        assert(pr.includes(T) && !pr.includes(R.cast.yuki) && !/small white cat|on his shoulder|in his lap|on the table beside his hand/.test(pr), `v0.11.60: ${f} draws her once as the great cat from her cast, beside James (no shoulder, lap or table)`);
        assert(pr.includes(R.cast.james_shaggy) === cat.includes(R.cast.james_shaggy) && pr.slice(0, 200) === cat.slice(0, 200), `v0.11.60: ${f} keeps the cat picture's style and James (grove_sprout has no James)`);
        assert(!/nude|naked|breast|bust|bath|bare (?:chest|skin)/i.test(pr), `v0.11.60: ${f}'s prompt asks for nothing unclothed`);
    }
    // the second prompts: the ape far off, the guardian's doorway of rib bones (no modern door), a1_end among thatched huts with Ya clearly a woman
    assert(R5B('rot_ape_tiger') || /a hundred paces away/.test(gen('rot_ape_tiger')) && /seen from behind/.test(gen('rot_ape_tiger')), 'v0.11.60: rot_ape_tiger has the ape far off, the three seen from behind');
    assert(/no doors/.test(gen('guardian_tiger')) && /ribs of bone/.test(gen('guardian_tiger')) && !/open door/.test(gen('guardian_tiger')), 'v0.11.60: guardian_tiger has a doorway of rib bones, no door');
    assert(/thatched mud-walled huts/.test(gen('a1_end_tiger')) && /black and empty/.test(gen('a1_end_tiger')) && /clearly a woman, with a feminine face/.test(gen('a1_end_tiger')) && !/village street/.test(gen('a1_end_tiger')), 'v0.11.60: a1_end_tiger among thatched huts under an empty sky, Ya clearly a woman');
    // after the cold review (owner pick R2): return_road without the modern heels, ya_fight without the towers and marks behind them
    assert(/long dark trousers and plain dark cloth shoes/.test(gen('return_road_tiger')) && R.pictures.return_road_tiger[0].file === 'a1t_return_road2_s77', 'v0.11.60 (R2): return_road_tiger redrawn, Mei Lin in trousers and cloth shoes');
    assert(/Behind the fence the background is a wall of dark tree trunks and leaves/.test(gen('ya_fight_tiger')) && R.pictures.ya_fight_tiger[0].file === 'a1t_ya_fight2_s77', 'v0.11.60 (R2): ya_fight_tiger redrawn against a wall of trees');
    // red eyes made grey by a recorded local step on the generated picture
    for (const k of ['ship_wreck_tiger', 'a1_end_tiger'].filter((k) => !R5B(k))) { const st = R.pictures[k].at(-1); assert(st.op === 'local' && /eyes\.py/.test(st.note) && st.source === R.pictures[k].at(-2).file && st.spec.boxes.length >= 2, `v0.11.60: ${k}'s red eyes made grey by a recorded local step`); }
}
// v0.11.61 (Act 1 art, push 4b; owner picks 2026-11-08 N1 + F1 + P1): the human version of Act 1's 20 Yuki keys, style pc, cast yuki_human
{
    const R = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8'));
    const gen = (f) => R.pictures[f].find((st) => st.op === 'generate').prompt;
    const H = R.cast.yuki_human + ', her long snow-white cat tail hanging behind her';
    const MEI = 'wearing a patched jacket with a crossed Chinese collar and a red sash, long dark trousers and plain dark cloth shoes';
    const YA = 'clearly a woman, with a soft feminine face, full red lips, long eyelashes, a narrow waist and a slender woman\'s figure';
    for (const k of [...ACT1_YUKI_P1, ...ACT1_YUKI_P2]) {
        const f = `${k}_human`;
        assert(YUKI_HUMAN_PICS.has(k) && YUKI_TIGER_PICS.has(k), `v0.11.61: ${k} has its human and its great-cat picture`);
        setArtState({ yukiForm: 'human' });
        assert(pictureOf(k, 'human') === `art/pic/${f}.webp` && sceneArt(k).includes(`data-pic="${k}"`) && sceneArt(k).includes(`art/pic/${f}.webp`), `v0.11.61: with Yuki human ${k} shows ${f}.webp`);
        setArtState({ yukiForm: 'cat' });
        assert(pictureOf(k, 'cat') === `art/pic/${k}.webp` && pictureOf(k, 'tiger') === `art/pic/${k}_tiger.webp`, `v0.11.61: ${k}'s cat and great-cat pictures unchanged`);
        assert(R.palette.rename[R.pictures[f].at(-1).file] === f, `v0.11.61: palette.rename maps ${f}'s last file (${R.pictures[f].at(-1).file}) to ${f}`);
        const pr = gen(f), cat = gen(`${k}_tiger`);
        if (R5B(f)) continue;
        assert(pr.startsWith(R.styles.pc), `v0.11.61: ${f} is drawn in the pc style (N1: heart_core and grove_sprout too)`);
        assert(pr.split(R.cast.yuki_human).length === 2 && !pr.includes(R.cast.yuki) && !pr.includes(R.cast.yuki_tiger) && pr.includes(H), `v0.11.61: ${f} draws her once from cast yuki_human, her tail named white, no cat`);
        assert(R5B(`${k}_tiger`) || pr.includes(R.cast.james_shaggy) === cat.includes(R.cast.james_shaggy), `v0.11.61: ${f} has James exactly when the great-cat picture does (grove_sprout has none)`);
        if (pr.includes(R.cast.james_shaggy) && !['ya_fight', 'heart_roots'].includes(k)) assert(pr.includes('she is a head shorter than him'), `v0.11.61: ${f} makes her a head shorter than James (not in ya_fight and heart_roots, where she stands apart from him)`);
        if (/herbalist/.test(pr)) assert(pr.includes(MEI) && /a tall grown village herbalist woman of twenty-six/.test(pr), `v0.11.61: ${f}'s Mei Lin is grown, in trousers and cloth shoes`);
        if (/fierce grin/.test(pr)) assert(/a tall rangy wild grown woman in her twenties, clearly a woman/.test(pr) && /barefoot/.test(pr), `v0.11.61: ${f}'s Ya is grown, clearly a woman, barefoot`);
        if (/herbalist/.test(pr) && /fierce grin/.test(pr)) assert(/four [a-z ]*?,? three women and one man, each clearly separate/i.test(pr), `v0.11.61: ${f} counts four adults where the cat had three`);
        assert(!/nude|naked|breast|bust|bath|bare (?:chest|skin)/i.test(pr), `v0.11.61: ${f}'s prompt asks for nothing unclothed`);
    }
    // the stronger woman wording for Ya, used for every key after the test sheet (council, trio_fire, heart_core were drawn before; trio_fire's Ya kept the earlier wording)
    for (const k of ['ya_fight', 'root_road', 'drowned_wood', 'drowned_camp', 'ashen_hills', 'rot_ape', 'night_watch', 'heart_gate', 'heart_hall', 'heart_roots', 'guardian', 'ship_bridge', 'ship_wreck', 'return_road', 'a1_end'].filter((k) => !R5B(`${k}_human`))) assert(gen(`${k}_human`).includes(YA), `v0.11.61: ${k}_human's Ya has the stronger woman wording`);
    // F1: rot_ape with Mei Lin and James crouching; ship_wreck with Ya grown among four adults
    assert(R5B('rot_ape_human') || /herbalist/.test(gen('rot_ape_human')) && /crouching low/.test(gen('rot_ape_human')) && /a hundred paces away/.test(gen('rot_ape_human')), 'v0.11.61 (F1): rot_ape_human has Mei Lin, the four crouching, the ape a hundred paces off');
    assert(R5B('ship_wreck_human') || /four adults stand side by side/.test(gen('ship_wreck_human')), 'v0.11.61 (F1): ship_wreck_human has the four side by side');
    // second and third prompts where the first ones failed (Ya male, Mei Lin male, a missing Mei Lin, a second Yuki)
    // after the cold review (owner pick R2): guardian without heels, heart_roots without the wire, root_road without the marks, ship_wreck with Ya barefoot (and no local step)
    for (const [f, file] of [['guardian_human', 'a1h_guardian_s44'], ['heart_roots_human', 'a1h_heart_roots_s55'], ['root_road_human', 'a1h_root_road_s55'], ['ship_wreck_human', 'a1h_ship_wreck_s44']].filter(([f]) => !R5B(f))) assert(R.pictures[f].length === 1 && R.pictures[f][0].file === file, `v0.11.61 (R2): ${f} is ${file}, one step`);
    for (const [f, file] of [['ya_fight_human', 'a1h_ya_fight2_s66'], ['drowned_camp_human', 'a1h_drowned_camp2_s88'], ['heart_hall_human', 'a1h_heart_hall3_s88'], ['a1_end_human', 'a1h_a1_end3_s88']]) assert(R.pictures[f][0].file === file, `v0.11.61: ${f} is drawn from ${file}`);
    assert(/clearly a woman, with a soft feminine face, full lips/.test(gen('a1_end_human')) && /clearly a woman, with a soft feminine face, full lips/.test(gen('heart_hall_human')), 'v0.11.61: a1_end and heart_hall give Mei Lin the woman wording too');
    // the local step: a1_end Ya's red eyes grey (her scar kept)
    for (const k of ['a1_end_human']) { const st = R.pictures[k].at(-1); assert(st.op === 'local' && /eyes\.py/.test(st.note) && st.source === R.pictures[k].at(-2).file && st.spec.boxes.length >= 1, `v0.11.61: ${k} has a recorded local step on its picture (since v0.11.62 on the patched picture)`); }
}
// v0.11.62 (the second round of small fixes, push 5a; owner picks 2026-11-08 P1 + A1 + B1 + M1, pictures 09:12): 15 pictures fixed by
// inpaints on the approved picture and a recorded local step (tools/art/patch.py: the inpaints pasted through their masks, copies of
// the wall beside a stray object, a white moon, board shutters, a black tail made white); gift_human redrawn with the two apart
{
    const R = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8'));
    const FIXED = ['mire_human', 'rats_human', 'forest_dawn_human', 'gift_human', 'jackals_dead_human', 'ashfall_dawn_human', 'a1_end_human', 'a1_end_tiger', 'lf_black_mire_tiger', 'heart_roots_tiger', 'heart_hall_human', 'ya_arrives', 'ya_fight', 'ya_fight_human', 'lf_bandits_tiger'];
    assert(existsSync('tools/art/patch.py'), 'v0.11.62: tools/art/patch.py exists');
    const files = new Set();
    for (const k of FIXED) {
        const steps = R.pictures[k];
        assert(steps && existsSync(`art/pic/${k}.webp`), `v0.11.62: ${k} has its recipe and picture`);
        assert(R.palette.rename[steps.at(-1).file] === k && Object.entries(R.palette.rename).filter(([, v]) => v === k).length === 1, `v0.11.62: palette.rename maps ${k}'s last file (${steps.at(-1).file}) to ${k}, and only that file`);
        const base = steps.find((st) => st.op === 'generate' || st.op === 'inpaint').file;
        for (const st of steps) {
            files.add(st.file);
            if (st.op === 'inpaint' && st.file.startsWith('f5_')) assert(R.masks[st.mask] && st.source === base && st.why && /v0\.11\.62/.test(st.why), `v0.11.62: ${k}'s inpaint ${st.file} has its mask, runs on the approved picture (${base}) and says why`);
            if (st.op === 'local' && /patch\.py/.test(st.note)) {
                assert(st.source === base && st.file === `f5_${k}_patch`, `v0.11.62: ${k}'s patch step runs on the approved picture`);
                for (const L of st.spec.layers || []) assert(R.masks[L.mask] && steps.some((x) => x.op === 'inpaint' && `${x.file}_00001_` === L.file && x.mask === L.mask), `v0.11.62: ${k}'s patch layer ${L.file} is a recorded inpaint with the same mask`);
                for (const C of st.spec.copies || []) assert(C.to[2] - C.to[0] > 0 && C.to[3] - C.to[1] > 0 && C.from[0] + C.to[2] - C.to[0] <= 1280 && C.from[1] + C.to[3] - C.to[1] <= 800, `v0.11.62: ${k}'s copy from ${C.from} fits in the picture`);
            }
        }
        for (const st of steps) assert(!/nude|naked|breast|bust|bath|bare (?:chest|skin)/i.test(st.prompt || ''), `v0.11.62: ${k}'s ${st.file} asks for nothing unclothed`);
    }
    const used = new Set(Object.values(R.pictures).flat().flatMap((st) => [st.mask, ...((st.spec && st.spec.layers) || []).map((L) => L.mask)]));
    assert(Object.keys(R.masks).filter((m) => m.startsWith('f5_')).every((m) => used.has(m)), 'v0.11.62: every f5_ mask is used by a recorded step');
    const patchOf = (k) => R.pictures[k].find((st) => st.op === 'local' && /patch\.py/.test(st.note));
    // cold review: every f5_ inpaint of a picture with a patch step is pasted by it (a dropped layer failed nothing)
    for (const k of FIXED) { const p = patchOf(k); if (p) for (const st of R.pictures[k].filter((x) => x.op === 'inpaint' && x.file.startsWith('f5_'))) assert((p.spec.layers || []).some((L) => L.file === `${st.file}_00001_`), `v0.11.62: ${k}'s patch step pastes its inpaint ${st.file}`); }
    // what each fix is
    assert(patchOf('mire_human').spec.tails.length === 1 && patchOf('rats_human').spec.tails.length === 1, 'v0.11.62: mire and rats (human) have their black tails made white');
    assert(/snow-white cat tail/.test(R.pictures.forest_dawn_human.at(-1).prompt) && R.pictures.forest_dawn_human.at(-1).mask === 'f5_fd_tail', 'v0.11.62: forest_dawn_human\'s tail repainted joined to her');
    assert(R.pictures.gift_human.length === 1 && R.pictures.gift_human[0].file === 'f5_gift4_s55' && /Behind his head, at the right edge of the picture, kneels/.test(R.pictures.gift_human[0].prompt) && R.pictures.gift_human[0].prompt.includes(R.cast.yuki_human) && /snow-white cat tail/.test(R.pictures.gift_human[0].prompt), 'v0.11.62: gift_human redrawn with her kneeling apart from him, her tail white');
    assert(/cat ears/.test(R.pictures.jackals_dead_human.at(-1).prompt) && /whole and sharp at the tips/.test(R.pictures.jackals_dead_human.at(-1).prompt), 'v0.11.62: jackals_dead_human\'s ear tips repainted');
    assert(patchOf('ashfall_dawn_human').spec.layers.length === 2 && patchOf('ashfall_dawn_human').spec.copies.length >= 3 && R.pictures.ashfall_dawn_human.some((st) => /bright red cloth sash/.test(st.prompt || '')) && R.pictures.ashfall_dawn_human.some((st) => /shutter of dark wooden boards/.test(st.prompt || '')), 'v0.11.62: ashfall_dawn_human: shuttered huts, the red sash, the knob and windows covered');
    { const p = patchOf('a1_end_human').spec; assert(p.layers.length === 2 && p.copies.length >= 4 && p.discs.length === 1 && R.pictures.a1_end_human.some((st) => /clearly a woman/.test(st.prompt || '') && st.mask === 'f5_end_ya'), 'v0.11.62: a1_end_human: Ya clearly a woman, Mei Lin\'s cheek, the windows and knobs covered, a white moon'); }
    assert(patchOf('a1_end_tiger').spec.copies.length >= 7 && R.pictures.a1_end_tiger.some((st) => /bare ankles/.test(st.prompt || '')), 'v0.11.62: a1_end_tiger: the windows and lantern covered, Ya barefoot');
    for (const k of ['heart_hall_human', 'ya_arrives']) assert(R.pictures[k].some((st) => st.file.startsWith('f5_') && /leather trousers/.test(st.prompt || '') && /bare (?:ankles|feet)/.test(st.prompt || '')), `v0.11.62: ${k}: Ya in trousers and barefoot, not boots`);
    assert(patchOf('ya_arrives').spec.shutters.length >= 8, 'v0.11.62: ya_arrives\'s glass windows closed with shutters (owner 09:12)');
    assert(R.pictures.ya_fight_human.some((st) => /scar line on one cheek only/.test(st.prompt || '')) && R.pictures.ya_fight_human.some((st) => /bone point/.test(st.prompt || '')), 'v0.11.62: ya_fight_human: Ya\'s scar, a bone spear point');
    assert(patchOf('heart_roots_tiger').spec.copies.length === 1, 'v0.11.62: heart_roots_tiger\'s curl covered');
    // the five pictures redrawn in push 5b keep their pictures for now (B1, owner 09:12)
    for (const k of ['guardian', 'ashen_hills', 'rot_ape', 'ship_wreck', 'grove_sprout']) assert(!Object.values(R.pictures).flat().some((st) => st.file.startsWith(`f5_${k}`)), `v0.11.62: ${k} is left for push 5b`);
}
// v0.11.63 (the second round of small fixes, push 5b, the size redraws; owner picks 2026-11-08 D2 + F1 + T1, pictures 10:21): 21 pictures redrawn
// with the giant alone first (one background per key, shared by its three forms), the people's flat stand-ins painted in code (patch.py
// figures), then repainted small by a detail inpaint whose masks are stored (polygons, or 1-bit outlines in tools/art/masks/)
{
    const R = JSON.parse(readFileSync('tools/art/recipes.json', 'utf8'));
    const KEYS = ['guardian', 'ashen_hills', 'grove_sprout', 'ashen_camp', 'lf_old_roots', 'rot_ape', 'ship_wreck'];
    // owner pick A3 (10:40): these four keep their old pictures; their redraws had a broken figure (a headless James, a face on Ya's back, a faceless Ya)
    const KEPT_OLD = ['guardian', 'guardian_human', 'ashen_hills', 'ashen_camp_human'];
    for (const key of KEYS) {
        const bgs = new Set();
        for (const [form, f] of [['cat', key], ['tiger', `${key}_tiger`], ['human', `${key}_human`]]) {
            const steps = R.pictures[f];
            if (KEPT_OLD.includes(f)) { assert(!R5B(f), `v0.11.63 (A3): ${f} keeps its old picture (its redraw had a broken figure; the later art pass)`); continue; }
            assert(steps && existsSync(`art/pic/${f}.webp`) && R.palette.rename[steps.at(-1).file] === f && steps.at(-1).file.startsWith('b5_') && steps.at(-1).op === 'detail_inpaint', `v0.11.63: ${f} ends in its picked detail inpaint, named in the rename map`);
            assert(Object.entries(R.palette.rename).filter(([, v]) => v === f).length === 1, `v0.11.63: only one file renames to ${f}`);
            assert(steps[0].op === 'generate' && steps[0].file === `b5_${key}_bg_s${steps[0].seed}` && !/\b(man|woman|cat|people|person|travellers?)\b(?! shaped)/.test(steps[0].prompt.slice(R.styles.n.length).replace(/shaped like a gardener|villagers?|village elder|elder/g, '')) || key === 'grove_sprout', `v0.11.63: ${f} starts from the giant drawn alone (${steps[0].file})`);
            bgs.add(steps[0].file);
            let prev = steps[0].file;
            for (const st of steps.slice(1)) {
                assert(st.source === prev, `v0.11.63: ${f}'s ${st.file} runs on the step before it (${prev})`);
                if (st.op === 'local') assert(/patch\.py/.test(st.note) && (st.spec.figures || []).length >= 2 && st.file.startsWith('b5l_'), `v0.11.63: ${f}'s stand-ins ${st.file} are a recorded patch.py step`);
                if (st.op === 'detail_inpaint') {
                    const [x, y, w, h] = st.crop;
                    const [mb, ms] = st.mask.map((n) => R.masks[n]);
                    assert(mb && ms && mb.size[0] === w * st.scale && mb.size[1] === h * st.scale && ms.size[0] === w && ms.size[1] === h && x + w <= 1280 && y + h <= 800, `v0.11.63: ${f}'s ${st.file} has both masks, sized to its crop (${w}x${h} x${st.scale})`);
                    for (const m of [mb, ms]) if (m.bitmap) assert(existsSync(`tools/art/masks/${m.bitmap}`), `v0.11.63: ${f}'s mask outline ${m.bitmap} is stored`);
                    assert(st.denoise <= 0.9 && !/nude|naked|breast|bust|bath|bare (?:chest|skin)/i.test(st.prompt), `v0.11.63: ${f}'s ${st.file} repaints at most at 0.9 and asks for nothing unclothed`);
                }
                prev = st.file;
            }
            const pr = steps.at(-1).prompt;
            if (key !== 'grove_sprout') {
                assert(/pale blond hair/.test(pr) && /lab coat/.test(pr), `v0.11.63: ${f} draws James`);
                if (key !== 'lf_old_roots') assert(/primitive spear/.test(pr) && /barefoot/.test(pr), `v0.11.63: ${f}'s Ya is barefoot, with her spear (the Old Roots have James and Yuki only)`);
                assert(!/scar/.test(pr), `v0.11.63: ${f} puts no scar on anyone (the small figures; Ya's scar no longer lands on Mei Lin)`);
            }
            if (form === 'cat') assert(/small white cat with a thin red cord collar/.test(pr) && !/great cat|qipao/.test(pr), `v0.11.63: ${f} draws the small cat`);
            if (form === 'tiger') assert(/one single huge white great cat/.test(pr) && !/small white cat|qipao/.test(pr), `v0.11.63: ${f} draws the great cat once`);
            if (form === 'human') assert(pr.startsWith(R.styles.pc) && /cat ears/.test(pr) && /snow-white cat tail/.test(pr) && !/small white cat|great cat/.test(pr), `v0.11.63: ${f} draws her human form in the pc style, her tail white`);
        }
        assert(bgs.size === 1, `v0.11.63 (F1): ${key}'s three forms share one background (${[...bgs]})`);
    }
    const gen = (k) => R.pictures[k][0].prompt;
    assert(/fills the picture from the floor to the top edge/.test(gen('guardian_tiger')), 'v0.11.63: the guardian fills the picture');
    assert(/fills the whole upper half of the picture/.test(gen('ashen_hills_tiger')) && /blots out a third of the stars/.test(gen('ashen_camp')), 'v0.11.63: the dead tree colossal over the Ashen Hills and their camp');
    assert(/fills a third of the height of the picture/.test(gen('lf_old_roots')), 'v0.11.63: the old roots as thick as houses');
    assert(/cavern beneath the roots/.test(gen('ship_wreck')) && /teardrop hull/.test(gen('ship_wreck')), 'v0.11.63 (T1): the seed-ship in the cavern under the roots, its teardrop hull, as the scene text');
    assert(/only as tall as a man's knee/.test(R.pictures.grove_sprout[2].prompt), 'v0.11.63: the saplings knee-high');
    assert(/crouch/.test(R.pictures.rot_ape.at(-1).prompt) && /gigantic ape/.test(R.pictures.rot_ape.at(-1).prompt), 'v0.11.63: the four crouch far below the rot-ape');
    const used = new Set(Object.values(R.pictures).flat().flatMap((st) => [st.mask, ...((st.spec && st.spec.layers) || []).map((L) => L.mask)].flat()));
    assert(Object.keys(R.masks).filter((m) => m.startsWith('b5m_')).every((m) => used.has(m)), 'v0.11.63: every b5m_ mask is used by a recorded step');
    assert(readdirSync('tools/art/masks').every((f) => Object.values(R.masks).some((m) => m.bitmap === f)), 'v0.11.63: every stored mask outline is used');
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
    assert(YUKI_PICS.size === 59, `v0.11.59: 59 pictures draw Yuki (29 since v0.11.49; Act 1 push 1 adds 10, push 2 adds 10, push 3 adds 8 and the 2 camps) (${YUKI_PICS.size})`);
    assert(!YUKI_PICS.has('ridge') && pictureOf('ridge', 'tiger') === 'art/pic/ridge.webp' && pictureOf('ridge', 'human') === 'art/pic/ridge.webp', 'v0.11.49: ridge shows the landscape without Yuki in every form');
    // v0.11.49 (Y3, part 1): the great-cat versions. v0.11.50 (Y3 part 2a): human for 15 keys; v0.11.51 (part 2b): all 29
    assert([...YUKI_PIC_FORMS].join(' ') === 'cat tiger human', `v0.11.50: Yuki's pictures exist for the cat, the great cat and the human (${[...YUKI_PIC_FORMS]})`);
    assert(YUKI_HUMAN_PICS.size === 29 + 10 + 20 && [...YUKI_HUMAN_PICS].every((k) => YUKI_PICS.has(k)), `v0.11.61: the prologue's 29 keys of YUKI_PICS, the Long Forest's 8, the 2 camps and Act 1's 20 have a human picture (${YUKI_HUMAN_PICS.size})`);
    // v0.11.54 (pick F1): the great cat is gated like the human form; the prologue's 29 have both, Act 1's keys only the cat until push 4
    assert([...YUKI_TIGER_PICS].sort().join(' ') === [...YUKI_PICS].sort().join(' '), `v0.11.60: every picture that draws Yuki has its great-cat version (${YUKI_TIGER_PICS.size} of ${YUKI_PICS.size})`);
    assert([...YUKI_HUMAN_PICS].sort().join(' ') === [...YUKI_PICS].sort().join(' '), `v0.11.61: every picture that draws Yuki has its human version (${YUKI_HUMAN_PICS.size} of ${YUKI_PICS.size}; Act 1's 20 until push 4b)`);
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
assert(gives(yhunt).slice().sort().join(' ') === 'fowl_raw hare_raw venison', `v0.11.25, v0.11.71 (Y1): "Let Yuki hunt" gives venison, hares or fowl (now: ${gives(yhunt).join(' ')})`);
{
    const g = ensureBars(newGame(7)); g.scene = 'lf_hunt'; g.minutes = 3 * 1440 + 8 * 60;
    const has = () => sceneView(g, SCENES).choices.some((c) => c.label.startsWith('Let Yuki hunt'));
    assert(has(), 'v0.11.25: "Let Yuki hunt" shows with room in the stock');
    g.inventory.hare_raw = itemCap('hare_raw'); assert(has(), 'v0.11.25: "Let Yuki hunt" still shows with only the hares full');
    g.inventory.venison = itemCap('venison'); assert(has(), 'v0.11.71 (Y1): "Let Yuki hunt" still shows with hares and venison full (fowl has room)');
    g.inventory.fowl_raw = itemCap('fowl_raw'); assert(!has(), 'v0.11.71 (Y1): "Let Yuki hunt" hides when all three are full');
}

// v0.11.25 (b): the Blackroot camp stakes hurt the first night attacker for one night (like the prologue's), from the owner's 03:07 camp save
{
    const raw = readFileSync('saves/2026-11-07-0307-incremental-bl_camp.txt', 'utf8').trim();
    const base = deserialize(gunzipSync(Buffer.from(raw.slice(5), 'base64')).toString('utf8'));
    assert(base.scene === 'bl_camp' && base.flags.bl_stakes_night === true, 'v0.11.25: the 03:07 save is at the camp with the stakes up');
    const fight = SCENES.bl_night_event.choices.find((c) => c.text === 'Fight.');
    const enc = (kind, stakes, hard) => { const g = structuredClone(base); g.flags.bl_ev = kind; g.flags.bl_stakes_night = stakes; g.flags.stakes_hard = hard; return fight.combat(g); };
    // X2: the cut comes after the scaling and the ally floor, so it is exact: max(1, hp − 3), max(1, hp − 4) with bone-meal
    const LINE = { wolves: 'bleeds for it', drowned: 'stands there leaking', serpent: 'kept a share', hawks: 'short of some feathers' }; // v0.11.172 (P5A): Fable's rewrite; v0.11.177 (P9A, RV1 TG8): each kind's own word again
    const TAILS = new Set();
    for (const kind of ['wolves', 'drowned', 'serpent', 'hawks']) {
        const off = enc(kind, false, false), on = enc(kind, true, false), hard = enc(kind, true, true);
        const h0 = off.enemies[0].hp;
        assert(on.enemies[0].hp === Math.max(1, h0 - 3) && hard.enemies[0].hp === Math.max(1, h0 - 4), `v0.11.25: ${kind}: the stakes cut the first attacker exactly (${h0} → ${on.enemies[0].hp}, ${hard.enemies[0].hp} with bone-meal)`);
        if (kind === 'serpent') assert(hard.enemies[0].hp < on.enemies[0].hp, 'v0.11.25: serpent: bone-meal cuts more than plain stakes');
        assert(JSON.stringify(on.enemies.slice(1)) === JSON.stringify(off.enemies.slice(1)), `v0.11.25: ${kind}: the others are untouched`);
        // v0.11.177 (P9A, P5): the stake line rides as the fight's tail (shown after the opening at every degree); Fable's lines
        assert(/stake/i.test(on.tail || '') && !on.intro.includes(on.tail) && !off.tail && !off.intro.includes('stakes') && !TAILS.has(on.tail) && on.tail.includes(LINE[kind]), `v0.11.25: ${kind}: its own stakes line, only with the stakes up`);
        TAILS.add(on.tail);
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
