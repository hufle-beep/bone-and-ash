# P32-A — the cold review (Opus, 2026-11-24; branch `wip/p32-build`, v0.11.264)

Read: `CLAUDE.md`, `review-checklist-code.md`, the brief, `p32-measure.md`, `p32-faults.json`, `git diff main..wip/p32-build -- js tests`,
excerpts. Ran: `node tests/saves.test.mjs` (39 files, 1599 passed, 0 failed); scratch probes in `/tmp/p32rv` on this branch and on
`git archive main` (`/tmp/p32main`). Not run: the story test, the full check, the models, the faults.

## Findings: 2 High, 1 Medium, 2 Low

**H1 (High) L3b is inert in play; its test skips the scene's `enter`. `js/story/prologue.js:928` (epilogue `enter`), `:946`.**
The epilogue's `enter` sets `g.minutes = (p.day − 1) * 1440 + 19 * 60` by the midnight day before the choice can run, so the choice
always sees 19:00 and `clockDay` = the midnight day. Walked with `goTo` + `choose` (probe5), the same on main and on this branch:
Day 43 23:00 → enter Day 43 19:00 → Act 1 Day 44 06:20; **Day 44 00:30 → enter Day 44 19:00 → Act 1 Day 45 06:20**; Day 44 04:30 → Day 45
06:20. The push's claim ("00:00–04:59 on Day 44 starts Act 1 on Day 44 06:00, not Day 45") holds only for `c.do(g)` called on a set
clock. The P32-A (L3b) test does exactly that (`mk(…, 'epilogue', m); c.do(g)`), so it passes while the game still starts Act 1 on Day 45
(checklist TG2–TG4: "a jump walked, not computed"). Also from 23:00 the `enter` moves the clock back four hours (23:00 → 19:00),
pre-existing (R6-style "never back"). Reach: 0 bot screens at the epilogue after midnight (p32-measure). Fix: open, options later (the
`enter` by `clockDay` and never back, or the choice alone accepted as is).

**H2 (High) L2 against a real old save's `wake.lastX`: a lost day two days on; TG3's sample can't be written by an old build.
`js/core/game.js:1641` with `wakeState` `:456-465`.** A pre-v0.11.226 save at 04:00–04:59 was written under the old X4 (04:00, 240), so
`lastX` = d (P31 review L1 says the same of v0.11.262 saves). `flipOne` does not move `g.wake`; the first `wakeState` jumps `n` by
`X4(new) − lastX`, one short: old Day 9 04:30, `wake {n 8, lastX 9}`, `probe@8` → wakeDay **49**, marks on **50** (calEnd(8)). Played on
(probe3: sleep, day, sleep): this branch: tonight open, Day 51 open, **Day 52 06:00 wd 50 done: closed all Day 52**; main: marks on 44,
never closed. So L2 turns "the evening's card open again tonight" (main) into "open tonight and lost on Day 52". The P32-A TG3 sample
builds the old save with `advance` under the new X4 (`lastX` 8), wakeDay 50 = markDay, so it passes. Reach: 0 of 39 saves at 04:xx;
only an old-calendar save never opened since v0.11.226. Fix: open, options later (e.g. `flipOne` also sets `s.wake.lastX` by the one clock
from `m0` before the shift).

**M1 (Medium, pre-existing since v0.11.226; L2 widens it to 04:59) A night flip loses the next waking day. `game.js:462` with `:638`.**
The flip's jump sets `wake.slept` = the flipped calendar day, so the first `sleepUntil(g, 6)` that same calendar morning finds
`d > slept` false and does not count the night. A real save, `saves/2026-11-12-2046-incremental-bl_night.txt` (old Day 12 01:25 → Day 66
01:25): wakeDay 65 after the flip (right), **after sleeping to Day 66 06:00 still 65**; its six marks on 65 (`rr_forage`, `rr_scout`,
`yk_time`, `yk_camp`, `bl_cook`, `bl_fire`) stay closed all of Day 66. A native long game at Day 66 01:25 (`slept` 65) turns to 66. FP1
asserts wakeDay at 00:30 but never sleeps on (TG3). Fix: open, options later.

