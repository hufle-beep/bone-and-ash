# Cold review: v0.11.228 (RE1 = SC + CC + DR + NW), the read stop's cap

Opus, cold. Read: the brief, both checklists, `git diff HEAD` (week.js, coil.js, game.js, faq.js, news.js, the RE1 block, README row), and excerpts of `readProbe`, `noteReadTap`, `runWeek`, `planForecast`, `rewind`, `coilSnap`, `migrate`/`serialize`, `main.js` runPlan/stopText, `tools/browser.py` week_read/rd1_ui, `yuki_time.js` YT_HUBS. Experiments in `/tmp` copies only.

**No H or M finding.** The code does what the brief says. Measured below. Five low findings and seven test gaps.

## What I measured
- **Forecast against the real run (brief point 1):** wilds Day 2 with sit, session and Qi at 1 a day. Under the cap, the forecast says `read`, Day 8 (min 10560), and the real run says `read:mer:pri` at the same minute. With `med` at its cap (3 keys), the forecast says `story` at min 20223, and the real run goes through 7 evenings to the same minute 20223 with no read stop. They agree. Both run `runWeek` on a state holding `readStops` (the forecast clones the whole save, and `probeClone` keeps `readStops`, which the probe never reads because `probe:false`).
- **A stop not tapped (point 2):** wilds, Forage ×7. The plan stops (key `gns8zz`, "Leeches. +2 River cress anyway."). An hour of Qi by hand instead of the tap, then Run again: the same first line, the same stop, no new slot. Tap it, run again: the evening, 1 slot used in all. The probe is deterministic at a given state (rng kept), so a slot is only spent again when the item's first unread line really changes (another row of `med` first, a time-of-day variant).
- **Per-item counts in play:** 4 Sociable games, `--cal 7`, an instrumented copy that logs every slot noted. No item went past 3 in a game. The stops: carried work's results (`workshop:*`, `drill:*`, `fo_palisade:*` through `week:carry:`, folded correctly), `med` 3 (the Lung, Large Intestine and Stomach sessions, then nothing), `wilds:15` / `ashfall:25` (Smoke, different texts per hub).
- **Rewinds:** `rewind` is the only place that replaces the whole state (grep `Object.assign(g,`). The act's rewind (`c.snap`) and the whole game's (`coilSnap(newGame)`) both build `base` and then copy `g.readStops`. `coilSnap` deletes it, so no snapshot holds it. `liftKept` doesn't touch it. `migrate` and `serialize` have no key whitelist, so `readStops` goes through a real save. A broken record (an array, a string under an item) is read as none and replaced on the next note.
- **The browser's `week_read` helper** (mirrored in node on `saves/v0.11.204-long-wilds-day2.json`): it makes 3 stops on its clone (wild_forage:0 ×2, wilds:14 Yuki ×1). The real run on the saved file goes `evening, hungry`, with the forecast at `hungry`, the same as with no cap.

## Findings

**L1. `week_read` (tools/browser.py) counts stops on its clone.** The helper loops `runWeek` on `c` and notes only `readProbe`'s lines. With the cap on, once one item makes a 4th stop on `c`, `runWeek` doesn't stop for it and its lines are never noted in `g`. The saved file (with no `readStops`) then stops the browser's real run on those lines, and `plan_forecast` / `rd1_ui` fail ("did not stop"/"stopped before"). The save in use today makes 3 stops, so this doesn't happen yet. Fix: set `READ_CAP.n = Infinity` in the helper's script, or note `r.days` lines too.

**L2. The numbers disagree.** The `week.js` comment says read stops went 70/70/59/91 → **42/42/34/35**. The brief and the README row say 71/71/59/91 → **43/42/35/34** (the Completionist and Cultivator are swapped). Pick one run and quote it in both places.

**L3. The same-stop exception lets an item stop more than 3 times.** `readCapOk` lets a stop through when its first line is in `had`. If the player taps the card at another state (after a meal or a check roll, so a different result), the probe's recorded line stays unread. It stops again each time that line comes up first, with the item at its cap. The FAQ promises "at most three times for each card in a game". This is bounded by player behaviour and I didn't see it in my runs. Noting it because the record counts distinct first lines, not stops.

