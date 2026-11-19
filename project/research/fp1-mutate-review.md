| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/main.js | MV: a save file loaded by Import skips the flip (8 checkScene(deserialize( left, the pin asks >= 8) | caught | saves: 39 files · 1409 passed, 1 failed |
| R2 | js/main.js | MV: Restore all opens the file's autosave unmoved | caught | saves: 39 files · 1409 passed, 1 failed |
| R3 | js/core/game.js | MV: an Act 1 save on Day 10 (the Fallout's last) gets the 5-day road | caught | saves: 39 files · 1409 passed, 1 failed |
| R4 | js/core/game.js | DK: foundation_day not moved (never read: a harmless fault, a pin gap) | caught | saves: 39 files · 1392 passed, 18 failed |
| R5 | js/core/news.js | NW: the What's new line's example day wrong | caught | saves: 39 files · 1409 passed, 1 failed |
| R6 | js/core/game.js | MV: the rewind point's Blackroot from act 0 (no effect: rewind keeps g.calBl) | caught | saves: 39 files · 1409 passed, 1 failed |

6 caught, 0 missed, 0 not applied (of 6).
