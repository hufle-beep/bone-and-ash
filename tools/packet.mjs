#!/usr/bin/env node
// The context packets (v0.11.180, owner pick CP1): what Fable and the cold reviewer get for each line they draft or check, instead
// of the lean packets' 220 characters (U1, FP). v0.11.179's label pass needed five picks where two are usual: its 16 later finds
// each needed a field the lean packet left out (project/research/label-pass-*.md). The fields, as picked:
//   C1 the result: every result branch (success / failure, by form; the XP and check lines left out), seen in play or forced on the
//      sample states, and the next screen's opening with its labels
//   C2 when it shows: the code's show / req conditions (once a day where it has a daily key), and the days, hours and picks per
//      game it had in a bot run (random task-mode games, as tools/snap.mjs plays)
//   C3 task mode: is the text drawn (a story screen, a hub above its cards, a work or door menu whose text is never drawn), and
//      is the label drawn (a hub's entry to a work menu is not: the cards sit under the menu's group label)
//   C4 forms: the text and every label for the cat, the great root-kin and the woman, side by side where they differ
//   C5 the whole text as drawn (on the first day and a later one; and as seen in play)
//   C6 the screen: every label beside it, and the labels that lead in (the hub's entry or the story choice)
//   C7 Claude's check before a handover (`--check`): each draft through the canon card's tic list, word pairs the game already
//      uses five times or more, five-word runs shared with a scene, and time words (again, first, last, morning…) against C2;
//      v0.11.200 (owner pick D1): and a result's split (`splitLine`: a stat in the reply, a short reply beside a gain), five-word
//      runs shared by two drafts of different scenes, "still" as stillness ("goes still", "a still place") no time word, and a
//      reference's phrase or a `{slot}` breaking a run (two texts that name one song share its phrase on purpose)
// Whole-game reads (`--tags`) get the lean form (each scene's last 220 characters, by form where they differ) and one tag line
// per label (C2, C3, C4, the next screen), then full packets for the lines they flag.
//
//   node tools/packet.mjs rt_evening rr_scout:0          full packets (C1–C6); `scene:index` marks the lines being changed
//   node tools/packet.mjs --tags [--area blackroot]      every scene, lean + tags (the areas as tools/textlint.mjs's)
//   node tools/packet.mjs --check drafts.txt             C7 on drafts: one per line, `scene_id[:index] | text`
//   --games N   the bot run's games (default 200; 0 = none); --out file   write there instead of stdout
// Changes nothing in the game. The bot run is wall time only (no model reads it).
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const js = (f) => path.join(ROOT, 'js', f);
const { SCENES } = await import(js('story/prologue.js'));
const { newGame, ensureBars, startCombat, combatStep, clockParts } = await import(js('core/game.js'));
const { sceneView, choose, goTo } = await import(js('core/story.js'));
const { TASK_HUBS } = await import(js('story/task_hubs.js'));
const { isTaskHub, isTaskChoice, taskCards, taskOpen, runTask, taskState, dryClone } = await import(js('core/tasks.js'));
const { hour, markDaily } = await import(js('story/common.js')); // v0.11.235 (P8-A, TG): markDaily
const { coilStamp, textDay } = await import(js('core/lines.js'));
const { calMinutes } = await import(js('core/calendar.js')); // v0.11.238 RV2 (C L2): the camps' states on their real nights
const { smartAction } = await import(path.join(ROOT, 'tests/lib/smartfight.mjs'));
const { splitLine } = await import(js('core/replies.js')); // v0.11.200 (D1, S1)
const { ALL_REFS } = await import(js('story/songs.js')); // v0.11.200 (D1, S4)

export const FORMS = [['cat', 0, 'cat'], ['tiger', 2, 'great'], ['human', 7, 'human']];
const FORM_NAMES = FORMS.map((f) => f[2]);

/** A sample state: Yuki in `form`, on the `k`-th later day of every scene this Coil (0 = the first). As tools/textlint.mjs. */
function sample(form, realm, k = 0) {
    const g = ensureBars(newGame(1234, { closed: true }));
    g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form;
    if (k) {
        const today = textDay(g);
        const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]);
        g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) };
    }
    return ensureBars(g);
}
/** The sample states: each form on its first day and on a later one (`later` names the later ones in the packet). */
export const SAMPLES = FORMS.flatMap(([f, r, name]) => [{ g: sample(f, r, 0), form: name, later: false }, { g: sample(f, r, 2), form: name, later: true }]);
/** v0.11.235 (owner pick P8-A, TG; v0.11.234's measure): the states a text reads beyond the forms and the day: the long calendar's three
 *  village weeks (`vday`) on each day of a cycle of six, in the three forms; the Fallout's story days 9 and 10 on each day of their sequences;
 *  the Ashen Hills by day by who is there (Ya away, both away, both there: `awayNow` reads 06:00–18:59) and at the evening fire by the cook
 *  mark (`cookedToday`), the Root Road's fire cooked and not. A scene's text on each, where it differs from the forms' (C5: "[text · state: …]").
 *  RV1 (the cold review's C M1, M2, L1): the away states by day (at 20:00 they were inert), every day of the cycles in every form (the packet drew
 *  4 of the 12 new texts), and each state only on the scenes of its area (`ASHFALL`, `FALLOUT`, `BLACKROOT`; the walk not in the first week). */
