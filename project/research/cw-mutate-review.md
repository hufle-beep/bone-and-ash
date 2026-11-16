| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/core/story.js | second time spot (default move minutes after go) ignores the party: flown, no line (ht_leave, bl_morning) | missed |  |
| R2 | js/core/story.js | second time spot: a carried party walks the full time, no line | missed |  |
| R3 | js/core/game.js | raw form instead of yukiForm: a human form below realm 7 picks the human pool | missed |  |
| R4 | js/core/story.js | line words: who James carries (great 1) | missed |  |
| R5 | js/core/story.js | line words: canon height (human 1) | missed |  |
| R6 | js/core/story.js | line words: the cat's place (yuki 2) | missed |  |
| R7 | js/core/story.js | line words: the count (yuki 2) | missed |  |
| R8 | js/core/story.js | line numbers swapped inside one foot line (mei 1) | missed |  |
| R9 | js/core/story.js | line words: bond speech to a local (human 2) | missed |  |
| R10 | js/core/story.js | line words: the great form speaking aloud (great 3) | missed |  |
| R11 | js/core/story.js | control: foot line numbers swapped in code | caught | 4653864 passed, 6 failed |
| R12 | js/core/faq.js | FAQ against the rule | missed |  |
| R13 | js/core/faq.js | FAQ realm of the great form | missed |  |
| R14 | js/core/news.js | What's new number against CARRY_F / CARRY_A | missed |  |

1 caught, 13 missed, 0 not applied (of 14).
