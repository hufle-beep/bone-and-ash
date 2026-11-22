/** Act 1 fight tuning (set by simulation, 500 full playthroughs per round): per encounter id, t raises DC and attack by t and HP by 10%·t. */
export const TUNE = {ya_brawl: 2, rt_brawl: 5.5, guardian: 7.5, elder: 4.5, root_wyrm: 1, rot_ape: 1.5, root_husks: 5, sect_watcher: 2, palisade_wolf: 1.5, bone_elk: 1.5, mire_serpent: 3, drowned: 2, cinder_hawks: 2.5, night_drowned: 2, night_hawks: 2.5, night_serpent: 3, night_wolves: 2, husks: 3.5, rt_wolves: 2, rt_serpent: -1};
/** v0.11.255 (P25-A, AW; owner pick 2026-11-22): a James below this realm (Core Formation) meets these tunes in place of TUNE's.
 *  The rot ape 1.5 → 11: Careful's Act 1 2.40 → 4.47 Coils, the Sociable's 4.40; the Completionist and the Cultivator (Core Formation and up) unchanged. */
export const LOW_REALM = 2;
export const TUNE_LOW = {rot_ape: 11};
/** The tune an encounter gets for a James at this realm. */
export const tuneFor = (id, realm = 0) => ((realm || 0) < LOW_REALM && Object.hasOwn(TUNE_LOW, id) ? TUNE_LOW[id] : TUNE[id] || 0);
