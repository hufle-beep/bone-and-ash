| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| CF1 | js/core/game.js | affection bar lowered | caught | 4653729 passed, 3 failed |
| CF2 | js/core/game.js | Ya needs the human form instead of the great | caught | 4651332 passed, 19 failed |
| CF3 | js/core/game.js | either meter instead of both | caught | 4654246 passed, 11 failed |
| CF4 | js/core/game.js | Mei Lin's meters ignored | caught | 4654251 passed, 6 failed |
| CF5 | js/core/game.js | the forms' pools swapped | caught | 4653840 passed, 15 failed |
| CF7 | js/core/story.js | alone ignored | caught | 4653300 passed, 2 failed |
| CF9 | js/story/walks.js | hot_spring's alone mark dropped | caught | 4653291 passed, 3 failed |
| CF10 | js/core/story.js | the turn not advanced | caught | 4653836 passed, 19 failed |
| CF11 | js/core/story.js | the default-minutes spot ignores the party | caught | 4653921 passed, 2 failed |
| CF13 | js/core/story.js | a word in Fable's line | caught | 4653854 passed, 1 failed |
| CF14 | js/core/story.js | the human line's 'aloud' dropped | caught | 4653854 passed, 1 failed |
| CF15 | js/core/news.js | What's new against the rule | caught | 4653854 passed, 1 failed |
| R1 | js/core/story.js | second time spot (default move minutes after go) ignores the party: flown, no line (ht_leave, bl_morning) | caught | 4653921 passed, 2 failed |
| R2 | js/core/story.js | second time spot: a carried party walks the full time, no line | caught | 4651825 passed, 2 failed |
| R3 | js/core/game.js | raw form instead of yukiForm: a human form below realm 7 picks the human pool | caught | 4653854 passed, 1 failed |
| R4 | js/core/story.js | line words: who James carries (great 1) | caught | 4653854 passed, 1 failed |
| R5 | js/core/story.js | line words: canon height (human 1) | caught | 4653854 passed, 1 failed |
| R6 | js/core/story.js | line words: the cat's place (yuki 2) | caught | 4653854 passed, 1 failed |
| R7 | js/core/story.js | line words: the count (yuki 2) | caught | 4653854 passed, 1 failed |
| R8 | js/core/story.js | line numbers swapped inside one foot line (mei 1) | caught | 4653854 passed, 1 failed |
| R9 | js/core/story.js | line words: bond speech to a local (human 2) | caught | 4653854 passed, 1 failed |
| R10 | js/core/story.js | line words: the great form speaking aloud (great 3) | caught | 4653854 passed, 1 failed |
| R13 | js/core/faq.js | FAQ realm of the great form | caught | 4653854 passed, 1 failed |
| R14 | js/core/news.js | What's new number against CARRY_F / CARRY_A | caught | 4653854 passed, 1 failed |
| RV-a | js/story/walks.js | a quiet mark dropped | caught | 4653854 passed, 1 failed |
| RV-b | js/core/story.js | the calm great line moved to the whooping one | caught | 4653854 passed, 1 failed |
| RV-c | js/core/story.js | quiet ignored | caught | 4653847 passed, 8 failed |
| RV-d | js/story/walks.js | rt_brawl_won alone dropped | caught | 4653895 passed, 3 failed |
| RV-e | js/core/faq.js | the FAQ's crossing clause dropped | caught | 4653854 passed, 1 failed |
| RV-f | js/core/faq.js | the FAQ's affection bar | missed |  |
| CF6 | js/core/story.js | on foot but flown time | caught | 4650937 passed, 6 failed |
| CF8 | js/core/story.js | the reason's pool ignored | caught | 4653845 passed, 10 failed |
| CF12 | js/core/faq.js | FAQ number wrong | caught | 4653854 passed, 1 failed |
| R11 | js/core/story.js | control: foot line numbers swapped in code | caught | 4653839 passed, 16 failed |
| R12 | js/core/faq.js | FAQ against the rule | caught | 4653854 passed, 1 failed |

34 caught, 1 missed, 0 not applied (of 35).

RV-f, an equivalent fault while CARRY_F === CARRY_A, caught after the source pin (tests/story.test.mjs, RV1 TG4): 1 caught of 1 (`/tmp` rerun). After RV1: 35 of 35.
