// v0.11.7: content lint over every scene. Rules are measured log-only before they are enforced.
// v0.11.21: old mode names and duplicate labels are strict (both were at 0): any hit fails the check (exit 1).
// Choices on the default time stay log only (357 today, many on purpose).
//   node tools/lint.mjs           counts
//   node tools/lint.mjs --list    every hit
// Looks at the written scene data (text and choices that are plain strings; functions are skipped).
// v0.11.126 (NQ1 review, LN): a scene text or label that is a function of the state is rendered on sample states (Yuki as the cat,
// the great root-kin and human; no path, sister, lover) and the old-names rule reads every rendering; one that throws on a bare state
// is counted (log only).
import { SCENES } from '../js/story/prologue.js';
import { newGame, ensureBars } from '../js/core/game.js';

const LIST = process.argv.includes('--list');
const OLD_NAMES = /\b(Classic mode|Tasks \(preview\)|task mode)\b/i;
const hits = { noTime: [], oldNames: [], dupLabels: [] };
let scenes = 0, choices = 0;
const str = (x) => (typeof x === 'string' ? x : '');
const SAMPLES = [];
for (const [form, realm] of [['cat', 0], ['tiger', 2], ['human', 7]]) for (const path of [null, 'sister', 'lover']) {
    const g = ensureBars(newGame(1234, { closed: true }));
    g.yuki.realm = realm; g.james.realm = realm; g.yuki.form = form; if (path) g.flags.yk_path = path;
    SAMPLES.push(ensureBars(g));
}
let rendered = 0, unrendered = 0;
/** every rendering of a text: the string itself, or the function on each sample state */
const renders = (x) => {
    if (typeof x === 'string') return [x];
    if (typeof x !== 'function') return [];
    const out = [];
    for (const g of SAMPLES) { try { const t = x(g); if (typeof t === 'string') out.push(t); } catch { /* needs more state */ } }
    if (out.length) rendered++; else unrendered++;
    return out;
};
for (const s of Object.values(SCENES)) {
    scenes++;
    const seen = new Map();
    if (renders(s.text).some((t) => OLD_NAMES.test(t))) hits.oldNames.push(`${s.id}: text`);
    for (const c of s.choices || []) {
        choices++;
        const label = str(c.text);
        if (c.time == null && !c.combat) hits.noTime.push(`${s.id}: ${label.slice(0, 60)}`);
        if (renders(c.text).some((t) => OLD_NAMES.test(t))) hits.oldNames.push(`${s.id}: ${(label || '(a function)').slice(0, 60)}`);
        if (label) { if (seen.has(label) && !c.show && !seen.get(label).show) hits.dupLabels.push(`${s.id}: ${label.slice(0, 60)}`); seen.set(label, c); }
    }
}
const names = { noTime: 'choices on the default time (no time of their own)', oldNames: 'old mode names in game text', dupLabels: 'the same label twice in one scene (neither conditional)' };
for (const [k, v] of Object.entries(hits)) {
    console.log(`  ${v.length} ${names[k]}`);
    if (LIST) for (const h of v) console.log(`      ${h}`);
}
const strict = hits.oldNames.length + hits.dupLabels.length;
if (strict && !LIST) for (const h of [...hits.oldNames, ...hits.dupLabels]) console.log(`      ${h}`);
console.log(`  ${rendered} texts and labels that are functions read on ${SAMPLES.length} sample states (${unrendered} need more state; log only)`);
console.log(`${scenes} scenes, ${choices} choices: ${hits.noTime.length} on default time (log only), ${hits.oldNames.length} old names, ${hits.dupLabels.length} duplicate labels${strict ? ' — FAILED' : ''}`);
process.exit(strict ? 1 : 0);
