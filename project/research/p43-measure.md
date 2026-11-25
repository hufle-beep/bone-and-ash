# P43 — measured (2026-11-25, on v0.11.274 and the build)

Scratch copies of the repo; nothing in the working copy changed. The models, 100 games each of Careful, the Sociable, the Completionist and the Cultivator (`--games 100 --off 0`, seed 0, the long calendar).

## Before the pick (P43's options, `claude/p43-options.md`)

| Run | What | T3 Careful / Sociable | T1 Completionist / Cultivator | Hungry line Careful / Sociable (100 games) |
|---|---|---|---|---|
| base | v0.11.274 | 4.94 / 4.97 | 21 / 32% | 37 / 34 |
| var | L1 (the times) + L2 (raw at the roots and the doorway); `fo_spy:1` at 80 | 4.94 / 4.97 | 21 / 32% | 39 / 37 |

Other lines against base: Act 1 endings within ±6 (accord 90 → 91, revelation 10 → 9 for Careful; the Completionist accord 37 → 34, revelation 32 → 38, victory 31 → 28), the Elder fought 31 → 28 / 34 → 30, last nights within ±3. All within 100 games' noise.

The talks' screens (scene:index, before → after): `ya_share:1` 20 → 10, `rt_trio:1` 20 → 10, `rt_evening:6` 10 → 20, `heart_core:1` 10 → 30, `ya_found:1` 10 → 30, `trio_kiss:0/1` 10 → 20, `fo_spy:1` 30 → 80 (then R-A's FS-a, below). TL-a's list 19 → 16.

Song screens with an action back to themselves (L3): `heart_hall` (Eat), `bl_camp` (Cook and eat, the stakes), `rt_camp` (the sit). Screens where a self-returning choice blocked the skip (L4): 12 in the game; the Heart's two (`ht_start`, `heart_hall`) are the Eat's; the rest are work menus (forage, hunt, train, `bone_field`, `hollow`, `meridians`).

## The stop after the cold review (R-A's options)

| Run | What | T3 | T1 | Hungry line |
|---|---|---|---|---|
| base2 | the build (hall cooked) | 4.94 / 4.97 | 21 / 32% | 39 / 37 |
| var2 | HF: the hall raw too | 4.94 / 4.97 | 21 / 32% | 39 / 37 |

FS-a (`fo_spy:1`, latest arrival 16:59; `late` from 19:00): as built (80 on both branches) a success ended 18:19 and a failure 19:19 (late); FS-a: success 120 (30 + the hour and the 60-min way down) ends 18:59, failure 30 + `fo_spy_fled`'s 60 ends 18:29. SH: from `bl_end` at Fed 0.5 with food, the skip walked to Fed 0, HP 21 → 20 (the review's L2); under Fed 30 the Eat stops it again.
