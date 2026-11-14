/**
 * STOMP texts for the prologue fights (see js/story/power.js for degrees and format).
 * Degree 1 keeps each fight's original texts; these cover posture (all degrees), win[2], win[3] and the one-move finish.
 * Locals cannot sense James's cultivation and treat him as a mortal. James never kills humans.
 */
import { registerStomp } from './power.js';
import { yukiForm } from '../core/game.js';
import { byDay } from '../core/lines.js';

/** Yuki as she currently is, for a phrase in the middle of a sentence. */
const yk = (g) => ({ tiger: 'Yuki — currently the size of a Bengal tiger and twice as bored', human: 'Yuki, white hair stirring, ears flat, arms folded', cat: 'Yuki, eleven pounds of white cat' }[yukiForm(g)]);
const ykShort = (g) => ({ tiger: 'the great white root-kin at your side', human: 'the white-haired woman at your side', cat: 'the cat on your shoulder' }[yukiForm(g)]);
const aside = (degree, a, b, c) => (degree >= 3 ? c : degree === 2 ? b : a);
/** v0.11.169 (owner picks P3A, CA1, ST): a text by Yuki's form (cat, great root-kin, human), like common.js byForm. */
const stompForm = (g, cat, tiger, human) => ({ tiger, human }[yukiForm(g)] ?? cat);

