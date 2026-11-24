# Bone and Ash — history, part 52

Started 2026-11-24 (v0.11.266), when `history-51.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-51.md` … `history.md`.

## Moved from the handover in v0.11.266 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-24 (Europe/Budapest). **Version:** 0.11.265 (`sw.js` VERSION `bone-ash-0.11.265`): **section 2's RA1 line settled on the long calendar (P33-A, the owner 2026-11-24 02:58: "P33-a"; tests and docs only):** measured first (320 bot games, 8 models × 40; the fight lab, 200 games; `project/research/p33-measure.md`). Closed: LR (`night_lost` 70%, `jackals_lost` 60%: unreachable, a lost beast fight in a Coil ends the Coil; 0 of 320 games; guard TG-LR), MQ (gather Qi and the rests by the hour: by design, the v0.11.141 audit), FC (story checks by familiarity: 1,544 of 2,103 fails on a first or second pick; −0.5 / −1 / −1.5 would pass 0.48 checks a game, 104 of 152 at `rr_end` before a fight won 100%), BN + RA (the 33 bot numbers of v0.11.161, the story test's rot ape −6: superseded, 99.7% now), CD (Careful's door cards: superseded by the plan, Wen 39, the mother 78), MF + CMN (the mother p50 76–90, the Rusher 43; 287 of 287 Act 1 ends at the kitchen's 30), PC (`fo_palisade`'s count: two once-a-Coil cards, tops at 2; guard TG-PC). Group d's line re-measured (16 of 23 fights won ≥ 99% under every tactic; jackals smart 32.6% where darts win 96%). No game, balance or save change. **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** Section 2's RA1 line settled (v0.11.265). Open, options later (on the roadmap: `roadmap.md` section 2): the rest of section 2 (`roadmap-retune.md`'s knobs and tools; group d's (b) and the smart rule's dart order), 5b, Act 2, art, systems, later. *(The entry as it stood, word for word, in `history-51.md`.)*

*(from Decided in chat)*

- **v0.11.263: P31-A (the owner 2026-11-23 22:19: "P31-a go").** The options as laid out in chat: **P31-A 🟢 (picked, recommended)** K1 + K2 + L1g + FD + TG (one clock at 05:00); P31-B 🟡 K1 + L1g + FD + TG (M1 stays: 280 forced screens with the daily marks a day ahead); P31-C 🟠 K1 at 04:00 + K3 + TG (the 03:59 farewell lost, 96 texts move); P31-D 🔴 closed as accepted. Measured before the pick (`project/research/p31-measure.md`): 100 bot games identical with K1 (2,614 gap screens, all 00–02 h), 40 with K1 + K2; forced 560 screens: K1 12 differ (all L4), K1 + K2 53, K1@04 + K3 108; tests: K1 2 re-pins, K1 + K2 3. **Found while building (in scope, K2's readers of the 04:00 day):** `week.js` `wakeCal` (240, "as wakeState's") and `oneoff.js` "Call it a day" (from hour 4) now by `NIGHT_TO`; `gainCounts`' 300 and `TEXT_DAY_FROM` tied to it (05:00 as before); `flipFill`'s `tod < 240` kept on purpose (an old save written under the old night). **The cold review (Opus):** no high; M1 (`ht_leave` after midnight on the Heart's last day set the clock back to Day 100 21:00: 13.5 Fed in place of a sleep's; reachable as a choice at any hour: fixed in the reviewer's wording, `Math.max`, PG) with TG1, TG4 (part: the Blackroot's jumps, `blFill`), TG5 done; L1, L2 (save changes), L3 and TG2, TG3, TG4's rest open, options later.

*(the version notes)*

## v0.11.263 — The one clock (P31-A)

- **Files:** `js/core/calendar.js` (`DAY_FROM`, `storyDay`), `js/core/game.js` (`NIGHT_TO`, `X4`, `gainCounts`' day, the import, comments), `js/core/lines.js` (`TEXT_DAY_FROM` by `NIGHT_TO`), `js/core/week.js` (`wakeCal`), `js/core/tasks.js` (comments), `js/story/act1_fallout.js` (`foDay` folded, `fo_depart`), `js/story/act1_heart.js` (`ht_leave`), `js/story/oneoff.js` ("Call it a day"), `js/story/common.js` (a comment), `sw.js`; tests: `tests/story.test.mjs` (the P31-A block; F26's premise; the Heart's code pin), `tests/tasks.test.mjs` (N1), `tests/saves.test.mjs` (FP1), `tests/README.md`; docs: `project/research/p31-*` (repo only), the four docs, `history-51.md`, `roadmap-retune.md` (§10), `roadmap-done-4.md`, `changelog-5.md`, `restore-points-4.md`.
- **What:** see the version line. No What's new line: no player reaches the hours that changed.
- **Checks:** a game change (rule 2): while building the story test and `bash tools/check.sh quick` (exit 0, 1,046 s); the full `bash tools/check.sh` once after the review's fixes and the docs: exit 0, 2,398.6 s, 0 drifted (119 compared, 0 moved more than 5, 0 invariants failed). Before it the tools test stopped on its doc pins for this push's moves (history part 51, changelog part 5: re-pinned) and the first planted-fault run on the Heart's code pin (re-pinned).
- **Opus:** the cold review (`project/research/p31-review.md`): no high; M1 fixed, TG1, TG4 (part), TG5 done; L1–L3, TG2, TG3, TG4's rest open, options later. Planted faults through `tools/mutate.mjs` (`project/research/p31-mutate.md`): Claude's F1–F7 (5 of 7 caught; F6 and F7 survived, as expected) and the reviewer's R1–R7 (6 of 7; R4 caught by TG5, R6 survived: the tests read the end minute only). **Fable:** none (no story text).
