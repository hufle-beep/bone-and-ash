# Helper (PW1's PL): measure push 15, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p15w` without `.git`, never copy hooks back). The machine has 2 cores and other runs are going (the full check and a mutation run): keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p14-options.md` and `p14-measure.md` (the last push's options and how they were measured; copy their method, hooks and layout; p14's hook was rebuilt in the scratch copy as `tests/lib/p14hook.mjs` and `again.js` / `lines.js` notes, see §"How"), `project/research/p14-review-t.md` (its open items: forest 11's opener, forest 14 against old night 8, 3:5's wind against the hub's "hang dead still"), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.242 (in the working copy, not yet pushed) built P14-A + D1 + C-a + RV1: EVn-23 (`village_night`: weeks 2 and 3 on the long calendar six texts each, `QUIET_WEEK[2]` / `[3]`, keyed `village_night:2` / `:3`) and NF6 (`night`, the prologue's forest night: fifteen texts in its `byDay` list, was nine). Both past the rule of three for a non-social scene (the owner's pick, three times now). RV1 reworded forest 10, 11, 12, 14, 15 (no dusk: the forest has none), 2:5, 2:6, 3:5, 13, 14; the packet and the text lint draw all fifteen forest nights now. Bundle rule BN: 2–3 items a push, at most 2 Fable runs at once.

## Measure these, each a sub-item with its own numbers
- **The effect of v0.11.242:** `village_night` and `night` folded a game (p14: `village_night` 7.0 / 7.0 / 7.0 / 4.6, forecast EVn-23 −6.0 / −6.0 / −6.0 / −4.1; `night` VF 10.0 / 10.0 / 10.0 / 10.2, forecast NF6 −6.0 each), by story day and index and why; all folded screens a game (p14: 218.1 / 225.5 / 80.8 / 58.5); the plan's stops (p14: read 43 / 43 / 34 / 34); the paths against v0.11.241 (`git archive HEAD` copy).
- **SN7** (the seventh nights), **BH**, **BW**, **AH**, **SR3**, **TL2 / TL4**: re-measure.
- **The forest night's last fold** (nights 16–21 now read texts 1–6 folded; what three or six more would take: a rule change past fifteen).
- **What else folds most now** across the game (the top scenes by folded screens a game, with VF / SV / SD / memory), and the p14 open items (`morning` day 14, `herb_slopes` day 31).
- **The review's open text items** (forest 11's opener, forest 14 against old night 8, 3:5's wind): what each fix would take (lines, Fable runs), as sub-items.
- **LF, the burned loft:** re-check `loft_burned` at 0 games (both calendars). **FC, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check as p14 did.
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p14-measure.md describes (the old calendar without `--cal 7` where p14 used it).

## Write
- `project/research/p15-measure.md`: the raw numbers and how (as p14-measure.md).
- `project/research/p15-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes, any rule change named; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
