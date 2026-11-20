# Push 12: raw numbers (2026-11-20, on the v0.11.238 working copy, not yet pushed)

Scratch copy `/tmp/p12w` (the working copy untouched, no `.git`). The p11 hook was gone with `/tmp/p11w`; rebuilt to the same counting (`tests/lib/p12hook.mjs`, called after `againView`, switched off before the replay check's two games; `js/story/again.js`'s fold returns carry a `why`: mem / SV / SD / VF on a new visit / VFk, VF kept on a redraw). It reproduces p11's after-figures exactly on v0.11.237 (below). A second copy `/tmp/p12o` is `git archive HEAD` (v0.11.237) with the same hook. Scratch only, never to copy back.

## How
- `P12OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 70 s beside the full check; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: **the same as v0.11.231–237.** Run three times on `/tmp/p12w` (the hook's text heads, then fold days, added; the totals the same each time).
- The old calendar: the same without `--cal 7` (18 passed; screens 2,018 / 2,758 / 2,819 / 2,813).
- Both calendars again on `/tmp/p12o`. **Path check** (a hash of every text screen: scene, minute, Coil, per game): **the same in 80 of 80 games.**
- A screen counts once a visit (a new scene or a new text). Figures a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old". "Day" below is the game day (from 05:00).
- Packets: `node tools/packet.mjs <id> --games 0`, bytes. RC: read `tools/packet.mjs` (`corpus`, `checkDrafts`, `SAMPLES`) and `tools/textlint.mjs`.

## 1. v0.11.238's effect
- **All folded screens:** 244.1 / 251.5 / 106.8 / 84.1 → **236.1 / 243.5 / 98.8 / 76.7 (−8.0 / −8.0 / −8.0 / −7.4; forecast −8.0 / −8.0 / −8.0 / −6.9).**
- **`bl_camp`:** folded 11.9 / 11.1 / 20.8 / 19.5 → **6.9 / 6.1 / 15.8 / 14.5 (−5.0 each; forecast −5.0 each: exact).** VF 5.0 each → **0**. Left: SV 6.9 / 6.1 / 9.7 / 8.7 (stock-only redraws) and SD 0 / 0 / 6.1 / 5.8 (back the same day), as designed. By night (RR 0–4, AH 0–4, DW 0–3) every night's first visit now reads in full; RR 3–4, AH 3–4, DW 3 lost their VF 1.0 each. Folded screens with their stock shown: 69 / 61 / 158 / 145 of the same (all).
- **`village_night`:** folded 47.5 / 47.5 / 14.0 / 7.0 → **44.5 / 44.5 / 11.0 / 4.6 (−3.0 / −3.0 / −3.0 / −2.4; forecast −1.9 for the Cultivator).** Index 3–5 (week 1) now read in full: 1.0 each, Cultivator 0.5 / 0.7 / 0.7 freed. **Why the Cultivator beat the forecast (−0.5 more):** index 6 (the seventh night, `QUIET_OLD[0]` again) folds 1.0 / 1.0 / 1.0 / **0.5**: her form changes during week 1, so night 7 reads in a different form from night 1. VF left: index 6 (1.0 / 1.0 / 1.0 / 0.5), 10–12 (3.0 / 3.0 / 3.0 / 2.5), 16–18 (3.0 / 3.0 / 3.0 / 1.6) = **7.0 / 7.0 / 7.0 / 4.6**. Memory (later Coils) 37.5 / 37.5 / 4.0 / 0, unchanged.
- **The plan's stops a game:** read **43 / 43 / 34 / 34**, evening 218 / 218 / 109 / 83, before and after: **moved 0.**

## 2. EVn-23 (weeks 2 and 3 a cycle of six each)
- Unchanged: index 10–12 fold 3.0 / 3.0 / 3.0 / 2.5, index 16–18 3.0 / 3.0 / 3.0 / 1.6: **−6.0 / −6.0 / −6.0 / −4.1** with six each. 6 texts by form, about 720–900 words, 2 runs. Packets `village_night --week 2` 12.2 KB, `--week 3` 12.2 KB.

## 3. TL2 / TL4 (the talks' later beats)
- Unchanged: beats 0–10 read in full; beat 11 folds 0 / 1 / 1 / 1 each talk, beat 12 0 / 1 / 0.3 / 0.6 (Mei Lin), 0 / 1 / 0.2 / 0.5 (Ya), beats 13–14 0 / 1 / 0 / 0 each. **Both talks folded 0 / 8.0 / 2.5 / 3.1**, all VF. TL2 −0 / −4.0 / −2.5 / −3.1; TL4 −0 / −8.0 / −2.5 / −3.1. Packets now `talk_mei` 7.2 KB, `talk_ya` 7.7.

## 4. What folds most now (not by memory)
Folds by kind, all scenes: memory 184.4 / 184.4 / 24.0 / 0 (earlier Coils, by design); **VF 43.0 / 51.6 / 55.6 / 57.6**; SV 6.9 / 6.1 / 9.7 / 8.7 (all the camp); SD 1.8 / 1.4 / 9.5 / 10.4. VF by scene:
- **`fo_supper`** (Fallout, Mei Lin's house; story day 8 days 43–49, 7 suppers; story day 9 days 50–62, 13 suppers; three texts each): **14.0 each** (day 8: days 46–49, 4; day 9: days 53–62, 10). Texts about 130–170 words, day 9's with a Ya-away line. Packet 6.8 KB.
- **`night`** (the forest, 21 nights, days 0–20; nine texts, V3a): **10.0 / 10.0 / 10.0 / 10.2** (days 11–20; days 9–10 read in full: the fire changes the text). 12 texts: days 9–11 new, days 12–13 differ by fire, 14–20 fold: **−3.0**; 15 texts: **−6.0**. Texts about 150 words with fire and form clauses. Packet 5.5 KB.
- **`supper`** (six a story day: `supper:4` week 1, 7 nights; `supper:5` weeks 2 and 3 together, 13 nights): **8.4 / 8.4 / 8.0 / 7.5** (+ SD 0 / 0 / 0 / 1.9): day 27 (week 1's seventh) 1.4 / 1.4 / 1.0 / 0.5; days 34–40 (week 3) 7.0 / 7.0 / 7.0 / about 6.5. Week 3 its own six: days 34–39 read, day 40 folds: **−6.0 / −6.0 / −6.0 / about −5.5**. `SUPPER_NEW`'s six texts about 800 words. Packet 22.8 KB.
- `village_night` 7.0 / 7.0 / 7.0 / 4.6 (§2); talks 0 / 8.0 / 2.5 / 3.1 (§3).
- **The Blackroot's hunts** (lead-ins to fights): `dw_hunt` one text, **1.0 / 1.9 / 2.0 / 2.0** (days 71–72; about 90 words); `rr_hunt` two texts, 0 / 0 / 2.0 / 2.0 (days 68–69; a third: −0 / −0 / −1.0 / −1.0); `ah_hunt` two texts with Ya-away versions, 0 / 0 / 2.4 / 2.1. Wins: `ah_hawks_won` 0 / 0 / 1.2 / 1.3, `rr_elk_won` 0 / 0 / 1.2 / 0.8, `dw_serpent_won` 0 / 0 / 1.0 / 0.9, `far_hunt` 0 / 0 / 0.8 / 0.6, `far_won` 0 / 0 / 0.6 / 0.2.
- Smaller: `bl_fireside` 1.0 / 0.7 / 0.2 / 0; `morning` 0.9 / 0.9 / 0.8 / 0.8; `mei_walk` 0.6 / 0.6 / 0 / 0; `supper_roof` 0.1 / 0.1 / 0.3 / 4.9; `herb_slopes` 0 / 0 / 1.0 / 1.0.
- Old calendar: VF 0; memory 42.7 / 79.1 / 53.7 / 39.6 (`bl_camp` 4.5 / 9.0 / 2.5 / 3.4 of it with SV), unchanged by v0.11.238.

## 5. LF, the burned loft
- **`loft_burned` in 0 of 80 games** (both calendars); `arson_start`, `arson_lost` shown 0. Arson-night visits long 29 / 29 / 12 / 10, old 25 / 25 / 28 / 24.
- Texts that name the loft as standing after a burn (grep; handled only: `house_time` `-burned`, `fo_mei` day 8): week 3's `village_morning` "still smoking" on every morning; `ROOF_NEW[2]` and `ROOF_STAY[2]` (the sprigs, the ginseng); two week-3 quiet nights (the ladder) and the place line "the herb loft" every quiet night; the Fallout back at Mei Lin's: `fo_night` (place line, "Go up to the loft early", the ladder, the loft window), `fo_supper` day 9 (Ya: "sleeping in the loft"), the Fallout night variants (the ladder, the loft window, "Nothing stirs in the loft"), `fo_mei_night` ("The Herb Loft", the loft window), `fo_ya_night` (the loft ladder), Ya's lines at the loft window and below the ladder (`act1_fallout.js` 66–144); the Return: `rt_mei_night` ("The Loft", "The herb loft. Mint and hay"), the trio night ("the ladder to the loft"); `yuki_path`: her Fallout lead-ins (the loft window), Mei Lin up the ladder, `yk_night_all`, the epilogue's "sleep in the herb loft", "follow Mei Lin up to the loft"; `music_texts` "In the herb loft".

## 6. RC, the draft check's runs (`tools/packet.mjs`)
- **CR1 "Mei Lin has hung the"** (`BL_DW_CAMP`'s old text and the draft `bl_camp:ah:4`): `checkDrafts` skips a run whose first scene is the draft's own (`at !== sid`), and the drafts-against-drafts pass skips two drafts of one scene; a run shared inside one scene is never reported. `runAt` also keeps only the first scene a run is in, so a run in the draft's scene and another scene can hide the other.
- **CR2 "was white when it got here"** (`morning`, wilds.js 207): that text shows only on the long calendar with `forest_day` 2; `corpus()` renders each scene on `SAMPLES` (six states: old calendar, fresh flags, first or later day), so it never renders.
- **CR3 "the size of your fist"** (`yuki_path` `YK_FIRE_TEXT`, `stomp_prologue` lizard's win): the fire text needs Yuki's fire state, and the stomp texts are not scene texts (`corpus()` reads only `SCENES` texts and labels).
- **A fix (tools only):** (a) report a run shared inside the draft's own scene as its own kind (`scene`), against every text but the one the draft replaces, and drafts of one scene against each other; keep every scene a run is in; (b) build the corpus from the text lint's renders (its long-calendar and story states, the stomp lists, Yuki's path, the day replies: what found CR1–CR3), shared through `tools/lib`. 0 screens; tests for each miss.

## 7. Re-checked: none moved
- **The path check (80 of 80 games, both calendars, the same screens at the same minutes as v0.11.237, which p11 found the same as v0.11.236) holds FC, LG, BYb-t** at p10's figures.
- **SNr:** `ya_won` degree 1 only, 0 / 0 / 1.0 / 0.9 (both calendars); 2–3 **0**.
- **ST2 degree 3:** long `far_won` degree 1 Completionist 4.5, Cultivator 1.7; degree 2 0.1 / 1.9; degree 3 **0**. Old degree 1 only 0.4 / 0.3.
- **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).
