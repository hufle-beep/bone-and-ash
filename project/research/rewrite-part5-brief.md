# Bone and Ash: the Fable rewrite, part 5 (the Blackroot): the shared brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 5: **Act 1's Blackroot,
Days 11–15** (James, Yuki, Mei Lin and Ya leave Ashfall at dawn on Day 11 and walk the Root Road (Days 11–12, the root-wyrm on
Day 12), cross the Drowned Wood (Day 13) and climb the Ashen Hills (Days 14–15, the rot-ape on Day 15), to camp under the dead
Hearth Tree; Day 16 06:00 hands over to the Heart. Day hubs per region with forage, hunt, scout, Practice and the talks; the shared
camp, fireside and night scenes; a seeded night event each night; the Mei Lin – Ya – James romance arc). Parts 1–4 (the prologue
and shared scenes, the Wilds, Ashfall, the Fallout) were yours and are in the game. Claude keeps the code, tests and docs.

The part runs in three runs; your own task sheet (run 1, 2 or 3) says which lines are yours. **Edit only your own lines.**

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins). Especially: the realm sheet (Mortal Vessel = Mei Lin and Ya);
  **locals can't sense James or Yuki, they place them by what they see** (Ya: "How do you taste like *nothing*"); Yuki's forms and
  "Her human look"; "The world" (the Old Tree: grown around the ship *Patient Root* about a thousand years ago, murdered about four
  hundred years ago); "James: cooking, music and his archive" (Task CW).
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and js/story/act1_common.js lines 1–25 (cast, the act's bible).
- The whole of js/story/act1_blackroot.js in your working copy; your Fallout, just before (/home/claude/bone-and-ash/js/story/
  act1_fallout.js: `fo_price` (Ya: "Five days in, maybe six."), `fo_plan`, `fo_last_night`, `fo_depart`), and the start of
  /home/claude/bone-and-ash/js/story/act1_heart.js (`ht_start`, just after), so the Blackroot matches what you wrote around it.

## What "older" means
Strings last written before v0.11.69 (not by you). Your sheet points to a list file: line number in your working copy, then the
start of the string. A multi-line template literal is listed by its first line; the whole literal is older. Strings not listed are
yours since v0.11.69 and stay, except where a task asks. **A string inside a `choices: [...]` entry's `text:` is a label: never edit
it, even if it shows up in a list.** Result lines inside `do:` / `failDo:` / `enter:` functions are prose (rewrite them), but keep
their mechanical part exactly ("+3 Jade bracket fungus (the root variety, almost sweet).", "−2 HP", "+8 HP.", "+2 root-hares (as
hare).", "Breakfast. ", satiety lines…): rewrite only the prose around the numbers and item names. Item names and the bracketed
"(as venison)" style stay.

## Yuki's three forms (YF), as in parts 3 and 4
The owner plays with Yuki in all three forms (he is usually at Nascent Soul or above by Day 11). `byForm(g, cat, greatRootKin,
human)` picks the text by her form:
- **cat**: a small white cat with yellow eyes; speaks only through the bond (*italic*); rides his shoulder.
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger, from Core Formation; bond speech only.
- **human**: from Nascent Soul; a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit
  eyes, a long black high-collared qipao with red piping; speaks aloud, deadpan; still bonded to James. Mei Lin and Ya treat her as
  what she is to them by now (Ya: a fellow predator; Mei Lin: grave politeness slipping into friendship). Don't settle whether she is
  James's sister or lover (neutral).
Do this in your lines: review every `byForm(...)` (all three branches, the same job, length ±25%, written for that body: a tiger
can't ride a shoulder or fit on a raft's corner unnoticed; a woman answers aloud). Where a branch is empty ('') and Yuki would
plainly be there and matter, you may write it. Keep the number of entries and the order. Any text that names or implies one form
only and has no switch: make the wording fit all three (no new code), or, if it can't, say so in your notes (Claude adds a switch).

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each
  one, in a sensible place), the number of entries in byForm(...)/byDay(...)/dayReply(...)/coilReply(...) lists and which branch is
  which, conditions, checks, times, gains, the order of choices, enemy `name:` values, titles, `place:` values.
- **Do not change choice labels** (see above). Label ideas: in your notes only (old → new, with a reason).
- Keep each text about the same length (±25%) and every story beat and fact: who knows what, what matters later (the route and its
  days; the root-wyrm and the bridge; the drowned and the Hollow; the hot spring; the trio's kiss, Ya offended and found, the
  romance nights exactly as they are; the lights flowing toward the old tree (`saw_lights`); Ya's tracking lessons; Ya's spar and
  her mockery; the dead tree seen from the ridge), names, numbers, the order of events. You improve the writing, you don't change
  the story.
