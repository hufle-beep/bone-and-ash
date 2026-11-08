# Bone and Ash — research: what we take from other code and games

*New in v0.11.73 (group h, owner picks H1 + K1, 2026-11-08 17:54; the layout is Selene's `project/research.md`). Each research round gets its own section, newest last: what was read, every candidate (best value first), what was considered and skipped, and where each one went (built, on the roadmap, or nowhere). The licences table says what may be taken from each source. Credits for anything used go in `CREDITS.md` (code and ideas) or `art/bg/CREDITS.md` (paintings).*

## Licences at a glance

| Source | Repo | Licence | What we may take |
|---|---|---|---|
| Selene: Tidelocked (The Long Patience) | `hufle-beep/Long-patience` | the owner's own (owner 2026-11-08 16:48) | anything, freely |
| Rules Engine C and the SillyTavern setup | `hufle-beep/Shared-ST` (private) | the owner's own (owner 2026-11-08 16:48) | anything, freely; `js/core/formulas.js` is the engine's file, unchanged |
| Fonts: Literata, Shippori Mincho | Google Fonts | SIL OFL 1.1 | **used** (loaded from Google Fonts; to be embedded for Android: keep the copyright and licence, mind the OFL's reserved font names) |
| Background paintings | museum open-access collections | public domain / CC0 | **used** (`art/bg/CREDITS.md`) |
| Playwright | microsoft/playwright | Apache-2.0 | a dev tool only (`tools/browser.py`); nothing shipped |
| *Group i:* the games Selene studied, plus the owner's | listed in Selene's `project/research.md` | **each its own; recheck every licence before group i reports** | ideas only, unless the licence allows code (then with its notice) |

## Group h — Selene's and the SillyTavern repositories, whole (2026-11-08)

**What was read:** everything in `hufle-beep/Long-patience` (last commit 2026-11-05) except the games list in its `research.md` (group i); everything in `hufle-beep/Shared-ST` (last commit 2026-11-05, engine 0.1.223), with the chats only sampled for canon. Neither repo had changed since the first pass (2026-11-06), so this pass looked at what that one skipped: tools, tests, checks, workflows, docs, rules and working habits. The engine's `formulas.js` still matches ours (only the header comment differs). Two helper agents read the repos and Claude checked the main claims against the files. 42 candidates.

**Picked (H1 + K1), built in v0.11.73:** `project/lore.md` (one lore source for Fable; K1, the game's canon wins, the SillyTavern canon that differs listed as not adopted); `tools/consistency.mjs` (the handover under 35 KB and the roadmap's version, a failure; a history file past 45 KB, a log line); hard rule 5's fallback branch; this file and `CREDITS.md`; the README brought up to date. H2 (the story-text lint now) and H3 (roadmap only) not picked. K2 (James at 168 cm) and K3 (decide in group e) not picked.

### Candidates from Selene (value: high / medium / low; effort S / M / L)

| # | What | Selene's source | Bone and Ash today | Value, effort | Where it went |
|---|---|---|---|---|---|
| 1 | Screenshot tour of every screen (420×900, 2×) | `project/tools/shots.py` | `tools/browser.py` checks screens, saves no pictures | medium, S | roadmap section 3 (before the later art pass) |
| 2 | Style snapshot and diff (proves "no visible change") | `stylesnap.py` | nothing | medium, S–M | roadmap section 3 |
| 3 | Milestone table against the targets, committed, exit 2 on outliers | `milestones.js`, `milestones.md` | the models' one-line digest; targets by hand in the handover | medium, S | roadmap section 2 |
| 4 | Multi-pass bot (the whole game more than once on one save) | `simruns.js` | the models stop at the whole-game rewind; `stats.pass` unit-tested only | medium-low, S | roadmap section 2 |
| 5 | Count-checked bulk edits (`once(a, b, n)`: stop unless n matches) | `oneoff/reskin.py`, `cleanup.py` | nothing | medium, S | roadmap group e (the rewrite pass) |
| 6 | Phone performance measured (CPU 4× slower; main-thread ms, long tasks) | `research.md` round 4 | not measured; every render plays each card on a JSON copy | medium-low, S | roadmap section 4 (game UI) |
| 7 | Owner-approved pins for frozen sections | `tests/frozen.test.js` | only the ±20 drift | medium, S | roadmap section 2 |
| 8 | A test of a design rule (Act II 1.8–2.2× Act I) | `tests/totals.test.js` | the targets are log only | medium, S | roadmap section 2 |
| 9 | Tuning notes doc (process, knobs per section, values, freezes, logs) | `project/playtest-notes.md` | the knobs spread over `act1_tune.js`, `nodice_tune.js`, the handover, history | medium-high, S | roadmap section 2 |
| 10 | Research doc layout (licences, rounds, avoid lists, credits audit) | `project/research.md` | nothing | medium, S | **built (this file)** |
| 11 | Folder index and a saves README | `project/README.md`, `saves/README.md` | neither; `saves/` mixes tool saves with the owner's | low, S | roadmap section 5 |
| 12 | A current README with a "Made with AI" line | `README.md` | stale (dice, 87 scenes, the Saves tab) | low-medium, S | **built** |
| 13 | Fallback branches as a habit, with their own section | `restore-points.md`, `CLAUDE.md` rule 5 | one branch (11-06), named in one row | medium, S | **built (rule 5)** |
| 14 | A before-release list (test switches off, freezes rechecked) | Selene's roadmap, playtest-notes | the test hooks only in `tools/leftovers-keep.json` | low, S | roadmap section 5 |
| 15 | Retune rules (freeze only on the owner's word; one key number per section) | `working-agreement.md` | targets, no freeze rule | medium, S | roadmap section 2 (the owner picks) |
| 16 | Chat-length rule also after several hours | `CLAUDE.md` rule 4 | no time trigger | low, S | roadmap section 5 (the owner picks) |
| 17 | What the status bar's numbers are made of, on hold | `drainParts`, `drainTxt`, `fxOn` | hold works on cards only; the bar explains nothing | medium, S | roadmap section 4 (game UI) |
| 18 | A card's next familiarity step and the time it saves | `etaLines`, `famSaved` | the tier name and "fam of next" | low-medium, S | roadmap section 4 |
| 19 | A grouped Journal (by section, folds, filters), old entries in the current wording | `foldActs`, `LOG_F`, `refreshLog`, `OLD_LOG` | a flat list of the newest 60, stored as text | medium, M | roadmap group e (needed after the rewrite) |
| 20 | A history table of past Coils (cause, times, averages) | `S.hist`, `histGroups`, `histAvg` | `coil.n`, `stats.best`, `stats.pass` only | medium, M (an optional save field) | roadmap section 4 |
| 21 | A timeline strip of each Coil's time per task | `tlAdd`, `tlHtml` | nothing | low-medium, M (an optional save field) | roadmap section 4 |
| 22 | Export names with the real date, the Coil and the build | `fileStamp` | the game clock only (export-all is stamped) | low-medium, S | roadmap section 4 |
| 23 | A summary before loading or overwriting a save | `askOverwrite`, `saveProblem` | loads at once after a backup; "Save here" doesn't ask | low, S | roadmap section 4 |
| 24 | A credits panel in Settings | `creditsPanel()` | none in the game; `art/bg/CREDITS.md` only | low (medium before publishing), S | roadmap section 4 (with `CREDITS.md`, built) |
| 25 | Keyboard shortcuts from one table | `HOTKEYS` | no keydown handler | low-medium, S | roadmap section 4 |
| 26 | Comparisons with other games on the same phone | `splitNote`, `splitHtml` | the best per save | low, S | roadmap section 5 |
| 27 | A "tuned up to" note for players | `TUNED_TXT` | none (before the retune) | low, S | roadmap section 2 |
| 28 | A test that every recipe fits what its section can reach | `data.test.js` | crafting not built | low now, S later | roadmap section 4 (step 4, crafting) |

### Candidates from Shared-ST

| # | What | Source | Bone and Ash today | Value, effort | Where it went |
|---|---|---|---|---|---|
| 29 | A story-text lint: repeated passages (5-word shingles, cut-off 12, set from 2,122 replies), verbal tics, broken draft text; a corpus scan before anything goes strict | `lib/replyCheck.js` `shingles()`, `lib/loops.js` `repeatedPhrases()`, `lib/brokenReply.js` `detectBrokenReply()`, `dev/rules-engine-c-tests/replyCheckScan.mjs` | `tools/lint.mjs` doesn't read prose | high, M (texts rendered through the scenes on sample states) | roadmap group e (its first push; H2 not picked) |
| 30 | A baseline for endings and outcomes (romance, Act 1's four endings) | `wiSim.mjs`, `wi_baseline.json` | `story.test.mjs` counts endings, compares nothing | medium, S–M | roadmap group e |
| 31 | Every skill change has an XP line behind it | `lib/skillWatch.js` | nothing ties them in the bot games | low-medium, S | roadmap section 2 |
| 32 | A docs integrity check (sizes, rollover) | `lorebook.test.mjs`, `archive_lorebooks.mjs` | versions only | medium, S | **built (`tools/consistency.mjs`)** |
| 33 | Fallback branch before a big change, as a rule | `docs/STANDING_LATEST.md` rule 5 | the habit, not a rule | medium, S | **built (rule 5)** |
| 34 | One register of forks and design law (numbered, dated amendments, "don't re-litigate") | `docs/REDESIGN_C_FREEZE.md` | forks spread over four docs; two missing from the forks line (the vessels from Golden Core, Saturation by time); `design.md` J's eight forms against the code's three | medium, S | roadmap section 5 |
| 35 | One lore source | `lib/presets.js` briefs, the lorebooks | spread over five places | high, S–M | **built (`project/lore.md`)** |
| 36 | A research report format (short answer first, have-vs-source table, an "unverified" section, ready credits) | `docs/RESEARCH_2026-11-05_engine_accuracy_GLM_drift.md` | nothing | medium, S | **built (this file, with Selene's #10)** |
| 37 | A fixed order for checking numbers (design rule → `formulas.js` → the game; say when unverified) | `docs/C_PLAYBOOK.md` | "numbers first", no order; `reference.md` mixes dice-era lines | low-medium, S | roadmap section 2 |
| 38 | Times per activity (talk 10, meal 45, travel 75, sleep 480 …) | `lib/calendar.js` `ACTIVITY_MINUTES` | 375 choices on the default time (lint) | low-medium, S as a lint (M applied: balance) | roadmap section 2 |
| 39 | Faction standing rows (the Sect) | `lib/continuityMutators.js` `cmdFaction` | "Village" is a relationship row | low, M (save) | roadmap section 4 (step 4) |
| 40 | Perk templates and the "a perk only when the story pays for it" rule | `docs/PERKS_DESIGN_v1.md` | Insights planned, injuries not built | low, M | roadmap section 4 (step 4) |
| 41 | A four-line picture brief (shot / scene / placement / light) | `lib/looks.js` `BRIEF_FORMAT` | free-text prompts with cast cards | low-medium, S | roadmap section 3 |
| 42 | A list of the docs changed since the last upload to the project | `docs_sync.mjs` | by hand (rule 8) | low-medium, S | roadmap section 5 |

**Canon (K1):** the differences and the material that could be used are in `project/lore.md`, "Not adopted".

### Considered and skipped (the avoid list)

- **Need the queue (gone since v0.11.64):** the forecast and its hints, presets and preset rows, triggers, Undo, the queue as text, paste tips, one-shot rows, the insert point, best section runs, "Load queue", the pause before a forecast death, `nowWhy`, long-press copies.
- **Automation:** "All on / off" and automation at Practiced (rule D2 and "pause all automation" are already on the roadmap with the threads). Progressive reveal (P0, v0.11.72).
- **Already done:** the next-step line, closest cards, targets and the personal best (v0.11.72); act choices and rewinds (v0.11.26); the check runner (ours stops each job's process tree and keeps step times), the browser test, the old-save test, data integrity, the checksum and recovery, backups, the error bar, the tap guard, the export reminder, the redraw fixes; the restore-points workflow (identical to Selene's).
- **Already on the roadmap:**
  - What's new, the build label, the new-version notice, the resets (Selene's "build notes well formed" test comes with them);
  - Map / Mastery / Archive and the FAQ;
  - Android, `fontpack.py`, sound;
  - injuries, Qi bond flow, the emergency dantian, quest XP, equipment tiers, the threads, Yuki's ladder, the Ouroboros knockout beat, the status bar's deadlines (the engine's "Next: …", soonest two, is a usable pattern), the relationship ledger, `maxCalibratedDc`, the Bonesinger rungs.
- **Selene only:** the two-part legacy, stasis watches, death saves per slot, the "no ship days" rule, Selene's lore, the test speeds, a welcome-back note (there's no away time), hints / pins / favourites (the next-step line and lock reasons cover them), a static softlock test (the story test already fails on dead ends), game-icons.net icons (they clash with the ink look).
- **SillyTavern or AI only:** markers, commands, playIntent, socialBackfill, chatBoot, choiceButtons, choicePromptHistory, menuFallback, summaryClean, runaway, turnBlock, wiScan, npcWiPush, rawRequest, apiTest, modelSwitch, slashChatGuard, replyUndo, mcName, chargenReplay, timeline, canon pins, the status-block rewrite, appointments (it reads free text; our deadlines are written in); the sync, scrub, card, archive, PC-update, setup, play and update scripts (Termux and SillyTavern).
- **Covered, or skipped by the owner:**
  - the settled list (one-off choices already vanish, `oneoff.js`) and the corrections ledger (`MIGRATIONS`);
  - Bond shared checks and XP × GU tier (M and N, skipped 2026-11-05);
  - skill caps (the T10 L10 fork), the healing clock and the NPC registry (forks), convergence rank;
  - Temporal Weaving and Empathic Resonance (pillars James doesn't have);
  - XP pace as difficulty (the retune plans one harder difficulty);
  - chat splitting at 25% (rule 4 covers it) and version-name slugs.

## Group i — the games (next; not started)

*The list: Selene's `project/research.md` (five rounds, about 45 games with their licences), plus the games the owner names before group d. Each licence is rechecked at its repo before anything is reported; the table above gets one row per game. Same layout as group h: candidates best value first, an avoid list, and where each one went.*
