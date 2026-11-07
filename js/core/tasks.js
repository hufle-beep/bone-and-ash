/**
 * Task cards and the queue (v0.9.0 step 3a; v0.9.2 step 3b). Pure — no DOM.
 *
 * Kinds of card (ids are `<scene>:<choice index>`):
 * - work: a sub-menu choice (`menus`) or a hub choice with a check. Resolved here WITHOUT dice (3b):
 *   ratio = check ÷ DC → double (≥ 2), full (≥ 1), partial (≥ 0.5: loot and XP scaled), fail (HP loss doubled).
 *   Harder until familiar: DC = old DC − 2, then +2 new / +1 Practised / +1 Skilled / +0 Mastered; length × 2 / 1 / 0.4 / 0.2.
 * - chore: a hub choice without a check that leads back to the hub (eat, rest, cultivate): runs through `choose` as before.
 * - door: a choice into a scene with dialogue or a fight; runs through `choose`, the scene opens as a story stop.
 * Intuitive Aptitude: a result below full gives that card +0.5 check next time (up to +2); a quarter of every
 * completion goes to the other cards of its group. Drills give 0.2 to every card on the hub.
 * Yuki's lane: her job on the hub runs on game time while James works (no dice; her Fight check vs the job's DC).
 * The story checks and fights keep the d6 until 3c.
 */
import { hasForm } from './forms.js';
import { choose, goTo, choiceOpen, choiceTag, gives, setTimeless, defaultMinutes, movesPlace, wasPicked, isMenuScene, isTimeless, setFamiliar } from './story.js';
import { advance, clockParts, actingCheck, actingName, awardXp, awardYukiFightXp, spendQi, setLootMult, takeCapNotes, itemNames, addItem, skillCheck, canBreakThrough, btMinutes, realmName, condense, sitMinutes, useSpeed, USE_N, exMins, nightLock, endsLate, sitUseless, jamesQiMax, SATIETY_PER_HOUR } from './game.js';
import { CONDENSE_SIT_COST } from './formulas.js';
import { btTarget, MER_LINES, lineWindow, lineIndex, lineName } from '../story/meridians.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { onceOpen, noteOnce, stageOpen, ONCE_MENUS } from '../story/oneoff.js';
import { daily } from '../story/common.js';
import { endCoil } from './coil.js';
import { canMeditate } from './meditate.js';

setTimeless(Object.fromEntries(Object.entries(TASK_HUBS).map(([h, cfg]) => [h, [...Object.keys(cfg.menus || {}), ...Object.keys(cfg.doorMenus || {})]]))); // hub ↔ menu steps take no extra time (v0.9.5)

export const MS_PER_GAME_HOUR = 3000; // 1 game hour = 3 s at ×1 (design.md)
export const QUEUE_MAX = 30;
/** Speed gate (3c-3, owner 2026-11-06): ×1 at the start, ×2 once the tribute has been reached (fought, bluff, the hairpin, or lost: v0.11.31, P3-b), ×5 after Act 1 ends (any route, `taken` included); ×10 only with the hidden test toggle. Read from the save, so no migration. v0.11.31: a gate once open stays open across every rewind (`spd_pro`, `spd_a1` are kept flags, coil.js). */
export function maxSpeed(g, test = false) {
    if (test) return 10;
    const f = (g && g.flags) || {};
    if (f.spd_a1 || (f.a1_outcome && g.scene === 'a1_end')) return 5;
    if (f.spd_pro || f.ending === 'fought' || f.ending === 'bluff' || f.ending === 'paid' || f.ending === 'lost') return 2;
    return 1;
}
/** The speed that actually runs: the stored one, held down to the gate (0 = paused stays 0). */
export const effectiveSpeed = (g, stored, test = false) => (stored ? Math.min(stored, maxSpeed(g, test)) : 0);
export const DC_SHIFT = 2; // no dice: DCs move down to the new scale (K 2, owner 2026-11-06)
export const FAM = [{ name: 'New', at: 0, dc: 2, speed: 1 }, { name: 'Practised', at: 2, dc: 1, speed: 2 }, { name: 'Skilled', at: 8, dc: 1, speed: 5 }, { name: 'Mastered', at: 18, dc: 0, speed: 10 }];
export const NEW_LENGTH = 2; // a new card takes twice its old time; familiarity divides it
const ADAPT_STEP = 0.5, ADAPT_MAX = 2, TRANSFER = 0.25, DRILL_SHARE = 0.2, FED_EXTRA_PER_HOUR = 1; // Fed −4 an hour in total while tasks run
const YUKI_HOURS = [6, 19];

