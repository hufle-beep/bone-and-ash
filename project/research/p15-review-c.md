# Cold review C (code), v0.11.243 (P15-B + D1 + W1)

Read: the diff (`js/`, `tools/`, `tests/`, the docs), both checklists, the packet (grep), excerpts only. Scratch copy `/tmp/rv-c`. Ran: F1–F10 and my R1–R7 through `tools/mutate.mjs` (`node tests/story.test.mjs --games 2 --workers 1`, 1 job; about 36 s a fault), plus small probe scripts (below). Not run: `check.sh`, `tasks.test.mjs`, `models.test.mjs`, `tools.test.mjs` (the full check runs them).

## High
None.

## Medium
None in the game code. The two test gaps TG-C1 / TG-C2 (a form's voice) are the weightiest point: a canon fault in the new by-form lines passes the suite.

## Low
- **L1 HS, "a third visit" cannot happen.** `oneoff.js` `ONCE_STAGES = { herb_slopes: 2 }`: two slopes visits a Coil, either calendar. Walked on the long calendar, week 2, the Ashfall card 3 days apart: visit 1 `slopesW2a`, visit 2 `slopesW2b`, visit 3 no card (`oo:herb_slopes` 2). So the test's `s[2] === s[0]` is a state play never reaches. Also, a game that spends both visits in week 2 (the measure's days 28 / 31) never sees week 3's slopes text (the father beat). That was already so before this push; HS doesn't change it. Open, options later.
- **L2 HS on a v0.11.242 save.** If the save had one week-2 slopes visit, it has no `s:herb_slopes:2` record. Its second (last) visit reads `slopesW2a` again at index 0, and `slopesW2b` never shows. This is the same kind as P14-A's TG-C5 ("by decision"). Say it in the report.
- **L3 Packet states that play never reaches.** `packet.mjs` `STATES` (and textlint) now sample "day 7" of village week 3 and of story day 10 (with Ya and without). In play, week 3's seventh evening is the tribute (`nextEvening` → `evening`) and story day 10's is the farewell (`farewellNow`). The packet prints them merged with day 1 ("story day 10, day 1 …; day 7 …", packet lines 53, 142), as if a seventh repeat existed there. This is harmless, but a reviewer can misread it. Either cut k = 6 for those two, or label it.
- **L4 P15-B's day-word rule is narrower than P14-A's.** `DAYS` has no "yesterday", "last night" or "again". R6 (a "last night" in 3:5) was caught only because 3:5 sits in P14-A's week-3 list (EVn-23, TG-T1). The same words in a seventh would pass.

## Checked, no fault (numbers where measured)
- **The five lists:** 7 each (`fo_supper:8` = 3 + FS8 + `FS7.d8`; `:9` = 3 + FS9 + `FS7.d9`; `supper:4` / `:5` = 3 + `SUPPER_NEW[n]` + `SN7`; quiet = `QUIET_OLD` + `QUIET_W1` + `SN7.quiet`). `byDay` uses `% list.length`, so index 7 is text 1.
- **An eighth day:** not reachable for these keys. The Fallout keys go by calendar story day (7 days). `fo_supper`'s `enter` moves a supper after midnight on to 19:00 of that day, so `dd` and `textStoryDay` agree. The village counters run 7 nights from `weekBegins` (cal_night 0–6).
- **A v0.11.242 save with index 6 noted:** its next draw of that day reads the new seventh. The next day is the next week's key at index 0, so one seventh is skipped for that save and nothing breaks. In task mode the new text stops the fold once (`tasks.nf` hash differs), as any new text does.
- **MW:** `forest_day` undefined or 1 on the long calendar reads `MORNING_W1`, 2 reads "Another morning" (`MORNING_AGAIN` on replays, unchanged), 3 reads week 3. The old calendar never shows a morning at 1 (`weekMorning` always true), so F6 is caught only through a direct render. `saw_lights` is in `KEEP_FLAGS`, so week 1 of a later Coil used to read "And then the lights"; MW removes that. Another gain: in hand play, week 3's text no longer folds as "already read" (VF), since week 1 no longer showed it.
- **PR2 / VQ1 re-pin is text-only.** I ran the wilds pin's run (`saves/v0.11.204-long-wilds-day2.json`, same rows) with MW on and with the old morning text forced. Without `tasks.nf` both hash `3329668e` (53 steps, 6 × `evening`); `nf.morning` is `7e4cc695` against `f870b54b`. The save's own `nf.morning` (`8a1110c5`) matches neither, so both runs stop once on the first morning. The pin therefore does not exercise a v0.11.242 save whose `nf` matched the old text (one extra stop in task mode, expected).
- **Template code:**
  - `fs8` replaces `{yuki}` once, and `FS7.d8` has one slot; its Yuki lines contain no `$`, so `replace` is safe.
  - `quietY` uses split / join.
  - `slopesW2b` adds `\n\n` only when bruised.
  - `slopesW2a` is the old template byte for byte.
  - No `{yuki}` is left in any render (the tests check this). Paragraph breaks are as in the drafts.
