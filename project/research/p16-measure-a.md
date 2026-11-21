# Push 16, helper A: raw numbers (2026-11-21, on v0.11.245 = v0.11.243's game)

Scratch copy `/tmp/p16w`; the hook rebuilt to p15's counting (`/tmp/p16t/p16hook.mjs`, `patch.mjs`: one row a visit, hubs included; the fold's why; `byDay` key, index, length; plus the breakthrough's flags, Coil starts, result lines). **v0.11.242:** the clone is depth 1, so a fresh depth-8 clone and `git archive ce3ee9f` (`/tmp/p16o`), same hook: **it reproduces p15's figures exactly.** Nothing copied back.

## How
- `P16OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (29 passed, about 33 s; screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0), and without `--cal 7` (18 passed; 2,018 / 2,758 / 2,819 / 2,813). Once on each copy, one at a time.
- `--kept` once on each calendar (KA (b)). NF4 by simulation: a third copy (`/tmp/p16n`) whose `byDay` gives `night` 3 / 4 / 6 placeholder texts past the fifteen (unique words, form and fire in them); paths the same as the plain run in 40 of 40 each.
- Figures a game: Careful / Sociable / Completionist / Cultivator; long calendar unless "old"; "day" from 0 as p13–p15. Packets: `node tools/packet.mjs <id> --games 0`, bytes.

## 1. v0.11.243's effect
- **All folded:** 206.1 / 213.5 / 68.8 / 48.4 → **200.2 / 207.6 / 62.0 / 42.6 (−5.9 / −5.9 / −6.8 / −5.8;** forecast −6.3 / −6.3 / −6.8 / −5.8). **VF −6.3 / −6.3 / −6.8 / −5.8: exact** (13.0 / 21.6 / 25.6 / 29.5 → 6.7 / 15.3 / 18.8 / 23.7): `supper` 2.4 / 2.4 / 2.0 / 1.5 → 0, `fo_supper` 2.0 → 0, `village_night` 1.0 / 1.0 / 1.0 / 0.5 → 0, `morning` 0.9 / 0.9 / 0.8 / 0.8 → 0, `herb_slopes` 0 / 0 / 1.0 / 1.0 → 0.
- **The 0.4 gap:** memory 184.4 → **184.8** (Careful, Sociable): `supper:4` index 6 in Coils 2–3 (4 visits in 10 games) folded VF before; the new seventh text was read in Coil 1, so they fold by memory now. Not a text fold any new text could remove.
- Day 1's morning reads the week-1 text (109 words, 1.0 each); HS's days 28 / 31 both in full. SV, SD unchanged.
- **The plan's stops:** read **43 / 43 / 34 / 34**, evening 218 / 218 / 109 / 83: **moved 0.**
- **Paths the same as v0.11.242 in 80 of 80 games** (both calendars). Old calendar: all folded 47.1 / 83.9 / 58.9 / 46.5 on both, VF 0: **unchanged.**

## 2. BH, BW, AH (unchanged since p14)
| item | folds a game now, by index | fix | texts, words, runs | rule |
|---|---|---|---|---|
| **BH** | `dw_hunt` (one text, 81 words, sd13) day 71 0 / 0.9 / 1.0 / 1.0, day 72 1.0 each; `rr_hunt` (two, 117 words, sd12) index 2 0 / 0 / 1.0 / 1.0, index 3 0 / 0 / 1.0 / 1.0 | **−1.0 / −1.9 / −3.0 / −3.0 (8.9)** (index 3 rotates back to text 1) | 3 (dw 2, rr 1), about 280, 1 run | none |
| BH + a fourth `rr_hunt` | | −1.0 / −1.9 / −4.0 / −4.0 (10.9) | 4, about 400, 1 run | past three |
| **BW** | `ah_hawks_won` index 1–4 0 / 0.2, 0.3 / 0.6, 0.4 / 0.3, 0.5 / 0.2 (Compl. / Cult.: 1.2 / 1.3); `rr_elk_won` index 1 0.5 / 0.2, 2 0.7 / 0.6 (1.2 / 0.8); `dw_serpent_won` day 72 1.0 / 0.9 | a third hawks (index 2), a third elk (2), a second serpent: **−0 / −0 / −2.0 / −2.1 (4.1)** | 3, about 270 (hawks 59–74 by form, elk 114–166, serpent 58), 1 run | none |
| **AH** | `ah_hunt` (two, 97–105 words, days 73–78) index 2 0.3 / 0.2 (sd14), 3 0.4 / 0.5, 4 0.8 / 0.8, 5 0.9 / 0.6 (sd15) | sd14 a third + sd15 its own three (`seqText` by story day): **−0 / −0 / −2.4 / −2.1 (4.5)**; a third text alone −0.3 / −0.2 | 4, about 400, 1 run | none (three a story day) |
- Packets: `dw_hunt` 2.0 KB, `rr_hunt` 3.1, `ah_hunt` 4.6, `ah_hawks_won` 3.0, `rr_elk_won` 2.6, `dw_serpent_won` 1.0. Wins degree 2–3 add the stomp paragraph (`STOMP`), the rotated text stays one text.
- **BH + BW + AH: −1.0 / −1.9 / −7.4 / −7.2 (17.5)**, 10 texts, about 950 words, 3 runs (at once under FP), no rule change. Balance 0, save 0.

## 3. NF4, the forest night (`night`, 15 texts; simulated)
- Now: index 17–19 VF 1.0 each, index 20 VF 1.0 / 1.0 / 1.0 / 1.2 (+ SD 0.1 the Cultivator); index 15–16 read texts 1–2 again **in full** (77 / 94 words against 88 / 100: the fire paragraph differs). `night` VF 4.0 / 4.0 / 4.0 / 4.2.
- **3 more (18):** index 15–17 new; 18–19 texts 1–2 in full; 20 text 3 folds. **−3.0 / −3.0 / −3.0 / −3.0 (12.0).** About 360 words, 1 run.
- **4 more (19):** index 15–18 new; 19–20 texts 1–2 in full. **−4.0 / −4.0 / −4.0 / −4.2 (16.2).** About 480 words, 1 run (four) or 2.
- **6 more (21):** every night its own: **the same 16.2**, plus the two near-repeats in full gone (index 15–16, 1.0 each each). About 720 words, 2 runs.
- p15's forecasts hold exactly. Each **a rule change** (past fifteen). Packet `night` **67.7 KB** (unchanged). Balance 0, save 0.

## 4. Re-checked
- **ST2 degree 3:** long `far_won` degree 1 0 / 0 / 4.5 / 1.7, degree 2 0 / 0 / 0.1 / 1.9, **degree 3 0**; old degree 1 only 0 / 0 / 0.4 / 0.3. `ya_won` degree 1 only (0 / 0 / 1.0 / 0.9).
- **The hare's CW line** ("Mine first", `cookMeal`'s result line at `camp`): **long 0 / 0 / 0 / 0; old 1.3 / 1.3 / 1.4 / 0.7** (in a screen's text 0). As p7.
- **FC, long:** first Foundation 40 of 40 in prologue Coil 1: Careful and Sociable 16:00 (6) / 18:00 (4), Completionist 20:00 (4) / 21:00 (6), Cultivator 08:00 (10). `BT_CLOSER` 1.8 / 1.8 / 1.2 / 1.0. Coil starts at realm 0 after the first Foundation 27 / 27 / 2 / 0; `g.seen.breakthrough` misses 0. **Old:** first Foundation Careful / Sociable / Completionist in Act 1 Coils 2–4 (12:00–18:00, the Completionist 18:00–00:00), Cultivator prologue Coils 2–4 (17:00–20:00); `BT_CLOSER` 1.3 / 1.8 / 1.1 / 1.4; realm-0 starts after it 3 / 8 / 1 / 4; misses 0.
- **BYb-t** (Foundation screens, 10 games): long `lore1` 15 / 15 / 10 / 0, Wen only 0 / 0 / 2 / 0, neither 3 / 3 / 0 / 10; old `lore1` 12 / 16 / 11 / 14, Wen only 1 / 2 / 0 / 0, neither 0. As p10.
- **KA (b), `--kept` (the second pass after a won Act 1; every first pass won, 10 of 10):** **every Coil pass of the second pass starts at Foundation or above, and none shows `BT_CLOSER`** (0 in 40 games, each calendar). Long: Coil passes at Foundation+ **2.7 / 2.5 / 2.0 / 2.0 a game** (prologue 1.7 / 1.5 / 1.0 / 1.0, Act 1 1.0 each); breakthrough screens there 0 / 0.4 / 1.4 / 5.0 a game (higher realms, no closer). Old: **2.0 each** (prologue 1.0, Act 1 1.0); Careful's second pass ends in 6 of 10 (below). The plain runs: 0 (a Coil starts at Foundation+ only where Act 1 begins: long 0.2 / 0.2 / 1.0 / 1.0, old 0 / 0 / 0 / 1.0).

## 5. What else folds most now (VF / SV / SD; memory apart)
Blackroot (B), forest (F), village (V), Fallout (Fo), Heart / Return (H / R):
`bl_camp` B 43.3 (6.9 / 6.1 / 15.8 / 14.5, SV + SD by design) · `night` F 16.3 (§3) · `dw_hunt` B 6.9 · `talk_mei` B 6.9 (0 / 4.0 / 1.3 / 1.6) · `talk_ya` B 6.7 (0 / 4.0 / 1.2 / 1.5) · `supper_roof` V 5.4 · `rt_road` R 4.6 SD · `ah_hunt` B 4.5 · `rr_hunt` B 4.0 · `heart_gate` H 2.6 SD · `ah_hawks_won` B 2.5 · `rr_elk_won` B 2.0 · **`bl_fireside` B 1.9** · `dw_serpent_won` B 1.9 · `supper` V 1.7 (SD, the Cultivator) · `far_hunt` V 1.4 · `mei_walk` V 1.2 · `mire` F 1.2 (SD, day 3) · `fo_pot_cook` Fo 1.0 · `far_won` V 0.8 · `wen_time` V 0.8 · `heart_camp` H 0.8 SD.
- **Blackroot, VF: 2.0 / 10.6 / 12.5 / 12.2 (37.3)**, the talks in. Beyond BH / BW / AH: TL2 / TL4 (talks sd15, past the social six: TL2 −0 / −4.0 / −2.5 / −3.1 (9.6), TL4 −0 / −8.0 / −2.5 / −3.1 (13.6); packets 7.2 / 7.7 KB) and **`bl_fireside`** (new here): by region, three texts each; RR index 3 0.6 / 0.2 / 0.1 / 0, 4 0.2 / 0.1 / 0 / 0; AH index 3 0.2 / 0.3 / 0.1 / 0, 4 0 / 0.1 / 0 / 0. A fourth and fifth for RR and AH: **−1.0 / −0.7 / −0.2 / −0 (1.9)**, 4 texts, about 500 words (73–158 each), 1–2 runs; the trio's fireside (social, my reading): within six, no rule change. Packet 12.9 KB.
- **Forest:** `night` VF only (§3); `mire` SD 0 / 0 / 0.6 / 0.6 (a same-day return, no text fix). The rest is memory (later Coils): `night` 39.9 / 39.9 / 4.2 / 0, `morning` 4.5 / 4.5 / 0.4 / 0, `night_event` 2.0 / 2.0 / 0.2 / 0.
- Memory folds in the Blackroot: 0 (no bot replays Act 1's regions in a later Coil).

## 6. Side finding
- **`--kept` on the old calendar:** Careful runs 3, 4, 7, 8 do not finish in 60,000 steps (stuck at `yuki_form` ×2, `dw_hub` ×2); the same on a clean copy without the hook. `check.sh` runs `--kept` on the long calendar only (`tools/check.mjs` `models-kept`), so no check fails. Open, options later.
