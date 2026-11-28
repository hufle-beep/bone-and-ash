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
import { fnv1a, gainAt, NIGHT_TO, d8, itemCap, yukiForm, advance, clockParts, actingCheck, actingName, awardXp, awardYukiFightXp, spendQi, setLootMult, takeCapNotes, takeSpoilNotes, itemNames, addItem, canBreakThrough, btMinutes, realmName, condense, sitMinutes, useSpeed, USE_N, USE_CAP, nightLock, endsLate, sitUseless, jamesQiMax, SATIETY_PER_HOUR, breakAt, coilMult, fmtMult, YUKI_HELD_TEXT } from './game.js';
import { CONDENSE_SIT_COST } from './formulas.js';
import { btTarget, MER_LINES, lineWindow, lineIndex, lineName } from '../story/meridians.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { onceOpen, noteOnce, stageOpen, ONCE_MENUS, EVENING_HOUR } from '../story/oneoff.js';
import { daily, foodCount, eatBest, FOOD, stayOf, haulMult } from '../story/common.js'; // v0.11.221 (RV2, HF): haulMult
import { potCookDue } from '../story/kitchen.js'; // v0.11.217 (owner pick PC1, CG)
import { storyDay, calStart, calEnd, atStoryDay, LONG_CAL, STAY_DAYS, tributeLeft } from './calendar.js'; // v0.11.203 (owner pick T1, TS1): the long calendar; v0.11.204 (W1): the week
import { endCoil } from './coil.js';
import { canMeditate } from './meditate.js';
import { keepReplies } from './replies.js'; // v0.11.69 (P1)
import { threadTick } from './threads.js'; // v0.11.286 (owner picks G4-A, TQ-A, WR-a, HP-n): the threads' lanes

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
/** v0.11.283 (owner pick P51-A, MT-d): a work menu's own text was never drawn on a task screen (the card goes to its menu and
 *  straight back). Now it comes with the first card from that menu, above the card's own lines, once a Coil per text: a world
 *  flag `mt:<menu>#<hash of its first sentence>` (reset with the Coil, as every flag outside KEEP_FLAGS). A text whose opening
 *  changes (the council's three days, the palisade's stages) is a new text; one whose later sentences change with the state (the
 *  pantry, the militia) is not. A door menu's (the Wilds' Explore) is not drawn (RV-A, M2-x). The tests switch it off. */
