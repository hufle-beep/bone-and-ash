# Cold review: v0.11.192 (K1, F1), Opus

I read the diff, the brief, the checklist and the packet. I rendered all four later texts in every state (cat or human before × snapshot 0 or 7) in a scratch copy. I ran real rewinds (`startActCoil` + `rewind` to the act and to the whole game) and the daily-door route, and put the new result lines through `splitLine`. Story test `--quick` in the copy: 4,672,625 passed, 0 failed. Planted faults: 19 (13 + 1 caught, 4 + 1 missed); details in `/tmp/k1r/mutate.md`. Nothing in the repo changed (git status and diff hashes are the same before and after).

**Summary: no High findings.** The `yk_form_before` signal, the QW snapshot test and L5 hold on every route I traced. One Medium finding about text and one about tooling, a few Lows, and test gaps.

## The brief's questions
- **Is `yk_form_before` reliable?** Yes. Every entry into `yk_choice` runs its `enter`: the breakthrough's "Get up." through `go`, the daily door directly (`yuki_time.js:413`), and `yuki_human_after`'s wrapped choices. That `enter` always overwrites the flag before setting her human, so a stale value can't reach the text. Every way out clears it: `ykFormBack` on "Not yet" and on the two `_here` answers, and `delete` at both fire answers. It isn't in `KEEP_FLAGS`, so a rewind drops it. `yk_choice_again` sets it but never uses `ykLaterQ`. A first question has no `yk_last`, so `ykLaterQ` returns null and `YK_HERE.first` shows. A v0.11.191 save resting on `yk_choice` already has the flag from its `enter`. Simulated: an Act 1 rewind with her human at dawn, then the door, gives `yk_form_before` 'human' and the QH text. With her a cat it gives the text as written.
- **Is the QW snapshot right for every kind of Coil?**
  - Prologue: the snapshot is Day 1, realm 0, so QW never cuts. Right.
  - Act 1: the snapshot is taken at the start of Act 1 and the rewind restores its realm (simulated: snapshot 7, realm 7, cut). Right.
  - Whole game: `snap: fresh`, realm 0 (simulated). Right.
  - Old save: the snapshot is the save as loaded, and the rewind restores it. Right.
  - Act 1's first Coil, where she grew her human shape in this Coil's prologue: QW cuts "until now", which drops a claim and adds no false one. Harmless.
- **Does L5 hold on every route?** Yes. The first Coil's "Promise" leaves her a cat and shows "Back in her own shape". "Ask her to stay" keeps her human and shows "She stays as she is". `yk_choice_again` and the door's "Family." set the flag to 'human', so she stays human and gets the first line. The fire's answers don't use L5.
- **Save safety (rule 7):** no new flags or IDs. `ykLaterQ` only runs its swap loop for keys that have a `q` text, so an unknown `yk_last` can't throw. `ykHumanAtStart` uses optional chaining on `coil.snap`. OK.

## Medium
**M1. QH sister: the swapped opening still describes a change of shape** (`js/story/yuki_path.js:107`). Rendered with her already human:
> "…and stops there, shaking her sleeves straight like someone back in a coat she left on a hook. / "There," she says. "You know what comes with the hands."

- "back in a coat she left on a hook" says she has just put the shape back on.
- "There," marks a finished action that no longer happens.

This route is the common later-Coil QH route: an Act 1 that begins with her human, where she is human at the door. Fix: widen the first pair's `to` to `'and stops there, shaking her sleeves straight.'`, and make the second pair `'"Right," she says. "You know'`. Pin both (see TG2). These are Claude's words, so they need the owner's OK.

**M2. Tooling: `check.sh quick` and `tests/tools.test.mjs` can't run in `tools/mutate.mjs` copies.**
- `tools/check.mjs:37` calls `git ls-files`, and the copies leave out `.git`. The quick check dies before any test runs, so every fault measured with it comes out "caught".
- `tools.test.mjs` fails 3 checks in every copy: leftovers, arthash and consistency (git or `art/`).
- The checklist's v0.11.185 note ("so those commands can be measured") is no longer true. I measured T1 and T2 with a wrapper that ignores those 3 failures.

Fix options:
- In `check.mjs`, fall back to a file walk when git fails.
- Or have `mutate.mjs` run `git init -q && git add -A` in each copy.

