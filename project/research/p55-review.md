# P55-A + TB-A, the cold review (Opus, v0.11.287)

Read: the diff, `archive.js`, `archive.test.mjs` (A–F), the changed lines of `story.test.mjs` / `browser.py`, `coil.js` (endCoil, rewind, tabWhy), `coil_scenes.js` (the bite paths), the Fed writes (`game.js`, `tasks.js`), `threads.js` (ARC_AT, REGION_DONE). Ran: `archive` 58/0, `threads` 74/0, `appfiles` 11/0, `faq` 63/0, `/tmp/tb.py` `fails: []`, every save in `saves/` through the fill (scratch `/tmp/rv55`), and the faults below with `tools/mutate.mjs --cmd "node tests/archive.test.mjs"`. The story test was not run.

## What checks out
- **Drain:** every Fed fall over time goes through `fedPerHour`: `advance` (awake and the starving minutes, `/ ph`), `nightTo`, `sleepUntil`. The card's extra (`tasks.js` 365, 397, 549) and `qiFed` are untouched, as picked. The plan's forecasts (`week.js`, `tasks.js` dry runs) run deep clones through `advance`, so none of them assumes 3 an hour. No other code reads `SATIETY_PER_HOUR` for time.
- **Marks:** the hook runs with the threads' `!skip`. A rewind's wake scene (`fo_start`, `arrival`) is skipped but was marked the first time. `bl_region` is read on every entry and is idempotent. `ht_start` gives 4–6. The clones are deep, so the real game's `stats` is never touched. `rewind` keeps `stats` (also on a whole-game rewind).
- **Endings:** walked the real paths. The `collectors_lost` bite choice gives `coil_end` `t:lost`. The James tab's bite at `rt_taken` (endCoil + goTo `coil_end`) gives `a:taken`. A death goes through `goTo coil_end` too. The view also merges the live flags, so the ending of the current Coil shows before it is noted.
- **Save:** both fields are optional. The fill fills a missing field only and runs in `migrate` (every load). `badNums` and the `stats` readers have no trouble with the array. No ID or key changed.
- **View:** foes at 0 after `unmeet` are hidden. Every fight id in the story files has a name (21 found by grep, plus the test's 41). Insights show only once found, `coil.known` is carried across the act crossing (`game.js` 127) and by every rewind, and the arc names show greyed (as picked).
- **TB-A:** nothing reads the button's text except the new browser check. `FQ-e` only matches `<b>` names, and the browser test clicks by `data-tab`.

## Findings
### High
None.

### Medium
- **M1 `game.js` 1722–1727 (`archiveFill`):** an old save gets fewer marks than it has earned, and for a prologue save they are lost for good.
  - **Prologue saves:** the fill gives an Act 0 save 0 marks, even past `village` or `tribute`. Both are entered once per pass, and every Act 1 Coil wakes at `fo_start`, so marks 0 and 1 never come back short of a whole-game rewind. Measured: `v0.8.5-day7-tribute.json` loaded, then the tribute won and `fo_start` reached, gives marks `100`; it is still `100` after an Act 1 rewind. A new game at the same point holds `111`.
  - **Act 1 saves past `bl_start`:** they lose marks 3–8 until a later Coil reaches those scenes again. The owner's `2026-11-13-1356-incremental-a1_again.json` fills to 3 of 9, but its `g.seen` shows all 9 arc scenes.
  - **Fix:** fill from `g.seen`, which every rewind keeps (v0.11.35): OR in `ARC_AT[id]` for each id seen, plus `REGION_DONE` for `bl_region`. Keep the present rule as the floor for saves with no `seen`.
  - This changes the picked SV rule ("in Act 1: the prologue's 3"), so it is the owner's call.

### Low
- **L1 `README.md` 19:** it still says "**☰ Menu → Saves**". The game's FAQ and the error line were changed; the README wasn't.
- **L2 `tests/story.test.mjs` 5864, 6057, 10242:** the PR2, VQ1, PT1 and TG6 pins delete `stats.marks` and `stats.ends` before hashing. The checklist says "never strip the new field before comparing". Here it is measured and justified, but a wrong write to the two fields during those week runs now passes the pins. Only `archive.test` guards them.

## Test gaps
- **TG1:** no test walks the real ending paths: the `collectors_lost` bite choice, `rt_taken` with the James tab's bite (`tabWhy` + goTo `coil_end`), and "Accept it. Walk." to `a1_end`. Planted C2 (no noting on `coil_*` screens, so `t:lost` and `a:taken` are never kept) passes.
- **TG2:** "a card's extra is untouched" is pinned only by the bar's words. No `runTask` with 9 marks checks −(1.65 + 1) an hour. Planted C5 passes `archive.test`; whether the story pins catch it is unmeasured.
- **TG3:** the fill is tested only on fresh states (`p0` is a new game at `arrival`). There is no case with an old prologue save past `village` or `tribute`, and none with an Act 1 save whose `seen` shows later arcs (M1).
- **TG4:** the drain in `advance` is tested at whole hours. There is no case for a starving run that crosses empty within one card with a few marks, at the boundary (e.g. Fed 0.1, 3 marks, 15 min).

## Planted faults (`p55-faults-review.json`, run against `node tests/archive.test.mjs`)
| Fault | What it breaks | Expected | Measured |
|---|---|---|---|
| C1 | the hook also runs on a rewind's own first scene | caught | caught |
| C2 | no noting on `coil_*` screens | missed (TG1) | missed |
| C3 | Act 1 fill `m \|= 3` | caught | caught |
| C4 | `nightTo` back to the unmarked rate | caught | caught |
| C5 | a card's extra scaled by the marks | missed (TG2) | missed |
| C6 | foes at 0 listed | caught | caught |

4 caught, 2 missed, as expected. The browser check (`tab_bar`) can't be measured in a mutate copy.
