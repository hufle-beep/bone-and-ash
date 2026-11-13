/**
 * Task cards (v0.9.0 step 3a; v0.9.2 step 3b; the queue went in v0.11.64). Pure — no DOM.
 *
 * Kinds of card (ids are `<scene>:<choice index>`):
 * - work: a sub-menu choice (`menus`) or a hub choice with a check. Resolved here WITHOUT dice (3b):
 *   ratio = check ÷ DC → double (≥ 2), full (≥ 1), partial (≥ 0.5: loot and XP scaled), fail (HP loss doubled).
 *   Harder until familiar: DC = old DC − 2, then +2 new / +1 Practised / +1 Skilled / +0 Mastered; length × 2 / 1 / 0.4 / 0.2.
 * - chore: a hub choice without a check that leads back to the hub (eat, rest, cultivate): runs through `choose` as before.
 * - door: a choice into a scene with dialogue or a fight; runs through `choose`, the scene opens as a story stop.
 * Intuitive Aptitude: a result below full gives that card +0.5 check next time (up to +2); a quarter of every
 * completion goes to the other cards of its group. Drills give 0.2 to every card on the hub.
 * Yuki's lane: her job on the hub runs on game time while James works; since v0.11.118 (YK1, D8) each haul is a d8, not her Fight.
 * The story checks and fights keep the d6 until 3c.
 */
import { hasForm } from './forms.js';
import { choose, goTo, choiceOpen, choiceTag, gives, setTimeless, defaultMinutes, movesPlace, wasPicked, isMenuScene, isTimeless, setFamiliar, doorMinutes } from './story.js';
import { d8, itemCap, yukiForm, advance, clockParts, actingCheck, actingName, awardXp, awardYukiFightXp, spendQi, setLootMult, takeCapNotes, itemNames, addItem, canBreakThrough, btMinutes, realmName, condense, sitMinutes, useSpeed, USE_N, USE_CAP, nightLock, endsLate, sitUseless, jamesQiMax, SATIETY_PER_HOUR, breakAt, coilMult, fmtMult, YUKI_HELD_TEXT } from './game.js';
import { CONDENSE_SIT_COST } from './formulas.js';
import { btTarget, MER_LINES, lineWindow, lineIndex, lineName } from '../story/meridians.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { onceOpen, noteOnce, stageOpen, ONCE_MENUS } from '../story/oneoff.js';
import { daily, foodCount } from '../story/common.js';
import { endCoil } from './coil.js';
import { canMeditate } from './meditate.js';
import { keepReplies } from './replies.js'; // v0.11.69 (P1)

setTimeless(Object.fromEntries(Object.entries(TASK_HUBS).map(([h, cfg]) => [h, [...Object.keys(cfg.menus || {}), ...Object.keys(cfg.doorMenus || {})]]))); // hub ↔ menu steps take no extra time (v0.9.5)

/* v0.11.64 (owner 2026-11-08 02:04 / 10:58, picks A1 + B1 + C1 + D1 + E1): no timer, no game speeds, no queue. Every card
 * resolves at once and moves the clock by its time (it always did in the rules; the bar only made the screen wait). The
 * old `g.tasks.queue` stays in the save as an empty list (save shape unchanged); `migrate` empties an old one. */
export const DC_SHIFT = 2; // no dice: DCs move down to the new scale (K 2, owner 2026-11-06)
export const FAM = [{ name: 'New', at: 0, dc: 2, speed: 1 }, { name: 'Practised', at: 2, dc: 1, speed: 2 }, { name: 'Skilled', at: 8, dc: 1, speed: 5 }, { name: 'Mastered', at: 18, dc: 0, speed: 10 }];
export const NEW_LENGTH = 2; // a new card takes twice its old time; familiarity divides it
export const ADAPT_STEP = 0.5, ADAPT_MAX = 2, TRANSFER = 0.25, DRILL_SHARE = 0.2, FED_EXTRA_PER_HOUR = 1; // Fed −4 an hour in total while tasks run
export const YUKI_HOURS = [6, 19]; // v0.11.83: exported for the FAQ

const asText = (v, g) => (typeof v === 'function' ? v(g) : v);
const r1 = (x) => Math.round(x * 10) / 10;
export const famTier = (f) => (f >= 18 ? 3 : f >= 8 ? 2 : f >= 2 ? 1 : 0);
/** v0.11.15 (B1-b): a card's speed by use: 1 + 9 × (familiarity ÷ 18), up to ×10 (= the tiers' ×2 / ×5 / ×10 at 2 / 8 / 18). */
/** v0.11.18 (owner pick c): Yuki's job has its own slower curve, N 90, capped at ×3 (Incremental Mode). */
export const YUKI_N = 90, YUKI_CAP = 3;
export const yukiSpeed = (f) => Math.min(YUKI_CAP, useSpeed(f, YUKI_N));
/** v0.11.158 (owner pick NX2, YS; Fable's L3 of v0.11.155): her lane names her own speed, not the cards' steps (whose ×5 / ×10
 * she never reaches): "×1.8 of ×3 · 8/20 to her best", then "×3, her best" from the count that reaches the cap (20 at N 90).
 * RV1 (the Opus review): RD the speed rounded down, so ×3 shows only at her best (19.5 is ×2.95); WB the count is her practice,
 * not hauls (an empty haul counts half), worded as the cards' "5/8 to Skilled". */
export const YUKI_BEST = Math.ceil(((YUKI_CAP - 1) * YUKI_N) / (USE_CAP - 1));
export const yukiSpeedLine = (f) => (yukiSpeed(f) >= YUKI_CAP ? `×${YUKI_CAP}, her\u00a0best` : `×${Math.floor(yukiSpeed(f) * 10 + 1e-9) / 10}\u00a0of\u00a0×${YUKI_CAP} · ${Math.round((f || 0) * 10) / 10}/${YUKI_BEST}\u00a0to\u00a0her\u00a0best`);
/** v0.11.159 (owner pick NX2, CL): a Yuki job's label by its id (`yuki:<hub>`), for the Coil screen's own line for her. */
export const yukiJobLabel = (id) => Object.values(TASK_HUBS).find((h) => h.yuki?.id === id)?.yuki.label || 'Yuki\'s hunting';
export const cardSpeed = (f) => useSpeed(f, USE_N.card);
const nextAt = (f) => FAM.find((t) => t.at > f)?.at ?? null;
/** v0.11.155 (FD1, NX): a work or door card's familiarity line names the next step ("Practised · 5/8 to Skilled"); "Mastered" at the top.
 * RV1 (NB): non-breaking spaces keep "5/8 to Skilled" whole, so a narrow card wraps only after a "·" (a 390 px phone: 4 of 4 mid-phrase breaks → 0). */
