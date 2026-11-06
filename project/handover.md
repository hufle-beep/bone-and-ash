# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-06 (Europe/Budapest). **Version:** 0.11.16 (`sw.js` VERSION `bone-ash-0.11.16`): C1, the relationship catch-up (×3 gains below the best-ever value), and the 5 leftover Cultivate choices hidden off the resting places; on top of 0.11.15: B1-b, speed by use (every card, the sit, meridian work and the breakthrough speed up with their own use, up to ×10; the Coil bonus on XP only); on top of 0.11.14: Meditate only on the 13 resting places (the 6 task screens and Act 1's 7 resting scenes), its cards queueable there; on top of 0.11.13: the meridian screen gone from Incremental Mode (each meridian line is its own Meditate card, queueable on the task screens: primaries, collateral groups, and later the Extraordinary vessels, their collaterals and the junctions), and the Coil on every save line; on top of 0.11.12: a queueable Cultivate sit on the task screens without one of their own, and the queue shown first, then all card groups together; on top of 0.11.11: the copy-over push 4b (bars that slide and redraw only on change; hold a card for its tooltip; a screen-reader announcer, progress values, reduced motion; each tab keeps its scroll and opened Results stay open); on top of 0.11.10: the copy-over push 4a (updates arrive on the first reopen; checks hidden on every card and result line, with a Show checks switch; a Selene-style main menu on plain paper with Saves and Settings, text size 90–130%, the Saves tab now ☰ Menu); on top of 0.11.9: the copy-over push 3, saves (share a save to GitHub without a token, Export all / Restore all, an export reminder, a Backups list in the Saves tab, "Copy status as text" with a pause log; no save-format or balance change); on top of 0.11.8: a closing tab never writes over a newer save from another tab, and the browser test made reliable (10 / 10, plus a two-tab check); on top of 0.11.7: tests and tools, the copy-over push 2 (a browser test with real taps in both modes, a data-integrity test, four fresh test saves from today's version, a log-only content lint, the workspace gotchas; the game is the same as 0.11.5); on top of 0.11.6: docs only, rule 1 clarified (a go covers one push; stop after every push); on top of 0.11.5: the safety push (the offline file list fixed and checked, save when hidden and every 15 s while a card runs, a running card's bar kept across a reopen, a version check, the engine's own 126 formula tests; the game plays the same); on top of 0.11.4: forms 3b (Incremental Mode: damage by form, Guard by defence form, the spike field, shield cover for Yuki, the bone spear in a new Reach line); on top of 0.11.3: the mechanics sanity check (hard rule 2: after every build, before the docs, the full `check.sh` ends with `tools/sanity.mjs`; tools only, the game is the same as 0.11.2); on top of 0.11.2: timed cultivation, the base redesign push 2 (Incremental Mode: a sit is an hour, Saturation by hours, 10 h × 2^realm ÷ the Coil bonus; meridians by hours of work, no daily limit, no fail, XP once per channel, locked below Fed 20; the breakthrough a timed, queueable card); on top of 0.11.1: tests and tools only (the bot games split across cores with a seed per game, `check.sh quick`, `tools/bots.mjs`; the game is the same as 0.11.0); on top of 0.11.0: the base redesign, push 1 (each rewind starts James's and Yuki's realm, skills, Saturation and meridians over; the Coil bonus ×(1 + 0.5 × earlier Coils of the act) makes them come back faster); on top of 0.10.4: Bonesinger forms (four lines unlocking by Convergence Use rank; only what James can sing shows in fights and choices; the fragile knife breaks), Tasks renamed **Incremental Mode** and Classic **Story Mode**; on top of 0.10.3 (docs only: the handover split) and 0.10.2: paused by default and on every new scene (a tapped card runs once, then pauses), the camp as a task screen, waiting for a time of day happens at once; on top of the Long Forest in task mode (from Coil 2 of the prologue, one season = +1 realm, up to Heavenly Immortal), on top of queue planning with Selene's forecast (run now / + to queue, ↑↓✕, Clear, meridian sessions in the queue, a death row and a pause before it), starving 1.5 HP an hour in task mode, rest and sleep at once; on top of the clock with seconds (v0.9.9), Tasks on by default and the speed gate (v0.9.8, push 4 of 4, 3c-3), on top of severe difficulty in task mode (v0.9.7, push 3 of 4: HP 0 or a lost beast fight ends the Coil, beasts +0.5, tribute +1), on top of meridians closed at the start and Act 1's Coil (v0.9.6), every screen as cards (v0.9.5: story choices with bars, every choice takes time, the Meditate card everywhere), the Coil (v0.9.4) and no dice anywhere in task mode (v0.9.3) and step 3b. Tasks is now the default mode (Saves → Game mode: Tasks or Classic). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual design notes, the Act 1 overview) **`project/history-3.md`**, **`project/history-2.md`** and **`project/history.md`** (older decisions and version notes, newest first; part 3 is the newest). All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3):** this file holds the decisions and version notes of the **last three versions**; each push moves anything older to the top of the newest history file (now `project/history-3.md`, started with v0.11.11 when part 2 reached about 45 KB). When it passes about 45 KB, the next part starts (`history-4.md`). Every doc stays small enough to upload to the claude.ai project straight from the file.

## Decided in chat (2026-11-06)

