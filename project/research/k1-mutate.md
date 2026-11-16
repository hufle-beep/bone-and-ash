| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/yuki_path.js | QH signal read after enter (always human): the swap shows for a cat too | caught | TypeError: Cannot read properties of undefined (reading 'realm') |
| F2 | js/story/yuki_path.js | QW threshold off by one | caught | 4672624 passed, 1 failed |
| F3 | js/story/yuki_path.js | QW reads her realm now, not the snapshot: cut on every later Coil | caught | 4672619 passed, 6 failed |
| F4 | js/story/yuki_path.js | L5 reverted for Family | caught | 4672623 passed, 2 failed |
| F5 | js/story/yuki_path.js | L5 lover: "Back in her own shape" even when she stays human | caught | 4672624 passed, 1 failed |
| F6 | js/story/prologue.js | M2b: the owner-shown word changed | missed |  |
| F7 | js/story/prologue.js | M2b gate: party flag instead of the breakthrough they saw | caught | 4672624 passed, 1 failed |
| F8 | js/story/yuki_path.js | QH sister: a new change-of-shape beat put back by another word | missed |  |
| F9 | js/story/yuki_path.js | LF lover: only after a last "sister" (lover/wait get the treeline line) | missed |  |
| F10 | js/story/yuki_path.js | QW skipped when she is human before | caught | 4672624 passed, 1 failed |
| F11 | js/story/yuki_path.js | enter order: yk_form_before always human | caught | 4672588 passed, 37 failed |
| F12 | js/story/yuki_path.js | FQ reverted: the fire changes her shape when already human | caught | 4672623 passed, 2 failed |
| F13 | js/story/yuki_time.js | daily door: no yk_form_before (no QH, no form back) | caught | 4672624 passed, 1 failed |
| F14 | js/story/yuki_path.js | QW cut text changed (re-adds a lateness claim) | caught | 4672623 passed, 2 failed |
| F15 | js/story/yuki_path.js | QH wait: the new-thumbs beat back | caught | 4672623 passed, 2 failed |
| F16 | js/story/yuki_path.js | FQ: "the white shape" (a cat) for a woman already human | caught | 4672624 passed, 1 failed |
| F17 | js/story/yuki_path.js | load-time check of the QH pairs removed | missed |  |

13 caught, 4 missed, 0 not applied (of 17).

## Lint sample-state faults (cmd: tools.test.mjs, its 3 copy-only failures ignored: no .git, no art/)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| T1 | tools/textlint.mjs | textlint: the QH/QW states dropped | caught |   FAIL  LR: a template leftover in a memory line is noted against the pool's snapshot, log only, the scenes untouched (exit 0) |
| T2 | tools/lint.mjs | lint: the QH/QW states dropped (count stays 18) | missed |  |

1 caught, 1 missed, 0 not applied (of 2).
