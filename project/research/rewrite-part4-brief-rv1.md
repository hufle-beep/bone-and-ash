# Bone and Ash, part 4 (the Fallout): the review fixes (owner pick RV1)

You wrote part 4 (the Fallout) and part 3 (Ashfall); the cold review of part 4 is /tmp/rw-p4-info/review.md (read M1–M4, L2–L12).
The owner picked RV1. Claude has already changed the code: the eight Fallout success lists (`DR_FO_SING`, `DR_FO_PITS`,
`DR_FO_COUNCIL`, `DR_FO_LISTEN`, `DR_FO_DRILL`, `DR_FO_SPAR`, `DR_FO_CLINIC`, `DR_FO_BOY`) now pick their text **by the story's day**
(Day 8 → the first, Day 9 → the second, Day 10 → the third), and part 3's five lists in ashfall.js (`DR_CLINIC_J`, `DR_CLINIC`,
`DR_HOOKS`, `DR_DRILL`, `DR_SPAR`) by the village day (Days 4–5 → the first, Day 6 → the second). Each card succeeds **once a Coil**
(then it closes), so **every text is the card's first and only success in that Coil**, on its day. The failure lists are unchanged.
Edit only, in the scratch worktree /tmp/rw-p4: `js/story/act1_fallout.js`, `js/story/stomp_act1.js` (lines 18–69), and in
`js/story/ashfall.js` only the five lists named above. Text inside strings only; never code, `${...}`, list lengths, choice labels.
Same rules as your brief (/home/claude/bone-and-ash/project/research/rewrite-part4-brief.md).

1. **SD (M1, L12):** reword so each reads true as a first success on its day, with no "again", "yesterday's", "today … twice as
   long", "now" against an earlier try: `DR_FO_SING` 2 and 3; `DR_FO_BOY` 2 and 3 (and 3 must fit the label "Treat the youngest
   first, and take the old woman's disapproval": she disapproves); `DR_FO_LISTEN` 2; `DR_FO_DRILL` 2; then read all the other
   entries of the eight lists and fix any that assume an earlier success. A text may still use the day (Day 9 the Old Tree's
   council; the stakes others have set; the day's patients).
2. **P3D:** the same for the second entry of ashfall.js's five lists (shown on Day 6 as the first success): e.g. `DR_SPAR` 2
   "Today your man lasts twice as long" (every form), `DR_DRILL` 2 "The wall closes before you call it", `DR_CLINIC` 2 "The lancet
   is quicker now". Keep each different from its first entry, 10–25 words.
3. **CT (M2):** `fo_council`'s Day 10 text: end it so it reads true whichever of the two cards follows alone (the review's
   "The council has heard my reasons. The stranger may add his own, or keep them." or your own); and its "who finishes the
   palisade" must read true at two stretches and at three.
4. **ML (M3):** the mother's line in `fo_mother` (about the salt pork "while she was drawing on my table"): make it true on any
   day, one sentence of speech plus its tag (the review's line or your own).
5. **PF (M4):** `fo_farewell`'s "two thirds done or better … swear on their ancestors to finish it": true at two stretches and at
   three, without new code.
6. **LT:** L2 (the watcher's stomp win 2 sword), L3 (the wolves' stomp win 2 headbands), L4 (`fo_night` Day 8's loft line), L5
   (`fo_mother`'s "Lower than the Sect has ever had from her"), L6 (the bluff letter: "And if this one has other plans?"), L7 (a
   form-neutral clause on Yuki's page in `fo_spy_won` and the watcher's two stomp wins), L9 (vary three of the five "very
   nearly"), L10 (the spar's "hilt first" → another wording). The review's suggested lines are fine; improve them if you like.

Append "## RV1 fixes" to /tmp/rw-p4-info/notes.md: each item, old → new. Check:
`cd /tmp/rw-p4 && node -e "Promise.all(['act1_fallout','ashfall','stomp_act1'].map(f=>import('./js/story/'+f+'.js'))).then(()=>console.log('loads'))"`
prints "loads". Reply with a 3-line summary.
