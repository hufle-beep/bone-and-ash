# P46-A cold review (NF-g, PK, LT), Opus, on the uncommitted tree

## High
**H1. js/core/week.js:260 (foldEarlier) — on Coil 2 and later, Ya's tier beat at `fo_night` gets walked without being shown.** `fo_night` carries Ya's tier beats (romance.js TB_CARRIERS: `ya45:night`, `ya72:night`). The beat paragraph is appended to the night's text, and its flag is set in `enter`. Once a player has read the beat and the base night on an earlier Coil, `readBefore` is true, so the fold walks the screen. The flag still gets set, so the beat is gone for that Coil. I reproduced this in a scratch copy (`/tmp/p46r/beat.mjs`): with `ya_met`, Ya at 50/50 and the text read on Coil 1, Coil 2 gives `foldEarlier true`, `foldNight steps 1`, the scene moves to `fo_morning`, and `tb_ya45` is set. Before this push it stopped (fo_night wasn't on the earlier-day rule, and the text differs from `t.nf`).
- This also happens in hand play with no plan, because main.js:286 `playChoice` → `weekAfter` → `afterStory` → `foldNight` runs after every story tap.
- It undoes RV-A DS. `quietSafe` sees the romance marks change, so the plan stops at `fo_supper` for the player. Then the player taps "Go up to the loft early." and the fold eats the beat anyway.
- **Fix:** `foldEarlier = (g, v) => FOLD_SCENES.has(g.scene) && !romanceNow(g) && (…)`. `romanceNow` is already in week.js:225. Checked in a scratch copy: Coil 2 → `foldEarlier false`, steps 0, and the ordinary folds still walk.

## Medium
**M1. week.js:273 — on Coil 2 and later, a story beat's lead-in screen gets walked and the player lands in the middle of the beat.** Both cases reproduced (`/tmp/p46r/ya.mjs`):
- `fo_morning` on story day 9 without Ya: "Day fifty-one… Someone is walking out of the Blackroot". Its only way on is "Look.", so the fold walks to `ya_arrives`, which opens on "She is tall and rangy…" with no lead-in.
- `fo_night` on day 8 with no palisade ("There is no palisade yet. You lie awake listening to the barley."): the fold walks "Sleep." into `fo_wolf`.

Both used to stop. The "A quiet night: 1 screen seen on an earlier night" entry then sits above Ya's arrival or a wolf fight.
- **Fix (verified on scratch):** for the `foldEarlier` path only (not `t.nf`), walk only when the one way's target (`c.to`, or `c.to(g)`) is in FOLD_SCENES or TASK_HUBS. The ordinary folds still walk: fo_morning → fo_ashfall, fo_night → fo_morning, morning → wilds.
- The owner decides whether `village_morning` (NS1 / NS-b since v0.11.248) gets the same guard.
- Weaker relative: the Old Tree's whispering nights (trio romance progression, rolled) also fold on a later Coil. Measured 0–3 per 100 games, so log only.

## Low
- **L1. js/core/news.js:107** — the line says "goes by under the plan". The fold runs after every story tap (main.js:286) with or without a plan; the Random model, which has no plan, gets 11.2. Reword it, e.g. "…now goes by at once, as the village mornings already did".
- **L2. tools/lib/formlint.mjs `readArg`** — an escape keeps only its letter. `'Big.\n\nThose feet'` becomes "Big.nnThose feet", and `\bthose` never matches (probe: 0 found). 16 `byForm(g,` lines in js/story use `\n`. Fix: `out += ({ n: ' ', r: ' ', t: ' ' })[s[j+1]] ?? s[j+1]`.
- **L3. formlint misses (all false negatives):**
  - `those *feet*` (italics; DEM needs `\s+[a-z]`)
  - irregular plurals ("wolves" → "wolve", knives, leaves)
  - antecedent found as a substring ("footpath" counts as foot, "many" as man)

  Fix: `\s+\*?([a-z]+)`, an `-ves` → `f` rule, and a word-boundary test for the antecedent.
