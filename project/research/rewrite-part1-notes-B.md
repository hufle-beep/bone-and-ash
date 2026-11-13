# Notes, task B (prologue.js from `mei_lin` to the end; 100 exact replacements, nothing before line 510)

Applied by a script of exact, single-occurrence replacements (one fresh read and write per replacement), so task A's edits in the same file are kept.
The script: /tmp/claude-0/-home-claude/4b497c36-d002-527c-abb9-938718788a1d/scratchpad/rwB.py

## Per scene
- `mei_lin`: tighter accusation ("a charge read before a magistrate"), em-dash runs cut, "Ask a botanist." for "Depends who you ask." **Rider 1:** line 513 (not on the list) got a three-word touch: "her white jacket, tied with a red sash".
- `lore`: tics and "they eat" run trimmed. **Rider 6:** "every great threshold" → "each rung" (lore: lightning at each breakthrough); one sentence on the ladder (Foundation makes a disciple, the rungs above make elders). The tribulation quote is kept word for word, because the Foundation breakthrough quotes it back.
- `ridge_alone`: "for a long time" tic out (Yuki "keeps it up all the way down"); plainer sentences.
- `village`: "the way you'd" out. **Rider 1:** "a patched brown jacket" → "a patched white jacket and a red sash". The two tribute-countdown lines reworded.
- `elder`: **Rider 6:** Old Wen is "ninety in a village where sixty is Heaven being kind"; his advice names the collector's leader as Foundation, "a rung no one in Ashfall has stood on". His speech made more formal (no contractions).
- `heal`, `heal_again`: "angry" twice → once; "you didn't pick it" → "you left it on its log" (same fact). Result lines: "The village will remember." → "Ashfall will remember it." (both copies kept identical); "It helps — slowly." → "It helps, slowly."
- `village_hunt`, `boar_won`: "it has *opinions*" → "it has taken your visit *personally*" (the arrival scene already uses "decided to have opinions"). "a hunter old enough to be your grandfather" → "a white-bearded hunter" (James is 40; a mortal here is lucky to reach sixty). Fight intro reworded.
- `evening`: "in a way that" tic out. Yuki "on the stove" → "by the stove" (reads right in all three forms). **Rider 1:** "The white jacket is off, its red sash folded on the bench".
- `evening2`: pacing; **Mei Lin's voice:** after laughing at James's face she "checks her mother's door afterwards".
- `romance`: **Rider 2, the one place:** as the coat and shirt come off she stops at his forearms (the ring serpent on the left, the tree with red streaks and the raven on the right): "Later you explain those." **Rider 1:** the red ribbon and black hair. "pulls you by the hair" → "tows you by the wrist" (his hair is short). Same level of frankness as before; the fade (the `*` break) is unchanged. Lines 679 and 689 left as they were (they work).
- `tribute`: **Rider 6:** the whisper adds "*Foundation*, said as other villages say *flood*". **Rider 3:** Lu Han's sense "moves on to Yuki and reads no realm there either, only a beast" (see the open problem below for the helper).
- `bluff_win`: **Rider 6 / James can't be sensed:** "you let Lu Han feel your Qi" → he feels the Qi *in the bone*; of the maker "his senses still tell him nothing, and a Foundation disciple knows one polite reason why they wouldn't" (which is also why the bluff works).
- `tribute_paid`: "for a long time" tic out (he turns it "until the men behind him begin to shift"); last line split in two.
- `collectors_won`: **Rider 6:** the village looks at "the mortal who put a man of Foundation on his knees, which by every rule they were raised on cannot happen". Line 771 (James's message) and 775 left as they were.
- `collectors_lost`: "for a long time" tic out; Lu Han's line more formal.
- `epilogue`: "Something like us." → "People, maybe. Like us." (the tic; and it reads right from Mei Lin and from James). Lamps and tree lines reworded.
- `breakthrough` (Foundation and the generic text, lines 920–970): "the way you'd" out; "Your nine threads cross-reference" dropped (lore: the threads are instincts, never a voice). **Rider 6:** "Every cultivator in the village" → "Everyone in Ashfall with any sense for Qi" (Ashfall is all Mortal Vessel); Old Wen now names what a Foundation tribulation normally is ("A cloud over one roof and a few strokes"); the closing line says Foundation is the rung the sects fill their ranks from. Kept on purpose: "you would swear to this in any court" (the Heavenly Immortal text calls back to it), "You sit, and you let the loop close.", "The loop closes again, one rung higher." and "Ashfall watches it go…" (tests match them; the last is also duplicated in the newer line 963).
- `SEASON_LINES`, the Long Forest skip line, `night_attack_forced`: light rewording ("Yuki keeps the moss off hers" → "Yuki does not permit moss").

## Left alone on purpose (listed, but not prose I may change)
- Scene titles (536, 601, 613, 629, 702, 793), all choice labels, hidden "Story Mode only" labels (830, 981, 982), the `reword(...)` labels and their matched result strings (1081, 1083–1085: the old result strings there must match act 1 files), `LF_FULL` and the line 1059 result (`replies.js` sorts them by their opening words), mechanical results.

## Label suggestions (not applied)
- `mei_lin`: '"Tell me about the tribute. And the tribulations. And why everyone here tastes like a funeral."' → '… And why the air here tastes like a funeral.' (he tastes the Qi, not the people).
- `evening`: 'Flirt back. Shamelessly. You\'re forty, not dead.' → 'Flirt. Shamelessly. You\'re forty, not dead.' (on this path she hasn't flirted yet; she only asked what a mycologist is).
- `romance`: 'Sleep. For a few hours, the world is just this.' is fine and honest about the night (rider 4: no change needed; nothing in my scenes promises a full night after a fight). `jackals_won` is task A's.
- `boar_won` / `boar_lost`: 'Evening.' → 'Evening, and Mei Lin\'s table.' (a bare label next to 'Back to the village.').

## Continuity problems found, not fixed
- **Rider 3, the helpers (lines 113–114, `yukiMerElder`, `yukiMerLu`; before line 510 and pinned by `tests/story.test.mjs` 1199–1207, so I did not touch them):** Old Wen and Lu Han still read Yuki's meridians ("has twelve meridians open", "holds Qi with its meridians shut"). That is sensing her cultivation. Suggested texts that keep the tested parts (`yukiSpot`, "at its size" / "untaught" / "at its age"): Wen: "And ${b} is only a cat to my senses, as you are only a man. Yet it watches this room as the heirs of great sects do." / "…and is growing, ${at its size|untaught|at its age}, without a single pill…"; Lu Han: "And yet ${b} is no common animal: fed on no pill, and sleek as a sect heir's pet." The three-way split by `g.yuki.primaries` would then say the same thing three ways; needs the owner's pick.
- `elder` (591): "Yet Mei Lin says you made a needle out of air" also shows on the `ignored` path, where James never met her on the slope.
- `evening2` (670): "the boy you tried to help" shows even if James never went to the coughing house; "Tomorrow they come" assumes the last evening.
- `epilogue` (797): "what you saw from here before" assumes James stood on the ridge; on the Mei Lin path he may not have.
- `elder` (589): "outlived three sect masters" against the realm sheet (a sect master is Golden Core, about six hundred years). Kept as a stated fact; they would have to have died of something other than age.
- `collectors_lost` (783): Lu Han's "born perfect/flawless" implies he senses something in James; kept (he may mean the bone gift).
- `bluff_fail` (729, 733; newer, not on my list) has "the way a magistrate" and "the way a judge"; `breakthrough` line 948 "It looks for a long time." (not on my list): tics left.
- `tribute` (710): "four men in crimson" and then Gao Feng beside Lu Han or in a litter: is he one of the four?

## Checks
- `node --check` passes. `bash tools/check.sh quick`: palette, the four parts, leftovers, tasks, story (at that run), models and the bots all ok; `tools` fails only on "the snapshot current" (the text lint's snapshot, `node tools/textlint.mjs --save` at the push).
- A later `node tests/story.test.mjs` shows 8 failures, none from my lines: all from the concurrent edit of `js/story/yuki_path.js` (the `mei_lin` and `romance` beats: "*She's pretty,*" → "*Pretty,*", "sleepy and amused from the stove downstairs" → "drowsy and amused, from beside the stove downstairs"; tests 1758, 1768, 1891 match the old wording).
