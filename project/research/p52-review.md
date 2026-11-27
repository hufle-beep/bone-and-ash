# P52-A cold review (v0.11.284; Opus, not seen being built)

Read: `git diff` (news, tasks, week, main, story test), `CLAUDE.md`, both checklists; excerpts of `act1_blackroot.js` (camp hubs, bl_camp, bl_morning), `common.js` (spacing, eatBest), `tasks.js` (dayMeal, dayRoutine, runTask's head). Ran scratch scripts on `/tmp/rv52` with the three real states (READ_STOP off where noted; `p.bt` set to skip the ready breakthrough). No full check, no story test run.

## Checks out
- **Hand play at a camp (Q1):** `routineHub` needs `CAMP_RUN.on`. Only the `runWeek` wrapper sets it, and only when `planHere(g)?.day`. The `try/finally` restores the earlier value on a throw and on nested calls (the read probe's clone, the forecast's copy). `taskOutcome`'s door estimate and main.js `doTask` run with the switch off, so a hand tap gets no meal and no sit. `g.tasks.routine` written by a camp run is never read by a hand tap at a camp, and no stay falls on the same waking day. `c.day` has no other reader. Stays are unchanged: `fire` is still true off the wilds, and `planHours` ×7/7 is whole-number exact.
- **Nights (Q2), walked rather than jumped:** I followed the real path with storyTap and afterStory. Run → `evening` 16:00, running → Make camp → bl_camp (no resume) → Sleep → bl_morning → "Another day here." → resume, with today's items refreshed from keep. rr ×2, dw ×3 and ah ×2 all behave. The story night goes to bl_night_event; the fight is the player's. A breakthrough or `story` stop clears `running`, so there is no resume after it. The region change does not resume (the hub differs). `ya_offended` hides `talk_ya`'s row and the plan skips the beat.
- **Write on read (Q3):** `planView` runs before `forecastNow`'s key, so the memo key is taken after the refresh. The copy and probe refresh only themselves. A stay's plan at a camp, or the reverse, is dropped by `p.hub`; `!!p.day` is redundant but harmless. An old save without `keep` shows the amount left (as before).
- **KR-k (Q4):** steps keep left ≤ kept. Clear zeroes both. A one-off door goes through planSet as before.

## Findings
**M1, the plan bypasses the Manners gate on the Root Road** (`tasks.js:919` dayMeal; `act1_blackroot.js:748`). By hand, "Eat something." stays hidden at `rr_hub` until `ya_mocked`, so the only meal there is the beat "Eat with the others." The camp routine calls `eatBest` regardless. Example: `at-rr_hub.json` (`ya_mocked` unset), Fed 70, one card planned → "Breakfast: smoked meat. +30 satiety." at 06:20, then "Midday: smoked meat." The plan does something hand play can't, and it skips the gate the owner set on 20:01. Fix: skip R1 on `rr_hub` while `!ya_mocked`, or let R1 eat only when the hub's own eat choice would show.

**L1, Yuki's row at a camp says "every 3rd day"** (`week.js:538` `rep = doorRepeats`; `:595`). Spacing applies on STAY_DAYS only (`common.js` spacedNow), so at a camp Yuki's sit opens every day. On `at-rr_hub`, before: "every 3rd day"; once taken: "every 3rd day, opens Day 67" (tomorrow); the next day it is open. Fix: `repeat: rep && !campHub(g)`, so the row shows "once a day".

**L2, "It goes on the next morning here." is wrong on a region's last day** (`main.js:243`). Examples: rr story day 2, where only "Push on…" shows; dw's last day, followed by "Climb out…"; ah's last day. The plan stays `running` (stale, but harmless because the next hub differs).

**L3, a duplicate evening entry after the stop** (`week.js:779` with weekAfter). After the 16:00 stop, any hand story choice that comes back to the hub resumes the plan, which posts another "Day N: the day's plan" and "stops here: the evening…". Seen on ah: cairn climb 16:00 → 17:20 → a second evening stop. The stays have the same rule. It is new at camps, where the hub stays usable until 19:00.

**L4, − then + adds a run this week** (`week.js:425`). Kept 2, left 0: − gives 1/0, then + gives 2/1, so one more run than before the two taps. At the cap, kept 9 left 3: + gives 9/4, so the number shown stays 9 but a run is added. Clamp: `wv = Math.min(clampN(w0 + d, 9), kv)` only on +. That needs the owner's word, since it changes a pick's rule.

## Test gaps
- **TG1:** the night is jumped (`g.minutes = next day 07:00`, `goTo('dw_hub')`) instead of walked through Make camp → Sleep → "Another day here." with storyTap/afterStory, and a story night with the region change (checklist: "a jump walked, not computed").
- **TG2:** READ_STOP is off in the P52 block, so the read probe nested inside a camp run (CAMP_RUN restore) never runs. See C2.
- **TG3:** main.js rows are pinned only by source (`leftNote(sh)`). The − button's `down` rule and the note text are untested. See C4.
- **TG4:** the notes pin only "today"; "not today" (Meditate and doors) is never asserted. See C5.
- **TG5:** pins for M1 (no plan meal before `ya_mocked` on rr) and L1 (a camp's Yuki row note).
- **TG6:** "a card by hand plays as before" checks only that no routine lines appear, against the new code. A hash of one hand tap's state pinned from v0.11.283 would catch more.

## Faults (`p52-faults-review.json`), expected with `--games 2`
C1 (the morning's stop not forgotten): caught. C2 (`was = false`, the probe turns the routine off mid-run): **missed** (TG2). C3 (only noteCardTap back to doorRepeats): caught (the hand-tap pin). C4 (the − button's down rule): **missed** (TG3). C5 (the Meditate note always "today"): **missed** (TG4).
