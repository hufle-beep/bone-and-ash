# Run R1 (owner pick P17-A, SR3: the roof): week 1's texts 4–5, week 2's seventh, week 3's texts 1–2

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p17/common.md` (tone and rules: they bind you), `/tmp/p17/roof-code.txt` (the scene as code: `ROOF_NEW[1]` week 1's texts 2–3 after the old first, `ROOF_NEW[2]` the later nights' texts 2–6 after the old second, `ROOF_STAY` each new text's line after "Stay until the cold drives you in." by the same index, then `supper_roof` itself), `/tmp/p17/pk-supper_roof.txt` (the context packet) and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## The scene
Mei Lin and James on her mother's roof after supper (a social scene). Each text 90–160 words, three to six paragraphs, the first paragraph standing alone; romance at most a look, a shoulder, a hand. Each text has its **stay line** (40–70 words, one paragraph): what happens when the cold drives them in, down the ladder, to the herb loft; it must follow its own text, not the others. Yuki may be mentioned only without naming her form. No stars "all wrong" (the first text), no plum-wine jar emptied (the second), no lists of what Ashfall thinks James is, no dyer's vat, no "concerns distance", no sour pears, no tribute numbers, no lamps bet, no smell test of the loft, no mother's rules about the lodger, no shopping list, no bowing to the water butt, no sprigs, no chestnuts.

You write five texts, each new in its own way:
- **`roof:1:4`, `roof:1:5`**: week 1 (the first week James lodges there; Mei Lin still a little formal with him, curious about his world).
- **`roof:2:7`**: week 2's seventh night (they know each other well now; the week's last night).
- **`roof:3:1`, `roof:3:2`**: week 3, the last week before the Sect's tribute (it hangs over the village; Mei Lin will not talk about it directly). Another run writes week 3's texts 3–7 at the same time: give these two to Mei Lin's work and her father's memory, not to the tribute itself.

## Output
Write `/tmp/p17/drafts-r1.txt`, one line per key, `key | text`, paragraph breaks ` ¶ `:
```
roof:1:4 | text
roof:1:4:stay | the line after
(the same for roof:1:5, roof:2:7, roof:3:1, roof:3:2)
```
then `# notes` as in common.md.
