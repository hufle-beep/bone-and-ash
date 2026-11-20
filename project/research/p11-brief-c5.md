# Bone and Ash, v0.11.238 drafts, run C5 (owner pick P11-A: CB5, the camps' last nights)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p11/packet-camp.txt` (the camp screen as it stands: its texts by region and night, its choices, what follows), `/tmp/p11/packet-bl_fireside.txt` and `/tmp/p11/packet-bl_night.txt` (the two screens after it, for what NOT to repeat) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, checks who heard). Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene
Act 1, the journey into the Blackroot: James, Yuki (his root-kin), Mei Lin (an Ashfall herb girl, 26) and Ya (a feral huntress, 27, spear, barefoot) walk to the dead tree's Heart. Each evening at 19:00 they make camp. The camp screen is ONE paragraph describing the camp in the region, then a line about the food stock (not yours). Its choices: "Cook and eat.", "Sit by the fire with the others.", "Sleep." (and on a story night, bone stakes).

On the long calendar the party camps five nights on the Root Road, four in the Drowned Wood and five in the Ashen Hills. Each region has three camp texts (in the packet: "its first / second / third camp"), so the later nights show an old one again. You write the rest:

- `bl_camp:rr:4`, `bl_camp:rr:5`: **the Root Road's fourth and fifth camps.** The second leg of the root road, after the first story night (the wolves). The road is one enormous living root, broad as a cart, rising and dipping over the forest floor; lesser roots join it, all going the same way, toward the dead tree. The morning lines on this leg (not yours): "Morning, and the same stretch of root. Ya has her nose to the wind before anyone else is upright." / "Grey light on the root again. Ya is restringing her necklace…". Somewhere ahead the road ends at a chasm (the split); don't name it or the creature on this stretch.
- `bl_camp:ah:4`, `bl_camp:ah:5`: **the Ashen Hills' fourth and fifth camps.** The last leg, right under the dead tree, after the hawk night; the pass is ahead (don't name what waits there). Black ridges, black glass, ash knee-deep in the lee, low blue fire, the dead tree over everything and taking a third of the stars. The morning lines here (not yours): "Morning under the tree. The sun gets round it late. Ya's whetstone has started already…" / "The tree has not come any closer overnight; you checked. … Yuki faces it through the whole meal, and so far the tree has not blinked."
- `bl_camp:dw:4`: **the Drowned Wood's fourth camp: its story night, after the mourning hollow** (the drowned dead; the fight there may have been won or lost: name neither). Not on a raft: the party camps **at the wood's edge**, where the water runs shallower and warmer (the hill-fire comes up under it somewhere near; the Ashen Hills are next). Its night (the bl_night packet) comes after. Don't name a spring or anyone bathing (another scene's).

Each 35–50 words, ONE paragraph, at least two sentences. A small concrete new thing about camping in that place on that leg: the ground, the fire, the dark, what the party does there now, a habit, the weather. Mei Lin and Ya may appear in a clause (both are at camp every evening); **leave Yuki out**.

Rules:
- The screen is drawn **before** "Cook and eat." and drawn again unchanged **after** it, after the fireside and after a walk away from the fire: so no meal, no cooking, no food, no one asleep or on watch, nothing that happens later in the evening. The fire is lit; it is evening (19:00). No "morning", no "tonight we…" promises.
- **No day counts** ("the fourth night", "one more night") and nothing that says it is the last night in a region. Familiarity may show, but no "for the first time".
- **The fold:** on a later visit a text already read shows its paragraph with the rest folded, so the paragraph must stand alone.
- Nothing about threats coming tonight (the text can't promise quiet or danger).
- Don't repeat the moments of the three texts each region has (the packet), the fireside's or the night's, or the morning lines above.

## Don't reuse
"you checked", "you looked", "by now", "has settled", "you are learning", "everything else drips", "the fire hisses", "hard enough to", "runs thicker", "verdict", "under her breath", "sun goes down", "red light", "any more". Avoid the canon card's tics and any phrase the given texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.

## Output
Write `/tmp/p11/drafts-c5.txt`: one draft per line, `key | text` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB).
