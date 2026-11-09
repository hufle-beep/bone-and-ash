// The fight lab's parts (v0.11.80, owner pick L1; research.md #52): fixed tactics, one fight played on a copy, and the
// summary (win %, rounds, HP left, by thirds of James's power, the GU each fight needs, the flags). No game file uses it.
// tools/fightlab.mjs runs it on the fights the bots meet; tests/tools.test.mjs checks these parts on made-up and real states.
import { combatHooks, startCombat, combatStep, COMBAT_ACTIONS, ensureBars, jamesHpMax } from '../../js/core/game.js';
import { actionOpen, INC_ONLY_ACTIONS } from '../../js/core/forms.js';
import { smartAction } from '../../tests/lib/smartfight.mjs'; // v0.11.96 (BT1)

/** A rank from a tier and level (T1 L1 = 1, T10 L10 = 100), and back. */
export const rank = (n) => 10 * ((n?.tier || 1) - 1) + (n?.level || 1);
export const rankLabel = (r) => `T${Math.floor((r - 1) / 10) + 1} L${((r - 1) % 10) + 1}`;

/** A small random stream per fight (the "random" tactic), so a fight plays the same in any worker. */
export const stream = (seed) => { let s = seed >>> 0 || 1; return (n) => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return (s >>> 8) % n; }; };

/**
 * The tactics. `open(g)`: false when James can't use it in this fight state (that state isn't counted for it).
 * smart = the bots' shared smart rule (tests/lib/smartfight.mjs, v0.11.96); random = the bot's random pick (no running away: the lab measures the fight); like
 * the bot it may pick a move James can't use here, and the game turns that into guard (or the fight's own move).
 */
export const TACTICS = {
    smart: { label: 'smart', pick: (g, t) => smartAction(g, t) }, // v0.11.96 (BT1): the shared rule (tests/lib/smartfight.mjs)
    random: { label: 'random', pick: (g, t, rnd) => { const a = Object.keys(COMBAT_ACTIONS).filter((id) => !INC_ONLY_ACTIONS.has(id) || actionOpen(g, id)); return a[rnd(a.length)]; } },
    blade: { label: 'blade only', pick: () => 'blade' },
    dart: { label: 'darts only', open: (g) => actionOpen(g, 'dart'), pick: () => 'dart' },
    needle: { label: 'needle only', pick: () => 'needle' },
    spear: { label: 'spear only', open: (g) => actionOpen(g, 'spear'), pick: () => 'spear' },
    guard: { label: 'guard + blade', pick: (g, t) => (t % 2 ? 'guard' : 'blade') },
    blast: { label: 'Qi blast only', open: (g) => actionOpen(g, 'blast'), pick: () => 'blast' }, // v0.11.95 (Q1; review: none in a spar)
    qshield: { label: 'Qi shield + blade', open: (g) => actionOpen(g, 'qshield'), pick: (g, t) => (t % 2 ? 'qshield' : 'blade') }, // v0.11.95 (Q1)
};
/** The fixed tactics (not smart or random): the "one tactic always wins" flag compares these. */
export const FIXED = ['blade', 'dart', 'needle', 'spear', 'guard']; // v0.11.95: the Qi moves show in the main table only (TACTICS)
export const MAX_STEPS = 400;

/**
 * Play one fight on a copy of `g` with tactic `tid`. `enc` is the encounter as the story's hook prepared it.
 * The story hooks are off while it plays (no second preparation, no Coil ending), and put back after.
 * Returns null when the tactic isn't open, else { win, rounds, hp } (hp: James's HP left, 0–100 % of his max).
 */
export function playFight(g0, enc, tid, seed = 1) {
    const tac = TACTICS[tid];
    const g = structuredClone(g0);
    ensureBars(g);
    if (tac.open && !tac.open(g)) return null;
    const keep = { before: combatHooks.before, lose: combatHooks.lose };
    combatHooks.before = null; combatHooks.lose = null;
    try {
        startCombat(g, structuredClone(enc));
        const rnd = stream(seed);
        let o = null, t = 0;
        for (; t < MAX_STEPS && g.combat; t++) { o = combatStep(g, tac.pick(g, t, rnd)); if (o?.done) break; }
        return { win: o?.done === 'win', rounds: t + 1, hp: Math.round((100 * Math.max(0, g.james.hp)) / jamesHpMax(g)) };
    } finally { combatHooks.before = keep.before; combatHooks.lose = keep.lose; }
}

