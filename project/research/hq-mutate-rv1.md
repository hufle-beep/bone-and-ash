| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | GV: stale bt_return (no yuki_return check) | not applied | find not in the file |
| F2 | js/story/prologue.js | GV in Act 1's Ashfall too | caught | 4672709 passed, 2 failed |
| F3 | js/story/prologue.js | GV on the human form too | caught | 4672710 passed, 1 failed |
| F4 | js/story/prologue.js | HA: the Old Tree (T) reads M | caught | 4672710 passed, 1 failed |
| F5 | js/story/prologue.js | HQ on a later Coil's question too | caught | 4672710 passed, 1 failed |
| F6 | js/story/prologue.js | HQ after the question, not before | caught | 4672705 passed, 6 failed |
| F7 | js/story/prologue.js | HQ-P text changed | caught | 4672710 passed, 1 failed |
| F8 | js/story/prologue.js | C1 reverted | caught | 4672710 passed, 1 failed |
| F9 | js/story/prologue.js | C2 reverted | caught | 4672710 passed, 1 failed |
| F10 | js/story/prologue.js | GV: a time word outside the test's list | caught | 4672710 passed, 1 failed |
| F11 | js/story/prologue.js | HA-P: an unpinned beat changed | caught | 4672710 passed, 1 failed |
| F12 | js/story/prologue.js | HQ-M: a shape word (her shape varies) | caught | 4672709 passed, 2 failed |
| F13 | js/story/prologue.js | G1 bow reverted to Fable's | caught | 4672710 passed, 1 failed |
| F14 | js/story/prologue.js | HA: "everyone" lost with the women | caught | 4672704 passed, 7 failed |
| F15 | js/story/prologue.js | HA-M: the request no longer matches "Promise. No occasion." | caught | 4672710 passed, 1 failed |
| F16 | js/story/prologue.js | HQ-P: a time word outside the test's list | caught | 4672709 passed, 2 failed |
| F17 | tools/textlint.mjs | ASK_WOMEN dropped from the textlint pool | caught | 4672710 passed, 1 failed |
| F18 | js/story/prologue.js | HQ-M: Ya (away) named | caught | 4672710 passed, 1 failed |
| R1 | js/story/prologue.js | M1 reverted: 'She' after HQ | caught | 4672705 passed, 6 failed |
| R2 | js/story/prologue.js | M2 reverted: HQ-M opens on a look | caught | 4672710 passed, 1 failed |
| R3 | js/story/prologue.js | L3 reverted: GV after an own closer | caught | 4672707 passed, 4 failed |
| R4 | js/story/prologue.js | HQ-P a shape word | caught | 4672709 passed, 2 failed |
| R5 | js/story/prologue.js | GV a time word | caught | 4672710 passed, 1 failed |

22 caught, 0 missed, 1 not applied (of 23).

F1 rerun with the find updated for L3's gate:
| F1 | js/story/prologue.js | GV: stale bt_return (no yuki_return check) | caught | 4672710 passed, 1 failed |

1 caught, 0 missed, 0 not applied (of 1).

After RV1: 23 caught of 23.
