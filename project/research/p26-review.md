# P26-A — the cold review (Opus; v0.11.256, the uncommitted diff)

Read: the brief, CLAUDE.md, `review-checklist-code.md`, `git diff` (game.js, prologue.js, news.js, story.test.mjs), every caller of
`satDiv` / `sitGain` / `rootGain`, every write to `james.saturation`, `collectorsFight`, `longStep`, `grow`, `power.js` `previewCopy`.
Ran: one probe (`node`, scratch file outside the repo): Lu Han's HP at realms 0/1/2/3/5/8/14 × every d6 roll × militia 0–2 ± spears,
the lowest case (scale 0, militia 3); a long-calendar sit at every realm 0–14 before (÷4) and after; `satDiv` on null, `{}`, `{cal:7}`,
`{cal:7, james:null}`, realm `'3'`. Not run: the full check, the models, the planted faults.

**No High.** Checked and fine: every Saturation write goes through `sitGain` / `rootGain` / `satDiv` (condense, the grove and the
hollow ×2, the root, the seclusion; no other writer); none crosses a breakthrough (each computes and adds once, the realm can't move
in between; "Cultivate until the limit" stops at 95% and is a dry run on a copy); every label that states a gain reads `sitGain`
(`meditate.js:61`) or the scene's own `gain`; a kept realm at a Coil's start (`coil.js:116`) and a save loaded mid-realm read the live
realm, no migration needed; `satDiv` on null / `{}` / an old save (no `cal`) → 1, `{cal:7}` and `{cal:7, james:null}` → 4; the
preview (`degreeForChoice`) builds the same `collectorsFight` on a deep copy with the same `rng`, so it shows the real fight's Lu Han;
the old calendar: `luReads` 0, `longCal` gate, Lu Han the same at every realm, `satDiv` 1. Lu Han's HP never reaches 0 (lowest 4).

## Findings

**M1 — What's new says "two thirds" for every realm from True Core; it holds only at 3–5** (`js/core/news.js:98`; the test pins the
claim on the constants, `story.test.mjs` P26-A last assert, `LONG_SAT_DIV / LONG_SAT_HIGH === 2/3`). A long-calendar sit, ÷4 → now:

| realm | 2 | 3 | 4 | 5 | 6 | 7–13 |
|---|---|---|---|---|---|---|
| before | 1.1 | 0.7 | 0.5 | 0.3 | 0.2 | 0.1 |
| now | 1.1 | 0.5 (71%) | 0.3 (60%) | 0.2 (67%) | **0.1 (50%)** | **0.1 (unchanged, FL1 floor)** |

So at Soul Embryo a sit gives half, and from realm 7 on exactly what it did; only the root (3 → 2) and a seclusion (unrounded, no floor)
are exactly two thirds at every realm. A player at realm 7+ (a later Coil with a kept realm, later Acts) reads a slowdown that isn't
there. Also "every realm needs more sits than the last" (`faq.js:42`) was already false from realm 7 (950 sits each at the floor); now
from realm 6 (6–13 all 950) — the older text, noted only.

**L1 — Lu Han's lowest HP 5 → 4 under the militia's floor** (`prologue.js:126–128`). `Math.max(6, hp − 2 × militia)` keeps him at 6
raw; the spread (−2.5, since v0.11.252) and now LN (−0.5) go below it before the step: scale 0, militia 2 + spears, d6 = 1 →
(6 − 3) × 1.375 = 4.125 → **4** (was 3.5 × 1.375 → 5). At the usual scale 4 (forest_day / vday 3) the lowest is 8 → **7**. Reachable
only with full militia and the lowest roll; the floor's intent (a minimum Lu Han) is now 3 raw, not 3.5. No 0, no crash.

**L2 — "a little more from True Core up" understates LR at kept realms** (`news.js:98`; `prologue.js:112–113,128`). LR has no cap: realm 14
reads 13 → +6.5 raw → about +9 HP after the step (probe, d6 = 4: realm 2 → 20, realm 8 → 24, realm 14 → 28). Within the owner's pick
("+0.5 for each realm he reads"), but only realms 3–4 are "a little". A wording note, or a cap if the owner wants one (open, options later).

**L3 — stale "÷4" comments** beside the code the push changed: `act1_blackroot.js:9` ("÷4 on the long calendar (+3%)"; now +2% from
True Core), `longforest.js:479` ("÷4 on the long calendar"), `game.js:254` (the SC2 header: "÷LONG_SAT_DIV"), and the SC2 test's message
(`story.test.mjs` ~5522, "a quarter on the long calendar"). Comments only; a reader of the root's code reads the wrong number.

Note (no finding): LN and LR vanish in rounding for some rolls (e.g. 12 raw + spread: (12.5 − 0.5) × 1.375 = 16.5 → 17 = 17.19 → 17),
and LR's single +0.5 at True Core sometimes too (militia 2 + spears, d6 = 1: realm 2 and 3 both 8). The measured rates already include it.

## Test gaps

- **TG1 — LN / LR with the militia or spears.** The P26-A rows and the LH pin build Lu Han with no militia; the floor's interplay
  (L1) and a fault that skips LN when the hunters helped (C5) pass.
- **TG2 — LR above realm 5.** The rows stop at realm 5 (4 reads); a cap on the reads (C2, `Math.min(reads, 4)`) passes unless some
  other pin builds Lu Han at realm 6+ (the LH block's `form: 'human'` sets realm 7: Claude to check whether it pins his HP).
- **TG3 — the What's new line by its words.** Only `/Lu Han/` covers the first sentence (C9, "less" → "more", passes); "two thirds" is
  pinned on the constants, not on `sitGain` by realm (so M1 passes). Pin "less … Foundation or below", "the same … a realm past it",
  "more from True Core", and test the stated ratio against `sitGain` at each realm it claims.
- **TG4 — the root's scene from True Core.** `rr_roots` is walked at Foundation only (+3%, SC2 M1); at True Core only `rootGain` is
  called directly. A scene that stopped calling `rootGain` (or hard-coded ÷4) passes at realm 3. The grove and the hollow (`sitGain(g, 2)`)
  likewise are walked, if at all, below True Core. Walk one with realm 3 on the long calendar and read "+2%" / the ÷6 gain in its line.
- **TG5 — `satDiv` on a long-calendar state with no `james`.** The SC2 shapes test `satDiv(null)`, `merMult({})`, `xpPace({cal:3})`;
  none passes `{ cal: 7 }`, so dropping the new `?.` (C10) passes and throws there.
- **TG6 — the boundary walked, not set.** Every ÷6 test sets `g.james.realm = 3` by hand; walk a real breakthrough Core Formation → True
  Core (and a Coil start with a kept realm 3, `coil.js` `liftKept`) and read the next sit's gain, per the checklist's "the usual path".

## Planted faults (`p26-faults-review.json`, 10; not run)

C1 LN dropped · C2 reads capped at 4 (TG2) · C3 LR after the long step · C4 LR by James's realm · C5 LN skipped with militia (TG1) ·
C6 `>` for `>=` at True Core · C7 ÷6 only realms 3–6 · C8 the FL1 floor only on ÷4 (realms 9–13 hide Cultivate) · C9 What's new "less" →
"more" (TG3) · C10 `g.james?.realm` → `g.james.realm` (TG5). Expected to pass: C2 (unless a realm-7 pin catches it), C5, C9, C10;
the rest should be caught.
