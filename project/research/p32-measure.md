# P32 — the one clock's leftovers: the numbers (2026-11-24, on v0.11.263, scratch copies only)

Scratch copy `/tmp/p32w` (`git archive HEAD`); a hook in its `tests/models.test.mjs` only (after `sceneView` in the bots' loop: every
screen at 00:00–04:59 logged). Nothing copied back.

## In play (bots, `--cal 7`, 80 games: 8 models × 10)
- 2,864 screens at 00:00–04:59: 370 at 00 h, 2,492 at 01 h, 2 at 02 h, 0 at 03–04 h. Top: `bl_night_event` 572, `night_event` 391,
  `night_attack` 327, `bl_night_won` 273, `village_night` 163, `jackals_won` 151, `fo_wolf` 143.
- The readers L3 names: `fo_ashfall` 7 (00 h: its title and "N days until the Elder" by the label's day), `fo_depart` 12,
  `fo_farewell` 7, `fo_last_night` 8, `heart_view` 17 (reads no day key); 0 `epilogue`, 0 `heart_camp`, 0 `heart_hub`, 0 `guardian_*`.

## Saves (39)
- 36 old calendar (before `flipFill`), 3 long. 0 at 04:00–04:59; 2 at 01:25 (`bl_night`, the same either way). No v0.11.262 save.

## Direct probes
- L1: v0.11.263 is live; a v0.11.262 save opened under it is re-saved with `lastX` by the new clock and can't be told apart. A
  `Math.max` on `lastX` would stall the waking day after the Long Forest's way back (`prologue.js` "Go back the way you came" sets the
  clock back on purpose). Closed as accepted (owner pick P32-A).
- L2: old Day 9 (act 1) at 04:30 → Day 51 04:30: as is `cal_night` 0, day 8's marks on Day 44 (wakeDay 50: a card done that evening
  open again); with `tod < NIGHT_TO * 60` `cal_night` 6, the marks on Day 50 (done).
- L3a: `countsFill` slots only in `act1_fallout.js`, `house_texts.js` (`fo_ashfall:*`) and `tribute_texts.js` (`letterPaid`, a
  Fallout scene's); Day 44 00:30 (story day 7) draws none.
- L3b: the epilogue's Act 1 start from Day 43 23:00 → Day 44 06:00; from Day 44 00:30 and 04:30 → Day 45 06:00 (as is).
- L3c: a fireside talk on Day 99 (e18 − 1) evening; the camp at Day 101 00:30: open as is (the key 101 is story day 19's, not the
  stay's); mid-stay held. The spring and the guardian: their choices show 06:00–18:00 only (`active`), so the keys read the same.
- F6 (P31's survivor) planted: 0 of 7,040 forced evening-hub screens at 04:30 / 04:59 (8 hubs × 2 flag sets × 2 acts × 110 days) show
  "Call it a day"; 220 at 10:00 do. An equivalent change.