/** One fight state, every tactic: { id, power, gu, cu, realm, res: { tactic: [win 0/1, rounds, hp] | null } }. */
export function sampleFight(g, enc, power) {
    const seed = ((g.seed >>> 0) ^ Math.imul(g.minutes | 0, 0x9e3779b1)) >>> 0;
    const res = {};
    for (const tid of Object.keys(TACTICS)) { const r = playFight(g, enc, tid, seed); res[tid] = r && [r.win ? 1 : 0, r.rounds, r.hp]; }
    return { id: enc.id, power: Math.round(power * 10) / 10, gu: rank(g.james.gu), cu: rank(g.james.skills['Convergence Use']), realm: g.james.realm || 0, seed: g.seed >>> 0, at: g.minutes | 0, res };
}
/** A fixed order for samples (so the thirds don't depend on how many workers played). */
export const sampleOrder = (a, b) => a.power - b.power || a.gu - b.gu || a.cu - b.cu || a.seed - b.seed || a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const pct = (k, n) => (n ? Math.round((1000 * k) / n) / 10 : null);

/** Win %, median rounds, median HP left on a win, for one tactic over some samples (null when none could use it). */
export function tacticStats(samples, tid) {
    const rs = samples.map((s) => s.res[tid]).filter(Boolean);
    if (!rs.length) return null;
    const wins = rs.filter((r) => r[0]);
    return { n: rs.length, win: pct(wins.length, rs.length), rounds: median(rs.map((r) => r[1])), hp: median(wins.map((r) => r[2])) };
}

/** Thirds by James's power (weak, middle, strong; in `sampleOrder`, then the order they came in). */
export function thirds(samples) {
    const s = samples.map((x, i) => [x, i]).sort((a, b) => sampleOrder(a[0], b[0]) || a[1] - b[1]).map((a) => a[0]);
    const k = Math.floor(s.length / 3);
    return [s.slice(0, k), s.slice(k, s.length - k), s.slice(s.length - k)];
}

/** The lowest GU rank from which the smart tactic wins at least `at` % (every state at that rank or above, pooled, with at
 *  least `min` of them); null if never. Pooled: many strong states can lift a rank that alone does worse. */
export function guNeeded(samples, at = 90, min = 10) {
    const ranks = [...new Set(samples.map((s) => s.gu))].sort((a, b) => a - b);
    for (const r of ranks) {
        const up = samples.filter((s) => s.gu >= r && s.res.smart);
        if (up.length < min) return null;
        if ((100 * up.filter((s) => s.res.smart[0]).length) / up.length >= at) return r;
    }
    return null;
}

/**
 * A fight's summary and flags. `tac`: each tactic over every state where it could be used (darts and the spear only
 * where James can sing them, so their states are the stronger ones). `same`: the fixed tactics on the same states only
 * (where James has all of them), for a fair comparison; the last three flags read it (with at least `sameMin` states).
 *   easy            every tactic that could be used won at least 99 % (all states)
 *   one-tactic      one fixed tactic wins at least 99 % while another wins under 90 % (same states)
 *   guard-never     guard + blade beats blade only on neither win % (by more than 1 point) nor HP left (same states)
 *   blade-best      blade only is the best fixed tactic or within 1 point of it (same states)
 * `best`: the fixed tactics within 1 point of the best win % on the same states, quickest first (fewest rounds, then
 * most HP left, then the higher win %); `bestShared`: those tied with the first on all three.
 */
