# Cold review — v0.11.191 (Y1, D1): Yuki asks every Coil

Read: `git diff`, the brief, the checklist, Fable's brief and notes, and excerpts of yuki_path.js, prologue.js, longforest.js, yuki_time.js, coil.js and again.js. I ran probes in a scratch copy (`/tmp/ykr/s`, `/tmp/ykr/probe/*.mjs`). Baseline in scratch: `story.test --quick` 4,672,494 passed, 0 failed; `tasks.test --games 20` 24,502 passed. `check.sh quick` can't run in a copy without `.git` (consistency.mjs calls git). `packet.mjs --check` on the 8 texts + 2 result lines as built: tic 0, run 0, pair 42, time 6 (Again / again / already: fine on every day).

## H

**H1. The Long Forest's seasons give her the human shape without the question, and then her daily scene says "You said not yet".** prologue.js:1190 (`Withdraw for a season`) → `lfSeason` sets `yuki.realm` directly and returns to `lf_hub`. There's no breakthrough scene, so `ykAskNow` (yuki_path.js:27) is never read. `lf_hub`'s "Yuki has gone very still" choice (longforest.js:267) needs `!yuki_human_seen`, which is kept. The Long Forest only opens on prologue Coil 2+ (`lfOpen`), and seasons are how you climb there, so this is the usual later-Coil Long Forest path.
Probe (`probe/lf.mjs`: Coil 2, `yk_last: 'sister'`, seasons to realm 8): no question; `ykAskNow` true, nothing routes. With her switched to human, `ykAskOpen` (yuki_path.js:123) holds through `|| g.flags.yuki_human_seen`. "Keep Yuki company." then offers "Answer the question Yuki asked you." → `yk_choice_again`: *"You said not yet," she says. "I've been patient."* That's false: she hasn't asked this Coil, and last Coil he said family.
The same thing happens in Act 1 when the snapshot has her human with no answer (crossing after a season climb; `probe/snap.mjs`: `ykAskOpen` true). The next breakthrough there then opens Q-wait ("it has taken me until now to grow a voice back") although she has been human since dawn. With no breakthrough left (realm 14) she never asks.
Fix:
- (a) In the Long Forest, add a hub choice like longforest.js:267 that shows on `ykAskNow(g)` and goes to `yk_choice` (set `yk_back = 'lf_hub'`). F's James line "Since the breakthrough." (yuki_path.js:91) must then go, or become "Since the season turned."
- (b) `ykAskOpen`: replace `|| g.flags.yuki_human_seen` with `|| (g.flags.yuki_human_seen && !ykLast(g))`, so the reopen needs a "Not yet" from this Coil.
- (c) For a snapshot with her human: ask at the Coil's first hub (`ykAskNow` from the dawn screen), not at a later breakthrough.
- Also fix news.js:46, which says she asks "after your Nascent Soul breakthrough, or by the Long Forest's fire".

## M

**M1. A snapshot with her human keeps its answer, so she never asks again on any Act 1 rewind from it.** coil.js:143 keeps `yk_path` when `yukiForms(base)` has human. That is the case for an Act 1 crossed after she was asked by the Long Forest's fire (the first time ever, longforest.js:267 → `yuki_human_after` → `yk_choice`). From then on, every act rewind restores the prologue's answer: `ykAskNow` and `ykAskOpen` stay false, and the answer is frozen as before the push. That's the opposite of the owner's "every Coil". The brief made this choice, but the Sitter can't measure it (bots never reach realm 7 in the prologue).
Fix: always drop `yk_path` / `yk_wait` from `base`, fold the snapshot's answer into `last` when the Coil has none, and ask at the first hub as in H1 (c).

**M2. A last "Not yet" reads the first answer texts, and those claim it's the first time.** `ykLaterAnswer` returns null for `'wait'` (yuki_path.js:100). Last Coil she was human and asked, so these lines are false:
- YK_HERE.sister: "having not had one before" (a finger)
- YK_HERE.lover: "not once did it occur to you that she'd have hands", "never heard with your ears"
- the fire's `yk_lover`: "it never crossed your mind that the warmth would come with fingers", "your ears have never had", "I've waited forty years" (where an earlier Coil may have been "more")

Fix: also keep the last non-wait answer (a kept `yk_said`: 'sister' | 'lover'). After a wait, choose same or changed by it. If he has never answered, use a short wait-variant pair (Fable) with no first-time claims.

**M3. Fable's cat-shape path texts are now dead for new saves.** `ykSister` / `ykLover` now need an answer this Coil, which needs her human shape (realm ≥ 7, `ykHuman` true). These branches can't be reached any more:
- `SIS_TALK_BOND` ×4 (yuki_path.js:29) and `SIS_TALK_BOND_GREAT` (:52), used only when `!ykHuman` (:286–287)
- `lf_exit`'s sister-and-cat A5 (:470)
- `rt_evening`'s lover-not-human (:540, empty)

Only an old save mid-Coil reaches them. They were written for exactly the later-Coil-before-Nascent-Soul case this push removes.
Fix: either gate the two bond-only sister texts on the remembered answer before she asks (`!ykHuman(g) && (ykSister(g) || g.flags.yk_last === 'sister')`; it's the bond teasing about his love life, not this Coil's answer), or retire them as old-save-only and list them for leftovers.

