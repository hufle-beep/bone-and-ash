# Push 16: BB's first bundle, the Blackroot and the forest (options)

Measured on v0.11.245 (= v0.11.243's game): Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar unless marked "old". Raw numbers: `p16-measure-a.md` (bots), `p16-measure-b.md` (text reads). v0.11.243's effect: all folded 206.1 / 213.5 / 68.8 / 48.4 → 200.2 / 207.6 / 62.0 / 42.6 (VF −6.3 / −6.3 / −6.8 / −5.8, exactly as forecast); stops 43 / 43 / 34 / 34 unmoved; paths as v0.11.242 in 80 of 80.

## The sub-items (folds = folded screens a game removed)
- **BH** the Blackroot's hunts (`dw_hunt` days 71–72, `rr_hunt` 2–3): 3 texts, ~300 words, 1 Fable run, **−1.0 / −1.9 / −3.0 / −3.0 (8.9)**. No rule change.
- **BW** the win texts (`ah_hawks_won`, `rr_elk_won`, `dw_serpent_won`): 3 texts, ~300 words, 1 run, **−0 / −0 / −2.0 / −2.1 (4.1)**. No rule change.
- **AH** `ah_hunt` 2–5: 4 texts, ~400 words, 1 run, **−0 / −0 / −2.4 / −2.1 (4.5)**. No rule change.
- **BF** `bl_fireside` RR and AH a 4th and 5th (new): 4 texts, ~500 words, 1 run, **−1.0 / −0.7 / −0.2 / −0 (1.9)**. No rule change only if the trio's fireside counts as social (six); otherwise past three: **your call**.
- **NF6** the forest night six more (15 → 21): 6 texts, 2 runs, **−4.0 / −4.0 / −4.0 / −4.2 (16.2)**, and nights 16–17's near-repeats of nights 1–2 gone. **Rule change** (past fifteen). (Three more: 12.0; four: 16.2 without the near-repeats.)
- **FC** the first flight, Coil 1: a scene on the breakthrough's "Get up." (realm 1, first Foundation of the Coil), ~300 words, 1 run, 1 screen a game (40 of 40 games). **Canon call inside it:** FC-o, out of sight (in the village only Yuki sees; Mei Lin and Ya see it in Act 1, as the carried flights already assume). Ashfall seeing it is open, options later (later village texts would need a read).
- **KA (b)** flight on a kept realm's passes (`coil_dawn`): the prologue's kept paragraph +1 sentence (~20 words); Act 1 a kept paragraph (~50 words), which also fixes "Your body has lost the road" shown after a kept realm. Shown 2.7 / 2.5 / 2.0 / 2.0 a game on second passes (old 2.0 each). Fable, in the small run SF.
- **BYb-t** a "Wen told you" branch in the Foundation breakthrough (`lore_realms && !lore1`): ~45 words, in SF. Seen 0 / 0 / 0.2 / 0 (old 0.1 / 0.2 / 0 / 0).
- **CF** `breakthrough`'s "core formation" tic ×3 (realm 2 with the party): a ~5-word swap, in SF.
- **LG** (all four in the Ashen Hills, so here, not bundle 2; Claude, code only): the cairn's card hidden while both are away (met 0); the climb to the pass gated `!yaAway` (old 0.1 a game; a path change in those games); `BT_MEI.night` removed (dead: 71 words never shown); the fire-beetle's **Ya +3 / +3 not while she is away (a relationship change, 0.1 a game)**.
- **Closed as accepted (docs only):** NR's open part (read: no text promises a full night after a night fight; `jackals_lost` / `night_lost` "Qi full" stay under the retune, unreached in task mode); ME (the 19:00 edge, 0 on both calendars, "back by evening"); ST2 degree 3 (unreachable: far foes grow with the days; only a high kept realm, KA (a)); the hare's CW line (old calendar 1.3 / 1.3 / 1.4 / 0.7; long 0 because the routine meal eats the hare first; the CW cap of 8 stands).
- Balance: none except LG's beetle. Save: none (no new flag).

## The options (colour by folds a game, the four added)
- 🟢 **P16-A (recommended): BH + BW + AH + BF + NF6 + FC (FC-o) + SF (KA (b), BYb-t, CF) + LG + the four closes.** 8 Fable runs (6, then 2). One rule change (past fifteen; two if the fireside is not social). **6.0 / 6.6 / 11.6 / 11.4 (35.6)**, plus the first flight, the kept passes' wrong line fixed.
- 🟡 **P16-B:** P16-A without NF6. 6 runs. No rule change (if the fireside is social). **2.0 / 2.6 / 7.6 / 7.2 (19.4)**.
- 🟠 **P16-C:** BH + BW + AH + LG + the closes. 3 runs. No rule change. **1.0 / 1.9 / 7.4 / 7.2 (17.5)**.
- 🔴 **P16-D:** LG + the closes only, KA (b) as Claude's plain 5 words on `keptLine`. No Fable. **0 folds.**

**Why P16-A:** BB takes the whole area in one push; NF6 is the biggest fold left (16.2) and with six runs at once costs no extra wait; the Act 1 kept pass's wrong line is fixed either way from P16-B up.

## Open, options later
- FC-w: Ashfall sees the first flight (and the later village texts that assume a mortal).
- The text lint never renders `night_event` / `bl_night_event` (a tools gap).
- `--kept` on the old calendar: 4 of 10 Careful games stuck (`yuki_form` ×2, `dw_hub` ×2), also on a clean copy; `check.sh` runs `--kept` on the long calendar only.
- `roadmap-e.md` line 10's "`breakthrough` naming Ya" is stale (done in v0.11.231): fixed in this push's docs.
