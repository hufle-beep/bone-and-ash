/**
 * Bone and Ash — James's music and his archive (v0.11.182; owner picks CB1, DF1; group e's CM, push 2; texts by Fable, rule 10,
 * in music_texts.js; the owner's notes of 2026-11-13, word for word in `lore.md`).
 *  - ML: at most one line a text day (lines.js `textDay`, from 05:00), under the text of the day's first evening screen
 *    (MUSIC_SCREENS: suppers, camps, quiet nights; never a hunt, a fight or a romance night), from 15:00. Not the prologue's
 *    supper or the sunset walk (W1): the roof and the third supper, with music lines of their own, follow them the same evening;
 *    nor Yuki's walk past the firelight (RV1, M3: a romance night). A line marked `singing` only while the guardian sings (M2). main.js draws it under
 *    the prose (folded or not) and it is the same on every redraw of that visit; a later visit the same day shows none. The
 *    screens and scenes that already carry a music line of their own (OWN_MUSIC: the third supper, the roof, the Blackroot's
 *    spring, the last camp, the stranger) use up their day instead.
 *  - AR: one text day in four (by the save's seed, the Coil and the day) the archive's pool comes first (a book, film, game or
 *    clip); either pool stands in when the other has nothing open.
 *  - MR: a reaction line opens only where its person is (MUSIC_SCREENS' place; Mei Lin and Ya on the journey once in the party)
 *    and in its friendship step (STEPS: low below 30, mid 30–79, high 80 and up; the neighbour by the village's).
 *  - PC: each stretch has its own pools (the references paced by stretch, the table in music_texts.js); in Act 1 a line opens on
 *    the act's Coil `from` (lines.js `actCoil`: 0 the first, 1 the second, 2 the third and on), and a line opening on this
 *    Coil comes first (`spec`).
 *  - The lines and their counts live in the save's `lines` record (lines.js; reset with every Coil): `mu` { d: day, i: index or
 *    -1, k: pool, s: stretch, at: the screen it was drawn on }. No new save field, flag or id; no gain, time or check.
 */
import { linesOf, pickLine, textDay, coilStamp, actCoil } from '../core/lines.js';
import { fnv1a } from '../core/game.js';
import { hour } from './common.js';
import { fillRefs } from '../core/edition.js';
import { MUSIC_LINES, MUSIC_REFS } from './music_texts.js';
import { readOpen } from './reading.js'; // RS1 (RS-M)

