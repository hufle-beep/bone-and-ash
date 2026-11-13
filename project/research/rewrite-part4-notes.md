# Rewrite part 4 (the Fallout): Fable's notes

Files edited (in /tmp/rw-p4 only, not committed): `js/story/act1_fallout.js`, `js/story/stomp_act1.js` (lines 18–69: the three
Fallout entries up to `ya_brawl`'s posture; `ya_brawl`'s `win` and `one`, mine since v0.11.82, are untouched).
How it was applied: `/tmp/rw-p4-info/patch_fallout.py` and `patch_stomp.py`; the files before are `act1_fallout.before.js` and
`stomp_act1.before.js` in the same folder; the lint before and after: `lint-before.txt`, `lint-after.txt`.

## Checks run
- Both files load ("loads"); `grep TODO` prints nothing.
- Code skeleton (every string and template literal blanked) is identical before and after, apart from the prose inside the nested
  literal of `fo_supper` Day 9. Every `${...}` expression is kept (compared as a multiset, prose inside blanked).
- All 84 choice labels identical; ids, titles, places, enemy names identical; the mechanical parts are all still there once
  ("+25 / +30 / +35 / +20 satiety.", "Palisade: n/3 stretches.", "−2 HP." ×2, "Condensed:", "An hour of rest.", "+1 Jade bracket",
  "+Ya's wolf tooth", "+1 Murky beast core.").
- Every Fallout scene rendered for cat / great root-kin / human × Days 8, 9, 10 × the four endings × two flag sets: 2952 renders,
  no "undefined", no TODO.
- Text lint, Fallout: scenes sharing a passage 21 → 18 (what is left is the hub's pantry line, which is code, and `ya_meets`, not
  listed); scenes with favourite phrases 21 → 4; tics 3 → 1 (`ya_meets` "like nothing", not listed); broken 3 → 0.
  Whole game: favourite phrases 35 → 25, reused passages 62 → 61, tics 18 → 16.
