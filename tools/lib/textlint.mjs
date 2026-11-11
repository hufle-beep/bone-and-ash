// v0.11.132 (owner picks PL1, E1): the story-text lint's rules, pure functions (tools/textlint.mjs runs them on the game;
// tests/tools.test.mjs tests them on made-up texts). Log only: counts, never a failure. Ideas and the shingle, tic and
// broken-text rules adapted from the owner's Rules Engine C (hufle-beep/Shared-ST, st/rules-engine-c/lib/replyCheck.js,
// loops.js, brokenReply.js; the owner's own code, free to adapt).
//   SH reused passages: 5-word chunks (two real words or more) shared by two scenes; a pair sharing REUSED+ is a reused passage
//   FV favourite phrases: 3-word phrases with two real words that are not names or canon terms, in FAV_MIN+ scenes, overlaps chained
//   TC tics: 2–3 words used TIC_MIN+ times inside one text, around a word of 5+ letters
//   BD broken text: Rules Engine C's kinds plus code leftovers and stray asterisks (a lone "*" line is the scene break);
//      spacing (doubled spaces, empty paragraphs from an empty ${}) counted apart: the screen drops both
//   RD render coverage: a text written as a function that renders on none of the sample states

export const SHINGLE = 5, REUSED = 5, FAV_MIN = 4, TIC_MIN = 3;

export const STOP = new Set(('a an the and or but if then so of to in on at by for with from into onto over under up down out off '
    + 'is are was were be been being am do does did done have has had it its it\'s this that these those there here '
    + 'he she they we you i me him her them us his hers their our your my mine not no nor as than too very just '
    + 'what which who whom whose when where why how all any each every some one two own same other such only '
    + 'can could will would shall should may might must s t don\'t doesn\'t didn\'t isn\'t wasn\'t you\'re you\'ve '
    + 'like about again still even back now then way thing things said says say through because something looks look '
    + 'looking door city small while across around against without before after toward towards').split(/\s+/));

/** Names, and canon terms (as phrases): a favourite phrase needs two real words that are neither; they are the world's vocabulary, not tics. */
export const NAMES = new Set(('mei lin ya yuki wen lu han gao feng shen qiu james hu fang wei tan').split(/\s+/));
export const CANON = ['crimson lotus', 'dead tree', 'hearth tree', 'hearth trees', 'root-kin', 'root kin', 'long forest', 'root road', 'bone field',
    'ouroboros axiom', 'parallel cognition', 'hammerspace', 'omnitool', 'outer disciple', 'inner disciple', 'outer court', 'beast core', 'beast cores',
    'golden core', 'nascent soul', 'foundation establishment', 'mortal vessel', 'convergence', 'bonesinger', 'wraithbone', 'tribute post',
    'drowned wood', 'herb loft', 'sect master', 'shrine roof', 'outer elder', 'old wen', 'ashfall', 'blackroot'];
const CANON_RE = new RegExp(`\\b(?:${CANON.map((c) => c.replace(/[-\s]+/g, '[-\\s]+')).join('|')})\\b`, 'gi');
/** a text with every canon term made one placeholder word (never a real word of a phrase) */
export const canonOut = (t) => String(t).replace(CANON_RE, ' zzcanon ');

