# Bone and Ash — history, part 51

Started 2026-11-23 (v0.11.262), when `history-50.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-50.md` … `history.md`.

## Moved from the handover in v0.11.265 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-24 (Europe/Budapest). **Version:** 0.11.264 (`sw.js` VERSION `bone-ash-0.11.264`): **the one clock's leftovers (P32-A, the owner 2026-11-24 00:15: "P32-a go"; RV-A after the cold review's two highs, 00:53: "RV-a go"):** L2 (`game.js` `flipOne`: an old-calendar save at 00:00–04:59 moves onto the one clock's night, `tod < NIGHT_TO * 60`, and, RV-A H2 + M1, its waking day's count moves by the one clock too, so its first sleep counts: the real `bl_night` save stayed on waking day 65 after sleeping to Day 66 since v0.11.226), L3b (`prologue.js` the epilogue's `enter` and its Act 1 start by `calendar.js` `clockDay`, never back: from the tribute's night Act 1 on Day 44, not 45), L3c (`act1_heart.js` the day keys by `clockDay`; `week.js` the plan's spring row), L3a kept (the counts and titles on the clock label's day; a guard), L1 + TG2 closed as accepted. In play nothing changes (80 bot games: 0 screens at those hours); a save change: old-calendar saves moved at 00:00–04:59 (1 of 36 samples). No balance change. **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** The one clock's leftovers done (v0.11.264). Open, options later (on the roadmap: `roadmap.md` section 2): the rest of section 2 (the RA1 line's items, MF; most measured on the old calendar, so re-measure on the long calendar first), 5b, Act 2, art, systems, later. *(The entry as it stood, word for word, in `history-51.md`.)*

*(from Decided in chat)*

- **v0.11.262: P30-A (the owner 2026-11-23 19:23: "P30-a go").** The options as laid out in chat: **P30-A 🟢 (picked, recommended)** D1 + D2 + D4; P30-B 🟡 D1 + D4 (the 00:11 farewell still lost); P30-C 🟠 D5 only (a guard test, the code as it was); P30-D 🔴 closed as accepted. Measured before the pick (`project/research/p30-measure.md`): 40 bot games, 1,193 screens in the gap (night screens of the wilds, village, Blackroot and road), 0 of them another text or choice by the text day; 0 Fallout or Heart screens in the gap; 0 of 15 searched evenings cross midnight; 1 of 39 saves in the gap, the same either way; forced 434 screens (219 at 00:11, 215 at 04:30), 6 after; the first trial without the pin changed the Sociable (6,821 → 6,841 cards), with it 0 lines differ. **Found while building (in scope):** `lastOfWeek` read nowhere after D2 (the leftovers check); gone, with `storyDay` from the Fallout's import. **The cold review (Opus):** no high; M1 (04:00–04:59 after a week's last day the daily marks have turned and `dd` has not; unreachable: open, options later), L1 (a farewell after midnight sets the clock back to Day 64 23:00: open, options later), L2 (`fo_night`'s count by the calendar day, by design: TG3), L3 (the farewell past Day 64: TG4), L4 (the midnight readers in the gap: open, with the one clock), L5 (`roadmap-retune.md`'s v0.11.203 L4 closed); TG1 (its D2 edge; the 04:00 hour stays with M1), TG3, TG4, TG5 done in the reviewer's wording (PG); TG2 with L1.

*(the version notes)*

## v0.11.262 — The Fallout's day by the text day (P30-A)

