# Bone and Ash — history, part 11

Started 2026-11-09 (v0.11.86), when `history-10.md` passed 45 KB. Newer than `history-10.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.96 (word for word)

### From "Decided in chat"

- **v0.11.93: docs only, every option laid out everywhere (owner 11:08: "strengthen the rule to lay out all sub options again, since the T-a and b were missed. Also log the two small timing options as the next items. once all that is done, give me the hardened hard rule to paste in the project instructions and update claude.md, then update the docs and send me the handover for a new chat"; Claude's options 11:08; owner 11:09 "A go"):**
  - **The sub-items:** **W1** rule 1's "every option, everywhere" (any option or sub-option in any message gets the full layout; nothing offered in passing; not analysed = "open, options later", never put up for a pick); **W2** a check before sending; **L** the after-bed fights' timing as the next item (section 0 and NEXT; out of section 2's v0.11.92 line).
  - **The options:** **A 🟢 W1 + W2 + L (recommended)** / B 🟡 W1 + L / C 🟠 W1 (colours: how well each stops a skipped layout). **Picked: A.** Not picked: B, C.
  - **Also:** `3bbaf73` filled in for 0.11.92; after v0.11.92 Claude uploaded 8 docs; v0.11.90's notes to `history-11.md`; the hardened rule 1 given in chat for the project's Instructions; a handover message for a new chat.

### From "Open items" (the NEXT item's list, as of v0.11.95)

- (1) #53 done in v0.11.86; (2) **the sitting loop: done in v0.11.87** (O1; what is left, the levers not picked with their numbers: the roadmap's section 2, v0.11.87 line); (3) **the roadmap trim-and-split: done in v0.11.88** (A); (4) **the four small items: done in v0.11.89** (P1); (5) **the v0.11.87 review's first finding (the Day 19 heal): done in v0.11.90** (R1); (6) **B push 1, the night (Push through the night and Exhaustion gone, the day ends at 00:00, beds from 21:00): done in v0.11.91** (decisions below; the review's second finding gone with it). (7) **B push 2, N1 (a night fight costs sleep): done in v0.11.92** (O1 + X1 + K1). (8) **the after-bed fights' timing: done in v0.11.94** (T-b1). (9) **Group d's first item, the blade's lead: done in v0.11.95** (Q1 + P2).

### From "Open items" (the art, as of v0.11.95)

- **The art (the owner's PC with Comfy Desktop):** Y3 (the prologue's great-cat and human pictures) done in v0.11.49–v0.11.51; **the Act 1 art** (owner picks 2026-11-08 00:59 A1 + F1 + Y1 + T1, style p / n, cast `james_shaggy`): pushes 1–3 and 4a / 4b done in v0.11.54–v0.11.61 (every picture that draws Yuki exists in all three forms). **The second round of small fixes** (owner picks 2026-11-08 08:15 P1 + A1 + B1 + M1: two pushes): **push 5a done in v0.11.62** (15 pictures), **push 5b done in v0.11.63** (17 size redraws; decisions below). **The rest of this round's art is tabled for the later art pass after the story and mechanics pass (owner 10:40 "Table it all for the next art pass after the story/mechanics pass and put it on the roadmap. let's move on from art"):** push 5c (glass windows and modern objects, the sweep's list in the roadmap), the cold review's findings of 5b, the four kept-old size redraws, the ridge redraw, the code art and `clamp2.js` close-ups (kept in git as placeholders for the later acts, owner 08:19); the full list is in the roadmap's later art pass. M1: the story-text mismatches (hawks like eagles, the envoy's umbrella, root_camp's place, the seclusion waterfall, ship_log's Wren, the night scenes on a daytime grove, James greyer in a few) and the low cosmetic items wait for the later art pass, with 5a's left-overs (decisions below). **Art pushes: the owner picks from full sheets** of every valid, fixed seed (owner 02:41; `CLAUDE.md` rule 7). The James / Yuki uniformization and one CLAMP / Monogatari style for every picture: the later art pass after the story and mechanics pass (owner 02:13; roadmap). The seed-ships: original grown-wood starships, never another work's design (owner 02:26–02:27). Later: Z3, Z4. **Files on the owner's PC:** every push's job lists and pictures in `tools/art/README.md`; push 5a's and 5b's files: moved word for word to `history-11.md` in v0.11.86.

### From "Version notes"

## v0.11.93 — docs only: every option laid out everywhere (A)

- **Files:** `CLAUDE.md` (rule 1: W1 + W2), `project/working-agreement.md` (the same, with the owner's words), the roadmap (section 0's next item, moved word for word from section 2), `tests/tools.test.mjs` (both rules checked), `sw.js`, `tests/README.md`, docs (v0.11.90 to `history-11.md`). The game identical to 0.11.92; saves unchanged.
- **Checks:** docs and a test only (rule 2): `node tests/tools.test.mjs`, `node tools/consistency.mjs`, `bash tools/check.sh quick`. No game file, save or bot code changed, so the game and the bot numbers can't move; what could break: nothing beyond the two rule tests.

## Moved from the handover in v0.11.95 (word for word)

### From "Decided in chat"

- **v0.11.92: a night fight costs sleep (B push 2, N1; Claude's options 10:05; owner 10:16 "Q1" (Claude asked: O1?), 10:17 "O1 go"):**
  - **The sub-items (lab: the models 300 games each, the random bots a full run, against v0.11.91):** the day's regen heals James before his next fight (98–100% HP), so the cost is a morning rest, and Gao after the jackals. **W** a won night fight: W0 full / W1 half the wound back (jackals 53 → 76%, rats 34 → 69%, the Blackroot 78–85 → 91–96%; 12.5 HP points) / W2 a floor at 80% (13) / W3 waking regen (≈2). **Q** Qi too (21 points more). **F** a flight the same (1–2% of the random bots' night fights). **T** the result lines, the FAQ. The models' Coils unchanged but Careful's Gao (100 → 87.5%).
  - **The options:** **O1 🟢 W1 + Q + F + T** / O2 🟡 W1 + F + T (recommended) / O3 🟡 W2 + F + T / O4 🔴 W3 + T (colours: what a won night fight costs at dawn). **Picked: O1.** Not picked: O2, O3, O4.
  - **The owner's question (10:16, how many Coils the bots play):** the models to Coil 8, the random bots count an act to Coil 6; numbers per Coil; early deaths intended, kept.
  - **Found while building (stopped and asked, 10:40):** Fable's review: two more fights after bed gave a full night (Ashfall's arson, 1,159 in 1,200 model games, HP 74% after a win; the fallout's barley wolves, 193, 90%). **X1 🟢** mark them too (dawn 88% / 96%; the models' Coils unchanged; the random bots 0 drifted, 19 past 5) / X2 🟠 narrow the FAQ. **Owner 10:44: "X1 go"**; with the review's lows. The full check then stopped at "bots rewind Act 1" (4 < 5): **owner 10:51: K1** (a walk to Shen Qiu on purpose; not picked K2, K3). **Open (rule 6):** the two fights still come at bedtime (19:00–01:00), not 01:00; T-a / T-b weren't laid out (owner 10:44): proper options after this push.
  - **As built:** see the version note.
  - **Also:** `78b4d31` filled in for 0.11.91; after v0.11.91 Claude uploaded 8 docs; v0.11.89's notes to `history-11.md`.

### From "Version notes"

## v0.11.92 — a night fight costs sleep (O1 + X1; K1)

- **Files:** `game.js` (`NIGHT_FIGHT_HEAL`, `shortNight`, `nightRest`; the mark set in `startCombat` / `instantWin`, cleared by `sleepUntil`); `night: true` in `prologue.js` (`jackals_fled`: `'run'`), `wilds.js`, `act1_blackroot.js`, `ashfall.js`, `act1_fallout.js` (via `encounter`); their mornings call `nightRest`; `faq.js`; tests: tasks (+ K1's walk), faq. Saves: a new world flag.
- **Checks:** full `bash tools/check.sh`, four runs: 1 a browser part 2 flake (passes alone), 2 exit 0 (O1), 3 stopped at "bots rewind Act 1" (4 < 5; K1), 4 exit 0: 0 drifted of 139, 18 past 5 (log only; the tribute C2 lost 73.1 → 92.9%, n 56, near the ±20 line; Gao smart 82.2 → 72.7%, Ya's spar random 74.6 → 64.8%); the baseline unchanged. The models: Careful 3.58 / 6.65, Completionist 4.00 / 5.85, the Sitter 2.65 / 2.66, the Farmer 4.05 / 5.84 (unchanged). **Fable, two cold reviews:** no high. Fixed: the arson and wolves gap (X1), the line's numbers, "after the run", a NaN guard, comments. Open (the owner's call): a lost arson fight (a people fight, so reachable; the bots never lose it) now wakes at ~50% HP (was full); K1's walk alone satisfies the check (a bot-only floor of 1 would bring chance back); the rest from the fight to 21:00 isn't counted; the X1 tests cover wins only.

## Moved from the handover in v0.11.94 (word for word)

### From "Decided in chat"

- **v0.11.91: the night is for sleeping (owner 08:55: "let's remove the push through the night options. overall. day ends at 02:00. however, the issue of the night encounters would still stand, since those do not impose any penalty right now. so let's move the days end to 0:00, and change the night encounters timing so they end at 02:00 the latest and the hcaracter could sleep from midnight to morning. so the exhaustion penalty as a whole goes. have a check for the exhaustion penalty overall the game in the story section, since a lot of the cards will be changed there anyway."; Claude's options at 09:00; owner 09:05 "Proposal B is a go"):**
  - **The sub-items (lab runs: the models 300 games each, the random bots 1,000, against the baseline):** **P** Push through the night and Exhaustion removed: the models never push (unchanged), the random bots 0 of 139 numbers moved past 5. **D** the day ends at 00:00: Careful 3.47 / 6.73 → 3.65 / 6.71 (prologue Coil 1 death 27.7 → 41.3%), Completionist 3.94 / 5.87 → 3.94 / 5.89, the Sitter 2.74 / 2.77 → 2.78 / 2.81; the random bots 0 drifted, 8 moved past 5 (the tribute C2 won 25.6 → 10.6%). **N** the night encounters: N0 a won night fight still a full night / N1 a night fight costs sleep (numbers first, its own push). **T** the help texts. **R** the roadmap's group e line (the story pass checks the exhaustion and night timing everywhere).
  - **The options:** **B 🟢 P + D + N1 + T + R** in two pushes / **A 🟡 P + D + N0 + T + R (recommended)** / C 🟠 P + T + R (colours: how much of the night problem each closes). **Picked: B** (push 1: P + D + T + R; push 2: N1, numbers first).
  - **Found while building (stopped and asked, 09:12):** an early bed put the night encounter at bedtime (the prologue's camps before 21:00, the Blackroot's before 19:00; the models 0 of 9,048 nights). Options E1 (an early bed waits for 01:00) / E2 (as today). **Owner 09:16:** "move the cutoff to 21:00 in all hubs. dinner and night scenes (not the after sleep fights) can still happen after that so long as the timing is still reasonable." Claude's reading and numbers (09:19): no bed before 21:00 anywhere (an earlier bed spends the evening resting until 21:00), dinner and night scenes untouched, every night encounter at 01:00 (01:20 the jackals) and over by 02:00; Careful 3.54 / 6.69 (Coil 1 death 29.3%), Completionist 3.96 / 5.83, the Sitter 2.61 / 2.63; the random bots 0 drifted, 12 past 5. **Owner 09:21: "go".**
  - **The full check's stops (details in the version note):** the coverage of `rt_hunters:1` and Fable's medium (the 21:00 wait in the seclusion's sleep): **owner 09:32: K1 + S1**; the story test's `yk_lover`: **owner 09:38: Y1**. Not picked: A, C, E1, E2, K2, S2, Y2.
  - **As built:** see the version note.
  - **Also:** `af82d29` filled in for 0.11.90; after v0.11.90 Claude uploaded 6 docs (handover, roadmap, roadmap-done-2, changelog, restore-points, history-11); v0.11.88's notes to `history-11.md`.

### From "Version notes"

## v0.11.91 — the night is for sleeping: no Push, no Exhaustion, the day ends at 00:00, beds from 21:00 (B push 1)

- **Files:** `js/core/game.js` (`EX_MULT`, `exLevel`, `exMult`, `exMins`, `pushNight`, `pushWindow`, `pushedTonight` and the work multiplier out; `wakeState` drops an old `wake.ex` / `wake.push`; `DAY_END_HOUR` 0; `BED_FROM_HOUR`, `eveningTo`, `nightTo`; `sleepUntil(g, h, { bed })`), `js/core/meditate.js` (no Push card; nothing at night; `LATE_TAG` "ends past midnight"), `js/core/tasks.js`, `js/main.js` (no Exhausted badge or status line; the late card's line), `js/core/faq.js` (the night entry, the Meditate entry), `css/style.css`, `js/core/replies.js` (a comment), `js/story/wilds.js`, `prologue.js`, `act1_blackroot.js` (`nightTo`), `longforest.js` (S1); tests: tasks (v0.11.91: no Push, the night lock at 00:00, the bed rule, every night encounter at 01:00 and over by 02:00, K1's daytime Ashfall visit; the older blocks moved to 00:00), faq, story (Y1), `tools/browser.py` (the late tag, the FAQ search); `sw.js`, `tests/README.md`, timings; docs (`design.md`, `reference.md`; v0.11.88 to `history-11.md`). Saves: an old save's `wake.ex` / `wake.push` are dropped when read; no id changed.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`, three runs: 1 stopped at the coverage (`rt_hunters:1`; K1), 2 at the story test (`yk_lover`; Y1), 3 exit 0, 0 drifted of 139, 13 past 5 (log only): the tribute C2 won 25.6 → 9.3%, lost 73.1 → 88.9%; C3 won 28.1 → 21.1%, lost 60.6 → 73.7%; C4 lost 53.5 → 62.3%; C5 won 33.7 → 27.7%; C6 paid 23.9 → 33.7%; the random bots' sect watcher 85.3 → 77.5%, mire 69.8 → 75.3%, wolves 83.9 → 75%, the story test's storm hawks 34.4 → 42%; the baseline unchanged. The models: Careful 3.58 / 6.65 (was 3.51 / 6.71), Completionist 4.00 / 5.85 (3.96 / 5.88), the Sitter 2.66 / 2.68 (2.78 / 2.80; whole game on Coil 1 14%), the Farmer 4.05 / 5.84; Careful with Yuki's lane off: prologue Coil 1 death 54.7 → 74%. **Cold review on Fable:** no soft-lock (every hub keeps a story exit at 00:30 and 02:30), no clock back, no double hunger, dry runs match; medium: the seclusion's Fed (from 60 at 06:00: 24.0 → 1.5; S1, fixed); low (fixed): stale comments, a dead test flag, a trivially true test.

