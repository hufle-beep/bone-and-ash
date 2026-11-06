# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-06 (Europe/Budapest). **Version:** 0.11.0 (`sw.js` VERSION `bone-ash-0.11.0`): the base redesign, push 1 (each rewind starts James's and Yuki's realm, skills, Saturation and meridians over; the Coil bonus ×(1 + 0.5 × earlier Coils of the act) makes them come back faster); on top of 0.10.4: Bonesinger forms (four lines unlocking by Convergence Use rank; only what James can sing shows in fights and choices; the fragile knife breaks), Tasks renamed **Incremental Mode** and Classic **Story Mode**; on top of 0.10.3 (docs only: the handover split) and 0.10.2: paused by default and on every new scene (a tapped card runs once, then pauses), the camp as a task screen, waiting for a time of day happens at once; on top of the Long Forest in task mode (from Coil 2 of the prologue, one season = +1 realm, up to Heavenly Immortal), on top of queue planning with Selene's forecast (run now / + to queue, ↑↓✕, Clear, meridian sessions in the queue, a death row and a pause before it), starving 1.5 HP an hour in task mode, rest and sleep at once; on top of the clock with seconds (v0.9.9), Tasks on by default and the speed gate (v0.9.8, push 4 of 4, 3c-3), on top of severe difficulty in task mode (v0.9.7, push 3 of 4: HP 0 or a lost beast fight ends the Coil, beasts +0.5, tribute +1), on top of meridians closed at the start and Act 1's Coil (v0.9.6), every screen as cards (v0.9.5: story choices with bars, every choice takes time, the Meditate card everywhere), the Coil (v0.9.4) and no dice anywhere in task mode (v0.9.3) and step 3b. Tasks is now the default mode (Saves → Game mode: Tasks or Classic). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual design notes, the Act 1 overview) **`project/history-2.md`** and **`project/history.md`** (older decisions and version notes, newest first; part 2 is the newer one). All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3):** this file holds the decisions and version notes of the **last three versions**; each push moves anything older to the top of the newest history file (now `project/history-2.md`). When it passes about 45 KB, the next part starts (`history-3.md`). Every doc stays small enough to upload to the claude.ai project straight from the file.

## Decided in chat (2026-11-06)

- **v0.11.0: the base redesign, push 1 of 2 (owner 13:06 "base redesign. make the game closer to Selene. Skills and realms reset but their progression gets faster with each coil. Cultivation should also be a timed action… the number of coils increases drastically, but that's intended and can be bypassed by Long Forest"; picks 13:24 "1a, 2a, 3a, 4a, 6a"; 13:34 "1b", projections asked for both counts; 13:36 "count per act"; go 13:37; built in v0.11.0):**
  - **1a** a rewind resets James's and Yuki's realm, Saturation, skills (GU, Convergence Use, Fight, Qi Use) and every meridian to the act's start (the snapshot: Day 1 dawn, or Day 8 dawn for Act 1). Kept: familiarity, Intuitive Aptitude, what James knows (`KEEP_FLAGS`), Yuki's relationship and path, the relationship head start. The "Foundation unwinds" rule is gone (everything starts over anyway).
  - **2a + 1b + count per act** the Coil bonus ×(1 + 0.5 × earlier Coils of this act) (`coilMult`): XP (James and Yuki), the Saturation of a sit (and the hollow and grove sits), meridian session DCs ÷ the bonus. Act 1's first Coil is ×1 again.
  - **4a** the Long Forest stays the bypass (climb it again each Coil). **6a** two pushes: timed cultivation (3a, the same Coil bonus) is push 2. Story Mode unchanged. Old saves keep what they have until their next rewind; no migration.
  - **Measured before (bots, +0.5 per earlier Coil, 1,000 games each; prologue numbers the same either way):** dead before Mei Lin 92–94 / 71–72 / 60–62 / 49–50 / 38–41 / 39–40 / 19–22% on Coils 1–7; tribute won 4–20 / 23–27 / 57–62 / 65–71 / 72%; first Coil past the tribute: median 4 (p25 3, p75 5). Counting all Coils: Act 1 deaths 10 / 31 / 45 / 14%, Act 1 in 1 Coil, about 5 Coils in total. **Counting per act (picked):** Act 1 deaths 84 / 66 / 38 / 24 / 25 / 23%, 3 Act 1 Coils (median), about 7 in total. Other bonus sizes (all Coils counted): 0 → 92% dead before Mei Lin on every Coil; +0.25 → past the tribute on Coil 5; +1.0 → Coil 3. No bot reached Foundation in the prologue (12 primaries need 6 days of 2 sessions, plus 95% Saturation, in one Coil).
  - **Bots after v0.11.0** (tasks test: bots rewind a lost tribute up to Coil 3 only): dead before Mei Lin 91 / 63 / 59 / 54%; tribute won 28 / 41 / 61 / 63 / 68 / 77% (Coils 1–6); Act 1 Coils ending in death 78 / 65 / 57 / 61%.

