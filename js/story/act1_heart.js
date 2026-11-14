/**
 * Act 1, Part 3 — The Heart (Days 16–18). Inside the dead Hearth Tree: the seed-ship of James's people, the record of
 * how the Old Tree lived and how the Crimson Lotus killed it, the guardian at its heart, and a living seed-sliver.
 * Entry 'ht_start' (Day 16). Exit 'rt_start' (Day 19, dawn).
 */
import { addItem, hasItem, condense, advance, jamesHpMax, d6 } from '../core/game.js';
import { eatBest, pantry, foodCount, set, byForm, byDay, dayReply } from './common.js';
import { byDayLast } from '../core/lines.js'; // v0.11.154 (owner pick RV1, Fable's review, L2 CL)
import { day, hour, encounter, rel, likesMei, likesYa, trio, trioStep, bumpRel, sleepUntil, logTrio, ykShape } from './act1_common.js';
import { ykPath } from './yuki_path.js';

/* v0.11.136 (owner pick NC1, NT1's push 2): replies by day (js/core/lines.js dayReply): the first text is the old reply, the rest Fable's, one for each later day of a Coil. */
/** v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the hall's time of day by the day there, five days (ST5): [night, morning, midday, evening]. */
const HALL_WHEN = [['Night. The shafts have gone out, and the hall is ten paces of firelit floor and a rumour of wall.', 'Morning. Light slides down the cracks like water let down a well.', 'Midday. The grey shafts have bleached almost to white, and the dust in them hardly moves.', 'Evening. High in the cracks the light is turning red, one crack after another.'],
    [`Night. The fire lights the same ten paces of floor as it did before, and you find that you know them.`, `The light comes down the cracks in the same order as yesterday, one side of the hall and then the other, like someone opening shutters.`, `Midday. The white shafts stand in the hall like pillars, and Mei Lin walks round them, not through.`, `Evening. The red in the cracks climbs the wall a hand at a time, and then lets go.`],
    [`Night. The hall has shrunk to the fire again, and the fire has acquired a woodpile, a drying line and settled views on who sits where.`, `Grey light, then the dust in it, then the far wall: the hall puts itself back together each morning, and always in that order.`, `Midday. For a quarter of an hour the tallest white shaft reaches the floor, and somebody has scratched a mark in the dust where it lands.`, `Evening. The cracks go red and the dust goes gold, and nobody remarks on it any more.`],
    [`Night. You crossed the hall in the dark just now without putting a hand out, and only noticed afterwards.`, `Morning comes down the cracks late and thin, like a guest who knows the house.`, `Midday. The white shaft lands a finger's width past the scratched mark; the year is turning, even in here.`, `Evening. The red light picks out the paths you have all worn in the dust, and shows how few places any of you go.`],
    [`Night. The fire, the dark, the long way up: by now the hall is only large when you think about it.`, `The light slides down the cracks as it did on the first morning, and the difference is in you: you know where it will land.`, `Midday. The shafts have gone white on schedule, and the hall is as bright as it ever gets, which you now know is not very.`, `Evening. The cracks are going red for the fifth time, and you catch yourself counting the evenings you have left.`]];
const DR_HC_MEI = dayReply("heart_camp:1", [
    "She tells you the songs about the Old Tree her grandmother sang. Some of the words are your words, worn smooth by four hundred years of people who didn't know what they meant.",
    "Tonight it is the planting songs, the ones Ashfall sings over the barley in spring. She gives you the words flat, without the tune, like a recipe. Halfway through one you could finish the line for her. You don't, and she sees you not doing it.",
    "She asks for one of yours, for a change. You give her a cradle song, quietly, the way it was given to you. She listens with her head down, like a woman going over accounts, and at the end she says her grandmother had the second verse wrong, and that she means to keep it wrong.",
    "Tonight neither of you sings. She asks instead what the worn words meant, and you go through them one at a time: root, keep, morning, home. She says each of them once after you, carefully, the way she would take down a debt. Then she says that Ashfall has been singing a letter all this time without knowing who it was addressed to, and looks into the fire as if it might have the name.", // v0.11.152 (RP1, RM6; Fable's): the 4th night
]);
const DR_HC_YA = dayReply("heart_camp:2", [
    "She gives you the very edge of the ledge, and laughs when you hold on to it. Then, with great seriousness, she tells you how many days she tracked you through the forest before she decided you were interesting. All of them, it turns out. Your fire settled it, she says: a man who gives Yuki the best piece is not as cold as he talks.",
    (g) => `She has saved you the worst part of the ledge, and says so. Then she tells you, gravely, what each sound in the hall is: bark settling, ${g.flags.ship_found ? 'the ship' : 'water somewhere under the roots'}, Mei Lin pretending to be asleep. She has been listening to all of it so that nobody else would have to. She doesn't say that part. She leans on you instead, hard, as if testing a branch.`, // RV2 (M1, Fable's review): the ship only once it is found
    // v0.11.152 (RP1, RM6; Fable's): the 3rd and 4th nights
    "She moves over for you tonight, a hand's width, which from Ya is a deed of land. She points out the places in the dark where she would set a snare, if the dark had anything in it, and then the place where she would put you, which is here. She appears to have given it thought.",
    "Tonight she takes the edge herself and has you hold her by the wrist, in case, she says, though you have seen her sleep in a tree. For a long time she says nothing, which with Ya is the loudest thing she does. Then she tells you she has decided the tree is not a bad den. It is the highest thing you have heard her say about indoors.",
]);
const DR_HC_LOG = dayReply("heart_camp:3", [
    (g) => byForm(g, "You play the first part again, just Wren's voice, just the planting. Yuki purrs against your chest the whole way through.", "You play the first part again, just Wren's voice, just the planting. Yuki purrs with her head on your chest the whole way through.", "You play the first part again, just Wren's voice, just the planting. Yuki leans against your shoulder and purrs, very quietly, the whole way through."),
    (g) => byForm(g, "You let it run a little further tonight, as far as the first green shoot, and stop it there. Yuki kneads your coat through the whole of it, slowly, and the bond says nothing at all.", "You let it run a little further tonight, as far as the first green shoot, and stop it there. Yuki lies along your side with one paw across your knees, as if the log might try to leave, and the bond says nothing at all.", "You let it run a little further tonight, as far as the first green shoot, and stop it there. Yuki sits against you with her ears tipped toward Wren's voice. \"She sounds tired,\" she says at the end. \"She sounds like you.\""),
    // v0.11.152 (RP1, RM6; Fable's): the 3rd and 4th nights
    (g) => byForm(g, "You don't play it tonight. You only hold it. Yuki sits on your knee with one paw resting on the log, as on a pulse. *Still there,* says the bond, and that is the whole of the evening.", "You don't play it tonight. You only hold it. Yuki lies with her chin on your knee and her nose against the log, as against a pulse. *Still there,* says the bond, and that is the whole of the evening.", "You don't play it tonight. You only hold it. Yuki sits beside you with two fingers resting on the log, as on a pulse. \"Still there,\" she says, and that is the whole of the evening."),
    (g) => byForm(g, "You play the planting once more, low, so that it won't carry. By now you both know where Wren breathes. The tip of Yuki's tail taps your wrist a beat before each breath, keeping the place. *Forty of them,* says the bond at the end. *And then us. Somebody was always going to come and listen.*", "You play the planting once more, low, so that it won't carry. By now you both know where Wren breathes. Yuki's ear flicks a beat before each breath, keeping the place, and stirs your hair every time. *Forty of them,* says the bond at the end. *And then us. Somebody was always going to come and listen.*", "You play the planting once more, low, so that it won't carry. By now you both know where Wren breathes. Yuki's finger taps your wrist a beat before each breath, keeping the place. \"Forty of them,\" she says at the end. \"And then us. Somebody was always going to come and listen.\""),
]);
/* v0.11.152 (owner pick RP1, RM6; Fable's): heart_camp's second paragraph by the night (the first is the old one). */
const HC_HEAP = [
    (g) => `${byForm(g, 'The three', 'The three', 'The four')} of you sleep in a heap by the fire now. Nobody has said anything about it. Nobody needs to. Ya sleeps in the middle, because Ya always ends up in the middle of everything.`,
    (g) => byForm(g, 'Nobody lays out three bedrolls any more. There is one heap by the fire, and it has rules. Mei Lin has the side away from the draught. Ya has the middle, by right of conquest. You have the edge, and one corner of a blanket, on a long lease. Yuki has the top.', 'Nobody lays out three bedrolls any more. There is one heap by the fire, and it has rules. Mei Lin has the side away from the draught. Ya has the middle, by right of conquest. You have the edge, and one corner of a blanket, on a long lease. Yuki goes round the outside, like a wall.', 'Nobody lays out four bedrolls any more. There is one heap by the fire, and it has rules. Mei Lin has the side away from the draught. Ya has the middle, by right of conquest. You have the place between Ya and the edge, and one corner of a blanket, on a long lease. Yuki has the edge, and your other side, and the rest of the blanket.'), // RV1 (L7; Fable's): the human's own arrangement
    (g) => `By now the ${byForm(g, 'three', 'three', 'four')} of you lie down by the fire in the order you got up in, without discussion, like a thing that has always been done. Ya is in the middle before anyone else has sat. Mei Lin folds her outer robe first, squarely, and sets it where she can reach it, in case of ancestors.`,
    (g) => `Somebody dragged the bedrolls together before supper was over, and nobody owns up to it. The ${byForm(g, 'three', 'three', 'four')} of you go down by the fire like tired dogs. Ya, in the middle, has an arm across each neighbour and most of the blanket, and announces that she will be asleep first. She generally is.`,
];
const HC_YA_WATCH = [
    'Ya takes the first watch without being asked, perched on a gallery ledge above the fire like a gargoyle, humming something tuneless.',
    'Ya is on her ledge again before the bowls are empty, legs hanging over the fire, the spear across her knees. Nobody asked her tonight either. The humming has still not found a tune.',
    'Ya has the first watch, as she has had it every night, and would take the offer of the second as an insult. From the gallery ledge she drops a small piece of bark on each of you in turn, to show that she is paying attention.',
    'Up on the gallery ledge Ya keeps the first watch, crouched and still, a shape with a spear against the dark. She has given up the humming. The tree doesn\'t care for the tune, she says, and she says it quite seriously, and nobody laughs.',
];
const HC_MEI_WATCH = [
    'Mei Lin takes the first watch.',
    'Mei Lin takes the first watch again. She sits very straight, with her herb-knife laid across her knees like a magistrate\'s seal.',
    'Mei Lin has the first watch. She has told you, formally, that it is her turn, and has declined to hear the arithmetic.',
    'The first watch is Mei Lin\'s, by a custom now three nights old, which in Ashfall would make it law.',
];
const HC_POOLS = { heap: HC_HEAP, ya: HC_YA_WATCH, mei: HC_MEI_WATCH };
/** RV1 (M2): which version of heart_camp's second paragraph tonight. */
const hcPool = (g) => (trio(g) >= 3 ? 'heap' : ya(g) ? 'ya' : 'mei');
const DR_SP_IN = dayReply("heart_spring:0", [
    "Ya spends the whole time trying to drown you, then trying to get you to stop being so stiff, then, briefly, very effectively, not trying to do anything at all except sit closer.",
    "Ya has given up on drowning you and taken up floating you instead, one hand under your back, issuing instructions. You are bad at it. She is patient about that, which is new, and stays close after the lesson is over, which isn't.",
    "Ya has ruled that you can float and moved on to the next lesson, which is holding your breath, and which she teaches by sitting on you. You come up to find her laughing and Mei Lin, at the far end, very carefully not. Afterwards Ya leans back against your chest as if you were the side of the pool, and stays there.", // v0.11.152 (RP1, RM8; Fable's): the 3rd day
]);
const DR_SP_WASH = dayReply("heart_spring:1", [
    "Mei Lin washes beside you and tells you, without looking, that you are a coward. She doesn't sound like she minds.",
    "Mei Lin takes the place next to yours at the far end and passes you the washcloth without turning her head. Cowards, she remarks, at least get clean.",
    "Mei Lin keeps her eyes on the wall and her elbow, now and then, against yours. She says the far end is the respectable end. She has clearly decided this herself.",
]);
// RV2 (L5, Fable's review): day 3 on the steps above the basin (without Ya, the worn lip is Mei Lin's seat in the scene)
const DR_SP_SIT = dayReply("heart_spring:2", [
    (g) => byForm(g, "You put your back against a warm stretch of wall, with Yuki in your lap, and listen to the water. For half an hour not one person needs a thing from you.", "You put your back against a warm stretch of wall, with Yuki's head in your lap, and listen to the water. For half an hour not one person needs a thing from you.", "You put your back against a warm stretch of wall, with Yuki's shoulder against yours, and listen to the water. For half an hour not one person needs a thing from you."),
    (g) => byForm(g, "You find the warm stretch of wall again and sit, with Yuki asleep across your knees, and watch the steam go up into the dark. Nobody asks you a single question. You had forgotten that could happen.", "You find the warm stretch of wall again and sit, with Yuki's chin heavy on your knee, and watch the steam go up into the dark. Nobody asks you a single question. You had forgotten that could happen.", "You find the warm stretch of wall again and sit, with Yuki sitting close beside you, and watch the steam go up into the dark. Nobody asks you a single question. You had forgotten that could happen."),
    (g) => byForm(g, "You sit on the steps above the basin with your feet in the water and Yuki curled in the crook of your arm, and think about nothing at all, with every thread you have.", "You sit on the steps above the basin with your feet in the water and Yuki stretched along the floor behind you like a warm bolster, and think about nothing at all, with every thread you have.", "You sit on the steps above the basin with your feet in the water and Yuki next to you, her tail held carefully clear of the pool, and think about nothing at all, with every thread you have."),
]);

