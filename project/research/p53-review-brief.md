# G3-A — the cold review's brief (v0.11.285; owner pick G3-A, 2026-11-27 02:04: "G3-a go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`;
the game part also in `/tmp/p53-diff.patch`; the new file `js/core/credits.js` is untracked). Do not commit, push or edit any file outside
`project/research/`. Read `CLAUDE.md` (the hard rules), `project/review-checklist-code.md` and `project/review-checklist.md` (the task-mode
line) first; read excerpts only (grep, line ranges), never whole story or test files. Do not run the full check, the models or the task
test (Claude runs them); single unit tests are fine (`node tests/appfiles.test.mjs` takes seconds; `node tests/story.test.mjs --games 2
--workers 1` about 4–6 minutes, at most once). The machine has 2 cores and another job is using them. For experiments make your own
scratch copy (`cp -r` to /tmp/rv53). A browser run of the new screen checks alone: `python3 /tmp/perf/g3run.py g3_ui` (about 1 minute).

## What was picked (G3, game UI; `claude/p53-options.md`, the measure `project/research/p53-measure.md`)
No balance change intended (the bots never touch the screen; the plan's new count does not change what runs). Save: one new optional field
`g.stats.hist` (made only by the screen) and `p.ran` inside the existing `g.tasks.plan`. No ID changed, no storage key changed.
- **SB-h** (`game.js` `barParts`, `barLines`; `main.js` `statusHtml`, the hold handler, `tipFor`): a held status bar (or its `title` on a
  PC) shows what its number is made of: HP's max (20, the body by the GU check, the realm), Convergence's max (20, Convergence Use, the
  primaries open, the realm, ×1.25), Fed's hours left awake at 3 an hour.
- **FE-t** (`tasks.js` `famNext`; `main.js` `tipFor`): a held work card adds "At Skilled (8): ×5 speed; one run 1 h → 24 min." (one run as
  `resolveWork` times it, not the long calendar's ×7).
- **FS-s** (`app.js` `fileStamp`; `main.js` `saveFileName`, `knownVersion`): a downloaded save is named
  `bone-and-ash-2026-11-27-0158-coil8-0.11.285.json`.
- **OS-a** (`app.js` `ASK_MS`, `ASK_TEXT`; `main.js` `askTwice`, `hereDesc`, `pendingFile`, the `data-save`, `data-load`, `data-loadfile`
  handlers, the import handler): Save here on a full slot, Load from a slot with a game on, and Load save file with a game on ask for a
  second tap (a file: its line and Load it / Cancel on the Saves page), naming both games. Save here on an empty slot asks nothing.
- **HK-t** (`app.js` `HOTKEYS`, `hotkeyOf`; `main.js` the keydown handler; Settings lists them): 1–9 the visible open cards or choices,
  Esc closes the tooltip or goes back to the menu from a menu page, S C H J F M the tabs; nothing with Ctrl / Alt / Meta or in a field.
- **CR-p** (`js/core/credits.js`; Settings): the credits; `tests/tools.test.mjs` checks the names both ways against `CREDITS.md` and
  `art/bg/CREDITS.md`.
- **PF-g** (`tools/browser.py` `g3_ui`): at 4× CPU the median tab switch under 300 ms and a card tap's main-thread work under 400 ms.
- **CH-t + TL-t** (`coil.js` `HIST_MAX`, `TL_KINDS`, `nightMinutes`, `histEnsure`, `tlNote`, `histNow`, `histClose`, `histRows`;
  `game.js` `coilSnap` drops it from the act's snapshot; `rewind` calls `histClose`; `main.js` `tlCount` in `autosave`, `tlKind` from the
  click, `coilsHtml`, `tlStrip`): the Journal's table of Coils (how each ended, days, realm, kills) with a strip of its minutes as work
  and cultivation (cards), story, fights, nights (21:00–06:00, except in a fight). Begun partway through a Coil (an old save): that
  Coil's kills and time unknown ("—", "from before the history"). The last 30 kept.
- **L4-r** (`week.js` `ranOf`, `noteRan`, `planStep`, `noteReadTap`, `runPlanSteps`, `planHere`'s camp day, `planClear`, `planSet`): the
  plan counts each card's runs this week (`p.ran`); − / + set what is left as kept less the runs made (the P52 review's L4: kept 2, none
  left, − then + left 1). An old plan with no count reads it as kept − left when that is 0 or more; else the old rule.
- **ST-m**: docs only (three items moved to G5's line), not in this diff.
- What's new `0.11.285`. **Tests:** `tests/story.test.mjs` the G3-A block at the end; `tests/appfiles.test.mjs` (FS-s, OS-a, HK-t and
  five mutants); `tests/tools.test.mjs` (CR-p); `tools/browser.py` `g3_ui` and RQ1's slot load (now two taps).

## Questions worth your time
1. OS-a: can any path still overwrite a full slot or replace the game without the second tap (the recovery screen, a load with no game,
   Restore all, the welcome card)? Can an armed tap carry over to a different slot or button, or a stale `pendingFile` load later?
2. CH-t / TL-t: `tlCount` runs in every `autosave`; does it ever count wrong time (a load, New game, a rewind, the plan's resume, two tabs,
   the recovery screen), throw, or grow the save without bound? Is `histClose` safe on a whole-game rewind and on an old save's rewind?
3. L4-r: is `p.ran` right through a week: the plan's run, a read stop tapped by hand, a skipped card (the routine went first), a carried
   card, a camp's new day, Clear, `planSet`; does any number the row shows, or the forecast, change where it shouldn't?
4. SB-h / FE-t: do the numbers match what the game uses (the HP floor, Convergence's rounding, a work card's time at the long
   calendar's stays)? The hold on a bar: any clash with the card hold, the tap guard or scrolling on a phone?
5. HK-t: a digit while a story choice's double-tap guard is on, in a fight, on the plan's panel, or with a group folded.
6. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p53-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p53-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) the tests should catch, against
`node tests/story.test.mjs --games 2 --workers 1` or `node tests/appfiles.test.mjs`. Say for each whether you expect it caught. Keep the
report under about 6 KB.
