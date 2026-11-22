# Run T (owner pick P21-E: the lost tribute, the net, Lu Han's reading)

You draft new story text for a hand-written text RPG. Read ONLY this brief, `/tmp/p21/common.md` (tone and rules), `/tmp/p21/canon-card.md`, `/tmp/p21/lore-realms-people.md`, your packet `/tmp/p21/packet-t.md` (`collectors_lost` as it is today, the `tribute` screen before the fight, and Act 1's `rt_taken`, where James goes with the Sect's elder: the tone model for being taken), `/tmp/p21/stomp-collectors.js` (the fight's opening posture texts) and `/tmp/p21/coil-why.js` (the Coil-end screen's opening texts; `tribute` is today's). Do not read other files.

Keys:
- `collectors_lost` (~130–180 words; replaces the whole text) — James has lost the tribute fight. He is down; Lu Han stands over him. This time Ashfall does not save him and nothing changes Lu Han's mind: he takes James to the Sect, as he promised before the fight ("carried"). Bound, or carried, or marched; the village watches; Yuki is still under the net and goes with him. End on the road to the Sect, with no hope offered and no "next season". Keep Lu Han's honest regret and grave courtesy. Mark the one Yuki passage `{yuki}` (she is under the net) and give it as `collectors_lost:yuki:cat`, `:great`, `:woman` (one or two sentences each).
- `coil:tribute` (~45–70 words; the Coil-end screen's opening when the tribute was lost, shown right after `collectors_lost`) — on the Sect's road, or what being taken means; it must end on the same turn as today's: the choice to not let it have happened (the only button below is "Bite the tail. Wake at the first dawn."). No forms named.
- `net:cat`, `net:great`, `net:woman` (~25–40 words each) — shown at the start of every tribute fight, under the posture text: Lu Han's spirit-beast net, from his sleeve in the first breath, before he draws, over Yuki. She is out of this fight. Deadpan bond-speech allowed (cat and great: italics; woman: aloud).
- `netfree:cat`, `netfree:great`, `netfree:woman` (one sentence each, ~12–25 words) — appended to the won fight's screen: the net comes off her once Lu Han is down.
- `read` (~25–45 words; no forms) — shown at the start of the tribute fight only when James's realm is above Foundation: Lu Han still senses nothing in him, but he reads it in how James stands and moves, and he stops holding back. No realm names, no numbers.
- `disciple` (2–4 words) — the fight-screen name for the disciple who takes Gao Feng's place in the fight when Gao is not there (e.g. "Crimson Lotus disciple"; a title, not a personal name).

## Output
Write `/tmp/p21/drafts-t.txt`: one line per key, `key | text` (paragraph breaks ` ¶ `, `{yuki}` where the Yuki passage goes), then `# notes` (a few short lines at most). Reply with just "done" and the file path.
