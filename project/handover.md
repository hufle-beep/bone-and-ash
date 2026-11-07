# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-07 (Europe/Budapest). **Version:** 0.11.43 (`sw.js` VERSION `bone-ash-0.11.43`): H2, the handover trimmed (docs only: the version chain, the decisions older than the last three versions and the 2026-11-06 decisions moved word for word to `history-6.md`; the files table, the checks, the workspace gotchas and the rules as implemented moved to `reference.md`; an Open items list; the game unchanged). Earlier versions: `project/changelog.md` (one line each) and the history files. Prologue + Act 1, about 390 scenes, Incremental Mode only. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short; 9 hard rules) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual notes, the Act 1 overview; since v0.11.43 also the files table, how to run the checks, the workspace gotchas and the rules as implemented), **`project/history-6.md`** … **`project/history.md`** (older decisions and version notes, newest first; part 6 is the newest). All mirrored to the claude.ai project "ash and bone" (rule 8: Claude asks after every push who uploads).
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3; tightened 2026-11-07, v0.11.43, pick H2):** the version line names the current version only. This file holds the open items, the decisions and version notes of the **last three versions**, and the standing facts (what the game is, the owner's spec, the 2026-11-05 decisions). Each push moves anything older word for word to the top of the newest history file (now `project/history-6.md`; a new part past about 45 KB) and keeps this file **under about 35 KB**, so Claude's project tool can read and upload it in one go.

## Open items (v0.11.43; details where noted)

- **The art (the owner's PC with Comfy Desktop; ask after every push whether he is home):** Y3, the great-cat and human versions of the 30 pictures that draw Yuki as the small cat (they slot into `YUKI_CAT_ONLY`'s form map in `js/art/art.js`); `ridge` with James small in the lower left (inpaint on the approved `r5_ridge_s88`; same file name, then `node tools/arthash.mjs --write`); then the Act 1 art (about 37 keys plus the Long Forest's 8; `hot_spring` and `trio` decided there); the last part removes the code art and the `clamp2.js` close-ups. Later: Z3 (WebP q70 / AVIF side by side), Z4 (per-act downloads, from act 3). The owner deletes `b3_jackals_dead_s22/s44/s55` from his ComfyUI folder (unwanted figures). History-6 has the tabled block.
- **E, the Act 1 retune (numbers first):** the Act 1 part test in Incremental Mode, then the dice core out (the rest of D2); the night fights, the ford serpent (`rt_serpent`, never fought; numbers under "Open decisions"), Shen Qiu; the guardian fight a strong James can't finish in 80 rounds with dice (v0.11.41 note).
- **F, the copy-over push 5 (the Coil)**, then G (engine systems, crafting and threads, Android): `roadmap.md`.
- **The story text pass** (with P1-b): the block below (Mei Lin's clothes on the herb slope; Yuki's cultivation can't be sensed either; James's glasses and tattoos).
- **P1-b / P1-c (optional):** hand-written "again" versions of about 25 key beats (about 3,000 words, drafted in chat first); real knowledge branches (warning Mei Lin, the jump on the rot ape), numbers first.
- **Noted, the owner's call (numbers first):** "End it in one move" still judges a fight about 2 points harder than it is (no-dice checks take `NO_DICE_DC_SHIFT` −2 off every combat DC; v0.11.40 review); `bl_camp`'s `toHour(19)` entered at 04:30 or after a push jumps the clock forward 14–18 h (older).
- **The rebalance targets (owner 11:22, kept for the retune):** Completionist: prologue Coil 1 death 40–60%, about 2 Coils for the prologue, about 3 for Act 1, the whole game on one Coil under 5%; Careful: 60–80%, 2–3, 3–5; Rusher: most die early. Today (500 games): Careful 2.21 / 4.09, Completionist 2.24 / 3.00.
- **Waiting on the owner:** real saves from later in the game (`roadmap.md`).

## Decided in chat (2026-11-07)

- **v0.11.43: H2, the handover trimmed (owner 18:45 "trim the handover reasonably to keep everything important. there might be times when I cannot upload despite working"; options H1 / H2 / H3; 18:49 "Go with your recommendation, also give me the new rules to paste" = H2):**
  - **Why:** the handover was 72 KB; Claude's project tool reads a file in one go only up to about 25k tokens (about 60 KB), so it could not upload it. Where the size was: the version chain 12.7 KB, decisions older than the last three versions about 15 KB (they should already have moved), the files table, the checks and the rules as implemented about 14 KB.
  - **H2 (picked):** the version line names the current version only; the PRIORITY section, the decisions of v0.11.29–v0.11.40 and their notes, the rebalance plan, the tabled art block, the "Next after…" notes, the 2026-11-06 decisions and the v0.11.40 version note moved word for word to the new `history-6.md` (part 5 is at 40 KB); the files table, "Run every check", the workspace gotchas, "Rules as implemented" and the v0.4.0 balance notes moved word for word to `reference.md` (the dice-era lines marked there); an Open items list keeps everything still open from the moved blocks. The working rules: the handover under about 35 KB, the current version only on the version line (`CLAUDE.md` rule 5, `working-agreement.md`). H1 (keep the files table, about 45 KB) and H3 (only the version line, about 59 KB) not picked.
  - **The project's Instructions field:** the owner pastes `CLAUDE.md` (given in chat at 18:5x) into it; Claude's tools can't edit that field.
  - **Uploaded by Claude after v0.11.42 (owner 18:42):** roadmap, changelog, restore points, working agreement (with "50 samples", committed here), design, `history-5.md` (new in the project), `claude/CLAUDE.md`; the project's copies had stood at v0.11.27. The handover and `reference.md` were sent as files (the handover too big then).
- **v0.11.42: B1 and rule 8 (owner 18:42 "not home yet, go with B1. you can upload the docs yourself this time. In fact ask every time if you should upload them or I should. make it a hard rule"):**
  - **B1:** `tools/sanity.mjs` `MIN_N` 100 → 50: 152 numbers compared (was 143), 0 drifted; one more log-only move: tribute C6 paid 35.8 → 29.3% (n 95 → 99). `design.md`: Intuitive Aptitude as built (+0.5 a setback, up to +2; the engine's rule K is a first try −2) and the dampening on technique Qi costs only.
  - **Rule 8 (hard rule, owner 18:42):** after every push Claude asks whether it uploads the changed docs to the claude.ai project itself (its project tool, about 35k tokens a push) or sends them as files for the owner (M1). `CLAUDE.md`, `working-agreement.md`. The project's Instructions field needs the new text: the owner pastes `CLAUDE.md` into it (Claude's tools can't edit that field). For this push the owner chose: Claude uploads (v0.11.41's and this push's docs).
  - **Checks (tools and docs only, rule 2):** `tools/sanity.mjs` on the full 1,000-game stats of v0.11.41 (byte-identical to today's game): 0 drifted; `bash tools/check.sh quick`: passed. How it touches the rest: only the drift step reads `MIN_N`; numbers between n 50 and 100 can now fail the check at ±20 (none is near).
- **The art (18:42):** not home yet; ask again after this push.
- **v0.11.41: D2-a + S (owner 18:19 "go with your recommendation" = D2-a + S; 18:25 "not home yet, push art back one step" = go, ask about the art after this push; 18:27 "K1"):**
  - **Found while building (stopped, options K1 / K2 / K3):** the Act 1 part test still plays with dice and, in Incremental Mode, its walks fall into prologue scenes it doesn't load; so the dice core can't go before that test is converted. **K1 (picked):** everything else now, the dice in checks and fights later with the part test's conversion (chunk E). K2 (convert the part test now) and K3 (drop it) not picked.
  - **Removed:** `main.js`: `taskMode`, Story Mode's screen (`renderStory`'s choice list, `renderCombat`, the `data-choice` handlers), every Story-or-Incremental branch; `game.js`: the Story branches of the Coil bonus, speed by use, Exhaustion, the day's end and the night, sleep's wake count, starving, the sit's gain and length, the breakthrough's length and 95%, the relationship catch-up (`condensationSatGain` no longer imported); `meridians.js`: Story Mode's checked sessions (2 a day, DCs ÷ the Coil bonus, Intuitive Aptitude), the one-a-day rule and its flags `mer_e8` / `mer_ec` / `mer_jn`, `canAnyMeridian`, `dcPrimary` / `dcColGroup` / `sessionsToday`; `prologue.js`: the one-button Long Forest (`longForestInstant`), the hubs' Story "Break through" and "Open a meridian", Story wording of the forms; `tasks.js`, `story.js`, `meditate.js`, `oneoff.js`, `common.js` (`dayKey` = the waking day), `coil.js`, `coil_scenes.js`. **Kept (the dice core):** `setNoDice` / `isNoDice`, `rollCheck`'s dice branch, the dice fight round, `dmgRoll`'s die, the forms switch, `noDiceUp`, the check outcomes in `story.js`.
  - **Choice places kept:** every Story-only choice is now `{ text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: … }`, so no later choice moves (task card ids are `scene:index` in saves; `g.picked` too): the meridian screen's 5 sessions, the hubs' break-through (first) and meridian (after the work) choices, `meditate1`'s Condense, `night`'s, `night_event`'s, `fo_night`'s and `heart_camp`'s sits, the clearing's one-step Long Forest. The meridian screen itself stays (its 5 work choices are the Meditate cards' data). `mer_return` is read only (the screen's "Open your eyes." for an old save left there): on the keep-list. The tribute's bluff and hairpin DCs are plain 7 and 5 (were 6 / 4 + 1 in Incremental Mode).
  - **Proof:** the tasks test (1,000 games), the story test (1,000) and the models (300 + 100 Yuki off) wrote byte-identical stats before and after. The part test: in the return part 1 run in 20 now starts far past it (T3, realm 4), since its walks used to climb realms through Story Mode's hub choices; that is how the elder's duel was won and walked.
  - **S:** browser part 1 split (part 4: the reload and the two tabs, side by side with part 1); the leftover check's watched runs 300 → 150 games each (150 and 100 gave findings identical to 300). The full check 114 → 100 s (not the 85 s estimated: the tasks test, 62 s, stays the longest path).
  - **Noted while building:** in the heart part, a James at T3 realm 4 doesn't finish the guardian fight in 80 rounds with dice (a stalemate; the part test's strong runs are limited to the return part). Worth a look in the Act 1 retune: in Incremental Mode a fight past 30 rounds is lost.
- **Story text pass (owner 18:29 and 18:35; with the other story rewrites, P1-b; the pictures stay):** (1) the herb slope (`herb_girl`, "Outer Disciple") describes Mei Lin in "a patched brown jacket"; her picture (and the cast in `tools/art/recipes.json`) has a white jacket with a red sash, a long dark skirt, black hair with a red ribbon: reword the scene, and anywhere else her clothes are described; (2) Yuki's cultivation can't be sensed either, the same principle as James's (locals can't sense him: `ENEMY_REALM` comment in `power.js`): reflect it wherever her power is noticed or sensed; (3) already open: James's glasses and tattoos in the text (the art push, v0.11.24).
- **The art (owner 18:25):** not home yet, pushed back one step: ask again after the next push.

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
- **New rule (the dice era, Story Mode; gone):** every check was **value + d6 vs DC**, a 6 always succeeding, a 1 needing DC + 2. Incremental Mode has no dice since v0.9.3 (check ÷ DC); the dice code left is only for the Act 1 part test (v0.11.41).

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

## v0.11.43 — H2, the handover trimmed

- **project/handover.md:** trimmed (the decisions block). **project/history-6.md** (new): the moved blocks, word for word. **project/reference.md:** the files table, the checks, the gotchas, the rules as implemented. **CLAUDE.md** rule 5, **project/working-agreement.md:** the handover rule; "50 samples". **project/roadmap.md, changelog.md, restore-points.md.** **sw.js:** VERSION (no game change).
- **Checks (docs only, rule 2):** `tools/consistency.mjs` (versions, offline files) and `bash tools/check.sh quick`. Nothing outside the docs reads them except the consistency check (the **Version:** line, kept).

## v0.11.42 — B1: drift from n 50, design.md, rule 8

- **tools/sanity.mjs:** `MIN_N` 50. **project/design.md:** Intuitive Aptitude and the dampening as built. **CLAUDE.md, project/working-agreement.md:** rule 8 (ask who uploads). **tests/README.md:** n ≥ 50. **sw.js:** VERSION (no game change).
- **Checks:** the sanity check on the full stats: 152 compared, 0 drifted, 12 log-only moves; `check.sh quick` passed (32.8 s).

## v0.11.41 — D2-a + S: Story Mode's code out, a faster check

- **js/main.js, js/core/game.js, js/core/story.js, js/core/tasks.js, js/core/meditate.js, js/core/coil.js, js/story/meridians.js, js/story/prologue.js, js/story/oneoff.js, js/story/common.js, js/story/coil_scenes.js, js/story/wilds.js, js/story/act1_heart.js, js/story/act1_fallout.js:** as in the decisions block. **tests/tasks.test.mjs:** the Story checks out (session limits, the meridian DC ÷ the Coil bonus), the hidden places checked (no Story text left), the tribute DCs and the hedge text as plain values. **tests/part.test.mjs:** the strong run in the return part. **tools/check.mjs:** browser part 4, the watched runs 150. **tools/browser.py:** part 4. **tests/tools.test.mjs:** four browser parts. **tools/leftovers-keep.json:** `mer_return` (read only). **tests/README.md**, **tools/timings.json**. **sw.js:** VERSION.
- **The full check:** exit code 0, 0 drifted (the same 11 log-only moves as v0.11.40), the leftover step 0 findings, 99.7 s; models unchanged (Careful 2.21 / 4.09, Completionist 2.24 / 3.00). No Fable review: no logic or balance change, proven by byte-identical bot stats (as in v0.11.23); the UI by the browser test's four parts.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
