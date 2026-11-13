# Bone and Ash: the Fable rewrite, part 1 (prologue and shared scenes): the brief

You are rewriting the OLDER story text of a hand-written branching text RPG. The owner has decided the game's text is to be
rewritten by you (Fable), part by part; this is part 1. Claude keeps the code, tests and docs.

## Where
- The original, read-only: /home/claude/bone-and-ash (do not edit anything there).
- Your working copy, edit here: /tmp/claude-0/rw-p1 (the same repo, a scratch git worktree). Edit only the files named in your task.
- Line numbers in the *.lines files refer to the ORIGINAL file in /home/claude/bone-and-ash; they shift in your copy as you edit, so find each line by its text.

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins; note the realm sheet and the lifespans/outlier canon)
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and /home/claude/bone-and-ash/js/story/act1_common.js lines 1–25 (cast)
- The whole of each file you rewrite, so you know the story around your lines.

## What to rewrite
Only the prose on the listed lines ("older" lines: last written before v0.11.69, i.e. not by you). Lines not listed were written by you
since then and stay, unless a rider below needs a touch there. Within a listed line, rewrite only the text inside string and
template literals.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each one, in
  a sensible place), the number of entries in byForm(...)/byNight(...)/byDay(...) calls and which branch is which (cat / great root-kin /
  human for byForm), conditions, checks, times, gains, the order of choices.
- **Do not change choice labels** (the `text:` of an entry in a `choices: [...]` array): tests and test bots match them. If one is weak, put
  your suggestion in your notes file instead.
- Result lines that carry numbers or items keep their mechanical part exactly ("+18 satiety", "−2 HP", "+1 Glassback hare (dressed).",
  "HP and Qi full", item names); rewrite only the prose around them.
- Keep each text about the same length (±25%) and every story beat and fact: what happens, who says what that matters later, names,
  numbers the story states, the order of events. You improve the writing, you do not change the story.
- Keep Markdown as used (*italic* for bond speech and thoughts). Keep paragraph breaks where a scene depends on a first paragraph (the
  game folds a re-read scene to its first paragraph, so the first paragraph should stand alone).
- No song lyrics; romance fades to black at the door; adults only.

## Voice
James and Yuki deadpan and sarcastic (Yuki through the bond in her cat forms, aloud as a woman); locals grave and formal about honour,
face, hierarchy, Heaven and the Sect, never joking; Mei Lin looser (teases, laughs, then checks who heard); Ya feral and blunt (not in
part 1 much). The humour comes from James reacting to grave people. Avoid the tics "something like", "for a moment", "in a way that",
"the way a", "a long moment", "a long time", "the first time"; avoid reusing any distinctive five-word run from elsewhere in the game;
vary sentence openings.

## Riders (the owner's open story items that belong to part 1; place them where they fit naturally, lightly)
1. Mei Lin's clothes: `herb_girl` describes "a patched brown jacket"; her picture has a white jacket with a red sash, a long dark skirt,
   black hair with a red ribbon. Fix the description there and anywhere else in your lines.
2. James's look, once or twice where it fits (never a list): thin rectangular glasses; short pale blond hair and a short full beard; on
   his left forearm an ouroboros tattoo (a closed ring, the serpent eating its own tail), on his right a tree with curling roots and red
   streaks, a raven perched on it. He wears a white lab coat. No real-world emblems.
3. Yuki's cultivation can't be sensed by locals either, the same as James's: where a local notices her power, they see a cat (or a big
   cat, or a woman), not a realm.
4. The night's rules: there is no "push through the night"; beds from 21:00; night attacks at 01:00; after a night fight James and Yuki
   wake with only half of what they lost back. Fix any text that promises a full night after a fight (e.g. `jackals_won`'s choice
   "Sleep. Properly, this time." is a label: put a suggestion in your notes; fix the scene prose around it if it promises a full night).
5. (Task A only) the prologue camp (`camp`): its line "The fire crackles." and "A ring of bone stakes leans outward around the camp."
   show the same on all three nights: give each three versions with byNight(g, [night 1, night 2, night 3]) (byNight is already
   imported in prologue.js and used in that same scene; follow that pattern).
6. Realm flavour from lore.md's realm sheet, only where it fits (how locals speak of realms, Foundation as common for Sect disciples,
   Lu Han and Gao Feng as Foundation, the Elder's ladder talk). Locals can never sense James's realm.

## Your notes file
Write /tmp/claude-0/rw-p1-info/notes-<TASK>.md: per scene, one line on what you changed and why (better pacing, a tic removed, a
rider placed); the label suggestions (old → new, with a reason); any continuity problem you found but didn't fix (with the line).
Then reply with a 5-line summary.
