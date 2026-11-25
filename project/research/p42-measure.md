# P42 — measured before the pick (2026-11-25, on v0.11.273)

Scratch copies of the repo; nothing in the working copy changed. The models, 100 games each of Careful, the Sociable, the Completionist and the Cultivator (`--games 100 --off 0`, seed 0, the long calendar).

## The runs

| Run | What | Careful / Sociable hungry (old count) | Fed 0–9 | T3 Careful / Sociable | T1 Completionist / Cultivator |
|---|---|---|---|---|---|
| base | v0.11.273 | 571 / 589 | 127 / 111 | 4.96 / 4.96 | 18 / 32% |
| v1 | EB (the bots eat on story screens under Fed 50) | 351 / 335 | 71 / 44 | 4.98 / 4.97 | 18 / 32% |
| v2 | EB + EH (Eat on `ht_start`, `heart_gate`, `heart_hall`) | 97 / 80 | 0 / 0 | 4.98 / 4.97 | 18 / 32% |
| v3 | TL-a (the 20 talks at 10 min) | 544 / 550 | 136 / 103 | 4.96 / 4.97 | 21 / 32% |

Other lines in v2 against base: Act 1 C4 dead 96 → 98% (Careful), 96 → 97% (the Sociable); the rot ape 48.8 → 48.3% / 48.5%; the Elder fought 31 → 28 (the Completionist), 37 → 42 (the Cultivator); tribute Day 43 and Act 1's end Day 103 unchanged in every run. All within the run's noise (100 games).

Where v2's 97 fell: `ht_start` 49 (the count is taken on arrival; the bot eats on the next step), `bl_end` 38 (its one choice leads to `ht_start`), `bl_camp` 6 (after its once-a-day cook), `dw_enter` 4. Before (base): `heart_gate` 148, `bl_camp` 60, `heart_hall` 60, `heart_hub` 60, `ht_start` 55; `heart_hub` and `bl_camp` already had an Eat choice, so HL counts only screens where nothing to eat is open.

## The kept lift (LK)

`liftKept` on a new game (meridians closed), at ×1 learning: kept realms 1–6 open 12 primaries and 8 collateral groups (20 standard awards): Convergence Use, GU and Yuki's Qi Use each +120 XP (T1 L1 → T1 L3); from realm 7 also the Extraordinary 8 and 28 collaterals (56 awards): +552 (→ T1 L7). Each award shows 3 lines; before P42 all were dropped (60 or 168 lines).

## The times lint (TL)

The lint flags 34 choices, not 30 (P41's count): 20 talks (280 min in all), 7 sleeps (3,260 min), 3 studies, 2 meetings, a meal, a training. Each sleep's night is slept on a later screen (`tribute_dawn_sleep`, `fo_depart`, `bl_night` / `bl_morning`, `heart_morning`, `rt_quiet_night`: `sleepUntil`), so 480 min on the choice would count the night twice. The 7 others are misreads by the word sort: "Leave it/him" (study ×2), `rt_parley:0` (study), `fo_envoy:2` and `rt_yk_talk:1` (meeting), `ya_mocks:0` (meal), `rt_elder:3` (training).
