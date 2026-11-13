# Bone and Ash: the Fable rewrite, part 4 (the Fallout): the brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 4: **Act 1's Fallout,
Days 8–10** in Ashfall Hamlet (the Sect's answer to the tribute by how it ended: a letter, an envoy, Lu Han; Outer Elder Shen Qiu
named for Day 21; the day hub and its cards: the bone palisade, council, the hunters' drill, the clinic at the well, Mei Lin, her
mother, the watcher on the ridge; suppers, the loft at night, the ash-wolves in the barley; the mornings; Ya walking out of the
Blackroot on Day 9, the slap and the brawl, Ya's time; the plan, the price, Mei Lin insisting; the farewell, the last night, the
departure at dawn on Day 11). Parts 1–3 (the prologue and shared scenes, the Blackroot Wilds, Ashfall in the prologue) were yours
and are in the game. Claude keeps the code, tests and docs.

## Where
- The original, read-only: /home/claude/bone-and-ash (do not edit anything there).
- Your working copy, edit here: /tmp/rw-p4 (a scratch git worktree). Edit only `js/story/act1_fallout.js` and, for Task 5,
  lines 18–91 of `js/story/stomp_act1.js` (the entries `sect_watcher`, `palisade_wolf`, `ya_brawl`). Nothing else.
- The lists of older lines: /tmp/rw-p4-info/older-fallout.lines and /tmp/rw-p4-info/older-stomp.lines (line number in the /tmp/rw-p4
  file, then the start of the string). A multi-line template literal is listed by its first line; the whole literal is older.
  **Also older, though not listed** (Claude moved them while preparing the file): the first entry of each new `DR_FO_*` list near
  the top (except `DR_FO_SPAR`'s first, yours since v0.11.126), the cat text in the three new `byForm` switches (Task 3), and the
  rest of `fo_wolf`'s text.

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins). Especially: the realm sheet (Mortal Vessel = everyone in Ashfall);
  **locals can't sense James or Yuki, they place them by what they see**; Yuki's forms; **"James: cooking, music and his archive"**
  (for Task 6).
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and /tmp/rw-p4/js/story/act1_common.js lines 1–25 (cast: Mei Lin 26, Ya 27,
  Old Wen 90, the mother, the hunters, Lu Han, Gao Feng, Shen Qiu).
- The whole of /tmp/rw-p4/js/story/act1_fallout.js; your Ashfall in /home/claude/bone-and-ash/js/story/ashfall.js (the prologue's
  Days 4–6, just before), the tribute's endings in /home/claude/bone-and-ash/js/story/prologue.js (`tribute`, `bluff_win`,
  `collectors_won`, `tribute_paid`, `collectors_lost`), the start of /home/claude/bone-and-ash/js/story/act1_blackroot.js
  (`bl_start`, just after), and /home/claude/bone-and-ash/js/story/house_texts.js (Old Wen's and the mother's daily scenes, yours),
  so the Fallout matches what you wrote around it.

## Task 1: the older text (OT)
Rewrite the prose of the listed strings (last written before v0.11.69, i.e. not by you). Strings not listed are yours since then
and stay, except where Tasks 3, 4 and 6 ask. Rewrite only the text inside string and template literals: scene texts, the result
lines inside `do:` / `failDo:` / `enter:` functions, the fights' `intro:` lines, the letter / envoy / Lu Han openings, `OPENING`
and `LETTER` and the other constants near the top.