export const famLine = (card) => (card.next != null ? `${FAM[card.tier].name}\u00a0· ${card.fam}/${card.next}\u00a0to\u00a0${FAM[card.tier + 1].name}` : FAM[card.tier].name);

export const isTaskHub = (g) => !!TASK_HUBS[g.scene] && !g.combat;
function st(g) {
    if (!g.tasks || typeof g.tasks !== 'object') g.tasks = {};
    const t = g.tasks;
    if (!Array.isArray(t.queue)) t.queue = [];
    if (!t.fam || typeof t.fam !== 'object') t.fam = {};
    if (!t.adapt || typeof t.adapt !== 'object') t.adapt = {};
    if (!t.yuki || typeof t.yuki !== 'object') t.yuki = { on: false, progress: 0 };
    return t;
}
export const taskState = st;

function parse(id) { const k = String(id).lastIndexOf(':'); return { scene: id.slice(0, k), index: Number(id.slice(k + 1)) }; }
const entryIndex = (scenes, hubId, menu) => (scenes[hubId].choices || []).findIndex((c) => c.to === menu);
const hasWork = (c) => !c.combat && !!(c.do || c.check || c.time || c.qi);
const isChore = (hubId, c) => c.to === hubId && hasWork(c);
const isDoor = (cfg, c) => typeof c.to === 'string' && (cfg.doors || []).includes(c.to);

/** True if hub choice `index` is shown as a card (or is the door to a card menu) rather than as a story stop. */
export function isTaskChoice(scenes, hubId, index) {
    const cfg = TASK_HUBS[hubId];
    const c = scenes[hubId].choices[index];
    return !!((cfg.menus || {})[c.to] || (cfg.doorMenus || {})[c.to] || isChore(hubId, c) || isDoor(cfg, c));
}

/** v0.11.32 (P2-a): the scenes a task-screen card leads into (hunting, foraging, training, talks); their checks and gathering are work. Built on first use. */
let workSubs = null;
const WORK_SUBS = (scenes) => workSubs || (workSubs = new Set(Object.keys(TASK_HUBS).flatMap((h) => (scenes[h]?.choices || []).map((c, i) => (typeof c.to === 'string' && c.to !== h && isTaskChoice(scenes, h, i) ? c.to : null)).filter(Boolean))));
/**
 * v0.11.32 (P2-a): is this choice on the current scene recoloured as picked before? Story choices only: not work (task-screen
 * cards, the hubs' work menus, the checks and gathering inside the scenes a task card leads into), not the meta screens'
 * entries ("Open a meridian", "Yuki: change form"), not a plain "Back…". A one-move index counts as its fight choice.
 */
export function showPicked(g, scenes, index, label) {
    const i = index >= 1000 ? index - 1000 : index;
    return wasPicked(g, g.scene, i) && canBeFamiliar(g, scenes, index, label);
}
/** v0.11.140 (owner pick RV1, L1): is this choice recoloured once picked (showPicked without the mark)? Since v0.11.141 (FX1, SA) display only:
 *  every story choice off the meta screens counts its picks and speeds up. */
export function canBeFamiliar(g, scenes, index, label) {
    const i = index >= 1000 ? index - 1000 : index;
    const hub = !!TASK_HUBS[g.scene];
    if (isTimeless(g.scene) || (isMenuScene(g.scene) && !hub)) return false; // the Coil's screens and meridians keep no marks (story.js notePicked)
    if (hub && isTaskChoice(scenes, g.scene, i)) return false;
    const ch = scenes[g.scene]?.choices?.[i];
    if (!ch) return false;
    if (WORK_SUBS(scenes).has(g.scene) && (ch.check || gives(ch).length)) return false;
    if (typeof ch.to === 'string' && (isTimeless(ch.to) || ch.to === 'yuki_form')) return false;
    if (typeof ch.to === 'function' && /yuki_form|meridians/.test(String(ch.to))) return false;
    return !/^Back\b/.test(String(label));
}

setFamiliar((g, scenes, index, label) => showPicked(g, scenes, index, label)); // v0.11.37 (F1): an old save's sepia marks (no count yet) are ×2

/** v0.10.0: "Next meridian session" — a queueable hub card that takes the first open session on the meridian screen. */
export const MER_TASK = 'mer:next';
/** v0.11.2: "Break through" as a queueable hub card (a timed sit, then the tribulation scene as a story stop). Only when no warning screen comes first. */
export const BT_TASK = 'bt:next';
export const btOpen = (g) => canBreakThrough(g) && btTarget(g) === 'breakthrough';
/** v0.11.12: "Cultivate (one sit)" as a queueable card on the task screens that have no Cultivate choice of their own (camp, stream, village). */
export const SIT_TASK = 'sit:next';
const hubHasSit = (scenes, hubId) => (scenes[hubId]?.choices || []).some((c) => c.to === hubId && /^(Cultivate|Condense)/.test(String(typeof c.text === 'function' ? '' : c.text)) && /condense\(g\)/.test(String(c.do)));
export const sitOpen = (g, scenes) => isQueueScreen(g, scenes) && !(TASK_HUBS[g.scene] && hubHasSit(scenes, g.scene)) && g.james.qi >= CONDENSE_SIT_COST && g.james.saturation < 100 && !sitUseless(g);
/** v0.11.46 (owner 19:26, pick Q1): "Meditate: gather Qi" — an hour of meditation at the resting rate (×2 regen, HP and Qi, like
 *  "Rest an hour"), queueable wherever Meditate shows, offered while Qi isn't full. */
export const QI_TASK = 'qi:next';
export const QI_MINUTES = 60;
export const qiNotFull = (g) => g.james.qi < jamesQiMax(g) - 0.05;
/** v0.11.47: not when starving; v0.11.48 (owner pick G1): an hour drains SATIETY_PER_HOUR (3) and regen needs Fed left at its end
 *  (game.js advance), so it opens only above that. */
