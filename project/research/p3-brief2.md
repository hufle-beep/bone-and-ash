# Bone and Ash, v0.11.230 drafts, part 2 (owner pick AS1: lines for when both women are away)

You draft story texts for a hand-written text RPG. Read ONLY this brief and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan. Second person ("you" = James). Yuki, his bonded white cat, has three forms: the cat (speaks only through the bond, in italics `*like this*`), the great root-kin (a tiger-sized white cat, also bond only), the woman (speaks aloud, in quotes). If a line names her look or her speech, write all three forms; otherwise leave her out.

Context: Act 1, the Ashen Hills camp (ash and grey hills, a ridge). On some days Mei Lin and Ya have both gone off to a spring under the ridge for water and are away from camp for the day. On those days James still does his Practice drills (bone darts thrown at a mark from farther and farther; bone needles grown slowly and exactly) and cooks at the camp fire. The lines below name one or both women; write a version of each with NEITHER woman in it. Same idea and length (one or two sentences; the cook lines up to three), the same success or failure. Don't say where the women are or that they are away (the screen says so elsewhere); a line can simply be James alone, or James and Yuki. Make the 14 lines different from each other; at most two of them may note the quiet or the solitude. Avoid the canon card's tics, and these phrases already used by the lines around them: "to make it interesting", "which is the report", "holding opinions of their own", "a toothpick", "dissolve the whole batch", "own the fault", "the mark looks on".

Dart successes:
- `dart:1` "Twenty paces, then thirty, then forty. Somewhere past thirty the mark stops being there to hit. Ya says it had that coming."
- `dart:3` "Farther again. Ya goes and stands by the mark to make it interesting. You make it less interesting than she hoped, and she is impressed, slightly."
- `dart:4` "Mei Lin picks the mark today, a small one, to be awkward. Three darts land in it, touching. She says she meant another."
- `dart:5` "From so far back that Ya has to walk out and report. She comes back slower than she went, which is the report."

Needle successes:
- `needle:2` "Finer than the last lot. You hold one up against the light and lose sight of it. Mei Lin asks, professionally, whether it would take a thread."
- `needle:3` "Slow enough to hear each one arrive. Ya watches for a hundred breaths, announces that nothing is happening, and stays to watch more of it. Mei Lin studies Ya studying you, and would deny it."
- `needle:5` "Slow, exact and at last boring, which is what a drill is for. Mei Lin says you looked almost peaceful, and sounds suspicious."

Failures:
- `dart_f:1` "Past thirty paces the darts start holding opinions of their own. The mark stands through all of them, and Ya counts the misses aloud until she runs out of fingers."
- `dart_f:2` "The wind is from the left, and so, as it happens, is your aim. Mei Lin remarks that whatever is standing behind the mark has done nothing to deserve this."
- `needle_f:3` "Mei Lin turns one over in her fingers and says, kindly, that she has darned with worse. You take it back and dissolve the whole batch."

"Cook and eat." at the camp fire (the evening meal; the food is from the hammerspace):
- `cook:1` "You fill the other bowls first, from habit. Ya empties hers and watches yours like a snare. Mei Lin calls it \"quite adequate\", in her temple voice, and scrapes the pot."
- `cook:2` "Ya sits right by the pot tonight, to save walking. Mei Lin asks what you did with the herbs, one professional to another, and forgets to look unimpressed by the answer."
- `cook:3` (all three forms) "One piece is left. Ya looks at it. Yuki looks at Ya. [cat: *Mine,* says the bond. / root-kin: *Mine,* says the bond, from some way up. / woman: "Mine," says Yuki, pleasantly.] You cut it in half, and neither of them forgives you."
- `cook:4` "Nobody speaks until the pot is empty. Then Ya says you are to cook at her funeral. Mei Lin says funerals don't work like that, and hands her bowl back to you all the same."

## Output

Write `/tmp/p3/drafts2.txt`: one draft per line, `key | text`; for a line with Yuki's forms, three lines `key:cat`, `key:root-kin`, `key:woman`. Then, under a line `# notes`, at most three short notes. British spelling. No song lyrics, no real names.
