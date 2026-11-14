# Part 6, run 1 (the Heart's scenes): Fable's notes

File edited: `/tmp/rw-p6/js/story/act1_heart.js` only. Not committed. Scratch scripts in `/tmp/rw-p6-fable/` (outside the worktree).

## Checks run
- Load check: `node -e "import('./js/story/act1_heart.js')..."` prints `loads`. `grep -n "TODO"` prints nothing.
- Choice labels: every `{ text: '…'` label compared old against new: identical.
- `${…}` count: 121 → 124 (+1 `byForm` in `ht_start`, +3 `g.flags.ship_found` in `heart_night`, −1 `${n}` in `heart_camp`): exactly the code the sheet allows.
- `node tools/textlint.mjs` (log only), the Heart: words 3910 → 4132 (+5.7%), sharedScenes 24 → 12, favScenes 23 → 12, tics 5 → 0, spacing 3 → 0, broken 0.
- Per scene, first render (cat, Ya along): all within ±25% except `heart_morning` 36 → 49 words (+36%: the CW line, see below) and the no-ship quiet night 38 → 46 (+21%, the sheet's new branch).
- **`node tests/story.test.mjs --quick`: 37 FAIL lines, all of them tests that pin the old wording** (Claude's to update with the build; none is a logic failure): NC1 `heart_spring:2` and `heart_camp:2` "the first day's reply is the old one" (6); NF1 `log_comfort` (Mei Lin's and Ya's branches found by their old first words; the trio branch's human `JUDGE` regex "like a small judge in a black dress") (18); NQ1 `roots_fall` as tiger and `heart_spring`'s result in three forms (4); YB1 `ring_lost` / `roots_lost` (5); XB2 `ring_forced`, `guardian_half`, "the human's clause" (4): the three human branches are no longer empty, and two tiger/human strings changed.
- The stomp texts (`stomp_act1.js` 302–378) still open with the old encounter intros and repeat `ring_won` / `roots_won` / `guardian_won` word for word: run 2's.

## Per scene (what changed, why)
- `HALL_WHEN` row 1 (4): rewritten; night now names "ten paces of firelit floor" (row 2's "the same ten paces" builds on it); morning keeps "slides down the cracks" (row 5 refers to it); rows 2–5 kept.
- `DR_HC_YA` 1: rewritten; "tracked" for "followed"; one CW sentence added (below). Entries 2–4 kept.
- `DR_SP_SIT` 1: rewritten in all three forms (same sentence, the form's clause as before). Entries 2–3 kept.
- `LOG_JUDGE.human`: "in a black dress" → "in a high black collar" (the tic; a test pins the old words).
- Encounter intros (`husks`, `rootThings`, `guardianFight`): rewritten; the rot's "four hundred years" → "four centuries of dark".
- `wake`: "Slept until 06:00. HP and Qi full." kept exactly; the no-breakfast line rewritten ("No breakfast." kept), CW clause added.
- `ht_start`: Task SM (below).
- `heart_gate`: starts from "the doorway is no doorway. It is a cut"; "top to bottom" dropped (`heart_view` has the gap half buried at the foot); "since the lab" → "a smell you last met in a laboratory on another world". **Fix:** the `gate_listened` line said "You heard it already: a single note" even after the failed check (failDo sets the same flag and says "Silence"); now fits both: "You have put your hands to it and listened already. Whatever lies down there, the sap is right about it: not dead. Not quite." Both result lines rewritten.
- `heart_gate_marks`: "On the far side" dropped (it was a third of the way round; also the tic). Yuki's no-Ya line made to fit all three forms ("considers the carving, sneezes at it once, and turns her back on it with her tail very straight"; no sniffing on all fours).
- `heart_hall`: TY ("Four centuries of dust"); "Light comes down" and "Your people grow" (lint favourites) gone; spacing fixed by moving the blank line into Ya's string.
- `heart_hub`: the six `where` lines rewritten (the second still names no ship); the cultivate and rest result lines (mechanical part kept); my own late line "patient for four hundred years" → "patient four hundred years" (the tic).
- `hall_listen`: both result lines ("−2 HP." kept). Scene text not listed: kept.
- `ring_chambers`: TY ("six hundred years of elbows"); seal result line.
- `ring_forced`, `ring_lost`: human branches written (YF below); in `ring_lost`'s tiger line "four hundred pounds of cat" → "that much cat" (the tic).
- `ring_won`: rewritten; the cup "made when the ship was new, a thousand years ago" (TY: the fact kept); result line ("+1 Hull-shard" kept).
- `heart_spring` day 1: rewritten. Day 2 (mine): "forty gardeners wore it smooth" → "gardeners wore it smooth, one sitting at a time": the second spring day can come before the log, and "forty" is only known from Wren.
- `sect_cut`: rewritten; tic "the first" ×3 → ×2 ("On the first day" → "On the day you arrive"; the inscription untouched). "This is where they reached in" → "This is where they went in after it" (see Continuity 1).
- `heart_roots`, `roots_dark`, `roots_caught`, `roots_won`: rewritten; "her herb-knife" → "her knife" in `roots_won` (lint favourite). Result lines rewritten around "−4 HP.".
- `roots_fall` (text not listed): TY only ("dust that has had four hundred years to get this soft"); tiger branch "all four hundred pounds of her" → "the whole white length of her".
- `roots_lost` (not listed; byForm review + the tic): "the lip of the shaft" → "the lip above" ("the shaft" ×3 → ×2); human "Yuki in a black dress" → "Yuki in a qipao that has not picked up so much as a thread of husk".
- `ship_wreck`: rewritten; "stand there for a long time" gone; Ya "plants herself next to you" (James is standing; the old line had her sit on a root "next to you"). The first paragraph "It's a ship." kept.
- `ship_touch`: rewritten. "Not warm like the spring" → "Not as a stone by the fire is warm" (the spring may not have been found).
- `ship_log`, `ship_log2`, `ship_log3`: Task LG (below); `ship_log2` "I think" ×3 → ×1, the halt kept ("But this is... it's better. I think this is what we were for."); "three hundred years in" → "three centuries in" (lint favourite).
- `log_reaction`: the three result lines. `log_comfort`: Ya's and Mei Lin's branches rewritten at exactly their level (the knees, the finger, the bitten ear; the hand in both of hers, the forehead on the shoulder; Ya watching); "after a long time" → "when she can". Trio branch (not listed): only "for the first time since the lab" → "it is the one night on this world that" (two tics).
- `heart_camp`: Task NC; three mood lines rewritten.
- `heart_night`: whisper night 1 rewritten (keeps "No" twice, the laugh or sob, the wink: later nights refer to them; keeps the lower-case word "whispering", which a test looks for); knock night 1 rewritten; quiet nights: Task NC. Knock night 4 (mine): "looks at you for a long time" → "gives you a long look" (the tic).
- `heart_morning` day 1: rewritten; "making tea from the spring water" → tea with no source (the spring may not be found); CW line. Day 4 (mine): "for four hundred years" → "for four centuries".
- `guardian_approach` day 1: rewritten. **Fix:** "The same note you heard at the gate" was only true after a passed check at the gate; now "the note that came out of the doorway the night you slept in the roots" (`heart_view`, true for every game). "when it sees you" (it has no face) → "As you come in". Tic "who comes" ×3 → ×2 in all three days: "*Who comes,* it sings. *Who. Who comes to the heart.*"
- `guardian_half`: result line; human branch (YF); "For a moment it stops" → "For a breath it stops".
- `guardian_calmed`: rewritten; "It looks at you for a long time" → "The blank head stays turned on you while it thinks that over"; "for four hundred years" → "awake four hundred years"; Ya's hat kept.
- `guardian_won`: rewritten ("For a moment" gone); result line ("+2 Hull-shards" kept).
- `guardian_lost`: rewritten; Ya no longer "swearing in three languages" hauling him "by your collar" (the same gag is in `roots_lost`): "cursing steadily in whichever language comes to hand".
- `guardian_bypass`: rewritten; "on the wrong side of the guardian" → "behind the guardian" (he is on the heart's side); result line (the mechanical part kept).
- `heart_core`: YF ("her eyes are very bright", no colour); tic "the hollow" ×3 → ×2; "For four hundred years" → "Four centuries"; spacing fixed. Both seed result lines ("+1 Seed-sliver." kept).
- `heart_core_after`: rewritten; "You look down at the seed-sliver" names no hand (Mei Lin may be carrying it).
- `ht_leave`: both result lines ("HP and Qi full." kept). Text (mine): see Continuity 2.

## Task SM (`ht_start`)
Starts in the roots where they slept, by daylight; the size of it seen properly ("None of that was preparation" kept); "Last night something in there sang back, faint as breathing. This morning your Convergence sings to it and gets nothing at all. That is the worst part. You are used to Hearth Trees that answer." No forest stopping, no clearing. Ya's line kept (reworded lead-in, her words the same). Mei Lin's silence kept, then `${byForm(g, …)}`:
- cat: "She has reached up to your shoulder and laid two fingers on Yuki's back, and Yuki is letting her."
- great root-kin: "She has a hand on Yuki's back, sunk to the wrist in white fur, and Yuki is letting her."
- human: "She has taken hold of Yuki's sleeve, like a child at a river crossing, and Yuki is letting her."
Label: "Cross the clearing." → "Walk to the doorway." (Claude's; the text is written for it: they are among the roots, the doorway in sight, and `heart_gate` opens "Seen close, by daylight, the doorway is no doorway. It is a cut.")

## Task LG
- `ship_log`, Wren's new wording (for lore.md's quote): *"Something died here, long before us. A lot of somethings. It's in the air, the water, the soil, and the people here breathe it. It makes them hard, and hungry, and short-lived. Short as we measure a life, at least; I have no other measure with me."* (the order is now hard, hungry, short-lived, so that her qualifier follows the word it qualifies).
- `ship_log3`, the last paragraph (86 words, was 74): "You sit in the gardeners' chair with the memory seed going cold in your hands, and you understand. This world had its cure once. It was a tree. Forty gardeners planted it and asked nothing, and for six hundred years it made the Qi clean. Then the Crimson Lotus killed it, let the old poison back up, and opened a shop. The pills. The herbs. The cores. The Sect itself. Four centuries of selling the cure by the mouthful, where the Old Tree gave it away." No "outlier", nothing on whose world is normal.

## Task NC
- `heart_camp`: "Night inside the Old Tree, the place the whole expedition was for. ${mood}" (`${n}` dropped; `const n = day(g);` is now unused: Claude's to tidy).
- `heart_night` quiet nights 1–3, each with one `${g.flags.ship_found ? … : …}`; before the ship: 1 "a warmth you have no name for yet comes up through the floor, and … the dead wood almost seems to breathe" (the forty gardeners are now only in the ship branch: he can't count them before the log); 2 "something you can't put a name to yet keeps up one low note"; 3 "the sap you smelled at the doorway is still moving, slow and patient". Night 1 became a template literal; 2 and 3 already were. Night 2: "takes a long time to land" → "takes its time landing" (the tic).

## Task TY
`heart_hall` "Four centuries of dust"; `ring_chambers` "six hundred years of elbows"; `roots_fall` "dust that has had four hundred years to get this soft"; `ring_won` keeps the thousand ("made when the ship was new, a thousand years ago"). No "for four hundred years" left in the file.

## YF spots
- `ht_start`: above.
- `ring_forced` human: ` Yuki looks at the hole, then at you. "I have watched you make thicker soup," she says, and comes up level with your shoulder.` (the tiger blocks the gallery behind; the woman fits it and steps up beside him).
- `ring_lost` human: ` Yuki is out already, standing clear with her tail held up off the floor, taking splinters out of her sleeve one by one. "They have the shelves," she says. "I don't see why they need us as well."` (the tiger backs out and licks her paw).
- `guardian_half` human: ` So is Yuki, ears forward, quite still. "I know that one," she says, to nobody. "They sang it over both of us."` (the same grove, said aloud; nothing settled about sister or lover).
- `heart_core`: eyes without a colour. `heart_gate_marks`: the no-Ya Yuki line fits all three. `DR_SP_SIT` 1, `roots_fall`, `roots_lost`, `LOG_JUDGE`: above. The other byForm lists and `LOG_LOOK` / `LOG_HOLD` (labels) / `LOG_SEAT` reviewed and left.
- **No switch, noted only:** `guardian_bypass`'s hollow root is "just wide enough to take a body": the great root-kin cannot crawl it; the text doesn't mention Yuki, so nothing is wrong on screen. `heart_night` knock night 1 "Yuki growls at the dark for an hour" reads for all three (the woman growls too).

## CW lines (3)
1. `DR_HC_YA` 1 (the ledge, Ya): "Your fire settled it, she says: a man who gives Yuki the best piece is not as cold as he talks."
2. `heart_morning` day 1 (breakfast, Mei Lin; the not-in-the-heap branch): "…up already, and has set the first cup of tea by your bedroll, since the cook, she says, eats last". (This is what takes the scene to +36%.)
3. `wake`'s no-breakfast line (Ya): "Ya, who has watched you feed everyone else first since the root road, feeds you: something out of her belt-pouch. You decline. She takes it personally. You eat it."
No music line (nothing fitted the hall without a speech). None in the log, the comfort scenes, the guardian or the heart-chamber.

## Label suggestions (not edited)
- `ht_start`: "Cross the clearing." → "Walk to the doorway." (the sheet's; needed).
- `heart_gate_marks`: "Back to the split." fine. `ring_lost` / `guardian_lost`: "Back to the hall." fine.
- `heart_spring`: "Wash, quickly, at the far end, …": "the far end" is close to the tic "the far side" but is the pool's own geography in the replies; leave.
- `guardian_bypass` choice in the hub: "Go round the guardian. Whatever it costs." fine.

## Continuity: found, not fixed (or fixed outside the list: say if unwanted)
1. **Where the heart was taken** (`sect_cut`, `ship_log3`, `heart_core`): the high wound is "where they reached in" and the rim says "Here the Crimson Lotus took the heart", but the heart-chamber and its scorched hollow are below the ship. I softened `sect_cut` to "This is where they went in after it" (they entered there and went down); the inscription and the log's "reaches into the hole" are unchanged. Open for Claude and the owner if the geography should be said outright.
2. **`ht_leave` (not in my list; I changed three phrases because the M3 fix made them wrong):** "the clearing is full of birds" / "into a clearing that is exactly as silent" → "the roots are full of birds" / "into roots exactly as silent as they were when you came"; "from the edge of the trees" → "from the first black ridge" (the tree stands in the burnt Ashen Hills, no forest edge: `ah_enter`); "for four hundred years" → "these four hundred years". Revert if a list-only edit is wanted; then the clearing and the trees stay as a known seam.
3. `guardian_bypass`: the text says the crawl takes four hours; the hub's choice costs `time: 60`. Not changed (times are code).
4. `guardian_calmed` / `heart_core`: the green glow sits in the hollow of the guardian's chest, and the seed-sliver at the bottom of the hollow the Tree's heart left; the guardian sings "Keep it. Plant it." Both kept as they were; a reader may take them for one thing. Open.
5. `guardian_lost`: the old text had Ya or Mei Lin "find you there" after a fight they were in; now "Ya is the one who gets you up the shaft".
6. `wake`'s no-breakfast line and several scenes assume Ya is along; `ya_party` is always set before the Heart (`act1_fallout.js` 684/771/781), so the no-Ya branches are unreachable today. They are rewritten anyway.
7. `heart_hub` line 208 and `heart_camp` DR_HC_YA 4 ("For a long time she says nothing") are mine and unlisted; only the first was touched (the tic).
8. `rt_start` (the Return) has the seed "in your hammerspace" while `heart_core`'s second choice has Mei Lin carry it out in her sleeve: the Return's line, not mine; noted.

## After the coordinator's review
- `DR_HC_YA` 1, the CW line: "gives the cat the best piece" → "gives Yuki the best piece" (the entry is a plain string with no byForm, and "the cat" was wrong for the great root-kin and the human); same length, no new code. Load check rerun: loads.

# Part 6, run 2 (the Heart's stomp texts): Fable's notes

File edited: `/tmp/rw-p6/js/story/stomp_act1.js`, the entries `husks`, `root_husks`, `guardian` only (lines 302–379, between the PART 3 and PART 4 comments). `act1_heart.js` untouched in this run. Not committed. Scratch scripts in `/tmp/rw-p6-fable2/` (outside the worktree).

## Checks run
- Load check: `node -e "import('./js/story/stomp_act1.js')..."` prints `loads`. `grep -n "TODO"` prints nothing.
- `git diff`: every changed line is inside 303–378; `yu`, `yuShort`, `pick` and the other parts unchanged.
- Signatures kept: `posture: (g, d)`, `husks.win` `(g)`, `root_husks.win` and `guardian.win` `()`, every `one: ()`. `pick(d, …)`: three branches each, order 1, 2, 3.
- `${…}`: 3 → 4 (the three `pick`s kept; +1 `${yu(g)}` in `husks.posture`, the sheet's YF helper).
- Words, all 12 strings: about 1,200 → 1,330 (+11%). Per rendered string (old → new, cat): husks posture 46/49 → 56/61 (+22/+24%, the Yuki clause), win2 104 → 120, win3 149 → 171, one 17 → 17; root_husks posture 70/73 → 77/76, win2 88 → 104 (+18%), win3 114 → 116, one 25 → 24; guardian posture 78/86 → 91/96, win2 158 → 177, win3 187 → 214 (+14%), one 22 → 20. All inside ±25%.
- Tics: none of the brief's list in the three entries. "a thousand years" only on the cup. No "for four hundred years" (three plain "four hundred years" / "four centuries": the rot, the wait, the key).
- Five-word runs checked by grep against `/home/claude/bone-and-ash/js` and run 1's `act1_heart.js`: what is left is dialogue kept on purpose (Ya's "*That* I liked … Ask them if they have more.", "It was a good fighter. It didn't want to stop.", "And now it doesn't have to.") and plain connective runs ("for the rest of the", "the fourth ring is quiet").
- No test run: I found no test that pins these strings (`grep` for the stomp entries in `tests/` and `tools/`); Claude runs the suite with the build.

## Per string (what changed, why)
- `husks.posture`: no longer opens with the encounter intro's words; "eating this tree for four hundred years … dessert" → "at this tree since it died, and nobody has yet interrupted them" (Years). Yuki added (YF). `pick`: 1 anger under the disgust; 2 "You mean to raise it with them."; 3 the landlord, kept as the joke it was.
- `husks.win[2]`: the dry part first (short, thorough, grub on most of it, Yuki not cleaning it), then the cup played straight: plain wood, "a thousand years old if it is a day" (his own estimate: see Continuity 1), the name in "the script you could read before you could walk", *Tamsin*, Ya's shoulder. Not a copy of `ring_won` any more: "longer than you would like witnessed. Ya witnesses, and says nothing."
- `husks.win[3]`: the palm on the wall and the fist kept ("for a moment" gone: "for one heartbeat"); "far cleaner than you would have left it"; Ya's restraint about the wall kept.
- `husks.one`: same move, tightened.
- `root_husks.posture`: "the rot has spent its four centuries unsupervised … arms: several more than the work calls for … has since specialised in mouth". **Fix (Continuity 3 of the brief):** the old `pick` 2 and 3 said "between you and the ship"; nobody knows of a ship before `ship_wreck`. Now "Whatever is down there under the roots, the road to it runs through this." / "The road down runs through it. It is not going to be in the road for long."
- `root_husks.win[2]`: Ya on the husk and her line kept word for word; "you could have left out two of the three" carries the outclassing; the stab "as a matter of principle". The ending is the same fact in new words: his hand on the wall finds *hull* (still only the word, no ship).
- `root_husks.win[3]`: the bone statue kept; Ya's speech trimmed of "Okay" and the dashes ("No. I don't *like* that. That is going to be in my dreams. … Good ones, probably. Don't look at me.").
- `root_husks.one`: same move ("for the rest of the rot to think about").
- `guardian.posture`: **Fix:** the old text gave it "an empty frame where a gardener once carved a smile"; `guardian_approach` has a smooth seed-pod head with no face anywhere. Now "a smooth white head with nothing on it to plead with". "knowing only that for four hundred years" → "has known nothing else since the tree died". Yuki added in six words (YF). `pick` kept in sense, plainer.
- `guardian.win[2]`: taken apart joint by joint, "no more force than each one asks"; falls "like timber: a lean, a pause, and then the whole chamber floor jumping"; the green stays lit, the note runs down, stops; not out of breath, and the dog whose one offence was guarding the house; Ya's line and James's answer word for word; the two warm pieces and the unspoken promise kept (they are the scene's +2 Hull-shards).
- `guardian.win[3]`: he sings the whole song; the fists stop; it knows his kind; it kneels, palms up, "as a steward gives back a key"; **its own note finds the rest of the lullaby and follows his to the end, then stops**; the frame eases apart joint from joint (so the frame is broken, as `guardian_won`'s haul says, and it is still not `guardian_calmed`, where it stays whole and speaks). To lead into `guardian_won`'s facts I gave Ya half her scene line ("It didn't want to stop") and James his answer, with the old text's own fact folded in: "It waited four hundred years for somebody to come home. Now it doesn't have to." "for the first time" and "for a long time" gone. The green no longer "goes out": it "sinks to a low and steady glow" (see Continuity 3).
- `guardian.one`: "gives back the key it has held four hundred years, and rests" (the tic "for four hundred years" gone).

## YF spots
- `husks.posture`: `${yu(g)} looks at them, then at you.` cat: "Yuki, on your shoulder, looks…"; great root-kin: "Yuki, the size of a tiger and twice as bored, looks…"; human: "Yuki, in her human form, arms folded, looks…". Used once only: posture, one-move line and win text are shown in the same fight, and the helper's phrase would repeat.
- `husks.win[2]` "Yuki has plainly decided none of that is hers to clean up." and `win[3]` "Yuki inspects the floor and can find nothing to object to, which annoys her.": plain name, fits all three bodies, no helper.
- `guardian.posture`: "a song you were rocked to sleep to, and Yuki with you": all forms; agrees with `guardian_half` ("They sang it over both of us"); settles nothing about sister or lover.
- `guardian.win[3]`: "Yuki has not moved since the first bar.": all forms.
- `root_husks`: no Yuki (she does not matter there, and the `win` functions take no `g`). `yuShort` not used (its great root-kin phrase is the tic).

## CW lines
None (the sheet: none in run 2).

## Label suggestions
None: no labels in these entries. ("End it in one move." is engine text.)

## Continuity: found, not fixed
1. **`ring_won` (run 1's, mine, read-only here), line 265:** the cup is "made when the ship was new, a thousand years ago", but the ring-chambers can be cleared before `ship_wreck`, when nobody knows of a ship (the brief's Continuity 3). My stomp texts say only "a thousand years old if it is a day". Suggested fix for the scene, same length: "plain wood, as old as the tree itself, a thousand years".
2. **`guardian.win[2]` and `guardian_weak`:** `guardian_won` has a branch for `g.flags.guardian_weak` (after the half-song the broken note smooths out into the whole lullaby for three heartbeats). The stomp `win` functions are `() =>`, and signatures are fixed, so win[2] has one wording for both: "The note goes on a little while yet, quieter each time round." If Claude makes it `(g) =>`, the branch could be: `${g.flags.guardian_weak ? 'Then, because you sang to it and part of it was listening, the note smooths out: three heartbeats of the whole lullaby, every line in place.' : 'The note goes on a little while yet, quieter each time round.'}` Win[3] needs no branch (he sings, and its note finds the whole song either way).
3. **The green light** (run 1's note 4, still open): in win[3] the old text put the green out; `guardian_won` leaves it alight and `guardian_calmed` has it "waiting" in the chest, while `heart_core` finds the seed-sliver in the heart's hollow. I left it glowing low, which contradicts neither.
4. **Ya is assumed** in all three entries (as in the old texts; the sheet: she is always in the party here). `ring_won`, `roots_won` and `guardian_won` still carry no-Ya branches; the stomp texts have none and cannot get one without new code in `root_husks` and `guardian`.
5. `root_husks.win[2]` "bone and needle and Ya's spear": the needle is Mei Lin's (as in the old text); she is not named in it.
6. Degree 1's `pick` branch is never shown (degree 1 uses the encounter's own intro); the three first branches are rewritten anyway.

# Run 3 (the owner's pick OL1: four open items)

Files: `act1_heart.js` (four strings), `stomp_act1.js` (`guardian.win[3]`, two phrases). Text only; no code, no labels, no `${…}` touched. `guardian.win[2]` untouched. Load check prints `loads`; `grep -n "TODO"` prints nothing. Scratch scripts in `/tmp/rw-p6-fable3/`.

1. **HW, `sect_cut`, first paragraph.** "They came in here from above, once the split was made below. This is where they went in after it." → "The heart never lay up here; it lay far below, deep under the roots. The split at the foot was their door and this was their chimney: cut in from above, so that what they tore loose down there could be hauled up the hollow trunk and out." Why: the inscription's "Here … took the heart" is now the Sect's boast over its way out, and the hollow in the heart-chamber is where the heart was. The inscription and Mei Lin's lines are word for word. (Paragraph 44 → 73 words; the scene as a whole +14%.)
2. **CR, `guardian_bypass`.** "Crawling it takes four hours. They are the worst four hours of your life, and your life includes the lab." → "Crawling it takes an hour. It is the worst hour of your life, and your life includes the lab." Why: the hub's choice charges `time: 60`.
3. **GL, `guardian_approach` (day 1).** "and in the hollow, faint, something glows green." → "and in the hollow, faint, burns a green light of its own: the last of its sap, kept like a lamp." Why: the chest light is named as the guardian's own at first sight. Days 2 and 3 ("The green in the hollow of its chest…", "standing over the glow in its chest like someone shielding a candle") kept: a lamp of its own reads right there.
4. **GL, `guardian_calmed`.** "The hollow in its chest stands open. The green light is waiting.\n\n*Keep it,* it sings, and the voice is going," → "The lamp in its chest, the last of its own sap, burns low.\n\n*Keep it,* it sings, and the blank head turns from you to the scorched pit in the chamber floor, and the voice is going," Why: "Keep it" now points at the floor, not at its chest; the seed is not shown (`heart_core` finds it). Scene about +8%.
5. **GL, `STOMP.guardian.win[3]`.** "as a steward gives back a key. Its own note" → "as a steward gives back a key. The blank head turns once to the scorched pit in the floor, and back to you. Its own note"; "the green in its chest sinks to a low and steady glow" → "the green in its chest, its own last sap, sinks to a low and steady glow". Why: the same turn of the head; the key it gives back is in the floor, the light is its own. About +9%.

Notes: "pit" for the floor's hollow in items 4 and 5 keeps "the hollow" for the chest in the guardian's scenes (and off the tic count); `heart_core` ("the hollow it was cut from … black, scorched") unchanged and agrees. `guardian_won` ("the green still alight in its chest") and `guardian_half` ("The green in its chest flares") not in the sheet, not touched; both read as its own lamp now. A test that pins "four hours", "The green light is waiting" or "went in after it" would be Claude's to update (none looked for).

## Run 4 (the review's text fixes, owner pick RV1)

Text only; no code, no labels (L5's placeholder string replaced). Old → new, one line why.

1. **M1, `sect_cut` (first paragraph).** "The heart never lay up here; it lay far below, deep under the roots. The split at the foot was their door and this was their chimney: cut in from above, so that what they tore loose down there could be hauled up the hollow trunk and out." → "The heart never lay up here: the scorching runs on down the inside of the trunk, past the hall floor and out of sight, and whatever they cut loose, they cut loose down there. The split at the foot was their door and this was their chimney: opened from above, so that what was lifted out below could go up the hollow trunk and out." Why: he reads it off the burnt wood and no longer knows where the heart-chamber is; "lifted out below" fits `ship_log3`'s man in red taking it out with his own two hands, the chimney being only the way out. Door, "chimney" and the inscription kept. `ship_log3` not touched.
2. **M2, yuki_time `heart_hub:1` (cat).** "the only pawprints in a thousand years of dust" → "the only pawprints this dust has taken since the tree died". **`heart_hub:5` (all three).** "The dust was a thousand years deep when you came" → "The dust was four centuries deep when you came". Why: the dust is four hundred years' worth, as in `heart_hall`; worded two ways.
3. **M3, stomp `guardian.posture`.** "It does not know you. It knows *intruder*, and it has known nothing else since the tree died." → "If any part of it knows you, it is not the part lifting its arms. That part knows *intruder*, and it has known little else since the tree died." Why: true whether it never heard him, half-recognised him in the song, or remembers a lost fight.
4. **L1, `ht_start`.** "None of that was preparation. Stand up, tip your head back, and the trunk" → "None of that was preparation. Tip your head back, and the trunk"; "Last night something in there sang back, faint as breathing. This morning your Convergence sings to it and gets nothing at all." → "Last night something in there sang, faint as breathing, and your Convergence sang back. This morning the doorway stands a little wider than it did, and your Convergence sings to it and gets nothing at all." Why: matches `heart_view` (the tree sang, he answered) and `bl_end` (already up; the doorway wider). The three pinned sentences kept word for word; "sang back" is still there.
5. **L2, `guardian_calmed`.** "turns from you to the scorched pit in the chamber floor" → "turns from you toward the dark behind it, where the chamber floor falls away". **`STOMP.guardian.win[3]`.** "The blank head turns once to the scorched pit in the floor, and back to you." → "The blank head turns once toward the dark at its back, where the floor falls away, and then to you again." Why: `heart_core` gets to show the place first. A test pinning "the scorched pit in the chamber floor" / `/pit/` is Claude's to update.
6. **L3, `wake`.** "No breakfast. Ya, who has watched you feed everyone else first since the root road, feeds you: …" → "No breakfast. Ya feeds you: …" (rest unchanged). Why: the line returns every foodless morning; the CW count for the part is now 2.
7. **L4, `ring_chambers`.** "worn glossy by six hundred years of elbows" → "worn glossy by centuries of elbows". **`ring_won`.** "plain wood, as old as the tree itself, a thousand years." → "plain wood, and older, by the grain, than the wall grown to hold it." Why: no numbers he can't have yet; the cup came with the ship, so it is older than its niche. Tests pinning either are Claude's to update.
8. **L5, `heart_camp`.** 'L5 TODO' → "Behind the bone door the guardian still sings its one broken line, to nobody. You know what it is asking now, and you crawled round the question." Why: the mood for `guardian === 'lost'`; two sentences, the length of its neighbours.
9. **L6, stomp `husks.posture`.** "${yu(g)} looks at them, then at you." → "${yu(g)} counts them, and stops early." Why: no longer echoes `ring_forced`'s human line; reads after all three `yu(g)` openings (shoulder; bored; arms folded).
10. **L7, `ht_leave`.** "from the first black ridge" → "from the last of the roots". Why: `rt_start` begins as they come out of the roots.
11. **L8, `STOMP.guardian.win[2]`.** "Two pieces of its frame have broken clean away." → "Two pieces of its frame have come away whole, at the joints." Why: agrees with "You do not break it". The scene's result line ("out of the guardian's broken frame") is not in this sheet and still says "broken": left, noted.
12. **L9, `guardian_bypass`.** New last paragraph: "Yuki is in the chamber before any of you, without a mark on her. You do not ask." Why: all three forms are in `heart_core` afterwards and the great root-kin can't take the crawl; no form named. Scene about +8%.
13. **L10, yuki_time `heart_hub:2`.** Cat and great root-kin: "You have been over the walls twice and found no rot. Four hundred years dead, and not one fruiting body." → "You have been over the hall's walls twice. The rot keeps to the roots; up here, four hundred years dead, nothing grows, not one fruiting body." Cat also: "nothing is eating it" → "nothing is eating the walls", "in a tree with no mushrooms" → "in a hall with no mushrooms". Great root-kin: "*Nothing will eat this wood,*" → "*Nothing will touch these walls,*". Human: "\"No rot,\" you say. \"Four hundred years dead, and not one fruiting body.\"" → "\"The rot keeps to the roots,\" you say. \"Up here, four hundred years dead, and not one fruiting body.\""; "\"Nothing will eat it." → "\"Nothing will touch these walls." Why: agrees with `roots_dark` and the grubs; the joke, the bond speech and the woman's spoken lines kept by form.

Check: the three files load ("loads"); `grep -n "TODO" js/story/act1_heart.js` prints nothing. Nothing committed.
