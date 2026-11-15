| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| P1 | js/core/coil.js | RP: this Coil's answer not recorded as yk_last at the rewind | caught | 4672485 passed, 9 failed |
| P2 | js/core/coil.js | RP: the older answer wins over this Coil's | caught | 4672488 passed, 6 failed |
| P3 | js/core/coil.js | RP: snapshot test reads the end-of-Coil state, so an old-keep snapshot answer survives when she was human at the Coil's end | caught | 4672493 passed, 1 failed |
| P4 | js/core/coil.js | RP: an old snapshot's yk_wait survives | caught | 4672493 passed, 1 failed |
| P5 | js/story/yuki_path.js | AK: she asks again at the next breakthrough after Not yet (pushes) | caught | 4672493 passed, 1 failed |
| P6 | js/story/yuki_path.js | AK: asks below Nascent Soul, as a cat | caught | 4672493 passed, 1 failed |
| P7 | js/story/yuki_path.js | TX: the later question away from the fire never shows | caught | 4672491 passed, 3 failed |
| P8 | js/story/yuki_path.js | TX: last Not yet reads the changed text | caught | 4672490 passed, 4 failed |
| P9 | js/story/yuki_path.js | RL: the first-ever Coil's lover result also says Back in her own shape | caught | 4672493 passed, 1 failed |
| P10 | js/story/yuki_path.js | TX: the fire's lover answer keeps the first text on a later Coil | caught | 4672492 passed, 2 failed |
| P11 | js/story/prologue.js | AK: no later question by the Long Forest's fire | caught | 4672479 passed, 15 failed |
| T1 | js/story/yuki_path.js | TX: a time word (tonight) in a place- and time-neutral answer | caught | 4672493 passed, 1 failed |
| T2 | js/story/yuki_path.js | TX: a place (stove) in a place-neutral answer shown by the fire | missed |  |
| T3 | js/story/yuki_path.js | TX: a canon-card tic (for a long moment) in Q-lover | missed |  |
| T4 | js/story/yuki_path.js | Forms: a shoulder for the great root-kin | missed |  |
| T5 | js/story/yuki_path.js | Who is there: names the women where James may be alone | missed |  |
| T6 | js/story/yuki_path.js | Content limit: past a kiss in an answer text | missed |  |
| T7 | js/story/yuki_path.js | RL: speech in a result line (the reply splitter) | missed |  |

12 caught, 6 missed, 0 not applied (of 18).