export const BREAK_HUBS = ['heart_hub', 'heart_camp'];

const P = 'The Heart of the Blackroot';
const PIN = 'Inside the Old Tree';
/** Waking hours, when there is time to explore. */
const active = (g) => hour(g) >= 6 && hour(g) < 18;
/** From Day 19 the tree is done with them: only the way forward is left (v0.11.87: Cultivate and Rest too). */
const late = (g) => day(g) >= 19;
const guardianOpen = (g) => !!g.flags.log_heard && !g.flags.guardian;
const ya = (g) => !!g.flags.ya_party;
const both = (g) => likesMei(g) && likesYa(g);

/* v0.11.124 (owner picks NX1, NF1; texts by Fable, MAINs): the log scene's Yuki lines by the shape she has (`ykShape`); since v0.11.125
 * (FM1, PM) her current form, as the picture ('cat', 'tiger' (the great root-kin), 'human'). The cat lines are the old ones. */
const LOG_LOOK = {
    cat: 'Yuki looks up at you. Through the bond: *what do we do.*',
    tiger: 'Yuki looks at you, level, gold eye to eye. Through the bond: *what do we do.*',
    human: 'Yuki looks down at you. "What do we do," she says. It doesn\'t come out as a question.',
};
const LOG_HOLD = {
    cat: 'Say nothing. Hold the log. Hold the cat.',
    tiger: 'Say nothing. Hold the log. Lean on the cat.',
    human: 'Say nothing. Hold the log. Hold Yuki\'s hand.',
};
const LOG_JUDGE = {
    cat: 'Yuki sits in the middle of the three of you like a small white judge, and through the bond, very primly: *about time.*',
    tiger: 'Yuki lies down around the three of you like a large white verdict, her tail across everybody\'s feet, and through the bond, very primly: *about time.*',
    human: 'Yuki sits down facing the three of you, human, her tail tucked round her feet, like a small judge in a high black collar. "About time," she says aloud, very primly.',
};
/** The fallback branch's clause; left out when her path beat follows (NF1, FB: it places her). */
const LOG_SEAT = {
    cat: 'and Yuki sits on the hearth-log',
    tiger: 'and Yuki lies round the foot of the chair like a white rug with opinions',
    human: 'and Yuki sits on the arm of the chair with her tail round your wrist',
};

/* ---------- encounters ---------- */
const husks = (g, win, lose) => encounter(g, {
    id: 'husks', tier: 'small', win, lose, flee: 'heart_hub',
    intro: 'The grey wood lets them out one at a time: hollow-grubs as big as dogs, the colour of old tallow, each with a mouthful of splinters.',
    enemies: [{ name: 'Hollow-grub', hp: 5, dc: 2, atk: 3, dmg: 4 }, { name: 'Hollow-grub (swollen)', hp: 5, dc: 2, atk: 3, dmg: 4 }],
});
const rootThings = (g) => encounter(g, {
    id: 'root_husks', tier: 'region', win: 'roots_won', lose: 'roots_lost', flee: 'heart_hub',
    intro: 'No light ever got this far down, and the rot has had four centuries of dark to get ideas in. It has grown arms. More than it needs.',
    enemies: [{ name: 'Root-husk', hp: 6, dc: 2, atk: 2, dmg: 4 }, { name: 'Hollow-grub', hp: 4, dc: 2, atk: 2, dmg: 4 }],
});
const guardianFight = (g) => encounter(g, {
    id: 'guardian', tier: 'boss', win: 'guardian_won', lose: 'guardian_lost',
    intro: 'The guardian opens out to its whole height, three of you end to end, grown wood on old white bone; and inside it, faint, a voice has not stopped singing.',
    enemies: [{ name: 'The Gardeners\' Guardian', hp: g.flags.guardian_weak ? 10 : 12, dc: 3, atk: 3, dmg: 5, dr: 1, moods: true }], // v0.11.113 (DA1, HD): its moods (game.js moodOf)
});

/** Morning inside the trunk (also handles the sleep). */
function wake(g) {
    const out = [];
    if (hour(g) < 6 || hour(g) >= 16) { sleepUntil(g, 6); out.push('Slept until 06:00. HP and Qi full.'); }
    const e = eatBest(g);
    out.push(e.length ? `Breakfast. ${e[0]}` : 'No breakfast. Ya feeds you: something out of her belt-pouch. You decline. She takes it personally. You eat it.');
    return out;
}