## Moved from the handover in v0.11.93 (word for word)

### From "Decided in chat"

- **v0.11.90: the Day 19 heal in the Heart (the v0.11.87 Fable review's first finding; owner 08:35 "let's look at the healing on day 19"; Claude's options at 08:40, owner 08:42 "R1."):**
  - **The sub-items (measured, lab runs on the models, 400 Completionist games):** when: all 146 guardian fights on Day 16–17, every one at full HP and won; Careful never fights it, so the models never meet the case (a human does: the root-galleries on Day 19, then the guardian hurt). What a hurt James has from Day 19, 06:00–16:00: "Meditate: gather Qi" only while Qi isn't full; with full Qi nothing passes time but eating. How much HP matters (the same 146 states re-fought): won 100% at full, 75, 50, 35 and 25% HP; 75% at 15%; a loss is not the Coil (carried out at 3 HP or more; round the guardian on Day 19 for 40% HP and 10 Qi, or camp at 16:00 and fight on Day 20 at full). An hour's rest: 25% → full for a median James (11 → 44 of 44).
  - **The options:** **R1 🟢 Rest stays while hurt (recommended)** / R2 🟡 "Meditate: gather Qi" also open when Qi is full and James is hurt (every resting place; the models would move, numbers first) / R0 🔴 keep (colours: how much of the gap each closes).
  - **Picked:** **R1.** Not picked: R2, R0.
  - **As built:** see the version note.
  - **Also:** `926569b` filled in for 0.11.89; after v0.11.89 Claude uploaded 6 docs (handover, roadmap, roadmap-done-2, changelog, restore-points, history-11); the owner pasted the new `CLAUDE.md` into the project's Instructions (08:35); v0.11.87's notes to `history-11.md`; the "Open items" heading's version corrected.

### From "Version notes"

## v0.11.90 — a hurt James can rest in the Heart from Day 19 (R1)

- **Files:** `js/story/act1_heart.js` ("Rest an hour.": `active(g) && (!late(g) || hp < max)`; the choice's index unchanged), tests: tasks (the v0.11.90 block: Days 19–21 Rest while hurt, none at full HP; the sit, Meditate's Cultivate and Cultivate until the limit shut while hurt; a 3-of-21 HP James rests 5 hours to full, then Rest is gone; after 18:00 the camp; Day 18 as before); `sw.js`, `tests/README.md`, timings, docs (v0.11.87 to `history-11.md`). Saves unchanged, no id or index changed.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`: exit 0, 0 drifted of 139, 0 past 5; the models unchanged to the digit (Careful 3.51 / 6.71, Completionist 3.96 / 5.88, the Sitter 2.78 / 2.80, the Farmer 3.94 / 5.82); then the test's minute check tightened (an hour a rest exactly) and `bash tools/check.sh quick`. **Cold review on Fable:** the scope exact; Rest can't run the clock: with food it heals to full in 5 rests at most, at Fed 0 HP falls until James collapses; reopening Rest reopens no sit (`hubShut` keys off Cultivate); index 14 kept. Medium: the models' Rest below 60% HP could move their numbers (they didn't: unchanged). Low, older, not fixed (the owner's call, roadmap section 2, v0.11.90 line): gather Qi and meridian cards still pass the clock hour by hour from Day 19; at Fed 0 Rest stays until a collapse.

## Moved from the handover in v0.11.92 (word for word)

### From "Decided in chat"

- **v0.11.89: the four small items (Claude's options 2026-11-09 07:22–08:14, restated at 08:20 in the options layout; owner 08:23 "P1"):**
  - **The sub-items:** **F**, "Fists only." three times at Bao's brawl (the button, `stomp_act1.js` `rt_brawl`'s intro, `act1_return.js`'s round-1 opening): F1 drop it from the round-1 opening only (a deletion, no new words) / F0 keep. **T**, the spar's "terms agreed in the lane" intro on the forced path (`ya_forced`, after a failed talk and the slap; its only choice "Fine."): T3 the choice becomes `Fine. "Your spear against my blade. No armour. Nobody dies."` (the other path's exact words, Fable's) / T1 the forced path's intro skips the terms sentence / T0 keep. **X**, a won brawl's XP (`awardXp(g, 'GU')`: the pool on GU's tier, all to GU; 3–4× a small fight's GU; Act 1 end, CU T2 GU T3 Coil 5: small fight CU 36 GU 36 Yuki bond 36, brawl GU 108 Yuki 54; T1 / T2 Coil 3: 13 vs 54; met in about 2 of 300 games): X2 🟢 the normal pool and split without the CU half (GU 36, Yuki 36) / X3 🟡 the GU-tier pool, GU half (GU 54, Yuki 54) / X1 🟠 the pool on CU's tier like every fight, all to GU (GU 72, Yuki 36; the same total as any small fight) / X0 🔴 keep (colours: how far each cuts the brawl's lead over a small fight). **J**, the Journal's "checks rolled" (`main.js` `renderJournal`, Show checks on): J1 "checks made" / J0 keep.
  - **The options:** **P1 F1 + T3 + X1 + J1 (recommended)** / P2 F1 + T3 + X2 + J1 / P3 F1 + T3 + J1 (X0, text only).
  - **Picked:** **P1.** Not picked: P2, P3, F0, T1, T0, X2, X3, X0, J0.
  - **As built:** see the version note.
  - **Also:** `52275c2` filled in for 0.11.88; after v0.11.88 Claude uploaded 9 docs (handover, roadmap, roadmap-2, roadmap-done-2, roadmap-done, changelog, restore-points, working-agreement, history-11); v0.11.86's notes to `history-11.md`. The owner's to-do: paste the new `CLAUDE.md` into the claude.ai project's Instructions field (rule 1 changed in v0.11.87).

### From "Version notes"

## v0.11.89 — the four small items (P1: F1 + T3 + X1 + J1)

- **Files:** `js/story/act1_return.js` (the brawl's round-1 `opening` without "Fists only."), `js/story/act1_fallout.js` (`ya_forced`'s choice text), `js/core/game.js` (`awardFightXp`; `awardXp`'s `poolTier` option; both award paths, `instantWin` and the combat win), `js/main.js` ("checks made"); tests: tasks (the v0.11.89 block; the v0.11.82 block's opening line); `sw.js`, `tests/README.md`, timings, docs (v0.11.86 to `history-11.md`). Saves unchanged, no id changed. Only Bao's brawl has `style: 'unarmed'`; the spar and every other fight pay as before.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`: exit 0, 0 drifted of 139, 0 past 5; the models unchanged (Careful 3.51 / 6.71, Completionist 3.96 / 5.88, the Sitter 2.78 / 2.80, the Farmer 3.94 / 5.82); the four browser parts pass. **Cold review on Fable:** nothing high or medium; X1 right on both paths (mutation runs: each path's revert fails a test); no tool copies the formula; a missing CU falls back to GU's tier (the old pay). Low, not fixed (cosmetic, self-clearing): a save made inside the brawl before round 1 still shows the old opening once (`g.combat.opening` is saved).

## Moved from the handover in v0.11.91 (word for word)

### From "Decided in chat"

- **v0.11.88: docs only, the roadmap trimmed and split (owner 02:21 "procceed"; Claude's options with the sub-items T1 the trim (8.8 KB of done and stale lines), D1 into `roadmap-done.md` / D2 into a new `roadmap-done-2.md`, S1 a split at section 3 / S2 group e alone, X the tooling; A 🟢 T1 + D2 + S1 + X (recommended), B 🟡 S1 + X, C 🟠 S2 + X, D 🔴 T1 + D2; owner 02:37 "go with your recommendation"):**
  - **Picked:** **A.** Moved word for word to `roadmap-done-2.md`: the old "Last updated" line, the two layout paragraphs, section 0's done notes, the "Suggested order" paragraph, groups b, c, g, h and i (all done), group d's owner's calls of 21:12 and the unarmed-fights line (done in v0.11.81–v0.11.82), section 2's v0.11.67 note (superseded); a label where each stood, a new **Order** label in section 1. Sections 3–6 and Decided moved word for word to `roadmap-2.md`. Not picked: B, C, D, D1, S2.
  - **As built:** see the version note.
  - **Also:** `d639bd5` filled in for 0.11.87; after v0.11.87 Claude uploaded 8 docs (handover, roadmap, roadmap-done, changelog, restore-points, working-agreement, history-11, `claude/CLAUDE.md`); v0.11.85's notes to `history-11.md`.

### From "Version notes"

## v0.11.88 — docs only: the roadmap trimmed and split (A)

- **Files:** `project/roadmap.md` (62.1 → 37.2 KB), `project/roadmap-2.md` (new, 17.7 KB), `project/roadmap-done-2.md` (new, 10.3 KB), `project/roadmap-done.md` (a pointer, closed), `project/working-agreement.md` (the docs list), `tests/tools.test.mjs` (the split's test; the group i and flight tests read both open parts), `sw.js`, `tests/README.md`, docs (v0.11.85 to `history-11.md`). The game identical to 0.11.87; saves unchanged.
- **Checks:** docs and a test only (rule 2): the reassembly check (the 133 non-blank lines of the old `roadmap.md` each found in the three files as often as before, 0 missing; 20 new lines, all labels, headers and the new "Last updated"), `node tests/tools.test.mjs`, `node tools/consistency.mjs` and `bash tools/check.sh quick`. How it interacts: no game file, save or bot code changed, so the game and the bot numbers can't move. What can break: a test or tool that reads `roadmap.md` alone would miss sections 3–6 (the two that did now read both parts).

## Moved from the handover in v0.11.90 (word for word)

### From "Decided in chat"

- **v0.11.87: the sitting loop (Claude's options before 01:52, with the lab's numbers: H the Heart's Day 19 rule in every option; O1 H only / O2 H + a realm ceiling per act (prologue 3, Act 1 5; O2b prologue 2) / O3 H + Saturation ×2 a realm / O4 H + the sit's speed capped ×3 / O5 H + 10 × (1 + realm) Qi a sit; Claude recommended O2. Owner 01:52: "O1. but to the hard rules and process, add that the analyzed sub items of the recommendation and option have to be added. until 2 chats ago, they were displayed... maybe ene color code the proposals in order of effectiveness. also put "(recommended)" in the report to your recommendations. as an exception for this case and to avoid rerunning the whole check, you can skip the rerun now, but the normal rest suite after building still applies."):**
  - **Picked:** **O1.** From Day 19 (`late`) `heart_hub` hides "Cultivate: one sit" and "Rest an hour" (so Meditate's Cultivate, Cultivate until the limit and the task screen's sit close with it, `hubShut`); the way forward, the night camp and the rest unchanged; no text changed, no index moved. **The options rule** (the owner's words): `CLAUDE.md` rule 1 and `working-agreement.md`. Not picked: O2, O2b, O3, O4, O5 (their numbers: the roadmap's section 2, v0.11.87 line). "Skip the rerun": the options were not rerun with the new layout; the full check ran as usual.
  - **The numbers shown before the pick** (lab, 100 games; the Sitter's Act 1 end: realm, CU tier, sits, mean Coils): today 14, T10, 4,400, 2.74 / 2.77; O1 9.4, T5.0, 1,020, 2.74 / 2.77; Completionist and Careful unchanged in all (realm 1). The Cycle capped at T3: no change.
  - **As built:** see the version note.
  - **Also:** `1f91390` filled in for 0.11.86; after v0.11.86 Claude uploaded 7 docs; v0.11.84's notes and the old roadmap and NEXT items to `history-11.md`.

### From "Version notes"

## v0.11.87 — the sitting loop: no sit or rest in the Heart from Day 19 (O1); the options rule

- **Files:** `js/story/act1_heart.js` (two `show` conditions, `!late(g)`), tests: tasks (the v0.11.87 block: Day 18 offers both, Days 19 and 21 offer neither through the hub, Meditate, the task screen or Cultivate until the limit; the way forward and the night camp stay), tools (the Sitter's card count compared per game, ×2: O1 cut its sits); `CLAUDE.md`, `project/working-agreement.md` (the options rule); `sw.js`, `tests/README.md`, timings, docs. Saves unchanged, no id or index changed.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`, two runs: 1 stopped at the tools test ("the Sitter runs far more cards than Careful": 2,452 vs 1,200 over 2 vs 3 games, ×3.1 a game; reported to the owner at once, updated as above); 2 exit 0, 0 drifted of 139, 0 past 5; the models' Coils unchanged (Careful 3.51 / 6.71, Completionist 3.96 / 5.88, the Sitter 2.78 / 2.80, the Farmer 3.94 / 5.82). **Cold review on Fable:** the sit shut on every path from Day 19; no soft-lock; saves safe; the tests fail without the fix. Not fixed (the owner's call; details in the roadmap's section 2, v0.11.87 line): medium, no Day 19 heal before the guardian without Rest; medium, older, Push through the night reopens the day-gated sits on a hub's last day (unbounded for a human); low, `runMed('med:sit')` unguarded.

## Moved from the handover in v0.11.89 (word for word)

### From "Decided in chat"

- **v0.11.86: a Coil ended by choice adds no Coil bonus (#53; Claude's options at 00:58 with the lab's numbers: K0 no change / K1 a bite on the act's first day adds nothing / K2 the same up to the third day / K3 the roadmap's (a)–(e); M1 a Farmer model / M2 none. Owner 01:06: "That isn't what I even thought the problem would be... ok. No manual tail biting. Or if you do, you get reset to the last starting point, either to the Start of the prologue or Act I. Without a bonus. The other ways, such as dying or losing still work normally. Also the part with the collectors resets normally with bonus." Claude's three questions at 01:08: C1 a chosen restart counts as a Coil / C2 it is free; G1 Go round again at Act 1's end also no bonus / G2 it keeps the bonus; W1 a manual bite in Act 1 restarts Act 1 only / W2 both starts; owner 01:09 "Go with your picks"):**
  - **Picked:** **C1 + G1 + W1** (the build's scope as offered, with M1). A Coil ended by choice (the James tab's Bite the tail; Go round again at Act 1's end) counts as a Coil (the targets, the ★) but adds nothing to the bonus: `coil.free` counts them, `coilMult` = 1 + 0.25 × (earlier Coils − chosen ones). A collapse, a beast, a lost tribute and Shen Qiu add as before. In Act 1 the James tab's bite restarts Act 1 only; the whole game stays offered after a loss and at Act 1's end. Texts (help text, Claude's): the James tab, the bite warning, the Coil screen's "Next Coil", Go round again's labels, the FAQ. The **Farmer** model (log only; 100 / 20 games). Not picked: K0–K3, C2, G2, W2, M2.
  - **The numbers shown before the pick** (lab, 300 games each; game-days to clear the whole game): honest Completionist 43.3; the dawn farm 19.8 today (84% on its first real Coil), 43.3 with the rule; honest numbers unchanged. The rest (K3's (a)–(e), the death farm left open): the roadmap's section 2, v0.11.86 line.
  - **As built:** see the version note.
  - **Also:** `e8a13db` filled in for 0.11.85; after v0.11.85 Claude uploaded 7 docs (handover, roadmap, roadmap-done, changelog, restore-points, history-10, reference); v0.11.83's notes to the new `history-11.md` (part 10 past 45 KB).

### From "Version notes"

## v0.11.86 — a Coil ended by choice adds no Coil bonus (#53; C1 + G1 + W1)

- **Files:** `js/core/game.js` (`coilMult` reads `coil.free`, `coilMultNext`, `startActCoil` carries it), `coil.js` (`rewind` counts a chosen end), `js/story/coil_scenes.js`, `js/main.js`, `js/core/faq.js` (the texts; no whole-game choice after a chosen bite); tests: tasks (the v0.11.86 block; old Day 1 bites expecting ×1.5 now die), faq, models (the Farmer, `--farmer-games`), tools, `tools/browser.py` part 1; `tools/check.mjs` (7 / 5 blocks); `sw.js`, `tests/README.md`, timings, docs (v0.11.83 to the new `history-11.md`). Saves: one new field, `coil.free` (absent = 0, an old save's bonus as before; kept through a save, Act 1 and a whole-game rewind); no id changed.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh` (run 3): exit 0, 0 drifted of 139, 0 past 5; the models unchanged (Careful 3.51 / 6.71, Completionist 3.96 / 5.88, the Sitter 2.78 / 2.80), the Farmer 3.94 / 5.82 (from its first real Coil; ×1 after its ten bites); the four browser parts pass. **Cold review on Fable:** every Coil-end path and `free` (saves, Act 1, both rewinds) fine; fixed: the James tab's bite at a lost tribute or Shen Qiu counted as by choice (now that loss's, `tabWhy`), "×1 as fast" shown, the FAQ's formula, "adds no" in Go round again. Runs: 1 exit 0; 2 a roadmap test (#53's marker); 3 exit 0, 0 drifted.

## Moved from the handover in v0.11.88 (word for word)

### From "Decided in chat"

- **v0.11.85: the game at least twice as hard (owner 2026-11-08 22:39, restated 23:37: "weigh halving the Coil XP bonus (COIL_GROWTH 0.25 → 0.125) against slowing familiarity (USE_N, the card tiers), alone and combined, with the bots' numbers and the models against the targets (and section 2's #53, the farmable Coil bonus)"; options at 00:00 with the numbers; owner 00:03 "the options are not laid out exactly, please show me what each covers"; 00:05 "stop I don't have time for you to run full simulations on this again. I accept your pick, for now"; 00:07 "the sanity check and all checks should still run as normal, my comment was about the lack of time to model all the options and then do it again. I still need the full suit you normally run after building stuff so the game doesn't break"):**
  - **Picked:** **D + T1 + M1** (Claude's recommendation). **D:** `XP_RATE = 0.6` (`game.js`): every XP award (James's skills, Yuki's bond share and fights) ×0.6 after the Coil bonus; `COIL_GROWTH` and familiarity unchanged. **T1:** `TARGETS` 2 / 3 → 4 / 6 (`coil.js`; the James tab, the Coil screen's ★, the FAQ read it). **M1:** the **Sitter** model in `tests/models.test.mjs` (log only; sits whenever it can, then meridians, then gathers Qi up to 6 h a day; else the completionist), last so the others' seeds don't move; 150 games in the full check, 20 in quick. The fallback branch `fallback/2026-11-09-before-difficulty` (0.11.84). Not picked: A, B, B′, C, E, F; T2; M2.
  - **The numbers shown before the pick (00:00; lab runs, 400 games Careful / Completionist, 150 the Sitter; mean Coil that clears the prologue / Act 1; the Sitter's whole game on Coil 1):** today 2.25 / 2.83, 2.06 / 2.75, 1.95 (48%); **A** Coil bonus halved 2.47 / 4.09, 2.19 / 3.69, 1.95 (48%); **B** familiarity half as fast (N ×2, tiers 4 / 16 / 36) 2.46 / 2.97, 2.15 / 2.96, 2.06 (37%); **B′** familiarity capped ×5.5 2.44 / 2.94, 2.31 / 2.93, 2.14 (32%); **C** A + B 3.00 / 4.10, 2.45 / 3.82, 2.18 (37%); **D** XP ×0.6 3.50 / 6.73, 3.94 / 5.89, 2.89 (5.3%); **E** A + XP ×0.7 3.51 / 9.36, 4.17 / 7.28, 2.54 (27%); **F** XP ×0.5 4.40 / 8.77, 4.84 / 7.39, 3.36 (1.3%). Neither lever alone or together makes it twice as hard: the Coil bonus +34–45% in Act 1 (nothing on Coil 1), familiarity +5–12%. #53 and the Sitter's realm 14: open items.
  - **As built (the full check, 500 games):** Careful 3.51 / 6.71 (1 gave up), Completionist 3.96 / 5.88 (prologue Coil 1 death 51.2%; 3 gave up), with Yuki's lane off 3.76 / 7.84 and 5.12 / 6.39, the Sitter 2.78 / 2.80 (5.3%), Rusher 0%. **Sanity:** the 14 drifts past ±20 the option named (e.g. the rot ape for the tasks test's bots 54 → 3.6% smart, 50.7 → 1.9% random; tribute C2 paid 29.5 → 1.3%; Act 1 C4 dead 52.3 → 100%; the collectors 27.6 → 2.7%; Ya's brawl in the story test 75 → 54.8%), then the baseline re-saved (176 numbers, the pick's scope).
  - **Also:** `5eb5683` filled in for 0.11.84; after v0.11.84 Claude uploaded 5 docs; v0.11.82's notes to `history-10.md` (part 10 now past 45 KB: the next push starts `history-11.md`). Review and checks: the version note.

### From "Version notes"

## v0.11.85 — the game at least twice as hard: XP ×0.6, targets 4 / 6, the Sitter (D + T1 + M1)

- **js/core/game.js** (`XP_RATE`, in `awardXp` and `awardYukiFightXp`), **js/core/coil.js** (`TARGETS` 4 / 6), **tests/models.test.mjs** (the Sitter, `--sitter-games`), **tools/check.mjs** (the models step plays the Sitter: 150 / 20 games, 6 / 4 blocks), **tests/rules.test.mjs, tests/tasks.test.mjs** (the XP numbers, the v0.11.85 block, the target lines), **tests/tools.test.mjs** (the Sitter in the models step, a tiny Sitter run), **tools/baseline.json** (re-saved, the pick's scope), **sw.js, tests/README.md, tools/timings.json; project docs** (v0.11.82 to `history-10.md`). Saves unchanged, no id changed: a save keeps its XP and skills; it learns at the new rate from now on; a best ★ already earned stays in its Results line.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`, four runs: 1 a browser part 2 flake ("page error: missing ) after argument list"; part 2 alone passes, before and after); 2 the engine numbers test's XP lines (updated); 3 only sanity, with exactly the 14 drifts the option named (baseline re-saved); 4 exit 0, 0 drifted, the four browser parts pass. **Cold review on Fable:** every XP path goes through the two awards (nothing bypasses or doubles), no float loss, no text states the old numbers, saves safe (the ★ is never stored); fixed: the Sitter's gather-Qi cap carried across Coils (its numbers unchanged), `--sitter-games` checked (bad input exits 2), `reference.md`'s targets; run 5: exit 0, 0 drifted. Open (the owner's call): the Sitter clears at 2.78 / 2.80, well inside the new 4 / 6 (the targets fit the Completionist).

## Moved from the handover in v0.11.87 (word for word)

### From "Open items" (the NEXT item and the roadmap item, as of v0.11.86)

- **NEXT, the owner's order (2026-11-08 22:10 and 22:39; new in v0.11.82; the FAQ done in v0.11.83, the difficulty in v0.11.85):** (1) and (2) done (v0.11.83, v0.11.85; their words moved to `history-10.md` and `history-11.md`). **Open small items (owner 23:37, "my call later"):** "Fists only." twice at the start of Bao's brawl; the spar's "terms agreed" line on the forced path (`ya_forced`); a brawl win's GU XP about double a small fight's; the Journal's "checks rolled" (group e). **Next before the playtest (the owner's order, 2026-11-09 00:43):** (1) **#53, the farmable Coil bonus: done in v0.11.86** (C1 + G1 + W1; decisions below); (2) **the sitting loop**, next, options and numbers first (the Sitter still reaches realm 14 and T10 L10 by Act 1's end: a higher skill tier shortens the regen Cycle from 30 min to 1 min from T6, so Qi stops limiting sits, and sits run ×10 from 30 uses); with its own options and numbers. Also open (the owner's call): the Sitter clears at 2.78 / 2.80, well inside the 4 / 6 targets; dying on purpose still adds the bonus (roadmap section 2, v0.11.86).

- **The roadmap, regrouped in v0.11.65 (owner pick G2):** `project/roadmap.md` holds only the open work, in six sections: **1** the story and mechanics pass (push 1 done in v0.11.64; **group a done in v0.11.66**; **group b done**: one hub format in v0.11.67, where replies show in v0.11.68, **the missing replies of the one-off story choices in v0.11.69** (the repeating ones moved to group e); **group c, the small rules, done in v0.11.71** (Yuki's food switch, one total per skill for "Cultivate until the limit", more than one wilds exploration a day from Coil 2), **g the copy-over push 5, the Coil (moved up from section 4 in v0.11.70), done in v0.11.72** (the Coil screen's closest cards and what carries over, the next-step line, the targets and the personal best), h the analysis of Selene's and the SillyTavern repositories, i the games analysis (Selene's `project/research.md` list, about 45 games, plus the games the owner names before d)**, d combat, e story texts (now also the Fable rewrite pass and its comparison, the relationship decision of 14:50, the repeating replies), f romance; **order since v0.11.70 (O1): c → g → h → i → d → e → f**, then section 2, then the rest of section 4), **2** the balance retune (E below), **3** a later art pass, **4** systems still to build (F, the copy-over push 5 (the Coil), then G; threads need a new design without the queue), **5** later, **6** waiting on the owner. Done, stale and moot lines: `project/roadmap-done.md`. **group h done in v0.11.73** (H1 + K1; the findings placed in the roadmap's groups, each marked "new in v0.11.73, from group h"). **Group i's round 1 done in v0.11.74** (I1 + L1 + E1: 52 candidates, #43–#94 in `research.md`, each placed in the roadmap, marked "new in v0.11.74, from group i"; the Coil-bonus finding, #53, in section 2). **Round 2's wave 1 done in v0.11.75** (W1: dating sims and visual novels, 26 candidates, #95–#120, marked "new in v0.11.75, from group i round 2"). **Round 2's wave 2 done in v0.11.76** (V1: cultivation and xianxia games, idle and not, with E1's five and Chinese sources; 26 candidates, #121–#146, marked "new in v0.11.76, from group i round 2"). **Group i is done. Group d (combat) started in v0.11.80: the fight lab (L1, a tool).** **The Tan brothers' fight fixed in v0.11.81 (T1); the brawls in v0.11.82 (B1 + Y1).** **Tabled by the owner (22:10) until the FAQ is built; then the difficulty (22:39); both below.** Left in d after that (each its own options and pick, numbers first): the blade's lead over every other action, the weapons by Convergence, flight, the fight ideas from the games; then e, f, the retune, the rest of section 4. Two lore calls for the owner wait in group e (#123: where Core Formation, True Core, Origin Core and Soul Embryo sit on his realm scale; #141: whether this world had breakthroughs without tribulations before the poison). *(The three open items this replaced are in `history-9.md`, moved in v0.11.65.)*

### From "Decided in chat"

- **v0.11.84: docs only (owner 23:33: "it's ok I'm group f. give update the docs and give me a handover message"):**
  - **Recorded:** the owner confirmed the place of his 23:22 bug report (Yuki's love-life talk in human form at Origin Core) in the roadmap's group f, beside the romance gates. A handover message for a new chat given in chat.
  - **Also:** moved word for word to `history-11.md` in v0.11.86.
  - **Checks:** see the version note.

### From "Version notes"

## v0.11.84 — docs only: the bug's place confirmed

- **project docs** (handover, roadmap, changelog, restore-points, history-10: v0.11.81 moved there), **sw.js** (VERSION). The game identical to 0.11.83; saves unchanged.
- **Checks:** docs only (rule 2): `node tools/consistency.mjs`, `node tests/tools.test.mjs` and `bash tools/check.sh quick`. How it interacts: no game file, save or bot code changed, so the game and the bot numbers can't move. What can break: nothing new.

## Moved from the handover in v0.11.86 (word for word)

### From "Decided in chat"

- **v0.11.83: the FAQ (owner 22:10; Claude read Selene's FAQ and its unfolding (`hufle-beep/Long-patience` index.html); options at 23:00: P1 its own tab / P2 a menu button, T1 Claude's texts from the game's own numbers / T2 Fable drafts, R1 the James tab's dice-era rules replaced / R2 kept; owner 23:06 "Go with your picks"):**
  - **Picked:** **P1 + T1 + R1.** A sixth tab, **FAQ** (one row from 360 px), Selene's unfolding as it is: gates checked on every redraw; unlocks and opened entries on the phone (`boneash.faq.v1`), never in a save; a phone new to the FAQ counts nothing already reached as new; new tags, the first new entry opens, a dot on the tab; search (every word); opened from a tab, that tab's entry opens. 20 entries, 9 from the start; the rest behind the first work card, fight, Meditate, Coil end, rewind, person met, Yuki's second form, Act 1, the Long Forest (the list: `js/core/faq.js`). Texts Claude's (help text: no Fable step), the numbers read from the game, so the difficulty push updates them. P2, T2, R2 not picked.
  - **Cold review on Opus** (rule 9: no logic or balance): fixed: the James tab's button found no entry on a new game; Fights named the blade wrong early on (the Fragile bone knife); small text errors; a re-tap of the tab read the next new entry; search read HTML; open entries kept across tabs; more numbers read from the game or checked (`YUKI_HOURS` exported, `REL_MAX` named, unchanged), every bold label checked against the game's words. Kept as Selene's: a search opens (and so reads) its matches. Open (the owner's call, roadmap group e): the Journal's "checks rolled".
  - **Also:** `bfc0f07` filled in for 0.11.82; after v0.11.82 Claude uploaded 5 docs (handover, roadmap, changelog, restore-points, history-10); v0.11.80's notes to `history-10.md`; the owner's bug report of 23:22 (open items; roadmap group f).
  - **Checks:** see the version note.

### From "Version notes"

## v0.11.83 — the FAQ (P1 + T1 + R1)

- **js/core/faq.js** (new; pure), **js/main.js** (the FAQ tab, its dot, search, per-tab entry; the James tab's button), **index.html, css/style.css** (six tabs, the FAQ's styles), **js/core/tasks.js** (exports for the FAQ, `YUKI_HOURS`), **js/core/game.js** (`REL_MAX` named), **tests/faq.test.mjs** (new), **tools/check.mjs, tools/browser.py** (part 2: `faq`), **sw.js, tests/README.md, tools/timings.json; project docs**. Saves unchanged; no id changed; one new phone key, `boneash.faq.v1`.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`, before and after the review's fixes: exit 0, 0 drifted of 152, 0 past 5; the models unchanged (Careful 2.23 / 2.83, Completionist 2.08 / 2.77); the four browser parts pass. Mutations by hand: the James entry gated again, a label renamed, the re-tap fix undone: each caught.

### From "Decided in chat", v0.11.84's "Also" line

  - **Also:** `18a0aa2` filled in for 0.11.83; after v0.11.83 Claude uploaded 7 docs (handover, roadmap, roadmap-done, changelog, restore-points, history-10, reference); v0.11.81's notes to `history-10.md`. After v0.11.84 (`5eb5683`) Claude uploaded 5 docs (handover, roadmap, changelog, restore-points, history-10).

### From "Open items" (the NEXT item, its done parts)

- (1) **the FAQ: done in v0.11.83** (this part of the item, the owner's words, moved word for word to `history-10.md`). (2) **the game at least twice as hard: done in v0.11.85** (D + T1 + M1; decisions below).

### From "Open items" (the art item, the files on the owner's PC)

- push 5a's: job lists `input/boneash_jobs/a1p5a_*.json`; masks `input/boneash/f5_*.png`; pictures `output/boneash/f5_<key>_<what>_s<seed>`; push 5b's: job lists `a1p5b_test_bg.json`, `a1p5b_test_p.json` … `a1p5b_test_p3.json`, `a1p5b_bg2.json`, `a1p5b_forms.json`, `a1p5b_forms2.json`; stand-ins and masks `input/boneash/b5l_*.png`, `b5m_*.png`; pictures `output/boneash/b5_<key>_bg_s<seed>`, `b5_<key>_<form>_s<seed>`.
