# P31 — the one clock: the numbers (2026-11-23, on v0.11.262, scratch copies only)

Scratch copies (`git archive HEAD`): `/tmp/p31w` (as is), `/tmp/p31t` (K1), `/tmp/p31u` (K1 at 04:00 + K3), `/tmp/p31v` (K1 + K2).
Hooks in the scratch `tests/models.test.mjs` only, after `sceneView` in the bots' loop. Nothing copied back.

## The three clocks today
- the story day (`calendar.js` `storyDay`, unpinned): from midnight; 19 readers in 7 files (tasks 7, week 4, Blackroot 3, Heart 2,
  common 1, calendar 1, game 1); the Fallout's own `foDay` from 05:00 since v0.11.262.
- the text day (`lines.js` `textDay`): from 05:00.
- the waking day (`game.js` `wakeState` / `dayKey`, `tasks.js` `workDay`, `dayHour`, `dayEnd`, `mealSlot`; `NIGHT_TO`): from 04:00.

## Trials
- **K1** the story day from 05:00 (`storyDay` = the calendar day of minutes − 05:00; one line).
- **K2** the waking day and the night to 05:00 (`NIGHT_TO` 4 → 5, the wake counter's 240 → 300).
- **K3** the text day from 04:00 (`TEXT_DAY_FROM` 5 → 4 h), with K1 at 04:00.

## 1. In play (bots, `--cal 7`)
- 100 games (4 models × 25), as is / K1 / K1@04 + K3: output identical, line for line. 2,614 screens in the gap (story day ≠
  text day): all night screens at 00–02 h (`bl_night_event` 928, `night_event` 412, `bl_night_won` 409, `night_attack` 206,
  `village_night` 202, …); 0 at 04:xx; 0 on the Fallout's or the Heart's days. The same 2,614 screens (scene, hour, text start,
  choices) in all three.
- 40 games (4 × 10) with K1 + K2: output identical.
- Saves: 39; 0 at 04:00–04:59; 1 in the gap (`2026-11-12-2046-incremental-bl_night.txt`, 01:25).

## 2. Forced (40 games: every scene at 17:00+ on a story day's last calendar day, cloned to the next day's 00:11 and 04:30; the
view, the task cards, `weekHub`, and every choice's result one step on)
560 forced screens. Differ from as is:
- **K1: 12** — all `weekHub` (the review's L4): `fo_ashfall` after day 10 (10; at 04:30 3 with other week-card lengths), Ashfall's
  `ashfall` after day 6 (2). Nothing else.
- **K1 + K2: 53** — K1's 12, and 04:30 now the night: the hubs offer the night (`ah_hub`, `dw_hub`, `rr_hub`, `rt_ashfall`, `ashfall`,
  `fo_ashfall` after day 9, `village`), the camps' choices one step on.
- **K1@04 + K3: 108** — 96 of them texts at 04:30 now the next day's (camps, suppers, `yk_time`, the night scenes), `fo_ashfall` after
  day 9 the next day's cards (M1 closed the other way).

## 3. Direct probes
- M1 (Day 58 04:30): as is and K1 `dayKey` 58, the Fallout's day 9, its day cards open. K1 + K2: 04:30 is the night (hour 28).
- The Heart after day 18's last day (Day 101): as is `storyDay` 19 at 00:11 and 04:30 (`late`; `ht_leave` at 04:30 leaves at 04:30);
  K1 / K1 + K2: 18 until 05:00 (`ht_leave` sleeps to 06:00).
- The farewell walk from `fo_ashfall` (Evening → … → `bl_start`):
  - 00:11 after Day 64: all trials forward, the farewell, Blackroot Day 65 06:00.
  - **03:59**: as is and K1: the Evening card's 20 min cross 04:00, the farewell jumps to Day 65 19:19, `fo_depart` sets the clock
    back to Day 64 23:00 (20 h back; L1). K1 + K2: farewell 04:19, depart 04:59, Blackroot Day 65 06:00, never back.
    K1@04 + K3: the supper, not the farewell; the Fallout runs on into Day 66 (story day 11).
  - 23:00 on Day 64: the same in all.
- L1g (`fo_depart`: `Math.max(now, Day 64 23:00)`): with K1 + K2 no walk changes; with K1 alone the 03:59 walk goes on to
  Day 66 06:00 (one of story day 11's three Blackroot days lost) in place of 20 h back (worked out, not run).

## 4. The tests on each trial (story, tasks, saves, rules)
- K1: story 1 fail (P20-A F26's premise `storyDay === 6` at 00:30, now 5; its check, the planner's week 5, holds), saves 1 (FP1's
  `bl_night` 01:25 premise: story day 12 → 11, the text day), tasks 0, rules 0.
- K1 + K2: the same two, and tasks 1 (N1: "a morning toHour (6) still moves 04:30 to 06:00": 04:30 is now the night, as 00:00–03:59).
- K1@04 + K3: story 4 (F26, and P30-A D1 / D2 / TG1's edges an hour earlier), saves 1; tasks stopped unfinished (time).
