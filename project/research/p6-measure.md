# Push 6: raw numbers (2026-11-19, on the v0.11.232 working copy, not yet pushed)

Scratch copy `/tmp/p6w` (the working copy untouched, no `.git`). Its `tests/models.test.mjs` carries one measuring hook (`tests/lib/p6hook.mjs`, called after `againView`; the replay check's two games left out): scratch only, never to copy back.

## How
- `P6OUT=p6-run.json node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 1 min 17 s; 29 tests passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0 (the same as at v0.11.231: the same dice).
- The old calendar (for ST2 and SNr): the same without `--cal 7` (40 games, 18 passed). The `migrate` gap: Careful and Completionist again with a `g.seen` test (20 games, 16 passed).
- A screen counts once a visit (a new scene or a new text; the same screen after an action is not counted again). "Folded" = `againView` folds it. "New texts" = a screen carrying a passage added in v0.11.232 (74 snippets from `git diff`, each absent from HEAD's file).
- Hits = a regex on the text as drawn (the fold's first paragraph when folded) and on every result line in `g.log`.
- Figures are a game: Careful / Sociable / Completionist / Cultivator.

## 1. V3b after v0.11.232 (its effect)
| scene | shown | folded (v0.11.231) | read in full | new texts read |
|---|---|---|---|---|
| `bl_fireside` | 9.3 / 9.1 / 5.7 / 4.9 | 1.2 / 0.7 / 0.2 / 0 (4.5 / 4.4 / 2.0 / 1.2) | 8.1 / 8.4 / 5.5 / 4.9 | 3.3 / 3.7 / 1.8 / 1.2 |
| `supper_roof` | 18.3 / 18.3 / 6.7 / 13 | 12.6 / 12.6 / 1.7 / 7.7 (16.3 / 16.3 / 4.7 / 11) | 5.7 / 5.7 / 5 / 5.3 | 3.7 / 3.7 / 3 / 3.3 |
| `fo_mei` | 0 / 7 / 7 / 7 | 0 (0 / 4 / 4 / 4) | 0 / 7 / 7 / 7 | 0 / 4 / 4 / 4 |
| `fo_ya_time` | 0 / 5 / 5 / 5 | 0 (0 / 3 / 3 / 3) | 0 / 5 / 5 / 5 | 0 / 3 / 3 / 3 |
- **The four together:** folded 20.8 / 27.7 / 13.7 / 19.2 → **13.8 / 13.3 / 1.9 / 7.7** (p5's forecast 14 / 14 / 1 / 8). New texts read 7 / 14.4 / 11.8 / 11.5 (forecast 7 / 14 / 14 / 11). What is left is the roof's later nights (the long calendar's 4–9 roof nights, three texts: by design).

## 2. CW (seen a game)
- **Parts 1–3, the six lines:** hare 0 / 0 / 0 / 0 (still no bot roasts a hare); `boar_won` 0 / 0 / 1 / 1; `evening` 2.2 / 2.2 / 1 / 0.9; `supper_roof` 1 / 1 / 1 / 1; `supper` (new) 1 / 1 / 1 / 1; `mei_walk` (new) 1 / 1 / 1 / 0. **Total 5.2 / 5.2 / 5.0 / 3.9** (3.2 / 3.2 / 3.0 / 2.9 before). V3b's roof texts add two cooking mentions ("thanks the cooking pot", "Cook. Far too much"): 2 / 2 / 1.7 / 1.8.
- **Part 4 (six lines):** 5 / 6 / 4 / 4 (`fo_supper` 3 / 3 / 0 / 0, `fo_farewell` 1, `ya_talk` 1, `fo_mei` 0 / 1 / 1 / 1, `fo_mother` 0 / 0 / 1 / 1, the egg 0).
- **Part 5:** 8.9 / 8 / 11.7 / 10.7 (`DR_COOK` 6.9 / 6 / 9.7 / 8.7, `rr_scout` 1, `dw_after` 1, `mei_curious` 0). **Part 6:** 0.4 / 0.2 / 0.9 / 1.0. **Part 7:** 2.1 / 2 / 4.9 / 5.7 (`rt_camp` music 1.1 / 1 / 3.9 / 4.7, `rt_evening` 1, `rt_camp` supper 0). **Part 8:** 0 (no Long Forest in these games).
- **Past the cap of 6:** a line in one text of a sequence of three is read in full about once a game. Places read in full a game: `village_night` 4.5 / 4.5 / 4 / 6.7, `supper` 7.2 / 7.2 / 6 / 7.3, `mei_walk` 7 / 7 / 6.8 / 3.6; from p5: `camp` 6 / 6 / 4.1 / 3.9, `far_won` 0 / 0 / 4.6 / 3.6.

## 3. The evening's folded screens and the talks
| scene | shown | folded | read in full |
|---|---|---|---|
| `supper` | 58 / 58 / 24 / 22.1 | 50.8 / 50.8 / 18 / 14.8 | 7.2 / 7.2 / 6 / 7.3 |
| `mei_walk` | 37.4 / 37.4 / 14 / 4.5 | 30.4 / 30.4 / 7.2 / 0.9 | 7 / 7 / 6.8 / 3.6 |
| `village_night` | 58 / 58 / 24 / 20 | 53.5 / 53.5 / 20 / 13.3 | 4.5 / 4.5 / 4 / 6.7 |
| `evening` / `evening2` | 2.9 / 2.9 / 1.2 / 1 ; 2 / 2 / 0.6 / 0.5 | 1.5 / 1.5 / 0.2 / 0 ; 0.8 / 0.8 / 0 / 0 | |
| `talk_mei` | 1 / 15 / 12.3 / 12.6 | 0 / 8 / 5.3 / 5.6 | 1 / 7 / 7 / 7 |
| `talk_ya` | 1 / 15 / 12.2 / 12.5 | 0 / 7.9 / 5.2 / 5.5 | 1 / 7.1 / 7 / 7 |
- The evening scenes are sequences of three a story day (`seqText`); the folds are the long calendar's 20–58 village nights. By the rule of three, by design.
- The talks: beats 0–4 (one text each), then a cycle of three (`(n - 5) % 3`: the quiet walk and two settled texts). Mei Lin's settled block is about 458 words (about 150 a text, with `likesMei` branches and `AW.talk_mei` away versions); Ya's about 238 (about 80). **Both talks folded 0 / 15.9 / 10.5 / 11.1 a game.** Three more settled texts each (a cycle of six): about 450 + 150 (away versions) + 240 words, **about 850, 1 Fable run**; folds about 0 / 10 / 4.5 / 5.

## 4. FC, the first flight (re-checked)
- **The save's first Foundation:** 40 of 40 in prologue Coil 1. Careful and Sociable at Ashfall 16:00 / 18:00; Completionist at Ashfall 20:00 / 21:00; Cultivator in the wilds at 08:00 (Yuki alone). `BT_CLOSER` read 1.8 / 1.8 / 1.2 / 1.0 a game.
- **Hook:** `breakthrough`'s "Get up." router (`prologue.js` 1131), before the tiger (realm ≥ 2) and `ykAskNow` (a later Coil): at realm 1 they never meet in Coil 1, but a save whose first Foundation comes in a later Coil could need both (the scene then goes on to `yk_choice`).
- **Save:** one kept flag in `KEEP_FLAGS` (`coil.js` 29); `migrate` (`game.js` 1545–1549, a new fill in its chain). **The gap is closable:** `g.seen.breakthrough` is kept across every rewind (`coil.js` 193) and set from the first Foundation on. Coil starts after the save's first Foundation at realm 0: Careful 27, Completionist 2 (20 games); the old rule (realm ≥ 1 or the tiger seen) misses 29 of 29; adding `stats.flown` / `stats.keptTop` still misses 27; **`g.seen.breakthrough` misses 0.** (Build check: that the scene never shows on a failed attempt; `breakthrough()` returns `ok: false` only when it can't break through.)
- **Size:** about 300–350 words (the scene, 2 witness variants, Yuki's 3 forms), 1 Fable run.

## 5. The small items
- **SNr** (`ya_brawl`'s `win[2]`, `win[3]`, `one`; `stomp_act1.js` 72–91, 425 words, 1 tic): **seen 0 on both calendars.** Every won brawl is at degree 1 (0 / 0 / 1.0 / 0.9 a game); the posture (rewritten earlier) 1 / 1 / 1 / 1. (p5's "degree 2 seen 1.0 / 0.9" was the degree-1 win.)
- **ST2 degree 3** (the far wins' third texts): far wins at degree 3: **0 on both calendars**. Long calendar far wins: degree 1 Completionist 4.5, Cultivator 1.7; degree 2 Completionist 0.1, Cultivator 1.9 (on a 3rd+ far-win day 0.1 / 1.4, which degree 2's three texts since v0.11.231 cover); old calendar degree 1 only. Size: 2 texts, about 240 words, 2 form clauses each.
- **LG:** the cairn 40 visits, all with both women there; the climb to the pass 40, all after Ya's door; the fire-beetle 43 picks, all with Ya there (Ya +0 from it while away); `BT_MEI` 0 (Ashen Hills breakthroughs: 3, Cultivator: 2 with both away at 13:00, 1 at 18:00).
- **BYb-t:** Foundation screens 45: `lore1` 15 / 15 / 10 / 0, Old Wen's lesson only 0 / 0 / 2 / 0 (they get "no word at all"), neither 3 / 3 / 0 / 10. About 45 words.
