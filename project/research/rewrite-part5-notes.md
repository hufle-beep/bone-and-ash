# Rewrite part 5 (the Blackroot): Fable's notes, runs 1–3

## Run 1


Working copy /tmp/rw-p5-r1, `js/story/act1_blackroot.js`, lines 272–771 only (changed lines 288–767; line count unchanged, so
run 2's line numbers still hold). No commit. Load check prints "loads"; no TODO in lines 272–771. Words in the changed lines
5,256 → 5,699 (+8%: four new human-form lines, the calendar fix, three CW lines). Text lint (log only): Blackroot scenes with
favourite phrases 25 → 19, scenes sharing chunks 33 → 27, tics 2 → 1 (`wyrm_lost` "turns out" ×3 is gone; `mei_raft` is run 2's).

## Per scene (what changed, why)
- `bl_start`: all five paragraphs rewritten. CL: Ya now says "Five days in … Six, if I end up carrying one of you" (echo of `fo_price`, not a copy). The send-off no longer repeats `fo_depart`'s rows of bowing (one beat at the last stake). "By noon" → "Before noon" (the choice costs 240 min from 06:00). The Convergence was already singing at the barley in `fo_depart`, so here it "goes up a key" instead of starting to hum again.
- `rr_hub`: both leads rewritten ("the split has a tenant"); dashes out.
- `ya_mocks`: enter line and text rewritten; "a great deal of eyelash" (tic) gone. Continuity: Ya's "this cake I carried myself and baked myself" contradicted `bl_start` (the mother's cakes, in James's hands) → "this cake her mother baked and the scholar carried". The three result lines rewritten.
- `ya_fight_start`: rewritten. Continuity: "When I took the elk's eye out this morning" assumed a hunt the player may never have taken (the elk is optional, and the card can be played on day 2) → "When she called me *animal*", which always happened (`ya_mocks` gates this scene). If the owner wants the elk back, it is a one-clause revert. Tail: "bought a ticket" → "paid for her seat".
- `ya_spar_win`: both openings and the rest rewritten ("a long moment" and "the way you look" tics out).
- `ya_spar_lose`: rewritten. YF fix (below). "the colour of the cinderberries" → "a ripe needleberry" (nobody has seen a cinderberry before Day 14).
- `rr_forage`: text and the two fail lines rewritten; the mechanical lines untouched.
- `rr_hunt` (day 1 text), snare fail line: rewritten ("the way a musician" tic out). Day 2 text and `HUNT_AGAIN` are newer: untouched.
- `rr_elk_won` (day 1 text), `rr_elk_lost`: rewritten.
- `rr_scout`: rewritten; CL fix and CW line (below); both moss-trail variants and the three result lines rewritten.
- `rr_roots`: text, the `roots` line and the three result lines rewritten ("for the first time" tic out). Mechanical part "Saturation +12% (…%), no Qi spent." kept exactly.
- `rr_end`, both bridge result lines, `rr_bridge_fail`: rewritten. The `fly:` line is newer: untouched.
- `wyrm_won`: rewritten ("a long time", "for the first time" out). YF: "Yuki is grooming" → "Yuki is putting herself to rights" (fits a cat, a tiger and a woman; no switch).
- `wyrm_lost`: both `canFly` branches and the closing dialogue rewritten. "turns out" 3 → 1 in my strings (2 with the tiger's pinned line). I kept the phrases tests/story.test.mjs:2243 looks for ("takes you off the root and you fall", "takes you out of the air like a shuttlecock", "Wyrms, it turns out, don't swim." / "neither swim nor fly."), so that test still passes; the tiger's line plays off the Wyrms sentence.
- `dw_enter`, `dw_hub` (both leads): rewritten.
- `dw_forage` and its six result lines, `dw_hunt`, the fowl fail line, `dw_serpent_won` (+ enter line), `dw_serpent_lost`: rewritten. `dw_serpent_lost` still opens "The serpent drags you under. For a long…" (the same test); "a long … moment" → "while".
- `dw_scout`, its `saw_lights` line and both result lines: rewritten. Old Wen's words kept as in `ashfall.js`.
- `dw_hollow`, `dw_drowned_won`: rewritten ("a long time", "the way vinegar" out).
- `dw_drowned_lost`: rewritten. Continuity: Ya cut him free with a bone-knife "borrowed from your own hammerspace"; nobody but James can reach into it → "one of yours … borrowed days ago without a word to you".
- `dw_after`: rewritten; "sits beside you" → "comes and looks at it with you" (all forms); CW line (below).
- `hot_spring` and the "Get in" result line: rewritten; YF fix (below).
- `spring_ya`: text, the only-Ya and the neither endings, the "Much later" line: rewritten; same level as before (a kiss, then the steam). My wording avoids the five-word runs of `SPRING_JUST_YA` (run 2's constant, untouched).
- `mei_curious`: both branches rewritten; CW line in the second (below).

## New lines the sheet asked for
- **`bl_start` (292):** "Five days in," Ya says. "Six, if I end up carrying one of you. Something will try to eat us on the way. I'll say which, when I smell it."
- **`rr_scout` (461):** "Ten days back, before the village: your camp, by the stream. The wolves weren't the only ones circling it. I smelled you every night." She grins without looking up. "You smell like lightning and soap. Nobody here smells like soap. Two days I followed you, to work out what you were. You fed the cat first, so: not Sect." (The label '"You followed me for two days?"' still fits. I wrote "wolves", as the game's texts call them ash-wolves; "ash-fangs" appears nowhere in `js/`.) This line is 41 → 59 words: over the ±25%, because of the fix and the CW clause.

## YF (every `byForm` in lines 272–771)
- `bl_start`: 'a cat' / 'a very large cat' / 'a cat in a black dress': kept (pinned by tests/story.test.mjs:1535; "a black dress" is on the tic list, and this one is the established joke).
- `ya_mocks`: 'on your shoulder' / 'at your side' / 'at your elbow', then a private thought through the bond: right for all three (the woman keeps this one to herself); kept (test 1526).
- `ya_fight_start`: climbs down off the shoulder / walks off and lies down / steps back and sits on a root: kept (test 1592); only the shared tail changed.
- `mei_curious`: 'from your lap' / 'a white hill at your back' / 'across the fire and apparently asleep': kept (test 1948).
- **Four empty human branches written** (the owner usually plays her human by Day 11; the tiger had a line, the woman had none). Same job as the tiger's line, about the same length:
  - `rr_elk_lost`: " The elk threw Yuki into a thornbrake first, which is how it reached you. She walks out with her hair full of thorns and her face full of nothing, and holds a scratched arm out to Mei Lin without being asked."
  - `rr_bridge_fail`: " Yuki is half a step behind her, tail lashing. "You tried," she tells you over her shoulder, with no regret in it at all."
  - `wyrm_lost`: " Yuki lets go of the wyrm when it suits her and comes down the forty metres of air like a woman on a staircase. She stops a hand above the water and looks the three of you over. "I didn't jump," she says. "I'd like that noted.""
  - `dw_serpent_lost`: "\n\nYuki comes up last, some way off, with her hair plastered flat and a length of serpent in one fist that is attached to nothing any more. She wades out and wrings her tail over all three of you. "It let go," she says. "Eventually. You're welcome.""
  - **Test impact:** tests/story.test.mjs 2122–2150 (YB1, LL) expects the human's text to equal the cat's in these four scenes; those four asserts now fail ("the cat's and the human's texts unchanged") and need an `hswap`-style row, as `far_lost` got in v0.11.169. If the owner doesn't want the lines, set the third argument back to ''. The cat's branches stay empty (she is on his shoulder). The tiger's lines are untouched, word for word.
- **Line 385, `ya_spar_lose`** ("the sound of a cat laughing"): now "What Yuki sends you through the bond is not a word, exactly. It is, beyond any doubt, a laugh." Fits all three; no switch needed.
- **Line 721, `hot_spring`** ("Nobody here but trees and the cat."): now "Nobody here but trees, and trees don't tell." Fits all three; no switch needed.
- Other one-form wording without a switch, fixed in the prose: `wyrm_won` (grooming), `dw_after` (sits beside you). `hot_spring`'s "Yuki looks at all three of you" and `dw_forage`'s "something Yuki did" fit every form.

## CW (3 of 3)
1. `rr_scout`, Ya: "You fed the cat first, so: not Sect." (what she saw at his stream camp; he doesn't comment.)
2. `dw_after`, Yuki (bond): "*And you will cook twice as much for them. I know you.*" (after "*They will be insufferable now,*"; he doesn't answer.)
3. `mei_curious` (the branch without both), Mei Lin: "Your arm is playing low: a woman singing in no language spoken here. "You put her on when one of us is cold," Mei Lin says. "I've counted."" (Music generic; James says nothing.) This makes the branch's first paragraph 15 → 43 words; the branch as a whole is about +30%.

## Label suggestions (none edited)
- Line 342 (`ya_mocks`): 'We have a four-day walk, one cat and no doctor…' → 'We have a five-day walk…' (Claude's, per the sheet). "one cat" also reads oddly beside the tiger or the woman; "one root-kin" would cover all three, if a form-neutral label is wanted.
- No other label needs a change for my texts: `rr_scout`'s '"You followed me for two days?"' and `hot_spring`'s labels still match.

## Continuity found, not fixed
- `dw_scout` (643): "I think I came here in one." James arrived through the lab's spatial seed chamber (lore: a lab accident), not aboard a seed-ship. It reads as true only if the chamber counts as a seed of the same make. I kept it (a story beat, and the label "Tell them everything. The ship." leans on it); a safer line would be "Yes," you say. "My people grow them."
- Tics inside the tiger's pinned lines (unlisted strings, exact-match tests at story.test.mjs 2122–2145), left alone: `rr_elk_lost` "sits down beside Mei Lin", `dw_serpent_lost` "four hundred pounds of swamp", `wyrm_lost` "Cats, it turns out".
- `stomp_act1.js` (not my file) carries stomp variants of `dw_serpent_won` and `dw_drowned_won` that still share old wording with each other and, a little, with my new lines ("Oh. That's bad."): alternatives of the same beat, never shown together.
- `wyrm_won` says "the four of you" (Yuki counted) and Ya "looks at the three of you": kept as it was.
- Tests still failing in this worktree that are not mine: the three NC1/RW1 reply-list asserts (the KO/CW/SW placeholders from the prep commit).

## Run 2


Working copy: /tmp/rw-p5-r2, file js/story/act1_blackroot.js only. Lines 272–771 (run 1's) are byte-identical to HEAD.
Not committed. Load check prints "loads"; no "TODO" left in the file. The file is 2 lines longer (friends_watch gained a
paragraph for a CW line), so everything after line 1267 sits 2 lines lower than in the older-lines list.

Checks I ran: the load check; `node tools/textlint.mjs` (log only): Blackroot scenes with favourite phrases 25 → 16,
tics 2 → 1 (the one left is run 1's `wyrm_lost` "turns out"; `mei_raft` "the water" ×3 is gone), broken 25 → 0 (the TODO
lines), 833 labels / 5668 label words unchanged. A script check: all 143 choice labels, every `${...}` expression, every
`place:`, `title:`, `art:` value are unchanged. The tests were not run: `tests/story.test.mjs` pins the old first-day replies
(NC1's `NC` list, `OLD_FORMS`) and will need the new first entries.

## For Claude (things that touch code, tests or other runs)
- **Tests pin old texts:** every reply list's first entry changed (task 1), so NC1's "the first day's reply is the old one"
  asserts fail until the pinned strings are updated. `DR_COOK`, `DR_BL_DART`, `DR_BL_NEEDLE` are new lists (the count
  asserts "38 lists / 63 new texts" were presumably already adjusted when the TODO lines went in).
- **`DR_COOK[2]` is a function** `(g) => ...` with `byForm` (the sheet allows it); `dayReply`/`byDay` and the NC1 test
  loop already call functions.
- **stomp_act1.js copies** several of my scenes' old sentences (`ah_hawks_won` "Little queen…", `ape_won` "Ya walks over to
  it, slowly…", `bl_night_won` "…good practice. Mei Lin cleans your cuts…", the wyrm/ape/serpent intros' wording). They now
  differ from the scenes; whoever has stomp_act1.js (run 3) should match them to the new wording, or leave them as variants.
- **My own (post-v0.11.69) lines I touched**, all small, each for a reason given below: `mei_raft` (2 phrases, the lint's
  tic), `mei_bond`'s first-kiss branch ("for the first time" → "a first kiss": the lint's favourite phrase),
  `friends_watch`'s great-root-kin branch, `ah_hunt` day 1's cat branch only (older anyway).
- Mechanical parts kept exactly: "+2 ash-truffles (as jade bracket), and one eaten on the spot: +10 satiety.",
  "+6 cinderberries (as needleberries).", "+2 cinder hawk (as fowl).", "+2 Murky beast cores", "+1 Ya's wolf tooth.",
  "+8 HP.", "No breakfast.", "Slept until 06:00. HP and Qi full.", "+2 wolf meat (as venison).", "+1 cinder hawk (as fowl).".
  The one bracket I reworded: `ape_won` "(one of them the size of a fist)" → "(one of them fist-sized)" (prose, not an item).

## Task 1 (OT), per scene / constant: what changed and why
- **Reply lists, first entries** (`DR_STAKES`, `DR_LIGHTS`, `DR_SNARE`, `DR_BETWEEN`, `DR_SPAR_YA`, `DR_SPAR_YA_F`,
  `DR_TRUFFLE`, `DR_CINDER`, `DR_GRUB`, `DR_BEETLE`, `DR_BEETLE_AFTER`, `DR_SORREL`): reworded at the old length, same beat;
  each later entry still follows from it ("White points again", "Still magnificent", "It pops again", "the second
  proposal", "What happens is that…", the knife-grip). `DR_LIGHTS[0]` no longer says the lights "go on into the tree"
  (from a Root Road or Drowned Wood camp the tree is days off): now the roots knit shut and the lights pass a gap, as
  entries 2–3 already had it.
- **`BL_WATCHES`, `BL_DW_OPEN[0]`, `BL_DW_CAMP[0]`, `patchUp`, "Rest an hour", the ghost-gill line, `hubText`** (amber,
  hungry, hurt): reworded, same facts and jokes (nap / data collection; beetles; Mei Lin not mentioning the bandages).
- **Encounter intros** (elk, wyrm, serpent, drowned, hawks, ape) and **night-fight intros / `STAKE_LINES`**: reworded at
  length. Ape: it "comes down off its rock" (it sits in the notch in `ah_ridge_end`; it used to "drop off the ridge") and
  "What looks out of it is not [moss]" (the old "Its eyes are not" was wrong after the lure took one eye). Night serpent:
  no "bank" any more (the camp is a raft of trunks).
- **`ah_enter`**: tightened; the limbs broke off "centuries back" (was "a thousand years ago": the tree was killed about
  four hundred years ago, and the tic). Ya's "Two days" kept (Day 14 → under it on Day 15 evening).
- **`ah_hub`** (both leads), **`ah_forage`** (+ the truffle fail line), **`ah_hunt`** day 1 (+ the hares' fail line),
  **`ah_hawks_won`** day 1 (+ "The meat keeps a heat of its own."), **`ah_hawks_lost`** ("holy" kept: the great
  root-kin's line answers it): reworded, beats kept.
- **`ah_scout`**: the pigment clings "after all these centuries" (was "a thousand years later"; the Founder is about four
  hundred years back). The inscription is word for word. Both result lines reworded ("for a long time" out).
- **`ya_offended`**, **`ya_found`**: reworded. The waited branch no longer says "at dusk" (waiting costs 120 minutes from
  any hour) and now has her gutting the hare at the camp's edge, so "The knife stops" fits both branches.
- **`trio_kiss`** (+ both results), **`ah_ridge_end`** (+ both results), **`ape_lured`**, **`ape_won`**, **`ape_lost`**:
  reworded, every beat kept (Mei Lin "didn't say yes to anything", the crimson rags, Ya's mother, the spear-head). "for a
  long time", "the far side", "the way a tree" out.
- **`bl_train`** opener: reworded.
- **`talk_mei`** beats 0, 1 and the settled text; **`talk_ya`** beats 0, 1 and the settled text: reworded. Made
  region-neutral, because the first talks can fall in any region: Mei Lin's "fern" → "stem"; Ya "bounds off up the root"
  → "lopes off ahead"; Ya "on the edge of the road" → "on the lip of a drop" (the thirty metres kept). "her herb-knife" →
  "her knife" (favourite phrase).
- **`bl_camp`** (Root Road and Ashen Hills openers, the stakes' fail line); **`bl_fireside`** Root Road, Drowned Wood
  night 1, Ashen Hills: reworded. Ashen Hills: "Tomorrow, or the day after, you'll walk into it" → "The day after
  tomorrow you walk inside" (that fire is Day 14's; they enter on Day 16).
- **`ya_romance`**: same level, same beats and Yuki's line. Made to fit day and night in any region: the day branch is
  "off the path and round the nearest thing big enough to hide two people" (was "between two great roots"); "the cold hill
  air" → "the cold air"; "the moss and the bedroll" → "the bedroll"; the dead tree is "away to the north … as it has for
  centuries" (was "far off over her shoulder … thousand-year-old patience"). The day result: "the moss in your hair" →
  "gives your hair a single look" (ash or moss). The opening simile is "kisses as she hunts" (your Fallout's
  `fo_ya_night` already has "kisses the way she fights").
- **`mei_bond`**: reworded. "two days and a dead tree" → "a few days and a dead tree" (by day it can be Day 11); the day
  branch stops "where the way bends out of their sight" (was "a great root", wrong off the Root Road); "the opposite of
  the first time in the herb loft" → "with none of the herb loft's hurry"; "She turns the wolf-tooth Ya gave her — or the
  herb-knife, or nothing at all" → "Her knife turns over and over in her fingers" (Ya never gives her a tooth on any
  path: `ya_found`'s second choice only sends Ya "to find a second wolf").
- **`friends_watch`**: reworded (+ a CW line, below).
- **`bl_night`** (Root Road and Ashen Hills openers); **`bl_night_event`**: wolves, drowned day 1, serpent day 1, hawks,
  lights day 1, song, rut, warm day 1, rain day 1, mei day 1, stars, the lights' fail line: reworded. "for the first time",
  "it turns out" out. Lights: "low among the trunks" → "low to the ground" (also shown in the Ashen Hills); the fail line
  no longer names trunks. `mei` day 1: "They looked like people from Ashfall" → "They were people like Ashfall's" (the
  event can fall on the first Drowned Wood night, before she has seen one).
- **`bl_night_won`** day 1 (both branches), **`bl_night_lost`**: reworded; "a great deal of shouting" → "a quantity of
  shouting". Neither promises a full night.
- **`bl_morning`**: the no-breakfast line (a grub on Ya's knife: the hub's hunger line already has the beetles) and all
  five mornings. Day 13: "the far side of your own raft" → "the other end". Day 15: "Nobody says much over breakfast" →
  "Nobody has much to say" (there may be no breakfast). The fallback: "waited for a thousand years" → "It has had
  centuries of practice."
- **`heart_view`**, **`bl_end`**: reworded, every branch. "the song your roots have been missing" → "the part of the song
  the roots have been missing" (it is the Old Tree's roots, `rr_roots`). `bl_end`: "a thousand years dead" → "long dead"
  (James doesn't know the dates yet; the tree died about four hundred years ago). The doctorate / gift sentence still
  echoes the prologue's on purpose.

## Task 2 (FL): the flirts' set 1
- `DR_YA_FLIRT` set 1, entries 1–4 rewritten (the 5th kept): sizes him up like a bone-elk after a hungry winter; the slow
  circle "as she does round a kill she hasn't yet decided how to carry home"; "getting better" and she acts out the
  before; the sniff under the ear, "the scholar can be taught". Sets 2–3 share none of these.
- `DR_MEI_FLIRT` set 1, entries 1–3 rewritten (4–5 kept): "Impossible" with the smile getting out; the fine "payable to
  the elder"; the look behind her from habit, then the laugh and "a woman pleased with a theft".

## Task 3 (KO): `DR_YA_OFF` sets 2 and 3 (new)
Set 1 entry 1 rewritten: "Her teeth come out, and she walks on ahead. She will get over it. Probably."
Set 2, sulky and showy (20–33 words each):
1. Ya stops talking. Entirely. She moves ten paces off to one side and walks there with her chin up, being silent at you as loudly as she can manage.
2. The silence again, and today it has props: she climbs onto the nearest high thing, turns her back, and whets the spear slowly, one stroke for every word you said.
3. She digs the best thing out of her pouch and presents it to Mei Lin, with ceremony, where you can see. Mei Lin holds it like somebody else's quarrel.
4. She limps. Nothing is wrong with her foot; a moment ago it was the other foot. She limps until she is sure you have seen, and then outruns you uphill.
5. By now even Ya is bored with sulking. She manages forty steps of wounded silence, sighs like a bellows, and comes back to walk next to you, as a favour, not speaking. Mostly.

Set 3, she turns it back on him (29–35 words each):
1. "Knock it off," she says back, in your voice, with your face on. The likeness is fair; Mei Lin has to look somewhere else. Ya is not laughing, and soon neither are you.
2. She wants to know what it means: knock what, off what? You explain. "Stupid words," she says. "In mine you just bite. Then everybody knows." She shows you the teeth, for clarity.
3. "You write everything down," she says. "Write this. The scholar asked for quiet, and got it." She then says nothing for most of a quarter of an hour, and it visibly costs her.
4. She steps in near enough to count your eyelashes. "When you want me to stop, say it with your hands. Words are for the herb girl." She is gone before you have either ready.
5. Today she only looks at you, tired of it. "Five times you tell me what I'm not to do," she says. "Not once what I should. Think about that, scholar. I'll be in front."

## Task 4 (CW)
`DR_COOK` ("bl_camp:0"), 27–35 words each, no region detail, no named dish:
1. You fill the other bowls first, from habit. Ya empties hers and watches yours like a snare. Mei Lin calls it "quite adequate", in her temple voice, and scrapes the pot.
2. Ya sits right by the pot tonight, to save walking. Mei Lin asks what you did with the herbs, one professional to another, and forgets to look unimpressed by the answer.
3. (function, YF) One piece is left. Ya looks at it. Yuki looks at Ya. [cat: *Mine,* says the bond. / great root-kin: *Mine,* says the bond, from some way up. / human: "Mine," says Yuki, pleasantly.] You cut it in half, and neither of them forgives you.
4. Mei Lin says "Oh" at the first mouthful, out loud, and then looks round for her mother. Ya tells her the noise was correct, and to make it again at the next one.
5. Nobody speaks until the pot is empty. Then Ya says you are to cook at her funeral. Mei Lin says funerals don't work like that, and hands her bowl back to you all the same.

The 3 throwaway lines (one each by Ya, Mei Lin, Yuki; James deflects or says nothing):
- `bl_fireside`, Root Road, first paragraph, **Ya**: "Ya mentions, chewing, that you gave the best piece away again, which among wolves is how you tell who feeds the litter."
- `talk_mei`, the settled text, first paragraph, **Mei Lin**: "She adds that you hum when you cook, and that it gives you away; you say the humming is for the fire."
- `friends_watch`, a new third paragraph, **Yuki** (indirect, so it fits all three forms): "Later your arm plays something low and droning, with a woman's voice far inside it. Yuki remarks, to nobody, that you only put that one on for people you like. You say it was next in the queue." (Generic music only; at camp, not on a hunt.)
These three texts run over the ±25% length for that reason (talk_mei's settled paragraph +21 words, the fireside paragraph +21, friends_watch +36).

## Task 5 (SW)
`DR_BL_DART` ("bl_train:1"), 21–25 words:
1. Twenty paces, then thirty, then forty. Somewhere past thirty the knot stops being a knot. Ya says it had that coming.
2. You begin where you stopped yesterday. The darts no longer sag at the end of their flight; you have stopped asking them to hurry.
3. Fifty paces. Ya stands next to the mark to make it interesting. You make it less interesting than she hoped, and she is impressed, slightly.
4. Mei Lin picks the mark today, a small one, to be awkward. Three darts land in it, touching. She says she meant another.
5. From so far back that Ya has to walk out and report. She comes back slower than she went, which is the report.

`DR_BL_NEEDLE` ("bl_train:2"), 22–25 words (no hundred, no knuckle-width, no thread count: those are the Wilds'):
1. One needle at a time, grown slowly, each as fine as the one before. By the end even the omnitool can't tell them apart.
2. Finer than yesterday's. You hold one up against the light and lose sight of it. Mei Lin asks, professionally, whether it would take a thread.
3. Slow enough to hear each one arrive. Ya watches for a hundred breaths, announces that nothing is happening, and stays to watch more of it.
4. Eyes shut today, by feel, each needle set down next to the last. You look afterwards: a row straighter than you could have drawn.
5. Slow, exact and at last boring, which is what a drill is for. Mei Lin says you looked almost peaceful, and sounds suspicious.

## Task 6 (YF): every byForm in my lines
- **Line 1296, `bl_night_event` wolves** (the sheet's cat-only text): "They have seen the cat." → "They have seen Yuki. Yuki has seen them." Fits all three, no new code.
- **`bl_night_event` warm, day 1** (a second cat-only text with no switch): "Yuki, displaced, settles on Ya's hip" → "Yuki, displaced, takes over the warm place Ya left by the fire and glares at you from it" (a tiger or a woman can't settle on a hip).
- **`ape_won`**: Yuki's "*It knows we're here,*" is bond speech with no switch; it now ends "she says, for you alone" and she "keeps you company" (no sitting posture), so the human form using the bond reads as a choice (she won't break into Ya's moment).
- `ah_hunt` day 1: Ya's line: cat "It's the cat they want." (rewritten) / great root-kin "They won't go for the cat. Not that cat." / human "They'll go for the small one." (kept). Yuki "on your shoulder / at your side / at your elbow" lays her ears back (all three have the ears) and "passes you a thought" (fine for the human: still bonded).
- `ah_hawks_won` day 1: cat "rode out the whole fight on your shoulder, claws sunk in, spitting — jumps down onto it, and sits there" (rewritten) / great root-kin puts one paw on it and sits / human puts her foot on it and stands (kept); the shared tail now reads "glaring up at the sky in case another one feels like trying". "Little queen" kept for all three (for the great root-kin it is Ya's joke; day 2, yours already, repeats it).
- `friends_watch`: cat "the three of you and the cat," / great root-kin "the three of you and one very large cat," (was the cat's wording) / human "all four of you,".
- `bl_fireside` (three / three / four; The three / The three / The four), `heart_view` (Mei Lin "on Yuki's other side" / "against Yuki's great white flank" / "on Yuki's other side"; the lie-down line: cat and human "Yuki takes the exact centre", great root-kin "lies down round all of you, and counts that as the exact centre"; *Tomorrow,* / *Tomorrow,* / "Tomorrow," aloud), `bl_end` (on your shoulder, claws in / at your side, claws out / at your shoulder, claws out): reviewed, each fits its body; reworded around them only.
- The great root-kin's extra lines in `ah_hawks_lost`, `ape_lost`, `bl_night_lost` (cat and human empty): reviewed and left; the cat and the human have nothing to add there, and the texts around them still lead in ("holy"; "two voices" → her "Three voices").
- `trio_kiss` ("Yuki, next to you, is putting in none"), `ya_romance` (a bond thought from "somewhere close by"), `mei_bond` ("Ya and Yuki draw ahead"), `DR_STAKES`: form-neutral already.
- New: `DR_COOK[2]` (above).

## Task 7 (continuity) fixed in my lines
The calendar: `bl_fireside` Ashen Hills ("The day after tomorrow"), `mei_bond` ("a few days"). The tree's age: `ah_enter`, `ah_scout`, `ya_romance`, `bl_morning`'s fallback, `bl_end` (no "a thousand years" for things four hundred years old). Region-proofing: `talk_mei` 1, `talk_ya` 0 and 1, `ya_romance`, `mei_bond`, the lights. `DR_LIGHTS[0]`, the night serpent's "bank", the ape's intro, `ya_found`'s "at dusk", the `mei` night event, Mei Lin's wolf-tooth: as listed under task 1. Nights: no text in my lines promises a full night after a fight. His look: only the coat (holes) appears. Sensing: nobody in my lines senses his Qi.

## Continuity problems found and NOT fixed
1. **`ht_start` / `heart_gate` (act1_heart.js, not this part) against `heart_view` / `bl_end` / `ah_enter`:** `ht_start` opens Day 16 with "The forest stops. Not gradually. One moment there are black trunks and grey moss … the next, a clearing half a kilometre across … in the middle of it, the tree", then "Cross the clearing", and `heart_gate` has a crack "wide enough to drive a cart through". But the forest already stopped at `ah_enter` (Day 14, the burnt hills), and the party slept **in the roots** with the doorway in sight (`heart_view`), which is "wider than it was last night. Not by much" in `bl_end`. I kept the Blackroot's version (its beats are fixed by the brief) and left the distance to the doorway unstated; the Heart's opening needs the fix in its own part (start it at the doorway, or have them walk out of the outer roots).
2. **`ah_ridge_end`, the lure's success line:** "Your darts have one of its eyes" assumes he can sing darts; the choice has no `hasForm(g, 'dart')` gate. Code or a neutral wording ("your bone") is Claude's call.
3. **`ya_found`'s `place:`** is "a burnt gully" on the waited branch too, where she comes back to camp. **`mei_bond`'s `place:`** is the Ashen Hills even when reached by day from `talk_mei` in another region. Both are `place:` values (not mine to change).
4. **`trainLeft` / `bl_train`'s label** "Darts at a knot in the bark" is shown in the Ashen Hills too ("A level floor of ash between two ridges"); my dart replies say "the knot" once (day 1) and "the mark" after.
5. **`ya_found`'s second choice** ("give one to Mei Lin, too") ends with Ya going "to find a second wolf"; nothing later hands Mei Lin a tooth. I removed the one place that assumed she had it (`mei_bond`).
6. **`bl_night_event` song** has Mei Lin's "That was beautiful", and run 1's `dw_serpent_won` has her say the same words about Ya on the serpent. Kept here (it is this scene's beat); run 1 may have changed theirs.

## Label suggestions (not edited)
- `bl_train`: 'Darts at a knot in the bark, from farther and farther.' → 'Darts at a mark, from farther and farther.' (no bark in the Ashen Hills).
- `ah_hunt`: 'Take the hawks before they take Yuki.' → with the great root-kin Ya has just said they won't go for that cat; a form switch on the label ('Take the hawks.' for the great root-kin) would fit, if labels may switch.
- `ya_romance`: 'Find your clothes. Catch up with the others.' is fine; `bl_fireside` 'When Ya takes your hand and tugs you toward the dark, go.' fine.
- `bl_night`: 'Mei Lin and Ya together; you and a thread after.' → 'Mei Lin and Ya together; you and a watch-thread after.' (clearer for a reader who skipped the paragraph).

## Run 3


Working copy /tmp/rw-p5, `js/story/stomp_act1.js`, lines 92–299 only (the ten entries `bone_elk` … `night_hawks`; lines 1–91 and
300 onward are byte-identical; the line count is unchanged). Not committed. A copy of the file as I found it:
/tmp/rw-p5-info/stomp_act1.before-run3.js.

Checks I ran: the sheet's load check and the brief's (both print "loads"); no TODO in my lines; a script
(/tmp/rw-p5-info/chk3.mjs) that renders every text (3 postures, 2 wins, the one-move line) of all ten entries as cat, great
root-kin and human: every text within ±25% of the old one's length, none with "undefined"; the listed tics: none in my prose
(the only hit is "four hundred pounds", which comes out of `yuShort(g)` for the great root-kin in three texts, see YF); every
`${...}` kept (18: the ten `pick(d, …)`, `meiOn(g)`, `yu(g)`, 3 `yuShort(g)`, 3 `yukiForm(g) === …`), every signature
unchanged; five-word runs against the rest of `js/`: what is left is the scenes' own dialogue, kept on purpose as story facts
("You can come hunting with me any time", "You came in after me" / "Obviously" / "Who'd stitch me?", "It knows we're here",
"I've wanted to kill that") and place names ("the split in the great root"). Words (as cat) 3,926 → 4,356 (+11%).
The tests were not run. No test pins a Blackroot stomp string (I looked for them in tests/).

## Per entry (what changed, why)
- **`bone_elk`**: all rewritten. Degree 2: the bone hoop now breaks the elk's neck (the old text never said how it died), Ya's
  cut is "a butcher's cut and a kind one" (the scene keeps the surgical residency; the stomp no longer copies it). Both wins
  keep Ya on it with the knife, "You can come hunting with me any time", the shed antler-tine, warm, the Convergence's
  interest, the hammerspace. Degree 3 keeps the antlers changing sides, the elk sitting like a dog, "Marry me / teach me / both".
- **`root_wyrm`**: all rewritten. **Continuity:** the posture had Ya say "That one ate my mother's spear"; the mother's
  spear-head lies in the rot-ape's bone pile (`ape_won`), and `rr_end` has her say she watched the wyrm eat a bone-elk whole,
  antlers first → now `"Antlers first," she says. "A whole elk. I watched."` "herb-knife" (favourite phrase) → "her knife".
  Wins keep: nobody touched, the four on the lip of the split, Mei Lin winded from shouting, "since I was nine", the question,
  the unfinished "you fight with—", the scales, Mei Lin softening and stopping it. Degree 3: "pinkie" → "two *fingers*"
  (it is what he moves in that text); "the way people glance at the sea" (tic shape) → "as people do with weather".
- **`mire_serpent`**: all rewritten; both wins keep Ya's ride, "You're insane", "That was beautiful", neither of them having
  heard it, the roast. Degree 3: the ride is now in the text (the old one only had her drag it back).
- **`drowned`**: all rewritten. The posture now says what they are ("before the flood, before the bad Qi decided to keep
  them") and that Mei Lin is under them (she went under in `dw_hollow`, just before). **Continuity, degree 3:** the old text had
  Mei Lin back away from James in fright and fall into the hollow; she is already under the water when the fight starts, so
  she can't. Now Ya goes under before his hand is up, "nobody saw it", and afterwards Ya looks at the flat water and at him
  and "for once has nothing to add" (the old closing beat, kept). Ya's wound was "a drowned branch" at degree 3 and the
  drowned woman's nails at degree 2; both are now nails, elbow to wrist, as in the scene. If the owner wants Mei Lin's fear of
  what James did back, it needs her to see it: a sentence after she has coughed the water out.
- **`cinder_hawks`**: all rewritten. Degree 2 posture line: "You have a body made of composting" (unclear) → "Bone, as it
  happens, burns badly." Degree 3: the haul is +2 hawk in `ah_hawks_won`'s `enter`, and the old text left all three hawks
  alive and sulking; Ya now "makes two of them into supper and the third into a warning". "Little queen", the title allowed,
  "Umbrella man" and "something filthy" kept.
- **`rot_ape`**: all rewritten, the weight kept (the hand on its face, the spear-head in black leather, Mei Lin at her side,
  Ya leaning, Yuki's line). Posture: "drops off the ridge" → "leaves its rock" and "Its eyes are not" → "nothing so green
  or so living in what looks out" (run 2's fixes: it sits in the notch; it may have one eye after the lure). Ya's "It killed
  my mother" → "That's the one my mother didn't come back from" (`ah_ridge_end` has just said "My mother tried").
  **Continuity:** degree 3's "Twenty years" → "Fifteen years" (the ape took her mother when she was twelve; she is 27;
  `talk_ya` says fifteen). Degree 3 dropped "cross-eyed" (one eye, after the lure) and "for the first time" (tic).
- **`night_wolves`**: all rewritten; "Breakfast walked here by itself" (the haul is wolf meat); Mei Lin finds no cuts and goes
  back to bed.
- **`night_drowned`**: all rewritten to follow the new `bl_night_won` (the drowned go under as if grateful; Mei Lin sits
  hugging her knees until morning; Ya sits with her and makes no joke). The old degree 2 was the scene's old "good practice /
  cleans your cuts" sentence (run 2's note): gone. "Somehow that's worse" → "Nearer would be simpler."
- **`night_serpent`**: all rewritten. No "bank" and no "river" (the camp is a raft of trunks in the Drowned Wood): it comes "in
  over the trunks" and its decision is "*the swamp*". The "good practice" sentence is gone (Ya: "the night owed her a longer
  one than that").
- **`night_hawks`**: all rewritten. The "good practice" sentence is gone. The haul is +1 hawk: degree 2 has "one bird for the
  morning's pot"; degree 3 had both hawks alive on their backs, now one reviews its choices and the other "is breakfast".
- **The nights:** no text in my lines promises a full night; the wins end with people going back to bed or sitting up.

## YF (every mention of Yuki in lines 92–299)
- `mire_serpent` posture, degree 3: `${yu(g)}` (on your shoulder / the size of a tiger and twice as bored / in her human
  form, arms folded) "looks at the serpent, then at you. The question is plain enough: may she have it." Fits all three.
- `root_wyrm`, both wins: "the four of you" (Yuki counted); nothing form-bound.
- `cinder_hawks` posture: the `yukiForm(g) === 'cat'` switch kept: cat "on your shoulder, and has views" / great root-kin and
  human "not, today, anything a hawk should pick" (the old "not, today, very small" was wrong for a woman, who is the small one
  for Ya in `ah_hunt`).
- `cinder_hawks` degree 2 win (the switch kept): cat "drops from your shoulder onto the last one down, sits, and watches the
  sky for volunteers" / the other two `${yuShort(g)}` "pins the last one down flat" (the old "with one paw" was wrong for the
  woman).
- `cinder_hawks` degree 3 win (no switch; `yuShort(g)` only): "strolls over and takes possession of the heap" (the old "sits on
  all three of them at once" didn't fit a small cat). "Little queen" for all three, as in the scene.
- `rot_ape`, both wins: "Yuki stays by you, watching the dead tree. *It knows we're here,* she says, on the bond, to you
  only." (no "sits beside you"; the woman uses the bond here so as not to break into Ya's moment, as in run 2's `ape_won`).
- `night_serpent` posture: "It samples you. It samples Yuki." Form-neutral.
- **`night_serpent` degree 3 win (the sheet's "Your cat,"):** fixed without new code. Ya now says `"That one," … tipping her
  chin at Yuki, "is the worst thing I ever met. Except you. Except — no. Her."` The existing `yukiForm(g) === 'tiger'`
  expression is kept with new words: great root-kin "a white cat that size" / cat and human "anything, of any size". The tea
  is no longer answered by "the river" (see above).
- `night_hawks` posture, degree 1: "They're after the food. And Yuki." → "and anything else small enough to carry" (the great
  root-kin isn't).
- **Not fixed, by the sheet:** `yuShort(g)` still prints "Yuki, all four hundred pounds of her," for the great root-kin in three
  of my texts (`cinder_hawks` degrees 2 and 3, `night_serpent` degree 3). I kept the expression, as told; changing the phrase is
  one edit at line 14 (outside my lines; other fights use it).

## CW
None in this run (the sheet). No new lines.

## Label suggestions
None: no labels in these lines. (Run 2's remark on 'Take the hawks before they take Yuki.' stands.)

## Continuity found, not fixed (outside my lines)
1. `act1_return.js:274` tells Ya's childhood differently from `talk_ya`: "an old hunter who found her in a burned village at
   four … and died when she was twelve" against a wolf den and "the ape got her, at the pass". My texts follow `talk_ya` and
   `ah_ridge_end`.
2. `STAKE_LINES` are not shown at degree 2 or 3 (the posture replaces the whole intro), so a staked camp's wounded first
   attacker goes unmentioned in a stomp. Harmless (the fight is a walkover), but if the owner wants it, `posture` would need the
   flag: code, Claude's.
3. Degree 1 of every `pick(d, …)` is written and kept, though power.js shows the original intro at degree 1.
4. `night_serpent`'s tea: nothing in the Blackroot scenes says who brought tea; I kept it as the old text had it (it is the joke).

