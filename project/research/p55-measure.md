# P55 measure: G5's first push, Insights, the Coil marks and the Archive (v0.11.286)

Measured 2026-11-27 ~15:45–16:30 from v0.11.286 (3d802ff) on a scratch copy (`/tmp/s`); nothing in the game changed. The long calendar, the first pass, `--off 0`.

## Scratch switches (scratch copy only)

- `MKSTEP`: Fed drain × (1 − MKSTEP × the arcs ever finished), the arcs as `threads.js` `ARC_AT` and `REGION_DONE` read them, but kept from the game's start (`stats.__mk`), not only after a won Act 1. Applied in `advance` (awake), `nightTo` and `sleepUntil` (asleep, half rate as now).
- `INSLOG`: on every scene entry (`enterHook`), the first time each candidate flag is set in a game, with the Coil. Deduped by a game id kept in `stats`, so the plan's look-ahead clones (week.js) don't count twice; a flag the look-ahead reached counts as found (the bot then plays that plan).
- `DMLOG`: awake minutes and minutes × the drain factor, written at `a1_end`.

## Coil marks (100 games Careful and the Sociable, 200 the Completionist and the Cultivator)

| | T1 / T3 now | −5% a mark (up to −45%) | awake Fed drained, −5% | −3% a mark (up to −27%), 62 games |
|---|---|---|---|---|
| Careful | T3 4.95 | T3 4.98 | 3,255 h → 2,792 h (−14.2%) | −8.5% |
| Sociable | T3 4.97 | T3 4.99 | (as Careful) | — |
| Completionist | T1 22.5% | T1 23.0% | 1,612 h → 1,423 h (−11.7%) | −7.1% |
| Cultivator | T1 33% | T1 34% | 1,665 h → 1,477 h (−11.3%) | — |

Deaths: unchanged (Careful and the Sociable 0% in the prologue, the Act 1 Coils as now; the Completionist's Coil 1 prologue 10% both; the Cultivator's 0.5% both). Days unchanged (the tribute Day 43, Act 1's end Day 103). Careful's "under Fed 30 with food on a story screen with no Eat card": 0.4 a game → 0. All moves within the noise of these game counts.

## Insights: the flags today (deduped; % of games found in the first pass, and on Coil 1)

| design.md's Insight | flag | Careful (62) | Completionist (102) | Cultivator (102) |
|---|---|---|---|---|
| (the Coil screen's) the tribute | `lore1` | 96.8% (Coil 1 67.7%) | 88.2% (52.0%) | 82.4% (59.8%) |
| Saw the lights | `saw_lights` | 75.8% (30.6%) | 45.1% (24.5%) | 43.1% (25.5%) |
| Realms lore | `lore_realms` | 0 | 100% (86.3%) | 100% (99.0%) |
| Tree lore | `lore_tree` | 0 | 100% (86.3%) | 100% (94.1%) |
| Roots | `roots` | 0 | 92.2% (59.8%) | 86.3% (54.9%) |
| Bone song | `bone_sung` | 0 | 95.1% (66.7%) | 86.3% (63.7%) |
| Ghost-gill | `gills` | 0 | 93.1% (63.7%) | 94.1% (68.6%) |
| (the Coil screen's) the bracket fungus | `fungus` | 0 | 94.1% (71.6%) | 85.3% (65.7%) |
| Ya's tracks | `bl_tracker` | 100% (0) | 100% (19.6%) | 100% (31.4%) |
| Hearth lore | `told_hearth` | 12.9% (0) | 5.9% (0) | 11.8% (0) |
| The founder's crime | `log_heard` | 100% (0) | 100% (19.6%) | 100% (31.4%) |
| (the Coil screen's) the seed-ship | `ship_found` | 100% (0) | 100% (19.6%) | 100% (31.4%) |
| The singing grove | `grove` | 100% (0) | 100% (19.6%) | 100% (31.4%) |
| Root memory, Wyrm lore, Drowned rites, Cinder lore | none | — | — | — |

Careful never takes the doors, so the Wilds' finds stay at 0. Insights found a game (of the 13 with a flag): Careful about 5.9, the Completionist about 11.2, the Cultivator about 10.9. `lore.md` has no section for the wyrm, the drowned rites or the cinder.

## The Archive's data

- **Foes met** (`stats.foes`, kept since v0.11.x): 29 distinct fights met by the Completionist in 40 games, 10 by Careful (rt_wolves, night_hawks, night_drowned, lizard, rot_ape, night_wolves, collectors, drowned, night_serpent, gao).
- **Endings:** the tribute's (won by fight, bluff, hairpin or pay; lost) and Act 1's (accord, revelation, victory, taken): about 9; no record of which were seen today.
- **The tab bar:** 6 buttons (Story, James, Hammerspace, Journal, FAQ, ☰ Menu).
