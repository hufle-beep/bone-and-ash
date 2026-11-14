# Cold review: v0.11.172, Fable's rewrite part 5 (the Blackroot)

Read-only review of the working tree at /home/claude/bone-and-ash against /tmp/rw-p5-info/build.diff, the brief, the three run
sheets and the three notes files. Nothing in the repo was changed. Scratch scripts are in /tmp/rv5 (skel.mjs and cmp.mjs: the
code of HEAD against the tree with the strings taken out, and every scene field and choice compared; sim1.mjs: a real game from
`bl_start` to `ht_start` through `taskCards`, `runTask` and `choose`, three Coils with a real `rewind`, as cat, great root-kin
and human, with and without skipped days; sim2.mjs: every card of the three hubs run once; sim3.mjs: 2,880,000 renders of the
60 scenes, titles, places and labels over 3 forms, 6 region-days, 5 hours, 20 flag sets, 4 relationship states, 4 day records
and the 11 night events, plus the ten stomp entries; split.mjs, five.mjs, grams.mjs: the new replies as reply-only lines, shared
five-word runs, and phrase counts before and after).

**Counts: 0 high, 3 medium, 14 low, 9 test gaps.**

What was checked and is clean:
- **Code:** with the strings removed, `act1_blackroot.js` differs from HEAD only in the five places the pick names (`DR_YA_OFF`
  as `coilReply` with three sets, the three new lists, the two drills' `do`, "Cook and eat."'s `do`) and in the four `byForm`
  third arguments that were `''`; `stomp_act1.js` has no code difference and no change outside lines 93–299. Ids, keys, flags,
  `enter` functions, gains, checks, times, Qi costs, `show` conditions, `place`, `title`, `art`, the number and order of choices:
  identical in all 60 scenes. Labels: exactly the three named changed; the old wordings are referenced nowhere in js, tools,
  tests or saves.
- **Reach, in a real game:** the darts, the needles and "Knock it off" show entries 1 to 5 on Days 11 to 15 (the hubs are open
  on all five days); the stakes 1 to 4; a skipped day moves the later entries down as designed. Three Coils with `rewind()`:
  "Knock it off" shows set 1, set 2, set 3 (the flirts with it), each from its first text; the day record resets with the Coil.
  A partial result on a drill stays silent (no items, so `failDo` runs). `yuki_path.js` splices its camp choices before "Sleep.",
  so "Cook and eat." stays choice 0.
- **Text:** no render throws or shows "undefined", "NaN", "${", "[object", "null" or TODO in any state tried, including the
  second and third day texts, the flight branches, `yr_day` / `mb_day`, `ya_waited`, `ya_respected`, `mei_first: 'raft'`,
  `ape_lured`, the thread watch and every night event. All 25 new reply lines sort as reply only (no sentence reads as a gain);
  none shares a five-word run with another or with the rest of the game beyond two stock phrases.
- **Calendar:** the game ends at `ht_start` on Day 16 06:00 in every run; "Five days in … Six"; "Ten days back" (Day 11 or 12
  against the stream camp of Days 1 to 3); "stopped for nothing in two days" (Day 12); "Two days. Then we're under it" (Day
  14); the Ashen Hills fireside can only play on Day 14, where "Not tonight, but soon now" is true; "a few days and a dead
  tree"; "Fifteen years" three times, with Ya 27 and twelve at the pass. Shen Qiu is not mentioned. No "three days", "four-day"
  or "tomorrow, or the day after" is left.
