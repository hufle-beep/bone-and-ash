# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-08 (Europe/Budapest). **Version:** 0.11.52 (`sw.js` VERSION `bone-ash-0.11.52`): docs only: the story and mechanics pass gathered in `project/roadmap.md` (its own section), the handover's items moved there word for word. The game is the same as 0.11.51 (Y3 done: all 29 pictures that draw Yuki in every form). Earlier versions: `project/changelog.md` (one line each) and the history files. Prologue + Act 1, about 390 scenes, Incremental Mode only. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short; 9 hard rules) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual notes, the Act 1 overview; since v0.11.43 also the files table, how to run the checks, the workspace gotchas and the rules as implemented), **`project/history-7.md`** … **`project/history.md`** (older decisions and version notes, newest first; part 7 is the newest). All mirrored to the claude.ai project "ash and bone" (rule 8: Claude asks after every push who uploads).
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3; tightened 2026-11-07, v0.11.43, pick H2):** the version line names the current version only. This file holds the open items, the decisions and version notes of the **last three versions**, and the standing facts (what the game is, the owner's spec, the 2026-11-05 decisions). Each push moves anything older word for word to the top of the newest history file (now `project/history-7.md`, started in v0.11.45 when part 6 reached 45 KB; a new part past about 45 KB) and keeps this file **under about 35 KB**, so Claude's project tool can read and upload it in one go.

## Open items (v0.11.52; details where noted)

- **The art (the owner's PC with Comfy Desktop):** **Y3 part 1 DONE in v0.11.49** (the great cat); **Y3 part 2a DONE in v0.11.50** (human: forest_dawn, omnitool, clearing, stream, forage, hunt, camp, tribulation, lights, rain, crows, rats, gift, bone_field, mire; the portrait); **Y3 part 2b DONE in v0.11.51** (human: hollow, drill, wolves, lizard, roof, arson, herb_slope, gao_down, village, dinner, collectors, jackals, james, jackals_dead). **Next: the Act 1 art** (about 37 keys plus the Long Forest's 8; `hot_spring` and `trio` decided there), **then the second round of small fixes** (the tails of mire, rats, forest_dawn; gift's legs; jackals_dead's ear tips, cut at the mask's top, owner 00:29), **then James (and Yuki's face) made uniform once all the pictures of both acts are done** (owner 23:08 "when all the pictures are done for both acts we can uniformize"; was: right after Y3): a reference tool (a James LoRA trained on the best pictures, or an image-editing model that takes a reference picture and fits the 3080's 10 GB), then the heads redone on every picture, cat and tiger versions too; target look: `recipes.json` cast `james_shaggy` (the village tiger s44; of the head tests owner 21:52: "forage before is the closest"). **The last art pass:** the code art and the `clamp2.js` close-ups out, and **`ridge` redrawn** after the owner's find (23:22, an AI picture from Reddit, someone else's, so a reference only, never put in the game; the description to draw from: a colossal broken dead tree on the ridge, its stump wrapped by a great coil like a sleeping serpent, a faint warm light at an opening at its root, crows circling in a grey sky, green rolling land and far mountains; drawn fresh in the house style, as with the ridge photo in v0.11.49). Later: Z3 (WebP q70 / AVIF side by side), Z4 (per-act downloads, from act 3). The owner deletes `b3_jackals_dead_s22/s44/s55` from his ComfyUI folder (unwanted figures). The session's files on the owner's PC: ComfyUI `output/boneash/y3*` (all tries; part 2a's are `y3h_<key>_s<seed>`, `y3h_bone_field2_*`, `y3h_bf_*`, `y3h_portrait*`, `y3hc_*`), `input/boneash/y3*` (sources and masks), `input/boneash_jobs/*.json` (the queued jobs; part 2b's are `y3h2b_test`, `y3h2b_a`, `y3h2b_b`, `y3h2b_drill2`); part 2b's pictures `output/boneash/y3h_<key>_s<seed>` (drill's redo `y3h_drill2_*`), its new mask `input/boneash/y3h_jd.png`. Its folders' paths: `tools/art/README.md` (v0.11.51).
- **Tabled until the art is done (owner 21:31, save `saves/2026-11-07-2129-incremental-wilds.txt`):** "in a coil 4 replay, the Blackfoot [Blackroot] wilds now has time for multiple exploration turns per day, allow it if scheduling permits, don't limit it to once a day." Options first after the art.
- **The story and mechanics pass (after the art):** every item, with the owner's words, is in `project/roadmap.md`, section "The story and mechanics pass" (moved there word for word in v0.11.52, owner pick A2): one hub format, no repeated texts, the reply texts, queueing in Act 1, batch-queueing, Yuki's loot switch, the story text pass, the romance gates, the Extraordinary pairs and midway gate, P1-b / P1-c.
- **E, the Act 1 retune (numbers first; deferred by the owner 19:22):** steps 1–2 done (v0.11.44 the part test in Incremental Mode, v0.11.45 the dice code out). **Step 3, the retune itself, waits:** the night fights, the ford serpent (`rt_serpent`, never fought; numbers under "Open decisions"; the part test: met only through a failed check, lost only by a T1 L1 James), Shen Qiu; the guardian (84% for bot-like runs; the v0.11.41 note on a strong James's stalemate); the part test: the bot-like runs win 97–100% of Act 1's fights (v0.11.44). **Since v0.11.46** the random bots die far less in Act 1 (Coil 2 99.5 → 76.5%, Coil 3 83.2 → 56.6%; the rot ape won about 50 → 67–70%), from X1 (the vessels' collaterals' Qi regen before Nascent Soul): the retune can re-tighten the rot ape.
- **Left from the v0.11.46 Fable review (owner's call, low):** a save at Nascent Soul or later with partial `ecWork` keeps those hours unused (the seal text explains it); at Soul Embryo the breakthrough can't be queued until all 28 collaterals are open (the warning first; intended by X1); the return camps' `toHour` still sets the clock directly for the jumps it does make (no hunger or regen for the skipped evening hours; changing that is a balance change).
- **F, the copy-over push 5 (the Coil)**, then G (engine systems, crafting and threads, Android): `roadmap.md`.
- **Noted, the owner's call (numbers first):** "End it in one move" still judges a fight about 2 points harder than it is (no-dice checks take `NO_DICE_DC_SHIFT` −2 off every combat DC; v0.11.40 review). *(The `bl_camp` clock jump was fixed in v0.11.46, the return camps' in v0.11.47.)*
- **The rebalance targets (owner 11:22, kept for the retune):** Completionist: prologue Coil 1 death 40–60%, about 2 Coils for the prologue, about 3 for Act 1, the whole game on one Coil under 5%; Careful: 60–80%, 2–3, 3–5; Rusher: most die early. Today (500 games): Careful 2.21 / 4.09, Completionist 2.24 / 3.00.
- **Waiting on the owner:** real saves from later in the game (`roadmap.md`).

## Decided in chat (2026-11-07)

- **v0.11.52: A2, the story and mechanics pass into the roadmap (owner 00:47 "give handover for new chat"; 00:48 "add the story pass to the roadmap instead, not just the handover message, then it will not bloat the handover message"; options A1 / A2; 00:49 "a2"):** `project/roadmap.md` has a new section "The story and mechanics pass (after the art)" holding, word for word, the handover's items: the story text pass and its block, P1-b / P1-c, the story and format pass, the reply texts, queueing in Act 1, batch-queueing, Yuki's loot switch, the romance gates, the Extraordinary pairs and midway gate; the handover keeps one pointer line in Open items; the roadmap's older lines on them point to the section. A1 (the section only, the handover unchanged) not picked.
  - **Uploaded by Claude after v0.11.51 (owner 00:46):** handover, roadmap, changelog, restore points, `reference.md`, `history-7.md`.
- **v0.11.51: Y3 part 2b, the other 14 human pictures (2026-11-08; options after v0.11.50: H1 / H2 for jackals_dead's pose, C1 / C2 for the code art's choker, T1 / T2 for a test sheet; owner 00:09 "go with your picks" = H1 + C1 + T1):**
  - **Picked:** H1 (jackals_dead: she crouches between the dead jackals wiping her hands, smug; mask `y3h_jd`); C1 (the choker out of the code-art human Yuki now: Act 1's code-art scenes draw her); T1 (a test sheet first: dinner, james).
  - **How:** fresh pictures (style **pc**, each key's scene text with the cat line swapped for cast `yuki_human`, side by side, "she is a head shorter than him"; details `tools/art/README.md`); `james` and `jackals_dead` inpaints on the approved pictures; drill redone with old bearded hunters (the first seeds drew long-haired young men, some like women).
  - **The pictures (owner picks 00:29):** dinner s44, james s44, hollow s44, wolves s22, lizard s44, arson s55 (s22 and s44 grew a stray woman), jackals s44, jackals_dead s55 ("the top of the ears are cut off, leave that for a final pass": in the second round), drill (redo) s88, roof s22, herb_slope s22, gao_down s22, village s44 (s55 drew her twice), collectors s44. In most she comes out about James's height, not a head shorter (accepted; none oversized).
  - **After the cold review (owner picks J1 + L1 + the low items' option):** james: the cat's paws left on his shoulder painted out (mask `y3h_james_paws`, owner pick s1); lizard: her black tail repainted white (mask `y3h_lizard_tail`, owner pick s3); the close-up's choker out too (`yukiHumanCloseUp`, never shown while `yuki_human.webp` exists); kept: arson's third thug, jackals_dead without the fire's ashes.
  - **Code:** `js/art/art.js` `YUKI_HUMAN_PICS` all 29 keys (kept as the gate for Act 1 keys that get their human picture after their cat one); `js/art/clamp2.js` the choker and knot out of `yukiHuman` and `yukiHumanCloseUp`; `tools/art/recipes.json` the 14 `<key>_human` recipes and the masks `y3h_jd`, `y3h_james_paws`, `y3h_lizard_tail`.
  - **Checks:** see the version note.
  - **Uploaded by Claude after v0.11.50 (owner, before this chat):** the changed docs ("docs uploaded by Claude").
- **v0.11.50: Y3 part 2a, the human form (owner 23:01 the session's start; options P1 / P2 / P3; 23:05 "take into account the character pictures picked that are in the game… the hybrid CLAMP/Monogatari style with heavier emphasis on CLAMP"; options D1–D3, S1 / S2; 23:08 "go with your picks" = D1 + S1 + P2; "when all the pictures are done for both acts we can uniformize"):**
  - **Picked:** P2 (two pushes: 2a the 15 scenes with only James and Yuki, 2b the 14 harder ones); S1 (the CLAMP-heavier style **pc** for the human pictures only; their cat and tiger versions keep their style); D1 (the scenes' qipao, and the portrait repainted in it). Each push starts with a test sheet.
  - **The test sheet (forage, camp):** owner 23:19 "s44 looks great for a baseline. the choker can be lost then… reword the description if necessary" (K1: the high collar hid the choker; a low-collar wording and a throat inpaint both failed): cast `yuki_human` without the choker (the story text never mentions it).
  - **The pictures (owner 23:37):** s44 for all 13 others; bone_field: "she is ginormous… rationalize her height and size": painting her out brought in a stray woman, painting her in small cut her off; a new picture with the two side by side, owner pick s66 (23:46). The portrait: "the sleeveless ones' body shape and how she is holding herself look better… use y3h_portrait_s2_d85 and draw long sleeves on it": three inpaints melted the sleeves into the dress; the arms recoloured in code (`tools/art/sleeves.py`); 23:46 "the sleeve fades to white, it should cover the whole arm": the limits widened to the bottom of the frame.
  - **After the cold review (owner 23:56 "F2 and add the second round mentioned in F3 before the final uniformization of the art"; options F1 / F2 / F3):** hunt redone side by side (crouching redos still drew her too big), owner pick s22 (23:59); rain kept ("the rain smudged her mascara"); `sleeves.py` stops on a seed off the arm. **Before the final uniformization pass (the F3 second round):** the tails of mire (thin, black), rats (mostly black) and forest_dawn (a loop not joined to her), and gift (her legs merge with James's; the red piping in a V on the ground), as small inpaints.
  - **Noted for later (23:22–23:29):** the ridge redrawn from the owner's find as the last art pass; one hub format for the whole game; no repeated texts all over the game (Open items).
  - **Code:** `js/art/art.js`: `YUKI_PIC_FORMS` {cat, tiger, human} and `YUKI_HUMAN_PICS` (the 15 keys); `pictureOf` shows `<file>_human` only for those; `tools/art/recipes.json` style `pc`, cast `yuki_human`, the 15 `<key>_human` recipes, the portrait's inpaint and local step, the mask `y3h_portrait_dress`; `tools/art/sleeves.py` (new).
  - **Checks:** see the version note.
  - **Uploaded by Claude after v0.11.49 (owner, before this chat):** handover, roadmap, changelog, restore points, `reference.md`, `history-7.md`.

## Open decisions for later steps

- **Serpent (D, owner 09:44, v0.9.9): folded into step 5** (Act 1 converted and retuned). Measured (600 random task-mode games, closed start, rewinding bots): every game reaches the ford (mostly on Act 1 Coil 3–4); the ford check (GU / Convergence DC 5, no-dice 3) vs GU check 9.5 / 13.5 / 19.0 (p10 / 50 / 90) is always passed, so **0 serpent fights in 1,500 games** (it woke 4 times; James outran it each time). Arrival HP 80–100%, so "arrives hurt" is not the lever any more. A forced fight: serpent `up` 0.25 (now) 100% won; +10: 73–97%; +16: 51–92%; +18: 33–90%. Ford DC 12 wakes it in 10% of games, DC 15 in 23%. The options for later were: B (ford DC 15, serpent +16, a loss ends the Coil), C (the same, but a loss keeps the "Swept" branch).
- **The serpent (`rt_serpent`):** measured in v0.9.3: dice 84%, no dice ~54% (78 meetings in 8,000 games); its tuning value changes nothing, because the outcome is decided by how hurt James arrives. Making it a real threat needs another lever (more damage, or James arriving weaker): a 3c item, numbers to the owner first.
- **Loot (owner's question 00:06, pick 00:08: "go with your recommendation"):** option 1 plus a little of 2. **Bone-work crafting:** cores, fangs, bone-meal and ship shards become gear in three slots (blade, wraithbone armour, a charm) and medicines (bracket salve); crafting is workshop task cards; on a rewind the gear is lost but the **recipes are kept (as Insights)**. Plus **cores as the world's currency** (bribes, tribute). Scheduled in step 4; the recipe list and numbers go to the owner before anything is built.

## Decided in chat (2026-11-05)

- **Yuki and James were born together and bonded from birth.** Her path stays open: familial, or something closer (engine canon: familial until her human form, then play decides). Fixed in v0.11.40 (`js/story/yuki_path.js` said she bonded when he was six, 34 years); the opening scene (`yuki_check`) already says born the same day in the same grove.
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
- **New rule (the dice era, Story Mode; gone):** every check was **value + d6 vs DC**, a 6 always succeeding, a 1 needing DC + 2. Incremental Mode has no dice since v0.9.3 (check ÷ DC); the dice code went in v0.11.45 (`d6()` stays as the save's random numbers for story events).

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

In `CLAUDE.md` and `project/working-agreement.md` (adopted 2026-11-05). The change sequence there is a HARD RULE: options and a recommendation first, then the owner's pick, which is the go (since v0.11.28); one pick covers one push.

## How to play / run

- **Phone:** https://hufle-beep.github.io/bone-and-ash/ in Chrome, then *Add to Home screen*. Works offline after the first load.
- **Local (Termux or PC):** `python -m http.server 8080` in the folder, open `http://localhost:8080`.

## Files, checks, gotchas, rules as implemented

In `project/reference.md` since v0.11.43 (the files table, how to run every check, the workspace gotchas, the rules as implemented). The two to know before any push: **read the full check's exit code before anything else, never chain a commit or push after it**; bump `VERSION` in `sw.js` together with the docs, after the checks (`tools/consistency.mjs` fails while they differ). Before pushing from the cloud clone: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash` and `git fetch origin main` (the clone is shallow).

## Version notes (the last three versions; older ones in the history files, newest first)

## v0.11.52 — A2: the story and mechanics pass into the roadmap

- **project/roadmap.md** (the new section, the pointers), **project/handover.md** (the items out, one pointer; v0.11.49 moved), **project/history-7.md, changelog.md, restore-points.md. sw.js:** VERSION (no game change).
- **Checks (docs only, rule 2):** `tools/consistency.mjs` and `bash tools/check.sh quick`. Nothing outside the docs reads them except the consistency check (the **Version:** line, kept).

## v0.11.51 — Y3 part 2b: the other 14 human pictures, the code art's choker out

- **art/pic:** 14 new `<key>_human.webp` (about 1.1 MB). **js/art/art.js** (`YUKI_HUMAN_PICS` all 29), **js/art/clamp2.js** (the choker out of `yukiHuman` and `yukiHumanCloseUp`), **sw.js** (ART fingerprints, VERSION), **tests/data.test.mjs** (every `YUKI_PICS` key in `YUKI_HUMAN_PICS`; the code-art human Yuki's only red is her mouth, the close-up has none; both fail on v0.11.50), **tools/art/recipes.json, README.md; tests/README.md; project/reference.md, roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.48 moved).
- **Checks:** the full `bash tools/check.sh` twice (after the picks; after the two fixes and the VERSION bump): exit 0, 0 drifted, 1 log-only move (tribute C6 won 60.2 → 53.6%, n 110, as since v0.11.48); the models unchanged (Careful 2.29 / 3.87, Completionist 2.12 / 2.94); the baseline kept; the palette check 108 pictures, 0 failed. Every recorded prompt (the 14 and the two fixes) checked against what ComfyUI ran (SHA-256 of the prompt text from its history). Cold review on Opus (art): code, files, fingerprints, recipes correct, no id changed, Yuki once in each picture with no stray figures; its findings are in the decisions block (two medium fixed, the close-up's choker fixed, two low kept).

## v0.11.50 — Y3 part 2a: the human form (15 pictures) and the portrait in the qipao

- **art/pic:** 15 new `<key>_human.webp` (about 1.25 MB); `yuki_human.webp` replaced (the qipao with long sleeves). **js/art/art.js** (`YUKI_PIC_FORMS` with human, `YUKI_HUMAN_PICS`), **sw.js** (ART fingerprints, VERSION), **tests/data.test.mjs** (the v0.11.50 lines: the forms are cat, tiger, human; the 15 keys show `<file>_human` with a recipe that draws her human form and no cat; the other 14 keep code art in human form), **tools/art/recipes.json, sleeves.py (new), README.md; tests/README.md; project/reference.md, roadmap.md, changelog.md, restore-points.md, history-7.md** (v0.11.47 moved).
- **Checks:** the full `bash tools/check.sh`: exit 0, 0 drifted, 1 log-only move (tribute C6 won 60.2 → 53.6%, n 110, as in v0.11.48 and v0.11.49); the models unchanged (Careful 2.29 / 3.87, Completionist 2.12 / 2.94); the baseline kept; the palette check 94 pictures, 0 failed. Every recorded prompt checked against what ComfyUI ran (SHA-256 of the prompt text from its history); the masks and the sleeves step rebuild the files byte for byte. Cold review on Opus (art): the code, files, fingerprints and recipes correct (`pictureOf` for all 29 keys in every form, `yuki_close` and `ridge` unchanged, no id changed; 16 pictures 800×500, 53–103 KB, 0% other colour, gold only in the portrait's eyes); its picture findings: hunt (medium, fixed: redone), rain's streak (kept, owner), the three tails and gift's legs (low, the second round, above); `sleeves.py`'s seed guard (low, fixed); the code art's choker (low, Open items). The full check rerun after the hunt redo and the VERSION bump: exit 0, 0 drifted, the same log-only move, models unchanged.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
