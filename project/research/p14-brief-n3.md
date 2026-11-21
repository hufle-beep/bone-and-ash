# Bone and Ash, v0.11.242 drafts, run N3 (owner pick P14-A: NF6, the forest night six more; this run: texts 13, 14 and 15)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p14/common-night.md` (the scene, tone and rules: they bind you), `/tmp/p14/night-texts.txt` (the scene's code: its nine texts in the `byDay` list, with the fire split `${g.flags.fire ? … : …}` and Yuki's `byForm(g, cat, great, human)`), `/tmp/p14/drafts-n2.txt` (texts 10–12, drafted by another run: don't reuse their moments or a five-word run of theirs), `/tmp/p14/night-packet.txt` (the context packet: what leads in, the choices and their results) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

## Your texts
You write texts **13, 14 and 15**. Text 13 in the mood of the strangeness of this world's night; text 14 of habit, the camp become his; text 15 of a quiet night. Texts 10–12 (in drafts-n2.txt) took those moods just before you: find other things.

## Output
Write `/tmp/p14/drafts-n3.txt`: one line per key, `key | text`, no line breaks inside a draft; paragraph breaks as ` ¶ `:
```
night:13 | first paragraph ¶ {fire} {yuki} ¶ the watch-thread paragraph
night:13:fire | the sentence with a fire
night:13:nofire | the sentence without
night:13:y:cat | Yuki's sentence, cat
night:13:y:great | Yuki's sentence, great root-kin
night:13:y:human | Yuki's sentence, woman
```
and the same for the other two. Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB): anything you assumed that canon may not hold. Reply with just "done" and the file path.
