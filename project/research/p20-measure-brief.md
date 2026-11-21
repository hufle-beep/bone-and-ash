# Helper (PL): measure push 20, group f's rest (romance), and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` except writing `project/research/p20-measure.md` and `p20-options.md`. Hooks only in a scratch copy: `mkdir -p /tmp/p20w && tar --exclude=.git -C /home/claude/bone-and-ash -cf - . | tar -xf - -C /tmp/p20w` (the working copy holds v0.11.249's uncommitted build: use it as is); for "before", `git -C /home/claude/bone-and-ash archive HEAD | tar -x -C /tmp/p20o` (v0.11.248). The machine has 2 cores and the full check runs beside you: one model run at a time, `--workers 1`. Read excerpts only (grep, line ranges), never whole story files.

Read first: `project/research/p19-measure.md` (the method: a row a screen, every `bumpRel`; models `--games 10 --off 0 --workers 1 --texts`, long `--cal 7` and old), `p19-options.md` (the layout and its "Open, options later"), `project/roadmap.md` (grep "### f\." and the lines under it), `CLAUDE.md` rule 1, `js/story/romance.js` (TB, RL, AL as built), `js/core/game.js` `gainCounts` (GT1c).

## State
v0.11.249 (P19-A + MC-A + RV-A: GT1c, the tier beats, the remembered line, the eve's sleep alone). Bundle rule BB: a push takes every measured item of one area; up to 6 Fable runs at once.

## Measure, each a sub-item with its own numbers (Careful / Sociable / Completionist / Cultivator, 10 games, long and old)
- **v0.11.249's effect:** the gate days (Mei Lin 30 / 72 / 150, Ya 45 / 72 / 150; Coil 1 and the last Coil) and the last nights (quiet / Mei Lin / Ya / trio / Yuki) against v0.11.248; each beat (`tb_*` flags: which carrier, which day, passed over (-1) or shown) and the remembered line (`rl_mei`, `rl_at`) reached a game; AL taken (the bots' picks); all folded screens and taps against p19's; Yuki's and the Village's gains untouched (GT1c is Mei Lin and Ya only).
- **TS5's second item:** the evenings' real choices still a tap every night (the camp's watch or sleep, the suppers, Mei Lin's walk, the Heart's fire): the plan's evening stops a game now, and which scenes; what a weekly evening (one free evening a week: who to spend it with) would remove, as numbers; which gains it would move.
- **The decision point fed by earlier choices** (`rt_evening` reads `likesMei`, `likesYa`, `trio`, Yuki's path): which earlier choices exist that it could read (the eve, the hot spring, the roof, the Ashen Hills' Ya / Mei Lin nights), how often each is taken; a version's texts and words.
- **Echo scenes** (once per save, past a Coil threshold: she doesn't remember James, he remembers her; a locked one names what is missing): Coil ≥ 2 / 3 reached; which scenes could carry one; texts, words, Fable runs; RL's overlap.
- **A finished route never closed:** after a route's night (`rt_mei_night`, `rt_ya_night`, `rt_trio_night`, `yk_night_*`), what later scenes still read the person's affection or gate them, and whether any closes a route that was finished; on a later Coil too.
- **Notes from v0.11.249's reviews (`p19-review-t.md` L3, `p19-review-c.md` L4):** the beats' simile and paperwork habits (counts); GT1c caps friendship too: Mei Lin's and Ya's friendship by day against v0.11.248, and the story's friendship gates (`act1_return.js` Ya f ≥ 20, `prologue.js` Mei Lin f > 10): reached or not.
Each: texts, words, Fable runs, rule change if any, balance and save numbers where they apply; anything not measurable without a design: "open, options later".

## Write
`project/research/p20-measure.md` (raw numbers and how, under about 8 KB) and `project/research/p20-options.md` (the full layout as `p19-options.md`: every sub-item first with its numbers; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by what was measured (say what); the recommended one marked "(recommended)" with one line why; balance changes with their numbers; "Open, options later"; under about 6 KB). Reply with a 6-line summary.
