# P31-A — cold review (Opus), v0.11.263, branch `wip/p31-build`

Read: CLAUDE.md, review-checklist-code.md, the brief, `git diff main..wip/p31-build -- js tests`, excerpts of the readers.
Ran: `node tests/saves.test.mjs` (1596 passed, 0 failed); three probes on the branch (scratch scripts in /tmp, game untouched).
Not run: the story test, the full check, the models, the task test.

Summary: **High 0, Medium 1, Low 3.** The one clock itself is consistent: no import cycle (`lines.js` / `game.js` / `calendar.js`
load in every order), `gainCounts` and `TEXT_DAY_FROM` keep 300, `wakeCal` now agrees with `wakeDay`, `dayEnd`, `nightLock`, `mealSlot`, "Call it a day"
(`hourOf` is the raw hour, so 04:xx hides it), `sleepUntil(g, 5)` (the tribute: 05:00 is day), `nightTo` (01:00, `hh < 6`), the
`hour(g) < 6 || >= 16/19` caps (04:xx was already "night" in each) and both `toHour`s (Blackroot: `dh >= 6`; Return: `rt_start` is
reached only through `ht_leave`, which now always sleeps to 06:00 at 04:xx) all read 04:00–04:59 as the night with no stuck screen.
Blackroot's `< 11` / `< 16` jumps only go forward (bl_start comes only from fo_depart, which ends at 06:00 or later). `blFill` at
Day 65 00:00–04:59 now gives BL_SPAN (before the Blackroot), which is the right answer. No hard-coded 04:00 left in `tools/` or `tests/lib/`.

## Findings

**M1 (Medium) `js/story/act1_heart.js:795-797` `ht_leave` sets the clock back, newly reached by K1.** On Day e18+1 (Day 101 here)
00:00–04:59 `storyDay` now reads 18, so the `< 19` branch sets `g.minutes` to **Day 100 21:00**, then `sleepUntil(6)`. Before, it read 19
and slept straight on. Measured (seed 43107, Fed 80): from 04:30 Fed 80 → 66.5 (−13.5, 9 h asleep) where a sleep from 04:30 costs
−2.25; from 00:11 −13.5 where v0.11.262 cost −8.7. `spoilFresh` (game.js:917) also backdates any fresh batch dated Day 101 to Day 100,
so it spoils a day early. Reachable: "Leave the Old Tree." shows at any hour once `seed` is set (act1_heart.js:219), e.g. after a late
guardian. The end minute is right (06:00), so P31-A's K1 Heart test passes. This is the same class as L1g. Fix: `Math.max(g.minutes, …)` as in fo_depart.

**L1 (Low) `js/core/game.js:456-465` `wakeState` on a v0.11.262 save written at 04:00–04:59.** `lastX` was set by the old X4 (= d). The first
read lowers it to d − 1 and leaves `n` alone. A later **direct** clock set past 05:00 then adds a second waking day. Measured: save Day 58
04:30 `{n 58, lastX 58}` → read → `lastX` 57 → `g.minutes = 06:00` → `n` 59 (v0.11.262: 58). After that, dailies done after 04:00 reopen
and spaced cards open a day early. Through `advance` it stays 58 (fine). The same root affects a v0.11.262 carry started at 04:00–04:59
on a stay's first day (`stay` by the old midnight day). Until 05:00, `carryAlive` is false, so any night card run then deletes it with "left
unfinished" (tasks.js:500-502). Reach: 0 of 39 saves, no bot screen at 04:xx. Fix: open, options later (a `Math.max` on `lastX` or a one-off load fill).

**L2 (Low) `js/core/game.js:1641` flipOne's kept `tod < 240` now gives an inconsistent state.** An old-calendar save at 04:00–04:59 lands on the
long calendar at calStart(d) 04:30. The new clock reads that as the night of calEnd(d − 1), but the flip writes the day's state. Measured, old Day 9
(act 1) 04:30 → Day 51 04:30: `storyDay` 8, `dayHour` 28, `wakeDay` 50, but `cal_night` 0 / `storyNight` false, and day 8's marks
go to 44 (calStart), not 50. At 03:30 the same save gets `cal_night` 6, `storyNight` true, marks → 50 (consistent). In a counter stay
the first dawn's `weekMorning` turns 0 → 1, so story day 9 gets six mornings. The kept reason ("written under the old night") is about
the old save. The flipped save is then read by the new night. `tod < NIGHT_TO * 60` (and the mirror at saves.test.mjs:127) makes 04:30
flip like 03:30. Reach: very rare (an old-calendar save at 04:xx).

**L3 (Low) Midnight readers left beside the one clock (a fourth clock).** `calendar.js:96` `today` (`dayWord`, `dayTitle`, `elderLeft`,
`departLeft`, `sinceDepart`) and `common.js` `day(g)` still turn at 00:00. The mix with K1 shows in two places:
(a) `countsFill` (calendar.js:120) on the tribute's night: Day 44 00:30 is story day 7 now, so `{Days}` = "One day" (to a tribute
already held) beside "Day forty-four". v0.11.262 read 8 and gave "Fifty-nine days".
(b) `prologue.js:946` "Act 1: The Hearth Tree." from Day 44 00:30 or 04:30 starts Act 1 on **Day 45** 06:00. It still means "today" by
midnight, so story day 8 loses its first calendar day. From Day 43 23:00 it starts on Day 44.
Reach: likely 0 (the epilogue follows the morning's tribute). Not measured here. Open, options later.

No finding on the new tests' labels. Each P31-A assert reads what its label names. By reasoning against v0.11.262, every block fails
there: the TG loop at h = 4, the walks via fo_depart's set-back, `dep(65 19:59)`, the Heart at 04:30. The one exception is the Heart's 00:11
case, which ends at 06:00 on both versions (see TG1).

## Test gaps

- **TG1** The Heart test (`story.test.mjs` P31-A, "the Heart's two reads") pins only `ht_leave`'s end minute. Add: the clock never goes
  back inside `enter`, and Fed drops by a sleep from the entry minute (00:11, 04:30). Catches M1. `late` itself is not tested: at Day e18+1
  00:11 the hub hides "Go through the door of bone" and "Back away" shows. A fault on `late` alone (midnight) passes.
- **TG2** No v0.11.262 save at 04:00–04:59. Fake `wake {n, lastX: d}` at 04:30, cross 05:00 once by a direct set and once by `sleepUntil`,
  and assert one waking day. Run a night card at 04:30 with a carry whose `stay` is by the old day, and assert it survives (L1).
- **TG3** FP1 has no old-calendar sample at 04:00–04:59, and its `night` mirrors flipOne's 240. Add a 04:30 sample asserting `storyNight`,
  `cal_night` and the marks agree with `storyDay` / `wakeDay` (L2).
- **TG4** K1 readers named in the brief but not walked in the gap: `bl_start` / `bl_end` jumps, `blFill` at Day 65 02:00, `spacedNow`,
  `countsFill` at Day 44 00:30, `foldNight` on a stay's last night after midnight (it now walks on to the 06:00 morning).
- **TG5** `gainCounts`' day (game.js:969) has no test at 00:00–04:59. The planted R4 is expected to survive.

## Planted faults

`project/research/p31-faults-review.json`: R1–R7, each `find` checked as present once (node), not run. R1 storyDay boundary +1 min;
R2 TEXT_DAY_FROM 04:00; R3 workDay 240; R4 gainCounts from midnight (expected to survive); R5 `dd` without the pin; R6 fo_depart
back by up to an hour (only the walks catch it); R7 onStoryDay from midnight, unpinned. None repeats F1–F7.
