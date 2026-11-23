# Bone and Ash — history, part 51

Started 2026-11-23 (v0.11.262), when `history-50.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-50.md` … `history.md`.

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
