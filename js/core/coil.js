/**
 * The Coil (v0.9.4, step 3c-1; design.md "The Coil", reset option B). Task mode only. The prologue's Coil rewinds to
 * Day 1 dawn; Act 1's (v0.9.6, g.coil.act = 1) to Day 8 dawn, the prologue's outcome kept, ending at Shen Qiu (rt_taken).
 * v0.11.0 (owner 2026-11-06): James's and Yuki's realm, Saturation, skills and meridians start over with the act (the
 * snapshot's values); the Coil bonus (game.js coilMult, ×(1 + 0.25 × earlier Coils since v0.11.29; 0.5 before)) makes them come back faster.
 * A Coil ends on a collapse (HP 0 during tasks), a lost tribute (accept or rewind) or by choice ("Bite the tail").
 * v0.11.86 (owner 2026-11-09, #53, C1 + G1 + W1): a Coil ended by choice (why 'choice') counts as a Coil but adds no
 * bonus (`coil.free`, game.js coilMult); on the James tab in Act 1 it restarts Act 1 only (W1).
 * v0.11.106 (owner 2026-11-09 21:29, pick RA1): a bite at the end of an Act 1 James won (why 'clear', `actWon`) adds
 * to the bonus like a death; after 'taken' going round again is still by choice.
 * Rewind: back to the snapshot (Day 1 dawn for a new game; an old save as it was loaded). v0.11.26 (owner 11:07): from Act 1
 * also to the start of the whole game (Day 1, the arrival, a fresh start); "same days again" is gone. One Coil count per save
 * (owner 11:12): crossing into Act 1 continues the Coil, every rewind adds 1, and the bonus follows it (pick N1).
 *   Kept: familiarity, adaptation, Yuki's lane on/off, Yuki's relationship, her last answer (`yk_last`, v0.11.191),
 *         the knowledge flags (KEEP_FLAGS), the journal and stats; v0.11.227 (KA1): the realm kept for won clears (liftKept).
 *   Reset: James and Yuki (to the snapshot), hammerspace, every other flag, bars (full), Fed, the queue.
 *   Relationships other than Yuki: max(snapshot value, 25% of the last Coil's peak), friendship and affection apart.
 * Pure — no DOM.
 */
import { coilStart, coilSnap, ensureBars, SAVE_VERSION, newGame, yukiAbove, awardXp, realmName, MAX_REALM } from './game.js';
import { COL_GROUPS, colGroupsOpen } from '../story/meridians.js'; // v0.11.227 (KA1, KL-x): the meridians a kept realm opens
import { famTier, FAM } from './tasks.js';
const isYukiJob = (id) => id.startsWith('yuki:'); // v0.11.159 (owner pick NX2, CL): her jobs are not cards; the Coil screen gives her her own line

/** v0.11.191 (owner pick Y1, RP): her answer to "family or more" (`yk_path`, `yk_wait`) belongs to the Coil; the rewind keeps it as `yk_last`
 *  ('sister' | 'lover' | 'wait'), so she asks again, remembering (yuki_path.js ykAskNow). An old save moves at its next rewind. */
export const ykLastOf = (f) => f.yk_path || (f.yk_wait ? 'wait' : f.yk_last);
/** What James knows and keeps (plus Yuki's own flags and the Long Forest run, so that run stays scaled; v0.11.31: and the speed gates, tasks.js maxSpeed; v0.11.183 (SG2, ON-S): the songs heard, songs.js). */
export const KEEP_FLAGS = ['lore1', 'lore_realms', 'lore_tree', 'saw_lights', 'yuki_tiger_seen', 'yuki_human_seen', 'yk_last', 'long', 'longforest', 'lf_instant', 'spd_pro', 'spd_a1', 'lf_known', 'songs'];
/** Discoveries that also lock a one-time action: reset with the world, but the Coil remembers them (Insights in step 4). */
export const REMEMBER = { roots: 'the roots under the hollow', bone_sung: 'the song in the bone field', gills: 'where the ghost-gills grow', fungus: 'the jade bracket fungus by the stream', ship_found: 'where the seed-ship lies', log_heard: 'what Wren Aldous\'s log said' };
const KNOW_TEXT = { lore1: 'what the tribute is', lore_realms: 'the realms, from Old Wen', lore_tree: 'the story of the dead tree', saw_lights: 'where the night lights go' };
export const HEAD_START = 0.25;
/** v0.11.249 (P19-A, RL): the bar for Mei Lin's remembered line (act1_common.js KISS_MEI; core does not import the story's gates). */
export const RL_BAR = 30;

