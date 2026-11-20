# Push 8: the rest of e (options)

Measured on the v0.11.234 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar (old where marked). Raw numbers in `p8-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Done in v0.11.234, its effect
- **RN:** the roof's later nights folded 9.1 / 9.1 / 1.1 / 6.7 → **6.8 / 6.8 / 0.4 / 3.9** a game (forecast 6.1 / 6.1 / 0 / 3.7; the rest is the six coming round again). New texts read in full 2.3 / 2.3 / 0.7 / 2.8.
- **ML:** no-cook meal screens 1.2 / 2.2 / 0.3 / 0.1, all in the no-cook version. `AH2_POT`'s clause 0 (neither woman close: no bot).
- **TL:** "back tomorrow" for an absent woman 2.7 / 1.8 / 4.0 / 3.9 → **0** (old 5.5 / 2.3 / 4.9 / 4.8 → 0).
- **A no-cook evening that says he cooked:** 0 (only Yuki's "you will cook" promise).

## The sub-items
- **EVs, the supper's two sequences a cycle of six** (`supper:4`, `supper:5`).
  - Folded 50.8 / 50.8 / 18 / 14.8 a game.
  - Scope: 6 texts. About 720 words lean (120 a text, as the roof's); about 1,950 if they keep the old ones' branches. 1 Fable run (2 if branched). Code: `seqText`'s list. A rule change: six for the supper (the social exception, as the roof and the talks).
  - Folded after (forecast from the day index): **−7.2 / −7.2 / −6.0 / −5.3**. Balance 0. Save 0.
- **EVw, the walk's two sequences a cycle of six** (`mei_walk:5`, `mei_walk:6`).
  - Folded 30.4 / 30.4 / 7.2 / 0.9.
  - Scope: 6 texts, about 720 words lean (1,120 branched), 1 Fable run. Same rule change.
  - Folded after (forecast): **−4.7 / −4.7 / −4.5 / −0.9**. Balance 0. Save 0.
- **EVn, `village_night`'s quiet nights a cycle of six.** Folded 53.5 / 53.5 / 20 / 13.3; forecast −3.0 / −3.0 / −3.0 / −1.9. 3 texts, about 360 words. James alone in the loft: not a social scene, so the three-text rule stands. In no option.
- **QW, the talks' quiet walk** (slot 0 of the cycle of six: beat 2's text again at beats 5 and 11).
  - Both talks' quiet walk folded 0 / 3.9 / 4 / 4 a game.
  - Scope: a new text for slot 0 in each talk (beat 2 keeps the quiet walk); Mei Lin's with a Ya-away version. About 270 words, 1 Fable run.
  - Folds after (forecast): **−0 / −1.9 / −2 / −2**. Balance 0. Save 0.
- **FC, the first flight.** Met once a save (40 of 40 in prologue Coil 1).
  - Scope: about 300–350 words, 1 Fable run.
  - **Save:** one kept flag. `migrate`'s gap is closed by `g.seen.breakthrough`, which misses 0 of 56 later Coils. Balance 0.
- **TG, the text checks' samples.** 0 screens.
  - The lint reads 95 of 241 new sentences of v0.11.232–234. Unread: every Ashen Hills fireside part, RR's cooked lines, `fo_mei` days 9–10, `fo_ya_time` day 9, the roof's five later-night texts, every `ROOF_STAY` line, two CW lines.
  - Scope: tools only. Sample states for `vday` 2 on later days (results too), story days 9–10, the Ashen Hills on later days, cooked and not. `packet.mjs`: Ya away, both away, the Ashen Hills, `vday`, the cook mark. About 146 more sentences read. No Fable run.
  - *(v0.11.234 RV1, LS, after this measure: the roof's six later nights, every `ROOF_STAY` line of the later nights, and the Root Road and Ashen Hills meal texts 2–3 cooked and not are now read; left: `fo_mei` days 9–10, `fo_ya_time` day 9, the two CW lines, `packet.mjs`'s states; the 146 is less by those, not re-counted.)*
- **LF** 0 a game (no bot loses the arson); about 100 words, riding in a run. **LG** long 0, old 0.1 / 0 / 0 / 0; code guards. **SNr** 0. **ST2 degree 3** 0. **BYb-t** 0 / 0 / 0.2 / 0 (old 0.1 / 0.2 / 0 / 0), about 45 words. **ME** 0 (the bots never open a menu); code only. Scopes as in `p6-options.md`.

## The options
Colours show how many screens each option changes a game, from the numbers above (Careful / Sociable / Completionist / Cultivator; the EV and QW figures are forecasts from the measured day indices).

- 🟢 **P8-A: EVs + EVw + TG (recommended).** 3 items, 2 Fable runs (about 1,450 words lean). One rule change (six for the supper and the walk). No save or balance change. **About 11.9 / 11.9 / 10.5 / 6.2 fewer folded screens a game.** The checks then read the new texts and about 146 more.
- 🟡 **P8-B: EVs + QW + TG.** 3 items, 1–2 Fable runs (about 990 words lean). One rule change (six for the supper). **About 7.2 / 9.1 / 8.0 / 7.3 a game.**
- 🟠 **P8-C: FC + QW + TG.** 3 items, 1–2 Fable runs (about 600 words), one save addition (its review needs a `migrate` test). **0 / 1.9 / 2 / 2 a game, plus the flight once a save.**
- 🔴 **P8-D: FC + BYb-t + LG.** 1 Fable run (about 375 words) and code guards, one save addition. **The flight once a save; BYb-t 0 / 0 / 0.2 / 0; LG 0** (old 0.1 for Careful).

**Why P8-A:** it changes the most screens a game for all four players, with no save or balance change. Keeping the new texts lean (as the roof's) keeps it within 2 Fable runs.

## Open, options later
- `bl_camp`'s folds (13.6 / 12.9 / 20.8 / 20.3 a game; a one-text scene by region, redrawn after each action): not analysed.
- An old save mid-week (C L2): nothing breaks. No change proposed.
- CW in part 8: 0 (no Long Forest screens). The hare's CW line: seen on the old calendar only; closed unless the owner wants it.
