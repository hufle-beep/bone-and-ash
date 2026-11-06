# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-06 (Europe/Budapest). **Version:** 0.9.8 (`sw.js` VERSION `bone-ash-0.9.8`): Tasks on by default and the speed gate (push 4 of 4, 3c-3), on top of severe difficulty in task mode (v0.9.7, push 3 of 4: HP 0 or a lost beast fight ends the Coil, beasts +0.5, tribute +1), on top of meridians closed at the start and Act 1's Coil (v0.9.6), every screen as cards (v0.9.5: story choices with bars, every choice takes time, the Meditate card everywhere), the Coil (v0.9.4) and no dice anywhere in task mode (v0.9.3) and step 3b. Tasks is now the default mode (Saves → Game mode: Tasks or Classic). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`. All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

## Decided in chat (2026-11-06)

- **Push 4 of 4: 3c-3 (proposal 09:20; picks 09:28 "1a, 2a, 3a, 4a, 5 ok, 6a, 7a, 8 ok"; go 09:29; built in v0.9.8):**
  - **1a** Tasks on by default: a phone that never chose gets Tasks; `boneash.tasks` = `'0'` keeps Classic. Same key.
  - **2a** Saves tab: "Game mode" heading, buttons **Tasks** / **Classic (older, with dice, no Coil)**, new text.
  - **3a** the speed gate lives in the save, read from what is already there (no migration; a new game starts at ×1 again).
  - **4a** ×2 after a won tribute: `ending` fought, bluff or paid (the hairpin). An accepted lost tribute stays ×1 until Act 1 ends. (Bots v0.9.7: won 33 / 39 / 51% on Coils 1 / 2 / 3.)
  - **5** ×5 after Act 1: reaching `a1_end` by any route (`taken` included) sets the new flag `spd_a1`; an old save already at `a1_end` with an `a1_outcome` counts. ×10 gone from normal play.
  - **6a** locked speeds are hidden; the stored speed is kept and held down to the gate, back up when it opens.
  - **7a** hidden test toggle: tap the "Game mode" heading 5 times (within 1.5 s each) → "Test speeds: on/off", per phone (`boneash.testspeeds`), opens every speed incl. ×10.
  - **8** tests: `maxSpeed` / `effectiveSpeed` in the tasks test.
  - **Next:** the serpent push (`rt_serpent` is a beast, so losing it ends the Coil), numbers first.

