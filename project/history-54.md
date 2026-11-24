# Bone and Ash — history, part 54

Started 2026-11-24 (v0.11.271), when `history-53.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-53.md` … `history.md`.

## Moved from the handover in v0.11.271 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-24 (Europe/Budapest). **Version:** 0.11.270 (`sw.js` VERSION `bone-ash-0.11.270`): **section 4, systems, moved before Act 2 (P38-A, the owner 2026-11-24 21:04: "move step 8 before act 2, the game should be mature before we start working on it."; 21:06: "P38-a go"; docs only):** **RO** `roadmap.md`'s Order line: 5 the retune → 5b the polish pass → 6 section 4, systems (was 8) → 7 Act 2 (was 6) → 8 the art pass (was 7) → 9 later; Act 2 starts after about 19–33 pushes (was 7–13); **SL** the line's slips: 5b's eight items (L3, TC added), section 2's 3–7 → 5–10 pushes, the total 56–99 → 55–95 pushes, 7–24 working days (4–9 a day, 2026-11-22 to 24); **HW** the headings agree (`roadmap.md` A2 and 2b, `roadmap-2.md` section 4, `roadmap-act2.md`'s top); **BM** section 4's note: about half its lines change balance, each such push measured against T1–T3 and the long drift guard; the threads and crafting wait for the owner's design answers. **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** Systems before Act 2 (v0.11.270); the dangling open items placed (v0.11.269); the drift guard and the targets (v0.11.268). Open, options later (on the roadmap: `roadmap.md` section 2): the rest of section 2 (`roadmap-retune.md`'s knobs and tools: the tuning tools and rules (the tuning-notes doc, the pins for frozen sections, simruns, skillWatch, Careful's eating under Fed 30 (1,146 times in 200 games, v0.11.268's run), the retune rules, the check order, the engine's times lint, the "tuned up to" note), BD, HN, KA's (a), the older notes; the Cultivator at or under T1's floor (19.5%, 15.5% on seed 1); Careful's Mei Lin last nights after P25-A (the mechanism); the fight texts in textlint's pools (the P35 review's TG6)), then 5b, systems, Act 2, art, later. *(The entry as it stood, word for word, in `history-53.md`.)*

*(from Decided in chat)*

- **v0.11.268: P36-A (the owner 2026-11-24 19:41: "P36-a go").** The options as laid out in chat (`claude/p36-options.md`, the project doc): **P36-A 🟢 (picked, recommended)** LB + MB + LU + KS + LG + TT (29 stale notes → 0; 227 long numbers guarded, 0 false flags on a reshuffle; re-saves in seconds; the targets printed every full check); P36-B 🟡 the same without LG; P36-C 🟠 LB + MB + LU; P36-D 🔴 hold. The pick is the go for the two re-saved baselines (rule 2). Measured before the pick (`project/research/p36-measure.md`). No review (rule 9: tools only).

*(the version notes)*

## v0.11.268 — The long calendar's drift guard and the targets (P36-A)

- **Files:** tools: `tools/lib/longguard.mjs` (new: `longMetricsOf`, `compareLong`, `shareTable`, `measure`, `verdict`, `targetLines`, `codeStamp`, `keepStats`, `readKept`), `tools/sanity.mjs` (LG, TT, LU, `--last`), `tools/check.mjs` (KS), `tools/lib/report.mjs` (TARGET lines kept in the compact output), `tools/targets.json` (new), `tools/baseline-long.json` and `tools/models-baseline.json` (re-saved), `.gitignore`; tests: `tests/models.test.mjs` (`shareTable` from the lib), `tests/tools.test.mjs` (the P36-A block; the sanity job's pins; T1 this push's move), `tests/README.md`; `sw.js`; docs: `project/research/p36-measure.md` (repo only), `project/reference.md`, the four docs, `history-52.md`, `roadmap-retune.md`, `changelog-6.md` (0.11.245 moved, MD).
- **What:** see the version line. No What's new line: nothing a player sees changed. `node tools/sanity.mjs --update` alone now stops with a message: use `--update --last` after a full check (or `--long` with `--tasks` and `--story`). CLAUDE.md's rule 2 still names the plain `--update` (a rule text: not changed without the owner).
- **Checks:** tools and tests only (rule 2): sanity on full stats (the tasks and story tests 1,000 games each, the models step's numbers of the measure run, unchanged code): before the re-save 21 long drifts (exit 1), after it 0 (exit 0; 227 compared, 0 noted), on the seed-1 numbers 0 drifts and 15 notes; `baseline.json` 0 drifted, 0 moved. `bash tools/check.sh quick`: exit 0, 660.3 s (the tools test 604 passed: the P36-A block and this push's move pins). Its first run stopped on the tools test (589.2 s): the pinned `roadmap-retune.md` block (Claude's done mark on the tuning tools' line, reverted: TT's done note lives in `roadmap.md`) and the T1 doc pin for this push's move (re-pinned, the established pattern). **How it touches the rest:** the full check's sanity step now fails on a long-calendar move past 20 points (n ≥ 50 both sides); the next balance push shows those numbers and needs the owner's go for `--update --last`, as `baseline.json` always did. The full check is due with the next push that changes the game.
- **Opus:** none (no game logic, balance or story text: rule 9). **Fable:** none.
