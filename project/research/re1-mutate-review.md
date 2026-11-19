| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/core/coil.js | CC: the whole game's rewind (to: 'game') forgets the stops; only the act's rewind is tested | caught | 191806 passed, 2 failed |
| R2 | js/core/week.js | SC: the forecast's dry run ignores the stops counted: it stops for a capped item the real run goes past | caught | 191807 passed, 1 failed |
| R3 | js/core/news.js | NW: the What's new line's number unpinned | caught | 191807 passed, 1 failed |
| R4 | js/core/week.js | SC: Smoke the catch counted with the day's meditation (med:pres not in the items test) | caught | 191807 passed, 1 failed |
| R5 | js/core/week.js | SC: doors never capped (no door walked to its cap in the tests) | caught | 191806 passed, 2 failed |
| R6 | js/core/coil.js | CC: the whole game's rewind forgets the stops, written off the pinned line (R1 caught only by the source pin) | caught | 191807 passed, 1 failed |
| R7 | js/core/week.js | SC: doors never capped, written in readCapOk (R5 caught only by the source pin) | caught | 191807 passed, 1 failed |

7 caught, 0 missed, 0 not applied (of 7).
