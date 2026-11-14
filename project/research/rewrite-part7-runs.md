# Part 7, run 1: the Return's scenes

Read /tmp/rw-p7-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p7** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). **Edit only /tmp/rw-p7/js/story/act1_return.js** (the stomp texts are run 2's,
later; the Heart's lines are run 1b's, running beside you). Read /home/claude/bone-and-ash/js/story/stomp_act1.js lines 381–504
(the Return's four fights' stomp texts, which replace some of your scenes when James far outclasses a fight) only so you know
they exist; don't edit them.

Your older-lines list: /tmp/rw-p7-info/older-run1.lines (106 strings, about 3,800 words; line, words, start). Notes:
/tmp/rw-p7-info/notes-run1.md. Claude has already added code with placeholder strings ('… TODO …'): fill every one.

## Tasks
1. **OT:** rewrite the prose of every listed string (the shared brief's rules), the romance nights included (`rt_trio`,
   `rt_trio_night`, `rt_ya_night`, `rt_mei_night`: exactly at their level, frank up to the door, then fade to black).
2. **SC, the new scene `rt_selene`** (replace `SC TODO`; the owner's ask, 2026-11-14 04:38, word for word in lore.md "Selene"):
   the last camp, the night of Day 19, the small fire on the far bank, the dead tree black against the stars at their backs; this
   world has a moon (use it: up, or rising over the trees). Mei Lin and Ya have asked who Selene was named for (the label: "Tell
   them who Selene was named for."). James tells the myth of Selene and Endymion **in his own words** (the goddess of the Moon who
   loves Endymion, a young shepherd asleep on a mountainside; he is given a sleep without end and without age, at her asking or his
   own wish, the tellings differ and James may say so; she comes down to him every night). Mei Lin finds it romantic (and, being
   Mei Lin, says so more freely than her upbringing allows). Ya hears a story about not giving up: she comes back every night,
   forever, and Ya likes it for that (don't spell out the parallel with Ya's own fifteen years; let it show). **Both like it; their
   reactions differ.** Yuki: one beat in each form with `${byForm(g, cat, greatRootKin, human)}` (code allowed in this scene: byForm
   calls only; Mei Lin and Ya are always here). James's deadpan can drop where it should: his people named one of their first ships
   for her, and she lay asleep under a tree for a thousand years. About 350–450 words; the first paragraph stands alone (a re-read
   folds to it). Never "the ship". No poem quoted (Keats's or anyone's), no romance escalation. Notes: the whole scene.
3. **DR, the drill lines:** in `DRILL_AGAIN`, fill the nine placeholders ('DR TODO hard 2' … 'DR TODO ya 4'). Each list's first entry
   is yours (v0.11.156) and stays. They are the result lines of a **practice** drill on Day 20, once the militia is already ready
   (no gains, nothing changes but skill): `hard` a clean practice, `hardFail` a ragged one, `ya` Ya drilling the hunters her way. The
   picker shows all four before any comes back, in any order, never the same twice running, so each must stand alone and differ in
   its image. 15–25 words each.
4. **YC, Ya's childhood:** `rt_fire_talk`'s second branch ("Ya tells the story of how she was raised: by an old hunter who found her
   in a burned village at four…") contradicts `talk_ya`: tell it her way (the shared brief, Continuity 4). James may have heard it
   from her before (the Blackroot); the others haven't. Keep Mei Lin's not arguing, and her father, and James's lab and blast.
5. **SD, Mei Lin carrying the seed** (`g.flags.mei_carried_seed`): fill 'SD TODO rt_start' (the same job as the hammerspace line
   beside it: the seed hums, *Plant me*; here it is against Mei Lin's heart in her sleeve, and his Convergence hears it from her; ±25%)
   and 'SD TODO rt_plant' (she takes it out of her sleeve and puts it in his hand; the same facts as the branch beside it: daylight,
   smaller than he remembers but no longer than his hand, warm, faintly pulsing; half the village followed, at a distance, in total
   silence; ±25%).
6. **SZ / TY / FX:** `rt_plant` "no longer than your finger" → his hand (both branches as needed); `rt_mei_talk` "The tree sang for
   a thousand years" → it sang about six hundred (her mouth can still twist at "before my grandmother's grandmother was born":
   four hundred years ago, true); `a1_end` "a sect that has eaten a world's heart for a thousand years" → about four hundred;
   `rt_mother` "four days in the deep forest" → nine days (or no number).
7. **Selene in the Return:** `rt_ya_talk` "I'm thinking about the ship.", `rt_wen` "the ship of grown wood", `rt_plant`'s no-seed
   branch "a hull-shard from the ship", `rt_parley` "About the ship, more carefully", and any other "the ship" you find: Selene,
   she, her (the shared brief). Lines about ships in general may stay.
8. **YF / FB:** `rt_evening`'s human branch says "the cat-shaped hole in the leaves" (fit her); `a1_end`'s human branch "beside you"
   is followed by "*Not dead,* says the bond." (the woman speaks aloud: make that line fit all three, or the byForm carries it; no new
   code); `rt_brawl_lost` and `rt_parley_fail`: the **human** branch is '' → write it (one or two sentences, the same job as the
   tiger's, for a woman who speaks aloud); the cat branches stay as they are. Every other byForm in your lines: review all three.
9. **CW:** at most 3 throwaway lines (the shared brief). Good homes: the road, `rt_camp`, `rt_dawn`, `rt_evening`, Old Wen's or the
   mother's dry aside about the food he brought or cooked on the road; not the planting, not Shen Qiu's scenes, not `rt_selene`.
10. **Continuity and voice:** the shared brief's lists.

## Your check
`cd /tmp/rw-p7 && node -e "import('./js/story/act1_return.js').then(()=>console.log('loads'))"` prints "loads", and
`grep -n "TODO" js/story/act1_return.js` prints nothing. Don't commit. Reply with a 5-line summary.

# Part 7, run 1b: the Heart, now that she has a name

Read /tmp/rw-p7-info/brief-common.md first, especially "Selene" and lore.md's "Selene". Your working copy: **/tmp/rw-p7** (run 1
edits act1_return.js beside you: don't touch it). **Edit only the lines named below, in /tmp/rw-p7/js/story/act1_heart.js and
/tmp/rw-p7/js/story/act1_common.js.** Text only, except the placeholders Claude added ('NT TODO night 1/2/3': replace each string).
No labels. Notes: /tmp/rw-p7-info/notes-run1b.md (old → new for each change, one line why). These lines are yours from part 6:
improve them, keep their facts unless a task changes one.

1. **HN, the hull's name** (`ship_wreck`): "There is a name on the hull, in the letters you were taught before you could walk.
   *PATIENT ROOT.*" goes: the owner wants her name found in the log. Where her name was grown into the hull (the bow) is the
   crushed front third, or under the tree's bark: he looks for it and can't read it. Keep "One of yours", Mei Lin's "You're crying"
   and "I'm aware … This is a lot of data.", and Ya's line. ±25%.
2. **The log names her** (`ship_log`): Wren's "Head Gardener Wren Aldous, of the seed-ship Patient Root, out of the Ninth Grove" →
   of **Selene** (Wren speaks of her as "she"). Then **the revelation (JR)**: James knows the name. Selene was one of his Earth's
   first colony attempts; she was lost; nobody ever learned what happened to her; every child at home knows the name and the
   mystery. Two to four sentences, outside the italic memory, where it lands hardest (he is inside a memory that is being poured
   into him; he can stagger out of it for a breath, or it can wait for the end of the scene: your call). **AS, the anomaly:** "The
   drive failed. They don't know why. The fall went on and on. It ended here." → a spacetime anomaly knocked her off course and
   threw her across (the stars went wrong; space folded: Wren is a gardener, not a navigator, so in her words), then the drive failed
   and the fall went on and on and ended here. Keep word for word: "Something died here, long before us. A lot of somethings." and
   "hard, and hungry, and short-lived. Short as we measure a life, at least; I have no other measure with me." (lore.md quotes
   them); keep "We can't mend the drive. So we'll do what we know." (or "her drive"), "They planted a Hearth.", forty souls, all
   gardeners, not one ever held a weapon. The scene may grow by up to about 90 words.
3. **Selene after the log:** from `ship_log` on she is Selene / she / her, never "the ship" (the shared brief). The places:
   `ship_log2`, `ship_log3` (check), `log_reaction` ("the ship hums with you"), `log_comfort` ("in the bridge of a dead ship": she is
   asleep, not dead; "the ship hums faintly to itself"), `heart_hub`'s where-line after the log ("Below the ship, behind a door of
   grown bone, …"), `guardian_approach` ("Below the ship, beyond the place where …"), and the three quiet nights:
   **'NT TODO night 1/2/3'** in `heart_night` (each the after-the-log version of the ship line beside it: Selene under the floor,
   asleep, humming; three different, the length of the line beside each). **Also night 1's before-the-log branch** ("…you can almost
   hear forty gardeners breathing"): before the log he can't know there were forty of them; rewrite that clause. Lines about ships
   in general stay ("Every ship carries one", "No ship was ever grown without one"); everything before the log stays "the ship"
   (`ship_wreck`, `ship_touch`, `ship_bridge`, the hub's "The ship is down there, waiting").
4. **The item notes** (act1_common.js, `ITEMS`): `seed_sliver`'s note "A splinter of living heartwood from the seed-ship …" (it is
   from the Old Tree's heart-chamber, below Selene) and `hearth_log`'s "The ship's record, …" (picked up on the bridge **before** the
   log plays, and shown in the pack at any time: name-neutral and true both before and after, e.g. "A seed-ship's record …").

Check: `cd /tmp/rw-p7 && node -e "Promise.all(['act1_heart','act1_common'].map((f)=>import('./js/story/'+f+'.js'))).then(()=>console.log('loads'))"`
prints "loads", and `grep -n "TODO" js/story/act1_heart.js` prints nothing. Don't commit. Reply with a 3-line summary.

# Part 7, run 2: the Return's stomp texts (ST)

Read /tmp/rw-p7-info/brief-common.md first (the shared rules; "Your notes file and your check" applies with the paths below).
Your working copy: **/tmp/rw-p7**. Run 1 has already rewritten the Return's scenes there (js/story/act1_return.js, yours now):
**read it first**, and its notes (/tmp/rw-p7-info/notes-run1.md); don't edit that file. **Edit only the entries `rt_wolves`,
`rt_serpent`, `rt_brawl` and `elder` in /tmp/rw-p7/js/story/stomp_act1.js** (after the "PART 4 — RETURN" comment). Notes:
/tmp/rw-p7-info/notes-run2.md. Every string in those four entries is older (16 strings, about 1,590 words): all of it is yours.

## What the stomp texts are
/home/claude/bone-and-ash/js/story/power.js lines 1–30: when James outclasses a fight, degree 2 ("outclassed") or 3
("roflstomp"), the fight's intro is replaced by `posture(g, degree)` (its last part varies by degree through
`pick(d, deg1, deg2, deg3)`), the win scene's text by `win[2]` or `win[3]`, and degree 3 offers "End it in one move.", whose result
line is `one(g)`. Each `win` text **must keep every story fact of the scene it replaces** (the same choices follow, and the haul in
the scene's `enter` is given either way). Nobody here can sense James's or Yuki's cultivation; Ya, Mei Lin, Bao and Shen Qiu see
what he does. A stomp text is not a copy of the scene: it tells the same outcome with James far above the fight, dry.

The entries replace, in act1_return.js (read each pair first):
- `rt_wolves` → `roadWolves`' intro and `rt_wolves_won`
- `rt_serpent` → the ford's serpent fight's intro and `rt_serpent_won`
- `rt_brawl` → `brawlFight`'s intro and `rt_brawl_won` (unarmed, on GU; it's a brawl, it's supposed to be fun; fists only)
- `elder` → `elderFight`'s intro and `rt_duel_won` (Outer Elder Shen Qiu, Core Formation, three hundred years of cultivation; what
  he says and offers after the duel must match `rt_duel_won`'s facts and choices)

## Tasks
1. **ST:** rewrite the prose of every string in the four entries, consistent with run 1's scenes (facts and spirit). Keep
   `pick(d, …)`'s three branches and their order, every `${...}`, and every function's signature.
2. **YF:** `yu(g)` (a subject phrase by form) and `yuShort(g)` (her name by form) are the helpers at the top of stomp_act1.js —
   don't change them; avoid `yuShort`'s "all four hundred pounds of her" phrasing in your own words. Any line about Yuki must fit all
   three forms (the wolves lying down for her in particular: a cat, a tiger, a woman).
3. **Selene** never "the ship" (the shared brief). **Years:** the Sect about four hundred years; Shen Qiu three hundred.
4. **Continuity:** the shared brief's list, and run 1's scenes.
5. **CW:** none in this run.

## Your check
`cd /tmp/rw-p7 && node -e "import('./js/story/stomp_act1.js').then(()=>console.log('loads'))"` prints "loads". Don't commit.
Reply with a 5-line summary.

# Part 7, run 3: the rest of the Return's old text, the last Selene line, and the continuity fixes (the owner's pick CA1, 05:42)

Read /tmp/rw-p7-info/brief-common.md again (the shared rules) and your notes notes-run1.md, notes-run1b.md and notes-run2.md. Working
copy: **/tmp/rw-p7** (runs 1, 1b and 2 are merged there, plus Claude's small code changes: the Selene choice is now appended last on
`rt_camp` by `installSelene`; the Elder's intro keeps " Behind you, Ashfall does not kneel." because power.js matches those words:
leave it). Edit only the lines named below, in /tmp/rw-p7/js/story/act1_return.js, act1_heart.js, stomp_act1.js (only if a fix below
needs it) and prologue.js (only the `reword('rt_ford', …)` strings). Text only, except the placeholders ('YL TODO', 'TK TODO'):
replace each string. No labels. Notes: add a section "Run 3" to /tmp/rw-p7-info/notes-run2.md (old → new for each, one line why; the
full text of every new string).

1. **UL, older text the first list missed** (the owner: "CA1"): these strings were left out of your run 1 list because one line in
   each was touched after v0.11.69, but the rest is the original prose. Rewrite each fully (the shared brief's rules: keep every
   `${...}`, every fact, the length ±25%, the forms): the list is /tmp/rw-p7-info/ul.lines (line, scene, words, share still old,
   start): `rt_road`, `rt_serpent_lost`, `rt_fire_talk`'s game branch (Ya's kiss stays at its level), `rt_arrive`, `rt_mother` (keep
   your nine days and the two "the street says"), `rt_grove`, `rt_brawl_start`, `rt_brawl_lost` (your human line stays), `rt_quiet_night`
   (the first byForm), `rt_elder` (345 words; its label stays), `rt_parley_fail` (your human line stays), `rt_duel_lost`, `rt_taken`,
   and `a1_end`'s closing paragraph for the outcomes that stay in Ashfall ("Some nights you lie awake and listen, and under the
   grove's song…", now the second branch of `${o === 'taken' ? … : …}`).
2. **DL:** `rt_duel_lost`'s human branch is '' (only the great root-kin gets "the other hand was for Yuki"): write it, one or two
   sentences, the same job, for a woman who speaks aloud. The cat branch stays as it is.
3. **YL:** act1_heart.js `DR_HC_YA`'s second text (Ya on the ledge naming the hall's sounds: "bark settling, … , Mei Lin pretending to
   be asleep"): replace 'YL TODO' with Selene once the log is heard (a few words, in Ya's list, e.g. "Selene asleep under the floor";
   Ya says it, so in Ya's words: she knows the name from the log by now).
4. **RB, the ford's bridge:** `rt_ford`'s result "A white bridge, ribbed like a spine. Mei Lin crosses it like a woman walking into a
   temple." and, in prologue.js `reword('rt_ford', …)`, the same string (first in the pair) and its Incremental Mode twin ("White
   stepping-stones, …"). Change the act1_return.js string and the pair's first string **to exactly the same new words**, and the twin to
   match it (your pair from notes-run1.md, or better). Touch nothing else in prologue.js.
5. **The continuity fixes** (the owner: "fix the continuity issues too"), text only:
   - **C1, the kiss "by the water":** `rt_mei_talk` (Day 19, on the road) has Mei Lin say "Ya kissed me. By the water.", and `rt_mother`
     "The street says she kissed you at the river." No scene shows a kiss by water before them (the fire talk's kiss is that night, on
     the far bank, after `rt_mei_talk`; in the Heart they slept by the spring and the trio scenes are in `log_comfort`). Make Mei Lin's
     line true for what the player can have seen by then (`both(g)` is its condition: a kiss in the Heart, without saying where, or no
     kiss named), and make the street's version something the street could know (Ashfall can only have it from Ya, or from guessing:
     the mother's line should stay a mother's line about rumour, not a fact the street saw).
   - **C2, the wolves:** `roadWolves` fights three (the code), but Ya says "Three. Maybe four." and the stomp texts count four. Make the
     texts say three wherever they count (her "maybe four" can stay as a tracker's caution only if the fight never shows a fourth;
     simplest: three). Check `rt_ambush`, `rt_ambush_forced`, `rt_wolves_won`, `rt_wolves_lost` and stomp `rt_wolves`.
   - **C3, riders:** `rt_wen` has hunters see "riders on the switchbacks"; in `rt_elder` Shen Qiu arrives on foot with twelve disciples.
     Make Old Wen's report fit (the Sect's colours on the switchbacks, a column of disciples on foot; the number of men is enough for him
     to know it is an Outer Elder).
   - **C4, the seed when there is none:** `rt_ambush`'s "They smell the seed. Or you." shows also when no seed was taken: make it true in
     both cases without code ("what you carry", or "you, and whatever you brought out of there").
   - **C5, the fan:** run 2 gave the Elder's posture a closed fan; check `rt_duel_won`'s "the hand that holds the fan" and the scenes
     before it agree (in `rt_elder` he can carry it too, folded in his sleeve or at his belt: a few words).
   - **C6, after being taken:** 'TK TODO' in `a1_end`: the closing paragraph for `taken` (he is in the Sect's mountains, three days up
     their road, not under the grove: he can't hear the grove's song; he can lie awake and feel, very faint, the pale point of light far
     below, or the dead tree answering — your call, true to where he is). The length of the other branch, ±25%.
   - **C7, the grove's height:** the stems are knee-high on Day 20 (`rt_grove`) and waist-high on Day 21 (`rt_truth`); `rt_ya_night`
     (the night of Day 20) has Ya "watching the stars through the white stems": make it fit knee-high stems (she lies among them; the
     stars over them).
6. **Selene** never "the ship" after the log; **years** as before.

Check: `cd /tmp/rw-p7 && node -e "Promise.all(['act1_return','act1_heart','stomp_act1','prologue'].map((f)=>import('./js/story/'+f+'.js'))).then(()=>console.log('loads'))"`
prints "loads", and `grep -n "TODO" js/story/act1_return.js js/story/act1_heart.js` prints nothing. Don't commit. Reply with a 5-line
summary.

# Part 7, runs 4–7 (the owner's pick RV1, 06:43, "and fix the open, options later ones too")

All four runs work **in parallel in /tmp/rw-p7b** (a full scratch copy; /home/claude/bone-and-ash is read-only), **each on its own
files only** (named in its section). Read /tmp/rw-p7-info/brief-common.md (the shared rules: never labels, ids, flags, conditions,
gains, `${...}` code, the number of entries in byForm/byDay lists; the forms; the tone; the tics; Selene's rule) and lore.md. **Any
words lore.md quotes from the game in quotation marks stay word for word** (e.g. Wren's two quotes, "the most expensive empty closet
in two universes", "decided to have opinions", "the white song", "a thread holds only what your hands already know"). The "leftover"
lists (line, scene, words, share still from v0.11.68, start) are strings the older-lines lists of parts 1–6 missed because one line
in each was touched later: rewrite each one fully (same facts, beats, length ±25%, forms), as in your parts 1–6. A fight's `intro`
in an encounter that has a STOMP posture is never shown (power.js): if one is listed, skip it and say so. Notes: your section's file.
Text only; no code beyond what a section names. Check: each edited file loads (`node -e "import('/tmp/rw-p7b/js/story/<file>.js').then(()=>console.log('loads'))"`)
and `grep -n TODO` prints nothing in your lines. Don't commit. Reply with a 5-line summary.

## Run 4: the review's fixes, and the Heart's leftovers (files: act1_return.js, act1_heart.js, act1_common.js, stomp_act1.js)
The review: /tmp/rw-p7-info/review.md (its wordings are suggestions; improve them, keep their facts). Notes: /tmp/rw-p7-info/notes-run4.md.
- **M2:** `rt_elder` "at the hour of the snake" → the hour of the dragon (he arrives at 08:00); stomp_act1.js line 42 (the watcher's
  ledger in the Fallout's stomp text) "north road, noon, four disciples" → the morning, twelve disciples (run 6 changes the Fallout's
  own line to match: "the Elder means to arrive in the morning, by the north road, with twelve disciples").
- **M3:** act1_heart.js `ht_leave`'s last line ("In your hand, or near your heart, the seed sings all the way.") → true whoever
  carries it ("Whoever carries it, the seed sings all the way." or better); act1_common.js `seed_sliver`'s note "It hums against your
  palm…" → neutral (it may ride in Mei Lin's sleeve).
- **L1** `rt_quiet_night`'s human dawn line aloud; **L2** `rt_selene` against the camp (no fire-feeding or coal-jabbing that a banked
  fire contradicts; the cat placed nowhere in particular; the label is now "Back to the fire."); **L3** the brawl has **Bao and one
  cousin** (the other cousin minds the jacket): the stomp `rt_brawl` posture, win 3 and `one`, `brawlFight`'s tail ("Three against
  three" → three against two when Yuki joins; it is two against two without her), `rt_brawl_start`, `rt_brawl_won`, `rt_brawl_lost`
  (the label now says "two against two"); **L4** `ship_wreck` (he sees the letter's foot, doesn't touch yet); **L5** Ya's long way
  "four days" → five; **L6** the two "this morning" drill lines; **L7** the taken ending's "Some nights"; **L9** `rt_mother` "the street"
  down to two, and **`yuShort`** (stomp_act1.js line 14, the great root-kin's 'Yuki, all four hundred pounds of her,'): a new phrase,
  a subject phrase that still reads before a verb, no weight number (it shows in several fights of every part: read each use).
- **The Heart's leftovers:** /tmp/rw-p7-info/left-act1_heart.lines (18 strings, about 1,000 words); `ht_leave` and the hull get M3 and
  L4 too. Selene's rule holds (before the log "the ship" in the Heart, after it Selene).

## Run 5: the prologue's leftovers (file: prologue.js only)
/tmp/rw-p7-info/left-prologue.lines (40 strings, about 2,000 words). **Do not touch** `reword('rt_ford', …)` (line ~1083) or any other
`reword(...)` call's strings (they swap texts by exact match); if a listed string is one of them, skip it and say so. Notes:
/tmp/rw-p7-info/notes-run5.md.

## Run 6: the Fallout's leftovers (file: act1_fallout.js only)
/tmp/rw-p7-info/left-act1_fallout.lines (43 strings, about 3,400 words). Plus **M2**: the watcher's ledger (line ~385) "…the Elder
means to arrive at noon, by the north road, with four disciples" → "in the morning, by the north road, with twelve disciples" (Shen Qiu
comes on foot with twelve at 08:00 on Day 21). Notes: /tmp/rw-p7-info/notes-run6.md.

## Run 7: the Wilds', Ashfall's and the Blackroot's leftovers (files: wilds.js, ashfall.js, act1_blackroot.js)
/tmp/rw-p7-info/left-wilds.lines (6 strings), left-ashfall.lines (14), left-act1_blackroot.lines (7): about 1,650 words. Notes:
/tmp/rw-p7-info/notes-run7.md.
