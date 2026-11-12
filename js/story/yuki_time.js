/**
 * v0.11.137 (owner pick TR1, the tree's push 1: YB + YT + YG-A + YR + YP; texts by Fable, rule 10, "texts are ok" 07:46):
 * Yuki's daily scene. Once a waking day, at every resting place, James spends time with Yuki (a door card, `yk_time`): 10 minutes on the
 * card and a talk's 10 on "Go on.", 20 in all, as Mei Lin's and Ya's talks (DR2; RT1's L2).
 *  - YB: the text by the place and the day of this Coil there (`byDay` on the place's own day record, RT1's L4), in her current form.
 *  - YT: a closing line by her form and level (the higher of friendship and affection: under 30, 30–71, 72 and up), drawn by the line picker
 *    once, when the scene opens (RT1's M1); in her human form at 72 and up by her path (lover, sister, or her question still open).
 *  - YG-A: +3 / +2 friendship and affection, by turns (2.5 a scene on average); Yuki never resets.
 *  - YR: the lover's answer to her question needs affection 72 (LIKES_BAR, the same bar as Mei Lin and Ya); below it "Not yet" leaves the
 *    path open (`yk_wait`, kept across Coils), and her daily scene in human form at 72 reopens it (`yk_choice_again`).
 * The card is appended last on each hub, so no choice position changes.
 */
import { bumpRel } from '../core/game.js';
import { daily, markDaily, byForm } from './common.js';
import { byDay, pickLine } from '../core/lines.js';
import { LIKES_BAR } from './act1_common.js';
import { ykPath, ykAskAgain, ykFamilyNow, YK_QUESTION } from './yuki_path.js';
import { TASK_HUBS } from './task_hubs.js';