- **Nights:** no scene text, reply or stomp win promises a full night after a night fight; `nightRest` is untouched.
- **Sensing:** nobody senses Qi or a realm; Ya goes by smell and by what he does.
- **Stomp against scenes:** every win keeps its scene's facts and haul (the antler-tine and the hammerspace; "since I was nine"
  and the unfinished sentence; the ride, "You're insane", "That was beautiful", the roast; Ya under after Mei Lin, the forearm
  elbow to wrist, "You came in after me"; "Little queen", two hawks carried; the hand on its face, the spear-head in black
  leather, Mei Lin at her side, "It knows we're here"; wolf meat, one hawk, the drowned and Mei Lin's knees). The three
  continuity fixes in the notes (the elk-eating in place of the mother's spear, Mei Lin already under at degree 3, fifteen years)
  are right.
- **Lint (`node tools/textlint.mjs --list`, log only):** the Blackroot's scenes with favourite phrases 25 → 10 (what is left is
  the shared pantry line on four screens, the pinned "a black dress" and the two pinned great-root-kin lines, and "the herb
  girl", which is Ya's name for her); tics 2 → 0; 0 broken. The brief's listed tics in these lines: "a long time" 12 → 2 (both in
  the newer `SPRING_*` constants), "the first time" 7 → 0, "the way a" 7 → 0, "a thousand years" 4 → 0, "herb-knife" 3 → 0.
- **CW:** six throwaway lines, three a run, one each by Ya, Yuki and Mei Lin in both runs; music generic (a woman singing in no
  language spoken here; low and droning); no artist, title or lyric; no kitchen and no village pot; romance stops where it did.
- **Tests run here:** `tests/story.test.mjs` 4,607,589 passed, `data` 2,692, `part blackroot` 305,617, `tasks` 665,860, `news`
  19; 0 failed.

