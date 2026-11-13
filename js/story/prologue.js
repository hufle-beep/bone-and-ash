/**
 * Prologue — "Bone and Ash". James Green (40, a doctorate three days old) and Yuki land with nothing in the
 * Blackroot Wilds, at the edge of a dark xianxia world where cultivators climb on herbs, beast cores and the
 * corpses of their rivals, and where Heaven answers every breakthrough with lightning. James needs none of it.
 * That is going to be a problem — for them.
 */
import { addItem, hasItem, eat, bumpRel, sleepUntil, advance, clockParts, breakthrough, realmName, nightTo, nightRest } from '../core/game.js';
import { NO_DICE_TUNE } from './nodice_tune.js';
import { setNoDiceTune, yukiFightSkill } from '../core/game.js'; // v0.11.118 (YK1 review, SB)
setNoDiceTune(NO_DICE_TUNE);
import { forestScale, villageScale, grow, NEW_ITEMS, byForm, byDay } from './common.js';
import './power.js';
import './stomp_prologue.js';
import './stomp_act1.js';
import { STORY_FORMS, hasForm } from '../core/forms.js';
import { yukiForms, itemNames, itemCap, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, ensureBars, MAX_REALM, wakeState, clockLabel, dayHour } from '../core/game.js';
import { WILDS, nightNext } from './wilds.js';
import { ASHFALL, hubOf, nextEvening } from './ashfall.js';
import { ACT1_ITEMS, KISS_MEI } from './act1_common.js';
import { FALLOUT, BREAK_HUBS as B1 } from './act1_fallout.js';
import { BLACKROOT, BREAK_HUBS as B2 } from './act1_blackroot.js';
import { HEART, BREAK_HUBS as B3 } from './act1_heart.js';
import { RETURN, BREAK_HUBS as B4 } from './act1_return.js';
import { LONGFOREST, BREAK_HUBS as B0 } from './longforest.js';
import { MERIDIANS, EXTRA_FROM } from './meridians.js';
import { installYukiTime } from './yuki_time.js'; // v0.11.137 (TR1)
import { installHouseTime } from './house_time.js'; // v0.11.139 (MW1)
import { installYukiPath } from './yuki_path.js';
import { installCoil } from './coil_scenes.js';
import { installOnce } from './oneoff.js';
import { markWalks } from './walks.js'; // v0.11.109 (owner pick MW1)
/** v0.11.131 (XB2, FL; RC2, L5): the great root-kin's line in night_attack_forced, both texts (Fable's MAIN). */
const NA_TIGER = " Yuki, who was never going to run, gets up. *Good,* says the bond. *I outweigh them. All of them, together.*";

const once = (flag) => (g) => !g.flags[flag];
const set = (...flags) => (g) => { for (const f of flags) g.flags[f] = true; return []; };

/* ---------- encounters ---------- */
const jackals = (g) => {
    const s = forestScale(g);
    const stake = g.flags.stakes ? (g.flags.stakes_hard ? 4 : 3) : 0;
    const enemies = [
        { name: 'Ashfang jackal', hp: 7 - stake, dc: 3, atk: 5, dmg: 4, prefersSmall: true },
        { name: 'Ashfang matriarch', hp: 7, dc: 3, atk: g.flags.watch ? 4 : 5, dmg: 4, prefersSmall: true },
        ...(s >= 2 ? [{ name: 'Ashfang yearling', hp: 5, dc: 3, atk: 4, dmg: 3, prefersSmall: true }] : []),
    ];
    return {
        id: 'jackals', night: true, // v0.11.92 (O1): a night fight costs sleep
        intro: s >= 2 ? 'Three shapes come loose from the dark, the same three that have walked rings round your camp for two nights: ash-grey hides, a surplus of teeth, eyes like coals nobody remembered to put out.' : 'Two shapes come loose from the dark: ash-grey hides, a surplus of teeth, eyes like coals nobody remembered to put out.',
        band: 'standard',
        enemies: enemies.map((e) => grow(e, s, JACKAL_GROWTH)),
        win: 'jackals_won', lose: 'jackals_lost', flee: 'jackals_fled',
    };
};
/* Growth per extra day of training (tuned by simulation, tests/story.test.mjs). */
const JACKAL_GROWTH = { hp: 0.15, dc: 0.45, atk: 0.6 };
const GAO_GROWTH = { hp: 0.15, dc: 0.45, atk: 0.6 };
const BOAR_GROWTH = { hp: 0.15, dc: 0.45, atk: 0.6 };
const LU_GROWTH = { hp: 0.05, dc: 0.35, atk: 0.5 };
const gaoFight = (g) => ({
    id: 'gao',
    intro: 'Gao Feng snaps his sleeve straight and Qi runs crackling down it, red as a fresh cut. Behind him the lackey grins and frees his hatchet.',
    band: 'challenging',
    enemies: [
        { name: 'Gao Feng', hp: g.flags.gao_hand ? 6 : 9, dc: 4, atk: 5, dmg: 4, dr: 1 },
        { name: 'Lackey Pock-Face', hp: 6, dc: 3, atk: 4, dmg: 3 },
    ].map((e) => grow(e, forestScale(g), GAO_GROWTH)),
    win: 'gao_won', lose: 'gao_lost',
});
const collectorsFight = (g) => {
    const s = forestScale(g) + villageScale(g);
    const militia = Math.min(2, g.flags.militia || 0) + (g.flags.spears ? 1 : 0);
    const enemies = [
        { name: 'Lu Han', hp: 12, dc: 5, atk: 6, dmg: 5, dr: 1 },
        ...(g.flags.gao_broken || g.flags.gao_turned ? [] : [{ name: 'Gao Feng', hp: g.flags.gao_beaten ? 5 : 8, dc: 4, atk: 5, dmg: 4, dr: 1 }]),
        
    ].map((e) => grow(e, s, LU_GROWTH));
    // the hunters you drilled hold the others off and wear Lu Han down
    if (militia) enemies[0].hp = Math.max(6, enemies[0].hp - 2 * militia);
    return {
        id: 'collectors',
        intro: militia ? 'Inner Disciple Lu Han does not hurry. Then eight hunters with white bone spearheads step up behind you, and not one of them kneels. That, at last, hurries him.' : 'Inner Disciple Lu Han does not hurry. No mortal has ever given him a reason to.',
        band: 'major',
        enemies,
        win: 'collectors_won', lose: 'collectors_lost',
    };
};

const cookMeal = (g) => {
    const out = [];
    if (hasItem(g, 'hare_raw')) { addItem(g, 'hare_raw', -1); eat(g, 35); out.push('Roast hare: +35 satiety (the liver goes to Yuki, and your pardon comes back).'); }
    else if (hasItem(g, 'jade_bracket')) { addItem(g, 'jade_bracket', -1); eat(g, 15); out.push('Seared jade bracket: +15 satiety.'); }
    return out;
};
const foodCount = (g) => (g.inventory.hare_raw || 0) + (g.inventory.jade_bracket || 0);

export const ITEMS = {
    hare_raw: { name: 'Glassback hare (dressed)', note: 'Raw. Cooking would improve it. So would nearly anything.' },
    jade_bracket: { name: 'Jade bracket fungus', note: 'Edible, mildly antibiotic. The doctorate\'s first return on investment.' },
    crimson_berry: { name: 'Crimson needleberries', note: 'Tested safe. The flavour is vitamin C with a grievance.' },
    spirit_grass: { name: 'Ninefold spirit grass', note: 'What the locals eat to cultivate. It keeps testing your meridians for a soft place to bite.' },
    hairpin: { name: 'Wraithbone hairpin', note: 'Finer work than a man lately seen eating raw hare has any right to carry.' },
    jackal_fang: { name: 'Ashfang fangs', note: 'Trophies. Yuki buries them whenever your back is turned.' },
    beast_core: { name: 'Murky beast core', note: 'The locals swallow these to cultivate. You would sooner swallow a battery.' },
    ...NEW_ITEMS,
    ...ACT1_ITEMS,
};
Object.assign(itemNames, ITEMS);

/** What locals sense of Yuki's meridians (v0.9.6: they may still be closed). */
/** v0.11.125 (owner pick FM1; Fable's MAINs): where the locals see her, by her current form. */
const yukiSpot = (g) => byForm(g, 'the beast on your shoulder', 'the beast at your side', 'the beast beside you');
const yukiMerElder = (g) => { const n = g.yuki.primaries ?? 12; const b = yukiSpot(g); return n >= 12 ? `And ${b} has twelve meridians open. In ninety years I have seen that only in the heirs of great sects.` : n > 0 ? `And ${b} has ${n === 1 ? 'a meridian' : `${n} meridians`} open, and is opening more, ${byForm(g, 'at its size', 'untaught', 'at its age')}, without a single pill. In ninety years I have seen that only in the heirs of great sects.` : `And ${b} holds Qi with every meridian shut, which is not possible, and which it is doing anyway.`; };
const yukiMerLu = (g) => { const n = g.yuki.primaries ?? 12; const b = yukiSpot(g); return n >= 12 ? `And yet ${b} has its meridians open like a sect heir\'s.` : n > 0 ? `And yet ${b} has ${n === 1 ? 'a meridian' : `${n} meridians`} open, and no pill-smell either. Like a sect heir's.` : `And yet ${b} holds Qi with its meridians shut, like a sealed jar that is somehow full.`; };

/** v0.11.154 (owner pick RV1, Fable's review, L1 CF): the camp's text by the night in the forest (forest_day 1–3), not by the clock's day, so a long
 *  breakthrough at the camp that ends after 05:00 doesn't move it a day ahead. */
const byNight = (g, list) => { const t = list[Math.max(0, Math.min(list.length - 1, (g.flags.forest_day || 1) - 1))]; return typeof t === 'function' ? t(g) : t; };