export const YT_MINUTES = 10; // v0.11.137 (owner pick DR2): like Mei Lin's and Ya's talks (20 drifted the Coil 5 tribute +21.3)
/** YG-A: friendship and affection a scene, by turns (the Coil's count of her scenes picks the step). */
export const YT_GAIN = [3, 2];
export const YT_LOW = 30;
export const YT_LABEL = {
    "CAT": "Sit with Yuki.",
    "GREAT": "Lean on Yuki a while.",
    "HUMAN": "Sit down beside Yuki."
};
/** The texts by slot `<hub>:<day there>`: [cat, great root-kin, human]. */
export const YT_BODY = {
    "camp:1": [
        "Yuki climbs out of the hood of the lab coat, inspects the dry rise, and begins washing the crossing off herself one leg at a time. *The coat is singed,* says the bond. \"You were in the lab too.\" *I was asleep. Legally, I was luggage.* She finishes the leg and starts on your wrist.",
        "Yuki turns round twice on the dry rise, flattening the share of it you had thought of as yours, and lies down along the fallen trunk. You put your back against her instead. *The coat is singed,* says the bond. \"The coat crossed between universes.\" *So did I. I'm not singed.*",
        "Yuki sits on the fallen trunk and picks ash out of your hair with the grave attention she gives to anything she is about to criticise. \"One reading,\" she says. \"It was one reading.\" \"It was a universe, James. We have mislaid a whole universe. I'd like you to check your pockets.\""
    ],
    "camp:2": [
        "Yuki sits on your knee and watches the stream below with the look of a cat doing arithmetic. *There are fish.* \"They're black, they have too many fins, and the omnitool won't name them.\" *It needn't name them. I only want to meet one.* You agree to disagree. She does not agree to that either.",
        "Yuki lies along the top of the rise with her chin on your boots, watching the stream. *There are fish.* \"You'd empty that stream in an afternoon.\" *I'd be thorough.* Her tail sweeps the ground behind her, slowly, and takes the kindling with it. You go and fetch the kindling back. She watches you do it.",
        "\"There are fish,\" says Yuki, cross-legged on the rise with her chin in her hand. \"They've too many fins.\" \"Then there's more fish per fish.\" She has plainly worked this out. You explain bioaccumulation in a poisoned watershed. She listens to all of it, nods, and asks whether you'd like yours grilled."
    ],
    "camp:3": [
        "You are describing the gill spacing of a grey bracket fungus to the only member of your thesis committee who made the crossing. Yuki hears the defence out with her eyes shut. *Not a week a doctor,* says the bond, *and already lecturing in a wood.* \"It's fieldwork.\" *It's talking to a mushroom. I was told that would stop.*",
        "You hold a grey bracket fungus up to the light and tell Yuki about its gills. She puts one paw on your chest, very gently, and pushes until you are lying down. *Rest,* says the bond. *The mushroom will keep.* \"It's a new genus.\" *It was a new genus yesterday. Nobody else here is going to publish.*",
        "You are sorting grey bracket fungi by gill spacing when Yuki sits down beside you, takes one, and holds it up. \"Describe it,\" she says. You do, for some minutes. \"There,\" she says, handing it back. \"Now you've lectured, and you'll rest. I sat through the whole doctorate. I know how you work.\""
    ],
    "camp:4": [
        "Yuki kneads the lab coat where it covers your stomach, methodically, as if the camp were a bed she had finally got the lumps out of. You scratch under her jaw. The bond hums between you like a wire in the wind, the one thing here that tastes of home. *Don't get sentimental,* it says. *Left a bit.*",
        "Yuki stretches out along the fallen trunk, which creaks, and lays her head across your knees. You comb the grey moss out of her ruff with your fingers. The bond hums between you, the one thing in this forest that tastes of home. *Don't get sentimental,* it says. *There's a burr behind the left ear.*",
        "Yuki sits with her back against yours on the dry rise, her hair over your shoulder, saying nothing. The bond hums between you, the one thing in this forest that tastes of home. \"You're being sentimental,\" she says, without turning round. \"I can feel it from here. It's like sitting next to a kettle.\" She doesn't move away."
    ],
    "stream:1": [
        "Yuki crouches on a black stone and drinks from the stream with visible reservations. Then she sits, wraps her tail round her feet, and looks at the reeds, at the sky, and at you, in that order of merit. *Cold,* says the bond. *Wrong sky. Same idiot.* Of the three, you find, the last is a comfort.",
        "Yuki wades into the stream to the elbows, drinks, and comes out again to stand beside you, dripping on your shoes. She leans. You brace. *Cold water,* says the bond. *Wrong sky.* She looks down at you. *Same idiot. Two of the three are grounds for complaint.* You don't ask which two.",
        "Yuki kneels on a black stone, drinks from her cupped hands, and shakes them dry with distaste. Then she sits beside you on the bank, close, her tail round her ankles. \"Cold water,\" she says. \"Wrong sky. Same idiot.\" She considers the list. \"I can work with one of those.\" She doesn't say which."
    ],
    "wilds:1": [
        "Yuki has decided you are dirty and is seeing to it, beginning with the hand that pulled bark samples. Her tongue is a rasp. *Sap,* she reports. *Moss. Something that was a beetle.* \"I'm doing a survey.\" *So am I, now, by proxy. I'd like it noted that I didn't volunteer.* She does the other hand, to be even.",
        "Yuki pins your arm under one paw and washes your hand, which vanishes to the wrist. It is like being cleaned by a warm rasp with opinions. *Sap,* she reports. *Moss. Something that was a beetle.* \"I was taking samples.\" *I'm aware. I'm taking them back off.* The other arm is requested. You hand it over.",
        "Yuki takes your hand, turns it over, and scrubs the bark stains off it with a wet corner of her sleeve and no gentleness whatever. \"Sap. Moss. Something that used to be a beetle.\" \"I was taking samples.\" \"You were taking them home on you.\" She holds out her other hand for yours. You know better than to argue."
    ],
    "wilds:2": [
        "A black-barked tree, a patch of red light, and Yuki in the exact middle of it, which is your chest. You both look up at the canopy. At home the trees answered when you leaned on them. *These don't,* agrees the bond. *Rude.* She tucks her paws under. *Talk to me instead. I'll ignore you in a familiar way.*",
        "Yuki lies in a patch of red light under a black-barked tree, and you lie against her, and you both look up at the canopy. At home the trees answered when you leaned on them. *These don't,* agrees the bond. *Rude.* Her ribs rise and fall under your head. *Lean on me. I answer. Not always politely.*",
        "Yuki lies beside you in a patch of red light with her hands behind her head, looking up at the black canopy. At home the trees answered when you leaned on them. \"These don't,\" she says. \"Rude of them.\" She shuts her eyes. \"Talk to me instead. I'll ignore you, but in a way you're used to.\""
    ],
    "village:1": [
        "Yuki takes in Ashfall from the hood of the lab coat, over your shoulder: forty roofs, one well, a post everyone walks around. A grandmother makes a warding sign at the pair of you. *She's looking at the coat,* says the bond. \"She's looking at you.\" *I'm a cat. Cats are respectable. You are dressed as a ghost.*",
        "Ashfall was managing to stare at you until Yuki sat down by the well. Now the street is empty, in good order, and a shutter closes with great dignity. She washes a paw the size of a bucket. *They seem nice,* says the bond. You sit down beside her. Nobody comes for water.",
        "Yuki sits on the rim of the well with her ankles crossed, and Ashfall looks at the white hair, and the ears, and then with great resolve at the hair again. An old man bows to her at a slight angle, so as to address the part he accepts. \"I like them,\" she tells you. \"They're very brave about me.\""
    ],
    "ashfall:1": [
        "You sit on a wall, and Yuki sits on you, and together you watch Ashfall be normal as hard as it can. A man sweeps the same doorstep twice. Nobody looks at the red post. *They count days as you count spores,* says the bond. She pushes her head under your hand. *Scratch. It helps you think.*",
        "You sit on a wall and Yuki sits beside it, which puts her head level with yours. Together you watch Ashfall be normal as hard as it can. A man sweeps the same doorstep twice, with his back to her. Nobody looks at the red post. *They're afraid of the wrong thing,* says the bond. *I'd like that corrected.*",
        "You and Yuki sit on a wall and watch Ashfall be normal as hard as it can. A man sweeps the same doorstep twice. Nobody looks at the red post. \"They walk round it,\" she says, \"the way you walk round your inbox.\" She leans her shoulder on yours. \"You always opened it in the end. Usually too late.\""
    ],
    "ashfall:2": [
        "Yuki lies along your forearm while you pick barley husks out of her coat. Up the street the red banners hang still. *If it goes badly with the collectors,* says the bond, *I'm in the hood.* \"That's not a plan.\" *It's where I was when the lab went. I came out of that well.* She yawns. *You, less so.*",
        "You pick barley husks out of Yuki's ruff, which is no small job, while up the street the red banners hang still. *If it goes badly with the collectors,* says the bond, *stand behind me.* \"You used to say you'd be in the hood.\" *I've outgrown the hood. I haven't outgrown the principle.* She yawns, with every tooth, at the tribute post.",
        "Yuki is brushing down the lab coat with the flat of her hand, with you still in it. Up the street the red banners hang still. \"If it goes badly with the collectors,\" she says, \"you should look presentable. White is what they bury people in here.\" \"That's comforting.\" \"It's economical.\" She straightens your collar and leaves her hand there a moment."
    ],
    "fo_ashfall:1": [
        "Yuki sits on a fence post above the chalk line and supervises the digging. You stand beside her and scratch between her shoulders. North, the dead tree hums, and her ears go to it when your attention does. *I hear it too,* says the bond. *I'm ignoring it. I have a gift for ignoring things that call me.*",
        "The palisade crew has asked, with many bows, whether the honoured beast might sit somewhere else. Yuki has moved the length of one paw. You lean on her and watch them dig. North, the dead tree hums, and her ears go to it when your attention does. *I hear it too,* says the bond. *It can wait its turn, like the hammers.*",
        "Yuki sits on a barley sheaf with her chin on her knees, watching Ashfall build a wall. You sit next to her. North, the dead tree hums, and her ears turn that way a breath before your head does. \"I hear it too,\" she says. \"Don't look so relieved. It only means we'll both do something stupid.\""
    ],
    "fo_ashfall:2": [
        "A wild woman in a necklace of teeth has arrived and smelled everyone. Yuki reviews this from your shoulder, grooming your ear as she goes. *She sniffed me,* says the bond. *Properly. Nose first. Nobody else in this village has manners like that.* \"You liked her.\" *I said she had manners.* The ear is done. She starts on the hair.",
        "The wild woman with the tooth necklace walked up to Yuki, took her head in both hands, and looked at her teeth. Ashfall has not recovered. Yuki has, and lies beside you with her chin on your foot. *She counted them,* says the bond. *Then she nodded. I have been assessed by a professional. It's refreshing.*",
        "\"The one with the teeth round her neck,\" says Yuki, sitting down beside you, \"looked at my ears, said 'good ears', and went away.\" She thinks about it. \"This village has put real effort into not seeing them. I'd forgotten what it was to be complimented on a thing that exists.\" She flicks one, pleased. You say nothing, wisely."
    ],
    "fo_ashfall:2-before-ya": [
        "The hammers have been going since before the light, and Yuki has moved inside the lab coat to get away from them. Her head comes out at your collar. *They're building a fence against an Elder,* says the bond. \"It gives them something to do.\" *So does this.* She pushes her head under your chin until you scratch.",
        "The palisade crew works with its back to Yuki, on principle, and looks round every ninth stroke, on instinct. She lies beside you, counting. *Nine,* says the bond. *Nine. Eight. That one's nervous.* \"You could look less interested.\" *I could look more.* She rests her chin on her paws, a model citizen, and the hammers find their rhythm again.",
        "Yuki sits beside you on the rim of the well, and the women drawing water bow to her hair and to nothing above it. \"They've started bowing to you as well,\" she says. \"To the coat, specifically. They think it's a rank.\" \"It's a lab coat.\" \"It's the highest rank you hold.\" She brushes sawdust off its shoulder, to keep up standards."
    ],
    "fo_ashfall:3": [
        "Someone has left a dried fish on the wall for the honoured cat. Yuki eats it on your knee and reviews it. *Salt. Smoke. Regret.* \"It was a gift.\" *It was an offering. They think I'm an omen.* She cleans her whiskers. *I'm letting them. The fish at home were better, and nobody bowed.* She would like that weighed.",
        "The village has begun leaving dried fish on the wall for Yuki, one at a time, the way you'd pay a toll. She eats today's in a single bite while you lean on her flank. *Salt. Smoke. Fear.* \"They're being generous.\" *They're being careful. At this size it comes to the same thing.* She looks at the wall. It is empty.",
        "A child has brought Yuki a dried fish, held out at arm's length in both hands, and fled. She eats it sitting beside you, neatly, tail curled. \"Salt. Smoke. Reverence.\" \"You bowed back.\" \"It seemed to be the currency.\" She offers you the tail end, which from Yuki is a title deed, and watches until you eat it."
    ],
    "rr_hub:1": [
        "The great root is smooth as a bench and warm as one in the sun, and Yuki has found the warmest yard of it. You sit there. She gets on you. Under you both, the root hums against your Convergence like a tuning fork. *It purrs,* says the bond, critically. *Flat. I could teach it.* She demonstrates, on your knee.",
        "The root is wide enough for a cart, which means it is wide enough for Yuki, lengthways, with room for you at the shoulder. Under you both it hums against your Convergence like a tuning fork. *It purrs,* says the bond, critically. *Flat.* She demonstrates the correct pitch. You feel it in your back teeth.",
        "Yuki walks the root's edge with her arms out, heel to toe, her tail doing the real work, then sits down beside you and lets her feet hang. Under you both the wood hums against your Convergence. She lays her palm flat on it. \"It's purring,\" she says. \"Flat, and in its sleep. I know a man like that.\""
    ],
    "rr_hub:2": [
        "Yuki is asleep in the hood, or says she is. The roots are warmer today, and the bond is warm with them, a slow shared drowse. You put a hand back and find an ear. *Something lives in the split,* it reminds you. \"I know.\" *Then stop thinking about it so loudly. Some of us are resting for it.*",
        "Yuki sprawls on the warm root with all four feet in the air, which nothing that size should be allowed to do. You scratch her chest. The bond goes slow and drowsy. *Something lives in the split,* it reminds you. \"I know.\" *Good. Then I needn't get up yet.* One back foot kicks, twice, at nothing, with dignity.",
        "Yuki lies on her back on the warm root with her head on your leg, eyes closed, ears slack. \"Something lives in the split,\" she says. \"I know.\" \"You're thinking about it very loudly.\" She finds your hand without looking and puts it on her hair, where it is evidently meant to be useful. \"Think quieter. Scratch.\""
    ],
    "dw_hub:1": [
        "Yuki has crossed the Drowned Wood on your shoulders and the top of your head, and is dry, and you are not. On a raft of dead trunks she washes the one paw that got splashed. You wring out the lab coat. *You're dripping on my log,* says the bond. You hold the wet coat out to her. She declines it.",
        "Everything Yuki does in the Drowned Wood ends in a splash, and you have been standing beside most of it. She lies on the one dry log, drying a foreleg. You wring out the lab coat. *You're wet,* says the bond, with interest. She lets you sit against her anyway, on the side she has finished.",
        "Yuki sits on a dead trunk above the black water with her feet tucked under her, wringing out the hem of her dress and looking at you as if you had flooded the wood yourself. \"There's dry ground somewhere ahead.\" \"And?\" \"And until then I'm blaming you. It passes the time.\" She wrings out your sleeve as well."
    ],
    "dw_hub:2": [
        "Yuki sits in your lap and watches the black water, where something made a ring and did not come up again. Her tail twitches. *Fish,* says the bond. \"That was not a fish.\" *It was fish-shaped where it mattered.* \"It had hands.\" A pause, while she weighs this. *Small hands,* she allows, and goes on watching.",
        "Yuki crouches at the edge of the trunks with her nose an inch off the black water, where something made a ring and did not come up. *Fish,* says the bond. \"That was not a fish.\" *It will be.* You take hold of her ruff with both hands, for all the difference that makes. She permits it, as she'd permit a hat.",
        "\"Fish,\" says Yuki, pointing at a ring spreading on the black water. \"That was not a fish.\" \"It moved like a fish.\" \"It had hands, Yuki.\" She folds her arms on her knees and watches the place where it went down. \"Everything here has a drawback,\" she says. \"I'd still like it noted that I saw it first.\""
    ],
    "ah_hub:1": [
        "Ash has got into everything. Yuki is grey, the lab coat is grey, and she sits on your knee doing herself first. *One of us was white,* says the bond. *I intend to be again. The coat is your problem.* A cinder hawk goes over, trailing smoke. She watches it the whole way across. *Later,* she tells it.",
        "Yuki is grey to the shoulder with ash, and there is a great deal of shoulder. You work through it with your fingers while cinder hawks circle overhead. *Behind the ears,* says the bond. *Under the chin. No. Yes.* A hawk drifts lower, trailing smoke. She looks up at it. It reconsiders. *There,* she tells you. *Stay there.*",
        "Yuki stands in front of you, grey with ash, and holds out one arm like a woman being fitted. You beat the dust from her sleeve. \"A cat would do this herself,\" you say. \"A cat has a tongue for it. I have you.\" She turns to give you the other arm, and then her hair, which will take longer."
    ],
    "ah_hub:2": [
        "The dead tree fills the north now, and your Convergence won't stop turning to it. Yuki climbs from your lap to your chest and puts her forehead against your chin, hard. The bond closes round you like a hand. *It's loud,* she says. *I'm louder. I've had forty years' start.* She stays until your breathing agrees with hers.",
        "The dead tree fills the north now, and your Convergence won't stop turning to it. Yuki sets her head against your chest and pushes, slowly, until you sit down. The bond closes round you like a hand. *It's loud,* she says. *I'm louder. I've had forty years' start.* Her head stays where it is until your breathing agrees with hers.",
        "The dead tree fills the north now, and your Convergence won't stop turning to it. Yuki takes your face in both hands and turns it back to her, as you'd correct a compass. \"It's loud,\" she says. \"I know. I'm louder, and I've had forty years' start.\" She holds on until your breathing agrees with hers."
    ],
    "heart_hub:1": [
        "The hall is grown, not built, and Yuki walks its ledges as she walked the ones at home, leaving the only pawprints in a thousand years of dust. She comes back and sits on your foot. *It's a house,* says the bond. *I know where the warm spot would have been.* She looks at it a while. *I'm not going to sit there.*",
        "The hall is grown, not built, and for once Yuki is in a room large enough for her. She paces it, leaving prints the size of plates in the dust, then lies down against you. *It's a house,* says the bond. *I know where the warm spot would have been.* She looks at it. *I'm not going to lie there.*",
        "Yuki walks the hall with one hand trailing along the grown wood, as she'd walk a corridor at home, and sits down beside you in the dust. \"It's a house,\" she says. \"The ledges are where ours were. I know where somebody's cat would have slept.\" She draws her knees up. \"I'm not going to sit there.\""
    ],
    "heart_hub:2": [
        "You have been over the walls twice and found no rot. Four hundred years dead, and not one fruiting body. Yuki hears this from inside your coat. *You're upset that nothing is eating it,* says the bond. \"It's unnatural.\" *You're a mycologist in a tree with no mushrooms. It's personal.* Her head comes out under your chin. *I'm sorry about your mushrooms.*",
        "You have been over the walls twice and found no rot. Four hundred years dead, and not one fruiting body. Yuki hears it all with her chin on your shoulder, which bears it. *Nothing will eat this wood,* says the bond. *Not even your friends.* \"It's unnatural.\" *It's sad. You're allowed to say sad.* She breathes out, and the dust goes everywhere.",
        "\"No rot,\" you say. \"Four hundred years dead, and not one fruiting body.\" Yuki, sitting against the wall with your coat round her shoulders, nods along. \"Nothing will eat it. Not even your friends.\" \"It's unnatural.\" \"It's sad, James. You've a doctorate. You're allowed the short word.\" She shifts over so that the coat covers you both."
    ],
    "heart_hub:3": [
        "Somewhere under the floor one note is going on and on, and Yuki has put herself on your chest to hear it through you. Her purr finds the pitch and settles a third above. *Our tree did this when you were small,* says the bond. *You slept through it. I sat up.* Her eyes close. *Somebody ought to sit up.*",
        "Somewhere under the floor one note is going on and on. Yuki lies with her head across your chest to hear it through you, and you breathe carefully. Her purr finds the pitch and settles a third above. *Our tree did this when you were small,* says the bond. *You slept. I sat up. Somebody ought to.*",
        "Somewhere under the floor one note is going on and on. Yuki sits with her ear against your chest to hear it through you, and hums, very low, a third above. \"Our tree did this when you were small,\" she says. \"You slept through it. I sat up.\" Her ear turns. \"I didn't know I could do the harmony.\""
    ],
    "heart_hub:4": [
        "There is a hollow in one of the ledges, worn smooth, the size of something that slept curled. Yuki has walked round it for three days. Today she is in it, and you sit below with a hand up on her back. *It fits,* says the bond. *Someone kept it warm once. I'm only minding it.* She does not get out.",
        "There is a hollow in one of the ledges, worn smooth by something that slept curled, and it would fit one of Yuki's paws. She has put one paw in it, with care, and the rest of her against you. *Someone kept that warm once,* says the bond. *I walked round it for three days. I'm only minding it.* The paw stays.",
        "There is a hollow in one of the ledges, worn smooth by something that slept curled. Yuki has walked round it for three days. Today she sits on the ledge beside it with her hand resting inside, and you sit with her. \"Someone kept it warm once,\" she says. \"I'm only minding it.\" A moment. \"Don't write that down.\""
    ],
    "rt_camp:1": [
        "Yuki sits on your knee and has you go through the omnitool's inventory aloud, item by item, like a story. It arrived empty. It is no longer empty. *That's a great deal of dead animal,* says the bond, when you finish. \"You caught a fair share of it.\" *I know. I wanted to hear it said.* She kneads your leg, a cat of property.",
        "Yuki lies behind you like a warm wall and has you read out the omnitool's inventory, item by item. It arrived empty. It is no longer empty. *That's a great deal of dead animal,* says the bond, at the end. \"You caught a fair share of it.\" *I know. I wanted to hear it said.* Her tail comes round your feet and stays.",
        "Yuki leans against your arm and has you read out the omnitool's inventory, item by item, keeping count on her fingers. It arrived empty. It is no longer empty. \"That's a great deal of dead animal,\" she says. \"You caught a fair share of it.\" \"I know. I wanted it said aloud.\" She runs out of fingers and starts on yours."
    ],
    "rt_camp:2": [
        "\"The road home,\" Mei Lin called it, and Yuki has been turning the word over ever since, on your chest, with her paws tucked. *Home is a grove in another universe,* says the bond. *Also a hood. Also, lately, wherever you've put the fire.* She considers the list. *I'm not fussy. Don't tell the village.*",
        "\"The road home,\" Mei Lin called it, and Yuki has been turning the word over since, stretched beside you with her chin on your knees. *Home is a grove in another universe,* says the bond. *It was also a hood. I've had to let the hood go.* A sigh that moves the ash. *Wherever you put the fire will do.*",
        "\"The road home,\" Mei Lin called it. Yuki sits beside you with her arms round her knees and turns the word over. \"Home is a grove in another universe,\" she says. \"And a hood I no longer fit. And wherever you've put the fire, apparently.\" She leans in. \"Don't tell the village. They'd hold a ceremony.\""
    ],
    "rt_ashfall:1": [
        "Ashfall is being brave in complete silence, and Yuki is in your lap having her ears done, because some things are not postponed for elders. *An old man is coming to take you,* says the bond. *He'll find the position filled.* She turns her head so you can reach the other ear. *I was here first. By forty years.*",
        "Ashfall is being brave in complete silence. Yuki lies across the lane with you propped against her, and the village walks round you both without comment, which is new. *An old man is coming to take you,* says the bond. *He'll find the position filled.* A hunter bows to her in passing. She inclines her head. It's a start.",
        "Ashfall is being brave in complete silence. Yuki sits beside you on the wall, straightening the lab coat's collar, then your glasses, then the collar again. \"An old man is coming to take you,\" she says. \"He'll find the position filled.\" Her hand stays flat on your chest a moment. \"I was here first. Tell him I said so.\""
    ],
    "lf_hub:1": [
        "Yuki lies on your chest in the moss, and neither of you has anywhere to be. Past the trees a village is having the same week it had before, without you. *The smoke's in the same place,* says the bond. \"It'll keep.\" *Everything keeps, here. It's the one thing this world does well.* A stretch. *Scratch lower.*",
        "Yuki lies in the moss and you lie against her, and neither of you has anywhere to be. Past the trees a village is having the same week it had before. *Same smoke,* says the bond. *Same sky. Same hares, I think. One looked at me as if we'd met.* \"Had you?\" *I ate it both times. It's hard to be sure.*",
        "Yuki lies beside you in the moss with one arm over her eyes, and neither of you has anywhere to be. \"Past those trees,\" she says, \"a village is having the week it had before. Same smoke. Same days.\" \"It'll keep.\" \"Everything keeps, here. It's like being handed back a book you'd finished, with the bookmark taken out.\""
    ],
    "lf_hub:2": [
        "A season has gone by, or a week. Yuki sits on your shoulder and washes your ear while you count on your fingers. *Stop,* says the bond. *Whenever this world starts over, you're three days a doctor again. I've watched.* \"That can't be how time works.\" *It's how it works here.* She starts on the other ear.",
        "A season has gone by, or a week. You count on your fingers, propped against Yuki's side. *Stop,* says the bond. *Whenever this world starts over, you're three days a doctor again. I've watched.* \"That can't be how time works.\" *It's how it works here.* Her tail drops across your hands, and that is the end of the counting.",
        "A season has gone by, or a week. You are counting on your fingers when Yuki sits down and folds them shut. \"Stop. Every time this world starts over, you're three days a doctor again. Forty years I waited for that thesis.\" She keeps hold of the hand. \"Now you finish it fresh every loop. I'd call it justice.\""
    ]
};
/** The closing lines by form and level (HUMAN HIGH by her path). */
export const YT_CLOSE = {
    "CAT LOW": [
        "*That will do,* says the bond, and she goes back to being a cat at you.",
        "She gives you one slow blink, which you have always been told is affection, and which she has never confirmed.",
        "She has had enough of you for now, and lets you know it kindly, by her standards.",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "*Noted,* says the bond, and she turns her back on you, which among cats is either trust or a review.",
        "She washes the place where your hand was, thoroughly, and without malice.",
        "Her tail goes up like a flag over a closed office.",
        "*You may go,* says the bond. You had not been aware of asking.",
        "She looks past your left ear at something more interesting. You check. There is nothing there.",
        "One ear stays turned your way as she leaves off. It is the minimum, and she has measured it.",
        "*Same time tomorrow,* says the bond. *Or don't. I'll be somewhere.*",
        "She yawns, pink and unhurried, and files you with the rest of the day.",
        "She stretches, front and then back, every toe spread, and walks through the end of your sentence.",
        "*Adequate,* says the bond. From her it is not quite an insult. It isn't the other thing either.",
        "She closes her eyes at you. It is not sleep. It is a door."
    ],
    "CAT MID": [
        "She stays where she is a while after there is any reason to, and neither of you remarks on it.",
        "The purr starts late and unasked, and you are careful not to look pleased.",
        "*You'll do,* says the bond, which after forty years is still the highest mark she gives.",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She sets one paw on your wrist, claws in, and leaves it there like a paperweight.",
        "*Don't read anything into it,* says the bond, as she turns round twice and settles against you.",
        "Her tail lies along your arm. She appears not to know about it.",
        "She washes your knuckle, twice, in passing, as one might straighten a picture in somebody else's house.",
        "*You were less tiresome today,* says the bond. *I've made a note. It's a short note.*",
        "She tucks her nose under your thumb and goes to sleep there, or says she does.",
        "She bumps her head into your palm, once, hard, and then looks at the hand as if it had started it.",
        "*Stay there,* says the bond. *You're the right temperature.*",
        "Her eyes go to slits and her ears stay on you, and that is as near as she comes to saying it.",
        "She kneads you twice, catches herself at it, and sits very upright for some time.",
        "*Forty years,* says the bond, *and you still scratch a little too far left. I've decided to find it restful.*"
    ],
    "CAT HIGH": [
        "The bond sits wide open between you, and for a while you could not say where you stop and she starts. Neither of you goes looking for the line.",
        "She presses her forehead to yours and holds it there, and everything that isn't the two of you goes quiet. *Mine,* says the bond, of nothing in particular.",
        "*Wherever you go, I go,* says the bond. *That isn't a promise. It's a description.*",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She fits herself under your chin, where she has fitted since the grove, and the bond closes over you both like water.",
        "*I know what you're about to think,* says the bond. *I've known since the grove. Think it anyway. I like the company.*",
        "She breathes when you breathe. Neither of you is doing it on purpose, and neither of you could stop.",
        "*If they sent you back without me,* says the bond, *I'd walk. Between universes. I'd complain the whole way, and I'd arrive.*",
        "She sets her teeth on the heel of your hand, without pressure, and holds them there: the oldest thing she knows how to say.",
        "For a moment you see yourself as the bond has you: tall, slow, badly groomed, and the fixed point of the world. *Don't let it go to your head,* she says.",
        "*We were born on one day,* says the bond. *I don't intend to manage any of the other days without you either.*",
        "Her purr drops until it is less a sound than a place, and you are both in it.",
        "*Two universes,* says the bond, *and I've only found the one of you. I looked. I'm thorough.*",
        "She puts her whole small weight on your heart, on purpose, like a seal on a letter.",
        "*Home,* says the bond, and it doesn't mean the grove. She shuts her eyes before you can answer."
    ],
    "GREAT LOW": [
        "*That will do,* says the bond, and she turns her attention to something more deserving, which today is a leaf.",
        "She yawns in your face, all of it, and considers the matter closed.",
        "She puts up with you a little longer, with the patience of something that could simply lie down on the problem.",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "*Enough,* says the bond, and she rolls onto her other side, which takes a moment and ends the discussion.",
        "She gets up, and the space she leaves is larger than you are. You are left in it.",
        "Her tail passes over your head on the way round, not quite by accident.",
        "She looks down at you from a short way up, at length, the way one reads a notice.",
        "*You may go,* says the bond. *I would, but I'm comfortable.*",
        "She breathes out through her nose, and your hair moves. That appears to be the verdict.",
        "One ear the size of your hand swings toward you, and swings away again.",
        "She stretches until every claw is out and the ground has four new furrows in it, and none of that was for you.",
        "*Tomorrow,* says the bond. *If nothing better is on.*",
        "She shuts one gold eye. The other stays on you a moment longer, on general principle, and then follows it.",
        "She rests her chin on her paws and regards the middle distance, where you are not."
    ],
    "GREAT MID": [
        "Her weight settles against you by slow degrees, as trust does in a thing that size, and you find you are holding up more cat than you planned for.",
        "The purr comes up through the ground and into your ribs, unasked. You are careful not to look pleased.",
        "*You'll do,* says the bond, and her tail comes down across your feet to see that you stay done.",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She walks once round you before she lets you go, slowly, at her full length, like a wall being built.",
        "One great paw arrives on your knee with no weight in it at all, which is the whole of the compliment.",
        "*You're warm,* says the bond. *That's the entire reason.* Her head stays on your shoulder a good deal longer than the reason does.",
        "She washes the side of your head in one pass. Your glasses will need finding.",
        "Her tail goes round your ankles, the way a traveller keeps one foot on his bag.",
        "*You were tolerable today,* says the bond. *At this size I have more room for tolerance.*",
        "She moves over to give you the better ground, and then lies down on most of it.",
        "Her ruff closes over your hand to the wrist. She lets on that it has gone missing and she can't think where.",
        "She puts herself between you and whatever is behind you, and looks elsewhere.",
        "*Sit still,* says the bond. *I've only just got you arranged.*",
        "She sighs, hugely, like a contented bellows, and then looks at you to see whether you mean to make something of it."
    ],
    "GREAT HIGH": [
        "She lays her head over your heart and leaves it there, and the bond opens so wide you could walk about in it. Neither of you mentions it.",
        "*Wherever you go, I go,* says the bond. *I take up more of the road now. Nothing else has changed.*",
        "Her breathing and yours have fallen into step, as they have since the grove. *Mine,* says the bond, of nothing in particular, and one great paw closes over your hand.",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She curls round you until there is cat on every side, and the bond comes down over the pair of you like a roof.",
        "*I used to fit in your hood,* says the bond. *Now you fit in me. I find I don't mind which.*",
        "You can feel her heart through your back, slow and enormous, and yours slows down to keep it company.",
        "*Anything that wants you,* says the bond, *comes through me first. There is a good deal of me now. I've been looking forward to it.*",
        "She closes her jaws on your shoulder, with no more pressure than a hand, and lets go. Among her kind that is a signature.",
        "*I've stopped looking for the grove in this sky,* says the bond. *It turns out I brought the part I needed.* Her eye closes.",
        "Her nose comes to rest in the hollow of your neck, cold, vast and exact, and she breathes you in as if checking that nothing had been changed.",
        "The purr is too low to hear now. You know it by the way your bones have stopped being separate things.",
        "*Forty years,* says the bond, *and I've never once had to wonder where you were. Keep it that way. I'm too large to go looking quietly.*",
        "Through the bond you get, for a moment, how you smell to her: lab coat, ash, and under both of them the grove. She has kept it all this time, like a pressed leaf.",
        "She says nothing, and the bond says nothing, and it is the least lonely silence you have ever been part of."
    ],
    "HUMAN LOW": [
        "\"That will do,\" she says, getting up, and brushes off her dress as though you had been the dusty part.",
        "She gives you the slow blink. On a face it is harder to deny, and she denies it anyway.",
        "\"Same again tomorrow,\" she says. \"Bring better conversation.\"",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "\"Noted,\" she says, and examines her fingernails, which she still considers a poor exchange for claws.",
        "She stands and looks down at you for a moment, enjoying the angle. It doesn't come up often.",
        "\"You may go,\" she says. \"Or I will. One of us should, and I've the better exit.\"",
        "Her ear turns toward you. The rest of her does not see why it should.",
        "\"I've heard worse,\" she says. \"From you, mostly. Across four decades.\"",
        "She tucks her tail round her ankles, out of your reach, with the care of someone putting away the good china.",
        "\"That was nearly a conversation,\" she says. \"Keep at it.\"",
        "She yawns behind her hand, which she has learned, and looks at you over the top of it, which she never had to.",
        "\"Don't get up,\" she says, already going. \"You'll only loom.\"",
        "She straightens your collar with two fingers, as one might correct a spelling, and takes the fingers back at once.",
        "\"Adequate,\" she says. \"I'd say more, but then you'd expect it.\""
    ],
    "HUMAN MID": [
        "She bumps her head against your shoulder, once, exactly as she did when she weighed nothing, and looks straight ahead afterwards.",
        "\"You'll do,\" she says. It has been her highest mark for forty years, and it sounds different aloud. She seems to notice that too.",
        "She stays a while after there is any reason to. Her tail has settled against your back, and neither of you remarks on it.",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She leans her shoulder into yours and addresses the middle distance. \"Don't read anything into it. I'm resting.\"",
        "Her hand lands on your head, briefly and flat, the way yours has landed on hers for forty years. She appears to find the view from that side instructive.",
        "\"You were less tiresome today,\" she says. \"I checked twice.\"",
        "She picks something off your sleeve, inspects it, and doesn't say what it was. Her hand stays on the sleeve.",
        "One white ear rests against your temple. She seems to think you won't notice if she doesn't.",
        "\"Stay there,\" she says. \"You're the right temperature, and I've lost the fur.\"",
        "She hums, low in her chest, where the purr used to be kept, and stops when she hears herself.",
        "\"I had words for you for forty years,\" she says. \"It's strange to need a mouth for them. You're still not getting the long ones.\"",
        "She puts her feet across your knees without asking, as she always has. There are simply fewer of them now, and more of each.",
        "Her fingers find the spot behind your ear and scratch it, twice. \"There,\" she says. \"Now you know what it's like.\"",
        "She gets up, and then sits down again closer, as though the first place had been a clerical error."
    ],
    "HUMAN HIGH LOVER": [
        "She kisses the corner of your mouth, unhurried, like someone with forty years of you who wants the rest as well. \"Later,\" she says against your cheek, and makes the word a promise.",
        "Her hand finds yours and her tail finds your wrist, and she is in no hurry to give either back. \"Forty years I had the warm side of you,\" she says. \"It turns out there was more.\"",
        "She leans in until her forehead rests on yours, gold eyes too close to focus on. \"Tonight,\" she says, very dry, \"you're not having the blanket to yourself.\"",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She turns your arm over and kisses the inside of the forearm, where the omnitool sits under the skin. \"It's seen everything already,\" she says. \"It's very discreet.\"", // RV1 (L6; Fable's): the omnitool is in his forearm (lore.md)
        "\"I know how you sleep,\" she says, close to your ear. \"I've known for forty years. I'm still learning how you don't.\"",
        "She settles into your lap, since it was always hers, and puts her arms round your neck, since that part is new. \"Same seat,\" she says. \"Better view.\"",
        "Her tail slides round your waist under the lab coat and stays, and her face admits to nothing. \"It does that,\" she says. \"I've stopped apologising for it.\"",
        "She bites your lower lip, lightly, and soothes it after. \"Old habit,\" she says. \"New place.\"",
        "\"You hum when you're happy,\" she says into your collar. \"Through the bond. You always have. It's a great deal louder from this close.\"",
        "She draws one fingernail slowly down the back of your neck and watches the result with a naturalist's interest. \"Noted,\" she says. \"I'm compiling.\"",
        "Her mouth finds the place under your jaw, unhurried, and stays for the length of a breath. When she sits back her ears are forward and her eyes are very gold. \"Hold that thought,\" she says. \"I intend to.\"",
        "\"I used to sleep on your chest and listen to your heart,\" she says, with her palm flat over it. \"I'd like it known that I can make it go faster now. I've tested.\"",
        "She kisses you properly, slowly, like something she means to go on with, and stops exactly when she chooses to. \"There's more of that,\" she says. \"It keeps.\"",
        "She smooths your coat closed again, button by button, with great care. \"I'm only doing these up,\" she says, \"so that I know where I left them.\""
    ],
    "HUMAN HIGH SISTER": [
        "She flicks your ear, hard, and then tidies your hair where she disturbed it. \"Family,\" she says, as other people say \"checkmate\".",
        "\"If anything out there hurts you,\" she says, quite pleasantly, \"I'll eat it. I'm telling you now so that you don't make a fuss when it happens.\"",
        "\"You're hopeless,\" she says, and leans her whole weight on you so that you can't get up and prove otherwise. \"Lucky for you I came with the bond.\"",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "She licks her thumb and rubs a mark off your cheek, over your objections. \"Forty years I did that with my tongue,\" she says. \"Be grateful for thumbs.\"",
        "\"Whoever you bring home,\" she says, \"comes past me first. I'll be fair. I'll be seen to be fair. They'll never know what happened.\"",
        "She takes the larger share of the seat and most of your coat. \"Sibling's portion,\" she says.",
        "\"You're my brother,\" she says, \"which means only I get to say what's wrong with you. I keep a list. It's alphabetical.\"",
        "She punches your arm, not gently, and leaves her knuckles resting there. \"That's affection. I've read about it.\"",
        "\"I'd step in front of lightning for you,\" she says. \"I'd also mention it afterwards, daily, for eight hundred years. Think carefully before you need it.\"",
        "She fixes your glasses, which were straight, and then your hair, which wasn't. \"Somebody's mother ought to,\" she says. \"You got me instead.\"",
        "\"Born the same day,\" she says, \"and I've been the elder since lunchtime of it.\" She pats your knee, twice, as one dismisses a pupil.",
        "She puts her head down on your shoulder and is asleep in four breaths, as she has been in hoods, pockets and lecture halls. You are not to move. You know the rules.",
        "\"If you cry at anything,\" she says, \"I didn't see it. If I do, you didn't. That's the whole treaty. It's held for forty years.\"",
        "She hooks her tail through your arm, as other people's sisters take an elbow, and walks you three steps in the direction she has chosen. \"There,\" she says. \"Go on by yourself. I'll be watching.\""
    ],
    "HUMAN HIGH UNDECIDED": [
        "\"I asked you a question once,\" she says, not looking at you. \"No hurry. I've only forty years invested.\"",
        "She looks at you a breath longer than the moment needs, then away. \"Still waiting,\" she says. \"I'm good at it. I once watched a mousehole through an entire conference.\"",
        "Her tail curls once round your wrist and lets go. \"That wasn't a hint,\" she says. \"When I hint, you'll know. I'll use small words.\"",
        // v0.11.152 (owner pick RP1, RM10, YT14; Fable's): eleven more, so a Coil never repeats one
        "\"Don't answer yet,\" she says, though you hadn't opened your mouth. \"You've got your thesis face on. I'm not being a footnote.\"",
        "She starts to lean on you, stops halfway, makes a decision, and leans. \"This doesn't count toward anything,\" she says.",
        "\"Whichever you say,\" she says, \"I'm keeping the blanket. I thought you'd want the stakes laid out.\"",
        "Her hand rests beside yours, a finger's width off, and stays exactly that far. She has measured it. So have you.",
        "\"I can feel you thinking about it,\" she says. \"Through the bond. It's like living over a mill.\"",
        "She looks at your mouth, then at your eyes, then at the weather. \"Nothing,\" she says. \"I was thinking. It happens.\"",
        "\"Family or more,\" she says lightly. \"It's two options. You sorted four hundred fungi by gill spacing with less ceremony.\"",
        "Her ears go forward when you turn to her and back when you don't speak. She is aware of both, and annoyed about one.",
        "\"I'm not waiting,\" she says. \"I'm here anyway. The waiting is incidental.\"",
        "She gets as far as saying your name, and stops, and shakes her head. \"No. It's your turn,\" she says. \"It has been your turn for some time.\"",
        "\"Ask me how patient I am,\" she says. \"No, don't. I'd have to be honest, and we'd both regret it.\""
    ]
};
/** The slots of each resting place, by its day this Coil (past the last, from the start again). Ya's arrival decides the Fallout's second day. */
export const YT_HUBS = {
    camp: ['camp:1', 'camp:2', 'camp:3', 'camp:4'],
    stream: ['stream:1'],
    wilds: ['wilds:1', 'wilds:2'],
    village: ['village:1'],
    ashfall: ['ashfall:1', 'ashfall:2'],
    fo_ashfall: ['fo_ashfall:1', (g) => (g.flags.ya_met ? 'fo_ashfall:2' : 'fo_ashfall:2-before-ya'), 'fo_ashfall:3'],
    rr_hub: ['rr_hub:1', 'rr_hub:2'],
    dw_hub: ['dw_hub:1', 'dw_hub:2'],
    ah_hub: ['ah_hub:1', 'ah_hub:2'],
    heart_hub: ['heart_hub:1', 'heart_hub:2', 'heart_hub:3', 'heart_hub:4'],
    rt_camp: ['rt_camp:1', 'rt_camp:2'],
    rt_ashfall: ['rt_ashfall:1'],
    lf_hub: ['lf_hub:1', 'lf_hub:2'],
};

