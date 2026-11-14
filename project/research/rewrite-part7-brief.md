# Bone and Ash: the Fable rewrite, part 7 (the Return): the shared brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 7: **Act 1's Return,
Days 19–21** (James, Yuki, Mei Lin and Ya leave the dead Hearth Tree at dawn on Day 19, take Ya's way home: one day through the
Blackroot, ash-wolves, the ford and its serpent, the last camp on the far bank; they reach Ashfall on Day 20: Old Wen, Mei Lin's
mother, the planting of the seed-sliver, the village hub (the hunters' drill, the council, the grove, Ya in the village, the
brawl with Hunter Bao), the evening and its nights; on Day 21 Outer Elder Shen Qiu comes: the parley, the truth, the accord, the
duel, or being taken; `a1_end`). Parts 1–6 (the prologue and shared scenes, the Wilds, Ashfall, the Fallout, the Blackroot, the
Heart) were yours and are in the game. Claude keeps the code, tests and docs.

The part runs in runs: run 1 the Return's scenes (`js/story/act1_return.js`), run 1b (in parallel) the Heart's lines about the ship
now that she has a name, run 2 the four fights' stomp texts after run 1 is merged. Your own task sheet says which lines are yours.
**Edit only your own lines.**

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins). **New since part 6, read it closely: "Selene"** (the owner's words
  and the facts: her name, never "the ship" once James knows it, what ships are to his people, what James knows about her, the
  anomaly, the myth scene) and **"Humans and Qi everywhere"** in "The world". Also: "The world" (the poison, normal lifespans,
  the Old Tree ~1,000 years ago, murdered ~400 years ago), the realm sheet (Shen Qiu: Core Formation, has lived three hundred
  years), **locals can't sense James or Yuki, they place them by what they see**, Yuki's forms and "Her human look",
  "James: cooking, music and his archive" (Task CW).
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and js/story/act1_common.js lines 1–25 (cast, the act's bible).
- Your Heart just before it (/home/claude/bone-and-ash/js/story/act1_heart.js: `heart_core`, `heart_core_after`, `ht_leave`),
  and Ya's talks in the Blackroot (`talk_ya` in /home/claude/bone-and-ash/js/story/act1_blackroot.js, around line 1060–1080:
  her childhood as she tells it).

