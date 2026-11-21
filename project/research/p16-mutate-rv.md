# v0.11.246 (P16-A): the planted faults after RV

Run on a scratch copy of the build after RV (`node tools/mutate.mjs … --cmd "node tests/story.test.mjs --games 2 --workers 1" --jobs 1`). Claude's F1–F12, then the code reviewer's C1–C8 (C6 re-aimed at RV's redrafted fireside 5; C4 an equivalent mutant in play, the reviewer's own call).

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/act1_blackroot.js | AH: the second stay reads the first stay's list | caught | 192101 passed, 7 failed |
| F2 | js/story/act1_blackroot.js | AH: the old calendar's day 15 reads the new texts | caught | 192107 passed, 1 failed |
| F3 | js/story/act1_blackroot.js | AH: the second stay's away versions lost (Ya named while away) | caught | 192105 passed, 3 failed |
| F4 | js/story/act1_blackroot.js | BF: the Ashen Hills' fifth fireside dropped | caught | 192103 passed, 5 failed |
| F5 | js/story/act1_blackroot.js | LG: the pass no longer waits for Ya's door | caught | 192104 passed, 4 failed |
| F6 | js/story/act1_blackroot.js | LG: the beetle pleases Ya while she is away | caught | 192107 passed, 1 failed |
| F7 | js/story/act1_blackroot.js | LG: the cairn while both are away | caught | 193631 passed, 2 failed |
| F8 | js/story/prologue.js | FC: the first flight after every Foundation breakthrough | caught | 192106 passed, 2 failed |
| F9 | js/story/prologue.js | FC: Act 1's Ashfall sees the flight (party text in the village) | caught | 192106 passed, 2 failed |
| F10 | js/story/prologue.js | BYb-t undone | caught | 192107 passed, 1 failed |
| F11 | js/story/coil_scenes.js | KA (b): the Act 1 kept paragraph never shown | caught | 192107 passed, 1 failed |
| F12 | js/story/prologue.js | FC: shown again in the same Coil after a reload of the breakthrough | caught | 192106 passed, 2 failed |

12 caught, 0 missed, 0 not applied (of 12).

|---|---|---|---|---|
| C1 | js/story/prologue.js | FC: Act 1's Ashfall (fo_ashfall, rt_ashfall) reads 'alone' (btWho null there): "Nobody is about" in the street | caught | 192107 passed, 1 failed |
| C2 | js/story/prologue.js | FC: the Old Tree (heart_hub, btWho T) reads 'alone' with Mei Lin and Ya there | caught | 192107 passed, 1 failed |
| C3 | js/story/prologue.js | FC: Back to earth always to the forest stream, not to the hub of the breakthrough | caught | 192105 passed, 3 failed |
| C4 | js/story/act1_blackroot.js | LG: the beetle pleases Ya while both women are away (bothAway before bl_day 4) | missed |  |
| C5 | js/story/act1_blackroot.js | AH: the second stay's three keyed on the first stay's day count (starts mid-list when a first-stay day had no hunt) | caught | 192107 passed, 1 failed |
| C6 | js/story/act1_blackroot.js | BF: FS_RR 5's meal line swapped (the pan on a day he did not cook) (re-aimed by Claude after RV (T M3) redrafted fireside 5: the same swap on the new lines) | caught | 192107 passed, 1 failed |
| C7 | js/story/act1_blackroot.js | BF: FS_AH_T[5]'s ya branch lost ("undefined" when only Ya is close) | caught | 192107 passed, 1 failed |
| C8 | js/story/prologue.js | NF6: night 16's fire line reversed (the fire pops with no fire) | caught | 192106 passed, 2 failed |

7 caught, 1 missed, 0 not applied (of 8).
