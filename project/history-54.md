# Bone and Ash — history, part 54

Started 2026-11-24 (v0.11.271), when `history-53.md` would have passed 20 KB with this move (owner pick U1, MD: history parts start at 20 KB, so a push uploads less). Older parts: `history-53.md` … `history.md`.

## Moved from the handover in v0.11.273 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-25 (Europe/Budapest). **Version:** 0.11.272 (`sw.js` VERSION `bone-ash-0.11.272`): **section 2's measured leftovers (P40-A, the owner 2026-11-25 00:56: "P40-a go"; tools and tests only, the game as 0.11.271):** **L3** (the P39 review's) closed: a kept Core Formation start (2 won clears) meets the collectors at 0.7 and at 0.8 alike: the kept pass's collectors 100% / 100% for every model, the whole game on Coil 1 100% / 100% (the Cultivator's tribute C1 won 98 / 100%, 1 game, none lost); **KC** `tests/models.test.mjs --kept --kept-clears N` (log only): with 2 the Completionist and the Cultivator start the kept pass at Core Formation (2.00; Act 1's end 3.00 / 5.08), Careful and the Sociable win Act 1 at Foundation (mean Coil 4.96) and keep it; with 5 the Cultivator starts at 4.02 (Act 1's end 6.00); **KA's (a)** closed (XW-a from realm 7 reaches no bot); **TG6** (the P35 review's) the fight texts as textlint's pool `fight` (47 lines / 763 words, tics 0, broken 0, shared with a scene 1; the snapshot re-saved). **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** Section 2's measured leftovers (v0.11.272); the Cultivator back inside T1 (v0.11.271); systems before Act 2 (v0.11.270). Open, options later (on the roadmap: `roadmap.md` section 2): the rest of section 2 (`roadmap-retune.md`'s knobs and tools: the tuning tools and rules (the tuning-notes doc, the pins for frozen sections, simruns, skillWatch, Careful's eating under Fed 30, the retune rules, the check order, the engine's times lint, the "tuned up to" note), BD and HN (their numbers from v0.11.222 / v0.11.244, before P21–P39: measured again first), the older notes), then 5b, systems, Act 2, art, later. *(The entry as it stood, word for word, in `history-54.md`.)*

*(from Decided in chat)*

- **v0.11.270: P38-A (the owner 2026-11-24 21:04: "move step 8 before act 2, the game should be mature before we start working on it."; 21:06: "P38-a go").** The options as laid out in chat (`claude/p38-options.md`, the project doc): **P38-A 🟢 (picked, recommended)** RO + SL + HW + BM (all of section 4 before Act 2; the docs agree); P38-B 🟡 the display half of section 4 before Act 2 (about 5–8 pushes), the balance half after it; P38-C 🟠 the Order line only; P38-D 🔴 hold. No review (rule 9: docs only).

## v0.11.270 — Systems before Act 2 (P38-A)