export const tokens = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’‘]/g, "'").replace(/-/g, ' ').match(/[a-z']+/g) || [];
const real = (w) => !STOP.has(w) && w.length > 2;
const own = (w) => real(w) && w !== 'zzcanon' && !NAMES.has(w.replace(/'s$/, ''));

/** SH: the 5-word chunks of a text with at least two real words. */
export function shingles(text, n = SHINGLE) {
    const w = tokens(text), out = new Set();
    for (let i = 0; i + n <= w.length; i++) {
        const c = w.slice(i, i + n);
        if (c.filter(real).length >= 2) out.add(c.join(' '));
    }
    return out;
}

/** SH over texts [{ id, t }]: { chunks: shared chunk count, scenes: Set of ids, pairs: Map 'a~b' → shared chunks, reused: [[pair, n]] } */
export function reusedPassages(texts, min = REUSED) {
    const m = new Map();
    for (const { id, t } of texts) for (const k of shingles(t)) { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(id); }
    const scenes = new Set(), pairs = new Map();
    let chunks = 0;
    for (const ids of m.values()) {
        if (ids.size < 2) continue;
        chunks++;
        const a = [...ids].sort();
        for (const x of a) scenes.add(x);
        for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) { const k = `${a[i]}~${a[j]}`; pairs.set(k, (pairs.get(k) || 0) + 1); }
    }
    const reused = [...pairs].filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    return { chunks, scenes, pairs, reused };
}

/** FV over texts [{ id, t }]: favourite phrases, overlapping 3-word runs chained into one; [{ phrase, scenes: Set }] by scene count. */
export function favouritePhrases(texts, min = FAV_MIN) {
    const where = new Map();
    const grams = (w) => { const o = []; for (let i = 0; i + 3 <= w.length; i++) o.push(w.slice(i, i + 3)); return o; };
    const ok = (g) => g.filter(own).length >= 2; // as Rules Engine C: two real words that are not names (or canon terms)
    for (const { id, t } of texts) for (const g of grams(tokens(canonOut(t)))) if (ok(g)) { const k = g.join(' '); if (!where.has(k)) where.set(k, new Set()); where.get(k).add(id); }
    const fav = new Set([...where].filter(([, s]) => s.size >= min).map(([k]) => k));
    // chain: favourites that follow each other in a text (overlap by two words) are one phrase
    const parent = new Map([...fav].map((k) => [k, k]));
    const find = (k) => { while (parent.get(k) !== k) { parent.set(k, parent.get(parent.get(k))); k = parent.get(k); } return k; };
    const runs = new Map(); // root → longest run text
    for (const { t } of texts) {
        const gs = grams(tokens(canonOut(t))).map((g) => g.join(' '));
        for (let i = 0; i + 1 < gs.length; i++) if (fav.has(gs[i]) && fav.has(gs[i + 1])) { const a = find(gs[i]), b = find(gs[i + 1]); if (a !== b) parent.set(b, a); }
    }
    const out = new Map();
    for (const k of fav) { const r = find(k); const e = out.get(r) || { parts: [], scenes: new Set() }; e.parts.push(k); for (const s of where.get(k)) e.scenes.add(s); out.set(r, e); }
    for (const { t } of texts) { // the phrase shown: the longest chained run met in a text
        const gs = grams(tokens(canonOut(t))).map((g) => g.join(' '));
        for (let i = 0; i < gs.length; i++) {
            if (!fav.has(gs[i])) continue;
            let j = i; while (j + 1 < gs.length && fav.has(gs[j + 1]) && find(gs[j + 1]) === find(gs[i])) j++;
            const text = [...gs[i].split(' '), ...gs.slice(i + 1, j + 1).map((g) => g.split(' ')[2])].join(' ');
            const r = find(gs[i]); if (text.length > (runs.get(r) || '').length) runs.set(r, text);
            i = j;
        }
    }
    return [...out].map(([r, e]) => ({ phrase: (runs.get(r) || r).replace(/zzcanon/g, '…'), scenes: e.scenes })).sort((a, b) => b.scenes.size - a.scenes.size || (a.phrase < b.phrase ? -1 : 1));
}

/** TC: tics in one text: [{ phrase, n }] (2–3 words used TIC_MIN+ times, a word of 5+ letters; a 2-word tic inside a 3-word one dropped). */
export function tics(text, min = TIC_MIN) {
    const w = tokens(text), found = [];
    for (const n of [3, 2]) {
        const cnt = new Map();
        for (let i = 0; i + n <= w.length; i++) { const k = w.slice(i, i + n).join(' '); cnt.set(k, (cnt.get(k) || 0) + 1); }
        for (const [k, c] of cnt) {
            if (c < min || !k.split(' ').some((x) => !STOP.has(x) && x.length >= 5)) continue;
            if (found.some((f) => f.phrase.includes(k))) continue;
            found.push({ phrase: k, n: c });
        }
    }
    return found;
}

const CJK = /[぀-ヿ㐀-鿿가-힯＀-￯]/g;
export const BROKEN = {
    language: (t) => (t.match(CJK) || []).length >= 20, // Rules Engine C: switched script
    glued: (t) => (t.match(/[A-Za-z']{30,}/g) || []).length > 0,
    synonyms: (t) => /\b(?:[A-Za-z]+ly[\s,]+){6,}[A-Za-z]+ly\b/i.test(t),
    hyphens: (t) => /\b(?:[A-Za-z]+-){8,}[A-Za-z]+/.test(t),
    drafting: (t) => t.split('\n').some((l) => !/["“”]/.test(l) && /\b(?:let ?me (?:redo|rewrite|start (?:fresh|over|again))|this approach isn'?t? working)\b/i.test(l)),
    code: (t) => /\bundefined\b|\bNaN\b|\[object |\$\{|\bTODO\b|\bFIXME\b|\bALT [AB]\b/.test(t),
    asterisks: (t) => t.split(/\n\s*\n/).some((p) => p.trim() !== '*' && (p.match(/(?<!\*)\*(?!\*)/g) || []).length % 2 === 1),
};
/** BD: the broken kinds a text shows (names of BROKEN). */
export const broken = (t) => Object.keys(BROKEN).filter((k) => BROKEN[k](String(t)));
/** Spacing the screen drops (main.js trims paragraphs and skips empty ones): doubled spaces, an empty paragraph. */
export const spacing = (t) => /[^\n ] {2,}/.test(t) || /\n[ \t]*\n[ \t]*\n/.test(t);

const wc = (t) => (String(t).match(/\S+/g) || []).length;

/**
 * Every count of the lint for one set of renderings. `rows`: [{ id, area, kind: 'text' | 'label', renders: [string], fn, unrendered }]
 * (the first rendering is the base text, the rest its variants). Returns { totals, areas, lists }.
 */
export function lintCounts(rows) {
    const texts = rows.filter((r) => r.kind === 'text').flatMap((r) => r.renders.map((t) => ({ id: r.id, t })));
    const areaOf = new Map(rows.map((r) => [r.id, r.area]));
    const sh = reusedPassages(texts);
    const fv = favouritePhrases(texts);
    const tc = [];
    for (const r of rows) if (r.kind === 'text') { const seen = new Set(); for (const t of r.renders) for (const x of tics(t)) if (!seen.has(x.phrase)) { seen.add(x.phrase); tc.push({ id: r.id, ...x }); } }
    const bd = [], sp = [], rd = [];
    for (const r of rows) {
        const kinds = new Set(r.renders.flatMap(broken)); for (const k of kinds) bd.push({ id: r.id, kind: r.kind, what: k });
        if (r.renders.some(spacing)) sp.push({ id: r.id, kind: r.kind });
        if (r.unrendered) rd.push({ id: r.id, kind: r.kind });
    }
    const blank = () => ({ scenes: 0, words: 0, variantWords: 0, labels: 0, labelWords: 0, sharedScenes: 0, reused: 0, favScenes: 0, tics: 0, broken: 0, spacing: 0, unrendered: 0 });
    const areas = {};
    const A = (id) => (areas[areaOf.get(id)] ||= blank());
    for (const r of rows) {
        const a = A(r.id);
        if (r.kind === 'text') { a.scenes++; if (r.renders.length) { a.words += wc(r.renders[0]); a.variantWords += r.renders.slice(1).reduce((s, t) => s + wc(t), 0); } }
        else { a.labels++; if (r.renders.length) a.labelWords += wc(r.renders[0]); }
    }
    for (const id of sh.scenes) A(id).sharedScenes++;
    for (const [pair] of sh.reused) for (const id of new Set(pair.split('~'))) A(id).reused++;
    const favIds = new Set(fv.flatMap((f) => [...f.scenes]));
    for (const id of favIds) A(id).favScenes++;
    for (const x of tc) A(x.id).tics++;
    for (const x of bd) A(x.id).broken++;
    for (const x of sp) A(x.id).spacing++;
    for (const x of rd) A(x.id).unrendered++;
    const totals = { scenes: 0, words: 0, variantWords: 0, labels: 0, labelWords: 0, sharedChunks: sh.chunks, sharedScenes: sh.scenes.size, reused: sh.reused.length, favourites: fv.length, tics: tc.length, broken: bd.length, spacing: sp.length, unrendered: rd.length };
    for (const a of Object.values(areas)) for (const k of ['scenes', 'words', 'variantWords', 'labels', 'labelWords']) totals[k] += a[k];
    return { totals, areas, lists: { reused: sh.reused, favourites: fv, tics: tc, broken: bd, spacing: sp, unrendered: rd } };
}

/** SN: what changed against a saved snapshot: [{ where, key, was, now }] (totals first, then the areas). */
export function snapshotDiff(old, now) {
    const out = [];
    if (!old) return out;
    for (const [k, v] of Object.entries(now.totals)) if (old.totals?.[k] !== v) out.push({ where: 'all', key: k, was: old.totals?.[k] ?? null, now: v });
    const names = new Set([...Object.keys(old.areas || {}), ...Object.keys(now.areas)]);
    for (const a of [...names].sort()) for (const k of Object.keys(now.areas[a] || old.areas[a])) {
        const was = old.areas?.[a]?.[k] ?? null, n = now.areas[a]?.[k] ?? null;
        if (was !== n) out.push({ where: a, key: k, was, now: n });
    }
    return out;
}

/** EB / RP: a share (in %) of a model's run against its saved copy: 'note' past max(minPts, 3 × its noise), else 'ok'. Needs n ≥ minN on both sides. */
export function shareNote(was, now, { minPts = 5, minN = 50, k = 3 } = {}) {
    if (!was || !now || was.n < minN || now.n < minN) return 'ok';
    const q = Math.min(1, Math.max(0, (was.v + now.v) / 200));
    const v = Math.max(q * (1 - q), 0.25 / Math.max(was.n, now.n));
    const noise = 100 * Math.sqrt(v * (1 / was.n + 1 / now.n));
    return Math.abs(now.v - was.v) > Math.max(minPts, k * noise) ? 'note' : 'ok';
}
