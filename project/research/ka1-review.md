# Cold review: v0.11.227 (KA1 + XW-a + DW-a + KM-40), the realm kept for a won game

Opus, cold. Read: the brief, both checklists, `git diff HEAD` (game, tests, tools), grep and line ranges around `rewind`, `endCoil`, `tabWhy`, `actWon`, the Coil scenes, `meridians.js`, `awardXp`, the breakthrough texts, `yuki_path.js`. Ran in a scratch copy (`/tmp/rv/ka1`): `tests/saves.test.mjs` (1491 passed, 0 failed), `tests/models.test.mjs --cal 7 --kept` (4 games of Careful, then 40 each of Careful and Sociable), `tests/tools.test.mjs` once as a control (488 passed, 0 failed), probes on the owner's act-end saves, and both fault files through `tools/mutate.mjs`. `check.sh` not run, as the brief says.

**The logic holds.** `c.why === 'clear'` is set only by `endCoil(..., actWon ? 'clear' : ...)` (from `a1_again`, and from the James tab through `tabWhy` at `a1_end`), and it survives a reload at `coil_end` (probed: serialize, then deserialize, gives why `clear`). "Not yet" clears it, and a later bite sets it again, so one rewind counts once. A collapse, a beast, 'taken', a bite by choice and a lost tribute never set it. `liftKept` runs after `base.coil` (its `n` and `free`) is in place, so the XP uses the new Coil's `coilMult`, `XP_RATE` and `xpPace`. `coilStart` is taken after the lift, so "realm +N" counts from the kept start. `yukiAbove` is unaffected (the lift raises his GU, never her Fight). The meridian windows hold at every realm from 0 to 14: primaries and collaterals are Mortal Vessel only, and the lift fills them; the Extraordinary window covers 4–6 and is left for the player below 7 and filled from 7; the junctions are 7+ and left. Flight in fights stays Act 1 only (`airFights` = `canFly && inAct1`). Old saves start at 0. The owner's `a1_end` victory save at realm 5, bitten through the tab path, gives clears 1 and keptTop 5. Its Act 1 snapshot (realm 4) is above the floor, so nothing changes there and no line shows. The models match the brief: Careful and Sociable, 40 each, won 40 of 40 first passes and cleared pass 2 on Coil 1 in 60% of games.

## Findings

**H:** none.

**M1: `yuki_check` tells a kept Foundation (or higher) "Mortal Vessel, the pair of you."** `prologue.js:150`. Its first sentence reads the meridians (all open after the lift, so it shows the "Twelve primaries open… a match for yours" branch), but the next line is fixed: `Mortal Vessel, the pair of you. Young, as your people count it. Larval, near enough.` That line is in the same paragraph, so the fold for a re-read text doesn't hide it. **Scenario (probed):** the owner's `2026-11-09-2127-…-a1_again` save (victory at Soul Embryo). Bite the whole game, then the dawn ("it kept Foundation"), then Get up, then the arrival's first choice "Check Yuki over first". That screen says Mortal Vessel, one screen after the dawn said Foundation. This hits every whole-game rewind after a won clear that keeps 1 or more, the path the KM bots take every game. Fix options later: a realm word from `realmName(g.yuki.realm)`, or a kept branch (a story text, so Fable's).

**L1: the dawn's "The meridians are open, every channel where you left it" overclaims.** DW-a, `coil_scenes.js:111`. The lift opens the Mortal Vessel net only, plus XW-a's from 7. All three of the owner's act-end saves left the Extraordinary 8 and their 28 collaterals open (realm 5, 6 and 10; the last also had 10 junctions). After the bite to a kept Foundation the Meridians screen shows 0/8 and 0/28, while the dawn says every channel is where he left it. The Results line just above it is accurate ("the Mortal Vessel meridians open"). The fix belongs to Fable, if the owner wants it: drop "every channel where you left it", or name the first net.

