# Cold review: v0.11.170, Fable's rewrite part 4 (the Fallout)

Read-only review of the working tree at /home/claude/bone-and-ash against /tmp/rw-p4-info/build.diff, the brief and the notes.
Nothing in the repo was changed. Scratch scripts are in /tmp/rv4 (sim2.mjs: the hub's cards played Days 8 to 10; sim3.mjs: 464,400
renders of every Fallout scene, title, place and label over 3 forms, Days 8 to 11, 3 hours, 5 endings, 4 relationship states and
3 flag sets; sim4.mjs: the prologue Ashfall's cards).

**Counts: 0 high, 4 medium, 12 low, 8 test gaps.**

What was checked and is clean: ids, flags, keys, gains, checks, times and the order of choices are unchanged (the diff's code
lines differ only in the reply text and the five labels); all eleven reply lists have three entries and their keys match the
choice index and the success or failure branch they sit on; no render throws or shows "undefined", "NaN", "${" or TODO in any
state tried, including the relationship branches the push's own test doesn't reach; the five old labels are referenced nowhere
else in js, tools, tests or saves; the calendar numbers are right (thirteen on Day 8, twelve on Day 9, eleven on Day 10, ten on
Day 11, Shen Qiu on the twenty-first); romance stops at the door in all three night scenes; no artist, title or lyric.

Not in the tree yet (expected before the docs step, listed so it isn't missed): `sw.js` VERSION is still `bone-ash-0.11.169`
while `js/core/news.js` already has the 0.11.170 note; handover, roadmap, changelog and restore-points are unchanged.

---

## High

None.

## Medium

### M1. The success lines for Days 9 and 10 can never show in a real game
`js/story/act1_fallout.js:31-32, 34-36, 38-44` (the eight success lists `DR_FO_SING`, `DR_FO_PITS`, `DR_FO_COUNCIL`,
`DR_FO_LISTEN`, `DR_FO_DRILL`, `DR_FO_SPAR`, `DR_FO_CLINIC`, `DR_FO_BOY`); `js/core/news.js:30`.

`fo_palisade`, `fo_council`, `fo_drill` and `fo_clinic` are `ONCE_MENUS` (`js/story/oneoff.js:18`): a work card that succeeds is
closed for the rest of the Coil (`js/core/tasks.js:216` hides it, `:318` and `js/core/story.js:294` set `oo:<menu>#<i>` on
success only; nothing clears those flags before the rewind). `dayReply` picks an entry by how many days its key was noted this
Coil, and the record is reset with the Coil. A success key is therefore noted on one day at most, so entry 1 is the only one a
player ever sees.

Measured (sim2.mjs, a real game through `taskCards` and `runTask`, only cards that are open):
- Day 8: all eight cards open; seven succeed (Listen is "tomorrow" after Speak, the council's daily gate).
- Day 9: the only card left of the four menus is `fo_council:1` (Listen). It shows its entry 1.
- Day 10: none of the four menus has a card.

So 16 of the 24 success texts (and four more by-form variants in the spar) are dead text. Only the three failure lists
(`DR_FO_PITS_F`, `DR_FO_DRILL_F`, `DR_FO_BOY_F`) can reach entries 2 and 3, and only by failing on two or three different days.
This matches the existing test's own words (story.test.mjs:321, "a list for every reply the bots saw on two days"): the bots only
ever saw failures twice. The brief's premise ("these cards can be run on all three days") was wrong, and the new test hides it by
faking the day record with a Proxy (`onDay`, see TG1). The news note tells the player "The palisade, council, drill and clinic now
answer with a different line on each of the three days", which is not what happens.

The same holds for v0.11.169's five lists (`clinic:0`, `clinic:1`, `workshop:0`, `drill:0`, `drill:1`): sim4.mjs shows the
prologue Ashfall's cards gone on the day after they succeed.

Fix, one of:
- (a) Pick these eight by the story's day instead of by the count of days: `list[dd(g) - 8]` (Day 8, 9, 10). Every text then
  becomes reachable, on the day it was written for (the council's entry 2 and 3 are about the Old Tree, the clinic's entry 1 is
  the scythe boy of Day 8). Four lines assume an earlier success and need a small rewording to read true as a first success:
  `DR_FO_SING` 2 "Today's stretch meets yesterday's" and 3 "The song comes easier now"; `DR_FO_BOY` 2 "the youngest first again"
  and 3 "has moved the youngest to the front herself"; `DR_FO_LISTEN` 2 "You keep silent again"; `DR_FO_DRILL` 2 "lock on the
  first call today". Keep `dayReply` for the three failure lists, where the count of days is right.
- (b) Take the lists back to their first entry and keep the 16 texts in the research folder until the cards do repeat.
- Either way, correct the news note and the tests README row to what the player gets.

### M2. The council's Day 10 text is never drawn, and on Day 10 there is usually no council card at all
`js/story/act1_fallout.js:285-291`; `js/core/news.js:30` ("the council has its own Day 10").

A menu's scene text is not shown on a task screen: a work card goes to the menu and straight back to the hub
(`tasks.js` `resolveWork`), and `main.js:263-270` only draws the text of the scene the game rests on. This is on record
(project/history-19.md:162-163: "a menu's entry text is never drawn on a task screen", "M2 T1 never drawn"). So the new third
council (about 150 words) is invisible in play, as are Day 8's and Day 9's council texts and the rewritten scene texts of
`fo_palisade`, `fo_drill` and `fo_clinic`. They render only from a save that rests on a menu scene.

On top of that, Speak and Listen are each once a Coil and the council is once a day, so after Speak on Day 8 and Listen on Day 9
the council has no card on Day 10 (sim2.mjs). When one card is left for Day 10 it is offered alone: after Speak on an earlier day,
Old Wen's "It will now hear the stranger's" would be followed only by "Listen. Say nothing."

Fix: decide where a menu's text should be seen before spending more text on it. The existing route is the group note
(`task_hubs.js:162`, a menu's `note` shown after the group heading, TX-A in v0.11.156), which only carries a short line, not 150
words. Until that is decided, take "the council has its own Day 10" out of the news note. If the text is to be shown, end it so
that it reads true with either card alone (for example Old Wen's last line as "The council has heard my reasons. The stranger may
add his own, or keep them.").

### M3. The mother's line refers to a supper that has not happened yet on Day 8
`js/story/act1_fallout.js:361` (CW line 2): "You put your salt pork in her bowl while she was drawing on my table."

The drawing on the table is Day 8's supper (`fo_supper`, line 418: Mei Lin "draws the palisade line in spilled tea on the
table"; salt pork is that supper's dish, line 414). The card "Pay your respects to Mei Lin's mother" is open from Day 8's
morning (`fo_ashfall`, line 245: `!g.flags.fo_mother && !late(g)`), hours before that supper. The prologue's suppers have smoked
fish and no drawing (`ashfall.js:98`). On Day 8 she describes something from the coming evening.

Fix: make it true on any day, for example: "You put the best of your bowl into hers when you think I am watching the pot," she
adds, to the pot. "Do not suppose it goes uncounted." That also brings the line to the brief's one sentence of remark plus a tag
(see L8).

### M4. The farewell says the hunters will "finish" a palisade that can be complete
`js/story/act1_fallout.js:697`: with `g.flags.palisade >= 2` the text is "two thirds done or better. The hunters swear on their
ancestors to finish it before you are back." At 3 of 3 there is nothing left to finish. In today's game the count stops at 2
(two cards, each once a Coil, M1), so this is latent; it becomes visible the moment the cards repeat (M1 fix (a) does not change
the count, a later un-gating would). `fo_council` Day 10's "Who finishes the palisade" (line 287) has the same assumption.

Fix: a third branch at `>= 3` ("Beyond the door the palisade stands white along the whole barley line. The hunters swear on their
ancestors to keep it."), or cap the count where it is raised (lines 265-266: `Math.min(3, …)`; "Palisade: 4/3 stretches." is
what `do` returns when called a fourth time, as the new test's direct calls can).

## Low

### L1. `bl_start` still says "Three days in, maybe four"
`js/story/act1_blackroot.js:256` against `act1_fallout.js:667` ("Five days in, maybe six") and the act's calendar (Day 11 to the
Heart on Day 16). Not this push's file and not new; the writer's notes list it. Fix it in the Blackroot part: "Five days in,
maybe six," Ya says.

### L2. The watcher's stomp win 2: he offers a sword he no longer holds, with a pinned arm
`js/story/stomp_act1.js:23-27`: the sword "is no longer in his hand", his sword-arm is pinned to the ridge by the sleeve, and two
lines later "he offers you the sword in both hands, hilt first". Fix: "Then, one correct act being left to him, he reaches for the
sword with his free hand and holds it out to you, hilt first."

### L3. The wolves' stomp win 2 has hunters on the path where nobody woke them
`js/story/stomp_act1.js:53`: "It is over before the hunters have their headbands tied." Reached from "Go down and meet them in
the field" too, where the hunters are asleep. Fix: "It is over before the first shutter in the lane has opened."

### L4. Day 8's loft line counts rows for a week on the first night
`js/story/act1_fallout.js:434`: "this week's bundles, hung since the tribute, a row for each day" shows only on Day 8 with a
palisade stretch (Day 9 has its own line, Day 10 goes to the farewell). The tribute was yesterday, so that is one row. Fix: "The
loft smells of mint and drying ginseng: the first bundles hung since the tribute, in a row along the new-scrubbed beam."

### L5. "Lower than the Sect has ever had from her"
`js/story/act1_fallout.js:365`. In the bluff ending all of Ashfall was on its knees in the dust for the envoy that morning
(line 102). A bow can't be lower than that. The old line ("Lower than to the envoy") had the same problem in one ending; the new
one has it in every ending where the village kneels. Fix: "She bows to you. Low. Lower than the Sect has ever had from her of her
own will."

### L6. James drops the senior's voice in the bluff letter
`js/story/act1_fallout.js:136`: the old "And if the Senior has other plans?" kept the bluff (he is playing a senior; the next
choice still says "This one is in seclusion"). The new "And if I have other plans?" removes it to cut a repeated word. Fix: "And
if this one has other plans?"

### L7. Yuki is in the fled ledger and missing from the won ledger
`js/story/act1_fallout.js:389` against `:407` (and both stomp wins): the same ledger gives Yuki a smudge, a facing page or "the
lady: do not approach" when he flees, and no entry when he is caught. Older than this push for the great root-kin; the push
widened it to all three forms. Fix (no code): add to `fo_spy_won` and the two stomp wins a form-neutral clause, "and a page on
the white one that he would not let you read twice."

### L8. CW: six lines, at the cap, and one is two sentences
The six land as throwaways and nobody answers them; none needs the kitchen (salting the pot unseen and putting pork in a bowl are
inside the brief's allowance); the music is generic. Two remarks:
- CW 2 (`:361`) is two sentences of speech; the brief says one each. The fix in M3 handles it.
- CW 3 (`:695`) is the first mention anywhere in the game that his arm plays music (grep of prologue.js, ashfall.js,
  house_texts.js, yuki_time.js: none). It reads fine as a reveal, but the news note should not suggest it was shown before.
- CW 1 and CW 2 are both the mother, both about salt at her table, one day apart. If one is to go, drop CW 2 and keep CW 1.

### L9. New habits in place of the old tics
`js/story/act1_fallout.js`, counts before → after: "very nearly" 0 → 5 (lines 35, 37, 41, 44, 546); "as one …" 2 → 6; "plainly"
2 → 6; "aloud" 2 → 8; "at last" 1 → 5; "Nobody" 31 → 38. The listed tics did go down ("the way a" 6 → 2, "a long time" 8 → 2,
both left in lines that were not on the list). Fix: vary three of the five "very nearly" (line 35 "and almost nods", line 37
"and all but through a cousin", line 546 "is close to hope").

### L10. "hilt first" four times
`act1_fallout.js:41` (the spar, human, entry 3), `:387` (`fo_spy_won`), `stomp_act1.js:25` and `:35`. Fix: the spar's "hands it
back hilt first" → "hands it back across her sleeve".

### L11. `fo_mei` Day 10's first label no longer fits the text above it
`js/story/act1_fallout.js:349`: '"I wasn't going to stop you. I was going to ask you to come."' follows a text that now says he
told her that morning ("If you have thought of a reason since this morning, keep it"). The rewrite fixed the text and left the
label. Label idea for the owner (labels need a pick): '"No reason. I was going to carry the basket."'

### L12. Lines that assume an earlier day (only matter with M1 fix (a))
`DR_FO_BOY` 3 (line 44) has the old woman moving the youngest to the front herself, while the card's label still reads "take the
old woman's disapproval" and the menu text still says the order is never altered; `DR_FO_SING` 2 says "yesterday's" stretch,
which may have been dug as pits or not built. Covered by the rewording listed under M1 (a).

---

## Yuki's three forms (item 3)

Every text she is in reads right in each form. Checked one by one: the bluff and paid openings (form-neutral now), the council's
"Your cat / Your great beast / Your companion", the three spar entries, `fo_spy_lost`, `fo_spy_fled`, Day 8's supper, the wolf
wake, `fo_wolf_forced`, `fo_wolf_lost`, `ya_meets`, `ya_forced`, the brawl's terms, `ya_lost`, both `fo_last_night` switches,
`fo_ya_night`, `fo_depart`, and the stomp texts through `yu` and `yuShort`. Nothing outside a switch implies one body. Small
points only: in `ya_forced` the woman is "by the fence" and the brawl's terms then have her "step off the fence"; in
`fo_ya_night` the ladder "is somewhere it should not be" a paragraph before the woman takes the blanket down it. Neither needs a
change.

---

## Test gaps

### TG1. The by-day replies are tested with a faked day record, never in a game
`tests/story.test.mjs:659-668` calls `choices[i].do` directly after `onDay` (a Proxy that answers every key with k earlier
days). Add a real-flow test: a game on `fo_ashfall` at Day 8 07:00 with high skills; run each open card of the four menus through
`runTask`; move the clock to Day 9 and Day 10 and do the same; then
`assert(SR_SUCCESS_KEYS.every((k) => new Set(shownTexts[k]).size === daysItWasOpenAndSucceeded[k]))` and, for the behaviour the
push promises, `assert(SR_SUCCESS_KEYS.some((k) => shownTexts[k].includes(DAY_REPLIES[k][1])))`. Today the second assert fails
for every success key (M1).

### TG2. No test that a text the news note promises is reachable
Add: over the three days of TG1's game, collect every scene id that `sceneView` rendered while it was `g.scene`;
`assert(!NEW_TEXT_SCENES.some((id) => isMenuScene(id)) || shownSomewhere(id))` for the scenes this push wrote new prose for.
`fo_council`'s Day 10 text fails it (M2).

### TG3. The render pass never reaches the relationship branches
`tests/story.test.mjs:700` varies flags only. `fo_last_night`'s three-of-you text and Ya's text, `fo_ya_night` with
`fo_pick: 'ya'`, `fo_mei_insists`'s tail and `ya_share` depend on `g.rel`. Add to the loop a second axis:
`for (const rel of [[0, 0], [60, 0], [0, 60], [60, 60]]) { g.rel['Mei Lin'] = { f: 50, a: rel[0] }; g.rel.Ya = { f: 50, a: rel[1] }; … }`
and assert `fo_last_night` gives four different texts over that axis with `romance` on and off.

### TG4. One hour of the day only
`F` sets 12:00 on every render. Add 01:00 (the wolves' hour, when `dd(g)` already reads the next calendar day) and 21:00 for
`fo_wolf`, `fo_wolf_won`, `fo_night`, `fo_morning`, `fo_last_night`, and assert `fo_night` at Day 8 21:00 with `palisade: 0`
contains "There is no palisade yet" and at Day 9 21:00 contains "Twelve" when `romance` is set.

### TG5. The calendar words are not tied to the day
Add: `for (const [d, w] of [[8, /Thirteen/], [9, /Twelve/]])` on `fo_night` with `romance`; `/Twelve days to the Elder/` in
`fo_morning` Day 9 without `ya_met`; `/eleven days/` in `fo_council` Day 10; `/Ten days to the Elder/` in `fo_depart`;
`/Five days in, maybe six/` in `fo_price`; and `assert(!/Tomorrow I take you to the tree/.test(SRC))`.

### TG6. CW: the cap and the order of events are not tested
The test only checks that six fragments exist. Add: `assert(!/drawing on my table/.test(txt('fo_mother', F(seed++, 'cat', 8))))`
(M3), and a count so a seventh can't slip in: a marker comment per CW line (`/* CW */`) and
`assert((SRC.match(/\/\* CW \*\//g) || []).length <= 6)`.

### TG7. The stomp wins' facts
`tests/story.test.mjs:693` checks "ledger" and "bow" only. The brief says every fact of the scene must be kept. Add for
`sect_watcher` wins 2 and 3: `/north road/`, `/noon/`, `/four disciples/`, `/the herb-girl who laughs/`, `/wolf's skull/`,
`/hilt/`, `/without the (sword|hilt)/`; for `palisade_wolf` wins 2 and 3: `/skinned/`, `/skulls/`, `/chalk line/`, `/Old Hu/`,
and win 3 contains `yuShort(g)` in each form; for `ya_brawl` posture, every degree: `/coat/` and `/salt/`.

### TG8. The palisade count and its texts
Nothing asserts what `fo_farewell` and `fo_palisade` say at 0, 1, 2 and 3 stretches, or that the count can't pass 3. Add:
`fo_farewell` at `palisade: 0` and `1` contains "more chalk than stakes", at `2` "two thirds", and at `3` does not contain
"to finish it" (M4); and after four direct calls of `fo_palisade` choice 0's `do`,
`assert(!/Palisade: [4-9]\/3/.test(out[0]))`.
