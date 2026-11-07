/**
 * Bone and Ash — a scene read in an earlier Coil (v0.11.35, P1-a; owner 13:16 "the repetitions verbatim could make the game very
 * frustrating to some players", pick 15:42). Incremental Mode only (the only mode since v0.11.34).
 *  - The fold: the text folds to its first paragraph, with "Read it all again" (main.js).
 *  - A memory line on top, from James or Yuki, picked by scene and Coil (the same line every time for that scene on that Coil).
 *  - "Skip to the next choice": on a one-choice scene read before, walk the stretch at once. Every choice is taken with
 *    choose(), exactly as tapping through would take it (effects, clock, results); it stops at a real choice, a check, a fight,
 *    a task screen, a menu, an end, an unread scene or the Coil's own screens.
 * Uses `g.seen` (story.js noteSeen / seenBefore; kept across every rewind, coil.js).
 */
import { sceneView, choose, seenBefore, isMenuScene, isTimeless } from '../core/story.js';
import { TASK_HUBS } from './task_hubs.js';

/** Scenes whose text follows an outcome or a level that may differ from the read before (Fable review): never folded. */
export const OUTCOME_SCENES = new Set(['epilogue', 'fo_start', 'breakthrough', 'a1_again', 'a1_end', 'elder']);
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
];

/** A small stable hash of the scene id and the Coil: the same line for that scene every time on that Coil. */
function pick(id, n) {
    let h = 2166136261;
    for (const ch of `${id}#${n}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return MEMORY_LINES[h % MEMORY_LINES.length];
}

const parasOf = (t) => String(t).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/**
 * How the current scene's text shows: { fold, first, rest, memory }. `fold` only on a scene read in an earlier Coil with more
 * than one paragraph; `first` and `rest` are text (paragraphs joined by a blank line), so main.js renders them as before.
 */
export function againView(g, v) {
    const id = v?.id || g.scene;
    const ps = parasOf(v?.text || '');
    const variant = g.lastWin && g.lastWin.next === id && g.lastWin.degree >= 2; // a lopsided win's own text (story.js): not the one read before
    if (!seenBefore(g, id) || noFold(id) || variant || v?.end || ps.length < 2) return { fold: false, first: v?.text || '', rest: '', memory: null };
    return { fold: true, first: ps[0], rest: ps.slice(1).join('\n\n'), memory: pick(id, g.coil?.n || 1) };
}

/** The one choice the skip may take here, or -1: a scene read before, one open story choice, no check, fight or fail branch. */
export function skipStep(g, scenes) {
    const s = scenes[g.scene];
    if (!s || g.combat || s.end || !seenBefore(g) || noFold(g.scene)) return -1;
    const v = sceneView(g, scenes);
    if (v.end) return -1;
    const open = v.choices.filter((c) => !c.disabled);
    if (open.length !== 1 || open[0].index >= 1000) return -1;
    const c = s.choices[open[0].index];
    if (!c || c.check || c.combat || c.fail) return -1;
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
