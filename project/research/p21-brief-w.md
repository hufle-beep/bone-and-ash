# Run W (owner pick P21-E: the three ways after a won tribute fight)

You draft new story text for a hand-written text RPG. Read ONLY this brief, `/tmp/p21/common.md` (tone and rules), `/tmp/p21/canon-card.md`, `/tmp/p21/lore-realms-people.md`, your packet `/tmp/p21/packet-w.md` (`tribute`, `collectors_won`, `bluff_win`, `tribute_paid` as they are today) and `/tmp/p21/stomp-collectors.js` (the fight's posture and its won texts by how badly Lu Han was outclassed: `win[2]`, `win[3]`; `collectors_won`'s own text is the closest fight). Do not read other files.

How it will work: the won fight's screen (`collectors_won`, or `win[2]` / `win[3]`) is cut after Lu Han is on his knees (and, in `win[3]`, after his "I would have *felt* it"); the rest of each text (from "Go home" / "Home," on) moves word for word to the victory's own screen. Under the cut, three choices:
1. the victory: send him home (the moved speech follows);
2. the bluff: let him believe he lost to a senior of a hidden sect (a GU check and 4 Qi, as today);
3. the pin: pay the village's due anyway with a sung wraithbone hairpin, so the Sect has its tribute and less reason to come back (a Convergence Use check and 8 Qi, as today).

Keys:
- `win2:disciples` (one sentence, ~15–25 words) — replaces "His three disciples meet ${ykShort(g)} and reach, together, the decision to be elsewhere." in `win[2]`: Yuki is under Lu Han's net now, so the disciples reach that decision without her. No Yuki.
- `label:send`, `label:bluff`, `label:pin` (the three choice labels; `send` ~4–10 words, the others ~8–18 words) — as James's own action, in the style of today's labels.
- `title:sent` (1–3 words) — the title of the victory's screen (today's titles: "Red Snow", "Senior", "Heavenly Material", "Kneel").
- `bluff_win` (~110–160 words; replaces the whole text) — follows the won fight: Lu Han on his knees, his disciples gone. James lets the bone show (the crown of white bone, the clean Qi he still cannot sense in James himself), and Lu Han reads his defeat as a hidden senior's lesson: face saved, no tribute this season, his master "will wish to extend an invitation" (keep that beat: Act 1 opens with that envoy). Gao Feng looks back once if he is there (write it so it reads whether or not he is). Keep what still fits of today's text; change what the won fight changes.
- `tribute_paid` (~90–140 words; replaces the whole text) — follows the won fight: James sings the hairpin anyway and hands it to the kneeling man: the Sect's due, paid in full, so the Sect has no grievance to bring back. Lu Han's reaction (he understands what is being spared, including his face); three years; the baskets untouched. Keep what still fits of today's text.
- `fail:bluff` (~20–40 words) — the line shown when the bluff check fails after the won fight: Lu Han is not taken in; beaten all the same, he will go. The victory's screen follows.
- `fail:pin` (~20–40 words) — the hairpin goes wrong in the song; beaten all the same, he will go. The victory's screen follows.

## Output
Write `/tmp/p21/drafts-w.txt`: one line per key, `key | text` (paragraph breaks ` ¶ `), then `# notes` (a few short lines at most). Reply with just "done" and the file path.
