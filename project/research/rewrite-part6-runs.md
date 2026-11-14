# Part 6, run 1: the Heart's scenes

Read /tmp/rw-p6-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p6** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). **Edit only /tmp/rw-p6/js/story/act1_heart.js** (all of it is yours in this run;
the stomp texts are run 2's, later). Read /home/claude/bone-and-ash/js/story/stomp_act1.js lines 302–378 (the Heart's three fights'
stomp texts, which replace some of your scenes when James far outclasses a fight) only so you know they exist; don't edit them.

Your older-lines list: /tmp/rw-p6-info/older-run1.lines (71 strings, about 3,800 words). Notes: /tmp/rw-p6-info/notes-run1.md.

## Tasks
1. **OT:** rewrite the prose of every listed string (the shared brief's rules). Where a list's first entry is old (`HALL_WHEN`'s
   first row, `DR_HC_YA` 1, `DR_SP_SIT` 1) the later entries are yours and build on it: keep them unless your new first entry makes
   one wrong.
2. **SM, the seam with the Blackroot (Fable's own review of part 5, M3):** `ht_start` (lines 143–153) opens with "The forest stops
   … a clearing half a kilometre across … the tree" and "Your Convergence sings to it and nothing sings back", but they slept in the
   roots by the doorway the night before (`heart_view`: "Out of it, faint as breathing, comes the part of the song the roots have been
   missing. Your Convergence is singing back."; `bl_end`: "The doorway in the trunk is wider than it was last night."), and the forest
   already stopped on Day 14 (`ah_enter`). Start `ht_start` at the doorway, by daylight: the size of the thing seen properly at last;
   last night something sang back, faint; this morning nothing answers, and that is the worst part (he is used to Hearth Trees that
   answer). Your suggestion in /home/claude/bone-and-ash/project/research/rewrite-part5-review.md (M3) is a good start; improve it.
   Keep Ya's line (`${ya(g) ? … : ''}`) in some form and Mei Lin's silence. **Code allowed here:** Mei Lin's "hand on Yuki's back, and
   Yuki is letting her" fits only the great root-kin: make it `${byForm(g, cat, greatRootKin, human)}` (byForm is imported), three
   versions of the same beat (Mei Lin reaching for Yuki, and Yuki allowing it). The label after it becomes "Walk to the doorway."
   (Claude changes it; `heart_gate` follows: the doorway, seen close, is the cut).
3. **LG, the log against the canon:**
   - `ship_log3` line 482 on: "You're not the outlier. You never were. You're just the first person in four hundred years to breathe
     this world's air the way it was *supposed* to be breathed. The world is the outlier. The world is a poisoned well, and the
     Crimson Lotus poisoned it, and then sold everyone the cure." Canon: James's world is the outlier, and he finds that out only in
     Act 2. Rewrite the paragraph so that it says neither (no "outlier", no verdict on whose world is normal), keeps what he does
     understand here (the Tree made it clean; the Lotus killed the Tree and let the old poison back up, and then sold everyone the
     cure: the pills, the herbs, the cores, the Sect itself), and lands as hard as the old one. Same length ±25%.
   - `ship_log` line 445: Wren's "It makes them hard, and short-lived, and hungry." Keep "short-lived" as hers, but let her words
     show it is a gardener measuring against home (a few words: "short-lived, by our lights", or better). Note your new wording in
     your notes (Claude updates lore.md's quote of it).
4. **NC, the nights:**
   - `heart_camp` line 561: "Night ${n} of the expedition's end, inside the Old Tree." reads "Night 16 / 17 / 18". **Drop
     `${n}`** (code allowed: remove that one expression; Claude tidies `const n`): the line names the night inside the tree without a
     number (the pools after it count the nights already).
   - `heart_night`'s quiet nights, lines 616–618 (three texts): each names "the ship" under the floor, but on Day 16 or 17 they may
     not have found it yet. **Code allowed here:** turn each of the three into a template literal with one
     `${g.flags.ship_found ? '…' : '…'}`: the ship when it's found; before that, something under the roots he can't name yet (a hum,
     a note, a warmth, the sap; your choice, different in each). The 4th quiet night (619) names no ship: leave it.
5. **TY, "a thousand years":** wrong in three places: line 187 (`heart_hall`, the dust: four hundred), line 249 (`ring_chambers`,
   the elbows on the table: people lived in the rings for about six hundred years), line 346 (`roots_fall`, the dust: four hundred).
   Right at line 269 (`ring_won`, the cup: it came with the ship, a thousand years ago): keep the fact, vary the wording if you like.
   Don't swap in "for four hundred years" (already in 8 scenes).
6. **YF / FB:**
   - Line 764 (`heart_core`): "her yellow eyes are very bright": yellow is the cat's; the great root-kin and the human have gold.
     Make the wording fit all three (no code).
   - Three empty human branches: line 263 (`ring_forced`), line 279 (`ring_lost`) and line 684 (`guardian_half`): each is
     `byForm(g, '', tigerText, '')`. Write the **human** branch (the third argument) of each: one or two sentences, the same job as the
     tiger's for a woman who speaks aloud (she fits the galleries; she was born in the same grove as James and knows the song). The cat
     branches stay empty.
   - Every other byForm and the `LOG_*` tables (lines 92–112) in your lines: review all three branches.
7. **CW:** at most 3 throwaway lines (the shared brief): good homes are `heart_camp`'s supper, `heart_morning`'s breakfast, the spring,
   `heart_hub`; not the log, the comfort scenes, the guardian or the heart-chamber.
8. **Continuity:** the shared brief's list.

## Your check
`cd /tmp/rw-p6 && node -e "import('./js/story/act1_heart.js').then(()=>console.log('loads'))"` prints "loads". Don't commit.
Reply with a 5-line summary.

# Part 6, run 2: the Heart's stomp texts (ST)

Read /tmp/rw-p6-info/brief-common.md first (the shared rules; "Your notes file and your check" applies with the paths below).
Your working copy: **/tmp/rw-p6** (a scratch git worktree; the original /home/claude/bone-and-ash is read-only). Run 1 has already
rewritten the Heart's scenes there (js/story/act1_heart.js, yours now): **read it first**, and its notes
(/tmp/rw-p6-info/notes-run1.md); don't edit that file. **Edit only the entries `husks`, `root_husks` and `guardian` in
/tmp/rw-p6/js/story/stomp_act1.js** (between the "PART 3 — THE HEART" comment and the "PART 4 — RETURN" comment). Notes:
/tmp/rw-p6-info/notes-run2.md. Every string in those three entries is older (12 strings, about 1,000 words): all of it is yours.

## What the stomp texts are
/home/claude/bone-and-ash/js/story/power.js lines 1–30: when James outclasses a fight, degree 2 ("outclassed") or 3
("roflstomp"), the fight's intro is replaced by `posture(g, degree)` (its last part varies by degree through
`pick(d, deg1, deg2, deg3)`), the win scene's text by `win[2]` or `win[3]`, and degree 3 offers "End it in one move.", whose result
line is `one(g)`. Each `win` text **must keep every story fact of the scene it replaces** (the same choices follow, and the haul in
the scene's `enter` is given either way). Nobody here can sense James's or Yuki's cultivation; Ya and Mei Lin see what he does.
A stomp text is not a copy of the scene: it tells the same outcome with James far above the fight, dry; in the Heart the dryness
gives way where the scene's grief needs it (the cup, the guardian).

The entries replace, in act1_heart.js (read each pair first):
- `husks` → `husks(...)`'s intro and `ring_won` (the fourth ring cleared; the cup with *Tamsin* burned into its base; +1 Hull-shard
  in `ring_chambers`' fight path; read `ring_won` and its `enter`)
- `root_husks` → `rootThings`' intro and `roots_won` (the root-chamber cleared; the walls stop being root and start being hull: the
  way to the ship)
- `guardian` → `guardianFight`'s intro and `guardian_won` (the guardian broken, not calmed: `guardian_calmed` is the other path and
  has its own scene; +2 Hull-shards from its frame). Note: the old degree-3 win has James *sing* and the guardian kneel, which is
  close to `guardian_calmed`'s story; keep that (it is how a far stronger James ends it), but it must still lead into
  `guardian_won`'s choices and facts as they are in your new scene.

## Tasks
1. **ST:** rewrite the prose of every string in the three entries, consistent with run 1's scenes (facts and spirit). Keep
   `pick(d, …)`'s three branches and their order (degree 1, 2, 3), every `${...}`, and every function's signature.
2. **YF:** Yuki appears nowhere in these texts now. You may give her a few words where she plainly matters, using the helpers at the
   top of stomp_act1.js: `yu(g)` (a subject phrase by form) and `yuShort(g)` (her name by form) — don't change them (other fights use
   them); avoid `yuShort`'s "all four hundred pounds of her" phrasing in your own words. Any line you write about her must fit all
   three forms. Ya is always in the party here (she joined on Day 10); Mei Lin too.
3. **Years:** the grubs and the rot have had four hundred years; the cup is a thousand years old (it came with the ship). Avoid "for
   four hundred years" (8 scenes already) and "a thousand years" except for the cup.
4. **Continuity:** the shared brief's list, and run 1's scenes.
5. **CW:** none in this run.

## Your check
`cd /tmp/rw-p6 && node -e "import('./js/story/stomp_act1.js').then(()=>console.log('loads'))"` prints "loads". Don't commit.
Reply with a 5-line summary.

# Part 6, run 3: four open items (the owner's pick OL1)

Read /tmp/rw-p6-info/brief-common.md (the shared rules) and your notes /tmp/rw-p6-info/notes-run1.md and notes-run2.md. Your working
copy: **/tmp/rw-p6** (your runs 1 and 2 are merged there, plus Claude's small edits). Edit only the lines named below, in
/tmp/rw-p6/js/story/act1_heart.js and /tmp/rw-p6/js/story/stomp_act1.js. Text only: no code, no labels. Add a section "Run 3" to
/tmp/rw-p6-info/notes-run2.md (old → new for each change, one line why).

1. **HW, where the heart was taken** (`sect_cut`): the inscription on the high wound says "Here the Crimson Lotus took the heart", but
   the hollow it was cut from is in the heart-chamber, deep below, past the ship and the bone door (`guardian_approach`,
   `heart_core`). In `sect_cut`'s first paragraph say it outright, in one or two sentences: the heart lay far below; they cut in here
   from above and brought it up and out this way (the split at the foot was the door, this the chimney: your call). The inscription
   stays word for word (the Sect's boast at its own monument); Mei Lin's lines after it stay.
2. **CR, the crawl** (`guardian_bypass`): the text says the crawl takes four hours ("the worst four hours of your life"); the clock
   charges an hour (the hub's choice, `time: 60`). Make it an hour, keeping the joke's shape.
3. **GL, the two green lights:** the guardian has a green glow in the hollow of its chest; the seed-sliver glows green at the bottom
   of the scorched hollow in the chamber floor (`heart_core`). In `guardian_calmed` it kneels, "The hollow in its chest stands open.
   The green light is waiting." and sings "*Keep it*", which reads as if it holds the seed. Make them plainly two things, a few words
   each: its chest light is its own (the last of its sap, its lamp: your call), and when it sings "*Keep it*" its blank head turns
   to the hollow in the floor (the seed is not shown yet; `heart_core` finds it). Places: `guardian_approach` (its first sight: the
   glow named as its own), `guardian_calmed` (the kneel and "Keep it"), and `STOMP.guardian.win[3]` in stomp_act1.js (it sings, the
   guardian kneels: the same turn of the head). Lengths ±10%. `heart_core` stays.
4. Don't touch `STOMP.guardian.win[2]` (Claude adds your guardian_weak branch there).

Check: `cd /tmp/rw-p6 && node -e "Promise.all([import('./js/story/act1_heart.js'), import('./js/story/stomp_act1.js')]).then(()=>console.log('loads'))"`
prints "loads". Don't commit. Reply with a 3-line summary.

# Part 6, run 4: the review's text fixes (the owner's pick RV1)

Read /tmp/rw-p6-info/brief-common.md (the shared rules) and the cold review /tmp/rw-p6-info/review.md (its wordings are suggestions
from the reviewer; improve them where you can, keep their facts). Working copy: **/tmp/rw-p6** (synced with the build). Edit only the
lines named below, in /tmp/rw-p6/js/story/act1_heart.js, stomp_act1.js and yuki_time.js. Text only: no code, no labels (one placeholder
below is the exception: replace its string). Add a section "Run 4" to /tmp/rw-p6-info/notes-run2.md: old → new for each, one line why.

- **M1** `sect_cut`'s first paragraph: James reads it off the wood (the scorching runs on down the inside of the trunk, past the hall
  floor), not knowledge he can't have yet; keep the door and the chimney (the word "chimney" stays) and the inscription as it is. Also
  fit `ship_log3`'s man in red reaching in "with his own two hands": he takes it out below; the chimney is how the Sect hauled it out.
- **M2** yuki_time.js `heart_hub:1` (cat) and `heart_hub:5` (all three): "a thousand years" of dust → four centuries (vary the wording).
- **M3** stomp_act1.js `guardian.posture`: "It does not know you. It knows *intruder*…" must fit every state (it may have recognised him
  in the half-song, or remember him from a lost fight): the review's sentence or better.
- **L1** `ht_start`: in the Blackroot the tree sang and *his Convergence* sang back; "Stand up" (they are already up and armed in
  `bl_end`, one tap earlier); and the doorway is a little wider this morning. Keep "None of that was preparation", "gets nothing at
  all" (a test pins it) and "That is the worst part. You are used to Hearth Trees that answer."
- **L2** `guardian_calmed` and `STOMP.guardian.win[3]`: "the scorched pit in the chamber floor" names the hollow before `heart_core`
  shows it: "the dark behind it, where the floor of the chamber falls away" or better (no "pit", no "hollow").
- **L3** `wake`'s no-breakfast line: drop the cooking clause ("who has watched you feed everyone else first since the root road");
  it repeats every foodless morning. Keep "No breakfast." first and the gag.
- **L4** `ring_chambers` "six hundred years of elbows" → centuries, no number; `ring_won` "as old as the tree itself, a thousand
  years" → old, without a number he can't know yet ("older, by the grain, than the wall it stands in", or better).
- **L5** `heart_camp`: replace the placeholder string 'L5 TODO' (the mood after the crawl round the guardian, `guardian === 'lost'`:
  it still sings its one broken line behind the bone door, to nobody, and they went round it). One or two sentences, the length of the
  lines beside it.
- **L6** stomp `husks.posture`: "${yu(g)} looks at them, then at you" repeats `ring_forced`'s human line one screen earlier: keep
  `${yu(g)}` as the subject, change the rest (fits all three forms).
- **L7** `ht_leave`: "from the first black ridge" → from the last of the roots (`rt_start` begins coming out of the roots).
- **L8** `STOMP.guardian.win[2]`: "You do not break it" against "broken clean away": make the two pieces come away whole.
- **L9** `guardian_bypass`: the great root-kin can't fit the crawl, yet she is in the heart-chamber after it: end with a line that fits
  all three forms (the review's "How Yuki got in ahead of you, you do not ask." or better).
- **L10** yuki_time.js `heart_hub:2` (all three): "found no rot … not one fruiting body" against `roots_dark` ("The rot did more than
  eat the tree. It moved in.") and the grubs: make it the hall's walls only (the rot is below, in the roots; up here nothing grows,
  not even fungus): keep the joke and the bond / the woman's speech by form.

Check: `cd /tmp/rw-p6 && node -e "Promise.all(['act1_heart','stomp_act1','yuki_time'].map((f)=>import('./js/story/'+f+'.js'))).then(()=>console.log('loads'))"`
prints "loads", and `grep -n "TODO" js/story/act1_heart.js` prints nothing. Don't commit. Reply with a 3-line summary.
