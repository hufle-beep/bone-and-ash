# Cold review: CM push 3 (v0.11.183), the songs (Opus)

Read: the brief, the checklist, the canon card, the lore notes, the diff, both packets and the fact card. Renders, walks and planted faults were run in scratch copies (`/tmp/cm3/rv/copy`, `/tmp/cm3/rv/sim`). The working copy was not edited. The walks are the test's 160-game walk, with main.js's real `newVisit` passed in.

Measured (160 games): all 13 songs show (Trøllabundin in 155 games). No song shows twice, on any day or after any rewind. A song shows again on a new entry only when the player comes back from `yuki_form` or a breakthrough, which is the same visit, as intended.

## M (medium)

**M1. A music line before Reflect on the same night (DU-A only covers lines *after* a song).** `songs.js:SONG_AT` (`night`), `music.js:90-98`
- In 107 of 160 games, `camp` (the first evening screen) has already drawn the day's line, and Reflect then plays two screens later at `night`. So Reflect is almost never "its day's music".
- Day 1's `camp` line, for example wilds.01, reads "The black trees … are not ready". Reflect then says "The black trees take it without comment", the same joke on consecutive screens.
- Reflect's "which appears to be how evenings go here" plays on the first evening on this world.
- Genesis gets a line first too (fo_last_night's line, 160/160). That one reads fine, because fo_depart is narratively the next dawn.
- Fix: put `camp` in `DEFER` while `songDue(g,'night')` (the day-1 camp then has no line). Or move Reflect to `camp`. Also reword "how evenings go here", for example "which is apparently how evenings will go here".

**M2. Genesis plays out the send-off, and the next screen starts it again.** `songs_texts.js:17`, against `act1_blackroot.js:287` (`bl_start`)
- The passage ends with Ashfall holding its bow "until the forest has taken the four of you", under "the worst music it has ever heard".
- The next screen opens with "Ashfall sees you off at dawn … formally, **in silence**". Old Wen then bows at the last stake, the mother hands over millet cakes, and "the trees shut behind you and there are four of you".
- That is a screen-order break plus a repeated beat ("four of you").
- Fix: end the passage at the treeline, before the bow is held to the back of anyone. For example, cut the last paragraph after "You don't." and drop "and the forest has taken the four of you".

**M3. Old Wen understands an English lyric that nobody translated.** `songs_texts.js:14`
- Elsewhere the songs keep the language wall: "Ya asks what he is saying. You tell her" (Boof Pack), "What is she saying?" (mumei), "Mei Lin has none of the words" (Breathe).
- Old Wen, though, quotes the content: "troubled to sing that the work comes before the cup". The passage gives the lyric's content as narration, and James explains only "they are dwarves".
- The same applies in a smaller way to rt_elder's disciple naming "*smiths*" (line 51). The fact card gives no anvil sounds that would let him guess.
- Fix: add a clause where James translates, for example "You give him the words as they come." For the disciple, give a cue he could hear ("hammer-voices"), or keep "smiths" as a guess from the beat.

**M4. mumei has Ya speak where the scene has just made her silence the beat.** `songs_texts.js:41`, against `act1_heart.js:396`
- `ya_party` is always set by then, so `ship_wreck` always shows "Ya says nothing whatever. She plants herself next to you … and waits, a skill you would have sworn she didn't have."
- The passage then gives Ya a condolence speech ("So it's got no name … Most graves get less. From Ya, this is condolence.").
- Fix: cut Ya's lines and keep her silent, for example "Ya, who has said nothing, goes on saying it." Or move the condolence to Mei Lin.

**M5. The "dwarves are made up" beat is still in two passages.** `songs_texts.js:14` and `:37`
- The brief's cut C1 says the joke was "kept once (Dúrin)". Hammerdeep still has it: "They are dwarves, and nobody's ancestors, and the fortress is a story too", answered by Old Wen's "Then whoever dreamed them gave them a home worth dying for".
- Dúrin repeats the same shape: "Somebody made them up" / "Then somebody made them up very well".
- Fix: Hammerdeep keeps only the ancestry denial, for example "You explain that they are not yours. He weighs this…". Old Wen's reply then turns on the home and the work, not the invention.

**M6. Music Box of Fate: "She asks the crowd to give blood."** `songs_texts.js:34`
- The fact card says she asks her audience to donate **plasma**, and the passage itself has just set up "the part of the blood she can't make, and strangers give it".
- Fix: "She asks the crowd to give it."
- The rest of the description is checked and matches the card: opera training; almost no antibodies; largely bedridden and isolated; a lung infection and oxygen day and night; weekly donated plasma; streaming from bed behind a drawing; a huge audience; "not for show".
- See L1 for Ya's line.

## L (low)

- **L1** (`:34`): Ya's "Can't stand. Can't breathe." are claims the card doesn't make. "Can't breathe" also contradicts "breathes bottled air". They are hyperbole about a real person and edge toward pity. Suggested: "Bed. Bottled air. Can't go out her own door." Mei Lin's "Nothing in her to fight with" is also stronger than "almost no antibodies"; "Almost nothing in her" would match. "Then her body stopped…" asserts an order (training first, then illness) that the card doesn't give; suggested "And her body makes almost none of what fights off sickness."
- **L2** (`:72`, `:47`): in the general edition the slot fill makes two sentences read wrong:
  - Water's Call: "a song named for the call of water, with a woman singing. She closed her **streams** with it" reads as rivers, and nothing says she streams. Suggested: "She closed her nightly broadcasts with it", or "the last song of her shows".
  - Breathe: "as **the singer** sang it once on a stream" has no antecedent in the passage. Suggested general: "a singer you played them in the roots".
- **L3** (general edition, 6 passages): the slot's general phrase is restated by the very next sentence:
  - Hammerdeep: "in praise of a dwarven fortress … a fortress-home praised"
  - Dúrin: "lament for a dwarf-king's fallen halls … his halls … the halls dark"
  - mumei: "about having no name … about being nameless"
  - Trøllabundin: "song for drum and voice: one frame drum, and a woman's voice"
  - Boof Pack: "a man taking his time about it, explaining at some length"
  - Reflect: "a singer … a singer and her other self"

  Fix: make each general phrase lean on what the sentence doesn't already say, for example Dúrin "an old dwarven lament", mumei "a song from the end of your archive where the idols are".
- **L4** (`:30`): Trøllabundin's "What is left is a fight" repeats `ape_lured`'s spike variant ("All that remains is to finish what the spike began"). Suggested: "Now it is a fight, and for a fight you have music."
- **L5** (`:27`): Lyfjaberg's "Goat-horn, lyre, and drums" attributes the band's usual instruments (card) to this single. Suggested: "Old instruments, and drums pitched so deep…".
  - Also: Mei Lin "takes the first black slope" and Ya "goes up ahead". The next label is "Climb.", so the climb starts before the player picks it. Suggested: "her feet have found the drum."
- **L6** (`:50`): Dwarven Forge played loud at an Outer Elder is a large insult to his face. Neither `rt_parley` ("one degree too shallow. You intended that.") nor `rt_truth` notices it. Suggested: a half-line ("You turn it down for his answer") or a note in rt_parley.
- **L7** (`:13`): Old Wen's "Play it at the well" goes nowhere: the next screen, fo_ashfall, has "a work-chant". Suggested: drop the request, or have fo_ashfall's first day echo it (open, options later).
- **L8** (pacing, measured): Dúrin and mumei play on the same day in 149/160 games (the hall at 06–09, the ship at 07–19). Trøllabundin and Music Box play the same day in 82/160. DU-A doesn't treat a song after a song. This is the owner's SG2 placement, but it cuts against "no need to cram". Note only.
- **L9** (`:24`): "How it sounds anywhere else you couldn't swear to" reads as the fact card's "not known" leaking into a man who has heard it at every stream's close. Suggested: "Elsewhere it was a goodnight."

## TG (test gaps)

- **TG1**: no check for a music line *before* a song on the same evening (M1). Count it in the 160-game walk (Reflect 107, Genesis 160 now).
- **TG2**: the walk asserts ≥8 of 13 songs, but 13/13 show in 160 games (Trøllabundin 155). With ≥8, a song moved to a branch screen (F11) or blocked on a screen with its own music (F10) passes. Assert all 13.
- **TG3**: the "back from a meta screen" check (`story.test.mjs:3838`) calls `newVisit:false` without clearing `L.cur`, so the `newVisit === false` branch is never exercised. F4 (that branch dropped) passed, yet in real play the passage then vanishes after "Yuki: change form" (seen in the walk at bl_camp, heart_view and rt_camp). Fix: `linesOf(g).cur = {}` before `c`, as CM2's L1 test does. The walk should also pass `againView`'s `newVisit` as main.js does.
- **TG4**: no 14:59 / 15:00 test for a song on an evening screen (F12 missed).
- **TG5**: the owner's fixed facts and reactions are pinned only by name:
  - Music Box: weekly plasma, the plasma appeal (and not "blood", M6), opera
  - Boof Pack: Mei Lin's horror (F14 missed)
  - Trøllabundin: no music during the stalk (F15 missed)

  Pin each with a word or two.
- **TG6**: the Yuki form rule (`/paw|purr|…|shoulder/`) is the only form check. Nothing checks who is present at the end of `ship_wreck` / `bl_start` against the passages (M2, M4), which is the checklist's "lines drawn under a screen" item.
- **TG7** (new checklist kinds): a passage that contradicts an always-shown variant (M4), that narrates past the next screen's opening (M2), or gives a local untranslated lyric content (M3).

## Planted faults (`tools/mutate.mjs`, the story test `--quick`): 11 caught, 7 missed, 0 not applied (of 18)

Caught:
- F1 DU-A dropped
- F2 DU-A on morning songs
- F3 the song on every new visit
- F5 never marked heard
- F6 `songs` out of `KEEP_FLAGS`
- F7 a hand-edited key counted
- F8 the great cat speaking aloud
- F9 songs only from 15:00
- F16 the general edition naming Nyanners
- F17 "Athelstan"
- F18 a tic

Missed:
- F4 the meta-screen redraw (TG3)
- F10 a song skipped on its own-music screen (TG2)
- F11 Dwarven Forge moved to `rt_parley` (TG2)
- F12 the 15:00 boundary (TG4)
- F13 "Every month" plasma (TG5)
- F14 Mei Lin enjoying Boof Pack (TG5)
- F15 music through the stalk (TG5)

Full table: `/tmp/cm3/rv/mutate.md`. No browser faults were planted (`art/` is left out of the copies).