export function summarize(id, samples, sameMin = 10) {
    const tac = Object.fromEntries(Object.keys(TACTICS).map((t) => [t, tacticStats(samples, t)]));
    const third = thirds(samples).map((part) => tacticStats(part, 'smart'));
    const open = Object.entries(tac).filter(([, v]) => v);
    const sameStates = samples.filter((s) => FIXED.every((t) => s.res[t]));
    const same = sameStates.length >= sameMin ? Object.fromEntries(FIXED.map((t) => [t, tacticStats(sameStates, t)])) : null;
    const flags = [];
    if (open.length && open.every(([, v]) => v.win >= 99)) flags.push('easy');
    let best = [], bestShared = [];
    if (same) {
        const fx = FIXED.map((t) => same[t]);
        const top = Math.max(...fx.map((v) => v.win));
        if (fx.some((v) => v.win >= 99) && fx.some((v) => v.win < 90)) flags.push('one-tactic');
        if (!(same.guard.win > same.blade.win + 1) && !((same.guard.hp ?? -1) > (same.blade.hp ?? -1))) flags.push('guard-never');
        if (same.blade.win >= top - 1) flags.push('blade-best');
        const key = (t) => [same[t].rounds, -(same[t].hp ?? -1), -same[t].win];
        const cmp = (a, b) => { const x = key(a), y = key(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };
        best = FIXED.filter((t) => same[t].win >= top - 1).sort(cmp);
        bestShared = best.filter((t) => cmp(t, best[0]) === 0);
    }
    return { id, n: samples.length, tac, third, gu: guNeeded(samples), sameN: sameStates.length, same, best, bestShared, flags };
}

/** Every fight with at least `min` samples, summarized, in name order; and the ones with fewer. */
export function summarizeAll(samples, min = 30) {
    const by = {};
    for (const s of samples) (by[s.id] || (by[s.id] = [])).push(s);
    const ids = Object.keys(by).sort();
    return { fights: ids.filter((i) => by[i].length >= min).map((i) => summarize(i, by[i])), few: ids.filter((i) => by[i].length < min).map((i) => `${i} (${by[i].length})`) };
}

/** Was this hook call the one-move finish (`instantWin`, no fight is played)? From the call's stack. */
export const isOneMove = (stack) => /\bat instantWin\b/.test(String(stack));

/** The table as text lines (win % to one decimal: the flags read the same number). */
export function tableLines({ fights, few }) {
    const cell = (v) => (v ? `${v.win.toFixed(1).padStart(5)}% r${String(v.rounds).padEnd(3)}${v.hp == null ? 'hp -  ' : `hp${String(v.hp).padEnd(4)}`}` : '     —            ');
    const head = `${'fight'.padEnd(16)} ${'n'.padStart(5)}  ${Object.keys(TACTICS).map((t) => t.padEnd(19)).join('')}smart by power (weak / mid / strong)   GU needed`;
    const out = [head];
    for (const f of fights) {
        const th = f.third.map((v) => (v ? `${String(Math.round(v.win)).padStart(3)}%` : '  —')).join(' / ');
        out.push(`${f.id.padEnd(16)} ${String(f.n).padStart(5)}  ${Object.keys(TACTICS).map((t) => `${cell(f.tac[t])} `).join('')}${th.padEnd(39)}${f.gu ? rankLabel(f.gu) : '—'}`);
    }
    out.push('', `The fixed tactics on the same states (where James has darts and the spear; fewer than 10: —):`);
    out.push(`${'fight'.padEnd(16)} ${'n'.padStart(5)}  ${FIXED.map((t) => t.padEnd(19)).join('')}best (quickest first; = tied)`);
    for (const f of fights) out.push(`${f.id.padEnd(16)} ${String(f.sameN).padStart(5)}  ${FIXED.map((t) => `${cell(f.same && f.same[t])} `).join('')}${f.best.length ? [f.bestShared.join(' = '), ...f.best.slice(f.bestShared.length)].join(', ') : '—'}`);
    const alone = Object.fromEntries(FIXED.map((t) => [t, fights.filter((f) => f.bestShared.length === 1 && f.best[0] === t).length]));
    const tied = Object.fromEntries(FIXED.map((t) => [t, fights.filter((f) => f.bestShared.length > 1 && f.bestShared.includes(t)).length]));
    out.push(`  quickest of the best, alone: ${FIXED.map((t) => `${t} ${alone[t]}`).join(', ')}; tied for it: ${FIXED.map((t) => `${t} ${tied[t]}`).join(', ')} (of ${fights.filter((f) => f.best.length).length} fights)`);
    out.push('', 'Flags:');
    const flagNames = { easy: 'won at least 99% under every tactic', 'one-tactic': 'one fixed tactic wins ≥ 99% while another wins < 90% (same states)', 'guard-never': 'guard + blade never better than blade only, win % or HP left (same states)', 'blade-best': 'blade only the best fixed tactic or within 1 point (same states)' };
    for (const [k, label] of Object.entries(flagNames)) {
        const hit = fights.filter((f) => f.flags.includes(k)).map((f) => f.id);
        const of = k === 'easy' ? fights.length : fights.filter((f) => f.same).length;
        out.push(`  ${label}: ${hit.length} of ${of}${hit.length && hit.length < of ? ` (${hit.join(', ')})` : ''}`);
    }
    if (few.length) out.push('', `Too few samples to show (under the minimum): ${few.join(', ')}`);
    return out;
}
