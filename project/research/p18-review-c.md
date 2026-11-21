# P18-A cold review C (code, tools, tests), v0.11.248

Read: both checklists, the diff, the brief. Worked in `/tmp/rv-c` (a scratch copy). Probes: `/tmp/rv-c-walk.mjs` (20 real mornings with `enter` and `weekMorning`), `/tmp/rv-c-fold.mjs` (the plan's night fold on those mornings, this code and HEAD's), `/tmp/rv-c-lint.mjs` (the lint corpus against the new texts), and a copy without Wen's fifth closers (the pins).

## Verified, no finding
- **VM on a real walk** (long calendar, `long`, vday 1, cal_night 0, `enter` each morning): week 1 = 6 mornings, old / W1a / W1b / old / W1a / W1b. Week 2 = vmW2 ×7. Week 3 = 7 mornings: old / W3a / W3b / W3c / old / W3a, then "The last day." on the 7th (`tributeLeft` 1). The record holds `s:village_morning:1` = days 23–28 and `:3` = 36–41. The last day is not noted, and nothing else reads that key. After a burn, the first and the last week-3 morning carry "still smoking" (vmW3Old), and the three new ones carry their `b` lines.
- **The old calendar:** `enter` raises vday before the text (`weekMorning` is always true), so a morning only ever shows vday 2 or 3: vmW2 and vmW3Old as before. The old-calendar `vmW1Old(g)` arm, which F1 guards, is a dead branch (L1).
- **An old save mid-week:** the first morning after loading shows the old text again (index 0). VF folds it, since it was seen on an earlier day. The new texts follow. A save resting on the screen redraws the same old text.
- **VF / SD:** the cycle's repeats fold (VF key = text hash, numbers aside). A form change on the same day keeps the index.
- **LC1:** ROOF_BURNED[i] is used for i 0–2, against `dayIndex(s:roofKey) % ROOF_W3.length`, the index the roof's text has just noted. For i ≥ 3 the `||` falls back to ROOF_STAY[3][i]. `lineWords` is used in both of `musicLine`'s paths, and `fillRefs` runs on its result in both. Apart from the lint, nothing reads `MUSIC_LINES[..].text` in `js/`. The CM2 tests read `x.text` only (TG-C5).
- **HK:** `AW.hawks_won` has 5 entries (all `any`) against a list of 5. The away rule is Ashen Hills only, so rr_hunt's 4th is not affected.
- **WT:** `pickLine` keeps a grown pool's counts and puts the new line at 0, so a save that drew [1,1,1,1] from four gets the fifth next. The stored `wen_time_close` indices 0–3 keep their texts, since the new lines are appended.
- **The re-pinned hashes:** with Wen's two fifth closers taken out of this build, all six PR2 / VQ1 runs hash exactly as HEAD's pins (48a83427, bbe86a86, 8f2cba54, b5422cdf, 270a69c0, 61764e76). So Wen's closer is the only change that moves them.

## Findings

