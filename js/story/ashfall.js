/**
 * Days 5–6 in Ashfall Hamlet (the long route): suppers at Mei Lin's, a free day loop around the village,
 * a night visit shaped by what James did to Gao Feng, and bonuses that pay off when the Sect comes on Day 7.
 */
import { addItem, hasItem, eat, bumpRel, condense, sleepUntil, advance, d6, awardYukiFightXp, jamesHpMax, nightRest, nightTo, canFly } from '../core/game.js';
import { FW } from './flight_texts.js'; // v0.11.195 (owner picks F1, D1)
import { set, day, hour, daily, markDaily, forestScale, villageScale, grow, eatBest, pantry, foodCount, byForm, byDay, dayReply, seqText } from './common.js';
import { dayIndex } from '../core/lines.js'; // v0.11.232 (P5-B, V3b): the roof's lines by the text's index
import { storyNight, weekMorning, tributeLeft, daysWord, DaysWord } from '../core/calendar.js'; // v0.11.224 (TX2, TS6): the counts // v0.11.203 (owner pick T1, TS1): the long calendar's weeks
import { potLine } from './kitchen.js'; // v0.11.181 (SP1, PS)

/* v0.11.136 (owner pick NC1, NT1's push 2): replies by day (js/core/lines.js dayReply): the first text is the old reply, the rest Fable's, one for each later day of a Coil. */
const DR_DISHES = dayReply("supper:2", [
    "Her mother washes the bowls, and over the water she gives you the village, low-voiced and in correct form: what each family owes the Sect, which houses the road has cost a child, which neighbours would hand you over for a measure of millet. Not one smile in all of it. No hour on this world has taught you more.",
    "Tonight it is the Sect's own people, delivered over the washing water in the same low voice: which collector can be shamed in front of his juniors, which one counts the sacks twice, which one takes more than is written. She dries a bowl as she finishes each name. When the last bowl is put away she inclines her head to you, slightly, as one does to a man who has been handed something to carry.",
]);
const DR_WEN_FOREST = dayReply("wen_lesson:forest", [
    (g) => byForm(g, "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, on your knee, has not once looked away from the forest.", "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, her chin on your knee, has not once looked away from the forest.", "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, beside you, has not once looked away from the forest."),
    (g) => byForm(g, "You ask when it stopped: what season, what year. He gives you the season, and is ashamed that he cannot give the year. \"It was told to me as a man tells of a death in the house,\" he says. \"Quietly. Once.\" You put that in a thread of its own. Yuki, on your knee, has turned her ears toward the forest and left them there.", "You ask when it stopped: what season, what year. He gives you the season, and is ashamed that he cannot give the year. \"It was told to me as a man tells of a death in the house,\" he says. \"Quietly. Once.\" You put that in a thread of its own. Yuki, her chin on your knee, has turned her ears toward the forest and left them there.", "You ask when it stopped: what season, what year. He gives you the season, and is ashamed that he cannot give the year. \"It was told to me as a man tells of a death in the house,\" he says. \"Quietly. Once.\" You put that in a thread of its own. Yuki, beside you, has turned her ears toward the forest and left them there."),
]);
const DR_SLOPES = dayReply("herb_slopes:0", [
    "Mei Lin concedes, with reluctance, that you have hands.",
    "Mei Lin checks your cuts stand by stand, finds no fault, and reports it as if it were bad news.",
    "Mei Lin goes through your basket for something to throw out, and has to carry her disappointment home with the herbs.", // v0.11.247 RV-A (the cold review's C L2; Fable's): a third, for the slopes' third visit
]);
const DR_CLINIC_F = dayReply("clinic:1:f", [
    "You do what two hands can. The line was longer than that.",
    "Boiled water and a steady hand go as far as they go. Today that is most of the line, and not all of it.",
]);
const DR_HOOKS_F = dayReply("workshop:0:f", [
    "A few come out brittle. Fishhooks, all the same.",
    "A few snap in the testing. The rest will hold a fish, if the fish is reasonable.",
]);
const DR_PLOUGH_F = dayReply("workshop:2:f", [
    "It breaks on a root. The farmers bow to the two halves and say nothing. You would have preferred words.",
    "This one lasts a whole furrow before it cracks along the grain. The farmers carry the pieces back to you on a cloth, with both hands, like something that died in office.",
]);
const DR_DRILL_F = dayReply("drill:0:f", [
    "Two of them hit each other. The apologies are faultless.",
    "The shields turn left. The spears turn right. Both halves do it together, at least.",
]);
const DR_DRILL_SPAR_F = dayReply("drill:1:f", [
    "The twelve-year-old tips you onto your back, hauls you up again, and begs pardon in full form for the disrespect. Of the two, the pardon hurts more.",
    "One of the old ones hooks your ankle with a boar spear and sets you down like a sack of barley. He then asks, gravely, whether the honoured guest fell on purpose, to teach them something. You say yes.",
]);

/* v0.11.169 (owner pick P3A, SR; Fable's texts, rule 10): the five cards that can run more than once (no `daily` since v0.11.157)
 * answered every success with the same line; now a line by day like their failures (the first text the old reply, rewritten). */
/** v0.11.170 (owner pick RV1, P3D; Fable's review of part 4, M1): a success closes its card for the rest of the Coil (oneoff.js
 * ONCE_MENUS), so a count of days only ever reached the first text; the five lists go by the village day instead (Day 6, vday 3 →
 * the second text). Registered as before (DAY_REPLIES). No save field. */
const onVillageDay = (key, list) => { dayReply(key, list); return (g) => { const t = list[(g.flags.vday || 1) >= 3 ? 1 : 0]; return typeof t === 'function' ? t(g) : t; }; };
const DR_CLINIC_J = onVillageDay("clinic:0", [
    "Nobody goes home worse, and most go home mended. Ashfall is keeping count.",
    "The jade bracket works its way down the queue. Those who limped to the well walk home slowly, so that the whole street can see.",
]);
const DR_CLINIC = onVillageDay("clinic:1", [
    "Clean water, a sharp lancet, and more confidence than the doctorate strictly covers. It holds.",
    "The water never comes off the boil, and the lancet keeps pace with it. By the last patient the queue is shorter than the row of people watching it.",
]);
const DR_HOOKS = onVillageDay("workshop:0", [
    "A set for every house. The seamstress bows to you three times, very low, and is working up to a fourth.",
    "Fine work: needles for the thin cloth kept for weddings, hooks for the small fish. The seamstress has brought her daughters to bow with her, in order of height.",
]);
const DR_DRILL = onVillageDay("drill:0", [
    "By the end the eight of them move as one animal. Not a graceful animal. But one.",
    "By the last pass the wall closes on the call. When the twelve-year-old stumbles, two shields cover him before he lands. Nobody alone: they have it.",
]);
const DR_SPAR = onVillageDay("drill:1", [
    (g) => byForm(g, "You win most of yours. Yuki wins all of hers.", "You win most of yours. Yuki is conceded hers with a bow, and demonstrates anyway, so that they know what was spared.", "You win most of yours. Yuki wins all of hers in a long dress, and hands each man back his spear."),
    (g) => byForm(g, "Your man lasts longer than he expected to, and says so. The one who drew Yuki reports, with pride, that he saw her. Once.", "Your man lasts long enough to be proud of it. The one who drew Yuki finds he can still move his legs while she looks at him. The others count it a win.", "Your man makes you work for it. Yuki fights hers one-handed and tells him, aloud, that his feet are sound. He bows as if given a title."),
]);
const P = 'Ashfall Hamlet';
const vday = (g) => g.flags.vday || 1;
const meiRel = (g) => g.rel['Mei Lin'] || { f: 0, a: 0 };
/** Where "back to the village" leads, and where the evening goes. */
export const hubOf = (g) => (g.flags.long && vday(g) >= 2 ? 'ashfall' : 'village');
/** v0.11.203 (owner pick T1, TS1): in the long calendar a village day is a week, so the eve of the tribute waits for the third week's last night. */
export const nextEvening = (g) => (g.flags.long && (vday(g) < 3 || !storyNight(g)) ? 'supper' : 'evening');
/** The night of the arson (the village's second day; in the long calendar the second week's seventh night). */
const arsonNight = (g) => vday(g) === 2 && !g.flags.night5_done && storyNight(g);
const late = (g) => hour(g) >= 19;
/** v0.11.157 (owner picks NX1, RV1 FT; Fable's lines): a failed clinic or spearhead card can be tried again the same day, so its reply
 * promises no later time (was "You'll check on him tonight." / "Tomorrow, maybe."). */
export const JADE_FAIL = 'Most of them. Not the hunter. He thanks you gravely anyway, which is worse.';
export const SPEARS_FAIL = 'They crack on the first test. The smith says nothing, with great formality.';