const clone = (o) => JSON.parse(JSON.stringify(o));
const coil = (g) => g.coil;

/**
 * The Coil can turn here: task mode, not in a fight, not on its own screens, and
 *   the prologue's Coil: no tribute outcome yet, or the lost one (not the epilogue);
 *   Act 1's Coil: no Shen Qiu outcome yet, or 'taken' (not the act's end).
 */
export const coilActive = (g) => {
    if (!g.coil || g.combat || String(g.scene).startsWith('coil_')) return false;
    if ((g.coil.act || 0) === 1) return !g.flags.a1_outcome || g.flags.a1_outcome === 'taken' || g.scene === 'a1_end'; // v0.11.26: and the act's end, every outcome
    return (!g.flags.ending || g.flags.ending === 'lost') && !g.scene.startsWith('fo_') && g.scene !== 'epilogue';
};
export const actOf = (g) => g.coil?.act || 0;
/** A rewind would unwind Foundation (collaterals sealed). */
export const willUnwind = () => false; // v0.11.0: everything James grew starts over on a rewind anyway

/** v0.11.106 (owner 2026-11-09 21:29, pick RA1, W): the Act 1 endings James wins. A bite after one of them (going round
 *  again, or the James tab at the act's end) adds to the faster learning (why 'clear'); after 'taken' it is by choice as before.
 *  `a1_outcome` is a world flag (reset by every rewind), so only the act's end can read it. */
export const ACT1_WON = ['victory', 'accord', 'revelation'];
export const actWon = (g) => actOf(g) === 1 && (g.scene === 'a1_end' || g.scene === 'a1_again') && ACT1_WON.includes(g.flags?.a1_outcome); // the act's end only (Fable's review, medium 1)
/** v0.11.86 (Fable review): the James tab's bite at a lost tribute or at Shen Qiu is that loss's bite (it adds the bonus), elsewhere by choice;
 *  v0.11.106 (RA1): at the end of an Act 1 James won, a won act's bite ('clear', it adds the bonus). */
export const tabWhy = (g) => (g.scene === 'collectors_lost' ? 'tribute' : g.scene === 'rt_taken' ? 'shen' : actWon(g) ? 'clear' : 'choice');
/** End the Coil: why = 'collapse' | 'beast' | 'tribute' | 'shen' | 'clear' | 'choice'; back = the scene "Not yet" returns to. */
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
    for (const [id, f] of Object.entries(g.tasks.fam || {})) { if (isYukiJob(id)) continue; const t = famTier(f); if (t > famTier(s.fam[id] || 0)) tiers[t]++; }
    for (let t = 1; t < 4; t++) if (tiers[t]) gained.push(`${tiers[t]} card${tiers[t] > 1 ? 's' : ''} ${FAM[t].name}`);
    const known = c.known.map((f) => REMEMBER[f] || KNOW_TEXT[f]).filter(Boolean);
    // v0.11.72 (owner pick S1): the cards that grew this Coil and are closest to their next tier (up to 3)
    const near = [];
    for (const [id, f] of Object.entries(g.tasks.fam || {})) {
        if (isYukiJob(id)) continue;
        const t = famTier(f), next = FAM[t + 1];
        if (!next || f <= (s.fam[id] || 0)) continue;
        near.push({ id, f, at: next.at, tier: next.name, frac: (f - FAM[t].at) / (next.at - FAM[t].at) });
    }
    near.sort((a, b) => b.frac - a.frac || a.id.localeCompare(b.id));
    // v0.11.159 (NX2, CL): each Yuki job whose practice grew this Coil, in id order (her lane's speed line on the screen)
    const yuki = Object.entries(g.tasks.fam || {}).filter(([id, f]) => isYukiJob(id) && f > (s.fam[id] || 0)).map(([id, f]) => ({ id, f })).sort((a, b) => a.id.localeCompare(b.id));
    return { n: c.n, why: c.why, gained, known, near: near.slice(0, 3), yuki };
}

