/** Shared story helpers: flags, days, food, and how enemies grow with the days James spends training. */
import { clockParts, addItem, eat, wakeDay, dayHour, combatHooks, yukiForm, foodHooks, spoilFresh, freshDue, advance, itemCap } from '../core/game.js';
import { longCal, storyDay, storyDayOf, STAY_DAYS } from '../core/calendar.js';
export { byDay, dayIndex, dayReply } from '../core/lines.js'; // v0.11.135 (owner picks NT1, EV1): a scene's text for the day; v0.11.136 (NC1): a reply's
/** v0.11.125 (owner pick FM1): a story line by Yuki's current form, as the pictures draw her (the cat's line is the old one; texts by Fable). */
export const byForm = (g, cat, tiger, human) => { const f = yukiForm(g); return f === 'tiger' ? tiger : f === 'human' ? human : cat; };

export const once = (flag) => (g) => !g.flags[flag];
export const set = (...flags) => (g) => { for (const f of flags) g.flags[f] = true; return []; };
export const day = (g) => clockParts(g.minutes).day;
export const hour = (g) => dayHour(g); // v0.11.37: 00:00–03:59 read 24–27 in Incremental Mode (the evening before), unless pushed through
/** Available once per in-game day. */
/** A once-a-day test; `dailyKey` lets the task screen show it as "back tomorrow" (v0.9.0). */
/** v0.11.18: in Incremental Mode a "day" for these is a waking day (back after sleep or a push), not the calendar. */
export const dayKey = (g) => wakeDay(g);
export const DAILY_KEYS = new Set();
/* v0.11.213 (owner pick FQ1, S3, 2026-11-17 15:35: "FQ1 but also apply to the Heart cards of Mei and Ya"): on the long calendar's
 * stays the repeating door cards (and the Heart's two fireside talks) open every SPACE_DAYS-th day, not every day: a card taken
 * today opens again SPACE_DAYS days later (a day missed costs no visit). Past days count only when they were the same stay's (a
 * journey day's visit, or the last stay's, doesn't hold a stay's first days: RV1, L4). The old calendar, and the long calendar's journey days, keep once a day. The base
 * game gives 3 visits a stay (one a story day); the long calendar gave 21 (7×), now 7 (2.3×). Keys: the daily keys below, and the
 * calendar-day flags `spring`, `hc_mei`, `hc_ya` (act1_heart.js). */
export const SPACE_DAYS = 3;
export const SPACED = new Set(['yk_time', 'wen_time', 'mother_time', 'a1_mei', 'a1_ya', 'slopes', 'wen', 'far', 'spring', 'hc_mei', 'hc_ya']);
let spaceOff = 0;
/** `fn` run as if the cards were not spaced (the plan's rows: is a card closed only by its spacing?). */
export const unspaced = (fn) => { spaceOff++; try { return fn(); } finally { spaceOff--; } };
const spacedNow = (g, key) => !spaceOff && SPACED.has(key) && longCal(g) && STAY_DAYS.has(storyDay(g));
/** v0.11.213 (RV1, L4): which stay a story day belongs to (the wilds, the village, the Fallout, the Heart; 0 a journey or deadline day). */
export const stayOf = (d) => (d >= 1 && d <= 3 ? 1 : d >= 4 && d <= 6 ? 2 : d >= 8 && d <= 10 ? 3 : d >= 16 && d <= 18 ? 4 : 0);
/** A past day `pd` counts for the spacing only when it was a day of the same stay as `d` (RV1, L4: a new stay starts afresh). */
const sameStay = (g, d, pd) => { const s = stayOf(storyDayOf(g, d)); return s > 0 && stayOf(storyDayOf(g, pd)) === s; };
/** Is flag `key@d` (and, spaced, `key@d-1`, `key@d-2` of a stay) unset? `d`: today's number in the flag (a waking day or a calendar day). */
export function spacedFree(g, key, d) {
    if (g.flags[`${key}@${d}`]) return false;
    if (!spacedNow(g, key)) return true;
    for (let k = 1; k < SPACE_DAYS; k++) if (sameStay(g, d, d - k) && g.flags[`${key}@${d - k}`]) return false;
    return true;
}
/** The day (in `d`'s count) a spaced card opens again, or `d` when it is open (or not spaced now). */
export function spacedNext(g, key, d) {
    if (!spacedNow(g, key)) return g.flags[`${key}@${d}`] ? d + 1 : d;
    for (let k = 0; k < SPACE_DAYS; k++) if ((k === 0 || sameStay(g, d, d - k)) && g.flags[`${key}@${d - k}`]) return d - k + SPACE_DAYS;
    return d;
}
export const daily = (key) => { DAILY_KEYS.add(key); return Object.assign((g) => spacedFree(g, key, dayKey(g)), { dailyKey: key }); };
export const markDaily = (g, key) => { DAILY_KEYS.add(key); g.flags[`${key}@${dayKey(g)}`] = true; };

