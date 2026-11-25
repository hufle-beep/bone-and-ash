# P41 — measured before the pick (2026-11-25, on v0.11.272)

A scratch copy of `tests/models.test.mjs` (in `tests/` while it ran, removed after): a Heart counter (the taps and card taps of each stint in story days 16–18 of Act 1, by `storyDay`) and a `BD=1` switch that keeps a player's daily doors on the bots' plans (it skips v0.11.210's `p.doors = {}`). `--off 0`. Careful and the Sociable 100 games (seed 0); the Completionist and the Cultivator 100 (seed 0) + 200 (seed 1). Nothing in the repo changed for these.

## BD, the bots' daily doors on the plan

| model | base, seed 0 | BD, seed 0 | base, seed 1 | BD, seed 1 | base, both | BD, both |
|---|---|---|---|---|---|---|
| the Completionist, the whole game on Coil 1 (T1 20–30%) | 18% | 30% | 19.5% | 26.5% | 19.0% | 27.7% |
| the Cultivator, the same (T1) | 32% | 20% | 21.5% | 16% | 25.0% | **17.3%** |
| Careful, Act 1 cleared, mean Coil (T3 4.38 ± 0.75) | 4.96 | 4.90 | — | — | | |
| the Sociable, the same (T3) | 4.96 | 4.91 | — | — | | |

Taps a game: Careful 1,060 → 1,081, the Sociable 1,224 → 1,251, the Completionist 1,003 / 1,000 → 980 / 993, the Cultivator 1,221 / 1,252 → 1,281 / 1,287 (seed 0 / seed 1). Careful's Heart card taps 1 → 2. A 25% share has a standard error of about 2.5 points at 300 games: the Cultivator's 17.3 is 2.7 under T1's floor. Not taken (P41-A).

## HN, the Heart

| model | passes a game | taps a pass, mean (p10 / p50 / p90) | card taps a pass, mean (p10 / p50 / p90) |
|---|---|---|---|
| Careful (100, seed 0) | 1.00 | 31.6 (28 / 31 / 35) | 1.0 (1 / 1 / 1) |
| the Sociable (100, seed 0) | 1.00 | 31.7 (28 / 31 / 36) | 1.0 (1 / 1 / 1) |
| the Completionist (100, seed 0) | 1.00 | 55.9 (42 / 51 / 71) | 6.9 (5 / 6 / 8) |
| the Completionist (200, seed 1) | 1.00 | 53.6 (42 / 54 / 64) | 6.7 (5 / 7 / 8) |
| the Cultivator (100, seed 0) | 1.00 | 53.6 (44 / 54 / 61) | 6.8 (5 / 7 / 8) |
| the Cultivator (200, seed 1) | 1.00 | 52.3 (42 / 51 / 60) | 6.6 (5 / 6 / 8) |

v0.11.222 (40 games each): 31–57 taps, 1–7 cards. One pass a game: the bots reach the Heart only on the Coil that wins Act 1 (Careful and the Sociable die on C3 and C4 before it).

## FE, under Fed 30 with food (the HN1 log line)

Careful 571 times in 100 games (5.7 a game; Fed 20–29 / 10–19 / 0–9: 248 / 196 / 127), most at heart_gate 148, bl_camp 60, heart_hall 60, heart_hub 60, ht_start 55; the Sociable 589 (5.9; 264 / 214 / 111), heart_gate 149, ht_start 67, heart_hall 67, heart_hub 67, bl_camp 59. The Heart's screens: 57% of Careful's count. None of them has an Eat card (HN1: a player can't eat there either).

## The choices' times (TL) and the XP call sites (SW)

A static count before the build (`defaultMinutes` over `SCENES`, places compared as `?.place || ''`): 855 choices, 392 their own time, 50 fights, 93 timeless or ends, 61 a computed target, 259 on the default (act 34 / move 151 / talk 74). The lint as built (`tools/timelint.mjs`) compares places only when both are plain strings and leaves out the 57 choices whose code moves the clock itself: 202 linted (act 25 / move 65 / talk 112), 30 off Rules Engine C's times (most are sleeps at 10–20 min against the engine's 480 and actions at 30 that read as talk).

32 XP call sites in `js/` (`awardXp`, `awardFightXp`, `awardYukiFightXp`); 31 return their lines to what the player sees; `liftKept` (`js/core/coil.js`) drops them. The watch as built: 0 silent changes in 6 games each of Careful, the Completionist, the Cultivator and the Completionist's kept pass (`--kept-clears 5`); with `XP_LINE` broken on purpose, 922 of 922 steps flagged (2 Careful games).