/* ---------- v0.11.227 (owner pick KA1 + XW-a): the realm kept for a won game ---------- */
/** Each won clear of Act 1 (a bite with why 'clear': victory, revelation or accord, `ACT1_WON`; KG-b) adds 1 to `stats.clears`, and
 *  `stats.keptTop` keeps the highest realm James had at a won clear (both in `stats`, which every rewind keeps). Every later Coil
 *  starts James at realm keptRealm or above (a floor, KB-a; never above keptTop, KC), and Yuki with him. */
export const keptRealm = (g) => Math.max(0, Math.min(g?.stats?.clears || 0, g?.stats?.keptTop || 0, MAX_REALM));
/** The next keptRealm if this Coil ends on a won clear (the Coil screen's line). */
export const keptAfterClear = (g) => Math.max(0, Math.min((g?.stats?.clears || 0) + 1, Math.max(g?.stats?.keptTop || 0, g?.james?.realm || 0), MAX_REALM));
/** Lift James (and Yuki) to the kept realm, in place: Saturation 0, the Mortal Vessel meridians open (Foundation's twelve primaries and
 *  the 66 collaterals) with the Convergence XP opening each still-shut channel gives (KL-x: standard, one each), and from Nascent Soul
 *  the Extraordinary 8 and their 28 collaterals too, whose window (Golden Core to Soul Embryo) a kept realm walks past (XW-a: challenging,
 *  one each). Returns the realm lifted to, or 0 when James is already there (nothing changes). */
export const KEPT_EXTRA_FROM = 7;
export function liftKept(g) {
    const k = keptRealm(g), j = g.james, y = g.yuki;
    if (!k || (j.realm || 0) >= k) return 0;
    const shut = (12 - (j.primaries ?? 12)) + (COL_GROUPS.length - colGroupsOpen(g));
    const e8 = k >= KEPT_EXTRA_FROM ? 8 - (j.extra8 || 0) : 0, ec = k >= KEPT_EXTRA_FROM ? 28 - (j.extraCollaterals || 0) : 0;
    Object.assign(j, { primaries: 12, collaterals: 66, colSealed: false, merWork: 0, colWork: 0, realm: k, saturation: 0 });
    Object.assign(y, { primaries: 12, collaterals: 66, realm: Math.max(y.realm || 0, k) });
    if (k >= KEPT_EXTRA_FROM) Object.assign(j, { extra8: 8, extraCollaterals: 28, e8Work: 0, ecWork: 0 });
    for (let i = 0; i < shut; i++) awardXp(g, 'Convergence Use', 'standard');
    for (let i = 0; i < e8 + ec; i++) awardXp(g, 'Convergence Use', 'challenging');
    j.hp = null; j.qi = null; y.hp = null; y.qi = null; // ensureBars fills them to the new Max
    return k;
}
/** The James tab's kept-realm line (plain words, KT; here since KA1's RV1, TG3, so the tests read it): what is kept, and what a won act's bite would keep. */
export function keptTabText(g) {
    const k = keptRealm(g), n = g.stats?.clears || 0;
    const now = k ? `Kept from ${n} won clear${n === 1 ? '' : 's'} of Act 1: no Coil starts below ${realmName(k)} (James and Yuki, the Mortal Vessel meridians open).` : 'Each won clear of Act 1 (victory, revelation or accord) keeps one realm for every later Coil, up to the realm James had when he won.';
    return now + (actWon(g) && keptAfterClear(g) > k ? ` A bite now keeps ${realmName(keptAfterClear(g))}.` : '');
}
/** The first dawn's line after a lift (plain words, KT). */
export const keptLine = (g) => { const n = g.stats?.clears || 0; return `Kept from ${n} won clear${n === 1 ? '' : 's'} of Act 1: ${realmName(g.coil.kept)}, for you and Yuki, with the Mortal Vessel meridians open${g.coil.kept >= KEPT_EXTRA_FROM ? ', and the Extraordinary vessels and their collaterals' : ''}.`; };

/* ---------- v0.11.72 (owner pick T1): a target per act and the personal best ---------- */
/** Target Coils per act (0 the prologue, 1 Act 1), counted from Day 1 of the pass (the owner's Completionist targets).
 *  v0.11.85 (owner pick D + T1): 2 / 3 → 4 / 6, with the XP rate ×0.6 (the Completionist's means 3.94 / 5.89). */
