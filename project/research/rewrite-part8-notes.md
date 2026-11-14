# Part 8, run A: notes (the Long Forest's scenes; js/story/longforest.js, lines 212–630 of the working copy)

Checks: the file loads; no DY/YF TODO left (RP and SW TODOs untouched). All edits sit between `const lfTrailArt` and `/* ---------- Yuki's forms ---------- */`.
Code added: only the one allowed `${byForm(g, 'the cat', …, …)}` in Fang Wei's meeting. No label, id, flag, condition, number or `${…}` changed.

## Tests that pin old wording (for Claude; I did not touch tests)
- `tests/story.test.mjs` 2179 (NQ1, lf_notes): cat is now "reaches down and adds an entry of her own with one claw: a single scratch, which you decide"; tiger "reaches round and adds an entry of her own with one claw: a single scratch, through that page and the next six, which you decide". Human unchanged (not an older line).
- `tests/story.test.mjs` 2180 (NQ1, lf_human_lost): cat "Yuki sits on your chest until you move. Through the bond: *we are coming back"; tiger "Yuki plants one forepaw on your sternum, which is plenty, until you move. Through the bond: *we are coming back". Human unchanged.
- Kept on purpose so tests stay green: `lf_exit`'s "Yuki's opinion, through the bond: *both.*" (cat and tiger; also because the yk_path paragraph that follows places her itself); "The calendar starts again: Day 4." (tasks.test 2079).
- The other story.test failures in this copy ("text renders in lf_falls / lf_ride / …") are run D's RP TODO placeholders (shorter than 40 characters), not these texts.

## Per scene
- **hubText, the four hours:** reworded each; same images (the sun with nowhere to be → "no other appointments"; things reconsidering eating him; the long list; the colours put away).
- **hubText, DY:** day 0 filled: "The days are not being counted here. You checked your own head for a tally, found none, and left it that way." (21 words). The later branch rewritten time-neutral ("You have stopped counting the days…", no "a while ago").
- **hubText, realm lines:** all three reworded; the lowest is now knowing (CO): "a week whose ending you have already seen. It can wait." Hungry / hurt lines reworded.
- **lf_enter (CO):** now a man who knows the week (the scream on the fourth morning, the village, the Sect, the tribute on the seventh day) and stays lost to find out how far he can climb. Beats kept: smoke on the wind, the sensible thing, the root / hands / cat, "eight or nine hundred years", camping, the very long nap, "the most dangerous thing in it". "the forest that has been trying to eat you all day" became "did its best to eat you the last time through" (he can enter straight from the arrival).
- **lf_hub results:** rest line, sleep line and the river-cress line reworded; mechanics kept ("HP and Qi full.", "+3 River cress."). "needs 10 Qi" left (mechanical; a test reads it).
- **lf_morning:** all six lines and both realm lines reworded. The threads no longer "ask politely" (lore: threads are instincts, never a voice): the count of days "has quietly stopped, and not one of them has reported it as a fault". "these days" removed from the realm line.
- **lf_exit:** all three realm lines reworded ("a good deal" gone; the lowest now "not much stronger", true at Foundation too). Third paragraph (CO): suspected last time, now tested on beasts, bandits and one herb-poacher. "very funny or very short" kept word for word.
- **Forage / hunt / spar failure lines:** bees, leeches, fowl, spar reworded. FX: the hare's miss is "A wink of glass in the reeds, and your dart finds mud." (the Wilds keeps "Rainbows, then nothing.").
- **lf_falls:** reworded; the metaphor joke kept (the second choice label depends on it). Both result lines reworded, "−4 HP." kept.
- **lf_ride:** reworded; same beats (no saddles, trunks like stairs, the view, "*you are welcome.*"). The reply is not an older line: untouched.
- **lf_tree_view:** reworded, serious; "Familiar in a way that" (tic) gone; the closing no longer talks about "the story" taking him there: "a thing that will still be standing when the road gets round to it". Nothing about what is inside.
- **lf_notes (CO):** the key finding is "suspected last time and now confirmed on a proper sample". "the local fauna has stopped attempting predation" became "attempts predation less often than it did" (true at any realm). Em dashes replaced with brackets.
- **lf_bored:** both openers reworded; FX "for a long moment" gone (she lets the mouse cross the clearing twice). "the most powerful thing" is now "arguably, the most dangerous thing" (the scene shows at any realm). The bone mouse and *publishable* kept. The reply is not an older line: untouched.
- **lf_bathe:** FX "several weeks of forest" → "a layer of forest you had stopped noticing"; the body "is changing" (time-neutral).
- **lf_white_stag:** reworded, serious; tics gone ("light comes down", "a long time", "the way a guide"). Yuki's silence kept.
- **lf_seclusion:** the four seasons, the closing and the saturation line reworded; result line's prose reworded, "+40 satiety. HP and Qi full." kept. "three days" and "bored for weeks" stay: they are inside a narrative season, not a count of forest days.
- **The four zones and the ridge's realm lines:** reworded, each image kept and kept distinct for run D (the valley inside the valley and the felt skeletons; the ink water and the logs; the glass rock and the sky's habit; the roots like temple pillars and "the memory of one").
- **lf_storm:** reworded; the lightning's checklist kept word for word; the em-dash break is now a comma and a new paragraph.
- **lf_trial_won / lf_trial_lost:** reworded; same beats (a little less of him agrees; Yuki leads it through a thorn thicket; "what the Long Forest is for").
- **lf_wanderers:** both meetings reworded; "Only a mortal." kept.
- **lf_human_talked:** both reworded (the bracket fungus lecture and the copper; the invented symptoms). Gain line: "(left behind at a dead run)".
- **lf_human_won:** both reworded; "Otherwise what was the point." and "Lost," kept. "sewing up for a week" → "an evening with a bone needle" (no week count).
- **lf_human_lost:** reworded so it fits both encounters: no "they", and "the mortal in white" (the Tans say robe, Fang Wei sees a coat). Result line: "A share of your food changes owners."

