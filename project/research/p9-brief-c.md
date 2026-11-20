# Bone and Ash, v0.11.236 drafts, run C (owner pick P9-A: CB3, the camp a text a day, three a region)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p9/packet-camp.txt` (the camp screen as it stands: its text, its choices, what follows), `/tmp/p9/packet-bl_fireside.txt` and `/tmp/p9/packet-bl_night.txt` (the two screens after it, for what NOT to repeat) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, checks who heard). Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
Act 1, the journey into the Blackroot: James, Yuki (his root-kin), Mei Lin (an Ashfall herb girl, 26) and Ya (a feral huntress, 27, spear, barefoot) walk to the dead tree's Heart. Each evening at 19:00 they make camp. The camp screen is ONE paragraph describing the camp in the region, then a line about the food stock (not yours). Its choices: "Cook and eat.", "Sit by the fire with the others.", "Sleep." (and on one story night, bone stakes).

On the long calendar the party spends five nights on the Root Road and five in the Ashen Hills, and each region has ONE camp text, so players read the same paragraph night after night. (The Drowned Wood already has three, which grow with the nights: see the model below.) You write two more for each region: its second and third nights. After the third night the list starts again from the first text.

The old texts (night 1, kept):
- Root Road: "You camp on the root's broad back, with the fire set in a hollow of the bark and the forest standing round you, dark and very large. Through the bedroll, the root is warm." (The road is one enormous living root, broad as a cart, rising and dipping over the forest floor; lesser roots join it, all going the same way, toward the dead tree. Further on it runs thicker and warmer underfoot. Wolves at night, far off.)
- Ashen Hills: "You camp under a black ridge, where the wind can't reach. Fire behaves oddly here: it burns low and blue, as though the ash recalled its old trade. A third of the stars are missing, in the shape of the dead tree." (Black ridges, grey sky, the dead tree over everything; cinder hawks circle by day trailing smoke; ash underfoot.)

The model (the Drowned Wood's three, already in the game): "Camp is a raft of fallen trunks with black water under it. The fire hisses; everything else drips. …" / "Another raft of fallen trunks, better chosen; you are learning. The fire hisses. Mei Lin has hung the wet things up to drip with everything else. …" / "The raft holds. By now you know which trunks shift and which stay put, and so does Mei Lin, who walks them with her skirt in one fist. …" Do not copy its moves (the "you are learning" beat, the repeated hiss); find each region's own.

Write (keys):
- `bl_camp:rr:2`, `bl_camp:rr:3`: the Root Road's second and third camp.
- `bl_camp:ah:2`, `bl_camp:ah:3`: the Ashen Hills' second and third camp.
Each 35–50 words, ONE paragraph, at least two sentences. A small concrete new thing about camping in that place: the ground, the fire, the dark, what the party has learned to do there, a habit forming. Mei Lin and Ya may appear in a clause (both are at camp every evening); **leave Yuki out**.

Rules:
- The screen is drawn **before** "Cook and eat." and drawn again unchanged **after** it, after the fireside and after a walk away from the fire: so no meal, no cooking, no food, no one asleep or on watch, nothing that happens later in the evening. The fire is lit; it is evening (19:00). No "morning", no "tonight we…" promises.
- **No day counts** ("the second night", "two more nights"), and nothing that says it is the last night in the region. Texts 2 and 3 may imply familiarity growing ("by now"), but text 1 comes round again after text 3, so nothing should say "for the first time".
- **The fold:** on a later day a text already read shows its whole paragraph (the screen's first paragraph) with the rest folded, so the paragraph must stand alone.
- Nothing about threats coming tonight (one night in a region has a story attack; the text can't promise quiet or danger).
- Don't repeat the fireside's or the night's moments (in the packets) or the old texts' images (the warm root through the bedroll, the blue fire recalling its trade, the missing stars).

## Don't reuse
"you are learning", "everything else drips", "hard enough to", "smells of mint", "has ruled", "like a snare", "verdict", "under her breath", "sun goes down", "red light". Avoid the canon card's tics and any phrase the given texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.

## Output
Write `/tmp/p9/drafts-c.txt`: one draft per line, `key | text` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB).
