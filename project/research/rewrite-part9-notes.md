# Notes, run A

# Part 9, run A: notes (stomp_prologue.js, jackals / gao / boar / collectors)

Working copy /tmp/p9/A, file js/story/stomp_prologue.js, lines 17-111 only (the four fights). Everything else in the file is byte-identical
(diffed). Load check: ok. tests/story.test.mjs on the working copy: pass (1/1). Not committed.

## Per item
- **OT jackals** (posture, win 2, win 3, one): rewritten, same beats and outcome (the pack dead, the first core). Word counts within +-4%.
- **OT gao** (posture, win 2, win 3, one): rewritten, same beats (Gao on his back / put down, the lackey asleep in a bush / backing away
  bowing, Mei Lin's demand, both men alive). Within +-4%; "one" +21% (29 -> 35 words).
- **OT boar** (posture, win 2, win 3, one): rewritten, same beats (darts in the eyes then the blade / the bone wall; the hunters' silence,
  the carts, the grill, the tusks to the shrine, the spear, the closet; "He watches it vanish and kneels again" kept). +3% to +9%.
- **OT collectors** (posture, win 2, win 3, one): rewritten, same beats; "There is no cultivation in you" kept; Lu Han and all three
  disciples leave alive. 0% to +6%.
- **YV** jackals posture d3: `${yk(g)} yawns.` -> `stompForm(g, cat, tiger, human)`, three whole clauses (cat yawns on his shoulder; the
  great root-kin's yawn "outranks every tooth in the pack"; the woman speaks aloud: "Don't apologise ... It only encourages them.").
- **YV** jackals win 3: `which is when ${yk(g)} sits on him.` -> `stompForm`: the cat hops down and sits on it; the great root-kin lays
  one paw across it; the woman looks down and says, "Noted." (she doesn't sit on a jackal).
- **YV, the other breaks I found in my four fights** (a verb straight after `yk(g)`), fixed by moving the phrase to the end of its
  sentence, `yk(g)` kept, no new code:
  - jackals win 2 `${yk(g)} sniffs one with professional disdain.` -> "The nearest gets one sniff of professional disdain from ${yk(g)}."
  - boar posture d3 `${yk(g)} looks at it the way one looks at a sandwich.` -> "The look it gets is the one kept for a sandwich, and it comes from ${yk(g)}."
  - boar win 3 `and ${yk(g)} walks up and pats it on the snout.` -> "... a small, confused noise, which earns it no sympathy at all
    from ${yk(g)}." (the pat is gone: the human phrase ends "arms folded", which a pat contradicts).
  - `ykShort(g)` (gao win 3 "at ${ykShort(g)},"; collectors win 2 "meet ${ykShort(g)} and reach") reads right in all three forms; kept.
- **Expression count**: yk(g) 5 -> 3 (the two the sheet replaces), ykShort(g) 2 -> 2, the `yukiForm(g) === 'cat' ? ... : ...` in jackals
  "one" kept untouched, stompForm 0 -> 2 (the sheet's two). `aside(...)` calls: all four kept, three branches each.
- **FM**: every count in the collectors' texts is now "his three disciples" / "the other three" (posture, win 2 twice, win 3, one). The
  old texts said "his three men" once and then "his men" / "the collectors"; no "two" was left in the stomp texts, but none said three
  after the posture either.
- **Facts**: nobody human dies; Gao Feng's "I feel nothing in you. No root, no Qi" and Lu Han's "There is no cultivation in you" kept;
  the core beat kept in win 2 and win 3 ("a hard, cloudy, walnut-sized knot", "Something tells you the locals would kill for this").
- **Tics**: none of the brief's list in my lines (grep). Old ones removed: "the way a man does", "the way a priest", "the way you'd",
  "a great many", "for a long, cold moment".
- **Five-word runs**: checked my block against every file in js. Reworded what matched (the old stomp texts copied whole sentences of
  `boar_won`, `gao_won` and `collectors_won`, and "It is less a fight than a correction" is in stomp_act1.js:23). What still matches is
  either ordered by the sheet ("the locals would kill for this"), canon wording (Gao's "I feel nothing in you. No root, no Qi", which
  Mei Lin echoes in `mei_lin`), or plain names ("the woman with the knife", "of the Crimson Lotus Sect", "Lu Han is on his knees").

## Continuity faults I fixed inside my lines (not on the sheet; each is a small wording choice, say if any should go back)
1. **Mei Lin's demand.** The old stomp wins had her say "You can't just let him walk away" / "...as he is". The plain `gao_won`
   (prologue.js ~455) has "Kill him", and `gao_dead` (~494) has her say "I told you to kill him". Both stomp wins now say "Kill him."
2. **How many jackals.** `jackals()` (prologue.js 39-46) fields two, or three with a yearling when forestScale >= 2. Old texts: "Two grey
   bodies", "both jackals", "Her mate". Now count-free: "Grey bodies on the moss", "every jackal", "What is left of the pack".
3. **The fire.** `night_attack` has `g.flags.fire ? 'firelight' : 'dark'`; old texts: "testing the firelight", "by the fire". Now
   "testing its edge" (the camp's), "on the moss".
4. **Lu Han's age.** "a sword-form forty years in the making" against lore's "about thirty" -> "a sword-form older than he is".
5. **The old hunter.** "old enough to be your grandfather": James is 40 and locals reach sixty (Old Wen at 90 is a wonder) -> "the
   eldest of the hunters, white to the beard" (`boar_won` has "a white-bearded hunter").
6. **Lu Han on Yuki.** "an animal with open meridians" is wrong for the woman, and wrong whenever Yuki's primaries are not all open
   (`yukiMerLu`, prologue.js 114, has three cases) -> "a treasure you did not earn" (the tribute scene's own word for her, all forms).
7. **"I hear that a lot."** (gao win 2) On the first Coil he has heard it once, from Gao, a minute earlier -> "You did mention it."

## YF spots (all in /tmp/p9/A/js/story/stomp_prologue.js)
- jackals posture, degree 3: stompForm (new).
- jackals win 2: yk(g) at a sentence's end. jackals win 3: stompForm (new). jackals one: the kept cat / not-cat ternary.
- gao win 3: ykShort(g) in a list. boar posture degree 3 and boar win 3: yk(g) at a sentence's end. collectors win 2: ykShort(g).
- Rendered and read all 4 fights x 3 forms x (3 postures, win 2, win 3, one).

## CW lines
None (the sheet doesn't ask for CW).

## Label suggestions
None; no choice labels sit in this file.

## Continuity problems found, not fixed (not my lines)
- **The tribute's head count** (prologue.js 710): "four men in crimson", then "Beside him ... is Gao Feng" (or Gao in a litter). Gao is
  either one of the four, which leaves Lu Han two disciples, or a fifth man. `collectorsFight` (70-79) fields Lu Han and Gao Feng only
  (no Gao when broken or turned); the three disciples are never enemies. My texts follow the sheet (Lu Han + three) and leave Gao out,
  as the old ones and `collectors_won` do; so in a stomp win Gao Feng, when he is in the fight, is never accounted for.
- **collectors_won** (prologue.js 767) says "the other collectors"; no number, so no clash, but it could say three.
- **The militia.** With `g.flags.militia` / `spears` the intro has eight hunters with bone spearheads behind James; the posture replaces
  that intro at every degree (power.js top comment), so those hunters never appear in a fight that has a posture. Old behaviour, kept.
- **gao_hand.** If James nailed Gao's hand to his sleeve first, the posture's Gao still puts both sleeves in order. Old behaviour, kept
  (my wording, "puts his crimson sleeves in order", is a little easier on a holed hand than "straightens ... with great care").
- **The posture's degree-1 branch** is read before a real fight (degree 1 keeps the plain fight): the jackals' "You count teeth. The
  count runs long." and the boar's "it holds opinions" are written to work there too.
- **Other fights' `yk(g)` + verb** (run B's, I didn't touch them): crows posture "`${yk(g)} licks her lips.`", crows win 2 "`${yk(g)}
  washes`", crows win 3 "`${yk(g)} watches`", rats posture "`${yk(g)} gets up`", rats win 3 "`${yk(g)} regards`", lizard win 2 and 3.
- **"One" and then win 3.** The one-move finish (js/core/story.js 244-249) shows the posture at degree 3, then `one`, then goes to the
  win scene, whose text at degree 3 is win 3. So each of my four fights is ended twice in the telling (the boar by the needle, then by
  the wall; Gao pinned to a pine, then held by the wrist; Lu Han's sword splintered, then caught in two fingers). Old behaviour and
  engine order, the same for every fight in the file; my texts keep the old beats, so it is no worse and no better. Open, for Claude.

# Notes, run B

# Part 9, run B: notes (Fable)

Edited: `/tmp/p9/B/js/story/stomp_prologue.js` only. `ashfall.js` is untouched (`far_won` needed no change).
Checks run: the sheet's load check (ok); `node --test tests/story.test.mjs` (pass); every text rendered in all three forms at every degree
(no `undefined`, no doubled spaces); tic list (none); five-word runs against the rest of `js` (none left but the game's own
"eleven pounds of white cat").

## READ FIRST: two places where I did not do what the sheet says, and why

### 1. The far hunt's "doubled beat" does not exist; I kept a short homecoming in the stomp wins
The sheet says the stomp wins tell the carry home and the bow "then `far_won` tells it again". It does not: `js/core/story.js:109-113`
**replaces** the win scene's text with `STOMP[id].win[degree]` at degree 2 / 3 (`if (w) text = ...`). A player at degree 2 or 3 reads
only the stomp win plus the `enter` gain line; `far_won`'s two `byDay` texts are read at degree 1 only. `power.js`'s header says the
same ("full replacement text of the win scene ... must keep every story fact of the original win scene"), and the existing test
`tests/story.test.mjs` TG6 (line 640) asserts "the hunters' bows in every win" (`/\bbow/` in wolves win 2/3 and thornback win 2/3).
Ending the stomp wins at the kill would have removed the homecoming and the bow from every degree-2/3 reader, left +5 Village without
a word of cause, and failed TG6. So: the stomp wins keep their homecoming and bow (unchanged wording), and I fixed the rest in them.
`far_won` is untouched.
What remains true of the sheet's point: **no twin**. The stomp wins do not differ by day (a second far hunt at degree 2/3 reads the
same text). That needs `byDay` in the stomp file, which is code the sheet does not name: open, for Claude and the owner.
If the owner still wants the stomp wins to end at the kill, the cut is simple: drop the last sentences from "Ashfall gets the rest in
loads." (wolves 2), from "In Ashfall the hunters say nothing" (wolves 3), from "You bring the rest to Ashfall" (thornback 2), from
"In Ashfall the hunters see you" (thornback 3); and change TG6.

### 2. The rock lizard (night camp) now dies in win 3, for the same reason as the bull
`night_won`'s `enter` gives +3 eggs, +4 spines, **+1 Murky beast core** for the lizard. The old win 3 had it back off its nest alive
("It leaves you the eggs"), and the old `one` likewise: a core and four spines from a living beast, the fault the sheet names for the
bull. The sheet said "same outcome"; the brief says the text must agree with the fixed gains. I followed the brief: win 3 keeps its
beat (one finger on the snout, the spines fold, it starts backing off the nest) and then James kills it, dry, with an echo of the
fight choice's own label ("You are still hungry, and it is still made of meat. One needle, behind the eye ..."). `one` no longer
says it backs away ("... finds no answer there, and stops where it stands"), so it does not contradict the win 3 that follows it.
If the owner prefers the lizard alive, replace win 3's second paragraph's first two sentences with:
"It leaves you the eggs, still warm." (and the core and spines stay unexplained).

## Lines (1): the four older fights (all rewritten; same beats; settings checked against `wilds.js`)
- **crows posture**: fresh simile; the crows come "down the fallen trunk" (the night scene's trunk over his head). Degree 3 was "You
  keep eating" but the scene wakes him from sleep: now "You don't sit up." **YF**: `${yk(g)} licks her lips.` (verb straight after)
  → `stompForm`, three clauses.
- **crows win 2**: tighter; "appointment far away" → "urgent business in another province". **YF**: `${yk(g)} washes` → `stompForm`.
- **crows win 3**: "fall off the branch" → the trunk (there is no branch in the scene). The third needle now stops short of the third
  crow, which is why it bargains. The beetle: he accepts it, it is alive and walks off (the game gives no beetle item). **YF**:
  `${yk(g)} watches` → `stompForm`.
- **crows one**: was "three crows, one branch"; now one trunk, two crows and "a third that has just learned to count", so it agrees
  with the win 3 text shown after it.
- **rats posture**: tighter. Degree 2 uses the camp fire. **YF**: `${yk(g)} gets up instead` → `stompForm`, with the shared tail
  "Of the two of you, she is the worse news."
- **rats win 2**: the old text sent the dead rat back into the stream and then dressed "what's left"; now the dead one stays on the
  bank (as `night_won` has it) and is the one dressed (+1 meat). The human-only tail keeps its `yukiForm(g) === 'human' ? … : ''`
  expression; its string is new, and the leading space moved inside the string (no trailing space in the other two forms).
- **rats win 3**: same beats (the point, the spike, the rat that becomes a log). **YF**: `${yk(g)} regards` → `stompForm`.
- **rats one**: the old line had both rats flee, though the game gives rat meat; now the ridge of bone keeps the bigger one and the
  other reverses into the stream.
- **lizard posture**: tighter; firelight kept; the degree-3 aside uses the warm nest he is lying on.
- **lizard win 2**: same beats; the death made plain ("the gold gone out of its eye"), for the core. Avoids `night_won`'s own run
  "with every spine laid flat". **YF**: `${yk(g)} looks` → `stompForm`.
- **lizard win 3, one**: see READ FIRST 2. Tic "for a long moment" removed from `one`. **YF**: `${yk(g)} accepts` → `stompForm`.
- **mire posture, win 2, win 3, one**: tighter, same beats and outcome (three dead at degree 2; two dead and the bloated one sunk at
  degree 3; the small sour core from one of them, as `mire_won`'s gain line says). No fire: the Mire is a day place. `${ykShort(g)}`
  in win 3 kept (after "sees", no verb follows).
- `yk(g)` is no longer called in these four fights; it is still used by jackals, boar (run A's), wolves and thornback, so the helper
  stays.

## Lines (2): TB
- **thornback win 2**: the bull is now killed ("You do not leave it there to think. One needle, and the eye stops tracking."); the
  core named; "the eggs" → "two eggs" (the gain); "bring it" → "bring the rest".
- **thornback win 3**: `stompForm` and its three bodies untouched; "You leave it to its performance and take the eggs" → "You spare it
  the rest of the performance: one needle, and the part is its own. You take the core, small and murky, and the eggs."; "a nest of
  thornback eggs" → "thornback eggs" (two).
- **The stray " I"**: not in this working copy, nor in `/home/claude/bone-and-ash` (the text reads "not moving at all. It is playing
  dead."; the " I" looks like the first letter of "It" in a cut-off excerpt). Nothing to remove.
- **thornback one**: now says the bull is dead and how (one white spike up through the bracken), so the core has a source.
- **wolves win 2**: both wolves die already; added "One of them carried a core, small and murky." and "gets them" → "gets the rest".
- **wolves win 3**: the first wolf's death made plain ("with its neck already seen to"); "comes home with you, a small murky core the
  lighter". "the wolf first" kept (TG6).
- **wolves one**: fits as it is (win 3 follows it and tells the kill); unchanged.
- **far_won**: unchanged; its two texts fit both beasts and a dead bull ("the kill", "loads").

## CW lines
None (not on this sheet).

## Label suggestions
None.

## Continuity problems found, not fixed
- Every fight's `one` is followed by its win 3 text, which tells the fight again from its start (the bull charges after the spike has
  killed it; jackals, boar the same). By design so far; a `one`-aware win text would need code. Open.
- `ashfall.js` `far_won` gives "+2 thornback eggs" from a **bull's** nest (also `far_hunt`: "a bull"). The texts go along with it.
- `wilds.js` `night_won` (degree 1), the crows: "+3 Rot-crow feathers. Even the crows left them." reads fine after all three wins.
- The far hunt's stomp wins have no second-day text (see READ FIRST 1).

## Added after the coordinator's follow-up: the far hunt's second-day twins
- Code added (the only code): `import { byDay } from '../core/lines.js';` at the top of `stomp_prologue.js`; `wolves.win[2]`,
  `wolves.win[3]`, `thornback.win[2]`, `thornback.win[3]` are now `(g) => byDay(g, [<first text>, <second text>], 'far_won')`.
  The first texts are unchanged from the earlier part of this run. Key `'far_won'`, as the scene's own text: both read the same day
  index (checked with `noteDay` + a day later: index 1 gives the second text in all three forms).
- Four new second texts, each: a different kill (dead beast, the core named, wolf meat or **two** eggs), then `far_won`'s second-day
  facts in new words (the hunters at the oak hollow unsent for, the weight taken eldest first, the eldest's finger-width nod, the
  promotion). No bow in the second texts (the nod replaces it, as in `far_won`'s second text).
  - wolves 2: the same pincer, which puts James between them; two needles.
  - wolves 3: the first wolf goes for the knee and meets a heel; the second sits and offers a paw. **YF**: `stompForm` (cat declines
    it from his shoulder; great root-kin sets her paw beside it for scale; human shakes it, "Dismissed"). One wolf comes home, one
    goes free, as in the first text.
  - thornback 2: three rehearsed charges allowed; the fourth meets a bone wedge where plate joins plate.
  - thornback 3: **YF**: `stompForm` (cat: James's one finger; great root-kin: one paw on its skull; human: one raised hand), then
    the needle; the hunters take the eggs one man to an egg.
- Lengths against the first texts: wolves 2 about 105 words to 85; the other three within 10%.
- Tests: TG6 (`tests/story.test.mjs:640`) reads the first texts only (a fresh state). A test for the second texts is Claude's to add:
  suggested asserts: at day index 1 each of the four differs from index 0, contains "oak hollow" and "core", the thornback ones
  "two eggs", and wolves 3 / thornback 3 give three different texts by form.
- Byday past the second day wraps to the first text (byDay's rule), as `far_won` does.
- Checks rerun: the load check (ok); `node tests/story.test.mjs` (all passed, 0 failed); tics and five-word runs (clean).

# Notes, run C

# Part 9, run C: notes (Fable)

Working copy /tmp/p9/C. Files touched: js/story/prologue.js, coil_scenes.js, yuki_path.js, wilds.js, ashfall.js. Load check: all five load, no FAIL. Not committed.

## P1, the prologue and Yuki's path
1. **MS** (prologue.js `yukiMerElder`, `yukiMerLu`): all six branches now speak from sight or smell, never from sensing. Wen (in his house, over the tea): 12 open = the kettle's steam leans toward her against the draught and never leans back; some open = it has leaned `${n === 1 ? 'Once' : `${n} times`}` (the `n` switch kept, now a count of what he saw), `byForm` kept with three new entries ('small as it is' / 'and no hand ever trained it' / 'young as it looks'), no pill-smell; none = her eyes go where the steam will go before it does ("That cannot be done. It is being done in front of me." kept). "I am ninety…" kept in the 12 and some branches, as before. Lu Han (at the post): 12 = the post's banners lean toward her against the wind; some = the road's dust has risen toward her once / n times, no pill-smell; none = she watched his sense cross the road ("a sealed jar, and nevertheless one that looks back"). `yukiSpot(g)` kept in all six. **Tests:** any pin on "twelve open meridians", "meridians open", "holds Qi behind shut meridians", "a full one" needs updating. The comment above the functions ("What locals sense of Yuki's meridians") is now out of date: Claude's to reword (I left comments alone).
2. **RD** (coil_scenes.js only): the Sect sits up in the mountains (act1_return.js: "The Sect's road climbs into the mountains"; the figure "on the switchbacks, looking down at the grove"), the grove is at Ashfall, below. `WHY.clear`: "somewhere down the mountain" → "somewhere up the mountain". `a1_again` (taken): "the road up the mountain" → "the Sect's road up into the mountains" (string now in double quotes). `rt_taken`'s "You go down the road" (out of the village, before the climb) agrees with both and was not touched.
3. **YP** (yuki_path.js): the non-human `mei_lin` beat lines are their own texts now. Sister: "*Pretty,* the bond announces, at a volume your skull was never built to hold. *And she gives orders. … I sat through your whole thesis, supervisor included. Say something to her. Out LOUD.*" Lover: "*Pretty,* the bond remarks, in the tone of a buyer who has already checked the teeth. *I approve. Of her. Your expression I am sending back to the maker.*" `romance` beat: cat and great root-kin branches rewritten ("The bond, already distant and still receding: *I am going up on the roof. The roof is my address from tonight. Forward nothing.*"; the great one keeps the thatch and the goat shed); the human branch is the old text, now the only one with those words. **Tests:** tests/story.test.mjs ~2792–2793 (the non-human regexes for `mei_lin`), ~2949–2950 (`ROOF`, `SHED`: ROOF now holds for the human only). ~2809 (`!/Are those real|She's pretty/`) still holds.
4. **NE** (prologue.js `elder`): one switch added on `g.flags.ignored`. Ignored path: "Yet the whole street watched you walk down out of the Blackroot alive, with no spear in your hand. One of these things is untrue, and I am too old to doubt a whole street." Otherwise the needle line as it was. (The switch carries the "One of these things…" sentence too, since its "her" was Mei Lin.)
5. **TD** (yuki_path.js, three places): "for three days" → "since the road began" (bond cat, bond great, human aloud). True on any Blackroot day.

## P2, the Wilds (wilds.js)
6. **Dead menu text:** `wild_hunt` and `wild_train` `text:` are `''`. Kept jokes moved into drawn lines: "born starving" into `DR_HARE` day 2 (told in prose, so it holds in any form); "threads … report, with tact" into `DR_DARTS_F`; "Yuki, who has views" into `DR_BLADE_F`. Dropped: the tail counting seconds (already lives in `DR_HARE` day 3's "tail stops ticking").
7. **Rats:** "The stream takes one rat back. The other stays on the bank, having no further plans." (two rats, +1 meat).
8. **Explore:** "Every blank left on it carries the same label…" (time-neutral, no switch; the choice only shows while a place is unvisited).
9. **Lizard:** the fire is optional (`g.flags.fire`), so "at the edge of the firelight" → "just past your boots, catching what little light the night has".
10. **Drill failures:** `DR_DARTS_F` ("wild_train:0:f"), `DR_BLADE_F` ("wild_train:1:f"), `DR_NEEDLE_F` ("wild_train:3:f"), two lines each, placed after `DR_FEET_F` with a one-line comment; `failDo: didSay('t_darts', DR_DARTS_F)` etc. No other code.
11. **Two hares:** `DR_HARE` day 2 "Two hares in the reeds, and your darts are there before either bolt is. Both sets of glass plates stay dull…"; day 3 "two cleaner throws … before the second dart lands."

## YF spots
- prologue.js `yukiMerElder` middle branch: `byForm` kept, three new entries (above). `yukiSpot(g)` unchanged.
- yuki_path.js `romance` beat: byForm cat and great rewritten, human kept.
- The new non-human `mei_lin` lines, `DR_HARE`, the drill failures and the CW camp line name no shape (they hold in any form; the CW camp line is bond speech).

## CW lines (four of the six allowed)
1. prologue.js `cookMeal` (the camp's roast hare, result line; string now in backticks). Yuki, through the bond: "*You always cut mine first,* the bond adds. *I had noticed.*"
2. prologue.js `boar_won` (the village eats the boar). A grandmother: "a grandmother who has watched you carve for every child in reach before touching a rib yourself is telling her neighbour, as a finding, that the stranger was raised by someone". (Adds that James carves for the children; no gain changes.)
3. prologue.js `evening`, the third-supper (`g.flags.long`) branch. Mei Lin's mother, on his music: `The low music from your forearm she has ruled on as well: "It grieves quietly. A house can bear that."`
4. ashfall.js `supper_roof`, the second night. Mei Lin: `Your forearm has been playing something slow and sad, very low, all evening. "Leave it," she says, when you reach to stop it. "It sounds like you do when you think nobody is watching."` (This branch grows by about a third: over the ±25%, flagged.)
Music is generic in both (low, slow, sad); no names, titles or lyrics.

## Label suggestions
None.

## Found, not fixed
- wilds.js `night_event` rain, day 2 and day 3 texts: "The fire spits and sulks." / "first the fire sulks" are said even when no fire was made (`g.flags.fire` unset). Same fault as the lizard's firelight; not on my sheet.
- wilds.js `night_lizard_forced`: "*Four hundred pounds,* says the bond" is one of the brief's tics, in a text that isn't mine.
- prologue.js `elder`: Wen speaks "before you have finished sitting down", so I wrote "since you came through my door" for how long he has watched Yuki; on a very quick read 11 leanings of the steam is a lot for that moment. If it jars, the middle branch could count Yuki's glances instead; the `n` switch would stay.
- wilds.js `DR_DARTS` day 3 ("Five paces back from yesterday's line") assumes yesterday's darts went well; a failure the day before now has its own line, so the two can meet. Not on my sheet.

## After the merge (coordinator fix, part 2 M1)
- wilds.js `DR_HARE` (edited in /home/claude/bone-and-ash, not /tmp/p9/C): rewritten count-neutral, 23 and 19 words, no "two / both / each": "Bone arrives before the bolt does. The glass plates stay dull, which is how you want them. Yuki, born starving, inspects the result." / "A shorter stalk today, and cleaner throwing. Yuki's tail stops ticking a full second before the reeds go quiet." Item 11 on my sheet is superseded by this; wilds.js loads.

# Notes, run D

# Part 9, run D: notes (the Fallout, the Blackroot, the Long Forest)

Working copy /tmp/p9/D; files `js/story/act1_fallout.js`, `act1_blackroot.js`, `longforest.js`. Not committed. The sheet's load check
prints only "done" (all three load).

## FF, the Fallout's four failure lists (act1_fallout.js, top)
A third text added to each list (keys kept; each stands alone and also reads after two earlier failures). **The first two texts are
unchanged**: the first of each is pinned word for word by tests/story.test.mjs (~296–309), so I did not tighten them.
- `fo_palisade:0:f`: "Somewhere along the row the song goes flat, and the stakes with it: chalk to the core. The hunters have pine cut
  and waiting before the last one crumbles. They brought it with them this morning, and nobody mentions why."
- `fo_council:0:f` (fits both labels, Day 8 and Days 9–10): "You lose your place in the middle and go back for it, aloud. The council
  waits out the search without a cough. The bow, when it comes, is correct in every joint, and addressed slightly to your left."
- `fo_drill:1:f` (no form word, no speech: fits all three of Yuki's forms): "Over before the hunters have finished forming their
  circle. Old Hu asks, with respect, whether it could be shown again, slower. Yuki regards that as a question for you."
- `fo_clinic:0:f`: "All but the last of the line. A crushed foot is more than one sitting mends; he goes home on a neighbour's back,
  with a splint, and a boy to recite your instructions."

## P5, the Blackroot (act1_blackroot.js)
1. **Places (code, as the sheet allows):** `ya_found` `place: (g) => (g.flags.ya_waited ? PLACE.ah : `${P} — a burnt gully`)` (waited:
   she sits on the next rise in sight of the camp, so the Ashen Hills); `mei_bond` `place: (g) => PLACE[region(g)]` (it is reached from
   `talk_mei` in any region).
2. **The wolf tooth:** `ya_found`'s second choice now opens with a prose line before the unchanged gain line: he takes the tooth and
   puts it on; Ya rules "One each… Hers will be smaller." and goes for the second wolf. No item added; `'+1 Ya's wolf tooth. Ya sets
   off to find a second wolf.'` kept exactly as the array's second entry.
3. **The menus' dead text:** `rr_forage`, `dw_forage`, `ah_forage`, `bl_train`: `text: ''`. Moved into drawn result lines (each as a
   second array entry or appended after the unchanged mechanical part):
   - `rr_bracket` **failDo** (after "+1 Jade bracket."): Ya, the grubs, "Not *everything*", the aggressive wink. On the failure, so it
     is rare and the joke lands on crumbled mushrooms; on the success it would repeat on both Root Road days.
   - `dw_chestnut` do (after the unchanged line): Mei Lin's knotted skirts, Ya's frank interest, "Stop that." / "*That.*" (the Drowned
     Wood is one day, so no repeat).
   - `ah_truffle` failDo (appended to "The beetle goes to Ya."): she eats it live; "Disgusting." / "You're still looking." / "…when
     you *die*."
   - **Dropped, nothing drawn fits:** `bl_train`'s three places and "Ya studies your training like a critic… Mei Lin studies Ya
     studying you, and would deny it." The darts' and needles' `failDo` return `[]` (silent failures); a line there would be new code,
     so I left it. If Claude wants one, offered: "The mark survives. Ya reviews the throw like a critic who never took a lesson in her
     life. Mei Lin studies Ya studying you, and would deny it."
4. **Stake lines** (each one sentence, no "then", read after every posture degree and after the plain intro):
   - wolves: "One of them has tried the stakes already, and bleeds for it." ("coming in" dropped: at degree 3 they are still pacing.)
   - drowned: "One of them has a stake clean through it, and stands there leaking, and has not looked down." (Was two sentences, and
     "walked straight through the stakes" put it inside the camp while the posture says "They come no nearer.")
   - serpent: "It has crossed the stakes to get this far, and the stakes kept a share." (tense only)
   - hawks: "One cuts it too fine over the stakes, and comes on short of some feathers." ("climbs away" read as leaving the fight.)

## P8, the Long Forest (longforest.js)
5. **Menus:** `lf_forage`, `lf_hunt`, `lf_train`, `lf_trials`: `text: ''` (so `lf_forage`'s `${pantry(g)}` goes with it; the hub draws
   the pantry). The scratching post is kept in the new `t3Fail` pool (item 8), worded "the ring of bone stakes she keeps as a
   scratching post" (a habit of hers, true in any form). Lost with the menus: "where the things that eat the things that eat you
   live", "has a lot of breakfast in it", "The trunks are running out of places to hit."
6. **Later-visit texts, read for both cases** (second visit this Coil; first visit this Coil remembered from an earlier one):
   - Changed: `lf_bone_depths` ("has been raked smooth since you were last here… back to strength" → "lies raked smooth… and keeps no
     record of you… at full strength"); `lf_black_mire` (logs "drift further off", which made the beasts remember him → "turn, slowly,
     to keep you in view"); `lf_thunder_ridge` ("fresh glass since your last climb" → "glass where you remember plain rock. The sky
     keeps its hand in."); `lf_storm` (the bolt "has been down this checklist before" gave the sky a memory, and one more clerk (T15)
     → "You know the items by now, and could prompt it; the answers have not changed either. *Pills? Grass? Cores? No. As before.*");
     `lf_old_roots` ("are back along the white" → "keep their places along the white"); `lf_notes` and `lf_bathe` under item 9.
   - Read and left, fit both: `lf_falls`, `lf_ride` (text and its thanks line), `lf_bored`, `lf_trial_lost`, `lf_trial_won`'s
     second-win text (by `lf_trials_won`, this Coil's wins only).
   - The Tans and Fang Wei (`FORGETS`): their later texts (`lf_wanderers`, `_talked`, `_won`, `_lost`, the two stomp postures) only
     ever mean a second meeting this Coil; fine as they are (one time word fixed, item 9).
   - **First meeting, remembered by James only:** the Tans' first text said "You haven't heard of them", false from Coil 3. Now he
     *says* it: "You have not heard of them, you tell him; you have been in a forest. It turns out to be the wrong answer." True on a
     first Coil, a straight-faced lie later. Fang Wei's first text names nothing James couldn't see; left.
   - **Can't fit both, not fixed (not `later` texts):** `lf_bathe`'s and `lf_bored`'s *first* texts no longer show to a man who
     remembers, which is right. `lf_human_won`'s first text for Fang Wei ("better than he looked") and `lf_human_lost`'s first text
     read slightly naive on a Coil where James has beaten the same man before; low, left.
   - **For Claude, tests:** TG1's marker for `lf_bone_depths` (`/raked smooth since you were last here/`) no longer matches; use
     `/lies raked smooth/`.
7. **The Heartless (code: one branch, `if (name === 'The Heartless') return …`, before the second-win branch):** one grave text for
   every win, fitting the plain fight and both stomp wins (no "breathing hard", nothing destroyed), with a byForm close. **YF:** cat
   "Yuki does not wash. She sits against your ankle…"; great form "…stands with her shoulder against your hip…" (both: "the bond
   carries nothing at all"); human "Yuki leaves her sleeves as they are. She stands close at your side… and offers no opinion."
8. **The spar (C5):** new pool `LF_DRILL.t3Fail` (three lines, no speech, no form word, each right for a near miss and for a clean
   loss); `lf_t3`'s failDo now `return [lfDrill(g, 't3Fail'), '−3 HP.', ...awardYukiFightXp(g, 'challenging')]` (the HP as its own
   entry, so the drill line stays a whole `LF_DRILL` string for TG13). The old line survives as the first: "She was asked not to hold
   back, and she has honoured it. You kept pace for longer than either of you expected. Not for long enough." The three `t3` success
   lines only show on a success; read, form-neutral, left. **For Claude, tests:** 21 → 24 drill lines (P8A SW, TG14's pool count),
   a new line pool `lf_t3Fail` (TG2's list of seven grows to eight once a spar fails), TG10's code hash.
9. **Run E's three notes:**
   - bathe, later: "the scholar's stoop has gone" → "two arms, two legs, one beard on which the forest holds views" (any realm).
   - notes, later: no trial grounds assumed (the notes open after two days, with or without a trial): "Whatever I take out of this
     forest is replaced overnight, to the same headcount: hares, fowl, things with teeth. … Hypothesis: organised."
   - the Tans, first meeting: "the fire back upstream…" → "The narrow one asks whether the uncle cooks, since he looks to him like a
     man who feeds people, and is looked at until he stops." Second meeting: "what was in the pot this morning" (no breakfast is
     guaranteed, and a seclusion skips the morning) → "Little Tan asks whether the uncle is still cooking, and is looked at."
10. **The sky at 0:** `${g.james.realm === 0 ? 'The sky has not yet tried to strike me. I gather it gets round to everyone.' : …the old
    sentence, unchanged…}`.

## YF spots
`lf_trial_won`'s new Heartless byForm (item 7). The Fallout's third spar line and the three `t3Fail` lines are written to need no
branch (no speech, no body).

## CW lines
- `lf_wanderers`, first meeting with the Tans, Little Tan: "asks whether the uncle cooks, since he looks to him like a man who feeds
  people" (replaces the fire line; time-neutral).
- `lf_wanderers`, second meeting, Little Tan: "asks whether the uncle is still cooking".
No music anywhere in this run.

## Label suggestions
None new (the hub's "Wash in the river…" label is the label pass's).

## Continuity found, not fixed
- `lf_notes`: the strike count is `g.james.realm`, so Foundation and Core Formation read "1 time" / "2 times", while lore has the sky
  call at realms 3–14 only. Fixing it means changing the count's expression (e.g. `Math.max(0, realm - 2)`); the sheet allows only a
  switch on it. Open.
- `lf_trial_won`'s plain texts ("breathing hard", "take you for food") still follow a degree-3 stomp win where nothing was hard; only
  the Heartless is branched (T22's scope).
- `lf_bathe`'s first text ("the body… is changing: leaner, harder") is also false at Mortal Vessel on the first screen; not in the
  sheet.
- Blackroot: the darts' and needles' failures in `bl_train` answer nothing (see item 3).
- Tests that fail in the working copy, all from changes the sheet asked for (I ran `node tests/story.test.mjs`): "text renders in
  rr_forage / dw_forage / ah_forage / bl_train / lf_forage / …" (the test wants more than 40 characters of text in every scene,
  menus included); "NC1: 38 reply lists … (38, 67)" (now 71 texts); "P8A (SW): 21 drill lines"; "TG1: lf_bone_depths" (marker,
  above); "TG10" (the Long Forest's code hash). Nothing else failed.


## Run E (the reviews' text fixes: T1–T18, C5)

One line per fix, old → new. All text; the only code touched is what the sheet allows (T3's two `n` expressions, T6's `byForm`, T12's two result lines swapped).
- **T1 wolves win 2, day 2** `stomp_prologue.js`: "A second pair, with the first pair's narrow grey manners. They open as the others did, one wide to each hand," → "A pair of ash-wolves, with the narrow grey manners of the kind. They open as wolves do, one wide to each hand,"
- **T1 wolves win 3, day 2** `stomp_prologue.js`: "The first wolf comes in low this time, for the knee." → "The first wolf comes in low, for the knee."
- **T1 thornback win 2, day 2** `stomp_prologue.js`: "Another bull, as big as the last and no better informed." → "A bull the size of a woodshed, and no better informed than one."
- **T2 crows win 2** `stomp_prologue.js`: "Two crows are down before the fire finishes its crackle." → "Two crows are down before the first feather lands."
- **T2 crows one** `stomp_prologue.js`: "Feathers come down into the fire; the smell is their revenge." → "Feathers come down over the camp; the smell is their revenge."
- **T2 rats posture, degree 2** `stomp_prologue.js`: "'You stay sitting, and feed the fire a stick.'" → "'You stay sitting, and pick up a stick you will not need.'"
- **T2 lizard posture** `stomp_prologue.js`: "Its tail cuts a slow figure of eight through the firelight." → "Its tail cuts a slow figure of eight through what light there is."
- **T5 collectors posture** `stomp_prologue.js`: "and his three disciples spread behind him in a practised crescent." → "and his three disciples spread behind him in a practised crescent. Gao Feng's place in it is his own affair."
- **T5 collectors win 2** `stomp_prologue.js`: "reach, together, the decision to be elsewhere." → "reach, together, the decision to be elsewhere. Gao Feng, whatever part he had meant to take, takes none that matters."
- **T5 collectors win 3** `stomp_prologue.js`: "One of them is calling for his mother." → "One of them is calling for his mother. Gao Feng, whatever he came to do, has stopped doing it."
- **T5 collectors one** `stomp_prologue.js`: "His three disciples have already started running.`" → "His three disciples have already started running, and Gao Feng's plans, if he brought any, have gone with them.`"
- **T7 lizard one** `stomp_prologue.js`: "finds no answer there, and stops where it stands." → "finds no answer there. The spike finds one."
- **T8 lizard posture, degree 3** `stomp_prologue.js`: "But the ground is warm, and you had only just got comfortable." → "But the ground is warm, and it was yours first tonight."
- **T9 rats one (agrees with win 3: the log in the reeds)** `stomp_prologue.js`: "The other one reverses into the stream so fast it leaves a wake." → "The other one drops into the reeds so fast it leaves a dent."
- **T9 thornback one (no longer dead before win 3 kills it)** `stomp_prologue.js`: "One white spike has come up through the bracken and settled it. The fronds close slowly over a dead bull with every spine folded away like a fan." → "One white spike has come up through the bracken, and the bull has stopped with its chin on the point to think. The fronds close slowly round it, every spine folded away like a fan."
- **T10 / T18 jackals win 3 (two jackals left at forest scale 2; one paw joke fewer)** `stomp_prologue.js`: "'That is when Yuki hops down and sits on it.', 'That is when Yuki lays one paw across it and leaves the paw there.'" → "'That is when Yuki hops down and sits on the nearest of it.', 'That is when Yuki lies down across the whole of it and shuts her eyes.'"
- **T18 thornback win 3, day 2, great root-kin** `stomp_prologue.js`: "'Yuki lays one paw on its skull as it arrives, and keeps the paw there.'" → "'Yuki lowers her head and lets it arrive at her brow, and gives no ground at all.'"
- **T11 collectors win 2** `stomp_prologue.js`: "He eats no grass, no pills and no people, and he would like very much to go on that way." → "The neighbour eats no grass, no pills and no people, and would like very much to go on that way."
- **T3 Wen, middle branch (n is now how strongly)** `prologue.js`: "${n === 1 ? 'Once' : `${n} times`} the steam of my kettle has leaned toward it, against the draught, ${byForm(g, 'small as it is', 'and no hand ever trained it', 'young as it looks')}, and there is no pill-smell on it." → "The steam of my kettle leans toward it, ${n <= 3 ? 'faintly' : n <= 7 ? 'plainly' : 'steeply'} and against the draught, ${byForm(g, 'small as it is', 'and no hand ever trained it', 'young as it looks')}, and there is no pill-smell on it."
- **T3 Lu Han, middle branch (n is now how strongly)** `prologue.js`: "And yet the dust of the road has risen toward ${b} ${n === 1 ? 'once' : `${n} times`} since I stopped walking, and there is no pill-smell about it. So it rises for a sect's heir." → "And yet the dust of the road lies combed toward ${b}, ${n <= 3 ? 'faintly' : n <= 7 ? 'plainly' : 'hard'} against the wind, and there is no pill-smell about it. So it lies for a sect's heir."
- **T3 tic ("a mortal" three times in the tribute scene)** `prologue.js`: "and a mortal beast sees no such thing:" → "and no common beast sees such a thing:"
- **T4 Wen, ignored path** `prologue.js`: "Yet the whole street watched you walk down out of the Blackroot alive, with no spear in your hand. One of these things is untrue, and I am too old to doubt a whole street." → "Yet you walked down out of the Blackroot alive, with no spear in your hand, and a whole street took care not to look at you. One of these things is untrue, and I am too old to doubt what a whole street will not look at."
- **T6 cookMeal (a ritual line that bears repeating; all three forms)** `prologue.js`: "*You always cut mine first,* the bond adds. *I had noticed.*`" → "${byForm(g, '*Mine first,* the bond observes, as it does at every fire. *Correct.*', '*Mine first,* the bond observes, as it does at every fire. *Small, but correct.*', '"Mine first," says Yuki aloud, as she does at every fire. "Correct."')}`"
- **T17 Mei Lin's mother (rhythm; Mei Lin keeps the mood)** `prologue.js`: ""It grieves quietly. A house can bear that."" → ""It keeps time like a loom. A house can bear that.""
- **T12 dw_chestnut (the two result lines swap places: start of the hour, then the gain)** `act1_blackroot.js`: "return ['+4 water-chestnuts (as river cress). Mei Lin\'s lips have gone blue, and she is laughing at something Yuki did.', `She has waded out with her skirts knotted at the hip. From the bank Ya studies her legs with frank and appreciative interest. "Stop that," says Mei Lin, without turning round. "Stop what?" "*That.*"`];" → "return [`Mei Lin has waded out with her skirts knotted at the hip. From the bank Ya studies her legs with frank and appreciative interest. "Stop that," says Mei Lin, without turning round. "Stop what?" "*That.*"`, '+4 water-chestnuts (as river cress). By the end of it Mei Lin\'s lips have gone blue, and she is laughing at something Yuki did.'];"
- **T13 bl_train lost joke, into the needles' third line** `act1_blackroot.js`: "Ya watches for a hundred breaths, announces that nothing is happening, and stays to watch more of it." → "Ya watches for a hundred breaths, announces that nothing is happening, and stays to watch more of it. Mei Lin studies Ya studying you, and would deny it."
- **T13 wild_hunt lost punchline** `wilds.js`: "Yuki, born starving, inspects the result." → "Yuki, born starving and helped by nothing since, inspects the result."
- **C5 darts 1** `wilds.js`: "report, with tact, that the marks were never in danger. The undergrowth took losses." → "report, with tact, that the marks were grazed oftener than struck. The undergrowth took losses."
- **C5 darts 2** `wilds.js`: "The darts land as though they had. Yuki follows one into the ferns with her eyes and says nothing, at length." → "Half the darts land as if they had. Yuki watches one into the ferns and says nothing, slowly."
- **C5 blade 1** `wilds.js`: "The blade arrives late, leaves early, and once comes out as a spoon." → "The blade keeps time on most cuts, and once comes out as a spoon."
- **C5 blade 2** `wilds.js`: "Today it dissolves on the cut, and you finish the form holding a fistful of white dust and your dignity, in that order." → "Today it dissolves on every third cut, and you finish the form holding white dust and your dignity, in that order."
- **C5 needles 1** `wilds.js`: "A hundred needles, and the bark holds a hundred opinions on where the point was. Forty in the knuckle-width, if you are generous. Your threads are not." → "A hundred needles, and the bark holds several opinions on the point. Seventy in the knuckle-width, if you are generous. Your threads are not."
- **C5 needles 2** `wilds.js`: "Sixty in the mark, by the threads' count, which is the only count on offer. The other forty have founded a colony in the next trunk." → "Eighty in the mark, by the threads' count, the only count offered. The other twenty have founded a colony a thumb to the left."
- **T14 the Tans** `longforest.js`: "asks whether the uncle cooks, since he looks to him like a man who feeds people, and is looked at until he stops." → "asks whether the uncle cooks, since his sleeves are rolled like a cook's, and is looked at until he stops."
- **T15 ridge, later visit** `longforest.js`: "There is glass where you remember plain rock." → "The glass lies where the lightning left it."
- **T15 Bone Field, later visit** `longforest.js`: "and one or two that haven't been told about you." → "none of which has been told about you."
- **T16 the Tans** `longforest.js`: "You have not heard of them, you tell him; you have been in a forest." → "You have not heard of them, you tell the scarred one; you have been in a forest."

### YF spots
- T6 `cookMeal`: new `byForm` (cat / great root-kin by the bond, the woman aloud). T10 / T18: the great root-kin's branches in jackals win 3 and thornback win 3 day 2.

### CW
- T6 keeps CW 1 (he cuts hers first, "at every fire"); T14 the Tans now go by his rolled sleeves; T17 the mother hears the rhythm, Mei Lin the mood.

### For Claude (tests and code, not mine)
- T3: the strings "Once" / "once" / "N times" are gone from `yukiMerElder` / `yukiMerLu`; `n` now picks faintly / plainly / steeply (Wen) and faintly / plainly / hard (Lu Han) at 1–3, 4–7, 8–11. Any test for P26 ("1 times") needs the new words. The comment above them ("What locals sense of Yuki's meridians") is still wrong; a comment, left alone.
- T12: `dw_chestnut`'s `do` now returns the scene line first and the "+4 water-chestnuts" line second; a test reading result [0] as the gain would trip.
- T5: no switch; each clause is true whether Gao Feng fights, stands turned, or lies in the litter.
- C5: the six lines are 22–24 words; the counts in them changed (seventy, eighty / twenty).

### Not done, with reasons
- T13: `lf_trials`, `lf_hunt` and `lf_train` jokes found no drawn text to sit in (the hunt's results are bare gain lines, the drill pools are counted by P8A). Open.
- T2: the rain event's "The fire spits and sulks" (not in the sheet) still assumes a fire. Open.
- T9: `one` and win 3 still retell the same charge / lunge (the engine's pattern); only the two clashing facts are fixed. T7's lizard now dies in `one` and again in win 3, as the review proposed.
- T5: with every disciple running, nobody is left to carry the litter on the `gao_broken` path (old; no text names it).

### Load check
All nine files import; "done", no FAIL.

