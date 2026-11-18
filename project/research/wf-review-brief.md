# Cold review brief: v0.11.221 (owner pick WB = SK + CN): the wilds' work cards every 3rd day from Skilled

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check is running already); `node tests/story.test.mjs --quick` in a scratch copy is fine (about a minute).

## What was picked (the owner's words and picks)

The owner 2026-11-17 17:28: "The frequency of the training/prartice/hunt etc cards should also be examined, I'm higher coils those could also be farmed." Measured then: on the long calendar only the wilds' work cards repeat (Forage, Hunt, Practice, "Let Yuki hunt": `daily(…)`, once a calendar day each); a planned wilds week (8 cards open, each at 9) ran New 7, Practised 14, Skilled 31, Mastered 42 runs against the base game's 8. Picked WF2 (every 3rd day, as the doors' S3, v0.11.213). Mid-build (2026-11-18) Claude measured that spacing every card also cut New 7 → 6 (a hunger stop) and Practised 14 → 11 (Fed 79 → 25 at the week's end), and the owner picked 12:09 **WB = SK + CN**:
- **SK:** a wilds work card is spaced (every 3rd day of a stay, long calendar only, as S3) only once its own card is Skilled (familiarity 8, tasks.js `FAM[2]`); New and Practised cards stay once a day. Measured: New 7, Practised 14 (Fed 81), Skilled 31 → 19, Mastered 42 → 21.
- **CN:** a spaced card's row on Plan the week says "every 3rd day", as a repeating door's row does. Text only.

## How it is built

`js/story/common.js`: `SKILLED_FAM`, `spaceByFam(key, cardId)` (the daily key → its card id; adds the key to `SPACED`), `famReady` in `spacedNow` (a key with no card id is unaffected), `cardSpaced(g, cardId)`. `js/story/wilds.js` (its last lines) registers every choice of `wild_forage`, `wild_hunt`, `wild_train` that has a `show.dailyKey`, as `${menu}:${i}` (tasks.js's card id). `js/core/week.js` `cardNote`; `js/main.js` weekHtml's card row draws it. `js/core/news.js` a What's new line. No save field, id, flag or storage key changed (the day flags `ring@N` etc. are the old ones).

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): the files above, `tests/story.test.mjs` (the WB block at the end; VQ1 + FQ1's key count 13 → 25), `tests/README.md`. My planted faults: `project/research/wf-faults.json` (9).

## What to look at especially

- The card id mapping: is `${menu}:${i}` always the id tasks.js gives the card (taskCards' `forEach((c, i)`), for every screen and save; anything that reorders or wraps those choices (`show` wrapped by forms: `hasForm`, keeps `dailyKey`?)?
- `spacedNow` now reads `g.tasks.fam`: every caller (the doors, the cook, the Heart's talks, `unspaced`, `spacedNext`, the plan's `doorCards`, the forecast's JSON clone): anything that changes for keys that are not the wilds'?
- A card turning Skilled mid-stay: the run that made it Skilled counts as the last take (closed for two days after). Right by SK? Familiarity kept across Coils (`coil.js`): a Skilled card in a later Coil's first days?
- "Let Yuki hunt" (`yukihunt`, not James's card in task mode: `notJames`): never gets familiarity, so never spaced. Fine or a gap?
- The plan: a Skilled card set at 9 can run at most 3 a week; the forecast's row notes, `planHours`' "Cards" total, the stops (hungry), the read stop: anything worse than before?
- Story Mode (no task cards) on the long calendar, if reachable: does `g.tasks.fam` exist there?
- Test gaps (`tests/story.test.mjs` WB block) and whether my faults are caught: `node tools/mutate.mjs project/research/wf-faults.json` (each in a scratch copy against `tests/story.test.mjs --quick`). Add your own faults in `project/research/wf-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/wf-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