export const qiFed = (g) => g.james.satiety > (SATIETY_PER_HOUR * QI_MINUTES) / 60;
export const qiOpen = (g, scenes) => isQueueScreen(g, scenes) && qiNotFull(g) && qiFed(g);
/** v0.11.14: the Meditate cards that can be queued anywhere Meditate shows. */
export const isMedTask = (id) => id === SIT_TASK || id === BT_TASK || id === QI_TASK || !!lineOfTask(id);
/** v0.11.14: a screen with a queue: a task screen, or a resting place where Meditate shows (only Meditate cards queue there). */
export const isQueueScreen = (g, scenes) => !g.combat && (!!TASK_HUBS[g.scene] || canMeditate(g, scenes));
/** v0.11.14: can queue row `id` run on this screen at all (else it waits for its own screen)? */
export const runsHere = (g, scenes, id) => (TASK_HUBS[g.scene] ? true : isQueueScreen(g, scenes) && isMedTask(id));
/** v0.11.13 (E1): one queueable card per meridian line (`mer:pri`, `mer:col`, `mer:e8`, `mer:ec`, `mer:jn`). `mer:next` is no longer
 * listed, but a queue saved with it still runs (primaries first, as before). */
export const merLineTask = (line) => `mer:${line}`;
export const lineOfTask = (id) => { const x = /^mer:(\w+)$/.exec(String(id)); return x && MER_LINES.includes(x[1]) ? x[1] : null; };
/** Index of line `line`'s choice on the meridian screen if it can run now, or -1. */
export function merLineChoice(g, scenes, line) {
    const i = lineIndex(scenes, line);
    return i >= 0 && lineWindow(g, line) && choiceOpen(g, scenes.meridians.choices[i]) ? i : -1;
}
/** Index of the meridian-screen choice the next session would take, or -1 (none left today, too little Qi, wrong realm). */
export function merChoice(g, scenes) {
    const cs = scenes.meridians?.choices || [];
    for (let i = 0; i < cs.length; i++) { const c = cs[i]; if (c.to === 'meridians' && (c.check || c.work) && choiceOpen(g, c)) return i; }
    return -1;
}
/* v0.11.64: every card happens at once, so the old "instant" cards (rest, sleep, eating: `instantChoice`, `isInstantTask`, v0.10.0 / v0.11.37) are no longer singled out. */

/** What kind of card `id` is on hub `hubId`, with its choice and (for menu cards) the door choice into its menu. */
function cardOf(scenes, hubId, id) {
    const cfg = TASK_HUBS[hubId];
    if (id === BT_TASK) return { kind: 'bt', c: null, p: { scene: 'breakthrough', index: -1 }, group: 'Meditate' };
    if (id === MER_TASK) return { kind: 'mer', c: null, p: { scene: 'meridians', index: -1 }, group: 'Meditate' };
    if (lineOfTask(id)) return { kind: 'mer', line: lineOfTask(id), c: null, p: { scene: 'meridians', index: -1 }, group: 'Meditate' };
    if (id === SIT_TASK) return { kind: 'sit', c: null, p: { scene: hubId, index: -1 }, group: 'Meditate' };
    if (id === QI_TASK) return { kind: 'qi', c: null, p: { scene: hubId, index: -1 }, group: 'Meditate' }; // v0.11.46 (Q1)
    const p = parse(id);
    const c = scenes[p.scene]?.choices?.[p.index];
    if (!c) return null;
    if (p.scene === hubId) {
        if (isDoor(cfg, c)) return { kind: 'door', c, p, group: cfg.own };
        if (isChore(hubId, c)) return { kind: c.check && !cfg.plainChecks ? 'work' : 'chore', c, p, group: cfg.own, menu: null };
        return null;
    }
    const m = (cfg.menus || {})[p.scene];
    const dm = (cfg.doorMenus || {})[p.scene];
    if (!m && !dm) return null;
    const ei = entryIndex(scenes, hubId, p.scene);
    if (ei < 0) return null;
    return { kind: dm ? 'door' : 'work', c, p, entry: scenes[hubId].choices[ei], entryIndex: ei, menu: p.scene, group: (m || dm).label, drill: !!m?.drill };
}

/** The no-dice check of a work card right now: { skill, value, dc, ratio, band }. */
export function cardCheck(g, id, c) {
    const t = st(g);
    const tier = famTier(t.fam[id] || 0);
    const value = r1(actingCheck(g, c.check.skill) + (c.check.bonus ? c.check.bonus(g) : 0) + (t.adapt[id] || 0));
    const dc = Math.max(0.5, r1(asText(c.check.dc, g) - DC_SHIFT + FAM[tier].dc));
    const ratio = value / dc;
    const band = ratio >= 2 ? 'double' : ratio >= 1 ? 'full' : ratio >= 0.5 ? 'partial' : 'fail';
    return { skill: actingName(g, c.check.skill), value, dc, ratio, band };
}

