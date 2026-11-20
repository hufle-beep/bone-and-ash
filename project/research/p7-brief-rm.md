# Bone and Ash, v0.11.234 drafts, run RM (owner pick P7-A: RN, the roof's later nights a cycle of six; ML, the firesides' meal when nobody cooked)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p7/roof-texts.txt` (the roof's texts as they stand), `/tmp/p7/packet-roof.txt` (the roof's context packet: when it shows, the choice), `/tmp/p7/fs-texts.txt` (the firesides' meal texts as they stand), `/tmp/p7/packet-fs.txt` (the fireside's packet) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, and gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it); Ya blunt, a wolf among people (raised by wolves and a hunter; jokes, flirts hard, picks fights, plain words, few of them). Second person ("you" = James, 40, a mycologist from another world). British spelling.

## 1. RN: `supper_roof`, the later nights (the prologue)
Ashfall before the tribute. James lodges in the herb loft of Mei Lin's mother's house; after supper he and Mei Lin sit on the roof thatch. The **later nights** are the second and third weeks before the tribute (the collectors come for grass, millet and children with roots; James will hide as a mute cousin from the hill farms). They are easier together now; she brings plum wine; she is afraid for the village and won't show it. His forearm's omnitool sometimes plays recorded music, quietly. Yuki (his root-kin) is nearly always the small white cat here; leaving her out is fine (if you name her, give all three forms as separate keys: the cat on his shoulder, bond-speech in italics; the great root-kin, tiger-sized, bond-speech in italics; the woman with cat ears, speaks aloud).

On the long calendar each village day is a WEEK, so the Sociable player climbs onto the roof on up to 12 later nights, and the three later texts repeat four times each. You write three more, so the cycle is six.

Write (keys):
- `supper_roof:2:4`, `supper_roof:2:5`, `supper_roof:2:6`: the text (110–125 words each). A new small moment on the roof: something she asks, does, notices, teases, admits, or teaches him; the tribute's shadow may be there, lightly. Not a retelling of the three later texts (the plum wine and the tribute's numbers, the slow song and her shoulder; what his people do before a thing they cannot stop; the bow lesson, the mute cousin) or of the first week's (the wrong stars, the singing trees, the music in his arm, what Ashfall has decided he is).
- `supper_roof:2:4:r`, `:2:5:r`, `:2:6:r`: each text's result after the one choice, `Stay until the cold drives you in.` (35–55 words; shown after the choice; it ends with him going up to the herb loft to sleep; no gains named).

Rules:
- **No day counts** ("second night", "the third evening"); a later text can show on any of 12 nights in any order after the first three. "Tonight" is fine (it is always night). No promises about a fixed day ("the collectors come in four days").
- **The fold:** a text read before folds to its FIRST SENTENCE with a "Read it all again" link. The first sentence must stand alone as a reminder of the moment, and every text has at least two sentences.
- **No romance beyond the old texts' level** (a touch, a look, fingers in his hair, a shoulder). Don't assume any romance scene has happened.
- She cannot be seen by the lane being improper: she laughs into her sleeve, keeps her voice down.

## 2. ML: the firesides' meal when nobody cooked (Act 1, the Blackroot)
Act 1: James, Mei Lin and Ya walk through the Blackroot to the Old Tree. At the evening camp the player may pick "Cook and eat." (James cooks from his hammerspace; the party eats it). On days he did not (no food, or he skipped it), the fireside texts still talk about **his** stew, pot and cooking. Write a version of each place below for a day he did NOT cook: the party ate what they carried or caught (Ya's meat, rare or raw on a stick; Mei Lin's dry travel rations, rice cakes, pickles, which she rations with Ashfall seriousness; whatever fits). Each version replaces only its own words, so the rest of the text around it must still read straight on. Keep each version close to the length of what it replaces.

Write (keys; the words each one replaces are quoted):
- `ml:ah2:open` replaces AH 2's `open` (both sentences): "The ash burns blue up here, and it lends your stew a colour that nobody mentions. The dead tree has the whole north of the sky, so everyone has chosen to sit facing the pot." The close that follows stays: Ya: "Blue. I have eaten blue." / Mei Lin: "It does no harm. I tested it twice." / Ya: "Who spoke of harm? Scholar. Can you do red?" So whatever they ate must have turned blue in that fire.
- `ml:ah2:none` replaces only "you the pot, which has never been so clean." at the end of AH 2's `none` (the list: "Everyone has found a thing to tend: Mei Lin her herbs, Ya the edge of the spear, Yuki …, " + your words).
- `ml:ah3:mei` replaces "since the stew" in AH 3's `mei` ("Mei Lin's hand has been inside your sleeve since the stew, two fingers on your wrist…"): a short phrase.
- `ml:ah3:none` replaces the last sentence of AH 3's `none`: "You ladle out what is left in fair shares and are thanked by nobody, which among friends is thanks."
- `ml:rr2:close` replaces the last paragraph of Root Road text 2 (all three forms share it): "\"He stirs it as if it could hear him,\" Ya tells the fire, as a further charge. Mei Lin, for once, lets her have the last word." Note: in this text Mei Lin defends "the preparation" (wood sorrel and mountain pepper she picked) against Ya; on a no-cook day the preparation went into something else (Mei Lin's own pot, Ya's meat). If the text's opening "Supper is over, and Ya has opened proceedings against the leaves in it." still reads true, keep it; if your close needs one more word changed earlier, say so in the notes, don't rewrite it.
- `ml:rr3:end` replaces the last two sentences of Root Road text 3: "Both look round at you, since you cooked it and are therefore to blame. ¶ You pass over another. There are always more; you have learned to cook for an argument." (The chopsticks lesson; Ya spears a fried mushroom; it drops into the fire.) On a no-cook day the mushroom is someone else's (or his, but not cooked by him).

## Don't reuse
"Mine first", the liver, the garlic and the second helping, the toasted millet, "could not boil water", seconds, "permitted near food", ginger in everything, the dyer's boy, "you hum when you cook", "the only one here who understands rank", "hard enough to", "smells of mint", "has ruled", "like a snare". Avoid the canon card's tics and any phrase the given texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.

## Output
Write `/tmp/p7/drafts-rm.txt`: one draft per line, `key | text`, paragraphs separated by ` ¶ ` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB).