- **Files:** `js/story/act1_fallout.js` (`foDay`, `dd`, `onStoryDay`, `farewellNow`, the import), `js/core/calendar.js` (`lastOfWeek` gone, the header comment), `sw.js`; tests: `tests/story.test.mjs` (the P30-A block), `tests/README.md`; docs: `project/research/p30-*` (repo only), the four docs, `history-51.md` (new), `roadmap-retune.md` (§10, L4), `roadmap-done-4.md`, `changelog-5.md`, `restore-points-4.md`.
- **What:** see the version line. No What's new line: no player reaches the gap.
- **Checks:** a game change (rule 2): while building the story test and `bash tools/check.sh quick` (exit 0, 893.6 s); the full `bash tools/check.sh` after the review's fixes and the docs: exit 0, 2,099 s, 0 drifted (its first two runs stopped on the tools test's doc pins for this push's moves: history part 51, changelog part 5; re-pinned).
- **Opus:** the cold review (`project/research/p30-review.md`): no high; M1 and L1 open, options later; L2–L5, TG1, TG3–TG5 done. Planted faults through `tools/mutate.mjs` (`project/research/p30-mutate.md`): Claude's F1–F6 (6 of 6 caught) and the reviewer's R1–R6 (5 of 6; R4 an equivalent change, as the reviewer expected). **Fable:** none (no story text).

## Moved from the handover in v0.11.264 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-23 (Europe/Budapest). **Version:** 0.11.263 (`sw.js` VERSION `bone-ash-0.11.263`): **the one clock (P31-A; the owner 2026-11-23 22:19: "P31-a go"):** K1 (`calendar.js` `storyDay` from 05:00, `DAY_FROM`; was midnight; the pin kept), K2 (`game.js` `NIGHT_TO` = `DAY_FROM`, the waking day, the daily marks and the night to 05:00; was 04:00: `X4`, `wakeCal`, `gainCounts`, `TEXT_DAY_FROM` tied to it, "Call it a day" from it), L1g (`fo_depart` and, from the cold review's M1, `ht_leave` never set the clock back), FD (`foDay` folded into `storyDay`), the tests. In play nothing changes (100 bot games identical with K1, 40 with K1 + K2; 0 bot screens at 04:xx; 0 of 39 saves at 04:00–04:59); forced past midnight 53 of 560 screens change, the P30-A review's M1, L1, L4 and the Heart's two reads closed. No balance or save change. **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** The one clock done (v0.11.263). Open, options later (on the roadmap: `roadmap.md` section 2's v0.11.263 line): the P31-A review's L1 (a v0.11.262 save at 04:00–04:59 counts a second waking day; 0 of 39 saves; a save change) with TG2, L2 (`flipFill` keeps the old night `tod < 240`: an old-calendar save at 04:00–04:59 lands on a night that contradicts its marks; very rare; a save change) with TG3, L3 (the calendar's text helpers, `today` / `day(g)`, still turn at midnight: a fourth clock; reach probably 0, unmeasured), TG4's rest (`spacedNow`, `countsFill` at Day 44 00:30, `foldNight` after midnight), the planted faults that survived (F6 "Call it a day" and F7 `wakeCal` at 04:xx, R6 `fo_depart`'s clock inside the step); then the rest of section 2 (the RA1 items, MF; most measured on the old calendar, so re-measure first), 5b, Act 2, art, systems, later. *(The entry as it stood, word for word, in `history-51.md`.)*

*(from Decided in chat)*

- **v0.11.261: P29-A (the owner 2026-11-23 17:19: "P-29A go").** The options as laid out in chat: **P29-A 🟢 (picked, recommended)** SL1 + SL2 the loading way, M4a + M4b by the pattern; P29-B 🟡 SL1 by the reviewer's one-liner (33 of 39 Coils), M4 by the pattern; P29-C 🟠 SL the loading way, M4 closed as accepted; P29-D 🔴 both closed as accepted. Measured before the pick: 39 saves, 1 on the wrong day (`v0.8.5-act1-end`, 104 / 94), 6 without their Coil (the v0.8.5 six), 0 / 0 both ways after; `peekSave` 0.12 → 0.13 ms a save; about 95 hammerspace routine lines a game (100 bot games, dry runs counted: a ceiling), the bare pot line 0, about 69 prefixed pot lines a game already whole. **Found while building (in scope):** `flipMinutes` test-only after the change (the leftovers check); gone, its two test uses moved to `peekSave` and a local helper through `flipFill`. **The cold review (Opus):** no high, no medium; L1 ("as it loads" stops short of `checkScene`'s hub and scene checks: the wording fixed, the behaviour as before, 0 of 39 saves affected), L2 (two comments), TG1–TG6 done in the reviewer's wording (PG); its C1–C6, expected to survive, all caught after them.

