# Part 7 (the Return), the writers' notes: runs 1, 1b, 2 and 3 (Fable), word for word

# Part 7, run 1: the Return's scenes — Fable's notes

File edited: `/tmp/rw-p7/js/story/act1_return.js` only. No labels, ids, flags, conditions, gains or choice order changed (checked
mechanically against the copy I started from: every choice's label, `to`, time, check, `fly`, and the code of every `do` / `failDo` /
`combat` / `enter` with its strings blanked: 0 differences). The file loads; `grep TODO` prints nothing.

## Read this first (things Claude has to decide or follow up)
1. **The ford's bridge result line is NOT rewritten** (`rt_ford`, "A white bridge, ribbed like a spine. Mei Lin crosses it like a
   woman walking into a temple."). `prologue.js` line 1083 (`reword('rt_ford', …)`) swaps it for the stepping-stones line by exact
   string match; a new wording here would show the bridge line in Incremental Mode. My wording, if both are changed together:
   "A white bridge rises stone to stone, ribbed like a backbone. Mei Lin walks over it with temple manners, eyes down, feet careful."
   / "White stepping-stones rise between the black ones, ribbed like vertebrae. Mei Lin walks over them with temple manners, eyes
   down, feet careful."
2. **Result lines with a stat must not hold quoted speech** (tasks test B2, "a reply with a stat in it"): the camp supper line's CW is
   therefore reported speech, not a quote.
3. **Unlisted scenes that are mostly old prose.** The older-lines list skips every literal with one line touched since v0.11.69, but
   `git blame` shows the rest of these as the original WIP text: `rt_road`, `rt_camp`, `rt_fire_talk` (the game branch), `rt_arrive`,
   `rt_mother`, `rt_grove`, `rt_brawl_start`, `rt_brawl_lost`, `rt_serpent_lost`, `rt_evening`, `rt_quiet_night`, `rt_elder`,
   `rt_parley_fail`, `rt_duel_lost`, `rt_taken`, `a1_end`'s tail. By the brief ("not listed: yours, they stay") I only did the named
   fixes and tic fixes there (below). If the owner wants them rewritten too: open, a later run.
4. **Tests that pin texts I changed** (expected; they need their strings updated, nothing else): story/tools `CS1 (FW)` (the joke's
   result), `YB1 (LL)` (rt_brawl_lost / rt_parley_fail "the human's text unchanged": the task asked for the human branch), `YB1` /
   `CS1` rt_arrive as tiger ("four hundred pounds"), `FM1` rt_quiet_night ×3, `XS1 (XL)` the last "Not dead", `NQ1` rt_grove as
   human, `ER1 (R1a)` the loft-again opener; tasks `OM` "the first success" (the militia line). Not mine: tasks `OM`/`LT` (DRILL_AGAIN
   is now lists), `rt_camp:3` card ids (the new choice), the Heart's pins (run 1b).

## Per scene (old → new in the file; one line on what and why)
- `DRILL_AGAIN` (DR): nine lines, 19–25 words, one image each. hard: shields that lock without a rattle / the oldest hunter's one
  nod / the line swinging like a door. hardFail: two turn right with conviction / a gate with a stone in it / the apology that
  outlasts the drill. ya: stalking a goat / sniffing the line ("Less fear. More onion.") / hunting Ya on a roof.
- `DAY21_BREAKFAST`: prose only, "+20 satiety" kept ("Gruel, pickles, and nobody mentioning the road").
- Fight intros (`roadWolves`, `fordSerpent`, `brawl`, `elderFight` and its " Behind you, Ashfall is still standing."): new images
  (floodwater; the river lifting a neck, "Ya was right. It has a face."; Bao like a man about to move furniture; the red air that
  hangs like wet silk). Run 2: the stomp postures still quote the old intros.
- `rt_start` (OT, SD): tightened; hammerspace line rewritten; **SD** the seed against Mei Lin's heart, heard "through her" by his
  Convergence; the no-seed line. Result "Long. Hungry. Has a face."
- `rt_ya_talk` (Selene): "I'm thinking about Selene." / "She's asleep. Sleeping is boring. Think about me." Three results rewritten.
- `rt_mei_talk` (TY): "It sang for six hundred years … the world went bitter again"; grandmother's grandmother kept. Dropped "Last
  night" from "Ya kissed me. Last night. By the water." (last night was inside the tree; see Continuity 1).
- `rt_ambush`, `rt_ambush_forced`, `rt_wolves_won` (+ its haul line), `rt_wolves_lost`, `rt_ford`, `rt_ford_wake`,
  `rt_serpent_forced`, `rt_serpent_won`: OT, same beats; tics out ("the way water", "for a while", "the far bank … very far").
- `rt_camp`: its supper line (CW 1) and one added sentence (CW 2). The rest is unlisted and stays.
- `rt_selene` (SC): new, 442–447 words by form; full text below.
- `rt_fire_talk` (YC): the second branch tells Ya's childhood her way (wolf den, too small to remember, the hunter woman bitten and
  keeping her, words / spear / snares, the ape at the pass at twelve, fifteen years since); "Mei Lin, hearing all of it new, doesn't
  argue, to her credit" (James neutral: fits whether or not he heard it in the Blackroot). +25 words: the facts needed the room. The
  joke's result line rewritten ("like a lock giving way").
- `rt_watch`, `rt_dawn`: OT ("for a moment" ×2 out). `rt_watch`'s second result rewritten.
- `rt_arrive` (unlisted): only the tiger branch's "four hundred pounds of white cat" → "white, long as a handcart" (the lint's
  favourite phrase).
- `rt_wen` (Selene): "Selene asleep in her hull of grown wood"; "for a long time" and "the first time he has" out; "built on a grave"
  kept word for word (`rt_trio` quotes it).
- `rt_mother` (FX, lint): "four days" → "nine days"; the third "the street says" → "I have listened to this street on the subject of
  you" (two left, the rhetorical pair).
- `rt_plant` (SZ, SD, Selene): "no longer than your hand" in both seed branches; **SD** Mei Lin takes it from her sleeve, "her
  fingers leave it last"; no seed: "a shard of Selene's hull, a thousand years old and warm yet".
- `rt_plant_sing`: "the thing you haven't done since the lab" → "what you have not done since you left home"; "For a long moment
  nothing happens" → "Nothing. The street holds its breath with you." Both result lines rewritten.
- `rt_ashfall`: OT; the children now ring "the patch of earth you sang to" (true with the hull-shard too). Palisade fail line.
- `rt_hunters` (+3 results), `rt_council` (+3 results), `rt_ya_village` (+ result), `rt_brawl_won`: OT. The militia line no longer
  says "By sunset" (the drill can end at any hour). "handsome but afraid" kept (DRILL_AGAIN quotes it).
- `rt_grove` (unlisted): the human's "sits down in her black dress" → "with her tail curled in her lap"; three result lines rewritten
  (the stat part of the sit line untouched).
- `rt_brawl_lost`, `rt_parley_fail` (FB): the human branches written (YF below). `rt_evening`: the supper line, CW 3, the human's
  "cat-shaped hole".
