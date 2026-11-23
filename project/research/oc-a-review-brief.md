# OC-A — the cold review's brief (v0.11.259; owner picks OC-A, W1, K-A, 2026-11-23)

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, branch `wip/oc4-tests` (do not commit, push or
edit any file outside `project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read
excerpts only (grep, line ranges), never whole story or test files. Do not run the full check or the models (Claude runs them);
single unit tests are fine (`node tests/rules.test.mjs`, `faq`, `saves`; the task test `--games 5` takes about 3 minutes, the story
test `--games 5` about 9).

## What was picked

**OC, the old calendar's code, push 1 of 2** (the owner: "OC-A 🟡 (Recommended)", then "W1 🟢", then "K-A 🟢"). Every new game has
played the long calendar since v0.11.226 (`g.cal === 7`); old saves move to it on load (`game.js` `flipFill`, called by `main.js`
`checkScene`). The old calendar's code is still there (`longCal(g)` branches); push 2 (OC1, OC2, OC6) deletes it. This push moves the
tests and tools onto the long calendar first, with the game's code paths unchanged, so the same tests can guard the deletion.

- **OC3:** `main.js` no longer reads the browser test's old-calendar key (`boneash.oldcal`, set by nothing since v0.11.253):
  `freshGame` always the long calendar, `checkScene` always calls `flipFill`, the Saves screen's line always the moved day.
- **OC4:** `game.js` `newGame`'s default `cal` 0 → `LONG_CAL` (main.js always passed it; the tests and tools now get it). The tests
  re-pinned: their clocks by story day (`calMinutes(g, day, h)`) where a story day was meant, by calendar day where a clock rule was
  (sleep, the night lock, the days-slept counter); the long calendar's numbers where a rule both calendars share (a sit ÷4, XP ×0.7, a
  card ×NEW_LENGTH, the memory line's defence, the Act 1 dawn on Day 44). A check of a rule **only the old calendar has** (its one-go
  cards, its every-night events, its day counts and words, its pace numbers) builds its state with `cal: 0` (`OC2_OLD` in the task
  test, `cal: 0 /* OC2 */` in the story test): those go with the code in push 2. `tests/flip-before.json`: each old save's reading
  before the move (act, done-today by two day keys), frozen by this build's old reader, sha-pinned, cross-checked live (saves test).
- **OC5:** the text lint, the lint and the Fable packets now read the long calendar (newGame's default); the text lint's snapshot re-saved.
- **K-A** (found by the task test's B2 walk once it ran on the long calendar): the long calendar's day meals get a "Breakfast: /
  Midday: / Supper: " prefix (`tasks.js` `MEAL`), which broke three pot patterns in `js/core/replies.js` `GAIN_LINES`, so four pot
  lines with speech in them landed in the reply with "+25 satiety". The three patterns now accept the prefix.

No balance or save change is intended: the bots already played the long calendar; old saves still flip on load.

## The diff

`git diff dd2ab4a..HEAD` (branch `wip/oc4-tests`): `js/main.js`, `js/core/game.js`, `js/core/replies.js`, `tools/browser.py`,
`tools/text-baseline.json`, `tests/*` (rules, faq, saves + `flip-before.json`, tasks, story, tools).

## What to return (one file, `project/research/oc-a-review.md`, under about 10 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure. High = a player-facing fault, or a test that now
   passes when the game is wrong. Look especially at:
   - a re-pinned check that no longer tests what its label says (a clock moved so the rule is never reached; an expectation loosened);
   - a check marked old (`cal: 0` / `OC2_OLD`) for a rule the long calendar **also** has and that no long test covers (name it: push 2
     deletes these, so a shared rule would lose its only test);
   - the conversions to `calMinutes` that changed a calendar-day clock rule into a story-day one, or the reverse;
   - `flip-before.json`: can it go stale silently (a save added to `saves/`, a save edited, the probe names changed)?
   - K-A: can the widened patterns now file a real reply as a gain (a line that starts with a meal prefix and the pot words but is
     speech)? Is any other prefixed meal line still split wrongly (`tasks.js` ~813–880; `kitchen.js` `potLine`; `ashfall.js` ~750)?
   - main.js: every load still goes through `checkScene` → `flipFill`; nothing else read the removed key.
2. Test gaps (TG1 …).
3. Planted faults in `project/research/oc-a-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   6–10 faults in the changed game code and the game code the re-pinned tests guard (not in the tests). Do not run them.
