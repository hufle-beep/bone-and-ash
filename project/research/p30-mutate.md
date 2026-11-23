# P30-A — planted faults (v0.11.262)

Command: `node tests/story.test.mjs --games 2 --workers 1`, 2 jobs.

## Claude's F1–F6 (`p30-faults.json`; on the build before the review's test gaps)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/act1_fallout.js | D1: the Fallout's day from midnight again (day 8's supper after midnight reads day 9's text) | caught | 1296450 passed, 5 failed |
| F2 | js/story/act1_fallout.js | D1/D4: the pin dropped (a week's card's result reads the day it ends, not the day it began) | caught | 1296450 passed, 5 failed |
| F3 | js/story/act1_fallout.js | D2: the farewell's last day from midnight again (00:11 after Day 10's last day gives the supper) | caught | 1296453 passed, 2 failed |
| F4 | js/story/act1_fallout.js | D2: the farewell on any day of story day 10's week | caught | 1201786 passed, 3 failed |
| F5 | js/story/act1_fallout.js | D1: the day replies (onStoryDay) from midnight and without the pin | caught | 1296452 passed, 3 failed |
| F6 | js/story/act1_fallout.js | D1: the Fallout's day one behind | caught | TypeError: Cannot read properties of undefined (reading 'index') |

6 caught of 6.

## The reviewer's R1–R6 (`p30-faults-review.json`; after TG1, TG3–TG5)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| R1 | js/story/act1_fallout.js | D1: onStoryDay alone ignores the pin (a week's card's success reply reads the day it ends, not the day it began; dd and the council flags keep the pin). Expecte | caught | 1296456 passed, 3 failed |
| R2 | js/story/act1_fallout.js | D2: the farewell's last day by the waking day (04:00) instead of the text day (05:00): Day 65 04:30 no farewell. Expected to be caught by the P30-A block (D2, f | caught | 1296457 passed, 2 failed |
| R3 | js/story/act1_fallout.js | D1: the Fallout's day by the waking day (04:00), not the text day (05:00): day 8's supper at Day 51 04:30 reads day 9's text. Expected to be caught by the P30-A | caught | 1296458 passed, 1 failed |
| R4 | js/story/act1_fallout.js | D2: the farewell's day gate ignores the pin. Expected to survive (equivalent: farewellNow is read by the Evening card, toEvening and week.js:739, never inside a | missed |  |
| R5 | js/story/act1_fallout.js | D2: the last-day test clamped to story day 10 (no farewell on the Blackroot days' last days, e.g. Day 67 or, with calBl 1, Day 65 from 05:00). Expected to survi | caught | 1296457 passed, 2 failed |
| R6 | js/story/act1_fallout.js | D1: dd's floor 7 (the text day before Day 44 05:00 reads story day 7: no day-8 text). Expected to survive (Act 1 starts at Day 44 06:00, prologue.js:946; no Fal | caught | TypeError: FO_MEI_NEW[dd] is not iterable |

5 caught of 6. R4 missed as the reviewer expected: an equivalent change (`farewellNow` is never read inside a pin, so its day gate by `dd` or by `textStoryDay` is the same). R5 caught by TG4, R6 caught (a TypeError), both expected to survive the build as reviewed.
