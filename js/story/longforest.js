/**
 * THE LONG FOREST — the pre-prologue cheat mode. James stays lost in the Blackroot for as long as he likes; the days are
 * not counted (the clock reads "The Long Forest"). Seclusions, trials and farmable deep zones push him as far up the
 * ladder as the player wants (Nascent Soul and past it). Leaving lands on Day 4, at the scream: Mei Lin.
 * Also here: Yuki's transformations (great root-kin at Core Formation, human form at Nascent Soul) and her form chooser.
 * Contract: js/story/power.js (degrees, Long Forest scaling with a ceiling, STOMP texts). James never kills humans.
 */
import { addItem, hasItem, eat, condense, sleepUntil, advance, d6, awardXp, awardYukiFightXp, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, yukiForms, yukiForm, ensureBars, bumpRel, itemCap } from '../core/game.js';
import { condensationSatGain } from '../core/formulas.js';
import { daily, markDaily, hour, eatBest, pantry, foodCount, byForm, dayKey } from './common.js'; // v0.11.126 (NQ1): byForm
import { registerStomp } from './power.js';
import { pickLine } from '../core/lines.js'; // v0.11.175 (P8A, SW): the drills' lines

/** v0.11.71 (owner pick Y1): the Long Forest's "Let Yuki hunt": { item, n, line }; the first kind with room for the whole haul (R1); item null: none, she eats it. */
export function lfYukiCatch(g) {
    const tiger = yukiForm(g) === 'tiger', n = tiger ? 2 : 1;
    const order = tiger
        ? [['venison', "She comes back dragging half an ash-deer."], ['hare_raw', "She comes back with two hares, carried with great care and visible disdain. Half an ash-deer would have been wasted on a man with no room left for venison."], ['fowl_raw', "She comes back dragging two mire fowl by the necks, which is beneath her, and she knows you know it. Deer you have in plenty, hares the same; fowl is what was left."]]
        : [['hare_raw', "She comes back with a hare and a look."], ['fowl_raw', "She comes back with a mire fowl and a look. You have hares enough for a siege. She knows it."]];
    const hit = order.find(([id]) => itemCap(id) - (g.inventory[id] || 0) >= n); // R1: room for the whole haul
    if (!hit) return { item: null, n: 0, line: "She comes back licking her chops, and brings you nothing. Everything she hunts here, you already carry in quantity. She has eaten her share and yours." };
    return { item: hit[0], n, line: `${hit[1]} +${n} ${hit[0] === 'venison' ? 'Ash-deer venison' : hit[0] === 'hare_raw' ? 'Glassback hare' : 'Mire fowl'}.` };
}

const P = 'The Long Forest';
const late = (g) => hour(g) >= 20;
const lfDays = (g) => g.flags.lf_days || 0;
const back = (g) => g.flags.yuki_return || 'lf_hub';
const yukiReturnHub = (g) => { g.flags.yuki_return = 'lf_hub'; return []; };
/** v0.11.175 (P8A, RP): the Long Forest's days aren't counted, so its daily scenes count their own visits (world flags `lf_seen_<key>`, per Coil,
 *  gone on a rewind): the first visit reads the first text, every later visit the second. */
const seenOf = (g, k) => g.flags[`lf_seen_${k}`] || 0;
// v0.11.175 (RV1, C1/C2; Fable's review): once a day per key (`lf_seen_<key>_d` holds the day last counted): the storm's way back down the ridge and a zone
// entered twice in a day count once, so "again" always spans a night
// v0.11.177 (owner pick P9A, P8; Fable's review T14): the knowledge flag `lf_known` (kept across Coils, coil.js KEEP_FLAGS) holds, per key, the Coil of
// its first visit, so from a later Coil a first visit reads the later text too (the man remembers the place); a save from before reads as before
const coilNo = (g) => g.coil?.n || 1;
const visit = (g, k) => {
    const d = dayKey(g);
    if (g.flags[`lf_seen_${k}_d`] !== d) { g.flags[`lf_seen_${k}_d`] = d; g.flags[`lf_seen_${k}`] = seenOf(g, k) + 1; }
    const known = g.flags.lf_known || {};
    if (!known[k]) g.flags.lf_known = { ...known, [k]: coilNo(g) };
    return [];
};
const knownBefore = (g, k) => { const c = (g.flags.lf_known || {})[k]; return !!c && c < coilNo(g); };
// people (the Tans, Fang Wei) remember nothing of an earlier Coil, so their meetings count this Coil's only
const FORGETS = new Set(['lf_bandits', 'lf_rogue']);
const later = (g, k) => seenOf(g, k) >= 2 || (seenOf(g, k) >= 1 && !FORGETS.has(k) && knownBefore(g, k));
/** v0.11.175 (P8A, SW): the drills' result lines (they were silent), by the line picker (all three before any comes back). */
export const LF_DRILL = {
    t1: ["Nine leaves pinned to nine trunks before they reach the ground. The tenth lands unharmed. You call it the control.", "You stop aiming at the leaf and aim at where the wind is taking it. The wind turns out to be predictable.", "A whole branch lets go at once, out of spite. You run out of leaves before you run out of darts."],
    t1Fail: ["The leaves come down as leaves do, in no hurry and no straight line. Most of your darts arrive where a leaf was expected.", "You pin a few. The rest reach the ground untouched and lie there face up, like papers handed back.", "A gust takes the leaves sideways and half your darts straight on. Behind the treeline something yelps, and moves house."],
    t2: ["Past the three-hundredth cut your arms drop their objections. The blade goes where it is sent, and the air closes up behind it.", "The forms run together into one long line. When you stop, the white blade is humming, and so, unaccountably, are you.", "You halve a drop of dew as it falls, then one of the halves. Yuki was watching. She maintains that she was not."],
    t2Fail: ["Your arms submit their argument in full, with appendices. Somewhere past the middle the blade goes soft along the edge, and you let it dissolve.", "The forms hold as far as the seventh, which ends with the blade in a root and your hand elsewhere. You dissolve the evidence.", "Your arms argue, and carry more points than they should. You finish the set at half speed, like a man conducting a very slow orchestra."],
    t3: ["An hour of it, and you are still on your feet and she has begun to plan. She does not plan for people who don't worry her.", "You land one clean touch on her shoulder. She lands eleven on you, and rules the one inadmissible.", "She does not hold back, and you find you can read her half a breath early. The bond helps. She calls that cheating."],
    t3Fail: ["She was asked not to hold back, and she has honoured it. You kept pace for longer than either of you expected. Not for long enough.", "You saw her coming, twice. The third time you saw what she meant you to see, and went where it pointed.", "It ends with you on your back inside the ring of bone stakes she keeps as a scratching post. You nearly had her once. She disputes the nearly."],
    t4: ["Around the six-hundredth needle you stop deciding to throw. They go anyway, one after another, into a mark the width of a knuckle.", "You stop seeing the tree. There is a point, and a needle, and a thousand small agreements between the two.", "One thousand, by the threads' count. The last needle splits the one before it, which was not the drill. Nobody objects."],
    t4Fail: ["A thousand needles, and a spread nearer your palm than your knuckle. The brief said knuckle. The tree declines to see the difference.", "Your focus thins somewhere after the middle. The remainder are thrown by a man thinking about lunch, and the grouping says so.", "The needles come true for a while, then bent, then brittle. Your Qi has voted. You sit down and call it a rest interval."],
};
const lfDrill = (g, k) => { const list = LF_DRILL[k]; const i = pickLine(g, `lf_${k}`, list); return list[i < 0 ? 0 : i]; };

/* ---------------------------------------------------------------- fights ---------------------------------------------------------------- */

