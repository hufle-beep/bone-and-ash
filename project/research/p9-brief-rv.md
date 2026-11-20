# Bone and Ash, v0.11.236 drafts, run RV (owner pick RV1 after P9-A: the cold reviews' text findings)

You draft story texts for a hand-written text RPG. Read ONLY: this brief and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (an Ashfall herb girl, 26); Ya (27, a feral huntress, spear, barefoot, calls James "scholar"). Second person ("you" = James, 40, a mycologist from another world). British spelling.

## The scene (camp)
Act 1, the journey into the Blackroot. At 19:00 the party (James, Yuki, Mei Lin, Ya) makes camp; the camp screen is ONE paragraph about the camp, then a food line. It is drawn before "Cook and eat." and again unchanged after it and after the fireside: so no meal, cooking, food, sleep or watch; the fire is lit. No day counts, no promise of quiet or danger. Leave Yuki out. On a later night a text already read shows whole, so it must stand alone. 35–50 words, one paragraph, at least two sentences.

**The third camp in each region is always the region's story night**, followed by a night event drawn from a pool. The camp text must not name or foreshadow any of them. Root Road pool: Ya singing, wolves, pale lights low to the ground, a rut (beasts in season), a warm night. Ashen Hills pool: cinder hawks (a fight), the stars coming out when the haze lifts, pale lights, a warm night, Mei Lin.

The screens around:
- Root Road hub, the morning BEFORE nights 1–3: "Morning. The root runs ahead of you, broad enough for a cart, rising and dipping across the forest floor like the backbone of a sleeper. Lesser roots come in from either hand and join it. Every one of them is going the same way."
- Root Road hub, the morning AFTER night 3: "Morning. The second stretch of the Root Road. The roots run thicker here, and warmer underfoot. Ya says the road ends at the split, not far on now, and that the split has a tenant."
- Ashen Hills hub: "Morning. Black ridges, a grey sky, the dead tree over both. High up, cinder hawks circle, each trailing a thin thread of smoke."
- The Root Road's first camp (kept): "You camp on the root's broad back, with the fire set in a hollow of the bark and the forest standing round you, dark and very large. Through the bedroll, the root is warm."
- The Drowned Wood's three camps (kept), a raft of trunks: the second ends "Whatever keeps surfacing out there has come no nearer. You checked."; the third opens "The raft holds. By now you know which trunks shift…".
- The Ashen Hills' first and second (kept): "You camp under a black ridge, where the wind can't reach. Fire behaves oddly here: it burns low and blue…" / "Ash has drifted knee-deep behind the ridge, so the camp is a pit you trod out yourselves… Ya has read them all and thinks little of yours."

Rewrite (keys):
- `bl_camp:rr:2` (now: "A lesser root joins the road here, and the crook between them gives the camp a wall on one side and the forest on the other three. Ya has rapped the bark with her spear butt and pronounced it sound. The fire leaves no scorch on it; you looked."): keep the idea of a sheltered crook and Ya testing the bark if you like, but **not** "a lesser root joins" (the hub just said it) and **not** a "you looked / you checked" ending (the Drowned Wood's and two other lines have it). Don't end on a verdict from Ya.
- `bl_camp:rr:3` (now: "The root runs thicker here, broad enough that the firelight stops short of its edges. By now nobody asks where to put the fire: Ya finds a dip in the bark with her bare heel, and Mei Lin has the kindling there before Ya can say so."): keep the habit forming (Ya's heel, Mei Lin's kindling) if you like, but **not** "thicker" or "warmer" (the next morning's news), **not** "By now".
- `bl_camp:ah:3` (now: "The cinder hawks have come down to roost along the ridge above the camp, each under its own wisp of smoke. The routine has settled: packs strapped shut, the water covered, and Mei Lin shaking the ash out of her sleeves while Ya counts birds and loses her place."): a new image with **no hawks, no birds, no stars, no lights, no warmth**; "each … smoke" is the hub's. The routine clause (packs strapped, water covered, Mei Lin shaking ash out of her sleeves) may stay; give Ya something else to do.

## The talk (Ya's quiet walk)
On the road, Ya walks beside James in silence, gives him a stone to carry ("Carrying," says Ya). Two lines to rewrite:
- `talk_ya:q:not` (when she is not close to him; now: "Later she takes it back, weighs it, and throws it at nothing, a long way. \"Wrong stone,\" she says, and punches your arm for having carried it so carefully."): keep "Wrong stone" if you like, but **don't end on a punch on the arm** (her old quiet walk ends the same way). 20–40 words.
- `talk_ya:q:both` (when both women like him; now: "\"The herb girl got one too,\" she says, lower. \"Smaller. Rounder. She put it in the basket with her roots and thinks I did not see.\" She sounds delighted. \"She kept it.\""): keep the content; change only the dialogue tag "she says, lower" (another talk has it word for word). No teeth, no grin.

## Don't reuse
"you looked", "you checked", "by now", "runs thicker", "lesser root", "each under its own", "hard enough to", "smells of mint", "has ruled", "like a snare", "verdict", "under her breath", "every tooth", "she says, lower". Avoid the canon card's tics; don't reuse a five-word run between drafts or from the lines quoted here. No song lyrics, no real names.

## Output
Write `/tmp/p9/drafts-rv.txt`: one draft per line, `key | text` (no line breaks inside a draft). Then, under a line `# notes`, at most a few short notes (under 1 KB).
