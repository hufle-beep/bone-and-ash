/**
 * v0.11.181 (owner picks SP1, KG1, D1; group e's CM, push 1; texts by Fable, rule 10; D1's three cuts and T1's one Claude's; RV1: Fable's revision of M2, M3, M4 and L3, Claude's L1 and L2): the mother's
 * kitchen and the communal pot (kitchen.js). KT_UP: the paragraph the first time a stage is reached this Coil (1 helps, 2 shares,
 * 3 takes over); KT_DAY: a short line by stage on the later days; KT_RETURN: the return's day (Day 20) by stage; KT_LABEL: the
 * card's label by stage (0 is HT_LABEL.mother). POT_LINE: the pot's result from the village's 90, by the place's day (the
 * prologue's two slots, the Fallout's three; the code adds ": +25 satiety."). POT_COOK: the cook-with-the-women scene, once a
 * Coil in each act (`result` gets ": +25 satiety." too).
 */
export const KT_LABEL = {
    1: "Help Mei Lin's mother in her kitchen.",
    2: "Share the kitchen with Mei Lin's mother.",
    3: "Take over Mei Lin's mother's kitchen.",
};
export const KT_UP = {
    1: "The cooking comes after. You are given a knife and the ginger, and a look that covers both. You cut it fine. She holds a slice up against the doorway, finds it thin, and says nothing, which in this house is an acquittal. \"You have cooked,\" she says. \"I feed people,\" you say. \"It's a habit.\" \"It is a duty,\" she says, correcting the word, and passes you the beans.",
    2: "Then the hearth, where she has left half the fire unoccupied and does not explain it. You take the half. She does the millet; you do the beans, with ginger and a little dried fish fried in pork fat, which she watches as one watches a pot about to boil over. She tastes from your spoon. \"It is not how it is done,\" she says. She tastes once more, to be certain it is still wrong, and moves her pot over to make room.",
    3: "Afterwards she sets the stool where it commands the whole hearth, and sits on it. Nothing is announced. You gather that the knife, the pot and the fire are yours, and the jurisdiction is hers. You make millet dumplings with crisped pork belly on top: dödölle, minus the potato, the sour cream and the planet. \"Less salt,\" she says. You have not salted it yet. You add what you intended. She eats two bowls in silence, to be thorough.",
};
export const KT_DAY = {
    1: [
        "In the kitchen you are trusted with the pot, to be scoured with sand. She runs a thumb round the inside, studies the thumb, and hangs the pot up herself, on the proper hook.",
        "You keep her fire while she cooks. She corrects it twice. She begins a third correction, considers the flame, and withdraws it.",
        "She holds out the spoon for you to taste the broth; not for an opinion, for an audience. You say it wants nothing. \"It does not,\" she agrees.",
    ],
    2: [
        "At the hearth you work shoulder to shoulder and do not touch. Her pot, your pan, and the salt between them, which each of you reaches for only when the other has finished with it.",
        "She asks what you put in the beans. You tell her. She repeats it back like a charge sheet, omitting nothing, and then puts dried fish in her own pot, having thought of it herself.",
        "You knead dough at one end of her table; she shells beans at the other and watches your hands. \"Your mother taught you,\" she says. It is not a question, and it counts for you.",
    ],
    3: [
        "A neighbour comes for salt and finds you at the pot and her on the stool. \"He feeds people,\" she says. \"It cannot be helped.\" The neighbour leaves with the salt and the news.",
        "Eggs poached in stewed greens and ginger: shakshuka with everything removed that made it shakshuka. She asks what it is called. \"Eggs,\" you say. She approves of the brevity.",
        "You cook; she eats, upright, both hands on the bowl, and delivers her finding. \"The household has eaten worse.\" From her, this is the top of the scale.",
    ],
};
export const KT_RETURN = {
    1: "You eat it. Then you wash the bowl, and hers, and the pot, since nobody stops you; she stands by with a cloth and dries each as you hand it over. The Elder is not mentioned. The bowls are stacked for a household that intends to need them the day after tomorrow.",
    2: "You eat half and look at the hearth. She follows the look, and moves aside by the width of one pot. You start the beans; she starts the millet. Neither of you mentions the Elder. Two people are cooking in this kitchen, and that is the whole of her answer to him.",
    3: "You eat it. Then you take the pot off its hook, and she lets you, and sits. You make her the same bowl back, your way: the greens wilted in pork fat, the egg set on top with the yolk still loose. She eats all of it. \"The egg is underdone,\" she says, and holds out the bowl for another.",
};
export const POT_LINE = {
    ashfall: [
        "Barley and bean stew. The woman with the ladle has dropped \"honoured guest\" and says \"sit\" instead, and fills the bowl to the brim, which says the rest",
        "Bean stew under the red banners, served in your turn between two hunters, and nobody at the pot looks up to see who it is",
    ],
    fo: [
        "Barley and beans, and the ladle goes to the bottom of the pot for you, where the pork is, and the woman holding it denies it with her whole face",
        "Bean and barley stew, in the bowl with the chipped rim that is kept for you, on a place at the bench the builders close up only when you leave",
        "Stew, and a second ladle you did not ask for. \"You work,\" the woman says, in the voice kept for funerals, and stands there until the bowl is empty",
    ],
};
export const POT_COOK = {
    ashfall: {
        label: "Join the women at the village pot.",
        text: "The women at the pot make room for you by not closing ranks, which here is an invitation. There are six of them, the barley, the beans, and a basket of grey-capped mushrooms set well apart, to be burned. \"Corpse-ears,\" says the eldest. \"My grandmother's sister ate one.\" The sentence is evidently complete.\n\nYou turn one over. Pale gills that bleed a white milk where your thumbnail nicks them, and a peppery smell. You have a doctorate in exactly this. It has mostly been asked to cure people. It would rather feed them. \"Boiled once, the water thrown out, then fried,\" you say. \"The poison leaves with the water. Raw, she was right. Your great-aunt skipped a step.\"\n\nNobody answers. You boil them, throw the broth on the ground where they can watch it go, and fry them in pork fat with salt. You eat a spoonful yourself and stand there, alive, for as long as it takes. The eldest counts under her breath. Then she holds out her bowl, at arm's length, and sends a girl for the second basket.",
        go: "Stay alive. Have a bowl.",
        result: "Barley, beans and corpse-ears, renamed on the spot by the eldest \"the stranger's mushroom\", though you told her the real name twice",
    },
    fo: {
        label: "Help the women feed the builders.",
        text: "The pot on the square has a palisade's worth of builders and a line of hunters to answer to, and the women at it are stretching the barley with water, grimly, as one stretches a truth. You ask for the flour instead. It is handed over slowly, by a woman who knows how much is left.\n\nFlour, two eggs, salt, water. You knead it on a scrubbed board until it gives in, roll it out with a pestle, fold it, and cut it into strips with a bone knife. \"Thread,\" says the woman beside you. \"Food,\" you say. \"Hung on a line, it dries and keeps through a winter, and it cooks before a builder has finished complaining.\" She does not agree that builders complain.\n\nThey take it up at once: six women kneading in a row, each one's dough corrected by her neighbour. The noodles go into the broth with dried fish and greens. Mei Lin's mother, at the end of the row, cuts hers finer than yours, and lets you see it.",
        go: "Take a bowl before the builders do.",
        result: "Noodles in fish broth, eaten standing among the builders, who hold out their bowls a second time and offer no opinion",
    },
};
/* v0.11.218 (owner pick CK1, TX3; texts by Fable, rule 10): the cook with the women's repeat scenes, long calendar only: from a
 * Coil's second cook, one of these three per act (kitchen.js cookVariant: never the same twice running). Same fields as POT_COOK. */
