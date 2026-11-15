| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | Act 1's Ashfall (fo_ashfall, rt_ashfall) gets the women's camp line under the village's closer | caught | 4672203 passed, 52 failed |
| F2 | js/story/prologue.js | Ashen Hills with Ya away: the party text (Ya speaking) instead of Mei Lin's own | caught | 4672229 passed, 26 failed |
| F3 | js/story/prologue.js | realm 9 (Immortal Ascension) gets step E: 'nothing came' while the sky muttered | caught | 4672254 passed, 1 failed |
| F4 | js/story/prologue.js | step E (realms 10-11, no sky) says the sky came | missed |  |
| F5 | js/story/prologue.js | TA no longer climbs up after him; reads as a camp under the tree frame | missed |  |
| F6 | js/story/prologue.js | canon: a local senses James's cultivation | missed |  |
| F7 | js/story/prologue.js | MB: Ya present while she has walked off (verb outside the test's list) | missed |  |
| F8 | js/story/prologue.js | PG against realms 8-9's bodies (one bolt / one mutter) | missed |  |
| F9 | js/story/prologue.js | PD gets a time word the NIGHTW regex misses; wrong by day | missed |  |
| F10 | js/story/prologue.js | PB gets a ground word (ashes) the \bash\b regex misses; wrong at rr_hub / dw_hub / rt_camp | missed |  |
| F11 | js/story/prologue.js | realms 3-14 lose the women's line | caught | 4672051 passed, 204 failed |
| F12 | js/story/prologue.js | Old Tree at night gets the camp text under the tree frame | caught | 4672242 passed, 13 failed |
| F13 | js/story/kitchen.js | L5a reverted: take-over at 25 with a cold closer | caught | 4672250 passed, 5 failed |
| F14 | js/story/act1_fallout.js | K3 never shows: stage 3 gets the shared-hearth clause | caught | 4672254 passed, 1 failed |
| F15 | js/story/act1_fallout.js | K3 contradicts the take-over it is gated on (pinned words still pass) | missed |  |
| F16 | tools/textlint.mjs | the 21 texts leave the bt_place pool: tics and reused runs unchecked | missed |  |
| F17 | js/story/prologue.js | TF: a camp fire on the lip of the Old Tree | missed |  |
| F18 | js/story/prologue.js | Mei Lin alone (no ya_party) gets a text in which Ya speaks; no test sets one flag without the other | missed |  |

7 caught, 11 missed, 0 not applied (of 18).

## After RV1 (DR1): all 18

| Fault | File | What it breaks | Result | Detail |
| F1 | js/story/prologue.js | Act 1's Ashfall (fo_ashfall, rt_ashfall) gets the women's camp line under the village's closer | caught | 4672268 passed, 52 failed |
| F2 | js/story/prologue.js | Ashen Hills with Ya away: the party text (Ya speaking) instead of Mei Lin's own | caught | 4672294 passed, 26 failed |
| F3 | js/story/prologue.js | realm 9 (Immortal Ascension) gets step E: 'nothing came' while the sky muttered | caught | 4672319 passed, 1 failed |
| F5 | js/story/prologue.js | TA no longer climbs up after him; reads as a camp under the tree frame | caught | 4672319 passed, 1 failed |
| F6 | js/story/prologue.js | canon: a local senses James's cultivation | caught | 4672319 passed, 1 failed |
| F7 | js/story/prologue.js | MB: Ya present while she has walked off (verb outside the test's list) | caught | 4672319 passed, 1 failed |
| F9 | js/story/prologue.js | PD gets a time word the NIGHTW regex misses; wrong by day | caught | 4672319 passed, 1 failed |
| F10 | js/story/prologue.js | PB gets a ground word (ashes) the \bash\b regex misses; wrong at rr_hub / dw_hub / rt_camp | caught | 4672319 passed, 1 failed |
| F11 | js/story/prologue.js | realms 3-14 lose the women's line | caught | 4672116 passed, 204 failed |
| F12 | js/story/prologue.js | Old Tree at night gets the camp text under the tree frame | caught | 4672307 passed, 13 failed |
| F13 | js/story/kitchen.js | L5a reverted: take-over at 25 with a cold closer | caught | 4672315 passed, 5 failed |
| F14 | js/story/act1_fallout.js | K3 never shows: stage 3 gets the shared-hearth clause | caught | 4672319 passed, 1 failed |
| F15 | js/story/act1_fallout.js | K3 contradicts the take-over it is gated on (pinned words still pass) | caught | 4672319 passed, 1 failed |
| F16 | tools/textlint.mjs | the 21 texts leave the bt_place pool: tics and reused runs unchecked | caught | 4672319 passed, 1 failed |
| F18 | js/story/prologue.js | Mei Lin alone (no ya_party) gets a text in which Ya speaks; no test sets one flag without the other | caught | 4672319 passed, 1 failed |
| F4, F8 | (after TG1's E and G pins) | | caught | |
| F17 | (adapted to RV1's TF: "Mei Lin sits across the fire from you.") | | caught | |

18 caught, 0 missed (of 18).
