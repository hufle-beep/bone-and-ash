/**
 * Scene runner. A scene: { id, title, art, place, text(g) | text, enter?(g) → lines, choices: [...] }.
 * A choice: { text, show?(g), req?(g) → true | 'reason', qi?, time?, check?: { skill, dc, band?, bonus?(g) },
 *             to | to(g), fail?, do?(g, r) → lines, failDo?(g, r) → lines, combat?: encounter, xp?: false }.
 * A check pays standard XP (25% on a fail) unless xp: false. Pure — no DOM.
 */
import { rollCheck, awardXp, spendQi, advance, ensureBars, actingCheck, actingName, instantWin, itemFull, takeCapNotes, itemNames, setLootMult, noDiceDc, checkText, addItem } from './game.js';
import { STOMP, degreeForChoice } from '../story/power.js';
import { keepReplies } from './replies.js'; // v0.11.69 (P1)

const ONE_MOVE = 1000; // virtual choice index offset: "End it in one move."
/** HP 0 outside a fight (v0.9.7): the Coil takes it (set by coil_scenes.js). Returns lines, or null when nothing happens. */
let deathHook = null;
export const setDeathHook = (fn) => { deathHook = fn; };
export const checkDeath = (g, scenes) => (deathHook && g.james.hp <= 0 && !g.combat ? deathHook(g, scenes) : null) || [];

const asText = (v, g) => (typeof v === 'function' ? v(g) : v);

export function currentScene(g, scenes) {
    const s = scenes[g.scene];
    if (!s) throw new Error(`No scene "${g.scene}"`);
    return s;
}

export function choiceTag(g, c) {
    const bits = [];
    if (c.check) {
        const bonus = c.check.bonus ? c.check.bonus(g) : 0;
        const v = Math.round((actingCheck(g, c.check.skill) + bonus) * 10) / 10;
        const d = noDiceDc(asText(c.check.dc, g));
        const ratio = v / d;
        bits.push(`${actingName(g, c.check.skill)} ${v} / DC ${d} → ${ratio >= 1 ? 'passes' : ratio >= 0.5 && gives(c).length ? 'partly' : 'fails'}`);
    }
    if (c.qi) bits.push(`${c.qi} Qi`);
    if (c.combat) bits.push('fight');
    return bits.join(' · ');
}

/** The common items a choice's `do` adds (read once from its source; quoted ids in addItem(g, …, n > 0) that are real items:
 *  v0.11.25, so a quoted non-item such as yukiForm(g) === 'tiger' inside the call is not taken for one). */
