# Part 8, run A: the Long Forest's scenes

Read /tmp/rw-p8-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p8a** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). **Edit only /tmp/rw-p8a/js/story/longforest.js, lines 212–628** (from
`const lfTrailArt` to just before `/* ---------- Yuki's forms ---------- */`). Lines 71–211 (the stomp texts) are run B's, running
beside you in another copy; lines 629 on (Yuki's form scenes) are run C's, later.

Your older-lines list: /tmp/rw-p8-info/older-runA.lines (81 strings, about 2,870 words; line, words, start). Notes:
/tmp/rw-p8-info/notes-runA.md. Claude has added code with placeholder strings ('DY TODO …', 'YF TODO …'): fill every one of those.
**Leave every 'RP TODO …' and 'SW TODO …' string exactly as it is** (run D writes them later, after reading your texts).

## Tasks
1. **OT:** rewrite the prose of every listed string (the shared brief's rules). Not listed and not to edit: the texts of `lf_forage`,
   `lf_hunt`, `lf_train` and `lf_trials` (the game shows those menus as cards, so their texts are never drawn; they wait for a later
   part); `lfYukiCatch`'s lines (yours since v0.11.71).
2. **CO, the second Coil:** `lf_enter` is written as a man on his first day ("I know nothing about this world. Nothing. And the one
   thing I've learned so far…"). He has lived the week at least once (the shared brief, "Where the Long Forest sits"): rewrite it as a
   man who knows exactly what is waiting past the trees (the scream on Day 4, the village, the Sect, the tribute on Day 7) and chooses
   to stay lost first, to find out how far he can climb before he walks back into it. Keep its beats: the smoke on the wind, the
   sensible thing, sitting on a root with his hands and the cat, his people's long lives (**eight or nine hundred years**, not "nine
   hundred"), "How do you feel about camping?", her very long nap, "until we're the most dangerous thing in it" (or as good). Yuki is
   always the cat here (it is the entry). The same holds for `lf_exit`'s third paragraph (the thing nobody out there knows: they can't
   feel him; he may have suspected it last time, here he has tested it on beasts, bandits and one herb-poacher) and `lf_notes`'s
   field notes (its "Key finding" can be a finding confirmed, not a first discovery). The hub's lowest-realm line "a story waiting
   for you" can stay or be made a touch more knowing.
3. **DY, the first screen:** `hubText` now says "You stopped counting the days a while ago…" only from the first night on; fill
   'DY TODO day 0' with the same job for day 0 (the forest's first day: the days aren't counted, he hasn't stopped counting anything
   yet; 15–25 words, deadpan). Rewrite the other branch too (it is older).
4. **YF:** fill the placeholders: `lf_morning`'s first line ('YF TODO morning tiger' / 'human'; the cat branch is older: rewrite
   it too; the job: the same red sun and black trees, Yuki where she sleeps in that form, the threads noticing he has stopped counting
   the days), `lf_seclusion`'s autumn ('YF TODO autumn tiger' / 'human'; the cat branch "a man-shaped hummock with a cat on top"),
   `lf_trial_won`'s closing ('YF TODO trial_won tiger' / 'human'; the cat "washes a paw … adequate"), `lf_storm`'s closing
   ('YF TODO storm tiger' / 'human'; the cat "from under a rock … *show-off.*"; the tiger can't hide under a rock; the woman says it
   aloud). Fang Wei's line "He sees the white coat and the cat": **you may wrap "the cat" in `${byForm(g, 'the cat', '…', '…')}`**
   (the one piece of code you may add; that branch is inside a template literal already). Review every other `byForm(...)` and
   `yukiForm(g) === …` switch in your lines (`lf_exit`, `lf_notes`, `lf_bored` (two-way: human / the others), `lf_bathe`,
   `lf_human_lost`) and any text with no switch that implies the cat (the shared brief).
5. **FX, fixes:** `lf_bathe` "several weeks of forest" (time-neutral); `lf_bored` "for a long moment"; `lf_exit` "a good deal"; the
   hunt's failure "Rainbows, then nothing." (a short failure line for a missed glassback hare; the Wilds has the same line, so make
   this one its own; keep it short); any day or week count elsewhere in your lines (the shared brief).
