# Helper (PW1's PL): measure push 9, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p9w`, never copy hooks back). The machine has 2 cores and the full check is running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p8-options.md` and `p8-measure.md` (the last push's options and how they were measured; copy their method and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.235 (in the working copy, not yet pushed) built P8-A: EVs (`supper:4`, `supper:5` a cycle of six), EVw (`mei_walk:5`, `mei_walk:6` a cycle of six; the owner's six-text social exception now covers both), TG (the text lint samples the village weeks on each day of the cycles in three forms and story days 9–10; `tools/packet.mjs` `STATES`), and RV1 (the reviews' text fixes, the packet's away states by day, tests). Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Measure these, each a sub-item with its own numbers
- The effect of v0.11.235: `supper` and `mei_walk` folded a game (were 50.8 / 50.8 / 18 / 14.8 and 30.4 / 30.4 / 7.2 / 0.9; forecast −7.2 / −7.2 / −6.0 / −5.3 and −4.7 / −4.7 / −4.5 / −0.9), new texts read.
- **EVn** (`village_night`'s quiet nights; not social, the rule of three stands unless the owner changes it): folded a game and the forecast of a cycle of six, as p8.
- **QW, the talks' quiet walk** on the second cycle (as p8).
- **`bl_camp`'s folds** (13.6 / 12.9 / 20.8 / 20.3 a game in p8; a one-text scene by region, redrawn after each action): which screens fold, why (the same text redrawn after an action, or a new day), and what a fix would be (scope in words, Fable runs).
- **"Your world" (v0.11.235 review T L7):** the walk's new texts say "your world" (`mei_walk:5`'s fourth, `mei_walk:6`'s fourth). How many games reach those texts without having had the roof's first night (`supper_roof` on village week 1, "the wrong stars", "Tell me about the trees") or any other scene where Mei Lin hears he is from another world (grep for it): a game, per model.
- **The packet's size for Fable (v0.11.235 RV1, C L1/M2):** `node tools/packet.mjs <id> --games 0` sizes for `supper`, `mei_walk`, `fo_mei`, `bl_fireside`, `bl_morning` now; v0.11.234's were 7.8, 1.3, 3.1 KB for the first three.
- **FC, LF, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check (both calendars where p8 did).
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p8-measure.md describes (the old calendar without `--cal 7` where p8 used it).

## Write
- `project/research/p9-measure.md`: the raw numbers and how (as p8-measure.md).
- `project/research/p9-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
