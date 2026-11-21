# Helper (PW1's PL): measure push 14, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p14w` without `.git`, never copy hooks back). The machine has 2 cores and other runs are going (the full check and a mutation run): keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p13-options.md` and `p13-measure.md` (the last push's options and how they were measured; copy their method, hooks and layout; p13's hook was rebuilt in the scratch copy as `tests/lib/p13hook.mjs` and `again.js` / `lines.js` notes, see §"How"), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.241 (in the working copy, not yet pushed) built P13-A (WK-d) + D1 + RV1: FS10 (`fo_supper`: on the long calendar story day 10's week its own six, `FS10`, keyed `fo_supper:10` by the text's story day, `textStoryDay`; with Ya and an `away` line without her; the old calendar unchanged) and SPw3 (`supper`: the village's week 3, `vday >= 3`, its own six, `SW3`, keyed `supper:6`; week 2 keeps `supper:5`). Six a story day for the social suppers (no rule change); the rule of three stands for non-social scenes, past which the owner has picked twice. Bundle rule BN: 2–3 items a push, at most 2 Fable runs at once.

## Measure these, each a sub-item with its own numbers
- **The effect of v0.11.241:** `fo_supper` and `supper` folded a game (p13: `fo_supper` VF 8.0 each, forecast FS10 −6.0 each; `supper` VF 8.4 / 8.4 / 8.0 / 7.5, forecast SPw3 −6.0 each), by story day and index and why; all folded screens a game (p13: 230.1 / 237.5 / 92.8 / 70.7); the plan's stops (p13: read 43 / 43 / 34 / 34); the paths against v0.11.240 (`git archive HEAD` copy).
- **EVn-23** (the quiet nights' weeks 2 and 3 six each; a rule change), **TL2 / TL4**, **BH**, **NF** (the forest night, the biggest VF fold in p13): re-measure.
- **The seventh nights past six** (the Fallout supper's days 49 and 56, the village supper's days 27 and 34, the quiet night's week-1 night 7): what they fold and what a fix would take.
- **`supper_roof`'s later nights** (the Cultivator 4.9 in p13), **`ah_hunt`'s third text**, **the Blackroot's fight-win texts** (`ah_hawks_won`, `rr_elk_won`, `dw_serpent_won`): re-measure.
- **What else folds most now** across the game (the top scenes by folded screens a game, with VF / SV / SD / memory).
- **LF, the burned loft:** re-check `loft_burned` at 0 games (both calendars). **FC, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check as p13 did.
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p13-measure.md describes (the old calendar without `--cal 7` where p13 used it).

## Write
- `project/research/p14-measure.md`: the raw numbers and how (as p13-measure.md).
- `project/research/p14-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes, any rule change named; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
