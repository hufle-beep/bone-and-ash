/**
 * ACT 1, PART 1 — "Fallout" (Days 8–10). The Crimson Lotus answers the tribute; Outer Elder Shen Qiu is named for
 * Day 21. Ashfall prepares. On Day 9 Ya walks out of the Blackroot. On Day 10 the expedition to the Old Tree is
 * planned, and at dawn on Day 11 it leaves (→ 'bl_start').
 */
import { addItem, eat, condense, advance, sleepUntil, jamesHpMax, hasItem, awardYukiFightXp, yukiForm, nightRest, nightTo } from '../core/game.js';
import { daily, markDaily, hour, day, eatBest, pantry, foodCount, byForm, byDay, dayReply } from './common.js';
import { encounter, rel, likesMei, likesYa, trioStep, bumpRel, KISS_YA } from './act1_common.js';
import { textDay } from '../core/lines.js'; // RV1 (FX)

/* v0.11.136 (owner pick NC1, NT1's push 2): replies by day (js/core/lines.js dayReply): the first text is the old reply, the rest Fable's, one for each later day of a Coil. */
const DR_PALISADE_F = dayReply("fo_palisade:0:f", [
    "Half the stakes come out brittle. The hunters replace them with wood, without comment, which is worse than comment.",
    "Too many of the stakes ring dull when you tap them. The hunters pull those and set timber in the gaps, and Old Hu thanks you for the rest, formally, with a bow. You would have preferred to be shouted at.",
]);
const DR_COUNCIL_F = dayReply("fo_council:0:f", [
    "You say it badly. They hear it anyway, and bow anyway, slightly less deeply.",
    "It comes out in the wrong order, the end before the reasons. They wait for you to finish, with perfect courtesy, and bow as the form requires. No further than that.",
]);
const DR_FO_SPAR_F = dayReply("fo_drill:1:f", [
    "Yuki wins. Decisively.",
    "They wanted to see fast. They saw it. You mostly heard it.",
]);
const DR_FO_CLINIC_F = dayReply("fo_clinic:0:f", [
    "Mostly. You'll check the split scalp again tonight.",
    "Nearly all of it. One of the torn hands worries you; you'll look in on it after dark.",
]);

/* v0.11.170 (owner pick NX2, SR; Fable's texts, rule 10): the hub's cards (Days 8–10) answered every success, and three failures,
 * with the same line on every day; now a line by day (the first text the old reply, rewritten): the successes by the story's day
 * (RV1, SD, below), the failures (which can be tried again) by the count of days, like the other failures. */
/** v0.11.170 (owner pick RV1, SD; Fable's review M1): a success closes its card for the rest of the Coil (oneoff.js ONCE_MENUS), so a
 * count of days (dayReply) only ever reached the first text. The eight success lists go by the story's day instead (Day 8, 9, 10 →
 * the first, second, third text); the list is registered as before (the lint and the tests read DAY_REPLIES). No save field. */
const onStoryDay = (key, list) => { dayReply(key, list); return (g) => { const t = list[Math.max(8, Math.min(10, day(g))) - 8]; return typeof t === 'function' ? t(g) : t; }; };
const DR_FO_SING = onStoryDay("fo_palisade:0", ["The stakes come up white and even, humming one note between them. The hunters lay a palm on the nearest, as on a doorpost.", "The old bone lies sorted by length, ready. The stakes come up dead on the chalk; Old Hu sights down the row and finds nothing to straighten.", "The whole stretch comes up on one breath of song, and every stake rings true. A grandmother ties red thread round the last one, and nobody objects."]);
const DR_FO_PITS = onStoryDay("fo_palisade:1", ["Ugly pits, at the jackals' own angle. They will work, and nobody here asked for handsome.", "You show the angle once. The hunters dig the rest of the stretch to it, and correct one another by bowing at the offending stake.", "The jackals' angle turns out to be teachable. The pits go in faster than you can inspect them; one stake is a finger off true, and three men apologise for it."]);
const DR_FO_PITS_F = dayReply("fo_palisade:1:f", ["Under a foot of soil the ground is solid stone. You find this out with a mattock, and with both wrists.", "Today's stretch crosses an old field drain. The pits fill with water as fast as they are dug, and the hunters take it as a judgement.", "The angles come out wrong: stakes leaning in, toward the houses. They will have to come up again, and the jackals are not here to ask."]);
const DR_FO_COUNCIL = onStoryDay("fo_council:0", ["The council bows to you, one elder after another, in order of age. It takes as long as it takes. Nobody hurries.", "Nobody at the table calls it madness. Old Wen nods once, and the oldest hunter tells his cup that his grandfather would have wished to hear this.", "The bows begin before you have finished. The woman with three grandchildren says the village will keep until you are back, and makes it an order."]);
const DR_FO_LISTEN = onStoryDay("fo_council:1", ["Old Wen marks your silence, and approves of it. The surest way to be approved of here, it turns out, is to say nothing, formally.", "You keep silent, and follow the form, if not the grandfathers: who speaks after whom, and why the bow comes before the objection. Old Wen has your cup refilled.", "Before the hour is out you can tell which way a matter will fall from who stands first. Old Wen catches you at it, and almost nods."]);
const DR_FO_DRILL = onStoryDay("fo_drill:0", ["The line closes, opens and closes again without a word spoken. One animal, grim and silent, with a great many spears.", "The shields lock on the call, and stay locked when you walk into them, twice. Old Hu permits himself one nod, at the ground.", "Halfway through you stop calling the changes, and the line makes them anyway, to a count Old Hu taps on his spear. It will not need you tomorrow, which is the point."]);
const DR_FO_DRILL_F = dayReply("fo_drill:0:f", ["A spear goes through a bone shield and all but through a cousin. Nobody laughs. Nobody here was ever going to.", "The line holds until the first feint, and then becomes a dozen separate opinions. Old Hu apologises to you for each of them, by name.", "Someone grounds his spear on someone else's foot, and the line comes apart around the injury, politely. You send the foot to the well."]);
const DR_FO_SPAR = onStoryDay("fo_drill:1", [
    (g) => byForm(g, "The hunters watch in absolute silence. Afterwards Old Hu bows to the cat.", "The hunters watch in absolute silence. Afterwards Old Hu bows to the great beast, from a distance he has plainly measured.", "The hunters watch in absolute silence. Afterwards Old Hu bows to Yuki. Only to Yuki."),
    (g) => byForm(g, "Yuki goes over your blade, off your shoulder and onto the butt of Old Hu's spear, and sits. The hunters reconstruct the route afterwards, with pebbles.", "Yuki slows down for them, which is still faster than you. The hunters learn what a charge looks like from the side, and are grateful for the side.", "Yuki fights with her hands in her sleeves until the last exchange. Afterwards she tells the line, aloud, which three of them blinked."),
    (g) => byForm(g, "Three passes, and on the third you very nearly catch her tail. The hunters breathe out together. Yuki washes the tail, pointedly.", "You turn her charge instead of leaving its path. Once. The line marks it with a grunt; Yuki marks it by sitting on you.", "You last four exchanges before she takes your blade away and hands it back across her sleeve. Old Hu has the younger hunters memorise the fourth."),
]);
const DR_FO_CLINIC = onStoryDay("fo_clinic:0", ["Everyone walks home. The boy with the scythe cut goes last, being the youngest, and goes on his own feet.", "Torn hands, mostly, from the stakes. You clean, stitch and bind them in strict order of age, and every one of them will close on a spear again.", "The man the beam fell on can tell you his name, the day, and to whom he owes millet. You send him home walking, slowly, with a grandson on each side."]);
const DR_FO_BOY = onStoryDay("fo_clinic:1", ["The old woman watches you break the order as she would watch a temple burn. Mei Lin, passing with her basket, catches your eye and very nearly smiles.", "You take the youngest first. The old woman lodges her objection in full, standing, and then holds the child's head steady while you stitch.", "The youngest goes first. The old woman turns her back on the sight, formally, for as long as the stitching takes. Afterwards a boiled egg appears at your elbow, unexplained."]);
const DR_FO_BOY_F = dayReply("fo_clinic:1:f", ["You reach the boy first. It helps less than you wanted it to.", "You take the youngest first, and the cut is deeper than it looked. It is closed. Whether it stays clean is a question for the night.", "The child goes home bandaged and much too quiet. The old woman says nothing about the order, which is worse than if she had."]);

const P = 'Ashfall Hamlet';
const late = (g) => hour(g) >= 19;
const ending = (g) => g.flags.ending || 'bluff';
const meiLovers = (g) => !!g.flags.romance;
/** v0.11.122 (owner pick LG1, BC; text by Fable, B5): the bridge into Ya's night when both liked him and he chose Ya on the roof (g.flags.fo_pick). */
const FO_YA_STAY = `"Ya," you say. "Stay."

Mei Lin is on her feet before the word has finished, brushing thatch from her skirt with great dignity. "Good. I intend to walk tomorrow, and one of us should have slept." At the loft window she stops, one hand on the frame. "The floor is thin and my mother sleeps lightly. I say this as the one who has to look her in the eye in the morning." Then, to Ya, with the laugh still in her voice: "Don't break him. He carries the basket."

"No promises," says Ya.

The ladder creaks, and then nothing. Ya looks at you with eyes that catch the starlight like an animal's, takes your wrist, and pulls you in through the window after her.`;
const yaHere = (g) => !!g.flags.ya_met;
/** Day 8, 9 or 10. */
const dd = (g) => Math.max(8, Math.min(10, day(g)));
const toEvening = (g) => (dd(g) >= 10 ? 'fo_farewell' : 'fo_supper');

