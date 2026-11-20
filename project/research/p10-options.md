# Push 10: the rest of e (options)

Measured on the v0.11.236 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar (old where marked). Raw numbers in `p10-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Done in v0.11.236, its effect
- **CB3:** `bl_camp` folded 13.6 / 12.9 / 20.8 / 20.3 → **7.1 / 7.0 / 15.0 / 14.4** a game (forecast −6.5 / −5.9 / −5.8 / −5.9; measured the same). New texts read in full 4.0 each.
- **QW:** the talks folded 0 / 9.9 / 4.5 / 5.1 → **0 / 8.0 / 2.5 / 3.1** (forecast −0 / −1.9 / −2 / −2; measured the same). Beat 5 read in full 0 / 2 / 2 / 2.

## The sub-items
- **CB5, the camp's last nights** (RR and AH nights 4–5, the DW's 4th). Folded 7.1 / 7.0 / 8.9 / 8.6 a game. Scope: 5 texts (RR 2, AH 2, DW 1), about 225 words, 1 Fable run. Code: the three lists grow to five / four. **A rule change:** a fourth and fifth text for a non-social scene. Within three: no fix. Balance 0, save 0. After: **−7.1 / −7.0 / −8.9 / −8.6** (only SD folds left, 0 / 0 / 6.1 / 5.8).
- **HS1, the stock line out of the fold.** The bar shows HP, Convergence, Fed and the clock, not the stock; a folded camp hides `pantry(g)` (paragraph 2) on **7.1 / 7.0 / 15.0 / 14.4** screens a game (old 1.7 / 6.1 / 0.3 / 1.2); no other foldable scene does. Scope: code only (`again.js` keeps a `STATE_PARA` paragraph out of `rest`, `main.js` draws it after the first paragraph), 0 Fable. Balance 0, save 0. Changes those screens (the stock shown, not a fold).
- **HS2, fold the stock-only redraw.** After "Cook and eat." the camp is redrawn in full where only the stock changed: **4.8 / 4.1 / 5.8 / 5.1** a game (p9 2.3 / 2.2 / 4.0 / 3.2; old 2.8 / 2.9 / 2.2 / 2.2). Scope: code only (SV compares the story paragraphs, the stock aside, as VF's key does); needs HS1. Balance 0, save 0. After: those fold; with CB5, **6.9 / 6.1 / 9.7 / 8.7**.
- **EVk, the quiet nights three a week.** Index 0–6 week 1, 7–12 week 2, 13–18 week 3; index 6–18 fold 37.7 / 37.7 / 15.6 / 11.4 (VF 13 / 13 / 13 / 11.4, the rest memory folds of later Coils). Scope: weeks 2 and 3 each a sequence of three (as `supper:4` / `supper:5`), 6 texts by form, about 720–900 words, 2 Fable runs (packet 8.4 KB). Save 0 (new day keys in the Coil's existing record). After: **−6.0 / −6.0 / −6.0 / −5.0.** **Rule reading:** three per sequence, nine in the stay; the owner says whether that counts as three.
- **EVn, a cycle of six** (p9's): −3.0 / −3.0 / −3.0 / −1.9, 3 texts, 1 run. **A rule change** (six, not social). In no option: EVk does twice as much within three.
- **PKs, the packets' missing texts.** Measured before v0.11.236's RV1: `bl_camp`'s packet lacked AH 2 of 3 and DW 3 of 3; both talk packets lacked the quiet walk (beats 5+). *(Claude, after RV1 PS: the packet now draws the camps' third night and the talks' beat 5 by warmth and with Ya away; left: the Drowned Wood's camps, which have no evening state.)* Tools only, 0 screens. Rides with CB5 (its run needs the later nights).
- **PKf, a day filter for `packet.mjs`.** Tools only, 0 screens; the next runs' packets are 3.5–8.4 KB (`supper` 22.8, `mei_walk` 14.0 are done). In no option.
- **Re-checked, unmoved:** FC (`g.seen.breakthrough` misses 0), LF 0, LG long 0 (old 0.1 / 0 / 0 / 0), SNr 0, ST2 degree 3 0, BYb-t Wen only 0 / 0 / 0.2 / 0, ME 0.

## The options
Colours by how many screens a game each changes, the four players summed (fewer folded screens, from the measured visits by day index; HS1's screens show the stock).

- 🟢 **P10-A: EVk + HS1 + HS2 (recommended).** 2 Fable runs. No rule change if EVk reads as three. **About 17.9 / 17.1 / 26.8 / 24.5 a game.**
- 🟡 **P10-B: CB5 + HS1 + HS2 (+ PKs).** 1 Fable run. **One rule change** (the camp past three). **About 14.0 / 13.1 / 24.7 / 23.1** (after CB5 HS1 changes only the SD folds, 0 / 0 / 6.1 / 5.8).
- 🟠 **P10-D: HS1 + HS2.** 0 Fable runs, code only. **About 11.9 / 11.1 / 20.8 / 19.5.**
- 🔴 **P10-C: EVk + CB5 (+ PKs).** 2 Fable runs (about 950–1,100 words). **One rule change** (the camp). **About 13.1 / 13.0 / 14.9 / 13.6.**

**Why P10-A:** the most screens a game for all four players, and the only rule question is how EVk reads (if the owner counts nine as past three, P10-D is the fallback with no rule question).

## Open, options later
- The talks' later beats: Sociable beats 11–14 fold (8.0 a game, both talks), Completionist and Cultivator beats 11–12 (2.5 / 3.1); beat 11 is the quiet walk again (5 + 6k). The talks are social (six allowed).
- Whether the text lint reads the AH and DW camps' later texts (not checked here; v0.11.236's code review found it reads the six new texts, RR and AH at day index 1–2).