6. **CW:** at most **2** throwaway lines (the shared brief), one sentence each, inside scenes that exist (no new code, no gains): good
   homes are the Tan brothers or Fang Wei (who smell his cooking, or note the strange low music from his tool at the camp they
   watched) or Yuki at breakfast (`lf_morning`'s enter line "Breakfast." is mechanical: leave it). Never the point of the scene; James
   deflects deadpan or says nothing.
7. **Continuity and voice:** the shared brief's lists. Keep the scenes that the second texts will follow (run D) clear and
   distinctive: run D writes a second visit for `lf_falls`, `lf_ride` (and its reply), `lf_bored`, `lf_bathe`, `lf_notes`, `lf_storm`,
   the four zones, `lf_trial_won`, `lf_trial_lost`, both encounters (`lf_wanderers`, `lf_human_talked`, `lf_human_won`) and
   `lf_human_lost`; your texts are the first visits.

## Your check
`cd /tmp/rw-p8a && node -e "import('./js/story/longforest.js').then(()=>console.log('loads'))"` prints "loads", and
`grep -n "TODO" js/story/longforest.js | grep -v "RP TODO\|SW TODO"` prints nothing. Don't commit. Reply with a 5-line summary.

# Part 8, run B: the Long Forest's ten fights (the stomp texts)

Read /tmp/rw-p8-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p8b** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). **Edit only /tmp/rw-p8b/js/story/longforest.js, lines 71–211** (the
`registerStomp({ … })` block, from `const aside` to just before `const lfTrailArt`). The scenes are run A's, running beside you in
another copy; don't edit them.

Your older-lines list: /tmp/rw-p8-info/older-runB.lines (72 strings, about 2,540 words): every string in the block is older: all of
it is yours. Notes: /tmp/rw-p8-info/notes-runB.md.

## How these texts are used (js/story/power.js, the top comment)
- Each fight's `posture(g, d)` opens the fight at every degree (1 an even fight, 2 James clearly outclasses it, 3 crushingly);
  `aside(d, a, b, c)` picks its last sentence by degree (keep three, in that order: even / outclassed / crushing). The fight's own
  `intro` is never shown (Claude has emptied them).