function stateOf(flags, minutes, { k = 0, cooked = false, rel = null, form = ['cat', 0] } = {}) {
    const g = ensureBars(newGame(1234, { closed: true, cal: 7 })); g.yuki.form = form[0]; g.yuki.realm = form[1]; g.james.realm = form[1]; Object.assign(g.flags, flags); /* the long calendar, as textlint's */ g.minutes = typeof minutes === 'function' ? minutes(g) : minutes; /* v0.11.238 RV2 (C L2): or a function of the game */ if (rel) for (const [n, a] of Object.entries(rel)) g.rel[n] = { f: a ? 90 : 20, a };
    if (k) { const today = textDay(g); const days = [...Array(k).keys()].map((i) => -1 - i).concat([today]); g.lines = { c: coilStamp(g), p: {}, last: {}, cur: {}, at: null, said: [], d: new Proxy({}, { get: (_, key) => (typeof key === 'string' ? days : undefined) }) }; }
    if (cooked) markDaily(g, 'bl_cook');
    return ensureBars(g);
}
const DAY = 1440;
const { ASHFALL } = await import(js('story/ashfall.js'));
const { FALLOUT } = await import(js('story/act1_fallout.js'));
const { BLACKROOT } = await import(js('story/act1_blackroot.js'));
const inArea = (table) => (id) => Object.hasOwn(table, id);
const AH = { bl_region: 'ah', bl_day: 4, bl_n: 2, mei_party: true, ya_party: true }; // bl_n 2: the camp's later morning, which has an away version (AW.morning)
const BOTH = { 'Mei Lin': 90, Ya: 90 };
/** v0.11.238 RV2 (the cold review's C L2): a camp night's clock as the game has it: story day 10 + `bl_day` (`blSpan` days each), its `bl_n`-th night, at 19:00 (`bl_camp`'s hour). */
const campNight = (bday, n = 0) => (g) => calMinutes(g, 10 + bday, 19) + n * DAY;
export const STATES = [
    ...[[1, 23], [2, 30], [3, 37]].flatMap(([v, d]) => [0, 1, 2, 3, 4, 5].flatMap((k) => FORMS.map(([f, r, name]) => ({ base: `the long calendar's village week ${v}, day ${k + 1} of its cycles`, form: name, week: v, // v0.11.238 (P11-A, PKf): `--week v` keeps week v's
        on: (id) => inArea(ASHFALL)(id) && !(v === 1 && id === 'mei_walk'), g: stateOf({ long: true, vday: v, cal_night: 1 }, (d - 1) * DAY + 19 * 60, { k, form: [f, r] }) })))),
    ...[[9, 51], [10, 58]].flatMap(([sd, d]) => [0, 1, 2, 3, 4, 5].map((k) => ({ base: `the long calendar's story day ${sd}, day ${k + 1} of its sequences`, on: inArea(FALLOUT), g: stateOf({ ya_met: true }, (d - 1) * DAY + 12 * 60, { k }) }))),
    // v0.11.239 (owner pick RV1 after P12-A; the cold review's C M2): the Fallout supper's sequences of six (FS6): story day 8 on each of its days in the
    // three forms (FS8 names Yuki by form), story days 9 and 10 on days 4–6 too, and story day 9 without Ya (FS9's `away` lines), so the packet draws them
    ...[0, 1, 2, 3, 4, 5].flatMap((k) => FORMS.map(([f, r, name]) => ({ base: `the long calendar's story day 8, day ${k + 1} of its sequences`, form: name, on: inArea(FALLOUT), g: stateOf({}, 43 * DAY + 12 * 60, { k, form: [f, r] }) }))),
    ...[0, 1, 2, 3, 4, 5].map((k) => ({ base: `the long calendar's story day 9, day ${k + 1} of its sequences, Ya not met`, on: inArea(FALLOUT), g: stateOf({}, 50 * DAY + 12 * 60, { k }) })),
    { base: 'the Ashen Hills by day, Ya away', on: inArea(BLACKROOT), g: stateOf(AH, 70 * DAY + 10 * 60, { k: 1 }) },
    { base: 'the Ashen Hills by day, both away', on: inArea(BLACKROOT), g: stateOf({ ...AH, trio: 2 }, 70 * DAY + 10 * 60, { k: 1, rel: BOTH }) },
    { base: 'the Ashen Hills by day, both there', on: inArea(BLACKROOT), g: stateOf({ ...AH, ya_off_done: true }, 70 * DAY + 10 * 60, { k: 1 }) },
    { base: 'the Ashen Hills in the evening, he did not cook', on: inArea(BLACKROOT), g: stateOf({ ...AH, ya_off_done: true }, 70 * DAY + 20 * 60, { k: 1 }) },
    { base: 'the Ashen Hills in the evening, he cooked', on: inArea(BLACKROOT), g: stateOf({ ...AH, ya_off_done: true }, 70 * DAY + 20 * 60, { k: 1, cooked: true }) },
    { base: 'the Root Road in the evening, he did not cook', on: inArea(BLACKROOT), g: stateOf({ bl_region: 'rr', bl_day: 2, mei_party: true, ya_party: true }, 70 * DAY + 20 * 60, { k: 1 }) },
    { base: 'the Root Road in the evening, he cooked', on: inArea(BLACKROOT), g: stateOf({ bl_region: 'rr', bl_day: 2, mei_party: true, ya_party: true }, 70 * DAY + 20 * 60, { k: 1, cooked: true }) },
    // v0.11.236 (owner pick RV1 after P9-A, PS; the cold review's C M1): the camps' third night (day index 2) and the journey talks' beat 5 (the
    // cycle's own quiet walk) by warmth and with Ya away, so the packet draws the six texts P9-A added
    { base: 'the Root Road in the evening, its third camp', on: inArea(BLACKROOT), g: stateOf({ bl_region: 'rr', bl_day: 2, mei_party: true, ya_party: true }, 70 * DAY + 20 * 60, { k: 2 }) },
    { base: 'the Ashen Hills in the evening, its third camp', on: inArea(BLACKROOT), g: stateOf({ ...AH, ya_off_done: true }, 70 * DAY + 20 * 60, { k: 2 }) },
    ...[['neither close', {}], ['Mei Lin close', { 'Mei Lin': 90 }], ['Ya close', { Ya: 90 }], ['both close', BOTH]].map(([w, rel]) => ({ base: `the journey talks at beat 5, ${w}`, on: inArea(BLACKROOT),
        g: stateOf({ bl_region: 'rr', bl_day: 2, mei_party: true, ya_party: true, mei_talks: 5, ya_talks: 5 }, 70 * DAY + 10 * 60, { rel }) })),
    { base: 'the journey talks at beat 5, Ya away, Mei Lin not close', on: inArea(BLACKROOT), g: stateOf({ ...AH, mei_talks: 5, ya_talks: 5 }, 70 * DAY + 10 * 60, { k: 1 }) },
    // v0.11.238 (owner pick P11-A, PKs; p11's measure): the Drowned Wood's camps by its day index as the game reaches them (its first is the Root
    // Road's story night, its fourth the wood's own after the drowned hollow), and the Root Road's and the Ashen Hills' fourth and fifth (their second
    // story day's quiet nights), so the packet draws every camp text: the Drowned Wood's later two had no state, and CB5's five come here
    ...[[0, "its first camp (the Root Road's story night)", { bl_day: 2, bl_n: 2 }], [1, 'its second camp', { bl_day: 3 }], [2, 'its third camp', { bl_day: 3, bl_n: 1 }], [3, "its fourth camp (the wood's story night)", { bl_day: 3, bl_n: 2, drowned_done: true }]]
        .map(([k, w, f]) => ({ base: `the Drowned Wood in the evening, ${w}`, on: inArea(BLACKROOT), g: stateOf({ bl_region: 'dw', mei_party: true, ya_party: true, ...f }, campNight(f.bl_day, f.bl_n), { k }) })),
    ...[[3, 'fourth'], [4, 'fifth']].flatMap(([k, w]) => [
        { base: `the Root Road in the evening, its ${w} camp`, on: inArea(BLACKROOT), g: stateOf({ bl_region: 'rr', bl_day: 2, bl_n: k - 3, mei_party: true, ya_party: true }, campNight(2, k - 3), { k }) },
        { base: `the Ashen Hills in the evening, its ${w} camp`, on: inArea(BLACKROOT), g: stateOf({ ...AH, bl_day: 5, bl_n: k - 3, ya_off_done: true }, campNight(5, k - 3), { k }) }]),
];
/** RV1: the states that draw one text, named shortly: a state in all three forms by its name alone, else with its forms. */
export function stateNames(states) {
    const by = new Map();
    for (const st of states) by.set(st.base, [...(by.get(st.base) || []), st.form].filter(Boolean));
    return [...by].map(([b, f]) => (!f.length || FORM_NAMES.every((n) => f.includes(n)) ? b : `${b} (${f.join('/')})`));
}

