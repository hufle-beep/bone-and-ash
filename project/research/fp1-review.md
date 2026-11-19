# Cold review: v0.11.226, FP1 (the flip)

Opus, cold. Read: both checklists, the brief, `git diff HEAD`, excerpts of calendar.js, game.js (wake, advance, spoil, flipFill), common.js (the day marks), wilds.js / ashfall.js / prologue.js / longforest.js (the night and exit scenes), coil.js `rewind`, main.js (every load path), browser.py. Measured on a scratch copy (`/tmp/fp1`) with my own scripts; the working copy untouched except this report and `fp1-faults-review.json`.

## High

**H1. A save resting after midnight in a counter stay flips a week behind its calendar, for good.** `flipOne` sets `cal_night = 0` for every save. On the old calendar every wilds night (`night_event`, `nightTo(g, 60)`) and the village's arson night (`village_night`) put the clock at 01:00–01:20 of day d+1, and the save rests there. The flip moves it to `calStart(d+1)` 01:xx, the first night of the *next* week, but with the counter (`forest_day` / `vday`) still on day d and no nights slept. In a new long game that same moment has `cal_night` 6, and the morning moves the counter on.
- Measured: an old game played to the first `night_event` (Day 2 01:10, forest_day 1), then flipped and played on with a fixed policy (seeds 12, 14 and 17 reach the tribute; 11, 13 and 15 die first). In all three the next morning is Day 8 with forest_day 1 and `cal_night` 1, and the night event comes again on Day 14. The village opens on Day 28 (story day 5 by the calendar), the tribute comes on **Day 49** (storyDay 8) and Act 1 starts on **Day 50**. A new long game with the same seed: Day 22, 43, 44.
- The Act 1 rewind point is taken at that dawn: **snap Day 50**. Every later Act 1 Coil of that save starts on the last day of story day 8's week, so the Fallout's first story day has 1 day, not 7.
- The arson night (old Day 6 01:10, vday 2) flips to Day 36 01:10. `arsonNight` is now false, so the screen the save rests on shows the quiet night ("The herb loft smells of mint…") in place of the fire, and the arson comes again a week later.
- `night_attack` (forest_day 3) is fine: it leaves the counter stay, and dawn lands on Day 22.
- Scope: any old save in the wilds or the village between 00:00 and 03:59. None of the 36 repo saves is one, so the saves test never meets it (TG1).

## Medium

**M1. Daily cards done in the evening reopen when the save rests between 00:00 and 03:59.** Daily marks are keyed on the waking day (`dayKey` = `wakeDay`), not on the calendar day. After midnight `wake.n` is still d−1. DK moves the mark `@(d−1)` to `calStart(d−1)`, but `wake.n` moves with the clock to `calStart(d) − 1`, which is `calEnd(d−1)`. Wherever d−1 is a 7-day stay day, the two numbers differ by 6, so "done today" is lost.
- Constructed: a mark set on the evening of day d−1, `advance` to Day d 00:30, then the flip. Done today before / after: true / false in **9 of 9** cases (d = 2, 3, 4, 5, 6, 7, 9, 10, 17). Example: Day 7 00:30, wake 6 → 42, mark → @36.
- The Blackroot (spans of 1) is unaffected: `bl_night` (Day 12 01:25, wake 11) keeps its 6 marks, measured.
- 3 of the 36 saves have `wake.n` ≠ their calendar day (dawn and village Day 4 with wake 3; bl_night). None loses a mark, but only because none had marks on that day.
- The saves test's DK probe checks `spacedFree(g, k, d)` at the calendar day both before and after the flip, not at `dayKey(g)`, so it can't see this (TG2).

## Low

**L1. The What's new line says "a rewind goes back to Day 1 or Day 44", but 8 of the 36 saves have older rewind points.** These move to other days, as `flipOne` intends: Day 9 → 51 (3 saves), 11 → 65 (2), 22 → 94, 4 → 22, 7 → 43. The brief's "rewinds land on Day 1 or 44" is the same claim. The line is only true for snapshots from after the Act-start rule.

