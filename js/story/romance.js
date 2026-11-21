/**
 * Bone and Ash — romance, group f's first push (v0.11.249, owner pick P19-A; `project/research/p19-measure.md`, `claude/p19-options.md`).
 *  TB, the tier beats: when Mei Lin's affection reaches the kiss tier (30) or liked (72), or Ya's hers (45) or liked (72), the next
 *     carrier James reaches gets one closing paragraph, once a Coil (the flags `tb_mei30`, `tb_mei72`, `tb_ya45`, `tb_ya72`; reset with
 *     the Coil like every story flag). Mei Lin's carriers are the village supper and the Blackroot camp; Ya's the Blackroot camp, the
 *     Fallout's loft night once she has been met, and the camp inside the Old Tree (MC-A, the owner 20:03: with GT1 the tiers come later;
 *     a tier with no text at a carrier waits for the next). Two tiers due at once: Mei Lin's first, the lower first, one a carrier a day
 *     (story order). RV-A (the owner 20:37, the cold reviews): a first-move tier (30 / 45) is passed over once that romance has happened;
 *     no beat in the tribute's week at supper, under a lovers' Fallout night, or under a camp text that puts Ya away from the fire.
 *  RL, the remembered line: on a Coil after one in which Mei Lin's affection reached 30 (or she kissed him), the first of `evening2`
 *     (the eve of the tribute) or `talk_mei` (the Blackroot) James reaches that Coil closes on what he remembers and she does not
 *     (the flag `rl_mei`, once a Coil). The record `g.coil.mrl` (the Coil she first got there; coil.js sets it at the rewind) and
 *     `g.coil.rlc` (how many times each carrier has shown it: its first, second, third text and on) are kept across Coils; both are
 *     new, so older code ignores them.
 *  AL, the eve's "sleep alone": `fo_last_night`, with both women liking him, gets the fourth way out its other branches have.
 * A beat or line shows on the visit that set its flag: the flag holds the minute of that visit (the scene's enter), and the text
 * reads it, so a redraw keeps it and a later visit does not. v0.11.250 (RV-A, VS; the cold review's C H1 + M1): against the visit's
 * minute kept in `g.cv` (carrier → the minute of its last enter; new, additive), not the clock: `choose` adds a choice's default time
 * after the enter, so before it Ya's echo, the eve's remembered line and Ya's Fallout beats were marked and never shown.
 * Texts by Fable (rule 10), in romance_texts.js.
 * v0.11.250 (owner pick P20-A; `project/research/p20-measure.md`, `claude/p20-options.md`):
 *  DP, the decision point remembers: `rt_evening` gets one paragraph, after "Nobody mentions tomorrow.", for the first earlier
 *     choice that applies (`DP_ORDER`): Ya's night (`ya_romance`, while she likes him), Mei Lin's embers (`mei_bond`, while she likes
 *     him), the hot spring (the flag `dp_spring`: 'in' or 'watch'), the roof (the flag `dp_roof`). Both flags new, set by the choice
 *     (story flags: reset with the Coil); older code ignores them.
 *  EC, the echo scenes: once a save, on Coil 3 or later, the first meeting (`mei_lin`, `ya_meets`) closes on what James knows and she
 *     does not, when he met her on an earlier Coil (`g.seen`). The record `g.coil.ec` (scene → { n: the Coil, m: the visit's minute })
 *     is kept across every Coil and into Act 1 (game.js `startActCoil`); new, so older code ignores it.
 */
import { rel, KISS_MEI, KISS_YA, LIKES_BAR, likesMei, likesYa } from './act1_common.js';
import { dayIndex } from '../core/lines.js';
import { byForm } from './common.js';
import { TB_TEXT, RL_TEXT, AL_TEXT, DP_TEXT, EC_TEXT } from './romance_texts.js';

/** v0.11.250 (RV-A, VS): the visit stamp; `on: false` gives v0.11.249's minute stamp (the tests from before pin their runs with it). */
export const VISIT_STAMP = { on: true };
const visitOf = (g, id) => (VISIT_STAMP.on ? g.cv?.[id] : g.minutes);

