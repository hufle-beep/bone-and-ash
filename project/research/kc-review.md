# Cold review: v0.11.219 (KC1 = KA + KG), Plan the week keeps its counts

Opus, cold. Read: the brief, both checklists, `git diff HEAD` (week.js, coil.js, main.js, news.js, the tests), excerpts of week.js, kitchen.js, tasks.js, main.js. Probes in a scratch copy (`/tmp/kcrev`, `tests/kcprobe*.mjs`); faults through `tools/mutate.mjs` only. `check.sh` not run.

## Findings

**H1. HA through the view brings v0.11.218's H1 back for hand play, on every later stay and Coil.** `COOK_PLAN.row` now reads `planView`, so a cook row kept at 1 holds the pot until 15:00 with no plan made this week. A repeat cook not taken stays open every day after (its spacing), so the hold is daily. Measured: the stay after the first cook (21 days), no plan this week, "Rest an hour" tapped by hand until 18:00 each day, both hubs alike:

| kept cook row | pot meals | hammerspace meals |
|---|---|---|
| none (old save) | 20 | 40 |
| 0 | 20 | 40 |
| 1 | **2** | **58** |

Before KC1, no plan meant no hold (20 pot meals). Now a player who set the row once has the hold on every later stay and in every Coil (KG), whether or not they run the plan. The screen does show the row at 1, so it matches the letter of HA, but the effect is the bug v0.11.218 fixed. The old calendar and the first cook are not reached: `!longCal(g) || !g.flags[c.flag]` short-circuits first.
Fix directions (options for the owner): HA reads `planHere` again, so only a plan made this week holds the pot (v0.11.218 exactly); or the hold applies only while the plan runs (`p.running`).

**M1. A count changed mid-week keeps what is left, not the amount as set.** `planSet` writes `kp[key] = v`, and `v` is the week's remaining count, because the run counts `p.items` down. Measured on the wilds save: kept Forage 3, 2 run (left 1), the player taps + → kept **2** (not 4). Tapping − to 0 to skip the last one this week **deletes** Forage from what is kept, so next week starts with Forage 0. KA says "each row's amount as set … not what is left this week", and the screen offers the left count to adjust. The old-save rule ("its counts as left" on the first change) has the same root: a card finished before the first change is dropped for good. This needs the owner's word. Options: keep += delta for cards (each tap moves the kept amount by its own ±1); or the row shows and edits the kept amount, with "left this week" as a note.

**L1. The order flips between weeks after a count runs out and is set again.** With no places set, `oldPlace` reads `p.items`' key order. The run deletes a card from `p.items` at 0; setting it again appends it to `p.items`, but `keep` keeps its old position. Measured: Forage, then Train set; Forage run out and set again. This week's order is Train, Forage; next week's (rebuilt from `keep`) is Forage, Train. Only without places (PK1 overrides it).

**L2. A kept card not on the screen still counts for the panel.** For example, a card not open in this Coil yet, or `workshop:0` from the test. `planEmpty(pv)` is false, so every visible row shows 0 but the button reads "Run the week" (the run then rests the week out). The total reads "Cards 0 m; 48 h 20 m left…", and **Clear** is offered. Tapping Clear wipes kept amounts the player cannot see. Measured with `keep = { wilds: { 'workshop:0': 2 } }`.

**L3. A one-off door tapped by hand but skipped by the routine is kept 0 for good.** `noteCardTap` runs before `runTask`. When the routine takes the time (`skipped`, e.g. a tap at 18:56), the door is not taken, but `keepTaken` has already zeroed the kept row. Before KC1 this only touched the week's row (RV1 L3); now it lasts across weeks and Coils.

**L4. A one-off taken by another route stays kept at 1.** `heal` and `village_hunt` can also be taken from the prologue's `village` (prologue.js 587–588, not a week hub), so `keepTaken` never runs. The Ashfall row then shows "1 · once", closed, for the rest of the Coil. In a Coil where it isn't taken in the village, the plan takes it on its own. This follows KA/KG, but it should be named to the owner.

Checked and fine:
- The forecast's dry run works on a JSON clone. `planNotes`, `planRanks`, `doorCards` and `planCount` with no plan leave `JSON.stringify(g)` unchanged (measured).
- `planView` is never stored, and no caller writes into it: `weekHtml` writes only through `planEnsure`/`planSet`/`planClear`.
- Cost: the hot path (routine → `potCookDue`) only builds a plan when there is none, and the forecast's runs always have one.
- The bots: `p.items`/`p.med` are emptied after `planEnsure`, `p.doors = {}` as before, and they never set a door through `planSet`, so their kept doors are only `yk_time`.
- Old saves: no `keep`, a `keep` of the wrong type (replaced on write), another hub's keep (per hub), bad values (clamped). No ids, flags or storage keys changed.
- The rewind keeps `keep`.

## Test gaps

- **TG1** The run's own one-off door (`runWeek` → `keepTaken`) is untested. Only the hand and read-tap paths are (R1 missed).
- **TG2** HA through the view: nothing pins whether a kept cook row holds the pot with no plan this week (R2 missed). Pin the owner's answer to H1 with the 21-day hand-played count above.
- **TG3** The panel before the week's plan: `planNotes`, `doorCards`, `planRanks` and `planPrio` on the view are untested (R3–R6 missed). "Nothing saved by looking" is checked for `planView`/`planCount` only, not for `planNotes`/`forecastNow` (R8 missed).
- **TG4** The main.js source test's `/planEmpty\(pv\)/` matches either of the two uses. Reverting the button's (R7) passes. Assert the button's text on a kept plan, or match both.
- **TG5** A read tap's card countdown into `keep` is untested. The KC1 block reads `noteReadTap` for a door only (the author's F3 missed).
- **TG6** No test for a count changed mid-week after a countdown (M1), or for the order after a re-set (L1).
- **TG7** The PR2 and VQ1 pins strip `keep` (`noKeep`, `strip`): the checklist's "never strip the new field" (v0.11.211 TG2). It is fine here only because the KC1 block checks that the run leaves `keep` unchanged, and only on the wilds. Ashfall and the Fallout's runs are unchecked for it.

## Planted faults (`tools/mutate.mjs`, `story.test.mjs --quick`)

- **The author's** (`kc-faults.json`): **11 of 12 caught**. Missed: **F3** (a read tap's card countdown written into `keep`) = TG5.
- **Mine** (`kc-faults-review.json`): **0 of 8 caught**.
  - R1, the run's door not kept 0: TG1
  - R2, `COOK_PLAN.row` → `planHere`: TG2
  - R3, `planNotes` → `planHere`: TG3
  - R4, `doorCards` → `planHere`: TG3
  - R5, `planRanks` → `planHere`: TG3
  - R6, `planPrio` without the view: TG3
  - R7, the button's `planEmpty(p)`: TG4
  - R8, `planNotes` → `planEnsure` (looking saves the plan): TG3
- **In all:** 11 of 20.

## New checklist lesson (for `review-checklist-code.md`)

- **A view of the next state read by a rule (v0.11.219 H1):** a rule that read "the plan made this week" and now reads a view built from kept settings fires in weeks with no plan, and for hand play. Measure the rule's effect with no plan made, not only with one.