export const TARGETS = { 0: 4, 1: 6 };
/** The Coils this pass of the whole game has taken so far: a new game or a whole-game rewind starts a pass (`stats.pass`). */
export const passCoils = (g) => Math.max(1, (g.coil?.n || 1) - (g.stats?.pass || 1) + 1);
/** An act cleared: keep the fewest Coils (`stats.best`, kept across every rewind); a line for Results when it is a new best. */
export function noteClear(g, act) {
    if (!g.coil || !g.stats) return [];
    // the review's L4 (R1): a save from before v0.11.72 that already went round the whole game (it crossed before, no `pass`)
    // doesn't know where this pass began: no best until its next whole-game rewind starts a known one
    if (act === 0 && g.stats.pass == null && g.stats.coils0 != null) g.stats.passUnknown = true;
    if (g.stats.passUnknown) return [];
    const k = passCoils(g), best = g.stats.best || (g.stats.best = {});
    if (best[act] != null && best[act] <= k) return [];
    best[act] = k;
    return [`${act === 1 ? 'Act 1' : 'Prologue'} cleared in ${k} Coil${k === 1 ? '' : 's'}: a new best${k <= TARGETS[act] ? ' ★' : ''} (target ${TARGETS[act]}).`];
}
/** The targets and the best, for the Coil screen and the James tab. */
export function targetsText(g) {
    const b = g.stats?.best || {}, one = (act) => (b[act] != null ? `${b[act]} Coil${b[act] === 1 ? '' : 's'}` : 'not yet');
    return `the prologue by Coil ${TARGETS[0]}, Act 1 by Coil ${TARGETS[1]}, counted from Day 1. Your best: prologue ${one(0)}, Act 1 ${one(1)}.`;
}

/**
 * Rewind, in place. to: 'act' (the snapshot: the act's first dawn) or 'game' (v0.11.26, from Act 1: a fresh start at the
 * arrival, Day 1, the prologue's Coil). Returns the new Coil number (one count per save).
 */
