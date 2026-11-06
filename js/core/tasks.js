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
import { choose, goTo, choiceOpen, choiceTag, gives, setTimeless, defaultMinutes, movesPlace } from './story.js';
import { advance, clockParts, actingCheck, actingName, awardXp, awardYukiFightXp, spendQi, setLootMult, takeCapNotes, itemNames, addItem, skillCheck } from './game.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { daily } from '../story/common.js';
import { endCoil, recordCard } from './coil.js';

setTimeless(Object.fromEntries(Object.entries(TASK_HUBS).map(([h, cfg]) => [h, [...Object.keys(cfg.menus || {}), ...Object.keys(cfg.doorMenus || {})]]))); // hub ↔ menu steps take no extra time (v0.9.5)

export const MS_PER_GAME_HOUR = 3000; // 1 game hour = 3 s at ×1 (design.md)
export const QUEUE_MAX = 30;
/** Speed gate (3c-3, owner 2026-11-06): ×1 at the start, ×2 after a won tribute (fought, bluff or the hairpin), ×5 after Act 1 ends (any route, `taken` included); ×10 only with the hidden test toggle. Read from the save, so no migration. */
export const SPEED_STEPS = [1, 2, 5, 10];
export function maxSpeed(g, test = false) {
    if (test) return 10;
    const f = (g && g.flags) || {};
    if (f.spd_a1 || (f.a1_outcome && g.scene === 'a1_end')) return 5;
    if (f.ending === 'fought' || f.ending === 'bluff' || f.ending === 'paid') return 2;
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

/** v0.10.0: "Next meridian session" — a queueable hub card that takes the first open session on the meridian screen. */
export const MER_TASK = 'mer:next';
/** Index of the meridian-screen choice the next session would take, or -1 (none left today, too little Qi, wrong realm). */
export function merChoice(g, scenes) {
    const cs = scenes.meridians?.choices || [];
    for (let i = 0; i < cs.length; i++) { const c = cs[i]; if (c.to === 'meridians' && c.check && choiceOpen(g, c)) return i; }
    return -1;
}
/** v0.10.0: rest and sleep happen at once (no bar; the clock still moves). */
export const instantChoice = (c) => !!c && !c.combat && !c.check && !c.qi && typeof c.text === 'string'
    && (/^(Rest|Sleep)\b/.test(c.text) || /^(Get wet\. Sleep|Make camp and sleep|Go back to sleep|Just sleep|Let her sleep|Bandage it\. Sleep|Leave (a|the) thread on watch|Thank her for dinner and sleep|Limp back to camp and sleep)/.test(c.text));
export function isInstantTask(g, scenes, id) {
    if (id === MER_TASK) return false;
    const p = parse(id);
    return instantChoice(scenes[p.scene]?.choices?.[p.index]);
}

/** What kind of card `id` is on hub `hubId`, with its choice and (for menu cards) the door choice into its menu. */
function cardOf(scenes, hubId, id) {
    const cfg = TASK_HUBS[hubId];
    if (id === MER_TASK) return { kind: 'mer', c: null, p: { scene: 'meridians', index: -1 }, group: 'Meditate' };
    const p = parse(id);
    const c = scenes[p.scene]?.choices?.[p.index];
    if (!c) return null;
    if (p.scene === hubId) {
        if (isDoor(cfg, c)) return { kind: 'door', c, p, group: cfg.own };
        if (isChore(hubId, c)) return { kind: c.check ? 'work' : 'chore', c, p, group: cfg.own, menu: null };
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
export function taskCards(g, scenes) {
    const hubId = g.scene;
    const cfg = TASK_HUBS[hubId];
    if (!cfg) return [];
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
            let status = 'open';
            if (doneToday) status = 'tomorrow';
            else if (c.show && !c.show(g)) { if (c.show.dailyKey) status = 'tomorrow'; else return; }
            else if (!choiceOpen(g, c)) return;
            push(`${menu}:${i}`, door ? 'door' : 'work', m.label, c, (entry.time || 0) + (c.time || 0), status);
        });
    }
    hub.choices.forEach((c, i) => {
        if (!choiceOpen(g, c)) return;
        if (isDoor(cfg, c)) push(`${hubId}:${i}`, 'door', cfg.own, c, c.time || 0, 'open');
        else if (isChore(hubId, c)) push(`${hubId}:${i}`, c.check ? 'work' : 'chore', cfg.own, c, c.time || 0, 'open');
    });
    const mi = merChoice(g, scenes);
    if (mi >= 0) {
        const c = scenes.meridians.choices[mi];
        cards.push({ id: MER_TASK, kind: 'mer', group: 'Meditate', label: `Next meridian session: ${asText(c.text, g).replace(/^Open /, '')}`, tag: choiceTag(g, c), minutes: c.time || 0, status: 'open', tier: 0, fam: 0, next: null });
    }
    return cards;
}