- **Other readers:** `remember.js` (morning memory line at `forest_day === 2` only) is unaffected. `again.js` (the fold of the sevenths' first paragraphs) is pinned by TG-C5's new assert. `week.js` `FOLD_SCENES` / `foldNight` work on any length. The probes run on clones (`readProbe`), so no day is noted without a visit. Nothing else in `js/` reads `SUPPER_NEW` / `QUIET_W1` / FS8 / FS9 lengths. The source pins in `tests/tools.test.mjs` match the new textlint loops.
- **Docs moves, word for word** (compared by script against `HEAD`):
  - changelog row 0.11.222 → `changelog-5.md` identical;
  - restore rows 0.11.212 / 0.11.213 → `restore-points-4.md` identical;
  - the 0.11.242 rows differ only by `(this push)` → `` `ce3ee9f` ``;
  - the v0.11.236 note → `roadmap-done-4.md`, gone from `roadmap.md`;
  - the two handover items → `history-44.md`, gone from the handover.

  Sizes: handover 30,983; roadmap 19,971; changelog 19,974; restore-points 19,906 (all under the caps, the last three narrowly).

## Test gaps
- **TG-C1:** the P15-B test compares `fo8[6]` with `FS7.d8.t` filled from `FS7.d8.y`, which is a text against itself. R1 (the small cat says her line aloud, in quotes) passes. Pin each form's voice for `FS7.d8.y`: cat and great in italics with no quotes, the great form "sends", the woman aloud (the quiet-night test's rule).
- **TG-C2:** `SN7.quiet`'s great form "says" (R2, F9's kind) passes. The quiet test checks italics and no quotes but not the verb, and D1's pin names only the one cut. Assert `\bsends\b` (and no `\bsays\b`) for the cat and the great form over all new by-form passages.
- **TG-C3:** `SLOPES_W2.bruised` is in neither the lint corpus nor the packet (`lintCorpus()`: "thin pale line" false; the old "scabbed over" false too). A time word there (R3) and the line run into her question's paragraph (R7) both pass. Add a `mei_bruised` week-2 sample (days 0 and 1) to textlint and `STATES`, and assert the bruise line is the last paragraph of its own.
- **TG-C4:** MW has no test on a later Coil (R4: MW limited to Coil 1 passes). Add a long game with `coil.n` 2 and `saw_lights` kept: the week-1 morning is `MORNING_W1`, and week 2 still has `MORNING_AGAIN`.
- **TG-C5:** HS is tested only by rendering on consecutive days. Walk it through the Ashfall card (3-day spacing): visit 1 a, visit 2 b, no third card.
- **TG-C6:** L4. Run the sevenths through P14-A's time-word rule (or widen `DAYS`).

## Planted faults
- **Claude's F1–F10:** 10 / 10 caught (6 m 09 s).
- **Mine** (`p15-faults-review-c.json`): 2 / 7 caught.

| Fault | What it breaks | Result |
|---|---|---|
| R1 | FS7.d8: the small cat speaks aloud | missed |
| R2 | SN7.quiet: the great form "says" | missed |
| R3 | HS bruise line: "as she did yesterday" | missed |
| R4 | MW only on Coil 1 (`!replayExplore`) | missed |
| R5 | MORNING_W1: one word changed | caught (PR2 / VQ1 pins, 6 fails) |
| R6 | 3:5: "as it did last night" | caught (P14-A EVn-23, TG-T1; 2 fails) |
| R7 | HS bruise line run into the question's paragraph | missed |

R1's first run broke the string (a SyntaxError, so it was counted "caught" falsely). I fixed the escaping and ran it again: missed.

## For the checklist (code part)
- **A test that renders a text and compares it with the constant it was built from pins nothing** (TG-C1). Pin a rule instead (the form's voice, the slot filled).
- **A branch keyed on a counter's first value** (`forest_day || 1`) also gets a later Coil, because `KEEP_FLAGS` carries `saw_lights` and `long` (TG-C4).
- **A once-a-Coil stage cap** (`ONCE_STAGES`) limits what a sequence can show. Count the visits the cap allows before writing (or testing) a third text (L1).
