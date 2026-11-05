# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-05 (Europe/Budapest). **Version:** 0.8.5 (`sw.js` VERSION `bone-ash-0.8.5`; the game is unchanged since 0.8.4, this push is docs only). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`. All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

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
- **Build order:** see `project/roadmap.md` (1 rules and docs — this push; 2 save safety; 3 the hybrid core on the prologue; 4 progression layer; 5 Act 1 converted; 6 Android and comfort; 7 engine extras and lore).
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
- **Mortal Vessel, all 12 primaries and 66 collaterals open.** Everything starts at **T1 L1**: GU and Convergence Use.
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
| `tests/rules.test.mjs` | The engine numbers. 14 checks. |
| `tests/story.test.mjs` | Every link valid, every scene reachable, 2,000 random playthroughs, per-fight win rates. |

**Run the tests:**
```
node tests/rules.test.mjs && node tests/story.test.mjs
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

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