const FIGHTS = {
    lf_bone_hounds: { zone: 'bone', band: 'challenging', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Bone-hound', hp: 10, dc: 5, atk: 6, dmg: 4 }, { name: 'Bone-hound (scarred)', hp: 11, dc: 5, atk: 6.5, dmg: 4 }], loot: (g) => { addItem(g, 'beast_core', 1); return ['+1 Murky beast core.']; } },
    lf_ossuary: { zone: 'bone', band: 'major', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Ossuary Wyrm', hp: 26, dc: 6, atk: 8, dmg: 6, dr: 1 }], loot: (g) => { addItem(g, 'beast_core', 2); addItem(g, 'bone_meal', 1); return ['+2 Murky beast cores, +1 Giant\'s bone-meal.']; } },
    lf_mire_brood: { zone: 'mire', band: 'challenging', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Mire-brood', hp: 8, dc: 5, atk: 6, dmg: 3 }, { name: 'Mire-brood', hp: 8, dc: 5, atk: 6, dmg: 3 }, { name: 'Mire-brood (bloated)', hp: 9, dc: 5, atk: 6, dmg: 4 }], loot: (g) => { addItem(g, 'ghost_gill', 2); return ['+2 Ghost-gill.']; } },
    lf_bog_mother: { zone: 'mire', band: 'major', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'The Bog-Mother', hp: 28, dc: 6.5, atk: 8, dmg: 6, dr: 1 }], loot: (g) => { addItem(g, 'beast_core', 2); addItem(g, 'ghost_gill', 2); return ['+2 Murky beast cores, +2 Ghost-gill.']; } },
    lf_storm_hawks: { zone: 'ridge', band: 'challenging', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Storm-hawk', hp: 9, dc: 6, atk: 7, dmg: 4, flies: true }, { name: 'Storm-hawk', hp: 9, dc: 6, atk: 7, dmg: 4, flies: true }], loot: (g) => { addItem(g, 'crow_feather', 4); return ['+4 Storm feathers (filed under crow feathers; they also smell).']; } },
    lf_thunder_ram: { zone: 'ridge', band: 'major', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Thunder-horn Ram', hp: 24, dc: 6, atk: 8.5, dmg: 7, dr: 2 }], loot: (g) => { addItem(g, 'beast_core', 2); eat(g, 30); return ['+2 Murky beast cores. Roast ram on a lightning-split log: +30 satiety.']; } },
    lf_root_lurkers: { zone: 'roots', band: 'challenging', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Root-lurker', hp: 12, dc: 6, atk: 7, dmg: 4, dr: 1 }, { name: 'Root-lurker', hp: 12, dc: 6, atk: 7, dmg: 4, dr: 1 }], loot: (g) => { addItem(g, 'beast_core', 1); return ['+1 Murky beast core.']; } },
    lf_heartless: { zone: 'roots', band: 'major', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'The Heartless', hp: 30, dc: 7, atk: 9, dmg: 7, dr: 2 }], loot: (g) => { addItem(g, 'beast_core', 3); return ['+3 Murky beast cores. They are warm, and very sad.']; } },
    lf_bandits: { zone: 'human', band: 'challenging', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Scarred Tan', hp: 10, dc: 5, atk: 6, dmg: 4 }, { name: 'Little Tan', hp: 8, dc: 4.5, atk: 5.5, dmg: 3 }], loot: (g) => { eat(g, 15); return ['Their jerky is now your jerky: +15 satiety.']; } },
    lf_rogue: { zone: 'human', band: 'major', intro: '' /* v0.11.175 (P8A, IN): never shown: the stomp posture opens this fight at every degree (power.js prepare) */, enemies: [{ name: 'Fang Wei, Outer Disciple (lapsed)', hp: 16, dc: 6, atk: 7.5, dmg: 5, dr: 1 }], loot: (g) => { addItem(g, 'spirit_grass', 3); return ['+3 Ninefold spirit grass (his poached herbs, now evidence).']; } },
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
        posture: (g, d) => `Two bone-hounds circle you, ribs and teeth and nothing spent on upholstery, rattling like wind-chimes made of bad decisions. They bay at the sky, to put it on record that they are serious. ${aside(d, 'They are serious. So are you.', 'For animals with a short afternoon ahead of them, you note, clinically, they are very loud.', 'Yuki yawns. She has no further remarks.')}`,
        win: {
            2: () => `One hound lies still in the white sand. The scarred one is whining at a pitch reserved for dogs and very small children; it starts to get up, takes in the white blade still hanging in the air at your shoulder, and lies down again with tremendous dignity.

You dig the core out of the one that didn't make it. The other limps off into the dark under the great ribs without a backward look, which is as near to respect as a hound gets.`,
            3: () => `It isn't a fight. It's a demonstration, and nobody asked for one. The first hound leaps at the place where you were standing and arrives in its pack-mate instead. You touch each of them once behind the skull with a needle no thicker than an eyelash, and they go down in two loose heaps, like puppets whose strings were wanted elsewhere.

When they come round, both roll over and show you their bellies, which are, strictly speaking, more bone. Yuki inspects the offering, finds it beneath her, and sits on one of them anyway.

You take the core from the bone-pile beside them. They watch you go with the faces of dogs reconsidering the whole profession.`,
        },
        one: () => 'A step and a needle, and two very surprised hounds are asleep in the sand. Yuki had not got as far as standing up.',
    },
    lf_ossuary: {
        posture: (g, d) => `The Ossuary Wyrm comes up out of the ribcage it lives in, forty feet of fused bone and old grudge, and hisses, long and dry, like the sand running out of a very large hourglass. ${aside(d, "This one will cost you all you've got.", 'You run the numbers. The numbers are smug.', 'One of your threads opens a file named "after lunch". None of the others looks up.')}`,
        win: {
            2: () => `It comes down in sections, like a building, one storey after another. By the end it is lying in its own ribcage with its jaw propped open on a bone spike of yours, breathing hard, eyes rolling, plainly asking itself how such a thing could happen to it at home.

You take the two cores, and a pouch of the fine white meal off its oldest bones. It lets you. It is in no position to hold opinions.`,
            3: () => `You sing to its bones. Nothing more is needed. Bone is bone, and yours argues better.

The Wyrm's spine loses track of which way it bends. It lowers itself into its ribcage by slow degrees, like an old man into a hot bath, and stays there, eyes screwed shut, trembling, waiting for you to be gone. When you reach for the two core-knots under its jaw, it lifts its chin to save you the trouble. The bone-meal it doesn't even watch you take.

Yuki walks it from nose to tail, like a buyer pacing out a property. Possibly she is one.`,
        },
        one: () => 'You hum one note. Forty feet of bone recalls that bone, as a rule, lies down.',
    },
    lf_mire_brood: {
        posture: (g, d) => `The mire-brood come up out of the black water in one slick rush, three of them and every one all mouth, clicking wetly: a noise that means "lunch" in mire-brood and "leave" in every other language. ${aside(d, 'You set your feet.', 'You do not set your feet. You think about your boots.', 'Your chief concern is your boots.')}`,
        win: {
            2: () => `Two of them go back into the water so fast that they leave holes in it. The bloated one tries to pass for a hummock. As hummocks go, it is unconvincing. You leave it its dignity and take the ghost-gills growing on its back instead.`,
            3: () => `You don't fight them. You stand on the bank and look at them as you would at a slide: with interest, and with no fear in it anywhere. Nothing has ever stood on this bank and failed to be afraid. They work through what that means, and get it right. All three roll over in the shallows and float there, belly up, playing dead with real commitment.

You pick the ghost-gills off the stumps around them. One of them opens an eye to see whether you have gone. You haven't. It shuts the eye again, hard.`,
        },
        one: () => 'You look them over, with interest and nothing else. Three mire-brood die of fright, provisionally, and float.',
    },
    lf_bog_mother: {
        posture: (g, d) => `The Bog-Mother rises out of the mire in coils as thick as a well-shaft, crowned with drowned branches, and speaks in the voice of a ship going down. What she has to say is ancient, and venomous, and long. ${aside(d, 'You let her finish. It seems polite.', 'You let her finish. She has a lot of material.', 'You let her finish. You get a little Qi condensed while she does.')}`,
        win: {
            2: () => `She ends wound round a drowned stump, clutching it as a child clutches a doll, hissing under her breath whenever you move. You pick up the cores from where she shed them in the fight and take two ghost-gills out of her crown, with great care, and she lets you, and hates every second of it.`,
            3: () => `It is over about as fast as it can be told. She strikes. You are somewhere else. A needle slides into the hinge of her jaw, and the jaw stays shut. Then she understands, and that part takes longest.

The Bog-Mother sinks into her mire until only her eyes are above the water, and watches you from there with the outrage of a queen shown the door of her own court. While you collect the cores she shed, and two ghost-gills from the crown she can no longer lift out of reach, she blows bubbles at you. Furiously.`,
        },
        one: () => 'A needle in the hinge of the jaw. The Bog-Mother has a long speech ready and nowhere to put it.',
    },
    lf_storm_hawks: {
        posture: (g, d) => `Two storm-hawks come screaming down the ridge with blue fire in their feathers and the smell of scorched air behind them. They want you off their ridge, or in pieces on it. Everything up here wants something. ${aside(d, 'You raise the blade.', 'You raise one eyebrow.', 'Your hands stay in your coat pockets.')}`,
        win: {
            2: () => `They finish on a rock above you, bedraggled, giving off the odd weak spark, and behaving as though they had never taken an interest. You gather the feathers they shed on the way down. One of them sulks so hard that it rains a little.`,
            3: () => `They dive. You stand one bone needle in the air between them, point up, and both of them see it at the last instant and swerve so hard that they meet each other instead, in a puff of static and feathers. They come down in the heather and stay there, singed, on their backs, looking up at the sky as if it had let go of them.

You pick up the feathers. Yuki has found a beetle and gives it her whole attention. Nobody brings the matter up.`,
        },
        one: () => 'You hang a single needle in the air and leave it there. Two storm-hawks avoid it at each other\'s expense.',
    },
    lf_thunder_ram: {
        posture: (g, d) => `The Thunder-horn ram paws the scorched rock and lowers a skull still smoking from the last strike; it charges the lightning, for sport. It snorts sparks. ${aside(d, 'This is going to hurt.', 'This is going to hurt it.', 'One of you is about to be embarrassed, and it is not you.')}`,
        win: {
            2: () => `It ends on its knees with both horns jammed in a crack of its own making, bleating in what sounds very like the wording of a formal complaint. You get it loose, eventually. It doesn't thank you. You take your cores from the other ram, the one that charged clean off the ridge, and roast it; "the other ram" is not a phrase you had expected to need.`,
            3: () => `It charges. You take one pace to the left and hold out a palm, and it meets, head first, a disc of white bone as wide as a door, grown while it was still getting up speed. They hear it in the next valley. The ram sits down, properly sits, like a dog, and stares cross-eyed at nothing, while small birds of its own devising go round and round its head.

Dinner is the second ram, the one that went off the cliff trying to avoid you; its cores go in your pocket. Yuki keeps the stunned one company for as long as dinner takes, perfectly content, which is comfort, or else psychological warfare.`,
        },
        one: () => 'One door of bone. One ram. The door wins.',
    },
    lf_root_lurkers: {
        posture: (g, d) => `Root-lurkers peel away from the white roots like bark off a dead branch: long, grey, patient, exactly the colour of the place. They make no sound. ${aside(d, 'Neither do you.', 'You hum a little, because the roots like it.', 'You hum, and the roots answer, and *that* the lurkers hear.')}`,
        win: {
            2: () => `They go back into the roots in pieces and lie there, being roots again. It doesn't convince; roots don't shake. You pick up the core one of them dropped and leave them to their camouflage.`,
            3: () => `You put your palm to the nearest root and sing. The Old Roots *answer*: faint, cracked, but in the key of home. The root-lurkers have lived in them all their lives, and they feel the whole forest floor turn round and look at them.

They press flat to the wood and hold perfectly still, as small animals do when a hawk's shadow crosses. One of them, very slowly, slides its core-stone toward your boot with one long grey finger: tribute. You take it. Refusing seems rude.`,
        },
        one: () => 'You hum to the roots, and the roots hum back. The lurkers surrender to the roots, as the senior party.',
    },
    lf_heartless: {
        posture: (g, d) => `The Heartless unfolds out of the white roots: a giant of dead wood without eyes, and a hollow clean through its chest where something was taken out of it, long ago. It doesn't roar. It only *comes*, as grief comes. ${aside(d, 'You understand it. You fight it anyway.', 'You understand it. That changes nothing.', 'You understand it. You are sorry. You are also very, very strong.')}`,
        win: {
            2: () => `It stops. It isn't dead; it was never alive in any sense you would use; but it is still, on its knees among the roots, its hollow chest open to the sky. When you lay your palm over the hole, it shudders and goes quiet. You take three cores from the roots around it, warm as hands. There is no triumph in it. It feels like closing a door on somebody else's grief.`,
            3: () => `It reaches for you, and you let it, and you sing into the hole in its chest: one note, held, the note the Hearth Trees sing. The Heartless stops as though it had heard its name.

It kneels. It lays its great dead hands flat on the ground to either side of you, very gently, like something afraid of breaking a bird. And there it stays, listening, while you gather the three warm cores at its feet. Yuki leans against its leg for a breath as she passes. What that means, you can't say. You suspect that it can.`,
        },
        one: () => 'One note, sung into the place where its heart was. It goes down on its knees to listen.',
    },
    lf_bandits: {
        posture: (g, d) => `${later(g, 'lf_bandits') ? byForm(g, `"Well, well," says Scarred Tan, who has plainly rehearsed, and sees no reason to waste it on a second showing. "The mortal. In the *white robe*. Still in the deep forest. Still with the *cat*." Little Tan laughs on his cue, a beat late, as before. "And for repeat travellers, uncle, the toll is everything you're carrying, the robe, and this time the boots."`, `"Well, well," says Scarred Tan, who has plainly rehearsed, and sees no reason to waste it on a second showing. "The mortal. In the *white robe*. Still in the deep forest. Still with the—" His eyes reach Yuki and stop. "The *very large cat*." Little Tan laughs on his cue, a beat late. "For repeat travellers, uncle, the toll is everything you're carrying, the robe, and this time the boots."`, `"Well, well," says Scarred Tan, who has plainly rehearsed, and sees no reason to waste it on a second showing. "The mortal. In the *white robe*. Still in the deep forest. Still with the *lady*. In the *silk*." Little Tan laughs on his cue, a beat late, as before. "And for repeat travellers, uncle, the toll is everything you're carrying, the robe, and this time the boots."`) : `"Well, well," says Scarred Tan, who has plainly rehearsed. ${byForm(g, "\"A mortal. In a *white robe*. In the deep forest. With a *cat*.\"", "\"A mortal. In a *white robe*. In the deep forest. With a—\" He looks at Yuki properly, and at some length. A rehearsed man does not improvise. \"*Cat*.\"", "\"A mortal. In a *white robe*. In the deep forest. With a *lady*. In *silk*.\"")} Little Tan laughs on his cue, a beat late. "Very lost, uncle, or very stupid. It comes to the same toll: everything you're carrying, and the robe."`}

They can't feel a thing from you. Not a ripple. They see what is standing in front of them: a tall, soft scholar who took a wrong turn. ${aside(d, 'About the wrong turn, they have a case.', 'You don\'t correct them. They will learn more this way.', 'You don\'t correct them. You let them get to the end of the speech as well; work has gone into it.')}`,
        win: {
            2: () => `It doesn't take long. Scarred Tan lies face down in the leaf litter with both wrists bent in directions they will recall whenever it rains. Little Tan sits against a tree holding his own knee, very tenderly, and weeping with a sincerity that is close to touching.

"Senior!" Scarred Tan gasps into the dirt. "This one had eyes and did not see the mountain! This one is lower than a worm, lower than the dung of a worm—"

"Leave the dung out of it," you say. "Go home. Find work that doesn't have the word *toll* in it."

They go. Little Tan has to be carried. Their jerky stays with you.`,
            3: (g) => `For the opening, your hands stay in your pockets. Scarred Tan's knife meets a bone needle that has grown out of the air to receive it, point to point, and stops; his arm goes on without the knife, and his elbow finds out something new about itself. Little Tan charges, trips on a root that was most certainly not there a second ago, and knocks himself out on his brother.

When they wake, you are sitting on a log, eating their jerky, with ${byForm(g, "Yuki in your lap.", "Yuki's head in your lap.", "Yuki next to you, eating the rest.")}

They kowtow. They kowtow hard enough to leave dents. Scarred Tan swears, between kowtows, on the graves of all eighteen of his ancestors, that the Tan family will one day repay this humiliation tenfold. Little Tan asks, between kowtows, whether you take disciples.

"No," you say, to both of them.`,
        },
        one: () => 'One hand leaves your pocket, briefly. The Tan brothers wake an hour later, already kowtowing.',
    },
    lf_rogue: {
        posture: (g, d) => `${later(g, 'lf_rogue') ? `"Fang Wei," he announces, as though the forest had asked. "Outer Disciple of the Crimson Lotus. Lapsed." The last word is set down again with the same care, in case it was missed. He looks you over from hair to boots and finds what he found before.

"No root. No Qi. Still not so much as the smell of a pill." He lets his Qi run down both arms, red and crackling and very pleased with itself. "You know what grows here, mortal. You know what it fetches. What you may not know is what becomes of mortals who watch me cut it twice. Kneel, and I'll be quick."` : `Fang Wei, Outer Disciple of the Crimson Lotus ("lapsed," he adds, in the tone of a man who lapsed on purpose and did it with style), looks you over from hair to boots and takes no trouble to hide what he finds.

"No root. No Qi. Not so much as the smell of a pill," he says. "A mortal, walking about in the deep forest. Do you know what grows here, mortal? Ninefold grass, worth a village. And do you know what becomes of mortals who see me cutting it?" He lets his Qi run down both arms, red and crackling and very pleased with itself. "Kneel, and I'll be quick."`}

He truly senses nothing. Those senses are his pride, and they have been over you twice and reported one lost academic, contents nil. ${aside(d, 'As first impressions go, it is a fair one.', 'You find this restful.', 'You find this so restful that you nearly thank him.')}`,
        win: {
            2: () => `Fang Wei finishes the fight on his back in the grass, both crackling forearms stapled to the ground in white bone, sleeves and all, swearing at the sky in three dialects.

"Who are you?" he spits. "What sect? What *master*? Name him, so that I know whose disciples to kill when I come back!"

"I'm a mycologist," you say, and collect his poached herbs, as evidence.

He swears vengeance on mycology. All of it. For ever. You leave him to work his own way out of the staples.`,
            3: () => `You let him hit you. It is only fair; he has been working up to it. The strike lands square on your chest, and the Ouroboros simply *eats* it: turns it over once, cleans it, puts it away. Fang Wei stands with his palm flat on your coat and feels his Qi go into you like water into sand, and go on going.

Then you tap him on the forehead with one finger, and he sits down all at once and stays down.

He comes round laid out neatly on his back, his herb-bag folded on his chest, empty, and both arms bound to his sides by a single ribbon of white bone. He sees you. He sees Yuki. He begins, quietly, to cry, and asks, with full formality, as befits the Crimson Lotus, whether you would be so gracious as to name your realm, that he may know how far beneath you he truly lies.

"Lower than that," you say, which is no answer at all, and is also the worst thing anyone has ever said to him.`,
        },
        one: () => 'He hits you. The loop eats the strike and wants nothing else from him. One fingertip between his eyebrows, and Fang Wei lies down for a while.',
    },
});

