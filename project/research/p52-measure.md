# P52 — G2's read, the plan: KR and BP (2026-11-26, about 23:45; v0.11.283, f8f6923)

Reads and one model run only, nothing changed. The options built on it: `claude/p52-options.md` (the project doc).

**How:** a scratch copy of `tests/models.test.mjs` with counters (deleted after), `--games 100 --off 0`, one run per model
(Careful, the Sociable, the Completionist, the Cultivator; the long calendar; every test passed). Counted: every card tap on the
Blackroot's three camp hubs (`rr_hub`, `dw_hub`, `ah_hub`) by label, the forced picks and story taps there, the camp days
(Coil × waking day); and at every plan view on a stay (`weekRun`, where a player opens Plan the week) the card rows whose
count this week differs from the amount kept (`g.tasks.keep[hub]`).

## KR, the row showing the kept amount
A card row's number is what is left this week (`p.items`, counted down by each run, week.js line 133 / 668); each new week starts
from the amount kept (KC1). Mid-week a kept 1 reads 0; "+" on it keeps 2 (RV1 MK: the kept amount moves by the tap's step).

| a game | Careful | Sociable | Completionist | Cultivator |
|---|---|---|---|---|
| plan views | 164.8 | 165.0 | 101.0 | 108.1 |
| views with a row left ≠ kept | 80.1 (49%) | 81.3 (49%) | 58.5 (58%) | 72.1 (67%) |
| such rows | 247.5 | 249.8 | 142.5 | 200.4 |

Only card rows count down (Meditate, Smoke and Rest rows are a day's; a one-off door taken sets its kept row to 0 too).

## BP, a plan for the Blackroot's camps
The camps are not week hubs (`WEEK_HUBS`): every card is a tap. `EVENING_HOUR` already has the three at 16:00.

| a game | Careful | Sociable | Completionist | Cultivator |
|---|---|---|---|---|
| camp days | 30.4 | 30.7 | 15.0 | 15.0 |
| card taps | 262.8 | 334.5 | 190.2 | 377.1 |
| forced picks | 25.4 | 19.2 | 0 | 0 |
| story taps from a camp hub | 34.8 | 35.2 | 21.0 | 21.1 |
| cards a camp day | 8.6 | 10.9 | 12.7 | 25.1 |

Most tapped (Careful, a game): Spar with Ya 30.7, Darts 30.7, Needle drills 29.7, Footwork with Yuki 29.7, Cultivate (one sit)
28.7, Call it a day 18.5, Gather Qi 12.8, the four forage cards 12.3 each, eat 6.7. The Sociable adds the two talks (31.0 each);
the Completionist Hunt 13.1, the talks about 12.3, Yuki's two doors 8.7 / 6.4; the Cultivator 188.3 sits.

**Estimates (not built):** taps saved a game = card taps − one Run a camp day − the counts set (about 24, kept for good) − read
stops (0–1 a day).
- **BP-d** (a day's plan per camp, counts and order kept per camp): Careful 179–209, Sociable 249–280, Completionist 136–151,
  Cultivator 323–338.
- **BP-r** (one "As yesterday" card; the first day in each region by hand, about 1 in 5): Careful about 160–185, Sociable 215–245,
  Completionist 125–140, Cultivator 275–290.
