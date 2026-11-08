# Bone and Ash — research: what we take from other code and games

*New in v0.11.73 (group h, owner picks H1 + K1, 2026-11-08 17:54; the layout is Selene's `project/research.md`). Each research round gets its own section, newest last: what was read, every candidate (best value first), what was considered and skipped, and where each one went (built, on the roadmap, or nowhere). The licences table says what may be taken from each source. Credits for anything used go in `CREDITS.md` (code and ideas) or `art/bg/CREDITS.md` (paintings).*

## Licences at a glance

*Group i's rows: every licence rechecked at the repo's own licence file on 2026-11-08 (the last commit's date in brackets); all match Selene's table except the two noted.*


| Source | Repo | Licence | What we may take |
|---|---|---|---|
| Selene: Tidelocked (The Long Patience) | `hufle-beep/Long-patience` | the owner's own (owner 2026-11-08 16:48) | anything, freely |
| Rules Engine C and the SillyTavern setup | `hufle-beep/Shared-ST` (private) | the owner's own (owner 2026-11-08 16:48) | anything, freely; `js/core/formulas.js` is the engine's file, unchanged |
| Fonts: Literata, Shippori Mincho | Google Fonts | SIL OFL 1.1 | **used** (loaded from Google Fonts; to be embedded for Android: keep the copyright and licence, mind the OFL's reserved font names) |
| Background paintings | museum open-access collections | public domain / CC0 | **used** (`art/bg/CREDITS.md`) |
| Playwright | microsoft/playwright | Apache-2.0 | a dev tool only (`tools/browser.py`); nothing shipped |
| Idle Loops (active fork; the older fork) | `dmchurch/omsi-loops` (2026-10-29); `lloyd-delacroix/omsi-loops` (2022-08-05) | none in either | ideas only |
| Idle Loops Reworked | `Mopatissier/IdleLoopsReworked` (2023-05-01) | none | ideas only |
| wrtsc | `deifactor/wrtsc` (2022-10-07) | MIT (c) 2022 Ash | ideas; code with the notice |
| Immortality Idle | `immortalityidle/immortalityidle.github.io` (2026-11-05) | no licence file; the README asks derived code to stay open | ideas only |
| Progress Knight Quest | `indomit/progress_knight_2` (2026-09-25) | none; ships obfuscated code | ideas only, copy nothing |
| Progress Knight (original) | `ihtasham42/progress-knight` (2021-07-11) | Unlicense (public domain) | ideas and code |
| Cavernous II | `Nucaranlaeg/Nucaranlaeg.github.io`, `incremental/CavernousII` (2026-10-26) | BSD 2-clause (c) 2022 Sam Benner | ideas; code with the notice |
| Chrono Transcendence | `XanKeeTee/chrono-transcendence.github.io` (2026-10-28) | none | ideas only |
| Timestream Chronicles | `achappell/timestream-chronicles` (2026-05-10) | none; a Doctor Who fan game (no names or setting) | ideas only |
| Incremental Chronicles | `snipercup/Incremental-Chronicles` (2025-05-06) | MIT (c) 2025 snipercup | ideas; code with the notice |
| Idle Fishing | `Landon345/Idle-Fishing` (2026-07-30) | none | ideas only |
| A Dark Room | `doublespeakgames/adarkroom` (2025-05-23) | MPL-2.0 | ideas only |
| Candy Box 2 | `candybox2/candybox2.github.io` (2026-06-04) | GPL (the notice in `candybox2_sourceCodeLicense.txt`; no root LICENSE) | ideas only |
| Level 13 | `nroutasuo/level13` (2026-10-18) | Apache-2.0 (no NOTICE file) | ideas; code with the licence and a change note |
| Kittens Game | `nuclear-unicorn/kittensgame` (2026-11-07) | WET PAWS (no derivative works, no commercial use) | ideas only, copy nothing |
| Evolve | `pmotschmann/Evolve` (2026-06-19) | MPL-2.0 | ideas only |
| Shark Game | `Toby222/SharkGame` (2026-11-03) | MIT (c) 2022 the Shark Game team | ideas; code with the notice |
| CivClicker | `deathraygames/civ-clicker` (2024-01-24) | GPL-3.0-or-later | ideas only |
| Sandcastle Builder | `eternaldensity/Sandcastle-Builder` (2026-09-12) | a joke licence ("OTTer") | ideas only |
| Swarm Simulator | `swarmsim/swarm` (2024-08-27) | GPL-3.0 | ideas only |
| Space Company | `sparticle999/SpaceCompany` (2025-07-08) | MIT (c) 2017 sparticle999 | ideas; code with the notice |
| Bitburner | `bitburner-official/bitburner-src` (2026-11-04) | Apache-2.0 + Commons Clause | ideas only |
| Antimatter Dimensions | `IvarK/AntimatterDimensionsSourceCode` (2026-07-17) | MIT (c) 2017 IvarK | ideas; code with the notice |
| Trimps | `Trimps/Trimps.github.io` (2025-03-12) | GPL-2 (license.txt) | ideas only |
| The Modding Tree | `Acamaeda/The-Modding-Tree` (2024-10-28) | MIT (c) 2020 Acamaeda | ideas; code with the notice |
| Prestige Tree | `Jacorb90/Prestige-Tree` (2021-05-25) | MIT: its LICENSE is The Modding Tree's text, (c) 2020 Acamaeda (no Jacorb line; Selene's table said Jacorb) | ideas; code with the notice |
| Distance Incremental | `Jacorb90/DistInc.github.io` (2024-04-21) | MIT (c) 2020 Jacorb | ideas; code with the notice |
| Synergism | `Pseudo-Corp/SynergismOfficial` (2026-11-05) | MIT (c) 2019-2025 Platonic and Khafra | ideas; code with the notice |
| Gooboo | `Tendsty/gooboo` (2026-02-11) | GPL-3.0-or-later | ideas only |
| ZzFX; ZzFXM | `KilledByAPixel/ZzFX` (2026-11-02); `keithclark/ZzFXM` (2021-01-30) | MIT (c) 2019 Frank Force; MIT (c) 2020 Keith Clark | ideas; code with the notice (ZzFX only if sound is built) |
| game-icons.net | `game-icons/icons` (2026-04-23) | CC BY 3.0 per author; CC0 only where marked | not used (they clash with the ink look: group h, confirmed in group i) |
| Closed source: Increlution, Your Chronicle, Idling to Rule the Gods, Terraformental, Loop For A While, Chrono Bot, Space Loop Protocol, BIOTOMATA, Journey to Ascension, Echo Station, Loop Forge, The Aetherium Loop, Loopbound, Universal Reconstruction (Infinite Loop and The Loop Tree not found) | their store, itch.io and galaxy.click pages (`project/research/group-i-d-closed.md`, Sources) | closed | ideas only |
| *Group i, round 2 (E1):* the owner's games, plus Infinite Dao, Four Heavenly Valleys, Xianxia Simulator, Sky Realm Idle, The Reincarnation System | to be read | each its own; recheck before round 2 reports | ideas only, unless the licence allows code |

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

## Group i — the games, round 1: Selene's list (2026-11-08)

**What was read:** every game on Selene's list (`project/research.md` in `hufle-beep/Long-patience`, five rounds), read fresh for Bone and Ash (owner 18:19: "a very different game despite the same root"): Selene's notes were used only to see what she already took. 33 repos shallow-cloned and read (their code was never run); the closed-source games from their store, itch.io and galaxy.click pages. Four Opus helpers, one cluster each (A loop and RPG idles, B narrative and survival, C large incrementals and tools, D closed source), from one brief; Claude rechecked every licence (the table above) and the main claims against our code (the Coil bonus, `again.js`, the fights' enemy fields, the per-fight adaptation, the log's cap, the knowledge flags, Yuki's lane). Their four reports and the brief are kept word for word in `project/research/group-i-*.md` (the per-game notes, every source file and page, the full skipped and avoid lists, the unverified points). 52 candidates (#43–#94) after merging the overlaps (the same idea from several clusters is one row).

**Picked (owner 18:40, "I1, L1, E1"):** **I1**, docs only, the game unchanged: this section, the four reports, every candidate placed in the roadmap, marked *(new in v0.11.74, from group i)*. **L1**: the Coil-bonus finding (#53) a line in roadmap section 2, its fix decided with numbers in the retune. **E1**: the five cultivation games the helpers found go into round 2, with the games the owner names before group d. I2 (one cluster a push), I3 (the reports only), L2 (a fix push now) and E2 not picked. Nothing was built from these; each candidate gets its own options and pick in its group.

**Found in our code (#53, checked):** "Bite the tail" works from the first dawn (the arrival, the James tab), and every rewind adds 0.25 to the Coil bonus with no limit (`coilMult` in `game.js`, `coilActive` in `coil.js`): ten bites in a row give ×3.5 XP for a few taps, the only price the Coil count (targets, personal best). The bots never do it, so the numbers don't show it.

### Candidates (best value first; ideas only unless the licence column above allows code; value high / medium / low, effort S / M / L; "balance" and "save" mark what would move)

| # | What | Games and source | Bone and Ash today (checked) | Value, effort | Where it went |
|---|---|---|---|---|---|
| 43 | **Telegraphed moves:** a beast or boss shows a tell in the text one round before its big move; guard, the needle's stagger or the spear answers it in full | Immortality Idle `handleEnemyTechniques`; A Dark Room's enemy states; Gooboo's enemy skill cooldowns (`EnemyActive.vue`); Your Chronicle, Sky Realm Idle (pages) | enemies only attack; `prefersSmall` lunges at Yuki every third round, unannounced (`stepNoDice`); guard has no moment where it is clearly right | high, M; balance | roadmap group d |
| 44 | **Foes remembered across Coils:** each earlier meeting (or win) with an enemy kind starts the next fight at +0.5, up to +2, with a deadpan line | Idle Loops' Fight Monsters (× √(1 + times)); A Dark Room (learning by failure); Loop For A While v0.2.8 | the +0.5 per miss lasts one fight (`c.adapt`); `tasks.adapt` is kept across Coils but only for cards | high, S–M; balance, save (optional, or in `tasks.adapt`) | roadmap group d (tuned in section 2) |
| 45 | **Enemy traits as data**, each with a tag and one line on the fight screen (fast, plated, Qi-eater, regrows); one trick per kind (rot-crows steal a food item, mire-rats call one more rat); named variants (a mangy jackal, the pack's matriarch) | Trimps' modifiers and badges; Gooboo's traits; Immortality Idle `enemyAttack` effects (theft, heal allies); Level 13's enemy templates | `{hp, dc, atk, dmg, dr}` plus `prefersSmall`; the ~25 fights differ only by numbers | high, M; balance | roadmap group d |
| 46 | **Threads as lanes, built like Yuki's:** a woken thread holds one card James has at Practised, works on the game time his taps spend, never doors, story, fights or HP cards; priority tiers (Off / Low / Medium / High): when its card isn't on the screen it takes the next by tier, or idles with a line saying why; settings kept across Coils | Immortality Idle's followers (`followers.service.ts`); Increlution's priorities and ITRTG (pages) | threads undesigned since the queue went (v0.11.64); `yukiLane` / `yukiTick` in `tasks.js` | high, M–L; balance, save (optional `threads`) | roadmap section 4 (the threads' design talk) |
| 47 | **Standing rules for the threads:** eat when Fed is missing at least what the food restores, weakest food first; items kept in reserve; drop a tier when something runs out; rest before a fight at low HP; with medicines, one salve under an HP share, once a fight | Increlution and Terraformental (pages); Immortality Idle `usePouchItems()` | eating is a card; no rules | high, S–M; **changes death rates** (numbers first; the model bots need the same rules) | roadmap section 4, checked with section 2 |
| 48 | **A line picker for repeating texts:** the most specific line for the situation wins, a line already played this Coil drops out, a data test checks each pool covers its plays | Level 13 `DescriptionMapper`, `getTextKey` fallbacks, the dialogue "completed" filter | no shared picker; `again.js` hashes ~300 scenes into 24 `MEMORY_LINES`, so the same line shows several times in one Coil; group h's lint (#29) would measure repeats, nothing prevents them | high, M; save (a played list, optional) | roadmap group e (the first text-tools push, with #29) |
| 49 | **Story ladders per card:** 3–6 short texts per repeating card that unlock at milestones (first finish, Practised, Skilled, Mastered, a realm), kept across Coils, only the next locked one hinted; the card's name and a deadpan line move with its tier ("You could forage this slope in your sleep") | Idle Loops `storyReqs`; Immortality Idle's tiered activity names; Loop For A While's tier titles | about 27 work cards answer with nothing (roadmap e) | high, M (texts by Fable); save (seen ids) | roadmap group e (the repeating replies) |
| 50 | **Foreknowledge choices:** at 6–10 key moments, from Coil 2, a new choice because James *knows* (the arson night, Gao Feng's speech, the ford), kept as knowledge flags | Your Chronicle, Echo Station, Chrono Bot (pages) | 4 knowledge flags (`KNOW_TEXT` in `coil.js`); "You remember this" skips | high, M (writing); save (new flag names, additive); a small balance effect where one skips a fight | roadmap group e |
| 51 | **The Coil screen by cause and Coil count:** pools of texts per cause that don't repeat, Yuki's line varied, plus one line of facts ("The thornback bull, round 4, Day 11 14:20. HP 9 → 0.") | Shark Game `getVoiceMessage` (MIT); Candy Box 2's "who killed whom with what"; Terraformental v0.3.0 | five fixed texts (`WHY` in `coil_scenes.js`), the same Yuki line on every Coil screen; `coil.why` keeps the cause only | high, S; save (optional: the beast) | roadmap group e (texts), the recap with section 2 |
| 52 | **A fight lab (tool):** every fight under fixed tactics (each action, guard-heavy, all-out) at three stat snapshots; a table of win %, rounds and HP left; flags fights one tactic always wins or where guard never pays; the skill each fight needs | Antimatter Dimensions `dev.testGlyphs` (MIT); Kittens' `simulate-combat.js`; Level 13's danger bands | the models fight with one smart policy, the random bots at random (`tests/models.test.mjs`); `st.fights` counts wins only | high, S–M; tool only | roadmap section 2 (before group d) |
| 53 | **The Coil bonus can be farmed** (found in our code, above): fixes to choose with numbers: (a) it grows only on a Coil that got further (a later day, arc or realm); (b) relearning by each skill's own best (as relationships keep 25% of the peak); (c) fast learning only up to the last Coil's peak | Chrono Transcendence (only new records count, `docs/INFORME_TECNICO.md`); Progress Knight `getMaxLevelMultiplier` (Unlicense); Immortality Idle's aptitude; Infinite Dao (page) | `coilMult` = 1 + 0.25 × (Coil − 1), no cap, a bite at the first dawn counts | high (before the retune), S; balance, maybe save | roadmap section 2 (L1) |
| 54 | **Gear that adds a move:** each crafted piece a passive plus an action with a cooldown in rounds ("Brace", "Yuki's bell") | Gooboo's equipment | crafting not built (the handover's Loot: three slots); the Convergence forms change on their own (`hasForm`) | high, M–L; balance, save | roadmap section 4 (crafting, with group d) |
| 55 | **Compost the gear at a rewind:** gear lost on a rewind feeds a capped bonus per slot, "next at" shown (fits "compost and try again") | Antimatter Dimensions' glyph sacrifice (MIT) | gear and the hammerspace lost; Coil marks the only kept bonus of that kind | medium-high, M; balance, save | roadmap section 4 (step 4) |
| 56 | **A bestiary in the Archive:** James's field notes per beast and foe, numbers shown after the first win, region sets | Gooboo's card collections | `stats.kills` is one total | medium-high, M; save (optional) | roadmap section 4 (Archive), texts in group e |
| 57 | **The Journal stored as ids** ({scene, Coil, kind}), drawn from the scene's current text when shown, merged across Coils (how old entries read in the new wording after the rewrite) | Idle Loops `actionLog.js` | text entries, the newest 200 (150 after a rewind) | medium-high, M; save (optional field) | roadmap group e (with group h's #19) |
| 58 | **Stances**, remembered from earlier Coils (Rooted, Flowing, Striking), unlocked as Insights | Trimps' formations | guard is a per-round action | medium-high, M; balance, save | roadmap group d |
| 59 | **Village happenings between cards** at Ashfall, picked by the save's seed, some paying back days later | A Dark Room's event pool and the Mysterious Wanderer; Evolve's event pools | the Wilds' nights only (`night_event`); Ashfall evenings by `nextEvening` | medium-high, M–L; balance | roadmap group e (with section 2) |
| 60 | **Yuki's take on her jobs:** each job rises a level per Coil, with its own text and effect and a "Next: bond 40" line | Idle Loops Reworked's squirrel mode | Yuki's jobs bring hauls (v0.11.71's switches); no levels | medium-high, M; balance, save | roadmap group e (Yuki's forms) and section 4 |
| 61 | **Favour across Coils:** a share of each Coil's peak relationship builds a favour that speeds later gains with that person | Bitburner (reputation to favour at a reset) | max(snapshot, 25% of the last Coil's peak); Yuki kept whole | medium, M; balance, save | roadmap group e (whose relationships), numbers in section 2 |
| 62 | **A threat word on fight choices** ("risky", "deadly"), from the fight lab's numbers; the owner's call against "cards show no odds" | Level 13's danger bands | `choiceTag` shows "fight"; numbers only with Show checks | medium-high, S–M | roadmap group d (the owner decides) |
| 63 | **Unarmed mastery by count** of rounds fought bare-handed | A Dark Room's punch perks | no unarmed fights yet (group d) | medium, S; balance | roadmap group d (the unarmed fights) |
| 64 | **Sung-bone weapons that need rounds to sing again**, not only Qi | A Dark Room's weapon table (cooldowns, as rounds) | Qi costs only; blade and spear formed once | medium, M; balance | roadmap group d (the weapons by Convergence) |
| 65 | **Weapon familiarity:** each fight action gains familiarity kept across Coils | Gooboo's mastery (kept, unlike Gooboo's) | fight actions have none | medium, M; balance, save | roadmap group d (with #44) |
| 66 | **Feed the blade:** one item per slot with a grade; a workshop card sings bone into it | Immortality Idle `mergeEquipment()` | crafting not built | medium, M; balance, save | roadmap section 4 (crafting) and group d |
| 67 | **Recipes found at places:** region bosses and a few explorations drop recipe pages (kept as Insights) | Trimps' upgrade books | recipe sources not decided; `lizard_spine`, `bone_meal`, `beast_core` already drop | medium, S (design) | roadmap section 4 (crafting) |
| 68 | **A hub line that follows the act's progress** | Shark Game's home messages | `fo_ashfall`: the same lines every day of the act | medium, S | roadmap group e |
| 69 | **Lines only loopers see**, at Coil and realm thresholds | Bitburner's late messages | the arrival's Coil line; `MEMORY_LINES` | medium, S–M | roadmap group e |
| 70 | **A person has something to tell you:** a mark on a person's talk card after a story beat | Level 13 | talk cards are daily; later talks repeat | medium, S–M | roadmap group e (with #48) |
| 71 | **Text read for the first time ever** marked, once repeating scenes have sequences | Terraformental v0.4.0 | `g.seen` per scene (the fold), not per text | medium, S; save (optional) | roadmap group e |
| 72 | **Feats:** goals inside a normal Coil, no power rewards, greyed out once they can't be met that Coil | Trimps' feats; Antimatter Dimensions' secret achievements (in-fiction only) | the personal best only | medium, M | roadmap section 4 (Archive) |
| 73 | **The deadline always readable** with its progress: "Tribute: Day 7 dawn · 2 d 6 h · 9 of 12 primaries" | Terraformental (pages) | the status bar's clock; the deadlines planned | medium, S | roadmap section 4 (game UI, with the deadlines) |
| 74 | **Yuki's notes:** the unfolding FAQ partly in Yuki's voice | Antimatter Dimensions' how-to-play (the shape only) | FAQ planned, not built | medium, S–M | roadmap section 4 (FAQ) |
| 75 | **A "firsts" table** for the models: the Coil and day each first is reached (first tribute won, Foundation, each arc's boss) | wrtsc `speedrun.ts` `benchmark()` (MIT) | the models' digest | medium, S | roadmap section 2 (with group h's #3) |
| 76 | **A woken thread's domain is the player's pick** of three of the 9 domains | Idle Fishing's crew offers (a fixed version) | the 9 domains named, not built | medium, S | roadmap section 4 (threads) |
| 77 | **Vows:** optional harder Coils with a lasting reward; the owner skipped challenges for Selene, so only after the retune | Trimps' Slow challenge; The Modding Tree's challenge format; ITRTG | one difficulty, a harder one planned (D-a) | medium, L | roadmap section 2 (after the retune, the owner's call) |
| 78 | **Memories:** replay a key scene already seen from the Archive, read-only, with its picture | Immortality Idle `triggerMemory()` | nothing | medium-low, M | roadmap section 4 (Archive) |
| 79 | **Crafting spoken by whoever teaches it** (each recipe's lines in its teacher's voice) | A Dark Room's builder | crafting not built | medium-low, S | roadmap section 4 (crafting) |
| 80 | **An endings list**, "x of 4", in the Archive | BIOTOMATA's endings gallery (page) | `story.test.mjs` counts endings; the player sees none | low-medium, S | roadmap section 4 (Archive) |
| 81 | **Model players from small rules** (a Fighter, a Romancer, a Thread user) as priority lists | wrtsc `agent.ts` (`first`, `when`; MIT) | Careful, Completionist, Rusher | low-medium, M | roadmap section 2 |
| 82 | **Hunger you can read:** a line as Fed crosses 50 / 25 / 10 / 0 | Level 13; A Dark Room | "You are hungry." under 30 at Ashfall; "Starving: −N HP" | low-medium, S | roadmap group e |
| 83 | **Scratch Yuki:** a small action on camps and hubs, one line a tap, by form | Evolve; Gooboo | nothing | low-medium, S | roadmap group e (Yuki's forms) |
| 84 | **"Limits you have hit":** the caps James has met, in the FAQ or the James tab | Antimatter Dimensions' caps notes | caps in code and docs only | low-medium, S | roadmap section 4 (FAQ) |
| 85 | **Lore boxes on the Map** per arc | Trimps; The Modding Tree's tree | Map tab planned | low-medium, S | roadmap section 4 (Map) |
| 86 | **Sound in an ink palette** (a wooden tok, a plucked string, a singing bowl), few and quiet | ZzFX (MIT, with the notice; Selene's) | no sound | medium when wanted, S–M | roadmap section 5 (Sound; the owner listens first) |
| 87 | **Separate random streams**, one seed per purpose (night visits, story events) | Antimatter Dimensions; Trimps | one `g.rng` for 8 call sites | low, S | roadmap section 2 (tools) |
| 88 | **"This Coil is spent":** one note when the deadline can't be met any more (needs a sound bound or it misleads) | Journey to Ascension (review) | nothing | low-medium, M | roadmap section 2 (after the milestone table) |
| 89 | **A second open copy can't overwrite the save:** the first saves and goes read-only with a note | Chrono Transcendence (BroadcastChannel) | nothing | low-medium, S | roadmap section 4 (saves) |
| 90 | **Per-card hunger weight:** heavy cards drain more Fed than light ones | Timestream Chronicles `entropyWeight` | Fed −3/h for everything | low-medium, S; balance | roadmap section 2 (a knob) |
| 91 | **Hunting grounds thin out** a little with each use in a Coil, regrowing by the day | Idle Loops' dungeon odds (as a fixed fall) | fixed yields | low, S–M; balance | roadmap section 2 (a knob) |
| 92 | **Snobbery:** lower grades composted on pickup once a better grade is held | Immortality Idle `autoSellOldHerbs` | crafting not built | low, S | roadmap section 4 (crafting) |
| 93 | **A great work inside one Coil:** a multi-day project lost on a rewind unless finished; once finished, kept | Immortality Idle's impossible tasks | nothing | low, M | roadmap section 5 (Act 2) |
| 94 | **An heirloom:** one sung item survives a rewind | Immortality Idle `heirloomSlots` | gear lost on a rewind (the owner's Loot pick) | low, S; save | nowhere, unless the owner reopens Loot |

*Placeholders:* every number above (+0.5 a known foe, the thresholds, the tiers) is a shape, not a tuned value; nothing was simulated. Each goes through its group's options, with the numbers, before anything is built.

### Considered and skipped (the avoid list; the full lists per cluster are in the four reports)

- **Need a queue or a timer (gone since v0.11.64):** Idle Loops' predictor and loadouts; Cavernous II's routes, clone sync and saved queues; wrtsc's queue editor; Timestream's Sequence Buffer; Chrono's "when X, do Y"; Increlution's queue; Loop For A While's route panel; Space Loop Protocol's auto-repeat; Your Chronicle's templates; Echo Station's planned route; A Dark Room's cooldown buttons and event clock; Evolve's falling event timer; Level 13's real-time fights; Gooboo's horde ticks and respawn timers.
- **Random rolls (no dice since v0.9.3):** Immortality Idle's generated techniques; Incremental Chronicles' best-of-three combat; soulstone, heirloom and glyph rolls; Trimps' crit and dodge; Gooboo's card packs; A Dark Room's scene odds and loot chances; Candy Box 2's P potion; Idle Fishing's random Mastery offers; Chrono's Eureka bursts. Only their fixed shapes were kept (#45, #76).
- **Don't fit a story game on a phone:** Immortality Idle's homes, furniture, land, wages and followers who leave; Chrono's rent and eviction; Idle Fishing's real-time minigame; A Dark Room's world map and outfitting by weight; Candy Box 2's ASCII quests; Level 13's sectors; Trimps' Spire; Gooboo's classes, relics and glyphs; Synergism's corruption levels; auto battles and summoned teams (Your Chronicle, Sky Realm Idle); clones replaying past loops (Loop Forge); karma shaping the next body (Four Heavenly Valleys); chapter reordering (Increlution).
- **Sprawl or prestige layers (Selene's avoid list):** Immortality Idle's yin-yang, elements, divinity and pantheon; Progress Knight Quest's five layers and dark matter; Chrono's Karma tree; Bitburner's purchased-now-applied-at-reset augmentations (Insights and Coil marks cover lasting gains); exponential multipliers anywhere.
- **Already there, planned or skipped by the owner:** Selene's picks (backups, NaN guard, FAQ search, catch-up, history, export names, checksum, stat breakdown, backup reminder); the life summary and statistics (the Coil screen); familiarity tiers with names and shared familiarity; "End it in one move"; the stalemate cap; four Act 1 endings; faction standing rows (group h #39); the Automator and news ticker (skipped); ITRTG and Trimps challenges (see #77); game-icons.net (confirmed: flat silhouettes read as game UI next to the ink plates); ZzFXM music (James's music is described, never played); A Dark Room's cache of the last game's stores (the hammerspace resets by design); faction lock-outs (they'd fight "every branch reachable across Coils").
- **Nothing for us:** Swarm Simulator, Sandcastle Builder, Space Company, CivClicker beyond the above; Universal Reconstruction and The Mana Tree (prestige trees with no loop story).

**Patterns to avoid (seen there):**
- Bonuses farmed by resetting at once (ours today: #53); carry-overs that feed themselves in the same run (settle them at the rewind).
- One random or hashed line per event with no played list (repeats are guaranteed: ours in `again.js`); flavour that doesn't progress; text that ignores the world state (story tests should walk a scene in each state it can be reached in).
- Shown numbers that drift from the code (take them from the data and test it); odds as percentages to the player; hidden punishing stats; tooltips only on hover, or a status shown only as a colour (telegraphs must be in the text, for the phone and screen readers).
- Automation that fails silently, runs into danger, or resets its settings every loop; unlock thresholds that take dozens of tries; auto-resolve firing too early ("End it in one move" stays at crushing only).
- A companion lost or killed by a mechanic (Yuki never leaves); treadmill economies (wages, rent); many overlapping currencies; power rewards for achievements; date events and premium currencies; secrets that need out-of-game actions; flashing colour effects.
- Huge data files without tests (any text pool gets its test on day one); obfuscated code (Progress Knight Quest: copy nothing); fan IP (Timestream Chronicles is a Doctor Who fan game).

### Unverified (details in the reports)

- No game was run; the closed games from their pages only. Not found: Infinite Loop, The Loop Tree. Matched by name only: Loop Forge (alexisgelin), Universal Reconstruction (galaxy.click 473). Blocked or failed: Increlution's Steam store page and wiki, Terraformental's Steam page, the Your Chronicle wiki, Ascending the Dao. Increlution's priority levels and "8 completions to automate" are player claims.
- Gooboo's cooldown display read in code, not seen; Trimps' universe 2 texts and feats not traced; Kittens' `simulate-combat.js` read in its header only; Bitburner's faction favour formula not opened; Candy Box 2's quest texts and A Dark Room's `doc/Events.xlsx` not read; Idle Loops Reworked's "a level per loop" from its changelog and one check; ZzFX not heard (the owner listens first).
- The Coil-bonus farming (#53) read in the code, not played through.

## Group i, round 2 (before group d; E1)

*The games the owner names before group d, plus the five cultivation games round 1 found (all closed: ideas only): [Infinite Dao](https://compreesion.itch.io/infinite-dao), [Four Heavenly Valleys](https://ttr0511.itch.io/four-heavenly-valleys), [Xianxia Simulator](https://captainwabbit.itch.io/xianxia-simulator), [Sky Realm Idle](https://store.steampowered.com/app/1580820), [The Reincarnation System](https://rasmuskoit.itch.io/the-reincarnation-system) (an example to avoid: its hazards give too little feedback). Looked at and not listed: The Mana Tree, Myriad Realms, Idle Xanxia, Dao of the Endless Sky, Chronicles of Cultivation, Cultivation Quest, Fated Cultivation Idle. Same layout; licences rechecked first; the brief in `project/research/group-i-brief.md` can be reused.*

Sources (round 1): the repos in the licence table; the closed games' pages in `project/research/group-i-d-closed.md` (Sources); Selene's notes: `hufle-beep/Long-patience`, `project/research.md`.
