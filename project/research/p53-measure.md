# P53 — the read behind G3's options (2026-11-27 ~02:00, from v0.11.284, 9630ddf)

Reads and one browser timing run only; nothing changed. The options: `claude/p53-options.md` (the project doc).

- **SB:** `statusHtml` draws HP, Convergence, Fed and the clock; the hold (`HOLD_MS` 500) worked on `button.card, button.choice` only.
  HP's max `maxHp({ body: GU check, realmIndex })` = floor(realm fill of 20 + 2 × body); Convergence's `qiPoolMax` = 20 + Convergence Use
  check + primaries open + realm bonus, ×1.25 rounded to 0.5; Fed −3 an hour (`SATIETY_PER_HOUR`), half asleep.
- **FE:** `famLine` already "Practised · 5/8 to Skilled" (v0.11.155); the tooltip "Familiarity: Practised, 5 of 8 to Skilled."
- **FS:** `saveFileName` = `bone-and-ash-${clockLabel}.json` (the game clock only); export-all and the error and status files `stamp()`ed.
- **OS:** `data-save` wrote the slot at once (no ask, no backup of the slot); `data-load` and Load save file loaded at once after
  `backupBefore`.
- **HK:** no `keydown` handler in `js/`. **CR:** `CREDITS.md` 2,193 bytes, 7 entries; none in the game.
- **PF** (`project/research/p53-perf.py`; headless Chromium, 390 × 844, `Emulation.setCPUThrottlingRate`): saves `v0.11.214-long-fallout-day64`,
  `v0.11.210-long-wilds-evening`, `v0.11.7-long-forest-coil2`, `v0.8.5-day1-stream`. At 1×: open 221–365 ms, Continue 37–124 ms, tab
  median 29–41 ms (max 32–133). At 4×: open 498–708 ms, Continue 207–536 ms, tab median 35–74 ms (max 102–206), long tasks up to 469 ms
  (Continue); a card tap's main-thread work 101–150 ms (day 64), 108 ms (wilds; 2 of the 4 saves gave a tap read).
- **CH / TL:** kept today: `coil.n`, `stats.best`, `stats.pass`, `stats.clears`; the owner's newest save (`2026-11-13-1356-incremental-a1_again.json`,
  115 KB) is at Coil 8 (`coils0` 8).
- **L4:** `planStep`: kept 2, left 0 → − → kept 1, left 0 (clamped) → + → kept 2, left 1. The bots never call `planStep`.
- **ST:** `research.md` #28, #39, #40 wait on crafting and Insights (not built).
