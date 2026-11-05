/**
 * Task cards and the queue (v0.9.0, step 3a of the hybrid design). Pure — no DOM.
 * A card is an existing hub choice: running it calls the same story code (`choose`) as tapping it would,
 * so rolls, XP, loot, time and Fed are exactly as before; only the moment they happen moves to the end of the bar.
 * Card ids: `<menu scene>:<choice index>` for a sub-menu choice, `<hub scene>:<choice index>` for a hub choice.
 */
import { choose, goTo, choiceOpen, choiceTag } from './story.js';
import { advance, clockParts } from './game.js';
import { TASK_HUBS } from '../story/task_hubs.js';
import { daily } from '../story/common.js';

export const MS_PER_GAME_HOUR = 3000; // 1 game hour = 3 s at ×1 (design.md)
export const QUEUE_MAX = 30;

const asText = (v, g) => (typeof v === 'function' ? v(g) : v);
const hasWork = (c) => !c.combat && !!(c.do || c.check || c.time || c.qi);

export const isTaskHub = (g) => !!TASK_HUBS[g.scene] && !g.combat;
const queueOf = (g) => { if (!g.tasks || !Array.isArray(g.tasks.queue)) g.tasks = { queue: [] }; return g.tasks.queue; };
export { queueOf as taskQueue };

function entryIndex(scenes, hubId, menu) {
    return (scenes[hubId].choices || []).findIndex((c) => c.to === menu);
}
/** Hub choices that are cards (lead straight back to the hub and do something). */
const isOwnCard = (hubId, c) => c.to === hubId && hasWork(c);

/** True if hub choice `index` is shown as a card (or is a sub-menu's door) rather than as a story stop. */
export function isTaskChoice(scenes, hubId, index) {
    const c = scenes[hubId].choices[index];
    return !!(TASK_HUBS[hubId].menus[c.to] || isOwnCard(hubId, c));
}

function parse(id) { const k = String(id).lastIndexOf(':'); return { scene: id.slice(0, k), index: Number(id.slice(k + 1)) }; }

/** Every card on the current hub: { id, group, label, tag, minutes (estimate), status: 'open' | 'tomorrow' }. */
export function taskCards(g, scenes) {
    const hubId = g.scene;
    const cfg = TASK_HUBS[hubId];
    if (!cfg) return [];
    const hub = scenes[hubId];
    const cards = [];
    for (const [menu, m] of Object.entries(cfg.menus)) {
        const ei = entryIndex(scenes, hubId, menu);
        if (ei < 0) continue;
        const entry = hub.choices[ei];
        const doneToday = m.daily && !daily(m.daily)(g);
        if (!doneToday && !choiceOpen(g, entry)) continue; // not here today (too late, not unlocked yet…)
        (scenes[menu].choices || []).forEach((c, i) => {
            if (!hasWork(c)) return;
            let status = 'open';
            if (doneToday) status = 'tomorrow';
            else if (c.show && !c.show(g)) { if (c.show.dailyKey) status = 'tomorrow'; else return; }
            else if (!choiceOpen(g, c)) return;
            cards.push({ id: `${menu}:${i}`, group: m.label, label: asText(c.text, g), tag: choiceTag(g, c), minutes: (entry.time || 0) + (c.time || 0), status });
        });
    }
    hub.choices.forEach((c, i) => {
        if (!isOwnCard(hubId, c) || !choiceOpen(g, c)) return;
        cards.push({ id: `${hubId}:${i}`, group: cfg.own, label: asText(c.text, g), tag: choiceTag(g, c), minutes: c.time || 0, status: 'open' });
    });
    return cards;
}

export const taskOpen = (g, scenes, id) => taskCards(g, scenes).some((c) => c.id === id && c.status === 'open');
export const taskLabel = (g, scenes, id) => { const p = parse(id); const c = scenes[p.scene]?.choices?.[p.index]; return c ? asText(c.text, g) : id; };

/** HP 0 during a task (stand-in until the Coil, step 3c): the queue stops, James comes to at dusk with 1 HP. */
function collapse(g, scenes, hubId) {
    const { hh, mm } = clockParts(g.minutes);
    if (hh < 19) advance(g, (19 - hh) * 60 - mm);
    g.james.hp = 1;
    queueOf(g).length = 0;
    const dest = TASK_HUBS[hubId].evening;
    return ['Your knees make the decision for you. You fold up where you stand, and come to at dusk with Yuki sitting on your chest, unimpressed. 1 HP. The queue is gone.',
        ...goTo(g, scenes, typeof dest === 'function' ? dest(g) : dest)];
}

/**
 * Run card `id` now (the bar has finished). Returns { lines, fail, stopped }: `stopped` means the story
 * left the hub (a fail scene, a collapse), so the queue must wait.
 */
export function runTask(g, scenes, id) {
    const hubId = g.scene;
    if (!TASK_HUBS[hubId]) throw new Error(`Not a task hub: ${hubId}`);
    const p = parse(id);
    const lines = [];
    let fail = false;
    const take = (index) => { const r = choose(g, scenes, index); lines.push(...r.lines); if (r.roll && !r.roll.success) fail = true; if (r.combat) throw new Error(`A task can't start a fight (${id})`); };
    if (p.scene === hubId) take(p.index);
    else {
        take(entryIndex(scenes, hubId, p.scene));
        if (g.scene === p.scene) take(p.index);
        if (g.scene === p.scene) lines.push(...goTo(g, scenes, hubId));
    }
    let stopped = g.scene !== hubId;
    if (!stopped && g.james.hp <= 0) { lines.push(...collapse(g, scenes, hubId)); stopped = true; }
    return { lines, fail, stopped };
}

const clone = (g) => JSON.parse(JSON.stringify(g));

/** Game minutes card `id` will take from here (a dry run on a copy: same seed, same rolls). */
export function taskMinutes(g, scenes, id) {
    const c = clone(g);
    runTask(c, scenes, id);
    return Math.max(0, c.minutes - g.minutes);
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
    for (const id of queueOf(g)) {
        if (left) { rows.push({ id, wait: true }); continue; }
        if (!taskOpen(c, scenes, id)) { rows.push({ id, skip: true }); continue; }
        const before = c.minutes;
        const r = runTask(c, scenes, id);
        if (fedOut === null && c.james.satiety <= 0) fedOut = c.minutes;
        rows.push({ id, start: before, end: c.minutes });
        if (r.stopped) left = true;
    }
    return { rows, fedOut, fedEnd: c.james.satiety, end: c.minutes };
}
