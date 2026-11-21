# Bone and Ash, v0.11.243 drafts, run S1 (owner pick P15-B: SN7, the seventh nights; this run: the Fallout suppers)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p15/common.md` (tone and rules: they bind you), `/tmp/p15/fo-supper-texts.txt` (the supper's texts as they stand, as template code: the `fo_supper:8` `seqText` list = the old three then `FS8`; the `fo_supper:9` list = the old three then `FS9`; `FS10` is the next story day's six, given so you don't reuse it; `byForm(g, cat, great, human)` a passage by Yuki's form; `yaHere(g) ? … : …` the text with Ya and the line without her), `/tmp/p15/fo-packet-slim.txt` (when the supper shows and the screen after) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, the tic list). Do not read other repo files.

Ya: 27, a feral huntress raised wild, more unfit for civilised society than James; tall, barefoot, a necklace of teeth, a bone-tipped spear, a red scar under one eye; she jokes and flirts aggressively, is easily offended, picks fights, can't read; she calls James "scholar".

## The scene
`fo_supper`, the Fallout's supper at Mei Lin's mother's house in Ashfall, where James lodges. The Fallout is the stretch after the village defied the Crimson Lotus Sect: the Sect has named Outer Elder Shen Qiu to come; the village builds a palisade, drills, counts. At supper the mother, Mei Lin, James and Yuki eat; the mother says grace to the ancestors. The text shows at 19:00 or a little after; the next screen is the night.

On the long calendar each story day is a WEEK of seven suppers; each list has six texts, and the seventh supper shows text 1 again, folded. You write the **seventh text of each of two lists**. Each stands alone.

## 1. `fo_supper:8:7` (the first story day's week)
The first week after the Sect's answer: the wall going up and not up yet; the household tired, sore, keeping its forms; Mei Lin making light of it and not quite managing; James the stranger who knows things nobody asks him about. Small and domestic: what is eaten, who serves whom, a habit of the house, the day's work on hands and clothes, a question at the table. **Not:** Ya (not come yet), the Blackroot plan, leaving, anyone at the door or window, fighting.
Choices under it: "Help clear the table." and "Go up to the loft early."
Shape (as `FS8`): two paragraphs; the shared part 80–120 words, with ONE Yuki passage (one or two sentences, 20–40 words each form) marked `{yuki}` in the second paragraph. The first paragraph must not open with "Nobody", "Supper", "The talk", "Mei Lin's mother", "Mei Lin eats", "Hands", "Old Wen", "The coat", "Tonight" or "You".

## 2. `fo_supper:9:7` (the second story day's week)
Ya has come out of the wilds and attached herself to the household's table; the mother feeds her because a guest is fed, and endures it. With Ya at the table the choices under it are '"Ya. Manners." (You're aware of the irony.)' and 'Laugh. Out loud. Somebody at this table has to.', so the text must end on something Ya does or says that James might answer either way. **Not:** the Blackroot plan or the Old Tree (they come the next week, unknown yet), Ya's price, leaving, the Elder's arrival.
Two versions:
- **With Ya:** 110–160 words, three or four paragraphs: how Ya takes the table, how the mother keeps her forms against it, a line from Ya that lands on the table. Mei Lin amused, embarrassed, or both. Yuki may appear in a sentence that names no form, or not at all. The first paragraph must not open with "Ya comes to supper", "Ya is at the table", "Ya stops", "There is", "The spear", "Supper" or "Tonight".
- **Without Ya** (she has not been met; rare): ONE line, 8–16 words, the household's quiet supper under the threat, opening "Supper." (not the north window, the turned stool, the barred door).

## Don't reuse (besides everything in the file)
The grace at double length, the line about the stranger, spilled tea, salt pork, the splinter, counting posts, sawdust, resin, post holes, "enough to make them knock", the shutters, the north window, the barred door, the ladle and the salted pot; hands shown before the grace, "scholar" as Old Wen's word, the coat by the door; the wrong side / the host's side, eating with her fingers, the wolf at a kill, the tribulation face, the burp, the loft question, the dropped chopsticks, the hare, "What?", "small, but she hits", a fight after, the window, the spear across her knees, "Do they answer?", "Feed the scholar", the basin on the step, the necklace's teeth named one by one, the recited thanks and the returned bow; the travel cakes, sandals, the basket, the name strip, the instructions, travel customs.

## Output
Write `/tmp/p15/drafts-s1.txt`:
```
fo_supper:8:7 | first paragraph ¶ second paragraph with {yuki} in it
fo_supper:8:7:y:cat | the Yuki passage, cat
fo_supper:8:7:y:great | the Yuki passage, great root-kin
fo_supper:8:7:y:human | the Yuki passage, woman
fo_supper:9:7 | the text with Ya, paragraphs split by ¶
fo_supper:9:7:away | the line without Ya
```
then `# notes` as in common.md.
