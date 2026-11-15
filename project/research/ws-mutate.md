# Planted faults, v0.11.190 (N1, RV1)

The review's 18 (`/tmp/n1r/faults.json`, 12 caught before RV1; F5, F6, F9, F14, F15, F17 missed) adapted to RV1's texts, plus F19–F23 for RV1's fixes: run after RV1, `node tools/mutate.mjs ws-faults.json --jobs 2` (story test, --quick). F23 missed on the first run (the lint's pools); after the story test's TG1 pin: caught.

## Before RV1 (the review's run)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | btWho: Act 1's Ashfall no longer excluded | caught | 4672321 passed, 57 failed |
| F2 | js/story/prologue.js | awakeWho: drops the yuki_return === bt_return gate (Long Forest hub) | caught | 4672376 passed, 2 failed |
| F3 | js/story/prologue.js | M/P swapped for Ya away and the Old Tree | caught | 4672374 passed, 4 failed |
| F4 | js/story/prologue.js | btWho: both away gives P | caught | 4672374 passed, 4 failed |
| F5 | js/story/prologue.js | HM: Ya speaks while she is away | missed |  |
| F6 | js/story/prologue.js | HP/HM placed after Yuki's first words (brief: before she first speaks) | missed |  |
| F7 | js/story/prologue.js | tiger paragraph before Yuki's bond line | caught | 4672377 passed, 1 failed |
| F8 | js/story/prologue.js | TP: a time word ('this morning') in a text shown at any hour | caught | 4672377 passed, 1 failed |
| F9 | js/story/prologue.js | HP: the healer's beat given to Ya (and 'And I have talked' now hers) | missed |  |
| F10 | js/story/songs.js | opening sentence on the day's first song too | caught | 4672375 passed, 3 failed |
| F11 | js/story/music.js | SK1: p not kept; a redraw drops the sentence | caught | 4672376 passed, 2 failed |
| F12 | js/story/music.js | a song the day before counts as today's | caught | 4672377 passed, 1 failed |
| F13 | js/story/music.js | redraw without the sentence | caught | 4672377 passed, 1 failed |
| F14 | js/story/songs.js | durin: a time word against when it shows (evening/any hour) | missed |  |
| F15 | js/story/songs.js | boof_pack: someone not at the camp | missed |  |
| F16 | js/story/act1_return.js | SW: +2 with both flags | caught | 4672375 passed, 3 failed |
| F17 | js/story/songs.js | waters_call: a wrong count (the day's songs) | missed |  |
| F18 | js/story/prologue.js | paragraph run into the anchor sentence (no blank line) | caught | 4672365 passed, 13 failed |

12 caught, 6 missed, 0 not applied (of 18).

## After RV1

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/prologue.js | btWho: Act 1's Ashfall no longer excluded | caught | 4672335 passed, 57 failed |
| F2 | js/story/prologue.js | awakeWho: drops the yuki_return === bt_return gate (Long Forest hub) | caught | 4672390 passed, 2 failed |
| F3 | js/story/prologue.js | M/P swapped for Ya away and the Old Tree | caught | 4672387 passed, 5 failed |
| F4 | js/story/prologue.js | btWho: both away gives P | caught | 4672388 passed, 4 failed |
| F5 | js/story/prologue.js | HM: Ya speaks while she is away | caught | 4672390 passed, 2 failed |
| F6 | js/story/prologue.js | HP/HM placed after Yuki's first words (brief: before she first speaks) | caught | 4672389 passed, 3 failed |
| F7 | js/story/prologue.js | tiger paragraph before Yuki's bond line | caught | 4672390 passed, 2 failed |
| F8 | js/story/prologue.js | TP: a time word ('this morning') in a text shown at any hour | caught | 4672391 passed, 1 failed |
| F9 | js/story/prologue.js | HP: the healer's beat given to Ya (and 'And I have talked' now hers) | caught | 4672391 passed, 1 failed |
| F10 | js/story/songs.js | opening sentence on the day's first song too | caught | 4672387 passed, 5 failed |
| F11 | js/story/music.js | SK1: p not kept; a redraw drops the sentence | caught | 4672385 passed, 7 failed |
| F12 | js/story/music.js | a song the day before counts as today's | caught | 4672391 passed, 1 failed |
| F13 | js/story/music.js | redraw without the sentence | caught | 4672391 passed, 1 failed |
| F14 | js/story/songs.js | durin: a time word against when it shows (evening/any hour) | caught | 4672390 passed, 2 failed |
| F15 | js/story/songs.js | boof_pack: someone not at the camp | caught | 4672391 passed, 1 failed |
| F16 | js/story/act1_return.js | SW: +2 with both flags | caught | 4672389 passed, 3 failed |
| F17 | js/story/songs.js | waters_call: a wrong count (the day's songs) | caught | 4672391 passed, 1 failed |
| F18 | js/story/prologue.js | paragraph run into the anchor sentence (no blank line) | caught | 4672377 passed, 15 failed |
| F19 | js/story/prologue.js | RV1 M1 undone: "Then she" after the paragraph | caught | 4672377 passed, 15 failed |
| F20 | js/story/songs.js | RV1 L9: a junk p on redraw adds the sentence | caught | 4672391 passed, 1 failed |
| F21 | js/story/music.js | RV1 L9: a junk earlier song counts | caught | 4672391 passed, 1 failed |
| F22 | js/story/prologue.js | RV1 L2 undone | caught | 4672391 passed, 1 failed |
| F23 | tools/textlint.mjs | RV1 TG1: the awake pool left out of the lint | missed |  |

22 caught, 1 missed, 0 not applied (of 23).

[exited with code 0]
