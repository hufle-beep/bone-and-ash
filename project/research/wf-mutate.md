# Planted faults, v0.11.221 (WF2 = WB + RV2), after RV2

`node tools/mutate.mjs` against `node tests/story.test.mjs --quick`. Claude's `wf-faults.json` (F1–F9 the build's, F10–F18 RV2's; F7 re-pointed for NO): 17 of 18 on the first run, F18 (NC every 2nd day) missed; the NC block added, then F18 caught alone: **18 of 18**. The review's `wf-faults-review.json` (RF4 re-pointed for LY): **8 of 8** (RF8, missed before RV2, caught by TG4). Before RV2 the review measured 9 of 9 and 7 of 8.

## wf-faults.json (the run before the NC block)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/common.js | every wilds card spaced from New (SA, not the pick) | caught | 4654602 passed, 19 failed |
| F2 | js/story/common.js | spaced from Mastered, not Skilled | caught | 4654604 passed, 17 failed |
| F3 | js/story/common.js | registered but never spaced | caught | 4654601 passed, 20 failed |
| F4 | js/story/wilds.js | Practice left daily | caught | 4654611 passed, 10 failed |
| F5 | js/story/wilds.js | each key gated by the next card's familiarity | caught | 4654611 passed, 10 failed |
| F6 | js/story/common.js | the doors and the cook lose their spacing | caught | 4654582 passed, 39 failed |
| F7 | js/core/week.js | the note on every wilds row, Practised or on the old calendar (re-pointed for RV2) | caught | 4654620 passed, 1 failed |
| F8 | js/main.js | the row's note not drawn | caught | 4654620 passed, 1 failed |
| F9 | js/story/common.js | the note shown on the old calendar too | caught | 4654614 passed, 7 failed |
| F10 | js/story/common.js | RV2 HF off: the Skilled week starves again | caught | 4654615 passed, 6 failed |
| F11 | js/story/common.js | HF on Practice too | caught | 4654620 passed, 1 failed |
| F12 | js/core/tasks.js | HF's multiplier never set on a success | caught | 4654616 passed, 5 failed |
| F13 | js/story/again.js | the haul line stops the plan as unread | caught | 4654620 passed, 1 failed |
| F14 | js/core/week.js | NO: no opens Day N | caught | 4654620 passed, 1 failed |
| F15 | js/core/week.js | NV off: not this week again | caught | 4654620 passed, 1 failed |
| F16 | js/core/week.js | NC off: the Cards total counts every run set | caught | 4654620 passed, 1 failed |
| F17 | js/story/wilds.js | LY off: Yuki's hunt spaced | caught | 4654618 passed, 3 failed |
| F18 | js/core/week.js | NC counts every 2nd day | missed |  |

17 caught, 1 missed, 0 not applied (of 18).

## wf-faults-review.json

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| RF1 | js/story/common.js | a card at exactly 8 (Skilled) still daily | caught | 4654607 passed, 14 failed |
| RF2 | js/story/common.js | familiarity read under the daily key, never the card: never spaced | caught | 4654603 passed, 18 failed |
| RF3 | js/story/common.js | one Skilled card spaces its whole menu | caught | 4654619 passed, 2 failed |
| RF4 | js/story/wilds.js | the dart cards (hare, fowl, darts: form-gated) left daily (re-pointed for RV2, LY) | caught | 4654619 passed, 2 failed |
| RF5 | js/story/common.js | cardSpaced never true: the CN note never drawn | caught | 4654608 passed, 13 failed |
| RF6 | js/story/common.js | wilds cards every 2nd day while the note says 3rd | caught | 4654614 passed, 7 failed |
| RF7 | js/story/common.js | Mastered cards daily again | caught | 4654619 passed, 2 failed |
| RF8 | js/story/common.js | wilds cards spaced on journey days too (probe: is the stay rule pinned for them?) | caught | 4654620 passed, 1 failed |

8 caught, 0 missed, 0 not applied (of 8).
