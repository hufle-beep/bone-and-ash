# Push 7: raw numbers (2026-11-20, on the v0.11.233 working copy, not yet pushed)

Scratch copy `/tmp/p7w` (the working copy untouched, no `.git`). Its `tests/models.test.mjs` carries one measuring hook (`tests/lib/p7hook.mjs`, called after `againView`; switched off before the replay check's two games), and its `tools/textlint.mjs` one dump line (`LINTDUMP`: every rendered text, pool line and result line to a file). Scratch only, never to copy back.

## How
- `P7OUT=p7-run.json node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 1 min 34 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: **the same as at v0.11.231 and v0.11.232** (the same dice and the same paths: the new texts moved no bot).
- The old calendar: the same without `--cal 7` (40 games, 21 s; 18 passed; screens 2,018 / 2,758 / 2,819 / 2,813), for CWx's camp line, the hare, SNr, ST2, LG, BYb-t and FC. One more run, Careful and Cultivator on the long calendar, for the camp's nights.
- The text lint: `LINTDUMP=… node tools/textlint.mjs` (0 changed against the snapshot), then each new text looked for by a snippet.
- As p6: a screen counts once a visit (a new scene or a new text). "Folded" = `againView` folds it. "New texts" by snippet (the six talk texts, the two CW lines). Hits = a regex on the text as drawn (the fold's first part when folded) and on every result line in `g.log`.
- Figures are a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old".

## 1. TK after v0.11.233 (its effect)
| | shown | folded (v0.11.232) | read in full |
|---|---|---|---|
| `talk_mei` | 1 / 15 / 12.3 / 12.6 | 0 / 5 / 2.3 / 2.6 (0 / 8 / 5.3 / 5.6) | 1 / 10 / 10 / 10 |
| `talk_ya` | 1 / 15 / 12.2 / 12.5 | 0 / 4.9 / 2.2 / 2.5 (0 / 7.9 / 5.2 / 5.5) | 1 / 10.1 / 10 / 10 |
- **Both talks folded 0 / 15.9 / 10.5 / 11.1 → 0 / 9.9 / 4.5 / 5.1** (forecast 0 / 10 / 4.5 / 5). New texts read 0 / 6 / 6 / 6 (each of the six once; the Sociable sees the glasses and the coat a second time, folded). Mei Lin's bow, Ya-away version: shown 0 (the talks are never in the Ashen Hills by day).
- What still folds: the quiet walk (each talk 3 shown, 2 folded) and the two older settled texts on the Sociable's second cycle. Old calendar: the Sociable shows both talks 19 a game, folded 7.6; the others 0.5 / 2.4 / 2.0, folded 0.

## 2. CWx (seen a game)
- **`village_night`'s line:** 1 / 1 / 1 / 1.9 (in the text 17.4 / 17.4 / 7.2 / 6 times; folded to its first sentence the rest). Old calendar 0 (the quiet nights' sequence is the long calendar's).
- **The camp's line (Yuki, the second night with the fire lit): 0 on the long calendar.** The bots meet the camp only on forest night 1 (Careful 29 + 31 screens, Cultivator 14 + 25 in 10 games, all `forest_day` 1). **Old calendar 4.5 / 4.5 / 5.1 / 4.7 screens** (the camp never folds and redraws after each action, so one evening shows the line on several screens).
- **Parts 1–3, all eight lines, long calendar: 5.2 / 5.2 / 5.0 / 4.7 → 6.2 / 6.2 / 6.0 / 6.6** (forecast about 7 / 7 / 7 / 6). Hare 0; `boar_won` 0 / 0 / 1 / 1; `evening` 2.2 / 2.2 / 1 / 0.9; `supper_roof` 1; `supper` 1; `mei_walk` 1 / 1 / 1 / 0.8 (p6 had the Cultivator at 0; the line is on `mei_walk:6`'s third text since RV1 M5, the code unchanged since); `village_night` 1 / 1 / 1 / 1.9; camp 0. V3b's two roof cooking mentions 2 / 2 / 1.7 / 1.8 (as p6).
- **Old calendar, parts 1–3: 8.8 / 8.8 / 10.1 / 9.0** (camp 4.5 / 4.5 / 5.1 / 4.7; **the hare 1.3 / 1.3 / 1.4 / 0.7**; `evening` 1.8 / 1.8 / 1.9 / 1.7; `boar_won` 0.5 / 0.5 / 1 / 1; roof 0.7 / 0.7 / 0.7 / 0.9).

## 3. Re-checked (p6's numbers): none moved
- **FC:** first Foundation 40 of 40 in prologue Coil 1: Careful and Sociable 16:00 (6) / 18:00 (4), Completionist 20:00 / 21:00, Cultivator 08:00. `BT_CLOSER` 1.8 / 1.8 / 1.2 / 1.0. Coil starts at realm 0 after the save's first Foundation: long 19 / 19 / 2 / 0, old 3 / 8 / 1 / 4; `g.seen.breakthrough` misses 0 of 56. Hook, kept flag and `migrate` as p6 (§4).
- **SNr:** `ya_won` degree 1 only (0 / 0 / 1.0 / 0.9 on both calendars); degrees 2–3 **0**.
- **ST2 degree 3:** `far_won` long: degree 1 Completionist 4.5, Cultivator 1.7; degree 2 0.1 / 1.9; degree 3 **0**. Old: degree 1 only (0.4 / 0.3).
- **LG, long:** cairn 40 visits, 0 away; climb 40, 0 without Ya's door; beetle 43 picks, 0 while Ya away; `BT_MEI` 0. **Old calendar (new): one Careful game in 10** climbs without Ya's door, eats the beetle while Ya is away (Ya +3 while gone) and shows `BT_MEI` (0.1 a game; the other three 0).
- **BYb-t:** Foundation screens long 45: `lore1` 15 / 15 / 10 / 0, Wen only 0 / 0 / 2 / 0, neither 3 / 3 / 0 / 10. Old: Wen only 1 / 2 / 0 / 0.

## 4. The small leftovers
- **T L3, the roof's loft after the arson:** `loft_burned` in 0 of 80 games (no bot loses the arson): **0**. Lines with "loft" after it: the roof's 2:2, 2:3, the old later-night line, `village_night`'s three quiet texts (each form; the new CW text opens "The herb loft is dark").
- **T L6, the firesides' meal when nobody cooked:** meal texts drawn 3.1 / 2.9 / 1.5 / 1.0; **with no "Cook and eat" that day (`bl_cook`) 1.0 / 1.7 / 0.2 / 0.1** (Root Road 0.7 / 1.0 / 0 / 0, Ashen Hills 0.3 / 0.7 / 0.2 / 0.1). Old calendar 0 (one text a fireside there). Four places: AH 2 "your stew", AH 3 "since the stew", RR 2, RR 3.
- **C TG-C1, the lint's samples:** of 32 snippets of v0.11.232's new texts it reads **7** (`fo_mei` day 8 ×2, `fo_ya_time` day 10 ×2, the roof's first week ×2, RR 2); not: `fo_mei` days 9–10 (4), `fo_ya_time` day 9 (2), the roof's later nights (2), `ROOF_STAY` (4), every `FS_AH` part (11), both CW lines. **v0.11.233: the six talk texts 0 of 6** (only the bow's Ya-away version, through the `AW` pool); `village_night`'s CW all 3 forms; the camp's CW 0 of 3.
- **C L2, an old save mid-week:** 0 in fresh games. Once per old save and scene: `fo_mei`, `fo_ya_time`, the roof (no `s:` record: the old text once more, folded); the talks (an old save past beat 5 jumps from the cycle of three into six: e.g. beat 8 showed the quiet walk, now the glasses). Nothing breaks.
- **v0.11.231 C L4, "back tomorrow" while she is away:** a hub screen with "Spar with Ya." or "Cinderberries with Mei Lin." as `tomorrow`: long **2.7 / 1.8 / 4.0 / 3.9 screens, on 1.0 day a game, every model**; old 5.5 / 2.3 / 4.9 / 4.8 screens, 1.1 / 1 / 1 / 1 day.
- **C L3, a menu opened before 19:00:** 0 on both calendars (the bots work the away hub by task cards, never through a menu at the edge).
- **C L6, `packet.mjs` and the away state:** a tool: 0 screens.

## 5. The rest
- **The roof's later nights** (`supper_roof:2`, village days 2–3, three texts): shown 12.1 / 12.1 / 3.7 / 9.7, **folded 9.1 / 9.1 / 1.1 / 6.7**, in full 3.0 / 3.0 / 2.6 / 3.0. The first week folds 3.5 / 3.5 / 0.6 / 1.0. Three more texts (six, as TK): folds about **6.1 / 6.1 / 0 / 3.7**. The four `ROOF_NEW` texts are about 120 words each, the `ROOF_STAY` lines about 60: three texts, three lines and three labels, **about 550 words, 1 Fable run**; the line and labels' index `% 3` → `% 6`.
- **The hare's CW line:** long 0; **old 1.3 / 1.3 / 1.4 / 0.7** (seen: p6's 0 was the long calendar only).
- **CW in part 8:** 0 (no Long Forest screen in 80 games).
