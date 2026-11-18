# Cold review brief: v0.11.224 (owner pick TX2 = DC + DN + V3a + VF, with XA): TS6, the long calendar's texts

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run or is running); `node tests/story.test.mjs` (about a minute) and `node tests/story.test.mjs --quick` are fine. For the story text, read `project/research/ts6-drafts.md` (every new text, by id) and use `node tools/packet.mjs <scene>` for a scene's context (`--games 0` is quick).

## What was picked (the owner's words and picks)

The long calendar (a test switch; `g.cal === 7`): each story day in one place is a week (the forest Days 1–21, the village 22–42, the tribute Day 43; Ashfall's Fallout 44–64; the Heart 80–100), each Blackroot story day three days at a camp (65–79; only on a save with `calBl` 3), the Elder Day 103. The texts still counted the old days, and a stay's daily scene showed the same text on all seven days. The owner 2026-11-17 15:44: "for the extended calendar, the reperating story choices for the hubs should have more text variety, even if the bonuses are the same. aim for less repetition." His 2026-11-18 07:56 rule for repeated items: a sequence of three texts at most.

Measured before the pick (scratch copies of the models test, the four long-calendar bots, 8–10 games each): repeated story screens shown in full 25.1 / 28.5 / 26.5 / 27.0% (Careful / Sociable / Completionist / Cultivator; the old calendar 0%); six scenes give 77% of them (`mei_walk`, `supper`, `fo_supper`, `night`, `talk_mei`, `talk_ya`); about 50 lines counted wrong days on the long calendar (e.g. the hub's "two days off" 8–20 days before the tribute, "Thirteen days" 53–59 before the Elder).

- **DC:** the counts to the tribute and the Elder from the calendar (`js/core/calendar.js`: `numWord`, `ordWord`, `daysWord`, `tributeLeft`, `elderLeft`, `departLeft`, `sinceDepart`, `dayWord`, `elderDayWord`, `countsFill` and its slots `{days}` `{Days}` `{Day}` `{elderDay}` `{elderOrd}` `{since}`); the old calendar must read **exactly** its old words. Lines true only on the eve keep the old text on the eve (`tributeLeft(g) <= 1`, `departLeft(g) > 1`) and get Fable's version for the earlier days. L6: the hint's tribute day (`js/core/tasks.js` nextStep).
- **DN:** the story's own counts: a long-calendar version beside the old (`longCal(g)`, or `blSpan(g) > 1` in the Blackroot and for its length); the quiet mornings at a Blackroot camp their own lines and their own choices (appended; the marked choices keep `walks.js`'s places); a third wood camp and a third and fourth wood fireside; the two "yesterday" replies reworded for both calendars.
- **V3a:** the six scenes: two more texts per repeated text, shown as a sequence (`js/core/lines.js` `seqText`, keys `supper:4`, `supper:5`, `mei_walk:5`, `mei_walk:6`, `fo_supper:8`, `fo_supper:9`); the forest's `night` list 3 → 9; the settled talks a sequence past the five beats. The old calendar shows each text's first.
- **VF:** `js/story/again.js` `laterDayAgain`: a scene whose text was shown in full on an earlier day of this Coil folds to its first paragraph (no memory line), as SD does on the same day; the record `lines.vd` (per Coil, at most 600).
- **XA:** five more lines found while drafting: the Sect letter's other versions' Elder day (slot), the forest's story-day-3 "Tonight … the hurry" (7 mornings), the last camp's "last morning", the Long Forest's "this week", the walk's "Tomorrow, whatever happens" result on the earlier evenings.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/core/calendar.js`, `lines.js`, `tasks.js`, `news.js`; `js/story/again.js`, `common.js`, `ashfall.js`, `prologue.js`, `wilds.js`, `longforest.js`, `act1_fallout.js`, `act1_blackroot.js`, `act1_heart.js`, `act1_return.js`, `house_texts.js`, `house_time.js`; `tests/story.test.mjs` (the TS6 block at the end; re-pins of P6A, P7A, PR2, VQ1 + FQ1: measured against v0.11.223, the same steps, stops and saves but two texts); `tests/README.md`; `tools/text-baseline.json`. My planted faults: `project/research/ts6-faults.json` (15).

## What to look at especially

- **The old calendar unchanged:** any line whose old-calendar rendering changed by even a word (render on `newGame(seed, { closed: true })` with the right flags and day; compare with `git stash` or a worktree at HEAD). The `flags.long` (long road) vs the short road in the prologue; the Long Forest; a Coil past the first.
- **The counts:** `tributeLeft` against the village's weeks (`vday`, `cal_night`, `weekMorning`), leaving the forest early, the short road, a save from before the village; `countsFill`'s split at story day 7 (the tribute's day, the night after it, the Fallout's first morning); the house texts' `{Days}` everywhere they are read (`HT_BODY` is also read by the text lint and the tests); any place that shows a slot unfilled (`{days}` on screen).
- **Eve logic:** every `tributeLeft(g) <= 1` / `departLeft(g) > 1` split: the eve's real day and hour (the evening scenes run after 19:00; the hub on the eve's morning), the old calendar's eve, a skipped week.
- **V3a / VF:** the sequence keys and the day record (a redraw, a rewind, a new Coil, a save loaded mid-week from before this version); VF against SD, SV, the Coil fold, `skipStep`, the plan's read stop (`week.js`, `unreadLines`), a scene whose text changes within a day; the `night` list's order against `night_attack` and the forest's story nights.
- **The Blackroot's mornings:** every `bl_day` × `bl_n` × region: one way on, the walks' marks (`walks.js` throws if a label moves), the bots.
- **Tone and canon** of the new texts (deadpan James and Yuki, grave locals, Mei Lin looser, Ya blunt; `project/canon-card.md`); counts said aloud ("Fifty-nine days"); any text false on a day it shows.
- Test gaps (the TS6 block) and whether my faults are caught: `node tools/mutate.mjs project/research/ts6-faults.json`. Add your own faults in `project/research/ts6-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/ts6-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
