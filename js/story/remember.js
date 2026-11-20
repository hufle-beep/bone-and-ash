/**
 * Bone and Ash — memory lines of their own (v0.11.184, owner picks N1, S1, D1; group e's #95 and the Day 2 morning).
 * A scene read on an earlier Coil folds under a memory line (again.js). For the scenes here the line is the scene's own, chosen
 * by what the text shows now, in place of the general pool's: the Day 2 morning (`forest_day` 2) and Mei Lin's and Ya's talk
 * beats 0, 1, 3 and 4 (the beat as act1_blackroot.js picks it: the higher of the talk count and the day's index). The settled
 * text (beat 2, and from 5 the cycle of six: v0.11.236 RV1 C L1) and every other scene keep the pool (null here). No flags, no save fields: the fold itself (`g.read`)
 * says the text was read before. The same line on every redraw (it follows the state, not a draw).
 */
import { dayIndex } from '../core/lines.js';
import { SCENE_MEMORY_LINES as L } from './remember_texts.js';

/** The talk's beat, as its text picks it (act1_blackroot.js `talk_mei` / `talk_ya`). */
export const talkBeat = (g, flag, id) => Math.max(g?.flags?.[flag] || 0, dayIndex(g, id));

const BY_SCENE = {
    morning: (g) => (g.flags?.forest_day === 2 ? L.morning : null),
    talk_mei: (g) => L.talk_mei[talkBeat(g, 'mei_talks', 'talk_mei')] ?? null,
    talk_ya: (g) => L.talk_ya[talkBeat(g, 'ya_talks', 'talk_ya')] ?? null,
};

/** The scene's own memory line for what it shows now, or null (the general pool's). */
export function sceneMemory(g, id) {
    const f = BY_SCENE[id];
    return f ? f(g) : null;
}
