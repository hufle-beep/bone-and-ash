# Cold review: v0.11.222 (J2 = MH + K3 + SV + TL + HN), the Blackroot's camps

Opus, cold. Read: the brief, both checklists, `git diff HEAD`, the Blackroot's scenes around each change (grep, line ranges), `calendar.js`, `coil.js` rewind, `oneoff.js`, `common.js` daily keys, the walks' marks. Runs in a scratch copy (`/tmp/blrev/w`): hub probes by `bl_day` × `bl_n` × hour, three scripted roads (two "eager" 3-day, one 5-day), `tools/mutate.mjs` (both fault files, `--jobs 1`, `story.test.mjs --quick`). Not run: `check.sh`, the bots (`models.test.mjs --cal 7`; the brief's 40-game numbers stand), the browser part (no Blackroot in it).

## High
None found. No screen without a way on: every hub, camp, night and morning across `bl_day` 1–5 × `bl_n` 0–2 × 08/17/20 h has one; the eager roads end at `ht_start` on Day 80 06:00 (5-day road: Day 70), five story nights each, the clock never back.

## Medium
**M1. The hollow (the Drowned) is not held to the wood's last day.** MH: "the split, the hollow and the pass … on their last day". The split (`bday ≥ 2 && blLastDay`) and the pass (`bday ≥ 5 && blLastDay`) are gated; `Cross the mourning hollow.` still shows on `!drowned_done` alone, so it is open on all three wood days. Measured (eager road, seed 11): `dw_hollow@71:07 b3.0`, the spring on Day 72, the wood's story night on Day 73. **Failure scenario:** the player crosses on Day 71 (the wood's first day), spends two more days in the wood with the Drowned behind them, and the wood's night event (the pool has `drowned` twice) comes two days after the hollow, not the same night as before. **Made likelier by Incremental Mode:** `oneoff.js` `oneOffLeft` counts the open hollow as a story stop, so "Call it a day" never shows in the wood before it is crossed; the task screen's only way to the evening is cards, Rest, or the hollow. The TS9 rows test the camp's gate (`dwCamp 110`) but not the hollow's (TG1). Fix direction (for the options): `blLastDay(g)` on the hollow's `show`, the camp rule unchanged; check `oneOffLeft` then lets "Call it a day" through on the quiet wood days.

## Low
**L1. An old save in or past the Blackroot keeps the 5-day road for good, rewinds included.** `blFill` writes `calBl: 1` and `rewind` keeps the save's own for both the act's and the whole game's rewind (for `to: 'game'` it overwrites the fresh `newGame`'s 3; TS9 pins `r3.calBl === 1`). Every rewind lands before Day 65 (Day 44 or Day 1), so giving 3 there would move no clock mid-road. **Scenario:** a tester's long-calendar save sitting on the Coil screen after a death in the Heart (Day 82) loads as `calBl 1`; every later Coil and the whole game again keep the Elder on Day 93, and the new camps are only reachable by a new game. Within SV's words ("one in or past the Blackroot 1"); worth the owner's word whether "past" was meant to outlive the next rewind.

**L2. TL's list misses some Blackroot day counts** (for TS6, not a fault of this push): `act1_fallout.js:711` Ya's offer "Five days in, maybe six"; `ya_mocks`'s label "We have a five-day walk" (`act1_blackroot.js:368`); the wood's fireside `byDay` second text "The second night in the Drowned Wood…" (wood firesides now up to 4); `BL_DW_CAMP` by `byDay` wraps, so the 3rd wood camp shows the first camp's text again and the 4th "better chosen; you are learning". Also: the quiet mornings' new label "Get moving." leads back to the same camp's hub (no walk, no mark): a label for leaving on a morning that stays.

**L3. The bone-stakes ring is offered on quiet nights** (Qi 3, a check), when no night event can come; `bl_stakes_night` is cleared next morning unused. Harmless, but a cost for nothing on 10 of 15 nights.

## Checked, no finding
- Calendar readers past Day 64: the Fallout's "N days to the Elder" (`calStart(g, 21)`), the FAQ, `bl_start`'s Day 65, `bl_end` / "Into the Heart" Day 80, the Heart's Day 19 jump (`calStart(g, 19)`, 101), `late` (≥ 19), the menu note; `tasks.js` / `week.js` / `common.js` spacing read `STAY_DAYS` only, so the Blackroot stays hand-played and daily. An old Fallout save's countdown moves by 10 on load: SV as picked.
- Days and nights stay in step: `bl_camp` takes the clock to 19:00, Sleep → `bl_morning` → `nightRest` to 06:00; the fled night fight (`flee: 'bl_morning'`), `bl_night_lost`, the Yuki path's splices (before Sleep; `yk_camp` / sister talk back to `bl_camp`), `ya_romance` / `mei_bond` by day (`hubFor`).
- Daily keys by `wakeDay`: 15 days, once a day each; none keys on `bl_day`.
- SV: `blFill` last in `migrate`, so `deserialize(…, { force: true })` and every load path fill; old-calendar saves untouched; the snapshot (`coil.snap`) may lack `calBl` and the rewind covers it; a mid-fight Fallout save gets 3 (nothing reads it before Day 65).

## Test gaps
- **TG1** (M1): no test of the hollow's day; plant `blLastDay` on it and nothing would notice either way.
- **TG2** (R1–R4 missed): the four side-night scenes route their Sleep through `sleepTo` (`mei_raft`, `friends_watch`, `ya_romance`, `mei_bond`); reverting any one to `'bl_night'` gives a sixth night event and passes. The road test's random walk rarely meets their likes gates. A direct test per scene at `bl_n` 0 (→ `bl_morning`) and 2 (→ `bl_night`) closes it; only the fireside's "Sit beside Mei Lin" was caught (R5).
- **TG3** (R6 missed): the walks check pins `WALKS` indices 0–3 and the choice count, not that indices 0–3 are still the old four mornings. Moving the new Root Road morning to index 3 (same label "Get moving.") gives the quiet morning the walk lines and takes them from the pass's morning, and passes. Pin `bl_morning.choices.slice(0, 4).map((c) => c.to)` and their `show` on a bday-5 morning.
- **TG4** (R7 missed): `blFill`'s prologue branch is tested on Day 3 only. A Long Forest save whose clock ran past Day 64 (one calendar day per Long Forest day or season) needs the `act === 0` term; removing it passes.
- **TG5**: the road test's comment says "the cards once a day", but nothing in it counts cards; a daily key keyed wrongly (e.g. on `bl_day`) would pass it.
- R8 (`bl_start` no longer resets `bl_n`) missed, but likely equivalent: a rewind's flags come from the snapshot (Day 44), and `bl_n` is not in `KEEP_FLAGS`. Note only.

## Planted faults
- The builder's `bl-faults.json`: **13 caught of 13** (F6 1931 failures; F3, F4, F8, F9, F12 one each).
- Mine, `bl-faults-review.json` (through `tools/mutate.mjs`): **1 caught of 8** (R5); missed R1–R4 (TG2), R6 (TG3), R7 (TG4), R8 (likely equivalent).

## For the checklist (code part)
- **A gate added to some of a group's beats (v0.11.222 M1):** when a pick moves "the split, the hollow and the pass" onto a day, grep every member's `show` and the "Call it a day" rule (`oneOffLeft`) for each; one left ungated also holds the task screen's skip.
- **A destination made a function (v0.11.222 TG2, TG3):** every choice that used to say `to: 'bl_night'` gets a test, the side scenes too, and appended choices get their old indices' targets pinned, not only the count.
