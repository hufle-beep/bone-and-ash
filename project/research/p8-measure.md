# Push 8: raw numbers (2026-11-20, on the v0.11.234 working copy, not yet pushed)

Scratch copy `/tmp/p8w` (the working copy untouched, no `.git`). Its `tests/models.test.mjs` carries one measuring hook (`tests/lib/p8hook.mjs`, called after `againView`; switched off before the replay check's two games), and its `tools/textlint.mjs` one dump line (`LINTDUMP`: every rendered text and every pool, the result lines included). Scratch only, never to copy back. The snippets: `/tmp/p8tools/snips.mjs` takes every sentence of 6+ words added in v0.11.232, v0.11.233 and v0.11.234 (each absent from the version before: `git show` of v0.11.231 / .232 / .233 against the working copy; comments left out): **241 sentences**.

## How
- `P8OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 1 min 39 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: **the same as at v0.11.231–233** (the same dice and paths). Run twice more (a snippet fix; the evening's day index): the same numbers each time.
- The old calendar: the same without `--cal 7` (40 games, 18 passed), for TL, FC, LG, SNr, ST2, BYb-t.
- The text lint: `LINTDUMP=… node tools/textlint.mjs` (0 changed against the snapshot), then each of the 241 sentences looked for in the dump.
- As p6/p7: a screen counts once a visit (a new scene or a new text). "Folded" = `againView` folds it. Hits = a regex on the text as drawn (the fold's first part when folded) and on every result line in `g.log`.
- Figures are a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old".

## 1. v0.11.234's effect
- **RN, the roof's later nights** (`s:supper_roof:2`, index % 6): shown 12.1 / 12.1 / 3.7 / 9.7; **folded 9.1 / 9.1 / 1.1 / 6.7 → 6.8 / 6.8 / 0.4 / 3.9** (forecast 6.1 / 6.1 / 0 / 3.7; the rest are the six coming round again, index 0–2 on a 7th–9th night). Read in full 3.0 / 3.0 / 2.6 / 3.0 → 5.3 / 5.3 / 3.3 / 5.8. **The three new texts read in full 2.3 / 2.3 / 0.7 / 2.8**; by index (shown, folded): 3: 2 (1.1) / 2 (1.1) / 0.4 (0) / 1.6 (0.6); 4: 1.4 (0.6) / 1.4 (0.6) / 0.2 (0) / 1.3 (0.4); 5: 0.6 (0) / 0.6 (0) / 0.1 (0) / 1.2 (0.3). The first week unchanged (folds 3.5 / 3.5 / 0.6 / 1.0). Whole roof folded 12.6 / 12.6 / 1.7 / 7.7 → **10.3 / 10.3 / 1.0 / 4.9**. All 26 new roof sentences and the 9 new `ROOF_STAY` sentences are read by every model in some game.
- **ML, the firesides' meal on a day he did not cook** (RR and AH texts 2–3, by the region's day index; "cooked" = `cookedToday` as drawn): meal screens 3.7 / 3.9 / 1.8 / 1.2; **no-cook 1.2 / 2.2 / 0.3 / 0.1** (RR 0.7 / 1.0 / 0 / 0, AH 0.5 / 1.2 / 0.3 / 0.1). (p7's 1.0 / 1.7 / 0.2 / 0.1 counted by a meal snippet; this counts by slot.) Every one drawn in its no-cook version. New no-cook sentences read: RR 2's close 2 / 2 / 0 / 0 of 2, RR 3 3 / 3 / 0 / 0 of 3, AH 2's opening 2 / 2 / 2 / 2 of 2; **`AH2_POT`'s no-cook clause 0** (it sits in AH 2's `none` branch, neither woman close: no bot).
- **TL, "back tomorrow" for an absent woman** ("Spar with Ya." while Ya is away, "Cinderberries with Mei Lin." while both are): **2.7 / 1.8 / 4.0 / 3.9 → 0** hub screens a game (forecast 0); old 5.5 / 2.3 / 4.9 / 4.8 → **0**. (The card as `tomorrow` with her there, as before: long 70 / 72 / 92 / 169 hub screens on 14–15 days.)

## 2. FC, the first flight (re-checked: unmoved)
- First Foundation 40 of 40 in prologue Coil 1: Careful and Sociable at Ashfall 16:00 (6) / 18:00 (4), Completionist 20:00 (4) / 21:00 (6), Cultivator in the wilds 08:00 (10). `BT_CLOSER` 1.8 / 1.8 / 1.2 / 1.0.
- Coil starts at realm 0 after the save's first Foundation: long 27 / 27 / 2 / 0 (56; p7 wrote 19 / 19, its total also 56), old 3 / 8 / 1 / 4; **`g.seen.breakthrough` misses 0**. Hook, kept flag and `migrate` as p6 §4.

## 3. TG, the text lint's samples
- **The lint reads 95 of the 241 new sentences.** Read: the talks' new texts 19 of 19; `village_night`'s CW 3 of 3; RR 18 of 22 (v0.11.232) and RR's no-cook 5 of 5; `fo_mei` 17 of 52; `fo_ya_time` 15 of 26; the roof's first week 18 of 35.
- **Not read (146):** every `FS_AH` part (21) with AH 2's no-cook opening (2) and `AH2_POT` (1): no sample sets `bl_region: 'ah'` on a later day; RR's cooked sentences (4: "He stirs it", "since you cooked it", "learned to cook"): the later-day samples are no-cook days; `fo_mei` days 9–10 (35) and `fo_ya_time` day 9 (11), with 2 labels; **the roof's later nights, all five texts (17 of v0.11.232, 26 of v0.11.234)** and **every `ROOF_STAY` line (13 + 9)**: no later-day sample has `vday` 2; `supper`'s and `mei_walk`'s CW lines (5).
- **`packet.mjs`**: its samples are the three forms on day 0 and a later day only: no Ya away, both away, Ashen Hills, `vday` or cook mark. A tool: 0 screens.

## 4. Re-checked: none moved
- **LG, long:** the cairn 40 visits, 0 away; the climb 40, 0 without Ya's door; the beetle 43 picks, 0 while Ya away; `BT_MEI` 0. **Old:** one Careful game in 10 climbs without the door, eats the beetle while Ya is away and shows `BT_MEI` (0.1 / 0 / 0 / 0 a game).
- **SNr:** `ya_won` degree 1 only (0 / 0 / 1.0 / 0.9, both calendars); degrees 2–3 **0**.
- **ST2 degree 3:** long degree 1 Completionist 4.5, Cultivator 1.7; degree 2 0.1 / 1.9; degree 3 **0**. Old: degree 1 only (0.4 / 0.3).
- **BYb-t:** Foundation screens long 45: `lore1` 15 / 15 / 10 / 0, Wen only 0 / 0 / 2 / 0, neither 3 / 3 / 0 / 10. Old: Wen only 1 / 2 / 0 / 0.
- **LF** (`loft_burned`): 0 of 80 games. **ME** (a menu at 19:00): the bots never open a menu: p7's 0 stands.

## 5. The talks and the evenings
- **The talks** (`talk_mei`, `talk_ya`; beats 0–4, then `(n − 5) % 6`; slot 0 is the quiet walk, beat 2's text again): both folded **0 / 9.9 / 4.5 / 5.1** (unchanged). Of it: **the quiet walk at beats 5 and 11: 0 / 3.9 / 4 / 4**; the old settled texts on the second cycle (beats 12–13): 0 / 4 / 0.5 / 1.1; the new texts a second time (14+): 0 / 2 / 0 / 0. A new text in slot 0 (beat 2 keeps the quiet walk) reads beat 5 in full: **folds −0 / −1.9 / −2 / −2**.
- **The evenings** (unchanged from p6): `supper` shown 58 / 58 / 24 / 22.1, folded 50.8 / 50.8 / 18 / 14.8; `mei_walk` 37.4 / 37.4 / 14 / 4.5, folded 30.4 / 30.4 / 7.2 / 0.9; `village_night` 58 / 58 / 24 / 20, folded 53.5 / 53.5 / 20 / 13.3. By sequence and day index: each key's index 3+ folds (memory folds of later Coils aside). **A cycle of six, forecast** (the folds at index 3–5 less the folds at index 0–2, the same circumstances): `supper:4` −4.2 / −4.2 / −3.0 / −2.2, `supper:5` −3.0 / −3.0 / −3.0 / −3.1, `mei_walk:5` −2.9 / −2.9 / −2.0 / 0, `mei_walk:6` −1.8 / −1.8 / −2.5 / −0.9, `village_night` −3.0 / −3.0 / −3.0 / −1.9. Sizes (lines in `ashfall.js`, branches included): `supper:4` about 1,400 words for its three, `supper:5` 550, `mei_walk:5` 660, `mei_walk:6` 460.
- **`bl_camp`** (not asked): shown 20.9 / 20.1 / 29.8 / 28.5, folded 13.6 / 12.9 / 20.8 / 20.3 (a one-text scene by region, redrawn after each action).

## 6. A no-cook evening that still says he cooked
- Every Blackroot screen and result line from 19:00 to 05:00 on a day without "Cook and eat.", searched for stew / cook / pot / stir / ladle: **0 that say he cooked.** Hits only in Yuki's thought in `dw_after` ("*And you will cook twice as much for them.*", a promise: long 0 / 0 / 0 / 0.7, old 0.2 / 0.9 / 0.9 / 1.0) and `dw_hollow`'s "the water round her stirs".