## Task 2: the success lines by day (SR)
Near the top of act1_fallout.js are eleven new lists, `DR_FO_SING` … `DR_FO_BOY_F`. These cards can be run on all three days
(Days 8, 9, 10; some more than once a day); every success (and three failures) used to say the same line every day. Entry 1 is the
old line (rewrite it as part of OT; `DR_FO_SING`'s entry 1 is new: the old success said only the count), entries 2 and 3,
placeholders "SR TODO …", are shown on the second and third day the card answers in a Coil (Day 9, Day 10). Write each as a short
line (one or two sentences, about 10–25 words; the count line "Palisade: n/3 stretches." stays in front of the palisade ones, in
the code), different from the others in its list, with some progress or a callback to the day before. Don't echo the failure lists
above them (`DR_PALISADE_F`, `DR_COUNCIL_F`, `DR_FO_SPAR_F`, `DR_FO_CLINIC_F`, yours).
- `DR_FO_SING` singing a full stretch of the bone palisade out of the ground and old bone (costs Qi)
- `DR_FO_PITS` / `DR_FO_PITS_F` teaching the hunters to set the stakes in angled pits, the way the jackals taught James
- `DR_FO_COUNCIL` the council heard him (Day 8: about the children; Days 9–10: about the Old Tree) / `DR_FO_LISTEN` he listened
- `DR_FO_DRILL` / `DR_FO_DRILL_F` drilling the line: spears behind bone shields, nobody alone
- `DR_FO_SPAR` sparring with Yuki in front of the hunters, so they see what fast looks like (by her form: entries 2 and 3 have a
  cat / great root-kin / human text each; entry 1 is yours, but its great root-kin text says "bows to the cat": fix that)
- `DR_FO_CLINIC` working through the line at the well properly (the boy who sharpened a scythe like a spear is Day 8's; later days
  have other patients: hands torn on stakes, a falling beam) / `DR_FO_BOY` / `DR_FO_BOY_F` treating the boy (or the youngest, the
  worst) first against the old woman's order of age
- **The council on Day 10:** `fo_council`'s text now has a third branch, "SR TODO council Day 10" (Day 10 used to repeat Day 9's
  "Second council"). Write a third council (about 120–170 words): the last before the expedition leaves at dawn; the same choices
  follow as on Day 9 ("It's calling me. I think it was one of ours…" / "Listen. Say nothing…"), so it must lead to them. Keep it
  consistent with `fo_plan` (Day 10's planning).

## Task 3: every text for every Yuki form (YF), as in part 3
The owner plays with Yuki in all three forms (he reaches Nascent Soul before the tribute every Coil). `byForm(g, cat,
greatRootKin, human)` picks the text by her form:
- **cat**: a small white cat with yellow eyes; speaks only through the bond (*italic*).
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger, from Core Formation; bond speech only.
- **human**: from Nascent Soul; a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit
  eyes, a long black high-collared qipao with red piping (lore.md "Her human look"); speaks aloud, deadpan; still bonded to James.
  Locals see a strange, beautiful woman with ears and a tail who arrived with the stranger; they are grave and formal about it.
  Don't settle whether she is James's sister or lover (neutral).
Do this:
1. Fill every "YF TODO <spot> tiger" and "YF TODO <spot> human" (supper8, wolf_wake, ya_night). The cat text in each is the old
   text: rewrite it too. Each form's text does the same job (same beat, same length ±25%), written for that body: a tiger at a
   peasant's supper table; a tiger can't wake him with claws on his face the way a cat does, and can't leave through a loft window;
   a woman wakes him aloud; a woman at a supper table is a guest the mother has to place.
2. Review every existing `byForm(...)` in act1_fallout.js (the council's "Your cat" for the great root-kin, the spar, the spy
   fled, the ledger's margin, the wolves, Ya's sniff, the slap, the last night, the departure) for all three forms. Where the cat and
   the great root-kin share a text that fits only one, adjust (Old Wen's "Your cat" for a tiger: decide; his eye is bad and his
   manners good). Where a branch is empty ('') and Yuki would plainly be there and matter, you may write it. Keep the number of
   entries and the order.
3. Any other text that names or implies Yuki in one form only and has no switch: make the wording fit all three (no new code), and
   list it in your notes.

## Task 4: continuity (in the older lines; your own lines too if they contradict)
1. The calendar: the Fallout is Days 8, 9, 10; the expedition leaves at dawn on Day 11; Shen Qiu comes on Day 21 (on Day 8,
   thirteen days; the hub says "N days until the Elder" in the code). Check every "tomorrow", "thirteen", "twelve", "three days".
2. The loft: if the arson in the prologue burned it (`g.flags.loft_burned`, `fo_mei` already says so on Day 8), the loft has been
   rebuilt or patched since. `fo_night`'s "The loft smells of mint and drying ginseng." and `fo_last_night`'s "The loft smells of
   mint and dry hay." should read true either way (new beams and the herbs hung again, say), without new code.
3. The night's rules: beds from 21:00; the wolves come after bed, at 01:00 (`nightTo`); after a night fight James and Yuki wake with
   only half of what they lost back. No text should promise a full night after the wolves.
4. James's look (thin rectangular glasses, short pale blond hair and beard, the ouroboros on his left forearm, the tree and raven on
   his right, a white lab coat): the envoy already notices the coat; no more than that.
