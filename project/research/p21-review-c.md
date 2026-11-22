# P21-E cold review C (code, save, tools, tests), v0.11.251

Reviewer C (Opus). I read the diff, the two checklists, and the scenes around each change, in a scratch copy (`/tmp/rv-c`; HEAD in `/tmp/rv-c-head`). I measured with small scripts and the tasks bots (150 games, old calendar, HEAD against new). My faults are in `/tmp/rv-c/faults-c.json` (C1–C10).

## High
None.

## Medium
**M1 (MT, save): an old save on `collectors_won` gets the Village gain twice.** The old `enter` already ran there (ending 'fought', Village +25, the cores). The screen now offers the three ways, and `collectors_sent`'s enter adds +25 again. Measured: Village 25 → 50 on "Send him home". The bluff would come to +45 and the pin to +37. `lu_won` is unset, so the speech falls back to `SENT[1]` (fine). Failure scenario: a player saves on the old victory screen, updates, and taps on. Fix: in `collectors_sent.enter` (and `bluff_win`/`tribute_paid`, if wanted), skip the gain when `g.flags.lu_won` is unset and `ending === 'fought'`, or migrate the save.

**M2 (NT): the one-move finish gives Yuki fight XP under the net.** `instantWin` uses `yukiSitsOut(g, e)`, which ignores `e.net`. Measured on the tribute's one-move finish (GU T9): Yuki Fight T1 L1 → L2 (+50), and the same lines show the net text. That breaks "Yuki never strikes and gets no fight XP". Test 99942 checks only the net line. Fix: `yukiSitsOut(g, e) || e.net` in `instantWin`.

**M3 (old calendar, the full check): sanity will flag drift on the tribute rows.** The old calendar takes MT, TK, GS, FM, NT and JR. I ran the tasks bots, 150 games each, HEAD → new:
- tribute per Coil, won: C2 20 → 0%, C3 33 → 0%, C4 39 → 22%, C5 43 → 45%, C6 35 → 57%
- tribute lost: C3 45 → 100%
- paid: 0% on every Coil (see L1)
- `inc:collectors:smart`: 31 → 42%
- Act 1 reached by `a1_end`: 74 → 56 of 150. Act 1's Coil 1–3 rows vanish (from 1 / 5 / 38 coils to 0).

Against `tools/baseline.json` (C3 won 27.1, lost 55.7, n 192), these rows go past ±20. The brief shows only long-calendar numbers. Per rule 2, the owner needs these old-calendar numbers before any `--update`.

**M4 (Act 1 reads `ending`): after the same won fight, the bluff and the pin are worth 2 points at Shen Qiu.** `act1_return.js:699` gives +1 for 'paid'/'bluff' and −1 for 'fought'. Every ending now comes after beating Lu Han, so tapping the bluff (4 Qi) or the pin (8 Qi; it passes as "partly" from ratio 0.5, see L2) swings the DC 9 check by 2 over "Send him home". The +25 against +20/+12 Village is the only cost. Shen Qiu's line "He knows you bled his disciples" (`:695`) now shows only for 'fought', yet the fight happened in all three. Also `luHanHere` / `luHere` (`ending !== 'fought'`) bring Lu Han back in Act 1 after he was beaten. This is a design or canon question for the owner, not a crash. Reviewer T may judge the texts.

