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

const YUKI_ASHFALL = {
    id: 'yuki:ashfall', label: 'Hunt the barley fields', minutes: 75, dc: 1.5, item: 'hare_raw', n: 1,
    got: (n) => (n > 1 ? `Yuki leaves ${n} hares on Mei Lin's step. Mei Lin's mother bows to the cat. The cat accepts.` : 'Yuki leaves a hare on Mei Lin\'s step, in a precise line with the door.'),
    none: 'Yuki comes back from the barley with nothing but burrs, and a grievance against the farmer\'s dog.',
};

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
        yuki: YUKI_ASHFALL,
        evening: nextEvening,
    },
    // v0.11.19 (owner 20:39, pick B): Act 1's seven resting places as task screens, like the prologue's
    fo_ashfall: {
        menus: { fo_palisade: { label: 'Palisade', daily: 'a1_palisade' }, fo_council: { label: 'Council', daily: 'a1_council' }, fo_drill: { label: 'Militia', daily: 'a1_drill', drill: true }, fo_clinic: { label: 'Clinic', daily: 'a1_clinic' } },
        doors: ['fo_mei', 'fo_mother', 'fo_ya_time', 'fo_spy'],
        own: 'Around Ashfall',
        yuki: YUKI_ASHFALL,
        evening: 'fo_ashfall',
    },
    rr_hub: {
        menus: { rr_forage: { label: 'Forage', daily: 'rr_forage' }, rr_scout: { label: 'Scout', daily: 'rr_scout' } },
        doors: ['ya_mocks', 'rr_hunt', 'rr_roots', 'talk_mei', 'talk_ya', 'bl_train'],
        own: 'The root road',
        yuki: {
            id: 'yuki:rr', label: 'Hunt along the roots', minutes: 75, dc: 2, item: 'hare_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki drops ${n} root-hares at Ya's feet, then at yours, so there is no confusion about the order of things.` : 'Yuki brings back a root-hare and sits on it until you say thank you.'),
            none: 'Yuki comes back from the roots with nothing and the air of a cat who was never hunting anyway.',
        },
        evening: 'rr_hub',
    },
    dw_hub: {
        menus: { dw_forage: { label: 'Forage', daily: 'dw_forage' } },
        doors: ['dw_hunt', 'dw_scout', 'talk_mei', 'talk_ya', 'bl_train', 'hot_spring'],
        own: 'The drowned wood',
        yuki: {
            id: 'yuki:dw', label: 'Stalk mire fowl on the drowned trunks', minutes: 75, dc: 2.5, item: 'fowl_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki comes back soaked to the shoulder with ${n} mire fowl. The water was beneath her. She mentions it.` : 'Yuki brings back a mire fowl, wet, and holds you personally responsible for the wet.'),
            none: 'Yuki comes back wet and empty-mouthed. You do not discuss it.',
        },
        evening: 'dw_hub',
    },
    ah_hub: {
        menus: { ah_forage: { label: 'Forage', daily: 'ah_forage' } },
        doors: ['ya_offended', 'trio_kiss', 'ah_hunt', 'ah_scout', 'talk_mei', 'talk_ya', 'bl_train'],
        own: 'The ashen hills',
        yuki: {
            id: 'yuki:ah', label: 'Hunt the ash slopes', minutes: 75, dc: 3, item: 'hare_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki comes down the ash with ${n} hill-hares, grey to the eyebrows, deeply pleased with herself.` : 'Yuki brings back a hill-hare and a fine coat of ash, and refuses to be brushed.'),
            none: 'Yuki comes back grey with ash and nothing else. The hares here are fast. She would like that on record.',
        },
        evening: 'ah_hub',
    },
    heart_hub: {
        menus: {},
        doors: ['hall_listen', 'ring_chambers', 'heart_spring', 'sect_cut'],
        own: 'The Old Tree',
        evening: 'heart_hub',
    },
    rt_camp: {
        menus: {},
        doors: ['rt_fire_talk', 'rt_watch'],
        own: 'Camp',
        evening: 'rt_camp',
    },
    rt_ashfall: {
        menus: { rt_hunters: { label: 'Militia', drill: true } },
        doors: ['rt_council', 'rt_grove', 'rt_ya_village'],
        own: 'Ashfall',
        yuki: YUKI_ASHFALL,
        evening: 'rt_ashfall',
    },
    lf_hub: { // v0.10.1: the Long Forest's camp in task mode — the season card and the camp chores queue; trips and trials stay story cards
        menus: {},
        own: 'Camp',
        evening: 'lf_morning',
    },
};
