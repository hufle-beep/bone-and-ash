# Cold review: v0.11.174, part 7 (the Return), P7A / SL1 / CN1 / CA1

Reviewed: uncommitted diff against HEAD (`/tmp/rw-p7-info/build.diff`: `act1_return.js`, `act1_heart.js`, `act1_common.js`, `stomp_act1.js`, `prologue.js`, `news.js`, `lore.md`, the three tests, three tool files). Read-only on the repo; scratch work in `/tmp/p7-review` (full copy), `/tmp/p7-old` (HEAD), `/tmp/p7-tools` (scripts).

**Counts: High 0, Medium 4, Low 12, suggested tests 10.**

Nothing breaks and no save is at risk. The four Mediums are one reveal given away by a header (M1), one contradiction with the Fallout (M2), one seam the SD pick left open (M3) and the test gaps (M4).

## What was checked, and how

- **Code against the stated list (parser level).** Old and new files with every string blanked and every `${…}` kept (`/tmp/p7-tools/skel.mjs`, the test's own `skel`). The only differences are the stated ones: `DRILL_AGAIN`'s three lists of four and `drillAgain`; `SELENE_CHOICE`, `installSelene`, `rt_selene`; the `mei_carried_seed` switch in `rt_start` and `rt_plant`; `a1_end`'s `o === 'taken'`; the Heart's three nights and `DR_HC_YA` by `log_heard`; `prologue.js` the import and the one call. `stomp_act1.js`: no code difference.
- **Scene structure (module level).** HEAD's and the build's `SCENES` loaded side by side (`labels.mjs`): 327 → 328 scenes, same order apart from `rt_selene`; same ids, titles, art, `enter` code, choice order, `to`, `time`, `qi`, `check`, `show`, every label. Differences: the seven `place:` values, `rt_camp` 8 → 9 choices (Selene at index 8, last), result strings. Every mechanical part is still there (5× "Slept until 06:00. HP and Qi full.", "+20 satiety" ×2, "+30 satiety", "+2 Smoked meat", "+1 Murky beast core.", the grove's "Saturation +…, no Qi spent").
- **Saves.** All 36 files in `saves/` load in the build (`saves.mjs`). The two `rt_camp` saves (2026-11-08, 2026-11-12) show the old choices at their old indices, their cards (`rt_camp:2`, `:3`, `:7`) intact, and "Tell them who Selene was named for." at index 8. Familiarity keys in the saves (`rt_camp:1`, `:2`, `:3`, `:7`) are untouched. `saves.test.mjs` passes.
- **The picker.** 300 seeds × 9 practice drills through `runTask`, with a save round trip every second drill and `taskCards` drawn in between (`drill.mjs`): every round of four shows four lines, never the same twice running, drawing the cards consumes nothing. Same through `choose` on `rt_hunters`. The record is `lines.p.drill_<kind>`, new each Coil. The reply area's quiet filter (`replies.js`) still hides a line already said this Coil, as before; Results shows it.
- **The Selene choice at runtime.** From `rt_camp` at 19:00, 23:50 and 02:00 (`camp.mjs`): 30 minutes there, 10 back, no result line, no relationship, no second supper, offered once. It is a story stop below "Sleep." and Yuki's card (the price of appending last).
- **Renders.** 2,142 renders of the 47 Return scenes × 3 forms × 7 flag sets × 2 relationship levels, `a1_end` × 4 outcomes (`render.mjs`): no throw, no `undefined` / `NaN` / `${` / TODO, no "the ship" / "the Selene" / "ship Selene".
- **The Selene rule, statically.** Every `ship` / `hull` / `wreck` / `Patient Root` in `js/` read. Outside the Heart nothing player-visible says "the ship" (only ships in general: `act1_blackroot.js:634`, `faq.js:26`, `rt_selene`'s "seed-ships"). In the Heart every "the ship" sits behind `!log_heard` or in a scene only reachable before the log (`ship_wreck`, `ship_touch`, `ship_bridge`, the two hub labels).
- **Tests.** `bash tools/check.sh quick` in the copy: all passed (135 s). 26 faults planted one at a time; per fault `story --games 20`, `tasks --games 10`, `part return`, `data`, `saves`, `engine`, `lint`: **13 caught, 13 not** (M4). The full check (browser, sanity, 1,000 games) was not run.

---

## Medium

### M1. The header names Selene before Wren does
`js/story/act1_heart.js:432` (`ship_log`, `place: … — Selene`); drawn by `js/main.js:313` above the title.
- **Failure:** on the bridge, tap "Play it." → the screen opens with "Inside the Old Tree — Selene" over "Hearth-Log: Arrival", and only then the text in which James hears the name ("Selene." / "You come up out of the memory…"). The owner's ask was the name "as a revelation … found in the logs"; the header gives it away one line early.
- **Fix (a `place:` value and one test pin):** `ship_log` keeps `${PIN} — the seed-ship`; Selene from `ship_log2` on. `tests/story.test.mjs` P7A (NM) places: `['ship_log', 'the seed-ship']`.

### M2. Shen Qiu's arrival against the Fallout's ledger
`js/story/act1_return.js:644` ("at the hour of the snake, on foot, twelve disciples"), `:378` (Old Wen, new in this push: "a column on foot, a dozen and more"), `rt_elder`'s `enter` (`toHour(g, 8)`); against `js/story/act1_fallout.js:385` and `js/story/stomp_act1.js:42`.
- **Failure:** Day 9 or 10, the watcher talks or is beaten → "the Elder means to arrive at noon, by the north road, with four disciples" (stomp: "north road, noon, four disciples"). Day 21 → he arrives at 08:00 with twelve. Also the hour of the snake is 09:00–11:00 and the clock reads 08:00 after breakfast.
- **Fix (text only, three strings; two are outside this part's files):** `act1_fallout.js:385` "…knowing that the Elder means to arrive in the morning, by the north road, with twelve disciples."; `stomp_act1.js:42` "The Elder: north road, the morning, twelve disciples."; `act1_return.js:644` "at the hour of the dragon" (07:00–09:00). If the Fallout stays out of this push, carry it as an open item.

### M3. `ht_leave` still has the seed with James when Mei Lin carries it
`js/story/act1_heart.js:812` → `js/story/act1_return.js:103`. Part 6's L7, left for part 7; not in the run sheets.
- **Failure:** `mei_carried_seed` → `ht_leave` ends "In your hand, or near your heart, the seed sings all the way."; next tap, `rt_start`: "Mei Lin walks with one hand flat over her heart, where the seed-sliver rides wrapped in her sleeve." Without the flag: "in your hand" against "Folded away in your hammerspace". Smaller, same state: `heart_core_after` (`:781`) "You look down at the seed-sliver", and the pack lists Seed-sliver ×1 with "It hums against your palm" (`act1_common.js:84`, edited in this push).
- **Fix (text only):** `ht_leave`: "Whoever carries it, the seed sings all the way." Item note: "…from the Old Tree's heart-chamber. It hums like a second pulse." (A `mei_carried_seed` switch in `ht_leave` would be code.)

### M4. The P7A block lets 13 of 26 planted faults through
`tests/story.test.mjs:1119–1230`.
| # | Fault planted | Result |
|---|---|---|
| 1 | Drill: Ya's 3rd line a copy of the 2nd | caught (DR) |
| 2 | Drill: picker bypassed, always line 1 | caught (DR) |
| 3 | Selene choice put before "Sleep." | caught (SC list pin) |
| 4 | "the ship" back in `rt_parley` | caught (GS sweep) |
| 5 | "the ship" in `guardian_approach`'s 2nd-day text | **not caught** |
| 6 | `mei_carried_seed` inverted in `rt_start` | caught (SD) |
| 7 | `a1_end`: the taken ending hears the grove | caught (C6) |
| 8 | Bridge line edited in `act1_return.js` only | caught (RB; tasks "the ford result line") |
| 9 | Gain added on `rt_selene`'s exit (Mei Lin and Ya +2/+2) | **not caught** |
| 10 | Gain added in `drillAgain` (Village +1) | caught (DR, OM) |
| 11 | A fourth wolf in `roadWolves` (code) | **not caught** |
| 12 | Stomp: "The other three hold a … conference" | **not caught** |
| 13 | Hub line "Selene is down there" before the log | **not caught** |
| 14 | `SELENE_CHOICE` shown without the log | caught (SC) |
| 15 | `rt_evening`: cat and great root-kin swapped | caught (FM1) |
| 16 | `rt_elder`: "I have lived four hundred years" | **not caught** |
| 17 | `rt_evening`: "Four days in the Blackroot" | **not caught** |
| 18 | `rt_elder`: "on a red horse" | **not caught** |
| 19 | Label changed (`rt_wen` "Go and plant the seed.") | **not caught** |
| 20 | `rt_council` check dc 5 → 3 | **not caught** |
| 21 | "the ship" in Yuki's card at the last camp (`yuki_time.js` `rt_camp:2`) | **not caught** |
| 22 | Quiet night 2: `log_heard` inverted | caught (P6A NC, P7A GS) |
| 23 | `rt_selene`: the woman answers by the bond | caught (SC, YF) |
| 24 | Hammerspace branch "no longer than your finger" | caught (SD, SZ) |
| 25 | `rt_watch`: Ya feels his Qi | **not caught** |
| 26 | `rt_dawn`: "HP and Qi full." dropped | **not caught** |
- The build itself is clean on all of these. The gaps: no structure pin for `act1_return.js` (TG1 covers the Heart, the stomp file and `yuki_time.js` only); the Heart sweep after the log lists 13 scenes and never moves the day record; nothing checks "Selene" with `ship_found` and no `log_heard` outside the nights; C2 and C3 test one string each; Yuki's and the houses' card texts are not swept. Faults 11 and 20 may show as drift in the full check's sanity step; not run here.
- **Fix:** TG1–TG10 below.

---

## Low

### L1. `rt_quiet_night`: the woman still answers by the bond
`js/story/act1_return.js:636`. Human branch: "*Stop thinking,* says the bond. *I am trying to sleep.*", back to back with James. This push made `a1_end`'s same beat aloud (FB).
- **Wording:** `'Toward dawn Yuki\'s elbow finds your ribs. "Stop thinking," she says. "I am trying to sleep."'` (the FM1 pin for the human changes with it).

### L2. `rt_selene` against the camp it is told at
`js/story/act1_return.js:285, 291, 293, 295, 298`.
- **Failure:** fire talk first ("You bank the fire the way Ya taught you", or "the fire is down to embers"), then the story → "Mei Lin has stopped feeding the fire", "She jabs a coal", and the way back reads "Let the fire burn down a little." Also `rt_camp` has just put the cat in Mei Lin's or Ya's lap and the great root-kin behind everyone; the story has her on James's knee, or outside the firelight.
- **Wording:** "Mei Lin's hands have gone still in her lap."; the new label "Back to the fire."; cat: "Yuki has kept one yellow eye on the moon throughout." (no place named).

### L3. The brawl counts two cousins; the fight has one
`js/story/stomp_act1.js:437` (posture, shown at every degree: "his cousins come off the bench to stand at each elbow"), `:452` (win 3: "Bao and both cousins"), `:466` (`one`: "Three grown hunters"), `act1_return.js:70` ("Three against three"), `:528`; enemies at `:65` are Bao and one cousin. Same class as C2 (the wolves); run 2 noted it and kept it.
- **Wording (text only; `rt_brawl_start` already hands one cousin the jacket):** posture "…and one cousin comes off the bench to stand at his elbow; the other has the jacket to mind."; win 3 "Bao and his cousin are sitting in the dust side by side"; `one` "Two grown hunters sit cross-legged…"; the tail "Three against two. Better." The label "two against three" is a label: owner's call.

### L4. `ship_wreck`: he touches the hull one screen before "Put your hand on the hull."
`js/story/act1_heart.js:390` (new HN text: "Under your fingers you find the foot of one letter") → choice `:398` → `ship_touch` "The hull is warm." as the first touch.
- **Wording:** "…the bark has closed over. From where you stand you can make out the foot of one letter, perhaps of two, and nothing you can read."

### L5. "Long way: safe, boring, four days"
`js/story/act1_return.js:107`. They walked five days to the tree (part 5's fix, Days 11–15). Old text, rewritten around.
- **Wording:** "Long way: safe, boring, five days."

### L6. Practice lines that say "this morning"
`js/story/act1_return.js:30` (`hardFail` 2: "They knew it this morning"), `:31` (`ya` 2: "'Closer than this morning,' Ya allows").
- **Failure:** the first drill can be in the afternoon (planting, palisade, council first), and the militia can have been readied by James's own drill, so Ya never had them stalk anything "this morning".
- **Wording:** "They knew it an hour ago, and will again once their arms stop shaking."; "'Closer than last time,' Ya allows."

### L7. `a1_end`, taken: "Some nights" on a three-day road
`js/story/act1_return.js:808`. The paragraph above is the second night of three.
- **Wording:** "Up here the grove is out of hearing. You lie awake and listen regardless, and from far below, deep in the Blackroot where the dead tree stands, something very faint answers what you were listening for." (C6's test still holds.)

### L8. The What's new note names her
`js/core/news.js:33`. A player who updates before reaching the log reads "now has a name, Selene".
- **Wording:** "The seed-ship under the Old Tree has a new name, which you first hear in Wren's log; at the last camp on the road home you can tell Mei Lin and Ya who she was named for."

### L9. Tics the brief asked down
- `rt_mother` (`act1_return.js:394–398`): "the street" now ×4 (lint: `rt_mother "the street" ×4`). **Wording:** "It was not there, and has never let that hinder it."
- `rt_wolves` win 3, great root-kin: `yuShort` prints "all four hundred pounds of her" (`stomp_act1.js:14`); the scene text dropped the phrase in this push. Code helper: open.

### L10. Strings nobody sees, and one counter
- The four fights' `intro` strings (`act1_return.js:52, 58, 64, 75`) are never shown: `power.js` `prepare` uses the stomp `posture` at every degree. The P7A (C2) test's "three wolves" partly reads text no player meets. Run 2's note 1; open.
- `rt_duel_won` (`:746`) still counts `g.stats.kills += 1` although he lets Shen Qiu live. Code; open.
- The no-seed branches (`:103`, `:409`, "a shard of Selene's hull") cannot be reached: leaving the tree needs the seed.

### L11. Old saves past the log
A save made after the log on an older version read "PATIENT ROOT" on the hull and in the log; from v0.11.174 its text says Selene with no reveal, and the last camp offers the story. Nothing breaks. One line in the handover or the note is enough.

### L12. Before the commit
- `sw.js:2` is still `bone-ash-0.11.173`; `news.js` already has the 0.11.174 note. `handover.md`, `roadmap.md`, `changelog.md`, `restore-points.md` and the P7A row in `tests/README.md` are not in the diff yet (rules 2, 5, 7).
- `tools/consistency.mjs` notes `project/changelog.md` at 65,498 bytes, past 60,000.
- The owner's label ideas from run 1 (the tic "the first time" in `rt_elder`'s third label and `DRILL_AGAIN.hard[0]`) are in `notes-run1.md` only.

## Checked, nothing found

- **Logic and saves.** No id, flag, item id or storage key changed; `rt_camp:<i>` and `rt_ashfall:<i>` keep their places; `rt_selene` is a world flag (not in `KEEP_FLAGS`); `log_heard` is always set in the Return (leaving needs the seed, the seed needs the guardian, the guardian needs the log). `mei_carried_seed` is read where the news note says.
- **The Selene rule** in every reachable line after the log: Selene, she, her; "asleep", never dead (`log_comfort` fixed). The hub's two "ship" labels show only before the log. Item notes hold before and after.
- **Canon.** Days 19–21, nine days (`rt_mother`, `rt_evening`), 600 / 400 / 300 years, a thousand only for Selene and her hull, the seed no longer than his hand in both branches, Ya's childhood as in `talk_ya`, three wolves in every text, Shen Qiu on foot with the fan in his left hand (right arm and fan hand needled), his Qi-sense finding nothing, Bao and the Sect judging by what they see. `ship_log` keeps lore.md's two quotes word for word. `lore.md`'s new sections match the built text.
- **Forms.** Every `byForm` in the Return and the four stomp entries: no cat body on the woman, no tiger on a shoulder or in a lap, no spoken line from the cat or the great root-kin; only L1.
- **Tone and limits.** The three nights at their old level, same fade; no lyrics, artist, title or poem; three CW lines (`rt_camp` supper, the omnitool at the fire, the mother at supper), none at the planting or with the Elder. None of the brief's tics in new lines apart from L9.
- **Stomp wins** keep their scenes' facts and lead into the same choices; "Ashfall does not kneel" is kept for `power.js`.

---

## Suggested tests

- **TG1. Structure pin for `act1_return.js`.** Add it to P6A's `PIN` (the same `skel` hash), plus a hash of the Return's labels. Catches faults 9, 11, 19, 20.
- **TG2. Mechanical parts of the Return.** "Slept until 06:00. HP and Qi full." 5×, "+30 satiety" 1×, "+2 Smoked meat" 1×, "+1 Murky beast core." 1×, "An hour of rest." 1×, "no Qi spent" 1×, `DAY21_BREAKFAST` ends ": +20 satiety." (fault 26).
- **TG3. The numbers of the fights.** `roadWolves(g).enemies.length === 3` and no `/four|other three/` near "wolves" in the Return's stomp entry; the brawl's enemy count against the cousins named (after L3).
- **TG4. Shen Qiu's facts.** `rt_elder`: `/on foot, twelve disciples/`, `/I have lived three hundred years/`, `/closed fan/`, no `/horse|rider|mounted|saddle/`; every "hundred years" in `rt_elder`, `rt_truth`, `rt_duel_won` and the stomp `elder` entry is "three hundred" (faults 16, 18).
- **TG5. Nine days everywhere.** No `/(four|five|six) days in the (Blackroot|deep forest)/` in `act1_return.js`; `rt_evening` has `/Nine days/` (fault 17).
- **TG6. Selene never before the log.** Every Heart scene, the hub's line, the camp replies (`DAY_REPLIES['heart_camp:*']`) and the item notes with `ship_found` and no `log_heard`: no `/Selene/`. And `ship_log`'s place after M1 (fault 13).
- **TG7. "The ship" never after the log, properly.** All 38 Heart scenes, day index 0–4 (note the day in `lines.d` as P6A's TG8 asked), plus `YT_BODY` for `heart_hub`, `rt_camp`, `rt_ashfall`, the house cards' bodies and every `DAY_REPLIES` entry of the Heart, rendered with `log_heard` (faults 5, 21).
- **TG8. The Selene story end to end.** From `rt_camp` through `choose` to `rt_selene` and back: relationships, items, HP, Qi, satiety gain unchanged; 30 + 10 minutes; the exit choice has no `do` (fault 9).
- **TG9. Nobody senses them.** In `act1_return.js` and the Return's stomp entries: no `/(feel|sense|smell)s? (your|his|her) Qi|your Qi is/`; the only "cannot feel you" is Shen Qiu's (fault 25).
- **TG10. The seam and the picker through a save.** `ht_leave` rendered with `mei_carried_seed`: no `/your hand|your heart/` (after M3). Eight practice drills through `runTask` with a save round trip between them: two full rounds of four, no line twice running.
