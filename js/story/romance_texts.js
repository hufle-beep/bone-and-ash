/**
 * v0.11.249 (owner pick P19-A): romance's texts (Fable's runs TB and RL, rule 10; Claude's cuts: six five-word runs shared with other
 * texts reworded, "left eye" → "eye"; MC-A's run MC (the owner 20:03): `mei30:camp` its redraft without the glasses, three runs reworded; RL's evening2 lines 1 and 3 Fable's redrafts, without James's glasses and the hairpin's history). RV-A (the owner 20:37; the cold reviews): `ya72:tree` and RL's first evening2 line Fable's run RV (T H2, M1); "never lived" / "never had" → forgotten (T L4); AL's result without the laugh the screen above has (T L2).
 * v0.11.250 (owner pick P20-A; Fable's runs DP, EC, FR, RN; Claude's cuts: four five-word runs reworded, "awake" out of FR's Yuki line):
 * RV-A (the owner 22:52; Fable's run RV, Claude's cut "not to have seen it" → "that she saw nothing"): DP's hand, spring lines, the echoes,
 * FR's Yuki line, `mei30`'s phrase and `ya45:camp`'s canon nod redrafted (the cold review's T M2 and lows).
 * RN the five beats' "as X would" and paperwork phrases reworded; DP, EC, FR below.
 * romance.js reads them. TB: tier key (`mei30`, `mei72`, `ya45:camp` …) → its closing paragraph; RL: carrier → its first, second and
 * third-and-on lines; AL: the eve's label and its result.
 */