const asStr = (x, g) => { try { const t = typeof x === 'function' ? x(g) : x; return typeof t === 'string' ? t : null; } catch { return null; } };

/** C4: a text or label on every sample, grouped where they read the same: [{ t, forms: ['cat', 'great'], later }]. */
export function byForms(x, samples = SAMPLES) {
    const out = [];
    for (const s of samples) {
        const t = asStr(x, s.g);
        if (t == null) continue;
        const e = out.find((o) => o.t === t);
        if (e) { if (!e.forms.includes(s.form)) e.forms.push(s.form); if (!s.later) e.later = false; } else out.push({ t, forms: [s.form], later: s.later });
    }
    return out;
}
const formTag = (forms, later) => `${forms.length === 3 ? 'all forms' : forms.join('/')}${later ? ', later days' : ''}`;

/** C3: how the scene is drawn in task mode. */
export function sceneStatus(id, hubs = TASK_HUBS) {
    for (const [h, cfg] of Object.entries(hubs)) {
        if (h === id) return { kind: 'hub', drawn: true, hub: h, words: 'task hub: its text is drawn above the cards' };
        if ((cfg.menus || {})[id]) return { kind: 'work menu', drawn: false, hub: h, group: cfg.menus[id].label, words: `work menu of ${h} (the group "${cfg.menus[id].label}"): its text is NEVER drawn in task mode; each option is a card (label, then the result)` };
        if ((cfg.doorMenus || {})[id]) return { kind: 'door menu', drawn: false, hub: h, group: cfg.doorMenus[id].label, words: `door menu of ${h} (the group "${cfg.doorMenus[id].label}"): its text is never drawn; each option is a door card that opens its scene` };
    }
    return { kind: 'story', drawn: true, words: 'story screen: its text is drawn' };
}
/** C3: how a choice's label is drawn in task mode. */
export function choiceStatus(id, index, scenes = SCENES, hubs = TASK_HUBS) {
    const s = sceneStatus(id, hubs);
    if (s.kind === 'work menu') return 'a work card: label, then the result';
    if (s.kind === 'door menu') return 'a door card: label, then its scene';
    if (s.kind !== 'hub') return 'a story choice';
    const cfg = hubs[id];
    const c = scenes[id].choices[index];
    if ((cfg.menus || {})[c.to]) return `NOT drawn: the entry to the work menu ${c.to} (its cards sit under "${cfg.menus[c.to].label}")`;
    if ((cfg.doorMenus || {})[c.to]) return `NOT drawn: the entry to the door menu ${c.to} (under "${cfg.doorMenus[c.to].label}")`;
    if (isTaskChoice(scenes, id, index)) return typeof c.to === 'string' && (cfg.doors || []).includes(c.to) ? 'a door card on the hub' : 'a card on the hub (a chore or work)';
    return 'a story stop under the cards';
}
/** C6: the labels that lead into a scene: [{ from, index, label }]. */
export function ledFrom(id, scenes = SCENES) {
    const out = [];
    for (const s of Object.values(scenes)) (s.choices || []).forEach((c, i) => {
        const to = typeof c.to === 'string' ? c.to : typeof c.to === 'function' && String(c.to).includes(`'${id}'`) ? id : null;
        if (to === id && s.id !== id) out.push({ from: s.id, index: i, label: byForms(c.text).map((x) => x.t).join(' | ') });
    });
    return out;
}

