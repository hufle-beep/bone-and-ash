# Push 5: the rest of e (options)

Measured on the v0.11.231 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar. Raw numbers in `p5-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## The sub-items
- **V3b, the repeated scenes, re-measured.** Two of the six are done since the old figure: `bl_morning` (14 different mornings a game) and `village_night` (the quiet night has three texts). Left: `bl_fireside` (Root Road, Ashen Hills), `supper_roof` (day 1, later), `fo_mei` (story days 8, 9, 10), `fo_ya_time` (days 9, 10). That is 9 slots of 1 text each.
  - Scope: 14 new texts so each slot has three. **About 1,500 words, 2 Fable runs**: one for the Fallout (7 texts, about 770 words), one for the roof and the fireside (7 texts, about 730 words).
  - Folded a game now: 20.8 / 27.7 / 13.7 / 19.2. After: about 14 / 14 / 1 / 8, mostly the roof's later nights (the long calendar has 4–9). New texts read a game: 7 / 14 / 14 / 11.
  - Balance 0. Save 0.
- **CW, praise of James's cooking in parts 1–3.**
  - Now: 4 lines, seen 3.2 / 3.2 / 3.0 / 2.9 a game. The hare line is seen 0 times (no bot roasts a hare). Part 4 alone shows 4–6 a game.
  - Scope: 2 more lines (up to part 9's cap of 6), 15–30 words each. Best places: `supper` and `mei_walk`, each read in full about 7 a game by Careful and the Sociable. The lines ride in the roof-and-fireside run.
  - Seen after: about 5 a game. Balance 0. Save 0.
- **FC, the first flight.** A new scene on the save's first Foundation, hooked on "Get up."
  - Met once a save. All 40 games reached it in prologue Coil 1: 30 at Ashfall with the village watching, 10 in the wilds with Yuki alone.
  - About 300–350 words: the scene, 2 witness variants and Yuki's 3 forms. It rides in one run.
  - Balance 0. **Save:** one new kept flag in `KEEP_FLAGS`, a save addition with no id changed. `migrate` sets it for saves already past Foundation (realm ≥ 1, or the tiger seen). One gap: a save that reached Foundation only in an earlier Coil sees the scene once.
- **SNr, `ya_brawl`'s three older stomp texts.** About 425 words, 1 tic. Seen 0 / 0 / 1.0 / 0.9 a game. Rides in the Fallout run. Balance 0.
- **The leftovers in code, LG.** Four guards with no new words:
  - the cairn card hidden while someone is away;
  - the climb to the pass only after Ya's door;
  - the beetle's Ya +3 only when Ya is there;
  - `BT_MEI.night` dropped (it can't show outside 04:00–05:59).
  - Seen 0 in 40 games each. Balance: Ya +3 a day at most, measured 0.
- **BYb-t, a "Wen told you" Foundation paragraph.** About 45 words. Seen in 2 of 40 games (Completionist).

## The options
Colours show how many screens each option changes a game, from the bot numbers above.

- 🟢 **P5-A: V3b + CW + FC.** 3 items, 2 Fable runs (about 1,850 words), one save addition. The most changed: 7–14 new texts read a game, about 2 more praise lines, and the first flight once a save. The biggest review: three items, and the save change needs a `migrate` test.
- 🟢 **P5-B: V3b + CW (recommended).** 2 items, 2 Fable runs (about 1,550 words). No save or balance change. 7–14 new texts read a game, and about 2 more praise lines.
- 🟠 **P5-C: FC + CW + SNr.** 3 items, 1–2 Fable runs (about 800 words), one save addition. The first flight once a save, about 2 praise lines, and 0–1 stomp text a game. The folds stay at 21 / 28 / 14 / 19.
- 🔴 **P5-D: LG + BYb-t.** 1 short Fable run (45 words), code guards. 0 screens a game for Careful, the Sociable and the Cultivator; 0.2 for the Completionist.

**Why P5-B:** it fixes the most screens a game of any option without a save change. It is all text in two runs, so the review stays on one kind of change. FC brings a save addition and its `migrate` test, which suits a push of its own (with SNr, or BYb-t riding along).

## Open, options later
- ST2 degree 3 (the far wins' third texts): not measured again here (0 at v0.11.230).
- The social talks (`talk_mei` and `talk_ya`, folded 0–8 a game) and the evening's other folded screens (`supper` 15–51, `mei_walk` 1–30 a game).
- CW past the cap of 6 for parts 1–3 (parts 5–9's density is not measured).