Not in the tree yet (expected before the docs step, listed so it isn't missed): `sw.js` VERSION is still `bone-ash-0.11.171`
while `js/core/news.js:31` has the 0.11.172 note; `roadmap.md`, `roadmap-2.md`, `roadmap-done-3.md` are modified and
`history-21.md` is new, but handover, changelog and restore-points are unchanged.

---

## High

None.

## Medium

### M1. The fifth cooking reply can never show: there are four camps, not five
`js/story/act1_blackroot.js:64-70` (`DR_COOK`), `:1131`; `tests/story.test.mjs:818-828`.

"Cook and eat." exists only on `bl_camp`, once a day (`bl_cook`). The expedition has four `bl_camp` nights: Day 11 (the Root
Road), Day 12 (the raft, from `dw_enter`), Day 13 (the wood's edge), Day 14 (the ridge). `rr_hub` offers camp only on
expedition day 1, `ah_hub` only up to day 4, `dw_hub` only after the hollow, and Day 15's night is `heart_view`, which has no
cooking. `DR_STAKES`, on the same screen, has four entries for the same reason.

Measured (sim1.mjs, food in the hammerspace, cooking at every camp, three forms): `bl_camp:0` shows entries 1, 2, 3, 4 on Days
11, 12, 13, 14 and nothing after. Entry 5 ("Nobody speaks until the pot is empty. Then Ya says you are to cook at her
funeral…") is dead text. The run sheet's "five lines, one for each day he cooks in a Coil" was wrong, and the test hides it the
same way part 4's did: it calls `cook.do` after `onDay(g, 4)`, a faked day record.

Fix, one of:
- (a) Make the list four. The funeral line is the strongest closer and suits the last camp under the tree, so: keep 1, 2, 3, put
  the present 5 fourth, and move the present 4 ("Mei Lin says "Oh" at the first mouthful…") to the research folder, or the other
  way round if the owner prefers it. Change the test to `length === 4` and to days 0 to 3.
- (b) Give the fifth night a meal: "Cook and eat." on `heart_view`. That is new code, food spent and satiety gained on a night
  that has none today, so it needs its own numbers and pick.
- Either way add the real-flow test (TG1).

### M2. `rr_scout`'s text is never drawn, so the "ten days back" fix and one of the six CW lines are invisible
`js/story/act1_blackroot.js:455-463`; `js/story/task_hubs.js:98`; `js/core/news.js:31`; `tests/story.test.mjs:841`.

`rr_scout` is a menu of `rr_hub` (`menus: { rr_forage, rr_scout, bl_train }`). A menu's scene text is not shown on a task
screen (on record since v0.11.156: project/history-19.md:162, "a menu's entry text is never drawn on a task screen"; part 4's
M2). sim2.mjs: the Scout group shows two cards, "Learn it properly. Nose in the moss and everything." and ""You followed me
for two days?""; each runs and leaves the game on `rr_hub`; the only words shown are the result lines.

So in play nobody reads: the tracking lesson, "Ten days back, before the village: your camp, by the stream" (the pick's CL fix),
"You fed the cat first, so: not Sect" (run 1's CW line 1), or the moss trail of the lights. The card ""You followed me for two
days?"" appears with nothing before it that says she did. The news note tells the player "Ya's nose remembers your first camp
from ten days back", which the player cannot find, and the P5A test passes by calling the scene's `text` directly.

The same holds for the other menus this push rewrote: `rr_forage`, `dw_forage`, `ah_forage` and `bl_train`'s opener (about 480
words with `rr_scout`). Their result lines, which are shown, are fine.

Fix (text only, inside result lines, which the brief counts as prose):
- `:466`, the reply of ""You followed me for two days?"": `"Ten days back. Your first camp, by the stream. The wolves weren't
  the only ones going round it." She shrugs. "You fed the cat first, so: not Sect. You were interesting. Most things aren't."`
  That puts the calendar fix and the CW line where they are read, and gives the card its own setup.
- `:465`, the success line, can carry the lesson's first words: `"Eyes lie. Ears lie. Nose doesn't," says Ya, and holds your
  face down in the moss until you agree. You can smell wolf now. You will never again be able to stop smelling wolf. Ya is
  extremely proud of you.`
- Take "Ya's nose remembers your first camp from ten days back" out of the news note unless the first fix goes in.
- The wider question (where a menu's text should be seen) is still open from part 4; nothing here needs it decided.

### M3. The Heart's first screen contradicts the night under the tree (carried to part 6)
`js/story/act1_heart.js:143-153` (`ht_start`) against `js/story/act1_blackroot.js:1380-1386` (`heart_view`) and `:1405-1407`
(`bl_end`). Not this push's file and not new, but the rewrite went over both sides of the seam and it is the act's main hand-over.
Run 2's notes list it.

Three things in one screen:
- `heart_view`: "You camp in the roots of the dead tree", with the doorway in sight; `bl_end`: "The doorway in the trunk is wider
  than it was last night." Then `ht_start`: "Day sixteen. The forest stops. Not gradually. One moment there are black trunks and
  grey moss … the next, a clearing half a kilometre across … in the middle of it, the tree", and the choice "Cross the
  clearing." They woke at the trunk; and the forest already stopped on Day 14 (`ah_enter`).
- `heart_view`: out of the doorway "comes the part of the song the roots have been missing. Your Convergence is singing back."
  `ht_start`: "Your Convergence sings to it and nothing sings back. That's the worst part."
- `ht_start`: "Mei Lin … has a hand on Yuki's back, and Yuki is letting her" fits the great root-kin only.

Fix: in part 6, start `ht_start` at the doorway. Suggested opening, same length: "Day sixteen. By daylight the roots you slept
in are the least of it. The trunk goes up past the point where your neck agrees to bend, grey and smooth and enormous, a cliff
of dead wood, and there are no leaves; there haven't been for a very long time. Last night something in there sang back, faint
as breathing. This morning your Convergence sings to it and gets nothing. That is the worst part. You are used to Hearth Trees
that answer." The choice's label ("Cross the clearing.") then needs the owner's pick ("Walk to the doorway."). Until then,
write the seam into the handover as an open item so part 6 starts from it.

## Low

### L1. "yesterday" in two replies that go by the k-th day, not the day before
`js/story/act1_blackroot.js:74` (`DR_BL_DART` 2: "You begin where you stopped yesterday.") and `:81` (`DR_BL_NEEDLE` 2: "Finer
than yesterday's."). sim1.mjs with Days 12 and 14 skipped shows entry 2 on Day 13, two days after entry 1; a failed drill in
between (silent, not counted) does the same. Fix: "You begin where you left off." and "Finer than the last lot."

### L2. "the knot" has nothing before it now
`:73` (`DR_BL_DART` 1: "Somewhere past thirty the knot stops being a knot."). The label is "Darts at a mark" since this push,
and the Practice opener is never drawn (M2), so the knot is first heard of as it dies; on a first drill in the Ashen Hills there
is no bark at all. Fix: "Twenty paces, then thirty, then forty. Somewhere past thirty the mark stops being there to hit. Ya
says it had that coming."

### L3. "Fifty paces" on the raft
`:75` (`DR_BL_DART` 3). For a James who drills daily the third entry falls on Day 13, the Drowned Wood, where Practice is "One dry
trunk, with length enough to move on" over black water, and Ya "stands next to the mark". Fix, region-free: "Farther again. Ya
goes and stands by the mark to make it interesting. You make it less interesting than she hoped, and she is impressed,
slightly."

### L4. The cooking reply after food that was not cooked
`:1131`. `eatBest` eats one thing, the most filling. With only cress, needleberries or honeycomb in the hammerspace the result
reads "You eat: needleberries. +3 satiety." and then "Nobody speaks until the pot is empty." Fix (one condition, no new text):
add the reply only when the line says it was cooked, `/, cooked\./.test(out[0])`; or accept it, since the label is "Cook and
eat." either way.

### L5. The human form has no line in three loss scenes where the great root-kin has one
`:861` (`ah_hawks_lost`), `:986` (`ape_lost`), `:1347` (`bl_night_lost`). Run 1 filled its four empty human branches; run 2 left
its three, so from Nascent Soul (the owner's usual form by Day 11) Yuki vanishes from these, and `bl_night_lost` says "told
off, in two voices" beside a woman who speaks aloud. Suggested, same job and length as the great root-kin's:
- `ah_hawks_lost`: `\n\nYuki stands upwind with a hawk's tail feathers in one fist and a scorched sleeve. "Mine is also
  holy," she says. "Nobody is reviewing mine."`
- `ape_lost`: `\n\nYuki sits against your other side with one arm held close. The ape threw her before it hit you, and she was
  back on her feet in time to see it go. She says nothing. Her tail lies across your knees and does not move.`
- `bl_night_lost`: ` Yuki, who had hold of it until it had hold of her sleeve, sits on your feet. "Three voices," she says. "I
  am also telling you off. I am doing it quietly."`
Each needs its row in the YB1 test (story.test.mjs about 2210-2223), as the other four got.

### L6. The wyrm's stomp posture has Ya repeat, word for word, what she said one screen earlier
`js/story/stomp_act1.js:119`: `"Antlers first," she says. "A whole elk. I watched."` follows `rr_end` (`act1_blackroot.js:494`:
"I watched it eat a bone-elk whole. Antlers first.") with nothing between them. On the failed-bridge path it also has her "gone
quite still" a line after `rr_bridge_fail` had her yell and charge. Fix: `Ya plants her feet. "That's all of it," she says.
"I never saw all of it."`

### L7. The ape "comes down off its rock" after the lure has already drawn it off
`act1_blackroot.js:218` (the intro) and `stomp_act1.js:213` ("leaves its rock on all fours"). After a successful lure it went
for the bait at the side and `ape_lured` has it heave round to face you. Fix, true on both paths: intro "The rot-ape drops onto
all fours and comes, and the ground jumps. The fur is moss. What looks out of it is not."; posture "The rot-ape comes on all
fours, and the pass jumps under it."

### L8. "Your bone has one of its eyes"
`:954` and `:961` ("to finish what the bone began"). The darts are rightly gone, but "your bone" reads first as his own
skeleton. Fix: "It goes for the bait. A white spike has one of its eyes before it learns you exist." and "…to finish what the
spike began."

### L9. `ya_found`, the waited branch, against its second label
`:900`: she "settles at the very edge of the camp to gut it"; the second choice still says "Bring it back to camp … She's been
looking for you." The rewrite made the camp explicit, so the label now contradicts the text above it. Fix in the text: "She
comes back when she is ready, as far as the next rise: chin up, a hare over one shoulder, in plain sight of the camp and not in
it. She sits there to gut it, with her back half turned to you."

### L10. Two of the six CW lines are the same joke
`:761` (`mei_curious`, Mei Lin: "You put her on when one of us is cold … I've counted.") and `:1267` (`friends_watch`, Yuki:
"you only put that one on for people you like. You say it was next in the queue."). Both: the arm plays a woman's voice, a
companion says whom he plays it for. A player on the friends path meets both, a day apart. And `friends_watch`'s is a
paragraph of its own (three sentences, +36 words), more than the brief's one sentence. Fix: keep Mei Lin's; make Yuki's about
the food, one sentence in the second paragraph: "Yuki remarks, to nobody, that you kept the last of the meat warm for whoever
came off watch, as you always do; you say it was in the way."

### L11. "Knock it off", set 3, entry 1: "soon neither are you"
`:57`. He was not laughing; he had just told her off. Fix: "The likeness is fair; Mei Lin has to look somewhere else. Ya is
not smiling, and the joke goes cold in your mouth before you can enjoy it."

### L12. Bond speech with no switch beside the woman who speaks aloud
`:707` (`dw_after`: "*They will be insufferable now,* she observes. *And you will cook twice as much for them. I know you.*").
`ape_won` handles the same case ("she says, for you alone"); here she stands next to him in plain sight. Fix: "she observes, on
the bond, where it will not carry." One clause, all three forms.

### L13. "again" on the first night
`:1144` (`bl_fireside`, Root Road, Day 11: "you gave the best piece away again"). True if he cooked just before (`DR_COOK` 1
has him fill the other bowls first); the fireside is open without cooking, and then nothing came before it. Fix: drop "again".

### L14. The news note says "in each loop"
`js/core/news.js:31`. There are three sets; the fourth Coil shows the first again. Fix: "goes differently for three loops
running".

Noted for later parts, no change asked here: `dw_scout:643` "I think I came here in one" (he came through a lab's seed chamber,
lore.md:18; run 1's note, with the safer "My people grow them."); `act1_return.js:274` tells Ya's childhood differently from
`talk_ya` (run 3's note); `yuShort`'s "all four hundred pounds of her" (stomp_act1.js:14) prints in three Blackroot stomp
texts; the lint's spacing notes on `rr_hub`, `dw_hub`, `ah_hub` and `dw_scout` are the empty `${…}` pieces, older than this push.

---

## Yuki's three forms (item 2)

Every text she is in was read in each form. Right in all three: `bl_start`, `ya_mocks`, `ya_fight_start`, `ya_spar_lose` (the
laugh on the bond), `rr_elk_lost`, `rr_bridge_fail`, `wyrm_won` ("putting herself to rights"), `wyrm_lost` (the great root-kin
and the woman both come down the air, which lore.md:66 allows), `dw_serpent_lost`, `dw_drowned_lost`, `hot_spring` ("trees
don't tell"), `mei_curious`, `ah_hunt`, `ah_hawks_won`, `trio_kiss`, `ape_won`, the cooking reply's "Mine", `bl_fireside`'s
three and four, `friends_watch`, the wolves ("They have seen Yuki"), the warm night, `heart_view`, `bl_end`; in the stomp
texts the hawks' two switches, the serpent's "anything, of any size" and "Her", and the ape's bond line. The cat rides his
shoulder wherever she is placed; no cat or great-root-kin line has her speak aloud; the woman speaks aloud wherever she has a
line of her own. The points left are L5 (three empty human branches) and L12 (one bond line).

---

## Test gaps

### TG1. The by-day replies are tested with a faked day record, never in a game
`tests/story.test.mjs:818-838` call `do` after `onDay` (a Proxy that answers every key with k earlier days). Add a real-flow
test: a game at `bl_start`, Day 11 06:00, high skills, food in the hammerspace; each day run the open Practice cards through
`runTask` and "Cook and eat." through `choose`; walk to `ht_start`. Then
`assert(shown['bl_camp:0'].length === DAY_REPLIES['bl_camp:0'].length)` (fails today: 4 of 5, M1) and the same for
`bl_train:1` and `bl_train:2` (5 of 5 today).

### TG2. No test that a fact the news note promises is shown
`:841` reads `txt('rr_scout')`. Add: from `rr_hub`, `runTask(g, SCENES, 'rr_scout:1')`, then
`assert(g.scene === 'rr_hub' && /Ten days back/.test(r.lines.join(' ')))` (fails today, M2), and the same for the CW fragment
"You fed the cat first".

### TG3. The render pass misses the branches behind the day record, the hour and eight flags
`:856` (FLAGSETS) at 12:00 on a fresh day record. Not reached: the second and third day texts of the `byDay` scenes (`rr_hunt`,
`rr_elk_won`, `ah_hunt`, `ah_hawks_won`, `bl_night_won`, the Drowned Wood's second camp, fireside and night, five night events),
talk beats 1 to 5, `yr_day`, `mb_day`, `ya_waited`, `ya_respected`, `{ romance: true, mei_first: 'raft' }`, `drowned_done`,
`ape_lured`, `bl_watch: 'thread'`, and both liking him without `trio: 3` (two different affection numbers). Add an axis
`for (const k of [0, 1, 2, 3]) onDay(g, k)`, those flag sets, and `g.rel` at `[[0, 0], [80, 0], [0, 80], [80, 80]]`. sim3.mjs
ran all of it clean, so this pins what is true today.

### TG4. The stomp wins' facts
`:849-853` check that the texts render, "mother's spear" and "Fifteen years". The brief says every fact of the scene is kept.
Add, for both degrees: `bone_elk` `/antler-tine/`, `/hammerspace/`, `/any time/`; `root_wyrm` `/nine/`, `/scales/`, `/four of
you|three of you/`; `mire_serpent` `/You're insane/`, `/That was beautiful/`, `/roasted/`; `drowned` `/You came in after me/`,
`/elbow to wrist/`, `/Who'd stitch me/`; `cinder_hawks` `/Little queen/`; `rot_ape` `/spear-head/`, `/It knows we're here/`,
`/Mei Lin/`; `night_wolves` and `night_hawks` nothing that contradicts the meat given (`!/both.*alive/`).

### TG5. The nights' rule
Nothing asserts it. Add: for the four fights' `bl_night_won` texts on days 0 to 3, `bl_night_lost`, and the eight night stomp
wins, `assert(!/full night|sleep(s|ing)? (soundly|through)|the rest of the night asleep/i.test(t))`.

### TG6. The new replies as reply-only lines; the CW cap
`:811` checks `splitLine` for "Knock it off" only. Add the same for `bl_camp:0` (in each form), `bl_train:1` and `bl_train:2`,
and through the real line: `const sp = splitReply(cook.do(g)); assert(sp.gains.length === 1 && sp.reply.length === 1)`. The
six CW fragments are checked for presence; a seventh can slip in. Add a marker comment per line and a count, as TG6 of part 4
proposed.

### TG7. The calendar words beyond the two fixed lines
`:840-844`. Add: `rr_end` `/in two days/`; `ah_enter` `/"Two days,"/`; the Ashen Hills fireside `/Not tonight, but soon now/`
(a positive check; today only the old wording's absence is tested); `mei_bond` `/a few days and a dead tree/`; `talk_ya` beat 1
`/when I was twelve/` and `/Fifteen years/`; and on the source `!/two days and a dead tree|Three days ago|a thousand years/`.
If L1 is taken: `!/yesterday/` in the lists that go by the k-th day (`bl_train:1`, `bl_train:2`, `bl_camp:0`, `talk_ya:3`).

### TG8. "Knock it off" through a real rewind
`:812-815` set `coil.n` and `stats.coils0` by hand. The flirts have a real one (`:431-436`, `rewind(g)` then the set). Add
`talk_ya:3` to that loop, so a change to `actCoil` or to the day record's reset is caught for all three lists.

### TG9. One form's words in another form's text
Nothing asserts it. Add, over the render pass and the stomp texts: as the woman, `!/\bpaw\b|purr|whiskers|on your shoulder,
claws in/`; as the cat or the great root-kin, `!/"[^"]+," (says Yuki|Yuki says)|her foot on it|her heel on it/`; as the great
root-kin, `!/Yuki, on your shoulder|from your lap/`. And if L5 is taken, the three new rows beside the four at about
`:2210-2223`.

---

## Kept aside (owner pick RV1, M1, v0.11.172)

The cooking list went to four lines (four camps, Days 11–14); the fourth of Fable's five, moved here word for word, for a later
fifth meal or another place:

- "Mei Lin says \"Oh\" at the first mouthful, out loud, and then looks round for her mother. Ya tells her the noise was correct, and to make it again at the next one."
