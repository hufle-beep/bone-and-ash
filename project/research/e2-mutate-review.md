| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/story/again.js | SD's fold loses the split flag (Read it all again opens a same-day split fold as first sentence only) | caught | 191823 passed, 1 failed |
| R2 | js/story/again.js | a paragraph fold's rest (3+ paragraphs) joined into one run: Read it all again merges paragraphs | not applied | find not in the file |
| R3 | js/story/again.js | the food stock dropped from the fold's parts: bl_camp's story + stock text folds by sentence and loses the stock | caught | 191822 passed, 2 failed |
| R4 | js/story/again.js | won scenes (far_won, mire_won, boar_won, night_won) never split-fold | caught | 191822 passed, 2 failed |
| R5 | js/story/again.js | a sentence opening with a curly quote no longer splits (no game text uses one) | not applied | find not in the file |
| R6 | js/main.js | Read it all again stays open across visits for split folds | missed |  |

3 caught, 1 missed, 2 not applied (of 6).
