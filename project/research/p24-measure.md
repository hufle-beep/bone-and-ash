# P24 / P25 — measured after v0.11.253 (2026-11-22 evening; the owner's answers at 18:58)

Repo only (rule 8). Scratch copies only; nothing in the game changed.

**The owner's answers (2026-11-22, after 18:58, in the question dialog):** the 20–30% one-Coil win for the Completionist and the
Cultivator covers the **whole game**; Act 1 should cost Careful and the Sociable **about 2 more Coils**; the full check's 40 minutes
are **too long** (measure ways to shorten it); the glasses: **ten lines are enough** (the item closes).

## 1. Act 1 (TS7), the models on the long calendar (`--cal 7 --off 0`, one worker)

Stats at the rot ape (the wall every route meets), the mean of each Coil's fights: GU as tier×10+level, Convergence Use likewise.

| Model, Coil | GU | Convergence Use | realm |
|---|---|---|---|
| Careful C2 / C3 / C4 | 32.7 / 36.1 / 37.8 | 17.4 / 18.1 / 18.4 | 1 (Foundation) |
| Completionist C1 / C2 | 30.1 / 36.3 | 18.3 / 19.0 | 2 (Core Formation) |
| Cultivator C1 / C2 | 39.5 / 47.1 | 28.3 / 32.6 | 5 |

The Completionist on Coil 1 is weaker in skills than Careful on Coil 2; only the realm separates them. Careful and the Sociable stay at
Foundation through Act 1 on every Coil.

| Trial (the rot ape's tune, now 1.5) | Careful Act 1 mean Coil | Completionist whole game C1 | Cultivator whole game C1 |
|---|---|---|---|
| as built | 2.40 (40 g) | 17.8% (500 g, the full check) | 25.6% (500 g) |
| 11 for everyone (+9.5) | 4.47: C2, C3 dead 100%, C4 47.5% | 0% (120 g: Coil-1 Act 1 dead 100%) | 27.5% (40 g) |
| 13 / 15 for everyone | 8.00 (85% never clear) | — | — |
| **11 below Core Formation, 1.5 from it (AW)** | **4.47 (Sociable 4.40)** | 17.5% (120 g; unchanged) | unchanged (realm 5) |
| 11 below, 5 from Core Formation | — | 9.2% (120 g; C1 dead 47.6%) | — |
| AW + Lu Han's raw HP −0.25 | — | 18% (200 g) | 35.5% (200 g) |
| AW + Lu Han's raw HP −0.5 | 4.39, prologue 2.29 (120 g) | 22% (200 g) | 35.5% (200 g; 31.7% at 120) |

Every Act 1 death in these trials is the rot ape. No fight knob moves the Cultivator; the realm pace (TS7's other half) is not trialled.

## 2. The full check's length (v0.11.253: 2,374.4 s, 3 jobs on 2 cores, 72 min of CPU)

The steps (seconds, as run in parallel): models 1,355, tools 539, tasks 490, models-kept 286, story 243, track-story 142, track 133,
the browser parts 90, the part tests 66, the rest about 60. The check is bound by CPU (72 min of CPU on 2 cores), so a step's CPU saved
is about half that in wall time.

The models step alone (standalone, 2 workers): 500 games a model (the Sitter 150, the Farmer 100, Yuki off 300): 1,323 s; **200 (60, 40,
120): 534 s, measured**. Cards played at 200: Cultivator 130k, Sitter 90k, Completionist 79k, Completionist Yuki-off 59k, Sociable 54k,
Careful 46k, Careful Yuki-off 43k, Farmer 15k, Rusher 12k (578k in all; the Yuki-off games 18%). The models' numbers at 200 games
(Careful 2.54 Coils against 2.46 at 500) move by noise only; at 20% a share's noise is about ±2.2 points at 500 games, ±3.5 at 200.
The strict drift guard reads the task and story games (1,000 each, `sanity.mjs` needs 1,000), not the models.

Estimates from the measured step times (not a measured full check): the models at 200 about 1,600 s (27 min); and the realm-kept models
40 → 20 a model (286 s → about 145) about 1,530 s; and the Yuki-off games dropped about 1,440 s.