const src = (f) => String(f).replace(/\s+/g, ' ').slice(0, 160);
/** C2 from the code: the conditions in words or source. */
export function whenCode(c) {
    const w = [];
    if (c.show) w.push(c.show.dailyKey ? `once a day (key ${c.show.dailyKey})` : `show: ${src(c.show)}`);
    if (c.req) w.push(`req: ${src(c.req)}`);
    if (c.combat) w.push('starts a fight');
    if (c.check) w.push(`check: ${c.check.skill}`);
    return w;
}

/** The story lines of a result: the check, XP, haul and bar lines left out (they are the engine's, not the text's). */
const MECH = [/\/ DC [\d.]+/, /[+−-]\d+(\.\d+)? XP\b/, /^Yuki \(bond\)/, /^Hammerspace:/, /^(A thin haul|Double haul)/, /^\+\d/, /^(Fed|Qi|HP|Saturation)\b.*\d/, /^Condensed:/, /^Starving\b/, /^You see what went wrong\./, /^\(Intuitive Aptitude/, /^Meditated an hour/, /^\(?[A-Z][\w ]+ (rises|reaches) (to )?(T\d|L\d)/];
export const storyLines = (lines) => (lines || []).map(String).filter((l) => l.trim() && !MECH.some((re) => re.test(l)));

/** C1 forced: choice `index` taken on every sample (shown or not), as a success and, with a check, as a failure.
 *  { results: [{ t, forms, how }], next: [{ t, forms }] } (the result lines and the screen after, each grouped by form). */
export function forcedResults(id, index, scenes = SCENES) {
    const s = scenes[id];
    const results = [], next = [];
    const add = (list, t, form, how) => { const e = list.find((o) => o.t === t); if (e) { if (!e.forms.includes(form)) e.forms.push(form); if (how && !e.how.includes(how)) e.how.push(how); } else list.push({ t, forms: [form], how: how ? [how] : [] }); };
    const c0 = s.choices[index];
    const ways = c0.check ? [['success', 999], ['failure', -999]] : [['taken', 0]];
    for (const smp of SAMPLES) for (const [how, b] of ways) {
        const c = { ...c0, show: undefined, req: undefined };
        if (c0.check) c.check = { ...c0.check, bonus: () => b };
        const choices = s.choices.slice(); choices[index] = c;
        const sc = { ...scenes, [id]: { ...s, choices } };
        try {
            const g = dryClone(smp.g); g.scene = id;
            const r = choose(g, sc, index, { task: true });
            add(results, storyLines(r.lines).join(' ') || '(no line)', smp.form, how);
            if (r.combat) next.push({ id: '(a fight starts)', head: '', labels: [] });
            else { const v = sceneView(g, sc); next.push({ id: v.id, head: String(v.text || '').replace(/\s+/g, ' ').slice(0, 120), labels: v.choices.map((x) => x.label) }); }
        } catch { /* needs more state than a sample has */ }
    }
    // the screen after, once: its id(s), the first one's opening, and every label it showed on any sample (each cut to 70 characters)
    const ids = [...new Set(next.map((x) => x.id))];
    const labels = [...new Set(next.flatMap((x) => x.labels))].map((l) => (l.length > 50 ? `${l.slice(0, 50)}…` : l));
    const then = next.length ? `${ids.join(' / ')}${next[0].head ? `: "${next[0].head}…"` : ''}${labels.length ? ` [its labels: ${labels.slice(0, 8).join(' / ')}${labels.length > 8 ? ` / and ${labels.length - 8} more` : ''}]` : ''}` : '';
    return { results, then };
}

/* ---------------- C2 in play: a bot run ---------------- */
let rs = 1;
const rnd = (n) => { rs = (rs * 1103515245 + 12345) >>> 0; return (rs >>> 8) % n; };
function fight(g) {
    for (let t = 0; t < 400 && g.combat; t++) { const out = combatStep(g, smartAction(g, t)); if (out?.done) { goTo(g, SCENES, out.next); return; } }
}
/**
 * Random task-mode games (tools/snap.mjs's bot; one in five stays lost in the Long Forest). Per scene and per choice
 * (`scene:index`): the days, hours (24–27 = after midnight) and Coils it was on screen, the most picks in one game; for the
 * `watch` scenes also the texts and results seen. Deterministic for a given `games`.
 */
export function seenAt(games = 200, watch = new Set(), steps = 6000) {
    const at = {};
    const rec = (key, g) => {
        const d = clockParts(g.minutes).day, h = hour(g), coil = `${g.coil?.act || 0}:${g.coil?.n || 1}`;
        const e = at[key] || (at[key] = { days: [d, d], hours: [h, h], coils: new Set(), games: 0, maxPicks: 0, texts: [], results: [], _g: -1, _p: 0 });
        e.days = [Math.min(e.days[0], d), Math.max(e.days[1], d)]; e.hours = [Math.min(e.hours[0], h), Math.max(e.hours[1], h)]; e.coils.add(coil);
        return e;
    };
    for (let n = 0; n < games; n++) {
        rs = n + 1;
        const lost = n % 5 === 4;
        const g = ensureBars(newGame(n + 1, { closed: true }));
        const seenG = (e) => { if (e._g !== n) { e._g = n; e.games++; e._p = 0; } };
        const pick = (key) => { const e = at[key]; if (!e) return; seenG(e); e._p++; e.maxPicks = Math.max(e.maxPicks, e._p); };
        try {
            for (let st = 0; st < steps; st++) {
                const v = sceneView(g, SCENES);
                if (v.end) break;
                const sid = g.scene;
                const se = rec(sid, g); seenG(se);
                if (watch.has(sid) && se.texts.length < 4 && v.text && !se.texts.includes(v.text)) se.texts.push(v.text);
                for (const c of v.choices) if (c.index < 1000) { const e = rec(`${sid}:${c.index}`, g); seenG(e); }
                const take = (index) => {
                    pick(`${sid}:${index}`);
                    const r = choose(g, SCENES, index);
                    if (watch.has(sid)) { const e = at[`${sid}:${index}`]; const t = `${storyLines(r.lines).join(' ') || '(no line)'} → ${g.scene}`; if (e && e.results.length < 3 && !e.results.includes(t)) e.results.push(t); }
                    if (r.combat) { startCombat(g, r.combat(g)); fight(g); }
                };
                if (isTaskHub(g)) {
                    const cards = taskCards(g, SCENES).filter((c) => c.status === 'open');
                    for (const c of cards) { const k = c.id.lastIndexOf(':'); if (k > 0 && SCENES[c.id.slice(0, k)]) { const e = rec(c.id, g); seenG(e); } }
                    const stops = v.choices.filter((c) => !c.disabled && (c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)));
                    if (cards.length && (rnd(10) < 8 || !stops.length)) {
                        const id = cards[rnd(cards.length)].id;
                        pick(id);
                        if (taskOpen(g, SCENES, id)) {
                            const r = runTask(g, SCENES, id);
                            const k = id.lastIndexOf(':'); const ms = id.slice(0, k);
                            if (watch.has(ms) && at[id]) { const e = at[id]; const t = `${storyLines(r.lines).join(' ') || '(no line)'} → ${g.scene}`; if (e.results.length < 3 && !e.results.includes(t)) e.results.push(t); }
                        }
                        taskState(g).queue.length = 0;
                        continue;
                    }
                    if (!stops.length) break;
                    take(stops[rnd(stops.length)].index);
                    continue;
                }
                let open = v.choices.filter((c) => !c.disabled);
                if (!open.length) break;
                const stay = open.filter((c) => /Stay lost/.test(c.label));
                if (/^(arrival|clearing)$/.test(g.scene)) open = lost && stay.length ? stay : open.filter((c) => !/Stay lost/.test(c.label));
                const bite = open.filter((c) => /Bite the tail/.test(c.label));
                if (bite.length && /^(coil_end|collectors_lost|rt_taken)$/.test(g.scene)) open = bite;
                if (!open.length) break;
                take(open[rnd(open.length)].index);
            }
        } catch { /* a bot dead end: what it saw so far counts */ }
    }
    const coilN = (c) => c.split(':').map(Number); // act, then Coil, as numbers (1:10 after 1:9)
    for (const e of Object.values(at)) { e.coils = [...e.coils].sort((a, b) => coilN(a)[0] - coilN(b)[0] || coilN(a)[1] - coilN(b)[1]); delete e._g; delete e._p; }
    return at;
}
const span = (a, b) => (a === b ? `${a}` : `${a}–${b}`);
const fmtSeen = (e) => (e ? `seen in ${e.games} games: day ${span(...e.days)}, hour ${span(...e.hours)}, Coil ${span(e.coils[0], e.coils[e.coils.length - 1])}${e.maxPicks ? `, picked up to ${e.maxPicks}× a game` : ''}` : 'not seen in the bot run');

/* ---------------- the packet ---------------- */
/** Full packets (C1–C6) for the named scenes; `marks` = the `scene:index` lines being changed (their results in full). */
export function packet(ids, { marks = new Set(), seen = {}, week = null } = {}) { // v0.11.238 (P11-A, PKf): `week` keeps only that village week's states
    const out = [];
    for (const id of ids) {
        const s = SCENES[id];
        if (!s) { out.push(`## ${id}: no such scene\n`); continue; }
        const st = sceneStatus(id);
        out.push(`## ${id} — ${st.words}`);
        out.push(`when (C2): ${fmtSeen(seen[id])}`);
        const led = ledFrom(id);
        if (led.length) out.push(`led in by (C6): ${led.slice(0, 6).map((l) => `${l.from}[${l.index}] "${l.label}"`).join('; ')}${led.length > 6 ? `; and ${led.length - 6} more` : ''}`);
        // C4 + C5: the first text in full, paragraph by paragraph (¶n); every other one (another form, a later day, a text the bot saw
        // in play with other flags) only by what differs: its new paragraphs, and the first text's paragraphs it lacks
        const paras = (t) => String(t).split(/\n\s*\n/).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
        const variants = byForms(s.text).map((r) => ({ tag: formTag(r.forms, r.later), t: r.t }));
        for (const t of seen[id]?.texts || []) variants.push({ tag: 'as seen in play', t });
        { const byText = new Map(); // v0.11.235 (P8-A, TG): the states' texts, each once, named by every state that draws it
          for (const st of STATES) { if (!st.on(id) || (week && st.week && st.week !== week)) continue; st.g.scene = id; const t = asStr(s.text, st.g); if (t) byText.set(t, [...(byText.get(t) || []), st]); }
          for (const [t, sts] of byText) variants.push({ tag: `state: ${stateNames(sts).join('; ')}`, t }); }
        const done = new Set();
        let first = null;
        for (const v of variants) {
            const ps = paras(v.t);
            const key = ps.join('\n');
            if (done.has(key)) continue;
            done.add(key);
            if (!first) { first = ps; out.push(`[text · ${v.tag}]\n${ps.map((x, i) => `¶${i + 1} ${x}`).join('\n')}`); continue; }
            const added = ps.filter((x) => !first.includes(x));
            const lacks = first.map((x, i) => (ps.includes(x) ? null : i + 1)).filter(Boolean);
            out.push(`[text · ${v.tag}: as the first, ${lacks.length ? `without ¶${lacks.join(', ¶')}` : 'with'}${added.length ? `${lacks.length ? ', and with' : ''}:` : ''}]${added.length ? `\n${added.map((x) => `+ ${x}`).join('\n')}` : ''}`);
        }
        const thens = new Map();
        (s.choices || []).forEach((c, i) => {
            const key = `${id}:${i}`;
            const mark = marks.has(key) || ![...marks].some((m) => m.startsWith(`${id}:`)); // a scene named bare: every line's result
            const labels = byForms(c.text);
            out.push(`\n> [${i}]${marks.has(key) ? ' ◆' : ''} ${labels.map((l) => `${l.t} {${formTag(l.forms, l.later)}}`).join(' | ') || '(no label on the samples)'}`);
            out.push(`  drawn (C3): ${choiceStatus(id, i)}`);
            const w = whenCode(c);
            out.push(`  when (C2): ${[...w, fmtSeen(seen[key])].join(' · ')}`);
            if (!mark) return;
            const fr = forcedResults(id, i);
            for (const r of fr.results) out.push(`  result (C1, ${r.how.join('/')}, ${formTag(r.forms)}): ${r.t}`);
            if (fr.then) { const j = thens.get(fr.then); out.push(`  then (C1): ${j != null ? `as [${j}]` : fr.then}`); if (j == null) thens.set(fr.then, i); }
            const known = fr.results.map((r) => r.t);
            for (const r of seen[key]?.results || []) { const t = r.replace(/ → [\w:]+$/, ''); if (!known.includes(t)) { known.push(t); out.push(`  result (C1, seen in play): ${r}`); } }
        });
        out.push('');
    }
    return out.join('\n');
}

/* ---------------- tags for whole-game reads ---------------- */
export function tags(ids, seen = {}) {
    const out = [];
    for (const id of ids) {
        const s = SCENES[id];
        const st = sceneStatus(id);
        // the last 220 characters, by form only where those differ
        const tails = [];
        for (const r of byForms(s.text).filter((x) => !x.later)) { const t = r.t.replace(/\s+/g, ' ').trim().slice(-220); const e = tails.find((x) => x.t === t); if (e) e.forms.push(...r.forms); else tails.push({ t, forms: [...r.forms] }); }
        out.push(`${id} [${st.kind === 'story' ? '' : `${st.kind}${st.drawn ? '' : ', text never drawn'}; `}${fmtSeen(seen[id])}]: ${tails.map((r) => `${tails.length > 1 ? `{${formTag(r.forms)}} ` : ''}…${r.t}`).join(' || ')}`);
        (s.choices || []).forEach((c, i) => {
            const labels = byForms(c.text).filter((l) => !l.later);
            if (!labels.length) return;
            const to = typeof c.to === 'string' ? c.to : c.to ? '(by state)' : '';
            const e = seen[`${id}:${i}`];
            const cs = choiceStatus(id, i);
            out.push(`> [${i}] ${labels.map((l) => `${labels.length > 1 ? `{${formTag(l.forms)}} ` : ''}${l.t}`).join(' | ')}  ⟨${[cs === 'a story choice' ? '' : cs, ...whenCode(c).map((x) => x.replace(/\(g\) => /g, '').slice(0, 70)), e ? `day ${span(...e.days)}, hour ${span(...e.hours)}, ×${e.maxPicks}` : 'not seen', to && `→ ${to}`].filter(Boolean).join(' · ')}⟩`);
        });
    }
    return out.join('\n');
}

/* ---------------- C7: the check before a handover ---------------- */
export const TIME_WORDS = /\b(again|first|last|once more|one last|this morning|morning|tonight|this evening|today|tomorrow|yesterday|still|already|every day|each day|anymore|any more)\b/i;
const STOP = new Set('a an the and or but of to in on at by for with from as is are was were be been it its it\'s he she her his him you your yours they them their this that these those there here not no so then than into onto out up down over under one two three all some any what who whom which when where how why if do does did done have has had will would can could shall should may might must just only very own same other such too more most less own i me my we our us'.split(' '));
const words = (t) => String(t).toLowerCase().replace(/[^a-z' ]+/g, ' ').split(/\s+/).filter(Boolean);
/** Content-word pairs within four words of each other ("ears … forward"). */
export function pairs(t) {
    const w = words(t).filter((x) => !STOP.has(x) && x.length > 2);
    const out = new Set();
    for (let i = 0; i < w.length; i++) for (let j = i + 1; j < Math.min(w.length, i + 4); j++) out.add(`${w[i]} … ${w[j]}`);
    return out;
}
/** v0.11.200 (owner pick D1, S4; S2): the stretches a run may span: a `{slot}` and every reference's phrase (named or general, as
 *  `fillRefs` puts them in) break a text, so two texts that name one song or share a `{min}` tail are not a reused run. */
const REF_PHRASES = [...new Set(Object.values(ALL_REFS).flatMap((r) => [r.named, r.general]).filter((x) => typeof x === 'string' && x.trim()).map((x) => x.toLowerCase()))].sort((a, b) => b.length - a.length);
export function stretches(t) {
    let s = String(t).toLowerCase().replace(/\{[^}]*\}/g, '\u0000');
    for (const r of REF_PHRASES) if (s.includes(r)) s = s.split(r).join('\u0000');
    return s.split('\u0000');
}
const runs5 = (t) => { const out = new Set(); for (const part of stretches(t)) { const w = words(part); for (let i = 0; i + 5 <= w.length; i++) out.add(w.slice(i, i + 5).join(' ')); } return out; };
/** v0.11.200 (D1, S3): "still" as stillness is no time word: after goes / holds / stands / keep / perfectly / very / quite / as / a /
 *  is not…, or before water / place / air (22 of the game's 73 "still" at v0.11.199). The first time word that counts, or null. */
const STILL_AS_STILLNESS = /\b(go|goes|going|went|gone|hold|holds|holding|held|stand|stands|standing|stood|keep|keeps|kept|lie|lies|lay|sit|sits|sat|stay|stays|stayed|freeze|freezes|froze|perfectly|very|quite|utterly|as|a|not)\s+$/i;
export function timeWord(t) {
    const s = String(t);
    const re = new RegExp(TIME_WORDS.source, 'gi');
    for (const m of s.matchAll(re)) {
        if (m[0].toLowerCase() === 'still' && (STILL_AS_STILLNESS.test(s.slice(0, m.index)) || /^\s+(water|place|air|pool|pools)\b/i.test(s.slice(m.index + 5)))) continue;
        return m[0];
    }
    return null;
}
/** v0.11.200 (D1, S1; v0.11.181's M1 and L1): a draft result as the screen splits it: a stat left in the reply (speech outside
 *  GAIN_LINES carries its sentence there), or a reply of under four words beside a gain (a two-sentence result's fragment). */
export function splitNote(t) {
    const sp = splitLine(String(t).replace(/\{[^}]*\}/g, '20'));
    if (/(^|[\s(])[+−-]\d/.test(sp.reply) && /\b(HP|Qi|XP|satiety|Fed|Saturation)\b|[+−-]\d+ [A-Z]/.test(sp.reply)) return `a stat stays in the reply: "${sp.reply.slice(0, 90)}"`;
    if (sp.reply && sp.gain && sp.reply.split(/\s+/).length < 4) return `the reply is a fragment beside the gain ("${sp.reply}" | "${sp.gain.slice(0, 60)}"); check it is meant`;
    return null;
}
/** The canon card's tic list (as tests/story.test.mjs reads it). */
export function cardTics(card = readFileSync(path.join(ROOT, 'project/canon-card.md'), 'utf8')) {
    return [...(card.split('\n').find((l) => l.includes('Tics to avoid')) || '').matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase()).filter((x) => x !== 'a black dress');
}
/** Every text and label the game renders on the samples (the corpus C7 counts against). */
export function corpus() {
    const out = [];
    for (const s of Object.values(SCENES)) {
        for (const r of byForms(s.text)) out.push({ id: s.id, t: r.t });
        for (const c of s.choices || []) for (const r of byForms(c.text)) out.push({ id: s.id, t: r.t, label: true });
    }
    return out;
}
/** v0.11.239 (owner pick P12-A, RC; p12's measure CR2, CR3): every render the text lint reads (its long-calendar and story states, the
 *  stomp lists and the result lines, Yuki's path, the day replies and the other pools), from `node tools/textlint.mjs --corpus`; once a run. */
let LINT_CORPUS = null;
export function lintCorpus() {
    if (!LINT_CORPUS) {
        const dir = mkdtempSync(path.join(tmpdir(), 'lintcorpus-')), f = path.join(dir, 'corpus.json');
        try { // v0.11.239 RV1 (C L2): the lint's own error on stderr, and the folder removed either way
            execFileSync(process.execPath, [path.join(ROOT, 'tools/textlint.mjs'), '--corpus', f], { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
            LINT_CORPUS = JSON.parse(readFileSync(f, 'utf8'));
        } finally { rmSync(dir, { recursive: true, force: true }); }
    }
    return LINT_CORPUS;
}
/** v0.11.239 (RC, CR1): two draft keys that never share a screen: one text's Yuki passages by form (`…:y:cat`, `…:y:great`, `…:y:human`),
 *  and a text with someone there against its line without them (`…:away`, the text and its Yuki passages); `…:y:tiger` as `great`. */
export function exclusiveDrafts(a, b) {
    const base = (k) => k.replace(/:(y:(cat|great|tiger|human)|away)$/, ''); // v0.11.239 RV1 (C L4): `tiger`, the game's own name, too
    if (base(a) !== base(b) || a === b) return false;
    const yk = (k) => /:y:(cat|great|tiger|human)$/.test(k), aw = (k) => /:away$/.test(k);
    return (yk(a) && yk(b)) || aw(a) || aw(b);
}
/**
 * C7 on drafts [{ key: 'scene[:index]', text }]: tics, word pairs used `pairMin`+ times elsewhere, five-word runs shared with a
 * scene, and time words with the line's C2 data; v0.11.200 (D1): the split (`split`) and runs shared by two drafts (`self`).
 * v0.11.239 (owner pick P12-A, RC; p12's measure CR1–CR3): the runs are counted against `runTexts` (by default `texts` and the text
 * lint's renders, `lintCorpus`; given `texts` alone, those), every scene a run is in is kept, and a run shared with another text of the
 * draft's own scene is noted (`scene`), except against the text the draft replaces (an own-scene text holding half the draft's runs or
 * more; RV1, C M1: that one gets a single note, a rewrite or a copy); two drafts of one scene are checked against each other too, but for drafts that never share a screen (`exclusiveDrafts`).
 * Returns [{ key, kind, what }].
 */
export function checkDrafts(drafts, opts = {}) {
    const { seen = {}, tics = cardTics(), texts = corpus(), pairMin = 5 } = opts;
    const runTexts = opts.runTexts || ('texts' in opts ? texts : [...texts, ...lintCorpus()]);
    const pairCount = new Map();
    for (const { t } of texts) for (const p of pairs(t)) pairCount.set(p, (pairCount.get(p) || 0) + 1);
    const runAt = new Map(); // a run → [[scene id, render index]]
    runTexts.forEach(({ id, t }, i) => { for (const r of runs5(t)) { if (!runAt.has(r)) runAt.set(r, []); runAt.get(r).push([id, i]); } });
    const out = [];
    for (const d of drafts) {
        const low = String(d.text).toLowerCase().replace(/[,.;:!?"]/g, '');
        for (const x of tics) if (low.includes(x)) out.push({ key: d.key, kind: 'tic', what: `"${x}" (the canon card's list)` });
        for (const p of pairs(d.text)) { const n = pairCount.get(p) || 0; if (n >= pairMin) out.push({ key: d.key, kind: 'pair', what: `"${p}" is in ${n} texts or labels already` }); }
        const sid = d.key.split(':')[0];
        const mine = runs5(d.text);
        const shared = new Map(); // an own-scene render → the draft's runs it holds
        for (const r of mine) for (const [id, i] of runAt.get(r) || []) if (id === sid) shared.set(i, (shared.get(i) || 0) + 1);
        const replaced = new Set([...shared].filter(([, n]) => n * 2 >= mine.size).map(([i]) => i));
        // v0.11.239 RV1 (the cold review's C M1): never silent: a draft holding half the runs of an own-scene text or more gets one note (a
        // rewrite of it, or a copy), and its runs are still checked against the scene's other texts
        if (replaced.size) { const n = Math.max(...[...replaced].map((i) => shared.get(i))); out.push({ key: d.key, kind: 'scene', what: `${n} of ${mine.size} runs shared with one text of ${sid}: a rewrite of it, or a copy` }); }
        for (const r of mine) {
            const at = runAt.get(r) || [];
            const others = [...new Set(at.filter(([id]) => id !== sid).map(([id]) => id))];
            if (others.length) out.push({ key: d.key, kind: 'run', what: `"${r}" also in ${others.join(', ')}` });
            else if (at.some(([id, i]) => id === sid && !replaced.has(i))) out.push({ key: d.key, kind: 'scene', what: `"${r}" also in another text of ${sid}` });
        }
        const tw = timeWord(d.text);
        if (tw) out.push({ key: d.key, kind: 'time', what: `"${tw}": ${fmtSeen(seen[d.key] || seen[sid])}; check it holds on every day and hour` });
        const sn = splitNote(d.text);
        if (sn) out.push({ key: d.key, kind: 'split', what: sn });
    }
    // v0.11.200 (D1, S2): the drafts against each other (a run in two drafts; one note, on the later draft; v0.11.239 RC: of one scene too)
    const draftRun = new Map();
    for (const d of drafts) {
        const sid = d.key.split(':')[0];
        for (const r of runs5(d.text)) {
            const at = draftRun.get(r);
            if (!at) draftRun.set(r, [{ sid, key: d.key }]);
            else {
                const hit = at.find((x) => x.key !== d.key && !exclusiveDrafts(x.key, d.key)); // v0.11.239 (RC, CR1): one scene's drafts too
                if (hit) out.push({ key: d.key, kind: 'self', what: `"${r}" also in the draft ${hit.key}` });
                at.push({ sid, key: d.key });
            }
        }
    }
    return out;
}

/* ---------------- the command line ---------------- */
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
    const argv = process.argv.slice(2);
    const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
    const games = Number(opt('games', 200));
    const outFile = opt('out', null);
    const vals = new Set(['--games', '--out', '--area', '--check', '--week'].flatMap((k) => { const i = argv.indexOf(k); return i >= 0 ? [argv[i + 1]] : []; }));
    const args = argv.filter((a) => !a.startsWith('--') && !vals.has(a));
    let text;
    // v0.11.238 RV2 (the cold review's C L1): --week works on scene packets only; with --check or --tags, or with no value, it is refused, not ignored
    if (argv.includes('--week') && (argv.includes('--check') || argv.includes('--tags') || ![1, 2, 3].includes(Number(opt('week'))))) { console.log('--week takes 1, 2 or 3, and only with scene packets (not --check or --tags)'); process.exit(2); }
    if (argv.includes('--check')) {
        const lines = readFileSync(opt('check'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
        const drafts = lines.map((l) => { const k = l.indexOf('|'); return { key: l.slice(0, k).trim(), text: l.slice(k + 1).trim() }; });
        const seen = games ? seenAt(games) : {};
        const r = checkDrafts(drafts, { seen });
        text = `${r.map((x) => `${x.kind.toUpperCase()} · ${x.key} · ${x.what}`).join('\n')}\n\nC7: ${drafts.length} drafts, ${r.length} notes (${['tic', 'pair', 'run', 'scene', 'self', 'time', 'split'].map((k) => `${k} ${r.filter((x) => x.kind === k).length}`).join(', ')})\n`;
    } else if (argv.includes('--tags')) {
        let ids = Object.keys(SCENES);
        const area = opt('area', null);
        if (area) {
            const AREAS = { wilds: ['wilds', 'WILDS'], ashfall: ['ashfall', 'ASHFALL'], fallout: ['act1_fallout', 'FALLOUT'], blackroot: ['act1_blackroot', 'BLACKROOT'], heart: ['act1_heart', 'HEART'], return: ['act1_return', 'RETURN'], longforest: ['longforest', 'LONGFOREST'] };
            const [f, k] = AREAS[area] || [];
            if (!f) throw new Error(`No area ${area}`);
            ids = Object.keys((await import(js(`story/${f}.js`)))[k]);
        }
        text = `${tags(ids, games ? seenAt(games) : {})}\n`;
    } else {
        if (!args.length) { console.log('usage: node tools/packet.mjs <scene[:index]> … [--week 1|2|3] | --tags [--area x] | --check drafts.txt  [--games N] [--out file]'); process.exit(2); }
        const marks = new Set(args.filter((a) => a.includes(':')));
        const ids = [...new Set(args.map((a) => a.split(':')[0]))];
        const seen = games ? seenAt(games, new Set(ids)) : {};
        const week = argv.includes('--week') ? Number(opt('week')) : null; // v0.11.238 (P11-A, PKf): one village week's states (`village_night` about 24 KB whole with --games 0, a week's about 12.5)
        text = packet(ids, { marks, seen, week });
    }
    if (outFile) { writeFileSync(outFile, text); console.log(`packet: ${outFile}, ${Math.round(text.length / 102.4) / 10} KB`); } else process.stdout.write(text);
}
