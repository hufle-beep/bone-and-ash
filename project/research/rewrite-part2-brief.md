# Bone and Ash: the Fable rewrite, part 2 (the Blackroot Wilds): the brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 2 (the prologue's
Blackroot Wilds, Days 2–3: James and Yuki alone in the forest before they reach the village). Part 1 (the prologue and shared
scenes) was yours and is in the game. Claude keeps the code, tests and docs.

## Where
- The original, read-only: /home/claude/bone-and-ash (do not edit anything there).
- Your working copy, edit here: /tmp/claude-0/rw-p2 (a scratch git worktree). Edit only `js/story/wilds.js` and the three lines
  of `js/story/task_hubs.js` named below.
- The list of older lines: /tmp/claude-0/rw-p2-info/older.lines. Its line numbers refer to the ORIGINAL files in
  /home/claude/bone-and-ash; the copy has 13 more lines near the top of wilds.js, so find each line by its text.

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins)
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and /home/claude/bone-and-ash/js/story/act1_common.js lines 1–25 (cast)
- The whole of /tmp/claude-0/rw-p2/js/story/wilds.js, and the prologue scenes just before and after it in
  /home/claude/bone-and-ash/js/story/prologue.js (the clearing, the camp, the stream, and the village's first scene), so the Wilds
  match what you wrote in part 1.

## Task 1: the older text (OT)
Rewrite the prose on the listed lines (last written before v0.11.69, i.e. not by you). Lines not listed are yours since then and stay.
Within a listed line, rewrite only the text inside string and template literals. This includes the scene texts, the result lines
inside `do:` / `failDo:` / `enter:` functions, the night foes' `intro:` lines, and in task_hubs.js lines 46–47 (Yuki's haul in the
Wilds: `got` and `none`). Yuki's haul line and the `yukihunt` result in wilds.js today say the same sentence ("comes back with a hare
and a look of mild contempt", "pretends she wasn't trying"): make them two different texts.

## Task 2: the silent work cards (SW)
In wilds.js there are ten new reply lists near the top, `DR_RING` … `DR_NEEDLE`, each with two placeholders "SW TODO <card> 1/2".
Replace each placeholder with a short line (one or two sentences, about 8–20 words): entry 1 is shown the first day the card succeeds
in a Coil (Day 2 usually), entry 2 the second day (Day 3). They are the reply to a SUCCESS:
- `DR_RING` the mushroom ring under the black oaks (shown after "+3 Jade bracket fungus.")
- `DR_CRESS` river cress in the shallows (after "+4 River cress.")
- `DR_BERRIES` needleberries (after "+5 Crimson needleberries.")
- `DR_HARE` glassback hare, a dart from cover (after "+2 Glassback hare."; glassback hares flash rainbows when they bolt, see the miss line)
- `DR_FOWL` mire fowl, a dart on the rise (after "+1 Mire fowl.")
- `DR_CRAB` stone-shell crab, a needle into the shell's joint (after "+2 Stone-shell crab meat.")
- `DR_DARTS` darts at marked trunks from further away (its only reply; then nothing else)
- `DR_BLADE` blade forms: grow the wraithbone blade, move, dissolve it, again (its only reply)
- `DR_FEET` footwork: Yuki pounces from cover, James tries not to be there; success (followed by Yuki's XP line)
- `DR_NEEDLE` needle drills: one point, one knuckle-width, a hundred times (its only reply)
Day 2's and Day 3's lines should differ (Day 3: some progress, or a callback to Day 2). Keep the existing failure lines in mind (Leeches,
Stung, It pinches back, Scratched, Birds got there first, Rainbows, then nothing) so a success doesn't echo them.
Do not touch anything but the two placeholder strings in each list.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each one, in
  a sensible place), the number of entries in byForm(...)/byDay(...)/dayReply(...) lists and which branch is which (cat / great
  root-kin / human for byForm), conditions, checks, times, gains, the order of choices, enemy `name:` values.
- **Do not change choice labels** (the `text:` of an entry in a `choices: [...]` array): tests and bots match them. Put suggestions in
  your notes instead.
- Result lines that carry numbers or items keep their mechanical part exactly ("+1 Glassback hare.", "−2 HP", "+3 Rot-crow feathers.",
  "+1 Murky beast core", item names, "HP partly back"); rewrite only the prose around them. Keep the prefixes "Breakfast. " and
  "An hour of rest" (the game's summaries match them).
- Keep each text about the same length (±25%) and every story beat and fact: what happens, what matters later (the lights flowing to
  the dead tree, the Hollow's roots singing the Hearth Trees' note, the Bone Field, the ghost-gills, the thornback's nest, "They've
  followed you" at the end of `stream_out`), names, numbers, the order of events. You improve the writing, you don't change the story.
- Keep Markdown as used (*italic* for bond speech, thoughts and emphasis). The game folds a re-read scene to its first paragraph, so a
  scene's first paragraph should stand alone.
- No song lyrics; adults only.

## Voice
James and Yuki deadpan and sarcastic (Yuki through the bond in her cat forms, aloud as a woman); nobody else is in the Wilds. The humour
is dry and comes from James's scientist's eye on an absurd, dangerous forest and from Yuki. Avoid the tics "something like", "for a
moment", "in a way that", "the way a", "a long moment", "a long time", "the first time", "a thousand years", "four hundred pounds of
cat"; avoid reusing any distinctive five-word run from elsewhere in the game (check with grep in /home/claude/bone-and-ash/js; e.g.
"formal complaint" and "owed an apology" are already used elsewhere); vary sentence openings.

## Riders (place lightly, where they fit)
1. The night's rules: no "push through the night"; beds from 21:00; night attacks at 01:00; after a night fight James and Yuki wake with
   only half of what they lost back. Fix any text that promises a full night after a fight (labels: suggestions only).
2. James's look, at most once in the Wilds and only if it fits (part 1 already placed it): thin rectangular glasses, short pale blond
   hair and beard, the ouroboros on his left forearm, the tree and raven on his right, a white lab coat.
3. Continuity with part 1 and lore.md: anything that contradicts them, fix in the listed lines or note it.

## Your notes file
Write /tmp/claude-0/rw-p2-info/notes.md: per scene, one line on what you changed and why; the label suggestions (old → new, with a
reason); any continuity problem you found but didn't fix (with the line). Then reply with a 5-line summary.
