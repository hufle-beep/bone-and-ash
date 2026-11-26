| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/act1_fallout.js | YM-3 off: the old pair every evening | caught | 1294418 passed, 8 failed |
| F2 | js/story/act1_fallout.js | the laugh choice gives the manners reply | caught | 1294423 passed, 3 failed |
| F3 | js/core/week.js | YM-f misses pair 2's laugh label | caught | 1294424 passed, 2 failed |
| F4 | js/core/lines.js | lastReply cycles back to the old reply | caught | 1294424 passed, 2 failed |
| F5 | js/main.js | the two-speaker line only from three | caught | 1294425 passed, 1 failed |
| F6 | js/core/game.js | postureCount ignores staggered foes and the round | caught | 1294424 passed, 2 failed |
| F7 | js/story/act1_blackroot.js | the post-spring blush line before the spring | caught | 1294423 passed, 3 failed |
| F8 | js/story/act1_fallout.js | the honeycomb's look back | caught | 1294425 passed, 1 failed |
| C1 | js/story/act1_fallout.js | YM-3 off by one: evening 1 shows pair 1, the old pair never first. Expected caught (P47-B YM-3 labels by k % 3). | caught | 1294412 passed, 14 failed |
| C2 | js/story/act1_fallout.js | label and reply out of step: choice 0 always gives the old pair's reply. Expected caught (P47-B YM-3 reply includes YM_PAIRS[k].r0). | caught | 1294424 passed, 2 failed |
| C3 | js/story/act1_blackroot.js | Ya's after-the-spring line falls back to the old beat. Expected caught (PN-f b: /where it ends/, !/where it starts/). (adapted by Claude after RV-A: the line wa | caught | 1294425 passed, 1 failed |
| C4 | js/story/act1_blackroot.js | a place word back in a talk read in the Drowned Wood. Expected MISSED (TG1; measured: story test passed with it planted). | caught | 1294425 passed, 1 failed |
| C5 | js/story/act1_fallout.js | Claude's cut on ym2:0:label reverted to Fable's draft. Expected MISSED (TG2; measured). | caught | 1294425 passed, 1 failed |
| C6 | js/core/game.js | the hint counts a foe already silenced by a remark (holdNow / holdNowMany over a flustered speaker; the remark itself still skips it). Expected MISSED (TG4; mea | caught | 1294425 passed, 1 failed |
| C7 | js/story/ashfall.js | the fungus gets an Earth-plain trait back. Expected caught by the TG-C1 hash only (the PN-f f regex pins 'pores that shut at a touch' alone); not measured. | caught | 1294425 passed, 1 failed |

15 caught, 0 missed, 0 not applied (of 15).