export const MT = { on: true };
export const menuFirst = (t) => String(t || '').trim().split(/(?<=[.!?])["*]*\s+/)[0];
export const menuTextKey = (menu, t) => `mt:${menu}#${fnv1a(menuFirst(t))}`;
export function menuText(g, scenes, menu) {
    if (!MT.on || !menu) return [];
    const t = String(asText(scenes[menu]?.text, g) || '').trim();
    if (!t) return [];
    const k = menuTextKey(menu, t);
    if (g.flags[k]) return [];
    g.flags[k] = true;
    return [t];
}
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
/** v0.11.225 (owner pick LO2, SN): a card's familiarity fields ({ tier, fam, next }) by its id, as taskCards gives them. */
export const famOf = (g, id) => { const f = Number(g.tasks?.fam?.[id]) || 0; return { tier: famTier(f), fam: f, next: nextAt(f) }; };
/** v0.11.155 (FD1, NX): a work or door card's familiarity line names the next step ("Practised · 5/8 to Skilled"); "Mastered" at the top.
 * RV1 (NB): non-breaking spaces keep "5/8 to Skilled" whole, so a narrow card wraps only after a "·" (a 390 px phone: 4 of 4 mid-phrase breaks → 0). */
export const famLine = (card) => (card.next != null ? `${FAM[card.tier].name}\u00a0· ${card.fam}/${card.next}\u00a0to\u00a0${FAM[card.tier + 1].name}` : FAM[card.tier].name);
/** v0.11.290 (owner pick P58-A, MT-j): the Mastery list's places (UI words), by task hub; hubs with the same place share a heading. */
export const MASTERY_PLACES = { camp: 'The Blackroot (prologue)', stream: 'The Blackroot (prologue)', wilds: 'The Blackroot (prologue)', village: 'Ashfall (prologue)', ashfall: 'Ashfall (prologue)', fo_ashfall: 'Ashfall, the Fallout', rr_hub: 'The Root Road', dw_hub: 'The Drowned Wood', ah_hub: 'The Ashen Hills', heart_hub: 'Inside the Old Tree', rt_camp: 'The Last Camp', rt_ashfall: 'Ashfall, the last day', lf_hub: 'The Long Forest' };
/** MT-j: every work and door card James knows (any familiarity, his own runs or a share from its group or a drill; the cards whose face
 *  shows famLine), by place in the hubs' order: [{ place, rows: [{ id, label, group, tier, fam, next, line, toNext }], tiers: [New,
 *  Practised, Skilled, Mastered] }]. A menu several hubs share (the Blackroot camps' Practice) is listed under the first. RV-A (M1-f):
 *  a menu's cards pass the screen's own filters (taskCards): a door menu's doors that lead off the hub, a work menu's cards with work
 *  in them, never the hub's `notJames` (Yuki's own hunt). Yuki's practice (`yuki:<hub>`) and the Meditate cards are not cards here. */
export function masteryView(g, scenes) {
    const fam = g?.tasks?.fam && typeof g.tasks.fam === 'object' ? g.tasks.fam : {};
    const byPlace = new Map();
    const done = new Set();
    for (const [hubId, cfg] of Object.entries(TASK_HUBS)) {
        const sceneIds = [hubId, ...Object.keys(cfg.menus || {}), ...Object.keys(cfg.doorMenus || {})];
        for (const sc of sceneIds) {
            (scenes[sc]?.choices || []).forEach((c, i) => {
                const id = `${sc}:${i}`;
                const f = Number(fam[id]) || 0;
                if (!(f > 0) || done.has(id)) return;
                const card = cardOf(scenes, hubId, id);
                if (!card || (card.kind !== 'work' && card.kind !== 'door')) return;
                if (card.menu) { // RV-A (M1-f): as taskCards draws a menu's cards
                    if (card.kind === 'door' ? (typeof c.to !== 'string' || c.to === hubId) : !hasWork(c)) return;
                    if (cfg.notJames && cfg.notJames(c)) return;
                }
                done.add(id);
                const place = MASTERY_PLACES[hubId] || hubId;
                if (!byPlace.has(place)) byPlace.set(place, []);
                const row = { id, label: String(asText(c.text, g)).replace(/\.$/, ''), group: card.group, tier: famTier(f), fam: f, next: nextAt(f) };
                row.line = famLine(row);
                row.toNext = row.next != null ? `${f}/${row.next} to ${FAM[row.tier + 1].name}` : '';
                byPlace.get(place).push(row);
            });
        }
    }
    return [...byPlace].map(([place, rows]) => ({ place, rows, tiers: FAM.map((_, t) => rows.filter((r) => r.tier === t).length) }));
}
/** MT-j: the Mastery list's words (UI, Claude's). `tiers`: counts by FAM tier → "3 Practised · 8 Skilled" (zeros left out). */
export const MASTERY_TEXT = {
    head: 'Mastery',
    lede: `Every card James knows, by place, and how well. Familiarity is kept across Coils, and some of it comes from the other cards in a group and from drills: ${FAM[1].name} at ${FAM[1].at} completions, ${FAM[2].name} at ${FAM[2].at}, ${FAM[3].name} at ${FAM[3].at}; each step makes a card faster and easier (the FAQ: Work cards and familiarity).`,
    tiers: (counts) => FAM.map((t, i) => (counts[i] ? `${counts[i]} ${t.name}` : '')).filter(Boolean).join(' · '),
    total: (n, counts) => `${n} card${n === 1 ? '' : 's'}: ${MASTERY_TEXT.tiers(counts)}.`,
};
/** MT-j (RV-A, TG2: pure, so the tests read it): the James tab's Mastery part from masteryView's places; '' with none. `esc`: the
 *  page's HTML escape. Each place folded, its tier counts under its name; each row the card's words, its step, its group and the count to the next. */
export function masteryHtml(v, esc) {
    if (!v || !v.length) return '';
    const M = MASTERY_TEXT, all = v.flatMap((p) => p.rows);
    const counts = FAM.map((_, t) => all.filter((r) => r.tier === t).length);
    const row = (r) => `<div class="row"><span>${esc(r.label)}</span><span>${esc(FAM[r.tier].name)}</span><span class="sub">${esc([r.group, r.toNext].filter(Boolean).join(' · '))}</span></div>`;
    return `<h2>${esc(M.head)}</h2><p class="note">${esc(M.lede)}</p><p class="note">${esc(M.total(all.length, counts))}</p>${v.map((p) => `<details class="memory-row mastery"><summary><span class="mem-head"><span>${esc(p.place)}</span><span class="sub">${esc(M.tiers(p.tiers))}</span></span></summary><div>${p.rows.map(row).join('')}</div></details>`).join('')}`;
}

/** v0.11.285 (owner pick G3-A, FE-t): a work card's next step and one run's time then ({ name, at, speed, now, then } in minutes), or
 *  null (not a work card, at the top, or no time). One run as `resolveWork` times it: (the menu's + the card's time) × NEW_LENGTH ÷ speed;
 *  the long calendar's ×7 is not in it. The hold tooltip says it (main.js tipFor); the card's face keeps famLine. */
export function famNext(card) {
    if (!card || card.kind !== 'work' || card.next == null) return null;
    const base = (card.minutes || 0) * NEW_LENGTH;
    if (!base) return null;
    const speed = cardSpeed(card.next);
    return { name: FAM[card.tier + 1].name, at: card.next, speed, now: Math.round(base / cardSpeed(card.fam || 0)), then: Math.round(base / speed) };
}

/** v0.11.177 (owner picks P9A, RV1 C2; Fable's review C): a save resting inside a work menu whose never-drawn text P9A emptied would
 *  draw an empty screen (no live route leaves the player there; only an old save can). On load it is moved to that menu's hub, without
 *  running the hub's `enter`. A menu shared by several hubs (the Blackroot's Practice) goes to the hub its last "back" choice names. */
export function deadMenuHub(g, scenes) {
    const s = scenes[g?.scene];
    if (!s) return null;
    let text; try { text = typeof s.text === 'function' ? s.text(g) : s.text; } catch { return null; }
    if (text !== '') return null;
    const hubs = Object.entries(TASK_HUBS).filter(([, cfg]) => (cfg.menus || {})[g.scene] || (cfg.doorMenus || {})[g.scene]).map(([h]) => h);
    if (!hubs.length) return null;
    if (hubs.length === 1) return hubs[0];
    const back = [...(s.choices || [])].reverse().find((c) => c.to);
    let to; try { to = typeof back?.to === 'function' ? back.to(g) : back?.to; } catch { to = null; }
    return hubs.includes(to) ? to : hubs[0];
}
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
export function cardOf(scenes, hubId, id) {
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
            if (doneToday) { if (c.show?.away?.(g)) return; status = 'tomorrow'; } // v0.11.234 (P7-A, TL): her card stays hidden while she is away, here too
            else if (c.show && !c.show(g)) { if (c.show.dailyKey && !c.show.away?.(g) && (!c.form || hasForm(g, c.form))) status = 'tomorrow'; else return; } // v0.10.4: a form he can't sing yet stays hidden; v0.11.234 (P7-A, TL; v0.11.231 C L4): so does a card hidden for her absence (`away`), as the hub hides it
            else if (!choiceOpen(g, c)) return;
            push(`${menu}:${i}`, door ? 'door' : 'work', m.label, c, (entry.time || 0) + (c.time || 0), status);
            if (m.note) cards[cards.length - 1].groupNote = m.note(g) || ''; // v0.11.156 (DM1, TX-A): a note after the group's heading
        });
    }
    hub.choices.forEach((c, i) => {
        if (!choiceOpen(g, c)) return;
        if (sitUseless(g) && isSitChore(c, hubId)) return; // v0.11.37 (B2): a sit that changes nothing is not offered
        if (isDoor(cfg, c)) push(`${hubId}:${i}`, 'door', cfg.own, c, c.time || 0, 'open');
        else if (isChore(hubId, c)) { push(`${hubId}:${i}`, c.check && !cfg.plainChecks ? 'work' : 'chore', cfg.own, c, c.minutes ? c.minutes(g) : c.time || 0, 'open'); if (c.preserve) cards[cards.length - 1].pres = true; } // v0.11.209 (TF1, K): the card's own minutes
    });
    cards.push(...medTaskCards(g, scenes));
    weekCards(g, scenes, hubId, cards); // v0.11.204 (owner pick W1, S1): the long calendar's week
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
export const taskLabel = (g, scenes, id) => { if (isCarryTask(id)) return `Go on: ${carryHere(g, g.scene, id)?.label || 'the week\'s work'}`; if (id === MER_TASK) return 'Next meridian session'; if (lineOfTask(id)) return lineName(g, lineOfTask(id)).replace(/\.$/, ''); if (id === BT_TASK) return 'Break through'; if (id === SIT_TASK) return 'Cultivate: one sit'; if (id === QI_TASK) return 'Meditate: gather Qi'; const p = parse(id); const c = scenes[p.scene]?.choices?.[p.index]; return c ? asText(c.text, g) : id; };

