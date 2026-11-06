// Run: node tests/data.test.mjs — data integrity (v0.11.7, from Selene's data.test.js).
// Every id the game refers to exists: task-hub scenes and menus, form ids on story choices, items given or needed,
// and every data-* marker in the page has code that reads it (a renamed marker once stuck every Selene player).
import { readFileSync, readdirSync } from 'node:fs';
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

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