/** The tiers, in story order (the lower first for each person). */
export const TIERS = [
    { flag: 'tb_mei30', who: 'Mei Lin', bar: KISS_MEI, key: 'mei30' },
    { flag: 'tb_mei72', who: 'Mei Lin', bar: LIKES_BAR, key: 'mei72' },
    { flag: 'tb_ya45', who: 'Ya', bar: KISS_YA, key: 'ya45' },
    { flag: 'tb_ya72', who: 'Ya', bar: LIKES_BAR, key: 'ya72' },
];
/** The carriers: whose beats each takes, and the text's place key (romance_texts.js). */
export const TB_CARRIERS = {
    supper: { who: ['Mei Lin'], at: '', when: (g) => (g.flags.vday || 0) < 3 }, // RV-A (T L1): not in the tribute's week ("nothing in this house is looked at")
    bl_camp: { who: ['Mei Lin', 'Ya'], at: 'camp', when: (g) => !campAway(g) }, // MC-A (MB): Mei Lin's too, once GT1 moves her tiers into Act 1; RV-A (T M3)
    fo_night: { who: ['Ya'], at: 'night', when: (g) => !!g.flags.ya_met && !g.flags.romance }, // RV-A (T M2): not under the lovers' paragraph
    heart_camp: { who: ['Ya'], at: 'tree' }, // MC-A (HC): Ya's liked, past the Blackroot
};
/** RV-A (T M3): the camp texts that put Ya away from the fire (act1_blackroot.js BL_*_CAMP by index; the Drowned Wood's 4th is its story
 *  night): no beat under them; it waits for the next camp. The tests pin that each still does. */
export const CAMP_AWAY = { rr: [3], dw: [3], ah: [2] };
const CAMP_LEN = { rr: 5, dw: 4, ah: 5 };
export function campAway(g) {
    const r = g.flags.bl_region || 'rr';
    return (CAMP_AWAY[r] || []).includes(dayIndex(g, `bl_camp:${r}`) % CAMP_LEN[r]);
}
/** RV-A (T H1): a person's romance has happened (the kiss, the night, the three): their first-move tier (30 / 45) is passed over. */
const ROMANCED = { 'Mei Lin': (g) => !!(g.flags.romance || g.flags.throuple), Ya: (g) => !!(g.flags.ya_romance || g.flags.throuple || g.flags.fo_pick === 'ya') };
const tbKey = (t, id) => (TB_CARRIERS[id].at ? `${t.key}:${TB_CARRIERS[id].at}` : t.key);
/** The tier due at carrier `id` now (affection at the bar, its flag not yet set, a text for it at this carrier), or null. */
export function tierDue(g, id) {
    const c = TB_CARRIERS[id];
    if (!c || (c.when && !c.when(g))) return null;
    return TIERS.find((t) => c.who.includes(t.who) && !g.flags[t.flag] && rel(g, t.who).a >= t.bar && !!TB_TEXT[tbKey(t, id)]) || null;
}
/** The carrier's visit: pass over a first-move tier whose romance has happened (its flag set to -1: done, never shown); then, unless a
 *  beat of this carrier already showed today (RV-A, C M1 + L1: a 0-minute round trip, a re-entry the same evening), mark the tier due. */
function markTier(g, id) {
    const c = TB_CARRIERS[id];
    for (const t of TIERS) if (t.bar < LIKES_BAR && !g.flags[t.flag] && ROMANCED[t.who](g)) g.flags[t.flag] = -1;
    const today = Math.floor((g.minutes || 0) / 1440);
    if (TIERS.some((t) => c.who.includes(t.who) && g.flags[t.flag] > 0 && Math.floor(g.flags[t.flag] / 1440) === today)) return;
    const t = tierDue(g, id);
    if (t) g.flags[t.flag] = g.minutes;
}
const formed = (g, x) => (x && typeof x === 'object' ? byForm(g, x.cat, x.great, x.human) : x || '');
/** The beat this visit shows at carrier `id` (its text), or ''. */
export function tierBeat(g, id) {
    if (!TB_CARRIERS[id]) return '';
    const t = TIERS.find((x) => TB_CARRIERS[id].who.includes(x.who) && g.flags[x.flag] > 0 && g.flags[x.flag] === visitOf(g, id)); // RV-A (VS; C M1): this visit's, not this minute's (a choice's time is added after the enter)
    return t ? formed(g, TB_TEXT[tbKey(t, id)]) : '';
}

/** RL: the carriers, in story order. */
export const RL_CARRIERS = ['evening2', 'talk_mei'];
export const RL_BAR = KISS_MEI;
/** Is the remembered line due at carrier `id` now? */
export const rememberDue = (g, id) => RL_CARRIERS.includes(id) && g.coil?.mrl != null && g.coil.mrl < (g.coil.n || 1) && !g.flags.rl_mei; // RV-A (C L5): an earlier Coil's
export function rememberLine(g, id) {
    if (!RL_CARRIERS.includes(id) || g.flags.rl_mei !== visitOf(g, id) || g.flags.rl_at !== id) return '';
    const L = RL_TEXT[id] || [];
    const n = Math.max(1, Number(g.coil?.rlc?.[id]) || 1);
    return formed(g, L[Math.min(n, L.length) - 1]);
}