- `win[2]` and `win[3]` replace the victory text when he outclasses or crushes it; `one()` is the one-move finish (he ends it in one
  move); there is no `win[1]` (an even fight ends on the scene `lf_trial_won` / `lf_human_won`, run A's).
- **The Long Forest's fights are farmable:** each can be fought once a day, every day, and its texts come back every time. Write
  them to bear repetition: no "for the first time", nothing that only makes sense once (a beast "learning a lesson" may come back the
  next day: let that be part of the joke, or keep it neutral).
- The loot (the items after a win) is in the fights table above your block (not yours); a win text may mention what he takes, but
  must agree with it: bone-hounds 1 core; the Ossuary Wyrm 2 cores and a giant's bone-meal; mire-brood 2 ghost-gills; the Bog-Mother
  2 cores and 2 ghost-gills; storm-hawks 4 feathers; the Thunder-horn ram 2 cores and roast ram (+30 satiety: so the ram, or another
  ram, is eaten: keep the existing joke's logic sound); root-lurkers 1 core; the Heartless 3 cores; the Tan brothers their jerky
  (+15 satiety); Fang Wei 3 Ninefold spirit grass (his poached herbs). Enemy names stay exactly ("Scarred Tan", "Little Tan",
  "Fang Wei, Outer Disciple (lapsed)").
- **James never kills humans.** The Tan brothers and Fang Wei are hurt, humbled, robbed of their loot and left alive. Fang Wei is
  Foundation; his Qi senses find nothing on James. The Tan brothers' posture has a `byForm` (cat / great root-kin / human: "With a
  *lady*. In *silk*.") — review all three branches; `win[3]` of the bandits takes `(g)`: keep it.
- The Heartless: a giant husk of dead wood with a hole where its chest was; the note the Hearth Trees sing at home stops it. Keep it
  sad; it is the Old Tree's leftover. Don't name Selene.

## Tasks
1. **ST:** rewrite every string in the block (the shared brief's rules: same beats and jokes where they work, ±25% length, the asides
   still a ladder of contempt, Yuki's lines fit whatever form she is in unless a `byForm` carries them: most say only "Yuki" with no
   body: keep it so, or make the wording fit all three).
2. **Repeats across the game:** the other fights' stomp texts are in /home/claude/bone-and-ash/js/story/stomp_prologue.js and
   stomp_act1.js: don't reuse their images or five-word runs (grep); vary the one-move finishes (several now run "One X. One Y."):
   at most two of the ten in that shape.
3. **Continuity and voice:** the shared brief's lists. No CW lines in this run.

## Your check
`cd /tmp/rw-p8b && node -e "import('./js/story/longforest.js').then(()=>console.log('loads'))"` prints "loads". Don't commit. Reply
with a 5-line summary.

# Part 8, run C: Yuki's form scenes, and the season lines

Read /tmp/rw-p8-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p8c** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). **Edit only:**
- /tmp/rw-p8c/js/story/longforest.js from the line `/* ---------- Yuki's forms ---------- */` to the end (the scenes
  `yuki_tiger_awaken`, `yuki_human_awaken`, `yuki_human_after`, `yuki_form`), and
- /tmp/rw-p8c/js/story/prologue.js: the `SEASON_LINES` list only (search `const SEASON_LINES`).
Run D is working beside you in another copy on other lines of longforest.js (the 'RP TODO' and 'SW TODO' strings); don't touch them.
Runs A and B (the Long Forest's scenes and fights) are done and merged: read them for voice, don't edit them.

Your older-lines list: /tmp/rw-p8-info/older-runC.lines (line numbers of the scaffold; find each string by its start: they are all
inside the four scenes, 13 strings, about 670 words). Notes: /tmp/rw-p8-info/notes-runC.md.

## Tasks
1. **YA, Yuki's form scenes (older; rewrite them).** **These four scenes are seen game-wide**, not only in the Long Forest: the great
   form wakes at James's first breakthrough to Core Formation (realm 2) and the human form at Nascent Soul (realm 7), **wherever he is**
   (the wilds, the village's edge, the Blackroot, the Long Forest; `place:` is wherever he stands), and the chooser opens from any
   hub. So: no Long Forest specifics in them (no camp, no falls), nobody else's presence assumed (if others are near, the text doesn't
   say so), and no claim that contradicts what comes later. Keep every beat: the great form's growth told through the bond, *Finally.
   I have been small for long enough.*, shrinking back, *I can do both. Whenever I like. Don't make it weird.*, the reply line's claws
   "the way you'd underline a word"; the human form's unfolding, her look (the shared brief: very long straight white hair, pointed
   white cat ears, long white tail, narrow gold slit eyes, the long black high-collared qipao with red piping; barefoot is fine), her
   first words aloud ("insufferable"; this is where "for the first time in your life you hear your root-kin's voice" belongs: keep it),
   "Three shapes. One of me.", the small form best for sleeping on him. The chooser's three form lines and the result lines (keep their
   mechanical part: "Yuki: cat form.", "Yuki: great root-kin form (hits much harder in a fight).", "Yuki: human form.": those three stay
   exactly; the longer result lines are prose).
