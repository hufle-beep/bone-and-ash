// v0.11.7: content lint over every scene. Rules are measured log-only before they are enforced.
// v0.11.21: old mode names and duplicate labels are strict (both were at 0): any hit fails the check (exit 1).
// Choices on the default time stay log only (357 today, many on purpose).
//   node tools/lint.mjs           counts
//   node tools/lint.mjs --list    every hit
// Looks at the written scene data (text and choices that are plain strings; functions are skipped).
import { SCENES } from '../js/story/prologue.js';

const LIST = process.argv.includes('--list');
const OLD_NAMES = /\b(Classic mode|Tasks \(preview\)|task mode)\b/i;
const hits = { noTime: [], oldNames: [], dupLabels: [] };
let scenes = 0, choices = 0;
const str = (x) => (typeof x === 'string' ? x : '');
for (const s of Object.values(SCENES)) {
    scenes++;
    const seen = new Map();
    if (OLD_NAMES.test(str(s.text))) hits.oldNames.push(`${s.id}: text`);
    for (const c of s.choices || []) {
        choices++;
        const label = str(c.text);
        if (c.time == null && !c.combat) hits.noTime.push(`${s.id}: ${label.slice(0, 60)}`);
        if (OLD_NAMES.test(label)) hits.oldNames.push(`${s.id}: ${label.slice(0, 60)}`);
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
console.log(`${scenes} scenes, ${choices} choices: ${hits.noTime.length} on default time (log only), ${hits.oldNames.length} old names, ${hits.dupLabels.length} duplicate labels${strict ? ' — FAILED' : ''}`);
process.exit(strict ? 1 : 0);
