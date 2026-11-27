/**
 * v0.11.286 (owner picks G4-A, TQ-A, WR-a, HP-n; 2026-11-27): the threads. A thread is a lane like Yuki's: it holds one card and works
 * it on the game time James's cards spend on that card's screen, 06:00–19:00, and when the card's time is in and the card is open, it
 * runs the card's one run of the day for him: the same items (×2 on a double, a spaced card's days), the card's skill XP, its Qi, +1
 * familiarity; no time of James's; no gain with anyone (RV-A, M1-r). A thread holds only (TQ-A, EL-f) a daily Forage or Hunt card with a check and items, or Smoke the
 * catch; only (LM) at Practised or better, whose result now is full or double; only (HP-n) a card James has tapped by hand once, its
 * result on the screen (`hand`, kept across every rewind). Threads wake (WR-a) after Act 1 is won and gone round again: the first won
 * rewind (`stats.clears`) unlocks them; then one more for every won rewind and every arc's first finish on a pass after it, up to 9.
 *
 * Save (SV): `g.tasks.threads` = { lanes: [{ id, hub, p }], arcs: <bits of the 9 arcs finished since the unlock>, hand: [card ids] };
 * optional, an old save reads it empty; kept across every rewind (coil.js), the lanes' progress from 0.
 */
import { taskState, cardOf, learn, cardCheck, cardSpeed, NEW_LENGTH, WEEK_MULT, weekCard, taskCards, famTier } from './tasks.js';
import { addItem, clockParts, awardXp, spendQi, setLootMult, gainAt, takeCapNotes, itemNames, itemFull, spoilFresh } from './game.js';
import { gives, enterHook } from './story.js';
import { haulMult, preservePlan, PRESERVE, PRESERVE_MIN } from '../story/common.js';
import { noteOnce } from '../story/oneoff.js';
import { TASK_HUBS } from '../story/task_hubs.js';

export const THREAD_MAX = 9;
/** The hours a lane works, as Yuki's (YUKI_HOURS; a literal here: tasks.js imports this file, the threads test keeps the two equal). */
export const THREAD_HOURS = [6, 19];
/** The arcs, in the story's order (WR-a): the prologue's 3, Act 1's 6. */
export const ARCS = ['the Wilds', 'Ashfall', 'the tribute', 'the Fallout', 'the Root Road', 'the Drowned Wood', 'the Ashen Hills', 'the Heart', 'the Return'];
/** The scene whose entry finishes arcs (their indexes): the next arc's first scene. The Blackroot's regions also by `bl_region`. */
export const ARC_AT = { village: [0], tribute: [1], fo_start: [2], bl_start: [3], ht_start: [4, 5, 6], rt_start: [7], a1_end: [8] };
export const REGION_DONE = { dw: [4], ah: [4, 5] };
/** TQ-A (EL-f): the menus whose cards a thread may hold (a check and items each); Smoke the catch by its `preserve` mark. */
const FOOD_MENUS = /^(wild_forage|wild_hunt|lf_forage|lf_hunt|rr_forage|dw_forage|ah_forage)$/;
export const THREAD_TEXT = {
    hand: 'Play it by hand once first.',
    newish: 'Practised first.',
    hard: 'Too hard for it yet (a partial result).',
    today: 'Done for today.',
    late: 'Too late today.',
    busy: 'James has it in hand this week.',
    shut: 'Not open now.',
    qi: (n) => `Needs ${n} Qi.`,
    full: 'Its stock is full.',
    smoke: 'Nothing to smoke.',
    away: 'Waits for James on its screen.',
    off: 'Off.',
    locked: 'A thread first takes over work when you go round again after Act 1 is won.', // RV-A (M3-w, the reviewer's wording)
};
const isRec = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const bits = (n) => { let k = 0; for (let x = n & 511; x; x &= x - 1) k += 1; return k; };

