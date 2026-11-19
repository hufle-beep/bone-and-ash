# Cold review brief: v0.11.229 (owner pick E2-2 = FR + NR + HS): one-paragraph texts fold

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run); `node tests/story.test.mjs --games 2 --workers 1` in a scratch copy is fine (about 30 s).

## What was picked (2026-11-19 14:05, "E2-2")

The rule for repeated texts (`project/roadmap-e.md`, v0.11.228): the story's own texts repeat little, because a scene read before folds (`js/story/again.js` `againView`: read on an earlier Coil (P1-a / FP2, with a memory line), the same visit (SV), the same day (SD), a later day of the same Coil (VF, v0.11.224); the fold shows the first paragraph under "Read it all again", `js/main.js` `proseHtml`). Until now only texts of two paragraphs or more folded (`ps.length < 2` → shown whole).

Measured before the pick (a scratch copy, the models test `--cal 7 --texts`, 10 games each): screens repeated in full 11.2 / 11.2 / 9.1 / 4.5 a game (Careful / Sociable / Completionist / Cultivator), every one a one-paragraph text: `mei_walk`'s sunsets, `village_night`'s quiet night, `far_hunt`, `far_won`. With FR on the scratch copy: 0 / 0 / 0.6 / 0.5 (left: `far_hunt`'s two bull texts, one sentence each); folded screens rose by exactly the old full repeats (Careful 1,215 → 1,327 per 10 games), no other screen changed.

- **FR:** `again.js` `sentencesOf` (a sentence ends at . ! ? or …, a closing quote or `*` may follow, then whitespace and a capital, a quote or `*`) and `foldParts`: a one-paragraph text with two sentences or more folds by the same rules to its first sentence; `rest` is the other sentences joined by a space; the view carries `split`. `main.js`: when "Read it all again" is open on a split fold, the paragraph shows whole (`paras(v.text)`), not as two paragraphs. The read record `g.read` stays by paragraph (unchanged). FAQ ("How do I play?") and What's new (`news.js`) lines.
- **NR** (docs only): the night's rules read: 21 hits of "toward dawn", "past midnight", "until dawn", "small hours", "all night", "02:00": all night scenes, none breaks the rules (bed from 21:00, night encounters 01:00–02:00); no text changed.
- **HS** (docs only): a stale handover line.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/story/again.js`, `js/main.js`, `js/core/faq.js`, `js/core/news.js`, `tests/story.test.mjs` (the E2-2 block at the end). `sw.js` is bumped with the docs after the checks. My planted faults: `project/research/e2-faults.json` (9).

## What to look at especially

- Every caller of `againView` and anything that assumes `first` + `rest` are paragraphs (`tests/tasks.test.mjs` 3570 / 3725 join them with a blank line; `tools/browser.py` part 2's fold check counts paragraphs after "Read it all again"; the models test's `--texts`).
- The sentence split on the game's real one-paragraph texts: abbreviations, numbers ("3.5"), ellipses, italics (`*…*`), quotes opening a sentence, dialogue tags, a text that opens with a number paragraph or the food stock (`STATE_PARA`), markdown. A fold whose first sentence reads badly alone (a dangling "Then…", a question answered in the rest)? Sample some with `node tools/packet.mjs <scene>`.
- Which one-paragraph screens now fold that didn't (earlier-Coil folds included: the bots' count is within a Coil only): any outcome-like scene not in `OUTCOME_SCENES` whose one-paragraph text could mislead when folded; the memory line over a one-sentence first part.
- "Skip to the next choice" and the read stop (`week.js` `readProbe` / `unreadLines`) are by paragraph: unchanged? The "Read it all again" open state (`readAllScene`) across redraws.
- Test gaps (the E2-2 block) and whether my faults are caught: `node tools/mutate.mjs project/research/e2-faults.json --cmd "node tests/story.test.mjs --games 2 --workers 1"`. Add your own faults in `project/research/e2-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/e2-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