## Selene (the owner's rule, 2026-11-14 04:44)
James learns her name in Wren's log (`ship_log`, the Heart). **From then on she is "Selene", "she", "her": never "the ship",
never "the ship Selene", never "the Selene".** Everything in the Return comes after the log, so in the Return she is always
Selene or she. "A seed-ship" or "ships" in general (his people's ships) is fine. She is asleep, not dead; sentient, not sapient;
to his people ships are homes, family and transport at once, adored and revered. James knows the name from home: one of his
Earth's first colony attempts, lost; nobody ever learned what happened to her. He now knows (the log): a spacetime anomaly threw
her off course and across, then her drive failed and she fell; forty gardeners planted the Old Tree around her.

## What "older" means
Strings last written before v0.11.69 (not by you). Your sheet points to a list file: line number in your working copy, word
count, then the start of the string. A multi-line template literal is listed by its first line; the whole literal is older.
Strings not listed are yours since v0.11.69 and stay, except where a task asks. **A string inside a `choices: [...]` entry's
`text:` is a label (also a label written as a function, `text: (g) => …`): never edit it, even if it shows up in a list.** Result
lines inside `do:` / `failDo:` / `enter:` functions are prose (rewrite them), but keep their mechanical part exactly ("+20
satiety", "HP and Qi full", item names, numbers): rewrite only the prose around them.

## Yuki's three forms (YF), as in parts 3–6
The owner plays with Yuki in all three forms (he is usually at Nascent Soul or above by Day 19). `byForm(g, cat, greatRootKin,
human)` picks the text by her form:
- **cat**: a small white cat with yellow eyes; speaks only through the bond (*italic*); rides his shoulder.
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger, from Core Formation; gold eyes; bond speech only.
- **human**: from Nascent Soul; a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit
  eyes, a long black high-collared qipao with red piping; speaks aloud, deadpan; still bonded to James. Mei Lin and Ya treat her as
  what she is to them by now (Ya: a fellow predator; Mei Lin: grave politeness slipping into friendship). Don't settle whether she is
  James's sister or lover (neutral). Mei Lin's mother counts her as a fourth guest.
Review every `byForm(...)` in your lines (all three branches: the same job, length ±25%, written for that body: a tiger can't ride a
shoulder or sit in a lap; a woman answers aloud). Keep the number of entries and the order. Any text that names or implies one form
only and has no switch: make the wording fit all three (no new code), or say so in your notes.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each
  one, in a sensible place), the number of entries in byForm(...)/byDay(...)/lists and which branch is which, conditions, checks,
  times, gains, the order of choices, enemy `name:` values, titles, `place:` values. The only code you may add or drop is what your
  sheet names, exactly.
- **Do not change choice labels.** Label ideas: in your notes only (old → new, with a reason).
- Keep each text about the same length (±25%) and every story beat and fact: who knows what, what matters later (the road home,
  the wolves, the ford, the camp, the arrival, Old Wen's warning of Shen Qiu, the mother, the planting and its three songs, the
  grove, the hunters and the militia, the council, the brawl's ritual, the romance nights exactly at their level (fade to black at
  the door), Shen Qiu's parley, the truth, the accord, the duel and the taking, `a1_end`), names, numbers, the order of events. You
  improve the writing, you don't change the story.
- Keep Markdown as used (*italic* for bond speech, thoughts and emphasis). The game folds a re-read scene to its first paragraph,
  so a scene's first paragraph should stand alone.
- No song lyrics; adults only; romance stays exactly at the level it is (frank and sensual up to the door, then fade to black).

## Continuity (in your lines; your own later lines too if they contradict)
1. **The calendar:** they leave the Heart at dawn on Day 19 and take Ya's way, one day; the last camp is the night of Day 19 on
   the far bank; they reach Ashfall on Day 20; Shen Qiu comes on Day 21 (breakfast at Mei Lin's first, at 08:00). They left
   Ashfall for the Blackroot on Day 11: **nine days away** by Day 20 (five days to the tree, three inside it, one home).
2. **Years:** the Old Tree grew about a thousand years ago and sang for about **six hundred**; it has been dead about **four
   hundred**; the Sect was founded when its heart was taken, about four hundred years ago. Selene and her hull are a thousand
   years old (right). Shen Qiu has lived three hundred years.
3. **The seed-sliver:** in the heart-chamber it was "a sliver of heartwood, no longer than your hand", pale, faintly green, warm,
   humming, singing. In the Return keep it **no longer than his hand** (feeling smaller in daylight is fine; no measure that
   contradicts). It is in his hammerspace, **unless Mei Lin carried it** (`g.flags.mei_carried_seed`: she wrapped it in her own
   sleeve and carried it out against her heart; her hand never left it).
4. **Ya's childhood** as she tells it in `talk_ya`: a hunter woman found her in a wolf den when she was too small to remember
   anything before it (the wolves were feeding her; she bit the hunter); taught her words, the spear, snares; the ape killed the
   hunter at the pass when Ya was twelve; fifteen years alone since; villages throw stones (once a priest).
5. **His look** (thin rectangular glasses, short pale blond hair and beard, the ouroboros on his left forearm, the tree and raven
   on his right, a white lab coat that is mostly holes by now): at most a glance.
6. **Ya and Mei Lin can't sense his Qi or Yuki's**; they judge by what they see. Nor can Shen Qiu: he judges by what James does.
7. Anything else that contradicts parts 1–6, lore.md or the Heart: fix it in your lines, or note it.

## CW, who he is under the deadpan (the owner's own ask)
The owner, 2026-11-13 23:15, word for word: "for the act 1 journey, his cooking should also be very appreciated by the party, when
we get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his
character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in
music and culture reveal him to be a deeply caring and warm person."
- **Throwaway lines:** at most **3** in run 1 (none in runs 1b and 2), one sentence each, by Mei Lin, Ya, Yuki, Old Wen or the
  mother, inside scenes that exist (no new code, no gains): a remark, an aside, a look; never a speech, never the point of the
  scene; James doesn't comment, or deflects deadpan. Material: he cooks very well with whatever the forest gives, he feeds the others
  first, he saves the best bit for someone, he hums or plays strange music low from his tool at camp (never while hunting). **Music
  generic only** (how it sounds, its kind in plain words: droning, synth, heavy guitars, a woman singing in a language nobody here
  knows), **no artist names, no song titles, no lyrics.** No kitchen shared with the mother and no communal pot (they come later,
  CM). Not in the Elder's scenes or the planting.

## Voice
James and Yuki deadpan and sarcastic, serious when it matters (the planting, Shen Qiu, the nights where someone is honest). Mei Lin
looser (teases, laughs, gets told off by her own upbringing); she knows now that her father died for the Sect. Ya feral, blunt,
easily offended, a tracker who trusts her nose. The locals (Old Wen, the mother, the hunters, Shen Qiu) overly serious, grave about
face and form; the humour comes from James reacting to them and to Ya. Avoid the tics "something like", "for a moment", "in a way
that", "the way a", "a long moment", "a long time", "the first time", "a thousand years" (except Selene and her hull), "for four
hundred years", "four hundred pounds", "a great deal", "a good deal", "the far side", "sits down beside", "a black dress" (in prose),
"since the lab", "light comes down"; avoid reusing any distinctive five-word run from elsewhere in the game (check with grep in
/home/claude/bone-and-ash/js); vary sentence openings. The text lint counts 11 of the Return's 46 scenes with favourite phrases and
2 tics (`rt_mother` "the street says" ×3, `rt_trio` "mei lin's" ×3): bring both down (the mother's "the street says" can stay a
rhetorical repeat if you keep it to two). `a1_end` shares 12 five-word chunks with `rt_quiet_night`: make them differ.

## Your notes file and your check
Write your notes file (your sheet names it): per scene, one line on what you changed and why; the YF spots (what each form does);
the CW lines (scene, who, the line); label suggestions; any continuity problem you found but didn't fix (with the line). Check that
your file loads (your sheet gives the command) and that `grep -n "TODO" <the file you edit>` prints nothing in your lines. Don't
commit. Then reply with a 5-line summary.
