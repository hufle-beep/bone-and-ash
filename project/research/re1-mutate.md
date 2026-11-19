| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/week.js | SC: the cap off by one | caught | 191807 passed, 1 failed |
| F2 | js/core/week.js | SC: the sit and gathering Qi count apart from the sessions | caught | 191806 passed, 2 failed |
| F3 | js/core/week.js | SC: the carried week's work counts apart from its card | caught | 191807 passed, 1 failed |
| F4 | js/core/week.js | SC: run again without the tap: the stop still pending refused at the cap | caught | Error: Not a task hub: night |
| F5 | js/core/week.js | SC: run again without the tap counts as a new stop | caught | 191805 passed, 3 failed |
| F6 | js/core/week.js | SC: no cap at all | caught | 191803 passed, 5 failed |
| F7 | js/core/week.js | SC: the stops never counted | caught | TypeError: Cannot read properties of undefined (reading 'med') |
| F8 | js/core/coil.js | CC: a rewind forgets the stops (the snapshot's taken) | caught | 191804 passed, 4 failed |
| F9 | js/core/game.js | CC: the snapshot holds the stops | caught | 191807 passed, 1 failed |
| F10 | js/core/week.js | SC: a stop known by its exact line, numbers counted (paraKey not imported: a crash) | caught | ReferenceError: paraKey is not defined |
| F11 | js/core/faq.js | NW: the FAQ says a Coil | caught | 191807 passed, 1 failed |
| F12 | js/core/week.js | SC: a broken record (an array) kept: the stops lost on save | caught | 191807 passed, 1 failed |
| F13 | js/core/week.js | RV1 L3a: the stop's line stays pending after its tap | caught | 191807 passed, 1 failed |
| F14 | js/core/week.js | RV1 L3a: the pending line never kept: a run again without the tap counts a new stop | caught | Error: Not a task hub: night |

14 caught, 0 missed, 0 not applied (of 14).
