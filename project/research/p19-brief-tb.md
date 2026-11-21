# Run TB (owner pick P19-A: TB, the romance tier beats)

You draft new story text for a hand-written text RPG. Read ONLY this brief, `/tmp/p19/common.md` (tone and rules), `/tmp/p19/canon-card.md` and your packet `/tmp/p19/packet-tb.md` (the carrier scenes: `supper`, `bl_camp`, `fo_night`). Do not read other files.

## What a tier beat is
Mei Lin's and Ya's affection for James climbs in tiers. When one crosses a tier, the NEXT carrier scene James reaches gets one extra closing paragraph, once: the beat that tells the player, in story, that something between them moved. It is appended under whatever text the carrier shows that night (any of its texts in the packet), so it must follow any of them and repeat none of their moments.

The tiers:
- **Mei Lin, the kiss tier:** she would now kiss him if he asked (nothing has been said; it shows in what she does).
- **Mei Lin, liked:** she is plainly fond of him; others can see it.
- **Ya, the kiss tier:** Ya has decided she wants him and does not hide it.
- **Ya, liked:** past wanting: she counts him as hers to keep (pack, not prey).

## The keys (one closing paragraph each, at least two sentences)
- `tb:mei30` (~80 words) — the end of a supper at Mei Lin's house (her mother at the table, grave and formal). Weeks before the tribute. It may follow a night the loft burned (no herbs, no "herb loft" then). Small and sly under the mother's eye.
- `tb:mei72` (~100 words) — the same carrier, a later supper: the mother sees it too, and says nothing, or one grave thing.
- `tb:ya45:camp` (~90 words) — the end of a Blackroot camp evening (`bl_camp`: the Root Road, the Drowned Wood or the Ashen Hills; Mei Lin and Yuki are there too). Name no region.
- `tb:ya72:camp` (~100 words) — the same carrier, later.
- `tb:ya45:night` (~70 words) — the end of a Fallout night in the loft at Mei Lin's house (`fo_night`): its text ends with Ya as a silhouette on the shrine roof across the lane, watching your window. Mei Lin may or may not be up in the loft with you (if she is your lover she is; the paragraph must suit both). After the tribute; the herbs are back in the loft.
- `tb:ya72:night` (~70 words) — the same carrier, Ya liked.

Yuki may appear; if she does, mark `{yuki}` in the shared text and give the three forms as keys `<key>:cat`, `<key>:great`, `<key>:human` (one sentence each). Keep each beat its own moment: no two beats share an image or a joke.

## Output
Write `/tmp/p19/drafts-tb.txt`: one line per key, `key | text` (paragraph breaks ` ¶ `), then `# notes` (a few short lines at most). Reply with just "done" and the file path.
