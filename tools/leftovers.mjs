#!/usr/bin/env node
// The leftover check (v0.11.22, owner 2026-11-06 21:15 / 23:19 pick A): what nothing reaches or reads any more.
// LOG ONLY for now (the rule: a new kind of check starts log-only): it never fails on a finding, only on its own errors
// (a broken keep-list). After the owner has picked what goes, the next push removes it and makes this strict.
//
//   node tools/leftovers.mjs                         static scan only (quick runs)
//   node tools/leftovers.mjs --seen a.json b.json …  plus what the bot games touched (the stats files' `seen`)
//   node tools/leftovers.mjs … --all                 every finding, not just the first few per kind
//   node tools/leftovers.mjs … --json                the findings as JSON
//
// Kinds: files nothing loads or names; game functions and constants named nowhere else (and the ones only tests use;
// `js/core/formulas.js` is the engine's own copy and is skipped); functions only main.js calls (the browser: untested,
// not leftovers); CSS classes and ids; flags set but never read, read but never set; items never given or never defined;
// `boneash.*` storage keys written but never read; `data-*` markers set but never read; story choices never shown.
// The keep-list, tools/leftovers-keep.json: what stays on purpose, with a reason each ("name*" = a prefix).
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const KINDS = ['files', 'functions', 'testOnly', 'css', 'flagsUnread', 'flagsUnset', 'items', 'storage', 'markers', 'choices'];
export const KIND_NAMES = {
    files: 'files nothing loads or names', functions: 'functions / constants named nowhere else', testOnly: 'functions only the tests use',
    css: 'CSS classes / ids nothing uses', flagsUnread: 'flags set, never read', flagsUnset: 'flags read, never set', items: 'items never given / never defined',
    storage: 'storage keys written, never read', markers: 'data-* markers set, never read', choices: 'story choices never shown in the bot games',
};

/**
 * Split JS source into code (comments gone, string text blanked, `${…}` kept) and its string literals.
 * A small tokenizer: line and block comments, '…', "…", `…` with nested ${…}, and regex literals after an operator.
 */
export function strip(src) {
    let code = '';
    const strings = [];
    let i = 0;
    const n = src.length;
    const regexOk = () => { const m = /[\s]*$/.exec(code); const before = code.slice(0, code.length - m[0].length); const c = before.slice(-1); if (/(\+\+|--)$/.test(before)) return false; return !c || '(,=:[!&|?{};+-*%<>~^'.includes(c) || /\b(return|typeof|case|in|of|void|delete|new|throw)$/.test(before); };
    function readTemplate() { // at the char after the opening `; returns at the char after the closing `
        let text = '';
        while (i < n && src[i] !== '`') {
            if (src[i] === '\\') { text += src[i + 1] ?? ''; i += 2; continue; }
            if (src[i] === '$' && src[i + 1] === '{') {
                strings.push(text); text = '';
                i += 2; code += '${';
                let depth = 1;
                while (i < n && depth) {
                    const before = i; readToken();
                    if (i === before) { const c = src[i]; if (c === '{') depth++; else if (c === '}') { depth--; if (!depth) { i++; break; } } code += c; i++; }
                }
                code += '}';
                continue;
            }
            text += src[i++];
        }
        strings.push(text);
        i++;
    }
    function readToken() { // consumes one comment / string / template / regex if one starts at i
        const c = src[i], d = src[i + 1];
        if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; return; }
        if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; code += ' '; return; }
        if (c === "'" || c === '"') {
            let j = i + 1, s = '';
            while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') { s += src[j + 1]; j += 2; } else s += src[j++]; }
            strings.push(s); code += c + c; i = j + 1; return;
        }
        if (c === '`') { i++; code += '``'; readTemplate(); return; }
        if (c === '/' && regexOk()) {
            let j = i + 1, cls = false;
            while (j < n && src[j] !== '\n') { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; else if (src[j] === '/' && !cls) break; j++; }
            j++; while (j < n && /[a-z]/.test(src[j])) j++;
            code += '/r/'; i = j; return;
        }
    }
    while (i < n) { const before = i; readToken(); if (i === before) code += src[i++]; }
    return { code, strings };
}

