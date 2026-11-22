# P23 — measured for the next push (on v0.11.252, 2026-11-22)

Repo only (rule 8). Scratch copies only; nothing in the game changed.

## 1. The tests on the long calendar

A scratch copy with `newGame`'s default calendar the long one (7), `node tests/tasks.test.mjs --bots-only` (1,000 games; 394 s with a
second job on the other core, 289 s for the old calendar alone): 1,228,549 passed, 12,436 failed. Each failure logged with its state.

| Kind | Count | Cause | Fault? |
|---|---|---|---|
| "familiarity grows" | 10,489 | the card started a week's work (a carry, unpaid); its familiarity comes when the work ends (`tasks.js` 526) | the test's expectation |
| "familiarity grows" | 4 | HP 0 mid-card: the Coil ended | the test's expectation |
| "familiarity grows" | 2 | "The day's meal and sit came first: no time left for this today" (skipped) | the test's expectation |
| "dry run = what happens" | 1,929 | a door card with the day's routine due: `taskOutcome` counts the meal and sit before the walk (v0.11.225, LO2 FD) and is right; `taskMinutes` counts the walk only | **yes**: the held card's tip (`main.js` `tipFor`, "Takes N, at once.") uses `taskMinutes`, so it shows e.g. 2 h where the card shows (and the run takes) 3 h |

The 1,929 by hub: ashfall 899, fo_ashfall 687, wild_explore 258, heart_hub 61, wilds 24. Every one a door card stopped at its scene;
`taskMinutes` = the dry run's walk in all 1,929 (deterministic: twice, and with the full copy, the same).

The rest of the suite with the default flipped (scratch):

| Test | Result | Cause |
|---|---|---|
| story (200 games) | 144 failures, then a crash at line 1712 (`yk_time`, "Choice not available") | 17 walks out of their 1,500 steps (10 "yk_sister_talk to the end of Act 1", 7 "full-hammerspace walk"); the rest hand-built states that set the clock as the old calendar's day |
| part: fallout | 1,001 of 3,001,842 | every run out of its 1,500 steps; at 15,000: 8,715,331 passed, 1 failed (`ya_lost` unreached) |
| part: blackroot, heart, return | 0 failed | |
| saves | 14 of 1,508 | FP1: the flip of old saves (they need old-calendar states) |
| rules | 4 of 15 | the XP awards (S6's ×0.7 on the long calendar) |
| faq, data, news | 0 failed | |
| browser parts 3, 4 | pass | |
| browser part 1 | stops at its first failures | tap 14: a greyed spaced card ("Sit with Yuki. every 3rd day, opens Day 5") read as a fault |
| browser part 2 | stops at its first failures | no "Skip to the next choice" in two again-scenes; no `wild_forage:2` card at the wilds on tap 2 |

Hand-built states in the tests (static count of `newGame(` / `fresh(` without `cal`): story about 269 (346, 77 long), tasks 350,
saves 12, FAQ 7, rules 3: about 640. The code's `longCal(` calls: 84 in 17 files. Old saves are flipped on load (`flipFill`), so the
old path stays needed for them (rule 7).

## 2. Act 1 under the retune (TS7)

The models, the long calendar (120 games each): Act 1 is cleared on the prologue's Coil by every model; Act 1 deaths 0, taken 0.
Act 1 endings (accord / revelation / victory): Careful 107 / 13 / 0, Sociable 111 / 9 / 0, Completionist 41 / 37 / 42, Cultivator
48 / 44 / 28. Key fights: the rot ape 100% (every model), the Elder 100% (when fought). Realm at Act 1's end 1 / 1 / 2 / 5.

Trials (40 games, a scratch copy with env knobs; Act 1 mean Coil, Act 1 deaths on its first Coil, the whole game on Coil 1):

| Trial | Careful | Completionist | Cultivator |
|---|---|---|---|
| as built | 2.38, 0%, 0% | 1.80, 0%, 20% | 1.68, 0%, 32.5% |
| parley DC 9 → 12, truth 8 → 11 | 2.45 (taken 10% on C2) | 1.80, 20% | — |
| parley 18, truth 16 | 2.58 (taken 28% on C2) | 1.82, 20% | — |
| the Elder +4.5 | — | 1.85 (taken 25% on C1), 15% | — |
| every Act 1 fight +3 | 2.38 | 1.80, 20% | — |
| every Act 1 fight +5 | 2.42 (rot ape 95%) | 2.10, C1 dead 87.5% (mire serpent 5, rot ape 1, root wyrm 1), 2.5% | 1.68, 32.5% |
| every Act 1 fight +8 | 3.10 (C2 dead 100%, rot ape) | 3.33, 0% | 1.68, 32.5% |
| the rot ape alone +6.5 | 3.05 (C2 dead 93%) | 1.95, C1 dead 50% (n 8), 10% | — |
| the rot ape alone +8 | 3.10 (C2 dead 100%) | 1.95, C1 dead 50% (n 8), 10% | 1.68, 32.5% |

No fight knob moves the Cultivator (realm 5 at Act 1's end): that is the realm pace (TS7's other half; the owner: "advancing realms
too quickly"), not trialled. Act 1 has no target since the owner's calls of 2026-11-22 (they set the prologue).

## 3. The Completionist under 20%, L2

400 games each: the Completionist's whole game on Coil 1 18.5% (tribute C1 won 20.3%, n 365), the Cultivator 29.3% (29.4%, n 398);
the standard error at 400 games about 2 points. P22's review L2 (the spread after the militia's floor of 6): the floor never binds on
the long calendar (0 of 484 tribute fights built, Careful / Completionist / Cultivator 40 games each).