const asText = (v, g) => (typeof v === 'function' ? v(g) : v);
const r1 = (x) => Math.round(x * 10) / 10;
export const famTier = (f) => (f >= 18 ? 3 : f >= 8 ? 2 : f >= 2 ? 1 : 0);
/** v0.11.15 (B1-b): a card's speed by use: 1 + 9 × (familiarity ÷ 18), up to ×10 (= the tiers' ×2 / ×5 / ×10 at 2 / 8 / 18). */
/** v0.11.18 (owner pick c): Yuki's job has its own slower curve, N 90, capped at ×3 (Incremental Mode). */
export const YUKI_N = 90, YUKI_CAP = 3;
export const yukiSpeed = (f) => Math.min(YUKI_CAP, useSpeed(f, YUKI_N));
export const cardSpeed = (f) => useSpeed(f, USE_N.card);
const nextAt = (f) => FAM.find((t) => t.at > f)?.at ?? null;

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
export const taskQueue = (g) => st(g).queue;
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
    const hub = !!TASK_HUBS[g.scene];
    if (!wasPicked(g, g.scene, i) || (isMenuScene(g.scene) && !hub)) return false;
    if (hub && isTaskChoice(scenes, g.scene, i)) return false;
    const ch = scenes[g.scene]?.choices?.[i];
    if (!ch) return false;
    if (WORK_SUBS(scenes).has(g.scene) && (ch.check || gives(ch).length)) return false;
    if (typeof ch.to === 'string' && (isTimeless(ch.to) || ch.to === 'yuki_form')) return false;
    if (typeof ch.to === 'function' && /yuki_form|meridians/.test(String(ch.to))) return false;
    return !/^Back\b/.test(String(label));
}

setFamiliar((g, scenes, index, label) => showPicked(g, scenes, index, label)); // v0.11.37 (F1): the sepia choices are the familiar ones

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
/** v0.10.0: rest and sleep happen at once (no bar; the clock still moves). */
export const instantChoice = (c) => !!c && !c.combat && !c.check && !c.qi && (c.instant === true || typeof c.text === 'string'
    && (/^(Rest|Sleep|Call it a day)\b/.test(c.text) || EAT_NOW.test(c.text) || /^(Get wet\. Sleep|Make camp and sleep|Go back to sleep|Just sleep|Let her sleep|Bandage it\. Sleep|Leave (a|the) thread on watch|Thank her for dinner and sleep|Limp back to camp and sleep)/.test(c.text)));
/** v0.11.37 (owner 13:08, C2): eating and a quick herb happen at once too (the clock still moves). */
const EAT_NOW = /^(Eat (something|it raw|at the communal pot)|Cook and eat|Chew a ghost-gill)\b/;
/**
 * v0.10.2: a story choice that only waits for a time of day (no check, Qi, fight or time of its own; its `do` or the
 * next scene's `enter` sets the clock) plays at once in task mode — the clock jumps, no bar. `mins` = its dry run.
 */