export const SCENES = {
    /* ================= DAY 1 ================= */
    arrival: {
        id: 'arrival', title: 'Bone and Ash', art: 'james', place: 'Unknown forest',
        text: `Three days ago you defended a doctorate in mycology and computational biology. Yesterday you celebrated it. This morning, as near as you can piece it together, you went into the resonance lab to "just check one reading", with Yuki asleep in the hood of your lab coat, and the spatial seed chamber decided to have opinions.

Now you are lying on your back in a forest made of black bark and grey moss, under a sky the colour of a bruise, and something small and white is standing on your sternum, staring at you with the deep, personal disappointment only a cat can manage.

"Good morning," you tell her. "For the record, I touched nothing."

Yuki doesn't believe a word of it. Neither do you.

You straighten your glasses, thin and rectangular and somehow unbroken. The ouroboros on your left forearm is a closed ring, the serpent eating its own tail; under the skin beneath it your omnitool hums awake, warm and blessedly alive. Its hammerspace, the pocket of folded space your people grow into every citizen at birth, reports in: the most expensive empty closet in two universes. Clothes on your back. Lab coat. A cat. End of inventory.`,
        choices: [
            { text: 'Check Yuki over first — paws, ribs, the bond between you.', to: 'yuki_check' },
            { text: 'Run a full environmental scan with the omnitool.', check: { skill: 'GU', dc: 2 }, time: 10, to: 'scan_ok', fail: 'scan_bad' },
            { text: 'Sit up, stop being dramatic, and look around.', time: 5, to: 'clearing' },
        ],
    },
    yuki_check: {
        id: 'yuki_check', title: 'Root-kin', art: 'yuki_close', place: 'Unknown forest',
        enter: (g) => { bumpRel(g, 'Yuki', 2, 1); advance(g, 5); return ['Yuki: bond steady.']; },
        text: (g) => `She holds still for all of it, which tells you how frightened she was. ${(g.yuki.primaries ?? 12) >= 12 && (g.yuki.collaterals ?? 66) >= 66
        ? 'Twelve primaries open and sixty-six collaterals, a match for yours. You were born on the same day, in the same grove, and her meridians have kept step with yours ever since, a reflection in still water.'
        : `Her meridians have gone grey. ${g.yuki.primaries ? `${g.yuki.primaries} of twelve primaries lit, ${g.yuki.collaterals} of sixty-six collaterals` : 'All twelve primaries and all sixty-six collaterals'}${g.yuki.primaries ? ', the rest' : ','} sealed under a crust of ash, exactly like yours. The crossing did it: this world's Qi walked in through every open door and burned the frames out behind it. You were born on the same day, in the same grove, and her meridians have kept step with yours ever since, a reflection in still water. Even in this. In this most of all. The Axiom is already gnawing at the ash. Clearing it will take sessions, plural.`}
Mortal Vessel, the pair of you. Young, as your people count it. Larval, near enough.

Down the bond comes a feeling that translates, roughly, as: *the air tastes wrong and you smell of burnt lab.*

"No argument on either."

The air does taste wrong. There is Qi here, thick and heavy and everywhere, but it lies on the tongue like smoke off something that died angry.`,
        choices: [
            { text: 'Scan the environment now that she\'s settled.', check: { skill: 'GU', dc: 2 }, time: 10, to: 'scan_ok', fail: 'scan_bad' },
            { text: 'Get moving.', to: 'clearing' },
        ],
    },
    scan_ok: {
        id: 'scan_ok', title: 'Readings', art: 'omnitool', place: 'Unknown forest',
        text: `The omnitool opens a pane of light across your vision. Oxygen: a little rich. Gravity: 0.97 of home. The sun's spectrum: hotter, redder. No signal. No satellites. No network. Nobody.

Then the Qi. The tool draws it as a slow fog of particles, and every particle carries a tag your people's instruments call *intent residue*. This world's Qi remembers what it was used for. Mostly, it was used for killing.

"Lovely," you murmur. "A planet with a grudge."

Your Ouroboros Axiom, the pillar every one of your people carries, the loop that runs the body like a closed garden, has already gone to work. Whatever enters through your meridians is filtered, turned over, composted. You can breathe this. Most things here, you suspect, can't. Not without help.`,
        choices: [{ text: 'Find out what "help" looks like around here. Later. First: the clearing ahead.', to: 'clearing' }],
    },
    scan_bad: {
        id: 'scan_bad', title: 'Readings (partial)', art: 'omnitool', place: 'Unknown forest',
        text: `The omnitool manages oxygen, gravity and a sun redder than it has any business being, then trails off into a wounded column of error codes about ambient Qi it cannot classify.

"That makes two of us," you tell it.

No signal. No network. You are, in the strict technical sense, extremely lost.`,
        choices: [{ text: 'Head for the light between the trees.', to: 'clearing' }],
    },
    clearing: {
        id: 'clearing', title: 'The Clearing', art: 'clearing', place: 'Blackroot Wilds — a clearing',
        text: (g) => `The trees give way to a clearing of grey grass and old stones. Beyond it, out of sight, water is running. Your stomach points out, politely for now, that you skipped breakfast and possibly an entire universe.

${g.flags.bone_ok ? 'Your palm is still warm where the bone came through. It feels like a promise.' : 'One thing you own, nobody here can take: your Bonesinger gift, the rare one, braided so tightly into your cultivation that the two became a single Convergence. Your people would call it *the white song*. You call it the only reason you survived your teenage years.'}

${g.flags.sat_once ? '' : 'You could also sit down first and taste this world\'s Qi properly. Cultivators at home do as much before drinking from a strange well.'}`,
        choices: [
            { text: 'Sing a single bone needle into your hand. Start small.', show: once('bone_ok'), qi: 1, check: { skill: 'Convergence Use', dc: 2 }, time: 2, do: set('bone_ok'), to: 'first_bone', fail: 'first_bone_fail' },
            { text: 'Sit, breathe, and taste the Qi.', show: once('sat_once'), time: 20, do: set('sat_once'), to: 'meditate1' },
            { text: 'Follow the sound of water.', time: 15, to: 'stream' },
        ],
    },
    first_bone: {
        id: 'first_bone', title: 'The White Song', art: 'bone_needle', place: 'Blackroot Wilds — a clearing',
        text: `You gather nothing. That is the part nobody back home believes until they watch it happen: the material comes from nowhere, from the folded place where Bonesinger and Qi meet, and it comes *instantly*.

Your right sleeve has ridden up past the tree inked on that forearm: curling roots, red streaks, a raven perched in it. From the palm below it a white needle the length of your finger slides out and sets, warm, then cool, hard as fresh antler. You flick it at a trunk. It goes in with a satisfying *tok*.

Yuki trots over, sniffs the needle, and gives you a look that says: *you could have done that when the chamber exploded.*

"I was occupied. Being unconscious."

Darts, then. Needles. A blade as long as a knife, if you push. At your present level that is the whole menu, and it beats the menu called *nothing*.`,
        choices: [{ text: 'Follow the water.', time: 15, to: 'stream' }, { text: 'Taste the Qi first.', show: once('sat_once'), time: 20, do: set('sat_once'), to: 'meditate1' }],
    },
    first_bone_fail: {
        id: 'first_bone_fail', title: 'The White Song (out of tune)', art: 'bone_needle', place: 'Blackroot Wilds — a clearing',
        text: `What leaves your palm is not so much *needle* as *sad white noodle*. It droops. It crumbles. Yuki bats the wreckage into the grass with surgical contempt.

"Warm-up," you say. "Everyone needs a warm-up."

Still: it came. At once, out of nowhere, as it always has. The song is in you. You are merely out of practice and, quite possibly, concussed.`,
        enter: set('bone_ok'),
        choices: [{ text: 'Follow the water.', time: 15, to: 'stream' }, { text: 'Taste the Qi first.', show: once('sat_once'), time: 20, do: set('sat_once'), to: 'meditate1' }],
    },
    meditate1: {
        id: 'meditate1', title: 'The Taste of Ash', art: 'meditation', place: 'Blackroot Wilds — a clearing',
        text: (g) => `You sit. You breathe. You let the world in.

It arrives like a crowd of angry ghosts: grief, hunger, the iron of old blood. Your Ouroboros Axiom catches each of them, turns it over and hands it back clean. What settles in your dantian afterwards is only Qi. Warm. Neutral. Yours.

You suspect, strongly and at once, that nobody on this world can do that. That they need *something*, medicine or herbs or ritual, to scrub what they breathe, and that whatever they use falls short.

`,
        choices: [
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'stream' }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
            { text: 'Enough. Water, food, shelter — the boring holy trinity.', time: 15, to: 'stream' },
        ],
    },
    stream: {
        id: 'stream', title: 'Blackwater', art: 'stream', place: 'Blackroot Wilds — the stream',
        text: (g) => `The stream runs dark over black stones, so cold that your teeth ache from looking at it. ${g.flags.drank ? 'You have drunk your fill.' : 'You are very thirsty.'}

${dayHour(g) >= 17 ? 'The light is turning amber. Night here will be dark in earnest.' : 'The red sun is climbing. The day is yours, and it will not keep.'}

${g.james.satiety < 40 ? 'Your stomach has given up on politeness.' : ''}`,
        choices: [
            { text: 'Test the water with the omnitool before drinking.', show: once('drank'), check: { skill: 'GU', dc: 2 }, xp: false, time: 5, do: set('drank'), failDo: (g) => { g.flags.drank = true; g.james.hp -= 2; return ['You drink before the analysis is done. Your gut takes the matter up at once: −2 HP.']; }, to: 'stream' },
            { text: 'Forage along the bank — berries, fungi, anything that isn\'t trying to eat you.', show: (g) => !g.flags.foraged, time: 40, to: 'forage' },
            { text: 'Hunt. Yuki has been staring at something in the reeds for a while.', show: (g) => !g.flags.hunted, time: 30, to: 'hunt' },
            { text: 'Make camp on the dry rise above the stream.', show: (g) => !!(g.flags.foraged || g.flags.hunted), time: 20, to: 'camp' },
            { text: 'Keep walking downstream until dark.', show: (g) => !g.flags.foraged && !g.flags.hunted, time: 180, to: 'camp' },
        ],
    },
    forage: {
        id: 'forage', title: 'Foraging', art: 'forage', place: 'Blackroot Wilds — the stream',
        enter: set('foraged'),
        text: `Grey moss, black bark, and a riot of growth that appears in none of the field guides you own. You own no field guides. You are the field guide now.

Two candidates. A thorny shrub hung with fat red berries, *exactly* what a planet with a grudge would grow; and a shelf of pale green bracket fungus on a dead log, smelling faintly of almonds and wet paper.

Fungus. At last, a thing you hold an actual doctorate in.`,
        choices: [
            { text: 'The bracket fungus. Spore print, tissue test, the whole ritual.', check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 20, do: (g) => { addItem(g, 'jade_bracket', 3); g.flags.fungus = true; return [`Spore print on a bone sheet, a sliver under the omnitool, a cautious nibble: edible, mild, and quietly murderous to most of the bacteria you can name. Yuki watches the whole ritual from the log and sends you a thought that translates roughly as *you could just eat it.* You could not just eat it. You have standards.`, '+3 Jade bracket fungus (edible, mildly antibiotic).']; }, failDo: (g) => { addItem(g, 'jade_bracket', 1); return ['You get one clean piece before the rest crumbles. +1 Jade bracket fungus.']; }, to: 'stream' },
            { text: 'The berries. Omnitool analysis, then a tiny taste.', check: { skill: 'GU', dc: 3 }, time: 15, do: (g) => { addItem(g, 'crimson_berry', 6); eat(g, 8, { yuki: false }); return ['They pass. +6 Crimson needleberries, and a handful go straight down: +8 satiety.']; }, failDo: (g) => { g.james.hp -= 3; return ['The analysis said "probably". Your intestines overrule it. −3 HP.']; }, to: 'stream' },
            { text: 'Both. You\'re hungry and the day isn\'t getting longer.', check: { skill: 'GU', dc: 4, bonus: () => 1 }, time: 35, do: (g, r) => { addItem(g, 'jade_bracket', 3); addItem(g, 'crimson_berry', 6); eat(g, 8, { yuki: false }); g.flags.fungus = true; return [r && r.ratio < 1 ? `You do it the fast way, which turns out not to be the right way: half the shelf crumbles and the berries are mostly thorns. Yuki sniffs a berry, stares at it, and bats it into the stream, which you choose to take as peer review.` : `You do it the fast way and the right way at once, a thread on the fungus and a thread on the berries, and for a moment it's almost like working in a lab again, except for the cat and a sky the colour of a bruise. Yuki sniffs a berry, stares at it, and bats it into the stream, which you choose to take as peer review.`, '+3 Jade bracket fungus, +6 Crimson needleberries, +8 satiety.']; }, failDo: (g) => { addItem(g, 'jade_bracket', 1); g.james.hp -= 2; return ['+1 Jade bracket fungus, and one berry too many: −2 HP.']; }, to: 'stream' },
        ],
    },
    hunt: {
        id: 'hunt', title: 'The Hunt', art: 'hunt', place: 'Blackroot Wilds — the reeds',
        enter: set('hunted'),
        text: `A hare sits in the reeds. Probably a hare. The ears are right and the nose is right, but along its back runs a ridge of clear, glassy plates, and the light passing through them scatters small rainbows over the mud.

"Glassback," you whisper, because biologists cope by naming things.

Yuki lies flat to the ground, tail-tip twitching. One thought comes down the bond, clear as crystal: *mine.*`,
        choices: [
            { text: 'A bone dart, thrown from cover. Clean and quick.', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 10, do: (g) => { addItem(g, 'hare_raw', 2); return ['+2 Glassback hare (dressed). Yuki pretends she let you have it.']; }, to: 'stream', fail: 'hunt_miss' },
            { text: 'Let Yuki drive it toward you, then grab.', check: { skill: 'GU', dc: 4, bonus: (g) => (yukiFightSkill(g).level >= 2 ? 1 : 0) }, time: 20, do: (g) => { addItem(g, 'hare_raw', 2); bumpRel(g, 'Yuki', 2, 0); return ['+2 Glassback hare (dressed). Teamwork. Disgusting, bloody teamwork.']; }, to: 'stream', fail: 'hunt_miss' },
            { text: 'Leave it. Glass armour sounds like a learning experience you don\'t need.', to: 'stream' },
        ],
    },
    hunt_miss: {
        id: 'hunt_miss', title: 'The One That Got Away', art: 'hunt', place: 'Blackroot Wilds — the reeds',
        text: `The hare goes up like a firework made of rainbows and is gone. Yuki stalks out of the reeds, mud to the elbows, with the face of someone drafting a letter to your superiors.

"In my defence," you say, "it was made of glass."

The defence is not accepted.`,
        choices: [
            { text: 'Try again further downstream.', show: (g) => !g.flags.hunt2, time: 30, do: set('hunt2'), check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, qi: 2, xp: true, failDo: () => [`Downstream there is a second hare, and a bone dart, and the dart ends up in the mud a hand's width from where the hare was. Yuki does not come back out of the reeds for some time. When she does, she walks past you to the water and drinks, slowly, with her back turned.`], to: 'hunt_got', fail: 'stream' },
            { text: 'Back to the stream.', to: 'stream' },
        ],
    },
    hunt_got: {
        id: 'hunt_got', title: 'Second Chances', art: 'hunt', place: 'Blackroot Wilds — the reeds',
        enter: (g) => { addItem(g, 'hare_raw', 1); return ['+1 Glassback hare (dressed).']; },
        text: `The second one is slower, or you are quicker, or the universe owed you. The dart takes it behind the ear. You dress it with a small bone knife that you grow, use and dissolve, because you can, and because the other tool on offer is your teeth.`,
        choices: [{ text: 'Back to the stream.', to: 'stream' }],
    },

    camp: {
        id: 'camp', title: 'Camp', art: 'camp', place: 'Blackroot Wilds — the dry rise',
        text: (g) => `${byNight(g, ['A dry rise above the water, a fallen trunk to put your back against, a sky turning the colour of wine.', `The dry rise again, and the fallen trunk, which has kept the shape of your back. The sky is going from bruise to wine, on schedule.`, `The dry rise, the fallen trunk, the sky going to wine. You could draw it from memory, and one thread already has. The moss where you sit has given up.`])}

${foodCount(g) ? `${byNight(g, ['You have food', 'In the larder, such as it is', `Tonight's menu, in full`])}: ${[g.inventory.hare_raw ? `${g.inventory.hare_raw} hare` : '', g.inventory.jade_bracket ? `${g.inventory.jade_bracket} fungus` : ''].filter(Boolean).join(', ')}.` : byNight(g, ['You have no food. You have a cat, who is looking at you like *you* are the food.', `You have no food. Yuki has noticed, and is letting you know that she has noticed.`, `You have no food. Yuki has stopped looking at you and started looking at the trees, which is worse: she is drawing up alternatives.`])}
${g.flags.fire ? byNight(g, ['The fire crackles and spits, pleased with itself.', `The fire crackles like something with tenure, and holds views on damp wood.`, `The fire keeps low and even, with nothing left to prove.`]) : 'No fire yet.'} ${g.flags.stakes ? byNight(g, ['A ring of bone stakes leans outward round the camp, white and new.', `Round the camp the stakes stand in their circle, bone gone grey at dusk, each tip tilted toward the treeline.`, `The bone stakes lean outward in their ring, points to the dark. Whatever circles out there tonight will have to mean it.`]) : ''}`,
        choices: [
            { text: 'Make fire: a bone bow-drill and a lot of swearing.', show: once('fire'), check: { skill: 'GU', dc: 3 }, time: 25, do: set('fire'), failDo: (g) => { advance(g, 20); g.flags.fire = true; return ['Three times the work and one blister later, there is fire.']; }, to: 'camp' },
            { text: 'Cook and eat.', show: (g) => g.flags.fire && foodCount(g) > 0, time: 20, do: (g) => cookMeal(g), to: 'camp' },
            { text: 'Eat it raw. Civilisation is a state of mind.', show: (g) => !g.flags.fire && g.inventory.hare_raw > 0, check: { skill: 'GU', dc: 2 }, xp: false, do: (g) => { addItem(g, 'hare_raw', -1); eat(g, 18); return ['Raw hare: +18 satiety. You resolve never to mention it.']; }, failDo: (g) => { addItem(g, 'hare_raw', -1); eat(g, 10); g.james.hp -= 2; return ['Raw hare: +10 satiety, −2 HP. You resolve, more firmly, never to mention it.']; }, to: 'camp' },
            { text: 'Sing a ring of bone stakes around the camp, points outward.', show: once('stakes'), qi: 3, check: { skill: 'Convergence Use', dc: 2 }, time: 15, do: set('stakes'), to: 'camp' },
            { text: 'Night falls. Settle in.', to: 'night', do: (g) => { const p = clockParts(g.minutes); if (p.hh < 21 && p.hh >= 6) g.minutes = (p.day - 1) * 1440 + 21 * 60; return []; } },
        ],
    },
    night: {
        id: 'night', title: 'Night', art: 'forest_night', place: 'Blackroot Wilds — the dry rise',
        text: (g) => byDay(g, [(g) => `Night on this world is not a lack of light. It is a presence. The black trees drink the stars. Something far off screams, stops, and does not scream again.

${g.flags.fire ? 'The fire makes a small, defiant room in the dark.' : 'Without fire, the dark comes right up to your knees.'} ${byForm(g, 'Yuki climbs into your lap', 'Yuki lies down around you', 'Yuki sits down against your side')}, which she only does when she thinks one of you needs it.

${(g.flags.forest_day || 1) > 1 ? 'Another night in the Blackroot. Your watch-thread is already spinning up before you ask.' : 'Your Parallel Cognition offers, unprompted, to spin up a thread for watch-keeping. Nine threads, and one of them never sleeps unless you tell it to.'}`, (g) => `The dark comes down the way it did before: all at once, and personally. The black trees take the stars one at a time. Somewhere off to the left something large walks a slow circle round the rise and does not come closer, which you decide to take as manners.

${g.flags.fire ? `The fire holds its small room open against the dark.` : `With no fire, the dark sits down beside you like an acquaintance.`} ${byForm(g, 'Yuki is in your lap before you have finished sitting down', 'Yuki has laid herself round you before you have finished sitting down', 'Yuki has settled against your side before you have finished sitting down')}, and neither of you mentions it.

${(g.flags.forest_day || 1) > 1 ? `Another night in the Blackroot. The watch-thread is up and turning before you have thought to ask.` : `Your Parallel Cognition puts a thread forward for the watch again, unasked. Nine threads, and one of them is content never to sleep.`}`, // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the third night (ST1)
            (g) => `Night arrives without the courtesy of a dusk. The black trees have the stars put away before you can count them. Tonight nothing screams, and nothing walks a circle round the rise. The forest is quiet in the way of a room where people have just stopped talking about you.

${g.flags.fire ? `The fire keeps its small room, and tonight the dark stands at the door of it and does not pretend to be anywhere else.` : `With no fire, the dark has nothing to stay outside of, and doesn't.`} ${byForm(g, `Yuki gets into your lap and stays sitting up, ears turning, facing out.`, `Yuki lies down round you with her head up and her ears turning, facing out.`, `Yuki sits down against your side with her back half to you, ears turning, facing out.`)}

One of your nine threads has taken the watch before you have decided anything, and settles to it like a dog on a doorstep.`], 'night'),
        choices: [
            { text: 'Leave a thread on watch and sleep.', do: set('watch'), to: nightNext },
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: nightNext }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
            { text: 'Just sleep. You\'ve earned it.', to: nightNext },
        ],
    },
    night_attack: {
        id: 'night_attack', title: 'Ashfangs', art: 'jackals', place: 'Blackroot Wilds — the dry rise',
        enter: (g) => nightTo(g, 80), /* v0.11.40 (N1): never back (entered after 01:20, the clock stays); v0.11.91: after the bed (from 21:00), at 01:20; v0.11.151 (WD1, LN): the slept line */
        text: (g) => `${g.flags.watch ? 'The watch-thread hauls you awake a full three seconds before anything happens. Three seconds is plenty.' : 'Yuki\'s claws in your thigh wake you. Those, and the smell.'}

${g.flags.stakes ? 'Something yelps on your bone stakes: one of the visitors is bleeding before it has begun.' : ''} Shapes at the edge of the ${g.flags.fire ? 'firelight' : 'dark'}: grey hides, black lips drawn back from teeth, and from the teeth a drip that smokes where it lands on the moss.

Ashfang jackals. You have never seen one, and you would know them anywhere: they look exactly as this world's Qi tastes.`,
        choices: [
            { text: 'Fight.', combat: jackals, to: 'jackals_won' },
            { text: 'Bone wall between you and them, then run for the water.', qi: 4, check: { skill: 'Convergence Use', dc: 4 }, to: 'jackals_fled', fail: 'night_attack_forced' },
        ],
    },
    night_attack_forced: {
        id: 'night_attack_forced', title: 'Ashfangs', art: 'jackals', place: 'Blackroot Wilds — the dry rise',
        text: (g) => `The wall comes out knee-high and full of holes. The jackals step over it with an air of professional courtesy. Running is off the table.${byForm(g, '', NA_TIGER, '')}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fine. Fight.', combat: jackals, to: 'jackals_won' }],
    },
    jackals_won: {
        id: 'jackals_won', title: 'Teeth in the Dark', art: 'jackals_dead', place: 'Blackroot Wilds — the dry rise',
        enter: (g) => { addItem(g, 'jackal_fang', 4); addItem(g, 'beast_core', 1); g.flags.jackals = 'won'; return ['+4 Ashfang fangs, +1 Murky beast core.']; },
        text: `When it is over you are breathing hard, white bone stands out of the grey bodies, and Yuki is washing her face with the deep calm of an old hand at this. She isn't one. Neither are you.

In the chest of the largest, where a heart ought to be, the omnitool flags a hard, cloudy knot the size of a walnut. *Beast core*, your threads supply, cross-referencing nothing whatsoever. Dense with that foul Qi.

You suspect the locals would kill for it, and that this is no figure of speech. It will keep. What remains of the night is short, and the sleep in it will be the thin kind.`,
        choices: [{ text: 'Sleep. What\'s left of the night.', do: (g) => [nightRest(g)], to: 'dawn' }], // v0.11.92 (O1): half back after the fight; v0.11.167 (CA1, RV1 M4): the label fits it
    },
    jackals_lost: {
        id: 'jackals_lost', title: 'Teeth in the Dark', art: 'jackals', place: 'Blackroot Wilds — the dry rise',
        enter: (g) => { g.flags.jackals = 'lost'; delete g.inventory.hare_raw; return ['The jackals take your food and a little skin. Your throat, you keep.']; },
        text: (g) => `${byForm(g, "You go down. The last thing you see is Yuki — all eleven pounds of her — standing over you with her fur on end, screaming a sound a cat should not be able to make.", "You go down. The last thing you see is Yuki — all four hundred pounds of her — standing over you with her fur on end, making a sound a cat her size is fully entitled to make.", "You go down. The last thing you see is Yuki — all of her, in a dress — standing over you with her ears flat and her tail on end, screaming a sound a woman should not be able to make.")}

The jackals hesitate. Then they take the hare and go. Perhaps they disliked her odds. Perhaps they disliked what runs in your blood.

${byForm(g, "You wake up an hour before dawn, alive, aching, and covered in cat.", "You wake up an hour before dawn, alive, aching, and underneath a good deal of cat.", "You wake up an hour before dawn, alive, aching, and with your head in Yuki's lap.")}`,
        choices: [{ text: 'Get up. Slowly.', do: (g) => { sleepUntil(g, 6); g.james.hp = Math.ceil(g.james.hp * 0.6); return ['You slept, and not well. HP partly back, Qi full.']; }, to: 'dawn' }],
    },
    jackals_fled: {
        id: 'jackals_fled', title: 'Retreat', art: 'stream', place: 'Blackroot Wilds — the stream',
        enter: (g) => { g.flags.jackals = 'fled'; g.flags.night_fight = 'run'; return []; }, // v0.11.92 (O1, F): a run costs sleep like a fight
        text: (g) => `You end up waist-deep in black water, which the jackals hate more than they hate you. They pace the bank until the sky greys, then melt into the trees.

You are cold, wet, alive and furious, and Yuki — ${byForm(g, "perched on your shoulder,", "stretched out on the one rock in midstream,", "standing on the one rock in midstream with her hem held up,")} dry, smug — is only three of those things.`,
        choices: [{ text: 'Climb out and get warm.', do: (g) => [nightRest(g)], to: 'dawn' }], // v0.11.92 (O1, F): half the missing HP and Qi back (was HP 80%, Qi full)
    },

    /* ================= DAY 2 ================= */
    dawn: {
        id: 'dawn', title: (g) => (g.flags.long ? 'Day Four' : 'Day Two'), art: 'forest_dawn', place: 'Blackroot Wilds',
        text: (g) => `Morning comes up red. You eat ${foodCount(g) ? 'what\'s left' : 'nothing, a meal you are getting very good at'}, and you are working out which direction counts as *away* when the scream comes.

Human. A woman's. More fury in it than fear, and a good deal of swearing folded in. A few hundred metres east, down the slope.

Yuki is already looking at you. You are already moving. You have a type of stupid, it seems, and this is the one.`,
        enter: (g) => cookMealMorning(g),
        choices: [
            { text: 'Run straight toward it.', time: 5, to: 'herb_girl' },
            { text: 'Come in quietly, from above, and see what you\'re dealing with.', check: { skill: 'GU', dc: 3 }, time: 10, do: set('sneak'), to: 'herb_girl', fail: 'herb_girl' },
            { text: 'Not your world, not your fight. Head for the ridge.', time: 60, to: 'ridge_alone' },
        ],
    },
    herb_girl: {
        id: 'herb_girl', title: 'Outer Disciple', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: (g) => `${g.flags.sneak ? 'From the rocks above you get the whole picture before anyone gets you.' : 'You come over the rise faster than dignity allows.'}

A woman of perhaps twenty-five, in a white jacket with a red sash and a long dark skirt, a red ribbon in her black hair, stands with her back to a boulder and a herb-knife in her fist. Her basket lies on its side, spilling something that glows a faint green. Facing her: a young man in crimson robes, a lotus stitched on each sleeve as though it were bleeding, and a pock-faced hulk with a hatchet.

"The tribute is due ${g.flags.long ? 'in three days' : 'tomorrow'}," Crimson Robes is saying, with the grave, unhurried patience of a magistrate reading a sentence. "And you laughed at an outer disciple of the Crimson Lotus before the whole slope, Mei Lin. Face is owed. The Ninefold grass is forfeit, and tonight you will serve tea in my quarters, as penance. Otherwise the Elder learns that your mother has been hiding a spirit root in that house."

"My mother is *sixty*, you overdressed rooster—"

"Then she will serve the Sect for as many years as Heaven leaves her," he says, without heat. "That is the law. You ought to have remembered her before you laughed."

Your Parallel Cognition has him labelled already. Qi like a coal under ash, banked and mean: one clear rung above a mortal, and worn like a mountain. A cultivator.

He glances at you once, the quick appraising glance cultivators here give everyone — *root? realm? threat?* — and finds nothing. No root. No Qi. Not a flicker. ${byForm(g, "His eyes slide off you the way they'd slide off a fence post.", "His eyes slide off you the way they'd slide off a fence post, and off Yuki the way they'd slide off a second, larger fence post.", "His eyes slide off you the way they'd slide off a fence post, and off Yuki the way they'd slide off a second, shorter fence post: they catch on the ears for exactly as long as dignity permits, which is not long.")} You, apparently, do not register. Of the local kind, and of the kind that likes it.`, // v0.11.130 (YB1, HG; Fable's MAIN): the human's glance
        choices: [
            { text: '"Morning. Is this a private extortion or can anyone join?"', check: { skill: 'GU', dc: 4 }, to: 'gao_talked', fail: 'gao_fight_start' },
            { text: 'A bone needle through the back of his hand, before he knows you\'re here.', show: (g) => !!g.flags.sneak, qi: 3, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, do: set('gao_hand'), to: 'gao_hand', fail: 'gao_fight_start' },
            { text: 'Step in front of her and let him make the first mistake.', to: 'gao_fight_start' },
        ],
    },
    gao_hand: {
        id: 'gao_hand', title: 'A Point Made', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: `The needle goes in between two knuckles, comes out the far side, and pins Crimson Robes' hand to his own sleeve. He makes a noise like a kettle.

"Hi," you say, and stand up on the rocks with the morning sun behind you, which is cheap, and works. "I need you to leave her alone."

He stares at the white needle. Then at you. Then, and here it gets interesting, he looks *afraid*. Not of the hole in his hand. Of the bone.

"Not a beast," he says. "Not a sect. What *are* you?"`,
        choices: [
            { text: '"Leaving. Is what you are. Now."', check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.gao_humiliated = true; bumpRel(g, 'Mei Lin', 10, 3); return []; }, to: 'gao_fled', fail: 'gao_fight_start' },
            { text: 'Don\'t answer. Grow a blade instead.', to: 'gao_fight_start' },
        ],
    },
    gao_talked: {
        id: 'gao_talked', title: 'Words', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { g.flags.gao_humiliated = true; bumpRel(g, 'Mei Lin', 8, 2); return []; },
        text: (g) => `It turns out that a tall foreigner in a strange white coat, who walks into an extortion with ${byForm(g, "a cat on his shoulder", "a cat the size of a tiger at his side", "a cat-eared woman in a black dress at his elbow")} and the bored tone of a man complaining about a parking ticket, does not compute for Crimson Robes.

You talk. Your sarcasm is thorough. At one point you call his lotus embroidery "a cry for help". The lackey goes rigid with outrage on his master's behalf, which is, if anything, funnier.

Crimson Robes (*Gao Feng, Outer Disciple of the Crimson Lotus Sect, of Foundation rank*, he informs you, as if either half should mean something) concludes that his face will not survive another minute of this. Before he goes he turns, bows a precise and furious quarter-bow, and declares formally, before Heaven and witnesses, that the insult will be repaid in blood.

"Put it on my tab," you tell his back.`,
        choices: [{ text: 'Turn to the woman with the knife.', to: 'mei_lin' }],
    },
    gao_fight_start: {
        id: 'gao_fight_start', title: 'Crimson Lotus', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: (g) => `${byForm(g, "Gao Feng decides that whatever you are, you are alone, unarmed, and wearing a lab coat. He has looked at you with his Qi-sense and felt nothing at all: a mortal.", "Gao Feng decides that whatever you are, you are unarmed, wearing a lab coat, and alone but for a cat. He has looked at you both with his Qi-sense and felt nothing at all: a mortal, and a mortal's very large cat.", "Gao Feng decides that whatever you are, you are unarmed, wearing a lab coat, and alone but for a slight woman in a black dress. He has looked at you both with his Qi-sense and felt nothing at all: a mortal, and a mortal's woman, with something about her ears that it is beneath an outer disciple to notice.")} "Pock-Face," he says, without turning his head, "teach the peasant to kneel." The lackey grins and cracks his knuckles at you, which is the first time anyone has done that outside a film.

All of it is true. None of it is the whole truth.`, // v0.11.130 (YB1, GA; Fable's MAIN): the human, not alone
        choices: [{ text: 'Fight.', combat: gaoFight, to: 'gao_won' }],
    },
    gao_fled: {
        id: 'gao_fled', title: 'Retreat with Honour (Allegedly)', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: (g) => `Gao Feng pulls the needle out with his teeth, which is either very brave or very stupid, and backs away with his lackey.${byForm(g, '', ' He keeps his eyes on Yuki the whole way down, which is the first sensible thing he has done all day. Yuki, at your side, yawns at him. It takes a while and shows him everything.', '')} "The Crimson Lotus will hear of you," he hisses.

"Wonderful. Tell them I'm free on Thursdays."

The needle dissolves in his mouth halfway down the hill. You can hear him spit for a long time.`, // v0.11.127 (LP1, FL; Fable's MAIN): the great root-kin's lines
        choices: [{ text: 'Turn to the woman with the knife.', to: 'mei_lin' }],
    },
    gao_won: {
        id: 'gao_won', title: 'Crimson on the Grass', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { g.flags.gao_beaten = true; bumpRel(g, 'Mei Lin', 12, 4); return []; },
        text: `Gao Feng ends on his back, a bone needle through his sleeve and into the ground, and the lackey ends halfway to the next valley. You are bleeding a little. You are also, you notice, grinning, and that will want thinking about later.

"Kill him," says the woman with the knife, quite calmly. "If he goes back, they will come for my mother. They will come for the village."

That isn't sarcasm. You check. It isn't.`,
        choices: [
            { text: 'Break him. Not dead — you don\'t do that. Just finished.', do: (g) => { g.flags.gao_broken = true; bumpRel(g, 'Mei Lin', 6, 2); return ['Gao Feng will live. He will never forget who saw to that.']; }, to: 'gao_dead' },
            { text: 'Let him crawl home. You\'re a biologist, not an executioner.', do: (g) => { g.flags.gao_spared = true; return []; }, to: 'gao_spared' },
        ],
    },
    gao_lost: {
        id: 'gao_lost', title: 'Face in the Dirt', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { g.flags.gao_won_fight = true; bumpRel(g, 'Mei Lin', 6, 2); g.james.hp = Math.max(3, g.james.hp); return []; },
        text: (g) => `You end up face down in the herbs with Gao Feng's boot on your neck and the taste of blood and mint in your mouth. He takes his time telling you what he's going to do to you.

He doesn't get to finish. ${byForm(g, "Eleven pounds of white cat land on his face, all claws, and while he's screaming and spinning,", "Four hundred pounds of white cat take him off your neck and a fair way across the herb bed, and while he's screaming and rolling,", "Yuki lands on his back in a black dress, all nails, and while he's screaming and spinning,")} Mei Lin puts her herb-knife through the lackey's thigh and her basket over Gao Feng's head.

By the time he has fought his way out of it, the three of you are fifty metres down the slope and running.

"You," Mei Lin pants, "are the worst rescuer I have ever had."

"How many have you had?"

"*One.*"`,
        choices: [{ text: 'Keep running. Then walk. Then breathe.', time: 20, to: 'mei_lin' }],
    },
    gao_dead: {
        id: 'gao_dead', title: 'The First Rule, Amended', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        text: `You do not kill him. You are a biologist: you know precisely how much of a body can be broken without ending it, and you walk up to that line and stop.

One needle through each of the three meridian knots in his sword arm, exact as a lab protocol. You feel the Qi in them crack like ice on a puddle. Then you take the arm itself, at the elbow, the wrong way, and the sound he makes has no dignity in it at all. He will heal. He will not hold a sword in that arm, or gather Qi into it, for more seasons than he will want to count.

He lies in the herbs, white and sweating, staring up at you. "Mortal," he whispers, as if the word had betrayed him. "You're a *mortal*. The Foundation feels every vessel beneath it. I would feel you. There is nothing in you. *Nothing.*"

"Yes," you agree. "Think it over on the walk home."

Mei Lin goes through his sleeves while he lies there, and comes out with a pouch of rough grey pills and a jade token. The pouch she hands to you. Her hands are not quite steady.

"I told you to kill him," she says, very quietly. "Now he goes home alive and broken, and tells them a mortal did it. Do you understand what you have *done*?" She looks at you as though you had grown a second head. "In this world the dead keep quiet. The shamed never do."

"I'll take my chances with loud," you say. "The other thing, I don't do. Not to people."

She holds the stare well past the point of manners. Then, under her breath, a word that could be *idiot* and could, just possibly, be *thank you*.`,
        enter: (g) => { g.flags.gao_broken = true; addItem(g, 'beast_core', 1); return ['+1 Murky beast core (from Gao Feng\'s pouch). Mei Lin keeps his jade token.']; },
        choices: [{ text: 'Go with her. Behind you, Gao Feng is still swearing — slowly, and in great detail — what his Sect will do to you.', to: 'mei_lin' }],
    },
    gao_spared: {
        id: 'gao_spared', title: 'Mercy, Probably a Mistake', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        text: `Gao Feng crawls, then limps, then runs. Mei Lin watches him all the way down with her jaw set.

"That," she says, "will come back with friends."

"Most problems do," you admit. "I would still sooner be the sort of person who has that problem."

She studies you. Something in her face shifts. Not agreement. Curiosity.`,
        choices: [{ text: 'Go with her.', to: 'mei_lin' }],
    },
    mei_lin: {
        id: 'mei_lin', title: 'Mei Lin', art: 'mei_lin', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { addItem(g, 'spirit_grass', 1); return ['+1 Ninefold spirit grass (a thank-you, or a test).']; },
        text: (g) => `Up close she's all edges: sharp cheekbones, sharp eyes, a sharp mouth that has clearly been getting her into trouble for years. Her hands are scarred from herb-knives and her white jacket, tied with a red sash, has been patched by someone who cared more about warmth than looks. She is studying you like you're a plant she can't classify.

"You have no spirit root," she says. "I'd feel one. I feel *nothing* in you: no root, no Qi, not even the low hum a farmer carries home from his field. To my senses you are a stone wearing a coat. You take no pills, either; a pill-eater I can smell from a li off. And you made *bone* out of *air*." It comes out as a charge read before a magistrate. "Which can't be done. Mortals can't. And you are a mortal. I would stake my life on it, and I would lose." She holds out a stem of the glowing grass. "Eat this."

You take it. The stem hums against your palm, hungry and faintly spiteful: Qi packed tight, carrying the same foul residue as everything else here, wrapped in a plant whose one ambition is to be swallowed.

"No thank you."

"Everybody needs grass. Or pills. Or cores. Otherwise you cultivate on dirt, and the first tribulation kills you." Her eyes narrow. "Unless you're a demon. Are you a demon?"

"I'm a mycologist."

"Is that worse?"

"Ask a botanist."

${byForm(g, "Yuki, from your shoulder,", "Yuki, from your side,", "Yuki, at your elbow,")} offers Mei Lin one slow blink. Mei Lin — to her eternal credit — blinks back.`,
        choices: [
            { text: '"Tell me about the tribute. And the tribulations. And why everyone here tastes like a funeral."', do: (g) => { g.flags.lore1 = true; bumpRel(g, 'Mei Lin', 3, 0); return []; }, time: 30, to: 'lore' },
            { text: '"Is there somewhere with a roof and food? I\'ll trade work."', time: 60, to: 'village' },
        ],
    },
    lore: {
        id: 'lore', title: 'The Way of Heaven, Locally', art: 'mei_lin', place: 'Blackroot Wilds — the path down',
        text: `She tells you on the way down, flatly, as other people report the weather.

Cultivators drink the world's Qi, and the world's Qi carries everything that ever died in it. So they scrub it with spirit herbs: Ninefold grass, blood ginseng, whatever comes up on graves. They eat beast cores. They eat pills refined from both. When they can get them, they eat each other's cores. Every rung of the ladder is bought with something. The first, Foundation, makes a disciple; the ones above it make elders.

And at each rung Heaven sends lightning. "Tribulations," she says. "The sky decides you're impure and tries to burn you clean. Most people it just burns."

"How many survive?"

"Of the outer sect? One in thirty. Which is why they need so many of us."

These mountains belong to the Crimson Lotus Sect. The villages pay it in herbs, in grain, and once a year in any child born with a spirit root. A child who comes back has stopped being one. Most don't come back.

You consider your own cultivation: no herbs, no pills, no lightning. A loop that takes the poison in and hands clean Qi back. At home the Qi remembers nothing. It simply *is*.

Then you consider, with some care, what a world like this does with an outlier.

"You went quiet," Mei Lin observes.

"I've just worked out that I'm the most valuable lab animal on the continent."`,
        choices: [{ text: 'Walk on to her village.', time: 40, to: 'village' }],
    },
    ridge_alone: {
        id: 'ridge_alone', title: 'The Ridge', art: 'ridge', place: 'Blackroot Wilds — the ridge',
        enter: set('ignored'),
        text: `The ridge shows you the lie of the land: black forest out to the horizon, mountains like a jaw of broken teeth, and at the forest's heart something enormous and dead. A tree, or what is left of one, taller than anything has a right to stand. Even at this distance your Convergence *answers* it with a faint, sad hum.

Under the ridge sits a village: grey stone, grey thatch, smoke going straight up. People.

The way down crosses the herb slope. A basket lies spilled. A boulder has blood on it. Whoever was here has gone.

Yuki does not look at you. She keeps it up all the way down.`,
        choices: [{ text: 'Go down to the village.', time: 60, to: 'village' }],
    },
    village: {
        id: 'village', title: 'Ashfall', art: 'village', place: 'Ashfall Hamlet',
        enter: (g) => { if (g.flags.ignored) g.flags.mei_bruised = true; if (g.flags.long && !g.flags.vday) g.flags.vday = 1; return []; },
        text: (g) => `Ashfall Hamlet is forty houses of grey stone around a well, a shrine to a god whose face someone has chiselled off, and a tall wooden post hung with red lotus banners. The tribute post. People give it the berth they would give a sleeping dog.

${g.flags.ignored
        ? 'A woman in a patched white jacket and a red sash limps past you with a split lip and an empty basket, and the street falls silent around her. Someone mutters "Gao Feng". Nobody looks at you, the stranger who came down off the ridge at exactly the wrong hour.'
        : 'Mei Lin walks you in like a stray she has decided to keep. "He\'s with me," she tells the street, and the street answers with the silence of people who have spent twenty years watching Mei Lin say the wrong thing to the wrong person. An old woman at the well makes a warding sign. A man turns his head and spits, precisely.'}

${g.flags.long ? 'The tribute falls due in three days, at dawn. The whole village is counting them, and not aloud.' : 'The tribute falls due tomorrow at dawn. The whole village is holding its breath over it.'}`,
        choices: [
            { text: 'Ask for the village elder.', show: once('elder'), time: 30, do: set('elder'), to: 'elder' },
            { text: 'There\'s a sick child — you can hear the coughing. Offer to help.', show: once('healed_try'), time: 60, to: 'heal' },
            { text: 'Offer to hunt for the village. You need food; so do they.', show: once('village_hunt'), time: 120, to: 'village_hunt' },
            { text: (g) => (g.flags.ignored ? 'Find the woman with the split lip and apologise.' : 'Evening. Mei Lin said something about dinner.'), time: 30, to: nextEvening },
        ],
    },
    elder: {
        id: 'elder', title: 'Old Wen', art: 'elder', place: 'Ashfall Hamlet — the elder\'s house',
        text: (g) => `Old Wen is ninety in a village where sixty is Heaven being kind. He is blind in one eye, and he pours tea with the steady hand of a man who has outlived three sect masters and intends to outlive a fourth.

"You eat no pills," he says, before you have finished sitting down. "You carry no smell of grass. And when I reach for you with the little sense ninety years have left me, I find nothing. No root. No sea of Qi. That chair might as well be empty." He frowns at the chair. "Yet Mei Lin says you made a needle out of air. One of these things is untrue, and I am too old to believe it is her. ${yukiMerElder(g)}" He sips. "I would know what you are before the Crimson Lotus does. Their way of learning it is to cut you open."

"There does seem to be a consensus."

"Then hear an old man's advice." He sets the cup down. "${g.flags.long ? 'In three days' : 'Tomorrow'}, the collectors come. An inner disciple leads them: Foundation, a rung no one in Ashfall has stood on. If you are here, they will see you. If they see you, they will want you. You may run ${g.flags.long ? 'before then' : 'tonight'}. No one would blame you." A pause. "Or you may stand in front of us. No one has done that in forty years."

${g.flags.gao_beaten || g.flags.gao_humiliated ? '"You have also," he adds, with no change of voice, "shamed an outer disciple of the Sect on our slope already. Running may no longer be yours to choose."' : ''}`,
        choices: [{ text: 'Thank him. Think about it.', do: (g) => { bumpRel(g, 'Old Wen', 3, 0); return []; }, to: hubOf }], // v0.11.139 (owner pick MW1, MB): Wen +3
    },
    heal: {
        id: 'heal', title: 'The Coughing House', art: 'healer', place: 'Ashfall Hamlet — the coughing house',
        enter: set('healed_try'),
        text: (g) => `A boy of six or seven, bright with fever, and on his calf a wound gone red and swollen and wet. His mother has been packing it with spirit-herb paste, which comes to much the same as packing it with angry ghosts.

You are not a doctor. You are a man who has spent fifteen years on the question of what fungi do to bacteria, and ${g.inventory.jade_bracket ? 'you have a pocketful of bracket fungus that your omnitool swears is quietly, beautifully antibiotic.' : 'by the stream you saw a bracket fungus that may well have been the answer, and you left it on its log.'}`,
        choices: [
            { text: 'Clean it with a bone lancet, dress it with the jade bracket.', show: (g) => (g.inventory.jade_bracket || 0) > 0, check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 60, do: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = true; bumpRel(g, 'Village', 15, 0); return ['The fever breaks before dark. Ashfall will remember it.']; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = 'partly'; bumpRel(g, 'Village', 6, 0); return ['It helps, slowly. He will probably live.']; }, to: hubOf },
            { text: 'Drain and clean it, and ask what herbs they have that don\'t taste of death.', check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { g.flags.healed = 'partly'; bumpRel(g, 'Village', 8, 0); return ['Better. Not well. But better.']; }, failDo: () => [`You drain it and clean it and dress it with the least murderous herb they have, and by the time you leave the boy is no cooler and the wound is no quieter. The mother thanks you, formally, with a bow that goes to the floor, which is worse than if she'd shouted. You walk out into the street with the taste of it in your mouth: the thing you know how to do, and didn't do well enough.`], to: hubOf },
            { text: 'Go back to the stream for the fungus. It\'s two hours there and back.', show: (g) => !(g.inventory.jade_bracket > 0), time: 120, do: (g) => { addItem(g, 'jade_bracket', 2); return ['+2 Jade bracket fungus.']; }, to: 'heal_again' },
        ],
    },
    heal_again: {
        id: 'heal_again', title: 'The Coughing House', art: 'healer', place: 'Ashfall Hamlet — the coughing house',
        text: `You come back mud to the knees, carrying two shelves of pale green fungus, and the mother looks at them as if you had brought her the moon.`,
        choices: [{ text: 'Get to work.', check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 60, do: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = true; bumpRel(g, 'Village', 15, 0); return ['The fever breaks before dark. Ashfall will remember it.']; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = 'partly'; bumpRel(g, 'Village', 6, 0); return ['It helps, slowly.']; }, to: hubOf }],
    },
    village_hunt: {
        id: 'village_hunt', title: 'Ironhide', art: 'boar', place: 'Blackroot Wilds — the oak hollow',
        enter: set('village_hunt'),
        text: `The village hunters no longer go past the oak hollow. An ironhide boar holds it now, with tusks like plough-blades and, they swear, a beast core the size of a fist.

It finds you before you find it. It is the size of a small car, and it has taken your visit *personally*.`,
        choices: [
            { text: 'Darts to the eyes, then the blade.', combat: (g) => ({ id: 'boar', intro: 'The boar paws at the black earth, and the earth shakes under it.', band: 'challenging', enemies: [grow({ name: 'Ironhide boar', hp: 10, dc: 4, atk: 4, dmg: 5, dr: 1 }, forestScale(g), BOAR_GROWTH)], win: 'boar_won', lose: 'boar_lost', flee: hubOf(g) }), to: 'boar_won' },
            { text: 'A pit and a bed of bone spikes. Make it come to you.', qi: 6, check: { skill: 'Convergence Use', dc: 4, bonus: (g) => -Math.floor(forestScale(g) / 2) }, time: 60, to: 'boar_won', fail: 'boar_lost' },
        ],
    },
    boar_won: {
        id: 'boar_won', title: 'Meat for Forty Houses', art: 'boar', place: 'Ashfall Hamlet',
        enter: (g) => { addItem(g, 'beast_core', 1); eat(g, 40); bumpRel(g, 'Village', 12, 0); g.flags.boar = true; return ['+1 Murky beast core. You eat with the village: +40 satiety.']; },
        text: `They come out with carts. By sunset half of Ashfall is grilling ironhide, the children are carrying the tusks to the shrine in solemn procession, and a white-bearded hunter kneels in the dust and formally presents you with his own boar spear, which you take to be the local knighthood. You accept. You have nowhere to keep a spear. Then you remember that you own an infinite closet.`,
        choices: [{ text: (g) => (g.flags.long && dayHour(g) < 16 ? 'Back to the village.' : 'Evening.'), time: 30, to: (g) => (g.flags.long ? (dayHour(g) >= 16 ? nextEvening(g) : hubOf(g)) : 'evening') }],
    },
    boar_lost: {
        id: 'boar_lost', title: 'Ironhide Wins', art: 'boar', place: 'Blackroot Wilds — the oak hollow',
        enter: (g) => { g.james.hp = Math.max(1, Math.floor(g.james.hp * 0.7)); return []; },
        text: (g) => byForm(g, 'You end up up a tree. The boar ends up bored. You both agree to call it a draw, and you limp back to Ashfall with bark in places bark should not go.', 'You end up up a tree. Yuki ends up on the far side of the hollow with a mouthful of ironhide bristle and nothing else. *It has armour,* says the bond. *I have standards.* The boar ends up bored. You both agree to call it a draw, and you limp back to Ashfall with bark in places bark should not go.', 'You end up up a tree. The boar ends up bored. You both agree to call it a draw, and you limp back to Ashfall with bark in places bark should not go.'), // v0.11.127 (LP1, FL; LQ2, TN: Fable's ALT A): the great root-kin's own
        choices: [{ text: (g) => (g.flags.long && dayHour(g) < 16 ? 'Back to the village.' : 'Evening.'), time: 30, to: (g) => (g.flags.long ? (dayHour(g) >= 16 ? nextEvening(g) : hubOf(g)) : 'evening') }],
    },
    evening: {
        id: 'evening', title: 'Dinner', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        enter: (g) => { const p = clockParts(g.minutes); if (dayHour(g) < 19) g.minutes = (p.day - 1) * 1440 + 19 * 60; /* v0.11.37: after midnight (24+) it is already evening: no jump back to 19:00 */ if (!g.flags.ate_dinner) { eat(g, 30); g.flags.ate_dinner = true; return ['Millet, greens and a little smoked fish: +30 satiety.']; } return []; },
        text: (g) => `${g.flags.ignored
        ? 'You find her house by asking. On her doorstep you apologise, properly, with the sarcasm left out. She lets you in, which you had not earned, and sets a bowl in front of you, which you had earned even less.'
        : g.flags.long ? 'Third supper at Mei Lin\'s. Her mother serves you first now, which in Ashfall carries about the weight of a signed adoption certificate.' : 'Mei Lin\'s house is two rooms and a herb loft, and her mother is a small, fierce woman who gives you one look and starts adding millet to the pot.'}

Afterwards her mother informs Mei Lin, in a low, severe voice pitched for you to overhear, that a respectable daughter does not drink plum wine with strange men under her mother's roof. Then she goes to bed. Mei Lin pours herself a second cup the moment the door shuts, and that leaves Mei Lin, a clay lamp, a jar of what may once have been plum wine, and you. Yuki has claimed the warmest place by the stove and is pretending to be asleep, convincing nobody.

The lamp makes Mei Lin's eyes bright. The white jacket is off, its red sash folded on the bench; under them she wears a thin linen shirt, and a collarbone to which your Parallel Cognition has, without consulting you, assigned a whole thread.

"So," she says. "Mycologist."

"Mycologist."

"Explain what that is. Slowly. I've had wine."`,
        choices: [
            { text: 'Tell her. Fungi, the forest that talks underground, the home you lost. Let it be honest.', do: (g) => { bumpRel(g, 'Mei Lin', 6, 6); g.flags.honest = true; return []; }, to: 'evening2' },
            { text: 'Flirt back. Shamelessly. You\'re forty, not dead.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 10); g.flags.flirted = true; return []; }, to: 'evening2' },
            { text: 'Thank her for dinner and sleep by the stove with Yuki.', to: 'tribute_dawn_sleep' },
        ],
    },
    evening2: {
        id: 'evening2', title: 'Lamplight', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        text: (g) => `${g.flags.honest
        ? 'You tell her about home: the grown cities, the Hearth Trees, the woods that sing back when you sing to them. The lab you had meant to leave out, and it comes anyway, along with not knowing whether anyone lived through the blast, and somewhere in there your voice gives up on sarcasm and stays broken for a sentence or two. She says nothing. She puts her hand on yours and leaves it there.'
        : 'You flirt. She flirts back as if it were a duel she has trained for since girlhood. At one point she leans across the table and informs you, in all seriousness, that your coat is ridiculous and she would like to see what is under it. Then she laughs at your face for a full minute, and checks her mother\'s door afterwards.'}

The lamp gutters. Neither of you gets up to trim it.

"They come tomorrow," she says quietly. "Gao Feng's friends. Worse, perhaps. Perhaps they take you, or me, or the boy you ${g.flags.healed ? 'saved' : 'tried to help'}." Her thumb moves slowly over your knuckles. "I don't want to spend tonight afraid of tomorrow."`,
        choices: [
            { text: 'Kiss her.', req: (g) => ((g.rel['Mei Lin']?.a || 0) >= KISS_MEI ? true : 'she isn\'t there yet'), do: (g) => { bumpRel(g, 'Mei Lin', 5, 15); g.flags.romance = true; return []; }, to: 'romance' },
            { text: '"Then don\'t be. Stay up and talk to me until it\'s not night any more."', do: (g) => { bumpRel(g, 'Mei Lin', 8, 4); return []; }, to: 'tribute_dawn_talk' },
            { text: 'Gently, regretfully, say goodnight.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 0); return []; }, to: 'tribute_dawn_sleep' },
        ],
    },
    romance: {
        id: 'romance', title: 'Not Afraid', art: 'romance', place: 'Ashfall Hamlet — the herb loft',
        text: `She kisses like she argues: first, hard, and to win.

Her hands are already pushing the ridiculous coat off your shoulders, then the shirt under it. She stops at your forearms: on the left a serpent closed into a ring, eating its own tail; on the right the inked tree and its raven. "Later you explain those," she says, and makes a small approving sound against your mouth at the rest: the hard, lean body cultivation gives even a man who lives in a lab. You lift her linen shirt over her head. Her skin is warm in the lamplight, scarred in small honest places by herb-knives and thorns, and you kiss each one you can find while she laughs, out of breath, and tows you by the wrist toward the ladder to the herb loft.

The loft smells of dried mint and sun-warm hay. She pushes you down into it and climbs over you, a knee on either side of your hips, the red ribbon gone and her black hair coming loose, and looks down with the sharp, delighted, faintly dangerous expression that you are fairly sure will get you killed one day, and that you would follow straight into a tribulation.

"Slowly," she says. "I told you. I've had wine."

Slowly, then. For a while.

Then not slowly at all.

*

Much later the lamp is out, the hay has got everywhere, and Mei Lin is asleep against you with an arm across your chest, a claim staked. From downstairs the bond delivers Yuki's verdict, short and sour: *finally. Now be quiet.*`,
        choices: [{ text: 'Sleep. For a few hours, the world is just this.', do: (g) => { sleepUntil(g, 5); return ['Slept until 05:00. HP and Qi full.']; }, to: 'tribute' }],
    },
    tribute_dawn_talk: {
        id: 'tribute_dawn_talk', title: 'Until It\'s Not Night', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        text: (g) => `You talk until the lamp dies, and then in the dark, and then until the windows go grey. She falls asleep against your shoulder mid-sentence about a herb that blooms only in snow. You don't move. ${byForm(g, "Yuki climbs into the gap between you as if she'd been invited.", "Yuki lies down across both your feet as if she'd been invited.", "Yuki sits down on your other side and takes the other shoulder, as if she'd been invited.")}`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 5); g.james.hp = Math.ceil(g.james.hp); return ['A few hours of sleep. HP and Qi full.']; }, to: 'tribute' }],
    },
    tribute_dawn_sleep: {
        id: 'tribute_dawn_sleep', title: 'By the Stove', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        text: (g) => `${byForm(g, "You sleep by the stove with a cat on your chest and the sound of somebody else's house breathing around you.", "You sleep by the stove with a cat's head on your chest, which is all of her that fits, and the sound of somebody else's house breathing around you.", "You sleep by the stove, back to back with Yuki, with the sound of somebody else's house breathing around you.")} It's the safest you've felt since the lab. It lasts until dawn.`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 5); return ['Slept until 05:00. HP and Qi full.']; }, to: 'tribute' }],
    },

    /* ================= DAY 3 ================= */
    tribute: {
        id: 'tribute', title: 'The Collectors', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        text: (g) => `They come with the sun: four men in crimson, walking up the road as if they owned it, which they do. At their head is a tall man in a deeper red, a long sword on his back and a face as still as a frozen pond. *Inner Disciple Lu Han*, the whisper runs down the line, and after it, lower, *Foundation*, said as other villages say *flood*. ${g.flags.gao_broken ? 'Gao Feng is with them, carried in a litter at the rear, his sword arm bound to his chest and his face grey. He sees you and says nothing. His eyes cover the rest.' : `Beside him, ${g.flags.gao_beaten ? 'bandaged, his face a mask of cold and formal hatred' : 'his face carefully blank and his eyes not'}, is Gao Feng.`}

Ashfall stands in line at the tribute post with its baskets of grass and grain. ${g.flags.healed === true ? 'The mother of the boy you healed has placed herself very close behind you. So has half the street.' : ''}

Lu Han's gaze goes over the baskets, over the people, and stops at you. Then at Yuki. There it stays.

"Interesting," he says. His Qi-sense reaches for you — it goes over you like a draught under a door — and finds nothing. "No root. No pill-smell. No cultivation at all. A mortal." The same sense moves on to Yuki and reads no realm there either. His gaze sharpens all the same. "${yukiMerLu(g)} A mortal holding a treasure he cannot possibly understand." He tilts his head. "Kneel, stranger, and come with us. The Sect Master will wish to dissect you personally. It is an honour. Few are offered it."

"I've been offered worse," you say. "Not recently."`,
        choices: [
            { text: 'Step forward. "I\'m not kneeling, and nobody\'s paying you today."', combat: collectorsFight, to: 'collectors_won' },
            { text: 'Bluff: a wandering senior of a hidden sect, testing the Crimson Lotus\'s manners. Let a little bone show.', qi: 4, check: { skill: 'GU', dc: 7, bonus: (g) => (g.flags.healed === true ? 1 : 0) + (g.flags.boar ? 1 : 0) + (g.flags.gao_beaten ? 1 : 0) + (g.flags.scouted ? 1 : 0) + (g.flags.gao_turned || g.flags.gao_warned ? 1 : 0) + (g.flags.token_silenced ? 1 : 0) + ((g.rel.Village?.f || 0) >= 40 ? 1 : 0) - Math.floor((forestScale(g) + villageScale(g)) / 2) }, failDo: (g) => { g.flags.tribute_fail = 'bluff'; return []; } /* v0.11.131 (XB2, HP): which offer Lu Han called */, to: 'bluff_win', fail: 'bluff_fail' },
            { text: 'Offer tribute they\'ve never seen: sing a wraithbone hairpin, flawless, and pay the village\'s due with it.', qi: 8, check: { skill: 'Convergence Use', dc: 5, bonus: (g) => -Math.floor((forestScale(g) + villageScale(g)) / 2) }, do: (g) => { addItem(g, 'hairpin', 1); return []; }, failDo: (g) => { g.flags.tribute_fail = 'hairpin'; return []; } /* v0.11.131 (XB2, HP) */, to: 'tribute_paid', fail: 'bluff_fail' },
        ],
    },
    bluff_fail: {
        id: 'bluff_fail', title: 'Called', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        text: (g) => (g.flags.tribute_fail === 'hairpin' ? `The song goes wrong in the first bar. What comes up out of your palm is white, and that is the last thing it has in common with a hairpin: it droops, it has a lump where the leaves should begin, and one end of it is already coming off as powder. You hold it out anyway.

Lu Han does not take it. He looks at it for as long as courtesy requires, the way a magistrate looks at a petition written in the wrong hand, with something close to regret.

"No," he says. "The Sect's due is weighed, and it is whole.${byForm(g, '', " Nor does a mortal bargain with a trinket while the true treasure stands at his heel. That one would have paid for thirty years.", '')} You have failed your village in front of its own elders, and offered the Crimson Lotus sweepings." What is left of it falls out of your fingers without being asked. He draws his sword. "The second is the one that matters."${byForm(g, '', "\n\n*Thirty years,* says the bond, as four hundred pounds of the true treasure gets to its feet beside you. *I'd have said forty. He's rounding down.*", '')}` : `Lu Han watches your performance in silence, the way a judge watches a defendant perjure himself. Then he shakes his head, once, with something close to regret.

"No," he says. "A true senior does not need to announce himself.${byForm(g, '', " Nor is a great beast at a man's heel a senior's Qi. It is a treasure, and treasures are carried by servants.", '')} You have dishonoured yourself, and mocked the Sect." He draws his sword. "The second is the one that matters."${byForm(g, '', "\n\n*Servant,* says the bond, as four hundred pounds of treasure gets to its feet beside you. *He's half right. You do carry things.*", '')}`), // v0.11.130 (YB1, BL; Fable's MAIN): the great root-kin at his heel; v0.11.131 (XB2, HP; RC2, L1 + M2; Fable's MAINs): the hairpin's own, a clear failure
        choices: [{ text: 'Fight.', combat: collectorsFight, to: 'collectors_won' }],
    },
    bluff_win: {
        id: 'bluff_win', title: 'Senior', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { g.flags.ending = 'bluff'; bumpRel(g, 'Village', 20, 0); return []; },
        text: `You don't raise your voice. You let a crown of white bone rise from the earth around the tribute post, slow and silent and beautiful, and you let the Qi in it reach Lu Han: clean, utterly clean, with no trace of the death that soaks everything he has ever eaten. Of the man who made it, his senses still tell him nothing, and a Foundation disciple knows one polite reason why they wouldn't.

To a man of this world, it must be like standing beside the sky.

Lu Han goes still. Then — perfectly, precisely — he bows. Not deep. Just enough.

"This one failed to recognise a senior," he says. "The Crimson Lotus asks no tribute of Ashfall this season. My master will wish to… extend an invitation."

"I'll check my calendar."

They go. Gao Feng looks back once. The look does not mean *goodbye*.`,
        choices: [{ text: 'Breathe out.', to: 'epilogue' }],
    },
    tribute_paid: {
        id: 'tribute_paid', title: 'Heavenly Material', art: 'hairpin', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { addItem(g, 'hairpin', -1); g.flags.ending = 'paid'; bumpRel(g, 'Village', 12, 0); return []; },
        text: `It takes everything you have: a hairpin the length of your hand, white as moonlight, turned in a spiral of leaves so fine that the light goes through them. You have never made anything better. You hand it over as though it were small change.

Lu Han turns it over in his fingers until the men behind him begin to shift. Then he puts it away inside his robe, with great care, over his heart.

"Ashfall's tribute is paid," he says. "In full. For three years." His eyes come back to you. "Whoever you are, Bone-Maker, the Sect will hear of this. Pray that it hears it from me."

The baskets stay where they stand. Nobody in crimson touches one.`,
        choices: [{ text: 'Breathe out.', to: 'epilogue' }],
    },
    collectors_won: {
        id: 'collectors_won', title: 'Red Snow', art: 'collectors_down', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { g.flags.ending = 'fought'; bumpRel(g, 'Village', 25, 0); addItem(g, 'beast_core', 2); return ['+2 Murky beast cores.']; },
        text: `When it is over, the white bone lying like snow around the tribute post is speckled red, Lu Han is on his knees with your blade at his throat, and the other collectors are far down the road and have not stopped running.

Your hands are shaking. It isn't fear. It is that the thing worked.

"Go home," you tell him. "Tell your Sect Master Ashfall has a new neighbour. Tell him the neighbour doesn't eat grass, doesn't eat pills, and doesn't eat people, and would very much like to keep it that way."

He goes. All of Ashfall watches him down the road. Then, slowly, they turn to look at you: the mortal who put a man of Foundation on his knees, which by every rule they were raised on cannot happen. In this world you have just done the one thing more dangerous than kneeling.

You've given people hope.`,
        choices: [{ text: 'Breathe out.', to: 'epilogue' }],
    },
    collectors_lost: {
        id: 'collectors_lost', title: 'Kneel', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { g.flags.ending = 'lost'; g.james.hp = 1; return []; },
        text: (g) => `You go down hard. Lu Han's boot is on your chest and his blade is at your throat and he is looking at you with honest regret.

"A waste," he says. "To be born flawless, and to conduct oneself as a fool."

Ashfall is what saves you. All of it: the boy's mother, the old hunters, the herb-women, Old Wen with his tea, Mei Lin with her knife. Forty houses of grey people rise as one and step between the Crimson Lotus and the stranger who would not kneel.

Lu Han looks them over, unhurried. At how many there are. At what a village costs to replace.

"Next season," he says finally, sheathing his sword, "the tribute doubles. And the Bone-Maker comes with us, or the village burns." He steps off you. "Rest well, senior. You have a year."${byForm(g, '', "\n\nThen he flicks two fingers, and the net comes off Yuki: a spirit-beast net, thrown from his sleeve in the first breath of the fight, before he so much as drew. She has been under it since your knees went. She walks over on legs that aren't quite steady and stands across you. Nobody asks her to move.", '')}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; RB2 (CL): Fable's redraft after the review
        choices: [{ text: 'Get up.', do: (g) => { advance(g, 120, { resting: true }); return []; }, to: 'epilogue' }],
    },
    epilogue: {
        id: 'epilogue', title: 'The Dead Tree', art: 'ridge', place: 'Blackroot Wilds — the ridge',
        enter: (g) => { const p = clockParts(g.minutes); g.minutes = (p.day - 1) * 1440 + 19 * 60; return []; },
        text: (g) => `That evening you climb the ridge ${byForm(g, 'with Yuki on your shoulder', 'with Yuki pacing at your side', 'with Yuki at your elbow')} ${g.flags.romance ? 'and Mei Lin\'s hand in yours' : g.rel['Mei Lin']?.f > 10 ? 'and Mei Lin a step behind you' : 'and nobody else'}.

Below you Ashfall's lamps are lit, one after another. Past them the black forest runs out to the horizon, and at its heart stands what you saw from here before: the corpse of a tree vast enough to scrape the clouds.

Your Convergence *sings* to it. Faint, sad, unmistakable.

Your people grow their cities out of trees like that one. Their ships. Their homes. Hearth Trees. You never expected to see a dead one.

"Something lived there," ${g.flags.romance || g.rel['Mei Lin']?.f > 10 ? 'Mei Lin says, watching your face' : 'you say to Yuki'}. "People, maybe. Like us."

${byForm(g, 'Yuki\'s tail curls around your neck.', 'Yuki\'s tail curls around your wrist.', 'Yuki\'s tail curls around your wrist.')} Through the bond, very clearly: *then let's go and find out who killed it.*

You're forty. You have a fresh doctorate, ${byForm(g, 'a cat', 'a cat the size of a tiger', 'a cat who is currently a woman')}, an empty closet the size of a universe, and a gift this world has never seen. Everything in it would like to eat you.

"Sure," you say. "What could possibly go wrong."

— **End of the Prologue.** —`,
        choices: [{ text: 'Act 1: The Hearth Tree.', do: (g) => { const d = Math.floor(g.minutes / 1440) + 1; g.minutes = Math.max(d, 7) * 1440 + 6 * 60; g.james.hp = Math.max(g.james.hp, 1); return []; }, to: 'fo_start' }],
    },
};

/** Morning meal on Day 2 (whatever food is left, cooked if there's a fire). */
function cookMealMorning(g) {
    const out = [];
    if (hasItem(g, 'hare_raw')) { addItem(g, 'hare_raw', -1); eat(g, g.flags.fire ? 35 : 18); out.push(`Breakfast: hare, +${g.flags.fire ? 35 : 18} satiety.`); }
    else if (hasItem(g, 'jade_bracket')) { addItem(g, 'jade_bracket', -1); eat(g, 15); out.push('Breakfast: fungus, +15 satiety.'); }
    else if (hasItem(g, 'crimson_berry', 3)) { addItem(g, 'crimson_berry', -3); eat(g, 8, { yuki: false }); out.push('Breakfast: berries, +8 satiety.'); }
    return out;
}

Object.assign(SCENES, MERIDIANS, WILDS, ASHFALL, FALLOUT, BLACKROOT, HEART, RETURN, LONGFOREST);

/* the way into the Long Forest (pre-prologue): from the Day 1 clearing */
/** The Long Forest's stock (its hauls fill the hammerspace with these). The one-button Long Forest (Story Mode) is gone since v0.11.41. */
export const LF_STOCK = ['hare_raw', 'jade_bracket', 'crimson_berry', 'spirit_grass', 'beast_core', 'fowl_raw', 'crab_meat', 'honeycomb', 'lizard_egg', 'river_cress', 'venison', 'ghost_gill', 'bone_meal', 'crow_feather'];
SCENES.clearing.choices.push({ text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'clearing' }); // v0.11.41 (D2-a): Story Mode's one-step Long Forest; the place kept (choice indices)
installYukiPath(SCENES);

/* ---------- breakthrough: offered at calm moments whenever Saturation is 100% ---------- */
const VILLAGE_SCENES = ['village', 'ashfall', 'supper'];
/** v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): a breakthrough text for each realm from True Core (3) to Heavenly Immortal (14), each with its own closer
 *  by night and by day; Core Formation (2) keeps the old text. The village's closer (the prologue only) stays the old one, except
 *  on the two realms where the sky doesn't come (10, 11), which keep their own closer. (ST4) */
export const BT_REALMS = {
    3: { body: `True Core. The loop closes, and what was formed sets, the way a thing does when it stops being new.

The sky comes anyway. Fewer clouds than before, and the hum has dropped a tone. The lightning goes over you the way a man goes through his pockets for a key he already knows is on the table: thoroughly, and without hope. Then it goes. The air, when you try it, runs a little quicker under you than it did.`,
        night: `Yuki opens one eye, confirms the sky, and closes it. Out in the dark, something that had been coming closer does the arithmetic and turns round.`,
        day: `Yuki opens one eye, confirms the sky, and closes it.` },
    4: { body: `Golden Core. On this world it is the rung where people at last leave the ground, slowly, and with ceremony. You have been leaving the ground since Foundation; all that changes is how fast it falls away.

The sky makes an effort for this one. A proper bank of cloud, real thunder, the lightning pacing: the storm it keeps for people who matter. It searches you from end to end, finds the same clean nothing, and breaks up in the middle of a rumble, like a man who has lost the thread of his own sermon.`,
        night: `Yuki, risen beside you in the same breath, yawns at the last of the thunder. Nothing in the dark comes to see what the noise was.`,
        day: `Yuki, risen beside you in the same breath, yawns at the last of the thunder.` },
    5: { body: `Origin Core. The loop closes on its own tail, a rung further up. You are beginning to know the feeling the way you know a stair in your own house.

One cloud comes. It is a respectable cloud, dark and low, and it has plainly been sent alone. It hums for a while. A little lightning looks out of it, looks at you, and goes back in. The cloud leaves the way it came, and not quickly, in the manner of something that intends to say it searched.`,
        night: `Yuki's ear turns toward the cloud and back. That is the whole of her interest. The dark round you stays empty, and gives the impression of having chosen to.`,
        day: `Yuki's ear turns toward the cloud and back. That is the whole of her interest.` },
    6: { body: `Soul Embryo. Something small and exact takes shape at the centre of the loop, and the loop goes on turning round it, unbothered, as a garden goes on round a new seed.

The sky is late. The thing is done and you are already stretching your legs when the clouds arrive, out of breath, and find nothing left to interrupt. They hum anyway. A bolt is produced, held up, and put away again. You have seen clerks stamp a form with more conviction.`,
        night: `Yuki, who rose with you and was asleep again before the clouds turned up, has missed it entirely. Whatever hunts in this dark has learnt to miss it too.`,
        day: `Yuki, who rose with you and was asleep again before the clouds turned up, has missed it entirely.` },
    7: { body: `Nascent Soul. The small exact thing at the centre of the loop opens its eyes. They are yours, and the two of you agree at once about everything. Every door that was going to open has opened; the rest are wall now.

The sky has heard about this one. It brings the whole range: cloud to the horizon, thunder you feel in your knees, lightning in ranks. It is magnificent. It inspects you for four slow breaths, finds what it has found six times already, and stands down rank by rank, with the stiff dignity of an army sent to the wrong address.`,
        night: `Through the bond you feel Yuki rise with you, as always. She does not go back to sleep this time. In the dark, nothing moves at all.`,
        day: `Through the bond you feel Yuki rise with you, as always. She does not go back to sleep this time.` },
    8: { body: `Spirit Transformation. The name promises more than it delivers: you are transformed chiefly in that the air now gets out of your way before you ask.

After its last performance, the sky has thought again about expense. One bolt, no cloud, out of a clear sky and a good mile off, where it can be said to have been sent. You hear it some time after you see it. It sounds like a door being closed in another part of the house, by someone who would like you to know they closed it.`,
        night: `Yuki doesn't open her eyes. Her tail remarks on the thunder, once. Far out in the dark, something large changes its mind about the whole district.`,
        day: `Yuki doesn't open her eyes. Her tail remarks on the thunder, once.` },
    9: { body: `Immortal Ascension. By the name, this is where you are meant to leave: up through the roof of the world, to trouble it no further. The loop closes, and you stay where you were sitting, ascended and still here, which you put down to a filing error in your favour.

The sky sends no weather. Something passes over, very high up, as a figure passes a window, and there is one mutter of thunder with no lightning attached. It is the sound of a thing being noted.`,
        night: `Yuki sighs in her sleep, a realm higher than she lay down. The dark keeps a respectful distance; it has had practice.`,
        day: `Yuki sighs in her sleep, a realm higher than she lay down.` },
    10: { body: `Mahayana. A grand name for sitting very still while the loop does the work. It closes. You wait for the sky.

The sky does not come.

You give it a decent interval. No cloud, no hum, not so much as a change in the wind. Nine times it has come and looked and found nothing, and it has finally taken the hint. You are surprised to find that you are a little offended. A man likes to be suspected.`,
        night: `Yuki opens one eye, finds no storm to ignore, and looks at you as if you had forgotten to order it. The dark, at any rate, still keeps its distance.`,
        day: `Yuki opens one eye, finds no storm to ignore, and looks at you as if you had forgotten to order it.` },
    11: { body: `Earth Immortal. You try the phrase on, and it fits like the lab coat: slightly ridiculous, and yours. The earth, for its part, does not appear to have been told.

No sky again. It is sulking, and doing it thoroughly: such clouds as happen to be overhead have drawn off to the edges and left a bare patch above you, the way a street empties round a man nobody means to greet. You wave. Nothing waves back. It is the rudest thing Heaven has done to you yet, and the most honest.`,
        night: `Yuki stretches, a realm longer in the spine than she was a moment ago, and resettles. Nothing stirs in the dark. Word has got round.`,
        day: `Yuki stretches, a realm longer in the spine than she was a moment ago, and resettles.` },
    12: { body: `True Immortal. The loop closes with a sound you feel and do not hear, like a lid finding its jar.

And the sky, which has sulked through two realms, loses its temper. No clouds, no looking: one bolt, out of nothing, straight down. For the first time it does not miss. It takes you squarely between the shoulders.

It tastes of tin. That is all. The Ouroboros Axiom turns it over once, as it turns over everything this world hands you, and puts it to use. Somewhere very high up there is a silence, like a man looking at his own fist.`,
        night: `Every hair on Yuki is standing up. She looks at the sky, and then at you, and holds you responsible. For a mile round, the dark has been vacated.`,
        day: `Every hair on Yuki is standing up. She looks at the sky, and then at you, and holds you responsible.` },
    13: { body: `Golden Immortal. After True comes Golden; you stopped asking who names these some realms ago. The loop closes, and the air takes your weight like an old friend taking your coat.

The sky attends. That is the word for it. Cloud, at a great and careful height; no hum; the lightning kept well back, where it cannot be accused of anything. It has the manner of a man walking past a house where he once made a scene. It stays exactly as long as form requires. You tip it a hat you are not wearing. It pretends not to see.`,
        night: `Yuki watches it go with one eye, which is one more than it has had from her in some time. The dark is empty, and tidy with it.`,
        day: `Yuki watches it go with one eye, which is one more than it has had from her in some time.` },
    14: { body: `Heavenly Immortal. The last rung has Heaven's own name on it, and it goes to a man Heaven has failed to convict thirteen times. The loop closes, quietly.

The clouds come once more, and they bring no lightning. They gather, and hum, low, almost civil. Then they draw apart, directly overhead, and hold there. Through the gap the sky is clean: plain, and deep, and for a breath very like the one you were born under. It is not an apology. Heaven does not make them. But it is, you would swear to this in any court, a nod.

"Huh," you say. It seems to be traditional.`,
        night: `Yuki looks up at the gap and blinks at it, slowly, as she does at people she has decided to permit. The dark says nothing. It has been saying nothing for realms.`,
        day: `Yuki looks up at the gap and blinks at it, slowly, as she does at people she has decided to permit.` },
};
const BT_NO_SKY = [10, 11];
SCENES.breakthrough = {
    id: 'breakthrough', title: (g) => realmName(g.james.realm), art: 'tribulation', place: (g) => g.location,
    enter: (g) => {
        const r = breakthrough(g);
        if (VILLAGE_SCENES.includes(g.flags.bt_return)) g.flags.sky_witness = (g.flags.sky_witness || 0) + 1;
        if (r.ok && r.realm === 1) g.flags.foundation_day = clockParts(g.minutes).day;
        return r.ok ? r.lines : [];
    },
    text: (g) => {
        const seen = VILLAGE_SCENES.includes(g.flags.bt_return);
        const knows = !!(g.flags.lore1 || g.flags.lore_realms || g.rel['Mei Lin']);
        const h = clockParts(g.minutes).hh;
        const night = h >= 20 || h < 6;
        const sky = night ? 'The stars go out one at a time, pinched like candles.' : 'Behind them the red sun goes out, a coin dropped into ink.';
        if (g.james.realm === 1) {
            const recognise = knows
                ? `You know what this is. Mei Lin gave it to you in her weather voice: *the sky decides you're impure and tries to burn you clean. Most people it just burns.* Tribulation. Heaven's verdict, and it has your name on it.`
                : `You have no word for this. Everything you know about weather, atmospheric charge and the physics of a world you landed on less than a week ago comes back with nothing. The shape of it is plain enough, though. That lightning is not wandering. It is *aiming*. This is a judgment, and the defendant is you.`;
            const witness = seen
                ? `Ashfall saw it. The whole village is out in the street with its faces turned up, and no one is speaking. Somebody's grandmother kneels in the dust with her forehead to the ground, praying in a fast, shaking whisper. The hunters grip their spears as though a spear had a say in this. What frightens them most is that they can't *feel* you. Everyone in Ashfall with any sense for Qi is reaching for you now — it brushes you like a dozen nervous fingertips — and finding what they have always found. Nothing. A mortal, sitting in the dust, while Heaven argues with him and loses.

Old Wen stands in his doorway, his pipe gone cold in his hand. When at last he looks at you, it is as a man revising, with great care, everything he believed he knew about Heaven.

"A tribulation that withdraws its own verdict," he says to no one, quietly and formally, as one reads out a death in the family. "A cloud over one roof and a few strokes: so Foundation is paid for. Never this. Not in the history of the mountain."

And someone, you suspect, is already running up the road to the Crimson Lotus.`
                : night
                    ? 'Nobody saw it except the trees and whatever lives in them. Out here, at night, a miracle without witnesses is the best kind.'
                    : 'Nobody saw it except the trees. Out here, you suspect, a miracle without witnesses is the best kind.';
            return `You sit, and you let the loop close.

Saturation has been pressing on the inside of you like a held breath, and now you release it: not out but *down*, into the foundations. The Ouroboros Axiom turns once, slowly, a great wheel finding its rest. Everything you have taken in of this world's poisoned Qi, composted and made clean, settles into you as bedrock.

Then the sky notices.

Clouds arrive from nowhere: black and low, piling up over you, humming at a pitch you feel in your back teeth. ${sky} Lightning walks about inside them, looking.

${recognise}

It looks.

It looks for a long time.

And then — you would swear to this in any court — the storm more or less *shrugs*. It has found nothing impure to burn. Nothing to punish. One bolt comes down, strolls to the ground beside you and fizzles out in the ${seen ? 'dust' : 'moss'} with the sound of a disappointed sigh, and the clouds come apart and drift off in embarrassed directions.

"Huh," you say.

Yuki rose with you; you felt her meridians widen in the same breath as yours. She opens one eye, notes the clear sky, and goes back to sleep.

${witness}

*Foundation.* Mortal Vessel no longer: the rung where this world's sect disciples stand, and you came by it without a pill. You feel heavier, and steadier, and precisely as sarcastic as before.`;
        }
        const own = BT_REALMS[g.james.realm]; // ST4
        if (own) return `${own.body}

${seen && !BT_NO_SKY.includes(g.james.realm) ? 'Ashfall watches it go in total silence. Then, one by one, people bow — not to the sky. To you. You would very much prefer they didn\'t.' : night ? own.night : own.day}`;
        return `The loop closes again, one rung higher. ${realmName(g.james.realm)}.

The sky tries again, as the sky apparently must: clouds, the hum, lightning hunting for something to burn. It finds nothing. It leaves sooner this time, as if it were learning.

${seen
        ? 'Ashfall watches it go in total silence. Then, one by one, people bow — not to the sky. To you. You would very much prefer they didn\'t.'
        : night ? 'Yuki does not so much as open an eye. Off in the dark, something large thinks better of coming any closer.' : 'Yuki does not so much as open an eye.'}`;
    },
    choices: [{ text: 'Get up.', to: (g) => {
        const back = g.flags.bt_return || 'stream';
        g.flags.yuki_return = back;
        if (g.james.realm >= 2 && !g.flags.yuki_tiger_seen && SCENES.yuki_tiger_awaken) { g.flags.yuki_tiger_seen = true; return 'yuki_tiger_awaken'; }
        if (g.james.realm >= 7 && !g.flags.yuki_human_seen && SCENES.yuki_human_awaken) { g.flags.yuki_human_seen = true; return 'yuki_human_awaken'; }
        return back;
    } }],
};
for (const id of ['stream', 'wilds', 'camp', 'night', 'village', 'ashfall', 'supper', ...B0, ...B1, ...B2, ...B3, ...B4]) {
    SCENES[id].choices.unshift({ text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'breakthrough' }); // v0.11.41 (D2-a): Story Mode's "Break through" (the Meditate card since v0.9.5); the place kept
    SCENES[id].choices.push({ text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'meridians' }); // v0.11.41 (D2-a): Story Mode's "Open a meridian" (the Meditate cards); the place kept
    SCENES[id].choices.push({
        text: 'Yuki: change form.',
        show: (g) => yukiForms(g).length > 1 && !!SCENES.yuki_form,
        do: (g) => { g.flags.yuki_return = g.scene; return []; },
        to: (g) => (SCENES.yuki_form ? 'yuki_form' : g.scene),
    });
}