**L2: `ykHumanAtStart` reads the unlifted snapshot.** `yuki_path.js:120`. On an Act 1 rewind lifted to 7 or more from a snapshot below 7, Yuki is human-capable from the dawn. The function still returns false, so the "Not yet" text keeps "it has taken me until now to grow a voice back" (`YK_WAIT_SINCE_DAWN` isn't applied, the RV1 L6 rule). It needs 7 won clears and keptTop 7 or more, so it's rare. A whole-game pass is fine (its Day 8 snapshot is taken after the lift).

**L3: `--kept` drops a first pass that gives up.** `tests/models.test.mjs`: in pass 1 `st` is the throwaway `blank()`, so `st.gaveUp++` at Coil 9 is lost, and `playInto` counts the game in `games` but in nothing else. The `cleared:` percentages divide by every game, including those with no second pass. It made no difference here (40 of 40 first passes won), but a bot that loses or gives up pass 1 would show lower pass-2 clears without saying why. Suggest counting `real.p1GaveUp` and dividing the pass-2 rates by `p1N`.

**L4: the bots only ever measure keptRealm 1.** Every bot's realm at its clear was 1.00 (the 4-game and both 40-game runs). KM-40 measures Foundation only. Core Formation and up (more clears, Yuki's forms from 2, XW-a from 7, realm-gap fights from 7) reach no bot. Say so when the numbers go to the owner.

**L5 (text, minor):** the James tab's Coil paragraph still says "his realm, skills and meridians … start over", with the `Kept realm:` line right after it to correct it. The FAQ Flight line says "from the first dawn", but an Act 1 rewind wakes at the start of Act 1. Both are wording only.

Checked and fine: plurals in `keptLine`, `keptNext` and `keptTabLine` (1 and 3); no line at floor 0 (a clear at Mortal Vessel); the FAQ and What's new against the code (the min of clears and keptTop, Core Formation as realm 2, skills starting over); `MAX_REALM` (the lift at 14: HP 60, Qi 204.5, CU T1 L7 on Coil 2); the Act 1 dawn left unchanged as briefed.

## Test gaps

- **TG1:** XW-a's XP is untested (the brief's F15 was missed, and so was R9). Assert GU and CU ranks after a lift to 7 against a lift to 7 with the 8 and 28 already open, and the exact award count (36 challenging).
- **TG2:** the exact XP is untested. The test asserts only that GU went up (R8, 66 awards in place of 8 group awards, passed). Pin the award count, or GU's xp, for one fresh lift (20 standard at Coil 2, long calendar).
- **TG3:** the James tab is checked only by regex on the source. Its real bite handler (`main.js:1130`, `endCoil(g, tabWhy(g), g.scene)`) is never run (R2 passed with that bite turned into 'choice'), and neither is `keptTabLine`'s logic (R1 passed). Export the line, or drive `tabWhy` → `endCoil` → `coil_end` → bite as main.js does.
- **TG4:** the cap's "highest" isn't tested with a later clear at a lower realm (R5 passed). Add a clear at 4, then one at 2: keptTop stays 4.
- **TG5:** `colSealed` is asserted false only on a fresh game, where it's undefined anyway (R4 passed). Lift a Foundation snapshot with `colSealed: true` and collaterals 34.
- **TG6:** `coil.start` after the lift (R6 passed): the Coil screen's "This Coil" must not list the kept realm as gained. Assert `coilReport(g).gained` right after a lifted bite.
- **TG7:** the Results line on an Act 1 rewind below the floor (R7 passed: the test asserts the realm and `coil.kept`, not the line). Also the plural line at 3 clears (R3 passed).
- **TG8:** `yuki_check` (M1) and the Meridians screen after a lift: render the arrival's first choice after a kept bite, and pin no "Mortal Vessel" there.

## Planted faults

- **Builder's (`ka1-faults.json`, command `node tests/saves.test.mjs && node tests/story.test.mjs --quick`):** 15 of 16 caught. **Missed: F15** (XW-a without its XP).
- **Mine (`ka1-faults-review.json`, same command):** 1 of 11 caught (R11), 10 missed. R10 is a models-test fault, so the right test for it is `tests/tools.test.mjs`: measured alone with that command it is **caught** (487 passed, 1 failed; the unmutated control gives 488, 0 failed). So 2 of 11 are caught, and **9 missed: R1–R9** (TG1–TG7 above).

New kind for `review-checklist-code.md`: **a state lifted at a rewind:** grep the texts that read the state at the wake point (fixed realm words on the arrival screens, "every channel"), and the rules that read the snapshot in place of the live state (`coil.snap`, `ykHumanAtStart`); the lift changes the live game, not the snapshot.