- **v0.11.16: C1, the relationship catch-up, and the leftover Cultivate choices (owner 19:42 "procceed" → C1 numbers; 19:45 "one more thing. this is a leftover also" (a screenshot of `meditate1` on Day 1 with "Condense: one sit…" as a story card, 1 h 20 m); options; 19:48 "go with your recommendation" = C1-a + leftovers a, together, and the go; drift shown; 19:58 "OK" = the baseline update; built in v0.11.16):**
  - **Found:** there was no "best-ever" value: the Coil keeps only the last Coil's peak (the 25% head start). The relationship gates: the prologue kiss (Mei Lin affection ≥ 8), the tribute bluff (+1 at Village friendship ≥ 40), Act 1 Ya's night (Ya affection ≥ 10), the romance paths (`likesMei` Mei Lin affection ≥ 60, `likesYa` Ya affection ≥ 85), a few texts (Mei Lin friendship > 10, Ya ≥ 20).
  - **Numbers (scratch copy, 1,000 games each; at the end of Act 1, today / ×2 / ×3):** Mei Lin's path open C1 / C2 / C3 57 / 51 / 61% → 59 / 87 / 90% → 59 / 89 / 97%; Ya's 55 / 84 / 81% → 57 / 97 / 91% → 57 / 98 / 94%; Mei Lin romance happened C2 / C3 37 / 47% → 55 / 60% → 56 / 68%; average affection C2 Mei Lin / Ya 72 / 109 → 96 / 131 → 102 / 136. The prologue barely moves (low gates; most Coil 1 bots die before Mei Lin, so their best is low); deaths, the tribute and the fights unchanged.
  - **C1-a (built):** in Incremental Mode, while a person's friendship or affection is below its best-ever value, gains count ×3 until they reach it, then ×1; losses never multiplied; Yuki never (she is never reset); the 25% head start stays. The best-ever values live in `g.coil.best` (kept by the rewind and carried into Act 1 by `startActCoil`); an old save starts from the Coil's peak. Mei Lin, Ya, the Village, Old Wen and Mei Lin's mother. Story Mode ×1.
  - **Leftovers a (built):** besides the 13 resting places, 5 written Cultivate choices were still on story screens: `meditate1` ("Condense: one sit…", and its line "You could keep going: condense…"), `night` ("Cultivate first — one sit — then sleep."), `night_event` (the rain night), `fo_night` ("Cultivate one sit before sleep."), `heart_camp` ("Cultivate by the fire…"). Hidden in Incremental Mode; Story Mode keeps them. Each screen keeps a way on. Measured: prologue deaths 1–3 points lower, tribute C4 won 63 → 74% (n 187).
  - **The check:** the full check drifted 2 numbers (tribute C4 won 64.8 → 70.6%, paid 34.7 → 28.9%), the leftovers' expected effect; all tests and invariants passed. Owner "OK" → baseline updated; full check again: all passed (exit code 0), 0 drift.
  - **Next, picked (19:58 "1a"), not built yet — v0.11.17, its own list and go:** hide every card that can't run right now (the "done for today" cards, the collaterals until 2 primaries are open, locked Meditate cards: hunger, Qi, Break through not ready; queued rows stay in the queue); plus the bug found on the owner's 19:55 screenshot: work cards still show the check outcome ("→ partial", "→ fail", "→ full") since v0.11.10, because the filter only knows "passes / partly / fails"; the fix strips those too and the browser test fails on them.
