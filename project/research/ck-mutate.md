# v0.11.218 (CK1 + RV1): planted faults (`tools/mutate.mjs`, the default command `node tests/story.test.mjs --quick`)

25 of 25 caught after RV1: Claude's `ck-faults.json` 13 (F1–F10 for CK1, F11–F13 for RV1; F8 updated for HA) and the review's `ck-faults-review.json` 12 (R1–R4 and R8–R11 missed before RV1's tests; R5 updated for RV1; R12 dropped: an out-of-range repeat number can no longer reach `cookTexts` since L5, so the fault changes nothing). Before RV1 the review's table read 4 of 13 caught (`ck-review.md`).

## Claude's (13)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/kitchen.js | the long calendar keeps the cook once a Coil | caught | Error: Choice not available |
| F2 | js/story/kitchen.js | the gains on every cook (GA, not G1) | caught | 4654531 passed, 14 failed |
| F3 | js/story/kitchen.js | the same repeat every time | caught | 4654541 passed, 4 failed |
| F4 | js/story/kitchen.js | the card's label always the first cook's | caught | 4654519 passed, 26 failed |
| F5 | js/story/kitchen.js | the old calendar sets the new flags | caught | 4654543 passed, 2 failed |
| F6 | js/core/week.js | the plan's cook rows once, not repeating | caught | 4654539 passed, 6 failed |
| F7 | js/story/common.js | the cook not spaced: daily on the long calendar | caught | 4654535 passed, 10 failed |
| F8 | js/story/kitchen.js | CG keyed on the Coil flag: the routine never waits for a repeat cook, even with the plan's row at 1 | caught | 4654541 passed, 4 failed |
| F9 | js/story/kitchen.js | the scene's text read after enter: the first cook shows a repeat | caught | 4654541 passed, 4 failed |
| F10 | js/story/kitchen.js | an old save that cooked gets the first-time scene again | caught | 4654541 passed, 4 failed |
| F11 | js/story/kitchen.js | RV1 (HA) off: the hold on every repeat day the card is open | caught | 4654529 passed, 16 failed |
| F12 | js/story/kitchen.js | RV1 (M1) off: an old save's repeat 0 can come twice running | caught | 4654543 passed, 2 failed |
| F13 | js/core/week.js | RV1 (HA): the plan's cook row never read: no hold for a planned repeat | caught | 4654541 passed, 4 failed |

## The review's (12)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/story/kitchen_texts.js | a canon-card tic in a repeat scene (textlint's POOLS miss POT_AGAIN; the samples never render a repeat) | caught | 4654544 passed, 1 failed |
| R2 | js/story/kitchen_texts.js | Claude's cut on Fable's P2 reverted (cuts not pinned) | caught | 4654544 passed, 1 failed |
| R3 | js/story/kitchen_texts.js | a meal-time word the CK1 time regex lacks (supper / breakfast / lunch / night) | caught | 4654544 passed, 1 failed |
| R4 | js/story/kitchen_texts.js | speech in a repeat result: the reply splitter / GAIN_LINES never see a repeat result | caught | 4654544 passed, 1 failed |
| R5 | js/story/kitchen.js | the old calendar draws a repeat (a new flag and a g.lines change) | caught | 4654543 passed, 2 failed |
| R6 | js/story/kitchen.js | the hub label from the last cook shown, not the next (label and scene disagree) | caught | 4654519 passed, 26 failed |
| R7 | js/story/kitchen.js | a skipped repeat day still closes the next (the spacing off by one on the day after a cook) | caught | 4654543 passed, 2 failed |
| R8 | js/story/kitchen_texts.js | a meal-time word in a Fallout repeat (the CK1 time regex lacks breakfast / supper / lunch / night) | caught | 4654544 passed, 1 failed |
| R9 | js/story/kitchen_texts.js | a count of days or visits in a repeat (the brief bans it; no test) | caught | 4654544 passed, 1 failed |
| R10 | js/story/kitchen_texts.js | a two-sentence repeat result (the reply splitter leaves a fragment; the test checks only the end) | caught | 4654544 passed, 1 failed |
| R11 | js/story/kitchen_texts.js | canon: a local senses James's cultivation (no canon pin on the repeats) | caught | 4654544 passed, 1 failed |
| R13 | js/story/kitchen.js | the Fallout card spaced by the prologue key while the plan row reads a1_cook (row and card disagree) | caught | 4654544 passed, 1 failed |
