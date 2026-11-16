# Brief: the carried and on-foot lines (v0.11.197, owner pick C1)

You are drafting short result lines for the text RPG *Bone and Ash*. Read `project/canon-card.md` first (tone, canon, the tic list to avoid), then `project/lore.md` sections "## Yuki" (lines 61–75) and the Mei Lin / Ya lines under "## Places and people". Then `/tmp/c1/packet.md`: three of the walks these lines follow, with their screens (the "DRAFT …" result lines in it are Claude's placeholders, which you replace).

## The rule (already built; your words only)

From Foundation (realm 1) James and Yuki fly; a plain walk elsewhere takes walking time ÷ (1 + realm). In Act 1, Mei Lin (herb-gatherer, 26, looser than the norm, Ashfall propriety behind her) and Ya (feral huntress, 27, tall, rangy, barefoot, proud, jokes and flirts, easily offended, calls James "scholar") travel with him. Neither can fly. The owner's idea (2026-11-16, word for word): "should the f/a be high enough, Mei wouldn't mind being carried by James, and Ya would find riding a Great Cat form Yuki or being carried by a human form Yuki cool. So the travel times wouldn't increase back to lengths taken on foot, if the realms and relationship meters are high enough."

So now, on a walk with the two women along:
- **Carried** (both women's friendship and affection 30+, and Yuki has her great form, i.e. Core Formation+): James carries Mei Lin in his arms; Ya rides on Yuki's back in her great form (a white root-kin the size of a Bengal tiger; Yuki takes the form for the trip even if she was a small cat) — pool `great`. Or, when Yuki is in her human form at the time (realm 7+), Yuki carries Ya herself — pool `human` (Yuki in human form: a head shorter than James, white hair, cat ears and tail, black qipao).
- **On foot** (the whole party walks the full time):
  - pool `yuki`: Yuki has no great form yet (she is a small cat and can't carry Ya), so Ya walks, so everyone walks. (James could carry Mei Lin, but the party keeps together.)
  - pool `mei`: Mei Lin isn't ready to be carried by James (not trust enough yet; propriety).
  - pool `ya`: Ya isn't ready to ride Yuki / be carried (pride, distrust).

## What to write

Five pools of one-to-two-sentence lines, second person ("you" = James), each line containing BOTH placeholders `{min}` and `{walk}` exactly once, as in the game's existing flown lines:

```
"You fly. {min} min instead of {walk}. The path looks no better from above."
"You ride the current over the trees: {min} min, not {walk}. Yuki keeps pace and looks bored."
"{min} min by air, {walk} on foot. You don't miss the mud."
"The Qi runs your way, more or less. {min} min instead of {walk}."
"You take the high road, which isn't one. {min} min, where walking wanted {walk}."
"Flown: {min} min instead of {walk}. Nobody below looks up. Probably for the best."
```

- In the carried pools, `{min}` is the time it took (flown) and `{walk}` what walking would have taken.
- In the on-foot pools, `{walk}` is the time it took (walked) and `{min}` what the flight would have been alone. Make that reading unmistakable ("{walk} min on foot; alone you'd have flown it in {min}" or similar, in your own words, varied).

Counts: `great` 4, `human` 3, `yuki` 3, `mei` 2, `ya` 2 (14 lines).

## Constraints

- Tone (hard rule): James and Yuki deadpan and sarcastic; Yuki speaks to James only through the bond, in italics (`*…*`), except in her human form, where she speaks aloud to the women too. Mei Lin looser (teases, laughs), but Ashfall's propriety is in her bones. Ya blunt, proud, physical, delighted by danger and speed. Locals overly serious.
- Each line is shown in turn after ANY of these walks, many times per game and every Coil: the Blackroot road and the Drowned Wood ("Climb down into the Drowned Wood", "Get them both to dry ground"), the Ashen Hills, the Old Tree's Heart (indoor moves inside a vast hollow tree: "Go in", "Back up to the hall", "Go straight in. Find the bridge", inside an old wrecked ship), and the road home ("Push on toward the birch ridge", "Down to the river", "Go home"). So: no specific place, terrain, weather, light or time of day ("trees", "river", "dawn", "night" are wrong somewhere); no "again", "first", "last", "this time", "still"; nothing that can only happen once.
- Romance: this is friendship-level (30). Physical but not romantic; no kiss, no innuendo heavier than a raised eyebrow. Fade-to-black limits apply anyway.
- Avoid the canon card's tic list and the six flown lines' own phrases ("instead of" at most twice across all 14 lines; no "high road", "looks bored", "Probably for the best").
- Short: at most about 30 words a line.

## Output

Write to `/tmp/c1/drafts.md`:
1. The 14 lines, one per line, in this exact form so a script can read them: `pool | text` (pool = great / human / yuki / mei / ya), in order.
2. Then "## Notes": at most 5 short notes (anything in the brief that fights the canon, or a line you'd flag). Notes are suggestions only. Keep the file under 4 KB.

Do not edit any repository file. Do not run tests.
