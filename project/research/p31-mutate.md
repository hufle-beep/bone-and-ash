# P31-A — planted faults (v0.11.263)

Command: `node tests/story.test.mjs --games 2 --workers 1`, 2 jobs; Claude's F1–F7 (`p31-faults.json`) and the reviewer's R1–R7 (`p31-faults-review.json`), on the build with the review's fixes and test gaps (TG1, TG4 part, TG5). The first run stopped before planting: the Heart's code pin (P6A TG1) after M1's fix, re-pinned.

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/calendar.js | K1: the story day from midnight again | caught | 1296459 passed, 13 failed |
| F2 | js/core/calendar.js | K1/FD: the pin dropped (a week's card's result reads the day it ends) | caught | 1296466 passed, 6 failed |
| F3 | js/core/game.js | K2: the night to 04:00 again (and the text day with it, lines.js) | caught | 1296463 passed, 9 failed |
| F4 | js/core/game.js | K2: the waking day's counter turns at 04:00 (the daily marks a day ahead at 04:00–04:59) | caught | 1296471 passed, 1 failed |
| F5 | js/story/act1_fallout.js | L1g: the depart sets the clock back again | caught | 1296471 passed, 1 failed |
| F6 | js/story/oneoff.js | K2: Call it a day from 04:00 (in the night); expected to survive unless a hub at 04:30 shows it (the M1 assert reads it) | missed |  |
| F7 | js/core/week.js | K2: a spaced card's 'opens Day N' by 04:00; expected to survive (no test at 04:xx on the planner's door notes) | missed |  |
| R1 | js/core/calendar.js | K1 boundary: the story day turns at 04:59, one minute before the text and waking day. Expected to be caught by story P31-A (K1) sd(at(65, 4, 59)) === 10 and the | caught | 1296470 passed, 2 failed |
| R2 | js/core/lines.js | K2: the text day back at 04:00, out of step with the story and waking day. Expected to be caught by story P31-A's first assert (TEXT_DAY_FROM 300) and the three | caught | 1296467 passed, 5 failed |
| R3 | js/core/tasks.js | K2: the week's work day turns at 04:00 again (workRoom, stayRoom, the plan's done day). Expected to be caught by story P31-A (K1, K2) the three-clocks loop (wor | caught | 1296470 passed, 2 failed |
| R4 | js/core/game.js | gainCounts' waking day from midnight (a week's gain counted on the next story day at 00:00-04:59 of a stay's last night). Expected to survive (no gainCounts tes | caught | 1296470 passed, 2 failed |
| R5 | js/story/act1_fallout.js | FD: dd drops the pin (a week's card's result reads the day it ends, not the day its work started). Expected to be caught by story P30-A (D4): fo_council under a | caught | 1296470 passed, 2 failed |
| R6 | js/story/act1_fallout.js | L1g: fo_depart sets the clock back by up to an hour after midnight (the end minute unchanged: still Day 65 06:00). Expected to be caught by story P31-A (K2, L1g | missed |  |
| R7 | js/story/act1_fallout.js | FD: onStoryDay by the calendar day from midnight and without the pin (Day 58 00:11 reads day 10's reply). Expected to be caught by story P30-A (D1): the palisad | caught | 1296469 passed, 3 failed |

11 caught, 3 missed, 0 not applied (of 14).

Survivors: F6 ("Call it a day" from 04:00) and F7 (`wakeCal` by 04:00) as expected (no test at 04:xx on those two); R6 (fo_depart back up to an hour, the end minute the same: the walk and `dep` tests read the end minute only). Open, options later, with the review's TG4 rest.
