/**
 * Prologue — "Bone and Ash". James Green (40, a doctorate three days old) and Yuki land with nothing in the
 * Blackroot Wilds, at the edge of a dark xianxia world where cultivators climb on herbs, beast cores and the
 * corpses of their rivals, and where Heaven answers every breakthrough with lightning. James needs none of it.
 * That is going to be a problem — for them.
 */
import { addItem, hasItem, eat, bumpRel, condense, sleepUntil, advance, clockParts } from '../core/game.js';

const once = (flag) => (g) => !g.flags[flag];
const set = (...flags) => (g) => { for (const f of flags) g.flags[f] = true; return []; };

/* ---------- encounters ---------- */
const jackals = (g) => ({
    id: 'jackals',
    intro: 'Two shapes peel off the dark: ash-grey, too many teeth, eyes like coals that forgot to go out.',
    band: 'standard',
    enemies: [
        { name: 'Ashfang jackal', hp: g.flags.stakes ? 4 : 7, dc: 3, atk: 5, dmg: 4, prefersSmall: true },
        { name: 'Ashfang matriarch', hp: 7, dc: 3, atk: g.flags.watch ? 4 : 5, dmg: 4, prefersSmall: true },
    ],
    win: 'jackals_won', lose: 'jackals_lost', flee: 'jackals_fled',
});
const gaoFight = (g) => ({
    id: 'gao',
    intro: 'Gao Feng\'s sleeve snaps out and Qi crackles along it, red as a fresh cut. His lackey grins and draws a hatchet.',
    band: 'challenging',
    enemies: [
        { name: 'Gao Feng', hp: g.flags.gao_hand ? 6 : 9, dc: 4, atk: 5, dmg: 4, dr: 1 },
        { name: 'Lackey Pock-Face', hp: 6, dc: 3, atk: 4, dmg: 3 },
    ],
    win: 'gao_won', lose: 'gao_lost',
});
const collectorsFight = (g) => ({
    id: 'collectors',
    intro: 'Inner Disciple Lu Han does not hurry. People who are used to winning never do.',
    band: 'major',
    enemies: [
        { name: 'Lu Han', hp: 12, dc: 5, atk: 6, dmg: 5, dr: 1 },
        ...(g.flags.gao_dead ? [] : [{ name: 'Gao Feng', hp: g.flags.gao_beaten ? 5 : 8, dc: 4, atk: 5, dmg: 4, dr: 1 }]),
    ],
    win: 'collectors_won', lose: 'collectors_lost',
});

const cookMeal = (g) => {
    const out = [];
    if (hasItem(g, 'hare_raw')) { addItem(g, 'hare_raw', -1); eat(g, 35); out.push('Roast hare: +35 satiety (Yuki gets the liver and considers you forgiven).'); }
    else if (hasItem(g, 'jade_bracket')) { addItem(g, 'jade_bracket', -1); eat(g, 15); out.push('Seared jade bracket: +15 satiety.'); }
    return out;
};
const foodCount = (g) => (g.inventory.hare_raw || 0) + (g.inventory.jade_bracket || 0);

export const ITEMS = {
    hare_raw: { name: 'Glassback hare (dressed)', note: 'Raw. Better cooked. Much better cooked.' },
    jade_bracket: { name: 'Jade bracket fungus', note: 'Edible, mildly antibiotic. Your doctorate is finally paying for itself.' },
    crimson_berry: { name: 'Crimson needleberries', note: 'Tested safe. Taste like regret and vitamin C.' },
    spirit_grass: { name: 'Ninefold spirit grass', note: 'What locals eat to cultivate. You can feel it trying to bite your meridians.' },
    hairpin: { name: 'Wraithbone hairpin', note: 'Too pretty for a man who was eating raw hare yesterday.' },
    jackal_fang: { name: 'Ashfang fangs', note: 'Trophies. Yuki keeps trying to bury them.' },
    beast_core: { name: 'Murky beast core', note: 'Locals swallow these to cultivate. You\'d rather swallow a battery.' },
};