/** Days of training beyond the original pace: 0 on the old route, up to 2 in the forest and 2 in Ashfall. */
export const forestScale = (g) => g.flags.longforest ? 0 : Math.max(0, Math.min(2, (g.flags.forest_day || 1) - 1));
export const villageScale = (g) => g.flags.longforest ? 0 : Math.max(0, Math.min(2, (g.flags.vday || 1) - 1));

/**
 * An enemy grown by s extra days of training: HP ×(1 + hp·s), DC to hit +dc·s, attack +atk·s (to the half point).
 * The defaults track what a day of training gives on average (about +0.6 GU check and +0.45 to the attack roll),
 * so a fight stays about as hard as it was on the original pace — and a player who trains harder than average wins more.
 */
export const GROWTH = { hp: 0.15, dc: 0.45, atk: 0.6 };
const half = (n) => Math.round(n * 2) / 2;
export function grow(e, s, { hp = GROWTH.hp, dc = GROWTH.dc, atk = GROWTH.atk } = {}) {
    if (!s) return e;
    return { ...e, hp: Math.round(e.hp * (1 + hp * s)), dc: half(e.dc + dc * s), atk: half(e.atk + atk * s) };
}

/** Food: satiety cooked / raw. */
export const FOOD = {
    hare_raw: [35, 18],
    fowl_raw: [30, 15],
    crab_meat: [20, 12],
    honeycomb: [25, 25],
    lizard_egg: [15, 10],
    jade_bracket: [15, 10],
    river_cress: [8, 8],
    crimson_berry: [3, 3],
    venison: [40, 20],
    smoked_meat: [30, 30], // v0.11.209 (owner pick TF1, TS4): the kept foods, long calendar only (they never spoil)
    dried_bracket: [15, 15],
};
/** v0.11.113 (DA1, CS): what a thief (the rot-crows) takes: the first food in FOOD's order the hammerspace holds. */
combatHooks.steal = (g) => Object.keys(FOOD).find((k) => (g.inventory[k] || 0) > 0) || null;
export const foodCount = (g) => Object.keys(FOOD).reduce((n, k) => n + (g.inventory[k] || 0), 0);
/** Eat the most filling thing in the hammerspace (cooked if there's a fire). */
export function eatBest(g, { fire = !!g.flags.fire } = {}) {
    spoilFresh(g); // v0.11.209 (TF1, S): what has turned goes before the meal (long calendar only); RV1 (H1): its line with the action's, never in the meal's
    let best = null;
    for (const [id, [cooked, raw]] of Object.entries(FOOD)) {
        if (!(g.inventory[id] > 0)) continue;
        const v = fire ? cooked : raw;
        if (!best || v > best.v) best = { id, v };
    }
    if (!best) return [];
    addItem(g, best.id, -1);
    eat(g, best.v);
    return [`You eat: ${FOOD_NAMES[best.id] || best.id}${fire && FOOD[best.id][0] !== FOOD[best.id][1] ? ', cooked' : ''}. +${best.v} satiety.`];
}
export const FOOD_NAMES = {
    hare_raw: 'glassback hare', fowl_raw: 'mire fowl', crab_meat: 'stone-shell crab', honeycomb: 'wild honeycomb',
    lizard_egg: 'thornback egg', jade_bracket: 'jade bracket fungus', river_cress: 'river cress', crimson_berry: 'needleberries', venison: 'ash-deer venison',
    smoked_meat: 'smoked meat', dried_bracket: 'dried bracket',
};
/* ---------- v0.11.209 (owner pick TF1, roadmap-time.md TS4): food that spoils and food that keeps, long calendar only ---------- */
/** D1 (Fable's texts): the spoil line ({food}: "2 glassback hare and 1 river cress"), the card, its lines at camp and in the village. */
export const SPOIL_LINE = 'Spoiled: {food}. The hammerspace folds space. It does not, it turns out, fold time.';
export const PRESERVE_LABEL = 'Smoke the catch.';
export const PRESERVE_CAMP = 'You build the fire low and the smoke thick, and hang the catch over it. Yuki supervises from wherever the smoke isn\'t.';
export const PRESERVE_VILLAGE = 'You are given a place at Ashfall\'s smoking racks. The woman who keeps them watches your hands throughout, finds nothing to correct, and nods as if signing a treaty.';
const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
/** RV1 (L1): the spoil line's names, one and more. */
export const SPOIL_NAMES = { hare_raw: ['glassback hare', 'glassback hares'], fowl_raw: ['mire fowl', 'mire fowl'], crab_meat: ['stone-shell crab', 'stone-shell crabs'], river_cress: ['river cress', 'river cress'], crimson_berry: ['needleberry', 'needleberries'], jade_bracket: ['jade bracket', 'jade brackets'], lizard_egg: ['thornback egg', 'thornback eggs'] };
foodHooks.spoilLine = (gone) => SPOIL_LINE.replace('{food}', andList(gone.map(([id, n]) => `${n} ${(SPOIL_NAMES[id] || [FOOD_NAMES[id] || id, FOOD_NAMES[id] || id])[n === 1 ? 0 : 1]}`)));
/** What each raw food is smoked or dried into (K). */
export const PRESERVE = { hare_raw: 'smoked_meat', fowl_raw: 'smoked_meat', crab_meat: 'smoked_meat', jade_bracket: 'dried_bracket' };
/** Minutes of work a piece. */
export const PRESERVE_MIN = 15;
/** The pieces the card would smoke or dry now: [[raw id, pieces], …] (a kept food's room up to its cap counted). */
export function preservePlan(g) {
    const room = {}, out = [];
    for (const [id, to] of Object.entries(PRESERVE)) {
        if (room[to] == null) room[to] = Math.max(0, itemCap(to) - (g.inventory[to] || 0));
        const n = Math.min(Math.max(0, (g.inventory[id] || 0) - freshDue(g, id)), room[to]);
        if (n > 0) { out.push([id, n]); room[to] -= n; }
    }
    return out;
}
export const preservable = (g) => preservePlan(g).reduce((a, [, n]) => a + n, 0);
/** K: the hub card "Smoke the catch." (the four stays; the camp only with its fire): 15 minutes a piece, every piece it can take. */
export function preserveChoice(hubId, { camp = false } = {}) {
    return {
        text: PRESERVE_LABEL, preserve: true,
        show: (g) => longCal(g) && (!camp || hubId !== 'wilds' || !!g.flags.fire) && preservable(g) > 0,
        minutes: (g) => preservable(g) * PRESERVE_MIN,
        do: (g) => {
            spoilFresh(g); const plan = preservePlan(g), got = {}; // what has turned first: the card counted without it
            for (const [id, n] of plan) { addItem(g, id, -n); addItem(g, PRESERVE[id], n); got[PRESERVE[id]] = (got[PRESERVE[id]] || 0) + n; }
            const n = plan.reduce((a, [, k]) => a + k, 0);
            const gotLine = Object.entries(got).map(([id, k]) => `+${k} ${NEW_ITEMS[id]?.name || id}`).join(', ');
            return [camp ? PRESERVE_CAMP : PRESERVE_VILLAGE, `${gotLine}.`, ...advance(g, n * PRESERVE_MIN)];
        },
        to: hubId,
    };
}
export function pantry(g) {
    const bits = Object.keys(FOOD).filter((k) => g.inventory[k] > 0).map((k) => `${g.inventory[k]} ${FOOD_NAMES[k]}`);
    return bits.length ? `In the hammerspace: ${bits.join(', ')}.` : 'The hammerspace holds no food. Infinite space, zero snacks.';
}

