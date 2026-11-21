# Run BH (owner pick P16-A: the Blackroot's hunts): `dw_hunt` texts 2 and 3, `rr_hunt` text 3

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common.md` (tone and rules: they bind you), `/tmp/p16/bh-code.txt` (the two scenes as code: `rr_hunt`'s `byDay` list of two texts, `dw_hunt`'s one text, and their choices), `/tmp/p16/pk-rr_hunt.txt` and `/tmp/p16/pk-dw_hunt.txt` (the context packets: what leads in, the choices and their results) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, the tic list). Do not read other repo files.

## `dw_hunt` texts 2 and 3 (the Drowned Wood; one text a day, these on the days after the old one)
The hunting ground of the Drowned Wood: roosting marsh fowl in the drowned branches, and the serpent's wake in still black water. The choices under it stay "Go for the serpent." / "Darts at the roosting fowl." / "Not now.", so each text must show both the serpent (or its sign) and the fowl. Ya and Mei Lin with you; a short exchange between them or at you. 70–110 words, two to four paragraphs. Neither opens with "The drowned branches", "Serpent" or "Ya".

## `rr_hunt` text 3 (the Root Road)
A bone-elk between the roots (bone antlers in spirals, a mane of knives), found by Ya; your Convergence reacts to the bone. Choices stay "Take the bone-elk." / "Leave the elk. Snare root-hares instead." / "Not now.", so the root-hares should be there to be seen or named. Mei Lin's place in the hunt and Ya's plan must not repeat the old two ("You go left, I go right", "stays behind the root and screams", "She learns"). 100–140 words, three to five paragraphs. Not opening with "Ya has the scent", "Ya stops" or "A bone-elk".

## Output
Write `/tmp/p16/drafts-bh.txt`:
```
dw_hunt:2 | text
dw_hunt:3 | text
rr_hunt:3 | text
```
then `# notes` as in common.md.
