# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-24 (Europe/Budapest). **Version:** 0.11.271 (`sw.js` VERSION `bone-ash-0.11.271`): **the Cultivator back inside T1 (P39-A, the owner 2026-11-24 22:37: "P39-a"; JW-A at the build's stop, 23:08: "JW-A go"; a balance change, no save change):** **RG** the collectors' HP for a James at Core Formation or above 0.8 → 0.7 (`fight_tune.js` `HIGH_REALM`, `HP_TUNE_HIGH`, `hpTuneFor`; `power.js` `prepare`; P25-A's by-realm pattern; on every Coil): measured before the pick (200 games a model, `claude/p39-options.md`) the Cultivator's whole game on Coil 1 19.5 → 32.5% (seed 1: 15.5 → 21.5; mean 17.5 → 27), the Completionist 21.5% (Foundation at the tribute), Careful and the Sociable (0% on Coil 1, Act 1 4.96) unchanged; **MN** Careful's Mei Lin last nights (32.5 → 1.5% after P25-A) closed as by design: `fo_last_night` takes the trio's branch whenever both women are liked, and P25-A's two more Act 1 Coils let both pass the bar (trio 19 → 46%); **UC** (log only) the collectors' `up` is a cliff for the Cultivator (4.375: 19.5%; 4.25 and 4.0: 66.5%), not a tuning knob; **JW-A** the story test's music walks lost `journey.02` (2 of 160 walks before, Ya 26, James at Core Formation or up: RG moved them; 200 walks, Ya held low: 0), so it is checked directly (`lineOpen`, and drawn on `bl_camp` through `musicLine`, the review's TG2). **Next push:** open, options later.
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short; 11 hard rules; rule 11, usage, since v0.11.178) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md`, `roadmap-2.md` and **`roadmap-act2.md`** (Act 2, since v0.11.171) and **`roadmap-time.md`** (the time scale, since v0.11.201) (what's next; done lines in `roadmap-done.md`, `roadmap-done-2.md`, `roadmap-done-3.md` (since v0.11.150), `roadmap-done-4.md` (since v0.11.208)), **`project/lore.md`** (the one lore source for story texts, v0.11.73), **`project/research.md`** and **`research-2.md`** (every research round: licences, candidates, the skipped list, where each went; v0.11.73; in parts since v0.11.78, a new part past about 45 KB; group i's round 1 in v0.11.74, round 2's waves in v0.11.75 and v0.11.76, the helper reports and briefs word for word in **`project/research/`**, repo only), `CREDITS.md` (code, ideas, fonts, tools), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, **`changelog-3.md`** (0.11.70–0.11.139; split in v0.11.176, pick CL1) and **`changelog-2.md`** (0.11.69 and before; split in v0.11.105, pick CS1), `project/restore-points.md` and **`restore-points-2.md`** (0.11.69 and before; split in v0.11.158, pick NX2), **`project/reference.md`** (the prologue story map, the visual notes, the Act 1 overview; since v0.11.43 also the files table, how to run the checks, the workspace gotchas and the rules as implemented), **`project/history-54.md`** … **`project/history.md`** (older decisions and version notes, newest first; part 54 is the newest, since v0.11.271). All mirrored to the claude.ai project "ash and bone" (rule 8, since v0.11.79: Claude uploads the changed docs itself after every push; `project/research/` repo only).
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`). **Both are the owner's own (owner 2026-11-08 16:48, "please note that both Selene and the Rules Engine in the Rules Engine on ST-Shared are mine, so you can freely adopt/adapt anything from them"): anything in them can be copied or adapted freely, no licence check; only outside games keep their own licences (groups h and i).**

