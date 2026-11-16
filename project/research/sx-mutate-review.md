| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/story/act1_return.js | new words: SX.road ¶1 changed (the ST echo made worse) | missed |  |
| R2 | js/story/act1_return.js | new words: SX.road ¶2 changed | missed |  |
| R3 | js/story/act1_return.js | new words: SX.human contradicts canon height | missed |  |
| R4 | js/story/act1_return.js | new words: Ya's paced sentence changed | missed |  |
| R5 | js/core/story.js | new words: the cat speaks aloud (bond italics lost) | missed |  |
| R6 | js/core/story.js | new words: the cat off the shoulder | missed |  |
| R7 | js/story/act1_return.js | new words: who carries whom | missed |  |
| R8 | js/story/act1_return.js | flag path: the fallback when flew but no longer carried flips to the human line | caught | 4653879 passed, 1 failed |
| R9 | js/story/act1_return.js | flag path: Ya's sentence by the current carry, not the flag (an old save reads carried) | caught | 4653879 passed, 1 failed |
| R10 | js/core/story.js | flag path: a card sets the flag | caught | 4653879 passed, 1 failed |
| R11 | js/core/story.js | flag path: quiet walks leave a stale value | missed |  |

3 caught, 8 missed, 0 not applied (of 11).
