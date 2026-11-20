# Push 13: raw numbers (2026-11-20, on the v0.11.239 working copy, not yet pushed)

Scratch copy `/tmp/p13w` (the working copy without `.git`, untouched). p12's hook went with `/tmp/p12w`; rebuilt to the same counting as `tests/lib/p13hook.mjs` (one row a visit: a new scene or a new text; called after `againView`, switched off before the replay check's two games). `js/story/again.js` notes each fold's why (mem / SV / SD / VF on a new visit / VFk, kept on a redraw); `js/core/lines.js` `byDay` notes each sequence key, its index and length (so `seqText`'s story-day sequences show by index); the rows carry the text day, the story day (`storyDayOf`), the minute and a win's degree. A second copy `/tmp/p13o` is `git archive HEAD` (v0.11.238) with the same hook: **it reproduces p12's after-figures exactly** (all folded 236.1 / 243.5 / 98.8 / 76.7; `fo_supper` VF 14.0 each). Scratch only, nothing copied back.

## How
- `P13OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, about 50 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: the same as v0.11.231–238. Run three times on `/tmp/p13w` (minutes, then degrees, added; the folds the same each time) and once on `/tmp/p13o`.
- The old calendar: the same without `--cal 7` (18 passed; screens 2,018 / 2,758 / 2,819 / 2,813), twice on `/tmp/p13w`, once on `/tmp/p13o`.
- **Path check** (a hash of every visit: scene, minute, Coil, per game) v0.11.239 against v0.11.238: **the same in 80 of 80 games** (both calendars).
- Figures a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old". "Day" is the game day from 05:00, counted from 0 as p12 did. "sd" is the story day.
- Packets: `node tools/packet.mjs <id> --games 0`, bytes.

## 1. v0.11.239's effect
- **All folded screens:** 236.1 / 243.5 / 98.8 / 76.7 → **230.1 / 237.5 / 92.8 / 70.7 (−6.0 each; forecast −6.0 each: exact).** VF 43.0 / 51.6 / 55.6 / 57.6 → 37.0 / 45.6 / 49.6 / 51.6.
- **`fo_supper`:** VF 14.0 each → **8.0 each**, the same for every player (all four eat every Fallout supper: one visit a day, days 43–62). By story day and index:
  - sd8 (days 43–49, `fo_supper:8`, six texts): index 0–5 read in full; **index 6 (day 49, the seventh supper, the old text again) folds 1.0 each.**
  - sd9 (days 50–56, `fo_supper:9`): index 0–5 read in full; **index 6 (day 56) folds 1.0 each.**
  - sd10 (days 57–62): it goes on with sd9's sequence, index 7–12 (FS9's texts and the old three again): **all six fold, 6.0 each.** Why: day 10 has no sequence of its own (`dd()` caps at 10 and anything past 8 takes `fo_supper:9`), so each of its six suppers repeats a text read on days 50–55.
  - Folded: day 8's 7th 1.0 + day 9's 7th 1.0 + day 10's six 6.0 = **8.0 each**, all VF.
- **The plan's stops:** read **43 / 43 / 34 / 34**, evening 218 / 218 / 109 / 83, on both versions: **moved 0.**
- Old calendar: VF 0, memory 42.7 / 79.1 / 53.7 / 39.6, SV 2.8 / 2.9 / 2.2 / 2.2, SD 1.6 / 1.9 / 3.0 / 4.7: the same on both versions.

## 2. FS10 (the Fallout supper's story day 10 its own six)
- A sequence `fo_supper:10` of six new texts (Ya at the table, `away` lines without her, as FS9): days 57–62 read in full: **−6.0 each (24.0).** Left: the two seventh suppers (days 49, 56) 1.0 + 1.0. The old calendar never reaches a story-day-10 supper (its day 10 is the farewell), so the six show only on the long calendar. Texts about 150–180 words each (FS8 three 619 words with Yuki's forms; FS9 three 495 with the away lines): **about 900–1,100 words, 2 runs.** Packet `fo_supper` now **20.8 KB** (six texts a day since v0.11.239; 6.8 at p12).

## 3. SPw3 (the village supper's week 3 its own six)
- `supper:5` serves every village day past the first (`vday ≥ 2`): weeks 2 and 3, 13 nights. By `storyDayOf`, week 2 is sd5 (days 28–34) and week 3 sd6 (days 35–40). VF: sd4's index 6 (day 27) 1.4 / 1.4 / 1.0 / 0.5; sd5's index 6 (day 34) 1.0 each; sd6 index 7–12 (days 35–40) **6.0 each**; SD (same-day returns) 0 / 0 / 0 / 1.9, of it 0.6 in sd6.
- Week 3 its own six: **−6.0 / −6.0 / −6.0 / −6.0 (24.0)**; the Cultivator's 0.6 SD in week 3 stays (same-day returns fold by design). p12's "about −5.5" for her counted that SD in. 6 texts, about 800 words, 2 runs. Packet `supper` 22.8 KB. Old calendar: its supper on sd6 does not happen (village days 1–2 only), so long calendar only.

## 4. EVn-23 (the quiet nights' weeks 2 and 3 six each)
- Unchanged: `village_night:2` index 3–5 fold 1.0 / 1.0 / 1.0 / 0.8–0.9 (3.0 / 3.0 / 3.0 / 2.5), `village_night:3` index 3–5 1.0 / 1.0 / 1.0 / 0.5–0.6 (3.0 / 3.0 / 3.0 / 1.6): **−6.0 / −6.0 / −6.0 / −4.1** with six each. 6 texts by form, about 720–900 words, 2 runs. Packets `village_night --week 2` 12.2 KB, `--week 3` 12.2 KB. A rule change (six, non-social). Week 1's seventh night (index 6) still folds 1.0 / 1.0 / 1.0 / 0.5.

## 5. TL2 / TL4 (the talks' beats 11–12 / 11–14)
- Unchanged: `talk_mei` 0 / 4.0 / 1.3 / 1.6, `talk_ya` 0 / 4.0 / 1.2 / 1.5 (sd14 0 / 1.0 / 0 / 0, sd15 the rest), **both 0 / 8.0 / 2.5 / 3.1**, all VF. TL2 −0 / −4.0 / −2.5 / −3.1 (1 run); TL4 −0 / −8.0 / −2.5 / −3.1 (2 runs). Past the social six. Packets 7.2 / 7.7 KB.

## 6. BH and NF
- **`dw_hunt`** (one text, sd13, days 70–72; the folds on days 71–72): visits 2.0 / 2.9 / 3.0 / 3.0, folds **1.0 / 1.9 / 2.0 / 2.0**. **`rr_hunt`** (two texts): visits 3 and 4 (index 2, 3) fold **0 / 0 / 2.0 / 2.0** (1.0 each). BH (two more for the wood, a third for the root road): **−1.0 / −1.9 / −3.0 / −3.0 (8.9)**, about 300 words, 1 run, no rule change. Packets 2.0 / 3.1 KB. (`ah_hunt` 0 / 0 / 2.4 / 2.1, unchanged.)
- **`night`** (the forest, 21 nights, nine texts): VF **10.0 / 10.0 / 10.0 / 10.2** (index 11–13 on sd2, 14–20 on sd3; index 9–10 read in full: the fire changes the text). 12 texts −3.0 each (1 run); 15 texts −6.0 each (2 runs). Past nine, non-social. Packet 5.5 KB.

## 7. What folds most now (not by memory)
Kinds: memory 184.4 / 184.4 / 24.0 / 0; VF 37.0 / 45.6 / 49.6 / 51.6; SV 6.9 / 6.1 / 9.7 / 8.7; SD 1.8 / 1.4 / 9.5 / 10.4. By scene (sum of the four):
| scene | folded a game | kind |
|---|---|---|
| `bl_camp` 43.3 | 6.9 / 6.1 / 15.8 / 14.5 | SV + SD only (by design) |
| `night` 40.3 | 10.0 / 10.0 / 10.0 / 10.3 | VF (0.1 SD) |
| `supper` 34.2 | 8.4 / 8.4 / 8.0 / 9.4 | VF 8.4 / 8.4 / 8.0 / 7.5, SD 0 / 0 / 0 / 1.9 |
| `fo_supper` 32.0 | 8.0 each | VF (sd10 6.0, two seventh nights) |
| `village_night` 25.6 | 7.0 / 7.0 / 7.0 / 4.6 | VF |
| `dw_hunt` 6.9 · `talk_mei` 6.9 · `talk_ya` 6.7 | §5, §6 | VF |
| `supper_roof` 5.4 | 0.1 / 0.1 / 0.3 / 4.9 | VF: the Cultivator's week 1 (3 texts) index 3–4 1.0, weeks 2–3 (six shared, 13 roof nights) index 6–12 3.9 |
| `rt_road` 4.6 | 1.0 / 0.9 / 1.6 / 1.1 | SD |
| `ah_hunt` 4.5 · `rr_hunt` 4.0 | §6 | VF |
| `morning` 3.4 | 0.9 / 0.9 / 0.8 / 0.8 | VF ("The third week in the forest…") |
| smaller | `heart_gate` 2.6 SD, `ah_hawks_won` 2.5, `herb_slopes` 2.0, `rr_elk_won` 2.0, `bl_fireside` 1.9, `dw_serpent_won` 1.9, `far_hunt` 1.4, `mei_walk` 1.2, `mire` 1.2 SD, `fo_pot_cook` 1.0 | |

## 8. LF, the burned loft
- **`arson_lost` (the only scene that sets `loft_burned`) shown in 0 of 80 games** (both calendars); `arson_start` 0; `arson_won` 0 / 0 / 0.8 / 0.4 (old 0 / 0 / 1.6 / 1.3). FS8 / FS9's new texts name no loft or ladder (grep). p12 §5's list of loft texts stands.

## 9. Re-checked: none moved
- **Paths the same in 80 of 80 games** (v0.11.238 → 239, both calendars): FC, LG, BYb-t hold at p10's figures.
- **SNr:** `ya_won` degree 1 only, 0 / 0 / 1.0 / 0.9 (both calendars); 2–3 **0**.
- **ST2 degree 3:** long `far_won` degree 1 0 / 0 / 4.5 / 1.7, degree 2 0 / 0 / 0.1 / 1.9, degree 3 **0**; old degree 1 only 0 / 0 / 0.4 / 0.3.
- **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).

## 10. Found on the way (not in the brief)
- **A supper after midnight reads the next story day's text (old calendar, Sociable, 10 of 10 games, Coil 2 or 3, also on v0.11.238).** The Sociable stays in `fo_ashfall` on day 8 until about 00:11; `fo_supper` then shows at text day 8 but calendar day 9: `dd()` reads `storyDay` (`calDayOf`, from midnight) while the day records read `textDay` (from 05:00). It gets `fo_supper:9`'s first text in its Ya-away form on day 8, and on day 9 `fo_supper:9`'s index 1 (the old "hare" text) instead of index 0. 0 screens folded; a text-order fault. The long calendar: 0 such suppers.