/* ---------------- encounters ---------------- */
const spyFight = (g) => encounter(g, {
    id: 'sect_watcher', tier: 'small',
    intro: 'The watcher puts his rice cake down on its lotus leaf before he draws. The short sword comes out fast and clean, the work of ten thousand identical mornings. Then he bows, and only then does he attack.',
    enemies: [{ name: 'Sect watcher', hp: 9, dc: 5, atk: 6, dmg: 3, dr: 1 }],
    win: 'fo_spy_won', lose: 'fo_spy_lost', flee: 'fo_ashfall',
});
const wolfFight = (g) => encounter(g, {
    id: 'palisade_wolf', tier: 'small',
    intro: 'Two ash-wolves come out of the barley and over the chalk line, one high and one low, having settled between them beforehand who dies first.',
    enemies: [{ name: 'Ash-wolf', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Ash-wolf (lame)', hp: 6, dc: 4, atk: 5, dmg: 3 }],
    win: 'fo_wolf_won', lose: 'fo_wolf_lost', flee: 'fo_morning',
    night: true, // v0.11.92 (X1): a fight after bed costs sleep
});
const yaBrawl = (g) => encounter(g, {
    id: 'ya_brawl', tier: 'small',
    intro: 'Ya spits in the dust, grins, and comes in low behind the spear, laughing already: a dog that has picked out another dog to be friends with and means to settle it by force.',
    enemies: [{ name: 'Ya', hp: 15, dc: 6, atk: 7, dmg: 3 }],
    win: 'ya_won', lose: 'ya_lost',
    // v0.11.82 (owner picks B1 + Y1; texts Fable's): a weapon spar, Yuki only in her human form
    // v0.11.129 (CB1, YF2; Fable's MAIN): the great root-kin leans on the fence (as in ya_lost)
    style: 'spar',
    tail: `The terms, agreed in the lane in front of forty houses: no armour, her spear against whatever you can sing, and the first one in the dust stays there.\n\n${yukiForm(g) === 'human' ? `Yuki steps off the fence, shakes out her sleeves, and stands at your left without being asked. Ya looks her up and down the way she looked at you — a head shorter, white-haired, ears flat, a dress you could not fight a goat in — and her grin gets wider. "The cat too? Good. Spear against two nothings." Old Hu considers Yuki for a long, formal moment, then inclines his head the exact depth owed to a second: "The matter stays between the outlander and the wild woman. The lady may stand with him. No one will strike her." "No," Yuki agrees, aloud. "No one will."` : `${yukiForm(g) === 'tiger' ? 'Yuki takes the fence — her shoulder against it, since the top of it would not survive her —' : 'Yuki takes the fence — on it, or along the whole top of it, depending on the day —'} and does not so much as twitch an ear. Through the bond: *his face, your fight. I don't do proxies. Try not to bleed on the coat.*`}`,
});

/* ---------------- the Sect's answer, by ending ---------------- */
const OPENING = {
    fought: `The morning after you broke the tribute, Ashfall gets up like a village that has been told it is going to die and is waiting, with good manners, to be told the date.

Nobody sings at the well. Nobody quarrels over the bucket. The red lotus banners are gone from the tribute post: somebody took them down in the night, folded them corner to corner, and laid them at the shrine, since Ashfall conducts even its defiance with ceremony.

At the hour of the dragon a single rider comes down the switchbacks in crimson. He stays in the saddle. He hands Old Wen a lacquered tube, bows to the depth a messenger owes a headman and not a hair beyond it, and rides back up without having said a word.

Then every face in the lane turns to you.`,
    bluff: `A gong wakes you. Ashfall does not own a gong.

At the tribute post stands a youth in pale crimson silk, with an attendant on either side holding a canopy over him, though it has not rained in a week and shows no sign of starting. He carries a scroll. His face says that every word in it has been practised before a mirror, for days, with the gestures.

All of Ashfall has come out, and all of Ashfall is on its knees in the dust, that being what one does when the Crimson Lotus brings a gong.

"I'm assuming," you say to Yuki, under your breath, "that this is about the senior from the hidden sect."

Her answer comes through the bond, so as not to disturb the kneeling: *you should not have lied so well.*`,
    paid: `Lu Han comes back alone.

No collectors, no banners, no gong. Only the inner disciple in his deep-red robe, coming down the road at first light at the pace of a man on his way to visit a grave. Doors close ahead of him, very softly, one after another.

He stops at Mei Lin's house, where you are sitting on the step with a bowl of gruel and Yuki. He studies you until the gruel has gone cold. Then, unasked, he sits down on the step beside you, which in this world is roughly equivalent to undressing in the street.

"The hairpin," he says. "I have not slept since you made it."`,
    lost: `You wake with Lu Han's boot-print still on your chest, in bruise, and forty houses of grim, careful kindness waiting outside the door. Somebody has left eggs on the step. Somebody has mended your coat overnight, badly, in red thread, red being the only thread they had.

The ultimatum stands: a year, and then the Bone-Maker goes up the road with the Sect, or the village burns. Ashfall has taken this as it takes winter. Nobody mentions it. Everybody is thinking about it.

At the hour of the dragon a rider in crimson comes down the switchbacks with a lacquered tube, and it becomes clear that the year has just got shorter.`,
};
const LETTER = {
    fought: `Old Wen reads it in the elder's house, before the council, in the voice of a man reading out his own epitaph and checking it for errors.

*The Crimson Lotus records that the village of Ashfall, in the ninth month, raised its hand against the Sect. The Sect records also the name of the stranger who led it. In accordance with the law of the mountain, the Outer Hall will send Outer Elder Shen Qiu to Ashfall on the twenty-first day, to weigh the village and the stranger, and to pass sentence.*

He rolls it up. Nobody speaks. At the back a hunter is weeping, quietly, with no change of expression, which is how men weep here.

"Thirteen days," says Old Wen. "The law holds that a village must have time to set its affairs in order before it is weighed." His good eye finds you. "This is considered a mercy."

"It's very well organised," you say. "I'll give them that."`,
    bluff: `The youth in pale silk unrolls his scroll and reads it out in a high, carrying voice of perfect sincerity:

*To the honoured Senior who graces the village of Ashfall: the Crimson Lotus, having been informed of its discourtesy, offers its humble apology, and invites him to the Outer Court, to drink tea with the Outer Hall, that the Sect may learn the name of his mountain and the depth of his cultivation.*

He bows. The attendants bow. The canopy bows.

"And if this one has other plans?" you ask.

He looks honestly pained. "Then Outer Elder Shen Qiu will come here himself, on the twenty-first day. The Elder is most eager to drink tea." He hesitates. "The Elder's tea is… very strong, Senior."`,
    paid: `"The material," Lu Han says quietly, "is not bone. No bone that I know. When I hold it my Qi goes *still*. Clean. As if someone had wiped a window." He turns his hands over and studies them. "I have eaten grass since I was six. Pills since I was twelve. In all my life I had not been clean for the length of one breath, until I held your hairpin."

He is not threatening you. That is what makes it frightening.

"I gave it to the Outer Hall," he says. "As I was bound to. Outer Elder Shen Qiu took it out of my hands himself. He comes here on the twenty-first, to ask you where it came from." A pause. "He will not ask as I am asking."

He stands, bows, deeper than a stranger is owed, and walks back up the road alone.`,
    lost: `Old Wen reads it in the elder's house, standing, with the council seated round him.

*The Outer Hall has learned that on the day of the tribute the sky over Ashfall gathered tribulation for a stranger, and withdrew without striking. Heaven does not withdraw. The Outer Hall wishes to understand why. Outer Elder Shen Qiu will come to Ashfall on the twenty-first day to collect the Bone-Maker in person, and to observe him, as one observes a portent.*

"Thirteen days, where we had a year," says the head hunter, Old Hu, flatly. "Because Heaven was afraid of him."

"I don't think Heaven was afraid," you say. "I think Heaven was confused. It's different."

Nobody in the room finds this reassuring. Nobody in any room here has yet found anything you say reassuring. You are beginning to take it personally.`,
};

export const BREAK_HUBS = ['fo_ashfall'];

export const FALLOUT = {
    fo_start: {
        id: 'fo_start', title: 'Day Eight', art: (g) => (ending(g) === 'bluff' ? 'envoy' : 'ashfall_dawn'), place: P,
        enter: (g) => { if (g.james.hp < 1) g.james.hp = 1; return []; },
        text: (g) => `${OPENING[ending(g)]}

${g.flags.sky_witness ? 'And under all of it, the thing nobody says out loud: they saw the sky come for you, and leave. Children stop playing when you walk past. A grandmother touches your sleeve and then touches her forehead, as if your sleeve were a shrine.' : ''}${g.flags.gao_broken ? ' Somewhere up the mountain, a disciple named Gao Feng is lying in the Sect\'s infirmary with his sword arm in splints and his meridians cracked, telling anyone who will listen that a mortal did it. Nobody believes him. He has started swearing oaths about you in the ancestral hall, which you gather is a big deal.' : g.flags.gao_turned ? ' You think of Gao Feng, limping home with what you told him. You wonder what he told them.' : ''}`,
        choices: [
            { text: 'Hear what they have to say.', to: (g) => ({ fought: 'fo_letter', bluff: 'fo_envoy', paid: 'fo_lu_han', lost: 'fo_letter' }[ending(g)]) },
        ],
    },
    fo_letter: {
        id: 'fo_letter', title: 'The Letter', art: 'council', place: `${P} — the elder's house`,
        text: (g) => LETTER[ending(g) === 'lost' ? 'lost' : 'fought'],
        choices: [
            { text: '"Then we use the thirteen days."', do: (g) => { bumpRel(g, 'Village', 4, 0); bumpRel(g, 'Old Wen', 3, 0); return []; }, to: 'fo_elder_named' },
            { text: '"I could leave. If I\'m gone, there\'s nobody for him to weigh."', to: 'fo_leave_offer' },
        ],
    },
    fo_leave_offer: {
        id: 'fo_leave_offer', title: 'An Offer Refused', art: 'council', place: `${P} — the elder's house`,
        text: (g) => `Silence. Old Wen sets the lacquered tube down on the table and squares it to the edge with one finger, exactly.

"If you leave," he says, "the Elder weighs the village without you. Ashfall raised its hand. Ashfall will be weighed. That is the law." The one good eye holds you. "You did not make us raise our hand, Bone-Maker. We raised it. Do not insult us by taking that away."

${g.flags.romance ? 'Mei Lin, at the back of the room, says nothing. She has no need to. Her look sits on the side of your face like sunburn.' : 'At the back of the room Mei Lin snorts, aloud, in council, and three elders turn to stare at her. She stares back. Somebody\'s grandmother makes a small, scandalised sign against bad luck.'}`,
        choices: [{ text: '"Understood. I\'m staying."', do: (g) => { bumpRel(g, 'Village', 6, 0); bumpRel(g, 'Mei Lin', 3, 2); return []; }, to: 'fo_elder_named' }],
    },
    fo_envoy: {
        id: 'fo_envoy', title: 'An Invitation', art: 'envoy', place: `${P} — the tribute post`,
        text: (g) => LETTER.bluff,
        choices: [
            { text: 'Stall, like a senior: "This one is in seclusion. Return when the plum trees flower."', check: { skill: 'GU', dc: 5 }, do: (g) => { g.flags.envoy = 'stalled'; bumpRel(g, 'Village', 3, 0); return ['His bow goes so deep that one attendant has to steady the canopy, and the other has to steady him.']; }, failDo: (g) => { g.flags.envoy = 'doubted'; return ['He bows, but on the way up his eyes stop at your coat and take inventory. The Elder will be told that the senior dresses like nothing in the registers.']; }, to: 'fo_elder_named' },
            { text: 'Refuse plainly: "I don\'t drink tea with people who tax children."', do: (g) => { g.flags.envoy = 'refused'; bumpRel(g, 'Village', 5, 0); return ['He goes the colour of his own scroll, and bows regardless. Manners here would survive a flood.']; }, to: 'fo_elder_named' },
            { text: 'Ask him, quietly, what the Elder is like.', check: { skill: 'GU', dc: 4 }, do: (g) => { g.flags.envoy = 'asked'; g.flags.elder_intel = true; return ['"Patient," he whispers, hardly moving his lips. "He has never lost a duel. He has never needed to hurry one."']; }, failDo: (g) => { g.flags.envoy = 'asked'; return ['All he will say is: "The Elder is very correct, Senior." Even that much plainly frightens him.']; }, to: 'fo_elder_named' },
        ],
    },
    fo_lu_han: {
        id: 'fo_lu_han', title: 'Lu Han, Alone', art: 'envoy', place: `${P} — Mei Lin's doorstep`,
        text: (g) => LETTER.paid,
        choices: [
            { text: 'Call after him: "Lu Han. If you want to be clean again, you know where I am."', do: (g) => { g.flags.lu_han_seed = true; return ['He stops, with his back to you, for the length of three breaths. Then he walks on, no faster and no slower.']; }, to: 'fo_elder_named' },
            { text: 'Let him go. A man like that has to come back on his own.', to: 'fo_elder_named' },
        ],
    },
    fo_elder_named: {
        id: 'fo_elder_named', title: 'Thirteen Days', art: 'ashfall_dawn', place: P,
        text: (g) => `So that is how it stands. In thirteen days Outer Elder Shen Qiu of the Crimson Lotus comes down that road, and everything you have done here goes on the scales.

You ask about him, carefully. Voices drop. People describe Shen Qiu as they would the weather in a mountain pass: a condition, not a person. He is old. He is courteous. He is the reason the village over the next ridge is no longer there.

${g.flags.elder_intel ? 'He has never lost a duel. He has never needed to hurry one.' : ''}

One thing more, which Old Wen tells you over tea, so low that you have to lean in for it: the envoys, the watchers, Lu Han, each has carried home the same impossible report. *They cannot sense him.* A man who refuses tribulation and sings bone out of the air, and to a cultivator's senses he is an empty chair. "To them that is not a mystery," Old Wen says. "It is an insult. The Elder is not coming to speak with a mortal. He is coming to learn what is hiding inside one."

Meanwhile, whenever the wind goes round to the north, your Convergence lifts its head like a dog that has heard its name. North, beyond the Hollow, beyond the roots. The dead tree. It has been singing at you since the tribute, and it is not getting quieter.

Thirteen days. You can spend them building walls. Or you can go and find out what is calling.`,
        choices: [{ text: 'Start with the walls. Today, at least.', to: 'fo_ashfall' }],
    },

    /* ---------------- the day hub ---------------- */
    fo_ashfall: {
        id: 'fo_ashfall', title: (g) => `Ashfall — Day ${dd(g)}`, art: 'village', place: P,
        text: (g) => {
            const h = hour(g);
            const d2 = Math.max(0, Math.min(2, textDay(g) - 8)); // v0.11.154 (owner pick RV1, Fable's review, L3 FX): by the story's day (from 05:00), Day 8, 9, 10; was byDay(g, [0, 1, 2], 'fo_ashfall')
            // NT1 (Fable's draft): a second set of the times of day and of Ya's lines; v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): a third (ST2)
            const when = d2 === 2
                ? (h < 11 ? `Morning. The hammers have found a rhythm overnight, and the children have made a skipping game of it, which nobody has had the heart to forbid.` : h < 15 ? `Midday. Somebody has set a bowl of barley at the shrine, and somebody else has set a second, larger one beside it.` : h < 19 ? `Late afternoon. The wind has gone round to the north, and you are the only one in the street who turns his head.` : `Dusk. The lamps are lit early and trimmed low; Ashfall has begun counting its oil.`)
                : d2
                ? (h < 11 ? `Morning. The hammers started before the light did, and nobody has asked them to stop.` : h < 15 ? `Midday. The chalk line across the barley has been walked so often that it is a path.` : h < 19 ? `Late afternoon. The well is busy and silent, which in Ashfall is how you know people are frightened.` : `Dusk. Shutters closed, lamps lit, every door barred out of habit.`)
                : (h < 11 ? 'Morning. Hammers, axes, the steady chant of people working because the alternative is thinking.' : h < 15 ? 'Midday. The palisade line is chalked out in white across the barley.' : h < 19 ? 'Late afternoon. Smoke from forty chimneys, and nobody laughing at the well.' : 'Dusk. Lamps behind every shutter.');
            const days = 21 - dd(g);
            return `${when} ${days} days until the Elder.

${yaHere(g) ? (g.flags.ya_party ? (d2 === 2 ? `Ya is on the shrine roof, honing her spear's bone tip on a ridge tile and looking north. Someone has moved the offering bowl out from under her.` : d2 ? `Ya is on the shrine roof again, awake this time, eating something with its legs still on and watching the street like a play.` : 'Ya is asleep on the shrine roof with one leg dangling, apparently on purpose, to offend the god.') : (d2 === 2 ? `Ya is somewhere in the village. The row of fish drying along the south wall is one fish short, and the gap is being discussed in low, formal voices.` : d2 ? `Ya is somewhere in the village. A dog is barking at one end of it and a grandmother is shouting at the other, so she is moving fast.` : 'Somewhere in the village, Ya is offending someone. You can tell by the silence.')) : ''}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''}`;
        },
        choices: [
            { text: 'Build the bone palisade: stakes along the barley line.', show: (g) => !late(g), time: 20, to: 'fo_palisade' },
            { text: 'Sit in council with Old Wen.', show: (g) => daily('a1_council')(g) && !late(g), time: 20, to: 'fo_council' },
            { text: 'Drill the hunters.', show: (g) => !late(g), time: 10, to: 'fo_drill' },
            { text: 'Run the clinic at the well.', show: (g) => !late(g), time: 10, to: 'fo_clinic' },
            { text: 'Find Mei Lin.', show: (g) => daily('a1_mei')(g) && !late(g), time: 20, to: 'fo_mei' },
            { text: 'Pay your respects to Mei Lin\'s mother.', show: (g) => !g.flags.fo_mother && !late(g), time: 20, to: 'fo_mother' },
            { text: 'Find Ya. Follow the sound of offended people.', show: (g) => yaHere(g) && daily('a1_ya')(g) && !late(g), time: 20, to: 'fo_ya_time' },
            { text: 'Somebody has been watching Ashfall from the ridge. Go and see.', show: (g) => !g.flags.spy && dd(g) <= 9 && hour(g) < 16, time: 60, to: 'fo_spy' },
            { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'fo_ashfall' },
            { text: 'Eat at the communal pot.', show: (g) => daily('a1_pot')(g) && g.james.satiety < 80 && !late(g), time: 30, do: (g) => { markDaily(g, 'a1_pot'); eat(g, 25); return ['Barley and bean stew, served in silence, with a small bow: +25 satiety.']; }, to: 'fo_ashfall' },
            { text: 'Cultivate behind the shrine: one sit, 10 Qi.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'fo_ashfall' },
            { text: 'Rest an hour.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'fo_ashfall' },
            { text: (g) => (dd(g) >= 10 ? 'Evening. The last one in Ashfall for a while.' : 'Evening. Go home to Mei Lin\'s.'), show: (g) => hour(g) >= 16, time: 20, to: toEvening },
        ],
    },

    fo_palisade: {
        id: 'fo_palisade', title: 'The Palisade', art: 'palisade', place: `${P} — the barley line`,
        enter: (g) => { markDaily(g, 'a1_palisade'); return []; }, // v0.11.156 (RV1, CD): a mark for "Call it a day" only, no longer a gate
        text: (g) => `${(g.flags.palisade || 0) === 0
            ? 'The hunters have laid out the line in chalk and string, dead straight, as though straightness were itself a defence. Here it may be. Everyone in Ashfall who can lift a mallet is standing along it, waiting for you to begin.'
            : (g.flags.palisade || 0) === 1 ? 'The stakes already sung stand along a third of the line, white and sharp and faintly humming. The children have taken to touching them for luck. Nobody has told them to stop.' : 'Most of the line stands now. From the ridge, Ashfall is beginning to look like a thing with teeth.'}

You sing the stakes up out of the ground and out of the old bone the hunters bring you: jackal, boar, the long shin of an animal nobody cares to name. Each one costs Qi, and a little of something else besides: the part of you that is still surprised you can do this.`,
        choices: [
            { text: 'Sing a full stretch of the line.', qi: 6, check: { skill: 'Convergence Use', dc: 4 }, time: 180, do: (g) => { g.flags.palisade = (g.flags.palisade || 0) + 1; bumpRel(g, 'Village', 4, 0); return [`Palisade: ${g.flags.palisade}/3 stretches. ${DR_FO_SING(g)}`]; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return [DR_PALISADE_F(g)]; }, to: 'fo_ashfall' },
            { text: 'Teach the hunters to set your stakes in pits, angled, the way the jackals taught you.', check: { skill: 'GU', dc: 4 }, time: 150, do: (g) => { g.flags.palisade = (g.flags.palisade || 0) + 1; return [`Palisade: ${g.flags.palisade}/3 stretches. ${DR_FO_PITS(g)}`]; }, failDo: (g) => [DR_FO_PITS_F(g)], to: 'fo_ashfall' },
            { text: 'Not now.', to: 'fo_ashfall' },
        ],
    },

    fo_council: {
        id: 'fo_council', title: 'Council', art: 'council', place: `${P} — the elder's house`,
        enter: (g) => { markDaily(g, 'a1_council'); return []; },
        text: (g) => (dd(g) === 8
            ? `The council of Ashfall is seven old people at a table, drinking tea so weak that it is closer to a rumour of tea, and deciding whether forty houses live or die.

The question before them is whether the children should be sent over the pass to the salt villages. It is debated in full form: each speaker stands, bows to Old Wen, sets out the case for and the case against, and sits. Nobody interrupts. Nobody raises a voice. A woman with three grandchildren on the list speaks for sending them, in a voice steady enough to hold up a roof.

Old Wen turns to you. "The stranger will speak."`
            : dd(g) === 9 ? `Second council. The tea is weaker. The children's question has been settled; they stay, because the salt villages would sell them to the Sect for less than Ashfall's tribute.

Today they want to know about the Old Tree. Every hunter on the council has the same story from his grandfather: the forest's heart once *sang*, and the singing made the beasts gentle and the herbs clean. Then the Sect came, before the Sect was the Sect, and the singing stopped.

${byForm(g, "\"Your cat,\" Old Wen says,", "\"Your great beast,\" Old Wen says,", "\"Your companion,\" Old Wen says,")} "faces north when she sleeps. So do you."`
            : `Third council, and the last before the north path. The tea has gone beyond weak into memory: hot water, served with the full ceremony of tea. The map still lies on the table from this morning. Nobody has presumed to roll it up.

The business is short. Who answers for the palisade line. Who drills the line. Who keeps the well while the Bone-Maker is in the Blackroot with the herb-gatherer and the wild woman, and eleven days stand on the tally. Each matter is stood for, bowed over and settled. Nobody says *if he comes back*. It sits at the table all the same, an eighth elder.

Then Old Hu rises, bows to Old Wen, and puts the question his hunters have put to him: why a man walks toward a dead tree while an Elder is walking toward his door.

Old Wen's good eye comes round to you. "The council has heard my reasons. The stranger may add his own, or keep them."`),
        choices: [
            { text: (g) => (dd(g) === 8 ? 'Speak for the children: keep them close, keep them hidden, and build.' : '"It\'s calling me. I think it was one of ours — my people\'s. I need to see it."'), check: { skill: 'GU', dc: 4 }, time: 120, do: (g) => { g.flags[`council${dd(g)}`] = true; bumpRel(g, 'Old Wen', 4, 0); bumpRel(g, 'Village', 3, 0); return [DR_FO_COUNCIL(g)]; }, failDo: (g) => { g.flags[`council${dd(g)}`] = true; return [DR_COUNCIL_F(g)]; }, to: 'fo_ashfall' },
            { text: 'Listen. Say nothing. Learn how these people decide things.', time: 120, do: (g) => { g.flags[`council${dd(g)}`] = true; bumpRel(g, 'Old Wen', 2, 0); return [DR_FO_LISTEN(g)]; }, to: 'fo_ashfall' },
        ],
    },

    fo_drill: {
        id: 'fo_drill', title: 'The Hunters', art: 'drill', place: `${P} — the threshing floor`,
        enter: (g) => { markDaily(g, 'a1_drill'); return []; }, // v0.11.156 (RV1, CD): a mark for "Call it a day" only, no longer a gate
        text: (g) => `The hunters are drawn up in two straight lines when you arrive, spears grounded, faces set. Old Hu, the head hunter, salutes you as he would a general, which alarms you more than any wolf has managed to.

${(g.flags.militia || 0) >= 2 ? 'They have kept everything you taught them before the tribute, and they practise it with the terrible seriousness of men who expect to need it.' : 'They have never fought anything that could think. They are about to.'}${yaHere(g) ? '\n\nYa watches from the woodpile, eating a raw turnip and heckling. Old Hu, with enormous dignity, declines to know that she exists.' : ''}`,
        choices: [
            { text: 'Drill the line: spears behind bone shields, nobody alone.', check: { skill: 'GU', dc: 4, band: 'challenging' }, time: 150, do: (g) => { g.flags.militia = (g.flags.militia || 0) + 1; bumpRel(g, 'Village', 3, 0); return [DR_FO_DRILL(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return [DR_FO_DRILL_F(g)]; }, to: 'fo_ashfall' },
            { text: 'Spar with Yuki in front of them, so they see what fast looks like.', check: { skill: 'GU', dc: 5 }, time: 90, do: (g) => [DR_FO_SPAR(g), ...awardYukiFightXp(g, 'standard')] /* v0.11.126 (NQ1): by her form, Fable's; v0.11.170 (SR): by day */, failDo: (g) => { g.james.hp -= 2; return [`${DR_FO_SPAR_F(g)} −2 HP.`, ...awardYukiFightXp(g, 'standard')]; }, to: 'fo_ashfall' },
            { text: 'Not today.', to: 'fo_ashfall' },
        ],
    },

    fo_clinic: {
        id: 'fo_clinic', title: 'The Well', art: 'healer', place: `${P} — by the well`,
        enter: (g) => { markDaily(g, 'a1_clinic'); return []; }, // v0.11.156 (RV1, CD): a mark for "Call it a day" only, no longer a gate
        text: (g) => `The line at the well is longer than it was before the tribute, and it has changed: fewer fevers, more hands torn on stakes, a scalp split by a falling beam, a boy who tried to put a spear's edge on a scythe.

They wait by age, eldest first, and will not alter it even with the boy bleeding at the back. When you object, an old woman explains the matter to you, kindly, as one explains rain to a child: the order is the order.

${hasItem(g, 'jade_bracket') ? 'You have jade bracket. It will have to stretch.' : 'You have no fungus left. You have clean water, a lancet of bone and fifteen years of reading about infection.'}`,
        choices: [
            { text: 'Work through the line properly.', check: { skill: 'GU', dc: 4, bonus: (g) => (hasItem(g, 'jade_bracket') ? 2 : 0) }, time: 150, do: (g) => { if (hasItem(g, 'jade_bracket')) addItem(g, 'jade_bracket', -1); g.flags.clinics = (g.flags.clinics || 0) + 1; bumpRel(g, 'Village', 6, 0); return [DR_FO_CLINIC(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_FO_CLINIC_F(g)]; }, to: 'fo_ashfall' },
            { text: 'Treat the youngest first, and take the old woman\'s disapproval.', time: 120, check: { skill: 'GU', dc: 3 }, do: (g) => { bumpRel(g, 'Village', 1, 0); bumpRel(g, 'Mei Lin', 2, 1); g.flags.clinics = (g.flags.clinics || 0) + 1; return [DR_FO_BOY(g)]; }, failDo: (g) => [DR_FO_BOY_F(g)], to: 'fo_ashfall' },
            { text: 'Not today.', to: 'fo_ashfall' },
        ],
    },

    fo_mei: {
        id: 'fo_mei', title: 'Mei Lin', art: (g) => (dd(g) === 9 ? 'herb_slope' : 'mei_lin'), place: (g) => (dd(g) === 9 ? `${P} — the herb slopes` : `${P} — Mei Lin's house`),
        enter: (g) => { markDaily(g, 'a1_mei'); return []; },
        text: (g) => {
            if (dd(g) === 8) return `You find her in the herb loft${g.flags.loft_burned ? ' — what is left of it, the charred beams scrubbed and oiled as if scrubbing could unburn them —' : ''}, sorting roots with the ferocity of a woman who has resolved not to think.

"Thirteen days," she says, not looking up. "And everyone is so calm. My mother has been calm since dawn. The headman is calm. Old Hu is so calm I think he may have died." A bundle hits the board. "I am going to scream, James. In the street. Only to hear somebody do it."

"That," you say, "would be extremely bad for your reputation."

"I *have* a reputation. It's 'that Mei Lin.' They all say it the same. *That* Mei Lin." ${meiLovers(g) ? 'She looks at you at last, and her face turns soft and furious together. "And now I\'m *that* Mei Lin who took a foreign demon up to her loft. They are praying for my soul, did you know? Aloud. At the shrine."' : 'She looks at you at last. "Laughing in public. Speaking in council. Talking to foreign demons. It adds up."'}`;
            if (dd(g) === 9) return `The herb slopes, late in the morning. She cuts Ninefold grass in short, angry strokes and talks without stopping, which for Mei Lin is what thinking sounds like.

${yaHere(g) ? '"That woman," she says, "asked me this morning whether you were *mine*. In the street. In front of Grandmother Lao." Slash. "And when I told her that is not a question decent people ask, she asked whether I was *decent*, then, because she had heard otherwise." Slash. "And then she *laughed*. Do you know what it is to hear someone laugh in this village? It sounded like glass breaking."\n\nThe knife stops. "I liked it," she says, very low, as one owns up to a crime. "That\'s the worst part."' : 'She does not mention the Elder once, which is how you know he is all she is thinking about.'}`;
            return `The last day. She is packing the basket for the second time, having unpacked it to audit her mother's additions.

"I'm still coming," she says, before your mouth is open. "Don't. If you have thought of a reason since this morning, keep it. I know every herb between here and the Hollow, and you know none of them, and *she* knows nothing that grows unless it bleeds. Someone on this expedition has to know which mushrooms not to eat."

"I'm a mycologist."

"Then you'll be a great help in naming the ones that killed us. And you are cooking. I have seen you look at my mother's pot like a man watching a child cross a river."`;
        },
        choices: [
            { text: (g) => (dd(g) === 8 ? '"Scream, then. I\'ll stand next to you so they look at me instead."' : dd(g) === 9 ? 'Tell her she\'s allowed to like it.' : '"No reason. I was going to carry the basket."'), time: 120, do: (g) => { bumpRel(g, 'Mei Lin', 4, 4); return likesMei(g) && likesYa(g) ? trioStep(g, 1) : []; }, to: 'fo_ashfall' },
            { text: (g) => (dd(g) === 8 ? 'Help her sort roots. Say nothing. Let her be angry at the roots.' : 'Help her work. Let her talk.'), time: 120, do: (g) => { bumpRel(g, 'Mei Lin', 5, 1); addItem(g, 'jade_bracket', 1); return ['+1 Jade bracket (pressed into your palm in passing, with no remark and no eye contact).']; }, to: 'fo_ashfall' },
        ],
    },

    fo_mother: {
        id: 'fo_mother', title: 'Mei Lin\'s Mother', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { g.flags.fo_mother = true; return []; },
        text: (g) => `Mei Lin's mother receives you seated very straight on a mat, in her best jacket, as for the negotiation of a marriage or a funeral. Possibly both.

"My daughter laughs in the street," she says. "She speaks in council. She ${meiLovers(g) ? 'has taken a stranger to her bed and does not lower her eyes about it' : 'walks beside a stranger and does not lower her eyes about it'}. In Ashfall such a girl is not a scandal. She is a *warning*. Mothers point at her." A pause. "Her father laughed also."

She pours tea, yours first, which is either a great honour or an accusation. "It does not go uncounted," she adds, to the pot, "that the best of your bowl ends in hers whenever you suppose me busy with the fire."

"When the Elder arrives they will want someone to make an example of. They always do. They look for the one who laughs."`,
        choices: [
            { text: '"Then I\'ll make sure they look at me."', do: (g) => { bumpRel(g, 'Mei Lin', 2, 0); bumpRel(g, 'Mother', 6, 0); g.flags.mother_vow = true; return ['She bows to you. Low. Lower than the Sect has ever had from her of her own will.']; }, time: 60, to: 'fo_ashfall' },
            { text: '"She\'s the only person in this village who isn\'t afraid. Don\'t ask me to fix that."', do: (g) => { bumpRel(g, 'Mei Lin', 4, 2); bumpRel(g, 'Mother', 2, 0); return ['She weighs you across the teapot, unhurried. "No," she says at last. "I suppose I will not."']; }, time: 60, to: 'fo_ashfall' },
        ],
    },

    /* ---------------- the watcher on the ridge ---------------- */
    fo_spy: {
        id: 'fo_spy', title: 'The Watcher', art: 'envoy', place: 'The ridge above Ashfall',
        text: `Halfway up the switchbacks, behind a boulder and under a pine, there is a tidy little nest: a folded mat, a water gourd, a writing kit, three rice cakes in a lotus leaf. In the middle of it sits a youth in a dust-coloured over-robe with a crimson lining, writing in a ledger with his tongue between his teeth.

He has been counting your stakes. He has drawn the barley line, accurately, with notes. He has drawn *you*, with a note in the margin: *coat: inexplicable*.

He has not seen you yet.`,
        choices: [
            { text: 'Take him.', combat: spyFight, to: 'fo_spy_won' },
            { text: 'Talk. "Your ledger\'s very good. Shame about the perspective on the stakes."', check: { skill: 'GU', dc: 5 }, do: (g) => { g.flags.spy = 'talked'; g.flags.elder_intel = true; return ['He stares. Then, being very young and very correct, he corrects you on the perspective. It takes an hour, with diagrams. He goes home with his ledger, and you go home knowing that the Elder means to arrive at noon, by the north road, with four disciples.']; }, failDo: () => ['He is off like a hare from its form. You let him go; the ledger drops out of his robe on the second bound.'], fail: 'fo_spy_fled', to: 'fo_ashfall' },
            { text: 'Leave him. Let the Sect see exactly how ready you are.', do: (g) => { g.flags.spy = 'left'; return []; }, to: 'fo_ashfall' },
        ],
    },
    fo_spy_won: {
        id: 'fo_spy_won', title: 'The Ledger', art: 'envoy', place: 'The ridge above Ashfall',
        enter: (g) => { g.flags.spy = 'caught'; g.flags.elder_intel = true; bumpRel(g, 'Village', 4, 0); return ['+ The watcher\'s ledger: the Elder\'s road, hour and escort.']; },
        text: `He yields the instant your blade touches his throat: kneels, and offers you his sword in both hands, hilt first, in full form. It is plainly the one correct act left to him, and he performs it well.

The ledger is meticulous. Shen Qiu arrives by the north road. At noon. Four disciples with him. There is a note on Mei Lin: *the herb-girl who laughs*. There is a note on Ya, which is only a drawing of a wolf's skull and a question mark. Yuki has an entry too; she reads it once and lets it stand.

You send him home without the sword. He bows before he runs. The Sect trains them thoroughly.`,
        choices: [{ text: 'Back down to Ashfall.', time: 60, to: 'fo_ashfall' }],
    },
    fo_spy_lost: {
        id: 'fo_spy_lost', title: 'Correct', art: 'envoy', place: 'The ridge above Ashfall',
        enter: (g) => { g.flags.spy = 'lost'; return []; },
        text: (g) => `He puts you on the ground with three precise movements, bows, apologises for the inconvenience, gathers his mat and his ledger and his rice cakes, and leaves at a brisk, correct walk.

You lie in the pine needles for a while, contemplating the Crimson Lotus's training programme. ${byForm(g, "Yuki sits on your chest. *He folded his mat,* the bond observes. *While you were bleeding.*", "Yuki rests one paw on your chest. *He folded his mat,* the bond observes. *While you were bleeding.*", "Yuki sits down beside you. \"He folded his mat,\" she observes. \"While you were bleeding.\"")}`,
        choices: [{ text: 'Limp home.', time: 90, to: 'fo_ashfall' }],
    },
    fo_spy_fled: {
        id: 'fo_spy_fled', title: 'Gone', art: 'envoy', place: 'The ridge above Ashfall',
        enter: (g) => { g.flags.spy = 'fled'; g.flags.elder_intel = true; return []; },
        text: (g) => `The watcher is three switchbacks up the mountain before you've finished your sentence. His ledger lies in the dust. It's very thorough. The Elder comes by the north road, at noon, with four disciples.

Also, in the margin next to your portrait: *does not bow*.${byForm(g, "\n\nYuki is in the portrait as well: a small smudge on your drawn shoulder, labelled *pet?*. The bond says nothing, at some length.", "\n\nYuki's portrait has the whole facing page, and its margin says only *large*, underlined twice. She watches the mountain until he is off the last switchback. *Uphill,* says the bond. *No.*", "\n\nYuki has the facing page to herself, ears and tail drawn with care, and a margin that says *the lady: do not approach*. \"Accurate,\" she says, and closes the ledger for you.")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Back down to Ashfall.', time: 60, to: 'fo_ashfall' }],
    },

    /* ---------------- evenings and nights ---------------- */
    fo_supper: {
        id: 'fo_supper', title: 'Supper', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { if (hour(g) < 19) advance(g, (19 - hour(g)) * 60); if (daily('a1_supper')(g)) { markDaily(g, 'a1_supper'); eat(g, 30); return ['Millet, pickled greens, a sliver of salt pork: +30 satiety.']; } return []; },
        text: (g) => (dd(g) === 8
            ? `Supper is very quiet. Mei Lin's mother says grace to the ancestors at twice its usual length, and adds a line at the end about the stranger, which you choose to take as a blessing.

Mei Lin eats with one hand and with the other draws the palisade line in spilled tea on the table, arguing with it. ${byForm(g, "Yuki eats a sliver of salt pork that nobody at this table offered her.", "Yuki, along the far wall, has been served a whole smoked hare in the washing basin, unasked. The mother pays her tolls promptly.", "Yuki, seated at the head by the mother's ruling, eats her sliver of salt pork with chopsticks, faultlessly, and is offered a second before you are.")}`
            : `${yaHere(g) ? `Ya comes to supper. Nobody invited her. She simply arrives at the door, walks in, sits at the table on the *wrong side* — the host's side — and eats with her fingers, fast, hunched, watching the door the whole time like a wolf at a kill.

Mei Lin's mother serves her anyway, because a guest is a guest even if she is an animal, and sits through the whole meal with the face of a woman enduring a tribulation. Your bowl she fills past the line, informing the ladle that whoever salted her pot while she was at the shrine was not seen, and has improved it.

Halfway through, Ya burps, looks at Mei Lin, then at you, and says, conversationally: "So which of you two is sleeping in the loft? Or is it both. It should be both."

The mother drops her chopsticks.` : 'Supper. Quiet. The mother watches the north window the whole time.'}`),
        choices: [
            { text: (g) => (yaHere(g) && dd(g) === 9 ? '"Ya. Manners." (You\'re aware of the irony.)' : 'Help clear the table.'), do: (g) => { if (yaHere(g) && dd(g) === 9) { bumpRel(g, 'Ya', -2, 2); bumpRel(g, 'Mother', 3, 0); return ['Ya bristles, concludes you are joking, concludes you are not, concludes she likes you regardless, and eats your pickles to make the point.']; } bumpRel(g, 'Mother', 2, 0); return []; }, to: 'fo_night' },
            { text: (g) => (yaHere(g) && dd(g) === 9 ? 'Laugh. Out loud. Somebody at this table has to.' : 'Go up to the loft early.'), do: (g) => { if (yaHere(g) && dd(g) === 9) { bumpRel(g, 'Ya', 3, 3); bumpRel(g, 'Mei Lin', 2, 0); g.flags.laughed_with_ya = true; return ['Ya laughs with you. Mei Lin tries not to, and loses, and her mother regards the three of you as she would a fire in the thatch.']; } return []; }, to: 'fo_night' },
        ],
    },
    fo_night: {
        id: 'fo_night', title: 'Night', art: 'village_night', place: `${P} — the herb loft`,
        // v0.11.152 (owner pick RP1, RM9; Fable's): the second night (Day 9) has its own opening line and Mei Lin's own paragraph
        text: (g) => `${dd(g) === 8 && !g.flags.palisade ? 'There is no palisade yet. You lie awake listening to the barley.' : dd(g) === 9 ? 'The mint in the rafters has been joined by a new row of something bitter, hung up that afternoon. The loft is being provisioned for a siege, like the rest of the house.' : 'The loft smells of mint and drying ginseng: the first bundles hung since the tribute, in a row along the new-scrubbed beam.'}

${meiLovers(g)
        ? (dd(g) === 9 ? 'Mei Lin comes up the ladder earlier tonight, before the snoring below is properly established, which for Mei Lin is recklessness. She sits down on the edge of your blanket and unpins her hair. "Twelve," she says, and that is all the arithmetic either of you does.' : 'Mei Lin climbs the ladder after her mother\'s snoring has settled into its rhythm. She doesn\'t say anything. She doesn\'t have to. Thirteen days is a long time, and also no time at all, and she means to use every night of it.')
        : (dd(g) === 9 ? 'Below, Mei Lin\'s lamp burns late again. You hear the knock of her herb-knife on the board, steady, and then not, and then a snort of laughter that she turns into a cough, for the benefit of the wall.' : 'Mei Lin\'s lamp is still burning below, late. Once, you hear her laugh — alone, at something — and then stop herself, as if someone might hear.')}${yaHere(g) ? '\n\nAnd on the shrine roof across the lane, a silhouette is sitting cross-legged against the stars, watching your window, not even pretending not to.' : ''}`,
        choices: [
            { text: (g) => (meiLovers(g) ? 'Let the night be just this.' : 'Sleep.'), do: (g) => { if (meiLovers(g)) bumpRel(g, 'Mei Lin', 2, 4); return []; }, to: (g) => (dd(g) === 8 && !g.flags.palisade && !g.flags.wolf ? 'fo_wolf' : 'fo_morning') },
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'fo_morning' }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
        ],
    },
    fo_wolf: {
        id: 'fo_wolf', title: 'In the Barley', art: 'wolves', place: `${P} — the barley line`,
        enter: (g) => { g.flags.wolf = 'came'; return nightTo(g, 60); }, // v0.11.94 (T-b1): after the bed, at 01:00, like the camp nights; v0.11.151 (WD1, LN): the slept line
        text: (g) => `${byForm(g, "An hour past midnight Yuki sets her claws in your collarbone and puts one word through the bond: *barley*.", "An hour past midnight Yuki takes your whole shoulder in her mouth, quite gently, and shakes you once. One word through the bond: *barley*.", "An hour past midnight Yuki says your name, aloud, once, from the loft window, where she has plainly been standing for some while. Then one word: \"Barley.\"")}

Two shapes are coming through the barley toward the houses, low and soundless, grey on grey. Ash-wolves: drawn by the blood from the clinic, perhaps, or by the smell of a village that has stopped sleeping.

There is no palisade. There is a chalk line, and a great many good intentions.`,
        choices: [
            { text: 'Go down and meet them in the field.', combat: wolfFight, to: 'fo_wolf_won' },
            { text: 'Wake the hunters and hold the lane.', check: { skill: 'GU', dc: 5, bonus: (g) => ((g.flags.militia || 0) >= 2 ? 1 : 0) }, do: (g) => { g.flags.wolf = 'driven'; bumpRel(g, 'Village', 3, 0); return ['Torches, spears, and no shouting at all. The wolves look along the row of set faces, weigh it, and go to find a village with worse manners.']; }, fail: 'fo_wolf_forced', to: 'fo_morning' },
        ],
    },
    fo_wolf_forced: {
        id: 'fo_wolf_forced', title: 'In the Barley', art: 'wolves', place: `${P} — the barley line`,
        text: (g) => `The hunters come, but slowly — they stop to put on their headbands, properly, because a man does not go to his death untidy — and the wolves are already in the lane.${byForm(g, '', " Yuki did not stop for a headband. She is sitting in the middle of the lane, washing one paw, and the wolves have slowed. They have not stopped.", " Yuki did not stop for anything. She is standing in the middle of the lane in black silk, hands in her sleeves, and the wolves, who can count, are counting again.")}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Then it\'s the hard way.', combat: wolfFight, to: 'fo_wolf_won' }],
    },
    fo_wolf_won: {
        id: 'fo_wolf_won', title: 'Grey on Grey', art: 'wolves', place: `${P} — the barley line`,
        enter: (g) => { g.flags.wolf = 'killed'; addItem(g, 'beast_core', 1); bumpRel(g, 'Village', 5, 0); return ['+1 Murky beast core.']; },
        text: `Two grey bodies in the flattened barley. By morning the hunters have skinned them, rendered them, and hung the skulls on the chalk line, facing outward, in the solemn conviction that this will warn the others.

It might. The wolves here are not stupid. Neither, as it turns out, are the hunters.`,
        choices: [{ text: 'Back to bed.', to: 'fo_morning' }],
    },
    fo_wolf_lost: {
        id: 'fo_wolf_lost', title: 'Grey on Grey', art: 'wolves', place: `${P} — the barley line`,
        enter: (g) => { g.flags.wolf = 'lost'; bumpRel(g, 'Village', -2, 0); return []; },
        text: (g) => `They get past you and take a goat, and you get a bite through the forearm that will scar. The hunters arrive in time to see the grey shapes vanish into the barley with the goat between them.${byForm(g, '', " Yuki comes out of the barley the other way a moment later, with grey fur in her teeth and no goat: she went after the one that came at her, the lame one, while the other went round. Wolves do that.", '')}

The goat's owner bows to you anyway, and thanks you for your effort, which is somehow the worst thing that's happened all week.`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; RB2 (WC): Fable's redraft after the review
        choices: [{ text: 'Bandage it. Sleep.', to: 'fo_morning' }],
    },

    fo_morning: {
        id: 'fo_morning', title: (g) => `Day ${dd(g)}`, art: 'ashfall_dawn', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) lines.push(nightRest(g)); // v0.11.92 (X1): half back after the barley wolves
            if (g.flags.wolf === 'lost') g.james.hp = Math.ceil(g.james.hp * 0.85);
            eat(g, 20);
            lines.push('Breakfast at Mei Lin\'s: gruel and pickles, +20 satiety.');
            return lines;
        },
        text: (g) => (dd(g) === 9 && !yaHere(g)
            ? `Day nine. Twelve days to the Elder.

You are on the step with a bowl of gruel when Ashfall goes silent at your back. It is not the careful silence you have grown used to. It is sharp and complete, like a plate dropped in a temple.

Someone is walking out of the Blackroot: down the north path, through the barley, hauling something heavy behind her on a rope.`
            : `Day ${dd(g)}. ${21 - dd(g)} days to the Elder. The north wind is up, and your Convergence is singing along with it, whether you approve or not.`),
        choices: [
            { text: 'Look.', show: (g) => dd(g) === 9 && !yaHere(g), to: 'ya_arrives' },
            { text: 'Old Wen has called for you. Today is the day you decide.', show: (g) => dd(g) >= 10 && !g.flags.fo_plan, to: 'fo_plan' },
            { text: 'Out into the village.', show: (g) => !(dd(g) === 9 && !yaHere(g)) && !(dd(g) >= 10 && !g.flags.fo_plan), to: 'fo_ashfall' },
        ],
    },

    /* ---------------- Ya ---------------- */
    ya_arrives: {
        id: 'ya_arrives', title: 'Out of the Blackroot', art: 'ya_arrives', place: `${P} — the north path`,
        text: `She is tall and rangy and barefoot, in what was once a hunter's jacket and is now mostly patches of other animals. Her hair is long and black, and the twigs in it are there on purpose. There is a red scar under one eye, a necklace of teeth at her throat, and across her shoulders a spear whose white tip, you note with professional interest, is bone. Not sung bone. Plain bone, ground to a point by hand, by somebody with patience.

On the rope behind her: an ash-wolf the size of a pony. Dead. Very dead.

She stops in the middle of the lane, lets go of the rope, looks round at forty houses of frozen, appalled villagers, and shouts: "SALT. I want salt. And iron. Who has iron?"

Old Hu steps forward, very straight. "You will lower your voice in the presence of—"

"You," she says, delighted, "smell like a goat that died of shame."

Then she sees you. And Yuki. Her nostrils flare, and all the play leaves her face at once.`,
        choices: [{ text: 'Raise a hand. "Morning."', to: 'ya_meets' }],
    },
    ya_meets: {
        id: 'ya_meets', title: 'Nothing Smells Like Nothing', art: 'ya_close', place: `${P} — the north path`,
        enter: (g) => { g.flags.ya_met = true; bumpRel(g, 'Ya', 2, 2); return []; },
        text: (g) => `She walks right up to you, much too close, and *sniffs* you. Neck, hair, the collar of your coat. Yuki, ${byForm(g, 'on your shoulder', 'at your hip', 'at your elbow')}, flattens her ears and allows it, which she has never allowed anyone.

"*You,*" the woman says. "Three nights I sat outside your little fire. Three nights. You smell like nothing. Nothing smells like nothing. Everything here smells like rot — the grass, the beasts, the Sect, *them*" — a thumb at the village — "everything that eats the air. You don't." She grins, all teeth. "I wanted to see if you'd taste like nothing too. Then the dogs came for you and you killed them, and I thought: he's mine. I'll come and get him when I'm hungry."

"I'm not sure I follow the 'mine' part."

"I'm Ya." She looks you up and down with frank, unhurried interest, the way she probably looks at a deer. "You're tall. That's good. And who's *that*?"

She's looking past you, at Mei Lin, who has come out onto the step with a knife in one hand and a bundle of herbs in the other and an expression of pure outrage. ${meiLovers(g) ? 'Ya\'s nose wrinkles. She looks from Mei Lin to you and back. "Oh. *Oh.* You two." She sounds pleased, the way a fox sounds pleased to find two hens.' : 'Ya\'s grin widens. "Oh, I like her. She looks like she bites."'}`,
        choices: [
            { text: '"James. That\'s Mei Lin. The one behind you is Old Hu, and he\'s about to challenge you."', to: 'ya_challenge' },
            { text: '"You followed me for three days and didn\'t say hello?"', do: (g) => { bumpRel(g, 'Ya', 3, 2); return ['"Saying hello is how you get speared," she says, patiently, as one explains fire to the very young.']; }, to: 'ya_challenge' },
        ],
    },
    ya_challenge: {
        id: 'ya_challenge', title: 'A Matter of Face', art: 'ya_fight', place: `${P} — the lane`,
        text: `Old Hu is indeed about to challenge her. He has taken off his headband, folded it, and handed it to his nephew, which in Ashfall amounts to a declaration of war. His face is grey with formal fury. She insulted him in the lane, before the village, and this world knows only two answers to that, and he is too old for either.

Ya sees it and *lights up*. "A fight? Good. I've been walking for four days."

"Old Hu," you say, "is seventy."

"Then *you* fight me." The delighted, feral grin swings round to you. "Come on, Nothing. Show me what you did to the dogs."

Old Hu looks at you, and what is in his face is close to hope. If you take the fight, his face is saved. If you do not, he will have to.`,
        choices: [
            { text: 'Take the fight. "Your spear against my blade. No armour. Nobody dies."', combat: yaBrawl, to: 'ya_won' }, // v0.11.82: Fable's
            { text: 'Talk her down: "You came for salt. Insulting the salt-keeper is a bad trade."', check: { skill: 'GU', dc: 6 }, do: (g) => { g.flags.ya_brawl = 'talked'; bumpRel(g, 'Ya', -1, 1); bumpRel(g, 'Village', 2, 0); return ['She turns it over. Then she bows to Old Hu, badly and sideways, a dog\'s impression of a person, and says, "Sorry your face smells like a goat." Old Hu, in visible agony, accepts this as an apology.']; }, failDo: (g) => { bumpRel(g, 'Ya', -3, 0); return ['"Coward," she says, offended down to the marrow. Then she hits you regardless.']; }, fail: 'ya_forced', to: 'ya_talk' },
        ],
    },
    ya_forced: {
        id: 'ya_forced', title: 'She Hits You Anyway', art: 'ya_fight', place: `${P} — the lane`,
        text: (g) => `It's an open-handed slap that nearly takes your head off. The whole village inhales at once.${byForm(g, '', " Then the whole village looks at Yuki. Yuki looks at the fence. This is, evidently, between people.", " Then every eye goes to the woman in black by the fence. Yuki inspects a cuff. \"He has another cheek,\" she says, aloud.")}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fine. "Your spear against my blade. No armour. Nobody dies."', combat: yaBrawl, to: 'ya_won' }], // v0.11.89 (owner pick T3): the terms said on this path too, the other path's words (Fable's)
    },
    ya_won: {
        id: 'ya_won', title: 'Pinned', art: 'ya_fight', place: `${P} — the lane`,
        enter: (g) => { g.flags.ya_brawl = 'won'; bumpRel(g, 'Ya', 6, 6); bumpRel(g, 'Village', 4, 0); return []; }, // v0.11.137 (owner pick HV1, HD): Old Hu no longer tracked (was +6)
        text: `It ends with Ya on her back in the dust, her spear a long way from her hand, and the flat of a white bone blade laid across her collarbones, holding her to the lane the way a ruler holds down a page. She's bleeding from the lip and laughing so hard she can't breathe.

"*Again,*" she says. "Do that again. Later. Somewhere with fewer goats."

Old Hu replaces his headband with tremendous dignity. His face has been saved, by proxy, and in this world that counts. He bows to you. Then, after a long and visible internal struggle, he bows to Ya, because she fought, and fighting is a thing that can be respected even in an animal.

Mei Lin, on the step, has put the knife down. She is staring at Ya with an expression you can't read at all.`,
        choices: [{ text: 'Let her up.', to: 'ya_talk' }],
    },
    ya_lost: {
        id: 'ya_lost', title: 'Pinned (You)', art: 'ya_fight', place: `${P} — the lane`,
        enter: (g) => { g.flags.ya_brawl = 'lost'; bumpRel(g, 'Ya', 4, 5); g.james.hp = Math.max(3, g.james.hp); return []; }, // v0.11.137 (HV1, HD): Old Hu no longer tracked (was +3)
        text: (g) => `It ends with you on your back in the dust and Ya sitting on your chest, one knee on each of your arms, grinning down at you upside-down with her hair hanging around both your faces like a curtain.

"You're good," she says. "You're not *good* good. But you're good." She leans down, very close, and sniffs your hair again. "Still nothing."

"Are you going to get off me?"

"Eventually." She doesn't. Behind her, you can see Mei Lin on the step, white-knuckled around her knife, and Old Hu, who has replaced his headband with tremendous dignity, because a fight was had and his face, by proxy, is saved.

${yukiForm(g) === 'human' ? 'Yuki, who was asked to stand on the left and not to rescue anyone, stands on the left and rescues no one.' : yukiForm(g) === 'tiger' ? 'Yuki leans on the fence, which leans, and offers no help whatsoever.' : 'Yuki sits on the fence and offers no help whatsoever.'}`, // v0.11.82: Fable's human-form line; v0.11.128 (OF2, YF; Fable's MAIN): the great root-kin's
        choices: [{ text: '"Eventually would be now."', to: 'ya_talk' }],
    },
    ya_talk: {
        id: 'ya_talk', title: 'Salt and Iron', art: 'ya_close', place: `${P} — Mei Lin's step`,
        text: (g) => `She sits down on Mei Lin's step unasked, helps herself to Mei Lin's gruel, and explains between mouthfuls that she lives in the deep Blackroot, beyond the Hollow, beyond where the hunters turn back. Always has. Her mother was "a hunter who went in and didn't come out" and her father was "maybe a wolf, I never asked." Twice a year she comes out for salt and iron and to start fights.

"And the dead tree?" you ask. "The big one. At the heart."

She stops chewing. The grin is gone; you had not seen her without it.

"I sleep in its roots in winter," she says. "It's warm. Nothing else in the forest is warm." A pause. "Sometimes it hums. Only when I'm asleep. When I wake, it stops." Her eyes narrow. "It hummed louder the nights I was near *you*."

Then the grin is back, and wider. "Anyway. Salt. Iron. And you. You gave the white one the best of the meat before you ate, three nights running. I watched." She aims her spoon at Mei Lin. "And maybe you."

Mei Lin makes a noise like a kettle.`,
        choices: [
            { text: 'Make her a set of bone needles and a skinning knife, as a guest-gift.', qi: 4, check: { skill: 'Convergence Use', dc: 4 }, do: (g) => { g.flags.ya_gift = true; bumpRel(g, 'Ya', 6, 4); addItem(g, 'ya_tooth', 1); return ['She turns the knife in the light as other people turn jewellery, then bites a wolf\'s tooth off her necklace and presses it into your palm. +Ya\'s wolf tooth. You decide not to ask.']; }, failDo: (g) => { bumpRel(g, 'Ya', 2, 1); return ['The knife cracks along the spine. She keeps it. "It\'s ugly. I like ugly things."']; }, to: (g) => (meiLovers(g) || likesMei(g) ? 'ya_share' : 'fo_ashfall') },
            { text: 'Get her salt from the communal store, and pay for it yourself.', do: (g) => { bumpRel(g, 'Ya', 3, 2); bumpRel(g, 'Village', 2, 0); return ['Two jars of grey salt. She carries one in the crook of each arm, like twins.']; }, time: 60, to: (g) => (meiLovers(g) || likesMei(g) ? 'ya_share' : 'fo_ashfall') },
        ],
    },
    ya_share: {
        id: 'ya_share', title: 'An Indecent Proposal', art: 'ya_close', place: `${P} — Mei Lin's step`,
        text: (g) => `Ya has been watching the pair of you as a predator watches: patiently, and missing nothing. ${meiLovers(g) ? 'She saw Mei Lin\'s hand find your sleeve on the step. She saw the hay still in Mei Lin\'s hair from two nights ago.' : 'She saw how the two of you keep not looking at each other.'}

"So," she says, licking gruel off her thumb. "You two are a pair. Good. I don't mind. In the forest, when there's a good kill, everybody eats." She looks Mei Lin over with frank, friendly appreciation. "You're pretty when you're angry. You're angry a lot, so that's lucky."

The silence that follows rings.

"I," says Mei Lin, very high, "am not a *deer carcass*."

"No," Ya agrees. "Deer don't talk back. You'd be better."

"You can't — *nobody* says — " Mei Lin rounds on you. "Say something!"

Ya's grin has slipped. She is reading Mei Lin's face, and you watch her work out, slowly, that she has given offence; and then you watch her *take* offence at the offence, hackles rising like a dog's. "What? I was being *nice*."`,
        choices: [
            { text: 'To Ya: "In Ashfall, you ask that quietly, in private, after several years."', do: (g) => { bumpRel(g, 'Ya', 1, 3); bumpRel(g, 'Mei Lin', 2, 0); trioStep(g, 1); return ['Ya gives this real thought. "Several *years*? You\'ll all be dead."']; }, to: 'fo_ashfall' },
            { text: 'To Mei Lin: "She meant it as a compliment. I think. In wolf."', do: (g) => { bumpRel(g, 'Mei Lin', 1, 1); bumpRel(g, 'Ya', 2, 2); trioStep(g, 1); return ['Mei Lin stalks indoors. Then the door opens again, and she comes out, sits down at the far end of the step, and says nothing. But she stays.']; }, to: 'fo_ashfall' },
            { text: '"Ya. No."', do: (g) => { bumpRel(g, 'Ya', -3, -2); bumpRel(g, 'Mei Lin', 4, 2); return ['Ya sulks, on a grand scale. She goes up onto the shrine roof and will not come down before supper.']; }, to: 'fo_ashfall' },
        ],
    },
    fo_ya_time: {
        id: 'fo_ya_time', title: 'Ya', art: (g) => (dd(g) === 10 ? 'ya_close' : 'ya_fight'), place: `${P} — wherever Ya is`,
        enter: (g) => { markDaily(g, 'a1_ya'); return []; },
        text: (g) => (dd(g) === 9
            ? `You find her on the threshing floor, where she has challenged three of the younger hunters at once to a wrestling match. She is winning. She is also furious, because they keep stopping to bow.

"They *bow*," she says, outraged, with one of them pinned by the neck. "In the middle. Why do they *bow*?"

"It's polite."

"It's *slow*." She lets the boy up. He bows. She shows him her teeth and he runs. "Come here. You're not slow. Throw me."`
            : `She is on the shrine roof, working a stone along her spear, with her legs hanging over the god's chiselled-off face.

"Tomorrow we start for the tree," she says, without looking down. "You and the angry one." A pause. "She doesn't like me."

"She doesn't know what to do with you. Nobody here does."

"I know." She tries the point on her thumb. A bead of blood. "I don't like it when people don't like me. It makes me want to bite them. I'm trying not to bite her." Another pause. "For you."`),
        choices: [
            { text: (g) => (dd(g) === 9 ? 'Throw her.' : '"Thank you. I mean that."'), do: (g) => { bumpRel(g, 'Ya', 4, dd(g) === 9 ? 5 : 3); return likesMei(g) && likesYa(g) ? trioStep(g, 1) : []; }, time: 120, to: 'fo_ashfall' },
            { text: (g) => (dd(g) === 9 ? 'Let her throw you. Several times. It seems important to her.' : 'Climb up and sit with her for a while.'), do: (g) => { bumpRel(g, 'Ya', 3, 4); g.james.hp = Math.max(1, g.james.hp - (dd(g) === 9 ? 2 : 0)); return dd(g) === 9 ? ['Eleven times she puts you in the chaff, and is happier each time. −2 HP.', ...awardYukiFightXp(g, 'standard')] : ['You sit. She leans her shoulder into yours, hard, as one wolf leans on another.']; }, time: 120, to: 'fo_ashfall' },
        ],
    },

    /* ---------------- Day 10: the plan ---------------- */
    fo_plan: {
        id: 'fo_plan', title: 'The Old Tree', art: 'council', place: `${P} — the elder's house`,
        enter: (g) => { g.flags.fo_plan = true; return []; },
        text: (g) => `Old Wen has unrolled a map on the council table: hide, painted in five colours, so old that the five have faded into five browns. The forest is a dark smear. In the middle of the smear somebody, long ago, drew a tree, and round it a circle, and inside the circle one character.

"*Hearth,*" Old Wen reads. "Before the Sect, my grandfather's grandfather's people walked to the Old Tree each spring with offerings. It was not a god. It was — warmer than a god. They said the forest was kind while it sang." He touches the circle. "The Sect teaches that it died of its years. My grandfather taught otherwise, and never loudly: that the founder of the Crimson Lotus went in there with his disciples and came out carrying a heart of green fire in his own hands, and that this was the first day of the Sect, and the last day of the singing."

Your Convergence is humming so loudly that it seems remiss of everyone else not to hear it.

*Hearth.* Your people's word, or near enough. The trees you grew up inside. The trees that carry the ships.

"I have to go there," you say. "Before the Elder arrives."

"Yes," says Old Wen, as if you had told him the sun was up. "But nobody from Ashfall has been beyond the Hollow in forty years. You will need someone who has."`,
        choices: [{ text: 'You know someone who has.', do: (g) => { bumpRel(g, 'Old Wen', 3, 0); return []; }, to: 'fo_price' }], // v0.11.139 (owner pick MW1, MB): Wen +3
    },
    fo_price: {
        id: 'fo_price', title: 'The Price', art: 'ya_close', place: `${P} — the shrine roof`,
        text: (g) => `You find Ya ${g.flags.ya_brawl === 'won' ? 'practising the disarm that took her spear, on a sack of millet, slowly, and losing to it on purpose' : 'asleep on the shrine roof in full sun like a lizard'}. You explain. She listens with her head on one side.

"I'll take you," she says. "Five days in, maybe six. There are things past the Hollow that eat hunters like rice. There's a wet wood where the dead walk. There are hills where the birds are on fire. I know all of it." She grins. "My price."

"Salt? Iron?"

"Salt and iron," she agrees. "And a fight every three days. A real one, no bowing." She holds up a finger. "And when we sleep in the forest, I sleep next to you, not on the other side of the fire like a guest." A second finger. "And *she* comes." She points across the lane at Mei Lin's house. "Because you'll be miserable if she doesn't, and I don't travel with miserable people. They taste of fear."`,
        choices: [
            { text: '"Done. All of it."', do: (g) => { g.flags.ya_price = 'all'; bumpRel(g, 'Ya', 5, 4); return likesMei(g) && likesYa(g) ? trioStep(g, 1) : []; }, to: 'fo_mei_insists' },
            { text: '"Salt, iron and the fights. The sleeping arrangements, we negotiate."', check: { skill: 'GU', dc: 5 }, do: (g) => { g.flags.ya_price = 'haggled'; bumpRel(g, 'Ya', 4, 2); return ['"Negotiate," she says, trying the word out, delighted, as if you had offered her a new sort of fight.']; }, failDo: (g) => { g.flags.ya_price = 'all'; bumpRel(g, 'Ya', 2, 3); return ['"No," she says. The negotiation has now been held.']; }, to: 'fo_mei_insists' },
        ],
    },
    fo_mei_insists: {
        id: 'fo_mei_insists', title: 'Not Optional', art: 'mei_lin', place: `${P} — Mei Lin's house`,
        enter: (g) => { g.flags.mei_party = true; g.flags.ya_party = true; return []; },
        text: (g) => `When you tell Mei Lin, she has already packed.

"Of course I'm coming," she says. "I was always coming. Somebody has to keep you from eating the wrong mushroom, and *her*" — a jerk of the head toward the shrine — "from eating *you*."

Her mother is standing in the doorway and has heard every word. She does not argue. In Ashfall, you are coming to understand, nobody argues with a decision once it has been spoken aloud; they only make it as correct as it can be made.

She goes inside. She comes back with her late husband's hunting knife, wrapped in red cloth, and holds it out to her daughter in both hands.

Mei Lin takes it in both hands. Neither of them cries. You have the strong impression that both will, later, separately, where nobody can see.${likesMei(g) && likesYa(g) ? '\n\nAs you leave, you catch Mei Lin glancing at the shrine roof, where Ya is lying in the sun, and away again, too quickly.' : ''}`,
        choices: [{ text: 'One more day of walls. Then the forest.', to: 'fo_ashfall' }],
    },

    fo_farewell: {
        id: 'fo_farewell', title: 'The Last Supper in Ashfall', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { if (hour(g) < 19) advance(g, (19 - hour(g)) * 60); eat(g, 35); return ['A farewell supper: fish, millet, the last of the plum wine. +35 satiety.']; },
        text: (g) => `Half of Ashfall comes to Mei Lin's house, a family at a time, each with a small gift and a short, formal speech. Old Hu brings a coil of rope and bows to the floor. The boy from the clinic brings a pebble he has ruled to be lucky, and hums as he hands it over: four bars of the low, strange music that plays from your arm, which the children have decided is a hymn. Old Wen brings nothing, sits in the corner with his weak tea, and leaves without a goodbye, which you are told afterwards is the highest honour in his gift: it means he expects to see you again.

${g.flags.palisade >= 2 ? 'Beyond the door the palisade stands white along the barley, two thirds done or better. The hunters swear on their ancestors that it will stand whole, and manned, when you are back.' : 'The palisade is still more chalk than stakes. The hunters swear on their ancestors to finish it.'}

Ya eats on the roof, alone, with her back to the gathering, because "people saying things in a row" makes her want to bite them. Halfway through, a smoked haunch of some animal comes down through the smoke-hole and lands in the soup. Mei Lin's mother contemplates it at length. Then she serves it.`,
        choices: [{ text: 'Go up to the loft.', do: (g) => { bumpRel(g, 'Old Wen', 3, 0); bumpRel(g, 'Mother', 3, 0); return []; }, to: 'fo_last_night' }], // v0.11.139 (owner pick MW1, MB): Wen +3, Mother +3
    },
    fo_last_night: {
        id: 'fo_last_night', title: 'The Night Before', art: (g) => (likesMei(g) && likesYa(g) ? 'roof' : 'village_night'), place: `${P} — the herb loft`,
        text: (g) => {
            const both = likesMei(g) && likesYa(g);
            if (both) return `You can't sleep. Nor, it appears, can anybody else. When you climb out onto the roof Mei Lin is there already, knees drawn up, watching the north. Then the thatch creaks and Ya drops down beside you both from the shrine roof, uninvited and entirely at home, like a cat coming off a wall.

Nobody speaks at first. Then Ya says, to the stars: "Tomorrow we go where it's warm. All three of us. I like that. I like that it's three." A sideways look at Mei Lin. "You can sleep next to him on one side and I'll sleep on the other and nobody has to bite anybody."

Mei Lin doesn't answer. She doesn't leave, either. She sits between the two of you in the dark with her shoulder very carefully not touching Ya's; and at last, very quietly, she laughs, at the absurdity of it, at herself, at everything, and does not stop herself.`;
            if (meiLovers(g)) return `Mei Lin comes up the ladder late, with the lamp already out, and lies down beside you in the hay without a word, and for a long time you just breathe together, listening to the north wind.

"I'm afraid," she says at last. "Not of the forest. Of coming back and finding them all — " She doesn't finish.

"Then we'll come back fast."

She turns toward you in the dark. ${byForm(g, "What happens after that is nobody's business, not even Yuki's, who goes and sleeps on the stove in protest.", "What happens after that is nobody's business, not even Yuki's, who goes down and sleeps in front of the stove in protest, across the whole floor.", "What happens after that is nobody's business, not even Yuki's, who goes and sleeps on the bench by the stove in protest.")}`;
            if (rel(g, 'Ya').a >= KISS_YA) return `There's a scrape at the loft window, and Ya climbs in without asking, as she does everything. She sits on the edge of the hay, watching you with eyes that catch the starlight like an animal's.

"Tomorrow I take you home," she says. "My home. The warm place." Then, with no change of tone at all: "Do you want me to stay? I'll stay if you want. I'll go if you don't. I won't be offended." A pause. "I'll be a little offended."`;
            return `The loft is quiet. The north wind moves in the thatch. ${byForm(g, "Yuki curls into the hollow of your neck,", "Yuki lies down along the length of you and fits her chin into the hollow of your neck, which is all of her that fits,", "Yuki lies down at your back, her tail across your shins,")} and through the bond, very faintly, you can feel what she feels when she faces north: not fear. Something more like homesickness, for a home neither of you has ever seen.`;
        },
        choices: [
            { text: 'Stay there, the three of you, until the sky goes grey.', show: (g) => likesMei(g) && likesYa(g), do: (g) => { bumpRel(g, 'Mei Lin', 3, 3); bumpRel(g, 'Ya', 3, 3); return trioStep(g, 1); }, to: 'fo_depart' },
            { text: '"Stay."', show: (g) => !(likesMei(g) && likesYa(g)) && !meiLovers(g) && rel(g, 'Ya').a >= KISS_YA, do: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 6, 10); return []; }, to: 'fo_ya_night' },
            { text: (g) => (meiLovers(g) && !(likesMei(g) && likesYa(g)) ? 'Hold her.' : 'Sleep.'), show: (g) => !(likesMei(g) && likesYa(g)), do: (g) => { if (meiLovers(g)) bumpRel(g, 'Mei Lin', 3, 6); else if (rel(g, 'Ya').a >= KISS_YA) bumpRel(g, 'Ya', -1, 0); return []; }, to: 'fo_depart' },
            { text: 'Tonight, Ya. Say it plainly: "Stay."', show: (g) => likesMei(g) && likesYa(g), do: (g) => { g.flags.ya_romance = true; g.flags.fo_pick = 'ya'; bumpRel(g, 'Ya', 6, 10); return []; }, to: 'fo_ya_night' }, // v0.11.122 (LG1, BC; Fable's B4): as "Stay." above; last, so saved choice positions keep their lines
            { text: 'Tonight, Mei Lin. Go down to the herb loft with her.', show: (g) => likesMei(g) && likesYa(g), to: 'fo_mei_night' }, // v0.11.122 (LG1, BC; Fable's B6)
        ],
    },
    fo_mei_night: { // v0.11.122 (owner pick LG1, BC; text by Fable, B7): Mei Lin alone when both like him; as "Hold her." with her romance
        id: 'fo_mei_night', title: 'The Herb Loft', art: 'village_night', place: `${P} — the herb loft`,
        enter: (g) => { g.flags.romance = true; bumpRel(g, 'Mei Lin', 3, 6); return []; },
        text: `"Mei Lin," you say, and find you don't need the rest of the sentence.

Ya looks from you to her and grins, all teeth, not offended. Perhaps a little offended. "Good. Tonight she gets the hay. I get the warm place, and the whole road there." She stands up on the ridge, stretches until her spine cracks, and points at Mei Lin. "Bite him once for me." Then she's gone, one jump to the shrine roof, where she lies down across the god as if he'd been keeping her place.

"She's impossible," says Mei Lin.

"Yes."

"I wasn't complaining." She takes your hand and climbs in at the loft window ahead of you. The loft smells of mint and dry hay, both of them newer than the beams. She puts the lamp out herself and stands close in the dark, and you can feel her deciding not to be the old Mei Lin for one night more.

"Quietly," she says against your mouth. "I mean it." She doesn't mean it; the laugh is already getting out.

She pulls the shutter closed. What happens after that is nobody's business. Not even Yuki's.`,
        choices: [{ text: 'Dawn.', to: 'fo_depart' }],
    },
    fo_ya_night: {
        id: 'fo_ya_night', title: 'Wild', art: 'ya_close', place: `${P} — the herb loft`,
        text: (g) => `${g.flags.fo_pick === 'ya' ? `${FO_YA_STAY}\n\n` : ''}She doesn't stay politely.

She kisses the way she fights: all at once, laughing, with teeth, and absolutely no idea of where civilised people draw lines. At some point she bites your shoulder, hard, and then licks it like an apology, and says against your neck, "*Still* nothing. How do you taste like *nothing*," as if it were an accusation and a compliment at once.

The hay is everywhere. The loft ladder, at one point, is somewhere it should not be. Below, Mei Lin's mother coughs, once, pointedly, through the floorboards, and Ya laughs so hard she has to put her face in your chest.

What comes after that is no one's concern. ${byForm(g, "Not even Yuki's, who goes out by the window in protest and is not seen again before breakfast.", "Not even Yuki's, who goes down the hatch in protest without troubling the ladder. The house shakes once, and the cough below is not repeated.", "Not even Yuki's. \"I shall be at the stove,\" she informs the rafters, aloud, and takes the spare blanket down the ladder with her.")}

*

When you wake, she's gone — back on the shrine roof, sharpening her spear, as if nothing happened. But when you come down the ladder she looks over at you and grins, and it's a different grin. Softer at the edges. Hers.`,
        choices: [{ text: 'Dawn.', to: 'fo_depart' }],
    },
    fo_depart: {
        id: 'fo_depart', title: 'North', art: 'ashfall_dawn', place: `${P} — the north path`,
        enter: (g) => { g.flags.mei_party = true; g.flags.ya_party = true; delete g.flags.fo_pick; return []; }, // RL1 (L4): the bridge's flag cleared
        text: (g) => `Day eleven. Ten days to the Elder.

The village lines the north path in silence: every family, every child, the hunters in their two straight lines. Nobody calls out. Nobody waves. As you pass, they bow, one row after another, like barley in wind.

Mei Lin walks at your left with her father's knife at her hip and her basket on her back, not looking at her mother, because if she looks she won't go. Ya walks at your right, ahead, then behind, then off the path entirely, impatient as a dog on a lead. ${byForm(g, 'Yuki rides your shoulder facing north, tail curled round your neck.', 'Yuki paces at your knee facing north, tail laid against your leg.', 'Yuki walks half a step ahead of you facing north, tail curled round your sleeve.')}

At the edge of the barley, where the white stakes end and the black trees begin, your Convergence stops humming and starts, unmistakably, to *sing*.

${likesMei(g) && likesYa(g) ? '"Three of us," Ya says, to nobody, very pleased. Mei Lin doesn\'t answer. But she doesn\'t correct her, either.' : '"Into the warm," says Ya, and steps under the trees.'}`,
        choices: [{ text: 'Into the Blackroot.', do: (g) => { g.minutes = 9 * 1440 + 23 * 60; sleepUntil(g, 6); g.flags.mei_party = true; g.flags.ya_party = true; bumpRel(g, 'Mother', 2, 0); return []; }, to: 'bl_start' }], // v0.11.139 (owner pick MW1, MB): Mother +2
    },
};
