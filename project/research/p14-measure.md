# Push 14: raw numbers (2026-11-21, on the v0.11.241 working copy, not yet pushed)

Scratch copy `/tmp/p14w` (the working copy without `.git`, untouched). p13's hook went with `/tmp/p13w`; rebuilt to the same counting as `tests/lib/p14hook.mjs` (one row a visit: a new scene or a new text; called after `againView`, switched off before the replay check's two games; a hash of every step per game). `js/story/again.js` notes each fold's why (mem / SV / SD / VF on a new visit / VFk, kept on a redraw); `js/core/lines.js` `byDay` / `byDayLast` note each sequence key, its index and length (so `seqText`'s story-day sequences show by index); the rows carry the text day, the story day (`storyDayOf`), the minute, a win's degree and the words. A second copy `/tmp/p14o` is `git archive HEAD` (v0.11.240) with the same hook: **it reproduces p13's figures exactly** (all folded 230.1 / 237.5 / 92.8 / 70.7; VF 37.0 / 45.6 / 49.6 / 51.6). Scratch only, nothing copied back; the patch and the counting scripts in `/tmp/p14t`.

## How
- `P14OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 45 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: the same as v0.11.231–240. Once on each copy.
- The old calendar: the same without `--cal 7` (18 passed; screens 2,018 / 2,758 / 2,819 / 2,813), once on each copy.
- **Path check** (a hash of every step: scene, minute, Coil, per game) v0.11.241 against v0.11.240: **the same in 80 of 80 games** (both calendars).
- Figures a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old". "Day" is the game day from 05:00, counted from 0 as p13 did. "sd" is the story day.
- Packets: `node tools/packet.mjs <id> --games 0`, bytes.

## 1. v0.11.241's effect
- **All folded screens:** 230.1 / 237.5 / 92.8 / 70.7 → **218.1 / 225.5 / 80.8 / 58.5 (−12.0 / −12.0 / −12.0 / −12.2; forecast −12.0 each).** VF 37.0 / 45.6 / 49.6 / 51.6 → 25.0 / 33.6 / 37.6 / 39.6 (−12.0 each: exact). SD 1.8 / 1.4 / 9.5 / 10.4 → 1.8 / 1.4 / 9.5 / 10.2.
- **`fo_supper`:** VF 8.0 each → **2.0 each** (forecast FS10 −6.0: exact). sd10 (days 57–62) `fo_supper:10` index 0–5 read in full by every player. Left: sd8's index 6 (day 49) 1.0 and sd9's index 6 (day 56) 1.0 each, VF (the seventh supper, the old text again).
- **`supper`:** VF 8.4 / 8.4 / 8.0 / 7.5 → **2.4 / 2.4 / 2.0 / 1.5** (forecast SPw3 −6.0: exact). sd6 (days 35–40) `supper:6` index 0–5 read in full. Left: sd4's index 6 (day 27) 1.4 / 1.4 / 1.0 / 0.5 and sd5's index 6 (day 34) 1.0 each. SD 0 / 0 / 0 / 1.9 → **0 / 0 / 0 / 1.7**: two of the Cultivator's week-3 same-day returns (run 2 day 40, run 3 day 36) now show in full; the text changed within the minute (130 → 138, 128 → 132 words). SW3's `{yuki}` lines are by form; the week-2 text it replaced had none. So the Cultivator −6.2 (0.2 more screens in full than forecast, by design: a different text does not fold).
- **The plan's stops:** read **43 / 43 / 34 / 34**, evening 218 / 218 / 109 / 83, on both versions: **moved 0.**
- Old calendar: all folded 47.1 / 83.9 / 58.9 / 46.5 on both; VF 0, memory 42.7 / 79.1 / 53.7 / 39.6, SV 2.8 / 2.9 / 2.2 / 2.2, SD 1.6 / 1.9 / 3.0 / 4.7: **unchanged.**

## 2. EVn-23 (the quiet nights' weeks 2 and 3 six each)
- Unchanged: `village_night:2` index 3–5 (days 31–33) 1.0 / 1.0 / 1.0 / 0.8–0.9, `village_night:3` index 3–5 (days 38–40) 1.0 / 1.0 / 1.0 / 0.5–0.6: **−6.0 / −6.0 / −6.0 / −4.1 (22.1)** with six each. 6 texts by form (about 86 words each now; 720–900 words), 2 runs. Packets `--week 2` 12.2 KB, `--week 3` 12.2 KB. A rule change (six, non-social).

## 3. TL2 / TL4, BH, NF
- **`talk_mei`** 0 / 4.0 / 1.3 / 1.6, **`talk_ya`** 0 / 4.0 / 1.2 / 1.5 (sd14 day 75 0 / 1.0 / 0 / 0, sd15 days 76–78 the rest), all VF: unchanged. TL2 −0 / −4.0 / −2.5 / −3.1 (1 run); TL4 −0 / −8.0 / −2.5 / −3.1 (2 runs). Packets 7.2 / 7.7 KB.
- **`dw_hunt`** (one text, 81 words): folds day 71 0 / 0.9 / 1.0 / 1.0 and day 72 1.0 each = **1.0 / 1.9 / 2.0 / 2.0**. **`rr_hunt`** (two, 117 words): index 2–3 (days 68–69) **0 / 0 / 2.0 / 2.0**. BH unchanged: **−1.0 / −1.9 / −3.0 / −3.0 (8.9)**, about 300 words, 1 run, no rule change. Packets 2.0 / 3.1 KB.
- **`night`** (forest, 21 nights, nine texts, 111 words): index 11–13 (sd2) and 14–20 (sd3) VF **10.0 / 10.0 / 10.0 / 10.2**, SD 0 / 0 / 0 / 0.1; index 9–10 in full (the fire and form change the text). 3 more −3.0 each (1 run); 6 more −6.0 each (2 runs); 9 more −9.0 each (3 runs). Past nine, non-social. Packet 5.5 KB.

## 4. The seventh nights past six (VF)
| night | day | folds a game |
|---|---|---|
| `fo_supper:8` index 6 | 49 | 1.0 / 1.0 / 1.0 / 1.0 |
| `fo_supper:9` index 6 | 56 | 1.0 / 1.0 / 1.0 / 1.0 |
| `supper:4` index 6 | 27 | 1.4 / 1.4 / 1.0 / 0.5 (Careful and Sociable reach it in more than one Coil a game) |
| `supper:5` index 6 | 34 | 1.0 / 1.0 / 1.0 / 1.0 |
| `village_night:quiet` index 6 | 27 | 1.0 / 1.0 / 1.0 / 0.5 |
| sum | | **5.4 / 5.4 / 5.0 / 4.0 (19.8)** |
- A fix: a seventh text in each list (5 texts; the suppers about 140–160 words with Ya's `away` lines or Yuki's forms, the quiet night by form): about 800–1,000 words, 2 runs (Fallout one, village one). A rule change (seven a story day; six for the social suppers, six for the quiet night's week 1). No code change but the lists' length (seqText rotates by length). The suppers alone (4 texts): 4.4 / 4.4 / 4.0 / 3.5 (16.3). `supper:6`, `fo_supper:10` are six days long: no seventh. `supper_roof:2`'s day 34: 0 / 0 / 0 / 0.5 (below).

## 5. `supper_roof`, `ah_hunt`, the Blackroot's win texts
- **`supper_roof`** 0.1 / 0.1 / 0.3 / 4.9 VF: week 1 (`supper_roof:1`, three) index 3–4 0 / 0 / 0.3 / 1.0; weeks 2–3 share `supper_roof:2` (six, 13 roof nights): sd5 index 6 0 / 0 / 0 / 0.5, sd6 index 6–12 0.1 / 0.1 / 0 / 3.4. Week 3 its own six (`supper_roof:3`, with six `ROOF_STAY` lines, the reply keeps step with the index): −0.1 / −0.1 / 0 / −3.4 (3.6), 12 texts, about 1,000 words, 2 runs; social (Mei Lin), no rule change under the social six. Packet 8.2 KB.
- **`ah_hunt`** (two texts, 101 words; days 73–78) VF 0 / 0 / 2.4 / 2.1: index 2 0.3 / 0.2, 3 0.4 / 0.5, 4 0.8 / 0.8, 5 0.9 / 0.6 (Completionist / Cultivator). A third text: **−0.3 / −0.2** only (index 3–5 rotate back). sd14 a third + sd15 its own three (4 texts, about 400 words, 1 run, three a story day, no rule change): −0 / −0 / −2.4 / −2.1 (4.5). Packet 4.6 KB.
- **Win texts** (VF, Completionist / Cultivator): `ah_hawks_won` (two, by form, `awayList`) index 1 0 / 0.2, 2 0.3 / 0.6, 3 0.4 / 0.3, 4 0.5 / 0.2 (1.2 / 1.3); `rr_elk_won` (two, 166 words) index 1 0.5 / 0.2, 2 0.7 / 0.6 (1.2 / 0.8); `dw_serpent_won` (one, 58 words) day 72 1.0 / 0.9. **BW** (a third each for the hawks and the elk, a second for the serpent): −0 / −0 / −2.0 / −2.1 (4.1), about 300 words, 1 run, no rule change. Packets 3.0 / 2.6 / 1.0 KB. The rows carry degree 1–3 wins on the same indices (by-degree texts not checked).

## 6. What folds most now (not by memory)
Kinds: memory 184.4 / 184.4 / 24.0 / 0; VF 25.0 / 33.6 / 37.6 / 39.6; SV 6.9 / 6.1 / 9.7 / 8.7; SD 1.8 / 1.4 / 9.5 / 10.2. By scene (sum of the four):
| scene | folded a game | kind |
|---|---|---|
| `bl_camp` 43.3 | 6.9 / 6.1 / 15.8 / 14.5 | SV + SD only (by design) |
| `night` 40.3 | 10.0 / 10.0 / 10.0 / 10.3 | VF (now the biggest by far) |
| `village_night` 25.6 | 7.0 / 7.0 / 7.0 / 4.6 | VF (EVn-23 6.0 / 6.0 / 6.0 / 4.1, week 1's seventh) |
| `supper` 10.0 | 2.4 / 2.4 / 2.0 / 3.2 | VF two seventh nights, SD 1.7 |
| `fo_supper` 8.0 | 2.0 each | VF two seventh nights |
| `dw_hunt` 6.9 · `talk_mei` 6.9 · `talk_ya` 6.7 | §3 | VF |
| `supper_roof` 5.4 · `rt_road` 4.6 (SD) · `ah_hunt` 4.5 · `rr_hunt` 4.0 | §3, §5 | |
| `morning` 3.4 | 0.9 / 0.9 / 0.8 / 0.8 | VF (day 14) |
| smaller | `heart_gate` 2.6 SD, `ah_hawks_won` 2.5, `herb_slopes` 2.0 (day 31), `rr_elk_won` 2.0, `bl_fireside` 1.9, `dw_serpent_won` 1.9, `far_hunt` 1.4, `mei_walk` 1.2, `mire` 1.2 SD, `fo_pot_cook` 1.0 | |

## 7. LF, the burned loft
- **`arson_lost` (the only scene that sets `loft_burned`) shown in 0 of 80 games** (both calendars); `arson_start` 0; `arson_won` 0 / 0 / 0.8 / 0.4 (old 0 / 0 / 1.6 / 1.3). FS10 and SW3 name no loft or ladder (grep).

## 8. Re-checked: none moved
- **Paths the same in 80 of 80 games** (v0.11.240 → 241, both calendars): FC, LG, BYb-t hold at p10's figures.
- **SNr:** `ya_won` degree 1 only, 0 / 0 / 1.0 / 0.9 (both calendars); 2–3 **0**.
- **ST2 degree 3:** long `far_won` degree 1 0 / 0 / 4.5 / 1.7, degree 2 0 / 0 / 0.1 / 1.9, degree 3 **0**; old degree 1 only 0 / 0 / 0.4 / 0.3.
- **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).
- **The supper after midnight (p13 §10):** still there on the old calendar, both versions: the Sociable's day-8 supper after midnight reads `fo_supper:9` index 0 in 10 of 10 games, and its day-9 supper index 1. FS10's key by the text's story day (RV1 C M1) covers the long calendar's day 10 only; the long calendar has 0 such suppers.
