# Tuning notes (the retune's working doc)

New in v0.11.273 (owner pick P41-A, TN; roadmap-retune.md's tools line, after Selene's `playtest-notes.md`). How a tuning push runs, where the knobs are and what they are set to now, what is frozen, and where the logs are. The rules themselves: `CLAUDE.md` and `working-agreement.md` (RR, the freeze rule; CO, the order for checking numbers). The targets: `tools/targets.json`.

## The loop
1. **Measure** (allowed without asking): `node tests/models.test.mjs --model <m> --games N --off 0 [--seed S]` on a scratch copy when the change needs a switch; 100 games for Careful and the Sociable, 300 (seeds 0 and 1) for the Completionist and the Cultivator when a number sits near a target's edge (a 25% share has a standard error of about 4.3 points at 100 games, 2.5 at 300). `--kept --kept-clears N` for the second pass. The numbers go to `project/research/pNN-measure.md`.
2. **Options** (CLAUDE.md rule 1): each sub-item with its numbers, the options colour-marked by what was measured, the recommended one named; the options doc in the claude.ai project (`claude/pNN-options.md`).
3. **Pick** = the go for one push.
4. **Build**, then the story and tools tests and `bash tools/check.sh quick` while building.
5. **Review** (rule 9) when game logic, balance or story text changed, then its fixes.
6. **Full check** once (`bash tools/check.sh`): the sanity check's drift (±20 points; past 5 a log-only NOTE), the TARGET lines, the FROZEN lines.
7. **Baselines** re-saved with `node tools/sanity.mjs --update --last` when the pick was an intended number change (the owner saw the numbers before picking).
8. **Docs, push, mirror**, then stop and wait.

## The order for checking a number (CO)
The design rule first (the owner's words; `reference.md`'s rules as implemented), then `js/core/formulas.js` (Rules Engine C, with the game's deliberate forks: `working-agreement.md`), then what the game does (tests, bots, sanity). The earlier one wins unless the owner says otherwise; a disagreement is reported with its numbers.

## The targets now (owner 2026-11-22; `tools/targets.json`)
| Target | Models | Band | Now (v0.11.272, seed 0 + 1) |
|---|---|---|---|
| T1 the whole game on Coil 1 | the Completionist, the Cultivator | 20–30% | 19.0% (near), 25.0% (300 games each) |
| T2 the whole game on Coil 1 | Careful, the Sociable | 0% | 0%, 0% |
| T3 Act 1 cleared, mean Coil | Careful, the Sociable | 4.38 ± 0.75 | 4.96, 4.96 (100 games each) |

## The knobs by section (values as of v0.11.272)
- **Whole game, pace:** `js/core/game.js` `XP_RATE` 0.6 (v0.11.85), `COIL_GROWTH` 0.25 (the Coil bonus a Coil), `LONG_XP` 0.7, `LONG_SAT_DIV` 4 (`LONG_SAT_HIGH` 6 from True Core, `LONG_SAT_FROM` 3, P26-A), `LONG_MER_MULT` 4, `LONG_SIT_MIN` 0.1, `FAIL_XP_FRACTION` 0.25 (`formulas.js`); `js/core/coil.js` `HEAD_START` 0.25, `KEPT_EXTRA_FROM` 7.
- **Fights, every section:** `js/story/act1_tune.js` `TUNE` (per encounter: DC and attack +t, HP +10%·t), `TUNE_LOW` below `LOW_REALM` 2 (the rot ape 11, P25-A); `js/story/fight_tune.js` `HP_TUNE` (per encounter HP factor), `HP_TUNE_HIGH` from `HIGH_REALM` 2 (the collectors 0.7, P39-A); `js/core/game.js` `NO_DICE_DC_SHIFT` 2, `NO_DICE_ROUND_CAP` 30, `BEAST_UP` 0.5, `QI_SHIELD_PER_TIER` 3, `NIGHT_FIGHT_HEAL` 0.5.
- **The prologue:** the tribute (P21-E: the practice against Lu Han every 35 rounds, the tribute remembered +1.5 a meeting up to +4.5, +0.5 on defence on the long calendar, P22-A); the collectors' `HP_TUNE` 0.8 / `HP_TUNE_HIGH` 0.7.
- **Act 1 (the Blackroot, the Heart, the Fallout):** `TUNE` / `TUNE_LOW` / `HP_TUNE` by encounter id; the calendar's spans (`js/core/calendar.js` `LONG_CAL` 7, `BL_SPAN` 3).
- **Hunger and rest:** `SATIETY_PER_HOUR` 3, `HUNGRY_AT` 30, `STARVE_HP_PER_HOUR` 1.5, `ROUTINE_FED` 85 (`tasks.js`).
- **Tasks:** `js/core/tasks.js` `DC_SHIFT` 2, `NEW_LENGTH` 2, `QI_MINUTES` 60; the default times of choices with none (`story.js` `DEFAULT_MINUTES`: talk 10, move 20, act 30; the times lint below).
- **The bots (not the game; they decide what the numbers mean):** `tests/models.test.mjs` (`MED_PLAN`, the plans with no daily doors since v0.11.210; BD measured and not taken, v0.11.273), `tests/lib/forced.mjs`, `tests/lib/spare.mjs`.

## Frozen sections
None yet. A section is frozen only on the owner's word, with one key number (`tools/targets.json` `frozen`, RR); its FROZEN line then fails the check when the number leaves its band.

## The log-only tools
- `tools/sanity.mjs`: TARGET lines (v0.11.268), FROZEN lines (v0.11.273).
- `tests/models.test.mjs`: the hungry line (HN1), skillWatch (SW, v0.11.273: a skill that moved in a step with no XP line; 0 in plain runs; `liftKept`'s kept-realm XP shows no line but falls on a Coil's restart, which the watch leaves out), `--kept` / `--kept-clears`.
- `node tools/timelint.mjs [--list]` (TL, v0.11.273): the choices on the default time against Rules Engine C's times per activity (v0.11.273: 855 choices, 202 linted, 30 off the engine's time; most are sleeps and talks). Applying them is a balance change of its own.

## The logs
`project/research/p21-*` … `p41-measure.md` (one per push's measuring), `claude/pNN-options.md` in the claude.ai project, `project/history-*.md` (the decisions), `tools/models-baseline.json` and `tools/baseline*.json` (the numbers the check compares with).

## Afterwards
A "tuned up to" note for players when the retune ends (roadmap-retune.md, TU).