/** DP: the earlier choices, in the order the one line is picked. */
export const DP_ORDER = [
    ['hand', (g) => !!g.flags.ya_romance && likesYa(g)],
    ['bond', (g) => !!g.flags.mei_bond && likesMei(g)],
    ['spring_in', (g) => g.flags.dp_spring === 'in'],
    ['spring_watch', (g) => g.flags.dp_spring === 'watch'],
    ['roof', (g) => !!g.flags.dp_roof],
];
export const dpKey = (g) => DP_ORDER.find(([, f]) => f(g))?.[0] || null;
export const DP_AFTER = 'Nobody mentions tomorrow. Everybody thinks about it.';
/** EC: the first meetings that carry an echo, and the Coil it starts on. */
export const EC_SCENES = ['mei_lin', 'ya_meets'];
export const EC_COIL = 3;
export const echoDue = (g, id) => EC_SCENES.includes(id) && (g.coil?.n || 1) >= EC_COIL && g.seen?.[id] != null && g.seen[id] < (g.coil?.n || 1) && !(g.coil?.ec && g.coil.ec[id]);
export function echoLine(g, id) {
    const r = g.coil?.ec?.[id];
    return r && r.n === (g.coil?.n || 1) && r.m === visitOf(g, id) ? EC_TEXT[id] || '' : '';
}

/** Append a closing paragraph to a scene's text, and run `mark` after its enter. */
function closing(SCENES, id, mark, fn) {
    const s = SCENES[id];
    if (!s) throw new Error(`romance.js: no scene ${id}`);
    const text = s.text, enter = s.enter;
    s.enter = (g) => { const out = enter ? (enter(g) || []) : []; if (VISIT_STAMP.on) { if (!g.cv || typeof g.cv !== 'object') g.cv = {}; g.cv[id] = g.minutes; } mark(g); return out; }; // v0.11.250 (P20-A RV-A, VS): the visit's minute, kept until the next visit
    s.text = (g) => { const t = typeof text === 'function' ? text(g) : text; const b = fn(g); return b ? `${t}\n\n${b}` : t; };
}

export function installRomance(SCENES) {
    for (const id of Object.keys(TB_CARRIERS)) {
        closing(SCENES, id, (g) => markTier(g, id), (g) => tierBeat(g, id));
    }
    for (const id of RL_CARRIERS) {
        closing(SCENES, id, (g) => {
            if (!rememberDue(g, id)) return;
            g.flags.rl_mei = g.minutes; g.flags.rl_at = id;
            const c = g.coil.rlc && typeof g.coil.rlc === 'object' ? g.coil.rlc : (g.coil.rlc = {});
            c[id] = (Number(c[id]) || 0) + 1;
        }, (g) => rememberLine(g, id));
    }
    // DP: the two choices noted (their `do` kept), and the line after the evening's second paragraph
    const wrapDo = (sc, re, f) => { const c = SCENES[sc]?.choices?.find((x) => re.test(String(typeof x.text === 'function' ? '' : x.text))); if (!c) throw new Error(`romance.js: no choice ${re} on ${sc}`); const d = c.do; c.do = (g) => { f(g); return d ? d(g) : []; }; };
    wrapDo('supper', /^Climb out onto the roof with Mei Lin/, (g) => { g.flags.dp_roof = true; });
    wrapDo('hot_spring', /^Get in\./, (g) => { g.flags.dp_spring = 'in'; });
    wrapDo('hot_spring', /^Turn your back and keep watch\./, (g) => { g.flags.dp_spring = 'watch'; });
    const ev = SCENES.rt_evening;
    if (!ev) throw new Error('romance.js: no rt_evening');
    const evText = ev.text;
    ev.text = (g) => { const t = typeof evText === 'function' ? evText(g) : evText; const k = dpKey(g); return k && DP_TEXT[k] && t.includes(DP_AFTER) ? t.replace(DP_AFTER, `${DP_AFTER}\n\n${DP_TEXT[k]}`) : t; };
    // EC
    for (const id of EC_SCENES) {
        closing(SCENES, id, (g) => {
            if (!echoDue(g, id)) return;
            const e = g.coil.ec && typeof g.coil.ec === 'object' ? g.coil.ec : (g.coil.ec = {});
            e[id] = { n: g.coil.n || 1, m: g.minutes };
        }, (g) => echoLine(g, id));
    }
    // AL: last, so saved choice positions keep their lines
    const eve = SCENES.fo_last_night;
    if (!eve) throw new Error('romance.js: no fo_last_night');
    eve.choices.push({ text: AL_TEXT.label, show: (g) => likesMei(g) && likesYa(g), do: () => [AL_TEXT.result], to: 'fo_depart' });
}