/* ---------------------------------------------------------------- scenes ---------------------------------------------------------------- */

/** v0.11.59 (Act 1 art push 3, pick B2): the trail scenes show whom you met: the Tan brothers or Fang Wei. */
const lfTrailArt = (g) => (g.flags.lf_human === 'lf_rogue' ? 'lf_rogue' : 'lf_bandits');

const hubText = (g) => {
    const h = hour(g);
    const when = h < 11 ? 'Morning in the Long Forest. The red sun comes up at its usual pace, like something with no other appointments.' : h < 15 ? 'The heat of the day. The forest hums with things that would like to eat you and are having second thoughts.' : h < 19 ? 'The afternoon is turning amber. The shadows are long, and so is the list of what you could still do with today.' : 'Dusk. The Long Forest puts its colours away for the night.';
    return `${when}

${lfDays(g) ? "You have stopped counting the days. The forest raised no objection, and you have a doctorate in not being in a hurry." : "The days are not being counted here. You checked your own head for a tally, found none, and left it that way."} ${g.james.realm >= 7 ? 'By any reasonable measure you are now a problem. The forest has taken note.' : g.james.realm >= 2 ? 'The residents of the forest have taken to leaving the path when you come down it.' : 'Past the trees there is smoke, and a village, and a week whose ending you have already seen. It can wait.'}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry enough to notice.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt, and it shows.' : ''}`;
};

