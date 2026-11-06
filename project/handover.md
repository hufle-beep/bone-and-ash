# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-06 (Europe/Budapest). **Version:** 0.10.3 (`sw.js` VERSION `bone-ash-0.10.3`; docs only: the handover split) on top of 0.10.2: paused by default and on every new scene (a tapped card runs once, then pauses), the camp as a task screen, waiting for a time of day happens at once; on top of the Long Forest in task mode (from Coil 2 of the prologue, one season = +1 realm, up to Heavenly Immortal), on top of queue planning with Selene's forecast (run now / + to queue, ↑↓✕, Clear, meridian sessions in the queue, a death row and a pause before it), starving 1.5 HP an hour in task mode, rest and sleep at once; on top of the clock with seconds (v0.9.9), Tasks on by default and the speed gate (v0.9.8, push 4 of 4, 3c-3), on top of severe difficulty in task mode (v0.9.7, push 3 of 4: HP 0 or a lost beast fight ends the Coil, beasts +0.5, tribute +1), on top of meridians closed at the start and Act 1's Coil (v0.9.6), every screen as cards (v0.9.5: story choices with bars, every choice takes time, the Meditate card everywhere), the Coil (v0.9.4) and no dice anywhere in task mode (v0.9.3) and step 3b. Tasks is now the default mode (Saves → Game mode: Tasks or Classic). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual design notes, the Act 1 overview) and **`project/history.md`** (older decisions and version notes, newest first). All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3):** this file holds the decisions and version notes of the **last three versions**; each push moves anything older to the top of `project/history.md`. When `history.md` passes about 45 KB, a `history-2.md` starts. Every doc stays small enough to upload to the claude.ai project straight from the file.

## Decided in chat (2026-11-06)

