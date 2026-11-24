| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/fight_tune.js | RG from True Core, not Core Formation | caught | 1816607 passed, 6 failed |
| F2 | js/story/fight_tune.js | the boundary: Core Formation itself left out | caught | 1816608 passed, 5 failed |
| F3 | js/story/fight_tune.js | the factor 0.75 | caught | 1831017 passed, 6 failed |
| F4 | js/story/power.js | Yuki's realm decides | caught | 1816612 passed, 1 failed |
| F5 | js/story/fight_tune.js | untuned fights at 0.8 | caught | 1807634 passed, 1 failed |
| F6 | js/story/power.js | the realm never passed: RG dead | caught | 1834406 passed, 4 failed |
| F7 | js/story/music.js | a step's top bound let in (journey.02 at Ya 30) | caught | 1816608 passed, 5 failed |
| C1 | js/story/fight_tune.js | the gate at True Core: a Core Formation James keeps 0.8 (expect caught: P39-A RG, HIGH_REALM === 2 and the realm-2 tap) | caught | 1816607 passed, 6 failed |
| C2 | js/story/fight_tune.js | off by one: realm 2 meets 0.8 (expect caught: P39-A RG, hpTuneFor('collectors', 2) and the tap 14/8>10/6) | caught | 1816608 passed, 5 failed |
| C3 | js/story/power.js | Yuki's realm decides (expect caught: P39-A RG, tap(1, 3) / tap(2, 0)) | caught | 1816612 passed, 1 failed |
| C4 | js/story/power.js | Gao Feng / the disciple left at 0.8, only Lu Han at 0.7 (the news line names both). At the test's fresh state (no growth) Gao 8 is 6 either way; with growth 2 h | caught | 1816612 passed, 1 failed |
| C5 | js/story/fight_tune.js | a missing realm (null) counts as Core Formation (expect caught: P39-A RG, the null case) | caught | 1816612 passed, 1 failed |
| C6 | js/story/music.js | friendship 29 falls between low and mid (expect caught: JW-A, at(29) gives 0) | caught | 1816611 passed, 2 failed |
| C7 | js/story/music.js | Ya present on the journey without the party flag (expect caught: JW-A only, at(26, false); the walks always have her in the party) | caught | 1816611 passed, 2 failed |

14 caught, 0 missed, 0 not applied (of 14).
