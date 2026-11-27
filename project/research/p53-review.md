# P53 (G3-A, v0.11.285) — cold review (Opus)

Read: the diff, the brief, both checklists, excerpts of main.js / week.js / coil.js / game.js / tasks.js. Ran: `node tests/appfiles.test.mjs` (11 passed, 21 of 21 mutants caught) and a scratch probe of L4-r (`/tmp/rv53`). Did not run the story test, check.sh or the browser test.

## What checks out
- SB-h: HP parts add up (realm part = the max less 20 and the floored body, never negative); Convergence's parts match `jamesQiMax`; the bar hold doesn't clash with the card swallow (a bar is no `button`); scrolling cancels it (move > 10 px, pointercancel).
- FE-t: `famNext` times one run the way `resolveWork` does (`once`).
- OS-a: an armed tap is keyed by kind and slot (`save2` and `load2` can't confirm each other). A stale `pendingFile` can't load later: every way back into the game goes through `openMenu('main')`, which clears it. Recovery has no game, so it asks nothing, as designed.
- CH-t: `histClose` is a no-op with no history (bots, old saves); an old save's `part` row and the Coil after it are right; list capped at 30; the snapshot carries none; a load, New game or rewind resets `tlMark` (new `g` or new `n`).
- L4-r: the P52 L4 case is fixed; Clear and `planSet` reset the counts; the forecast runs on a clone.

## High
- **H1 HK-t, a held key repeats (main.js keydown, ~l.1035).** `ev.repeat` isn't checked. Auto-repeat starts at about 500 ms, past the 400 ms double-tap guard (l.1156), and each repeat clicks `open[k]` again. Holding "1" on a fatal card with Pause before death on: the first keydown arms `fatalOk` (l.207, same id, 6 s) and the first repeat confirms it, so James collapses and the Coil ends. The same goes for Yield's second tap. On a story screen it takes the next screen's choice. Fix: `if (ev.repeat) return;`, plus a test.

## Medium
- **M1 TL-t, the first tap after a page load is never counted (main.js `load` l.489–495).** Boot, Begin and Continue set `g` without an autosave, so the first tap's autosave only sets `tlMark`. For a new player with no save, the second tap calls `histEnsure` with m0 > the snapshot's minutes (the arrival's choices take 5–30 min), which sets `part: 1`. So Coil 1 of a game begun in this version reads "—" and "from before the history". On a phone, every reopen drops its first tap (often Run the week, days of minutes). Fix: set `tlMark` in `load()`.
- **M2 TL-t, the plan resumed after a story choice is counted as story.** `playChoice` → `weekAfter` → `runPlan` (l.236, 303) runs with `tlKind = 'story'` (l.1153). On a long-calendar week the plan's next mornings resume this way, so most work hours land in "story". The brief says the plan's runs count as cards.

## Low
- **L1 L4-r, an old plan with left > kept (week.js:416).** `noteRan` turns `ranOf`'s null into 0, which drops the old rule after one run. Measured: kept 1 and left 3, one run (left 2, ran 1), then +: kept 2, left **1** (the old rule gives 3). Fix: leave `p.ran[k]` unset when `ranOf` is null.
- **L2 CH-t, the Coil that crosses into Act 1.** `startActCoil` replaces `coil.snap` (game.js:116), so the row's Days counts Act 1 days only, while its kills and strip include the prologue part.
- **L3 SB-h, Fed.** `hours = floor(fed/3)`, so Fed 1–2.9 reads "Empty: every hour now costs HP." The work's +1 an hour (FED_EXTRA_PER_HOUR) isn't in "About N h", so a plan day runs about 25% short of it.
- **L4 FE-t.** On a stay's week card the tooltip shows "Takes 7 h…" (the dry run, ×7) next to "one run 1 h → 24 min". This is the picked scope, but the two lines read as a contradiction. Open, options later.
- **L5 OS-a.** Restore a backup (main.js:1177) still replaces the game on one tap. The second tap has no minimum gap, so an accidental double tap on Save here overwrites the slot (as New game's).

## Test gaps
- **TG1** Only `hotkeyOf` is tested. Nothing covers the keydown handler's repeat, its menu / recovery gate, or the folded and hidden filter.
- **TG2** The main.js pins for OS-a and TL-t are substrings. Flipping `if (g)` in the file load (C6), or dropping `openMenu`'s `pendingFile = null`, passes both node tests. Move the decisions into pure helpers (as `askTwice` could be) and test those.
- **TG3** L4-r: nothing tests the read stop's count (C2), the skipped card's −1 (C1), a camp's new day (C3) or the left > kept case (L1). The `runWeek` assert `ran + left === 2` holds for any split.
- **TG4** Nothing tests `tlCount`'s behaviour (the first tap after a load, the resume after a story choice). The browser test's CH-t check passes only because PF-g's taps ran first.
- **TG5** A whole-game rewind and an Act 1 crossing are untested with a history.

## Planted faults (`p53-faults-review.json`)
C1 the skip's −1 dropped: probably missed. C2 the read stop's count dropped: missed. C3 the camp day keeps `p.ran`: missed. C4 the next Coil's `k0` = 0: caught. C5 a night fight counted as night: caught. C6 the file load with no ask: missed by both node tests (browser only, which `mutate.mjs` can't measure).
