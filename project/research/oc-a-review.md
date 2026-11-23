# OC-A cold review (v0.11.259, `git diff dd2ab4a..HEAD`, branch wip/oc4-tests)

Ran: `node tests/rules|faq|saves.test.mjs` (15 / 63 / 1,581 passed, 0 failed); the sanity invariants alone
(`node tools/sanity.mjs --tasks e.json --story e.json`, empty stats files, no bots); scratch probes in /tmp. Not run: the full check,
the task / story tests, the models, the planted faults.

**Count: 0 High, 4 Medium, 4 Low.** No player-facing fault comes from this push. One Medium (M1) will fail the full check as the branch stands.

## Findings

**M1 (blocks the full check): `tools/sanity.mjs` 44-62 now runs on the long calendar, and 77 invariants fail.** It calls `newGame(7, { closed: true })`
and `newGame(8)` with no `cal`, so OC4's new default puts it on the long calendar. OC5 moved textlint, lint and packet but not this file,
which is not in the diff. Measured: `sitGain` at realm 0 is 2.5, and the invariant expects 10 (`100 / (10 × 1.5^r)`, every realm × Coil × uses).
`merMinutesOf(g,'pri')` at 15 uses is 90 against an expected 30 (×4, capped at 120). Output: 77 lines of `INVARIANT FAILED  sit gain, realm 0, Coil 1 …`.
Re-pin the invariants on the long numbers (÷4, ÷6 from True Core, ×4 capped at 120). Adding `cal: 0` would let push 2 delete the only formula invariants.
`tools/snap.mjs:33` also plays the long calendar now. It is run by hand only. Its 30,000-step cap is untested there.

**M2: checks marked old (`OC2_OLD` / `cal: 0`) cover rules the long calendar also has, and no long test covers them.** Push 2 would delete their only test.
- `tests/tasks.test.mjs:405-445` (v0.9.6 block, `g` and `c3`):
  - the closed bars (Qi 25.5 / Yuki 20.5, regen 5%);
  - no collateral group before 2 primaries;
  - XP when a channel opens, and none for a short sitting (progress kept);
  - Yuki mirrors primaries and collaterals;
  - groups and primaries keep separate progress;
  - `actSpeed('mer')` ×4 at 10 sittings, ×10 at 30, the cap, and "a sitting counts one use".
  
  On the long calendar the speed-up can't be seen through `merMinutesOf`: 480 / 4 hits the 120 cap. Only the hours are old-only.
- `tasks.test.mjs:1185` (YK1 `mk`): Yuki held at James's GU. This covers level with him, above him, an award stopping at his rank, heldPast / reach / reachPast, and `yukiHeldNote`. None of it depends on the calendar except the XP number. The story test only reads the text heads (5726).
- `tasks.test.mjs:2446` (D block): a fail pays 25% before the rate, GU alone takes the pool, routine pays nothing, and the T1 targets / star lines. SC2 covers bands, tiers and Coils, but not the fail fraction or routine.
- `tasks.test.mjs:4117-4160`: sits to 95% by realm, condense XP at Coil 3 and T2, and the extraordinary hours table by realm and count. SC2 checks ×4 for one state per line only.
- `tasks.test.mjs:274, 3512` (`weak`, `at5(OC2_OLD)`): Fable's failed-try lines (`JADE_FAIL`, `SPEARS_FAIL`, FT: no "tonight" / "tomorrow"). They show on the long calendar too, at the end of a failed carry. No long test pins them.
- `tests/story.test.mjs:3833`: the music-line walk (one line a day, evening screens from 15:00, every line shows, a song once a game). It is old-only and marked "open: OC2's push".

Suggest: in this push, re-pin the calendar-free asserts on the default (long) state, or split them out, so that push 2 deletes only the old numbers.

**M3: `story.test.mjs:273` (NT1 `SETDAY.fo_ashfall`) no longer reaches the rule its comment names.** The comment says "the Fallout hub by the story's day, not by the day record".
The hub's text is read at raw `(7 + k) × 1440`, which is calendar Day 8 or 9. On the long calendar both are story day 2 (probe). So `fo_ashfall`'s
`d2 = textStoryDay(g) − 8` is 0 for every k, and the "2 different texts" pass on the day record alone. Planted C7 (FX by calendar day) puts
k = 0 and 1 at d2 0 and 1 by accident. If no other test catches C7, this is a test that passes when the game is wrong (then High).
Use `calMinutes(g, 8 + k, 9)`.

