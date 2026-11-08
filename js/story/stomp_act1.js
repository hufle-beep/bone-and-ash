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
        posture: (g, d) => `The watcher on the ridge rises from his rice cake with the slow contempt of a man who has been told what you are. "Mortal," he says, and bows, because the Sect bows even to things it is about to kill. "No root, no Qi, no master. You are a beggar who found a trick with bones. I will take your hands, and the Elder will thank me."

${pick(d, 'He is fast. You can see that he is fast.', 'You watch him draw. You could have made tea during the draw.', 'You genuinely consider apologising to him in advance. It seems only polite.')}`,
        win: {
            2: () => `It isn't a fight so much as a correction. His sword comes down; it is no longer in his hand; he is on his knees with a white bone needle through the sleeve of his sword-arm, pinning it, gently, to the ridge.

He stares at the needle. At you. At the place in you where Qi should be and, to his senses, isn't.

"That is not possible," he says, with great formality.

"Noted," you say. "Ledger, please."

He yields it with both hands, as if it were the sword. It is meticulous: the Elder comes by the north road, at noon, with four disciples. There's a note about Mei Lin — *the herb-girl who laughs* — and one about Ya: a drawing of a wolf's skull and a question mark.

You let him go, without the sword. He bows before he runs. Of course he does.`,
            3: () => `You don't move. That's the problem, from his point of view: you don't move, and then his sword is in three pieces in the grass, his belt has been cut so that his trousers are a matter of active negotiation, and a cage of white bone has closed round both his wrists with the delicacy of a jeweller's clasp.

He falls over. Into the rice cake.

"I— This one— *Senior*," he gasps, forehead to the dirt, which is a significant reversal on "beggar". "This one had no eyes. This one's master had no eyes. Spare this one's hands—"

"Your hands are fine," you say. "Your dignity, I can't help with. Ledger."

It comes up over his head in both trembling hands. The Elder: north road, noon, four disciples. A note on Mei Lin, *the herb-girl who laughs*. A wolf's skull and a question mark for Ya.

You let him go, holding his trousers up with one hand. He bows anyway. Of course he does. At the bottom of the ridge he turns and shrieks that the Crimson Lotus will grind your bones to paste, and then trips.`,
        },
        one: () => 'You flick one needle. It takes his sword, his belt and his confidence, in that order.',
    },
    palisade_wolf: {
        posture: (g, d) => `Two ash-wolves at the gap in the new stakes, heads low, lips back, the lame one hanging behind to make sure you watch the other. Their eyes are the colour of old coals and they have quite clearly done this to villages before.

${pick(d, 'Two of them. One of you. The arithmetic is not great.', '"Sit," you suggest. They decline.', `${yu(g)} yawns at them. Through the bond: *they're babies.*`)}`,
        win: {
            2: () => `The first wolf learns what a bone needle through the shoulder feels like and does not enjoy the lesson; the lame one learns from watching. It's over before the hunters on the wall have finished nocking their arrows.

Two grey bodies in the trampled barley. By morning the hunters have skinned them, rendered them, and hung the skulls on the chalk line, facing outward, with the solemn conviction that this will warn the others.

Old Hu walks the line twice, looking at the clean holes in the skulls, and doesn't say anything for a long time. Then he moves the skulls a hand's width further apart, so there is room for more.`,
            3: (g) => `The big wolf launches. You step aside. It lands, turns, and finds you already standing exactly where it isn't, holding a single white dart and looking faintly apologetic. ${yuShort(g)} sits on the lame one, which has given up and is lying very flat with its ears back, making a high, unhappy whine.

It is, in the end, still two grey bodies in the barley by morning, because ash-wolves do not learn and Ashfall cannot afford wolves that come back. But the hunters skin them in silence, and when they hang the skulls on the chalk line they hang them facing *inward* — at you — and nobody can quite explain why that feels right.

Old Hu moves the skulls back round. Then, after a while, he moves one of them back again.`,
        },
        one: () => 'You throw one dart and the fight becomes a burial detail.',
    },
    ya_brawl: {
        posture: (g, d) => `Ya rolls her neck until it cracks, spits in the dust, and grins at you with every one of her teeth. "No root. No Qi. Smells of *nothing*." She beckons with two fingers. "Come on, nothing. If you win, I'll let you buy me a drink. If I win, I'm taking that coat. And then whatever's under it."

${pick(d, 'She is very fast, and she knows it.', 'She is fast, for someone who is about to have a very educational afternoon.', 'You find you are already sorry, mostly for the goats.')}`,
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
        posture: (g, d) => `The bone-elk lowers a rack of antlers like a thicket of white knives and paws the root until splinters fly. Ya whoops. "Big one! Big one! Don't kill it in the face, I want the skull—"

${pick(d, 'It is the size of a cart and it is coming straight at you.', 'It is the size of a cart. You have dealt with carts.', 'Your Convergence looks at its antlers the way a carpenter looks at a nice plank.')}`,
        win: {
            2: () => `The elk stops three paces short of you with one antler caught in a white bone hoop you grew out of the root, and then it doesn't need to stop any more. Ya is on it before it finishes falling, knife out, opening the throat with a neatness that would get her a surgical residency where you come from.

She looks up at you, blood to the elbows. "That," she says, "was *rude*. You didn't let it try."

"It tried."

"It tried for one second." She beams. "You can come hunting with me any time. You can come hunting with me *always*."

You pick up a shed antler-tine. It's warm in your hand, and your Convergence turns it over like a jeweller with a stone: the grain, the density, the way it *wants* to be shaped. You put it in the hammerspace.`,
            3: () => `The elk charges. You raise one hand, and its antlers — every white tine of them — simply *listen* to you instead of to it. They curl inward, politely, into a closed crown. The elk stops dead, very confused, wearing its own weapon as a hat.

It looks at you. You look at it. It sits down, like a dog.

Ya makes a noise you've never heard a person make. Then she's on it, knife out, quick and merciful, because meat is meat and the Blackroot doesn't do mercy any other way.

"You *talked to its head*," she says, blood to the elbows, eyes enormous. "You talked to its head and its head *agreed with you*. Marry me. No — teach me. No — both."

You pick up a shed antler-tine. It's warm, and it practically purrs in your hand: the grain, the density, the way it *wants* to be shaped. You put it in the hammerspace. It seems happy there.`,
        },
        one: () => 'You ask the elk\'s antlers, nicely, to stop being on its side. They agree.',
    },
    root_wyrm: {
        posture: (g, d) => `The root-wyrm pours out of the split in the great root, bark-scaled, eyeless, long as a village street, and the whole road shivers under it. Ya goes very still. "That one," she says, "ate my mother's spear."

${meiOn(g) ? 'Mei Lin draws her herb-knife, which is roughly like drawing a hairpin at an avalanche. ' : ''}${pick(d, 'This one is going to be work.', 'It is very big. You have been getting very good at big.', 'Your threads politely ask whether you would like them to fake some effort, for morale.')}`,
        win: {
            2: () => `It is still big, and it still takes a while, but it never touches anyone. Every lunge finds a white wall where you were; every coil closes on bone that wasn't there a moment earlier. When it finally goes still, the four of you are sitting on the lip of the split with your backs against the root, and only one of you is out of breath, and it's Mei Lin, from shouting.

Ya is grinning through a mask of sap. "I've wanted to kill that," she says dreamily, "since I was *nine*."

"Why didn't you?"

"I was nine." She leans her head back against the root. "Then I was alone. You don't fight things like that alone. You fight them with—" She stops. Looks at the three of you as if seeing you for the first time. Then she gets up abruptly to cut scales off the corpse, and doesn't finish the sentence.

Mei Lin watches her go, softens, notices, stops it.`,
            3: () => `The wyrm lunges. You make a small gesture, and a hundred white spikes come up out of the great root under it in a perfect line, like the teeth of a comb, and it stops lunging, and that's more or less the fight.

Ya stands in the middle of the road with her spear half raised and her mouth open. "*No,*" she says. "No, no, no — I wanted to *help*, I've wanted to kill that since I was *nine*—"

"Why didn't you?"

"I was nine! And then I was alone, and you don't fight things like that alone, you fight them with—" She stops. Looks at the three of you, and at the very dead wyrm, and laughs once, helplessly. "With *him*, apparently. Who does it with his *pinkie*."

She goes to cut scales off the corpse and keeps glancing back at you, the way people glance at the sea.

Mei Lin watches her go. Something in her face softens, and then she notices it softening and stops it.`,
        },
        one: () => 'One line of white spikes, root to tail. The wyrm meets all of them at once.',
    },
    mire_serpent: {
        posture: (g, d) => `The black water humps and the mire serpent rises out of it with a mouth like a split log and a smell like a wet grave. It sways. It considers you. It decides you are a snack.

${pick(d, 'It is very fast in the water. You are very much in the water.', 'You are knee-deep in a swamp and still feel overdressed for the occasion.', `${yu(g)} looks at the serpent and then at you, and you get the clear impression she's asking whether she can have it.`)}`,
        win: {
            2: () => `You put a needle in its eye on the first lunge and a blade through its jaw on the second, and it thrashes the water to foam and then sinks, and the swamp goes back to pretending nothing happened. Ya rides it the last few seconds anyway, whooping, purely for the principle, and comes up out of the water soaked and glorious and enormously pleased with herself.

Mei Lin, dripping, says, "You're insane," and then, quieter, so that only you hear it: "That was beautiful."

You decide you didn't hear it. She decides you didn't either. You roast the serpent on a drowned branch. It tastes of eel and regret.`,
            3: () => `The serpent rises. You look at it. It rises a little less. You keep looking at it, and somewhere in its small, cold, ancient brain a very old instinct speaks up, and the instinct says: *that is not food. That is the thing that eats food.*

It lowers its head into the water until only its eyes show, and then not even those, and then a large dark shape goes away from you across the swamp extremely fast.

Ya is so offended she can't speak. She wades after it with her spear, swearing in at least two languages, and twenty minutes later she comes back dragging the serpent by the tail, soaked and glorious and enormously pleased with herself. "It *ran*," she says. "From *you*. I didn't know they *could*."

Mei Lin says, "You're insane," and then, quieter, to you: "That was beautiful."

You decide you didn't hear it. You roast the serpent on a drowned branch. It tastes of eel and wounded pride.`,
        },
        one: () => 'You look at it. It remembers an appointment elsewhere. Ya catches it anyway.',
    },
    drowned: {
        posture: (g, d) => `They come up out of the water without a splash. Three of them: a man, a woman, a child. They used to be people. Their eyes are white as boiled eggs and the water runs out of their mouths when they open them, as if they are trying to say something and have forgotten how.

${pick(d, 'You feel the cold coming off them like a wall.', 'They are slow. That is the only mercy here, and you mean to use it.', 'You could end this without touching them. You would like, very much, to be gentle about it.')}`,
        win: {
            2: () => `It's quick, and you make it quiet. Bone needles, one each, through the places where the poison sits thickest; the drowned stop, and stand for a moment as if listening, and then sink, slowly, as if relieved.

Mei Lin still goes in. One of them caught her ankle before it stopped, and the hollow is deep, and Ya goes under after her without a second's thought and hauls her onto the nearest trunk by the collar, pounding her back until she coughs up half the swamp. There's a long gash down Ya's forearm where the drowned woman's nails went in. She hasn't noticed.

Mei Lin lies on the trunk, gasping, staring up at Ya. "You came in after me."

"Obviously," Ya says, offended. "You're *mine*. I mean — you're ours. You're the herb girl. Who'd stitch me?" She looks at her arm, finally. "Oh. That's bad."`,
            3: () => `You don't fight them. You lift your hand and your Convergence finds what's left of them — bone, mostly, and the foul knot of Qi that keeps the bone walking — and you unpick the knot, very gently, the way you'd untangle a child's hair.

The drowned stop. The child looks at you, and for a moment the white goes out of its eyes, and it is only a child, and then it sinks, slowly, as if relieved. The other two follow.

It's the quietest thing you've ever done. It is also, apparently, the scariest, because Mei Lin backs away from you so fast she goes straight into the hollow, and Ya goes under after her without a second's thought and hauls her onto the nearest trunk by the collar, pounding her back until she coughs up half the swamp. There's a long gash down Ya's arm where a drowned branch caught her. She hasn't noticed.

"You came in after me," Mei Lin says.

"Obviously," Ya says, offended. "You're *mine*. Ours. The herb girl. Who'd stitch me?" She looks at her arm. "Oh. That's bad." Then she looks at you, and for once doesn't say anything at all.`,
        },
        one: () => 'You untie the knot of foul Qi holding them up. They lie down in the water, like people who were very tired.',
    },
    cinder_hawks: {
        posture: (g, d) => `Three cinder hawks drop out of the haze, wings trailing sparks, screaming like kettles. They go for the smallest target first, because hawks are not stupid. The smallest target is ${yukiForm(g) === 'cat' ? 'on your shoulder' : 'not, today, very small'}.

${pick(d, 'They are fast, and they are on fire. That\'s two problems.', 'They are on fire. You have a body made of composting. You\'re not worried.', 'You start counting sparks. You get to eleven before you lose interest.')}`,
        win: {
            2: (g) => `Three darts, three hawks, three small showers of sparks on the ash. The last one tries to break off and you take it out of the air anyway, because cinder hawks hold grudges and you'd rather not be dive-bombed all the way to the tree.

${yukiForm(g) === 'cat' ? 'Yuki leaps off your shoulder and lands on it, and sits there, and stares at the sky as if daring another one to try.' : `${yuShort(g)} pins the last of them with one paw and stares at the sky as if daring another one to try.`}

"Little queen," Ya says to her, with enormous respect. Yuki accepts the title. You are, apparently, the staff.`,
            3: (g) => `The hawks dive. You hold up one finger, and a thin white canopy of bone lattice blooms over your heads like an umbrella; the hawks hit it, bounce, and drop to the ash in a heap of sparks and indignation, dazed, wings askew.

${yuShort(g)} walks over and sits on all three of them at once.

They stop struggling quite quickly. They give the impression, as hawks go, of having been very badly humiliated in front of their peers.

"Little queen," Ya says to Yuki, with enormous respect, and then to you, with even more: "And — what do I call *you*? Big king? Umbrella man?" She considers. "I'll think of something filthy."`,
        },
        one: () => 'An umbrella of bone. Three hawks hit it and lie down to reconsider their lives.',
    },
    rot_ape: {
        posture: (g, d) => `The rot-ape drops off the ridge onto all fours and the ground jumps. Its fur is moss. Its eyes are not. It beats the ash with both fists and screams, and Ya screams back at it — not in fear. In recognition. "That's *it*," she says. "That's the one. It killed my mother."

${pick(d, 'You set your feet. This is going to hurt.', 'You take a breath. It is big. It is also, you notice, very slow to turn left.', 'You look at it and feel nothing but a deep, tired desire to make this quick, for her sake.')}`,
        win: {
            2: () => `It never gets its hands on anyone. Every swing finds bone where flesh was; every charge ends in a white wall. When it falls, it falls across the pass like a landslide, and the moss on its back goes on growing even after its heart stops.

Ya walks over to it, slowly. Puts her hand on its face. Then she goes through the bones in the notch, one by one, until she finds what she's looking for: a spear-head, rusted, wrapped in leather gone black with age. She stands there holding it for a long time.

Mei Lin goes and stands next to her. Doesn't say anything. Ya leans into her, just slightly, the way a tree leans into wind.

You give them the time. Yuki sits beside you and watches the dead tree.

*It knows we're here,* she says.`,
            3: () => `It charges. You step to one side. It goes past, turns, charges again; you step to the other side; it goes past again, into a white bone post you grew while it was turning, and sits down very hard, cross-eyed.

You walk up to it. It looks at you. You put one finger on its forehead and, for the first time in its long, poisoned life, it's afraid. You end it cleanly, because Ya deserves clean.

It falls across the pass like a landslide, and the moss on its back goes on growing even after its heart stops.

Ya walks over to it, slowly. Puts her hand on its face. Then she goes through the bones in the notch until she finds what she's looking for: a spear-head, rusted, wrapped in leather gone black with age. She stands there holding it for a long time.

"Twenty years," she says. "You took a *minute*." It isn't a complaint. Mei Lin goes and stands next to her, and Ya leans into her the way a tree leans into wind.

Yuki sits beside you and watches the dead tree. *It knows we're here,* she says.`,
        },
        one: () => 'One finger on its forehead. The rot-ape remembers fear, and then remembers nothing.',
    },
    night_wolves: {
        posture: (g, d) => `Two ash-wolves circle the firelight, the patient way, the way of animals that have done this to a hundred camps. Ya sits up with her spear across her knees and grins at them. "Breakfast came to us."

${pick(d, 'You get up. It is late and you are tired, and they know it.', 'You get up, mostly because they won\'t stop pacing.', 'You don\'t get up.')}`,
        win: {
            2: () => `It's over quickly, and not messily at all, which Ya seems to find disappointing. "You didn't even stand up properly," she says, cleaning her spear for form's sake.

Mei Lin checks you for cuts, finds none, frowns at the lack of them as if it's suspicious, and goes back to sleep.`,
            3: () => `You don't get up. Two thin white spikes come out of the earth at the edge of the firelight, and the wolves, who were about to be very frightening, are suddenly very preoccupied, and then very still.

Ya, mid-lunge with her spear, stops, overbalances, and sits down in the ashes. "*Rude,*" she says. "I was *going*."

Mei Lin opens one eye, looks at the wolves, looks at you still lying under your blanket, says "Of course," and closes it again.`,
        },
        one: () => 'Two spikes from under the blanket. You don\'t open your eyes.',
    },
    night_drowned: {
        posture: (g, d) => `Two of the drowned stand at the edge of the camp, dripping, waiting to be noticed. They don't come closer. Somehow that's worse.

${pick(d, 'Mei Lin\'s hand finds your sleeve in the dark.', 'You sigh and get up. They deserve better than to be ignored.', 'You can feel the knot of foul Qi in them from here. You could undo it in your sleep. You might.')}`,
        win: {
            2: () => `Two needles, two quiet sinkings, and the water closes over them as if relieved. Ya cleans her spear, which she didn't use, and says it was good practice. Mei Lin cleans your cuts, which you don't have, and says nothing about practice at all. She doesn't let go of your sleeve for a long time.`,
            3: () => `You reach out without getting up and untie whatever is holding them, gently, the way you'd let go of a held breath. They lie down in the shallows like people who were very tired.

Ya, who had her spear up, lowers it slowly. "You do that like it's nothing," she says.

"It isn't nothing. It's just easy."

Mei Lin doesn't say anything. She moves her bedroll a hand's width closer to yours, and then, after a while, another.`,
        },
        one: () => 'You let them rest. They lie down in the water and do.',
    },
    night_serpent: {
        posture: (g, d) => `The serpent comes up the bank toward the warmth of the fire, belly scraping, tongue tasting the air. It tastes you. It tastes Yuki. It keeps coming, which is, in its defence, the only thing it knows how to do.

${pick(d, 'You grab the nearest burning branch, for all the good it\'ll do.', 'You put down your tea.', 'You don\'t put down your tea.')}`,
        win: {
            2: () => `A needle behind the jaw, a blade under the skull, and the serpent slides back down the bank the way it came, only much less alive. Ya says it was good practice. Mei Lin says nothing about practice at all, and puts another stick on the fire.`,
            3: (g) => `You don't put down your tea. ${yuShort(g)} gets up instead, looks at the serpent, and the serpent — which has never in its life seen ${yukiForm(g) === 'tiger' ? 'a white cat the size of a cart' : 'whatever Yuki is tonight'} — makes a decision, and the decision is *the river*.

It goes back down the bank very fast, in reverse.

"Your cat," Ya says, reverently, "is the most frightening thing I've ever met. Except you. Except — no, the cat."

You finish your tea.`,
        },
        one: () => 'You keep drinking your tea. The serpent leaves without being asked twice.',
    },
    night_hawks: {
        posture: (g, d) => `Cinder hawks, two, diving at the fire as if it owes them money, sparks raining off their wings.

${pick(d, 'They\'re after the food. And Yuki.', 'They\'re after the food. You\'re after sleep. One of you will be disappointed.', 'You roll over.')}`,
        win: {
            2: () => `Two darts. Two small showers of sparks. Ya says it was good practice. Mei Lin says nothing about practice at all; she's already asleep again, which you take as a compliment.`,
            3: () => `You roll over and a lid of white bone closes over the fire like a cooking pot. Two hawks hit it, bonk, bonk, and slide off into the ash, where they lie on their backs with their feet in the air, thinking about what they've done.

Ya laughs so hard she has to put her face in her bedroll. Mei Lin tells her to be quiet, very sternly, and then laughs too.`,
        },
        one: () => 'A lid of bone over the fire. Bonk. Bonk.',
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