const yrel = (g) => g.rel.Yuki || { f: 0, a: 0 };
/** YT: her level, from the higher of her two numbers. */
export const ytLevel = (g) => { const r = yrel(g); const v = Math.max(r.f, r.a); return v >= LIKES_BAR ? 'HIGH' : v >= YT_LOW ? 'MID' : 'LOW'; };
/** YT: the closing-line pool for her form, level and (human, 72 and up) path. */
export function ytPool(g) {
    const form = byForm(g, 'CAT', 'GREAT', 'HUMAN');
    const lv = ytLevel(g);
    if (form !== 'HUMAN' || lv !== 'HIGH') return `${form} ${lv}`;
    return ykPath(g) === 'lover' ? 'HUMAN HIGH LOVER' : ykPath(g) === 'sister' ? 'HUMAN HIGH SISTER' : 'HUMAN HIGH UNDECIDED';
}
const hubOf = (g) => (YT_HUBS[g.flags.yk_time_hub] ? g.flags.yk_time_hub : 'camp');
const dayKeyOf = (g) => `yk_time:${hubOf(g)}`;
/** YB: today's slot at this place. */
export const ytSlot = (g) => byDay(g, YT_HUBS[hubOf(g)], hubOf(g)); // v0.11.137 (RT1, L4): the day at the place, not the count of Yuki scenes there

