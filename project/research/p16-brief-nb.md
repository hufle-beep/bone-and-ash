# Run N-b (owner pick P16-A: NF6, the forest night six more; this run: texts 19, 20 and 21)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common-night.md` (the scene, tone and rules: they bind you), `/tmp/p16/night-texts.txt` (the scene's code: its fifteen texts in the `byDay` list, with the fire split `${g.flags.fire ? … : …}` and Yuki's `byForm(g, cat, great, human)`) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

## Your texts
You write texts **19, 20 and 21**. Text 19: a smell of the forest at night, or something growing in the dark (the fungi he studies). Text 20: the sky, the bruise colour, what passes for stars here. Text 21: a thought of home, light and dry, nothing sad. Run N-a writes texts 16–18 at the same time: a far-off sound, the stream below the rise, cold and weather on the rise; leave those to it.

## Output
Write `/tmp/p16/drafts-nb.txt`: one line per key, `key | text`, no line breaks inside a draft; paragraph breaks as ` ¶ `:
```
night:19 | first paragraph ¶ {fire} {yuki} ¶ the watch-thread paragraph
night:19:fire | the sentence with a fire
night:19:nofire | the sentence without
night:19:y:cat | Yuki's sentence, cat
night:19:y:great | Yuki's sentence, great root-kin
night:19:y:human | Yuki's sentence, woman
```
and the same for the other two. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB). Reply with just "done" and the file path.
