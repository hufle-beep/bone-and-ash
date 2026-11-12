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
const HALL_WHEN = [['Night. The shafts of light are gone; the hall is lit by your fire and by nothing else.', 'Morning light slides down the cracks like water down a well.', 'Midday. The grey shafts have turned almost white.', 'Evening. The light up in the cracks is going red.'],
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
    "She makes you sit on the very edge, then laughs when you hold on. Then she tells you, very seriously, how many days she followed you through the forest before she decided you were interesting. It was all of them.",
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
    (g) => byForm(g, "You sit with your back to a warm wall and Yuki in your lap and listen to the water, and for half an hour nobody needs anything from you.", "You sit with your back to a warm wall and Yuki's head in your lap and listen to the water, and for half an hour nobody needs anything from you.", "You sit with your back to a warm wall and Yuki's shoulder against yours and listen to the water, and for half an hour nobody needs anything from you."),
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
    human: 'Yuki sits down facing the three of you, human, her tail tucked round her feet, like a small judge in a black dress. "About time," she says aloud, very primly.',
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
    intro: 'Things come out of the grey wood: hollow-grubs the size of dogs, pale as old candle wax, mouths full of splinters.',
    enemies: [{ name: 'Hollow-grub', hp: 5, dc: 2, atk: 3, dmg: 4 }, { name: 'Hollow-grub (swollen)', hp: 5, dc: 2, atk: 3, dmg: 4 }],
});
const rootThings = (g) => encounter(g, {
    id: 'root_husks', tier: 'region', win: 'roots_won', lose: 'roots_lost', flee: 'heart_hub',
    intro: 'Down here, where the light never came, the rot has had four hundred years to grow ambitious. It has arms now. Several.',
    enemies: [{ name: 'Root-husk', hp: 6, dc: 2, atk: 2, dmg: 4 }, { name: 'Hollow-grub', hp: 4, dc: 2, atk: 2, dmg: 4 }],
});
const guardianFight = (g) => encounter(g, {
    id: 'guardian', tier: 'boss', win: 'guardian_won', lose: 'guardian_lost',
    intro: 'The guardian unfolds: grown wood and old white bone, three times your height, and somewhere inside it a voice that is still, faintly, singing.',
    enemies: [{ name: 'The Gardeners\' Guardian', hp: g.flags.guardian_weak ? 10 : 12, dc: 3, atk: 3, dmg: 5, dr: 1, moods: true }], // v0.11.113 (DA1, HD): its moods (game.js moodOf)
});

/** Morning inside the trunk (also handles the sleep). */
function wake(g) {
    const out = [];
    if (hour(g) < 6 || hour(g) >= 16) { sleepUntil(g, 6); out.push('Slept until 06:00. HP and Qi full.'); }
    const e = eatBest(g);
    out.push(e.length ? `Breakfast. ${e[0]}` : 'No breakfast. Ya offers you something from her belt-pouch. You decline. She looks offended. You eat it.');
    return out;
}

