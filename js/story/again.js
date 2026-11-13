/**
 * Bone and Ash — a scene read in an earlier Coil (v0.11.35, P1-a; owner 13:16 "the repetitions verbatim could make the game very
 * frustrating to some players", pick 15:42). Incremental Mode only (the only mode since v0.11.34).
 *  - The fold: the text folds to its first paragraph, with "Read it all again" (main.js).
 *  - A memory line on top, from James or Yuki (since v0.11.134 from the line picker, js/core/lines.js: one per visit; see below).
 *  - "Skip to the next choice": on a one-choice scene read before, walk the stretch at once. Every choice is taken with
 *    choose(), exactly as tapping through would take it (effects, clock, results); it stops at a real choice, a check, a fight,
 *    a task screen, a menu, an end, an unread scene or the Coil's own screens.
 * Uses `g.seen` (story.js noteSeen / seenBefore; kept across every rewind, coil.js).
 * v0.11.133 (owner pick FP2): and `g.read`, the paragraphs read (a hash of each → the Coil it was first shown; kept across every
 * rewind). A scene folds only when every paragraph of the text it shows now was read on an earlier Coil, so a text that changed
 * (Yuki's form, a path, an outcome, a rewrite) shows in full; the skip walks only such screens. main.js records what it shows
 * (noteRead). An old save starts with an empty record (owner pick FP2, ME): its scenes show in full once more, then fold.
 * v0.11.134 (owner pick LP2): the memory line comes from the line picker (js/core/lines.js, ML): every line once before any
 * comes back in a Coil, never the same twice running, the same line on every redraw of a visit. SV: a scene shown again with
 * the same text right after an action that kept you there folds too (no memory line; main.js passes the screen before).
 */
import { sceneView, choose, seenBefore, isMenuScene, isTimeless } from '../core/story.js';
import { fnv1a } from '../core/game.js';
import { TASK_HUBS } from './task_hubs.js';
import { noteVisit, visitLine, linesOf, textDay } from '../core/lines.js'; // v0.11.134 (LP2: PK, ML); v0.11.152 (RP1, SD): linesOf, textDay

/** Scenes whose text follows an outcome or a level that may differ from the read before (Fable review): never folded. */
export const OUTCOME_SCENES = new Set(['epilogue', 'fo_start', 'breakthrough', 'a1_again', 'a1_end', 'elder', 'bluff_fail']); // v0.11.131 (RC2, M1): bluff_fail reads the bluff's or the hairpin's text
/** The fold leaves these alone: the task screens and their menus (day-to-day state), the Coil's and the meta screens, the outcome scenes. */
export const noFold = (id) => !!TASK_HUBS[id] || isMenuScene(id) || isTimeless(id) || OUTCOME_SCENES.has(id);

export const MEMORY_LINES = [
    'You have done this before. You were not better at it.',
    'Yuki yawns at exactly the moment she yawned last time. She may be doing it on purpose.',
    'Parallel Cognition marks the paragraph as a rerun and offers to skip it. You let it.',
    'The forest has not rehearsed. You have.',
    '*Again?* says the bond. *I liked it better the first time. I was younger.*',
    'Déjà vu, except you can footnote it.',
    'You know how this goes. Knowing has never once made it go faster.',
    'Yuki looks at you as if you are about to say the same thing as last time. You are.',
    'Somewhere a thread of Parallel Cognition is taking notes on how bored you are. It underlines twice.',
    'Same sky, same smell, same you. Slightly better at the you part.',
    '*If you tell me what happens next,* says the bond, *I will bite you.*',
    'The world has no idea it is a repeat. You decide not to tell it.',
    'You catch yourself mouthing the next line before anyone says it.',
    'Yuki has already sat down where she sat down last time. She is a creature of very recent habit.',
    'There is a word for living the same day twice. You were a doctor of something else.',
    'Every detail exactly where you left it, which is either comforting or a diagnosis.',
    '*We were here,* says the bond. *You were worse at it. I was not.*',
    'The Coil turns. The scenery does not.',
    'You remember the end of this sentence. You let it finish anyway, out of manners.',
    'Yuki flicks an ear at the part she found boring last time. It is most of it.',
    'Your feet already know the way. The rest of you is catching up.',
    'Parallel Cognition offers a summary. It is three words long and two of them are rude.',
    '*Skip it,* says the bond. *I would. I am a cat. I skip everything.*',
    'Nothing here has changed except you, and you only a little.',
    'The loop hands back your days. It has never once handed back your temper.',
    'Some fungi fruit in the same spot every year. You are beginning to see their side of it.',
    'Your thesis took more drafts than this. Not many more, at the present rate.',
    '*Wake me,* says the bond, *when something happens that I have not already had an opinion about.*',
    'The Axiom returns you to things. It has never claimed to make them interesting.',
    'Foreknowledge, it turns out, is mostly a matter of knowing when to duck.',
    'One thread of Parallel Cognition has started keeping a tally. It will not say of what.',
    'You once sat through a lecture twice, out of politeness. This is the same skill.',
    'It is all as you left it. Nobody dusted.',
    '*You are about to be surprised,* says the bond. *Practise the face. Last time it convinced no one.*',
    'You and Yuki are the whole audience for this, and you wrote the review last time round.',
    'A second helping of something you did not order to begin with.',
    'Yuki\'s tail is keeping count of your visits here. It has stopped twitching and started tapping.',
    'Experiments are repeated to confirm a result. You confirm it: still this.',
    'You remembered this as shorter. Memory edits, apparently. The Coil does not.',
    'They say no one crosses the same river twice. They had not met this river.',
    '*Same again,* says the bond, *and you still have not brought anything to eat while we watch.*',
    'Your surprise was spent on the previous visit. You are running on the spare.',
    'Familiarity was supposed to breed contempt. So far it has bred a mild, accurate boredom.',
    'Parallel Cognition works out the odds that this goes differently, and hands you the result face down.',
    'The serpent ringing your forearm holds its tail in its teeth. You once took that for decoration.',
    '*I could tell it for you,* says the bond. *With voices. You would not come out of it well.*',
    'Old ground. You walk it as a landlord would, noting what has not been repaired.',
    'Yuki says nothing, pointedly. The bond carries the pointedness across undamaged.',
];

