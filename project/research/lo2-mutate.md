# v0.11.225 (LO2 + RV1): planted faults (`tools/mutate.mjs`)

Faults: mine in `lo2-faults.json` (19 after RV1: F5/F6 rewritten for WMa, F15–F17 for M1, L2, L3), the review's in `lo2-faults-review.json` (R1–R7; R4 and R5 were on `firstOfWeek`, gone with WMa). Run against `node tests/story.test.mjs --quick` after RV1's build (F14 against `node tests/models.test.mjs --model careful --cal 7 --games 10`).

| Fault | What it breaks | Result |
|---|---|---|
| F1 | RS: a run says no relationship change | caught |
| F2 | RS: the probe reads the relationship lines as text | caught |
| F3 | RS: a Coil's reset said as a loss | caught |
| F4 | PE: every door at 0 reads as set | caught |
| F5 | WM: three bites on the long calendar | caught |
| F6 | WM: the old calendar counts the flag too | caught |
| F7 | SN: `nx >= wd` | missed: equivalent (the review agrees) |
| F8 | SN: the waking day said as the calendar day | not applied after RV1 (the line became `wakeCal`; F16 covers it) |
| F9 | SN: the spaced doors not shown | caught |
| F10 | OL: only the hub tapped on | caught |
| F11 | OL: a skipped tap drops the kept row | caught |
| F12 | FD: the door's time without the routine | caught |
| F13 | FD: the dry run eats the real save's routine | caught |
| F14 | BK: the bots count every row again | caught by the models test (the story test can't see it) |
| F15 | FD (M1): a door the routine closes shows the routine plus the walk | caught |
| F16 | SN (L2): a day late between 00:00 and 04:00 | caught |
| F17 | SN (L3): the spaced cards last | caught |
| R1 | RS: every step says the whole change so far | caught |
| R2 | RS: every change under the run's first day | missed: on the saves we have a run never spans two days with a change (the wilds stop each evening; the Fallout save starts in the evening); the per-day check (TG1) passes with it |
| R3 | RS: a shallow copy | caught |
| R6 | RS: the step before a stop says nothing | caught |
| R7 | SN: a New door read as Skilled | caught |

20 of 22 caught (F14 by the models test); F7 equivalent; R2 a known gap (needs a save of a stay whose nights fold, mid-day).