- Keep Markdown as used (*italic* for bond speech, thoughts and emphasis). The game folds a re-read scene to its first paragraph, so
  a scene's first paragraph should stand alone.
- No song lyrics; adults only; romance stays exactly at the level it is (fade to black at the door).

## Continuity (in your lines; your own older lines too if they contradict)
1. **The calendar:** the expedition is five days: Day 11 dawn to Day 16 06:00 under the tree (`bl_day` 1–5); Ya told them
   "Five days in, maybe six" on Day 10 (`fo_price`). Shen Qiu comes to Ashfall on Day 21. Check every "three days", "four",
   "tomorrow", "two days" against it.
2. **The nights:** watches; beds from 21:00; a night fight at about 01:00; after a night fight James and Yuki wake with only half of
   what they lost back (`nightRest`). No text should promise a full night after a fight.
3. **His look** (thin rectangular glasses, short pale blond hair and beard, the ouroboros on his left forearm, the tree and raven
   on his right, a white lab coat, filthy by now): at most a glance.
4. **Ya and Mei Lin can't sense his Qi or Yuki's**; they judge by what they see (a man who grows bone out of the ground, a cat who
   is sometimes a tiger and sometimes a woman).
5. Anything else that contradicts parts 1–4, lore.md or the Heart's start: fix it in your lines, or note it.

## CW, who he is under the deadpan (the owner's own ask), shared across the runs
The owner, 2026-11-13 23:15, word for word: "for the act 1 journey, his cooking should also be very appreciated by the party, when
we get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his
character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in
music and culture reveal him to be a deeply caring and warm person."
- **Throwaway lines:** at most **3 per run** (6 in all), one sentence each, by Mei Lin, Ya or Yuki, inside scenes that exist (no
  new code, no gains): a remark, an aside, a look; never a speech, never the point of the scene; James doesn't comment, or deflects
  deadpan. Material: he cooks very well with whatever the forest gives (elk, root-hares, truffles, fire-beetles, sorrel, fowl), he
  feeds the others first, he saves the best bit for someone, he hums or plays strange music low from his tool at camp (never while
  hunting). **Music generic only**: how it sounds, its kind in plain words (droning, synth, heavy guitars, a woman singing in a
  language nobody here knows), that it plays low; **no artist names, no song titles, no lyrics.** No kitchen shared with the
  mother and no communal pot (they come later).
- Run 2 also writes the cooking replies (its sheet).

## Voice
James and Yuki deadpan and sarcastic; Mei Lin looser (teases, laughs, gets told off by her own upbringing), frightened in the
Drowned Wood and refusing to show it; Ya feral, blunt, flirting aggressively, easily offended, no idea where civilised people draw
lines, a tracker who trusts her nose. Locals (the ones left behind) grave. The humour is dry and comes from James reacting to grave
people and to Ya. Avoid the tics "something like", "for a moment", "in a way that", "the way a", "a long moment", "a long time",
"the first time", "a thousand years", "four hundred pounds", "a great deal", "a good deal", "the far side", "sits down beside",
"a black dress" (in prose; a label stays); avoid reusing any distinctive five-word run from elsewhere in the game (check with grep in
/home/claude/bone-and-ash/js); vary sentence openings. The text lint counts 25 of the Blackroot's 60 scenes with favourite phrases
and 2 tics (`wyrm_won`/`wyrm_lost` "turns out" ×3, `mei_raft` "the water" ×3): bring both down. The three hubs share 20 chunks
with each other: those are shared code lines (the pantry, the hub's frame), leave them.

## Your notes file and your check
Write your notes file (your sheet names it): per scene, one line on what you changed and why; the new lines your sheet asks for;
the YF spots (what each form does); the CW lines (scene, who, the line); label suggestions; any continuity problem you found but
didn't fix (with the line). Check that your file loads:
`cd <your working copy> && node -e "Promise.all([import('./js/story/act1_blackroot.js'), import('./js/story/stomp_act1.js')]).then(()=>console.log('loads'))"`
prints "loads", and `grep -n "TODO" <the file you edit>` prints nothing **in your own lines** (the other run's TODOs are not
yours). Don't commit. Then reply with a 5-line summary.
