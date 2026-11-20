# Cold review T (texts), v0.11.235 P8-A (EVs + EVw) + D1

Read: both briefs, both checklists, the diff, Fable's drafts against `p8-drafts-cut.txt` (word diff), grep excerpts. Rendered in a scratch worktree (`/tmp/rv-t`, HEAD + the diff): supper weeks 1–3 × 7 evenings, the walk weeks 2–3 × 7, each form (cat 0 / tiger 2 / human 7), and one game playing walk, supper and roof on every evening (so the day records run together as in play). Faults: `p8-faults-review-t.json` through `tools/mutate.mjs` (story tests `--quick`): 1 caught, 6 missed.

Holds (checked): order 1–6 and round again (week 1 n6 = text 1; weeks 2–3 one supper sequence, n6 of week 2 = text 1); week 3's walks show each of six once, then the eve's own text; closeness by week holds as written (week 2: sleeve, shoulder, elbow; week 3: arm through, hand on sleeve, no hand held); every first paragraph stands alone; "tomorrow" only in supper:4:4 (week 1, tribute 15+ days off); "tonight" in supper:5:5 is the evening; Yuki's three forms fit their places (stool / behind the table / best seat; shoulder / pads behind / few paces back); the root canon matches `lore.md` (father taken at six, test at seven); no Act 1 knowledge; the mother grave, Mei Lin looser, James deadpan.

## High
None.

## Medium
**M1. The same joke twice on one evening: James's world settles things in writing.** Walk and supper run in step in week 2 (both index n on night n; measured in one game). Week 2 night 3: the walk's 5:4 (collectors who "send letters", "There is a fine", "robbed by post"), then supper 5:4 (the egg goes back "with a note about the hen", "A hen cannot be written to", "Let me write it"). The family is in 4 of the 12 new texts (also walk 5:6 "I'd want that in writing", 6:4 the committee and the claim form) plus the prologue's "Paperwork". Fix (checked, `--check`: tic 0, run 0): supper:5:4's note becomes apologies: *"…the egg would go back with the hen's apologies." ¶ "A hen does not apologise." ¶ "The apologies are for the potter." ¶ "He means rude ones," says Mei Lin. "Let me deliver them."*; and 5:6's last line *"I've owed worse."*

**M2. A brief's prescribed beats in every walk (the v0.11.233/234 class).** The brief said "she laughs into her sleeve, checks who heard": it is now in week 2's texts 3, 4 and 6 (nights 2 and 3 back to back: "checks the field for who might have heard" / "checks the lane for listeners"), week 3's text 3 and the roof's plum wine ("laughs into her sleeve"). The closeness sentence is in all six new walks, three on one shape ("and stays there", "has not drifted out", "Her hand stays where it is"), and 5:4's "her sleeve rides against yours… a fact she leaves entirely unremarked" retells old 5:1's "your sleeves brush, and gives no sign of having noticed" (the brief banned retelling). Fix: 5:6 *She walks close enough that her elbow keeps finding yours.* … *She says it with Old Wen's own face, and keeps it almost to the next stone.* (checked clean; the `{yuki}` sentence kept); give 5:4's closeness a new image or drop it.

**M3. Claude's cut broke a punchline (supper:4:4, week 1's fourth supper).** Fable's "Mei Lin opens her mouth. … Mei Lin shuts it" became "Mei Lin draws breath. … Mei Lin shuts it": "it" has no antecedent now. Fix (checked): *Mei Lin lets the breath go unused and eats her fish…*

## Low
- **L1. Pronoun after the Yuki slot (cooper's wife, tiger and human).** "The mother is somehow also to the left. Then she sees…": "she" reads as the mother. Tiger also splices: "behind the table, it opens one eye, and…". Fix: "Then the cooper's wife sees…".
- **L2. The water forfeit twice.** supper:4:4 "You will fetch the water tomorrow… Both pails." against the later roof's lamp bet "The loser carries the water in the morning. Both buckets." (and its result's "a man with water to carry"). Give the mother another chore.
- **L3. The glasses beat comes before Act 1's.** Mei Lin no longer tries them, but the mother's "They make the room worse" and James's "the glass corrects them" are Act 1's joke and explanation ("the path has moved"; "with them you see what she sees"), which Mei Lin then hears a second time. Accept, or cut the explanation sentence.
- **L4. Echoes from Claude's cuts.** 5:4 "entirely unremarked" + "its entire charm" (was "the whole of its charm"); 5:5 "as is done each autumn" then "Mine did it every autumn" one paragraph on; 5:6 human "in turn entirely straight-faced" (third "entire" in one week's walks; no comma before it).
- **L5. Scarecrow (6:5):** "the only man in Ashfall who may stare at them": "them" (the collectors) is never named in the text.
- **L6. Persimmons (5:6):** after the cuts ("cuts them down", "the mother says" → "she says"), "she says, to the string in her hand" comes after a Mei Lin / Yuki paragraph; whose string reads a beat late.
- **L7. New facts outside `lore.md`:** James's accent in a tonal tongue (5:5; Fable flagged it), the nine boundary stones, the scarecrow and chopstick / shrine-shelf customs, the pear path. Only Mei Lin's root went in. "Your world" (5:4, 6:4) assumes the roof's first night ("Mine's too far to see"); I did not check that a player who never climbs hears it elsewhere (open).
- **L8. Endings:** 5 of week 2's 6 walks end on James's short deadpan line (the brief allowed it; vary one).

## Test gaps (planted, `p8-faults-review-t.json`)
| Fault | What | Result |
|---|---|---|
| T1 | week 3 walk: "her hand in yours" | missed |
| T2 | week 2 walk: "Her arm is through yours" | missed |
| T3 | Claude's cut reverted ("Mei Lin opens her mouth") | missed (textlint logs only "variantWords +1") |
| T4 | "They come tomorrow" in a week 3 walk | missed |
| T5 | tiger form "climbs onto your shoulder" | missed |
| T6 | soot "each spring" | missed |
| T7 | 5:4's first sentence cut (fold opens on "She asks it") | caught |

- **TG-T1** closeness by week: no week 2 text matches arm-through / hand-in-hand; no week 3 text matches a held hand (T1, T2).
- **TG-T2** pin the D1 cuts beyond glasses and soot: "draws breath", no "Mei Lin opens her mouth" in `SUPPER_NEW` (T3).
- **TG-T3** time words in the cycled texts: the test bans day counts but not "tomorrow" or "tonight"; a cycled week 3 text can show at `tributeLeft` 2–7 (T4).
- **TG-T4** Yuki's sentences pinned by their opening words only; pin each whole sentence, or ban "shoulder" in the great and human branches (T5).
- **TG-T5** the season words ("each autumn", persimmons at the new year) unpinned (T6).
- **TG-T6** nothing reads walk and supper on one evening: the two sequences run in step in week 2, so a lint sample of the pairs (walk n + supper n + roof n) would show M1.
