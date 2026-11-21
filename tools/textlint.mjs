#!/usr/bin/env node
// v0.11.132 (owner picks PL1, E1): the story-text lint, log only (it never fails). Every scene text and choice label,
// rendered as the screen would on 9 sample states (and, since v0.11.175, six Long Forest later-visit states), each also on a later day (v0.11.135) (Yuki as the cat, the great root-kin and human; no path, sister,
// lover; as tools/lint.mjs), counted by the rules in tools/lib/textlint.mjs: SH reused passages, FV favourite phrases,
// TC tics, BD broken text (and spacing the screen drops), RD texts that render on no sample state. SN: the counts per
// story area against the saved snapshot tools/text-baseline.json; each change is a log-only NOTE line (the measure for
// group e's rewrite pass: each part prints old → new).
//   node tools/textlint.mjs           counts, and what changed against the snapshot
//   node tools/textlint.mjs --list    every hit
//   node tools/textlint.mjs --save    save the counts as the new snapshot (with the push that changes the texts)
//   node tools/textlint.mjs --corpus f.json  every render as JSON to f.json, nothing counted (v0.11.239, RC: tools/packet.mjs's run check)
// v0.11.134 (owner pick LP2, LR): and the line pools: again.js's memory lines, Yuki's haul lines (task_hubs.js), the aptitude reply
// (tasks.js): per pool lines, words, a line twice, lines sharing a 5-word chunk with a scene text, tics, broken, spacing.
// v0.11.135 (NT1, EV1): every sample state also on a scene's 2nd–4th day this Coil, so the later-day texts are read.
// v0.11.136 (NC1): and the replies by day (lines.js DAY_REPLIES) as the pool `replies`.
// v0.11.139 (MW1): and Old Wen's and the mother's daily scenes (house_texts.js) as the pool `house`.
// v0.11.163 (TL2): one more sample, every once-a-day key used today (the return lines after a hunt).
// v0.11.200 (owner pick D1, S5): and the result lines of every choice, as the screen shows them (the reply under the scene, `splitLine`;
// the gains and engine lines left out), forced as a success and, with a check, as a failure on six sample states (each form on its first
// and a later day, as tools/packet.mjs's), as the pool `results`; and the canon card's tic list over them (a log line, CT).
// Not read yet: the task cards' texts (open, options later).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintCounts, snapshotDiff, poolCounts } from './lib/textlint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = path.join(ROOT, 'tools/text-baseline.json');
const argv = process.argv.slice(2);
const LIST = argv.includes('--list'), SAVE = argv.includes('--save'), CORPUS = argv.includes('--corpus');
if (CORPUS && !/^[^-]/.test(argv[argv.indexOf('--corpus') + 1] || '')) { console.log('--corpus takes a file to write (node tools/textlint.mjs --corpus f.json)'); process.exit(2); } // v0.11.239 RV1 (C L3) // v0.11.239 (owner pick P12-A, RC): --corpus prints every render as JSON for tools/packet.mjs's run check
const js = (f) => path.join(ROOT, 'js', f);

const { SCENES } = await import(js('story/prologue.js'));
const { newGame, ensureBars } = await import(js('core/game.js'));

/** The story areas: the scene tables of each file; everything else (the prologue, the Coil, Yuki's path, the one-offs) is 'prologue+shared'. */
export const AREAS = [['wilds', 'wilds', 'WILDS'], ['ashfall', 'ashfall', 'ASHFALL'], ['fallout', 'act1_fallout', 'FALLOUT'], ['blackroot', 'act1_blackroot', 'BLACKROOT'], ['heart', 'act1_heart', 'HEART'], ['return', 'act1_return', 'RETURN'], ['longforest', 'longforest', 'LONGFOREST']];
const areaOf = {};
for (const [name, file, key] of AREAS) { const m = await import(js(`story/${file}.js`)); for (const id of Object.keys(m[key])) areaOf[id] = name; }

