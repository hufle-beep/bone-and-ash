| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | GT1: Ya's gains repeat every day | caught | TypeError: Cannot read properties of undefined (reading 'k') |
| F2 | js/core/game.js | GT1: a scene's second gain the same day is lost | caught | 192323 passed, 2 failed |
| F3 | js/core/game.js | GT1: the old calendar gets the rule (one day a story day: no change in effect, but a record) | caught | 192324 passed, 1 failed |
| F4 | js/core/game.js | GT1: a loss in a blocked gain is dropped too | caught | 192324 passed, 1 failed |
| F5 | js/core/game.js | GT1: the snapshot carries the record | caught | 192324 passed, 1 failed |
| F6 | js/story/romance.js | TB: a beat shows on every carrier, not once | caught | 192319 passed, 6 failed |
| F7 | js/story/romance.js | TB: a beat sticks to every later visit | caught | 192312 passed, 13 failed |
| F8 | js/story/romance.js | RL: more than once a Coil | caught | 192324 passed, 1 failed |
| F9 | js/core/coil.js | RL: the record moves to the latest Coil | caught | 192324 passed, 1 failed |
| F10 | js/story/romance.js | AL: offered with nobody | caught | 190950 passed, 3 failed |
| F11 | js/story/romance.js | TB: Ya's night beat before she is met | caught | 192324 passed, 1 failed |
| F12 | js/story/romance.js | RL: always the first line | caught | 192324 passed, 1 failed |
| F13 | js/story/romance.js | RV-A (T H1): a first-move beat after the romance | caught | 192324 passed, 1 failed |
| F14 | js/story/romance.js | RV-A (T M3): a beat under a camp text with Ya away | caught | 192322 passed, 3 failed |
| F15 | js/story/romance.js | RV-A (C M1 + L1): two beats a day, one lost unseen | caught | 192324 passed, 1 failed |
| F16 | js/core/game.js | RV-A (C M2): Act 1 drops the record | caught | 192324 passed, 1 failed |
| F17 | js/core/game.js | RV-A (C M3): GT1 keyed by the scene again | caught | 192318 passed, 7 failed |
| F18 | js/core/game.js | RV-A (C L2): the day from midnight | caught | 192324 passed, 1 failed |
| F19 | js/core/game.js | RV-A (C L3): a pinned result overwrites a later week | caught | 192324 passed, 1 failed |
| F20 | js/story/romance.js | RV-A (T L1): a supper beat in the tribute's week | caught | 192324 passed, 1 failed |
| R1 | js/core/game.js | GT1: friendship gains never capped (only affection) | caught | 192324 passed, 1 failed |
| R2 | js/story/romance.js | TB/RL: the mark runs before the carrier's own enter (its gains and flags not yet applied) | caught | 192322 passed, 3 failed |
| R3 | js/core/coil.js | RL: only the affection at the Coil's end counts, not the Coil's peak | caught | 192324 passed, 1 failed |
| R4 | js/story/romance.js | TB: a tier exactly at its bar (30, 45, 72) gets no beat | caught | 192323 passed, 2 failed |

24 caught, 0 missed, 0 not applied (of 24).
