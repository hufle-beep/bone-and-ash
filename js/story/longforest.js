/**
 * THE LONG FOREST — the pre-prologue cheat mode. James stays lost in the Blackroot for as long as he likes; the days are
 * not counted (the clock reads "The Long Forest"). Seclusions, trials and farmable deep zones push him as far up the
 * ladder as the player wants (Nascent Soul and past it). Leaving lands on Day 4, at the scream: Mei Lin.
 * Also here: Yuki's transformations (great root-kin at Core Formation, human form at Nascent Soul) and her form chooser.
 * Contract: js/story/power.js (degrees, Long Forest scaling with a ceiling, STOMP texts). James never kills humans.
 */
import { addItem, hasItem, eat, condense, sleepUntil, advance, d6, awardXp, awardYukiFightXp, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, yukiForms, yukiForm, ensureBars, bumpRel } from '../core/game.js';
import { condensationSatGain } from '../core/formulas.js';
import { daily, markDaily, hour, eatBest, pantry, foodCount } from './common.js';
import { registerStomp } from './power.js';

const P = 'The Long Forest';
const late = (g) => hour(g) >= 20;
const lfDays = (g) => g.flags.lf_days || 0;
const back = (g) => g.flags.yuki_return || 'lf_hub';
const yukiReturnHub = (g) => { g.flags.yuki_return = 'lf_hub'; return []; };

/* ---------------------------------------------------------------- fights ---------------------------------------------------------------- */

const FIGHTS = {
    lf_bone_hounds: { zone: 'bone', band: 'challenging', intro: 'Bone-hounds come up out of the ossuary sand.', enemies: [{ name: 'Bone-hound', hp: 10, dc: 5, atk: 6, dmg: 4 }, { name: 'Bone-hound (scarred)', hp: 11, dc: 5, atk: 6.5, dmg: 4 }], loot: (g) => { addItem(g, 'beast_core', 1); return ['+1 Murky beast core.']; } },
    lf_ossuary: { zone: 'bone', band: 'major', intro: 'The Ossuary Wyrm uncoils from the ribcage it lives in.', enemies: [{ name: 'Ossuary Wyrm', hp: 26, dc: 6, atk: 8, dmg: 6, dr: 1 }], loot: (g) => { addItem(g, 'beast_core', 2); addItem(g, 'bone_meal', 1); return ['+2 Murky beast cores, +1 Giant\'s bone-meal.']; } },
    lf_mire_brood: { zone: 'mire', band: 'challenging', intro: 'The black water boils with mire-brood.', enemies: [{ name: 'Mire-brood', hp: 8, dc: 5, atk: 6, dmg: 3 }, { name: 'Mire-brood', hp: 8, dc: 5, atk: 6, dmg: 3 }, { name: 'Mire-brood (bloated)', hp: 9, dc: 5, atk: 6, dmg: 4 }], loot: (g) => { addItem(g, 'ghost_gill', 2); return ['+2 Ghost-gill.']; } },
    lf_bog_mother: { zone: 'mire', band: 'major', intro: 'The Bog-Mother rises: a serpent as long as a village street.', enemies: [{ name: 'The Bog-Mother', hp: 28, dc: 6.5, atk: 8, dmg: 6, dr: 1 }], loot: (g) => { addItem(g, 'beast_core', 2); addItem(g, 'ghost_gill', 2); return ['+2 Murky beast cores, +2 Ghost-gill.']; } },
    lf_storm_hawks: { zone: 'ridge', band: 'challenging', intro: 'Storm-hawks drop out of the thunderhead, feathers crackling.', enemies: [{ name: 'Storm-hawk', hp: 9, dc: 6, atk: 7, dmg: 4 }, { name: 'Storm-hawk', hp: 9, dc: 6, atk: 7, dmg: 4 }], loot: (g) => { addItem(g, 'crow_feather', 4); return ['+4 Storm feathers (filed under crow feathers; they also smell).']; } },
    lf_thunder_ram: { zone: 'ridge', band: 'major', intro: 'The Thunder-horn ram lowers a skull that smokes where the lightning hit it.', enemies: [{ name: 'Thunder-horn Ram', hp: 24, dc: 6, atk: 8.5, dmg: 7, dr: 2 }], loot: (g) => { addItem(g, 'beast_core', 2); eat(g, 30); return ['+2 Murky beast cores. Roast ram on a lightning-split log: +30 satiety.']; } },
    lf_root_lurkers: { zone: 'roots', band: 'challenging', intro: 'Root-lurkers peel themselves off the white roots.', enemies: [{ name: 'Root-lurker', hp: 12, dc: 6, atk: 7, dmg: 4, dr: 1 }, { name: 'Root-lurker', hp: 12, dc: 6, atk: 7, dmg: 4, dr: 1 }], loot: (g) => { addItem(g, 'beast_core', 1); return ['+1 Murky beast core.']; } },
    lf_heartless: { zone: 'roots', band: 'major', intro: 'The Heartless stands up out of the roots: a giant husk of dead wood with a hole where its chest should be.', enemies: [{ name: 'The Heartless', hp: 30, dc: 7, atk: 9, dmg: 7, dr: 2 }], loot: (g) => { addItem(g, 'beast_core', 3); return ['+3 Murky beast cores. They are warm, and very sad.']; } },
    lf_bandits: { zone: 'human', band: 'challenging', intro: 'The Tan brothers spread out, knives low.', enemies: [{ name: 'Scarred Tan', hp: 10, dc: 5, atk: 6, dmg: 4 }, { name: 'Little Tan', hp: 8, dc: 4.5, atk: 5.5, dmg: 3 }], loot: (g) => { eat(g, 15); return ['Their jerky is now your jerky: +15 satiety.']; } },
    lf_rogue: { zone: 'human', band: 'major', intro: 'Fang Wei flicks his sleeves back. Qi gathers along his forearms like a rash.', enemies: [{ name: 'Fang Wei, Outer Disciple (lapsed)', hp: 16, dc: 6, atk: 7.5, dmg: 5, dr: 1 }], loot: (g) => { addItem(g, 'spirit_grass', 3); return ['+3 Ninefold spirit grass (his poached herbs, now evidence).']; } },
};
const fight = (id) => (g) => {
    const f = FIGHTS[id];
    g.flags.lf_last = id; // harmless when previewed: the real start or the one-move finish sets it again
    const human = f.zone === 'human';
    return { id, intro: f.intro, band: f.band, enemies: f.enemies.map((e) => ({ ...e })), win: human ? 'lf_human_won' : 'lf_trial_won', lose: human ? 'lf_human_lost' : 'lf_trial_lost', flee: 'lf_hub' };
};
const fightChoice = (id, text) => ({ text, show: daily(id), combat: fight(id), to: FIGHTS[id].zone === 'human' ? 'lf_human_won' : 'lf_trial_won' });

/* ---------------------------------------------------------------- stomp texts ---------------------------------------------------------------- */

