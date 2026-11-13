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
    // v0.11.71 (owner pick Y1, texts Fable's): her own kind full → the next of these not full (big: tiger or human form only); all full → `full`
    alts: [
        { item: 'fowl_raw', got: (n) => (n > 1 ? "Yuki leaves two mire fowl on Mei Lin's step. Mei Lin's mother bows, lower than for the hares. The cat finds this appropriate; you had hares enough." : "Yuki leaves a mire fowl on Mei Lin's step, dead straight, with the gravity of a cat who knows you have run out of room for hares.") },
        { item: 'venison', big: true, got: (n) => (n > 1 ? "Yuki leaves most of an ash-deer on Mei Lin's step and the whole household comes out to be solemn at it. Nobody asks about hares. The hares have been seen to, and then some." : "Yuki leaves a haunch of ash-deer on Mei Lin's step. The step was not built for it. The hares, it is understood, are no longer a question.") }
    ],
    full: "Yuki comes back from the barley fed and unhurried, and leaves nothing on the step. You already carry everything the fields have to offer. She ate the rest, out of principle.",
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
            got: (n) => (n > 1 ? `Yuki comes back with ${n} hares and no remarks, having decided the hares are remark enough.` : 'Yuki comes back with a hare and drops it on your boots.'),
            none: 'Yuki comes back with nothing, and blames the wind before you ask.',
            // v0.11.71 (owner pick Y1, texts Fable's): her own kind full → the next of these not full (big: tiger or human form only); all full → `full`
            alts: [
                { item: 'fowl_raw', got: (n) => (n > 1 ? "Yuki comes back from the Mire's edge with two mire fowl, wet to the chest and above comment. Hares were not what you were short of." : "Yuki comes back from the stream edge with a mire fowl instead of a hare. You already have more hares than a man should. She has counted.") },
                { item: 'crab_meat', got: (n) => (n > 1 ? "Yuki comes back with two stone-shell crabs and a cut on one pad she declines to show you. The hare situation, she makes clear, is your doing." : "Yuki comes back with a stone-shell crab, cracked, and sets it down as if settling an argument about your stores that you were not aware of having.") },
                { item: 'venison', big: true, got: (n) => (n > 1 ? "Yuki comes back out of the reeds with the better part of an ash-deer and the air of someone who has stopped bothering with hares, since you plainly have no room for them." : "Yuki comes back dragging a haunch of ash-deer through the reeds. The hares, apparently, were beneath mention today; you had enough of them.") }
            ],
            full: "Yuki comes back from the reeds with blood on her chin and nothing in her mouth. You have enough of everything she could catch. She has eaten the proof.",
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
        // v0.11.157 (owner pick NX1, PA): the prologue Ashfall's Clinic, Workshop and Militia have no `daily`: more than one card a day,
        // each still once a Coil (as Act 1's, v0.11.156 OA); their day marks only for "Call it a day" (oneoff.js DAY_DONE)
        menus: { clinic: { label: 'Clinic' }, workshop: { label: 'Workshop' }, drill: { label: 'Militia', drill: true } },
        own: 'Around the village',
        yuki: YUKI_ASHFALL,
        evening: nextEvening,
    },
    // v0.11.19 (owner 20:39, pick B): Act 1's seven resting places as task screens, like the prologue's
    fo_ashfall: {
        menus: { fo_palisade: { label: 'Palisade' }, fo_council: { label: 'Council', daily: 'a1_council' }, fo_drill: { label: 'Militia', drill: true }, fo_clinic: { label: 'Clinic' } },
        doors: ['fo_mei', 'fo_mother', 'fo_ya_time', 'fo_spy'],
        own: 'Around Ashfall',
        yuki: YUKI_ASHFALL,
        evening: 'fo_ashfall',
    },
    // v0.11.67 (owner pick F1, one hub format): the Blackroot's "Train." (bl_train) is a Practice group on the list, not a gate card
    // v0.11.156 (owner pick DM1, OF + OS + OA): the Blackroot's Forage and Scout, and the Fallout's Palisade, Militia and Clinic, have no
    // `daily`: more than one card a day (Forage repeats as in the Wilds; the once-a-Coil cards stay once a Coil); the Council stays daily
    // v0.11.161 (owner pick PO2, FG): each Blackroot forage card once a day (`onceADay` in act1_blackroot.js); `byOption` shows them all as tomorrow once every one is used
    rr_hub: {
        menus: { rr_forage: { label: 'Forage', byOption: true }, rr_scout: { label: 'Scout' }, bl_train: { label: 'Practice' } },
        doors: ['ya_mocks', 'rr_hunt', 'rr_roots', 'talk_mei', 'talk_ya'],
        own: 'The root road',
        yuki: {
            id: 'yuki:rr', label: 'Hunt along the roots', minutes: 75, dc: 2, item: 'hare_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki drops ${n} root-hares at Ya's feet, then at yours, so there is no confusion about the order of things.` : 'Yuki brings back a root-hare and sits on it until you say thank you.'),
            none: 'Yuki comes back from the roots with nothing and the air of a cat who was never hunting anyway.',
            // v0.11.71 (owner pick Y1, texts Fable's): her own kind full → the next of these not full (big: tiger or human form only); all full → `full`
            alts: [
                { item: 'fowl_raw', got: (n) => (n > 1 ? "Yuki drops two mire fowl at Ya's feet, then at yours. Ya asks where the hares are. You think of the ninety-nine already in the omnitool and decline to explain." : "Yuki brings back a mire fowl from somewhere under the roots and sits on it until Ya has finished saying there are no fowl here. You were carrying too many hares; she adjusted.") },
                { item: 'venison', big: true, got: (n) => (n > 1 ? "Yuki comes back dragging an ash-deer by the neck, and Ya says nothing for a full minute, which from Ya is a speech. There was no room for hares. The deer is the point being made." : "Yuki comes back along the roots with a haunch of ash-deer, and Ya goes quiet in the way of a huntress revising an opinion. Hares, you note, are no longer being offered. You have plenty.") }
            ],
            full: "Yuki comes back from the roots with blood on her whiskers and nothing for you. Whatever she can catch out here, you already carry as much of as the omnitool will take, and she does not hunt for the exercise. Ya watches her clean her face and says, gravely, that it is right the hunter eats first.",
        },
        evening: 'rr_hub',
    },
    dw_hub: {
        menus: { dw_forage: { label: 'Forage', byOption: true }, bl_train: { label: 'Practice' } },
        doors: ['dw_hunt', 'dw_scout', 'talk_mei', 'talk_ya', 'hot_spring'],
        own: 'The drowned wood',
        yuki: {
            id: 'yuki:dw', label: 'Stalk mire fowl on the drowned trunks', minutes: 75, dc: 2.5, item: 'fowl_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki comes back soaked to the shoulder with ${n} mire fowl. The water was beneath her. She mentions it.` : 'Yuki brings back a mire fowl, wet, and holds you personally responsible for the wet.'),
            none: 'Yuki comes back wet and empty-mouthed. You do not discuss it.',
            // v0.11.71 (owner pick Y1, texts Fable's): her own kind full → the next of these not full (big: tiger or human form only); all full → `full`
            alts: [
                { item: 'crab_meat', got: (n) => (n > 1 ? "Yuki comes back wet to the shoulder with two stone-shell crabs and an expression that says she has looked at your stores and found the fowl excessive." : "Yuki comes back from the drowned trunks with a stone-shell crab instead of a fowl, which is her way of telling you the fowl situation has got out of hand.") },
                { item: 'hare_raw', got: (n) => (n > 1 ? "Yuki comes back from the dry edge of the wood with two hares, and not a drop on her. Fowl, you gather, are a closed subject until you make room." : "Yuki comes back dry for once, with a hare from the higher ground. The fowl, she has decided, you can have when you have eaten some.") },
                { item: 'venison', big: true, got: (n) => (n > 1 ? "Yuki comes back hauling most of an ash-deer out of the shallows and leaves it on the one dry trunk in the wood. You were full of fowl; the deer is bigger than a fowl, and that is the whole of her argument." : "Yuki comes back along the drowned trunks with a haunch of ash-deer, dripping. You were full of fowl; this is her answer to that.") }
            ],
            full: "Yuki comes back from the drowned trunks wet, fed, and carrying nothing, because there is nothing left in the wood that you have room for. She holds you responsible for the wet regardless.",
        },
        evening: 'dw_hub',
    },
    ah_hub: {
        menus: { ah_forage: { label: 'Forage', byOption: true }, bl_train: { label: 'Practice' } },
        doors: ['ya_offended', 'trio_kiss', 'ah_hunt', 'ah_scout', 'talk_mei', 'talk_ya'],
        own: 'The ashen hills',
        yuki: {
            id: 'yuki:ah', label: 'Hunt the ash slopes', minutes: 75, dc: 3, item: 'hare_raw', n: 1,
            got: (n) => (n > 1 ? `Yuki comes down the ash with ${n} hill-hares, grey to the eyebrows, deeply pleased with herself.` : 'Yuki brings back a hill-hare and a fine coat of ash, and refuses to be brushed.'),
            none: 'Yuki comes back grey with ash and nothing else. The hares here are fast. She would like that on record.',
            // v0.11.71 (owner pick Y1, texts Fable's): her own kind full → the next of these not full (big: tiger or human form only); all full → `full`
            alts: [
                { item: 'fowl_raw', got: (n) => (n > 1 ? "Yuki comes down the slope with two mire fowl she must have gone a long way for. Hares, she lets you understand, are no longer worth the running when you have no room for them." : "Yuki comes down the ash with a mire fowl, grey to the eyebrows, since a hill-hare would have been one more than you can carry.") },
                { item: 'venison', big: true, got: (n) => (n > 1 ? "Yuki comes down the ash with the better part of an ash-deer and sets it at your feet with the air of someone who has stopped chasing hares, since you kept more than you could ever eat." : "Yuki comes down the slope dragging a haunch of ash-deer, grey with ash to the shoulder. The hill-hares can keep running. You had enough of them.") }
            ],
            full: "Yuki comes down the slope fed, ash-grey and empty-mouthed, and glances at the omnitool as though it were the one at fault. It is. Everything she hunts here, it already holds to the brim.",
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
        menus: { rt_hunters: { label: 'Militia', drill: true, note: (g) => (g.flags.a1_militia ? 'practice only' : '') } }, // v0.11.156 (DM1, TX-A): the heading says the drill is practice once the militia is ready
        doors: ['rt_council', 'rt_grove', 'rt_ya_village'],
        own: 'Ashfall',
        yuki: YUKI_ASHFALL,
        evening: 'rt_ashfall',
    },
    // v0.10.1: the Long Forest's camp in task mode — the season card and the camp chores queue.
    // v0.11.67 (owner pick F1, one hub format): Forage, Hunt and Train on the list like the Wilds' (no gate screens);
    // the trial zones (Go deep) are door cards, like the Wilds' Explore. Wanderers and the season's beats stay story cards.
    lf_hub: {
        menus: { lf_forage: { label: 'Forage' }, lf_hunt: { label: 'Hunt' }, lf_train: { label: 'Practice' } },
        doorMenus: { lf_trials: { label: 'Go deep' } },
        own: 'Camp',
        evening: 'lf_morning',
    },
};
