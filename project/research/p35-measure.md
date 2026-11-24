# P35 — section 2: the models' Coil-1 clears under TP (the tribute): the numbers (2026-11-24, on v0.11.266, scratch copies only)

Scratch copy `/tmp/p35b` (`git archive HEAD`); toggles by environment variable in `js/core/game.js`, `tests/lib/smartfight.mjs`
(and, for CT-A's sanity run only, the one `tasks.test.mjs` pin it breaks). Nothing copied back. The models: `tests/models.test.mjs
--model M --games 40 --off 0` (long calendar, 40 games a model). Sanity: `node tools/sanity.mjs` against `tools/baseline.json`
(re-saved in v0.11.266).

## Why the Coil-1 clears are 0% (v0.11.266)
- Every Coil-1 tribute win came through Say something on Lu Han's posture (it costs him that round's attack and the next). TP made
  him heavy, and a heavy person doesn't posture. Lost C1 tributes (the Completionist, 10 games, logged): James at 0 HP in rounds
  8–14, Lu Han at 4–13 HP, his second untouched (6 / 8).
- Lu Han without the tell **and** without the posture (`P35_NOCOL` + `P35_NOPOST`): the Completionist still 0%. The posture is the path.
- The owner's targets (2026-11-22, `history-48.md`): 01:43 "One coil should be winnable but only for the completionist and the
  cultivator"; 02:36 20–30%; after 18:58 the whole game, and Act 1 about 2 more Coils for Careful and the Sociable (from v0.11.252's
  2.38). P34's options were coloured against v0.11.111's key (one-Coil games under 5%): a slip, owned in the P35 options.

## The models (Coil-1 whole game; Coils to clear prologue / Act 1)
| Variant | Completionist | Cultivator | Farmer | Careful | Sociable | Sitter | Rusher (prologue cleared) | Random (cleared) |
|---|---|---|---|---|---|---|---|---|
| v0.11.266 | 0% (2.08) | 0% (2.00) | 0% (2.10) | 3.88 / 4.95 | 3.88 / 4.95 | 4.00 | 7.5% | 60% |
| WP 35 → 25 (and 5) | 0% | 0% | – | 3.88 / 4.95 | 3.88 / 4.95 | – | – | – |
| BB the blow ×1.5 at the tribute | 0% | 0% | – | 3.88 / 4.95 | – | – | – | – |
| TE the tell every 4th round there | 0% (2.05) | 0% | – | 3.83 / 4.95 | – | – | – | – |
| NG the bots take the blow (bot rule) | 0% | 0% | – | 4.00 / 5.00 | – | – | – | – |
| PS Lu Han heavy and posturing, bots as now | 0% | 0% | – | 3.88 / 4.95 | – | – | – | – |
| CT-A the tribute out of TP | 20% (1.80) | 22.5% (1.77) | 15% | 2.10 / 4.40 | 2.10 / 4.28 | 3.65 | 17.5% | 67.5% |
| CT-B every heavy person's stance a posture | 20% | 22.5% | 15% | 2.10 / 4.40 | 2.10 / 4.28 | 3.65 | 17.5% | 65% |
| CT-C gate 15 blade rounds | 20% | 22.5% | 15% | 3.85 / 4.95 | 3.85 / 4.97 | 3.65 | 17.5% | 62.5% |
| **CT-C gate 20 (picked, P35-A)** | **20% (1.80)** | **20% (1.80)** | **15%** | **3.88 / 4.95** | **3.88 / 4.95** | **3.65** | **17.5%** | **62.5%** |

Tribute by Coil, CT-C gate 20: Completionist C1 won 21.6% (n 37), C2 100%; Cultivator C1 20.5% (n 39), C2 100%; Careful C1–C2 0%,
C3 12.5%, C4 100% (as v0.11.266). WP: blade practice is no lever (`weaponMastery` moves nothing there now).

Blade rounds (`g.stats.weapons.blade`) at each tribute's start (40 games a model): Careful C1 1.4, C2 4.9, C3 10.1, C4 14.5 (none
reach 35); the Cultivator C1 20.7, C2 30.4; the Completionist C1 32.7 (14 of 37 at 35+), C2 48.3; the Sitter C2 43.4 … C4 92.7.

## Sanity (±20, n ≥ 50; against the baseline re-saved in v0.11.266)
- **CT-C gate 20:** 3 drifted: tribute C4 won 11.9 → 33.1% (+21.2), C4 lost 86.5 → 62.1% (−24.4), the tasks test's collectors smart
  44.8 → 72.4% (+27.6); 6 past 5 (tribute C3 won +14.7 / lost −14.7, C5 won +12.8 / lost −16, C6 won +7.3 / lost −10.4); 0 invariants.
  The tasks test's bots practise the blade more than the models' Careful, so the gate passes for them.
- **CT-C gate 15:** 3 drifted (+24.4, −27.6, +29.5), 6 past 5.
- **CT-A:** 3 drifted (C4 won +26.8, C4 lost −29.2, collectors smart +29.8), 7 past 5 (collectors random +5.4 among them).
