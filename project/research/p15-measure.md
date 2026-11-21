# Push 15: raw numbers (2026-11-21, on the v0.11.242 working copy, not yet pushed)

Scratch copy `/tmp/p15w` (the working copy without `.git`, untouched). p14's hook went with `/tmp/p14w`; rebuilt to the same counting as `tests/lib/p15hook.mjs` (one row a visit: a new scene or a new text against the screen before, hubs included; called after `againView`, switched off before the replay check's two games; a hash of every step per game). `js/story/again.js` notes each fold's why (mem / SV / SD / VF on a new visit / VFk, kept on a redraw); `js/core/lines.js` `byDay` / `byDayLast` note each sequence key, its index and length; the rows carry the day, the story day (`storyDayOf`), the minute, a win's degree, the words and a text hash. A second copy `/tmp/p15o` is `git archive HEAD` (v0.11.241) with the same hook: **it reproduces p14's figures exactly** (all folded 218.1 / 225.5 / 80.8 / 58.5; VF 25.0 / 33.6 / 37.6 / 39.6; SD 1.8 / 1.4 / 9.5 / 10.2). Scratch only, nothing copied back; the patch and the counting scripts in `/tmp/p15t` (`patch.mjs`, `an.mjs`).

## How
- `P15OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, about 30 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: the same as v0.11.231–241. Once on each copy (a first pass counted visits without the hubs between them and lost `bl_camp`'s SD; fixed and rerun).
- The old calendar: the same without `--cal 7` (18 passed; screens 2,018 / 2,758 / 2,819 / 2,813), once on each copy.
- **Path check** (a hash of every step: scene, minute, Coil, per game) v0.11.242 against v0.11.241: **the same in 80 of 80 games** (both calendars).
- Figures a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old". "Day" counted from 0 as p13 and p14 did; "sd" the story day.
- Packets: `node tools/packet.mjs <id> --games 0`, bytes.

## 1. v0.11.242's effect
- **All folded screens:** 218.1 / 225.5 / 80.8 / 58.5 → **206.1 / 213.5 / 68.8 / 48.4 (−12.0 / −12.0 / −12.0 / −10.1; forecast P14-A 12.0 / 12.0 / 12.0 / 10.1: exact).** VF 25.0 / 33.6 / 37.6 / 39.6 → 13.0 / 21.6 / 25.6 / 29.5. Memory, SV, SD unchanged (184.4 / 184.4 / 24.0 / 0; 6.9 / 6.1 / 9.7 / 8.7; 1.8 / 1.4 / 9.5 / 10.2).
- **`village_night`:** VF 7.0 / 7.0 / 7.0 / 4.6 → **1.0 / 1.0 / 1.0 / 0.5** (EVn-23 −6.0 / −6.0 / −6.0 / −4.1: exact). Gone: `village_night:2` index 3–5 (days 31–33) and `:3` index 3–5 (days 38–40); all twelve now read in full by every player. Left: week 1's seventh (`village_night:quiet` index 6, day 27).
- **`night` (the forest):** VF 10.0 / 10.0 / 10.0 / 10.2 → **4.0 / 4.0 / 4.0 / 4.2** (NF6 −6.0 each: exact), SD 0 / 0 / 0 / 0.1. Gone: index 11–16. Left: index 17–20 (days 17–20, texts 3–6 again).
- **The plan's stops:** read **43 / 43 / 34 / 34**, evening 218 / 218 / 109 / 83, on both versions: **moved 0.**
- Old calendar: all folded 47.1 / 83.9 / 58.9 / 46.5 on both; VF 0: **unchanged.**

## 2. The forest night's last fold
- Index 15–16 (nights 16–17) read texts 1–2 again **in full**, not folded: their fire paragraph differs from nights 1–2 (77 / 94 words against 88 / 100; same ¶1 and ¶3). Index 17–20 read texts 3–6 again, the same text: VF 1.0 / 1.0 / 1.0 / 1.0 each, index 20 the Cultivator's 1.2 (+ SD 0.1).
- **3 more (18 texts):** index 15–17 new; 18–19 read texts 1–2 (full, fire differs); 20 reads text 3 (folds). **−3.0 each (12.0)**, 1 run.
- **4 more (19 texts):** index 15–18 new; 19–20 texts 1–2 (full). **−4.0 / −4.0 / −4.0 / −4.2 (16.2)**, 2 runs (three a run, as N2 / N3) or one long run.
- **6 more (21 texts):** every forest night its own; the same folds as four (16.2) plus the two near-repeats in full gone (2.0 each).
- Each a **rule change** (past fifteen, non-social). The night packet is **67 KB** now (all fifteen nights by form and fire; `night:<n>` takes a choice index, so it does not narrow); p14's drafting packet was 5.5 KB.

## 3. Re-measured: SN7, BH, BW, AH, SR3, TL2 / TL4 (all unchanged)
| item | folds a game now | fix |
|---|---|---|
| **SN7** `fo_supper:8` / `:9` index 6 (days 49 / 56) 1.0 each each; `supper:4` index 6 (day 27) 1.4 / 1.4 / 1.0 / 0.5; `supper:5` index 6 (day 34) 1.0 each; `village_night:quiet` index 6 (day 27) 1.0 / 1.0 / 1.0 / 0.5 | **5.4 / 5.4 / 5.0 / 4.0 (19.8)** | 5 texts, 800–1,000 words, 2 runs; rule change (seven a story day) |
| **BH** `dw_hunt` days 71–72 1.0 / 1.9 / 2.0 / 2.0; `rr_hunt` index 2–3 0 / 0 / 2.0 / 2.0 | fix −1.0 / −1.9 / −3.0 / −3.0 (8.9) | 3 texts, about 300 words, 1 run, no rule change |
| **BW** `ah_hawks_won` 0 / 0 / 1.2 / 1.3, `rr_elk_won` 0 / 0 / 1.2 / 0.8, `dw_serpent_won` 0 / 0 / 1.0 / 0.9 | fix −0 / −0 / −2.0 / −2.1 (4.1) | 3 texts, about 300 words, 1 run, no rule change |
| **AH** `ah_hunt` index 2–5 0 / 0 / 2.4 / 2.1 | fix −0 / −0 / −2.4 / −2.1 (4.5) | 4 texts, about 400 words, 1 run, no rule change |
| **SR3** `supper_roof` VF 0.1 / 0.1 / 0.3 / 4.9 | fix −0.1 / −0.1 / 0 / −3.4 (3.6) | 12 texts, about 1,000 words, 2 runs |
| **TL2 / TL4** `talk_mei` 0 / 4.0 / 1.3 / 1.6, `talk_ya` 0 / 4.0 / 1.2 / 1.5 (days 75–78) | TL2 −0 / −4.0 / −2.5 / −3.1 (9.6), TL4 −0 / −8.0 / −2.5 / −3.1 (13.6) | 1 / 2 runs; past the social six |

## 4. What folds most now (not by memory; the four added)
`bl_camp` 43.3 (SV + SD, by design) · `night` 16.3 · `supper` 10.0 (VF 2 seventh nights, SD 1.7 the Cultivator) · `fo_supper` 8.0 · `dw_hunt` 6.9 · `talk_mei` 6.9 · `talk_ya` 6.7 · `supper_roof` 5.4 · `rt_road` 4.6 (SD) · `ah_hunt` 4.5 · `rr_hunt` 4.0 · `village_night` 3.5 · `morning` 3.4 · `heart_gate` 2.6 (SD) · `ah_hawks_won` 2.5 · `herb_slopes` 2.0 · `rr_elk_won` 2.0 · `bl_fireside` 1.9 · `dw_serpent_won` 1.9 · `far_hunt` 1.4 · `mei_walk` 1.2 · `mire` 1.2 (SD) · `fo_pot_cook` 1.0.

### The p14 open items
- **`morning` day 14** (VF 0.9 / 0.9 / 0.8 / 0.8): **the cause is a wrong text on day 1.** `wilds.js` `morning` reads `forest_day === 2 ? "Another morning…" : "The third week in the forest…"`; on the long calendar `forest_day` is still 1 on the first morning (it rises once a week, `weekMorning`), so **every long-calendar game's first morning (day 1, 1.0 each) reads week 3's text** ("The third week in the forest", "For nights now something has circled the camp"); day 7 reads "Another morning", day 14 week 3's text again, the same hash: the fold. The old calendar never shows it with `forest_day` 1. Fix (MW): a week-1 text for `forest_day` 1 on the long calendar (one condition, 1 text about 100 words, no form lines; packet `morning` 1.6 KB): −0.9 / −0.9 / −0.8 / −0.8 (3.4), and day 1's text right. No rule change, save 0.
- **`herb_slopes` day 31** (VF 0 / 0 / 1.0 / 1.0): one text for all of week 2 (`vday(g) === 2`); the Completionist and Cultivator go on days 28 and 31, the second folds. Fix (HS): a second week-2 text in a `seqText` (1 text, about 80 words with the `mei_bruised` line; packet 3.9 KB): −0 / −0 / −1.0 / −1.0 (2.0). No rule change.

## 5. The review's open text items (`p14-review-t.md`)
Each changes wording only: 0 folds; the screen is read once a game by every player (forest 11 and 14: index 10, 13; 3:5: `village_night:3` index 4).
- **RT-11, forest 11's opener** (M2): ¶1 (57 words) retells the camp screen right above it ("the fallen trunk, which has kept the shape of your back"), its ¶3 close ("checks that it is still yours") old 5's "the camp has become yours". About 75 words.
- **RT-14, forest 14 against old night 8** (M2, L6): "The evening has an order now", ¶2's "a method you never decided on" / "a round you never decided to make", ¶3's watch that takes itself against old 8's "a thing done so often that it no longer counts as a decision" and "The watch-thread comes up by itself". About 90 words (¶1's second sentence, ¶2's two branches, ¶3).
- **RT-35, 3:5's wind** (L2): "Red cloth on the tribute post snaps in the wind…", closer "The wind keeps on. You do not.", against the week-3 hub's "The red banners on the tribute post hang dead still" at every visit (`ashfall.js` ~600). About 50 words of the shared text; Yuki's three lines can stay. Packet `village_night --week 3` 17.1 KB.
- All three in one Fable run (about 215 words), or the wording by Claude (0 runs, as RV1 did for some review items).

## 6. LF, the burned loft
- **`arson_lost` (the only scene that sets `loft_burned`) shown in 0 of 80 games** (both calendars); `arson_won` 0 / 0 / 0.8 / 0.4 (old 0 / 0 / 1.6 / 1.3). Note: EVn-23's week-3 texts name the ladder 4 times (3:4 human, 3:5 great, 3:6 shared and human); a burned-loft game would read them (0 games).

## 7. Re-checked: none moved
- **Paths the same in 80 of 80 games** (v0.11.241 → 242, both calendars): FC, LG, BYb-t hold at p10's figures.
- **SNr:** `ya_won` degree 1 only, 0 / 0 / 1.0 / 0.9 (both calendars); 2–3 **0**.
- **ST2 degree 3:** long `far_won` degree 1 0 / 0 / 4.5 / 1.7, degree 2 0 / 0 / 0.1 / 1.9, degree 3 **0**; old degree 1 only 0 / 0 / 0.4 / 0.3.
- **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).
- **The supper after midnight (p14 §8):** still there, old calendar, as p14 found it: the Sociable's story-day-8 supper after midnight (00:12) reads `fo_supper:9` index 0 in 10 of 10 games, and its next supper index 1.
