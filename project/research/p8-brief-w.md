# Bone and Ash, v0.11.235 drafts, run W (owner pick P8-A: EVw, the sunset walk's two sequences a cycle of six)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p8/walk-texts.txt` (the walk's texts as they stand, as template code), `/tmp/p8/packet-ev.txt` (the context packet: when the walk shows, its choice and what follows; the `mei_walk` part only) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, and gets in trouble for it; an Ashfall herb girl, 26, raised on propriety and sick of it; afraid for the village and won't show it). Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
Ashfall before the tribute (the Sect's collectors come up the road for grass, millet and children with spirit roots; James will hide as a mute cousin from the hill farms). At sunset James and Mei Lin walk the edge of the barley field. The one choice after the text is "Walk her home." (her mother's door), whose result is fixed by the week, so each text ends out on the walk, before they turn for home.

Yuki (his root-kin) has three forms: the small white cat (bond-speech in italics, heard only by James), the great root-kin, tiger-sized (bond-speech in italics), the woman with cat ears and tail (speaks aloud). **Leaving Yuki out is fine.** If you use her, put her in ONE sentence, mark its place in the text with `{yuki}`, and give that sentence in three forms as separate keys (`…:y:cat`, `…:y:great`, `…:y:human`).

On the long calendar each village day is a WEEK, so the walk shows on up to seven evenings a week and each sequence's three texts repeat. You write three more for each sequence, so each is a cycle of six. Your texts always come after the three old ones of the same sequence, in order (4, 5, 6), and then the cycle starts again from text 1.

Write (keys):
- `mei_walk:5:4`, `mei_walk:5:5`, `mei_walk:5:6`: the second week's walks (after: "take the cat and go, don't be a hero"; "if Mother asks, it was herbs"; the road swept for the collectors). 100–125 words each. Closeness: sleeves brush, she gives no sign of noticing; no arm-in-arm, no holding hands. The old three each end on one short deadpan line of his; yours may, but vary the shape.
- `mei_walk:6:4`, `mei_walk:6:5`, `mei_walk:6:6`: the third week's walks (after: the harvest talked of in the future tense, her fingers on his sleeve; the shutters closing early, her arm through his, naming each family; the well rope hung up dry, her steering him by the sleeve). 60–100 words each, as the old ones. Closer now: her arm through his, a hand on his sleeve, but **not holding hands** (her taking his hand is saved for the last evening and the door).

A new small moment on the walk: something she notices in the field or the village at dusk, teases him about, admits, asks about his world, or a village custom before the tribute; the tribute's shadow lightly. Not a retelling of the old texts' moments (above).

Rules:
- **No day counts** ("the second walk", "three evenings left") and no promises about a fixed day. "This evening" is fine. Not the last evening before the tribute (that one has its own text).
- **The fold:** a text read before folds to its FIRST SENTENCE with a "Read it all again" link. The first sentence must stand alone as a reminder of the moment, and every text has at least two sentences.
- No romance beyond the level above. She cannot be seen by the lane being improper: she laughs into her sleeve, checks who heard.
- Don't overlap the roof's evenings (plum wine and the tribute's numbers; a slow song and her shoulder; what his people do before a thing they cannot stop; the bow lesson and the mute cousin; a bet on the widow's and the dyer's lamps; the herb loft by smell; her mother's three rules; the wrong stars; the singing trees; the music in his arm; what Ashfall has decided he is) or the supper's (her father and the empty box; mushrooms that kill and glow; the dyer's wife's onion; the sacks for the post).

## Don't reuse
"a chaperone with a grudge", "Bit late for that", "don't be a hero", "great white beast", "red light", "sun goes down", "sleeves brush", "under her breath", "come up short", "the cleanest thing", "the dyer's boy", "hard enough to", "smells of mint", "has ruled", "like a snare", "verdict". Avoid the canon card's tics and any phrase the given texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.

## Output
Write `/tmp/p8/drafts-w.txt`: one draft per line, `key | text`, paragraphs separated by ` ¶ ` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB).
