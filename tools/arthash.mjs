// v0.11.39 (Z2-b): the fingerprints of the offline pictures in sw.js's ART table.
// Pictures, backgrounds and icons live in their own cache ('boneash-art'), kept across versions; a phone downloads one
// again only when its fingerprint here changes. File names never change: replace the file, then run
//   node tools/arthash.mjs --write    (rewrites the ART table in sw.js)
//   node tools/arthash.mjs            (checks it; tools/consistency.mjs runs the same check)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

/** v0.11.39: which files are art (the art cache) rather than game files: images under art/ (any depth) and icons/; v0.11.149 (FN1): the fonts in css/fonts/ (kept across versions too). tools/consistency.mjs uses the same rule. */
export const ART_RE = /^(art\/.*\.(jpg|png|svg|webp)|icons\/.*\.(png|svg)|css\/fonts\/.*\.woff2?)$/;
/** The files that go in the art cache: every picture, background and icon (sorted). */
export function artFiles(root = '.') {
    const walk = (dir) => (existsSync(`${root}/${dir}`) ? readdirSync(`${root}/${dir}`, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`])) : []); // v0.11.149: css/fonts may be absent (a test's temp copy)
    return [...walk('art'), ...walk('icons'), ...walk('css/fonts')].filter((f) => ART_RE.test(f)).sort();
}
/** A file's fingerprint: the first 10 hex digits of its SHA-256. */
export const fingerprint = (path) => createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 10);
/** The ART table as sw.js holds it (path → fingerprint). */
export function readArt(sw) {
    const body = (sw.match(/const ART = \{([\s\S]*?)\};/) || [])[1];
    if (body == null) return null;
    return Object.fromEntries([...body.matchAll(/'([^']+)': '([0-9a-f]+)'/g)].map((m) => [m[1], m[2]]));
}
/** What is wrong with sw.js's ART table against the files on disk (empty when it is right). */
export function checkArt(sw, root = '.') {
    const art = readArt(sw);
    if (!art) return ['sw.js: no ART table'];
    const fail = [];
    const files = artFiles(root);
    for (const f of files) {
        if (!(f in art)) fail.push(`sw.js ART is missing ${f} (run node tools/arthash.mjs --write)`);
        else if (art[f] !== fingerprint(`${root}/${f}`)) fail.push(`sw.js ART: ${f} changed, its fingerprint is stale (run node tools/arthash.mjs --write)`);
    }
    for (const f of Object.keys(art)) if (!files.includes(f)) fail.push(`sw.js ART lists ${f}, which is not a picture, background, icon or font in the repo`);
    return fail;
}
/** sw.js with its ART table rewritten from the files on disk. */
export function writeArt(sw, root = '.') {
    const rows = artFiles(root).map((f) => `    '${f}': '${fingerprint(`${root}/${f}`)}',`).join('\n');
    if (!/const ART = \{[\s\S]*?\};/.test(sw)) throw new Error('sw.js: no ART table to rewrite');
    return sw.replace(/const ART = \{[\s\S]*?\};/, `const ART = {\n${rows}\n};`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const sw = readFileSync('sw.js', 'utf8');
    if (process.argv.includes('--write')) {
        const out = writeArt(sw);
        if (out !== sw) writeFileSync('sw.js', out);
        console.log(`${artFiles().length} art files, the ART table ${out === sw ? 'already up to date' : 'rewritten'}`);
    } else {
        const fail = checkArt(sw);
        if (fail.length) { console.log(fail.join('\n')); process.exit(1); }
        console.log(`${artFiles().length} art files, every fingerprint current`);
    }
}