const givesCache = new WeakMap();
export function gives(c) {
    if (!c.do) return [];
    if (!givesCache.has(c)) {
        const ids = new Set();
        for (const m of c.do.toString().matchAll(/addItem\(g,\s*([^,]+?),\s*(-?)/g)) if (!m[2]) for (const q of m[1].matchAll(/'([a-z_]+)'/g)) if (Object.hasOwn(itemNames, q[1])) ids.add(q[1]);
        givesCache.set(c, [...ids]);
    }
    return givesCache.get(c);
}
/** A gathering choice whose every item is already at its cap. */
const allFull = (g, c) => { const ids = gives(c); return ids.length > 0 && ids.every((id) => itemFull(g, id)); };
const shown = (g, c) => !c.show || c.show(g);
/** Choices still worth showing: hide full-stock gathering, unless that would leave nothing at all. */
/** Why a choice can't be taken right now ('' if it can). */
function lockReason(g, c) {
    let reason = c.req ? c.req(g) : true;
    if (reason === true && c.qi && g.james.qi < c.qi) reason = `needs ${c.qi} Qi`;
    return reason === true ? '' : reason;
}
/** Choices still worth showing: hide full-stock gathering and anything unaffordable right now, unless that would leave nothing at all. */
function visible(g, s) {
    const list = (s.choices || []).map((c, i) => ({ c, i })).filter(({ c }) => shown(g, c));
    const kept = list.filter(({ c }) => !allFull(g, c) && !lockReason(g, c));
    return kept.length ? kept : list;
}
/** A choice that can be taken right now and is worth showing (tasks.js uses the same rules as the story screen). */
export const choiceOpen = (g, c) => shown(g, c) && !lockReason(g, c) && !allFull(g, c);
/** A plain "go back" choice: no effects, leads to `home`. */
const isBack = (g, c, home) => !c.do && !c.check && !c.combat && !c.qi && !c.req && (typeof c.to === 'function' ? c.to(g) : c.to) === home;
/**
 * A ghost: a plain menu entry (Hunt, Forage, Train…) whose sub-menu has nothing left today but "Back".
 * Only for sub-menus without an enter() (so nothing is skipped by hiding them).
 */
function isGhost(g, scenes, s, c) {
    if (typeof c.to !== 'string' || c.to === s.id || c.do || c.check || c.combat || c.qi) return false;
    const t = scenes[c.to];
    if (!t || t.enter || !t.choices?.length) return false;
    const inner = visible(g, t);
    return inner.length > 0 && inner.every(({ c: x }) => isBack(g, x, s.id));
}

/** What the UI shows for the current scene. */
export function sceneView(g, scenes) {
    const s = currentScene(g, scenes);
    let vis = visible(g, s);
    const noGhosts = vis.filter(({ c }) => !isGhost(g, scenes, s, c));
    if (noGhosts.length) vis = noGhosts;
    const choices = vis
        .map(({ c, i }) => {
            const reason = lockReason(g, c);
            return { index: i, label: asText(c.text, g), tag: choiceTag(g, c), disabled: !!reason, reason };
        });
    // a crushing power gap offers the one-move finish next to the fight choice
    for (let k = choices.length - 1; k >= 0; k--) {
        const c = s.choices[choices[k].index];
        if (c.combat && !choices[k].disabled && degreeForChoice(g, c.combat) >= 3) {
            choices.splice(k + 1, 0, { index: ONE_MOVE + choices[k].index, label: 'End it in one move.', tag: 'fight · crushing', disabled: false, reason: '' });
        }
    }
    // after a lopsided win, the win scene reads differently
    let text = asText(s.text, g);
    const lw = g.lastWin;
    if (lw && lw.next === s.id && lw.degree >= 2) {
        const w = STOMP[lw.id]?.win?.[lw.degree];
        if (w) text = typeof w === 'function' ? w(g) : w;
    }
    return { id: s.id, title: asText(s.title, g) || '', art: asText(s.art, g), place: asText(s.place, g), text, choices, end: !!s.end };
}

function go(g, scenes, to) {
    const id = typeof to === 'function' ? to(g) : to;
    if (!scenes[id]) throw new Error(`Choice leads to unknown scene "${id}"`);
    g.scene = id;
    noteSeen(g, id); // v0.11.35 (P1-a)
    const s = scenes[id];
    if (s.place) g.location = asText(s.place, g);
    let skip = !!g.coil?.skipEnter; // a Coil rewind or "Not yet": the scene was entered already, don't run its enter twice
    if (skip) g.coil.skipEnter = false;
    if (g.flags.med_back && g.flags.med_back === id) { skip = true; delete g.flags.med_back; } // back from the Meditate card (v0.9.5)
    const lines = s.enter && !skip ? (s.enter(g) || []) : [];
    ensureBars(g);
    return lines;
}

/* ---------- scenes read (v0.11.35, P1-a, owner 13:16 / 15:42) ---------- */
/** `g.seen[sceneId]` = the Coil in which the scene was first read (kept across every rewind, coil.js; 0 = before the record). */
export function noteSeen(g, id) {
    if (!g.seen || typeof g.seen !== 'object') g.seen = {};
    if (g.seen[id] == null) g.seen[id] = g.coil?.n || 1;
}
/** Read in an earlier Coil than this one. */
export const seenBefore = (g, id = g.scene) => g.seen?.[id] != null && g.seen[id] < (g.coil?.n || 1);

/* ---------- picked choices (v0.11.32, P2-a, owner 13:16 / 13:29) ---------- */
/**
 * `g.picked[sceneId]` = the positions of the choices ever picked on that scene, this save (both modes; kept across every
 * rewind, coil.js; an old save starts empty). Keyed by position: a choice inserted mid-list later shifts that scene's marks.
 */
export function notePicked(g, sceneId, index) {
    if (TIMELESS.has(sceneId)) return; // the Coil's own screens, meridians, warnings
    if (!g.picked) g.picked = {};
    const a = g.picked[sceneId] || (g.picked[sceneId] = []);
    if (!a.includes(index)) { a.push(index); a.sort((x, y) => x - y); }
}
/**
 * v0.11.37 (owner 14:25, pick F1): familiarity on story choices: one picked before (any Coil; the ones shown in sepia,
 * tasks.js `showPicked`, set at load) takes half its time: its own `time` and the default walk or talk. Not the clock jumps
 * a scene sets (waits, sleep), not fights, not task cards (their own familiarity), Incremental Mode only.
 */
let familiar = null;
export const setFamiliar = (fn) => { familiar = fn; };
export const PICKED_SPEED = 2;
export const pickedMinutes = (m) => Math.max(1, Math.round(m / PICKED_SPEED));
/** v0.11.33: called on every choice taken (oneoff.js counts the once-per-Coil work); set once at load. */
let onChoose = null;
export const setOnChoose = (fn) => { onChoose = fn; };
/** Was choice `index` (a "one move" index counts as its fight choice) ever picked on this scene? */
export const wasPicked = (g, sceneId, index) => !!g.picked?.[sceneId]?.includes(index >= ONE_MOVE ? index - ONE_MOVE : index);
/** A hub's work menu (Hunt, Forage, Train…): its choices are work, never recoloured. */
export const isMenuScene = (id) => TIMELESS_PAIR.has(id);
/** The meta screens (the Coil's, meridians, warnings, Yuki's form). */
export const isTimeless = (id) => TIMELESS.has(id);

/* ---------- every choice takes time (task mode, v0.9.5) ---------- */
/** Scenes whose choices among themselves take no extra time: task hubs and their menus (their cards carry their own time), meta screens. */
const TIMELESS = new Set(['coil_end', 'coil_dawn', 'meridians', 'ns_warn', 'col_warn', 'yuki_form']);
const TIMELESS_PAIR = new Set(); // hub ↔ its menus
export function setTimeless(hubs) { for (const [hub, menus] of Object.entries(hubs)) { TIMELESS_PAIR.add(hub); for (const m of menus) TIMELESS_PAIR.add(m); } }
export const DEFAULT_MINUTES = { talk: 10, move: 20, act: 30 };
/** The default time of a choice with none: an action 30, moving to another place 20, talking 10. 0 when it has its own time or doesn't apply. */
export function defaultMinutes(scenes, fromId, c, toId, moved) {
    if (c.time != null || c.combat) return 0;
    if (TIMELESS.has(fromId) || TIMELESS.has(toId)) return 0;
    if (TIMELESS_PAIR.has(fromId) && TIMELESS_PAIR.has(toId)) return 0;
    if (scenes[toId]?.end) return 0;
    if (c.check || c.qi || gives(c).length) return DEFAULT_MINUTES.act;
    return moved ? DEFAULT_MINUTES.move : DEFAULT_MINUTES.talk;
}
/** For a choice whose target is a plain scene id: would it move to another place? (doors use this before they run) */
export function movesPlace(g, scenes, fromId, toId) {
    const a = asText(scenes[fromId]?.place, g) || g.location;
    const b = asText(scenes[toId]?.place, g);
    return !!b && b !== a;
}

/**
 * Take choice `index`. Returns { lines, roll, combat } — lines are what happened (rolls, XP, items).
 */
export function choose(g, scenes, index, { task = false } = {}) {
    const s = currentScene(g, scenes);
    g.lastWin = null;
    if (index >= ONE_MOVE) {
        const c = (s.choices || [])[index - ONE_MOVE];
        if (!c || !c.combat) throw new Error('No fight to finish');
        notePicked(g, s.id, index - ONE_MOVE);
        if (onChoose) onChoose(g, s.id, index - ONE_MOVE, c);
        const r = instantWin(g, c.combat(g));
        const st = STOMP[r.enc.id];
        const lines = [];
        if (st?.posture) lines.push(st.posture(g, 3));
        lines.push(st?.one ? st.one(g) : 'One move. It is over before it starts.', ...r.lines);
        const keep = g.lastWin;
        lines.push(...go(g, scenes, r.next));
        g.lastWin = keep;
        g.log.push({ at: g.minutes, scene: g.scene, lines: lines.slice(0, 12) });
        return { lines, roll: null, combat: null };
    }
    const c = (s.choices || [])[index];
    if (!c) throw new Error(`No choice ${index} in ${s.id}`);
    if (c.show && !c.show(g)) throw new Error('Choice not available');
    if (c.req && c.req(g) !== true) throw new Error(`Locked: ${c.req(g)}`);
    const lines = [];
    if (c.qi && !spendQi(g, c.qi)) throw new Error('Not enough Qi');
    const fast = !task && !!familiar && familiar(g, scenes, index, asText(c.text, g)); // v0.11.37 (F1): before this pick marks it
    notePicked(g, s.id, index);
    let roll = null;
    let ok = true;
    let partial = false;
    if (c.check) {
        roll = rollCheck(g, c.check.skill, asText(c.check.dc, g), c.check.bonus ? c.check.bonus(g) : 0);
        ok = roll.success;
        // a gathering choice between half and full the DC still brings back a thin haul
        partial = !ok && roll.ratio >= 0.5 && gives(c).length > 0;
        if (partial) ok = true;
        lines.push(`${checkText(roll)} — ${partial ? 'partly' : ok ? 'success' : 'failure'}${roll.crit ? ' (double!)' : ''}`);
        if (c.xp !== false) lines.push(...awardXp(g, c.check.skill, c.check.band || 'standard', { fail: !ok, factor: partial ? roll.ratio : 1 }));
    }
    if (onChoose && ok) onChoose(g, s.id, index, c); // v0.11.33: once-per-Coil work counts only when it succeeds (owner 14:05)
    if (c.time) lines.push(...advance(g, fast ? pickedMinutes(c.time) : c.time, { work: true }));
    takeCapNotes();
    if (ok && c.do) {
        // a critical hunt or forage (total ≥ 2 × DC): a double haul
        const crit = roll?.crit && gives(c).length > 0;
        const before = crit ? { ...g.inventory } : null;
        const before0 = { ...g.inventory };
        if (crit) setLootMult(2);
        let out = [];
        try { out = c.do(g, roll) || []; } finally { setLootMult(1); }
        if (partial) {
            const gained = Object.keys(g.inventory).map((id) => [id, (g.inventory[id] || 0) - ((before0[id]) || 0)]).filter(([, d]) => d > 0);
            const kept = gained.map(([id, d]) => { const keep = Math.max(1, Math.floor(d * roll.ratio)); if (keep < d) addItem(g, id, keep - d); return [id, keep]; });
            lines.push(...keepReplies(out), `A thin haul — you keep: ${kept.map(([id, d]) => `+${d} ${itemNames[id]?.name || id}`).join(', ') || 'nothing'}.`);
        } else lines.push(...out);
        if (crit) {
            const extra = Object.keys(g.inventory).map((id) => [id, (g.inventory[id] || 0) - (before[id] || 0)]).filter(([, d]) => d > 0);
            if (extra.length) lines.push(`Double haul — in total: ${extra.map(([id, d]) => `+${d} ${itemNames[id]?.name || id}`).join(', ')}.`);
        }
    }
    for (const id of new Set(takeCapNotes())) lines.push(`Hammerspace: ${itemNames[id]?.name || id} is full — the rest stays behind.`);
    if (!ok && c.failDo) lines.push(...(c.failDo(g, roll) || []));
    if (c.combat && ok) {
        return { lines, roll, combat: c.combat };
    }
    const dest = ok ? c.to : (c.fail ?? c.to);
    const loc0 = g.location;
    lines.push(...go(g, scenes, dest));
    const extra = defaultMinutes(scenes, s.id, c, g.scene, g.location !== loc0);
    if (extra) lines.push(...advance(g, fast ? pickedMinutes(extra) : extra, { work: true }));
    lines.push(...checkDeath(g, scenes));
    g.log.push({ at: g.minutes, scene: g.scene, lines: lines.slice(0, 12) });
    if (g.log.length > 200) g.log.shift();
    return { lines, roll, combat: null };
}

/** After a fight ends: go to its win / lose / flee scene. */
export function goTo(g, scenes, id) {
    return go(g, scenes, id);
}