**L1 (Low) Pre-push saves under the midnight key, the Heart.** No double talk: one camp per night (every camp choice goes to
`heart_night`). A talk written at 00:00–04:59 before this push (`hc_mei@D+1`) closes the next evening (Day D+1) as on main: one talk
lost, as before. The guardian in the late phase (`late`, door shown at night): a loss at 00:10 before the push (`guardian_lost_day` D+1)
lets the door open again at 00:30 (hday D) and keeps it shut all of Day D+1: one try moved earlier. Both once, no state broken.

**L2 (Low) Readers left on the midnight day, checked.** Decides something: `romance.js:75-76` `markTier`'s "a beat already today"
(`floor(minutes / 1440)`); `heart_camp` and `bl_camp` are reachable after midnight ("Make camp" shows when `!active`), but no path
re-enters a camp across midnight in one night, so no double beat found. Display only (L3a, fine): every `day(g)` caller (the four
"Day N" titles, `fo_ashfall`'s "N days until the Elder", act1_fallout.js:390), `bl_morning`'s title, `runWeek`'s day groups (week.js:574),
`nextStep`'s Day 1 hints (tasks.js:910). Not a day key: freshness (`calDay0`, a span count), `foundation_day` (no reader but the flip),
`toHour` (act1_return.js:67; `dayHour` from 05:00). `week.js` `calDay` (~246) now only feeds `runWeek`. `FLIP_DAY_FLAGS` and the `@d`
marks: the night rule's `calEnd(d − 1)` now matches the Heart's `clockDay` keys (on main it didn't). The Coil's snapshot: its rewind
points are at dawn or Day 1, so the night rule never fires there; `peekSave` reads `minutes` only (unchanged by L2).

## The new tests against their labels
- clockDay, L3c Mei/Ya/late/mid, week.js spring row, F7, R6: each fails on v0.11.263 or under its fault where it claims to (by reading;
  the spring row: main gives `next` null at s16 + 3 00:30).
- L3b: fails on main's choice code, but passes with the game wrong (H1).
- L2 / TG3: passes on an unreal old save (H2).
- L3c guardian and spring `enter` at 00:30 / 04:30: states the game cannot reach (the spring's wash shows 06–18 only; the guardian's
  door at night only in the late phase, the test's day is s16 + 2) — a write check, not a play check (TG4, TG6).
- L3a countsFill, TG4 foldNight, F6: guards, labelled so; they pass on main too, as they say.
- Every `act1_heart.js` code change is caught by the P6A TG1 skeleton pin whatever it does; counting a Heart fault "caught" there says
  nothing about behaviour (R1, R2, R6 below).

## Test gaps
- **TG1** L3b walked: `goTo(g, SCENES, 'epilogue')` at Day 43 23:00, 44 00:30, 44 04:30, then `choose` "Act 1"; read the clock, and that
  the `enter` never writes it back (fails today: H1).
- **TG2** TG3's old save as an old build writes it: `wake {n: d − 1, lastX: d}` at 04:30 (and `lastX: d − 1` at 03:30), flipped, then
  sleep / day / sleep twice: the evening's mark done tonight, open on the next two mornings (fails today: H2).
- **TG3** After every night flip (00:30, 04:30, and the real `bl_night` save): `sleepUntil(g, 6)` and assert wakeDay = the next waking
  day and the evening's marks open (fails today: M1).
- **TG4** The late-phase guardian through `sceneView`: lost at 23:50 and at 00:30 on a late day; the door at 00:30 / 04:59 hidden, at
  05:00 shown; before the late phase, the crawl after a 14:00 loss at 04:59 shown, at 05:00 gone.
- **TG5** A fireside talk taken at 00:30 (its `do` at night), then the next evening by `sceneView`: open (R2 survives every behaviour test).
- **TG6** L3c's spring and guardian walked by the real choice, not `enter` on a set clock.

## Planted faults (`project/research/p32-faults-review.json`, not run)
R1 guardian door by `day(g)` — code pin only; R2 Ya's talk written by `day(g)` — code pin only; R3 the spring's key by `day(g)` —
P32-A (L3c); R4 the spring row's `next` against `calDay` — P32-A (L3c, week.js); R5 the flip's night `<=` 05:00 — saves FP1; R6 the
crawl by `day(g)` — code pin only; R7 Mei Lin's talk shown by `day(g)` — P32-A (L3c). Expected: 7 of 7 caught, 3 of them only by the
Heart's code pin (a re-pin would let them through).