export const HEART = {
    ht_start: {
        id: 'ht_start', title: 'The Heart', art: 'heart_gate', place: P,
        text: (g) => `Day sixteen. The forest stops.

Not gradually. One moment there are black trunks and grey moss and the sound of things eating other things; the next, a clearing half a kilometre across where nothing grows at all, and in the middle of it, the tree.

You have seen it from the ridge. You have felt it through the soles of your feet for days. None of that was preparation. It goes up past the point where your neck agrees to bend, grey and smooth and enormous, a cliff of dead wood with roots like collapsed bridges. There are no leaves. There haven't been for a very long time.

Your Convergence sings to it and nothing sings back. That's the worst part. You're used to Hearth Trees that answer.

${ya(g) ? '"Huh," says Ya, very quietly, which is the quietest you have ever heard her say anything. Then, louder: "Bigger dead than I remember. Okay. Fine. Love it."' : ''}
Mei Lin says nothing at all. She has a hand on Yuki's back, and Yuki is letting her.`,
        choices: [{ text: 'Cross the clearing.', time: 30, to: 'heart_gate' }],
    },
    heart_gate: {
        id: 'heart_gate', title: 'The Split', art: 'heart_gate', place: P,
        text: (g) => `At the base of the trunk the wood has split, top to bottom, a crack wide enough to drive a cart through. It isn't rot. The edges are too clean, too *straight*. Something cut its way in here, a long time ago, and the tree spent its last centuries trying to close the wound and never managed.

Cold air breathes out of the crack. It smells of dry wood, old dust and, under that, very faintly, something you haven't smelled since the lab: sap. Living sap.

${g.flags.gate_listened ? 'You heard it already: a single note, far down. Not dead. Not quite.' : ''}`,
        choices: [
            { text: 'Put both hands on the trunk and listen with your Convergence.', show: (g) => !g.flags.gate_listened, check: { skill: 'Convergence Use', dc: 3, band: 'challenging' }, time: 20, do: (g) => { g.flags.gate_listened = true; return ['Far down — very far — one note, held, like someone humming in their sleep.']; }, failDo: (g) => { g.flags.gate_listened = true; return ['Silence. Grey, total, patient. If anything is down there, it isn\'t talking to you yet.']; }, to: 'heart_gate' },
            { text: 'Walk the trunk\'s base first. Look for anything that isn\'t tree.', show: (g) => !g.flags.sect_marks, time: 60, do: set('sect_marks'), to: 'heart_gate_marks' },
            { text: 'Go in.', time: 15, to: 'heart_hall' },
        ],
    },
    heart_gate_marks: {
        id: 'heart_gate_marks', title: 'Tool Marks', art: 'heart_gate', place: P,
        text: (g) => `It takes an hour to walk a third of the way round. On the far side you find them: grooves cut in the grey wood, each as long as you are tall. Axe-work, and something else — burn-scars in neat rows, as if fire had been *drawn* across the bark with a brush.

And above the deepest groove, carved small and precise and filled with something that was once red, a lotus.

Mei Lin stops dead. Her face goes very still, in the way the faces in Ashfall go still when the collectors come up the road.

"That's the founder's seal," she says. "The first Sect Master. It's on the tribute post. It's on everything." A pause. "They told us the Old Tree died of age."

${ya(g) ? 'Ya spits on the lotus. Then, after a moment\'s thought, she spits on it again, harder. Nobody tells her not to.' : 'Yuki sniffs the carving, sneezes, and walks away from it with her tail very straight.'}`,
        choices: [{ text: 'Back to the split.', time: 30, to: 'heart_gate' }],
    },
    heart_hall: {
        id: 'heart_hall', title: 'The Hall', art: 'heart_hall', place: PIN,
        text: (g) => `Inside, the tree is hollow, and the hollow is a cathedral.

Light comes down in thin grey shafts from cracks high above. The walls rise in ridges and galleries, grown, not built — you can see where living wood flowed around itself to make ledges, stairs, alcoves. Your people grow houses like this. Your people grow *cities* like this. This was somebody's home.

The floor is soft with a thousand years of fallen dust. Your footsteps make no sound. Your Convergence touches the walls and gets back a texture like an old photograph: the shape of what used to be here, and nothing of what it felt like.

${ya(g) ? 'Ya has her spear up and her back to a wall. "I don\'t like it," she announces to the room. "I want that written down. Ya does not like it."' : ''}
"It's beautiful," Mei Lin whispers, and then, angrily, as if the word offended her: "It's a *grave*."

Both, you think. Mostly the second.`,
        choices: [{ text: 'Make this the base. Look around.', time: 30, to: 'heart_hub' }],
    },

    /* ---------- the hub inside the trunk ---------- */
    heart_hub: {
        id: 'heart_hub', title: 'Inside the Old Tree', art: 'heart_hall', place: PIN,
        text: (g) => {
            const h = hour(g);
            const w = byDayLast(g, HALL_WHEN, 'heart_hub'); // ST5; RV1 (CL): a stay past five days keeps the fifth
            const when = h < 6 || h >= 20 ? w[0] : h < 11 ? w[1] : h < 16 ? w[2] : w[3];
            const where = !g.flags.roots_done ? 'The hall goes down as well as up: there are root-galleries below, black and deep.' : !g.flags.ship_found ? 'Below the roots, you know, there is something that isn\'t tree.' : !g.flags.log_heard ? 'The ship is waiting. So is whatever it has to say.' : !g.flags.guardian ? 'Deeper than the ship, past a door of grown bone, something is still singing in its sleep.' : !g.flags.seed ? 'The heart-chamber is open now.' : 'You have what you came for. The tree knows it, too.';
            return `${when}

${where}

${pantry(g)} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''}${late(g) && !g.flags.seed ? '\n\nThe tree has been patient for four hundred years. It is not going to be patient much longer: whatever you are going to do here, do it.' : ''}`;
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
            { text: 'Cultivate: one sit, 10 Qi.', show: (g) => active(g) && !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%. The hall is very quiet while you sit.`, ...r.xp] : []; }, to: 'heart_hub' },
            { text: 'Rest an hour.', show: (g) => active(g) && (!late(g) || g.james.hp < jamesHpMax(g)), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest, back against grey wood that was once alive.']), to: 'heart_hub' },
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
            { text: 'Read the last living ring, the scorched one. Carefully.', check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 40, do: (g) => { g.flags.hall_song = true; return ['Fire, drawn with a brush. Hands — many hands. And a voice, very calm, giving orders. You will know that voice if you ever hear its echo.']; }, failDo: (g) => { g.flags.hall_song = true; g.james.hp -= 2; return ['It burns you back. Not much. Enough. −2 HP.']; }, to: 'heart_hub' },
            { text: 'Take your hands off the floor. Enough for now.', do: set('hall_song'), to: 'heart_hub' },
        ],
    },

    ring_chambers: {
        id: 'ring_chambers', title: 'The Ring-Chambers', art: 'heart_hall', place: `${PIN} — the galleries`,
        text: (g) => `Off the galleries, the tree grew rooms: round chambers, one inside the next like the rings of the trunk itself. Shelves grown from the walls. Hollows the shape of sleeping bodies. A long table, a single piece of wood, worn smooth along one edge where a thousand years of elbows rested.

The gardeners lived here. Before the end, they lived here.

In the third ring, something has eaten the shelves. In the fourth, something is still eating them. You hear it before you see it: a dry, patient chewing.

${ya(g) ? '"Bugs," Ya says, with deep satisfaction, and shifts her grip on her spear. "Finally. Something in here I understand."' : ''}`,
        choices: [
            { text: 'Clear them out.', combat: (g) => husks(g, 'ring_won', 'ring_lost'), to: 'ring_won' },
            { text: 'Seal the fourth ring with a wall of bone and leave them to it.', qi: 5, check: { skill: 'Convergence Use', dc: 4 }, time: 40, do: (g) => { g.flags.rings_done = true; return ['A white wall, floor to ceiling. The chewing goes on behind it, disappointed.']; }, fail: 'ring_forced', to: 'heart_hub' },
        ],
    },
    ring_forced: {
        id: 'ring_forced', title: 'The Ring-Chambers', art: 'heart_hall', place: `${PIN} — the galleries`,
        text: (g) => `The bone wall comes out thin, and they come through it like it's paper.${byForm(g, '', " Yuki has the gallery behind you, all of it, wall to wall. *I can't turn round in here,* says the bond. *So we are going forward.*", '')}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fine.', combat: (g) => husks(g, 'ring_won', 'ring_lost'), to: 'ring_won' }],
    },
    ring_won: {
        id: 'ring_won', title: 'Quiet Rooms', art: 'heart_hall', place: `${PIN} — the galleries`,
        enter: (g) => { g.flags.rings_done = true; addItem(g, 'ship_shard', 1); return ['+1 Hull-shard, from a shelf the grubs couldn\'t chew.']; },
        text: (g) => `When it's over, the fourth ring is quiet and full of pale bits of grub. Behind the shelf they were eating, grown into the wall, there's a hollow with a cup in it — a plain wooden cup, a thousand years old, with a name burned into the base in a script you learned before you could walk.

*Tamsin.*

You stand there holding it for longer than you'd like anyone to see. ${ya(g) ? 'Ya sees. She doesn\'t say anything. She just bumps your shoulder with hers, hard, on the way past, which may be the kindest thing she has ever done.' : 'Mei Lin sees. She doesn\'t ask.'}`,
        choices: [{ text: 'Put the cup back where Tamsin left it.', time: 20, to: 'heart_hub' }],
    },
    ring_lost: {
        id: 'ring_lost', title: 'Retreat', art: 'heart_hall', place: `${PIN} — the galleries`,
        enter: (g) => { g.flags.rings_done = true; return []; },
        text: (g) => `You back out of the rings with grubs on your heels and splinters in your arms, and ${ya(g) ? 'Ya' : 'Mei Lin'} drops a shelf on the doorway behind you. It holds. Mostly.${byForm(g, '', " Yuki is already out: she backed the whole length of the gallery ahead of you, because the rings were grown for gardeners and there is nowhere in them to turn four hundred pounds of cat round. She sits down and starts on the splinters in her forepaw.", '')}

"We'll leave those rooms to the bugs," ${ya(g) ? 'Ya says, picking a splinter out of her own forearm with her teeth' : 'Mei Lin says, white-faced'}. Nobody argues.`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; RB2 (RL): Fable's redraft after the review
        choices: [{ text: 'Back to the hall.', time: 30, to: 'heart_hub' }],
    },

    heart_spring: {
        id: 'heart_spring', title: 'The Spring', art: 'hot_spring', place: `${PIN} — the spring`,
        enter: (g) => { g.flags.spring_found = true; g.flags[`spring@${day(g)}`] = true; return []; },
        text: (g) => byDay(g, [(g) => `Down one gallery, where the floor dips, there's water: a pool in a basin of grown wood, fed by a seep somewhere in the walls, warm from something deep below. Steam lies on the surface like breath on a mirror.

It's clean. Your omnitool says so, twice, as if it can't believe it either. The only clean water you have found on this whole world, and it's inside the corpse of a Hearth Tree.

${ya(g) ? `Ya has her clothes off and is in it before you've finished reading the analysis. "Warm!" she reports, delighted, from the middle of the pool. "Come in. Both of you. I don't bite. I bite a *little*."` : 'Mei Lin kneels and puts her hands in it and just leaves them there.'}
${ya(g) ? (g.flags.romance ? 'Mei Lin goes red to the ears, looks at you, looks at Ya, and says something in a dialect you don\'t know that is clearly not a blessing.' : 'Mei Lin turns her back on the pool with enormous dignity. Her ears are red.') : ''}`, (g) => `The spring is where you left it, which on this world you no longer take for granted. Steam on the surface. The basin of grown wood has a lip worn smooth along one side, at sitting height, and it takes you a moment to understand that forty gardeners wore it smooth.

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
        text: (g) => `High up, where the galleries end, the inside of the trunk has a hole in it the size of a house. Not a crack — a *hole*, cut in a perfect circle, its edges scorched black. This is where they came in from above, after they'd made the split below. This is where they reached in.

Around the rim, in the same red lotus script, words have been carved. Mei Lin reads them aloud, slowly, her finger following each character.

"*Here the Crimson Lotus took the heart of the Old Tree, and from it refined the first true core, and from that core the first pill of ascension. Here the Sect was born. Let every disciple who stands here know that Heaven rewards the bold.*"

She stops reading. Her finger stays on the last character.

"They teach that line," she says. "In the outer sect. On the first day. My father would have learned it." She takes her hand away from the wall as if it's hot. "I thought it was about courage."

${ya(g) ? '"It\'s about stealing," says Ya. "Everything\'s about stealing, with them."' : ''}`,
        choices: [{ text: 'Go back down. You\'ve seen enough of their poetry.', time: 40, do: (g) => { bumpRel(g, 'Mei Lin', 3, 0); return [`Mei Lin comes down behind you without a word, and halfway down she takes hold of the back of your coat and doesn't let go until the floor. "He believed it," she says at the bottom. "My father. He stood somewhere like that and believed it." You don't say anything. You've learned when not to.`]; }, to: 'heart_hub' }],
    },

    /* ---------- the roots and the ship ---------- */
    heart_roots: {
        id: 'heart_roots', title: 'The Root-Galleries', art: 'heart_roots', place: `${PIN} — the roots`,
        text: (g) => `The floor of the hall slopes down into the roots, and the roots go down into the dark.

They are galleries too, once you're inside them: tunnels the width of corridors, ribbed and smooth, running down and down at a steady angle like the tree was *trying* to lead you somewhere. Your omnitool's light is small and white and lonely. ${ya(g) ? 'Ya walks right behind you, close enough that you can feel her breathing, and if anyone suggests she is scared she will kill them.' : 'Mei Lin walks right behind you, close enough that you can feel her breathing.'}

Halfway down, the tunnel drops away into a shaft. Below it, faintly, your Convergence picks up something that isn't tree. Something *grown*, yes — but grown to a plan. Straight lines. Right angles. Your people's kind of right angles.

Your heart starts going very fast.`,
        choices: [
            { text: 'Climb down the shaft on the root-ridges.', check: { skill: 'GU', dc: 4 }, fly: "You step off the edge and ride the shaft's slow Qi down, then go back up for whoever can't. Yuki drifts past, inspecting the ridges nobody used." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 60, to: 'roots_dark', fail: 'roots_fall' },
            { text: 'Sing a ladder of bone down the side of the shaft.', qi: 6, check: { skill: 'Convergence Use', dc: 4 }, time: 40, to: 'roots_dark', fail: 'roots_fall' },
        ],
    },
    roots_fall: {
        id: 'roots_fall', title: 'The Shaft', art: 'heart_roots', place: `${PIN} — the roots`,
        enter: (g) => { g.james.hp = Math.max(1, g.james.hp - 4); return ['You fall the last few metres. −4 HP.']; },
        text: (g) => `Something gives — a ridge, a rung, your grip — and you do the last bit the fast way. You land on your back in a thousand years of soft dust, and lie there looking up at ${ya(g) ? 'Ya\'s face at the top of the shaft, which is laughing so hard she has to hold on to the wall' : 'Mei Lin\'s face at the top of the shaft, white and furious'}.

"*Alive*," you report. It comes out higher than you'd like.

${byForm(g, "Yuki climbs down after you, perfectly, and sits on your chest, and looks at you.", "Yuki climbs down after you, perfectly, all four hundred pounds of her, and puts one paw on your chest, and looks at you.", "Yuki climbs down after you, perfectly, in a dress, and stands over you, and looks at you.")}`,
        choices: [{ text: 'Get up. Wait for the others. Go on.', time: 20, to: 'roots_dark' }],
    },
    roots_dark: {
        id: 'roots_dark', title: 'Something Moving', art: 'heart_roots', place: `${PIN} — the deep roots`,
        text: `The bottom of the shaft opens into a root-chamber, and the chamber is not empty. The walls are lumpy with something that isn't wood — pale, waxy, *growing* — and as your light passes over it, some of the lumps unfold.

The rot didn't just eat the tree. It moved in.`,
        choices: [
            { text: 'Fight your way through.', combat: rootThings, to: 'roots_won' },
            { text: 'Run for the far tunnel and don\'t stop.', check: { skill: 'GU', dc: 5 }, fly: "You don't run. You go over, close under the ceiling, passengers and all. The lumps unfold at the place your feet should have been." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 20, do: (g) => { g.flags.roots_done = true; return ['You make it. Barely. Something closes on the air behind your heel.']; }, fail: 'roots_caught', to: 'ship_wreck' },
        ],
    },
    roots_caught: {
        id: 'roots_caught', title: 'Caught', art: 'heart_roots', place: `${PIN} — the deep roots`,
        text: `Not fast enough. Something wraps your ankle and the floor comes up to meet you.`,
        choices: [{ text: 'Then fight.', combat: rootThings, to: 'roots_won' }],
    },
    roots_won: {
        id: 'roots_won', title: 'The Way Down', art: 'heart_roots', place: `${PIN} — the deep roots`,
        enter: (g) => { g.flags.roots_done = true; return []; },
        text: (g) => `The root-chamber goes quiet. ${ya(g) ? 'Ya stands on the biggest husk, spear still in it, chest heaving, grinning like she\'s been given a present. "*That* I liked," she says. "Do they have more? Ask them if they have more."' : 'Mei Lin stands over the last husk with her herb-knife out and an expression you\'ve only seen once before, on the herb slope, the first morning.'}

Beyond the chamber, the tunnel turns, and the walls change. They stop being root. They start being *hull*.`,
        choices: [{ text: 'Go on.', time: 20, to: 'ship_wreck' }],
    },
    roots_lost: {
        id: 'roots_lost', title: 'Dragged', art: 'heart_roots', place: `${PIN} — the root-galleries`, // v0.11.130 (YB1, LL; Fable's MAINs): the great root-kin's clause (no Ya) and line
        enter: (g) => { g.james.hp = Math.max(1, Math.ceil(g.james.hp)); return []; },
        text: (g) => `You go down under the husks, and the next thing you know is being hauled up the shaft by the collar of your coat, ${ya(g) ? 'Ya swearing above you in three languages, one of which you\'re fairly sure she invented on the spot' : byForm(g, 'Mei Lin and Yuki between them, which should not be physically possible', "Mei Lin calling the handholds down from the lip of the shaft in a voice that is very nearly steady", "Mei Lin and Yuki between them, Yuki in a black dress that has not picked up so much as one husk, which should not be physically possible") /* v0.11.131 (XB2, RH; Fable's MAIN): the human's own */}.${byForm(g, '', " The collar is in Yuki's teeth. She climbs the shaft backwards with you swinging under her chin like a kitten, and when she sets you down at the top there are husk-lines raked down both her flanks, which neither of you mentions.", '')}

You'll have to go back down. You both know it. Just — not right now.`,
        choices: [{ text: 'Back to the hall. Lick your wounds.', time: 60, to: 'heart_hub' }],
    },

    ship_wreck: {
        id: 'ship_wreck', title: 'The Seed-Ship', art: 'ship_wreck', place: `${PIN} — beneath the roots`,
        enter: (g) => { g.flags.roots_done = true; g.flags.ship_found = true; return []; },
        text: (g) => `It's a ship.

Of course it's a ship. Some part of you has known since the ridge. But knowing and standing in front of it are different things, and you stand there for a long time.

A seed-ship. Your people's design — older than anything you've seen outside a museum, but unmistakable: the long teardrop hull grown from a single seed, the ribs curving like the inside of a shell, the hatches that open the way leaves open. It came down hard. The front third is crushed. The tree grew around it afterwards and held it, the way a hand holds something it's afraid of dropping.

On the hull, in the script you learned before you could walk, there's a name.

*PATIENT ROOT.*

"James," says Mei Lin, carefully. "You're crying."

"I'm aware," you say. "Give me a minute. I'm a scientist. This is a lot of data."

${ya(g) ? 'Ya doesn\'t say anything. She sits down on a root next to you and puts her shoulder against yours and waits, which you would never have guessed she knew how to do.' : ''}`,
        choices: [
            { text: 'Put your hand on the hull.', time: 20, to: 'ship_touch' },
            { text: 'Go straight in. Find the bridge.', time: 30, to: 'ship_bridge' },
        ],
    },
    ship_touch: {
        id: 'ship_touch', title: 'Hull', art: 'ship_wreck', place: `${PIN} — the Patient Root`,
        text: (g) => `The hull is warm.

Not warm like the spring. Warm like *skin*. Your Convergence goes into it the way it goes into your own bones, without asking, and the ship — the ship *answers*. Faintly. Drowsily. Like someone half-woken in the night, asking who's there.

*Hello,* you think at it, idiotically. *I'm from home.*

You can't tell if it understands. But somewhere deep in the hull, something shifts its weight, and the hatch nearest you opens like a leaf in the morning.

Mei Lin makes a small sound, a sharp intake of breath. ${ya(g) ? 'Ya makes a much larger one and has her spear pointed at the hatch before it\'s finished opening. "Did it do that on purpose? I want to know if it did that on purpose."' : ''}

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
        text: `It doesn't play like a recording. It plays like a memory that isn't yours, pouring in.

*A woman's voice, tired and steady. Head Gardener Wren Aldous, of the seed-ship Patient Root, out of the Ninth Grove. Forty souls aboard. Gardeners, all of them — soil people, seed people. Nobody aboard has ever held a weapon.*

*The drive failed. They don't know why. They fell for a long time. They came down here.*

*"The Qi on this world is sick,"* she says. You can feel her hands, sore from work. *"Something died here, long before us — a lot of somethings. It's in the air, the water, the soil. The locals breathe it. It makes them hard, and short-lived, and hungry. We can't fix the drive. So we'll do what we know."*

*They planted a Hearth.*

The memory shows you: forty people on their knees in a black clearing, singing a seed into the ground. A green shoot. Then a sapling. Then, faster than anything should grow, a tree — reaching up and out, its roots going down and down into the poisoned earth, drinking it, turning it over, making it clean.`,
        choices: [{ text: 'Keep listening.', time: 30, to: 'ship_log2' }],
    },
    ship_log2: {
        id: 'ship_log2', title: 'Hearth-Log: The Song', art: 'ship_log', place: `${PIN} — the Patient Root`,
        text: `*Centuries pass in the log like seasons. Wren is old, then gone. Others speak. Their voices change; the song doesn't.*

*The Hearth grows and grows. Its roots reach under the whole forest, then under the mountains, then further. Everywhere they reach, the Qi comes up clean. Animals come back. People come back. The locals call it the Old Tree. They bring it gifts. They sing to it, badly, in a language it doesn't speak, and it sings back anyway.*

*"We're not going home,"* a young voice says, three hundred years in. *"Nobody's coming. But I think — I think this is better. I think this is what we were for."*

There are children in the memory now. Local children and gardener children, not really distinguishable after the first few generations. The forest is green. The Blackroot isn't black.

Beside you, Mei Lin has her hand over her mouth.

"The Old Tree," she says through her fingers. "My grandmother's grandmother's songs. They're about *this*."`,
        choices: [{ text: 'You know what comes next. Keep listening.', time: 30, to: 'ship_log3' }],
    },
    ship_log3: {
        id: 'ship_log3', title: 'Hearth-Log: The Lotus', art: 'ship_log', place: `${PIN} — the Patient Root`,
        enter: (g) => { g.flags.log_heard = true; return []; },
        text: (g) => `*Four hundred years ago. The last voice in the log is the tree itself — not words, just feeling, and you have never wanted so badly not to feel something.*

*A man comes to the clearing. Calm. Patient. Dressed in red. He sits under the Old Tree for a whole season and learns its song. He learns that its heart purifies everything it touches. He learns that a heart like that, cut out and refined, would make a core no cultivator had ever held.*

*He comes back with three hundred disciples.*

*They cut. They burn. The tree screams for nine days. The last gardeners stand in front of it and die there. And the man in red reaches into the hole and takes the heart out with his own hands, and smiles, and walks away to found a Sect.*

*And the roots, all across the forest, all across the mountains, under every village — stop drinking. The poison comes back up. All of it. Everything that died here for ten thousand years.*

The log goes dark.

You sit in the gardeners' chair with the cold memory seed in your hands, and you understand. You're not the outlier. You never were. You're just the first person in four hundred years to breathe this world's air the way it was *supposed* to be breathed. The world is the outlier. The world is a poisoned well, and the Crimson Lotus poisoned it, and then sold everyone the cure.`,
        choices: [{ text: '...', to: 'log_reaction' }],
    },
    log_reaction: {
        id: 'log_reaction', title: 'What Now', art: 'ship_bridge', place: `${PIN} — the Patient Root`,
        text: (g) => `Nobody speaks for a while.

${g.flags.hall_song ? 'You think of the scorched ring in the hall, the calm voice giving orders. Now you know whose voice it was.\n\n' : ''}${ya(g) ? '"So," Ya says at last, very carefully, which is how you know she\'s furious. "The red men killed the singing tree. And then made everybody eat their pills to fix what *they* broke." She looks at the spear in her hand as though she\'s only just remembered what it\'s for. "I want to bite something. I want to bite something *a lot*."\n\n' : ''}Mei Lin is crying without making any sound at all, the way people in Ashfall have learned to cry. "My father," she says. "My father went up that road to be *honoured*."

${LOG_LOOK[ykShape(g)] || LOG_LOOK.cat}

What do you do.`,
        choices: [
            { text: 'Rage. Let it out. All of it. Somebody should scream for this place, and the gardeners can\'t.', do: (g) => { g.flags.reaction = 'rage'; bumpRel(g, 'Ya', 4, 2); return ['You scream until the bridge rings with it. The ship, faintly, hums along.']; }, to: 'log_comfort' },
            { text: 'Grieve. Quietly. These were your people, and they were *gardeners*.', do: (g) => { g.flags.reaction = 'grief'; bumpRel(g, 'Mei Lin', 4, 3); return []; }, to: 'log_comfort' },
            { text: 'Think. A heart can be cut out. Which means a heart can be put back.', check: { skill: 'GU', dc: 4, band: 'challenging' }, do: (g) => { g.flags.reaction = 'study'; g.flags.regrow_idea = true; return ['Somewhere in this ship there is a seed-vault. There is always a seed-vault.']; }, failDo: (g) => { g.flags.reaction = 'study'; return ['The thought slips away from you. It\'ll come back.']; }, to: 'log_comfort' },
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

It's not a beginning, exactly. But it's not nothing. You fall asleep there, ${byForm(g, 'the three of you', 'the three of you', 'all four of you')}, in the bridge of a dead ship, and for the first time since the lab you don't dream about falling.`;
            }
            if (likesYa(g) && ya(g) && !likesMei(g)) {
                return `Ya doesn't do comfort. You find that out. What she does instead is sit down right in front of you, cross-legged, knees touching yours, and glare at you until you look at her.

"Listen," she says. "Your people. They planted a tree in a bad place, and it made the bad place good. For six hundred years." She jabs a finger into your chest. "That's *good hunting*. That's the best hunting I ever heard of. Don't you dare be sad about them."

"I'm allowed to be a little sad."

"A *little*." She considers. Then she leans in and bites your ear, not gently, and sits back looking satisfied. "There. Now you're thinking about something else."

She's not wrong.`;
            }
            if (likesMei(g)) {
                return `Mei Lin sits down next to you on the floor of the bridge and doesn't say anything comforting, because she knows better. She takes your hand instead and holds it in both of hers, hard enough to hurt a little.

"Your people did that," she says after a long time. "Planted a tree that made the whole world better. And mine — mine have spent four hundred years paying the people who killed it." Her voice cracks on the last word. "How am I supposed to go home and kneel to them now?"

"You don't," you say. "Neither of us does. Not any more."

She puts her forehead against your shoulder and stays there. ${ya(g) ? 'Across the bridge, Ya watches the two of you with an odd, thoughtful expression, chin on her knees, and for once keeps her mouth shut.' : ''}`;
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
            const n = day(g);
            const mood = !g.flags.log_heard
                ? 'The fire is small and the hall is huge, and the dark at the top of it goes up forever.'
                : !g.flags.guardian ? 'Since the log, nobody sleeps much. The singing from behind the bone door is faint, and constant, and once you\'ve heard it you can\'t not hear it.' : 'The singing has stopped. The tree is quieter than it has been in four hundred years.';
            return `Night ${n} of the expedition's end, inside the Old Tree. ${mood}

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
                return byDayLast(g, [`You wake in the small hours to whispering.

Ya and Mei Lin, by the embers, their heads close. You can't hear the words. You hear Mei Lin say "No," sharply, and then, a while later, less sharply, "*No*," and then something that is either a laugh or a sob, and then Ya's low, rough voice going on and on, patient as a hunter.

When you open your eyes properly, Mei Lin is looking at you across the fire. She doesn't look away. Ya, beside her, winks.

You decide, as a scientist, that this is data you are not yet equipped to interpret, and go back to sleep.`, // v0.11.152 (owner pick RP1, RM7; Fable's): the 2nd and 3rd whispering nights
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
                return byDayLast(g, ['In the night, something knocks three times from somewhere deep in the trunk — slow, deliberate, like a knuckle on a door. Then nothing. Yuki growls at the dark for an hour. Nobody sleeps well.',
                    `The knocking again, in the dead middle of the night. Three, slow, from deep in the trunk. This time you are awake for it, and you time the gaps, and the gaps are exactly even. Wood settling does not keep time. Yuki sits facing the sound until morning, ears forward. Nobody sleeps well.`,
                    `Three knocks, deep in the trunk. You have started waiting for them, which is worse than being woken by them. You cannot tell whether they come from the same place as before; the hall gives nothing away. Yuki doesn't growl this time. She looks at the dark, and then at you, and then at the dark. Nobody sleeps well.`,
                    `The three knocks come just when you have decided that tonight they won't. Slow, even, deep in the trunk. Before you can think better of it you knock back, once, on the floor, with one knuckle. Nothing answers. Yuki looks at you for a long time. Nobody sleeps well, and you least of all.`], 'heart_night:knock'); // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the 4th (ST5)
            }
            return byDayLast(g, ['The night is quiet. The dark at the top of the hall is very far away. Somewhere below you, the ship hums in its sleep, and if you listen hard enough, you can almost hear forty gardeners breathing.',
                `A quiet night. The embers tick. Far up in the dark a flake of dead bark lets go and takes a long time to land. Under the floor the ship keeps up its one low note, and you fall asleep trying to work out the key.`,
                `Nothing happens in the night, and you lie awake for a while appreciating it. The hall holds the fire's warmth better than a dead thing should. Below you the ship hums on, patient, like a house with one lamp left burning for somebody who is late.`,
                `A quiet night, and by now you can tell the hall's quiet from the forest's: this one has a roof on it. The fire settles. Somebody turns over. Under the floor the one low note goes on, and for once you don't try to name it. You let it count you to sleep.`], 'heart_night:quiet'); // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the 4th (ST5)
        },
        choices: [{ text: 'Morning.', to: 'heart_morning' }],
    },
    heart_morning: {
        id: 'heart_morning', title: (g) => `Day ${day(g)}`, art: 'heart_hall', place: PIN,
        enter: wake,
        text: (g) => byDayLast(g, [(g) => `Grey light comes down the cracks. Mei Lin is ${trio(g) >= 3 ? 'tangled with Ya, both of them still asleep, and you lie there for a minute not wanting to move' : 'already up, making tea from the spring water'}. ${ya(g) ? 'Ya appears from somewhere she shouldn\'t have been, with something she shouldn\'t have, and offers you half of it.' : ''}

${late(g) && !g.flags.seed ? 'You can feel it this morning, the way you can feel weather: the tree is tired of waiting. Today.' : ''}`, (g) => `The light in the cracks goes from black to grey without stopping at any colour on the way. Mei Lin is ${trio(g) >= 3 ? `asleep with her face in Ya's shoulder and one hand closed in your sleeve, and you spend a while working out how to get up without waking either of them, and then don't get up` : `up before you again, sorting yesterday's herbs into rows on a flat root as if the tree might inspect them`}. ${ya(g) ? `Ya's first act of the day is to hold something up for you to smell. You decline. She eats it.` : ''}

${late(g) && !g.flags.seed ? `The hall feels different this morning. Like a held breath. Whatever the tree has been waiting for, it is done waiting. Today.` : ''}`, (g) => `Morning, by the evidence: a thin grey line down each crack, and dust turning in it. Mei Lin is ${trio(g) >= 3 ? `still asleep under Ya's arm, frowning, as if being comfortable were a thing she would have to answer for later, and you stay where you are and let her` : `awake and combing her hair by feel, the ivory pin held in her teeth`}. ${ya(g) ? `Ya, with her eyes still shut, informs the hall that she dreamt of elk, and that she holds all of you responsible for there not being any.` : ''}

${late(g) && !g.flags.seed ? `You wake already knowing it, the way you know rain is coming: the tree has run out of patience. Today.` : ''}`, // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the 4th morning (ST5)
            (g) => `Grey light again, arriving down the cracks with the punctuality of something that kept this up for four hundred years with nobody in. Mei Lin is ${trio(g) >= 3 ? `awake before Ya for once, lying quite still under her arm with her eyes open, like a woman who has found that she doesn't mind and is checking the result; when she sees you looking she shuts them, too late` : `up already, washing her face at the spring water with her sleeves pinned back, and humming something under her breath that stops the moment she sees you are awake`}. ${ya(g) ? `Ya has been up for hours, by her own account, and has laid out four dead things in a row by the fire, in order of size, to be praised.` : ''}

${late(g) && !g.flags.seed ? `The dust hangs in the light this morning without turning, as if the hall had stopped breathing to listen. The tree is finished with waiting. Today.` : ''}`], 'heart_morning'),
        choices: [{ text: 'Up.', to: 'heart_hub' }],
    },

    /* ---------- the guardian ---------- */
    guardian_approach: {
        id: 'guardian_approach', title: 'The Bone Door', art: 'guardian', place: `${PIN} — the heart-chamber door`,
        text: (g) => byDay(g, [(g) => `Deeper than the ship, past where the roots knot together into one great braid, there's a door. Not grown wood. Bone — white, ribbed, beautiful, sung into shape by somebody with your gift and far more skill.

It opens as you come near. Behind it, in a chamber like the inside of a seed, something is standing up.

It is the size of a house and the shape of a gardener: grown wood for flesh, bone for joints, a head like a smooth white seed-pod with no face at all. Moss hangs from its arms. In the middle of its chest, where a heart would be, there's a hollow, and in the hollow, faintly, something glows green.

And it's singing. The same note you heard at the gate. Broken, now, and repeating, the way a lullaby repeats when the singer has forgotten every line but one.

*Who comes,* it sings, in your language. *Who comes. Who comes to the heart.*

${g.flags.guardian_lost_day ? 'It remembers you. The note goes harder and stranger when it sees you.' : ''}`, (g) => `The braid of roots again, and the bone door at the end of it. You notice the hinges this time: there aren't any. Whoever sang it grew the door and the frame as one piece and taught it to open. You have a doctorate, and you could not do that.

It opens as you come near. In the seed-shaped chamber the guardian is already on its feet, moss swinging from its arms, the smooth white head turned toward the doorway. The green in the hollow of its chest is no brighter than before. No dimmer, either.

The note hasn't changed. One line of a lullaby, worn down to the groove.

*Who comes,* it sings. *Who comes. Who comes to the heart.*

${g.flags.guardian_lost_day ? `It knows you. The note climbs when it sees you, harder and stranger, like a question it has already heard you answer wrong.` : ''}`, (g) => `Down the braid of roots once more. You could walk it with your eyes shut, and your Convergence very nearly does: it has been leaning toward this door since the gate, the way a compass leans.

The door opens. The chamber breathes out air that smells of green wood and old dust. The guardian stands where it always stands, a gardener the size of a house with no face to read, and you find you are reading it anyway. The way it holds its arms. It is standing over the glow in its chest like someone shielding a candle.

Four hundred years of the same question, put to an empty doorway.

*Who comes,* it sings, in your language. *Who comes. Who comes to the heart.*

${g.flags.guardian_lost_day ? `It remembers you. The note goes hard and strange at the sight of you, and the moss on its arms shivers.` : ''}`], 'guardian_approach'),
        choices: [
            { text: 'Answer it. In the old way: with your Convergence, with the song.', show: (g) => !g.flags.guardian_talked, check: { skill: 'Convergence Use', dc: 7, bonus: (g) => (g.flags.gate_listened ? 1 : 0) + (g.flags.hall_song ? 1 : 0) + (g.flags.ship_woke ? 1 : 0) + (g.flags.reaction === 'grief' ? 1 : 0) + (g.james.realm >= 1 ? 1 : 0), band: 'major' }, qi: 6, time: 30, to: 'guardian_calmed', fail: 'guardian_half' },
            { text: 'Fight it. Whatever it was, it\'s mad now, and it stands between you and the heart.', combat: guardianFight, to: 'guardian_won' },
            { text: 'Back away. Not yet.', show: (g) => !late(g), time: 20, to: 'heart_hub' },
        ],
    },
    guardian_half: {
        id: 'guardian_half', title: 'Half a Song', art: 'guardian', place: `${PIN} — the heart-chamber`,
        enter: (g) => { g.flags.guardian_talked = true; g.flags.guardian_weak = true; return ['It hesitates. Something in it is listening. Not enough of it.']; },
        text: (g) => `You sing to it. Not out loud — with the Convergence, the way children on your world sing to the house-trees at night so they'll grow straight. *Home. Grove. Gardener. Rest.*

For a moment it stops. The broken note stutters. The green in its chest flares, and you feel it *recognise* the shape of the words, the shape of you.

Then the madness closes back over it like water over a stone. *Who comes,* it sings, louder, wrong. *WHO COMES TO THE HEART.*

But it's slower now. Uncertain. Part of it is still listening.${byForm(g, '', " So is Yuki, ears forward, quite still. She heard that song in the same grove you did.", '')}

${ya(g) ? '"That was pretty," Ya says, levelling her spear. "Now duck."' : '"James," Mei Lin says, very quietly. "Move."'}`,
        choices: [{ text: 'Fight it — gently, if that\'s a thing.', combat: guardianFight, to: 'guardian_won' }], // v0.11.131 (XB2, FL; RC2, L4; Fable's MAINs): the great root-kin listens too
    },
    guardian_calmed: {
        id: 'guardian_calmed', title: 'Rest', art: 'guardian', place: `${PIN} — the heart-chamber`,
        enter: (g) => { g.flags.guardian_talked = true; g.flags.guardian = 'calmed'; return []; },
        text: (g) => `You sing to it. *Home. Grove. Gardener. Rest.*

The broken note stops.

The guardian stands very still in the green light. Then, slowly, the great seed-pod head tilts, the way Yuki's head tilts when she's deciding whether you're worth listening to.

*Gardener?* it sings, uncertain.

*Gardener,* you sing back. *From the Ninth Grove's children's children's children. Late. Very late. I'm sorry.*

It looks at you for a long time. Then it kneels — the whole house-sized weight of it, slow as a tree falling — and lays its great wooden hands on the floor of the chamber, palms up. The hollow in its chest is open. The green light is waiting.

*Keep it,* it sings, and its voice is fading, and you understand that it has been holding itself awake for four hundred years for exactly this. *Keep it. Plant it. I am so tired.*

It goes still. Moss settles on its shoulders like snow. It doesn't move again.

${ya(g) ? 'Ya takes off her hat — she has a hat? since when — and holds it over her heart. Nobody has ever taught her to do that. She just does it.' : 'Mei Lin bows to it, the full formal bow you\'ve only ever seen people give the Sect. Then she bows again, lower.'}`,
        choices: [{ text: 'Go to the heart.', time: 10, to: 'heart_core' }],
    },
    guardian_won: {
        id: 'guardian_won', title: 'The Guardian Falls', art: 'guardian', place: `${PIN} — the heart-chamber`,
        enter: (g) => { g.flags.guardian = 'won'; addItem(g, 'ship_shard', 2); return ['+2 Hull-shards from the guardian\'s broken frame.']; },
        text: (g) => `It comes down the way a tree comes down: slowly, then all at once, and the floor of the chamber shakes when it hits.

For a moment it lies there with the green still glowing in its chest. ${g.flags.guardian_weak ? 'And then — because you sang to it, because part of it was listening — the broken note changes. Smooths. Becomes, for three heartbeats, the whole lullaby, every line remembered.' : 'The broken note goes on, softer, softer.'}

Then it stops.

You're breathing hard. You're bleeding from somewhere. You did the thing you came to do and you feel like you've killed a dog that was only guarding the house.

${ya(g) ? '"It was good," Ya says, quietly, standing over it. That\'s the highest praise she has. "It was a good fighter. It didn\'t want to stop."' : '"It was guarding them," Mei Lin says. "All this time."'}

"Yes," you say. "And now it doesn't have to."`,
        choices: [{ text: 'Go to the heart.', time: 10, to: 'heart_core' }],
    },
    guardian_lost: {
        id: 'guardian_lost', title: 'Thrown Out', art: 'heart_hall', place: PIN,
        enter: (g) => { g.flags.guardian_lost_day = day(g); g.flags.guardian_losses = (g.flags.guardian_losses || 0) + 1; g.james.hp = Math.max(3, g.james.hp); return []; },
        text: (g) => `The guardian doesn't kill you. You understand that later. It could have.

It just picks you up — the way you'd pick up a cat that has got somewhere it shouldn't — and carries you back through the bone door, and puts you down in the root-galleries, and goes back inside, and the door closes.

${ya(g) ? 'Ya finds you there, swearing in three languages, and hauls you up the shaft by your collar. "Next time," she says, "you let me stab it *first*."' : 'Mei Lin finds you there and hauls you up the shaft, white-faced, saying nothing at all, which is worse than anything she could say.'}

You can try again tomorrow. Or you can find another way to the heart. There's always another way. It's just never a nice one.`,
        choices: [{ text: 'Back to the hall.', time: 60, to: 'heart_hub' }],
    },
    guardian_bypass: {
        id: 'guardian_bypass', title: 'The Long Way', art: 'heart_roots', place: `${PIN} — the deep roots`,
        enter: (g) => { g.flags.guardian = 'lost'; g.james.hp = Math.max(1, g.james.hp - Math.ceil(jamesHpMax(g) * 0.4)); g.james.qi = Math.max(0, g.james.qi - 10); return ['The root-crawl costs you: about 40% of your HP and 10 Qi.']; },
        text: (g) => `There is another way. The tree tells you, if you listen hard enough: a root, one of the thousand that braid into the heart-chamber, still hollow, just wide enough for a body.

It takes four hours to crawl it. It's the worst four hours of your life, including the lab. You come out filthy, bleeding, and on the wrong side of the guardian, which is standing with its back to you facing the bone door, still singing its one broken note to nobody.

It doesn't turn round. Maybe it doesn't know you're there. Maybe, you think, it does — and has decided, after four hundred years, that it's tired, and that it will just not look.

${ya(g) ? 'Ya comes out of the root after you, spits out a mouthful of dust, and says, "Never again. I mean it. If you ever do that to me again I will marry you just to make your life hell."' : 'Mei Lin comes out of the root after you and doesn\'t say anything at all for a long time.'}`,
        choices: [{ text: 'Go to the heart. Quietly.', time: 10, to: 'heart_core' }],
    },

    /* ---------- the heart and the seed ---------- */
    heart_core: {
        id: 'heart_core', title: 'The Heart', art: 'heart_core', place: `${PIN} — the heart-chamber`,
        text: (g) => `The heart-chamber is round and high and smells, impossibly, of green. In the middle, where the Old Tree's heart once sat, there's only the hollow it left — black, scorched, four hundred years cold.

But at the bottom of the hollow, grown up out of the scorched wood like a shoot out of a burnt stump, there's something small and pale and *alive*.

A sliver of heartwood. No longer than your hand. It glows faintly green and it hums, and when your Convergence touches it, it doesn't just answer. It *sings*. The whole song, every line, the way the Hearth Trees at home sing when you walk past them in the morning.

The tree kept a piece of itself. Hidden. Waiting. For four hundred years, it kept back one seed, for somebody who would know what it was.

${g.flags.regrow_idea ? 'A heart can be cut out. A heart can be put back. You thought it on the bridge; now you know it.' : ''}
${ya(g) ? 'Ya, for once, is completely silent.' : ''} Mei Lin puts her hand over her mouth again. Yuki walks to the edge of the hollow, looks down at the seed, and then up at you, and her yellow eyes are very bright.`,
        choices: [
            { text: 'Take the seed-sliver. Gently. The way they taught you.', do: (g) => { addItem(g, 'seed_sliver', 1); g.flags.seed = true; return ['+1 Seed-sliver. It settles into your palm like it\'s been waiting there for years.']; }, to: 'heart_core_after' },
            { text: 'Ask Mei Lin to take it. It was her people\'s tree too.', do: (g) => { addItem(g, 'seed_sliver', 1); g.flags.seed = true; g.flags.mei_carried_seed = true; bumpRel(g, 'Mei Lin', 8, 3); return ['+1 Seed-sliver. Mei Lin carries it out wrapped in her own sleeve, held against her heart, and doesn\'t let go of it once.']; }, to: 'heart_core_after' },
        ],
    },
    heart_core_after: {
        id: 'heart_core_after', title: 'Seed', art: 'seed', place: `${PIN} — the heart-chamber`,
        enter: (g) => { if (!hasItem(g, 'ship_shard')) addItem(g, 'ship_shard', 1); return []; },
        text: (g) => `When the seed comes up out of the hollow, something in the whole tree lets go.

You feel it through your feet: a long, slow settling, like a held breath going out at last. Somewhere far above, dust comes down the cracks in grey curtains. ${g.flags.guardian === 'calmed' ? 'Behind you, the kneeling guardian\'s moss stirs once in a wind that isn\'t there.' : ''}

It isn't dead any more, you realise. Not exactly. It's just *finished*. It did what it was kept back to do.

You look down at the seed-sliver. It's warm. It's singing. It wants, very badly, to be put in the ground.

"Ashfall," Mei Lin says. It isn't a question.

"Ashfall," you agree. "And then — we'll see what it can do."

${g.flags.reaction === 'rage' ? 'And then, you think, someone in red is going to have a very bad day.' : ''}`,
        choices: [{ text: 'Back up to the hall.', time: 60, to: 'heart_hub' }],
    },
    ht_leave: {
        id: 'ht_leave', title: 'Leaving the Old Tree', art: 'heart_gate', place: P,
        enter: (g) => {
            const out = [];
            if (day(g) < 19) {
                g.minutes = 17 * 1440 + 21 * 60;
                sleepUntil(g, 6);
                out.push('You stay until the Day 19 dawn: resting, mapping, saying goodbye. HP and Qi full.');
            } else if (hour(g) >= 9) {
                sleepUntil(g, 6);
                out.push('You leave at the next dawn. HP and Qi full.');
            }
            return out;
        },
        text: (g) => `You come out through the split at dawn ${g.flags.guardian === 'calmed' ? 'and the clearing is full of birds. You can\'t remember hearing birds here before.' : 'into a clearing that is exactly as silent as it was when you came.'}

Behind you, the Old Tree stands as it has stood for four hundred years, grey and enormous and dead. But you look back at it from the edge of the trees, and your Convergence brushes it one last time, and from somewhere very deep, very faint, you get a single note.

Not a broken one. A whole one. Held, like someone humming as they fall asleep.

${trio(g) >= 3 ? 'Ya walks in front, Mei Lin behind, and you in the middle, and every so often one of them reaches back or forward and touches your arm, as if checking you\'re still there.' : ya(g) ? 'Ya leads, as always, not looking back. Mei Lin walks beside you.' : 'Mei Lin walks beside you.'} ${byForm(g, 'Yuki rides on your shoulder with her tail wrapped round your neck.', 'Yuki pads at your side with her tail hooked round your wrist.', 'Yuki walks at your shoulder with her tail wrapped round your wrist.')}

In your hand, or near your heart, the seed sings all the way.`,
        choices: [{ text: 'Home. To Ashfall.', to: 'rt_start' }],
    },
};
