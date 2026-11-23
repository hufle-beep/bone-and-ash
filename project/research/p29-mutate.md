# P29-A — planted faults (v0.11.261)

Command: `node tests/saves.test.mjs && node tests/story.test.mjs --games 5 --workers 1`, 2 jobs.

## Claude's F1, F2, F4–F7 (`p29-faults.json`; F3 dropped before the run: a no-op control)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | SL: the Saves screen lists an old save's unmoved minutes (no flip) | caught | saves: 39 files · 1525 passed, 63 failed |
| F2 | js/core/game.js | SL: peekSave forgets the act (Act 1 saves listed without 'Act 1') | caught | saves: 39 files · 1569 passed, 19 failed |
| F4 | js/core/replies.js | M4: the hammerspace routine meal split again (name in the reply) | caught | 1328347 passed, 1 failed |
| F5 | js/core/replies.js | M4: the bare pot line back in the reply | caught | 1328347 passed, 1 failed |
| F6 | js/core/replies.js | M4: the pattern unanchored: a prefixed line with speech becomes a whole gain | caught | 1328347 passed, 1 failed |
| F7 | js/core/tasks.js | M4: the routine line's shape drifts from the pattern (split again) | caught | 1328330 passed, 18 failed |

6 caught of 6 (on the build before the review's test gaps).

## The reviewer's C1–C7 (`p29-faults-review.json`)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/game.js | SL: peekSave without force: a save with a checksum mismatch, a newer format or a newer state is listed 'Unreadable' on the Saves and recovery screens, though 'L | caught | saves: 39 files · 1593 passed, 3 failed |
| C2 | js/main.js | SL: descOf drops 'Coil 1' (and with it 'Act 1, Coil 1'): the six v0.8.5 saves are listed with no Coil again, the fix undone on the screen while peekSave stays r | caught | saves: 39 files · 1595 passed, 1 failed |
| C3 | js/main.js | SL: v0.8.5-act1-end (Act 1, Coil 1) listed as plain 'Coil 1', the act lost on the screen. Expected to survive (TG2). | caught | saves: 39 files · 1595 passed, 1 failed |
| C4 | js/core/replies.js | M4: the dot no longer excluded: 'Supper: Stew. Ya says nothing. +3 satiety.' goes whole into the Results, its reply sentence lost from under the scene text. Exp | caught | 1328349 passed, 1 failed |
| C5 | js/core/replies.js | M4: the end anchor gone: a routine meal line with a reply sentence after its stat ('… +30 satiety. Yuki takes the rest.') goes whole into the Results. Expected  | caught | 1328349 passed, 1 failed |
| C6 | js/core/replies.js | M4: the bare pot pattern unanchored: any story or task line ending 'the communal pot.' becomes a whole gain (none in play today). Expected to survive (TG3: no n | caught | 1328349 passed, 1 failed |
| C7 | js/core/replies.js | M4: one-digit meals (river cress +8, needleberries +3) split again: 'Breakfast: river cress.' in the reply. Expected to be caught by TG-A7 (66 meals, every food | caught | 1328349 passed, 1 failed |

7 caught of 7 (after TG1–TG6; the reviewer expected C1–C6 to survive the build as reviewed).