const SAMPLES = [];
// v0.11.135 (owner picks NT1, EV1): each sample also on a scene's 2nd, 3rd and 4th day this Coil (lines.js byDay), so the later-day texts are read;
// v0.11.154 (PS1, ST5): and its 5th (the Heart's hall and Yuki's scene there run five days)
const { coilStamp, textDay } = await import(js('core/lines.js'));
const onDay = (g, k) => { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; return g; };
for (const k of [0, 1, 2, 3, 4]) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) for (const p of [null, 'sister', 'lover']) {
    const g = ensureBars(newGame(1234, { closed: true }));
    g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; if (p) g.flags.yk_path = p;
    SAMPLES.push(k ? onDay(ensureBars(g), k) : ensureBars(g));
}
// v0.11.163 (owner pick TL2): and one sample with every once-a-day key known when the game loads (js/story/common.js DAILY_KEYS)
// marked used today, so a text shown only after a card or option is used today is read (v0.11.161's three return lines, HUNT_AGAIN;
// the only three in v0.11.163). RV1 (Opus's L5): keys made while a scene runs (`rel_<card>`, house_time.js's `<who>_time`) are not marked.
const { DAILY_KEYS, markDaily } = await import(js('story/common.js'));
const USED_TODAY = ensureBars(newGame(1234, { closed: true }));
for (const k of DAILY_KEYS) markDaily(USED_TODAY, k);
SAMPLES.push(USED_TODAY);
// v0.11.175 (owner pick RV1, C4; Fable's review): the Long Forest's later visits (every `lf_seen_<key>` at 2, the second trial won), each
// encounter, in all three forms, so the later texts are read too
for (const who of ['lf_bandits', 'lf_rogue']) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
    const g = ensureBars(newGame(1234, { closed: true }));
    g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
    Object.assign(g.flags, { longforest: true, lf_active: true, lf_days: 3, lf_trials_won: 2, lf_last: who === 'lf_rogue' ? 'lf_ossuary' : 'lf_bone_hounds', lf_human: who });
    for (const k of ['falls', 'ride', 'notes', 'bored', 'bathe', 'bone', 'mire', 'ridge', 'storm', 'roots', 'trial_lost', 'lf_bandits', 'lf_rogue']) g.flags[`lf_seen_${k}`] = 2;
    SAMPLES.push(ensureBars(g));
}
// v0.11.192 (owner pick K1, TL): a later Coil before her question (`yk_last` without `yk_path`), in all three forms (10 states, RV1 TG7); the human ones
// already human as it starts (`yk_form_before`) and with her human shape in the Coil's snapshot, so QH, QW and FQ are read too
for (const last of ['sister', 'lover', 'wait']) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
    const g = ensureBars(newGame(1234, { closed: true }));
    g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; g.flags.yk_last = last;
    if (form === 'human') g.flags.yk_form_before = 'human';
    if (form !== 'tiger') g.coil.snap = { ...g.coil.snap, yuki: { ...g.coil.snap.yuki, realm: 7 } }; // RV1 (TG7): the cat reads QW alone, the human QH + QW
    SAMPLES.push(ensureBars(g));
}
{   // RV1 (TG7): and QH alone (the "Not yet" text, already human, the Coil begun without her human shape)
    const g = ensureBars(newGame(1234, { closed: true }));
    g.yuki.realm = 7; g.james.realm = 7; g.yuki.form = 'human'; g.flags.yk_last = 'wait'; g.flags.yk_form_before = 'human';
    SAMPLES.push(ensureBars(g));
}
// v0.11.224 (owner pick RV1, TG8; the TS6 review): and the long calendar, in the cat form, on a day of each story day's week (the village's
// three weeks, the forest's, the Fallout's, the Blackroot's camps on their first and a quiet morning, the Heart, the road home), so the
// texts that read the long calendar (`longCal`, `blSpan`, the counts) are rendered and linted too
for (const [day, flags] of [[23, { long: true, vday: 1, cal_night: 1 }], [30, { long: true, vday: 2, cal_night: 1 }], [37, { long: true, vday: 3, cal_night: 1 }], [42, { long: true, vday: 3, cal_night: 6 }],
    [2, { forest_day: 1 }], [9, { forest_day: 2 }], [16, { forest_day: 3 }], [44, { ya_met: true }], [51, { ya_met: true }], [60, { ya_met: true }],
    [66, { bl_day: 1, bl_n: 1, bl_region: 'rr' }], [69, { bl_day: 2, bl_n: 0, bl_region: 'rr' }], [72, { bl_day: 3, bl_n: 2, bl_region: 'dw' }], [76, { bl_day: 4, bl_n: 1, bl_region: 'ah' }], [79, { bl_day: 5, bl_n: 2, bl_region: 'ah' }],
    [81, {}], [102, {}]]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); Object.assign(g.flags, flags); g.minutes = (day - 1) * 1440 + 12 * 60;
    SAMPLES.push(ensureBars(g));
}
// v0.11.233 (owner pick RV1 after P6-A, LS; the cold review's C M2): the journey talks past their five beats (5–10: the quiet walk, the two old
// settled texts and the three new), cold and warm, and Mei Lin's with Ya away; and the prologue camp's first night with the fire lit and food,
// so the talks' cycle of six and Yuki's cooking line are read too
for (const n of [5, 6, 7, 8, 9, 10]) for (const a of [0, 80]) for (const [region, day] of [['rr', 2], ['ah', 4]]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); Object.assign(g.flags, { bl_day: day, bl_region: region, mei_talks: n, ya_talks: n, mei_party: true, ya_party: true });
    g.rel['Mei Lin'] = { f: 20, a }; g.rel.Ya = { f: 20, a }; g.minutes = 70 * 1440 + 10 * 60;
    SAMPLES.push(ensureBars(g));
}
for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
    const g = ensureBars(newGame(1234, { closed: true })); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
    Object.assign(g.flags, { forest_day: 1, fire: true }); g.inventory.hare_raw = 1;
    SAMPLES.push(ensureBars(g));
}
// v0.11.234 (owner pick RV1 after P7-A, LS; the cold review's C L2): the roof's later nights on each of their six days (the long calendar's
// second week), and the firesides' meal texts 2–3 (the Root Road by form, the Ashen Hills by who is warm and, with neither, by form) on a day
// he cooked and on one he did not, so both versions of the meal lines (`cookedToday`) and the roof's cycle of six are read
// (markDaily: imported above)
const ROOF_SAMPLES = [], ROOF_K = new Map(); // the day index by sample: `dryClone` drops the lines' proxy, so the results loop sets it again
for (const k of [0, 1, 2, 3, 4, 5]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); Object.assign(g.flags, { long: true, vday: 2, cal_night: 1 }); g.minutes = 29 * 1440 + 21 * 60;
    onDay(g, k); SAMPLES.push(g); ROOF_SAMPLES.push(g); ROOF_K.set(g, k);
}
for (const [region, warm] of [['rr', [[0, 0]]], ['ah', [[80, 80], [0, 80], [80, 0], [0, 0]]]]) for (const [m, y] of warm) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
    if (region === 'ah' && (m || y) && form !== 'cat') continue;
    for (const k of [1, 2, 3, 4] /* v0.11.246 (P16-A, BF): and texts 4–5 */) for (const cooked of [true, false]) {
        const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
        Object.assign(g.flags, { bl_day: region === 'ah' ? 4 : 2, bl_region: region, mei_party: true, ya_party: true }); g.rel['Mei Lin'] = { f: 20, a: m }; g.rel.Ya = { f: 20, a: y };
        g.minutes = 70 * 1440 + 20 * 60; onDay(g, k); if (cooked) markDaily(g, 'bl_cook');
        SAMPLES.push(ensureBars(g));
    }
}
// v0.11.238 (owner pick P11-A, TG; p11's measure: the Drowned Wood's camps 2–3 were never read, its sample had day index 0 only): each region's
// camp on its later nights as the game reaches them (the Root Road's and the Ashen Hills' fourth and fifth on their second story day, the
// Drowned Wood's second to fourth, the fourth after the mourning hollow), so every camp text is read, CB5's five with them
for (const [region, day, ks, more] of [['rr', 2, [3, 4], {}], ['dw', 3, [1, 2, 3], {}], ['ah', 5, [3, 4], { ya_off_done: true }]]) for (const k of ks) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); Object.assign(g.flags, { bl_day: day, bl_region: region, mei_party: true, ya_party: true, ...more, ...(region === 'dw' && k === 3 ? { bl_n: 2, drowned_done: true } : {}) });
    g.minutes = 70 * 1440 + 20 * 60; SAMPLES.push(onDay(ensureBars(g), k));
}
// v0.11.235 (owner pick P8-A, TG; v0.11.234's measure): the supper's and the sunset walk's cycles of six on each of their days, the village's
// three weeks, in the three forms (two new texts name Yuki by form), and the Fallout's story days 9 and 10 (`fo_mei`, `fo_ya_time`, their
// labels) on each day of their sequences of three, so the texts v0.11.232–235 added there are read too
for (const [vday, day] of [[1, 23], [2, 30], [3, 37]]) for (const k of (vday === 3 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]) /* v0.11.243 (P15-B, SN7): and the seventh; RV1 (C L3): not week 3's */) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
    Object.assign(g.flags, { long: true, vday, cal_night: 1 }); g.minutes = (day - 1) * 1440 + 19 * 60;
    SAMPLES.push(onDay(g, k));
}
// v0.11.239 (owner pick P12-A, TG): and the Fallout supper's sequences of six (FS6): story day 8's six in the three forms, day 9's with Ya and without her; v0.11.241 (P13-A): day 10's own six (FS10) with Ya and without, the village's week 3 (SW3) in the loop above
for (const day of [44, 51, 58]) for (const k of (day === 58 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]) /* v0.11.243 (P15-B, SN7); RV1 (C L3): not story day 10's */) for (const [form, realm] of (day === 44 ? [['cat', 0], ['tiger', 2], ['human', 7]] : [['cat', 0]])) for (const ya of (day === 44 ? [true] : [true, false])) { // v0.11.241 (P13-A, FS10): story day 10's lines without Ya too
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; if (ya) g.flags.ya_met = true; g.minutes = (day - 1) * 1440 + 12 * 60;
    SAMPLES.push(onDay(g, k));
}
// v0.11.243 RV1 (the cold review's TG-C3): the herb slopes' week 2 with Mei Lin's lip split, both texts
for (const k of [0, 1]) { const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); Object.assign(g.flags, { long: true, vday: 2, cal_night: 1, mei_bruised: true }); g.minutes = 29 * 1440 + 9 * 60; SAMPLES.push(onDay(g, k)); }
// v0.11.243 (owner picks P15-B, D1; SF: MW): the long calendar's first forest week (`forest_day` 1), so its own morning is linted
{ const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.flags.forest_day = 1; g.minutes = 1440 + 6 * 60; SAMPLES.push(g); }
// v0.11.242 (owner pick RV1 after P14-A; the cold review's C M1, TG-C1): the forest night's later texts (`night`'s `byDay` index 5–14: the first
// loop reads 0–4), in the three forms with the fire and in the cat without it (the fire line is the same in every form), so NF6's six are linted
for (const k of [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] /* v0.11.246 (P16-A, NF6): and 16–21 */) for (const [form, realm, fire] of [['cat', 0, true], ['tiger', 2, true], ['human', 7, true], ['cat', 0, false]]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
    Object.assign(g.flags, { forest_day: 3, ...(fire ? { fire: true } : {}) }); g.minutes = 15 * 1440 + 21 * 60;
    SAMPLES.push(onDay(g, k));
}
// v0.11.246 (owner pick P16-A, TG): the Ashen Hills' hunt on its second stay (story day 15, `s:ah_hunt:15`) on each day, with Ya and away, by form;
// a kept realm's first dawn (KA (b)) in both acts; the Foundation breakthrough with Old Wen's lesson and not Mei Lin's word (BYb-t)
for (const k of [0, 1, 2]) for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) for (const back of [true, false]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
    Object.assign(g.flags, { bl_day: 5, bl_region: 'ah', mei_party: true, ya_party: true, ...(back ? { ya_off_done: true } : {}) }); g.minutes = 76 * 1440 + 9 * 60;
    SAMPLES.push(onDay(ensureBars(g), k));
}
for (const act of [0, 1]) { const g = ensureBars(newGame(1234, { closed: true })); g.coil = { ...(g.coil || {}), act, kept: 2, n: 3 }; g.stats = { ...(g.stats || {}), clears: 1 }; SAMPLES.push(g); }
{ const g = ensureBars(newGame(1234, { closed: true })); g.james.realm = 1; g.yuki.realm = 1; Object.assign(g.flags, { lore_realms: true, bt_return: 'stream' }); g.minutes = 3 * 1440 + 10 * 60; SAMPLES.push(g); }
// v0.11.246 RV (the cold review's C M2): the first flight by place (the alone sample is the realm-1 one above)
for (const [back, f] of [['village', {}], ['rr_hub', { bl_region: 'rr' }], ['ah_hub', { bl_region: 'ah', bl_day: 4 }]]) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.james.realm = 1; g.yuki.realm = 1; Object.assign(g.flags, { bt_return: back, mei_party: back !== 'village', ya_party: back !== 'village', ...f }); g.minutes = 73 * 1440 + 10 * 60; SAMPLES.push(g);
}
const renders = (x) => {
    if (typeof x === 'string') return [x];
    if (typeof x !== 'function') return [];
    const out = [];
    for (const g of SAMPLES) { try { const t = x(g); if (typeof t === 'string' && !out.includes(t)) out.push(t); } catch { /* needs more state */ } }
    return out;
};

