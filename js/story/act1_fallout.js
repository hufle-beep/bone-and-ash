/** Act 1 — fallout (stub until written). */
import { sleepUntil } from './act1_common.js';
export const BREAK_HUBS = [];
export const FALLOUT = {
    fo_start: { id: 'fo_start', title: 'fallout', art: 'village', place: 'Ashfall Hamlet', text: '(This part is being written.) It goes on for a while, and then it is the next part.', choices: [{ text: 'Go on.', do: (g) => { const d = Math.floor(g.minutes / 1440) + 1; if (d < 11) g.minutes = (11 - 1) * 1440 + 6 * 60; return []; }, to: 'bl_start' }] },
};
