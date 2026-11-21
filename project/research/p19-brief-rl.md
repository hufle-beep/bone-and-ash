# Run RL (owner pick P19-A: RL, the remembered line, and AL, the eve's "sleep alone")

You draft new story text for a hand-written text RPG. Read ONLY this brief, `/tmp/p19/common.md` (tone and rules), `/tmp/p19/canon-card.md` and your packet `/tmp/p19/packet-rl.md` (`evening2`, `talk_mei`, `fo_last_night`). Do not read other files.

## RL: the remembered line (6 keys, ~30 words each, two sentences or three)
The Coil: when James loses, time loops back; everyone forgets but James and Yuki. On an earlier Coil, Mei Lin came to care for James (at least far enough that she would have kissed him; maybe she did). On a later Coil she does not remember any of it. James does. Once a Coil, a carrier scene gets one closing paragraph: what he remembers, set against her now. Dry, not maudlin; the ache in one plain detail.
- `rl:evening2:0`, `rl:evening2:1`, `rl:evening2:2` — the end of `evening2` (lamplight at her table on the eve of the tribute; her thumb on your knuckles; the choices then are to kiss her, talk till dawn, or say goodnight). `:0` shows on the first later Coil, `:1` on the next, `:2` on the one after and beyond. Don't say whether he kissed her on the earlier Coil.
- `rl:talk_mei:0`, `:1`, `:2` — the end of a talk with Mei Lin on the walk through the Blackroot (`talk_mei`; Ya may be off in the haze). Same order.

## AL: the eve's "sleep alone" (2 keys)
`fo_last_night`, the night before the Blackroot: when Mei Lin and Ya both like James, it has the three on the thatch (packet) and offers: stay, the three of you; Ya; Mei Lin. It has no way to sleep alone. Add one:
- `al:label` — the choice's label (under 12 words; the other labels: "Stay there, the three of you, until the sky goes grey.", "Tonight, Ya. Say it plainly: \"Stay.\"", "Tonight, Mei Lin. Go down to the herb loft with her."). Not unkind to either.
- `al:result` (~40 words, two or three sentences) — what happens: he goes in alone and sleeps; both women take it in character (Ya offended a little, Mei Lin amused or relieved). Nothing is lost. No "herb loft" here (it may be the scorched loft's night).

## Output
Write `/tmp/p19/drafts-rl.txt`: one line per key, `key | text` (paragraph breaks ` ¶ `), then `# notes` (a few short lines at most). Reply with just "done" and the file path.
