# Bone and Ash, v0.11.235 drafts, run S (owner pick P8-A: EVs, the supper's two sequences a cycle of six)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p8/supper-texts.txt` (the supper's texts as they stand, as template code), `/tmp/p8/packet-ev.txt` (the context packet: when the supper shows, its choices and what they lead to; the `supper` part only) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, and gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it); her mother tiny, fierce, formal, grave about propriety and the Sect, widowed (her husband went up the road with the Sect's collectors when Mei Lin was six; an empty box was buried); she does not joke. Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
Ashfall before the tribute (the collectors come for grass, millet and children with spirit roots). James lodges in the herb loft of Mei Lin's mother's house and eats supper there every evening: millet, greens, a little smoked fish. After the supper text the player picks one of: climb onto the roof with Mei Lin; help her mother with the dishes and listen; go up to the loft early. So each text ends at or just after the meal, with everyone still at the table or clearing; it must not send him to bed or onto the roof.

Yuki (his root-kin) has three forms: the small white cat (bond-speech in italics, heard only by James), the great root-kin, tiger-sized (bond-speech in italics), the woman with cat ears and tail (speaks aloud). The mother treats Yuki as a spirit-beast owed honour. **Leaving Yuki out is fine.** If you use her, put her in ONE sentence, mark its place in the text with `{yuki}`, and give that sentence in three forms as separate keys (`…:y:cat`, `…:y:great`, `…:y:human`).

On the long calendar each village day is a WEEK, so supper shows up to seven evenings a week and each sequence's three texts repeat. You write three more for each sequence, so each is a cycle of six. Your texts always come after the three old ones of the same sequence, in order (4, 5, 6), and then the cycle starts again from text 1.

Write (keys):
- `supper:4:4`, `supper:4:5`, `supper:4:6`: the first week's later suppers (after: his first supper there; helping with the greens, the garlic, the belly piece for Yuki; the two sacks for the post and the Sect's measure). The house is still taking his measure; the mother is correct with him, not yet warm.
- `supper:5:4`, `supper:5:5`, `supper:5:6`: the second and third weeks' later suppers (after: the father's story and the empty box; the mother's one question a meal, what a man does who studies mushrooms, the dyer's wife's onion; the night the mother let him cook, toasted millet, "my husband could not boil water"). The house has half taken him in; the tribute is closer, and nobody says so at table.

Each 110–125 words. A new small moment at the table: something the mother asks, rules on, admits, or teaches; something Mei Lin teases or gets told off for; a neighbour's matter brought to the table; a household custom he gets wrong or right. Not a retelling of the old texts' moments (above), and **not cooking** (he does not cook in your texts; the cooking arc is told).

Rules:
- **No day counts** ("second supper", "the third evening") and no promises about a fixed day ("the collectors come in four days"). "Tonight" is fine.
- **The fold:** a text read before folds to its FIRST SENTENCE with a "Read it all again" link. The first sentence must stand alone as a reminder of the moment, and every text has at least two sentences.
- No romance beyond the old texts' level (a look, a teasing word). Mei Lin cannot be improper in front of her mother.
- Don't overlap the roof's evenings (plum wine and the tribute's numbers; a slow song and her shoulder; what his people do before a thing they cannot stop; the bow lesson and the mute cousin; a bet on the widow's and the dyer's lamps; the herb loft by smell; her mother's three rules; the wrong stars; the singing trees; the music in his arm; what Ashfall has decided he is) or the dishes (the village's debts to the Sect, which families the road has cost a child, which collectors can be shamed).

## Don't reuse
"Mine first", the liver, the garlic and the second helping, the toasted millet, "could not boil water", seconds, "permitted near food", ginger in everything, the dyer's boy, "you hum when you cook", "the only one here who understands rank", "as one authority to another", "a fox", "magistrate", "petition", "in correct form", "hard enough to", "smells of mint", "has ruled", "like a snare", "verdict", "closes like a door". Avoid the canon card's tics and any phrase the given texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.

## Output
Write `/tmp/p8/drafts-s.txt`: one draft per line, `key | text`, paragraphs separated by ` ¶ ` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB).