const aside = (d, a, b, c) => (d >= 3 ? c : d >= 2 ? b : a);
registerStomp({
    lf_bone_hounds: {
        posture: (g, d) => `Two bone-hounds circle you, all ribs and teeth, rattling like wind-chimes made of bad decisions. They bay at the sky to show they are serious. ${aside(d, 'They are serious. So are you.', 'You note, clinically, that they are very loud for animals who are about to have a short afternoon.', 'Yuki yawns. That is the whole of her opinion.')}`,
        win: {
            2: () => `The hounds lie in the sand, mostly in one piece each, whining at a pitch only dogs and very small children can reach. The scarred one tries to get up, considers the white blade still hanging in the air beside you, and lies back down with tremendous dignity.

You dig the cores out of the one that didn't make it. The other limps away into the ossuary dark and does not look back, which in a hound is a form of respect.`,
            3: () => `It isn't a fight. It's a demonstration nobody asked for. The first hound leaps; you aren't there; it lands in its own pack-mate. You tap each of them once behind the skull with a needle the width of an eyelash and they fold up like dropped laundry.

When they come round, both of them roll onto their backs and show you their bellies, which are, technically, also made of bone. Yuki inspects the offering, decides it's beneath her, and sits on one of them anyway.

You take the core from the bone-pile beside them. They watch you go with the expression of dogs reconsidering their whole career.`,
        },
        one: () => 'One step, one needle, two very surprised hounds asleep in the sand. Yuki didn\'t even stand up.',
    },
    lf_ossuary: {
        posture: (g, d) => `The Ossuary Wyrm rears out of its ribcage house, forty feet of fused bone and old grudge, and hisses a sound like a cathedral collapsing in slow motion. ${aside(d, 'This one will take everything you have.', 'You run the numbers. The numbers are smug.', 'Your Parallel Cognition opens a thread titled "after lunch". It does not open a second one.')}`,
        win: {
            2: () => `It goes down in sections, like a building. By the end it's lying in its own ribcage with its jaw propped open on a bone spike of yours, breathing hard, eyes rolling, very clearly asking itself how this happened in its own home.

You take the cores and a pouch of the fine white meal from its oldest bones. It lets you. It isn't in a position to have opinions.`,
            3: () => `You sing to its bones. That's all. Bone is bone, and yours is more convincing.

The Wyrm's spine forgets which way it bends. It lies down in its ribcage, very slowly, like an old man settling into a bath, and stays there with its eyes squeezed shut, trembling, waiting for you to leave. When you reach for the core-knot under its jaw, it lifts its chin to make it easier.

Yuki walks the length of it, nose to tail, as if surveying property. Possibly she is.`,
        },
        one: () => 'You hum one note. Forty feet of bone remembers it\'s supposed to lie down.',
    },
    lf_mire_brood: {
        posture: (g, d) => `The mire-brood come up out of the black water in a slick rush, three of them, all mouth, making the wet clicking noise that in mire-brood means "lunch" and in every other language means "leave". ${aside(d, 'You set your feet.', 'You do not set your feet. You consider your boots.', 'You are mostly concerned about your boots.')}`,
        win: {
            2: () => `Two of them flee back into the water so fast they leave holes in it. The bloated one tries to pretend it's a hummock. It's not a very good hummock. You let it keep the dignity and take the ghost-gills growing on its back instead.`,
            3: () => `You don't fight them. You stand on the bank and look at them, and the Ouroboros turns once inside you, and they *taste* it — whatever you are, clean and enormous and wrong for this world — and all three of them roll over in the shallows and float there, belly up, playing dead with real commitment.

You harvest the ghost-gills from the stumps around them. One of them opens an eye to check if you've gone. You haven't. It closes the eye again, hard.`,
        },
        one: () => 'You look at them. Three mire-brood die of fright, temporarily, and float.',
    },
    lf_bog_mother: {
        posture: (g, d) => `The Bog-Mother rises out of the mire in coils as thick as a well, a crown of drowned branches on her head and a voice like a sinking ship. Whatever comes out of her mouth is ancient, and venomous, and long. ${aside(d, 'You let her finish. It seems polite.', 'You let her finish. She takes a while.', 'You let her finish. You also condense a little Qi while she does.')}`,
        win: {
            2: () => `She ends coiled round a drowned stump, holding it like a child holds a doll, hissing softly at you whenever you move. You take the cores from the spot where she shed them in the fight and two ghost-gills from her crown, very carefully, and she lets you, and hates every second of it.`,
            3: () => `It lasts four seconds. One for her to strike. One for you to not be there. One for a needle into the hinge of her jaw, which locks it shut. One for her to realise.

The Bog-Mother sinks back into her mire with only her eyes above the water, watching you with the outraged betrayal of a queen who has been asked to leave her own court. When you collect the cores she shed, she blows bubbles at you. Furiously.`,
        },
        one: () => 'One needle. The Bog-Mother\'s jaw locks, and so does her ego.',
    },
    lf_storm_hawks: {
        posture: (g, d) => `Two storm-hawks scream down the ridge, feathers crackling blue, trailing the smell of burned air. They want your Qi. Everything up here wants something. ${aside(d, 'You raise the blade.', 'You raise one eyebrow.', 'You keep both hands in your coat pockets.')}`,
        win: {
            2: () => `They end up perched on a rock above you, bedraggled, sparking weakly, pretending they were never interested. You collect the feathers they shed on the way down. One of them sulks so hard it rains a little.`,
            3: () => `They dive. You put up a single bone needle between them, point first, and they both see it at the last second and swerve so hard they collide with each other in a puff of static and feathers. They tumble into the heather and lie there, singed, looking at the sky, contemplating their life choices.

You pick up the feathers. Yuki eats a beetle. Nobody discusses what happened.`,
        },
        one: () => 'One needle held still in the air. Two storm-hawks crash into each other avoiding it.',
    },
    lf_thunder_ram: {
        posture: (g, d) => `The Thunder-horn ram paws the burned rock and lowers a skull that is still smoking from the last lightning strike, because it charges lightning for fun. It snorts sparks. ${aside(d, 'This is going to hurt.', 'This is going to hurt it.', 'This is going to be embarrassing for one of you, and it is not you.')}`,
        win: {
            2: () => `It finishes on its knees with its horns stuck in a crack of its own making, bleating in a tone that sounds a lot like a formal complaint. You free it, eventually. It does not thank you. You roast the other ram, the one that charged off the ridge, which is a sentence you never expected to think.`,
            3: () => `It charges. You step aside and hold out a palm, and it runs headfirst into a disc of white bone the width of a door, which you grew while it was still accelerating. The sound carries to the next valley. The ram sits down — actually sits, like a dog — and stares cross-eyed at nothing while small birds of its own invention circle its head.

You make dinner from the second ram that went over the cliff trying to avoid you. Yuki sits beside the stunned one all evening, purring, which is either comfort or psychological warfare.`,
        },
        one: () => 'One wall of bone. One ram. The ram loses.',
    },
    lf_root_lurkers: {
        posture: (g, d) => `Root-lurkers peel off the white roots like bark coming off a dead branch, long and grey and patient, the colour of the place exactly. They make no sound. ${aside(d, 'You make none either.', 'You hum, a little, because the roots like it.', 'You hum, and the roots answer you, and the lurkers hear *that*.')}`,
        win: {
            2: () => `They retreat into the roots in pieces, and lie there pretending to be roots again. They aren't very convincing; roots don't shake. You take the core one of them dropped and leave them to their camouflage.`,
            3: () => `You put your hand on the nearest root and sing. The Old Roots *answer* — faint, cracked, but yours — and the root-lurkers, who have lived in them all their lives, feel the whole forest floor turn to look at them.

They flatten themselves against the wood and go perfectly still, the way small animals do when a hawk passes over. One of them, very slowly, pushes its core-stone toward your boot with a long grey finger, like a tribute. You take it. It seems rude not to.`,
        },
        one: () => 'You hum to the roots. The roots hum back. The lurkers surrender to the roots.',
    },
    lf_heartless: {
        posture: (g, d) => `The Heartless unfolds out of the white roots: a giant of dead wood, eyeless, with a hollow through its chest where something was cut out a long time ago. It does not roar. It just *comes*, the way grief does. ${aside(d, 'You understand it. You fight it anyway.', 'You understand it. It doesn\'t matter.', 'You understand it. You are sorry. You are also very, very strong.')}`,
        win: {
            2: () => `It stops. Not dead — it was never alive the way you mean — but still, kneeling in the roots with its hollow chest open to the sky. When you put your palm over the hole, it shudders and goes quiet. You take three cores from the roots around it, warm as hands. You don't feel triumphant. You feel like you've closed a door on someone's grief.`,
            3: () => `It reaches for you, and you let it, and you sing into the hole in its chest — just one long note, the note the Hearth Trees sing — and the Heartless stops as if it's heard its name.

It kneels. It puts its great dead hands flat on the ground on either side of you, very gently, like something trying not to break a bird. Then it stays like that, listening, while you collect the three warm cores at its feet. Yuki presses her flank against its leg as she passes. You don't know what that means. You suspect it does.`,
        },
        one: () => 'You sing one note into the hole in its chest. It kneels.',
    },
    lf_bandits: {
        posture: (g, d) => `"Well, well," says Scarred Tan, who has clearly practised this. "A mortal. In a *white robe*. In the deep forest. With a *cat*." Little Tan laughs on cue, a beat late. "You must be very lost, uncle, or very stupid. Either way, the toll on this path is everything you're carrying and the robe."

They can't feel anything from you. Not a ripple. To them you are exactly what you look like: a tall soft scholar who took a wrong turn. ${aside(d, 'They are not entirely wrong about the wrong turn.', 'You decide not to correct them. It will be more educational this way.', 'You decide not to correct them. You decide to let them finish the speech, too, because they\'ve clearly worked on it.')}`,
        win: {
            2: () => `It's over quickly. Scarred Tan is face-down in the leaf litter with both wrists bent in directions they will remember every time it rains. Little Tan is sitting against a tree, holding his own knee very gently, weeping with a sincerity that is almost touching.

"Senior!" Scarred Tan gasps into the dirt. "This one had eyes but did not see Mount Tai! This one is lower than a worm, lower than the dung of a worm—"

"Let's not get into the dung," you say. "Go home. Find a job that doesn't involve the word *toll*."

They go. Little Tan has to be carried. Their jerky stays with you.`,
            3: () => `You don't even take your hands out of your pockets for the first part. Scarred Tan's knife meets a bone needle that grows out of the air in front of it, point to point, and stops, and his arm keeps going without the knife, and his elbow learns something new about itself. Little Tan runs at you, trips on a root that was very definitely not there a second ago, and knocks himself out on his brother.

When they wake up, you are sitting on a log, eating their jerky, with Yuki in your lap.

They kowtow. They kowtow so hard they leave dents. Scarred Tan, between kowtows, swears on the graves of all eighteen of his ancestors that the Tan family will one day repay this humiliation tenfold. Little Tan, between kowtows, asks if you're taking disciples.

"No," you say, to both of them.`,
        },
        one: () => 'You take one hand out of your pocket. Two bandits wake up an hour later, kowtowing.',
    },
    lf_rogue: {
        posture: (g, d) => `Fang Wei, Outer Disciple of the Crimson Lotus — "lapsed," he adds, with the air of a man who lapsed on purpose and with great style — looks you up and down and does not bother to hide his contempt.

"No root. No Qi. Not even pill-smell," he says. "A mortal who walked into the deep forest. Do you know what grows here, mortal? Ninefold grass worth a village. And do you know what happens to mortals who see me picking it?" He lets Qi ripple down his arms, red, crackling, very pleased with itself. "Kneel, and I'll make it quick."

He genuinely cannot sense anything. He is looking at the most cultivated thing in this forest and seeing a lost academic. ${aside(d, 'It is, admittedly, a fair first impression.', 'You find this restful.', 'You find this so restful that you almost thank him.')}`,
        win: {
            2: () => `Fang Wei ends the fight on his back in the grass with his Qi-crackling forearms pinned to the ground by bone staples, sleeves and all, swearing at the sky in three dialects.

"Who are you?" he spits. "Which sect? Which *master*? Name him, so I know whose disciples to kill when I come back!"

"I'm a mycologist," you say, and collect his poached herbs as evidence.

He swears revenge on mycology. All of it. Forever. You leave him to work it out of the staples himself.`,
            3: () => `You let him hit you. It seems only fair; he'd been building up to it. His Qi-strike lands square in your chest and the Ouroboros simply *eats* it — turns it over once, cleans it, puts it away — and Fang Wei stands there with his palm on your coat, feeling his own cultivation vanish into you like water into sand.

Then you tap him on the forehead with one finger, and he sits down very suddenly and stays down.

When he comes round, he is lying neatly on his back with his herbs stacked on his chest and both his arms bound to his sides with a single ribbon of white bone. He sees you. He sees Yuki. He starts crying, quietly, and asks — very formally, as befits the Crimson Lotus — whether you would be so gracious as to tell him what realm you are, so that he may know how far beneath you he truly lies.

"Lower than that," you say, which isn't an answer, and it's the worst thing anyone has ever said to him.`,
        },
        one: () => 'You let him hit you. You eat his Qi. You tap his forehead. He takes a nap.',
    },
});

