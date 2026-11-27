# P54 measure: G4, the threads (v0.11.285 → v0.11.286)

## Before the options (2026-11-27 ~07:30, v0.11.285, scratch copy; 62 games each, the long calendar)

Instrumented `runTask` (a scratch copy only): the hours a game by card kind and by the card's familiarity tier at the run.

| | Careful | Completionist | Cultivator |
|---|---|---|---|
| work + chores, hours a game | 3,531 | 1,778 | 1,838 |
| of it at Practised or better | 71% | 51% | 57% |
| the week's carried work ("Go on") | 3,081 | 2,477 | 2,401 |
| cards at New / Practised / Skilled / Mastered at the end | 9 / 14 / 24 / 17 of 64 | 18 / 11 / 21 / 11 of 61 | 22 / 14 / 18 / 13 of 67 |
| Coil at the crossing / at the end | 3.95 / ~5 | 1.89 / 1.89 | 1.69 / 1.69 |

By card class (hours a game, Careful / Completionist / Cultivator): the daily Forage and Hunt cards 585 / 354 / 372; the Practice cards 427 / 232 / 244; Smoke the catch 1,081 / 420 / 429; the village's week work 1,173 / 586 / 435.

**The stop (P54 stop, ~08:20):** every Forage, Hunt and Practice card is once a day (`show: daily(…)`; on the long calendar once every 3 days with 3 days' haul), so a lane can't repeat them; the options' "4–5 runs a day" was wrong. Picked TQ-A (a thread takes the card's one run of the day off James: the same items and XP).

**The cards a thread may hold (TQ-A, EL-f):** 22 ids: the Wilds' Forage 4 and Hunt 3, the Long Forest's Forage 3 and Hunt 2, the Blackroot camps' Forage 2 each (with a check and items), Smoke the catch on the Wilds, Ashfall, the Fallout's Ashfall and the Heart's camp. Not: the Practice cards, Yuki's own hunt (no check), the frogging (no items), the grub and the beetle (no check).

## The balance stop (2026-11-27, the build; the kept pass, `--kept`, 20 games each, the long calendar)

The first pass has no threads (none before a won rewind), so the first pass's numbers (T1–T3, the drift baseline) don't move. The second pass after a won Act 1 (`models-kept`), with the models' threads on and off (`--no-threads`):

| | thread runs a game | cards James ran | realm at Act 1's end | deaths, Coils | Cultivator's sits a game |
|---|---|---|---|---|---|
| Careful | 45.8 | 3,341 → 2,798 (−16%) | 1.00 → 1.00 | none, Coil 1 both | — |
| Sociable | 48.5 | 4,078 → 3,526 (−14%) | 1.00 → 1.05 | none, Coil 1 both | — |
| Completionist | 36.4 | 6,586 → 6,490 (−1%) | 2.00 → 2.10 | none, Coil 1 both | — |
| Cultivator | 35.7 | 16,899 → 17,496 (+4%) | 5.10 → 5.15 | none, Coil 1 both | 53.5 → 57.7 h |

The Completionist's idle hours (nothing fresh before evening): 14.7 → 19.4 a game. Days unchanged (the tribute Day 43, Act 1's end Day 103).
