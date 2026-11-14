# Part 9, task sheet run A


Read /tmp/rw-p9-info/brief-common.md first. **Working copy: /tmp/p9/A** (edit only there). File: `/tmp/p9/A/js/story/stomp_prologue.js`.

## Your lines
The older (pre-v0.11.69) texts of four fights in `registerStomp({...})`: **jackals** (posture, win 2, win 3, one), **gao** (Gao Feng
and his lackey on the herb slope: posture, win 2, win 3, one), **boar** (the ironhide boar in the oak hollow), **collectors** (Inner
Disciple Lu Han and his three disciples at the tribute, Day 7). The list of older strings with their first words:
/tmp/rw-p9-info/older-stomp.txt (line numbers of the old file; yours are lines 18–112: jackals 367 words, Gao 474, boar 398, Lu Han's
men 538). Rewrite all of them (OT): same beats, same outcome, tighter and fresher, the gap told dry. Keep `aside(...)` calls and the
`${...}` expressions; byForm/stompForm counts as in the brief.

## Fixes inside your lines
- **YV**: the jackals' posture ends `${yk(g)} yawns.` and win 3 has `which is when ${yk(g)} sits on him.`: a verb after `yk(g)`
  breaks for the woman and the great root-kin. Replace each with `${stompForm(g, catClause, tigerClause, humanClause)}` (three whole
  clauses; you may add these `stompForm` calls; the human one speaks aloud or acts as a woman would, e.g. she doesn't sit on a jackal
  the way a cat does). Check every other `yk(g)` / `ykShort(g)` in your four fights for the same break.
- **FM**: the tribute is four men in crimson (Lu Han and three disciples, `prologue.js` ~710 "four men in crimson"). Make every
  number of men in the collectors' texts agree (Lu Han + three; never "two" of them where all four are meant).
- **Facts**: Gao Feng is an Outer Disciple bully with a lackey; James never kills humans (Gao, the lackey, Lu Han and his men all walk
  away or are carried away alive); locals can't sense James's cultivation (Lu Han's posture says "There is no cultivation in you":
  keep that); the jackals' core (a cloudy walnut-sized knot, "Something tells you the locals would kill for this") is the first core
  James sees: keep that beat in win 2 and 3.
- The tics list in the brief applies.

## Not yours
Every other fight in the file (crows, rats, lizard, mire: run B's; wolves, thornback, arson: rewritten in part 3, run B checks two of
them). `yk`, `ykShort`, `aside`, `stompForm` definitions: don't change.

## Notes and check
Notes: /tmp/rw-p9-info/notes-runA.md. Load check:
`cd /tmp/p9/A && node --input-type=module -e "await import('./js/story/stomp_prologue.js'); console.log('ok')"`

# Part 9, task sheet run B


Read /tmp/rw-p9-info/brief-common.md first. **Working copy: /tmp/p9/B** (edit only there). Files:
`/tmp/p9/B/js/story/stomp_prologue.js`, `/tmp/p9/B/js/story/ashfall.js` (one scene, `far_won`).

