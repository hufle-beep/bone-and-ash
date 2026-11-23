# P31-A — the cold review's brief (v0.11.263; owner pick P31-A, 2026-11-23 22:19: "P31-a go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, branch `wip/p31-build` (do not commit, push or
edit any file outside `project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read
excerpts only (grep, line ranges), never whole story or test files. Do not run the full check, the models or the task test (Claude
runs them); single unit tests are fine (`node tests/saves.test.mjs`, about 5 s); the story test is slow on this machine
(`node tests/story.test.mjs --games 2`, up to 10 minutes), run it at most once. The numbers behind the pick: `project/research/p31-measure.md`.

## What was picked

The one clock: no balance or save change. Before: three clocks. The story day (`js/core/calendar.js` `storyDay`, unpinned) turned at
midnight, the text day (`js/core/lines.js` `textDay`) at 05:00, the waking day (`js/core/game.js` `NIGHT_TO`: `dayHour`, `dayEnd`,
`wakeState` / `dayKey` and the daily marks, `js/core/tasks.js` `workDay`, `mealSlot`) at 04:00. Now all at 05:00
(`calendar.js` `DAY_FROM = 5`). In play: 0 changes (100 bot games identical with K1; 40 with K1 + K2; no bot screen at 04:xx; 0 of 39
saves at 04:00–04:59, 1 in the 00:00–04:59 gap). Forced past midnight: K1 12 of 560 screens change, K1 + K2 53.

- **K1:** `storyDay` = the calendar day of (minutes − 05:00), the pin (`atStoryDay`) kept. Readers: tasks.js (`weekHub`, `carryOk`,
  `carryAlive`, carries' `stay` / `sd`, the long-calendar check ~918), week.js (4), Blackroot (3 `storyDay(g) < 11 / 16` jumps), the
  Heart (`late`, `ht_leave`), common.js `spacedNow`, calendar.js `countsFill`, game.js `blFill` (~1662).
- **K2:** `NIGHT_TO = DAY_FROM` (was 4); the wake counter `X4` by `NIGHT_TO` (was 240); `lines.js` `TEXT_DAY_FROM = NIGHT_TO * 60` (05:00
  as before, now tied); game.js `gainCounts`' day by `NIGHT_TO` (was 300); week.js `wakeCal` by `NIGHT_TO` (was 240: "as wakeState's",
  found while building); oneoff.js "Call it a day" from `NIGHT_TO` (was 4, found while building). `flipFill`'s `tod < 240` (an old save
  written under the old night) kept on purpose.
- **L1g:** `act1_fallout.js` `fo_depart`: `g.minutes = Math.max(g.minutes, Day 64 23:00)` (it set the clock back from after midnight).
- **FD:** `act1_fallout.js` `foDay` folded into `storyDay` (`dd`, `onStoryDay`); `textStoryDay` still read at ~200, ~382, ~582.
- **Tests:** the P31-A block at the end of `tests/story.test.mjs`; re-pinned: story P20-A F26's premise, tasks N1, saves FP1;
  `tests/README.md`'s row.

## The diff

`git diff main..wip/p31-build -- js tests`.

## What to return (one file, `project/research/p31-review.md`, under about 8 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure. High = a player-facing fault, or a test that now
   passes when the game is wrong. Look especially at:
   - every reader of `NIGHT_TO`, `dayHour` (`common.js` `hour`), `dayEnd`, `workDay`, `wakeState`, `mealSlot`: at 04:00–04:59 they now
     read the night before (hour 28). Any scene, card or night event that assumed hour 4 is morning (a wake at 05:00 such as the
     tribute's `sleepUntil(g, 5)`, `sleepUntil` / `nightTo` themselves, the night encounters at 01:00–02:00, the meditate and rest
     screens, the evening caps `hour(g) >= 16 / 19`, `toHour` in act1_return.js and act1_blackroot.js)? Can any be reached in play?
   - hard-coded 04:00 / 240 / 300 / `hh < 4` left anywhere in `js/`, `tools/`, `tests/lib/` that should follow the one clock.
   - `wakeState` on a save written before this push (its `wake.lastX` by the old 04:00): any double or lost waking day, at any hour?
   - K1's readers in the gap (Blackroot's `< 11` / `< 16` jumps, `blFill`, carries' `stay`, the planner): any that now jumps or
     drops something at 00:00–04:59?
   - do the new tests test their labels (each fails on v0.11.262: Claude checked 10 of 10)?
2. Test gaps (TG1 …).
3. Planted faults in `project/research/p31-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   4–8 faults in the changed game code (not in the tests), each with "Expected to be caught by …" or "Expected to survive (…)" in
   the note. Do not run them. Claude's own are in `project/research/p31-faults.json`; don't repeat them.
