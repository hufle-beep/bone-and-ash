/**
 * v0.11.177 (owner pick P9A): work menus whose own text is never drawn in task mode (a work card goes to its menu and straight back,
 * js/core/tasks.js resolveWork), so P9A emptied it (what was worth keeping moved into the menus' result lines). The render checks
 * accept an empty text for exactly these; the P9A block checks each is empty and is a menu.
 */
export const DEAD_MENUS = new Set(['wild_hunt', 'wild_train', 'rr_forage', 'dw_forage', 'ah_forage', 'bl_train', 'lf_forage', 'lf_hunt', 'lf_train', 'lf_trials']);
export const deadMenuOk = (scene, text) => DEAD_MENUS.has(scene) && text === '';
