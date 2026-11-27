# P53 (G3-A) — planted faults (tools/mutate.mjs)

Claude's F1–F10, F14, F15 and the reviewer's C1–C6 against the story test's P52-A and G3-A blocks (made into one file by a scratch script) plus `node tests/appfiles.test.mjs`; F11–F13 against `node tests/appfiles.test.mjs`. F9 was missed at first and caught after its pin (Act 1's new snapshot, taken with a history on).

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | SB-h: HP's realm part counts the body twice | caught | 104 passed, 3 failed |
| F2 | js/core/game.js | SB-h: Convergence's sum leaves out the primaries | caught | 104 passed, 3 failed |
| F3 | js/core/tasks.js | FE-t: the run at the next step timed at today's speed | caught | 105 passed, 2 failed |
| F4 | js/core/week.js | L4-r: the runs made ignored (the P52 L4 back) | caught | 102 passed, 5 failed |
| F5 | js/core/week.js | L4-r: the plan's runs not counted | caught | 106 passed, 1 failed |
| F6 | js/core/coil.js | TL-t: no nights | caught | 104 passed, 3 failed |
| F7 | js/core/coil.js | CH-t: a rewind loses the ending Coil | caught | TypeError: Cannot read properties of undefined (reading 'tl') |
| F8 | js/core/coil.js | CH-t: the list grows without a cap | caught | 106 passed, 1 failed |
| F9 | js/core/game.js | CH-t: the act's snapshot carries the history | missed, then caught after its pin | |
| F10 | js/main.js | OS-a: Save here overwrites a full slot at once | caught | 106 passed, 1 failed |
| F14 | js/core/coil.js | L2-s: a Coil's days from the act's snapshot again | caught | 105 passed, 2 failed |
| F15 | js/core/game.js | L3-w: Fed under 3 reads about 0 h | caught | 106 passed, 1 failed |
| C1 | js/core/week.js | L4-r: a skipped card (the routine went first) stays counted as a run; - then + then leaves one run too few. Expected: probably missed (only caught if the G3-A r | caught | 106 passed, 1 failed |
| C2 | js/core/week.js | L4-r: a read stop tapped by hand no longer counts its run. Expected: missed (no test taps a read stop and reads p.ran). | caught | 105 passed, 2 failed |
| C3 | js/core/week.js | L4-r: a camp's new day keeps yesterday's runs, so - then + on day 2 leaves too few. Expected: missed (no camp-day test of p.ran). | caught | 105 passed, 2 failed |
| C4 | js/core/coil.js | CH-t: the next Coil's kills counted from 0, so it shows every kill of the save. Expected: caught (G3-A asserts h.k0 === g.stats.kills after the rewind, kills 3) | caught | 106 passed, 1 failed |
| C5 | js/core/coil.js | TL-t: a fight at night counted as night. Expected: caught (tl '90,60,60,540' becomes '90,60,0,600'). | caught | 104 passed, 3 failed |
| C6 | js/main.js | OS-a: a save file with a game on loads at once (no Load it / Cancel). Expected: missed by story and appfiles (the source pin matches the rest of the line); only | caught | 106 passed, 1 failed |

17 caught, 1 missed, 0 not applied (of 18).

F11–F13 (app.js): 3 caught of 3.

In all: Claude's 15 of 15 (F9 after its pin), the reviewer's 6 of 6 (C1, C2, C3, C6 expected missed; caught after the review's TG2 and TG3 tests).
