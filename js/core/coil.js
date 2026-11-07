/**
 * The Coil (v0.9.4, step 3c-1; design.md "The Coil", reset option B). Task mode only. The prologue's Coil rewinds to
 * Day 1 dawn; Act 1's (v0.9.6, g.coil.act = 1) to Day 8 dawn, the prologue's outcome kept, ending at Shen Qiu (rt_taken).
 * v0.11.0 (owner 2026-11-06): James's and Yuki's realm, Saturation, skills and meridians start over with the act (the
 * snapshot's values); the Coil bonus (game.js coilMult, ×(1 + 0.5 × earlier Coils of this act)) makes them come back faster.
 * A Coil ends on a collapse (HP 0 during tasks), a lost tribute (accept or rewind) or by choice ("Bite the tail").
 * Rewind: back to the snapshot (Day 1 dawn for a new game; an old save as it was loaded). v0.11.26 (owner 11:07): from Act 1
 * also to the start of the whole game (Day 1, the arrival, a fresh start); "same days again" is gone. One Coil count per save
 * (owner 11:12): crossing into Act 1 continues the Coil, every rewind adds 1, and the bonus follows it (pick N1).
 *   Kept: familiarity, adaptation, Yuki's lane on/off, Yuki's relationship and path,
 *         the knowledge flags (KEEP_FLAGS), the journal and stats.
 *   Reset: James and Yuki (to the snapshot), hammerspace, every other flag, bars (full), Fed, the queue.
 *   Relationships other than Yuki: max(snapshot value, 25% of the last Coil's peak), friendship and affection apart.
 * Pure — no DOM.
 */
import { coilStart, coilSnap, ensureBars, SAVE_VERSION, isNoDice, newGame } from './game.js';
import { famTier, FAM } from './tasks.js';

/** What James knows and keeps (plus Yuki's own flags and the Long Forest run, so that run stays scaled). */
export const KEEP_FLAGS = ['lore1', 'lore_realms', 'lore_tree', 'saw_lights', 'yuki_tiger_seen', 'yuki_human_seen', 'yk_path', 'long', 'longforest', 'lf_instant'];
/** Discoveries that also lock a one-time action: reset with the world, but the Coil remembers them (Insights in step 4). */
export const REMEMBER = { roots: 'the roots under the hollow', bone_sung: 'the song in the bone field', gills: 'where the ghost-gills grow', fungus: 'the jade bracket fungus by the stream', ship_found: 'where the seed-ship lies', log_heard: 'what Wren Aldous\'s log said' };
const KNOW_TEXT = { lore1: 'what the tribute is', lore_realms: 'the realms, from Old Wen', lore_tree: 'the story of the dead tree', saw_lights: 'where the night lights go' };
export const HEAD_START = 0.25;

const clone = (o) => JSON.parse(JSON.stringify(o));
const coil = (g) => g.coil;

/**
 * The Coil can turn here: task mode, not in a fight, not on its own screens, and
 *   the prologue's Coil: no tribute outcome yet, or the lost one (not the epilogue);
 *   Act 1's Coil: no Shen Qiu outcome yet, or 'taken' (not the act's end).
 */
export const coilActive = (g) => {
    if (!isNoDice() || !g.coil || g.combat || String(g.scene).startsWith('coil_')) return false;
    if ((g.coil.act || 0) === 1) return !g.flags.a1_outcome || g.flags.a1_outcome === 'taken' || g.scene === 'a1_end'; // v0.11.26: and the act's end, every outcome
    return (!g.flags.ending || g.flags.ending === 'lost') && !g.scene.startsWith('fo_') && g.scene !== 'epilogue';
};
export const actOf = (g) => g.coil?.act || 0;
/** A rewind would unwind Foundation (collaterals sealed). */
export const willUnwind = () => false; // v0.11.0: everything James grew starts over on a rewind anyway

/** End the Coil: why = 'collapse' | 'tribute' | 'choice'; back = the scene "Not yet" returns to. */
export function endCoil(g, why, back = null) {
    const c = coil(g);
    c.why = why; c.back = back;
    for (const f of Object.keys(REMEMBER)) if (g.flags[f] && !c.known.includes(f)) c.known.push(f);
    for (const f of Object.keys(KNOW_TEXT)) if (g.flags[f] && !c.known.includes(f)) c.known.push(f);
}