5. Ya can't sense James's Qi (her "How do you taste like *nothing*"); the hunters and the council place him by what they see.
6. Anything else that contradicts parts 1–3, house_texts.js or lore.md: fix it in the listed lines, or note it.

## Task 5: the stomp texts (ST) of the Fallout's three fights
/home/claude/bone-and-ash/js/story/power.js lines 1–30: when James outclasses a fight, degree 2 ("outclassed") or 3 ("roflstomp"),
the fight's intro is replaced by `posture(g, degree)` (its last part varies by degree through `pick(d, deg1, deg2, deg3)`), the win
scene's text by `win[2]` or `win[3]`, and degree 3 offers "End it in one move.", whose result line is `one(g)`. Locals can't sense
James's or Yuki's cultivation and treat him as a mortal. James never kills humans. Each `win` text **must keep every story fact of
the scene it replaces** (the same choices follow). The entries in stomp_act1.js lines 18–91 replace, in act1_fallout.js:
`sect_watcher` → `spyFight`'s intro and `fo_spy_won`; `palisade_wolf` → `wolfFight`'s intro and `fo_wolf_won`; `ya_brawl` →
`yaBrawl`'s intro and `ya_won`. Read those (your new text) first and keep the stomp versions consistent with them (the facts and
the spirit; a stomp text is not a copy: it tells the same outcome with James far above the fight). Rewrite the prose of the listed
older strings (and make Fable's own ones there agree with your rewrite). Yuki isn't named in these entries today; where she would
plainly be there, `yu(g)` and `yuShort(g)` (top of the file) name her by form inside a sentence; don't change them (other fights
use them); `yuShort`'s "all four hundred pounds of her" is a phrase to avoid in new text. Check:
`cd /tmp/rw-p4 && node -e "import('./js/story/stomp_act1.js').then(()=>console.log('loads'))"`.

## Task 6: who he is, under the deadpan (CW) — the owner's own ask
The owner, 2026-11-13 23:15, word for word: "for the act 1 journey, his cooking should also be very appreciated by the party, when
we get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his
character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in
music and culture reveal him to be a deeply caring and warm person."
In this part: **at most 6 throwaway lines**, one sentence each, spoken or thought by other characters (Mei Lin, her mother, Old
Wen, Ya, Old Hu, a hunter, a villager), inside scenes that exist (no new scenes, no new code, no gains), that let the reader see the
warmth under his deadpan: what he does for people here (the clinic, the boy first, staying, the children, the food he brings to the
house or the pot), and small habits from lore.md's cooking and music notes. Good homes: the suppers (Ya's first supper on Day 9 is
the first meal with the future party), the mother's scene, the communal pot, the farewell, the departure. Rules:
- **Throwaway**: a remark, an aside, a look; never a speech, never the point of the scene; James doesn't comment on it, or deflects
  deadpan. The locals stay grave (a grave compliment is still a compliment); Mei Lin and Ya can be looser.
