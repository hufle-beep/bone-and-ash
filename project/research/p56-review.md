# P56-A + WL-d: the cold review (Opus, v0.11.288)

Read: the diff, CLAUDE.md, both checklists, excerpts around every hook. Ran: `node tests/archive.test.mjs` (104 passed, 0 failed),
`tools/mutate.mjs` on my 6 faults against it (4 caught, 2 missed), and small probes in /tmp. I did not run the story test.

## What checks out
- **WH-n:** `remember` runs only at the top of `rewind` (its only caller is coil_scenes `bite`). "Not yet" (coil_end :96), the a1_end
  "Not yet", the James tab's bite (main.js 1295), tasks.js 323 and plan clones all reach `endCoil` without `remember`, so a find never
  counts in its own Coil. `base.coil = { ...c }` carries `known` through act and whole-game rewinds; `startActCoil` copies it
  (game.js 149); `threadsKept`, `liftKept`, `histClose`, tools/ and tests/lib never read `known`. All 13 `INSIGHT_KIND` flags are in
  REMEMBER or KNOW_TEXT, and only those. Old saves: a missing `known` gives 0 and `remember` creates it.
- **Hooks:** the only `hitDamage` calls on James are the round (1488) and the flee (1631), both wrapped; Yuki's (1478) isn't, as picked.
  The tenths go through the shield soak, `Math.floor(dmg / 2)` and ×2 cleanly; HP is printed with `n1`. `fedPerHour` is the only drain
  (advance, sleep, the bar); forecasts run on clones. sanity.mjs's sit invariant runs on a fresh game (`known` empty), so it holds.
- **Words:** Coil screen singular/plural, the Fed bar's cap note (only past 50%), the FAQ numbers from the constants, What's new.
- **WL-d:** return.02 is checked directly with both bounds (29/30, 79/80) and the place; reads right.

## Findings
**High:** none.

**M1 — two sit cards miss the 'sit' Insights.** act1_blackroot.js:11 `rootGain` ("Cultivate on the root") and longforest.js:479
(the seclusion's `condensationSatGain`) write Saturation directly, not through `sitGain`. With 4 sit Insights the Archive says
"+60% Saturation a sit", but the root still gives `ROOT_SAT / satDiv` and a seclusion its old amount. It is the same kind of fault as
the checklist's v0.11.207 M1. The pick named `sitGain`, so it's an owner call: put both under the part, or reword the Archive as
"a sit in Meditate".

**L1 — Yuki gets the 'xp' Insights too.** game.js:374: `yShare = floor(pool / 2)` comes from the raised pool, so "Yuki (bond) Qi Use"
gains +15% to +30% as well. The Archive, FAQ and What's new say "James's skill XP". Either name her in the words or take her share
before the factor.

**L2 — the Archive's Fed words.** archive.js:116 always says "With the marks, Fed drains N% slower (50% at most)". Probe with 0 marks
and 1 Fed Insight: "With the marks, Fed drains 15% slower (50% at most)." It says "the marks" when there are none, and gives the cap
when it isn't reached (the Fed bar shows the cap only past 50%). The heading under it, "Coil marks: n · Fed drains X% slower", gives
a second, marks-only %, so the page shows two different "Fed drains" numbers. With no Insight held, the note reads the same rule
twice: "None counts yet: an Insight counts from the Coil after the one that found it. Each Insight counts from the Coil after it is
found; …".

**L3 — the FAQ's direction.** faq.js:45: "each Insight gives 15% to one thing …: a foe's blow on James". This reads as +15% to the
blow. Use the Archive's signs ("15% off a foe's blow, 15% more Saturation a sit, 15% off Fed's drain, 15% more skill XP").

**L4 — float rounding against exact arithmetic** (checklist, v0.11.207). `insightBlow`: with 1 Insight, 14 of the 201 blows from
0 to 200 come out 0.1 low (13 → 11.0, exact 11.05 → 11.1). `sitGain(g, 2)` at realm 0 with 1 sit Insight gives 5.7 (exact 5.75 → 5.8).
Repeated tenths also leave noise in `james.hp` (20 − 4.3 − 4.3 = 11.399999…). It is only shown through `n1`, but a stored HP now
carries noise without a shield too. Fix: round the products in integers (`Math.round(dmg * (100 − 15n)) / 100`, then to tenths)
and `t1` the HP write.

**L5 — an old save on the Coil screen, or after its "Not yet".** Its `known` already holds this Coil's finds (from the old
`endCoil`), so they count for the rest of that one Coil, and the Coil screen shows `fresh` 0. This is a one-Coil transition and
matches SV ("as it is"). It is noted only so the owner isn't surprised.

**Note (in the pick, not a finding):** fixed story damage from beasts in `failDo` or `enter` (wilds.js 157 "the quicker one reaches
your ankle", ashfall.js 680 "something in the mire bites you", the crab) doesn't go through `insightBlow`. The pick named the round
and the flee only.

## Test gaps
- **TG1:** the blow hooks are pinned by source regex only; no fight round is walked with blow Insights (full, half-landed, big
  blow, shield, flee). C3 (a big blow skipping the part, with the pinned line intact) passed.
- **TG2:** nothing in archive.test carries `known` across `startActCoil`; C4 (Act 1 forgets every Insight) passed. Old saves are
  tested only with `known` missing, not with an old pre-filled `known` on the Coil screen (L5).
- **TG3:** the XP check is only "more": the ×1.3 isn't pinned, nor Yuki's share (L1). The sit check is realm 0, one sit only:
  there is no `sitGain(g, 2)` (grove, hollow), no long-calendar floor, and the root and the seclusion aren't covered (M1).
- **TG4:** H pins the Archive's power line as built, "With the marks … (50% at most)" at 0 marks included (L2). `fedInsightLine`
  exactly at 50% isn't tested.
- **TG5:** C1 was caught by a TypeError in B (`rep.known` mismatch → `.line` of undefined), not by an assertion. Give B's
  after-the-rewind step its own assert first.

## Planted faults (`p56-faults-review.json`, measured against `node tests/archive.test.mjs`)
| id | what | expected | measured |
|---|---|---|---|
| C1 | rewind drops `remember` | caught | caught (crash) |
| C2 | `endCoil` remembers again (WH-n reverted) | caught | caught, 5 fails |
| C3 | big blow bypasses the part | missed | missed |
| C4 | `startActCoil` forgets `known` | missed | missed |
| C5 | `fresh` counts remembered finds | caught | caught, 2 fails |
| C6 | Archive `held: true` | caught | caught, 1 fail |