## Low
- **L1 (bots' counters):** `TRIBUTE_OUT` (models, tasks) counts the first of `collectors_won` / `bluff_win` / `tribute_paid` reached. `collectors_won` now always comes first, so 'paid' is 0 by construction and the pins count as 'won'. The sanity rows "tribute Cn paid" (baseline up to 19.8%) go dead. The tasks log still says "bots rewind a lost tribute up to Coil 3" (`tasks.test.mjs:4531`), and so does `models.test.mjs:43–44`. `mem.tribLost` is now only incremented, never read.
- **L2 (the pin, older behaviour now after the fight):** at ratio ≥ 0.5 the pin's failure counts as a partial success, because `gives(c)` sees the hairpin. CU 2 against DC 3 lands on `tribute_paid` with "A thin haul — you keep: +1 Wraithbone hairpin." under a text that calls it flawless. A crit doubles the haul: at CU T3 L1 (8.5 against DC 3) one hairpin stays in the hammerspace after `tribute_paid` takes one. Measured T1 L1–L5: fail; T1 L8: partly; T2: success; T3: double.
- **L3 (WP):** the familiarity line ("…, 35 rounds in… +0.5 to hit") fires inside the tribute. Outside it the same 35 rounds give 0, and the line fires again at 50, so the bonus is announced twice. The FAQ explains it.
- **L4 (LH and the militia):** `longStep` runs after the militia's cut and before `HP_TUNE`, so the cut scales with the step. Lu Han's raw HP on the long calendar is 19 / 17 / 14 / 11 for militia 0 / 1 / 2 / 2+spears, prepared 15 / 14 / 11 / 9; on the old calendar raw 14 / 12 / 10 / 8, prepared 11 / 10 / 8 / 6. The floor of 6 becomes 8 raw. Proportional, so fine, if intended. DC and atk get quarter points (7.25, 9.125). `noDiceDc` rounds to 0.1, so nothing breaks.
- **L5 (DG):** `tools/baseline-long.json` does not exist, so every full check logs "no baseline yet". The only way to write it is `--update`, which also rewrites the main baseline, so a long baseline can't be saved alone. Without `--long`, nothing is printed (fine). An old or partial JSON shape is safe through `?.` / `|| {}`, but an Act 1 row without `taken` gives `v: NaN`.
- **L6 (NT, an old mid-fight save):** a tribute fight saved before this build has no `netted`, so Yuki fights it out. Harmless.
- **L7 (JR):** the `hedge` form (T1 L8) no longer gates any story choice. The label "Bone wall…" now hangs on the form named "spikes (a pit, a few stakes)".
- **L8 (sw.js):** `VERSION` is still `bone-ash-0.11.250` (only FILES gained `tribute_texts.js`). Bump it at push time (rule 7).

Checked and fine:
- `lu_won` by a real fight (degree 1 → 1, degree 3 → 3), by the one-move finish (3), and after a rewind (world flag, reset).
- An old save on `tribute` (the fight only) or on `bluff_fail` (fight → `collectors_won`; a second bluff is offered, `tribute_fail` read only there).
- An old save on `collectors_lost` with a Coil (the bite only) or without `g.coil` ("Get up.").
- `coil_end` why 'tribute' (no dead end).
- `NO_MEMORY`: no other reader. `fightAdapt` / `learnedSoFar`: cap 6.5 for the tribute only.
- The memory line's text, the realm count (Foundation = 1), Yuki's HP (Lu Han has no `prefersSmall`), and the fold records (new text hashes, a new scene id; no leak).

## Test gaps
- **TG-C1:** no test of an old save on `collectors_won` with its enter already run (M1).
- **TG-C2:** the one-move finish under the net doesn't assert Yuki's XP (M2).
- **TG-C3:** the pin's success case (CU T9) is a double haul and leaves a hairpin. The test doesn't check `inventory.hairpin` after a success (C10 missed).
- **TG-C4:** the post-fight bluff's DC and Qi, the pin's Qi, and `bluffBonus`'s sign are unpinned. The tests use T9 / T1 extremes (C2, C3, C4 missed).
- **TG-C5:** the one-move test checks `includes(TT.net.cat)` only, not the order or the RR line (C6 missed).
- **TG-C6:** the FAQ's tribute numbers are not tested against `FOE_MEMORY_OF` (C9 missed).
- **TG-C7:** the "(under the net)" tag has no source pin (C1 missed). Browser-only, so it can't be measured in a mutate copy.
- **TG-C8:** the coverage walks: the 300 epilogue walks take 'fought'/'bluff' only. 'paid' Act 1 openers and the old-save 'lost' go through the music test's quarter only. Tasks-bot Act 1 reach is down a quarter (M3), so a 1000-game full run may lose Act 1 coverage. Watch the full check's coverage lines.

## My faults (tools/mutate.mjs; `story --quick && tasks --games 20 && faq`)
3 caught, 7 missed, of 10:
- **Caught:** C5 (WP 35 in every fight), C7 (every people fight nets Yuki), C8 (no `SENT[1]` fallback).
- **Missed:** C1 (net tag, UI), C2 (bluff DC 7 → 5), C3 (pin Qi 8 → 2), C4 (`bluffBonus` sign), C6 (one-move tail cut), C9 (FAQ step), C10 (two hairpins).

Report table: `/tmp/rv-c-scripts/mut.md`.
