# P12 cold review T (texts), v0.11.239: the Fallout supper six (FS8, FS9) and Claude's cuts (D1)

Opus, cold. Read: the briefs, both checklists, the diff, the packet, scene excerpts by grep. I rendered in a scratch copy (`/tmp/rv-t`): story day 8 Days 44–50 in all three forms, story day 9 Days 51–57 with and without Ya, and one game run straight through Days 44–64, so that story day 10 continues day 9's sequence. `packet.mjs --check --games 0` on `p12-drafts-cut.txt`: 18 drafts, the same as the code (compared by key), tic 0, run 0, scene 0, time 2 (both harmless: "tonight" at 19:00, and "last die"). Planted faults: `p12-faults-review-t.json`, run through `tools/mutate.mjs` against `tests/story.test.mjs --quick` with `--jobs 2`, about 18 minutes.

## High
None.

## Medium
**M1: FS9 text 6 ends on the laugh its own choice offers.** The text ends "Mei Lin has begun to laugh, which will not help her. Ya is already half off her stool." Below it on story day 9, Ya at the table, is the label "Laugh. Out loud. Somebody at this table has to." The reply to that label is "Ya laughs with you. Mei Lin tries not to, and loses". The text has just said she is laughing.
Failure scenario: every long-calendar game with Ya, on Day 56 (the sixth night of story day 9's sequence), in every form. On story day 10 the same text shows folded, on Day 62, under the plain labels, and there it reads fine.
Fix (checked with `--check`: 0 runs, 0 tics): "Mei Lin has turned to the stove, shoulders shaking, which will not save her." With this, the label and the reply still fit, and she is still at the stove from the text's first paragraph.

**M2: FS8 text 4 turns showing hands into a nightly custom that the week has just broken.** Claude's RN cut changed Fable's "as they were when Mei Lin was six" to "as they have been since Mei Lin was small". That says hands are inspected at every grace.
- None of the earlier suppers shows it.
- Two nights before (Day 45, old text 2), Mei Lin's right hand has a splinter "that she will let nobody look at". Under a nightly palm inspection, that cannot happen.
- In the human form, old text 2 has Yuki turn that hand over "unasked", and Day 47 has Yuki present her own hands "unasked". That is the same hand beat with the same word, two nights apart.

Failure scenario: every long-calendar game, Day 47, in every form. The human form also gets the echo.
Fix (checked: 0 runs, 0 tics; the time word holds at 19:00): "Tonight the mother has hands shown before the grace, backs and then palms, as she did when Mei Lin was small." This makes it a one-off, which explains the rope burns being found now.

## Low
- **L1: the SC cut's reason does not hold.** The reason given was that "scholar" is Ya's word. But `ashfall.js:214` has Mei Lin quote "Old Wen says a scholar who has lost his way". "A learned man" does no harm, but it drops that callback, the owner was given a wrong reason (checklist v0.11.193 H1), and the test now pins "scholar," as banned from FS8.
- **L2: FS9's three `away` lines cannot be reached.** I found this by reading the code; no bot measured it. On story day 9, `fo_morning` offers only "Look." while Ya is unmet, which leads to `ya_arrives`, then `ya_meets`, which sets `ya_met`. So at most one supper without Ya (an act that starts on story day 9) draws sequence index 0, which is an old line. Indices 3–5 would need three suppers without her. The test reaches them only with a faked flag.
- **L3: "scholar" is becoming a tic in Ya's voice.** It is in all three FS9 texts. Twice it is a one-word sentence before a demand ("Scholar. Tell her it's praise." and "Scholar. Is that their word for bad?"). Old text 3 has "Feed the scholar", so that makes 4 of story day 9's 6 suppers. Each new text also ends on Ya putting a question or a demand to James. Suggest dropping it from FS9 text 6: "Is that their word for bad?" (not run through `--check`).
- **L4: in the human form, the mother bows to Yuki in 3 of story day 8's 6 texts.** These are old text 3 "and bows", FS8 text 4 "bows over them" and FS8 text 6 "bows her head to her". The RN cut ("inclines" became "bows") added the third.
- **L5: two new canon facts, and the necklace.** FS9 text 5's "forty-odd teeth of several species" names boar, marsh cat, Ya's own and a man's. `act1_return.js:380` has "a necklace of wolf teeth", and the gift at `act1_fallout.js:746` snaps a wolf's tooth from it. The two fit together, but "wolf teeth" now reads narrower than the necklace. The man's tooth ("He started it.") and the late husband's jacket are both new facts that are not in `lore.md` or the canon card. If the owner agrees, they should go there. The jacket also sets up the husband's knife in `fo_mei_insists` well.
- **L6: the food does not match the result line.** The result line above the text says "Millet, pickled greens, a sliver of salt pork". FS8 text 5 in the human form "takes more radish", and the cat and great forms sit by a "rice chest". Rice does appear in Ashfall elsewhere (FO_MEI_NEW 9 "counts the rice"), so this is minor.

## Checked, fine
- **Forms.** The cat and the great form speak in italics; the woman speaks aloud. Places hold up: the cat on the shoulder, the rice chest and the sleeve; the great form on the floor and at the table's edge; the woman at the place of honour.
- **Choices.** "Ya. Manners." fits all three FS9 endings, and "Laugh" fits texts 4 and 5.
- **Story day 10.** In a game run straight through, Days 60–62 draw FS9 folded under "Help clear the table." / "Go up to the loft early.". Against `fo_plan`, `fo_price` ("No bowing.", which echoes text 6's bow that was not made) and the knife in `fo_mei_insists`, nothing clashes.
- **`fo_night` after.** Mei Lin's lone laugh in the night follows FS8 text 6 ("laughs properly, which this table has not heard lately") well, and `fo_mother`'s "Her father laughed also" deepens it.
- **The rest.** Each of the six first paragraphs stands alone as a fold reminder. No loft appears (LF). Comparing Fable's drafts with the cuts word by word found no orphaned pronoun. James's mycology (the salve jar, the rot at the ground line) is sound. The tone holds: the mother grave, Mei Lin teasing, Ya feral.

## Test gaps
- **TG-T1: story day 10 continuing day 9's sequence is untested.** The P12-A block builds a fresh game for each week. Two planted faults were missed:
  - RT1 keys the sequence on the story day instead (`fo_supper:${dd}`).
  - RT2 makes story day 10 with Ya at the table draw the `away` lines.
  Add one game run straight through Days 51–63 with `ya_met`: Days 60–62 should equal `FS9[k].t`, under the plain labels.
- **TG-T2: no test checks a label against the text's ending (RT5 missed).** Pin the last paragraph of FS9 text 6 once M1 is fixed (for example, no "laugh" in it).
- **TG-T3: the `away` lines are tested only with a faked flag.** Either add a walk asserting that story day 9's first `fo_morning` forces `ya_meets` before any supper, or mark the lines unreachable (L2).
- **TG-T4: the new canon facts are not pinned (RT6 missed: "He started it." changed to "I started it.").** Pin a word or two once the owner confirms L5.

Planted faults: 6 in all. RT3 (the day-9 label leaking onto story day 10) and RT4 (the cat speaking aloud) were caught. RT1, RT2, RT5 and RT6 were missed.