/** Every card on the current hub: { id, kind, group, label, tag, minutes (estimate), status, tier, fam, next, check? }. */
export function taskCards(g, scenes, only = null) {
    const hubId = g.scene;
    const cfg = TASK_HUBS[hubId];
    if (!cfg) return nightCards(g, scenes, medTaskCards(g, scenes), only); // v0.11.14: a resting place: only the Meditate cards
    const hub = scenes[hubId];
    const t = st(g);
    const cards = [];
    const push = (id, kind, group, c, minutes, status) => {
        const f = t.fam[id] || 0;
        const card = { id, kind, group, label: asText(c.text, g), minutes, status, tier: famTier(f), fam: f, next: nextAt(f) };
        if (kind === 'work' && c.check) { card.check = cardCheck(g, id, c); card.tag = `${card.check.skill} ${card.check.value} / DC ${card.check.dc} → ${card.check.band}${c.qi ? ` · ${c.qi} Qi` : ''}`; } else card.tag = choiceTag(g, c);
        cards.push(card);
    };
    for (const [menu, m] of [...Object.entries(cfg.menus || {}), ...Object.entries(cfg.doorMenus || {})]) {
        const ei = entryIndex(scenes, hubId, menu);
        if (ei < 0) continue;
        const entry = hub.choices[ei];
        const door = !!(cfg.doorMenus || {})[menu];
        // v0.11.161 (owner pick PO2, FG): a menu whose options are each once a day (`byOption`) shows them all as tomorrow once every one is used.
        // RV1 (L2, Fable's review): only for menus whose every card is gated by the day alone (the Blackroot's Forage; the tasks test checks it):
        // a card hidden for another reason (a form, a Back) would otherwise read as done for the day
        const doneToday = (m.daily && !daily(m.daily)(g)) || (m.byOption && !(scenes[menu].choices || []).some((c) => !c.show || c.show(g)));
        if (!doneToday && !choiceOpen(g, entry)) continue;
        (scenes[menu].choices || []).forEach((c, i) => {
            if (door ? (typeof c.to !== 'string' || c.to === hubId) : !hasWork(c)) return;
            if (cfg.notJames && cfg.notJames(c)) return;
            if (!onceOpen(g, menu, i)) return; // v0.11.33: done this Coil
            let status = 'open';
            if (doneToday) status = 'tomorrow';
            else if (c.show && !c.show(g)) { if (c.show.dailyKey && (!c.form || hasForm(g, c.form))) status = 'tomorrow'; else return; } // v0.10.4: a form he can't sing yet stays hidden
            else if (!choiceOpen(g, c)) return;
            push(`${menu}:${i}`, door ? 'door' : 'work', m.label, c, (entry.time || 0) + (c.time || 0), status);
            if (m.note) cards[cards.length - 1].groupNote = m.note(g) || ''; // v0.11.156 (DM1, TX-A): a note after the group's heading
        });
    }
    hub.choices.forEach((c, i) => {
        if (!choiceOpen(g, c)) return;
        if (sitUseless(g) && isSitChore(c, hubId)) return; // v0.11.37 (B2): a sit that changes nothing is not offered
        if (isDoor(cfg, c)) push(`${hubId}:${i}`, 'door', cfg.own, c, c.time || 0, 'open');
        else if (isChore(hubId, c)) push(`${hubId}:${i}`, c.check && !cfg.plainChecks ? 'work' : 'chore', cfg.own, c, c.time || 0, 'open');
    });
    cards.push(...medTaskCards(g, scenes));
    return nightCards(g, scenes, cards, only);
}
/**
 * v0.11.37 (owner 14:17, pick D-a): from the day's end (00:00 since v0.11.91; 02:00 before) a task screen offers only the night: eating stays (its story stops, the
 * evening exits, show as before); any other card that would end past it is 'late' (shown locked; the queue skips
 * it). The breakthrough is exempt (it is rest). `only`: check just that card (taskOpen, the forecast's rows).
 */
const NIGHT_OK = /^(Eat|Cook and eat|Chew a ghost-gill)\b/;
const isNightOk = (c) => c.kind === 'chore' && NIGHT_OK.test(String(c.label));
/** v0.11.141 (owner pick FX1, CH): a chore whose own time speeds with its familiarity: not a sit, a rest or a season (`noFam`). */
export const choreSpeeds = (hubId, c) => !!c && c.time > 0 && !isSitChore(c, hubId) && !c.noFam && !/resting: true/.test(String(c.do));
const isSitChore = (c, hubId) => c.to === hubId && /^(Cultivate|Condense)/.test(String(typeof c.text === 'function' ? '' : c.text)) && /condense\(g\)/.test(String(c.do));
function nightCards(g, scenes, cards, only) {
    if (nightLock(g)) return cards.filter(isNightOk);
    for (const c of cards) {
        if (c.status !== 'open' || c.kind === 'bt' || isNightOk(c) || (only && c.id !== only)) continue; // eating is open at night anyway (Fable review)
        if (!endsLate(g, 4 * (c.minutes || 0) + 120)) continue; // cheap bound first (work ×2 new; a sit or a rest inside a chore ≤ 2 h)
        if (endsLate(g, taskMinutes(g, scenes, c.id))) c.status = 'late';
    }
    return cards;
}
/** The queueable Meditate cards here (v0.11.13 meridian lines, v0.11.12 sit, v0.11.2 breakthrough); off the task screens they are the only cards (v0.11.14). */
function medTaskCards(g, scenes) {
    const cards = [];
    if (!isQueueScreen(g, scenes)) return cards;
    for (const line of MER_LINES) { // v0.11.13 (E1): where "Next meridian session" was
        const mi = merLineChoice(g, scenes, line);
        if (mi < 0) continue;
        const c = scenes.meridians.choices[mi];
        cards.push({ id: merLineTask(line), kind: 'mer', line, group: 'Meditate', label: asText(c.text, g), tag: choiceTag(g, c), minutes: c.minutes ? c.minutes(g) : c.time || 0, status: 'open', tier: 0, fam: 0, next: null });
    }
    if (sitOpen(g, scenes)) cards.push({ id: SIT_TASK, kind: 'sit', group: 'Meditate', label: 'Cultivate: one sit', tag: `${CONDENSE_SIT_COST} Qi`, minutes: sitMinutes(g), status: 'open', tier: 0, fam: 0, next: null });
    if (qiOpen(g, scenes)) cards.push({ id: QI_TASK, kind: 'qi', group: 'Meditate', label: 'Meditate: gather Qi', tag: 'an hour, resting', minutes: QI_MINUTES, status: 'open', tier: 0, fam: 0, next: null }); // v0.11.46 (Q1)
    if (btOpen(g)) cards.push({ id: BT_TASK, kind: 'bt', group: 'Meditate', label: `Break through to ${realmName(g.james.realm + 1)}`, tag: `${btMinutes(g)} min`, minutes: btMinutes(g), status: 'open', tier: 0, fam: 0, next: null });
    return cards;
}

export const taskOpen = (g, scenes, id) => (id === MER_TASK ? !!TASK_HUBS[g.scene] && merChoice(g, scenes) >= 0 && !nightLock(g) : taskCards(g, scenes, id).some((c) => c.id === id && c.status === 'open')); // v0.11.13: an old queue's mer:next still runs
export const taskLabel = (g, scenes, id) => { if (id === MER_TASK) return 'Next meridian session'; if (lineOfTask(id)) return lineName(g, lineOfTask(id)).replace(/\.$/, ''); if (id === BT_TASK) return 'Break through'; if (id === SIT_TASK) return 'Cultivate: one sit'; if (id === QI_TASK) return 'Meditate: gather Qi'; const p = parse(id); const c = scenes[p.scene]?.choices?.[p.index]; return c ? asText(c.text, g) : id; };

