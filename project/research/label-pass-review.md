# Label pass (v0.11.179): the cold review on Opus, word for word

Brief: `label-pass-review-brief.md`. Planted faults: `label-pass-faults.json` (the reviewer's 16). The owner picked RV2 (R1–R11 + TG, Claude's cuts of words already seen; 16:42).

## The report

- H · act1_return.js:162 `rt_mei_talk` · New kiss label "Catch Mei Lin's hands while they're empty" contradicts the screen: the text above has her walking "with her herb-knife out… She needs a thing in her hand", and the result has her kiss back "with the knife held carefully out to one side". It also echoes "Take her hand and say nothing" on the same screen. · Make it about the knife/one free hand, not empty hands.
- M · longforest.js:375 `lf_train` needle drill · New label makes splitting the goal ("until each needle splits the last"), but two of its own result lines still answer the old knuckle-width brief: t4[2] "splitting… was not the drill", t4Fail[0] "The brief said knuckle" (longforest.js:57–58). Label now contradicts its results and kills the joke. · Restore the knuckle-width in the label or change the two results.
- M · act1_return.js:29 `DRILL_AGAIN.hard[0]` (T2) · "Cleaner than this morning's" assumes the first drill was in the morning. On Day 20 you reach `rt_ashfall` around 10:20–11:30 (06:00 +90 +30 +20/60 +60/90); a first drill taken after the palisade/grove runs in the afternoon, and practice repeats until 19:00. False on ordinary routes. · Use a word with no time in it ("than the last one's", "than before").
- L · act1_return.js:145 `rt_ya_talk` · "Close the last half-step… before she gets there first" doesn't fit the text, where she "is right up against you with no warning"; she has already closed it. · Drop the half-step.
- L · act1_blackroot.js:815 (K4) · Human branch "Take the hawks." drops the threat, but Ya's human-form lines still say "They'll go for the small one" / "They want the small one". The comment "only the cat is prey" doesn't match; the K4 test pins it. · Keep a threat in the human label or make Ya's human lines say whom she means.
- L · yuki_path.js:501 (W1, great root-kin) · "all of her" repeats the joke right above ("Yuki takes the floor in front of the stove. All of it."): same joke twice on one screen. · Cut one.
- L · yuki_path.js:502 (W2) · "Leave the door open for Yuki" says she follows, but the result says "So, it turns out, is Yuki" (she is already in the grove). Mild mismatch. · Make the label not say who arrives first.
- L · act1_blackroot.js:478 `rr_roots` · "maze" appears nowhere else in the game; the root road is one broad root "like the backbone of a sleeper", and the text has you already kneeling with your palm on it, so "find a still place in the maze" doesn't fit. · Use a word from the scene.
- L · longforest.js:265 `lf_hub` · "(Advances the story: Day 4 begins.)" is followed on the very next screen by `lf_exit`'s "Walk toward the smoke. (Day 4 begins.)": the same note on two screens in a row. · Keep it on one.
- L · wilds.js:230 the Wilds' "Train: … with views." · In task mode this choice leads to the `wild_train` menu, which is folded into Practice cards; the label is never drawn (confirmed via `taskCards`), so the fix is dead text and the test pins a string no player sees. · Drop it from the list or note it as cosmetic.
- L · yuki_path.js:86 (the tic swap) · "Her ears stay forward" swaps one tic for a growing habit: 9 "ears … forward" across the story files. · Pick another beat.

Test gaps: TG · O2a · LB1 (O2) renders `lf_trial_won` only with `lf_trials_won` undefined, so only the "won't" branch is checked; putting "The it" back in the second-win branch ("will be back tomorrow", longforest.js:597) passes. TG · TIC1, TIC2, TIC3 · Nothing guards the four tic replacements beyond the exact 'Gold eyes, level' string; planting "for a long moment", "Gold eyes level." or "Gold eyes, steady" all passed. TG · RD1 · the `DRILL_AGAIN` pools are not tic-checked ("for a long moment" in hard[2] passed). TG · H1b (caught, by a crash) · story.test.mjs:3510 `.find(…).do` unguarded: a changed rr_scout label throws a TypeError instead of failing an assert.

Counts: 1 H, 2 M, 8 L; 16 faults planted, 11 caught, 5 missed (O2a, TIC1, TIC2, TIC3, RD1), 0 not applied.

(Note: the reviewer's report above is lightly condensed by Claude from its returned text; nothing added.)

## After RV2 (Claude)
- R1 "Kiss her before she finds something else to hold." · R2 the old needle label back · R3 "Cleaner than before." · R4 "Kiss Ya before she gets there first." · R5 the human keeps "…before they take Yuki." (only the great form reads "Take the hawks.") · R6 "Call the cat off the floor, and follow Mei Lin up the ladder." · R7 "Go after Ya to the grove, and leave the door open." · R8 "Cultivate on the root. The song knows its way in." · R9 `lf_hub` "(Advances the story.)" · R10 "Her gaze stays on you." · R11 no change (the Wilds' Train label is never drawn in task mode; kept, cosmetic).
- TG: O2's later-win branch; the card's tic list over every text the push touched (the four Yuki texts, every changed label, Yuki time's labels, `DRILL_AGAIN`), with four older tics in those texts listed as known (the fire night's "a long time" twice, the first asking's "the first time" and "a good deal"; on the roadmap); the four beats pinned; the `rr_scout` lookup guarded.
- `tools/mutate.mjs` again (three faults' `find` updated to the new words): 14 caught, 0 missed, 2 not applied (K4a, K4b: R5 changed their text; K4's per-form test covers both).