export const taskOpen = (g, scenes, id) => taskCards(g, scenes).some((c) => c.id === id && c.status === 'open');
export const taskLabel = (g, scenes, id) => { if (id === MER_TASK) return 'Next meridian session'; const p = parse(id); const c = scenes[p.scene]?.choices?.[p.index]; return c ? asText(c.text, g) : id; };

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
    const mins = Math.round((((card.entry?.time || 0) + (c.time || 0)) * NEW_LENGTH) / FAM[tier].speed);
    lines.push(...advance(g, mins));
    g.james.satiety = Math.max(0, g.james.satiety - (FED_EXTRA_PER_HOUR * mins) / 60);
    takeCapNotes();
    const items = gives(c).length > 0;
    const success = band === 'double' || band === 'full' || (band === 'partial' && items);
    const roll = { success, crit: band === 'double', ratio };
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
        const len = Math.round((job.minutes * NEW_LENGTH) / FAM[famTier(f)].speed);
        if (y.progress < len) break;
        y.progress -= len;
        const ratio = skillCheck(g.yuki.fight) / job.dc;
        const n = ratio >= 2 ? job.n * 2 : ratio >= 1 ? job.n : ratio >= 0.5 ? Math.floor(job.n * ratio + 0.5) : 0;
        if (n > 0) { addItem(g, job.item, n); lines.push(`${job.got(n)} +${n} ${itemNames[job.item]?.name || job.item}.`, ...awardYukiFightXp(g, 'standard')); } else lines.push(job.none);
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
    return { label: job.label, on: !!y.on, progress: y.progress || 0, len: Math.round((job.minutes * NEW_LENGTH) / FAM[famTier(f)].speed), fam: f, tier: famTier(f), dc: job.dc, check: r1(skillCheck(g.yuki.fight)) };
}
export function setYuki(g, on) { st(g).yuki.on = !!on; }

/**
 * Run card `id` now (its bar has finished). Returns { lines, fail, stopped }: `stopped` means the story
 * left the hub (a door, a fail scene, a collapse), so the queue must wait.
 */
export function runTask(g, scenes, id) {
    const hubId = g.scene;
    if (!TASK_HUBS[hubId]) throw new Error(`Not a task hub: ${hubId}`);
    const card = cardOf(scenes, hubId, id);
    if (!card) throw new Error(`No card ${id} on ${hubId}`);
    const m0 = g.minutes;
    const lines = [];
    let fail = false;
    recordCard(g, hubId, m0, id);
    if (card.kind === 'mer') {
        const mi = merChoice(g, scenes);
        if (mi < 0) throw new Error('No meridian session possible');
        g.scene = 'meridians';
        const r = choose(g, scenes, mi);
        lines.push(...r.lines);
        if (r.roll && !r.roll.success) fail = true;
        if (g.scene === 'meridians') g.scene = hubId; // back to the hub without running its enter
    } else if (card.kind === 'work') {
        const before = g.stats.wins;
        const checks = g.stats.checks;
        lines.push(...resolveWork(g, scenes, hubId, card, id));
        fail = g.stats.checks > checks && g.stats.wins === before;
    } else {
        const take = (index) => { const r = choose(g, scenes, index); lines.push(...r.lines); if (r.roll && !r.roll.success) fail = true; if (r.combat) throw new Error(`A task can't start a fight (${id})`); };
        if (card.menu) take(card.entryIndex);
        if (!card.menu || g.scene === card.menu) take(card.p.index);
        if (card.kind === 'chore' || card.kind === 'door') learn(g, scenes, hubId, card, id, 1);
    }
    lines.push(...yukiTick(g, hubId, g.minutes - m0));
    let stopped = g.scene !== hubId;
    if (!stopped && g.james.hp <= 0) { lines.push(...collapse(g, scenes, hubId)); stopped = true; }
    return { lines, fail, stopped };
}

const clone = (g) => JSON.parse(JSON.stringify(g));

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
    for (const id of st(g).queue) {
        if (death) { rows.push({ id, dead: true }); continue; }
        if (left) { rows.push({ id, wait: true }); continue; }
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

/* ---------- the queue, edited (v0.10.0; pure: the screen calls these) ---------- */
/** Run `id` now: it goes to the front (the card that was running moves to second place). */
export function queueRunNow(g, id) { const q = st(g).queue; if (q.length >= QUEUE_MAX) return false; q.unshift(id); return true; }
/** Add `id` to the end. */
export function queueAdd(g, id) { const q = st(g).queue; if (q.length >= QUEUE_MAX) return false; q.push(id); return true; }
/** Move row k up (dir −1) or down (+1). */
export function queueMove(g, k, dir) { const q = st(g).queue; const j = k + dir; if (k < 0 || j < 0 || k >= q.length || j >= q.length) return false; [q[k], q[j]] = [q[j], q[k]]; return true; }
/** Clear the queue; keepHead keeps the row in progress. */
export function queueClear(g, keepHead) { const q = st(g).queue; q.splice(keepHead && q.length ? 1 : 0); }
