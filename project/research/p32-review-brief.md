# P32-A — the cold review's brief (v0.11.264; owner pick P32-A, 2026-11-24 00:15: "P32-a go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, branch `wip/p32-build` (do not commit, push or
edit any file outside `project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read
excerpts only (grep, line ranges), never whole story or test files. Do not run the full check, the models or the task test (Claude
runs them); single unit tests are fine (`node tests/saves.test.mjs`, about 10 s); the story test takes about 4 minutes
(`node tests/story.test.mjs --games 2` is faster), run it at most once. The numbers behind the pick: `project/research/p32-measure.md`;
the options as laid out: the claude.ai project doc `claude/p32-options.md` (not in the repo; its content is summed up here).

## What was picked (no balance change; one save change: L2)

v0.11.263 made one clock: the story, text and waking day all turn at 05:00 (`calendar.js` `DAY_FROM`, `game.js` `NIGHT_TO`). This push
closes its review's leftovers:
- **L2 + TG3:** `game.js` `flipOne` (the old-calendar save's move): its night `tod < 240` → `tod < NIGHT_TO * 60`, so an old save at
  04:00–04:59 lands on the night the one clock reads (`cal_night` 6, the waking day's marks on calEnd(d − 1)); FP1's mirror in
  `tests/saves.test.mjs` and its hour table re-pinned; a new 04:30 sample (TG3).
- **L3b:** `prologue.js` epilogue's "Act 1: The Hearth Tree.": its day by `calendar.js` `clockDay` (new: the calendar day by the one
  clock), so 00:00–04:59 on Day 44 starts Act 1 on Day 44 06:00, not Day 45.
- **L3c:** `act1_heart.js` the day keys (`spring@`, `hc_mei@`, `hc_ya@`, `guardian_lost_day`) by `hday` = `clockDay` (the title keeps
  `day(g)`); `week.js` `doorCards` reads the spring's key by `clockDay` too (found while building: the key's reader). The Heart's code
  pin re-pinned.
- **L3a (kept by design):** `calendar.js` `today` (`dayWord`, `dayTitle`, the counts) and `common.js` `day(g)` stay from midnight: they
  are drawn beside the clock label ("Day 65, 00:30"). A guard test: count slots only in the Fallout's texts.
- **L1 + TG2 closed as accepted** (v0.11.263 is live; any such save already re-saved; `Math.max` on `lastX` breaks the Long Forest's way back).
- **Tests:** the P32-A block at the end of `tests/story.test.mjs` (clockDay, L3b, L3c with TG4's spacedNow, the spring's plan row,
  L3a / TG4 countsFill, TG4 foldNight, F6 as a guard (equivalent), F7, R6 as every clock write); `tests/saves.test.mjs` (L2, TG3).
  Claude's planted faults `project/research/p32-faults.json`: on the block and the saves test 7 of 8 caught, F6 equivalent.

## The diff

`git diff main..wip/p32-build -- js tests`.

## What to return (one file, `project/research/p32-review.md`, under about 8 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure. High = a player-facing fault, or a test that now
   passes when the game is wrong. Look especially at:
   - `clockDay`'s other possible readers: any day key or jump left on the midnight day that decides what happens (not what is shown
     beside the clock label) — `common.js` `day(g)` users in `wilds.js`, `ashfall.js`, `act1_fallout.js`, `act1_return.js`, `house_time.js`,
     `week.js` `calDay` (~246, ~574), `FLIP_DAY_FLAGS`;
   - the Heart's keys on a save written before this push at 00:00–04:59 (a flag under the midnight key): any double or lost talk?
   - `flipOne` at 04:00–04:59: the marks, `cal_night`, the Coil's snapshot (`flipOne(g.coil.snap)` too), `peekSave`;
   - do the new tests test their labels (each fails on v0.11.263 where it claims to)?
2. Test gaps (TG1 …).
3. Planted faults in `project/research/p32-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "R1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   4–8 faults in the changed game code (not in the tests), each with "Expected to be caught by …" or "Expected to survive (…)" in
   the note. Do not run them. Claude's own are in `project/research/p32-faults.json`; don't repeat them.
