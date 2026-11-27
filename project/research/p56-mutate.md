| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/coil.js | the rewind forgets to keep the Coil's finds | caught | TypeError: Cannot read properties of undefined (reading 'line') |
| F2 | js/core/coil.js | endCoil adds the finds again: Not yet gets them this Coil | caught | 120 passed, 5 failed |
| F3 | js/core/game.js | 10% not 15% | caught | 103 passed, 22 failed |
| F4 | js/core/game.js | no 50% cap | caught | 122 passed, 3 failed |
| F5 | js/core/game.js | the fight round ignores the blow Insights | caught | 123 passed, 2 failed |
| F6 | js/core/game.js | a repeated known entry counts twice | caught | 124 passed, 1 failed |
| F7 | js/core/game.js | sits read the XP kind | caught | 123 passed, 2 failed |
| F8 | js/core/archive.js | this Coil's finds shown as counting | caught | 124 passed, 1 failed |
| F9 | js/core/coil.js | the Coil screen never notes new finds | caught | 122 passed, 3 failed |
| F10 | js/core/game.js | XP Insights do nothing | caught | 122 passed, 3 failed |
| F11 | js/core/game.js | HP not kept in tenths (L4) | caught | 124 passed, 1 failed |
| F12 | js/core/archive.js | the total shown with no marks (L2) | caught | 124 passed, 1 failed |

12 caught, 0 missed, 0 not applied (of 12).

## The reviewer's faults (p56-faults-review.json), after TG1–TG5
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/coil.js | the rewind no longer remembers this Coil's finds: no Insight ever gains power (WH-n's push lost). Expect caught (B, H after the rewind). | caught | TypeError: Cannot read properties of undefined (reading 'line') |
| C2 | js/core/coil.js | WH-n reverted: endCoil remembers again, so "Not yet" goes back into a Coil whose own finds count. Expect caught (B known.length 0, H on the Coil screen). | caught | 120 passed, 5 failed |
| C3 | js/core/game.js | a big blow skips the blow Insights (the source pin on the insightBlow line still matches; no fight is walked). Expect missed (TG1). | caught | 124 passed, 1 failed |
| C4 | js/core/game.js | crossing into Act 1 forgets every Insight, so Act 1's first Coil plays with none. Expect missed by archive.test (TG2). | caught | 123 passed, 2 failed |
| C5 | js/core/coil.js | the Coil screen calls remembered Insights new this Coil. Expect caught (H: nothing new, no note; fresh === 2). | caught | 122 passed, 3 failed |
| C6 | js/core/archive.js | the Archive shows this Coil's finds as counting now (no dim, no 'counts from the next Coil'). Expect caught (H: the view). | caught | 124 passed, 1 failed |

6 caught, 0 missed, 0 not applied (of 6).

## M1-u's faults
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F13 | js/story/act1_blackroot.js | the root misses the sit Insights (M1) | caught | 127 passed, 1 failed |
| F14 | js/story/longforest.js | the seclusion misses the sit Insights (M1) | caught | 127 passed, 1 failed |

2 caught, 0 missed, 0 not applied (of 2).
