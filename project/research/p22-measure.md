# P22 — the retune's second push, measured (v0.11.252; the owner 2026-11-22 10:42 "P22-a go")

Repo only (rule 8). The models (`tests/models.test.mjs --cal 7 --off 0`), the long calendar, 40 games a model unless named; the
trials on a scratch copy with env knobs (FM step/max, JR DC, Lu Han raw HP, a d6 spread, the defence memory), none in the game.

## What drove v0.11.251's numbers

- **Careful's 4.17 Coils:** its tribute turned on its defence against the second foe (atk 9.5): GU 5 half lands (1 a round), GU 4.5
  lands (3). Careful came to the tribute at GU T1 L10 (5) on Coils 2 and 4 and T1 L9 (4.5) on Coil 3. FM's attack memory had no effect at
  any size (steps 1.5 / 3 / 4 / 5, max to 10: 4.17 every time): its blade stayed a glancing blow (GU 9.5–10.5 against DC 10.8).
- **The jackals:** Careful always takes the run; its Convergence Use at night on Coil 1 is 1.5 against no-dice DC 2 (DC 4): it fails,
  fights and dies 75%. Coil 2 on: CU 2, it gets away.
- **The cliff:** Lu Han raw HP −1 / 0 / +1: the Completionist's Coil-1 wins 40 / 25 / 0%, the Cultivator's 52.5 / 15 / 5%. The bots play
  near-alike games, so any threshold shows as a step. A glancing blow by the ratio (dmg × ratio, the tribute only) did not smooth it:
  HP 0 / +1 / +2 / +3: 60 / 55 / 55 / 40% and 52.5 / 15 / 15 / 5%.
- **Act 1:** cleared on the prologue's Coil by every model; no deaths, none taken (TS7, the next push).

## The trials (Careful unless named)

| Trial | Careful Coils | Note |
|---|---|---|
| v0.11.251 | 4.17 | C1 dead 75% (jackals), C2 / C3 lost, C4 won 82.5% |
| JD alone (DC 3.5) | 4.35 | C1 ends at the tribute instead |
| FM 3/6, 5/10 (± JD) | 4.17 / 4.35 | no effect |
| FD ×0.17 / 0.33 / 0.5 / 1 of FM (+0.25 … +1.5 a meeting) | 2.77 each | any push past GU 4.75 is enough |
| FD + JD | 2.00 | C2 won 100% |
| FD + JD + the spread (d6 − 3.5) | 2.38 | Completionist / Cultivator Coil-1 20 / 32.5%; at 120 games 16.7 / 27.5% (FD + JD without it: 19.2 / 13.3%) |
| the spread ×1, Lu Han raw HP −1 / 0 / +1 | — | Completionist 35 / 20 / 7.5%, Cultivator 50 / 32.5 / 7.5% |
| the spread ×2 | — | Completionist 32.5 / 32.5 / 12.5%, Cultivator 40 / 40 / 10% (lumpier) |
| the spread ×1, raw HP +0.5 / ×1.5 | — | 12.5 / 17.5% and 35 / 50% |

FV: the bots take the bluff or the pin on 25 / 30 / 28 of 42 won screens (Careful / Completionist / Cultivator).

## As built (v0.11.252, after RV-A)

FD is the defence memory at +0.5 a meeting, up to +1.5; FD, JD, TC, FV and PN are long calendar only (RV-A: FV and PN were first
built on both calendars and the old calendar's task bots failed 1 of 725,590, rr_hub:18 played). The spread is drawn from the save's
d6 as trialled (RV-A); first built from the seed and the Coil's number it gave 2.35 Coils for Careful and, at 120 games, Coil-1 wins
10.8% (Completionist) / 21.7% (Cultivator).

| Model | Prologue Coils (40 games) | Coil-1 prologue win | Coil-1 deaths | Tribute by Coil |
|---|---|---|---|---|
| Careful | 2.38 | 0% | 0% | C1 lost 100%, C2 won 72.5%, C3 won 63.6%, C4 won 100% |
| Sociable | 2.38 | 0% | 0% | as Careful |
| Completionist | 1.85 (120 games) | 16.7% (120 games) | 10% | C1 won 18.5%, C2 won 98% |
| Cultivator | 1.73 (120 games) | 27.5% (120 games) | 0.8% | C1 won 27.7%, C2 won 100% |

## The old calendar in the tests (the owner's question, 2026-11-22 11:59)

A scratch copy with `newGame`'s default calendar the long one, `node tests/tasks.test.mjs --bots-only` (1,000 games, 289 s): 1,233,378
passed, 12,447 failed: 10,566 "familiarity grows on <card>" (a work card played without its familiarity rising; not yet sorted) and
1,881 "dry run = what happens" (every one a run stopped by an event: the forecast's minutes, Fed or HP against what happened; e.g.
wild_explore:1 forecast 131 min, stopped at 104, Fed 42.4 against 37.6): ashfall 858, fo_ashfall 678, wild_explore 253, heart_hub 68,
wilds 24.
