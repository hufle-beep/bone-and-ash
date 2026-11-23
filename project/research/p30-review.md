# P30-A — the cold review (Opus, 2026-11-23; branch `wip/p30-build`, `git diff main..wip/p30-build -- js tests`)

Read: CLAUDE.md, `review-checklist-code.md`, the brief, the measure, the diff; excerpts of `act1_fallout.js`, `calendar.js`, `tasks.js`,
`week.js`, `game.js`, `common.js`, `kitchen.js`, `house_time.js`. Scratch probes in `/tmp/p30rev` (repo imports only, nothing written
to the repo). Story test not run (Claude runs the checks).

**Result: High 0, Medium 1, Low 5.** Outside 00:00–04:59, `foDay` = `pin ?? storyDayOf(textDay)` is the same as the old `storyDay`
(`textDay` = the calendar day from 05:00), so every reader of `dd`, `onStoryDay` and `farewellNow` is unchanged at every hour the
player can reach in play. `foDay` agrees with `game.js` `gainCounts` (pin ?? the 05:00 day). `kitchen.js` `potLine` and
`house_time.js` `HT_HUBS.fo_ashfall` ignore the pin but are never read inside one (the pot and the house-time doors are not week
cards: no `menu`, `tasks.js:742`); `act1_fallout.js:382` (hub text) and `:582` (supper) are read outside the result's `asOn`, so
they agree with `foDay`. `lastOfWeek`: no caller left in `js/`, `tools/`, `tests/` (grep); only a doc line (L5).

## Findings

**M1 (Medium, unreachable in play) — 04:00–04:59 after a week's last day: the daily marks have turned, `dd` has not.**
`common.js:15` `dayKey` = the waking day (04:00); `hour()` reads 4 there (`game.js:567`), so `late` (`act1_fallout.js:61`) is false
and every day card on `fo_ashfall` is open, while `dd` now reads the previous story day until 05:00. Probe: Day 58 04:30 shows the
spy card (`dd(g) <= 9 && hour < 16`, `:405`; gone at 06:00), and Council / Mei Lin / Ya there show day 9's scenes, write
`council9`, and mark `a1_council@58` etc., so day 10's first day (Day 58) has lost those visits from 05:00. Same at Day 51 04:30
(day 8's council on day 9's first waking day). Before the change `dd` and `dayKey` agreed from 04:00. The pin is also still taken
from midnight (`tasks.js:335` `sd: storyDay(g)`), and the planner's story-week from the waking day (`week.js:180`, `:773`): a week
card begun at 04:30 shows day 9's label and reads day 10's result. Not reachable by taps (wake 06:00; no path crosses midnight,
measure §1), so not High; but it is the one window where the hub's cards are open, and the push moved the mismatch into it.

**L1 — the farewell after midnight runs the clock backwards** (`act1_fallout.js` `fo_depart` "Into the Blackroot":
`g.minutes = (calEnd(g, 10) - 1) * 1440 + 23 * 60`). D2 offers the farewell until 03:59 of Day 65 (`hour()` 24–27, the Evening
card); the walk from 00:11 reaches `fo_depart` at Day 65 01:11 and is set back to Day 64 23:00 (up to ~5 h from a 03:59 Evening),
then slept to 06:00. Numbers end the same here (satiety 87 both ways), but the depart screen says "Day sixty-five. Thirty-eight days
to the Elder." where the usual evening path says "Day sixty-four. Thirty-nine days". A `Math.max(g.minutes, …)` would keep it
forward; open, options later.

**L2 — `fo_night` day 9 with `romance`: text day 9, count from midnight.** At Day 58 00:11 the lovers' paragraph is day 9's but
`elderLeft` says "Forty-five" (22:00 the night before: "Forty-six"). The count reading the calendar day is the standing rule
(`:127`), so the mix is by design, but the D1 test's "fo_night at 00:11 as at 22:00" holds only because `mk` sets no `romance`.

**L3 — `farewellNow` past Day 64 from 05:00** (hub forced there): `dd` clamps at 10, so it is true on the last day of every later
story day (`calBl` 3: Day 67 05:00 – Day 68 04:59, Day 70 …; `calBl` 1: every day from Day 64 05:00). Same pattern as the old
`lastOfWeek`, 5 h later; untested; unreachable (the hub is left at the farewell). Probe table in `/tmp/p30rev/probe.mjs` (D).

**L4 — the midnight readers left on the hub at Day 65 00:00–04:59**: `weekHub` / `carryOk` / `common.js` `spacedNow` read
`storyDay` (11, not a stay) while `dd` reads 10: week cards drop to one-day length and carries are not offered there. The measure's
6 remaining screens; already "open, options later" (the one clock). Noted only so it isn't counted as new.

**L5 (docs) — `project/roadmap-retune.md:43`**: the open item "L4, the Fallout's farewell opens after midnight on the night before
its day (… `lastOfWeek` and `dd` read the clock's day …)" is fixed by D2 and names the removed helper; close it in this push's docs.

**The new tests against the old code:** each D1 / D2 assertion fails on v0.11.261 (day 8 / day 9 supper, `fo_night`, `fo_mei`,
the sung reply at Day 58 00:11, `fw(65 00:11)`, `fw(65 04:30)`, `!fw(64 00:11)`, the walk) except the guards that pass on both by
design: "at 05:00 day 9's supper", `!fw(57 23:00)` (catches a dropped `dd >= 10`), the pinned and day-10 halves of the sung reply,
and D4 (catches F2). Good.

## Test gaps

- **TG1** (M1): no test at 04:00–04:59 after a week's last day (the hub's open cards, `dayKey` against `dd`, the spy card at Day 58
  04:30); and none at the early edge of D2 (`farewellNow` at Day 64 04:59 no / 05:00 yes; only 00:11 and 23:00 are read).
- **TG2** (L1): the D2 walk asserts the path and `minutes < Day 66` only: not that the clock never runs back, nor `fo_depart`'s day
  and Elder count, nor satiety against the 23:00 walk.
- **TG3** (L2): `fo_night` in the gap without `romance` only; the lovers' paragraph and its count unread.
- **TG4** (L3): `farewellNow` from Day 65 05:00 on, and with `calBl` 1, untested (R5 below survives).
- **TG5** ("exactly as before", checklist v0.11.211 TG2): nothing pins that `dd`, the `onStoryDay` replies and `farewellNow` equal
  the old reads at 05:00–23:59 on Days 44–64 (the 40 equal games are measured, not tested); a table of (day, hour) → old value,
  frozen from v0.11.261, would.

## Planted faults (`p30-faults-review.json`, not run)

R1 `onStoryDay` drops the pin alone; R2 farewell's last day by the waking day (04:00); R3 `foDay` by the waking day (04:00); R4
`farewellNow` by `textStoryDay` in place of `dd` (equivalent: never read under a pin); R5 the farewell's story day clamped to 10
(survives: TG4); R6 `dd`'s floor 7 (survives: Act 1 starts Day 44 06:00).