export const POT_AGAIN = {
    ashfall: [
        {
            label: "Take your place at the village pot.",
            text: `The women have left a gap at the pot the width of one tall foreigner, and a knife in it. The barley is on. A girl comes back from the stream bank with an apron full of wild garlic, and you take all of it before anyone can boil it grey.

You pound the leaves in the mortar with salt and a spoon of pork fat until they turn into a green paste that can be smelled across the square. "It is not cooked," says the woman at your elbow. "No." "You will cook it." "The barley will. Stir it in off the fire." She stirs it in on the fire, to be safe. It survives. She tastes it, and moves the mortar to her side of the pot.`,
            go: "Eat it green.",
            result: "Barley stirred green with pounded wild garlic, which the woman with the mortar has decided is medicine, and serves accordingly",
        },
        {
            label: "See to the greens at the village pot.",
            text: `The greens are yours. Nobody said so; the basket is simply put down at your place and the women get on with the beans. You cook the leaves down with wild garlic, thicken them with a fistful of ground millet, and salt them until they taste like a dish instead of a duty.

The eggs go onto a hot flat stone, as many as the hens gave, which is fewer than there are bowls. You set a girl to watch them. "When the white is set, lift them. Do not turn them." She nods as one receiving a border post. The eldest inspects a yolk, finds it soft, and looks at you. "It is meant to run," you say. "Into the greens." She informs you that in her house eggs are finished. The girl does not turn a single one.`,
            go: "Break the yolk. Eat.",
            result: "Greens cooked thick with millet, a soft egg on top where the eggs reached, and one cooked hard, by order, for the eldest",
        },
        {
            label: "Work your shift at the village pot.",
            text: `The eldest hands you the ginger and the small knife and then does not go away. You peel it as thin as the knife allows. She picks a peeling off the board, holds it up, can see her fingers through it, and drops it in the pot anyway, because here peel is food.

The beans are on with the dried fish. You beat ground millet with an egg and salt into a stiff batter and pinch it off into the broth, a thumbnail at a time, where the pieces sink, think it over, and come up as dumplings. "They rise when they are done," you tell the women. They watch the pot until every last one has reported. The eldest counts the egg against you, then counts the bowls it fed, and goes to see about the salt.`,
            go: "Fish one out. Then a bowlful.",
            result: "Bean soup with dried fish, ginger and pinched millet dumplings, the stranger's mushroom fried on top by a woman who did not ask you how",
        },
    ],
    fo: [
        {
            label: "Take a shift at the builders' pot.",
            text: `The flour is lower in the sack than anyone says aloud. You mix it stiff with water and salt, flatten it by hand, and slap the rounds onto the hot stones at the fire's edge, where they blister and char at the rim. Each one comes off to be rubbed with a cut bulb of wild garlic and a little pork fat. The women take over the stones without discussion and leave you the dough.

A builder arrives ahead of the others, with a reason. "The binding cord," he begins. The woman at the stones tells him the food will be ready when it is ready, and that the cord is at the palisade, where he should be. You hand him a flatbread behind her back. She saw. She declares the next one burnt, and gives it to you.`,
            go: "Eat the burnt one.",
            result: "Flatbread off the hot stones, rubbed with wild garlic and pork fat, the burnt one yours by ruling of the woman at the fire",
        },
        {
            label: "Fold dumplings for the builders' pot.",
            text: `A fist of flour makes noodles for one builder or dumpling skins for three, so the board is yours and the filling is whatever the square can spare: greens, wild garlic, the scrapings of the pork fat, an egg to hold it together. You roll the skins thin enough to show the grain of the board, and the row of women fills and seals them.

Mei Lin's mother takes one of yours off the board and examines the pleats. There are five. She unpicks it and closes it with nine, without looking down, and sets it next to yours as a magistrate sets down a ruling. "It will hold in the water," she says. Yours also hold. You do not raise it. You make the next one with nine, and she moves on down the row.`,
            go: "Count your pleats. Eat.",
            result: "Dumplings of greens and wild garlic in fish broth, nine pleats each, yours included, as Mei Lin's mother has verified",
        },
        {
            label: "Feed the builders with the women.",
            text: `There is a basket of flatbread gone hard enough to build with, and the women mean to soak it into the barley. You ask for it, and for the eggs. Beaten egg, salt, the bread drowned in it until it stops resisting, then fried in pork fat on the flat pan until both sides are gold. Where you come from this wants pepper. Here it wants no explaining: it was bread, and it is more bread.

A boy is given the first stack to carry to the palisade. He is back for the second too soon, with grease on his chin and a grave account of how many he delivered. The woman at the pan hears him out, counts the stack she gives him, and tells him the number. He carries it off in both hands, looking straight ahead.`,
            go: "Take the end piece.",
            result: "Hard flatbread fried in egg and pork fat, eaten off the edge of the pan, while a boy's count of the stack is checked at both ends",
        },
    ],
};
