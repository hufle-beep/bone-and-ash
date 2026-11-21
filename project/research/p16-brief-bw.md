# Run BW (owner pick P16-A: the Blackroot's win texts): `ah_hawks_won` text 3, `rr_elk_won` text 3, `dw_serpent_won` text 2

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p16/common.md` (tone and rules: they bind you), `/tmp/p16/bw-code.txt` (the three scenes as code: `rr_elk_won` and `ah_hawks_won` two texts each by day, `dw_serpent_won` one; `ah_hawks_won`'s away versions under `AW.hawks_won`: `any` is the text when Ya is away (Mei Lin may or may not be there too), `byForm(g, cat, great, human)` a passage by Yuki's form), `/tmp/p16/pk-ah_hawks_won.txt`, `/tmp/p16/pk-rr_elk_won.txt`, `/tmp/p16/pk-dw_serpent_won.txt` (the context packets) and `/home/claude/bone-and-ash/project/canon-card.md`. Do not read other repo files.

Each is the text after a won fight, read on a later day than the ones in the file. The result line above it (the gains) stays; never name what was gained in numbers.

## `rr_elk_won:3` (the Root Road)
The bone-elk down. Ya and the kill; James takes an antler-tine into the hammerspace and his Convergence reads the bone (each time differently: not the jeweller, not two voices). 100–150 words, three or four paragraphs. Not opening with "The elk comes down" or "This one goes down". No palm laid flat on the hide.

## `ah_hawks_won:3` (the Ashen Hills)
The last cinder hawk down, Yuki on or over it as the fight's centre (the hawks go for her, as `ah_hunt` says), and Ya's title for her ("Little queen") NOT repeated: a new beat between Ya and Yuki or the trio. Two versions:
- **With Ya:** the shared text with ONE `{yuki}` passage by form (cat on his shoulder in the fight; great root-kin at his flank; woman at his back), 60–90 words.
- **Ya away (`away`)**: Ya is not there (she walked off offended, or both women went for water); Mei Lin may or may not be there, so name neither woman as present; 40–70 words, with its own `{yuki}` passage by form.
Not opening with "The last hawk".

## `dw_serpent_won:2` (the Drowned Wood)
The serpent dead in black water; Ya and Mei Lin soaked; a moment between them that James decides not to notice, or a new beat altogether (not "You're insane", not "That was beautiful", not riding it like a horse). 45–75 words, two or three paragraphs. Not opening with "It beats".

## Output
Write `/tmp/p16/drafts-bw.txt`:
```
rr_elk_won:3 | text
ah_hawks_won:3 | shared text with {yuki}
ah_hawks_won:3:y:cat | …
ah_hawks_won:3:y:great | …
ah_hawks_won:3:y:human | …
ah_hawks_won:3:away | text with {yuki}
ah_hawks_won:3:away:y:cat | …
ah_hawks_won:3:away:y:great | …
ah_hawks_won:3:away:y:human | …
dw_serpent_won:2 | text
```
then `# notes` as in common.md.
