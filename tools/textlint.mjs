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
// v0.11.134 (owner pick LP2, LR): and the line pools: again.js's memory lines, Yuki's haul lines (task_hubs.js), the aptitude reply
// (tasks.js): per pool lines, words, a line twice, lines sharing a 5-word chunk with a scene text, tics, broken, spacing.
// v0.11.135 (NT1, EV1): every sample state also on a scene's 2nd–4th day this Coil, so the later-day texts are read.
// v0.11.136 (NC1): and the replies by day (lines.js DAY_REPLIES) as the pool `replies`.
// v0.11.139 (MW1): and Old Wen's and the mother's daily scenes (house_texts.js) as the pool `house`.
// v0.11.163 (TL2): one more sample, every once-a-day key used today (the return lines after a hunt).
// Not read yet: the other result lines of choices and cards, the task cards' texts (open, options later).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintCounts, snapshotDiff, poolCounts } from './lib/textlint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAP = path.join(ROOT, 'tools/text-baseline.json');
const argv = process.argv.slice(2);
const LIST = argv.includes('--list'), SAVE = argv.includes('--save');
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
const houseLines = [...Object.values(HT_BODY).flatMap((b) => Object.values(b)), ...Object.values(HT_CLOSE).flat()];
const { LF_DRILL } = await import(js('story/longforest.js')); const { SEASON_LINES } = await import(js('story/prologue.js')); // v0.11.175 (RV1, C4)
const POOLS = { memory: [...MEMORY_LINES], yuki: yukiLines, aptitude: [ADAPT_REPLY], replies: dayReplies, house: houseLines, lf_drill: Object.values(LF_DRILL).flat(), lf_season: [...SEASON_LINES] };
const pools = poolCounts(POOLS, rows.filter((r) => r.kind === 'text').flatMap((r) => r.renders));
const snap = { totals: now.totals, areas: now.areas, pools };

console.log(`text lint (log only): ${T.scenes} scenes, ${T.labels} choice labels; ${T.words} words of base text, ${T.variantWords} in variants, ${T.labelWords} in labels`);
console.log(`  SH reused passages: ${T.sharedChunks} 5-word chunks shared by two scenes or more (${T.sharedScenes} scenes); ${T.reused} scene pairs share 5+: ${now.lists.reused.slice(0, 5).map(([p, n]) => `${p} ${n}`).join(', ')}`);
console.log(`  FV favourite phrases (in 4+ scenes; names and canon terms left out): ${T.favourites}: ${now.lists.favourites.slice(0, 6).map((f) => `"${f.phrase}" ${f.scenes.size}`).join(', ')}`);
console.log(`  TC tics (2–3 words 3+ times in one text): ${T.tics}: ${now.lists.tics.slice(0, 5).map((x) => `${x.id} "${x.phrase}" ×${x.n}`).join(', ')}`);
console.log(`  BD broken text: ${T.broken}${T.broken ? `: ${now.lists.broken.slice(0, 5).map((x) => `${x.id} (${x.kind}) ${x.what}`).join(', ')}` : ''}; spacing the screen drops: ${T.spacing}`);
console.log(`  LR line pools: ${Object.entries(pools).map(([p, v]) => `${p} ${v.lines} lines / ${v.words} words (twice ${v.dupes}, shared with a scene ${v.sceneShared}, tics ${v.tics}, broken ${v.broken}, spacing ${v.spacing})`).join('; ')}`);
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