## L

- **L1. Posture by the fire** (yuki_path.js:95–97). A-lover-same: "She goes up on her toes". A-lover-changed and A-sister-changed: "steps close" / "steps in". By the fire F has her kneeling, and the label is "Reach across the fire for her hand." Fix: "She leans in." / "She comes closer."
- **L2. "The terms stand as they were."** (A-sister-same, :93) Terms exist only if the away-from-fire first sister scene was seen. The fire version says "Rules", and a family answer given only through `sister.changed` set none. Fix: "The arrangement stands", or Fable's own cut ("One note: you chew too loudly…").
- **L3. Later fire scenes come at any hour of a continuing stay.** The title "The Last Fire" (:139), the labels "Sleep. Tomorrow, the smoke." / "Let her sleep. Tomorrow, the smoke." and the sister result "on your chest" all assume the last night before leaving. On a later Coil (a Meditate breakthrough on `lf_hub`, and after H1 (a) the season route too), the stay goes on and James is back at `lf_hub`. This was already true of the first ask, but now it happens on every whole-game Coil. Fix: when `ykLast`, title "The Fire" and labels without "Tomorrow, the smoke".
- **L4. Not yet again.** After Q-wait, "Not yet" prints `notYetResult` ("trying the words for weight", "I'll remember where we stopped"), which reads as the first time. Fix: a later variant when `ykLast(g) === 'wait'`.
- **L5. Coil 1's result line, already wrong before this push.** After `yuki_human_after`'s "Promise. No occasion." (cat), `ykFormBack` makes her a cat, but the line still says "She stays as she is". The new RL condition `ykLast(g) &&` keeps it wrong on Coil 1. Open, options later (out of the pick's scope).
- **L6. Folding (check that it's intended).** `yk_choice`, `yk_sister_here` and `yk_lover_here` aren't in `OUTCOME_SCENES`. From the third Coil with the same answer, her "I remember" speech folds to its first paragraph under a memory line. The one-choice answer scene can be walked by "Skip to the next choice".

## Planted faults (`/tmp/ykr/faults.json`, `/tmp/ykr/mutate.md`; default cmd `story.test --quick`): 12 caught, 6 missed of 18

Caught:
- P1: `yk_last` not set
- P2: the older answer wins in `ykLastOf`
- P3: the snapshot test reads `g`, not `base`
- P4: only `yk_path` dropped
- P5: asks again after "Not yet"
- P6: asks below Nascent Soul
- P7: no later Q away from the fire
- P8: wait reads the changed text
- P9: Coil 1's lover result gets RL
- P10: the fire's lover not wrapped
- P11: no later ask by the fire
- T1: "tonight" in A-lover-same

Missed:
- T2: "by the stove" in A-lover-changed (a place in a place-neutral text)
- T3: the tic "For a long moment" in Q-lover
- T4: "hops down off your shoulder" in Q-sister (breaks for the great root-kin)
- T5: "until Mei Lin and Ya are out of earshot" (names the women where James may be alone, or in the Long Forest)
- T6: "her collar comes undone" in A-lover-same (past the kiss limit)
- T7: speech added to RL's sister line

## TG

- **TG1:** No test of the season route (H1). Add one: Coil 2, `yk_last`, seasons to 7 on `lf_hub` → the question comes. `yk_time` in human form with no "Not yet" this Coil must not offer `yk_choice_again`.
- **TG2:** No test of a snapshot with her human and no answer, or with the prologue's answer (H1 c, M1). Assert she is asked on the act rewind.
- **TG3:** `YK_LATER` and `YK_LATER_RESULT` aren't in textlint's `POOLS` (tools/textlint.mjs:123). The render states of textlint and lint set `yk_path` but never `yk_last` (textlint.mjs:44, lint.mjs:21), so tics, reused runs and broken text in the 8 texts go unchecked (T3 missed). Add a `yk_later` pool and a render state with `yk_last`.
- **TG4:** The place-neutral check is `fire|camp` only (T2 missed). Ban a hub and place list in A texts: stove, hearth, loft, grove, stream, water, road, tree, hut, bench.
- **TG5:** Forms. Q texts follow cat or great root-kin: ban `shoulder|eleven pounds|small` in Q (T4).
- **TG6:** Ban local names (Mei Lin, Ya, Wen) in Q, F and A (T5). The Long Forest and lone hubs have nobody.
- **TG7:** Pin the kiss limit. Pin "The kiss is brief and exact" and ban undress words in the A-lover texts (T6).
- **TG8:** Run `YK_LATER_RESULT` through `splitLine` and assert there's no quote (T7). As built, `splitLine` gives the whole line as the reply and gain '' for both: fine.
- **TG9:** Nothing pins the first-time claims shown after a last "Not yet" (M2). Assert that the texts shown on a later Coil after a wait contain none of "having not had", "not once did it occur", "never heard with your ears".
- **TG10:** Nothing marks the dead texts (M3). Add a reachability assert, or a DEAD list entry, for `SIS_TALK_BOND*` and `lf_exit` A5 on a new save.
