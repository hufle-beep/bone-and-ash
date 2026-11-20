# Bone and Ash, v0.11.239 drafts, run S9 (owner pick P12-A: FS6, the Fallout supper six a story day; read as the social supper)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p12/supper-texts.txt` (the supper's texts as they stand, as template code: the second `seqText` list, `fo_supper:9`, is yours; `yaHere(g) ? … : …` gives the text with Ya at the table and the line without her; `${supperPot(g)}` is a clause about the mother's pot), `/tmp/p12/fo-packet.txt` (the context packet: when the supper shows, what leads in, its choices and the screen after) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it); her mother tiny, fierce, formal, grave about propriety, the ancestors and the Sect, widowed; she does not joke. Ya: 27, a feral huntress raised wild, more unfit for civilised society than James; tall, barefoot, a necklace of teeth, a bone-tipped spear, a red scar under one eye; she jokes and flirts aggressively, is easily offended, picks fights, can't read; she calls James "scholar". Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
`fo_supper`, the Fallout's supper at Mei Lin's mother's house in Ashfall, where James lodges. The Fallout is the stretch after the village defied the Crimson Lotus Sect: Outer Elder Shen Qiu is coming; the village builds a palisade and drills. On this second story day Ya has come out of the wilds and attached herself to the household's table; the mother feeds her because a guest is fed, and endures it. The text shows at 19:00 or a little after; with Ya at the table the choices under it are '"Ya. Manners." (You're aware of the irony.)' and 'Laugh. Out loud. Somebody at this table has to.', so each Ya text should end on something Ya does that James might answer either way. The next screen is the night. No clock times, no "late", "midnight", "dawn".

On the long calendar this story day is a WEEK of seven suppers. It has three texts now, shown on its nights 1–3. You write its **texts 4, 5 and 6**, shown on nights 4–6. They are not a story: each stands alone, in any order after the old three. They may also show in the following week, so nothing in them may depend on the week: **not** the plan for the Blackroot, Ya's price, leaving, the arson, the Elder's arrival.

Each text comes in two versions:
- **With Ya** (most players): 110–160 words, three or four paragraphs (mark breaks with ` ¶ `), the old texts' shape: how Ya arrives at or takes the table, how the mother keeps her forms against it, and a line from Ya that lands on the table like the hare did. Mei Lin is amused, embarrassed, or both. Yuki may appear in a sentence that names no form (no "small", "paw", "ears", "tail", "great", "woman"), or not at all.
- **Without Ya** (she has not been met): ONE line, 8–16 words, the household's quiet supper under the threat, like "Supper. Quiet. The mother watches the north window the whole time."

Rules:
- **The fold:** a text read before folds to its FIRST PARAGRAPH with a "Read it all again" link. The first paragraph must stand alone as a reminder of that supper and not open with "Ya comes to supper", "Ya is at the table", "Supper" or "Tonight" (the line without Ya may open with "Supper.").
- **No day counts** ("the fourth supper", "a week now") and no promises about a day.
- Don't reuse the old texts' moments: the wrong side / the host's side (one mention is fine, not the point), eating with her fingers, the wolf at a kill, the tribulation face, the burp, the loft question, the dropped chopsticks, the hare on the table, "What?", "small, but she hits", a fight after, coming in by the window, the spear across her knees, "Do they answer?", "Feed the scholar"; the north window, the turned stool, the barred door; the ladle and the salted pot (don't use `supperPot`).
- Avoid the loft (it may have burned on another path); no romance beyond a joke of Ya's (and nothing explicit: the mother is at the table); avoid the canon card's tics and any phrase the given texts use; don't reuse a five-word run between your drafts. No song lyrics, no real names.

## Output
Write `/tmp/p12/drafts-s9.txt`: one line per key, `key | text`, no line breaks inside a draft:
```
fo_supper:9:4 | the text with Ya, paragraphs split by ¶
fo_supper:9:4:away | the line without Ya
```
and the same for `:5` and `:6`. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold.