registerStomp({
    jackals: {
        posture: (g, d) => `The ashfangs come out of the dark low and slow, heads down, lips peeled back from teeth that smoke where the drool lands. The matriarch circles wide, testing the firelight, making the deep rattling growl that has emptied a hundred camps before yours.

${aside(d, 'You count teeth. There are a great many teeth.', 'You count teeth. You count your own options. One of these numbers is a lot bigger than the other, and it isn\'t theirs.', `You find yourself apologising to them in advance, under your breath. ${yk(g)} yawns.`)}`,
        win: {
            2: (g) => `It isn't a fight so much as a correction. The first jackal lunges and meets a dart in the shoulder; the matriarch comes in behind it and finds a bone blade already waiting where her throat was going to be. They try twice more, because they are jackals and nobody has ever told them no. Then they stop trying.

Two grey bodies by the fire. ${yk(g)} sniffs one with professional disdain.

In the chest of the larger one, where a heart should be, the omnitool flags a hard, cloudy knot the size of a walnut. *Beast core*, your threads suggest. Dense with that foul Qi. Something tells you the locals would kill for this. Something tells you that's literal.`,
            3: (g) => `The matriarch lunges. You lean, very slightly, to the left. She sails past, and on the way you tap her behind the ear with two fingers and a sliver of bone, the way you'd tap a tuning fork. She lands, does not get up, and is very surprised about it for the remaining four seconds of her life.

Her mate looks at her. Looks at you. Lies down, rolls over and shows you his belly, whimpering — which is when ${yk(g)} sits on him.

You make it quick. Out here there's no one to explain mercy to. In the matriarch's chest the omnitool finds a cloudy knot the size of a walnut: a *beast core*, dense with foul Qi. Something tells you the locals would kill for this. Literally.`,
        },
        one: (g) => `You don't stand up. A single white needle leaves your fingers, threads both jackals through the same gap in the dark, and they fold like dropped laundry. ${yukiForm(g) === 'cat' ? 'Yuki doesn\'t even open her eyes.' : 'Yuki doesn\'t bother to move.'}`,
    },

    gao: {
        posture: (g, d) => `Gao Feng straightens his crimson sleeves with great care, one and then the other, the way a man does before an execution.

"Mortal," he says. "I feel nothing in you. No root, no Qi, no cultivation at all — a tall empty jar in a ridiculous white coat. You have interfered with the business of the Crimson Lotus Sect. By the law of these mountains, the life of a mortal who raises his hand to a disciple is forfeit." His lackey grins and draws a hatchet. "I will be merciful. I will only break your legs."

${aside(d, 'He has a point about the coat.', 'You check, politely, whether he means it. He means it. You feel a little sorry for him.', 'You feel genuinely, profoundly sorry for him. You try to communicate this with your eyebrows. It does not land.')}`,
        win: {
            2: (g) => `Gao Feng discovers, in rapid succession, that his Qi strike doesn't reach you, his second Qi strike doesn't reach you, and his lackey is now asleep in a bush. He tries a technique with a name — he shouts the name — and you step through it and put him on his back with a bone needle through his sleeve and into the ground.

He stares up at you, white to the lips. "You have no cultivation," he says. "I *felt* it. You have *nothing*."

"I hear that a lot."

The woman with the knife steps up beside you, looks down at him, and speaks very calmly. "If he goes back, they'll come for my mother. They'll come for the village." She looks at you. "You can't just let him walk away."

That isn't a figure of speech. You check. It isn't.`,
            3: (g) => `Gao Feng shouts the name of his technique. Before he reaches the second syllable you are standing beside him, holding his wrist, and the red Qi along his sleeve has nowhere to go and goes out like a candle.

You put him down. Gently, the way you'd put down a specimen jar. The lackey looks at his master on the ground, at you, at ${ykShort(g)}, and lays his hatchet on the grass with both hands and backs away bowing.

Gao Feng is weeping with rage. "I will remember your face," he gasps. "The Sect will remember. My elder brother is an inner disciple — he will grind your bones to—" You take his other wrist. He stops.

The woman with the knife looks at him for a long, cold moment. "If he goes back," she says, "they'll come for my mother. They'll come for the village. You can't let him walk away as he is."

She isn't being dramatic. You check. She isn't.`,
        },
        one: (g) => `You flick one white needle. It goes through Gao Feng's sleeve, his lackey's sleeve, and pins both men to the same pine, mid-sentence; neither of them finishes the sentence.`,
    },

    boar: {
        posture: (g, d) => `The ironhide boar comes out of the oak hollow like a cart someone forgot to stop. It plants itself, tusks lowered, and paws a trench in the black earth, snorting gouts of steam. The ground does actually shake. The village hunters, watching from a very safe distance, make the sign against evil.

${aside(d, 'It is the size of a small car. It has opinions.', 'It is the size of a small car. You have parked worse.', `It is the size of a small car. ${yk(g)} looks at it the way one looks at a sandwich.`)}`,
        win: {
            2: (g) => `The boar charges. You step aside and leave a dart in its eye. It charges again; you leave a dart in the other one. The third charge, it can't see, and you put the blade where its iron hide meets its skull and it goes down like a felled oak and stays down.

The hunters come out of the trees one by one. They don't cheer. They walk around the boar slowly, then around you, and bow, very low, and say nothing at all.

They come back with carts. By sunset half of Ashfall is grilling ironhide, the children carry the tusks to the shrine in solemn procession, and a hunter old enough to be your grandfather kneels in the dust and formally presents you with his own boar spear. You accept it. You have nowhere to put a spear. Then you remember you own an infinite closet.`,
            3: (g) => `The boar charges. You hold up one hand, palm out, the universal gesture for *please don't*, and a white bone wall grows out of the earth in front of it. It hits the wall at full speed. The wall wins. The boar sits down, cross-eyed, and makes a small confused noise, and ${yk(g)} walks up and pats it on the snout.

You finish it cleanly while it is still deciding what happened.

The village hunters come out of the trees in total silence. One of them drops his bow. The old one kneels first, then all of them. That night half of Ashfall grills ironhide, the children carry the tusks to the shrine in solemn procession, and the old hunter formally presents you with his own boar spear. You put it in an infinite closet. He watches it vanish and kneels again.`,
        },
        one: (g) => `The boar takes one step. A single needle enters just behind its ear, and the ironhide boar lies down in the leaves like a dog by a hearth, and doesn't get up.`,
    },

    collectors: {
        posture: (g, d) => `Lu Han does not hurry. He draws his sword the way a priest unwraps a relic, and his three men fan out behind him in a practised crescent.

"I have examined you," he says, with the grave courtesy of a man reading a death sentence aloud. "There is no cultivation in you. None. You are a mortal with a trick of bone and an animal with open meridians. The Crimson Lotus does not fear tricks. Kneel, and you will be carried to the Sect alive. Stand, and you will be carried in pieces. Either way, you will be carried."

${aside(d, 'You decide not to be carried.', 'You decide not to be carried. You also decide not to enjoy this, and fail.', 'You honestly consider kneeling, just to spare him what\'s coming. Then you remember the baskets, and the children, and don\'t.')}`,
        win: {
            2: (g) => `Lu Han is very good. That is the problem: he is good enough to understand, by the fourth exchange, exactly how badly he is losing. His sword finds white bone wherever it goes. His men find ${ykShort(g)} and decide, collectively, to be somewhere else.

When it's done the snow of white bone around the tribute post is speckled red, Lu Han is on his knees with your blade at his throat, and the collectors are a long way down the road and still running.

"Go home," you tell him. "Tell your Sect Master Ashfall has a new neighbour. Tell him the neighbour doesn't eat grass, doesn't eat pills, and doesn't eat people, and would very much like to keep it that way."

He goes. The whole village watches him go. Then, very slowly, they turn and look at you — and you realise that in this world, you've just done the one thing more dangerous than kneeling.

You've given people hope.`,
            3: (g) => `Lu Han attacks with everything: a sword-form forty years in the making, Qi blazing red along the blade. You catch the blade between two fingers. It stops. Everything stops. Somewhere behind you a grandmother drops a basket of millet.

You take the sword away from him, gently, like taking scissors from a child, and snap it over your knee. Then you put him on the ground — one arm that will heal in a season, one that will take a year — while his men throw down their weapons and run, one of them crying for his mother.

He looks up at you from the dust of the tribute post, and his calm face finally cracks. "You have no cultivation," he whispers. "I would have *felt* it."

"Go home," you tell him. "Tell your Sect Master Ashfall has a new neighbour. The neighbour doesn't eat grass, doesn't eat pills, doesn't eat people, and would very much like to keep it that way."

He goes, holding his arm. The whole village watches him go, then turns and looks at you, and you realise you've done the one thing more dangerous than kneeling. You've given people hope.`,
        },
        one: (g) => `Lu Han's blade comes down. A wall of white bone rises under it, closes round it like a hand, and turns it to splinters; the same hand sets Lu Han down very firmly on his back. His men are already running.`,
    },

    crows: {
        posture: (g, d) => `The three rot-crows open what is left of their wings and scream, a noise like a rusted gate losing an argument, and sidle down the fallen trunk toward you. Their milk-white eyes settle on your food first. Then they move, with interest, to your eyes.

${aside(d, 'You get a hand up in front of your glasses.', 'You leave your hands where they are. The glasses will do.', `You don't sit up. ${stompForm(g, 'On your chest, eleven pounds of white cat begins to purr.', 'Beside you a great white head lifts off its paws, and the purr starts somewhere under the ground.', 'Beside you Yuki sits up and smooths her hair. "Good," she says. "I was bored."')}`)}`,
        win: {
            2: (g) => `Feathers, mostly. Two crows are down before the fire finishes its crackle. The third, the cleverest rot-crow in the Blackroot, recalls urgent business in another province and leaves to see to it.

${stompForm(g, 'Yuki washes one paw, slowly, as after a meal that fell short.', 'Yuki lowers her chin onto her paws again; the rest of her never got up.', 'Yuki picks a feather out of her hair and holds it at arm\'s length until you take it.')} You check your pulse, out of habit. It had not troubled to rise.`,
            3: (g) => `You stay lying down. Three needles leave your thumb like flicked seeds, and the first two crows quit the trunk without learning why. The third needle stops a finger short of the last crow's beak and waits. The crow thinks it over, hops down, and nudges a shiny beetle across the dirt to your hand: reparations.

You accept the beetle, which is alive and walks off. So does the crow. ${stompForm(g, 'Yuki watches a whole bird leave on foot, and holds you responsible.', 'Yuki watches a whole bird leave on foot, breathes out like a forge, and holds you responsible.', '"You let it walk," says Yuki. "It was not even quick."')}`,
        },
        one: (g) => `One needle, one trunk, two crows, and a third that has just learned to count. Feathers come down into the fire; the smell is their revenge.`,
    },

    rats: {
        posture: (g, d) => `The mire-rats come up the bank side by side, black and streaming, chattering through long yellow teeth. The bigger one rears onto its hind legs so as to seem taller. It has to be admitted that this works.

${aside(d, 'You get your feet under you.', 'You stay sitting, and feed the fire a stick.', `You stay lying down. ${stompForm(g, 'Yuki, eleven pounds of white cat and tonight\'s intended dish, gets up instead.', 'Yuki gets up instead, a process with several stages.', 'Yuki stands up instead, and folds her arms.')} Of the two of you, she is the worse news.`)}`,
        win: {
            2: (g) => `It is brief. One rat stops on the bank and stays stopped. The other makes the waterline, turns, and regards you with honest betrayal, as if terms had been agreed and you had broken them. Then it swims off at speed.

You skin and dress the one that stayed. Technically it is meat. Nobody tell Yuki.${yukiForm(g) === 'human' ? ' Yuki stands at your elbow through the whole procedure and says nothing aloud. It carries.' : ''}`,
            3: (g) => `You point at the bigger rat. Only that. A spike of bone comes up through the mud beneath it like a correction in a margin, and its interest in you ends, along with its other interests. The second rat lies flat among the reeds and becomes a log. As logs go, it breathes too much. You let it be a log.

You dress the first. Technically it is meat. ${stompForm(g, 'Yuki sits by the reeds until dawn, watching the log, in case it tries anything a log should not.', 'Yuki lies down next to the log for the night, one paw across it, companionably. The log does not sleep.', 'Yuki crouches by the reeds and informs the log, at intervals until dawn, that she can see it.')}`,
        },
        one: (g) => `A ridge of white bone lifts out of the bank under the bigger rat, much as an eyebrow lifts, and keeps it. The other one reverses into the stream so fast it leaves a wake.`,
    },

    lizard: {
        posture: (g, d) => `The thornback raises its ridge of hollow spines one after another, with the noise a sword makes leaving its scabbard slowly, so that you can think it over. Its gold eyes do not blink. Its tail cuts a slow figure of eight through the firelight. Every line of it says *nest*, and *mine*, and *leave or die*.

${aside(d, `You weigh "leave". It has its points.`, `You weigh "leave". It comes out lighter than you expected.`, `You weigh "leave". But the ground is warm, and you had only just got comfortable.`)}`,
        win: {
            2: (g) => `The thornback is strong and armoured, and all its life those two facts have been the entire argument. Nobody warned it about men who grow weapons faster than it can lose its temper. Three exchanges, and it lies across its own nest, spines folded down at last, the gold gone out of its eye.

Under it, the eggs: leathery, warm, each the size of your fist. ${stompForm(g, 'Yuki looks at the eggs, at you, and at the eggs again, with a fixity most creatures keep for religion.', 'Yuki lowers her great head until her nose is a whisker from the nearest egg, and holds it there, devoutly.', 'Yuki kneels by them, hands folded, as at a shrine. "Three," she says. "I have counted."')}`,
            3: (g) => `The thornback lunges. You set one finger on its snout in mid-lunge, and it stops as if a mountain had been set there; in terms of Qi, one has. It looks at the finger. One by one its spines fold flat, and it starts to edge backwards off its own nest, gold eyes never leaving you.

You are still hungry, and it is still made of meat. One needle, behind the eye, before the last spine has finished folding. The eggs are still warm. ${stompForm(g, 'Yuki receives them on behalf of the household, one paw on the nearest.', 'Yuki receives them on behalf of the household, and lies down around all three.', '"On behalf of the household," says Yuki, taking the first one out of your hands, "accepted."')}`,
        },
        one: (g) => `A single white spike comes up out of the dark ground under the thornback's chin and holds its jaw shut. The lizard studies the problem down the length of its own snout, finds no answer there, and stops where it stands.`,
    },

    mire: {
        posture: (g, d) => `The black water breaks and the mire-rats come out of it in a rush: three, with the bloated one at the rear, hissing orders like a sergeant who has only read about the front.

${aside(d, 'Your boots are full of mire already. You resign yourself to the rest.', 'You wonder whether this will count as exercise.', 'Your pockets keep your hands. The mud has the boots; it is not getting those as well.')}`,
        win: {
            2: (g) => `The world is three rats lighter, or near enough. The bloated one goes last. It has time to look at the other two, then at you, and to revise its whole philosophy of command, visibly, before the revision stops mattering.

The quiet of the mire comes back over all of it, unimpressed. In one of the three the omnitool finds a beast core, small and sour.`,
            3: (g) => `They meet a wall of bone that you grew while they were still under water. The first two bounce. The bloated one never gets that far: it surfaces, sees the wall, sees two rats lying at the foot of it, sees ${ykShort(g)}, and sinks again by slow inches, a submarine withdrawing from a war it has just read the terms of.

You fish out one of the casualties. In it is a beast core, small and sour. The quiet of the mire comes back over the rest, unimpressed, and you can't fault it.`,
        },
        one: (g) => `You tap the mud once with a boot heel. Needles of bone come up through the black water like reeds, and the mire goes quiet between one breath and the next.`,
    },

    wolves: {
        posture: (g, d) => `Out of the oaks come the ash-wolves, a pair, grey and narrow, with not a sound between them. Neither growls. Growling is for animals with doubts. They part to left and right, and neither checks where the other has gone.

${aside(d, 'You put a tree at your back.', 'You clasp your hands behind you and wait.', `You rest a hand on ${ykShort(g)}. It is not there to hold her back. It is there to stop her showing off.`)}`,
        win: {
            2: (g) => byDay(g, [`They are clever and quick, and they hunt as one animal that happens to own two sets of teeth. Working out that you are not prey takes them the better part of a minute. Nothing after that takes them any time at all. One of them carried a core, small and murky.

Ashfall gets the rest in loads. The hunters accept every load in silence and give it the bow owed to an enemy who fell well. Afterwards, no less solemnly, they bow to you.`, `A second pair, with the first pair's narrow grey manners. They open as the others did, one wide to each hand, and you let them finish the manoeuvre, since it is the only one they own. It puts you between them, which is the flaw in it. Two needles. One wolf carried a core, murky and small.

You do not carry them far. The hunters are waiting at the oak hollow, unsent for, and the loads leave your shoulders eldest man first. No one speaks. The eldest looks over the wolves, then over you, and lowers his chin a finger's breadth. You gather that this is rank.`], 'far_won'),
            3: (g) => byDay(g, [`The first wolf jumps. You pick it from the air by the scruff, as a kitten is lifted, and set it on the ground with its neck already seen to, where it remains. The second brakes hard in the leaf litter, studies its partner, studies you, and goes down on its belly, ears laid back, whining. Before long it has company, seated at its shoulder: ${yk(g)}.

Only one of them comes home with you, a small murky core the lighter. The other trails behind to the last of the oaks, keeping a polite distance, and goes no further. In Ashfall the hunters say nothing over the meat. They bow: to the wolf first, and then, with full ceremony, to you.`, `The first wolf comes in low this time, for the knee. You bring a heel down as it passes under, without breaking stride, and it does not get up to complain. The second has watched closely. It sits, of its own accord, and lifts a paw. ${stompForm(g, 'Yuki, from your shoulder, declines it on your behalf.', 'Yuki sets her own paw next to it, for scale. The wolf withdraws the offer.', 'Yuki takes the paw, gives it one shake, and returns it. "Dismissed," she says.')}

One wolf goes home across your shoulders, less a small murky core; the other is into the oaks before you have it lifted. At the oak hollow the hunters are waiting, unsent for, and the wolf passes from you to the oldest of them and so on down. Nobody speaks. The eldest studies the meat, then you, and dips his chin about as far as a finger is wide. You have, it appears, been promoted.`], 'far_won'),
        },
        one: (g) => `You close one hand on empty air, as on a scruff. The hunt changes owners there and then, and the wolves are the last to hear of it.`,
    },

    thornback: {
        posture: (g, d) => `The thornback bull heaves itself up from the bracken, twice the size of any you have met, every spine stood on end, a palisade with a temper. It hisses like a kettle built for a garrison.

${aside(d, 'You count the spines. It has brought all of them.', 'You count the spines and choose the one that comes off first.', `You get a look from ${yk(g)}. It asks whether she may.`)}`,
        win: {
            2: (g) => byDay(g, [`It is huge, plated and enraged, and it had been counting on those three things to carry more weight than they do. At the end it lies on its side among the ferns with its spines laid flat and its breath coming slow, and one gold eye tracks you with what, in a politer animal, would be respect. You do not leave it there to think. One needle, and the eye stops tracking.

The core comes out small and murky. You bring the rest to Ashfall in loads, and two eggs out of its nest with the last of them. The hunters meet each load without speaking and bow over it as over an enemy fallen with honour; then, just as gravely, to you.`, `Another bull, as big as the last and no better informed. It lowers the palisade and comes on, and you allow it the first three charges, because it has plainly rehearsed them. The fourth meets a wedge of bone set where plate joins plate. It folds at the knees, lets out its steam, and is finished before it has settled into the ferns. The core comes out murky and small.

It goes as far as the oak hollow in loads, with two eggs from the nest riding on the last. The hunters are there already, unsent for, and they lift the weight off you by seniority. Not a word. The eldest looks along the bull, then at you, and tips his head a finger's width. You take it for promotion, and nobody corrects you.`], 'far_won'),
            3: (g) => byDay(g, [`The bull charges. ${stompForm(g, 'You move one pace to the side, lay a palm on its flank as it goes by, and lean.', 'Yuki takes the charge chest to chest, a thing you had never planned on watching, and it is the bull that rebounds.', 'Yuki walks into its path, takes the foremost spine in one hand, and turns, as one shows a guest through a door.')} Three full rolls through the bracken bring it to rest belly up, legs in the air, every spine clamped shut, not moving at all. It is playing dead. It is not good at it.

You spare it the rest of the performance: one needle, and the part is its own. You take the core, small and murky, and the eggs. In Ashfall the hunters see you come up the lane with thornback eggs in your arms and no mark on you, and they set down their work and bow: to the eggs first, and then, with great gravity, to you.`, `The bull charges; it is the one letter of its alphabet. ${stompForm(g, 'You hold out one finger and let it arrive.', 'Yuki lays one paw on its skull as it arrives, and keeps the paw there.', 'Yuki raises one hand, palm out, and it arrives at the hand.')} Its back half tries to keep going and is overruled. Then every spine drops flat together, and it stands blinking at the bracken, a hedge that has lost its faith.

One needle, before it can arrive at a second idea. You take the core, murky and small, and two eggs from the nest. Today the hunters do not wait in the lane: they are at the oak hollow, unsent for, and they take the eggs out of your arms oldest first, one man to an egg, in both hands. The eldest, left with none, considers you and bends his neck by a finger's width. This, you gather, is advancement.`], 'far_won'),
        },
        one: (g) => `The charge shakes the ground for four strides, and then there is no charge. One white spike has come up through the bracken and settled it. The fronds close slowly over a dead bull with every spine folded away like a fan.`,
    },

    arson: {
        posture: (g, d) => `Pock-Face holds his torch high and grins up at the window. "There he is. The mortal. Not a root in him, not a breath of Qi, nothing. Elder Brother Gao says it was a trick with bones, and luck besides." He spits in the lane. "Luck gets spent. You come down, mortal, or we come up, and after that the house burns with you inside it."

His two hired men move apart unprompted, with the ease of long practice.

${aside(d, 'You join them in the lane.', 'You join them in the lane, once you are ready.', 'You join them in the lane in your sleeping clothes, polishing your glasses on the hem, and put them on to see who it is.')}`,
        win: {
            2: (g) => `The shutters come open on a finished thing. Both hired men are already running. Pock-Face lies on his face in the lane with his sleeve pegged to the dirt by a white splinter of bone, and the gutter is putting out his torch. He did not touch you once, nor the house, nor anyone in it, and he is still searching the dirt for where it went wrong.

The lane fills with people in nightclothes, half of Ashfall, and none of them speaks. Mei Lin's mother comes through them, looks down at the man by her feet, and speaks as a magistrate does: "You came by night to burn a widow's house. Your ancestors will hear of it from me." Then she returns to her bed. Pock-Face has begun to cry.

That is the moment Ashfall decides you are theirs.`,
            3: (g) => `It lasts about as long as glasses take to settle on a nose. The two hired men rush you together and are sitting in the dirt before either knows how; then they notice ${ykShort(g)} watching them, conclude that nobody ever hired them, and go. Pock-Face swings his torch. You take it from him, drown it in the gutter, and lay him out in the lane with both thumbs out of joint. The thumbs will mend. His pride has no such prospects.

"Elder Brother Gao will hear of it," he weeps into the dirt. "He'll bring the whole Sect down on this midden. He'll— you'll—"

Half the lane is out in nightclothes by now, and nobody in the house has a singed hair. Through them comes Mei Lin's mother, in hers. She regards him and pronounces, in the voice a magistrate keeps for sentencing: "You came by night to burn a widow's house. Your ancestors will hear of it from me." She returns to bed. Pock-Face weeps harder.

That is the moment Ashfall decides you are theirs.`,
        },
        one: (g) => `You step into the lane, and the matter ends there: three torches falter, and the men holding them begin, one after another, to reconsider the errand.`,
    },
});
