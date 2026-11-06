// v0.11.5: repo consistency (run by tools/check.sh).
// 1. Every game file the page needs is in sw.js FILES (so it works offline from the first install).
// 2. sw.js VERSION matches the handover header, the newest changelog row and the newest restore point.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const fail = [];
const sw = readFileSync('sw.js', 'utf8');
const version = (sw.match(/const VERSION = 'bone-ash-([\d.]+)'/) || [])[1];
if (!version) fail.push('sw.js: no VERSION bone-ash-X.Y.Z');
const listed = new Set([...(sw.match(/const FILES = \[([\s\S]*?)\];/) || ['', ''])[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
const tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').filter(Boolean);
const needed = tracked.filter((f) => /^(js\/.*\.js|css\/.*\.css|art\/.*\.(jpg|png|svg|webp)|icons\/.*\.(png|svg))$/.test(f) || f === 'index.html' || f === 'manifest.webmanifest');
for (const f of needed) if (!listed.has(f)) fail.push(`sw.js FILES is missing ${f}`);
for (const f of listed) if (f !== './' && !tracked.includes(f)) fail.push(`sw.js FILES lists ${f}, which is not in the repo`);

const first = (path, re) => { const m = readFileSync(path, 'utf8').match(re); return m ? m[1] : null; };
const docs = {
    'project/handover.md (Version:)': first('project/handover.md', /\*\*Version:\*\* ([\d.]+)/),
    'project/changelog.md (top row)': first('project/changelog.md', /\n\| ([\d.]+) \| \d{4}-/),
    'project/restore-points.md (top row)': first('project/restore-points.md', /\|---\|---\|---\|\n\| ([\d.]+) \|/),
};
for (const [where, v] of Object.entries(docs)) if (v !== version) fail.push(`${where} says ${v}, sw.js says ${version}`);

if (fail.length) { console.log(fail.join('\n')); process.exit(1); }
console.log(`${needed.length} files offline, version ${version} everywhere`);
