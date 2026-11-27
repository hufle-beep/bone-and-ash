| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/week.js | a camp's new day keeps yesterday's counts | caught | 1294611 passed, 2 failed |
| F2 | js/core/week.js | the camp plan runs without the day's routine | caught | 1294610 passed, 3 failed |
| F3 | js/core/tasks.js | the routine on hand taps at a camp | caught | 1294610 passed, 3 failed |
| F4 | js/core/week.js | the camp's evening taken by the plan | missed |  |
| F5 | js/core/week.js | a step leaves this week's count alone | caught | 1294605 passed, 8 failed |
| F6 | js/core/week.js | the row shows what is left again | caught | 1294612 passed, 1 failed |
| F7 | js/core/week.js | a camp's door taken goes back to 0 | caught | 1294611 passed, 2 failed |
| F8 | js/core/week.js | a camp's card counted ×7 | caught | 1294612 passed, 1 failed |
| F9 | js/core/week.js | the camp's forecast walks into the night | caught | 1294611 passed, 2 failed |
| F10 | js/core/week.js | no card rows at a camp | caught | TypeError: Cannot read properties of undefined (reading 'id') |
| F11 | js/core/tasks.js | the camp's routine meal cooks on a fire | missed |  |
| F12 | js/main.js | the camp's panel called the week | caught | 1294612 passed, 1 failed |
| C1 | js/core/week.js | a camp's new day keeps yesterday's stop ('evening' shown all next day); expected caught (the next-morning pin p.stop === '') | caught | 1294612 passed, 1 failed |
| C2 | js/core/week.js | the read probe's nested runWeek turns the camp routine off for the rest of a real camp run (meals and sit stop after the first probe); expected MISSED: READ_STO | caught | 1294612 passed, 1 failed |
| C3 | js/core/week.js | a camp door tapped by hand zeroes its plan row again (the plan's own path still keeps it); expected caught (the hand-tap pin: tap === undefined, planCount 1) | caught | 1294611 passed, 2 failed |
| C4 | js/main.js | the minus button greyed on a row kept 0 with some left this week (no way to drop what is left); expected MISSED: main.js rows only source-pinned (TG3) | caught | 1294612 passed, 1 failed |
| C5 | js/core/week.js | a camp's Meditate row always says 'today', even when the forecast stops before it; expected MISSED: only the 'today' case is pinned (TG4) | caught | 1294612 passed, 1 failed |

15 caught, 2 missed, 0 not applied (of 17).

## After the tests for F4 and F11 (P52-A RV)

F4 (the camp's evening with one way on) and F11 (the camp's meal without fire) got their pins in the P52-A block; re-run: **2 caught, 0 missed** (of 2). All 17 caught: Claude's F1–F12 12 of 12, the reviewer's C1–C5 5 of 5 (C2, C4, C5 expected missed, caught after TG2–TG4).
