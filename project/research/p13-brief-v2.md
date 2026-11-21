# Bone and Ash, v0.11.241 drafts, run V2 (owner pick P13-A with WK-d: SPw3, the village supper's week 3 its own six)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p13/supper-texts.txt` (the village supper's texts as they stand, as template code: `SUPPER_NEW` and the `supper` scene's two `seqText` lists; `byForm(g, cat, great, human)` gives a passage in Yuki's three forms), `/tmp/p13/supper-packet.txt` (the context packet: when the supper shows, what leads in, its choices and the screens after) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it; no spirit root, tested at seven); her mother tiny, fierce, formal, grave about propriety, the ancestors and the Sect, widowed (her husband had a spirit root and went up the road with the collectors when Mei Lin was six; a two-word letter came back years later, and they buried an empty box); she does not joke. Second person ("you" = James, 40, a mycologist from another world, lodging in the herb loft). British spelling.

## The scene
`supper`, the village supper at Mei Lin's mother's house in Ashfall, in the prologue. On the long calendar the village has three weeks before the tribute: once a year the Crimson Lotus Sect's collectors come up the road for the village's grain, and for any child with a spirit root. **Your week is the third and last before the tribute**: the red banners hang on the tribute post, still, and the collectors are due within the week. James has eaten at this table for two weeks; the house has its habits with him now. By day he works about the village. Something may or may not have happened in the second week (a fire, a fight with the Sect's disciples): mention none of it.

The text shows at 19:00 or a little after. The choices under it are "Climb out onto the roof with Mei Lin and watch the stars come out.", "Help her mother with the dishes, and listen." and "Go up to the loft early. Tomorrow will want everything you have."; the next screen is the roof or the night. No clock times, no "late", "midnight", "dawn", "tomorrow".

This week has six suppers, all new: you write **texts 4, 5 and 6**; another run wrote 1–3 (`/tmp/p13/drafts-v1.txt`: read it too, and don't reuse its moments or any five-word run from it). They show in order, but each must stand alone (see the fold). Small and domestic, the old texts' shape: a habit of the house, a question at the table, what is eaten and who serves whom, the tribute's nearness showing in what is done and pointedly not said. The mother keeps her forms as if they were a wall; Mei Lin makes light of it.

Each text: 100–150 words, short paragraphs as the given texts (mark breaks with ` ¶ `). Yuki (his root-kin) appears either in a sentence that names no form (no "small", "paw", "ears", "tail", "great", "woman", "stove", "wall", "head of the table"), or in ONE passage of one or two sentences marked `{yuki}` in the text and given in her three forms as separate keys: the small white cat (bond-speech in italics, `*like this*`, heard only by James), the great root-kin, tiger-sized (bond-speech in italics), the woman with cat ears and tail (speaks aloud, in quotes; the mother treats her with formal respect). Or not at all.

Rules:
- **The fold:** a text read before folds to its FIRST PARAGRAPH with a "Read it all again" link. The first paragraph must carry no `{yuki}`, stand alone as a reminder of that supper, and not open with "Supper", "Tonight", "Another", "The mother", "Mei Lin's mother", "The house" or "You".
- **No day counts** ("the last supper before", "three nights left", "a week now") and no promises about a day.
- Don't reuse the old texts' moments: the empty box and the letter (a passing mention at most), what a man who studies mushrooms does, cooking or toasting the millet, the egg, the word said wrong ("sorrow"), the persimmons and their string, chopsticks upright, the cooper's wife and the sieve, the glasses, the sacks for the post and the steelyard, the dyer's wife and the onion, the largest piece of fish, a fox, dusting the shrine shelf, the stove; the north window, barred doors, the ladle.
- Avoid the loft (it may have burned on another path); no romance beyond a look; avoid the canon card's tics and any phrase the given texts use; don't reuse a five-word run between your drafts. No song lyrics, no real names.

## Output
Write `/tmp/p13/drafts-v2.txt`: one line per key, `key | text`, no line breaks inside a draft:
```
supper:6:4 | first paragraph ¶ second paragraph, with {yuki} in it if used
supper:6:4:y:cat | the Yuki passage, cat (only if {yuki} is used)
supper:6:4:y:great | the Yuki passage, great root-kin
supper:6:4:y:human | the Yuki passage, woman
```
and the same for `:5` and `:6`. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold. Reply with just "done" and the file path.
