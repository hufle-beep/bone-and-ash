# Run TM (owner pick P17-A, TL4: Mei Lin's journey talk, beats 11–14)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p17/common.md` (tone and rules: they bind you), `/tmp/p17/talkmei-code.txt` (the scene as code: `talk_mei`, its beats by `n`; beats 5 + 6k a quiet walk, the others a settled list of five), `/tmp/p17/pk-talk_mei.txt` (the context packet) and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## The scene
On the walk through the Blackroot (the Ashen Hills by now), James talks with Mei Lin as they walk. The choices under it stay ("Listen. Ask questions. Let her talk." / "Flirt. Lightly. Dangerously." / sometimes "Stop walking. Stay with her a while…"), so nothing in the text decides them. These four are the second time round the cycle: they must be new conversations, not the earlier ones again (no root names, the tree that had it coming, Ya's bird shout, the glasses, the bow's depth, the blister, the millet cake, the herb where a beast died, Mei Lin's noise "from the belly").

You write **`talk_mei:11`** (a quiet stretch: little said, something shared) and **`talk_mei:12`, `:13`, `:14`** (conversations). Each:
- **shared**: 70–120 words, two or three paragraphs; Ya is not named or present in it (she may be off on her own these days).
- **warm**: one paragraph (25–50 words), shown when Mei Lin likes James: a gesture, nothing explicit.
- **cold**: one paragraph (20–40 words), shown when she doesn't (yet): friendly, a laugh or a look; no Ya.

## Output
Write `/tmp/p17/drafts-tm.txt`, one line per key, `key | text`, paragraph breaks ` ¶ `:
```
talk_mei:11 | shared text
talk_mei:11:warm | …
talk_mei:11:cold | …
(the same for 12, 13, 14)
```
then `# notes` as in common.md.
