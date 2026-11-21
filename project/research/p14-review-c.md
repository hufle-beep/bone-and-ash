# P14 cold review C (code, tools, tests), v0.11.242

Reviewer C, Opus, has not seen the build. Read: the diff, the common and code briefs, both checklists, `lines.js` (`byDay`, `seqText`, `dayIndex`), `ashfall.js` 73–80 and 500–540, `prologue.js` 308–390, `wilds.js` `nightNext`, `week.js` `foldNight` / `FOLD_SCENES`, `textlint.mjs` samples, `packet.mjs` `STATES`. Scratch copy `/tmp/rv-c`. Scripts in `/tmp/rvc-scripts` (a.mjs: the real path and old saves; b.mjs: 5-word runs).

## Verdict
The logic is sound. Both lists are read through generic `% list.length` (`byDay`) and `seqText`. No code assumes the old lengths except stale comments. All six of the forest's template slots are filled, and `byForm` runs cat / great / human in all six. The fire split is right in all six. No `{yuki}` or `{fire}` slot is left over. The tools are where it falls short: no tool or packet renders the six new forest texts.

## Findings

**M1: the review packet and the text lint never draw forest nights 10–15 (or old nights 7–9).** Measured: `/tmp/p14/review-packet.txt` has 0 of the six new forest openers. It has all six new village openers, ×3 each. The packet also has only old forest texts 1 and 3, because `SAMPLES` uses day 0 and day 2 and no `STATES` entry is in the forest. In `textlint.mjs --corpus`, forest texts 1–6 render (×3 each) and texts 7–15 render 0 times. Failure scenario: the text reviewer (B) reads none of NF6 in the packet. `tools/text-baseline.json` moved only `ashfall`, and `prologue` is unchanged, which confirms the new forest words were never linted. A later draft check (`packet.mjs --check`, the lint corpus) cannot find a run reused from forest texts 7–15. The checklist item v0.11.236 C M1 ("grep the packet for every new text's opener") should have caught this before hand-off. I measured the runs myself (b.mjs): 0 five-word runs between texts 10–15 and the other forest texts, and 1 trivial run against another scene ("from home and you leave" ~ `pool:songs`). The content is clean, but the tools did not check it.

**L1: an old save from v0.11.241 mid-week skips texts instead of repeating them** (a.mjs, measured):
- Week 2 with 4 nights noted reads text 5. Text 4 (the beans) is never seen, and text 1 was already shown twice.
- Week 3 with 4 nights noted reads text 5. With 6 noted it reads text 1, and the week ends.
- Forest night 12 reads text 12, so 10 and 11 are skipped. Night 16 reads text 1.

Nothing repeats back to back. A save reloaded on a night already noted redraws with the new text in place of the folded old one. This is acceptable, and the brief does not mention it.

**L2: stale comments.** `ashfall.js` 510 says "the quiet night a sequence of three", and 511 says "weeks 2 and 3 their own three". They should say six.

**L3: the brief lists `sw.js` VERSION 0.11.242, but the working copy is still `bone-ash-0.11.241`.** `tests/news.test.mjs` allows NEXT before the bump, so the full check passes. Claude needs to make sure the bump lands with the docs.

**Note for reviewer T (not a code fault), on the real path walked with `goTo` over 21 long-calendar nights:**
- Text 7 falls on story night 1 (`night_event`).
- Text 14 (the "evening has an order now" / "home" text) falls on story night 2 (`night_event`).
- Night 21 reads text 6 folded, before `night_attack`. Before this push it read text 3.

For the village, week 2's seventh night is the arson (no `seqText` call; the arson's `dayKey` is null). Week 3's seventh, the eve, reads text 1 folded, the same as before (6 % 6 = 0, as 6 % 3 was).

## Checked with nothing found
- `seqText` keys `s:village_night:2` / `:3` are separate from `village_night:quiet` (P10-A TG-C4 test at line 8143 still holds).
- The old calendar is gated by `longCal`.
- `arsonNight` is checked before `seqText`.
- `foldNight` folds only on an identical hash, so the length doesn't matter.
- `FOLD_SCENES` has no `night`.
- In Coils after the first, `L.c !== coilStamp` resets the record, so each Coil starts at text 1.
- `models.test.mjs` "repeated screens" is log-only.
- `textlint` renders village weeks 2–3 at k 0–5 in three forms: new texts ×3.
- `packet.mjs` STATES covers weeks 2–3 for k 0–5.

## Planted faults
Claude's F1–F10 (`p14-faults.json`, story test `--games 2 --workers 1`): **10 caught, 0 missed.**

Mine (`project/research/p14-faults-review-c.json`): **2 caught, 4 missed.**

| Id | Fault | Result |
|---|---|---|
| C1 | forest 15: the great form "draped over your shoulder" (the cat's line) | **missed** |
| C2 | forest 12: `byForm` great and human swapped (the woman washes "one great paw") | **missed** |
| C3 | 2:5: the great form "tucked under your arm" (the cat's line) | **missed** |
| C4 | the old calendar reads the long weeks' lists (the `longCal` gate dropped) | caught (2 failed) |
| C5 | forest 11: the woman "sends along the bond" inside quotes | **missed** |
| C6 | weeks 2 and 3 read the shared `village_night:quiet` count | caught, but only by a crash (`TypeError … 'length'`) in an older test, not by an assert |

## Test gaps
- **TG-C1 (M1):** add a forest `STATES` entry to `packet.mjs` and forest samples to `textlint.mjs` at day indices 3–14, so the packet and the lint draw all fifteen. Test that each forest opener appears in the packet and the corpus (a `tests/tools.test.mjs` pin, as TG-C4 did for FS10). Then save the text baseline again.
- **TG-C2 (C1, C2, C3):** the form tests check only the bond's typography (`*…*` / quotes). They do not check that each branch fits its form. Add form words by branch: the great form never "shoulder" / "under your arm" / "on your chest/knee"; the woman never "paw" / "great"; the cat never "great". Or pin each branch's opener by form, as F6's single pin does for forest 10.
- **TG-C3 (C5):** the forest's human branch is checked for no `*`, but not for no `sends` / "bond". The village test has `!/\bsends\b/`; extend it to the forest's p[1].
- **TG-C4 (C6):** the P14 block builds each week in a fresh game (`week()` makes a fresh game per vday). Walk weeks 1 → 2 → 3 in one game and assert week 2's night 1 is its text 1 and week 3's night 1 is its text 1 (the usual path, TG1). As it stands, C6 is caught only by a crash.
- **TG-C5 (L1):** pin the old-save case: a save with `s:village_night:2` of length 4 reads text 5, and with 3 reads text 4. This turns the skip into a decision on record.
