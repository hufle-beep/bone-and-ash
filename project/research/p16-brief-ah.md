# Run AH (owner pick P16-A: the Ashen Hills' hunt): `ah_hunt` texts 3–6

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common.md` (tone and rules: they bind you), `/tmp/p16/ah-code.txt` (the scene as code: `ah_hunt`'s two texts by day, its choices, and the away versions under `AW.hunt`: `any` is the text when Ya is away (Mei Lin may or may not be there too); `byForm(g, cat, great, human)` a passage by Yuki's form), `/tmp/p16/pk-ah_hunt.txt` (the context packet) and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## The scene
The Ashen Hills' hunting ground, by day: three cinder hawks (bigger than eagles, ash-grey, shedding sparks) that want Yuki (the cat and the woman are prey to them; the great root-kin is not: they look at her and then somewhere else), and hill-hares in the gullies, ash-coloured. Choices stay "Take the hawks before they take Yuki." (the great form: "Take the hawks.") / "Darts at the hill-hares instead." / "Not now.", so each text shows the hawks and names the hares.

You write four texts: **text 3** (the first stay's third day) and **texts 4, 5, 6** (the second stay's three days). Each stands alone; texts 4–6 may show the hawks grown used to you, or the hunt grown routine, but no counting.

Each text, two versions:
- **With Ya:** 80–110 words, three or four paragraphs; one `{yuki}` passage by form (cat on your shoulder, great root-kin at your side, woman at your elbow; 10–30 words each) and Ya's line about the hawks may also go in the `{yuki}` passage if it differs by form.
- **Ya away (`away`)**: Ya is not there; name no woman as present; 60–90 words, its own `{yuki}` passage by form.
None opens with "Since you crossed", "The cinder hawks are back" or "Three"; not "Threes" or "Three again" anywhere.

## Output
Write `/tmp/p16/drafts-ah.txt`:
```
ah_hunt:3 | shared text with {yuki}
ah_hunt:3:y:cat | …
ah_hunt:3:y:great | …
ah_hunt:3:y:human | …
ah_hunt:3:away | text with {yuki}
ah_hunt:3:away:y:cat | …
ah_hunt:3:away:y:great | …
ah_hunt:3:away:y:human | …
```
and the same for 4, 5 and 6; then `# notes` as in common.md.
