| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/ashfall.js | the roof's line after back to a cycle of three (texts 4-6 get the old lines) | caught | 193796 passed, 3 failed |
| F2 | js/story/ashfall.js | the first week's lines on a cycle of six (its 4th night a missing line) | caught | 193797 passed, 2 failed |
| F3 | js/story/act1_blackroot.js | the cooked test inverted | caught | 193737 passed, 62 failed |
| F4 | js/story/act1_blackroot.js | AH 2's open printed as a function | caught | 193794 passed, 5 failed |
| F5 | js/story/act1_blackroot.js | AH 3 mei keeps the stew on a no-cook day | caught | 193797 passed, 2 failed (rerun alone after its pattern was fixed for RT's phrase) |
| F6 | js/story/act1_blackroot.js | the pot's two versions swapped | caught | 193796 passed, 3 failed |
| F7 | js/core/tasks.js | TL undone: away cards back tomorrow | caught | 193798 passed, 1 failed |
| F8 | js/core/tasks.js | TL: the done-menu path still shows her card as tomorrow | caught | 193798 passed, 1 failed |
| F9 | js/story/act1_blackroot.js | onceADay drops the away test (the cinderberries) | caught | 193797 passed, 2 failed |
| F10 | js/story/act1_blackroot.js | the spar's away test on the wrong woman | caught | 193798 passed, 1 failed |
| F11 | js/story/act1_blackroot.js | CK undone: a raw meal reads as cooked | caught | 193798 passed, 1 failed |
| F12 | js/story/act1_blackroot.js | CK: 'raw' counted as cooked | caught | 193798 passed, 1 failed |
| F13 | js/story/ashfall.js | RT undone: line 4 sleeps before village_night | caught | 193797 passed, 2 failed |
| F14 | js/story/ashfall.js | RT L2 undone | caught | 193797 passed, 2 failed |
| RT1 | js/story/ashfall.js | (ported) Claude's cut on roof 2:4 reverted (laughing back to shaking) | caught | 193798 passed, 1 failed |
| RT2 | js/story/ashfall.js | (ported) Claude's cut on roof 2:4's line after reverted | caught | 193797 passed, 2 failed |
| RT3 | js/story/ashfall.js | a word changed in roof text 5 (texts 4-6 have no whole-text pin) | caught | 193798 passed, 1 failed |
| RT4 | js/story/act1_blackroot.js | RR 3's no-cook end has James serving again | caught | 193798 passed, 1 failed |
| RT5 | js/story/ashfall.js | the neighbour swapped for the mother in roof text 4 | caught | 193798 passed, 1 failed |
| RT6 | js/story/act1_blackroot.js | AH 2's no-cook open brings the pot back | caught | 193798 passed, 1 failed |
| RT7 | js/story/ashfall.js | a 'tonight' put back into a new roof text (the cuts took two out) | caught | 193797 passed, 2 failed |
| RC1 | js/story/act1_blackroot.js | (ported) cookedToday by the calendar day, not wakeDay: a fireside after midnight on a day he cooked reads the no-cook text | caught | 193769 passed, 30 failed |
| RC2 | js/core/tasks.js | done-menu path: the cinderberries hidden whenever the Forage is done, even with Mei Lin there (no 'tomorrow') | caught | 193798 passed, 1 failed |
| RC3 | js/story/ashfall.js | (ported) Claude's cut on roof text 4 reverted (shaking) | caught | 193798 passed, 1 failed |
| RC4 | js/story/act1_blackroot.js | a no-cook text (RR2_CLOSE) changed past its pinned first sentence | caught | 193798 passed, 1 failed |
| RC5 | js/story/ashfall.js | (ported) roof line after 5 changed past its first words (texts and lines 4-6 not pinned) | caught | 193798 passed, 1 failed |
| RC6 | js/story/act1_blackroot.js | the camp's real Cook and eat. marks another key: every fireside reads no-cook in play (the ML tests mark bl_cook by hand) | caught | 190614 passed, 7 failed |

27 caught, 0 missed, 0 not applied (of 27; F5 rerun alone).