- **v0.11.15: B1-b, speed by use (owner 19:05 "procceed" → B1 bot numbers on a scratch copy; options B1-a / B1-b / B1-c, pick 19:12 "your recommendation is ok" = B1-b with N 18 / 30 / 30 / 6; the list; go 19:22 "go for 11.15"; mid-build stop (rule 2) on 29 invariants + 32 drift; options a / b / c, pick 19:32 "a"; built in v0.11.15):**
  - **The bot numbers that decided it** (1,000 games each, scratch copy; prologue dead before Mei Lin C1–4 · tribute won C1–4 · Act 1 dead C1–4): today 88/67/44/27 · 43/49/64/67 · 50/46/38/40; bots taking the new cards, rules unchanged 90/71/61/48 · 59/60/67/73 · 21/39/44/36; **B1-a** (no Coil bonus anywhere) 79/72/72/75 · 57/52/55/49 · 77/89/96/97 — later Coils no longer get easier, because skills start over every Coil and the Coil bonus on XP was what brought them back; **B1-b** (Coil bonus on XP only), N 18 everywhere 79/63/58/47 · 57/59/59/62 · 29/37/40/25, N 30 for the sit and meridians 79/64/57/51 · 61/61/62/63 · 28/39/36/23. Speed alone doesn't raise the realm: the random bots run out of Qi before time. **B1-c** (XP by familiarity instead of the Coil count) was offered, not measured.
  - **B1-b (built):** speed = 1 + 9 × (uses ÷ N), up to ×10, kept across Coils. Cards N 18 from the familiarity count (= the tiers' ×2 / ×5 / ×10 at 2 / 8 / 18; the names and DC steps stay; Yuki's job too). The sit N 30 (an hour ÷ speed, one use per sit, on every screen including Act 1's written Cultivate choices; same Qi and Saturation). Meridian work N 30 (a sitting does its minutes × speed; one use per sitting). Break through N 6 (2 h × (realm + 1) ÷ speed). Uses in `g.tasks.use['act:sit' | 'act:mer' | 'act:bt']` (not in `fam`, which the Coil screen counts as card tiers), kept by the rewind; old saves start at 0. The Coil bonus leaves Saturation, meridian hours and breakthrough time; it stays on XP (James, Yuki's Qi Use, Yuki's fights). Holding a Meditate card shows "Familiar: ×N (uses)". Story Mode unchanged.
  - **The bots (picks b and i end):** they take the queueable sit and the meridian cards (task screens: queued; Act 1's resting places: tapped). The old meridian-screen door is gone from `runMed`.
  - **Mid-build stop (rule 2):** the full check failed 29 invariants (the sanity check's own formulas for the old Coil bonus on Saturation, breakthrough length and the first primary's sitting, Coils 2 / 3 / 5) and drifted 32 numbers: tribute C2 won 47.9 → 58.6%, lost 15.1 → 8.8%; night fights smart crows 50 → 21%, lizard 47 → 23%, rats 38 → 20%, random crows 40 → 19%, lizard 37 → 21%, rats 24 → 14%; rot-ape (random) 90 → 78%; Sect watcher 70 → 80%, Guardian 91 → 100%, wolves 81 → 90% (random); 12 more fights 5–9 points. **Why the night fights dropped** (scratch, crows smart): today 50%, bots taking the new cards with today's rules 26%, B1-b on top 22%: mostly the random bots queueing sits and walking into the night without Qi. **Pick a:** the invariants rewritten for speed by use (no Coil bonus on Saturation; breakthrough = 2 h × (realm + 1) ÷ speed; the sit's and the first primary's sitting ÷ speed; Story Mode ×1 with uses set), baseline updated; full check again: all passed (exit code 0), 0 drift. **Note for step 5:** check the night fights (crows, lizard, rats) with sensible bots.
  - **GitHub Pages (19:13, owner: "still 11.13"):** the 0.11.14 deploy failed on GitHub's side ("Deployment failed, try again later"; build fine, the deploy step held in the queue, then failed; others reported the same on GitHub's forum); a re-run at 19:14 failed the same way; a scheduled retry was set for 19:37; this push starts a fresh deploy.
- **v0.11.14: Meditate only where James rests, queueable there (owner 18:47 "not queuable on first screen on new game" (a screenshot of the arrival); options a / b / c, pick 18:48 "a" (a queue on every screen, Meditate cards only); the exact list, go 18:49; build stopped before any edit at 18:50 "maybe meditation should only be available in hubs..."; bot numbers and options A / B / C; pick 18:53 "A"; the list, go 18:55; drift shown, "ok" 19:01 = the baseline update; built in v0.11.14):**
  - **Found:** Act 1 has no task screens (they are `camp`, `stream`, `wilds`, `village`, `ashfall`, `lf_hub`); its resting places `fo_ashfall`, `rr_hub`, `dw_hub`, `ah_hub`, `heart_hub`, `rt_camp`, `rt_ashfall` are story scenes with their own written Cultivate choice. Option B (the 6 task screens only) would have left Act 1 without meridian work or Break through until roadmap step 5.
  - **A (built):** in Incremental Mode the Meditate card shows only on those 13 resting places (`MED_SCREENS`; still not on the urgent screens). On all 13 its cards (the sit, the meridian lines, Break through) can be queued: tap = now, + = queue, with the queue and the forecast above the cards; on Act 1's 7 only Meditate cards queue, their story choices stay tap-only. Story screens (the arrival, talks, events) have no Meditate. A row for another screen waits: the queue holds there (nothing skipped or lost; the forecast says "after the story") until James is back where it runs. Break through queued on an Act 1 resting place comes back there without its enter. Task screens work as before. Story Mode unchanged.
  - **Numbers (pick made on the scratch copy's 1,000 games; the full check's 2,000 below):** the random bots meditate only where Meditate shows now, so Act 1 moved; no rule or number in the game changed. Drift (7 of 202): Act 1 C1 dead 61.3 → 51.2%, C4 dead 30.3 → 39.6% (n 230); beast share of Act 1 deaths C2 25.4 → 32.2%, C3 21.2 → 28.4%, C4 23.0 → 30.9%; fights Guardian (smart) 85.1 → 90.2%, lizard (random) 44.3 → 37.4%. The prologue's deaths and the tribute stayed within 5 points. Owner "ok" → baseline updated; full check again: all passed (exit code 0), 0 drift.
  - **Tests:** Meditate on exactly the 13 and nowhere else; on `rt_camp` the primary and the sit queue, only Meditate cards are cards, the forecast = reality, a `stream` row waits (and every row after it) and runs once back on the stream; no queued work on a story screen; Break through from `rt_camp` comes back without the enter. Browser test part 8: no Meditate on the arrival, + on a Meditate card on the stream adds a queue row.
  - **B1:** built in v0.11.15 (see above).
- **The pivot: copy what is useful from Selene and Rules Engine C (owner 15:33 "analyze the entirety, every aspect of the Selene and the Rules Engine ST project, for anything at all you can use to make any part of this project better. that includes both the game and the process too"; 15:43 "the pivot is this the analysis and copying of features. safety push, then proceed with all except the lore differences."; 15:47 "a, skip the whole lore list, note it in the roadmap. go for the rest."; built so far: v0.11.5):**
  - **The analysis** (two read-only reviews of `hufle-beep/Long-patience` and `hufle-beep/Shared-ST`, checked against the code): the full list and the order of pushes are in `project/roadmap.md` ("The copy-over"). Each push still gets its confirm; balance pushes show their numbers first.
  - **Found and confirmed in Bone and Ash:** `sw.js` FILES missed `js/core/forms.js` (since v0.10.4; it worked offline only because the first online load cached it); nothing saved when the app was hidden, and a running card restarted from 0 after a reopen (a 28 h breakthrough or a Long Forest season); the bar width is set 10 times a second (a reflow each time; the UI push). `js/core/formulas.js` is identical to the engine's current file (0.1.223; 0.1.220–0.1.223 changed other engine files only); the engine's own `formulas.test.mjs` passes 126 / 126 on our copy.
  - **Skipped (owner pick a, 15:47): the whole engine-canon / lore list**, kept as forks: a breakthrough refills HP and Qi (the engine doesn't); Yuki starts at F0 A0 (canon root-kin F120 A5); `bumpRel` steps above the engine's +3 F / +2 A per beat (63 of 254 calls); healing every fight round from Immortal Ascension (the engine: after 2 turns without damage); Story Mode's meridian sessions check and pay XP (the engine: no check, 0 XP); Yuki's eyes "gold" in `yuki_path.js` (spec: yellow). Doc drift to fix when those docs are next touched: design.md's rule K says "first try −2" (the code: +0.5 a setback, up to +2); "dampening on every Qi cost" (canon and the code: techniques only).
  - **Lessons taken over** (from both projects' docs): a named fallback branch before a redesign; migrations only fill missing fields, never "restore" values; old handover notes move to history word for word; new checks run log-only first; one balance knob per push; automation (auto-eat, threads) never runs ahead of queued work the Coil can afford (Selene's rule D2); a renamed DOM marker once stuck every Selene player at the first death (hence the browser test).


## Open decisions for later steps

- **Serpent (D, owner 09:44, v0.9.9): folded into step 5** (Act 1 converted and retuned). Measured (600 random task-mode games, closed start, rewinding bots): every game reaches the ford (mostly on Act 1 Coil 3–4); the ford check (GU / Convergence DC 5, no-dice 3) vs GU check 9.5 / 13.5 / 19.0 (p10 / 50 / 90) is always passed, so **0 serpent fights in 1,500 games** (it woke 4 times; James outran it each time). Arrival HP 80–100%, so "arrives hurt" is not the lever any more. A forced fight: serpent `up` 0.25 (now) 100% won; +10: 73–97%; +16: 51–92%; +18: 33–90%. Ford DC 12 wakes it in 10% of games, DC 15 in 23%. The options for later were: B (ford DC 15, serpent +16, a loss ends the Coil), C (the same, but a loss keeps the "Swept" branch).
- **The serpent (`rt_serpent`):** measured in v0.9.3: dice 84%, no dice ~54% (78 meetings in 8,000 games); its tuning value changes nothing, because the outcome is decided by how hurt James arrives. Making it a real threat needs another lever (more damage, or James arriving weaker): a 3c item, numbers to the owner first.
- **Loot (owner's question 00:06, pick 00:08: "go with your recommendation"):** option 1 plus a little of 2. **Bone-work crafting:** cores, fangs, bone-meal and ship shards become gear in three slots (blade, wraithbone armour, a charm) and medicines (bracket salve); crafting is workshop task cards; on a rewind the gear is lost but the **recipes are kept (as Insights)**. Plus **cores as the world's currency** (bribes, tribute). Scheduled in step 4; the recipe list and numbers go to the owner before anything is built.

## Decided in chat (2026-11-05)

- **Yuki and James were born together and bonded from birth.** Her path stays open: familial, or something closer (engine canon: familial until her human form, then play decides). To fix in the game (roadmap step 7): `js/story/yuki_path.js` and this handover still say she bonded when he was six (34 years); the opening scene (`yuki_check`) already says born the same day in the same grove.
- **The hybrid with Selene** (full design in `project/design.md`; the owner's picks):
  1. **The Coil:** each act is a loop with a deadline (prologue: the tribute on Day 7; Act 1: Shen Qiu on Day 21). It ends on a collapse, a lost deadline fight (accept the written outcome or rewind) or by choice ("Bite the tail"); James wakes at the act's first dawn. James never dies.
  2. **Reset option B (middle):** kept: familiarity, Insights, Coil marks, realm, skills, meridians, Saturation, Yuki; reset to the act's start: hammerspace, world flags (James keeps "knowledge" flags); relationships other than Yuki reset with a 25% head start from the last Coil's peak.
  3. **Time scale:** 1 game hour = 3 s real time at ×1 (×2 and ×5 unlock per act); the clock stops when nothing runs.
  4. **Threads (option 3):** Parallel Cognition threads automate tasks at Practised (×2 familiarity). A thread wakes on every rewind **and** every first finish of an arc (Coil mark), up to 9; a player who never rewinds has 3 after the prologue and 9 by the end of Act 1. Lore: this world dulled the threads; "a thread holds only what your hands already know", "each bite of the tail wakes another".
  5. **Engine rules to add:** J (Yuki's form ladder by realm), K (Intuitive Aptitude: first try −2 DC), L (breakthrough from 95%; anything over 100% is lost, nothing carries over), Qi bond flow, injury and Strain, the Ouroboros daily knockout beat, technique dampening on every Qi cost, quest steps with XP lumps, the status block / check labels / deadlines, the relationship ledger. **Skip M and N.**
  6. **The Long Forest** becomes a New Game preset ("Nascent Soul start"), not a choice in the clearing. *(Replaced 2026-11-06 by v0.10.1: the walkable Long Forest from Coil 2, climbed one season at a time.)*
  7. **Android signing key:** kept in the repo, like Selene's.
  8. **Lore:** "root-kin" keeps the canon meaning (the bonded animal). Yuki's human look follows canon (cat ears, tail, qipao); the black dress stays as an outfit. James stays 40 and single (owner's spec).
- **Game structure stays as it is (owner's question, 23:48):** plain HTML/CSS/JS in many files (ES modules), like Selene's technology but not merged into one file; the tests load the modules directly. The Android app (roadmap step 6) copies Selene's Java wrapper, which serves the whole folder through `WebViewAssetLoader`, so modules work. Bundling into one file only if the app ever needs it.
- **The serpent fight on the way home (`rt_serpent`, 23:56, pick 3):** full games show it is lost only when James arrives at about 0–1% HP (after losing the wolves); from reasonable health it is never lost (3,000 games, 146 fights). Now: the Act 1 part test sends 1 run in 10 into fights hurt (1–20% HP) so every "lost" scene is walked (test only). Later, in roadmap step 3: make it a real threat on the first Coil (numbers to the owner first).
- **Build order:** see `project/roadmap.md` (1 rules and docs — done in v0.8.5; 2 save safety — done in v0.8.6; 2 save safety; 3 the hybrid core on the prologue; 4 progression layer; 5 Act 1 converted; 6 Android and comfort; 7 engine extras and lore).
- **Corrections to the 2026-11-04 notes:** the engine's breakthrough at 95% carries nothing over; Yuki's ladder is indexed by realm rung (lynx at Foundation … human at Nascent Soul); the engine's normal skill cap is T4 L10 (T9 with Exceptional 5), so the game's T10 L10 cap is a deliberate fork.

## What it is

A standalone, offline text RPG for Gábor's Android phone: a **web app (PWA)** first; a real Android app (.apk) later.
- **No AI narrator.** The story is a hand-written branching story. Art: code-drawn manhua-style figures (SVG) over public-domain Chinese ink paintings.
- **Images:** public-domain pictures are fine, and Gábor has **no rule against AI images**. The only image limits are Claude's own (see Romance). Reference images he sends from other artists (watermarked/signed) are style references only, never put in the game.
- **Same Qi rules as the SillyTavern game** (Rules Engine C). `js/core/formulas.js` is the engine's own file, copied unchanged from `hufle-beep/Shared-ST` at `st/rules-engine-c/lib/formulas.js`, engine 0.1.219.
- **New rule:** every check is **value + d6 vs DC**. A 6 always succeeds; a 1 needs DC + 2.

## Gábor's spec (2026-11-01)

**James Green**
- Same civilization as in SillyTavern: living tech grown from qi-attuned wood, Hearth Trees, ship seeds, Universal service, lifespans of 800–900 years.
- **40, a fresh doctorate** (three days old): mycology and computational biology.
- Arrives with nothing on an unknown world. He keeps:
  - the **omnitool**, whose hammerspace is the infinite inventory (empty at the start);
  - the **pillars**: Ouroboros Axiom (DR 1) and Parallel Cognition (9 threads).
- **Mortal Vessel, all 12 primaries and 66 collaterals open.** Everything starts at **T1 L1**: GU and Convergence Use. *(Changed 2026-11-06 for task mode, v0.9.6: a task-mode new game starts with 0 / 12 and 0 / 66 — the crossing ashed his channels shut — and opens them in about 20 sessions. Classic keeps the original spec.)*
- **Convergence (Qi + Bonesinger)** works as in the game, with **ranged use**: thrown bone darts and needles, plus a **wraithbone blade**.

**Yuki**
- His root-kin: a small white cat with yellow eyes.
- Same realm as James. **Fight T1 L1, Qi Use T1 L1.** Shares XP through the bond.

**World**
- **Dark xianxia.** Sects climb on herbs, pills, beast cores and each other, and Heaven sends tribulation lightning at each breakthrough.
- James is an **outlier**: his Ouroboros Axiom composts the world's poisoned Qi, so he needs no herbs and gets no tribulations.

**Play and tone**
- **Tone rule (Gábor, 2026-11-02):** James and Yuki are deadpan and sarcastic. The world's inhabitants are overly serious, most of them: formal, grave about honour, face, hierarchy, Heaven and the Sect; they don't joke. Mei Lin is looser than the norm (teases, laughs) and it gets her in trouble. The humour comes from James reacting to grave people.
- Survival and combat: **hunting and foraging for food**, with hunger.
- Tongue in cheek, James sarcastic, serious when it matters.

**Romance**
- Possible. Gábor wants it as explicit as possible and has no rules against explicit content or nudity himself.
- **Claude's own limits (not Gábor's):** no explicit sex scenes and no nude images. Romance is frank and sensual up to the door, then fades to black. He was told this on 2026-11-02.

## Gábor's working rules

In `CLAUDE.md` and `project/working-agreement.md` (adopted 2026-11-05). The change sequence there is a HARD RULE: options and a recommendation first, then the owner's pick, then a confirmation and his explicit go, only then build and push.

## How to play / run

- **Phone:** https://hufle-beep.github.io/bone-and-ash/ in Chrome, then *Add to Home screen*. Works offline after the first load.
- **Local (Termux or PC):** `python -m http.server 8080` in the folder, open `http://localhost:8080`.

## Files

| Path | What |
|---|---|
| `CLAUDE.md`, `project/*.md` | The hard rules and the project docs (handover, working agreement, roadmap, design, changelog, restore points). |
| `index.html`, `css/style.css` | The page. Phone-first layout: art plate, place and title, status strip (HP / Convergence / Fed / clock), roll-result panel, prose, choice "slips", tab bar (Story, James, Hammerspace, Journal, Saves). |
| `js/core/formulas.js` | Rules Engine C formulas, unchanged. |
| `js/core/game.js` | State (`newGame`), the numbers (HP, Qi Max, Convergence ×1.25), d6 from the save's own seed (a reload does not reroll), XP (`awardXp`), time and regen (`advance`, `sleepUntil`), hunger, condensation, inventory, relationships, **combat** (`COMBAT_ACTIONS`, `startCombat`, `combatStep`, `combatFlee`), save/load. |
| `js/core/story.js` | The scene runner (`sceneView`, `choose`, `goTo`). |
| `js/story/common.js` | Shared helpers: daily flags, `forestScale` / `villageScale`, `grow()` (enemy growth), food table and `eatBest()`, new items. |
| `js/story/wilds.js` | Forest Days 2–3 and the random nights (v0.4.0). |
| `js/story/ashfall.js` | Village Days 5–6, suppers, the night-5 Gao event (v0.4.0). |
| `js/story/prologue.js` | `SCENES` (52), `ITEMS`, and the encounters (jackals, Gao Feng, boar, collectors). |
| `js/art/portrait.js` | Close-ups in manhua style: `meiPortrait()`, `yukiPortrait()` (clean lines, flat cel tone, big eyes, glossy-hair highlights). |
| `art/bg/*.jpg`, `art/bg/CREDITS.md` | Six background crops of public-domain paintings (Dong Qichang, Wen Zhengming, the Met's *Misty Landscape*), toned to the paper. Made with `tools/bg.py` (crop → 1200×750 → luminance mapped to ink `#23211e`…paper `#ece8df`, reds kept). |
| `js/art/art.js` | `sceneArt(key)`: 26 scene illustrations from shared primitives (sky, sun/moon, mountains, treeline, mist, person, cat, beast, boar, hut, fire, shards, lotus) plus vignette and grain. |
| `js/main.js` | The UI. Autosave key `boneash.auto`, slots `boneash.slot1–3`, backups `boneash.bak.*`, the export reminder `boneash.exp` (v0.11.9); save-file export/import, Export all / Restore all, Share to GitHub, Copy status as text. |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline install. Game files: network first, cache when offline. Google Fonts: cached on first use. |
| `js/core/forms.js` | Bonesinger forms (v0.10.4): the lines (five since v0.11.4: ranged, melee, structures, reach, defence), ranks, what shows in fights and story choices, `INC_ONLY_ACTIONS`. |
| `js/story/prologue.js` (end) | The Long Forest in task mode (v0.10.1): `lfOpen`, `lfSeason`, `lfRank`, the entrances and the season card. |
| `js/core/tasks.js`, `js/story/task_hubs.js` | Task cards and the queue (v0.9.0); `waitChoice`, `plainChecks`, the camp hub (v0.10.2): which hubs, card ids, `runTask`, dry runs, the outlook; the speed gate `maxSpeed` / `effectiveSpeed` (v0.9.8); queue editing, `mer:next`, `instantChoice`, the forecast's death row (v0.10.0). |
| `js/story/nodice_tune.js` | No-dice fight tuning per encounter (v0.9.3). |
| `js/core/meditate.js` | The Meditate card (v0.9.5; on the 13 resting places since v0.11.14, `MED_SCREENS`): which screens, its cards (sit, the meridian lines since v0.11.13, breakthrough), `runMed`. |
| `js/story/meridians.js` | Every meridian screen (Story Mode's; the meridian lines for the Meditate cards since v0.11.13): the primaries and collateral groups (v0.9.6), the Extraordinary net (v0.8.0), `col_warn` / `ns_warn`, `btTarget`, the James-tab row. |
| `js/core/coil.js`, `js/story/coil_scenes.js` | The Coil (v0.9.4): end, rewind (reset B), the head start, "same days again", the Coil screen and the first dawn again. |
| `tests/tasks.test.mjs` | Task mode: 2,000 bot games each way, outlook = reality, collapse, migration, no dice on work cards, familiarity grows, every offered card played, Yuki's lane, no die anywhere in task mode, classic still rolls. |
| `tests/rules.test.mjs` | The engine numbers. 14 checks. |
| `tests/story.test.mjs` | Every link valid, every scene reachable, 2,000 random playthroughs, per-fight win rates. |
| `tests/part.test.mjs` | One Act 1 part alone; 1 run in 10 enters fights hurt so every "lost" scene is reached. |
| `tests/saves.test.mjs` | Every file in `saves/` loads, round-trips and plays 200 steps; checksum, too-new, broken-number, cut-off and foreign-file cases. |
| `saves/` | Test saves (`.json`, or `.txt` packed by Share to GitHub, v0.11.9). Six made from v0.8.5 (Day 1, Day 4, Day 7 tribute, Act 1 start, Act 1 end, Long Forest start) and four from v0.11.7 (`tools/snap.mjs`: prologue Coil 2, Act 1 Coils 1 and 2, the Long Forest on Coil 2); the owner's exports go here too. |
| `tools/check.sh` | Runs every check (syntax, engine, saves, the four Act 1 parts, the tasks and story bots) in about 85 s on 2 cores (with the browser test since v0.11.7); `quick` = 200 bot games each (about 15 s, not enough for a push); stops at the first failure. |
| `tests/lib/shard.mjs` | The bot games split across worker processes (v0.11.1): `--games`, `--workers`, `--seed`; a seed per game (`seedOf`), so any number of workers gives the same numbers. |
| `tools/sanity.mjs`, `tools/baseline.json` | The mechanics sanity check (v0.11.3, hard rule 2): invariants and drift (±5 points, n ≥ 100) against the saved baseline; the last step of the full check; `--update` only after the owner's go. |
| `tools/consistency.mjs`, `tests/engine.test.mjs` | v0.11.5: the offline file list and the version in every doc (in `check.sh`); the engine's own formula tests on our copy. |
| `tests/data.test.mjs`, `tools/lint.mjs`, `tools/browser.py`, `tools/snap.mjs` | v0.11.7: data integrity (in the check); the content lint (log only); the browser test (full check only); fresh test saves (`node tools/snap.mjs`, by hand, for each new save format). |
| `tools/bots.mjs` | Balance numbers only (v0.11.1): the tasks test's bots, summary per Coil with the beast share of deaths; `--games`, `--seed`, `--sensible`, `--workers`. |
| `.github/workflows/restore-points.yml` | Tags the newest 5 commits on every push (`restore/<date>-<commit>`), copied from Selene. |

**Run every check:**
```
bash tools/check.sh          # full, after every build and before the docs and the push (ends with the sanity check)
bash tools/check.sh quick    # while building
node tools/bots.mjs --games 1000 --sensible   # balance numbers only
node tools/sanity.mjs --update                # new baseline, only after the owner's go on an intended change
```
**Browser check:** Playwright is preinstalled in the cloud session; `python3 tools/browser.py` (part of the full check since v0.11.7) taps through both modes at 390×844.

**Workspace gotchas** (v0.11.7; some from Selene's handover):
- **Read the full check's exit code before anything else; never chain a commit or push after it** (v0.11.7 went out after a failed check that way).
- Bump `VERSION` in `sw.js` together with the docs, after the full check: `tools/consistency.mjs` fails while they differ.
- The `origin` remote can reset to the old `James-rpg-test` URL (see the end of this file). The clone is shallow: `git fetch origin main` before a push.
- Tags can't be pushed from the cloud workspace; the restore tags come from the workflow. Use `gh api` (REST) rather than GraphQL.
- Browser tests: block service workers (a stale cache hides changes), cap bar waits, retry a tap whose button re-rendered. Set storage from a non-game page on the same site, then open the game (`fresh` in `tools/browser.py`): a reload fires the game's own save on close (v0.11.5), which used to write the old game over a fresh `localStorage` write (Selene saw the same).
- A GitHub Pages deploy can stick "in progress"; a new commit republishes. Check a build once (or with a short bounded wait), never block on it.
- Foreground `sleep` can be blocked; poll with short waits.

## Rules as implemented

- **Check value** = 0.5 × rank (T1 L1 = 0.5). James rolls GU for anything he has no skill for, and for defence.
- **XP:** a standard award is 30 × the skill's tier, split equally between the skill and GU. Yuki gets the same share to her Qi Use. A fail pays 25%. Bands: standard 30, challenging 60, major 120.
- **Level cost** = 50 × k × T × L, with k 0.5. T1 L1 → L2 costs 25.
- **Starting numbers** (match the engine):
  - James: HP 21 (body = GU check), DR 1, Convergence 40.5 = (20 + 0.5 + 12) × 1.25.
  - Yuki: HP 30 (body 5), Qi 32.5.
- **Regen:** one Cycle is 30 minutes at T1. Each Cycle gives HP +5% and Qi +11.6% (5% + 0.1 × 66 collaterals). `sleepUntil` fills both bars.
- **Hunger:** "Fed" drops 3 an hour. Below 30, −1 on every check; at 0, another −1 and HP loss over time.
- **Breakthrough (v0.4.1; Incremental Mode since v0.11.2: from 95%, a timed card of 2 h × (realm + 1) ÷ the Coil bonus):** at 100% Saturation a choice "Break through to <next realm>" appears in `stream`, `wilds`, `camp`, `night`, `village`, `ashfall`, `supper` (added in prologue.js after the scene list). `breakthrough(g)` in game.js: 2 hours, realm +1, Saturation 0, both bars full; Yuki rises with James (root-kin). Scene `breakthrough`: the tribulation comes, finds nothing to burn, leaves. Text varies by whether James has heard of tribulation yet (`lore1`, `lore_realms` or Mei Lin met), forest vs village (witnessed), day vs night, and first vs later rungs. In the village it sets `sky_witness` (Act 1 hook: the Sect hears). Each rung ≈ +3–4 HP, +1–1.5 Convergence. Fights scale by days, not realm.
- **Condensation** (Incremental Mode since v0.11.2: a 1-hour sit, 10 Qi, +100 ÷ (10 × 2^realm) % × the Coil bonus): 10 Qi per sit, 0 XP, raises Saturation. It never refills Qi.
- **Combat:** each round James acts, Yuki attacks automatically, then the enemies attack. James defends with GU + d6 vs their attack DC; DR 1 reduces hits. His actions:
  - **darts:** Convergence Use, 2 Qi, 2–4 damage;
  - **blade:** GU, 3 Qi to form, free once formed, 3–6 damage;
  - **needle:** Convergence Use, 4 Qi, staggers;
  - **guard:** +2 to defence (Incremental Mode since v0.11.4: +0.5 per defence form, and with a buckler the lunges at Yuki miss);
  - **spear** (Incremental Mode, v0.11.4, from T1 L8): GU, 3 Qi to sing, then free, 3–6 × tier, +2 DC; a full hit holds the enemy off for the round;
  - **spike field** (Incremental Mode, v0.11.4, from T1 L3): 4 Qi, once a fight, 2 rounds, 1 back to every attacker (2 from the slab);
  - **run:** only in some fights.

  Losing a fight never ends the game; it leads to a "lost" branch.
- **Bonesinger ladder:** a T1 rung was added for this game: antler-hard bone, needles, darts, a knife-length blade, thrown to about 15 m. T2+ text is from the SillyTavern james3 preset (`BONESINGER_TIERS` in game.js has T1–T3).

**Balance (v0.4.0, smart combat, random hub choices; `s` = extra days trained):**
- Enemies grow per extra day with `grow()` in `js/story/common.js`: HP +15%, DC to hit +0.45, attack +0.6 (to the half point). Lu Han: HP +5%, DC +0.35, attack +0.5. That tracks the average gain per day, so a player who trains harder than average wins more.
- Jackals (night 3 adds a yearling): ~99%. Gao Feng: 84% (s1) / 95% (s2). Boar: 91% / 99%. Collectors: 37% (s3) / 58% (s4). Night fights (crows, rats, lizard): 97–100%. Far hunt (wolves, thornback bull): ~80%. Arson: ~97%.
- Player at the jackals: GU check ~2.8, Convergence Use ~1.7 after two full forest days (was 1.2 / 0.6 on night 1).
- Old saves (no `long` flag) keep the original numbers and route.
- Re-tune with the balance script pattern: random hub choices, smart combat, group win rate by `s` (see git history, `bal.mjs` in the session that built v0.4.0).

## Version notes (the last three versions; older ones in `history-3.md`, `history-2.md` and `history.md`)

## v0.11.16 — the relationship catch-up; the leftover Cultivate choices

- **game.js:** `REL_CATCHUP` 3, `catchUp`; `bumpRel` keeps `g.coil.best[who]` (Incremental Mode, not Yuki; seeded from the Coil's peak) and counts gains ×3 up to it; `startActCoil` carries `best` into Act 1.
- **prologue.js** (`meditate1`'s Condense choice and its "You could keep going" line, `night`'s "Cultivate first"), **wilds.js** (`night_event`, the rain), **act1_fallout.js** (`fo_night`), **act1_heart.js** (`heart_camp`): `show: () => !isNoDice()`. wilds.js no longer imports `coilMult`.
- **tests/tasks.test.mjs:** the catch-up (×1 at the best, the head start and the best over a rewind, +3 → +9, +4 → the last 6 ×3 then ×1, losses ×1, friendship apart, Yuki never, carried into Act 1, Story Mode ×1); the 5 leftovers hidden in Incremental Mode and kept in Story Mode. **tools/baseline.json:** updated (owner "OK" 19:58).

## v0.11.15 — B1-b, speed by use

- **game.js:** `USE_N` { card 18, sit 30, mer 30, bt 6 }, `USE_CAP` 10, `useSpeed`, `actUses`, `actSpeed`, `actUse` (`g.tasks.use`); `sitMinutes`; `condense` uses `sitMinutes` and counts a use; `btMinutes` ÷ `actSpeed(g, 'bt')`, `breakthrough` counts a use; `sitGain` without the Coil bonus; `coilMult` stays on XP only. **meridians.js:** a sitting's work × `actSpeed(g, 'mer')`, `merMinutesOf` ÷ it, one use per sitting. **tasks.js:** `cardSpeed` (Incremental: `useSpeed(f, 18)`; Story Mode: the tiers), for work cards and Yuki's job; the sit card's minutes `sitMinutes`. **coil.js:** the rewind keeps `tasks.use`. **meditate.js:** `medActivity`, `useLine`; the sit card's length and label from `sitMinutes`; `runMed('med:mer')` gone. **main.js:** the tooltip's "Familiar" line.
- **tests/tasks.test.mjs:** speed by use (cards 1 / 2 / 3.5 / 5 / 10 / 10; the sit 60 → 15 → 6 min; meridians 120 → 30 → 20 min, ×10 cap, a sitting = one use; Break through 600 → 109 → 60 min; uses kept over a rewind; Story Mode ×1); the Coil-bonus checks turned into "no bonus" checks (Saturation, breakthrough, the first primary), XP still ×2 on Coil 3; the bots take every card. **tools/sanity.mjs:** the invariants for speed by use. **tools/baseline.json:** updated (owner pick a, 19:32). **project/design.md:** "Cultivation by time" and the familiarity row.

## v0.11.14 — Meditate only on the resting places, queueable there

- **meditate.js:** `MED_SCREENS` (13 ids), used by `canMeditate`; the meridian and Break through cards carry their queue ids on every queue screen (`isQueueScreen`).
- **tasks.js:** `isMedTask`, `isQueueScreen` (a task screen, or a resting place where Meditate shows), `runsHere`; `taskCards` off the task screens = `medTaskCards` only; `sitOpen` on any queue screen (the own-sit rule on task screens only); `runTask` accepts Meditate cards on the resting places (no `recordCard` there; Break through sets `med_back` off the task screens); `outlook` marks a row for another screen and every row after it as `wait`.
- **main.js:** `onQueueScreen` for the queue, `startNext` (rows for another screen wait, never skipped; `coilPrefill` on task screens only), the tick and the tooltip.
- **tests/tasks.test.mjs:** the Meditate places and the resting-place queue (see above). **tools/browser.py:** part 8 `rest_places`. **tools/baseline.json:** updated (owner "ok" 19:01).

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