- **v0.10.2 (owner 11:06: "Night falls. Settle in." too long, make camp a hub or merge it, move the clock instantly; paused by default, no automatic unpause; picks 11:11 "3a. 1 a+c, 2a but also on new scenes and doesn't automatically start until you queue everything and tapped (not queued) cards still run, but re-pause after"; go 11:20 without 3a; mid-build stop 11:25, pick 11:28 "a"; built in v0.10.2):**
  - **1a** the camp (`camp`, Days 1–3) is a task screen: fire, cook, eat raw, stakes are cards (tap or +). `plainChecks`: its checked cards stay chores (the story check's numbers, not the work-card DC +2 / double length). **Mid-build pick a:** "Eat it raw" (no own time) takes 0 minutes as a camp card instead of the story default 30, like eating on every other task screen; fire, cook and stakes keep their own times.
  - **1c** waiting happens at once (task mode): a story card with no check, Qi, fight or own time that takes 60+ minutes because its `do` or the next scene's `enter` sets the clock (`waitChoice` in tasks.js; never a choice back to its own scene) plays with no bar. 25 such choices (Night falls, chapter transitions, Act 1 camp nights…).
  - **2a** the game always opens paused and pauses on every new scene (task mode). Paused: a tapped card (task, story, Meditate sit) runs now at the remembered speed, then the game pauses again; + only queues; ▶ Resume runs the queue until the next new scene. `boneash.speed` now stores only the speed to resume at (never 0). The pause before a forecast death stays.
  - **3a** (the automatic unpause the owner saw): no details given, built without it; no code path resumes on its own (only ▶ and the speed menu).
  - **Bots after v0.10.2** (camp cards change their random path; rules unchanged): dead before Mei Lin 84 / 41 / 17 / 18%, Act 1 Coils ending in death 91 / 77 / 61 / 45%, tribute won Coil 1–3 30 / 40 / 48%.
- **v0.10.1: the Long Forest redesign (proposal 10:40; owner 10:50 "go with your suggestions, but for the 31 scenes, also keep the option to advance seasons, because only grinding through the scenes is incredibly tedious"; go 10:59; built in v0.10.1):**
  - **1a gate:** task mode, the prologue's Coil 2 or later (`lfOpen`: `coil.n > 1`, act 0). Coil 1 has no way in. **7: Classic** keeps the one-step button (now shown only in Classic).
  - **2a entrance:** "Stay lost" in the clearing and "You remember this. Stay lost." on the arrival (sets the skip flags), both → `lf_enter` → the walkable Long Forest (`lf_hub`).
  - **3a / 5a + the owner's addition:** the walkable Long Forest (31 scenes) is back, and its camp is a task screen with a queueable **"Withdraw for a season"** card: +1 realm, a 2-hour bar, no daily limit, gone at Heavenly Immortal. The old daily seclusion stays. Later Coils can come back to climb further (the Coil keeps the realm).
  - **4a a season:** realm +1 (James and Yuki), Saturation 0, bars full; GU, Convergence Use, Yuki's Fight and Qi Use lifted to rank 7 × realm, never lowered (T1 L7, T2 L4, T3 L1 … Nascent Soul T5 L9, Mahayana T7 L10, Heavenly Immortal T10 L10); the first season opens 12 / 66 for both and lifts a seal; the Extraordinary 8 open over realms 1–6 (⌈8r/6⌉), from Nascent Soul their 28 collaterals and 10 junctions.
  - **6 leaving:** as before, Day 4 at the scream; new in task mode: the hammerspace goes out full (`LF_STOCK` at its caps). A lost beast fight inside the forest ends the Coil (the realm is kept). Speeds, ids and the save state unchanged.
  - **Measured before (200 task-mode bot games each, James set to a realm then played from Day 4 to the end of Act 1 on one Coil):** none: prologue deaths 94%, tribute won 4%; Foundation (check 3.5): 76–80% / 3–9%, Act 1 deaths 20–24%; Core Formation (7): 0–1% / 56–67%, Act 1 deaths 63–66%; True Core (10.5) or higher: 0% / 93–99%, Act 1 deaths 0%. The Long Forest's enemy scaling moved nothing by more than 5 points.
  - **Bots after v0.10.1** (they stay out of the Long Forest): dead before Mei Lin 86 / 36 / 16 / 17%, Act 1 Coils ending in death 89 / 76 / 61 / 48%, tribute won Coil 1–3 18 / 31 / 46%. The rise from v0.10.0 (81 / 30 / 12) is only the bots losing the one-step button in task mode, which about one bot in four used to take in the clearing (v0.10.0's code with that button filtered gives the same numbers exactly).
- **v0.10.0: queue planning (owner 09:59; picks 10:02 "1a, 2a, 3b, 4a, 5a, 6a"; go 10:05; mid-build stop 10:08, pick 10:10 "b. you can also make starving harsher"; starving rate pick 10:19 "b"; built in v0.10.0):**
  - **1a** tap a card = run it now, ahead of the queue (the running card moves to second place and starts over later); **+** = add to the end; paused: both only queue. Rows ↑ / ↓ / ✕, **Clear queue** keeps the row in progress. Limit 30.
  - **2a** queueable: hub cards, the hub's Cultivate, and **Next meridian session** (`mer:next`: the first open session on the meridian screen; 2 h, 2 Qi, one of the day's two; skipped with a note when none is possible). Story and door cards still stop the queue.
  - **3b** the forecast (exact dry run, as before): each row its end time, Fed and HP after it; the row where HP hits 0 says **Starves here** / **Collapses here**, rows after it red ("never reached"); the Outlook gives the queue's length or the death time and cause. **Pause before the forecast death** (Saves tab, on by default, per phone `boneash.pausedeath`): once per forecast death, an hour of game time before it (also before instant rests).
  - **4a → b (mid-build stop):** the starving fix changed Classic numbers (Gao 91 → 96%, root-wyrm 83 → 87%, wolves 85 → 88%, rt_wolves 96 → 99%, the serpent 82 → 98%, Shen Qiu 70 → 67%), so **Classic keeps its old rule** (at least 1 HP per clock step; numbers identical to v0.9.9) and **task mode** gets a flat rate with the minutes carried (`g.starveCarry`). Correction: Fed drains 4 an hour on work cards (3 + 1), so a full 70 lasts about 17½ h of work cards, not 10 as said in chat.
  - **Starving rate (owner: "you can also make starving harsher"; measured, 2,000 bot games each, prologue dead before Mei Lin / Act 1 Coils ending in death, Coils 1–4):** v0.9.9 old rule 81/30/13/6 · 81/65/48/34; 1 HP/h 81/30/9/5 · 71/61/43/30; **1.5 HP/h 79/29/12/17 · 82/77/58/47 (picked, b)**; 2 HP/h 79/29/13/25 · 88/92/77/62; 3 HP/h 80/31/17/23 · 88/94/84/66; 5 HP/h 81/35/18/24 · 90/96/88/76. Starving barely matters in the prologue (beasts kill there); from 2 HP/h Act 1 deaths stop falling with the Coils.
  - **5a** rest and sleep cards have no bar (`instantChoice`: "Rest…"/"Sleep…" and the other sleep lines, no check, Qi or fight); the time still passes (Fed, starving, regen). "Stay up with Mei Lin…" and "Cultivate … before sleep" keep their bars.
  - **6a** the Long Forest redesign moves to **v0.10.1**.
  - **Bots after v0.10.0** (tasks test): dead before Mei Lin 81 / 30 / 12 / 16%; tribute won or paid 44 / 56 / 78%; Act 1 Coils ending in death 81 / 75 / 60 / 50%; 43 collapses.
  - Test fix: the v0.9.7 test "starving to 0 ends the Coil" now builds up a starving hour first (it relied on the old 1 HP per step).

- **v0.10.3: the handover split (owner 11:40 "the handover has been running for a very long time"; pick 11:41 "a"; go 11:42; docs only):** `handover.md` (core) + `reference.md` + `history.md`, nothing deleted, only moved; the last three versions stay here.

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
| `js/main.js` | The UI. Autosave key `boneash.auto`, slots `boneash.slot1–3`, save-file export/import. |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline install. Game files: network first, cache when offline. Google Fonts: cached on first use. |
| `js/story/prologue.js` (end) | The Long Forest in task mode (v0.10.1): `lfOpen`, `lfSeason`, `lfRank`, the entrances and the season card. |
| `js/core/tasks.js`, `js/story/task_hubs.js` | Task cards and the queue (v0.9.0); `waitChoice`, `plainChecks`, the camp hub (v0.10.2): which hubs, card ids, `runTask`, dry runs, the outlook; the speed gate `maxSpeed` / `effectiveSpeed` (v0.9.8); queue editing, `mer:next`, `instantChoice`, the forecast's death row (v0.10.0). |
| `js/story/nodice_tune.js` | No-dice fight tuning per encounter (v0.9.3). |
| `js/core/meditate.js` | The Meditate card (v0.9.5): which screens, its cards (sit, meridian, breakthrough), `runMed`. |
| `js/story/meridians.js` | Every meridian screen: the primaries and collateral groups (v0.9.6), the Extraordinary net (v0.8.0), `col_warn` / `ns_warn`, `btTarget`, the James-tab row. |
| `js/core/coil.js`, `js/story/coil_scenes.js` | The Coil (v0.9.4): end, rewind (reset B), the head start, "same days again", the Coil screen and the first dawn again. |
| `tests/tasks.test.mjs` | Task mode: 2,000 bot games each way, outlook = reality, collapse, migration, no dice on work cards, familiarity grows, every offered card played, Yuki's lane, no die anywhere in task mode, classic still rolls. |
| `tests/rules.test.mjs` | The engine numbers. 14 checks. |
| `tests/story.test.mjs` | Every link valid, every scene reachable, 2,000 random playthroughs, per-fight win rates. |
| `tests/part.test.mjs` | One Act 1 part alone; 1 run in 10 enters fights hurt so every "lost" scene is reached. |
| `tests/saves.test.mjs` | Every file in `saves/` loads, round-trips and plays 200 steps; checksum, too-new, broken-number, cut-off and foreign-file cases. |
| `saves/` | Test saves. Six made from v0.8.5 (Day 1, Day 4, Day 7 tribute, Act 1 start, Act 1 end, Long Forest start); the owner's exports go here too. |
| `tools/check.sh` | Runs every check (syntax, engine, saves, the four Act 1 parts, 2,000 full games) in about 1 minute; stops at the first failure. |
| `.github/workflows/restore-points.yml` | Tags the newest 5 commits on every push (`restore/<date>-<commit>`), copied from Selene. |

**Run every check:**
```
bash tools/check.sh
```
**Browser check:** Playwright is preinstalled in the cloud session. Serve the folder and click through at 390×844. The last full click-through reached the end with no errors.

## Rules as implemented

- **Check value** = 0.5 × rank (T1 L1 = 0.5). James rolls GU for anything he has no skill for, and for defence.
- **XP:** a standard award is 30 × the skill's tier, split equally between the skill and GU. Yuki gets the same share to her Qi Use. A fail pays 25%. Bands: standard 30, challenging 60, major 120.
- **Level cost** = 50 × k × T × L, with k 0.5. T1 L1 → L2 costs 25.
- **Starting numbers** (match the engine):
  - James: HP 21 (body = GU check), DR 1, Convergence 40.5 = (20 + 0.5 + 12) × 1.25.
  - Yuki: HP 30 (body 5), Qi 32.5.
- **Regen:** one Cycle is 30 minutes at T1. Each Cycle gives HP +5% and Qi +11.6% (5% + 0.1 × 66 collaterals). `sleepUntil` fills both bars.
- **Hunger:** "Fed" drops 3 an hour. Below 30, −1 on every check; at 0, another −1 and HP loss over time.
- **Breakthrough (v0.4.1):** at 100% Saturation a choice "Break through to <next realm>" appears in `stream`, `wilds`, `camp`, `night`, `village`, `ashfall`, `supper` (added in prologue.js after the scene list). `breakthrough(g)` in game.js: 2 hours, realm +1, Saturation 0, both bars full; Yuki rises with James (root-kin). Scene `breakthrough`: the tribulation comes, finds nothing to burn, leaves. Text varies by whether James has heard of tribulation yet (`lore1`, `lore_realms` or Mei Lin met), forest vs village (witnessed), day vs night, and first vs later rungs. In the village it sets `sky_witness` (Act 1 hook: the Sect hears). Each rung ≈ +3–4 HP, +1–1.5 Convergence. Fights scale by days, not realm.
- **Condensation:** 10 Qi per sit, 0 XP, raises Saturation. It never refills Qi.
- **Combat:** each round James acts, Yuki attacks automatically, then the enemies attack. James defends with GU + d6 vs their attack DC; DR 1 reduces hits. His actions:
  - **darts:** Convergence Use, 2 Qi, 2–4 damage;
  - **blade:** GU, 3 Qi to form, free once formed, 3–6 damage;
  - **needle:** Convergence Use, 4 Qi, staggers;
  - **guard:** +2 to defence;
  - **run:** only in some fights.

  Losing a fight never ends the game; it leads to a "lost" branch.
- **Bonesinger ladder:** a T1 rung was added for this game: antler-hard bone, needles, darts, a knife-length blade, thrown to about 15 m. T2+ text is from the SillyTavern james3 preset (`BONESINGER_TIERS` in game.js has T1–T3).

**Balance (v0.4.0, smart combat, random hub choices; `s` = extra days trained):**
- Enemies grow per extra day with `grow()` in `js/story/common.js`: HP +15%, DC to hit +0.45, attack +0.6 (to the half point). Lu Han: HP +5%, DC +0.35, attack +0.5. That tracks the average gain per day, so a player who trains harder than average wins more.
- Jackals (night 3 adds a yearling): ~99%. Gao Feng: 84% (s1) / 95% (s2). Boar: 91% / 99%. Collectors: 37% (s3) / 58% (s4). Night fights (crows, rats, lizard): 97–100%. Far hunt (wolves, thornback bull): ~80%. Arson: ~97%.
- Player at the jackals: GU check ~2.8, Convergence Use ~1.7 after two full forest days (was 1.2 / 0.6 on night 1).
- Old saves (no `long` flag) keep the original numbers and route.
- Re-tune with the balance script pattern: random hub choices, smart combat, group win rate by `s` (see git history, `bal.mjs` in the session that built v0.4.0).

## Version notes (the last three versions; older ones in `history.md`)

## v0.10.2 — pause rules, the camp as a task screen, waits at once

- **main.js:** `speed` starts at 0; `resumeSpeed` from `boneash.speed` (stored only when > 0); `pauseNow`, `scenePause` (in `render` and `startNext`: a new `g.scene` pauses), `tapRun` / `oneShot` / `endOneShot` (a tap while paused runs that card, then pauses; ended in `finishTask`, `playChoice`, a finished sit, a cancelled story bar, a full queue); ⏸ shows only while running continuously; the speed menu's Pause = `pauseNow`; story taps use `waitChoice` to play at once.
- **tasks.js:** `waitChoice(scenes, c, mins, from)`; `cfg.plainChecks` makes checked hub chores `chore` cards (run through `choose`).
- **task_hubs.js:** `camp` (`plainChecks`, own 'Camp').
- **Tests:** camp hub, fire and stakes are chores, the fire card = the story choice, queue and forecast, Night falls is a wait and lands at 21:00+, no wait has a check / Qi / fight / time, at least 20 waits. Browser: opens paused, + queues only, a tap runs once and re-pauses, Resume runs the queue, Night falls jumps 16:45 → 21:10 and the night opens paused.

## v0.10.1 — the Long Forest in task mode

- **prologue.js** (after `installCoil`): `lfOpen(g)` (task mode, `coil.n > 1`, act 0); `lfRank(r)` (7·r, 100 at `MAX_REALM`); `LF_SEASON_MINUTES` 120; `lfSeason(g)`; the clearing's "Stay lost (… one season at a time)" and the arrival's "You remember this. Stay lost." (both `show: lfOpen`, → `lf_enter`); the season choice appended to `lf_hub` (`show`: task mode and realm < 14); `lf_exit`'s choice wrapped to fill `LF_STOCK` to the caps in task mode. The one-step button got `show: !isNoDice()`. `g.flags.lf_seasons` counts seasons (also counted by the old seclusion).
- **task_hubs.js:** `lf_hub` is a task hub (no menus; its own cards: the season, cultivate, rest, eat, ghost-gill; `evening` `lf_morning`).
- **Tests:** tasks test — Coil 1 shut, Classic one-step only, Coil 2 open (both entrances), the camp is a task hub inside the Coil, the season card (chore, 2 h), two queued seasons match the forecast, a season's numbers, the full climb to 14, no season card at the top, never lowered, a seal lifted, leaving stocks the hammerspace, a rewind keeps the realm, Classic stocks nothing. The balance bots skip "Stay lost".

## v0.10.0 — queue planning, the forecast, starving, rest at once

- **tasks.js:** `queueRunNow` / `queueAdd` / `queueMove` / `queueClear` (pure); `MER_TASK` (`'mer:next'`), `merChoice` (first open meridian-screen choice with a check), card kind `mer` in `cardOf` / `taskCards` / `runTask` (runs the meridian choice with `g.scene = 'meridians'`, then back to the hub without its enter); `instantChoice`, `isInstantTask`; `outlook` rows get `fed`, `hp`, `death` ('hunger' | 'injury' when the copy lands on `coil_end`), later rows `dead`; it returns `death: { at, cause, row, id }` and `start`.
- **meditate.js:** on a hub, a queueable "Next meridian session" card (`task: 'mer:next'`).
- **main.js:** cards are `.cardwrap` with the card (`data-run`) and a **+** (`data-qadd`); rows get `data-qup` / `data-qdown` / `data-unq`; `data-qclear`; instant tasks run without a bar in `startNext` (only when not paused) and `finishTask` is shared with `tick`; instant story cards play at once; `checkDeathPause` (in `tick` and before an instant task) pauses once per `act:coil:death.at`; Saves tab switch `data-pausedeath`.
- **game.js:** `STARVE_HP_PER_HOUR` 1.5 (task mode; `setStarveRate` for simulations), `g.starveCarry` (no migration; reset when Fed > 0); classic keeps `max(1, ⌊m / 60⌋)` per step.
- **css:** `.cardwrap`, `.qadd`, `.queue li.dead`, `.dies`, `.qbtns`.
- **Tests:** queue edits and the limit, a meridian session from the queue (2 h, a primary, a session) and none after two, the forecast's death row = the real run's starving minute, rows after it never reached, 4 starving hours = 6 HP in 10-min steps and in one step, classic's old rule, rest and sleep instant but still 60 min.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