*(the version notes)*

## v0.11.261 — The Saves screen's day and Coil; the routine's meals in the Results (P29-A)

- **Files:** `js/core/game.js` (`peekSave` through `deserialize` + `flipFill`; `flipMinutes` gone; two comments, L2), `js/main.js` (`descOf`, the import), `js/core/replies.js` (two patterns), `js/core/tasks.js` (`POT_BARE`, TG4), `js/core/news.js` (What's new), `sw.js`; tests: `tests/saves.test.mjs` (the SL blocks: TG4, the two named, TG5, TG1, TG2; FP1's Saves-screen day through `peekSave`), `tests/saves-peek.json` (new: the 39 readings), `tests/story.test.mjs` (TF1's M4 checks: TG-A7, TG3, TG4, TG6), `tests/README.md`; docs: `project/research/p29-*` (repo only), the four docs, `history-50.md`, `changelog-5.md`, `restore-points-4.md`.
- **What:** see the version line. A player sees two things: the Saves screen's day and Coil for a save from before the Coil, and a meal from the hammerspace whole among the results.
- **Checks:** a game change (rule 2): while building the saves and story tests and `bash tools/check.sh quick` (exit 0, 699 s); the full `bash tools/check.sh` once after the review's fixes and the docs: exit 0, 1,721.5 s, 0 drifted.
- **Opus:** the cold review (`project/research/p29-review.md`): no high, no medium; L1, L2, TG1–TG6 done. Planted faults through `tools/mutate.mjs` (`project/research/p29-mutate.md`): Claude's F1, F2, F4–F7 (6 of 6 caught) and the reviewer's C1–C7 (7 of 7 caught). **Fable:** none (no story text).

## Moved from the handover in v0.11.263 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-23 (Europe/Budapest). **Version:** 0.11.262 (`sw.js` VERSION `bone-ash-0.11.262`): **the Fallout's day by the text day (P30-A; the owner 2026-11-23 19:23: "P30-a go"):** p13 §10 on the long calendar: D1 (`act1_fallout.js` `dd` and `onStoryDay` read `foDay` = the pinned day of a week's card's result, else the text day from 05:00; was `storyDay`, from midnight), D2 (`farewellNow` by the text day: 00:11 after Day 10's last day gives the farewell, not the supper; `lastOfWeek` gone, nothing read it), D4 (the tests, with the review's TG1, TG3–TG5). In play nothing changes (40 bot games the same; 0 Fallout screens in the gap); forced past midnight, 434 screens → 6. No balance or save change. **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** p13 §10 done (v0.11.262). Open, options later (on the roadmap: `roadmap.md` section 2's v0.11.262 line): the P30-A review's M1 (04:00–04:59 after a week's last day: the daily marks turn at 04:00, the Fallout's day at 05:00; unreachable) with the one clock (the story day from 05:00 everywhere), L1 (a farewell after midnight sets the clock back to 23:00), `spacedNow` / `weekHub` / `carryOk` in the gap, the Heart's two reads; then the rest of section 2 (the RA1 items, MF; most measured on the old calendar, so re-measure first), 5b, Act 2, art, systems, later. *(The entry as it stood, word for word, in `history-51.md`.)*

*(the decision as it stood)*

- **v0.11.260: P28-A (the owner 2026-11-23, in the question dialog: "P28-A 🟢 (Recommended)").** The options as laid out in chat: **P28-A 🟢 (picked, recommended)** T1 first, then OC1 + OC2 + MC + L3 + OC6 + FB in one push; P28-B 🟡 the same in two pushes (story, then core); P28-C 🟠 T1 + L3 + OC6 only, the branches stay; P28-D 🔴 close OC as accepted. Measured before the pick: 72 story branches in 13 files, 28 in the core plus 17 `g.cal === LONG_CAL` / `longPace` checks; 31 `OC2_OLD` and 31 `cal: 0` marks (the build found more: helpers with a `cal` argument, about 70 sites in the story test); the flip safe without the old code; p13 §10 on the long calendar (a week's last night 00:00–04:59: story day d + 1 against text day d). **Found while building (in scope):** `migrate`'s step 4 read an unmoved v0.8.5 save's act through the calendar before the flip (`oldAct1` keeps its old reading; a saves check catches the fault). **The cold review (Opus):** no high; M1 (the PA cards carried to their end), M2 (TG2: the day replies through the tap path), M3 (TG3: the Blackroot walk on the 5-day road, `calBl` 1), L2 (`models --cal 0` exits 2), L3, L4, L5 done in the reviewer's wording (PG); L1 open, options later (SL: a display fault from v0.11.226, outside the picked scope).

*(the version notes as they stood)*

## v0.11.260 — The old calendar's code gone (P28-A)

- **Files:** `js/core/calendar.js`, `js/core/game.js`, `js/core/week.js`, `js/core/tasks.js`, `js/core/coil.js`, `js/main.js`, 13 story files (`act1_blackroot`, `act1_fallout`, `act1_heart`, `act1_return`, `again`, `ashfall`, `common`, `kitchen`, `longforest`, `oneoff`, `prologue`, `stomp_act1`, `wilds`; also comments in `meridians.js`, `lines.js`), `sw.js`; tools: `tools/textlint.mjs` (+ `text-baseline.json` re-saved), `tools/packet.mjs`; tests: `tests/tasks.test.mjs`, `story`, `saves`, `models`, `tools`, `part`, `README.md`; docs: `project/research/oc2-*` (repo only), the four docs, `history-50.md`, `roadmap-retune.md` (§10), `roadmap-e.md` (`--kept`), `changelog-5.md`, `restore-points-4.md`.
- **What:** see the version line. The rule for the marked checks: an old-only rule's check deleted; a shared rule's re-pinned on the long calendar, against the long numbers or a number v0.11.259's old code measured (named in the comment). Asserts (`assert(` in the source): tasks 1,555 → 1,527, story 2,439 → 2,364, saves 101 → 100.
- **Checks:** a game change (rule 2): while building the rules, faq, saves, data, part, task, story and tools tests and `bash tools/check.sh quick` (exit 0, 687 s); the full `bash tools/check.sh` after the review's fixes and the docs: exit 0, 1,714.6 s, 0 drifted, the models as in v0.11.257 (its first run stopped on the tools test's six doc pins for this push's moves; re-pinned).
- **Opus:** the cold review (`project/research/oc2-review.md`): no high; M1–M3, L2–L5, TG1–TG3, TG5, TG6 done; L1 / TG4 open, options later (SL). Planted faults through `tools/mutate.mjs`: Claude's F1–F8 (8 of 8 caught) and the reviewer's C1–C10 (10 of 10 caught; `project/research/oc2-mutate.md`). **Fable:** none (no new story text).

## Moved from the handover in v0.11.262 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-23 (Europe/Budapest). **Version:** 0.11.261 (`sw.js` VERSION `bone-ash-0.11.261`): **the Saves screen's day and Coil, and the routine's meals in the Results (P29-A; the owner 2026-11-23 17:19: "P-29A go"):** SL (`peekSave` reads a save as deserialize (forced) + `flipFill` load it, so the Saves screen lists each save on the day, Coil and act it opens on: `saves/v0.8.5-act1-end.json` Day 104 → 94, Act 1, Coil 1; the six v0.8.5 saves with Coil 1; 39 of 39 saves as they load; `flipMinutes` gone, test-only after the change) and M4 (two anchored `GAIN_LINES` patterns: the long calendar's routine meals from the hammerspace, "Breakfast: smoked meat. +30 satiety.", and dayMeal's bare pot line whole in the Results, wording unchanged), and the cold review's fixes (Opus: no high, no medium; L1 the wording, L2 the comments, TG1–TG6). No balance or save change. **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** SL and M4 done (v0.11.261). Open, options later (on the roadmap: `roadmap.md` section 2's v0.11.261 line): p13 §10 on the long calendar (`roadmap-retune.md`: a week's last night 00:00–04:59 reads story day d + 1 against text day d), then the rest of section 2 (the RA1 items, MF; most measured on the old calendar, so re-measure first), 5b, Act 2, art, systems, later. *(The entry as it stood, word for word, in `history-50.md`.)*

*(the decision as it stood)*

- **v0.11.259: OC-A, then W1 and K-A (the owner 2026-11-23, three question dialogs: "OC-A 🟡 (Recommended)", "W1 🟢 (Recommended)", "K-A 🟢 (Recommended)").** The options as laid out in chat: **OC-A 🟡 (picked, recommended)** this push OC3 + OC4 + OC5, the next OC1 + OC2 + OC6; OC-B 🟢 all of OC1–OC6 in one push; OC-C 🟠 OC5 only; OC-D 🔴 close OC as accepted. Measured before the pick (a scratch copy with every game long): rules 4, faq 1, saves 70 failed; the task and story tests stopped at their first missing choice after 28 / 127. **At the stop on the size (about 430 checks):** **W1 🟢 (picked)** finish in this push, the work saved to the side branch `wip/oc4-tests` after each suite; W2 🟡 the same with no side branch; W3 🟠 four pushes; W4 🔴 stop at OC3 + OC5. **At the stop on B2's finding (the long calendar's pot lines in the reply with "+25 satiety"):** **K-A 🟢 (picked)** the three patterns accept the meal prefix (measured on a scratch copy: B2 passes, 0 failed); K-C 🟡 Fable rewords the four lines; K-B 🟠 B2 on the old calendar, the fault to 5b. **The cold review (Opus):** no high; M1–M3, L1–L4 and the test gaps done in the reviewer's wording (PG); M4 (the routine's hammerspace meals, since v0.11.204) open, options later.