/** The threads' record, read only (an old save: empty). */
export function threadsRead(g) {
    const th = g?.tasks?.threads;
    if (!isRec(th)) return { lanes: [], arcs: 0, hand: [] };
    return {
        lanes: Array.isArray(th.lanes) ? th.lanes.slice(0, THREAD_MAX).map((l) => (isRec(l) && typeof l.id === 'string' && typeof l.hub === 'string' && !!TASK_HUBS[l.hub] ? { id: l.id, hub: l.hub, p: Math.max(0, Number(l.p) || 0) } : null)) : [], // RV (M2): a lane on no task hub is dropped
        arcs: (Number(th.arcs) || 0) & 511,
        hand: Array.isArray(th.hand) ? th.hand.filter((x) => typeof x === 'string') : [],
    };
}
/** The record to write to (made and cleaned once). */
export function threadsWrite(g) {
    const t = taskState(g);
    t.threads = threadsRead(g);
    return t.threads;
}
/** For a rewind (coil.js): the record carried on, every lane's progress from 0; undefined when the save has none. */
export function threadsKept(g) {
    if (!isRec(g?.tasks?.threads)) return undefined;
    const th = threadsRead(g);
    return { lanes: th.lanes.map((l) => (l ? { ...l, p: 0 } : null)), arcs: th.arcs, hand: th.hand.slice() };
}

/** WR-a: the won rewinds (a rewind after a won Act 1: `stats.clears`, KA1). */
export const wonRewinds = (g) => Math.max(0, Number(g?.stats?.clears) || 0);
/** How many threads are awake. */
export const threadsAwake = (g) => (wonRewinds(g) > 0 ? Math.min(THREAD_MAX, wonRewinds(g) + bits(threadsRead(g).arcs)) : 0);
/** The arcs not finished since the unlock, in order (for the Coil screen's line). */
export const arcsLeft = (g) => ARCS.filter((_, i) => !(threadsRead(g).arcs & (1 << i)));
/** WR-a: the arcs `ks` finished (only once threads are unlocked; before, nothing is kept). */
export function noteArcs(g, ks) {
    if (!wonRewinds(g) || !ks?.length) return;
    const now = threadsRead(g).arcs;
    let a = now;
    for (const k of ks) a |= 1 << k;
    if (a !== now) threadsWrite(g).arcs = a;
}
/** WR-a: a scene entered (story.js `go`, through its hook): an arc's end, when it is one. */
export function arcAt(g, id) { if (ARC_AT[id]) noteArcs(g, ARC_AT[id]); }
/** Wire the arcs' ends (prologue.js): checks each arc's scene is there and sets story.js's entry hook. */
export function installThreads(SCENES) {
    for (const id of Object.keys(ARC_AT)) if (!SCENES[id]) throw new Error(`threads: no scene ${id}`);
    enterHook.fn = arcAt;
}

/** HP-n: a card James tapped by hand (main.js after its result is on the screen; the models' own taps). */
export function noteHand(g, scenes, id) {
    if (!canHold(id, scenes)) return;
    const th = threadsRead(g);
    if (th.hand.includes(id)) return;
    threadsWrite(g).hand.push(id);
}
export const playedByHand = (g, id) => threadsRead(g).hand.includes(id);

