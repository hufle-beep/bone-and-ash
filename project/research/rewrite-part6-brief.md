# Bone and Ash: the Fable rewrite, part 6 (the Heart): the shared brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 6: **Act 1's Heart,
Days 16–18** (James, Yuki, Mei Lin and Ya wake in the roots of the dead Hearth Tree on Day 16, go in by the cut at its foot, and
explore it from a hall inside the trunk: the ring-chambers and their grubs, the hot spring, the high wound the Sect cut, the
root-galleries down to the buried seed-ship *Patient Root*, its hearth-log (three memories: Wren's arrival, the song, the Lotus),
the camp in the hall each night, the bone door, the guardian, the heart-chamber and the seed-sliver; they leave at dawn on Day 19
for the Return). Parts 1–5 (the prologue and shared scenes, the Wilds, Ashfall, the Fallout, the Blackroot) were yours and are in
the game. Claude keeps the code, tests and docs.

The part runs in two runs: run 1 the scenes (`js/story/act1_heart.js`), run 2 the three fights' stomp texts after run 1 is merged.
Your own task sheet says which lines are yours. **Edit only your own lines.**

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins). Especially: "The world" (the poison: impure Qi is normal on every
  world, the deaths here made it worse, **this world's lifespans are normal**, Wren's "short-lived" is a gardener measuring against
  home; the Old Tree grown around the *Patient Root* about **a thousand years** ago; murdered about **four hundred years** ago);
  "James's place in it" (**James's world is the outlier**, and he only finds that out in Act 2, from the ship's sensor data: in
  Act 1 nobody, James included, says which is the outlier); the realm sheet; **locals can't sense James or Yuki, they place them
  by what they see**; Yuki's forms and "Her human look"; "James: cooking, music and his archive" (Task CW).
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and js/story/act1_common.js lines 1–25 (cast, the act's bible).
- The whole of js/story/act1_heart.js in your working copy; your Blackroot just before it
  (/home/claude/bone-and-ash/js/story/act1_blackroot.js: `heart_view` and `bl_end`, the night in the roots and the morning at
  the doorway); and the start of the Return (/home/claude/bone-and-ash/js/story/act1_return.js, `rt_start`), so the Heart
  matches what you wrote around it.

## What "older" means
Strings last written before v0.11.69 (not by you). Your sheet points to a list file: line number in your working copy, then the
start of the string. A multi-line template literal is listed by its first line; the whole literal is older. Strings not listed are
yours since v0.11.69 and stay, except where a task asks. **A string inside a `choices: [...]` entry's `text:` is a label: never edit
it, even if it shows up in a list.** Result lines inside `do:` / `failDo:` / `enter:` functions are prose (rewrite them), but keep
their mechanical part exactly ("+1 Hull-shard", "−2 HP.", "−4 HP.", "+1 Seed-sliver.", "Slept until 06:00. HP and Qi full.",
"about 40% of your HP and 10 Qi", "Breakfast. ", "Supper. "…): rewrite only the prose around the numbers and item names. Item
names stay.

## Yuki's three forms (YF), as in parts 3–5
The owner plays with Yuki in all three forms (he is usually at Nascent Soul or above by Day 16). `byForm(g, cat, greatRootKin,
human)` picks the text by her form:
- **cat**: a small white cat with yellow eyes; speaks only through the bond (*italic*); rides his shoulder.
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger, from Core Formation; gold eyes; bond speech only.
- **human**: from Nascent Soul; a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit
  eyes, a long black high-collared qipao with red piping; speaks aloud, deadpan; still bonded to James. Mei Lin and Ya treat her as
  what she is to them by now (Ya: a fellow predator; Mei Lin: grave politeness slipping into friendship). Don't settle whether she is
  James's sister or lover (neutral).
Review every `byForm(...)` and the `LOG_*` tables in your lines (all three branches: the same job, length ±25%, written for that
body: a tiger can't ride a shoulder or turn round in a gallery grown for gardeners; a woman answers aloud). Keep the number of
entries and the order. Any text that names or implies one form only and has no switch: make the wording fit all three (no new
code), or say so in your notes.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each
  one, in a sensible place), the number of entries in byForm(...)/byDay(...)/byDayLast(...)/dayReply(...) lists and which branch is
  which, conditions, checks, times, gains, the order of choices, enemy `name:` values, titles, `place:` values. The only code you
  may add or drop is what your sheet names, exactly.
- **Do not change choice labels** (see above). Label ideas: in your notes only (old → new, with a reason).
- Keep each text about the same length (±25%) and every story beat and fact: who knows what, what matters later (the cut at the
  foot of the trunk and the Sect's tool marks; the hall; the ring-chambers, the grubs and the cup with *Tamsin* on it; the spring;
  the high wound; the root-galleries, the shaft and the root-husk; the ship, the bridge, the gardeners' chair; the hearth-log's three
  memories as they are (Wren Aldous, forty gardeners out of the Ninth Grove, the drive failed, the Hearth planted; the centuries,
  the locals' songs; the man in red, three hundred disciples, nine days, the heart taken, the Sect founded, the poison back); Mei
  Lin's father and the road; the reactions and the comfort scenes exactly at their level; the bone door, the guardian and its
  half-song; the heart-chamber, the hollow and the seed-sliver; leaving on Day 19), names, numbers, the order of events. You improve
  the writing, you don't change the story.
- Keep Markdown as used (*italic* for bond speech, thoughts, the log's memories and emphasis). The game folds a re-read scene to its
  first paragraph, so a scene's first paragraph should stand alone.
- No song lyrics; adults only; romance stays exactly at the level it is (fade to black at the door).

## Continuity (in your lines; your own later lines too if they contradict)
1. **The calendar:** they wake at the doorway on Day 16; the Heart is Days 16–18 (a stay can run longer; from Day 19 the tree is
   done with them and they leave at dawn). Shen Qiu comes to Ashfall on Day 21. The camp nights are counted inside the tree, not
   from the start of the act.
2. **The nights:** watches; a quiet night, the knocking, or the whispering. No text should promise more than the scene gives.
3. **The ship:** nobody knows there is a ship under the roots until they find it (`g.flags.ship_found`). James *suspects* home is
   down there (the sap, the song); he doesn't know "the ship" until `ship_wreck`.
4. **Years:** the Tree has been dead four hundred years (dust, rot, the guardian's wait: four hundred); it grew about a thousand
   years ago (the cup, the ship's age: a thousand is right there); people lived in the rings for the six hundred years between.
5. **His look** (thin rectangular glasses, short pale blond hair and beard, the ouroboros on his left forearm, the tree and raven
   on his right, a white lab coat that is mostly holes by now): at most a glance.
6. **Ya and Mei Lin can't sense his Qi or Yuki's**; they judge by what they see.
7. Anything else that contradicts parts 1–5, lore.md or the Return's start: fix it in your lines, or note it.

## CW, who he is under the deadpan (the owner's own ask)
The owner, 2026-11-13 23:15, word for word: "for the act 1 journey, his cooking should also be very appreciated by the party, when
we get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his
character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in
music and culture reveal him to be a deeply caring and warm person."
- **Throwaway lines:** at most **3** in run 1 (none in run 2), one sentence each, by Mei Lin, Ya or Yuki, inside scenes that exist
  (no new code, no gains): a remark, an aside, a look; never a speech, never the point of the scene; James doesn't comment, or
  deflects deadpan. Material: he cooks very well with whatever the forest gives, he feeds the others first, he saves the best bit for
  someone, he hums or plays strange music low from his tool at camp (never while hunting). **Music generic only**: how it sounds, its
  kind in plain words (droning, synth, heavy guitars, a woman singing in a language nobody here knows), that it plays low; **no
  artist names, no song titles, no lyrics.** No kitchen shared with the mother and no communal pot (they come later). Not in the
  hearth-log scenes or the guardian's: the Heart's grief is not a place for jokes about supper.

## Voice
James and Yuki deadpan and sarcastic, serious when it matters (and the Heart is where it matters most: the log, the guardian, the
seed: let the deadpan drop there, as the old text does). Mei Lin looser (teases, laughs, gets told off by her own upbringing); here
she learns her grandmother's songs were about this tree and that her father died for the Sect. Ya feral, blunt, easily offended,
furious on the tree's behalf, a tracker who trusts her nose. The humour is dry and comes from James reacting to grave people and to
Ya. Avoid the tics "something like", "for a moment", "in a way that", "the way a", "a long moment", "a long time", "a long time
then", "the first time", "a thousand years" (except the cup and the ship), "for four hundred years", "four hundred pounds", "a great
deal", "a good deal", "the far side", "sits down beside", "a black dress" (in prose), "since the lab", "light comes down"; avoid
reusing any distinctive five-word run from elsewhere in the game (check with grep in /home/claude/bone-and-ash/js); vary sentence
openings. The text lint counts 23 of the Heart's 38 scenes with favourite phrases and 5 tics (`guardian_approach` "who comes" ×3,
`heart_core` "the hollow" ×3, `sect_cut` "the first" ×3, `roots_lost` "the shaft" ×3, `ship_log2` "I think" ×3): bring both down
(`ship_log2`'s "I think" is a young gardener's halting speech: keep the halting, lose the tic). `heart_hub`'s chunks shared with
other hubs are shared code lines (the pantry): leave them.

## Your notes file and your check
Write your notes file (your sheet names it): per scene, one line on what you changed and why; the YF spots (what each form does);
the CW lines (scene, who, the line); label suggestions; any continuity problem you found but didn't fix (with the line). Check that
your file loads (your sheet gives the command) and that `grep -n "TODO" <the file you edit>` prints nothing in your lines. Don't
commit. Then reply with a 5-line summary.