const words = (code) => { const m = new Map(); for (const w of code.match(/[A-Za-z_$][\w$]*/g) || []) m.set(w, (m.get(w) || 0) + 1); return m; };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Top-level names (function, const, let, class) per file, with how often each name appears in the given code bodies. */
export function scanFunctions(game, other, skip = []) {
    const gameW = new Map(), perFile = {};
    for (const [f, s] of Object.entries(game)) { perFile[f] = words(s.code); for (const [w, k] of perFile[f]) gameW.set(w, (gameW.get(w) || 0) + k); }
    const otherW = new Map(); for (const s of Object.values(other)) for (const [w, k] of words(s.code)) otherW.set(w, (otherW.get(w) || 0) + k);
    const unused = [], testOnly = [], browserOnly = [];
    for (const [f, s] of Object.entries(game)) {
        if (skip.includes(f)) continue;
        const names = new Set();
        for (const m of s.code.matchAll(/(?:^|\n)(?:export\s+)?(?:async\s+)?(?:function\*?\s+([A-Za-z_$][\w$]*)|(?:const|let|var|class)\s+([A-Za-z_$][\w$]*))/g)) names.add(m[1] || m[2]);
        for (const m of s.code.matchAll(/(?:^|\n)(?:export\s+)?(?:const|let)\s+\{([^}]*)\}\s*=/g)) for (const x of m[1].split(',')) { const w = x.split(':').pop().trim(); if (/^[A-Za-z_$][\w$]*$/.test(w)) names.add(w); }
        for (const name of names) {
            const total = gameW.get(name) || 0;
            if (total > 1) {
                if (f !== 'js/main.js' && (perFile['js/main.js']?.get(name) || 0) > 0 && !otherW.get(name)) {
                    const elsewhere = Object.entries(perFile).some(([g, w]) => g !== 'js/main.js' && g !== f && w.get(name)) || (perFile[f].get(name) || 0) > 1;
                    if (!elsewhere) browserOnly.push(`${name} (${f})`);
                }
                continue;
            }
            (otherW.get(name) ? testOnly : unused).push(`${name} (${f})`);
        }
    }
    return { unused, testOnly, browserOnly };
}

