# Helper (PW1's PL): measure push 7, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p7w`, never copy hooks back). The machine has 2 cores and the full check plus two reviews are running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p6-options.md` and `p6-measure.md` (the last push's options and how they were measured, including its hook `tests/lib/p6hook.mjs` if it is still in `/tmp/p6w`; copy their method and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.233 (in the working copy, not yet pushed) built P6-A: TK (the journey talks `talk_mei`, `talk_ya` past the five beats a cycle of six: the quiet walk, the two old settled texts, three new at beats 8–10; Mei Lin's fourth with a Ya-away version) and CWx (two cooking lines: `village_night`'s third quiet text; the prologue `camp`'s second night with the fire lit, Yuki by form). Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Measure these (the open items of e left after push 6), each a sub-item with its own numbers
- **TK's effect:** both talks shown, folded, read in full a game, new texts read (forecast: folded about 0 / 10 / 4.5 / 5).
- **CWx's effect:** CW lines seen a game in parts 1–3 (5.2 / 5.2 / 5.0 / 3.9 before; forecast about 7 / 7 / 7 / 6).
- **FC, SNr, LG, BYb-t, ST2 degree 3:** re-check p6-measure.md's numbers on this code (they should not have moved; say so if they did). FC's hook, its save addition (one kept flag in `KEEP_FLAGS`, `migrate`'s gap closed by `g.seen.breakthrough`).
- **The small leftovers from v0.11.232's reviews** (the handover's open items): the roof's lines to the loft after the arson (T L3), the firesides' meal when nobody cooked (T L6), the text lint's samples (C TG-C1: which new texts it does not read; does it read the talks' new texts?), an old save mid-week (C L2), task mode's "back tomorrow" on a card hidden for an absence (v0.11.231 C L4), a menu opened before 19:00 offering her card after it (C L3), `packet.mjs` blind to the away state (C L6). For each: how often a game it shows (or 0), and the scope of a fix in words.
- **The roof's later nights** past three texts (the long calendar's roof nights), the hare's CW line, CW in part 8: seen a game, or 0.
Method: `P7OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p6-measure.md describes (and the old calendar without `--cal 7` only where an item needs it).

## Write
- `project/research/p7-measure.md`: the raw numbers and how (as p6-measure.md).
- `project/research/p7-options.md`: the full layout (a "Done in v0.11.233, its effect" section first; every sub-item with its numbers, scope in words and Fable runs, balance and save changes; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
