# Push 7: the rest of e (options)

Measured on the v0.11.233 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar (the old calendar where marked). Raw numbers in `p7-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Done in v0.11.233, its effect
- **TK:** both talks folded 0 / 15.9 / 10.5 / 11.1 → **0 / 9.9 / 4.5 / 5.1** a game (forecast 0 / 10 / 4.5 / 5). New texts read 0 / 6 / 6 / 6.
- **CWx:** parts 1–3 seen 5.2 / 5.2 / 5.0 / 4.7 → **6.2 / 6.2 / 6.0 / 6.6** (forecast 7 / 7 / 7 / 6). The loft line is read 1 / 1 / 1 / 1.9. **The camp line is 0 on the long calendar** (the bots meet the camp only on forest night 1); old calendar 4.5–5.1 screens a game. **After RV1 (CM-b, the line moved to the first night while there is food):** long calendar 0 / 0 / 1.6 / 1.7 screens a game, old 0 / 0 / 4.7 / 5.9 (Claude's measure, the same 10 games).
- **Re-checked, unmoved:** FC, SNr, ST2 degree 3, LG, BYb-t (same screens, same dice). New on the old calendar: LG met in 1 Careful game of 10.

## The sub-items
- **RN, the roof's later nights** (`supper_roof:2`, village days 2–3).
  - Folded 9.1 / 9.1 / 1.1 / 6.7 a game (three texts).
  - Scope: 3 more texts, 3 more lines after and 3 more labels (a cycle of six, as TK). **About 550 words, 1 Fable run.** Code: the index `% 3` → `% 6`. A rule change: the six of the social exception for the roof's later nights.
  - Folded after: about 6.1 / 6.1 / 0 / 3.7. Balance 0. Save 0.
- **ML, the firesides' meal when nobody cooked** (T L6).
  - Shown 1.0 / 1.7 / 0.2 / 0.1 a game (of 3.1 / 2.9 / 1.5 / 1.0 meal texts).
  - Scope: a no-cook version of 4 clauses (AH 2, AH 3, RR 2, RR 3), about 80 words, riding in a run. Code: a cooked-today test (`bl_cook`) in 4 places.
  - Balance 0. Save 0.
- **TL, "back tomorrow" while she is away** (v0.11.231 C L4).
  - Shown 2.7 / 1.8 / 4.0 / 3.9 hub screens a game (on 1 day a game, every model).
  - Scope: code only. In `tasks.js` 238, a card hidden for her absence stays hidden, as the hub hides it. 1 test. No Fable run.
  - Balance 0. Save 0.
- **FC, the first flight.** Met once a save (40 of 40 in prologue Coil 1).
  - Scope: about 300–350 words, 1 Fable run.
  - **Save:** one kept flag. `migrate`'s gap is closed by `g.seen.breakthrough`, which misses 0 of 56 later Coils. Balance 0.
- **TG, the text checks' samples** (C TG-C1 + C L6). 0 screens.
  - Scope: tools only. The lint now reads 7 of 32 of v0.11.232's new texts. Sample states for story days 9–10, `vday` 2, the Ashen Hills by who is there, plus `packet.mjs`'s away states and its talk beats past 2. *(v0.11.233 RV1, LS: the talk beats 5–10 and the camp line are now read; about 25 more texts left.)*
  - About 25 more texts read.
- **LF, the loft after the arson** (T L3). 0 a game (no bot loses the arson).
  - Scope: burned versions of about 6 lines, about 100 words, riding in a run.
- **LG**, long 0, old 0.1 / 0 / 0 / 0. **SNr** 0. **ST2 degree 3** 0. **BYb-t** 0 / 0 / 0.2 / 0 (old 0.1 / 0.2 / 0 / 0). **ME** (C L3, a menu at 19:00) 0. Scopes as in `p6-options.md` (LG, SNr, ST2, BYb-t). ME is code only.
- **C L2, an old save mid-week:** 0 in new games, and nothing breaks. No change proposed.

## The options
Colours show how many screens each option changes a game, from the bot numbers above (Careful / Sociable / Completionist / Cultivator).

- 🟢 **P7-A: RN + ML + TL (recommended).** 3 items, 1 Fable run (about 630 words). One rule change (six for the roof's later nights). No save or balance change. **About 6.7 / 6.5 / 5.3 / 7.0 screens a game.**
- 🟡 **P7-B: FC + ML + TL.** 3 items, 1 Fable run (about 430 words), one save addition (its review needs a `migrate` test). **3.7 / 3.5 / 4.2 / 4.0 screens a game, plus the flight once a save.**
- 🟠 **P7-C: TL + TG + ME.** Code and tools only, no Fable run. **2.7 / 1.8 / 4.0 / 3.9 screens a game.** The checks would then read about 25 more texts.
- 🔴 **P7-D: FC + LF + LG.** 1 Fable run (about 450 words), one save addition. **The flight once a save. LF and LG 0 a game** (LG 0.1 for Careful on the old calendar).

**Why P7-A:** it changes the most screens a game for all four players, with no save or balance change. FC's save addition then gets a push of its own.

## Open, options later
- *(done in v0.11.233 RV1, CM-b: the camp line on the first night while there is food.)*
- The talks' quiet walk and their old settled texts, folded on the Sociable's second cycle (4.5–9.9 a game left).
- The evening's folded screens (`supper`, `mei_walk`, `village_night`: by the rule of three, no change proposed).
- CW in part 8 (0: no Long Forest screens in 80 games).
- The hare's CW line: seen on the old calendar (1.3 / 1.3 / 1.4 / 0.7 a game), so the item is closed unless the owner wants it on the long calendar.
