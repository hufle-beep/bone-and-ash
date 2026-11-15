# Brief: breakthrough texts in the right place (owner pick BR1, v0.11.185)

You are drafting 2 short texts (plus one word) for Bone and Ash. Read `canon-card.md` (tone, James, Yuki, the world, the tic list), `lore-world.md` (the world, the Old Tree), and the packet files:
- `breakthrough.md`: the breakthrough screen as the game draws it (a few variants).
- `bt-scene-code.txt`: the screen's code. Realm 1 (Foundation) is the long text with `${recognise}` and `${witness}`; realms 2+ use `BT_REALMS` or the generic "Once more the loop closes…" text. `seen` is true only in the prologue's village today.
- `bt-realms-code.txt`: the own texts of realms 3–14 (a body, then a closer by night or by day). Realms 10 and 11 have no sky (`BT_NO_SKY`).
- `fo_ashfall-excerpt.md`, `rt_ashfall-excerpt.md`: Ashfall in Act 1 (the Fallout, Days 8–11; the last day, Day 21, when Outer Elder Shen Qiu arrives).
- `heart_hub-excerpt.md`: inside the Old Tree (the Heart, Days 16–18).

## What is wrong now

James breaks through (a realm higher) wherever he meditates. Two places get the wrong text:
1. **Ashfall in Act 1** (`fo_ashfall`, `rt_ashfall`): his Foundation breakthrough there says "Nobody saw it except the trees…" and the bolt fizzles "in the moss", though he is in the village street. (The prologue's village has its own witness block, in `bt-scene-code.txt`, the `seen` branch: Old Wen, a grandmother praying, a runner to the Crimson Lotus.) For realms 2+ there, Claude will reuse the prologue's existing line "Ashfall watches it go in total silence. Then, one by one, people bow — not to the sky. To you. You would very much prefer they didn't." (code only, not yours).
2. **Inside the Old Tree** (`heart_hub`): every realm's text has the sky come down "over you", stars going out, a bolt landing beside him, though he is under the Tree's roof.

## What to write

1. `aw1` — **the witness block for Foundation in Act 1's Ashfall.** It replaces `${witness}` in the realm 1 text: it follows "Yuki rose with you; … and goes back to sleep." and comes before "*Foundation.* Mortal Vessel no longer: …". About 90–150 words, 2–4 short paragraphs. Ashfall sees a tribulation come for him and withdraw. Locals are overly serious (formal, grave about Heaven, face, the Sect); they don't joke; the humour is James's dry reaction, if any. It must fit:
   - any day 8–21, any hour from 06:00 to past midnight (the sky line before it is by day or by night; your block must not name the time of day);
   - any tribute ending (the village fought the Sect, bluffed, paid, or lost) and any state of the palisade: don't name which;
   - a village that has never seen him break through (everyone but James and Yuki forgets each Coil, and Foundation comes once a game): it is their first sight of it;
   - the Elder (Shen Qiu) is coming, or arrives that day; the village knows. A nod to that is welcome, not required.
   - People you may use: Old Wen (90, one milky eye), the hunters, Pock-Face, "the street", children, the old women. **Not** Mei Lin, her mother, Ya or Gao Feng (their state varies too much).
   - Don't reuse the prologue's block (Old Wen's "Not in the history of the mountain", the kneeling grandmother, the runner to the Crimson Lotus) or the Fallout's line "they saw the sky come for you, and leave. Children stop playing when you walk past. A grandmother touches your sleeve…": new shapes.
2. `hf` — **the Heart's frame line**, shown first, before the whole breakthrough text, whenever James breaks through inside the Old Tree. One or two sentences, under 40 words. He takes it outside/up where Heaven can look (the crown, a crack to the sky: your call, true to the Tree in `lore-world.md` and the hub's grey light down the cracks), so the sky text after it reads true. It must work before every realm's text: realm 1 continues "You sit, and you let the loop close."; realm 2 "Once more the loop closes, a rung further up. Core Formation."; realms 3–14 begin with the realm's name (read their bodies, including 10 and 11, where the sky does not come at all). So: end with him in place, not sitting yet ("You sit" follows for realm 1), and don't promise the sky will come.
3. `hf:ground` — one word or short phrase for where the realm 1 bolt lands up there: it replaces "moss" in "fizzles out in the moss with the sound of a disappointed sigh".

## Rules

- James's voice is second person ("you"), dry, deadpan. Yuki may appear in `aw1` only through the bond or as a cat-shape in motion (her form varies; no speech).
- No words from the canon card's tic list. No five-word run copied from the packet texts.
- No time words that can be wrong (see above). "Still" only as an adverb of continuing, if at all.

## Output

Write `/tmp/br/fable-drafts.md`: each text under its id (`## aw1`, `## hf`, `## hf:ground`), exactly as it would appear in the game (markdown italics allowed as in the packet), then at most 1 KB of notes (your doubts, one alternative if you have a strong one). Nothing else.
