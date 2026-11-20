# Helper (PW1's PL): measure push 13, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p13w` without `.git`, never copy hooks back). The machine has 2 cores and other runs are going: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p12-options.md` and `p12-measure.md` (the last push's options and how they were measured; copy their method, hooks and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.239 (in the working copy, not yet pushed) built P12-A + D1 + RV1: FS6 (`fo_supper`: on the long calendar story day 8's week six texts, the old three then `FS8`; story day 9's six, the old three then `FS9`, with Ya and an `away` line without her; story day 10 goes on with day 9's sequence; the old calendar its one text a story day) and RC (`tools/packet.mjs --check`: runs against the text lint's renders, inside a scene, between one scene's drafts). The owner ruled the Fallout supper the social supper (six for the social exception: the roof's later nights, the journey talks, the supper, the sunset walk, now the Fallout supper); the rule of three stands for non-social scenes, past which the owner has picked twice (the camp's nights, the first week's quiet nights). Bundle rule BN: 2–3 items a push, at most 2 Fable runs at once.

## Measure these, each a sub-item with its own numbers
- **The effect of v0.11.239:** `fo_supper` folded a game (p12: VF 14.0 each; forecast FS6 −6.0 each), by story day and index and why; all folded screens a game; the plan's stops a game (p12: read 43 / 43 / 34 / 34).
- **SPw3** (the village supper's week 3 its own six; p12: −6.0 / −6.0 / −6.0 / about −5.5): re-measure.
- **EVn-23** (the quiet nights' weeks 2 and 3 six each; a rule change): re-measure.
- **TL2 / TL4** (the talks' beats 11–12 or 11–14; past six for a social scene): re-measure.
- **BH** (the Blackroot's hunts' lead-ins: `dw_hunt` one text, `rr_hunt` two) and **NF** (the forest night `night`, nine texts): re-measure.
- **What else folds most now** across the game (the top scenes by folded screens a game, with VF / SV / SD / memory), so the options cover the biggest folds left; the Fallout supper's story day 10 (its sequence's 7th–13th nights).
- **LF, the burned loft:** re-check that `loft_burned` stays at 0 games (both calendars).
- **FC, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check as p12 did.
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p12-measure.md describes (the old calendar without `--cal 7` where p12 used it).

## Write
- `project/research/p13-measure.md`: the raw numbers and how (as p12-measure.md).
- `project/research/p13-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes, any rule change named; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
