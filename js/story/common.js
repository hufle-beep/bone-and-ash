/** Shared story helpers: flags, days, food, and how enemies grow with the days James spends training. */
import { clockParts, addItem, eat, isNoDice, wakeDay } from '../core/game.js';

export const once = (flag) => (g) => !g.flags[flag];
export const set = (...flags) => (g) => { for (const f of flags) g.flags[f] = true; return []; };
export const day = (g) => clockParts(g.minutes).day;
export const hour = (g) => clockParts(g.minutes).hh;
/** Available once per in-game day. */
/** A once-a-day test; `dailyKey` lets the task screen show it as "back tomorrow" (v0.9.0). */
/** v0.11.18: in Incremental Mode a "day" for these is a waking day (back after sleep or a push), not the calendar. */
export const dayKey = (g) => (isNoDice() ? wakeDay(g) : day(g));
export const DAILY_KEYS = new Set();
export const daily = (key) => { DAILY_KEYS.add(key); return Object.assign((g) => !g.flags[`${key}@${dayKey(g)}`], { dailyKey: key }); };
export const markDaily = (g, key) => { DAILY_KEYS.add(key); g.flags[`${key}@${dayKey(g)}`] = true; };
export const anyDailyDone = (g) => { const d = dayKey(g); for (const k of DAILY_KEYS) if (g.flags[`${k}@${d}`]) return true; return false; };

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
};
export const foodCount = (g) => Object.keys(FOOD).reduce((n, k) => n + (g.inventory[k] || 0), 0);
/** Eat the most filling thing in the hammerspace (cooked if there's a fire). */
export function eatBest(g, { fire = !!g.flags.fire } = {}) {
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
const FOOD_NAMES = {
    hare_raw: 'glassback hare', fowl_raw: 'mire fowl', crab_meat: 'stone-shell crab', honeycomb: 'wild honeycomb',
    lizard_egg: 'thornback egg', jade_bracket: 'jade bracket fungus', river_cress: 'river cress', crimson_berry: 'needleberries', venison: 'ash-deer venison',
};
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
};
