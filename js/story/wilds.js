/**
 * Days 2–3 in the Blackroot Wilds: a free loop of foraging, hunting, exploring and training, with a random
 * night (a fight or a quiet one) after nights 1 and 2. The jackals come on night 3, or the night James leaves.
 */
import { addItem, hasItem, eat, bumpRel, condense, sleepUntil, advance, clockParts, d6, awardYukiFightXp, awardXp, jamesHpMax, jamesQiMax, nightTo, nightRest } from '../core/game.js';
import { condensationSatGain } from '../core/formulas.js';
import { sitGain, yukiFightSkill, canFly } from '../core/game.js'; // v0.11.118 (YK1 review, SB); v0.11.131 (XB2, FY): canFly
import { set, day, hour, daily, markDaily, forestScale, grow, eatBest, pantry, foodCount, byForm, byDay, dayReply } from './common.js';

/* v0.11.136 (owner pick NC1, NT1's push 2): replies by day (js/core/lines.js dayReply): the first text is the old reply, the rest Fable's, one for each later day of a Coil. */
const DR_MAP = dayReply("night_event:0", [
    "Mapped: every light is bound for the dead tree, like blood still running to a heart that has quit.",
    "Mapped again: the same line, straight to the dead tree, as if the road had been worn there before the forest was.",
]);
const DR_LEANTO = dayReply("night_event:2", [
    "A ribbed white roof. Dry, smug, asleep.",
    "White ribs overhead, straighter than your last attempt. Rain drums on bone all night, like applause, and you sleep through it.",
]);
const DR_GIFT = dayReply("night_event:11", [
    "Yuki accepts the praise as simple fact.",
    "Yuki hears the praise out to the end, and lets it be understood that the wording could be longer.",
]);
const DR_HONEY = dayReply("wild_forage:2", [
    "The bees are still arguing about it.",
    "The bees hold an inquiry. You are gone before the findings.",
]);
const DR_HONEY_F = dayReply("wild_forage:2:f", [
    "Stung. A lot.",
    "The bees saw you coming. They had time to organise.",
]);
const DR_CRESS_F = dayReply("wild_forage:1:f", [
    "Leeches.",
    "Leeches, in numbers. They seem to regard the cress as theirs.",
]);
const DR_CRAB_F = dayReply("wild_hunt:2:f", [
    "It pinches back.",
    "The needle skates off the shell. The claw doesn't miss.",
]);
const DR_FEET_F = dayReply("wild_train:2:f", [
    "Scratched.",
    "She was already where you dodged to.",
]);
/* Part 9 (run C, item 10): the drills' failures get a line by day, like DR_FEET_F (Fable's). */
const DR_DARTS_F = dayReply("wild_train:0:f", [
    "Your threads total up the throws and report, with tact, that the marks were never in danger. The undergrowth took losses.",
    "The marks have not moved overnight. The darts land as though they had. Yuki follows one into the ferns with her eyes and says nothing, at length.",
]);
const DR_BLADE_F = dayReply("wild_train:1:f", [
    "The blade arrives late, leaves early, and once comes out as a spoon. Yuki, who has views, shares only the short ones.",
    "Grow, cut, dissolve. Today it dissolves on the cut, and you finish the form holding a fistful of white dust and your dignity, in that order.",
]);
const DR_NEEDLE_F = dayReply("wild_train:3:f", [
    "A hundred needles, and the bark holds a hundred opinions on where the point was. Forty in the knuckle-width, if you are generous. Your threads are not.",
    "Sixty in the mark, by the threads' count, which is the only count on offer. The other forty have founded a colony in the next trunk.",
]);

/* v0.11.168 (owner pick P2A, SW): the silent work cards' successes get a line by day (Fable's); the gains stay as they were. */
const DR_RING = dayReply("wild_forage:0", ["The ring is sound to the stem. You cut from the outer edge and leave the middle to its work.", "The ring has closed the gaps you cut yesterday. You cut from the edge again, and wonder who is farming whom."]);
const DR_CRESS = dayReply("wild_forage:1", ["It tastes of pepper and cold water. The omnitool has no objections, and you get that in writing.", "Same shallows, colder water, quicker hands. You are out before your feet have finished complaining."]);
const DR_BERRIES = dayReply("wild_forage:3", ["The thorns collect a small fee in blood. The berries are worth it, barely.", "Today you pick with a bone needle for a hook. The thorns go unpaid."]);
const DR_HARE = dayReply("wild_hunt:0", ["Bone arrives before the bolt does. The glass plates stay dull, which is how you want them. Yuki, born starving, inspects the result.", "A shorter stalk today, and cleaner throwing. Yuki's tail stops ticking a full second before the reeds go quiet."]);
const DR_FOWL = dayReply("wild_hunt:1", ["The dart meets it at the top of its rise. It comes down far more gracefully than it went up.", "You lead it by a body length, and the bird flies into the dart unassisted. Ballistics, of a kind."]);
const DR_CRAB = dayReply("wild_hunt:2", ["The needle goes in at the joint and the shell lifts off like a lid. It was simpler than the crab made it look.", "You know where the joint is now. One needle, a quarter turn, and the crab is a recipe."]);
const DR_DARTS = dayReply("wild_train:0", ["Most of them land inside the marks. The ones that don't are at least in the right tree.", "Five paces back from yesterday's line, and the darts still find the marks. The trunks look tired of you."]);
const DR_BLADE = dayReply("wild_train:1", ["Grow, cut, dissolve. By the end the blade arrives when you ask and leaves when you are done.", "The blade comes out a finger longer than yesterday and goes without a crumb. Your wrist has stopped arguing."]);
const DR_FEET = dayReply("wild_train:2", ["She lands where you were. You are somewhere else, upright, and nearly as surprised as she is.", "You are gone before she leaves the ground. She changes the angle mid-air, and you are gone from there too."]);
const DR_NEEDLE = dayReply("wild_train:3", ["A hundred needles into one knuckle-width of bark. Call it ninety-one. Your threads are keeping the real count.", "A hundred, and the hole in the bark is no wider than the first needle made it. Ninety-seven, say the threads."]);

