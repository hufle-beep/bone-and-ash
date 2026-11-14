# Part 8 (the Long Forest), review T: text, canon, continuity

Reviewer: Fable (cold). Read only; nothing edited in /home/claude/bone-and-ash or /tmp/rw-p8r.
Read: every changed string of `js/story/longforest.js` and `SEASON_LINES` (old v0.11.174 against `p8-work`), lore.md, the brief,
the four runs' notes, power.js's top comment, prologue.js (`lfOpen`, `lfSeason`, the two "Stay lost" entries, "Go back the way you
came", `mei_lin`), task_hubs.js (`lf_hub`), common.js (`daily`), coil.js (`KEEP_FLAGS`).
Checks run: the brief's tic list by grep (clean, except the label noted in T13); six-word runs of the new text against the rest of
`js/story` (script in /tmp/rvT); loot against each fight's texts by hand. No test suite run (review C's).

**Count: 1 high, 7 medium, 15 low.** Line numbers are `p8-work`'s longforest.js unless a file is named.

## High

### T1 (high). The mire-brood: the Ouroboros now cleans the water round his boots (a new power; it contradicts two texts)
- Lines 105 (win 3) and 109 (one move): "the Ouroboros turns over once, and the water round your boots runs clear: one clean patch
  in a mire that has never had one, and widening. They *taste* it." / "The water round your boots runs clear."
