# Bone and Ash: the Fable rewrite, part 8 (the Long Forest): the shared brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 8, the last: **the Long
Forest** (`js/story/longforest.js`): the camp where James and Yuki "stay lost" in the prologue and climb the realms one season at a
time, its daily scenes, its four trial zones and ten fights, the two wandering encounters (the Tan brothers, Fang Wei), and Yuki's
form scenes (her great form, her human form, the form chooser), which every player sees wherever the breakthrough happens. Parts 1–7
(the prologue, the Wilds, Ashfall, the Fallout, the Blackroot, the Heart, the Return) were yours and are in the game. Claude keeps the
code, tests and docs.

The part runs in four runs, two at a time: run A the Long Forest's scenes, run B the ten fights' stomp texts (beside A), then run C
Yuki's form scenes and the season lines, run D the second texts for repeated visits and the drill lines (beside C). Your own task
sheet says which lines are yours. **Edit only your own lines.**

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins): "James Green" (his people live **800–900 years** at Mortal Vessel; the
  omnitool and hammerspace; Bonesinger and Convergence; why locals misread him; Flight), "James: cooking, music and his archive"
  (Task CW), "Yuki" (forms, her human look, **she and James remember every Coil through the bond; no one else does**), "The world"
  (the Coil; the Old Tree), "The realms" (the realm sheet: Fang Wei is Foundation; locals fly only from Golden Core; a local's guess at
  James), "Places and people" (the Long Forest: Fang Wei, "lapsed", and the Tan brothers).
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone).
- The whole of /home/claude/bone-and-ash/js/story/longforest.js once (about 700 lines), so you know where your lines sit.

## Where the Long Forest sits (facts; texts must agree)
- **The prologue, the second Coil or later only.** The Long Forest opens only from Coil 2 (`lfOpen`): James has already lived the
  prologue's week at least once (Day 1 the arrival in the wilds; Day 4 Mei Lin's scream; Ashfall, Old Wen, the Crimson Lotus; Day 7
  the tribute) and the Coil threw him back to the first dawn. He and Yuki remember; nobody else does. He walks in from the clearing on
  Day 1, or from the arrival ("You remember this. Stay lost."). **So he does not "know nothing about this world":** he knows the
  week, the village, the Sect and what is coming; what he doesn't know is how far he can climb, and he has decided to find out before
  he walks back into it. Don't name Mei Lin's village's people beyond what fits (he may think of "the scream on Day 4", "the village",
  "the tribute"). Don't name Selene or say what is inside the dead tree (a player may or may not have reached Act 1).
- **The days are not counted.** The clock reads "The Long Forest". A season of seclusion is a narrative season (the task card takes
  two hours of the clock; the story says a season passed). **A player can climb all fourteen rungs in one forest day and never sleep
  there** (the owner did: 14 seasons, 0 days). So no text may assume a number of days or weeks spent here ("several weeks of forest",
  "you stopped counting the days a while ago" on the very first screen): write time-neutral, or let the season do the work.
- **Leaving:** "Walk toward the smoke" starts Day 4 at dawn (the scream: Mei Lin); or "Go back the way you came" (the calendar starts
  again where he walked in).
- **His realm here can be anything from Mortal Vessel to the 14th rung.** Yuki's great form from Core Formation (realm 2), her human
  form from Nascent Soul (realm 7). From Foundation (realm 1) James and Yuki can fly (riding the Qi flows like currents; natural to
  them); you may use it lightly where a text already depends on realm, never as a requirement.
- **Locals can't sense James or Yuki** (beasts can't either, in the field notes' finding); they judge by what they see: a tall, soft,
  overeducated mortal in a ruined white lab coat (glasses, short pale blond hair and beard; at most a glance). The Tan brothers call the
  coat a robe; Fang Wei, Foundation, is proud of Qi senses that find nothing on him. **James never kills humans.**
- **The dead tree** at the heart of the Blackroot: grey, enormous; his Convergence hears the note the Hearth Trees sing at home. He
  doesn't go to it from here.

