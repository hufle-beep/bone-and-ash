| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/week.js | nothing kept: every week starts empty (the old start) | caught | 4654570 passed, 19 failed |
| F2 | js/core/week.js | a count set is not kept | caught | TypeError: Cannot read properties of undefined (reading 'wilds') |
| F3 | js/core/week.js | a read tap's countdown changes what is kept (what is left, not as set) | caught | 4654588 passed, 1 failed |
| F4 | js/core/week.js | Clear not kept: Yuki's row back at 1 next week | caught | 4654588 passed, 1 failed |
| F5 | js/core/week.js | a one-off door taken stays 1 in what is kept | caught | 4654585 passed, 4 failed |
| F6 | js/core/coil.js | a rewind drops the kept counts (KS, not KG) | caught | 4654588 passed, 1 failed |
| F7 | js/core/week.js | the screen's counts 0 before the week's plan | caught | 4654587 passed, 2 failed |
| F8 | js/core/week.js | kept card counts not clamped | caught | 4654588 passed, 1 failed |
| F9 | js/core/week.js | a one-off tapped but skipped by the routine: kept 0 for good (RV1, LS) | caught | 4654588 passed, 1 failed |
| F10 | js/core/week.js | Clear with no plan yet does nothing (the kept counts stay) | caught | 4654588 passed, 1 failed |
| F11 | js/core/week.js | an old save's cards lost on its first change | caught | 4654588 passed, 1 failed |
| F12 | js/main.js | the panel shows 0 before the week's plan | caught | 4654588 passed, 1 failed |
| F13 | js/core/week.js | a count changed mid-week keeps what is left (the review's M1, RV1 MK) | caught | 4654586 passed, 3 failed |
| F14 | js/core/week.js | a card set again keeps its old place in the kept order (L1, RV1 LO) | caught | 4654588 passed, 1 failed |
| F15 | js/core/week.js | "Cards 0 m" for a hidden kept card (L2, RV1 LE) | caught | 4654588 passed, 1 failed |
| F16 | js/core/week.js | a hidden kept card makes "Run the week" and Clear (L2, RV1 LE) | caught | 4654588 passed, 1 failed |
| R1 | js/core/week.js | the run's own one-off door taken: kept stays 1 (only the hand and read-tap paths tested) | caught | 4654588 passed, 1 failed |
| R2 | js/core/week.js | (updated for RV1, HB) the kept cook row holds the pot with no plan this week (the review's H1) | caught | 4654588 passed, 1 failed |
| R3 | js/core/week.js | the panel's notes blank before the week's plan (kept counts shown without their forecast or hours) | caught | 4654587 passed, 2 failed |
| R4 | js/core/week.js | a kept door row (closed now) hidden before the week's plan | caught | 4654588 passed, 1 failed |
| R5 | js/core/week.js | the order's places shown from an empty plan before the week's plan | caught | 4654588 passed, 1 failed |
| R6 | js/core/week.js | a place set before the week's plan reads the old empty order | caught | 4654588 passed, 1 failed |
| R7 | js/main.js | (updated for RV1, LE) the button says Rest out the week over kept cards before the week's plan | caught | 4654588 passed, 1 failed |
| R8 | js/core/week.js | drawing the panel saves the week's plan (looking writes the save) | caught | 4654585 passed, 4 failed |

24 caught, 0 missed, 0 not applied (of 24).


After the leftover fix (`planEmptyShown` built on `planEmpty`, no change in behaviour): F16 re-pointed at the new line and run again: caught. 24 of 24.
