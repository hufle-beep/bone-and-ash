# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-06 (Europe/Budapest). **Version:** 0.11.4 (`sw.js` VERSION `bone-ash-0.11.4`): forms 3b (Incremental Mode: damage by form, Guard by defence form, the spike field, shield cover for Yuki, the bone spear in a new Reach line); on top of 0.11.3: the mechanics sanity check (hard rule 2: after every build, before the docs, the full `check.sh` ends with `tools/sanity.mjs`; tools only, the game is the same as 0.11.2); on top of 0.11.2: timed cultivation, the base redesign push 2 (Incremental Mode: a sit is an hour, Saturation by hours, 10 h × 2^realm ÷ the Coil bonus; meridians by hours of work, no daily limit, no fail, XP once per channel, locked below Fed 20; the breakthrough a timed, queueable card); on top of 0.11.1: tests and tools only (the bot games split across cores with a seed per game, `check.sh quick`, `tools/bots.mjs`; the game is the same as 0.11.0); on top of 0.11.0: the base redesign, push 1 (each rewind starts James's and Yuki's realm, skills, Saturation and meridians over; the Coil bonus ×(1 + 0.5 × earlier Coils of the act) makes them come back faster); on top of 0.10.4: Bonesinger forms (four lines unlocking by Convergence Use rank; only what James can sing shows in fights and choices; the fragile knife breaks), Tasks renamed **Incremental Mode** and Classic **Story Mode**; on top of 0.10.3 (docs only: the handover split) and 0.10.2: paused by default and on every new scene (a tapped card runs once, then pauses), the camp as a task screen, waiting for a time of day happens at once; on top of the Long Forest in task mode (from Coil 2 of the prologue, one season = +1 realm, up to Heavenly Immortal), on top of queue planning with Selene's forecast (run now / + to queue, ↑↓✕, Clear, meridian sessions in the queue, a death row and a pause before it), starving 1.5 HP an hour in task mode, rest and sleep at once; on top of the clock with seconds (v0.9.9), Tasks on by default and the speed gate (v0.9.8, push 4 of 4, 3c-3), on top of severe difficulty in task mode (v0.9.7, push 3 of 4: HP 0 or a lost beast fight ends the Coil, beasts +0.5, tribute +1), on top of meridians closed at the start and Act 1's Coil (v0.9.6), every screen as cards (v0.9.5: story choices with bars, every choice takes time, the Meditate card everywhere), the Coil (v0.9.4) and no dice anywhere in task mode (v0.9.3) and step 3b. Tasks is now the default mode (Saves → Game mode: Tasks or Classic). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual design notes, the Act 1 overview) **`project/history-2.md`** and **`project/history.md`** (older decisions and version notes, newest first; part 2 is the newer one). All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3):** this file holds the decisions and version notes of the **last three versions**; each push moves anything older to the top of the newest history file (now `project/history-2.md`). When it passes about 45 KB, the next part starts (`history-3.md`). Every doc stays small enough to upload to the claude.ai project straight from the file.

## Decided in chat (2026-11-06)