const P = 'Blackroot Wilds';
const didSay = (key, dr) => (g) => { markDaily(g, key); return [dr(g)]; }; // v0.11.168 (P2A, SW)
/** v0.11.71 (owner pick X1; owner 2026-11-07 21:31): from Coil 2 Explore is not once a day: another trip while it is before 16:00. */
export const replayExplore = (g) => ((g.coil && g.coil.n) || 1) >= 2;
const loot = (lines) => () => lines;

/* ---------- where the night goes ---------- */
export const nightNext = (g) => (g.flags.leave_forest || (g.flags.forest_day || 1) >= 3 ? 'night_attack' : 'night_event');

/* ---------- night encounters (grow with the forest days) ---------- */
const nightFight = (kind) => (g) => {
    const s = forestScale(g);
    const base = {
        crows: { intro: 'Three rot-crows come down out of the dark on a reek of old meat, making for your food and, after it, your eyes.', enemies: [1, 2, 3].map((i) => ({ name: `Rot-crow ${i}`, hp: 3, dc: 3, atk: 4, dmg: 2, prefersSmall: true, flies: true, thief: true })) }, // v0.11.113 (DA1, CS): the first landed hit takes a food item
        rats: { intro: 'Two mire-rats, big as hounds, heave out of the stream and come up the bank wet, teeth leading.', enemies: [{ name: 'Mire-rat', hp: 5, dc: 3, atk: 4, dmg: 3, prefersSmall: true }, { name: 'Mire-rat (scarred)', hp: 5, dc: 3, atk: 4, dmg: 3, prefersSmall: true }] },
        lizard: { intro: 'The thornback\'s ridge of spines comes up in one wave, rattling like a quiver being emptied.', enemies: [{ name: 'Thornback lizard', hp: 9, dc: 4, atk: 5, dmg: 4, dr: 1 }] },
    }[kind];
    return { id: kind, night: true, intro: base.intro, band: 'standard', enemies: base.enemies.map((e) => grow(e, s)), win: 'night_won', lose: 'night_lost', flee: kind === 'crows' ? null : 'night_fled' };
};

const NIGHT_EVENTS = ['lights', 'rain', 'crows', 'rats', 'lizard', 'gift'];
const ev = (k) => (g) => g.flags.night_ev === k;