- **Files:** `sw.js`; tests: `tests/tools.test.mjs` (the P38-A block; PL-A's Order pin re-pinned; T1 this push's move), `tests/README.md`; docs: `project/roadmap.md` (the Order line, the A2 and 2b headings, section 0's note; v0.11.267's done line moved, MD), `project/roadmap-2.md` (section 4's heading and BM note), `project/roadmap-act2.md` (its top note), `project/roadmap-done-5.md`, the four docs, `history-53.md`.
- **What:** see the version line. No What's new line: nothing a player sees changed.
- **Checks:** docs only (rule 2): the tools test (617 passed) and `bash tools/check.sh quick` (exit 0, 638.7 s). Two older pins re-pinned before it (PG, the established pattern): v0.11.216's Order pin reads Act 2 as step 7, and P37-A's section-0 pin no longer needs its note first. **How it touches the rest:** docs only; the game and its numbers as 0.11.268.
- **Opus:** none (rule 9). **Fable:** none.

## Moved from `reference.md` in v0.11.273 (word for word; owner pick P41-A, CO: the dice era's balance block)

**Balance (v0.4.0, smart combat, random hub choices; `s` = extra days trained) — historical, the dice era; today's numbers: the bots and `tools/baseline.json`:**
- Enemies grow per extra day with `grow()` in `js/story/common.js`: HP +15%, DC to hit +0.45, attack +0.6 (to the half point). Lu Han: HP +5%, DC +0.35, attack +0.5. That tracks the average gain per day, so a player who trains harder than average wins more.
- Jackals (night 3 adds a yearling): ~99%. Gao Feng: 84% (s1) / 95% (s2). Boar: 91% / 99%. Collectors: 37% (s3) / 58% (s4). Night fights (crows, rats, lizard): 97–100%. Far hunt (wolves, thornback bull): ~80%. Arson: ~97%.
- Player at the jackals: GU check ~2.8, Convergence Use ~1.7 after two full forest days (was 1.2 / 0.6 on night 1).
- Old saves (no `long` flag) keep the original numbers and route.
- Re-tune with the balance script pattern: random hub choices, smart combat, group win rate by `s` (see git history, `bal.mjs` in the session that built v0.4.0).

## Moved from the handover in v0.11.272 (word for word)

*(the version line as it stood)*

**Saved:** 2026-11-24 (Europe/Budapest). **Version:** 0.11.271 (`sw.js` VERSION `bone-ash-0.11.271`): **the Cultivator back inside T1 (P39-A, the owner 2026-11-24 22:37: "P39-a"; JW-A at the build's stop, 23:08: "JW-A go"; a balance change, no save change):** **RG** the collectors' HP for a James at Core Formation or above 0.8 → 0.7 (`fight_tune.js` `HIGH_REALM`, `HP_TUNE_HIGH`, `hpTuneFor`; `power.js` `prepare`; P25-A's by-realm pattern; on every Coil): measured before the pick (200 games a model, `claude/p39-options.md`) the Cultivator's whole game on Coil 1 19.5 → 32.5% (seed 1: 15.5 → 21.5; mean 17.5 → 27), the Completionist 21.5% (Foundation at the tribute), Careful and the Sociable (0% on Coil 1, Act 1 4.96) unchanged; **MN** Careful's Mei Lin last nights (32.5 → 1.5% after P25-A) closed as by design: `fo_last_night` takes the trio's branch whenever both women are liked, and P25-A's two more Act 1 Coils let both pass the bar (trio 19 → 46%); **UC** (log only) the collectors' `up` is a cliff for the Cultivator (4.375: 19.5%; 4.25 and 4.0: 66.5%), not a tuning knob; **JW-A** the story test's music walks lost `journey.02` (2 of 160 walks before, Ya 26, James at Core Formation or up: RG moved them; 200 walks, Ya held low: 0), so it is checked directly (`lineOpen`, and drawn on `bl_camp` through `musicLine`, the review's TG2). **Next push:** open, options later.

*(the open item as it stood)*

- **NEXT PUSH: open, options later.** The Cultivator back inside T1 (v0.11.271); systems before Act 2 (v0.11.270); the dangling open items placed (v0.11.269). Open, options later (on the roadmap: `roadmap.md` section 2): the rest of section 2 (`roadmap-retune.md`'s knobs and tools: the tuning tools and rules (the tuning-notes doc, the pins for frozen sections, simruns, skillWatch, Careful's eating under Fed 30, the retune rules, the check order, the engine's times lint, the "tuned up to" note), BD, HN, KA's (a), the older notes; the fight texts in textlint's pools (the P35 review's TG6: measured in P39's analysis, 55 lines / 780 words, 0 tics, 1 shared with a scene, 7 snapshot changes); the P39 review's L3 (the kept realm meets 0.7 from a later Coil's start; `--kept` not measured)), then 5b, systems, Act 2, art, later. *(The entry as it stood, word for word, in `history-54.md`.)*

*(from Decided in chat)*

- **v0.11.269: P37-A (the owner 2026-11-24 20:31: "P37-a go").** The options as laid out in chat (`claude/p37-options.md`, the project doc): **P37-A 🟢 (picked, recommended)** S0 + SH + L3 → 5b + L4 closed + RT + TC → 5b + PI (7 of 7 on a step or closed; 5b 6 → 8 items); P37-B 🟡 L3 closed, TC to Act 2's lore line, RT left (6 of 7); P37-C 🟠 S0 + SH only (2 of 7); P37-D 🔴 hold. The owner asked: "check for the current unassigned/dangling open items and propose their placement on the open roadmap sections" (20:26). No review (rule 9: docs only).

## v0.11.269 — The dangling open items placed (P37-A)

- **Files:** `CLAUDE.md` (rule 2: `--update --last`), `sw.js`; tests: `tests/tools.test.mjs` (the P37-A block; T1 this push's moves), `tests/README.md`; docs: `project/working-agreement.md` (RT), `project/roadmap.md` (section 0's notes, section 2b's L3 and TC; v0.11.266's done line moved, MD), `project/roadmap-2.md` (section 6's pointer), `project/roadmap-done-5.md` (the moved line, L4 closed), the four docs, `history-53.md` (new).
- **What:** see the version line. No What's new line: nothing a player sees changed.
- **Checks:** docs only (rule 2): the tools test and `bash tools/check.sh quick`: exit 0, 650.3 s (the tools test 611 passed: the P37-A block). Its first run stopped on the tools test (571.9 s, 610 passed, 1 failed): RO1 (HP)'s pin read the v0.11.214 review line in the handover, which SH moved; it now reads the handover or `history-53.md` (the established re-pin, PG). **How it touches the rest:** docs and rule text only; the game and its numbers as 0.11.268.
- **Opus:** none (rule 9: no game logic, balance or story text). **Fable:** none (L3's line is drafted in 5b).

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