*(the version notes as they stood)*

## v0.11.259 — The tests and tools on the long calendar (OC-A + W1 + K-A)

- **Files:** `js/main.js` (OC3), `js/core/game.js` (OC4: `newGame`'s default), `js/core/coil.js` (L2: a whole-game rewind keeps `g.cal || 0`), `js/core/replies.js` (K-A), `js/core/tasks.js` (`MEAL` exported, TG-A2), `js/core/news.js` (What's new), `sw.js`; tools: `tools/sanity.mjs` (M1), `tools/browser.py`, `tools/text-baseline.json` (re-saved, OC5); tests: `tests/rules.test.mjs`, `faq`, `saves` (+ `tests/flip-before.json`, its write guarded, L3), `tasks` (`OC2_OLD`, the M2 block on the long calendar, K-A, TG-A1–A5), `story`, `tools` (CP's pick count, the changelog pins), `tests/README.md`; docs: `project/research/oc-a-*` (repo only), the four docs, `history-50.md`.
- **What:** see the version line. The rule for the marks: a check of a rule only the old calendar has (its one-go cards, its every-night events, its day counts and words, its ×1 pace numbers) builds its state with `cal: 0` (`OC2_OLD` in the task test, `cal: 0 /* OC2 */` in the story test); push 2 deletes them with the code. On a copy with `longCal` forced true, only those marked checks fail.
- **Checks:** a game change (rule 2): while building the rules, faq, saves, task, story, part, data and tools tests and `bash tools/check.sh quick` (exit 0, 714 s); the full `bash tools/check.sh` once after the review's fixes and the docs (its result in the push report and `restore-points.md`).
- **Opus:** the cold review (`project/research/oc-a-review.md`): no high; M1 (sanity), M2 (the shared rules), M3 (the Fallout hub by story day), L1–L4, TG-A1–A5, A8, A9 done; M4 open, options later. Planted faults through `tools/mutate.mjs`: Claude's F1–F8 and the reviewer's C1–C9 (`project/research/oc-a-mutate.md`). **Fable:** none (no story text).