export const SCENES = {
    /* ================= DAY 1 ================= */
    arrival: {
        id: 'arrival', title: 'Bone and Ash', art: 'forest_dawn', place: 'Unknown forest',
        text: `Three days ago you defended a doctorate in mycology and computational biology. Yesterday you celebrated. This morning, as far as you can reconstruct it, you went into the resonance lab to "just check one reading", Yuki asleep in the hood of your lab coat, and the spatial seed chamber decided to have opinions.

Now you are lying on your back in a forest made of black bark and grey moss, under a sky the colour of a bruise, and something small and white is standing on your sternum, staring at you with the deep, personal disappointment only a cat can manage.

"Good morning," you tell her. "I want it on record that I did not touch anything."

Yuki does not believe you. Neither do you.

Your omnitool hums awake under the skin of your forearm, organic and warm and blessedly alive. Its hammerspace — the pocket of folded space your people grow into every citizen at birth — reports in. It is the most expensive empty closet in two universes. Clothes on your back. Lab coat. A cat. That is the inventory.`,
        choices: [
            { text: 'Check Yuki over first — paws, ribs, the bond between you.', to: 'yuki_check' },
            { text: 'Run a full environmental scan with the omnitool.', check: { skill: 'GU', dc: 2 }, time: 10, to: 'scan_ok', fail: 'scan_bad' },
            { text: 'Sit up, stop being dramatic, and look around.', time: 5, to: 'clearing' },
        ],
    },
    yuki_check: {
        id: 'yuki_check', title: 'Root-kin', art: 'yuki_close', place: 'Unknown forest',
        enter: (g) => { bumpRel(g, 'Yuki', 2, 1); advance(g, 5); return ['Yuki: bond steady.']; },
        text: `She lets you do it, which is how you know she was scared. Twelve primaries open, sixty-six collaterals, the same as yours — you were born on the same day, in the same grove, and her meridians have always mirrored yours like a reflection in still water. Mortal Vessel, both of you. Young, by your people's standards. Practically larval.

Through the bond she sends you a feeling that translates roughly as: *the air tastes wrong and you smell like burnt lab.*

"Fair on both counts."

The air does taste wrong. There is Qi here — thick, heavy, everywhere — but it sits on the tongue like smoke from something that died angry.`,
        choices: [
            { text: 'Scan the environment now that she\'s settled.', check: { skill: 'GU', dc: 2 }, time: 10, to: 'scan_ok', fail: 'scan_bad' },
            { text: 'Get moving.', to: 'clearing' },
        ],
    },
    scan_ok: {
        id: 'scan_ok', title: 'Readings', art: 'omnitool', place: 'Unknown forest',
        enter: set('scanned', 'qi_toxic'),
        text: `The omnitool unfolds a holographic pane in your vision. Oxygen: slightly rich. Gravity: 0.97 of home. Spectrum of the sun: hotter, redder. No signal. No satellites. No network. No anyone.

And the Qi. The tool renders it as a slow fog of particles, and every particle is tagged with something your people's instruments call *intent residue*. This world's Qi remembers how it was used. Most of it was used to kill.

"Lovely," you murmur. "A planet with a grudge."

Your Ouroboros Axiom — the pillar every one of your people carries, the loop that runs the body like a closed garden — is already working. Whatever comes in through your meridians gets filtered, turned over, composted. You can breathe this. You suspect most things here can't, not without help.`,
        choices: [{ text: 'Find out what "help" looks like around here. Later. First: the clearing ahead.', to: 'clearing' }],
    },
    scan_bad: {
        id: 'scan_bad', title: 'Readings (partial)', art: 'omnitool', place: 'Unknown forest',
        enter: set('scanned'),
        text: `The omnitool gives you oxygen, gravity, a sun that is redder than it should be, and then a long, wounded string of error codes about the ambient Qi it cannot classify.

"You and me both," you tell it.

No signal. No network. You are, in the technical sense, extremely lost.`,
        choices: [{ text: 'Head for the light between the trees.', to: 'clearing' }],
    },
    clearing: {
        id: 'clearing', title: 'The Clearing', art: 'clearing', place: 'Blackroot Wilds — a clearing',
        text: (g) => `The trees open onto a clearing of grey grass and old stones. Somewhere beyond it, water is running. Your stomach mentions — politely, for now — that you skipped breakfast and possibly a whole universe.

${g.flags.bone_ok ? 'The little white needle you grew is still in your fingers. It feels like a promise.' : 'You have one thing nobody here can take: your Bonesinger gift, the rare one, braided so tightly into your cultivation that the two became a single Convergence. Your people would call it *the white song*. You call it the only reason you survived your teenage years.'}

${g.flags.sat_once ? '' : 'You could also sit for a moment and taste this world\'s Qi properly. Cultivators at home do that before they drink from a strange well.'}`,
        choices: [
            { text: 'Sing a single bone needle into your hand. Start small.', show: once('bone_ok'), qi: 1, check: { skill: 'Convergence Use', dc: 2 }, time: 2, do: set('bone_ok'), to: 'first_bone', fail: 'first_bone_fail' },
            { text: 'Sit, breathe, and taste the Qi.', show: once('sat_once'), time: 20, do: set('sat_once'), to: 'meditate1' },
            { text: 'Follow the sound of water.', time: 15, to: 'stream' },
        ],
    },
    first_bone: {
        id: 'first_bone', title: 'The White Song', art: 'bone_needle', place: 'Blackroot Wilds — a clearing',
        text: `You don't gather anything. That's the part nobody back home ever believes until they see it: the material comes from nowhere, from the folded place where Bonesinger and Qi meet, and it comes *instantly*.

A white needle, the length of your finger, slides out of your palm and sets — warm, then cool, hard as fresh antler. You flick it at a tree. It sinks in with a satisfying *tok*.

Yuki trots over, sniffs it, and looks at you as if to say: *you could have done that when the chamber exploded.*

"I was busy being unconscious."

Darts, then. Needles. A knife-length blade if you push. At your current level that's the menu, and it is a better menu than *nothing*.`,
        choices: [{ text: 'Follow the water.', time: 15, to: 'stream' }, { text: 'Taste the Qi first.', show: once('sat_once'), time: 20, do: set('sat_once'), to: 'meditate1' }],
    },
    first_bone_fail: {
        id: 'first_bone_fail', title: 'The White Song (out of tune)', art: 'bone_needle', place: 'Blackroot Wilds — a clearing',
        text: `What comes out of your palm is less *needle* and more *sad white noodle*. It droops. It crumbles. Yuki bats the remains into the grass with surgical contempt.

"Warm-up," you say. "Everyone needs a warm-up."

Still: it came. Instantly, from nowhere, the way it always has. The song is in you. You are just out of practice and, possibly, concussed.`,
        enter: set('bone_ok'),
        choices: [{ text: 'Follow the water.', time: 15, to: 'stream' }, { text: 'Taste the Qi first.', show: once('sat_once'), time: 20, do: set('sat_once'), to: 'meditate1' }],
    },
    meditate1: {
        id: 'meditate1', title: 'The Taste of Ash', art: 'meditation', place: 'Blackroot Wilds — a clearing',
        text: (g) => `You sit. You breathe. You let the world in.

It comes in like a crowd of angry ghosts — grief, hunger, the iron of old blood — and your Ouroboros Axiom catches every one of them, turns them over, and hands them back clean. The Qi that settles in your dantian afterwards is just Qi. Warm. Neutral. Yours.

You have a strong, immediate suspicion that nobody on this world can do that. That they need *something* — medicine, herbs, ritual — to scrub what they breathe, and that whatever they use, it isn't enough.

${g.james.qi >= 10 ? 'You could keep going: condense a little Qi toward the next realm. It costs Qi, not time you don\'t have.' : ''}`,
        choices: [
            { text: 'Condense: one sit, 10 Qi toward Saturation.', req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`] : []; }, to: 'stream' },
            { text: 'Enough. Water, food, shelter — the boring holy trinity.', time: 15, to: 'stream' },
        ],
    },
    stream: {
        id: 'stream', title: 'Blackwater', art: 'stream', place: 'Blackroot Wilds — the stream',
        text: (g) => `The stream runs dark over black stones, cold enough to hurt your teeth just looking at it. ${g.flags.drank ? 'You\'ve had your fill.' : 'You are very thirsty.'}

${clockParts(g.minutes).hh >= 17 ? 'The light is going amber. Night here will be properly dark.' : 'The red sun is climbing. You have the day — use it.'}

${g.james.satiety < 40 ? 'Your stomach has stopped being polite.' : ''}`,
        choices: [
            { text: 'Test the water with the omnitool before drinking.', show: once('drank'), check: { skill: 'GU', dc: 2 }, xp: false, time: 5, do: set('drank'), failDo: (g) => { g.flags.drank = true; g.james.hp -= 2; return ['You drink before the analysis finishes. Your gut files a complaint: −2 HP.']; }, to: 'stream' },
            { text: 'Forage along the bank — berries, fungi, anything that isn\'t trying to eat you.', show: (g) => !g.flags.foraged, time: 40, to: 'forage' },
            { text: 'Hunt. Yuki has been staring at something in the reeds for a while.', show: (g) => !g.flags.hunted, time: 30, to: 'hunt' },
            { text: 'Make camp on the dry rise above the stream.', show: (g) => !!(g.flags.foraged || g.flags.hunted), time: 20, to: 'camp' },
            { text: 'Keep walking downstream until dark.', show: (g) => !g.flags.foraged && !g.flags.hunted, time: 180, to: 'camp' },
        ],
    },
    forage: {
        id: 'forage', title: 'Foraging', art: 'forage', place: 'Blackroot Wilds — the stream',
        enter: set('foraged'),
        text: `Grey moss, black bark, a riot of things that are absolutely not on any field guide you own. You own zero field guides. You are the field guide now.

Two candidates: a thorny shrub dripping with fat red berries that look *exactly* like the kind of thing a planet with a grudge would grow, and a shelf of pale green bracket fungus on a dead log, smelling faintly of almonds and wet paper.

Fungus. Finally, something you actually have a doctorate in.`,
        choices: [
            { text: 'The bracket fungus. Spore print, tissue test, the whole ritual.', check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 20, do: (g) => { addItem(g, 'jade_bracket', 3); g.flags.fungus = true; return ['+3 Jade bracket fungus (edible, mildly antibiotic).']; }, failDo: (g) => { addItem(g, 'jade_bracket', 1); return ['You get one clean piece before the rest crumbles. +1 Jade bracket fungus.']; }, to: 'stream' },
            { text: 'The berries. Omnitool analysis, then a tiny taste.', check: { skill: 'GU', dc: 3 }, time: 15, do: (g) => { addItem(g, 'crimson_berry', 6); eat(g, 8, { yuki: false }); return ['Safe. +6 Crimson needleberries, and you eat a handful: +8 satiety.']; }, failDo: (g) => { g.james.hp -= 3; return ['The analysis said "probably". Your intestines said "absolutely not". −3 HP.']; }, to: 'stream' },
            { text: 'Both. You\'re hungry and the day isn\'t getting longer.', check: { skill: 'GU', dc: 4, bonus: () => 1 }, time: 35, do: (g) => { addItem(g, 'jade_bracket', 3); addItem(g, 'crimson_berry', 6); eat(g, 8, { yuki: false }); g.flags.fungus = true; return ['+3 Jade bracket fungus, +6 Crimson needleberries, +8 satiety.']; }, failDo: (g) => { addItem(g, 'jade_bracket', 1); g.james.hp -= 2; return ['+1 Jade bracket fungus, and one berry too many: −2 HP.']; }, to: 'stream' },
        ],
    },
    hunt: {
        id: 'hunt', title: 'The Hunt', art: 'hunt', place: 'Blackroot Wilds — the reeds',
        enter: set('hunted'),
        text: `In the reeds sits a hare. Probably a hare. It has the right ears and the right nose, but its back is a ridge of translucent, glassy plates, and the light coming through them throws little rainbows on the mud.

"Glassback," you whisper, because naming things is how biologists cope.

Yuki is flat to the ground, tail tip twitching. Through the bond you get a single, crystalline thought: *mine.*`,
        choices: [
            { text: 'A bone dart, thrown from cover. Clean and quick.', qi: 2, check: { skill: 'Convergence Use', dc: 3 }, time: 10, do: (g) => { addItem(g, 'hare_raw', 2); return ['+2 Glassback hare (dressed). Yuki pretends she let you have it.']; }, to: 'stream', fail: 'hunt_miss' },
            { text: 'Let Yuki drive it toward you, then grab.', check: { skill: 'GU', dc: 4, bonus: (g) => (g.yuki.fight.level >= 2 ? 1 : 0) }, time: 20, do: (g) => { addItem(g, 'hare_raw', 2); bumpRel(g, 'Yuki', 2, 0); return ['+2 Glassback hare (dressed). Teamwork. Disgusting, bloody teamwork.']; }, to: 'stream', fail: 'hunt_miss' },
            { text: 'Leave it. Glass armour sounds like a learning experience you don\'t need.', to: 'stream' },
        ],
    },
    hunt_miss: {
        id: 'hunt_miss', title: 'The One That Got Away', art: 'hunt', place: 'Blackroot Wilds — the reeds',
        text: `The hare goes off like a firework of rainbows and is gone. Yuki stalks back out of the reeds with mud to her elbows and the expression of someone composing a formal complaint.

"In my defence," you say, "it was made of glass."

She does not accept your defence.`,
        choices: [
            { text: 'Try again further downstream.', show: (g) => !g.flags.hunt2, time: 30, do: set('hunt2'), check: { skill: 'Convergence Use', dc: 3 }, qi: 2, xp: true, to: 'hunt_got', fail: 'stream' },
            { text: 'Back to the stream.', to: 'stream' },
        ],
    },
    hunt_got: {
        id: 'hunt_got', title: 'Second Chances', art: 'hunt', place: 'Blackroot Wilds — the reeds',
        enter: (g) => { addItem(g, 'hare_raw', 1); return ['+1 Glassback hare (dressed).']; },
        text: `The second one is slower, or you are faster, or the universe owes you one. The dart takes it behind the ear. You dress it with a little bone knife that you grow, use, and dissolve, because you can, and because the alternative is your teeth.`,
        choices: [{ text: 'Back to the stream.', to: 'stream' }],
    },

    camp: {
        id: 'camp', title: 'Camp', art: 'camp', place: 'Blackroot Wilds — the dry rise',
        text: (g) => `A dry rise above the water, a fallen trunk to put your back against, a sky turning the colour of wine.

${foodCount(g) ? `You have food: ${[g.inventory.hare_raw ? `${g.inventory.hare_raw} hare` : '', g.inventory.jade_bracket ? `${g.inventory.jade_bracket} fungus` : ''].filter(Boolean).join(', ')}.` : 'You have no food. You have a cat, who is looking at you like *you* are the food.'}
${g.flags.fire ? 'The fire crackles.' : 'No fire yet.'} ${g.flags.stakes ? 'A ring of bone stakes leans outward around the camp.' : ''}`,
        choices: [
            { text: 'Make fire: a bone bow-drill and a lot of swearing.', show: once('fire'), check: { skill: 'GU', dc: 3 }, time: 25, do: set('fire'), failDo: (g) => { advance(g, 20); g.flags.fire = true; return ['It takes three times as long and one blister, but there is fire.']; }, to: 'camp' },
            { text: 'Cook and eat.', show: (g) => g.flags.fire && foodCount(g) > 0, time: 20, do: (g) => cookMeal(g), to: 'camp' },
            { text: 'Eat it raw. Civilisation is a state of mind.', show: (g) => !g.flags.fire && g.inventory.hare_raw > 0, check: { skill: 'GU', dc: 2 }, xp: false, do: (g) => { addItem(g, 'hare_raw', -1); eat(g, 18); return ['Raw hare: +18 satiety. You will not be telling anyone about this.']; }, failDo: (g) => { addItem(g, 'hare_raw', -1); eat(g, 10); g.james.hp -= 2; return ['Raw hare: +10 satiety, −2 HP. You will definitely not be telling anyone about this.']; }, to: 'camp' },
            { text: 'Sing a ring of bone stakes around the camp, points outward.', show: once('stakes'), qi: 3, check: { skill: 'Convergence Use', dc: 2 }, time: 15, do: set('stakes'), to: 'camp' },
            { text: 'Night falls. Settle in.', to: 'night', do: (g) => { const p = clockParts(g.minutes); if (p.hh < 21 && p.hh >= 6) g.minutes = (p.day - 1) * 1440 + 21 * 60; return []; } },
        ],
    },
    night: {
        id: 'night', title: 'Night', art: 'forest_night', place: 'Blackroot Wilds — the dry rise',
        text: (g) => `Night on this world is not a lack of light. It is a presence. The black trees drink the stars. Something far off screams, stops, and does not scream again.

${g.flags.fire ? 'The fire makes a small, defiant room in the dark.' : 'Without fire, the dark comes right up to your knees.'} Yuki climbs into your lap, which she only does when she thinks one of you needs it.

Your Parallel Cognition offers, unprompted, to spin up a thread for watch-keeping. Nine threads, and one of them never sleeps unless you tell it to.`,
        choices: [
            { text: 'Leave a thread on watch and sleep.', do: set('watch'), to: 'night_attack' },
            { text: 'Cultivate first — one sit — then sleep.', req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`] : []; }, to: 'night_attack' },
            { text: 'Just sleep. You\'ve earned it.', to: 'night_attack' },
        ],
    },
    night_attack: {
        id: 'night_attack', title: 'Ashfangs', art: 'jackals', place: 'Blackroot Wilds — the dry rise',
        enter: (g) => { const p = clockParts(g.minutes); g.minutes = (p.hh >= 21 ? p.day : p.day - 1) * 1440 + 60 + 20; return []; },
        text: (g) => `${g.flags.watch ? 'The watch-thread yanks you awake a full three seconds before anything happens. Three seconds is a lot.' : 'Yuki\'s claws in your thigh wake you. That, and the smell.'}

${g.flags.stakes ? 'Something yelps on your bone stakes — one of them is already bleeding.' : ''} Two shapes at the edge of the ${g.flags.fire ? 'firelight' : 'dark'}: grey hides, black lips peeled back from teeth that drip something that smokes when it hits the moss.

Ashfang jackals. You've never seen one before and you'd recognise them anywhere: they look exactly like everything this world's Qi tastes like.`,
        choices: [
            { text: 'Fight.', combat: jackals, to: 'jackals_won' },
            { text: 'Bone wall between you and them, then run for the water.', qi: 4, check: { skill: 'Convergence Use', dc: 4 }, to: 'jackals_fled', fail: 'night_attack_forced' },
        ],
    },
    night_attack_forced: {
        id: 'night_attack_forced', title: 'Ashfangs', art: 'jackals', place: 'Blackroot Wilds — the dry rise',
        text: `The wall comes out knee-high and full of holes. The jackals step over it with an air of professional courtesy. Running is off the table.`,
        choices: [{ text: 'Fine. Fight.', combat: jackals, to: 'jackals_won' }],
    },
    jackals_won: {
        id: 'jackals_won', title: 'Teeth in the Dark', art: 'jackals_dead', place: 'Blackroot Wilds — the dry rise',
        enter: (g) => { addItem(g, 'jackal_fang', 4); addItem(g, 'beast_core', 1); g.flags.jackals = 'won'; return ['+4 Ashfang fangs, +1 Murky beast core.']; },
        text: `When it's over you are breathing hard, there is white bone sticking out of two grey bodies, and Yuki is washing her face with the deep calm of someone who has done this before. She hasn't. Neither have you.

In the chest of the larger one, where a heart should be, the omnitool flags a hard, cloudy knot the size of a walnut. *Beast core*, your threads suggest, cross-referencing nothing at all. Dense with that foul Qi.

Something tells you the locals would kill for this. Something tells you that's literal.`,
        choices: [{ text: 'Sleep. Properly, this time.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'dawn' }],
    },
    jackals_lost: {
        id: 'jackals_lost', title: 'Teeth in the Dark', art: 'jackals', place: 'Blackroot Wilds — the dry rise',
        enter: (g) => { g.flags.jackals = 'lost'; delete g.inventory.hare_raw; return ['The jackals take your food and some skin. You keep your throat.']; },
        text: `You go down. The last thing you see is Yuki — all eleven pounds of her — standing over you with her fur on end, screaming a sound a cat should not be able to make.

The jackals hesitate. Then they take the hare and leave. Perhaps they didn't like her odds. Perhaps they didn't like what's in your blood.

You wake up an hour before dawn, alive, aching, and covered in cat.`,
        choices: [{ text: 'Get up. Slowly.', do: (g) => { sleepUntil(g, 6); g.james.hp = Math.ceil(g.james.hp * 0.6); return ['You slept, badly. HP partly back, Qi full.']; }, to: 'dawn' }],
    },
    jackals_fled: {
        id: 'jackals_fled', title: 'Retreat', art: 'stream', place: 'Blackroot Wilds — the stream',
        enter: (g) => { g.flags.jackals = 'fled'; return []; },
        text: `You end up waist-deep in black water, which the jackals hate more than they hate you. They pace the bank until the sky greys, then melt into the trees.

You are cold, wet, alive and furious, and Yuki — perched on your shoulder, dry, smug — is only three of those things.`,
        choices: [{ text: 'Climb out and get warm.', do: (g) => { sleepUntil(g, 6); g.james.hp = Math.ceil(g.james.hp * 0.8); return ['A miserable few hours of sleep. HP mostly back, Qi full.']; }, to: 'dawn' }],
    },

    /* ================= DAY 2 ================= */
    dawn: {
        id: 'dawn', title: 'Day Two', art: 'forest_dawn', place: 'Blackroot Wilds',
        text: (g) => `Morning comes red. You eat ${foodCount(g) ? 'what\'s left' : 'nothing, which is a meal you are getting very good at'}, and you're working out which way is *away* when the scream comes.

Human. Female. Furious more than frightened — the kind of scream that has a lot of swearing folded into it. A few hundred metres east, down the slope.

Yuki is already looking at you. You are already moving. Apparently you have a type of stupid, and it's this one.`,
        enter: (g) => cookMealMorning(g),
        choices: [
            { text: 'Run straight toward it.', time: 5, to: 'herb_girl' },
            { text: 'Come in quietly, from above, and see what you\'re dealing with.', check: { skill: 'GU', dc: 3 }, time: 10, do: set('sneak'), to: 'herb_girl', fail: 'herb_girl' },
            { text: 'Not your world, not your fight. Head for the ridge.', time: 60, to: 'ridge_alone' },
        ],
    },
    herb_girl: {
        id: 'herb_girl', title: 'Outer Disciple', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: (g) => `${g.flags.sneak ? 'From the rocks above, you get the whole picture before anyone gets you.' : 'You come over the rise faster than is dignified.'}

A woman in a patched brown jacket, maybe mid-twenties, has her back to a boulder and a herb-knife in her fist. Her basket is on the ground, spilling something that glows faintly green. In front of her: a young man in crimson robes, sleeves embroidered with a lotus that looks like it's bleeding, and a pock-faced hulk carrying a hatchet.

"The tribute is due tomorrow," Crimson Robes is saying, bored. "This is *my* tribute, Mei Lin. The Ninefold grass, and you serve tea in my quarters tonight. Or the Elder learns your mother's been hiding a spirit root in that house."

"My mother is *sixty*—"

"Then she'll make a very old servant."

Your Parallel Cognition is already labelling him. Qi like a coal under ash: a few rungs past your own. A cultivator. Of the local kind, and of the kind that likes it.`,
        choices: [
            { text: '"Morning. Is this a private extortion or can anyone join?"', check: { skill: 'GU', dc: 4 }, to: 'gao_talked', fail: 'gao_fight_start' },
            { text: 'A bone needle through the back of his hand, before he knows you\'re here.', show: (g) => !!g.flags.sneak, qi: 3, check: { skill: 'Convergence Use', dc: 3 }, do: set('gao_hand'), to: 'gao_hand', fail: 'gao_fight_start' },
            { text: 'Step in front of her and let him make the first mistake.', to: 'gao_fight_start' },
        ],
    },
    gao_hand: {
        id: 'gao_hand', title: 'A Point Made', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: `The needle goes in between two knuckles and out the other side, and pins Crimson Robes' hand to his own sleeve. He makes a noise like a kettle.

"Hi," you say, standing up on the rocks so the morning sun is behind you, which is cheap, and works. "I'm going to need you to leave her alone."

He stares at the white needle. Then at you. Then — and this is the interesting part — he looks *afraid*. Not of the hole in his hand. Of the bone.

"Not a beast," he says. "Not a sect. What *are* you?"`,
        choices: [
            { text: '"Leaving. Is what you are. Now."', check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.gao_humiliated = true; bumpRel(g, 'Mei Lin', 10, 3); return []; }, to: 'gao_fled', fail: 'gao_fight_start' },
            { text: 'Don\'t answer. Grow a blade instead.', to: 'gao_fight_start' },
        ],
    },
    gao_talked: {
        id: 'gao_talked', title: 'Words', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { g.flags.gao_humiliated = true; bumpRel(g, 'Mei Lin', 8, 2); return []; },
        text: `It turns out that a tall foreigner in a strange white coat, who walks into an extortion with a cat on his shoulder and the bored tone of a man complaining about a parking ticket, does not compute for Crimson Robes.

You talk. You are very, very sarcastic. At one point you describe his lotus embroidery as "a cry for help". The lackey snorts and has to pretend he coughed.

Crimson Robes — *Gao Feng, Outer Disciple of the Crimson Lotus Sect*, he informs you, as if that should mean something — decides the morning has become embarrassing. He leaves. He promises, loudly, that you will regret this.

"Put it on my tab," you tell his back.`,
        choices: [{ text: 'Turn to the woman with the knife.', to: 'mei_lin' }],
    },
    gao_fight_start: {
        id: 'gao_fight_start', title: 'Crimson Lotus', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: `Gao Feng decides that whatever you are, you are alone, unarmed, and wearing a lab coat. All of that is true. None of it is the whole truth.`,
        choices: [{ text: 'Fight.', combat: gaoFight, to: 'gao_won' }],
    },
    gao_fled: {
        id: 'gao_fled', title: 'Retreat with Honour (Allegedly)', art: 'herb_girl', place: 'Blackroot Wilds — the herb slope',
        text: `Gao Feng pulls the needle out with his teeth, which is either very brave or very stupid, and backs away with his lackey. "The Crimson Lotus will hear of you," he hisses.

"Wonderful. Tell them I'm free on Thursdays."

The needle dissolves in his mouth halfway down the hill. You can hear him spit for a long time.`,
        choices: [{ text: 'Turn to the woman with the knife.', to: 'mei_lin' }],
    },
    gao_won: {
        id: 'gao_won', title: 'Crimson on the Grass', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { g.flags.gao_beaten = true; bumpRel(g, 'Mei Lin', 12, 4); return []; },
        text: `Gao Feng ends up on his back with a bone needle through his sleeve and into the ground, and the lackey ends up halfway to the next valley. You are bleeding a little. You are, you realise, grinning, which is a thing you will have to think about later.

"Kill him," says the woman with the knife, very calmly. "If he goes back, they'll come for my mother. They'll come for the village."

That isn't sarcasm. You check. It isn't.`,
        choices: [
            { text: 'Kill him. This world has rules and you\'ve just learned the first one.', do: (g) => { g.flags.gao_dead = true; bumpRel(g, 'Mei Lin', 6, 2); g.stats.kills += 1; return ['Gao Feng is dead. Something in you goes very quiet.']; }, to: 'gao_dead' },
            { text: 'Let him crawl home. You\'re a biologist, not an executioner.', do: (g) => { g.flags.gao_spared = true; return []; }, to: 'gao_spared' },
        ],
    },
    gao_lost: {
        id: 'gao_lost', title: 'Face in the Dirt', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { g.flags.gao_won_fight = true; bumpRel(g, 'Mei Lin', 6, 2); g.james.hp = Math.max(3, g.james.hp); return []; },
        text: `You end up face down in the herbs with Gao Feng's boot on your neck and the taste of blood and mint in your mouth. He takes his time telling you what he's going to do to you.

He doesn't get to finish. Eleven pounds of white cat land on his face, all claws, and while he's screaming and spinning, Mei Lin puts her herb-knife through the lackey's thigh and her basket over Gao Feng's head.

By the time he's untangled himself, the three of you are fifty metres down the slope and running.

"You," Mei Lin pants, "are the worst rescuer I have ever had."

"How many have you had?"

"*One.*"`,
        choices: [{ text: 'Keep running. Then walk. Then breathe.', time: 20, to: 'mei_lin' }],
    },
    gao_dead: {
        id: 'gao_dead', title: 'The First Rule', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        text: `It's quick. You make sure it's quick. The bone blade dissolves afterwards and leaves your hand clean, which feels obscene.

Mei Lin goes through his sleeves with practised efficiency and comes up with a pouch of rough grey pills and a jade token. She hands you the pouch. "Qi-gathering pills. Outer sect garbage. You'll want them."

"I really won't," you say. And then, because she's watching you with an expression you can't read: "I'll explain. It's a long story. It has a cat in it."`,
        enter: (g) => { addItem(g, 'beast_core', 1); return ['+1 Murky beast core (from Gao Feng\'s pouch).']; },
        choices: [{ text: 'Go with her.', to: 'mei_lin' }],
    },
    gao_spared: {
        id: 'gao_spared', title: 'Mercy, Probably a Mistake', art: 'gao_down', place: 'Blackroot Wilds — the herb slope',
        text: `Gao Feng crawls, and then limps, and then runs. Mei Lin watches him go with her jaw tight.

"That," she says, "is going to come back with friends."

"Most problems do," you admit. "I'd still rather be the kind of person who has that problem."

She looks at you for a long moment, and something in her face shifts — not agreement. Curiosity.`,
        choices: [{ text: 'Go with her.', to: 'mei_lin' }],
    },
    mei_lin: {
        id: 'mei_lin', title: 'Mei Lin', art: 'mei_lin', place: 'Blackroot Wilds — the herb slope',
        enter: (g) => { addItem(g, 'spirit_grass', 1); return ['+1 Ninefold spirit grass (a thank-you, or a test).']; },
        text: `Up close she's all edges: sharp cheekbones, sharp eyes, a sharp mouth that has clearly been getting her into trouble for years. Her hands are scarred from herb-knives and her jacket has been patched by someone who cared more about warmth than looks. She is studying you like you're a plant she can't classify.

"You have no spirit root," she says. "I'd feel it. You eat no pills — I can smell pill-eaters a li away. And you made *bone* out of *air*." She holds out a stem of the glowing grass. "Eat this."

You take it. It hums against your skin, a little hungry, a little vicious — Qi packed tight with the same foul residue as everything else, bound up in something that wants to be swallowed.

"No thank you."

"Everyone needs grass. Pills. Cores. Or you cultivate dirt and die at the first tribulation." She squints. "Unless you're a demon. Are you a demon?"

"I'm a mycologist."

"Is that worse?"

"Depends who you ask."

Yuki, from your shoulder, offers Mei Lin one slow blink. Mei Lin — to her eternal credit — blinks back.`,
        choices: [
            { text: '"Tell me about the tribute. And the tribulations. And why everyone here tastes like a funeral."', do: (g) => { g.flags.lore1 = true; bumpRel(g, 'Mei Lin', 3, 0); return []; }, time: 30, to: 'lore' },
            { text: '"Is there somewhere with a roof and food? I\'ll trade work."', time: 60, to: 'village' },
        ],
    },
    lore: {
        id: 'lore', title: 'The Way of Heaven, Locally', art: 'mei_lin', place: 'Blackroot Wilds — the path down',
        text: `She tells you as you walk, in the flat voice of someone listing the weather.

Cultivators drink the world's Qi, but the world's Qi is poisoned by everything that has ever died in it. So they eat spirit herbs to scrub it — Ninefold grass, blood ginseng, things that grow on graves. They eat beast cores. They eat pills refined from both. They eat each other's cores, when they can get them. Every rung on the ladder, they buy with something.

And at every great threshold, Heaven sends lightning. "Tribulations," she says. "The sky decides you're impure and tries to burn you clean. Most people it just burns."

"How many survive?"

"In the outer sect? One in thirty. That's why they need so many of us."

The Crimson Lotus Sect owns these mountains. Villages pay tribute in herbs, in grain, and every year in children with spirit roots. The children who come back are not children any more. Mostly, they don't come back.

You think about your own cultivation: no herbs, no pills, no lightning. A loop that eats the poison and hands back clean Qi. Your people's Qi doesn't remember anything. It just *is*.

You think, very carefully, about what a world like this does with an outlier.

"You've gone quiet," Mei Lin observes.

"I'm realising I'm the most valuable lab animal on the continent."`,
        choices: [{ text: 'Walk on to her village.', time: 40, to: 'village' }],
    },
    ridge_alone: {
        id: 'ridge_alone', title: 'The Ridge', art: 'ridge', place: 'Blackroot Wilds — the ridge',
        enter: set('ignored'),
        text: `From the ridge you see the shape of things: black forest rolling to the horizon, mountains like broken teeth, and — at the forest's heart — something enormous and dead. A tree, or the corpse of one, taller than anything that should be able to stand. Even from here, your Convergence *answers* it, a faint, sad hum.

Below the ridge: a village of grey stone and grey thatch, smoke rising. People.

On the way down you pass the herb slope. There's a spilled basket. There's blood on a boulder. Nobody is there any more.

Yuki doesn't look at you for a long time.`,
        choices: [{ text: 'Go down to the village.', time: 60, to: 'village' }],
    },
    village: {
        id: 'village', title: 'Ashfall', art: 'village', place: 'Ashfall Hamlet',
        enter: (g) => (g.flags.ignored ? (g.flags.mei_bruised = true, []) : []),
        text: (g) => `Ashfall Hamlet is forty houses of grey stone around a well, a shrine to a god whose face has been chiselled off, and a tall wooden post hung with red lotus banners. The tribute post. People move around it the way you'd move around a sleeping dog.

${g.flags.ignored
        ? 'A woman in a patched brown jacket limps past you with a split lip and an empty basket, and the whole street goes quiet around her. Someone mutters "Gao Feng". Nobody looks at you, the stranger who came down from the ridge at exactly the wrong time.'
        : 'Mei Lin walks you in like a stray she has decided to keep. "He\'s with me," she tells the street, and the street, visibly, decides to deal with that later.'}

The tribute is due at dawn tomorrow. You can feel the whole village holding its breath about it.`,
        choices: [
            { text: 'Ask for the village elder.', show: once('elder'), time: 30, do: set('elder'), to: 'elder' },
            { text: 'There\'s a sick child — you can hear the coughing. Offer to help.', show: once('healed_try'), time: 60, to: 'heal' },
            { text: 'Offer to hunt for the village. You need food; so do they.', show: once('village_hunt'), time: 120, to: 'village_hunt' },
            { text: (g) => (g.flags.ignored ? 'Find the woman with the split lip and apologise.' : 'Evening. Mei Lin said something about dinner.'), time: 30, to: 'evening' },
        ],
    },
    elder: {
        id: 'elder', title: 'Old Wen', art: 'elder', place: 'Ashfall Hamlet — the elder\'s house',
        text: (g) => `Old Wen is ninety, blind in one eye, and pours tea with the steadiness of a man who has outlived three sect masters and plans to outlive a fourth.

"You don't eat pills," he says, before you've finished sitting down. "You don't smell of grass. And your cat has twelve meridians open, which is twelve more than my last three cats." He sips. "I'd like to know what you are before the Crimson Lotus does. They'll want to cut you open to find out."

"That seems to be the consensus."

"Then let me give you an old man's advice." He sets his cup down. "Tomorrow, the collectors come. If you're here, they'll see you. If they see you, they'll want you. You can run tonight. Nobody would blame you." A pause. "Or you can stand in front of us. Nobody has done that in forty years."

${g.flags.gao_beaten || g.flags.gao_humiliated ? '"Also," he adds mildly, "I hear you\'ve already introduced yourself to Gao Feng. So running may be academic."' : ''}`,
        choices: [{ text: 'Thank him. Think about it.', to: 'village' }],
    },
    heal: {
        id: 'heal', title: 'The Coughing House', art: 'healer', place: 'Ashfall Hamlet — the coughing house',
        enter: set('healed_try'),
        text: (g) => `A boy of six or seven, flushed with fever, a wound on his calf gone red and angry and wet. The mother has been packing it with spirit-herb paste, which is roughly like packing it with angry ghosts.

You are not a doctor. You are, however, a man who has spent fifteen years thinking about what fungi do to bacteria, and ${g.inventory.jade_bracket ? 'you have a pocket full of a bracket fungus that your omnitool swears is quietly, beautifully antibiotic.' : 'you saw a bracket fungus by the stream that might have been the answer, and you didn\'t pick it.'}`,
        choices: [
            { text: 'Clean it with a bone lancet, dress it with the jade bracket.', show: (g) => (g.inventory.jade_bracket || 0) > 0, check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 60, do: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = true; bumpRel(g, 'Village', 15, 0); return ['The fever breaks before dark. The village will remember.']; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = 'partly'; bumpRel(g, 'Village', 6, 0); return ['It helps — slowly. He\'ll live, probably.']; }, to: 'village' },
            { text: 'Drain and clean it, and ask what herbs they have that don\'t taste of death.', check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { g.flags.healed = 'partly'; bumpRel(g, 'Village', 8, 0); return ['Better. Not well. But better.']; }, to: 'village' },
            { text: 'Go back to the stream for the fungus. It\'s two hours there and back.', show: (g) => !(g.inventory.jade_bracket > 0), time: 120, do: (g) => { addItem(g, 'jade_bracket', 2); return ['+2 Jade bracket fungus.']; }, to: 'heal_again' },
        ],
    },
    heal_again: {
        id: 'heal_again', title: 'The Coughing House', art: 'healer', place: 'Ashfall Hamlet — the coughing house',
        text: `You come back muddy to the knees with two shelves of pale green fungus, and the mother looks at you like you've brought her the moon.`,
        choices: [{ text: 'Get to work.', check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 60, do: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = true; bumpRel(g, 'Village', 15, 0); return ['The fever breaks before dark. The village will remember.']; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); g.flags.healed = 'partly'; bumpRel(g, 'Village', 6, 0); return ['It helps — slowly.']; }, to: 'village' }],
    },
    village_hunt: {
        id: 'village_hunt', title: 'Ironhide', art: 'boar', place: 'Blackroot Wilds — the oak hollow',
        enter: set('village_hunt'),
        text: `The village hunters won't go past the oak hollow any more: there's an ironhide boar there with tusks like plough-blades and, they swear, a beast core the size of a fist.

It finds you before you find it. It is the size of a small car and it has *opinions*.`,
        choices: [
            { text: 'Darts to the eyes, then the blade.', combat: (g) => ({ id: 'boar', intro: 'The boar paws the black earth. The ground shakes when it does.', band: 'challenging', enemies: [{ name: 'Ironhide boar', hp: 10, dc: 4, atk: 4, dmg: 5, dr: 1 }], win: 'boar_won', lose: 'boar_lost', flee: 'village' }), to: 'boar_won' },
            { text: 'A pit and a bed of bone spikes. Make it come to you.', qi: 6, check: { skill: 'Convergence Use', dc: 4 }, time: 60, to: 'boar_won', fail: 'boar_lost' },
        ],
    },
    boar_won: {
        id: 'boar_won', title: 'Meat for Forty Houses', art: 'boar', place: 'Ashfall Hamlet',
        enter: (g) => { addItem(g, 'beast_core', 1); eat(g, 40); bumpRel(g, 'Village', 12, 0); g.flags.boar = true; return ['+1 Murky beast core. You eat with the village: +40 satiety.']; },
        text: `They come out with carts. By sunset half of Ashfall is grilling ironhide, children are fighting over the tusks, and a hunter old enough to be your grandfather tries to give you his daughter, two goats and a hat. You accept the hat.`,
        choices: [{ text: 'Evening.', time: 30, to: 'evening' }],
    },
    boar_lost: {
        id: 'boar_lost', title: 'Ironhide Wins', art: 'boar', place: 'Blackroot Wilds — the oak hollow',
        enter: (g) => { g.james.hp = Math.max(1, Math.floor(g.james.hp * 0.7)); return []; },
        text: `You end up up a tree. The boar ends up bored. You both agree to call it a draw, and you limp back to Ashfall with bark in places bark should not go.`,
        choices: [{ text: 'Evening.', time: 30, to: 'evening' }],
    },
    evening: {
        id: 'evening', title: 'Dinner', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        enter: (g) => { const p = clockParts(g.minutes); if (p.hh < 19) g.minutes = (p.day - 1) * 1440 + 19 * 60; if (!g.flags.ate_dinner) { eat(g, 30); g.flags.ate_dinner = true; return ['Millet, greens and a little smoked fish: +30 satiety.']; } return []; },
        text: (g) => `${g.flags.ignored
        ? 'You find her house by asking. You apologise on her doorstep, properly, no sarcasm. She lets you in, which you did not deserve, and puts a bowl in front of you, which you deserved even less.'
        : 'Mei Lin\'s house is two rooms and a herb loft, and her mother is a tiny fierce woman who looks at you once and starts adding more millet to the pot.'}

Afterwards the mother goes to bed with pointed loudness, and it's just Mei Lin, a clay lamp, a jar of something that might once have been plum wine, and you. Yuki has claimed the warmest spot on the stove and is pretending to be asleep in a way that fools nobody.

Mei Lin's eyes are bright in the lamplight. She's taken her jacket off; underneath, a thin linen shirt and a collarbone that your Parallel Cognition has, without consulting you, dedicated an entire thread to.

"So," she says. "Mycologist."

"Mycologist."

"Tell me what that means. Slowly. I've had wine."`,
        choices: [
            { text: 'Tell her. Fungi, the forest that talks underground, the home you lost. Let it be honest.', do: (g) => { bumpRel(g, 'Mei Lin', 6, 6); g.flags.honest = true; return []; }, to: 'evening2' },
            { text: 'Flirt back. Shamelessly. You\'re forty, not dead.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 10); g.flags.flirted = true; return []; }, to: 'evening2' },
            { text: 'Thank her for dinner and sleep by the stove with Yuki.', to: 'tribute_dawn_sleep' },
        ],
    },
    evening2: {
        id: 'evening2', title: 'Lamplight', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        text: (g) => `${g.flags.honest
        ? 'You tell her about home — the grown cities, the Hearth Trees, the woods that sing back when you sing to them. You don\'t mean to tell her about the lab, but you do, and about how you don\'t know if anyone survived the blast, and somewhere in there your voice stops being sarcastic and just stays broken for a sentence or two. She doesn\'t say anything. She just puts her hand on yours and leaves it there.'
        : 'You flirt. She flirts back like it\'s a duel and she\'s been training for years. At one point she leans across the table and tells you, very seriously, that your coat is ridiculous and she\'d like to see what\'s under it, and then she laughs at your face for a full minute.'}

The lamp gutters. Neither of you fixes it.

"Tomorrow they come," she says quietly. "Gao Feng's friends. Maybe worse. Maybe they take you, or me, or the boy you ${g.flags.healed ? 'saved' : 'tried to help'}." Her thumb moves slowly across your knuckles. "I don't want to spend tonight being afraid of tomorrow."`,
        choices: [
            { text: 'Kiss her.', req: (g) => ((g.rel['Mei Lin']?.a || 0) >= 8 ? true : 'she isn\'t there yet'), do: (g) => { bumpRel(g, 'Mei Lin', 5, 15); g.flags.romance = true; return []; }, to: 'romance' },
            { text: '"Then don\'t be. Stay up and talk to me until it\'s not night any more."', do: (g) => { bumpRel(g, 'Mei Lin', 8, 4); return []; }, to: 'tribute_dawn_talk' },
            { text: 'Gently, regretfully, say goodnight.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 0); return []; }, to: 'tribute_dawn_sleep' },
        ],
    },
    romance: {
        id: 'romance', title: 'Not Afraid', art: 'romance', place: 'Ashfall Hamlet — the herb loft',
        text: `She kisses like she argues: first, hard, and to win.

Her hands are already pushing the ridiculous coat off your shoulders, and then the shirt under it, and she makes a small, approving sound against your mouth when she finds there's more under there than she expected — the hard, lean body cultivation gives even a man who spends his life in a lab. You get her linen shirt over her head. Her skin is warm in the lamplight and scarred in small honest places from herb-knives and thorns, and you kiss every one of them you can find while she laughs, breathless, and pulls you by the hair toward the ladder to the herb loft.

Up there it smells of dried mint and sun-warm hay. She pushes you down into it and climbs over you, knees either side of your hips, her hair coming loose, and looks down at you with that sharp, delighted, slightly dangerous expression that you are fairly sure is going to get you killed one day and that you would follow straight into a tribulation.

"Slowly," she says. "I told you. I've had wine."

You do it slowly. For a while.

Then not slowly at all.

*

Much later, the lamp is out, the hay is everywhere, and Mei Lin is asleep with her face in your neck and one leg thrown over you like she's staking a claim. Downstairs, Yuki sends a single, aggrieved thought up through the bond: *finally. Now be quiet.*`,
        choices: [{ text: 'Sleep. For a few hours, the world is just this.', do: (g) => { sleepUntil(g, 5); return ['Slept until 05:00. HP and Qi full.']; }, to: 'tribute' }],
    },
    tribute_dawn_talk: {
        id: 'tribute_dawn_talk', title: 'Until It\'s Not Night', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        text: `You talk until the lamp dies, and then in the dark, and then until the windows go grey. She falls asleep against your shoulder mid-sentence about a herb that blooms only in snow. You don't move. Yuki climbs into the gap between you as if she'd been invited.`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 5); g.james.hp = Math.ceil(g.james.hp); return ['A few hours of sleep. HP and Qi full.']; }, to: 'tribute' }],
    },
    tribute_dawn_sleep: {
        id: 'tribute_dawn_sleep', title: 'By the Stove', art: 'dinner', place: 'Ashfall Hamlet — Mei Lin\'s house',
        text: `You sleep by the stove with a cat on your chest and the sound of somebody else's house breathing around you. It's the safest you've felt since the lab. It lasts until dawn.`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 5); return ['Slept until 05:00. HP and Qi full.']; }, to: 'tribute' }],
    },

    /* ================= DAY 3 ================= */
    tribute: {
        id: 'tribute', title: 'The Collectors', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        text: (g) => `They come with the sun: four men in crimson, walking up the road like they own it, because they do. At their head, a tall man in deeper red with a sword on his back and a face as calm as a frozen pond — *Inner Disciple Lu Han*, the whisper goes round. ${g.flags.gao_dead ? 'Gao Feng is not with them, and they have noticed.' : `Beside him, ${g.flags.gao_beaten ? 'bandaged and murderous' : 'smirking'}, is Gao Feng.`}

The village is lined up at the tribute post with its baskets of grass and grain. ${g.flags.healed === true ? 'The mother of the boy you healed is standing very close behind you. So is half the street.' : ''}

Lu Han's gaze passes over the baskets, over the people, and stops on you. On Yuki. It stays there.

"Interesting," he says. "No root. No pill-smell. And yet the beast on your shoulder has its meridians open like a sect heir's." He tilts his head. "Kneel, stranger, and come with us. The Sect Master will want to dissect you personally. It's an honour."

"I've been offered worse," you say. "Not recently."`,
        choices: [
            { text: 'Step forward. "I\'m not kneeling, and nobody\'s paying you today."', combat: collectorsFight, to: 'collectors_won' },
            { text: 'Bluff: a wandering senior of a hidden sect, testing the Crimson Lotus\'s manners. Let a little bone show.', qi: 4, check: { skill: 'GU', dc: 6, bonus: (g) => (g.flags.healed === true ? 1 : 0) + (g.flags.boar ? 1 : 0) + (g.flags.gao_beaten ? 1 : 0) }, to: 'bluff_win', fail: 'bluff_fail' },
            { text: 'Offer tribute they\'ve never seen: sing a wraithbone hairpin, flawless, and pay the village\'s due with it.', qi: 8, check: { skill: 'Convergence Use', dc: 4 }, do: (g) => { addItem(g, 'hairpin', 1); return []; }, to: 'tribute_paid', fail: 'bluff_fail' },
        ],
    },
    bluff_fail: {
        id: 'bluff_fail', title: 'Called', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        text: `Lu Han watches your performance with real interest, the way a cat watches a beetle do something unusual. Then he smiles.

"No," he says. "But that was charming." And draws his sword.`,
        choices: [{ text: 'Fight.', combat: collectorsFight, to: 'collectors_won' }],
    },
    bluff_win: {
        id: 'bluff_win', title: 'Senior', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { g.flags.ending = 'bluff'; bumpRel(g, 'Village', 20, 0); return []; },
        text: `You don't raise your voice. You let a crown of white bone rise out of the earth around the tribute post, slow and silent and beautiful, and you let Lu Han feel your Qi: clean, utterly clean, without a trace of the death that soaks everything he has ever eaten.

To someone from this world, it must feel like standing next to the sky.

Lu Han goes still. Then — perfectly, precisely — he bows. Not deep. Just enough.

"This one did not recognise a senior," he says. "The Crimson Lotus will ask no tribute of Ashfall this season. My master will wish to… extend an invitation."

"I'll check my calendar."

They leave. Gao Feng looks back once. It is not a look that means *goodbye*.`,
        choices: [{ text: 'Breathe out.', to: 'epilogue' }],
    },
    tribute_paid: {
        id: 'tribute_paid', title: 'Heavenly Material', art: 'hairpin', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { addItem(g, 'hairpin', -1); g.flags.ending = 'paid'; bumpRel(g, 'Village', 12, 0); return []; },
        text: `It takes everything you have: a hairpin as long as your hand, white as moonlight, carved in a spiral of tiny leaves so fine the light passes through them. It's the best thing you've ever made. You hand it over like it's nothing.

Lu Han turns it in his fingers for a long time. Then he puts it inside his robe, very carefully, next to his heart.

"Ashfall's tribute is paid," he says. "In full. For three years." He looks at you. "Whoever you are, Bone-Maker, the Sect will hear of this. Pray they hear it from me."

They leave the baskets where they are.`,
        choices: [{ text: 'Breathe out.', to: 'epilogue' }],
    },
    collectors_won: {
        id: 'collectors_won', title: 'Red Snow', art: 'collectors_down', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { g.flags.ending = 'fought'; bumpRel(g, 'Village', 25, 0); addItem(g, 'beast_core', 2); return ['+2 Murky beast cores.']; },
        text: `When it's done the snow of white bone around the tribute post is speckled red, Lu Han is kneeling with your blade at his throat, and the other collectors are a long way down the road and still running.

Your hands are shaking. Not from fear. From the fact that it worked.

"Go home," you tell him. "Tell your Sect Master Ashfall has a new neighbour. Tell him the neighbour doesn't eat grass, doesn't eat pills, and doesn't eat people, and would very much like to keep it that way."

He goes. The whole village watches him go. Then, very slowly, they turn and look at you — and you realise that in this world, you've just done the one thing more dangerous than kneeling.

You've given people hope.`,
        choices: [{ text: 'Breathe out.', to: 'epilogue' }],
    },
    collectors_lost: {
        id: 'collectors_lost', title: 'Kneel', art: 'collectors', place: 'Ashfall Hamlet — the tribute post',
        enter: (g) => { g.flags.ending = 'lost'; g.james.hp = 1; return []; },
        text: `You go down hard. Lu Han's boot is on your chest and his blade is at your throat and he is looking at you with honest regret.

"Such a waste," he says. "To be born perfect and act like a fool."

What saves you is Ashfall. All of it: the boy's mother, the old hunters, the herb-women, Old Wen with his tea, Mei Lin with her knife — forty houses of grey people standing up at once and stepping between the Crimson Lotus and the stranger who wouldn't kneel.

Lu Han looks at them for a long time. At the sheer number of them. At what it would cost.

"Next season," he says finally, sheathing his sword, "the tribute doubles. And the Bone-Maker comes with us, or the village burns." He steps off you. "Rest well, senior. You have a year."`,
        choices: [{ text: 'Get up.', do: (g) => { advance(g, 120, { resting: true }); return []; }, to: 'epilogue' }],
    },
    epilogue: {
        id: 'epilogue', title: 'The Dead Tree', art: 'ridge', place: 'Blackroot Wilds — the ridge',
        enter: (g) => { const p = clockParts(g.minutes); g.minutes = (p.day - 1) * 1440 + 19 * 60; return []; },
        text: (g) => `That evening you climb the ridge with Yuki on your shoulder ${g.flags.romance ? 'and Mei Lin\'s hand in yours' : g.rel['Mei Lin']?.f > 10 ? 'and Mei Lin a step behind you' : 'and nobody else'}.

Below, Ashfall's lamps come on one by one. Beyond it, the black forest rolls away to the horizon, and at its heart stands the thing you saw from here before: the corpse of a tree so vast it scrapes the clouds.

Your Convergence *sings* to it. Faint, sad, unmistakable.

Your people grow their cities from trees like that. Their ships. Their homes. Hearth Trees. You never thought you'd see one dead.

"Something lived there," ${g.flags.romance || g.rel['Mei Lin']?.f > 10 ? 'Mei Lin says, watching your face' : 'you say to Yuki'}. "Something like us."

Yuki's tail curls around your neck. Through the bond, very clearly: *then let's go and find out who killed it.*

You're forty. You have a fresh doctorate, a cat, an empty closet the size of a universe, and a gift this world has never seen. Everything in it would like to eat you.

"Sure," you say. "What could possibly go wrong."

— **End of the Prologue.** —`,
        end: true,
        choices: [],
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

export const START_SCENE = 'arrival';
export const SCENE_COUNT = Object.keys(SCENES).length;