/** HP 0 during a task (v0.9.4): the Coil ends; the Coil screen decides what happens next. */
function collapse(g, scenes, hubId) {
    st(g).queue.length = 0;
    endCoil(g, 'collapse');
    return ['Your knees make the decision for you. You fold up where you stand, and the last thing you see is Yuki\'s face, very close, very unimpressed.',
        ...goTo(g, scenes, 'coil_end')];
}

export function learn(g, scenes, hubId, card, id, gain) {
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
/** v0.11.221 (owner pick RV2, HF): the line under a spaced Forage or Hunt card's result: its items, ×3 (again.js reads it as a number line). */
export const HAUL_TEXT = 'Three days\' haul — in total:';

/** A work card, resolved without dice. Returns its lines; leaves the story wherever the choice leads. */
function resolveWork(g, scenes, hubId, card, id) {
    const { c } = card;
    const t = st(g);
    const lines = [];
    const tier = famTier(t.fam[id] || 0);
    if (card.entry?.do) lines.push(...(card.entry.do(g) || []));
    if (card.menu) lines.push(...goTo(g, scenes, card.menu), ...menuText(g, scenes, card.menu)); // MT-d
    if (c.qi && !spendQi(g, c.qi)) throw new Error('Not enough Qi');
    const once = Math.round((((card.entry?.time || 0) + (c.time || 0)) * NEW_LENGTH) / cardSpeed(t.fam[id] || 0));
    // v0.11.204 (owner pick W1, S1): on a stay of the long calendar a week's card is ×7 its time: today's share up to the evening,
    // the rest carried to the next mornings (the "Go on" card); v0.11.215 (owner pick CF1, RE): a card whose work goes on past today
    // brings its check, result, XP, loot and familiarity when the work is done (`workResult` from the "Go on" card), not at its start;
    // FP1 (owner pick, 20:58, FS): a card that gives food (the wilds' Forage and Hunt) still pays at its start (food late starved the
    // Cultivator: prologue Coil 1 deaths 2.5% → 15%); its work goes on with its own "Go on", already paid
    const total = weekCard(g, hubId, card) ? once * WEEK_MULT : once;
    const mins = total > once ? Math.min(total, workRoom(g, hubId)) : once;
    const food = foodCard(c);
    if (total > mins && !food) {
        carriesWrite(g)[id] = { id, hub: hubId, left: total - mins, total, label: String(asText(c.text, g)).replace(/\.$/, ''), coil: coilKey(g), paid: false, stay: stayOf(storyDay(g)), sd: storyDay(g) }; // RV1 (KS, MS): its stay and story day
        lines.push(...advance(g, mins, { work: true }));
        g.james.satiety = Math.max(0, g.james.satiety - (FED_EXTRA_PER_HOUR * mins) / 60);
        takeCapNotes();
        lines.push(`A week's work: ${hrs(total)} in all, ${hrs(total - mins)} still to go (Go on, from tomorrow morning; its result when it is done).`);
        if (card.menu && g.scene === card.menu) lines.push(...goTo(g, scenes, hubId));
        g.log.push({ at: g.minutes, scene: g.scene, lines: lines.slice(0, 12) });
        if (g.log.length > 200) g.log.shift();
        return lines;
    }
    if (total > mins) carriesWrite(g)[id] = { id, hub: hubId, left: total - mins, total, label: String(asText(c.text, g)).replace(/\.$/, ''), coil: coilKey(g), paid: true, ...(CF1.on ? { stay: stayOf(storyDay(g)) } : {}) }; // FP1 (FS); RV1 (KS)
    return workResult(g, scenes, hubId, card, id, { lines, mins, total, once, left: total > mins ? total - mins : 0 });
}
/** v0.11.215 (FP1, FS): a card whose result is food (an item of FOOD), paid at its start. */
export const foodCard = (c) => !CF1.on || (!!c && gives(c).some((i) => i in FOOD));
/** v0.11.215 (RV1, TG4): the tests switch CF1 off to run v0.11.214's rules (one carry, every card paid at its start, no stay rules). */
export const CF1 = { on: true };
/** v0.11.215 (owner pick CF1, RE): a work card's check, time (`mins`; 0 when the "Go on" card already took it), result, XP, loot,
 *  familiarity and way on. `lines` the lines so far (the card's own start, or none at the end of a week's work); `done` (the end of a
 *  week's work): the "A week's work" line is the "Go on" card's own. */
function workResult(g, scenes, hubId, card, id, { lines = [], mins = 0, total = 0, once = 0, done = false, left = 0, sd = null } = {}) {
    const asOn = (fn) => (sd != null ? atStoryDay(sd, fn) : fn()); // RV1 (MS): the result's texts and flags on the day its work started
    const { c } = card;
    const t = st(g);
    let band = 'full', ratio = 1;
    if (c.check) {
        const k = cardCheck(g, id, c);
        band = k.band; ratio = k.ratio;
        g.stats.checks += 1; if (band !== 'fail') g.stats.wins += 1;
        lines.push(`${k.skill} ${k.value} / DC ${k.dc} — ${BAND_TEXT[band]}`);
        if (c.xp !== false) lines.push(...awardXp(g, c.check.xpTo || c.check.skill, c.check.band || 'standard', { fail: band === 'fail', factor: band === 'partial' ? ratio : 1 }));
    }
    if (mins > 0) {
        lines.push(...advance(g, mins, { work: true }));
        g.james.satiety = Math.max(0, g.james.satiety - (FED_EXTRA_PER_HOUR * mins) / 60);
    }
    takeCapNotes();
    const items = gives(c).length > 0;
    const success = band === 'double' || band === 'full' || (band === 'partial' && items);
    const roll = { success, crit: band === 'double', ratio };
    if (card.menu && success) noteOnce(g, card.menu, Number(String(id).split(':').pop()), c); // v0.11.33: once per Coil; a failed try can be made again (owner 14:05)
    const hm = haulMult(g, id); // v0.11.221 (owner pick RV2, HF): a spaced Forage or Hunt card brings its 3 days' items
    const haul = (gained) => { if (hm > 1 && gained.length) lines.push(`${HAUL_TEXT} ${gained.map(([i, d]) => `+${d} ${itemNames[i]?.name || i}`).join(', ')}.`); };
    if (success && c.do) {
        const before = { ...g.inventory };
        if (band === 'double' || hm > 1) setLootMult((band === 'double' ? 2 : 1) * hm);
        let out = [];
        try { out = asOn(() => gainAt(String(id), () => c.do(g, roll))) || []; } finally { setLootMult(1); } // v0.11.249 (P19-A RV, GT1c): the gains keyed by the card
        lines.push(...(band === 'partial' ? keepReplies(out) : out)); // a partial lists only what it keeps; v0.11.69 (P1): its reply sentences stay
        const gained = Object.keys(g.inventory).map((i) => [i, (g.inventory[i] || 0) - (before[i] || 0)]).filter(([, d]) => d > 0);
        if (band === 'partial') {
            const kept = gained.map(([i, d]) => { const keep = Math.max(1, Math.floor(d * ratio)); if (keep < d) addItem(g, i, keep - d); return [i, keep]; }).filter(([, d]) => d > 0);
            lines.push(kept.length ? `A thin haul — you keep: ${kept.map(([i, d]) => `+${d} ${itemNames[i]?.name || i}`).join(', ')}.` : 'A thin haul — nothing worth keeping.');
        } else if (band === 'double' && gained.length) lines.push(`Double haul — in total: ${gained.map(([i, d]) => `+${d} ${itemNames[i]?.name || i}`).join(', ')}.`);
        else haul(gained);
    } else if (!success && c.failDo) {
        const hp0 = g.james.hp, before = { ...g.inventory };
        if (hm > 1) setLootMult(hm);
        let out = [];
        try { out = asOn(() => gainAt(String(id), () => c.failDo(g, roll))) || []; } finally { setLootMult(1); } // v0.11.249 (P19-A RV, GT1c)
        // a partial never hurts, so its text drops the sentences about HP
        lines.push(...(band === 'partial' ? out.map((l) => l.replace(/[^.!?]*−\d+(?:\.\d+)? HP[^.!?]*[.!?]?/g, '').trim()).filter(Boolean) : out));
        const lost = hp0 - g.james.hp;
        if (band === 'fail' && lost > 0) { g.james.hp -= lost; lines.push(`It goes in deeper than it should: another −${r1(lost)} HP.`); }
        if (band === 'partial' && lost > 0) g.james.hp = hp0; // a partial never hurts
        haul(Object.keys(g.inventory).map((i) => [i, (g.inventory[i] || 0) - (before[i] || 0)]).filter(([, d]) => d > 0)); // HF: a fail's items too
    }
    for (const i of new Set(takeCapNotes())) lines.push(`Hammerspace: ${itemNames[i]?.name || i} is full — the rest stays behind.`);
    if (total > once && !done) lines.push(left > 0 ? `A week's work: ${hrs(total)} in all, ${hrs(left)} still to go (Go on, from tomorrow morning).` : `A week's work: ${hrs(total)}, done.`); // v0.11.215: a carried card's end line is its Go on card's
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
/** v0.11.209 (owner pick TF1, Y): on the long calendar one haul in this many brings her food home (her XP and familiarity: every haul). */
export const YUKI_LONG_KEEP = 3;
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
        // v0.11.209 (owner pick TF1, Y): on the long calendar her food comes home from one haul in YUKI_LONG_KEEP (RV1, L3: the first of
        // each Coil, then the 4th, 7th, …); the others she comes back with nothing (her job's own line for an empty haul), her XP and
        // familiarity as for a haul. The d8 is rolled as before.
        if (n > 0) { y.cnt = (Number(y.cnt) || 0) + 1; if ((y.cnt - 1) % YUKI_LONG_KEEP) { lines.push(yukiSays(g, job.none), ...awardYukiFightXp(g, 'challenging')); takeCapNotes(); st(g).fam[job.id] = r1(f + 1); continue; } }
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
    const card = isCarryTask(id) ? { kind: 'carry' } : cardOf(scenes, hubId, id);
    if (!card) throw new Error(`No card ${id} on ${hubId}`);
    const m0 = g.minutes;
    const lines = [];
    let fail = false, pre0 = 0; // v0.11.214 (RD1, RU): how many of the lines are the day's routine (the plan's read check leaves them out)
    // v0.11.204 (W1, S1): a week's work left behind; v0.11.215 (RV1, KS): only once its stay or Coil is over (the camp and the village
    // between keep it); DL: an unpaid one says so (these lines go before the card, counted with the routine's in `pre`)
    const dropped = [];
    if (TASK_HUBS[hubId] && card.kind !== 'carry' && Object.values(carriesRead(g)).some((cy) => !carryAlive(g, cy, hubId))) {
        const cs = carriesWrite(g);
        for (const k of Object.keys(cs)) if (!carryAlive(g, cs[k], hubId)) { if (CF1.on && !cs[k].paid) dropped.push(`${cs[k].label}: left unfinished when the stay ended; nothing comes of it.`); delete cs[k]; }
    }
    lines.push(...dropped);
    if (!routineBusy) { // v0.11.204 (owner pick W1, R1 + R2): the day's meals and sit, long calendar only
        const pre = dayRoutine(g, scenes, hubId, card.kind, id);
        lines.push(...pre); pre0 = dropped.length + pre.length;
        // RV1 (H1, L2; the Opus review): the routine took the time the card needed (a "Go on" past the evening hour too): not run, said so
        if (pre.length && g.scene === hubId && (card.kind === 'carry' ? workRoom(g, hubId) <= 0 : !taskOpen(g, scenes, id))) { lines.push(SKIP_LINE, ...takeSpoilNotes(g)); return { lines, fail: false, stopped: false, skipped: true }; }
        if (pre.length && g.scene !== hubId) { lines.push(...takeSpoilNotes(g)); return { lines, fail: false, stopped: true, skipped: true }; }
    }
    const slot0 = routineHub(g, hubId) && mealCard(scenes, hubId, id) ? mealSlot(g) : null; // RV1 (L1, L2); P52-A (BP-d): a camp's plan too
    const mY = g.minutes; // RV1 (M1): Yuki's lane counts from here; the day's sit ticked her for its own minutes
    if (card.kind === 'carry') {
        const found = carryHere(g, hubId, id);
        if (!found) throw new Error('No week\'s work to go on with');
        const cy = carriesWrite(g)[found.id];
        const now = Math.min(cy.left, workRoom(g, hubId));
        if (now <= 0) throw new Error('The day\'s work is over');
        lines.push(...advance(g, now, { work: true }));
        g.james.satiety = Math.max(0, g.james.satiety - (FED_EXTRA_PER_HOUR * now) / 60);
        cy.left -= now;
        lines.push(cy.left > 0 ? `${cy.label}: ${hrs(now)} more, ${hrs(cy.left)} still to go.` : `${cy.label}: done, ${hrs(cy.total)} in all.`);
        if (cy.left <= 0) {
            delete carriesWrite(g)[cy.id];
            const wc = !cy.paid ? cardOf(scenes, hubId, cy.id) : null; // v0.11.215 (CF1, RE): its result now
            if (wc?.c) {
                const before = g.stats.wins, checks = g.stats.checks;
                lines.push(...workResult(g, scenes, hubId, wc, cy.id, { done: true, sd: CF1.on ? cy.sd ?? null : null }));
                fail = g.stats.checks > checks && g.stats.wins === before;
            }
        }
    } else if (card.kind === 'bt') {
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
        if (card.menu) take(card.entryIndex); // v0.11.283 (owner pick RV-A, M2-x): a door menu's text stays undrawn (its reply would sit under the scene it opens)
        if (!card.menu || g.scene === card.menu) take(card.p.index);
        if (card.kind === 'chore' || card.kind === 'door') learn(g, scenes, hubId, card, id, 1);
        if (card.kind === 'door' && g.scene !== hubId) st(g).door = { id, speed }; // v0.11.141 (FX1, DI): the scenes behind it run at its speed (story.js)
    }
    if (PT1.on && slot0 && !fail) dayMeal(g, hubId, null, true, '', slot0); // RV1 (L1, L2): the eat card tapped is this part of the day's meal, now it ran
    lines.push(...yukiTick(g, hubId, g.minutes - mY));
    lines.push(...threadTick(g, scenes, hubId, g.minutes - mY)); // v0.11.286 (G4-A, TH-l): the threads on the same time, after hers
    lines.push(...takeSpoilNotes(g)); // v0.11.209 (RV1, H1 + M1): the food that turned while the card took its time (a sit, a meridian, the routine)
    let stopped = g.scene !== hubId;
    if (!stopped && g.james.hp <= 0) { lines.push(...collapse(g, scenes, hubId)); stopped = true; }
    return { lines, fail, stopped, pre: pre0 };
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
        // v0.11.225 (owner pick LO2, FD): the day's routine before it (the meal, the day's sit) is part of its time, as a work card's dry run
        let pre = 0;
        if (!routineBusy) { try { const r0 = clone(g), m0 = r0.minutes; dayRoutine(r0, scenes, r0.scene, 'door', id); pre = Math.max(0, r0.minutes - m0); } catch { pre = 0; } }
        let minutes = pre + taskMinutes(g, scenes, id);
        let death = null, deathAt = null;
        // v0.11.225 (RV1, M1): a door the routine closes (no time left after the day's sit) shows the routine's time alone, as the tap does
        let skipped = false;
        try { const m0 = c.minutes; const r = runTask(c, scenes, id); if (r?.skipped) { minutes = Math.max(0, c.minutes - m0); skipped = true; } death = outcomeOf(c, c.minutes).death; if (death) deathAt = c.minutes; } catch { death = null; }
        // v0.11.253 (P23 review, L2): a door the routine closes ends after the meal and sit, so its Fed and HP are those after them (the tap's)
        return { minutes, end: g.minutes + minutes, fed: skipped ? c.james.satiety : g.james.satiety, hp: skipped ? c.james.hp : g.james.hp, death, ...(death ? { deathAt } : {}) }; // the card shows the walk's end; the warning the death's clock (the review, R1)
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
/** v0.11.283 (owner pick P51-A, SU-n): on a task hub the screen's own Cultivate closes in the evening (Ashfall and the Fallout 19:00,
 *  the Heart 18:00, the Long Forest 20:00): "Cultivate until the limit" now names that hour instead of "then it stops". `end` is the
 *  game minute the sits end (the plan's start + its minutes). */
export const SIT_EVENING_TEXT = 'until the evening, {hh}';
export function sitStopText(stop, { hub = null, end = null } = {}) {
    if (stop === 'shut' && hub && TASK_HUBS[hub] && end != null) {
        const p = clockParts(end);
        return SIT_EVENING_TEXT.replace('{hh}', `${String(p.hh).padStart(2, '0')}:${String(p.mm).padStart(2, '0')}`);
    }
    return SIT_STOP_TEXT[stop] || 'then it stops';
}

/* ---------- v0.11.204 (owner pick W1; roadmap-time.md TS2 + TS3): the week, long calendar only ---------- */
/**
 * On a stay of the long calendar (`weekHub`: the wilds, the village, Ashfall's Fallout and the Heart, on a story day that is a stay):
 *  - S1: a week's card (a work card of the hub's own menus: Forage, Hunt, Practice, Clinic, Workshop, Militia, Palisade, Council) takes
 *    ×7 its time. Today's share runs up to the hub's evening hour (`EVENING_HOUR`); the rest is carried (`g.tasks.carry`) and goes on
 *    with the "Go on" card the next mornings; while it is open the other week's cards are busy. Its result, XP, loot and familiarity
 *    come once, at the start, as before. Leaving the stay drops what is left. Journeys and every other card: unchanged.
 *  - R1: the meals run themselves: at the first card in each of three parts of the day (before 11:00, 11:00–14:59, from 15:00), the
 *    best food in the hammerspace when Fed is under ROUTINE_FED (the eat cards stay).
 *  - R2: the day's sit runs itself at the first card of the day, when Qi ≥ 10 and a sit is open (the Meditate cards stay).
 * The week planner and the quiet nights are in week.js. New save fields (all in `g.tasks`, dropped by every rewind): `carry`, `routine`,
 * and week.js's `plan` and `nf`. Saves without them play as before.
 */
export const WEEK_MULT = LONG_CAL;
export const WEEK_HUBS = new Set(['wilds', 'ashfall', 'fo_ashfall', 'heart_hub']);
export const ROUTINE_FED = 85;
export const CARRY_TASK = 'week:carry';
/** RV1 (L2): a card the day's meal and sit left no time for. */
export const SKIP_LINE = 'The day\'s meal and sit came first: no time left for this today.';
const hrs = (m) => { m = Math.round(m); return m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`; };
const coilKey = (g) => `${g.coil?.n || 1}|${g.coil?.act || 0}`;
/** Is this hub a stay of the long calendar right now? */
export const weekHub = (g, hubId = g.scene) => WEEK_HUBS.has(hubId) && STAY_DAYS.has(storyDay(g));
/* v0.11.284 (owner pick P52-A, BP-d, 2026-11-26 23:40): the Blackroot's three camps get a plan by the day (week.js). Their cards are
 * not week's cards (no ×7, no carry); the day's routine (R1 meals, R2 the sit) runs there only while that plan runs (`CAMP_RUN.on`,
 * set by week.js runWeek), so a card tapped by hand at a camp plays exactly as before. */
export const CAMP_HUBS = new Set(['rr_hub', 'dw_hub', 'ah_hub']);
export const CAMP_RUN = { on: false };
/** Does the day's routine run on this hub now: a stay, or a camp while its plan runs. */
const routineHub = (g, hubId) => weekHub(g, hubId) || (CAMP_RUN.on && CAMP_HUBS.has(hubId));
/** Is this card a week's card here (S1)? */
export const weekCard = (g, hubId, card) => !!card && card.kind === 'work' && !!card.menu && !!TASK_HUBS[hubId]?.menus?.[card.menu] && weekHub(g, hubId);
/** The waking day (the night to 05:00 belongs to the day before; 04:00 until v0.11.263, P31-A K2). */
export const workDay = (g) => Math.floor(((g.minutes || 0) - NIGHT_TO * 60) / 1440);
/** Minutes left today for a week's work: to the hub's evening hour. */
export const workRoom = (g, hubId = g.scene) => Math.max(0, workDay(g) * 1440 + (EVENING_HOUR[hubId] ?? 16) * 60 - g.minutes);
/* ---------- v0.11.215 (owner pick CF1: UB + RE + BL, 2026-11-17 20:31; his report 20:24 "a serious bug. actions take more than a day.
 * I cannot take them at all.", 20:28 "it was all over from the beginning of ashfall", with his Day 64 save) ----------
 * UB: every week's card keeps its own work left (`g.tasks.carries`: card id → { id, hub, left, total, label, coil, paid }), each with
 * its own "Go on" card (`week:carry:<card id>`); no card waits behind another's work (before: one `g.tasks.carry` made every other
 * week's card "busy" until it was done: the owner's Fallout, 20 days behind "Sing a full stretch of the line"). RE: a card whose work
 * goes on past today brings its result when the work is done (`paid: false`), so starting every card at once brings nothing early.
 * BL: a card with its own work going on says how long is left. An old save's single `carry` (paid at its start) is read as one of
 * them (`paid: true`), and moved into `carries` by the first card that changes them. Dropped by every rewind, as before. */
/** A carried card's "Go on" id; the bare CARRY_TASK (an old save's queue) is the first one here. */
export const carryTaskId = (cardId) => `${CARRY_TASK}:${cardId}`;
export const isCarryTask = (id) => typeof id === 'string' && (id === CARRY_TASK || id.startsWith(`${CARRY_TASK}:`));
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
/** The carried work (card id → record), read only: an old save's `carry` included as paid. */
export function carriesRead(g) {
    const t = g?.tasks, out = isObj(t?.carries) ? { ...t.carries } : {};
    if (isObj(t?.carry) && t.carry.id && !out[t.carry.id]) out[t.carry.id] = { ...t.carry, paid: true };
    return out;
}
/** The carried work to change: an old save's `carry` moved in first. */
function carriesWrite(g) {
    const t = st(g);
    if (!isObj(t.carries)) t.carries = {};
    if (isObj(t.carry)) { if (t.carry.id && !t.carries[t.carry.id]) t.carries[t.carry.id] = { ...t.carry, paid: true }; delete t.carry; }
    return t.carries;
}
const carryOk = (g, cy, hubId) => isObj(cy) && cy.hub === hubId && cy.left > 0 && cy.coil === coilKey(g) && weekHub(g, hubId) && (!CF1.on || cy.stay == null || cy.stay === stayOf(storyDay(g)));
/** v0.11.215 (owner pick RV1, KS): a carried work lives through its stay (the camp, the village between) and its Coil; an old save's (no stay) as before. */
const carryAlive = (g, cy, hubId) => (CF1.on && isObj(cy) && cy.stay != null ? cy.left > 0 && cy.coil === coilKey(g) && cy.stay === stayOf(storyDay(g)) : carryOk(g, cy, hubId));
/** v0.11.215 (RV1, SG): the stays' last story days; the work minutes left in this stay (today's to the evening, then each later day's from 07:00). */
const STAY_LAST = { 1: 3, 2: 6, 3: 10, 4: 18 };
export function stayRoom(g, hubId = g.scene) {
    const s = stayOf(storyDay(g));
    if (!s) return 0;
    const lastWake = calEnd(g, STAY_LAST[s]) - 1, day = ((EVENING_HOUR[hubId] ?? 16) - 7) * 60;
    return workRoom(g, hubId) + Math.max(0, lastWake - workDay(g)) * day;
}
/** A work card's time once (its old-calendar length, familiarity in). */
const onceOf = (g, card, id) => Math.round((((card?.entry?.time || 0) + (card?.c?.time || 0)) * NEW_LENGTH) / cardSpeed(st(g).fam[id] || 0));
/** The week's work carried on this hub (oldest first). */
export const carriesHere = (g, hubId = g.scene) => Object.values(carriesRead(g)).filter((cy) => carryOk(g, cy, hubId));
/** The carried work of `id` here (a card id or a "Go on" id; the bare CARRY_TASK the first), or null. */
export function carryHere(g, hubId = g.scene, id = null) {
    const all = carriesHere(g, hubId);
    if (id == null || id === CARRY_TASK) return all[0] || null;
    const k = String(id).startsWith(`${CARRY_TASK}:`) ? String(id).slice(CARRY_TASK.length + 1) : id;
    return all.find((cy) => cy.id === k) || null;
}
/** taskCards' part: a week's card with its own work going on (busy), the cards over for the day, and a "Go on" card for each work. */
function weekCards(g, scenes, hubId, cards) {
    if (CAMP_HUBS.has(hubId)) { // P52-A (BP-d): a camp's own menus' work cards are its plan's card rows (`day`), by the day
        for (const c of cards) { if (c.kind !== 'work') continue; const card = cardOf(scenes, hubId, c.id); if (card?.menu && TASK_HUBS[hubId]?.menus?.[card.menu]) c.day = true; }
        return;
    }
    if (!weekHub(g, hubId)) return;
    const here = carriesHere(g, hubId), room = workRoom(g, hubId), mine = new Map(here.map((cy) => [cy.id, cy]));
    let left = null; // RV1 (SG): the stay's work minutes left, once
    for (const c of cards) {
        const card = cardOf(scenes, hubId, c.id);
        if (c.kind !== 'work' || !weekCard(g, hubId, card)) continue;
        c.week = true; // RV1 (L6): a card done for today stays on the plan's list
        if (c.status !== 'open') continue;
        if (!CF1.on) { if (here.length) { c.status = 'busy'; c.busy = here[0].label; } else if (room < 30) c.status = 'evening'; continue; } // v0.11.214's rule (TG4)
        const cy = mine.get(c.id), once = onceOf(g, card, c.id);
        if (cy) { c.status = 'busy'; c.busy = `its work goes on, ${hrs(cy.left)} to go`; } // BL
        else if (room < Math.max(30, once)) c.status = 'evening'; // RV1 (SR): a start needs its old-calendar length left today
        else if (!foodCard(card.c) && once * WEEK_MULT > (left ??= stayRoom(g, hubId))) c.status = 'long'; // RV1 (SG): it could not end, and pay, before the stay does
    }
    cards.unshift(...here.map((cy) => ({ id: carryTaskId(cy.id), kind: 'carry', card: cy.id, group: 'This week', label: `Go on: ${cy.label}`, tag: `${hrs(cy.left)} still to go${cy.paid ? '' : ', then its result'}`, minutes: Math.min(cy.left, room), status: room > 0 ? 'open' : 'evening', tier: 0, fam: 0, next: null })));
}
let routineBusy = false;
export const POT_BARE = 'the communal pot.'; // v0.11.261 (P29-A, M4; the review's TG4): dayMeal's line when the pot's run gives no satiety line, exported for the test
export const MEAL = { b: 'Breakfast', l: 'Midday', s: 'Supper' }; // v0.11.259 (OC-A, the review's TG-A2): exported for K-A's test
/** The part of the day (R1): before 11:00, 11:00–14:59, from 15:00 (the night to 05:00 is the evening's; 04:00 until v0.11.263). */
export const mealSlot = (g) => { const hh = clockParts(g.minutes).hh, h = hh < NIGHT_TO ? hh + 24 : hh; return h < 11 ? 'b' : h < 15 ? 'l' : 's'; };
/* ---------- v0.11.217 (owner picks PT1 = PM, 2026-11-17 19:26, and PC1 = PM + CG, 2026-11-18 01:01; the owner 17:42: "eating at
 * the pot is not among the schedualble options") ----------
 * PM: on the village's and the Fallout's stays the day's meal is the communal pot's when its card is open (once a day, Fed under 80,
 * before 19:00), run as its card (its time, its line, the day's pot used); else the hammerspace, as before. No plan row.
 * CG: not while the cook-with-the-women card can still show today (kitchen.js potCookDue): the pot is left for it (before, a
 * planned Fallout week never cooked). The pot's card tapped by hand is that part of the day's meal (no routine meal before it).
 * RV1 (owner pick, 02:14; the Opus review): the tap counts as the meal only once it has run (L1); the village's and the Fallout's
 * eat card tapped is the meal too (L2); the pot only when the card tapped stays open after it, else the hammerspace (L2); the plan's
 * day off reads the part of the day again after a meal that took time (week.js, M1).
 * `PT1.on`: the tests switch it off to run v0.11.216's meals. */
export const PT1 = { on: true };
const POT_TEXT = 'Eat at the communal pot.';
const POT_HUB = new Set(['ashfall', 'fo_ashfall']);
/** PT1: the pot's card id on this hub (open or not), or null. */
export function potCardId(scenes, hubId) {
    if (!scenes || !POT_HUB.has(hubId)) return null;
    const i = (scenes[hubId]?.choices || []).findIndex((c) => c.text === POT_TEXT);
    return i >= 0 ? `${hubId}:${i}` : null;
}
/** PT1 (PM + CG): the pot's card here when the routine eats there now (its task id), else null. */
export function potCardOpen(g, scenes, hubId = g.scene) {
    if (!PT1.on || g.scene !== hubId || potCookDue(g, hubId)) return null;
    const id = potCardId(scenes, hubId);
    return id && taskOpen(g, scenes, id) ? id : null;
}
/** R1: this part of the day's meal, once, when Fed is under ROUTINE_FED and there is food (lines). RV1 (M2): also on the week plan's
 *  days off. PT1 (PM): at the communal pot when it is open (`scenes` given). */
/** RV1 (L1, L2): the pot's card or the hammerspace's eat card on this hub (a tap of one is this part of the day's meal). */
const EAT_TEXT = new Set(['Eat something from the hammerspace.', 'Eat something.']); // the village's and the Fallout's
export function mealCard(scenes, hubId, id) {
    if (!id || !scenes || !POT_HUB.has(hubId)) return false;
    const [h, i] = String(id).split(':'), c = h === hubId ? scenes[hubId]?.choices?.[Number(i)] : null;
    return !!c && (c.text === POT_TEXT || EAT_TEXT.has(c.text));
}
/** RV1 (L2): would the tapped card still be open after the pot's meal? (on a copy) */
function openAfterPot(g, scenes, hubId, pot, id) {
    if (!id || isCarryTask(id)) return true;
    const { log, ...rest } = g, c = JSON.parse(JSON.stringify(rest)); c.log = [];
    routineBusy = true;
    try { runTask(c, scenes, pot); } finally { routineBusy = false; }
    return taskOpen(c, scenes, id);
}
export function dayMeal(g, hubId = g.scene, scenes = null, mark = false, id = '', at = null) {
    if (!routineHub(g, hubId) || g.combat) return []; // P52-A (BP-d): a camp's plan too
    if (hubId === 'rr_hub' && !g.flags?.ya_mocked) return []; // P52-A RV (the cold review's M1): the Root Road eats first at "Eat with the others." (act1_blackroot.js: its "Eat something." waits for it)
    const t = st(g), d = workDay(g);
    if (!t.routine || typeof t.routine !== 'object' || t.routine.d !== d) t.routine = { d, meals: '', sit: false };
    const slot = at || mealSlot(g);
    if (String(t.routine.meals).includes(slot)) return [];
    if (mark) { t.routine.meals = `${t.routine.meals || ''}${slot}`; return []; } // PT1: this part of the day's meal taken by a card
    if (g.james.satiety >= ROUTINE_FED) return [];
    let pot = potCardOpen(g, scenes, hubId);
    if (pot && id && !openAfterPot(g, scenes, hubId, pot, id)) pot = null; // RV1 (L2): the pot's time would close the card tapped: the hammerspace
    if (pot) {
        t.routine.meals = `${t.routine.meals || ''}${slot}`;
        routineBusy = true;
        let r;
        try { r = runTask(g, scenes, pot); } finally { routineBusy = false; }
        const ls = r.lines.filter((l) => l !== ''), i = ls.findIndex((l) => /: \+\d+ satiety\.$/.test(l));
        if (i >= 0) ls[i] = `${MEAL[slot]}: ${ls[i]}`; else ls.unshift(`${MEAL[slot]}: ${POT_BARE}`);
        return ls;
    }
    if (foodCount(g) <= 0) return [];
    t.routine.meals = `${t.routine.meals || ''}${slot}`;
    const e = eatBest(g, { fire: hubId === 'wilds' ? !!g.flags.fire : !CAMP_HUBS.has(hubId) }); // P52-A (BP-d): at a camp as its "Eat something." (no fire)
    return e.length ? [`${MEAL[slot]}: ${String(e[0]).replace(/^You eat: /, '')}`] : [];
}
/** R1 + R2: the day's meals and sit before a card (lines), on a stay of the long calendar. */
export function dayRoutine(g, scenes, hubId = g.scene, kind = '', id = '') {
    if (!routineHub(g, hubId) || g.combat) return []; // P52-A (BP-d): a camp's plan too
    const t = st(g), d = workDay(g), out = [];
    if (!t.routine || typeof t.routine !== 'object' || t.routine.d !== d) t.routine = { d, meals: '', sit: false };
    if (!(PT1.on && mealCard(scenes, hubId, id))) out.push(...dayMeal(g, hubId, scenes, false, id)); // RV1 (L1, L2): an eat card tapped is the meal, marked when it runs
    if (!t.routine.sit) {
        t.routine.sit = true;
        const sid = sitTaskId(g, scenes);
        if (!['sit', 'mer', 'qi', 'bt'].includes(kind) && id !== sid) { // a Meditate card first: it is the day's sitting
            if (g.james.qi >= CONDENSE_SIT_COST && taskOpen(g, scenes, sid)) {
                routineBusy = true;
                try { const r = runTask(g, scenes, sid); out.push('The day\'s sit:', ...r.lines); } finally { routineBusy = false; }
            }
        }
    }
    return out;
}

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
    if (g.flags.long && storyDay(g) >= 2 && storyDay(g) <= 6) { // v0.11.203 (T1, TS1): 43 in the long calendar
        // v0.11.224 (owner pick TX2, TS6: L6): the long calendar's tribute comes three weeks after the village is reached (Day 43 when the forest is
        // stayed out, earlier when it is left early): in the village its day, in the forest the rule
        return g.flags.vday ? `Day ${day}: the Sect's tribute comes on Day ${day + tributeLeft(g)}.` : `Day ${day}: the Sect's tribute comes three weeks after you reach the village (Day ${calStart(g, 7)} at the latest).`;
    }
    return '';
}