/** Flags: where each name is written and read in the code (static), with every exact string literal as a mention. */
export function scanFlags(game) {
    const W = new Set(), R = new Set(), M = new Set();
    const ASSIGN = '\\s*(?:=(?!=)|\\+\\+|--|[-+*/%|&?]{1,2}=)';
    for (const s of Object.values(game)) {
        const c = s.code;
        // g.flags.x, g.flags?.x, and an alias (const f = (g && g.flags) || {}; f.x)
        const aliases = [...c.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*\(?[\w\s&|.?]*\.flags\)?\s*(?:\|\|\s*\{\s*\})?\s*[;,]/g)].map((m) => m[1]);
        for (const name of ['flags', ...aliases]) {
            const re = new RegExp(`(delete\\s+[\\w.?]*)?(?<![\\w$])${name}\\??\\.([A-Za-z_$][\\w$]*)(?![\\w$]*\\s*\\()(${ASSIGN})?`, 'g');
            for (const m of c.matchAll(re)) (m[1] || m[3] ? W : R).add(m[2]);
        }
        for (const m of c.matchAll(/Object\.assign\(\s*[\w.]*flags\s*,\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/([A-Za-z_$][\w$]*)\s*:/g)) W.add(k[1]);
        for (const x of s.strings) if (/^[a-z][a-z0-9_]*$/.test(x)) M.add(x);
    }
    // string-literal forms: set('a', 'b'), markDaily(g, 'k') write; once('a'), daily('k'), flags['a'] read
    for (const s of Object.values(game)) {
        const raw = s.raw;
        for (const m of raw.matchAll(/\bset\(\s*((?:'[^']*'\s*,?\s*)+)\)/g)) for (const k of m[1].matchAll(/'([^']*)'/g)) W.add(k[1]);
        for (const m of raw.matchAll(/markDaily\(\s*\w+\s*,\s*'([^']+)'/g)) W.add(m[1]);
        for (const m of raw.matchAll(/\b(?:once|daily)\(\s*'([^']+)'/g)) R.add(m[1]);
        for (const m of raw.matchAll(new RegExp(`flags\\[\\s*'([^']+)'\\s*\\](${ASSIGN})?`, 'g'))) (m[2] ? W : R).add(m[1]);
        for (const m of raw.matchAll(/for \(const \w+ of \[([^\]]*)\]\) [\w.]*flags\[\w+\] = /g)) for (const k of m[1].matchAll(/'([^']*)'/g)) W.add(k[1]);
        // for (const f of Object.keys(TABLE)) if (g.flags[f]) …: the table's keys are read (coil.js: REMEMBER, KNOW_TEXT)
        for (const m of raw.matchAll(/for \(const \w+ of Object\.keys\((\w+)\)\)[^\n]*flags\[\w+\]/g)) {
            for (const f of Object.values(game)) { const t = new RegExp(`(?:const|let)\\s+${m[1]}\\s*=\\s*\\{([^}]*)\\}`).exec(f.raw); if (t) for (const k of t[1].matchAll(/(?:^|[,{\s])([a-z][a-z0-9_]*)\s*:/g)) R.add(k[1]); }
        }
    }
    return { W, R, M };
}

/** Flags set but never read, and read but never set (static, then cleared by what the bot games did). */
export function flagFindings({ W, R, M }, seen) {
    const read = (k) => R.has(k) || seen?.flagsRead?.has(k);
    const unread = [...W].filter((k) => !read(k) && !(M.has(k) && !seenStrict(seen))).sort();
    const unset = [...R].filter((k) => !W.has(k) && !(M.has(k) && !seenStrict(seen)) && !seen?.flagsWritten?.has(k)).sort();
    return { unread, unset };
}
// with the bots' data, a flag whose name also appears as a plain string still counts (no game read or set it); without it, a
// plain string may be a key the code builds (for (const f of ['a', 'b']) g.flags[f] …), so it hides the finding
const seenStrict = (seen) => !!seen?.flagsRead?.size;

/** CSS classes and ids in the stylesheet that no JS or HTML names. */
export function scanCss(css, corpus) {
    const body = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\([^)]*\)/g, '');
    const sel = body.replace(/\{[^}]*\}/g, '{}');
    const cls = new Set([...sel.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
    const ids = new Set([...sel.matchAll(/#([A-Za-z_][\w-]*)/g)].map((m) => m[1]));
    const used = (w) => new RegExp(`(^|[^\\w-])${esc(w)}($|[^\\w-])`).test(corpus);
    const built = [...corpus.matchAll(/(?:^|[\s'"`])([A-Za-z][\w-]*-)\$\{/g)].map((m) => m[1]); // class="… b-${band}"
    const dyn = (w) => built.some((p) => w.startsWith(p));
    return [...[...cls].filter((c) => !used(c) && !dyn(c)).map((c) => `.${c}`), ...[...ids].filter((c) => !used(c)).map((c) => `#${c}`)].sort();
}

/** data-* markers the game writes into its HTML but nothing reads (game or tests). */
export function scanMarkers(gameText, readers) {
    const set = new Set([...gameText.matchAll(/\bdata-([a-z][a-z0-9-]*)\s*=/g)].map((m) => m[1]));
    const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
    return [...set].filter((d) => {
        const re = new RegExp(`\\[data-${esc(d)}[\\]=~|^$*\\s]|data-${esc(d)}['"]\\)|dataset\\.${esc(camel(d))}\\b(?!\\s*=[^=])|dataset\\[['"]${esc(camel(d))}['"]\\]`);
        return !re.test(readers);
    }).sort();
}

/**
 * boneash.* storage keys written but never read. Keys are literals or constants (const K = 'boneash.x'; const S = (n) =>
 * `boneash.slot${n}`); reads are store.get / getItem, writes store.set / setItem, matched on the exact key or its constant.
 */
export function scanStorage(mainRaw) {
    const consts = new Map(); // name → key
    for (const m of mainRaw.matchAll(/(?:const|let|,)\s*([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)\s*=>\s*)?['"`](boneash\.[\w.]*?)(?:\$\{[^}]*\})?['"`]/g)) consts.set(m[1], m[2]);
    const keys = new Set([...mainRaw.matchAll(/['"`](boneash\.[\w.]*?)(?:['"`]|\$\{)/g)].map((m) => m[1]));
    const refs = (k) => [`['"\`]${esc(k)}(?:['"\`]|\\$\\{)`, ...[...consts].filter(([, v]) => v === k).map(([n]) => `\\b${esc(n)}\\b`)].join('|');
    const out = [];
    for (const k of keys) {
        const r = refs(k);
        const call = (fns) => new RegExp(`(?:${fns})\\(\\s*(?:${r})`).test(mainRaw);
        const writes = call('store\\.set|setItem'), reads = call('store\\.get|getItem');
        const listed = new RegExp(`startsWith\\(\\s*(?:${r})`).test(mainRaw); // read by a scan of every key with this prefix
        if (writes && !reads && !listed) out.push(k);
    }
    return out.sort();
}

/** Tracked files that no other tracked file (docs aside) loads or names. */
export function scanFiles(tracked, texts) {
    const corpus = Object.entries(texts);
    return tracked.filter((f) => {
        const base = path.basename(f), stem = base.replace(/\.[^.]+$/, ''), dir = path.dirname(f) + '/';
        const named = corpus.some(([g, t]) => g !== f && (t.includes(f) || new RegExp(`(^|[^\\w.-])${esc(base)}($|[^\\w-])`).test(t)));
        const built = corpus.some(([g, t]) => g !== f && t.includes(dir) && new RegExp(`['"]${esc(stem)}['"]`).test(t)); // art/bg/${img}.jpg with 'forest'
        return !named && !built;
    }).sort();
}

/** The keep-list: { kind: { name or "prefix*": reason } }. Returns the findings left, and keep entries that matched nothing. */
export function applyKeep(findings, keep) {
    const left = {}, stale = [], kept = {};
    const key = (s) => s.replace(/ \(.*\)$/, '');
    for (const kind of KINDS) {
        const k = keep[kind] || {};
        const used = new Set();
        const match = (x) => Object.keys(k).find((p) => (p.endsWith('*') ? key(x).startsWith(p.slice(0, -1)) : key(x) === p));
        left[kind] = []; kept[kind] = 0;
        for (const x of findings[kind] || []) { const p = match(x); if (p) { used.add(p); kept[kind]++; } else left[kind].push(x); }
        for (const p of Object.keys(k)) if (!used.has(p)) stale.push(`${kind}: ${p}`);
    }
    return { left, stale, kept };
}

/** Load the keep-list; every entry needs a reason (a broken list is the one way this check fails). */
export function loadKeep(file) {
    if (!existsSync(file)) return { keep: {}, errors: [] };
    const j = JSON.parse(readFileSync(file, 'utf8'));
    const errors = [];
    for (const [kind, o] of Object.entries(j.keep || {})) {
        if (!KINDS.includes(kind)) errors.push(`unknown kind "${kind}"`);
        for (const [name, why] of Object.entries(o || {})) if (typeof why !== 'string' || why.trim().length < 3) errors.push(`${kind}: ${name} has no reason`);
    }
    return { keep: j.keep || {}, errors };
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
    const argv = process.argv.slice(2);
    const ALL = argv.includes('--all'), JSON_OUT = argv.includes('--json');
    const si = argv.indexOf('--seen');
    const seenFiles = si < 0 ? [] : argv.slice(si + 1).filter((a) => !a.startsWith('--'));
    const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean).filter((f) => existsSync(path.join(ROOT, f)));
    const read = (f) => readFileSync(path.join(ROOT, f), 'utf8');
    const isText = (f) => /\.(js|mjs|py|html|css|json|webmanifest|sh|yml|svg|md|txt)$/.test(f);
    const gameFiles = tracked.filter((f) => /^js\/.*\.js$/.test(f));
    const otherFiles = tracked.filter((f) => /^(tests|tools)\/.*\.(mjs|js)$/.test(f) || f === 'sw.js');
    const game = Object.fromEntries(gameFiles.map((f) => { const raw = read(f); return [f, { raw, ...strip(raw) }]; }));
    const other = Object.fromEntries(otherFiles.map((f) => { const raw = read(f); return [f, { raw, ...strip(raw) }]; }));
    const html = read('index.html');
    other['index.html'] = { raw: html, code: html, strings: [] };

    // what the bot games touched
    let seen = null;
    if (seenFiles.length) {
        seen = { flagsRead: new Set(), flagsWritten: new Set(), itemsRead: new Set(), itemsWritten: new Set(), choices: new Set() };
        for (const f of seenFiles) { const s = JSON.parse(readFileSync(f, 'utf8')).seen || {}; for (const k of Object.keys(seen)) for (const x of s[k] || []) seen[k].add(x); }
    }

    const fn = scanFunctions(game, other, ['js/core/formulas.js']);
    const flags = flagFindings(scanFlags(game), seen);
    const gameText = Object.values(game).map((s) => s.raw).join('\n') + '\n' + html;
    const testText = [...tracked.filter((f) => /^(tests|tools)\//.test(f) && /\.(mjs|js|py)$/.test(f))].map(read).join('\n');
    const findings = {
        files: scanFiles(tracked, Object.fromEntries(tracked.filter((f) => isText(f) && !f.endsWith('.md') && f !== 'tools/leftovers-keep.json').map((f) => [f, read(f)]))),
        functions: fn.unused, testOnly: fn.testOnly,
        css: scanCss(read('css/style.css'), gameText),
        flagsUnread: flags.unread, flagsUnset: flags.unset,
        items: [], storage: scanStorage(read('js/main.js')),
        markers: scanMarkers(gameText, gameText + '\n' + testText + '\n' + read('css/style.css')),
        choices: [],
    };
    const { SCENES, ITEMS } = await import(pathToFileURL(path.join(ROOT, 'js/story/prologue.js')).href);
    const mentions = new Set(Object.values(game).flatMap((s) => s.strings));
    for (const id of Object.keys(ITEMS)) if (!mentions.has(id) && !seen?.itemsWritten?.has(id)) findings.items.push(`${id} (never given)`);
    if (seen) {
        for (const id of seen.itemsWritten) if (!ITEMS[id]) findings.items.push(`${id} (given, not defined)`);
        for (const s of Object.values(SCENES)) (s.choices || []).forEach((c, i) => { if (!seen.choices.has(`${s.id}#${i}`)) findings.choices.push(`${s.id}#${i} (${String(typeof c.text === 'string' ? c.text : '(text by state)').slice(0, 50)})`); });
    }
    const { keep, errors } = loadKeep(path.join(ROOT, 'tools/leftovers-keep.json'));
    if (errors.length) { console.log(`tools/leftovers-keep.json is broken:\n${errors.map((e) => `  - ${e}`).join('\n')}`); process.exit(1); }
    const { left, stale, kept } = applyKeep(findings, keep);
    if (JSON_OUT) { console.log(JSON.stringify({ seen: !!seen, findings: left, kept, stale, browserOnly: fn.browserOnly }, null, 2)); process.exit(0); }
    const CAP = ALL ? Infinity : 12;
    for (const kind of KINDS) {
        if (kind === 'choices' && !seen) continue;
        const l = left[kind];
        console.log(`  ${KIND_NAMES[kind]}: ${l.length}${kept[kind] ? ` (+${kept[kind]} kept on purpose)` : ''}${l.length ? `: ${l.slice(0, CAP).join(', ')}${l.length > CAP ? `, … (${l.length - CAP} more: --all)` : ''}` : ''}`);
    }
    console.log(`  functions only main.js calls (the browser; untested, not leftovers): ${fn.browserOnly.length}${ALL ? `: ${fn.browserOnly.join(', ')}` : ''}`);
    if (stale.length) console.log(`  keep-list entries that match nothing now (log only): ${stale.join(', ')}`);
    const total = KINDS.reduce((a, k) => a + left[k].length, 0);
    console.log(`log only: ${total} possible leftovers (${KINDS.filter((k) => left[k].length).map((k) => `${left[k].length} ${k}`).join(', ') || 'none'})${seen ? '' : ', static scan only'}; ${KINDS.reduce((a, k) => a + kept[k], 0)} kept on purpose`);
}
