# Run N-a (owner pick P16-A: NF6, the forest night six more; this run: texts 16, 17 and 18)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common-night.md` (the scene, tone and rules: they bind you), `/tmp/p16/night-texts.txt` (the scene's code: its fifteen texts in the `byDay` list, with the fire split `${g.flags.fire ? … : …}` and Yuki's `byForm(g, cat, great, human)`) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

## Your texts
You write texts **16, 17 and 18**. Text 16: a sound of this world's night, far off (not a scream, not clicking, not the large thing's round). Text 17: the stream below the rise. Text 18: cold, damp or weather on the rise. Run N-b writes texts 19–21 at the same time: the smell or the growth of the forest at night, the bruise-coloured sky, and a thought of home; leave those to it.

## Output
Write `/tmp/p16/drafts-na.txt`: one line per key, `key | text`, no line breaks inside a draft; paragraph breaks as ` ¶ `:
```
night:16 | first paragraph ¶ {fire} {yuki} ¶ the watch-thread paragraph
night:16:fire | the sentence with a fire
night:16:nofire | the sentence without
night:16:y:cat | Yuki's sentence, cat
night:16:y:great | Yuki's sentence, great root-kin
night:16:y:human | Yuki's sentence, woman
```
and the same for the other two. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB). Reply with just "done" and the file path.