installCoil(SCENES);
installOnce(SCENES); // v0.11.33: the task screens' one-off work, "Call it a day"
markWalks(SCENES); // v0.11.109 (MW1): the walks flown from Foundation

/* ---------- v0.10.1: the Long Forest in task mode — gated behind the first Coil, climbed one season at a time ---------- */
/** Task mode, the prologue's Coil 2 or later. Classic keeps the one-step button above. */
export const lfOpen = (g) => (g.coil?.n || 1) > 1 && (g.coil?.act || 0) === 0;
/** The skill rank a season lifts GU, Convergence Use, Yuki's Fight and Qi Use to (rank = 10·(T−1) + L): 7 per rung, T10 L10 at the top. */
export const lfRank = (r) => (r >= MAX_REALM ? 100 : 7 * r);
export const LF_SEASON_MINUTES = 120;
const rankOf = (s) => (s ? 10 * ((s.tier || 1) - 1) + (s.level || 1) : 0);
const fromRank = (n) => { const t = Math.floor((n - 1) / 10) + 1; return { tier: t, level: n - 10 * (t - 1), xp: 0 }; };
const SEASON_LINES = [
    'You sit behind the falls until moss has grown over your boots. Yuki does not permit moss. Something gives.',
    'A season without a word spoken. Yuki calls it the best season of your life. She calls it that through the bond, which is cheating.',
    'The leaves turn, fall and come back. So do you, one rung up. The forest affects not to notice.',
    'You count breaths. Somewhere past a million the counting stops being necessary.',
    'Snow across the cave mouth, then rain, then green again. You were busy.',
];
export function lfSeason(g) {
    const j = g.james, y = g.yuki;
    if (j.realm >= MAX_REALM) return [];
    const was = j.realm;
    Object.assign(j, { primaries: 12, collaterals: 66, colSealed: false });
    Object.assign(y, { primaries: 12, collaterals: 66 });
    const r = was + 1;
    j.realm = r; y.realm = r; j.saturation = 0;
    const want = lfRank(r);
    const lift = (o, k) => { if (rankOf(o[k]) < want) o[k] = fromRank(want); };
    lift(j, 'gu'); lift(j.skills, 'Convergence Use'); lift(y, 'fight'); lift(y, 'qiUse');
    if (r >= 7) Object.assign(j, { extra8: 8, extraCollaterals: 28, junctions: 10 });
    else if (r >= EXTRA_FROM) j.extra8 = Math.max(j.extra8 || 0, Math.ceil((8 * (r - EXTRA_FROM + 1)) / (7 - EXTRA_FROM))); // v0.11.66 (G4): the vessels from Golden Core (3, 6, 8); Foundation before (2, 3, 4, 6, 7, 8)
    j.hp = jamesHpMax(g); j.qi = jamesQiMax(g); y.hp = yukiHpMax(g); y.qi = yukiQiMax(g);
    ensureBars(g);
    g.flags.lf_seasons = (g.flags.lf_seasons || 0) + 1;
    const s = j.gu;
    return [SEASON_LINES[(g.flags.lf_seasons - 1) % SEASON_LINES.length], `Realm: ${realmName(was)} → ${realmName(r)}. GU, Convergence Use, Yuki's Fight and Qi Use: at least T${s.tier} L${s.level}.`];
}
/** v0.11.37 (owner 12:59, pick A1): where James walked into the Long Forest, and when (flags `lf_from`, `lf_at`), for "Go back the way you came". */
const lfFrom = (from) => (g) => { g.flags.lf_from = from; g.flags.lf_at = g.minutes; return []; };
SCENES.clearing.choices.push({ text: 'Stay lost. (The Long Forest: climb the realms one season at a time.)', show: lfOpen, do: lfFrom('clearing'), to: 'lf_enter' });
SCENES.arrival.choices.push({
    text: 'You remember this. Stay lost. (The Long Forest.)', show: lfOpen, time: 30,
    do: (g) => { for (const f of ['bone_ok', 'sat_once']) g.flags[f] = true; lfFrom('arrival')(g); return ['The parts you know by heart you skip, and you walk away from the water instead of toward it.']; },
    to: 'lf_enter',
});
SCENES.lf_hub.choices.push({
    text: (g) => `Withdraw for a season: ${realmName(g.james.realm)} → ${realmName(g.james.realm + 1)}.`,
    show: (g) => g.james.realm < MAX_REALM, time: LF_SEASON_MINUTES, noFam: true /* v0.11.141 (FX1, CH): a season is the climb itself, no familiarity */, do: lfSeason, to: 'lf_hub',
});
const LF_FULL = 'The hammerspace is full: the Long Forest\'s pantry comes with you.';
const lfStock = (g) => { for (const id of LF_STOCK) g.inventory[id] = Math.max(g.inventory[id] || 0, itemCap(id)); };
{ // leaving in task mode: the hammerspace goes out full
    const exit = SCENES.lf_exit.choices[0];
    const was = exit.do;
    exit.do = (g) => { const out = was(g); lfStock(g); out.push(LF_FULL); return out; };
}
/** v0.11.37 (owner 12:59, pick A1): the second way out: back where he walked in (the clearing or the arrival), the clock as he left it. At the end of the list: the hub's card ids stay. */
SCENES.lf_hub.choices.push({
    text: 'Go back the way you came. (The calendar starts again where you walked in.)',
    show: (g) => ['clearing', 'arrival'].includes(g.flags.lf_from) && Number.isFinite(g.flags.lf_at),
    do: (g) => {
        g.flags.lf_active = false;
        g.minutes = g.flags.lf_at;
        { const w = wakeState(g); w.slept = clockParts(g.minutes).day; } // rested; the day count runs on, but the next night slept counts (Fable review: `slept` was left at the forest's last day)
        g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g); g.yuki.hp = yukiHpMax(g); g.yuki.qi = yukiQiMax(g);
        ensureBars(g);
        lfStock(g);
        return [`You walk out of the Long Forest the way you came in. The calendar starts again where you left it: ${clockLabel(g.minutes)}.`, LF_FULL];
    },
    to: (g) => g.flags.lf_from,
});

