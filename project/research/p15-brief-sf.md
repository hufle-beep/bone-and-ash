# Bone and Ash, v0.11.243 drafts, run SF (owner pick P15-B: SF, the small fixes)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p15/common.md` (tone and rules: they bind you; its "seventh" rule does not apply here), `/tmp/p15/morning-src.txt` and `/tmp/p15/morning-packet.txt` (the forest morning), `/tmp/p15/slopes-src.txt` and `/tmp/p15/slopes-packet.txt` (the herb slopes), `/tmp/p15/rt-night.txt` (the forest night's packet, nights 5, 8, 11 and 14 by form, with and without fire), `/tmp/p15/rt-extra.txt` (the quiet night 3:5 as it stands, the hub line, the camp screen), `/tmp/p15/quiet-texts.txt` (the quiet nights' texts, so you don't reuse them) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, the tic list). Do not read other repo files.

Three small jobs, about 400 words in all.

## 1. MW: the forest's first-week morning (`morning:w1`)
The prologue: James and Yuki crossed by a lab accident into the Blackroot Wilds and camp on a dry rise above a stream (a fallen trunk, black bark, grey moss, a red sun; the forest has **no dusk**: the dark comes down). On the long calendar the forest is three weeks; the morning screen has a text for week 2 ("Another morning in the forest… take stock… Alive, on the evidence. You could go looking for the way out… learn it… *Then* walk out.") and one for week 3 ("The third week in the forest… something has circled the camp…"). Week 1 has none, so every game's first morning wrongly reads week 3's. Write week 1's: the first morning(s) after the first night in this world. It may also show, folded to its first paragraph, on the week's other mornings: so no "first morning", no day count, nothing that is only true once. It may be read in a later Coil (the time loop; James remembers earlier ones), so no surprise at the world as such and no "for the first time": keep it to this morning, this body, this camp, this forest. **Not** week 2's material (taking stock of what he has, deciding to learn the forest before walking out) or week 3's (the camp watched, tracks, the hurry). The next choice is "Get up." (to the day's work at the camp).
Shape: 80–110 words, two or three paragraphs; Yuki in a sentence that names no form, or not at all.

## 2. HS: `herb_slopes` week 2, a second text (`herb_slopes:2:2`)
Week 2 of the village stay (the house has half taken him in; the tribute closer, unsaid). The slopes' week-2 text as it stands (in the source) shows on his first day there that week; yours on a later day of the same week. Mei Lin works her terraces and teaches; it ends with her asking him again, in a new way, why a man who needs none of this is up here, because the choices under it are "Learn properly. Ask questions, take samples, run the omnitool on everything." and "Answer her question. Honestly." (whose reply is "Because you're here," and her laughing). **Not** the given texts' moments: Ninefold grass and how to cut it, the general and the map, leaves gone wrong / curdled milk, cutting double, her father naming plants wrong, the old herb-woman's stare.
Shape: 70–90 words, two or three paragraphs; plus `herb_slopes:2:2:bruised`, ONE sentence shown at the end when Mei Lin's lip was split on the slope in week 1 (the given text's line: "Her split lip has scabbed over…"; yours is days later).

## 3. RT: three rewordings the last review asked for
- **Forest night 11** (`night:11`, see rt-night.txt): its ¶1 retells the camp screen right above it (the path between the stream and the fallen trunk, the trunk that knows his back), and its ¶3 close ("only checks that it is still yours") repeats night 5's "the camp has become yours". Write a new **¶1** (45–60 words; it opens the text and is the fold: don't open with "Between", "Night", "The dark", "Dusk", "A still", "You know", "From the rise", "Quiet", "After the sky", "Coming up", "Mist" or "The night"; no bruise, no stream, no worn path, no trunk-as-furniture) and a new **¶3** (one or two sentences, 20–35 words, the watch-thread on its round, not about the camp being his). ¶2 stays as it is (the ring of stones; Yuki: "Ours. Mostly mine.").
- **Forest night 14** (`night:14`): "The evening has an order now" and ¶2's "a method you never decided on" / "a round you never decided to make" and ¶3's watch that takes itself retell night 8 ("a thing done so often that it no longer counts as a decision", "The watch-thread comes up by itself"). Keep ¶1's first sentence ("Coming up from the water as the dark drops, you catch yourself thinking the word home, and let it stand for want of a better.") and its last ("Behind you the fallen trunk creaks as it cools, and you no longer turn to look."). Write: ¶1's **second sentence** (15–25 words; it must still mention his coat, which Yuki's cat line in ¶2 uses: "the fold of coat you have left out for her"; and his boots off); ¶2's two **fire branches** (one sentence each, 15–25 words: with the fire / with no fire; not habit or method); and a new **¶3** (one or two sentences, 20–35 words; the watch-thread, not "nobody hands the watch over", not habit). ¶2's Yuki line stays.
- **Quiet night 3:5** (`village_night:3:5`, rt-extra.txt): its cloth "snaps in the wind", but the week-3 hub says at every visit that the banners "hang dead still". Rewrite the **shared text** (45–65 words, one paragraph, with `{yuki}` where it is): the banners on the tribute post must hang still (no wind at all), the lane still lies awake over them, and he still lies with one arm, the one that grows bone, outside the blanket; Yuki's three lines stay as they are and must still fit ("I went down and smelt them… Cheap dye, new rope… Put the arm away."). It must not open with "Red cloth" or the first two words of any quiet text in the file, nor with "Tonight", "Someone", "Rain" or "You"; a new closer after `{yuki}` (not "The wind keeps on. You do not.").

## Output
Write `/tmp/p15/drafts-sf.txt`:
```
morning:w1 | paragraphs split by ¶
herb_slopes:2:2 | paragraphs split by ¶
herb_slopes:2:2:bruised | one sentence
night:11:p1 | new ¶1
night:11:p3 | new ¶3
night:14:p1s2 | ¶1's new second sentence
night:14:fire | ¶2's fire sentence
night:14:nofire | ¶2's no-fire sentence
night:14:p3 | new ¶3
village_night:3:5 | the shared text with {yuki} in it
```
then `# notes` as in common.md.
