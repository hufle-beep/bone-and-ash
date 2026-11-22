| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/story/power.js | RG-A reverted: the preview builds the fight on the save; each draw of the tribute moves g.rng (Lu Han's d6) (re-anchored by Claude after the M1 fix: previewCopy | caught | 1190680 passed, 4 failed |
| C2 | js/story/power.js | the copy made but the builder run on the save: luSpread draws from g.rng on every draw (re-anchored by Claude after the M1 fix: previewCopy) | caught | 1190680 passed, 4 failed |
| C3 | js/story/power.js | the copy's random number written back: the draw still moves the save's stream (re-anchored by Claude after the M1 fix: previewCopy) | caught | 1190680 passed, 4 failed |
| C4 | js/main.js | TP regressed after the source pin's 2,500-character window: a held door card says the walk alone (2 h where the card says 3 h); uses the leftover taskMinutes im | caught | 1189671 passed, 1 failed |
| C5 | js/main.js | the tip skips the dry run for doors (falls back to card.minutes, the walk without the routine) | caught | 1189671 passed, 1 failed |
| C6 | js/core/news.js | the What's new line says the wrong thing about the old tip. Expected: missed (no pin on the line's facts) | missed |  |
| C7 | tools/check.mjs | sanity no longer waits for the models step: the --long log reads a missing or half-written models-long.json (existsSync false: silently empty) | caught | 560 passed, 1 failed |
| C8 | tools/browser.py | music_line's read record from the unflipped save (old calendar) while the game loads it flipped; pinned by tests/tools.test.mjs (flipFill(c) 3 times) | caught | 561 passed, 1 failed |
| C11 | js/story/power.js | M1 as first built: a shallow copy, the Long Forest's builder writes flags.lf_last on every draw (added by Claude) | caught | 1189671 passed, 1 failed |

8 caught, 1 missed, 0 not applied (of 9).