- `node tests/story.test.mjs`: 8 asserts fail, all of them pinned texts that this brief asks to change or allows (for Claude to update):
  - `NQ1: fo_drill's result as tiger` and `NR1 (T): fo_drill's result through choose() as tiger`: the spar's entry 1 no longer says
    "bows to the cat" for the great root-kin (Task 2's fix).
  - `NR1: fo_council (plain)` ×3: the test's state is Day 10, which now has its own third council (Task 2); and Day 9's great
    root-kin text is "Your great beast" (Task 3).
  - `YB1 (LL): fo_spy_fled`, `XB2 (FL): fo_wolf_forced`, `XB2 (FL): ya_forced`: these pin the cat's and the human's branch as empty;
    I filled them where she is plainly there (Task 3.2, "you may write it"). If the owner would rather keep them empty, set the
    branches back to `''`; nothing else depends on them.
  - `tests/tools.test.mjs` E1 / LR: the lint snapshot is no longer current (expected; `--save` with the push).

## Task 1 (OT): per scene, what changed and why
- `spyFight` intro: he sets the rice cake down on its leaf before drawing; "Of course he does." gone (it was used twice).
- `wolfFight` intro: **continuity**: the wolves only come when there is no palisade, so "over the gap in the stakes" became "out of
  the barley and over the chalk line"; the tic "the way wolves do" gone.
- `yaBrawl` intro: same beat (low, laughing, a dog choosing a friend), without "the way a".
- `OPENING.fought`: "the morning after the morning" → "the morning after" (the tribute was Day 7, this is Day 8); tighter.
- `OPENING.bluff`: "a young man in" (a favourite phrase) → "a youth in"; Yuki's reply fits all three forms (see YF).
- `OPENING.paid`: "a bowl of gruel and a cat" → "and Yuki" (all forms); "looks at you for a long time" → until the gruel is cold.
- `OPENING.lost`: "waiting downstairs" → "outside the door" (true whether or not the loft burned).
- `LETTER.fought`: the letter itself kept; Old Wen's frame tightened.
- `LETTER.bluff`: "the Senior" four times → once in the letter (the lint's tic); the rest kept.
- `LETTER.paid`: "a single breath" (favourite) → "the length of one breath"; "on the twenty-first day" → "on the twenty-first".
- `LETTER.lost`: **continuity**: Old Hu's "Ten days sooner than the year" was wrong arithmetic (a year became thirteen days) →
  "Thirteen days, where we had a year".
- `fo_leave_offer`: Old Wen squares the tube with one finger; same speech, same two Mei Lin endings.
- `fo_envoy` results: four lines reworded; the envoy still notices the coat; "Patient … never lost a duel … never needed to hurry
  one" kept word for word (it is repeated in `fo_elder_named`).
- `fo_lu_han` result: he stops for three breaths with his back to you (no "After a moment").
- `fo_elder_named`: "On the twenty-first day" → "In thirteen days" (the phrase was in four scenes); **continuity**: Old Wen's "To
  us, that is not a mystery" → "To them" (he is a mortal and senses nothing; it is the cultivators who are insulted); "past the
  Hollow" → "beyond the Hollow" (favourite phrase).
- `fo_palisade`: "Yesterday's stakes" → "The stakes already sung" (the card can run twice in a day); the last state now reads true
  at two stretches and at three ("Most of the line stands now").
- `fo_council` Day 8: same debate, tightened.
- `fo_drill`: same; Old Hu "declines to know that she exists".
- `fo_clinic`: "the order" three times → twice; "a bone needle" → "a lancet of bone".
- `fo_mei` Day 8: same beats. Day 9: same. Day 10: **continuity**: by the time this card can be played, `fo_mei_insists` has
  already happened that morning ("she's already packed", "Of course I'm coming"), so she is now packing "for the second time" and
  says "I'm *still* coming … If you have thought of a reason since this morning, keep it"; both choices still follow. One CW line.
- `fo_mei` result: the jade bracket line reworded ("+1 Jade bracket" kept).
- `fo_mother`: same speech; one CW line; "When the Elder comes" → "arrives" (favourite phrase). Results: **continuity**: "Lower
  than to the envoy" (there is an envoy only in the bluff ending) → "Lower than the Sect has ever had from her"; "looks at you for a
  long time" gone.
- `fo_spy`: "a young man in" → "a youth in"; "your threads translate as" dropped (the threads are instincts, never a voice; lore).
  Results reworded.
- `fo_spy_won`: the ledger's facts in other words than `fo_spy_fled`'s (the two shared 8 chunks); the second "Of course he does."
  → "The Sect trains them thoroughly."
- `fo_supper` results: both reworded.
- `fo_wolf`: the rest of the text reworded; "at the second hour" → "An hour past midnight" (the scene is set at 01:00).
- `fo_wolf` result: the wolves "go to find a village with worse manners".
- `fo_wolf_won`: light touch (the text promises nothing about the rest of the night).
- `fo_morning`: both texts reworded; "Twelve days" (Day 9) checked.
- `ya_arrives`: the red scar under one eye added (lore.md); "her face goes" (favourite) gone.
- `ya_meets` result, `ya_challenge` and its two results: reworded; "something like hope" → "very nearly hope".
- `ya_talk`: same facts; "For the first time" gone; one CW line. Its three results reworded ("+Ya's wolf tooth" kept).
- `ya_share` and its three results: reworded; "a long, ringing silence" → "The silence that follows rings."
- `fo_ya_time` Day 9, Day 10 and results: reworded; **calendar**: "Tomorrow I take you to the tree" → "Tomorrow we start for the
  tree" (it is five days' walk).
- `fo_plan`: **continuity** with lore.md (the locals were told the Old Tree died of age; the founder came back with three hundred
  disciples and took the heart with his own hands): Old Wen's "walked in there with nine disciples. He walked out alone" → "The
  Sect teaches that it died of its years. My grandfather taught otherwise, and never loudly: that the founder … went in there with
  his disciples and came out carrying a heart of green fire in his own hands". Nothing later in the game refers to the nine.
- `fo_price` results: both reworded.
- `fo_mei_insists`: light touch; the knife, the red cloth, both hands, nobody cries.
- `fo_farewell`: same gifts; one CW line; the unfinished palisade line now reads true at 0 or 1 stretches ("still more chalk than
  stakes"; it said "half a line of white stakes").
- `fo_last_night` (both like him): reworded; "For a while", "after a long time" gone.

## Task 2 (SR): the lines by day
- `DR_FO_SING`: 1 "The stakes come up white and even, humming one note…" · 2 "Today's stretch meets yesterday's without a seam…" ·
  3 "The song comes easier now… A grandmother ties red thread round the last one…"
- `DR_FO_PITS`: 1 "Ugly pits, at the jackals' own angle…" · 2 the hunters dig without being shown · 3 faster than you can inspect.
- `DR_FO_PITS_F`: 1 stone under a foot of soil (mattock, wrists) · 2 an old field drain floods the pits · 3 the angles lean inward.
- `DR_FO_COUNCIL`: 1 the bows in order of age (reads true for the children or the tree) · 2 the oldest hunter's grandfather "would
  have wished to hear this" (the tree) · 3 the bows begin early; the woman with three grandchildren (Day 8's) gives the village's word.
- `DR_FO_LISTEN`: 1 approved for saying nothing, formally · 2 the cup is refilled · 3 Old Wen "very nearly nods".
- `DR_FO_DRILL`: 1 one animal, many spears · 2 the shields lock on the first call · 3 the line no longer needs you.
- `DR_FO_DRILL_F`: 1 the spear, the cousin · 2 "a dozen separate opinions" · 3 a spear grounded on a foot.
- `DR_FO_SPAR`: entry 1's great root-kin text fixed ("bows to the great beast, from a distance he has plainly measured").
  2: cat lands on the butt of Old Hu's spear / the great root-kin slows down for them / the woman fights with her hands in her
  sleeves and names who blinked. 3: you nearly catch the tail / you turn her charge once and she sits on you / four exchanges and
  the blade handed back hilt first.
- `DR_FO_CLINIC`: 1 the boy with the scythe cut goes last, on his own feet · 2 torn hands from the stakes · 3 the man the beam fell on.
- `DR_FO_BOY`: 1 the temple burning, Mei Lin very nearly smiles · 2 the old woman objects in full, then holds the child's head ·
  3 she has moved the youngest to the front herself; a boiled egg appears (CW 6).
- `DR_FO_BOY_F`: 1 it helps less than you wanted · 2 deeper than it looked · 3 the child too quiet, the old woman silent.
- **The third council** (`fo_council`, Day 10, about 150 words): the tea is hot water served as tea; the morning's map still on the
  table (`fo_plan`); the short business of who keeps what while he is away, eleven days on the tally (21 − 10); Old Hu asks why a
  man walks toward a dead tree while an Elder walks toward his door; Old Wen: "The council has heard my reasons. It will now hear
  the stranger's." Both of Day 9's choices follow from that.

## Task 3 (YF)
- `supper8`: cat steals a sliver nobody offered / the great root-kin, along the far wall, is served a whole smoked hare in the
  washing basin ("The mother pays her tolls promptly") / the woman is seated at the head by the mother's ruling, eats with
  chopsticks, and is offered a second before James is.
- `wolf_wake`: cat sets her claws in his collarbone, *barley* through the bond / the great root-kin takes his whole shoulder in her
  mouth, gently, and shakes him once, bond / the woman says his name aloud from the loft window, then "Barley."
- `ya_night`: cat goes out by the window / the great root-kin goes down the hatch without the ladder, the house shakes once / the
  woman says "I shall be at the stove" to the rafters and takes the spare blanket down the ladder.
- Reviewed, changed: `fo_council` Day 9: the great root-kin is "Your great beast" (Old Wen's own word for her in the prologue's
  `wen_lesson`); `DR_FO_SPAR` entry 1 (above). Filled empty branches: `fo_spy_fled` (cat: a smudge on his drawn shoulder labelled
  *pet?*; human: the facing page, *the lady: do not approach*), `fo_wolf_forced` (human: standing in the lane in black silk, the
  wolves counting again), `ya_forced` (human: "He has another cheek"). Left empty: the cat in `fo_wolf_forced`, `ya_forced` and
  `fo_wolf_lost`, and the human in `fo_wolf_lost` (nothing to add that the fight does not say).
- Reviewed, unchanged: `fo_spy_lost`, `ya_meets`, `ya_lost`, `yaBrawl`'s tail, `fo_last_night` (both switches), `fo_depart`.
- No switch, wording made to fit all three: `OPENING.bluff` (her reply "comes through the bond, so as not to disturb the
  kneeling", which a woman who can speak would also do there); `OPENING.paid` ("a bowl of gruel and Yuki"); `ya_talk`'s CW line
  ("the white one").

## Task 4 (continuity)
Fixed (listed above where they sit): the wolves and the palisade (`wolfFight` intro, the stomp posture and "hunters on the wall");
Old Hu's "Ten days sooner"; "To us" → "To them"; the mother's "the envoy"; `fo_mei` Day 10 after `fo_mei_insists`; Old Wen's legend
against lore.md; "at the second hour"; "Tomorrow I take you to the tree"; the palisade texts at 0 and 3 stretches; the stomp's
"educational afternoon" (Ya arrives in the morning) → "morning"; Ya's stomp posture said "No root. No Qi." (she can't sense Qi;
she smells) → "No rot. No fear. *Nothing*."
- The loft: `fo_night`'s line is now "The loft smells of mint and drying ginseng: this week's bundles, hung since the tribute, a
  row for each day."; `fo_mei_night`'s (the brief names `fo_last_night`; the line is in `fo_mei_night`) is "The loft smells of
  mint and dry hay, both of them newer than the beams." Both read true burned or not.
- The calendar, checked and right as they are: "Thirteen days" (Day 8: letter, `fo_elder_named`, `fo_mei`, `fo_night`), "Twelve"
  (Day 9: `fo_morning`, `fo_night`), "eleven days" (the new Day 10 council), "Ten days" (`fo_depart`, Day 11).
- James's look: only the coat (the envoy; the watcher's margin). Nothing added.

Found, not fixed (not in this part's files, or not listed and not a contradiction inside the Fallout):
- `act1_blackroot.js` `bl_start`: Ya says "Three days in, maybe four"; `fo_price` (line 665) says "Five days in, maybe six", and the
  act's own calendar (Day 11 to the Heart on Day 16) agrees with five. `bl_start` should change, in the Blackroot part.
- `fo_price` (line 659): on Day 10 it finds Ya "asleep on the shrine roof … like a lizard" (or practising the disarm), while the
  hub's Day 10 line has her honing her spear there; harmless (different hours), left.
- `fo_spy_won` and the stomp: the ledger has a note on Ya on Day 8, before she walks into Ashfall on Day 9. Kept as the story has
  it (she comes out twice a year; a wolf's skull and a question mark is what a watcher would know); say if it should be Day 9 only.
- Tics left in lines that are not listed (mine, so they stay unless the owner wants them changed): line 437 `fo_night` "Thirteen
  days is a long time"; line 530 `ya_meets` "the way a fox sounds" and "the way she probably looks at a deer"; line 560 `ya_won`
  and the stomp's `ya_brawl` win 2 "the way a ruler holds down a page"; line 711 `fo_last_night` "for a long time"; `yaBrawl`'s
  tail "the way she looked at you".
- `fo_wolf`'s first label "Drop out of the loft and meet them in the field." with the great root-kin: she is in the loft (as in
  the prologue's `village_night`), so it stands.

## Task 5 (ST)
- `sect_watcher` posture: he looks up, puts the rice cake down, senses nothing, "A mortal … No root. No Qi. No master." (he is
  Foundation and can sense that there is nothing); asides by degree reworded. `win[2]`: the sliver through the sleeve; he offers the
  sword hilt first (the fact from `fo_spy_won` that the old stomp text had dropped); the ledger's facts; sent home without the
  sword; he bows. `win[3]`: sword in three pieces, the belt, a cuff of bone; "Senior"; ledger; he offers the hilt, the form having
  nothing to say about blades in three pieces; released; bows; the threat and the trip. `one`: one sliver.
  "a bone needle" gone from all of it.
- `palisade_wolf` posture: on the chalk line "where a palisade is going to be" (there is none on this night). `win[2]`: a dart
  through the shoulder; "before the hunters have their headbands tied" (was "on the wall": there is no wall); the skulls outward;
  Old Hu moves them apart for more. `win[3]`: `${yuShort(g)}` kept in place; skulls inward, toward you; Old Hu turns them out and,
  alone, one back. `one`: "You throw once. The fight is reclassified as a burial detail."
- `ya_brawl` posture: by smell, not Qi; the stakes are salt and the coat; "morning". Its `win` and `one` unchanged.
- `yu(g)` / `yuShort(g)` untouched; no new "four hundred pounds".

## Task 6 (CW): six lines
1. `fo_supper` Day 9 (Ya's first supper), the mother: "Your bowl she fills past the line, informing the ladle that whoever salted
   her pot while she was at the shrine was not seen, and has improved it."
2. `fo_mother`, the mother: "You put your salt pork in her bowl while she was drawing on my table," she adds, to the pot. "Do not
   suppose the slivers go uncounted." (two short sentences of speech; cut the second if one is the limit).
3. `fo_farewell`, the boy from the clinic: he "hums as he hands it over: four bars of the low, strange music that plays from your
   arm, which the children have decided is a hymn."
4. `ya_talk`, Ya: "You gave the white one the best of the meat before you ate, three nights running. I watched."
5. `fo_mei` Day 10, Mei Lin: "And you are cooking. I have seen you look at my mother's pot like a man watching a child cross a
   river." (also the hook for the journey's cooking, the owner's first sentence).
6. `DR_FO_BOY` entry 3 (the clinic, third day), the old woman: "Afterwards a boiled egg appears at your elbow, unexplained."
No artist, title or lyric; no kitchen taken over; James answers none of them.

## Label suggestions (not applied)
- `fo_wolf`: "Drop out of the loft and meet them in the field." → "Go down and meet them in the field." (the great root-kin does
  not drop out of a loft window, and after the arson the loft may be a patch).
- `fo_wolf_forced`: "Then it's you." → "Then it's the hard way." (Yuki is there in two forms; the same change `arson_start` got
  in v0.11.169).
- `fo_clinic`: "Treat the boy first, and take the old woman's disapproval." → "Treat the youngest first, and take the old woman's
  disapproval." (the scythe boy is Day 8's; the SR lines for later days already say "the youngest").
- `fo_ya_time` Day 10: '"Thank you. Truly."' → '"Thank you. I mean that."' ("Truly" is not James's register).
- `fo_ashfall`: "Someone has been watching the village from the ridge. Go and see." → "Somebody has been watching Ashfall from the
  ridge. Go and see." ("the whole village" / "the village" is counted as a favourite phrase across scenes).

## RV1 fixes

Text inside strings only; no code, `${...}`, list length or label changed. All three files load.

### SD (M1, L12): the eight success lists, each text a first success on its day
- `DR_FO_SING` 2: "Today's stretch meets yesterday's without a seam. Old Hu sights down the row with one eye shut and finds nothing to straighten." → "The old bone lies sorted by length, ready. The stakes come up dead on the chalk; Old Hu sights down the row and finds nothing to straighten."
- `DR_FO_SING` 3: "The song comes easier now, and the stakes ring truer for it. A grandmother ties red thread…" → "The whole stretch comes up on one breath of song, and every stake rings true. A grandmother ties red thread round the last one, and nobody objects."
- `DR_FO_PITS` 2: "The hunters dig today's pits without being shown, and correct one another's angles by bowing…" → "You show the angle once. The hunters dig the rest of the stretch to it, and correct one another by bowing at the offending stake." ("without being shown" denied the card's own teaching.)
- `DR_FO_PITS` 3: "By now the pits go in faster than you can inspect them. You find one stake…" → "The jackals' angle turns out to be teachable. The pits go in faster than you can inspect them; one stake is a finger off true, and three men apologise for it."
- `DR_FO_COUNCIL` 3: "This time the bows begin before you have finished." → "The bows begin before you have finished." (rest kept)
- `DR_FO_LISTEN` 2: "You keep silent again, and follow more of it: who speaks…" → "You keep silent, and follow the form, if not the grandfathers: who speaks after whom, and why the bow comes before the objection. Old Wen has your cup refilled."
- `DR_FO_LISTEN` 3: "By now you can tell … and very nearly nods." → "Before the hour is out you can tell which way a matter will fall from who stands first. Old Wen catches you at it, and almost nods." (also L9)
- `DR_FO_DRILL` 2: "The shields lock on the first call today, and stay locked when you walk into them." → "The shields lock on the call, and stay locked when you walk into them, twice." (rest kept)
- `DR_FO_DRILL` 3: "You stop calling the changes … It no longer needs you, which was the point." → "Halfway through you stop calling the changes, and the line makes them anyway, to a count Old Hu taps on his spear. It will not need you tomorrow, which is the point." (Day 10: he leaves at dawn.)
- `DR_FO_SPAR` 3, great root-kin: "Today you turn her charge instead of leaving its path." → "You turn her charge instead of leaving its path." (rest kept)
- `DR_FO_BOY` 2: "You take the youngest first again. The old woman lodges her objection in full, and then holds…" → "You take the youngest first. The old woman lodges her objection in full, standing, and then holds the child's head steady while you stitch."
- `DR_FO_BOY` 3: "Nobody objects today: the old woman has moved the youngest to the front herself, and calls it her own order. Afterwards a boiled egg…" → "The youngest goes first. The old woman turns her back on the sight, formally, for as long as the stitching takes. Afterwards a boiled egg appears at your elbow, unexplained." (she disapproves, as the label says; the CW egg kept.)
- Read and left as they are (true as a first success on their day): `DR_FO_SING` 1, `DR_FO_PITS` 1, `DR_FO_COUNCIL` 1 and 2, `DR_FO_LISTEN` 1, `DR_FO_DRILL` 1, `DR_FO_SPAR` 1, 2 (all forms) and 3 cat, `DR_FO_CLINIC` 1–3 (2: hands torn on stakes others set; 3: the day's beam), `DR_FO_BOY` 1.

### P3D: ashfall.js, the second entries (Day 6, first success)
- `DR_CLINIC_J` 2: unchanged (nothing in it assumes an earlier day).
- `DR_CLINIC` 2: "The lancet is quicker now, and the water never comes off the boil." → "The water never comes off the boil, and the lancet keeps pace with it." (rest kept)
- `DR_HOOKS` 2: "Finer work today: needles…" → "Fine work: needles…" (rest kept)
- `DR_DRILL` 2: "The wall closes before you call it." → "By the last pass the wall closes on the call." (rest kept)
- `DR_SPAR` 2 cat: "Today your man lasts twice as long, and says so. The one who drew Yuki reports, with pride, that this time he saw her. Once." → "Your man lasts longer than he expected to, and says so. The one who drew Yuki reports, with pride, that he saw her. Once."
- `DR_SPAR` 2 great root-kin: "Today your man lasts twice as long." → "Your man lasts long enough to be proud of it." (rest kept)
- `DR_SPAR` 2 human: "Today your man lasts twice as long. Yuki fights hers one-handed and tells him, aloud, that his feet have improved." → "Your man makes you work for it. Yuki fights hers one-handed and tells him, aloud, that his feet are sound." (rest kept)

### CT (M2): `fo_council`, Day 10
- "Who finishes the palisade." → "Who answers for the palisade line." (true at any count of stretches)
- "The council has heard my reasons. It will now hear the stranger's." → "The council has heard my reasons. The stranger may add his own, or keep them." (the review's line; true with either card alone)

### ML (M3): `fo_mother`
- "You put your salt pork in her bowl while she was drawing on my table," she adds, to the pot. "Do not suppose the slivers go uncounted." → "It does not go uncounted," she adds, to the pot, "that the best of your bowl ends in hers whenever you suppose me busy with the fire." (one sentence of speech and its tag; no supper named, true from Day 8's morning. CW line 2 in the list above is now this.)

### PF (M4): `fo_farewell`, at two stretches or three
- "…two thirds done or better. The hunters swear on their ancestors to finish it before you are back." → "…two thirds done or better. The hunters swear on their ancestors that it will stand whole, and manned, when you are back." (no "to finish it"; "two thirds" kept for TG8.)

### LT
- L2, stomp `sect_watcher` win 2: "he offers you the sword in both hands, hilt first." → "he reaches for the sword with his free hand and holds it out to you, hilt first."
- L3, stomp `palisade_wolf` win 2: "It is over before the hunters have their headbands tied." → "It is over before the first shutter in the lane has opened."
- L4, `fo_night` Day 8: "…this week's bundles, hung since the tribute, a row for each day." → "…the first bundles hung since the tribute, in a row along the new-scrubbed beam."
- L5, `fo_mother`: "Lower than the Sect has ever had from her." → "Lower than the Sect has ever had from her of her own will."
- L6, `LETTER.bluff`: "And if I have other plans?" → "And if this one has other plans?"
- L7, Yuki's entry in the caught ledger (form-neutral; agrees with any of `fo_spy_fled`'s three): `fo_spy_won` adds "Yuki has an entry too; she reads it once and lets it stand."; stomp win 2 adds "Yuki is in it too, and lets her entry stand."; stomp win 3 adds "Yuki has a page, which she inspects and permits."
- L9, "very nearly" 5 → 2 in act1_fallout.js: `DR_FO_LISTEN` 3 "and almost nods"; `DR_FO_DRILL_F` 1 "and all but through a cousin" (a failure list: one word group only, key and length as they were); `ya_challenge` "what is in his face is close to hope". Left: `DR_FO_SPAR` 3 cat, `DR_FO_BOY` 1.
- L10, `DR_FO_SPAR` 3 human: "hands it back hilt first" → "hands it back across her sleeve".

### For Claude
- TG7's suggested `/without the (sword|hilt)/` and `/hilt/` still hold for both watcher wins; TG8's "two thirds" at 2 holds, and "to finish it" is gone from the `>= 2` branch (it remains, correctly, in the chalk branch).
- Not touched: L1 (`bl_start`, another file), L11 (a label), the stomp header comment's "very nearly".
