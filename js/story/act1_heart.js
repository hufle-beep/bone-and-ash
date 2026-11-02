/** Act 1 — heart (stub until written). */
import { sleepUntil } from './act1_common.js';
export const BREAK_HUBS = [];
export const HEART = {
    ht_start: { id: 'ht_start', title: 'heart', art: 'village', place: 'Ashfall Hamlet', text: '(This part is being written.) It goes on for a while, and then it is the next part.', choices: [{ text: 'Go on.', do: (g) => { const d = Math.floor(g.minutes / 1440) + 1; if (d < 19) g.minutes = (19 - 1) * 1440 + 6 * 60; return []; }, to: 'rt_start' }] },
};
