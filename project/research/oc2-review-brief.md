# OC2 — the cold review's brief (v0.11.260; owner pick P28-A, 2026-11-23)

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, branch `wip/oc2-build` (do not commit, push or
edit any file outside `project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read
excerpts only (grep, line ranges), never whole story or test files. Do not run the full check or the models (Claude runs them);
single unit tests are fine (`node tests/rules.test.mjs`, `faq`, `saves`; the task test `--games 5` takes about 3 minutes, the story
test `--games 5` about 3).

## What was picked

**OC, the old calendar's code, push 2 of 2** (the owner: "P28-A 🟢 (Recommended)"). Every new game has played the long calendar
since v0.11.226 (`g.cal === 7`); old saves move to it on load (`game.js` `flipFill`, called by `main.js` `checkScene`). v0.11.259
moved the tests and tools onto the long calendar and marked every check of an old-calendar-only rule (`OC2_OLD`, `cal: 0`). This
push deletes the old calendar's code and those checks:

- **OC2 (core):** `calendar.js` (`longCal` gone; `calStart`, `storyDayOf`, `storyDay`, `weekNights`, `storyNight`, `weekMorning`,
  `weekBegins`, `tributeLeft`, `countsFill`'s `{OnElder}` always the long form; `blSpan` reads `calBl` alone), `game.js` (`newGame`'s
  `cal` option gone, every game `cal: 7, calBl: 3`; `longPace` gone: `satDiv`, `merMult`, `xpPace`, `xpFloor`, the food's freshness,
  `gainCounts`, the fight memory's defence always on), `week.js` and `tasks.js` (their `longCal` entry checks), `coil.js` (the
  whole-game rewind's `cal` option), `main.js` (`freshGame` and `weekAfter`'s `cal` checks). **The flip stays:** `flipOne` reads an
  old save's minutes by its own arithmetic before it sets `cal`, then calls `calStart`. **New:** `migrate`'s step 4 (a save of
  state < 5, v0.8.5) runs before the flip, so it reads Act 1 on the save's own old days (`oldAct1`), not through the long helpers.
- **OC1 (story):** 72 `longCal(g)` branches in 13 story files: the long side kept, the old side and its texts gone (no long text
  changed). Comments that described the old calendar's behaviour trimmed.
- **MC (the marked checks):** deleted where the rule was old-only; where a marked block held a rule both calendars shared, it was
  re-pinned on the long calendar instead (the long numbers, or a number v0.11.259's old code measured, named in the comment: the
  W1 card's one-go 110 min and fam 0.5; Yuki's haul fam 161 / rng / 122 awards; Lu Han's raw HP 14 / 8; the jackals', boar's and
  Gao's old stats; the seclusion's 27 / 27.5). `tests/saves.test.mjs` builds its old saves by hand (`oldSave`: no `cal`, `calBl`).
- **T1 (before the deletion):** the music-line walk on the long calendar (`tests/story.test.mjs`, the CM2/CM3 walk: 160 games, then
  40 Fallout mornings × Act 1 Coils 1–3 × friendship bands, then 30 return suppers × three bands; measured 65 of 65 lines, 13 songs);
  Fable's failed-try lines (`JADE_FAIL`, `SPEARS_FAIL`) at the end of a failed week's carry (`tests/tasks.test.mjs`, the FT block).
- **L3:** `--write-flip-before` gone; the frozen readings are the only "before" (`tests/flip-before.json`).
- **OC6 (docs only):** `--kept` stuck on the old calendar closed; p13 §10 (a supper after midnight reads the next story day) is not
  old-only: on the long calendar a week's last night 00:00–04:59 reads story day d + 1 against text day d. Moved to section 2's open
  line, no fix in this push.

No balance or save change is intended: the bots already played the long calendar; old saves still flip on load.

## The diff

`git diff 52f5dc6..wip/oc2-build` (the base is v0.11.259). Game: `js/core/{calendar,game,week,tasks,coil}.js`, `js/main.js`,
`js/story/*.js` (13 files). Tests: `tests/{tasks,story,saves}.test.mjs`. Tools: `tools/textlint.mjs`, `tools/packet.mjs` (the `cal`
option dropped).

## What to return (one file, `project/research/oc2-review.md`, under about 10 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure. High = a player-facing fault, or a test that now
   passes when the game is wrong. Look especially at:
   - an OC1 branch where the **old** side was kept by mistake (a `cond ? A : B` with `A` the long text; nested ternaries in
     `ashfall.js`, `act1_fallout.js`, `prologue.js`, `wilds.js`, `kitchen.js`): compare with `git show 52f5dc6:<file>`;
   - a helper whose old-calendar branch had a meaning the long one now silently takes (a state without `cal`: only an unflipped old
     save; is any path reading the calendar before `flipFill` besides `migrate` step 4: `deserialize`, `peekSave`, `descOf`, the
     Coil's snapshot?);
   - a deleted check whose rule the long calendar also has and that no remaining test covers (the M2 kind);
   - a re-pin that no longer tests what its label says (a pinned number that would hold if the rule broke; the W1 `once`, now
     computed the way `tasks.js` computes it);
   - the T1 walks: can a later stage's line pass because the walk forced its state (the friendship bands) in a way play never can?
   - `migrate`'s `oldAct1`: is 7 × 1440 + 360 the old calendar's Act 1 dawn? Does any other migration step read the calendar?
2. Test gaps (TG1 …).
3. Planted faults in `project/research/oc2-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   6–10 faults in the changed game code (not in the tests). Do not run them.
