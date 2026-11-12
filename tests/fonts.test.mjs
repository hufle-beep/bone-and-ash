// Run: node tests/fonts.test.mjs — v0.11.149 (owner pick FN1): the game's two fonts ship with it (css/fonts/, trimmed by
// tools/fonts.py from google/fonts). A the files (four .woff, the two OFL texts; sizes); B the licence (OFL 1.1, no Reserved Font
// Name, so the names are kept; copyright and licence in each file's name table); C the cuts the game asked Google Fonts for
// (Literata upright 400-600 with its optical sizes, italic 400 with its optical sizes, Shippori Mincho 600 and 800); D every
// character the game's text uses has a glyph in Literata, and in Shippori Mincho (titles, headings, buttons), or is on that font's
// list of symbols the phone draws (a new character is flagged; FX1, DS), and the seal's 骨 is in Shippori; E the stylesheet's four
// @font-face rules, the two preloads (FX1, PL), nothing asked of Google Fonts anywhere; F sw.js keeps the fonts in the art cache
// (by fingerprint) and the licence texts offline. The fonts Chromium really draws with, and a font from the art cache offline:
// browser parts 2 (fonts_local) and 3. Mutation: each mutant of the inputs fails the checks.
// The font report needs python3 with fontTools (tools/fonts.py --report). FX1 (NT): without it A (files), B (texts), E and F
// still run and the test fails.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };

const WOFF = ['Literata.woff', 'Literata-Italic.woff', 'ShipporiMincho-SemiBold.woff', 'ShipporiMincho-ExtraBold.woff'];
const OFL = ['OFL-Literata.txt', 'OFL-ShipporiMincho.txt'];
/** The symbols the game's text uses that Literata (the body font) lacks: the phone draws them, as before v0.11.149. */
const PHONE = '↔▸▾★☰✕骨🎲';
/** The same for Shippori Mincho (the display font: titles, headings, buttons). */
const PHONE_DISPLAY = 'ō⁂↔≈≤≥▸▾★☰✕🎲';

const r = spawnSync('python3', ['-I', path.join(ROOT, 'tools/fonts.py'), '--report', path.join(ROOT, 'css/fonts')], { encoding: 'utf8' });
let report = null;
try { report = JSON.parse(r.stdout); } catch { /* below */ }
assert(!!report, `the font report ran (tools/fonts.py --report; python3 with fontTools)${report ? '' : `: ${String(r.stderr || r.error || '').split('\n').slice(-2).join(' ')}`}`);

/** The characters the game's text uses (js/, index.html, the stylesheet). */
function gameChars() {
    const files = [];
    const walk = (d) => { for (const e of readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name)) files.push(p); } };
    walk('js');
    const s = new Set();
    for (const f of [...files, 'index.html', 'css/style.css']) for (const ch of read(f)) { const c = ch.codePointAt(0); if (c > 126) s.add(c); }
    return s;
}
const sortStr = (s) => [...s].sort().join('');