- **v0.10.4: Bonesinger forms and the mode names (owner 12:09 "skills and their expression… what cannot be formed yet should not be visible in checks and combat"; 12:46 the four lines: ranged needle → dart (an evolved needle) → lances later, melee a fragile knife, defensive structures spikes or walls, personal defence shields and armour; 12:48 "run them. 1a, 3a, 4a, 5a"; 12:51 "A. if he dies, he dies." (the knife really breaks); 12:53 rename Tasks → Incremental Mode, Classic → Story Mode, "then go"; built in v0.10.4):**
  - **1a** forms unlock by Convergence Use rank (tier and level). **Ladder** (`js/core/forms.js`): ranged needle T1 L1 → dart T1 L5 → thrown lance T3 L1 → volley T4 L1 → storm T5 L1; melee fragile knife T1 L1 → knife T1 L8 → dagger T2 L1 → sword T2 L5; defensive structures spikes T1 L3 → stake ring / spike hedge T1 L8 → stepping-stones T2 L5 → man-high slab T3 L1 → walls, bridges, shelters T4 L1 → fortifications T5 L1; personal defence bracer T1 L5 → buckler T2 L1 → shield T2 L5 → armour plates T3 L1 → full wraithbone armour T5 L1. Constructs stay at T7+.
  - **3a** fights show only the forms James has (no darts below T1 L5); the actions are named after his best form per line (knife / dagger / sword, darts / lance / volley / storm, bracer / buckler / shield / plates / armour on Guard). **Pick a:** the fragile knife breaks after every swing and costs its Qi again until T1 L8. Damage and effects otherwise unchanged (tier multipliers, plates' DR, volleys, constructs).
  - **4a** 18 story choices that need a form are hidden until James has it (all the dart choices, the camp stakes, the spike pit, spearheads, and the four below); four reworded in Incremental Mode: night 3 "A hedge of bone spikes…" (T1 L8, fail text "The hedge comes out knee-high…"), the ford "Sing stepping-stones of bone…" (T2 L5, "White stepping-stones, ribbed like vertebrae…"), the ambush "A slab of bone…" (T3 L1), the ring chambers "…with a slab of bone…" (T3 L1, "A white slab, man-high, jammed into the doorway…").
  - **5a** Incremental Mode only; Story Mode keeps every form and the original lines. The James tab lists each line's form and the next unlock (Incremental Mode).
  - **Mode names (owner 12:53):** Tasks is now **Incremental Mode**, Classic **Story Mode** (Saves tab labels; storage key `boneash.tasks` unchanged). Code and older notes still say "task mode" / "classic".
  - **Measured before (1,000 bot games each, same bot):** today: dead before Mei Lin 83 / 35 / 12 / 17%, tribute won 0 / 27 / 50%, Act 1 deaths 94 / 82 / 63 / 50%; ladder with the knife breaking (picked): 94 / 53 / 23 / 18%, 0 / 29 / 44%, 94 / 84 / 67 / 50%; ladder with the knife holding: 87 / 37 / 13 / 15%, 16 / 32 / 51%, 93 / 83 / 65 / 43%.
  - **Bots after v0.10.4** (tasks test): dead before Mei Lin 91 / 49 / 29 / 33%, Act 1 Coils ending in death 89 / 78 / 61 / 43%, tribute won Coil 1–3 23 / 34 / 47%.

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
| `js/core/forms.js` | Bonesinger forms (v0.10.4): the four lines, ranks, what shows in fights and story choices. |
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

## v0.11.0 — the base redesign, push 1: everything James grew starts over each Coil, the Coil bonus

- **game.js:** `COIL_GROWTH` 0.5, `coilMult(g)` (Incremental Mode: 1 + 0.5 × (coil.n − 1); per act, since Act 1's Coil numbering starts at 1); `awardXp` multiplies the pool, `awardYukiFightXp` too; `condense` multiplies the Saturation gain.
- **coil.js** `rewind`: James and Yuki come from the snapshot (hp / qi refilled, injuries cleared); `willUnwind` is always false; the header comment lists what is kept.
- **meridians.js:** `dcPrimary` / `dcColGroup` ÷ `coilMult`. **wilds.js / act1_return.js:** the hollow and grove sits × `coilMult`.
- **coil_scenes.js:** the Coil screen's "Next Coil" line (×N as fast), the rewind result line, the two dawn texts (the body forgets, the head does not). **main.js:** the James tab's Coil line.
- **Tests:** the old "kept" assertions now check the reset; new: ×1 on Coil 1, ×2 XP on Coil 3, Yuki ×2, meridian DC ÷ 2, a sit ×2, Act 1 starts at ×1, Story Mode ×1.

## v0.10.4 — Bonesinger forms, the mode names

- **forms.js** (new, `js/core/`): `FORM_LINES` (four lines, unlock rank = 10·(T−1) + L), `cuRank`, `hasForm` (always true in Story Mode), `lineState`, `actionOpen` (darts need `dart`), `actionLabel`, `fragileKnife` (Incremental Mode, rank < T1 L8), `STORY_FORMS` (text patterns → form). `setFormsActive` is wired to `isNoDice` by game.js.
- **game.js** `stepNoDice`: an action whose form is missing falls back on Guard; labels from `actionLabel`; the fragile knife clears `bladeFormed` after every swing.
- **prologue.js** (end): every choice matching `STORY_FORMS` gets `c.form` and a `show` that needs the form (keeps its `dailyKey`); the four rewordings are functions of the mode (`inc`), result lines swapped only in Incremental Mode.
- **tasks.js:** a hidden-by-form card stays hidden (not "back tomorrow").
- **main.js:** fight cards filter by `actionOpen` and use `actionLabel` (both screens); the James tab's form rows; Saves tab: Incremental Mode / Story Mode.
- **Tests:** four lines, T1 L1 / L5 / L8, T2 L5, T3 L1 forms and names, the knife breaks below T1 L8 and holds from it, the Day 1 dart hidden then shown, 18 gated choices, the four rewordings and their result lines in Incremental Mode only, Story Mode unchanged; the camp test gives CU T1 L3 for the stakes.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
