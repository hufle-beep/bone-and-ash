# Helper A: measure push 16 (BB's first bundle, the Blackroot and the forest): the bot numbers

You measure only; you change nothing in `/home/claude/bone-and-ash` except writing `project/research/p16-measure-a.md`. Hooks go in a scratch copy only: `rsync -a --exclude .git /home/claude/bone-and-ash/ /tmp/p16w/` and work there; never copy hooks back. The machine has 2 cores and another helper is reading text (light): run the model tests one at a time. Read excerpts only (grep, line ranges), never whole story files.

Read first: `project/research/p15-measure.md` and `p14-measure.md` (method, hooks, layout: the `P14OUT` / `P15OUT` text hook was a scratch-only change to `tests/models.test.mjs` / `js/core/again.js` notes; rebuild it the same way), `project/research/p15-options.md`, `p10-measure.md` (FC, LG, BYb-t lines), `p7-measure.md` (the hare's CW line).

## State
v0.11.245 on `main` (the game = v0.11.243's: P15-B built SN7, MW, HS, RT). Nothing measured on it yet. Bundle rule now BB: a push takes every measured item of one area; up to 6 Fable runs at once.

## Measure each, on the long calendar (`--cal 7`) and the old one, Careful / Sociable / Completionist / Cultivator, 10 games each
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (and without `--cal 7`), once each, with the hook.
1. **v0.11.243's effect** against p15's figures: all folded screens a game (p15 after v0.11.242: 206.1 / 213.5 / 68.8 / 48.4; forecast P15-B −6.3 / −6.3 / −6.8 / −5.8), the plan's stops (read 43 / 43 / 34 / 34), the path check against v0.11.242 (`git -C /home/claude/bone-and-ash show` / a `git archive` of the previous tag or commit if available in the shallow clone; if the commit is not there, say so and skip).
2. **BH** (`dw_hunt` days 71–72, `rr_hunt` index 2–3), **BW** (`ah_hawks_won`, `rr_elk_won`, `dw_serpent_won` repeats), **AH** (`ah_hunt` index 2–5): folded a game each, by index; texts needed, words, Fable runs (a run about 3–4 texts).
3. **NF4** (`night`, the prologue's forest night, 15 texts): 3 / 4 / 6 more, each its fold a game (p15: 12.0 / 16.2 / 16.2 + the two near-repeats).
4. **ST2 degree 3** (`far_won` degree 3), **the hare's CW line** (long and old), **FC** (first Foundation: when, Coil, `BT_CLOSER` a game, Coil starts at realm 0 after the first Foundation), **BYb-t** (Foundation screens: `lore1` / Wen only / neither), **KA (b)** (a kept realm's later passes: how many Coil passes a game start at Foundation or above and so never see the Foundation closer and its first-flight line; by player, both calendars).
5. **What else folds most now** in the Blackroot (Act 1's regions: Root Road, Ashen Hills, Drowned Wood) and the prologue's forest: the top scenes by folded screens a game (VF / SV / SD / memory), as p15 §4, marked by area (forest / Blackroot / village / Fallout).

## Write
`project/research/p16-measure-a.md`: raw numbers and how, as p15-measure.md, under about 8 KB, every figure "Careful / Sociable / Completionist / Cultivator", each item with: folds a game, texts, words, Fable runs, rule change (past three for a non-social scene, past six for a social one, past fifteen for the forest night), balance 0 / save 0 or what changes. Reply with a 6-line summary.
