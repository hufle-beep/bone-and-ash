# P29-A — the cold review (Opus, v0.11.261, branch `wip/p29-build`)

Read: `CLAUDE.md`, `review-checklist-code.md`, `git diff main..wip/p29-build`, excerpts of `game.js` (peekSave, deserialize, migrate,
flipFill, makeCoil, startActCoil, ensureBars), `calendar.js` (module state), `main.js` (checkScene, descOf and its 5 callers,
land, the plan's Results), `replies.js`, `tasks.js` (dayMeal), `common.js` (eatBest, FOOD_NAMES), `kitchen_texts.js` (POT_LINE).
Ran: `node tests/saves.test.mjs` (39 files, 1588 passed, 0 failed); `node tests/story.test.mjs` once (11,930,644 passed, 0 failed);
a scratch script (in /tmp, not the repo) comparing the old `peekSave` + `flipMinutes` with the new one on all 39 saves and 11 hand-made
saves.

## Findings

**High: none. Medium: none.**

**L1, `js/core/game.js:1729`, `tests/saves.test.mjs:32`: "reads as it loads" stops short of `checkScene`.** peekSave runs
deserialize + flipFill, not `checkScene`'s other two steps: a save resting in an emptied menu is listed with that menu's title but
opens on its hub (`deadMenuHub`), and a save naming a scene this version lacks is listed with its id but fails to load (`notSave`).
Both were the same before this push (no regression; measured 0 of 39 saves move by `deadMenuHub`). The test's message says "the
scene it loads on" but compares with deserialize + flipFill, not with `checkScene`, so it claims more than it checks. Fix the wording,
or have `descOf` (main.js has SCENES) apply `deadMenuHub` and show the refusal.

**L2, `js/core/game.js:1624–1625, 1727`: stale doc comments.** flipFill's comment still says it is "Called by main.js on every load
… not by `migrate`"; now `peekSave` calls it too. peekSave's own line still says it returns `"<scene id>|<minutes>"` (it has returned
an object since v0.11.13). Comments only.

## Checked, no finding

- **Null where the old one listed (measured):** the new peekSave returns null ("Unreadable") for state `v: 0`, no `james`, no `yuki`,
  and a v3 save with no `stats` (startActCoil writes `g.stats[…]`). The old one listed all four; the game cannot load any of them
  (deserialize throws `notSave` or a TypeError, with and without force). So the screen now says what Load will do.
- **Force cases:** checksum mismatch, newer `fmt`, newer state `v` (clamped to 5): listed exactly as before (same scene, minutes,
  Coil, act). No case found that the game loads and the new peekSave refuses: force only clamps `v` and zeroes bad numbers, so a
  save that loads without force gives the same state with it, and flipFill is the one `checkScene` runs.
- **Side effects:** deserialize, migrate (makeCoil → coilSnap, a JSON copy; startActCoil; the fill steps) and ensureBars touch only the
  parsed copy. No `Date`, no `Math.random`, no `rng` draw. The only module state on the path is `calendar.js` `pinnedDay`, which
  `blFill` → `storyDay` reads (never writes); the Saves screen is never drawn inside `atStoryDay`.
