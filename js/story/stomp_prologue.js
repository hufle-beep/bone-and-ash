/**
 * STOMP texts for the prologue fights (see js/story/power.js for degrees and format).
 * Degree 1 keeps each fight's original texts; these cover posture (all degrees), win[2], win[3] and the one-move finish.
 * Locals cannot sense James's cultivation and treat him as a mortal. James never kills humans.
 */
import { registerStomp } from './power.js';
import { yukiForm } from '../core/game.js';

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
        posture: (g, d) => `The three rot-crows spread their moulting wings and scream, a sound like a gate being torn off its hinges, hopping closer along the trunk with their milky eyes fixed on your food, and then on your eyes.

${aside(d, 'You keep your hands near your face.', 'You keep your hands in your pockets.', `You keep eating. ${yk(g)} licks her lips.`)}`,
        win: {
            2: (g) => `Feathers everywhere. Two crows go down in the first three seconds; the third, being the smartest crow in the Blackroot, decides it has an appointment somewhere very far away and keeps it.

${yk(g)} washes with tremendous dignity. You sit for a while and notice, with clinical interest, that your heart barely bothered to speed up.`,
            3: (g) => `You don't get up. You flick three needles off your thumb like seeds and the first two crows fall off the branch without having understood any of it. The third lands in front of you, lowers its head, and very carefully pushes a shiny beetle toward your boot. A peace offering.

You accept the beetle. The crow leaves at a walk. ${yk(g)} watches it go with deep disappointment.`,
        },
        one: (g) => `One needle, three crows, one branch; it sounds like a riddle and resolves like one, with feathers drifting down into the fire.`,
    },

    rats: {
        posture: (g, d) => `The mire-rats come up the bank shoulder to shoulder, slick and black, chattering through yellow teeth. The bigger one rears up on its hind legs to look taller, which, to be fair, works.

${aside(d, 'You get your feet under you.', 'You stay sitting down.', `You remain lying down. ${yk(g)} gets up instead, which is worse for them.`)}`,
        win: {
            2: (g) => `It's short. One rat goes back into the stream a lot less alive than it came out. The other one stops at the water's edge, looks back at you with an expression of real betrayal, and swims away fast.

You dress what's left. It's technically meat. Do not tell Yuki. ${yukiForm(g) === 'human' ? 'Yuki, in human form, watches this and pointedly says nothing out loud, which is somehow worse.' : ''}`,
            3: (g) => `You point at the bigger rat. Just point. A spike of bone comes up out of the mud under it like a reprimand, and it is suddenly, permanently uninterested in you. The second rat lies down flat in the reeds, pretending to be a log. It is not a convincing log. You let it be a log.

You dress the first one. It's technically meat. ${yk(g)} regards the log with intense interest for the rest of the night.`,
        },
        one: (g) => `A ridge of white bone lifts out of the bank between you and the rats like a raised eyebrow, and they reverse into the stream so fast they leave wakes.`,
    },

    lizard: {
        posture: (g, d) => `The thornback lifts its ridge of hollow spines with a sound like a sword drawn slowly from a scabbard, gold eyes unblinking, tail lashing a slow figure-eight in the firelight. Its whole body says *nest*, and *mine*, and *leave or die*.

${aside(d, 'You weigh "leave".', 'You weigh "leave" and find it surprisingly light.', 'You weigh "leave" and find you don\'t feel like moving.')}`,
        win: {
            2: (g) => `The thornback is strong, and armoured, and has clearly won every fight of its life by being both. It has not met a man who grows his weapons faster than it can grow annoyed. Three exchanges in, it lies still across its nest, spines flat at last.

Under it: eggs, leathery and warm, each the size of your fist. ${yk(g)} looks at them, then at you, then at them, with an intensity normally reserved for religion.`,
            3: (g) => `The thornback lunges. You put one finger on its snout, mid-lunge, and it stops as if it's run into a mountain — which, in Qi terms, it has. It looks at the finger. Slowly, every spine on its back folds flat, and it backs off its own nest one claw at a time, never taking its gold eyes off you.

It leaves you the eggs. Leathery, warm, the size of your fist. ${yk(g)} accepts them on the household's behalf.`,
        },
        one: (g) => `A single white spike rises out of the dark ground beneath the thornback's chin and simply holds its jaw shut; the lizard thinks about this for a long moment, then backs away off its nest.`,
    },

    mire: {
        posture: (g, d) => `The mire-rats come out of the black water in a rush, three of them, the bloated one at the back hissing orders like a sergeant.

${aside(d, 'Your boots are already full of mire. You resign yourself to the rest of you.', 'You consider whether this counts as exercise.', 'You do not take your hands out of your pockets.')}`,
        win: {
            2: (g) => `Three rats fewer in the world, give or take. The bloated one is last, and it has time to look at the other two and then at you, and visibly reconsider its whole philosophy.

The silence of the mire settles back, unimpressed. In one of them, the omnitool finds a small, sour beast core.`,
            3: (g) => `They hit a bone wall you grew while they were still underwater. The first two bounce. The bloated one doesn't even get that far: it surfaces, sees the wall, sees the two rats lying at the bottom of it, sees ${ykShort(g)}, and very slowly sinks back out of sight, like a submarine abandoning a war.

You fish one of the casualties out. A small, sour beast core. The silence of the mire settles back, unimpressed, which you feel is fair.`,
        },
        one: (g) => `You tap the mud with your boot heel; bone needles come up through it like reeds, and the mire goes quiet in a single breath.`,
    },

    wolves: {
        posture: (g, d) => `Out of the oaks come the ash-wolves, a pair, grey and narrow, with not a sound between them. Neither growls. Growling is for animals with doubts. They part to left and right, and neither checks where the other has gone.

${aside(d, 'You put a tree at your back.', 'You clasp your hands behind you and wait.', `You rest a hand on ${ykShort(g)}. It is not there to hold her back. It is there to stop her showing off.`)}`,
        win: {
            2: (g) => `They are clever and quick, and they hunt as one animal that happens to own two sets of teeth. Working out that you are not prey takes them the better part of a minute. Nothing after that takes them any time at all.

Ashfall gets them in loads. The hunters accept every load in silence and give it the bow owed to an enemy who fell well. Afterwards, no less solemnly, they bow to you.`,
            3: (g) => `The first wolf jumps. You pick it from the air by the scruff, as a kitten is lifted, and set it on the ground, where it remains. The second brakes hard in the leaf litter, studies its partner, studies you, and goes down on its belly, ears laid back, whining. Before long it has company, seated at its shoulder: ${yk(g)}.

Only one of them comes home with you. The other trails behind to the last of the oaks, keeping a polite distance, and goes no further. In Ashfall the hunters say nothing over the meat. They bow: to the wolf first, and then, with full ceremony, to you.`,
        },
        one: (g) => `You close one hand on empty air, as on a scruff. The hunt changes owners there and then, and the wolves are the last to hear of it.`,
    },

    thornback: {
        posture: (g, d) => `The thornback bull heaves itself up from the bracken, twice the size of any you have met, every spine stood on end, a palisade with a temper. It hisses like a kettle built for a garrison.

${aside(d, 'You count the spines. It has brought all of them.', 'You count the spines and choose the one that comes off first.', `You get a look from ${yk(g)}. It asks whether she may.`)}`,
        win: {
            2: (g) => `It is huge, plated and enraged, and it had been counting on those three things to carry more weight than they do. At the end it lies on its side among the ferns with its spines laid flat and its breath coming slow, and one gold eye tracks you with what, in a politer animal, would be respect.

Afterwards you bring it to Ashfall in loads, and the eggs out of its nest with the last of them. The hunters meet each load without speaking and bow over it as over an enemy fallen with honour; then, just as gravely, to you.`,
            3: (g) => `The bull charges. ${stompForm(g, 'You move one pace to the side, lay a palm on its flank as it goes by, and lean.', 'Yuki takes the charge chest to chest, a thing you had never planned on watching, and it is the bull that rebounds.', 'Yuki walks into its path, takes the foremost spine in one hand, and turns, as one shows a guest through a door.')} Three full rolls through the bracken bring it to rest belly up, legs in the air, every spine clamped shut, not moving at all. It is playing dead. It is not good at it.

You leave it to its performance and take the eggs. In Ashfall the hunters see you come up the lane with a nest of thornback eggs in your arms and no mark on you, and they set down their work and bow: to the eggs first, and then, with great gravity, to you.`,
        },
        one: (g) => `The charge shakes the ground for four strides, and then there is no charge. The bracken comes down slowly over a bull with every spine folded away like a fan.`,
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