**L2. The Saves screen shows the old day for slots and backups.** `descOf` → `peekSave(raw)` reads the raw minutes, with no flip. A slot reads "… — Day 6, 14:00" and opens on Day 36. The same holds for the backups list, the recovery screen's backups and Restore all's "This file holds a game at …". Continue is right: it reads the flipped `g`. The autosave's raw text also stays old until the first autosave.

**L3. Two more storage clears in browser.py don't set the key.** The brief says `fresh` and "the two bare `localStorage.clear()` lines" set `OLD_CAL`. Line 180 (news_box's second half, the long-forest save) and line 1060 (the MS scroll flow) also clear storage without it, so those flows now run with the flip. That is harmless today (one save is Day 1, the other flow only scrolls), but it isn't what BT says. No player can reach the key short of devtools. `flip_ui` is the only flow that means to play the player's path.

**L4. `foundation_day` moves but nothing reads it** (grep: only prologue.js:1127 writes it). Moving it is harmless, but no test pins it (R4 missed). Either pin it or leave it out of `FLIP_DAY_FLAGS`.

**Checked and found right:**
- Every load in main.js goes through `checkScene`: load, the slots, the backups, the recovery screen's two loads, Import, readAll / restoreAll. There is no storage-event or Android load path.
- Two tabs: `lastWritten` keeps the raw old text, so a tab that only loaded writes the moved save on close, and a newer save from another tab is never overwritten.
- `g.fresh` is absent on old saves, so pieces count from the first day seen.
- `lf_at` is always Day 1, so its minutes don't change.
- Meridian work (stored in hours) and Saturation are only slower to finish, not wrong.
- `rewind` keeps `g.calBl` over the snapshot's.
- Marks are moved all at once, so they can't collide.
- `guardian_lost_day`'s same-day compare survives the move.

## Test gaps

- **TG1:** no test plays a counter stay through the flip after midnight. Add an old game played to the first `night_event` and to the arson night, flipped and walked on. Assert: forest_day / vday against `storyDay` at each morning, the tribute on Day 43, the Act 1 snap on Day 44, and the arson text still showing.
- **TG2:** the saves test's "done today" probe uses the calendar day. Probe at `dayKey(g)` before and after the flip (`wakeDay`), and add a constructed after-midnight mark (M1: 9 of 9 lose it now).
- **TG3:** the main.js pin counts `checkScene(deserialize(` ≥ 8, and there are 9. Import (R1) or Restore all (R2) can drop the flip and pass. Pin each load site by its own line.
- **TG4:** the Blackroot boundary isn't pinned: no Act 1 save rests on Day 10. `d < 10` passed (R3). Add a constructed Day 10 save and a Day 11 save.
- **TG5:** the What's new line is pinned only on "the Elder on Day 103)", so a wrong example day passed (R5). Pin its numbers against `calStart`.
- **TG6:** `foundation_day` is unpinned (R4; see L4).

## Faults

- **Claude's 13** (`fp1-faults.json`): all caught, as reported in `fp1-mutate.md`. I didn't run them again.
- **Mine** (`fp1-faults-review.json`, `node tools/mutate.mjs … --cmd "node tests/saves.test.mjs && node tests/story.test.mjs --quick" --jobs 2`, 4 min 13 s): **1 caught, 5 missed** of 6.

| Fault | What it breaks | Result |
|---|---|---|
| R1 | Import skips the flip | missed (TG3) |
| R2 | Restore all skips the flip | missed (TG3) |
| R3 | The Blackroot boundary at `d < 10` | missed (TG4) |
| R4 | `foundation_day` not moved | missed (TG6) |
| R5 | What's new: Day 37 for Day 36 | missed (TG5) |
| R6 | The snapshot flipped with act 0 | caught (saves: 1 failed, v0.8.5-act1-end's Day 22 snapshot) |

Kind of fault for the checklist (code): **a move of the clock onto a new calendar is checked at noon, not at night.** A save after midnight is on the evening's day for the waking-day marks and the counter stays (`dayHour`, `wake.n`, `cal_night`). Measure a move at 00:30 and 01:10 (a story night) as well as by day.