/** TQ-A: may a thread ever hold this card id (a daily Forage or Hunt card with a check and items, or Smoke the catch)? */
export function canHold(id, scenes = null) {
    const s = String(id || '');
    const k = s.lastIndexOf(':');
    if (k < 0) return false;
    const scene = s.slice(0, k), i = Number(s.slice(k + 1));
    if (FOOD_MENUS.test(scene)) { const c = scenes?.[scene]?.choices?.[i]; return !scenes || (!!c && !!c.check && gives(c).length > 0); }
    if (TASK_HUBS[scene]) return !scenes || !!scenes[scene]?.choices?.[i]?.preserve;
    return false;
}
/** A lane's run time for this card now: its time and the menu's, ×2 new ÷ its familiarity, a week's card ×7 (as James's); Smoke the catch 15 min a piece. */
export function threadMinutes(g, scenes, hubId, id) {
    const card = cardOf(scenes, hubId, id);
    if (!card?.c) return 0;
    if (card.c.preserve) return Math.max(PRESERVE_MIN, preservePlan(g).reduce((a, [, n]) => a + n, 0) * PRESERVE_MIN);
    const f = Number(taskState(g).fam[id]) || 0;
    const once = Math.round((((card.entry?.time || 0) + (card.c.time || 0)) * NEW_LENGTH) / cardSpeed(f));
    return weekCard(g, hubId, card) ? once * WEEK_MULT : once;
}
/** Why a thread can't run this card here now ('' when it can). James must be on its screen. */
export function threadWhy(g, scenes, hubId, id) {
    if (!canHold(id, scenes)) return THREAD_TEXT.shut;
    if (!playedByHand(g, id)) return THREAD_TEXT.hand;
    if (famTier(Number(taskState(g).fam[id]) || 0) < 1) return THREAD_TEXT.newish;
    if (g.scene !== hubId) return THREAD_TEXT.away;
    const card = cardOf(scenes, hubId, id);
    if (!card?.c) return THREAD_TEXT.shut;
    if (card.c.preserve && !preservePlan(g).length) return THREAD_TEXT.smoke;
    const ids = gives(card.c);
    if (!card.c.preserve && ids.length && ids.every((i) => itemFull(g, i))) return THREAD_TEXT.full; // before the list: a full stock's card isn't shown
    const shown = taskCards(g, scenes, id).find((c) => c.id === id);
    if (!shown) return THREAD_TEXT.shut;
    if (shown.status === 'tomorrow' || shown.status === 'spaced') return THREAD_TEXT.today;
    if (shown.status === 'late') return THREAD_TEXT.late;
    if (shown.status === 'busy') return THREAD_TEXT.busy;
    if (!['open', 'evening', 'long'].includes(shown.status)) return THREAD_TEXT.shut; // James's week stops at evening and at the stay's end; a lane's run is whole, by 19:00
    if (card.c.check && !['full', 'double'].includes(cardCheck(g, id, card.c).band)) return THREAD_TEXT.hard;
    if (card.c.qi && g.james.qi < card.c.qi) return THREAD_TEXT.qi(card.c.qi);
    return '';
}
const labelOf = (g, c) => String(typeof c.text === 'function' ? c.text(g) : c.text).replace(/\.$/, '');