export { MUSIC_LINES, MUSIC_REFS };
export const MUSIC_FROM = 15; // the hour from which a line shows
/** The screens a line shows under: [stretch, place]. */
export const MUSIC_SCREENS = {
    camp: ['wilds', 'any'], night: ['wilds', 'any'],
    evening: ['ashfall', 'house'], evening2: ['ashfall', 'lamp'], supper_roof: ['ashfall', 'roof'], village_night: ['ashfall', 'loft'],
    fo_supper: ['fallout', 'house'], fo_night: ['fallout', 'loft'], fo_last_night: ['fallout', 'loft'],
    bl_camp: ['journey', 'camp'], bl_fireside: ['journey', 'camp'], bl_night: ['journey', 'camp'], heart_camp: ['journey', 'tree'], heart_night: ['journey', 'tree'], rt_camp: ['journey', 'camp'], rt_fire_talk: ['journey', 'camp'],
    rt_evening: ['return', 'house'], rt_quiet_night: ['return', 'stove'],
};
/** The music lines already in the game's own texts (the five of v0.11.181): a screen showing one uses up the day. */
export const OWN_MUSIC = /music from your (forearm|sleeve)|forearm has been playing|arm is playing low|omnitool plays low/i;
/** RS1 (RS-M): the reading to Ya is the day's line; the Heart's camp shows none while it can still be chosen. */
export const DAY_USED = new Set(['heart_read']);
export const DEFER = { heart_camp: readOpen };
/** Who is there, by stretch and place (Yuki everywhere). */
const PEOPLE = {
    'ashfall:house': ['mei'], 'ashfall:lamp': ['mei'], // RV1 (M1): who is there at the end of the screen (the mother has gone to bed)
    'fallout:house': ['mother', 'mei', 'neighbour'],
    'return:house': ['mother', 'mei', 'ya'],
};
const REL = { mei: 'Mei Lin', ya: 'Ya', mother: 'Mother', neighbour: 'Village', yuki: 'Yuki' };
export const STEPS = { low: [-Infinity, 30], mid: [30, 80], high: [80, Infinity] };
export function present(g, stretch, place, who) {
    if (who === 'yuki') return true;
    if (stretch === 'journey') return (who === 'mei' && !!g.flags.mei_party) || (who === 'ya' && !!g.flags.ya_party);
    return (PEOPLE[`${stretch}:${place}`] || []).includes(who);
}
const relF = (g, who) => g.rel?.[REL[who]]?.f || 0;
/** RV1 (M2): the guardian's song behind the bone door is heard from the log until it is calmed (after the crawl it sings on). */
export const singing = (g) => !!g.flags.log_heard && (!g.flags.guardian || g.flags.guardian === 'lost');
/** A line can show here and now: its place, its Coil, its person and step. */
export function lineOpen(g, x, stretch, place) {
    if (x.place !== 'any' && x.place !== place) return false;
    if (x.singing && !singing(g)) return false; // RV1 (M2): the singing behind the door, while it lasts
    if ((g.coil?.act || 0) === 1 && (x.from || 0) > actCoil(g)) return false;
    if (x.who && x.who !== '-') {
        if (!present(g, stretch, place, x.who)) return false;
        const s = STEPS[x.step];
        if (s) { const f = relF(g, x.who); if (f < s[0] || f >= s[1]) return false; }
    }
    return true;
}
const isRec = (r) => !!r && typeof r === 'object' && !Array.isArray(r);
/** The archive's day: one text day in four, by the save's seed, the Coil and the day. */
export const archiveDay = (g, d = textDay(g)) => parseInt(fnv1a(`${g.seed >>> 0}#mu#${coilStamp(g)}#${d}`), 16) % 4 === 0;
const lineText = (stretch, k, i) => MUSIC_LINES[stretch]?.[k]?.[i]?.text;

/**
 * The line under this screen, or null: { text, key }. `v` the scene view ({ id, text }). Notes the day's pick in the save's
 * `lines` record; call it once per draw (main.js proseHtml, after againView, which notes the visit).
 */
export function musicLine(g, v, { newVisit = true } = {}) {
    const id = v?.id || g.scene;
    const L = linesOf(g);
    const d = textDay(g);
    const m = isRec(L.mu) ? L.mu : null;
    if (m && m.d === d) {
        // the visit that drew it, or (RV1, L1) the same visit back from a form change, a breakthrough or a door card (again.js: newVisit false)
        const same = m.i >= 0 && m.at === id && (L.cur.mu === id || newVisit === false);
        const t = same ? lineText(m.s, m.k, m.i) : null;
        if (t) L.cur.mu = id;
        return t ? { text: fillRefs(t, MUSIC_REFS), key: `${m.s}.${m.k}.${m.i}` } : null;
    }
    if (OWN_MUSIC.test(v?.text || '') || DAY_USED.has(id)) { L.mu = { d, i: -1 }; return null; } // its own line is the day's
    if (DEFER[id] && DEFER[id](g)) return null; // RS1 (RS-M): the camp waits while the reading is open
    const at = MUSIC_SCREENS[id];
    if (!at || hour(g) < MUSIC_FROM) return null;
    const [stretch, place] = at;
    const pools = MUSIC_LINES[stretch];
    if (!pools) return null;
    const ac = actCoil(g), a1 = (g.coil?.act || 0) === 1;
    for (const k of archiveDay(g, d) ? ['archive', 'music'] : ['music', 'archive']) {
        const list = pools[k] || [];
        const items = list.map((x) => ({ when: (gg) => lineOpen(gg, x, stretch, place), spec: a1 && (x.from || 0) > 0 && (x.from || 0) === ac ? 1 : 0 }));
        if (!items.some((it) => it.when(g))) continue;
        const i = pickLine(g, `mu:${stretch}:${k}`, items);
        if (i < 0) continue;
        L.mu = { d, i, k, s: stretch, at: id };
        L.cur.mu = id;
        return { text: fillRefs(list[i].text, MUSIC_REFS), key: `${stretch}.${k}.${i}` };
    }
    return null;
}

