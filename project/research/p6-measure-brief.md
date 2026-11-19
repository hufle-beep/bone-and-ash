# Helper (PW1's PL): measure push 6, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p6w`, never copy hooks back). The machine has 2 cores and the full check plus two reviews are running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p5-options.md` and `p5-measure.md` (the last push's options and how they were measured; copy their method and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.232 (in the working copy, not yet pushed) built P5-B: V3b (the four scenes `fo_mei`, `fo_ya_time`, `supper_roof`, `bl_fireside` rr/ah in threes) and CW (two cooking lines in `supper` and `mei_walk`). Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Measure these (the open items of e left after push 5), each a sub-item with its own numbers
- **FC, the first flight:** p5-measure.md section 3 (re-check the hook, the save addition: one kept flag in `KEEP_FLAGS`, `migrate`'s gap).
- **SNr:** `ya_brawl`'s three older stomp texts (seen a game; words; tics).
- **LG:** the four guards with no new words (the cairn while someone is away; the climb to the pass only after Ya's door; the beetle's Ya +3 only when Ya is there; `BT_MEI.night`).
- **BYb-t:** the "Wen told you" Foundation paragraph.
- **ST2 degree 3:** the far wins' third texts at degree 3 (seen a game, both calendars).
- **The social talks** (`talk_mei`, `talk_ya`: folded a game) and **the evening's other folded screens** (`supper`, `mei_walk`, `village_night`: shown, folded, full reads a game, after v0.11.232).
- **CW past the cap of 6 for parts 1–3** (part 4's density for comparison; parts 5–9 if cheap).
- Re-measure V3b's four scenes after v0.11.232 (folded a game; new texts read), so the report can show its effect.
Method: `P5OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p5-measure.md describes.

## Write
- `project/research/p6-measure.md`: the raw numbers and how (as p5-measure.md).
- `project/research/p6-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
