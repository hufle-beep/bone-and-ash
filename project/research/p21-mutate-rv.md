| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/main.js | NT UI: the net tag gone from Yuki's bar | caught | 4292370 passed, 1 failed |
| C2 | js/story/prologue.js | MT: the bluff's DC 7 -> 5 after the fight | not applied | find not in the file |
| C3 | js/story/prologue.js | MT: the pin's Qi 8 -> 2 | caught | 4282699 passed, 2 failed |
| C4 | js/story/prologue.js | MT: bluffBonus's scale penalty becomes a bonus | missed |  |
| C5 | js/core/game.js | WP: 35 in every fight, not only the tribute | caught | 19222 passed, 3 failed |
| C6 | js/core/story.js | NT: the one-move finish drops RR's reading line and adds a stray line | not applied | find not in the file |
| C7 | js/core/game.js | NT: every people fight nets Yuki (Gao, arson, Ya's brawl, the elder...) | caught | 4335589 passed, 1 failed |
| C8 | js/story/prologue.js | MT: an old save on collectors_won (no lu_won) gets an undefined speech | not applied | find not in the file |
| C9 | js/core/faq.js | FM: the FAQ's tribute step reads the common step (0.5 for 1.5) | caught | 4292370 passed, 1 failed |
| C10 | js/story/prologue.js | MT: a hairpin left in the hammerspace after the paid tribute | not applied | find not in the file |
| F9 | js/story/common.js | LH: 1.5 → 1 (the test reads the constant) | caught | 4292370 passed, 1 failed |

6 caught, 1 missed, 4 not applied (of 11).
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C2b | js/story/prologue.js | C2 re-anchored | not applied | find occurs more than once |
| C4 | js/story/prologue.js | bluffBonus sign | caught | 4292355 passed, 1 failed |
| C8b | js/story/prologue.js | C8 re-anchored | caught | 4292369 passed, 2 failed |
| C10b | js/story/prologue.js | C10 re-anchored | caught | 4292370 passed, 1 failed |

3 caught, 0 missed, 1 not applied (of 4).
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C2c | js/story/prologue.js | C2 re-anchored: the won screen bluff DC 5 | caught | 4292355 passed, 1 failed |

1 caught, 0 missed, 0 not applied (of 1).
