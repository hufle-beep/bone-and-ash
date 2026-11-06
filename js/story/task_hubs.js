/**
 * Task hubs (v0.9.0 step 3a; v0.9.2 step 3b): which hub scenes run as Selene-style task cards when "Tasks (preview)" is on.
 * `menus`: sub-menus whose choices become cards (the walk there is folded into each card); `daily` is the
 * key the sub-menu marks on entry, so its cards can read "back tomorrow"; `drill`: its cards are drills
 * (each gives a little familiarity to every card on the hub). Choices on the hub itself that lead back to it
 * (eat, rest, cultivate…) are cards too; everything else on the hub stays a story stop.
 * `notJames`: choices that moved to Yuki's lane. `yuki`: her job on this hub (runs whenever her lane is on).
 * `doors`: hub choices leading to these scenes are door cards (the bar fills, then the scene opens as a story stop).
 * `doorMenus`: a menu whose every place is a door card (the walk to the menu folded in).
 * `evening`: where James comes to if he collapses (HP 0) during a task — the stand-in until the Coil (3c).
 */
import { nextEvening } from './ashfall.js';

export const TASK_HUBS = {
    camp: { // v0.10.2: the camp (Days 1–3) — fire, cook, eat raw, stakes queue; checked cards keep their story-check numbers (`plainChecks`)
        menus: {},
        own: 'Camp',
        plainChecks: true,
        evening: 'camp',
    },
    stream: { // Day 1: the first forage and hunt are door cards to their discovery scenes
        menus: {},
        doors: ['forage', 'hunt'],
        own: 'By the stream',
        evening: 'camp',
    },
    wilds: {
        doorMenus: { wild_explore: { label: 'Explore' } },
        menus: { wild_forage: { label: 'Forage' }, wild_hunt: { label: 'Hunt' }, wild_train: { label: 'Practice', drill: true } },
        own: 'Camp chores',
        notJames: (c) => /^Let Yuki hunt/.test(String(c.text)),
        yuki: {
            id: 'yuki:wilds', label: 'Hunt alone in the reeds', minutes: 75, dc: 1, item: 'hare_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki comes back with ${n} hares and the air of someone owed an apology.` : 'Yuki comes back with a hare and a look of mild contempt.'),
            none: 'Yuki comes back with nothing, and pretends she wasn\'t trying.',
        },
        evening: 'camp',
    },
    village: { // Day 4
        menus: {},
        doors: ['heal', 'village_hunt'],
        own: 'Ashfall',
        evening: nextEvening,
    },
    ashfall: {
        doors: ['heal', 'village_hunt', 'herb_slopes', 'wen_lesson', 'far_hunt', 'scout'],
        menus: { clinic: { label: 'Clinic', daily: 'clinic' }, workshop: { label: 'Workshop', daily: 'workshop' }, drill: { label: 'Militia', daily: 'drill', drill: true } },
        own: 'Around the village',
        yuki: {
            id: 'yuki:ashfall', label: 'Hunt the barley fields', minutes: 75, dc: 1.5, item: 'hare_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki leaves ${n} hares on Mei Lin's step. Mei Lin's mother bows to the cat. The cat accepts.` : 'Yuki leaves a hare on Mei Lin\'s step, in a precise line with the door.'),
            none: 'Yuki comes back from the barley with nothing but burrs, and a grievance against the farmer\'s dog.',
        },
        evening: nextEvening,
    },
    lf_hub: { // v0.10.1: the Long Forest's camp in task mode — the season card and the camp chores queue; trips and trials stay story cards
        menus: {},
        own: 'Camp',
        evening: 'lf_morning',
    },
};
