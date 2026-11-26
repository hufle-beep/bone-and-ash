# P51-A planted faults (tools/mutate.mjs)

## Claude's F1–F9 (before the review's fixes; against `node tests/story.test.mjs --games 2 --workers 1`)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/tasks.js | MT: the menu's text every time (the flag never set) | caught | 1294538 passed, 18 failed |
| F2 | js/core/tasks.js | MT: a door menu's text dropped (the Wilds' Explore) | caught | 1294555 passed, 1 failed |
| F3 | js/core/tasks.js | MT: keyed by the whole text (the pantry's counts make a new text) | caught | 1294553 passed, 3 failed |
| F4 | js/core/tasks.js | MT: a work menu's text dropped | caught | 1294546 passed, 10 failed |
| F5 | js/core/game.js | CP: the cap line once a Coil, not once a day | caught | 1294555 passed, 1 failed |
| F6 | js/core/game.js | CP: GU's cap line on every result again | caught | 1294554 passed, 2 failed |
| F7 | js/core/tasks.js | SU: the evening named off a task hub too | caught | 1294555 passed, 1 failed |
| F8 | js/core/meditate.js | SU: the result names the wrong hour | caught | 1294555 passed, 1 failed |
| F9 | js/core/tasks.js | MT: the key from the first line, not the first sentence | caught | 1294552 passed, 4 failed |

9 caught, 0 missed, 0 not applied (of 9).

## Claude's F10–F13 (against `node tests/appfiles.test.mjs`)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F10 | js/main.js | SV-p: every part named part 1 | caught | 10 passed, 1 failed |
| F11 | js/core/app.js | WB-y: the days away rounded up | caught | 10 passed, 1 failed |
| F12 | js/core/app.js | WB-y: a junk time kept | caught | 10 passed, 1 failed |
| F13 | js/core/app.js | L7-f: the tooltip touches the window's bottom edge | caught | 9 passed, 3 failed |

4 caught, 0 missed, 0 not applied (of 4).

## Claude's F14 (against a join check: parts kept as GitHub keeps them, with a last newline)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F14 | tools/joinsave.mjs | SV-p: GitHub's last newline kept in the joined save | caught | SyntaxError: Bad control character in string literal in JSON at position 18000 (line 1 column 18001) |

1 caught, 0 missed, 0 not applied (of 1).

## The reviewer's C1–C4 (after RV-A and the review's fixes; C1 re-aimed: RV-A's M2-x leaves the door's text undrawn on purpose, so C1 draws it again)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/tasks.js | re-aimed after RV-A (M2-x): the reviewer's C1 dropped the door's text, which RV-A now does on purpose; this one draws it again (under the scene it opens). Expec | caught | 1294561 passed, 1 failed |
| C2 | js/core/tasks.js | MT-d: keyed on the whole text, so the pantry's food count (wild_forage) or the militia line makes a new text and it shows again. story.test P51-A 'the pantry's  | caught | 1294559 passed, 3 failed |
| C3 | js/core/game.js | CP-1: '(cap)' once a Coil instead of once a day. story.test P51-A 'three the next day'. Expect caught. | caught | 1294561 passed, 1 failed |
| C4 | js/core/meditate.js | SU-n: the sit-all's result names the hour it started, not 19:00. story.test P51-A 'its result, ending at 19:00'. Expect caught. | caught | 1294559 passed, 3 failed |

4 caught, 0 missed, 0 not applied (of 4).

## The reviewer's C5–C6 (both expected missed before TG3, TG4)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C5 | js/main.js | WB-y: time away counted from when the page last came back, not from when it was hidden: 5 h of play and a 2 h break give a card. appfiles: no pin on the visibil | caught | 9 passed, 3 failed |
| C6 | css/style.css | L7-f: on a PC the tooltip keeps its bottom and gets placeTip's top: stretched from the card to the bottom bar. appfiles pins main.js only. Expect MISSED. | caught | 10 passed, 1 failed |

2 caught, 0 missed, 0 not applied (of 2).
