| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/main.js | the James tab promises 'A bite now keeps X' when a clear keeps nothing new | not applied | find not in the file |
| R2 | js/main.js | the James tab's real bite at a won a1_end no longer counts as a clear (the test calls endCoil itself) | caught | saves: 39 files · 1507 passed, 1 failed |
| R3 | js/core/coil.js | the dawn's Results line loses its plural (3 won clear) | caught | saves: 39 files · 1507 passed, 1 failed |
| R4 | js/core/coil.js | a sealed Foundation snapshot lifted to Core Formation stays colSealed with 66 open | caught | saves: 39 files · 1507 passed, 1 failed |
| R5 | js/core/coil.js | a later clear at a lower realm lowers the cap (KC is the highest) | caught | saves: 39 files · 1507 passed, 1 failed |
| R6 | js/core/coil.js | the Coil's start not refreshed after the lift: the Coil screen counts the kept realm as gained | caught | saves: 39 files · 1507 passed, 1 failed |
| R7 | js/story/coil_scenes.js | an Act 1 rewind lifted to the floor gets no Results line | caught | saves: 39 files · 1507 passed, 1 failed |
| R8 | js/core/coil.js | one Convergence award per collateral (66) instead of per group card (8): the lift's XP far above opening them | caught | saves: 39 files · 1505 passed, 3 failed |
| R9 | js/core/coil.js | XW-a pays XP for Extraordinary collaterals already open | caught | saves: 39 files · 1507 passed, 1 failed |
| R10 | tests/models.test.mjs | --kept counts the second pass's Coils from the game's start | missed |  |
| R11 | js/story/coil_scenes.js | the Coil screen after the first won clear says 'kept from 0 won clears' | caught | saves: 39 files · 1507 passed, 1 failed |

9 caught, 1 missed, 1 not applied (of 11).

After RV1 (2026-11-19): R1's line moved to `coil.js` `keptTabText` with TG3, so R1 is re-planted there as R1b (`ka1-faults-rv1.json`): caught (saves 1507 / 1). R10 is a models-test fault: measured with `node tests/tools.test.mjs`: caught (487 / 1). So 11 of 11 after RV1 (2 of 11 before it).
