// v0.11.5: repo consistency (run by tools/check.sh).
// 1. Every game file the page needs is in sw.js FILES (so it works offline from the first install); v0.11.39 (Z2-b): pictures,
//    backgrounds and icons are in sw.js ART instead (their own cache), each with a current fingerprint (tools/arthash.mjs).
// 2. sw.js VERSION matches the handover header, the newest changelog row and the newest restore point.
// 3. v0.11.73 (group h, H1): the handover under 35,000 bytes, the roadmap's "Last updated" version (failures); the newest
//    history file past 45,000 bytes (a log line). The rules are in tools/lib/docs.mjs.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { readArt, checkArt, ART_RE } from './arthash.mjs';
import { docFindings } from './lib/docs.mjs';

const fail = [];
const sw = readFileSync('sw.js', 'utf8');
const version = (sw.match(/const VERSION = 'bone-ash-([\d.]+)'/) || [])[1];
if (!version) fail.push('sw.js: no VERSION bone-ash-X.Y.Z');
const listed = new Set([...(sw.match(/const FILES = \[([\s\S]*?)\];/) || ['', ''])[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
const tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').filter(Boolean);
const needed = tracked.filter((f) => /^(js\/.*\.js|css\/.*\.css)$/.test(f) || ART_RE.test(f) || f === 'index.html' || f === 'manifest.webmanifest');
const art = readArt(sw) || {};
const isArt = (f) => ART_RE.test(f); // the same rule as tools/arthash.mjs (Fable review)
for (const f of needed) if (isArt(f) ? !(f in art) : !listed.has(f)) fail.push(`sw.js ${isArt(f) ? 'ART' : 'FILES'} is missing ${f}`);
for (const f of listed) if (isArt(f)) fail.push(`sw.js FILES lists ${f}: pictures, backgrounds and icons belong in ART (v0.11.39)`);
fail.push(...checkArt(sw));
for (const f of listed) if (f !== './' && !tracked.includes(f)) fail.push(`sw.js FILES lists ${f}, which is not in the repo`);

const first = (path, re) => { const m = readFileSync(path, 'utf8').match(re); return m ? m[1] : null; };
const docs = {
    'project/handover.md (Version:)': first('project/handover.md', /\*\*Version:\*\* ([\d.]+)/),
    'project/changelog.md (top row)': first('project/changelog.md', /\n\| ([\d.]+) \| \d{4}-/),
    'project/restore-points.md (top row)': first('project/restore-points.md', /\|---\|---\|---\|\n\| ([\d.]+) \|/),
};
for (const [where, v] of Object.entries(docs)) if (v !== version) fail.push(`${where} says ${v}, sw.js says ${version}`);

const histories = Object.fromEntries(readdirSync('project').filter((f) => /^history(-\d+)?\.md$/.test(f)).map((f) => [f, statSync(`project/${f}`).size]));
const handoverBytes = statSync('project/handover.md').size;
const docs2 = docFindings({ version, handoverBytes, histories, roadmap: readFileSync('project/roadmap.md', 'utf8') });
fail.push(...docs2.fail);
for (const n of docs2.notes) console.log(`note: ${n}`);

if (fail.length) { console.log(fail.join('\n')); process.exit(1); }
console.log(`${needed.length} files offline (${Object.keys(art).length} in the art cache, fingerprints current), version ${version} everywhere, handover ${handoverBytes} bytes`);
