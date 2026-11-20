# Helper (PW1's PL): measure push 11, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p11w` without `.git`, never copy hooks back). The machine has 2 cores and the full check is running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p10-options.md` and `p10-measure.md` (the last push's options and how they were measured; copy their method, hooks and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.237 (in the working copy, not yet pushed) built P10-A + D1 + H-a + RV2: EVk (`village_night`'s quiet night on the long calendar's village weeks 2 and 3 its own sequence of three each, `seqText(g, 'village_night:<vday>', QUIET_WEEK[vday])`; week 1 and the old calendar keep the old three), HS1 (`again.js`: a `STATE_PARA` paragraph, the food stock, is left out of the fold and returned as `state`, drawn under the fold's first part; the camp now folds by its story's sentences), HS2 (SV compares the story paragraphs, so the camp after "Cook and eat." folds). The rule of three stands for non-social scenes (six for the owner's social exception: the roof's later nights, the journey talks, the supper, the sunset walk). Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Measure these, each a sub-item with its own numbers
- **The effect of v0.11.237:** `village_night` folded a game (was 52.1 / 52.1 / 19.8 / 13.3; forecast EVk −6.0 / −6.0 / −6.0 / −5.0) by index and why; `bl_camp` folded and shown in full (was folded 7.1 / 7.0 / 15.0 / 14.4; HS2's redraws in full 4.8 / 4.1 / 5.8 / 5.1, forecast to fold), and that every folded camp screen now carries its stock.
- **The talks' later beats** (p10's open item: Sociable beats 11–14 fold 8.0 a game, Completionist and Cultivator beats 11–12 2.5 / 3.1; beat 11 is the quiet walk again; the talks are social, six allowed): numbers and what a fix would be (texts, Fable runs).
- **CB5** (the camp's nights 4–5; past three for a non-social scene, a rule change) and **EVn** (the quiet nights a cycle of six; a rule change): re-measure after v0.11.237.
- **The burned loft** (v0.11.237's reviews, T M1 / C L1, log only): how often `loft_burned` is reached (both calendars; the bots may never lose the arson fight: say how many games), and which quiet-night and morning texts name the loft or its herbs after it (grep; week 1's old texts can't follow it, the old calendar's night 3 can).
- **Whether the text lint reads the Ashen Hills' and the Drowned Wood's later camp texts** (p10's open item): its samples, by grep and one run of `node tools/textlint.mjs --list` in the scratch copy.
- **FC, LF, LG, SNr, ST2 degree 3, BYb-t, ME, PKf:** re-check as p10 did.
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p10-measure.md describes (the old calendar without `--cal 7` where p10 used it).

## Write
- `project/research/p11-measure.md`: the raw numbers and how (as p10-measure.md).
- `project/research/p11-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes, any rule change named; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
