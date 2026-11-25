# P45 measure: DF, the death farm's shapes (2026-11-25, on v0.11.276, 144d172; owner pick P45-D: closed as accepted)

All on the long calendar, seed 0, `--off 0`, 100 games a model. Scratch copies only (`DF_SHAPE`, `DF_CAP` in `coil.js` / `game.js`; a living farm bot in the models test: `FARM_LIVE` days or `FARM_LVL` levels, then a forced beast death and the first dawn, `FARM_K` times, then plays as `FARM_AS`; `MAX_COIL` by env). Nothing here is in the game.

## 1. Where honest deaths fall (days lived in the Coil; levels gained: GU + Convergence Use levels + 10 × realm)
- Careful: tribute 294 at 41.9 days (+12 levels); the rot ape 108 at 35.2 days (Act 1).
- the Completionist: tribute 69 at 42.0; beasts 14 at 17.1 days (3 at ~2 days), +7.3 levels.
- the Sitter: beasts 171 at 20.1 days (8 at ~2), +7.4 levels; tribute 77 at 42.0.
- the Rusher: beasts 347 at 9.5 days, collapses 347 at 8.1 days (+4–5 levels); tribute 102 at 40.9.
- the farm (dies on Day 1's night): 0.6 days, +0.6 levels. Earliest honest death: 1.78 days.

## 2. The shapes (farm-Careful: 4 deaths at the shape's full point; its taps a game against honest Careful's)
| Shape | Careful T3 | Sociable T3 | Completionist T1 | Cultivator T1 | Sitter Coils (taps) | Rusher clears (8 / 20 Coils) | Farm-Careful: Coil 1, taps (spent farming) | Farm-Completionist |
|---|---|---|---|---|---|---|---|---|
| as built | 4.94 | 4.97 | 21% | 32% | 3.45 (1,928) | 12% / 100% (10.69) | 100%, 564 (54) −47% | 100%, 919 (81) |
| step:1 (a first-day death adds nothing) | 4.94 | 4.97 | 21% | 32% | 3.45 | 12% / — | 100%, 578 (80) | 100%, 937 |
| cap 3 (×1.75 at most; farm 3 deaths) | 4.94 | 4.97 | 21% | 32% | 3.45 | 0% / — | 100%, 552 (41) | 89%, 913 |
| ramp 7 days | 4.94 | 4.97 | 21% | 32% | 3.57 (1,946) | 14% / 100% (10.58) | 100%, 622 (156) −41% | 100%, 1,028 |
| ramp 14 days | 4.94 | 4.97 | 21% | 32% | 3.57 | 0% / 97% (14.01) | 100%, 650 (195) −39% | 100%, 1,069 |
| ramp 28 days | 4.94 | 4.97 | 21% | 32% | 5.04 (2,173) | 0% / 39% (18.26) | 84%, 742 (312) −30% | 96%, 1,282 |
| ramp 42 days (a full prologue) | 4.99 | 5.00 | 21% | 32% | 6.77 (2,263) | 0% / 0% | 0%, 1,038 (664) −3% vs 1,075 | 32%, 1,611 (+60%) |
| by levels, 10 | 4.94 | 4.97 | 21% | 32% | 4.94 (2,136) | 0% / — | 100%, 674 (242) −36% | 96%, 1,092 |

Ramp D: a death adds 0.25 × min(1, days lived / D). One cheap death with no shape: the Completionist 21% → 91% whole game on its first real Coil (21 taps); Careful ×1.25: mean Coil 3.82 (931 taps); two deaths ×1.50: Careful 2.00 (830 taps), the Completionist 97%.

## 3. The R42 build (P45-A, picked 21:13; built locally, held at its stop, B3; its diff `p45-r42.patch`, not in the game)

`game.js`: `coilStart` keeps the minute (`m`); `COIL_FULL_DAYS` 42, `coilDays`, `coilShare(g, why)` (a death `min(1, floor(days / 42 × 100) / 100)`, a won act 1, a choice 0; a Coil with no `m`, a save from before, in full), `coilShareText`, `coilDeathText`, `coilMultNext(g, chosen, why)`; `coil.js` `rewind`: `free += 1 − share` (in hundredths); the Coil screen, the James tab and the FAQ lines; the tasks test (the C1 block's deaths as 42-day Coils; an R42 block). Faq, saves and news tests passed.

What it turned up (50 games, then 100; against the unchanged game):
- **MR, models the options had not shown** (100 games, seed 0, `--off 0`; the Yuki-off lines `--off 100`): the random player's Act 1 58% (6.19 Coils, 1,206 taps) → **2%** (98 of 100 gave up after Coil 8; 528 taps); Careful without Yuki 100% (6.55 Coils, 1,337 taps) → **86%** (7.76, 14 gave up; 1,545); the Completionist without Yuki 3.57 (1,200) → 4.31 (1,263); Careful 4.94 → 5.00 (1,060 → 1,071 taps), the Completionist 21% → 21% (1.81 → 1.90 Coils).
- **R7 on the same** (scratch, `DF_SHAPE=ramp:7`): the random player 14% (86 gave up; 752 taps); Careful without Yuki 100%, 6.99 Coils (1,458); the Completionist without Yuki 3.61 (1,207); Careful 4.94, the Completionist 21% (unchanged).
- **TK, the tasks test's 1,000 bot games:** Act 1 Coils 66 → 1; cards run 372,415 → 192,535; cards played 186 → 181 (`rr_hub:13`, `workshop:1` never); the tribute won at Coil 3 / 4 17.3% / 36.3% → 0% / 4%; one dry-run assert on a new path (`wild_explore:2`, run 672: the dry run's death minute right, 3792 = 3792; the assert only takes a death after the card's full time). TB1 (the bots' deaths counted in full, one test line): every number as today, 1,333,626 passed, 0 failed.
- **SW, the story test's walks:** Long Forest run 369 of 600 died 27 times running (Coil 28, Day 2) and never reached dawn in 1,200 steps (before: dawn on Coil 2). SW1 (the walk's deaths in full): 600 of 600.
- **PN:** 8 PR2 / VQ1 run hashes (the save carries the new start minute).
