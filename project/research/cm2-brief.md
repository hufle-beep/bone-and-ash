# CM push 2: James's music and archive lines (brief for Fable)

You are drafting new story text for *Bone and Ash*, a dark, tongue-in-cheek xianxia game told in the second person ("you" = James). Read, in this order: `/home/claude/bone-and-ash/project/canon-card.md` (the digest of the lore; its tone rules and tic list bind you), `/tmp/cm2/lore-cm.md` (the owner's own words on James's cooking, music and archive: these win), then your run's packet (named below). Read nothing else in the repo.

## What the lines are

Once a text day at most, under the text of the day's first evening screen (suppers, camps, quiet nights; never a hunt or a fight), the game shows **one short line about James's omnitool**: either the music it is playing (most days) or, one day in four, something from his **archive** (a book, film, series, game, clip or stream he reads or watches). The line sits under the screen's own text, set apart, like a margin note. It must not restate or depend on that text.

The omnitool lives under the skin of his forearm. It plays low, from his forearm or sleeve, often with no earphones, chosen for the moment; he does not care whether the villagers like it. Never while hunting. In this world nobody has a frame of reference for any of it.

## The editions (important)

Every real name goes through a **slot**: `{ref:id}`. The game has two editions, chosen in Settings:
- **named**: the slot shows the real name (a band, an artist, a song, a book, a game).
- **general**: the slot shows a short description instead, with no proper name of any real person, band, title or company.

So each line must read naturally **both ways**. Rules for slots:
- A slot is a noun phrase. Write the line so it works with both the name and the description in that place (test it in your head both ways).
- Never put a slot at the start of a sentence. Never add `'s` to a slot. No quotation marks around a slot (the name entry carries its own italics if it needs them).
- Use only the ids listed for your run. For each id you use, write its **general** phrase (lower case, 3–12 words, describing how the music sounds or what the book or game is, no names). The named phrase is given; don't change it.
- A line can have 0, 1 or 2 slots. A line with no slot (say, about the volume, or who is listening) is welcome: it reads the same in both editions.

## Hard limits

- **No lyrics, no quotations** from any real song, book, film or game: titles (through slots) and how the thing sounds or lands only.
- Real people (bands, singers, VTubers) are only music James plays. They are never present, never speak, never characters.
- Romance fades to black at the door; none of these lines is romantic beyond a glance.
- **Reserved for later (do not use, not even described):** these songs: Trøllabundin, The Song of Dúrin, The Song of Hammerdeep, Dwarven Forge, Music Box of Fate, Breathe, The Eater's Call, Boof Pack, Mumei (the song), Genesis, Non-Fiction, Reflect, Lyfjaberg; and these artists: Eivør, Clamavi de Profundis, Wardruna, Ironmouse, Nyanners, Lord Athelstan, Holoadvent, Holomyth.

## Form and tone

- One or two sentences, at most about 35 words. Present tense, second person.
- James and Yuki deadpan. Locals overly serious. Mei Lin looser. Yuki speaks only through the bond, in italics: `*Like this,* says the bond.` Her lines must fit any of her forms (cat, great cat, human): say "she", no paws or hands.
- Under the deadpan (the owner's note in `lore-cm.md`): a few lines, through others' small reactions or what James chooses to play, let it show that he is a caring, warm man. Never a speech.
- **Time:** each line can show on any evening of its stretch, on any Coil (the game loops), after any day. So: no "tonight", "this morning", "again", "still", "first", "last", "once more", "yesterday", "tomorrow"; no weather; no fire, meal, stove, wine or lamp unless the line's place (below) always has it; nothing that assumes what happened today.
- Vary the openings. Avoid the canon card's tics. Don't reuse a phrase across lines.

## Who can react (reaction lines)

A reaction line shows only when that person is there and their friendship with James is in the step named:
- **low** below 30 (baffled, put out, suffering it with dignity), **mid** 30–79 (curious, asks what it is, half-likes it), **high** 80 and up (asks for something by its sound, hums along, or quietly turns up for it).
- The mother (Mei Lin's mother) seldom passes 40, so she gets low and mid only. The neighbour line is anyone from the village dropping by at supper (the village's friendship is high through Act 1).

## Output

Write your lines to the file named for your run, one per line, in exactly this form (fields separated by ` | `):

`key | kind | from | place | who | step | text`

- `key`: given below (e.g. `wilds.01`).
- `kind`: `music` or `archive`.
- `from`: `0`, `1` or `2`: the Act 1 Coil it opens on (0 = from the start, 1 = from the player's second Coil in Act 1, 2 = the third). Prologue stretches are all `0`.
- `place`: one of the places listed for that stretch, or `any` (fits every screen of the stretch). At least half of each stretch's lines should be `any`.
- `who`: `-` for none, else `yuki`, `mei`, `ya`, `mother`, `neighbour`.
- `step`: `-`, `low`, `mid` or `high`.
- `text`: the line, with slots.

Then, after a line `## refs`, one line per slot id you used:

`ref id | named phrase as given | your general phrase`

Then `## notes` with anything Claude should know (at most a few lines). Write nothing else into the file. When you are done, reply with just "done" and those notes.
