# Cold review brief: v0.11.225 (owner pick LO2 = RL + RS + PE + WM + SN + OL + FD + BK): the plan's leftovers

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run); `node tests/story.test.mjs --quick` in a scratch copy is fine (about a minute).

## What was picked (2026-11-18 22:10, "LO2 go")

The long calendar (a test switch, `g.cal === 7`): every stay's story day is a week, with Plan the week (`js/core/week.js`). The plan's leftovers (t's queue item 4 on `project/roadmap-time.md`), measured before the pick (four long-calendar bots, 10 games each, and runs on the saves in `saves/`):
- **RL** (docs): the owner's 10:16 items were done in v0.11.210; the roadmap line closed.
- **RS:** a plan run showed no relationship change (its Results are the cards' lines; main.js `land` adds them only for a tap). 15.5 / 15.5 / 6.4 / 3.7 runs a game moved someone's friendship or affection (Careful / Sociable / Completionist / Cultivator), Yuki's daily sits too. Now each step's change is said with its day's lines, in `relLines`' words ("Yuki: friendship +3, affection +3"). Never a stop: the owner's v0.11.214 rule (RD1 + NL) stops the plan for text not read yet, never for number lines.
- **PE:** a plan with only door rows set read "Rest out the week", no Clear (every new plan: Yuki's row is at 1). Now a door row set counts for the button and Clear; the total line still reads the cards only.
- **WM** (balance): after the barley wolves were lost (`g.flags.wolf === 'lost'`), every `fo_morning` took HP to 85%: 2 mornings on the old calendar, about 20 on the long one. Now only the mornings that open a story day (9 and 10): 2.
- **SN:** a card closed only by its spacing (13 repeating doors, the wilds' 12 work cards once Skilled; each gone 2 days in 3) vanished from the hub; only its plan row said "opens Day N". Now it shows on the hub, closed, with that note.
- **OL** (the v0.11.219 review's L4): a one-off door (the coughing house, the boar hunt) taken in the prologue's `village` (not a stay) left Ashfall's kept row at 1: a closed "1 · once" row for the rest of that Coil. Now a one-off door taken on any hub zeroes its kept row on every stay.
- **FD:** a door card's time left out the day's routine when it came first (60 min on all four wilds doors: "Sit with Yuki" 10 min, the tap 70). Now its dry run takes the routine first, as a work card's always did.
- **BK** (bots only): the long-calendar bots start each week from the kept amounts (KC1), a tap only for a row that differs: taps a game 1,063 / 1,145 / 1,128 / 1,323 → 931 / 1,014 / 1,053 / 1,275.

Not picked (not faults): KR (the row showing the kept amount), BD (the bots' daily doors on the plan), MS (meridian texts not stopping), BP (the plan on the Blackroot's camps).

## How it is built

`js/core/week.js`: `RS1` (a switch: the tests from before turn it off), `runWeek`'s `relSay` in `watch` (a JSON copy of `g.rel` and the Coil key per step; option `rel`, false in `readProbe`), `planDoorsShown`, `spacedClosed`, `keepTakenAll`, `noteCardTap` returning on any hub, `noteCardDone`. `js/core/calendar.js`: `firstOfWeek`. `js/story/act1_fallout.js`: `fo_morning`'s enter. `js/core/tasks.js`: `taskOutcome`'s door branch (`dayRoutine` on a clone, not while `routineBusy`). `js/main.js`: the button (`planDoorsShown`), the spaced cards pushed into the hub's cards (status `'spaced'`, tag = the note, disabled). `tests/models.test.mjs`: `weekRun` (BK) and one assertion. `js/core/news.js`: a What's new line.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): the files above, `tests/story.test.mjs` (the LO2 block at the end; `RS1.on = false` at the top; KC1's panel pin), `tests/README.md`. My planted faults: `project/research/lo2-faults.json` (14; F14 is in the models test: run it with `--cmd "node tests/models.test.mjs --model careful --cal 7 --games 10"`).

## What to look at especially

- RS: the forecast (`planForecast`, a dry run of `runWeek`) and anything else that hashes or compares a run's day lines; a step that rewinds or ends the Coil inside a run (`coil_end`); `g.rel` keys hidden from the player (`REL_HIDDEN` in game.js: are hidden relationships said now?); the stop's own step (a talk answered by the player: said twice, once by the run, once by `land`?); the cost per step (`runWeek` 600 steps).
- WM: every way to `fo_morning` (the wolf night's own "Bandage the arm. Sleep.", the fold of the quiet mornings, a rewind, an old save loaded mid-Fallout); is "the mornings that open story days 9 and 10" what the old calendar did?
- SN: `spacedClosed` against `doorCards` and `cardNote` (the same day said?); a card both spaced and closed for another reason (night, `late`, Ya not here, a one-off); the hub's groups (a group with only closed cards; Yuki's door); clicks on a disabled card; the PC column.
- OL: `noteCardTap` now returns for every hub: `main.js doTask` callers; the plan's own `keepTaken` paths; the old calendar (no keep).
- FD: `taskOutcome` for a door on a non-stay hub, at night, with no Qi for the sit, on the old calendar; the "Collapses here" warning; `nightCards` / `taskMinutes` callers that still use the old time.
- BK: a kept card not open this week; the models test's other numbers.
- Test gaps (the LO2 block) and whether my faults are caught: `node tools/mutate.mjs project/research/lo2-faults.json`. Add your own faults in `project/research/lo2-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/lo2-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
