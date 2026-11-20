# Bone and Ash, v0.11.233 fixes, run RV (owner pick RV1 after the cold review)

You redraft a few lines for a hand-written text RPG. Read ONLY: this brief, `/tmp/p6/tk-texts.txt` (the talks' older texts) and `/tmp/p6/drafts-tk.txt` (the new texts as they now stand in the game; ignore its `# notes`) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Same rules as before: place-neutral (no trees, roots, water, ash, haze, ridge, rock, mud: a talk shows on the Root Road, in the Drowned Wood where they wade trunk to trunk, and in the Ashen Hills), no time words, British spelling, Mei Lin looser, Ya blunt, deadpan James. Romance up to a touch only.

## Write (keys)
- `talk_mei:3:plain`, `talk_mei:4:plain`, `talk_mei:5:plain`: Mei Lin's plain branch (when she isn't warm on James yet) for each new text, one or two sentences. The reviewer found that 5 of the cycle's 6 plain branches end with her laughing and then looking round for someone from Ashfall (the old quiet walk and text A already do it). **No looking round, no glance behind, no aunt, no Ashfall watching, no "laughs into" anything**; she may laugh, but end on something else she does or says. One must not contradict a flirt result that says "she laughs without looking behind her first". Keep each text's own matter (3: the glasses handed back; 4: you bow to her at the money depth; 5: you offer to carry her).
- `talk_ya:5:like`: Ya's warm branch for the hungry text. Mei Lin's warm branch the same day takes James's arm and leans on it; so Ya must not take, hold or keep the arm. She may still test whether he is food, frankly and funny.
- `talk_ya:3`: the opener "Ya has reached a verdict on your coat, and it is not good news for the coat." without a legal word (no verdict, ruling, judgement, sentence, court, case): one sentence, Ya starting something about the coat.
- `talk_mei:4:away`'s last sentence only, as `talk_mei:4:away:last`: replaces "She glances at the haze, where there is at present nobody to set a worse example, and looks very nearly as if she misses one." Ya walked off into the haze in a temper; the haze has someone in it. Mei Lin alone with James, a little wistful; don't name Ya.

## Output
Write `/tmp/p6/drafts-rv.txt`: one draft per line, `key | text`. Then under `# notes` at most a few short notes (under 1 KB). Avoid the canon card's tics and any phrase already in the two text files; don't reuse a five-word run. No real names.