/** v0.11.134 (LP2, ML): this visit's memory line, from the picker (was: a hash of the scene and the Coil, 49.5% of Careful's
 *  lines a repeat within their Coil). */
const memoryLine = (g) => MEMORY_LINES[visitLine(g, 'mem', MEMORY_LINES)];

const parasOf = (t) => String(t).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** v0.11.133 (FP2): a paragraph's key in `g.read`: its FNV-1a hash in base 36 (5–7 characters). */
export const paraKey = (p) => parseInt(fnv1a(p), 16).toString(36);
/** v0.11.133 (RF1, M1; Fable's review): a paragraph that opens with the food stock (common.js `pantry`, on `bl_camp` among the
 *  scenes that fold) changes with every haul: it is neither recorded nor checked, so the scene folds as before FP2. */
export const STATE_PARA = /^(In the hammerspace:|The hammerspace holds no food)/;
const storyParas = (t) => parasOf(t).filter((p) => !STATE_PARA.test(p));
/** v0.11.133 (RF1, L2): a usable record is a plain object (not null, not an array). */
export const isRecord = (r) => !!r && typeof r === 'object' && !Array.isArray(r);
/** v0.11.133 (FP2): record a text's paragraphs as read on Coil `n` (this Coil by default); the first Coil is kept. */
export function noteRead(g, text, n = g?.coil?.n || 1) {
    if (!g || !text) return;
    if (!isRecord(g.read)) g.read = {};
    for (const p of storyParas(text)) { const k = paraKey(p); if (g.read[k] == null || g.read[k] > n) g.read[k] = n; }
}
/** v0.11.133 (FP2): every story paragraph of `text` was read on an earlier Coil. */
export function readBefore(g, text) {
    const n = g.coil?.n || 1, ps = storyParas(text), r = isRecord(g.read) ? g.read : {};
    return ps.length > 0 && ps.every((p) => { const c = r[paraKey(p)]; return c != null && c < n; });
}

/**
 * How the current scene's text shows: { fold, first, rest, memory, same }. `fold` on a scene read in an earlier Coil with more
 * than one paragraph (with a memory line), or (v0.11.134, SV; `same`) on one shown again with the same text right after an
 * action that kept you there (`prev`: the screen shown before that action, { id, text }; no memory line). `first` and `rest`
 * are text (paragraphs joined by a blank line), so main.js renders them as before. Every call notes the visit (lines.js).
 */
export function againView(g, v, prev = null) {
    const id = v?.id || g.scene;
    const before = linesOf(g).at; // RV1 (L1): the screen shown before this one
    const fresh = noteVisit(g, id);
    const newVisit = fresh && !(before && META_BACK(before)); // RV1 (L1): back from a meta screen is the same visit for "Read it all again" (L2)
    const sd = sameDayAgain(g, id, v, fresh); // v0.11.152 (owner pick RP1, SD); LB1 (owner 22:30): back from a meta screen or the breakthrough folds too (bots' repeated screens Sitter 1.1% → 0.1%, Cultivator 0.9% → 0.1%)
    const ps = parasOf(v?.text || '');
    const whole = { fold: false, first: v?.text || '', rest: '', memory: null, same: false, newVisit };
    if (noFold(id) || v?.end || ps.length < 2) return whole;
    const variant = g.lastWin && g.lastWin.next === id && g.lastWin.degree >= 2; // a lopsided win's own text (story.js): not the one read before
    if (seenBefore(g, id) && !variant && readBefore(g, v.text)) return { fold: true, first: ps[0], rest: ps.slice(1).join('\n\n'), memory: memoryLine(g), same: false, newVisit };
    if (prev && prev.id === id && prev.text === v.text) return { fold: true, first: ps[0], rest: ps.slice(1).join('\n\n'), memory: null, same: true, newVisit }; // SV
    if (sd) return { fold: true, first: ps[0], rest: ps.slice(1).join('\n\n'), memory: null, same: true, newVisit }; // SD
    return whole;
}

