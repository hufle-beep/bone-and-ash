# Push 9: the rest of e (options)

Measured on the v0.11.235 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar (old where marked). Raw numbers in `p9-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Done in v0.11.235, its effect
- **EVs:** `supper` folded 50.8 / 50.8 / 18 / 14.8 → **44.8 / 44.8 / 12 / 9.4** a game (forecast −7.2 / −7.2 / −6.0 / −5.3; measured −6.0 / −6.0 / −6.0 / −5.4). New texts read in full 6.0 each.
- **EVw:** `mei_walk` 30.4 / 30.4 / 7.2 / 0.9 → **24.8 / 24.8 / 2.4 / 0** (forecast −4.7 / −4.7 / −4.5 / −0.9). Read in full 5.6 / 5.6 / 4.8 / 0.9.
- **TG:** the packets (the lint's `STATES`) carry 39 of 39 and 34 of 34 new sentences.

## The sub-items
- **CB3, the camp a text a day, three a region** (Root Road and Ashen Hills; the Drowned Wood has its three).
  - Folded 13.6 / 12.9 / 20.8 / 20.3 a game: a new day with the same text 9.0 each, redrawn after "Cook and eat." 4.6 / 3.9 / 5.7 / 5.5, back the same day 0 / 0 / 6.1 / 5.8.
  - Scope: 4 texts (RR and AH days 2–3), about 160 words, 1 Fable run (packet 5.3 KB). Code: RR and AH to `byDay` lists, as `BL_DW_CAMP`. No rule change (not social). Balance 0. Save 0 (the key `bl_camp:<region>` exists).
  - After: **−6.5 / −5.9 / −5.8 / −5.9 folded** (arrivals 4.0; their redraws 2.5 / 1.9 / 1.8 / 1.9, then shown in full again). Days 4–5 still fold. Old calendar 0.
- **CB5, every camp night its own text.** As CB3 for all 14 nights: 9 texts (RR 4, AH 4, DW 1), about 360 words, 1 Fable run. **A rule change:** five texts for a non-social scene. After: **−13.6 / −12.9 / −14.7 / −14.5** (only the same-day returns fold).
- **EVn, the quiet nights a cycle of six.** Folded 53.5 / 53.5 / 20 / 13.3; forecast **−3.0 / −3.0 / −3.0 / −1.9**. 3 texts by form, about 360–450 words, 1 Fable run (packet 8.4 KB). **A rule change:** six for James alone in the loft.
- **QW, the talks' quiet walk.** Folded at beats 5 and 11: 0 / 3.9 / 4 / 4. A new slot-0 text in each talk (Mei Lin's with a Ya-away version), about 270 words, 1 Fable run (packets 3.6 + 3.5 KB). After: **−0 / −1.9 / −2 / −2**. No rule change.
- **YW, "your world" before she has heard it.** 2 / 2 / 0 / 0 games of 10 reach `mei_walk:5`'s or `:6`'s fourth text without the roof's first night that Coil: **0.4 / 0.4 / 0 / 0 screens a game** (of 5.8 / 5.8 / 2.4 / 0.6). Scope: the two phrases reworded so they hold either way ("your world" → where he comes from), about 10 words, riding in another run. Code 0. Changes the text on 5.8 / 5.8 / 2.4 / 0.6 screens; fixes 0.4 / 0.4 / 0 / 0.
- **PKf, a day filter for `packet.mjs`.** `supper` 22.8 KB, `mei_walk` 14.0 (v0.11.234 7.8, 1.3): the day states (17.6, 13.6). Tools only, 0 screens. The next runs' packets are 3.5–8.4 KB, so in no option.
- **Re-checked, unmoved:** FC (40 of 40 in prologue Coil 1, `g.seen.breakthrough` misses 0), LF 0, LG long 0 (old 0.1 / 0 / 0 / 0), SNr 0, ST2 degree 3 0, BYb-t Wen only 0 / 0 / 0.2 / 0, ME 0. Scopes as in `p6-options.md`.

## The options
Colours show how many screens each option changes a game (Careful / Sociable / Completionist / Cultivator; fewer folded screens, from the measured visits by day index; YW's fixed screens added).

- 🟢 **P9-B: CB5 + QW + YW.** 2 Fable runs (about 640 words). **One rule change** (the camp beyond three). **About 14.0 / 15.2 / 16.7 / 16.5 a game.**
- 🟡 **P9-C: EVn + CB3 + YW.** 2 Fable runs (about 530–620 words). **One rule change** (six for the quiet nights). **About 9.9 / 9.3 / 8.8 / 7.8.**
- 🟠 **P9-A: CB3 + QW + YW (recommended).** 2 Fable runs (about 440 words). No rule change, no save or balance change. **About 6.9 / 8.2 / 7.8 / 7.9.**
- 🔴 **P9-D: QW + YW.** 1 Fable run (about 280 words). **About 0.4 / 2.3 / 2 / 2.**

**Why P9-A:** the most screens a game for all four players within the rules as they stand (three for a non-social scene); P9-B and P9-C change more only with a rule change the owner would have to make first.

## Open, options later
- The camp's hammerspace line sits in the folded part on every folded camp screen (13.6 / 12.9 / 20.8 / 20.3 a game); not analysed (whether the bar shows the stock elsewhere, the fix).
- Folding a camp redraw where only the hammerspace line changed (2.3 / 2.2 / 4.0 / 3.2 a game; `bl_camp` is the only foldable scene with such redraws): waits on the item above.
- The quiet nights' second and third weeks (index 6–18, all fold): not analysed.
