# P14 planted faults after RV1 (node tests/story.test.mjs --games 2 --workers 1)

F9 and TF3 had finds in lines RV1 reworded; their finds were updated and each rerun alone: caught. Totals: Claude's 10 of 10, T's 7 of 7, C's 6 of 6 (C6 by a crash in P10-A's test before TG-C4's assert).

## p14-faults
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/ashfall.js | EVn-23 undone: weeks 2 and 3 back to three | caught | 194029 passed, 15 failed |
| F2 | js/story/ashfall.js | week 3 reads week 2's six | caught | 194031 passed, 13 failed |
| F3 | js/story/ashfall.js | the woman's line in italics (2:4) | caught | 194042 passed, 2 failed |
| F4 | js/story/prologue.js | a stray slot left in forest 15 | caught | 194038 passed, 6 failed |
| F5 | js/story/prologue.js | forest 13's fire split inverted | caught | 194038 passed, 6 failed |
| F6 | js/story/prologue.js | forest 10: the cat reads the great form's line | caught | 194041 passed, 3 failed |
| F7 | js/story/ashfall.js | C-a undone in one form: count under the dishes | caught | 194042 passed, 2 failed |
| F8 | js/story/prologue.js | a barred fold opener (forest 15) | caught | 194036 passed, 8 failed |
| F9 | js/story/ashfall.js | 3:5's Yuki slot dropped | not applied | find not in the file |
| F10 | js/story/ashfall.js | D1's canon fix undone (3:4) | caught | 194042 passed, 2 failed |

9 caught, 0 missed, 1 not applied (of 10).

## p14-faults-review-t
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| TF1 | js/story/ashfall.js | a form word in the shared part after its first sentence (2:6): the great form and the woman read 'the small white cat' | caught | 194043 passed, 1 failed |
| TF2 | js/story/prologue.js | somebody not yet met named in the forest, in a no-fire branch (11) | caught | 194043 passed, 1 failed |
| TF3 | js/story/prologue.js | forest 14: the great form reads the cat's line (a tiger on his stomach) | not applied | find not in the file |
| TF4 | js/story/ashfall.js | C-a undone: 'count' under the dishes' reply (P10-A T M2) | caught | 194042 passed, 2 failed |
| TF5 | js/story/ashfall.js | 3:5: the great form speaks aloud (the woman's line in the great slot) | caught | 194041 passed, 3 failed |
| TF6 | js/story/prologue.js | a time word ('tomorrow') in a no-fire branch (12) | caught | 194043 passed, 1 failed |
| TF7 | js/story/prologue.js | forest 12: the great form in his lap (a cat's place) | caught | 194042 passed, 2 failed |

6 caught, 0 missed, 1 not applied (of 7).

## p14-faults-review-c
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/story/prologue.js | forest 15: the great form reads the cat's 'draped over your shoulder' (a tiger on the shoulder) | caught | 194042 passed, 2 failed |
| C2 | js/story/prologue.js | forest 12: byForm great and human swapped (the woman washes a great paw) | caught | 194042 passed, 2 failed |
| C3 | js/story/ashfall.js | 2:5: the great form tucked under James's arm (the cat's line) | caught | 194043 passed, 1 failed |
| C4 | js/story/ashfall.js | the old calendar reads the long weeks' sequences (vday 2: text 1 of week 2, vday 3: text 1 of week 3) | caught | 194042 passed, 2 failed |
| C5 | js/story/prologue.js | forest 11: the woman "sends" (the bond) though aloud in quotes | caught | 194042 passed, 2 failed |
| C6 | js/story/ashfall.js | weeks 2 and 3 count on the shared quiet key: in a real game week 2 starts at week 1's count (6 or 7), so it opens on text 1 or 2 and week 3 at about 13 | caught | TypeError: Cannot read properties of undefined (reading 'length') |

6 caught, 0 missed, 0 not applied (of 6).