- **v0.11.4: forms 3b (owner 14:57 "what is forms 3b" → "yes"; options with bot numbers; owner 15:05 "go with your recommendation plus the spear now, because I will pivot the direction of the project after. keep the roadmap."; 15:10 "every bone weapon is convergence. at least the creation of it. Hit/damage check can be GU." → pick 15:11 "a" (the spear as measured, no forming check); go 15:11; mid-build stop (the Act 1 rewind coverage), pick 15:20 "a"; baseline and commit 15:26 "commit"; built in v0.11.4):**
  - **The owner's next step:** a pivot in the project's direction after this push; **the roadmap is kept as it is** until then.
  - **Where players are (bots, 1,000 games):** Convergence Use at the tribute T1 L5–L10 (dart, knife, bracer, spikes, hedge); at the end of Act 1 mostly T2, some T3 (dagger, buckler, sword, shield, lance, plates); volley, storm and armour only in the Long Forest.
  - **1 damage by form:** dagger +1 and sword +2 per hit on the blade, the thrown lance +2 on darts; Guard +2 → +0.5 per personal-defence form (bracer 2.5, buckler 3, shield 3.5, plates 4, armour 4.5). The bots barely notice (they rarely reach these forms before Act 1 and never guard).
  - **2a the spike field** (from spikes, T1 L3): 4 Qi, once a fight, 2 rounds; every enemy that attacks James takes 1 (2 from the slab, T3 L1). Option 2b (3 Qi, 3 rounds, 1–3 back, unlimited) was too strong: Act 1 deaths 14 / 31 / 32 / 48%, crows 37 → 83%.
  - **3a shield cover** (from the buckler, T2 L1): while James guards, the lunges at Yuki miss.
  - **The spear (owner's addition):** a fifth line, **Reach**, spear at T1 L8. Made with Convergence (unlocked by Convergence Use rank, sung with 3 Qi from the Convergence pool, damage × the Convergence Use tier), thrust with GU (3–6 × tier, +2 DC), free while held; a full hit holds the enemy off for the round. Two designs failed first: Convergence Use for the hit with 3 Qi a thrust, and the same held free: Act 1 deaths 46 / 66 / 58%, mire serpent 70%, rot-ape 79%. The owner's rule (15:10): every bone weapon is created with Convergence; the hit can be GU. No forming check (option b, not picked).
  - **Measured before (sensible bots, 2,000 games, Coils 1 / 2 / 3 / 4):** today: dead before Mei Lin 84 / 65 / 41 / 29%, tribute won 48 / 53 / 66 / 66 / 75%, lost 35 / 15 / 2%, Act 1 deaths 35 / 63 / 68 / 68%; the recommendation (1 + 2a + 3a): 85 / 63 / 42 / 28%, 52 / 59 / 67 / 66 / 81%, 32 / 11 / 2%, 30 / 50 / 51 / 48%; + the spear (picked): 85 / 63 / 42 / 28%, 52 / 57 / 65 / 65 / 79%, 32 / 12 / 2%, 30 / 51 / 48 / 49%; crows 37 → 54%, rats 31 → 37%, root-wyrm 82 → 79%, mire serpent 97 → 87%.
  - **Mid-build stop (rule 2):** the coverage check "bots rewind Act 1 and reach its end" fell to 2 (needs 5): the bots lose to Shen Qiu less now. Pick **a**: 1 bot game in 10 goes with Shen Qiu on purpose (`rt_elder` → `rt_taken`), so the Act 1 rewind path is walked however the fights are tuned (204 rewinds now). Also fixed in the build: a second spike field charged its 4 Qi (now free, does nothing; the card is hidden after the first); Story Mode falls back on Guard if an Incremental-only action reaches it; the story test's random bot picks only the actions its mode shows (Story Mode numbers identical).
  - **After v0.11.4 (sensible bots):** dead before Mei Lin 85 / 61 / 40 / 26%; tribute won 50 / 58 / 66 / 66 / 81 / 82% (Coils 1–6), lost 32 / 12 / 2%; Act 1 deaths 30 / 42 / 44 / 46%. **The sanity drift the owner saw before the new baseline** (default bots, 19 flags): Act 1 deaths C2 56 → 48%, C3 52 → 34%, C4 56 → 30% (beast deaths −7 … −26); crows (smart) +18, rats +5, mire +5; random-bot fights bone-elk +27, root-wyrm +26, Sect watcher +19, night wolves +12, mire serpent +8, cinder hawks +6, rot-ape +5, palisade wolf +5, thornback −6. The prologue unflagged; every invariant held. New baseline saved 2026-11-06 (owner's "commit").
- **v0.11.3: a new hard rule, the sanity check (owner 14:44 "another new hard rule. a sanity check of the mechanics after each iteration. re-run the whole test suite again on the entire game after the update is done and before updating the docs. notify if anything breaks"; pick 14:46 "B"; go 14:47; built in v0.11.3):**
  - **Rule 2** (CLAUDE.md, working agreement): after every build, before the docs, the full `bash tools/check.sh`; any failure or flag stops the work and goes to the owner with the numbers. The baseline is saved again only after the owner has seen an intended change's numbers and said go.
  - **B** `tools/sanity.mjs`, the last step of the full check (`quick` skips it): invariants (the sit gain, the breakthrough length and the first primary's sitting for realms 0 / 1 / 3 / 7 / 13 on Coils 1 / 2 / 3 / 5; 36 h / 32 h of meridians; the Fed lock at 20; Story Mode's 30-minute sit, 2-hour breakthrough and no Coil bonus; no NaN / Infinity bar after the bot games) and drift: 222 numbers (deaths and beast deaths per Coil and act, the tribute per Coil, every fight's win rate per mode and bot style) against `tools/baseline.json`; more than 5 points off with n ≥ 100 on both sides is flagged (202 compared today). The tests write their merged stats with `--stats-out`, so the sanity check adds a second or two (the full check about 52 s).
  - **Proved:** the current build passes with 0 drift (same seeds, same numbers); a copy with beasts +1.0 instead of +0.5, fed to the drift step, gives 20 flagged numbers and fails (boar −7.5 / −10.8, thornback −13.2, palisade wolf −14 …). The baseline is the v0.11.2 numbers, saved 2026-11-06.
- **v0.11.2: timed cultivation, the base redesign push 2 of 2 (picks 13:51 "1a, 2a, 3a, 4a"; XP and guard picks 14:30 "1a, 2a, 3a"; go 14:31; built in v0.11.2):**
  - **Found (today's rules, a bot that only cultivates and never starves):** Foundation always lands on Day 6 12:00 from Coil 2 on (2 primaries a day), so the Coil bonus doesn't speed it; after Foundation the realms chain (a breakthrough refills Qi and a sit costs only Qi): Coil 2 reaches realm 5 by Day 7 and Heavenly Immortal by Day 14; even Coil 1 reaches realm 12 by Day 14.
  - **1a** a sit is a 1-hour card, 10 Qi, Saturation +100 ÷ SAT_HOURS(realm) % × the Coil bonus (not by Qi Max); the hollow and grove sits count as two. **2a** meridians by hours of work, ÷ the bonus, sittings of up to 2 h (2 Qi), any number a day, no check, no fail: primaries 2–4 h (36 h for 12), collateral groups 3–5 h (32 h for 8); primaries and groups keep separate progress (two work cards; groups still open between primaries). **3a** the breakthrough a queueable card of 2 h × (realm + 1) ÷ the bonus (Foundation 2 h … Heavenly Immortal 28 h), then the tribulation scene. **4a** SAT_HOURS = 10 × 2^realm (Foundation 20 h, Core 40 h, True Core 80 h…). Extraordinary vessels, collaterals and junctions keep their checks. Story Mode unchanged.
  - **Projection (40% of the waking day on cultivation, arithmetic):** realm at the tribute ×1 Mortal Vessel / ×1.5 Foundation / ×2 Core / ×3 True Core; end of Act 1 Core / True Core / True Core / realm 4.
  - **Trial bots (before the XP pick) (a copy outside the repo, old one-stream bots, with the sensible-player meridian rule; today with the same rule: dead before Mei Lin 88 / 66 / 63 / 54%, tribute lost 70 / 30 / 11%, primaries at the tribute about 8, about 30,000 breakthroughs):** with XP on every sitting: dead before Mei Lin 84 / 71 / 61 / 39%, tribute won 52 / 60 / 63%, lost 14 / 8 / 2%, all 12 primaries at the tribute, about 7,000 breakthroughs (no chaining); without the per-sitting XP: more beast deaths (the sessions' check used to pay Convergence Use XP). Without the sensible-player rule the random bot sits until it starves (dead before Mei Lin 99%).
  - **XP options measured (`tools/bots.mjs --sensible`, 2,000 games each, the same games; Coils 1 / 2 / 3 / 4):** today: dead before Mei Lin 90 / 64 / 58 / 54%, tribute won 23 / 41 / 54 / 60 / 64% (Coils 1–5), lost 75 / 42 / 13%, Act 1 deaths 50 / 66 / 70 / 74%, 35,600 breakthroughs; **XP once per channel (picked 1a):** 87 / 68 / 48 / 30%, won 42 / 54 / 63 / 70 / 80%, lost 42 / 16 / 2%, Act 1 34 / 63 / 66 / 62%, 6,600; XP every sitting (1b): 84 / 68 / 56 / 40%, won 40 / 57 / 63 / 69 / 72%, lost 27 / 11 / 3%; no XP (1c): 97 / 91 / 84 / 71%, starving 16 / 11 / 8%. **2a** the work cards lock below Fed 20 ("Too hungry to sit. Eat first."; the meridian screen has no forecast). **3a** the tribute (easier now: all 12 primaries by Day 7 = +15 Qi Max) is retuned later, with step 4 or 5.
  - **Bots after v0.11.2** (`tools/bots.mjs --sensible`): dead before Mei Lin 84 / 65 / 41 / 29%; tribute won 48 / 53 / 66 / 66 / 75 / 84% (Coils 1–6), lost 35 / 15 / 2%; primaries at the tribute 11.8 / 11.9 / 12; realm at the tribute 0.13 / 0.20 / 0.35 / 0.50; Act 1 deaths 35 / 63 / 68 / 68%; 6,964 breakthroughs. Default bots (no `--sensible`; the tasks test): dead before Mei Lin 91 / 68 / 44%; tribute lost 50 / 18 / 2%; Act 1 deaths 63 / 56 / 52% (beasts 38 / 39 / 42%).
  - **Found while checking (not caused by this push):** the default random bots starve on about a quarter of their Act 1 Coils: v0.11.1 gives Act 1 dead 77 / 68 / 61% with beasts only 54 / 50 / 53%. Every breakthrough at 2 h gives the same numbers, so it is the travel days, not cultivation. For step 5 (Act 1's death rates).


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
| `js/core/forms.js` | Bonesinger forms (v0.10.4): the lines (five since v0.11.4: ranged, melee, structures, reach, defence), ranks, what shows in fights and story choices, `INC_ONLY_ACTIONS`. |
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
| `tools/check.sh` | Runs every check (syntax, engine, saves, the four Act 1 parts, the tasks and story bots) in about 45 s on 2 cores; `quick` = 200 bot games each (about 15 s, not enough for a push); stops at the first failure. |
| `tests/lib/shard.mjs` | The bot games split across worker processes (v0.11.1): `--games`, `--workers`, `--seed`; a seed per game (`seedOf`), so any number of workers gives the same numbers. |
| `tools/sanity.mjs`, `tools/baseline.json` | The mechanics sanity check (v0.11.3, hard rule 2): invariants and drift (±5 points, n ≥ 100) against the saved baseline; the last step of the full check; `--update` only after the owner's go. |
| `tools/bots.mjs` | Balance numbers only (v0.11.1): the tasks test's bots, summary per Coil with the beast share of deaths; `--games`, `--seed`, `--sensible`, `--workers`. |
| `.github/workflows/restore-points.yml` | Tags the newest 5 commits on every push (`restore/<date>-<commit>`), copied from Selene. |

**Run every check:**
```
bash tools/check.sh          # full, after every build and before the docs and the push (ends with the sanity check)
bash tools/check.sh quick    # while building
node tools/bots.mjs --games 1000 --sensible   # balance numbers only
node tools/sanity.mjs --update                # new baseline, only after the owner's go on an intended change
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

## Version notes (the last three versions; older ones in `history-2.md` and `history.md`)

## v0.11.4 — forms 3b (Incremental Mode)

- **forms.js:** a fifth line `reach` (spear, T1 L8); `INC_ONLY_ACTIONS` (spear, spikes): `actionOpen` shows them only in Incremental Mode and only with their form.
- **game.js:** `formStep`; `formDmgBonus` (dagger +1, sword +2, lance +2) in `actionDmg`; `guardBonus` (2 + 0.5 per defence form); `FIELD_ROUNDS` 2, `fieldDamage` (1, 2 from the slab); `COMBAT_ACTIONS.spear` (GU, 3 Qi, 3–6, +2 DC, `reach`, `keeps: 'spear'`) and `.spikes` (4 Qi, `field`); in `stepNoDice`: the spear is sung once (`c.spearFormed`), a full hit sets `atBay` (that enemy skips its attack); the field (`c.field`, `c.fieldUsed`; a used field costs nothing and does nothing); thorns before each attack on James; Guard uses `guardBonus`; shield cover (guarding with a buckler: lunges at Yuki miss). The dice path (Story Mode) falls back on Guard for an action it doesn't show.
- **main.js:** both fight screens: the spike field hidden once used; tags for Guard (+N, covers Yuki), the field and the spear's hold; formed spear and used field cost 0.
- **Tests:** five lines; form damage and Guard numbers; field and spear unlocks; a fight with the field (4 Qi, both attackers take 1, gone after 2 rounds, once a fight), the spear (3 Qi, then free, the hold); shield cover; Story Mode unchanged. The tasks bot sings the field once, alternates spear and blade, picks the new actions when open; 1 run in 10 goes with Shen Qiu (`rt_elder` → `rt_taken`). The story bot picks only shown actions. New baseline.

## v0.11.3 — the mechanics sanity check (tools only)

- **`tools/sanity.mjs`** (new): the invariants (imports game.js and meridians.js), then drift: reads `--tasks` / `--story` stats files (or runs both tests itself), flattens them into percent + n, compares with `tools/baseline.json` (`LIMIT` 5 points, `MIN_N` 100; a number that disappears or appears with n ≥ 100 is flagged too); `--update` saves the baseline (refused if an invariant fails). Exit 1 on any flag.
- **tests:** `--stats-out PATH` (`STATS_OUT` in shard.mjs, not passed to workers); the tasks test records every fight's outcome per mode and bot style (`fightStats`, `inc:` / `story:` + id + smart / random) and counts games ending with a broken bar (`badBars`, asserted 0). The story test writes its fights and endings.
- **check.sh:** the tests write their stats to a temp folder; the full run ends with the sanity check; the labels are wider.

## v0.11.2 — timed cultivation (the base redesign, push 2)

- **game.js:** `SAT_HOURS(realm)` = 10 × 2^realm; `SIT_MINUTES_INC` 60; `sitGain(g, sits)` (Incremental Mode: 100 × sits ÷ SAT_HOURS × `coilMult`; Story Mode: the engine's Qi-based gain × sits); `condense` uses it and takes 60 min (Story Mode 30); `btMinutes(g)` = 120 × (realm + 1) ÷ `coilMult` (Story Mode 120), used by `breakthrough`.
- **meridians.js:** `priHours(k)` 2 … 4, `colHours(j)` 3 … 5, `MER_FED_MIN` 20, `merMinutesOf(g, 'pri' | 'col')` (up to 2 h, rounded up to 10 min, ÷ the bonus), `merMinutes`; two work choices first on the screen (`work: true`, `minutes`, `req` Fed ≥ 20; progress in `james.merWork` / `james.colWork`; XP once on opening; Yuki mirrors). `sessionOk` is always true in Incremental Mode; the old checked sessions show only in Story Mode. Screen text: the hours, the Fed line.
- **tasks.js:** `merChoice` takes `work` choices too; the mer card uses `c.minutes`; `BT_TASK` (`bt:next`), `btOpen` (no warning screen first), card kind `bt` (`goTo` the breakthrough: a story stop).
- **meditate.js:** the sit card says an hour and its gain; Break through shows its length and is queueable on hubs (`task: BT_TASK`) unless a warning comes first; `SIT_MINUTES` 60. **main.js:** the Meditate Break through gets a bar off the hubs.
- **wilds.js / act1_return.js:** the hollow and grove sits = `sitGain(g, 2)`.
- **Tests:** hours and totals (36 h / 32 h), a sitting's time, Qi and progress, the short last sitting, XP only on opening, no daily limit, separate progress, a group after 3 h, Coil 3 halves the hours, the Fed lock and its text, Story Mode keeps the checked sessions; sit gains by realm and Coil, the gain independent of Qi Max, a sit 1 h; breakthrough lengths, the queued card (2 h then the scene), the warning case, the forecast; Story Mode's sit and breakthrough unchanged. The old daily-session tests are rewritten.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