- **Nothing that needs a scene the game doesn't have yet**: the kitchen shared with the mother and the communal cooking (the owner's
  CM, built later) are not in the game; a remark can notice that he cooks well, feeds people, salts the stew when nobody looks, or
  hums or plays strange music from his tool, but not that he has taken over the kitchen.
- **Music**: generic only (how it sounds, its genre in plain words, that it plays low from his tool, that the children have started
  humming one of the strange tunes); **no artist names, no song titles, no lyrics** in this part (the owner's songs "with the most
  impact" are kept for CM, and a personal and a general edition of the texts are still open).
- List each CW line in your notes (scene, who, the line).

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each
  one, in a sensible place), the number of entries in byForm(...)/byDay(...)/dayReply(...) lists and which branch is which,
  conditions, checks, times, gains, the order of choices, enemy `name:` values.
- **Do not change choice labels** (the `text:` of an entry in a `choices: [...]` array, including the `(g) => (… ? '…' : '…')`
  ones): tests and bots match them. Label ideas: in your notes only (old → new, with a reason).
- Result lines with numbers or items keep their mechanical part exactly ("+25 satiety.", "+30 satiety.", "Palisade: n/3
  stretches.", "−2 HP", "Condensed:", "An hour of rest."); rewrite only the prose around them. Keep the place names in `place:` and
  the titles as they are.
- Keep each text about the same length (±25%) and every story beat and fact: who knows what, what matters later (the endings of the
  tribute: fought, bluff, paid, lost; the letter and its lacquered tube; Shen Qiu "patient, never lost a duel"; the envoy and what
  he reports; Lu Han and the seed "if you want to be clean again"; Gao Feng's arm and meridians, his oaths; the sky witnessed; the
  palisade's three stretches; the militia; the clinics; the watcher's ledger and its margin, *does not bow*; the wolves and the
  goat; Ya's tracks around the camp, her sniff, the slap, the brawl; the Old Tree that sang; the plan, the price, Mei Lin's father's
  knife; the farewell; the romance nights as they are), names, numbers, the order of events. You improve the writing, you don't
  change the story.
- Keep Markdown as used (*italic* for bond speech, thoughts and emphasis). The game folds a re-read scene to its first paragraph, so
  a scene's first paragraph should stand alone.
- No song lyrics; adults only; romance stays exactly at the level it is (fade to black at the door: the last night, Mei Lin's, Ya's).

## Voice
James and Yuki deadpan and sarcastic; the villagers overly serious, formal, grave about honour, face, the Sect and their ancestors,
and they don't joke; Mei Lin looser (teases, laughs, and gets told off for it); Ya feral, blunt, flirting aggressively, easily
offended, no idea where civilised people draw lines; the mother tiny, fierce and magisterial; Old Wen grave, precise, one good eye;
Old Hu, the head hunter, salutes James like a general. The humour is dry and comes from James reacting to grave people. Avoid the
tics "something like", "for a moment", "in a way that", "the way a", "a long moment", "a long time", "the first time", "a thousand
years", "four hundred pounds", "a bone needle" (in prose; a label stays); avoid reusing any distinctive five-word run from
elsewhere in the game (check with grep in /home/claude/bone-and-ash/js); vary sentence openings. The text lint counts 21 of the
Fallout's 41 scenes sharing a passage with another scene and 21 with favourite phrases: bring both down.

## Your notes file
Write /tmp/rw-p4-info/notes.md: per scene, one line on what you changed and why; the SR lines; the YF spots (what each form does);
the CW lines; the ST entries; label suggestions; any continuity problem you found but didn't fix (with the line). Check:
`cd /tmp/rw-p4 && node -e "Promise.all([import('./js/story/act1_fallout.js'), import('./js/story/stomp_act1.js')]).then(()=>console.log('loads'))"`
prints "loads", and `grep -n TODO js/story/act1_fallout.js js/story/stomp_act1.js` prints nothing. Then reply with a 5-line summary.