- Why: run B fixed a real fault (beasts can't sense him; the old text had them taste *him*), but the fix invents a fact no other text
  has: his loop purifying the world outside his body, visibly and spreading. lore.md: the Axiom "runs the body like a closed garden".
  `lf_notes` (line 408), same file: "the Ouroboros loop leaks nothing (no residue, no pressure…)". And filtering the world's Qi is
  what the Old Tree did; James doing it by standing in a pond pre-empts Act 1's reveal and Act 2's garden. The brief: "you don't
  change the story". Run B flagged it for the owner; it has not been put to him.
- Fix (no new fact; the beasts read what they see, like the locals): win 3, first paragraph:
  "You don't fight them. You stand on the bank with your hands in your pockets and look at them as you would at a slide: with
  interest, and no fear in it anywhere. Nothing has ever stood on this bank and failed to be afraid. They work through what that
  means, and get it right. All three roll over in the shallows and float there, belly up, playing dead with real commitment."
  One move: "You look at them, with interest. Three mire-brood die of fright, provisionally, and float."
  If the owner wants the clean water, it is his pick, and lore.md and `lf_notes` change with it.

## Medium

### T2 (medium). "Only suspected the last time through": Mei Lin told him to his face on Day 4
- Line 309 (`lf_exit`): "what you only suspected the last time through, you have now tested…"; line 408 (`lf_notes`): "*Key finding,
  suspected last time and now confirmed on a proper sample*".
- Why: in the week he has lived, prologue.js 515 (`mei_lin`): "I feel *nothing* in you: no root, no Qi… To my senses you are a stone
  wearing a coat… you are a mortal. I would stake my life on it". He was told, not left to suspect.
- Fix: 309: "What nobody out there knows, and what you were told to your face the last time through by someone ready to stake her
  life on it, you have now tested…". 408: "*Key finding, reported to me last time by a local and now confirmed on a proper sample:*".

### T3 (medium). The four zones' later texts announce a restock on a same-day return, with the fights gone from the list
- Lines 501 ("the population is back to strength"), 511 ("The ghost-gill stumps have tenants again"), 521 ("fresh glass since your
  last climb"), 556 ("The tenants are back").
- Why: the zones are not daily; `visit` counts every entry, and the day key is the wake count. Enter, win, go back to camp, go deep
  again the same day: the text says the residents are back while both fight choices are hidden for the day. In the owner's own way of
  playing (14 seasons, 0 days) every second visit reads so. The same on a return after a first visit where he only looked.
- Fix, either: (a) code, Claude's: count a zone's visit once per wake-day, so "since you were last here" always spans a night; or
  (b) text: 501 "Under the great ribs your Convergence counts skeletons it has counted before, and one or two that haven't been told
  about you."; 511 drop the tenants sentence; 521 "The glass is where the sky left it. The sky has kept its hand in."; 556 "Grey
  shapes lie along the white, holding very still. They have had practice at being left behind." Recommended: (a), it keeps the texts.

### T4 (medium). CW line 2 (Fang Wei): "one dusk" can't have happened on day 0
- Line 667: "He had watched your camp one dusk, he tells the sky, and heard the music from your sleeve…".
- Why: the trail walk shows only before 17:00, day 0 included; the camp has seen no dusk yet. The brief: no text may assume days spent.
  The music itself is in order: generic ("low and strange and sad", "songs that soft"), no artist, title or lyric.
- Fix: "He had come past your camp before he came on you, he tells the sky, and heard the music from your sleeve, low and strange and
  sad, and had judged that a man who kept songs that soft could not be dangerous."

### T5 (medium). The exit and the notes cite bandits, a herb-poacher and cultivators he may never have met
- Lines 309 ("tested on beasts, on bandits and on one very confused herb-poacher"), 404 ("Bandits remain optimistic"), 408
  ("Cultivators cannot"). A player can leave, or write notes, having met neither encounter. Run A noted it; still open.
- Fix (a text function may read the flags that exist; none changes): build the list from `lf_seen_lf_bandits` / `lf_seen_lf_rogue`:
  "tested on beasts" + (bandits met ? ", on bandits" : "") + (Fang Wei met ? " and on one very confused herb-poacher" : ""); 404:
  "Bandits remain optimistic." only if met; 408: "Cultivators cannot." only if Fang Wei met. Or neutral: "tested on everything in
  this forest that has looked at you".

### T6 (medium). After a later meeting, the stomp posture replays the first meeting; and Fang Wei is named before he gives his name
- Lines 599–607 (later meetings) against 162 and 184–188 (postures, shown before every fight at every degree).
- Why: "You. The mortal in the robe… The toll has gone up. For repeat travellers." is followed, on "Let them make their speech", by
  "Well, well… A mortal. In a *white robe*. In the deep forest. With a *cat*… Very lost, uncle, or very stupid" as to a stranger.
  Fang Wei: "The mortal again" is followed by his full self-introduction ("Outer Disciple of the Crimson Lotus ('lapsed,' he adds")
  and "Do you know what grows here, mortal?". Also line 603 names "Fang Wei" in the narration; he gives his name only in the
  posture, so after a first meeting that was talked past or walked away from, James can't know it.
- Fix: the posture takes `g`: a second opening sentence when `later(g, id)`. Tans: "'Well, well,' says Scarred Tan, who has plainly
  rehearsed, and sees no reason to waste it on a second showing. 'The mortal. In the *white robe*. Still in the deep forest. Still
  with…'" (then the three byForm ends as they are). Fang Wei: "Fang Wei ('lapsed,' he says again, in case it was missed) looks you
  over…" and "You know what grows here, mortal." Line 603: "the poacher has moved his business and not improved it" unless
  the name was heard (a fight happened); simplest: "the poacher" on that line always.

### T7 (medium). `lf_human_lost`, later text: "people", "They" for Fang Wei alone
- Line 677: "You lose, and to people who know your face… They go through your pockets like old acquaintances".
- Why: run A rewrote the first text without "they" because the scene serves one man as well as two; run D's later text puts it back.
- Fix: "You lose, and to a face that knows yours, which is worse. Your pockets are gone through with the ease of old acquaintance;
  what food is found is taken, and the hammerspace is missed. The laughter about the mortal in white follows you down into the
  leaf litter."

### T8 (medium). The great form's first scene can play after the human one
- Lines 249–250 (the hub offers both when she is realm 7+ and neither was seen: several seasons in a row do it), 687–697, 726.
- Why: `yuki_human_after` shows "Then the great form, as big as a Bengal tiger"; `yuki_tiger_awaken`, taken afterwards, opens "that is
  the only reason you believe it", says "*I have been small for long enough*" and has her "eleven pounds again… on your shoulder",
  whatever form she wears; "your new Core" is also stale past realm 2. Older than this push, but YA is in the pick. prologue.js 975
  already orders them (the great form first).
- Fix (code, no label or flag change): the hub's human choice also needs `g.flags.yuki_tiger_seen`. "your new Core" → "your core".

## Low

- **T9. `lf_trial_won`, human branch, line 575:** "tucks a lock of hair back behind one white ear": her ears are cat ears on top of her
  head (lore; line 708). Fix: "Yuki smooths one long side lock flat between two fingers."
- **T10. CW line 1 (the Tans), lines 610 and 603:** "your cooking smells as if somebody is expected home for it" and "asks what you are
  cooking today": he is an hour down a game trail, cooking nothing, and on day 0 may not have lit a fire. Tone is right (Little Tan,
  looked at until he stops). Fix: 610 "adds that the fire back upstream smells as if somebody is expected home to it"; 603 "Little
  Tan asks what was in the pot this morning, and is looked at."
- **T11. Season lines (prologue.js 1005–1018):** the rungs fit (1 flight, 2 her weight, 3 the core set, 6 the second attention, 7 "a
  committee", 14 the top), no realm, sky or day count, Yuki form-neutral from 7 on. Two notes: he now sits in the open (insects,
  nests, falling trees, a flood) where the old lines and `lf_seclusion` have the cave behind the falls; and line 3's "last season"
  is false if he reached Core Formation by a breakthrough. Fix: line 3 "What was poured soft at your centre has set."; the cave: say
  nothing, or one clause in line 1 ("A season of sitting still on the ledge above the falls").
- **T12. `lf_enter` on a second entry in one Coil** ("Go back the way you came", then "Stay lost" again): "at the cat", "how far I can
  climb", "How do you feel about camping?" replay; the fold hides all but the first paragraph on a re-read, so low. Fix: "at Yuki".
- **T13. `lf_bathe` on day 0, lines 262 and 435:** the label "You have been in a forest for a long time" (a tic, and false on the first
  screen; labels are outside this pick: open, for the owner), and the later text's "a man you would step aside for" at Mortal Vessel.
  Fix for 435: "a man with fewer apologies in his shoulders."
- **T14. Coil 3 and later:** the counters reset each Coil, so first-visit texts replay to a man who remembers ("You had always taken it
  for a metaphor", "You haven't heard of them", "invented a toy"), and line 309's "the last time through" may itself have been a
  Long Forest. Inherent to per-Coil flags; noted, no fix proposed in this push.
- **T15. Tics inside the new text:** "From her, …" at 41, 430 (both form branches) and 447, with "from a hound counts as respect" at 78; tenants and landlords
  (292, 511, 556) with "buyer" (97) and "owner with a guest" (378); clerk / clerical (41, 472, 536); Fang Wei and the sky (190
  "swearing at the sky", 647 "glares at the sky", 667 "tells the sky"); "has not moved" twice in later texts (365, 378); the bond as
  cheating twice (41; season line 2); "that is not a figure of speech" (234) is Mei Lin's line in act1_return.js 109. Fixes: 41
  "She does not plan for people who don't worry her."; 511 as T3; 667 "he says, to nobody"; 234 "and lately you mean it literally".
- **T16. Beats lost:** the hub's "you have a doctorate in not being in a hurry" became "the one field you were qualified in before the
  doctorate" (weaker; restore the old clause); "had eyes but did not see Mount Tai" lost its mountain (right by canon, an Earth
  mountain; the genre joke goes with it; the owner's call); the old season lines "Yuki does not permit moss" and "Somewhere past a
  million the counting stops being necessary" are gone (the second would fit line 9 or 11).
- **T17. The Heartless, line 152:** "taken out of it with a blade" adds a fact (the old text: "cut out"); lore has the Tree's heart taken
  "with his own hands". Fix: "where something was taken out of it, long ago."
- **T18. `lf_storm`, lines 542–544:** a paragraph ends on a comma ("…the exact crown of your head,") and the next starts lower case; it
  reads as a typing slip. Fix: "…the exact crown of your head. / It stops a foot short and hangs there crackling…".
- **T19. `lf_old_roots` later, line 554:** "lie where they fell": the roots rose out of the earth; "fallen pillars" was a simile. Fix:
  "lie where they lay".
- **T20. Loot against text (all ten fights checked, all agree) with two nits:** the Wyrm's win 3 takes one "core-knot" for +2 cores
  ("the two core-knots"); the ram's win 3 has Yuki keep it company "all evening" at any hour ("for as long as dinner takes").
- **T21. `lf_notes` later, line 406:** assumes he has been to the trial grounds on two days, and revises a "generous" that only the
  never-drawn `lf_trials` text says. Stands on its own; fix if wanted: "*Hypothesis: organised.*"
- **T22. `lf_trial_won` later after the Heartless:** "will be back tomorrow, or something filling the same post", then Yuki's score,
  straight after the one grave fight. The first text does the same ("take you for food"). Open; a `name === 'Heartless'` branch
  would be code.
- **T23. Never drawn in task mode, unchanged, for the record:** `lf_forage` ("every good patch… now"), `lf_train` ("scarred with your
  practice"; a scratching post), `lf_trials` ("by the next morning"), `lf_hunt` ("breakfast"): day-0 and cat-only wording if any
  mode draws them. `lf_notes`' "The sky has tried to strike me 0 times" at Mortal Vessel (lore: the sky calls at realms 3–14).

## Checked and found right
- FX: 800–900 years ("eight or nine hundred"); Bengal tiger everywhere, no pony; the secret of her voice is now a preference, and
  "Promise." still answers it; the hare's miss; no weeks counted; day 0's hub line; "for a long moment" and "a good deal" gone.
- CO: `lf_enter`, the hub and the morning know the week (the scream, the village, the Sect, the tribute); no Selene, nothing about
  the inside of the dead tree; Mei Lin unnamed in the prose.
- Yuki: every human branch speaks aloud (exit, storm ×2, trial won ×2, autumn, bathe, bored, lost); the great form never rides a
  shoulder or a chest; the awaken scenes keep "for the first time in your life" true (`yuki_*_seen` are kept across Coils).
- Realm sheet: Fang Wei Foundation and proud of senses that find nothing; "Senior" from the beaten; nobody local flies; James kills
  no human in any of the eighteen human texts.
- Order of visits: the later encounter texts name no earlier outcome (run D's update holds); `lf_trial_lost`'s "again" keys on
  losses; the daily scenes' later texts all need a night between.
- Tone: locals grave, no cuteness added; the kept jokes are in (the checklist, "Only a mortal.", the bone mouse, "*show-off.*",
  "Lost," "Don't make it weird", "Lower than that").

# Part 8 (the Long Forest): cold review C (code, tests)

Reviewer: Fable. Reviewed: branch `p8-work` at `2e31960` (`js/story/longforest.js`, `js/story/prologue.js`, `tests/story.test.mjs`), against v0.11.174 in /tmp/old174.
Faults were planted only in the scratch copy /tmp/rw-p8r, each reverted; the scratch copy is clean again and /home/claude/bone-and-ash was not edited.

## Verdict

No crash, no save risk, and no mechanic changed. Four things should be settled before the push: one high (a visit is counted twice on one trip), two medium continuity breaks that come from the code's structure, and one medium tool gap. The P8A tests catch 19 of 41 planted faults; 16 pass every suite I ran.

## What holds (checked, no finding)

- **No id, flag, check, gain or label change.** I compared every Long Forest scene and choice, old against new, with the story strings stripped out. The only differences are the ones the pick lists: `visit(...)` in 12 `enter` functions (5 of them new, on the four zones and `lf_storm`), `lfDrill(...)` in 7 drill results, `later(...)` in the ride's thanks, and the index in `lfSeason`.
- **Saves.** The counters are plain number flags; an old save reads 0 and gets first-visit texts. The drill pools are new keys in the Coil's `lines` record, which `pickLine` creates on first use. `saves.test.mjs` passes (36 files, 196 assertions).
- **Rewind.** After a rewind from the Long Forest the `lf_seen_*` flags and the pools are gone and only `longforest` stays (probe). `KEEP_FLAGS` has no `lf_seen` entry.
- **`enter` is not run twice by the engine.** "Not yet", the Coil's wake and the Meditate card skip it (`skipEnter`, `med_back`); loading a save does not call it.
- **Order against `markDaily`.** Each daily scene marks the day, then counts; through the hub's card the falls end at counter 1 with one daily flag.
- **Dry runs.** `taskOutcome` runs on a copy without the `lines` record; the real picker record did not change in four dry runs.
- **Text functions are pure.** `later` and `seenOf` only read. The one side effect in a preview is the old `fight()` setting `lf_last`, unchanged.
- **Season lines.** `lfSeason` returns early at the top realm, so the index runs 0–13 for rungs 1–14.
- **The fold.** In Coil 3 the first-visit text read in Coil 2 folds; a later text not yet read shows in full (probe).
- **Task screen.** A drill card shows its line after the check line in every band (failed, partly, done, double haul).

## Findings

### C1 (high): one trip to the Thunder Ridge counts two visits
`lf_storm`'s only choice leads back to `lf_thunder_ridge`, whose new `enter` counts again. Probe: the first climb reads the first text (counter 1); after the storm the ridge reads "The ridge again… There is fresh glass since your last climb" (counter 2). Every player who takes the storm on the first climb sees it. Before P8A the same text came back and the same-day fold hid it.

**Fix:** count a key once per day. In `visit`, keep the day last counted and skip the increment on the same day:
`const visit = (g, k) => { const d = dayKey(g); if (g.flags[`lf_seen_${k}_d`] !== d) { g.flags[`lf_seen_${k}_d`] = d; g.flags[`lf_seen_${k}`] = seenOf(g, k) + 1; } return []; };`
That adds one flag per key (13), cleared by a rewind like the counters. The P8A test "RP" visits twice at the same clock and must move the day between visits (my probe of this fix failed exactly that assertion).

### C2 (medium): a zone entered twice in one day reads "restocked" with nothing to fight
The four zones are not daily. Probe: win against the bone-hounds, go back to camp, go deep again the same day. The Bone Field reads "the population is back to strength" while the hounds' choice is hidden until tomorrow; three same-day trips to the Old Roots set the counter to 3. The Black Mire's "The ghost-gill stumps have tenants again" has the same problem. The fix for C1 covers this: the second same-day entry shows the text of that day and folds.

### C3 (medium): the fight texts of a second meeting are the first meeting's
The stomp posture opens every fight at every degree and does not read the counter. Probe, second meeting with Fang Wei: the trail text says "The mortal again", then the fight opens with "A mortal, walking about in the deep forest. Do you know what grows here, mortal?" The Tans go from "The toll has gone up. For repeat travellers." to "Well, well… A mortal. In a *white robe*." At degrees 2 and 3 the stomp win text also replaces `lf_human_won` and `lf_trial_won`, so the new later texts for a win (and the second trial win) show only at degree 1.

**Fix:** needs new text, so it is the owner's pick: later-meeting postures for `lf_bandits` and `lf_rogue` (and, if wanted, later stomp wins), drafted by Fable. Open, options later.

### C4 (medium): the text lint does not read any of the new later texts or lines
`tools/textlint.mjs` renders scenes on sample states that never set `lf_seen_*` or `lf_trials_won`. I planted a broken template and a tic in the mire's later text, a broken template in the lost trial's later text, in a drill line and in a season line: the lint reported 0 broken and 0 changes. So the snapshot's Long Forest word count (2,936) leaves out the 13 later texts, the second trial win, 21 drill lines and 14 season lines, and their tics and favourite phrases were never counted.

**Fix:** one more sample state with every `lf_seen_*` at 2 and `lf_trials_won` at 2, and two pools (`lf_drill`, `lf_season`) in the line-pool section; then re-save the snapshot.

### C5 (low): a "partly" drill shows a total-failure line
On the task screen a partial result of a card without items runs `failDo`. Probe: "GU 2.5 / DC 5 — partly" followed by "The needles come out bent, then brittle, then not at all." The XP is partial, the line is not. The rule is old (the spar already did it); the drills were silent before, so it is newly visible. Fix: either accept it, or word the fail lines so they also fit a near miss.

### C6 (low): an old save in the middle of the Long Forest reads first-visit texts once more
A v0.11.174 save that has stood under the falls ten times has no counter, so the next visit reads "You had always taken it for a metaphor." Once per scene, then correct. The second trial win is right at once, because `lf_trials_won` already existed. I would leave it.

### C7 (low): the P8A tests fix the double count in place
"RP" calls `goTo` twice without moving the clock and expects counter 2, and the meeting test writes the counter itself (see TG5). Both need changing with C1.

## Planted faults

41 faults, one at a time, against the P8A block copied into a small script (0.2 s; 151 assertions pass clean). The 16 it missed I then planted together and ran `story.test.mjs` (whole file), `tasks`, `data`, `engine`, `rules` and `saves`; three more singly against the whole story test. `tools.test.mjs` fails on any change of word count in a text the lint reads (the snapshot), which is a tripwire for the author to re-save, not a check of meaning.

**Caught by the P8A block (19):** `later` at `>= 1` and at `>= 3`; a visit counted twice; the storm's later text never shown; a drill line twice in one list; the drill picked by the clock; `t1`'s lists swapped; an intro restored; the meeting's win text reading the wrong counter; a zone counting another zone's key; a TODO in a later text; a changed label; the first trial win reading the second text; the ride's thanks on the wrong key; day 1 reading the day-0 line; "for a long moment" back; a lost template in a drill line; a stub season line; the lost trial not counted.

**Caught elsewhere (4):** the label "Climb down." (walks.js throws at load); the season card's label (`tasks.test.mjs`); the Tans' taunt with cat and human swapped (NR1); `lf_exit` with the cat answering aloud (CS1).

**Passed every suite run (16), with a proposed test each:**

| Fault | Proposed test |
|---|---|
| F05 the falls' first and later texts swapped | **TG1** a table per scene: the first visit matches a marker of the first text (`/An hour upstream/`), the second a marker of the later one (`/has not moved/`) |
| F07 all seven drills share one pool; F39 the pool keyed by day (a new pool every day, the save grows) | **TG2** one save, three days, the four drills each day with a save round trip: each drill's three lines differ, and the `lf_t*` pools in `g.lines.p` are exactly the seven names |
| F10 season index `r % 14`; F11 by `lf_seasons` again; F12 the list reversed (F11, F12: block only) | **TG3** pin rung to line with `lf_seasons` set to 5 first: rung 1 `/Flying can wait/`, 3 `/has set/`, 6 `/second attention/`, 7 `/committee/`, 14 `/top rung/` |
| F13 second trial win, tiger and human swapped; F14 first storm, the cat speaks aloud; F15 later storm, the cat's line in every form | **TG4** over the big loop's renders, later visits included: the cat's and the great root-kin's text never matches NR1's `ALOUD`, the human's never places her as the small cat; and the YF list gains the later storm and the second win |
| F17 the wanderers no longer count the meeting | **TG5** the real flow: enter `lf_wanderers` on successive days until one pair is met twice, the test writing no flag: counter 1 then 2, first text then later |
| F18 the later meeting texts swapped between the Tans and Fang Wei | **TG6** the later meeting, talk, win and robbery texts name their own people (`/Tan/` or `/Fang Wei/`) and not the others |
| F21 the first trial win lost its `${name}` | **TG7** the first win names its beast for all eight fights ("the Bog-Mother", never "The The") |
| F25 `markDaily` dropped from the falls' `enter` | **TG8** after entering each daily scene (falls, ride, notes, bored, bathe, wanderers) its hub choice is hidden that day |
| F26 two counters added to `KEEP_FLAGS` | **TG9** visits and drills, then `rewind`: no `lf_seen_*` flag, no `lf_t*` pool, and `KEEP_FLAGS` has no `lf_seen` |
| F28 a Qi cost 3 → 5; F29 the ride's bond gain 3 → 5; F30 the falls' check band major → standard | **TG10** widen the frame hash: `qi`, the check's `band`, `bonus` and `xpTo`, `gives`, and the source of `do`, `failDo` and `enter` with strings stripped, against v0.11.174's values |
| F37 the day-0 hub line says "for weeks now" | **TG11** the first-visit texts on day 0 with no flags carry no `/weeks?|months?|for days/` (a net for review T's ground, not a proof) |

**Three more tests for the findings:** **TG12** (C1, C2) ridge, storm, climb down: counter 1 and the first text; a zone twice in a day counts once; the next day reads the later text. **TG13** (C5) `runTask('lf_train:i')` shows a `LF_DRILL` line in each band. **TG14** (C4) the lint's new sample reports a planted broken template in a later text.

## Checks run

- The P8A block as a script: 151 pass on the clean copy.
- `story.test.mjs`, `data`, `engine`, `rules`, `saves`: run with the batch of 16 faults planted, all passed (story: 4,656,746 assertions, 0 failed); not run separately on the clean copy.
- `tasks.test.mjs`: clean 667,044 pass (145 s); with 15 faults planted, the same.
- `tools.test.mjs`: run only with the batch planted; its 3 failures were my two scratch files (leftover scan) and the moved word counts. Not run on the clean copy.
- Not run: `tools/check.sh` (full or quick), the browser test, `tools/sanity.mjs`.
