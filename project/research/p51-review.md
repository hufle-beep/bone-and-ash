# P51-A cold review (Opus, v0.11.283)

Read: the brief, both checklists, `git diff`, the packet's headers and C1 lines, the scenes of the 11 menus (line ranges), `replies.js`, `again.js` (read record), `week.js` (read stop), `main.js` (land, doTask, the screen's order, journal). Ran in `/tmp/rv51`: every menu text in 3 states (and days 8/9/10 for the council) through `menuFirst` and `splitLine`, and a forage card and an Explore door on `saves/v0.11.204-long-wilds-day2.json`. `node tests/appfiles.test.mjs`: 10 passed, 0 failed. Not run: the story test, the full check, the models.

## What checks out
- The first-sentence key, for all 11: the council's 3 days and the palisade's 3 stages give different keys. The pantry, militia, spears, jade and `saw_lights` change only later sentences, so they don't make a new text.
- `splitLine`: no sentence of any menu text goes to Results, and no words are lost (11 menus × 3 states).
- `mt:` and `cap:` are not in `KEEP_FLAGS`, and a rewind clears them. The dry runs (`dryClone`, `probeClone`, `sitLoop`'s copy, `sitLoopPlan`) all deep-copy the flags, so neither flag reaches the real game.
- CP-1: a skill that reaches its cap mid-day keeps its "→ T10 L10" line. `sitSummary` still shows "(cap)" once. Yuki's line has its own key.
- SU-n: on the hubs, the "shut" stop is always the evening close (the Heart's `active`, the other hubs' hour).
- The read stop: the text is unread story prose, so the plan stops before the first card (within `READ_CAP`). `noteLines` marks it read.
- L7-f: the CSS breakpoint `min-width:1100px` matches the `innerWidth` check.

## Findings
**H:** none.

**M1 — Forage: the screen contradicts itself.** `tasks.js:52/340`, `wilds.js:261`. `wild_forage`'s text ends on `pantry(g)` read *before* the card, and it is drawn as the reply under the wilds hub's text, which has its own `pantry(g)` read *after* the card. Measured: hub "In the hammerspace: 3 jade bracket fungus." with the reply right under it saying "The hammerspace holds no food. Infinite space, zero snacks." When nothing changes, the same pantry line shows twice on one screen.

**M2 — Explore: the lead-in comes after the arrival.** `tasks.js:582`, `main.js:388-389`. A door card shows its reply under the scene it opens (v0.11.68). Measured: "The valley is full of bones…" (bone_field), then under it "Your threads have been drawing a map… *what is that*." The same happens for the mire and the hollow.

**M3 — Welcome back stays after a new game or a load.** `main.js` 1202 (new game), 1211 (slot), 1117 (backup), 1241 (file), 603 (Restore all), 674 (leaving recovery). Only `land()` and ✕ clear `welcomeCard`. Its `view` is a snapshot of the old game, so after "New game" the card shows "Where you left off: Day 12 …, The Palisade" and the last entry of the old game's journal above the new game. Bite the tail keeps it too.

**M4 — Welcome back shows the checks that are hidden everywhere else.** In `welcomeHtml`, `v.lines` are drawn as they are. The journal draws `shownLines(e.lines)` (`main.js:807`). With Show checks off (the default; owner v0.11.10, for immersion), the card still shows "GU 3 / DC 3 — done", and the log entry of a work card always has that line.

**L1 — "From this morning" can be wrong.** In the council's story-day-10 text, "The map still lies on the table from this morning" is true only on the day of `fo_plan` (the first morning with `dd ≥ 10`, `act1_fallout.js:692`). The long calendar's day 10 lasts 7 days, and the council is daily, so the first council can fall on another day. Older problem, already in the text: "Second council" when day 8's was skipped.

**L2 — Texts against the card under them, now on one screen.** `fo_palisade`'s "The stakes rise to your singing… paid for in Qi" sits above "Teach the hunters to set your stakes in pits" (no song, no Qi). `drill`'s "bows, boar spears" shows after the workshop's spearheads (`flags.spears`; `rt_hunters` has that branch, `drill` doesn't). `rr_scout` card [0] repeats the text's "Eyes lie. Ears lie. Nose doesn't." directly under it.

**L3 — Later Coils show the whole text again.** In Coil 2 and after, the whole text shows again unfolded: results never fold, while a story screen read before folds (FR, v0.11.229). This is how the pick defined it (once a Coil), but it repeats about 800 words a Coil.

**L4 — SV-p's part state.** `ghParts` outlives a load or a new game ("Share part 2 of 3" sends the old game's rest). A part copied and then lost can't be sent again short of a reload. When the copy of part 2 or later fails, the earlier parts stay on GitHub with no partner. The JSON fallback (no `CompressionStream`) is cut by UTF-16 units: 18,000 characters with more than about 1,000 three-byte characters (—, →, −) passes 20,001 bytes, and its parts are named `.txt`.

**L5 — The PC tooltip doesn't move.** It keeps `beside` and its top and left through a resize or a scroll while open. Below 1100 px its inline `top` plus the phone's `bottom` stretch it until the next hold.

**L6 — The packet is stale.** `/tmp/m/rv/p51-packet.txt` still says "its text is NEVER drawn in task mode" on all 11 headers. The current `sceneStatus` says "drawn once a Coil", so the file was written before the `packet.mjs` change. Write it again before it goes on.

## Test gaps
- **TG1:** nothing clears or tests `welcomeCard` on New game, a load or Restore (M3).
- **TG2:** no test that the Welcome card filters checks the way the journal does (M4).
- **TG3:** the visibility and `pagehide` listeners of WB-y are not pinned. Planted C5 passed.
- **TG4:** the CSS `#tip.beside` rule is not pinned. Planted C6 passed.
- **TG5:** the MT tests check that the text is in `r.lines`, not where it lands on screen: the door's reply under its destination (M2), and the reply under a hub that redraws the same line (M1). Render the hub after the card.
- **TG6:** CP-1 is not tested through a real sit-all at the cap: the summary's "(cap)" once, and a second sit-all that day with none. The cap lines are also not tested in a plan run.
- **TG7:** SU-n is tested at Ashfall only. The Heart's 18:00 and the Long Forest's 20:00 are not tested through `medCards` or `runMed`.

## Planted faults (`p51-faults-review.json`)
- **C1** (door text dropped), **C2** (key on the whole text), **C3** (cap once a Coil), **C4** (SU-n result names the start hour): story.test, all expected caught. Not run here.
- **C5** (WB-y: the time kept only when the page shows again, so a long session plus a short break gives a card it shouldn't): appfiles, measured **missed**.
- **C6** (CSS `beside` rule emptied): appfiles, measured **missed**.
