# Bone and Ash — history, part 51

Started 2026-11-23 (v0.11.262), when `history-50.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-50.md` … `history.md`.

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
