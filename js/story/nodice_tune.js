/**
 * No-dice fight tuning (v0.9.3, task mode only). Per encounter id: `up` raises the enemy's DC and attack by that much
 * (on top of the common no-dice shift of −2), `hp` multiplies its HP. Set by bot simulations (smart combat, random
 * story choices) toward the owner's targets: bosses ~30% in the first Coil, middle fights ~50%, small fights ~70%.
 * Classic mode (with dice) never reads this. v0.9.7: every beast fight also gets +0.5 (game.js BEAST_UP, PEOPLE_FIGHTS).
 */
export const NO_DICE_TUNE = {
    arson: { up: 1.0 },
    boar: { up: 0.75 },
    bone_elk: { up: 1.5 },
    cinder_hawks: { up: 5.25 },
    collectors: { up: 2.0 }, // v0.9.7: tribute +1 (was 1.0)
    crows: { up: 4.25 },
    drowned: { up: 3.0 },
    elder: { up: 9.75 },
    gao: { up: 0.5 },
    guardian: { up: 3.5 },
    husks: { up: 7.75 },
    jackals: { up: 1.25 },
    lizard: { up: 0.5 },
    mire: { up: -0.25 },
    mire_serpent: { up: 11.25 },
    night_drowned: { up: 3.75 },
    night_hawks: { up: 8.25 },
    night_serpent: { up: 5.25 },
    night_wolves: { up: 3.0 },
    palisade_wolf: { up: 1.0 },
    rats: { up: 4.0 },
    root_husks: { up: 1.25 },
    root_wyrm: { up: 3.25 },
    rot_ape: { up: 8.0 },
    rt_brawl: { up: 8.75 },
    rt_serpent: { up: 0.25 },
    rt_wolves: { up: 7.0 },
    sect_watcher: { up: 0.75 },
    thornback: { up: 0.25 },
    wolves: { up: 0.75 },
    ya_brawl: { up: 4.75 },
};
