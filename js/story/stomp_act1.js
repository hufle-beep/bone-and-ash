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
const yuShort = (g) => ({ cat: 'Yuki', tiger: 'Yuki, large, white and in no doubt,', human: 'Yuki' }[yukiForm(g)]);

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

It is meticulous. Shen Qiu, by the north road, in the morning, twelve disciples with him. A note on Mei Lin, *the herb-girl who laughs*. A note on Ya, which is a drawing of a wolf's skull and a question mark. Yuki is in it too, and lets her entry stand.

You send him home without the sword. He bows before he runs. The Sect trains them thoroughly.`,
            3: () => `You do not move. From where he stands, that is the difficulty: you do not move, and then his sword is lying in the pine needles in three pieces, his belt has been cut so that his trousers are a matter of ongoing negotiation, and a cuff of white bone has closed round both his wrists as lightly as a jeweller's clasp.

He falls over. Into the rice cakes.

"I— This one— *Senior*," he gasps, forehead in the dirt, which is some distance from "beggar". "This one had no eyes. This one's master had no eyes. Spare this one's hands—"

"Your hands are fine," you say. "Your dignity I can't help with. Ledger."

He holds it up over his head in both bound hands, and after it the hilt of the sword, the correct way round, the form having nothing to say about blades in three pieces. The ledger is meticulous. The Elder: north road, the morning, twelve disciples. A note on Mei Lin, *the herb-girl who laughs*. For Ya, a wolf's skull and a question mark. Yuki has a page, which she inspects and permits.

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
        posture: (g, d) => `They come out of the grey wood in no hurry: hollow-grubs big as dogs, tallow-pale, splinters for teeth. They have been at this tree since it died, and nobody has yet interrupted them. ${yu(g)} counts them, and stops early.

${pick(d, 'Under the disgust is anger, and it is the steadier. This was your people\'s house.', 'They are eating your people\'s house. You mean to raise it with them.', 'They are eating your people\'s house, and you seem to be the nearest it has to a landlord.')}`,
        win: {
            2: (g) => `It is short, and thorough. When it is over the fourth ring is quiet, with grub on most of it, and Yuki has plainly decided none of that is hers to clean up. Behind the shelf they were eating, a hollow is grown into the wall, and a cup stands in the hollow: plain wood, a thousand years old if it is a day, a name burned into its base in the script you could read before you could walk.

*Tamsin.*

You stand with it in both hands, longer than you would like witnessed. Ya witnesses, and says nothing. She only drives her shoulder into yours going by, hard enough to shift you a step, which from Ya is tenderness.`,
            3: (g) => `You lay one palm flat on the wall. The tree is dead, not deaf, and for one heartbeat it recalls what it was grown for: the grey wood closes like a fist on every grub in the ring. When it opens again the fourth ring is quiet, and far cleaner than you would have left it. Yuki inspects the floor and can find nothing to object to, which annoys her.

Behind the shelf they were eating, a hollow is grown into the wall, and a cup stands in the hollow: plain wood, a thousand years old if it is a day, a name burned into its base in the script you could read before you could walk.

*Tamsin.*

You stand with it in both hands, longer than you would like witnessed. Ya witnesses. About the wall she says nothing either, and for Ya that is restraint on the heroic scale. She only drives her shoulder into yours going by, hard enough to shift you a step, which from Ya is tenderness.`,
        },
        one: () => 'One palm on the wall. For a heartbeat the dead tree remembers how to make a fist.',
    },
    root_husks: {
        posture: (g, d) => `No light ever got down here, and the rot has spent its four centuries unsupervised. It has grown arms: several more than the work calls for. It hauls itself off the wall toward you with a noise of wet paper tearing, and at its centre is a thing that began as a grub and has since specialised in mouth.

${pick(d, 'Ya swears under her breath and brings her spear down level. Mei Lin\'s lips are moving. It is a prayer.', 'You loosen your shoulders. Whatever is down there under the roots, the road to it runs through this.', 'The road down runs through it. It is not going to be in the road for long.')}`,
        win: {
            2: () => `It comes apart under bone and needle and Ya's spear, and you could have left out two of the three. The root-chamber goes still. Ya is up on top of the biggest husk, spear still in it, blowing hard, grinning like a child with a present. "*That* I liked," she says. "Do they have more? Ask them if they have more."

She was not needed, and she knows it. She stabs the husk once more regardless, as a matter of principle.

Beyond the chamber the tunnel turns, and your hand on the wall finds a different thing under it. Not root any longer. *Hull*.`,
            3: () => `You walk into the middle of it. It shuts on you with every arm it has, and then the arms are white, and then all of it is: a figure of bone standing where the rot stood, each tendril stopped in mid-reach, the work of a sculptor both furious and exact.

Ya goes the whole way round it, slowly. She raps it with her spear. It rings.

"No," she says. "I don't *like* that. That is going to be in my dreams." She thinks about it. "Good ones, probably. Don't look at me."

Beyond the chamber the tunnel turns, and your hand on the wall finds a different thing under it. Not root any longer. *Hull*.`,
        },
        one: () => 'It shuts on you. You turn it to bone clean through and leave it standing, for the rest of the rot to think about.',
    },
    guardian: { // v0.11.173 (OL1, GW): win[2] takes g (story.js passes it), for the half-song's branch (guardian_won has it; Fable's line)
        posture: (g, d) => `The guardian comes up to its whole height, better than three times yours: grown wood over old white bone, moss stirring on its arms, a smooth white head with nothing on it to plead with. Inside it a voice is still singing, faintly: one cracked line of a song you were rocked to sleep to, and Yuki with you.

If any part of it knows you, it is not the part lifting its arms. That part knows *intruder*, and it has known little else since the tree died.

${pick(d, 'You feel sick. You put your hands up all the same.', 'It is strong. It is also old, and worn out, and you are neither.', 'A thought would break it. You find you do not want that. You want it to *look* at you.')}`,
        win: {
            2: (g) => `You do not break it. You take it down, as you would take apart a precious thing that had gone wrong: joint by joint, binding by binding, no more force than each one asks. It falls like timber all the same: a lean, a pause, and then the whole chamber floor jumping under you.

It lies there, and the green in its chest stays lit. ${g.flags.guardian_weak ? 'Then, because you sang to it and part of it was listening, the note smooths out: three heartbeats of the whole lullaby, every line in place.' : 'The note goes on a little while yet, quieter each time round.'}

Then it stops.

You are not even out of breath. The thing you came to do is done, and it sits in you like having put down a dog whose one offence was guarding the house.

"It was good," Ya says, low, from beside its head. Her praise goes no further than that. "It was a good fighter. It didn't want to stop."

"Yes," you say. "And now it doesn't have to."

Two pieces of its frame have come away whole, at the joints. You take them. They are warm. You promise them a thing under your breath, and keep it to yourself.`,
            3: () => `It lifts both arms to strike, and you leave yours where they are. You let your Convergence *sing* instead: not the one cracked line but the song entire, the one from home, the one it was grown to keep.

The fists stop above your head.

Whatever it sees with, it turns on you now, and it knows you. Not your face: your *kind*. The singers. The gardeners. The ones who set it here and told it to wait.

Slowly, the guardian kneels. It sets both huge hands on the floor before you, palms up, as a steward gives back a key. The blank head turns once toward the dark at its back, where the floor falls away, and then to you again. Its own note finds the rest of the lullaby and follows yours to the end. Then the note stops, the green in its chest, its own last sap, sinks to a low and steady glow, and the great frame eases apart, joint from joint, as gently as it knelt. Its work is done.

Nobody speaks. Ya is crying, and furious about it. Mei Lin has both hands pressed to her mouth. Yuki has not moved since the first bar.

"It didn't want to stop," Ya gets out at last.

"It waited four hundred years for somebody to come home," you say. "Now it doesn't have to."

You keep two pieces of the frame. They are still warm.`,
        },
        one: () => 'You sing it the whole song. It kneels, gives back the key it has held four hundred years, and rests.',
    },

    /* ============================================================ PART 4 — RETURN ======================================= */
    rt_wolves: {
        posture: (g, d) => `Grey comes down through the birches: three ash-wolves, heads low, fanning out to take the path at both ends. Ya sinks into a crouch and laughs aloud. ${meiOn(g) ? 'Mei Lin, knife out, says a word under her breath that she did not learn at home.' : ''}

${pick(d, 'Three wolves, and you have two hands. You do the sum again.', 'Three wolves. After the week you have had, three wolves is a rest.', 'Three wolves. You hope, for their sake, that they are quick learners.')}`,
        win: {
            2: () => `The wolves had a plan. It lasted about as long as saying so. You put one down before it has settled which of you to eat; Ya takes the second on her spear; and the third, to the surprise of everyone and of Mei Lin most, runs straight onto Mei Lin's knife.

When the noise stops, Ya is up on the biggest carcass with her spear planted in its throat, howling her win at the clouds. Mei Lin wipes her blade on the grass, grave, appalled, and visibly pleased with herself.

"You," she informs Ya, "are an animal."

"Yes." Ya is delighted. "So are you, with a knife. Very attractive." She jumps down. "Both of you. Very attractive. I will think about it all day."

Mei Lin leaves at a brisk walk. You elect to have no thoughts whatever.`,
            3: (g) => `${yuShort(g)} is in the path ahead of you before the last wolf has finished arriving. She does nothing. She regards them. They regard her, and then what is standing behind her, which is you; and the grey-muzzled leader thinks it over, lies down among the fallen leaves and offers the sky its belly. The other two hold a brief and humiliating conference and follow suit.

Ya stares. "No. No. *Get up.* I came to *fight* you." Nobody gets up.

She fights one regardless, to give the ridge its dignity back, and has to insult it onto its feet first. She wins, climbs onto it, and howls her win at the clouds. Mei Lin wipes a perfectly clean knife on the grass, grave, appalled, and enjoying herself.

"You," she informs Ya, "are an animal."

"Yes," says Ya, delighted. "You are very attractive when you are appalled. Both of you. I will think about it all day."

Mei Lin leaves at a brisk walk. Two wolves trail after her a little way, hopeful as dogs at a kitchen door.`,
        },
        one: () => 'Yuki looks at the wolves. The wolves look past her at you, and lie down. Ya takes it personally.',
    },
    rt_serpent: {
        posture: (g, d) => `Brown water sheets off a head as long as a coffin, and then off a good many yards of neck. On the front of it is the face Ya promised. It studies you as a cook studies a fish.

${pick(d, 'You are knee-deep in its house, and it knows where every stone is.', 'You are knee-deep in its river. Three weeks ago that would have worried you.', 'You are knee-deep in its river, and mostly you notice your boots are wet.')}`,
        win: {
            2: () => `It strikes twice and misses twice, and on the third try it meets your blade coming the other way. The serpent goes down into the brown water with the blade still standing in its eye, and the river closes over both and lies flat, innocent as a pond.

Ya wades out to her waist, ducks under, and surfaces holding a murky beast core, plum-sized. She sets it in your palm as a cat sets a mouse on a doorstep.

"For you. Eat it."

"I don't eat cores."

"I know. I like your face when I say it."`,
            3: () => `You lay a hand on the river and sing. White bone climbs out of the water in one long arch, ford to bank, and its first pier comes down across the serpent's neck and holds it to the riverbed like a thumb on a worm. It thrashes. The bridge has no opinion. It stops thrashing.

You walk over. Everybody walks over. Mei Lin crosses with her eyes lowered, as in a temple; Yuki stops at the middle of the span to look down at what is under it, at her leisure.

Ya comes last. She crouches at the edge, tells the serpent a thing you decline to translate, and straightens up holding a murky beast core, plum-sized, which it has coughed up in its distress. She sets it in your palm as a cat sets a mouse on a doorstep. "For you. Eat it."

"I don't eat cores."

"I know. I like your face when I say it. Also you built a *bridge* on a *snake*."`,
        },
        one: () => 'You sing a bridge across the ford and set its first pier on the serpent. The serpent reconsiders its day.',
    },
    rt_brawl: {
        posture: (g, d) => `Hunter Bao sets his feet a careful shoulder-width apart. One cousin comes off the bench to stand at his elbow; the other has the jacket, and holds it like an office. "Outlander," he says gravely, "the Sect's people looked for Qi in you and found none. You have a wild woman, a white shadow, and more luck than is decent. We shall learn what stands under the luck. With respect."

Ya cracks her knuckles, one hand and then the other, glowing.

${pick(d, 'Fists only. You go over the rule twice, in case it has changed.', 'Fists only. You resolve to use about a third of each fist.', 'Fists only. You will have to be so very gentle.')}`,
        win: {
            2: () => `Bao sits in the dust with a split lip, his dignity whole, and a puzzle: he swung at you nine times and cannot say where any of them went. His cousin is studying the sky from flat on his back. The other one holds the jacket a little higher, in case it is next.

In his own time Bao rises, shrugs his jacket back on, and gives Ya the full hunter's bow, the one kept for a boar that died well. Then he thinks, visibly, and gives you a deeper one.

Ya has no notion what a person does with a bow. She stares. Then she returns it, badly, from memory of other people's.

"Tomorrow," says Bao, grave as a headstone, "stand on my left. I am slow on the left."

"Everyone's slow on the left." But Ya is grinning.`,
            3: () => `It takes four seconds, and you hit nobody. You step, and step again, and Bao and his cousin are sitting in the dust side by side, legs crossed, hands in their laps, neither of them able to say when he sat down. Bao's lip is split; that was Ya, earlier.

The lane is very quiet.

Bao stands and gets back into his jacket. To Ya he gives the formal hunter's bow, the one kept for a boar that died well; Ya stares, then bows back as badly as only a watcher of bows can. Then he turns to you, kneels, and sets his forehead in the dust. "I took a boar for a piglet," he says. "I beg the outlander's pardon. My cousins also took it for a piglet." The cousins, scarlet, kneel as well, the elder holding the jacket clear of the dust.

"Get up," you say. "It was a brawl. It's supposed to be fun."

"It was not fun," says the younger cousin, from the heart.

Ya is holding on to the well for laughing. "Tomorrow," Bao tells her, still on his knees, "stand on my left. I am slow on the left. And *he* stands in front of everybody."

"Everyone's slow on the left," says Ya. "But yes. Him in front."`,
        },
        one: () => 'Four seconds. Two grown hunters sit cross-legged in the dust, trying to recall sitting down.',
    },
    elder: {
        posture: (g, d) => `Outer Elder Shen Qiu draws nothing; nothing here merits steel. A closed fan of red lacquer slides from his sleeve into his left hand; the right he leaves empty. "Three hundred years," he says, courteous as a physician, "and you are the one thing in them I cannot feel. Such a thing is a mortal, or it is an error. The Crimson Lotus corrects both, and hates neither." His head dips to the depth a superior owes a man already judged. "Kneel now, outlander, and you will reach the Sect Master's gate still able to walk."${luHere(g) ? ' At his shoulder Lu Han keeps a hand on his sword, and the look he has for you is no longer quite contempt.' : ''}

He raises the empty hand, palm outward. The road between you fills with red, slow and thick, and the sweet rot of it reaches you ahead of the weight.

${pick(d, 'He is the most dangerous man you have ever faced, and he has not yet begun.', 'He is very strong. He is also wrong about you, with complete confidence, and that will be the expensive part.', 'He has decided you are a mortal. You are sorry for him, and surprised to find you mean it.')}`,
        win: {
            2: () => `Three hundred years have made him good, and it falls short. Each red wave breaks on white bone; each strike finds the place you just left. You take his footing, then his reach, then his breath, until the cupboard is bare.

Shen Qiu finishes on one knee, your white wraithbone blade under his chin, the red jade crown in the dust, his beard bloody from a lip he bit through sooner than cry out.

Ashfall has stopped breathing. An Outer Elder of the Crimson Lotus, three hundred years old, kneels to a mycologist in a lab coat.

"Kill me," he says calmly, though his fan hand shakes, "and the Sect Master comes with every disciple he has and burns this valley down to the bedrock."

"And if I don't?"

"Then I go home in disgrace, and the Sect Master comes anyway, a little later and a little angrier, and I am a laughing-stock for what remains of my life." He weighs you. "I think you will let me live. You have that face."

You do, though not whole: three needles through the meridian knots of his right arm while he watches, a fourth through the tendon of the fan hand. He will cultivate again. Not this season. "I don't kill people," you tell him. "I find it gives them time to think."

His disciples bear him off down the road, and he never looks back.

Ashfall has declared war on the Crimson Lotus. The whole street knows; nobody says so. Old Wen lights his pipe. His hands are steady.`,
            3: () => `The red wave arrives. You walk through it like kettle steam. He strikes, and his palm stops a finger's width short of your chest, against nothing. You watch Outer Elder Shen Qiu, terror of this valley, work it out from the evidence alone: he has been sounding the sea with a walking stick, and calling it dry.

His composure does not crack. It breaks, and the whole road hears it go.

"*What are you,*" he whispers.

"Late for lunch," you say, and lay two fingers on his breastbone. He sits down in the road, hard, and bites his tongue doing it: blood in his beard. The red jade crown rolls away. He tries to rise, meets a white wraithbone blade under his chin, and gets as far as one knee.

Ashfall has stopped breathing. Three hundred years of cultivation kneel to a mycologist in a lab coat.

"Kill me," Shen Qiu says, nearly calm, "and the Sect Master comes with every disciple he has and burns this valley down to the bedrock."

"And if I don't?"

"Then I go home in disgrace, and the Sect Master comes anyway, a little later and a little angrier, and I am a laughing-stock for what remains of my life." He weighs you, and takes his time over it. "I think you will let me live. You have that face."

You do, though not whole: three needles through the meridian knots of his right arm while he watches, a fourth through the tendon of the hand that holds the fan, each measured to the day. He will cultivate again. Not this season. "I don't kill people," you tell him. "I find it gives them time to think."

His disciples bear him off down the road. He never looks back, but halfway down he promises the valley, in a high cracked scream, that the Sect will pull the sky down on it. A sparrow lands on him and is not corrected.

Ashfall has declared war on the Crimson Lotus. The whole street knows; nobody says so. Old Wen lights his pipe with steady hands, sets it down, and laughs: once, quietly, a sound nobody under forty here has heard him make.`,
        },
        one: () => 'Two fingers on the Elder\'s breastbone. Three hundred years of cultivation sit down in the road, hard.',
    },
});