const SETS_CLOCK = /g\.minutes\s*=[^=]|toHour\(/;
export function waitChoice(scenes, c, mins = 60, from = null) {
    if (c?.instant === true && !c.combat && !c.check && !c.qi) return true; // v0.11.37: marked by hand (the Long Forest's exits: a wrapper hides their clock)
    if (!c || c.combat || c.check || c.qi || c.time != null || mins < 60 || (from && c.to === from)) return false; // a choice back to its own scene is an action, not a wait
    if (c.do && SETS_CLOCK.test(String(c.do))) return true;
    const to = typeof c.to === 'string' ? scenes[c.to] : null;
    return !!(to?.enter && SETS_CLOCK.test(String(to.enter)));
}
export function isInstantTask(g, scenes, id) {
    if (id === MER_TASK || id === BT_TASK || id === SIT_TASK || id === QI_TASK || lineOfTask(id)) return false;
    const p = parse(id);
    return instantChoice(scenes[p.scene]?.choices?.[p.index]);
}

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
        const doneToday = m.daily && !daily(m.daily)(g);
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
 * v0.11.37 (owner 14:17, pick D-a): from 02:00 a task screen offers only the night: eating stays (its story stops, the
 * evening exits, show as before); any other card that would end past 02:00 is 'late' (shown locked; the queue skips
 * it). The breakthrough is exempt (it is rest). `only`: check just that card (taskOpen, the forecast's rows).
 */
const NIGHT_OK = /^(Eat|Cook and eat|Chew a ghost-gill)\b/;
const isNightOk = (c) => c.kind === 'chore' && NIGHT_OK.test(String(c.label));
const isSitChore = (c, hubId) => c.to === hubId && /^(Cultivate|Condense)/.test(String(typeof c.text === 'function' ? '' : c.text)) && /condense\(g\)/.test(String(c.do));
function nightCards(g, scenes, cards, only) {
    if (nightLock(g)) return cards.filter(isNightOk);
    for (const c of cards) {
        if (c.status !== 'open' || c.kind === 'bt' || isNightOk(c) || (only && c.id !== only)) continue; // eating is open at night anyway (Fable review)
        if (!endsLate(g, 4 * (c.minutes || 0) + 120)) continue; // cheap bound first (work ×2 new ×2 Exhaustion; a sit or a rest inside a chore ≤ 2 h)
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
    if (sitOpen(g, scenes)) cards.push({ id: SIT_TASK, kind: 'sit', group: 'Meditate', label: 'Cultivate: one sit', tag: `${CONDENSE_SIT_COST} Qi`, minutes: exMins(g, sitMinutes(g)), status: 'open', tier: 0, fam: 0, next: null });
    if (qiOpen(g, scenes)) cards.push({ id: QI_TASK, kind: 'qi', group: 'Meditate', label: 'Meditate: gather Qi', tag: 'an hour, resting', minutes: QI_MINUTES, status: 'open', tier: 0, fam: 0, next: null }); // v0.11.46 (Q1)
    if (btOpen(g)) cards.push({ id: BT_TASK, kind: 'bt', group: 'Meditate', label: `Break through to ${realmName(g.james.realm + 1)}`, tag: `${btMinutes(g)} min`, minutes: btMinutes(g), status: 'open', tier: 0, fam: 0, next: null });
    return cards;
}

export const taskOpen = (g, scenes, id) => (id === MER_TASK ? !!TASK_HUBS[g.scene] && merChoice(g, scenes) >= 0 && !nightLock(g) : taskCards(g, scenes, id).some((c) => c.id === id && c.status === 'open')); // v0.11.13: an old queue's mer:next still runs
export const taskLabel = (g, scenes, id) => { if (id === MER_TASK) return 'Next meridian session'; if (lineOfTask(id)) return lineName(g, lineOfTask(id)).replace(/\.$/, ''); if (id === BT_TASK) return 'Break through'; if (id === SIT_TASK) return 'Cultivate: one sit'; if (id === QI_TASK) return 'Meditate: gather Qi'; const p = parse(id); const c = scenes[p.scene]?.choices?.[p.index]; return c ? asText(c.text, g) : id; };

/** HP 0 during a task (v0.9.4): the Coil ends. The queue is gone; the Coil screen decides what happens next. */
function collapse(g, scenes, hubId) {
    st(g).queue.length = 0;
    endCoil(g, 'collapse');
    return ['Your knees make the decision for you. You fold up where you stand, and the last thing you see is Yuki\'s face, very close, very unimpressed. The queue is gone.',
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
        if (c.xp !== false) lines.push(...awardXp(g, c.check.skill, c.check.band || 'standard', { fail: band === 'fail', factor: band === 'partial' ? ratio : 1 }));
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
        lines.push(...(band === 'partial' ? out.filter((l) => !/^\+\d/.test(l)) : out)); // a partial lists only what it keeps
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
        if (a < ADAPT_MAX) { t.adapt[id] = Math.min(ADAPT_MAX, a + ADAPT_STEP); lines.push(`You see what went wrong. (Intuitive Aptitude: +${ADAPT_STEP} on this next time.)`); }
    }
    learn(g, scenes, hubId, card, id, band === 'fail' ? 0.5 : 1);
    const dest = band === 'fail' ? (c.fail ?? c.to) : c.to;
    lines.push(...goTo(g, scenes, typeof dest === 'function' ? dest(g) : dest));
    if (card.menu && g.scene === card.menu) lines.push(...goTo(g, scenes, hubId));
    g.log.push({ at: g.minutes, scene: g.scene, lines: lines.slice(0, 12) });
    if (g.log.length > 200) g.log.shift();
    return lines;
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
        const ratio = skillCheck(g.yuki.fight) / job.dc;
        const n = ratio >= 2 ? job.n * 2 : ratio >= 1 ? job.n : ratio >= 0.5 ? Math.floor(job.n * ratio + 0.5) : 0;
        if (n > 0) { addItem(g, job.item, n); lines.push(`${job.got(n)} +${n} ${itemNames[job.item]?.name || job.item}.`, ...awardYukiFightXp(g, 'challenging')); } else lines.push(job.none);
        takeCapNotes();
        st(g).fam[job.id] = r1(f + (n > 0 ? 1 : 0.5));
    }
    return lines;
}

/** Yuki's job on this hub, for the screen: { label, on, progress, len, fam, tier } or null. */
export function yukiLane(g) {
    const job = TASK_HUBS[g.scene]?.yuki;
    if (!job) return null;
    const y = st(g).yuki;
    const f = st(g).fam[job.id] || 0;
    return { label: job.label, on: !!y.on, progress: y.progress || 0, len: Math.round((job.minutes * NEW_LENGTH) / yukiSpeed(f)), fam: f, tier: famTier(f), dc: job.dc, check: r1(skillCheck(g.yuki.fight)) };
}
export function setYuki(g, on) { st(g).yuki.on = !!on; }

/**
 * Run card `id` now (its bar has finished). Returns { lines, fail, stopped }: `stopped` means the story
 * left the hub (a door, a fail scene, a collapse), so the queue must wait.
 */
export function runTask(g, scenes, id) {
    const hubId = g.scene;
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
        lines.push(r.ok ? `Condensed: Saturation ${r.saturation}%.` : 'Not enough Qi to sit.');
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
        const take = (index) => { const r = choose(g, scenes, index, { task: true }); lines.push(...r.lines); if (r.roll && !r.roll.success) fail = true; if (r.combat) throw new Error(`A task can't start a fight (${id})`); };
        if (card.menu) take(card.entryIndex);
        if (!card.menu || g.scene === card.menu) take(card.p.index);
        if (card.kind === 'chore' || card.kind === 'door') learn(g, scenes, hubId, card, id, 1);
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
    const { log, coil, picked, ...rest } = g; // v0.11.32: picked choices change nothing a dry run measures; a copy starts its own
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
        return (card.entry?.time || 0) + (card.c.time || 0) + (to ? defaultMinutes(scenes, from, card.c, to, movesPlace(c, scenes, from, to)) : 0);
    }
    runTask(c, scenes, id);
    return Math.max(0, c.minutes - m0);
}

/**
 * The queue played out on a copy: per row its finish time (or `skip` if it won't be available then),
 * the first minute Fed reaches 0 (`fedOut`), and Fed at the end. Rows after the story leaves the hub are `wait`.
 */
export function outlook(g, scenes) {
    const c = clone(g);
    const rows = [];
    let fedOut = null;
    let left = false;
    let death = null;
    let night = false;
    for (const id of st(g).queue) {
        if (death) { rows.push({ id, dead: true }); continue; }
        if (left) { rows.push({ id, wait: true }); continue; }
        if (night) { rows.push({ id, night: true }); continue; }
        if (!runsHere(c, scenes, id)) { left = true; rows.push({ id, wait: true }); continue; } // v0.11.14: a row for another screen waits
        if (dayOver(c, scenes, id)) { night = true; rows.push({ id, night: true }); continue; } // v0.11.37 (D-a): the queue stops at the day's end and waits for the morning
        if (!taskOpen(c, scenes, id)) { rows.push({ id, skip: true }); continue; }
        const before = c.minutes;
        const r = runTask(c, scenes, id);
        if (fedOut === null && c.james.satiety <= 0) fedOut = c.minutes;
        const row = { id, start: before, end: c.minutes, door: !!r.stopped, fed: c.james.satiety, hp: c.james.hp };
        if (c.scene === 'coil_end') { // HP hit 0 on this row: the Coil would end here
            row.death = c.james.satiety <= 0 ? 'hunger' : 'injury';
            death = { at: c.minutes, cause: row.death, row: rows.length, id };
        }
        rows.push(row);
        if (r.stopped) left = true;
    }
    return { rows, fedOut, fedEnd: c.james.satiety, end: c.minutes, start: g.minutes, death };
}

/** v0.11.37 (D-a): queue row `id` can't run because the day is over (02:00 passed, or it would end past 02:00): the queue waits, nothing is skipped. */
export const dayOver = (g, scenes, id) => (nightLock(g) ? !taskCards(g, scenes, id).some((x) => x.id === id && x.status === 'open') : taskCards(g, scenes, id).some((x) => x.id === id && x.status === 'late')); // at night a queued meal still runs (Fable review)

/* ---------- the queue, edited (v0.10.0; pure: the screen calls these) ---------- */
/** Run `id` now: it goes to the front (the card that was running moves to second place). */
export function queueRunNow(g, id) { const q = st(g).queue; if (q.length >= QUEUE_MAX) return false; q.unshift(id); return true; }
/** Add `id` to the end. */
export function queueAdd(g, id) { const q = st(g).queue; if (q.length >= QUEUE_MAX) return false; q.push(id); return true; }
/** Move row k up (dir −1) or down (+1). */
export function queueMove(g, k, dir) { const q = st(g).queue; const j = k + dir; if (k < 0 || j < 0 || k >= q.length || j >= q.length) return false; [q[k], q[j]] = [q[j], q[k]]; return true; }
/** Clear the queue; keepHead keeps the row in progress. */
export function queueClear(g, keepHead) { const q = st(g).queue; q.splice(keepHead && q.length ? 1 : 0); }
