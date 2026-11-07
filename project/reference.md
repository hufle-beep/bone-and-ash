# Bone and Ash — reference

Split out of the handover on 2026-11-06 (v0.10.3). Reference material that rarely changes. Read `handover.md` first.

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

**Flags that matter for Act 1** (v0.4.0 adds `sky_witness`, `foundation_day` (set, not read yet: v0.11.23), `saw_lights`, `roots`, `bone_sung`, `lore_tree`, `token_silenced`, `gao_turned`, `loft_burned`, `militia`, `plough`, `clinics`):
- `ending` (fought / bluff / paid / lost);
- `gao_broken` (the scene `gao_dead` sets it; the flag `gao_dead` was never set and is no longer read since v0.11.40), `gao_spared`, `gao_humiliated`;
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

- **v0.11.24, the art push (generated pictures):** `PICTURES` in `js/art/art.js` maps an art key to a WebP in `art/pic/` (800×500, cut to black, white, greys and red, gold only in Yuki's eyes); `pictureOf(key, form)` picks Yuki's form on `yuki_close`; every key not listed keeps its code art until the last art push (owner pick R1). Keys so far: `yuki_human`, `yuki_close` (cat / great cat / human), `yuki_tiger`, `mei_lin`, `ya_close`, `elder_arrives` (Shen Qiu), `jackals`, `james` (the arrival). **Style (owner 01:56):** the blended CLAMP (xxxHolic) / Monogatari prompt in `tools/art/recipes.json`; made on the owner's PC with Z-Image-Turbo in Comfy Desktop; how to remake one: `tools/art/README.md`. **James's look (owner 02:16, from his own photos):** short pale blond hair, a short full beard, thin rectangular glasses, the lab coat with rolled sleeves; on the left forearm an ouroboros (a closed ring, the head biting the tail), on the right a tree with curling roots, red trash-polka streaks and his own raven perched on it (not the Blood Ravens emblem, which is Games Workshop's). The story text doesn't describe his looks; mentioning them is a text change for later. **Yuki:** white hair, cat ears and tail, gold slit eyes, black slip dress, red cord choker (the owner's Black Hanekawa reference as a look only).
- **v0.11.38, the prologue's pictures (P-b; made as the v0.11.26 work in progress):** every key of the prologue's part of the art table has a picture named after the key (42 new; 11 of them also show in Act 1). `YUKI_CAT_ONLY` (30 keys: the pictures that draw Yuki as the small cat, `james` and `jackals` included) show only while Yuki is the cat; in tiger or human form those plates keep the code art until Y3. The cast as the prompts describe it (`recipes.json` `cast`): Mei Lin (mid-twenties, black hair in a loose bun with the ivory hairpin and its red tassel, curtain bangs, patched jacket, red sash), Gao Feng (about twenty, haughty, high topknot, crimson robes with a red lotus), Lu Han (about thirty, still face, long black hair tied high, deep crimson robes, a long sword over the shoulder), Old Wen (ninety, one blind milky eye, bald with a tiny white topknot, thin white beard, grey robe), Mei Lin's mother (sixty, grey bun, stern, apron), Pock-Face (huge, shaved head, pock-marked, ragged tunic). `ridge` is a landscape (Yuki on the rock looking at the dead tree, no James yet); `romance` shows two clothed silhouettes in a lamp-lit paper doorway with butterflies.

## Act 1 — "The Hearth Tree" (v0.6.0, Days 8–21, 182 scenes)

The bible and the contract between the four part files are at the top of `js/story/act1_common.js` (cast, tone, lore, entry/exit ids, helpers, art keys). The epilogue now continues with "Act 1: The Hearth Tree." → `fo_start`.
- **Part 1, Fallout** (`act1_fallout.js`, 40 scenes, Days 8–10): the Sect's answer by prologue ending (letter / envoy / Lu Han / ultimatum) → Outer Elder Shen Qiu named for Day 21; hub `fo_ashfall` (palisade, council, drill, clinic, Mei Lin, mother); Ya arrives Day 9 (optional brawl `ya_brawl`); Day 10 the plan, Ya's price, Mei Lin insists; depart.
- **Part 2, Into the Blackroot** (`act1_blackroot.js`, 59 scenes, Days 11–15): Root Road (bone-elk, root-wyrm boss), Drowned Wood (drowned dead, mire serpent, hot spring), Ashen Hills (cinder hawks, rot-ape boss); camp nights with random events (v0.11.25: the camp stakes, `bl_stakes_night`, cut the first night attacker by 3 HP, 4 with bone-meal, after the scaling and the ally floor, at least 1 HP left; cleared in the morning); the triangle (`trio` 2–3), Ya romance (`ya_romance`).
- **Part 3, The Heart** (`act1_heart.js`, 38 scenes, Days 16–18): inside the dead Hearth Tree; the seed-ship *Patient Root*, Head Gardener Wren Aldous's log (the Crimson Lotus founder cut out the tree's heart ~400 years ago; since then the Qi is poisoned); the Guardian (fight or calm with Convergence); seed-sliver.
- **Part 4, Return** (`act1_return.js`, 45 scenes, Days 19–21): the road home, planting the seed (a singing grove), the night of Day 20 (throuple if `likesMei && likesYa && trio ≥ 3`, else single romance or none), Shen Qiu on Day 21: duel / parley / show him the truth → `a1_outcome` victory / accord / revelation / taken → `a1_end`.
- **Ya** (27): the feral huntress; crude, funny, aggressive flirt, easily offended, picks fights, open to sharing; second romance; she wears down Mei Lin's resistance if James is drawn to both. Romance always fades to black (Claude's limit).
- **Attraction:** `likesMei` = prologue romance or Mei Lin affection ≥ 60; `likesYa` = `ya_romance` or Ya affection ≥ 85. Random-play outcomes: throuple ~39%, Ya ~40%, Mei Lin ~16%, none ~2%.
- **Fights:** `encounter()` in act1_common; `a1Scale` is 0 and every fight is tuned in absolute terms by `js/story/act1_tune.js` (per id, t raises DC and attack by t and HP by 10%·t), set by 7 rounds of 500 full-game simulations. Targets (smart combat, random story choices): small ~93%, region bosses ~80%, Ya brawl ~80%, Guardian ~55%, Shen Qiu ~40%. James grows a lot during the act (GU check ~3.6 at Day 8 → ~7.6 at Day 21).
- **Tests:** `node tests/part.test.mjs <fallout|blackroot|heart|return>` tests one part alone; `tests/story.test.mjs` runs 2,000 full games (step cap 2,500, 200 combat rounds).
