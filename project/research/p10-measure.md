# Push 10: raw numbers (2026-11-20, on the v0.11.236 working copy, not yet pushed)

Scratch copy `/tmp/p10w` (the working copy untouched, no `.git`; checked identical to the working copy's `js/` and `tools/` after the coordinator's stash, `again.js` aside). Its `tests/models.test.mjs` carries one measuring hook (`tests/lib/p10hook.mjs`, called after `againView`; switched off before the replay check's two games), and `js/story/again.js`'s fold returns carry a `why` (mem / SV / SD / VF on a new visit / VFk, VF kept on a redraw). Scratch only, never to copy back. The p9 hook was gone with `/tmp/p9w`; this one is rebuilt to the same counting and reproduces p9's re-check numbers exactly (§7).

## How
- `P10OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 53 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: **the same as v0.11.231–235** (texts only changed; the same dice and paths). Run twice: the same numbers.
- The old calendar: the same without `--cal 7` (40 games, 7 s; 18 passed; screens 2,018 / 2,758 / 2,819 / 2,813). Run twice.
- One more Careful game (long) for the village week of each quiet night (`g.flags.vday`).
- Packets: `node tools/packet.mjs <id> --games 0`, bytes; blocks by `[text · …]` header; each new text grepped by its first words.
- As p6–p9: a screen counts once a visit (a new scene or a new text). "Folded" = `againView` folds it. Figures are a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old".

## 1. v0.11.236's effect
- **`bl_camp`:** shown 20.9 / 20.1 / 29.8 / 28.5 (unchanged); **folded 13.6 / 12.9 / 20.8 / 20.3 → 7.1 / 7.0 / 15.0 / 14.4 (−6.5 / −5.9 / −5.8 / −5.9; forecast −6.5 / −5.9 / −5.8 / −5.9: exact).**
- **Why now:** a new day with the same text (VF) **9.0 → 5.0** each (RR days 3–4, AH days 3–4, DW day 3: 1.0 each); redrawn after an action, VF kept **4.6 / 3.9 / 5.7 / 5.5 → 2.1 / 2.0 / 3.9 / 3.6**; back the same day (SD) **0 / 0 / 6.1 / 5.8** (unchanged).
- **The new texts read in full** (RR and AH days 1–2, arrivals): **4.0 / 4.0 / 4.0 / 4.0.** Their redraws after "Cook and eat." now show in full again (as p9 said they would).
- **The talks:** both talks folded 0 / 9.9 / 4.5 / 5.1 → **0 / 8.0 / 2.5 / 3.1 (−0 / −1.9 / −2.0 / −2.0; forecast the same).** Beat 5 (the new quiet walk) read in full 0 / 2 / 2 / 2 (both talks). Beat 11 (the same walk, 5 + 6k) folds VF: 0 / 2 / 2 / 2. Still folded: Sociable beats 11–14 (1.0 each a talk), Completionist and Cultivator beats 11–12 (beat 12: 0.3 / 0.2 and 0.6 / 0.5).
- Old calendar: camp shown 8.5 / 13 / 6.5 / 7.4, folded 1.7 / 6.1 / 0.3 / 1.2 (as p9: one night a region, two in the Drowned Wood; memory and SD only); talks beats 0–4 only.

## 2. CB5 now: what is left of the camp's folds
- By region and day index (shown / folded, Careful): RR 0–2 1.3 / 1.3 / 2.0, all 0 folded; RR 3 1.2 / 1.2, RR 4 1.3 / 1.3; AH 0–2 0; AH 3 1.1 / 1.1, AH 4 1.6 / 1.6; DW 0–2 0; DW 3 1.9 / 1.9.
- Nights 4–5 of RR and AH and the DW's 4th, folded (VF + VF kept): **7.1 / 7.0 / 8.9 / 8.6** (RR 3 1.2 / 1.3 / 1.9 / 1.7, RR 4 1.3 / 1.4 / 1.8 / 1.6, AH 3 1.1 / 1.4 / 1.9 / 2.0, AH 4 1.6 / 1.2 / 1.9 / 1.7, DW 3 1.9 / 1.7 / 1.4 / 1.6). SD on those days besides: 0 / 0 / 2.5 / 1.8.
- A text each for those five nights (RR 2, AH 2, DW 1; the texts now 33–50 words, so about 225 words, 1 Fable run): **−7.1 / −7.0 / −8.9 / −8.6**; then only SD folds (0 / 0 / 6.1 / 5.8). A fourth and fifth text for a non-social scene: **past the rule of three.** Within three: no fix found (every region already has three; the DW's fourth night is past three too).
- Its redraws after "Cook and eat." would then show in full (as days 1–2 now), unless HS2 below.

## 3. The camp's hammerspace line
- **Where the stock shows:** the status bar shows HP, Convergence, Fed and the clock only (`main.js` `statusHtml`); the stock is on the Hammerspace tab (one tap) and in `pantry(g)`, the camp text's paragraph 2. "Cook and eat." shows only while there is food.
- **Folded camp screens with the stock line in the folded part:** **7.1 / 7.0 / 15.0 / 14.4** a game (p9 13.6 / 12.9 / 20.8 / 20.3); old 1.7 / 6.1 / 0.3 / 1.2. **No other foldable scene** has it (the other `pantry` users are task hubs, never folded; `wilds`' inline one never folded in these games).
- **Camp redraws where only the stock line changed** (after "Cook and eat."): 6.9 / 6.1 / 9.7 / 8.7 a game; **shown in full 4.8 / 4.1 / 5.8 / 5.1** (p9 2.3 / 2.2 / 4.0 / 3.2; up by the new days' redraws), folded (VF kept) 2.1 / 2.0 / 3.9 / 3.6. Old: in full 2.8 / 2.9 / 2.2 / 2.2.
- Fixes (code only, no Fable): **HS1** a `STATE_PARA` paragraph stays out of the fold (drawn after the first paragraph), so a folded camp shows its stock; **HS2** SV compares the story paragraphs (`STATE_PARA` aside, as VF's key already does), so the stock-only redraw folds (needs HS1, or the new stock would hide in the fold).

## 4. EVn and the quiet nights' weeks
- `village_night:quiet`: 19 nights a Coil, index 0–18 = days 22–41 (day 35 the night with no step). **By village week (vday at night): week 1 index 0–6, week 2 index 7–12, week 3 index 13–18.**
- Folded **52.1 / 52.1 / 19.8 / 13.3** (p9 wrote 53.5 / 53.5 / 20 / 13.3; its own by-index figures sum to these). Careful and Sociable see each night 2.9 times (Coils 1–3): index 0–2 fold 1.9 (memory, later Coils), index 3–18 2.9 (VF 1.0 + memory 1.9). Completionist 1.2 / 0.2 / 1.2. Cultivator one Coil: VF 0.5–1.0 by index.
- **Index 6–18 folded 37.7 / 37.7 / 15.6 / 11.4,** of them VF (the first Coil) 13 / 13 / 13 / 11.4; the rest memory folds of later Coils, which new texts would not change.
- **EVn (a cycle of six, one key):** −3.0 / −3.0 / −3.0 / −1.9 (VF at index 3–5). Rule change (six for a non-social scene).
- **EVk (three a week: weeks 2 and 3 each their own sequence of three, as `supper:4` / `supper:5`; week 1 keeps the key):** VF at index 7–9 and 13–15: **−6.0 / −6.0 / −6.0 / −5.0** (Cultivator 2.9 + 2.1). 6 texts by form, about 720–900 words, 2 Fable runs (one a week; packet 8.4 KB, which already draws weeks 1–3). Within three by the per-story-day precedent (each sequence three; nine in the stay): the owner's reading.

## 5. The packets (PKf; v0.11.236 coverage)
- Sizes: `village_night` **8.4 KB** (9 text blocks, 3 states), `bl_camp` **6.0** (p9 5.3; 4 blocks), `talk_mei` **3.6**, `talk_ya` **3.5**; `supper` 22.8 (23 blocks, 17 states), `mei_walk` 14.0 (21, 20). The next runs' packets are 3.5–8.4 KB: PKf changes none of them.
- **Gap (PKs):** the `bl_camp` packet carries RR 3 of 3, AH 1 of 3 (its second), DW 0 of 3; the talk packets carry neither quiet walk (beats 5+). The text lint samples the talks' beats 5–10, so it reads the walks; whether it reads the AH and DW camps' later texts: not checked. A CB5 or talks run would need them in its packet. Tools only, 0 screens.

## 6. "Your world" (YW, v0.11.236)
Not re-measured (texts only; the paths unchanged).

## 7. Re-checked: none moved
- **FC:** first Foundation 40 of 40 in prologue Coil 1: Careful and Sociable 16:00 (6) / 18:00 (4), Completionist 20:00 (4) / 21:00 (6), Cultivator 08:00 (10). `BT_CLOSER` 1.8 / 1.8 / 1.2 / 1.0. Coil starts at realm 0 after the first Foundation: long 27 / 27 / 2 / 0, old 3 / 8 / 1 / 4; **`g.seen.breakthrough` misses 0**.
- **LG, long:** cairn 40 visits, 0 away; climb 40, 0 without Ya's door; beetle 43 picks, 0 while Ya away; `BT_MEI` 0. **Old:** one Careful game climbs without the door, eats the beetle while Ya is away and shows `BT_MEI` (0.1 / 0 / 0 / 0).
- **SNr:** `ya_won` degree 1 only (0 / 0 / 1.0 / 0.9, both calendars); 2–3 **0**.
- **ST2 degree 3:** long degree 1 Completionist 4.5, Cultivator 1.7; degree 2 0.1 / 1.9; degree 3 **0**. Old: degree 1 only (0.4 / 0.3).
- **BYb-t:** Foundation screens long: `lore1` 15 / 15 / 10 / 0, Wen only 0 / 0 / 2 / 0, neither 3 / 3 / 0 / 10. Old: `lore1` 12 / 16 / 11 / 14, Wen only 1 / 2 / 0 / 0, neither 0.
- **LF** (`loft_burned`): 0 of 80 games. **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).
