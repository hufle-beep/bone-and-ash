# Push 17: raw numbers (2026-11-21, on the v0.11.246 working copy, not yet pushed)

Scratch `/tmp/p17w` (the working copy, tar, no `.git`) and `/tmp/p17o` (`git archive HEAD` = v0.11.245), both with p16's hook (`/tmp/p17t/patch.mjs`, `p16hook.mjs`: one row a visit, hubs included; the fold's why; `byDay` / `seqText` key, index, length). `--games 10 --off 0 --workers 1 --texts`, long (`--cal 7`, 29 passed each) and old (18 passed each), one run at a time. **v0.11.245 reproduces p16's figures exactly** (200.2 / 207.6 / 62.0 / 42.6). Figures a game, Careful / Sociable / Completionist / Cultivator, long unless "old"; "day" from 0. Packets `node tools/packet.mjs <id> --games 0`. Nothing copied back.

## 1. v0.11.246's effect
- **VF 6.7 / 15.3 / 18.8 / 23.7 → 0.6 / 8.6 / 8.0 / 14.2 (−6.1 / −6.7 / −10.8 / −9.5; forecast −6.0 / −6.6 / −11.6 / −11.4).** BH exact (`dw_hunt` −1.0 / −1.9 / −2.0 / −2.0, `rr_hunt` −0 / −0 / −1.0 / −1.0; index 3 rotates back, as forecast); AH exact (−2.4 / −2.1); BF exact (−1.0 / −0.7 / −0.2 / −0); NF6 −4.0 each (Cultivator −4.2). **BW short:** only `dw_serpent_won` (−1.0 / −0.9); `ah_hawks_won` 2.5 → 2.6, `rr_elk_won` 2.0 → 1.9. Why: at degree 2–3 `STOMP[id].win[degree]` replaces the whole win text (`js/core/story.js` 109–113), one text a degree (the hawks' with an away version), so the new third texts show at degree 1 only.
- **All folded 200.2 / 207.6 / 62.0 / 42.6 → 212.6 / 219.6 / 50.6 / 35.2.** Memory 184.8 / 184.8 / 24.0 / 0 → 203.7 / 203.7 / 23.8 / 0: game 9 of Careful and Sociable plays 5 Coils, not 3 (the bluff fails twice more; memory 87 → 290). Without game 9: 211.3 / 218.4 → 203.2 / 210.1. SV 6.9 / 6.1 / 9.7 / 8.7 → 6.7 / 5.9 / 9.7 / 8.1; SD 1.8 / 1.4 / 9.5 / 10.2 → 1.6 / 1.4 / 9.1 / 12.9 (the Cultivator's `bl_camp` +1.0, `heart_camp` +0.5: paths).
- **Paths:** the same as v0.11.245 up to the first flight in 80 of 80 games; from it on, different in 80 of 80 (its 10 minutes move the clock and the dice).
- **`first_flight`: 1.0 a game for each player, 40 of 40 games on each calendar, never twice.** Long: prologue Coil 1, days 13–38 (204 / 246 words, never folded). Old: Act 1 for Careful, Sociable, Completionist; the prologue for the Cultivator.
- **The plan's stops:** read 43 / 43 / 34 / 34 → **44 / 43 / 34 / 34**, evening 218 / 218 / 109 / 83 → 231 / 231 / 108 / 84 (Careful / Sociable: game 9's two Coils).
- **New, repeated in full:** the Cultivator **3 screens (0.3 a game)**, `night` day 21 index 20 (games 1, 2, 8): Yuki's form is changed on the night screen (`yuki_form`) and changed back; the text is the same one read minutes before, unfolded. `sameDayAgain` (`again.js` 241) keeps only the text last shown (`L.sd[id]`), so A → B → A is not "same day". Before, index 20 folded VF (a repeat of text 6); now it is new. Old 0.
- **Old calendar:** all folded 47.1 / 83.9 / 58.9 / 46.5 → 47.2 / 83.5 / 59.0 / 45.3, VF 0, repeated 0.

## 2. The bundle's items
| item | now | fix: folds a game removed | texts, words, runs | rule |
|---|---|---|---|---|
| **SR3** `supper_roof` (V) | VF 0 / 0 / 0.4 / 4.8; `:1` (week 1, 3 texts) idx 3–4, `:2` (weeks 2–3, 6) idx 6–12. Cultivator visits a week 1–5 / 3–7 / 1–6 | week 1 five + week 3 its own six (`:3`): 0 / 0 / 0.3 / 4.3 (4.6); + a seventh in weeks 2 and 3: **0 / 0 / 0.3 / 4.8 (5.1)** | 8 / 10 texts (each with its "Stay until…" line), ~1,000 / 1,250 words, 2 runs; packet 8.2 KB | none (six social, seven a story day) |
| **TL2 / TL4** `talk_mei` / `talk_ya`: **Blackroot screens**, days 65–79 (sd 11–15), folds days 76–79 (the Ashen Hills) | VF 0 / 4.0 / 1.2 / 1.5 and 0 / 4.0 / 1.2 / 1.4; visits a talk 1 / 15 / 12–13 / 12–13; folds by visit 12–15 | TL2 (beats 11–12): **0 / 4.0 / 2.4 / 2.9 (9.3)**; TL4 (11–14): **0 / 8.0 / 2.4 / 2.9 (13.3)** | 4 / 8 texts, ~500 / 1,000 words, 1 / 2 runs; packets 7.2 / 7.7 KB | past the social six |
| **BW2** the STOMP win texts (B, BW's gap) | hawks deg 2 VF 0.3 / 1.2, deg 3 0 / 0.4; elk deg 2 1.3 / 0, deg 3 0 / 0.6 (Compl. / Cult.) | two a degree: 0 / 0 / 1.0 / 1.3 (2.3); **three a degree: 0 / 0 / 1.6 / 2.2 (3.8)** | 4 (+2 away) / 8 (+4 away), ~750 / 1,500 words, 1 / 2 runs; code: `win[d]` by day | none (three) |
| **MW7** `mei_walk:5` (V) idx 6, sd 5's seventh walk | VF 0.6 / 0.6 / 0 / 0 | a seventh: **0.6 / 0.6 / 0 / 0 (1.2)** | 1, ~100 words; packet 14.2 KB | none (seven a story day) |
| **FH** `far_hunt` (V) per quarry (`wolves` / `bull` / `deer`, 3 each) idx 3–6 | VF 0 / 0 / 0.8 / 1.2 | a 4th each: 0 / 0 / 0.5 / 0.6 (1.1); **4th + 5th: 0 / 0 / 0.8 / 1.0 (1.8)** | 3 / 6, ~30 words each; packet 2.1 KB | past three |
| **FW** `far_won` (V) deg 1 idx 3–4 | VF 0 / 0 / 0.6 / 0.2 | a 4th: **0 / 0 / 0.5 / 0.2 (0.7)** | 1, ~60 words; 2.1 KB | past three |
| **PC** `fo_pot_cook` (Fo) 5th cook | VF 0 / 0 / 0.3 / 0.8 | a 4th repeat: **0 / 0 / 0.3 / 0.8 (1.1)** | 1 (+ label, go, result), ~170 words; 1.8 KB | past CK1's three |
| **HW** the slopes (V) | Compl. / Cult. spend both visits in week 2 (days 29 / 32) 10 of 10; week 3's text read 0 | a third visit, week 3 only, long calendar (simulated): read day 36, 1.0 / 1.0; **folds 0**; paths differ (Compl. / Cult.); Coils, realms, stops unchanged | 0 (Claude's code) | balance: +1 visit (+2 spirit grass, Mei Lin +4 / +2; or +3 / +5) |
| **SDm** (code) | §1's 3 full repeats | none left; the Cultivator +0.3 SD folds | 0 | none |
| **TX** tics (log only) | `rt_fire_talk` "the worst", `wen_lesson` "the forest" (new: v0.11.246's samples) + "a ladder", `rt_mother` "the street", `yk_night_fo` "the thatch", `yk_night_ya` "the grove", `herb_girl` "slide off", `rt_yk_talk` "beside you" + "years of", `breakthrough` "the ground" (new) | 10 swaps; 0 folds. Read by the bots: `wen_lesson` 0 / 0 / 2.2 / 1.9, `herb_girl` 1.4 / 1.4 / 1.0 / 0.7, `rt_fire_talk` 0 / 0 / 1.0 / 1.0, the rest 0 | ~50 words, 1 small run | none |

`supper` "the weather" ×4 stays (the text's joke, log only: `history-44.md`); "her mother" ×4 in the same text, no ruling found (open). Lint: 12 tics (v0.11.245: 11; "core formation" gone, "the forest" and "the ground" new).

## 3. Re-checked (no fix)
- **The week-3 seventh evening:** `supper:6` / `village_night:3` index 6 shown **0** (sd 6: 6.0 each): `nextEvening` sends week 3's story night to `evening` (the tribute's eve). Unreachable.
- **SNr:** `ya_won` degree 1 only (long 0 / 0 / 1.0 / 1.0, old 0 / 0 / 1.0 / 0.9); degree 2–3 **0**.
- **CW in part 8:** Long Forest screens **0** in 80 games (the bots never "Stay lost").
- **LF:** `arson_lost` 0 of 80, so `loft_burned` 0; `arson_won` 0 / 0 / 0.7 / 0.7 (old 0 / 0 / 1.6 / 1.3).

## 4. What else folds most (non-memory; area)
`bl_camp` B 43.3 (SV + SD) · `talk_mei` B 6.7 · `talk_ya` B 6.6 · **`supper_roof` V 5.2** · `rt_road` R 4.9 (SD, same-day returns) · `heart_gate` H 2.8 (SD) · `ah_hawks_won` B 2.6 · `rr_hunt` B 2.0 (idx 3) · **`far_hunt` V 2.0** · `supper` V 1.9 (SD, the Cultivator) · `rr_elk_won` B 1.9 · **`mei_walk` V 1.2** · `heart_camp` H 1.2 · `mire` F 1.2 · **`fo_pot_cook` Fo 1.1** · **`far_won` V 0.8** · **`wen_time` V 0.7** (VF 0 / 0 / 0.2 / 0.5, day 35: its closing line's pool) · **`village_morning` V 0.6** (the Cultivator, weeks 1 and 3).
- **Village 12.4, Fallout 1.1 (its own scenes 0), Return 4.9 (SD).** Old calendar: village and Fallout 0; `rt_road` 4.5 SD.
- Memory (later Coils, by design): `night` 92.4, `village_night` 87.0, `supper` 84.7, `mei_walk` 55.2, `supper_roof` 24.4, `village_morning` 17.6.
