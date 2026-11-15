# N1 brief (v0.11.188): three lines that assume witnesses nobody had (Fable, one run)

You are drafting story text for *Bone and Ash*, a dark-xianxia text RPG. Read `/tmp/n1/canon-card.md` (the canon card: tone, cast, the tic list) and `/tmp/n1/packet.md` (the context packets of the four scenes: their whole texts as drawn, every label, when they show). Read nothing else; do not open the game's files. Write your drafts to `/tmp/n1/drafts.md` (the format at the end) and your notes, if any, to `/tmp/n1/notes.md` (suggestions only, under 10 KB). Reply with one line when done.

**Tone (hard):** James and Yuki deadpan and sarcastic; locals overly serious (formal, grave about face, rank, Heaven, the Sect; they don't joke); Mei Lin looser (teases, laughs); Ya the other exception (jokes, flirts hard, picks fights). Second person for James ("you"). Plain, concrete English; no names of songs or singers (the game fills those through slots). Avoid every tic on the canon card's list and the pairs "like … man", "as one …" used twice in a block.

## TR — the trees line, with Mei Lin and Ya there (Foundation breakthrough, the `breakthrough` scene)

Where: James's first breakthrough (Mortal Vessel → Foundation) away from a village, while Mei Lin and Ya travel with him (the Blackroot: the root road, the drowned wood, the ashen hills, their camps; and the Heart, inside the Old Tree). Today the block after "Yuki rose with you … goes back to sleep." says:
- night: "Nobody saw it except the trees and whatever lives in them. Out here, at night, a miracle without witnesses is the best kind."
- day: "Nobody saw it except the trees. Out here, you suspect, a miracle without witnesses is the best kind."
It shows to 40% (Random) to 94% (Sociable) of Foundation breakthroughs while both women are a few steps away. They saw it: the storm came, looked, shrugged, one bolt fizzled in the moss beside him, the clouds left.

Draft three replacement blocks, each 50–90 words, ending so that the next paragraph ("*Foundation.* Mortal Vessel no longer: …") follows naturally:
- **TR-N** (night, a Blackroot camp; the bolt fizzled in the moss).
- **TR-D** (by day, a Blackroot camp or on the road; the same).
- **TR-H** (the Heart: the screen opens "Not in here. The Old Tree has had enough done to it under this roof. You go up the widest crack to where it opens on the sky, and find a level place on the lip." — Mei Lin and Ya are below, inside the tree; the bolt fizzled in dead bark; no time-of-day words).
Mei Lin knows tribulations: she has seen them burn people; this is the first one she has seen *refuse*. Ya is a feral huntress (see the card); she reacts as herself. James closes deadpan, in one line at most. No romance beyond a look. They are not villagers: no bowing, no "Ashfall".

## L7 — the morning after Old Wen's line (the `fo_ashfall` hub, Day 8, before 11:00)

At breakfast (`fo_elder_named`) James played the dwarven hymn over tea; the passage ends with Old Wen: "Then they were somebody's, and they made a home worth dying for, and sang that the work comes before the cup," he says. "The hunters will hear it before one stake is lifted." The next screen, the same morning, opens: "Morning. Axes, hammers, and a work-chant kept going so that nobody has to think." — as if the hymn never happened. This shows in 97–100% of games.

Draft **L7**: one replacement for that sentence (it opens the hub's text, then "N days until the Elder." follows), 15–40 words, starting "Morning.", for the day the hymn was played: the hunters did hear it; the work has it in it somehow (hummed, the chant's beat taken from it, someone getting the low part wrong). Grave locals, no jokes from them. Don't name the song: "the hymn", "the dwarves' song", "this morning's song" will do.

## LL — the lost letter nobody's sky explains (`fo_letter`, the "lost" ending)

The "lost" ending: at the tribute Lu Han (the Sect's collector) beat James; James woke with Lu Han's boot print on his chest; the terms stand (one year, then the Bone-Maker goes up the road with the Sect, or the village burns). Then a rider brings a letter that moves the date to Day 21. Today's letter (LETTER.lost in the packet) says the sky gathered tribulation over the stranger on the tribute day and left without striking — but in 214 of 244 games (88%) no breakthrough happened in sight of the village (James is still mortal in 209). So nobody saw any sky.

Draft **LL**: the whole replacement text for those games, about the same length and shape as LETTER.lost (Old Wen reads it on his feet in the elder's house, the council in a ring; the letter in italics; Old Hu, the head hunter, says one grave line; James answers deadpan; a closing line). The Sect needs a reason, from what it could know without any sky: Lu Han's report of the fight (the stranger who raised a hand at the tribute, the bone he works, the Bone-Maker's name; what Lu Han felt or failed to feel when he struck him). Keep the Elder's purpose: Outer Elder Shen Qiu comes on the twenty-first day to collect the Bone-Maker with his own hands. **Do not spend the later reveal**: at `fo_elder_named` Old Wen tells James, as news, that the envoys, the watchers and Lu Han all carried home *"They cannot sense him"*; the letter may hint (something in the stranger Lu Han could not account for) but must not say it plainly. No "Heaven took fright", no sky, no tribulation.

## EN — one clause in `fo_elder_named` (a draft for the owner's decision; not yet picked)

`fo_elder_named` (every ending) says: "A man who refuses tribulation and sings bone out of the air, and to a cultivator's senses he is an empty chair." For a James nobody saw break through, "refuses tribulation" is something the Sect has no report of. Draft **EN**: that sentence without the tribulation (same length or shorter, same rhythm), for the games where nobody saw a tribulation.

## The format of `/tmp/n1/drafts.md`

One draft per section, exactly:

```
### TR-N
<text; paragraphs separated by a blank line>

### TR-D
...
### TR-H
### L7
### LL
### EN
```

Then, optionally, one alternative per item under `### <ID> alt`. Nothing else in the file.