export const SCENES_YT = {
    yk_time: {
        id: 'yk_time', title: 'Yuki', art: 'yuki_close', place: (g) => g.location,
        dayKey: dayKeyOf,
        enter: (g) => {
            markDaily(g, 'yk_time');
            const n = g.flags.yk_times || 0;
            g.flags.yk_times = n + 1;
            const step = YT_GAIN[n % YT_GAIN.length];
            bumpRel(g, 'Yuki', step, step);
            const pool = ytPool(g); // RT1 (M1): the closer drawn once here, after the gain, so a redraw shows the same line
            g.flags.yk_time_close = `${pool}|${pickLine(g, `yt:${pool}`, YT_CLOSE[pool])}`;
            return [];
        },
        text: (g) => {
            const b = YT_BODY[ytSlot(g)];
            const body = byForm(g, b[0], b[1], b[2]);
            const [pool, i] = String(g.flags.yk_time_close || '').split('|');
            const line = YT_CLOSE[pool]?.[Number(i)];
            return line ? `${body}\n\n${line}` : body;
        },
        choices: [
            { text: YK_QUESTION.answer, show: ykAskAgain, to: 'yk_choice_again' },
            // RT1 (L1): below 72 her question still has its family answer (the question's own label; the place-neutral scene)
            { text: '"Family. You\'re my sister, Yuki. You always have been."', show: ykFamilyNow, do: (g) => { g.flags.yk_back = hubOf(g); g.flags.yk_form_before = 'human'; g.flags.yk_path = 'sister'; delete g.flags.yk_wait; return []; }, to: 'yk_sister_here' },
            { text: 'Go on.', to: hubOf },
        ],
    },
};

/** The card on every resting place: appended last (no choice position changes), a door card (`doors`), once a waking day. */
export function installYukiTime(SCENES) {
    Object.assign(SCENES, SCENES_YT);
    for (const hub of Object.keys(YT_HUBS)) {
        const s = SCENES[hub];
        if (!s) continue;
        s.choices.push({
            text: (g) => byForm(g, YT_LABEL.CAT, YT_LABEL.GREAT, YT_LABEL.HUMAN),
            show: daily('yk_time'),
            time: YT_MINUTES,
            do: (g) => { g.flags.yk_time_hub = hub; return []; },
            to: 'yk_time',
        });
        const cfg = TASK_HUBS[hub];
        if (cfg && !(cfg.doors || []).includes('yk_time')) cfg.doors = [...(cfg.doors || []), 'yk_time'];
    }
}
