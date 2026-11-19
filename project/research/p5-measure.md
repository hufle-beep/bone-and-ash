# Push 5: raw numbers (2026-11-19, on the v0.11.231 working copy)

Scratch copy `/tmp/p5w` (the working copy untouched). Its `tests/models.test.mjs`, `js/core/tasks.js` (`runTask`), `js/core/story.js` (`choose`) and the fire-beetle card in `act1_blackroot.js` carry measuring hooks: scratch only, never to copy back.

## How
- `P5OUT=p5-run.json node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 2 min 18 s). All 29 tests passed. The models' own "repeated in full" line: 0 of 4,816 / 5,220 / 4,901 / 4,632 screens.
- A screen counts once per visit: consecutive identical screens are counted once. "Folded" = `againView` folds it (an earlier read, the same day, or a later day: FP2, SD, VF). Every fold of the visit counts, so these numbers run higher than the older counts (supper 50.8 here against 37.2 at v0.11.230).
- Text hits = a regex on the text as drawn (the fold's first part when folded) and on every result line (`runTask`, `choose`).
- Per-slot visits: `P5DUMP=<scenes>` on Sociable, Completionist and Cultivator, 3 games each (`p5-dump.txt`).
- Careful and the Sociable play the same dice, so their prologue numbers are the same.

## 1. V3b, the six scenes (a game: Careful / Sociable / Completionist / Cultivator)
| scene | shown | folded | full repeats |
|---|---|---|---|
| `bl_morning` | 14 / 14 / 14 / 14 | 0 / 0 / 0 / 0 | 0 |
| `bl_fireside` | 9.3 / 9.1 / 5.7 / 4.9 | 4.5 / 4.4 / 2.0 / 1.2 | 0 |
| `supper_roof` | 18.3 / 18.3 / 6.7 / 13.0 | 16.3 / 16.3 / 4.7 / 11.0 | 0 |
| `fo_mei` | 0 / 7 / 7 / 7 | 0 / 4 / 4 / 4 | 0 |
| `fo_ya_time` | 0 / 5 / 5 / 5 | 0 / 3 / 3 / 3 | 0 |
| `village_night` | 58 / 58 / 24 / 20 | 53.5 / 53.5 / 20 / 13.3 | 0 |

- **`bl_morning` is done:** 14 different mornings in 14 visits (v0.11.224 DN12 and RV1 MP2: three a story day).
- **`village_night` is done:** the quiet night has three texts, read in turn (v0.11.230 FT); what folds is the long calendar's 20–58 nights. The arson night is once.
- **Still one or two texts a slot (9 slots), visits a game in the sample:**
  - `bl_fireside` Root Road 1 text, 1.7–2.3 visits; Ashen Hills ("A blue fire") 1 text, 1.3–3.7 visits. The Drowned Wood has its own text each night (0 folds).
  - `supper_roof` day 1: 1 text, 1.7–5.3 visits; later: 1 text, 4–9.3 visits.
  - `fo_mei` story day 8: 1 text, 3 visits; day 9: 1 text, 2 visits; day 10: 1 text, 2 visits.
  - `fo_ya_time` day 9: 1 text, 3 visits; day 10: 1 text, 2 visits.
- **To three a slot:** 14 new texts: fireside 3, roof 4, `fo_mei` 4, `fo_ya_time` 3. Sizes from the current texts (characters ÷ 5.7): fireside 67 and 149 words, roof 111 and 123, `fo_mei` 129 / 115 / 111, `fo_ya_time` 81 / 98. **About 1,500 words.** `bl_fireside` has 5 `byForm` clauses; the other three have none.
- **Folded a game, the four scenes:** now 20.8 / 27.7 / 13.7 / 19.2. New texts read a game: 7 / 14 / 13.7 / 11 (Careful takes no doors, so it never sees `fo_mei` or `fo_ya_time`). After that, about **14 / 14 / 1 / 8**. Nearly all of what is left is the roof's later nights (the long calendar's 4–9 roof nights; with three texts a slot that is by design).
- The older V3b figures ("20 texts → 60, about 3,700 words", v0.11.223) are out of date: two of the six scenes have been done since.

## 2. CW, parts 1–3 (seen a game)
- **The four lines now:** hare "Mine first" 0 / 0 / 0 / 0 (no bot roasted a hare); `boar_won` 0 / 0 / 1.0 / 1.0; `evening` third supper 2.2 / 2.2 / 1.0 / 0.9; `supper_roof` 1 / 1 / 1 / 1. **Total 3.2 / 3.2 / 3.0 / 2.9.**
- **Part 4 for comparison (its six lines):** 5 / 6 / 4 / 4 a game (`fo_supper` 3 / 3 / 0 / 0, `fo_farewell` 1 each, `ya_talk` 1 each, `fo_mei` 0 / 1 / 1 / 1, `fo_mother` 0 / 0 / 1 / 1, the clinic egg 0). Parts 5–9 not measured.
- **Where more could go, act 0 (shown a game, full reads in brackets):** `supper` 58 (7.2) / 58 (7.2) / 24 (6) / 22 (7.3); `mei_walk` 37 (7) / 37 (7) / 14 (6.8) / 4.5 (3.6); `village_night` 58 (4.5) / 58 / 24 (4) / 20 (6.7); `camp` 6 / 6 / 4.1 / 3.9 (all full); `far_won` 0 / 0 / 4.6 (3) / 3.6 (3.4); `wen_lesson` 0 / 0 / 2.4 / 2.0; `herb_slopes` 0 / 0 / 2.4 (1) / 2.0 (1); `heal` 0 / 0 / 1.2 / 1.0; `evening` 2.9 / 2.9 / 1.2 / 1.0; `evening2` 2 / 2 / 0.6 / 0.5; `tribute_dawn_sleep` 1.8 / 1.8 / 0.7 / 0.5; `drill`, `workshop` 0.
- A line in one text of a sequence of three is read in full about once a game. Part 9 run C's cap for parts 1–3 is 6 lines, so 2 are left under it.

## 3. FC, the first flight
- **The save's first Foundation:** 40 of 40 games in prologue Coil 1. Careful, Sociable and Completionist at Ashfall (`bt_return` 'ashfall', 16:00–21:00, the village sees it); the Cultivator in the wilds (08:00, Yuki alone). "The ground, it seems, has let go of you." (`BT_CLOSER`) is now read 1.8 / 1.8 / 1.2 / 1.0 times a game (every Foundation, every Coil).
- **Met:** once a save, by every player who reaches Foundation.
- **Save:** one new kept flag in `KEEP_FLAGS` (`coil.js` 29), a save addition; no id changes. Old saves: `migrate` (`game.js` 1545) can set it where the save shows an earlier Foundation (realm ≥ 1 now, or `yuki_tiger_seen`). There is no stat for the highest realm reached, so a save that reached Foundation only in a past Coil, and has not seen the tiger, would see the scene once.
- **Size:** one scene of about 200 words, plus 2 witness variants (the village at Ashfall; the wilds, Yuki alone) of about 60 words each, and Yuki's 3 forms. About 300–350 words, part of 1 Fable run. Hook: `breakthrough`'s "Get up." router (`prologue.js` 1131), like `yuki_tiger_awaken`.

## 4. The leftovers of v0.11.231 (40 games)
- The cairn (`ah_scout`) while someone is away: 0 (40 visits, all with both women there).
- The climb to the pass with Ya's door never taken: 0 (40 climbs, all after the door).
- The fire-beetle while Ya is away: 0 of 43 picks; Ya +0 from it.
- `BT_MEI` night or day: 0. No Foundation at the Ashen Hills while Ya was away.
- BYb-t (Foundation with Old Wen's lesson but not the `lore` scene): 2 of 40 (Completionist 2). Careful and Sociable 2 met Mei Lin without either: they get the "no word" text, which is right. Cultivator 10: no knowledge at all.
- ST2 degree 3: not measured again; v0.11.230 measured 0 on both calendars.
- SNr (`ya_brawl`'s older stomp texts): degree 2 seen 0 / 0 / 1.0 / 0.9 a game, degree 3 and the one-pass text 0. About 425 words, 1 tic.
