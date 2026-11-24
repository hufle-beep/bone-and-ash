/**
 * Enemy HP factors per encounter id (written by the tuning script), applied to every fight on top of its own tuning.
 * Set in v0.7.3 when criticals changed (total ≥ 2 × DC doubles damage; a 6 no longer adds +2): HP only, so DCs — and how
 * often James can crit — stay as they were. 1 = unchanged.
 */
export const HP_TUNE = {"bone_elk": 0.85, "collectors": 0.8, "drowned": 0.9, "elder": 0.65, "guardian": 0.75, "mire_serpent": 0.95, "night_drowned": 0.9, "night_wolves": 0.9, "palisade_wolf": 0.95, "root_husks": 0.95, "root_wyrm": 0.8, "rot_ape": 0.8, "rt_brawl": 0.9, "sect_watcher": 0.85, "ya_brawl": 0.7, "boar": 0.95, "gao": 0.75, "mire": 0.75, "thornback": 0.8, "wolves": 0.85, "night_serpent": 0.85, "rt_serpent": 1.25};
/** v0.11.271 (owner pick P39-A, RG; `claude/p39-options.md`): a James at this realm (Core Formation) or above meets these HP factors in
 *  place of HP_TUNE's (P25-A's by-realm pattern, `act1_tune.js`). The collectors 0.8 → 0.7: the Cultivator (True Core, realm 3, at the
 *  tribute) clears the whole game on Coil 1 in 32.5% of 200 games (seed 1: 21.5%; was 19.5 / 15.5%, under T1's 20–30% floor); the
 *  Completionist (Foundation at the tribute), Careful and the Sociable unchanged. */
export const HIGH_REALM = 2;
export const HP_TUNE_HIGH = {"collectors": 0.7};
/** The HP factor an encounter gets for a James at this realm. */
export const hpTuneFor = (id, realm = 0) => ((realm || 0) >= HIGH_REALM && Object.hasOwn(HP_TUNE_HIGH, id) ? HP_TUNE_HIGH[id] : HP_TUNE[id] || 1);
