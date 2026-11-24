// The long calendar's drift guard, the owner's targets and the kept stats (v0.11.268, owner pick P36-A).
// Used by tools/sanity.mjs and tools/check.mjs; tested in tests/tools.test.mjs.
//
// LG: the models' long-calendar numbers (tests/models.test.mjs --json) against tools/baseline-long.json, by the same rule as
//     tools/baseline.json: more than LIMIT points with n ≥ MIN_N on both sides is a DRIFT (it fails sanity); more than NOTE_AT
//     with n ≥ NOTE_N on both sides is a log-only NOTE. Log only from v0.11.251 to v0.11.267.
// TT: tools/targets.json, the owner's 2026-11-22 targets (roadmap.md section 2's colour key), one log-only TARGET line each.
// MB: shareTable, the models' Act 1 endings, last nights and repeated screens (tools/models-baseline.json), moved here
//     from tests/models.test.mjs so sanity --update saves both long baselines from the same run.
// KS: the full check keeps its three stats files in tools/.last-check/ (gitignored) with a stamp of the game and test code;
//     `node tools/sanity.mjs --update --last` saves exactly those numbers and refuses if the code changed since.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { LIMIT, NOTE_AT } from './noise.mjs';

export const MIN_N = 50; // as tools/baseline.json (v0.11.42, B1)
export const NOTE_N = 20; // a NOTE needs n ≥ 20 on both sides (v0.11.251, DG)
export const KEPT_DIR = 'tools/.last-check';
export const KEPT_FILES = ['tasks.json', 'story.json', 'models-long.json'];

/** The long calendar's numbers: { name: { v: percent, n } } (v0.11.251's names, unchanged). */
export function longMetricsOf(L) {
    const out = {};
    const lput = (name, k, n) => { if (n > 0) out[name] = { v: Math.round((1000 * k) / n) / 10, n }; };
    for (const [m, st] of Object.entries(L)) {
        for (const [act, nm] of [[0, 'prologue'], [1, 'Act 1']]) for (const [c, d] of Object.entries(st.deaths?.[act] || {})) if (+c <= 4) { lput(`${m} ${nm} C${c} dead`, d.dead, d.coils); if (act) lput(`${m} Act 1 C${c} taken`, d.taken, d.coils); }
        for (const [c, t] of Object.entries(st.tribute || {})) if (+c <= 4) { const n = t.won + t.paid + t.lost; lput(`${m} tribute C${c} won`, t.won, n); lput(`${m} tribute C${c} lost`, t.lost, n); }
        lput(`${m} prologue cleared on Coil 1`, st.prologueClear?.[1] || 0, st.games); lput(`${m} Act 1 cleared on Coil 1`, st.act1Clear?.[1] || 0, st.games);
        for (const [k, f] of Object.entries(st.fights || {})) lput(`${m} fight ${k}`, f.win, f.win + f.lose + (f.flee || 0));
    }
    return out;
}

/** LG: the long numbers against their baseline. flags fail sanity; notes are log only. */
export function compareLong(base, now, { limit = LIMIT, noteAt = NOTE_AT, minN = MIN_N, noteN = NOTE_N } = {}) {
    const flags = [], notes = [];
    let compared = 0, big = 0;
    const fmt = (name, b, m, d) => `${name}: ${b.v}% → ${m.v}% (${d > 0 ? '+' : ''}${d}; n ${b.n} → ${m.n})`;
    for (const [name, m] of Object.entries(now)) {
        if (m.n >= minN) big++;
        const b = base[name];
        if (!b) { if (m.n >= minN) flags.push(`${name}: new, ${m.v}% (n ${m.n})`); else if (m.n >= noteN) notes.push(`${name}: new, ${m.v}% (n ${m.n})`); continue; }
        const d = Math.round((m.v - b.v) * 10) / 10;
        if (b.n >= minN && m.n >= minN) { compared++; if (Math.abs(d) > limit) { flags.push(fmt(name, b, m, d)); continue; } }
        if (Math.abs(d) > noteAt && b.n >= noteN && m.n >= noteN) notes.push(fmt(name, b, m, d));
    }
    for (const [name, b] of Object.entries(base)) {
        if (now[name]) continue;
        if (b.n >= minN) flags.push(`${name}: was ${b.v}% (n ${b.n}), now never happens`);
        else if (b.n >= noteN) notes.push(`${name}: was ${b.v}% (n ${b.n}), now never happens`);
    }
    return { flags, notes, compared, big, total: Object.keys(now).length };
}

