# Run B (owner pick P18-A: RH and HK; the Blackroot)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p18/common.md` (tone and rules: they bind you), `/tmp/p18/b-code.txt` (the code: `rr_hunt`'s three texts by day; `ah_hawks_won`'s three degree-1 win texts by day and `AW.hawks_won`, their versions while a woman is away; the hawks' easy and crushing wins, for their moments only), the packets `/tmp/p18/pk-rr_hunt.txt`, `/tmp/p18/pk-ah_hawks_won.txt`, and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## Your texts (each read on a later day than those in the file; each stands alone; no counts, no "again", no "this time")
1. **RH, `rr_hunt:4`**: the Root Road (a road along a giant root through the Blackroot); a bone-elk found before the hunt (grey hide, antlers of raw bone spiralling back along the neck; James's bone-sense, Convergence, reacts to it). Ya, Mei Lin, James and Yuki are all there. 90–130 words, three to five paragraphs, the first standing alone. A beat between Ya and Mei Lin or Ya and James about how to take it; the choices under it stay (take the elk; leave it and snare root-hares; not now), so end before the fight. Not Ya's nose finding it, not a broken tine or an old clever elk, not dropping on it from above, not Mei Lin's powder or screaming, not "big meat". Yuki may be named only without her form (no `{yuki}` here).
2. **HK, `hawks1:4`, `hawks1:5`**: an ordinary (degree-1) win over three cinder hawks in the Ashen Hills (ash and black glass); the whole screen after the fight. 50–90 words each, two or three paragraphs, each with one `{yuki}` passage by form (cat / great / human keys, 10–30 words each). The hawks dive for the cat and the woman (prey), never for the great root-kin (too big: they keep clear of her). Ya and Mei Lin are there; give each text a beat for Ya or Mei Lin. Not "Little queen", not a feather offered, not Yuki sitting on the last hawk counting the sky, not a dart knotted on Ya's necklace, not "a hunt, not a delivery", not a lattice of bone.
   Each with its **away** version (`hawks1:4:away`, `hawks1:5:away`): Ya away or both women away, so name no woman as present and count no heads; 40–70 words, its own `{yuki}` by form.

## Output
Write `/tmp/p18/drafts-b.txt`, one line per key, `key | text`, paragraph breaks ` ¶ `:
```
rr_hunt:4 | text
hawks1:4 | text with {yuki}
hawks1:4:y:cat | …
hawks1:4:y:great | …
hawks1:4:y:human | …
hawks1:4:away | text with {yuki}
hawks1:4:away:y:cat | …
hawks1:4:away:y:great | …
hawks1:4:away:y:human | …
(the same for hawks1:5)
```
then `# notes` as in common.md.