## YF spots
- **lf_morning, line 0:** cat on "the same square of your chest"; great root-kin "the same great white flank along your back, giving off heat like a kiln"; human "asleep back to back with you, her tail dropped over your ankles like a scarf" (neutral on sister / lover).
- **lf_seclusion, autumn:** cat "a man-shaped hummock with a cat on top", bored through the bond; great root-kin "a man-shaped hummock in the lee of a much larger white one"; human leans on the hummock picking leaves out of her tail and says it aloud ("I want that entered in the record.").
- **lf_trial_won:** cat washes a paw twice, "adequate"; great root-kin "one enormous paw"; human straightens a sleeve twice and says "Adequate," aloud.
- **lf_storm:** cat "From under a rock"; great root-kin "From behind a boulder that hides perhaps half of her"; human "From the dry side of an overhang, Yuki says it aloud: "Show-off.""
- **lf_wanderers, Fang Wei (the allowed byForm):** 'the cat' / 'the white beast with no more Qi on it than a house cat' / 'the silent woman in black silk'.
- **lf_notes:** cat reads from his shoulder and reaches down with one claw; great root-kin reads over the top of his head and scratches through seven pages; human unchanged (not older).
- **lf_bathe:** cat watches in horror from the rock; great root-kin wades in, hates it, and shakes the river onto him; human on the bank: "No," she says, before he has asked anything (aloud).
- **lf_bored:** two-way as before (human aloud from a root; cat and great root-kin plant themselves in front of him, one word in the bond). The body text said "None of this impresses a cat": now "…a cat, in whichever shape the cat is wearing", so it fits all three.
- **lf_exit, lf_human_lost:** switches reviewed; exit kept as it was, lost's cat and great root-kin reworded, human untouched.
- **No switch, checked for all three forms:** the river-cress line ("lays three stems … on your chest"), morning line 4 (on the flat stone), spring's fish, trial_lost's detour, talked's "watches him out of sight", the stag ("as white as Yuki").
- **Form-bound and left:** `lf_enter` says "the cat" (the sheet: she is always the cat at the entry). `lf_ride` names her great form (the ride is in that form whatever she wears at camp).

## CW lines (2)
- **lf_wanderers, the Tan brothers, Little Tan:** "The narrow one adds that your cooking smells as if somebody is expected home for it, and is looked at until he stops." James says nothing. (He is "the narrow one" because he has no name yet at that point.) This puts the scene about 30% over its old length.
- **lf_human_won, Fang Wei:** "He had watched your camp one dusk, he tells the sky, and heard the music from your sleeve, low and strange and sad, and had judged that a man who sat at his fire with songs that soft could not be dangerous." James answers only the next question ("Lost"). Generic music, no names. About 40 words over the old length.

## Label suggestions (not edited)
- lf_hub: 'Wash in the river. You have been in a forest for a long time.' → 'Wash in the river. The forest has been accumulating on you.' Reason: it shows on the first screen of day 0, and "a long time" is also on the tic list.
- lf_hub: 'Follow the smoke toward people. (Advances the story: you will meet Mei Lin.)' → 'Follow the smoke toward people. (Advances the story: Day 4, the scream.)' Reason: on Coil 2 he knows who is screaming; "you will meet" reads as a first Coil.
- lf_wanderers: 'Talk your way past them. You're very good at being underestimated.' → '… past whoever it is. …' Reason: Fang Wei is one man ("them").

