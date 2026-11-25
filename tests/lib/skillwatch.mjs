// v0.11.273 (owner pick P41-A, SW; roadmap-retune.md's tools line): skillWatch, log only. A bot step in which a skill's
// tier, level or XP moved, and nothing the step showed has an XP line, is counted by the scene it started on. Every skill
// change should show the player a line (the XP lines of awardXp, awardFightXp, awardYukiFightXp and Yuki's held lines).
// A static count before the build (P41's options): 32 XP call sites in js/, 31 show their lines; liftKept (js/core/coil.js,
// the kept realm's Convergence Use XP) dropped them. v0.11.274 (owner pick P42-A, LK): liftKept sums them (sumXpLines) and
// the bite shows them after the kept line; the models test compares a kept Coil's restart with the skills it started over from
// (6 of 6 flagged with the bite's lines left out on purpose, 0 as built). Here so the tools test can check it without playing
// the models.

/** A line that shows a skill change (the XP and cap lines, Yuki's Qi Use and her held Fight). */
export const XP_LINE = /\bXP\b|\(cap\)|Qi Use \+\d|Fight \+\d|Fight held/;

/** Every skill James and Yuki carry, as one string (tier, level, XP). */
export function skillPrint(g) {
    const one = (n) => (n ? `${n.tier}.${n.level}.${n.xp || 0}` : '-');
    const j = g.james || {}, y = g.yuki || {};
    const sk = Object.keys(j.skills || {}).sort().map((k) => `${k}=${one(j.skills[k])}`);
    return [...sk, `gu=${one(j.gu)}`, `yq=${one(y.qiUse)}`, `yf=${one(y.fight)}`].join('|');
}

/** The lines a result shows: an array of lines, { lines }, or runWeek's { days: [{ lines }] }. */
export function linesOf(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x.filter((l) => typeof l === 'string');
    const out = [];
    if (Array.isArray(x.lines)) out.push(...linesOf(x.lines));
    if (Array.isArray(x.days)) for (const d of x.days) out.push(...linesOf(d?.lines));
    return out;
}

/** One step's verdict: true when a skill moved and none of the shown lines is an XP line. */
export const silentSkill = (before, after, seen) => before !== after && !seen.some((l) => XP_LINE.test(l));

/** v0.11.274 (the P42-A review's TG5): the skills whose print moved but that no shown line names (James's skills by name, `gu` by
 *  "GU", `yq` by Yuki's Qi Use, `yf` by Yuki's Fight), so a step with some XP lines can't hide a silent change behind them. */
export function movedUnnamed(before, after, seen) {
    const map = (p) => new Map(p.split('|').map((kv) => { const i = kv.lastIndexOf('='); return [kv.slice(0, i), kv.slice(i + 1)]; }));
    const a = map(before), b = map(after);
    const named = new Set();
    for (const l of seen) { if (!XP_LINE.test(l)) continue; if (/^GU\b/.test(l)) named.add('gu'); else if (/^Yuki\b.*Qi Use/.test(l)) named.add('yq'); else if (/^Yuki\b.*Fight/.test(l)) named.add('yf'); else { const m = /^(.*?) (?:\+\d|at T10 L10)/.exec(l); if (m) named.add(m[1]); } }
    return [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k) && !named.has(k));
}

/** The log line: silent skill changes per game and the five scenes they start on most. */
export function skillWatchLine(m, st) {
    const w = st.skillWatch || { steps: 0, silent: 0, at: {} };
    const top = Object.entries(w.at || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${k} ${n}`).join(', ');
    return `${m}: skillWatch (log only): ${w.silent || 0} silent skill changes in ${w.steps || 0} steps that moved a skill (${((w.silent || 0) / Math.max(1, st.games)).toFixed(2)} a game); most at ${top || '—'}`;
}
