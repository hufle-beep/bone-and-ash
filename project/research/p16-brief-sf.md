# Run SF (owner pick P16-A: the small fixes KA (b), BYb-t, CF)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common.md` (tone and rules: they bind you), `/tmp/p16/sf-code.txt` (the texts as code) and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## KA (b): flight on a kept realm (`coil_dawn`)
After James wins Act 1, every later Coil starts with a realm kept (`${realmName(g.coil.kept)}`: Foundation or higher), so his flight is there from the first dawn, with no breakthrough to announce it. Flight canon: his people fly from Foundation, riding the Qi flows like a swimmer in a current, as natural as walking; Yuki flies too.
1. **`ka:pro`**: ONE sentence (15–25 words) added at the end of the prologue's kept paragraph (the one starting "The hammerspace reports in: empty. Your body files a report of its own, and for once it is not a blank page"): the flight came back with the realm. Name no form of Yuki (she may be the cat or the great root-kin here).
2. **`ka:act1`**: a kept version of the Act 1 dawn's second paragraph ("The hammerspace reports in: what the tribute left you, and not one thing earned since. Your body has lost the road to the dead tree. …"), 45–70 words: the hammerspace as before (what the tribute left), the body kept the realm (write `{realm}` where its name goes) and the flight with it, the head the map of the road to the dead tree. Not the prologue paragraph's wording ("files a report", "library nobody thought to burn"). Name no form of Yuki.

## BYb-t: a third `recognise` branch (the Foundation breakthrough)
Today the breakthrough's storm is recognised either through Mei Lin's description of a tribulation (`lore1`) or not at all ("For this you have no word at all…"). Write the third: James heard Old Wen's lesson on the realms (the ladder, rung by rung, "each rung costs more than the last", the Sect buying its rungs with villages) but never what the price looks like: he knows this is the rung, not that the sky comes to collect. **`byb`**: 45–75 words, one paragraph, in the place of the other two (it is followed by "It looks."); no Mei Lin; Old Wen named; no time-of-day words.

## CF: "Core Formation" once less (`BT_LATE.P.A`)
In `BT_LATE.P.A` (the party, realm 2), Mei Lin's line "The Sect's elders are Core Formation." repeats the realm's name James has just said. **`cf`**: the whole of `BT_LATE.P.A` again with only that sentence reworded (4–10 words, naming the rung without its name), everything else word for word.

## Output
Write `/tmp/p16/drafts-sf.txt`:
```
ka:pro | the sentence
ka:act1 | the paragraph with {realm}
byb | the paragraph
cf | the whole of BT_LATE.P.A
```
then `# notes` as in common.md.