export const TB_TEXT = {
    "mei30": "Under the table, Mei Lin's foot comes to rest on top of yours and stays there. Above the table she is a dutiful daughter, asking her mother whether the well rope will see out the month. You keep your face in order, which is the one skill your education did give you, and leave your foot where it is. The rope will do, her mother rules. Mei Lin presses down once, lightly, for no reason she could give her mother, and goes on being a credit to the house.",
    "mei72": "Mei Lin is humming, and the tune belongs to you. It gets out of your forearm when you are not minding it, quietly, and she has it nearly right, down to where the drummer loses patience. She does not seem to know she is doing it. Her mother knows. She hears out a whole verse with her hands folded, looks at her daughter, and then at you, for about the time it takes to price a goat. \"That is not a song of this lane,\" she says. \"See that you learn how it ends.\" Mei Lin stops, colours, and starts over, louder.",
    "ya45:camp": "Ya picks up her sleeping hide, spear and all, puts it down hard against your bedroll, and sits on it to look at you. \"I have thought about it, scholar,\" she says, loud enough for the whole camp. \"I want you. I am telling you so that you are not surprised.\" You thank her for the warning. Over the flames Mei Lin observes that most people would put such a thing in a letter. Ya, who has never read one, says letters are for people who cannot find the man and quiet is for people who are not sure what they want, and goes on looking.",
    "ya72:camp": "Ya wets her thumb, rubs it in the cold char by the fire, and draws a line under your eye, where her own scar runs. She is not flirting; she frowns over it with a craftsman's care, and leans away to judge the work. \"There. Now what is out there knows whose you are.\" You ask what that makes you. \"Mine,\" she says. \"Not to eat. To keep. It is different, scholar. Ask the herb girl, she has the words.\" Mei Lin tells you it is crooked. Nobody offers to wipe it off, and you leave it there.",
    "ya45:night": "Ya, over on the shrine's ridge, sees you looking and does not duck. She stands up instead, tall on the skyline, points the spear at your window, then lays her free hand flat on her own chest and waits to be understood. It is not a subtle language. You raise one hand, which commits you to nothing, and she sits down satisfied, a hunter who now knows where the deer beds.",
    "ya72:night": "While you look, the figure over the lane turns its back on your window and settles facing the road, spear laid over its knees. It takes you a little while to read it. Ya was watching you; now she is watching for you, the guard a huntress keeps over her own fire and her own kin. Nobody asked you, and you have been moved from quarry to household. The loft feels smaller, and better guarded.",
    "mei30:camp": "Mei Lin takes the waterskin out of your hand before you have stoppered it and drinks from it as it is. In Ashfall a girl wipes the neck with her sleeve before she drinks after a man, and makes sure she is seen doing it; Mei Lin explains this to you afterwards, pleasantly, as a point of local custom, with the skin not yet lowered. Her eyes stay on yours while she says it. Ya snorts. Mei Lin hands the skin back, neck towards you, and waits to see what a man of learning does with it. You drink. It seemed the scholarly course.",
    "mei72:camp": "There is a tear in your coat cuff, and Mei Lin is mending it with you still inside the coat, which leaves your hand in her lap and nothing for you to do about it. She sews slowly, for a woman who is quick with a needle. Ya watches from the other side of the fire, chin on her spear shaft. \"You make that seam long, herb girl.\" Mei Lin says some work should not be hurried, and does not look up. Ya grunts, scowls at the flames, and then holds out the frayed cord of her tooth necklace. \"Mine after. Not so slow.\" Mei Lin takes it.",
    "ya72:tree": "Ya counts what belongs to her, aloud, a finger for each: the spear, the knife, the teeth at her throat, the fire, and then, with a look at you, the scholar. She does it as other people check that a door is barred. You ask where in the list you come. She thinks about it honestly, which is worse. \"After the spear. Before the fire,\" she says. \"A fire I can make again.\" The hall is very large and quite dark, and you find you mind it less than you did."
};
export const RL_TEXT = {
    "evening2": [
        "She has forgotten the Coil on which she told you her thumb does this only when she is more frightened than she lets on. It is doing it now. You keep your hand still.",
        "She had a name for you, on a Coil she has forgotten, and used it across this table whenever you were being impossible. Nobody in this house has thought of it. You are careful not to supply it.",
        "You know which leg of her table is short, because another Mei Lin showed you the folded leaf wedged under it, on an evening this one has forgotten. The leaf is there. You keep your elbows off that corner and don't look down."
    ],
    "talk_mei": [
        "On another Coil a Mei Lin walked with her hand in your coat pocket, for warmth, she said, in a forest that was not cold. This one has not found the pocket. You leave it empty anyway.",
        "There was a Mei Lin who knew you snore, and told the whole camp so, with evidence. The Coil took her and the evidence both. This one still thinks well of you on that point, and you let her.",
        "You know what she said into your sleeve when she believed you were asleep, on a Coil she has no part in now. She would deny every word, and she would be right. You carry it for the two of you; it weighs very little, and you notice it at every step."
    ]
};
export const AL_TEXT = {
    "label": "Tonight, sleep. Say goodnight to them both, and mean it.",
    "result": "You wish them both goodnight, evenly, and go in to sleep by yourself. Ya tells the roof that a scholar is a waste of a warm night and that wolves have better manners; Mei Lin looks, if anything, let off. They are still up there arguing about you, quite amiably, when your eyes close."
};
/** v0.11.250 (P20-A, DP): `rt_evening`'s line for an earlier choice it ignores (romance.js `dpKey`, the first that applies). */
export const DP_TEXT = {
    "hand": "Ya takes the gristle out of your bowl with her fingers and eats it, not asking and not looking up. You turn the bowl so the rest is on her side. Mei Lin's mother watches the whole exchange and decides, visibly, that she saw nothing.",
    "bond": "Mei Lin banks the stove before her mother can ask, and catches your eye over the coals. She has sat up over worse embers than these, in the same company. She keeps quiet about it, which for her is conspicuous.",
    "spring_in": "Mei Lin's mother asks whether the Blackroot offered anywhere decent to wash. \"A hot spring,\" says Ya, in her careful supper voice, and then, because she was asked: \"Room for two.\" The old woman's ladle stops over the pot, and goes on. Mei Lin studies her stew, and yours turns out to need your whole attention as well.",
    "spring_watch": "Ya has leaned her spear in the corner behind your seat, not her own. It has been left in your reach before, at a hot spring, where you stood guard over the bathing with your back turned and steam on your neck. Mei Lin notes where it stands and says nothing, approvingly.",
    "roof": "Something shifts in the thatch overhead, a bird or the wind. Mei Lin glances up, then across at you, and returns to her supper a shade too gravely. You know exactly how much weight that roof will hold, and where."
};
/** v0.11.250 (P20-A, EC): the echo at the first meeting, once a save, on Coil 3 or later when met on an earlier Coil. */
export const EC_TEXT = {
    "mei_lin": "To Mei Lin you are a stranger out of the trees, unlabelled and possibly a demon. You know which thumb will go to her hairpin's red tassel while she decides whether to believe you. It is the left. It goes there now, and you look politely at the grass.",
    "ya_meets": "To Ya you are new: a tall thing that smells of nothing. Nothing about her is new to you. You know she stands with her weight on the back foot and the spear's butt against her heel, and that the tooth nearest her throat is the long one, with two small ones either side. You know which hand she eats with and which she keeps free. You keep the list to yourself."
};
/** v0.11.250 (P20-A, FR): the night's person read right: `rt_taken` after Ya's night, `a1_end` (taken) after Yuki's own. */
export const FR_TEXT = {
    "taken_ya": "Ya strides out onto the Sect's road and plants her spear in it, in front of every crimson robe. \"Keep him fed, red men,\" she says. \"I track what's mine. Scholar, don't get comfortable.\"",
    "end_yuki": "You do not turn to search Ashfall for a face. The one person you would search for is not down there. She is on this road with you, close enough to touch, and has already counted the crimson robes."
};
