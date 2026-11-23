# Bone and Ash — history, part 50

Started 2026-11-23 (v0.11.258), when `history-49.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-49.md` … `history.md`.

## Moved from the handover in v0.11.258 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-23 (Europe/Budapest). **Version:** 0.11.257 (`sw.js` VERSION `bone-ash-0.11.257`): **the retune's notes and the test tools (P27-A; the owner 2026-11-23, in the question dialog after 08:16: "P27-A 🟢 (Recommended)"):** FQ (`js/core/faq.js`: "each realm needs at least as many sits as the last"; was "more sits than the last", false from realm 6 on the long calendar: 950 sits each for realms 6–13), FL (`tools/lib/fightlab.mjs` `labId`: the rot ape below Core Formation its own row, `rot_ape@low`), SL (`tests/story.test.mjs` `LONG_RUN_NOTE`: a NOTE past 6,000 steps), MQ (`tools/mutate.mjs` `DEFAULT_CMD`: `--games 50 --workers 1`; `--quick` was no flag); closed as accepted: P26-A review L1 (LK), L2 (LO), P25-A review L1 (AW1). No balance, no save change. Measured for the options (`claude/p27-options.md`): 634 tribute fights of the models (4 × 40 games), militia + spears at most 2, the floor never binds, realm at the tribute 0 / 1 / 3; the fight lab's 40 ape states at 100 games all from Core Formation. **Next push:** open, options later (below).

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** P27-A done (v0.11.257). Open, options later (on the roadmap: `roadmap.md` section 2's v0.11.257 line): the old calendar's code (about 640 hand-built test states, 105 `longCal` uses in 17 files; old saves still flip on load); YM-3. *(The entry as it stood, word for word, in `history-49.md`.)*

*(the decision as it stood)*

- **v0.11.255: P25-A + SC2 (the owner 2026-11-22, in the question dialog after 21:49: "P25-A 🟢 (Recommended)"; mid-build "SC2 🟢 10,000 (Recommended)").** The options as laid out in chat (from `project/research/p24-measure.md` §1): **P25-A 🟢 AW (picked, recommended)**; P25-B 🟡 AW + LN (Lu Han −0.5 raw HP: the Completionist 22%, the Cultivator 35.5%); P25-C 🔴 AU (the ape 11 for everyone: the Completionist 0%). **Mid-build stop (rule 2):** the story test's run 49 took 5,096 steps against the cap of 5,000 (two more ape deaths, two more Coils; not stuck); across 1,000 runs the longest 4,480 → 5,096, the 99th percentile 3,450 → 3,451, the ape won / lost 677 / 1 → 691 / 3, the endings unchanged. **SC2 🟢 (picked, recommended):** the cap 10,000 (about twice the longest, the walks' rule WB); SC1 🟡 6,000 (+18%).

*(the version notes as they stood)*

## v0.11.255 — Act 1 under the retune: the rot ape by realm (P25-A + SC2)

- **Files:** `js/story/act1_tune.js` (`LOW_REALM`, `TUNE_LOW`, `tuneFor`; RV: `Object.hasOwn`), `js/story/act1_common.js` (`encounter` through `tuneFor`), `js/core/news.js` (What's new), `sw.js`; tests: `tests/story.test.mjs` (the P25-A block: the tunes at every realm, every other fight unchanged, the ape's HP / DC / attack at realms 0, 1, 2, 5 head-on and lured; the review's TG1 (Yuki's realm above James's), TG2 (the real tap path and its preview's degree), TG3 (the Coil's kept realm), TG5 (allies after the tune); SC2 the step cap 10,000); docs: `project/reference.md` (the tune line), `project/history-49.md` (new).
- **What:** see the version line. **Balance (picked with its numbers):** measured before the build, Careful's Act 1 2.40 → 4.47 Coils, the Sociable's 4.40, the Completionist 17.8% and the Cultivator 25.6% unchanged (`p24-measure.md` §1); the quick check's models (50 games): Careful and the Sociable 2.46 / 4.44, the Completionist 22%, the Cultivator 28%; the full check's (200 games): Careful 2.54 / 4.50, the Sociable 2.54 / 4.45, the Completionist 15.5% (17.8% at 500 games before; within the noise of about ±3.5), the Cultivator 24%, the Farmer 15% (40 games). The long log's notes (log only, not re-saved): Careful's and the Sociable's ape 100 → 33.7 / 34.4%, their Act 1 Coils 2 and 3 dead 100%, Coil 4 50 / 44.5%; Careful's last nights Mei Lin 32.5 → 2%, trio 19 → 53.5%.
- **Checks:** a game change (rule 2): while building the story test (1,000 games; then 50 after the review's tests) and `bash tools/check.sh quick` (exit 0, 866.6 s, beside the review); the full `bash tools/check.sh` once after the review's fixes and the docs (two earlier runs stopped on the docs: the version lines, then S6 / T1's history part): exit 0, 1,925.6 s (3 jobs on 2 cores), sanity 119 compared, 0 drifted, 0 moved more than 5, 0 invariants failed.
- **Opus:** the cold review (`project/research/p25-review.md`; no high; M1 medium = TG1 / TG2 done; L2, L5 done; L1, L3, L4, L6 open, options later; TG4 left: the game always stores a number); 9 of 11 planted faults caught through `tools/mutate.mjs`, the missed M8 caught after TG1 (M9 near-equivalent: only a null realm differs). **Fable:** none (no story text; the What's new line is Claude's).
