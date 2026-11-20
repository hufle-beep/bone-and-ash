# Bone and Ash, v0.11.238 drafts, run N1 (owner pick P11-A: EVn-1, the first week's quiet nights a cycle of six)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p11/quiet-texts.txt` (the quiet night's texts as they stand, as template code: `byForm(g, cat, great, human)` gives a text in Yuki's three forms; `quietY(shared, cat, great, human)` a shared text with Yuki's passage in `{yuki}`), `/tmp/p11/vn-packet.txt` (the context packet for the first week: when the night shows, what leads in, its choices and the screen after; the choices past [0] are the story night's, not yours) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it); her mother tiny, fierce, formal, grave about propriety and the Sect, widowed; she does not joke. Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
`village_night`, the quiet night: Ashfall before the tribute (the collectors come for grass, millet and children with spirit roots). James lodges in the herb loft of Mei Lin's mother's house. The text shows when he goes up to sleep, after supper and one of: the roof with Mei Lin, the dishes with her mother, or going up early. The one choice under it is "Sleep." and the next screen is the morning. So each text is him in the loft, settling, with the house and the village around him at night; it ends with him asleep or about to be. Shown between about 19:00 and 02:00: no clock times, no "early", "late", "midnight" or "dawn".

On the long calendar each village day is a WEEK of seven nights. Weeks 2 and 3 have their own three (in the file). **Week 1** has the three old texts (the first `byForm` list in the file), which show on its nights 1–3 and then again on 4–6. You write week 1's **texts 4, 5 and 6**: its nights read the old 1, 2, 3, then your 4, 5, 6 (a seventh night shows the old text 1 again, folded). They are not a story: each stands alone, in any order after the others.

Yuki (his root-kin) is in every text, in her three forms: the small white cat (bond-speech in italics, `*like this*`, heard only by James), the great root-kin, tiger-sized (bond-speech in italics), the woman with cat ears and tail (speaks aloud, in quotes). Write each text as a shared part plus ONE Yuki passage (one or two sentences) marked `{yuki}` in the shared part, given in three forms as separate keys. The shared part names no form (no "small", "paw", "ears", "tail" there).

Each text: the shared part 45–65 words, each Yuki passage 20–40 words. A new small moment of the night: a sound or a smell of the house or the village, something someone does below or in the lane, a thought of his, what Yuki does about him. Deadpan, quiet, specific.

## Week 1 (your week)
The first week of the stay. He is still the stranger the herb girl brought home: the mother has given him the loft because propriety required something of her, and watches him as she would a borrowed ox. Mei Lin is amused by him and has not yet been told off for it often enough. He is learning the house: which board talks, where things are kept, the household's order of going to bed, the village's night sounds he cannot name yet; his own world's nights against this one. Ordinary and close. **Not** the later weeks' lanes: not the house half taking him in (week 2: the husband's tablet, a fungus he can't classify, the rain and the drying racks), not a village listening to the road (week 3: the bar on the door, a cup left out, the dog hushed by name).

Rules:
- **The fold:** a text read before folds to its FIRST SENTENCE with a "Read it all again" link. The first sentence must be in the shared part, stand alone as a reminder of that night, and not open with "Tonight", "Below the herb loft", "The herb loft", "Mei Lin's mother", "Someone", "Rain" or "Ashfall has". Every text has at least two sentences.
- **No day counts** ("the fourth night", "a week now") and no promises about a day ("the collectors come in four days").
- No romance beyond a thought of her; Mei Lin does not come up to the loft. Nobody new enters the house.
- No Ya (he has not met her yet). No sect men, torches, fire in the lane, or anyone at the window. Don't foreshadow anything.
- Don't reuse the texts' moments in the file: Yuki on his chest, taking the loft or the blanket, the cold feet, the banked stove, the talk going out, the mother through the floor about the ladle, "Stop thinking", "It's loud", the posts creaking, mint and drying ginseng, the house breathing; the tablet, the record, the fungus, the snoring neighbour, the rain, the door bar, the cup, the lamp, the dog, the cough.
- Don't overlap the evening's other scenes: the supper (upright chopsticks, the cooper's wife and the sieve, the glasses, the potter's hen and the egg, the millet in the wrong tone, the dried persimmons), the roof (what Ashfall has decided he is, his forearm's music, the plum wine, the tribute's numbers, the wrong stars, the singing trees, a bet on lamps, her mother's three rules), the dishes (the village's debts to the Sect, which families the road has cost a child).
- Avoid the canon card's tics and any phrase the given texts use; don't reuse a five-word run between your drafts. No song lyrics, no real names.

## Output
Write `/tmp/p11/drafts-n1.txt`: one line per key, `key | text`, no line breaks inside a draft:
```
village_night:w1:4 | shared part with {yuki} in it
village_night:w1:4:y:cat | the Yuki passage, cat
village_night:w1:4:y:great | the Yuki passage, great root-kin
village_night:w1:4:y:human | the Yuki passage, woman
```
and the same for `:5` and `:6`. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold.