## What "older" means
Strings last written before v0.11.69 (not by you). Your sheet points to a list file: line number in your working copy, word count,
then the start of the string. A multi-line template literal is listed by its first line; the whole literal is older. Strings not
listed are yours since v0.11.69 and stay, except where a task asks. **A string inside a `choices: [...]` entry's `text:` is a label
(also `fightChoice(id, 'label')`'s second argument, and a label written as a function): never edit it.** Result lines inside `do:` /
`failDo:` / `enter:` functions are prose (rewrite them), but keep their mechanical part exactly ("+3 Jade bracket fungus.", "−3 HP",
"+40 satiety", "HP and Qi full", item names, numbers): rewrite only the prose around them.

## Yuki's three forms (YF)
The owner plays with Yuki in all three forms. `byForm(g, cat, greatRootKin, human)` picks the text by her form:
- **cat**: a small white cat (eleven pounds), yellow eyes; speaks only through the bond (*italic*); rides his shoulder or sleeps on him.
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger, from Core Formation; gold eyes; bond speech only.
- **human**: from Nascent Soul; a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit
  eyes, a long black high-collared qipao with red piping; speaks aloud, deadpan; still bonded to James; a head shorter than him. Don't
  settle whether she is James's sister or lover (neutral).
Review every `byForm(...)` in your lines (all three branches: the same job, length ±25%, written for that body: a tiger can't ride a
shoulder or sit on a chest; a woman answers aloud). Keep the number of entries and the order. A text with no switch that names or
implies one form only: make the wording fit all three (no new code), or say so in your notes.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each one,
  in a sensible place), the number of entries in byForm(...)/lists and which branch is which, conditions, checks, times, gains, the
  order of choices, enemy `name:` values, titles, `place:` values, `art:` values. The only code you may add or drop is what your sheet
  names, exactly.
- **Do not change choice labels.** Label ideas: in your notes only (old → new, with a reason).
- Keep each text about the same length (±25%) and every story beat and fact. You improve the writing, you don't change the story.
- Keep Markdown as used (*italic* for bond speech, thoughts and emphasis). The game folds a re-read scene to its first paragraph, so a
  scene's first paragraph should stand alone.
- Inside a template literal (backticks) an apostrophe needs no escape; inside a single-quoted string it does (`\'`); prefer double
  quotes for a string with apostrophes if you replace a whole string. Run your sheet's load check after editing.
- No song lyrics; adults only.

## CW, who he is under the deadpan (the owner's own ask)
The owner, 2026-11-13 23:15, word for word: "for the act 1 journey, his cooking should also be very appreciated by the party, when we
get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his
character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in
music and culture reveal him to be a deeply caring and warm person." Only the runs whose sheet says so add CW lines. **Music generic
only** (how it sounds, its kind in plain words), **no artist names, no song titles, no lyrics.**