export const NEW_ITEMS = {
    fowl_raw: { name: 'Mire fowl (dressed)', note: 'Tastes like duck that has seen things.' },
    crab_meat: { name: 'Stone-shell crab meat', note: 'Sweet. Worth the needle.' },
    honeycomb: { name: 'Wild honeycomb', note: 'Black honey. The bees were very much against this.' },
    lizard_egg: { name: 'Thornback egg', note: 'Leathery shell, enormous yolk, zero regrets.' },
    river_cress: { name: 'River cress', note: 'Peppery. The only green thing here that isn\'t trying anything.' },
    venison: { name: 'Ash-deer venison', note: 'Lean, dark, smoked by the village.' },
    ghost_gill: { name: 'Ghost-gill', note: 'A pale mire fungus that knits flesh. Chew one: +8 HP.' },
    bone_meal: { name: 'Giant\'s bone-meal', note: 'From the Bone Field. Your stakes come out harder with it.' },
    crow_feather: { name: 'Rot-crow feathers', note: 'Smell exactly how they look.' },
    lizard_spine: { name: 'Thornback spines', note: 'Hollow and sharp. Good needles, if you didn\'t grow your own.' },
    sect_token: { name: 'Gao Feng\'s jade token', note: 'Faintly warm. Faintly watching.' },
    smoked_meat: { name: 'Smoked meat', note: 'Hare, fowl or crab. The smoke has settled the question.' }, // v0.11.209 (TF1, D1: Fable's)
    dried_bracket: { name: 'Dried bracket', note: 'Chews like a bootlace and will outlast one.' },
};
