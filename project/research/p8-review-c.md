# Cold review C (code), v0.11.235 (P8-A + D1)

Opus, not seen the build. Read: the diff, `lines.js` `seqText`/`byDay`/`dayIndex`, `again.js` `laterDayAgain`, `calendar.js` `tributeLeft`, `act1_blackroot.js` `awayNow`/`cookedToday`, the packet. Ran in scratch copies (`/tmp/rv-c`, `/tmp/rv-c-old` at HEAD): Claude's two fault files, my two, the packet's `STATES` probed, `tools/textlint.mjs` timed old against new. Not run: `check.sh`.

## The game logic: no high or medium finding
- **The four lists:** `supper:4` (week 1, 7 suppers: indices 0–5, then 0, which VF folds), `supper:5` (weeks 2–3: 7 + 6 suppers, week 3's last night is `evening`: 0–5, 0–5, 0), `mei_walk:5` (week 2: 0–5, 0), `mei_walk:6` (week 3, nights 0–5: exactly one cycle). `byDay`'s `% list.length` takes the new length; nothing hard-codes 3 for these keys.
- **The eve:** `tributeLeft` on week 3 is `7 − cal_night`, so `<= 1` only on night 6; the eve's branch runs before `seqText`, so the eve notes no day and the cycle is the six nights before it. Correct.
- **Old saves:** the record holds days, not indices, so a save with 4–6 days under `s:supper:4/5` or `s:mei_walk:5/6` now reads `list[d % 6]` (a new text) where it read `list[d % 3]` (an old one, folded). No crash; at most one same-day redraw after the update shows another text than before it. No other reader of these keys: `DR_DISHES` is `r:supper:2` (its own 2-text cycle), the roof's `ri` reads `s:supper_roof:*`, `foSeq`'s `% 3` is the Fallout's own keys, VF keys by text hash, `week.js` only lists the scenes as night scenes, the models test and measure tools do not read them.
- **The old calendar:** `supper:5` and `mei_walk:5/6` each show on one text day there (supper not on vday 3; the walk on vday 1 reads `mei_walk:6`, vday 3 is the eve), so always `list[0]`. My RC2 (old calendar reads a new text) is caught.
- **Order of definition:** `SUPPER_NEW`/`WALK_NEW` are module consts above the scenes and only read inside `text` functions. Fine.
- **`byForm`:** three branches each, keyed on `yukiForm`; RC5 (the tiger gets the shoulder sentence) caught. Task mode: `supper` and `mei_walk` are story screens with choices (`NIGHT_SCENES`), their text is drawn.

## Medium (tools)
**M1. The packet's "away" states are not away.** `STATES` puts the Ashen Hills at 70 × 1440 + 20:00. `ahDay` reads away only 06:00–18:59 (`!late(g)`), so `awayNow` is `null` on all four (probed: `Ya away` null, `both away` null; the same states at 10:00 give `ya` and `both`). Failure: `node tools/packet.mjs bl_morning` prints one block tagged "the Ashen Hills, Ya away …; both there …; both away" over the both-there text: a reviewer or Fable reads that the camp morning has no away version, when `awayMorning` gives it one. The fireside (evening) is unaffected only because the evening counts as back. Fix: the away states by day (10:00), or a day and an evening pair. Test: TG-C2.

**M2. The packet draws 2 of 6 texts of each cycle, and none by form.** The village states use `k` = 0 and 3 only, and `stateOf` is the cat form. Measured on `/tmp/p8/review-packet.txt`: 4 of the 12 new texts appear (chopsticks, potter's hen, collectors, dullest thing); the cooper's wife, the glasses, the wrong tone, the persimmons, the soot, the boundary stones, the scarecrow and the pear tree are not there, and so neither Yuki sentence nor its three forms. The tools test passes with any one of three walk openers (`/…collectors|nine boundary|Out by the barley/`). Fix: `k` over 0–5 (merged by text the cost is the texts themselves), and the forms on the text the state changes. Test: TG-C3.

## Low
- **L1. States drawn on scenes they never reach.** Every state renders every scene: `supper` gets a block for story days 9–10 and the Ashen Hills (1,283 bytes; `vday` falls back to 1), `fo_mei` gets three village-week blocks (1,456 bytes), `mei_walk` is tagged "village week 1" though the card needs `vday >= 2` on the long calendar. Packet sizes old → new: `supper` 7,803 → 12,208, `mei_walk` 1,270 → 3,523, `fo_mei` 3,129 → 7,845 bytes. Fix: a state applies to a scene only where the scene shows (its area, or the C2 days).
- **L2. Text lint cost:** 60 new samples; `tools/textlint.mjs` 2.8 s → 3.4 s (+23%), output 0 changed against the snapshot. Acceptable. The vday-1 samples also render `mei_walk:6` (unreachable in week 1 on the long calendar): harmless duplicates.
- **L3. Brief nit:** variant words read 114,323 (the baseline file and the lint), not 114,324.
- **L4. The new test's fold check is empty:** `sentencesOf(first paragraph).length >= 1` holds for any text; "the first sentence stands alone" is not tested. RC3 (the collectors text opening on "She") was caught only by the order test's opening words.

## Test gaps
- **TG-C1 (F11, RT2 missed):** the packet test checks state names in the merged tags, never that a state changes the text. With the cook mark never set (F11) or the Root Road's cooked state not cooked (RT2), "he cooked" is still a name in a merged tag. Assert that "he cooked" and "he did not cook" head different blocks, and a cooked-only phrase (`which has never been so clean`) is in the cooked block.
- **TG-C2 (RT3 missed; M1):** a state's flags dropped passes, and the away states are inert now. Assert `awayNow(st.g)` is `ya` / `both` for those states (or an away-only phrase from `AW.morning` in `packet(['bl_morning'])`).
- **TG-C3 (M2):** assert every one of a list's six openers is in `packet(['supper'])` / `packet(['mei_walk'])`, and the three forms of each Yuki sentence.
- **TG-C4 (RT4 missed):** no merge (one block per state) passes. Assert a text appears once per packet and a merged tag holds two or more names (e.g. week 2 and week 3 share `supper:5`).
- **TG-C5 (L4):** a fold test on the real fold: render a new text on a later round (`supper:5` day 13, or two Coil days with the same index) and assert `againView(...).first` is a whole sentence that names its subject.
- **TG-C6:** no test walks weeks 2 → 3 of the walk in one game (each run starts fresh in its week). RC1 (week 3 sharing week 2's key) was caught only by the older CW test's faked record; a one-game walk across both weeks pins it on the real path.

## Planted faults
Claude's, story (`p8-faults.json`, `--games 2 --workers 1`): **10 of 10 caught** (F1–F10).
Claude's, tools (`p8-faults-tools.json`, `node tests/tools.test.mjs`): **2 of 3 caught**; **F11 missed** (the cook mark never set: TG-C1).
Mine, story (`p8-faults-review-c.json`): **6 of 6 caught** (RC1 week 3 on week 2's key, RC2 old calendar, RC3 pronoun opener, RC4 "Yesterday", RC5 tiger's sentence, RC6 week 2 on week 1's list); RC3 and RC4 only by the order test's opening words.
Mine, tools (`p8-faults-review-c-tools.json`): **1 of 4 caught** (RT1 the lint's village samples without the day index); **missed RT2** (Root Road cooked → not), **RT3** (both-away flags dropped), **RT4** (no merge by text).
Total: 19 of 23 caught; the 4 missed are all in the packet's `STATES` test.

## New kind of fault for the checklist (code part)
- **A sample state that names a presence or a time (v0.11.235 C M1):** check it with the game's own rule (`awayNow`, `cookedToday`, the card's hours) at the state's clock, not by its flags; a state merged by text hides an inert one, so test that it changes a text.
