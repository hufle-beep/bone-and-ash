# P16-A cold review C (code, tools, tests), v0.11.246

Read: the diff, both briefs, both checklists, the packets (grep). Scratch copies `/tmp/rv-c` (a git tree), `/tmp/rvc-head` (HEAD's `js/`). Runs: `node tests/story.test.mjs --games 2 --workers 1` on the build (192092 passed, 0 failed); `tools/mutate.mjs` on F1–F12 and on mine (C1–C8), `--jobs 1`; the text lint (log-only); probes in `/tmp/rvc-probe/`.

**Totals: H 0, M 2, L 4.**

## M
**M1. LG: with both women away, the cairn is gone for the whole stay.** `bothAway` has no day gate: it holds 06:00–18:59 on every Ashen Hills day until the spring door (`trio_kiss`) is taken. From 19:00 `!late` hides the cairn too. Measured on the long calendar (both romances, trio 2), the hours the cairn shows on each of the six stay days: only 04:00–05:59 (`....##..................` every day). Failure: a player who leaves "Find Mei Lin and Ya" untapped never sees the Founder's cairn or its scan (`ah_cairn`, `founder_cairn`) this Coil. That is 6 days on the long calendar and 2 on the old one. Before, it was open, though with the known text issue ("both away: open, options later"). The 04:00 window is a side effect: Mei Lin reads the cairn before dawn. Fix: decide whether the cairn waits for the spring, or shows from 19:00 when they are back, then pin the decision.

**M2. The review packet, and partly the lint, miss new texts (checklist v0.11.236 C M1).** These 12 new texts are not in `/tmp/p16/review-packet.txt`:
- `FF.open` and `FF.close` for village, party and mei (6; only alone's open and close are there)
- both kept dawns, KA (b) (2)
- `recogniseWen`, BYb-t (1)
- the CF line `BT_LATE.P.A` (1)
- `AW.hunt[2]`, "A cinder hawk's shadow" (1)
- `AW.hawks_won[2]`, "The hawks come for Yuki" (1)

The text reviewer can judge these only from the diff. `packet.mjs` `STATES` added only the second stay and twenty-one nights. The lint corpus (`lintCorpus`) also lacks FF village and mei, open and close (4 texts): no tic or reused-run guard on them from now on (checklist v0.11.181 TG4). Fix: packet states and lint samples for `first_flight` by `bt_return` (village, fo_ashfall, heart_hub, rr_hub, ah_hub with Ya away), the kept dawns, Wen, `BT_LATE` P at realm 2, and the third-day away versions.

## L
**L1. The `show.away` marks on the cairn and the climb do nothing.** `tasks.js` reads `away` only for menu cards with a `dailyKey` (lines 237–238). Both of these are hub choices (the cairn a task door), hidden by `choiceOpen`. The test pins the mark (`cairn.show.away === BR.bothAway`), not a behaviour. Harmless; drop the marks or call them notes.

**L2. The second stay's switch is keyed on the calendar day (`storyDay`), not the Blackroot's own day (`bday`) or `textStoryDay`.** Checklist v0.11.241 C M1. Measured: on the morning after story day 14's last night, at 04:30 with no camp (bl_day 4, the hub still "Black ridges…"), Hunt is open (04:00 is not `late`) and reads `AH15[0]`. That notes `s:ah_hunt:15` under story day 14's text day, so the real first morning of story day 15 opens on `AH15[1]`. Rare (he has to stay up all night). `bday(g) >= 5` matches the hub's own text.

**L3. The first flight adds 10 minutes.** Measured on the real path at the stream: "Get up." → first_flight +10, "Back to earth" → hub +10 (was +10 in all). This is the talk default, as with `yuki_tiger_awaken`. `med_back` survives to the hub; the hub's `enter` is skipped. Fine; noted for a breakthrough at 18:50.

**L4. A test leftover.** `tests/story.test.mjs:4134` runs `DAYW`/`NIGHTW` on `P.BT_MEI.night`, which is now `undefined`: the assertion passes vacuously for `BT_MEI`.

## Checked, no finding
- **Lists and keys:** `byDay` keys (dw_hunt, dw_serpent_won, rr_* own keys); `awayList` index alignment for `AW.hunt[2]`, `hunt15` and `hawks_won[2]`; `noCook` order in RR 4–5 and AH 4–5 opens (cooked first); no stray slot or `undefined` in any form, in renders and the lint.
- **firstFlightNow:** a new game, an old save (0), a later Coil, a realm-2 Get up, and once a game (`seen` is cloned across every rewind, the whole game too). A kept pass starts at realm ≥ 1 with `breakthrough` seen earlier, so no flight. `ykAskNow` and the tiger at realm 1 cannot fire. Task mode stops at the breakthrough (`week.js:502`), so no walker skips the scene.
- **ffPlace:** btWho is null in the villages and Act 1's Ashfall, T at heart_hub, M at ah_hub with Ya away, null with both away ('alone', right).
- **LG:** no trap on the last Ashen Hills day. Ya's door shows whenever `yaAway && !bothAway`, the spring door when `bothAway`, and the pass from 19:00. "Call it a day" stays held by those one-time doors (`oneOffLeft`).
- **KA (b):** `unwound` is always false (`coil.js:174`), so it never meets `kept`.
- **BYb-t, the beetle:** BYb-t's condition is right. The beetle is right too: in a real game both-away implies `bday >= 4`.
- **H2 hash, verified:** HEAD and the build rendered over the test's states give 38976 → 39102. The only differences are `first_flight` (126 new) and 3 `ah_hub` renders (Day 15, 08:00, every form).

## Test gaps
- **TG-C1:** FC by place. Act 1's Ashfall (`fo_ashfall`, `rt_ashfall`) and the Old Tree (`heart_hub`) are untested (C1, C2 missed). F9 is caught only because its edit also turns the prologue village into 'party'; it does not measure Act 1's Ashfall.
- **TG-C2:** FC is never walked. The test calls `choices[0].to(g)` on a faked `g.seen`. A walk (`runMed 'med:bt'` → Get up → Back to earth) should assert the order, the `seen` record written by `goTo`, the return hub and the clock.
- **TG-C3:** nights 16–21: the fire line is not pinned per night (C8 missed); `FN` covers 10–15 only.
- **TG-C4:** firesides 4–5. The no-cook lines (C6 missed) and FS_AH 4–5's both / ya / mei / none lines (C7 missed) are unasserted. The lint logs C7 only as a NOTE ("broken 0 → 1"), not a failure.
- **TG-C5:** the second stay's own sequence. A game that skipped a first-stay hunt day is untested (C5 missed: keying `AH15` on `ah_hunt` passes).
- **TG-C6:** `tests/tools.test.mjs` does not assert that the packet or lint draws nights 16–21, firesides 4–5, AH15, the kept dawns, Wen or FF by place. The P14-A pin lists the first nine night openers only.
- **TG-C7:** the cairn's both-away rule is tested at one hour (10:00). There is no test of the whole stay, or of the evening's rule (M1).

## Planted faults
- **Claude's F1–F12:** 12 of 12 caught (each 1–6 failures). Caveat on F9 above.
- **Mine** (`p16-faults-review-c.json`, C1–C8): 1 of 8 caught (C3).
  - Missed: C1, C2, C5, C6, C7, C8.
  - C4 (beetle `yaAway` for `yaOut`) is an equivalent mutant in real play (the Ashen Hills are always `bday >= 4`), so not a gap. Real count: 1 of 7.
- Not measured: the full `check.sh`, so the sanity and models drift from LG (the beetle's Ya, bots waiting for the pass) is still open.
