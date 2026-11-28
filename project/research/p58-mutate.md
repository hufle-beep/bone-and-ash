# P58 planted faults (v0.11.290, `tools/mutate.mjs`)

Before the review (Claude's 12, `--cmd "node tests/archive.test.mjs"`, run by the reviewer): 11 caught, 0 missed, 1 not applied (F8: its find occurred 3 times; TG8). The reviewer's 12: 6 caught, 5 missed (R2, R3, R4, R5, R10), 1 equivalent (R6). Details: `p58-review.md`.

## After the fixes (RV-A), `--cmd "node tests/archive.test.mjs"`

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/app.js | the guard lets any stored save be overwritten | caught | 266 passed, 1 failed |
| F2 | js/core/app.js | a stale copy writes again once storage matches | caught | 266 passed, 1 failed |
| F3 | js/main.js | a failed write still becomes this copy's | caught | 266 passed, 1 failed |
| F4 | js/main.js | the guard warns but writes anyway | caught | 266 passed, 1 failed |
| F5 | js/core/tasks.js | chores and sits listed | caught | 265 passed, 2 failed |
| F6 | js/core/tasks.js | a shared menu listed under every hub | caught | 265 passed, 2 failed |
| F7 | js/core/tasks.js | the next step's name is this step's | caught | 265 passed, 2 failed |
| F8 | js/core/tasks.js | labels keep their full stop (unique find, TG8) | caught | 265 passed, 2 failed |
| F9 | js/core/tasks.js | zero tiers named | caught | 266 passed, 1 failed |
| F10 | js/core/tasks.js | an empty Mastery heading on a new game | caught | 266 passed, 1 failed |
| F11 | css/style.css | the picker loses its grid | caught | 266 passed, 1 failed |
| F12 | js/core/tasks.js | a hub without a place name | caught | 266 passed, 1 failed |
| F13 | js/core/tasks.js | M1-f: Yuki's own card listed | caught | 264 passed, 3 failed |
| F14 | js/core/tasks.js | M1-f: a door menu's Back listed | caught | 266 passed, 1 failed |
| F15 | js/main.js | M2-r: restore all in a stale copy | caught | 266 passed, 1 failed |
| F16 | js/main.js | M2-r: backups written by a stale copy | caught | 266 passed, 1 failed |
| F17 | js/main.js | M2-r: the recovery screen | caught | 266 passed, 1 failed |
| R2 | js/main.js | reviewer R2: every reopened game stale | caught | 266 passed, 1 failed |
| R3 | js/core/tasks.js | reviewer R3: inner full stops dropped | caught | 266 passed, 1 failed |
| R4 | js/core/tasks.js | reviewer R4: total counts places | caught | 266 passed, 1 failed |
| R5 | js/core/tasks.js | reviewer R5: rows lose the count | caught | 266 passed, 1 failed |

21 caught, 0 missed, 0 not applied (of 21).

## The browser-only faults, `--cmd` the browser test's `p58_ui` alone (a scratch runner)

| Fault | File | What it breaks | Result |
|---|---|---|---|
| R10 | css/style.css | the picker's cards `nowrap` (overflow at 360 px) | caught |
| F18 | css/style.css | L1: the picker back to 9.5 rem (one column at 360 px) | caught |
| F19 | js/core/app.js | the notice's words | caught |

3 caught, 0 missed (of 3).