/** HP 0 during a task (v0.9.4): the Coil ends; the Coil screen decides what happens next. */
function collapse(g, scenes, hubId) {
    st(g).queue.length = 0;
    endCoil(g, 'collapse');
    return ['Your knees make the decision for you. You fold up where you stand, and the last thing you see is Yuki\'s face, very close, very unimpressed.',
        ...goTo(g, scenes, 'coil_end')];
}

function learn(g, scenes, hubId, card, id, gain) {
    const t = st(g);
    t.fam[id] = r1((t.fam[id] || 0) + gain);
    if (card.menu) {
        (scenes[card.menu].choices || []).forEach((c, i) => { const o = `${card.menu}:${i}`; if (o !== id && hasWork(c)) t.fam[o] = r1((t.fam[o] || 0) + gain * TRANSFER); });
    }
    if (card.drill) {
        const cfg = TASK_HUBS[hubId];
        for (const menu of Object.keys(cfg.menus || {})) (scenes[menu].choices || []).forEach((c, i) => { const o = `${menu}:${i}`; if (o !== id && hasWork(c) && menu !== card.menu) t.fam[o] = r1((t.fam[o] || 0) + DRILL_SHARE); });
    }
}

const BAND_TEXT = { double: 'a double haul', full: 'done', partial: 'partly', fail: 'failed' };

/** A work card, resolved without dice. Returns its lines; leaves the story wherever the choice leads. */
function resolveWork(g, scenes, hubId, card, id) {
    const { c } = card;
    const t = st(g);
    const lines = [];
    const tier = famTier(t.fam[id] || 0);
    if (card.entry?.do) lines.push(...(card.entry.do(g) || []));
    if (card.menu) lines.push(...goTo(g, scenes, card.menu));
    if (c.qi && !spendQi(g, c.qi)) throw new Error('Not enough Qi');
    let band = 'full', ratio = 1;
    if (c.check) {
        const k = cardCheck(g, id, c);
        band = k.band; ratio = k.ratio;
        g.stats.checks += 1; if (band !== 'fail') g.stats.wins += 1;
        lines.push(`${k.skill} ${k.value} / DC ${k.dc} — ${BAND_TEXT[band]}`);
        if (c.xp !== false) lines.push(...awardXp(g, c.check.xpTo || c.check.skill, c.check.band || 'standard', { fail: band === 'fail', factor: band === 'partial' ? ratio : 1 }));
    }
    const mins = Math.round((((card.entry?.time || 0) + (c.time || 0)) * NEW_LENGTH) / cardSpeed(t.fam[id] || 0));
    lines.push(...advance(g, mins, { work: true }));
    g.james.satiety = Math.max(0, g.james.satiety - (FED_EXTRA_PER_HOUR * mins) / 60);
    takeCapNotes();
    const items = gives(c).length > 0;
    const success = band === 'double' || band === 'full' || (band === 'partial' && items);
    const roll = { success, crit: band === 'double', ratio };
    if (card.menu && success) noteOnce(g, card.menu, Number(String(id).split(':').pop()), c); // v0.11.33: once per Coil; a failed try can be made again (owner 14:05)
    if (success && c.do) {
        const before = { ...g.inventory };
        if (band === 'double') setLootMult(2);
        let out = [];
        try { out = c.do(g, roll) || []; } finally { setLootMult(1); }
        lines.push(...(band === 'partial' ? keepReplies(out) : out)); // a partial lists only what it keeps; v0.11.69 (P1): its reply sentences stay
        const gained = Object.keys(g.inventory).map((i) => [i, (g.inventory[i] || 0) - (before[i] || 0)]).filter(([, d]) => d > 0);
        if (band === 'partial') {
            const kept = gained.map(([i, d]) => { const keep = Math.max(1, Math.floor(d * ratio)); if (keep < d) addItem(g, i, keep - d); return [i, keep]; }).filter(([, d]) => d > 0);
            lines.push(kept.length ? `A thin haul — you keep: ${kept.map(([i, d]) => `+${d} ${itemNames[i]?.name || i}`).join(', ')}.` : 'A thin haul — nothing worth keeping.');
        } else if (band === 'double' && gained.length) lines.push(`Double haul — in total: ${gained.map(([i, d]) => `+${d} ${itemNames[i]?.name || i}`).join(', ')}.`);
    } else if (!success && c.failDo) {
        const hp0 = g.james.hp;
        const out = c.failDo(g, roll) || [];
        // a partial never hurts, so its text drops the sentences about HP
        lines.push(...(band === 'partial' ? out.map((l) => l.replace(/[^.!?]*−\d+(?:\.\d+)? HP[^.!?]*[.!?]?/g, '').trim()).filter(Boolean) : out));
        const lost = hp0 - g.james.hp;
        if (band === 'fail' && lost > 0) { g.james.hp -= lost; lines.push(`It goes in deeper than it should: another −${r1(lost)} HP.`); }
        if (band === 'partial' && lost > 0) g.james.hp = hp0; // a partial never hurts
    }
    for (const i of new Set(takeCapNotes())) lines.push(`Hammerspace: ${itemNames[i]?.name || i} is full — the rest stays behind.`);
    if ((band === 'partial' || band === 'fail') && c.check) {
        const a = t.adapt[id] || 0;
        if (a < ADAPT_MAX) { t.adapt[id] = Math.min(ADAPT_MAX, a + ADAPT_STEP); lines.push(`${ADAPT_REPLY} (Intuitive Aptitude: +${ADAPT_STEP} on this next time.)`); }
    }
    learn(g, scenes, hubId, card, id, band === 'fail' ? 0.5 : 1);
    const dest = band === 'fail' ? (c.fail ?? c.to) : c.to;
    lines.push(...goTo(g, scenes, typeof dest === 'function' ? dest(g) : dest));
    if (card.menu && g.scene === card.menu) lines.push(...goTo(g, scenes, hubId));
    g.log.push({ at: g.minutes, scene: g.scene, lines: lines.slice(0, 12) });
    if (g.log.length > 200) g.log.shift();
    return lines;
}

/** v0.11.169 (owner picks P3A, CA1, YH): a Yuki job's `none` / `full` line, a string or a function of `g` (Ashfall's by her form). */
export const yukiSays = (g, t) => (typeof t === 'function' ? t(g) : t);
/**
 * v0.11.71 (owner pick Y1): what Yuki brings on this job: her own kind, or once it can't take the whole haul (`n`; after
 * the cold review, R1) the first of the job's `alts` that can (a `big` one, venison, only in tiger or human form);
 * null when none can.
 */
