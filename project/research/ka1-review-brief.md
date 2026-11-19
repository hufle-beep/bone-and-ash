# Cold review brief: v0.11.227 (owner picks KA1 + XW-a + DW-a + KM-40): the realm kept for a won game

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run). `node tests/saves.test.mjs` (seconds), `node tests/story.test.mjs --quick` (about a minute) and a few-game `node tests/models.test.mjs --cal 7 --model careful --games 4 --off 0 --kept` in a scratch copy are fine.

## What was picked (2026-11-19, "KA1 go", then XW-a, DW-a and KM-40 asked mid-build)

The owner's rule (2026-11-16 16:51): "if the game is cleared, then one realm per clear is kept (only with either beating the Elder or revealing the truth to him, dying or losing in any way does not count)". Measured first on a scratch copy (100 games each, the four long-calendar bots); KA1 = KG-b + KB-a + KC + KL-x + KM:
- **KG-b:** a won clear is a bite with `why === 'clear'` (`coil.js` `actWon` / `ACT1_WON`: victory, revelation and accord; the accord is the game's third won ending since RA1). From `a1_again` (both bites) or the James tab at the act's end (`tabWhy` → `endCoil(g, 'clear')` → the Coil screen). 'taken', a bite by choice, a collapse, a lost tribute don't count.
- **KB-a:** a floor: after N won clears no Coil (the act's rewind or the whole game's, and every later prologue or Act 1 rewind) starts James below realm N; an Act 1 snapshot already above it is kept as it is.
- **KC:** never above `stats.keptTop`, the highest realm James had at a won clear. `keptRealm = min(clears, keptTop)`.
- **KL-x:** the lift: realm, Yuki's realm with his, Saturation 0, the Mortal Vessel meridians open (12 primaries, 66 collaterals, James and Yuki; `colSealed` false; the work counters 0) and the Convergence XP opening each still-shut channel gives (`standard`, one each, as `meridians.js` gives at opening); bars filled to the new Max.
- **XW-a (asked mid-build):** from Nascent Soul (`KEPT_EXTRA_FROM` 7), the Extraordinary 8 and their 28 collaterals too (their window, Golden Core to Soul Embryo, is walked past), with their `challenging` XP one each; the junctions (Nascent Soul+) left to open.
- **KS:** save fields `stats.clears`, `stats.keptTop` (in `stats`, which every rewind keeps), `coil.kept` (the realm lifted to on this Coil's rewind, for the dawn and the Results line). Old saves start at 0; one sitting at `a1_end` / `a1_again` with a won ending counts when it bites.
- **KT:** plain lines (Claude's): the first dawn's Results (`keptLine`), the Coil screen's "Next Coil" (`keptNext`, with the new floor after a won clear), the James tab (`keptTabLine`), the FAQ (What carries over, Flight), What's new 0.11.227. **DW-a (asked mid-build):** the prologue's first dawn ¶2 said "The meridians are ash again"; with `coil.kept` it shows Fable's draft D1 (the realm named).
- **KM-40:** `tests/models.test.mjs --kept` plays each game's second pass after a won Act 1 (the whole-game bite) through the real code; the check's `models-kept` job, 40 games of the four long bots, log only. Measured: Careful and the Sociable clear pass 2 in one Coil 60%, the others 100%; the same pass with the lift switched off: Careful 57.5%.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/core/coil.js` (keptRealm, keptAfterClear, KEPT_EXTRA_FROM, liftKept, keptLine; the rewind), `js/story/coil_scenes.js` (bite's line, keptNext, the dawn's ¶2), `js/main.js` (keptTabLine), `js/core/faq.js`, `js/core/news.js`, `tests/saves.test.mjs` (section 4), `tests/models.test.mjs` (`--kept`), `tests/tools.test.mjs`, `tools/check.mjs` (`models-kept`), `tests/README.md`. My planted faults: `project/research/ka1-faults.json` (16; command `node tests/saves.test.mjs && node tests/story.test.mjs --quick`; results in `ka1-mutate.md` when you start, or run it yourself).

## What to look at especially

- Every path into `rewind`: is `c.why === 'clear'` set exactly for a won Act 1's bite (the James tab's Bite at `a1_end`, `a1_again`, the Coil screen's "Not yet" then a later bite, a reload between `endCoil` and the bite, a save loaded on `coil_end`)? Can a clear be counted twice (two bites from one end), or one lost?
- The lift against the rest of the state: `yukiAbove` (her Fight above his GU), Yuki's form (`yukiForms` by realm; the form field), the breakthrough's gate and `colSealed`, `willUnwind`, `coilStart` / `coilReport` ("realm +N" from the kept start), the Long Forest (`lfSeason`, `longforest` runs, `lf_*` flags), flight (`canFly`) on Day 1 with company, fights by realm (`power.js` degree), the meridian cards' windows at each kept realm (0–14), `MAX_REALM`.
- The XP: `awardXp` in the middle of `rewind` (the new Coil's `coilMult`, `xpPace`, Yuki's share through the bond): anything else it touches (stats, log, levels past a cap)?
- Texts: the dawn on an Act 1 rewind (unchanged), the Coil screen after a won clear at Mortal Vessel (the floor 0: no line), plural and number words, the FAQ's claims against the code.
- `--kept`: the first pass's state reset for the second (keys, `mem`, `seenTrib`), the seeds, a first pass not won.
- Test gaps and whether my faults are caught. Add your own faults in `project/research/ka1-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/ka1-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
