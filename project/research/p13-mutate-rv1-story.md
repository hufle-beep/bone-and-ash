| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/act1_fallout.js |  | caught | 193949 passed, 5 failed |
| F2 | js/story/act1_fallout.js |  | caught | 193952 passed, 2 failed |
| F3 | js/story/act1_fallout.js |  | caught | 193953 passed, 1 failed |
| F4 | js/story/act1_fallout.js |  | caught | 193951 passed, 3 failed |
| F5 | js/story/ashfall.js |  | caught | 193953 passed, 1 failed |
| F6 | js/story/ashfall.js |  | caught | 193948 passed, 6 failed |
| F7 | js/story/ashfall.js |  | caught | 193950 passed, 4 failed |
| F8 | js/story/ashfall.js |  | caught | 193951 passed, 3 failed |
| F9 | js/story/ashfall.js |  | caught | 193950 passed, 4 failed |
| F10 | js/story/act1_fallout.js |  | caught | 193953 passed, 1 failed |
| F11 | js/story/ashfall.js |  | caught | 193952 passed, 2 failed |
| RT1 | js/story/act1_fallout.js | a cat-only verb in FS10's form-free Yuki line (the woman washing a whisker); the form-word list misses it | caught | 193953 passed, 1 failed |
| RT2 | js/story/ashfall.js | SW3 text 1 loses its {yuki} slot, so Yuki's three passages never show; the test builds its expectation from the same text | caught | 193953 passed, 1 failed |
| RT3 | js/story/act1_fallout.js | a time word: FS10 text 6 shows on Day 63; the farewell (Day 64) is the last night | caught | 193952 passed, 2 failed |
| RT4 | js/story/ashfall.js | the mother names the Sect at table four nights after SW3 text 2 says it is not named there | caught | 193952 passed, 2 failed |
| RT5 | js/story/ashfall.js | a cat-only verb in SW3 text 4's shared text (the woman lapping); the shared-text word list misses it | caught | 193953 passed, 1 failed |
| C1 | js/story/act1_fallout.js | story day 10's six in reverse order | caught | 193949 passed, 5 failed |
| C2 | js/story/ashfall.js | week 3 reads five texts, the sixth night round again | caught | 193951 passed, 3 failed |
| C3 | js/story/act1_fallout.js | story day 10's first label becomes day 9's Ya label (its do still day 9 only) | caught | 193953 passed, 1 failed |
| C4 | js/story/act1_fallout.js | FS10 text 2 loses its line without Ya | caught | TypeError: Cannot read properties of undefined (reading 'startsWith') |
| C5 | js/story/ashfall.js | week 2's seventh supper (the story night) reads week 3's first | caught | 193953 passed, 1 failed |
| C6 | js/story/act1_fallout.js | a v0.11.240 save mid-week on story day 10 (s:fo_supper:9 past 7 days) reads FS10 by the old count: out of order, from index 1 | caught | 193953 passed, 1 failed |
| C7 | js/story/ashfall.js | a v0.11.240 save mid-week 3 (s:supper:5 past 7 days) reads SW3 by the old count | caught | 193953 passed, 1 failed |
| C8m | js/story/act1_fallout.js | a harmless-looking guard: day 10's six only after the plan (in a real game always true at 19:00); a test that fakes the day without the plan flag | caught | 193953 passed, 1 failed |
| RV1a | js/story/act1_fallout.js |  | caught | 193952 passed, 2 failed |
| RV1b | js/story/ashfall.js |  | caught | 193953 passed, 1 failed |
| RV1c | js/story/act1_fallout.js |  | caught | 193953 passed, 1 failed |

27 caught, 0 missed, 0 not applied (of 27).
