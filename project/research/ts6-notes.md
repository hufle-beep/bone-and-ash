# ===== run F1: Fable's notes =====
# TS6 run F1 notes (suggestions only)

## Could not draft
- **DN4** (`ya_share`, "two nights"): the phrase is not in the ya_share packet (text, labels or results), nor in renders.md or sources.md. No draft written. If the line is a variant the packet doesn't render, send the sentence and it is a one-line fix (likely "night after night" or no count at all).

## Drafted on an assumption (check before the build)
- **DN10** (`rr_hub` lead): the packet shows only the plain "Morning. The root runs ahead…" hub text, and the brief quotes the lead with its middle cut. The draft is a whole new lead of a guessed length (about 45 words), true on all three days (the road "ends soon", never "today"). Any fact from the old middle that I couldn't see is not in it.
- **DN14** (`{since}`): written as if the slot renders like `{days}` ("nine days" / "thirty-seven days"). Both sentences were reworded so the slot never starts a sentence (no capital form needed). If the slot is the bare number, add " days" after it.
- **DN8** "Two camps": true on the long calendar if the hills camp (Days 74–76) and the last camp before the tree (77–79) are two separate camps, as DN12 says. Long only; the old "Two days" stays.
- **DN6** "a fight every few days": I don't know how often the spar actually comes on the long calendar, so the wording is loose on purpose. If it is once per camp, "And a fight at every camp." is closer.
- **DN6 / DN7** "Half a moon": Ya counting in moons is new for her. If that is unwanted: "Two weeks in, maybe more." / "Two weeks in," … "Longer, if I end up carrying one of you."
- **DC17** "A few more sleeps": covers 2–7 days. Same caveat, a new counting habit for Ya.
- **DN12-2** mentions the wyrm, on the strength of the story morning's "Wyrm country today". It shows only after that line, so it should be safe.
- **DN13-fire3** leans on the second camp text ("Mei Lin has hung the wet things up"); it reads fine without it. Ya takes her jacket off in it; cut "pulls off her wet jacket and" → "takes the wet wrap off her spear arm and" if that is too much for the scene.

## Counts of fifty and more
- "Fifty-nine days" reads fine from Old Wen, Old Hu and the mother (grave people counting aloud), and in the narration of fo_elder_named. Mei Lin's "Fifty-six days," to the roots also holds: she is angry, and the exact number is the joke. The label "Then we use the fifty-nine days." is a little long but still one line; a slotless fallback is "Then we use every one of them."
- **DC15**: "Day fifty-one. Fifty-two days to the Elder." and "Day sixty-five. Thirty-eight days to the Elder." read fine. Near the middle the two numbers come close to each other (Day 51 / 52 days), which looks like a typo for one day only; no fix needed.
- **DC13**: "on the hundred and third day" is heavy but in register for a Sect scroll and for the envoy.

## Lines near these items that still count wrong (not in the brief; open)
- LETTER `paid`: "On the twenty-first he comes here" and LETTER `lostUnseen` / `lost`: "on the twenty-first day". Same `{elderDay}` fix as DC13 ("On {elderDay} he comes here").
- `morning`, forest story day 3: "Tonight, you suspect, the hurry arrives." shows on all of Days 15–21, but the jackals come once.
- `bl_morning` 5: "The last morning before the tree." now shows on the first of three mornings at that camp. 4: "At first light you leave the Drowned Wood" is fine (first morning only).
- `lf_enter` ¶4: "this week has already shown that it comes round again": the loop is 43 days on the long calendar.
- `supper_roof` and `supper` (story day 5): after the new openers, "This time she brings the plum wine" and "Tonight she talks" repeat on every night of the week if the scene can be taken more than once.
- `ashfall` [11] leads to `mei_walk`: "The last sunset before the tribute." Probably needs a NOT-EVE version.
- `supper` [3] label: "Tomorrow will want everything you have." on story day 4 (15–21 days out).
- `fo_ashfall` hub and the fo_morning packet show digits ("13 days until the Elder", "Day 8. 13 days"), the renders show words; presumably code, not text.
- `rt_evening`: "Nobody mentions tomorrow." is fine (the road home keeps one day).
- `heart_camp` [2] result: "how many days she tracked you … All of them, it turns out." Already count-free; it agrees with DN1 ("All of them.").

## Word choices worth a glance in the checks
- "night after night" is used once (DN1); "weeks" carries DN1-label, DN5-b, DN5-label, DN19.
- "The last week." opens DC9; DC10 has "the last week on the slopes"; DC18 uses "The last days in Ashfall." to keep the two village weeks apart.
- DC11-mother and DC11-burned share "because the Sect is coming to walk past it, and a … is not left to the last day" on purpose (they are alternatives, as the old pair shared their clause).

