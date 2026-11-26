# P49 planted faults (tools/mutate.mjs, against node tests/story.test.mjs --games 50 --workers 1)

## Claude's F1-F7 (before the review's fixes)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/ashfall.js | text 1 loses its lip line | caught | 1809150 passed, 2 failed |
| F2 | js/story/ashfall.js | text 2's lip line back after the question | caught | 1809150 passed, 2 failed |
| F3 | js/story/ashfall.js | text 2's lip line without the bruise | caught | 1809149 passed, 3 failed |
| F4 | js/story/ashfall.js | the old words back | caught | 1809149 passed, 3 failed |
| F5 | js/core/news.js | TU's line loses its scope | caught | 1809151 passed, 1 failed |
| F6 | js/story/ashfall.js | the healed line read before the scab | caught | 1809144 passed, 8 failed |
| F7 | js/story/again.js | SF-x: the earlier-day read moved off the numbers-aside key | caught | 1809146 passed, 6 failed |

7 caught, 0 missed, 0 not applied (of 7).

## The reviewer's C1-C6 (after RV: TG1-TG4)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/story/ashfall.js | HS-b2 reverted in text 1: the scab line back after her question, so the screen ends on it again (expected caught: P49-A text 1, HS round) | caught | 1809152 passed, 3 failed |
| C2 | js/story/ashfall.js | HS-b2 reverted in text 2: the pale-line paragraph last again (expected caught: P49-A text 2, RV1 TG-T4 re-pin) | caught | 1809153 passed, 2 failed |
| C3 | js/story/ashfall.js | the healed line shown on the first visit (scab and pale line swapped in time) (expected caught: P49-A text 1, HS round /dark scab/) | caught | 1809152 passed, 3 failed |
| C4 | js/story/ashfall.js | Claude's cut undone (Fable's 'goes back to cutting') (expected caught: P49-A text 1 /and carries on cutting\.$/) | caught | 1809154 passed, 1 failed |
| C5 | js/story/ashfall.js | the lip line on the unbruised second text too (expected caught: P49-A not bruised, HS round) | caught | 1809151 passed, 4 failed |
| C6 | js/core/news.js | What's new loses the slopes sentence (expected MISSED: TU pins the tuning words only; TG2) | caught | 1809154 passed, 1 failed |

6 caught, 0 missed, 0 not applied (of 6).