/** One run of a lane's card for James (its time already in). Returns its lines. */
function threadRun(g, scenes, hubId, lane, id) {
    const card = cardOf(scenes, hubId, id);
    const { c } = card;
    const name = `Thread ${lane + 1} · ${labelOf(g, c)}`;
    if (c.preserve) { // Smoke the catch: the card's own plan, without its time
        spoilFresh(g);
        const got = {};
        for (const [i, n] of preservePlan(g)) { addItem(g, i, -n); addItem(g, PRESERVE[i], n); got[PRESERVE[i]] = (got[PRESERVE[i]] || 0) + n; }
        learn(g, scenes, hubId, card, id, 1);
        return [`${name}: ${Object.entries(got).map(([i, n]) => `+${n} ${itemNames[i]?.name || i}`).join(', ')}.`];
    }
    const k = cardCheck(g, id, c);
    const lines = [];
    if (c.qi) spendQi(g, c.qi);
    g.stats.checks += 1; g.stats.wins += 1;
    const xp = c.xp !== false ? awardXp(g, c.check.xpTo || c.check.skill, c.check.band || 'standard', { fail: false, factor: 1 }) : [];
    const before = { ...g.inventory };
    const hm = haulMult(g, id);
    if (k.band === 'double' || hm > 1) setLootMult((k.band === 'double' ? 2 : 1) * hm);
    const L = g.lines?.d && typeof g.lines.d === 'object' ? g.lines.d : null; // RV (L2): the card's day replies stay James's to read
    const said = L ? Object.fromEntries(Object.entries(L).filter(([x]) => x.startsWith('r:')).map(([x, v]) => [x, Array.isArray(v) ? v.slice() : v])) : {};
    // RV-A (M1-r, owner 2026-11-27 11:57): a thread's run gives items, XP, Qi and familiarity only; a card's gain with someone
    // (Mei Lin's root-sorrel, chestnuts, cinderberries) stays with James's own run: her record, the Coil's peaks and today's marks kept
    const rel0 = JSON.stringify({ rel: g.rel ?? null, wg: g.wg ?? null, best: g.coil?.best ?? null, peak: g.coil?.peak ?? null });
    const relFlags = Object.fromEntries(Object.entries(g.flags || {}).filter(([x]) => x.startsWith('rel_')));
    try { gainAt(String(id), () => c.do(g, { success: true, crit: k.band === 'double', ratio: k.ratio })); } finally {
        setLootMult(1);
        const r0 = JSON.parse(rel0);
        if (r0.rel) g.rel = r0.rel; if (r0.wg) g.wg = r0.wg; else delete g.wg;
        if (g.coil) { if (r0.best) g.coil.best = r0.best; else delete g.coil.best; if (r0.peak) g.coil.peak = r0.peak; }
        if (g.flags) { for (const x of Object.keys(g.flags)) if (x.startsWith('rel_') && !(x in relFlags)) delete g.flags[x]; Object.assign(g.flags, relFlags); }
    }
    const L2 = g.lines?.d && typeof g.lines.d === 'object' ? g.lines.d : null;
    if (L2) for (const x of Object.keys(L2)) if (x.startsWith('r:')) { if (x in said) L2[x] = said[x]; else delete L2[x]; }
    const gained = Object.keys(g.inventory).map((i) => [i, (g.inventory[i] || 0) - (before[i] || 0)]).filter(([, d]) => d > 0);
    noteOnce(g, card.menu, Number(String(id).split(':').pop()), c);
    learn(g, scenes, hubId, card, id, 1);
    lines.push(`${name}${k.band === 'double' ? ' (a double haul)' : ''}: ${gained.length ? gained.map(([i, d]) => `+${d} ${itemNames[i]?.name || i}`).join(', ') : 'nothing it could carry'}.`);
    for (const i of new Set(takeCapNotes())) lines.push(`Hammerspace: ${itemNames[i]?.name || i} is full — the rest stays behind.`);
    return [...lines, ...xp];
}

/** The threads' share of the time that just passed on `hubId` (runTask, after Yuki's): each lane there gains it, and runs its card
 *  once its time is in and the card can run (one run a card; the time waits, at most one run's worth, while it can't). */
export function threadTick(g, scenes, hubId, minutes) {
    if (!(minutes > 0)) return [];
    if (g.scene === hubId && g.flags?.bl_region) noteArcs(g, REGION_DONE[g.flags.bl_region] || []);
    const n = threadsAwake(g);
    if (!n) return [];
    const { hh } = clockParts(g.minutes);
    if (hh < THREAD_HOURS[0] || hh >= THREAD_HOURS[1]) return [];
    const th = threadsRead(g);
    if (!th.lanes.some((l, i) => i < n && l && l.hub === hubId)) return [];
    const w = threadsWrite(g), lines = [];
    for (let i = 0; i < Math.min(n, w.lanes.length); i++) {
        const l = w.lanes[i];
        if (!l || l.hub !== hubId) continue;
        const len = Math.max(1, threadMinutes(g, scenes, hubId, l.id));
        l.p = Math.min(len, l.p + minutes);
        if (l.p < len || threadWhy(g, scenes, hubId, l.id)) continue;
        l.p = 0;
        lines.push(...threadRun(g, scenes, hubId, i, l.id));
    }
    return lines;
}

