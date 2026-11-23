# P29-A — the cold review's brief (v0.11.261; owner pick P29-A, 2026-11-23)

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, branch `wip/p29-build` (do not commit, push or
edit any file outside `project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read
excerpts only (grep, line ranges), never whole story or test files. Do not run the full check, the models or the task test (Claude
runs them); single unit tests are fine (`node tests/saves.test.mjs`, about 5 s; `node tests/rules.test.mjs`, `faq`); the story
test takes about 5 minutes (`node tests/story.test.mjs`), run it at most once.

## What was picked

Two display faults, no balance or save change (the owner: "P29-A go"):

- **SL (the v0.11.260 review's L1 and TG4):** the Saves screen's line (`js/main.js` `descOf`) came from `peekSave`
  (`js/core/game.js`), which read the raw JSON and moved an old-calendar save's minutes with `flipMinutes(minutes, act)` in
  `main.js`, using the act the raw save held. A v0.8.5 save has no Coil until `migrate`'s step 4, so `saves/v0.8.5-act1-end.json`
  was listed on Day 104 but opens on Day 94; the six v0.8.5 saves were listed with no Coil but open on Coil 1 (two in Act 1).
  **Now** `peekSave` reads the save the way loading does: `deserialize(text, { force: true })` then `flipFill` (what `main.js`
  `checkScene` does on every load; `checkScene` also moves a save resting in an emptied menu to its hub, `deadMenuHub`: left out,
  0 of the 39 saves move by it). `descOf` shows `clockLabel(p.minutes)`; `main.js` no longer imports `flipMinutes`; the export is
  gone (the leftovers check flagged it test-only; `tests/saves.test.mjs` moves its two uses to `peekSave` and a local helper
  through `flipFill`). Measured before: 1 of 39 saves on the wrong day, 6 of 39 without their Coil; after: 0 / 0.
  `peekSave` is 0.12 ms a save before, 0.13 ms after (node).
- **M4 (the v0.11.259 review's M4 and TG-A7):** the long calendar's routine meals (`js/core/tasks.js` `dayMeal`) from the
  hammerspace write `"<Breakfast|Midday|Supper>: <food>[, cooked]. +N satiety."` (the eating line without its `You eat: ` lead);
  `splitLine` (`js/core/replies.js`) put `"Breakfast: smoked meat."` in the reply and `"+30 satiety."` in the Results. The bare
  fallback `"Midday: the communal pot."` (the pot's run gave no satiety line) was reply only. **Now** two anchored `GAIN_LINES`
  patterns put both whole in the Results, wording unchanged (the old calendar's `"Breakfast. You eat: …"` was a whole gain).
  Measured: about 95 hammerspace routine lines a game (100 bot games, dry runs counted, so a ceiling), the bare pot line 0 times.

## The diff

`git diff main..wip/p29-build`. Game: `js/core/game.js` (`peekSave`), `js/main.js` (`descOf`, the import), `js/core/replies.js`
(two patterns). Tests: `tests/saves.test.mjs` (TG4 for every save in `saves/`, the two named saves, the `descOf` pin),
`tests/story.test.mjs` (the TF1 block: TG-A7, 66 routine meals from the hammerspace and the bare pot line).

## What to return (one file, `project/research/p29-review.md`, under about 8 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure. High = a player-facing fault, or a test that now
   passes when the game is wrong. Look especially at:
   - `peekSave` through `deserialize`: can it now throw (or return null, "Unreadable") for a save the old `peekSave` listed and the
     game loads (a newer `v`, bad numbers, a save `deserialize` refuses without `force`)? Can it list a save that will not load?
     Does `deserialize` or `migrate` touch anything outside the parsed copy (module state, `Date`, a random draw)?
   - where else `peekSave` is used (`main.js`: the slot list, backups, the recovery screen, Import) and whether any caller relied
     on raw (unmoved) minutes or the raw Coil count;
   - the two patterns: anchored enough? Could a story or task line of another kind now match and leave the reply (a choice's text
     that starts with "Breakfast: " / "Midday: " / "Supper: ")? Is any routine meal shape still split (the pot path, `ls[i]` with a
     pot line that has a period inside; the forest morning; the camp's supper)?
   - does any test still pin the old split or the old `descOf` (a passing check that no longer tests its label)?
2. Test gaps (TG1 …).
3. Planted faults in `project/research/p29-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   4–8 faults in the changed game code (not in the tests). Do not run them.