const roomFor = (g, id, n = 1) => itemCap(id) - (g.inventory[id] || 0) >= n;
export function yukiCatch(g, job, n = 1) {
    if (roomFor(g, job.item, n)) return { item: job.item, got: job.got };
    return (job.alts || []).find((a) => (!a.big || yukiForm(g) !== 'cat') && roomFor(g, a.item, n)) || null;
}
/**
 * v0.11.118 (owner pick YK1, D8, the owner's d8): a haul is a d8 from the save's stream, not her Fight: 1–2 nothing, 3–4
 * half (a one-item job: another d8, 1–4 one), 5–6 the job's own, 7–8 double. Her Fight (held at James's GU) no longer
 * sets it; `job.dc` is kept in the data, unused.
 */
export const YUKI_D8 = [0, 0, 0.5, 0.5, 1, 1, 2, 2];
export const YUKI_LANE_TEXT = { roll: 'd8 per haul: 1–2 nothing · 3–4 half · 5–6 full · 7–8 double' }; // Fable's (the MAIN)
export function yukiHaul(g, job) {
    const k = YUKI_D8[d8(g) - 1];
    if (k !== 0.5) return job.n * k;
    return job.n >= 2 ? Math.floor(job.n / 2) : d8(g) <= 4 ? 1 : 0;
}
/** Yuki's lane: her job runs on the game time that just passed. */
function yukiTick(g, hubId, minutes) {
    const job = TASK_HUBS[hubId]?.yuki;
    const y = st(g).yuki;
    if (!job || !y.on || minutes <= 0) return [];
    const { hh } = clockParts(g.minutes);
    if (hh < YUKI_HOURS[0] || hh >= YUKI_HOURS[1]) return [];
    const lines = [];
    y.progress = (y.progress || 0) + minutes;
    for (let guard = 0; guard < 20; guard++) {
        const f = st(g).fam[job.id] || 0;
        const len = Math.round((job.minutes * NEW_LENGTH) / yukiSpeed(f));
        if (y.progress < len) break;
        y.progress -= len;
        const n = yukiHaul(g, job);
        const pick = n > 0 ? yukiCatch(g, job, n) : null;
        if (pick) { addItem(g, pick.item, n); lines.push(`${pick.got(n, g)} +${n} ${itemNames[pick.item]?.name || pick.item}.`, ...awardYukiFightXp(g, 'challenging')); }
        else if (n > 0) lines.push(yukiSays(g, job.full || job.none), ...awardYukiFightXp(g, 'challenging')); // v0.11.71 (Y1): everything she brings here is full: she eats it; XP and familiarity as a haul
        else lines.push(yukiSays(g, job.none));
        takeCapNotes();
        st(g).fam[job.id] = r1(f + (n > 0 ? 1 : 0.5));
    }
    return lines;
}

/** Yuki's job on this hub, for the screen: { label, on, progress, len, fam, tier, speedLine } or null. */
export function yukiLane(g) {
    const job = TASK_HUBS[g.scene]?.yuki;
    if (!job) return null;
    const y = st(g).yuki;
    const f = st(g).fam[job.id] || 0;
    return { label: job.label, on: !!y.on, progress: y.progress || 0, len: Math.round((job.minutes * NEW_LENGTH) / yukiSpeed(f)), fam: f, tier: famTier(f), speedLine: yukiSpeedLine(f) }; // v0.11.158 (YS): speedLine for the lane // v0.11.118 (YK1, D8): no Fight / DC (the haul is a d8)
}
export function setYuki(g, on) { st(g).yuki.on = !!on; }

/**
 * Run card `id` now (at once, v0.11.64). Returns { lines, fail, stopped }: `stopped` means the story
 * left the hub (a door, a fail scene, a collapse), so the screen changes.
 */
/** v0.11.134 (LP2, LR): the reply of a failed or partial card's Intuitive Aptitude line (its gain goes to Results); the text lint reads it. */
export const ADAPT_REPLY = 'You see what went wrong.';
export function runTask(g, scenes, id) {
    const hubId = g.scene;
    if (g.tasks?.door) delete g.tasks.door; // v0.11.141 (FX1, DI): back on a task screen
    if (!runsHere(g, scenes, id)) throw new Error(`Not a task hub: ${hubId}`); // v0.11.14: Meditate cards also on the resting places
    const card = cardOf(scenes, hubId, id);
    if (!card) throw new Error(`No card ${id} on ${hubId}`);
    const m0 = g.minutes;
    const lines = [];
    let fail = false;
    if (card.kind === 'bt') {
        if (!btOpen(g)) throw new Error('No breakthrough possible');
        g.flags.bt_return = hubId;
        if (!TASK_HUBS[hubId]) g.flags.med_back = hubId; // v0.11.14: back to a resting place without its enter again
        lines.push(...goTo(g, scenes, 'breakthrough'));
    } else if (card.kind === 'qi') { // v0.11.46 (Q1): an hour at the resting rate
        if (!qiOpen(g, scenes)) throw new Error('Qi is already full');
        const q0 = g.james.qi;
        lines.push(...advance(g, QI_MINUTES, { resting: true }));
        lines.push(`Meditated an hour: Qi ${Math.round(q0 * 10) / 10} → ${Math.round(g.james.qi * 10) / 10}.`);
    } else if (card.kind === 'sit') {
        if (!sitOpen(g, scenes)) throw new Error('No sit possible');
        const r = condense(g);
        lines.push(...(r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : ['Not enough Qi to sit.']));
    } else if (card.kind === 'mer') {
        const mi = card.line ? merLineChoice(g, scenes, card.line) : merChoice(g, scenes);
        if (mi < 0) throw new Error('No meridian session possible');
        g.scene = 'meridians';
        const r = choose(g, scenes, mi, { task: true });
        lines.push(...r.lines);
        if (r.roll && !r.roll.success) fail = true;
        if (g.scene === 'meridians') g.scene = hubId; // back to the hub without running its enter
    } else if (card.kind === 'work') {
        const before = g.stats.wins;
        const checks = g.stats.checks;
        lines.push(...resolveWork(g, scenes, hubId, card, id));
        fail = g.stats.checks > checks && g.stats.wins === before;
    } else {
        // v0.11.140 (owner pick FM2, FD): a door card's walk ÷ its own familiarity, as a work card's; v0.11.141 (FX1, CH): a chore's own
        // time too (not a sit, a rest or the Long Forest's season: their time is cultivation or healing, by their own rules)
        const speed = card.kind === 'door' || (card.kind === 'chore' && choreSpeeds(g.scene, card.c)) ? cardSpeed(st(g).fam[id] || 0) : 0;
        const take = (index) => { const r = choose(g, scenes, index, { task: true, speed }); lines.push(...r.lines); if (r.roll && !r.roll.success) fail = true; if (r.combat) throw new Error(`A task can't start a fight (${id})`); };
        if (card.menu) take(card.entryIndex);
        if (!card.menu || g.scene === card.menu) take(card.p.index);
        if (card.kind === 'chore' || card.kind === 'door') learn(g, scenes, hubId, card, id, 1);
        if (card.kind === 'door' && g.scene !== hubId) st(g).door = { id, speed }; // v0.11.141 (FX1, DI): the scenes behind it run at its speed (story.js)
    }
    lines.push(...yukiTick(g, hubId, g.minutes - m0));
    let stopped = g.scene !== hubId;
    if (!stopped && g.james.hp <= 0) { lines.push(...collapse(g, scenes, hubId)); stopped = true; }
    return { lines, fail, stopped };
}

