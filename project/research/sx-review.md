# Cold review: v0.11.198 (S1, D1, T1), Opus

Read: the diff, the brief, `review-checklist.md`, the packet, drafts, Claude's mutate result; `story.js` `choose` 325–340 and the pools 210–235, `game.js` `partyCarry`, `act1_return.js` 1–200, `act1_heart.js` `ht_leave`, `yuki_path.js` `rt_yk_talk` and the injected `rt_road` label, `walks.js`. Rendered in scratch: the carried and walked paths at realm 1, 2 and 7 (human), and the relationship-crossing cases below (`/tmp/sxr/sim.mjs`). `packet.mjs --check` on the built SX texts and the five lines: 0 tics, 0 runs, 20 pairs (all common), 1 time note ("morning": `rt_start` is always 06:00 by its `enter`, holds).

Flag paths checked and fine: `ht_leave` [0] is the only way into `rt_start` and is a marked walk, so the flag is always fresh there (the Heart's walks before it are overwritten); `rt_start` [1] reaches `rt_road` on `ht_leave`'s value (right: that flight happened); the talk screens and the Yuki walk are not walks and return to `rt_road` without touching it; a reload keeps it (`g.flags`); not in `KEEP_FLAGS`; a card never sets it; a mortal James never sets it and can't have an older true in the same Coil; nothing after the road reads it.

## High
None.

## Medium

**M1. The ST echo survives in ¶1.** `js/story/act1_return.js:20` (`SX.road`): "She steers by pointing" sits directly under the `rt_start` [0] walk's result, which is `CARRY_LINES.great[2]` "*She steers by the ears,* Yuki reports" one time in four with the great ride (seen in the sim, path B). D1's ST took "She steers with…" out of ¶3 for exactly this echo; ¶1 has the same "She steers by". The ST test only greps `SX.great + SX.human` for "steers with".
Fix: "She points out each landing, and you fly it in hops" (my words); extend the ST assert to `!/steers/.test(SX.road + SX.great + SX.human)`.

**M2. A joking Mei Lin right above "Mei Lin is pale and silent".** `js/core/story.js:231` (new yuki line 3) via `js/story/walks.js:61` (`ht_leave` [0], not `quiet`). At realm 1 with Ya along (the yuki pool's state; the cautious bots all leave the Heart at realm 1), the walk out of the Heart draws a yuki line in the result and `rt_start` follows with "Mei Lin is pale and silent, which in her is as loud as shouting." One draw in eight is now "\"Then we're worth the difference,\" she says. Nobody argues." The same walk follows the Heart's hard beats (the log, the grave); "the pool blind to its scene" from the checklist. Fable's own note flagged line 3 as warm.
Fix: mark `ht_leave` [0] `'quiet'` (the calm `[0]` line), or cut line 3's speech; a test that `ht_leave`'s walk line at realm 1 is `QUIET_LINE`'s.

**M3. "Since the tree" after walking from the tree.** `js/story/act1_return.js:26` (`SX.paced`, read at `:186` by `flew`). The flag is the *last* walk's travel, but Ya's sentence speaks for the whole road. Path B in the sim: realm 2, Ya at f 28 → `ht_leave` and `rt_start` walked (both walked texts shown), "Walk with Ya at the front." → "You're not dirt…" lifts her to 32/83 → `rt_road` [2] is carried → `rt_ambush`: "You land on the birch ridge… They've run under us since the tree." A Mei Lin talk (+3 to +6 f) does the same. Reachable whenever a woman is a few points under 30 at the tree.
Fix: keep the original "They've paced us since the tree." under both (it reads for a flight too), or set the carried sentence only when `rt_start`'s walk was carried as well (a second value, e.g. `party_flew = 'all'`).

## Low

**L1. The fallback ¶3 is the great form's.** `js/story/act1_return.js:136`: `partyCarry(g)?.ya === 'human' ? SX.human : SX.great`. When the flag says flown but `partyCarry` now says on foot, `.ya` is undefined and the great line shows. Sim path A: realm 7, human form, Ya at f 31; "Leave Mei Lin alone." drops her to 29 → `rt_road` redraws "Yuki crouches at each landing… *She calls me 'pony',* she tells you" (bond italics, a mount) for a woman in her human form. Rare (realm 7 by Day 19, Ya at 30–31).
Fix: fall back by the form, `(partyCarry(g)?.ya ?? (yukiForm(g) === 'human' ? 'human' : 'great'))`, or store the ride in the flag at the walk.

**L2. A new height fact.** `js/story/act1_return.js:24` (`SX.human`): "a head and more shorter than her cargo". Canon: Yuki is a head shorter than James, Ya "tall and rangy"; "and more" makes Ya taller than James. `CARRY_LINES.human[0]` says only "carries Ya, who is not short".
Fix: "a head shorter than her cargo" (my words).

**L3. A sentence broken across paragraphs.** `js/story/act1_return.js:22`: ¶2 opens "Because parts of her way, by Ya's lights, have to be walked." as the second half of ¶1's "down you all go." (checklist, part 8 T18).
Fix: "Parts of her way, by Ya's lights, have to be walked." (my words).

**L4. "Land" as a family.** Across three consecutive screens: "before the landing is finished" (`rt_start`), "landing to landing" + "at each landing" (`rt_road`), "You land… landing a pace too close" (`rt_ambush`): six uses, two in one sentence on `rt_ambush`.
Fix: "and you, a pace too close behind, walk into her back" (my words).

**L5. "alone" as the pool's refrain.** `js/core/story.js:229–233`: four of the five new lines end their sum on flying "alone" ("By air and alone", "flying it alone", "flying alone", "charged you alone"), as does one of the three old ones; at about 10 draws a game the word repeats most walks. Optional: drop it from one or two.

## Tests (TG)

Mutate: `/tmp/sx/faults-review.json` → `/tmp/sx/mutate-review.md`, `node tools/mutate.mjs … --jobs 2` with the default `tests/story.test.mjs --quick`: **3 caught, 8 missed, 0 not applied (of 11)**; 7 in the new words, 4 on the flag's paths.

- **TG1. SX's words are unpinned (R1, R2, R3, R4, R7 missed).** The SX block compares renders against `SX` itself, so any word change inside `SX.road`, `SX.human`, `SX.paced` or `SX.start` after its first five words passes; only ST/RA/RU and "pony" are pinned. R1 (¶1 "steers by the ears", the M1 echo made worse) passed. Pin a fact or two per text, as the D1 block does for the pools (checklist: pin Claude's cuts and the owner's words).
- **TG2. The five lines' form words are unpinned (R5, R6 missed).** The bond italics turned to quotes (a cat speaking aloud) and "from your shoulder" → "from the path" both passed; RV1 TG2 pins the form words of yuki[1] only. Pin `*Nobody asks the cat to grow,*` and "Yuki says from your shoulder".
- **TG3. The behaviour of two branches is caught only by the code pin (R8, R9).** The ¶3 fallback flipped to human, and Ya's sentence read from the current carry instead of the flag (an old save then hears "run under us"), each failed only P7A's skeleton hash of `act1_return.js`; no behaviour test sees them, and the next deliberate re-pin hides them. Add the L1 and M3 paths (a talk crossing 30 either way, then `rt_road` / `rt_ambush`) and check the old-save `rt_ambush` for `WALKED.paced` too.
- **TG4. SX is outside textlint.** `tools/textlint.mjs` POOLS has no SX entry and no sample state sets `party_flew`, so the carried texts get no tic, reused-run or spacing check in `check.sh` (checklist: new pools join POOLS, as `sky_fw` did). Add `sx: Object.values(SX)`.
- **TG5. Quiet walks and the flag (R11 missed).** Skipping the flag on `quiet` walks passed; harmless today (no reader follows a quiet walk), but "every walk with the women along" is the brief's rule; one case with a `quiet` walk pins it. Low.
- Caught: R10 (a card sets the flag) by "a card leaves it unset".
- No test leftovers seen in the SX block (`flightMinutes` is used once, as a sanity line).
