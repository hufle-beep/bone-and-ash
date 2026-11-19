# Bone and Ash, v0.11.232 drafts, run F (owner pick P5-B: V3b, the Fallout's two daily scenes)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p5/packet-fo.txt` (the context packet for `fo_mei` and `fo_ya_time`) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, tone, the tic list). Do not read other repo files.

Tone: James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, and gets in trouble for it); Ya blunt, a wolf among people (jokes, flirts hard, picks fights). Second person ("you" = James). British spelling, as the game.

## Context the packet doesn't show
Act 1, the Fallout: Ashfall after the tribute, waiting for the Elder (Shen Qiu) and getting ready to walk to the Old Tree. Story days 8, 9 and 10. On the long calendar (the game's default) each of these story days lasts a WEEK, and the player can open `fo_mei` ("Find Mei Lin.") and `fo_ya_time` ("Find Ya. Follow the sound of offended people.") once every day, between 06:00 and 19:00. Each story day has ONE text now, so it comes back up to seven times. Each story day becomes a list of three, played in order one a day, then round again: the old text stays first; you write the 2nd and 3rd. A text read before folds to its FIRST SENTENCE with a "Read it all again" link, so every text needs at least two sentences, and its first sentence must work alone as a reminder of the scene.

- Day 8: the village has just learnt the Elder is coming (weeks off yet). Ashfall is grimly calm; Mei Lin is not. Ya is not in the village yet.
- Day 9: Ya has come to Ashfall (she is a hunter from outside; the village has no idea what to do with her). Mei Lin is on the herb slopes or about the village.
- Day 10: the expedition to the Old Tree is decided (James, Mei Lin and Ya go; they leave at the end of the week). Mei Lin is packing; Ya is waiting to leave.

Rules for the new texts:
- NO day counts and no "tomorrow" / "the last day" (the week makes them wrong); "soon", "before we leave", "the Elder" are fine.
- `fo_mei` day 8: not in the herb loft (on some saves it has burned; the old text has a clause for that) — the house, the well, the yard, the shrine steps, the lane are fine. Don't put Ya in day 8.
- `fo_mei` day 9: Ya may or may not be in the village on a save; don't mention her presence (the old text has two versions for that).
- `fo_mei` day 10: Ya is coming on the expedition; Mei Lin may mention her.
- Leave Yuki out of the Fallout texts (or, if you name her, give all three forms: the cat on his shoulder, bond-speech in italics; the great root-kin, tiger-sized, bond-speech; the woman, speaks aloud).
- Mei Lin is Mei Lin: angry at the calm, sharp, funny, and fond of him under it. Ya is Ya. Keep each about the length of the old text of that day (fo_mei 110–130 words; fo_ya_time 80–100 words), ending on a line that the choices below answer.

## The choices (labels)
Each text sits above two choices. Some labels answer the old text only; for those, write a new label for each new text (same intent and weight, so the same gains still make sense). Labels marked KEEP stay and must fit your text.

- `fo_mei` day 8: [0] now: `"Scream, then. I'll stand next to you so they look at me instead."` (a warm, conspiratorial answer; Mei Lin +) → write a new [0] for each new text. [1] now: `Help her sort roots. Say nothing. Let her be angry at the roots.` (quiet help with whatever her hands are doing; it also gets him a jade bracket pressed into his palm) → write a new [1] for each new text.
- `fo_mei` day 9: [0] now: `Tell her she's allowed to like it.` → a new [0] for each. [1] `Help her work. Let her talk.` KEEP (so give her work in hand).
- `fo_mei` day 10: [0] now: `"No reason. I was going to carry the basket."` → a new [0] for each. [1] `Help her work. Let her talk.` KEEP.
- `fo_ya_time` day 9: KEEP both: [0] `Throw her.` and [1] `Let her throw you. Several times. It seems important to her.`; [1]'s result is "Eleven times she puts you in the chaff, and is happier each time." So the day-9 texts stay on the threshing floor and end in a challenge to wrestle. Don't reuse the bowing joke.
- `fo_ya_time` day 10: [0] now: `"Thank you. I mean that."` (answers "For you.") → a new [0] for each. [1] `Climb up and sit with her for a while.` KEEP (so she is up somewhere: a roof, the palisade, a tree, the granary; not the shrine roof again); its result: "You sit. She leans her shoulder into yours, hard, as one wolf leans on another."

## Write (keys)
`fo_mei:8:2`, `fo_mei:8:2:l0`, `fo_mei:8:2:l1`, `fo_mei:8:3`, `fo_mei:8:3:l0`, `fo_mei:8:3:l1`,
`fo_mei:9:2`, `fo_mei:9:2:l0`, `fo_mei:9:3`, `fo_mei:9:3:l0`,
`fo_mei:10:2`, `fo_mei:10:2:l0`, `fo_mei:10:3`, `fo_mei:10:3:l0`,
`fo_ya_time:9:2`, `fo_ya_time:9:3`,
`fo_ya_time:10:2`, `fo_ya_time:10:2:l0`, `fo_ya_time:10:3`, `fo_ya_time:10:3:l0`.

The 2nd and 3rd texts of a day are later days of the same week: the same situation, a different moment, and they must not retell the old text's beat (the scream, "that Mei Lin", the reputation; "mine"; the mushrooms joke; the bowing; "for you").

## Output
Write `/tmp/p5/drafts-fo.txt`: one draft per line, `key | text`, paragraphs separated by ` ¶ ` (no line breaks inside a draft). Labels as plain text (quotes inside if spoken). Then, under a line `# notes`, at most a few short notes (suggestions only; under 2 KB). Avoid the canon card's tics and any phrase the packet's texts already use; don't reuse a five-word run between drafts. No song lyrics, no real names.
