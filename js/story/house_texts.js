/**
 * v0.11.139 (owner pick MW1; texts by Fable, rule 10): Old Wen's and Mei Lin's mother's daily scenes (house_time.js).
 * HT_BODY: by person and slot (the place and the story's day there; `<slot>-burned` after the arson night, MR1's M4); HT_CLOSE: by
 * person and friendship (under 30, 30 and up), habits that can come back (MR1's L7). MR1 (L6, L7, L9, L11) and DX1 (X1, X2): Fable's rewordings.
 */
export const HT_LABEL = {
    "wen": "Take tea with Old Wen.",
    "mother": "Help Mei Lin's mother about the house."
};
export const HT_BODY = {
    "wen": {
        "ashfall:1": "Old Wen pours two cups without spilling a drop and without looking, which with one eye may be showing off. \"You hold the cup like a man holding a frog,\" he says. \"Three fingers. The collectors notice hands.\" You adjust. He considers the result at some length. \"Now you hold it like a man who has been told about the frog.\" It appears to be progress.",
        "ashfall:2": "Old Wen has moved his table to the doorway, where the tribute post and its red banners are in plain view. He pours as if they were not. \"I have sat through this eve eighty times and more,\" he says. \"The tea is the same each year. I see to that. A village should keep one thing the Sect does not weigh.\" You drink the unweighed tea. It tastes of hot water and resolve.",
        "fo_ashfall:1": "Outside, somebody is hammering, as somebody in Ashfall now always is. Old Wen pours as though it were rain. \"Shen Qiu,\" he says, and sets the name down with the pot. \"I have outlived three sect masters. I had not thought to be troubled by an Outer Elder.\" \"You might outlive him as well.\" The good eye comes round to you. \"That,\" he says, \"is why I am giving the stranger tea.\"",
        "fo_ashfall:2": "The tea is weaker today. Old Wen is stretching the leaf across the days that are left, and says so, as a man reports on a siege. He asks your age. \"Forty.\" He nods slowly. \"A sound age. The large mistakes are made, and the knees still serve.\" You think of the resonance lab and one reading. \"I made mine recently.\" \"Then it is fresh,\" says Old Wen, \"and you will remember it.\"",
        "fo_ashfall:3": "Old Wen fills your cup to the brim, which he has not done before. \"For a guest who stays, one pours seven parts,\" he says. \"For a man with a road before him, the cup is filled. A full cup is a debt. He must come back to be poured a proper one.\" You study the meniscus, which is holding by faith alone. \"And if I spill it?\" \"Then you were not ready to go.\"",
        "rt_ashfall:1": "Old Wen has the pot ready before you sit, as if the Blackroot had been an errand and you were back at the usual hour. The tea is strong today. He has stopped saving the leaf. \"Tomorrow, Shen Qiu,\" he says. \"Today, tea. At ninety one learns to take them in that order.\" You drink. He watches how you hold the cup and finds nothing to correct, which from Old Wen is a certificate."
    },
    "mother": {
        "ashfall:1": "Mei Lin's mother sets a basket of millet before you, and a bowl beside it. \"Stones,\" she says. A guest under her roof does not work; a man lodged in her herb loft, it seems, is another category. You pick stones. She inspects the bowl, takes out one grain you had condemned unjustly, and returns it to the basket. \"In this house,\" she says, \"nothing is thrown out that can still serve.\"",
        "ashfall:2": "Mei Lin's mother is scrubbing the doorstep, which was clean, because tomorrow the Sect walks past it. Up the street the red banners hang. \"They won't look at a doorstep,\" you say. \"I do not wash it for them.\" She wrings the cloth as if it had a neck. \"Lift your feet.\" You lift them. She washes where you were standing and then, after consideration, your boots.",
        "fo_ashfall:1": "Mei Lin's mother is salting greens in the yard, jar after jar, while the hammers go somewhere beyond the houses. You have been handed the stone weights. \"Thirteen days,\" she says. \"An Outer Elder may burn this village. He will not find it with empty jars.\" You press a weight down on the leaves. She lifts it, turns it over, and sets it down again in the same place, correctly.",
        "fo_ashfall:2": "Mei Lin's mother is reporting to the ancestors, and you have been stood beside her holding the incense, as evidence. The report is long and formal. You catch \"the stranger\", \"the white coat\", \"eats for two\", and a passage on your posture. \"Do they answer?\" you ask afterwards. \"They are family,\" she says. \"They do not need to.\" She takes the incense from you and straightens your collar, for their sake.",
        "fo_ashfall:3": "Mei Lin's mother is packing a bundle on the kitchen table: millet cakes, salt, dried fish, a twist of ginger, each knotted as if for a magistrate. \"The Blackroot does not feed its guests,\" she says. You explain that your people grow a folded pocket of space under the forearm, and that you need no bundle. She hears all of it. \"Then it will also hold a bundle,\" she says, and ties the last knot.",
        "rt_ashfall:1": "Mei Lin's mother sets a bowl in front of you unasked and stands over it. \"You went into the Blackroot, and my daughter came out of it walking,\" she says. \"I have been considering which of you to thank.\" \"And?\" \"I have thanked the ancestors. It avoids the question.\" Tomorrow an Outer Elder comes down the road. She adds an egg to the bowl, gravely, as one sets a seal on a document.",
        "ashfall:2-burned": "Mei Lin's mother is washing soot from the house wall, because tomorrow the Sect walks past it. Up the street the red banners hang; at her back the loft posts still smoke a little. \"I am sorry about the loft,\" you say. \"The loft was wood. Wood is replaced.\" She wrings out the cloth, and you do not ask whose neck it is. She hands you a second. \"The high part. It is nearest to where you were sleeping.\""
    }
};
export const HT_CLOSE = {
    "wen LOW": [
        "Old Wen turns his cup a quarter turn and says nothing further, which you are learning is how the audience ends.",
        "\"The stranger may come again,\" he says. It is a ruling, not an invitation, and he does not look up.",
        "He hears your thanks out, weighs it, and inclines his head by the width of a tea leaf.",
        "Old Wen sets the lid back on the pot with both hands. It makes a small sound, and the small sound is addressed to you." // v0.11.152 (owner pick RP1, HT; Fable's): a fourth (four visits an Act 1 Coil)
    ],
    "wen MID": [
        "When you rise, Old Wen rises too. At ninety this takes some time, and you have noticed that he does not spend it on the council.",
        "\"You listen,\" says Old Wen. \"It is rarer than cultivation.\" It is the whole of his praise, and he sees no reason to add to it or to vary it.",
        "He rinses your cup himself and puts it back in its place, on the shelf beside his own and apart from the guests'. Neither of you has ever mentioned it.",
        "He walks you as far as the doorpost and stands with one hand on it, considering the sky with his good eye. \"Tomorrow the water will be hot at the same hour,\" he says, to the sky." // v0.11.152 (owner pick RP1, HT; Fable's): a fourth (four visits an Act 1 Coil)
    ],
    "mother LOW": [
        "She inclines her head a finger's width, which closes the interview. You have been dismissed by universities with less finish.",
        "\"The stranger has been of use,\" she says, in the tone of a woman entering it in a ledger.",
        "She watches you go, to see that you manage it correctly.",
        "\"Mind the step,\" she says. It is the same step as on the way in. You understand that it has been asked to keep an eye on you." // v0.11.152 (owner pick RP1, HT; Fable's): a fourth (four visits an Act 1 Coil)
    ],
    "mother MID": [
        "To the ancestors and the street you are \"the stranger\". At her own door she says \"James,\" and frowns a little each time, as at a word that comes easier than is proper.",
        "Afterwards you find a seam of the lab coat put right, in small severe stitches. The coat has many seams, and she appears to be taking them in order. Nothing is said about it.",
        "\"You are too thin,\" she says. From her, you have learned, this is warmth, and it will have consequences at supper.",
        "She puts a millet cake wrapped in cloth into your hand as you go, and closes your fingers on it herself. \"For the road,\" she says. The road is the width of her yard." // v0.11.152 (owner pick RP1, HT; Fable's): a fourth (four visits an Act 1 Coil)
    ]
};
