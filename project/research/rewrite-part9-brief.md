# Bone and Ash: the Fable rewrite, part 9 (the leftovers): the shared brief

You are rewriting story text in a hand-written branching text RPG. Parts 1–8 of this rewrite (the prologue, the Wilds, Ashfall, the
Fallout, the Blackroot, the Heart, the Return, the Long Forest) were yours and are in the game. Part 9 is the leftovers: the prologue's
last older fight texts and a list of small continuity faults the earlier parts' notes and reviews found. Claude keeps the code, tests
and docs.

Four runs, two at a time: run A and run B (the prologue's stomp texts, `js/story/stomp_prologue.js`, each its own fights), then run C
(the prologue, the Wilds, Yuki's path, the Coil screens, a few lines by others about James) and run D (the Fallout, the Blackroot, the
Long Forest). Your own task sheet says which lines are yours and which working copy you edit. **Edit only your own lines, only in your
working copy.**

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins): "James Green" (omnitool, hammerspace, Bonesinger and Convergence, why
  locals misread him, Flight, lifespans), "James: cooking, music and his archive" (for CW), "Yuki" (forms, her human look, **she and
  James remember every Coil through the bond; no one else does**), "The world" (the Coil), "The realms" (who can sense, who flies:
  locals only from Golden Core), "Places and people".
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone).
- Your file(s) once in full around your lines, so you know where they sit.

## Facts every text must agree with
- **Locals can't sense James's or Yuki's cultivation** (nor can beasts); they judge by what they see (a tall, soft, overeducated mortal
  in a ruined white lab coat, glasses, short pale blond hair and beard). They can see what Yuki *does*.
- **James never kills humans.** Beasts he may kill.
- **The Coil:** James and Yuki remember every earlier Coil; nobody else does. A text may be read on any Coil.
- **The prologue's week:** Day 1 the arrival; Day 2–3 the Wilds; Day 4 Mei Lin's scream on the herb slope, Ashfall; Days 4–6 the
  village; Day 7 the tribute (Inner Disciple Lu Han and three disciples: four men in crimson). Act 1: Days 8–21.
- **Stomp texts** (`js/story/power.js` top comment): when James far outclasses a fight the game shows a posture (all degrees: the
  fight's opening), and at degree 2 / 3 its own win text in place of the plain fight; "one" is the one-move finish. Degree 1 keeps the
  plain fight. `aside(d, a, b, c)` picks a line by degree. These texts are read by a player whose James is far above the foe; the joke
  is the gap, told dry.
- **The game's own gains are fixed** (a scene's `enter` / `do` adds items; the text must agree with them, never the other way).

## Yuki's three forms (YF)
`byForm(g, cat, greatRootKin, human)` (and `stompForm(g, cat, tiger, human)` in the stomp files) picks a text by her form:
- **cat**: a small white cat (eleven pounds), yellow eyes; speaks only through the bond (*italic*); rides his shoulder.
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger; gold eyes; bond speech only.
- **human**: a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit eyes, a long black
  high-collared qipao with red piping; speaks aloud, deadpan; a head shorter than James. Don't settle sister or lover (neutral).
`yk(g)` / `ykShort(g)` in `stomp_prologue.js` return a phrase naming her as she is ("Yuki, eleven pounds of white cat"; "Yuki, white
hair stirring, ears flat, arms folded"; "Yuki — currently the size of a Bengal tiger and twice as bored"). **A verb straight after
`${yk(g)}` breaks in two forms** ("…arms folded yawns."): use `stompForm` with three whole clauses instead, or put the phrase where no
verb follows.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each one,
  in a sensible place, unless your sheet removes it), the number of entries in byForm / stompForm / lists and which branch is which,
  conditions, checks, times, gains, the order of choices, enemy names, titles, `art:` values. The only code you may add, change or drop
  is what your sheet names, exactly.
- **Do not change choice labels** (a choice's `text:`). Label ideas go in your notes only (old → new, with a reason).
- Keep each text about the same length (±25%) and its story beats. You improve the writing and fix the named faults.
- Keep Markdown as used (*italic* for bond speech, thoughts, emphasis). A scene's first paragraph should stand alone (a re-read folds
  to it).
- In a single-quoted string an apostrophe needs `\'`; in backticks none; prefer backticks or double quotes when you replace a string.
- No song lyrics; adults only.

## CW, who he is under the deadpan (only runs whose sheet says so)
The owner, 2026-11-13 23:15, word for word: "for the act 1 journey, his cooking should also be very appreciated by the party, when we
get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his
character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in
music and culture reveal him to be a deeply caring and warm person." **Music generic only** (how it sounds, its kind in plain words),
**no artist names, no song titles, no lyrics.** A throwaway line by someone else, never a speech.

## Voice
James and Yuki deadpan and sarcastic, serious when it matters. Locals (Gao Feng, Lu Han and his disciples, the hunters, Old Wen, the
Tans, Fang Wei) overly serious about face, rank, Heaven and the Sect; they don't joke; the humour comes from James reacting to them.
Mei Lin is looser (teases, laughs). Beasts with dry wit, not cuteness. Avoid the tics "something like", "for a moment", "in a way
that", "the way a", "a long moment", "for a long moment", "a long time", "the first time", "a thousand years", "four hundred pounds",
"a great deal", "a good deal", "the far side", "sits down beside", "a black dress" (in prose), "since the lab", "light comes down",
"gold eyes level"; don't reuse any distinctive five-word run from elsewhere in the game (check with grep in your working copy's `js`);
vary sentence openings. Keep the best jokes that already work unless your sheet says otherwise: a rewrite is not a duty to replace
every good line.

## Your notes file and your check
Write your notes file (your sheet names it): per item, one line on what you changed and why; the YF spots; any CW lines (scene, who,
the line); label suggestions; any continuity problem you found but didn't fix (with the line). Run your sheet's load check. Don't
commit. Then reply with a 5-line summary.