const fullClone = (g) => JSON.parse(JSON.stringify(g));
/**
 * v0.11.20: the dry runs' copy (taskMinutes, the forecast) leaves out the journal log (about 3/4 of a save, never read by the
 * rules) and shares the Coil snapshot (only ever copied from, never changed in place): about 6× faster, the same numbers.
 */
export function dryClone(g) {
    const { log, coil, picked, read, lines, ...rest } = g; // v0.11.32: picked choices change nothing a dry run measures; a copy starts its own (v0.11.133: the paragraphs read too; v0.11.134: the line picker's record)
    const c = JSON.parse(JSON.stringify(rest));
    c.log = [];
    if (coil) { const { snap, ...cr } = coil; c.coil = JSON.parse(JSON.stringify(cr)); if (snap !== undefined) c.coil.snap = snap; }
    return c;
}
export const setDryClone = (full) => { clone = full ? fullClone : dryClone; }; // tests: compare against the old full copy
let clone = dryClone;

/** Game minutes card `id` will take from here (a dry run on a copy: no dice, so the prediction is exact). */
export function taskMinutes(g, scenes, id) {
    const c = clone(g);
    const m0 = c.minutes;
    const card = cardOf(scenes, c.scene, id);
    if (card?.kind === 'door') { // only the walk: the scene's own time belongs to the story
        const from = card.menu || c.scene;
        const to = typeof card.c.to === 'string' ? card.c.to : null;
        const sp = cardSpeed(st(c).fam[id] || 0); // v0.11.140 (FD): each step as runTask times it (story.js doorMinutes)
        return doorMinutes(card.entry?.time || 0, sp) + doorMinutes(card.c.time || 0, sp) + (to ? doorMinutes(defaultMinutes(scenes, from, card.c, to, movesPlace(c, scenes, from, to)), sp) : 0);
    }
    runTask(c, scenes, id);
    return Math.max(0, c.minutes - m0);
}

/**
 * v0.11.64 (A1, B1): what card `id` does from here, played on a copy (no dice, so it is exact): its game minutes, the minute
 * it ends, Fed and HP at its end, and `death` ('hunger' | 'injury') if the Coil would end on it. A door counts only its walk
 * for its minutes, Fed and HP, but its `death` (and then `deathAt`, the clock of the death) from the whole card (v0.11.66, F1).
 */
export function taskOutcome(g, scenes, id) {
    const c = clone(g);
    const card = cardOf(scenes, c.scene, id);
    if (card?.kind === 'door') { // the walk's minutes; v0.11.66 (owner pick F1): the death from a full run on the copy (a door that throws there, a fight, reads as no death)
        const minutes = taskMinutes(g, scenes, id);
        let death = null, deathAt = null;
        try { runTask(c, scenes, id); death = outcomeOf(c, c.minutes).death; if (death) deathAt = c.minutes; } catch { death = null; }
        return { minutes, end: g.minutes + minutes, fed: g.james.satiety, hp: g.james.hp, death, ...(death ? { deathAt } : {}) }; // the card shows the walk's end; the warning the death's clock (the review, R1)
    }
    const m0 = c.minutes;
    runTask(c, scenes, id);
    return outcomeOf(c, m0);
}
/** v0.11.64 (B1): the same for a Meditate card that runs off the task list (meditate.js runMed), passed in as `run`. */
export function dryOutcome(g, run) {
    const c = clone(g);
    const m0 = c.minutes;
    run(c);
    return outcomeOf(c, m0);
}
/** A Coil-ending death: the Coil screen for a collapse or a beast (a chosen "Bite the tail", the tribute or Shen Qiu are no death; the death hook sets HP back to 1, so HP can't tell). */
export const outcomeOf = (c, m0) => ({ minutes: Math.max(0, c.minutes - m0), end: c.minutes, fed: c.james.satiety, hp: c.james.hp, death: c.scene === 'coil_end' && (c.coil?.why === 'collapse' || c.coil?.why === 'beast') ? (c.james.satiety <= 0 ? 'hunger' : 'injury') : null });

/* ---------- v0.11.64 (owner 02:07, pick C1): Cultivate until the limit ---------- */
export const SIT_LOOP_MAX = 200;
/** The sit this screen runs: the hub's own Cultivate chore, or "Cultivate: one sit". */
export function sitTaskId(g, scenes) {
    if (TASK_HUBS[g.scene]) { const i = (scenes[g.scene]?.choices || []).findIndex((c) => isSitChore(c, g.scene)); if (i >= 0) return `${g.scene}:${i}`; }
    return SIT_TASK;
}
/** Why the next sit can't run ('' = it can): Saturation at the breakthrough point, Qi short, past the day's end, the card shut. */
function sitStop(g, scenes, id) {
    if (sitUseless(g) || g.james.saturation >= breakAt()) return 'sat';
    if (g.james.qi < CONDENSE_SIT_COST) return 'qi';
    if (nightLock(g) || endsLate(g, sitMinutes(g))) return 'night';
    if (!taskOpen(g, scenes, id)) return 'shut';
    return '';
}
/**
 * Sit after sit, each exactly one tap of the sit card (runTask), until the first of: Saturation 95% (the breakthrough
 * point; nothing over 100% carries), Qi under 10, a sit that would end past the day's end, a sit that would leave Fed at 0, or the
 * story leaving the screen. Returns { sits, lines, stop, minutes, qi, saturation } (`qi` = Qi spent net of regen).
 */
