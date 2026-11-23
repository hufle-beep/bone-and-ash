# OC2: the cold review (Opus), v0.11.260, `52f5dc6..7f5891e`

Read: CLAUDE.md, review-checklist-code.md, the brief, `git diff` of every game file, the tools and the three test files (by hunk).
Ran: `saves` 1547 / 0, `rules` 15 / 0, `faq` 63 / 0, `story --games 5` 1,328,316 / 0, `tasks --games 5` 17,031 / 0. Two probes of my own
(scratch scripts under /tmp, not in the repo): the PA cards on Day 5, and every save fixture's Saves-screen day against its loaded day.

## Answers to the brief's questions

- **OC1, the old side kept by mistake:** none. I compared every `longCal` hunk in all 13 story files with `git show 52f5dc6`
  (the base had 77 uses with the imports: blackroot 7, fallout 13, heart 3, return 3, again 3, ashfall 13, common 3, kitchen 6, longforest 4,
  oneoff 2, prologue 11, stomp 2, wilds 7; none left). The long side is kept every time, the nested ones included (ashfall's supper/roof/morning,
  prologue's `long ? 'Three weeks…' + ' Her mother…' : …`, where `+` binds before `?:`, so it is the same as before). No long text changed.
- **Reading the calendar before `flipFill`:** only `migrate` step 4. `deserialize` → steps 1–3 (no calendar) → `blFill` (returns at once without
  `cal`) → the other fills (no calendar) → `ensureBars`. `peekSave` reads no calendar; `descOf` goes through `flipMinutes` (its own arithmetic;
  see L1). The Coil's snapshot is flipped by `flipFill`; `rewind`'s whole-game snapshot comes from `newGame` (long).
- **`oldAct1`:** 7 × 1440 + 360 is the old `calMinutes(g, 8, 6)` (calStart 8 = 8 on the old calendar). `saves/v0.8.5-act1-start.json`
  rests exactly on it (10440), so the boundary is tested (my fault C1). The `g.cal === LONG_CAL ? inAct1(g)` side is dead (a state < 5 never
  has `cal`); harmless. No other migration step reads the calendar.
- **The T1 walks:** `coil.n += k` on the first Act 1 dawn is the count a real act rewind gives (the rewind point is that dawn); flags are not
  reset, but the lines gate on the Coil count, place, presence and friendship only. `band()` writes `f` alone (10 / 50 / 90); `lineOpen` still
  checks `present()`, so a Ya line cannot pass without her there. Low risk; no finding.
- **Re-pins:** Yuki's haul (fam 161, rng, 122 awards) and Lu Han's 14 / 8 pin real numbers; the jackals' and boar's old stats are fixed
  constants; the W1 `once` 110 is the test's own formula but is then tied to the carry's `total`, so it holds. One re-pin compares the
  long game with itself (L4).

## Findings

High: none.

**M1. A PA check passes without the card being played** (`tests/tasks.test.mjs:242`). On Day 5 the clinic, workshop and drill cards are
week's cards: `runTask` only starts them (measured: clinic:0 31 h 40 min left, workshop:0 22 h 20, drill:0 29 h 20; no once-a-Coil mark).
The check runs at the carry's end, so `r.fail` is undefined and "PA: X's first card succeeds for a strong James" holds whether James would
pass or fail. The deleted lines (the card gone for the Coil, the rest open, the once mark and the menu's day mark through `runTask`) were
not re-pinned. The game is right (carried to the end: `GU 17 / DC 4 — a double haul`, `oo` mark set, card gone). Fix: carry it out (the FT
block's `carryOut`, line ~102) and assert the band, the once mark and `clinic@<day>`.

**M2. The engine walks of the day replies went, and no long-calendar walk replaced them** (`tests/story.test.mjs:544`, `:738`). SW TG1/TG2
(each Wilds card in each band through `runTask`: a failure shows no success text and notes no day; a success shows its day's text) and NX2
TG1 (the Fallout's and the prologue Ashfall's cards by story day, and closed after a success) are rules the long calendar has too: the
result now comes at the carry's end, read on its start day (`atStoryDay`). What is left: SW at lines 523–535 calls `.do(g)` with a faked day
(`onDay`), which the checklist warns against (v0.11.184 TG2, v0.11.203 TG2); MS (line ~6240) pins a flag, not a reply; TG8 (~6259) pins the
close for `fo_council:1` only. A fault in the carried result's reply (the day noted on a failure, the wrong day's text) passes.

**M3. The Blackroot walk on the 5-day road went** (`tests/story.test.mjs` ~1053, P5A TG1/TG8). The long calendar still plays that road: a
save moved in or past the Blackroot gets `calBl: 1` (`flipOne`, `blFill`). What is left: the calendar's arithmetic (~6662) and three
texts (~6864) with `calBl = 1`. The by-day lists (darts and needles five of five, cooking four of four, "Knock it off" by Coil) on that road
are no longer walked. Re-pin: the same walk on a long state with `calBl = 1` (or a moved fixture).

**L1. The Saves screen names the wrong day for a v0.8.5 save past the Blackroot** (`js/core/game.js:1731` `peekSave`, `js/main.js:501`).
`peekSave` gives act 0 (the state has no Coil until step 3/4), so `flipMinutes(…, 0)` gives `calBl` 3: `saves/v0.8.5-act1-end.json` shows
**Day 104**, loads on **Day 94** (`calBl` 1). The only fixture that differs (my probe over all 39). Older than this push (v0.11.226), but
`oldAct1` is now the natural fix: in `peekSave`, `act: s.coil?.act ?? (s.v < 5 && oldAct1(s) ? 1 : 0)`.

**L2. `models --cal 0` still runs, now as a game no one plays** (`tests/models.test.mjs:73–74`). `newGame` ignores the value, so it plays the
long calendar with the plan, `noteLines`, `foldNight` and `noteEvening` off (the `if (CAL …)` gates, lines 287–377). It should exit 2
like `--cal 5`; the source pin in `tests/tools.test.mjs:304` (`|| 0`) moves with it.

**L3. "The old calendar keeps the realm too" runs on the long one** (`tests/saves.test.mjs:249`; `won(…, cal = 7)` at :199 ignores `cal`).
A duplicate under a wrong label (checklist v0.11.239 C L1). Delete it and the unused parameter.

**L4. W1's FS check compares the long game with itself** (`tests/story.test.mjs:5089`). `at(0)` and `at(7)` build the same game (seed 99001,
`cal` ignored), so equal cress and familiarity hold however the food card pays; only `cy.paid === true` still tests "paid at its start".
Assert `river_cress > 0` after the start tap instead.

**L5. Leftovers.** `tools/textlint.mjs:212–214` HFILL[0] is now a long game on Day 8 (the wilds: no Fallout count) under "both calendars'
first Fallout day (the old 13)"; `tests/tasks.test.mjs:157` label "You followed me for three nights?" (the text is "weeks" now);
`` `${'…'}` `` wrappers left from the ternaries (ashfall 588, 632; act1_fallout 698, 715, 768; act1_blackroot 950; wilds 210–215;
longforest 248, 252; stomp_act1 71; harmless); `js/main.js:361` `g.cal === LONG_CAL ?` is always true (kept for its source pin);
`tests/tasks.test.mjs:3367` the three-sittings re-pin asserts `colWork > 0 && merWork > 0`, no number.

## Test gaps

- **TG1 (M1):** PA on Day 5: each of the three cards carried to its end; band, once mark, the card gone, the rest open, `<menu>@<day>`.
- **TG2 (M2):** a carried `wild_train` failure ends with no success text and no `r:wild_train:*` day; a success started on story day 8 and
  ended on 9 shows day 8's `DAY_REPLIES` text (a Fallout SR card), with a real day record, not `onDay`.
- **TG3 (M3):** the P5A Blackroot walk with `calBl = 1`.
- **TG4 (L1):** for every fixture, `peekSave` + `flipMinutes` gives the day `deserialize` + `flipFill` lands on.
- **TG5 (L2):** `models --cal 0` exits 2.
- **TG6:** the menus' day marks set by a real tap: the CD / PA blocks set `a1_palisade`, `clinic`… by hand since the `runTask` checks went
  (old tasks lines ~50, ~71, ~92); removing `markDaily` from a menu's `enter` (e.g. `fo_palisade`) is then caught only by luck.

## Planted faults (`project/research/oc2-faults-review.json`, not run)

C1 `oldAct1` `>=` → `>` · C2 `xpFloor` without the hair · C3 `{OnElder}` in the old form · C4 `tributeLeft` one short · C5 Yuki's food from
the third haul · C6 the wolf bites three mornings · C7 the cook's first-time text every time · C8 the bluff's Village +20 · C9 `noteEvening`
without the stay gate · C10 the roof's week 3 reads week 2. All ten `find` strings checked: each occurs once.