/** MB: the share table tools/models-baseline.json keeps (was tests/models.test.mjs's, v0.11.132). */
export function shareTable(all) {
    const out = {};
    const shares = (o) => { const n = Object.values(o || {}).reduce((a, b) => a + b, 0); return Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, { v: Math.round((1000 * v) / n) / 10, n }])); };
    for (const [m, st] of Object.entries(all)) {
        out[m] = { games: st.games, endings: shares(st.endings), nights: shares(st.nights) };
        if (st.texts?.screens) out[m].repeats = { v: Math.round((1000 * st.texts.repeats) / st.texts.screens) / 10, n: st.texts.screens };
    }
    return out;
}

/* ---------- TT: the owner's targets ---------- */
/** A model's measured value and its standard error: 'oneCoil' (percent of games), 'act1MeanCoil' (mean Coil of the Act 1 clear). */
export function measure(st, metric) {
    if (!st || !st.games) return null;
    if (metric === 'oneCoil') {
        const n = st.games, q = (st.oneCoil || 0) / n;
        return { v: Math.round(1000 * q) / 10, se: 100 * Math.sqrt(Math.max(q * (1 - q), 0.25 / n) / n), n, unit: '%' };
    }
    if (metric === 'act1MeanCoil') {
        let s = 0, s2 = 0, n = 0;
        for (const [k, c] of Object.entries(st.act1Clear || {})) { s += Number(k) * c; s2 += Number(k) ** 2 * c; n += c; }
        if (!n) return null;
        const mean = s / n, sd = Math.sqrt(Math.max(0, s2 / n - mean ** 2));
        return { v: Math.round(100 * mean) / 100, se: Math.max(sd, 0.5) / Math.sqrt(n), n, unit: '' };
    }
    throw new Error(`unknown target metric ${metric}`);
}

/** in: inside [min, max]; near: outside by no more than 2 × its standard error; out: further. */
export function verdict(v, se, min, max) {
    if (v >= min && v <= max) return 'in';
    const off = v < min ? min - v : v - max;
    return off <= 2 * se ? 'near' : 'out';
}

/** One log-only line per target and model. */
export function targetLines(targets, L) {
    const lines = [];
    for (const t of targets) {
        const min = t.min ?? t.target - t.about, max = t.max ?? t.target + t.about;
        const range = t.metric === 'oneCoil' ? (min === max ? `${min}%` : `${min}–${max}%`) : `${t.target} ± ${t.about}: ${(+min.toFixed(2))}–${(+max.toFixed(2))}`;
        for (const m of t.models) {
            const r = measure(L[m], t.metric);
            if (!r) { lines.push(`  TARGET  ${t.id} ${m}: not played in this run (target ${range})`); continue; }
            lines.push(`  TARGET  ${t.id} ${m} ${t.what}: ${r.v}${r.unit} (target ${range}; n ${r.n}): ${verdict(r.v, r.se, min, max)}`);
        }
    }
    return lines;
}

/* ---------- KS: the kept stats ---------- */
/** A hash of every file under js/ and tests/ (the game and the bots): kept stats are saved only while it matches. */
export function codeStamp(root) {
    const h = createHash('sha256');
    const walk = (dir) => {
        for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) { if (e.name !== 'node_modules' && !e.name.startsWith('.')) walk(p); }
            else if (e.isFile()) { h.update(path.relative(root, p)); h.update('\0'); h.update(readFileSync(p)); h.update('\0'); }
        }
    };
    for (const d of ['js', 'tests']) if (existsSync(path.join(root, d))) walk(path.join(root, d));
    return h.digest('hex').slice(0, 16);
}

/** Copy the full check's stats into KEPT_DIR with a stamp; false when one of the three is missing. */
export function keepStats(root, fromDir, { when = new Date().toISOString() } = {}) {
    if (!KEPT_FILES.every((f) => existsSync(path.join(fromDir, f)))) return false;
    const dir = path.join(root, KEPT_DIR);
    mkdirSync(dir, { recursive: true });
    for (const f of KEPT_FILES) copyFileSync(path.join(fromDir, f), path.join(dir, f));
    writeFileSync(path.join(dir, 'stamp.json'), `${JSON.stringify({ when, code: codeStamp(root) }, null, 1)}\n`);
    return true;
}

/** The kept stats' paths, or { error } when they are missing or the code changed since. */
export function readKept(root) {
    const dir = path.join(root, KEPT_DIR), sp = path.join(dir, 'stamp.json');
    if (!existsSync(sp) || !KEPT_FILES.every((f) => existsSync(path.join(dir, f)))) return { error: `no kept stats in ${KEPT_DIR} (run the full check first: bash tools/check.sh)` };
    const stamp = JSON.parse(readFileSync(sp, 'utf8'));
    const now = codeStamp(root);
    if (stamp.code !== now) return { error: `the kept stats (${stamp.when}) are from other code (js/ or tests/ changed since: ${stamp.code} → ${now}); run the full check again` };
    return { tasks: path.join(dir, 'tasks.json'), story: path.join(dir, 'story.json'), long: path.join(dir, 'models-long.json'), when: stamp.when };
}
