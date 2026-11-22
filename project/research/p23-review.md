# P23 — the cold review (Opus; v0.11.253, picks P23-A and RG-A)

Read: `CLAUDE.md`, `review-checklist-code.md`, the brief, `git diff` (10 files), excerpts of `tasks.js`, `story.js`, `power.js`,
`prologue.js`, `longforest.js`, `main.js` (`tipFor`, `cardHtml`, `medCardHtml`), `sanity.mjs`, `models.test.mjs`. Probes run (read-only,
scratch scripts in /tmp): every fight builder previewed through `degreeForChoice`; tip against card for every open Meditate card;
door cards the day's routine closes; `node tests/tasks.test.mjs --games 200 --bots-only` (270,068 passed, 0 failed) with `--stats-out`.

## Findings

**No High.**

**M1 — RG-A's "drawing a screen leaves the save unchanged" is false on four Long Forest screens, and its check can't see them.**
`power.js:86` copies only the top level, so `c.flags === g.flags`. `longforest.js:79` (`fight(id)`) writes `g.flags.lf_last = id` in
the builder. Measured: a new long-calendar game at `lf_bone_depths` with `lf_last = 'lf_heartless'`; one `sceneView` → `lf_last` is
`lf_bone_hounds`, the save changed (same at `lf_black_mire`; the builder probe finds all 8 choices of `lf_bone_depths`, `lf_black_mire`,
`lf_thunder_ridge`, `lf_old_roots`). The task bots' new purity check passes only because the bots never go there: 200 games, 0
`lf_` choices taken (`--stats-out` `seen.choices`). Not player-facing today (the real start and the one-move finish set `lf_last`
again), but the invariant the push states and tests is not true, and any builder that writes a nested object (`flags`, `james`,
`inventory`, `rel`) still writes the save on every draw. Fix options for later: `dryClone(g)` in `degreeForChoice` (cost: a JSON copy
per fight choice per draw), or `{ ...g, flags: { ...g.flags } }` plus moving `lf_last` out of the builder; and a purity walk over
every scene with a fight choice (TG1).

**L1 — `main.js:11` still imports `taskMinutes`; nothing in `main.js` uses it now** (grep: line 11 and the comment at 870). A leftover,
and it makes the old bug a one-line regression with no import to add (planted C4).

**L2 — `taskOutcome`'s door branch reports Fed and HP from before the day's routine** (`tasks.js:624`: `fed: g.james.satiety, hp:
g.james.hp` of the input). For a door the routine closes (`r.skipped`, `stopped: false`), the tap runs the meal and sit, so Fed differs.
Probe (every task hub, 5 days, 06:00–23:30, long calendar): 144 such door states, all 144 differ (e.g. `wilds` Day 1 15:00
`wild_explore:0`: forecast Fed 70, real 67; minutes and end agree). Not shown on screen (`out.fed` is read nowhere in `main.js`), but
the bots' FX check (`tasks.test.mjs`, the `!r.stopped` branch: `oc.fed === g.james.satiety`) would fail with "dry run = what happens"
the first time a checked game taps one; the 200-game run had 0 skipped cards, so it is latent, waiting on a seed or balance change.

**L3 — RG-A changes the game for players but has no What's new line.** Before, every redraw of the tribute screen moved `g.rng`, so Lu
Han's spread (and every later d6 event) depended on how often the screen was drawn, against v0.11.252's own note ("the same on a
reload"), and the degree that offered "End it in one move." could differ from the fight that started. The drift after this push also
mixes two causes (the calendar and the d6 order), so the re-saved baselines can't say which moved a tribute number.

**L4 — `browser.py` `no_greyed` now accepts the long calendar's locks in every flow** ("busy: ", "opens Day N", the evening, the stay's
length). A card wrongly shown busy or spaced anywhere no longer fails; the measured need was one tap (part 1, tap 14). Narrower: allow
them only where the flow expects one, or check the reason against the game (`spacedClosed`, the card's `status`).

**L5 — LP2's day move (`browser.py:697`) jumps the clock without a night.** `(minutes // 1440 + 1) * 1440 + 7 * 60` skips sleep (Fed not
spent, `cal_night` not stepped, no dawn), and counts from midnight, so a save past 00:00 would jump two days. The flow's point (the
Coil's reply record) survives, but it plays a morning no player reaches and nothing checks the reopened clock or day.

**L6 — `models.test.mjs:495`: `--save-baseline` with `--cal 0` or `--kept` saves nothing and says nothing** (the save branch sits inside
the gate). Also, `tools/models-baseline.json` is still the old calendar's (saved 2026-11-13, no `--cal` in its args) until the re-save,
so every run between compares long with old (log only).

**L7 — the drift's long log after folding.** `--long` now reads 7 models × 500 games plus the Yuki-off runs; `baseline-long.json` holds 4
models × 40, so until re-saved every Rusher, Sitter, Farmer and `:yukiOff` number logs as "new". And rule 2's update command, `node
tools/sanity.mjs --update` alone, never re-saves `baseline-long.json` (it needs `--long <file>` from a models run); the push report
should give the exact command.

Checked and fine: the tip and the card read the same expression for task cards (and 60 open Meditate cards agree); the familiarity
excuses are guarded by `famLater.carry > 0 && famLater.paid > 0`; the models' gate compares the long calendar and skips `--cal 0`,
`--kept` and shards; `check.mjs` sanity waits for `models`, which writes `models-long.json` in both modes; the browser save round
trip writes raw state, which the game loads (`unwrapSave`); the skip check views both games' last screen symmetrically.

## Test gaps

- **TG1** RG-A's purity is checked only where the task bots go (no Long Forest; M1). Add a walk: every scene with a fight choice,
  drawn twice on hand-built states (including `lf_last` set to another fight), the save compared without `lines` and `log`.
- **TG2** TP has no test of the tip itself: a source regex in a 2,500-character window from `function tipFor(` (the "Takes …" line is at
  4,728) plus a check that recomputes the routine as `taskOutcome` does (a copy of its rule). Planted C4 changes the shown time after the
  window and should pass. Export the tip's time (a `tipMinutes(g, id)` both use) or test it in the browser on a door with the routine due.
- **TG3** The FX forecast check never sees a door the routine closes (L2); add one hand-built state (`wilds`, Day 1 15:00) and compare
  the forecast with the tap.
- **TG4** No test that the degree a drawn screen offers equals the degree of the fight the tap builds (the one-move offer against
  `prepare(g, combat(g)).degree` after `choose`), on the tribute, the long calendar.
- **TG5** The walks' budget went ×10 (1,200–2,500 → 15,000) for every walk, including the Coil walks that were 400; a walk that now loops
  for 10,000 steps passes. Log each walk family's longest run and cap at about twice that.
- **TG6** The `flipFill(c)` pin counts the text (3 times), not its use: planted C9 reads the unflipped state and keeps the count.
- **TG7** Nothing checks LP2's reopened clock (L5) or that the guard's new lock reasons appear only where expected (L4).

## Planted faults

`p23-faults-review.json`, 10 faults. C8–C10 are in `tools/browser.py`: only the browser test can catch C9 and C10, and it can't run in a
`mutate.mjs` copy, so count those two as unmeasured; C8 is pinned by `tests/tools.test.mjs`. Expected misses: C4, C6 (and C9, C10
unmeasured).
