# Y1 planted faults after RV1 (v0.11.191)

The review's 18 adapted (P3, P4 gone with M1's code; T6 on the new text) + 14 for RV1: 27 of 30 caught on the first run; the 3 missed (P6, T3, W4) caught after the tests added (the canon card's tics, no first-time claim, a wait below Nascent Soul): 30 of 30.

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| P1 | js/core/coil.js | RP: this Coil's answer not recorded as yk_last at the rewind | caught | 4672540 passed, 10 failed |
| P2 | js/core/coil.js | RP: the older answer wins over this Coil's | caught | 4672544 passed, 6 failed |
| P5 | js/story/yuki_path.js | AK: she asks again at the next breakthrough after Not yet (pushes) | caught | 4672549 passed, 1 failed |
| P6 | js/story/yuki_path.js | AK: asks below Nascent Soul, as a cat | missed |  |
| P7 | js/story/yuki_path.js | TX: the later question away from the fire never shows | caught | 4672546 passed, 4 failed |
| P8 | js/story/yuki_path.js | TX: last Not yet reads the changed text | caught | 4672542 passed, 8 failed |
| P9 | js/story/yuki_path.js | RL: the first-ever Coil's lover result also says Back in her own shape | caught | 4672549 passed, 1 failed |
| P10 | js/story/yuki_path.js | TX: the fire's lover answer keeps the first text on a later Coil | caught | 4672546 passed, 4 failed |
| P11 | js/story/prologue.js | AK: no later question by the Long Forest's fire | caught | 4672531 passed, 19 failed |
| T1 | js/story/yuki_path.js | TX: a time word (tonight) in a place- and time-neutral answer | caught | 4672549 passed, 1 failed |
| T2 | js/story/yuki_path.js | TX: a place (stove) in a place-neutral answer shown by the fire | caught | 4672549 passed, 1 failed |
| T3 | js/story/yuki_path.js | TX: a canon-card tic (for a long moment) in Q-lover | missed |  |
| T4 | js/story/yuki_path.js | Forms: a shoulder for the great root-kin | caught | 4672549 passed, 1 failed |
| T5 | js/story/yuki_path.js | Who is there: names the women where James may be alone | caught | 4672549 passed, 1 failed |
| T6 | js/story/yuki_path.js | Content limit: past a kiss in an answer text | caught | 4672549 passed, 1 failed |
| T7 | js/story/yuki_path.js | RL: speech in a result line (the reply splitter) | caught | 4672549 passed, 1 failed |
| M1a | js/core/coil.js | RV1 M1: the snapshot's answer comes back | caught | 4672547 passed, 3 failed |
| H1a | js/story/yuki_time.js | RV1 H1a: her door doesn't ask | caught | Error: Choice not available |
| H1b | js/story/yuki_path.js | RV1 H1b: the false 'You said not yet' | caught | 4672549 passed, 1 failed |
| H1c | js/story/yuki_path.js | RV1 H1c: F's line after a season | caught | 4672549 passed, 1 failed |
| M3a | js/story/yuki_path.js | RV1 M3: no remembered answer | caught | 4672547 passed, 3 failed |
| M3b | js/story/yuki_path.js | RV1 M3: remembered even when she is to ask | caught | Error: Choice not available |
| L3a | js/story/yuki_path.js | RV1 L3: the later fire's label | caught | 4672549 passed, 1 failed |
| L3b | js/story/yuki_path.js | RV1 L3: the later fire's title | caught | 4672549 passed, 1 failed |
| M2a | js/story/yuki_path.js | RV1 M2: first-time texts after a wait | caught | 4672542 passed, 8 failed |
| L4a | js/story/yuki_path.js | RV1 L4: the first reply again | caught | 4672547 passed, 3 failed |
| W1 | js/story/yuki_path.js | the kiss limit in W-lover | caught | 4672549 passed, 1 failed |
| W2 | js/story/yuki_path.js | D1 C3 undone | caught | 4672549 passed, 1 failed |
| W3 | js/story/yuki_path.js | a place in W-sister | caught | 4672548 passed, 2 failed |
| W4 | js/story/yuki_path.js | a first-time claim after a wait | missed |  |

27 caught, 3 missed, 0 not applied (of 30).

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| P6 | js/story/yuki_path.js | AK: asks below Nascent Soul, as a cat | caught | 4672563 passed, 1 failed |
| T3 | js/story/yuki_path.js | TX: a canon-card tic (for a long moment) in Q-lover | caught | 4672563 passed, 1 failed |
| W4 | js/story/yuki_path.js | a first-time claim after a wait | caught | 4672563 passed, 1 failed |

3 caught, 0 missed, 0 not applied (of 3).
