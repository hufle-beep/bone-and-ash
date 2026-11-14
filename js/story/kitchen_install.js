/**
 * v0.11.181 (owner picks SP1, KG1; CM push 1): the cook-with-the-women cards (kitchen.js), apart so kitchen.js need not import
 * task_hubs.js (which imports ashfall.js, which reads kitchen.js's potLine). Appended after the house cards (each hub's last
 * choices), so no choice position changes.
 */
import { TASK_HUBS } from './task_hubs.js';
import { SCENES_KITCHEN, POT_HUBS, POT_COOK, POT_CARD_MIN, potCookOpen } from './kitchen.js';

/** The cook cards on the prologue's and the Fallout's Ashfall, appended last (no choice position changes); door cards. */
export function installKitchen(SCENES) {
    Object.assign(SCENES, SCENES_KITCHEN);
    for (const [hub, c] of Object.entries(POT_HUBS)) {
        const s = SCENES[hub];
        if (!s) continue;
        s.choices.push({ text: POT_COOK[c.t].label, show: (g) => potCookOpen(g, hub), time: POT_CARD_MIN, to: c.scene });
        const cfg = TASK_HUBS[hub];
        if (cfg && !(cfg.doors || []).includes(c.scene)) cfg.doors = [...(cfg.doors || []), c.scene];
    }
}