export function sitLoop(g, scenes) {
    const id = sitTaskId(g, scenes);
    const scene = g.scene, m0 = g.minutes, q0 = g.james.qi;
    const lines = [];
    let sits = 0, stop = '';
    while (sits < SIT_LOOP_MAX) {
        stop = sitStop(g, scenes, id);
        if (stop) break;
        const t = clone(g);
        runTask(t, scenes, id);
        if (t.james.satiety <= 0) { stop = 'fed'; break; }
        const r = runTask(g, scenes, id);
        lines.push(...r.lines);
        sits += 1;
        if (r.stopped || g.scene !== scene) { stop = 'left'; break; }
    }
    if (sits >= SIT_LOOP_MAX) stop = stop || 'max';
    return { sits, lines, stop, minutes: g.minutes - m0, qi: Math.round((q0 - g.james.qi) * 10) / 10, saturation: g.james.saturation };
}
/** The loop played on a copy, for the button. */
export const sitLoopPlan = (g, scenes) => sitLoop(clone(g), scenes);
/**
 * v0.11.71 (owner pick C1): the loop's lines in short: one total per skill ("GU +75 XP → T2 L1", the last rank reached;
 * a skill at its cap says so once), the per-sit Saturation lines dropped (the loop's header has the end figure), every
 * other line kept, in order, after the totals.
 */
const SIT_SAT = /^Condensed: Saturation [\d.]+%\.$/;
const SIT_XP = /^(.+?) \+([\d.]+)(?: XP)?(?: → (.+))?$/;
const SIT_CAP = /^(.+?) at T10 L10 \(cap\)$/;
const SIT_SKILLS = /^(Convergence Use|GU|Yuki \(bond\) Qi Use)$/;
const SIT_SHARE = /^GU \+(\d+) XP(?: → (T\d+ L\d+))?, (.+)$/;
const SHARE_KEY = 'share';
export function sitSummary(lines) {
    const tot = new Map(), rest = [];
    const get = (name) => { if (!tot.has(name)) tot.set(name, { sum: 0, rank: '', cap: false, xp: !/^Yuki/.test(name) }); return tot.get(name); };
    for (const l of lines) {
        if (SIT_SAT.test(l)) continue;
        const sh = SIT_SHARE.exec(l); // v0.11.120 (LX1 review, SS): James's share of Yuki's held XP: a total of its own, not his GU's
        if (sh && sh[3] === YUKI_HELD_TEXT.share) { const t = get(SHARE_KEY); t.sum += Number(sh[1]); if (sh[2]) t.rank = sh[2]; continue; }
        const c = SIT_CAP.exec(l);
        if (c && SIT_SKILLS.test(c[1])) { get(c[1]).cap = true; continue; }
        const m = SIT_XP.exec(l);
        if (m && SIT_SKILLS.test(m[1])) { const t = get(m[1]); t.sum += Number(m[2]); if (m[3]) t.rank = m[3]; continue; }
        rest.push(l);
    }
    const out = [];
    for (const [name, t] of tot) {
        const sum = Math.round(t.sum * 10) / 10;
        if (name === SHARE_KEY) { if (sum > 0) out.push(`GU +${sum} XP${t.rank ? ` → ${t.rank}` : ''}, ${YUKI_HELD_TEXT.share}`); continue; }
        if (sum > 0) out.push(`${name} +${sum}${t.xp ? ' XP' : ''}${t.rank ? ` → ${t.rank}` : ''}`);
        if (t.cap) out.push(`${name} at T10 L10 (cap)`);
    }
    return [...out, ...rest];
}
export const SIT_STOP_TEXT = { sat: 'the breakthrough point', qi: 'then Qi runs out', night: 'then the day ends', fed: 'then you need food', shut: 'then it stops', left: 'the story moves on', max: 'a long session' };

/* ---------- v0.11.72 (owner pick N1, the copy-over push 5): the next-step line ---------- */
/**
 * One hint for the prologue's task screens, from the first rule that matches, or '' (Selene's nextStepTxt). Shown until
 * James first reaches Act 1 (`stats.coils0`, set on the crossing); not in Act 1, the Long Forest or a fight. The ✕ that
 * hides it for good is the phone's (`boneash.nonext`, js/main.js).
 */
export function nextStep(g, scenes) {
    if (!TASK_HUBS[g.scene] || g.combat || g.scene === 'lf_hub' || (g.coil?.act || 0) !== 0 || g.stats?.coils0 || g.flags?.lf_active) return ''; // the review's M2 (R1): only the Long Forest itself, not the save after it
    const day = clockParts(g.minutes).day, n = g.coil?.n || 1;
    if (g.james.satiety < 30 && foodCount(g) > 0) return 'You\'re hungry and carrying food: eat before the next card.';
    if (canBreakThrough(g)) return 'Saturation has reached the breakthrough point: Meditate → Break through.';
    if (n === 1 && day === 1) return 'Tap a card and it happens at once: the clock moves by the time on the card, which shows when it ends.';
    const yl = yukiLane(g);
    if (yl && !yl.on) return 'Yuki can hunt on her own while you work: switch her job on at the top of the list.';
    if (n >= 2 && day === 1) return `A new Coil: the world and the hammerspace started over, but your familiarity and what James knows didn't. Cards you know run faster${coilMult(g) > 1 ? `, and you learn ×${fmtMult(coilMult(g))} as fast` : ''}.`; // v0.11.86: no "×1 as fast"
    if (g.james.qi >= CONDENSE_SIT_COST && g.james.qi >= 0.9 * jamesQiMax(g) && g.james.saturation < breakAt() && !sitUseless(g) && taskOpen(g, scenes, sitTaskId(g, scenes))) return 'Qi is nearly full: Cultivate turns it into Saturation.';
    if (g.flags.long && day >= 2 && day <= 6) return `Day ${day} of 7: the Sect's tribute comes on Day 7.`;
    return '';
}

