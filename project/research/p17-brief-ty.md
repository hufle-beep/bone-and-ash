# Run TY (owner pick P17-A, TL4: Ya's journey talk, beats 11–14)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p17/common.md` (tone and rules: they bind you), `/tmp/p17/talkya-code.txt` (the scene as code: `talk_ya`, its beats by `n`; beats 5 + 6k a quiet walk, the others a settled list of five), `/tmp/p17/pk-talk_ya.txt` (the context packet) and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

## The scene
On the walk through the Blackroot (the Ashen Hills by now), James talks with Ya as they walk. The choices under it stay as they are, so nothing in the text decides them. These four are the second time round the cycle: new conversations, nothing of the earlier ones again (read them in the file: her view of the coat, a bet, her hunger, the stone to carry, the herb girl's mint and the rest).

You write **`talk_ya:11`** (a quiet stretch) and **`talk_ya:12`, `:13`, `:14`** (conversations: Ya against civilisation is allowed in one at most; give the others to her life in the wild, her opinion of James's people, the dead tree, Yuki). Each:
- **shared**: 70–120 words, two or three paragraphs; Mei Lin may be named (she is there when Ya is).
- **warm**: one paragraph (25–50 words), shown when Ya likes James: aggressive flirting, crude but not explicit.
- **cold**: one paragraph (20–40 words), shown when she doesn't (yet): a jibe, a shove, a challenge.

## Output
Write `/tmp/p17/drafts-ty.txt`, one line per key, `key | text`, paragraph breaks ` ¶ `:
```
talk_ya:11 | shared text
talk_ya:11:warm | …
talk_ya:11:cold | …
(the same for 12, 13, 14)
```
then `# notes` as in common.md.