/** Every check on one set of inputs (the real ones or a mutant): the failures' labels. Without a report, A, B, E and F only. */
function suite({ rep, css, sw, html, chars, ofl, files }) {
    const bad = [];
    const t = (c, l) => { if (!c) bad.push(l); };
    // A, B (the texts), E, F: no font report needed
    t(WOFF.every((f) => files.includes(f)) && OFL.every((f) => files.includes(f)), 'A: the four .woff files and the two licence texts in css/fonts/');
    t(ofl.length === 2 && ofl.every((x) => /SIL OPEN FONT LICENSE Version 1\.1/.test(x)) && ofl.every((x) => !/with Reserved Font Name/i.test(x.split('\n')[0])), 'B: both licence texts are OFL 1.1 with no Reserved Font Name (the names may stay)');
    const face = (fam, file, w, st) => new RegExp(`@font-face \\{ font-family: "${fam}"; src: url\\("fonts/${file.replace('.', '\\.')}"\\) format\\("woff"\\); font-weight: ${w}; font-style: ${st}; font-display: swap; \\}`).test(css);
    t(face('Literata', 'Literata.woff', '400 600', 'normal') && face('Literata', 'Literata-Italic.woff', '400', 'italic') && face('Shippori Mincho', 'ShipporiMincho-SemiBold.woff', '600', 'normal') && face('Shippori Mincho', 'ShipporiMincho-ExtraBold.woff', '800', 'normal') && (css.match(/@font-face/g) || []).length === 4, 'E: four @font-face rules, one per file, with its weight and style');
    t(/--display: "Shippori Mincho"/.test(css) && /--body: "Literata"/.test(css), 'E: the stylesheet still draws with the two families');
    t(![css, sw, html].some((x) => /fonts\.(googleapis|gstatic)\.com/.test(x)), 'E: nothing asks Google Fonts (index.html, the stylesheet, sw.js)');
    t(['Literata.woff', 'ShipporiMincho-ExtraBold.woff'].every((f) => html.includes(`<link rel="preload" href="css/fonts/${f}" as="font" type="font/woff" crossorigin>`)) && (html.match(/rel="preload"/g) || []).length === 2 && html.indexOf('rel="preload"') < html.indexOf('css/style.css'), 'E: the body and title fonts preloaded before the stylesheet (FX1, PL)');
    t(WOFF.every((f) => new RegExp(`'css/fonts/${f.replace('.', '\\.')}': '[0-9a-f]{10}'`).test(sw)) && OFL.every((f) => sw.includes(`'css/fonts/${f}'`)), 'F: sw.js: the fonts in the art cache by fingerprint, the licence texts offline');
    if (!rep) return bad;
    const L = rep['Literata.woff'], LI = rep['Literata-Italic.woff'], S6 = rep['ShipporiMincho-SemiBold.woff'], S8 = rep['ShipporiMincho-ExtraBold.woff'];
    // A: the files' contents
    const sizes = WOFF.map((f) => rep[f]?.bytes || 0), total = sizes.reduce((a, b) => a + b, 0);
    t(WOFF.every((f) => rep[f]?.flavor === 'woff') && sizes.every((b) => b > 20e3 && b < 200e3) && total < 400e3, `A: WOFF files, each 20–200 KB, together under 400 KB (${Math.round(total / 1024)} KB)`);
    // B: inside the files
    t([L, LI].every((f) => /Literata Project Authors/.test(f.copyright)) && [S6, S8].every((f) => /Shippori Mincho Project Authors/.test(f.copyright)) && WOFF.every((f) => /Open Font License/.test(rep[f].licence)), 'B: each file keeps its copyright and the OFL in its name table');
    t(L.family === 'Literata' && LI.family === 'Literata' && /^Shippori Mincho/.test(S6.family) && /^Shippori Mincho/.test(S8.family), 'B: the names kept (Literata, Shippori Mincho)');
    // C
    t(JSON.stringify(L.axes) === '{"opsz":[7,72],"wght":[400,600]}' && !L.italic, 'C: Literata upright: optical sizes 7–72, weights 400–600');
    t(JSON.stringify(LI.axes) === '{"opsz":[7,72]}' && LI.italic && LI.weight === 400, 'C: Literata italic 400 with its optical sizes');
    t(S6.weight === 600 && S8.weight === 800 && !Object.keys(S6.axes).length && !Object.keys(S8.axes).length, 'C: Shippori Mincho 600 and 800');
    // D
    const has = (f, c) => f.chars.includes(c);
    const ascii = Array.from({ length: 95 }, (_, i) => 32 + i), latin1 = Array.from({ length: 96 }, (_, i) => 160 + i);
    t([L, LI, S6, S8].every((f) => ascii.every((c) => has(f, c)) && latin1.every((c) => has(f, c))), 'D: every file draws ASCII and Latin-1');
    const missing = sortStr([...chars].filter((c) => !has(L, c)).map((c) => String.fromCodePoint(c)));
    t(missing === sortStr(PHONE), `D: every character the game's text uses is in Literata or the phone's list (not in Literata: ${missing}; the list: ${PHONE})`);
    t(JSON.stringify(L.chars) === JSON.stringify(LI.chars), 'D: the italic draws what the upright draws');
    const missingD = sortStr([...chars].filter((c) => !has(S6, c)).map((c) => String.fromCodePoint(c)));
    t(missingD === sortStr(PHONE_DISPLAY) && JSON.stringify(S6.chars) === JSON.stringify(S8.chars), `D: every character the game's text uses is in Shippori Mincho or the display list (not in it: ${missingD}; the list: ${PHONE_DISPLAY}) (FX1, DS)`);
    t([S6, S8].every((f) => has(f, 0x9AA8)) && !has(L, 0x9AA8), 'D: the seal\'s 骨 in Shippori Mincho');
    return bad;
}

