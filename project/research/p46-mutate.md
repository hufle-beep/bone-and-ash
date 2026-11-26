# P46 planted faults (tools/mutate.mjs): the reviewer's C1–C8 (story test, 50 games), Claude's F1–F6 (story test, 5 games), the four missed re-run after the test gaps were filled

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/week.js | NS-b without its seenBefore guard | missed |  |
| C2 | js/story/again.js | shownEarlierDay counts a text shown earlier the same day | missed |  |
| C3 | js/core/week.js | the Old Tree's night and morning left out of NF-g | missed |  |
| C4 | js/core/week.js | fold walks a one-way screen with a check / qi / fail | caught | 1809109 passed, 1 failed |
| C5 | js/core/week.js | a scene seen on an earlier Coil folds with a text never read | caught | 1809109 passed, 1 failed |
| C6 | js/story/again.js | any text of the scene shown on an earlier day: a new text folds | caught | 1809108 passed, 2 failed |
| C7 | js/core/week.js | fold outside a stay's days | caught | 1809109 passed, 1 failed |
| C8 | js/core/week.js | the Fallout morning left out of NF-g | missed |  |

4 caught, 4 missed, 0 not applied (of 8).
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/week.js | NF-g undone: the village morning alone | caught | 1325075 passed, 4 failed |
| F2 | js/core/week.js | NF-g: the earlier-Coil half (NS-b) dropped | caught | 1325076 passed, 3 failed |
| F3 | js/core/week.js | NF-g: any scene folds by the rule | caught | 1325078 passed, 1 failed |
| F4 | js/core/week.js | NF-g: seen before is enough, unread texts fold | caught | 1325078 passed, 1 failed |
| F5 | js/core/week.js | NF-g: foldNight never asks foldEarlier (NS1 lost too) | caught | 1325073 passed, 6 failed |
| F6 | js/core/news.js | What's new line misnumbered | caught | 1325078 passed, 1 failed |

6 caught, 0 missed, 0 not applied (of 6).
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/week.js | NS-b without its seenBefore guard | caught | 1325081 passed, 1 failed |
| C2 | js/story/again.js | shownEarlierDay counts a text shown earlier the same day | caught | 1325081 passed, 1 failed |
| C3 | js/core/week.js | the Old Tree's night and morning left out of NF-g | caught | 1325080 passed, 2 failed |
| C8 | js/core/week.js | the Fallout morning left out of NF-g | caught | 1325081 passed, 1 failed |

4 caught, 0 missed, 0 not applied (of 4).

## RV-A (after the pick): the tool faults (Claude's F7–F13, the reviewer's T1–T5; `--cmd "node /tmp/f46/t46run.mjs"`, the tools test's P46-A blocks on the copy) and the RV-A guards (story test, 5 games)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F7 | tools/packet.mjs | PK: night 1 matches night 12 | caught |   FAIL  P46-A (PK): stateMatch by whole words (night 1 in the forest's night 12; story day 1 in the long calendar's story day 10, day 2) |
| F8 | tools/packet.mjs | PK: the filter never applied | caught |   FAIL  P46-A (PK, RV-A L4): `night --state night` keeps the scene; a --state naming nothing says so |
| F9 | tools/packet.mjs | PK: --state with no words not refused | caught |   FAIL  P46-A (PK): --state with no words, with --tags or with --check is refused (exit 2) |
| F10 | tools/lib/formlint.mjs | LT: own antecedent ignored | caught |   FAIL  P46-A (LT): an antecedent in its own branch, "these ones" and a missing branch |
| F11 | tools/lib/formlint.mjs | LT: feet not stemmed (L8 missed) | caught |   FAIL  P46-A (LT, RV-A L2, TG8): \n read as a break, a nested ${} as one word ({"calls":2,"read":2,"demonstratives":2,"hits":[]}) |
| F12 | tools/packet.mjs | LT: --check's form kind gone | caught |   FAIL  P46-A (LT): --check's form kind on the drafts ([]) |
| F13 | tools/lib/formlint.mjs | LT: 'these ones' flagged again | caught |   FAIL  P46-A (LT, RV-A TG7): a planted hit in the LT line (LT form branches: 299 of 312 byForm calls read, 3 "those / these", 2 pointing into another form: act |
| T1 | tools/packet.mjs | stateMatch: regex specials unescaped | caught |   FAIL  P46-A (PK, RV-A TG6): stateMatch escapes +, ., ) |
| T2 | tools/packet.mjs | stateMatch: no trailing word boundary (night 1 = night 12) | caught |   FAIL  P46-A (PK): stateMatch by whole words (night 1 in the forest's night 12; story day 1 in the long calendar's story day 10, day 2) |
| T3 | tools/lib/formlint.mjs | formlint: nested braces in ${} end the expression early | caught |   FAIL  P46-A (LT, RV-A L2, TG8): \n read as a break, a nested ${} as one word ({"calls":2,"read":2,"demonstratives":2,"hits":[{"file":"y.js","line":1,"form":"g |
| T4 | tools/textlint.mjs | textlint LT line always says 0 | caught |   FAIL  P46-A (LT, RV-A TG7): a planted hit in the LT line (LT form branches: 299 of 312 byForm calls read, 3 "those / these", 0 pointing into another form: zz_ |
| T5 | tools/packet.mjs | --state followed by a flag taken as its words | caught |   FAIL  P46-A (PK): --state with no words, with --tags or with --check is refused (exit 2) |

12 caught, 0 missed, 0 not applied (of 12).

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F14 | js/core/week.js | RV-A H1: the fold walks a romance beat again | caught | 1325084 passed, 1 failed |
| F15 | js/core/week.js | RV-A M1: the fold walks into a story scene again | caught | 1325084 passed, 1 failed |
| F16 | js/core/week.js | RV-A M1: a hub no longer counts as a safe way on | caught | 1325080 passed, 5 failed |

3 caught, 0 missed, 0 not applied (of 3).
