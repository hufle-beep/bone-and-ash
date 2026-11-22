# P23 — the cold review's brief (v0.11.253; owner picks P23-A and RG-A, 2026-11-22)

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash (do not commit, push or edit any file outside
`project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read excerpts only (grep, line
ranges), never whole story files.

## What was picked (the owner's words: "P23-a go", then "RGA go")

The tests move to the long calendar (every new game plays it since v0.11.226; until now the bots, the drift guard and the browser
test still played the old one). Sub-items:

- **FX** the task bots' checks fixed to what the game does on the long calendar: a work card that starts a week's work gets its
  familiarity when the work ends (checked there now); a Coil ended mid-card or a card the day's meal and sit left no time for gets none;
  a door card's dry run counts the day's meal and sit before its walk (`tasks.js` `taskOutcome`, v0.11.225); the skip check compares
  the screen the player then sees.
- **TP** (game) the held card's tip (`main.js` `tipFor`) took `taskMinutes` (the walk alone) where the card's tag shows `taskOutcome`
  (the routine and the walk): now the tip reads the same dry run. A What's new line.
- **LB** the bot games on the long calendar: the task bots (`tests/tasks.test.mjs` `play`), the story test's random games and walks,
  the four Act 1 part tests, the models (`tests/models.test.mjs` default `--cal` 7; `tools/check.mjs`'s 40-game long step folded
  into the main models step).
- **WB** walk and part step budgets 1,500 → 15,000; each part run its own random stream (one shared stream left `fo_leave_offer`
  unreached).
- **BT** the browser test (`tools/browser.py`) without the old-calendar key; the long calendar's locked cards allowed; hand-built saves
  read as the game loads them (`flipFill`); LP2's second forage card tapped the next morning.
- **DG** the strict ±20 drift guard (`tools/sanity.mjs` against `tools/baseline.json`) now measures the long calendar (its inputs are
  the task bots' and story test's numbers); the baselines are re-saved from this push's full check (not yet done when you read this);
  `tools/models-baseline.json` compared and saved on the long calendar.
- **RG-A** (game, found while building) `power.js` `degreeForChoice` (the one-move check run on every draw of a screen with a fight
  choice) built the fight on the save itself, so the tribute's builder (`prologue.js` `collectorsFight` → `luSpread` → `d6`) moved the
  save's random numbers on every redraw. Now it builds on a shallow copy `{ ...g }`. A new check in the task bots: drawing a screen
  leaves the save unchanged (but `lines`, the line picker's record, and `log`), one game in 8.

Left on the old calendar by design (open, options later): about 640 hand-built states in the unit tests and the code's 84 `longCal(`
branches; old saves still flip on load.

## The diff

`git diff` in the repo (10 files). The game files: `js/main.js`, `js/story/power.js`, `js/core/news.js`.

## What to return (one file, `project/research/p23-review.md`, under about 10 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure (inputs → wrong result). High = a player-facing fault
   or a test that now passes when the game is wrong. Look especially at: the shallow copy in `degreeForChoice` (does any fight builder
   write into nested objects of the save: flags, james, yuki, inventory, coil, rel?); whether the tip and the card can still differ;
   whether the new familiarity checks can pass vacuously; the drift guard's inputs and the `--long` log after folding the step; the
   models' saved-copy gate (`!SHARD && CAL && !KEPT`); the browser flows' day move (`d2['minutes']`).
2. Test gaps (TG1 …): what is not tested that should be.
3. Planted faults in `project/research/p23-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   6–10 faults in the changed code (game and tools files; not in the tests themselves). Do not run them; Claude runs them.