## Voice
James and Yuki deadpan and sarcastic, serious when it matters (the dead tree, the white stag, Yuki's first words aloud). The locals
here (the Tan brothers, Fang Wei) overly serious about face and their own importance; the humour comes from James reacting to them.
The beasts are written with dry wit, not cuteness. Avoid the tics "something like", "for a moment", "in a way that", "the way a",
"a long moment", "for a long moment", "a long time", "the first time" (except Yuki's first words aloud, where it is the point),
"a thousand years", "for four hundred years", "four hundred pounds", "a great deal", "a good deal", "the far side", "sits down beside",
"a black dress" (in prose), "since the lab", "light comes down", "gold eyes level"; avoid reusing any distinctive five-word run from
elsewhere in the game (check with grep in /home/claude/bone-and-ash/js); vary sentence openings. Keep the best jokes that already
work (the lightning's checklist, "Only a mortal.", the bone mouse, "*show-off.*", "Lost," "Don't make it weird") unless the sheet says
otherwise: a rewrite is not a duty to replace every good line.

## Your notes file and your check
Write your notes file (your sheet names it): per scene, one line on what you changed and why; the YF spots (what each form does); any
CW lines (scene, who, the line); label suggestions; any continuity problem you found but didn't fix (with the line). Check that your
file loads (your sheet gives the command) and that `grep -n "TODO" <the file you edit>` prints nothing in your lines (other runs'
TODOs may remain; your sheet says which). Don't commit. Then reply with a 5-line summary.

# Part 8 (the Long Forest): Fable's cold review

You review a finished, uncommitted rewrite of the Long Forest in the game Bone and Ash. Two reviewers run side by side: **review T
(text, canon, continuity)** and **review C (code, tests)**. Your prompt says which you are. Read only; **don't edit
/home/claude/bone-and-ash** (review C has its own scratch copy for planted faults, below). Write your report to
/tmp/rw-p8-info/review-<T or C>.md and reply with a 6-line summary.

## What was asked (the owner's pick P8A, word for word in Claude's options)
OT the older text of the Long Forest's scenes; YA Yuki's form scenes (seen game-wide); ST the ten fights' stomp texts; IN the ten
never-shown intros emptied; CO the second Coil (the Long Forest opens only from Coil 2: James has lived the prologue's week; the old
entry said "I know nothing about this world"); FX the fixes (the day-0 hub line "You stopped counting the days a while ago"; "several
weeks of forest"; "nine hundred years" → 800–900; "the size of a pony" → Bengal tiger; "Don't tell anyone I can talk" (she talks aloud
everywhere later); "for a long moment" ×2, "a good deal"; the hunt's "Rainbows, then nothing."); YF six cat-only places by form; RP the
18 daily scenes that came back with one text get a later-visit text (world flags `lf_seen_<key>` count visits per Coil; the encounters
count meetings, not outcomes); SS the 5 season lines → 14, one per rung; SW the silent drills (7 results × 3 lines, the line picker);
CW two passing lines. No id, flag, check, gain or label change.

## Sources
- The new version: /home/claude/bone-and-ash (branch `p8-work`): `js/story/longforest.js`, `js/story/prologue.js` (`SEASON_LINES`,
  `lfSeason`), `tests/story.test.mjs` (the block "v0.11.175 (owner pick P8A" and two updated pins near "NQ1" / "NR1").
- The old version (v0.11.174): /tmp/old174/js/story/longforest.js and prologue.js; `git -C /home/claude/bone-and-ash diff origin/main..p8-work`.
- Fable's briefs and notes: /tmp/rw-p8-info/brief-common.md, sheet-run{A,B,C,D}.md, notes-run{A,B,C,D}.md.
- Canon: /home/claude/bone-and-ash/project/lore.md; rules: CLAUDE.md rule 7; how stomp texts work: js/story/power.js's top comment;
  how the prologue reaches the Long Forest: prologue.js (search `lfOpen`, `lfSeason`, `Stay lost`); the task cards: js/story/task_hubs.js
  (`lf_hub`) and js/core/tasks.js (menus' scene texts are never drawn).

## Review T: text, canon, continuity
Read every changed string, old against new. Report: anything that contradicts lore.md, the prologue's week (Coil 2+), the facts in the
brief ("Where the Long Forest sits"), the loot, the realm sheet (who can sense, who flies), Yuki's forms (each branch fits its body; a
woman speaks aloud), the order of visits (a later-visit text that only works after a particular outcome; a first-visit text that
assumes earlier visits), time words (days, weeks, "again") on day 0, things named that James can't know, tone (deadpan James and
Yuki; grave locals; no cuteness), tics and favourite phrases (the brief's list), lines that lost a beat or a joke worth keeping, and
the two CW lines (generic music only). Rate each finding high / medium / low, with the line and a proposed fix.

## Review C: code, tests
Read the code diff (the visit counters `seenOf`/`visit`/`later`, the scenes' new `enter` functions and their order against
`markDaily`, `lf_trial_won`'s second-win branch by `lf_trials_won`, the encounters' counters set in `lf_wanderers`'s enter and read in
`lf_human_talked` / `_won` / `_lost`, `LF_DRILL` and `lfDrill` with `pickLine`, the drills' do / failDo, `SEASON_LINES` indexed by rung,
the emptied intros, any byForm Fable added). Check: saves (new world flags and line-picker pools: old saves load; a rewind clears the
counters; nothing orphaned), the task screen (the drills' lines shown as card results; the season card), the fold of a re-read scene
(a later text reads as new), previews and the text lint (a text function with side effects?), anything a bot or a test would now see
differently. Then the tests: are the P8A assertions strong enough? **Planted faults:** in your scratch copy /tmp/rw-p8r (a git
worktree of the same branch), plant at least 15 faults one at a time (e.g. `later` reading `>= 1`; a later text equal to the first;
a drill list with a duplicate; `SEASON_LINES` index off by one; a byForm branch swapped; an intro restored; a visit counted twice; a
TODO left; a label changed; a lost `${name}`), run `node tests/story.test.mjs 2>&1 | grep -c FAIL` (about 4 minutes; run them one at a
time, never two at once: the machine has 2 cores and review T is running beside you) — **or, faster, run only the P8A block by
copying it into a small script** — and report which passed undetected, with a proposed test for each (TG1, TG2, …). Revert each fault
(`git -C /tmp/rw-p8r checkout -- .`). Rate findings high / medium / low with a proposed fix.