export const WILDS = {
    night_event: {
        dayKey: (g) => `night_event:${g.flags.night_ev}`, // v0.11.135 (NT1, EV1)
        id: 'night_event', title: (g) => ({ lights: 'Lights', rain: 'Iron Rain', crows: 'Rot-crows', rats: 'Mire-rats', lizard: 'Thornback', gift: 'A Gift' }[g.flags.night_ev] || 'Night'), place: `${P} — the dry rise`,
        art: (g) => ({ lights: 'lights', rain: 'rain', crows: 'crows', rats: 'rats', lizard: 'lizard', gift: 'gift' }[g.flags.night_ev] || 'forest_night'),
        enter: (g) => {
            g.flags.long = true;
            let pick = NIGHT_EVENTS[d6(g) - 1];
            if (pick === g.flags.last_ev) pick = NIGHT_EVENTS[d6(g) - 1];
            g.flags.night_ev = pick;
            g.flags.last_ev = pick;
            return nightTo(g, 60); // v0.11.40 (N1): never back; v0.11.91: after the bed (from 21:00), at 01:00; v0.11.151 (WD1, LN): the slept line
        },
        text: (g) => ({
            lights: byDay(g, [`You wake for no reason at all, which in your experience is the worst reason.

Pale lights are moving between the black trunks, low over the ground. Fireflies are ruled out at once: wrong size, wrong speed, and no firefly ever looked this *decided*. They go in a loose line and all one way, toward the heart of the forest, where the dead tree stands.

${byForm(g, 'Yuki is awake on your chest, ears flat, not hissing.', 'Yuki is awake against your side, ears flat, not growling.', 'Yuki is awake beside you, ears flat, not speaking.')} Watching. Through the bond comes something that isn't a word. Closer to *grief*.`, `You wake all at once, with nothing to blame for it. You are beginning to know what that means here.

The lights are back between the trunks: pale, low, unhurried, strung out in their loose line and all bound the same way, toward the heart of the forest and the dead tree. Tonight you count them, because counting is what you do when you don't know what else to do. You count twice and get two totals, and you are not a man who miscounts.

${byForm(g, 'Yuki is sitting up on your chest, ears flat, silent.', 'Yuki is sitting up beside you, ears flat, silent.', 'Yuki is sitting up beside you, ears flat, saying nothing.')} She does not look at you. What comes through the bond is the same as before, only quieter, the way grief gets quieter without getting any smaller.`], `night_event:lights`),
            rain: byDay(g, [`Rain comes in the night, warm, with iron in the taste of it, and whatever it touches dries under a grey film. The fire spits and sulks.

Yuki lets you know, ${byForm(g, "through the bond and through her claws,", "through the bond and by shaking herself dry all over you,", "aloud and at some length, from under your lab coat,")} that the weather is your doing, and that she had expected better of you.`, `Rain again, warm and tasting of iron. By now you know the order of events: first the fire sulks, then the grey film creeps over everything you own, then the complaints begin.

Yuki ${byForm(g, "delivers them through the bond, with her claws for punctuation,", "delivers them through the bond, from as far under your lab coat as she fits, which is her head,", "delivers them aloud, from under your lab coat, in order of importance,")} and concludes that a competent human would have arranged a roof.`], `night_event:rain`),
            crows: byDay(g, [`Wings wake you, with a noise like wet cloth being torn in half. Three rot-crows have come down on the fallen trunk over your head, cat-sized, every one. They shed feathers by the clump, their eyes have clouded to milk, and the smell answers any question you had about the name *rot-crow*.

Your food has their whole attention. Then, after some thought, your eyes do.`, `Wings again, that wet tearing sound, and the smell arrives a moment before the birds do. Three rot-crows settle along the fallen trunk, shuffling for places like magistrates taking a bench. One of them is missing most of its tail and does not seem to feel the lack.

They look at your food. They look at you. They have the air of creditors come about a second payment, and willing to take it in eyes.`], `night_event:crows`),
            rats: byDay(g, [`A splash in the stream. Another, nearer. The reeds open, and two mire-rats heave out onto the bank, each as big as a dog, black and oiled with water, dragging tails like whips.

${byForm(g, "They've smelled the cat. They seem to think she's dinner.", "They've smelled the cat. They seem to think she's dinner, which means they haven't seen her yet.", "They've smelled a cat and found a woman. They seem to think she's dinner either way.")} Yuki finds this the best joke anyone has told her all week.`, `A splash, a pause, a second splash. You know the sound now. The reeds bend, and two mire-rats haul themselves onto the bank, black and streaming, big as dogs, and stand there working their noses at the dark.

${byForm(g, "They have smelled the cat again. Hope, in a rat, is a terrible thing.", "They have smelled the cat again. They follow the smell up, and further up, and stop.", "They have smelled a cat again, and found a woman with white ears and a tail looking back at them. It gives them a moment's thought, and no more.")} Yuki yawns, slowly, so that they can see all of it.`], `night_event:rats`),
            lizard: `You wake to three observations, in order. One: the ground under you is warm. Two: claws are scraping on rock, slowly, with weight behind them. Three: just past your boots, catching what little light the night has, there is an eye, gold and slit and as wide as your palm, and it has been making observations for longer than you have.

It belongs to a thornback lizard as long as a canoe, with a ridge of hollow spines down its back. The warm ground is its nest. You have pitched camp on its eggs.`,
            gift: byDay(g, [`Two things wake you: a weight on your chest, and fresh blood, near enough to smell.

${byForm(g, "Yuki is sitting on you, very upright, very pleased. On your sternum, laid out with ceremony, is a mire fowl — a fat, ugly, long-necked bird nearly as big as she is. She must have dragged it a hundred metres.\n\nThrough the bond: *you hunt like a tree. I am fixing it.*", "The weight is one of Yuki's paws. The rest of her sits beside you, very upright, very pleased. On your sternum, laid out with ceremony, is a mire fowl — a fat, ugly, long-necked bird, about one mouthful to her. She has carried it a hundred metres without eating it, and would like that noted.\n\nThrough the bond: *you hunt like a tree. I am fixing it.*", "Yuki is kneeling beside you, very upright, very pleased. On your sternum, laid out with ceremony, is a mire fowl — a fat, ugly, long-necked bird with its neck neatly wrung. There are feathers in her hair and not a mark on her dress.\n\n\"You hunt like a tree,\" she says. \"I am fixing it.\"")}`, `A weight on your chest and the smell of blood, again.

${byForm(g, "Yuki is sitting on your sternum with her tail wrapped round her feet. Tonight's offering is another mire fowl, laid out with its neck straight and its wings folded, a little bigger than the last. She has been keeping count.\n\nThrough the bond: *you still hunt like a tree. I am still fixing it.*", "The weight is a paw. Beside it, set down with care, is another mire fowl, neck straight, wings folded. Yuki's nose is an inch above it, and she is very obviously not eating it. She would like the restraint noted a second time.\n\nThrough the bond: *you still hunt like a tree. I am still fixing it.*", "Yuki is kneeling at your side with her hands folded in her lap. On your sternum lies another mire fowl, neck wrung, wings folded, as neat as a parcel. There is one feather behind her ear. She has decided that you will not mention it.\n\n\"You still hunt like a tree,\" she says. \"I am still fixing it.\"")}`], `night_event:gift`), // v0.11.126 (NQ1): by her form, Fable's
        }[g.flags.night_ev]),
        choices: [
            { text: 'Watch where the lights go. Let the threads map it.', show: ev('lights'), check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.saw_lights = true; return [DR_MAP(g)]; }, to: 'morning' },
            { text: 'Pull the blanket over your head. Not your business. Not tonight.', show: ev('lights'), to: 'morning' },
            { text: 'Sing a bone lean-to over the camp.', show: ev('rain'), qi: 2, check: { skill: 'Convergence Use', dc: 2 }, do: (g) => { return [DR_LEANTO(g)]; }, failDo: (g) => { g.james.hp -= 2; return ['The roof folds up before dawn. Wet, cold, −2 HP.']; }, to: 'morning' },
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'morning' }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
            { text: 'Get wet. Sleep anyway.', show: ev('rain'), to: 'morning' },
            { text: 'Fight them off.', show: ev('crows'), combat: nightFight('crows'), to: 'night_won' },
            { text: 'Throw them the scraps and keep your eyes.', show: ev('crows'), do: (g) => { const id = ['crimson_berry', 'river_cress', 'jade_bracket', 'crab_meat', 'hare_raw', 'fowl_raw'].find((k) => g.inventory[k] > 0); if (id) addItem(g, id, -1); return [id ? 'The crows take their cut of your food and go.' : 'You have nothing to throw. The crows wait, judge you poor, and leave.']; }, to: 'morning' },
            { text: 'Fight. Rats are just bad mice.', show: ev('rats'), combat: nightFight('rats'), to: 'night_won' },
            { text: (g) => byForm(g, 'Up the fallen trunk with Yuki and wait them out.', 'Up the fallen trunk behind Yuki and wait them out.', 'Up the fallen trunk with Yuki and wait them out.') /* v0.11.126 (NS1, TR): Fable's */, show: ev('rats'), check: { skill: 'GU', dc: 3 }, failDo: (g) => { g.james.hp -= 3; return ['The quicker one reaches your ankle first: −3 HP.']; }, to: 'morning' },
            { text: 'Fight it. You\'re hungry, and it\'s made of meat.', show: ev('lizard'), combat: nightFight('lizard'), to: 'night_won' },
            { text: 'Back away slowly and give it its nest.', show: ev('lizard'), check: { skill: 'GU', dc: 4 }, time: 20, fail: 'night_lizard_forced', to: 'morning' },
            { text: 'Pluck it, dress it, and tell her she\'s the best hunter in two worlds.', show: ev('gift'), do: (g) => { addItem(g, 'fowl_raw', 1); bumpRel(g, 'Yuki', 3, 0); return [`+1 Mire fowl (dressed). ${DR_GIFT(g)}`, ...awardYukiFightXp(g, 'standard')]; }, to: 'morning' },
        ],
    },
    night_lizard_forced: {
        id: 'night_lizard_forced', title: 'Thornback', art: 'lizard', place: `${P} — the dry rise`,
        text: (g) => `A dry branch cracks under your heel. The lizard hears a declaration.${byForm(g, '', " Yuki, who has crossed the whole rise without bending a grass stem, turns her head and looks at you. *Four hundred pounds,* says the bond. *Not a sound. Remarkable what one can do.*", '')}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fine. Fight.', combat: nightFight('lizard'), to: 'night_won' }],
    },
    night_won: {
        id: 'night_won', title: 'Quiet Again', art: (g) => ({ crows: 'crows', rats: 'rats', lizard: 'lizard' }[g.flags.night_ev] || 'forest_night'), place: `${P} — the dry rise`,
        enter: (g) => {
            g.flags.night_wins = (g.flags.night_wins || 0) + 1;
            if (g.flags.night_ev === 'crows') { addItem(g, 'crow_feather', 3); return ['+3 Rot-crow feathers. Even the crows left them.']; }
            if (g.flags.night_ev === 'rats') { addItem(g, 'hare_raw', 1); return ['Skinned and dressed, a mire-rat passes for meat: +1 (counts as hare; do not tell Yuki).']; }
            if (g.flags.night_ev === 'lizard') { addItem(g, 'lizard_egg', 3); addItem(g, 'lizard_spine', 4); addItem(g, 'beast_core', 1); return ['+3 Thornback eggs, +4 spines, +1 Murky beast core.']; }
            return [];
        },
        text: (g) => `${{
            crows: 'The trunk is carpeted in feathers. The last crow leaves on foot, and gets some way before it remembers it can fly.',
            rats: 'The stream takes one rat back. The other stays on the bank, having no further plans.',
            lizard: 'The thornback is down across its nest with every spine laid flat. Beneath it are the eggs: warm, leathery, each as big as your fist.',
        }[g.flags.night_ev] || 'It\'s over.'}

Yuki puts herself back in order as if the fight had been someone else's. You sit with your pulse hammering and note, clinically, that your hands now wait until *afterwards* to shake. What sleep is left will not be enough.`,
        choices: [{ text: 'Sleep.', to: 'morning' }],
    },
    night_lost: {
        id: 'night_lost', title: 'Bitten', art: 'forest_night', place: `${P} — the dry rise`,
        enter: (g) => { const id = ['hare_raw', 'fowl_raw', 'crab_meat', 'lizard_egg', 'jade_bracket'].find((k) => g.inventory[k] > 0); if (id) addItem(g, id, -1); return id ? ['Some of your food leaves with it.'] : []; },
        text: (g) => `You lose, and without any drama. You are simply on your back with an arm bleeding, while the winner collects what it came for and goes. ${byForm(g, 'Yuki sits on your chest', 'Yuki rests one paw on your chest', 'Yuki sits with her hand flat on your chest')} until your heartbeat slows, which is either comfort or her checking whether you're still edible.`,
        choices: [{ text: 'Sleep, badly.', do: (g) => { sleepUntil(g, 6); g.james.hp = Math.ceil(g.james.hp * 0.7); return ['A short night, and a sore one. HP partly back, Qi full.']; }, to: 'morning' }],
    },
    night_fled: {
        id: 'night_fled', title: 'Somewhere Else', art: 'forest_night', place: `${P} — further downstream`,
        text: (g) => `You snatch up what comes to hand and shift camp two hundred metres downstream in the dark, cursing under your breath at every step.${byForm(g, '', " Yuki walks behind with the blanket in her mouth, which keeps her from saying what she thinks of running from something she outweighs. The bond says it anyway.", '')}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; RB2 (BR): Fable's redraft after the review
        choices: [{ text: 'Sleep.', to: 'morning' }],
    },

    morning: {
        id: 'morning', title: (g) => `Day ${day(g)}`, art: 'forest_dawn', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 20) lines.push(nightRest(g)); // v0.11.92 (O1): half back after a night fight
            g.flags.forest_day = (g.flags.forest_day || 1) + 1;
            const out = eatBest(g);
            lines.push(out.length ? 'Breakfast. ' + out[0] : 'No breakfast. Your stomach enters it in the record.');
            return lines;
        },
        text: (g) => `${g.flags.forest_day === 2
            ? `The second morning. A red sun hauls itself up over the black trees, and you lie still and take stock: one Yuki, one omnitool, one lab coat that was white yesterday, one body that aches in places you could now label on a diagram. Alive, on the evidence.

You could go looking for the way out. Or you could face the data: you know nothing about this world, and this forest is the mildest teacher it is likely to offer. So learn it. Eat. Get stronger. *Then* walk out.`
            : `Day three in the Blackroot. You wake ahead of the light now. That is either adaptation or damage, and you decline to run the test that would tell you which.

This patch of forest is yours by now: the stream's tempers, the reeds where the hares lie up, the reek of the mire when the wind turns west. It has other tenants. For two nights something has circled the camp at a distance, and it has left tracks. Large. More than one set. In no hurry.

${g.flags.saw_lights ? 'And then the lights. Your mind keeps going back to the lights.' : 'Tonight, you suspect, the hurry arrives.'}`}`,
        choices: [{ text: 'Get up.', to: 'wilds' }],
    },

    wilds: {
        id: 'wilds', title: 'The Blackroot', art: 'stream', place: `${P} — the stream`,
        text: (g) => {
            const h = hour(g);
            const d2 = byDay(g, [0, 1], 'wilds'); // NT1 (Fable's draft): a second set of the times of day, and of the hungry and hurt lines
            const when = d2
                ? (h < 11 ? `Morning. The red light lies in bars across the stream, and the midges have already found you.` : h < 15 ? `Midday. The heat sits in the trees like a lid, and everything with wings is saying so.` : h < 18 ? `The shadows are stretching out, and the light is turning the colour of honey.` : `Dusk. The birds have stopped, which is the forest clearing its throat.`)
                : (h < 11 ? 'Morning light comes through the canopy in red bars.' : h < 15 ? 'The day is hot and still and loud with insects.' : h < 18 ? 'The light is going amber.' : 'Dusk. The forest is getting ready to be something else.');
            return `${when} ${g.james.satiety < 30 ? (d2 ? `You are hungry enough to have started assessing the moss.` : 'You are hungry enough that it\'s getting into your hands.') : ''}

${pantry(g)}

${g.james.hp < jamesHpMax(g) * 0.5 ? (d2 ? `You are hurt, and the rest of you would like a word about it. Lying down would be the intelligent choice. You are told you are intelligent.` : 'You are hurt. Resting would be smart. You have a doctorate; you can do smart.') : ''}`;
        },
        choices: [
            { text: 'Forage.', show: (g) => hour(g) < 19, time: 15, to: 'wild_forage' },
            { text: 'Hunt.', show: (g) => hour(g) < 19, time: 15, to: 'wild_hunt' },
            { text: 'Explore deeper into the forest (takes the afternoon).', show: (g) => hour(g) < 16 && (replayExplore(g) || daily('explore')(g)) && !(g.flags.v_bone && g.flags.v_mire && g.flags.v_hollow), time: 30, to: 'wild_explore' },
            { text: 'Train: darts, blade, footwork, and a very unwilling sparring partner.', show: (g) => hour(g) < 19, time: 10, to: 'wild_train' },
            { text: 'Cultivate: one sit, 10 Qi toward Saturation.', show: (g) => hour(g) < 20, req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'wilds' },
            { text: 'Rest in the shade for an hour.', show: (g) => hour(g) < 20, do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest. Your wind returns, with a little HP and Qi.']), to: 'wilds' },
            { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g), to: 'wilds' },
            { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['It tastes of wet stone and old dark. Your cuts knit shut as you chew.']; }, to: 'wilds' },
            { text: 'Make camp for the night.', show: (g) => hour(g) >= 15, time: 20, to: 'camp' },
            { text: 'Enough of the forest. Follow the stream out — today.', show: (g) => !g.flags.leave_forest && (g.flags.forest_day || 1) < 3 && hour(g) < 15, time: 240, do: set('leave_forest'), to: 'stream_out' },
        ],
    },
    stream_out: {
        id: 'stream_out', title: 'Downstream', art: 'stream', place: `${P} — far downstream`,
        text: `You go where the water goes. The trees draw apart, the stones grow, the stream raises its voice. Late in the afternoon the ridge shows ahead, and past it a grey thread that could be smoke, if you are owed any luck.

It will keep until morning. You are too tired to walk in on strangers after dark, and strangers seldom care for it either. You find a second dry rise and a second fallen trunk. Far back along the stream, something howls. Something else answers. Then a third voice joins.

They've followed you.`,
        choices: [{ text: 'Make camp. Quickly.', to: 'camp' }],
    },

    /* ---------- foraging ---------- */
    wild_forage: {
        id: 'wild_forage', title: 'Foraging', art: 'forage', place: `${P} — the banks`,
        text: (g) => `By now you know where this bank keeps its food. ${pantry(g)}`,
        choices: [
            { text: 'The mushroom ring under the black oaks.', show: daily('ring'), check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 50, do: (g) => { markDaily(g, 'ring'); addItem(g, 'jade_bracket', 3); return [`+3 Jade bracket fungus. ${DR_RING(g)}`]; }, failDo: (g) => { markDaily(g, 'ring'); addItem(g, 'jade_bracket', 1); g.james.hp -= 2; return ['One sound cap, and one that only looked it: +1 Jade bracket, −2 HP.']; }, to: 'wild_forage' },
            { text: 'River cress in the shallows.', show: daily('cress'), check: { skill: 'GU', dc: 2 }, time: 40, do: (g) => { markDaily(g, 'cress'); addItem(g, 'river_cress', 4); return [`+4 River cress. ${DR_CRESS(g)}`]; }, failDo: (g) => { markDaily(g, 'cress'); addItem(g, 'river_cress', 2); return [`${DR_CRESS_F(g)} +2 River cress anyway.`]; }, to: 'wild_forage' },
            { text: 'The honey tree Yuki found. A needle through the comb\'s stalk, from below.', show: daily('honey'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 45, do: (g) => { markDaily(g, 'honey'); addItem(g, 'honeycomb', 2); return [`+2 Wild honeycomb. ${DR_HONEY(g)}`]; }, failDo: (g) => { markDaily(g, 'honey'); addItem(g, 'honeycomb', 1); g.james.hp -= 3; return [`${DR_HONEY_F(g)} +1 Wild honeycomb, −3 HP.`]; }, to: 'wild_forage' },
            { text: 'Needleberries, if the bushes have any left.', show: daily('berries'), check: { skill: 'GU', dc: 2 }, xp: false, time: 20, do: (g) => { markDaily(g, 'berries'); addItem(g, 'crimson_berry', 5); return [`+5 Crimson needleberries. ${DR_BERRIES(g)}`]; }, failDo: (g) => { markDaily(g, 'berries'); return ['Birds got there first.']; }, to: 'wild_forage' },
            { text: 'Back to the stream.', to: 'wilds' },
        ],
    },

    /* ---------- hunting ---------- */
    wild_hunt: {
        id: 'wild_hunt', title: 'The Hunt', art: 'hunt', place: `${P} — the reeds`,
        text: '',
        choices: [
            { text: 'Glassback hare. A dart from cover.', show: daily('hare'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 50, do: (g) => { markDaily(g, 'hare'); addItem(g, 'hare_raw', 2); return [`+2 Glassback hare. ${DR_HARE(g)}`]; }, failDo: (g) => { markDaily(g, 'hare'); return ['A burst of rainbows. No hare.']; }, to: 'wild_hunt' },
            { text: 'Mire fowl. They fly badly but they fly — a dart on the rise.', show: daily('fowl'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4, bonus: (g) => (yukiFightSkill(g).level >= 2 ? 1 : 0) }, time: 60, do: (g) => { markDaily(g, 'fowl'); addItem(g, 'fowl_raw', 1); return [`+1 Mire fowl. ${DR_FOWL(g)}`]; }, failDo: (g) => { markDaily(g, 'fowl'); return ['It labours away over the reeds, honking remarks about you.']; }, to: 'wild_hunt' },
            { text: 'Stone-shell crab in the shallows. A needle into the joint of the shell.', show: daily('crab'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 40, do: (g) => { markDaily(g, 'crab'); addItem(g, 'crab_meat', 2); return [`+2 Stone-shell crab meat. ${DR_CRAB(g)}`]; }, failDo: (g) => { markDaily(g, 'crab'); g.james.hp -= 2; return [`${DR_CRAB_F(g)} −2 HP.`]; }, to: 'wild_hunt' },
            { text: 'Let Yuki hunt on her own and just watch.', show: daily('yukihunt'), time: 60, do: (g) => { markDaily(g, 'yukihunt'); const got = d6(g) >= 4; if (got) addItem(g, 'hare_raw', 1); return [got ? 'One rush, one hare. She carries it back past you, slowly, as a lesson. +1 Glassback hare.' : 'She misses, sits down, and studies the sky until the subject changes.', ...awardYukiFightXp(g, 'standard')]; }, to: 'wild_hunt' },
            { text: 'Back to the stream.', to: 'wilds' },
        ],
    },

    /* ---------- training ---------- */
    wild_train: {
        id: 'wild_train', title: 'Practice', art: 'clearing', place: `${P} — the clearing`,
        text: '',
        choices: [
            { text: 'Darts at marks on the trunks, from further and further away.', show: daily('t_darts'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 60, do: didSay('t_darts', DR_DARTS), failDo: didSay('t_darts', DR_DARTS_F), to: 'wild_train' },
            { text: 'Blade forms: grow it, move, dissolve it, again.', show: daily('t_blade'), qi: 3, check: { skill: 'GU', dc: 3 }, time: 60, do: didSay('t_blade', DR_BLADE), failDo: didSay('t_blade', DR_BLADE_F), to: 'wild_train' },
            { text: 'Footwork: let Yuki pounce at you from cover and try not to be there.', show: daily('t_feet'), check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { markDaily(g, 't_feet'); return [DR_FEET(g), ...awardYukiFightXp(g, 'standard')]; }, failDo: (g) => { markDaily(g, 't_feet'); g.james.hp -= 1; return [`${DR_FEET_F(g)} −1 HP.`, ...awardYukiFightXp(g, 'standard')]; }, to: 'wild_train' },
            { text: 'Needle drills: one point, one knuckle-width, a hundred times.', show: daily('t_needle'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 60, do: didSay('t_needle', DR_NEEDLE), failDo: didSay('t_needle', DR_NEEDLE_F), to: 'wild_train' },
            { text: 'Enough. Back to the stream.', to: 'wilds' },
        ],
    },

    /* ---------- exploring ---------- */
    wild_explore: {
        id: 'wild_explore', title: 'Deeper', art: 'clearing', place: P,
        enter: (g) => { markDaily(g, 'explore'); return []; },
        text: `Your threads have been drawing a map while you were busy. Every blank left on it carries the same label, in your own handwriting: *what is that*.`,
        choices: [
            { text: 'The Bone Field — the white you saw from the rise.', show: (g) => !g.flags.v_bone, time: 90, do: set('v_bone'), to: 'bone_field' },
            { text: 'The Mire — where the fowl come from and the smell goes to.', show: (g) => !g.flags.v_mire, time: 90, do: set('v_mire'), to: 'mire' },
            { text: 'The Hollow — the place your Convergence keeps leaning toward.', show: (g) => !g.flags.v_hollow, time: 120, do: set('v_hollow'), to: 'hollow' },
            { text: 'Never mind. Back to the stream.', to: 'wilds' },
        ],
    },
    bone_field: {
        id: 'bone_field', title: 'The Bone Field', art: 'bone_field', place: `${P} — the Bone Field`,
        text: `The valley is full of bones. It was never a battlefield; it is a graveyard, and the dead in it were *things*. Ribs stand like the frames of unbuilt houses. A skull sits half sunk in moss, with headroom inside for a tall man. One spine runs fifty metres, on vertebrae as big as cartwheels.

Your Convergence rings like a bell under a hammer. Bone is bone, and you can feel all of it, a whole valley, old and dry and *listening*. These were beasts, and somebody took their cores. Each skull has a hole drilled through the brow, as neat as a coin. This place was harvested, and long ago.

Yuki paces along a rib with her tail up, like a landlord on inspection. In some sense she may be one.`,
        choices: [
            { text: 'Put your hand on the great skull and sing to it.', show: (g) => !g.flags.bone_sung, qi: 3, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, do: (g) => { g.flags.bone_sung = true; return ['The skull hums back. For one breath you know it from the inside, how it grew and where it broke. Your darts will keep the lesson.']; }, failDo: (g) => [...set('bone_sung')(g), `The skull stays a skull. Your song goes into it and spreads out thin, a drop in a dry sea, and nothing hums back: there's too much of it, too old, and it has been listening to silence for too long to answer a stranger. You take your hand away. Yuki, up on her rib, has the decency not to look at you.`], to: 'bone_field' },
            { text: 'Grind a pouch of old bone into meal. Your stakes could use it.', show: (g) => !hasItem(g, 'bone_meal'), check: { skill: 'GU', dc: 2 }, time: 40, do: (g) => { addItem(g, 'bone_meal', 1); g.flags.stakes_hard = true; return ['+1 Giant\'s bone-meal. Your bone stakes will be harder from now on.']; }, to: 'bone_field' },
            { text: 'Walk back before the light goes.', time: 60, to: 'wilds' },
        ],
    },
    mire: {
        id: 'mire', title: 'The Mire', art: 'mire', place: `${P} — the Mire`,
        text: `Black water lies between grey hummocks, under a smell of eggs kept too long in a cellar, and the quiet over it feels *held*, like a breath. Mire fowl get up in ones and twos, resenting it. The mud wants your boots and argues the point at every step.

On the drowned stumps, here and there, grow pale gilled fungi that glow faintly, with the light of a thing half remembered. The omnitool flags them before you ask: unknown proteins, wound-healing, *very* interesting. Your new doctorate sits up and begs.

Under the water something moves. Then several more somethings.`,
        choices: [
            { text: 'Harvest the ghost-gills. Carefully. Properly.', show: (g) => !g.flags.gills, check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 45, do: (g) => { g.flags.gills = true; addItem(g, 'ghost_gill', 3); return [`You cut them at the base with a bone blade, leave the stalks to fruit again, and wrap each cap in moss the way you'd wrap a specimen worth your whole grant. Behind you the black water heaves once and settles. Yuki, on a hummock, does not take her eyes off it until you're done.`, '+3 Ghost-gill (chew one: +8 HP).']; }, failDo: (g) => { g.flags.gills = true; addItem(g, 'ghost_gill', 1); g.james.hp -= 2; return ['A slip, a few leeches, one cap saved. +1 Ghost-gill, −2 HP.']; }, to: 'mire' },
            { text: 'Wait for the somethings to come up. Then deal with them.', show: (g) => !g.flags.mire_fight, combat: (g) => ({ id: 'mire', intro: 'The black water splits, and the mire-rats are on you all at once.', band: 'standard', enemies: [{ name: 'Mire-rat', hp: 5, dc: 3, atk: 5, dmg: 3, prefersSmall: true }, { name: 'Mire-rat', hp: 5, dc: 3, atk: 5, dmg: 3, prefersSmall: true }, { name: 'Mire-rat (bloated)', hp: 7, dc: 3, atk: 5, dmg: 4 }].map((e) => grow(e, forestScale(g))), win: 'mire_won', lose: 'mire_lost', flee: 'wilds' }), to: 'mire_won' },
            { text: 'Wade back out while you still have both boots.', time: 60, to: 'wilds' },
        ],
    },
    mire_won: {
        id: 'mire_won', title: 'The Mire', art: 'mire', place: `${P} — the Mire`,
        enter: (g) => { g.flags.mire_fight = true; addItem(g, 'beast_core', 1); return ['+1 Murky beast core (one rat carried it: small and sour).']; },
        text: `The world has fewer rats in it. The mire's quiet closes over the place where they were, unimpressed.`,
        choices: [{ text: 'Back to the hummocks.', to: 'mire' }],
    },
    mire_lost: {
        id: 'mire_lost', title: 'The Mire', art: 'mire', place: `${P} — the Mire`,
        enter: (g) => { g.flags.mire_fight = true; return []; },
        text: (g) => `${canFly(g) ? "You leave straight up, with a bitten calf, a boot full of black water and the strong impression that the mire won that round on points. The boot drips on it from ten metres. As replies go, it isn't one." : "You retreat with a bitten calf, a boot full of black water and the strong impression that the mire won that round on points."}${byForm(g, '', " Yuki rises beside you, black to the shoulder, having learnt that the mire holds a tiger's weight a great deal better than it holds a cat's, and lets go of it a great deal more slowly. *We do not speak of this,* says the bond.", '')}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; v0.11.131 (XB2, FY; Fable's MAINs): by flight
        choices: [{ text: 'Limp back to the stream.', time: 60, to: 'wilds' }],
    },
    hollow: {
        id: 'hollow', title: 'The Hollow', art: 'hollow', place: `${P} — the Hollow`,
        text: (g) => `The ground falls away into a bowl, and roots fill the bowl. Roots, though not a tree's, or not *only* a tree's: each as thick as a man, grey-white, smooth as old bone. They leave the earth on one side and go back into it on the other, and all of them lie the same way: toward the heart of the forest. Toward the dead tree.

You lay your hand on one, and your Convergence *sings*.

The note is faint, and it is sad, and you know it. Your people's Hearth Trees sing this one; you grew up inside it, as inside a tune your mother hummed about the house. It is here, under a poisoned sky, on a world that has never heard of you.

${g.flags.saw_lights ? 'The lights you watched in the night came through here. Their trails still show, faintly: the moss is greener where they passed.' : 'Yuki sits down without a sound, which is not like her.'}`,
        choices: [
            { text: 'Sit among the roots and cultivate. Let the song in.', show: (g) => !g.flags.hollow_sit, check: { skill: 'Convergence Use', dc: 3 }, noFam: true /* v0.11.141 (RW1, NF): cultivation or rest by its own rule */, time: 60, do: (g) => { g.flags.hollow_sit = true; const gain = sitGain(g, 2); g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10); return [`Your Qi runs out along the roots and comes home clean, a breath held and let go. Saturation +${Math.round(gain * 10) / 10}% (${g.james.saturation}%), no Qi spent.`]; }, failDo: (g) => [...set('hollow_sit')(g), `You sit. You open the loop. The song comes in and your Qi reaches for it like a hand for a hand, and misses: the note is too old, too slow, pitched for something far bigger than you. When you finally stand up you have nothing but pins and needles and the sense that the roots were patient with you, the way you'd be patient with a child.`], to: 'hollow' },
            { text: 'Follow one root as far as you dare.', show: (g) => !g.flags.roots, check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { g.flags.roots = true; return ['Two kilometres on, the root is warm to the touch. Whatever lies at its far end is not wholly dead.']; }, failDo: (g) => { g.flags.roots = true; return ['The trees crowd in until you turn back, uneasily sure that you were allowed to.']; }, to: 'hollow' },
            { text: 'Go back. You\'ll come back here. You know you will.', time: 60, to: 'wilds' },
        ],
    },
};
