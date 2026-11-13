# Fable's rewrite, part 2 (the Blackroot Wilds): notes

Edited: `js/story/wilds.js` (57 strings on listed lines + the 20 SW placeholders) and `js/story/task_hubs.js` lines 46–47.
Both files load. No ids, flags, keys, labels, checks, times, gains, `${...}` expressions, list sizes or enemy names changed.
Line numbers below are the working copy's (original + 13).

## Checks run
- The load check from the brief: ok.
- `node tests/tasks.test.mjs`: 665854 passed, 0 failed.
- `node tests/story.test.mjs`: 4606659 passed, **2 failed**, both `NC1` counts of reply lists (line 317: 48 lists / 73 texts
  against the expected 38 / 63; line 318: the list of keys). They count the ten pre-wired `DR_RING … DR_NEEDLE` lists, not
  any text of mine; the test needs the ten new keys (Claude's side).
- Five-word runs of every new string against `/home/claude/bone-and-ash/js`: none left except the generic "at the edge of
  the" (it was in the old lizard text too). None of the listed tics; no em dashes in the new text.

## Task 1 (OT), per scene
- **nightFight intros (71–72)**: rats and thornback intros reworded ("size of dogs" is used in three other files; the
  thornback's spines now rattle "like a quiver being emptied", closer to hollow spines than a drawn sword).
- **night_event, lights, Day 1 (97)**: second paragraph only (the listed line). Same facts: pale, low, slow, a loose line,
  all toward the heart of the forest and the dead tree. "Deliberate" became "decided", in James's ruling-things-out voice.
- **night_event, lizard (119, 121)**: the three observations numbered, as a scientist would; the eye "has been making
  observations for longer". The first paragraph stands alone; the nest (and its eggs, which the win scene pays out) stays
  in the second.
- **night_event, crows' scraps (135)**: both result lines; ties to the Day 2 "creditors" text ("take their cut", "judge
  you poor").
- **night_won (152–153, 158–160, 163)**: feathers and rat lines keep their mechanical parts exactly; the three outcome
  lines rewritten; the closing paragraph made form-neutral (no "washes a paw": she may be a woman or a great root-kin in a
  later Coil) and given rider 1 lightly: "Not much night is left to sleep in." Line 154 is all mechanics, untouched.
- **night_lost (168, 170)**: the food line now agrees with the scene ("Some of your food leaves with it"); "A short night,
  and a sore one. HP partly back, Qi full." (mechanical part kept).
- **morning (185, 189–196)**: the no-breakfast line lost "formal complaint" (used in `longforest.js`). Day 2: the inventory
  is "one Yuki" (form-neutral) and carries rider 2 once and lightly: "one lab coat that was white two days ago". Day 3:
  same beats (waking early, knowing the patch, tracks for two nights: large, several, patient; the lights or tonight).
- **wilds hub (220, 222)**: rest line keeps the "An hour of rest" prefix; the ghost-gill line lost "tastes like a cellar"
  (used in `ashfall.js` and `act1_blackroot.js`). The Condensed line (219) is all mechanics, untouched.
- **stream_out (229, 231)**: reworded; ridge, maybe-smoke, too tired, second rise and trunk, three howls. "They've followed
  you." untouched.
- **wild_forage (240, 242)**: the intro no longer says "three good spots" (there are four cards since the honey tree); the
  ring's failure line reworded, numbers kept. "Birds got there first." left as it is (the brief counts it among the
  standing failure lines, and it is four good words).
- **wild_hunt (253, 258)**: Yuki's impatience reworded; the `yukihunt` results are now James watching her hunt ("One rush,
  one hare…", "She misses, sits down, and studies the sky…"), different from the task-hub haul lines.
- **wild_train (266), wild_explore (280)**: reworded, same content.
- **bone_field (290–296)**: same facts in the same order (ribs, the skull, the fifty-metre spine; the Convergence; cores
  taken, the drilled brows, harvested long ago; Yuki on the rib). The skull's "headroom inside for a tall man" leans on
  lore's tall James. Sung success: "For a moment" removed. The failure text on that line is newer (mine) and stays. The
  bone-meal line (297) is untouched: `replies.js` and two tests match "Your bone stakes will be harder from now on."
- **mire (303–310)**: reworded; "Your new doctorate sits up and begs" (lore: three days old on arrival). Ghost-gill
  failure and the fight's intro reworded (the old intro is also in `stomp_prologue.js`). The gills' success text is newer
  and stays.
- **mire_won (316–317)**: the core line keeps "+1 Murky beast core"; the scene no longer counts the rats (see below).
- **hollow (328–337)**: same beats and facts: the bowl of roots, all toward the heart of the forest and the dead tree; the
  Convergence sings; the Hearth Trees' note; the lights' trails or Yuki's silence; the warm root and the forest that lets
  you go. The sit's lines (336) are not listed and stay.
- **task_hubs.js 46–47**: "…${n} hares and no remarks, having decided the hares are remark enough." / "…a hare and drops
  it on your boots." / "…nothing, and blames the wind before you ask." ("owed an apology" is also in `game.js`.)
- **Not changed on listed lines**: scene titles and places (84, 144, 149, 167, 173, 201…), the fallback `'It\'s over.'`,
  and every choice label.

## Task 2 (SW)
Twenty lines in `DR_RING … DR_NEEDLE`, each 14–20 words. Day 3's line is progress on, or a callback to, Day 2's (the ring
regrown, the needle as a berry hook, five paces back, a finger longer, ninety-one to ninety-seven). No success mentions
leeches, stings, pinches, scratches, birds or rainbows.

## Label suggestions (not applied)
- `night_won` and `night_fled`: "Sleep." → "Sleep, what's left of the night." Reason: rider 1; the morning gives only half
  back after a fight or a run, and the label reads as a full night.
- `night_event`, rain: "Get wet. Sleep anyway." → no change needed (no fight, a full night).
- `wild_train`: "Train: darts, blade, footwork, and a very unwilling sparring partner." (in `wilds`) → "…and a sparring
  partner with views." Reason: Yuki pounces with enthusiasm; "unwilling" contradicts the footwork card.
- `night_event`, crows: "Throw them the scraps and keep your eyes." → fine; the result line now answers it.

## Continuity problems found, not fixed
- **Rider 1, code not text (line 170)**: `night_lost` → "Sleep, badly." sleeps to 06:00 at full Qi and 70% HP, and the
  morning then skips `nightRest` (the hour is 6). So a lost night fight does not follow the "half of what they lost back"
  rule; a won one does. The line "HP partly back, Qi full" is true to the code as it stands. `prologue.js` 361
  (`jackals_lost`) does the same at 60%.
- **mire_won (317)**: the old text said "Two rats fewer" but the Mire fight has three rats. I took the number out. If a
  number is wanted, it is three.
- **night_won, rats (159–160)**: the old and new lines both have the rats going back into the stream with one dead, and
  one rat is dressed; a won fight has presumably killed both. Kept as the brief asks (facts stay); worth a look.
- **Form (253, 266)**: `wild_hunt` has Yuki speak "says the bond" and `wild_train` is not form-aware; in a later Coil she
  may be a woman, who speaks aloud. A `byForm` there would be new code, so I left it. The new `yukihunt` and night_won
  lines are form-neutral.
- **wild_explore (280)**: "Three places" is said even when one or two are already visited (as before).
- **Day 3 morning (194)**: the tracks are "large, more than one set", pointing at the ashfangs; the Act 1 bible says the
  tracks circling the camp were Ya's. Both can be true, but nothing says so.
- **Day 2 morning (191)**: "you know nothing about this world" is also shown in Coil 2 and later, when James remembers.
- **Older text on unlisted lines** (present before v0.11.69, so not mine, but the lines were touched later and are not in
  `older.lines`): the crows' intro (70), "It collapses in the night…" (131), "One gets your ankle…" (137), the
  `night_lizard_forced` first sentence (145), the `night_lost` text (169), the `night_fled` first sentence (174),
  "Rainbows, then nothing. Gone." (255), "It flaps off honking…" (256), the Hollow sit's success line (336). Left alone
  per the brief; say the word for a pass over them.
- **Test fixtures with the old haul texts** (`tests/tasks.test.mjs` 2086, 3034, 3036): sample strings only ("owed an
  apology", "mild contempt"); they pass, but no longer quote the game.

## UL (owner pick CA1): the older prose on the nine unlisted lines
Only the parts that were in the file before v0.11.69 (checked against v0.11.68); my later text on those lines stays.
- **70, crows' intro**: "…come down out of the dark on a reek of old meat, making for your food and, after it, your eyes." (the order of food, then eyes, matches the scene text).
- **131, lean-to failure**: "The roof folds up before dawn. Wet, cold, −2 HP." ("−2 HP" kept).
- **137, trunk failure** (older): "The quicker one reaches your ankle first: −3 HP." ("−3 HP" kept).
- **145, night_lizard_forced**: first sentence pair only: "A dry branch cracks under your heel. The lizard hears a declaration." The great root-kin's line stays.
- **169, night_lost**: the first part up to the byForm ("You lose, and without any drama…the winner collects what it came for and goes."); the byForm and the "still edible" tail stay.
- **174, night_fled**: first sentence only; the great root-kin's line stays.
- **255, hare miss**: "A burst of rainbows. No hare." (the old line is also in `longforest.js` 327, which now differs; the brief's "Rainbows, then nothing" is gone from the Wilds).
- **256, fowl miss**: "It labours away over the reeds, honking remarks about you."
- **336, Hollow sit, success**: "Your Qi runs out along the roots and comes home clean, a breath held and let go." then the Saturation part exactly as it was. The failure text stays.
Checks: the load check ok; the five-word-run and tic check clean (only the generic "at the edge of the"); no test or tool matches any of the nine old strings.

## RV1 (owner pick after the cold review)
- **M1, no counts in success replies**: `DR_RING` 1 "The ring is sound to the stem. You cut from the outer edge and leave the middle to its work." / 2 "The ring has closed the gaps you cut yesterday. You cut from the edge again, and wonder who is farming whom."; `DR_HARE` 1 "The dart is there before the bolt is. The glass plates stay dull, which is how you want them." / 2 "A shorter stalk today, and a cleaner throw. Yuki's tail stops ticking a full second before the dart lands." Neither says how many or that the haul was whole; Day 3 still builds on Day 2.
- **L1**: Day 2 morning: "one lab coat that was white yesterday".
- **L2**: bone_field: "it is a graveyard, and the dead in it were *things*".
- **L3**: hollow: "Roots, though not a tree's, or not *only* a tree's: each as thick as a man…".
- **L4**: the "no objections" shape stays in `DR_CRESS` 1 only; `DR_HARE` 2 as above; `DR_CRAB` 1 now ends "It was simpler than the crab made it look."
- **L5**: the thornback's intro: "The thornback's ridge of spines comes up in one wave, rattling like a quiver being emptied." (one ridge, as in the scene).
- **L6**: night_won ends "What sleep is left will not be enough." (short rest, not a missing night).
Checks: the load check ok; five-word runs and tics clean. List sizes, `${...}` and everything outside the literals unchanged.
