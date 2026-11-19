# Push 6: the rest of e (options)

Measured on the v0.11.232 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar (the old calendar for ST2 and SNr). Raw numbers in `p6-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Done in v0.11.232, its effect
- **V3b:** the four scenes folded 20.8 / 27.7 / 13.7 / 19.2 → 13.8 / 13.3 / 1.9 / 7.7 a game; new texts read 7 / 14.4 / 11.8 / 11.5. Left: the roof's later nights (three texts, by design).
- **CW:** parts 1–3 seen 3.2 / 3.2 / 3.0 / 2.9 → 5.2 / 5.2 / 5.0 / 3.9 a game (part 4: 5 / 6 / 4 / 4).
- **The evening's other screens** (`supper`, `mei_walk`, `village_night` folded 51 / 51 / 18–20 / 1–15 a game): sequences of three a story day, folds on the long calendar's 20–58 village nights. By the rule of three: no change proposed.

## The sub-items
- **TK, the talks (`talk_mei`, `talk_ya`).** Five beats, then a cycle of three (the quiet walk and two settled texts).
  - Folded, both talks: 0 / 15.9 / 10.5 / 11.1 a game (Careful takes one talk each).
  - Scope: 3 more settled texts each (a cycle of six), Mei Lin's with their Ya-away versions. **About 850 words, 1 Fable run.** A rule change: the owner's social exception set at six for the talks.
  - Folded after: about 0 / 10 / 4.5 / 5. Balance 0. Save 0.
- **CWx, CW past the cap of 6 in parts 1–3.**
  - Now 5.2 / 5.2 / 5.0 / 3.9 a game. Part 5 shows 8–12, part 7 2–6.
  - Scope: 2 more lines (cap 6 → 8), 15–30 words each. Best places: `village_night` (read in full 4–7 a game) and `camp` (4–6). They ride in another run. Rule change: the cap.
  - Seen after: about 7 / 7 / 7 / 6. Balance 0. Save 0.
- **FC, the first flight.** A scene on the save's first Foundation, hooked on "Get up." (`prologue.js` 1131).
  - Met once a save: 40 of 40 in prologue Coil 1. 30 at Ashfall (16:00–21:00, the village watching), 10 in the wilds (08:00, Yuki alone).
  - About 300–350 words: the scene, 2 witness variants, Yuki's 3 forms. 1 Fable run.
  - Balance 0. **Save:** one kept flag in `KEEP_FLAGS`, a save addition with no id changed. **`migrate`'s gap is closed** with `g.seen.breakthrough` (kept across rewinds). Misses: realm-or-tiger rule 29 of 29 later Coils; this rule 0.
- **SNr, `ya_brawl`'s three older stomp texts.** 425 words, 1 tic. Seen 0 on both calendars (every won brawl is at degree 1). Rides in a run. Balance 0.
- **ST2 degree 3, the far wins' third texts.** 2 texts, about 240 words, 2 form clauses each. Seen 0 on both calendars (no far win at degree 3). Balance 0.
- **LG, four guards with no new words.** The cairn while someone is away; the climb only after Ya's door; the beetle's Ya +3 only with Ya there; `BT_MEI.night` dropped.
  - Met 0 in 40 games each (40 cairns, 40 climbs, 43 beetles, 0 `BT_MEI`).
  - Balance: Ya +3 a day at most, measured 0.
- **BYb-t, a "Wen told you" Foundation paragraph.** About 45 words. 2 of 45 Foundation screens (Completionist 0.2 a game). Rides in a run.

## The options
Colours show how many screens each option changes a game, from the bot numbers above.

- 🟢 **P6-A: TK + CWx (recommended).** 2 items, 1 Fable run (about 910 words). Two rule changes (the talks' cycle of six, the cap of 8). No save or balance change. About 6 fewer folds a game for the Sociable, Completionist and Cultivator, and 2 more praise lines for all four.
- 🟡 **P6-B: FC + CWx + BYb-t.** 3 items, 1 Fable run (about 460 words), one save addition. The first flight once a save, 2 more praise lines a game, and the Wen paragraph 0–0.2 a game. Its review needs a `migrate` test.
- 🟠 **P6-C: FC + SNr + BYb-t.** 3 items, 1–2 Fable runs (about 820 words), one save addition. The first flight once a save. SNr 0 a game, BYb-t 0–0.2.
- 🔴 **P6-D: LG + ST2 degree 3 + SNr.** Code guards and 1 Fable run (about 665 words). 0 screens a game on both calendars.

**Why P6-A:** it changes the most screens a game, all as text, with no save or balance change. FC's `migrate` gap is now closable, so FC with SNr and BYb-t (P6-C) makes a clean push of its own after it.

## Open, options later
- The roof's later nights past three texts (the long calendar's 4–9 roof nights; the rule of three).
- The hare's CW line (seen 0: no bot roasts a hare).
- CW in part 8 (the Long Forest: 0 in these games, not reached).
