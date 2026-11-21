# Run FC (owner pick P16-A: the first flight, with FC-o: out of sight in the village)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common.md` (tone and rules: they bind you; this scene is read ONCE in a game, so the fold rule and the "later day" rule do not apply), `/tmp/p16/sf-code.txt` (the Foundation breakthrough's texts and `BT_CLOSER`, its last paragraph, which ends "The ground, it seems, has let go of you.") and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## Canon (the owner's words, lore)
James's people gain flight with their first breakthrough, so they fly from Foundation. James is a natural: he rides the local Qi flows the way a swimmer rides river or ocean currents, as natural as walking, and is completely unbothered by anyone's bafflement. Yuki flies too (her cultivation is the same as his). On this world people fly only from Golden Core, slowly, with ceremony: a local who sees him fly reads him as at least that, though nobody can sense his realm. Yuki is the small white cat at this point (always: Foundation is her first rung too).

## The scene (new, `first_flight`)
Shown once, the first time James reaches Foundation: after the breakthrough screen and its "Get up." He gets up, and the ground has let go of him: the discovery. The next screen is wherever he was (the forest, the village, the road), so the scene ends with him back on his feet or choosing to come down. No clock times and no time-of-day words at all (no sun, light, dark, stars, night, morning, evening): it can be any hour.

Four places, each a version of the opening (`open:<place>`) and of the reaction at the end (`close:<place>`), around ONE shared middle (`body`):
- `alone`: the forest or anywhere nobody is; only Yuki.
- `village`: Ashfall (the prologue's village or Act 1's): the village has just watched the sky's storm over him. **Nobody but Yuki sees the flight:** he gets clear of the street first (a back way, behind a wall, beyond the last houses; your choice, but plausibly), and the close keeps it unseen.
- `party`: Mei Lin and Ya are there (in the Blackroot or on the road) and see it.
- `mei`: Mei Lin alone is there (Ya has walked off) and sees it.
Shape: `open:*` 30–60 words each; `body` 100–150 words, shared, so it names no person but Yuki and no place (no street, no forest, no road): the feet leaving the ground, the Qi flows like a current, the natural ease, Yuki in the air beside him with her own opinion of it (bond-speech in italics); `close:*` 20–50 words each: who saw and what they make of it (the party: astonishment, Ya delighted or offended, Mei Lin grave about what it means: Golden Core; James unbothered), alone and village: Yuki and James only.
Also a choice label under it, 2–6 words, that brings him down or back (`label`), and a screen title, 1–4 words (`title`).
Don't reuse "The ground, it seems, has let go of you" or any five-word run of the file.

## Output
Write `/tmp/p16/drafts-fc.txt`:
```
first_flight:title | …
first_flight:open:alone | …
first_flight:open:village | …
first_flight:open:party | …
first_flight:open:mei | …
first_flight:body | paragraphs split by ¶
first_flight:close:alone | …
first_flight:close:village | …
first_flight:close:party | …
first_flight:close:mei | …
first_flight:label | …
```
then `# notes` as in common.md.
