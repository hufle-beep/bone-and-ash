#!/usr/bin/env node
// v0.11.283 (owner pick P51-A, SV-p): join a save shared to GitHub in parts ("…-part1of2.txt", "…-part2of2.txt") into one file.
// The parts are slices of the same text (js/core/app.js saveParts), so the joined file is the save as the game wrote it; a
// packed save ("BAZ1:…") is checked by unpacking it. Changes nothing in the game.
//
//   node tools/joinsave.mjs saves/2026-11-26-1950-incremental-ashfall-part1of2.txt    writes saves/…-ashfall.txt
//   node tools/joinsave.mjs <any part> --out FILE                                     writes FILE instead
//   node tools/joinsave.mjs <any part> --check                                        checks only, writes nothing
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/** A part file's name → { stem, i, n, ext } or null ("…-ashfall-part1of2.txt" → stem "…-ashfall"). */
export function partOf(name) {
    const m = /^(.*)-part(\d+)of(\d+)(\.\w+)?$/.exec(String(name || ''));
    if (!m) return null;
    const i = Number(m[2]), n = Number(m[3]);
    return i >= 1 && i <= n ? { stem: m[1], i, n, ext: m[4] || '' } : null;
}
/** The parts joined in order: { text } or { missing: [part numbers] } when any of 1..n is absent. `parts`: { [i]: text }. */
export function joinParts(parts, n) {
    const missing = [];
    for (let i = 1; i <= n; i++) if (typeof parts[i] !== 'string') missing.push(i);
    return missing.length ? { missing } : { text: Array.from({ length: n }, (_, k) => parts[k + 1]).join('') };
}

/** Join the parts next to `file`. Returns { out, text, n } or throws with what is wrong. */
export function joinSave(file) {
    const dir = path.dirname(file), p = partOf(path.basename(file));
    if (!p) throw new Error(`${path.basename(file)} is not a part ("…-part1of2.txt")`);
    const parts = {};
    for (let i = 1; i <= p.n; i++) {
        const f = path.join(dir, `${p.stem}-part${i}of${p.n}${p.ext}`);
        if (fs.existsSync(f)) parts[i] = fs.readFileSync(f, 'utf8').replace(/\r?\n$/, ''); // GitHub's editor may add a last newline
    }
    const r = joinParts(parts, p.n);
    if (r.missing) throw new Error(`missing part${r.missing.length === 1 ? '' : 's'} ${r.missing.join(', ')} of ${p.n}`);
    checkSave(r.text);
    return { out: path.join(dir, `${p.stem}${p.ext}`), text: r.text, n: p.n };
}
/** A packed save must unpack to JSON; a plain one must parse. Throws when it doesn't. */
export function checkSave(text) {
    const t = String(text).trim();
    const json = t.startsWith('BAZ1:') ? zlib.gunzipSync(Buffer.from(t.slice(5), 'base64')).toString() : t;
    JSON.parse(json);
    return json.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
    const args = process.argv.slice(2);
    const file = args.find((a) => !a.startsWith('--'));
    if (!file) { console.error('Usage: node tools/joinsave.mjs <a part file> [--out FILE] [--check]'); process.exit(2); }
    try {
        const r = joinSave(file);
        const oi = args.indexOf('--out');
        const out = oi >= 0 ? args[oi + 1] : r.out;
        if (args.includes('--check')) console.log(`OK: ${r.n} parts, ${r.text.length} characters (not written)`);
        else { fs.writeFileSync(out, r.text); console.log(`Joined ${r.n} parts → ${out} (${r.text.length} characters)`); }
    } catch (err) { console.error(`joinsave: ${err.message}`); process.exit(1); }
}