/* ---------------------------------------------------------------- scenes ---------------------------------------------------------------- */

/** v0.11.59 (Act 1 art push 3, pick B2): the trail scenes show whom you met: the Tan brothers or Fang Wei. */
const lfTrailArt = (g) => (g.flags.lf_human === 'lf_rogue' ? 'lf_rogue' : 'lf_bandits');

const hubText = (g) => {
    const h = hour(g);
    const when = h < 11 ? 'Morning in the Long Forest. The red sun climbs the way it always does, as if it has nowhere else to be.' : h < 15 ? 'The heat of the day. The forest hums with things that would like to eat you and are reconsidering.' : h < 19 ? 'Afternoon going amber. The shadows are long, and so is the list of things you could still do today.' : 'Dusk. The Long Forest folds up its colours for the night.';
    return `${when}

You stopped counting the days a while ago. The forest didn't seem to mind, and you have a doctorate in not being in a hurry. ${g.james.realm >= 7 ? 'You are, by any reasonable measure, a problem now. The forest has noticed.' : g.james.realm >= 2 ? 'Things in the forest have started stepping off the path when you pass.' : 'Somewhere out there, past the trees, is smoke, and people, and a story waiting for you. It can wait.'}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''}`;
};

export const LONGFOREST = {
    lf_enter: {
        id: 'lf_enter', title: 'Stay Lost', art: 'lf_hub', place: P,
        enter: (g) => { g.flags.lf_active = true; g.flags.longforest = true; g.flags.lf_days = g.flags.lf_days || 0; return []; },
        text: `Somewhere out there, past the black trees, there are people. You can smell their smoke when the wind turns: woodsmoke and cooking fat and the faint sour tang of lives being lived.

You could go and find them. That would be the sensible thing.

Instead you sit down on a root and look at your hands, and at the cat, and at the forest that has been trying to eat you all day, and you think: *I know nothing about this world. Nothing. And the one thing I've learned so far is that everything in it is stronger than me.*

You have, as far as you know, all the time in the world. Literally. Your people live for nine hundred years.

"Yuki," you say. "How do you feel about camping?"

Through the bond, a single, weary image: a very long nap.

"Good," you say. "Let's stay lost for a while. Let's stay lost until we're the most dangerous thing in it."`,
        choices: [{ text: 'Into the Long Forest.', to: 'lf_hub' }],
    },

    lf_hub: {
        id: 'lf_hub', title: P, art: 'lf_hub', place: P,
        text: hubText,
        choices: [
            { text: 'Follow the smoke toward people. (Advances the story: you will meet Mei Lin.)', to: 'lf_exit' },
            { text: 'Yuki is staring at you. The bond feels… wider.', show: (g) => g.yuki.realm >= 2 && !g.flags.yuki_tiger_seen, do: yukiReturnHub, to: 'yuki_tiger_awaken' },
            { text: 'Yuki has gone very still. Something in the bond is changing shape.', show: (g) => g.yuki.realm >= 7 && !g.flags.yuki_human_seen, do: yukiReturnHub, to: 'yuki_human_awaken' },
            { text: (g) => `Yuki: change form (now: ${{ cat: 'cat', tiger: 'great root-kin', human: 'human' }[yukiForm(g)]}).`, show: (g) => yukiForms(g).length > 1, do: yukiReturnHub, to: 'yuki_form' },
            { text: 'Forage.', show: (g) => !late(g), time: 15, to: 'lf_forage' },
            { text: 'Hunt.', show: (g) => !late(g), time: 15, to: 'lf_hunt' },
            { text: 'Train.', show: (g) => !late(g), time: 10, to: 'lf_train' },
            { text: 'Go deep. (Trials: farmable zones, escalating fights.)', show: (g) => hour(g) < 17, time: 30, to: 'lf_trials' },
            { text: 'Walk the game trails and see who else is out here.', show: (g) => hour(g) < 17 && daily('lf_wander')(g), time: 60, to: 'lf_wanderers' },
            { text: 'Withdraw into seclusion. (A season passes.)', show: (g) => daily('lf_secl')(g), to: 'lf_seclusion' },
            { text: 'Stand under the cold falls until something gives.', show: (g) => !late(g) && daily('lf_falls')(g), time: 20, to: 'lf_falls' },
            { text: 'Ride Yuki through the canopy.', show: (g) => yukiForms(g).includes('tiger') && !late(g) && daily('lf_ride')(g), time: 60, to: 'lf_ride' },
            { text: 'Climb the high spur and look at the dead tree.', show: (g) => !late(g) && !g.flags.lf_tree_seen, time: 90, to: 'lf_tree_view' },
            { text: 'Yuki is bored. Yuki would like that addressed.', show: (g) => lfDays(g) >= 1 && daily('lf_bored')(g) && !late(g), time: 30, to: 'lf_bored' },
            { text: 'Wash in the river. You have been in a forest for a long time.', show: (g) => !late(g) && daily('lf_bathe')(g), time: 30, to: 'lf_bathe' },
            { text: 'Something white moves between the trees, and doesn\'t run.', show: (g) => lfDays(g) >= 3 && !g.flags.lf_stag && hour(g) < 17, time: 60, to: 'lf_white_stag' },
            { text: 'Take stock. Write it down.', show: (g) => lfDays(g) >= 2 && daily('lf_notes')(g), to: 'lf_notes' },
            { text: 'Cultivate: one sit, 10 Qi toward Saturation.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`] : []; }, to: 'lf_hub' },
            { text: 'Rest an hour.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'lf_hub' },
            { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'lf_hub' },
            { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['+8 HP.']; }, to: 'lf_hub' },
            { text: 'Make camp and sleep.', show: (g) => hour(g) >= 17, to: 'lf_morning' },
        ],
    },

    lf_morning: {
        id: 'lf_morning', title: 'Another Morning', art: 'forest_dawn', place: P,
        enter: (g) => {
            const out = [];
            if (hour(g) >= 6) sleepUntil(g, 6); else sleepUntil(g, 6);
            g.flags.lf_days = lfDays(g) + 1;
            out.push('Slept. HP and Qi full.');
            const e = eatBest(g, { fire: true });
            out.push(e.length ? `Breakfast. ${e[0]}` : 'No breakfast.');
            if (!e.length && g.james.satiety < 40) { addItem(g, 'river_cress', 3); out.push('Yuki drops three river-cress stems on your chest. +3 River cress. Message received.'); }
            return out;
        },
        text: (g) => {
            const n = lfDays(g);
            const lines = [
                'You wake to the same red sun, the same black trees, the same cat on the same part of your chest. It is extremely restful. Your threads report that you have stopped counting the days; one of them asks, politely, whether that was a decision.',
                'Rain in the night. You barely noticed. Your body has started regulating its own temperature in ways your lab would have written papers about.',
                'You wake before the birds. The birds, when they wake, notice you and go quiet, as if someone important has entered the room.',
                'A morning so beautiful it\'s almost suspicious. You sit with it anyway. You\'re getting good at sitting with things.',
                'Yuki is already up, sitting on a stone, watching the treeline with the expression of a landlord inspecting a tenant.',
                'Somewhere far off, smoke. People. The story, waiting. It can wait.',
            ];
            return `${lines[n % lines.length]}

${g.james.realm >= 7 ? 'The forest is very quiet around your camp these days. Nothing comes within a hundred metres unless it wants to apologise.' : g.james.realm >= 3 ? 'Tracks round the camp: big ones. They stop at the edge of the clearing, turn around, and leave.' : ''}`;
        },
        choices: [{ text: 'Get up.', to: 'lf_hub' }],
    },

    lf_exit: {
        id: 'lf_exit', title: 'Toward the Smoke', art: 'ridge', place: P,
        text: (g) => `You stand at the edge of the Long Forest and look back at it for a while: the camp, the stream, the trails you've worn into the black earth, the places where things tried to eat you and then, increasingly, didn't.

${g.james.realm >= 7 ? 'You are not the man who arrived here. You are not entirely sure you\'re a man in the sense this world means. Your Nascent Soul sits behind your sternum like a second, quieter you, and it would like to see some people now, please.' : g.james.realm >= 2 ? 'You are a good deal more than the man who arrived. Nobody out there will be able to tell, which you suspect is going to be entertaining.' : 'You are, if you\'re honest, about as strong as when you came in. But you know the forest now. That\'s something.'}

The thing nobody out there knows yet — the thing you've worked out from the beasts, and the bandits, and one very confused herb-poacher — is this: they can't feel you. Your cultivation runs on a loop their senses don't have a word for. To them you'll look exactly like what you look like: a tall, soft, overeducated mortal in a white coat.

"This," you tell Yuki, "is going to be either very funny or very short."

Yuki's opinion, through the bond: *both.*`,
        choices: [{
            text: 'Walk toward the smoke. (Day 4 begins.)',
            do: (g) => {
                g.flags.lf_active = false;
                g.flags.long = true;
                g.flags.forest_day = 3;
                g.minutes = 3 * 1440 + 6 * 60;
                g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g); g.yuki.hp = yukiHpMax(g); g.yuki.qi = yukiQiMax(g);
                ensureBars(g);
                return ['You leave the Long Forest. The calendar starts again: Day 4.'];
            },
            to: 'dawn',
        }],
    },

    /* ---------- daily activities ---------- */
    lf_forage: {
        id: 'lf_forage', title: 'Foraging', art: 'forage', place: `${P} — the banks`,
        text: (g) => `You know every good patch for a day's walk in any direction now. ${pantry(g)}`,
        choices: [
            { text: 'The mushroom ring under the black oaks.', show: daily('lf_ring'), check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 40, do: (g) => { markDaily(g, 'lf_ring'); addItem(g, 'jade_bracket', 3); return ['+3 Jade bracket fungus.']; }, failDo: (g) => { markDaily(g, 'lf_ring'); addItem(g, 'jade_bracket', 1); return ['+1 Jade bracket fungus.']; }, to: 'lf_forage' },
            { text: 'River cress and the honey tree.', show: daily('lf_cress'), check: { skill: 'GU', dc: 3 }, time: 50, do: (g) => { markDaily(g, 'lf_cress'); addItem(g, 'river_cress', 4); addItem(g, 'honeycomb', 1); return ['+4 River cress, +1 Wild honeycomb.']; }, failDo: (g) => { markDaily(g, 'lf_cress'); addItem(g, 'river_cress', 2); return ['+2 River cress. The bees win today.']; }, to: 'lf_forage' },
            { text: 'Ghost-gills in the deep shade, where the mire starts.', show: daily('lf_gills'), check: { skill: 'GU', dc: 5, bonus: () => 2 }, time: 60, do: (g) => { markDaily(g, 'lf_gills'); addItem(g, 'ghost_gill', 2); return ['+2 Ghost-gill.']; }, failDo: (g) => { markDaily(g, 'lf_gills'); return ['Nothing but leeches.']; }, to: 'lf_forage' },
            { text: 'Back to camp.', to: 'lf_hub' },
        ],
    },
    lf_hunt: {
        id: 'lf_hunt', title: 'The Hunt', art: 'hunt', place: `${P} — the reeds`,
        text: 'Yuki is low in the grass, tail ticking. The Long Forest, it turns out, has a lot of breakfast in it.',
        choices: [
            { text: 'Glassback hare. A dart from cover.', show: daily('lf_hare'), qi: 2, check: { skill: 'Convergence Use', dc: 3 }, time: 40, do: (g) => { markDaily(g, 'lf_hare'); addItem(g, 'hare_raw', 2); return ['+2 Glassback hare.']; }, failDo: (g) => { markDaily(g, 'lf_hare'); return ['Rainbows, then nothing.']; }, to: 'lf_hunt' },
            { text: 'Mire fowl on the rise.', show: daily('lf_fowl'), qi: 2, check: { skill: 'Convergence Use', dc: 4 }, time: 50, do: (g) => { markDaily(g, 'lf_fowl'); addItem(g, 'fowl_raw', 2); return ['+2 Mire fowl.']; }, failDo: (g) => { markDaily(g, 'lf_fowl'); return ['It honks at you from a safe distance.']; }, to: 'lf_hunt' },
            { text: 'Let Yuki hunt and watch her work.', show: daily('lf_yhunt'), time: 60, do: (g) => { markDaily(g, 'lf_yhunt'); addItem(g, yukiForm(g) === 'tiger' ? 'venison' : 'hare_raw', yukiForm(g) === 'tiger' ? 2 : 1); return [yukiForm(g) === 'tiger' ? 'She comes back dragging half an ash-deer. +2 Ash-deer venison.' : 'She comes back with a hare and a look. +1 Glassback hare.', ...awardYukiFightXp(g, 'challenging')]; }, to: 'lf_hunt' },
            { text: 'Back to camp.', to: 'lf_hub' },
        ],
    },
    lf_train: {
        id: 'lf_train', title: 'Practice', art: 'clearing', place: `${P} — the clearing`,
        text: (g) => `The clearing is scarred with your practice: trunks pocked with dart holes, a boulder neatly halved, a ring of bone stakes Yuki uses as a scratching post. ${g.james.realm >= 3 ? 'The trunks are running out of places to hit.' : ''}`,
        choices: [
            { text: 'Darts at moving targets: leaves, as they fall.', show: daily('lf_t1'), qi: 2, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t1'); return []; }, failDo: (g) => { markDaily(g, 'lf_t1'); return []; }, to: 'lf_train' },
            { text: 'Blade forms until your arms stop arguing.', show: daily('lf_t2'), qi: 3, check: { skill: 'GU', dc: 4, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t2'); return []; }, failDo: (g) => { markDaily(g, 'lf_t2'); return []; }, to: 'lf_train' },
            { text: 'Spar with Yuki. Properly. No holding back on her side.', show: daily('lf_t3'), check: { skill: 'GU', dc: 5, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t3'); return awardYukiFightXp(g, 'challenging'); }, failDo: (g) => { markDaily(g, 'lf_t3'); g.james.hp = Math.max(1, g.james.hp - 3); return ['She doesn\'t hold back. −3 HP.', ...awardYukiFightXp(g, 'challenging')]; }, to: 'lf_train' },
            { text: 'Needle drills: one point, one knuckle-width, a thousand times.', show: daily('lf_t4'), qi: 4, check: { skill: 'Convergence Use', dc: 5, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t4'); return []; }, failDo: (g) => { markDaily(g, 'lf_t4'); return []; }, to: 'lf_train' },
            { text: 'Back to camp.', to: 'lf_hub' },
        ],
    },
    lf_falls: {
        id: 'lf_falls', title: 'The Cold Falls', art: 'stream', place: `${P} — the cold falls`,
        enter: (g) => { markDaily(g, 'lf_falls'); return []; },
        text: `There's a waterfall an hour upstream: black water off a black cliff, cold enough to stop your heart if your heart weren't currently more stubborn than most people's. Cultivators in stories do this. You've always assumed it was a metaphor.

It isn't. It's just very, very cold.`,
        choices: [
            { text: 'Stand under it and hold the loop steady.', check: { skill: 'GU', dc: 5, band: 'major' }, time: 120, do: () => ['Something in your meridians gives, and settles, wider than before.'], failDo: (g) => { g.james.hp = Math.max(1, g.james.hp - 4); return ['The cold wins this round. −4 HP.']; }, to: 'lf_hub' },
            { text: 'Look at it, decide it\'s a metaphor after all, and go back.', to: 'lf_hub' },
        ],
    },
    lf_ride: {
        id: 'lf_ride', title: 'Through the Canopy', art: 'yuki_tiger', place: P,
        enter: (g) => { markDaily(g, 'lf_ride'); return []; },
        text: `Yuki in her great form is the size of a Bengal tiger and the colour of fresh snow, and she does not, she makes clear, *do* saddles. You ride bareback with your fists in the ruff of her neck and your coat streaming, and she goes up the trunks like they're stairs and along the high branches like they're roads, and the Long Forest falls away beneath you in a blur of black and red.

At the top of the canopy she stops on a branch that should not hold her and lets you look: the whole Blackroot rolling to the horizon, the smoke of a village, and the dead tree at the heart of it all, enormous and grey.

Through the bond, smug as anything: *you are welcome.*`,
        choices: [{ text: 'Thank her. Properly. She will want fish.', do: (g) => { bumpRel(g, 'Yuki', 3, 0); return awardYukiFightXp(g, 'challenging'); }, time: 60, to: 'lf_hub' }],
    },
    lf_tree_view: {
        id: 'lf_tree_view', title: 'The High Spur', art: 'ridge', place: `${P} — the high spur`,
        enter: (g) => { g.flags.lf_tree_seen = true; return []; },
        text: `From the high spur the Blackroot rolls away in every direction, black and endless, and at its heart stands the dead tree: a corpse of grey wood so tall it scrapes the clouds.

Your Convergence sings to it. Faint. Sad. Familiar in a way that makes the back of your neck go cold, because it is the exact note the Hearth Trees sing at home — the trees your people grow their cities from.

You don't go to it. Not yet. Something tells you the story will take you there when it's ready.`,
        choices: [{ text: 'Climb down.', time: 60, to: 'lf_hub' }],
    },
    lf_notes: {
        id: 'lf_notes', title: 'Field Notes', art: 'camp', place: `${P} — camp`,
        enter: (g) => { markDaily(g, 'lf_notes'); return []; },
        text: (g) => `You take stock, the way you would in the lab, in a notebook you grow out of thin bone sheets.

*Subject: James Green. Realm: ${['Mortal Vessel', 'Foundation', 'Core Formation', 'True Core', 'Golden Core', 'Origin Core', 'Soul Embryo', 'Nascent Soul', 'Spirit Transformation', 'Immortal Ascension', 'Mahayana', 'Earth Immortal', 'True Immortal', 'Golden Immortal', 'Heavenly Immortal'][g.james.realm] || 'unclear'}. Saturation: ${Math.round(g.james.saturation)}%. Observations: the local fauna has stopped attempting predation. Bandits remain optimistic. The sky has tried to strike me ${g.james.realm} time${g.james.realm === 1 ? '' : 's'} and given up ${g.james.realm} time${g.james.realm === 1 ? '' : 's'}.*

*Key finding: nothing here can sense my cultivation. Not beasts, not cultivators. They read me as an empty vessel. Every time. Hypothesis: the Ouroboros loop leaks nothing — no residue, no pressure, no smell of pills or grass — and their senses only know how to detect the residue.*

*Practical consequence: everyone I meet will underestimate me. Recommendation: let them.*

Yuki, reading over your shoulder, adds her own entry with one claw: a single scratch, which you decide means *agreed.*`,
        choices: [{ text: 'Close the notebook.', to: 'lf_hub' }],
    },

    lf_bored: {
        id: 'lf_bored', title: 'Entertainment', art: (g) => (yukiForm(g) === 'human' ? 'yuki_human' : yukiForm(g) === 'tiger' ? 'yuki_tiger' : 'clearing'), place: P,
        enter: (g) => { markDaily(g, 'lf_bored'); return []; },
        text: (g) => `${yukiForm(g) === 'human' ? '"I am bored," Yuki announces, sitting on a root with her chin in her hand. "Do something."' : 'Yuki sits directly in front of you and stares. Through the bond, with no ambiguity whatsoever: *bored.*'}

You are, technically, the most powerful thing within a week\'s walk. You have a doctorate. You can sing bone out of the air. None of this impresses a cat.

You try a bone mouse on a thread. She looks at it, and at you, with pity. You try a bone mouse that runs on its own, a little clockwork thing your Convergence works out on the spot. She considers it for a long moment, then destroys it with a single surgical swipe and walks off with the pieces.

You have, apparently, invented a toy. Your threads file the design under *publishable*.`,
        choices: [{ text: 'Make her another one. Then three more.', do: (g) => { bumpRel(g, 'Yuki', 2, 0); return awardXp(g, 'Convergence Use', 'standard'); }, time: 30, to: 'lf_hub' }],
    },
    lf_bathe: {
        id: 'lf_bathe', title: 'The River', art: 'stream', place: `${P} — the river`,
        enter: (g) => { markDaily(g, 'lf_bathe'); return []; },
        text: (g) => `Cold black water, a flat rock to leave your coat on, and, for once, nothing trying to eat you. You scrub off what feels like several weeks of forest. Your body, you notice, has changed: leaner, harder, a fighter's body grown over a scholar's bones without asking permission.

${yukiForm(g) === 'cat' ? 'Yuki watches from the rock with the horror of a cat watching someone get into water voluntarily.' : yukiForm(g) === 'tiger' ? 'Yuki, in her great form, wades in up to her chest, discovers she hates it at that size too, and gets out with enormous dignity, soaking you in the process.' : 'Yuki sits on the bank in her human form with her tail wrapped round her ankles and refuses, flatly, to discuss water.'}`,
        choices: [{ text: 'Dry off. Back to camp.', do: (g) => advance(g, 30, { resting: true }), to: 'lf_hub' }],
    },
    lf_white_stag: {
        id: 'lf_white_stag', title: 'The White Stag', art: 'bone_elk', place: `${P} — a glade`,
        enter: (g) => { g.flags.lf_stag = true; return []; },
        text: `A stag as white as Yuki stands in a glade where the light comes down in a single shaft, antlers like a winter tree, eyes the colour of old honey. It isn't afraid of you. It's the first thing in this forest that isn't afraid of you and isn't trying to eat you either.

It looks at you for a long time. Then it turns its head toward the heart of the forest, toward the dead tree, the way a guide points, and walks away into the trees without hurrying.

Yuki says nothing at all. That, from her, is the loudest thing she\'s ever said.`,
        choices: [{ text: 'Remember the direction.', do: (g) => awardXp(g, 'GU', 'challenging'), to: 'lf_hub' }],
    },

    /* ---------- seclusion ---------- */
    lf_seclusion: {
        id: 'lf_seclusion', title: 'Seclusion', art: 'lf_seclusion', place: `${P} — a cave behind the falls`,
        enter: (g) => {
            markDaily(g, 'lf_secl');
            g.flags.lf_seasons = (g.flags.lf_seasons || 0) + 1;
            const lines = [];
            for (let i = 0; i < 4; i++) lines.push(...awardXp(g, 'Convergence Use', 'major'));
            lines.push(...awardXp(g, 'GU', 'major'));
            lines.push(...awardYukiFightXp(g, 'major'));
            const gain = condensationSatGain(10, jamesQiMax(g)) * 3;
            g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10);
            sleepUntil(g, 6);
            g.flags.lf_days = lfDays(g) + 1;
            eat(g, 40);
            const short = lines.filter((l) => !/^Yuki \(bond\)/.test(l)).slice(0, 4);
            return [...short, `Saturation +${Math.round(gain * 10) / 10}% (${g.james.saturation}%). A season of meals, somehow: +40 satiety. HP and Qi full.`];
        },
        text: (g) => {
            const n = (g.flags.lf_seasons || 1) - 1;
            const seasons = [
                'You find a cave behind the cold falls and sit down in it, and the season turns without you. Snow comes and goes at the mouth of the cave. Your threads count heartbeats, then stop bothering. Somewhere around the middle of it you realise you\'ve been holding a single breath for three days and it has been fine.',
                'Spring this time: you know because the moss at the cave mouth goes green, then greener, then starts growing on your boots. Yuki brings you fish. Yuki brings you, once, a live fish, as a pointed comment on your lack of participation.',
                'A summer of sitting. The waterfall roars; you stop hearing it; you start hearing the forest\'s roots instead, every one of them, a slow wooden murmur under everything. When you come out, a family of foxes has moved into the back of the cave. They are very polite about it.',
                'Autumn. The leaves come in on the wind and pile up around you until you are a man-shaped hummock with a cat on top. Yuki has made it clear, through the bond, that she is bored, that she has been bored for weeks, and that she would like it entered into the record.',
            ];
            return `${seasons[n % seasons.length]}

When you open your eyes, the loop is tighter, cleaner, deeper. Everything you've learned has settled into you like sediment into stone.

${g.james.saturation >= 100 ? 'Saturation sits at the top of you, pressing. You could break through whenever you choose.' : ''}`;
        },
        choices: [{ text: 'Come out into the light.', to: 'lf_hub' }],
    },

    /* ---------- trials ---------- */
    lf_trials: {
        id: 'lf_trials', title: 'Going Deep', art: 'clearing', place: P,
        text: `Your map has four places on it marked in red, in your own handwriting: *where the things that eat the things that eat you live.* Each one, you've noticed, seems to have restocked itself by the next morning. The Long Forest is generous that way.`,
        choices: [
            { text: 'The Bone Field depths.', time: 60, to: 'lf_bone_depths' },
            { text: 'The Black Mire.', time: 60, to: 'lf_black_mire' },
            { text: 'The Thunder Ridge.', time: 90, to: 'lf_thunder_ridge' },
            { text: 'The Old Roots.', time: 90, to: 'lf_old_roots' },
            { text: 'Not today.', to: 'lf_hub' },
        ],
    },
    lf_bone_depths: {
        id: 'lf_bone_depths', title: 'The Bone Field Depths', art: 'lf_bone_depths', place: `${P} — the Bone Field depths`,
        text: `Past the giant skulls the Bone Field goes down: a valley within the valley, white sand made of old bone ground fine, ribs like the vaults of collapsed cathedrals. Things live in the ribs. Your Convergence can feel every one of their skeletons, which is either a tactical advantage or the most unsettling thing you've ever experienced.`,
        choices: [
            fightChoice('lf_bone_hounds', 'Take on the bone-hounds.'),
            fightChoice('lf_ossuary', 'Wake the Ossuary Wyrm.'),
            { text: 'Back to camp.', time: 60, to: 'lf_hub' },
        ],
    },
    lf_black_mire: {
        id: 'lf_black_mire', title: 'The Black Mire', art: 'lf_black_mire', place: `${P} — the Black Mire`,
        text: `The mire past the mire. The water is the colour of ink and twice as opinionated. Drowned trees stand in it like the masts of sunken ships. Everything that lives here is either hungry or pretending to be a log so something else will be hungry near it.`,
        choices: [
            fightChoice('lf_mire_brood', 'Clear the mire-brood from the ghost-gill stumps.'),
            fightChoice('lf_bog_mother', 'Call up the Bog-Mother.'),
            { text: 'Back to camp.', time: 60, to: 'lf_hub' },
        ],
    },
    lf_thunder_ridge: {
        id: 'lf_thunder_ridge', title: 'The Thunder Ridge', art: 'lf_thunder_ridge', place: `${P} — the Thunder Ridge`,
        text: (g) => `A spine of black rock above the treeline where it storms every afternoon, regardless of the weather everywhere else. The rocks are fused glass where the lightning hits. Up here the sky is used to striking things.

${g.james.realm >= 1 ? 'When you step onto the ridge, the storm overhead hesitates. You have the distinct impression it recognises you, and is choosing not to make eye contact.' : 'The storm overhead crackles at you, testing. It finds nothing to test. It sulks.'}`,
        choices: [
            fightChoice('lf_storm_hawks', 'Take on the storm-hawks.'),
            fightChoice('lf_thunder_ram', 'Challenge the Thunder-horn ram.'),
            { text: 'Stand at the summit in the storm and see what the lightning does.', show: daily('lf_storm'), do: (g) => { markDaily(g, 'lf_storm'); return []; }, time: 60, to: 'lf_storm' },
            { text: 'Back to camp.', time: 90, to: 'lf_hub' },
        ],
    },
    lf_storm: {
        id: 'lf_storm', title: 'Lightning', art: 'tribulation', place: `${P} — the Thunder Ridge summit`,
        text: `You stand on the highest rock with your arms out, like an idiot in a parable, and wait for the lightning.

It comes. Of course it comes. It's the Thunder Ridge. A bolt as thick as your arm comes down, sizzling, enormous, aimed straight at the crown of your head —

— and stops, a foot above you, and hangs there, crackling, as if someone has grabbed it by the collar. You can almost hear it thinking. *Impure? No. Corrupt? No. Pill-eater? No. Herb-eater? Grass? Cores? No, no, no.*

It goes back up. Sideways, a little. Embarrassed.

You stand there for a minute, arms still out. Yuki, from under a rock, sends a single thought: *show-off.*`,
        choices: [{ text: 'Climb down before the sky changes its mind.', do: (g) => awardXp(g, 'GU', 'challenging'), time: 30, to: 'lf_thunder_ridge' }],
    },
    lf_old_roots: {
        id: 'lf_old_roots', title: 'The Old Roots', art: 'lf_old_roots', place: `${P} — the Old Roots`,
        text: `Deeper than the Hollow, the white roots rise out of the earth as thick as houses and lie across the forest like the fallen pillars of a temple. They all lead the same way: toward the dead tree. When you touch them, your Convergence hears something under the silence. Not a song. The memory of one.

Something lives in them. Things that were made out of what the tree left behind.`,
        choices: [
            fightChoice('lf_root_lurkers', 'Drive out the root-lurkers.'),
            fightChoice('lf_heartless', 'Face the Heartless.'),
            { text: 'Back to camp.', time: 90, to: 'lf_hub' },
        ],
    },
    lf_trial_won: {
        id: 'lf_trial_won', title: 'Spoils', art: (g) => ({ bone: 'lf_bone_depths', mire: 'lf_black_mire', ridge: 'lf_thunder_ridge', roots: 'lf_old_roots' }[FIGHTS[g.flags.lf_last]?.zone] || 'clearing'), place: P,
        enter: (g) => { const f = FIGHTS[g.flags.lf_last]; markDaily(g, g.flags.lf_last); g.flags.lf_trials_won = (g.flags.lf_trials_won || 0) + 1; return f ? f.loot(g) : []; },
        text: (g) => {
            const f = FIGHTS[g.flags.lf_last];
            const name = f ? f.enemies[0].name.replace(/ \(.*\)/, '') : 'it';
            return `It's done. You stand in the aftermath breathing hard, which, these days, you've stopped taking for granted.

The ${name.toLowerCase().startsWith('the ') ? name.slice(4) : name} won't be the last thing out here that thinks you're food. But every time, there's a little less of you that agrees with it.

Yuki washes a paw, inspects it, and washes it again. In her opinion, the fight was adequate.`;
        },
        choices: [{ text: 'Back to camp.', time: 60, to: 'lf_hub' }],
    },
    lf_trial_lost: {
        id: 'lf_trial_lost', title: 'Retreat', art: 'forest_night', place: P,
        enter: (g) => { markDaily(g, g.flags.lf_last); return []; },
        text: `You lose. It happens. You end up running through the undergrowth with something very large and very offended crashing after you, and you get away mostly because Yuki takes it on a long detour through a thorn thicket while you limp home.

There's no shame in it. That's what the Long Forest is for.`,
        choices: [{ text: 'Limp back to camp and sleep it off.', do: (g) => { g.james.hp = Math.max(1, Math.ceil(g.james.hp)); return []; }, to: 'lf_morning' }],
    },

    /* ---------- wandering humans ---------- */
    lf_wanderers: {
        id: 'lf_wanderers', title: 'Company', art: lfTrailArt, place: `${P} — a game trail`,
        enter: (g) => { markDaily(g, 'lf_wander'); g.flags.lf_human = d6(g) <= 3 ? 'lf_bandits' : 'lf_rogue'; g.flags.lf_last = g.flags.lf_human; return []; },
        text: (g) => (g.flags.lf_human === 'lf_bandits'
            ? `Two men step out onto the trail ahead of you: one broad and scarred, one narrow and twitchy, both with the kind of knives that are mostly for showing people. Brothers, by the faces. Bandits, by everything else.

"Tan," says the scarred one, as an introduction. "The Tan brothers. You'll have heard of us."

You haven't. You've been in a forest. You say so. This turns out to be the wrong answer.`
            : `A young man in faded crimson is on his knees in a clearing, cutting Ninefold grass with a jade knife, very fast, glancing over his shoulder. Sect robes, the lotus picked off the sleeve. A poacher, then, on land the Crimson Lotus claims.

He sees you. He sees the white coat and the cat and the lack of anything at all on the Qi senses he's so proud of. His shoulders come down. His smile comes up.

"Oh, good," he says. "Only a mortal."`),
        choices: [
            { text: 'Let them make their speech. Then answer it.', combat: (g) => fight(g.flags.lf_human)(g), to: 'lf_human_won' },
            { text: 'Talk your way past them. You\'re very good at being underestimated.', check: { skill: 'GU', dc: 5 }, to: 'lf_human_talked', fail: 'lf_human_talked' },
            { text: 'Walk the other way. Not every fool needs a lesson today.', time: 30, to: 'lf_hub' },
        ],
    },
    lf_human_talked: {
        id: 'lf_human_talked', title: 'Words', art: lfTrailArt, place: `${P} — a game trail`,
        text: (g) => (g.flags.lf_human === 'lf_bandits'
            ? `You explain, at length and in great technical detail, the reproductive cycle of the bracket fungus growing on the log beside them. By the third minute their eyes have glazed over. By the fifth, Little Tan is asleep standing up. Scarred Tan pays *you* a copper to stop, which you accept on behalf of mycology everywhere, and they leave.`
            : `You tell him, gravely, that the grass he's cutting is the wrong grass: a toxic look-alike, fatal within the month, and that you're a travelling herb-doctor who has seen it kill a dozen men. You describe the symptoms. You make them up as you go, and they get worse every sentence.

He drops the knife. He runs. He leaves the grass. Yuki watches him go with deep satisfaction.`),
        enter: (g) => { if (g.flags.lf_human === 'lf_rogue') addItem(g, 'spirit_grass', 2); return g.flags.lf_human === 'lf_rogue' ? ['+2 Ninefold spirit grass (abandoned in a hurry).'] : []; },
        choices: [{ text: 'Back to camp.', time: 30, to: 'lf_hub' }],
    },
    lf_human_won: {
        id: 'lf_human_won', title: 'Lesson', art: lfTrailArt, place: `${P} — a game trail`,
        enter: (g) => { const f = FIGHTS[g.flags.lf_last]; return f ? f.loot(g) : []; },
        text: (g) => (g.flags.lf_last === 'lf_bandits'
            ? `It's harder than it should be, and messier, and at one point Little Tan gets a knife into your coat that you will be sewing up for a week. But it ends with both brothers in the leaf litter, alive, breathing, and holding various parts of themselves very carefully.

You don't kill them. You never do. You make sure that every time either of them tries to hold a knife again for the next month, his wrist will remind him about today.

"We'll remember this," Scarred Tan wheezes.

"I'd hope so," you say. "Otherwise what was the point."`
            : `Fang Wei is better than he looked and worse than he thought. It ends with him on his back, his Qi guttering like a wet candle, a bone needle through each sleeve pinning him to the turf, and you standing over him getting your breath back.

You don't kill him. You never do. You take the herbs he poached, as evidence, and leave him the dignity of working his own sleeves free.

"Who *are* you?" he croaks.

"Lost," you say, which is still technically true.`),
        choices: [{ text: 'Back to camp.', time: 60, to: 'lf_hub' }],
    },
    lf_human_lost: {
        id: 'lf_human_lost', title: 'Robbed', art: lfTrailArt, place: `${P} — a game trail`,
        enter: (g) => { const id = ['hare_raw', 'fowl_raw', 'venison', 'honeycomb', 'jade_bracket', 'river_cress'].find((k) => g.inventory[k] > 0); if (id) addItem(g, id, -1); return id ? ['They take some of your food.'] : []; },
        text: `You lose, which stings more than the bruises. They take what food they can find in your pockets (they don't know about the hammerspace; you're not about to tell them) and leave you lying on the trail, laughing about the mortal in the white coat.

Yuki sits on your chest until you get up. Through the bond: *we are coming back here. Later. Bigger.*`,
        choices: [{ text: 'Get up. Go home. Train.', do: (g) => { g.james.hp = Math.max(1, g.james.hp); return []; }, time: 60, to: 'lf_hub' }],
    },

    /* ---------- Yuki's forms ---------- */
    yuki_tiger_awaken: {
        id: 'yuki_tiger_awaken', title: 'The Great Form', art: 'yuki_tiger', place: (g) => g.location || P,
        enter: (g) => { g.flags.yuki_tiger_seen = true; return []; },
        text: `It happens while you're looking right at her, which is the only reason you believe it.

Yuki stands up from the patch of sun she's been occupying, stretches — front legs, then back legs, the full ritual — and keeps stretching. Her spine lengthens. Her shoulders broaden. The bond between you widens like a river after rain, and through it you feel her grow: bones lengthening, muscle thickening, meridians mirroring your new Core one for one, as they always have.

When she's done, there is a cat in front of you the size of a Bengal tiger. Pure white, every hair of her. Gold eyes, level with your chest. Paws as broad as dinner plates, sheathing and unsheathing claws like bone hooks.

She looks at you. She looks down at herself. She sits, wraps her enormous tail around her enormous feet, and through the bond, perfectly calm:

*Finally. I have been small for long enough.*

Then, as you watch, she shrinks back down to eleven pounds in a single breath, climbs your coat, settles on your shoulder, and adds: *I can do both. Whenever I like. Don't make it weird.*`,
        choices: [
            { text: '"I am absolutely going to make it weird."', do: (g) => { bumpRel(g, 'Yuki', 2, 0); return []; }, to: back },
            { text: 'Ask her to do it again. For science.', do: (g) => { g.yuki.form = 'tiger'; return ['Yuki: great root-kin form. She does it purely to loom over you.']; }, to: back },
        ],
    },
    yuki_human_awaken: {
        id: 'yuki_human_awaken', title: 'Yuki', art: 'yuki_human', place: (g) => g.location || P,
        enter: (g) => { g.flags.yuki_human_seen = true; return []; },
        text: `You feel it start through the bond before you see it: a long, slow unfolding, like a hand opening.

Yuki walks out of the shade where she's been lying, and with every step she is less of a cat. Not smaller, not larger — *different*. Taller. Upright. A slender woman steps out of the light where a cat stepped into it: long white hair falling past her waist, white cat's ears among it that turn toward you, a long white tail behind her, gold eyes with slit pupils that are, unmistakably, hers. She is wearing a simple black dress that the bond, apparently, considered appropriate. She's barefoot. She looks at her own hands for a long moment, turning them over.

Then she looks at you, and opens her mouth, and for the first time in your life you hear your root-kin's voice. It is low, and dry, and exactly what you'd expect.

"You," says Yuki, "are going to be insufferable about this."

You open your mouth.

"You are already being insufferable about this," she says, "in your face. I can see your face now. It's worse than I thought."`,
        choices: [
            { text: '"Hello, Yuki."', do: (g) => { bumpRel(g, 'Yuki', 5, 0); return []; }, to: 'yuki_human_after' },
            { text: '"Can you still do the cat thing?"', to: 'yuki_human_after' },
        ],
    },
    yuki_human_after: {
        id: 'yuki_human_after', title: 'Yuki', art: 'yuki_human', place: (g) => g.location || P,
        text: `"Hello," she says, and something in her face softens, very slightly, for about one second, and then she has it under control again.

She can still do the cat thing. She shows you: one breath, and there's a small white cat sitting in a puddle of black fabric that isn't there any more; another, and she's tall again, dress and all, looking smug. The great form, too — a white tiger the size of a pony, yawning, showing you every one of her teeth.

"Three shapes," she says, in the human one. "One of me. I'll wear whichever is useful." She considers. "The small one is best for sleeping on you. I'll keep that one most of the time."

"Of course you will."

"Don't tell anyone I can talk," she adds. "People say stupid things in front of cats. It's very informative."`,
        choices: [
            { text: 'Promise.', do: (g) => { g.yuki.form = 'cat'; return ['Yuki: back in her small form, on your shoulder, as if nothing happened.']; }, to: back },
            { text: 'Ask her to stay like this for a while.', do: (g) => { g.yuki.form = 'human'; return ['Yuki: human form. She sits beside you instead of on you, which is new.']; }, to: back },
        ],
    },
    yuki_form: {
        id: 'yuki_form', title: 'Yuki', art: 'yuki_form', place: (g) => g.location || P,
        text: (g) => `${{ cat: 'Yuki is in her small form: eleven pounds of white cat, currently draped over the warmest available part of you.', tiger: 'Yuki is in her great form: a white root-kin the size of a Bengal tiger, lying in the shade with her chin on her paws, taking up more room than seems strictly necessary.', human: 'Yuki is in her human form: long white hair, ears and tail, a black dress, sitting on a root with her knees drawn up, watching you with gold eyes.' }[yukiForm(g)]}

Through the bond, a question that isn't quite a question: *which?*`,
        choices: [
            { text: 'Small. On your shoulder.', show: (g) => yukiForm(g) !== 'cat', do: (g) => { g.yuki.form = 'cat'; return ['Yuki: cat form.']; }, to: back },
            { text: 'The great form. Let her loom.', show: (g) => yukiForms(g).includes('tiger') && yukiForm(g) !== 'tiger', do: (g) => { g.yuki.form = 'tiger'; return ['Yuki: great root-kin form (hits much harder in a fight).']; }, to: back },
            { text: 'Human. Someone to talk to.', show: (g) => yukiForms(g).includes('human') && yukiForm(g) !== 'human', do: (g) => { g.yuki.form = 'human'; return ['Yuki: human form.']; }, to: back },
            { text: 'Leave her as she is.', to: back },
        ],
    },
};

export const BREAK_HUBS = ['lf_hub'];
