# Cold review brief: v0.11.219 (owner pick KC1 = KA + KG): Plan the week keeps its counts

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check is running already); `node tests/story.test.mjs --quick` in a scratch copy is fine (about a minute).

## What was picked (the owner's words and picks)

The owner 2026-11-17 20:02: "one more thing, other than the order of the scheduled cards, the amount should be saved too, to be adjusted later." Picked 20:14: **KC1 = KA + KG**, long calendar only (Plan the week exists only there).
- **KA, what is kept:** each row's amount as set (the cards, the Meditate rows, Smoke, Rest, the repeating visits and talks), not what is left this week; a one-off door back to 0 once taken; a card not open in a later week keeps its amount for when it is back; a count changed, or Clear, changes what is kept.
- **KG:** kept per stay (hub) for good, across weeks and Coils, as the places are (`g.tasks.prio[hub]`, PK1, v0.11.211): set once a stay, then adjusted.
- Before: a new week's plan started empty (Yuki's row at 1; `week.js` `planEnsure`).

## How it is built

`g.tasks.keep[hub]`: row key → amount (card id, `med:sit|mer|qi|pres|rest`, `door:<scene>`), written by `planSet` (created on the first set from the plan as it stands: an old save's plan mid-week keeps its cards as left), replaced by `planClear` (every row 0, Yuki's door 0), a one-off door taken sets its row 0 (`keepTaken`: the run, `noteReadTap`, `noteCardTap` with or without a plan that week). `planStart` builds a new plan's counts from it (clamped; unknown doors dropped; nothing kept = the old start). `planView(g)`: the plan here, or the one a new week would start with (not saved); the screen (`main.js` weekHtml, `planCount`, `planRanks`, `planPrio`'s order, `doorCards`, `planNotes`) and `COOK_PLAN.row` (v0.11.218's HA: the routine leaves the pot for a repeat cook only while the cook row is 1) read it. A rewind keeps `keep` (`coil.js`, beside `prio`). The bots (`tests/models.test.mjs` weekRun) empty the plan's cards and Meditate rows after `planEnsure`, so they plan each week afresh as before.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/core/week.js`, `js/core/coil.js`, `js/main.js`, `js/core/news.js`, `sw.js`, `tests/story.test.mjs` (the KC1 block near the end; W1's next week at about line 5206; the PR2 pin's `noKeep` and VQ1's `strip`: the runs' hashes leave out `keep`), `tests/models.test.mjs`, `tests/README.md`, the docs. My planted faults: `project/research/kc-faults.json` (12).

## What to look at especially

- Every path that changes a plan's counts: is each one that should change what is kept doing so, and none that shouldn't (the run's countdown, the forecast's dry run on a clone, the bots)? The forecast (`planForecast`) works on a JSON clone: confirm nothing leaks back.
- `planView` builds a fresh object each call: any caller that writes into it expecting to save (it is never stored)? Any hot path where it costs (the routine's `COOK_PLAN.row`, the panel, the forecast memo key)?
- HA through the view: a repeat cook row kept 1 with no plan this week now holds the pot for the cook until 15:00 (before: no plan, no hold). Is that right by KC1, and does it reach the old calendar or the first cook?
- Old saves: no `keep` (old start), a plan mid-week (first change), a save with `keep` from another hub, bad values; ids, flags and storage keys unchanged.
- The order: `oldPlace` reads the order the cards were set in from `p.items`' key order; a kept plan rebuilds `items` from `keep`'s key order. Same order across weeks?
- A card not open (a once-a-Coil menu's card, a card of another stay's id): kept, carried in `items`, skipped by the run; anything that counts `items` and would now say or do something wrong (the forecast's "not this week", `planHours`, `planEmpty`'s "Rest out the week" button, the order's rows)?
- Test gaps (`tests/story.test.mjs` KC1 block) and whether my faults are caught: `node tools/mutate.mjs project/research/kc-faults.json` (it plants each in a scratch copy and runs `tests/story.test.mjs --quick`; about 2 minutes a fault with 2 jobs). Add your own faults in `project/research/kc-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/kc-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
