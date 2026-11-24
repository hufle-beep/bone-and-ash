# P39-A — the cold review's brief (v0.11.271; owner pick P39-A, 2026-11-24 22:37: "P39-a"; JW-A 23:08: "JW-A go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`).
Do not commit, push or edit any file outside `project/research/`. Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md`
(and `project/review-checklist.md` where it applies) first; read excerpts only (grep, line ranges), never whole story or test files. Do not
run the full check, the models or the task test (Claude runs them); single unit tests are fine; the story test takes about 4 minutes
(`node tests/story.test.mjs --games 2` is faster), run it at most once.

## What was picked (a balance change; no save change)

The owner's target T1 (`tools/targets.json`): the whole game on Coil 1 in 20–30% of games for the Completionist and the Cultivator.
That number is decided by the tribute fight (encounter id `collectors`, `js/story/prologue.js` `collectorsFight`) won on Coil 1.
Measured before the pick (200 games a model, `tests/models.test.mjs --off 0`): the Cultivator (Core Formation, realm 3, at the tribute)
19.5% (seed 1: 15.5%), the Completionist (Foundation, realm 1) 21.5%.

- **RG:** `js/story/fight_tune.js`: `HIGH_REALM = 2`, `HP_TUNE_HIGH = {"collectors": 0.7}`, `hpTuneFor(id, realm)`: a James at Core
  Formation (realm 2) or above meets the collectors at HP × 0.7, below it HP_TUNE's 0.8; every other fight as before.
  `js/story/power.js` `prepare` reads `hpTuneFor(enc.id, g.james?.realm)` (was `HP_TUNE[enc.id] || 1`). The pattern copies P25-A's
  (`js/story/act1_tune.js` `tuneFor`, the rot ape by James's realm). Measured: the Cultivator 19.5 → 32.5% (seed 1 15.5 → 21.5);
  the Completionist, Careful (0% on Coil 1, Act 1 4.96 Coils) unchanged.
- **JW-A (picked mid-build):** RG moved the 2 of 160 random walks that reached the music line `journey.02` (Ya at a journey camp,
  friendship under 30); the story test's "every music and archive line shows in the random walks" check now leaves `journey.02` out
  and checks it directly on a built state (`music.js` `lineOpen`).
- **MN, UC:** docs only (not in this diff yet).
- **What's new:** `js/core/news.js`, the 0.11.271 line.
- **Tests:** the P39-A block in `tests/story.test.mjs` (after the P25-A block), the JW-A lines in the music walk block.

## What to send back
Write `project/research/p39-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure;
test gaps as TG1…; and `project/research/p39-faults-review.json`: 4–8 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) that the tests should catch, against
`node tests/story.test.mjs --games 50 --workers 1`. Say for each whether you expect it caught. Keep the report under about 8 KB.