## Your lines (1): four fights' older stomp texts
In `registerStomp({...})`: **crows** (three rot-crows at the night camp), **rats** (mire-rats up the stream bank at night), **lizard**
(the rock lizard, a "thornback"-like spined beast that comes to the night camp; don't confuse it with the thornback bull), **mire**
(three mire-rats out of the black water in the Mire). Posture, win 2, win 3, one for each. Older strings with first words:
/tmp/rw-p9-info/older-stomp.txt (old file lines 114–172: crows 197 words, rats 224, lizard 253, mire 217). Rewrite all of them (OT):
same beats, same outcome, tighter and fresher, the gap told dry. Check every `yk(g)` / `ykShort(g)` in them for a verb straight after
(see the brief; replace with `stompForm(g, …)` clauses if so; you may add those calls). The prologue's night fights are at a camp fire
(check each text's light, fire and setting against `js/story/prologue.js` and `wilds.js` night scenes: search `crows`, `rats`,
`lizard`, `mire`).

## Your lines (2): TB, the thornback bull and the far hunt (written in part 3; fix only what is listed)
The far hunt (`ashfall.js`, `far_hunt` … `far_won`, around line 340–365) fights either two ash-wolves or the thornback bull
(`g.flags.far_kind`), then always goes to `far_won`, whose `enter` **always** gives +1 Murky beast core and +2 wolf meat or +2
thornback eggs (fixed gains), and whose text (two texts by day, `byDay`) tells the carry home to Ashfall and the hunters' bow.
The faults:
- **The bull is left alive** in the stomp `thornback.win[2]` (on its side, breathing, one gold eye watching) and `win[3]` (belly up,
  playing dead; "You leave it to its performance and take the eggs"), yet `far_won` gives a core (a core comes out of a dead beast)
  and "loads". Make the stomp win texts end with the bull dead (a clean, quick kill, told dry; James kills beasts) so the core and the
  loads hold. Keep win 3's form switch (`stompForm`) and its three bodies.
- **The stray " I"** after "not moving at all." in `thornback.win[3]` (a broken fragment): remove it.
- **No twin, a doubled beat:** the stomp wins (thornback, and `wolves` too: check its win 2 and 3) also tell the carry home and the
  hunters' bow, then `far_won` tells it again (its two texts differ by day; the stomp ones don't). Fix: the stomp win texts end at the
  kill (and what James takes from the body), and leave the homecoming and the bow to `far_won`'s two texts. Edit `far_won`'s two texts
  only if they need it to fit (e.g. both forms of kill); keep `byDay(g, [...], 'far_won')`, its two entries and its `enter` untouched.
- `thornback.one` and `wolves.one`: check they fit (the core must come from somewhere).

