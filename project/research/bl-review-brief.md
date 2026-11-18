# Cold review brief: v0.11.222 (owner pick J2 = MH + K3 + SV + TL + HN): the Blackroot's camps, three days a story day

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check is running already); `node tests/story.test.mjs --quick` in a scratch copy is fine (about a minute).

## What was picked (the owner's words and picks)

The owner 2026-11-17 22:00 (TS9): "the journey to the Heart Tree is too quick as well. I think we should stretch that out too by turning the days/stays into hubs of at least a few days or figure out a way to have more time elapse … to illustrate the stretches of land that need to be covered." On the long calendar (a test switch; `g.cal === 7`) every stay's story day is a week, but the Blackroot (story days 11–15: the Root Road 11–12, the Drowned Wood 13, the Ashen Hills 14–15) kept one day each. Picked 2026-11-18 14:17, **J2**:
- **MH:** each Blackroot story day lasts K days at its camp: the cards (Forage, Hunt, Scout, Practice, the talks, Yuki's lane) once a day as now; the story day's night event on its last night (5 as before), the nights before it quiet; the split (the wyrm), the hollow (the Drowned) and the pass (the rot-ape) on the same story days, on their last day.
- **K3:** three days a story day: the Blackroot 15 days (Days 65–79), the Heart from Day 80, the Elder on Day 103 (93 before).
- **SV:** a new save field `calBl`: new long-calendar games 3; an old long-calendar save before the Blackroot (the prologue, story day ≤ 10) filled with 3 on load, one in or past the Blackroot 1 (the 5-day road); no clock moves; old-calendar saves untouched.
- **TL:** the texts that count the Blackroot's days (Ya's "Five days in", "Day two … the road ends today", the four morning lines by `bl_day`, the return's "nine days" lines) wait for TS6; until then they repeat on the quiet days. Not a fault to report.
- **HN:** two roadmap notes (docs only).

Measured before the pick (scratch builds, 40 games each, the four models, log only): Blackroot taps a pass 89 / 110 / 127 / 146 → 254 / 311 / 381 / 530; the ape's deaths 15 of 55 / 9 / 5 / 0 → 0 for all; the Cultivator's realm at Act 1's end Golden Core → Origin Core.

## How it is built

`js/core/calendar.js`: `BL_DAYS`, `BL_SPAN`, `blSpan(g)`, `span` (the Blackroot's days by `blSpan`). `js/core/game.js`: newGame writes `calBl`; `blFill` (the end of `migrate`'s chain). `js/core/coil.js`: a rewind keeps the save's own `calBl` (the snapshot may be older than its fill). `js/story/act1_blackroot.js`: `blN` (`g.flags.bl_n`, the nights slept this story day), `blLastDay`, `sleepTo` (every `to: 'bl_night'`), the camps' and the pushes' `show`, `bl_morning`'s turn, two appended "Get moving." choices (the walks' marks in `walks.js` index `bl_morning` 0–3), `bl_start` resets `bl_n`. `js/main.js`: the main menu's note (Day 103). `js/core/news.js`: a What's new line.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): the files above, `tests/story.test.mjs` (the TS9 block at the end; TS1's days; PR2's and VQ1's pins strip `calBl`), `tests/README.md`. My planted faults: `project/research/bl-faults.json` (13).

## What to look at especially

- Every reader of the calendar past Day 64 (`calStart`, `calEnd`, `storyDayOf`, `storyDay`): the Fallout's "N days to the Elder", the Heart's Day 19 jump, the road home, the Elder's day, the FAQ, the hint lines, `week.js` / `tasks.js` (`STAY_LAST`, `stayOf`, `workDay`): anything that assumed 5 days?
- The camps by hand: every combination of `bl_day`, `bl_n`, the region and the hour: a screen with no way on (the wood's last day before the hollow; a fight lost or fled at night (`flee: 'bl_morning'`); `ape_lost`; the Yuki path's camp scenes (`yuki_path.js` splices into `bl_camp`); `mei_bond`, the raft, the spring), a story beat that can come twice or never, a night event on a quiet night.
- The once-a-day and once-a-Coil keys (`daily`, `onceADay`, `markDaily`, `relToday`, `byDay`, `dayReply`, `coilReply`): with 15 days, anything that runs out, repeats wrongly or keys on `bl_day`?
- SV: `blFill`'s test (the prologue or `storyDay ≤ 10`): a save mid-way through the Fallout's last evening, a Long Forest save, a save mid-fight, a save on the Coil screen; `coil.snap` and the whole game's rewind; `deserialize(…, { force: true })`.
- The bots (`tests/models.test.mjs --cal 7`), the browser part if it touches the Blackroot, any tool that reads scene targets (`to` as a function).
- Test gaps (`tests/story.test.mjs` TS9 block) and whether my faults are caught: `node tools/mutate.mjs project/research/bl-faults.json` (each in a scratch copy against `tests/story.test.mjs --quick`). Add your own faults in `project/research/bl-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/bl-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
