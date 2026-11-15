# Brief: memory lines for repeated scenes (owner pick S1, v0.11.184)

You are drafting 10 short texts for Bone and Ash. Read `canon-card.md` (tone, James, Yuki, the world) and the packet (`packet.md`: the three scenes as the game draws them) and the beats (`mei_beats.txt`, `ya_beats.txt`: the code of Mei Lin's and Ya's talk beats; each `if (n === k) return \`...\`` is beat k).

## How the game shows a repeat

James lives the same acts again and again (the Coil: each rewind sends him back to the act's first dawn). Only James and Yuki remember earlier Coils; Mei Lin, Ya and everyone else do not.
When a scene's text was read in an earlier Coil, the game folds it: it shows the first paragraph only, a "Read it all again" button for the rest, and above the first paragraph a **memory line** in italics-like small type. Today that line is a general one from a pool, e.g.:
- 'You have done this before. You were not better at it.'
- 'You catch yourself mouthing the next line before anyone says it.'
- 'There is a word for living the same day twice. You were a doctor of something else.'
- 'Foreknowledge, it turns out, is mostly a matter of knowing when to duck.'

The new lines replace the general one for these scenes only: each knows exactly which conversation is coming.

## What to write

1. `morning:kp`: a new second paragraph for the Day 2 morning, shown from the prologue's second Coil on (James has lived this forest before). It replaces the paragraph "You could go looking for the way out. Or you could face the data: you know nothing about this world, and this forest is the mildest teacher it is likely to offer. So learn it. Eat. Get stronger. *Then* walk out." It follows the unchanged first paragraph (in the packet, ¶1, ending "Alive, on the evidence."). About 50–70 words, 2–4 sentences. Same shape: what he does now, and why; ends on the plan (learn, eat, get stronger, walk out, in your words). He knows the forest a little now and that it ends in a tribute on Day 7; he does not know everything. Do not name the Coil count (it varies). Do not list specifics that may differ between Coils (which beast, which night).
2. `morning:mem`: the memory line above the folded Day 2 morning (from the third Coil on, when the new paragraph has been read). One sentence, under 20 words. James's.
3. `talk_mei:m0`, `talk_mei:m1`, `talk_mei:m3`, `talk_mei:m4`: one memory line each for Mei Lin's beats 0, 1, 3, 4 (beat 2 and 5+ keep the general pool). Shown above the beat's folded first paragraph when James heard that beat in an earlier Coil. James knows what she is about to say; she does not know he knows. One or two sentences, under 25 words each. James's (his thought or a small act), never spoken aloud to her, never quoting her lines back.
4. `talk_ya:m0`, `talk_ya:m1`, `talk_ya:m3`, `talk_ya:m4`: the same for Ya's beats 0, 1, 3, 4.

## Rules

- Tone: James deadpan and dry, but these are people he likes; a line can be warm under the dry. No jokes at the women's expense. Mei Lin looser than the norm; Ya blunt, a wolf-raised hunter.
- James's lines only (no Yuki: her form varies in Act 1 and her speech changes with it).
- No time words that can be wrong: the talks happen on any day 11–20, at any hour 6–19; avoid "this morning", "tonight", "again today". "Again" itself is fine in a memory line (it shows only on a repeat).
- No words from the canon card's tic list. No phrases already in the general pool above. Each line different in shape from the others (not ten "You know she will…").
- Don't retell the beat; point at it (a gesture, a word, a feeling about it).

## Output

Exactly 10 lines, nothing else, one per line, in the form `key | text`, in the order above (`morning:kp`, `morning:mem`, `talk_mei:m0` … `talk_ya:m4`). Markdown italics with *asterisks* allowed. After the 10 lines, at most 5 short notes (one line each) if you have any.