export const HEART = {
    ht_start: {
        id: 'ht_start', title: 'The Heart', art: 'heart_gate', place: P,
        text: (g) => `Day sixteen. By daylight, the roots you slept in turn out to be the least of it.

You saw it from the ridge. You felt it through the soles of your feet for days, and last night you lay down in its lap. None of that was preparation. Tip your head back, and the trunk goes on past the angle your neck will agree to: grey, smooth, a cliff of dead wood broad enough to keep its own weather, with the black wound high in its flank and the stubs of broken limbs above that. No leaves. None in living memory, nor in anybody's grandmother's.

Last night something in there sang, faint as breathing, and your Convergence sang back. This morning the doorway stands a little wider than it did, and your Convergence sings to it and gets nothing at all. That is the worst part. You are used to Hearth Trees that answer.

${ya(g) ? '"Huh," says Ya, under her breath; you have never heard her say anything that quietly. Then, at her usual volume: "Bigger dead than I remember. Okay. Fine. Love it."\n\n' : ''}Mei Lin says nothing at all. ${byForm(g, "She has reached up to your shoulder and laid two fingers on Yuki's back, and Yuki is letting her.", "She has a hand on Yuki's back, sunk to the wrist in white fur, and Yuki is letting her.", "She has taken hold of Yuki's sleeve, like a child at a river crossing, and Yuki is letting her.")}`,
        choices: [{ text: 'Walk to the doorway.', time: 30, to: 'heart_gate' }], // v0.11.173 (P6A, SM; owner pick CA1): was 'Cross the clearing.' (they slept at the doorway)
    },
    heart_gate: {
        id: 'heart_gate', title: 'The Split', art: 'heart_gate', place: P,
        text: (g) => `Seen close, by daylight, the doorway is no doorway. It is a cut. The wood at the foot of the trunk has been split in a line too clean and too *straight* for rot, wide enough to take a cart, and the grey lips of it have spent the centuries since trying to grow shut. Something cut its way in here, and the tree never managed to close the wound.

Cold air breathes out of the split. Dry wood, old dust, and under those, very faint, a smell you last met in a laboratory on another world: sap. Living sap.

${g.flags.gate_listened ? 'You have put your hands to it and listened already. Whatever lies down there, the sap is right about it: not dead. Not quite.' : ''}`,
        choices: [
            { text: 'Put both hands on the trunk and listen with your Convergence.', show: (g) => !g.flags.gate_listened, check: { skill: 'Convergence Use', dc: 3, band: 'challenging' }, time: 20, do: (g) => { g.flags.gate_listened = true; return ['Far down, and then further down than that, a single note: held, as a sleeper hums.']; }, failDo: (g) => { g.flags.gate_listened = true; return ['Nothing. A grey, complete, unhurried silence. If anything is down there, it has not made up its mind to talk to you.']; }, to: 'heart_gate' },
            { text: 'Walk the trunk\'s base first. Look for anything that isn\'t tree.', show: (g) => !g.flags.sect_marks, time: 60, do: set('sect_marks'), to: 'heart_gate_marks' },
            { text: 'Go in.', time: 15, to: 'heart_hall' },
        ],
    },
    heart_gate_marks: {
        id: 'heart_gate_marks', title: 'Tool Marks', art: 'heart_gate', place: P,
        text: (g) => `An hour's walking takes you a third of the way round the trunk, and there they are: grooves in the grey wood, each as long as you are tall. Axe-work. And with it, burn-scars in tidy rows, as though somebody had *drawn* fire onto the bark with a brush.

Over the deepest groove, small and exact, its lines filled with a pigment that used to be red, there is a lotus.

Mei Lin stops dead. Her face goes still, as every face in Ashfall does when the collectors come up the road.

"That's the founder's seal," she says. "The first Sect Master. It's on the tribute post. It's on everything." She breathes in. "They told us the Old Tree died of age."

${ya(g) ? 'Ya spits on the lotus. She thinks about it, and spits on it again, with more care. Nobody tells her not to.' : 'Yuki considers the carving, sneezes at it once, and turns her back on it with her tail very straight.'}`,
        choices: [{ text: 'Back to the split.', time: 30, to: 'heart_gate' }],
    },
    heart_hall: {
        id: 'heart_hall', title: 'The Hall', art: 'heart_hall', place: PIN,
        text: (g) => `Inside, the tree is hollow, and the hollow is a cathedral.

Thin grey shafts stand in it, let in by cracks far overhead. The walls go up in ridges and galleries that were grown, not built: you can see where living wood flowed round itself and set into ledges, stairs, alcoves. Houses are made this way at home. So are *cities*. Somebody lived here.

Four centuries of dust have fallen on the floor and stayed soft. Your steps make no sound in it. Your Convergence touches the walls and comes back with what an old photograph gives you: the shape of what was here, and none of the warmth.

${ya(g) ? 'Ya has her back to a wall and her spear up. "I don\'t like it," she tells the hall at large. "I want that written down. Ya does not like it."\n\n' : ''}"It's beautiful," Mei Lin whispers; and then, angrily, as if the word had insulted somebody: "It's a *grave*."

Both, you think. More the second.`,
        choices: [{ text: 'Make this the base. Look around.', time: 30, to: 'heart_hub' }],
    },

    /* ---------- the hub inside the trunk ---------- */
    heart_hub: {
        id: 'heart_hub', title: 'Inside the Old Tree', art: 'heart_hall', place: PIN,
        text: (g) => {
            const h = hour(g);
            const w = byDayLast(g, HALL_WHEN, 'heart_hub'); // ST5; RV1 (CL): a stay past five days keeps the fifth
            const when = h < 6 || h >= 20 ? w[0] : h < 11 ? w[1] : h < 16 ? w[2] : w[3];
            const where = !g.flags.roots_done ? 'The hall goes down as well as up. Under its floor the root-galleries begin, black and deep.' : !g.flags.ship_found ? 'Under the roots, you now know, lies a thing that is not tree.' : !g.flags.log_heard ? 'The ship is down there, waiting, and so is whatever it means to tell you.' : !g.flags.guardian ? 'Below the ship, behind a door of grown bone, something sings on in its sleep.' : !g.flags.seed ? 'The way into the heart-chamber stands open.' : 'You have what you came for, and the tree knows that as well as you do.';
            return `${when}

${where}

${pantry(g)} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''}${late(g) && !g.flags.seed ? '\n\nThe tree has been patient four hundred years. It is not going to be patient much longer: whatever you are going to do here, do it.' : ''}`;
        },
        choices: [
            { text: 'Listen to the hall with your Convergence.', show: (g) => active(g) && !late(g) && !g.flags.hall_song, time: 60, to: 'hall_listen' },
            { text: 'Explore the ring-chambers off the galleries.', show: (g) => active(g) && !late(g) && !g.flags.rings_done, time: 30, to: 'ring_chambers' },
            { text: 'Follow the sound of water.', show: (g) => active(g) && !late(g) && !g.flags.spring_found, time: 30, to: 'heart_spring' },
            { text: 'Wash at the spring.', show: (g) => active(g) && !late(g) && !!g.flags.spring_found && !g.flags[`spring@${day(g)}`], time: 30, to: 'heart_spring' },
            { text: 'Climb to the great wound high in the wall.', show: (g) => active(g) && !late(g) && !!g.flags.sect_marks && !g.flags.cut_read, time: 60, to: 'sect_cut' },
            { text: 'Go down into the root-galleries.', show: (g) => active(g) && !g.flags.roots_done, time: 30, to: 'heart_roots' },
            { text: 'Go down to the ship.', show: (g) => active(g) && !!g.flags.roots_done && !g.flags.ship_found, time: 60, to: 'ship_wreck' },
            { text: 'Go back to the ship\'s bridge. Hear the rest.', show: (g) => active(g) && !!g.flags.ship_found && !g.flags.log_heard, time: 40, to: 'ship_bridge' },
            { text: 'Go through the door of bone, to whatever is singing.', show: (g) => (active(g) || late(g)) && guardianOpen(g) && g.flags.guardian_lost_day !== day(g), time: 40, to: 'guardian_approach' },
            { text: 'Go round the guardian. Whatever it costs.', show: (g) => guardianOpen(g) && !!g.flags.guardian_lost_day && (late(g) || g.flags.guardian_lost_day === day(g)), time: 60, to: 'guardian_bypass' },
            { text: 'Into the heart-chamber.', show: (g) => !!g.flags.guardian && !g.flags.seed, time: 20, to: 'heart_core' },
            { text: 'Leave the Old Tree.', show: (g) => !!g.flags.seed, to: 'ht_leave' },
            // v0.11.87 (owner 2026-11-09 01:52, pick O1, the sitting loop): from Day 19 the tree is done with them, so no sit and no rest here (the Sitter sat here to about Day 50)
            // v0.11.90 (owner 08:42, pick R1, the v0.11.87 review): from Day 19 Rest stays while James is hurt (a heal before the guardian), gone once HP is full
            { text: 'Cultivate: one sit, 10 Qi.', show: (g) => active(g) && !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%. The hall holds very still around you while you sit.`, ...r.xp] : []; }, to: 'heart_hub' },
            { text: 'Rest an hour.', show: (g) => active(g) && (!late(g) || g.james.hp < jamesHpMax(g)), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest, your back to grey wood that was a living wall once.']), to: 'heart_hub' },
            { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'heart_hub' },
            { text: 'Make camp for the night.', show: (g) => !active(g) || hour(g) >= 16, time: 20, to: 'heart_camp' },
        ],
    },

    hall_listen: {
        id: 'hall_listen', title: 'The Grain', art: 'heart_hall', place: PIN,
        text: (g) => `You sit in the middle of the hall with your palms flat on the floor and let your Convergence go down into the grain.

It's like reading a library by touch. Every ring is a year. Every year was a song: you can feel the shape of them, pressed into the wood like grooves in a record, centuries of them, one after another, each a little different, each *warm* — and then, about four hundred rings in from the bark, they stop.

Not fade. Stop. The last ring is ragged, scorched, wrong. After it there is nothing but dead growth, grey on grey, the tree making wood out of habit while there was nothing left inside it to sing.

${byForm(g, 'Yuki puts her paw on the back of your hand.', 'Yuki rests her chin on the back of your hand.', 'Yuki puts her hand on the back of yours.')} Through the bond, very simply: *someone did this.*`,
        choices: [
            { text: 'Read the last living ring, the scorched one. Carefully.', check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 40, do: (g) => { g.flags.hall_song = true; return ['Fire, drawn on with a brush. Hands, a great many hands. And over them one voice, perfectly calm, giving orders. If you ever meet so much as its echo, you will know it.']; }, failDo: (g) => { g.flags.hall_song = true; g.james.hp -= 2; return ['The ring burns you back. Not badly. Badly enough. −2 HP.']; }, to: 'heart_hub' },
            { text: 'Take your hands off the floor. Enough for now.', do: set('hall_song'), to: 'heart_hub' },
        ],
    },

    ring_chambers: {
        id: 'ring_chambers', title: 'The Ring-Chambers', art: 'heart_hall', place: `${PIN} — the galleries`,
        text: (g) => `The tree grew rooms off its galleries: round chambers set one inside the next, like the rings of the trunk they are in. Shelves that are part of the wall. Hollows in the shape of a body asleep. One long table, all of a piece, with an edge worn glossy by centuries of elbows.

People lived here. Right up to the end, the gardeners lived here.

Something has eaten the shelves in the third ring. In the fourth, it is still at them, and you hear it before you see it: a dry, unhurried chewing.

${ya(g) ? '"Bugs," says Ya, deeply satisfied, and takes a new grip on her spear. "Finally. Something in here I understand."' : ''}`,
        choices: [
            { text: 'Clear them out.', combat: (g) => husks(g, 'ring_won', 'ring_lost'), to: 'ring_won' },
            { text: 'Seal the fourth ring with a wall of bone and leave them to it.', qi: 5, check: { skill: 'Convergence Use', dc: 4 }, time: 40, do: (g) => { g.flags.rings_done = true; return ['A white wall, from the floor to the ceiling. Behind it the chewing continues, in a disappointed tone.']; }, fail: 'ring_forced', to: 'heart_hub' },
        ],
    },
    ring_forced: {
        id: 'ring_forced', title: 'The Ring-Chambers', art: 'heart_hall', place: `${PIN} — the galleries`,
        text: (g) => `The bone wall comes out thin, and they come through it like it's paper.${byForm(g, '', " Yuki has the gallery behind you, all of it, wall to wall. *I can't turn round in here,* says the bond. *So we are going forward.*", " Yuki looks at the hole, then at you. \"I have watched you make thicker soup,\" she says, and comes up level with your shoulder.")}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fine.', combat: (g) => husks(g, 'ring_won', 'ring_lost'), to: 'ring_won' }],
    },
    ring_won: {
        id: 'ring_won', title: 'Quiet Rooms', art: 'heart_hall', place: `${PIN} — the galleries`,
        enter: (g) => { g.flags.rings_done = true; addItem(g, 'ship_shard', 1); return ['+1 Hull-shard, out of a shelf the grubs had given up on.']; },
        text: (g) => `Afterwards the fourth ring is quiet, and littered with pale pieces of grub. The shelf they were eating had a hollow grown into the wall behind it, and in the hollow stands a cup: plain wood, and older, by the grain, than the wall grown to hold it. A name is burned into its base, in the first script you ever learned.

*Tamsin.*

You hold it for longer than you would want anybody to see. ${ya(g) ? 'Ya sees. She says nothing about it. On her way past she knocks her shoulder into yours, hard, and that may be the kindest thing she has ever done.' : 'Mei Lin sees. She does not ask.'}`,
        choices: [{ text: 'Put the cup back where Tamsin left it.', time: 20, to: 'heart_hub' }],
    },
    ring_lost: {
        id: 'ring_lost', title: 'Retreat', art: 'heart_hall', place: `${PIN} — the galleries`,
        enter: (g) => { g.flags.rings_done = true; return []; },
        text: (g) => `You back out of the rings with grubs on your heels and splinters in your arms, and ${ya(g) ? 'Ya' : 'Mei Lin'} drops a shelf on the doorway behind you. It holds. Mostly.${byForm(g, '', " Yuki is already out: she backed the whole length of the gallery ahead of you, because the rings were grown for gardeners and there is nowhere in them to turn that much cat round. She sits down and starts on the splinters in her forepaw.", " Yuki is out already, standing clear with her tail held up off the floor, taking splinters out of her sleeve one by one. \"They have the shelves,\" she says. \"I don't see why they need us as well.\"")}

"We'll leave those rooms to the bugs," ${ya(g) ? 'Ya says, picking a splinter out of her own forearm with her teeth' : 'Mei Lin says, white-faced'}. Nobody argues.`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; RB2 (RL): Fable's redraft after the review
        choices: [{ text: 'Back to the hall.', time: 30, to: 'heart_hub' }],
    },

    heart_spring: {
        id: 'heart_spring', title: 'The Spring', art: 'hot_spring', place: `${PIN} — the spring`,
        enter: (g) => { g.flags.spring_found = true; g.flags[`spring@${day(g)}`] = true; return []; },
        text: (g) => byDay(g, [(g) => `One gallery dips, and where it dips there is water: a pool in a basin of grown wood, fed from a seep in the wall and warmed by whatever lies far below. Steam rests on it like breath on a mirror.

It is clean. Your omnitool tells you so twice, in the tone of a tool that doesn't believe itself either. The one clean water you have met on this whole world, and it is inside the corpse of a Hearth Tree.

${ya(g) ? `Ya is out of her clothes and into it before you have reached the end of the analysis. "Warm!" she reports from the middle, delighted. "Come in. Both of you. I don't bite. I bite a *little*."` : 'Mei Lin kneels, puts both hands in to the wrist, and simply leaves them there.'}
${ya(g) ? (g.flags.romance ? 'Mei Lin goes red to the ears, looks at you, looks at Ya, and says a thing in a dialect you don\'t know which is plainly not a blessing.' : 'Mei Lin turns her back on the pool with tremendous dignity. Her ears are red.') : ''}`, (g) => `The spring is where you left it, which on this world you no longer take for granted. Steam on the surface. The basin of grown wood has a lip worn smooth along one side, at sitting height, and it takes you a moment to understand that gardeners wore it smooth, one sitting at a time.

Your omnitool tests the water again without being asked, and reports it clean again, in what you choose to read as a calmer tone.

${ya(g) ? `Ya goes in off the edge with a whoop that comes back down from the galleries a good while later. "Still warm!" she announces, surfacing. "I thought it might have run out. Get in before it does."` : `Mei Lin rolls her sleeves to the elbow and washes her hands and face slowly, the way people wash at a shrine.`}
${ya(g) ? (g.flags.romance ? `Mei Lin says that springs do not run out, that is what makes them springs, and then stands there holding her own collar shut with one hand and looking at neither of you.` : `Mei Lin says that springs do not run out, that is what makes them springs, and goes to wash at the far end with her back turned like a shut door.`) : ''}`, (g) => `Back to the spring. You have stopped being surprised by the water and started noticing the room: a row of pegs grown out of the wall at shoulder height, each one worn pale where a hand reached for it every day for years.

You don't run the analysis this time. You just put your hand in.

${ya(g) ? `Ya is already floating on her back in the middle, her necklace of teeth adrift round her collarbones. "You're slow," she tells the ceiling. "Both of you. The water says so."` : `Mei Lin sits on the worn lip of the basin with her feet in the water and her eyes shut, and for once does not look as if she is waiting to be told off.`}
${ya(g) ? (g.flags.romance ? `Mei Lin looks at the pool, and at Ya, and at you, and says, in the voice of a woman reading out a sentence, that she will be keeping her shift on. Nobody had asked.` : `Mei Lin informs the wall that some people were raised in a den, and unpins her hair at the far end of the pool, facing away.`) : ''}`], 'heart_spring'),
        choices: [
            { text: 'Get in. You\'re forty, filthy, and it\'s *warm*.', show: ya, time: 45, do: (g) => { advance(g, 0); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 6); bumpRel(g, 'Ya', 3, 5); if (likesMei(g)) bumpRel(g, 'Mei Lin', 0, 2); return [`+6 HP. ${DR_SP_IN(g)}`]; }, to: 'heart_hub' },
            { text: 'Wash, quickly, at the far end, with a reasonable amount of dignity left.', time: 30, do: (g) => { g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 4); bumpRel(g, 'Mei Lin', 2, 1); return [`+4 HP. ${DR_SP_WASH(g)}`]; }, to: 'heart_hub' },
            { text: 'Sit by the water and let them have it.', noFam: true /* v0.11.141 (RW1, NF): cultivation or rest by its own rule */, time: 30, do: (g) => { advance(g, 30, { resting: true }); return [DR_SP_SIT(g)]; /* v0.11.126 (NQ1): by her form, Fable's; v0.11.136 (NC1): by the day */ }, to: 'heart_hub' },
        ],
    },

    sect_cut: {
        id: 'sect_cut', title: 'The Wound', art: 'heart_core', place: `${PIN} — the high wound`,
        enter: set('cut_read'),
        text: (g) => `High up, where the galleries give out, the trunk's inner wall has a hole in it as big as a house. Not a crack. A *hole*, cut dead round, with its rim burnt black. The heart never lay up here: the scorching runs on down the inside of the trunk, past the hall floor and out of sight, and whatever they cut loose, they cut loose down there. The split at the foot was their door and this was their chimney: opened from above, so that what was lifted out below could go up the hollow trunk and out.

Words run round the rim, carved in that same red lotus script. Mei Lin reads them out slowly, a finger under each character.

"*Here the Crimson Lotus took the heart of the Old Tree, and from it refined the first true core, and from that core the first pill of ascension. Here the Sect was born. Let every disciple who stands here know that Heaven rewards the bold.*"

She stops. The finger stays where it is, on the last character.

"They teach that line," she says. "In the outer sect. On the day you arrive. My father would have learned it." She takes her hand off the wall as if the wall were hot. "I thought it was about courage."

${ya(g) ? '"It\'s about stealing," says Ya. "With them, everything is."' : ''}`,
        choices: [{ text: 'Go back down. You\'ve seen enough of their poetry.', time: 40, do: (g) => { bumpRel(g, 'Mei Lin', 3, 0); return [`Mei Lin comes down behind you without a word, and halfway down she takes hold of the back of your coat and doesn't let go until the floor. "He believed it," she says at the bottom. "My father. He stood somewhere like that and believed it." You don't say anything. You've learned when not to.`]; }, to: 'heart_hub' }],
    },

    /* ---------- the roots and the ship ---------- */
    heart_roots: {
        id: 'heart_roots', title: 'The Root-Galleries', art: 'heart_roots', place: `${PIN} — the roots`,
        text: (g) => `At its low end the floor of the hall tips over into the roots, and the roots go down into the dark.

Inside, they turn out to be galleries too: tunnels as wide as corridors, ribbed and smooth, descending at one steady angle, as if the tree had *meant* to walk somebody down here. Your omnitool's light is small and white and has no company. ${ya(g) ? 'Ya keeps so close behind that you can feel her breath on your neck, and anyone who suggests she is frightened will be killed.' : 'Mei Lin keeps so close behind that you can feel her breath on your neck.'}

Halfway down, the tunnel ends in a shaft. Under it, faint, your Convergence finds a thing that is not tree. It was *grown*, yes; but grown to a plan. Straight lines. Right angles. The right angles they teach at home.

Your heart begins to go very fast.`,
        choices: [
            { text: 'Climb down the shaft on the root-ridges.', check: { skill: 'GU', dc: 4 }, fly: "You step off the edge and ride the shaft's slow Qi down, then go back up for whoever can't. Yuki drifts past, inspecting the ridges nobody used." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 60, to: 'roots_dark', fail: 'roots_fall' },
            { text: 'Sing a ladder of bone down the side of the shaft.', qi: 6, check: { skill: 'Convergence Use', dc: 4 }, time: 40, to: 'roots_dark', fail: 'roots_fall' },
        ],
    },
    roots_fall: {
        id: 'roots_fall', title: 'The Shaft', art: 'heart_roots', place: `${PIN} — the roots`,
        enter: (g) => { g.james.hp = Math.max(1, g.james.hp - 4); return ['You come down the last few metres all at once. −4 HP.']; },
        text: (g) => `Something gives — a ridge, a rung, your grip — and you do the last bit the fast way. You land on your back in dust that has had four hundred years to get this soft, and lie there looking up at ${ya(g) ? 'Ya\'s face at the top of the shaft, which is laughing so hard she has to hold on to the wall' : 'Mei Lin\'s face at the top of the shaft, white and furious'}.

"*Alive*," you report. It comes out higher than you'd like.

${byForm(g, "Yuki climbs down after you, perfectly, and sits on your chest, and looks at you.", "Yuki climbs down after you, perfectly, the whole white length of her, and puts one paw on your chest, and looks at you.", "Yuki climbs down after you, perfectly, in a dress, and stands over you, and looks at you.")}`,
        choices: [{ text: 'Get up. Wait for the others. Go on.', time: 20, to: 'roots_dark' }],
    },
    roots_dark: {
        id: 'roots_dark', title: 'Something Moving', art: 'heart_roots', place: `${PIN} — the deep roots`,
        text: `At its foot the shaft lets you out into a root-chamber, and the chamber is occupied. Its walls are lumpy with a stuff that isn't wood: pale, waxy, and *growing*. Your light goes across it, and some of the lumps unfold.

The rot did more than eat the tree. It moved in.`,
        choices: [
            { text: 'Fight your way through.', combat: rootThings, to: 'roots_won' },
            { text: 'Run for the far tunnel and don\'t stop.', check: { skill: 'GU', dc: 5 }, fly: "You don't run. You go over, close under the ceiling, passengers and all. The lumps unfold at the place your feet should have been." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 20, do: (g) => { g.flags.roots_done = true; return ['You get through, by the width of a heel. Something shuts on the air where the heel was.']; }, fail: 'roots_caught', to: 'ship_wreck' },
        ],
    },
    roots_caught: {
        id: 'roots_caught', title: 'Caught', art: 'heart_roots', place: `${PIN} — the deep roots`,
        text: `Too slow. A thing takes a turn round your ankle, and the floor arrives.`,
        choices: [{ text: 'Then fight.', combat: rootThings, to: 'roots_won' }],
    },
    roots_won: {
        id: 'roots_won', title: 'The Way Down', art: 'heart_roots', place: `${PIN} — the deep roots`,
        enter: (g) => { g.flags.roots_done = true; return []; },
        text: (g) => `Quiet comes back into the root-chamber. ${ya(g) ? 'Ya is standing on the largest husk with her spear still in it, breathing hard and grinning like someone handed a present. "*That* I liked," she says. "Do they have more? Ask them if they have more."' : 'Mei Lin is standing over the last husk with her knife out, wearing a look you have seen on her once before, on the herb slope, that first morning.'}

Past the chamber the tunnel bends, and the walls change. They leave off being root. They begin to be *hull*.`,
        choices: [{ text: 'Go on.', time: 20, to: 'ship_wreck' }],
    },
    roots_lost: {
        id: 'roots_lost', title: 'Dragged', art: 'heart_roots', place: `${PIN} — the root-galleries`, // v0.11.130 (YB1, LL; Fable's MAINs): the great root-kin's clause (no Ya) and line
        enter: (g) => { g.james.hp = Math.max(1, Math.ceil(g.james.hp)); return []; },
        text: (g) => `You go down under the husks, and the next thing you know is being hauled up the shaft by the collar of your coat, ${ya(g) ? 'Ya swearing above you in three languages, one of which you\'re fairly sure she invented on the spot' : byForm(g, 'Mei Lin and Yuki between them, which should not be physically possible', "Mei Lin calling the handholds down from the lip above in a voice that is very nearly steady", "Mei Lin and Yuki between them, Yuki in a qipao that has not picked up so much as a thread of husk, which should not be physically possible") /* v0.11.131 (XB2, RH; Fable's MAIN): the human's own */}.${byForm(g, '', " The collar is in Yuki's teeth. She climbs the shaft backwards with you swinging under her chin like a kitten, and when she sets you down at the top there are husk-lines raked down both her flanks, which neither of you mentions.", '')}

You'll have to go back down. You both know it. Just — not right now.`,
        choices: [{ text: 'Back to the hall. Lick your wounds.', time: 60, to: 'heart_hub' }],
    },

    ship_wreck: {
        id: 'ship_wreck', title: 'The Seed-Ship', art: 'ship_wreck', place: `${PIN} — beneath the roots`,
        enter: (g) => { g.flags.roots_done = true; g.flags.ship_found = true; return []; },
        text: (g) => `It's a ship.

Of course it is. Some part of you has known since the ridge. Knowing it and standing in front of it turn out to be two separate things, and you go on standing there while the second one catches up.

A seed-ship. One of yours: older than anything you have met outside a museum, and not to be mistaken for anything else. The long teardrop hull, grown out of a single seed. The ribs, curved like the inside of a shell. The hatches, made to open as leaves do. It came down hard, and the front third of it is crushed. Afterwards the tree grew round it and held on, as a hand closes on a thing it is afraid to drop.

There is a name on the hull, in the letters you were taught before you could walk.

*PATIENT ROOT.*

"James," says Mei Lin, with care. "You're crying."

"I'm aware," you say. "Give me a minute. I'm a scientist. This is a lot of data."

${ya(g) ? 'Ya says nothing whatever. She plants herself next to you, shoulder against your shoulder, and waits, a skill you would have sworn she didn\'t have.' : ''}`,
        choices: [
            { text: 'Put your hand on the hull.', time: 20, to: 'ship_touch' },
            { text: 'Go straight in. Find the bridge.', time: 30, to: 'ship_bridge' },
        ],
    },
    ship_touch: {
        id: 'ship_touch', title: 'Hull', art: 'ship_wreck', place: `${PIN} — the Patient Root`,
        text: (g) => `The hull is warm.

Not as a stone by the fire is warm. As *skin* is. Your Convergence goes into it without asking, exactly as it goes into your own bones, and the ship *answers*. Faintly; drowsily; like a sleeper half woken in the night who wants to know who's there.

*Hello,* you think at it, like an idiot. *I'm from home.*

Whether it understands, you can't tell. But deep in the hull a weight shifts, and the nearest hatch opens like a leaf in the morning.

Mei Lin makes a small sound, one sharp breath in. ${ya(g) ? 'Ya makes a far larger one, and her spear is levelled at the hatch before the hatch is done opening. "Did it do that on purpose? I want to know if it did that on purpose."' : ''}

"I think," you say, "it's been waiting."`,
        choices: [{ text: 'Go in.', time: 15, do: (g) => { g.flags.ship_woke = true; return []; }, to: 'ship_bridge' }],
    },
    ship_bridge: {
        id: 'ship_bridge', title: 'The Bridge', art: 'ship_bridge', place: `${PIN} — the Patient Root`,
        enter: (g) => { if (!hasItem(g, 'hearth_log')) { addItem(g, 'hearth_log', 1); return ['+1 Hearth-log (memory seed).']; } return []; },
        text: (g) => `The bridge is a round room at the heart of the ship, its walls grown in soft folds like the inside of a flower. Seats for six. Nobody in them. You were braced for bodies, and there are none, and you don't know if that's better.

In the middle of the floor, on a pedestal grown up out of the deck, sits a knot of wood the size of two fists, polished by hands. A memory seed. A hearth-log. Every ship carries one. Every child on your world learns how to play one.

${g.flags.ship_woke ? 'It\'s already glowing faintly, as if the ship has been holding it up for you to see.' : 'It\'s dark. When you pick it up, it warms in your hand.'}

You sit in the nearest seat. ${ya(g) ? 'Ya perches on the back of another, crouched like a cat. Mei Lin stands.' : 'Mei Lin stands beside you.'} ${byForm(g, 'Yuki gets into your lap without being asked.', 'Yuki lays her head in your lap without being asked.', 'Yuki sits on the arm of your seat without being asked.')}

You close your hands around the log.`,
        choices: [{ text: 'Play it.', time: 30, to: 'ship_log' }],
    },
    ship_log: {
        id: 'ship_log', title: 'Hearth-Log: Arrival', art: 'ship_log', place: `${PIN} — the Patient Root`,
        text: `It doesn't play as a recording plays. It comes in like a memory that belongs to someone else, poured into you.

*A woman's voice, tired and steady. Head Gardener Wren Aldous, of the seed-ship Patient Root, out of the Ninth Grove. Forty souls aboard, and every one a gardener: soil people, seed people. Not one of them has ever held a weapon.*

*The drive failed. They don't know why. The fall went on and on. It ended here.*

*"The Qi on this world is sick,"* she says. You can feel her hands, sore from the work. *"Something died here, long before us. A lot of somethings. It's in the air, the water, the soil, and the people here breathe it. It makes them hard, and hungry, and short-lived. Short as we measure a life, at least; I have no other measure with me. We can't mend the drive. So we'll do what we know."*

*They planted a Hearth.*

The memory shows it to you. Forty people on their knees in a black clearing, singing a seed into the ground. A green shoot. A sapling. And then, quicker than anything ought to grow, a tree: up and outward, with its roots going down and down into the poisoned earth, drinking it, turning it over, making it clean.`,
        choices: [{ text: 'Keep listening.', time: 30, to: 'ship_log2' }],
    },
    ship_log2: {
        id: 'ship_log2', title: 'Hearth-Log: The Song', art: 'ship_log', place: `${PIN} — the Patient Root`,
        text: `*Centuries go by in the log like seasons. Wren is old, and then she is not there. Others speak. The voices change; the song doesn't.*

*The Hearth grows, and keeps growing. Its roots go out under the whole forest, then under the mountains, then past them. Wherever they go, the Qi comes up clean. Animals return. People return. The locals name it the Old Tree. They bring it gifts. They sing to it, badly, in a language it doesn't speak, and it sings back regardless.*

*"We're not going home,"* says a young voice, three centuries in. *"Nobody's coming. But this is... it's better. I think this is what we were for."*

There are children in the memory by now: local children, gardener children, and after a few generations no telling them apart. The forest is green. The Blackroot isn't black.

Next to you, Mei Lin has a hand over her mouth.

"The Old Tree," she says through her fingers. "My grandmother's grandmother's songs. They're about *this*."`,
        choices: [{ text: 'You know what comes next. Keep listening.', time: 30, to: 'ship_log3' }],
    },
    ship_log3: {
        id: 'ship_log3', title: 'Hearth-Log: The Lotus', art: 'ship_log', place: `${PIN} — the Patient Root`,
        enter: (g) => { g.flags.log_heard = true; return []; },
        text: (g) => `*Four hundred years ago. The last voice in the log is the tree's own. It has no words, only feeling, and you have never wanted so much to feel nothing.*

*A man comes to the clearing. Calm. Patient. Dressed in red. He sits under the Old Tree for a whole season and learns its song. He learns that its heart makes clean whatever it touches. He learns that such a heart, cut out and refined, would give a core no cultivator has ever held.*

*He comes back with three hundred disciples.*

*They cut. They burn. The tree screams for nine days. The last gardeners stand in front of it, and that is where they die. Then the man in red reaches into the hole, takes the heart out with his own two hands, smiles, and walks away to found a Sect.*

*And across the whole forest, across the mountains, under every village, the roots stop drinking. The poison comes back up. All of it: everything that has died here in ten thousand years.*

The log goes dark.

You sit in the gardeners' chair with the memory seed going cold in your hands, and you understand. This world had its cure once. It was a tree. Forty gardeners planted it and asked nothing, and for six hundred years it made the Qi clean. Then the Crimson Lotus killed it, let the old poison back up, and opened a shop. The pills. The herbs. The cores. The Sect itself. Four centuries of selling the cure by the mouthful, where the Old Tree gave it away.`,
        choices: [{ text: '...', to: 'log_reaction' }],
    },
    log_reaction: {
        id: 'log_reaction', title: 'What Now', art: 'ship_bridge', place: `${PIN} — the Patient Root`,
        text: (g) => `Nobody speaks for a while.

${g.flags.hall_song ? 'You think of the scorched ring in the hall, the calm voice giving orders. Now you know whose voice it was.\n\n' : ''}${ya(g) ? '"So," Ya says at last, very carefully, which is how you know she\'s furious. "The red men killed the singing tree. And then made everybody eat their pills to fix what *they* broke." She looks at the spear in her hand as though she\'s only just remembered what it\'s for. "I want to bite something. I want to bite something *a lot*."\n\n' : ''}Mei Lin is crying without making any sound at all, the way people in Ashfall have learned to cry. "My father," she says. "My father went up that road to be *honoured*."

${LOG_LOOK[ykShape(g)] || LOG_LOOK.cat}

What do you do.`,
        choices: [
            { text: 'Rage. Let it out. All of it. Somebody should scream for this place, and the gardeners can\'t.', do: (g) => { g.flags.reaction = 'rage'; bumpRel(g, 'Ya', 4, 2); return ['You scream until the whole bridge rings. Faintly, the ship hums with you.']; }, to: 'log_comfort' },
            { text: 'Grieve. Quietly. These were your people, and they were *gardeners*.', do: (g) => { g.flags.reaction = 'grief'; bumpRel(g, 'Mei Lin', 4, 3); return []; }, to: 'log_comfort' },
            { text: 'Think. A heart can be cut out. Which means a heart can be put back.', check: { skill: 'GU', dc: 4, band: 'challenging' }, do: (g) => { g.flags.reaction = 'study'; g.flags.regrow_idea = true; return ['Somewhere aboard there is a seed-vault. No ship was ever grown without one.']; }, failDo: (g) => { g.flags.reaction = 'study'; return ['The thought gets away from you. It will be back.']; }, to: 'log_comfort' },
            { text: (g) => LOG_HOLD[ykShape(g)] || LOG_HOLD.cat, do: (g) => { g.flags.reaction = 'silent'; bumpRel(g, 'Yuki', 3, 0); return []; }, to: 'log_comfort' },
        ],
    },
    // v0.11.129 (CS1, HC; Fable's MAIN): all four fall asleep with the human
    log_comfort: {
        id: 'log_comfort', title: (g) => (trio(g) >= 2 && both(g) ? 'Between Them' : 'Afterwards'), art: (g) => (trio(g) >= 2 && both(g) ? 'trio' : likesYa(g) && ya(g) ? 'ya_close' : 'mei_lin'), place: `${PIN} — the Patient Root`,
        enter: (g) => trioStep(g, 3),
        text: (g) => {
            if (logTrio(g)) { // v0.11.124 (NF1, LC1): the same test as Yuki's path beat, which skips this branch
                return `Later — you don't know how much later — you're sitting on the floor of the bridge with your back against a gardener's chair, and you are not alone.

Mei Lin is on your left, her head on your shoulder, her hand wound into your sleeve as though you might float away. Ya is on your right, sprawled, one leg over yours, her fingers moving slowly through your hair the way she'd gentle a spooked animal. Neither of them is talking. For once in her life, Ya isn't talking.

At some point, without looking, Mei Lin reaches across you and finds Ya's hand, and holds it.

Ya goes very still. Then she grins at the ceiling — that sharp, delighted, dangerous grin — and doesn't say a single word about it, which is, you suspect, the most restraint she has ever shown about anything.

${LOG_JUDGE[ykShape(g)] || LOG_JUDGE.cat}

It's not a beginning, exactly. But it's not nothing. You fall asleep there, ${byForm(g, 'the three of you', 'the three of you', 'all four of you')}, in the bridge of a dead ship, and it is the one night on this world that you don't dream about falling.`;
            }
            if (likesYa(g) && ya(g) && !likesMei(g)) {
                return `Ya does not do comfort. You learn this now. What she does is fold down cross-legged right in front of you, her knees against yours, and glare until you look at her.

"Listen," she says. "Your people. They planted a tree in a bad place, and the bad place went good. Six hundred years of it." A finger jabs you in the chest. "That's *good hunting*. That's the best hunting I ever heard of. Don't you dare be sad about them."

"I'm allowed to be a little sad."

"A *little*." She thinks it over. Then she leans in, bites your ear, not gently, and sits back with a satisfied look. "There. Now you're thinking about something else."

She isn't wrong.`;
            }
            if (likesMei(g)) {
                return `Mei Lin gets down on the floor of the bridge next to you and says nothing comforting; she knows better than that. She takes your hand in both of hers and holds it, hard enough to hurt a little.

"Your people did that," she says, when she can. "Planted a tree that made the whole world better. And mine... mine have spent four hundred years paying the men who killed it." Her voice breaks on the last word. "How am I supposed to go home and kneel to them now?"

"You don't," you say. "Neither of us does. Not any more."

She leans her forehead on your shoulder and leaves it there. ${ya(g) ? 'From across the bridge Ya watches you both, chin on her knees, with an odd considering look, and for once keeps her mouth shut.' : ''}`;
            }
            return `Nobody comforts anybody, exactly. That's not what this is.

${ya(g) ? 'Ya prowls the bridge touching things she shouldn\'t, angry and restless. ' : ''}Mei Lin sits with her back to the wall and her knees up, staring at nothing. You sit in Wren Aldous's chair with the hearth-log in your lap${ykPath(g) ? '' : `, ${LOG_SEAT[ykShape(g)] || LOG_SEAT.cat}`}, and the ship hums faintly to itself, the way the very old hum to themselves when they think nobody's listening.

After a while Mei Lin says, "Thank you for bringing us here. I think I'd rather know."

"Me too," you say. You mean it. It's the worst thing you've ever learned, and you'd rather know.`;
        },
        choices: [{ text: 'Go back up to the hall. You all need air, even dead air.', time: 60, to: 'heart_hub' }],
    },

    /* ---------- nights inside the trunk ---------- */
    // v0.11.129 (CS1, HC; Fable's MAIN): the human in the heap
    heart_camp: {
        dayKey: (g) => `heart_camp:${hcPool(g)}`, // v0.11.152 (RV1, M2; Fable's review): the heap, Ya's watch and Mei Lin's watch each count their own nights, so the first heap night is the heap's first text
        id: 'heart_camp', title: 'Camp in the Hollow', art: (g) => (trio(g) >= 3 ? 'trio_fire' : 'night_watch'), place: PIN,
        enter: (g) => { const n = eatBest(g, { fire: true }); return n.length ? [`Supper. ${n[0]}`] : []; },
        text: (g) => {
            // v0.11.173 (P6A, NC): the night no longer numbered by the act's day ("Night 16 of the expedition's end")
            const mood = !g.flags.log_heard
                ? 'The fire is small, the hall is enormous, and above the firelight the dark simply keeps going up.'
                : !g.flags.guardian ? 'Nobody has slept much since the log. The singing behind the bone door is faint and it never stops, and having heard it once, you cannot go back to not hearing it.' : g.flags.guardian === 'lost' ? 'Behind the bone door the guardian still sings its one broken line, to nobody. You know what it is asking now, and you crawled round the question.' // v0.11.173 (RV1, L5): after the crawl the guardian still sings
                    : 'The singing has stopped. In four hundred years the tree has not been this quiet.';
            return `Night inside the Old Tree, the place the whole expedition was for. ${mood}

${byDay(g, HC_POOLS[hcPool(g)], `heart_camp:${hcPool(g)}`)}`; // v0.11.152 (owner pick RP1, RM6; Fable's): a new paragraph each night (up to four); RV1 (M2): each version counted on its own
        },
        choices: [
            { text: 'Talk with Mei Lin by the fire.', show: (g) => !g.flags[`hc_mei@${day(g)}`], do: (g) => { g.flags[`hc_mei@${day(g)}`] = true; bumpRel(g, 'Mei Lin', 3, likesMei(g) ? 3 : 1); return [DR_HC_MEI(g)]; }, to: 'heart_night' },
            { text: 'Climb up to Ya\'s ledge.', show: (g) => ya(g) && !g.flags[`hc_ya@${day(g)}`], do: (g) => { g.flags[`hc_ya@${day(g)}`] = true; bumpRel(g, 'Ya', 3, likesYa(g) ? 4 : 1); return [DR_HC_YA(g)]; }, to: 'heart_night' },
            { text: 'Sit up with Yuki and the hearth-log.', show: (g) => hasItem(g, 'hearth_log'), do: (g) => { bumpRel(g, 'Yuki', 2, 0); return [DR_HC_LOG(g)]; /* v0.11.126 (NQ1): by her form, Fable's; v0.11.136 (NC1): by the day */ }, to: 'heart_night' },
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'heart_night' }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
            { text: 'Sleep.', to: 'heart_night' },
        ],
    },
    heart_night: {
        dayKey: (g) => `heart_night:${g.flags.heart_night_roll <= 2 ? 'knock' : both(g) && ya(g) && trio(g) >= 2 && g.flags.heart_night_roll >= 4 ? 'whisper' : 'quiet'}`, // v0.11.135 (NT1, EV1); RN2 (L1): the whispering night its own key, as its text's own branch
        id: 'heart_night', title: 'Night Inside the Tree', art: 'night_watch', place: PIN,
        enter: (g) => { g.flags.heart_night_roll = d6(g); return []; },
        text: (g) => {
            const r = g.flags.heart_night_roll;
            if (both(g) && ya(g) && trio(g) >= 2 && r >= 4) {
                return byDayLast(g, [`In the small hours you are woken by whispering.

Ya and Mei Lin, at the embers, heads close together. The words don't reach you. What reaches you is Mei Lin's "No," sharp, and some while after it a second "*No*," less sharp, and then a sound that is a laugh or a sob, and then Ya's voice, low and rough, going on and on with a hunter's patience.

When you get your eyes properly open, Mei Lin is looking straight at you across the fire. She does not look away. Ya, at her side, winks.

As a scientist, you conclude that this is data you are not yet equipped to interpret, and you go back to sleep.`, // v0.11.152 (owner pick RP1, RM7; Fable's): the 2nd and 3rd whispering nights
                    `The whispering again, in the small hours. You know the two voices now without opening your eyes.

Tonight it is Mei Lin who does most of it, low and quick, like a woman reading out a list of objections she has had ready for some days. Ya answers each one with a grunt. You catch "my mother", twice, and "the ancestors", once, and Ya saying, quite clearly, that the ancestors are dead and can mind their own fire. A silence. Then the laugh, the real one, strangled at once against somebody's shoulder.

When you risk a look, Ya has Mei Lin's hand flat between both of hers and is studying it, the way she studies a track. Mei Lin is letting her.

You enter it under preliminary results, and shut your eyes before either of them can catch you taking notes.`,
                    `Whispering, in the small hours. By now you would be disappointed to sleep through it.

Nobody says "No" tonight. Mei Lin is asking questions, short ones, in the level voice she keeps for the price of herbs, and Ya is answering them at length and, from the sound of it, with gestures. Once Mei Lin says, "*All* of us?" and Ya says, "It's warmer," as if that settled it. For Ya, it does.

Neither of them pretends this time when you open your eyes. Mei Lin meets your look across the embers, chin up, pink to the ears and holding her ground. Ya doesn't wink. She only grins, slowly, like someone whose snare has at last been walked into.

The sample, you note, has become aware of the observer. You go back to sleep regardless. It takes longer than it did before.`,
                    // RV1 (L3; Fable's): the 4th whispering night (all four Heart nights rolling it)
                    `Whispering, in the small hours. It has stopped being whispering, strictly. Nobody is troubling to keep it down.

The questions are finished. Tonight Mei Lin is laying down terms, one at a time, in the voice of a woman counting out coin, and Ya is agreeing to each of them before it is fully out. You catch "not in front of the village", and "my mother is never to hear of it", and Ya's "Yes. Yes. Also yes." Then Mei Lin, more quietly: "And you don't laugh at me." A pause. "Only a little," Ya says, which from Ya is an oath.

You open your eyes, since there is no longer any point in not. Mei Lin is already looking at you, pink to the ears, chin up. "He's awake," she says. "He is *always* awake," says Ya, and shifts over by the embers, leaving a space that is not accidental.

The observer, you note, has been written into the experiment. The method will have to be revised. You close the notebook, in a manner of speaking, and do not get back to sleep for some time.`], 'heart_night:whisper');
            }
            if (r <= 2) {
                return byDayLast(g, ['In the night, from deep inside the trunk, three knocks: slow, deliberate, a knuckle on a door. After them, nothing. Yuki growls at the dark for an hour. Nobody sleeps well.',
                    `The knocking again, in the dead middle of the night. Three, slow, from deep in the trunk. This time you are awake for it, and you time the gaps, and the gaps are exactly even. Wood settling does not keep time. Yuki sits facing the sound until morning, ears forward. Nobody sleeps well.`,
                    `Three knocks, deep in the trunk. You have started waiting for them, which is worse than being woken by them. You cannot tell whether they come from the same place as before; the hall gives nothing away. Yuki doesn't growl this time. She looks at the dark, and then at you, and then at the dark. Nobody sleeps well.`,
                    `The three knocks come just when you have decided that tonight they won't. Slow, even, deep in the trunk. Before you can think better of it you knock back, once, on the floor, with one knuckle. Nothing answers. Yuki gives you a long look. Nobody sleeps well, and you least of all.`], 'heart_night:knock'); // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the 4th (ST5)
            }
            return byDayLast(g, [`The night is quiet, and the top of the hall is very far off in the dark. ${g.flags.ship_found ? 'Somewhere under you the ship hums in its sleep, and if you listen hard enough you can almost hear forty gardeners breathing.' : 'Somewhere under you a warmth you have no name for yet comes up through the floor, and if you listen hard enough the dead wood almost seems to breathe.'}`,
                `A quiet night. The embers tick. Far up in the dark a flake of dead bark lets go and takes its time landing. ${g.flags.ship_found ? 'Under the floor the ship keeps up its one low note' : 'Under the floor something you can\'t put a name to yet keeps up one low note'}, and you fall asleep trying to work out the key.`,
                `Nothing happens in the night, and you lie awake for a while appreciating it. The hall holds the fire's warmth better than a dead thing should. ${g.flags.ship_found ? 'Below you the ship hums on, patient, like a house with one lamp left burning for somebody who is late.' : 'Below you the sap you smelled at the doorway is still moving, slow and patient, like a house with one lamp left burning for somebody who is late.'}`,
                `A quiet night, and by now you can tell the hall's quiet from the forest's: this one has a roof on it. The fire settles. Somebody turns over. Under the floor the one low note goes on, and for once you don't try to name it. You let it count you to sleep.`], 'heart_night:quiet'); // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the 4th (ST5)
        },
        choices: [{ text: 'Morning.', to: 'heart_morning' }],
    },
    heart_morning: {
        id: 'heart_morning', title: (g) => `Day ${day(g)}`, art: 'heart_hall', place: PIN,
        enter: wake,
        text: (g) => byDayLast(g, [(g) => `The cracks let the grey in. Mei Lin is ${trio(g) >= 3 ? 'wound up with Ya, the pair of them asleep, and you lie where you are for a minute with no wish to move' : 'up already, and has set the first cup of tea by your bedroll, since the cook, she says, eats last'}. ${ya(g) ? 'Ya turns up from somewhere she had no business, holding something she had no business with, and offers you half.' : ''}

${late(g) && !g.flags.seed ? 'You feel it this morning as you would feel weather coming: the tree is tired of waiting. Today.' : ''}`, (g) => `The light in the cracks goes from black to grey without stopping at any colour on the way. Mei Lin is ${trio(g) >= 3 ? `asleep with her face in Ya's shoulder and one hand closed in your sleeve, and you spend a while working out how to get up without waking either of them, and then don't get up` : `up before you again, sorting yesterday's herbs into rows on a flat root as if the tree might inspect them`}. ${ya(g) ? `Ya's first act of the day is to hold something up for you to smell. You decline. She eats it.` : ''}

${late(g) && !g.flags.seed ? `The hall feels different this morning. Like a held breath. Whatever the tree has been waiting for, it is done waiting. Today.` : ''}`, (g) => `Morning, by the evidence: a thin grey line down each crack, and dust turning in it. Mei Lin is ${trio(g) >= 3 ? `still asleep under Ya's arm, frowning, as if being comfortable were a thing she would have to answer for later, and you stay where you are and let her` : `awake and combing her hair by feel, the ivory pin held in her teeth`}. ${ya(g) ? `Ya, with her eyes still shut, informs the hall that she dreamt of elk, and that she holds all of you responsible for there not being any.` : ''}

${late(g) && !g.flags.seed ? `You wake already knowing it, the way you know rain is coming: the tree has run out of patience. Today.` : ''}`, // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the 4th morning (ST5)
            (g) => `Grey light again, arriving down the cracks with the punctuality of something that kept this up for four centuries with nobody in. Mei Lin is ${trio(g) >= 3 ? `awake before Ya for once, lying quite still under her arm with her eyes open, like a woman who has found that she doesn't mind and is checking the result; when she sees you looking she shuts them, too late` : `up already, washing her face at the spring water with her sleeves pinned back, and humming something under her breath that stops the moment she sees you are awake`}. ${ya(g) ? `Ya has been up for hours, by her own account, and has laid out four dead things in a row by the fire, in order of size, to be praised.` : ''}

${late(g) && !g.flags.seed ? `The dust hangs in the light this morning without turning, as if the hall had stopped breathing to listen. The tree is finished with waiting. Today.` : ''}`], 'heart_morning'),
        choices: [{ text: 'Up.', to: 'heart_hub' }],
    },

    /* ---------- the guardian ---------- */
    guardian_approach: {
        id: 'guardian_approach', title: 'The Bone Door', art: 'guardian', place: `${PIN} — the heart-chamber door`,
        text: (g) => byDay(g, [(g) => `Below the ship, beyond the place where the roots plait themselves into a single huge braid, there is a door. It isn't grown wood. It is bone: white, ribbed, beautiful, sung into its shape by someone who had your gift and many times your skill.

It opens as you come up to it. Behind it lies a chamber like the inside of a seed, and in the chamber something is getting to its feet.

It has the size of a house and the outline of a gardener. Grown wood for flesh. Bone for joints. A head like a smooth white seed-pod, with no face on it anywhere. Moss hangs off its arms. Where a heart would be, its chest has a hollow, and in the hollow, faint, burns a green light of its own: the last of its sap, kept like a lamp.

And it sings. It is the note that came out of the doorway the night you slept in the roots: broken now, and going round and round, like a lullaby whose singer has lost every line except one.

*Who comes,* it sings, in your language. *Who. Who comes to the heart.*

${g.flags.guardian_lost_day ? 'It remembers you. As you come in, the note goes harder and stranger.' : ''}`, (g) => `The braid of roots again, and the bone door at the end of it. You notice the hinges this time: there aren't any. Whoever sang it grew the door and the frame as one piece and taught it to open. You have a doctorate, and you could not do that.

It opens as you come near. In the seed-shaped chamber the guardian is already on its feet, moss swinging from its arms, the smooth white head turned toward the doorway. The green in the hollow of its chest is no brighter than before. No dimmer, either.

The note hasn't changed. One line of a lullaby, worn down to the groove.

*Who comes,* it sings. *Who. Who comes to the heart.*

${g.flags.guardian_lost_day ? `It knows you. The note climbs when it sees you, harder and stranger, like a question it has already heard you answer wrong.` : ''}`, (g) => `Down the braid of roots once more. You could walk it with your eyes shut, and your Convergence very nearly does: it has been leaning toward this door since the gate, the way a compass leans.

The door opens. The chamber breathes out air that smells of green wood and old dust. The guardian stands where it always stands, a gardener the size of a house with no face to read, and you find you are reading it anyway. The way it holds its arms. It is standing over the glow in its chest like someone shielding a candle.

Four hundred years of the same question, put to an empty doorway.

*Who comes,* it sings, in your language. *Who. Who comes to the heart.*

${g.flags.guardian_lost_day ? `It remembers you. The note goes hard and strange at the sight of you, and the moss on its arms shivers.` : ''}`], 'guardian_approach'),
        choices: [
            { text: 'Answer it. In the old way: with your Convergence, with the song.', show: (g) => !g.flags.guardian_talked, check: { skill: 'Convergence Use', dc: 7, bonus: (g) => (g.flags.gate_listened ? 1 : 0) + (g.flags.hall_song ? 1 : 0) + (g.flags.ship_woke ? 1 : 0) + (g.flags.reaction === 'grief' ? 1 : 0) + (g.james.realm >= 1 ? 1 : 0), band: 'major' }, qi: 6, time: 30, to: 'guardian_calmed', fail: 'guardian_half' },
            { text: 'Fight it. Whatever it was, it\'s mad now, and it stands between you and the heart.', combat: guardianFight, to: 'guardian_won' },
            { text: 'Back away. Not yet.', show: (g) => !late(g), time: 20, to: 'heart_hub' },
        ],
    },
    guardian_half: {
        id: 'guardian_half', title: 'Half a Song', art: 'guardian', place: `${PIN} — the heart-chamber`,
        enter: (g) => { g.flags.guardian_talked = true; g.flags.guardian_weak = true; return ['It falters. Part of it is listening. Not a large enough part.']; },
        text: (g) => `You sing to it. Not out loud — with the Convergence, the way children on your world sing to the house-trees at night so they'll grow straight. *Home. Grove. Gardener. Rest.*

For a breath it stops. The broken note stutters. The green in its chest flares, and you feel it *recognise* the shape of the words, the shape of you.

Then the madness closes back over it like water over a stone. *Who comes,* it sings, louder, wrong. *WHO COMES TO THE HEART.*

But it's slower now. Uncertain. Part of it is still listening.${byForm(g, '', " So is Yuki, ears forward, quite still. She heard that song in the same grove you did.", " So is Yuki, ears forward, quite still. \"I know that one,\" she says, to nobody. \"They sang it over both of us.\"")}

${ya(g) ? '"That was pretty," Ya says, levelling her spear. "Now duck."' : '"James," Mei Lin says, very quietly. "Move."'}`,
        choices: [{ text: 'Fight it — gently, if that\'s a thing.', combat: guardianFight, to: 'guardian_won' }], // v0.11.131 (XB2, FL; RC2, L4; Fable's MAINs): the great root-kin listens too
    },
    guardian_calmed: {
        id: 'guardian_calmed', title: 'Rest', art: 'guardian', place: `${PIN} — the heart-chamber`,
        enter: (g) => { g.flags.guardian_talked = true; g.flags.guardian = 'calmed'; return []; },
        text: (g) => `You sing to it. *Home. Grove. Gardener. Rest.*

The broken note stops.

In the green light the guardian holds perfectly still. Then the great seed-pod head tips slowly to one side, as Yuki's does while she decides whether you are worth hearing out.

*Gardener?* it sings, unsure.

*Gardener,* you sing back. *From the Ninth Grove's children's children's children. Late. Very late. I'm sorry.*

The blank head stays turned on you while it thinks that over. Then it kneels, all the house-sized weight of it, slow as a hill settling, and lays its great wooden hands on the chamber floor with the palms up. The lamp in its chest, the last of its own sap, burns low.

*Keep it,* it sings, and the blank head turns from you toward the dark behind it, where the chamber floor falls away, and the voice is going, and you understand that it has held itself awake four hundred years for exactly this. *Keep it. Plant it. I am so tired.*

It goes still. Moss settles onto its shoulders like snow. It does not move again.

${ya(g) ? 'Ya takes off her hat (she has a hat; you could not say since when) and holds it against her heart. Nobody ever taught her that. She simply does it.' : 'Mei Lin bows to it: the full formal bow, the one you have only ever seen given to the Sect. Then she bows again, lower.'}`,
        choices: [{ text: 'Go to the heart.', time: 10, to: 'heart_core' }],
    },
    guardian_won: {
        id: 'guardian_won', title: 'The Guardian Falls', art: 'guardian', place: `${PIN} — the heart-chamber`,
        enter: (g) => { g.flags.guardian = 'won'; addItem(g, 'ship_shard', 2); return ['+2 Hull-shards, out of the guardian\'s broken frame.']; },
        text: (g) => `It goes down as a tree goes down: slowly, and then all at once, and the chamber floor jumps when it lands.

It lies there a little while with the green still alight in its chest. ${g.flags.guardian_weak ? 'And then, because you sang to it, because some part of it was listening, the broken note changes. It smooths out. For three heartbeats it is the whole lullaby, with every line remembered.' : 'The broken note goes on, softer, and softer again.'}

Then it stops.

You are breathing hard. You are bleeding from somewhere. You have done what you came to do, and you feel like a man who has killed a dog for guarding its own house.

${ya(g) ? '"It was good," says Ya quietly, standing over it. She has no higher praise. "It was a good fighter. It didn\'t want to stop."' : '"It was guarding them," Mei Lin says. "All this time."'}

"Yes," you say. "And now it doesn't have to."`,
        choices: [{ text: 'Go to the heart.', time: 10, to: 'heart_core' }],
    },
    guardian_lost: {
        id: 'guardian_lost', title: 'Thrown Out', art: 'heart_hall', place: PIN,
        enter: (g) => { g.flags.guardian_lost_day = day(g); g.flags.guardian_losses = (g.flags.guardian_losses || 0) + 1; g.james.hp = Math.max(3, g.james.hp); return []; },
        text: (g) => `The guardian does not kill you. It could have. That part you work out later.

It only picks you up, as you would lift a cat out of a place the cat should not be, carries you back out through the bone door, sets you down in the root-galleries, and goes in again. The door shuts.

${ya(g) ? 'Ya is the one who gets you up the shaft, by the collar, cursing steadily in whichever language comes to hand. "Next time," she says, "you let me stab it *first*."' : 'Mei Lin is the one who gets you up the shaft, white in the face and saying nothing at all, and nothing is worse than anything she might have said.'}

Tomorrow you can try again. Or you can look for another way to the heart. There is always another way. It is just never a pleasant one.`,
        choices: [{ text: 'Back to the hall.', time: 60, to: 'heart_hub' }],
    },
    guardian_bypass: {
        id: 'guardian_bypass', title: 'The Long Way', art: 'heart_roots', place: `${PIN} — the deep roots`,
        enter: (g) => { g.flags.guardian = 'lost'; g.james.hp = Math.max(1, g.james.hp - Math.ceil(jamesHpMax(g) * 0.4)); g.james.qi = Math.max(0, g.james.qi - 10); return ['The crawl through the root takes its price: about 40% of your HP and 10 Qi.']; },
        text: (g) => `There is another way. Listen hard enough and the tree tells you: one root among the thousand plaited into the heart-chamber is still hollow, and just wide enough to take a body.

Crawling it takes an hour. It is the worst hour of your life, and your life includes the lab. You come out filthy and bleeding, behind the guardian, which stands with its back to you and its blank head toward the bone door, singing its one broken note to no one.

It doesn't turn round. Perhaps it doesn't know you are there. Or perhaps, you think, it knows perfectly well, and after all this time it is tired, and has made up its mind not to look.

${ya(g) ? 'Ya comes out of the root behind you, spits a mouthful of dust, and says, "Never again. I mean it. Do that to me one more time and I will marry you, just to make your life hell."' : 'Mei Lin comes out of the root behind you, and it is a good while before she says anything at all.'}

Yuki is in the chamber before any of you, without a mark on her. You do not ask.`,
        choices: [{ text: 'Go to the heart. Quietly.', time: 10, to: 'heart_core' }],
    },

    /* ---------- the heart and the seed ---------- */
    heart_core: {
        id: 'heart_core', title: 'The Heart', art: 'heart_core', place: `${PIN} — the heart-chamber`,
        text: (g) => `The heart-chamber is round and high, and it smells, impossibly, of green. The Old Tree's heart sat in the middle of it. Only the hollow it was cut from is left: black, scorched, four hundred years cold.

But at the bottom, coming up through the burnt wood like a shoot through a charred stump, there is something small and pale and *alive*.

A sliver of heartwood, no longer than your hand. It gives off a faint green glow, and it hums; and when your Convergence touches it, it does more than answer. It *sings*. The whole song, every line of it, as the Hearth Trees at home sing when you walk by them in the morning.

The tree kept a piece of itself back. Hidden. Waiting. Four centuries it held on to one seed, for somebody who would know what it was.

${g.flags.regrow_idea ? 'A heart can be cut out. A heart can be put back. On the bridge it was a thought; here it is a fact.\n\n' : ''}${ya(g) ? 'Ya, for once, has nothing to say at all. ' : ''}Mei Lin's hand has gone to her mouth again. Yuki walks to the edge of the hollow, looks down at the seed, then up at you, and her eyes are very bright.`,
        choices: [
            { text: 'Take the seed-sliver. Gently. The way they taught you.', do: (g) => { addItem(g, 'seed_sliver', 1); g.flags.seed = true; return ['+1 Seed-sliver. It settles in your palm as if your palm were where it had been waiting all along.']; }, to: 'heart_core_after' },
            { text: 'Ask Mei Lin to take it. It was her people\'s tree too.', do: (g) => { addItem(g, 'seed_sliver', 1); g.flags.seed = true; g.flags.mei_carried_seed = true; bumpRel(g, 'Mei Lin', 8, 3); return ['+1 Seed-sliver. Mei Lin wraps it in her own sleeve and carries it out against her heart, and her hand does not leave it once.']; }, to: 'heart_core_after' },
        ],
    },
    heart_core_after: {
        id: 'heart_core_after', title: 'Seed', art: 'seed', place: `${PIN} — the heart-chamber`,
        enter: (g) => { if (!hasItem(g, 'ship_shard')) addItem(g, 'ship_shard', 1); return []; },
        text: (g) => `As the seed comes up out of the hollow, something lets go through the whole of the tree.

It reaches you through your feet: one slow settling, like a breath held too long and finally let out. Far overhead, dust pours from the cracks in grey curtains. ${g.flags.guardian === 'calmed' ? 'Behind you the moss on the kneeling guardian stirs once, in a wind that is not there.' : ''}

Dead is no longer the word for it, you realise. Not quite. The word is *finished*. It has done the thing it was kept back to do.

You look down at the seed-sliver. Warm. Singing. Wanting, very badly, to be put in the ground.

"Ashfall," says Mei Lin. She is not asking.

"Ashfall," you agree. "And after that, we'll see what it can do."

${g.flags.reaction === 'rage' ? 'And after that, you think, somebody in red is going to have a very bad day.' : ''}`,
        choices: [{ text: 'Back up to the hall.', time: 60, to: 'heart_hub' }],
    },
    ht_leave: {
        id: 'ht_leave', title: 'Leaving the Old Tree', art: 'heart_gate', place: P,
        enter: (g) => {
            const out = [];
            if (day(g) < 19) {
                g.minutes = 17 * 1440 + 21 * 60;
                sleepUntil(g, 6);
                out.push('You stay until dawn on Day 19: resting, mapping the galleries, saying goodbye. HP and Qi full.');
            } else if (hour(g) >= 9) {
                sleepUntil(g, 6);
                out.push('You wait for the next dawn and leave with it. HP and Qi full.');
            }
            return out;
        },
        text: (g) => `You come out through the split at dawn ${g.flags.guardian === 'calmed' ? 'and the roots are full of birds. You can\'t remember hearing birds here before.' : 'into roots exactly as silent as they were when you came.'}

Behind you, the Old Tree stands as it has stood these four hundred years, grey and enormous and dead. But you look back at it from the last of the roots, and your Convergence brushes it one last time, and from somewhere very deep, very faint, you get a single note.

Not a broken one. A whole one. Held, like someone humming as they fall asleep.

${trio(g) >= 3 ? 'Ya walks in front, Mei Lin behind, and you in the middle, and every so often one of them reaches back or forward and touches your arm, as if checking you\'re still there.' : ya(g) ? 'Ya leads, as always, not looking back. Mei Lin walks beside you.' : 'Mei Lin walks beside you.'} ${byForm(g, 'Yuki rides on your shoulder with her tail wrapped round your neck.', 'Yuki pads at your side with her tail hooked round your wrist.', 'Yuki walks at your shoulder with her tail wrapped round your wrist.')}

In your hand, or near your heart, the seed sings all the way.`,
        choices: [{ text: 'Home. To Ashfall.', to: 'rt_start' }],
    },
};