**How the handover is kept small (owner 2026-11-06, v0.10.3; tightened 2026-11-07, v0.11.43, pick H2):** the version line names the current version only. This file holds the open items, the decisions and version notes of the **last three versions**, and the standing facts (what the game is, the owner's spec, the 2026-11-05 decisions). Each push moves anything older word for word to the top of the newest history file (now `project/history-54.md`, started in v0.11.271; a new part past 20 KB since v0.11.178) and keeps this file **under about 35 KB**, so Claude's project tool can read and upload it in one go.

## Open items (v0.11.270; every "open, options later" item is on the roadmap)

- **The open items: placed on the roadmap in v0.11.240** (RA1; the entry as it stood, word for word, in `history-43.md`). Where they are: `roadmap-e.md`'s "No repeated texts" line (its tails name FC, SNr, LG, BYb-t, ST2 degree 3, EVn-23, SPw3, BH, NF, TL2 / TL4, LF, ME, the hare's CW line, CW in part 8; the v0.11.240 tail FS10 and the rest), its "Small text fixes" line (the `rt_fire_talk` tic), its end (the lore line; the review notes for the polish pass, log only); `roadmap-retune.md`'s end (the old calendar's supper after midnight, `p13-measure.md` §10); `roadmap-done-4.md` (4 notes closed as accepted). The numbers each item had: `history-43.md` and `claude/p13-options.md`. *(v0.11.244, RO2: KA's three and t's KR, BD, BP, the drift guard and HN placed: section 4, the retune, e, and one closed; pointers where they stood.)*
- **NEXT PUSH: open, options later.** The Cultivator back inside T1 (v0.11.271); systems before Act 2 (v0.11.270); the dangling open items placed (v0.11.269). Open, options later (on the roadmap: `roadmap.md` section 2): the rest of section 2 (`roadmap-retune.md`'s knobs and tools: the tuning tools and rules (the tuning-notes doc, the pins for frozen sections, simruns, skillWatch, Careful's eating under Fed 30, the retune rules, the check order, the engine's times lint, the "tuned up to" note), BD, HN, KA's (a), the older notes; the fight texts in textlint's pools (the P35 review's TG6: measured in P39's analysis, 55 lines / 780 words, 0 tics, 1 shared with a scene, 7 snapshot changes); the P39 review's L3 (the kept realm meets 0.7 from a later Coil's start; `--kept` not measured)), then 5b, systems, Act 2, art, later. *(The entry as it stood, word for word, in `history-54.md`.)*
- **Group e's done pushes and the standing notes (since v0.11.167; Selene, Luna, parallel work, usage): word for word in `history-33.md` since v0.11.215** (the 35 KB check); every open, options later item is on the roadmap. **Still in force:** **parallel work (the owner 06:48) and the owner 08:14: word for word in `history-29.md`** (split long jobs into parallel runs; at most 2 Fable jobs at once; *v0.11.245, SP1 FP: up to 6*).
- **The Android app: done** (v0.11.145–v0.11.150, five pushes; the plan and its lines in `roadmap-done-3.md` since v0.11.172, moved from `roadmap.md` section 0). **The tabling ends** (TB1, the owner 15:23: everything waited until the app was done): roadmap sections 1–5 are open again. **Also open for later** (`roadmap-2.md` section 4 (g)–(i) since v0.11.196): the update check off the API; target SDK 35/36 with edge-to-edge; Welcome back, the third notice in `design.md`. **Known:** never rename `android.yml` (its run number is the version code); the app's saves are apart from the browser's; the APK can't be built in the cloud workspace (GitHub builds it on a push that touches the game or `android/`; the app finds the new build itself). **On the owner's phone (2026-11-12):** build 3 found build 4 and installed it by itself (17:29); the save buttons work (17:30). **What's new (WK, since v0.11.150):** every push that changes what a player sees adds a line to `NOTES` in `js/core/news.js` (Claude's plain words); docs-only pushes add none.
- *(v0.11.269, owner pick P37-A, SH: the v0.11.214 review line, the time scale's pointer, the plan for Friday and the order of 2026-11-09 (Act 2 before the retune) moved word for word to `history-53.md`; the one order is `roadmap.md`'s Order line.)*
- **Group d (combat): closed in v0.11.151** (WD1, RV1): its open parts in `roadmap.md` section 2 (the retune), `roadmap-2.md` sections 4 (Insights, crafting) and `roadmap-act2.md` (the knitting bone and the crushing mass), the weapon-to-Convergence note in `reference.md`.
- **Waiting on the owner:** real saves from later in the game (`roadmap.md`). **Saves are progress reports, not bug reports, unless the owner says so (owner 09:59 "none of the saves are bug reports, just progress reports I will explicitly call out when it's a bug report"):** don't ask about each save. Data for the story and mechanics pass: `saves/2026-11-08-0446-incremental-rt_camp.txt`, `0813-incremental-a1_end.txt`, `0814-incremental-coil_dawn.txt`. The owner's calls on the texts: `roadmap-2.md` section 6.

## Decided in chat (2026-11-07)

- **v0.11.271: P39-A (the owner 2026-11-24 22:37: "P39-a"); JW-A (23:08: "JW-A go", the build's stop on the story test).** The options as laid out in chat (`claude/p39-options.md`, the project doc): **P39-A 🟢 (picked, recommended)** RG + MN + UC (the Cultivator 17.5 → 27%, mid-band; nothing else moves); P39-B 🟡 FL + MN + UC (the collectors 0.75 for everyone: the Cultivator 20.3%, the Completionist 28%; Careful's Act 1 4.96 → 4.79); P39-C 🟠 MN + UC only; P39-D 🔴 hold. Measured and dropped: HP 0.7 for everyone (the Completionist 37%), `up` 4.25 / 4.0 (the cliff). The stop: **JW-A 🟢 (picked, recommended)** journey.02 checked directly; JW-B 🔴 more or banded walks (0 of 3 tries); JW-C 🔴 hold and drop RG.
- **v0.11.270: P38-A (the owner 2026-11-24 21:04: "move step 8 before act 2, the game should be mature before we start working on it."; 21:06: "P38-a go").** The options as laid out in chat (`claude/p38-options.md`, the project doc): **P38-A 🟢 (picked, recommended)** RO + SL + HW + BM (all of section 4 before Act 2; the docs agree); P38-B 🟡 the display half of section 4 before Act 2 (about 5–8 pushes), the balance half after it; P38-C 🟠 the Order line only; P38-D 🔴 hold. No review (rule 9: docs only).
- **v0.11.269: P37-A (the owner 2026-11-24 20:31: "P37-a go").** The options as laid out in chat (`claude/p37-options.md`, the project doc): **P37-A 🟢 (picked, recommended)** S0 + SH + L3 → 5b + L4 closed + RT + TC → 5b + PI (7 of 7 on a step or closed; 5b 6 → 8 items); P37-B 🟡 L3 closed, TC to Act 2's lore line, RT left (6 of 7); P37-C 🟠 S0 + SH only (2 of 7); P37-D 🔴 hold. The owner asked: "check for the current unassigned/dangling open items and propose their placement on the open roadmap sections" (20:26). No review (rule 9: docs only).

## Open decisions for later steps

*(v0.11.203, the 35 KB check)* The three open decisions (the serpent's fight (D, v0.9.9), the serpent `rt_serpent` (v0.9.3), loot and bone-work crafting (00:06 / 00:08)) moved word for word to `history-29.md`; they are on the roadmap's section 2 and `roadmap-2.md` section 4.

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

## Version notes (the last three versions; older ones in the history files, newest first; v0.11.268's moved in v0.11.271)

## v0.11.271 — The Cultivator back inside T1 (P39-A + JW-A)

- **Files:** `js/story/fight_tune.js` (`HIGH_REALM`, `HP_TUNE_HIGH`, `hpTuneFor`), `js/story/power.js` (`prepare` by `hpTuneFor`), `js/core/news.js` (What's new), `sw.js`; tests: `tests/story.test.mjs` (the P39-A block: RG, the review's TG1 grown and TG3 `bluff_fail`; JW-A in the music walks with the review's TG2), `tests/tools.test.mjs` (the P39-A block: the moves), `tests/README.md`; baselines: `tools/baseline.json`, `baseline-long.json`, `models-baseline.json` re-saved (`sanity.mjs --update --last`, the pick the go); docs: `project/research/p39-*` (repo only), the four docs, `history-54.md` (new), `roadmap-done-5.md`, `changelog-6.md`, `restore-points-4.md`.
- **What:** see the version line. What's new: a Core Formation James wears the collectors down sooner (Lu Han; Gao Feng or the disciple once the village has grown), on every Coil.
- **Checks:** a balance change (rule 2): while building the story test (12,000,887 passed after the review's fixes; its first run stopped on the music walks' journey.02: the stop, JW-A), the tools test and `bash tools/check.sh quick` (exit 0, 1,036 s); then the full `bash tools/check.sh` once, after the review's fixes: **exit 0, 31 m 29 s** (one browser flake passed on its retry). Sanity: 122 compared, 0 drifted, 0 moved past 5; the long calendar 227 compared, 0 drifted, 4 noted, all the Cultivator: tribute C1 won 19.6 → 32.7%, lost 80.4 → 67.3, prologue and Act 1 on Coil 1 19.5 → 32.5. TARGET lines: T1 the Completionist 20.5% in, the Cultivator 32.5% near (seed 0; seed 1 21.5 measured before the pick, mean 27); T2 Careful and the Sociable 0% in; T3 4.96 / 4.97 in. Others unchanged (the Farmer 17.5%, the Rusher and the Sitter 0%). The three baselines re-saved after it (`--update --last`, the pick the go); a sanity run on them: 0 drifted, 0 noted. The tools test's two older pins re-pinned (PG, the established pattern): the handover's oldest kept notes are v0.11.269's and it names `history-54.md`.
- **Opus:** the cold review (`project/research/p39-review.md`): no high, no medium; L1 (the What's new line: the second foe only from growth 2) and L2 (the Cultivator is True Core, realm 3, at the tribute: the comment) fixed; L4 (every Coil) in the changelog and What's new; L3 (the kept realm: a later Coil at Core Formation from its start meets 0.7; `--kept` not measured) open, options later; TG1–TG3 done. Planted faults through `tools/mutate.mjs` (`project/research/p39-mutate.md`): 14 of 14 caught (Claude's F1–F7, the reviewer's C1–C7; C4, the second foe kept at 0.8, caught by TG1). **Fable:** none (no story text; the What's new line is Claude's).

## v0.11.270 — Systems before Act 2 (P38-A)

- **Files:** `sw.js`; tests: `tests/tools.test.mjs` (the P38-A block; PL-A's Order pin re-pinned; T1 this push's move), `tests/README.md`; docs: `project/roadmap.md` (the Order line, the A2 and 2b headings, section 0's note; v0.11.267's done line moved, MD), `project/roadmap-2.md` (section 4's heading and BM note), `project/roadmap-act2.md` (its top note), `project/roadmap-done-5.md`, the four docs, `history-53.md`.
- **What:** see the version line. No What's new line: nothing a player sees changed.
- **Checks:** docs only (rule 2): the tools test (617 passed) and `bash tools/check.sh quick` (exit 0, 638.7 s). Two older pins re-pinned before it (PG, the established pattern): v0.11.216's Order pin reads Act 2 as step 7, and P37-A's section-0 pin no longer needs its note first. **How it touches the rest:** docs only; the game and its numbers as 0.11.268.
- **Opus:** none (rule 9). **Fable:** none.

## v0.11.269 — The dangling open items placed (P37-A)

- **Files:** `CLAUDE.md` (rule 2: `--update --last`), `sw.js`; tests: `tests/tools.test.mjs` (the P37-A block; T1 this push's moves), `tests/README.md`; docs: `project/working-agreement.md` (RT), `project/roadmap.md` (section 0's notes, section 2b's L3 and TC; v0.11.266's done line moved, MD), `project/roadmap-2.md` (section 6's pointer), `project/roadmap-done-5.md` (the moved line, L4 closed), the four docs, `history-53.md` (new).
- **What:** see the version line. No What's new line: nothing a player sees changed.
- **Checks:** docs only (rule 2): the tools test and `bash tools/check.sh quick`: exit 0, 650.3 s (the tools test 611 passed: the P37-A block). Its first run stopped on the tools test (571.9 s, 610 passed, 1 failed): RO1 (HP)'s pin read the v0.11.214 review line in the handover, which SH moved; it now reads the handover or `history-53.md` (the established re-pin, PG). **How it touches the rest:** docs and rule text only; the game and its numbers as 0.11.268.
- **Opus:** none (rule 9: no game logic, balance or story text). **Fable:** none (L3's line is drafted in 5b).

## Next steps

See `project/roadmap.md`.

**Connectors:** the owner does not want the Gmail connector (2026-11-09 17:54); files go to him in chat.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
