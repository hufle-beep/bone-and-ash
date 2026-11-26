# P46 measure: 5b, the polish pass (2026-11-26, on v0.11.277, 7a1492c)

Scratch copies only (`/tmp/s46`, `/tmp/s46b`: counters in `week.js` `foldNight` / `weekEveAgain` and in the models test's step and fight loops). 100 games a model, seed 0, `--off 0`, the long calendar. Nothing here is in the game.

## YM-3, Ya's manners (the Fallout supper, story day 9's week)
| Model | Coils reaching it | pair shown | the same pair again (same Coil) | "As before" (YM-f) |
|---|---|---|---|---|
| Careful | 206 | 412 | 206 | 1,236 |
| the Sociable | 209 | 476 | 267 | 1,254 |
| the Completionist | 100 | 200 | 100 | 600 |
| the Cultivator | 100 | 200 | 100 | 600 |
| Random (no plan) | 67 | 469 | 402 | 0 |
| the Rusher | 15 | 31 | 16 | 90 |
With three pairs in turn (YM-3): Careful's repeats 2.06 → 0 a game, the Sociable's 2.67 → about 0, Random's 4.02 → about 2.7 (7 a Coil).

## FC-w, Ashfall sees the first flight (where `first_flight` happens, `ffPlace`)
Careful 100 village · the Completionist 100 village · the Sociable 100 village · the Cultivator 100 alone · Random 72 village, 7 alone (21 never) · the Rusher none. 472 of 579 first flights (82%) are in Ashfall, out of sight (FC-o).

## NF-g, the night fold's earlier-day rule for the other six fold scenes
Fold stops that NF-g would walk (one plain way on; the text shown on an earlier day of the Coil, or read on an earlier Coil), per 100 games:
- Careful: `village_night` 1,241, `morning` 719, `fo_night` 402, `fo_morning` 318 → **26.8 a game**
- the Sociable: 1,241 / 719 / 420 / 327 → **27.1**
- the Completionist: `village_night` 345, `morning` 143 → **4.9**
- the Cultivator: 151 / 122 → **2.7**
- Random: `morning` 592, `village_night` 491, `fo_*` 36, `heart_*` 3 → **11.2**
- the Rusher: `morning` 937, `village_night` 135, `fo_*` 21 → **10.9**
`heart_night` / `heart_morning`: 0–3 in every model.

## L3, the read round's hold line (rounds where Say something's hold line shows "A speech is coming")
| Model | read rounds | 2+ foes posturing | of them |
|---|---|---|---|
| Careful | 1,227 | 65 | collectors 9, Gao 56 |
| the Completionist | 1,014 | 805 | collectors 688, arson 92, Gao 25 |
| the Rusher | 761 | 634 | Gao 307, collectors 239, arson 88 (56 with three) |

## PK, the packet's size (`node tools/packet.mjs <scene> --games 0`)
- `night` 94.7 KB (96.4 with the bot run; 67 KB at p15): 122 state blocks 91.8 KB, the rest 4.6 KB. One night's six states (forms × fire): night 1 1.8 KB, 5 4.9, 12 4.2, 17 4.5, 21 7.7 → **a one-night packet 6–12 KB**.
- `fo_supper` 31.4 KB → story day 9 alone 11.2, day 8 15.6, day 10 11.0.
- `village_night` 36.7 KB → week 1 10.9, week 2 13.5, week 3 17.1 (`--week` does this already, v0.11.238).
- `supper` 34.6, `village_morning` 16.6, `first_flight` 3.9, `heart_night` 1.4 KB.

## LT, a demonstrative with no antecedent in its form
311 `byForm(g, …)` calls in `js/story`, 298 with literal branches. "those / these + noun": 8, **0** with the noun only in another branch (the v0.11.246 L8 line, "six of those feet", is gone). "this one / that one": 6, all anchored in their own branch (read by hand: `act1_blackroot.js` 126 ×2, 1024, 1348; `act1_heart.js` 697; `prologue.js` 881). A rule flags 0 today; it guards new drafts (`:y:<form>` keys in `--check`).

## TC, the owner's calls (lines in the game; `lore.md`)
- Gao Feng as Lu Han's cousin: 1 line (`ashfall.js` 671); not in `lore.md`.
- "Four hundred pounds" (the great root-kin): 1 line (`wilds.js` 165); the cat's "eleven pounds" 8 lines; neither in `lore.md`.
- The arson's 01:00: James polishing his glasses, 1 line (`stomp_prologue.js` 214).
- The watcher's ledger noting Ya on Day 8 (`fo_spy`): kept in v0.11.170.
- Foundation named early in the prologue (v0.11.167 review L9).

## PN, the polish notes (`roadmap-e.md`, 23 entries)
- 11 marked by their own review as accepted, kept or log only: v0.11.234 L6; v0.11.236 L3, C L3; v0.11.237 L1; v0.11.238 L4, L5, M2; v0.11.239 L2; v0.11.246 L7, C L3, the lint samples.
- 1 already closed (v0.11.260): `--kept` on the old calendar.
- 11 text candidates (a read first): v0.11.233 L1, L2, L4; v0.11.234 L5; v0.11.236 L5; v0.11.237 L5, L7; v0.11.243 L3, L4, L5, L7.

## RV-A, the build's stop (after the Opus cold review; the P46-A build, a scratch copy with counters in `foldNight`)
Walks by the earlier-day / earlier-Coil fold, per 100 games, that the review's fixes stop:
- H1 (a romance beat on screen, `fo_night`): Careful 3, the Sociable 6, the others 0.
- M1 (a way into a story scene): `fo_morning` → `ya_arrives` and `fo_night` → `fo_wolf`: Careful 104 + 104, the Sociable 104 + 104, Random 9 + 9, the Rusher 1 + 1; the village morning 0 in every model.
Stops a game after RV-A (first order): Careful about −24.7, the Sociable about −25.0, Random about −11.0, the Rusher −10.9, the Completionist −4.9, the Cultivator −2.7.