/** Set lane `i` to card `id` on `hubId` (null: off). Only a card the lane may hold now, by hand and Practised. */
export function setThread(g, scenes, i, hubId, id) {
    if (!(i >= 0 && i < threadsAwake(g))) return false;
    const w = threadsWrite(g);
    while (w.lanes.length <= i) w.lanes.push(null);
    if (id == null) { w.lanes[i] = null; return true; }
    if (!canHold(id, scenes) || !playedByHand(g, id) || famTier(Number(taskState(g).fam[id]) || 0) < 1 || !cardOf(scenes, hubId, id)) return false;
    if (w.lanes.some((l, j) => j !== i && l?.id === id)) return false; // RV (L4): one card, one lane
    w.lanes[i] = { id, hub: hubId, p: 0 };
    return true;
}
/** The cards lane pickers offer on this hub: [{ id, label, why }] (why '' or the reason it is locked). */
export function threadChoices(g, scenes, hubId = g.scene, lane = -1) { // lane: the picker's own lane (RV L4: a card on another lane is held)
    const out = [];
    const cfg = TASK_HUBS[hubId];
    if (!cfg) return out;
    const ids = [];
    for (const menu of Object.keys(cfg.menus || {})) if (FOOD_MENUS.test(menu)) (scenes[menu]?.choices || []).forEach((_, i) => ids.push(`${menu}:${i}`));
    (scenes[hubId]?.choices || []).forEach((c, i) => { if (c.preserve) ids.push(`${hubId}:${i}`); });
    for (const id of ids) {
        if (!canHold(id, scenes) || !cardOf(scenes, hubId, id)) continue;
        const c = cardOf(scenes, hubId, id).c;
        const j = threadsRead(g).lanes.findIndex((l, k) => k !== lane && k < threadsAwake(g) && l?.id === id);
        const why = !playedByHand(g, id) ? THREAD_TEXT.hand : famTier(Number(taskState(g).fam[id]) || 0) < 1 ? THREAD_TEXT.newish : j >= 0 ? `Held by Thread ${j + 1}.` : '';
        out.push({ id, label: labelOf(g, c), why });
    }
    return out;
}
/** The lanes for the screen: [{ i, id, label, hub, here, p, len, why }] for every awake thread. */
export function threadLanes(g, scenes) {
    const n = threadsAwake(g), th = threadsRead(g), out = [];
    for (let i = 0; i < n; i++) {
        const l = th.lanes[i] || null;
        if (!l) { out.push({ i, id: null, label: '', hub: null, here: false, p: 0, len: 0, why: THREAD_TEXT.off }); continue; }
        const card = cardOf(scenes, l.hub, l.id);
        const len = card ? Math.max(1, threadMinutes(g, scenes, l.hub, l.id)) : 0;
        out.push({ i, id: l.id, label: card?.c ? labelOf(g, card.c) : l.id, hub: l.hub, here: g.scene === l.hub, p: Math.min(l.p, len), len, why: card ? threadWhy(g, scenes, l.hub, l.id) : THREAD_TEXT.shut });
    }
    return out;
}
/** The Coil screen's line (UI), after its label. RV (L3, the reviewer's wording): only a bite on a won Act 1 counts; the arcs left. */
export function threadsLine(g) {
    const n = threadsAwake(g);
    if (!n) return g.coil?.why === 'clear' ? 'none yet: this bite wakes the first.' : `none yet. ${THREAD_TEXT.locked}`;
    if (n >= THREAD_MAX) return `all ${THREAD_MAX} awake.`;
    const left = arcsLeft(g);
    return `${n} of ${THREAD_MAX} awake. One more wakes each time you bite the tail on a won Act 1${left.length ? `, and with each arc's first finish after that (left: ${left.join(', ')})` : ''}.`;
}
