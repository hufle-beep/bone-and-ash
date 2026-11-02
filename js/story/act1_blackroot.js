/** Act 1 — blackroot (stub until written). */
import { sleepUntil } from './act1_common.js';
export const BREAK_HUBS = [];
export const BLACKROOT = {
    bl_start: { id: 'bl_start', title: 'blackroot', art: 'village', place: 'Ashfall Hamlet', text: '(This part is being written.) It goes on for a while, and then it is the next part.', choices: [{ text: 'Go on.', do: (g) => { const d = Math.floor(g.minutes / 1440) + 1; if (d < 16) g.minutes = (16 - 1) * 1440 + 6 * 60; return []; }, to: 'ht_start' }] },
};
