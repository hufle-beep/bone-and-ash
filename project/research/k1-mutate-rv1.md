# Planted faults after RV1 + A1 — v0.11.192 (tools/mutate.mjs)

The review's 17 story faults rerun on the RV1 build (`node tests/story.test.mjs --quick`): 12 caught as written; F2, F3, F8, F15 adapted to the RV1 code and words and F17 (missed before TG8) in a second run: 5 of 5. The lint faults T1–T3 (T3 new, TG7) with `node tests/tools.test.mjs` in the copies, no wrapper (A1: the copies keep `art/` and are git trees): 3 of 3. A harmless fault (a comment space in `js/core/news.js`) through `bash tools/check.sh quick` in a copy: missed, as it should be (before A1 the quick check died in every copy). **20 of 20.**

## Run 1 (as written)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/yuki_path.js | QH signal read after enter (always human): the swap shows for a cat too | caught | TypeError: Cannot read properties of undefined (reading 'realm') |
| F2 | js/story/yuki_path.js | QW threshold off by one | not applied | find not in the file |
| F3 | js/story/yuki_path.js | QW reads her realm now, not the snapshot: cut on every later Coil | not applied | find not in the file |
| F4 | js/story/yuki_path.js | L5 reverted for Family | caught | 4672650 passed, 2 failed |
| F5 | js/story/yuki_path.js | L5 lover: "Back in her own shape" even when she stays human | caught | 4672651 passed, 1 failed |
| F6 | js/story/prologue.js | M2b: the owner-shown word changed | caught | 4672651 passed, 1 failed |
| F7 | js/story/prologue.js | M2b gate: party flag instead of the breakthrough they saw | caught | 4672651 passed, 1 failed |
| F8 | js/story/yuki_path.js | QH sister: a new change-of-shape beat put back by another word | not applied | find not in the file |
| F9 | js/story/yuki_path.js | LF lover: only after a last "sister" (lover/wait get the treeline line) | caught | 4672650 passed, 2 failed |
| F10 | js/story/yuki_path.js | QW skipped when she is human before | caught | 4672651 passed, 1 failed |
| F11 | js/story/yuki_path.js | enter order: yk_form_before always human | caught | 4672615 passed, 37 failed |
| F12 | js/story/yuki_path.js | FQ reverted: the fire changes her shape when already human | caught | 4672650 passed, 2 failed |
| F13 | js/story/yuki_time.js | daily door: no yk_form_before (no QH, no form back) | caught | 4672648 passed, 4 failed |
| F14 | js/story/yuki_path.js | QW cut text changed (re-adds a lateness claim) | caught | 4672649 passed, 3 failed |
| F15 | js/story/yuki_path.js | QH wait: the new-thumbs beat back | not applied | find not in the file |
| F16 | js/story/yuki_path.js | FQ: "the white shape" (a cat) for a woman already human | caught | 4672650 passed, 2 failed |
| F17 | js/story/yuki_path.js | load-time check of the QH pairs removed | missed |  |

12 caught, 1 missed, 4 not applied (of 17).

## Run 2 (adapted, and F17 after TG8)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F2 | js/story/yuki_path.js | QW threshold off by one (adapted to RV1 L6) | caught | 4672650 passed, 3 failed |
| F3 | js/story/yuki_path.js | QW reads her realm now, not the snapshot (adapted to RV1 L6) | caught | 4672645 passed, 8 failed |
| F8 | js/story/yuki_path.js | QH sister: a new change-of-shape beat put back (adapted to RV1 M1) | caught | 4672651 passed, 2 failed |
| F15 | js/story/yuki_path.js | QH wait: the new-thumbs beat back (adapted to RV1 L2) | caught | 4672649 passed, 4 failed |
| F17 | js/story/yuki_path.js | load-time check of the QH pairs removed | caught | 4672652 passed, 1 failed |

5 caught, 0 missed, 0 not applied (of 5).

## The lint faults (tools test, no wrapper)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| T1 | tools/textlint.mjs | textlint: the QH states dropped (adapted to RV1 TG7) | caught | 383 passed, 3 failed |
| T2 | tools/lint.mjs | lint: the QH states dropped, count stays 19 (adapted to RV1 TG7) | caught | 385 passed, 1 failed |
| T3 | tools/lint.mjs | lint: the snapshot with her human shape dropped (TG7) | caught | 385 passed, 1 failed |

3 caught, 0 missed, 0 not applied (of 3).

## The harmless fault through the quick check

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| Q1 | js/core/news.js | harmless: a comment space (quick must pass in a copy) | missed |  |

0 caught, 1 missed, 0 not applied (of 1).
