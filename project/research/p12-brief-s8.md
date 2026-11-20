# Bone and Ash, v0.11.239 drafts, run S8 (owner pick P12-A: FS6, the Fallout supper six a story day; read as the social supper)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p12/supper-texts.txt` (the supper's texts as they stand, as template code: `byForm(g, cat, great, human)` gives a passage in Yuki's three forms; `dd(g) === 8` is the first story day, the rest is the second), `/tmp/p12/fo-packet.txt` (the context packet: when the supper shows, what leads in, its choices and the screen after) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it); her mother tiny, fierce, formal, grave about propriety, the ancestors and the Sect, widowed; she does not joke. Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
`fo_supper`, the Fallout's supper at Mei Lin's mother's house in Ashfall, where James lodges. The Fallout is the stretch after the village defied the Crimson Lotus Sect: the Sect has answered and named Outer Elder Shen Qiu to come to Ashfall; the village is building a palisade, drilling, counting. By day James works on the wall, the council, the drill, the clinic. At supper the mother, Mei Lin, James and Yuki eat; the mother says grace to the ancestors. The text shows at 19:00 or a little after; the choices under it are "Help clear the table." and "Go up to the loft early.", and the next screen is the night. No clock times, no "late", "midnight", "dawn".

On the long calendar the first story day of the Fallout is a WEEK of seven suppers. It has three texts now (the first `seqText` list in the file, `fo_supper:8`), shown on its nights 1–3. You write its **texts 4, 5 and 6**, shown on nights 4–6 (a seventh night shows text 1 again, folded). They are not a story: each stands alone, in any order after the old three.

## Your week (the first story day)
The first week after the Sect's answer. The wall is going up and is not up yet; the household is tired, sore and keeping up its forms. Mei Lin makes light of it and is not quite managing; her mother holds the table to its proper order as if order were a palisade too. James is the stranger at the table who knows things nobody else does and is asked about none of them, or about the wrong one. Small and domestic: what is eaten, who serves whom, what is said and what is pointedly not, a habit of the house, the day's work showing on hands and clothes, a question at the table. **Not:** Ya (she has not come yet), the plan for the Blackroot, leaving, the arson, anyone at the door or window, fighting, romance beyond a look.

Yuki (his root-kin) is in every text, in her three forms: the small white cat (bond-speech in italics, `*like this*`, heard only by James), the great root-kin, tiger-sized (bond-speech in italics), the woman with cat ears and tail (speaks aloud, in quotes; the mother seats her at the head of the table and treats her with formal respect). Write each text as a shared part plus ONE Yuki passage (one or two sentences) marked `{yuki}` in the shared part, given in three forms as separate keys. The shared part names no form (no "small", "paw", "ears", "tail", "stove", "along the wall", "at the head" there).

Each text: two paragraphs, the shared part 80–120 words, each Yuki passage 20–40 words. Mark the paragraph break with ` ¶ `.

Rules:
- **The fold:** a text read before folds to its FIRST PARAGRAPH with a "Read it all again" link. The first paragraph must be in the shared part, carry no `{yuki}`, stand alone as a reminder of that supper, and not open with "Nobody", "Supper", "The talk", "Mei Lin's mother", "Mei Lin eats", "Tonight" or "You".
- **No day counts** ("the fourth supper", "a week now", "five days to the Elder") and no promises about a day.
- Don't reuse the old texts' moments: the grace at double length, the line about the stranger, the palisade traced in spilled tea, the salt pork, the smoked hare in the washing basin, the splinter, counting posts against days, sawdust, pine resin, dragged trunks, post holes, the burial, "whether a wall will be enough", "enough to make them knock", the shutters, the north window, the barred door, the ladle and the salted pot.
- Avoid the loft (it may have burned on another path); avoid the canon card's tics and any phrase the given texts use; don't reuse a five-word run between your drafts. No song lyrics, no real names.

## Output
Write `/tmp/p12/drafts-s8.txt`: one line per key, `key | text`, no line breaks inside a draft:
```
fo_supper:8:4 | first paragraph ¶ second paragraph with {yuki} in it
fo_supper:8:4:y:cat | the Yuki passage, cat
fo_supper:8:4:y:great | the Yuki passage, great root-kin
fo_supper:8:4:y:human | the Yuki passage, woman
```
and the same for `:5` and `:6`. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold.