const base = {
    rep: report, css: read('css/style.css'), sw: read('sw.js'), html: read('index.html'), chars: gameChars(),
    ofl: OFL.filter((f) => existsSync(path.join(ROOT, 'css/fonts', f))).map((f) => read(`css/fonts/${f}`)),
    files: existsSync(path.join(ROOT, 'css/fonts')) ? readdirSync(path.join(ROOT, 'css/fonts')) : [],
};
{
    const bad = suite(base);
    assert(!bad.length, `A–F${report ? '' : ' (the parts that need no font report)'} (${bad.join('; ') || 'all hold'})`);
    for (const l of bad) console.error('        ', l);
}
assert(/^SOURCE_COMMIT = '[0-9a-f]{40}'$/m.test(read('tools/fonts.py')) && WOFF.every((f) => read('tools/fonts.py').includes(`'${f}'`)), 'G: tools/fonts.py names its google/fonts commit and makes the four files');

// Mutation: each mutant of the inputs must fail the suite (the font-report mutants only with the report)
{
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const mut = (fn) => { const m = { ...base, rep: base.rep && clone(base.rep), chars: new Set(base.chars), ofl: [...base.ofl], files: [...base.files] }; fn(m); return m; };
    const textMutants = [
        ['a face dropped', (m) => { m.css = m.css.replace(/@font-face \{ font-family: "Literata"; src: url\("fonts\/Literata-Italic\.woff"\)[^\n]*\n/, ''); }],
        ['the wrong weight', (m) => { m.css = m.css.replace('font-weight: 800;', 'font-weight: 700;'); }],
        ['Google asked again', (m) => { m.html = m.html.replace('</head>', '<link href="https://fonts.googleapis.com/css2?family=Literata" rel="stylesheet">\n</head>'); }],
        ['Google asked from sw.js', (m) => { m.sw = m.sw.replace('const ART_CACHE', '// fonts.gstatic.com\nconst ART_CACHE'); }],
        ['a preload dropped', (m) => { m.html = m.html.replace(/<link rel="preload" href="css\/fonts\/Literata\.woff"[^>]*>\n/, ''); }],
        ['a licence text missing', (m) => { m.files = m.files.filter((f) => f !== 'OFL-ShipporiMincho.txt'); m.ofl = m.ofl.slice(0, 1); }],
        ['a font not in the art cache', (m) => { m.sw = m.sw.replace(/'css\/fonts\/Literata\.woff': '[0-9a-f]{10}',/, ''); }],
    ];
    const reportMutants = [
        ['a new character the fonts lack', (m) => { m.chars.add(0x2603); }],
        ['a character trimmed from Literata', (m) => { m.rep['Literata.woff'].chars = m.rep['Literata.woff'].chars.filter((c) => c !== 0x2014); }],
        ['a display character dropped', (m) => { m.rep['ShipporiMincho-SemiBold.woff'].chars = m.rep['ShipporiMincho-SemiBold.woff'].chars.filter((c) => c !== 0x2014); }],
        ['a new character only Literata has', (m) => { m.chars.add(0x2603); for (const f of ['Literata.woff', 'Literata-Italic.woff']) { m.rep[f].chars.push(0x2603); m.rep[f].chars.sort((a, b) => a - b); } }],
        ['the seal trimmed', (m) => { m.rep['ShipporiMincho-ExtraBold.woff'].chars = m.rep['ShipporiMincho-ExtraBold.woff'].chars.filter((c) => c !== 0x9AA8); }],
        ['the optical sizes lost', (m) => { delete m.rep['Literata.woff'].axes.opsz; }],
        ['the whole weight range', (m) => { m.rep['Literata.woff'].axes.wght = [200, 900]; }],
        ['the licence dropped from a file', (m) => { m.rep['Literata-Italic.woff'].licence = ''; }],
        ['a renamed family', (m) => { m.rep['Literata.woff'].family = 'Literata Trim'; }],
        ['a font too big', (m) => { m.rep['ShipporiMincho-SemiBold.woff'].bytes = 8.6e6; }],
    ];
    const mutants = [...textMutants, ...(report ? reportMutants : [])];
    let caught = 0;
    for (const [name, fn] of mutants) { if (suite(mut(fn)).length) caught++; else console.error('        mutant survived:', name); }
    assert(caught === mutants.length, `mutation: ${caught} of ${mutants.length} mutants fail the checks`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
