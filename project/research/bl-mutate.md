# Planted faults, v0.11.222 (TS9: J2 + RV2)

`node tools/mutate.mjs <file> --jobs 2` against `node tests/story.test.mjs --quick`, after RV2.

## The builder's (`bl-faults.json`: F1–F13 the build's, F14–F16 RV2's)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/calendar.js | two days a story day, not K3 | caught | 4654621 passed, 17 failed |
| F2 | js/core/calendar.js | the calendar keeps the 5-day road while the camps count three nights | caught | 4654631 passed, 7 failed |
| F3 | js/core/game.js | an old save on the Blackroot's first day gets the camps mid-road | caught | 4654637 passed, 1 failed |
| F4 | js/core/coil.js | a rewind takes the snapshot's calBl (an old save's fill lost) | caught | 4654637 passed, 1 failed |
| F5 | js/core/game.js | new games keep the 5-day road (blFill only on load) | caught | 4654622 passed, 16 failed |
| F6 | js/story/act1_blackroot.js | the last day never comes: no split, no pass, no story night | caught | 2124669 passed, 1934 failed |
| F7 | js/story/act1_blackroot.js | every night a story night (15 night events) | caught | 4654635 passed, 3 failed |
| F8 | js/story/act1_blackroot.js | the split on day 12's first day | caught | 4654637 passed, 1 failed |
| F9 | js/story/act1_blackroot.js | no quiet camps in the wood before the hollow | caught | 4654632 passed, 6 failed |
| F10 | js/story/act1_blackroot.js | four mornings a story day | caught | 4422968 passed, 30 failed |
| F11 | js/story/act1_blackroot.js | two ways on out of the wood (the hills' hub skipping ah_enter) | caught | 4692484 passed, 2 failed |
| F12 | js/core/game.js | old-calendar saves get calBl | caught | 4654637 passed, 1 failed |
| F13 | js/story/act1_blackroot.js | the pass on day 15's first day | caught | 4654636 passed, 2 failed |
| F14 | js/story/act1_blackroot.js | RV2 HD undone: the hollow on any wood day (the review's M1) | caught | 4654637 passed, 1 failed |
| F15 | js/story/act1_blackroot.js | RV2 SQ undone: the ring on quiet nights (the review's L3) | caught | 4654637 passed, 1 failed |
| F16 | js/story/act1_blackroot.js | RV2 SQ: the ring's day key lost | caught | 4654637 passed, 1 failed |

16 caught, 0 missed, 0 not applied (of 16).

## The review's (`bl-faults-review.json`; before RV2: 1 of 8)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/story/act1_blackroot.js | mei_raft on a quiet night in the wood gives a story night (a sixth night event) | caught | 4654638 passed, 1 failed |
| R2 | js/story/act1_blackroot.js | friends_watch on a quiet night in the hills gives a story night | caught | 4654638 passed, 1 failed |
| R3 | js/story/act1_blackroot.js | ya_romance on a quiet night gives a story night | caught | 4654638 passed, 1 failed |
| R4 | js/story/act1_blackroot.js | mei_bond on a quiet night gives a story night | caught | 4654638 passed, 1 failed |
| R5 | js/story/act1_blackroot.js | the fireside's Sit beside Mei Lin on a quiet night gives a story night | caught | 4654637 passed, 2 failed |
| R6 | js/story/act1_blackroot.js | the quiet Root Road morning takes walk mark 3 (bday 5's morning loses it); same labels, same targets | caught | 4654636 passed, 2 failed |
| R7 | js/core/game.js | a Long Forest save whose clock ran past Day 64 gets the 5-day road | caught | 4654637 passed, 1 failed |
| R8 | js/story/act1_blackroot.js | bl_start no longer resets the night count (a leftover bl_n) | missed |  |

7 caught, 1 missed (R8: likely equivalent: a rewind's flags come from the snapshot, Day 44, and `bl_n` is not kept; the review's note), 0 not applied (of 8).