# ===== run F2: Fable's notes =====
# F2 notes (suggestions only)

## Things the builder should check
- **`supperPot(g)` (V-fo9A, V-fo9B).** I could not see what it returns. Both texts keep the old lead-in's grammar ("Your bowl she ... past the line, ${supperPot(g)}") so the tail still completes the sentence, with "fills" changed to "heaps" to break the reused run. If the tail depends on the verb "fills", change it back.
- **`mei_walk` result line on story day 6's earlier sunsets (V-walk6A, V-walk6B).** The unchanged result says "She does not let go at the door, either ... your hand in hers ... 'Tomorrow, whatever happens'". So both drafts end with her holding on (your sleeve in A, her arm through yours in B), which keeps "does not let go" true. "Tomorrow" in that result is still false before the eve, and her taking the sleeve or arm earlier slightly softens the eve's hand-taking. Open for the builder: the result line is outside this brief.
- **Ya on earlier evenings (V-fo9A, V-fo9B).** Neither text says "again" or assumes she came the night before, in case `yaHere(g)` turns true mid-week. Both end on a Ya remark that the two day-9 labels ("Ya. Manners." / "Laugh. Out loud.") can answer; in B Mei Lin only "studies her tea", so the laugh result ("Mei Lin tries not to, and loses") still lands.
- **`fo_night` says "There is no palisade yet".** V-fo8A/B stay with timber, pegged counts and post holes; nothing stands.

## Small inventions (not in the card or the packets)
- V-walk5B: the men sweep the road for the collectors before the tribute.
- V-sup4A: garlic in the mother's store. V-sup4B: the house's share for the post is "two sacks", weighed on a steelyard; the contents are left unnamed, since I could not confirm what the tribute is made of.
- V-sup5A: Mei Lin's "He told me" about glowing mushrooms assumes only that the two have talked. V-sup5B: James cooks the same millet, greens and fish (it matches the satiety line); "Twenty-six years" is Mei Lin's age from the card.
- V-fo8A (great form): Yuki dragged four trunks down from the ridge. V-fo8A: Mei Lin has a splinter in her right hand.
- V-fo9A: Ya brings an unskinned hare. V-fo9B: Ya comes in by the window with her spear.

## Kept clear of
- No day counts, no "tomorrow", no "last" in the walk texts; no "yesterday" either, since a walk or supper can be skipped.
- V-sup5A/B do not mention the herb loft (it may have burned) or Gao Feng and Pock-Face, and open without "Second" or "Third".
- The beats are leaned on, not retold: "she has not raised the post again", "the night of the empty box", "the night she told you of the letter", "the count".
- Form order is cat / great / human throughout; Yuki's bond speech is in italics in the cat and great forms and aloud only in the human form.

## Lengths
Roughly within ±25% of the old texts. The longest against its original are V-walk5B and V-fo8B (near the upper edge); V-sup5B has five short paragraphs against the old four, because the closing exchange needed its own line.

# ===== run F3: Fable's notes =====
# F3 notes (suggestions only)

- **Watch paragraph:** the six new night texts carry one watch line each, with no `forest_day` split (they never show on the first night). None says "Another night in the wilds".
- **V-night2A "the neighbour":** leans on the old second text's large thing walking a round of the rise. If the list order puts 2A straight after the old third text ("nothing walks a circle round the rise"), it still reads, but 2A is best placed away from a night that ends in `night_attack`, if the order can be chosen.
- **V-night2B music:** the omnitool plays "a quiet piece from home", no title, so no `{ref:id}` slot is needed. In the no-fire branch the music still plays; say if it should be fire-only.
- **V-night2A lab coat:** James hangs the coat on a branch at camp. If any art or later line needs him in it at night, cut that clause.
- **V-night3A:** Yuki speaks (bond italics for cat and great, aloud for human); the byForm strings there are whole sentences in backticks because of the apostrophes, as in the old third text. V-night3B has her "half asleep", not asleep, so "Yuki: change form." still follows.
- **Small inventions to check against lore:** clicking animals in the trees (1A, 3A); a many-part call (1B); Mei Lin asking James's word for a root and his coat being how she finds him (mei-A, mei-B); Mei Lin giving Ya a foot salve (ya-B, throuple line only).
- **Places:** the Mei Lin and Ya texts name no root, water or ash, so they fit all three hubs (root road, drowned wood, ashen hills).
- **Quotes:** every inner string in single quotes is free of apostrophes; "I've stopped asking" (mei-A) sits in the outer template literal.
- **Yuki in the walks:** left out of all four settled talks, so no form split is needed there.

