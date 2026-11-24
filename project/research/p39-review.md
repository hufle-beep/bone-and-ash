# P39-A — cold review (Opus), v0.11.271

Read: the brief, `CLAUDE.md`, both checklists, `git diff` (news.js, fight_tune.js, power.js, story.test.mjs), `prologue.js` 95–140
(`collectorsFight`), `common.js` 60–95 (`grow`, `longStep`), `power.js` 30–100 (`prepare`, `lfScale`, `degreeForChoice`), `music.js`
30–140, `act1_tune.js` `tuneFor`. Ran: `node tests/story.test.mjs --games 2` once (1291852 passed, 0 failed, exit 0); a scratch probe
(`/tmp`, no repo file touched) of the tribute's HP through `startCombat` by growth (forest_day/vday), Gao beaten, realm 1/2, both calendars.

## What checks out
- `hpTuneFor` is the only reader: `HP_TUNE` has no other consumer in `js/`, `tools/` or the bots (grep); `prepare` is the one place HP is
  tuned, and the preview (`degreeForChoice`) goes through the same `prepare` on a copy, so preview and fight agree. HP never enters
  `degreeOf`, so the degree, the stomp posture and the win texts (keyed on degree) are untouched.
- Both tribute entries (`tribute` "Step forward", `bluff_fail` "Fight.") build `collectorsFight`, id `collectors`: both get the factor.
- Realm numbering: `REALM_STEP_NAMES[2]` is Core Formation, so `HIGH_REALM = 2` matches the news line and the comment.
- `(realm || 0)` plus the default parameter cover `undefined`/`null`; `Object.hasOwn` is already used by `act1_tune.js` (no new browser floor).
- Every other fight keeps its factor at every realm (the test's loop over `HP_TUNE` at 0/1/2/5, and an untuned id 1). No save change.
- The tap path is the real one (`choose` + `startCombat`), James's realm alone decides (Yuki crossed both ways). Probe: Lu Han
  14 → 11 (r1) / 10 (r2) at no growth; 17 → 14 / 12 at growth 4; the calendar flag changes nothing for this fight.
- JW-A: `journey.02` is reachable in play (Ya joins unconditionally at the Blackroot, `act1_fallout.js` 858/945/955; a Ya under 30 is a
  player who neglected her), so moving it from the walks' luck to a direct `lineOpen` check is sound; the check pins place, who, step,
  the 29/30 boundary, the party flag and the wrong place.

## Findings
**High:** none.

**Medium:** none.

**Low**
- **L1 — the news line overstates the second foe.** `js/core/news.js:104` says Lu Han *and* Gao Feng (or the disciple) have less health.
  At Gao's base HP the 0.7 factor rounds the same as 0.8: Gao 8 → 6 / 6, beaten 5 → 4 / 4 (3.5 rounds up), the disciple 8 → 6 / 6. Only
  with growth 2+ does the second foe lose one point (9 → 7 / 6; 10 → 8 / 7). True in most real games (growth 2–4 by the tribute), false
  in a fresh-ish one; a word like "mostly Lu Han" or nothing about Gao would be exact. Owner's wording call; no code fault.
- **L2 — the Cultivator's realm is stated three ways.** The brief: "Core Formation, realm 3"; `fight_tune.js:8–10`: "Core Formation at
  the tribute"; `prologue.js:108–110` (P26-A LR): "the Cultivator meets him at True Core". Realm 3 is True Core. The gate at 2 covers both,
  so the measured 32.5% stands, but the comment should say which (and the realm-2 player, who is not a model, is the one the gate's
  exact value decides). Suggest one measured line: the Cultivator's mean realm at the tribute.
- **L3 — the kept realm (v0.11.227) is not measured.** After two won clears every later Coil starts at Core Formation, so the tribute is
  at 0.7 from that Coil's first day. Intended by the rule's wording (by realm), but the `--kept` models block is not in the brief's
  numbers and the news line doesn't say it. Log-only; no target hangs on it.
- **L4 — the target was Coil 1, the change is every Coil.** A Careful/Sociable James who reaches Core Formation before a later Coil's
  tribute now meets 0.7 too. The brief's "Careful unchanged (Act 1 4.96 Coils)" covers it in sum; noting it for the changelog.

## Test gaps
- **TG1 — the second foe is never seen to change.** The P39-A tap path is a fresh game (no growth), where Gao 8 is 6 at both factors, so a
  fault that tunes Lu Han only (planted C4) passes. Add one tap at growth 2+ (`forest_day 3`, `vday 3`: 17/10 > 14/8 at realm 1,
  17/10 > 12/7 at realm 2) and pin both foes.
- **TG2 — JW-A checks the helper, not a screen.** `lineOpen` is called directly; nothing walks a real journey camp screen
  (`bl_camp` / `rt_camp` after 15:00) through `musicLine` with Ya under 30 and sees `journey.02` among the lines drawn. A fault in
  `MUSIC_SCREENS` that moved one camp to `tree`, or a `DEFER` that held the camp, would still pass for this one line (the other camp
  lines in the walks catch a whole-screen fault, not a low-step one). Suggest: a built state on `bl_camp` at 20:00, Ya 26, over a
  handful of text days, assert `journey.02` is drawn at least once (checklist: "a helper the test calls directly hides a scene").
- **TG3 — the tests don't pin the factor on the second tribute entry.** `bluff_fail`'s "Fight." shares `collectorsFight`, so a fault there
  is unlikely, but one tap through it (realm 2) would pin that the bluff path is the same fight.

## Planted faults (`project/research/p39-faults-review.json`, against `node tests/story.test.mjs --games 50 --workers 1`)
| id | fault | expect |
|---|---|---|
| C1 | `HIGH_REALM` 2 → 3 | caught (P39-A RG) |
| C2 | `>=` → `>` | caught (P39-A RG) |
| C3 | Yuki's realm in `prepare` | caught (P39-A, Yuki crossed) |
| C4 | Gao / the disciple kept at 0.8 | **missed** (TG1) |
| C5 | a null realm counts as 2 | caught (null case) |
| C6 | `STEPS.low` ends at 29 | caught (JW-A at 29) |
| C7 | Ya present on the journey without the party flag | caught (JW-A only) |
