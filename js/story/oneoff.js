/**
 * v0.11.33 (owner 13:34–13:40, picks B + F1 + T1 + S1): the task screens' one-off work. Incremental Mode only; Story Mode
 * and the Long Forest keep their rules.
 * - ONCE_MENUS: every work choice in these menus once per Coil (world flag `oo:<menu>#<i>`; a rewind resets the world, so
 *   it comes back on the next Coil). The menu's daily gate stays (B: at most one per menu per day). Only a success
 *   counts: a failed (or a partial, empty-handed) try can be made again (owner 14:05).
 * - ONCE_STAGES: progressive door scenes (Wen's lessons, the herb slopes): that many visits per Coil (`oo:<scene>`), daily stays.
 * - Repeatable as before: hunts, self-training, foraging (F1), Cultivate, Meditate, rest, eating; talks one each per day (T1).
 * - S1: "Call it a day" on the hubs with a set evening, from 04:00, once nothing but repeatable work is open there
 *   (`oneOffLeft`): the clock to the evening hour at once, as rest; the evening exit then shows as usual.
 */
import { isNoDice, advance, clockParts } from '../core/game.js';
import { TASK_HUBS } from './task_hubs.js';
import { setOnChoose } from '../core/story.js';

export const ONCE_MENUS = new Set(['clinic', 'workshop', 'drill', 'fo_palisade', 'fo_council', 'fo_drill', 'fo_clinic', 'rr_scout']);
export const ONCE_STAGES = { wen_lesson: 2, herb_slopes: 2 };
/** Doors that stay repeatable (hunts, talks, training, the spring): they never hold "Call it a day" back. */
const REPEAT_DOORS = new Set(['far_hunt', 'rr_hunt', 'dw_hunt', 'ah_hunt', 'talk_mei', 'talk_ya', 'fo_mei', 'fo_ya_time', 'bl_train', 'heart_spring']);
/** Menus that stay repeatable (foraging, hunting, practice): they never hold "Call it a day" back. */
const REPEAT_MENUS = new Set(['wild_forage', 'wild_hunt', 'wild_train', 'rr_forage', 'dw_forage', 'ah_forage']);
/** The hubs with a set evening (the hour their evening exit shows). */
export const EVENING_HOUR = { wilds: 15, ashfall: 16, fo_ashfall: 16, rr_hub: 16, dw_hub: 16, ah_hub: 16, heart_hub: 16, rt_ashfall: 15 };

export const onceKey = (scene, i) => `oo:${scene}#${i}`;
const isWork = (c) => !!c && (!!c.check || c.time != null);
/** Is this menu choice still open this Coil? (always in Story Mode) */
export const onceOpen = (g, scene, i) => !isNoDice() || !ONCE_MENUS.has(scene) || !g.flags[onceKey(scene, i)];
/** Visits left this Coil to a staged door scene. */
export const stageOpen = (g, to) => !isNoDice() || !ONCE_STAGES[to] || (g.flags[`oo:${to}`] || 0) < ONCE_STAGES[to];

/** Record a choice taken (story.js choose, tasks.js resolveWork): a once-menu's work choice, a visit to a staged scene. */
export function noteOnce(g, sceneId, index, c) {
    if (!isNoDice() || !c) return;
    if (ONCE_MENUS.has(sceneId) && isWork(c)) g.flags[onceKey(sceneId, index)] = true;
    const to = typeof c.to === 'string' ? c.to : null;
    if (to && ONCE_STAGES[to]) g.flags[`oo:${to}`] = (g.flags[`oo:${to}`] || 0) + 1;
}

const toHour = (g, h) => { const p = clockParts(g.minutes); const at = (p.day - 1) * 1440 + h * 60; return at > g.minutes ? advance(g, at - g.minutes, { resting: true }) : []; };
const hourOf = (g) => clockParts(g.minutes).hh;

const META = /meridians|yuki_form|col_warn|ns_warn|breakthrough|btTarget/;
/**
 * Anything still open on this hub that "Call it a day" would skip past: a once-menu work choice, a staged door, a one-time
 * door or place, another one-time menu (Ashfall's last-day militia), a checked chore (the palisade), or a story stop
 * leading on (the root galleries). Repeatable work, talks, chores without a check and the meta entries don't count.
 */
export function oneOffLeft(g, scenes, hubId) {
    const cfg = TASK_HUBS[hubId];
    const s = scenes[hubId];
    const shows = (c) => !c.show || c.show(g);
    const menus = { ...(cfg.menus || {}), ...(cfg.doorMenus || {}) };
    for (const c of s.choices) {
        if (/^Call it a day/.test(String(c.text)) || !shows(c)) continue;
        if (c.to === hubId) { if (c.check) return true; continue; } // a chore: only a checked one is one-off work
        if (typeof c.to !== 'string') { if (!META.test(String(c.to))) return true; continue; }
        if (META.test(c.to) || scenes[c.to]?.end) continue;
        if (ONCE_MENUS.has(c.to)) { if (scenes[c.to].choices.some((x, i) => isWork(x) && onceOpen(g, c.to, i) && shows(x))) return true; continue; }
        if ((cfg.doorMenus || {})[c.to]) { if (scenes[c.to].choices.some((x) => typeof x.to === 'string' && x.to !== hubId && shows(x))) return true; continue; }
        if (menus[c.to]) { if (!REPEAT_MENUS.has(c.to)) return true; continue; }
        if (REPEAT_DOORS.has(c.to)) continue;
        return true; // a one-time door, or a story stop leading on
    }
    return false;
}

/** Install "Call it a day" on the hubs with a set evening (Incremental Mode only). */
export function installOnce(scenes) {
    setOnChoose(noteOnce);
    for (const s of Object.values(scenes)) for (const c of s.choices || []) {
        if (typeof c.to !== 'string' || !ONCE_STAGES[c.to] || c.stageWrapped) continue;
        const o = c.show;
        c.show = Object.assign((g) => stageOpen(g, c.to) && (!o || o(g)), o?.dailyKey ? { dailyKey: o.dailyKey } : {});
        c.stageWrapped = true;
    }
    for (const [hubId, h] of Object.entries(EVENING_HOUR)) {
        const s = scenes[hubId];
        if (!s) continue;
        const evening = s.choices.slice();
        // a choice hidden now that shows at the evening hour is the evening exit
        const exitAt = (g) => { const at = { ...g, minutes: (clockParts(g.minutes).day - 1) * 1440 + h * 60, wake: g.wake && { ...g.wake } }; /* its own wake: wakeState writes to it */ return evening.some((c) => c.show && !c.show(g) && c.show(at)); };
        s.choices.push({
            text: 'Call it a day. Nothing here needs you before evening.',
            show: (g) => isNoDice() && hourOf(g) >= 4 && hourOf(g) < h && !oneOffLeft(g, scenes, hubId) && exitAt(g),
            do: (g) => toHour(g, h),
            to: hubId,
        });
    }
}
