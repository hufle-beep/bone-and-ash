# OC-A — the planted faults (v0.11.259; tools/mutate.mjs, the command: rules, faq, saves, the task test --games 5, the story test --games 5)

Claude's F1–F8 (`oc-a-faults.json`) and the reviewer's C1–C9 (`oc-a-faults-review.json`), run after the review's fixes. C4 did not apply (its line changed with L2); C4b is the same fault on the build's text.

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | OC4 reverted: the tests' default back on the old calendar | caught |   FAIL  fifth award levels up (30 − 25 = 5 over) |
| F2 | js/main.js | OC3: a loaded old save no longer moves to the long calendar | caught |   FAIL  FP1 (main.js, RV1 TG3; v0.11.259 OC-A, OC3): every load goes through checkScene, which moves an old save (no old-calendar key read any more) |
| F3 | js/main.js | OC3: a new game on the old calendar | caught |   FAIL  TS1 (the long calendar): every new game on the long calendar (v0.11.226, FP1: the test switch gone) |
| F4 | js/core/replies.js | K-A reverted for the Fallout's pot line | caught |   FAIL  K-A: the three pot lines with speech are gains, bare and with each meal prefix (9 of 12) |
| F5 | js/core/replies.js | K-A: the midday prefix left out | caught |   FAIL  K-A: the three pot lines with speech are gains, bare and with each meal prefix (11 of 12) |
| F6 | js/core/replies.js | K-A: the pattern unanchored | caught |   FAIL  K-A (TG-A1, TG-A2): the patterns anchored; the prefixes are tasks.js MEAL's three |
| F7 | js/core/calendar.js | the tests' story days read as calendar days | caught |   FAIL  Act 1 starts on Day 44 (story day 8; inAct1), its deadline Day 103, as the FAQ says |
| F8 | js/core/game.js | a re-pinned long-calendar number (the sit ÷4) changes | caught |   FAIL  C1: it stops at the breakthrough point, 95% (96%, sat) |
| C1 | js/core/replies.js | K-A: the ashfall fallback pot line with speech loses its Midday prefix: 'Midday: …"honoured guest"…: +25 satiety.' lands in the reply (expect: K-A's 12-case che | caught |   FAIL  K-A: the three pot lines with speech are gains, bare and with each meal prefix (11 of 12) |
| C2 | js/core/replies.js | K-A: the Fallout pot pattern unanchored: any line that merely contains the pot words (a quoted retelling, a later sentence) is filed whole as a gain; K-A's anch | caught |   FAIL  K-A (TG-A1, TG-A2): the patterns anchored; the prefixes are tasks.js MEAL's three |
| C3 | js/core/tasks.js | K-A: the meal word changes, the GAIN_LINES patterns no longer match the noon pot lines with speech; K-A's own check builds its prefixes by hand, so only the wal | caught |   FAIL  K-A: the three pot lines with speech are gains, bare and with each meal prefix (9 of 12) |
| C4 | js/core/coil.js | A whole-game rewind (Act 1 → the arrival) drops a long-calendar game onto the old calendar (no cal, no calBl): every later day, deadline and week text is the ol | not applied | find not in the file |
| C5 | js/core/game.js | GT1: a relationship gain counts on every calendar day of a story day (3x in a Blackroot day, 7x in a village week). The re-pinned G1 check (tasks test, 'gain ag | caught |   FAIL  G1 (the review's TG-A3): ah_forage:1's Mei Lin gain once a story day: not again the next calendar day of the same camp day |
| C6 | js/story/kitchen.js | The Fallout pot line by the calendar day: on the long calendar (Day 44+) always POT_LINE.fo[2] (the 'You work,' line) from story day 8 | caught |   FAIL  TG-A5: the Fallout's pot line by story day 8 / 9 / 10 (Stew, and a second l \| Stew, and a second l \| Stew, and a second l) |
| C7 | js/story/act1_fallout.js | FX: the Fallout hub's text by the calendar day: on the long calendar story days 8-10 all read the third text. NT1's SETDAY (raw Day 8/9 clocks, story day 2 on t | caught |   FAIL  RV1 (FX): Day 11 shows Day 10's set, not Day 8's |
| C8 | js/core/game.js | The load flip gives an Act 1 save on Day 11 (the road's first day) the 3-day camps; expect the saves test's TG4 boundary and the frozen-reading loop | caught |   FAIL  FP1 (RV1, TG4): an Act 1 save on Day 11 gets calBl 1 (3) |
| C9 | js/core/tasks.js | The routine's hammerspace meal loses its '+N satiety.' gain shape: the whole meal line goes to the reply and Results gets nothing (story test 5671 pins smoked m | caught |   FAIL  VQ1 + FQ1 (every door on the plan, every 3rd day) (TG): spacing off, rest row out: v0.11.210's three runs exactly as v0.11.217 runs them (v0.11.217, PT1 |
| C4b | js/core/coil.js | C4 on the build's text (after L2): a whole-game rewind drops a long game onto the old calendar | caught |   FAIL  FP1 2026-11-07-0307-incremental-bl_camp.txt: plays on 200 steps on the long calendar and still saves |

17 of 17 caught (C4 as C4b).
