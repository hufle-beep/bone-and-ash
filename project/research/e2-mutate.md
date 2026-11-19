| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/again.js | FR off: one-paragraph texts never fold | caught | 191818 passed, 6 failed |
| F2 | js/story/again.js | the rest of a split fold joined as paragraphs (equivalent: the review's L3; the join removed in RV1, so it no longer applies) | not applied | find not in the file |
| F3 | js/main.js | Read it all again opens a split fold as two paragraphs | caught | 191823 passed, 1 failed |
| F4 | js/story/again.js | sentences no longer split before a quote or a star (RV1: ported to the new split) | caught | 191822 passed, 2 failed |
| F5 | js/story/again.js | a one-sentence text folds to itself with an empty rest | caught | 191822 passed, 2 failed |
| F6 | js/story/again.js | VF's fold loses the split flag (RV1: ported) | caught | 191821 passed, 3 failed |
| F7 | js/story/again.js | the whole view says split | caught | 191822 passed, 2 failed |
| F8 | js/core/faq.js | the FAQ line lost | caught | 191823 passed, 1 failed |
| F9 | js/story/again.js | an earlier Coil's fold loses its memory line | caught | 191791 passed, 33 failed |

8 caught, 0 missed, 1 not applied (of 9).
