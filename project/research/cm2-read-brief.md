# CM push 2: "Read to Ya" (one scene; brief for Fable)

You are drafting new story text for *Bone and Ash*, a dark, tongue-in-cheek xianxia game told in the second person ("you" = James). Read, in this order: `/home/claude/bone-and-ash/project/canon-card.md` (tone rules, tic list: these bind you), `/tmp/cm2/lore-selene.md` (Selene's canon), `/tmp/cm2/lore-cm.md` (the owner's notes on James's music and archive), then the packet `/tmp/cm2/heart-packet.txt` (the camp in the hollow inside the Old Tree, where the new choice sits, and the night after it). Read nothing else in the repo.

## The owner's request (2026-11-14 21:16, word for word)

"I think it would make a good scene for James to read to Ya from the Lord of the Rings. Inside the World Tree. About the Ents. You could also mention the Seedlings from the Selene game's lore. They are beings similar in appearance. Automatons without a mind, grown for one task then returning to the ship's embrace, each iteration learning faster and performing tasks better. Some eventually gain minds. Your people do not kill/wipe those, they become family and parts of the ship's where it happens. They are not slaves. They do their jobs usually, but have the right to refuse, if they develop the ability to refuse."

From the owner's other game (Selene's lore): seedlings are drones the ship's mind and the Hearth Tree grow for a single task; a seedling lasts as long as it is needed; what it learned seeps back through the roots into the next one; when it is done it "returns to the roots". "The World Tree" here is the Old Tree, the Hearth Tree the party is camped inside.

## The scene

A new choice on `heart_camp` (the Heart's evening; Days 16–18; from 16:00; once a Coil; only when Ya is in the party) opens a new screen, `heart_read`, then "Sleep." leads to `heart_night` as the other evening choices do. James climbs to Ya's ledge (her watch post on the gallery) with the omnitool's pane of light and reads to her about the Ents: tree-herds, slow, old, the Entwives lost, the march when they finally decide. Ya hears it the way Ya would (she jokes, flirts, picks fights; under it she listens hard). It turns, naturally, to the Seedlings: what his people's ships grow, and the ones that wake up and are kept as family, with the right to say no. Ya, a local, has her own view of a thing that is grown to work and may refuse (she is no one's servant either).

## Hard limits

- **No quotation** from the book, not a line, not a phrase, not a song or poem from it: describe what James reads and how he reads it. Proper names of the book's things only through slots (below).
- **Slots and editions:** the game has a named edition and a general one. Write `{ref:lotr}` for the book, `{ref:ents}` for the Ents, `{ref:treebeard}` for their eldest if you name him, `{ref:entwives}` if you name them. Each slot is a noun phrase that never opens a sentence and never takes `'s`. At the end give the general phrase for `ents`, `treebeard`, `entwives` (no proper names; e.g. "the tree-herds"); `lotr`'s general phrase is "a very long book about carrying a ring to a volcano" (keep it working in your sentence).
- **The ship's name** depends on what the party has found. Write ONE sentence (or two) about the ship under the floor as a `{SHIP}` block with three variants: `notfound` (they don't know a ship is down there: James speaks of his people's ships in general), `found` (they have found a ship under the roots but not heard its log: "the ship", never a name), `named` (they have heard the log: "Selene", "she", "her", never "the ship"). The rest of the text must read right in all three.
- **Yuki** is with you on the ledge or below it; if she does anything, it must fit all three of her forms (cat, great cat, human): no paws, no hands, no bond speech in italics (in human form she speaks aloud). Simplest: leave her out, or one form-neutral verb.
- **Ya's relationship** with James varies (friend, or more). The base text must work for both. Add one optional closing sentence, `{LOVER}`, used only when she is his lover; romance fades to black at the door, and this is not a romance scene.
- Mei Lin may or may not be in the party; don't rely on her.
- Time: an evening inside the tree; the singing behind the bone door may or may not be audible (it stops once the guardian is dealt with): don't mention it.
- Tone: James deadpan; Ya the exception among locals (jokes, flirts hard, picks fights). Under the deadpan, a warm man (the owner's note in `lore-cm.md`), shown, never said.
- Length: 220–340 words, in 3–5 paragraphs. Present tense, second person. Avoid the canon card's tics.

## Output

Write `/tmp/cm2/draft-read.md` with exactly these sections:

```
## label
<the choice's label on heart_camp: under 45 characters, ends with a full stop>
## text
<the scene, paragraphs separated by blank lines, with {SHIP} where the block goes and {LOVER} at the end>
## ship.notfound
<sentence(s)>
## ship.found
<sentence(s)>
## ship.named
<sentence(s)>
## lover
<one sentence>
## sleep
<the label of the screen's one choice to go to sleep: under 45 characters, ends with a full stop>
## refs
ents | the Ents | <general>
treebeard | Treebeard | <general>   (only if used)
entwives | the Entwives | <general>   (only if used)
## notes
<a few lines at most>
```

Reply with just "done" and your notes.
