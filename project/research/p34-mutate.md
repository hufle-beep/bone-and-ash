| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | no foe heavy anywhere | caught | 34515 passed, 20 failed |
| F2 | js/core/game.js | dmg 5 no longer heavy | caught | 34519 passed, 16 failed |
| F3 | js/core/game.js | a heavy person postures too | caught | 27359 passed, 3 failed |
| F4 | tests/lib/smartfight.mjs | W2: ground only while stuck | caught | 27358 passed, 4 failed |
| F5 | tests/lib/smartfight.mjs | W1 off | caught | TypeError: Cannot set properties of null (setting 'bladeFormed') |
| F6 | tests/lib/smartfight.mjs | last-resort dart on the ground | caught | 27360 passed, 2 failed |
| F7 | tests/lib/smartfight.mjs | a due big blow answered from the air while grounded | missed |  |
| F8 | tests/lib/smartfight.mjs | the bot writes into the fight | caught | 27361 passed, 1 failed |
| F9 | js/core/game.js | the rot ape tells (TA, closed) | caught | 27361 passed, 1 failed |
| F10 | js/core/faq.js | the FAQ's old act gate | caught | 27361 passed, 1 failed |
| F11 | tests/lib/smartfight.mjs | lands a round before the warning | caught | 27361 passed, 1 failed |

10 caught, 1 missed, 0 not applied (of 11).

## After the fixes

F7 after its test (the grounded big blow): caught. LF-A's F12, F13: caught. The reviewer's R1, R3–R6 against `node tests/tasks.test.mjs --games 20`:

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | tests/lib/smartfight.mjs | latch keyed on g: every later fight of the same game stays grounded | caught | 27367 passed, 1 failed |
| R3 | js/core/game.js | Lu Han and the boar (named in What's new) don't tell | caught | 33803 passed, 2 failed |
| R4 | js/core/news.js | What's new claims the old gate | caught | 27367 passed, 1 failed |
| R5 | tests/lib/smartfight.mjs | Say something on a posture round while a heavy foe's big blow is due (tribute) | caught | 25060 passed, 1 failed |
| R6 | js/core/game.js | prologue people (Lu Han) not heavy, beasts are | caught | 32625 passed, 4 failed |

5 caught, 0 missed, 0 not applied (of 5).

R2 (the Long Forest left out of TP) is what LF-A built: its pins now guard the other way (F12, F13).
