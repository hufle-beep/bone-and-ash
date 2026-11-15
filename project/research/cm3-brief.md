# CM push 3 (v0.11.183): the Fable brief, word for word (the shared part, then runs A and B)

# CM push 3: the songs (brief for Fable; the shared part)

You are drafting new story text for *Bone and Ash*, a dark, tongue-in-cheek xianxia game told in the second person ("you" = James, an exile from a star-faring people whose omnitool on his forearm plays his music and holds his archive). Read, in this order: `/home/claude/bone-and-ash/project/canon-card.md` (tone rules and the tic list: these bind you), `/tmp/cm3/lore-cm.md` (the owner's notes on James's music, word for word), `/tmp/cm3/lore-yuki.md` (Yuki), then this brief's run part and its packet. Read nothing else from the repo.

## What you are writing

The owner picked 13 songs James plays "at least once, with the most impact". Each song plays once in the whole game, in one fixed scene. For each, write one **passage** that the game draws under that scene's text (after its last paragraph, above its choices), the first time the player reaches that scene. The passage is the moment James plays the song: what he picks and why now, how it sounds and lands in that place, and how the people present take it (one reaction per person present, in their own voice; the owner's notes fix some of them). Nothing in the scene's own text changes, so the passage must follow on from the scene's end **in every variant the packet shows** (Yuki's three forms, "as seen in play").

## Hard limits

- **No lyrics.** Not a line, not a phrase, not a title's worth of a chorus. Describe the sound, the subject (as the fact card gives it) and how it lands. Real people (singers, bands) are references James plays, never characters in the scene.
- **Use only the fact card below** for any fact about a song or a singer. Where it says the sound is not known, do not invent instruments or a genre: say how it lands, not what it is made of.
- **Slots and editions.** The game has a named edition and a general one (the default). Any real song, artist, band or musical goes in only through a slot `{ref:id}`. A slot is a noun phrase; it never opens a sentence and never takes `'s`. Use the ids given in the run part; you may also use these existing ones: `{ref:gura}` (Gawr Gura / "the pop of a singer who performs as a shark"), `{ref:mumei_artist}`, `{ref:calliope}`, `{ref:nerissa}`, `{ref:hololive_en}`. At the end give each new id's named phrase and its general phrase (no proper names of real people or works; a description that reads well in the same sentence). Read every sentence twice, once with each phrase, and make sure both read naturally.
- **Yuki** is James's bonded white cat; in a save she may be a small cat, a tiger-sized great cat, or human. Your text must fit all three: no paws, no hands, no tail-in-lap, no size. If she speaks, write `{YUKI}` where her one sentence goes, and give it twice at the end: as bond speech (italics, e.g. `*Again,* says Yuki.`) and aloud (e.g. `"Again," says Yuki.`). At most one `{YUKI}` per passage.
- **Ya and Mei Lin** may be James's friends, his lovers, or (in the Return) both together. Every passage must work for all of these: no kisses, no endearments, nothing that assumes either.
- **Tone:** James and Yuki deadpan; locals overly serious; Mei Lin looser; Ya crude, funny, picks fights. Under the deadpan James is a warm man: shown, never said. Not a speech from anyone.
- **Time and place:** the packet's "when" line says the day and hour the scene shows. Don't contradict it (no "tonight" in the morning).
- **Length:** 90–180 words a passage unless the run part says otherwise, 1–3 paragraphs. Present tense, second person. Avoid the canon card's tics; don't reuse a phrase from the scene's own text.

## Output format (exactly)

```
## <song key>
### text
<the passage; paragraphs separated by blank lines>
### yuki.bond
<only if the passage has {YUKI}>
### yuki.aloud
<only if the passage has {YUKI}>
```
… one block per song in the run, in the order given, then:
```
## refs
<id> | <named phrase> | <general phrase>
## notes
<a few lines at most>
```

## The fact card (checked by search, 2026-11-14)

- **Reflect** — Gawr Gura's first original song (2021), sung mostly in Japanese; bright, quick electronic pop. Its subject: Gura and her "other self", the persona and the one behind it, who rejects her and whom she admits she couldn't have come this far without. Ids: `reflect` (the song).
- **The Song of Hammerdeep** — Clamavi de Profundis, a group that sings deep, choral fantasy songs. Hammerdeep is a dwarven fortress-home of their own invention: the song praises the home made by mighty hands, the craftsman's honest work before the ale, and the dwarves who died keeping their lands. Ids: `hammerdeep` (the song), `clamavi` (the group).
- **Genesis** — hololive English -Advent-'s group song: brash, about their beginning, mischief and a plot twist. Advent's story: five who broke out of a prison called The Cell. Sound beyond "brash, a group of voices": not known. Ids: `genesis`.
- **Boof Pack** — Lord Aethelstan (2022): a joke track, laid-back beat and a saxophone, a man declining a night out because he is staying in with the boys. Daft and catchy; his best-known song. Ids: `boof_pack`, `aethelstan` (the artist).
- **The Water's Call** — Lord Aethelstan with Nyanners singing (2023), about five minutes, used as the close of Nyanners' streams. Sound: not known. Ids: `waters_call`.
- **Trøllabundin** — Eivør, a Faroese singer, her own song in Faroese: the word means bewitched, bound by trolls. A frame drum and a voice that chants, breathes and rises. Ids: `trollabundin`.
- **Lyfjaberg** — Wardruna (Norwegian, Nordic folk; old instruments such as goat-horn and lyre, deep drums), a 2020 single. The Old Norse word means healing-hill or healing-mountain, from an Eddic poem: the sick who climb it are cured. The band say climbing a hard mountain is as much an effort of the mind as of the body. Ids: `lyfjaberg`, `wardruna`.
- **Music Box of Fate** — Ironmouse (2025), written for her by two composers to put her operatic voice on full display, with an orchestra behind her. **Her circumstances:** a Puerto Rican singer who trained to be a coloratura soprano in opera; an immune disease (CVID: her body makes almost no antibodies) left her largely bedridden and isolated; a lung infection left her on oxygen around the clock; she needs donated plasma every week. She began streaming from her bed, behind a drawn avatar, and became one of the most-watched streamers there is; she asks her audience to donate plasma and has raised a great deal for an immune-deficiency charity. Singing costs her body; she does it anyway. She has said plainly her illness is not a gimmick: tell it plainly, without pity or sermon. Ids: `music_box` (the song), `ironmouse` (her name; general: a description such as "the singer").
- **The Song of Dúrin** — Clamavi de Profundis's setting of Tolkien's poem (the one a dwarf chants in the dark of the fallen dwarf-kingdom): the first dwarf-king waking when the world was young, naming the hills, his halls in their glory; now the world is grey, the halls dark. Slow, deep voices. Ids: `durin`.
- **mumei** — Nanashi Mumei (2023), sung in Japanese; its subject: being nameless and forgotten, and living on anyway, nameless, for someone somewhere. Ids: `mumei_song`.
- **Non-Fiction** — hololive English -Myth- (2022), for their second anniversary: all five singing of "their myth", one they wrote together, side by side. Ids: `non_fiction`.
- **Breathe** — a song from Lin-Manuel Miranda's musical *In the Heights*: a young woman comes home from her first year at college, carrying the neighbourhood's hopes and afraid she has let them down. James has a recording of Ironmouse singing it on one of her streams. Ids: `breathe` (the song), `in_the_heights` (the musical), and `ironmouse`.
- **Dwarven Forge** — Clamavi de Profundis: a dwarven forge song, hammer and fire, deep voices. Ids: `dwarven_forge`.

# Run A (7 songs; the prologue, the Fallout, the Blackroot)

Read `/tmp/cm3/brief-common.md` first, then the packet `/tmp/cm3/packet-A.txt` (each scene's text in every form, when it shows, its choices and what follows). Write `/tmp/cm3/draft-A.md`. Reply with just "done" and your notes.

1. **reflect → `night`** (the Wilds, Days 1–3; James's first nights on this world, alone with Yuki). Present: Yuki only. The song's two selves against James and Yuki: a voice in his head that was always there, a self that kept him going. Don't say it outright.
2. **hammerdeep → `fo_elder_named`** (Day 8, early morning, Old Wen's tea; thirteen days until the Elder; next the village starts building walls). Present: Old Wen; villagers within earshot. A home made by hands, and the walls about to go up. One local reaction, overly serious.
3. **genesis → `fo_depart`** (the end of Day 10 into Day 11: the whole village silent along the north path, bowing; Mei Lin, Ya and Yuki with him). The owner wants impact; the joke of a brash beginning-song against a silent formal farewell is allowed, but the passage must still land the departure. One reaction each from Ya and Mei Lin (Yuki optional).
4. **boof_pack → `bl_camp`** (the first night in the Blackroot, Day 11). Present: Ya, Mei Lin, Yuki. **The owner fixed the reactions: Ya delighted, Mei Lin horrified, Yuki amused.** 120–200 words.
5. **waters_call → `dw_enter`** (entering the Drowned Wood). Present: Ya, Mei Lin, Yuki. Its title and the drowned wood; sound not known (see the card).
6. **lyfjaberg → `ah_enter`** (entering the Ashen Hills: the climb). Present: Ya, Mei Lin, Yuki. The healing-mountain and the climb; the party is going to heal (or learn what poisons) a dead tree.
7. **trollabundin → `ape_lured`** (Day 15: the rot-ape has dropped Ya's bait and is charging; the next choice is "Fight."). Present: Ya, Mei Lin, Yuki. **James never plays music while hunting** (the owner's rule): the lure is over, this is a fight; he starts it as the ape commits, a war-trance. 50–100 words, one short reaction at most (from Ya). It must read with both the scene's variants (the ape whole; or one-eyed after the spike).

# Run B (6 songs; the Heart and the Return)

Read `/tmp/cm3/brief-common.md` first, then `/tmp/cm3/lore-selene.md` (the ship under the tree: canon), then the packet `/tmp/cm3/packet-B.txt`. Write `/tmp/cm3/draft-B.md`. Reply with just "done" and your notes.

1. **music_box → `heart_view`** (Day 15, evening, camped in the roots of the dead tree before going in; "Tomorrow"). Present: Ya, Mei Lin, Yuki. **The owner (word for word): "Ironmouse's Music Box of Fate should definitely be shown to both Ya and Mei, with a short description of her circumstances. Mei would find it moving and inspiring, and Ya one of motivation and true inner strength."** James *shows* it (the omnitool's pane: the drawn singer, the voice), and tells them, in a few plain deadpan sentences, what her life is (the fact card; in the text her name only as `{ref:ironmouse}`). Mei Lin (a healer) moved and inspired; Ya, motivation and true inner strength, in Ya's own crude voice. The dead tree that still sings is there; don't press the parallel. 220–320 words. This is the most important passage of the push.
2. **durin → `heart_hall`** (Day 16, inside the dead Hearth Tree: its great hall). Present: Ya, Mei Lin, Yuki. A fallen dwarf-king's halls sung in a dead tree's hall.
3. **mumei_song → `ship_wreck`** (finding the wrecked seed-ship under the roots). The ship's name is NOT known yet here: "the ship", never "Selene". Present: Ya, Mei Lin, Yuki. A thing nameless and forgotten.
4. **non_fiction → `rt_camp`** (Day 19, the last camp on the road home; a task hub: the passage sits above the cards). Present: Ya, Mei Lin, Yuki. Five who wrote their own myth together; this party.
5. **breathe → `rt_arrive`** (Day 19–20, arriving home at Ashfall with the seed, the village watching). Present: Ya, Mei Lin, Yuki, villagers. Coming home carrying everyone's hopes; Mei Lin's mother may be there (see the packet). Here James plays Ironmouse's recording (`{ref:breathe}`, `{ref:in_the_heights}`, `{ref:ironmouse}`), so Ya and Mei Lin, who heard `music_box` at the roots, may know the voice: one light touch at most, or none.
6. **dwarven_forge → `rt_elder`** (Day 21, 08:00, the morning Outer Elder Shen Qiu arrives at the tribute post; after the day's breakfast). Present: the village, Mei Lin, Ya, Yuki. Hammer and fire before the confrontation; short, 70–130 words; one local reaction.