/** What this Coil gained and what James remembers (the Coil screen). */
export function coilReport(g) {
    const c = coil(g);
    const s = c.start;
    const gained = [];
    const tl = (a) => `T${a[0]} L${a[1]}`;
    const up = (name, a, n) => { if (n.tier !== a[0] || n.level !== a[1]) gained.push(`${name} ${tl(a)} → T${n.tier} L${n.level}`); };
    if (g.james.realm > s.realm) gained.push(`realm +${g.james.realm - s.realm}`);
    up('GU', s.gu, g.james.gu);
    up('Convergence Use', s.cu, g.james.skills['Convergence Use']);
    up('Yuki\'s Fight', s.yf, g.yuki.fight);
    const tiers = [0, 0, 0, 0];
    for (const [id, f] of Object.entries(g.tasks.fam || {})) { const t = famTier(f); if (t > famTier(s.fam[id] || 0)) tiers[t]++; }
    for (let t = 1; t < 4; t++) if (tiers[t]) gained.push(`${tiers[t]} card${tiers[t] > 1 ? 's' : ''} ${FAM[t].name}`);
    const known = c.known.map((f) => REMEMBER[f] || KNOW_TEXT[f]).filter(Boolean);
    return { n: c.n, why: c.why, gained, known };
}

/**
 * Rewind, in place. to: 'act' (the snapshot: the act's first dawn) or 'game' (v0.11.26, from Act 1: a fresh start at the
 * arrival, Day 1, the prologue's Coil). Returns the new Coil number (one count per save).
 */
export function rewind(g, { to = 'act' } = {}) {
    const c = coil(g);
    const whole = to === 'game' && (c.act || 0) === 1;
    const fresh = whole ? coilSnap(newGame(g.seed, { closed: true })) : null; // the arrival as a new game has it
    const base = clone(whole ? fresh : c.snap);
    const kept = {};
    for (const f of KEEP_FLAGS) if (g.flags[f] !== undefined) kept[f] = g.flags[f];
    base.v = SAVE_VERSION;
    // v0.11.0 (owner 2026-11-06, pick 1a): realm, Saturation, skills and meridians start over with the act; the Coil bonus makes them come back faster
    base.james = { ...clone(base.james), hp: null, qi: null, injuries: [] };
    base.yuki = { ...clone(base.yuki), hp: null, qi: null };
    const unwound = false;
    base.flags = { ...base.flags, ...kept };
    const rel = clone(base.rel || {});
    for (const [who, p] of Object.entries(c.peak)) {
        if (who === 'Yuki') continue;
        const r = rel[who] || { f: 0, a: 0 };
        rel[who] = { f: Math.max(r.f, Math.round(p.f * HEAD_START)), a: Math.max(r.a, Math.round(p.a * HEAD_START)) };
    }
    if (g.rel.Yuki) rel.Yuki = clone(g.rel.Yuki);
    base.rel = rel;
    base.tasks = { queue: [], fam: clone(g.tasks.fam || {}), use: clone(g.tasks.use || {}), adapt: clone(g.tasks.adapt || {}), yuki: { on: !!g.tasks.yuki?.on, progress: 0 } };
    base.stats = clone(g.stats);
    base.log = g.log.slice(-150);
    base.rng = g.rng;
    base.combat = null; base.lastWin = null;
    const n = c.n + 1;
    const peak = {};
    for (const [who, r] of Object.entries(base.rel)) peak[who] = { f: r.f, a: r.a };
    base.coil = { ...c, n, act: whole ? 0 : (c.act || 0), snap: whole ? fresh : c.snap, wake: base.scene, peak, why: null, back: null, skipEnter: false, one: true };
    delete base.coil.played; delete base.coil.replay; // v0.11.26: "same days again" is gone (older saves keep the fields; nothing reads them)
    for (const k of Object.keys(g)) delete g[k];
    Object.assign(g, base);
    ensureBars(g);
    g.coil.start = coilStart(g);
    g.log.push({ at: g.minutes, scene: g.scene, lines: [`${(g.coil.act || 0) === 1 ? 'Act 1, ' : whole ? 'The whole game again. ' : ''}Coil ${n} begins.${unwound ? ' Foundation unwound: Mortal Vessel again, the collaterals open to you.' : ''}`] });
    g.coil.unwound = unwound;
    return n;
}

