/**
 * STOMP texts for the Act 1 fights (see js/story/power.js for degrees and the format).
 * Degree 1 keeps each fight's original texts. Degree 2 = outclassed, degree 3 = roflstomp.
 * James never kills humans: he knocks them out and very nearly cripples them. Locals cannot sense his cultivation.
 */
import { registerStomp } from './power.js';
import { yukiForm } from '../core/game.js';

const pick = (d, a, b, c) => (d >= 3 ? c : d === 2 ? b : a);
const meiOn = (g) => !!g.flags.mei_party;
const luHere = (g) => g.flags.ending !== 'fought' && !g.flags.a1_militia;
/** Yuki, as she currently is, in a few words. */
const yu = (g) => ({ cat: 'Yuki, on your shoulder,', tiger: 'Yuki, the size of a tiger and twice as bored,', human: 'Yuki, in her human form, arms folded,' }[yukiForm(g)]);
const yuShort = (g) => ({ cat: 'Yuki', tiger: 'Yuki, all four hundred pounds of her,', human: 'Yuki' }[yukiForm(g)]);

registerStomp({
    /* ============================================================ PART 1 — FALLOUT ======================================= */
    sect_watcher: {
        posture: (g, d) => `The watcher looks up, sets his rice cake down on its lotus leaf, and rises without haste: his senses have gone over you and found nothing there to hurry for. "A mortal," he says, and bows, since the Sect bows even to what it is about to cut. "No root. No Qi. No master. A beggar who has found a trick with bones. I will take your hands, and the Elder will thank me for them."

${pick(d, 'He is fast. You can see that he is fast.', 'You watch him draw. There would have been time to make tea.', 'You consider apologising to him in advance. It seems only civil.')}`,
        win: {
            2: () => `It is less a fight than a correction. His sword comes down, and is no longer in his hand; he is on his knees with a sliver of white bone through the sleeve of his sword-arm, pinning it, gently, to the ridge.

He looks at the sliver. At you. At the place in you where his senses insist there is no Qi at all.

"That is not possible," he says, with great formality. Then, one correct act being left to him, he reaches for the sword with his free hand and holds it out to you, hilt first.

"Noted," you say. "And the ledger."

It is meticulous. Shen Qiu, by the north road, at noon, four disciples with him. A note on Mei Lin, *the herb-girl who laughs*. A note on Ya, which is a drawing of a wolf's skull and a question mark. Yuki is in it too, and lets her entry stand.

You send him home without the sword. He bows before he runs. The Sect trains them thoroughly.`,
            3: () => `You do not move. From where he stands, that is the difficulty: you do not move, and then his sword is lying in the pine needles in three pieces, his belt has been cut so that his trousers are a matter of ongoing negotiation, and a cuff of white bone has closed round both his wrists as lightly as a jeweller's clasp.

He falls over. Into the rice cakes.

"I— This one— *Senior*," he gasps, forehead in the dirt, which is some distance from "beggar". "This one had no eyes. This one's master had no eyes. Spare this one's hands—"

"Your hands are fine," you say. "Your dignity I can't help with. Ledger."

He holds it up over his head in both bound hands, and after it the hilt of the sword, the correct way round, the form having nothing to say about blades in three pieces. The ledger is meticulous. The Elder: north road, noon, four disciples. A note on Mei Lin, *the herb-girl who laughs*. For Ya, a wolf's skull and a question mark. Yuki has a page, which she inspects and permits.

You take the cuff off and send him home without the hilt, one hand holding up his trousers. He bows all the same. At the foot of the ridge he turns and shrieks that the Crimson Lotus will grind your bones to paste, and then trips.`,
        },
        one: () => 'One sliver of bone, flicked. It takes his sword, his belt and his confidence, in that order.',
    },
    palisade_wolf: {
        posture: (g, d) => `Two ash-wolves stand on the chalk line where a palisade is going to be, heads low, lips back, the lame one hanging behind to make sure you watch the other. Their eyes are the colour of old coals, and they have plainly done this to villages before.

${pick(d, 'Two of them. One of you. The arithmetic could be better.', '"Sit," you suggest. They decline.', `${yu(g)} yawns at them. Through the bond: *they're babies.*`)}`,
        win: {
            2: () => `The first wolf learns what a dart of white bone through the shoulder is like, and does not care for the lesson; the lame one learns by watching, a breath too late to use it. It is over before the first shutter in the lane has opened.

Two grey shapes lie in the flattened barley. By morning the hunters have skinned them, rendered them, and hung the skulls along the chalk line, facing outward, in the solemn conviction that this will warn the rest.

Old Hu walks the line twice, studying the clean holes in the skulls, and keeps his own counsel. Then he moves the skulls a hand's width further apart, so that there is room for more.`,
            3: (g) => `The big wolf launches. You step aside. It lands, turns, and finds you standing exactly where it is not, with one white dart in your hand and a faintly apologetic look. ${yuShort(g)} sits on the lame one, which has given up and lies very flat with its ears back, keening.

It comes to two grey bodies in the barley by morning all the same, since ash-wolves do not learn and Ashfall cannot afford wolves that come back. But the hunters skin them in silence, and when they hang the skulls on the chalk line they hang them facing *inward*, toward you, and not one of them can say why that seems correct.

Old Hu turns the skulls outward again. Later, alone, he turns one of them back.`,
        },
        one: () => 'You throw once. The fight is reclassified as a burial detail.',
    },
    ya_brawl: {
        posture: (g, d) => `Ya rolls her neck until it cracks, spits in the dust, and shows you every tooth she owns. "Three nights at your fire and I never smelled a thing on you. No rot. No fear. *Nothing*." She beckons with two fingers. "Come on, Nothing. If you win, you buy my salt. If I win, I take the coat. Then whatever's under it."

${pick(d, 'She is very fast, and she knows it.', 'She is fast, and about to have an educational morning.', 'You find you are sorry in advance, chiefly on behalf of the goats.')}`,
        win: {
            2: () => `It ends with Ya flat on her back in the dust, her spear lying in the barley where it went when it left her hands, and the flat of a white bone blade laid across her collarbones, holding her to the lane the way a ruler holds down a page. She never landed a touch; the spear never found anything to hit. She's bleeding from the lip anyway, mostly from laughing.

"*How,*" she wheezes. "How are you — you're *nothing*, you smell of *nothing* — do that again. Later. Somewhere with fewer goats."

Old Hu replaces his headband with tremendous dignity. His face has been saved, by proxy, and in this world that counts. He bows to you. Then, after a long and visible internal struggle, he bows to Ya, because she fought, and fighting is a thing that can be respected even in an animal.

Mei Lin, on the step, has put the knife down. She is staring at Ya with an expression you can't read at all.`,
            3: () => `Ya comes at you low and laughing. You step inside the spear. A moment later Ya is sitting in the dust with her legs straight out in front of her like a dropped doll, her hair full of grit, her spear on the roof of the smithy, and the point of your white blade resting, with great courtesy, on the crown of her head.

There is a long silence.

"Okay," she says, to the dust. "*Okay.* That's — you're — I take it back about the coat. I want *all* of you. I want you on a plate. Let me up, I'm going to marry you, I'm going to fight you every morning until I win, which will be never, which is *perfect*—"

You take the blade away. Gently. Old Hu replaces his headband with tremendous dignity: his face has been saved, by proxy, and in this world that counts. He bows to you. Then, after a long and visible internal struggle, he bows to Ya, because she fought, and fighting is a thing that can be respected even in an animal. Even one that is currently trying to kiss your boots out of what appears to be professional admiration.

Mei Lin, on the step, has put the knife down. She is staring at Ya with an expression you can't read at all.`,
        },
        one: () => 'One pass. Her spear is on the smithy roof and she is sitting in the dust, working out how.', // v0.11.82: Fable's (the spar)
    },

    /* ============================================================ PART 2 — INTO THE BLACKROOT ============================== */
    bone_elk: {
        posture: (g, d) => `The bone-elk drops its head, and the whole rack swings round on you: white tines by the dozen, each of them an edge. One forehoof strips bark off the root. Ya whoops. "Big one! Big one! Not in the face, I want the skull—"

${pick(d, 'It weighs what a cart weighs, and all of that is on its way to you.', 'It weighs what a cart weighs. You have stopped carts.', 'Your Convergence studies the rack as a carpenter studies a good plank that somebody else is waving about.')}`,
        win: {
            2: () => `Three paces short of you the elk runs one antler into a hoop of white bone that was not growing out of the root a heartbeat ago. The hoop holds. The neck does not, and what is left of the elk arrives in a clatter. Ya is astride it with her knife out before it has settled, and makes one cut at the throat, small and exact, a butcher's cut and a kind one.

She looks up, red to the elbows. "That," she says, "was *rude*. It never got its turn."

"It had a turn."

"One breath of a turn." The grin gets away from her. "You can come hunting with me any time, scholar. *Any* time. Bring the hoop."

A shed antler-tine lies in the moss. You pick it up, still warm, and your Convergence goes over it grain by grain, weighing the density, listening to how much shape it is *asking* for. There is a remarkable thing in it somewhere. The hammerspace takes it.`,
            3: () => `The elk charges. You lift one hand, and its antlers, every white tine of them, stop taking orders from the elk and start taking them from you. They curl inward, politely, and close into a crown. The elk pulls up, baffled, wearing its own weapons as a hat.

It regards you. You regard it. It sits, as a dog sits.

Ya makes a noise no person has made near you before. Then she is on it, knife out, quick and kind about it, because meat is meat and that is all the mercy the Blackroot stocks.

"You *talked to its head*," she says, red to the elbows, eyes huge. "And its head took *your side*. You can come hunting with me any time. Every time. Marry me. No: teach me. No: both."

A shed antler-tine lies in the moss. It lies warm in your fingers, and your Convergence all but purrs over it: grain, density, the amount of shape it is *asking* for. You put it away in the hammerspace, where it seems content.`,
        },
        one: () => 'You ask the elk\'s antlers, civilly, whether they would care to change sides. They would.',
    },
    root_wyrm: {
        posture: (g, d) => `Out it comes, out of the split in the great root: scaled in bark, eyeless, the length of a village street and still arriving. The Root Road shudders under the weight of it. Ya plants her feet. "That's all of it," she says. "I never saw all of it."

${meiOn(g) ? 'Mei Lin has her knife out, which is roughly a hairpin drawn on an avalanche. ' : ''}${pick(d, 'This one will be work.', 'It is very large. You have lately got good at large.', 'Your threads ask, tactfully, whether you would like some effort faked, for morale.')}`,
        win: {
            2: () => `It is still enormous, and it still takes a while, but it never lays a scale on anyone. Each lunge meets a white wall where you were standing; each coil shuts on bone that grew there a breath before. When it stops at last, the four of you are sat in a row on the split's edge with the root at your backs, and exactly one of you is winded. That is Mei Lin, and it is from the shouting.

Ya's face is all sap and teeth. "Since I was *nine*," she tells the sky. "Since I was nine I've wanted that thing dead."

"What stopped you?"

"Being nine." She lets her head knock back on the root. "Then being alone. Nobody fights one of those alone. Those you fight with—" The word doesn't come. She looks along the row of you, slowly, like someone adding a column a second time because the sum came out wrong. Then she is up, too fast, and off to cut scales from the carcass. Nobody finishes the sentence for her.

Mei Lin's eyes follow her. Her face goes soft; she notices, and corrects it.`,
            3: () => `The wyrm lunges. You move two fingers, and a hundred white spikes come up through the great root beneath it in one straight row, evenly spaced, like the teeth of a comb. The lunge ends there. So, give or take some thrashing, does the fight.

Ya stands mid-road with her spear half up and her mouth open. "*No,*" she says. "No, no — I was going to *help*. Since I was *nine* I've wanted to kill that—"

"What stopped you?"

"I was nine! Then I was alone, and nobody fights one of those alone, those you fight with—" She runs out. Her eyes go over the three of you, and the wyrm on its comb, and one laugh gets out of her before she can catch it. "With *him*, it seems. Who uses two *fingers*."

She goes off to cut scales from the carcass, and keeps checking over her shoulder that you are still where she left you, as people do with weather.

Mei Lin's eyes follow her. Her face goes soft; she notices, and corrects it.`,
        },
        one: () => 'One row of white spikes, nose to tail. The wyrm finds every one of them together.',
    },
    mire_serpent: {
        posture: (g, d) => `The black water bulges, and the mire serpent stands up out of it: a mouth like a trunk split for the fire, and the smell of a grave somebody left open in the rain. It sways. It looks you over. It files you under snacks.

${pick(d, 'In the water it is very fast, and the water is where you are standing.', 'Knee-deep in a swamp, you still feel overdressed for this.', `${yu(g)} looks at the serpent, then at you. The question is plain enough: may she have it.`)}`,
        win: {
            2: () => `A needle in its eye on the first lunge, a blade up through the jaw on the second. It flogs the swamp white, and then it goes down, and the swamp resumes its impression of a place where nothing happens. Ya rides the last few seconds of it regardless, whooping, on principle, and surfaces drenched and splendid and unbearably pleased.

Mei Lin, streaming, tells her, "You're insane." Then, under her breath, where only you could catch it: "That was beautiful."

You rule that you caught nothing. Mei Lin rules the same. The serpent, roasted, tastes of eel and regret.`,
            3: () => `The serpent rises. You look at it. It rises somewhat less. You go on looking, and far back in its small, cold, antique brain an instinct older than the swamp clears its throat and says: *that is not food. That is what food runs from.*

The head sinks until only the eyes are above the surface, then not the eyes, and then a long dark shape is leaving across the swamp at speed.

Ya is too insulted to speak. She goes in after it with her spear, cursing in two languages at least, and what follows is foam, and whooping, and a huntress riding a thing that would rather be elsewhere. She wades back hauling it by the tail, drenched and splendid and unbearably pleased. "It *ran*," she says. "From *you*. I didn't know they *could*."

Mei Lin tells her, "You're insane." Then, under her breath, for you: "That was beautiful."

You rule that you caught nothing. So does she. The serpent, roasted, tastes of eel and injured pride.`,
        },
        one: () => 'You look at it. It recalls an appointment elsewhere. Ya keeps the appointment for it.',
    },
    drowned: {
        posture: (g, d) => `They rise all round you, and the surface never breaks. Three: a man, a woman, a child. They were people, before the flood, before the bad Qi decided to keep them. Their eyes are boiled white, and when the mouths open only water comes out, as if there had been a sentence once and the swamp has had the use of it since. Somewhere under them is Mei Lin.

${pick(d, 'Cold stands off them like a wall.', 'They are slow. It is the one mercy on offer here, and you intend to spend it.', 'You could finish this from where you stand, with nothing touched. You would like, very much, to do it gently.')}`,
        win: {
            2: () => `It is quick, and you keep it quiet. One needle of bone apiece, set where the poison lies thickest. The drowned stop. They stand as if a voice had called them from another room, and then they sink, slowly, with every look of relief.

Ya has not waited for any of that. She went under after Mei Lin without a thought in her head, and she comes up with her now: by the collar, onto the nearest trunk, a fist between the shoulder blades until half the hollow is back where it belongs. The drowned woman's nails found Ya's forearm on the way and laid it open, elbow to wrist. Ya has not looked.

Mei Lin lies there heaving, staring up. Ya stares down. Then, hoarse: "You came in after me."

"Obviously," says Ya, stung. "You're *mine*. I mean, ours. The herb girl. Who'd stitch me?" Now she looks at the arm. "Oh. That's bad."`,
            3: () => `There is no fight in it. You raise one hand, and your Convergence finds what remains of each: bone, mostly, and the foul knot of Qi that keeps the bone on its feet. You unpick the knots, slowly, as you would work a tangle out of a child's hair.

The drowned stop. The child looks at you, and the white goes out of its eyes, and for one breath it is a child and nothing else. Then it sinks, slowly, with every look of relief, and the man and the woman go down after it.

It is the quietest thing you have done on this world, and nobody saw it. Ya went under after Mei Lin before your hand was up, without a thought in her head, and they surface together into the stillness: Mei Lin by the collar, onto the nearest trunk, a fist between her shoulder blades until half the hollow is back where it belongs. Nails that were holding on a breath ago have laid Ya's forearm open, elbow to wrist. She has not looked.

"You came in after me," Mei Lin says, hoarse.

"Obviously," says Ya, stung. "You're *mine*. Ours. The herb girl. Who'd stitch me?" Now she looks at the arm. "Oh. That's bad." Then she looks at the flat black water where three of them stood, and at you, and for once has nothing to add.`,
        },
        one: () => 'You untie the knot of foul Qi that holds them up. They lie down in the water like people who have at last been told they may.',
    },
    cinder_hawks: {
        posture: (g, d) => `Three cinder hawks fall out of the haze with sparks pouring off their wings, screaming like kettles. Hawks are not stupid: they pick the smallest first. The smallest, in this party, is ${yukiForm(g) === 'cat' ? 'on your shoulder, and has views' : 'not, today, anything a hawk should pick'}.

${pick(d, 'They are fast and they are alight. Two problems.', 'They are alight. Bone, as it happens, burns badly. You are not worried.', 'You begin counting the sparks, and reach eleven before it bores you.')}`,
        win: {
            2: (g) => `Three darts, three hawks, three small bursts of sparks on the ash. The third had thought better of it and turned for the haze; you take it regardless, since cinder hawks keep grudges and you would rather not be stooped on all the way to the tree.

${yukiForm(g) === 'cat' ? 'Yuki drops from your shoulder onto the last one down, sits, and watches the sky for volunteers.' : `${yuShort(g)} pins the last one down flat and watches the sky for volunteers.`}

"Little queen," says Ya, deeply respectful. Yuki lets it stand. That, you gather, makes you the household.`,
            3: (g) => `The hawks stoop. You raise one finger, and a thin white lattice of bone opens over the four of you like an umbrella. They hit it, bounce, and land on the ash in one heap of sparks and outrage, stunned, wings at every angle.

${yuShort(g)} strolls over and takes possession of the heap.

The struggling stops quite soon. For hawks, they give a strong impression of having been shamed before their own kind, and they are still giving it when Ya comes round with her knife and makes two of them into supper and the third into a warning.

"Little queen," she says to Yuki, deeply respectful, and then to you, more respectful still: "And *you*? What do I call you? Big king? Umbrella man?" She thinks. "I'll find something filthy."`,
        },
        one: () => 'One umbrella of bone. Three hawks meet it and lie down to think their lives over.',
    },
    rot_ape: {
        posture: (g, d) => `The rot-ape comes on all fours, and the pass jumps under it. Moss for fur; nothing so green or so living in what looks out. It hammers the ash with both fists and screams, and Ya screams straight back. There is no fear in hers. "That's *it*," she says. "That's the one my mother didn't come back from."

${pick(d, 'You set your feet. This will hurt.', 'You breathe in. It is big. It is also, you notice, slow on the turn.', 'You look it over and feel one thing only: a tired wish to make this quick, for her sake.')}`,
        win: {
            2: () => `It never closes a hand on anyone. Each swing lands on bone where a body was; each charge ends at a white wall. When it goes over, it goes over across the pass, a hillside's worth, and the moss it wore goes on growing with nothing beating underneath.

Ya walks to it, in no hurry now, and puts her palm against its face. Then she goes through the bones heaped in the notch, piece by piece, to the one thing she wants: a spear-head, rusted, in a wrapping of leather gone black with years. She holds it in both hands and stands there, and the pass waits for her.

Mei Lin comes to her side without a word. Ya's weight shifts toward her, a finger's width, no more.

You give them room. Yuki stays by you, watching the dead tree.

*It knows we're here,* she says, on the bond, to you only.`,
            3: () => `It charges, and you are one step to the left of where it charged. It goes by, hauls round, comes again; you are one step to the right. The third time it goes by into a white post of bone that grew while its back was turned, and sits down very hard, and stays sat.

You walk up to it. It looks at you. You lay one finger on its forehead, and after a long, poisoned life as the thing in the pass, it learns what the elk knew, and the wolves, and the one who came in crimson. You make the end clean. Ya is owed clean.

It goes over across the pass, a hillside's worth, and the moss it wore goes on growing with nothing beating underneath.

Ya walks to it, in no hurry now, and puts her palm against its face. Then she goes through the bones heaped in the notch to the one thing she wants: a spear-head, rusted, in a wrapping of leather gone black with years. She holds it in both hands and stands there, and the pass waits for her.

"Fifteen years," she says. "And you needed a *minute*." It is not a complaint. Mei Lin comes to her side, and Ya's weight shifts toward her, a finger's width, no more.

Yuki stays by you, watching the dead tree. *It knows we're here,* she says, on the bond, to you only.`,
        },
        one: () => 'One finger on its forehead. The rot-ape learns fear, and after that learns nothing.',
    },
    night_wolves: {
        posture: (g, d) => `Two ash-wolves pace the edge of the light, unhurried, with the patience of animals that have emptied a good many camps. Ya sits up, lays the spear over her knees and shows them her teeth. "Breakfast walked here by itself."

${pick(d, 'You get up. It is late, you are tired, and they know both.', 'You get up, chiefly because the pacing is keeping you awake.', 'You do not get up.')}`,
        win: {
            2: () => `It is brief and it is tidy, and the tidiness lets Ya down. "You never even stood up properly," she says, wiping a clean spear for the look of it.

Mei Lin searches you for cuts, finds none, frowns as if their absence were the suspicious part, and takes herself back to bed.`,
            3: () => `You do not get up. Two thin white spikes rise out of the ground where the firelight ends, and the wolves, who had a frightening entrance planned, are abruptly busy with something else, and then are not busy at all.

Ya, halfway into a lunge, has nothing left to lunge at. She overbalances and sits down in the cold ashes. "*Rude,*" she says. "I was *going*."

Mei Lin unseals one eye, considers the wolves, considers you, flat under your blanket, says "Of course," and shuts it.`,
        },
        one: () => 'Two spikes, sent from under the blanket. Your eyes stay shut.',
    },
    night_drowned: {
        posture: (g, d) => `Two of the drowned stand in the black water where the camp ends, streaming, waiting to be seen. They come no nearer. Nearer would be simpler.

${pick(d, 'In the dark Mei Lin\'s hand closes on your sleeve.', 'You sigh and get up. They are owed better than being ignored.', 'You can feel the foul knot of Qi in each of them from here. You could undo it asleep. You may yet.')}`,
        win: {
            2: () => `Two needles, and two of the drowned going quietly under, unhurried, as if thanking you. Ya never needed her spear; she lays it down and, for once, finds nothing funny to say. Mei Lin sits with her arms round her knees and one hand wound in your sleeve, Ya against her other side, and that is how the three of you wait out the dark.`,
            3: () => `You reach out from where you lie and undo what holds them, as gently as letting a breath go. They settle into the black water as the very tired settle into bed.

Ya had her spear up. It comes down slowly. "You do that as if it was nothing," she says, and no joke follows.

"It isn't nothing. It's only easy."

Mei Lin says nothing whatever. She sits up with her arms round her knees, and Ya with her. By morning her bedroll is a hand's width nearer yours, then another.`,
        },
        one: () => 'You let them rest. They lie down in the water, and do.',
    },
    night_serpent: {
        posture: (g, d) => `The serpent heaves itself in over the trunks toward the fire's warmth, belly rasping, tongue sampling the air. It samples you. It samples Yuki. It keeps coming all the same, which, to be fair to it, is the one thing it knows how to do.

${pick(d, 'You take the nearest burning branch, for whatever that is worth.', 'You put your tea down.', 'You do not put your tea down.')}`,
        win: {
            2: () => `A needle behind the jaw, a blade under the skull, and the serpent goes back off the trunks by the route it came, considerably less alive. Ya says the night owed her a longer one than that. Mei Lin lays another stick on the fire and watches the water.`,
            3: (g) => `You do not put your tea down. ${yuShort(g)} gets up in your place and looks at the serpent. The serpent, which has not in all its life been looked at like that by ${yukiForm(g) === 'tiger' ? 'a white cat that size' : 'anything, of any size'}, comes to a decision, and the decision is *the swamp*.

It leaves the trunks quickly, backwards.

"That one," says Ya, with reverence, tipping her chin at Yuki, "is the worst thing I ever met. Except you. Except — no. Her."

You finish the tea.`,
        },
        one: () => 'You go on drinking your tea. The serpent does not need telling twice.',
    },
    night_hawks: {
        posture: (g, d) => `Two cinder hawks, coming down on your fire as if it owed them money, wings sheeting sparks.

${pick(d, 'They want the food, and anything else small enough to carry.', 'They want the food. You want sleep. One side is going to be let down.', 'You roll over.')}`,
        win: {
            2: () => `Two darts, two small bursts of sparks, one bird for the morning's pot. Ya complains that she had only just found her spear. Mei Lin is asleep again before the complaint ends, and you choose to be flattered.`,
            3: () => `You roll over, and a lid of white bone shuts over the fire like the lid on a pot. Two hawks strike it, bonk, bonk, and slide off into the ash. One lies on its back with its feet in the air, reviewing its choices; the other has no choices left, and is breakfast.

Ya has to push her face into her bedroll to stop laughing. Mei Lin tells her, very severely, to be quiet, and then gives way herself.`,
        },
        one: () => 'A bone lid, set over the fire. Bonk. Bonk.',
    },

    /* ============================================================ PART 3 — THE HEART ===================================== */
    husks: {
        posture: (g, d) => `Things come out of the grey wood: hollow-grubs the size of dogs, pale as old candle wax, mouths full of splinters. They've been eating this tree for four hundred years. They seem to think you're dessert.

${pick(d, 'Somewhere under the revulsion, you\'re angry. These are eating your people\'s house.', 'They\'re eating your people\'s house. You\'re going to have words.', 'They\'re eating your people\'s house, and you are, it turns out, the landlord.')}`,
        win: {
            2: (g) => `It's brief and thorough. When it's over, the fourth ring is quiet and full of pale bits of grub. Behind the shelf they were eating, grown into the wall, there's a hollow with a cup in it — a plain wooden cup, a thousand years old, with a name burned into the base in a script you learned before you could walk.

*Tamsin.*

You stand there holding it for longer than you'd like anyone to see. Ya sees. She doesn't say anything. She just bumps your shoulder with hers, hard, on the way past, which may be the kindest thing she has ever done.`,
            3: (g) => `You put your palm flat on the wall, and the tree — dead, but not deaf — remembers what it was for, just for a moment. The grey wood clenches like a fist around every grub in it. When it opens again, the fourth ring is quiet and very, very clean.

Behind the shelf they were eating, grown into the wall, there's a hollow with a cup in it — a plain wooden cup, a thousand years old, with a name burned into the base in a script you learned before you could walk.

*Tamsin.*

You stand there holding it for longer than you'd like anyone to see. Ya sees. She doesn't say anything about the wall, either, which for Ya is restraint on a heroic scale. She just bumps your shoulder with hers, hard, on the way past, which may be the kindest thing she has ever done.`,
        },
        one: () => 'A palm on the wall. The dead tree remembers, for one heartbeat, how to make a fist.',
    },
    root_husks: {
        posture: (g, d) => `Down here, where the light never came, the rot has had four hundred years to grow ambitious. It has arms now. Several. It drags itself out of the roots toward you with a sound like wet paper tearing, and something in the middle of it that was once a grub and is now mostly mouth.

${pick(d, 'Ya swears softly and lowers her spear. Mei Lin\'s lips are moving; she\'s praying.', 'You roll your shoulders. This is the last thing standing between you and the ship.', 'It\'s the last thing between you and the ship. It is not going to be standing there long.')}`,
        win: {
            2: () => `It comes apart under bone and needle and Ya's spear, and when it's done the root-chamber goes quiet. Ya stands on the biggest husk, spear still in it, chest heaving, grinning like she's been given a present. "*That* I liked," she says. "Do they have more? Ask them if they have more."

You didn't need her. She knows you didn't need her. She stabs it again anyway, for the principle.

Beyond the chamber, the tunnel turns, and the walls change. They stop being root. They start being *hull*.`,
            3: () => `You walk into the middle of it. It closes round you, all its arms at once, and then all its arms are white, and then all of it is white — a statue of bone where the rot was, every tendril caught mid-reach, as if a sculptor had been very angry and very precise.

Ya walks all the way around it. Slowly. She taps it with her spear. It rings.

"Okay," she says. "I don't *like* that. That's — no. I'm going to have dreams about that." A pause. "Good ones, probably. Don't look at me."

Beyond the chamber, the tunnel turns, and the walls change. They stop being root. They start being *hull*.`,
        },
        one: () => 'It closes round you. You make it bone, all the way through, and leave it there as a warning to the rest of the rot.',
    },
    guardian: {
        posture: (g, d) => `The guardian unfolds: grown wood and old white bone, three times your height, its face an empty frame where a gardener once carved a smile. Somewhere inside it a voice is still, faintly, singing — one broken note of a song you were rocked to sleep with.

It doesn't know you. It knows only *intruder*, and it has been knowing only that for four hundred years.

${pick(d, 'You feel sick. You raise your hands anyway.', 'It\'s strong. It\'s also very old, and very tired, and you\'re neither.', 'You could break it with a thought. You find you don\'t want to. You want it to *look* at you.')}`,
        win: {
            2: () => `You don't break it so much as take it apart, carefully, the way you'd dismantle something precious that had gone wrong — joint by joint, binding by binding, never more than it needs. It comes down the way a tree comes down: slowly, then all at once, and the floor of the chamber shakes when it hits.

For a moment it lies there with the green still glowing in its chest. The broken note goes on, softer, softer.

Then it stops.

You're not even breathing hard. You did the thing you came to do and you feel like you've put down a dog that was only guarding the house.

"It was good," Ya says, quietly, standing over it. "It was a good fighter. It didn't want to stop."

"Yes," you say. "And now it doesn't have to."

You take two pieces of its broken frame. They're warm. You promise them something, under your breath, and don't say what.`,
            3: () => `It raises its arms to strike, and you don't raise yours. You just stand there and let your Convergence *sing* — not the broken note; the whole song, the one from home, the one it was built to keep.

The guardian stops with its fists over your head.

It looks at you, for the first time, with whatever it looks with. It knows you. Not your face: your *kind*. The singers. The gardeners. The ones who left it here to wait.

Very slowly, the guardian kneels. It puts its great wooden hands on the floor in front of you, palms up, the way a servant hands back a key. The green in its chest flares once, brightly, like a held breath let go — and then it goes out, and the frame comes gently apart in your hands, its work done.

Nobody says anything for a long time. Ya is crying and furious about it. Mei Lin has her hand over her mouth.

"It waited," you say. "Four hundred years. It just wanted someone to come home."

You take two pieces of its frame. They're still warm.`,
        },
        one: () => 'You sing it the whole song. It kneels, hands you the key it has been holding for four hundred years, and rests.',
    },

    /* ============================================================ PART 4 — RETURN ======================================= */
    rt_wolves: {
        posture: (g, d) => `Four ash-wolves come out of the birches in a line, the way water comes through a broken dam. Ya laughs out loud and drops into a crouch. ${meiOn(g) ? 'Mei Lin draws her knife and says something very rude under her breath, which is new.' : ''}

${pick(d, 'Four is a lot of wolf.', 'Four wolves. You\'ve been inside a dead god this week. You\'re fine.', 'You count four wolves and feel a little sorry for the birches.')}`,
        win: {
            2: () => `It's quick. Ya gets one, Mei Lin — astonishingly — gets one, and you get the other two before they've finished deciding which of you to eat. When it's done, Ya is standing on the biggest wolf with her spear through its throat, howling at the sky like a lunatic, and Mei Lin is wiping her knife on the grass with an expression of grave, scandalised satisfaction.

"You," Mei Lin says to Ya, "are an animal."

"Yes," Ya agrees, delighted. "You fight like one too. It was very attractive." She jumps down. "Both of you. Very attractive. I'm going to think about it all day."

Mei Lin walks off very fast. You decide not to think about anything at all.`,
            3: (g) => `${yuShort(g)} steps out in front of you and simply *looks* at the wolves, and the wolves look at her, and then they look at you behind her, and the lead wolf lies down in the road and rolls over and shows its belly, and the other three, after a short and embarrassing internal debate, do the same.

Ya stares. "No," she says. "No. *Get up.* I want to *fight* you." The wolves do not get up.

In the end she fights one anyway, purely to restore the dignity of the road, and wins, and stands on it howling at the sky like a lunatic, and Mei Lin wipes her own clean knife on the grass with an expression of grave, scandalised satisfaction.

"You," Mei Lin says to Ya, "are an animal."

"Yes," Ya agrees, delighted. "You're very attractive when you're scandalised. Both of you are. I'm going to think about it all day."

Mei Lin walks off very fast. The other three wolves follow her a little way, hopefully, like dogs.`,
        },
        one: () => 'Yuki looks at the wolves. The wolves lie down and show their bellies. Ya is furious.',
    },
    rt_serpent: {
        posture: (g, d) => `The black water at the ford folds upward into a neck as thick as a man, and the neck has a face, and the face has opinions about you.

${pick(d, 'You are standing in a river. It is a river creature. This is not ideal.', 'You are standing in a river, which matters a lot less than it used to.', 'You are standing in a river and you\'d like to get across it before lunch.')}`,
        win: {
            2: () => `The serpent sinks back into the brown water with your blade in its eye, and the river goes flat and quiet as if nothing has ever happened in it, ever. Ya wades out to her waist, fishes around, and comes back with a beast core the size of a plum, which she drops into your hand like a cat leaving a mouse on a doorstep.

"For you," she says. "Eat it."

"I don't eat cores."

"I know. I like watching your face when I say it."`,
            3: () => `You lay your palm on the surface of the river and grow a bridge — a long white arch of bone, ford to bank, with the serpent's head neatly caught underneath the first span like a cork in a bottle. It struggles. The bridge disagrees. It stops struggling.

You walk across. Everyone walks across. Yuki walks across with great ceremony and stops in the middle to look down at it.

Ya, last over, leans down, says something to the serpent you choose not to translate, and comes up with a beast core the size of a plum that it apparently coughed up in its distress. She drops it into your hand like a cat leaving a mouse on a doorstep. "For you. Eat it."

"I don't eat cores."

"I know. I like watching your face when I say it. Also you built a *bridge on a snake*."`,
        },
        one: () => 'You grow a bridge across the ford. The serpent is under the first span. It stays there.',
    },
    rt_brawl: {
        posture: (g, d) => `Hunter Bao rolls his shoulders. His cousins rise from the bench behind him. "You have no root, outlander, and no Qi," Bao says gravely. "You have a woman of the wilds and a witch's cat and a great deal of luck. We will see what is under the luck. With respect."

Ya, delighted, cracks her knuckles one at a time.

${pick(d, 'Fists only. You remind yourself of that twice.', 'Fists only. Your fists are fine. Their fists are going to have a bad evening.', 'Fists only. You will have to be so, so careful.')}`,
        win: {
            2: () => `Bao sits in the dust with a split lip and great dignity. He never touched you; he isn't sure how. After a while he gets up, puts his jacket back on, and bows to Ya — a proper, formal hunter's bow, the one they give to a boar that died well. Then, after visible thought, a deeper one to you.

Ya has no idea what to do with this. She stares at him. Then she bows back, badly, like someone who has only seen it done.

"Tomorrow," Bao says gravely, "stand on my left. I am slow on the left."

"Everyone's slow on the left," Ya says. But she's grinning.`,
            3: () => `It takes four seconds. You don't hit anyone. You simply step, and step, and step, and Bao and both cousins find themselves sitting in a neat row in the dust, legs crossed, hands in their laps, with no clear memory of having sat down.

There is a long silence in the lane.

Bao gets up. Puts his jacket back on with great care. Kneels, formally, forehead to the dust — not to Ya: to you. "This one had no eyes," he says. "This one begs the outlander's pardon. This one's cousins also have no eyes." The cousins, mortified, kneel too.

"Get up," you say. "It was a brawl. It's supposed to be fun."

"It was not fun," says the smaller cousin, with deep sincerity.

Ya is laughing so hard she has to hold onto the well. "Tomorrow," Bao says, still on his knees, to her, "stand on my left. I am slow on the left. And *he* should stand in front of everyone."

"Everyone's slow on the left," Ya says. "But yes. Him in front."`,
        },
        one: () => 'Four seconds. Three grown hunters sitting cross-legged in the dust, wondering how.',
    },
    elder: {
        posture: (g, d) => `Outer Elder Shen Qiu draws no sword. He folds his hands into his sleeves and regards you with the grave, courteous patience of a man who has outlived three hundred students. "Outlander. I sense no root in you. No cultivation. No Qi at all. A mortal, who grows bones and bends a village's knees the wrong way." He inclines his head, exactly the correct depth for a superior addressing a condemned man. "The Crimson Lotus does not hate you. It merely corrects. Kneel, and I will make it quick."${luHere(g) ? ' Behind him, Lu Han says nothing, and watches you with something that is no longer quite contempt.' : ''}

He lifts one hand, palm out, and the air between you goes red and heavy as wet silk.

${pick(d, 'This is the most dangerous man you have ever met.', 'He is very strong. He is also, you notice, entirely wrong about you, and that is going to be his problem.', 'He thinks you\'re a mortal. You feel, for a moment, genuinely sorry for him.')}`,
        win: {
            2: () => `He is strong, and old, and very good, and none of it is enough. Every red wave breaks on white bone; every strike finds you already elsewhere. You never draw blood. You just keep taking things away from him — his footing, his reach, his breath — until there's nothing left to take.

It ends with Shen Qiu on one knee in the road, a white wraithbone blade at his throat, his red jade crown in the dust.

Nobody in Ashfall breathes. Three hundred years, and an Outer Elder of the Crimson Lotus is kneeling to a mycologist in a lab coat.

"Kill me," Shen Qiu says calmly, though his hands are shaking, "and the Sect Master comes with every disciple he has, and burns this valley to the bedrock."

"I don't kill people."

He stares at you. "Then I go home in disgrace, and the Sect Master comes anyway, a little later, a little angrier, and I am a laughing-stock for the rest of my life."

You let him live. His disciples carry him down the road. He does not look back.

Ashfall has just declared war on the Crimson Lotus. Everyone in the street knows it. Nobody says it. Old Wen lights his pipe with steady hands.`,
            3: () => `The red wave comes. You walk through it as if it were mist. He strikes; his hand stops an inch from your chest against nothing at all, and you watch the exact moment Outer Elder Shen Qiu — three hundred years of cultivation, the terror of the valley — understands that he has been feeling for your power in the wrong *direction*, the way a man feels for the floor in the dark and finds the edge of a cliff.

His composure doesn't crack. It shatters. Audibly.

"*What are you,*" he whispers.

"Late for lunch," you say, and put two fingers against his sternum, and he sits down in the road. Hard. His crown goes one way. His fan goes the other. A thread of white bone binds both his wrists, gently, and both his ankles, less gently, and he finds he cannot stand up, and that he will not be able to stand up properly for about a season, and that you have decided this, precisely, to the day.

Nobody in Ashfall breathes.

"Kill me," Shen Qiu manages, "and the Sect Master—"

"I don't kill people. I just make them wish I had." You pick up his crown and hand it back to him. He takes it with both hands. They're shaking. "Go home. Tell him."

His disciples carry him down the road. Halfway down, he finds his voice and swears, in a high, cracking scream, that the Crimson Lotus will tear the sky down on this valley. A sparrow lands on his crown.

Ashfall has just declared war on the Crimson Lotus. Everyone in the street knows it. Nobody says it. Old Wen lights his pipe with steady hands, then puts it down, then laughs — once, quietly, for the first time in forty years.`,
        },
        one: () => 'Two fingers to the Elder\'s sternum. Three hundred years of cultivation sits down in the road.',
    },
});