- **Callers:** `descOf` is the only user of peekSave (slots, Saves-screen backups, recovery-screen backups, Import's `pendingAll.auto`).
  None reads raw minutes, `cal` or the raw Coil. `p.cal` is now read by tests only. `LONG_CAL` is still used in main.js (line 361), so
  its import is not a leftover. No game code still mentions `flipMinutes`.
- **The 39 saves, old against new (measured):** 6 differ, all v0.8.5. `act1-end` goes from Day 104, no Coil, to Day 94, Act 1, Coil 1.
  `act1-start` goes from Day 44, no Coil, to Day 44, Act 1, Coil 1. The other four stay on the same day and get Coil 1. This matches
  the brief.
- **The patterns:** no other line begins "Breakfast: / Midday: / Supper: " and ends ". +N satiety." The forest morning
  (`prologue.js:953–955`, "Breakfast: hare, +35 satiety.") is one sentence, already a gain through GAIN_BITS, and untouched. The pot
  path's line always ends ": +25 satiety." (that is how dayMeal finds it), so the new pattern can never take it. The two pot lines
  with a full stop inside (POT_LINE.ashfall[0], fo[2]) keep their v0.11.259 patterns. The other three pot lines and the fallbacks are
  one sentence each, whole with any prefix. The camp's supper (`act1_return.js:282`) is eatBest's "You eat: …", the old pattern.
  FOOD_NAMES has no "." and no quote mark. The plan's day lines go to Results whole (`main.js:230`), so only taps change. `landParts`
  is the only user of the split.
- **Old pins:** no test still pins the old split or the old `descOf` expression. `tasks.test.mjs:1597` (peekSave Coil 3 + 2 − 1 = 4)
  still holds through migrate's oneCount.

## Test gaps

- **TG1, peekSave and force:** no test feeds peekSave a save that needs force (bad checksum, newer `fmt`, newer state `v`) or one the
  game refuses (`v: 0`, no `james`). All 39 saves in `saves/` are clean, so dropping `{ force: true }` passes (C1). Add one case per
  kind: listed (the force ones) or null (the refused ones), matching `deserialize`.
- **TG2, the Saves screen's line itself:** `descOf`'s string is never built in a test. Only `clockLabel\(p\.minutes\)` is pinned by
  regex. Hiding "Coil 1" or the "Act 1, " (C2, C3) would undo SL on the screen while every peekSave check still passes. Pin it as
  rendered: move the line's format into a pure exported helper and test the 39 saves through it (at least v0.8.5-act1-end =
  "… Day 94 … · Act 1, Coil 1"), or check the source for the Coil and act parts as well.
- **TG3, the anchors of the two new patterns:** the negative cases (`story.test.mjs:5605`) cover the prefix and the quote mark only.
  Nothing fails if the full-stop exclusion goes ("Supper: Stew. Ya says nothing. +3 satiety." whole in Results, C4), if the end `$`
  goes (a sentence after the stat, C5), or if the pot pattern loses its prefix (C6). Add one negative line for each.
- **TG4, the bare pot line from the game:** the TG-A7 pot check builds `${m}: the communal pot.` by hand. If the wording at
  `tasks.js:874` changes, it passes while the real line splits again. The line is unreachable in play (measured 0), so drive the
  branch with a stub pot card whose run returns no satiety line, or export the fallback text and build the check from it.
- **TG5, new against itself:** TG4 (`saves.test.mjs:31–32`) and FP1's `peekMin === g.minutes` (`:102, :120`) compare peekSave with
  the same deserialize + flipFill it runs (checklist: "never the new code against itself"). Only v0.8.5-act1-end's day and the six
  v0.8.5 Coil counts are pinned on their own. Pin the measured after-values (file → day, Coil, act) for all 39 saves, so a change in
  migrate or flipFill that moves both sides is caught.
- **TG6 (minor), every pot line with every prefix:** `tasks.test.mjs:2165–2173` walks the three pot lines that have speech with each
  MEAL prefix. `story.test.mjs:3184` walks all of them without a prefix. No test walks all six with each prefix. All are whole today
  by shape, but a new pot line with a full stop in it would split silently.

## Planted faults

`project/research/p29-faults-review.json`: 7 faults, not run.

| Fault | Where | What it breaks | Expected |
|---|---|---|---|
| C1 | game.js | force dropped | survives (TG1) |
| C2 | main.js `descOf` | "Coil 1" hidden | survives (TG2) |
| C3 | main.js `descOf` | "Act 1, " dropped on Coil 1 | survives (TG2) |
| C4 | replies.js | full stop allowed inside the meal | survives (TG3) |
| C5 | replies.js | end anchor `$` dropped | survives (TG3) |
| C6 | replies.js | pot pattern unanchored | survives (TG3) |
| C7 | replies.js | one-digit meals (river cress +8, needleberries +3) split | caught by TG-A7 |

The builder's F1–F7 are not repeated. `tools/mutate.mjs` cannot measure C2 and C3 against the browser test.
