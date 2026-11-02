/**
 * Enemy HP factors per encounter id (written by the tuning script), applied to every fight on top of its own tuning.
 * Set in v0.7.3 when criticals changed (total ≥ 2 × DC doubles damage; a 6 no longer adds +2): HP only, so DCs — and how
 * often James can crit — stay as they were. 1 = unchanged.
 */
export const HP_TUNE = {"bone_elk": 0.85, "collectors": 0.8, "drowned": 0.9, "elder": 0.65, "guardian": 0.75, "mire_serpent": 0.95, "night_drowned": 0.9, "night_wolves": 0.9, "palisade_wolf": 0.95, "root_husks": 0.95, "root_wyrm": 0.8, "rot_ape": 0.8, "rt_brawl": 0.9, "sect_watcher": 0.85, "ya_brawl": 0.7, "boar": 0.95, "gao": 0.75, "mire": 0.75, "thornback": 0.8, "wolves": 0.85, "night_serpent": 0.85, "rt_serpent": 1.25};
