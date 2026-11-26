# P50-A planted faults (tools/mutate.mjs, against `node tests/story.test.mjs --games 2 --workers 1`)

## Claude's F1–F10 (before the review's fixes)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | the flag set by any first flight, not only Ashfall's | caught | 1294481 passed, 3 failed |
| F2 | js/story/prologue.js | Wen's rung keeps 'Foundation' after the flight | caught | 1294483 passed, 1 failed |
| F3 | js/story/prologue.js | the fungus return reads the sky, not the flight | caught | 1294482 passed, 2 failed |
| F4 | js/story/prologue.js | Lu Han's report without the flight | caught | 1294483 passed, 1 failed |
| F5 | js/story/prologue.js | the collectors' line still calls him a mortal | caught | 1294483 passed, 1 failed |
| F6 | js/story/ashfall.js | the realm lesson inverted | caught | 1294482 passed, 2 failed |
| F7 | js/story/act1_return.js | rt_wen shows the wrong line | caught | 1294481 passed, 3 failed |
| F8 | js/core/coil.js | the flag kept over a rewind (the village remembers) | caught | 1294483 passed, 1 failed |
| F9 | js/story/act1_fallout.js | the tea reads the sky, not the flight | caught | 1294478 passed, 6 failed |
| F10 | js/story/prologue.js | the village flight's opening changed | caught | 1294481 passed, 3 failed |

10 caught, 0 missed, 0 not applied (of 10).

## The reviewer's C1–C6 (after RV's fixes and TG1–TG4; C2 re-aimed at Shen Qiu's rewritten line)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/story/prologue.js | M1/TG1: a time word in the village's first flight; FC's regex (story.test.mjs:8565) misses compounds. Expect MISSED. | caught | 1294505 passed, 3 failed |
| C2 | js/story/flight_texts.js | TG2: a canon break (a Foundation disciple flying) in FW2.shen; the tests compare FW2 with itself. Expect MISSED. | caught | 1294507 passed, 1 failed |
| C3 | js/story/flight_texts.js | TG2: rt_wen reads 'after it.. He will want' / 'after it., and of the disciples'; the join tests build their string from FW2.wen. Expect MISSED. | caught | 1294505 passed, 3 failed |
| C4 | js/story/prologue.js | TG3: an Act 1 Ashfall flight no longer sets the flag; FL's fo_ashfall/rt_ashfall cases run on a fresh game (coil.act 0). Expect MISSED. | caught | 1294507 passed, 1 failed |
| C5 | js/story/prologue.js | the party's flight in the Blackroot sets the village flag. Expect CAUGHT (P50-A FL, rr_hub). | caught | 1294507 passed, 1 failed |
| C6 | js/story/act1_fallout.js | TG4: an Act 1-only flight (a1_sky_seen, no sky_witness) loses the tea's flight words; only rt_arrive/rt_elder are tested for that state. Expect MISSED. | caught | 1294507 passed, 1 failed |

6 caught, 0 missed, 0 not applied (of 6).
