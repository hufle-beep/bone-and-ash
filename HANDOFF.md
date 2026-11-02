# Bone and Ash — handoff (read this first in a new chat)

**Saved:** 2026-11-02 (Europe/Budapest). **Version:** prologue 0.4.0 (`sw.js` VERSION `bone-ash-0.4.0`). **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chat.

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
- Survival and combat: **hunting and foraging for food**, with hunger.
- Tongue in cheek, James sarcastic, serious when it matters.

**Romance**
- Possible. Gábor wants it as explicit as possible and has no rules against explicit content or nudity himself.
- **Claude's own limits (not Gábor's):** no explicit sex scenes and no nude images. Romance is frank and sensual up to the door, then fades to black. He was told this on 2026-11-02.

## Gábor's working rules

They carry over from the SillyTavern project:
- **Propose first, build after his OK.**
- **Show numbers** before any one-time change to a save or a balance.
- Push every change. The Pages site updates in 1–2 minutes; tell him to reopen the game (once or twice, for the offline cache). Gábor is not a programmer: give him tap-by-tap steps for anything he must do on GitHub.
- **Bump `VERSION` in `sw.js` on every release**, or installed copies keep the old files.
- Short answers. A list of choices when there is something to decide.

## How to play / run

- **Phone:** https://hufle-beep.github.io/bone-and-ash/ in Chrome, then *Add to Home screen*. Works offline after the first load.
- **Local (Termux or PC):** `python -m http.server 8080` in the folder, open `http://localhost:8080`.

## Files

| Path | What |
|---|---|
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

**Flags that matter for Act 1** (v0.4.0 adds `saw_lights`, `roots`, `bone_sung`, `lore_tree`, `token_silenced`, `gao_turned`, `loft_burned`, `militia`, `plough`, `clinics`):
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
- **Art direction (Gábor, 2026-11-02): imitate CLAMP's *xxxHolic* style as closely as possible** — stark black and white, vertical screentone, elongated elegant figures, long cascading hair in strands, narrow half-lidded eyes, ornate jewellery, curling cloud (xiangyun) motifs, lotus. Style only: never copy a CLAMP character or page. Palette for it: black, white, greys, red (Gábor OK'd greys 2026-11-02). Full-body figures: `js/art/figures-clamp.js` (`clampPerson`, `clampCat`; ~9 heads tall, rope hair, hanging sleeves, robes with grey cloud swirls and a red crescent). `STYLE` in art.js: `'clamp'` (line art over screentone) or `'ink'` (the v0.2.0 ink-wash look over paintings). He also wants the tone more serious later.

## Next steps (proposed, not built)

1. **Act 1**, following on from the epilogue: the dead tree's heart, the Crimson Lotus invitation or retaliation (depending on the ending), the first breakthrough to Foundation (Saturation 100%, no tribulation), growing his people's tech again, more hunting and foraging, and more companions or romance.
2. **Android .apk:** wrap the web app with Capacitor and build it in GitHub Actions. The Android SDK can't be downloaded in the cloud session.
3. **Art:** less cutesy manhua (see Design notes); close-ups for James and the Sect; manhua treatment for the remaining plain interiors (elder, healer, dinner); more paintings (Wang Hui *Landscape*, Cleveland 1915.105; Wang Shimin *Mountain Village*, Cleveland 1997.104 — Gábor downloads and attaches, the cloud session can't fetch images).
4. **Quality:** sound effects (optional), a settings page (text size, reduce motion).

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
