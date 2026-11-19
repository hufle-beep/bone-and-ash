# Cold review brief: v0.11.226 (owner pick FP1 = NG + OB + MV + DK + BT + TS + NW + FB): the flip

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run: exit 0, 560 s; 146 compared, 0 drifted). `node tests/saves.test.mjs` (seconds) and `node tests/story.test.mjs --quick` (about a minute) in a scratch copy are fine; `python3 tools/browser.py --part 4` (about 30 s) too.

## What was picked (2026-11-19 07:53, "Fp1 go")

The long calendar (`g.cal === 7`, `js/core/calendar.js`; each stay's story day a week, the Blackroot's days three each) was behind a test button since v0.11.203. The flip (t's queue item 5 on `project/roadmap-time.md`), measured before the pick on a scratch copy (the repo's 36 old-calendar saves moved, 300 random steps each, a rewind each; the quick check; the four browser parts):
- **NG:** every new game on the long calendar: Begin (no save), New game, the end screen's "Start a new game", the recovery screen's fresh start (main.js `freshGame`'s default). A rewind already kept a save's calendar.
- **OB:** the "New game: the long calendar (test)" button and its note gone.
- **MV:** an old-calendar save (no `cal`) moves on every load in main.js (`checkScene` → game.js `flipFill`; the autosave, slots, backups, restore-all, an import): its day d → the first day of d's week (`calStart`), the hour kept; `cal: 7`; `calBl` as `blFill` gives it (3 before the Blackroot, 1 in or past it); `cal_night` 0; the Coil's rewind point (`g.coil.snap`) the same way. Not in `migrate`/`deserialize`: there the rules test's round trip failed and 86 test calls turned long. Measured: 36 / 36 load and play 300 steps; rewinds land on Day 1 or 44. (The week's last day instead was measured and dropped: about 26 of 36 rewinds wrong.)
- **DK:** the day marks move with it: every `key@d` flag (1,495 in the 36 saves; 71 of today's in 11 saves), and, Claude's call within DK, the two day-number flags `guardian_lost_day` (compared with `day(g)` in act1_heart.js) and `foundation_day` (written, never read). A mark of day 0 or before stays.
- **BT:** the browser test keeps the old calendar for its existing flows through a storage key, `boneash.oldcal` = '1' (main.js `OLD_CAL_KEY`, `oldCalTest`; `tools/browser.py` `fresh` and the two bare `localStorage.clear()` lines set it); a new flow `flip_ui` (part 4) plays without it.
- **TS:** `newGame`'s default stays the old calendar (the tests' 435 calls unchanged), the baseline unchanged; the saves test's new section 3 (every old save moved and checked, DK, a Day 1 game, an Act 1 dawn); the story test's two menu pins re-pinned.
- **NW:** a What's new line (0.11.226). **FB:** the branch `fallback/2026-11-19-before-flip` (made locally, pushed with the push).

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/core/game.js` (`FLIP_DAY_FLAGS`, `flipOne`, `flipFill`; the calendar import), `js/main.js` (`OLD_CAL_KEY`, `oldCalTest`, `freshGame`, `checkScene`, the menu, the end screen's button, `confirmNew`), `js/core/news.js`, `tests/saves.test.mjs` (section 3), `tests/story.test.mjs` (TS1's and TS9's pins), `tools/browser.py` (`OLD_CAL`, `fresh`, `flip_ui`). My planted faults: `project/research/fp1-faults.json` (13, all caught: `fp1-mutate.md`; command `node tests/saves.test.mjs && node tests/story.test.mjs --quick`).

## What to look at especially

- Every place a save enters the game in main.js: is any load not through `checkScene` (a two-tab reload, the storage event, the Android app's own paths, `peekSave` for the Continue label and the Saves screen's lines: a moved day shown as the old one)? A save written back moved: does the two-tab check (`lastWritten`) or the backups' rolling copies misread it?
- State that holds a day or a minute other than `minutes` and the `@d` marks: `g.log[].at`, `g.fresh` (raw food's days; an old save has none), the week's plan and kept rows (`g.tasks.plan`/keep: an old save has none?), counters (`forest_day`, `vday`, `bl_day`, `lf_days`, `yr_day`, `mb_day`), any `*_day`/`*_at` flag I missed, `g.coil.back`, `g.coil.best`, `g.stats`.
- A save mid-way through anything: mid-fight (`g.combat`), mid-Blackroot (calBl 1: the 5-day road for good, rewinds too), the Long Forest (`lf_*`, prologue Day 1 with `minutes` moved by `lf_exit`?), the tribute's eve, past the Elder (`a1_again`, Day 22 → 94), the epilogue, an Act 1 snapshot from an old save loaded as-is (rewinds to its own day).
- The pace: a moved save plays the long calendar's pace (`satDiv`, `merMult`, `xpPace`, Yuki's food 1 haul in 3, raw food spoiling): anything stored as an absolute that now reads wrong (a channel half open, Saturation)?
- `BT`: is the key reachable by a player; does any browser flow that should test the player's path now run with it?
- Test gaps and whether my faults are caught. Add your own faults in `project/research/fp1-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/fp1-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