2. **FX, in these scenes:** `yuki_human_after` "a white tiger the size of a pony" → the size of a Bengal tiger (the canon; or just
   "the great form" without a size, since the reader has seen it); "a puddle of black fabric" and "dress and all" (her clothes are the
   qipao; keep the joke that the clothes come and go with her); "for a long moment" (in `yuki_human_awaken`); "gold eyes, level with
   your chest" (a lint favourite: say it another way); **"Don't tell anyone I can talk," she adds. "People say stupid things in front of
   cats."** — in every later scene the human Yuki talks aloud in front of Mei Lin, Ya, the village and the Sect, so this promise is broken
   the next day: keep her pleasure in what people say in front of cats, but make it a preference she can drop (she'll choose who hears
   her; or she'll keep the cat for listening and the woman for answering back), not a secret. The label 'Promise.' stays (a label): make
   the line it answers still fit a "Promise." (e.g. a promise not to make a fuss about it, or not to tell anyone what she says about
   them).
3. **SS, the season lines** (`SEASON_LINES` in prologue.js; 14 placeholders 'SS TODO 1' … 'SS TODO 14'). They are the result line of
   the Long Forest's season card ("Withdraw for a season: X → Y."), shown once for each rung reached: entry 1 when he reaches
   Foundation, 2 Core Formation, 3 True Core, 4 Golden Core, 5 Origin Core, 6 Soul Embryo, 7 Nascent Soul, 8 Spirit Transformation,
   9 Immortal Ascension, 10 Mahayana, 11 Earth Immortal, 12 True Immortal, 13 Golden Immortal, 14 Heavenly Immortal. A mechanical line
   follows each ("Realm: Foundation → Core Formation. GU, Convergence Use, Yuki's Fight and Qi Use: at least T2 L4."), so **don't name
   the realm**; let the season and the rung show (Foundation: he could fly now and doesn't bother yet, or does; Core Formation: Yuki
   is about to outgrow her shoulder; Nascent Soul: something in him is quieter and more than one; the high rungs: the forest gives up
   having opinions about him). **No sky, no lightning, no tribulation** (James has none; the sky's own visits are other scenes'), no
   numbers of days. 15–30 words each, deadpan, each its own image; a season of the year may turn in some of them, but not as a
   cycle of four. The five lines they replace are yours (v0.11.141) and may be reused or reworked:
   /home/claude/scratch/season-old.txt. Don't reuse `lf_seclusion`'s images (the cave behind the falls with snow, spring moss on his
   boots and fish, the foxes in summer, the autumn leaves): read them in /tmp/rw-p8c/js/story/longforest.js.
4. **Voice:** the shared brief. No CW lines in this run.

## Your check
`cd /tmp/rw-p8c && node -e "Promise.all([import('./js/story/longforest.js'), import('./js/story/prologue.js')]).then(()=>console.log('loads'))"`
prints "loads", and `grep -n "SS TODO" js/story/prologue.js` prints nothing. Don't commit. Reply with a 5-line summary.

# Part 8, run D: the second visits, and the drills

Read /tmp/rw-p8-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p8d** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). **Edit only the placeholder strings 'RP TODO …' and 'SW TODO …' in
/tmp/rw-p8d/js/story/longforest.js** (`grep -n "RP TODO\|SW TODO" js/story/longforest.js`). Every other line is done (runs A and B,
merged): read them, don't edit them. Run C is working beside you in another copy on Yuki's form scenes and prologue.js.
Notes: /tmp/rw-p8-info/notes-runD.md. All of this is new text (nothing older).

