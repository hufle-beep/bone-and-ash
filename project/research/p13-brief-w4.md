# Bone and Ash, v0.11.241 redraft, run W4 (owner picks P13-A with WK-d, D1: one village supper text redrafted)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p13/supper-texts.txt` (the village supper's texts as they stand, as template code), `/tmp/p13/cut.txt` (the other new drafts of this push, one per line, `key | text`; the week's five other suppers are the `supper:6:` lines), `/tmp/p13/supper-packet.txt` (the context packet) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it; no spirit root, tested at seven); her mother tiny, fierce, formal, grave about propriety, the ancestors and the Sect, widowed (her husband had a spirit root and went up the road with the collectors when Mei Lin was six); she does not joke. Second person ("you" = James, 40, a mycologist from another world, lodging in the herb loft). British spelling.

## The scene
`supper`, the village supper at Mei Lin's mother's house in Ashfall, in the prologue, **the third and last week before the tribute** (the Crimson Lotus Sect's collectors come up the road for the grain and any child with a spirit root; the red banners hang on the tribute post; they are due within the week). James has eaten at this table for two weeks. Mention nothing from the second week (a fire, a fight).

The text shows at 19:00 or a little after. The choices under it are "Climb out onto the roof with Mei Lin and watch the stars come out.", "Help her mother with the dishes, and listen." and "Go up to the loft early. Tomorrow will want everything you have."; the next screen is the roof or the night. No clock times, no "late", "midnight", "dawn", "tomorrow".

You write **one text, `supper:6:4`**, the week's fourth supper. The earlier draft was cut because it repeated a later scene: the mother barring James's white coat and laying out a too-short jacket. **Not:** the coat, clothes or dress, mourning, the dead husband's things. Also not the moments of the five other drafts in `cut.txt` (the bow, "the weather", the weaver's girl and the fish, the letter to James's mother, the tassel) or of the given texts. Small and domestic: a habit of the house, a question at the table, what is eaten and who serves whom, the tribute's nearness in what is done and pointedly not said. The mother keeps her forms as if they were a wall; Mei Lin makes light of it.

100–150 words, short paragraphs (mark breaks with ` ¶ `). Yuki either in a sentence that names no form (no "small", "paw", "ears", "tail", "great", "woman", "stove", "wall", "head of the table", "knee", "shoulder"), or in ONE passage of one or two sentences marked `{yuki}` and given in her three forms as separate keys: the small white cat (bond-speech in italics, `*like this*`, heard only by James), the great root-kin, tiger-sized (bond-speech in italics), the woman with cat ears and tail (speaks aloud, in quotes; the mother calls her "honoured one"). Or not at all.

Rules:
- **The fold:** a text read before folds to its FIRST PARAGRAPH with a "Read it all again" link. The first paragraph must carry no `{yuki}`, stand alone as a reminder of that supper, and not open with "Supper", "Tonight", "Another", "The mother", "Mei Lin's mother", "The house", "You" or a question.
- No day counts and no promises about a day.
- Avoid the loft; no romance beyond a look; avoid the canon card's tics and any phrase the given texts or `cut.txt` use; no five-word run shared with them. No song lyrics, no real names.

## Output
Write `/tmp/p13/drafts-w4.txt`: one line per key, `key | text`, no line breaks inside a draft:
```
supper:6:4 | first paragraph ¶ …, with {yuki} in it if used
supper:6:4:y:cat | (only if {yuki} is used)
supper:6:4:y:great |
supper:6:4:y:human |
```
Then, under a line `# notes`, at most a few short notes (under 1 KB). Reply with just "done" and the file path.
