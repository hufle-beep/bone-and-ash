| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | TR: the party block wins over the prologue village's witness block | caught | 4671858 passed, 19 failed |
| F2 | js/story/prologue.js | TR: night and day blocks swapped | caught | 4671857 passed, 20 failed |
| F3 | js/story/prologue.js | TR: the Old Tree gets the camp block (moss, a few steps off) under the climb-out frame | caught | 4671875 passed, 2 failed |
| F4 | js/story/prologue.js | TR tone: Mei Lin reveres him like a villager (only 'bow' is banned) | missed |  |
| F5 | js/story/prologue.js | TR: a time word in the tree block (stars), which shows by day | missed |  |
| F6 | js/story/prologue.js | TR tone: Ya grave and formal, no joke, no 'scholar' | missed |  |
| F7 | js/story/prologue.js | TR: a day word in the night block | missed |  |
| F8 | js/story/prologue.js | TR: a night word in the day block | missed |  |
| F9 | js/story/prologue.js | TR tone: Mei Lin's laugh (looser) lost for a villager's obeisance | missed |  |
| F10 | js/story/act1_fallout.js | L7: the hymn line on every later day of the Coil | caught | 4671876 passed, 1 failed |
| F11 | js/story/act1_fallout.js | L7: a record from an earlier Coil counts | caught | 4671876 passed, 1 failed |
| F12 | js/story/act1_fallout.js | L7: any song played that day counts as the hymn | missed |  |
| F13 | js/story/act1_fallout.js | L7: the hymn line replaces the midday line too | caught | 4671876 passed, 1 failed |
| F14 | js/story/act1_fallout.js | L7 tone: grave locals joking | missed |  |
| F15 | js/story/act1_fallout.js | LL: letters swapped | caught | 4671875 passed, 2 failed |
| F16 | js/story/act1_fallout.js | LL: the letter spends the later 'cannot sense him' reveal (worded so the test's /cannot sense/ misses) | missed |  |
| F17 | js/story/act1_fallout.js | LL tone: the grave head hunter jokes | missed |  |
| F18 | js/story/act1_fallout.js | EN: clauses swapped | caught | 4671873 passed, 4 failed |
| F19 | js/story/act1_fallout.js | LL: the Elder's day off by one (Day 21 is canon) | missed |  |

8 caught, 11 missed, 0 not applied (of 19).


## After RV1 (the 6 not applied adapted to the new code; F8 again after TG5's regex widened)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | TR: the party block wins over the prologue village's witness block | caught | 4671882 passed, 28 failed |
| F2 | js/story/prologue.js | TR: night and day blocks swapped | not applied | find not in the file |
| F3 | js/story/prologue.js | TR: the Old Tree gets the camp block (moss, a few steps off) under the climb-out frame | not applied | find not in the file |
| F4 | js/story/prologue.js | TR tone: Mei Lin reveres him like a villager (only 'bow' is banned) | caught | 4671907 passed, 3 failed |
| F5 | js/story/prologue.js | TR: a time word in the tree block (stars), which shows by day | caught | 4671909 passed, 1 failed |
| F6 | js/story/prologue.js | TR tone: Ya grave and formal, no joke, no 'scholar' | caught | 4671909 passed, 1 failed |
| F7 | js/story/prologue.js | TR: a day word in the night block | caught | 4671909 passed, 1 failed |
| F8 | js/story/prologue.js | TR: a night word in the day block | not applied | find not in the file |
| F9 | js/story/prologue.js | TR tone: Mei Lin's laugh (looser) lost for a villager's obeisance | caught | 4671909 passed, 1 failed |
| F10 | js/story/act1_fallout.js | L7: the hymn line on every later day of the Coil | caught | 4671909 passed, 1 failed |
| F11 | js/story/act1_fallout.js | L7: a record from an earlier Coil counts | caught | 4671909 passed, 1 failed |
| F12 | js/story/act1_fallout.js | L7: any song played that day counts as the hymn | caught | 4671909 passed, 1 failed |
| F13 | js/story/act1_fallout.js | L7: the hymn line replaces the midday line too | not applied | find not in the file |
| F14 | js/story/act1_fallout.js | L7 tone: grave locals joking | caught | 4671909 passed, 1 failed |
| F15 | js/story/act1_fallout.js | LL: letters swapped | caught | 4671906 passed, 4 failed |
| F16 | js/story/act1_fallout.js | LL: the letter spends the later 'cannot sense him' reveal (worded so the test's /cannot sense/ misses) | not applied | find not in the file |
| F17 | js/story/act1_fallout.js | LL tone: the grave head hunter jokes | caught | 4671909 passed, 1 failed |
| F18 | js/story/act1_fallout.js | EN: clauses swapped | not applied | find not in the file |
| F19 | js/story/act1_fallout.js | LL: the Elder's day off by one (Day 21 is canon) | caught | 4671909 passed, 1 failed |

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F2 | js/story/prologue.js | TR: night and day blocks swapped (adapted to RV1) | caught | 4671885 passed, 25 failed |
| F3 | js/story/prologue.js | TR: the Old Tree gets the camp block (moss, a few steps off) under the climb-out frame (adapted to RV1) | caught | 4671908 passed, 2 failed |
| F8 | js/story/prologue.js | TR: a night word in the day block (adapted to RV1) | missed |  |
| F13 | js/story/act1_fallout.js | L7: the hymn line replaces the midday line too (adapted to RV1) | caught | 4671909 passed, 1 failed |
| F16 | js/story/act1_fallout.js | LL: the letter spends the later 'cannot sense him' reveal (worded so the test's /cannot sense/ misses) (adapted to RV1) | caught | 4671908 passed, 2 failed |
| F18 | js/story/act1_fallout.js | EN: clauses swapped (adapted to RV1) | caught | 4671906 passed, 4 failed |

| F8 | js/story/prologue.js | TR: a night word in the day block (adapted to RV1) | caught | 4671909 passed, 1 failed |

Total after RV1: 19 of 19 caught (13 + 5 + 1).