## Continuity, found and not fixed
- `lf_notes`, the subject line: "The sky has tried to strike me ${realm} times": lore says the sky visits James only at realms 3–14 and not at 10 and 11, and at Mortal Vessel the note reads "0 times … 0 times". Kept (the expressions are code); it reads as a joke.
- `lf_exit`, third paragraph, and `lf_notes`: both say he tested it on bandits and a herb-poacher; a player can leave without meeting either. Kept as the sheet words it.
- `lf_wanderers`, the Tans: "You haven't heard of them" is exact on Coil 2; from Coil 3 he may have met them in an earlier Long Forest (they wouldn't remember; he would). Run D's second meeting covers the same Coil only.
- `lf_human_lost`: the result line and the scene still imply more than one robber after Fang Wei alone ("changes owners" and the passive text avoid "they", but the title "Robbed" and the art are shared). Fine as is.
- `lf_morning`'s title "Another Morning" and line 0 ("the same … the same") also show on the first morning only by rotation (line 0 comes at mornings 6, 12, …), so no clash.
- `lf_trials` (not mine, never drawn): "restocked itself by the next morning" counts mornings; for the later part.
- `lf_forage` (not mine, never drawn): "You know every good patch for a day's walk … now" assumes time spent; for the later part.
- Both CW lines assume he has cooked or played music at the camp before the meeting; on a first-hour walk of day 0 that is a small stretch (the brief names these homes).

# Part 8, run B: notes (the Long Forest's ten fights, the stomp texts)

File: /tmp/rw-p8b/js/story/longforest.js, the `registerStomp({ … })` block only (lines 71–208; the block ends at line 208, the
sheet's "71–211" runs on into the scenes header and the `lfTrailArt` comment, which I left alone). All 72 strings rewritten
(about 2,820 → 3,000 words in the block, code included). No code changed: same keys, same `aside(d, a, b, c)` order (even /
outclassed / crushing), same `byForm` entries and order, `win[3]` of the bandits still takes `(g)`. Not committed.

## Per fight (what changed and why)
- **lf_bone_hounds**: kept the wind-chimes and "They are serious. So are you." Win 2: one hound lies still and the scarred one
  whines (the old text had both whining and then one dead); **"the cores" → "the core"** (the loot is 1). Win 3: "fold up like
  dropped laundry" was already the prologue jackals' one-move line: now "puppets whose strings were wanted elsewhere".
- **lf_ossuary**: the hiss is an hourglass now (the zone scene already has cathedrals for the ribs). "The numbers are smug" kept.
  The crushing aside is a thread opening a file (threads are instincts, never a voice). Win 2 says "the two cores"; win 3 now
  also takes the bone-meal (the loot gives it at every degree).
- **lf_mire_brood**: the boots ladder kept. Win 3 and the one-move line: see "Continuity" (they no longer taste *him*).
- **lf_bog_mother**: "It lasts four seconds" went (Act 1's brawl finish is "Four seconds."): the four beats are still there,
  uncounted. Win 3 now also takes the 2 ghost-gills (it only took the cores). The bubbles kept.
- **lf_storm_hawks**: see "Continuity" ("They want your Qi"). Win 3: "contemplating their life choices" was the Act 1 cinder
  hawks' joke: now they look at the sky "as if it had let go of them".
- **lf_thunder_ram**: the ladder kept. Both wins: the ram he fought lives; the cores and the roast come from the second ram
  that went off the ridge (so the loot's 2 cores have a source). Read daily, "the other ram" still works: there is one each time.
- **lf_root_lurkers**: tightened. "faint, cracked, but yours" → "but in the key of home" (says no more than the High Spur scene).
- **lf_heartless**: kept sad, no jokes added. "the way grief does" → "as grief comes" (the tic list; and grief coming back suits
  a fight that returns every day). Selene and the tree's inside are not named.
- **lf_bandits**: the speech, the dung, "toll", the dents, the eighteen ancestors, "No, to both" all kept.
- **lf_rogue**: the mycologist and "Lower than that" kept. See "Continuity" for two fixes.

## One-move finishes
Only the ram keeps the "One X. One Y." shape ("One door of bone. One ram. The door wins."). The other nine are varied, and none
repeats a finish from stomp_prologue.js / stomp_act1.js (no "You look at it", no "It kneels" as a closer, no "One finger on its
forehead", no "doesn't even open her eyes").

## YF spots
- **Tan brothers, posture** (`byForm`): cat: "With a *cat*." Great root-kin: he breaks off, looks at her properly, and says
  "*Cat*." anyway ("A rehearsed man does not improvise."; the old "for the first time" is gone). Human: "With a *lady*. In *silk*."
- **Tan brothers, win 3** (`byForm`): cat in his lap / her head in his lap / next to him, eating the rest of the jerky.
- Lines with no switch, made to fit all three bodies: hawks win 3 "Yuki eats a beetle" → "has found a beetle and gives it her
  whole attention" (a woman in a qipao eating a beetle read oddly); ram win 3 "sits beside the stunned one … purring" → "keeps the
  stunned one company all evening, perfectly content"; Heartless win 3 "presses her flank against its leg" → "leans against its
  leg for a breath". The rest (yawns, sits on a hound, walks the Wyrm nose to tail, hadn't stood up) fit any form as written.

## CW lines
None (not in this run).

## Continuity: found and fixed inside my lines
1. **Beasts can't sense James** (the brief; the field notes). Mire-brood win 3 had them *taste* "whatever you are". Now the
   Ouroboros turns once and the water round his boots runs clear, and that is what they taste. This shows the loop cleaning the
   water he stands in, which no other text shows: if the owner would rather not have it, the fallback is a plain look and a
   bone needle. The one-move line follows it. Storm-hawks posture: "They want your Qi" → "They want you off their ridge, or in
   pieces on it."
2. **Fang Wei, posture**: "the most cultivated thing in this forest" is false when James fights him at Mortal Vessel (the
   posture shows at every degree, and Fang Wei is Foundation). Now: his senses "have been over you twice and reported one lost
   academic, contents nil."
3. **Fang Wei, win 3**: he woke with "his herbs stacked on his chest" while the loot gives James all 3 Ninefold grass. Now his
   herb-bag lies folded on his chest, empty. Also "his own cultivation vanish into you" → "his Qi go into you" (he is humbled,
   not crippled).
4. **"Mount Tai"** (Tan brothers, win 2): a mountain of Earth in a local's mouth. Now "had eyes and did not see the mountain".

## Continuity: found, not mine to fix
- Line 66 (the fights table, the Heartless's loot): "+3 Murky beast cores. They are warm, and very sad." The win texts already
  say the cores are warm; fine, only noting that the two sit together on one screen.
- Line 61 (the storm-hawks' loot): "+4 Storm feathers (filed under crow feathers; they also smell)." No text in my block
  mentions a smell; nothing to fix.
- `lf_human_won` (run A's): Fang Wei pinned by "a bone needle through each sleeve"; my win 2 keeps the bone staples through
  the sleeves, so the two agree.

## Label suggestions
None.

# Part 8, run C: notes (Yuki's form scenes; the season lines)

Edited: /tmp/rw-p8c/js/story/longforest.js (from `/* ---------- Yuki's forms ---------- */` to the end only) and
/tmp/rw-p8c/js/story/prologue.js (`SEASON_LINES` only). Not committed. Check: "loads"; no "SS TODO"; no TODO in my lines;
choice labels identical (compared old against new); every scene within +25% of its old length (188 → 223, 192 → 237, 141 → 164 words).

## YA, per scene
- **yuki_tiger_awaken (text):** rewritten, every beat kept (seen while he looks at her; the stretch that goes on; growth felt
  through the bond; the Bengal tiger's size; *Finally. I have been small for long enough.*; eleven pounds again; *I can do both.
  Whenever I like. Don't make it weird.*). "the patch of sun" → "the warm spot" (the scene can run at night or anywhere). The
  meridians now match his "channel for channel, as they have matched everything of yours since the day you were both born" (lore:
  born the same day, bonded from birth).
- **yuki_tiger_awaken, reply line (`*I know,* she says … underline a word …`):** not in the older list (already mine), left as it is.
- **yuki_tiger_awaken, second result line:** "Yuki: great root-kin form." kept exactly; prose now "Science is the excuse; looming
  over you is the purpose." (answers the label "For science").
- **yuki_human_awaken (text):** rewritten, every beat kept (felt through the bond first, the hand opening; less cat at every step;
  the full canon look; barefoot; she studies her hands; "for the first time in your life you hear your root-kin's voice" kept word
  for word; both "insufferable" lines). No shade, no light: place-neutral.
- **yuki_human_after (text):** rewritten; "Hello" and the one-second softening, the cat thing shown, the great form's yawn,
  "Three shapes … One of me", the small form best for sleeping on him, "Of course you will." all kept.
- **yuki_human_after, result lines:** "Yuki: small again, on your shoulder, washing an ear. The matter is closed." / "Yuki: human
  form. For once she is next to you and not on you. It is new." ("Yuki: human form." kept at the front).
- **yuki_form:** the three form lines rewritten place-neutral (the human one no longer sits "on a root": the chooser opens from any
  hub); the three short result lines untouched ("Yuki: cat form.", "Yuki: great root-kin form (hits much harder in a fight).",
  "Yuki: human form.").

## FX
- "a white tiger the size of a pony" → "the great form, as big as a Bengal tiger".
- "a puddle of black fabric" / "dress and all" → "of the qipao there is not a thread … tall again, qipao and all, down to the last
  knot button" (the clothes still come and go with her).
- "for a long moment" (her hands) → "like someone checking a delivery against the order".
- "Gold eyes, level with your chest" → "Her eyes, gold and unhurried, are now at the height of your breastbone."
- **"Don't tell anyone I can talk"** → "People say stupid things in front of cats … It is very informative. So I will choose who
  hears me answer back, and when. Promise you won't make an occasion of it." A preference, not a secret; later scenes where she
  talks in front of Mei Lin, Ya, the village and the Sect no longer break anything. The label 'Promise.' answers the last sentence.

## YF spots
- No `byForm(...)` in my lines. Form review of the plain texts:
- **yuki_human_awaken** can open while she is in the cat form or the great form. The old "Not smaller, not larger" and "Taller"
  leaned on the cat; now "She doesn't grow, exactly, or shrink. She *changes*: upright, two-footed, narrower", and "From this
  height I get all of it at once" replaces "I can see your face now" (true from either earlier shape). Her height is given as
  "the top of her head no higher than your chin" (the canon's head shorter).
- **yuki_tiger_awaken** only ever starts from the cat (it is her first second form), so shoulder and coat-climbing are safe.
- **yuki_form**, the question line: it said "Through the bond" for all three forms, the human one included. No code added;
  reworded so it holds for a woman who could have said it aloud: "Through the bond, which is quicker than talk in any of her
  shapes: *which?*"
- **yuki_human_after**, result "next to you and not on you": true whether she was the cat (on him) or the great form before.

## SS, the season lines (14; 25–30 words each; no realm named, no sky, no lightning, no day counts)
Each has its own image; none uses `lf_seclusion`'s (the cave and snow, moss on boots, fish, foxes, autumn leaves, counted
heartbeats). Yuki appears form-neutral from entry 3 on (bond speech or plain action that fits any body).
1. the ground's "courtesy claim" (he could fly, and stays put). 2. the wordless season (reused from the old five, reworked),
ending on his shoulder complaining of her weight. 3. the rains; what was poured soft has set. 4. the hot season; insects learn.
5. the season of fruit and drunk wasps. 6. fog; a second, small attention behind his own. 7. hard frost; "a committee".
8. birds nest within arm's reach; "reclassified as terrain". 9. the dry season; no thirst, no boredom. 10. an undescribed
fungus fruits behind the mycologist, unobserved. 11. gales; the forest "makes arrangements". 12. seedlings lean toward him.
13. the river floods and goes round. 14. the last season; he runs out of ladder.
- Entry 2 says "through the bond": safe, since the human form cannot exist before entry 7.
- Entries 9 and 13 name the stream and the river: fine for the Long Forest's own card, which is the only place these lines show.

## CW
None (not asked in this run).

## Label suggestions (not applied)
- yuki_human_after: 'Promise.' → 'Promise. No occasion.' (says what is promised now that the secret is gone; optional).
- yuki_form: 'Human. Someone to talk to.' reads slightly as if the cat can't talk to him; 'Human. Someone who answers aloud.'

## Continuity, found and not fixed
- `lf_hub` label "Yuki has gone very still. Something in the bond is changing shape." and other hubs' entries into
  `yuki_human_awaken` were not checked beyond the Long Forest's; the new opening ("The bond tells you before your eyes do") agrees
  with that label.
- `yuki_tiger_awaken`'s reply line (not mine to edit in this run's list) has "the way you'd underline a word", kept by the sheet.
- `lf_notes` (run A/D) still prints "The sky has tried to strike me N times": outside my lines; my season lines stay clear of it.
- `lf_bathe` uses "her tail wrapped round her ankles" and `lf_morning` "heat like a kiln"; I avoided both images in the chooser
  and the season lines.
- The cat's eyes: the spec says yellow, the pictures gold; I wrote "gold" for the great and human forms only, and no colour for
  the cat.

# Part 8, run D: notes (the second visits and the drills)

File edited: /tmp/rw-p8d/js/story/longforest.js only (27 replacements: 20 RP placeholders, 7 SW lists = 21 lines). No labels,
ids, flags, conditions or other runs' lines touched. Not committed.

Checks run: the load check prints "loads"; `grep -n "TODO" js/story/longforest.js` prints nothing; the tic list (brief) finds
nothing in the new text; every new five-word run checked against /home/claude/bone-and-ash/js and against the working copy's
other lines (seven overlaps found and reworded; the only repeats left are the shared halves of my own byForm branches).
Every scene rendered in all three forms, first against later visit. No test suite run (not asked; Claude's to run).

## Length (later text against the first text it replaces; the sheet asks for about 60-80%)
Most land at 70-85%. Over 80% on the replaced part alone: meet rogue (about 90%: it has to carry "he has explained last time
away" on top of the first text's beats), talked rogue (about 90%), ride (82%). Say if any should come down further.

## RP, per scene
- lf_falls: the cold is known and no warmer for it; his body objects in advance; "the stories were written by the survivors".
  Both choices still fit (hold the loop / call it a metaphor).
- lf_ride: she no longer warns him and goes faster because he stays on; the view shown "like an owner with a guest"; same
  three sights (Blackroot, village smoke, dead tree). Bond line: *still welcome.* (answers the first text's *you are welcome.*)
- lf_ride reply: one thanks, forehead to forehead, and the standing fish deal ("the flat ones, from the slow water. The rate
  has not changed.").
- lf_notes: a later page: the trial grounds restock overnight to the same headcount (picks up lf_trials' "generous that way":
  hypothesis revised from "generous" to "organised"); Yuki's unasked review ("too many words, no fish"); the recommendation
  kept ("let them all underestimate me"). Italic, two short paragraphs; Yuki's own entry by form follows unchanged.
- lf_bored: the bone mouse "is finished as a genre"; he has to out-invent himself (beetle, hopping frog, fish, now a six-legged
  thing with a doubling-back trick); she takes it apart "starting with the trick"; filed under *prior art* (was *publishable*).
- lf_bathe: the same river and rock; nothing interested; the scholar's stoop gone, "a man you would step aside for". No time words.
- lf_storm: the checklist kept and shortened (the bolt as a clerk who knows the form will come back blank); the cloud as a
  colleague saying *told you*; Yuki: *still a show-off.*
- lf_bone_depths: sand raked smooth, the population back to strength, skeletons he has counted before and one or two "that
  haven't been told about you".
- lf_black_mire: the ink closed over; stumps tenanted again (the mire-brood's label); logs that drift off (the "playing a log" beat).
- lf_thunder_ridge (first paragraph): the storm on time "as if under contract"; fresh glass. The realm line after it is untouched.
- lf_old_roots: the roots still point at the dead tree; under the silence "a tune somebody has stopped humming"; the tenants
  "have had practice at being left behind". Nothing said of what is in the tree.
- lf_trial_won: realm-neutral on purpose (neither hard-won nor a stomp, neither killed nor spared, since the stomp texts differ):
  he counts his limbs; the beast "will be back tomorrow, or something filling the same post". The name expression is kept as given.
- lf_trial_lost: the practised exit; Yuki "showing it the scenic route"; "the Long Forest marks hard and lets you resit" for no shame.
- lf_wanderers, Tans: "You. The mortal in the robe."; last time "gone over at home" into a version where they did well (fits
  beaten, talked past or having robbed him); the toll up "for repeat travellers"; they still feel nothing on him.
- lf_wanderers, Fang Wei: another clearing, the same poaching; his senses over him again, nothing; he has "explained it to
  himself"; a new, graver threat (the same insect twice).
- lf_human_talked, Tans: he asks how the toll is accounted for and starts a table; the brothers fall out over the ledger.
- lf_human_talked, Fang Wei: the lie is a Sect inspector two clearings back counting cut stems; he runs, with the knife this
  time; the grass stays (matches "+2 Ninefold spirit grass (left behind at a dead run)").
- lf_human_won, Tans: alive and wheezing; the jerky "close to an arrangement"; close: "Then next time bring better jerky."
- lf_human_won, Fang Wei: pinned at the sleeves again; herbs "as evidence, as before"; he begs for there to be a talisman;
  "There's a talisman," you say; "the kindest thing you will do all day, and it isn't even true."
- lf_human_lost (first paragraph): pockets gone through "like regulars"; the hammerspace missed; "the mortal in white" (fits
  the Tans' robe and Fang Wei's coat).

## YF spots
- lf_storm (byForm, new): cat under her rock, a thought; great root-kin behind a boulder that covers her to the shoulders, a
  thought; woman under the overhang, not looking up from her fingernails, aloud: "Still a show-off."
- lf_trial_won (byForm): cat cleans one ear; great root-kin yawns ("a display of ivory nobody asked for"); woman tucks a lock
  of hair behind one white ear and says it aloud. Same verdict in all three: faster than last time, still slower than me.
- No switch, written to fit all three: lf_bored (no body named), lf_trial_lost (Yuki leads it off; no body), lf_notes (her
  review is reported in the notebook), the wanderer scenes (Yuki not mentioned), drills t2 #3 ("Yuki was watching") and all
  of t3 ("her shoulder", "she calls that cheating": true of a cat, a great root-kin and a woman).
- lf_ride and its reply: great form only, as the sheet says ("white ruff", "forehead to forehead").

## SW, the drills (21 lines, 14-24 words each)
Each list's three lines use different images; none reuses the Wilds' or the Blackroot's drill lines (checked against DR_DARTS,
DR_BLADE, DR_FEET, DR_NEEDLE, DR_BL_DART, DR_BL_NEEDLE). All realm-neutral.
- t1: the tenth leaf as the control / aiming at the wind / a branch letting go out of spite. t1Fail: darts where the leaves
  were expected / one leaf in twelve, on the ground / a gust, and something behind the treeline moves house.
- t2: arms drop their objections / the blade humming, and so is he / halving a dew drop. t2Fail: the argument with appendices /
  blade stuck in a root / a very slow orchestra.
- t3: she has begun to plan / one touch to eleven, "a clerical error" / reading her through the bond, "cheating".
- t4: he stops deciding to throw / "a thousand small agreements" / the last needle splits the one before. t4Fail: a spread the
  size of his palm / thrown by a man thinking about lunch / the Qi has voted.

## CW
None added (this sheet doesn't ask for any). Two small touches sit near it and can be cut if unwanted: Little Tan asking "what
you are cooking today" (a callback to run A's line in the first meeting), and James telling Little Tan in detail what is wrong
with the jerky.

## Label suggestions
None.

## Continuity, found and not fixed (not my lines)
- lf_hub, the label 'Wash in the river. You have been in a forest for a long time.': assumes time spent (the brief's
  time-neutral rule) and uses the tic "a long time". Label, so untouched. Idea: 'Wash in the river. The forest has been
  getting into everything.'
- lf_trials: "restocked itself by the next morning" and my notes page ("restock overnight") both lean on mornings; the notes
  card needs two sleeps (lfDays >= 2), so the notes are safe; lf_trials can be read at 0 days.
- lf_trial_won, later text: `lf_trials_won >= 2` counts wins in any zone, so the "again" text can follow a first win over a
  given beast. Mine is written so it still reads right ("again" refers to the limb count, not to this beast).
- lf_wanderers / lf_human_won: `later()` keys on having MET them before, not on having beaten them, so "again" lines can follow
  a first win or first talk on a second meeting. The won/talked texts say "as before" / "this time" loosely: "It goes as it
  went before" (won, Tans), "takes it worse, because this time he was ready" and "as evidence, as before" and "Twice" (won,
  Fang Wei) and "The knife goes with him this time" (talked, Fang Wei) assume the same outcome earlier. If the code can't
  tell, say so and I'll write these outcome-neutral.
- lf_human_lost: the later text's key is `lf_last`, the same meeting counter, so "You lose again" can show on a first loss at
  a second meeting. Same remedy.
- yuki_tiger_awaken, yuki_human_awaken, yuki_human_after still carry listed tics ("for a long moment", "for the first time"
  at her first words, where it is allowed, "the way you'd"): run C's lines.

## Update (Claude's ask): the later encounter texts made outcome-neutral
The counter is meetings only, so no later text may assume how the last meeting ended. Having met before stays ("you again").
- lf_human_won, Tans: "It goes as it went before" -> "It ends, give or take a bruise, with both brothers..."; "a fresh part of
  himself" -> "his elbow like an heirloom"; the jerky "close to an arrangement" -> "between acquaintances, it seems only fair".
- lf_human_won, Fang Wei: "goes down the same way ... this time he was ready" -> "goes down hard and takes it harder, because
  he knew your face and had made ready for it"; "as evidence, as before" -> "as evidence"; "Twice ... *Twice.*" -> "A mortal.
  The *same* mortal."
- lf_human_talked, Fang Wei: "The knife goes with him this time." -> "He remembers to take the knife."
- lf_human_lost: "You lose again, and it has not got easier to like ... like regulars" -> "You lose, and to people who know
  your face, which is worse ... like old acquaintances".
- Checked and left: lf_wanderers' two later meetings ("Whatever happened last time ...", "Whatever passed between you before
  ..." name no outcome) and lf_human_talked, Tans (no reference back). "Then next time bring better jerky" looks forward only.
- The three bullets under "Continuity" above about "as before" / "this time" / "Twice" / "You lose again" are settled by this.
- Still open, not an encounter text: lf_trial_lost's later text opens "You lose again" and keys on lost trials (its own
  counter, `trial_lost`), so there it is true.
Checks after the update: loads; no TODO; no tic; lengths within a few words of before.

# Part 8, run E: notes (the review's text fixes; picks CA1 and RV1)

Edited: `js/story/longforest.js` and `SEASON_LINES` in `js/story/prologue.js`, in /tmp/rw-p8e. No label, id, flag, condition or `${...}` changed; no code added. Not committed.
Check: the two files load ("loads"); `grep TODO` on both prints nothing. No test suite run (Claude's).

## The fixes, old → new
- **MB (T1) lf_mire_brood win 3, para 1:** "You don't fight them. You stand on the bank, and the Ouroboros turns over once, and the water round your boots runs clear: one clean patch in a mire that has never had one, and widening. They *taste* it. Whatever it is, it is wrong for this world, and it is coming their way. All three roll over" → "You don't fight them. You stand on the bank and look at them as you would at a slide: with interest, and with no fear in it anywhere. Nothing has ever stood on this bank and failed to be afraid. They work through what that means, and get it right. All three roll over"
- **MB (T1) lf_mire_brood one move:** "'The water round your boots runs clear. Three mire-brood die of fright, provisionally, and float.'" → "'You look them over, with interest and nothing else. Three mire-brood die of fright, provisionally, and float.'"
- **BT yuki_form:** "a white root-kin the size of a Bengal tiger, stretched out" → "a great white root-kin, stretched out"
- **BT yuki_human_after:** "Then the great form, as big as a Bengal tiger, yawning, so that you may count her teeth." → "Then the great form, which leaves the two of you rather less room than before, yawning, so that you may count her teeth."
- **T2+T5 lf_exit para 3:** "What nobody out there knows, and what you only suspected the last time through, you have now tested on beasts, on bandits and on one very confused herb-poacher: they can't feel you." → "What nobody out there knows, and what you were told to your face the last time through by someone ready to stake her life on it, you have now tested on everything in this forest that has looked at you: they can't feel you."
- **T2+T5 lf_notes key finding:** "*Key finding, suspected last time and now confirmed on a proper sample: nothing here can sense my cultivation. Beasts cannot. Cultivators cannot. I read as an empty vessel, every time." → "*Key finding, reported to me last time by a local, to my face, and now confirmed on a proper sample: nothing here can sense my cultivation. Whatever has looked at me in this forest has found none. I read as an empty vessel, every time."
- **T5 lf_notes observations:** "attempts predation less often than it did. Bandits remain optimistic. The sky" → "attempts predation less often than it did. The exceptions are optimists. The sky"
- **T6 lf_bandits posture, met before, cat (new):** "'RV TODO bandits again cat'" → "`"Well, well," says Scarred Tan, who has plainly rehearsed, and sees no reason to waste it on a second showing. "The mortal. In the *white robe*. Still in the deep forest. Still with the *cat*." Little Tan laughs on his cue, a beat late, as before. "And for repeat travellers, uncle, the toll is everything you're carrying, the robe, and this time the boots."`"
- **T6 lf_bandits posture, met before, great form (new):** "'RV TODO bandits again tiger'" → "`"Well, well," says Scarred Tan, who has plainly rehearsed, and sees no reason to waste it on a second showing. "The mortal. In the *white robe*. Still in the deep forest. Still with the—" His eyes reach Yuki and stop. "The *very large cat*." Little Tan laughs on his cue, a beat late. "For repeat travellers, uncle, the toll is everything you're carrying, the robe, and this time the boots."`"
- **T6 lf_bandits posture, met before, human (new):** "'RV TODO bandits again human'" → "`"Well, well," says Scarred Tan, who has plainly rehearsed, and sees no reason to waste it on a second showing. "The mortal. In the *white robe*. Still in the deep forest. Still with the *lady*. In the *silk*." Little Tan laughs on his cue, a beat late, as before. "And for repeat travellers, uncle, the toll is everything you're carrying, the robe, and this time the boots."`"
- **T6 lf_rogue posture, met before (new; replaces the first two paragraphs):** "'RV TODO rogue again'" → "`"Fang Wei," he announces, as though the forest had asked. "Outer Disciple of the Crimson Lotus. Lapsed." The last word is set down again with the same care, in case it was missed. He looks you over from hair to boots and finds what he found before.

"No root. No Qi. Still not so much as the smell of a pill." He lets his Qi run down both arms, red and crackling and very pleased with itself. "You know what grows here, mortal. You know what it fetches. What you may not know is what becomes of mortals who watch me cut it twice. Kneel, and I'll be quick."`"
- **T6 lf_wanderers later (no name in the narration):** "another clearing: Fang Wei has moved his business and not improved it." → "another clearing: the poacher has moved his business and not improved it."
- **T4 (+T15 sky) lf_human_won, Fang Wei CW line:** "He had watched your camp one dusk, he tells the sky, and heard the music from your sleeve, low and strange and sad, and had judged that a man who sat at his fire with songs that soft could not be dangerous." → "He had come past your camp before he came on you, he says, to nobody, and heard the music from your sleeve, low and strange and sad, and had judged that a man who kept songs that soft could not be dangerous."
- **T7 lf_human_lost later:** "You lose, and to people who know your face, which is worse. They go through your pockets like old acquaintances, take what food they find, and miss the hammerspace. The laughter" → "You lose, and to a face that knows yours, which is worse. Your pockets are gone through with the ease of old acquaintance; what food is found is taken, and the hammerspace is missed. The laughter"
- **T8 yuki_tiger_awaken:** "matching your new Core channel for channel" → "matching your core channel for channel"
- **T9 lf_trial_won later, human:** "'Yuki tucks a lock of hair back behind one white ear. "Faster" → "'Yuki smooths one long side lock flat between two fingers. "Faster"
- **T10 lf_wanderers first, the Tans (CW):** "The narrow one adds that your cooking smells as if somebody is expected home for it, and is looked at until he stops." → "The narrow one adds that the fire back upstream smells as if somebody is expected home to it, and is looked at until he stops."
- **T10 lf_wanderers later, the Tans (CW):** "Little Tan asks what you are cooking today, and is looked at." → "Little Tan asks what was in the pot this morning, and is looked at."
- **T11 season line 1:** ""A season of sitting still. By its end" → ""A season of sitting still on the ledge above the falls. By its end"
- **T11 season line 3:** "What was poured soft at your centre last season has set." → "What was poured soft at your centre has set."
- **T12 lf_enter:** "and look at your hands, and at the cat, and at a forest" → "and look at your hands, and at Yuki, and at a forest"
- **T13 lf_bathe later:** "The river hands back a man you would step aside for." → "The river hands back a man with fewer apologies in his shoulders."
- **T15 "From her" 1 (LF_DRILL t3):** "she has begun to plan. From her, planning is a compliment." → "she has begun to plan. She does not plan for people who don't worry her."
- **T15 "From her" 2 (lf_bored result, both branches; the stag keeps its "From her"):** "From her, that's a standing ovation." → "It is the nearest thing to a standing ovation she keeps."
- **T15 the hound (lf_bone_hounds win 2):** "without a backward look, which from a hound counts as respect." → "without a backward look, which is as near to respect as a hound gets."
- **T15 owner-with-a-guest (lf_ride later):** "shows you round like an owner with a guest: the Blackroot" → "shows you round like someone who has had the view repainted: the Blackroot"
- **T15 tenants (lf_black_mire later):** "The ghost-gill stumps have tenants again, and a few" → "The ghost-gill stumps are occupied again, and a few"
- **T15 tenants (lf_old_roots later; the morning keeps landlord and tenant, the Wyrm its buyer):** "The tenants are back, grey on white, holding very still." → "The grey shapes are back along the white, holding very still."
- **T15 clerical (LF_DRILL t3):** "and holds that the one was a clerical error." → "and rules the one inadmissible."
- **T15 clerical (lf_seclusion season 1; the storm keeps its clerk):** "then drop it as clerical work." → "then drop it as beneath them."
- **T15 sky (lf_human_won later; the stomp win 2 keeps "swearing at the sky"):** "and glares at the sky, which he holds responsible." → "and glares at the needles, which he holds responsible."
- **T15 "has not moved" (lf_ride later; the falls keep theirs):** "Yuki's position on saddles has not moved, and you have stopped raising it." → "Yuki still does not do saddles, and you have stopped raising it."
- **T15 the bond as cheating (season line 2; the spar keeps its "cheating"):** "Yuki calls it your best work, through the bond, which is cheating." → "Yuki calls it your best work, and says so through the bond, more than once."
- **T15 figure of speech (lf_enter):** "and lately that is not a figure of speech." → "and lately you mean it literally."
- **T16 hub:** "and not being in a hurry is the one field you were qualified in before the doctorate." → "and you have a doctorate in not being in a hurry."
- **T17 lf_heartless posture:** "where something was taken out of it with a blade, long ago." → "where something was taken out of it, long ago."
- **T18 lf_storm:** "aimed at the exact crown of your head,

and stops a foot short, and hangs there crackling," → "aimed at the exact crown of your head.

It stops a foot short and hangs there crackling,"
- **T19 lf_old_roots later:** "The white roots lie where they fell, every one" → "The white roots lie as you left them, every one"
- **T20 lf_ossuary win 3:** "When you reach for the core-knot under its jaw, it lifts its chin" → "When you reach for the two core-knots under its jaw, it lifts its chin"
- **T20 lf_thunder_ram win 3:** "Yuki keeps the stunned one company all evening, perfectly content," → "Yuki keeps the stunned one company for as long as dinner takes, perfectly content,"
- **T21 lf_notes later:** "or it keeps a waiting list. Hypothesis revised from "generous" to "organised".*" → "or it keeps a waiting list. Hypothesis: organised.*"
- **C5 t1Fail 1:** "Your darts arrive where the leaves were expected." → "Most of your darts arrive where a leaf was expected."
- **C5 t1Fail 2:** "You hit one leaf in twelve. It was on the ground at the time." → "You pin a few. The rest reach the ground untouched and lie there face up, like papers handed back."
- **C5 t1Fail 3:** "A gust takes the leaves sideways and your darts straight on." → "A gust takes the leaves sideways and half your darts straight on."
- **C5 t2Fail 1:** "Your arms submit their argument in full, with appendices. The blade goes soft along the edge, and you let it dissolve." → "Your arms submit their argument in full, with appendices. Somewhere past the middle the blade goes soft along the edge, and you let it dissolve."
- **C5 t2Fail 2:** "The seventh form ends with the blade stuck in a root and your hand nowhere near it. You dissolve the evidence." → "The forms hold as far as the seventh, which ends with the blade in a root and your hand elsewhere. You dissolve the evidence."
- **C5 t2Fail 3:** "Your arms argue, and today they win. You finish the set" → "Your arms argue, and carry more points than they should. You finish the set"
- **C5 t4Fail 1:** "A thousand needles, and a spread the size of your palm. The brief said knuckle." → "A thousand needles, and a spread nearer your palm than your knuckle. The brief said knuckle."
- **C5 t4Fail 2:** "Your focus goes at about three hundred. The other seven hundred are thrown by a man thinking about lunch, and it shows." → "Your focus thins somewhere after the middle. The remainder are thrown by a man thinking about lunch, and the grouping says so."
- **C5 t4Fail 3:** "The needles come out bent, then brittle, then not at all. Your Qi has voted." → "The needles come true for a while, then bent, then brittle. Your Qi has voted."

## The new openings (T6): size and forms
- Tans, met before: cat 64 words, great form 70, human 67 (asked: 40–70). Each ends on the form's own word: "the *cat*", "the *very large cat*" (he stops at her first), "the *lady*. In the *silk*." The toll is not said to have "gone up" a second time (`lf_wanderers`' later text says it just before); it names the raise instead: the boots.
- Fang Wei, met before: 109 words (asked: 70–110), two paragraphs. He gives his full name here, since an earlier meeting may have been talked past or walked away from. "You know what grows here, mortal." holds either way (the first meeting shows him cutting it). The threat is worded so it doesn't assume he was threatened before ("What you may not know is…").
- Both openings repeat the first meeting's own phrases on purpose (the rehearsed speech, "a beat late", "red and crackling and very pleased with itself", "Kneel, and I'll be quick."): he is the same man making the same speech.

## T15: what was kept
One of each family stays: the stag's "From her, that is the loudest thing…"; the morning's landlord and tenant and the Wyrm's buyer; the storm's clerk; Fang Wei "swearing at the sky" (stomp win 2); the falls' "has not moved"; the spar's "She calls that cheating."

## C5: the drill lines
Word counts: t1Fail 24 / 19 / 20, t2Fail 25 / 24 / 25, t4Fail 23 / 22 / 24. Each line now says "most", "a few", "half", "past the middle", "for a while": true of a near miss and of a clean failure. The images are the same three per list as before. If a test pins the old wording of a fail line, it needs re-saving (the tools test's word-count snapshot will move in any case).

## Found, not fixed (outside the sheet's lines)
- `lf_human_talked`, later text, Fang Wei's branch: "Fang Wei is gone before you finish." The narration names him where no fight need have happened (the same fault as T6's `lf_wanderers` line). Suggested: "He is gone before you finish."
- `lf_human_won`, later text: "Fang Wei goes down hard…": in order, the fight's opening has given his name by then.
- T10's "the fire back upstream" (the review's own fix) still assumes a fire at camp; on day 0 he may not have lit one. Left as picked.
- T13's later bathe text keeps "the scholar's stoop has gone" at Mortal Vessel; only the last clause was in the pick.
- T11: season line 1 now puts him "on the ledge above the falls"; `lf_seclusion` (the story-mode scene) has the cave behind the falls. Near, not the same spot; as the sheet asked.
- T21: the notes' later text still assumes the trial grounds were seen on two days (the review's remark); only "generous" was in the pick.
- Label, for the owner (not edited): "Wash in the river. You have been in a forest for a long time." (the brief's tic "a long time", and untrue on the first screen; review T13).

