# Helper (PW1's PL): measure push 10, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p10w`, never copy hooks back). The machine has 2 cores and the full check and two reviews are running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p9-options.md` and `p9-measure.md` (the last push's options and how they were measured; copy their method, hooks and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.236 (in the working copy, not yet pushed) built P9-A + D1: CB3 (`bl_camp`'s Root Road and Ashen Hills three texts each, `BL_RR_CAMP` / `BL_AH_CAMP` by `bl_camp:<region>`, as `BL_DW_CAMP`), QW (`talk_mei` / `talk_ya` beats 5 + 6k a new quiet walk of their own; beat 2 keeps the old), YW (the two walks' "your world" reworded). The rule of three stands for non-social scenes (six for the owner's social exception: the roof's later nights, the journey talks, the supper, the sunset walk). Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Measure these, each a sub-item with its own numbers
- **The effect of v0.11.236:** `bl_camp` folded a game (was 13.6 / 12.9 / 20.8 / 20.3; forecast −6.5 / −5.9 / −5.8 / −5.9) and its why (VF new day, redraws after an action, SD); the talks' beats 5 and 11 (were 0 / 3.9 / 4 / 4 folded; forecast −0 / −1.9 / −2 / −2); new texts read in full.
- **CB5 now:** what is left of the camp's folds (nights 4–5 on the Root Road and the Ashen Hills, the Drowned Wood's 4th), and what each fix would change (scope in words, Fable runs; a fourth and fifth text per region is a rule change past three for a non-social scene: say so).
- **The camp's hammerspace line (p9's open item):** the food line sits in the folded part of a folded camp screen (`foldParts` keeps paragraph 1; `pantry(g)` is paragraph 2): how many screens a game, whether the bar or another screen shows the stock, and what a fix would be (in words; code only, no Fable). And the camp redraws where only that line changed (2.3 / 2.2 / 4.0 / 3.2 a game in p9).
- **EVn** (`village_night`'s quiet nights; not social, three stands unless the owner changes it): as p9, and **the quiet nights' second and third weeks** (index 6–18, all fold; p9's open item): numbers and what a fix within three would be, if any.
- **PKf** (a day filter for `tools/packet.mjs`; tools only): the packets' sizes for the next runs' scenes.
- **FC, LF, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check (both calendars where p9 did).
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p9-measure.md describes (the old calendar without `--cal 7` where p9 used it).

## Write
- `project/research/p10-measure.md`: the raw numbers and how (as p9-measure.md).
- `project/research/p10-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes, any rule change named; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