/* ---------- day fights past the oak hollow (grow with all the days) ---------- */
const farHunt = (g) => {
    const s = forestScale(g) + villageScale(g);
    const wolves = g.flags.far_kind === 'wolves';
    const enemies = wolves
        ? [{ name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf (old scar)', hp: 7, dc: 4, atk: 5, dmg: 4 }]
        : [{ name: 'Thornback bull', hp: 11, dc: 4, atk: 5, dmg: 5, dr: 1 }];
    return { id: wolves ? 'wolves' : 'thornback', intro: '' /* v0.11.231 (P4-2, FI): never shown, the stomp posture opens it */, band: 'challenging', enemies: enemies.map((e) => grow(e, s)), win: 'far_won', lose: 'far_lost', flee: 'ashfall' };
};
const arson = (g) => {
    const s = forestScale(g) + villageScale(g);
    // v0.11.92 (X1): a fight after bed (Mei Lin wakes James) costs sleep
    return { id: 'arson', night: true, intro: '' /* v0.11.231 (P4-2, FI): never shown, the stomp posture opens it */, band: 'challenging', enemies: [{ name: 'Lackey Pock-Face', hp: 7, dc: 3, atk: 4, dmg: 3 }, { name: 'Hired thug', hp: 5, dc: 3, atk: 4, dmg: 3 }, { name: 'Hired thug', hp: 5, dc: 3, atk: 4, dmg: 3 }].map((e) => grow(e, s)), win: 'arson_won', lose: 'arson_lost' };
};


// v0.11.235 (owner pick P8-A, EVs + EVw, D1; 2026-11-20 08:16, 08:22): the supper's and the sunset walk's sequences a cycle of six (the owner's
// six-text social exception, as the roof's later nights and the talks): three more texts each, after the old three (seqText). Fable's (runs S
// and W), Claude's cuts (D1: six shared runs, the glasses (Mei Lin's first try stays Act 1's), the soot). Yuki in one sentence by form where named.
// RV1 (the cold review's T M1–M3, L1–L6): Fable's run RV (the egg, the walks' closeness and endings, the shrine shelf, the string), Claude's cuts.
const SUPPER_NEW = {
    4: [(g) => `You stand your chopsticks upright in the millet while you reach for the greens, and the table stops. Mei Lin's mother takes them out and lays them flat across your bowl, without hurry. "Upright is for the dead," she says. "They are fed at the shrine shelf, on their days. Not here, and not by guests." You apologise. She accepts it with a nod the size of a grain.

"He only wanted the greens and he's buried us all," Mei Lin says. "Efficient."

"You will dust the shrine shelf tomorrow," her mother tells her. "Before you eat."

Mei Lin draws breath.

"And you will beg their pardon. Every one, by name."

Mei Lin lets the breath go unused and eats her fish, studying you over the bowl's rim with no remorse whatsoever.`,
        (g) => `The cooper's wife comes to the door in the middle of supper to return a sieve, and to look at you. Mei Lin's mother meets her on the threshold and does not move from it. The sieve was borrowed at midsummer. "You are prompt," the mother says. The cooper's wife leans left. The mother is somehow also to the left. ${byForm(g, "Yuki watches from under your stool, and the woman who came to see a foreigner leaves inspected by his cat.", "Then the visitor sees what is stretched out behind the table. It opens one eye, and the sieve changes hands at speed.", "Then the visitor sees the ears on the woman in the best seat, one ear turns her way, and the sieve changes hands at speed.")}

"She'll tell the lane you have four arms," says Mei Lin, once the door is shut.

"She will tell them what she saw. A man eating millet." Her mother sits. "With his elbows on my table." You remove them.`,
        (g) => `Mei Lin's mother asks for your glasses, across the fish, with her palm held out flat. You hand them over. She holds them up to the lamp, then looks through them at the wall, at her daughter and lastly at you. "They make the room worse," she says.

She holds them out again, folded.

Mei Lin's hand is already halfway across the table. "A guest's eyes are not a toy," her mother says, without raising her voice, and the hand goes back to the bowl as if it had only ever been reaching for the salt.`],
    5: [(g) => `The potter's hen has laid in this house's woodpile, and Mei Lin's mother brings the egg to the table and sets it before you. "You have no cousins in Ashfall," she says. "Whose is it?"

The egg keeps its own counsel. You say that the hen is the potter's, the woodpile is hers, and that among your people the egg would go back before it cooled, with an offer to help mend whichever fence the hen came through.

"His fence is sound. The hen is wilful."

"Then the offer is a courtesy."

"He means the potter can't keep a hen," says Mei Lin. "Let me tell him."

"You will carry the egg back, and you will say good evening, and nothing else." Her mother turns to you again. "It was the right answer. It took too long."`,
        (g) => `All this time you have been asking for the millet in the wrong tone, and tonight Mei Lin tells you what you have been saying instead. "Pass the sorrow," she says, in your accent, which she does well. "Is there any sorrow left in the pot." She has to set her bowl down.

"You knew," says her mother, "and you let a guest of this house go on saying it." Mei Lin stops laughing, mostly.

Then the mother faces you and says the word. You say it back. She says it again. On the fifth attempt she nods and passes you the millet, and Mei Lin tells her fish, very quietly, that she will miss the sorrow.`,
        (g) => `After the fish Mei Lin's mother brings down the dried persimmons, which hang in the rafters to be eaten at the new year and not before. She cuts them down and puts two by each bowl. Mei Lin stares at the persimmons, then at her mother, and for once finds no remark to make.

"The mice would have had them," the mother says.

There has not been a mouse in this house since Yuki moved in. Nobody mentions that either. Yours is dense and dark and tastes of a better month than this one.

Mei Lin's mother is still holding the string they hung by. "Next year's will be sweeter," she tells it. "The tree was young." She winds it up and puts it in her sleeve, because string is string.`],
};
const WALK_NEW = {
    5: [(g) => `Mei Lin wants to know whether your people have collectors. She asks it at the barley's corner, where the path narrows to one walker's width and she steps down into the furrow sooner than go on ahead of you.

"We have them," you say. "They send letters."

"Letters." She weighs it. "And you pay?"

"Eventually. There are further letters first, each a little sterner."

"Nobody walks up your road? Nobody takes a child?"

"Nobody takes anything. There is a fine."

She stops dead among the stalks, the way one stops for a river seen running uphill. "And they call that collecting," she says. "Ours would be ashamed to stand beside them." Then, quieter, to the barley: "I'd like to see it. Once."`,
        (g) => `Out by the barley, Mei Lin admits that she once cried for a week at not being worth stealing. It comes out sideways. In the lane behind you a mother is rubbing soot beneath her children's eyes, as is done each autumn, so that they look sickly when heads are counted.

"It fools nobody," Mei Lin says. Her shoulder is a finger's width from your arm and stays there. "Mine did it every year. When I was seven they tested me anyway, found no root at all, and sent me home. I howled. I'd been told I was too precious to show them."

"And the soot?"

"She kept on with it two more years. In case they'd been wrong."

"Thorough woman."

"You've met her."`,
        (g) => `There are nine boundary stones round the barley, and Mei Lin lays her palm on every one as she passes. "You touch them before the tribute," she says, "so the field remembers whose it is. It's nonsense. Old Wen does it with both hands." Between stones she walks nearer to you than the path asks of her, and the path here is wide. ${byForm(g, "From your shoulder Yuki inspects each stone as it goes by, as a landlord might.", "Yuki pads behind and sets one broad paw on each stone in turn, which the field is unlikely to forget.", "Yuki, a few paces back, trails her fingertips over each stone in turn and keeps a straight face throughout.")}

At the seventh you put your own hand down next to hers, not touching.

She stares at it. "Now it's counted you. You'll owe millet." She does not smile. Not smiling takes her all of the eighth stone and most of the ninth, and you watch her do the work.

"I've eaten its millet all week. The stone is within its rights."`, (g) => `The village geese come home along the field path at sundown, a long white file with a boy behind it, and the path is theirs by right of temper. Mei Lin pulls you off it into the barley by the elbow, and keeps the elbow.

The boy bows to you both in passing, gravely, without taking his eyes off the gander. ${byForm(g, "The gander looks up at Yuki, high on your shoulder; Yuki looks down. *I could take him,* she says. *I want it noted that I chose not to.*", "The gander finds Yuki standing in the furrow behind you, stops hissing, and marches his file past with every neck held straight. *Sensible bird,* she says.", "Yuki, at your back in the barley, returns the boy's bow and then, at more length, the gander's stare. \"He started it,\" she says.")}

"That gander bit me when I was four," Mei Lin says. "Mother made me apologise to it. I did it badly on purpose."

"Did it accept?"

"It bit me again." She still has your elbow, and the path has been clear for some while.` /* v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): MW7, the seventh walk */],
    6: [(g) => `"Tell me the dullest thing about where you come from," Mei Lin says, her arm hooked through yours and the barley gone grey at your elbow. You give her the committee: eleven people, one room, a morning spent deciding who shall take the notes. She listens as to a tale of immortals.

"And nobody dies of it?"

"Not visibly."

"More," she says, and tightens her arm, and you describe the form for claiming back the price of a journey until the first lamps show.`,
        (g) => `Somebody has turned the scarecrow round to face the road. Mei Lin halts you, a hand on your sleeve, to look at it: the same straw, the same split hat, its back now to the barley it is kept to mind.

"It's the custom," she says. "So that one of us is seen to be watching." Somewhere in the saying of it her hand has moved from your sleeve to your arm. "He's the only man in Ashfall who may stare at the collectors. I have always thought he overdoes it."

"He has the face for it."`,
        (g) => `Between the old pear tree and the dyke run forty paces of path that no window in Ashfall can see, and Mei Lin has known it since she was fourteen. She tells you so with her arm drawn close through yours, walking slower at each step.

"I worked it out for stealing pears," she says. "I want that understood."

"Understood."

"It was never any use for anything else." She leans her weight on you, a little, for exactly as far as the dyke, and straightens before the nearest roof comes into view.

"Good pears?"

"Sour," she says. "They always were."`],
};
// v0.11.232 (owner picks P5-B, D1; V3b): the roof a sequence of three for the first week and for the later nights on the long calendar (lines.js
// seqText; the first the old text), each new text with its own line after "Stay until the cold drives you in." (by the same index). Fable's (run R), Claude's cuts.
/** v0.11.247 (owner pick P17-A, SR3): the roof's weeks: 1, 2, and week 3 its own (the long calendar). */
const roofWeek = (g) => (vday(g) === 1 ? 1 : vday(g) >= 3 ? 3 : 2);
const roofKey = (g) => `supper_roof:${roofWeek(g)}`;
const ROOF_NEW = { 1: [`On the roof Mei Lin lists what Ashfall has decided you are.

"A deserter. A struck-off physician. The widow by the well says a fox spirit, but she says that of anyone tall." She counts them off on her fingers, with the stars arriving behind her hand. "Old Wen says a scholar who has lost his way, which is his polite word for all three."

"And you?"

"I say a man who thanks the cooking pot." She addresses this to the dark fields. "Nobody dangerous does that."

"I was thanking your mother. The pot was in the way."

"She thought so too. She has been unbearable all evening. It looks exactly like her other face."`, `Your forearm is playing strings under its breath, and Mei Lin has stopped pretending she cannot hear it.

"There are people in your arm," she says.

"A recording. They played it once, very far from here, and the arm remembers."

She considers the arm, then the roof ridge, then the darkening lane. "Are they well treated?"

"They were paid. I believe one of them bought a boat."

"Then they may continue." She lies back on the thatch with her hands folded, as she would for a temple recital, and hears it out without moving. "Brisk," she says at the end. "Is all of your music in such a hurry?"

"No. Some of it is merely loud."

"Save that for the collectors."`, `Mei Lin asks, with some formality, what your name means, since in Ashfall a name is expected to mean something.

"It's old. It has come down through so many languages that the edges have worn off." You have to hunt for the rest. "One who takes another's place. A supplanter."

She turns this over gravely, her eyes on the roofs below. "That is not a name. That is an accusation. Whose place did you take?"

"Nobody's, so far. My parents liked the sound."

"They hung a theft on a child because it sounded well." She seems greatly cheered. "Mine is a beautiful forest." She nods towards the black slope above the village, where the grey moss hangs. "You have walked through the forest."

"Then neither of us is as described."

"I am still deciding about you," she says, with great courtesy, to the lane.`, `Mei Lin gives you the local sky, since you plainly arrived without one.

"The Plough. The Broken Plough. The Ox, who broke it." Her finger travels along the dark above the ridge. "Those are the Granary. When the Granary stands over the miller's roof, the millet goes in."

You ask about a bright one, low over the fields. "That is the Tax Collector," she says. "He rises before the harvest and sets after it. The old name was the Lantern. It was explained to the village, some generations back, that this had been an error."

"And the small one next to him?" you ask, and she studies it with real care before she answers. "His clerk. You, I think. You are always writing things down in your arm."`], 2: [`The plum wine comes up the ladder ahead of her these evenings, and two cups after it.

She pours yours fuller than hers and denies it. "What do your people do," she asks, "before a thing they cannot stop?"

"Cook. Far too much. Dumplings, mostly, and a soup that takes all day, so that nobody has a free hand to worry with."

"And does it stop the thing?"

"Never once. But everyone meets it fed."

She turns her cup round in her fingers. "Here we sweep," she says. "Yours is better. Don't tell my mother I said a foreigner's was better."

"She'd only add millet."

Mei Lin laughs into her sleeve, where the lane will not hear it.`, `Tonight the jar stays corked until you can bow properly, which Mei Lin says may outlast the wine.

"Lower. Eyes on his boots. You are not to look as though you were measuring him."

"I'm not measuring him."

"You measure everyone. You measured my mother." She pushes your head down with two fingers. "When the collectors arrive you are a mute cousin from the hill farms. You have never had a thought."

"I can manage most of that."

"The last part is where you fail." Her fingers stay in your hair somewhat past the end of the lesson. Then she pulls the cork with her teeth and drinks before you do, which is not the correct form, and she knows it.`, // v0.11.234 (P7-A, RN): three more for the later nights, a cycle of six (Fable's runs RM, RM2)
`Mei Lin bets you that the lamp of the widow by the well will go out before the dyer's.

"Stakes?"

"The loser carries the water in the morning. Both buckets." She settles on her elbows to watch the lane. "The widow sleeps early. She likes to be up before anyone else's faults are."

"And the dyer?"

"Owes the miller. He sits up doing sums until they come out differently."

You back the dyer's lamp to go first, on principle. Both burn on. A shutter creaks, a basin is emptied into the lane, and the widow's window goes dark.

"You've watched this lane before."

"Every night since I could climb." She says it kindly, which is worse. "It was never a bet. It was a lesson."`,
`Mei Lin examines you on the contents of the herb loft, in the dark, by smell alone.

She passes the sprigs across one at a time. You get the mugwort. You get the dried orange peel, which she says a child would. The third is bitter and faintly of cellars, and you name the mould growing on it instead, with its habits.

"That is a fault in the stock," she says. "You are not supposed to praise it."

"It's doing very well."

"It will be out by morning." She takes the sprig back and sniffs it herself, frowning. "Which shelf?"

"Third. By the window. It likes the damp."

"So do you, it seems. You sleep there."`,
`Mei Lin's mother has three rules about the lodger, and Mei Lin recites them to you from under the blanket she brought up the ladder.

"One. He is not to be fed between meals; it encourages him." She passes you a roasted chestnut out of her sleeve.

"Two. He is not to be asked about his country. The answers keep a household awake."

"What do you want to know?"

"Whether it has roofs a person may sit on."

"Several."

"Good." She shakes out the blanket until it covers your shoulder as well as hers, and looks hard at the lane while she does it. "Three concerns distance."

"How much distance?"

"She gave no figure. I have always thought that careless of her."`, `Mei Lin falls asleep in the middle of an argument she was winning.

It concerned whether a mushroom belongs with the plants. She held that anything picked into a basket is a plant, and that your years of study had been spent avoiding the fact. Then her head came down on your shoulder, mid-clause, with the verdict undelivered.

Your arm goes numb. Nine threads of thought convene on the question of moving it and vote against, unanimously, which they have not managed on any other subject.

A dog in the lane barks at nothing and is satisfied. She wakes all at once, sits up very straight, and sees to her hairpin.

"I was resting my eyes," she says. "And it is a plant."` /* v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): SR3, week 1 texts 4–5 and the later nights' seventh */] };
/** v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): SR3, the roof's week 3 its own six (the long calendar; `supper_roof:3`; RV-A, the cold review's C M1: week 3 has six suppers, so its seventh, never shown, cut), each with its line after (ROOF_STAY[3]). */
const ROOF_W3 = [`Mei Lin arrives with both hands stained green to the wrist, and holds them clear of the blanket.

"Mugwort," she says. "It does not wash out. It wears out." She shows you the palms like a ledger. "Old Wen says you can tell a gatherer's season by her hands. Mine say I have been busy, and that nobody should ask why."

You ask instead what the plant is good for.

"Fevers. Boils. Bad temper in oxen." She thinks about it. "Nothing in the person who picks it."

You take one hand and turn it to the starlight, professionally. The stain stops in a neat line where her sleeve was tied.

"Chlorophyll," you report. "Very healthy." You do not give the hand back at once, and she does not send for it.`, `There is a hollow worn in the thatch below the ridge, and Mei Lin tells you whose it was.

"My father's. He had a spirit root, a thin one, and he came up here to cultivate it. He said the Qi was cleaner above the smoke." She tucks her feet under the blanket. "Is it?"

You let your senses out over the roof and bring them back. "The same as in the yard."

"I thought so." She is not disappointed. "He wanted the view, and a reason my mother would accept. He never climbed down any stronger. Only calmer."

"That's most of what it's for."

"Then he was a great master, and the Sect missed it." She pats the hollow you are sitting in. "Mind his place. It took him years."`, `On the roof the weather may be discussed, provided it is done lying down and below the ridge.

"Red, and coming up the road," Mei Lin tells the sky. "It takes what it takes, and afterwards the whole lane agrees how mild it was." She turns her head on the thatch. "What is done about weather in your country?"

"A voice in the house warned us. Then we complained to the voice," you say, and she asks whether it answered. "It apologised. It had excellent manners."

She judges this the saddest thing she has heard of your country, and says so. "Ours has never apologised. My mother says it hears." She lowers her voice until the thatch has most of it. "I have never known it to listen."`, `After dark Ashfall goes on talking, and Mei Lin, flat on her back, tells you who everyone is by ear.

"That is the cooper's door. He oils everything but the hinge." A cough, two roofs over. "Old Wen. He is awake and wants it known."

A dog begins, and a second dog takes the matter up. Somewhere a loom is still going. "She should be asleep," Mei Lin says, and keeps to herself why she isn't.

"And that?" A low, even sawing has started in the house beneath you.

"That is nothing." She is quite firm. "My mother does not snore. Half the village has not heard it for years."

You listen to nothing together until it turns over and settles.`, `The game is called Magistrate, it is Mei Lin's invention as of this evening, and you are losing it.

One of you charges a roof in the lane with an offence. The other must defend it. "The potter's chimney," she says. "Leaning with intent."

"It's deferring to the wind. Respect for elders."

"The wind is not his elder." She weighs it. "Acquitted. Narrowly. Your turn."

You charge the hen-house opposite with keeping irregular hours. She defends it at length, citing a fox, a precedent and the character of the hens, and you are obliged to let it go. "And this roof?" you ask. "Two persons on it, after supper."

"That one I prosecute myself." She draws the blanket to her chin. "Slowly. It could take years."`, `Mei Lin tells you a thing she has never told anyone, and makes you swear on the roof ridge before she does.

"When I was nine I ate the honey cake off the house shrine. The one for the ancestors." She watches the lane while she says it, in case it hears. "I said a rat had it. My mother set traps for a month."

"Did they catch anything?"

"A rat. An innocent one." She pulls her knees up. "I still leave a crumb by the wall at festivals. For his family." You ask whether that is the whole crime.

"It is quite enough. They were my ancestors." She glances at you sideways. "Do not make that face. The one that says it is small."

"It's enormous. I'm barely holding the roof up." She knocks her shoulder against yours, hard, and leaves it there.`];
/** v0.11.248 (owner pick P18-A, LF: the owner's canon call LC1, the scorched loft; Fable's): week 3's lines after the roof that named the herb loft, after a burn (the herbs gone until the Fallout). */
export const ROOF_BURNED = ["The cold finds her hands before the rest of her. She takes the rungs with her fingertips, to spare the wood, and leaves a green thumbprint on your cuff anyway, which she studies and does not apologise for. You carry it into the scorched loft, where water makes no impression on it either.", "When the cold comes she smooths the hollow flat with her palm, as one does a bed, and is first down. On the ladder she says he snored up there, and the whole lane agreed to call it cultivation. You reach the scorched loft feeling calmer and no stronger, which she would say runs in the roof.", "You stay until the cold has won the argument. On the ladder she remarks, loudly enough for the house, that it looks a settled night, and the house keeps its opinion to itself. Then she bows you goodnight, correctly, and you go up to the loft and its charred beams."];
const ROOF_STAY = { 1: [`The cold wins, as it does. On the ladder she adds a late entry: the dyer has you down as a tax spy, and has hidden his good vat. You promise to leave the vat alone. She says goodnight to the rungs, and you take the fox spirit up to the loft.`, `She sits up only when the thatch has gone cold under you both. "Tell them it was well played," she says, with a small bow to your arm, and is down the ladder before you can decide whether she was joking. You are in the herb loft and still have not settled it.`, `The cold decides it before she does. On the ladder she tries the meaning aloud as a title, and finds that it suits a lodger rather well. Indoors she wishes the supplanter goodnight, bowing slightly, with an entirely straight face. You climb up and take the place of nobody, among the drying mint.`, `You stay until the Granary has cleared the miller's roof and the thatch has gone cold under you. On the way down she examines you on the Ox and the Broken Plough, passes you without praise, and bows you a correct goodnight in the passage. You go up to the herb loft with a sky that has names in it.`], 2: [`The jar goes down the ladder lighter, and she a little less steady, which she blames on the rungs. At the bottom she asks how long the soup takes, exactly, and repeats the answer under her breath as she goes. You reach the loft composing a shopping list for a village with no shops.`, `On the way down she has you bow once more, to the water butt, and passes you, narrowly. "Mute," she reminds you outside her mother's room, a finger laid to her own lips. You carry your silence up into the loft and practise it on the ginseng.`, `The dyer's lamp outlasts you both, and his sums come out no better for the extra oil. On the ladder she tells you where the yoke hangs and which bucket leaks, as a kindness to the defeated. You go in like a man with water to carry.`, `She runs out of sprigs before you run out of wrong answers. You have failed four, every one a plain leaf, and she goes down the ladder naming them at you like a debt. You follow her in, owing condolences to the third shelf.`, `The chestnuts run out before the rules do. There is a fourth, about the ladder after dark, and you break it together, rung by rung. At the bottom she folds the blanket with great correctness, as evidence. You reach the door smelling of chestnut smoke, which is also evidence.`, `You concede the mushroom on the ladder, your arm being in no state to argue; it hangs off you like borrowed goods. She watches you fumble a rung and says nothing, which from her is an apology. Outside the herb loft she adds that a toadstool counts as well, and is gone before you can appeal.`], 3: [`The cold finds her hands before the rest of her. She takes the rungs with her fingertips, to spare the wood, and leaves a green thumbprint on your cuff anyway, which she studies and does not apologise for. You carry it into the herb loft, where water makes no impression on it either.`, `When the cold comes she smooths the hollow flat with her palm, as one does a bed, and is first down. On the ladder she says he snored up there, and the whole lane agreed to call it cultivation. You reach the herb loft feeling calmer and no stronger, which she would say runs in the roof.`, `You stay until the cold has won the argument. On the ladder she remarks, loudly enough for the house, that it looks a settled night, and the house keeps its opinion to itself. Then she bows you goodnight, correctly, and you go up to the herb loft.`, `The loom is still going when the thatch gives up its warmth. Inside she walks on the edges of the boards, where they keep quiet, and shows you which ones with her toe. The nothing behind her mother's door does not break rhythm. You get to the loft having made no sound she will have to explain.`, `The court rises when neither of its officers can feel their feet. She hears one more case on the ladder, yours, for treading on the judge's hand, and fines you an apology, paid at once. In the house she bows to you as one magistrate to another. You carry the verdict up the ladder and sleep on it.`, `She swears you in afresh on the ladder, in case the roof ridge was not binding. Passing the house shrine she gives it no glance, and it, you notice, has the tact not to look at her. You climb on carrying a dead rat's good name, and you mean to keep it.`] }; // v0.11.234 (P7-A, RN): the later nights' results 4–6 (RV1 RT: Fable's run RT, T M1: they stop at the door)

// v0.11.237 (owner pick P10-A, EVk, D1; 2026-11-20 14:21, 15:19): the quiet night's weeks 2 and 3 on the long calendar a sequence of
// three each (seqText, `village_night:2` / `village_night:3`), as the supper's story days; week 1 keeps the old three
// v0.11.242 (owner pick P14-A, EVn-23): six each (texts 4–6 by Fable, runs K4 and K5; Claude's cuts, D1), a rule change past three for a non-social scene
// (`village_night:quiet`). Fable's (runs K2 and K3), Claude's cuts (D1: VD, FD, AU, MM, BK, FT). Each a shared text and Yuki's passage by form.
// RV2 (owner pick 2026-11-20 16:03; the cold reviews' T M1, M2, L2–L4, L6): the reviewers' and Claude's wording (BL: no dried herbs in a loft
// that may have burned; DL: no list beside the dishes' ledger, "checked" not "counted"; "everyone below"; the cup's opener; "settles against
// your back"; "behind your knees"; "says, quite awake").
const quietY = (shared, cat, great, human) => (g) => byForm(g, ...[cat, great, human].map((y) => shared.split('{yuki}').join(y))); // RV2 (CL; C L3): split and join, so a `$` in a passage stays as written
const QUIET_WEEK = {
    2: [
        quietY("Mei Lin's mother closes the day by reporting it to her husband's tablet, and the boards let every word up. You come last. The guest, she informs the dead, ate two bowls and thanked the cook correctly, the second time. {yuki} You fall asleep audited and, on balance, approved.",
            "*She left me out,* Yuki sends from the crook of your knees. *I caught a mouse in her storeroom. That is labour, and it should be in the record.*",
            "*She left me out,* Yuki sends, with her chin across both your ankles. *I am the largest thing under her roof. An honest record would have mentioned it.*",
            "\"She left me out,\" Yuki says into the blanket. \"I carried her water twice and was polite about it. That is labour, and it belongs in the record.\""),
        quietY("You are classifying a bracket fungus from the forest edge and getting nowhere. Grey on top, violet beneath, growing on wood that should have killed it; nothing you were taught has a name for it, and your mind keeps offering names regardless. Two houses up the lane a man snores in long, considered sentences. {yuki} The fungus stays unnamed, and you sleep anyway.",
            "*Call it the grey one,* Yuki sends, kneading the blanket flat beside your ribs. *You can be wrong about it in daylight, when I am awake to enjoy that.*",
            "*Call it the grey one,* Yuki sends, and rolls over, which moves the blanket, the bedding and you. *Be wrong about it after breakfast, when I am awake to watch.*",
            "\"Call it the grey one,\" Yuki says, and takes the pillow from under your head for her own use. \"Be wrong about it after breakfast, when I am awake to watch.\""),
        quietY("Rain comes to Ashfall without ceremony, and the drying racks are still out in the yard. Below, Mei Lin carries them in at a run and says a word her mother has views on; the views follow, in full, at a murmur. Then the door shuts, and the eaves drip into the water jar, keeping time. {yuki} You are asleep within a hundred drops.",
            "*I was out in that,* Yuki sends, arriving wet and choosing the dry half of your blanket to stop being wet on. *Nobody ran to carry me in.*",
            "*I was out in that,* Yuki sends, and shakes herself once, which rains on everything the roof had kept dry. *Nobody ran to carry me in. I noticed.*",
            "\"I was out in that,\" Yuki says, wringing her hair out over the ladder without looking where it lands. \"Nobody ran to carry me in. I noticed.\""),
        // v0.11.242 (owner pick P14-A, EVn-23, D1; 2026-11-21 01:57, 02:07): texts 4–6, so week 2 reads six before one comes back (Fable's run K4; Claude's cuts, D1)
        quietY("Through the boards comes Mei Lin's mother, measuring beans to soak, by the handful, aloud. Two for the house. A pause follows, in which a matter is weighed, and a third goes in. You have been the extra handful at other tables, though never one arrived at so gravely. {yuki} The lid goes on the crock, and you sleep provided for.",
            "*Three, and none of it mine,* Yuki sends from the dip of your hip. *She expects me to see to my own breakfast. There is a dried fish behind her rice jar that agrees with her.*",
            "*Three, and none of it mine,* Yuki sends, from the stretch of boards she has claimed. *Sensible. A handful for me would be the whole crock, and then the crock.*",
            "\"Three,\" Yuki says, turning over and taking the warm part of the bedding with her. \"There are four of us. Either she expects me to hunt or one of us is sharing, and I have decided which.\""),
        quietY("A pinch, as Mei Lin measures it, is whatever her fingers say it is, and you are lying in the dark trying to put it in milligrams. Her pinch and yours differ by a third. A thumbnail's worth is worse; thumbnails vary. Nobody here has been poisoned, which is evidence or luck. {yuki} You stop at the unit called enough, and sleep.",
            "*She weighs it against the patient,* Yuki sends, eyes shut, tucked under your arm. *A child gets less than a hunter. You were writing down the pinch and never looked at the hand.*",
            "*She weighs it against the patient,* Yuki sends, and the bedding shifts as she resettles her head on it. *A child gets less than a hunter. I would get a basketful. Nobody has offered.*",
            "\"She weighs it against the patient,\" Yuki says, her back set against yours. \"A child gets less than a hunter. You were writing down the pinch and never looked at the hand.\""),
        quietY("In the next house a husband and wife are deciding whether to sell a goat, in whispers that keep strictly to procedure. She cites her mother. He cites the season. In Ashfall even a quarrel in bed is conducted as a hearing. The goat, tethered outside, is consulted and abstains. {yuki} The verdict comes after you are asleep, which is evidently the custom.",
            "*They will keep it,* Yuki sends, arranging herself on your stomach. *I have met the goat. It bit a child and ate a hat, and they speak of it as people speak of family.*",
            "*They will keep it,* Yuki sends, without raising her head from the boards. *I have met the goat. It looked at me, all of me, and went on eating. One respects that.*",
            "\"They will keep it,\" Yuki says, face down in the bedding. \"I have met the goat. It ate the end of my sleeve and was not sorry. Those two have earned it, and it them.\""),
    ],
    3: [
        quietY("Mei Lin's mother checks the bar on the door, goes to her bed, and comes back to check it again. She does not hurry, and the bar is the same bar both times. You lie in the dark and listen to her make sure of a plank. {yuki} If there is a third inspection, it happens without you.",
            "*She checked it twice,* Yuki sends from behind your knees, eyes shut. *I checked it once and I was right. Go to sleep. That door has plenty of people.*",
            "Yuki lies across the head of the ladder, which nothing in Ashfall could climb past, one eye open on the dark underneath. *Tell her the door has me,* she sends. *Or don't. She enjoys the bar.*",
            "\"She has checked it twice,\" Yuki says, already under the blanket, turned to the wall. \"I checked it once, properly. Between us it is the best-guarded object in Ashfall.\""),
        quietY("Someone has left a cup of water at the ladder's foot. The lamp downstairs burns on after everyone below is in bed, an extravagance in this house. You are tired enough to sleep in your shoes, and have set them where a hand can find them. {yuki} The lamp gives up eventually. You miss it.",
            "Yuki goes down, inspects the cup, drinks a third of it on principle, and comes back up. *It's for you,* she sends, washing a whisker. *It was. Some of it still is.*",
            "Yuki puts her head over the edge and regards the cup from above; it would not wet her tongue. *Yours,* she sends. *The mother set it down herself. She walked very quietly, for her.*",
            "\"Mei Lin's mother put it there,\" Yuki says, not opening her eyes. \"She waited until she thought we were asleep. Drink it and say nothing, or she will have to deny it.\""),
        quietY("Ashfall has gone to bed with one ear on the road, and you can hear it listening. A dog along the lane barks once and is hushed by name. Across the lane a man coughs, waits, and does not cough again. Nothing is on the road; forty houses confirm it one by one. You have held your breath on their behalf, and let it go. {yuki}",
            "Yuki has sat by the ladder facing the door since you lay down. *Empty as far as I can hear,* she sends, *and I can hear moths.* She comes back to bed, satisfied, and settles against your back.",
            "Yuki lifts her head, turns it toward the road and holds it there until even the dog has lost interest. *Nothing,* she sends, and lowers it onto her forelegs. *I'd have told you before the dog knew.*",
            "\"There is nothing out there,\" Yuki says, quite awake. \"I have been listening longer than the dog and I am better at it. Sleep. I will tell you if that changes.\""),
        // v0.11.242 (owner pick P14-A, EVn-23, D1; 2026-11-21 01:57, 02:07): texts 4–6, so week 3 reads six before one comes back (Fable's run K5; Claude's cuts, D1)
        quietY("A pallet is dragged across the floor below, as on every recent evening, and comes to rest between the outer door and the room where the women sleep. By day it is back against the wall and nobody has mentioned it. Mei Lin says goodnight across her mother to the house at large. {yuki} You are asleep before you have decided who is guarding whom.",
            "*She sleeps in front of the daughter,* Yuki sends, curled against your collarbone. *I sleep on top of you. It is the same arrangement, and mine needed no furniture.*",
            "*She sleeps in front of the daughter,* Yuki sends, stretched along the open side of the bedding with you behind her. *It is the same arrangement. Mine needed no furniture. I am the furniture.*",
            "\"She sleeps in front of her daughter,\" Yuki says, and lies down on the side of you nearest the ladder. \"It is a sound arrangement. I thought of it before she did.\""),
        quietY("There is no wind, and the banners hang from the tribute post as straight as plumb lines. The lane lies awake over them regardless; a thing that does not move can be watched as long as one likes. The arm that grows bone is out on top of the blanket, without your having sent it. {yuki} The banners go on doing nothing. Presently, so do you.", // v0.11.243 (P15-B, D1; SF: RT, p14's review T L2): the banners hang still, as the week-3 hub says
            "*I went down and smelt them,* Yuki sends, coming in cold along your ribs. *Cheap dye, new rope, and a knot tied in a hurry. Banners collect nothing. Put the arm away.*",
            "*I went and smelt them,* Yuki sends, and the cold comes up the ladder with her. *Cheap dye, new rope, a knot tied in a hurry. I could have the whole post down. Put the arm away.*",
            "\"I walked down and looked at them,\" Yuki says, getting in with the cold still on her. \"Cheap dye, new rope, a knot tied in a hurry. They are laundry. Put your arm away.\""),
        quietY("Nine threads of thought, and one has taken the night watch without being asked. It has settled what the house is allowed to do in the dark: the ladder may tick, the shutter may knock once, Mei Lin may turn over. Anything else, it wakes you. So far the house has complied. {yuki} You sleep on eight.",
            "*Tell it to stand down,* Yuki sends from under your chin. *I have kept this watch since before you knew there were nine. It may have the shutter. The rest is mine.*",
            "*Tell it to stand down,* Yuki sends, and her breath moves your hair. *I have kept this watch since before you knew there were nine. It may have the shutter. The rest is mine.*",
            "\"Tell it to stand down,\" Yuki says, facing the ladder, her back to you. \"I have kept this watch since before you knew there were nine. Give it the shutter. I have the rest.\""),
    ],
};
/** v0.11.230 (P3-2, FT): the quiet night's three old texts (week 1). */
const QUIET_OLD = [(g) => byForm(g, 'The herb loft smells of mint and drying ginseng, and under it the house breathes. Yuki settles on the middle of your chest, which is also the middle of your sleep. You let her have both.', 'The herb loft smells of mint and drying ginseng, and under it the house breathes. Yuki takes the loft, and leaves you a strip along the wall and one flank for a pillow. The posts creak, consider the matter, and hold.', 'The herb loft smells of mint and drying ginseng, and under it the house breathes. Yuki gives up the stove once the house is dark, stretches out behind you, and takes most of the blanket without discussion. You let her keep it.'), (g) => byForm(g, 'Below the herb loft somebody banks the stove, and the last of the talk in the house goes out with it. Yuki treads a circle on your chest, finds her place exactly, and is asleep while you are still deciding to mind.', 'Below the herb loft somebody banks the stove, and the last of the talk in the house goes out with it. Yuki settles along the loft by stages, and the floor reports each one. You get the wall, and one paw the weight of a rice sack across your shins.', 'Below the herb loft somebody banks the stove, and the last of the talk in the house goes out with it. Yuki comes up the ladder last, puts her cold feet against your calves without apology, and is asleep before you have settled on a complaint.'), (g) => byForm(g, 'The herb loft is dark and the lane outside is darker, and Ashfall has nothing further to say tonight. The house below does: through the floor Mei Lin\'s mother tells her daughter, gravely, that a guest who asks twice what is in the pot will be handed the ladle and watched. *Stop thinking,* Yuki sends from the hollow of your shoulder. *It\'s loud.* You stop, more or less.', 'The herb loft is dark and the lane outside is darker, and Ashfall has nothing further to say tonight. The house below does: through the floor Mei Lin\'s mother tells her daughter, gravely, that a guest who asks twice what is in the pot will be handed the ladle and watched. *Stop thinking,* Yuki sends from most of the floor. *It\'s loud.* Her tail comes down across your legs, and that is the end of the discussion.', 'The herb loft is dark and the lane outside is darker, and Ashfall has nothing further to say tonight. The house below does: through the floor Mei Lin\'s mother tells her daughter, gravely, that a guest who asks twice what is in the pot will be handed the ladle and watched. "Stop thinking," Yuki says from behind you, mostly asleep. "It\'s loud." You stop, more or less.')];
// v0.11.238 (owner pick P11-A, EVn-1, D1; 2026-11-20 17:06, 17:17; Fable's run N1, Claude's cut GW): the long calendar's first week a cycle of
// six: the old three, then these three (by the quiet key's day, so its seventh night is the first again and folds); the owner's pick takes the
// quiet night to six, a non-social scene. RV2 (owner pick 2026-11-20 18:19; the cold review's T M2, M3, L1–L3,
// L6): the reviewer's and Claude's wording, and the order coat, board, bird (the supper's board on night 3, its glasses on night 6)
const QUIET_W1 = [
        quietY("Your lab coat hangs from a rafter peg between two bundles of something bitter, and has started to smell of them. Along the lane a shutter is pulled to, then the next, each household closing in its turn like a queue. {yuki} You fall asleep drafting a laundry protocol that needs neither soap nor witnesses.",
            "*An improvement,* Yuki sends, having sniffed the hem at length. *It used to smell of the laboratory and of you. Now it smells of a house where somebody cooks. Leave it.*",
            "*An improvement,* Yuki sends, breathing out across the rafters so that the coat swings on its peg. *It smelt of the laboratory and of you. The bitter one is wormwood. I prefer it.*",
            "\"An improvement,\" Yuki says, straightening its collar on the peg, which she cannot leave alone. \"It used to smell of the laboratory. Now it smells of a kitchen. You always did prefer kitchens.\""),
        quietY("The loft has one board that announces you, and you have found it again. Downstairs a broom stops, long enough for the matter to be noted, and resumes. You lie still on the bedding and resolve to map the floor by daylight, as you would any other hazardous terrain. {yuki} You commit that to memory and are asleep before it has set.",
            "*Fourth from the ladder,* Yuki sends, having crossed the whole floor without a sound to tell you so. *I weigh nothing and I still go round it. You might try either.*",
            "*Fourth from the ladder,* Yuki sends, arranged across the far end, where nothing complains. *I found it once, with one paw, and have gone round it ever since. Consider doing the same.*",
            "\"Fourth from the ladder,\" Yuki says, stepping over it in the dark without looking down. \"I learnt it when we came. You have a doctorate. I have been paying attention.\""),
        quietY("Out past the last house something calls twice, a noise between a hinge and a question, and gets no answer. You try it against bird, frog, insect and gate, and it is none of them. At home you could name whatever kept you awake. Here you are reduced to ruling things out. {yuki} It calls once more as you go under, still unanswered.",
            "*It's a bird,* Yuki sends, not lifting her head from your elbow. *Brown, stupid, no bigger than your fist. I met one behind the woodpile and we did not get on.*",
            "*A bird,* Yuki sends, one eye opening and closing again. *Brown, no bigger than your fist, and very stupid. It is calling for another one. I could arrange for it to stop.*",
            "\"It is a bird,\" Yuki says, from under her own arm. \"Brown, no bigger than your fist. It wants a mate and has no talent for it. It will be at this until it finds one or I find it.\""),
];
/** v0.11.243 (owner picks P15-B, D1; SN7, the owner's rule: seven a story day): the seventh evening of the long calendar's village weeks 1 and 2
 *  (`supper:4` / `supper:5`, after the old three and SUPPER_NEW) and week 1's seventh quiet night (`village_night:quiet`, after QUIET_OLD and
 *  QUIET_W1); each read text 1 again, folded. Fable's run S2, Claude's cuts (D1). */
// v0.11.243 RV1 (T M4, L2; L1 in 3:5): supper4 no longer opens on "in this house" (the quiet seventh, the same evening, does); the mother named as the speaker
export const SN7 = {
    supper4: "Fish bones go on the rim of the bowl here, and never on the table. You learn it by watching Mei Lin's mother look at yours.\n\nYou move them, and being what you are, set them out in order, spine first, then the ribs by size.\n\nThe mother studies the result. \"It is not required to rebuild the fish,\" she says.\n\n\"Ask him what it died of,\" says Mei Lin.\n\n\"Smoke,\" you say. \"Some days ago.\"\n\n\"A guest is not asked to examine his supper.\" Then, to you: \"Tidy,\" the mother says, as a clerk notes a weight, and not yet in your favour.\n\nMei Lin gathers the bowls, admiring yours aloud as far as the basin.",
    supper5: "Age is the question Mei Lin's mother has chosen for this meal: yours. Forty, you tell her. She sets down her bowl to weigh it. \"And a wife?\"\n\n\"None.\"\n\n\"Dead, or never?\"\n\n\"Never. I was at my studies.\"\n\n\"For how long?\"\n\n\"Most of the forty. I passed shortly before I came here.\"\n\n\"A slow scholar,\" she says, \"or a hard examination.\"\n\n\"Both.\"\n\n\"So nobody would have him,\" says Mei Lin, pleased.\n\n\"Mei Lin.\"\n\n\"I am only asking what the lane will ask.\"\n\n\"The lane does not eat here. Pour the guest's water, and be silent while you pour.\"\n\nMei Lin fills your cup until it trembles at the lip, slowly, with her eyes lowered, and you have rarely been told so much by a silence.",
    quiet: quietY("Bed in this house is taken by rank, lowest first, so the lodger climbs the ladder first. From the bedding you follow the rest through the floor: washing water thrown out, an ivory hairpin laid on a shelf, and last the mother's slippers, making one slow circuit of the room. {yuki} The slippers stop, and soon after them so do you.",
        "*I was not sent up at all,* Yuki sends, arriving on the bedding of her own accord. *She looked at me, thought about rank, and went to find her slippers. Draw your own conclusions.*",
        "*I was not sent up at all,* Yuki sends, the ladder complaining under her, rung by rung. *She looked at me, thought about rank, and stood aside. Draw your own conclusions.*",
        "\"I was not sent up at all,\" Yuki says, coming up at her own pace and sitting down to undo her hair. \"She asked whether the honoured one wished to retire. I said presently. Draw your own conclusions.\""),
};
/** v0.11.243 (owner picks P15-B, D1; SF: HS): the herb slopes' week 2 a sequence of two on the long calendar (`seqText` 'herb_slopes:2'): Fable's run SF. */
const slopesW2a = (g) => `Mei Lin works the slope as a general works a map: this patch, then that one, and never the same root twice in a season. She shows you Ninefold grass: how to cut it so that it grows back, and how to tell a good stand from one that has *gone wrong*, the leaves too red, too eager, the Qi in them curdled like old milk.

"You don't need any of this," she says, without looking at you. "Why are you here?"

${g.flags.mei_bruised ? 'Her split lip has scabbed over. She catches you looking at it, and stares back until you look somewhere else.' : ''}`;
const slopesW2b = (g) => `${SLOPES_W2.t}${g.flags.mei_bruised ? `\n\n${SLOPES_W2.bruised}` : ''}`;
const SLOPES_W2 = { t: "On the upper terrace Mei Lin has you on your knees, working a pale root out of the earth with your fingers, because a blade nicks it and a nicked root rots in the jar. She corrects your grip twice. The second time she is plainly enjoying herself.\n\n\"You don't need to sell them and you don't swallow them,\" she says, tamping the hole shut with her heel. \"So it isn't money and it isn't medicine. I've run out of sensible reasons. Give me a foolish one.\"", bruised: "The split in her lip has closed to a thin pale line, which pulls when she grins, and she grins regardless." };
// v0.11.241 (owner picks P13-A with WK-d, D1; SPw3): the village supper's week 3 its own six on the long calendar (`seqText` 'supper:6'; week 2
// keeps 'supper:5'): Fable's runs V1, V2 and W4 (the fourth redrafted, D1's WC), Claude's cuts (D1: RN, SN). Yuki by form in `{yuki}` where used.
export const SW3 = [
    { t: "Between meals your bowl now lives in the grain chest, under the millet. It goes in washed, and the shelf by the door says what it said before you came.\n\nNobody has explained it. Mei Lin's mother digs the bowl out, wipes off the husks and fills it exactly as full as on any other night.\n\n\"A shelf is read from the door,\" she says, since you are looking, and no more is offered.\n\n\"You've been filed under millet,\" says Mei Lin. \"It's an honour. Grandmother's silver is down there.\"\n\n\"There is no silver.\"\n\n\"There's no silver,\" Mei Lin agrees, loudly enough for the lane, and is handed the greens to keep her mouth busy.\n\n{yuki}",
        y: ["Yuki's saucer has kept its place on the stove. *Mine stays out,* she notes. *One of us can be shown to company.*", "Yuki's dish has kept its place by the wall, no chest being equal to it. *Mine stays out,* she notes. *One of us can be shown to company.*", "\"Mine stays out,\" Yuki notes, of the bowl before her. \"It does, honoured one,\" says the mother. \"That one may be seen by anybody.\""] },
    { t: "In the tribute's week the Sect is not named at this table, so Mei Lin has taken to calling it the weather. \"The weather looks very red this week,\" she says, passing the greens. \"I'd call that a sign of rain.\"\n\n\"We do not discuss the weather at meals,\" says her mother.\n\nYou remark, to be helpful, that it does seem to be settling in from the road. Mei Lin makes a noise into her millet. Her mother considers you, and decides the fault lies elsewhere.\n\n\"The guest may speak of the weather. He does not know what he is saying.\" She serves you fish. \"It hears, Mei Lin. It has always heard. Eat.\"\n\n{yuki}",
        y: ["*Ask her whether it'll hail,* Yuki sends, from under the table. You do not.", "*Ask her whether it'll hail,* Yuki sends, from the length of floor she has claimed. You do not.", "\"Will it hail,\" asks Yuki, with interest. The mother answers her, alone of everyone, in full: \"It has, honoured one. In other years.\""] },
    { t: "Halfway down her bowl, Mei Lin's mother asks, of nobody, how old the weaver's girl is now. Mei Lin says seven. Her mother says the girl is small for seven, and Mei Lin says that she is a child and not a gourd, and is not graded by size.\n\nNothing is said for a while.\n\nThen the mother takes the dish with what remains of the fish, covers it with a cloth and sets it by the door. Yuki regards the cloth with the look of one who was not consulted.\n\n\"They have family visiting at the weaver's,\" she says, and stands, her own bowl half full.\n\n\"They haven't.\"\n\n\"Then they will have fish. I shall not go in. I shall say it was left over.\"\n\n\"Nothing has been left over in this house since I was born,\" says Mei Lin.\n\n\"Then I shall say it as though I believed it.\" She takes up the dish and carries it out herself. Her millet is cold when she comes back, and she finishes it without remark." },
    { t: "The lamp has been trimmed to a bead, and the shutters were barred before the pot left the fire. Nobody explains it. You find your bowl by its warmth and the greens by guesswork.\n\n\"A house that shows a light has oil to spare,\" Mei Lin's mother says, serving by touch and spilling nothing. \"A house with oil to spare can spare other things. It is noticed from the road.\"\n\n\"So we're poor by arrangement,\" says Mei Lin, somewhere on your left. \"Mind the fish bones. If you choke, choke modestly.\"\n\n\"We are not poor. We are not conspicuous.\" A dish is set down, exactly. \"Your grandmother ate so, one night of every tribute, and hers before. Nobody choked.\"\n\n\"Nobody was heard to.\"\n\nHer mother lets that pass in the dark, where it cannot be seen to have been allowed. Yuki, who alone can see her supper, eats it with unkind ease." },
    { t: "\"Does your mother live?\" Mei Lin's mother asks it over the greens, in the voice she keeps for debts. You say that she does, and not near.\n\n\"Does she know where you are?\"\n\nYou say that nobody does, and that this includes you.\n\n\"Then you will write to her. That you are housed. That you are fed, and by whom.\"\n\nYou explain that no road goes there.\n\n\"A letter is owed whether or not it can be carried. It will be written, and this house will keep it until it can.\" She fills your bowl, to give you something to report. Yuki, who has met your mother, stays out of it.\n\n\"Put that the fish never changes,\" says Mei Lin. \"She'll know you're not inventing it.\"\n\n\"He will put that the daughter here was properly taught,\" says her mother. \"What she did with it need not travel.\"" },
    { t: "Before the bowls are filled, Mei Lin is made to sit with her back to her mother, and the hairpin comes out. It goes back in bare, and its red tassel lies between the salt and the greens.\n\n\"A thing that swings is looked at,\" the mother says. \"This week, nothing in this house is looked at.\"\n\n\"It's a tassel. It's mine.\"\n\n\"Then it will be yours again when they have gone.\" She serves you, then herself, and her daughter after both, which is not the order of this table.\n\nMei Lin eats watching the tassel.\n\n{yuki}",
        y: ["While her mother is at the pot, Mei Lin ties the tassel round Yuki's neck. The mother comes back, finds red on a spirit-beast, and rules, after thought, that this lies outside her authority.", "While her mother is at the pot, Mei Lin knots the tassel into the fur at Yuki's throat, one berry in a snowfield. The mother comes back, finds red on a spirit-beast, and rules, after thought, that this lies outside her authority.", "While her mother is at the pot, Mei Lin slides the tassel along the table, and Yuki ties it round her own wrist. \"Mine,\" she says, when the mother comes back, and is bowed to, since nobody instructs the honoured one in dress."] }, // v0.11.248 (owner pick P18-A; Fable's, Claude's cuts): HM, "her mother" once
];
const sw3 = (x) => (g) => (x.y ? x.t.replace('{yuki}', byForm(g, ...x.y)) : x.t);
/** The long calendar's old mornings (v0.11.224, owner pick TX2, TS6: DC7–DC9), each now the first of its week's sequence (v0.11.248, P18-A, VM). */
const vmW1Old = (g) => `Morning in the herb loft: mint, hay, and from below the sound of Mei Lin's mother sweeping a floor she swept last night.

There are ${daysWord(tributeLeft(g))} left before the tribute. Ashfall is spending them on deciding what you are, and is in no hurry about it: you cross the lane, and forty houses watch you as they would watch weather coming over the ridge. Yuki has been ruled on already. ${byForm(g, 'A saucer by the door holds fish scraps, and nobody admits to putting it there.', 'A whole smoked fish sits by the door on somebody\'s good plate, and nobody admits to putting it there.', 'A bowl of fish sits by the door with chopsticks laid across it, and nobody admits to putting it there.')}`;
const vmW2 = (g) => `Ashfall in the morning: smoke from forty chimneys, a rooster who is plainly being paid for this, and children watching you from behind every wall.

${DaysWord(tributeLeft(g))} until the collectors. The village is being ordinary as loudly as it can. You have those ${daysWord(tributeLeft(g))} to make sure that when the Crimson Lotus walks up that road, what waits at the top of it is considerably stronger than one confused mycologist and Yuki. The mycologist is where the work is.`;
const vmW3Old = (g) => `${tributeLeft(g) <= 1 ? 'The last day. Tomorrow at sunrise, the collectors.' : 'The last week. When it runs out, at sunrise, the collectors.'}

All of Ashfall is up early, and all of it has found some errand that leads past Mei Lin's house, to see whether you are still there. You are. ${g.flags.loft_burned ? (dayIndex(g, 's:village_morning:3') > 0 ? VM_W3_COLD /* v0.11.248 (P18-A, RV: T M4, C L2): the later mornings, the loft cooled */ : 'What is left of the loft is still smoking a little.') : byForm(g, 'Yuki is sunning herself on the doorstep like a small white guard dog.', 'Yuki is sunning herself across the doorstep like a large white guard dog.', 'Yuki is sunning herself on the doorstep, eyes shut, like a white guard dog in a high black collar.')}`;
/** v0.11.248 (owner pick P18-A; Fable's, Claude's cuts): VM, the long calendar's village mornings by visit (`seqText`; the keys reset with the Coil, as the roof's): week 1 three (the old text first),
 *  week 3 four (the old text first; its last day keeps the old text alone); a new week-3 text's Yuki passage gives way to its own line after a burn (LC1). */
export const VM_W1 = [
    { t: "Your white coat is on the line in the yard, washed. Mei Lin's mother did it while you ate, and you were not consulted.\n\nThe pockets were empty, and she has turned out every one of them to be certain. There are a great many, and she did not approve of the number.\n\n\"She has never washed a thing with so many pockets,\" says Mei Lin from the doorway, enjoying herself. \"She counted them. She will count them once more when it's dry, in case one got away.\"\n\n{yuki}", y: ["*She looked at the tub and then at me,* says Yuki, from the lid of the water butt. *I looked back. We have left it there.*", "*It drips,* says Yuki, who lies sunning herself directly under the coat and declines to move. *I have had worse from you.*", "\"She offered to do my dress next,\" says Yuki, from the wall bench. \"I declined. She bowed, and I believe she was relieved.\""] },
    { t: "The herb loft has a beam at exactly the height of your forehead. You find it on your way back up the ladder, and the house below pauses to listen, then carries on.\n\n{yuki}\n\nNobody downstairs mentions it. But Mei Lin's mother is waiting below the ladder with a folded rag and a length of twine, and she climbs past you without a word. When she comes down the beam is padded. In this house, you gather, that is how a thing gets said.\n\n\"She did the same for my father,\" Mei Lin tells you. \"He was shorter than you, and he learnt quicker.\"", y: ["*Beam,* says Yuki, who watched you walk into it and held her peace. *I'd have warned you, but I was curious.*", "*Beam,* says Yuki, from her half of the loft, which is most of it. *I'd have warned you, but I was curious.*", "\"Beam,\" says Yuki, who clears it by a head and watched you go. \"I'd have warned you, but I was curious.\""] }];
export const VM_W3 = [
    { t: "A woman from down the lane stands at the door of Mei Lin's house holding a sieve. She borrowed it, she says, the winter Mei Lin was born, and she wishes it known that it has come back.\n\nMei Lin's mother takes it in both hands and thanks her gravely. Along the lane other things are going home, a hoe, a ladle, a measure of millet carried level. With the collectors coming, nobody in Ashfall means to be counted while owing. {yuki}", y: ["*You have owed me a fish for years,* says Yuki, from your shoulder. *I mention it only because it seems to be the fashion.*", "*You have owed me a fish for years,* says Yuki, across the threshold, over whom the sieve had to be handed. *I mention it only because it seems to be the fashion.*", "\"You have owed me a fish for years,\" says Yuki, holding the sieve up to the light for flaws. \"I mention it only because it seems to be the fashion.\""], b: "Nobody has called about the scorched loft over your head. That debt is not Ashfall's to settle, and the lane knows whose it is." },
    { t: "Mei Lin's house has gone quiet this week. Her mother puts the bowls back on their shelf without a sound, as if the collectors up the road could hear crockery.\n\nMei Lin, drying the spoons, lets one fall into the pot on purpose. Her mother does not turn round, and the room cools all the same. {yuki}", y: ["Yuki purrs under the table, loudly enough to count as an accomplice, and is excused it, rank having its uses.", "Yuki, who does not fit under the table, purrs beside it like a millstone, and is excused it, rank having its uses.", "Yuki picks a spoon off the cloth and drops it in after Mei Lin's. It is received as a pronouncement, and the mother inclines her head to it."], b: "Soot from the scorched loft has settled along the shelf, and the mother wipes each bowl before it goes up, saying nothing." },
    { t: "Somebody has limed the tribute post white under its red banners, and the smell of wet lime comes through the shutters of Mei Lin's house. It is the brightest thing in Ashfall, and the least loved.\n\nYou open the shutters. The lane is full of people repairing things that work. {yuki}", y: ["*Three men, one gate, nothing wrong with it,* says Yuki from the sill. *I approve. It is how I guard you.*", "*Three men, one gate, nothing wrong with it,* says Yuki, lying across the lane, where the repairs go round her. *I approve. It is how I guard you.*", "\"Three men, one gate, nothing wrong with it,\" says Yuki, leaning out beside you. \"I approve. It is how I guard you.\""], b: "The lime does what it can against the smell of the scorched loft overhead, and loses. Char has been in this house longer, and knows the rooms." }];
export const VM_W3_COLD = "The scorched loft has gone cold, and you sleep under its charred beams with soot in your hair, which they also note."; // v0.11.248 (P18-A, RV; Fable's run RV-V)
const vmText = (x) => (g) => x.t.replace('{yuki}', g.flags.loft_burned && x.b ? x.b : byForm(g, ...x.y));
export const ASHFALL = {
    /* ---------- suppers (Days 4 and 5) ---------- */
    supper: {
        id: 'supper', title: 'Supper', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => {
            const p = hour(g);
            if (p < 19) advance(g, (19 - p) * 60);
            if (daily('supper')(g)) { markDaily(g, 'supper'); eat(g, 30); return ['Millet, greens and a little smoked fish: +30 satiety.']; }
            return [];
        },
        // v0.11.224 (owner pick TX2, TS6: V3a): each story day's supper a sequence of three on the long calendar (lines.js seqText), the first the old
        text: (g) => (vday(g) === 1
            ? seqText(g, 'supper:4', [(g) => `${g.flags.ignored
                ? 'You ask your way to her house. On the doorstep you apologise, in full, without one joke. She studies you until the silence has made its point, then steps aside, which you did not deserve, and sets a bowl before you, which you deserved even less.'
                : 'Mei Lin\'s house has two rooms, a herb loft, and a mother: a tiny, fierce woman who looks you over once and puts more millet in the pot without a word.'}

${byForm(g, `"${DaysWord(tributeLeft(g))}," the mother says, to the pot, ladling. "${DaysWord(tributeLeft(g))}, and they come up that road. Every year of my life." She gives you the largest piece of fish and looks at Yuki, then at you. "You will sleep in the loft. It is not proper. It is necessary." Her eyes rest on Yuki a while longer, and she inclines her head to her, by very little. "The spirit-beast will sleep where it chooses. One does not command such creatures."

Yuki, on the warm stove, closes her eyes in complete agreement.`, `"${DaysWord(tributeLeft(g))}," the mother says, to the pot, ladling. "${DaysWord(tributeLeft(g))}, and they come up that road. Every year of my life." She gives you the largest piece of fish and looks at Yuki, who is lying along the whole of the far wall, then at you. "You will sleep in the loft. It is not proper. It is necessary." Her eyes rest on Yuki a while longer, and she inclines her head to her, lower than she has to anyone tonight. "The spirit-beast will sleep where it chooses. One does not command such creatures. One moves the bench."

Yuki, with the stove at her back and most of the floor under her, closes her eyes in complete agreement.`, `"${DaysWord(tributeLeft(g))}," the mother says, to the pot, ladling. "${DaysWord(tributeLeft(g))}, and they come up that road. Every year of my life." She gives you the largest piece of fish. The next largest goes to Yuki, who has been seated at the head of the table, where the ears and the tail can be kept in view. "You will sleep in the loft," she tells you. "It is not proper. It is necessary." Then she inclines her head to Yuki, deeper than she has for anyone at this table. "The honoured one will sleep where she chooses. One does not assign a mat to such a guest."

"The stove," says Yuki, who has had her eye on it since she sat down. The mother nods, as one authority to another.`)}`, (g) => `${g.flags.ignored
    ? 'The door opens before you knock, which you take for progress until you see it was the mother who opened it. Mei Lin has not mentioned the apology since she heard it. She has put your bowl where it stood the night before, and you are learning to read that.'
    : 'The house has made room for you by moving one basket. There is a bowl at your place before you sit, and the mother no longer looks you over; she has seen what there is.'}

${byForm(g, `You asked to help with the pot. Mei Lin's mother weighed it as a magistrate would a petition, and granted you the greens. She stands at your elbow while you cut them. "Thinner," she says. Of the garlic you found in her own store and fried first, she says, "This is not how it is done," and takes a second helping. Mei Lin watches that happen and says nothing, with great enjoyment. The fish her mother divides herself. The belly piece goes onto a saucer, and the saucer onto the stove, set down with both hands. "For the spirit-beast," she says, to the room, in case anyone had thought it an accident.

Yuki eats it facing the wall, as an offering should be eaten. *She's the only one here who understands rank.*`, `You asked to help with the pot. Mei Lin's mother weighed it as a magistrate would a petition, and granted you the greens. She stands at your elbow while you cut them. "Thinner," she says. Of the garlic you found in her own store and fried first, she says, "This is not how it is done," and takes a second helping. Mei Lin watches that happen and says nothing, with great enjoyment. The fish her mother divides herself. The belly piece and the two next to it go into the big serving dish, and the dish onto the floor by the wall, set down with both hands. "For the spirit-beast," she says, to the room, in case anyone had thought it an accident.

Yuki, who occupies the wall and the place where the bench used to stand, eats without lifting her chin off her paws. *She's the only one here who understands rank.*`, `You asked to help with the pot. Mei Lin's mother weighed it as a magistrate would a petition, and granted you the greens. She stands at your elbow while you cut them. "Thinner," she says. Of the garlic you found in her own store and fried first, she says, "This is not how it is done," and takes a second helping. Mei Lin watches that happen and says nothing, with great enjoyment. The fish her mother divides herself. The belly piece goes to the head of the table, set down with both hands. "For the honoured one."

"The greens are his," Yuki tells her, eating them. "He is permitted near food. It is his one use." The mother receives this as she would a ruling, and hands you back the knife.`)}`, (g) => `${g.flags.ignored
    ? 'You are let in without a word, and tonight the silence is only how this house eats. Mei Lin hands you the bowls to carry to the table. It is the one job a guest is never given, and you understand that you have been moved to a different list.'
    : 'By now you know which board by the door complains and which stool is yours. It is the low one. The mother watches you take it unprompted and adds millet to the pot, as she has each night, still with no comment.'}

${byForm(g, `What this house owes the post stands by the door in two sacks, weighed and tied. Mei Lin's mother has weighed them again since morning; the steelyard is still out. "The Sect's measure is larger than ours," she says, serving the fish. "Each year it is a little larger. One does not remark on it." "One remarks on it constantly," says Mei Lin. "One just does it indoors." She glances at the shutter all the same. "Indoors," her mother says, "is where it will stay." Yuki has chosen the nearer sack to sleep on. The mother looks at this, sets the Sect's displeasure against a spirit-beast's, and leaves her there.

*It's lumpy,* Yuki reports. *Tell them I said so.*`, `What this house owes the post stands by the door in two sacks, weighed and tied. Mei Lin's mother has weighed them again since morning; the steelyard is still out. "The Sect's measure is larger than ours," she says, serving the fish. "Each year it is a little larger. One does not remark on it." "One remarks on it constantly," says Mei Lin. "One just does it indoors." She glances at the shutter all the same. "Indoors," her mother says, "is where it will stay." Yuki lies across the doorway with both sacks behind her, so that anyone wanting them must first take the matter up with her. The mother looks at this arrangement and finds nothing in it to correct.

*Tell her I charge less than the Sect,* Yuki sends, and yawns, which is a lot of teeth to show a household at supper.`, `What this house owes the post stands by the door in two sacks, weighed and tied. Mei Lin's mother has weighed them again since morning; the steelyard is still out. "The Sect's measure is larger than ours," she says, serving the fish. "Each year it is a little larger. One does not remark on it." "One remarks on it constantly," says Mei Lin. "One just does it indoors." She glances at the shutter all the same. "Indoors," her mother says, "is where it will stay." Yuki, at the head of the table, has been listening with her ears forward.

"How much larger," she asks. The mother tells her, to the handful. Yuki nods and says no more, and you, who know that nod, eat your fish and feel briefly sorry for the measure.`)}`, ...SUPPER_NEW[4], SN7.supper4]) /* v0.11.243 (P15-B, SN7): the seventh */
            : vday(g) >= 3 ? seqText(g, 'supper:6', SW3.map(sw3)) // v0.11.241 (owner picks P13-A, WK-d): week 3 its own six (the long calendar only)
            : seqText(g, 'supper:5', [/* v0.11.248 (P18-A, HM; Fable's run HM): "her mother" twice */ (g) => `Another supper at Mei Lin\'s. Her mother no longer watches you as she would a fox in the henhouse. She watches you as she would a fox she might find a use for.

Tonight she talks. Of Mei Lin's father, who had a spirit root, and who went up the road with the collectors when Mei Lin was six. Of the letter that came down four years later, two words long: *Tribulation. Honoured.* Of the box they buried, which had nothing in it.

Mei Lin clears the bowls through all of it, as loudly as bowls can be cleared. When the telling is done she says, with her back to the room, "He'd have liked you. He was an idiot too."

"*Mei Lin.*" The mother says it once, and it closes like a door. "You do not speak so of your father." Mei Lin does not apologise. She does not stop smiling either, and she does not look at her mother again until the meal is over.`, (g) => `Supper at Mei Lin's has acquired rules, and you have learned most of them by breaking them. You sit where you are put. You thank the mother for the food once, since twice would suggest surprise.

She has not spoken of her husband since the night of the empty box. She asks about you now, one question a meal, placed with care. Tonight: what a man does who studies mushrooms. You tell her. It is not a short answer, and you hear yourself getting interested.

She hears you out in silence. "So," she says at the end. "You know which ones kill." You admit that this is a fair summary of your education. She nods and serves you more greens, satisfied that you have a trade.

"He knows which ones glow, too," says Mei Lin. "He told me. He was so pleased about it." Then she catches her mother's eye and takes a sudden interest in her millet.

Her mother lets the remark cool. "The dyer's wife has asked twice whether the foreigner cooks. I said a kitchen is not gossip." She sets an onion by your bowl. "This came with the question."`, (g) => `The mother has let you cook. Nobody in the house treats this as a small matter, least of all her: she stood in the doorway for the whole of it with her arms folded and corrected nothing, which Mei Lin says has never happened to anyone.

It is the same millet, greens and fish as every night. You toasted the grain dry before the water went in and flaked the fish through at the end, and that is all you did. The mother eats one mouthful, puts her chopsticks down, and looks at the bowl as she might at a neighbour's child come home wearing silk. Then she finishes it, at her usual pace, in silence.

"My husband could not boil water," she says at last. She has not named him since the night she told you of the letter, and she says no more now. She passes her bowl back to be filled again.

"Twenty-six years," Mei Lin says to you, filling it, "and she has never once asked me for seconds."

"You have never once toasted the millet," says her mother. Mei Lin opens her mouth, finds nothing in it, and gives you a look that says this is your doing. It is.`, ...SUPPER_NEW[5], SN7.supper5])) /* v0.11.243 (P15-B, SN7): the seventh */,
        choices: [
            { text: 'Climb out onto the roof with Mei Lin and watch the stars come out.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 4); return []; }, time: 60, to: 'supper_roof' },
            { text: 'Help her mother with the dishes, and listen.', do: (g) => { bumpRel(g, 'Village', 3, 0); bumpRel(g, 'Mei Lin', 2, 0); bumpRel(g, 'Mother', 2, 0); return [DR_DISHES(g)]; }, time: 60, to: 'village_night' }, // v0.11.139 (owner pick MW1, MB): Mother +2
            { text: 'Go up to the loft early. Tomorrow will want everything you have.', to: 'village_night' },
        ],
    },
    supper_roof: {
        id: 'supper_roof', title: 'The Roof', art: 'roof', place: `${P} — on Mei Lin's roof`,
        text: (g) => (roofWeek(g) === 3 ? seqText(g, roofKey(g), ROOF_W3) /* v0.11.247 (P17-A, SR3): week 3 its own */ : seqText(g, roofKey(g), [(g) => (vday(g) === 1 // v0.11.232 (P5-B, V3b): the old text first
            ? `The thatch still holds the day's warmth. The stars come out singly, then in a crowd, and every constellation among them is wrong.

"Which one's yours?" Mei Lin asks.

You search long enough to be sure. "None of them. Mine's too far to see." You point anyway, at an arbitrary patch of dark. "There. Probably. Give or take a galaxy."

She gives the patch of dark her full and serious attention. "It looks cold."

"It was warm. We grew our houses out of trees. They sang back when you sang to them." You stop. "Sorry. That sounds insane."

"It sounds," she says, "like the only thing anyone has told me in years that I wanted to be true."`
            : `Up on the roof again. This time she brings the plum wine, and does not ask whether you want any.

She tells you what the tribute costs, in numbers: so many baskets of grass, so many sacks of millet, so many children tested for roots. Which families hid their children last year, and which of those were caught. Her voice is perfectly level through all of it. Her hands are not.

After that she says nothing until the jar is nearly empty. Your forearm has been playing something slow and sad, very low, all evening. "Leave it," she says, when you reach to stop it. "It sounds like you do when you think nobody is watching." Then she lets her shoulder rest against yours, and neither of you mentions it.`), ...ROOF_NEW[vday(g) === 1 ? 1 : 2]])),
        choices: [{ text: 'Stay until the cold drives you in.', do: (g) => { bumpRel(g, 'Mei Lin', 2, 3); if (roofWeek(g) === 3) { const i = dayIndex(g, `s:${roofKey(g)}`) % ROOF_W3.length; return [(g.flags.loft_burned && ROOF_BURNED[i]) || ROOF_STAY[3][i]]; } /* v0.11.248 (P18-A, LF: LC1) */ /* v0.11.247 (P17-A, SR3) */ const ri = dayIndex(g, `s:${roofKey(g)}`) % (ROOF_NEW[vday(g) === 1 ? 1 : 2].length + 1); /* v0.11.234 (P7-A, RN): the later nights a cycle of six; RV1 (CL; C L3): the cycle's length from its own list (the old text + ROOF_NEW's), so the line after keeps step with seqText */ return [ri ? ROOF_STAY[vday(g) === 1 ? 1 : 2][ri - 1] : vday(g) === 1 ? `You stay until your fingers stop working and she has run out of ways to hide that she is shivering. "Tell me about the trees again," she says on the way down, and you do, as far as the loft ladder. She does not say it sounds insane. She says goodnight as if the word cost her something.` : `Neither of you mentions it on the way down, either. At the foot of the ladder she takes the empty jar out of your hand, keeps hold of your wrist a little longer than the jar requires, and goes to her mother's room without looking back. You climb to the loft with one shoulder still warm.`]; }, to: 'village_night' }],
    },

    /* ---------- the night: quiet, or Gao Feng's doing (night 5) ---------- */
    village_night: {
        id: 'village_night', title: 'Night in Ashfall', art: (g) => (arsonNight(g) ? ((g.flags.gao_broken) ? 'token' : g.flags.gao_spared ? 'gao_window' : 'arson') : 'village_night'), place: (g) => `${P} — ${g.flags.loft_burned ? 'the scorched loft' : 'the herb loft'}` /* v0.11.248 (P18-A, LX1: LC1's headers) */,
        // v0.11.94 (owner 2026-11-09 11:35, pick T-b1): night 2's beats (the arson, Gao's token, Gao at the window) come after
        // the bed at 01:00, like the camp nights (never back; the fight taken at once is over by 02:00, one after a failed
        // "Wake the street" starts at 01:50, like the camps' forced fights); a quiet night is untouched
        enter: (g) => (arsonNight(g) ? nightTo(g, 60) : []), // v0.11.151 (WD1, LN): the slept line
        dayKey: (g) => (arsonNight(g) ? null : 'village_night:quiet'), // v0.11.230 (P3-2, FT): the quiet nights' own count (an arson night is no step)
        text: (g) => {
            // v0.11.230 (owner picks P3-2, D1: FT; Fable's, Claude's cuts): the quiet night a sequence of three by its own day key (`dayKey` below); weeks 2 and 3 six each since v0.11.242 (P14-A)
            if (!arsonNight(g) && QUIET_WEEK[vday(g)]) return seqText(g, `village_night:${vday(g)}`, QUIET_WEEK[vday(g)]); // v0.11.237 (P10-A, EVk): weeks 2 and 3 their own three; v0.11.242 (P14-A, EVn-23): six each (RV1, C L2)
            if (!arsonNight(g)) return byDay(g, [...QUIET_OLD, ...QUIET_W1, SN7.quiet], 'village_night:quiet'); // v0.11.238 (P11-A, EVn-1): the first week six on the long calendar; v0.11.243 (P15-B, SN7): seven
            if (g.flags.gao_broken) return `It is still dark when Mei Lin's hand on your shoulder wakes you. Her other hand is closed on a twist of cloth, and in the cloth is Gao Feng's jade token: she had it out of his sleeve while he was lying in the herbs with his arm pointing the wrong way.

The jade is warm. It *beats*, slow and faint, as if it kept a pulse of its own.

"Sect tokens talk to one another," she whispers. "Gao reached home today. By now they've heard him out: a mortal with no root and no Qi snapped a Crimson Lotus disciple like kindling." No smile comes with it. "They won't believe a word. That's the worse half. They'll come and look for themselves, and this will tell them exactly where to stand."`;
            if (g.flags.gao_spared) return `A pebble clicks off the shutter and wakes you. A second follows it.

Gao Feng is standing in the lane below, by himself, in the moonlight. One hand is in bandages, and the road has dusted his crimson robe grey. On the herb slope he looked older than this, and nowhere near as afraid.

"I am not here to fight," he says, hardly above a breath, and he bows: the whole bow, to its full depth, to a man in a lab coat at a window. "You left me my life. That is a debt. Why you did it, I cannot tell, and a debt I do not understand is one I cannot repay. I have not slept on it."`;
            return `${byForm(g, 'Yuki wakes you with four claws and one urgent thought: *fire.*', 'Yuki wakes you with one heavy paw, laid on your chest, and one urgent thought: *fire.*', 'Yuki wakes you with a hand on your shoulder and one word, spoken almost without breath: "Fire."')}

Down in the lane, torchlight. Three men are creeping toward the side of the house, where Mei Lin's herb loft, the one you are sleeping in, stands on its dry wooden posts. The man in front has a pocked face you remember from the herb slope.

Gao Feng's lackey has come to settle Gao Feng's grudge. With a torch. By night. A traditionalist.`;
        },
        choices: [
            { text: 'Sleep.', show: (g) => !arsonNight(g), to: 'village_morning' },
            // Gao broken (or dead, old saves): the token
            { text: 'Crush the token in a fist of bone. Silence it.', show: (g) => arsonNight(g) && !!(g.flags.gao_broken), qi: 4, check: { skill: 'Convergence Use', dc: 4 }, do: (g) => { g.flags.night5_done = true; g.flags.token_silenced = true; return ['The jade cracks with the sound of a bell rung under water. The pulse stops. Lu Han will have nothing to follow here.']; }, failDo: (g) => { g.flags.night5_done = true; addItem(g, 'sect_token', 1); return ['The bone skids off it, and it goes on pulsing. You put it in the hammerspace and hope that folded space can keep a secret.']; }, to: 'village_morning' },
            { text: 'Carry it far into the forest and bury it in the mire.', show: (g) => arsonNight(g) && !!(g.flags.gao_broken), time: 120, check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.night5_done = true; g.flags.token_silenced = true; return ['Lu Han is welcome to search a swamp for his cousin.']; }, failDo: (g) => { g.flags.night5_done = true; g.james.hp -= 3; return ['You get it buried, and something in the mire bites you for your trouble: −3 HP.']; }, to: 'village_morning' },
            // Gao spared: the visit
            { text: '"Because I\'m not from here. Where I\'m from, we don\'t kill people for being stupid. Go home, Gao."', show: (g) => arsonNight(g) && !!g.flags.gao_spared, check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.night5_done = true; g.flags.gao_turned = true; return ['He looks up at you until the silence is awkward. Then he tells you all of it: Lu Han is bringing four men, not two. He wants you alive. He takes you for the heir of a hidden sect. "Let him go on thinking so," Gao says, and is gone.']; }, failDo: (g) => { g.flags.night5_done = true; g.flags.gao_warned = true; return ['He does not believe you. He warns you anyway: Lu Han wants you alive. Then the lane is empty.']; }, to: 'village_morning' },
            { text: 'A bone needle into the post an inch from his ear. "Ask me again and I\'ll explain it slower."', show: (g) => arsonNight(g) && !!g.flags.gao_spared, qi: 3, do: (g) => { g.flags.night5_done = true; g.flags.gao_warned = true; return ['The colour leaves his face. Lu Han wants you alive, he says, all in one breath, and then he is running.']; }, to: 'village_morning' },
            // Gao alive and humiliated: arson
            { text: 'Drop out of the loft into the middle of them.', show: (g) => arsonNight(g) && !(g.flags.gao_broken) && !g.flags.gao_spared, combat: arson, to: 'arson_won' },
            { text: 'Wake the street. Let forty houses deal with three men.', show: (g) => arsonNight(g) && !(g.flags.gao_broken) && !g.flags.gao_spared, check: { skill: 'GU', dc: 4, bonus: (g) => ((g.rel.Village?.f || 0) >= 20 ? 2 : 0) }, do: (g) => { g.flags.night5_done = true; bumpRel(g, 'Village', 6, 0); return ['Up and down the lane the shutters crash back. Pock-Face and his two friends turn round into a hedge of pitchforks, and go home lighter by several teeth.']; }, fail: 'arson_start', to: 'village_morning' },
        ],
    },
    arson_start: {
        id: 'arson_start', title: 'Torches', art: 'arson', place: `${P} — the lane`,
        text: (g) => `The street is too slow to wake. Pock-Face finds you at the window, and he laughs.${byForm(g, '', " Behind you the loft boards creak as Yuki gets up, all of her. *He's only counted one of us,* says the bond.", " Behind you Yuki is standing already. \"He has counted one of us,\" she says, without much interest.")}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Then it\'s the hard way.', combat: arson, to: 'arson_won' }], // v0.11.169 (CA1, LB; Fable's wording): was "Then it's just you." (Yuki is there in two forms)
    },
    arson_won: {
        id: 'arson_won', title: 'Ash on the Lane', art: 'arson', place: `${P} — the lane`,
        enter: (g) => { g.flags.night5_done = true; g.flags.arson_beaten = true; bumpRel(g, 'Village', 10, 0); bumpRel(g, 'Mei Lin', 4, 3); return []; },
        text: `When the shutters open at last there is only the end of it to see: two thugs running, Pock-Face flat in the lane with a sliver of bone nailing his sleeve to the ground, and his torch hissing itself out in the gutter.

Half the lane turns out in its nightclothes, and nobody speaks. Then Mei Lin's mother arrives, in hers, considers Pock-Face at her feet, and says, as a magistrate passes sentence: "You came by night to burn a widow's house. Your ancestors will hear of it from me." She goes back to bed. Pock-Face, you observe, is crying.

That is the moment Ashfall decides you are theirs.`,
        choices: [{ text: 'Back to the loft.', to: 'village_morning' }],
    },
    arson_lost: {
        id: 'arson_lost', title: 'Smoke', art: 'arson', place: `${P} — the lane`,
        enter: (g) => { g.flags.night5_done = true; g.flags.loft_burned = true; return []; },
        text: (g) => `You don't stop them.${byForm(g, '', " Yuki has one of them flat in the lane under both forepaws, and it is the wrong one: the torch was in the other man's hand. She keeps him all the same, and when the street has finished with the fire it finds it still has somebody to be grave at.", " Yuki has one of them pinned in the lane with her knee between his shoulders, and it is the wrong one: the other man had the torch. She keeps him all the same, so that when the street has finished with the fire there is still somebody left for it to be grave at.")} The loft catches like paper. A year of Mei Lin's herbs, dried, sorted and tied, goes up in a single roar of sweet smoke. The street has the fire out before the house takes, and not by much.

Mei Lin stands in the lane, soot across her face, and looks at what is left. She says nothing at all. Any word from her would be easier to carry than that.`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; v0.11.131 (XB2, AP): she keeps him
        choices: [{ text: 'Sleep in the kitchen. If you can.', do: (g) => { bumpRel(g, 'Mei Lin', 0, -3); return []; }, to: 'village_morning' }],
    },

    /* ---------- mornings ---------- */
    village_morning: {
        id: 'village_morning', title: (g) => `Day ${day(g)}`, art: 'village', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) lines.push(nightRest(g)); // v0.11.92 (X1): half back after the arson fight
            if (weekMorning(g)) g.flags.vday = vday(g) + 1; // v0.11.203 (T1, TS1): once a week in the long calendar
            eat(g, 20);
            lines.push('Breakfast at Mei Lin\'s: rice gruel and pickles, +20 satiety.');
            return lines;
        },
        // v0.11.224 (owner pick TX2, TS6: DC7–DC9): the long calendar's first week has its own mornings (story day 6's showed before); the counts from the calendar
        text: (g) => (vday(g) === 1
            ? seqText(g, 'village_morning:1', [vmW1Old, ...VM_W1.map(vmText)]) /* v0.11.248 (P18-A, VM) */
            : vday(g) === 2
            ? vmW2(g)
            : tributeLeft(g) > 1 ? seqText(g, 'village_morning:3', [vmW3Old, ...VM_W3.map(vmText)]) /* v0.11.248 (P18-A, VM) */ : vmW3Old(g)),
        choices: [{ text: 'Out into the village.', to: 'ashfall' }],
    },

    /* ---------- the day hub ---------- */
    ashfall: {
        id: 'ashfall', title: 'Ashfall', art: 'village', place: P,
        text: (g) => {
            const h = hour(g);
            const when = byDay(g, [0, 1], 'ashfall') // NT1 (Fable's draft): a second set of the times of day
                ? (h < 11 ? `Morning. Smoke going straight up, and the sound of somebody splitting wood as if it had wronged him.` : h < 15 ? `Midday. The well rope is too hot to hold and the dogs have gone under the houses.` : h < 18 ? `Late afternoon. The shadows of the houses have reached the far side of the street, and the cooking smells begin.` : `Dusk. Shutters closing one after another down the street, like a sentence being finished.`)
                : (h < 11 ? 'Morning. Ashfall is up, and already at work.' : h < 15 ? 'Midday, and hot. The chickens have stopped trying.' : h < 18 ? 'Late afternoon: long shadows, and woodsmoke from the cooking fires.' : 'Dusk. Lamps are being lit behind the shutters.');
            return `${when} ${vday(g) === 3 ? (tributeLeft(g) <= 1 ? 'The red banners on the tribute post hang dead still. Tomorrow.' : 'The red banners on the tribute post hang dead still. Within the week.') : `The tribute is ${daysWord(tributeLeft(g))} off.`}

${[pantry(g), g.james.satiety < 30 ? 'You are hungry.' : '', g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''].filter(Boolean).join(' ')}`; // v0.11.169 (RV1, L8): no double space when a clause is empty
        },
        choices: [
            { text: 'Visit Old Wen.', show: (g) => !g.flags.elder && !late(g), time: 30, do: set('elder'), to: 'elder' },
            { text: 'Go to the coughing house. A child is sick.', show: (g) => !g.flags.healed_try && !late(g), time: 30, to: 'heal' },
            { text: 'Hunt the ironhide boar past the oak hollow.', show: (g) => !g.flags.village_hunt && hour(g) < 15, time: 90, to: 'village_hunt' },
            { text: 'Gather herbs with Mei Lin on the slopes.', show: (g) => daily('slopes')(g) && hour(g) < 15 && vday(g) >= 2, // RV1 (H3a): not in the first week
              time: 30, to: 'herb_slopes' },
            { text: 'Run a clinic: the sick and the hurt line up at the well.', show: (g) => !!g.flags.healed_try && !late(g), time: 20, to: 'clinic' },
            { text: 'Bone workshop: make things the village needs.', show: (g) => !late(g), time: 10, to: 'workshop' },
            { text: 'Drill the village hunters. They\'ll be standing next to you at the post.', show: (g) => !late(g), time: 10, to: 'drill' }, // v0.11.169 (CA1, LB): this and the spearheads said "tomorrow" on Day 5 too
            { text: 'Sit with Old Wen and listen.', show: (g) => !!g.flags.elder && daily('wen')(g) && !late(g), time: 20, to: 'wen_lesson' },
            { text: 'Hunt beyond the oak hollow.', show: (g) => daily('far')(g) && hour(g) < 16, time: 60, to: 'far_hunt' },
            { text: 'Scout the tribute road.', show: (g) => vday(g) === 3 && !g.flags.scouted_try && hour(g) < 17, time: 30, to: 'scout' },
            { text: 'Walk with Mei Lin at sunset.', show: (g) => daily('walk')(g) && hour(g) >= 15 && hour(g) < 20 && vday(g) >= 2, // RV1 (H3a)
              time: 30, to: 'mei_walk' },
            { text: 'Eat at the communal pot.', show: (g) => daily('pot')(g) && g.james.satiety < 80 && !late(g), time: 30, do: (g) => { markDaily(g, 'pot'); eat(g, 25); return [potLine(g, 'ashfall') ?? 'Barley and bean stew, ladled by a woman who addresses you as "honoured guest" in the tone of someone who has not yet ruled on whether you are one: +25 satiety.']; }, to: 'ashfall' }, // v0.11.181 (SP1, PS): from the village's 90, potLine
            { text: 'Eat something from the hammerspace.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'ashfall' },
            { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['+8 HP. The flavour is still cellar.']; }, to: 'ashfall' },
            { text: 'Cultivate behind the shrine: one sit, 10 Qi.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'ashfall' },
            { text: 'Rest an hour in the shade by the well.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'ashfall' },
            { text: 'Evening. Go home to Mei Lin\'s.', show: (g) => hour(g) >= 16, time: 20, to: nextEvening },
        ],
    },

    herb_slopes: {
        id: 'herb_slopes', title: 'The Herb Slopes', art: 'herb_slope', place: `${P} — the herb slopes`,
        enter: (g) => { markDaily(g, 'slopes'); return []; },
        text: (g) => (vday(g) === 2
            ? seqText(g, 'herb_slopes:2', [slopesW2a, slopesW2b]) // v0.11.243 (P15-B, SF: HS): week 2 two texts
            : `${tributeLeft(g) <= 1 ? 'It is the last day on the slopes before the tribute. She cuts double what she needs and offers no reason. You ask for none. It needs no saying: should tomorrow go wrong, she will have no next season to cut in.' : 'It is the last week on the slopes before the tribute. She cuts double what she needs and offers no reason. You ask for none. It needs no saying: should the tribute go wrong, she will have no next season to cut in.'} Halfway along the terrace, with her back to you and the knife still working, she asks again what a man who needs none of this is doing up here.

Her father comes up again, briefly. He would walk her up here and get the name of every plant wrong, on purpose, so that she had to put him right.`),
        choices: [
            { text: 'Learn properly. Ask questions, take samples, run the omnitool on everything.', check: { skill: 'GU', dc: 3 }, time: 150, do: (g) => { addItem(g, 'spirit_grass', 2); bumpRel(g, 'Mei Lin', 4, 2); return [`+2 Ninefold spirit grass (trade goods). ${DR_SLOPES(g)}`]; }, failDo: (g) => { addItem(g, 'spirit_grass', 1); bumpRel(g, 'Mei Lin', 2, 1); return ['You cut one stand wrong. She sighs at you as teachers sigh. +1 Ninefold spirit grass.']; }, to: 'ashfall' },
            { text: 'Answer her question. Honestly.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 5); return ['"Because you\'re here," you say. You hear it, are appalled, and add: "The grass is also fascinating." She laughs until her legs give up and she sits down in it. One terrace over, an old herb-woman unbends and fixes her with a stare until the laughing stops. The stare is needed for a while.']; }, time: 150, to: 'ashfall' },
        ],
    },

    clinic: {
        id: 'clinic', title: 'The Well', art: 'healer', place: `${P} — by the well`,
        enter: (g) => { markDaily(g, 'clinic'); return []; }, // v0.11.157 (NX1, PA): a mark for "Call it a day" only, no longer a gate
        text: (g) => `Word of the boy has gone round. Now there is a line at the well: an old man whose hand has gone purple, a girl with a burn, a hunter with a wound that smells wrong, a mother with a baby that will not stop crying.

${g.inventory.jade_bracket ? 'You have jade bracket in the hammerspace. Fifteen years of mycology, and it comes down to a stone well and a queue.' : 'The fungus is gone. You have two hands, a bone lancet, boiling water and a doctorate. They will have to do.'}`,
        choices: [
            { text: 'Treat them with the jade bracket.', show: (g) => hasItem(g, 'jade_bracket'), check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 150, do: (g) => { addItem(g, 'jade_bracket', -1); bumpRel(g, 'Village', 8, 0); g.flags.clinics = (g.flags.clinics || 0) + 1; return [DR_CLINIC_J(g)]; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); bumpRel(g, 'Village', 3, 0); return [JADE_FAIL]; }, to: 'ashfall' },
            { text: 'Treat them with what you have.', check: { skill: 'GU', dc: 5 }, time: 150, do: (g) => { bumpRel(g, 'Village', 6, 0); g.flags.clinics = (g.flags.clinics || 0) + 1; return [DR_CLINIC(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_CLINIC_F(g)]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    workshop: {
        id: 'workshop', title: 'Bone Workshop', art: 'workshop', place: `${P} — the smithy, borrowed`,
        enter: (g) => { markDaily(g, 'workshop'); return []; }, // v0.11.157 (NX1, PA): a mark for "Call it a day" only, no longer a gate
        text: `The smith lends you his bench and takes up a position well back from it. You sing bone into the shapes Ashfall has needed for years and cannot afford in iron. The children gather at a safe distance, and then at an unsafe one.`,
        choices: [
            { text: 'Needles and fishhooks for half the village.', qi: 3, check: { skill: 'Convergence Use', dc: 3 }, time: 120, do: (g) => { bumpRel(g, 'Village', 5, 0); return [DR_HOOKS(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_HOOKS_F(g)]; }, to: 'ashfall' },
            { text: 'Spearheads for the hunters. They\'ll need them when the collectors come.', show: (g) => !g.flags.spears, qi: 5, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 120, do: (g) => { g.flags.spears = true; bumpRel(g, 'Village', 4, 0); return ['Six white spearheads, hard as antler and sharp as an insult.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return [SPEARS_FAIL]; }, to: 'ashfall' },
            { text: 'A bone plough-share for the barley field.', show: (g) => !g.flags.plough, qi: 6, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 150, do: (g) => { g.flags.plough = true; bumpRel(g, 'Village', 10, 0); return ['It goes through the black earth like a knife through curd. Old Wen comes out to watch, and says nothing until the furrow is done.']; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_PLOUGH_F(g)]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    drill: {
        id: 'drill', title: 'The Hunters', art: 'drill', place: `${P} — the threshing floor`,
        enter: (g) => { markDaily(g, 'drill'); return []; }, // v0.11.157 (NX1, PA): a mark for "Call it a day" only, no longer a gate
        text: (g) => `Eight hunters: two of them white-bearded and old enough to be bowed to in the street, and one of them twelve. They have bows, boar spears, and the faces of men who have knelt to the Crimson Lotus every year of their lives.

${g.flags.militia ? 'They are faster than they were, and they stand differently. That may be the most dangerous thing you have done here.' : 'You are no soldier. You are, however, a man who has just spent several days learning to stay alive against things with more teeth than he has. That much you can teach.'}`,
        choices: [
            { text: 'Teach them to fight together: shields of bone, spears behind, nobody alone.', check: { skill: 'GU', dc: 3, band: 'challenging' }, time: 150, do: (g) => { g.flags.militia = (g.flags.militia || 0) + 1; bumpRel(g, 'Village', 4, 0); return [DR_DRILL(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return [DR_DRILL_F(g)]; }, to: 'ashfall' },
            { text: 'Spar with the best of them, and let Yuki show them what speed looks like.', check: { skill: 'GU', dc: 4 }, time: 120, do: (g) => { bumpRel(g, 'Village', 3, 0); return [DR_SPAR(g), ...awardYukiFightXp(g, 'standard')]; }, failDo: (g) => { g.james.hp -= 2; return [`${DR_DRILL_SPAR_F(g)} −2 HP.`, ...awardYukiFightXp(g, 'standard')]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    wen_lesson: {
        dayKey: (g) => `wen_lesson:${g.flags.lore_realms ? 'forest' : 'realms'}`, // NT1 (Fable's draft): the forest talk's own days, so its first day is its first text
        id: 'wen_lesson', title: 'Old Wen', art: 'elder', place: `${P} — the elder's house`,
        enter: (g) => { markDaily(g, 'wen'); return []; },
        text: (g) => (!g.flags.lore_realms
            ? `Old Wen pours tea and talks of cultivation as an old farmer talks of weather: without hope, without fear, and in exact detail, to the last hailstone.

Mortal Vessel. Foundation. Core Formation. The realms stand one above another into cloud, and each costs more than the one below it. The Sect buys its rungs with villages like this one: grass, grain, children. "A ladder," he says, "is only a ladder while somebody holds the bottom."`
            : byDay(g, [(g) => `Today's lesson is the Old Tree, in the midst of the wilds — "there before the Sect, there before my grandfather's grandfather" — and what the hunters' tales hold of it: that it once sang, and the singing made the forest kind.

"Then a day came when it sang no more. And the forest was kind no more." He turns the good eye your way. ${byForm(g, "\"Your cat has been staring toward it since you came.", "\"Your great beast has been staring toward it since you came.", "\"Your companion has been staring toward it since you came.")} So have you."`, (g) => `He comes back to the forest today, as you thought he might. To the Old Tree — "older than the Sect, older than the oldest grave on the hill" — and to what the hunters' grandfathers said of it: that in the years it sang, a child could sleep under any branch in the forest and wake with nothing worse than dew.

"I do not say it is true. I say it was said, and by serious men." He turns his cup a quarter turn, exactly. ${byForm(g, "\"Your cat sits facing it. Every day, the same way, like a needle.", "\"Your great beast lies facing it. Every day, the same way, like a needle.", "\"Your companion sits facing it. Every day, the same way, like a needle.")} You do the same, and do not know that you do it."`], 'wen_lesson:forest')),
        choices: [
            { text: 'Listen. Ask. Take notes in a mind with nine threads.', check: { skill: 'GU', dc: 2 }, time: 120, do: (g) => { const first = !g.flags.lore_realms; if (first) g.flags.lore_realms = true; else g.flags.lore_tree = true; bumpRel(g, 'Old Wen', 4, 0); return [first ? `You take it down rung by rung, in a thread of its own, and ask who holds the bottom of the ladder here. Old Wen's good eye stays on you until the tea has stopped steaming. "Now you have asked the right question," he says. "Nobody in Ashfall has asked it since my father's time."` : DR_WEN_FOREST(g)]; }, failDo: (g) => { if (!g.flags.lore_realms) g.flags.lore_realms = true; else g.flags.lore_tree = true; return ['Your attention drifts. He notices, and forgives it.']; }, to: 'ashfall' },
        ],
    },

    far_hunt: {
        dayKey: (g) => `far_hunt:${g.flags.far_kind}`, // v0.11.135 (NT1, EV1)
        id: 'far_hunt', title: 'Past the Oak Hollow', art: (g) => (g.flags.far_kind === 'wolves' ? 'wolves' : g.flags.far_kind === 'bull' ? 'lizard' : 'herb_slope'), place: 'Blackroot Wilds — past the oak hollow',
        enter: (g) => { markDaily(g, 'far'); const r = d6(g); g.flags.far_kind = r <= 2 ? 'wolves' : r <= 4 ? 'bull' : 'deer'; return []; },
        text: (g) => ({
            wolves: byDay(g, ['The hunters warned you about the ash-wolves, and you took it for exaggeration. It was not exaggeration.', `The ash-wolves again. They have not got fewer since the hunters warned you, and they have not got politer. The hunters, to be fair, never said they would.`, `Ash-wolves again: a new grey pair under the old oaks, working the ground exactly as the others did. They spread out to either side of you, unhurried, with the air of a trade handed down whole, mistakes included.`, "Ash-wolves on the slope above the oaks, grey as the stone they lie on, getting up one at a time as your scent reaches them. The largest yawns at you, and you decide not to take it personally.", "Fresh tracks cross the stream bed past the oak hollow, and the ash-wolves that made them are waiting where they stop, heads low. They have picked their ground properly, bank at their backs, and seem to expect admiration.", "Ash-wolves are crossing the fallen oak past the hollow in single file, grey and careful, like clerks on a plank. The one in front sees you and stops, and the file stops behind it." /* v0.11.248 (owner pick P18-A; Fable's, Claude's cuts): FH6 */], `far_hunt:wolves`), // v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): FH, a 4th and 5th (past three, the pick)
            bull: byDay(g, [`A thornback, and a large one: a bull, twice the size of the one that came to your camp. It wears its spines like a hedge somebody has sharpened.`, `A thornback bull again, standing square in the bracken and big as a hay cart. Its spines run down its back like a rack of spears, and it shows no sign of having anywhere else to be.`, `Another thornback bull rises out of the bracken, a stranger, though by now you could draw the spines from memory. It lowers its head a hand's breadth when it sees you, which among thornbacks may be greeting and may be aim.`, "A thornback bull is scraping its spines against an oak past the hollow, and the oak is losing. It stops when it hears you and turns to look, a piece at a time, bark still hanging off its back.", "Something has flattened a path through the bracken as wide as a doorway, and the thornback bull that made it stands at the end. It looks at you over its spines, chewing, like a man interrupted at dinner."], `far_hunt:bull`), // v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): FH, a 4th and 5th (past three, the pick)
            deer: byDay(g, ['Ash-deer, grey and fast, with bones like reeds. The hunters reckon it ten years since an arrow last brought one down.', `The ash-deer are in the birches again, grey among grey trunks, stepping as if the ground might complain. One lifts its head and looks straight at you from a hundred paces. The hunters say that is as close as anyone gets.`, `Ash-deer among the birches, at their usual hundred paces, a distance they keep to the step. A doe lifts her head before the others and watches you, waiting to learn what sort of day you intend.`, "Ash-deer are drinking at the stream beyond the birches, grey backs in a row, and one stands apart facing the wrong way on purpose. That one has seen you; its ears say so at a hundred paces.", "The birches past the oak hollow turn out to have legs: ash-deer, so still among the trunks that you find them only when one flicks an ear. The wind is yours and none has looked up."], `far_hunt:deer`), // v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): FH, a 4th and 5th (past three, the pick)
        }[g.flags.far_kind]),
        choices: [
            { text: 'Fight.', show: (g) => g.flags.far_kind !== 'deer', combat: farHunt, to: 'far_won' },
            { text: 'Back off. Not today.', show: (g) => g.flags.far_kind !== 'deer', time: 60, to: 'ashfall' },
            { text: 'Let them go. Not today.', show: (g) => g.flags.far_kind === 'deer', time: 60, to: 'ashfall' },
            { text: 'A dart, from a hundred paces, through the gap in the birches.', show: (g) => g.flags.far_kind === 'deer', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 120, do: (g) => { addItem(g, 'venison', 3); bumpRel(g, 'Village', 5, 0); return ['+3 Ash-deer venison, and a story the hunters will tell for ten years.']; }, failDo: () => ['Gone, as smoke goes.'], to: 'ashfall' },
        ],
    },
    far_won: {
        id: 'far_won', title: 'Meat and Cores', art: (g) => (g.flags.far_kind === 'wolves' ? 'wolves' : 'lizard'), place: 'Blackroot Wilds — past the oak hollow',
        enter: (g) => { addItem(g, 'beast_core', 1); addItem(g, g.flags.far_kind === 'wolves' ? 'venison' : 'lizard_egg', 2); bumpRel(g, 'Village', 5, 0); return [`+1 Murky beast core, +2 ${g.flags.far_kind === 'wolves' ? 'wolf meat (as venison)' : 'thornback eggs'}.`]; },
        text: (g) => byDay(g, [`The kill travels to Ashfall folded away and comes out whole at the hunters' feet. They bow to it without a word, as one bows to a fallen enemy. Then, with equal gravity, to you.`, `It rides home in the hammerspace as far as the oak hollow, and on your shoulders after that, for the look of the thing. This time the hunters meet you at the oak hollow, unasked, and take the weight from you in order of age. Nobody says well done. The eldest looks at the kill, then at you, and inclines his head by the width of a finger, and you understand that you have been promoted.`, `By now the hunters have a place swept for the kill a bowshot past the oak hollow, on the hunting side, and nobody admits to the sweeping. You set it down there; they bow to it, then to you, in the order custom has settled on. One of the younger men bows a breath early and is looked at.`, `The kill comes out of the hammerspace onto the swept ground past the oak hollow, still warm, a fact the hunters have stopped remarking on, having never started. The bows are made in their order. Then one man lays a hand on its flank, takes it away, and looks at the sky to judge how long you have been gone. The sum does not come out. He wipes his palm on his jerkin and sends a boy for the knives.`, "Ashfall's hunters share out the kill by a rule older than the village, and the rule gives the heart to whoever brought the beast down. The eldest presents it to you on a leaf, with both hands. You thank him. It is warm, and nobody offers to tell you what a guest does next." /* v0.11.248 (owner pick P18-A; Fable's, Claude's cuts): FW5 */], 'far_won'), // v0.11.247 (owner pick P17-A; Fable's, Claude's cuts): FW, a 4th (past three, the pick; RV-A, the cold review's T L5: Fable's redraft at the swept place); // v0.11.230 (P3-2, D1: FT; Fable's): the first without loads (SF-a), a third
        choices: [{ text: 'Leave the hunters to it.', time: 60, to: 'ashfall' }] /* RV-A (the cold review's T L5): the texts are set in Ashfall already */,
    },
    far_lost: {
        id: 'far_lost', title: 'Not Today', art: 'herb_slope', place: 'Blackroot Wilds — past the oak hollow',
        text: (g) => `Losing has one part that matters, and you manage it: you get away. You bleed all the road to Ashfall, where Mei Lin patches you and lists, with examples, the ways you are a fool.${byForm(g, '', " Yuki comes in behind you on three good legs and lies down across the doorway. Mei Lin steps over her without breaking off, comes back with the salve, and starts on the cat. The lecture now covers you both.", " Yuki comes in behind you holding one arm with the other, and sits on the doorstep without a word. Mei Lin does not break off. She fetches the salve, turns the arm to the light, and starts on it. The lecture now covers you both.")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Accept the lecture.', time: 60, do: (g) => { bumpRel(g, 'Mei Lin', 2, 2); return [`You let her finish. It takes a while. She sews while she talks, and the angrier she gets, the smaller and neater the stitches become. When she has tied off the last one she presses her thumb on it, hard, and says, "Next time, take me." You do not point out that this is not an argument. It was never meant as one.`]; }, to: 'ashfall' }],
    },

    scout: {
        id: 'scout', title: 'The Tribute Road', art: 'ridge', place: 'The road to the Crimson Lotus',
        enter: set('scouted_try'),
        text: (g) => (canFly(g) ? FW.scout : `Out of Ashfall the road goes up toward the mountains, one long switchback after another. A waystation sits at the halfway turn: a bench under a roof, a shrine with a red lotus cut into the stone, and dust that your threads flag. The marks in it are fresh. Somebody has been standing here, watching the village.`), // v0.11.195 (F1, D1: SC)
        choices: [
            { text: 'Read the ground. Who\'s been here, how many, how long?', check: { skill: 'GU', dc: 4 }, time: 150, do: (g) => { g.flags.scouted = true; return [tributeLeft(g) <= 1 ? 'Two watchers, three days running, in outer-sect boots. By tomorrow they will know exactly what you are, or believe they do. Good. That can be used.' : 'Two watchers, three days running, in outer-sect boots. Before the tribute comes due they will know exactly what you are, or believe they do. Good. That can be used.']; /* RV1 (MF2) */ }, failDo: () => ['The marks run into one another. Somebody watched. The ground says no more.'], to: 'ashfall' },
        ],
    },

    mei_walk: {
        id: 'mei_walk', title: 'Sunset', art: 'roof', place: `${P} — the edge of the barley`,
        enter: (g) => { markDaily(g, 'walk'); return []; },
        // v0.11.224 (owner pick TX2, TS6: V3a): a sequence of three on the long calendar's week; the last sunset on the eve only
        text: (g) => (vday(g) === 2
            ? seqText(g, 'mei_walk:5', [(g) => `You walk the edge of the field while the sun goes down red. She walks near enough that your sleeves brush, and gives no sign of having noticed. ${byForm(g, 'Yuki walks between you at intervals, a chaperone with a grudge.', 'Yuki walks between you wherever the path is wide enough and in some places where it is not, a chaperone with a grudge and the means to enforce it.', 'Yuki walks three paces behind with her hands clasped at her back, a chaperone with a grudge and an excellent view.')}

${byForm(g, `"When it goes bad at the post," she says, "and it will, take the cat and go. Don't be a hero for a village that isn't yours."`, `"When it goes bad at the post," she says, "and it will, take that great white beast of yours and go. Don't be a hero for a village that isn't yours."`, `"When it goes bad at the post," she says, "and it will, take her and go." She nods back at Yuki without turning round. "Don't be a hero for a village that isn't yours."`)}

"Bit late for that."`, (g) => `The sun goes down behind the barley and takes its time about it. She sets the pace this evening, a slow one, and she has not raised the post again; it comes along regardless, at her other shoulder. ${byForm(g, 'On your shoulder Yuki faces backwards, so that somebody is watching the road.', 'Yuki paces the furrow below the path, her back level with your hip, and the barley leans away from her.', 'Yuki follows at a distance she has measured: near enough to hear, far enough to deny it.')}

${byForm(g, `"Mother asked what we find to talk about out here," she says. "I said herbs. So if she asks you, it was herbs, and the cat will say the same."`, `"Mother asked what we find to talk about out here," she says. "I said herbs. So if she asks you, it was herbs, and that great white beast of yours will say the same."`, `"Mother asked what we find to talk about out here," she says. "I said herbs. So if she asks you, it was herbs, and she will say the same." She jerks her chin over her shoulder at Yuki.`)}

"Which herbs? She'll ask."`, (g) => `From the field edge you can see the road, which the men swept this afternoon for the collectors. In the red light it is the cleanest thing in Ashfall. She looks at it for most of the walk and at you for the rest. ${byForm(g, 'Yuki has gone ahead along the furrow, a white tail above the barley, hunting mice and scandal.', 'Yuki has gone ahead, and the barley closes behind her more slowly than it opened.', 'Yuki has gone ahead with her hands in her sleeves, and stops whenever you stop, without looking back.')}

${byForm(g, `"Every year they sweep it," she says. "So the Sect needn't get dust on its boots while it robs us." She laughs, once, and then checks the field for who might have heard. Only the cat.`, `"Every year they sweep it," she says. "So the Sect needn't get dust on its boots while it robs us." She laughs, once, and then checks the field for who might have heard. Only that great white beast of yours, whom nobody is going to question.`, `"Every year they sweep it," she says. "So the Sect needn't get dust on its boots while it robs us." She laughs, once, and then checks the field for who might have heard. Only Yuki, who lifts one hand to show she heard nothing.`)}

"I'd have left the dust. Added some."`, ...WALK_NEW[5]])
            : tributeLeft(g) <= 1 ? `The last sunset before the tribute. This time she does not talk at all. Halfway along the field edge she takes hold of your hand, and she does not let go of it until the lamps come on.`
            : seqText(g, 'mei_walk:6', [(g) => `The barley is nearly ready and nobody will say who is to cut it. She talks about the harvest all the way across the field, quickly, all of it in the future tense, and somewhere along the path her fingers have closed on your sleeve.`, (g) => `From the field edge you can watch the shutters close early, house by house. She has her arm through yours and names each family under her breath as its light goes, as one checks a tally that has come up short before.`, (g) => `The well rope is coiled and hung up dry before the sun is down, which nobody in Ashfall does. Mei Lin points it out, laughs at it, looks round to see who heard, and by the next house she has your sleeve in both hands and is steering by it. She tows you wide of the one door with a pot still on, since you would stop to advise it, she says, and they would have to be polite.`, ...WALK_NEW[6]])),
        choices: [{ text: 'Walk her home.', do: (g) => { bumpRel(g, 'Mei Lin', 3, meiRel(g).a >= 8 ? 5 : 4); return [vday(g) === 2 ? `You walk her to her mother's door in the last of the red light. On the step she turns, looks at you as though there were something else she meant to say, and says "Idiot," very quietly, in its place. ${byForm(g, 'Yuki pushes past you both and goes in first, as though the house were hers. By now it may be.', 'Yuki goes in first, shoulders turned to clear the doorposts, as though the house were hers. By now it may be; nobody inside is going to raise the matter.', 'Yuki says "Excuse me" to the space between you, walks through it, and goes in first, as though the house were hers. By now it may be.')}` : tributeLeft(g) <= 1 ? `She does not let go at the door, either. She stands there with your hand in hers and the lamplight on her face and says, "Tomorrow, whatever happens, I'm glad you came out of that forest." Then she goes in, quickly, before you can answer, and you stand in the lane for a while, learning how to breathe again.` : 'At the door she takes your hand and does not go in. She stands there with it in both of hers and the lamplight on her face and says, "Whatever happens when they come, I\'m glad you came out of that forest." Then she goes in, quickly, before you can answer, and you stand in the lane for a while, working out what to do with the hand.']; }, time: 60, to: 'ashfall' }],
    },
};
