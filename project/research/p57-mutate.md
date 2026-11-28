# P57 planted faults (tools/mutate.mjs; `node tests/archive.test.mjs && node tests/faq.test.mjs`)

## Claude's, before the review

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/archive.js | the tribute's day reads tomorrow | caught | 200 passed, 1 failed |
| F2 | js/core/archive.js | 12 of 12 primaries still shown | caught | 199 passed, 2 failed |
| F3 | js/core/archive.js | the Drowned Wood counted on entering it | caught | 200 passed, 1 failed |
| F4 | js/core/archive.js | a line after Act 1 | caught | 200 passed, 1 failed |
| F5 | js/core/archive.js | an old save's fill gets this Coil | caught | 200 passed, 1 failed |
| F6 | js/core/archive.js | a feat's Coil rewritten every check | caught | 200 passed, 1 failed |
| F7 | js/core/archive.js | the tribute on any Coil counts as the first | caught | 200 passed, 1 failed |
| F8 | js/core/archive.js | 99 cores counts as the stock limit | caught | 199 passed, 2 failed |
| F9 | js/core/archive.js | exactly 50% counts as hitting the cap | caught | 200 passed, 1 failed |
| F10 | js/core/archive.js | what an old save reached before becomes a memory | caught | 200 passed, 1 failed |
| F11 | js/core/archive.js | a find on the same screen keeps the menu's text, not the reply | caught | 200 passed, 1 failed |
| F12 | js/core/archive.js | no records on a scene entered | caught | 200 passed, 1 failed |
| F13 | js/main.js | the screen never notes records | caught | 200 passed, 1 failed |
| F14 | js/core/game.js | a new game starts without the fields: its first feats read as before the record | caught | 194 passed, 7 failed |
| F15 | js/core/faq.js | the limits entry has no gate | caught | 62 passed, 1 failed |
| F16 | js/core/archive.js | a remembered Insight found again becomes a new memory | caught | 199 passed, 2 failed |

16 caught, 0 missed, 0 not applied (of 16).

## Claude's, for the review's fixes

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F17 | js/core/archive.js | H1 back: an Insight on a new screen keeps the screen | caught | 216 passed, 3 failed |
| F18 | js/core/archive.js | M1 back: the tribute's own scene not today | caught | 217 passed, 2 failed |
| F19 | js/core/archive.js | M1 back: the short road's village reads ahead | caught | 218 passed, 1 failed |
| F20 | js/core/game.js | M2 back: the snapshot keeps a copy | caught | 217 passed, 2 failed |
| F21 | js/core/archive.js | M3 back: the Heart counted on entering it | caught | 218 passed, 1 failed |
| F22 | js/core/archive.js | Act 1's count one short | caught | 217 passed, 2 failed |
| F23 | js/core/archive.js | another Coil's scenes count | caught | 218 passed, 1 failed |
| F24 | js/core/archive.js | L7 back: a broken entry throws | caught | TypeError: Cannot read properties of undefined (reading 'filter') |
| F25 | js/core/archive.js | L5 back: no fill at load | caught | TypeError: Cannot read properties of undefined (reading 'kills_100') |
| F26 | js/core/archive.js | L1 back (equivalent today: the same text; pinned by function) | missed |  |

9 caught, 1 missed, 0 not applied (of 10).

## The reviewer's (its faults.json), after the fixes

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/core/archive.js | the Heart counted done a day early (Day 18) | not applied | find not in the file |
| R2 | js/core/archive.js | the Fallout no longer counted by the region | not applied | find not in the file |
| R3 | js/core/archive.js | a feat from before the record shown as Coil 1 | caught | 218 passed, 1 failed |
| R4 | js/core/archive.js | every memory shown as Coil 1 | not applied | find not in the file |
| R5 | js/core/faq.js | the limits entry open from a new game | caught | 60 passed, 3 failed |
| R6 | js/main.js | the Archive draws every feat on Coil 1 | caught | 218 passed, 1 failed |
| R7 | js/main.js | the memory's title dropped | not applied | find not in the file |
| R8 | js/core/archive.js | the primaries dropped on the long road | caught | 218 passed, 1 failed |
| R9 | js/core/archive.js | the village's count one short | caught | 214 passed, 5 failed |
| R10 | js/core/archive.js | only the reply's first part kept | caught | 218 passed, 1 failed |

6 caught, 0 missed, 4 not applied (of 10).

## The reviewer's R1, R4, R7 re-planted on the new code

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R4b | js/core/archive.js | every memory shown as Coil 1 (the reviewer's R4 on the new code) | caught | 217 passed, 2 failed |
| R7b | js/main.js | the memory's title dropped (the reviewer's R7 on the new markup) | caught | 218 passed, 1 failed |
| R1b | js/core/archive.js | the Ashen Hills counted on entering them | caught | 218 passed, 1 failed |

3 caught, 0 missed, 0 not applied (of 3).
