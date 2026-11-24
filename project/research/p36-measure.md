# P36 — the long calendar's drift guard and the owner's targets: the measurements (2026-11-24, on v0.11.267)

Measured before the pick (owner 2026-11-24 19:41: "P36-a go"; the options: `claude/p36-options.md`, the project doc). Nothing in the repo changed for these runs.

## Runs
- **R0:** the full check's models step as it is (`tests/models.test.mjs --model careful,completionist,rusher,sitter,farmer,cultivator,sociable --games 200 --sitter-games 60 --farmer-games 40 --off 120 --off-models careful,completionist --texts --json …`): 9 m 22 s on 2 cores alone (795 s inside the full check of v0.11.267). 67 passed, 4 notes.
- **R1:** the same with `--seed 1`: a pure reshuffle of every game (the noise of the guard). 67 passed, 4 notes.
- **R2:** Careful alone (`--model careful --games 200 --off 0`) on v0.11.254 (`8ae86a5`), v0.11.255 (`c06c290`, P25-A), v0.11.265 (`21a040b`) and v0.11.266 (`9d124bf`), each with its own tests (worktrees, removed after).
- The comparison: v0.11.251's names (`tools/sanity.mjs`' long part, now `tools/lib/longguard.mjs` `longMetricsOf`).

## LB: R0 against `tools/baseline-long.json` (saved 2026-11-22, before P25-A, TP, CT-C)
345 numbers (227 with n ≥ 50); 295 with n ≥ 20 on both sides; 29 moved past 5 points, 23 past 20 (17 of them with n ≥ 50 both sides); 4 gone (n 117). Under the guard rule (LG): 21 flags (17 moves + 4 gone).

| Number | Then | Now | n |
|---|---|---|---|
| careful / sociable Act 1 C3 dead | 0 | 100 | 59 → 21 |
| careful Act 1 C4 dead (sociable 96.5) | 0 | 96 | 24 → 200 |
| careful / sociable tribute C2 won | 58.5 | 0 | 200 → 200 |
| careful / sociable tribute C3 won | 71.1 | 10.5 | 83 → 200 |
| careful rot_ape (sociable 48.3) | 100 | 48.4 | 200 → 413 |
| careful fight collectors (sociable the same) | 39.4 | 25.7 | 507 → 779 |
| careful:yukiOff tribute C4 won | 52.5 | 2.5 | 120 → 120 |
| careful:yukiOff rot_ape | 100 | 43.8 | 120 → 274 |
| careful:yukiOff collectors | 30.5 | 25.4 | 393 → 472 |
| completionist tribute C1 won | 17.2 | 22.8 | 180 → 180 |
| rusher rot_ape | 100 | 60.9 | 29 → 46 |
| sitter prologue C2 / C3 / C4 dead | 73.3 / 85.5 / 23.1 | 40 / 42.6 / 2.4 | 60 / 55 / 52 → 60 / 54 / 42 |
| sitter boar | 49.3 | 86.2 | 148 → 123 |
| sitter collectors | 77.9 | 55 | 77 → 109 |
| sitter jackals | 62.7 | 57.5 | 228 → 207 |
| gone: careful / sociable Act 1 C2 dead and taken | 0 | — | 117 |

(The lost rows mirror the won rows.) All from P25-A (the rot ape by realm, Act 1 two Coils longer), TP (the big blow's tell from the prologue on) and CT-C (Lu Han's read stance).

## MB: R0 against `tools/models-baseline.json` (saved 2026-11-22)
4 notes, all Careful's last nights: Mei Lin 32.5 → 1.5%, trio 19 → 46% (n 200); Yuki off: Mei Lin 27.5 → 4.2%, trio 19.2 → 39.2% (n 120). The other models' Mei Lin nights: 0.5–2.5% (the Sitter 15%).

**Traced (R2), Careful's last nights of 200:**

| Version | Prologue / Act 1 mean Coil | quiet | Mei Lin | Ya | trio |
|---|---|---|---|---|---|
| v0.11.254 | 2.54 / 2.54 | 49 | 65 | 48 | 38 |
| v0.11.255 (P25-A) | 2.54 / 4.50 | 54 | 4 | 35 | 107 |
| v0.11.265 | 2.29 / 4.41 | 53 | 3 | 35 | 109 |
| v0.11.266 (TP) | 3.90 / 4.96 | 72 | 3 | 36 | 89 |

It came with P25-A (Act 1 two Coils longer). The mechanism is not traced: open, options later.

## LG: the noise (R1 against R0)
349 numbers (231 with n ≥ 50); 15 moved past 5 points; 2 past 20, both under n 50 (sitter tribute C3 won / lost 38.7 → 73, n 31 → 37); 0 would flag under the guard rule (±20, n ≥ 50 both sides). Under R1 the 15 notes: completionist:yukiOff prologue C2 dead −8.4, crows +8.8; rusher mire +5.5; sitter prologue C2 / C3 dead −13.3 / −11.1, tribute C3 ±34.3, C4 ±7.7; farmer prologue C1 dead −17.5, tribute C1 ±7.4, boar +7.5, collectors −7.4, mire +6.1.

## TT: the owner's 2026-11-22 targets (R0 / R1)

| Target | Model | R0 | R1 | Verdict |
|---|---|---|---|---|
| T1 the whole game on Coil 1, 20–30% | Completionist | 20.5% | 19.5% | in / near |
| | Cultivator | 19.5% | 15.5% | near / near |
| T2 the whole game on Coil 1, none | Careful | 0% | 0% | in |
| | Sociable | 0% | 0% | in |
| T3 Act 1 mean Coil, 2.38 + 2 = 4.38 ± 0.75 | Careful | 4.96 | 4.97 | in |
| | Sociable | 4.97 | 4.98 | in |

Near: outside the band by no more than 2 × its standard error (Cultivator 19.5%: 2.8 points; 15.5%: 2.6). Not targets, for reference: Farmer 17.5 / 15%, Rusher 0 / 0%, Sitter 0 / 0%. **Finding (open, options later):** the Cultivator sits at or under the band's floor.

## KS: the time a re-save takes
The full check deletes its stats; `sanity.mjs --update` re-ran the tasks and story tests itself (887 + 363 s inside the full check of v0.11.267) and never the models (795 s), so the long file was never re-saved after 2026-11-22: v0.11.266 and v0.11.267 re-saved `baseline.json` only (LU).
