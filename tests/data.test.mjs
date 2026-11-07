// Run: node tests/data.test.mjs — data integrity (v0.11.7, from Selene's data.test.js).
// Every id the game refers to exists: task-hub scenes and menus, form ids on story choices, items given or needed,
// and every data-* marker in the page has code that reads it (a renamed marker once stuck every Selene player).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { PICTURES, pictureOf, sceneArt, setArtState } from '../js/art/art.js';
import { SCENES, ITEMS } from '../js/story/prologue.js';
import { TASK_HUBS } from '../js/story/task_hubs.js';
import { FORM_LINES } from '../js/core/forms.js';

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
    for (const form of ['cat', 'tiger', 'human']) picFiles.add(pictureOf(key, form));
}
let picBytes = 0;
for (const f of picFiles) {
    assert(existsSync(f), `v0.11.24: ${f} exists`);
    if (!existsSync(f)) continue;
    const b = statSync(f).size; picBytes += b;
    assert(b <= 150 * 1024, `v0.11.24: ${f} is at most 150 KB (${Math.round(b / 1024)} KB)`);
    assert(swList.includes(`'${f}'`), `v0.11.24: ${f} is in sw.js FILES (offline)`);
}
assert(picBytes <= 8 * 1024 * 1024, `v0.11.24: all pictures together at most 8 MB (${Math.round(picBytes / 1024)} KB)`);
assert(readdirSync('art/pic').filter((f) => f.endsWith('.webp')).every((f) => picFiles.has(`art/pic/${f}`)), 'v0.11.24: every file in art/pic is a picture some key shows');
assert(pictureOf('yuki_close', 'cat') === 'art/pic/yuki_cat.webp' && pictureOf('yuki_close', 'tiger') === 'art/pic/yuki_tiger.webp' && pictureOf('yuki_close', 'human') === 'art/pic/yuki_human.webp', 'v0.11.24: yuki_close follows Yuki\'s form');
for (const [form, file] of [['tiger', 'yuki_tiger'], ['human', 'yuki_human'], ['cat', 'yuki_cat']]) { setArtState({ yukiForm: form }); assert(sceneArt('yuki_close').includes(`art/pic/${file}.webp`), `v0.11.24: with Yuki in ${form} form the yuki_close plate shows ${file}`); }
assert(sceneArt('james').includes('data-pic="james"') && sceneArt('james').includes('art/pic/james.webp'), 'v0.11.24: a key with a picture draws the picture');
assert(SCENES.arrival.art === 'james', 'v0.11.24: the arrival shows James');
assert(!sceneArt('forest_dawn').includes('data-pic') && sceneArt('forest_dawn').startsWith('<svg'), 'v0.11.24: a key without a picture keeps its code art');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
