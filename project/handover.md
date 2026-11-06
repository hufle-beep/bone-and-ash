# Bone and Ash — handover (read this first in a new chat)

**Saved:** 2026-11-06 (Europe/Budapest). **Version:** 0.11.11 (`sw.js` VERSION `bone-ash-0.11.11`): the copy-over push 4b (bars that slide and redraw only on change; hold a card for its tooltip; a screen-reader announcer, progress values, reduced motion; each tab keeps its scroll and opened Results stay open); on top of 0.11.10: the copy-over push 4a (updates arrive on the first reopen; checks hidden on every card and result line, with a Show checks switch; a Selene-style main menu on plain paper with Saves and Settings, text size 90–130%, the Saves tab now ☰ Menu); on top of 0.11.9: the copy-over push 3, saves (share a save to GitHub without a token, Export all / Restore all, an export reminder, a Backups list in the Saves tab, "Copy status as text" with a pause log; no save-format or balance change); on top of 0.11.8: a closing tab never writes over a newer save from another tab, and the browser test made reliable (10 / 10, plus a two-tab check); on top of 0.11.7: tests and tools, the copy-over push 2 (a browser test with real taps in both modes, a data-integrity test, four fresh test saves from today's version, a log-only content lint, the workspace gotchas; the game is the same as 0.11.5); on top of 0.11.6: docs only, rule 1 clarified (a go covers one push; stop after every push); on top of 0.11.5: the safety push (the offline file list fixed and checked, save when hidden and every 15 s while a card runs, a running card's bar kept across a reopen, a version check, the engine's own 126 formula tests; the game plays the same); on top of 0.11.4: forms 3b (Incremental Mode: damage by form, Guard by defence form, the spike field, shield cover for Yuki, the bone spear in a new Reach line); on top of 0.11.3: the mechanics sanity check (hard rule 2: after every build, before the docs, the full `check.sh` ends with `tools/sanity.mjs`; tools only, the game is the same as 0.11.2); on top of 0.11.2: timed cultivation, the base redesign push 2 (Incremental Mode: a sit is an hour, Saturation by hours, 10 h × 2^realm ÷ the Coil bonus; meridians by hours of work, no daily limit, no fail, XP once per channel, locked below Fed 20; the breakthrough a timed, queueable card); on top of 0.11.1: tests and tools only (the bot games split across cores with a seed per game, `check.sh quick`, `tools/bots.mjs`; the game is the same as 0.11.0); on top of 0.11.0: the base redesign, push 1 (each rewind starts James's and Yuki's realm, skills, Saturation and meridians over; the Coil bonus ×(1 + 0.5 × earlier Coils of the act) makes them come back faster); on top of 0.10.4: Bonesinger forms (four lines unlocking by Convergence Use rank; only what James can sing shows in fights and choices; the fragile knife breaks), Tasks renamed **Incremental Mode** and Classic **Story Mode**; on top of 0.10.3 (docs only: the handover split) and 0.10.2: paused by default and on every new scene (a tapped card runs once, then pauses), the camp as a task screen, waiting for a time of day happens at once; on top of the Long Forest in task mode (from Coil 2 of the prologue, one season = +1 realm, up to Heavenly Immortal), on top of queue planning with Selene's forecast (run now / + to queue, ↑↓✕, Clear, meridian sessions in the queue, a death row and a pause before it), starving 1.5 HP an hour in task mode, rest and sleep at once; on top of the clock with seconds (v0.9.9), Tasks on by default and the speed gate (v0.9.8, push 4 of 4, 3c-3), on top of severe difficulty in task mode (v0.9.7, push 3 of 4: HP 0 or a lost beast fight ends the Coil, beasts +0.5, tribute +1), on top of meridians closed at the start and Act 1's Coil (v0.9.6), every screen as cards (v0.9.5: story choices with bars, every choice takes time, the Meditate card everywhere), the Coil (v0.9.4) and no dice anywhere in task mode (v0.9.3) and step 3b. Tasks is now the default mode (Saves → Game mode: Tasks or Classic). Prologue + Act 1, about 390 scenes. **Repo:** `hufle-beep/bone-and-ash` (public), branch `main`. Moved here 2026-11-01 from the private `hufle-beep/James-rpg-test` (now retired). **Play:** https://hufle-beep.github.io/bone-and-ash/ (GitHub Pages, from `main`, root).
Built in the SillyTavern chat as a spin-off. That chat stays for SillyTavern; this game continues in its own chats.

**Rules:** `CLAUDE.md` (short) and `project/working-agreement.md` (full) — the change sequence is a HARD RULE. **Other docs:** `project/roadmap.md` (what's next), `project/design.md` (the approved hybrid design: Selene-style tasks and the Coil), `project/changelog.md`, `project/restore-points.md`, **`project/reference.md`** (the prologue story map, the visual design notes, the Act 1 overview) **`project/history-3.md`**, **`project/history-2.md`** and **`project/history.md`** (older decisions and version notes, newest first; part 3 is the newest). All mirrored to the claude.ai project "ash and bone".
**Reference repos (the owner's):** `hufle-beep/Long-patience` (Selene: rules, docs, Android wrapper and workflows to copy), `hufle-beep/Shared-ST` (private; Rules Engine C in `st/rules-engine-c/`, presets in `st/rules-engine-c/lib/presets.js`, `docs/STANDING_LATEST.md`).

**How the handover is kept small (owner 2026-11-06, v0.10.3):** this file holds the decisions and version notes of the **last three versions**; each push moves anything older to the top of the newest history file (now `project/history-3.md`, started with v0.11.11 when part 2 reached about 45 KB). When it passes about 45 KB, the next part starts (`history-4.md`). Every doc stays small enough to upload to the claude.ai project straight from the file.

## Decided in chat (2026-11-06)

- **v0.11.11: the copy-over push 4b (owner 17:51 "I uploaded the save Successfully, add it's test to 4b"; 17:54 "procceed with 4b" → the list; go 17:56 "go your picks" = 1a, 2a, 3a, 4a; built in v0.11.11):**
  - **The owner's first real save:** `saves/2026-11-06-1749-incremental-arrival.txt` (shared from the phone at 17:49 with Share to GitHub, packed, 726 characters): a new game at the arrival (Day 1, Coil 1, nothing done yet). A second one came at 18:06 while this push was being finished: `saves/2026-11-06-1806-incremental-arrival.txt` (the arrival on **Coil 2**, after a rewind: familiarity on 6 cards, 29 journal lines); the push was rebased onto it (a local, unpushed commit) and the full check run again with it: 12 files, 76 checks, all passed, 0 drift. More from later in the game (a queue running, Coil 2+, Act 1, the Long Forest) will come when the owner has them.
  - **1a bars:** James's bar and Yuki's bar slide (`transform: scaleX`, no layout) and are written only when they move by 0.1%; the clock's text only when it changes. The static bars stay as they were.
  - **2a hold-for-tooltip:** hold a card (story, task, Meditate, fight, Story Mode choice) for 0.5 s: a pop-up with ✕ tells what it can bring back (the items its choice gives), the Qi, the time, the familiarity to the next tier, a fight action's effects, or why it's shut. No checks or odds unless Show checks is on. The tap that ends the hold (on that card) does nothing; moving the finger more than 10 px cancels the hold; the long-press menu and text selection are off on cards.
  - **3a accessibility:** `#view` is no longer one big live region (it re-read the whole screen after every tap); a hidden announcer says the new scene's title, a fight, or a finished card's summary. The status bars, James's bar and Yuki's bar are progressbars with values; the running queue row is marked (`aria-current="step"`, bold); smooth scrolling follows the phone's reduce-motion setting.
  - **4a scroll:** Story, James, Hammerspace and Journal each keep their scroll; the Story tab starts at the top again on a new scene. A Results entry the player opened stays open when the screen redraws. The queue doesn't follow its running row (that row is always the first).
  - **Already there:** "a close ✕ on pop-ups" — the error bar and the download reminder have one; the tooltip has one.
  - **Tests:** browser test part 7 (a held card opens its tooltip without check text, the ending tap starts nothing and the scene stays, ✕ closes it; three status progressbars with values; the running bar has `scaleX`, no width, a progressbar track; the James tab comes back at its scroll). Two test-side fixes while building: a new game has no autosave yet (the scene title is compared instead), and the held card must be scrolled into view first. Three runs in a row passed. By hand: a task card's tooltip ("Rest an hour. · Takes 1 h, passing at once."), an opened Results entry still open after the next card finished. Data integrity: 120 checks. Full check: all passed (exit code 0), 0 drift.
  - **The owner's next request (18:00, during the build; not built yet, needs options first):** "make saturation queuable too": the Meditate card's Cultivate sit ("Cultivate: an hour, 10 Qi, Saturation +10%") has no + where the screen has no Cultivate card of its own (seen on the camp on Day 1).
- **v0.11.10: the copy-over push 4a (owner 17:27 "where is the option to share to git?" → the phone still ran 0.11.8 after reloads; 17:31 "a now, included in the next push" (wait, and the cache fix in the next push); 17:37 two additions to the UI push: "Hide checks from the card, even the possibility of failure… the displays on the character screen is enough" and "a main menu in the style of Selene with settings, loading options and switches. whiteout the games background until the game itself is entered"; picks and go 17:41 "1a, 2a, 3a, 4a, 5a, go"; built in v0.11.10):**
  - **Why the phone kept 0.11.9 away:** GitHub Pages lets a browser keep each file 10 minutes, and the offline helper's network-first fetch went through that browser cache. **Fixed:** game files are fetched with `cache: 'no-cache'` (a cheap "not modified" when nothing changed; a navigation by URL, since a navigate request can't take options) and a new version's install caches with `cache: 'reload'`. Checked by hand with the offline helper on: a file changed on the server arrived on one reload; offline still opens.
  - **1a** the UI push is split: **4a** (this) = the cache fix, hidden checks, the main menu with settings and text size; **4b** = smoother bars, hold-for-tooltip, accessibility basics, scroll kept per tab.
  - **2a + 3a hidden checks, both modes:** no skill value, DC, "passes / partly / fails", outcome colour (`b-*`), fight hit numbers or Run odds on any card (story, task, Meditate, fight, Yuki's lane); time, Qi, familiarity and effects stay (Guard reads "defence +N this round"). Result, Results-pane, journal and fight-log lines are shown without their checks (`hideCheck`: "Bone spear — miss", "X attacks — it lands: 3 (DR 1).", a bare check line is dropped, a haul keeps "A double haul." / "Only partly."); the journal's "N checks rolled" line goes. Display only: the saved lines, the summaries and the rules are unchanged. Checked on 336 sampled line kinds from 600 bot games (both modes): none keeps a check. The forecast's death row and the James tab stay as they are.
  - **4a** Settings → **Show checks** (off by default, per phone `boneash.showchecks`) brings every number back, for testing.
  - **5a the main menu:** every open shows a plain paper page (no picture, status or tab bar): the 骨 seal, the title, the version (from the offline cache name), **Continue** (scene, clock, Coil; **Begin** on a first start), **New game** (tap twice), **Saves**, **Settings**. Saves = the slots, Backups, download / load, Share to GitHub, Copy status, Export / Restore all. Settings = game mode (5 taps on its heading for test speeds), pause before the forecast death, text size 90 / 100 / 110 / 120 / 130% (`boneash.textsize`, scales the whole page), Show checks, the download reminder. The **Saves tab is now ☰ Menu** (pauses and saves, then opens the menu). A damaged save: the menu's first button leads to the recovery screen. Loading anything from Saves enters the game.
  - **Tests:** the browser test enters through the menu, fails on `DC`, a die, "+ d6" or "→ passes / partly / fails" on game screens (story, fights, journal), and checks the menu (no tab bar or picture behind it, Begin on a first start, Settings' text size gives a 19.2 px root at 120%, Show checks switches, Saves, Continue, ☰ Menu back). Data integrity: 117 checks. Full check: all passed (exit code 0), 0 drift.
  - **How the owner shares a save now:** ☰ Menu → **Saves** → **Share to GitHub** (then as below).
- **v0.11.9: the copy-over push 3, saves (owner 17:12 "give me push 3's exact list"; three choices; go 17:16 "go A1, B1, C1"; built in v0.11.9):**
  - **A1:** a shared save is packed: `BAZ1:` + base64(gzip(the save text)), like Selene's `LPZ1:`. Measured on the 10 test saves: packed 573–7,805 characters (8 of 10 fit GitHub's 7,500-character link); as plain JSON only about 3 would.
  - **B1:** no in-game list of shared saves for now; a shared `.txt` loads through "Load save file" (and the saves test plays every `.txt` in `saves/`).
  - **C1:** "Copy status as text" carries the last 10 pause / speed changes with their cause (memory only, never saved). Causes: card tapped while paused, the tapped card finished, new scene, pause button, resume button, speed menu, forecast death ahead, queue full; **"not logged"** = a change that came from anywhere else, caught at the next tick or render: that is the line to look for when the game unpauses by itself.
  - **Built:** (1) Saves tab → **Share to GitHub**: GitHub's new-file page for `saves/<date-time>-<incremental|story>-<scene>.txt` with the save in the link; over 7,500 characters the save is copied and the empty file opens to paste into (checked: the Long Forest test save 2,037 characters in the link; Act 1 Coil 1 copied, 7 KB; both loaded back). (2) "Load save file" takes `.json` and `.txt`. (3) **Export reminder:** after 1 h of play (the backups' play clock) and a day since the last export, share or reminder, a notice with "Download now" and ✕; switch in the Saves tab; new key `boneash.exp` `{ t, pl, off }`. (4) **Export all saves** (`{ boneashAllSaves: 1, saved, auto, slots, backups, when, label }`) and **Restore all saves**: every save in the file is read first (an unreadable autosave = nothing changes; an unreadable slot or backup is left out and counted), a confirm shows what the file holds, then this game goes to the "before" backup (the file's own "before" is not restored) and the same keys are written. Loading an all-saves file through "Load save file" asks the same. (5) **Backups** list in the Saves tab (Restore keeps this game as "before"). (6) **Copy status as text:** version (from the offline cache name, else `sw.js`), mode, speed, scene, clock, act and Coil, realm, HP / Convergence / Fed, the running card, the queue, the pause log, the last 5 journal lines, the browser. (7) Browser test part 5 (Copy status, Export all → Restore all into a new game exact, a backup restored); the saves test reads packed `.txt`.
  - **Full check:** all passed (exit code 0), 0 drift; the browser test now takes about 56 s.
  - **How the owner shares a save (tap by tap):** in the game, ☰ Menu → Saves → **Share to GitHub** (until v0.11.10: the Saves tab) → GitHub opens (sign in if asked) → if the file box is empty, tap it and paste (long press → Paste) → scroll down → **Commit changes…** → **Commit changes**. The file lands in `saves/`; tell Claude its name, and the next check plays it.
- **The pivot: copy what is useful from Selene and Rules Engine C (owner 15:33 "analyze the entirety, every aspect of the Selene and the Rules Engine ST project, for anything at all you can use to make any part of this project better. that includes both the game and the process too"; 15:43 "the pivot is this the analysis and copying of features. safety push, then proceed with all except the lore differences."; 15:47 "a, skip the whole lore list, note it in the roadmap. go for the rest."; built so far: v0.11.5):**
  - **The analysis** (two read-only reviews of `hufle-beep/Long-patience` and `hufle-beep/Shared-ST`, checked against the code): the full list and the order of pushes are in `project/roadmap.md` ("The copy-over"). Each push still gets its confirm; balance pushes show their numbers first.
  - **Found and confirmed in Bone and Ash:** `sw.js` FILES missed `js/core/forms.js` (since v0.10.4; it worked offline only because the first online load cached it); nothing saved when the app was hidden, and a running card restarted from 0 after a reopen (a 28 h breakthrough or a Long Forest season); the bar width is set 10 times a second (a reflow each time; the UI push). `js/core/formulas.js` is identical to the engine's current file (0.1.223; 0.1.220–0.1.223 changed other engine files only); the engine's own `formulas.test.mjs` passes 126 / 126 on our copy.
  - **Skipped (owner pick a, 15:47): the whole engine-canon / lore list**, kept as forks: a breakthrough refills HP and Qi (the engine doesn't); Yuki starts at F0 A0 (canon root-kin F120 A5); `bumpRel` steps above the engine's +3 F / +2 A per beat (63 of 254 calls); healing every fight round from Immortal Ascension (the engine: after 2 turns without damage); Story Mode's meridian sessions check and pay XP (the engine: no check, 0 XP); Yuki's eyes "gold" in `yuki_path.js` (spec: yellow). Doc drift to fix when those docs are next touched: design.md's rule K says "first try −2" (the code: +0.5 a setback, up to +2); "dampening on every Qi cost" (canon and the code: techniques only).
  - **Lessons taken over** (from both projects' docs): a named fallback branch before a redesign; migrations only fill missing fields, never "restore" values; old handover notes move to history word for word; new checks run log-only first; one balance knob per push; automation (auto-eat, threads) never runs ahead of queued work the Coil can afford (Selene's rule D2); a renamed DOM marker once stuck every Selene player at the first death (hence the browser test).


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
| `js/main.js` | The UI. Autosave key `boneash.auto`, slots `boneash.slot1–3`, backups `boneash.bak.*`, the export reminder `boneash.exp` (v0.11.9); save-file export/import, Export all / Restore all, Share to GitHub, Copy status as text. |
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
| `saves/` | Test saves (`.json`, or `.txt` packed by Share to GitHub, v0.11.9). Six made from v0.8.5 (Day 1, Day 4, Day 7 tribute, Act 1 start, Act 1 end, Long Forest start) and four from v0.11.7 (`tools/snap.mjs`: prologue Coil 2, Act 1 Coils 1 and 2, the Long Forest on Coil 2); the owner's exports go here too. |
| `tools/check.sh` | Runs every check (syntax, engine, saves, the four Act 1 parts, the tasks and story bots) in about 85 s on 2 cores (with the browser test since v0.11.7); `quick` = 200 bot games each (about 15 s, not enough for a push); stops at the first failure. |
| `tests/lib/shard.mjs` | The bot games split across worker processes (v0.11.1): `--games`, `--workers`, `--seed`; a seed per game (`seedOf`), so any number of workers gives the same numbers. |
| `tools/sanity.mjs`, `tools/baseline.json` | The mechanics sanity check (v0.11.3, hard rule 2): invariants and drift (±5 points, n ≥ 100) against the saved baseline; the last step of the full check; `--update` only after the owner's go. |
| `tools/consistency.mjs`, `tests/engine.test.mjs` | v0.11.5: the offline file list and the version in every doc (in `check.sh`); the engine's own formula tests on our copy. |
| `tests/data.test.mjs`, `tools/lint.mjs`, `tools/browser.py`, `tools/snap.mjs` | v0.11.7: data integrity (in the check); the content lint (log only); the browser test (full check only); fresh test saves (`node tools/snap.mjs`, by hand, for each new save format). |
| `tools/bots.mjs` | Balance numbers only (v0.11.1): the tasks test's bots, summary per Coil with the beast share of deaths; `--games`, `--seed`, `--sensible`, `--workers`. |
| `.github/workflows/restore-points.yml` | Tags the newest 5 commits on every push (`restore/<date>-<commit>`), copied from Selene. |

**Run every check:**
```
bash tools/check.sh          # full, after every build and before the docs and the push (ends with the sanity check)
bash tools/check.sh quick    # while building
node tools/bots.mjs --games 1000 --sensible   # balance numbers only
node tools/sanity.mjs --update                # new baseline, only after the owner's go on an intended change
```
**Browser check:** Playwright is preinstalled in the cloud session; `python3 tools/browser.py` (part of the full check since v0.11.7) taps through both modes at 390×844.

**Workspace gotchas** (v0.11.7; some from Selene's handover):
- **Read the full check's exit code before anything else; never chain a commit or push after it** (v0.11.7 went out after a failed check that way).
- Bump `VERSION` in `sw.js` together with the docs, after the full check: `tools/consistency.mjs` fails while they differ.
- The `origin` remote can reset to the old `James-rpg-test` URL (see the end of this file). The clone is shallow: `git fetch origin main` before a push.
- Tags can't be pushed from the cloud workspace; the restore tags come from the workflow. Use `gh api` (REST) rather than GraphQL.
- Browser tests: block service workers (a stale cache hides changes), cap bar waits, retry a tap whose button re-rendered. Set storage from a non-game page on the same site, then open the game (`fresh` in `tools/browser.py`): a reload fires the game's own save on close (v0.11.5), which used to write the old game over a fresh `localStorage` write (Selene saw the same).
- A GitHub Pages deploy can stick "in progress"; a new commit republishes. Check a build once (or with a short bounded wait), never block on it.
- Foreground `sleep` can be blocked; poll with short waits.

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

## Version notes (the last three versions; older ones in `history-3.md`, `history-2.md` and `history.md`)

## v0.11.11 — sliding bars, the hold tooltip, accessibility, scroll per tab

- **main.js:** `setBar` (scaleX, `data-v`, the track's `aria-valuenow`), `tickBar` (`<i class="tick">`), `pbar` (status bars as progressbars); the clock written only on change. `announce` (`#announce`, polite), `announcedScene` (render announces a new scene or a fight), `addResult` announces the summary. `tipFor`, `#tip` (✕ `data-tip`), `HOLD_MS` 500, `holdTimer` / `swallowUntil` / `swallowBtn` (a capture-phase click guard), `contextmenu` blocked on cards. `scrollPos` per tab in `setTab` (Story only on the same scene); `openResults` + `data-rid` + a `toggle` listener; results get an `id`. `smoothScroll()` honours reduce motion. The queue's first row gets `running` / `aria-current="step"` while it runs. The result panel lost `role="status"` (the announcer speaks).
- **index.html:** `#view` without `aria-live`. **css:** `.stroke i.tick`, `#tip`, `.sr-only`, `.queue li.running`, no touch callout or selection on cards.
- **tools/browser.py:** the reload part reads `#nowbar`'s `data-v`; part 7 `comfort()`.

## v0.11.10 — the cache fix, hidden checks, the main menu

- **sw.js:** install caches `new Request(f, { cache: 'reload' })`; game files `fetch(req, { cache: 'no-cache' })` (navigations by URL).
- **main.js:** `SHOW_CHECKS_KEY` / `showChecks`, `TEXT_SIZE_KEY` / `TEXT_SIZES` / `applyTextSize`; `CHK` (skill value with `/ DC`, `+ 🎲n = t vs`, `+ d6 vs DC`), `hideCheck` (defence, action, bare-line and tag rules), `shownLines`, `hideTag`, used by every card tag, the result panel, the Results pane, the journal and both fight logs; card band classes only with Show checks. `menu` ('main' | 'saves' | 'settings' | null, 'main' on load), `hadSave`, `renderMenu`, `renderSettings`, `openMenu` (pauses with cause 'menu', autosaves), `render` toggles `body.menu-on` and draws the menu first; `setTab('menu')` opens it; `data-menu` (continue, recovery, main, saves, settings), `data-textsize`, `data-showchecks`; New game asks twice from the menu; `renderSaves` lost the mode and Start over sections (now Settings and the menu).
- **index.html:** the last tab is `data-tab="menu"` (☰ Menu). **css:** `body.menu-on #tabs` hidden; `.main-menu`, `.mseal`, `.mtitle`, `.mbtns`, `.btn.big`.
- **tools/browser.py:** `enter()` after every open, `CHECKS` (strict on game screens), `open_saves`, part 6 `main_menu`.

## v0.11.9 — saves: share to GitHub, Export all / Restore all, the export reminder, Backups, Copy status

- **main.js:** `packText` / `unpackText` (`BAZ1:`, `CompressionStream` gzip); `shareToGitHub` (`GH_REPO` `hufle-beep/bone-and-ash`, `GH_DIR` `saves`, `GH_URL_MAX` 7500, `ghFileName`, `openOut`); `allSaves`, `exportAll`, `readAll`, `restoreAll`, `pendingAll`; `EXP_KEY` `boneash.exp`, `expMark` (on every download, share and export all), `expRemind` (after each autosave); `#notebar` (`showNotice`, "Download now" / ✕); `gameVersion`, `statusText`; `pauseLog` / `plog(cause)` (`pauseNow`, `endOneShot` take a cause; `plog('not logged')` at the top of `tick` and `render`); `fallbackCopy` reports a failure; Saves tab: Backups (`data-bak`), Share / Copy status (`data-share`, `data-status`), Export all / Restore all (`data-exportall`, `data-restoreall`), the reminder switch (`data-expremind`). No new game state; same save state as 0.11.5.
- **css/style.css:** `#notebar` (like the error bar, ink border).
- **tests/saves.test.mjs:** `saves/*.txt` too, unpacked; a packed round trip. **tools/browser.py:** part 5 `saves()`; clipboard permissions on the context.

## Next steps

See `project/roadmap.md`.

**Session quirk:** in the cloud clone the `origin` remote sometimes resets to the old `James-rpg-test` URL. Before pushing: `git remote set-url origin https://github.com/hufle-beep/bone-and-ash`.
