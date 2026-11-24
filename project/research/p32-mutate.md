# P32-A + RV-A — planted faults (v0.11.264)

Command: `node tools/mutate.mjs <Claude's F1–F11 + the reviewer's R1–R7> --cmd "node tests/_p32.mjs && node tests/saves.test.mjs" --jobs 2`, where `tests/_p32.mjs` (a scratch file, not committed) runs the story test's P32-A block alone, without the Heart's code pin (P6A TG1), so a Heart fault counts as caught only when a behaviour test catches it (the review's note). On the build with the review's fixes and test gaps (RV-A: TG1–TG6).

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | L2: the flip's night to 04:00 again (an old save at 04:00–04:59 on the day's state); caught by saves FP1 (H1 at 4:00 / 4:59, P32-A TG3) | caught | saves: 39 files · 1597 passed, 4 failed |
| F2 | js/story/prologue.js | L3b: the epilogue's day from midnight (Act 1 on Day 45 from Day 44 00:30); caught by story P32-A (L3b) | caught | 12 passed, 1 failed |
| F3 | js/story/act1_heart.js | L3c: the Heart's day keys from midnight; caught by story P32-A (L3c) | caught | 10 passed, 3 failed |
| F4 | js/core/week.js | L3c: the plan's spring row by the midnight day; caught by story P32-A (L3c, week.js) | caught | 12 passed, 1 failed |
| F5 | js/core/calendar.js | clockDay turns at 04:00 (an hour before the one clock); caught by story P32-A's first assert and L3b at 04:30 | caught | 9 passed, 4 failed |
| F6 | js/story/oneoff.js | P31's F6 again: Call it a day from 04:00; equivalent (at 04:xx every evening hub already offers its evening way, exitAt false: 0 of 7,040 forced hub screens sho | missed |  |
| F7 | js/core/week.js | P31's F7 again: a spaced card's 'opens Day N' by 04:00; caught by story P32-A (F7) | caught | 12 passed, 1 failed |
| F8 | js/story/act1_fallout.js | P31's R6 again: fo_depart back up to an hour inside its step, the end minute the same; caught by story P32-A (R6) | caught | 12 passed, 1 failed |
| F9 | js/story/prologue.js | RV-A H1: the epilogue's enter by the midnight day again (back from 23:00, Act 1 on Day 45 from 00:30); caught by story P32-A (L3b, RV-A TG1) | caught | 12 passed, 1 failed |
| F10 | js/core/game.js | RV-A M1: the flip leaves `slept` alone (the jump sets it to the moved day: the first sleep after a night move doesn't count); caught by saves FP1 (RV-A TG3) | missed |  |
| F11 | js/core/game.js | RV-A H2: the count by the old 04:00 turn at 04:00–04:59 (one day short); caught by saves FP1 (RV-A TG2) | caught | saves: 39 files · 1599 passed, 2 failed |
| R1 | js/story/act1_heart.js | L3c: the guardian's door reads the midnight day again (late phase: lost at 23:50, the door back at 00:00, not 05:00). Expected to be caught by the Heart's code  | caught | 12 passed, 1 failed |
| R2 | js/story/act1_heart.js | L3c: Ya's talk written under the midnight day while its show reads hday (a talk at 00:30 marks the next day: the next evening's talk lost). Expected to be caugh | caught | 12 passed, 1 failed |
| R3 | js/story/act1_heart.js | L3c: the spring's key by the midnight day. Expected to be caught by story P32-A (L3c, the spring at s16 + 2 04:30) and the code pin | missed |  |
| R4 | js/core/week.js | L3c (week.js): half the change reverted: the spring row's next compared with the midnight day, so 'opens Day N' vanishes at 00:00-04:59 of the night before. Exp | caught | 12 passed, 1 failed |
| R5 | js/core/game.js | L2: an old save at exactly 05:00 taken as the night (cal_night 6, marks on calEnd(d - 1)). Expected to be caught by saves FP1 (the hour table's [300, 0], P32-A  | caught | saves: 39 files · 1597 passed, 4 failed |
| R6 | js/story/act1_heart.js | L3c: the way round the guardian by the midnight day (before the late phase: lost at 14:00, the crawl gone at 00:00 instead of 05:00). Expected to be caught by t | caught | 12 passed, 1 failed |
| R7 | js/story/act1_heart.js | L3c: Mei Lin's talk shown by the midnight day (the last night's camp after midnight open again). Expected to be caught by story P32-A (L3c: mei[2] at e18 + 1 00 | caught | 12 passed, 1 failed |

15 caught, 3 missed, 0 not applied (of 18).

Survivors, each an equivalent change (no state the game reaches tells it apart): **F6** (P31's F6, "Call it a day" from 04:00: at 04:xx every evening hub already offers its evening way, so `exitAt` is false; 0 of 7,040 forced hub screens show it, `p32-measure.md`); **F10** (the flip without `slept`: with `lastX` set to the moved day there is no jump, so the old, lower `slept` stays and the first sleep counts as it should); **R3** (the spring's key by the midnight day: the spring is offered 06:00–18:00 only, where both days are the same). The first run, before RV-A (F1–F8 on the block and the saves test): 7 of 8 caught, F6 the survivor.
