| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | MV: a day late (the week's second day) | caught | saves: 39 files · 1218 passed, 192 failed |
| F2 | js/core/game.js | MV: the hour not kept (06:00) | caught | saves: 39 files · 1337 passed, 73 failed |
| F3 | js/core/game.js | MV (RV1 H1): a night save starts the week with no nights slept | caught | saves: 39 files · 1405 passed, 5 failed |
| F4 | js/core/game.js | MV: a save in or past the Blackroot gets its camps | caught | saves: 39 files · 1393 passed, 17 failed |
| F5 | js/core/game.js | DK: the old marks stay too | caught | saves: 39 files · 1386 passed, 24 failed |
| F6 | js/core/game.js | DK: renamed one by one: key@4 → key@22 overwrites key@22 before it moves | caught | saves: 39 files · 1407 passed, 3 failed |
| F7 | js/core/game.js | DK (RV1 M1): a night save's evening marks to the week's first day | caught | saves: 39 files · 1409 passed, 1 failed |
| F8 | js/core/game.js | DK: the guardian's day not moved | caught | saves: 39 files · 1392 passed, 18 failed |
| F9 | js/core/game.js | MV: the rewind point left on the old calendar | caught | saves: 39 files · 1329 passed, 81 failed |
| F10 | js/core/game.js | MV: says it moved a long save | caught | saves: 39 files · 1371 passed, 39 failed |
| F11 | js/main.js | MV: a player's old save not moved | caught | saves: 39 files · 1409 passed, 1 failed |
| F12 | js/main.js | NG: a new game on the old calendar | caught | 4654719 passed, 1 failed |
| F13 | js/main.js | NG: New game on the old calendar (Begin still long) | caught | 4654719 passed, 1 failed |
| F14 | js/core/game.js | DK: a mark of day 0 moves to day 1 | caught | saves: 39 files · 1409 passed, 1 failed |
| F15 | js/core/game.js | L2: the Saves screen shows the old day | caught | saves: 39 files · 1382 passed, 28 failed |
| F16 | js/main.js | L2: descOf without the move | caught | saves: 39 files · 1409 passed, 1 failed |
| F17 | js/core/game.js | H1: a save at 03:00–03:59 not a night | missed |  |
| F18 | js/core/news.js | NW: What's new's Elder day wrong | caught | saves: 39 files · 1409 passed, 1 failed |

17 caught, 1 missed, 0 not applied (of 18).

**After RV1 (TG1–TG6 and the night boundary test):** F17 run again alone against `node tests/saves.test.mjs`: caught (1 of 1). So: 18 of 18. The review's six (`fp1-faults-review.json`): 6 of 6 caught (`fp1-mutate-review.md`).