- **L4. tools/packet.mjs:533–534** — the `vals` filter drops any argument equal to a flag value. `packet.mjs night --state night` loses the scene and exits with the usage message (reproduced). Also, a `--state` that matches no state silently prints a packet with no state blocks; a typo looks like "no states". Fix: skip `argv[i+1]` by position, and print `--state "x" matched 0 states`.
- **Known item (one-paragraph texts use the split exact key):** I agree it's separate. If it's fixed by reading the `|=` exact key, keep numbers in. That is what stops `fo_morning`'s "N days to the Elder" from folding on a later day, so the current gap is partly protective there.
- **Old saves:** fine. Missing `g.lines`/`vd` → `shownEarlierDay` false; missing `g.read` → `readBefore` false; missing `g.seen` → `seenBefore` false. Clock, food and flags match a tap (`choose`); `dayKey`/`seqText` counts are noted in `go()` the same way.

## Test gaps
- TG1: No test for a romance beat at a fold scene on a later Coil (H1). Pin that Ya's `fo_night` beat on Coil 2 stops the fold, by hand tap (`afterStory`) and under the plan.
- TG2: No test that a fold scene whose only way leads to a story scene (`ya_arrives`, `fo_wolf`) stops (M1).
- TG3: The P46-A block covers only `fo_night` and `morning`. Dropping `heart_*` (C3) or `fo_morning` (C8) from NF-g passes the suite. Add `heart_night`/`heart_morning` and a multi-paragraph `fo_morning` case (day 9 with Ya here, or the lovers' night).
- TG4: No same-day case. `shownEarlierDay`'s `d < textDay` → `<=` (C2) passes. Show a text, then fold again on the same text day, and assert it stops.
- TG5: The `seenBefore` guard of NS-b (C1) is never isolated. It is nearly equivalent, since `readBefore` already needs earlier-Coil reads; they differ only for a paragraph shared with another scene. Pin that case, or drop the guard on purpose.
- TG6: `stateMatch`'s escaping is untested. `'(b)'` in "a (b) c" matches even unescaped. Use `'a+b'` against "aab" (must be false), or `'night.5'` against "night 5".
- TG7: The text lint's LT line is pinned only by grepping the source. Run textlint (the E1 copy already does) and match `/LT form branches: \d+ of \d+ byForm calls read, \d+ "those \/ these", 0 pointing/`.
- TG8: `readArg` with `\n` escapes (L2) and nested `${f({a:1})}` / `${'}'}` isn't tested. My probe shows the nested and quoted-brace cases are handled; the escape case is wrong.

## Planted faults (tools/mutate.mjs)
NF-g (`/tmp/p46-review-faults.json`, story test at 50 games; report in `/tmp/p46-review-mutate.md`): **4 caught, 4 missed of 8.**
- C1 (NS-b without `seenBefore`): missed. Near-equivalent, see TG5.
- C2 (same day counts as an earlier day): missed (TG4).
- C3 (heart scenes left out of NF-g): missed (TG3).
- C4 (fold walks a one-way check, qi or fail choice): caught.
- C5 (seen on an earlier Coil folds an unread text): caught.
- C6 (any earlier-day text of the scene folds a new text): caught.
- C7 (fold off a stay's days): caught.
- C8 (`fo_morning` left out of NF-g): missed (TG3).

The copies were taken at 01:06–01:07, after the builder's one-second edit at about 01:02, and none looked odd.

Tool faults (`/tmp/p46-review-faults-tools.json`; T1 escaping, T2 trailing boundary, T3 nested `${}` depth, T4 LT count forced to 0, T5 `--state --games`): **not measured.** I stopped the run on the builder's note, since the tools test failed on docs pins while the docs were being edited. Expected from reading the tests: T1 and T4 missed (TG6, TG7), T3 likely missed, T2 and T5 caught.
