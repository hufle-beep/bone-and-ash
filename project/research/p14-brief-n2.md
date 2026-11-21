# Bone and Ash, v0.11.242 drafts, run N2 (owner pick P14-A: NF6, the forest night six more; this run: texts 10, 11 and 12)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p14/common-night.md` (the scene, tone and rules: they bind you), `/tmp/p14/night-texts.txt` (the scene's code: its nine texts in the `byDay` list, with the fire split `${g.flags.fire ? … : …}` and Yuki's `byForm(g, cat, great, human)`), `/tmp/p14/night-packet.txt` (the context packet: what leads in, the choices and their results) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

## Your texts
You write texts **10, 11 and 12**. Text 10 in the mood of the strangeness of this world's night; text 11 of habit, the camp become his; text 12 of a quiet night.

## Output
Write `/tmp/p14/drafts-n2.txt`: one line per key, `key | text`, no line breaks inside a draft; paragraph breaks as ` ¶ `:
```
night:10 | first paragraph ¶ {fire} {yuki} ¶ the watch-thread paragraph
night:10:fire | the sentence with a fire
night:10:nofire | the sentence without
night:10:y:cat | Yuki's sentence, cat
night:10:y:great | Yuki's sentence, great root-kin
night:10:y:human | Yuki's sentence, woman
```
and the same for the other two. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold. Reply with just "done" and the file path.
