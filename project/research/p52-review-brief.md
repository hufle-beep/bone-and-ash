# P52-A — the cold review's brief (v0.11.284; owner pick P52-A, 2026-11-26 23:40: "P52-a go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`;
the game part also in `/tmp/p52-diff.patch`). Do not commit, push or edit any file outside `project/research/`. Read `CLAUDE.md` (the
hard rules), `project/review-checklist-code.md` and `project/review-checklist.md` (the task-mode line) first; read excerpts only (grep,
line ranges), never whole story or test files. Do not run the full check, the models or the task test (Claude runs them); single unit
tests are fine (`node tests/appfiles.test.mjs` takes seconds; `node tests/story.test.mjs --games 2 --workers 1` about 3–4 minutes, at
most once). The machine has 2 cores and another job is using them. For experiments make your own scratch copy (`cp -r` to /tmp/rv52).
Real game states at the three camps (a Careful bot's first Coil, 06:15–08:25): `/home/claude/p52/at-rr_hub.json`, `at-dw_hub.json`,
`at-ah_hub.json` (load with `JSON.parse`; `js/core/week.js` `runWeek`, `planStep`, `planNotes` work on them directly).

## What was picked (G2, the plan; `claude/p52-options.md`, `project/research/p52-measure.md`)
No balance change intended: the bots never use the camp plan (`tests/models.test.mjs` plans only on `weekHub`), and a card tapped by hand
at a camp must play exactly as before. No new save field: the existing `g.tasks.plan`, `keep`, `prio`, `routine` under the camp's hub id;
a camp plan carries `day: true` and `dayOf`. No ID changed.
- **KR-k** (`week.js` `planShown`, `planStep`; `main.js` `weekHtml`'s rows, `leftNote`, the − / + handler): a card row's number is now the
  amount kept (`g.tasks.keep[hub]`, what each new week starts with), and what is left this week (`p.items`, counted down by each run) is
  its note, "N left this week" / "none left this week", where they differ. − and + change the amount kept and what is left by the same
  step, each clamped 0–9 (before: the number was what was left, and + on a row run down to 0 kept one more for every later week).
  Meditate and door rows step as `planSet` did. `planSet` and `planCount` are unchanged (the bots and older tests use them).
- **BP-d** (`tasks.js` `CAMP_HUBS`, `CAMP_RUN`, `routineHub`, `weekCards`' camp branch marking `c.day`; `week.js` `campHub`, `planHub`,
  `CAMP_DOORS`, `doorDaily`, `planHere`'s day refresh, `newPlan`, the `runWeek` wrapper over `runPlanSteps`, the evening stop, the
  forecast and notes; `main.js` "Plan the day", "Run the day", the run's result lines): the Blackroot's three camps (`rr_hub`, `dw_hub`,
  `ah_hub`) get a plan by the day: the camp's menu work cards (×1 time, no carry), the Meditate rows, Smoke, Rest, and the doors (the
  hunt, the two talks, Yuki's) once a day, kept per camp for good; each new waking day at the camp starts from the kept amounts and forgets
  yesterday's stop. "Run the day" runs them with the day's routine (R1 meals under Fed 85, R2 the day's sit; only while the plan runs:
  `CAMP_RUN.on`), rests the rest of the day to 16:00 (`EVENING_HOUR`), and stops `evening` there, still running, so after the player
  makes camp and takes "Another day here." the plan goes on by itself (`weekResume` via `afterStory`). A camp's door taken stays set
  (`doorDaily`; `noteCardTap` no longer zeroes it).
- What's new `0.11.284`. **Tests:** `tests/story.test.mjs` the P52-A block at the end; four older pins re-pinned (search `P52-A`).

## Questions worth your time
1. Hand play at a camp unchanged? Any path where `CAMP_RUN.on` stays set or leaks (a throw, the read probe's clones, `taskOutcome` /
   the dry runs, the forecast on a copy), or the routine's shared `g.tasks.routine` record changing what a later hand tap does that day.
2. The camp day across the night and the story days: `bl_camp` → `bl_night` / the night event (fights) → `bl_morning` → the hub; the
   story day's last day ("Push on…" shows all day), the region change (`rr_hub` → `dw_hub`), the Ashen Hills' women away
   (`ya_offended`), a breakthrough or a fight stop; does the plan resume where it should, and never where it shouldn't (a stale `running`)?
3. `planHere` now writes the day's refresh into the save when read (the screen calls it): any harm (the forecast's memo key, a dry run on
   a copy, an old save)? A plan from a stay meeting a camp, or the reverse (`!!p.day !== campHub(g)`).
4. KR-k's numbers: a mid-week Clear, a one-off door, the kept order (LO), a card not open, an old save with no `keep`; what the player
   reads on the row and what the next week starts with.
5. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p52-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p52-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) the tests should catch, against
`node tests/story.test.mjs --games 2 --workers 1`. Say for each whether you expect it caught. Keep the report under about 6 KB.
