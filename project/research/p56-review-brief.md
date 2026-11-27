# P56-A + WL-d — the cold review's brief (v0.11.288; owner picks P56-A, 2026-11-27 19:51: "P56-a"; WL-d, 20:19: "WL-d")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`; also
`/tmp/p56-diff.patch`; new untracked files `project/research/p56-measure.md`, this brief). Do not commit, push or edit any file outside
`project/research/`. Read `CLAUDE.md` (the hard rules), `project/review-checklist-code.md` and `project/review-checklist.md` (the
task-mode line) first; read excerpts only (grep, line ranges), never whole story or test files. Do not run the full check, the models or
the tasks test (Claude runs them); single unit tests are fine (`node tests/archive.test.mjs` takes seconds; `node tests/story.test.mjs
--games 2 --workers 1` about 3–5 minutes, at most once). The machine has 2 cores and a check may be running. For experiments make your
own scratch copy (`cp -r` to /tmp/rv56).

## What was picked (`claude/p56-options.md`, `claude/p56-walks-options.md`; the measure `project/research/p56-measure.md`)
- **MP, the mapping** (`game.js` `INSIGHT_KIND`, `INSIGHT_KINDS`, `INSIGHT_STEP`): each of the 13 Insights gives 15% to one kind; a
  kind's Insights add up. 'blow' (the tribute `lore1`, `bone_sung`, `bl_tracker`, `log_heard`): a foe's blow on James × (1 − part), in
  tenths (`insightBlow`, in the fight round's attack and a failed run's bite); 'sit' (`lore_realms`, `lore_tree`, `saw_lights`, `grove`):
  the Saturation a sit gives × (1 + part) (`sitGain`); 'fed' (`fungus`, `gills`, `roots`): off Fed's drain, with the Coil marks, together
  at most `FED_CUT_MAX` 50% (`fedCut`, `fedPerHour`); 'xp' (`told_hearth`, `ship_found`): James's skill XP pool × (1 + part) (`awardXp`).
- **WH-n, from the next Coil:** only `coil.known` counts (`insightsHeld`). Claude's call in the build: `coil.js` `endCoil` no longer adds
  the Coil's finds to `known`; `remember(g)` does, called at the top of `rewind`, so "Not yet" on the Coil screen (back into the same
  Coil) holds none of its own finds. `coilReport` shows `known` plus this Coil's finds (`fresh` counts them).
- **LV-15:** 15% each. Measured: T1 unchanged (Coil 1 remembers nothing), T3 Careful 4.98 → 4.88, the Sociable 4.99 → 4.82.
- **UI-p:** the Archive (`archive.js` `archiveView`: each Insight's `kind` and `held`, `power`, `step`, `fedAll`; `ARCHIVE_TEXT` `kind`,
  `sign`, `gives`, `next`, `power`, `powerNote`; `main.js` `renderArchive`: the power line, each row's gift, this Coil's finds dimmed);
  the Fed bar's hold line (`game.js` `fedInsightLine`, `barParts` `fed.ins`); the Coil screen (`coil_scenes.js`, "new this Coil … the
  next Coil"); the FAQ ("HP, Convergence and Fed", "What carries over"); What's new `0.11.288`.
- **SV:** no save field. Old saves: `coil.known` as it is (missing → none; `remember` makes it).
- **WL-d** (the build's stop): `tests/story.test.mjs`'s walks no longer drew return.02 (4 draws before, 0 after: the walks bite the
  tail, so their later Coils changed); checked directly on a built state, as journey.02.
- **Tests:** `tests/archive.test.mjs` B (endCoil → the Coil screen; the rewind keeps), F (the FAQ regex), H (new: the mapping, WH-n with
  "Not yet", each hook, the cap, old saves, the Archive, the Fed bar, the Coil screen, FAQ, What's new); `tests/tasks.test.mjs` (known
  checked after the rewind); `tests/story.test.mjs` (WL-d).

## Questions worth your time
1. WH-n: can a find count in the Coil that found it (any path from `endCoil` back into play without `rewind`: "Not yet", the a1_end
   "Not yet", accepting a lost tribute, the James tab, a load on the Coil screen, the week plan's look-ahead clones)? Can a remembered
   Insight be lost (the act crossing `startActCoil` ~game.js 140, a whole-game rewind, `threadsKept`, an old save)? Does moving the push
   out of `endCoil` break anything that read `coil.known` between `endCoil` and `rewind` (the Coil screen, the threads, the bots in
   `tests/models.test.mjs` / `tests/lib/*`, `tools/*`)?
2. The hooks: does every foe blow on James go through `insightBlow` (other damage paths: big blows, posture, thorns, story `failDo`
   damage, Yuki's; which should and shouldn't)? Tenths vs integers downstream (`Math.floor(dmg / 2)`, the log's "−N HP", HP compares)?
   Does `sitGain`'s change reach places that should not move (forecasts, the week plan's sit counts, `sitUseless`, the hollow's ×2)?
   Does `awardXp`'s factor reach Yuki or the brawl in a way the pick didn't say? Fed: every place that assumed marks-only (`week.js`,
   `tasks.js` forecasts, `barParts` hours)?
3. The words: anything wrong or misleading in the Archive, the Fed bar, the Coil screen, the FAQ, What's new (numbers, "50% at most"
   when the cap isn't reached, singular/plural)?
4. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p56-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p56-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) the tests should catch, against
`node tests/archive.test.mjs`. Say for each whether you expect it caught. Keep the report under about 6 KB.