const rows = [];
for (const s of Object.values(SCENES)) {
    const area = areaOf[s.id] || 'prologue+shared';
    const r = renders(s.text);
    rows.push({ id: s.id, area, kind: 'text', renders: r, fn: typeof s.text === 'function', unrendered: typeof s.text === 'function' && !r.length });
    for (const c of s.choices || []) {
        const l = renders(c.text);
        rows.push({ id: s.id, area, kind: 'label', renders: l, fn: typeof c.text === 'function', unrendered: typeof c.text === 'function' && !l.length });
    }
}
const now = lintCounts(rows);
const T = now.totals;
// v0.11.134 (LP2, LR): the line pools
const { MEMORY_LINES } = await import(js('story/again.js'));
const { TASK_HUBS } = await import(js('story/task_hubs.js'));
const { ADAPT_REPLY } = await import(js('core/tasks.js'));
const yukiLines = [];
for (const h of Object.values(TASK_HUBS)) {
    const j = h.yuki; if (!j) continue;
    const add = (t) => { if (typeof t === 'string' && !yukiLines.includes(t)) yukiLines.push(t); };
    // v0.11.169 (owner picks CA1, YH): a job's lines may be by Yuki's form (Ashfall's): each read on every sample state
    for (const g of SAMPLES) {
        for (const k of [j, ...(j.alts || [])]) for (const n of [1, 2]) add(typeof k.got === 'function' ? k.got(n, g) : k.got);
        for (const t of [j.none, j.full]) add(typeof t === 'function' ? t(g) : t);
    }
}
// v0.11.136 (owner pick NC1): the replies by day (js/core/lines.js DAY_REPLIES), every text in every form
const { DAY_REPLIES } = await import(js('core/lines.js'));
const dayReplies = [];
for (const list of Object.values(DAY_REPLIES)) for (const t of list) for (const r of renders(t)) if (!dayReplies.includes(r)) dayReplies.push(r);
// v0.11.139 (owner pick MW1): Old Wen's and the mother's daily scenes, every body and closer (the samples read one slot only)
const { HT_BODY, HT_CLOSE } = await import(js('story/house_texts.js'));
// v0.11.224 (TX2, DC12): a body's count slot filled as the screen fills it, on both calendars' first Fallout day (the old 13, the long 59)
const { countsFill } = await import(js('core/calendar.js'));
const HFILL = [ensureBars(newGame(1234, { closed: true })), ensureBars(newGame(1234, { closed: true, cal: 7 }))]; HFILL[0].minutes = 7 * 1440 + 600; HFILL[1].minutes = 43 * 1440 + 600;
const houseLines = [...new Set([...Object.values(HT_BODY).flatMap((b) => Object.values(b)).flatMap((t) => HFILL.map((g) => countsFill(g, t))), ...Object.values(HT_CLOSE).flat()])];
const { LF_DRILL } = await import(js('story/longforest.js')); const { SEASON_LINES } = await import(js('story/prologue.js')); // v0.11.175 (RV1, C4)
// v0.11.181 (RV1, TG4): the kitchen's and the pot's texts (kitchen_texts.js) as the pool `kitchen`: they show only with a flag or in a result
const KT = await import(js('story/kitchen_texts.js'));
const kitchenLines = [...Object.values(KT.KT_UP), ...Object.values(KT.KT_DAY).flat(), ...Object.values(KT.KT_RETURN), ...KT.POT_LINE.ashfall, ...KT.POT_LINE.fo, KT.POT_COOK.ashfall.result, KT.POT_COOK.fo.result, ...Object.values(KT.POT_AGAIN).flat().flatMap((o) => [o.label, o.text, o.go, o.result])]; // v0.11.218 (RV1, TG1): the cook's repeat scenes, every field
// v0.11.182 (CB1, EK): the music and archive lines (music_texts.js) in each edition, as the pools `music` (general) and `music_named`
const { MUSIC_LINES: MLX } = await import(js('story/music.js')); const { fillRefs: FRX } = await import(js('core/edition.js')); const { MUSIC_REFS: MRX0 } = await import(js('story/music_texts.js'));
const allMusicTexts = (ed) => Object.values(MLX).flatMap((p) => Object.values(p).flat()).map((x) => FRX(x.text, MRX0, ed));
// RS1: the reading to Ya in the named edition (the scene lint reads the general one), each ship sentence and the lover's
const RDX = await import(js('story/reading.js')); const EDX = await import(js('core/edition.js')); const { MUSIC_REFS: MRX } = await import(js('story/music_texts.js'));
const readNamed = Object.values(RDX.READ.ship).map((sh) => EDX.fillRefs(RDX.READ.text.replace('{SHIP}', sh).replace('{LOVER}', RDX.READ.lover), MRX, 'named'));
// v0.11.183 (SG2): the songs (songs_texts.js) in each edition, Yuki's line in both voices, as the pools `songs` (general) and `songs_named`
const SGX = await import(js('story/songs.js'));
const allSongTexts = (ed) => Object.values(SGX.SONG_TEXTS).flatMap((s) => (s.yuki ? [s.yuki.bond, s.yuki.aloud] : ['']).map((y) => EDX.fillRefs(s.text.replace('{YUKI}', y), SGX.ALL_REFS, ed)));
// v0.11.184 (S1): the scenes' own memory lines (remember_texts.js) as the pool `remember`; RV1 (TG1): with the Day 2 morning's paragraph
const RMX = await import(js('story/remember_texts.js'));
const rememberLines = [RMX.MORNING_AGAIN, RMX.SCENE_MEMORY_LINES.morning, ...Object.values(RMX.SCENE_MEMORY_LINES.talk_mei), ...Object.values(RMX.SCENE_MEMORY_LINES.talk_ya)];
const YKX = await import(js('story/yuki_path.js')); const flat = (o) => (typeof o === 'string' ? [o] : Object.values(o).flatMap(flat));
const ykLaterTexts = [...flat(YKX.YK_LATER), ...flat(YKX.YK_LATER_RESULT), ...flat(YKX.YK_FIRE_LATER_RESULT)]; // v0.11.191 (RV1, TG3); v0.11.192 (K1, LF): the later fire's results
const FWX = await import(js('story/flight_texts.js')); // v0.11.195 (F1, D1)
const STX = await import(js('core/story.js')); // v0.11.197 (C1, RV1 TG5): the walks' lines with company
const carryLines = [...Object.values(STX.CARRY_LINES).flat(), ...Object.values(STX.FOOT_LINES).flat()].map((l) => l.replace(/\{min\}|\{walk\}/g, '20'));
const { SX } = await import(js('story/act1_return.js')); // v0.11.198 (S1, RV1 TG4): the carried road texts (no sample state sets party_flew)
const BTX = await import(js('story/prologue.js')); // v0.11.185 (BR1, RV1 TG3): the sample states set no bt_return, so the two texts are read as a pool
const { SUPPER_POT } = await import(js('story/act1_fallout.js')); // v0.11.189 (P1, PL, L5b): the women's lines at realm 2+ and the supper's clauses show only with flags the samples don't set
const btPlaceLines = [BTX.BT_A1_WITNESS, BTX.BT_TREE_FRAME, ...Object.values(BTX.BT_LATE).flatMap((o) => Object.values(o)), SUPPER_POT[2], SUPPER_POT[3], ...Object.values(BTX.BT_ASK_WOMEN)]; // D1 (merged text push, c1): the women's line before a later question (flags the samples don't set)
const POOLS = { memory: [...MEMORY_LINES], yuki: yukiLines, aptitude: [ADAPT_REPLY], replies: dayReplies, house: houseLines, kitchen: kitchenLines, music: allMusicTexts('general'), music_named: allMusicTexts('named'), reading_named: readNamed, songs: allSongTexts('general'), songs_named: allSongTexts('named'), lf_drill: Object.values(LF_DRILL).flat(), lf_season: [...SEASON_LINES], remember: rememberLines, bt_place: btPlaceLines, awake: [...Object.values(BTX.AWAKE_WOMEN).flatMap((o) => Object.values(o)), BTX.AWAKE_VILLAGE, BTX.AWAKE_A1_ASHFALL /* D1 (c2) */, ...Object.values(BTX.AFTER_ANSWER_WOMEN), ...Object.values(BTX.ASK_WOMEN)], // v0.11.193 (N1: GV, HA, HQ)
    song_second: Object.values(SGX.SONG_SECOND), yk_later: ykLaterTexts, sky_fw: [FWX.FW.elderSky, FWX.FW.elderRung, FWX.FW.luHanSky, FWX.FW.luHanTail, FWX.FW.morningOut, FWX.BT_CLOSER], carry: carryLines, sx: Object.values(SX) }; // v0.11.195 (F1, D1; RV1 TG3): the lines after a tribulation the village saw (the samples set no sky_witness), the second morning flown and the Foundation closer (realm 1 only) // v0.11.191 (Y1, RV1 TG3): Yuki's later question, answers and result lines (the samples set no yk_last) // v0.11.190 (N1, RV1 TG1): the women at Yuki's forms and the second songs' sentences
