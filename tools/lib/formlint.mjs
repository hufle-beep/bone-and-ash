// v0.11.278 (owner pick P46-A, LT; the v0.11.246 cold review's TG-T5, its L8 "six of those feet"): a demonstrative in one of Yuki's
// form branches whose noun is only in another branch ("those feet" in the great root-kin's text, the foot in the cat's alone).
// Two readers: `formHits` over the story files' `byForm(g, …)` calls with written-out branches (tools/textlint.mjs, log only), and
// `draftFormHits` over drafts keyed `scene[:index]:y:<form>` (tools/packet.mjs --check, kind `form`). "this one" / "that one" carry
// no noun to check and are left out. Changes nothing in the game.

/** "those feet" → "foot"-ish: the noun's stem (feet → foot, -ies → -y, -es / -s off). */
export function nounStem(w) {
    const x = String(w || '').toLowerCase();
    if (x === 'feet') return 'foot';
    if (x === 'teeth') return 'tooth';
    if (x === 'geese') return 'goose';
    if (x === 'mice') return 'mouse';
    if (x === 'men') return 'man';
    if (x === 'women') return 'woman';
    if (/ives$/.test(x) && x.length >= 5) return x.replace(/ives$/, 'ife'); // RV-A (L3): knives, wives, lives
    if (/ves$/.test(x) && x.length > 4) return x.replace(/ves$/, 'f'); // RV-A (L3): wolves, hooves, halves, leaves
    return x.replace(/ies$/, 'y').replace(/(ches|shes|sses|xes)$/, (m) => m.slice(0, -2)).replace(/s$/, '');
}
const DEM = /\b(those|these)\s+\*?([a-z]+)/gi; // RV-A (L3): "those *feet*" too
/** Words after "those / these" that are no noun of their own ("these ones", "those two", "those who"). */
const NOT_NOUNS = new Set(['one', 'two', 'three', 'four', 'five', 'few', 'who', 'which', 'that', 'are', 'were', 'and', 'with', 'of']);
/** RV-A (the cold review's L3): a text's words as noun stems ("footpath" is not a foot, "many" not a man; "wolves" is a wolf). */
export const stemsOf = (text) => new Set((String(text || '').toLowerCase().match(/[a-z]+/g) || []).map(nounStem));
/** One text's demonstratives whose noun is not in the text before them: [{ at, phrase, stem }]. */
export function looseDemonstratives(text) {
    const t = String(text || ''), out = [];
    for (const m of t.matchAll(DEM)) {
        const stem = nounStem(m[2]);
        if (stem.length < 3 || NOT_NOUNS.has(stem)) continue; // "these ones" points at the text before the branch, not at a noun
        if (!stemsOf(t.slice(0, m.index)).has(stem)) out.push({ at: m.index, phrase: m[0], stem });
    }
    return out;
}
/** The branches' hits: a loose demonstrative whose noun is in another branch. `branches`: [{ form, text }] (a missing text is skipped). */
export function branchHits(branches) {
    const out = [];
    branches.forEach((b, i) => {
        if (b.text == null) return;
        for (const d of looseDemonstratives(b.text)) {
            const where = branches.filter((o, j) => j !== i && o.text != null && stemsOf(o.text).has(d.stem)).map((o) => o.form);
            if (where.length) out.push({ form: b.form, phrase: d.phrase, stem: d.stem, where });
        }
    });
    return out;
}
/** A written-out string argument at `i` (quotes or backticks; a `${…}` read as one word): [text, end], or [null, end] for anything else. */
function readArg(s, i) {
    while (/\s/.test(s[i])) i++;
    const q = s[i];
    if (q === "'" || q === '"' || q === '`') {
        let j = i + 1, out = '';
        for (; j < s.length; j++) {
            const c = s[j];
            if (c === '\\') { const e = s[j + 1]; out += e === 'n' ? '\n' : e === 't' ? ' ' : e === 'r' ? '' : e; j++; continue; } // RV-A (L2): \n a line break, not the letter n
            if (q === '`' && c === '$' && s[j + 1] === '{') { out += ' X '; let d = 1; for (j += 2; j < s.length && d; j++) { if (s[j] === '{') d++; else if (s[j] === '}') d--; } j--; continue; }
            if (c === q) break;
            out += c;
        }
        let k = j + 1;
        while (/\s/.test(s[k])) k++;
        if (s[k] === ',' || s[k] === ')') return [out, k];
    }
    let d = 0, k = i;
    for (; k < s.length; k++) {
        const c = s[k];
        if ('([{'.includes(c)) d++;
        else if (')]}'.includes(c)) { if (d === 0) break; d--; } else if (c === ',' && d === 0) break;
        else if (c === "'" || c === '"' || c === '`') { for (k++; k < s.length && s[k] !== c; k++) if (s[k] === '\\') k++; }
    }
    return [null, k];
}
export const FORM_NAMES = ['cat', 'great', 'human'];
/** Every `byForm(g, …)` call in `sources` ([{ file, text }]) with two or more written-out branches: { calls, read, demonstratives, hits: [{ file, line, form, phrase, where }] }. */
export function formHits(sources) {
    let calls = 0, read = 0, demonstratives = 0;
    const hits = [];
    for (const { file, text: s } of sources) {
        for (const m of String(s).matchAll(/byForm\(\s*g\s*,/g)) {
            calls++;
            let i = m.index + m[0].length;
            const args = [];
            for (let n = 0; n < 3; n++) { const [v, e] = readArg(s, i); args.push(v); i = e + 1; if (s[e] === ')') break; }
            if (args.filter((a) => a != null).length < 2) continue;
            read++;
            const br = args.map((t, n) => ({ form: FORM_NAMES[n], text: t }));
            for (const b of br) if (b.text != null) demonstratives += [...String(b.text).matchAll(DEM)].length;
            const line = s.slice(0, m.index).split('\n').length;
            for (const h of branchHits(br)) hits.push({ file, line, ...h });
        }
    }
    return { calls, read, demonstratives, hits };
}
const FORM_KEY = /:y:(cat|great|tiger|human)$/;
/** Drafts [{ key, text }]: the `:y:<form>` drafts of one text against each other (`tiger` is the great root-kin). [{ key, what }] */
export function draftFormHits(drafts) {
    const groups = new Map();
    for (const d of drafts) {
        const m = String(d.key).match(FORM_KEY);
        if (!m) continue;
        const base = d.key.replace(FORM_KEY, '');
        if (!groups.has(base)) groups.set(base, []);
        groups.get(base).push({ form: m[1] === 'tiger' ? 'great' : m[1], text: d.text, key: d.key });
    }
    const out = [];
    for (const br of groups.values()) {
        for (const h of branchHits(br)) {
            const key = br.find((b) => b.form === h.form).key;
            out.push({ key, what: `"${h.phrase}": "${h.stem}" only in the ${h.where.join(' / ')} draft (a form reads its own text alone)` });
        }
    }
    return out;
}