## Not yours
jackals, gao, boar, collectors (run A's), arson, and every other scene in `ashfall.js`.

## Notes and check
Notes: /tmp/rw-p9-info/notes-runB.md. Load check:
`cd /tmp/p9/B && node --input-type=module -e "await import('./js/story/stomp_prologue.js'); await import('./js/story/ashfall.js'); console.log('ok')"`

# Part 9, task sheet run C


Read /tmp/rw-p9-info/brief-common.md first. **Working copy: /tmp/p9/C** (edit only there). Files: `js/story/prologue.js`,
`js/story/coil_scenes.js`, `js/story/yuki_path.js`, `js/story/wilds.js`, and for CW only `js/story/ashfall.js`. Find each line by its
words (line numbers may be a little out).

## P1, the prologue and Yuki's path
1. **MS, Yuki "can't be sensed":** `yukiMerElder` and `yukiMerLu` (prologue.js, near the top, ~113–114; used in Old Wen's tea scene
   ~591 and Lu Han's tribute ~716) have Old Wen and Lu Han *read* Yuki's open meridians, but locals can't sense her cultivation (Lu
   Han's own line just before says his sense "reads no realm there either"). Rewrite all six branches (12 open / some open, `n` /
   none) so each speaks from what he **sees** her do or what Mei Lin told him (e.g. Qi gathering round her when she moves, a wound
   that closes, her eyes on things a cat can't see), never from sensing. Keep each function's three-way branch, `n`, `yukiSpot(g)`,
   `byForm` and the "I am ninety…" line's role (Wen is ninety; one line of his weight). Tests pin these: Claude updates the tests.
2. **RD, the road's direction:** `a1_again` (coil_scenes.js ~127–140) says "the road up the mountain" for the taken ending; read
   `rt_taken` (act1_return.js, search `rt_taken`) and `WHY.clear` (coil_scenes.js ~26: "Shen Qiu is somewhere down the mountain") and
   make the three agree (the Sect's road climbs into the mountains, act1_return.js ~798; the grove is where?). Edit only coil_scenes.js.
3. **YP, three of Yuki's path lines kept for the tests:** yuki_path.js ~454–457: the cat / great root-kin `mei_lin` beat lines
   ("*She's pretty,* says the bond…", sister and lover) repeat the human branches' words; and the `romance` beat's three byForm
   branches ~460–462. Rewrite the bond-only (non-human) versions so they are their own texts, not copies (same beat, same joke kinds:
   the thesis supervisor, "I approve. Of her."; the roof, the goat shed). Claude updates the test pins.
4. **NE, "Mei Lin says you made a needle":** Old Wen's tea (prologue.js ~591) says it on every path, but on the path where James
   ignored Mei Lin on the herb slope (`g.flags.ignored`, set ~560) she never saw a needle. You may add one switch:
   `${g.flags.ignored ? '<what Wen has heard instead>' : '<the needle line>'}` (read the `ignored` path ~560–590 for what happened).
5. **TD, "for three days":** yuki_path.js ~27, ~49, ~237: Mei Lin "has been eating with them very slowly next to you for three days"
   (the chopsticks in the Blackroot). The talk can come on Day 11, the Blackroot's first day. Make it true on any Blackroot day
   (time-neutral, or "since the road began").

## P2, the Wilds (wilds.js)
6. **The menus' dead text:** `wild_hunt` and `wild_train` are work menus: their `text:` is **never drawn** in task mode (a work card
   goes to its menu and straight back). Move anything worth keeping (a joke, Yuki's line) into drawn text nearby only if it fits
   (a result line in the same menu, e.g. the reply lists `DR_HARE`, `DR_FEET`), then set the menu's `text:` to `''`.
7. **The rats' won line:** `night_won`'s rats line (~159: "The stream takes the rats back. One stays on the bank…") against the
   rats' count (two, ~71 and ~114) and `night_won`'s +1 meat from a rat (~153). Make them agree.
8. **Explore's "three places":** `wild_explore`'s text (~280) says three places carry the label *what is that* even after some are
   visited (read its choices and their flags). Make the text true on every visit (time-neutral, or name only what is still unvisited
   by a switch on the existing flags: you may add one `${...}` switch on those flags).
9. **The lizard's "firelight":** the night event lizard (~119) "at the edge of the firelight": check whether a fire is lit at the Wilds'
   night camp (search `fire`, `camp` in wilds.js and prologue.js); if not always, make the light right (moonlight, the stream's
   glow, whatever the camp has).
10. **The drills' silent failures:** `wild_train`'s darts, blade and needles fail with `did('t_…')` and no line. Add three reply lists
   by day like `DR_FEET_F` (~39): `DR_DARTS_F`, `DR_BLADE_F`, `DR_NEEDLE_F`, each `dayReply("wild_train:<index>:f", [day2, day3])`
   (the index is the choice's position: darts 0, blade 1, needles 3), and use them: `failDo: didSay('t_darts', DR_DARTS_F)` etc.
   (that is the only code you add here). A failure is a miss or a near miss, told dry; Yuki may comment through the bond.
11. **The darts' "one hare":** the hare hunt gives +2 Glassback hare; `DR_HARE`'s lines (~48) read as one hare, one throw. Make them
   fit two hares.

## CW, parts 1–3 (at most six lines in all)
Parts 1–3 (the prologue's scenes, the Wilds, Ashfall's prologue days) have no CW yet. Add up to six throwaway lines by others (Mei
Lin, her mother, Old Wen, a hunter, a village child, Yuki through the bond) where James feeds someone or his music is heard, in texts
that are already about that moment (a supper, the camp's cooking, the village). Not in fights; not in Lu Han's scenes. Generic music
only. List each in your notes (file, scene, who, the line).

## Not yours
Everything else, including `far_won` and the fights' stomp texts (runs A, B), and every label.

## Notes and check
Notes: /tmp/rw-p9-info/notes-runC.md. Load check:
`cd /tmp/p9/C && for f in prologue coil_scenes yuki_path wilds ashfall; do node --input-type=module -e "await import('./js/story/$f.js')" || echo FAIL $f; done; echo done`

# Part 9, task sheet run D


Read /tmp/rw-p9-info/brief-common.md first. **Working copy: /tmp/p9/D** (edit only there). Files: `js/story/act1_fallout.js`,
`js/story/act1_blackroot.js`, `js/story/longforest.js`. Find each line by its words. Background for the Long Forest:
/home/claude/bone-and-ash/project/research/rewrite-part8-brief.md ("Where the Long Forest sits") and the review
`rewrite-part8-review.md` (the items T13, T21, T22, T23, C5, C6) and `rewrite-part8-runs.md` (run E's notes at the end).

## FF, the Fallout's four failure lists (act1_fallout.js, top)
`DR_PALISADE_F`, `DR_COUNCIL_F`, `DR_FO_SPAR_F`, `DR_FO_CLINIC_F` (`dayReply(key, [two texts])`, 8 texts, 177 words): a third failing
day shows the first again. Add a third text to each (the Fallout's three days, 8–10; the third may assume two earlier failures or
stand alone); you may also tighten the first two. Keep each key.

## P5, the Blackroot (act1_blackroot.js)
1. **The places:** `ya_found`'s `place:` (~896) reads one place on every branch, but on the waited branch she is found in a burnt
   gully (~900); `mei_bond`'s `place:` (~1210) names the Ashen Hills even when reached from another region. You may turn each into a
   function of `g` on the existing flags / `region(g)` / `PLACE[...]` (read how other scenes do it, e.g. `bl_train`'s
   `place: (g) => PLACE[region(g)]`). That is the only code change here besides item 3.
2. **The wolf tooth:** `ya_found`'s second choice (~912): Ya brings out a wolf's tooth on a cord, and the text never has her hand it
   over (or keep it). Finish the beat in the text: she gives it to him, or to Mei Lin, as the scene's logic says. Text only: no item
   is added.
3. **The menus' dead text:** `rr_forage`, `dw_forage`, `ah_forage` and `bl_train` (Practice) are work menus; their `text:` is never
   drawn in task mode. Move anything worth keeping into drawn text nearby (a result line in the same menu) only if it fits, then set
   each menu's `text:` to `''` (a function that only returns text becomes `''` too; keep `place:`, `art:`, `enter:`, choices).
4. **The stake lines:** `STAKE_LINES` (~234, four lines) are added to a night fight's intro, but at stomp degree 2 or 3 the posture
   replaces the intro, so they never show there. Claude does the code; you check the four lines read well after a posture too (one
   sentence each, no "then"), and tighten if needed.

## P8, the Long Forest (longforest.js)
5. **The menus' dead text:** `lf_forage`, `lf_hunt`, `lf_train` and `lf_trials` (the trial grounds' menu) are never drawn: as item 3
   (keep the joke "a scratching post" only if it fits somewhere drawn, e.g. the training's result lines `LF_DRILL`; review T23).
6. **The first visits from Coil 3 on:** today the visit counters (`seenOf`, `visit`, `later`) reset each Coil, so from Coil 3 every
   first-visit text replays to a man who has read it (review T14). Claude will make `later(g, k)` also true on a later Coil's first
   visit once the scene was visited in an earlier Coil. **Your job:** read every later-visit text (each `later(g, '…') ? <later> :
   <first>`, and the encounters') and make each one fit both cases: a second visit this Coil (another day), and a first visit this
   Coil that James remembers from an earlier Coil (no "yesterday", "again today", "this morning", "last time you were here" where
   that's false). Note any that can't fit both.
7. **The Heartless (T22):** `lf_trial_won` after the one grave fight reads its grave win and then a joke. You may add one branch on
   the beaten trial's name (find how `lf_trial_won` knows which trial was won) so the Heartless's win stays grave.
8. **The spar's near miss (C5, TG13):** the spar with Yuki (`lf_t3`) answers a failure with one fixed line; read C5 and make the spar's
   results read right in every band (use the `lfDrill(g, 't3Fail')` pool if one exists, like the other drills: that's the only code).
9. **Run E's three notes:** the later bathe's "scholar's stoop" at Mortal Vessel (it should fit any realm), the later notes' "two days
   at the trial grounds" (T21: "*Hypothesis: organised.*"), "the fire back upstream" on day 0 (the Tans' line ~614: no fire exists yet
   on day 0; time-neutral).
10. **"The sky has tried to strike me 0 times"** (`lf_notes`, ~408) at Mortal Vessel: a count of 0 reads as a bug. Make that line read
   right at 0 (a switch on the count's own expression is allowed).

## Not yours
Every label; the hub `lf_hub`'s label "Wash in the river. You have been in a forest for a long time." (the label pass); everything in
other files.

## Notes and check
Notes: /tmp/rw-p9-info/notes-runD.md. Load check:
`cd /tmp/p9/D && for f in act1_fallout act1_blackroot longforest; do node --input-type=module -e "await import('./js/story/$f.js')" || echo FAIL $f; done; echo done`

# Part 9, task sheet run E


Read /tmp/rw-p9-info/brief-common.md (the rules still hold). **Working copy: /home/claude/bone-and-ash itself** (branch p9-work; you
are the only writer of the story files now; Claude edits only tests meanwhile). Don't commit.

The reviews: /tmp/rw-p9-info/review-T.md (T1–T18) and /tmp/rw-p9-info/review-C.md (C5). Their line numbers may be a little out: find
each string by its words. Fix, as each finding proposes unless a better fix keeps the rules:
1. **T1 (high):** the far hunt's second-day stomp wins (`stomp_prologue.js`, wolves and thornback win 2 / 3, the second entry of each
   `byDay(...)`): `far_kind` is rolled fresh each day, so the second text must not assume the first day's kill was the same beast
   ("a second pair", "another bull, as big as the last"). Kind-neutral wording about the earlier day (or none).
2. **T2:** the crows, rats and lizard stomp texts assume a lit fire; the fire is optional (`g.flags.fire`). Fire-neutral, as you did
   for the lizard's night event (no code).
3. **T3:** Wen's and Lu Han's middle branches count events ("`n` times") they had seconds to see: a measure instead of a count, keep
   `n` in use (e.g. as a judgement of how strongly), keep the three branches. Also **the new tic**: the tribute scene now has
   "a mortal" three times (Lu Han's lines plus `yukiMerLu`'s "a mortal beast"): reword the one in `yukiMerLu`.
4. **T4:** Wen's `ignored` line ("the whole street watched you") against the village text ("Nobody looks at you"): make them agree.
5. **T5:** Gao Feng is at the tribute (prologue.js ~70–79, ~710; check whether he is among the collectors fight's enemies, `js/story/prologue.js` search `collectors`): the collectors' stomp texts (posture, wins, one) must account for him if he fights (a clause; no new code).
6. **T6:** the CW cooking line from Yuki (prologue.js ~91: "*You always cut mine first,* the bond adds…") repeats on every hare cooked and has no human form: make it fit every form (byForm is allowed there if the text is already a template; else wording that fits all three) and not read odd on a repeat (a line that bears repeating, or tie it to the first cooking only if a flag already exists; no new flag).
7. **T7–T18 (low):** each as the review proposes (T13: the lost jokes may go into drawn text only where they fit; T17: make the two
   music lines differ in what they notice).
8. **C5:** the Wilds drills' new failure lines (`DR_DARTS_F`, `DR_BLADE_F`, `DR_NEEDLE_F`) also show after a "partly" result (the card
   says "partly" first): each of the six must read right after a partial success as well as a miss (a near miss, not "never in danger").
   Keep 8–24 words each.

Notes: append a "Run E" section to /tmp/rw-p9-info/notes-runD.md (one line per fix: old → new). Load check:
`cd /home/claude/bone-and-ash && for f in stomp_prologue prologue wilds act1_blackroot longforest yuki_path ashfall act1_fallout coil_scenes; do node --input-type=module -e "await import('./js/story/$f.js')" || echo FAIL $f; done; echo done`
Then reply with a 5-line summary.

# The review brief


You review a finished, uncommitted-to-main rewrite of part 9 in the game Bone and Ash (branch `p9-work` in /home/claude/bone-and-ash).
Two reviewers run side by side: **review T (text, canon, continuity)** and **review C (code, tests)**. Your prompt says which you are.
Read only; **don't edit /home/claude/bone-and-ash** (review C has a scratch copy, /tmp/p9-rev, for planted faults). Write your report
to /tmp/rw-p9-info/review-<T or C>.md and reply with a 6-line summary.

## What was asked (the owner's pick P9A)
ST the prologue's eight older stomp texts (jackals, Gao, boar, Lu Han's men, crows, rats, lizard, mire) with YV (no verb straight
after Yuki's phrase `yk(g)`) and FM (four men at the tribute); TB the far hunt (the bull and wolves killed so `far_won`'s core holds;
a second-day twin of the stomp wins by `byDay(g, [...], 'far_won')`); P1 Old Wen and Lu Han judge Yuki by sight not sense, the road's
direction in the Coil texts, the bond-only path lines their own texts, Wen's needle line not on the `ignored` path, no "for three
days"; P2 the Wilds (the dead menu texts of `wild_hunt`/`wild_train` emptied, the rats' won line, Explore's map, the lizard's light,
the drills' failure lines `DR_*_F`, the hare lines count-free); CW up to six throwaway lines in parts 1–3 (generic music only); FF a
third text in the Fallout's four failure lists; P5 the stake lines as the night fight's `tail` (Claude's code), `ya_found` and
`mei_bond` placed by branch and region, the wolf tooth handed over (text only), the Blackroot's dead menu texts emptied; P8 the Long
Forest's dead menu texts emptied, `lf_known` (kept across Coils; a later Coil's first visit reads the later text; the Tans and Fang Wei
excluded: Claude's code), every later-visit text fit for both cases, the Heartless's grave win, the spar's failure pool `t3Fail`, run
E's three notes, the sky's count at 0. No id, flag rename, check, gain or label change; new: the kept flag `lf_known`, three day-reply
lists `wild_train:<i>:f`, the pool `lf_t3Fail`.

## Sources
- New: /home/claude/bone-and-ash (branch p9-work); old (v0.11.176): /tmp/old176/js; `git -C /home/claude/bone-and-ash diff ceac582..p9-work`.
- Fable's sheets and notes: /tmp/rw-p9-info/brief-common.md, sheet-run{A,B,C,D}.md, notes-run{A,B,C,D}.md.
- Canon: project/lore.md; rules: CLAUDE.md rule 7; stomp texts: js/story/power.js top comment; task menus: js/core/tasks.js
  (`resolveWork`; a work menu's text is never drawn); the Coil's kept flags: js/core/coil.js `KEEP_FLAGS`.

## Review T: text, canon, continuity
Read every changed string, old against new. Report anything that contradicts lore.md, the prologue's week, Yuki's forms (each branch
fits its body; the woman speaks aloud), who can sense or fly, James never killing humans, the gains (`enter`/`do` items), the order of
events (a later text that assumes an outcome; a first text that assumes earlier visits; the remembered-first-visit case in the Long
Forest), tone (deadpan James and Yuki; grave locals), tics (the brief's list), lost beats or jokes, the CW lines (generic music), and
anything moved out of an emptied menu that now reads oddly where it landed. Rate each finding high / medium / low, with the line and a
fix.

## Review C: code, tests
Read the code diff: `nightFight`'s tail, `visit`/`knownBefore`/`FORGETS`/`later`, `KEEP_FLAGS`, the places as functions, the new
day-reply lists and their `didSay` wiring, `t3Fail` and the spar's `failDo`, the Heartless branch, the emptied menus (anything that
reads a menu's text: render paths, the fold, the lint, the bots), `byDay` in the stomp wins (key, index against `far_won`'s own),
the tests (tests/story.test.mjs's block "v0.11.177 (owner pick P9A", the updated pins, tests/lib/deadmenus.mjs, tests/part.test.mjs,
tests/tasks.test.mjs's samples). Check saves (old saves load; a rewind keeps `lf_known` and clears the rest), and plant faults in
/tmp/p9-rev (one at a time; restore after) to see which the tests catch: run `node tests/story.test.mjs` there (about 2 minutes).
Report each finding high / medium / low with a fix, and a list of test gaps (TG1…).