## Why (the owner's roadmap item, part 8: "its repeats (its days are not counted; every daily scene one text)")
The Long Forest's days aren't counted, and a player who stays a while sees its daily scenes again and again with one text each.
Claude has added a visit count per scene (`visit`, `later`; world flags `lf_seen_<key>`, per Coil): **the first visit shows the text
beside your placeholder (run A's), and every later visit shows yours.** So each of yours is read on the second, third, tenth visit:
write it for "again", not for "the second time" exactly (no ordinal counts; "again", "as usual", "by now" are fine), and make it
fresh against the first text: its own images, not a paraphrase. Keep the scene's job and facts (what the place is; what he does; what
the choice labels below it offer: read them, they don't change). About **60–80% of the first text's length** unless noted.

## RP, the later visits (20 placeholders)
- `RP TODO falls` (`lf_falls`): standing under the cold falls again; the choices: stand under it and hold the loop, or decide it's a
  metaphor and go back.
- `RP TODO ride` (`lf_ride`): riding Yuki (always in her great form for this) through the canopy again; she stops at the top and lets
  him look (the Blackroot, a village's smoke, the dead tree). `RP TODO ride reply` (the result of 'Thank her. Properly. She will want
  fish.'): a later thanks; the fish deal stands (the flat ones from the slow water), one or two sentences.
- `RP TODO notes` (`lf_notes`): replaces only the field notes' two finding paragraphs (*Key finding … / *Practical consequence …*)
  with a later page of notes in the same italic notebook voice: what the latest entry records (whatever he'd note on another day:
  the beasts' habits, the trials restocking, Yuki's opinions, a hypothesis revised); the realm and Saturation line above stays, and
  so does Yuki's entry below (both not yours). Keep it *italic*, two short paragraphs.
- `RP TODO bored` (`lf_bored`): replaces the three paragraphs after her opening line (the first line, "I am bored" / *bored.*, stays
  and is not yours): the toy again: he has to out-invent his own bone toys; she has opinions. Fits all three forms (no body named,
  or one that fits any). The choice 'Make her another one. Then three more.' follows.
- `RP TODO bathe` (`lf_bathe`): replaces the first paragraph only (the cold black water, the rock for his coat, nothing trying to eat
  him, what the river shows him of his body now); Yuki's line by form follows (not yours). Time-neutral (no weeks, no days).
- `RP TODO storm` (`lf_storm`): standing in the lightning again: it comes, stops above him and goes back up, again (the sky can't
  find anything to punish in him); end with Yuki's reaction **in a `${byForm(g, cat, greatRootKin, human)}` call** (write the call
  inside a template literal: replace the whole 'RP TODO storm' string with a backtick string; the cat sends a thought, the great
  root-kin a thought too, the woman says it aloud).
- `RP TODO bone`, `RP TODO mire`, `RP TODO roots` (the zones `lf_bone_depths`, `lf_black_mire`, `lf_old_roots`): walking into the zone
  again; what has restocked, what knows him now; its two fights are offered below (read the labels). `RP TODO ridge`
  (`lf_thunder_ridge`): replaces the first paragraph only (the realm line after it stays, not yours).
- `RP TODO trial_won` (`lf_trial_won`, from the second win on, any zone): replace the whole placeholder template with a backtick
  string that **keeps the expression `${name.toLowerCase().startsWith('the ') ? name.slice(4) : name}`** (the beast's name) in a
  sentence, and ends with **`${byForm(g, cat, greatRootKin, human)}`**: Yuki's verdict on the fight in each form (the cat, the great
  root-kin, the woman aloud). Two short paragraphs and her line.
- `RP TODO trial_lost` (`lf_trial_lost`, a lost trial, again): he loses again and gets away; Yuki leads it off; no shame; the choice
  'Limp back to camp and sleep it off.' follows.
- `RP TODO meet bandits`, `RP TODO meet rogue` (`lf_wanderers`, meeting them again the same Coil): the Tan brothers or Fang Wei have
  met him before this Coil (beaten, talked past, or having robbed him: the text can't know which, so keep it to "you again" from their
  side, their pride intact or freshly patched); they still can't sense anything on him and still think him a mortal; they make their
  speech anyway. The choices that follow: fight, talk past, walk away.
- `RP TODO talked bandits`, `RP TODO talked rogue` (`lf_human_talked`, talking past them again): a new way to bore the Tans into
  letting him go (not the fungus lecture again), a new lie that sends Fang Wei running and leaves his herbs (+2 Ninefold spirit grass
  comes from the scene's code: the line may mention the grass left behind).
- `RP TODO won bandits`, `RP TODO won rogue` (`lf_human_won`, beating them again): alive, hurt, humbled; he never kills; the Tans'
  jerky is his (+15 satiety, code), Fang Wei's poached herbs taken as evidence (code). A closing exchange as good as "Lost."
- `RP TODO lost` (`lf_human_lost`, robbed again): replaces the first paragraph only (Yuki's line by form follows, not yours); they
  take some food, never know about the hammerspace, laugh at the mortal in the white coat (or robe).
Each must load as JavaScript: a string in single quotes needs `\'` for apostrophes; prefer a backtick template literal for anything
longer than a line or with apostrophes.

## SW, the drills (21 lines in `LF_DRILL`, near the top of the file)
They were silent: the result line of a Practice card at the Long Forest's camp, once a day. The picker shows all three of a list
before any comes back, in any order, never the same twice running: each must stand alone and differ in its image. 12–25 words each,
deadpan.
- `t1` / `t1Fail`: 'Darts at moving targets: leaves, as they fall.' (success / failure)
- `t2` / `t2Fail`: 'Blade forms until your arms stop arguing.' (the wraithbone blade)
- `t3`: 'Spar with Yuki. Properly. No holding back on her side.' (success only; the failure already says "She doesn't hold back. −3 HP."):
  fits all three forms with no body named, or one that fits any.
- `t4` / `t4Fail`: 'Needle drills: one point, one knuckle-width, a thousand times.'
Not the Wilds' drill lines (grep `DR_` and "dart" in /home/claude/bone-and-ash/js/story/wilds.js and act1_blackroot.js): your own.

## Your check
`cd /tmp/rw-p8d && node -e "import('./js/story/longforest.js').then(()=>console.log('loads'))"` prints "loads", and
`grep -n "TODO" js/story/longforest.js` prints nothing. Don't commit. Reply with a 5-line summary.

# Part 8, run E: the review's text fixes (the owner's picks CA1 and RV1)

Read /tmp/rw-p8-info/brief-common.md (the shared rules) and the two reviews: /tmp/rw-p8-info/review-T.md (text) and
/tmp/rw-p8-info/review-C.md (code). Your working copy: **/tmp/rw-p8e** (a scratch git worktree; /home/claude/bone-and-ash is
read-only). **Edit only /tmp/rw-p8e/js/story/longforest.js and the `SEASON_LINES` list in /tmp/rw-p8e/js/story/prologue.js.** The
review's line numbers are a little out of date (Claude added code since): find each string by its words. Notes:
/tmp/rw-p8-info/notes-runE.md (one line per fix: old → new). Claude has already done the code: a visit now counts once a day (so
"again" always spans a night: the zones' "restocked" texts are right now, T3 needs no text), the second-meeting hooks (placeholders
below), Yuki's human-form scene only after the great form's (T8's code).

## Fixes (all picked by the owner; keep everything else as it is)
1. **MB (T1, CA1):** the mire-brood's crushing win, first paragraph, and its one-move line: no clean water, no new power; use review
   T's no-new-fact text (he looks at them as he would at a slide; nothing has ever stood on this bank and failed to be afraid), polished
   as you like.
2. **BT:** "a Bengal tiger" stays in `yuki_tiger_awaken` and `lf_ride`; say it another way (or no size) in `yuki_form` and
   `yuki_human_after`.
3. **T2:** `lf_exit`'s third paragraph and `lf_notes`'s key finding: he didn't merely suspect it last time; he was told to his face on
   Day 4 by someone ready to stake her life on it (don't name Mei Lin), and has now tested it here.
4. **T5:** the same two texts, and the notes' "Bandits remain optimistic" / "Cultivators cannot." (wherever they are): he may have met
   neither the Tans nor Fang Wei; make them neutral ("everything in this forest that has looked at you" or as good). No code.
5. **T6, the second meeting's fight openings (new):** fill 'RV TODO bandits again cat' / 'tiger' / 'human' (the posture's first
   paragraph when the Tans have met him before this Coil: Scarred Tan's rehearsed speech, reused and adjusted ("The mortal. In the
   *white robe*. Still in the deep forest. Still with…" and the form's own end: the cat, the very large cat, the lady in silk), Little
   Tan's laugh a beat late, the toll (gone up for repeat travellers); 40–70 words each; the paragraph "They can't feel a thing…" follows,
   not yours) and 'RV TODO rogue again' (replaces Fang Wei's first two posture paragraphs when he has met him before: the lapsed joke
   again ("in case it was missed"), his Qi down both arms, "You know what grows here, mortal.", the threat; 70–110 words; "He truly
   senses nothing…" follows). Use backtick template literals if a string has apostrophes or quotes. In the later meeting text for Fang
   Wei (`lf_wanderers`), the narration must not name him ("the poacher"): he gives his name only in the fight's opening.
6. **T4:** Fang Wei's CW line: "one dusk" → review T's fix ("before he came on you"), or as good.
7. **T7:** `lf_human_lost`'s later text: no "people", no "They" (one robber or two): review T's fix or as good.
8. **T8 (text):** `yuki_tiger_awaken` "your new Core" → "your core".
9. **The lows:** T9 (the human's lock of hair: a side lock, not behind an ear), T10 (the Tans' two cooking remarks: the fire back
   upstream / what was in the pot this morning), T11 (season line 3: drop "last season"; season line 1: one clause placing him on the
   ledge above the falls or near them), T12 (`lf_enter` "at the cat" → "at Yuki"), T13 (`lf_bathe`'s later text "a man you would step
   aside for" → true at any realm), T15 (the tics: "From her," ×3 and the hound's "counts as respect"; tenants / landlords / buyer /
   owner-with-a-guest; clerk / clerical; Fang Wei and the sky ×3; "has not moved" ×2; the bond as cheating ×2; "that is not a figure of
   speech" (Mei Lin's line elsewhere)), T16 (the hub: restore "a doctorate in not being in a hurry" or as good), T17 (the Heartless:
   "taken out of it, long ago", no blade), T18 (`lf_storm`: no paragraph ending on a comma), T19 (the roots' later text: not "where they
   fell"), T20 (the Wyrm's crushing win: two core-knots for the two cores; the ram's "all evening" → as long as dinner takes), T21 (the
   notes' later text "generous": revise or drop the word).
10. **C5:** the drills' three failure lists (`t1Fail`, `t2Fail`, `t4Fail`) are also shown on a near miss (a partial result on the task
    screen): word each so it fits a near miss as well as a clean failure (12–25 words, three different images each, as before).

## Your check
`cd /tmp/rw-p8e && node -e "Promise.all([import('./js/story/longforest.js'), import('./js/story/prologue.js')]).then(()=>console.log('loads'))"`
prints "loads"; `grep -n "TODO" js/story/longforest.js js/story/prologue.js` prints nothing. Don't commit. Reply with a 5-line summary.