**M4 (from v0.11.204, not this push; the brief asked): the routine's hammerspace meals split, and the meal name lands in the reply.** `tasks.js:880` writes
`Breakfast: smoked meat. +30 satiety.` and drops the `You eat: ` lead. `GAIN_LINES` only knows `/^(Breakfast\. |Supper\. )?You eat: /`.
`splitLine` gives the reply "Breakfast: smoked meat." (shown under the scene text, recorded by QR) and the gain "+30 satiety." in Results.
On the old calendar the whole line was a gain. `Midday: the communal pot.` (`tasks.js:874`, no satiety line) is reply-only too.
B2's walk can't see either one: no stat in the reply sentence. Every other prefixed pot line splits as a whole gain (probe):
`POT_LINE.ashfall[1]`, `fo[0]`, `fo[1]` and the `act1_fallout.js:404` fallback. Owner call: K-A-style patterns, or keep `You eat:`.

**L1: other raw calendar-day clocks under the new default build states the long game can't reach.**
- `story.test.mjs:478` (RW1 `atDay`, Day 11+ = village week 2).
- `:852` (`B`, the Blackroot at calendar Days 11-15 = story days 2-3).
- LG's per-scene clocks `:2030-2294` (`fo_last_night` at Day 11, `spring_ya` at Day 14, `rt_*` at Day 20: all story days 2-3).
- `FM` `:2413` (story day 2).
- `:2473` (`a1_end` at calendar Day 22 = prologue story day 4).

They pass because those texts read flags and faked day records. A text branch by story day or act in them is no longer read. Convert them with `calMinutes`, as the push did elsewhere.

**L2: "game code paths unchanged" is not quite true. `coil.js:164` passes `cal: g.cal`, and an old state has no `cal` field.** So a whole-game rewind
of a `cal: 0` state now builds a long fresh game. Probe: `cal` 7 and no `calBl`, a hybrid that falls back to the 5-day road. This can't happen in play
(every load flips, new games are long). `story.test.mjs:783` (SV, r4: `!('calBl' in r4)`) still passes on the hybrid.

**L3: `tests/saves.test.mjs` `--write-flip-before` has no guard.** After OC2 removes the old reader, running it rewrites the "before" readings with the new
code, and the test then compares the code with itself. Everything else about staleness is loud:
- an added old save fails ("none");
- an edited save fails on its sha;
- a removed save fails on the leftover count;
- the probe names come from each save's own flags, fixed by its sha.

Suggest: drop the flag in push 2, or refuse to write when `inAct1` / `spacedFree` on an unmoved save can no longer differ from the moved reading.

**L4: the K-A test (`tasks.test.mjs:2191-2193`) builds its prefixes by hand, and its anchor check uses an invented line.** `MEAL` isn't exported. Renaming a
meal word (C3) or dropping a `^` from one pattern (C2) passes it. The patterns themselves are sound: each is anchored, and only pot lines start
with those words, so no real reply is filed as a gain.

Checked and fine:
- main.js: all ≥9 `deserialize` calls go through `checkScene`, which always runs `flipFill`. `descOf` reads the moved day. Nothing else reads
  `boneash.oldcal`: only comments, the tests' pins and a browser.py comment mention it.
- The G1 re-pin (`tasks.test.mjs:197`, the next story day) is right: GT1 (`gainCounts`) counts a gain once a story day on the long calendar.
- The sleep / bed / night-lock clocks kept by calendar day are right.
- `flip-before.json`: 36 entries, one per moved save, sha-pinned.

## Test gaps
- **TG-A1:** one anchor check per widened pattern: a line with the pot words not at the start must split normally (C2).
- **TG-A2:** export `MEAL` and build K-A's prefixes from it (C3).
- **TG-A3:** GT1 on the long calendar: a gain on two calendar days of one story day counts once, and again the next story day (C5).
- **TG-A4:** a whole-game rewind keeps the calendar: `e.cal === 7 && e.calBl === BL_SPAN` after `rewind(e, { to: 'game' })`. The tasks test compares only minutes with `newGame(1)`, and those are equal on Day 1 (C4).
- **TG-A5:** FX and the Fallout pot line on the long calendar by story day 8 / 9 / 10 (`calMinutes`), without a day record (C6, C7; M3).
- **TG-A6:** the sanity invariants on the long numbers (M1).
- **TG-A7:** the routine's meal lines placed: hammerspace and "the communal pot." in `splitReply`, after the owner's call (M4).
- **TG-A8:** M2's shared rules re-pinned on the long calendar before push 2.
- **TG-A9:** the `--write-flip-before` guard (L3).

## Planted faults
`project/research/oc-a-faults-review.json`: C1-C9, each `find` checked to occur exactly once. Not run.
- C1, C2: replies.js (K-A).
- C3, C9: tasks.js meal lines.
- C4: coil.js whole rewind.
- C5: game.js GT1.
- C6: kitchen.js pot by story day.
- C7: act1_fallout.js FX.
- C8: game.js `flipFill` calBl boundary.

C2, C3, C4, C5 and C7 are the ones expected to pass today.