export const LONGFOREST = {
    lf_enter: {
        id: 'lf_enter', title: 'Stay Lost', art: 'lf_hub', place: P,
        enter: (g) => { g.flags.lf_active = true; g.flags.longforest = true; g.flags.lf_days = g.flags.lf_days || 0; return []; },
        text: `Past the black trees there are people. When the wind turns you can smell their smoke: wood, cooking fat, and the faint sour edge of lives lived at close quarters.

You could walk out to them. That would be the sensible thing, and this time you know where the sensible thing leads: a scream on the fourth morning, a village, a Sect, a tribute on the seventh day.

Instead you sit down on a root and look at your hands, and at Yuki, and at a forest that did its best to eat you the last time through, and you think: *I know exactly what is waiting out there. What I don't know is how far I can climb before I walk back into it.*

You have, as far as you can tell, all the time in the world, and lately you mean it literally. Your people live eight or nine hundred years, and this week has already shown that it comes round again.

"Yuki," you say. "How do you feel about camping?"

Through the bond, one weary image: a very long nap.

"Good," you say. "Let's stay lost for a while. Let's stay lost until we're the most dangerous thing in it."`,
        choices: [{ text: 'Into the Long Forest.', to: 'lf_hub' }],
    },

    lf_hub: {
        id: 'lf_hub', title: P, art: 'lf_hub', place: P,
        text: hubText,
        choices: [
            { text: 'Follow the smoke toward people. (Advances the story: you will meet Mei Lin.)', to: 'lf_exit' },
            { text: 'Yuki is staring at you. The bond feels… wider.', show: (g) => g.yuki.realm >= 2 && !g.flags.yuki_tiger_seen, do: yukiReturnHub, to: 'yuki_tiger_awaken' },
            { text: 'Yuki has gone very still. Something in the bond is changing shape.', show: (g) => g.yuki.realm >= 7 && !!g.flags.yuki_tiger_seen && !g.flags.yuki_human_seen, do: yukiReturnHub, to: 'yuki_human_awaken' }, // v0.11.175 (RV1, T8): the great form's scene first (as prologue.js's breakthrough orders them)
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
            { text: 'Cultivate: one sit, 10 Qi toward Saturation.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'lf_hub' },
            { text: 'Rest an hour.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of doing nothing, done properly.']), to: 'lf_hub' },
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
            out.push('You slept, and the forest let you. HP and Qi full.');
            const e = eatBest(g, { fire: true });
            out.push(e.length ? `Breakfast. ${e[0]}` : 'No breakfast.');
            if (!e.length && g.james.satiety < 40) { addItem(g, 'river_cress', 3); out.push('Yuki lays three stems of river cress on your chest and waits. +3 River cress. You take the point.'); }
            return out;
        },
        text: (g) => {
            const n = lfDays(g);
            const lines = [
                byForm(g, "You wake to the same red sun, the same black trees and the same cat on the same square of your chest. It is deeply restful. Somewhere in your threads the count of days has quietly stopped, and not one of them has reported it as a fault.", "You wake to the same red sun, the same black trees and the same great white flank along your back, giving off heat like a kiln. It is deeply restful. Somewhere in your threads the count of days has quietly stopped, and not one of them has reported it as a fault.", "You wake to the same red sun, the same black trees and the same white-haired woman asleep back to back with you, her tail dropped over your ankles like a scarf. It is deeply restful. Somewhere in your threads the count of days has quietly stopped, and not one of them has reported it as a fault."), // v0.11.175 (P8A, YF)
                'It rained in the night, and you slept through it warm. Your body has taken charge of its own temperature, by methods your lab would have fought over the authorship of.',
                'You are awake before the birds. When their turn comes they see you and stop singing, like a lecture hall when the examiner walks in.',
                "The morning is beautiful enough to be a trap. You sit with it anyway. Sitting with things is what this forest teaches best.",
                'Yuki is up before you, on the flat stone by the ashes, studying the treeline like a landlord making up her mind about a tenant.',
                'Smoke, far off, when the wind turns. The village, and the week that comes with it. Both will keep.',
            ];
            return `${lines[n % lines.length]}

${g.james.realm >= 7 ? 'The forest keeps a wide quiet round your camp. Nothing comes within a hundred metres unless it has come to apologise.' : g.james.realm >= 3 ? 'There are tracks round the camp, large ones. They reach the edge of the clearing, turn round and go home.' : ''}`;
        },
        choices: [{ text: 'Get up.', to: 'lf_hub' }],
    },

    // v0.11.129 (CS1, LB; Fable's MAIN): the human's opinion aloud
    lf_exit: {
        id: 'lf_exit', title: 'Toward the Smoke', art: 'ridge', place: P,
        text: (g) => `You stop at the edge of the Long Forest and look back at it: the camp, the stream, the trails your boots have pressed into the black earth, the places where things tried to eat you and then, more and more often, thought better of it.

${g.james.realm >= 7 ? "The man who walked in here is not the one walking out. You are no longer sure that *man*, as this world uses the word, still covers you. The Nascent Soul sits behind your sternum like a second, quieter you, and it would like to see some people now, please." : g.james.realm >= 2 ? "You are considerably more than the man who walked in. Nobody out there will be able to tell, and you expect that to be entertaining." : "You are, if you're honest, not much stronger than the man who walked in. But you know the forest now, and you know what lies past it. That counts."}

What nobody out there knows, and what you were told to your face the last time through by someone ready to stake her life on it, you have now tested on everything in this forest that has looked at you: they can't feel you. Your cultivation runs in a loop their senses have no word for. To them you will be exactly what you appear to be: a tall, soft, overeducated mortal in a white coat.

"This," you tell Yuki, "is going to be either very funny or very short."

${byForm(g, 'Yuki\'s opinion, through the bond: *both.*', 'Yuki\'s opinion, through the bond: *both.*', 'Yuki\'s opinion, delivered aloud: "Both."')}`,
        choices: [{
            text: 'Walk toward the smoke. (Day 4 begins.)',
            do: (g) => {
                g.flags.lf_active = false;
                g.flags.long = true;
                g.flags.forest_day = 3;
                g.minutes = 3 * 1440 + 6 * 60;
                g.james.hp = jamesHpMax(g); g.james.qi = jamesQiMax(g); g.yuki.hp = yukiHpMax(g); g.yuki.qi = yukiQiMax(g);
                ensureBars(g);
                return ['You walk out of the Long Forest. The calendar starts again: Day 4.'];
            },
            to: 'dawn',
        }],
    },

    /* ---------- daily activities ---------- */
    lf_forage: {
        id: 'lf_forage', title: 'Foraging', art: 'forage', place: `${P} — the banks`,
        text: '',
        choices: [
            { text: 'The mushroom ring under the black oaks.', show: daily('lf_ring'), check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 40, do: (g) => { markDaily(g, 'lf_ring'); addItem(g, 'jade_bracket', 3); return ['+3 Jade bracket fungus.']; }, failDo: (g) => { markDaily(g, 'lf_ring'); addItem(g, 'jade_bracket', 1); return ['+1 Jade bracket fungus.']; }, to: 'lf_forage' },
            { text: 'River cress and the honey tree.', show: daily('lf_cress'), check: { skill: 'GU', dc: 3 }, time: 50, do: (g) => { markDaily(g, 'lf_cress'); addItem(g, 'river_cress', 4); addItem(g, 'honeycomb', 1); return ['+4 River cress, +1 Wild honeycomb.']; }, failDo: (g) => { markDaily(g, 'lf_cress'); addItem(g, 'river_cress', 2); return ['+2 River cress. The honey stays with the bees, who felt strongly about it.']; }, to: 'lf_forage' },
            { text: 'Ghost-gills in the deep shade, where the mire starts.', show: daily('lf_gills'), check: { skill: 'GU', dc: 5, bonus: () => 2 }, time: 60, do: (g) => { markDaily(g, 'lf_gills'); addItem(g, 'ghost_gill', 2); return ['+2 Ghost-gill.']; }, failDo: (g) => { markDaily(g, 'lf_gills'); return ['The deep shade offers leeches, and nothing else.']; }, to: 'lf_forage' },
            { text: 'Back to camp.', to: 'lf_hub' },
        ],
    },
    lf_hunt: {
        id: 'lf_hunt', title: 'The Hunt', art: 'hunt', place: `${P} — the reeds`,
        text: '',
        choices: [
            { text: 'Glassback hare. A dart from cover.', show: daily('lf_hare'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 40, do: (g) => { markDaily(g, 'lf_hare'); addItem(g, 'hare_raw', 2); return ['+2 Glassback hare.']; }, failDo: (g) => { markDaily(g, 'lf_hare'); return ['A wink of glass in the reeds, and your dart finds mud.']; }, to: 'lf_hunt' },
            { text: 'Mire fowl on the rise.', show: daily('lf_fowl'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 50, do: (g) => { markDaily(g, 'lf_fowl'); addItem(g, 'fowl_raw', 2); return ['+2 Mire fowl.']; }, failDo: (g) => { markDaily(g, 'lf_fowl'); return ['It honks at you from just out of range, a distance it has clearly measured.']; }, to: 'lf_hunt' },
            // v0.11.71 (owner pick Y1, texts Fable's): her kind full → the next not full (tiger: venison → hares → fowl; else hares → fowl); all full: she eats it. Hidden when all three are full (`gives`)
            { text: 'Let Yuki hunt and watch her work.', show: daily('lf_yhunt'), gives: ['venison', 'hare_raw', 'fowl_raw'], time: 60, do: (g) => { markDaily(g, 'lf_yhunt'); const r = lfYukiCatch(g); if (r.item) addItem(g, r.item, r.n); return [r.line, ...awardYukiFightXp(g, 'challenging')]; }, to: 'lf_hunt' },
            { text: 'Back to camp.', to: 'lf_hub' },
        ],
    },
    lf_train: {
        id: 'lf_train', title: 'Practice', art: 'clearing', place: `${P} — the clearing`,
        text: '',
        choices: [
            { text: 'Darts at moving targets: leaves, as they fall.', show: daily('lf_t1'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t1'); return [lfDrill(g, 't1')]; }, failDo: (g) => { markDaily(g, 'lf_t1'); return [lfDrill(g, 't1Fail')]; }, to: 'lf_train' },
            { text: 'Blade forms until your arms stop arguing.', show: daily('lf_t2'), qi: 3, check: { skill: 'GU', dc: 4, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t2'); return [lfDrill(g, 't2')]; }, failDo: (g) => { markDaily(g, 'lf_t2'); return [lfDrill(g, 't2Fail')]; }, to: 'lf_train' },
            { text: 'Spar with Yuki. Properly. No holding back on her side.', show: daily('lf_t3'), check: { skill: 'GU', dc: 5, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t3'); return [lfDrill(g, 't3'), ...awardYukiFightXp(g, 'challenging')]; }, failDo: (g) => { markDaily(g, 'lf_t3'); g.james.hp = Math.max(1, g.james.hp - 3); return [lfDrill(g, 't3Fail'), '−3 HP.', ...awardYukiFightXp(g, 'challenging')]; }, to: 'lf_train' },
            { text: 'Needle drills: one point, one knuckle-width, a thousand times.', show: daily('lf_t4'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5, band: 'challenging' }, time: 60, do: (g) => { markDaily(g, 'lf_t4'); return [lfDrill(g, 't4')]; }, failDo: (g) => { markDaily(g, 'lf_t4'); return [lfDrill(g, 't4Fail')]; }, to: 'lf_train' },
            { text: 'Back to camp.', to: 'lf_hub' },
        ],
    },
    lf_falls: {
        id: 'lf_falls', title: 'The Cold Falls', art: 'stream', place: `${P} — the cold falls`,
        enter: (g) => { markDaily(g, 'lf_falls'); return visit(g, 'falls'); },
        text: (g) => (later(g, 'falls') ? `The cliff has not moved, and neither has the water: black, loud, and no warmer for being known. Your body lodges its objection from a hundred paces off.

The stories still recommend it. The stories were written by the survivors.` : `An hour upstream a waterfall comes off a black cliff: black water, cold enough to stop any heart less stubborn than yours has lately become. Cultivators in stories stand under such things. You had always taken it for a metaphor.

It is not a metaphor. It is only very, very cold.`),
        choices: [
            { text: 'Stand under it and hold the loop steady.', check: { skill: 'GU', dc: 5, band: 'major' }, time: 120, do: () => ['Under the water something in your meridians gives way, then settles, wider than it was.'], failDo: (g) => { g.james.hp = Math.max(1, g.james.hp - 4); return ['This round goes to the waterfall. −4 HP.']; }, to: 'lf_hub' },
            { text: 'Look at it, decide it\'s a metaphor after all, and go back.', to: 'lf_hub' },
        ],
    },
    lf_ride: {
        id: 'lf_ride', title: 'Through the Canopy', art: 'yuki_tiger', place: P,
        enter: (g) => { markDaily(g, 'lf_ride'); return visit(g, 'ride'); },
        text: (g) => (later(g, 'ride') ? `Yuki still does not do saddles, and you have stopped raising it. You get a fistful of white ruff and one breath of warning; then the ground is a rumour and she is going up the trunks in long easy bounds, choosing branches like a pianist choosing keys, faster now that she knows you'll stay on.

At the top she stops on her usual impossible branch and shows you round like someone who has had the view repainted: the Blackroot, black to every edge; one thin line of village smoke; the dead tree, grey, at the centre of it all.

Through the bond, comfortably: *still welcome.*` : `In her great form Yuki is the size of a Bengal tiger and the white of new snow, and she lets it be known that she does not *do* saddles. So you ride bareback, fists in the ruff of her neck and coat streaming behind you, while she takes the trunks like stairs and the high branches like roads and the Long Forest drops away below in a smear of black and red.

At the roof of the canopy she halts on a branch that has no business holding her, and lets you look: the Blackroot rolling out to the horizon, one thread of village smoke, and at the heart of it all the dead tree, grey and enormous.

Through the bond, smug beyond measurement: *you are welcome.*`),
        choices: [{ text: 'Thank her. Properly. She will want fish.', do: (g) => { bumpRel(g, 'Yuki', 3, 0); return [later(g, 'ride') ? `You thank her properly, forehead to forehead, and the bond goes warm and still. Then, as ever: *fish. The flat ones, from the slow water. The rate has not changed.*` : `You thank her properly: out loud, with your forehead against hers, which is now wider than your hand. The bond goes very quiet and very warm, and then, businesslike: *fish. The flat ones from the slow water. You know the ones.* You do. You also know you are not getting out of it.`, ...awardYukiFightXp(g, 'challenging')]; }, time: 60, to: 'lf_hub' }],
    },
    lf_tree_view: {
        id: 'lf_tree_view', title: 'The High Spur', art: 'ridge', place: `${P} — the high spur`,
        enter: (g) => { g.flags.lf_tree_seen = true; return []; },
        text: `From the high spur the Blackroot runs out black in every direction, with no visible end, and at its heart stands the dead tree: a corpse in grey wood, tall enough to scrape the cloud.

Your Convergence sings to it, faint and sad. And you know the note, which is what turns the back of your neck cold: it is the exact one the Hearth Trees sing at home, the trees your people grow their cities from.

You don't go to it. Not from here, and not yet. It has the look of a thing that will still be standing when the road gets round to it.`,
        choices: [{ text: 'Climb down.', time: 60, to: 'lf_hub' }],
    },
    lf_notes: {
        id: 'lf_notes', title: 'Field Notes', art: 'camp', place: `${P} — camp`,
        enter: (g) => { markDaily(g, 'lf_notes'); return visit(g, 'notes'); },
        text: (g) => `You take stock as you would in the lab, in a notebook grown for the purpose out of thin sheets of bone.

*Subject: James Green. Realm: ${['Mortal Vessel', 'Foundation', 'Core Formation', 'True Core', 'Golden Core', 'Origin Core', 'Soul Embryo', 'Nascent Soul', 'Spirit Transformation', 'Immortal Ascension', 'Mahayana', 'Earth Immortal', 'True Immortal', 'Golden Immortal', 'Heavenly Immortal'][g.james.realm] || 'unclear'}. Saturation: ${Math.round(g.james.saturation)}%. Observations: the local fauna attempts predation less often than it did. The exceptions are optimists. ${g.james.realm === 0 ? 'The sky has not yet tried to strike me. I gather it gets round to everyone.' : `The sky has tried to strike me ${g.james.realm} time${g.james.realm === 1 ? '' : 's'} and thought better of it ${g.james.realm} time${g.james.realm === 1 ? '' : 's'}.`}*

${later(g, 'notes') ? `*Further entries. Whatever I take out of this forest is replaced overnight, to the same headcount: hares, fowl, things with teeth. Either it breeds faster than any ecology should, or it keeps a waiting list. Hypothesis: organised.*

*Yuki's review of this notebook, given unasked: too many words, no fish. Noted. Recommendation unchanged: let them all underestimate me.*` : `*Key finding, reported to me last time by a local, to my face, and now confirmed on a proper sample: nothing here can sense my cultivation. Whatever has looked at me in this forest has found none. I read as an empty vessel, every time. Hypothesis: the Ouroboros loop leaks nothing (no residue, no pressure, no smell of pills or grass), and residue is all their senses were built to find.*

*Practical consequence: everyone I meet will underestimate me. Recommendation: let them.*`}

${byForm(g, "Yuki, reading from your shoulder, reaches down and adds an entry of her own with one claw: a single scratch, which you decide means *agreed.*", "Yuki, reading over the top of your head, reaches round and adds an entry of her own with one claw: a single scratch, through that page and the next six, which you decide means *agreed.*", "Yuki, reading over your shoulder, takes the notebook and adds her own entry: a single stroke, which you decide means *agreed.*")}`,
        choices: [{ text: 'Close the notebook.', to: 'lf_hub' }],
    },

    lf_bored: {
        id: 'lf_bored', title: 'Entertainment', art: (g) => (yukiForm(g) === 'human' ? 'yuki_human' : yukiForm(g) === 'tiger' ? 'yuki_tiger' : 'clearing'), place: P,
        enter: (g) => { markDaily(g, 'lf_bored'); return visit(g, 'bored'); },
        text: (g) => `${yukiForm(g) === 'human' ? '"I am bored," Yuki announces from a root, chin in her hand, in the voice of a formal notice. "Do something."' : 'Yuki plants herself directly in front of you and stares. The bond carries one word, with no room for interpretation: *bored.*'}

${later(g, 'bored') ? `The bone mouse is finished as a genre. She has since seen through the bone beetle, the bone frog that hopped, and a bone fish you thought was rather good.

So you compete with yourself. Today's entry has six legs, two speeds and a trick of doubling back. She allows it one lap of the clearing, on principle, then takes it apart slowly, starting with the trick.

Your threads file the design under *prior art*.` : `You are, arguably, the most dangerous thing within a week's walk. You hold a doctorate. You can sing bone out of the air. None of it impresses a cat, in whichever shape the cat is wearing.

You try a bone mouse on a thread. She looks at it, then at you, with pity. You try a bone mouse that runs by itself, a small clockwork thing your Convergence works out on the spot. She lets it cross the clearing twice, ends it with one surgical swipe, and walks off with the pieces.

You have, it appears, invented a toy. Your threads file the design under *publishable*.`}`,
        choices: [{ text: 'Make her another one. Then three more.', do: (g) => { bumpRel(g, 'Yuki', 2, 0); return [yukiForm(g) === 'human' ? `You make her another one. She destroys it. You make more, each faster and cleverer than the last, and she destroys each of them with growing contentment and lines the pieces up on the root beside her like trophies. "Acceptable," she says, when she's done, not looking up. It is the nearest thing to a standing ovation she keeps.` : `You make her another one. She destroys it. You make more, each faster and cleverer than the last, and she destroys each of them with growing contentment and lines the pieces up on a root like trophies. Through the bond, when she's done: *acceptable.* It is the nearest thing to a standing ovation she keeps.`, ...awardXp(g, 'Convergence Use', 'standard')]; }, time: 30, to: 'lf_hub' }],
    },
    lf_bathe: {
        id: 'lf_bathe', title: 'The River', art: 'stream', place: `${P} — the river`,
        enter: (g) => { markDaily(g, 'lf_bathe'); return visit(g, 'bathe'); },
        text: (g) => `${later(g, 'bathe') ? `The same cold black river. The flat rock takes your coat without comment, and nothing in the water shows an interest. You wash and take inventory: two arms, two legs, one beard on which the forest holds views. The river hands back a man with fewer apologies in his shoulders.` : `Cold black water, a flat rock for your coat and, for once, nothing that wants to eat you. You scrub off a layer of forest you had stopped noticing. The body under it, you observe, is changing: leaner, harder, a fighter's body growing over a scholar's bones without asking leave.`}

${yukiForm(g) === 'cat' ? 'Yuki observes from the rock, with the horror of a cat watching a person enter water by choice.' : yukiForm(g) === 'tiger' ? 'Yuki, in her great form, wades in to the chest, establishes that she hates water at this size as well, and climbs out with immense dignity and most of the river, which she then shakes onto you.' : 'Yuki sits on the bank in her human form with her tail wrapped round her ankles. "No," she says, before you have asked her anything.'}`,
        choices: [{ text: 'Dry off. Back to camp.', do: (g) => advance(g, 30, { resting: true }), to: 'lf_hub' }],
    },
    lf_white_stag: {
        id: 'lf_white_stag', title: 'The White Stag', art: 'bone_elk', place: `${P} — a glade`,
        enter: (g) => { g.flags.lf_stag = true; return []; },
        text: `A stag as white as Yuki stands in a glade under a single shaft of sun, antlers like a winter tree, eyes the colour of old honey. It is not afraid of you. Everything else in this forest has either feared you or tried to eat you; the stag does neither.

It studies you, and takes its time over it. Then it turns its head toward the heart of the forest, toward the dead tree, as plainly as a guide pointing, and walks off between the trunks without hurrying.

Yuki says nothing at all. From her, that is the loudest thing she has ever said.`,
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
            sleepUntil(g, 6, { bed: false }); // v0.11.91 (owner pick S1): a season of sitting, not a bed: no wait for 21:00
            g.flags.lf_days = lfDays(g) + 1;
            eat(g, 40);
            const short = lines.filter((l) => !/^Yuki \(bond\)/.test(l)).slice(0, 4);
            return [...short, `Saturation +${Math.round(gain * 10) / 10}% (${g.james.saturation}%). A season's meals were eaten at some point, by someone: +40 satiety. HP and Qi full.`];
        },
        text: (g) => {
            const n = (g.flags.lf_seasons || 1) - 1;
            const seasons = [
                "You find a cave behind the cold falls, sit down in it, and let the season turn without you. Snow arrives at the cave mouth and leaves again. Your threads keep count of your heartbeats, then drop it as beneath them. Somewhere near the middle you notice you have been holding one breath for three days, and that nothing has come of it.",
                'Spring, this time: you can tell because the moss at the cave mouth goes green, then greener, then makes a start on your boots. Yuki brings you fish. Once, Yuki brings you a live fish, as a pointed remark on your level of participation.',
                "A summer of sitting. The waterfall roars until you stop hearing it, and under it you begin to hear the forest's roots, every one of them, a slow wooden murmur beneath everything else. When you come out, a family of foxes has moved into the back of the cave. They are very polite about it.",
                byForm(g, 'Autumn. Leaves blow in and bank up round you until you are a man-shaped hummock with a cat on top. Yuki has let it be known, through the bond, that she is bored, that she has been bored for weeks, and that she wants it entered in the record.', 'Autumn. Leaves blow in and bank up round you until you are a man-shaped hummock in the lee of a much larger white one. Yuki has let it be known, through the bond, that she is bored, that she has been bored for weeks, and that she wants it entered in the record.', 'Autumn. Leaves blow in and bank up round you until you are a man-shaped hummock with a woman leaning on it, picking leaves out of her tail. "I am bored," Yuki informs the hummock. "I have been bored for weeks. I want that entered in the record."'), // v0.11.175 (P8A, YF)
            ];
            return `${seasons[n % seasons.length]}

When you open your eyes the loop runs tighter, cleaner and deeper. What you have learned has gone down into you and set, as silt sets into stone.

${g.james.saturation >= 100 ? 'Saturation sits at the very top of you and presses. You could break through whenever you chose.' : ''}`;
        },
        choices: [{ text: 'Come out into the light.', to: 'lf_hub' }],
    },

    /* ---------- trials ---------- */
    lf_trials: {
        id: 'lf_trials', title: 'Going Deep', art: 'clearing', place: P,
        text: '',
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
        enter: (g) => visit(g, 'bone'), // v0.11.175 (P8A, RP)
        text: (g) => (later(g, 'bone') ? `The white sand lies raked smooth, by wind or by something tidy, and keeps no record of you. Under the great ribs the population is at full strength: your Convergence counts skeletons it has counted before, and one or two that haven't been told about you. All of them are listening to your boots.` : `Beyond the giant skulls the Bone Field keeps going down: a valley inside the valley, floored with white sand that was bone once, roofed in places by ribs like the vaults of a church with the lead stolen. Things live among the ribs. Your Convergence can feel each of their skeletons, which is either a tactical advantage or the most unsettling experience of your life.`),
        choices: [
            fightChoice('lf_bone_hounds', 'Take on the bone-hounds.'),
            fightChoice('lf_ossuary', 'Wake the Ossuary Wyrm.'),
            { text: 'Back to camp.', time: 60, to: 'lf_hub' },
        ],
    },
    lf_black_mire: {
        id: 'lf_black_mire', title: 'The Black Mire', art: 'lf_black_mire', place: `${P} — the Black Mire`,
        enter: (g) => visit(g, 'mire'), // v0.11.175 (P8A, RP)
        text: (g) => (later(g, 'mire') ? `The ink has closed over whatever you did here last. The ghost-gill stumps are occupied again, and a few of the logs turn, slowly, to keep you in view as you reach the bank. Logs, as a rule, don't.` : `The mire beyond the mire. Its water is the colour of ink and holds twice the opinions. Drowned trees stand in it like the masts of a sunk fleet. Whatever lives here is either hungry, or playing a log so that something else will come and be hungry nearby.`),
        choices: [
            fightChoice('lf_mire_brood', 'Clear the mire-brood from the ghost-gill stumps.'),
            fightChoice('lf_bog_mother', 'Call up the Bog-Mother.'),
            { text: 'Back to camp.', time: 60, to: 'lf_hub' },
        ],
    },
    lf_thunder_ridge: {
        id: 'lf_thunder_ridge', title: 'The Thunder Ridge', art: 'lf_thunder_ridge', place: `${P} — the Thunder Ridge`,
        enter: (g) => visit(g, 'ridge'), // v0.11.175 (P8A, RP)
        text: (g) => `${later(g, 'ridge') ? `The ridge again: black rock, and the afternoon storm stacking up on time, as if under contract. There is glass where you remember plain rock. The sky keeps its hand in.` : `A spine of black rock above the treeline, where it storms every afternoon whatever the weather is doing elsewhere. Where the lightning lands, the rock has run to glass. The sky up here is in the habit of hitting things.`}

${g.james.realm >= 1 ? 'As you step onto the ridge the storm overhead falters. You get the clear impression that it knows you, and has decided not to meet your eye.' : 'The storm overhead crackles at you, by way of a test. It finds nothing to test, and sulks.'}`,
        choices: [
            fightChoice('lf_storm_hawks', 'Take on the storm-hawks.'),
            fightChoice('lf_thunder_ram', 'Challenge the Thunder-horn ram.'),
            { text: 'Stand at the summit in the storm and see what the lightning does.', show: daily('lf_storm'), do: (g) => { markDaily(g, 'lf_storm'); return []; }, time: 60, to: 'lf_storm' },
            { text: 'Back to camp.', time: 90, to: 'lf_hub' },
        ],
    },
    lf_storm: {
        id: 'lf_storm', title: 'Lightning', art: 'tribulation', place: `${P} — the Thunder Ridge summit`,
        enter: (g) => visit(g, 'storm'), // v0.11.175 (P8A, RP)
        text: (g) => (later(g, 'storm') ? `You take the top rock again, arms out, like a man in a parable who hasn't reached the moral.

The bolt arrives on schedule, white and sure of itself, and brakes a foot above your scalp. It goes down its checklist. You know the items by now, and could prompt it; the answers have not changed either. *Pills? Grass? Cores? No. As before.*

It withdraws upward. The cloud mutters over it, like a colleague saying *told you*.

${byForm(g, 'Yuki, under her rock, sends one thought: *still a show-off.*', 'Yuki, behind a boulder that covers her as far as the shoulders, sends one thought: *still a show-off.*', 'Yuki, under the overhang, doesn\'t look up from her fingernails. "Still a show-off."')}` : `You stand on the highest rock with your arms out, like the idiot in a parable, and wait for the lightning.

It comes. Naturally it comes; this is the Thunder Ridge. A bolt as thick as your arm drops out of the cloud, sizzling, enormous, aimed at the exact crown of your head.

It stops a foot short and hangs there crackling, like something seized by the collar. You can all but hear it going down its list. *Impure? No. Corrupt? No. Pill-eater? No. Herb-eater? Grass? Cores? No, no, no.*

It goes back up. A little sideways. Embarrassed.

You stay as you are a minute longer, arms still out. ${byForm(g, 'From under a rock, Yuki sends one thought: *show-off.*', 'From behind a boulder that hides perhaps half of her, Yuki sends one thought: *show-off.*', 'From the dry side of an overhang, Yuki says it aloud: "Show-off."')}`),
        choices: [{ text: 'Climb down before the sky changes its mind.', do: (g) => awardXp(g, 'GU', 'challenging'), time: 30, to: 'lf_thunder_ridge' }],
    },
    lf_old_roots: {
        id: 'lf_old_roots', title: 'The Old Roots', art: 'lf_old_roots', place: `${P} — the Old Roots`,
        enter: (g) => visit(g, 'roots'), // v0.11.175 (P8A, RP)
        text: (g) => (later(g, 'roots') ? `The white roots lie as you left them, every one pointing at the dead tree. Put a palm to the nearest and it is still there under the silence, no louder and no fainter: a tune somebody has stopped humming.

The grey shapes keep their places along the white, holding very still. They have had practice at being left behind.` : `Deeper in than the Hollow the white roots come up out of the earth, thick as houses, and lie across the forest like the fallen pillars of a temple. Every one of them runs the same way: toward the dead tree. Lay a hand on one and your Convergence hears something beneath the silence. Not a song. The memory of one.

Things live in them. Things made out of what the tree left behind.`),
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
            // v0.11.177 (P9A, P8; review T22): the one grave fight keeps a grave ending, on any win
            if (name === 'The Heartless') return `It is done. Among the white roots nothing moves, and you find you have no remark ready, which is rare enough to note.

Tomorrow the Heartless will be on its feet here again. It is made of what the dead tree left behind, and that does not run out.

${byForm(g, 'Yuki does not wash. She sits against your ankle, looking toward the dead tree, and the bond carries nothing at all.', 'Yuki does not wash. She stands with her shoulder against your hip, looking toward the dead tree, and the bond carries nothing at all.', 'Yuki leaves her sleeves as they are. She stands close at your side, looking toward the dead tree, and offers no opinion.')}`;
            if ((g.flags.lf_trials_won || 0) >= 2) return `Done. You count your limbs, a habit this forest taught you early. The count comes out right again.

The ${name.toLowerCase().startsWith('the ') ? name.slice(4) : name} will be back tomorrow, or something filling the same post; the Long Forest leaves no vacancy open.

${byForm(g, 'Yuki cleans one ear. Her verdict, through the bond: *faster than last time. Still slower than me.*', 'Yuki yawns, a display of ivory nobody asked for. Her verdict, through the bond: *faster than last time. Still slower than me.*', 'Yuki smooths one long side lock flat between two fingers. "Faster than last time," she says. "Still slower than me."')}`; // v0.11.175 (P8A, RP): the second win on
            return `It's over. You stand in what is left of it breathing hard, and breathing at all is a thing you have learned not to take for granted.

The ${name.toLowerCase().startsWith('the ') ? name.slice(4) : name} won't be the last thing out here to take you for food. But each time, a little less of you agrees with it.

${byForm(g, 'Yuki washes a paw, inspects it, and washes it again. Her finding is that the fight was adequate.', 'Yuki washes one enormous paw, inspects it, and washes it again. Her finding is that the fight was adequate.', 'Yuki straightens one sleeve, inspects it, and straightens it again. "Adequate," she says, of the fight.')}`;
        },
        choices: [{ text: 'Back to camp.', time: 60, to: 'lf_hub' }],
    },
    lf_trial_lost: {
        id: 'lf_trial_lost', title: 'Retreat', art: 'forest_night', place: P,
        enter: (g) => { markDaily(g, g.flags.lf_last); return visit(g, 'trial_lost'); },
        text: (g) => (later(g, 'trial_lost') ? `You lose again. The exit is practised by now: through the ferns, over the fallen trunk, a large indignant noise close behind and then, abruptly, heading elsewhere. That is Yuki, showing it the scenic route.

The Long Forest marks hard and lets you resit. Nobody keeps the scores but you.` : `You lose. It happens. You end up going through the undergrowth at speed with something very large and very offended coming through it behind you, and you get away chiefly because Yuki leads it the long way round, by a thorn thicket, while you limp home.

There is no shame in it. Losing is what the Long Forest is for.`),
        choices: [{ text: 'Limp back to camp and sleep it off.', do: (g) => { g.james.hp = Math.max(1, Math.ceil(g.james.hp)); return []; }, to: 'lf_morning' }],
    },

    /* ---------- wandering humans ---------- */
    lf_wanderers: {
        id: 'lf_wanderers', title: 'Company', art: lfTrailArt, place: `${P} — a game trail`,
        enter: (g) => { markDaily(g, 'lf_wander'); g.flags.lf_human = d6(g) <= 3 ? 'lf_bandits' : 'lf_rogue'; g.flags.lf_last = g.flags.lf_human; return visit(g, g.flags.lf_human); }, // v0.11.175 (P8A, RP): met before: lf_seen_lf_bandits, lf_seen_lf_rogue
        text: (g) => (later(g, g.flags.lf_human) ? (g.flags.lf_human === 'lf_bandits' ? `The same two men step onto the same stretch of trail, and all three of you take a second over it. Scarred Tan recovers first.

"You," he says. "The mortal in the robe." Whatever happened last time has been gone over at home, and has come out as a version in which the Tan brothers did well. "The toll has gone up. For repeat travellers."

Little Tan asks whether the uncle is still cooking, and is looked at. Neither of them feels a thing on you.` : `Faded crimson, a jade knife, another clearing: the poacher has moved his business and not improved it. He spins round, sees who it is, and relaxes.

His senses go over you again. Nothing. Whatever passed between you before, he has explained it to himself since, and the explanation did not require you to be anything.

"The mortal again," he says. "Heaven sends a man the same insect twice only when it means him to step on it."`) : g.flags.lf_human === 'lf_bandits'
            ? `Two men step onto the trail ahead of you: one broad and scarred, one narrow and twitchy, each with the sort of knife that is mainly for being seen. Brothers, going by the faces. Bandits, going by everything else.

"Tan," says the scarred one, by way of introduction. "The Tan brothers. You will have heard of us." The narrow one asks whether the uncle cooks, since he looks to him like a man who feeds people, and is looked at until he stops.

You have not heard of them, you tell him; you have been in a forest. It turns out to be the wrong answer.`
            : `A young man in faded crimson kneels in a clearing, cutting Ninefold grass with a jade knife, very fast, with glances over his shoulder. Sect robes, and the lotus picked off the sleeve. A poacher, then, on ground the Crimson Lotus calls its own.

He sees you. He takes in the white coat, ${byForm(g, 'the cat', 'the white beast with no more Qi on it than a house cat', 'the silent woman in black silk')}, and the complete absence of anything on the Qi senses he is so proud of. His shoulders come down. His smile comes up.

"Oh, good," he says. "Only a mortal."`),
        choices: [
            { text: 'Let them make their speech. Then answer it.', combat: (g) => fight(g.flags.lf_human)(g), to: 'lf_human_won' },
            { text: 'Talk your way past them. You\'re very good at being underestimated.', check: { skill: 'GU', dc: 5 }, to: 'lf_human_talked', fail: 'lf_human_talked' },
            { text: 'Walk the other way. Not every fool needs a lesson today.', time: 30, to: 'lf_hub' },
        ],
    },
    lf_human_talked: {
        id: 'lf_human_talked', title: 'Words', art: lfTrailArt, place: `${P} — a game trail`,
        text: (g) => (later(g, g.flags.lf_human) ? (g.flags.lf_human === 'lf_bandits' ? `You ask how the toll is accounted for: by seniority or by need, and who keeps the ledger? You start drawing up a table. Scarred Tan says there is no ledger. Little Tan says there ought to be. They are still arguing as you walk on between them.` : `You tell him, low, that you came to warn him. An inspector of the Crimson Lotus is two clearings back, counting cut stems, and asked whether you had seen a man in faded red. You said no. You are a poor liar, you add, and he noticed.

The poacher is gone before you finish. He remembers to take the knife. The grass stays.`) : g.flags.lf_human === 'lf_bandits'
            ? `You explain, at length and with the full technical apparatus, the reproductive cycle of the bracket fungus on the log beside them. By the third minute their eyes have glazed. By the fifth, Little Tan is asleep on his feet. Scarred Tan pays *you* a copper to stop, which you accept on behalf of mycology everywhere, and they go.`
            : `You inform him, gravely, that he is cutting the wrong grass: a toxic look-alike, fatal inside the month. You are a travelling herb-doctor, you add, and have watched it kill a dozen men. You describe the symptoms, inventing them as you go, and each sentence is worse than the one before.

He drops the knife. He runs. He leaves the grass. Yuki watches him out of sight with deep satisfaction.`),
        enter: (g) => { if (g.flags.lf_human === 'lf_rogue') addItem(g, 'spirit_grass', 2); return g.flags.lf_human === 'lf_rogue' ? ['+2 Ninefold spirit grass (left behind at a dead run).'] : []; },
        choices: [{ text: 'Back to camp.', time: 30, to: 'lf_hub' }],
    },
    lf_human_won: {
        id: 'lf_human_won', title: 'Lesson', art: lfTrailArt, place: `${P} — a game trail`,
        enter: (g) => { const f = FIGHTS[g.flags.lf_last]; return f ? f.loot(g) : []; },
        text: (g) => (later(g, g.flags.lf_last) ? (g.flags.lf_last === 'lf_bandits' ? `It ends, give or take a bruise, with both brothers in the leaf litter, alive and wheezing, Little Tan holding his elbow like an heirloom.

You don't kill them. You pick up the jerky; between acquaintances, it seems only fair.

"This changes nothing," Scarred Tan tells the ground. "The Tan family does not forget."

"Good," you say. "Then next time bring better jerky."

Little Tan asks what is wrong with the jerky. You tell him, in detail. He hears it out.` : `Fang Wei goes down hard and takes it harder, because he knew your face and had made ready for it. He lies pinned by a bone needle at each sleeve, Qi sputtering, and glares at the needles, which he holds responsible.

You don't kill him. You collect the poached grass, as evidence.

"A mortal," he says. "The *same* mortal. There is a treasure on you. A talisman. Some senior's protection." He is very nearly pleading. "Tell me there is a talisman."

"There's a talisman," you say.

He shuts his eyes in relief. It is the kindest thing you will do all day, and it isn't even true.`) : g.flags.lf_last === 'lf_bandits'
            ? `It is harder than it ought to be, and messier, and somewhere in it Little Tan puts a knife through your coat that will cost you an evening with a bone needle. But it ends with both brothers in the leaf litter, alive, breathing, and each holding some part of himself with great care.

You don't kill them. You never do. You only see to it that for the next month, whenever either of them closes a hand on a knife, his wrist will bring today up.

"We'll remember this," Scarred Tan wheezes.

"I'd hope so," you say. "Otherwise what was the point."`
            : `Fang Wei is better than he looked and worse than he believed. It ends with him flat on his back, his Qi guttering like a wet candle, a bone needle through each sleeve pinning him to the turf, and you standing over him getting your breath back.

You don't kill him. You never do. You take the herbs he poached, as evidence, and leave him the dignity of working his own sleeves loose.

He had come past your camp before he came on you, he says, to nobody, and heard the music from your sleeve, low and strange and sad, and had judged that a man who kept songs that soft could not be dangerous.

"Who *are* you?" he croaks.

"Lost," you say, which remains technically true.`),
        choices: [{ text: 'Back to camp.', time: 60, to: 'lf_hub' }],
    },
    lf_human_lost: {
        id: 'lf_human_lost', title: 'Robbed', art: lfTrailArt, place: `${P} — a game trail`,
        enter: (g) => { const id = ['hare_raw', 'fowl_raw', 'venison', 'honeycomb', 'jade_bracket', 'river_cress'].find((k) => g.inventory[k] > 0); if (id) addItem(g, id, -1); return id ? ['A share of your food changes owners.'] : []; },
        text: (g) => `${later(g, g.flags.lf_last) ? `You lose, and to a face that knows yours, which is worse. Your pockets are gone through with the ease of old acquaintance; what food is found is taken, and the hammerspace is missed. The laughter about the mortal in white follows you down into the leaf litter.` : `You lose, and that stings worse than the bruises. What food can be found in your pockets is taken (the hammerspace nobody here knows about, and you are not going to enlighten anyone), and you are left lying on the trail, to the sound of laughter about the mortal in white.`}

${byForm(g, "Yuki sits on your chest until you move. Through the bond: *we are coming back here. Later. Bigger.*", "Yuki plants one forepaw on your sternum, which is plenty, until you move. Through the bond: *we are coming back here. Later. Bigger.*", "Yuki sits beside you until you get up. \"We are coming back here,\" she says. \"Later. Bigger.\"")}`,
        choices: [{ text: 'Get up. Go home. Train.', do: (g) => { g.james.hp = Math.max(1, g.james.hp); return []; }, time: 60, to: 'lf_hub' }],
    },

    /* ---------- Yuki's forms ---------- */
    yuki_tiger_awaken: {
        id: 'yuki_tiger_awaken', title: 'The Great Form', art: 'yuki_tiger', place: (g) => g.location || P,
        enter: (g) => { g.flags.yuki_tiger_seen = true; return []; },
        text: `You are looking straight at her when it happens, and that is the only reason you believe it.

Yuki gets up from the warm spot she has been occupying and stretches: forelegs, then hind legs, the whole rite. Then she goes on stretching. Her spine draws out. Her shoulders spread. The bond widens with her, like a river taking in the rain, and through it you feel her grow from the inside: bone lengthening, muscle laying itself on, her meridians matching your core channel for channel, as they have matched everything of yours since the day you were both born.

When it stops, the cat in front of you is the size of a Bengal tiger. White, to the last hair. Her eyes, gold and unhurried, are now at the height of your breastbone. Each paw would cover a dinner plate, and the claws sliding in and out of them are hooks of bone.

She looks at you. She looks down at herself. She sits, folds an enormous tail round enormous feet, and reports through the bond, perfectly calm:

*Finally. I have been small for long enough.*

Then she is eleven pounds again, in the space of one breath. She climbs your coat, takes her place on your shoulder, and adds: *I can do both. Whenever I like. Don't make it weird.*`,
        choices: [
            { text: '"I am absolutely going to make it weird."', do: (g) => { bumpRel(g, 'Yuki', 2, 0); return [`*I know,* she says, and sinks every claw she has into your shoulder, lightly, the way you'd underline a word. Then she settles, a small warm weight pretending she was never anything else, and starts to purr: a small sound with something very large behind it.`]; }, to: back },
            { text: 'Ask her to do it again. For science.', do: (g) => { g.yuki.form = 'tiger'; return ['Yuki: great root-kin form. Science is the excuse; looming over you is the purpose.']; }, to: back },
        ],
    },
    yuki_human_awaken: {
        id: 'yuki_human_awaken', title: 'Yuki', art: 'yuki_human', place: (g) => g.location || P,
        enter: (g) => { g.flags.yuki_human_seen = true; return []; },
        text: `The bond tells you before your eyes do: something in it opening, slow and deliberate, like a hand uncurling.

Yuki gets up from where she has been lying and walks toward you, and at every step there is less cat in the walk. She doesn't grow, exactly, or shrink. She *changes*: upright, two-footed, narrower. By the last step it is a slender woman who arrives, the top of her head no higher than your chin. Very long straight white hair falls past her waist; two pointed white ears stand up out of it and swivel your way; a long white tail moves behind her. The eyes are narrow, gold, slit-pupilled and beyond any mistaking hers. She has on a long black high-collared qipao piped in red, which the bond evidently judged suitable and consulted nobody about. Her feet are bare. She holds up her hands and turns them over, front and back, like someone checking a delivery against the order.

Then she looks at you and opens her mouth, and for the first time in your life you hear your root-kin's voice. It is low and dry, and exactly the voice you would have guessed.

"You," says Yuki, "are going to be insufferable about this."

You open your mouth.

"You are already being insufferable about this," she says. "With your face. From this height I get all of it at once. It is worse than I thought."`,
        choices: [
            { text: '"Hello, Yuki."', do: (g) => { bumpRel(g, 'Yuki', 5, 0); return []; }, to: 'yuki_human_after' },
            { text: '"Can you still do the cat thing?"', to: 'yuki_human_after' },
        ],
    },
    yuki_human_after: {
        id: 'yuki_human_after', title: 'Yuki', art: 'yuki_human', place: (g) => g.location || P,
        text: `"Hello," she says. Something in her face eases, by very little, for roughly a second; then she has it in hand again.

She can still do the cat thing, and shows you. One breath, and a small white cat is sitting where she stood, and of the qipao there is not a thread; another, and she is tall again, qipao and all, down to the last knot button, looking smug. Then the great form, which leaves the two of you rather less room than before, yawning, so that you may count her teeth.

"Three shapes," she says, back in the human one. "One of me. I shall wear whichever is useful." She thinks it over. "The small one is best for sleeping on you. I'll keep that one most of the time."

"Of course you will."

"People say stupid things in front of cats," she adds. "It is very informative. So I will choose who hears me answer back, and when. Promise you won't make an occasion of it."`,
        choices: [
            { text: 'Promise.', do: (g) => { g.yuki.form = 'cat'; return ['Yuki: small again, on your shoulder, washing an ear. The matter is closed.']; }, to: back },
            { text: 'Ask her to stay like this for a while.', do: (g) => { g.yuki.form = 'human'; return ['Yuki: human form. For once she is next to you and not on you. It is new.']; }, to: back },
        ],
    },
    yuki_form: {
        id: 'yuki_form', title: 'Yuki', art: 'yuki_form', place: (g) => g.location || P,
        text: (g) => `${{ cat: 'Yuki is in her small form: eleven pounds of white cat, laid along whichever part of you is giving off the most heat.', tiger: 'Yuki is in her great form: a great white root-kin, stretched out with her jaw laid on her forepaws and occupying, on principle, rather more ground than she needs.', human: 'Yuki is in her human form: the long white hair, the ears and tail, the black qipao. She sits hugging her shins, chin on her knees, watching you through narrow gold eyes.' }[yukiForm(g)]}

Through the bond, which is quicker than talk in any of her shapes: *which?*`,
        choices: [
            { text: 'Small. On your shoulder.', show: (g) => yukiForm(g) !== 'cat', do: (g) => { g.yuki.form = 'cat'; return ['Yuki: cat form.']; }, to: back },
            { text: 'The great form. Let her loom.', show: (g) => yukiForms(g).includes('tiger') && yukiForm(g) !== 'tiger', do: (g) => { g.yuki.form = 'tiger'; return ['Yuki: great root-kin form (hits much harder in a fight).']; }, to: back },
            { text: 'Human. Someone to talk to.', show: (g) => yukiForms(g).includes('human') && yukiForm(g) !== 'human', do: (g) => { g.yuki.form = 'human'; return ['Yuki: human form.']; }, to: back },
            { text: 'Leave her as she is.', to: back },
        ],
    },
};

export const BREAK_HUBS = ['lf_hub'];