/* ---------- v0.10.4: Bonesinger forms — Incremental Mode hides a choice until James can sing its form; four lines reworded ---------- */
{
    for (const sc of Object.values(SCENES)) for (const c of sc.choices || []) {
        if (typeof c.text !== 'string') continue;
        const hit = STORY_FORMS.find(([re]) => re.test(c.text));
        if (!hit) continue;
        const was = c.show, form = hit[1];
        const f = (g) => hasForm(g, form) && (was ? was(g) : true);
        if (was?.dailyKey) f.dailyKey = was.dailyKey;
        c.form = form; c.show = f;
    }
    const reword = (scene, re, text, out) => {
        const c = SCENES[scene].choices.find((x) => typeof x.text === 'string' && re.test(x.text));
        if (!c) throw new Error(`forms: no choice ${re} in ${scene}`);
        c.text = text; // v0.11.41: Incremental Mode's wording only (Story Mode's is gone)
        if (out) { const d = c.do; c.do = (g, r) => (d(g, r) || []).map((l) => (l === out[0] ? out[1] : l)); }
    };
    reword('night_attack', /^Bone wall between you/, 'A hedge of bone spikes between you and them, then run for the water.');
    SCENES.night_attack_forced.text = (g) => `The hedge comes up knee-high and mostly gaps. The jackals step through it with professional courtesy. Running is off the table.${byForm(g, '', NA_TIGER, '')}`; /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
    reword('rt_ford', /bridge of bone/, 'Sing stepping-stones of bone from stone to stone.', ['A white bridge, ribbed like a spine. Mei Lin crosses it like a woman walking into a temple.', 'White stepping-stones, ribbed like vertebrae, rise between the black ones. Mei Lin crosses them like a woman walking into a temple.']);
    reword('rt_ambush', /wall of bone/, 'A slab of bone between you and them, then down to the river.');
    reword('ring_chambers', /wall of bone/, 'Seal the fourth ring\'s doorway with a slab of bone and leave them to it.', ['A white wall, floor to ceiling. The chewing goes on behind it, disappointed.', 'A white slab, man-high, jammed into the doorway. The chewing goes on behind it, disappointed.']);
}

// v0.11.137 (owner pick TR1): Yuki's daily scene, appended last on every resting place (after every other choice above), so no position changes
installYukiTime(SCENES);
// v0.11.139 (owner pick MW1, MS): Old Wen's and Mei Lin's mother's daily scenes, after Yuki's card on Ashfall's three resting places
installHouseTime(SCENES);

export const START_SCENE = 'arrival';