**L4. Doors are counted by `hub:index`.** Yuki's daily door (`yk_time`) is on 13 hubs, Old Wen's and the mother's visits on 3, Rest on 7, Smoke on 4, so each gets 3 stops per hub. That is mostly right: YT_HUBS gives every hub its own texts, and Smoke's texts differ per hub. One exception: the Heart has 5 Yuki slots (the 5th kept for the last day, `byDayLast`). Past 3 stops there, slots 4 and 5 would go to the week's report and not stop. My one Heart week reached only 1 stop, so this isn't measured to the end. Worth a look before the owner reads the Heart on the long calendar.

**L5. Lines past the cap are never read.** That matches the brief, and nothing else misreads it. `main.js` notes only tapped lines (`land`), the report is `addResult` with no `noteLines`, the forecast's notes only show `STOP_TEXT.read` on a real stop, and `rd1_ui` uses its own save. The one effect: a scene or door whose text the player saw only in a report shows unfolded (not "read") when they later tap it by hand. That fits "never shown on screen". No change needed. Recorded so a later fold rule doesn't treat report lines as read.

## Test gaps
- **TG1: the shipped cap of 3 is pinned nowhere (F1 missed).** The story test sets `READ_CAP.n = Infinity` at import, and the RE1 block sets it to 3 itself, so `{ n: 4 }` (or 30) passes. Record the module's value before the override (`const CAP0 = READ_CAP.n`) and assert 3. This is the owner's number ("three texts max").
- **TG2: the whole game's rewind (`to: 'game'`) is caught only by the source-text pin.** R1 was caught because it edits the pinned line. R6, the same fault written after `liftKept` (`if (whole) delete g.readStops`), is missed. Add a whole-game rewind (`c.act = 1`, `rewind(g, { to: 'game' })`) to the CC test.
- **TG3: doors at their cap are caught only by the source pin.** R5 was caught by the pin, and R7 (`readCapOk` returning true for `door:` keys) is missed. No test walks a door's read stops past 3. Walk a repeating plain door (the cook's repeats `pot_cook`, or Yuki's on one hub) with the cap at 1 or 2.
- **TG4: forecast against the real run at the cap (R2 missed).** The forecast clone without `readStops` stops where the real run doesn't, and nothing compares them. Add `planForecast(g).stop` against the real run's first stop with `med` at its cap: today `story`/20223 on both.
- **TG5: `med:pres` is missing from the items test (R4 missed).** Grouping Smoke with meditation passes. Add `['wilds:15', 'med:pres', 'wilds:15']`.
- **TG6: the What's new line's number is unpinned (R3 missed).** "three" → "five" passes `news.test`. The FAQ sentence is pinned in the RE1 block, but the news line isn't.
- **TG7: the CC "Coil 2" test builds Coil 2 by hand** (copies `read`/`readStops` into a new game at `coil.n = 2`), so it tests `g.read`'s rule, not the rewind. And `h.readStops.med.length === 1` only reads its own copy. Through `endCoil` + `rewind`, check that an item capped in Coil 1 doesn't stop for a new line in Coil 2.

## Planted faults
- **Brief (`re1-faults.json`, 12),** `node tests/story.test.mjs --games 2 --workers 1`: **11 caught, 1 missed (F1, TG1).** F7 is caught by a crash (`JSON.parse(undefined)` in the walk), not by an assertion.
- **Mine (`re1-faults-review.json`, 7),** with `news.test` and `faq.test` added before the story test:

| Fault | What it breaks | Result |
|---|---|---|
| R1 | whole game's rewind drops the stops (on the pinned line) | caught (source pin only) |
| R2 | forecast clone without `readStops` | missed (TG4) |
| R3 | What's new "three" → "five" | missed (TG6) |
| R4 | Smoke counted with meditation | missed (TG5) |
| R5 | doors uncapped (on the pinned line) | caught (source pin only) |
| R6 | R1 written after `liftKept` | missed (TG2) |
| R7 | R5 written in `readCapOk` | missed (TG3) |

**Total: 13 of 19 caught. 2 of those 13 by the source-text pin only.**

## Checks run
The brief's fault list and mine through `tools/mutate.mjs --jobs 1`, plus `node tests/story.test.mjs --games 2 --workers 1` once in a copy with R5+R1. Also scratch scripts (forecast/run, untapped stop, browser helper mirror, Heart week) and `tests/models.test.mjs --cal 7 --model sociable --games 4 --off 0` on an instrumented copy. I did not run `check.sh` (it is running elsewhere).