**M1: the week plan now stops on every morning of weeks 1 and 3, and 5 of those stops are on a text already read.** `foldNight` (R3) walks a morning only when its hash equals the one text last shown on that screen (`t.nf[scene]`). A sequence never equals the morning before, including when it comes round again. Measured on the same 20-morning walk:
- HEAD: 4 stops (week 1's first, week 2's first, week 3's first, the last day).
- This build: 14 stops (all of week 1, week 2's first, all of week 3).

That is +10 stops a Coil in plan play: 5 to show a new text (intended by R3) and 5 on texts already read this Coil (week 1's mornings 4–6, week 3's 5–6). The VF fold only trims those five to one paragraph; each is still a tap. The stop is `evening`, so the plan goes on after the tap, and nothing is lost but the tap. No pin catches it, because the plan runs never reach a village morning in weeks 1 or 3.

Fix (code, for a pick): let `foldNight` walk a screen whose hash is already in the Coil's VF record (`lines.vd`, keyed by scene and text) from an earlier day, as R3's own comment says ("the one it showed on an earlier night of this Coil"), and not only the last one. That turns the 5 re-read stops into 0 and keeps the 5 new-text stops. Check whether wrapping sequences in `fo_morning`, `morning` and `heart_morning` have the same cost.

**L1: a dead branch with a test on it.** On the old calendar, `village_morning`'s text never sees vday 1 (it is raised in `enter`). `: vmW1Old(g)` is unreachable in real play. The P18-A "old calendar" assert sets vday 1 by hand, which is a faked state (checklist, v0.11.235 C M1). It is harmless. Either pin the reachable state (a walked morning shows vmW2), or say in the test that this is a guard.

**L2 (texts, existing before this push, for review T):** after a burn, the last day's full text (vmW3Old) still says "What is left of the loft is still smoking a little." That is six days after the fire, in a loft LC1 now has him sleeping in. The 5th morning shows the same line, but it is folded.

**Note:** in `mutate`'s first `tools.test.mjs` run, the base run on the unplanted copy failed (557 passed, 2 failed). Two later runs passed (559 / 0). It is likely timing, with the other review running beside this one. Not reproduced.

## Planted faults (`mutate.mjs`)
Claude's F1–F10, run with `story.test --games 2`:
- Caught (8): F1–F5 and F7–F9.
- Missed by the story test: **F6** (a redraw shows the unburned line) and F10.
- F10, run with `tests/tools.test.mjs`: caught by E1's snapshot only (the lint's counts, "4 changed"). Any change to the lint's pools trips that check; it does not check what F10 broke.

Mine, in `p18-faults-review-c.json`:

| Fault | What it breaks | story.test | tools.test |
|---|---|---|---|
| C1 | week 3 shares week 1's key `village_morning:1`: in a real game week 3 starts at index 6 % 4 = 2, so the "still smoking" morning after the fire is skipped | missed | – |
| C2 | `musicLine`'s first draw returns `list[i].text` | missed | – |
| C3 | a slot typo in `burned` (`{ref:the_hobit}`) | missed | caught |
| C4 | `vmText` also gives the burned line when `night5_done` is set (a won arson) | missed | – |
| C5 | `tributeLeft > 2` (the 6th day drops to the old text) | missed | – |

Totals:
- Story test: Claude's 8 / 10, mine 0 / 5.
- With the tools test: Claude's 10 / 10 (F10 only through the snapshot), mine 1 / 5.

## Test gaps
- **TG-C1 (C1):** the VM test renders each week in a fresh game, so the two keys are never in one record. Walk weeks 1 → 3 in one game through `enter` (as `/tmp/rv-c-walk.mjs` does). Assert that week 3's first morning is "The last week." and its 7th "The last day.", and that `s:village_morning:1` and `:3` both exist.
- **TG-C2 (F6, C2):** nothing calls `musicLine` after a burn. Draw `ashfall.07` on a burned week-3 `village_night`, on an archive day with the other archive line used, then redraw with `newVisit: false`. Assert /scorched/ both times.
- **TG-C3 (C4):** week 3's mornings are tested without `night5_done`, a state no real game reaches. Render the unburned ones with `night5_done` + `arson_beaten`, and assert no `b` line ("scorched").
- **TG-C4 (C5):** test cal_night 5 (`tributeLeft` 2: still the sequence) next to 6 (the old text), not only 1 and 6.
- **TG-C5 (C3, checklist TG4):** the lint corpus never renders a burned state. VM_W3's three `b` lines ("Behind you the scorched loft…", "Soot from…", "These shutters…") and ROOF_BURNED ×3 are unread. Measured now: no tics, and the `b` lines share no 5-word run with the corpus. ROOF_BURNED shares 26–35 runs, by design, with its unburned twins. Also, the story test's CM2 edition checks (slot rules, the general edition) read `x.text` only. Add a burned week-3 sample (mornings and roof) to the lint, and let CM2 read `burned`.
- **TG-C6 (M1):** pin the plan's night-fold stops over weeks 1–3 (a count, as measured above), so a change in the fold or the sequences shows up.
