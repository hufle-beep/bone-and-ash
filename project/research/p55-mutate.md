| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/story.js | marks and endings also on a rewind's own first scene (skipEnter). Expected caught: A 'not on a rewind's own first scene'. | caught | 64 passed, 1 failed |
| C2 | js/core/story.js | the Coil's own screens never note: 't:lost' (collectors_lost) and 'a:taken' (rt_taken) are only noted at coil_end, so both are lost for good. Expected MISSED (T | caught | 62 passed, 3 failed |
| C3 | js/core/game.js | an old Act 1 save filled with 2 prologue marks, not 3. Expected caught: C 'an old Act 1 save' and 'a load runs the fill'. | caught | 63 passed, 2 failed |
| C4 | js/core/game.js | nightTo (the night's wake, 01:00) drains at the unmarked rate. Expected caught: A 'asleep to 01:00'. | caught | 64 passed, 1 failed |
| C5 | js/core/tasks.js | a card's extra Fed scaled by the marks (the pick keeps it at 1 an hour). Expected MISSED by archive.test (TG2: only the bar's words are tested, no card run with | caught | 64 passed, 1 failed |
| C6 | js/core/archive.js | a foe met 0 times (every meeting yielded or fled, unmeet) listed. Expected caught: D 'met ones, by name, with the count' (wolves 0). | caught | 64 passed, 1 failed |

6 caught, 0 missed, 0 not applied (of 6).
