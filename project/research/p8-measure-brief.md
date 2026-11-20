# Helper (PW1's PL): measure push 8, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p8w`, never copy hooks back). The machine has 2 cores and the full check plus two reviews are running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p7-options.md` and `p7-measure.md` (the last push's options and how they were measured; copy their method and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.234 (in the working copy, not yet pushed) built P7-A: RN (the roof's later nights `supper_roof:2` a cycle of six), ML (the firesides' meal lines on a day he did not cook, `cookedToday`), TL (task mode hides a card hidden for her absence). Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Measure these, each a sub-item with its own numbers
- The effect of v0.11.234: the roof's later nights folded a game (forecast 6.1 / 6.1 / 0 / 3.7), new texts read; ML's no-cook screens (as p7); TL's "back tomorrow" for an absent woman (forecast 0).
- **FC, the first flight** (re-check the hook and the save addition as p7).
- **TG, the text lint's samples:** which new texts of v0.11.232–234 the lint still never reads (the roof's texts 5–6, the no-cook lines, the rest p7 counted), and `packet.mjs`'s away states.
- **LF, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check (both calendars where p7 did).
- **The talks' quiet walk and old settled texts** on the Sociable's second cycle (folded a game), and **the evening's folded screens** (`supper`, `mei_walk`, `village_night`).
- Anything else on a no-cook evening that still says he cooked (the camp's lines, the eat lines), if cheap: shown a game.
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p7-measure.md describes (the old calendar without `--cal 7` where p7 used it).

## Write
- `project/research/p8-measure.md`: the raw numbers and how (as p7-measure.md).
- `project/research/p8-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