- **Push 3 of 4: severe difficulty (owner "procceed" 08:40 → proposal with numbers; picks 08:58 "1 ok, 2b, 3a, 4b, 5b, 6 ok"; go 09:02; built in v0.9.7):**
  - **1 People** (their losses keep the written branches): Gao, the collectors, Pock-Face's arson, Ya's brawl, `rt_brawl`, Shen Qiu (`elder`), the Sect watcher (and the Long Forest's `lf_rogue`). Every other fight is a beast.
  - **2b** the rule in the prologue **and Act 1** now: HP 0 outside a fight (starving, task injuries, story HP losses) or a lost beast fight ends the Coil. No "Accept" after a death.
  - **3a** beasts +0.5 DC and attack (prologue and Act 1, task mode). **4b** tribute +1: bluff DC 6 → 7, hairpin DC 4 → 5, collectors fight +1 (task mode). **5b** the tribute target counts "won" as not lost (fight, bluff or hairpin). **6** a lost beast fight has its own Coil-screen text ("Teeth, then the ground…"); starving and injuries keep the collapse text.
  - **Measured before (simulation, random bots rewinding up to 4 times):** the rule alone: dead before Mei Lin 51 / 17 / 8%, tribute won/paid/lost 33/14/53, 61/27/12, 69/27/4; beasts +0.5: 79 / 33 / 15%; +1: 90 / 50 / 19%; Fed ×1.5: 80 / 53 / 34%; Fed ×1.5 + harsher starving + half hauls: 87 / 73 / 60%; half hauls: 57 / 18 / 10%. Tribute +1 with beasts +0.5: won or paid 46 / 51 / 83%. Act 1 under the rule: 84–87 / 75 / 49% of Coils die. Fed, starving and hauls stay as they are.
  - **Bots after v0.9.7** (tasks test, 2,000 games): dead before Mei Lin 81 / 30 / 13% (after Mei Lin 12 / 11 / 9%); tribute won or paid 36 / 58 / 77% (won 33 / 39 / 51%); Act 1 Coils ending in a death 81 / 65 / 48 / 34% on Coils 1–4.
  - Docs fix: the stray bracket on the handover's first line.

- **Push 2 of 4: meridians closed and Act 1's Coil (proposal 08:05; picks 08:13 "4a, but coil undoes it, everything else as your recommendation", 08:15 "not any realm, gated according to engine rule", 08:16 "a. messing up has real consequences", go 08:17; mid-build stop, picks 08:30 "1a, 2 standard, go"; built in v0.9.6):**
  - **1b** two sessions a day (any mix); a session = 2 Qi, 2 h, Convergence Use vs DC with no dice. **2a** primaries DC 2.5 → 4.0, collateral groups DC 3 → 4.75; a fail spends the Qi, the time and the session, pays 25% XP and gives +0.5 to the next try (up to +2, gone on a success). **3** 8 collateral groups (9, 9, 8, 8, 8, 8, 8, 8) after primaries 2, 3, 5, 6, 8, 9, 11, 12, classical order Lung → Liver. **5a** task-mode new games only; classic new games and old saves keep 12 / 66.
  - **4a, version a (owner):** the engine window holds: collaterals open only in Mortal Vessel. Breaking through to Foundation with collaterals closed shows a warning (`col_warn`), then seals them (`james.colSealed`). **The next rewind unwinds the breakthrough:** James and Yuki back to Mortal Vessel (every realm since gone), Saturation 0, Yuki's form cat; the collaterals open again. Meridians already open and the extra meridians stay.
  - **Mid-build stop:** (1a) a dead end at `rt_truth` (only choice needs 12 Qi; Meditate there could drain it; possible since v0.9.5): `rt_truth` joins the no-Meditate list. (2) Session XP **standard**, not challenging: challenging made the Coil 1 tribute 44% won; standard 25% (old v0.9.5: 13%), none 15%.
  - **Numbers measured (bots, before):** closed bars at realm 0: James Qi Max 25.5 (open 40.5; +1.25 per primary), regen 5.0% (11.6%; +0.1 per collateral), Yuki Qi 20.5 (32.5); a sit gives +19.6% Saturation at 25.5 Max (+12.3% at 40.5).
  - **Act 1's Coil (6):** as proposed; see the v0.9.6 section.
  - **Bots after v0.9.6** (closed start, bots use Meditate now and then): tribute won Coil 1 24% / Coil 2 62% / Coil 3 66% (lost 62 / 6 / 1%); primaries at the tribute about 7 / 11 / 12; 26 Act 1 rewinds at Shen Qiu.

- **Cards everywhere, before the balance (owner 07:42; picks 07:50 "1b, 2a, 3a, 4ok, 5a, 6 …, yes, 7a, 8a, 9 ok, 10a"; go 07:52; built in v0.9.5 as push 1 of 4):**
  - **Four pushes:** 1 cards everywhere (whole game), time on every choice, the Meditate card — **DONE in v0.9.5**; 2 meridians closed at the start + Act 1's Coil; 3 severe difficulty (replaces 3c-2); 4 = 3c-3 (Tasks on by default, speed gate).
  - **Story cards (2a):** every story choice is a card with a bar; when it fills, the result and the next scene appear; story cards don't queue.
  - **Time (3a):** a choice with no time takes talking 10 min, moving to another place 20, an action (check, Qi or items) 30; hand-set times stay; fights add none; hub ↔ menu steps and meta screens add none.
  - **Layout (4):** top = the picture (title and place on it) and the story text only; below: status, speed and ⏸, the bars, Cards | Results; fights: the round on top, the actions as cards.
  - **Meditate card (5a):** everywhere but fights, the scream (`herb_girl`), the tribute, Shen Qiu (`rt_elder`), the Coil and meridian / breakthrough screens; Cultivate (condensation) lives here, plus Open a meridian and Break through.
  - **Push 2, meridians (6, owner):** new games start with **0 of 12 primaries and 0 of 66 collaterals**; about **20 sessions** open everything: **12 for the primaries (one each), 8 for the collaterals in sequential groups** (each group after its primaries); **the breakthrough to Foundation needs all 12 primaries**; old saves keep what they have. Act 1 gets its own Coil (rewind to Day 8 dawn, the prologue's outcome kept) (8a).
  - **Push 3, difficulty (7a, 9):** in task mode HP 0 anywhere ends the Coil (starving, beasts); lost fights against people (Gao, the tribute, Ya, Shen Qiu) keep their written branches. Targets on a normal run (no Long Forest): dead before Mei Lin about 80 / 40 / 15% on Coils 1 / 2 / 3; tribute won about 30 / 55 / 80%. Levers to measure: faster Fed drain, smaller hauls, harsher starving, a Fed bar for Yuki, closed meridians. Numbers to the owner first.
  - **Classic (10a):** unchanged, the fallback behind the switch until Tasks becomes the normal mode.
  - **Two more dead ends (found by a sweep of 3,000 low-Qi games; picks 07:58 1a, 2a):** the rain night now has "Get wet. Sleep anyway." (to morning); "Show him the truth…" (Shen Qiu) needs 12 Qi. A re-sweep finds none.
  - **Bots after v0.9.5:** tribute won Coil 1 12% / Coil 2 62% / Coil 3 68%.

- **Step 3c (01:22–01:43, owner: "ok with your recommendations", go 01:34; built in v0.9.4 as 3c-1):** three pushes: **3c-1 the Coil** (done), **3c-2 balance** (measure Coils 1–3 with bots, then pick an HP lever with numbers: risky cards ×1.5 or sleep heals 50%; tune the collectors and the bluff DC toward ~30 / 55 / 80% won on Coils 1 / 2 / 3; numbers to the owner first), **3c-3** (Tasks on by default with classic kept as a switch until step 5; the speed gate ×2 after the first won tribute, ×5 after Act 1, ×10 removed, plus a hidden "test speeds" toggle in Saves). The Coil turns in the **prologue only** for now; Act 1 gets its Coil in step 5. A collapse (HP 0 during tasks) ends the Coil (no stand-in). The serpent stays its own small push after 3c.
- **Pause (owner 01:31 "I don't see the pause button"; pick A):** a ⏸ Pause / ▶ Resume button next to James's bar on every task screen (the speed box stays under the clock).
- **Knowledge flags (pick B, 01:37):** James keeps `lore1`, `lore_realms`, `lore_tree`, `saw_lights` (plus Yuki's flags, `long`, `longforest`, `lf_instant`); `roots`, `bone_sung`, `gills`, `fungus` lock one-time actions, so they reset with the world but the Coil remembers them (shown on the Coil screen; to become Insights in step 4).
- **Far hunt dead end (found by the bots, pick A, go 01:43):** ash-deer with under 2 Qi left no way out; the deer now also have "Let them go. Not today." (1 h, back to Ashfall), in both modes.
- **Bot numbers after 3c-1 (2,000 games, random bots that rewind a lost tribute up to Coil 3):** tribute won Coil 1 16% / Coil 2 60% / Coil 3 67%; lost 82% / 15% / 4%; 93 collapses. Input for 3c-2.

- **Step 3 is split into three pushes (option 1), behind a preview switch** that becomes the normal mode at the end of 3c: **3a the task loop** (done in v0.9.0), **3b getting better** (familiarity, Intuitive Aptitude, Yuki's lane, drills), **3c the Coil** (reset B, Coil screen, Bite the tail, accept-or-rewind at the tribute, breakthrough from 95%, bots tune the tribute ~30% → 80%). Then the serpent (`rt_serpent`) as its own small push, numbers to the owner first.
- **3a picks:** 1a daily limits stay ("back tomorrow"); 2a Day 1 (`stream`) and Day 4 (`village`) stay story until rewinds exist; 3a HP 0 during a task = stand-in collapse until the Coil.
- **Speed drop-down (owner 00:17–00:19, picks 1b, 2a, 3a, go; built in v0.9.1):** Pause, ×1, ×2, ×5, ×10 next to the clock on the task screen, remembered per phone (`boneash.speed`). Pause stops the bar without cancelling it. **All open for testing until the switch becomes the normal mode at the end of 3c;** then the gate: ×2 after the first won tribute, ×5 after Act 1 ends (per act, as in the design), and ×10 goes away.
- **3b decisions (00:27–00:49), built in v0.9.2:**
  - **Harder** (owner: "everything should be harder", "the checks should be harder"): DC +2 on new cards, length ×2, failures hurt double, Fed −4 an hour while tasks run; familiarity earns it back.
  - **No dice on task cards** (owner: "pure level vs. DC"): result = check ÷ DC, partial results (1b). Task cards only now; the story checks (bluff, hairpin…) and fights keep the d6 until 3c (2a, 3a).
  - **DC scale K 2:** card DC = old DC − 2 (the d6 averaged 3.5), plus +2 new / +1 Practised / +1 Skilled / +0 Mastered.
  - **"Start from scratch"** dropped: the owner meant the wins came from the dice.
  - **Intuitive Aptitude** is a constant trait (owner: "constant adaptation and rapid understanding"): learns from setbacks (+0.5 per below-full result, up to +2 per card) and transfer (a quarter of each completion to the card's group). The old "first try −2 DC" is dropped.
  - **Door cards** (owner 00:41 "make everything that was supposed to become a card into a card now", confirmed 00:43): this reverses the 3a pick 2a (Day 1 and Day 4 now have cards).
  - **Layout** (00:47, recommendation 1 + 3 + 2 on wide screens): story on top, then Cards | Results; results are one-line summaries, newest on top, tap to unfold; side by side from 700 px wide.
  - **Measured before building** (Day 2–3 in the forest, K 2, deterministic bot): Coil 1 Day 2: 6 cards, 0% full, 50% partial, 50% fail, +7 food; Coil 2 Day 2: 8 cards, 51% full or double; Coil 3 Day 3: 12 cards, 91% full or double. HP never below 73% and no collapses in that sim, so the HP threat is a 3c item.
- **No dice anywhere (owner 01:00 "my intention was no dice anywhere"; picks 01:02 "go with your recommendations", go 01:19; built in v0.9.3):** story checks pass at check ≥ DC (same −2 scale, outcome shown on the choice; gathering choices can be partial); fights in bands (2a); task mode only, classic kept as a fallback until 3c (3a); event picks stay seeded (4a); retune targets: small ~70%, middle ~50%, bosses ~30% (5). Also: full task names in Results (1a, 01:05) and partials drop their HP sentences (2a, 01:05).
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
  6. **The Long Forest** becomes a New Game preset ("Nascent Soul start"), not a choice in the clearing.
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
| `js/core/tasks.js`, `js/story/task_hubs.js` | Task cards and the queue (v0.9.0): which hubs, card ids, `runTask`, dry runs, the outlook; the speed gate `maxSpeed` / `effectiveSpeed` (v0.9.8). |
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

## Story map (prologue)

The **long route** (v0.4.0, flag `long`, set on the first forest night) runs 7 days. Old saves without the flag keep the original 3-day route.

**Day 1:**
- `arrival` → `yuki_check`, `scan_ok` / `scan_bad`, or `clearing` → `first_bone` / `meditate1` → `stream` hub (drink, `forage`, `hunt`) → `camp` → `night`.
- `night` → `nightNext()`: `night_event` on nights 1–2, `night_attack` on night 3 or the night after `stream_out`.

**Nights 1–2 (`js/story/wilds.js`):** `night_event` rolls one of six (seeded, no repeat in a row): `lights` (lore flag `saw_lights`), `rain`, `gift` (Yuki brings a fowl) — quiet; `crows`, `rats`, `lizard` — fights → `night_won` / `night_lost` / `night_fled`. Then `morning` (sleeps, `forest_day` +1, breakfast).

**Days 2–3 (`wilds` hub):** `wild_forage` (mushroom ring, river cress, honey tree, berries — once a day each), `wild_hunt` (hare, mire fowl, stone-shell crab, Yuki alone), `wild_train` (darts, blade, footwork with Yuki, needles), `wild_explore` once a day → `bone_field` (`bone_sung`, bone-meal → `stakes_hard`), `mire` (ghost-gill heals 8 HP; optional rat fight), `hollow` (free condensation, `roots` foreshadowing the dead tree); cultivate, rest, eat, make camp (from 15:00), or `stream_out` (leave early: jackals that night).

**Night 3:** `night_attack` → jackals (a third, the yearling, on night 3) → `jackals_won` / `lost` / `fled` → `dawn` (Day 4).

**Day 4:** as before: `herb_girl` (Gao Feng) → `gao_*` → `mei_lin` → `lore` / `village` (`vday` 1). `ridge_alone` if ignored. Village: `elder`, `heal`, `village_hunt` (boar). Evening → `nextEvening()`: `supper` on village days 1–2, `evening` on the last.

**Days 4–6 nights (`js/story/ashfall.js`):** `supper` → `supper_roof` / `village_night`. On night 5 `village_night` depends on Gao: **dead** → his jade token pulses (silence it: `token_silenced`); **spared** → he comes to warn you (`gao_turned` removes him from the final fight, or `gao_warned`); **otherwise** → Pock-Face tries to burn the herb loft (`arson` fight or wake the street; lost → `loft_burned`). → `village_morning` (`vday` +1).

**Days 5–6 (`ashfall` hub):** leftover elder/heal/boar; `herb_slopes` (Mei Lin, spirit grass); `clinic` (`clinics`); `workshop` (needles, `spears`, `plough`); `drill` (`militia` count); `wen_lesson` (`lore_realms`, `lore_tree`); `far_hunt` (wolves / thornback bull / ash-deer); `scout` (day 6, `scouted`); `mei_walk` (sunset); communal pot; cultivate; rest; evening from 16:00.

**Day 6 night:** `evening` → `evening2` → `romance` / `tribute_dawn_talk` / `tribute_dawn_sleep`.

**Day 7:** `tribute`. Fight: militia and spears take up to 6 HP off Lu Han; `gao_turned` removes Gao. Bluff (GU, DC 6, minus half the days trained): +1 each for healed, boar, Gao beaten, scouted, Gao warned/turned, token silenced, Village friendship 40+. Hairpin: Convergence Use DC 4 minus the same. Outcomes as before → `epilogue`.

**Characters:**
- Mei Lin: 26, herb-gatherer, sharp-tongued.
- Her mother.
- Old Wen: village elder, 90.
- Gao Feng: Crimson Lotus outer disciple, can be killed or spared.
- Lu Han: inner disciple.
- The Crimson Lotus Sect.

**Flags that matter for Act 1** (v0.4.0 adds `sky_witness`, `foundation_day`, `saw_lights`, `roots`, `bone_sung`, `lore_tree`, `token_silenced`, `gao_turned`, `loft_burned`, `militia`, `plough`, `clinics`):
- `ending` (fought / bluff / paid / lost);
- `gao_dead`, `gao_spared`, `gao_humiliated`;
- `romance`, `healed`, `boar`, `ignored`;
- Mei Lin relationship values in `rel`.

## Design notes (visual) — v0.2.0 "ink and manhua"

- **Look:** ink on rice paper. Backgrounds are public-domain Chinese ink paintings (12 scenes, `PAINTED` in art.js) or code-drawn ink wash (stone pillars, floating rocks, sumi-e pines, ink spirals). Figures and Yuki are **clean manhua line art**: black lines, one flat grey tone, simple manga eyes. Close-ups (`PORTRAITS`: `mei_lin`, `yuki_close`) are full manhua portraits.
- **One accent colour:** cinnabar red (the sun, the Sect, blood, fire, seals, tassels). Yuki's eyes stay gold.
- **Palette:** paper `#ece8df`, ink `#23211e`, dim ink `#77716a`, red `#a02c2c`, cel tone `#d9d3c8`. `inkOf()` in art.js maps any old scene colour to ink of the same weight (reds stay red).
- **Figures** (`person()` in art.js): about 7½ heads tall; styles `james` (lab coat), `mei` (high-waisted ruqun, pibo shawl, bun and pin), `sect` (red robe, crown, sword), `man` (tunic, trousers), `plain`.
- **UI:** paper background, red 骨 seal by every title, choices marked with brushed ink circles (red for fights), brush-stroke bars and tab underline, ink-circle dice.
- **Fonts:** Shippori Mincho for titles, Literata for body text.
- **Art IDs** are made unique per scene key (`sk-<key>`, `gw-<key>` …), so several images can share a page.
- **v0.5 look (`STYLE = 'clamp2'`, `js/art/clamp2.js`):** redrawn from scratch after the CLAMP references, on the public-domain paintings (`art/bg`). `figure(kind, x, y, s, {face, sway, sword, spear, sit, shut})` with kinds mei, woman, mother, james, sect, lu, man, thug, elder; `yuki()`; close-ups `meiCloseUp()` (three-quarter view) and `yukiCloseUp()`; `shoji()` interiors with butterfly shadows; `smoke()`, `butterfly()`, `curl()`, `crescent()`. Scene table `SCENES2` in art.js (background image, wash, night darkness, interior). Older looks (`clamp`, `ink`) still switchable.
- **Art direction (Gábor, 2026-11-02): imitate CLAMP's *xxxHolic* style as closely as possible** — stark black and white, vertical screentone, elongated elegant figures, long cascading hair in strands, narrow half-lidded eyes, ornate jewellery, curling cloud (xiangyun) motifs, lotus. Style only: never copy a CLAMP character or page. Palette for it: black, white, greys, red (Gábor OK'd greys 2026-11-02). Full-body figures: `js/art/figures-clamp.js` (`clampPerson`, `clampCat`; ~9 heads tall, rope hair, hanging sleeves, robes with grey cloud swirls and a red crescent). `STYLE` in art.js: `'clamp'` (line art over screentone) or `'ink'` (the v0.2.0 ink-wash look over paintings). He also wants the tone more serious later.

## Act 1 — "The Hearth Tree" (v0.6.0, Days 8–21, 182 scenes)

The bible and the contract between the four part files are at the top of `js/story/act1_common.js` (cast, tone, lore, entry/exit ids, helpers, art keys). The epilogue now continues with "Act 1: The Hearth Tree." → `fo_start`.
- **Part 1, Fallout** (`act1_fallout.js`, 40 scenes, Days 8–10): the Sect's answer by prologue ending (letter / envoy / Lu Han / ultimatum) → Outer Elder Shen Qiu named for Day 21; hub `fo_ashfall` (palisade, council, drill, clinic, Mei Lin, mother); Ya arrives Day 9 (optional brawl `ya_brawl`); Day 10 the plan, Ya's price, Mei Lin insists; depart.
- **Part 2, Into the Blackroot** (`act1_blackroot.js`, 59 scenes, Days 11–15): Root Road (bone-elk, root-wyrm boss), Drowned Wood (drowned dead, mire serpent, hot spring), Ashen Hills (cinder hawks, rot-ape boss); camp nights with random events; the triangle (`trio` 2–3), Ya romance (`ya_romance`).
- **Part 3, The Heart** (`act1_heart.js`, 38 scenes, Days 16–18): inside the dead Hearth Tree; the seed-ship *Patient Root*, Head Gardener Wren Aldous's log (the Crimson Lotus founder cut out the tree's heart ~400 years ago; since then the Qi is poisoned); the Guardian (fight or calm with Convergence); seed-sliver.
- **Part 4, Return** (`act1_return.js`, 45 scenes, Days 19–21): the road home, planting the seed (a singing grove), the night of Day 20 (throuple if `likesMei && likesYa && trio ≥ 3`, else single romance or none), Shen Qiu on Day 21: duel / parley / show him the truth → `a1_outcome` victory / accord / revelation / taken → `a1_end`.
- **Ya** (27): the feral huntress; crude, funny, aggressive flirt, easily offended, picks fights, open to sharing; second romance; she wears down Mei Lin's resistance if James is drawn to both. Romance always fades to black (Claude's limit).
- **Attraction:** `likesMei` = prologue romance or Mei Lin affection ≥ 60; `likesYa` = `ya_romance` or Ya affection ≥ 85. Random-play outcomes: throuple ~39%, Ya ~40%, Mei Lin ~16%, none ~2%.
- **Fights:** `encounter()` in act1_common; `a1Scale` is 0 and every fight is tuned in absolute terms by `js/story/act1_tune.js` (per id, t raises DC and attack by t and HP by 10%·t), set by 7 rounds of 500 full-game simulations. Targets (smart combat, random story choices): small ~93%, region bosses ~80%, Ya brawl ~80%, Guardian ~55%, Shen Qiu ~40%. James grows a lot during the act (GU check ~3.6 at Day 8 → ~7.6 at Day 21).
- **Tests:** `node tests/part.test.mjs <fallout|blackroot|heart|return>` tests one part alone; `tests/story.test.mjs` runs 2,000 full games (step cap 2,500, 200 combat rounds).

## v0.7.0 — The Long Forest, power degrees, Yuki's forms

- **The Long Forest** (`js/story/longforest.js`, 31 scenes): an optional, uncounted pre-prologue. In the clearing: "Stay lost." → `lf_enter` → hub `lf_hub` (seclusion with big XP and Saturation, hunting/foraging, trials in 4 zones, wanderers). The clock shows "The Long Forest" (`g.flags.lf_active`). Exit: "Follow the smoke…" → `lf_exit` sets Day 4 06:00 (`long`, `forest_day = 3`) → `dawn` → the scream → Mei Lin. ~30 seclusions reach realm 6–7 with GU check ~35+. A cheat mode on purpose.
- **Power degrees** (`js/story/power.js`): `jp = max(GU, CU check) + 0.3·realm`, `ep = max(DC, atk − 1)` of the strongest enemy; gap ≥ 4 → degree 3, ≥ 1 → 2, else 1. Degree 2/3 swap in STOMP texts (posture before the fight, a funnier win scene with groveling or revenge-swearing). Degree 3 adds "End it in one move." (choice index 1000+i; `instantWin`). After a Long Forest run, every later fight is degree 3.
- **Scaling with a ceiling:** with `g.flags.longforest`, enemies are lifted toward James (DC ≈ GU + 1.5, atk ≈ GU + 3) but never past `DC_CAP` 7 / `ATK_CAP` 9. Past that, a massacre. Normal runs untouched.
- **STOMP texts:** `js/story/stomp_prologue.js` (11 fights), `stomp_act1.js` (20), plus 10 in longforest.js.
- **Unseen cultivation:** locals can't sense James's cultivation and treat him as a mortal; postures are written that way.
- **Never kills humans** (global): he breaks them — knocked out, very nearly crippled. The Gao event is now "Break him" (`gao_broken`).
- **Yuki's forms** (`YUKI_FORMS` in game.js): cat; tiger-sized root-kin from realm 2 (Core Formation); humanoid (white hair, cat ears, black dress) from realm 7 (Nascent Soul). Awakening scenes `yuki_tiger_awaken` / `yuki_human_awaken` after the breakthrough; then "Yuki: change form." on hubs (`yuki_form`). Art: `yukiCat`/`yukiTiger`/`yukiHuman` in clamp2.js.
- **Tune after v0.7:** `act1_tune.js` re-picked (ya_brawl 2, root_wyrm 1, guardian 7.5, elder 4.5). Normal-run smart win rates: Ya brawl ~83%, wyrm ~85%, Guardian ~50%, Shen Qiu ~46%.

## v0.7.1 — tidy menus, item caps

- **Ghost menus hidden** (`js/core/story.js`): a plain menu entry (Hunt, Forage, Train…) is hidden when its sub-menu (no `enter`) has nothing left today but a plain "Back" choice. Comes back the next day.
- **Hammerspace caps** (`game.js`): 99 of every item, 999 of `beast_core` and `spirit_grass` (`BIG_CAP`). `addItem` stops at the cap and the turn shows "Hammerspace: X is full". A gathering choice whose items are all at cap is hidden (items read from its `do` source), unless that would empty the scene. Old saves above a cap keep their pieces.
- Test: 200 walks with every common item at its cap (no dead ends).

## v0.7.2–0.7.3 — criticals

- **Critical = total (skill + d6 + bonus) ≥ 2 × DC** on a success (`rollCheck` → `crit`; `six` marks a natural 6, which still always succeeds but no longer crits).
- Hunt/forage: a critical doubles every item the choice gives (`setLootMult(2)` around its `do`; "Critical! A double haul — in total: …"). Caps still apply. Measured critical rate on hunt/forage rolls: prologue ~44%, Act 1 ~70%, Long Forest ~89%.
- Combat: a critical hit does double damage (replaces the old +2 on a 6).
- Re-balance: enemy HP factors per fight in `js/story/fight_tune.js` (`HP_TUNE`, applied in power.js `prepare`, HP only so DCs and crit odds stay). Tuned back to the v0.7.1 win rates (bal1 sim): collectors ~54%, thornback ~85%, wolves ~87%, Ya brawl ~84%, root-wyrm ~85%, Guardian ~63%, Shen Qiu ~57%.

## v0.7.4 — no greyed-out choices

- Choices you can't take right now (not enough Qi, a `req` not met) are hidden instead of greyed out (`lockReason`/`visible` in story.js); they come back when they're possible. A menu entry whose sub-menu has only "Back" left (after hiding) disappears too. If hiding would leave a scene empty, everything shows as before.

## v0.8.0 — the extra meridians

- `js/story/meridians.js`: Extraordinary 8 (Governing, Conception, Thrusting, Girdle, Yin/Yang Linking, Yin/Yang Heel), their 28 collaterals, 10 junctions — engine windows: Extraordinary realm 1–6 (seal at Nascent Soul); collaterals NS+ after all 8; junctions NS+.
- Menu `meridians` ("Open a meridian." on every breakthrough hub; hidden when nothing can be opened). Each: 2 Qi, 1 hour, Convergence Use vs DC (Extraordinary 4→11, collaterals 6→12, junctions 8→12), challenging XP; one opening per group per day.
- **Effect (Gábor 2026-11-02): Qi regen % per Cycle** +0.5 per Extraordinary, +0.1 per collateral, +0.3 per junction (`extraRegen`/`qiRegenPct` in game.js): 11.6% → 21.4% with all 46. Not capacity. Combined with tier-shortened Cycles (T1 30 min … T6+ 1 min) = the endless battery. Yuki mirrors James through the bond.
- `ns_warn`: the breakthrough to Nascent Soul with fewer than 8 Extraordinary open warns first and lets you back out.
- Check DCs may now be functions (`check.dc(g)`).

## v0.8.1 — realm toughness (option C, engine DR)

- game.js: `HP_REGEN` by realm (MV 5% … Soul Embryo 11%, NS 15, ST 20, IA 30, Mahayana 50, Earth Immortal+ 100% per Cycle); `jamesDr` = Ouroboros 1 + engine `realmDr` (IA 2 … HI 64), Yuki gets realm DR; in fights from IA both heal `realmShockHpBonus` (2, 4, 8…) per round; `hitDamage`: from Nascent Soul, damage from a lower-realm enemy halves per realm of gap; from Earth Immortal, 2+ realms below = 0. HP limit unchanged.
- Enemy realms: `ENEMY_REALM` in power.js (Shen Qiu 2, Gao Feng / Lu Han / Fang Wei / Sect watcher 1, everyone else 0). With today's enemies James takes ~0 damage from Nascent Soul on.
- Normal runs: no change beyond noise (bal1, 3000 games).

## v0.8.2 — the Long Forest in one button

- The clearing's "Stay lost." now runs `longForestInstant` (prologue.js): realm Nascent Soul (James and Yuki), GU / Convergence Use / Yuki's Fight / Qi Use T10 L10 (check 50), all 46 extra meridians open, every stock item (`LF_STOCK`) at its cap, flags `longforest` (enemy scaling to the cap, stomp texts) and `lf_instant`; Yuki's tiger and human forms unlocked. Goes straight to `lf_exit` → Day 4. Result: HP 60, Convergence 117.5, Qi regen 21.4%.
- The walkable Long Forest (`lf_enter`, `lf_hub` …) has no entrance any more; the tests still walk it from `lf_enter`.

## v0.8.3 — Bonesinger tiers T1–T10, skill cap

- `BONESINGER_TIERS` (game.js): Gábor's james3/james3b ladder rearranged to ten rungs (T1 added for this game; the old "T9 L10 conceptual mastery" is T10).
- In fights (Convergence Use tier): damage × tier; Qi cost × engine `dampenMultiplier`; T3+ pierces enemy DR and wraithbone plates give +1 DR per tier from T3 (`armourDr`, T10 +8); T4+ darts hit 2 enemies, T5+ all; T7+ a construct strikes each round (tier × 1–3); T8+ it takes the first blow aimed at James each round; T10 constructs never miss.
- Cap: every skill (James's and Yuki's) stops at T10 L10, XP past it is lost (`SKILL_MAX_TIER`, `atSkillCap`); enemies' DC and attack cap at 50 (`ENEMY_CAP` in power.js).
- Normal runs: no change ≥3 points (Convergence Use stays T1 through Act 1).

## v0.8.4 — Yuki's path, every romance arrangement

- `js/story/yuki_path.js`: the first time Yuki is human (one-button Long Forest → `yk_choice`; normal run → after `yuki_human_after`) she asks: sister or lover (`g.flags.yk_path`). One-button Long Forest also sets Yuki friendship/affection 150/150.
- Sister: sassy, protective, pushes James toward Mei Lin and Ya (`yk_sister_talk` at Blackroot camps: +affection to both). Lover: open to sharing; `yk_camp` nights at Blackroot camps (human form only) raise `yk_mei` when James likes Mei Lin — Yuki wears down Mei Lin's resistance alongside Ya (`meiOpen` = trio ≥ 3 or yk_mei ≥ 2).
- Beats appended to lf_exit, mei_lin, romance, epilogue, ya_meets, log_comfort, rt_camp, rt_evening, rt_quiet_night.
- Last night of Act 1 (`rt_evening`) offers every arrangement the hearts allow: Mei Lin · Ya · Yuki alone; Mei Lin + Ya (`rt_trio`); Yuki + Mei Lin (`yk_night_mei`); Yuki + Ya (`yk_night_ya`); all four (`yk_night_all`). `g.flags.final_night` records it; `loveLine()` writes the Act 1 epilogue line (a1_end).
- Romance with Yuki only in her human form (adult); fade to black. The code still says she bonded with James when he was six (34 years); **decided 2026-11-05: born together and bonded from birth** (fix pending, roadmap step 7).
- Tests: 240 extra walks over the last night; combat round cap in the random runs raised to 400 (a rare long stalemate vs the Guardian at True Core).

## v0.9.8 — Tasks by default, the speed gate (3c-3)

- **Default** (`main.js`): `taskMode = store.get('boneash.tasks') !== '0'` (was `=== '1'`). Saves tab: "Game mode" (`h2[data-modehead]`) with Tasks / Classic buttons (`data-tasks` set only on the mode that is off).
- **Gate** (`tasks.js`): `maxSpeed(g, test)`: 10 with test speeds; 5 if `flags.spd_a1` or (`a1_outcome` and scene `a1_end`); 2 if `ending` is fought / bluff / paid; else 1. `effectiveSpeed(g, stored, test)` = min(stored, gate), 0 stays 0. `main.js` fills the bar with `runSpeed()`, lists only allowed speeds, and keeps `boneash.speed` as the player's choice.
- **`a1_end`** got an `enter` that sets `spd_a1`.
- **Test speeds:** 5 taps on the Game mode heading show the button; `boneash.testspeeds` = `'1'` keeps it shown and every speed open.
- **Tests:** the tasks test checks ×1 new, ×2 for each won ending, lost stays ×1, ×5 at `a1_end` (victory and taken), an old save at `a1_end`, test ×10, a stored ×5 held to ×2, pause stays pause.

## v0.9.7 — severe difficulty (task mode)

- **Deaths end the Coil** (`coil_scenes.js` installs two hooks; both only when `coilActive`, i.e. task mode, the prologue before the tribute is settled, Act 1 before Shen Qiu is settled): `setDeathHook` (story.js `checkDeath`, run at the end of every `choose` and after a Meditate sit): HP ≤ 0 outside a fight → HP 1, queue cleared, `endCoil('collapse')`, `coil_end`. `combatHooks.lose` (game.js `loseTo`, both lose paths of a fight): a fight not in `PEOPLE_FIGHTS` → `endCoil('beast')`, next = `coil_end`. Task collapses during a queue work as before (tasks.js).
- **People** (`PEOPLE_FIGHTS` in game.js): `gao`, `collectors`, `arson`, `ya_brawl`, `rt_brawl`, `elder`, `sect_watcher`, `lf_rogue`.
- **Beasts +0.5** (`BEAST_UP` in game.js, added in `startCombat` on top of `NO_DICE_TUNE`, no-dice only).
- **Tribute +1** (task mode): bluff DC `6 + 1`, hairpin DC `4 + 1` (functions of `isNoDice()` in prologue.js), `NO_DICE_TUNE.collectors.up` 1.0 → 2.0.
- **Coil screen:** `WHY.beast` text; "Accept it" still only after a lost tribute or Shen Qiu.
- **Tests:** starving to 0 ends the Coil, no Accept after a death, a lost beast fight → `coil_end` with the beast text, a person keeps `gao_lost`, beasts +0.5 (task mode only), tribute DCs 7 / 5 in task mode and 6 / 4 in classic, classic beast losses and starving unchanged. Bots: deaths per act and Coil printed; 1 run in 5 rewinds Act 1 at Shen Qiu once; a bot stops counting after Coil 6 of an act.

## v0.9.6 — meridians closed at the start, Act 1's Coil (task mode)

- **Closed start** (`newGame(seed, { closed })`; `main.js` passes `closed: taskMode`): James and Yuki 0 / 12 primaries, 0 / 66 collaterals. Classic new games and every old save: 12 / 66 (no migration needed for this). The Long Forest button sets 12 / 66.
- **Sessions** (`js/story/meridians.js`, on the `meridians` screen via Meditate → Open a meridian): `PRIMARIES` (12, Lung → Liver, a line each), `COL_GROUPS` (8: size, `need` primaries). Each: 2 Qi, `SESSION_MINUTES` 120, Convergence Use, standard XP, `SESSIONS_PER_DAY` 2 (flag `mer_s@<day>`). DCs: `dcPrimary` 2.5 + 1.5·k/11 (2.5 … 4.0), `dcColGroup` 3 + 0.25·k (3 … 4.75). Fail: `failDo` uses the session and adds 0.5 to `g.tasks.adapt['mer:pri' | 'mer:col']` (up to 2, cleared on success; shown as the check's bonus). Yuki's counts copy James's after each opening. Engine window: both only at realm 0. `colGroupsOpen` rounds down for counts off a group boundary.
- **Foundation gate** (`game.js`): `breakBlock` ("needs all 12 primaries (n/12)"), `breakReady`, `canBreakThrough = breakReady && !breakBlock`. The Meditate card shows a locked Break through with the reason. `btTarget` (meridians.js): realm 0 with collaterals < 66 → `col_warn`; realm 6 with Extraordinary < 8 → `ns_warn`; else `breakthrough`. `breakthrough()` sets `james.colSealed` when leaving realm 0 with collaterals < 66.
- **The unwind** (`rewind` in coil.js): if `colSealed`, James and Yuki go to realm 0, Saturation 0, Yuki's form cat, `colSealed` false; `g.coil.unwound` makes `coil_dawn` say so. The Coil screen and the James tab warn before the bite ("Foundation unwinds").
- **Texts:** `yuki_check` has a closed version (grey meridians under ash; the crossing burned out the frames; sessions, plural); Old Wen and Lu Han describe Yuki's meridians by count (`yukiMerElder`, `yukiMerLu`); the meridian screen describes the closed net, the daily limit, the window and the seal; James tab row via `meridianRow`.
- **No Meditate on `rt_truth`** (its only choice needs 12 Qi).
- **Act 1's Coil** (state 5, `g.coil.act`): `startActCoil(g, 1)` runs after `fo_start`'s enter on the first arrival: a new Coil (n 1) whose snapshot is Day 8 06:00 with the prologue's outcome; the prologue's count goes to `g.stats.coils0`; what James remembers carries over. `coilActive` for act 1: no `a1_outcome` yet or `taken`, not `a1_end`. Ends: "Bite the tail" on `rt_taken` (why `shen`; "Accept it. Walk." → `a1_end`), the James tab, a collapse during tasks. `coil_dawn` has a Day 8 Ashfall text (`ashfall_dawn`). `REMEMBER` adds `ship_found`, `log_heard` (shown, reset with the world). Migration 4 → 5: `inAct1(g)` (an ending, not the epilogue, at or after Day 8 06:00) → an Act 1 Coil from the save as loaded; otherwise `act` 0.
- **Tests:** tasks test — closed and open starts, bars, groups, a session (2 Qi, 2 h, Yuki mirrors), the daily limit, a fail with +0.5, the Foundation gate and its card, the warning, the seal, the unwind on rewind (and no unwind without a seal), the Long Forest, the scan text, Act 1's Coil (start, bite at `rt_taken`, the screen, Day 8 again, head start, accept), migration 4 → 5, classic shows no Coil at Shen Qiu; bots start closed, use the Meditate card (meridians, breakthroughs) and 1 run in 10 rewinds Act 1 once. Story test walks `col_warn` and the Act 1 Coil scenes.

## v0.9.5 — every screen as cards (task mode)

- **Screen** (`renderCardScreen`, `renderCombatCards` in main.js; classic keeps `renderStory` / `renderCombat`): the picture with title and place, the story text; then `.below`: status (the speed box now on every screen in task mode), the last result, James's bar with ⏸ / ▶, on hubs Yuki's lane and the outlook, Cards | Results. Cards: **Story** (every visible story choice; on hubs the stops), the hub's task groups, **Meditate**. Fights: the round log as the story text, foes, the actions as cards.
- **Story cards:** `data-story`; the bar length is a dry run of the choice on a copy (`storyMinutes`); 0 minutes (a fight starts, a screen opens) happens at once. `running.kind` is `'story'` or `'med'` for these bars (cancelled if the scene changes); a story card stops a running task bar (nothing of it happens). `playChoice` does what a tap did before; story results also go to Results.
- **Time on every choice** (`defaultMinutes` in story.js, task mode only): no `time` → an action (check, Qi or items) 30, moving to another place 20, else 10; added after the move. None for fights, ends, meta screens (`TIMELESS`), and hub ↔ its menus (`setTimeless`, registered by tasks.js). Door cards include it in their bar.
- **Meditate** (`js/core/meditate.js`): `NO_MEDITATE` screens excluded; cards: Cultivate (on a hub the hub's own cultivate card, queueable, same id; elsewhere `med:sit`, 30 min), Open a meridian (`med:mer`), Break through (`med:bt`). `med_back` makes `go()` skip the scene's enter on the way back. In task mode the hubs' old "Break through" / "Open a meridian" choices are hidden, and plain cultivate-and-come-back choices (`isSitChoice`) leave the Story group.
- **Fixes:** rain night "Get wet. Sleep anyway."; "Show him the truth…" needs 12 Qi.
- **Tests:** default times, Meditate on 250+ screens and none on the excluded ones, a sit keeps the scene, a meridian and back without the enter running twice, the hub sit card; all bots in task mode now pay the default times.

## v0.9.4 — step 3c-1, the Coil (task mode, prologue only)

- **State 4** (`g.coil`, migration 3 → 4): `{ n, snap, wake, start, peak, played, replay, why, back, known, skipEnter }`. `snap` is the rewind point: a new game's Day 1 dawn (`newGame` → `makeCoil`), or an old save as it was loaded (log emptied, queue empty). `start` is what James was at the Coil's start (the screen compares). `peak` is each relationship's highest friendship and affection this Coil (kept up by `bumpRel`).
- **A Coil ends** (`endCoil(g, why, back)`): `collapse` (HP 0 during a task: `collapse()` in tasks.js now goes to `coil_end`; the old dusk stand-in is gone), `tribute` (a "Bite the tail" choice on `collectors_lost`), `choice` (James tab → The Coil → Bite the tail, tap twice). `coilActive`: task mode, prologue (no tribute outcome yet, or the lost one), not in a fight.
- **Rewind** (`rewind(g, { same })`, reset B): back to `snap`. Kept: all of `g.james` but HP, Qi, Fed (from the snapshot) and injuries; all of `g.yuki` but HP and Qi; familiarity, adaptation, Yuki's lane on/off; `KEEP_FLAGS`; stats; the journal (last 150) with a "Coil N begins" line; the dice state. Reset: hammerspace, every other flag, the queue. Relationships other than Yuki: `max(snapshot, round(25% of the peak))`, friendship and affection apart; Yuki's kept.
- **Coil screen** (`coil_end`): why it ended, this Coil's gains (realm, GU, Convergence Use, Yuki's Fight, cards that reached a new familiarity tier), what James remembers (`known`: the knowledge flags and `REMEMBER`). Choices: Bite the tail (→ `coil_dawn`); Bite the tail and run the same days again (shown if cards ran; every task screen re-queues what the last Coil ran there on that day, once: `recordCard` / `coilPrefill`); Accept it (after a lost tribute: → `epilogue`, the lost ending); Not yet (after the James-tab bite: back where you were). `coil_dawn` → the snapshot's scene (`wake`). `skipEnter` makes `go()` skip a scene's `enter` once, so a scene is never entered twice by the Coil.
- **Replays:** from Coil 2, `arrival` offers "You remember this. Skip to the stream." (30 min; sets `scanned`, `qi_toxic`, `bone_ok`, `sat_once`).
- **Breakthrough from 95%** in task mode (`breakAt()`; classic 100%); the choice shows the real Saturation. Condensation already stops at 100%.
- **Backup** before the Coil screen (`RISKY_SCENES.coil_end`).
- **Pause button:** ⏸ Pause / ▶ Resume next to James's bar (`data-pause`; goes back to the last speed, `resumeSpeed`).
- **Far hunt:** deer get "Let them go. Not today." (the old dead end at under 2 Qi).
- **Tests:** tasks test checks rewind (kept, reset, head start, Yuki, bars), Not yet, Accept, same days again, 95%, state 3 → 4, classic shows no Coil choices; the bots rewind a lost tribute up to Coil 3 and print the tribute per Coil. The story test walks the Coil scenes in no-dice mode.

## v0.9.3 — no dice anywhere in task mode

- **Switch:** `setNoDice(on)` in game.js; `main.js` sets it with the Tasks switch, the tests set it themselves. Classic mode (off) is untouched (the classic story test gives the same count as v0.8.6).
- **Checks** (`rollCheck`): value ÷ `noDiceDc(dc)` (dc − `NO_DICE_DC_SHIFT` 2, at least 0.5); success at ratio ≥ 1, "double" at ≥ 2; returns `ratio`, `die: null`. `checkText(r)` writes "GU 1 / DC 2" or the dice form. `choiceTag` shows the outcome ("→ passes / partly / fails"). In `choose`, a gathering choice at ratio 0.5–1 is a thin haul (loot kept = max(1, ⌊gain × ratio⌋), XP × ratio).
- **Fights** (`stepNoDice`, then `finishRound` shared with the dice round): James's hits ≥ 2 double, ≥ 1 full, ≥ 0.5 glancing (half), below a miss; damage = middle of the range; defence ≥ 1 avoided, ≥ 0.5 half, below the full blow; Yuki the same with her Fight; enemies that prefer the small one go for Yuki every third round; T7 construct = tier × 2; fleeing = GU vs their best attack. Intuitive Aptitude in fights: each miss or glance +0.5 to that action (and to Yuki) for the fight, up to +2 (`c.adapt`). `NO_DICE_ROUND_CAP` 30: still undecided → lost ("you are spent"); bots never reached it.
- **Tuning** (`js/story/nodice_tune.js`, `NO_DICE_TUNE`, applied in `startCombat` only without dice): per fight `up` raises the enemy's DC and attack. Set by bot rounds (smart combat, random story and cards, Yuki on). Result (2,000 games each way, dice → no dice): jackals 100 → 77%, boar 96 → 70%, Gao 93 → 59%, Ya's brawl 85 → 54%, wolves 86 → 51%, thornback 84 → 47%, collectors (tribute) 56 → 37%, root-wyrm 87 → 25%, mire serpent 93 → 30%, rot-ape 87 → 34%, Guardian 58 → 36%, Shen Qiu 62 → 30%; other small fights 69–92% (crows 55%). Tribute lost 22% → 50%. Day 1: about 5 items by camp. Deterministic fights tip sharply between neighbouring values, so re-measure after any change upstream.
- **Results** show the full task name (summary on its own line); a partial drops the HP sentences of its fail text.

## v0.9.2 — step 3b on the task cards

All in `js/core/tasks.js` (pure) and `js/story/task_hubs.js`; only with the switch on. The classic game is unchanged (the classic story test gives the same count as v0.8.6).
- **Kinds of card:** *work* (a sub-menu choice or a hub choice with a check): resolved by `resolveWork` with no dice; *chore* (eat, rest, cultivate): through `choose` as before, lengths unchanged; *door* (`doors`, `doorMenus` in task_hubs.js): the bar is the walk, then the scene opens as a story stop and the queue waits.
- **Hubs:** `stream` (Day 1: test the water; doors to `forage`, `hunt`), `wilds` (+ door menu `wild_explore`: Bone Field, Mire, Hollow), `village` (Day 4: doors `heal`, `village_hunt`), `ashfall` (+ doors `heal`, `village_hunt`, `herb_slopes`, `wen_lesson`, `far_hunt`, `scout`). Stops: Keep walking / Make camp, the elder's first visit, Mei Lin's walk, evenings.
- **No dice:** `cardCheck`: value = acting check + the choice's bonus + adaptation; DC = max(0.5, old DC − `DC_SHIFT` 2 + `FAM[tier].dc`); ratio ≥ 2 double (loot ×2), ≥ 1 full, ≥ 0.5 partial (loot kept = max(1, ⌊gain × ratio⌋), XP × ratio; a partial on a card that gives no items runs its fail text without HP loss), < 0.5 fail (HP loss doubled, 25% XP). `awardXp` got a `factor` option.
- **Familiarity** (`g.tasks.fam[id]`): +1 per result, +0.5 on a fail; tiers `FAM` New 0 / Practised 2 / Skilled 8 / Mastered 18 with DC +2/+1/+1/+0 and length ×2, ×1, ×0.4, ×0.2 (`NEW_LENGTH` 2 ÷ speed 1/2/5/10). A quarter of each gain goes to the card's menu-mates; drill menus (`wild_train`, `drill`) give 0.2 to every card on the hub. Ids are `<scene>:<choice index>` (if a scene's choice list changes order, familiarity on it starts over; story progress is not affected).
- **Intuitive Aptitude** (`g.tasks.adapt[id]`): +0.5 per partial or fail, up to +2, with a line "You see what went wrong."
- **Yuki's lane** (`g.tasks.yuki`): On/Off; her job (`yuki` in task_hubs.js: forest 75 min DC 1, Ashfall "Hunt the barley fields" 75 min DC 1.5, one hare) runs on the game time James's cards spend, 06:00–19:00, Fight check ÷ DC, her own familiarity. "Let Yuki hunt on her own" left James's cards (`notJames`).
- **Fed −4 an hour** while work cards run (`FED_EXTRA_PER_HOUR` on top of the usual 3).
- **Screen:** story text and stops on top; James's bar, Yuki's lane, the outlook; then Cards | Results (`panel`, red badge for unseen results; results kept in memory, last 8, newest first, `<details>` to unfold; all of it is in the Journal too). From 700 px the two sit side by side.
- **Save state 3:** migration 2 → 3 adds `fam`, `adapt`, `yuki` (all empty / off).
- **Random-bot numbers in task mode** (2,000 games each): tribute bluff 19.6 / fought 15.4 / lost 45.4 / paid 19.7% (classic: 27.2 / 21.3 / 31.3 / 20.2%); work-card results: partial 46%, fail 35%, full 13%, double 2%; 52 collapses (HP 0). Coil 1 is meant to be hard; the Coil (3c) adds the rewind and the tribute tuning.

## v0.9.1 — speed drop-down

- `js/main.js`: `SPEEDS` Pause/×1/×2/×5/×10, `speed` from `boneash.speed`; the running bar fills by `done += dt × speed` (dt capped at 1 s, so a sleeping phone doesn't fast-forward). Shown only on a task hub with the switch on. No gate yet (3c).

## v0.9.0 — task cards and the queue (step 3a, preview)

- **Switch:** Saves tab → "Tasks (preview)", off by default, per phone (storage key `boneash.tasks`, `'1'` = on). Off = the game exactly as v0.8.6 (the classic story test gives the same count as before).
- **Which hubs** (`js/story/task_hubs.js`, `TASK_HUBS`): `wilds` (Days 2–3; menus `wild_forage`, `wild_hunt`, `wild_train`) and `ashfall` (Days 5–6; menus `clinic`, `workshop`, `drill`). Choices on the hub that lead back to it (eat, rest, cultivate, ghost-gill, communal pot) are cards too. Everything else stays a **story stop** (buttons under "Story"). `herb_slopes`, `wen_lesson`, `mei_walk`, `far_hunt`, `scout`, explore, elder, heal and the boar stay stops because their prose (Mei Lin, Wen) or fights live in the scene.
- **Engine** (`js/core/tasks.js`, pure): a card id is `<scene>:<choice index>`. `runTask` calls the same `choose()` as a tap (the door to the menu, then the choice, then back to the hub), so rolls, XP, loot, time and Fed are unchanged; only the moment moves to the end of the bar. `taskMinutes` and `outlook` dry-run on a copy (same seed, so the prediction is exact). `daily()` in common.js now carries `dailyKey` so cards can say "back tomorrow".
- **Clock:** 1 game hour = 3 s (`MS_PER_GAME_HOUR`); runs only while a task runs. Queue up to 30 (`QUEUE_MAX`), saved in `g.tasks.queue`; the running bar is not saved (a reload restarts the head task, nothing applied twice). Tapping a story stop cancels the running bar (nothing of it happens); the queue waits and resumes on the hub. A queued card that isn't possible when its turn comes is skipped with a note.
- **Outlook line:** "Fed runs out <time> on this queue" or "Fed holds: about N when the queue ends".
- **HP 0 during a task** (stand-in until the Coil; replaced in v0.9.4 by the Coil screen): the queue is cleared, the clock goes to 19:00 if earlier, HP 1, and James comes to at the hub's evening stop (`camp` or `nextEvening`); the night and morning then run as usual. Bots never reached it in 2,000 games (0 collapses); a unit test forces it.
- **Save state 2:** migration 1 → 2 adds `tasks: { queue: [] }`.
- **Test:** `tests/tasks.test.mjs` (in `tools/check.sh`): hubs and menus exist, migration, the collapse, 2,000 bot games in task mode and 2,000 classic, the outlook matches the real run every time, all 28 cards played. Tribute outcomes (random bots): tasks bluff 24.9 / fought 33.1 / lost 23.3 / paid 18.6%; classic bluff 27.3 / fought 23.5 / lost 29.9 / paid 19.2%. Same rules; the task bot simply trains more than a random walker.

## v0.8.6 — save safety, error bar, checks, restore points

- **Save format** (`js/core/game.js`): `{"fmt":1,"sum":"<FNV-1a>","data":"<state JSON>"}`. Old plain saves still load. `migrate()` runs a chain (`MIGRATIONS[v]`) instead of rejecting other state versions; a newer state is reported, never wiped. `serialize` refuses to write a state with NaN or Infinity (`badNums`). Errors are `SaveError` with a `kind`: empty, unreadable, checksum, tooNew, notSave, badNumbers. `deserialize(text, {force:true})` is "load anyway" (ignores the checksum, reads a newer state, zeroes broken numbers). `peekSave` describes a save without loading it.
- **Recovery screen** (`js/main.js`): if the autosave can't be loaded the game no longer starts over silently. It shows why and offers: load it anyway, download the damaged save, restore a backup, start a new game. Whatever is chosen, the damaged save is kept under `boneash.broken`. A save pointing at a scene this version doesn't have counts as damaged (`checkScene`).
- **Backups:** `boneash.bak.5m`, `.30m`, `.2h` by play time (idle counts at most 2 minutes per step; meta in `boneash.bak.meta`), and `boneash.bak.before` before risky moves: a new game, loading a slot, loading a save file, the Long Forest button, arriving at the tribute and at Shen Qiu (`rt_elder`). Restorable from the recovery screen (not yet from the Saves tab).
- **Storage full or blocked:** a warning in the error bar (once per session).
- **Error bar:** any uncaught error or rejection shows at the bottom with **Copy** (scene, time, message, two stack lines) and ✕.
- **Double-tap guard:** a second tap within 400 ms on a choice or a combat action is ignored.
- Storage keys `boneash.auto` and `boneash.slot1–3` unchanged; the slots and exports now use the new format.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
