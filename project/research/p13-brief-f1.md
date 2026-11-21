# Bone and Ash, v0.11.241 drafts, run F1 (owner pick P13-A: FS10, the Fallout supper's story day 10 its own six)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p13/fo-supper-texts.txt` (the supper's texts as they stand, as template code: `FS8` / `FS9` and the two `seqText` lists; `yaHere(g) ? … : …` gives the text with Ya at the table and the line without her), `/tmp/p13/fo-packet.txt` (the context packet: when the supper shows, what leads in, its choices and the screen after) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it); her mother tiny, fierce, formal, grave about propriety, the ancestors and the Sect, widowed; she does not joke. Ya: 27, a feral huntress raised wild, more unfit for civilised society than James; tall, barefoot, a necklace of teeth, a bone-tipped spear, a red scar under one eye; she jokes and flirts aggressively, is easily offended, picks fights, can't read; she calls James "scholar". Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
`fo_supper`, the Fallout's supper at Mei Lin's mother's house in Ashfall, where James lodges. The Fallout is the stretch after the village defied the Crimson Lotus Sect: Outer Elder Shen Qiu is coming; the village builds a palisade and drills. Ya came out of the wilds in the second story day and has attached herself to the household's table; the mother feeds her because a guest is fed, and endures it.

**Your story day, the third (a week of six suppers on the long calendar; the seventh evening is a separate farewell scene).** On its first morning Old Wen showed James an old hide map: in the middle of the forest (the Blackroot) the Old Tree, a *Hearth*, which the Sect's founder robbed of its heart. James has decided to go there before the Elder arrives. Ya will guide him, for her price: salt, iron, a real fight every few days, sleeping beside him in the forest rather than across the fire, and Mei Lin comes too. Mei Lin had packed her basket before anyone told her. Her mother offered no argument (in Ashfall a decision said aloud is not disputed; it is only made as correct as it can be) and gave her daughter her dead husband's hunting knife, in red cloth, on both palms. So at these suppers the household knows: the three of them are going into the Blackroot, soon. By day Ya lies on the shrine roof across the lane, sharpening her spear and watching north; the palisade is still going up.

The text shows at 19:00 or a little after. The choices under it are "Help clear the table." and "Go up to the loft early."; the next screen is the night. No clock times, no "late", "midnight", "dawn", "tomorrow".

The six texts show in order on the week's six nights, but each must stand alone (see the fold). You write **texts 1, 2 and 3**; another run writes 4–6 after you.

Each text comes in two versions:
- **With Ya** (most players): 110–160 words, three or four paragraphs (mark breaks with ` ¶ `): the household at table with the going-away in the air, kept to its forms. The mother makes the going as correct as it can be, in her own grave way; Mei Lin makes light of it and is not quite managing; Ya is at the table being Ya, and something she says or does lands on it. Small and domestic: what is eaten, packed, mended, given, said and pointedly not said. Yuki may appear in a sentence that names no form (no "small", "paw", "ears", "tail", "great", "woman", "stove", "shoulder"), or not at all.
- **Without Ya** (she has not been met; rare): ONE line, 8–16 words, the household's quiet supper before a going, like "Supper. Quiet. The mother watches the north window the whole time." (but not those words).

Rules:
- **The fold:** a text read before folds to its FIRST PARAGRAPH with a "Read it all again" link. The first paragraph must stand alone as a reminder of that supper and not open with "Ya comes to supper", "Ya is at the table", "Supper", "Tonight", "There is" or "Nobody" (the line without Ya may open with "Supper.").
- **No day counts** ("the last supper", "three nights left", "a week now") and no promises about a day. Not the farewell: no send-off, no guests from the village, no gifts from neighbours, no plum wine, no speeches.
- Don't reuse the old texts' moments: the wrong side / the host's side, eating with her fingers, the wolf at a kill, the tribulation face, the burp, the loft question, the dropped chopsticks, the hare on the table, "What?", "small, but she hits", a fight after, coming in by the window, the spear across her knees, "Do they answer?", "Feed the scholar", the basin on the step, the necklace's teeth named one by one, the recited thanks and the returned bow, the hands shown before the grace, the auspicious day for the gate, the white coat and the short-sleeved jacket; the north window, the turned stool, the barred door, the dog barking; the ladle and the salted pot. Don't retell the knife in red cloth or the price's terms (a passing nod at most, never the point).
- Avoid the loft (it may have burned on another path); romance only as a joke of Ya's (nothing explicit: the mother is at the table), and nothing that assumes James and Mei Lin are or are not lovers; avoid the canon card's tics and any phrase the given texts use; don't reuse a five-word run between your drafts. No song lyrics, no real names.

## Output
Write `/tmp/p13/drafts-f1.txt`: one line per key, `key | text`, no line breaks inside a draft:
```
fo_supper:10:1 | the text with Ya, paragraphs split by ¶
fo_supper:10:1:away | the line without Ya
```
and the same for `:2` and `:3`. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold. Reply with just "done" and the file path.
