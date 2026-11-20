# Push 9: raw numbers (2026-11-20, on the v0.11.235 working copy, not yet pushed)

Scratch copy `/tmp/p9w` (the working copy untouched, no `.git`). Its `tests/models.test.mjs` carries one measuring hook (`tests/lib/p9hook.mjs`, called after `againView`; switched off before the replay check's two games), `js/core/lines.js`'s `byDay` notes each call's key and day index (so `seqText`'s keys and `village_night:quiet`), and `js/story/again.js`'s fold returns carry a `why` (memory / SV / SD / VF). Scratch only, never to copy back. v0.11.235 against v0.11.234 in the game files: texts only (`SUPPER_NEW`, `WALK_NEW` in `ashfall.js`, `news.js`), so the bots' paths are the same.

## How
- `P9OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 1 min 6 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: **the same as at v0.11.231–234** (the same dice and paths). Run three times (the camp's breakdown, the redraws): the same numbers each time.
- The old calendar: the same without `--cal 7` (40 games; 18 passed; screens 2,018 / 2,758 / 2,819 / 2,813, as p7–p8), for FC, LG, SNr, ST2, BYb-t, the camp and "your world".
- Packets: `node tools/packet.mjs <id> --games 0`, bytes of the output; blocks split by header (a form, or a `state:`).
- As p6–p8: a screen counts once a visit (a new scene or a new text). "Folded" = `againView` folds it. Figures are a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old".

## 1. v0.11.235's effect
- **`supper`:** shown 58 / 58 / 24 / 22.1 (unchanged); **folded 50.8 / 50.8 / 18 / 14.8 → 44.8 / 44.8 / 12 / 9.4 (−6.0 / −6.0 / −6.0 / −5.4;** forecast −7.2 / −7.2 / −6.0 / −5.3). The rest are memory folds of later Coils (`mem`, 1.9 at each index for Careful) and the 7th night (`supper:4` index 6, VF).
- **`mei_walk`:** shown 37.4 / 37.4 / 14 / 4.5; **folded 30.4 / 30.4 / 7.2 / 0.9 → 24.8 / 24.8 / 2.4 / 0 (−5.6 / −5.6 / −4.8 / −0.9;** forecast −4.7 / −4.7 / −4.5 / −0.9).
- By index (shown, folded), index 3–5 = the new texts: `supper:4` 2.9 (1.9) / 2.9 (1.9) / 1.2 (0.2) / 1.0–1.6 (0–0.6, SD); `supper:5` the same, index 6–12 (week 3) fold VF; `mei_walk:5` 2.8–2.9 (1.8–1.9) / same / 0.2–1.2 (0–0.2) / 0; `mei_walk:6` 1.4–2.9 (0.8–1.9) / same / 0.7–1.2 (0.1–0.2) / 0–0.6 (0).
- **The new texts read in full:** `supper` 6.0 / 6.0 / 6.0 / 6.0; `mei_walk` 5.6 / 5.6 / 4.8 / 0.9.
- **The checks read them:** the `supper` and `mei_walk` packets (`STATES`, shared with the lint) carry 39 of 39 and 34 of 34 of the new sentences (6+ words).

## 2. EVn, `village_night`'s quiet nights (unchanged)
- One key (`village_night:quiet`) over all three village weeks, 19 nights, 3 texts. Folded 53.5 / 53.5 / 20 / 13.3. Index 0–2 fold 1.9 a text (memory, Careful); index 3–18 fold 2.9 each (VF + memory).
- A cycle of six, forecast (folds at 3–5 less folds at 0–2): **−3.0 / −3.0 / −3.0 / −1.9**. 3 texts by form (3 forms each), about 360–450 words.

## 3. QW, the talks' quiet walk (unchanged)
- Both talks folded 0 / 9.9 / 4.5 / 5.1. Beats 5 and 11 (slot 0): **0 / 3.9 / 4 / 4** folded. Beats 12–14: 0 / 6 / 0.5 / 1.1. A new text in slot 0 (beat 2 keeps the quiet walk) reads beat 5 in full: **−0 / −1.9 / −2 / −2**. Old calendar: beats 0–4 only.

## 4. `bl_camp`'s folds
- Shown 20.9 / 20.1 / 29.8 / 28.5, folded **13.6 / 12.9 / 20.8 / 20.3** (every step 14.8 / 13.9 / 23.2 / 22.8). One Coil reaches the Blackroot a game: 14 camp nights (Root Road 5, Drowned Wood 4, Ashen Hills 5). No memory folds on the long calendar.
- **Why** (by region and the region's day index, `bl_camp:<region>`):
  - **A new day, the same text (VF): 9.0 / 9.0 / 9.0 / 9.0.** Root Road days 1–4 (one text) 4.0, Ashen Hills days 1–4 (one text) 4.0, Drowned Wood day 3 (`BL_DW_CAMP` has 3) 1.0.
  - **Redrawn after an action on a folded day (VF kept): 4.6 / 3.9 / 5.7 / 5.5.** "Cook and eat." changes only the hammerspace line (`STATE_PARA`); the region paragraph is the same. RR 1.8 / 1.6 / 2.3 / 1.9, AH 1.9 / 1.6 / 3.0 / 3.0, DW 0.9 / 0.7 / 0.4 / 0.6.
  - **Back at camp the same day (SD): 0 / 0 / 6.1 / 5.8.**
- Shown in full again on a redraw (day 0, and DW days 0–2): 2.3 / 2.2 / 4.0 / 3.2. Across all foldable scenes, a redraw where only the hammerspace line changed: **`bl_camp` only** (the other such redraws are task hubs, which never fold).
- **A folded camp screen puts the hammerspace line in the folded part** (`foldParts` keeps paragraph 1; `pantry(g)` is paragraph 2): 13.6 / 12.9 / 20.8 / 20.3 screens a game.
- Old calendar: shown 8.5 / 13 / 6.5 / 7.4, folded 1.7 / 6.1 / 0.3 / 1.2 (memory and SD only; one night a region, two in the Drowned Wood).
- Days 1–2 of RR and AH (a list of three): arrivals 4.0 all four; their redraws 2.5 / 1.9 / 1.8 / 1.9. Days 1–4 (and DW 3): arrivals 9.0; redraws 4.6 / 3.9 / 5.7 / 5.5.
- Texts: RR and AH about 40 words each, `BL_DW_CAMP` 122 words for 3. Packet `bl_camp` 5.3 KB.

## 5. "Your world" (v0.11.235 review T L7)
- The told scene: `supper_roof`'s first night (`s:supper_roof:1`, the old text: "every constellation among them is wrong", "Give or take a galaxy", the trees; its stay line "Tell me about the trees again"). Grep for another world, your world, stars, galaxy, where you come from, your people in `ashfall.js`, `prologue.js`, `act1_fallout.js`: no other scene before the village weeks 2–3 tells her; the Blackroot talks, the songs and the Heart come later.
- `mei_walk:5`'s and `mei_walk:6`'s index 3 ("your world"): reached in 10 / 10 / 10 / 6 games, 5.8 / 5.8 / 2.4 / 0.6 screens a game.
- **Without the roof's first night in that Coil: 2 / 2 / 0 / 0 games of 10; 0.4 / 0.4 / 0 / 0 screens a game** (one `mei_walk:5`, one `mei_walk:6` in each). Old calendar: 0 (no index 3).
- The phrase: two places only, "whether your world has collectors", "the dullest thing about your world".

## 6. The packets (v0.11.235 RV1)
- `supper` **22.8 KB** (forms 5.1, day states 17.6; 17 state blocks); `mei_walk` **14.0** (0.2, 13.6; 20); `fo_mei` **7.8** (1.5, 6.2; 6); `bl_fireside` **8.4** (1.7, 6.6; 5); `bl_morning` **4.4** (0.1, 4.0; 3). v0.11.234: 7.8 / 1.3 / 3.1 for the first three. The growth is the day states (every text of each cycle).
- For the next runs: `village_night` 8.4, `talk_mei` 3.6, `talk_ya` 3.5, `bl_camp` 5.3 KB.

## 7. Re-checked: none moved
- **FC:** first Foundation 40 of 40 in prologue Coil 1: Careful and Sociable 16:00 (6) / 18:00 (4), Completionist 20:00 (4) / 21:00 (6), Cultivator 08:00 (10). `BT_CLOSER` 1.8 / 1.8 / 1.2 / 1.0. Coil starts at realm 0 after the first Foundation: long 27 / 27 / 2 / 0, old 3 / 8 / 1 / 4; **`g.seen.breakthrough` misses 0**.
- **LG, long:** cairn 40 visits, 0 away; climb 40, 0 without Ya's door; beetle 43 picks, 0 while Ya away; `BT_MEI` 0. **Old:** one Careful game climbs without the door, eats the beetle while Ya is away and shows `BT_MEI` (0.1 / 0 / 0 / 0).
- **SNr:** `ya_won` degree 1 only (0 / 0 / 1.0 / 0.9, both calendars); 2–3 **0**.
- **ST2 degree 3:** long degree 1 Completionist 4.5, Cultivator 1.7; degree 2 0.1 / 1.9; degree 3 **0**. Old: degree 1 only (0.4 / 0.3).
- **BYb-t:** Foundation screens long 45: `lore1` 15 / 15 / 10 / 0, Wen only 0 / 0 / 2 / 0, neither 3 / 3 / 0 / 10. Old: Wen only 1 / 2 / 0 / 0.
- **LF** (`loft_burned`): 0 of 80 games. **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).
