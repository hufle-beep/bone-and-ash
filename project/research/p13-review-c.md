# P13-A cold review, reviewer C (code, tools, tests), v0.11.241 working copy

Scratch copies `/tmp/rv-c-clean` (clean) and `/tmp/rv-c` (an env-gated hook in `seqText` and `laterDayAgain`, for counting only). Runs: `story.test --games 2 --workers 1` once (193,943 passed, 0 failed); models `careful,sociable,completionist,cultivator --texts`, 3–5 games each on both calendars; `tools.test` once in a git copy; the two mutate runs below. Probes walked with `goTo` / `choose`.

## Findings

**M1. FS10 shows before the plan when the supper is entered after midnight on story day 9's last day (long calendar, hand play).** The new branch reads `dd(g)` (`storyDay`, the calendar day from midnight). The day records read `textDay` (from 05:00). `fo_ashfall`'s "Evening" shows at `hour(g) >= 16`, which includes 24–27. Walked: Day 57, 23:41, `fo_ashfall` → "Sit with Yuki." → "Go on." → "Evening" → `fo_supper` at Day 58 00:21. It shows **FS10[0] (the travel cakes, "a traveller's food")** with `fo_plan` false, so the night before Old Wen's plan, Ya's price and the knife. With Evening tapped straight at 23:41 → 00:01: the same. The week then runs D58–62 FS10[1–5] and **D63 FS10[0] again (index 6, folds)**. v0.11.240 on this path read `fo_supper:9` index 7 (an old Ya text, no plan in it), so the spoiler is new; the mechanism is §10's (open). Bots on the long calendar: 0 of 20 games here, 0 in p13's 40. A hand player who stays up on Day 57 gets it.
- Fix shape (options to the owner): (a) `longCal(g) && textStoryDay(g) === 10` (already exported in the file; matches `seqText`'s record; the after-midnight supper then reads `fo_supper:9` index 6, as it did before); (b) add `&& g.flags.fo_plan` (the texts' own premise; always true at a real day-10 supper at 19:00). Either way the P13-A tests fake day 10 without `fo_plan` and set `g.scene` directly: my C8 (guard (b)) was "caught" by 3 failures that are the fake states', not a fault's. So (b) needs its tests to set the flag.

**M2 (already fixed in the working copy while I reviewed). A stale pin in `tests/tools.test.mjs` failed on the copy as handed in:** P8-A RV1 (TG-C4) (line ~1245) asserted a packet block tagged "village week 2, day 4 …; … village week 3, day 4 …" ("week 2 and week 3 share the later suppers"), which SW3 ends. It wasn't in the brief's list of updated pins. In my copy: 545 passed, 3 failed (TG-C4, plus E1 and LR on the text snapshot, 5 log-only changes); mutate's copy counted 5. By the end of my review the working copy had it updated (week 2's block with "The potter's hen", week 3's with "trimmed to a bead") and `tools/text-baseline.json` changed. I have not re-run `tools.test` on that.

**L1. FS10's six `away` lines are dead text in a real game.** `ya_met` is set only at `ya_meets`, and story day 9's first `fo_morning` offers only "Look." (`dd === 9 && !yaHere`). So every story-day-10 supper has Ya. Bots: 120 FS10 renders, 0 without Ya. The packet doesn't draw them either (`packet.mjs` STATES: day 10 with `ya_met` only; 0 of the 6 `away` lines are in `/tmp/p13/review-packet.txt`), so no reviewer read them. Harmless (`fs9` needs a value), but the textlint change exists only to lint them.

**L2. The old calendar: unchanged, measured.** Bots on the old calendar render no `fo_supper:10` or `supper:6`. The new branches are behind `longCal`. §10's midnight supper is still there, untouched (`fo_supper:9#0` at text day 8 in 5 of 26 renders). The village supper has no such mismatch: `vday` is a flag moved at the morning, not by the calendar.

## Questions in the brief, answered
- **A v0.11.240 save mid-week** (`s:fo_supper:9` at 7–12, or `s:supper:5` in week 3): the new keys start empty, so the next supper reads text 0, then on in order. No repeat. FS10[4–5] / SW3's later ones are skipped for that save only. Probed: old record D51–59, then Days 60–63 → FS10 0,1,2,3. VF keys on scene|text hash, so the new texts never fold against the old ones. A save resting on `fo_supper` redraws the new text with no fold (`vfFold` was the old text's key).
- **Ya met mid-week:** impossible on day 10 (above). Day 9 meets her on its first morning.
- **`byForm` order / texts without `{yuki}`:** `sw3` is correct. The test checks each form's slot and no leftover `{yuki}` (F7, F8 caught).
- **The fold:** bots fold no week-3 or day-10 supper now. They fold only the sevenths of weeks 1–2 (text days 28, 35) and of story days 8–9 (50, 57). `lines.vd` peaks at 254 of `VD_MAX` 600 (long) and 145 (old), so no crowding.
- **Others reading the old sequences:** `kitchen.js` / `supperPot`: `kitchen_seen` is 0 or 3 for the whole Fallout in every bot game, so no pot stage is lost with the old texts' day-10 reruns. `house_time.js` reads only `supper@` flags. `again.js`: as above. `textlint` and `packet.mjs` STATES: L1, TG-C3. The models test passes (18/18 each calendar).

## Test gaps
- **TG-C1: no old-save test.** Nothing loads a v0.11.240 day record (`s:fo_supper:9` or `s:supper:5` past 7 days) and reads the next suppers. My C6 and C7, which make that save read the new texts by the old count (out of order, from index 1 or later), pass.
- **TG-C2: no walked case.** Every P13-A case fakes the clock and `g.scene` and calls `SCENES.x.text`. None takes the real Evening choice, sets `fo_plan`, or crosses midnight, so M1 passes. A walk at Day 57 23:41 → Evening (expect no FS10, or FS10 only with `fo_plan`) and one at Day 58 19:00 after the plan would pin it.
- **TG-C3: the textlint change is unpinned.** The source pin in `tools.test` matches only `for (const day of [44, 51, 58]) for (const k of [0, 1, 2, 3, 4, 5])`. Reverting the new `ya` list (C9) would pass. I couldn't measure it because `tools.test` failed before planting on my copy (M2). The current working copy's update to `tools.test` doesn't add this pin.
- **TG-C4: the packet's STATES lack story day 10 without Ya,** so the `away` lines never reach a review (L1). If they stay, add a state; if they go, drop the textlint change.
- **TG-C5 (minor):** the order tests compare with the `FS10` / `SW3` arrays themselves, so reordering the arrays passes. The brief's and the news line's order (cakes first; the bowing lesson first) is pinned only by the D1 phrases.

## Planted faults (`tools/mutate.mjs`, `node tests/story.test.mjs --games 2 --workers 1`, `--jobs 1`)
- **Claude's F1–F11: 11 of 11 caught** (1–6 failures each).
- **Mine** (`project/research/p13-faults-review-c.json`): **6 of 8 caught.**
  - Caught: C1 FS10 reversed; C2 SW3 five texts; C3 the Ya label on day 10; C4 an `away` removed (a TypeError); C5 week 2's seventh reads SW3; C8 a `fo_plan` guard (see M1: caught by the fake states).
  - **Missed: C6, C7** (old-save count, TG-C1).
- C9 (the textlint revert, `/tmp/rvc-probe/c9.json`) against `tools.test`: not measurable, because the command failed before planting on my copy (M2).