// v0.11.200 (owner pick D1, S5): the result lines (the reply part of each line every choice gives), on six samples: each form on its first
// day and its third (SAMPLES' k 0 and 2 with no path: the indices below), as a success and, with a check, as a failure
const { choose } = await import(js('core/story.js')); const { dryClone } = await import(js('core/tasks.js')); const { splitLine } = await import(js('core/replies.js'));
const RESULT_SAMPLES = [0, 3, 6, 18, 21, 24].map((i) => SAMPLES[i]);
const resultLines = []; const resultAt = new Map();
for (const s of Object.values(SCENES)) (s.choices || []).forEach((c0, i) => {
    for (const smp of (s.id === 'supper_roof' ? [...RESULT_SAMPLES, ...ROOF_SAMPLES] : RESULT_SAMPLES)) for /* v0.11.234 RV1 (LS): the roof's six lines after */ (const b of (c0.check ? [999, -999] : [0])) {
        const c = { ...c0, show: undefined, req: undefined }; if (c0.check) c.check = { ...c0.check, bonus: () => b };
        const choices = s.choices.slice(); choices[i] = c;
        try {
            const g = dryClone(smp); g.scene = s.id; if (ROOF_K.has(smp)) onDay(g, ROOF_K.get(smp)); // v0.11.234 RV1 (LS)
            const r = choose(g, { ...SCENES, [s.id]: { ...s, choices } }, i, { task: true });
            const t = (r.lines || []).map((l) => splitLine(String(l)).reply).filter(Boolean).join(' ').trim();
            if (t && !resultAt.has(t)) { resultAt.set(t, s.id); resultLines.push(t); }
        } catch { /* needs more state than a sample has */ }
    }
});
POOLS.results = resultLines;
// v0.11.239 (owner pick P12-A, RC; p12's measure CR1–CR3): every text, label and pool line the lint reads, as JSON ({ id, t, label }), for the
// draft check's runs (tools/packet.mjs lintCorpus): a result line by its scene, a pool line as `pool:<name>`; nothing counted or printed
if (CORPUS) {
    const out = rows.flatMap((r) => r.renders.map((t) => (r.kind === 'label' ? { id: r.id, t, label: true } : { id: r.id, t })));
    for (const [p, v] of Object.entries(POOLS)) for (const t of v) if (typeof t === 'string') out.push({ id: p === 'results' ? resultAt.get(t) : `pool:${p}`, t });
    writeFileSync(argv[argv.indexOf('--corpus') + 1], JSON.stringify(out)); // a file: a pipe may be cut off at exit
    process.exit(0);
}
const pools = poolCounts(POOLS, rows.filter((r) => r.kind === 'text').flatMap((r) => r.renders));
// CT (D1, S5): the canon card's tics in the result lines (the card's list, as tools/packet.mjs reads it)
const cardPath = path.join(ROOT, 'project/canon-card.md');
const CARD_TICS = existsSync(cardPath) ? [...(readFileSync(cardPath, 'utf8').split('\n').find((l) => l.includes('Tics to avoid')) || '').matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((x) => x !== 'a black dress') : [];
const cardTicHits = resultLines.flatMap((t) => { const low = t.toLowerCase().replace(/[,.;:!?"]/g, ''); return CARD_TICS.filter((x) => low.includes(x)).map((x) => `${resultAt.get(t)} "${x}"`); });
pools.results.cardTics = cardTicHits.length;
// RV1 (TG6): the reading's named edition against every scene but its own (its general text is heart_read itself)
pools.reading_named = poolCounts({ reading_named: readNamed }, rows.filter((r) => r.kind === 'text' && r.id !== 'heart_read').flatMap((r) => r.renders)).reading_named;
const snap = { totals: now.totals, areas: now.areas, pools };

console.log(`text lint (log only): ${T.scenes} scenes, ${T.labels} choice labels; ${T.words} words of base text, ${T.variantWords} in variants, ${T.labelWords} in labels`);
console.log(`  SH reused passages: ${T.sharedChunks} 5-word chunks shared by two scenes or more (${T.sharedScenes} scenes); ${T.reused} scene pairs share 5+: ${now.lists.reused.slice(0, 5).map(([p, n]) => `${p} ${n}`).join(', ')}`);
console.log(`  FV favourite phrases (in 4+ scenes; names and canon terms left out): ${T.favourites}: ${now.lists.favourites.slice(0, 6).map((f) => `"${f.phrase}" ${f.scenes.size}`).join(', ')}`);
console.log(`  TC tics (2–3 words 3+ times in one text): ${T.tics}: ${now.lists.tics.slice(0, 5).map((x) => `${x.id} "${x.phrase}" ×${x.n}`).join(', ')}`);
console.log(`  BD broken text: ${T.broken}${T.broken ? `: ${now.lists.broken.slice(0, 5).map((x) => `${x.id} (${x.kind}) ${x.what}`).join(', ')}` : ''}; spacing the screen drops: ${T.spacing}`);
console.log(`  LR line pools: ${Object.entries(pools).map(([p, v]) => `${p} ${v.lines} lines / ${v.words} words (twice ${v.dupes}, shared with a scene ${v.sceneShared}, tics ${v.tics}, broken ${v.broken}, spacing ${v.spacing})`).join('; ')}`);
console.log(`  CT the canon card's tics in the result lines: ${cardTicHits.length}${cardTicHits.length ? `: ${cardTicHits.join(', ')}` : ''}`);
console.log(`  RD texts rendered on none of the sample states: ${T.unrendered}${T.unrendered ? `: ${now.lists.unrendered.map((x) => `${x.id} (${x.kind})`).join(', ')}` : ''}`);

if (LIST) {
    console.log('\nreused passages (scene pair, shared chunks):'); for (const [p, n] of now.lists.reused) console.log(`  ${p} ${n}`);
    console.log('\nfavourite phrases (scenes):'); for (const f of now.lists.favourites) console.log(`  "${f.phrase}" ${f.scenes.size}: ${[...f.scenes].sort().join(', ')}`);
    console.log('\ntics:'); for (const x of now.lists.tics) console.log(`  ${x.id}: "${x.phrase}" ×${x.n}`);
    console.log('\nbroken:'); for (const x of now.lists.broken) console.log(`  ${x.id} (${x.kind}): ${x.what}`);
    console.log('\nspacing:'); for (const x of now.lists.spacing) console.log(`  ${x.id} (${x.kind})`);
    console.log('\nunrendered:'); for (const x of now.lists.unrendered) console.log(`  ${x.id} (${x.kind})`);
    console.log('\npools:'); for (const [p, v] of Object.entries(POOLS)) { console.log(`  ${p}:`); for (const t of v) console.log(`    ${t}`); }
    console.log('\nper area:'); for (const [a, v] of Object.entries(now.areas)) console.log(`  ${a.padEnd(16)}${JSON.stringify(v)}`);
}

let changed = 0;
if (SAVE) {
    writeFileSync(SNAP, `${JSON.stringify({ saved: new Date().toISOString().slice(0, 10), ...snap }, null, 1)}\n`);
    console.log(`  snapshot saved: ${path.relative(ROOT, SNAP)}`);
} else if (existsSync(SNAP)) {
    const d = snapshotDiff(JSON.parse(readFileSync(SNAP, 'utf8')), snap);
    changed = d.length;
    for (const x of d) console.log(`  NOTE  text (log only): ${x.where} ${x.key} ${x.was ?? '—'} → ${x.now ?? '—'}`);
} else console.log('  NOTE  text (log only): no snapshot yet (node tools/textlint.mjs --save)');

console.log(`text lint (log only): ${T.reused} reused passages, ${T.favourites} favourite phrases, ${T.tics} tics, ${T.broken} broken, ${T.unrendered} unrendered; ${SAVE ? 'snapshot saved' : `${changed} changed against the snapshot`}`);
