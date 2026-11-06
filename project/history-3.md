# Bone and Ash — history, part 3

Started 2026-11-06 (v0.11.11), when `history-2.md` reached about 45 KB. Newer than `history-2.md` and `history.md`. Each push moves what is older than the last three versions here from `handover.md`, on top of its section. When this file passes about 45 KB, start `history-4.md`.

## Older decisions (2026-11-06, v0.11.8 and later)

- **v0.11.8: the v0.11.7 slip and the save-on-close guard (built in v0.11.8):**
  - **The slip (rule 2):** v0.11.7 was pushed after a **failed** full check (the browser test's reload part, about 1 run in 7): the push was chained after a step that always reports success. Reported at once (16:0x); the docs were not mirrored. Owner 16:36 "A go" = option a (fix in v0.11.8, mirror after). **Now:** the check's exit code is read before anything else; a push is never chained after it (in the gotchas).
  - **Mid-build stop (rule 2):** the planned fix (the reload part from a fixed test save) passed 1 run in 10. Cause: v0.11.5's save on close also fires when a page reloads, and wrote the page's old game over the save the test had just put in storage. So v0.11.7's browser test was weaker than reported (its new-game and Story Mode starts were not guaranteed fresh), and v0.11.5 opened an edge case: with the game in **two tabs**, closing the older tab wrote its older state over the newer save. Owner 16:55 "go a".
  - **a (built):** `main.js` keeps `lastWritten` (the autosave text this tab last wrote or loaded); the save on close (`closeSave`, on hidden and `pagehide`) writes only if storage still holds `lastWritten`. No balance or save-format change. `tools/browser.py`: storage is set from a non-game page on the same site (`fresh`), the reload part starts from `saves/v0.11.7-long-forest-coil2.json` (the Long Forest camp: 37% → 37%), the new game must show Day 1, and a **two-tab check** (a second tab plays on and saves; the first tab leaves; the newer save must stay). **Proved:** 10 / 10 runs in a row (34–51 s); with the guard removed, the two-tab check fails ("the closing tab wrote over the newer save"). Full check: all passed (exit code 0), 0 drift.

## Older version notes (v0.11.8 and later)

## v0.11.8 — the save-on-close guard, a reliable browser test

- **main.js:** `lastWritten` (set in `autosave` after the write and in `load` from the stored text); `closeSave()` = autosave only when `store.get(AUTO) === lastWritten`, used by the `visibilitychange` (hidden) and `pagehide` listeners. The 15-second save while a card runs is unchanged.
- **tools/browser.py:** `fresh(pg, url, js, arg)` (storage set on `art/bg/CREDITS.md`, then the game opened); part 1 must show Day 1; part 2 from `saves/v0.11.7-long-forest-coil2.json` at ×1; part 4 the two-tab check.