export function rewind(g, { to = 'act' } = {}) {
    const c = coil(g);
    const whole = to === 'game' && (c.act || 0) === 1;
    const fresh = whole ? coilSnap(newGame(g.seed, { closed: true, cal: g.cal })) : null; // v0.11.203 (T1, TS1): the long calendar kept // the arrival as a new game has it
    const base = clone(whole ? fresh : c.snap);
    const kept = {};
    for (const f of KEEP_FLAGS) if (g.flags[f] !== undefined) kept[f] = g.flags[f];
    const last = ykLastOf(g.flags); // v0.11.191 (Y1, RP): this Coil's answer, or the one before it
    if (g.flags.ending) kept.spd_pro = true; // v0.11.31 (P3-b): the tribute was reached (any outcome), so ×2 stays open
    base.v = SAVE_VERSION;
    // v0.11.0 (owner 2026-11-06, pick 1a): realm, Saturation, skills and meridians start over with the act; the Coil bonus makes them come back faster
    base.james = { ...clone(base.james), hp: null, qi: null, injuries: [] };
    base.yuki = { ...clone(base.yuki), hp: null, qi: null };
    // v0.11.118 (YK1 review, SN): a snapshot from before YK1 with her Fight above his GU starts her at his rank (the snapshot itself is kept)
    if (yukiAbove(base)) base.yuki.fight = { tier: base.james.gu.tier, level: base.james.gu.level, xp: 0 };
    const unwound = false;
    base.flags = { ...base.flags, ...kept };
    // v0.11.191 (Y1, RP; RV1 M1): the snapshot's answer goes too (an old keep's, or one asked by the prologue's Long Forest fire), so she asks
    // on every Coil; an Act 1 that starts with her human asks through her daily door (yuki_time.js, ykAskNow)
    delete base.flags.yk_path; delete base.flags.yk_wait;
    if (last) base.flags.yk_last = last;
    const rel = clone(base.rel || {});
    for (const [who, p] of Object.entries(c.peak)) {
        if (who === 'Yuki') continue;
        const r = rel[who] || { f: 0, a: 0 };
        rel[who] = { f: Math.max(r.f, Math.round(p.f * HEAD_START)), a: Math.max(r.a, Math.round(p.a * HEAD_START)) };
    }
    if (g.rel.Yuki) rel.Yuki = clone(g.rel.Yuki);
    base.rel = rel;
    base.tasks = { queue: [], fam: clone(g.tasks.fam || {}), use: clone(g.tasks.use || {}), adapt: clone(g.tasks.adapt || {}), yuki: { on: !!g.tasks.yuki?.on, progress: 0 }, ...(g.tasks.prio && typeof g.tasks.prio === 'object' ? { prio: clone(g.tasks.prio) } : {}), ...(g.tasks.keep && typeof g.tasks.keep === 'object' ? { keep: clone(g.tasks.keep) } : {}) }; // v0.11.219 (owner pick KC1, KG): the plan's counts kept for good too // v0.11.211 (owner pick PK1): the plan's places kept for good
    base.stats = clone(g.stats);
    if (c.why === 'clear') { base.stats.clears = (base.stats.clears || 0) + 1; base.stats.keptTop = Math.max(base.stats.keptTop || 0, g.james.realm || 0); } // v0.11.227 (KA1): a won clear
    if (whole) { base.stats.pass = c.n + 1; delete base.stats.passUnknown; } // v0.11.72 (T1): the whole game again starts a new pass
    if (g.picked) base.picked = clone(g.picked); // v0.11.32 (P2-a): picked choices are remembered across every rewind
    if (g.seen) base.seen = clone(g.seen); // v0.11.35 (P1-a): so are the scenes read
    if (g.read) base.read = clone(g.read); // v0.11.133 (FP2): and the paragraphs read
    if (g.readStops) base.readStops = clone(g.readStops); else delete base.readStops; // v0.11.228 (RE1, SC): and the plan's read stops, for the whole game
    base.log = g.log.slice(-150);
    base.rng = g.rng;
    if (g.calBl !== undefined) base.calBl = g.calBl; else delete base.calBl; // v0.11.222 (J2, SV): a rewind keeps the save's Blackroot (the snapshot may be older than its fill)
    base.combat = null; base.lastWin = null;
    const n = c.n + 1;
    const peak = {};
    for (const [who, r] of Object.entries(base.rel)) peak[who] = { f: r.f, a: r.a };
    const free = (c.free || 0) + (c.why === 'choice' ? 1 : 0); // v0.11.86 (#53, C1): a Coil ended by choice counts, but adds no bonus; v0.11.106 (RA1): 'clear' (a won Act 1) adds
    base.coil = { ...c, n, act: whole ? 0 : (c.act || 0), snap: whole ? fresh : c.snap, wake: base.scene, peak, why: null, back: null, skipEnter: false, one: true };
    // v0.11.249 (owner pick P19-A, RL): the Coil in which Mei Lin's affection first reached the kiss tier (or she kissed him), kept;
    // from the next Coil on, her remembered line (romance.js) can show. RL_BAR = act1_common.js KISS_MEI (tests pin it).
    if (base.coil.mrl == null && ((c.peak?.['Mei Lin']?.a || 0) >= RL_BAR || (g.rel?.['Mei Lin']?.a || 0) >= RL_BAR || g.flags?.romance)) base.coil.mrl = c.n;
    if (free) base.coil.free = free;
    delete base.coil.played; delete base.coil.replay; // v0.11.26: "same days again" is gone (older saves keep the fields; nothing reads them)
    for (const k of Object.keys(g)) delete g[k];
    Object.assign(g, base);
    g.coil.kept = liftKept(g); // v0.11.227 (KA1 + XW-a): the kept realm, on every rewind (the act's and the whole game's)
    if (!g.coil.kept) delete g.coil.kept;
    ensureBars(g);
    g.coil.start = coilStart(g);
    g.log.push({ at: g.minutes, scene: g.scene, lines: [`${(g.coil.act || 0) === 1 ? 'Act 1, ' : whole ? 'The whole game again. ' : ''}Coil ${n} begins.${unwound ? ' Foundation unwound: Mortal Vessel again, the collaterals open to you.' : ''}`] });
    g.coil.unwound = unwound;
    return n;
}

