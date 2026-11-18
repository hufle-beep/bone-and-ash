# TS6 planted faults (v0.11.224, after RV1; tools/mutate.mjs against tests/story.test.mjs --quick)

## Claude's (ts6-faults.json, F1–F15 TX2's, F16–F22 RV1's): 19 of 22 caught

F3 can't show on screen (no slot text on story day 7), F5 and F6 are equivalent (SD folds a same-day repeat first; noFold returns earlier in againView), as the review found.

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/calendar.js | the days to the tribute one short (the eve says two days) | caught | 4654665 passed, 7 failed |
| F2 | js/core/calendar.js | the Elder's count a day short on the old calendar (12 for 13) | caught | 4654663 passed, 9 failed |
| F3 | js/core/calendar.js | the tribute's own story day counts to the Elder | missed |  |
| F4 | js/core/lines.js | a sequence never moves on (always its first text) | caught | 4654664 passed, 8 failed |
| F5 | js/story/again.js | VF folds a text shown again on the same day too | missed |  |
| F6 | js/story/again.js | VF folds task screens and menus | missed |  |
| F7 | js/story/ashfall.js | the hub never says Tomorrow on the eve | caught | 4654670 passed, 2 failed |
| F8 | js/story/house_time.js | the villagers' eve texts never show | caught | 4654668 passed, 4 failed |
| F9 | js/story/ashfall.js | the last sunset on the early evenings, the early ones on the eve | caught | 4654670 passed, 2 failed |
| F10 | js/story/act1_blackroot.js | the Root Road's first morning shows two ways on | caught | 4660069 passed, 2 failed |
| F11 | js/story/act1_blackroot.js | the settled walk's sequence starts a beat early (over the old calendar's last talk) | caught | TypeError: [(intermediate value),(intermediate value)][(((n - 5) % 3) - 1)] is not a function |
| F12 | js/story/prologue.js | the herb girl's eve says 'in one day' | caught | 4654671 passed, 1 failed |
| F13 | js/core/tasks.js | the hint's tribute day a day early | caught | 4654671 passed, 1 failed |
| F14 | js/story/act1_fallout.js | Ya says Tomorrow two days early | caught | 4654671 passed, 1 failed |
| F15 | js/story/wilds.js | X2 on the wrong calendar | caught | 4654664 passed, 8 failed |
| F16 | js/story/again.js | RV1 H1: the later-day fold's hidden part run together | caught | 4654671 passed, 1 failed |
| F17 | js/story/ashfall.js | RV1 H3a: the walk in the long calendar's first week again | caught | 4654671 passed, 1 failed |
| F18 | js/story/again.js | RV1 VK: number words make a text new again | caught | 4654671 passed, 1 failed |
| F19 | js/story/act1_fallout.js | RV1 MC: the title by the wrong calendar | caught | 4654671 passed, 1 failed |
| F20 | js/core/calendar.js | RV1 L2: Lu Han's 'On the hundred and third' | caught | 4654671 passed, 1 failed |
| F21 | js/story/act1_blackroot.js | RV1 MP2: the third morning repeats the second's line | caught | 4654671 passed, 1 failed |
| F22 | js/core/week.js | RV1 VK: the night fold sees the spelled-out day as a new night | caught | 4654665 passed, 7 failed |

## The review's (ts6-faults-review.json): 10 of 10 caught after RV1's tests (6 of 10 before TG1/TG6/TG7's additions; R1, R2, R4, R7 caught by the rerun)

|---|---|---|---|---|
| R1 | js/story/again.js | SV's folded rest joined with a literal backslash-n (the same slip as SD and VF in this build): 'Read it all again' runs the paragraphs together | missed |  |
| R2 | js/story/house_time.js | the house cards' eve texts ('tomorrow the Sect walks past it') two days before the tribute | missed |  |
| R3 | js/story/act1_blackroot.js | a quiet morning in the Drowned Wood leads back to the Root Road's hub | caught | 4654671 passed, 1 failed |
| R4 | js/story/act1_blackroot.js | the settled walk's second new text never shows (the old settled text twice in three) | missed |  |
| R5 | js/story/prologue.js | the old calendar's eve supper opener changed by a word (no old-calendar pin on `evening`) | caught | 4654670 passed, 2 failed |
| R6 | js/story/ashfall.js | the walk's 'Tomorrow, whatever happens' result on the last week's earlier evenings again (X6 undone) | caught | 4654671 passed, 1 failed |
| R7 | js/story/again.js | VF keeps folding after the text on screen changes within the visit | missed |  |
| R8 | js/core/lines.js | every sequence of a scene shares one day record: story day 5's suppers start mid-sequence (the father's story skipped on the week's first night) | caught | 4654666 passed, 6 failed |
| R9 | js/story/act1_blackroot.js | a camp's second morning shows its first morning's text again (v0.11.224 RV1: the find moved with MP2) | caught | 4654671 passed, 1 failed |
| R10 | js/story/act1_blackroot.js | Ya's 'Half a moon in' on a long-calendar save that keeps the 5-day road (calBl 1) | caught | 4654671 passed, 1 failed |
