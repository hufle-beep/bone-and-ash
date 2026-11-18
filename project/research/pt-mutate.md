| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/tasks.js | CG gone: the routine eats at the pot while the cook can still show | caught | 4654464 passed, 3 failed |
| F2 | js/story/kitchen.js | CG's window ends at 09:00, not 15:00 | caught | 4654465 passed, 2 failed |
| F3 | js/core/tasks.js | the pot tapped by hand: the routine eats first | caught | 4654463 passed, 4 failed |
| F4 | js/core/tasks.js | the pot's meal not marked: a second meal in the same part of the day | missed |  |
| F5 | js/core/week.js | the day off never eats at the pot | caught | 4654463 passed, 4 failed |
| F6 | js/core/week.js | the evening's meal never at the pot | caught | 4654466 passed, 1 failed |
| F7 | js/core/tasks.js | the pot's line without its part of the day | caught | 4654455 passed, 12 failed |
| F8 | js/core/week.js | the day off steps on after a pot meal (past the evening or the next part of the day) | caught | 4654465 passed, 2 failed |
| F9 | js/core/tasks.js | the pot tapped by hand doesn't count as the meal: the next card eats too | caught | 4654465 passed, 2 failed |
| F10 | js/core/tasks.js | the Fallout's pot never the routine's | caught | TypeError: Cannot read properties of null (reading 'slice') |
| R1 | js/core/tasks.js | the routine's pot run without routineBusy (its own routine, the sit, runs inside it) | caught | 4654464 passed, 3 failed |
| R2 | js/core/tasks.js | a card tap's routine never eats at the pot (only the plan's day off and evening) | caught | 4654463 passed, 4 failed |
| R3 | js/story/kitchen.js | CG off at exactly the village's 90 | caught | 4654466 passed, 1 failed |
| R4 | js/story/kitchen.js | CG ignores the cook done this Coil | caught | 4654465 passed, 2 failed |
| R5 | js/core/tasks.js | every card with a result (Rest, Cultivate) counts as the meal | caught | 4654462 passed, 5 failed |
| R6 | js/core/tasks.js | PT1 off still marks a hand-tapped eat card (v0.11.216 not exactly back) | missed |  |
| R7 | js/core/tasks.js | the pot's Yuki / spoil lines of its half hour dropped | caught | 4654466 passed, 1 failed |
| R8 | js/core/tasks.js | an empty hammerspace: no pot meal either | caught | 4654466 passed, 1 failed |
| R9 | js/core/tasks.js | the meal named by the clock after the pot (a 10:40 breakfast reads Midday) | caught | 4654465 passed, 2 failed |
| R10 | js/story/kitchen.js | CG only from 09:00: a 07:00 breakfast takes the pot and the day's cook | caught | 4654466 passed, 1 failed |
| R11 | js/core/week.js | the day off's minutes read before the meal | caught | 4654465 passed, 2 failed |
| R12 | js/core/tasks.js | the routine eats at the pot only below 70 (a stricter threshold than the card's 80) | caught | 4654462 passed, 5 failed |
| R13 | js/core/week.js | M1 back: the day off steps on after a pot breakfast past 11:00 (the midday meal lost) | caught | 4654465 passed, 2 failed |
| R14 | js/core/tasks.js | L2 back: the pot's time closes the card tapped | caught | 4654466 passed, 1 failed |
| R15 | js/core/tasks.js | the Fallout's eat card not the meal | caught | 4654466 passed, 1 failed |
| R16 | js/core/tasks.js | the eat card tapped marks no real part of the day: a second meal after it | caught | 4654462 passed, 5 failed |
| R17 | js/core/tasks.js | L1 back: the meal marked before the tap runs (a skipped tap loses the supper) | caught | 4654466 passed, 1 failed |

25 caught, 2 missed, 0 not applied (of 27).

## After the run (v0.11.217, RV1)

- **R6:** missed above; a test added (PT1 off, no food, the pot tapped by hand marks no part of the day): caught on a rerun of R6 alone (`4654468 passed, 1 failed`).
- **F4:** missed above because it changes nothing since RV1: `runTask` marks the pot's part of the day itself once the card has run (`slot0`), so the routine's own mark is the same mark. Equivalent, so its line went from `pt-faults.json` (as v0.11.215's F27).
- **In all:** 26 faults (`pt-faults.json` 9, `pt-faults-review.json` 17: the review's R1–R12, R2, R5, R6, R8 and R11 updated for RV1's code, R13–R17 new for RV1's fixes): 26 of 26 caught.
