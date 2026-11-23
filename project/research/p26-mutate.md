| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | the slower pace from Golden Core, not True Core | caught | 11830461 passed, 10 failed |
| F2 | js/core/game.js | RP-1.5 reverted | caught | 11830462 passed, 9 failed |
| F3 | js/core/game.js | the pace reads Yuki's realm | caught | 11830464 passed, 7 failed |
| F4 | js/story/prologue.js | LN reverted | caught | 11832347 passed, 3 failed |
| F5 | js/story/prologue.js | LR reverted | caught | 11830468 passed, 3 failed |
| F6 | js/story/prologue.js | LR counts every realm, not the reads | caught | 11831330 passed, 3 failed |
| F7 | js/story/prologue.js | LN and LR after the long step (unrounded, ×1 not ×1.375) | caught | 11833267 passed, 3 failed |
| F8 | js/core/news.js | the What's new line's number wrong | caught | 11830470 passed, 1 failed |
| C1 | js/story/prologue.js | LN dropped: Lu Han's long-calendar HP not lowered by 0.5 (expected caught: the LH pin and the P26-A rows) | caught | 11832347 passed, 3 failed |
| C2 | js/story/prologue.js | LR capped at 4 reads (realm 5): Lu Han's HP short from Soul Embryo up (TG2: the rows stop at realm 5) | caught | 11830470 passed, 1 failed |
| C3 | js/story/prologue.js | LR added after the long step, not before (×1.375 lost, rounded on its own) | caught | 11830469 passed, 2 failed |
| C4 | js/story/prologue.js | LR counts James's realm, not Lu Han's reads: +0.5 at Foundation already | caught | 11831330 passed, 3 failed |
| C5 | js/story/prologue.js | LN skipped whenever the militia or the spears helped (TG1: no LN/LR pin with militia) | caught | 11832349 passed, 1 failed |
| C6 | js/core/game.js | ÷6 from Golden Core, not True Core (off by one at the boundary) | caught | 11830462 passed, 9 failed |
| C7 | js/core/game.js | ÷6 only realms 3-6: realms 7-13 back to ÷4 (a sit hides it behind the 0.1 floor; the root +3% and a seclusion faster there) | caught | 11830469 passed, 2 failed |
| C8 | js/core/game.js | the FL1 floor only on ÷4: from True Core realms 9-13 a sit rounds to 0, Cultivate hidden (sitUseless) | caught | 11830467 passed, 4 failed |
| C9 | js/core/news.js | What's new says the reverse of LN (TG3: only /Lu Han/ is pinned in that sentence) | caught | 11830470 passed, 1 failed |
| C10 | js/core/game.js | the optional chain dropped: satDiv({ cal: 7 }) (a state with no james) throws | caught | TypeError: Cannot read properties of undefined (reading 'realm') |

18 caught, 0 missed, 0 not applied (of 18).
