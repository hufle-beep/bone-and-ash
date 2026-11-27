# P55-A + TB-A — the cold review's brief (v0.11.287; owner picks P55-A, 2026-11-27 16:09: "P55-a go"; TB-A, 17:17: "TB-A go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`; also
`/tmp/p55-diff.patch`; new untracked files `js/core/archive.js`, `tests/archive.test.mjs`, `project/research/p55-measure.md`). Do not
commit, push or edit any file outside `project/research/`. Read `CLAUDE.md` (the hard rules), `project/review-checklist-code.md` and
`project/review-checklist.md` (the task-mode line) first; read excerpts only (grep, line ranges), never whole story or test files. Do not
run the full check, the models or the tasks test (Claude runs them); single unit tests are fine (`node tests/archive.test.mjs`,
`node tests/threads.test.mjs`, `node tests/appfiles.test.mjs` take seconds; `node tests/story.test.mjs --games 2 --workers 1` about
4–6 minutes, at most once). The machine has 2 cores. For experiments make your own scratch copy (`cp -r` to /tmp/rv55). The tab bar and
the Archive tab in a browser: `python3 /tmp/tb.py` (about 20 s; prints `fails: []`).

## What was picked (`claude/p55-options.md`, `claude/p55-tabs-options.md`; the measure `project/research/p55-measure.md`)
- **CM-5, the Coil marks** (`game.js` `MARK_DRAIN`, `MARK_COUNT`, `marksHeld`, `fedPerHour`, used in `advance` (awake and the starving
  minutes), `nightTo`, `sleepUntil`; `barParts` / `barLines`; `archive.js` `noteMarks`, `archiveAt`; `story.js` `enterHook.archive`):
  one mark for each of the 9 arcs (`threads.js` `ARCS`) the first time it is finished in the game, from the game's start (the threads'
  own `arcs` count only after a won Act 1 and stay as they were), by the same scenes (`ARC_AT`) and the Blackroot's regions
  (`REGION_DONE` by `flags.bl_region`); each takes 5% off Fed's own drain awake and asleep (up to −45%); a card's extra Fed an hour
  (`tasks.js` `FED_EXTRA_PER_HOUR`) is untouched, as is `qiFed`'s threshold. A balance change, picked with its numbers: Fed drained
  awake −11 to −14%, T1 and T3 within noise.
- **IN-13, Insights as a record (no power)** (`coil.js` `REMEMBER` gets `bl_tracker`, `told_hearth`, `grove`; `archive.js` `INSIGHTS`):
  13, kept in `coil.known` at a Coil's end; the view adds what this Coil's flags show.
- **AR-t, the Archive tab** (`index.html`, `main.js` `renderArchive`, `app.js` key A, the CSS's 7 columns and `.row.dim`; `archive.js`
  `archiveView`, `ARCHIVE_TEXT`, `FOE_NAMES` (41: the tune table's 31 and the Long Forest's 10; `longforest.js` `FIGHTS` now exported),
  `ENDINGS` (8)): Insights, the 9 marks, foes met (`stats.foes`), endings seen.
- **SV** (`game.js` `newGame` stats, `archiveFill` in `migrate`): `stats.marks` (bits) and `stats.ends` (`'t:<flags.ending>'`,
  `'a:<flags.a1_outcome>'`, `'a:won'`), optional, kept by every rewind; an old save's filled once: in Act 1 the prologue's 3, a won clear
  all 9, plus the threads' arcs; the endings from the flags, `'a:won'` for a won clear with no outcome on the save.
- **TB-A** (the pick's 360 px stop): the menu button is "☰" alone (aria-label "Main menu" kept); the FAQ and one error line say
  "the ☰ menu →"; `tools/browser.py` `tab_bar` checks one line of 7 at 360 px and the Archive's headings.
- What's new `0.11.287`; the FAQ ("HP, Convergence and Fed", "What carries over"). `sw.js` VERSION 0.11.287 and `archive.js` cached.
- **Tests:** `tests/archive.test.mjs` (new, A–F); `tests/appfiles.test.mjs` (9 keys); `tests/story.test.mjs`: the pinned runs of PR2,
  VQ1, PT1 and P52-A's TG6 leave the two new fields out of their hashes and, for PT1 and TG6, switch the marks off (measured: with every
  P55 part off, all pins pass as before; with the fields only, 10 differ; with the drain, 3 more).

## Questions worth your time
1. The marks: can a mark be missed or given wrongly (the rewind's own first scene skipped by `go`; the week plan's look-ahead clones;
   a whole-game rewind; `bl_region` set on a hub without a scene change; Act 1's arcs through `ht_start`)? Is the drain applied
   everywhere Fed falls with time, and nowhere it shouldn't (the starving HP, a card's extra, `qiFed`, the long calendar's stays, the
   plan's forecasts of Fed or meals: do any forecasts in `week.js` or `tasks.js` still assume 3 an hour)?
2. The endings: `noteEnds` runs on the next scene's entry; can an ending be missed (a rewind straight from `collectors_lost` or
   `rt_taken`, the James tab's bite, a load) or a wrong one recorded (`flags.ending` 'lost' then a won rewind; `a1_outcome` 'taken')?
3. The fill: right for every old save shape (prologue, Act 1, after a won clear, the epilogue, a save with threads), and never
   overwriting a field that is there? Anything that serializes `stats` and would choke on the array?
4. The Archive's view: leaks or spoilers beyond what was picked; wrong counts (a foe met 0 times after `unmeet`); the Insights' view after
   a rewind and across the act crossing (`coil.known` copied at `game.js` ~118).
5. TB-A: anything that read the menu button's text (tests, the browser test, the FAQ's button check `FQ-e`)?
6. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p55-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p55-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) the tests should catch, against
`node tests/archive.test.mjs`. Say for each whether you expect it caught. Keep the report under about 6 KB.