Then fix the checklist line.

## Low
- **L1. QH lover** (`:108`): "She tugs her collar level and counts her fingers. All present." The finger count is a joke about a fresh change. Already human, it reads oddly. Fix: also cut " and counts her fingers. All present." (pair `to`: `'. She tugs her collar level.'`, two pairs, or one wider pair).
- **L2. QH wait** (`:109`): "…and stops there, and rolls her shoulders." The next line is "We stopped at 'not yet'": "stops" then "stopped", plus an and/and chain. Fix: `'and rolls her shoulders there.'`.
- **L3. FQ** (`:110`, untouched text): "She holds her palms to the heat, pleased with them." This is still the new-hands beat. Optional: a third fire pair making it `'She holds her palms to the heat.'`.
- **L4. LF sister**: the label right above is still "Sleep." (`:214`). The new result "on your shoulder" fits a sleeping James worse than the old "on your chest", and "chest" wasn't a claim of leaving; only the lover's "until the treeline" was. `news.js:47` also says the later-fire answers "no longer speak of bedtime", but the labels still say "Sleep." and "Let her sleep." Fix: either keep "on your chest" for the sister (and drop `chest` from the LF test's ban), or reword the news line to "…no longer speak of leaving the forest."
- **L5. Pre-existing, outside K1 (open, options later).** With the women present (`awakeWho`), `yuki_human_after` (`longforest.js:748–757`) still has her say "I will choose who hears me answer back". She has just spoken in front of Mei Lin and Ya. The first question (`YK_HERE.first`, "I don't need to be the only one") then follows with them still standing there. M2b fixes only "the two of you".
- **L6.** `ykHumanAtStart` (`:118`) hard-codes realm 7, which repeats the rule in `game.js:993` `yukiForms`. Suggest `yukiForms({ yuki: g.coil?.snap?.yuki ?? { realm: 0 } }).includes('human')` so the two can't drift.
- **L7.** At render, `ykLaterQ` calls the throwing `swap` (`:122`). The load check makes a throw impossible today. F17 shows the load-time loop can be removed with no test failing, and then a broken pair would crash the scene. Suggest a render path that doesn't throw (`t.replace(from, () => to)`), keeping the throwing check at load only.

## Test gaps
- **TG1 (F6 missed).** M2b's word isn't pinned: the test compares against `P.AFTER_WOMEN[1]` itself (`tests/story.test.mjs:4523`). Add `assert(/which leaves everyone rather less room than before/.test(both))`.
- **TG2 (F8 missed).** The QH `to` strings are tested against `want`, which is built from the same `YK_LATER_HUMAN` data. Only the openings are pinned, so the sister's second pair can carry a new change beat ("Fingers again"). Pin each `to` literally, or widen the ban to `/\b(again|thumbs|fingers)\b/` in the first two paragraphs.
- **TG3 (F9 missed).** LF is tested only with `yk_last` 'sister' (`later('sister', …)` for both answers). Loop over 'sister', 'lover' and 'wait'.
- **TG4 (T2 missed).** `tools.test.mjs` pins only lint's count of 18. Dropping the human states' `yk_form_before` or snapshot in `tools/lint.mjs` passes. (Textlint's version, T1, is caught by the LR snapshot.) Assert that one lint sample has `yk_form_before === 'human'` and snapshot realm 7, or export SAMPLES.
- **TG5.** QW is tested only with a faked `coil.snap.yuki.realm`. Add one real walk: `startActCoil(g,1)` with her at realm 7 → `rewind(g,{to:'act'})` → the door gives the cut. Then `rewind(g,{to:'game'})` gives `ykHumanAtStart` false. (Simulated here: both right.)
- **TG6.** QH through the daily door (`yuki_time.js:413`) isn't asserted in the K1 block, which uses the breakthrough only. F13 was caught by an older test (the form back), not by QH. Add the door with her human, and check the QH text.
- **TG7.** The samples (lint and textlint) render the wait text as plain or QH+QW, never QH only or QW only (a cat with snapshot 7). The phrases are covered, but a tic in a join wouldn't be seen. Add a cat state with snapshot 7.
- **TG8 (F17, harmless).** Removing the load-time QH check passes, because the render check still throws. Ties to L7.