/**
 * v0.11.152 (owner pick RP1, SD; the owner's "no repeated texts", 2026-11-12): a scene entered again on the same day (a text day,
 * from 05:00) with the same text as its last visit that day folds to its first paragraph under "Read it all again", as SV does:
 * the road after each talk, the gate, the mire, the guardian after backing away, the camp after Yuki's scenes. Decided once per
 * visit (`fresh`, on its first draw; every redraw keeps it), recorded in the Coil's `lines` record as `sd` (scene → "day|text
 * hash"; reset with each Coil; an older version ignores it) and `sdFold` (the scene this visit folds, or null). The task screens,
 * menus, meta screens and outcome scenes never fold (noFold). RV1 (Fable's review): M1 the fold holds only while the text on
 * screen is still the one folded; L1 + LB1 back from a meta screen or the breakthrough folds but keeps "Read it all again" as it
 * was (META_BACK); L2 `newVisit` on the view tells main.js to shut "Read it all again". Measured before (200 games each, Careful / Completionist / Sitter /
 * Cultivator / Random): 1,875 / 1,617 / 1,267 / 2,090 / 3,785 screens shown again in full on their day.
 */
export function sameDayAgain(g, id, v, fresh) {
    if (!g || !id) return false;
    const L = linesOf(g);
    if (!isRecord(L.sd)) L.sd = {};
    const key = `${textDay(g)}|${paraKey(String(v?.text || ''))}`;
    if (fresh) L.sdFold = !noFold(id) && !v?.end && L.sd[id] === key ? { id, key } : null;
    L.sd[id] = key; // RV1 (M1): the text last shown today, after any change within the visit
    const f = L.sdFold;
    return !!f && typeof f === 'object' && f.id === id && f.key === key; // RV1 (M1, Fable's review): only while the text is still the one folded
}
/** RV1 (L1, Fable's review): screens a visit can step out to and come back from without leaving (the meta screens, the
 *  breakthrough): the scene after them keeps "Read it all again" as it was (L2); LB1 (owner 22:30): it still folds (SD). */
export const META_BACK = (id) => isTimeless(id) || id === 'breakthrough';

/** The one choice the skip may take here, or -1: a scene read before, one open story choice, no check, fight or fail branch,
 *  and (v0.11.133, FP2) every paragraph it shows read on an earlier Coil. */
export function skipStep(g, scenes) {
    const s = scenes[g.scene];
    if (!s || g.combat || s.end || !seenBefore(g) || noFold(g.scene)) return -1;
    const v = sceneView(g, scenes);
    if (v.end) return -1;
    const open = v.choices.filter((c) => !c.disabled);
    if (open.length !== 1 || open[0].index >= 1000) return -1;
    const c = s.choices[open[0].index];
    if (!c || c.check || c.combat || c.fail) return -1;
    if (!readBefore(g, v.text)) return -1; // v0.11.133 (FP2, SK): never past text not read on an earlier Coil
    return open[0].index;
}

export const SKIP_MAX = 30;
/** Walk the stretch on `g` itself. Returns { steps, lines, minutes }. */
export function skipRun(g, scenes, max = SKIP_MAX) {
    const m0 = g.minutes, lines = [], act0 = g.coil?.act || 0;
    let steps = 0;
    for (; steps < max; steps++) {
        const i = skipStep(g, scenes);
        if (i < 0) break;
        const from = g.scene;
        const r = choose(g, scenes, i);
        lines.push(...(r.lines || []));
        if (r.combat || g.scene === from) { steps++; break; } // never: a fight choice is not taken; a choice back to its own scene stops
        if ((g.coil?.act || 0) !== act0) { steps++; break; } // into the next act: stop on its first scene (Fable review)
    }
    return { steps, lines, minutes: g.minutes - m0 };
}
/** The skip's plan on a copy (how many steps, how long): shown only when it walks 2 steps or more. */
export function skipPlan(g, scenes) {
    if (skipStep(g, scenes) < 0) return { steps: 0, minutes: 0 };
    const c = JSON.parse(JSON.stringify(g));
    const r = skipRun(c, scenes);
    if (c.scene === 'coil_end' || c.coil?.why) return { steps: 0, minutes: 0, to: c.scene }; // it would end in a collapse: tap through instead, and see it coming (Fable review)
    return { steps: r.steps, minutes: r.minutes, to: c.scene };
}