- `rt_trio`, `rt_trio_night`, `rt_ya_night`, `rt_mei_night`: OT at exactly their level, the fade unchanged (the `*` break, "The rest
  of the night belongs to the three of you."). `rt_trio`: "Mei Lin's" ×3 → ×2. `rt_mei_night`: the body (older by blame) rewritten;
  of the three openers only the middle one changed ("since the first time" → "That other night feels a hundred years gone.").
- `rt_quiet_night` (unlisted): only the first byForm, so it no longer repeats `loveLine`'s "You sleep by the stove with Yuki…"
  (the lint's a1_end~rt_quiet_night 12 shared chunks → 0).
- `rt_elder` (unlisted): two "for the first time" → "at last" / "Now … does change".
- `rt_parley` (Selene): "About Selene, more carefully still."; `rt_truth`, `rt_truth_won`, `rt_accord`, `rt_duel_won`: OT. "Lu Han,
  if he is there" → "If Lu Han is among the red robes behind him, he is the one who looks back" (the text has no `g`).
- `a1_end` (TY, FB): "for a thousand years" → "A sect that has been eating a world's heart for four centuries"; the three outcome
  lines and the grove paragraph rewritten; the last line by form (YF below).

## YF (what each form does)
- `rt_selene`: cat curled on his knee, one yellow eye on the moon, bond; great root-kin lying just outside the firelight "like a
  drift of snow", bond, her own joke; human straight-backed, tail across her lap, aloud. Mei Lin and Ya are never told what the bond
  said.
- `rt_brawl_lost`, human: "Yuki is neither in the trough nor on the roof. She stands where she stood, straightening one sleeve.
  'Fists only,' she says. 'Your rule. I kept it for you. You're welcome.'" (she fought beside him by the rule, and is untouched).
- `rt_parley_fail`, human: the two disciples on her side look at the ears; "'Further back,' she advises, and they have obeyed
  before they wonder why." (they place her by what they see).
- `rt_evening`, human: "with the place Yuki flattened in the leaves". `rt_grove`, human: tail in her lap.
- `rt_quiet_night`: on his chest / chin on his breastbone / back to back (fits yuki_path's beat "on your chest / head still on your
  chest / at your back").
- `a1_end`: the whole last line inside the same byForm: cat "on your chest … one **yellow** eye" (it said gold; the cat's eyes are
  yellow) and bond; great root-kin "her head on your chest … one gold eye", bond; human "Somewhere near, Yuki opens one gold eye.
  'Not dead,' she says into the dark." ("beside you" clashed with loveLine's "on the bench by the stove below"; neutral now).
- `rt_wolves_lost` ("Yuki somewhere in the thick of it, white and furious") fits all three, no switch.
- Reviewed, unchanged: `rt_road`, `rt_ford`'s result, `rt_serpent_lost`, `rt_camp`, `rt_fire_talk`, `rt_mother`, `rt_brawl_start`,
  `rt_elder`, `rt_taken`. **Not fixed:** `rt_duel_lost`'s human branch is '' (only the great root-kin gets "the other hand was for
  Yuki"); not in my sheet. Open, options later.

## CW (3 of 3)
1. `rt_camp`, the supper result line, Ya: "Ya's smoked meat, after you have been at it with wild garlic and a hot stone; Ya says it
   was already food, and holds out her hand for more: +20 satiety."
2. `rt_camp`, text, Mei Lin: "Your omnitool plays low, a woman singing over slow drums in no language of this world, and Mei Lin,
   who would deny it in council, has shifted a hand's width nearer."
3. `rt_evening`, the mother: "'Nine days in the Blackroot,' the old woman informs the pot, 'and my daughter comes home fatter than
   she left.'"

## Label suggestions (not applied)
- `rt_elder`: "…let him feel clean Qi for the first time in three hundred years." → "…let him breathe clean Qi, which he has not done
  in three hundred years." (the tic "the first time").
- `rt_ya_village`: "…formally, the way Ashfall likes it." → "…formally, as Ashfall likes it."
- `DRILL_AGAIN.hard[0]` (mine, stays by the sheet): "Cleaner than the first time." has the same tic; "Cleaner than this morning's."
  if wanted.

## Continuity, found and not fixed
1. `rt_mei_talk` "Ya kissed me. By the water." and `rt_mother` "The street says she kissed you at the river": no scene shows that
   kiss before the camp (`rt_fire_talk`, the night of Day 19, on the river bank), and the street could only have it from Ya herself.
2. `roadWolves` has three enemies; the intro (and Ya's "Three. Maybe four.") says four. Kept four (the stomp texts count four).
3. `rt_wen`: "riders on the switchbacks"; in `rt_elder` Shen Qiu arrives on foot with twelve disciples. Kept.
4. `rt_ambush`: "They smell the seed. Or you." is said also when no seed was taken ("Or you" covers it).
5. `rt_duel_won`: "the hand that holds the fan": no fan is shown before. `enter` adds a kill though he lives (code).
6. `a1_end`'s tail ("under the grove's song … you lie awake") also shows after `taken`, three days up the Sect's road.
7. `rt_ya_night`: he lies watching stars "through the white stems", which are knee-high on Day 20 (waist-high on Day 21).

## Checks
`node -e "import('./js/story/act1_return.js')…"` → loads; `grep -n TODO` → nothing. Text lint, the Return: favourite-phrase scenes
11 → 2, tics 2 → 0, reused 3 → 0, broken 1 → 0; a1_end~rt_quiet_night no longer listed. Five-word runs against the rest of
`/home/claude/bone-and-ash/js`: none left but canon ("no longer than your hand"), loveLine's "her head on your chest", and
`stomp_act1.js`'s Return entries (run 2's).

## `rt_selene`, the whole scene
```
The moon is coming up over the trees, and at your backs the dead tree stands black against the stars. Ya asked first, Mei Lin a breath behind her: who was she named for, the one asleep in there? So you tell them.

"A goddess. Older than my people's ships, older than nearly everything we have. Selene was the Moon. Not its keeper: the Moon herself, driving across the sky from dusk to dawn because that was her work."

"A woman with work," says Ya. "Go on."

"Once, on her way across, she looked down and saw a shepherd asleep on a mountainside. Endymion. Young, and very beautiful, which in these stories is always where the trouble starts. She loved him. And she knew what goddesses know about mortals: he would grow old and die, and she would not."

Mei Lin has stopped feeding the fire.

"So he was given a sleep with no end and no ageing. Some say she asked for it. Some say he chose it himself, offered any gift he liked. The tellings disagree, and everyone who could settle it is long dead. He sleeps on that mountain still, exactly as he was. And every night she comes down to him."

"Every night," Mei Lin says. "For ever." Both her hands are pressed to her collarbone. "That is the most romantic thing I have ever heard, and my mother would wash my ears out for it. A goddess. She *comes down*. To a shepherd." Her upbringing puts up a short fight and loses. "I should like to be looked at like that. Even asleep."

Ya has been frowning into the fire as she frowns at a trail. "No. Listen to what she does. He never wakes. He gives her nothing back, not a word, and the next night she is back anyway. And the next." She jabs a coal, hard. "Nobody thanks her. She doesn't stop. I like this one. She can hunt with me."

${byForm(g, 'Yuki, curled on your knee, has kept one yellow eye on the moon throughout. *He stays where he is put and never talks,* says the bond. *The goddess had standards.*', 'Yuki lies just outside the firelight like a drift of snow, gold eyes on the moon. *A man who stays where he is put,* says the bond. *I have wanted one for years.*', 'Yuki sits straight-backed, tail laid across her lap, gold eyes on the moon. "He stays where he is put and never talks," she says. "The goddess had standards."')}

You look up. A different moon from hers, doing the same work. The deadpan, you notice, has gone off somewhere without you. "My people named one of our first seed-ships for her," you say. "Then we lost her, and nobody ever learned where. She was here. Asleep under a tree, a thousand years, and no one came down to her." The fire ticks. "Until this week."

Ya looks at the black shape behind you, then at the moon. "Late," she tells you. "But you came."
```


# Part 7, run 1b: notes (the Heart, now that she has a name)

Files: js/story/act1_heart.js, js/story/act1_common.js. Text only; no labels, ids, flags, conditions or code touched, except the
three 'NT TODO' placeholder strings (filled). act1_return.js not touched.

## 1. HN, `ship_wreck` (the hull's name)
Why: the name is now found in the log; the bow is the crushed third and the bark has closed over the rest, so he looks and can't
read it. "One of yours", Mei Lin's "You're crying", "I'm aware … This is a lot of data." and Ya's line unchanged. Still "the ship" /
"it" here (before the log). Scene: about 171 → 210 words (about +23%).

Old:
> There is a name on the hull, in the letters you were taught before you could walk.
>
> *PATIENT ROOT.*

New:
> A ship's name is grown into its bow, in the letters you were taught before you could walk, and you go looking for this one's.
> The bow is the crushed third. What the fall left of it, the bark has closed over. Under your fingers you find the foot of one
> letter, perhaps of two, and nothing you can read.

## 2. `ship_log` (the name, JR, AS). 216 → 310 words (+94)
- Wren's "of the seed-ship Patient Root" → "of Selene".
- JR: he staggers out of the memory right at the name (four sentences, plain text between the italics), then "Wren hasn't waited."
  takes him back in. Placed there because the name is the blow; held to the end it would sit under the planting of the Hearth.
- AS: the anomaly in a gardener's words (the stars wrong; space folded like a leaf closing), then her drive, the fall, here.
  "They don't know why" is gone (the task's replacement).
- Kept word for word: "Something died here, long before us. A lot of somethings." and "hard, and hungry, and short-lived. Short as
  we measure a life, at least; I have no other measure with me."; "They planted a Hearth."; forty souls, all gardeners, no weapon.
  "We can't mend the drive" → "her drive" (Wren says "she").

Old (full text):
> It doesn't play as a recording plays. It comes in like a memory that belongs to someone else, poured into you.
>
> *A woman's voice, tired and steady. Head Gardener Wren Aldous, of the seed-ship Patient Root, out of the Ninth Grove. Forty souls
> aboard, and every one a gardener: soil people, seed people. Not one of them has ever held a weapon.*
>
> *The drive failed. They don't know why. The fall went on and on. It ended here.*
>
> *"The Qi on this world is sick,"* she says. You can feel her hands, sore from the work. *"Something died here, long before us. A
> lot of somethings. It's in the air, the water, the soil, and the people here breathe it. It makes them hard, and hungry, and
> short-lived. Short as we measure a life, at least; I have no other measure with me. We can't mend the drive. So we'll do what we
> know."*
>
> *They planted a Hearth.*
>
> The memory shows it to you. Forty people on their knees in a black clearing, singing a seed into the ground. A green shoot. A
> sapling. And then, quicker than anything ought to grow, a tree: up and outward, with its roots going down and down into the
> poisoned earth, drinking it, turning it over, making it clean.

New (full text):
> It doesn't play as a recording plays. It comes in like a memory that belongs to someone else, poured into you.
>
> *A woman's voice, tired and steady. Head Gardener Wren Aldous, of Selene, out of the Ninth Grove. Forty souls aboard, and every
> one a gardener: soil people, seed people. Not one of them has ever held a weapon.*
>
> Selene.
>
> You come up out of the memory like a man out of cold water. Every child at home knows that name: one of your Earth's first
> seed-ships, sent to plant a new world and never heard from again. Nobody ever learned what became of her. She is taught as a
> question, and you are sitting on her bridge.
>
> Wren hasn't waited.
>
> *She was on course, and then the stars were wrong. Wren is a gardener and says it as one: space folded like a leaf closing,
> Selene in the crease, and opened on a sky nobody aboard could name. Then her drive failed. The fall went on and on. It ended
> here.*
>
> *"The Qi on this world is sick,"* she says. You can feel her hands, sore from the work. *"Something died here, long before us. A
> lot of somethings. It's in the air, the water, the soil, and the people here breathe it. It makes them hard, and hungry, and
> short-lived. Short as we measure a life, at least; I have no other measure with me. We can't mend her drive. So we'll do what we
> know."*
>
> *They planted a Hearth.*
>
> The memory shows it to you. Forty people on their knees in a black clearing, singing a seed into the ground. A green shoot. A
> sapling. And then, quicker than anything ought to grow, a tree: up and outward, with its roots going down and down into the
> poisoned earth, drinking it, turning it over, making it clean.

## 3. Selene after the log
- `ship_log2`, `ship_log3`: checked, no "the ship"; unchanged.
- `log_reaction` (rage result): "Faintly, the ship hums with you." → "Faintly, Selene hums with you." (her name).
- `log_comfort`, trio branch: "in the bridge of a dead ship, and it is the one night" → "on Selene's bridge, with her asleep all
  around you, and it is the one night" (asleep, not dead).
- `log_comfort`, fallback branch: "and the ship hums faintly to itself, the way the very old hum to themselves when they think
  nobody's listening." → "and Selene hums faintly to herself, as the very old do when they think nobody's listening." (her name;
  drops a "the way the").
- `heart_hub` where-line: "Below the ship, behind a door of grown bone, …" → "Below Selene, behind a door of grown bone, …".
- `guardian_approach`: "Below the ship, beyond the place where …" → "Below Selene, beyond the place where …".
- `heart_night`, night 1, before the log: "…you can almost hear forty gardeners breathing." → "…you can almost hear a crew
  breathing along with it." (he can't know the forty yet).
- NT night 1: "Somewhere under you Selene hums in her sleep, and if you listen hard enough you can almost hear forty gardeners
  breathing along with her."
- NT night 2: "Under the floor Selene holds her one low note, asleep and still in tune" (the template's ", and you fall asleep
  trying to work out the key." follows).
- NT night 3: "Below you Selene hums on, patient, like a house with one lamp left burning for somebody who is a thousand years
  late." ("a thousand years" is hers, allowed.)

## 4. Item notes (act1_common.js `ITEMS`)
- `seed_sliver`: "…from the seed-ship. It hums…" → "…from the Old Tree's heart-chamber. It hums…" (where it is really from).
- `hearth_log`: "The ship's record, grown into a knot of wood." → "A seed-ship's record, grown into a knot of wood." (true before
  and after the log).

## Found, not fixed (outside the named lines)
- act1_heart.js line 27 (Ya's ledge talk, `DR_HC_YA`'s list): "bark settling, ${g.flags.ship_found ? 'the ship' : 'water …'}" can
  play after the log. Needs a `log_heard` switch (code) or "Selene" there after the log; suggested text for that branch: 'Selene'.
- Labels (not touched): `heart_hub` "Go back to the ship's bridge. Hear the rest." only shows before the log: fine as it is.
- Tests that pin the old words and will fail until Claude updates them (tests/story.test.mjs): line 1010 (/Patient Root/ in
  `ship_log`), 1012 (the EARLY pattern names Patient Root; `ship_wreck` no longer has it), 1760 and 1780 ("and the ship hums"),
  2425 ("in the bridge of a dead ship").
- After the log the three women hear him name her only offstage; `rt_selene` (run 1) assumes they know the name. No line needed
  here, noted for the join.


# Part 7, run 2: the Return's stomp texts (ST) — Fable's notes

File edited: `/tmp/rw-p7/js/story/stomp_act1.js` only, and in it only the entries `rt_wolves`, `rt_serpent`, `rt_brawl`, `elder`
(lines 382–515; lines 1–381 byte-identical to before, checked with diff). All 16 strings rewritten. Kept: every function's
signature, `pick(d, …)`'s three branches and their order, `${meiOn(g) ? … : ''}`, `${luHere(g) ? … : ''}`, `${yuShort(g)}`
(each once, as before). `yu`, `yuShort` untouched. No labels, no commit, nothing in /home/claude/bone-and-ash.

## Read this first (for Claude to decide or follow up)
1. **The posture is the fight's intro at every degree, not only 2 and 3** (`power.js` `prepare`: `st?.posture ? st.posture(g, degree)
   … : enc.intro`). So run 1's four new intros (`roadWolves`, `fordSerpent`, `brawl`, `elderFight` in act1_return.js) are never
   shown: these four fights always open with the posture, degree-1 branch of `pick` included. I wrote the postures to work as the
   intro of a real fight too, with fresh images (none quotes the old or the new intros). Open, options later: whether the intros
   should go, or degree 1 should show them.
2. **The Elder's " Behind you, Ashfall is still standing." is never shown either**: `prepare` keeps a tail only if the intro
   includes 'Ashfall does not kneel' (the old wording). Code, not mine. Open, options later.
3. **Lengths.** `rt_duel_won`'s facts (the needles, "And if I don't?", "You have that face", "time to think") were missing from the
   old stomp wins; putting them in takes room. Both Elder wins sit at the top of the band: 209 → 259 words (×1.24) and
   297 → 368 (×1.24). Everything else is within ±25% (the largest: brawl posture ×1.24, brawl win 2 ×1.24, brawl `one` 12 → 15).
4. **Left out because the wins have no `g`** (`win: { 2: () => …, 3: () => … }`, signatures kept): `rt_duel_won`'s two
   conditional lines ("Ya swears at you about it for an hour", "Lu Han does: once, at you…") and `rt_wolves_won`'s `both(g)`
   variant (Mei Lin "goes red to the ears", Ya watching her go). The stomp wins use the neutral branch. As before this run.
5. **`yuShort(g)` still prints "all four hundred pounds of her"** for the great root-kin in `rt_wolves` win 3 (the helper is not
   mine to change; none of my own words use the phrase).
6. **Tests:** `tests/story.test.mjs` fails the same tests with and without my edit (run 1's and run 1b's pins; none names these
   four entries). One line came and went over three runs, `TR1 (YB; DR2): rt_camp's last choice is Yuki's card`
   (failed on the old file, passed once and failed once on the new, same stomp file both times): not the stomp texts. The
   working copy's `act1_return.js` and `prologue.js` were also changed at 05:32:48, not by me (`installSelene`), which touches
   exactly that choice list; worth one look.

## Per entry (what changed and why)
- **`rt_wolves`**
  - posture: "Grey comes down through the birches: four ash-wolves, heads low, fanning out to take the path at both ends."
    (the old one was the old intro word for word, "the way water comes through a broken dam": a tic too). Mei Lin "says a word
    under her breath that she did not learn at home". pick: the sum of four wolves and two hands / "four wolves is a rest" /
    "quick learners". "A dead god" is gone (no need to call the Old Tree that the day after Selene).
  - win 2: he drops two before they choose who to eat, Ya spears the third, the fourth runs onto Mei Lin's knife (four, as run 1
    kept). Kept from `rt_wolves_won`: Ya on the biggest wolf, spear in its throat, howling; Mei Lin cleaning her knife, grave and
    pleased; "You are an animal" / "Very attractive … all day"; Mei Lin leaves fast; James thinks of nothing.
  - win 3: the wolves lie down; Ya has to insult one onto its feet to get her fight (so the haul's skinned wolf is still true);
    Mei Lin wipes a clean knife; three wolves trail after her "hopeful as dogs at a kitchen door".
  - one: "Yuki looks at the wolves. The wolves look past her at you, and lie down. Ya takes it personally."
- **`rt_serpent`**
  - posture: a head "as long as a coffin", "the face Ya promised" (she said so in `rt_start`), "as a cook studies a fish". pick:
    knee-deep in its house / "Three weeks ago that would have worried you" (Day 19) / wet boots.
  - win 2: two misses, then it meets the blade; it sinks with the blade in its eye, the river lies "innocent as a pond"; Ya to
    her waist, the core (plum-sized, "murky", as the item is called), the mouse on the doorstep, the three lines of talk.
  - win 3: the bridge's first pier pins the neck "like a thumb on a worm"; everybody crosses; Ya gets the core it coughed up;
    "you built a *bridge* on a *snake*". Mei Lin crosses "with her eyes lowered, as in a temple" (her beat from the ford).
  - one: "…and set its first pier on the serpent. The serpent reconsiders its day."
- **`rt_brawl`** (fists only; meant to be fun)
  - posture: Bao sets his feet; the cousins at each elbow. Bao is a mortal hunter and cannot sense Qi, so he no longer says "You
    have no root, outlander, and no Qi" on his own authority: "the Sect's people looked for Qi in you and found none". "A witch's
    cat" → "a white shadow" (YF). "a great deal of luck" → "more luck than is decent" (tic). pick: the rule read twice / "a third
    of each fist" / "so very gentle". "A bad evening" is gone (the brawl can be at any hour of Day 20).
  - win 2: Bao's nine swings he cannot account for; one cousin studying the sky, one the bench. Kept from `rt_brawl_won`: the
    split lip, the jacket, the hunter's bow for a boar that died well, Ya's bad bow back, "stand on my left" and its answer, the
    grin. Kept from the old stomp: the second, deeper bow to James.
  - win 3: four seconds, nobody hit, three men in a row in the dust. **Added back, a fact of the scene the old text had dropped:**
    Bao's hunter's bow to Ya and her bad bow in return (then he kneels to James). The split lip is Ya's, from `rt_brawl_start`
    ("Ya has already hit him"). "This one had no eyes" (a sect disciple's formula, and `sect_watcher`'s line in this file) → a
    hunter's: "I took a boar for a piglet … My cousins also took it for a piglet." "It was not fun" kept; the well; "Him in front."
  - one: "Four seconds. Three grown hunters sit cross-legged in the dust, trying to recall sitting down."
- **`elder`**
  - posture: no sword, "nothing here merits steel"; **a closed red-lacquer fan in his left hand, the right left empty** (see
    Continuity 1); "Three hundred years, and you are the one thing in them I cannot feel. Such a thing is a mortal, or it is an
    error. The Crimson Lotus corrects both, and hates neither." "Kneel, and I will make it quick" → "Kneel now, outlander, and you
    will reach the Sect Master's gate still able to walk" (he wants James alive: `rt_parley_fail`, `rt_duel_lost`). Lu Han "keeps a
    hand on his sword" (when `luHere`, he is in the fight). The red air: "slow and thick, and the sweet rot of it reaches you
    ahead of the weight" (run 1's intro has the wet silk; `rt_elder` has "heavy, sweet, rotten"). No "No root. No Qi." list (the
    lint's favourite phrase "nothing no root").
  - win 2: he takes the Elder's footing, reach and breath "until the cupboard is bare". Now with every fact of `rt_duel_won`: one
    knee, the wraithbone blade, the crown in the dust, blood in his beard (a lip bitten through: the title is "The Elder Bleeds",
    and the old text said "You never draw blood"), "Kill me…", **"And if I don't?"** (the old text had "I don't kill people" here),
    "Then I go home in disgrace…", "I think you will let me live. You have that face.", the three needles and the fourth, "He
    will cultivate again. Not this season.", "I find it gives them time to think.", carried off, never looks back, the war nobody
    names, Old Wen's steady hands. Shen Qiu's own sentences are word for word the scene's.
  - win 3: the wave is "kettle steam"; the strike stops short of his chest; Shen Qiu **works it out from the evidence** ("he has
    been sounding the sea with a walking stick, and calling it dry": he still cannot sense James; the old text had him "feeling
    for your power"). "Late for lunch", two fingers, he sits, bites his tongue (the blood), the crown rolls, he gets as far as one
    knee against the blade. Then the same facts as win 2. The old bone bindings on wrists and ankles and "cannot stand properly
    for about a season" → the scene's needles, "each measured to the day". Kept: the scream down the road ("pull the sky down"),
    the sparrow ("lands on him and is not corrected"; the crown is in the dust now, so not on the crown), Old Wen's one laugh
    ("for the first time in forty years", a tic → "a sound nobody under forty here has heard him make"). Dropped: "I just make
    them wish I had" and handing the crown back (room, and the scene's line is the better one).
  - one: "Two fingers on the Elder's breastbone. Three hundred years of cultivation sit down in the road, hard."

## YF (every line about Yuki fits a cat, the great root-kin and a woman)
- `rt_wolves` win 3: "${yuShort(g)} is in the path ahead of you before the last wolf has finished arriving. She does nothing. She
  regards them." No stepping, no size, no speech: the cat is off his shoulder and in the path, the great root-kin is simply
  there, the woman stands. The wolves lie down for what stands behind her as much as for her.
- `rt_wolves` one: "Yuki looks at the wolves." (all three).
- `rt_serpent` win 3: "Yuki stops at the middle of the span to look down at what is under it, at her leisure." (all three).
- `rt_brawl` posture: Bao's "a white shadow" for her (was "a witch's cat"). The brawl's own `tail` (act1_return.js) still places
  her by form after the posture: on the bench, or on James's left as a woman.
- `elder`: no Yuki line (none before).

## Selene, years
No "the ship" in the four entries (there was none). Shen Qiu three hundred years (posture, both wins, `one`). The Sect's age is
not mentioned. No "a thousand years".

## CW
None, as the sheet says.

## Label suggestions
None (the entries have no labels).

## Continuity, found and not fixed (or fixed here: say so)
1. **The fan** (run 1's note 5: "`rt_duel_won`: the hand that holds the fan: no fan is shown before"): the posture now shows it,
   closed, in his left hand, and since the posture is always the intro (above), the fan is always seen before the needles. It is
   a new prop in the posture, not a new fact of the story; say if it should go.
2. `roadWolves` has three enemies; the texts count four (run 1's note 2). Kept four. The third enemy's name gave win 3 its
   "grey-muzzled leader".
3. `brawl` has two enemies (Bao and one cousin); the texts, the label ("two against three") and the tail say two cousins. Kept.
4. `rt_duel_won`'s `enter` adds a kill though Shen Qiu lives (run 1's note 5; code).
5. "Late for lunch" at the hour of the snake (mid-morning), from the old text: kept as the joke it is.
6. At degree 3 the serpent is alive under the bridge when they camp on the far bank ("It stays there" before; now it only
   "reconsiders its day"): harmless, as before.

## Checks
- `cd /tmp/rw-p7 && node -e "import('./js/story/stomp_act1.js').then(()=>console.log('loads'))"` → loads. `grep -n TODO` → nothing.
- Rendered all 4 entries × 3 forms × (posture at degrees 1–3, win 2, win 3, one): no `${`, no "undefined"; the three postures
  of each entry differ; none of the brief's tics in my words (only `yuShort`'s "four hundred pounds", as said).
- Five-word runs against `/home/claude/bone-and-ash/js` (the Return's scenes and these entries' old text left out): none left
  but `yuShort`'s. Against run 1's `act1_return.js` the wins share what they must: the scenes' spoken lines and facts.

# Run 3: the rest of the Return's old text, the last Selene line, and the continuity fixes (CA1, 05:42) — Fable's notes

Files edited in /tmp/rw-p7/js/story: `act1_return.js` (58 lines), `stomp_act1.js` (5 lines, all in `rt_wolves`, for C2),
`act1_heart.js` (1 string, YL), `prologue.js` (the `reword('rt_ford', …)` pair only). No labels (all 84 label strings compared:
identical), no code, the same 116 `${` in act1_return.js before and after. Changed lines: 2,895 → 3,050 words (×1.05). No commit,
nothing in /home/claude/bone-and-ash.

## Read this first (for Claude)
1. **Tests that pin texts this run changed** (story.test.mjs: 34 failures before my edits, 51 after; the 17 new ones are all
   word-for-word pins of the strings below, nothing else): `CB1` / `CB1 (T)` rt_fire_talk and rt_mother (×8), `CS1` rt_fire_talk
   (×3), `ER1 (GF)` "the old save at Mei Lin 65 keeps 'Ya kissed me'" (C1: that line no longer names a kiss), `FM1` rt_elder (×3),
   `NQ1` rt_serpent_lost as human, `YB1 (LL)` rt_duel_lost "the cat's and the human's texts unchanged" (DL: the human branch is
   written now). Already failing, text now different again: `CS1` / `YB1` rt_arrive as tiger, `FM1` rt_quiet_night ×3, `NQ1`
   rt_grove as human. `CS1 (FW)`: "according to ${byForm(…)}" is kept in the game branch as before.
2. **`rt_parley_fail` is also where a failed `rt_truth` lands**, so its opening no longer says he "listens to all of it" (in the
   grove James sang, he didn't talk): "Shen Qiu lets you finish, with flawless courtesy." fits both.
3. **Nested strings.** The UL list counts only each literal's own prose; the conditional strings inside were also the original
   text, so I rewrote those too (listed per scene). Kept as they were: every byForm branch that was mine already (rt_arrive,
   rt_mother's human clause, rt_fire_talk's human clauses, rt_grove, rt_brawl_start, rt_brawl_lost, rt_parley_fail, rt_duel_lost's
   great root-kin, rt_quiet_night's first), the short placing byForms (rt_road "supervises", rt_serpent_lost, rt_elder / rt_taken
   "on your shoulder / at your side / at your elbow", rt_taken's "You may bring the cat / beast / root-kin"), and
   rt_quiet_night's last byForm (all three fit their bodies).
4. Open, options later: `yuShort`'s "all four hundred pounds of her" (run 2's note 5); the brawl's two enemies against "two
   cousins" (run 2's Continuity 3).

## UL, per scene (the full new text is in the file; what changed and why)
- **`rt_road`**: "a theory of a path" → "an opinion about where a path might go, kept alive by deer, spite, and Ya herself, who has
  walked it since she was six"; "like it owes her money" → "like a landlord through a house in arrears". Mei Lin: "a forest is
  where herbs come from, not a place a woman runs through". Nested: "Twice Ya stops and waits for her. Twice Mei Lin fails to
  notice, with care. Ya notices the care, both times, and laughs." / "Ya does not wait for her. Mei Lin would sooner eat the moss
  than ask."
- **`rt_serpent_lost`**: "The serpent does not eat you. It throws you, and the river sees to the rest." A reed bed a bend
  downstream; Yuki "soaked through and radiating fury" ("incandescent with rage" out); Ya "laughing too hard to stand"; Mei Lin
  "goes over your ribs one at a time with grave, furious fingers, muttering words her mother would slap out of her".
- **`rt_fire_talk`, the game branch**: "Ya invents a game: each of you confesses the worst thing you ever did." The bear and the
  bet, the grant committee ("no crime at all, only sad"), Gao Feng and the herb slope, "nearly got me sold" kept. The kiss at its
  level: "leans across, takes Mei Lin's face between both hands and kisses her, slowly, in full firelight, with you three feet
  away." "a long, unreadable look" (a tic's cousin) → "Then her eyes come round to you and stay, and you can't read them."
- **`rt_arrive`**: "the way Ashfall receives" → "as it receives everything: silent, drawn up in a line, hands folded"; "in living
  memory" → "nobody now alive can name a party that…"; the grandmother "does it a second time to be sure"; Ya's "grin that amounts
  to a challenge"; "The street makes a note." Nested: "as weather" / "like a sum that has stopped adding up".
- **`rt_mother`**: nine days and the two "the street says" kept; C1 below. "for a very long time" → "At Ya she looks longest of
  all"; "She took me, technically" → "Strictly, she took me."; "a single look that could stop a charging boar" → "one look … of the
  kind that turns a charging boar"; "The silence stretches." → "Nobody breathes."; "You smell as if the forest had died on you."
- **`rt_grove`**: "It is up already." Knee-high kept (C7); "translucent" → "so thin that the daylight passes through"; "the first
  air on this world that has not tasted of something dead" → "of all the air you have breathed on this world, the only air with
  nothing dead in it" (the tic "the first"). Nested: "They hum." / "Hold your breath and you can hear them hum." The girl "holds
  her palm out flat above a leaf"; "The girl does not budge."
- **`rt_brawl_start`**: "Bao removes his jacket, folds it with care and passes it to a cousin. Even a brawl, it seems, has its
  ritual in Ashfall. Ya removes nothing. Ya has already hit him."
- **`rt_brawl_lost`**: "You finish in the horse trough. Ya finishes on the wine-shop roof: on purpose, she maintains."; "honour
  has been mended by the correct procedure"; Mei Lin "takes inventory"; "'One hour,' she says. 'I leave you alone for *one hour*.'"
- **`rt_quiet_night`**: "The grove comes in through the shutters, faint, a sound beneath the other sounds, like a tune from when
  you were small that you can no longer name." "Sleep mostly stays away. You run tomorrow through all nine threads, and all nine
  hand back one answer: *you don't know*." Nested: "…then a laugh, smothered fast. You file it under the day after tomorrow."
- **`rt_elder`** (label untouched; 345 → about 350 own words): every beat in order (the hour of the snake, on foot, twelve
  disciples, Lu Han or his absence, Gao Feng's litter, the crown, the robe and its one lotus, the air, the grass, the tribute
  post, the palisade / the hunters / the people who have not knelt, the grove, his two speeches, the Qi-sense, his face, the three
  behind James). His spoken lines kept nearly word for word ("I did not think I would see that" → "did not expect to see that").
  "old in the way mountains are old" → "old as mountains are old" (tic); "And it finds nothing. No root. No sea. No core." → "It
  comes back empty. There is no root in you for it to find, no sea, no core: a mortal in a strange coat." (the lint's favourite
  phrase). "the expression of a man who has spent three hundred years knowing…" → "three hundred years of knowing precisely what
  stands before him, and here stands the exception". **C5:** the fan (below). Nested: Lu Han "with a face like a pond iced over";
  Gao Feng "Last of all, in an open litter, his sword arm still strapped to his chest … He is here to watch. His lips never stop
  moving, the same few words round and round".
- **`rt_parley_fail`**: note 2 above; "His disciples string themselves out along the road." (not "fan out": the fan is in this
  scene's neighbourhood now); "the grove may stand: it is beautiful, and I respect that. Refuse, and I burn it, and the village
  with it, and take you regardless." "His hands fold into his sleeves" kept (the posture then slides the fan out of the sleeve).
- **`rt_duel_lost`**: "flat on your back in the road, with no memory of the fall"; "not even breathing hard, sleeves still folded"
  → "his breathing unhurried, the fan shut again" (C5); "still you cost me both hands"; "with what in another man would be
  approval" ("something close to" out); Mei Lin's "knife is out, and her face has no colour left in it"; "Ya strains, snarling, in
  the grip of ${Hunter Bao, of all people / three hunters}." DL below.
- **`rt_taken`**: "a sound you will carry for the rest of your life: no cry, no word, only forty houses drawing breath together";
  "to the exact depth courtesy requires"; "a look of perfect contempt"; the last line "faint under the wind, the grove is
  singing". Nested: the throuple line ("hands locked until the knuckles show white … before the whole Sect … the nearest disciple
  steps back"), the one-lover line ("and does not care who hears"), the no-lover line ("the bow owed to a man who will not be
  coming back … You suspect you have not seen the last of her").
- **`a1_end`, the closing paragraph (not taken)**: "There are nights when you lie awake listening, and beneath the grove's song you
  believe you catch a second one, far off and very thin: out in the deep Blackroot, under the dead tree, something answers."
  (Yuki's "Not dead. Asleep." answers it, as before.)

## DL, `rt_duel_lost`, the human branch (new)
"\n\nOne hand was for you. The other, you gather, was for Yuki: she is on one knee ten paces up the road, hair across her face,
ears flat. \"Both hands,\" she tells the dust, with precision. \"I counted.\"" (the same job as the great root-kin's: the second
hand was hers, and she is down but getting up; aloud, deadpan). The cat branch stays ''.

## YL, `DR_HC_YA`'s second text
'YL TODO' → 'Selene humming under the floor' ("bark settling, Selene humming under the floor, Mei Lin pretending to be asleep":
Ya names a sound, so what Selene does that can be heard; "asleep" would have doubled Mei Lin's).

## RB, the ford's bridge (the same words in both files)
- act1_return.js `rt_ford` and the pair's first string: "A white bridge rises stone to stone, ribbed like a backbone. Mei Lin walks
  over it with temple manners, eyes down, feet careful."
- the Incremental Mode twin: "White stepping-stones rise between the black ones, ribbed like vertebrae. Mei Lin walks over them with
  temple manners, eyes down, feet careful."
  (Checked: the two bridge strings are byte-identical; nothing else in prologue.js changed. Run 2's serpent win 3 has her cross
  "with her eyes lowered, as in a temple": the same beat.)

## The continuity fixes
- **C1.** `rt_mei_talk` (shown when `both(g)`): "Ya kissed me. By the water." … "I ought to be angry." → **"I keep looking at Ya."
  Her eyes stay on the path. "In Ashfall a woman caught looking at another woman so would be married to a goatherd in the next
  valley before the week was out. I ought to be ashamed." A pause. "I'm not. Explain that, mycologist."** No kiss named: true
  whether or not the player saw `trio_kiss` (the spring under the ridge, only at trio 2 and if he went looking), and it meets Ya's
  line in `rt_ya_talk` ("looks at me like a fire she wants to stand close to"). `rt_mother`: "The street says she kissed you at
  the river." → **"The street says the hand is the least of it. The street was not there, and has never let that hinder it." Ya
  opens her mouth, plainly to supply what the street lacks; one look from Mei Lin's mother, of the kind that turns a charging
  boar, shuts it again.** (rumour, and the mother knows it is rumour; Ya would gladly make it fact.)
- **C2, three wolves everywhere.** `rt_ambush`: "Three. Maybe four." → "Three."; `roadWolves`' intro "Four ash-wolves pour out" →
  "Three" (never shown, kept true). stomp `rt_wolves`: posture "three ash-wolves"; `pick`: "Three wolves, and you have two hands.
  You do the sum again." / "Three wolves. After the week you have had, three wolves is a rest." / "Three wolves. You hope, for
  their sake, that they are quick learners."; win 2: "You put one down before it has settled which of you to eat; Ya takes the
  second on her spear; and the third … runs straight onto Mei Lin's knife."; win 3: "The other two hold a brief and humiliating
  conference", and after Ya's fight "Two wolves trail after her". `rt_ambush_forced` (the lead wolf), `rt_wolves_won` (the biggest
  wolf; one skinned), `rt_wolves_lost` ("Two of them take you down together") count nothing wrong: unchanged.
- **C3.** `rt_wen`: "At dusk the hunters saw riders on the switchbacks. Sect colours. Only an Outer Elder travels with so many." →
  **"At dusk the hunters saw Sect colours on the switchbacks: a column on foot, a dozen and more. Only an Outer Elder walks with
  so many."** (twelve disciples and himself in `rt_elder`.)
- **C4.** `rt_ambush`: "They smell the seed. Or you. Everything in this forest that eats Qi will want what you carry." → **"They
  smell you, and whatever you brought out of that tree. Everything in this forest that eats Qi will want it."** (true with the
  seed, with Mei Lin carrying it, and with none.)
- **C5, the fan.** `rt_elder`: "his hands are folded into its sleeves, and from the left one shows the end of a closed fan of red
  lacquer". So: seen in his left sleeve on arrival → `rt_parley_fail` "His hands fold into his sleeves" → the posture "slides from
  his sleeve into his left hand; the right he leaves empty" → `rt_duel_won` three needles in the right arm, the fourth "through
  the tendon of the hand that holds the fan" (the left) → `rt_duel_lost` "the fan shut again". `rt_duel_won` itself unchanged.
- **C6, `a1_end` after being taken ('TK TODO')**: "Up here the grove is out of hearing. Some nights you lie awake and listen
  regardless, and from far below, deep in the Blackroot where the dead tree stands, something very faint answers what you were
  listening for." (38 words against the other branch's 37; he hears no grove, and what answers is the same one, so Yuki's "Not
  dead. Asleep." still lands.)
- **C7.** `rt_ya_night`: "watching the stars through the white stems" → "white leaves at her elbows and the whole sky of stars over
  her" (she lies among knee-high stems).

## Selene, years
No "the ship" in the Return or the stomp entries; Shen Qiu three hundred; no "a thousand years" outside Selene's hull.

## Checks
- The sheet's check: "loads"; `grep TODO` on act1_return.js and act1_heart.js: nothing.
- Rendered the 18 touched scenes × 3 forms × 3 flag sets (162): no `${`, no "undefined".
- None of the brief's tics in the changed lines. Five-word runs against /home/claude/bone-and-ash/js: 8 found, 5 reworded; the
  rest are plain connectives.


# Runs 4–10 (RV1 and the open items), Fable's notes, word for word

# Part 7, run 4: notes (the review's fixes, and the Heart's leftovers)

Files: js/story/act1_return.js, act1_heart.js, act1_common.js, stomp_act1.js in /tmp/rw-p7b. Text only: no labels, ids, flags,
conditions, gains, `${...}` code or entry counts touched. One helper string changed (`yuShort`'s great root-kin phrase, as asked).
All four files load; no TODO in them.

## A. The review's fixes

**M2 (Shen Qiu's arrival)**
- `rt_elder`: "at the hour of the snake" → "at the hour of the dragon" (07:00–09:00; the clock reads 08:00). The Fallout already
  uses "At the hour of the dragon" for the crimson rider (act1_fallout.js 100, 123): the Sect keeps its hours.
- stomp `sect_watcher` win 3 (line 42): "The Elder: north road, noon, four disciples." → "The Elder: north road, the morning, twelve disciples."
- **Also, not on the sheet:** the same entry's win 2 (line 31) had the same ledger: "Shen Qiu, by the north road, at noon, four
  disciples with him." → "Shen Qiu, by the north road, in the morning, twelve disciples with him." Left alone it would contradict
  line 42 and run 6's line. Say if it should go back.

**M3 (who carries the seed)**
- `ht_leave` last line: "In your hand, or near your heart, the seed sings all the way." → "And the seed, whoever has the carrying of
  it, sings every step of the way." (no "your hand" / "your heart": TG10 holds).
- `seed_sliver` note: "It hums against your palm like a second pulse." → "It hums like a second pulse against whoever carries it."
- Not fixed, not on the sheet: `heart_core_after` "You look down at the seed-sliver." also shows when Mei Lin has just taken it
  (act1_heart.js ~781). Suggested, text only: "You look at the seed-sliver."

**L1** `rt_quiet_night`, human: `*Stop thinking,* says the bond. *I am trying to sleep.*` → `"Stop thinking," she says, without
turning over. "I am trying to sleep."` (they lie back to back).

**L2** `rt_selene` against the camp:
- "Mei Lin has stopped feeding the fire." → "Mei Lin has gone quite still, her hands forgotten in her lap." (two lines on they are
  at her collarbone: she moves them.)
- "She jabs a coal, hard." → "She thumps the butt of her spear on the ground, once, hard."
- cat: "Yuki, curled on your knee, has kept one yellow eye on the moon throughout." → "Yuki has kept one yellow eye on the moon
  from the first word to the last." (no place: `rt_camp` has her in a lap.)
- great root-kin: "Yuki lies just outside the firelight like a drift of snow, gold eyes on the moon." → "Yuki has not stirred all
  through it, a drift of snow with gold eyes on the moon." (`rt_camp` lays her behind everyone; no firelight named.)
- Kept: "frowning into the fire" and "The fire ticks." (a banked fire is still a fire, and ticks). The human's beat unchanged.

**L3** the brawl is Bao and one cousin. Who is who, in every text now: the **elder** cousin minds the jacket, the **younger** fights.
- `brawlFight` tail (human): "Three against three. Better." → "Three against two. Better."
- `rt_brawl_start`: "…folds it with care and passes it to a cousin." → "…folds it with care and gives it to the elder cousin to
  mind; the younger steps to his elbow." Great root-kin: "Yuki looks at the wine-shop bench, and at the cousins sitting on it. She
  can wait. They are about to get up." → "Yuki looks at the wine-shop bench, which both cousins have now left, and steps up onto
  it. Ritual has its uses." (they are up already; the tail has her on the bench.) Scene 30 → 40 words: over ±25%, the fix needs it.
- `rt_brawl_won`: "Bao sits in the dust with a split lip and his dignity entire. In his own time he stands, puts his jacket back on,
  and bows to Ya:" → "…his dignity entire; the cousin beside him has kept rather less of his. In his own time Bao stands, takes his
  jacket back from the cousin who minded it, puts it on, and bows to Ya:"
- `rt_brawl_lost`: "Bao and his cousins depart with…" → "Bao collects his jacket from the cousin who minded it, and all three depart with…"
- stomp `rt_brawl` posture: "…and his cousins come off the bench to stand at each elbow." → "…apart. One cousin comes off the bench
  to stand at his elbow; the other has the jacket, and holds it like an office."
- stomp win 2 (not on the sheet, same count): "One cousin is studying the sky from flat on his back. The other has found an urgent
  interest in the bench." → "His cousin is studying the sky from flat on his back. The other one holds the jacket a little higher,
  in case it is next."
- stomp win 3: "You step, and step, and step once more, and Bao and both cousins are sitting in the dust in a tidy row, … none of
  them…" → "You step, and step again, and Bao and his cousin are sitting in the dust side by side, … neither of them…"; "The cousins,
  scarlet, kneel as well." → "…kneel as well, the elder holding the jacket clear of the dust."; "says the smaller cousin" → "says the
  younger cousin" (the one who was in it).
- stomp `one`: "Three grown hunters" → "Two grown hunters".
- `rt_ya_village` ("two cousins are rising from the bench") is right and untouched.

**L4** `ship_wreck`: "Under your fingers you find the foot of one letter, perhaps of two, and nothing you can read." → "From where
you stand you can see the foot of one letter below the bark's edge, perhaps of two, and nothing you can read." (the first touch is
`ship_touch`'s.)

**L5** `rt_start`: "Long way: safe, boring, four days." → "five days."

**L6** the drill lines:
- `hardFail` 2: "They knew it this morning, and will again…" → "They have known it before, and will again once their arms stop
  shaking." (the review's "an hour ago" can be untrue too: a practice may be the day's first.)
- `ya` 2: "'Closer than this morning,' Ya allows." → "'Closer than a villager should get,' Ya allows." ("last time" would presume an
  earlier stalk.)

**L7** `a1_end`, taken: "Some nights you lie awake and listen regardless, and from far below…" → "You lie awake and listen regardless;
and from far below…" (one night on a three-day road; still no grove heard: C6 holds).

**L9**
- `rt_mother`: "the street" 4 → 2. "The street was not there, and has never let that hinder it." → "It was not there, and…"; "I have
  listened to this street on the subject of you…" → "I have listened to Ashfall on the subject of you…". The two "The street says" stay.
- **`yuShort`**, great root-kin: 'Yuki, all four hundred pounds of her,' → **'Yuki, large, white and in no doubt,'**. Every use read:
  line 58 "…, sits on the lame one"; 199 "…, pins the last one down flat" (non-cat only); 204 "…, strolls over and takes possession
  of the heap"; 278 "…, gets up in your place and looks at the serpent" (followed by "a white cat that size": fits); 396 "…, is in
  the path ahead of you before the last wolf has finished arriving". A subject phrase before a verb in all five.

## B. The Heart's leftovers (18 strings)

| Line | Where | What changed |
|---|---|---|
| 14 | `HALL_WHEN` day 1, morning | "Morning. Grey light slides down the cracks, slow as water down a well wall." Kept "slides down the cracks": day 5's morning calls back to it. |
| 20 | `DR_HC_MEI` 1 | "She goes through her grandmother's songs about the Old Tree for you. Here and there a word is one of yours, a word from home, rubbed smooth by four centuries of mouths that never knew what it meant." |
| 33 | `DR_HC_LOG` 1 (three forms) | "You play the opening again: only Wren's voice, only the planting." + cat "Yuki purrs against your chest from her first word to her last." / great root-kin "Yuki's head is on your chest, and she purrs…" / human "Yuki leans on your shoulder and purrs, very quietly, …" (as before, by body). |
| 62 | `DR_SP_IN` 1 | "Ya gives the first half to drowning you and the second to making you less stiff. Then, briefly and to great effect, she drops every project but one, which is sitting closer." |
| 67 | `DR_SP_WASH` 1 | "Mei Lin washes next to you, eyes front, and informs the wall that you are a coward. She says it fondly enough." |
| 93 | `LOG_LOOK.cat` | "From your lap, Yuki looks up at you. Through the bond: *what do we do.*" (`ship_bridge` put her there; the test's pin still matches.) |
| 103 | `LOG_JUDGE.cat` | "Yuki installs herself between the three of you like a small white judge taking the bench, and through the bond, very primly: *about time.*" (pin still matches.) |
| 230 | `hall_listen` | Rewritten whole. **YF:** "Through the bond, very simply: *someone did this.*" stood after the byForm for all three; it is now inside each branch, and the woman says it aloud ("Someone did this," she says, very simply.). Same three entries. |
| 259 | `ring_forced` | "Your wall of bone comes up thin, and the grubs come through it as through wet paper." The two Yuki lines unchanged. |
| 275 | `ring_lost` | First sentence and the closing line ("The bugs can keep those rooms," …). Yuki's lines unchanged. |
| 342 | `roots_fall` | The fall and "*Alive*". Yuki's three lines unchanged. |
| 375 | `roots_lost` | "The husks close over you. The next thing you know is your own coat collar, and somebody hauling you up the shaft by it: …". "You both know it" → "Everybody here knows it" (three or four people are there). |
| 420 | `ship_bridge` | Rewritten whole; still "the ship" (before the log). "Every ship carries one." word for word. Ya "crouched like a cat" → "folded up there like a hunting bird" (there is a cat in the room). |
| 487 | `log_reaction` | The three outer lines ("For a while nobody on the bridge says a word.", Mei Lin's crying, "And what do you do."). Her "My father went up that road to be *honoured*." unchanged. |
| 507 | `log_comfort`, the trio | Rewritten at the same level; run 1b's "on Selene's bridge, with her asleep all around you" kept. |
| 539 | `log_comfort`, the last branch | Rewritten; "and Selene hums faintly to herself, as the very old do…" kept (run 1b's). |
| 679 | `guardian_half` | Rewritten; the four sung words and "*WHO COMES TO THE HEART.*" unchanged. "Not with your voice: with the Convergence" (`rt_plant` already says "Not aloud. With the Convergence"). |
| 804 | `ht_leave` | The tree, the one note, and M3's last line. "these four hundred years" → "for four centuries". |

No listed string was a fight `intro`: none skipped. Nothing lore.md quotes was in these strings. Selene's rule: `ship_bridge` and
`ship_wreck` say "the ship" (before the log); every edited line after it says Selene or she.

## C. Tests that pin the old words (for Claude)
- story.test.mjs 281–282: the exact first replies of `heart_spring:0` and `heart_spring:1` (both rewritten).
- 783: the watcher's wins must include 'noon' and 'four disciples' (now "the morning", "twelve disciples").
- 2028: `rt_quiet_night`'s human line by the bond (now aloud).
- 694 (a comment only): "four hundred pounds" only from yuShort: no longer true anywhere in the stomp file.
- Still matching: 1870–1871 (`LOG_LOOK`, `LOG_JUDGE`), 1203 (nine days).

## D. Seen, not changed
- `heart_core_after` "You look down at the seed-sliver" (under M3 above).
- act1_heart.js line 15 ("the light comes down the cracks") and line 30 ("For a long time") carry two of the brief's tics; neither
  is on the leftover list.
- Label idea only: none.

# Part 7, run 5: the prologue's leftovers (notes)

File edited: `/tmp/rw-p7b/js/story/prologue.js` only. Text only: no label, id, flag, condition, gain, `${...}` expression, byForm /
byDay entry count or `reword(...)` string changed. The file has the same 1,095 lines; 66 lines differ from the game's copy.

**Of the 40 listed strings: 33 rewritten, 7 skipped** (below). About 760 old words out, about 1,000 new words in; every string within
±25% of its old length.

## Skipped, and why
| Line | String | Why |
|---|---|---|
| 1081 | "A hedge of bone spikes between you and them, then…" | a `reword(...)` string (and a label) |
| 1084 | "A slab of bone between you and them, then down to…" | a `reword(...)` string (and a label) |
| 1085 | "Seal the fourth ring's doorway with a slab of bone…" | a `reword(...)` string (and a label) |
| 1085 | "A white wall, floor to ceiling. The chewing goes on…" | a `reword(...)` string (matched exactly) |
| 1085 | "A white slab, man-high, jammed into the doorway…" | a `reword(...)` string |
| 1050 | "Go back the way you came. (The calendar starts again…)" | a choice label |
| 1027 | "Realm: … → …. GU, Convergence Use, Yuki's Fight and Qi Use: at least T… L…" | a system line with no prose in it (`GAIN_LINES` `/^Realm: /` in `js/core/replies.js`) |

No fight `intro` was in the list.

## Kept inside rewritten strings, on purpose
- **lore.md's quoted words, word for word** (`arrival`): "just check one reading", "decided to have opinions", "the pocket of folded
  space your people grow into every citizen at birth", "the most expensive empty closet in two universes".
- **Mechanical parts of result lines:** "+1 Jade bracket fungus." (`forage`), "+1 Murky beast core" (`gao_dead`), "The calendar
  starts again where you left it: ${clockLabel(...)}." (the Long Forest's way back; `GAIN_BITS` matches its start), and
  `LF_FULL` still starts "The hammerspace is full" (`GAIN_LINES` matches that start).
- **Three short lines left as they were:** Mei Lin's "My mother is *sixty*, you overdressed rooster—" (`herb_girl`), her "*One.*"
  (`gao_lost`) and "— **End of the Prologue.** —" (`epilogue`). Also the words of Mei Lin's weather line in the tribulation (*the sky
  decides you're impure…*) and Yuki's *then let's go and find out who killed it.*: the frame around each is new.

## Per scene
- **`yukiMerElder`** (Old Wen, 3 strings): the same three findings, graver: "I am ninety, and I have met that only in the heirs of
  great sects"; shut meridians: "That cannot be done. It is being done in front of me."
- **`yukiMerLu`** (Lu Han, 2 strings): "no pill-smell about it. So would a sect's heir."; "a sealed jar, and nevertheless a full one."
- **`arrival`:** all five paragraphs rewritten; same facts in the same order (the doctorate three days old, the celebration, the lab,
  Yuki in the hood, the forest and the sky, the cat on his sternum, the denial, glasses, ouroboros, omnitool, the empty hammerspace).
- **`forage`** (fail line): "One piece comes away whole, and the rest of the shelf goes to crumbs."
- **`hunt_got`:** same three guesses, the dart behind the ear, the knife grown and dissolved, the teeth.
- **`night`** (first night): new opening; Yuki's clause now "a habit she saves for the times she thinks one of you needs it".
- **`night_attack_forced`:** the wall at knee height, the courteous jackals, no running. It still says "wall" (the Incremental
  Mode's own text at line 1082 says "hedge" and is not listed).
- **`jackals_fled`:** same beats; the "three of those things" joke turned round ("you are all four. Yuki … manages only three").
- **`herb_girl`:** rewritten throughout; Gao Feng's terms and the law unchanged in substance. **One fix:** the stray last sentence
  "Of the local kind, and of the kind that likes it." (it had drifted away from "A cultivator.") now sits where it belongs: "A
  cultivator, then. The local kind, and the kind that enjoys it." The scene ends "By his reckoning, you are scenery."
- **`gao_hand`:** same beats. Tic out: "the far side". His line is now "No beast grows that. No sect makes it. What *are* you?"
- **`gao_talked`:** same beats (the parking ticket, "a cry for help", the name and rank, the quarter-bow, blood, the tab).
- **`gao_fight_start`:** tic out: "the first time". Closing: "Each thing Gao Feng has decided is accurate. The list is merely
  incomplete."
- **`gao_fled`:** tic out: "a long time". His line is now "The Crimson Lotus shall hear of this, stranger."
- **`gao_lost`:** same beats; "Out of how many?" / "*One.*"
- **`gao_dead`** (result line): "(it was in Gao Feng's pouch, under the pills). The jade token stays with Mei Lin."
- **`village`** (first paragraph), **`village_hunt`:** same facts (forty houses, the well, the faceless god, the tribute post; the
  hollow, the tusks, the fist-sized core, the small car).
- **`boar_lost`:** see YF.
- **`tribute_dawn_talk`, `tribute_dawn_sleep`:** same beats. Tic out: "since the lab" ("Nothing on this world has felt as safe.").
- **`bluff_fail`** (the bluff's own text; the hairpin's text is not listed and stays): tic out: "the way a judge".
- **`collectors_lost`:** same beats and the same numbers ("Next season", the tribute doubles, "You have a year").
- **`epilogue`:** rewritten throughout; ends "Sure," you say. "I don't see how that could go wrong."
- **`breakthrough`:** the two Foundation recognitions and the later realms' fallback text ("Once more the loop closes, a rung further
  up.").
- **The Long Forest:** the fifth season line, `LF_FULL`, and the way back's first sentence.

## YF (her three forms)
- **`boar_lost`:** the cat's and the human's texts were the same string. Cat: James up the tree, the boar bored, a draw (she is not
  named, as before). **Human: now her own** (in the next tree, tail tucked up; she rules it a draw, aloud). The great root-kin's text
  is not listed and stays; it still opens "You end up up a tree".
- **`night`, `jackals_fled`, `gao_talked`, `gao_lost`, `tribute_dawn_talk`, `tribute_dawn_sleep`, `herb_girl`, `epilogue`:** the
  byForm entries are not listed and stay; the new text around them reads correctly with all three (checked each join).
- **`epilogue`:** Yuki answers through the bond in all three forms, as before (no switch there; a woman could say it aloud, but
  that needs code).
- **`arrival`:** cat only, and right: she is always the cat on Day 1.

## CW lines
None (not asked for in this run).

## Label suggestions
None.

## Continuity, found but not fixed
1. **`yukiMerElder` / `yukiMerLu` (lines 113–114) against lore.md:** Old Wen and Lu Han read how many of Yuki's meridians are open,
   while lore.md says locals can't sense James or Yuki at all, and line 716 itself says Lu Han's sense "reads no realm there either".
   The game's design since v0.9.6; left as it is.
2. **`collectors_lost`:** "the boy's mother" stands up for James even when he never treated the sick child; and Lu Han says "Next
   season" and then "You have a year". Both kept.
3. **Tics left in unlisted strings of the same scenes:** "four hundred pounds" (`jackals_lost`, `gao_lost`'s and `bluff_fail`'s
   great-root-kin entries), "a good deal" (`dawn`, `jackals_lost`), "a black dress" (`gao_talked`, `gao_fight_start`, `gao_lost`
   human entries), "It looks for a long time." (`breakthrough`).

## Checks
- `node -e "import('/tmp/rw-p7b/js/story/prologue.js')…"`: loads. `grep -n TODO`: nothing.
- Five-word runs: every new line checked against all of `js/`; the distinctive overlaps were reworded (the wilds' "The note is
  faint…", the Long Forest's "people grow their cities from", `yuki_path.js`'s "does only when she has decided"). What is left is
  ordinary phrasing ("in the middle of it", "he says at last").
- Tests, on two snapshots of the scratch copy (old prologue against new): `tests/tasks.test.mjs` and `tests/data.test.mjs` give
  identical results. `tests/story.test.mjs`: 63 failures before (other runs' pins), 100 after. **The 37 new ones all pin old
  wording** and need their strings updated, nothing else:
  - `CA1` rider 1 (1): expects "white jacket with a red sash" (now "white jacket, red sash")
  - `FM1` night (3), `FM1` epilogue (3)
  - `LP1 (FL)` boar_lost as cat and human (6), gao_fled as cat and human (6: "backs away with his lackey. "The Crimson Lotus")
  - `NQ1` gao_talked (3), `NR1` herb_girl (1), `YB1` herb_girl (3), `YB1` gao_fight_start (2), `YB1` bluff_fail (3)
  - `XB2 (HP)` the bluff's text (2: expects "^Lu Han watches your performance")
  - `XS1 (XL)` the epilogue's tail (3)
  - `ST4` (1: expects "The loop closes again, one rung higher. Core Formation.")

# Part 7, run 6: the Fallout's leftovers — Fable's notes

File edited: `/tmp/rw-p7b/js/story/act1_fallout.js` only. All 43 listed strings rewritten, plus M2. Checked mechanically against
the copy I started from (comments gone, every string blanked, `${…}` kept): **the code is identical**, 900 string pieces before and
after, 55 pieces changed (a listed literal is several pieces where it has `${…}` inside). No label, id, flag, condition, gain,
`${…}`, byForm/byDay entry count or choice order changed. The file loads; `grep TODO` prints nothing. No fight `intro` was in the
list, so nothing was skipped.

## Read this first (things Claude has to decide or follow up)
1. **M2 reaches three strings in this file, not one.** The task named the talk result (line 385). The same two facts stood in
   `fo_spy_won` ("Shen Qiu arrives by the north road. At noon. Four disciples with him.", line 394, not on the list, mine from part
   4) and in `fo_spy_fled` (line 410, on the list). All three now say the morning, the north road, twelve disciples; otherwise the
   three ways of getting the ledger would disagree with each other and with `rt_elder`. `fo_spy_won`: only those nine words changed.
   No "noon" and no "four disciples" is left in the file.
2. **Ya's parents (`ya_talk`), Continuity 4.** The old line had her mother as "a hunter who went in and didn't come out", which
   contradicts `talk_ya` (the hunter woman who found her in the wolf den was killed by the ape at the pass). Now: *Her mother was
   "a hunter. An ape got her." Her father was "maybe a wolf, I never asked."* Both fit `talk_ya`: she calls the hunter her mother
   there too, and the wolf joke now has the den under it.
3. **`fo_depart`: the white stakes.** "At the edge of the barley, where the white stakes end and the black trees begin" was false
   with no stretch of palisade built (`fo_farewell` says "more chalk than stakes" at 0–1). Now "Where the barley stops and the black
   trees start", true at every count.
4. **One unlisted string touched for consistency:** `DR_FO_SPAR`'s first entry, the great root-kin's branch. The cat's and the
   human's branches were on the list and all three open with the same sentence, so the great root-kin's opening sentence changed
   with them; its own tail ("from a distance he has plainly measured") is word for word.
5. **Tests that pin texts I changed** (expected; their strings need updating, nothing else). In `tests/story.test.mjs`:
   - `NC1` and `NC1 (RV2, TG)`, the table of first-day replies (lines 296 and 308): `fo_palisade:0:f` and `fo_council:0:f`.
   - `FM1` (line 1962) `ya_meets`: "flattens her ears and allows it" → "sets her ears back and lets it happen".
   - `NQ1` (line 2096) `fo_last_night`: "The north wind moves in the thatch. … and through the bond" → "Nothing stirs in the loft
     but the north wind, fingering the thatch. … and the bond carries you".
   - `NQ1` (line 2124), `NR1 (T)` (line 2222) `fo_drill`'s spar: "Afterwards Old Hu bows to …" → "Then Old Hu bows to …"; the
     human's "bows to Yuki. Only to Yuki." → "bows to Yuki, and to nobody else."
   - `NX2 (RV1, TG7)` (the stomp wins: "noon", "four disciples", and "four hundred pounds") fails from run 4's file, not mine.
   Kept on purpose so their pins hold: "Thirteen days, where we had a year"; "the best of the meat before you ate" (once);
   "Five days in, maybe six"; "Ten days to the Elder"; `"Your cat," Old Wen says, "faces north`; "Second council" (Day 9 only).
   One trap for later: the `NX2 (CW)` no-artist test matches `/Purple/i` anywhere in the file, so a bruise here can't be purple.
6. **Lint** (`node tools/textlint.mjs`, log only, with the other runs' files as they stood): Fallout tics 1 → 0 (`ya_meets` "like
   nothing" ×3 is now ×2), favourite-phrase scenes 5 → 4, scenes sharing a 5-word chunk 17 → 14, words 4,750 → about 4,900.
7. **Seen, not changed (not in my lines):** `fo_spy_lost`'s human branch still says "Yuki sits down beside you" (a listed tic; an
   unlisted string, and `NQ1` line 2104 pins it). A wording if wanted: "Yuki crouches by your head." Open, options later.

## Words kept on purpose
- Lore's quote "You're tall" (`ya_meets`), and the scene's title phrase "Nothing smells like nothing".
- `fo_envoy`: "He has never lost a duel. He has never needed to hurry one." word for word, since `fo_elder_named` repeats it; only
  the stage direction around it changed.
- Ya's "Do that again. Later. Somewhere with fewer goats." (`ya_won`): the stomp win repeats it.
- The mechanical parts of result lines: "+25 satiety", "+35 satiety", "+Ya's wolf tooth." Neither stat line holds quoted speech.

## Per string (what changed and why)
- `DR_PALISADE_F` 1 (line 13): stakes crumble at the first mallet tap, pine in the gaps, the silence says the rest. Its image now
  differs from the second text's (stakes that ring dull, Old Hu's bow).
- `DR_COUNCIL_F` 1 (17): "The words come out lame"; the bow "a finger's width short".
- `DR_FO_SPAR` 1 (44): YF. Cat: Old Hu bows to the cat. Great root-kin: as before, from a measured distance. Human: "to Yuki, and
  to nobody else" (James is left out, the same joke as "Only to Yuki").
- `OPENING.lost` (119): the boot-print, the eggs, the red thread, the year, the rider at the hour of the dragon; the last line now
  "the year turns out to have been an estimate". First paragraph stands alone.
- `LETTER.fought` (126): Old Wen "proofing the inscription for his own gravestone"; the letter's five facts in order (ninth month,
  the hand raised, the stranger's name, Shen Qiu on the twenty-first, weigh and sentence); the weeping hunter; thirteen days as
  mercy; James's line.
- `LETTER.bluff` (135): the scroll, the invitation to the Outer Court, the three bows (the canopy "having no choice"), the
  twenty-first day, the tea.
- `LETTER.paid` (144): opens "It is not bone" (it follows `OPENING.paid`'s hairpin line); grass at six, pills at twelve; the
  Outer Hall; "He will not ask as I am asking."
- `LETTER.lost` (151): the sky that gathered and left; "Heaven does not go away"; Old Hu's count; Heaven "lost its place".
- `fo_envoy` result (198): see above.
- `fo_ashfall` Day 8's morning, midday, late afternoon (236): the same three pictures, reworded; "Dusk." was not listed and stays.
- The communal pot (254): "ladled out wordlessly and handed over with a short bow".
- `fo_palisade` (264): the second paragraph; Qi, "and in a second coin as well".
- `fo_council` Day 9 (285): the children stay and why; the grandfathers' tale; Old Wen's line by form ("faces north in her sleep.
  As you do.").
- `fo_mei` Day 8 (335): she talks to the roots, so the branch after it ("She looks at you at last") still lands; Old Hu "calm
  enough that somebody ought to check him for a pulse"; "that Mei Lin".
- `fo_spy` talk result (385): M2 only.
- `fo_spy_lost` (402): three movements, the bow, the regret, the folded mat (Yuki's line needs it), the pine needles.
- `fo_spy_fled` (410): M2; the ledger in the dust; "does not bow".
- `fo_supper` Day 8 (421): the grace at double length; Mei Lin "losing an argument" with the tea line.
- `fo_wolf_forced` (464): the headbands kept (Yuki's branches answer them).
- `fo_wolf_won` (470): pelts, fat, both skulls on the chalk line looking outward; it no longer repeats the stomp win's wording.
- `fo_wolf_lost` (478): two grey backs carry the goat off (the great root-kin's line has one go round: still true); the owner's bow.
- `fo_morning` (500): the Convergence "hums along" (it only starts to sing in `fo_depart`, so the hum is the truer word here).
- `ya_meets` (527): YF as before (shoulder, hip, elbow; she "sets her ears back and lets it happen"); three nights, rot, "mine";
  Mei Lin behind James on the step.
- `ya_challenge` (543): the headband to the nephew; two answers, both out of his reach; "Four days I've been walking."
- `ya_forced` (559): the slap; "Forty houses draw one breath."
- `ya_won` (565) and `ya_lost` (577): the same facts, and the two no longer open or close alike.
- `ya_talk` (590): point 2 above; the tree's roots, warm, humming only while she sleeps, louder near James; the CW line kept.
- The guest-gift result (602): "as another woman might a jade bracelet".
- `ya_share` (608): Ya's dialogue kept close (it is the proposal); the narration around it new.
- `fo_ya_time` Day 9 (631) and Day 10 (638): the bowing wrestlers; the stone on the spear, the god's chiselled-off face, "For you."
- `fo_price` (670): five days in, maybe six; the wet wood, the burning birds; salt, iron, a fight every three days, next to him,
  and *she* comes.
- `fo_mei_insists` (685): the basket packed first; the mother's knife in red cloth, on both palms.
- The farewell supper's line (699): "Supper, as a send-off: fish, millet, the plum wine to its dregs."
- `fo_last_night`, all four (711, 716, 723, 726): the roof (three of them, Mei Lin's laugh), Mei Lin in the hay (level unchanged,
  the fade is the byForm line after it), Ya at the window (eyes "as in a fox's": `FO_YA_STAY` already has the animal's starlight),
  the quiet loft (YF lines unchanged; homesickness "for a home that you and she have never seen").
- `fo_ya_night` (756): exactly at its level (the kiss, the bite, the hay, the ladder, the mother's one cough), then the byForm
  fade; the morning grin.
- `fo_depart` (772): the bows like barley; Mei Lin's knife and basket; Ya "with all the patience of a dog on a rope"; point 3.

## YF
Every byForm inside my lines was read in all three forms and left as it was, except `DR_FO_SPAR` 1 (above). `ya_meets`,
`fo_council`, `fo_spy_lost`, `fo_spy_fled`, `fo_supper`, `fo_wolf_forced`, `fo_wolf_lost`, `ya_forced`, `ya_lost`, the four last
nights, `fo_ya_night` and `fo_depart` read true as a cat, a great root-kin and a woman with the new text round them.

## CW, labels
No new CW line (none asked in this run); the six of part 4 are untouched, each still once. No label suggestions.

# Part 7, run 7: the Wilds', Ashfall's and the Blackroot's leftovers — Fable's notes

Files edited: `/tmp/rw-p7b/js/story/wilds.js`, `ashfall.js`, `act1_blackroot.js` only. Text only: every edit is an exact swap of
prose inside a string; no label, id, flag, condition, gain, `${...}` expression, byForm/byDay entry count or choice order changed.
26 of the 27 listed strings rewritten (1 skipped, below). All three files load; `grep TODO` prints nothing.
Words in the changed lines, old → new: wilds 295 → 320, ashfall 981 → 1,077, blackroot 783 → 872 (whole lines counted, each within ±25%).

## Read this first (for Claude)
1. **Skipped: `bone_field`, "+1 Giant's bone-meal. Your bone stakes will be harder from now on."** (wilds 297). The whole line is
   mechanics: `js/core/replies.js` line 47 matches `/^Your bone stakes will be harder/` as a gain sentence, and `tests/tasks.test.mjs`
   2079 and 2231 pin it word for word ("the bone stakes line is all gain"). No prose left around it to rewrite.
2. **Three tests pin texts I changed** (expected, as in run 1: the pinned strings need updating, nothing else). `tests/story.test.mjs`
   276 (`supper:2`), 290 (`night_event:0`), 302 (`drill:1:f`): "NC1: the first day's reply … the old ones" and its "(RV2, TG)" rows
   by form. Those were the only failures on my scenes in a run of story.test.mjs in the shared copy (the other failures there are
   other runs' scenes; tasks.test.mjs did not finish in my time limit, so it is not checked by me).
3. **Kept word for word on purpose**, because tests or other texts lean on them:
   - `wen_lesson`: "it once sang, and the singing made the forest kind" (`dw_scout`'s inner line quotes it as Old Wen's story).
   - `mei_curious`: "Yuki, ${byForm…}, sends one very clear thought: *finally.*" (story.test 2386 pins it in all three forms).
   - `dw_scout`: the last line, "Yes," you say. "I think I came here in one." (the scene's point; six words).
   - `ya_fight_start`, `dw_hunt`, `wyrm_lost`: Ya's and Mei Lin's shortest lines ("Don't be clever. I hate clever.", "Good meat. Bad
     temper. Like me.", "I've only got so much thread", "I know I jumped. Shut up."): the thread line is a running gag
     (`CAMP_BOTH_MEI`), the others are her voice at its plainest.
4. **Not touched inside listed literals** (separate strings, not counted in the lists' word numbers): every `byForm(...)` branch
   (already mine, pinned by tests), `wyrm_lost`'s two `canFly` strings (pinned by story.test 2687), `spring_ya`'s three ending
   strings and `SPRING_BOTH_WAIT`, `dw_scout`'s lights line. No fight `intro` was in the lists, so nothing was skipped for STOMP.

## Per string (what changed and why)
### wilds.js
- `DR_MAP[0]` (night_event:0): the heart image kept, as one sentence with "still running"; "Mapped:" kept as the opener (entry 2 is "Mapped again:").
- `night_event` rain (day 1): rain, iron, the grey film, the sulking fire in the order entry 2 recalls; Yuki's verdict is now "your doing, and she had expected better".
- `night_event` crows (day 1): opens on the wings; the smell joke turned round (the smell explains the name); food, then eyes.
- `night_event` rats (day 1): two splashes as two short sentences; "heave out onto the bank"; Yuki's last line reads on from all three byForm branches.
- `night_event` gift (day 1): one opening line, "Two things wake you": the weight, then the blood (entry 2 still echoes it).
- `bone_field`: skipped (above).
### ashfall.js
- `DR_DISHES[0]` (supper:2): the mother washes, the list of three kept, "a measure of millet" (the "sack of millet" is Ya's in the Fallout); no quoted speech (a reply line).
- `DR_DRILL_SPAR_F[0]`: thrown, hauled up, the formal pardon; the sting moved into "Of the two, the pardon hurts more."
- `village_night` (Gao broken): Mei Lin, the token and how she got it in a first paragraph that stands alone; "beats … a pulse of its own"; her warning ends on "where to stand".
- `village_night` (Gao spared): pebbles, Gao in the lane, the full bow to a man at a window, the debt; "a great deal" (a tic) gone.
- `village_night`, the needle's result: white face, Lu Han wants him alive, running.
- `village_night`, the street's result: shutters, "his two friends" (three men, as the scene says), a hedge of pitchforks, the teeth.
- `arson_start`: two plain sentences before the byForm line.
- `arson_lost`: "You don't stop them." ("They get past you" also opens the Fallout's wolf loss); the loft, the year of herbs, the house barely saved; her silence.
- `herb_slopes` (the last day): double the cutting, no reason given, the father naming plants wrong.
- `herb_slopes`, "Answer her question": the same joke, his horror as its own beat; the herb-woman's stare.
- `wen_lesson` (the forest, day 1): the lesson's frame reworded, the pinned sentence kept; "He turns the good eye your way." before the byForm line.
- `far_hunt` deer (day 1): "bones like reeds"; the ten years kept.
- `far_lost`: the opening turned round (the one part of losing that matters); the lecture still runs into the byForm line and the result.
- `scout`: road, waystation, shrine with the red lotus, the fresh marks flagged by his threads.
### act1_blackroot.js
- `ya_fight_start`: Ya's accusation kept in her words; James's answer in the passive, which is drier; Mei Lin catches the spear "because her hands decide before she does"; the tail is now "like somebody holding a ticket for the front row" (fits all three forms).
- `wyrm_lost` (the tail after the two code strings): the stage directions only.
- `dw_hunt`: the fowl, the wake with no current; the quarrel tightened.
- `dw_scout`: shrine, carving, the shape, his childhood memory, Ya's and Mei Lin's lines. Before the log, so "seed-ship" is right.
- `hot_spring`: the pool, Ya in at once, Mei Lin scandalised and staying, the separate days, the bite line ("Anywhere it shows."); Yuki as the only grown-up (form-neutral).
- `spring_ya`: Ya's speech in shorter sentences; Mei Lin on the bank has heard. The level is unchanged.
- `mei_curious` (both): her confession with the same four facts (once only, the frog, both mouths, Ashfall's two words for it); "That wasn't a question. It was a report."

## YF (Yuki's forms)
No byForm branch needed a change. The sentences I rewrote around a switch read on from all three: rain ("lets you know, … that"),
rats ("finds this the best joke"), arson_start and arson_lost (the cat's branch is empty: the text closes without it), far_lost,
wen_lesson, ya_fight_start (the ticket). `hot_spring` and `mei_curious`'s Yuki lines name no body.

## CW
None added (leftovers; parts 1–3 have no CW yet). `mei_curious`'s music line is in the other branch and stays.

## Label ideas
None.

## Continuity, found and not fixed
- `herb_slopes`, the last day (vday 3): the choice "Answer her question. Honestly." is offered, but only the vday 2 text has her ask
  it ("Why are you here?"). The label and the `show` are code, so not mine to change. A text-only fix, if wanted, at the end of the
  first paragraph: "Once, without turning round, she asks again what you are doing up here." Open, options later.
- `dw_scout`: "I think I came here in one" against lore.md (he arrived through the lab's spatial seed chamber, not aboard a ship).
  It reads as the chamber being a seed too; kept as it was. For the owner to judge.
- `night_event` rats, day 2, the human branch: "a woman in a black dress" (a listed tic, in prose); it is a part-2 line, not in this list.
- `rr`/`dw` loss line (blackroot 622): "four hundred pounds" (a listed tic) in the great root-kin's line; not in this list, pinned by a test.

# Run 8 notes (old → new)

- `js/story/ashfall.js`
  - old: It needs no saying: should tomorrow go wrong, she will have no next season to cut in.
  - new: It needs no saying: should tomorrow go wrong, she will have no next season to cut in. Halfway along the terrace, with her back to you and the knife still working, she asks again what a man who needs none of this is doing up here.

- `js/story/ashfall.js`
  - old: eyes shut, like a small white guard dog in a black dress.'
  - new: eyes shut, like a white guard dog in a high black collar.'

- `js/story/act1_blackroot.js`
  - old: "Yes," you say. "I think I came here in one."
  - new: "Yes," you say. "Where I come from, we grow them."

- `js/story/act1_blackroot.js`
  - old: 'a cat in a black dress'
  - new: 'a cat on two legs'

- `js/story/wilds.js`
  - old: found a woman in a black dress looking back at them.
  - new: found a woman with white ears and a tail looking back at them.

- `js/story/longforest.js`
  - old: ears and tail, a black dress, sitting on a root
  - new: ears and tail, the black qipao, sitting on a root


Per item:
1. `herb_slopes`, last-day branch, first paragraph: one sentence added so the label "Answer her question. Honestly." has a question to answer (she asks again, back turned, knife working). Text only.
2. `dw_scout`: James no longer claims to have arrived in a seed-ship (lore.md "How he arrived": the lab's spatial seed chamber); he knows the shape because his people grow them. The paragraph above (banners, coins, the registry, the school trip) already carries "from home".
3. "black dress" tic, human branches only; entry counts and order unchanged: ashfall.js morning line (a high black collar), act1_blackroot.js (a cat on two legs), wilds.js rats (white ears and a tail), longforest.js form line (the black qipao).

Not fixed (outside my lines): `js/story/longforest.js` line 631, the first-change scene, still says "She is wearing a simple black dress that the bond, apparently, considered appropriate." and has the tic "for a long moment". lore.md: a long black high-collared qipao with red piping.

# Notes, run 9 (prologue.js: the human look and one weight number)

File: js/story/prologue.js. Four strings, prose only; no labels, ids, flags, conditions, `${...}` or byForm entry counts touched. File loads.

1. `gao_talked` (~425), human branch: "a cat-eared woman in a black dress at his elbow" → "a cat-eared woman in a black qipao at his elbow". Lore: her human look is the qipao.
2. `gao_fight_start` (~436), human branch: "alone but for a slight woman in a black dress." → "alone but for a slight woman in a high-collared qipao." The rest of the branch (the ears beneath an outer disciple's notice) unchanged.
3. Herb-bed rescue (~468), human branch: "Yuki lands on his back in a black dress, all nails," → "Yuki lands on his back, white tail lashing, all nails," (the tail instead of the dress, so the three spots don't all say "qipao").
4. `bluff_fail` (~733, the plain bluff), great root-kin branch: "as four hundred pounds of treasure gets to its feet beside you." → "as rather a lot of treasure gets to its feet beside you." No number; the joke (there is a great weight of "treasure" standing up) kept; the bond line after it unchanged.

## Seen, not changed (outside this sheet)
- `bluff_fail` ~731 (the hairpin variant), great root-kin: "as four hundred pounds of the true treasure gets to its feet beside you": the same listed tic, a different string from the one named. Suggested: "as rather more of the true treasure than he has priced gets to its feet beside you", or mirror item 4.
- ~356 great root-kin: "all four hundred pounds of her"; ~468 great root-kin: "Four hundred pounds of white cat take him off your neck": the same tic twice more (each pairs with the cat branch's "eleven pounds").
- ~356 human: "all of her, in a dress" (no "black dress", so left; "in a qipao" would fit lore).

# Run 10: the two remaining tics ("four hundred pounds", "in a dress" / "black dress")

All 13 phrases (12 lines) are prose: scene texts, a talk line, and result lines inside `do:`. No choice label carried either tic, so none was left.

- `act1_heart.js:346`: "perfectly, in a dress, and stands over you" → "perfectly, in a floor-length qipao, and stands over you"
- `longforest.js:631`: "She is wearing a simple black dress that the bond, apparently, considered appropriate." → "She is wearing a long black high-collared qipao with red piping that the bond, apparently, considered appropriate."
- `act1_blackroot.js:622`: "shakes four hundred pounds of swamp over all three of you" → "shakes a tiger's worth of swamp over all three of you"
- `act1_blackroot.js:1090`: "'One cat in a dress.'" → "'One cat on two legs.'"
- `prologue.js:356`: "all four hundred pounds of her" → "every tiger-sized inch of her"
- `prologue.js:356`: "all of her, in a dress" → "all of her, qipao and all"
- `prologue.js:731`: "as four hundred pounds of the true treasure gets to its feet" → "as a tiger's weight of the true treasure gets to its feet"
- `wilds.js:323`: "the mire holds four hundred pounds a great deal better than it holds eleven, and lets go of them a great deal more slowly" → "the mire holds a tiger's weight a great deal better than it holds a cat's, and lets go of it a great deal more slowly"
- `yuki_path.js:280`: "and is four hundred pounds of cat again before you can answer" → "and is a tiger's length of cat again before you can answer"
- `yuki_path.js:287`: "past two rungs that four hundred pounds of cat cracked on the way up" → "past two rungs that a very large cat cracked on the way up"
- `yuki_path.js:329`: "where four hundred pounds of cat lay at supper" → "where a hearthrug's worth of cat lay at supper"
- `yuki_path.js:400`: "Then there are four hundred pounds of cat on the path beside you" → "Then there is a great white cat filling the path beside you"
- `yuki_path.js:447`: "leans on you, once, all four hundred pounds, purring" → "leans on you, once, with all of her weight, purring"

Not touched (outside the task): `wilds.js:323` still has "a great deal" twice (a listed tic) in the same sentence.
