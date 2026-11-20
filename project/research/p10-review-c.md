# P10-A cold review C (code, tools, tests), v0.11.237

Reviewer C (Opus), not seen the build. Read: the diff, the two briefs, both checklists, the packet (`/tmp/p10/review-packet.txt`), `again.js` / `lines.js` / `week.js` / `calendar.js` by line range. Experiments in a scratch copy (`/tmp/rv-c`). Runs: Claude's faults and mine through `tools/mutate.mjs` (`node tests/story.test.mjs --games 2 --workers 1`, `--jobs 1`). I also walked one real long-calendar game.

**Totals: H 0, M 0, L 3; test gaps TG-C1 to TG-C5; faults: Claude's 12 of 13 caught, mine 3 of 7 caught (all 3 were controls).**

## High
None.

## Medium
None.

## Low
- **L1. Week 3's new nights in a burned loft.** If James loses the arson fight (`arson_lost`), `loft_burned` is set and he sleeps in the kitchen. The vday 3 morning then says "What is left of the loft is still smoking a little", and `house_time` has `-burned` variants. But every week-3 quiet text puts him in the loft: "You lie in the dark over the dried herbs", the ladder's foot, Yuki across the head of the ladder. The scene's `place` still says "the herb loft". The old texts had the same gap on week 3 since v0.11.203. The new ones were written for the week right after the arson, so the gap now shows in six nights written for that week. This state is rare: 0 of 40 games lost the fight in a simple-policy walk. Open, options later.
- **L2. One extra full camp text after the update, for saves mid-Blackroot.** Before HS1, `bl_camp` did not fold by sentence, so VF recorded it under the paragraph key (`id|lineKey(…)`). Now it folds by sentence and VF reads the exact key (`id|=paraKey(story)`). The old records no longer match. On a v0.11.236 save, each camp text already shown on an earlier day shows in full one more time, then folds as normal. This happens once per save.
- **L3. `quietY` uses `String.replace` with a string as the replacement.** In that form `$&`, `` $` ``, `$'` and `$$` are expanded. A Yuki passage containing `$'` would paste the rest of the shared text into the screen. Today 0 of the 18 passages contain `$`, so nothing breaks now. A function replacement (`() => cat`) or `split('{yuki}').join(cat)` would make this safe.

## Checked, no finding
- **The gate `longCal(g) && QUIET_WEEK[vday(g)]`:**
  - vday 4 never reaches `village_night`: week 3's seventh evening goes to `evening` (`nextEvening`).
  - The arson night is never noted on `s:village_night:2`.
  - The old calendar shows only vday 1 (quiet) and vday 2 (the arson).
- **`dayKey` is still `village_night:quiet`:** only `story.js:130` notes it, and that key is read only in week 1, so the extra week 2–3 entries do nothing.
- **`seqText` notes the day on every text call:** the note is idempotent per text day. The dry runs work on copies (`probeClone`, `skipPlan`). The textlint `onDay` proxy already holds today. The packet states are fine.
- **One real game walked** (seed 12, `cal: 7`, the saves test's policy, `againView` on every screen):
  - Week 1: the old three ×7.
  - Week 2: the new texts 0,1,2,0,1,2 on days 29–34.
  - The arson on day 36 at 01:03 (text day 35, noted on neither quiet key).
  - Week 3: 0,1,2,0,1,2 on days 36–41.
  - VF folds from the fourth night of each week.
  - The record: `s:village_night:2` [29…34], `s:village_night:3` [36…41].
- **HS1:**
  - `state` is set on every fold path (memory, SV, SD, VF) and is `''` on `whole`.
  - `all` draws `v.text`, which is the same as `first` + `rest` for a fold that isn't split, with the stock in its own place.
  - `bl_camp` is the only foldable scene with a `STATE_PARA` paragraph. The other `pantry()` texts are task hubs, or the wilds' "By now…" line, which has the stock mid-paragraph.
  - All 9 camp stories have 2–5 sentences and no quotes, so `ps.length >= 2` always holds.
  - `readBefore` and `noteRead` are unchanged and stock-free.
- **SD's key (the whole text):** no same-day path changes the stock off-screen. The fireside leads to sleep, Yuki's two scenes return with the stock unchanged, and there is no eating outside scenes. I confirmed with a script that camp → Yuki's scene → camp folds by SD and shows the stock.
- **`skipStep` / `unreadLines` / `foldNight`:** `skipStep` and `unreadLines` are unchanged; scene text is not among the plan's lines. `foldNight` compares a hash, so nights that cycle through three texts never auto-walk. That has been true since v0.11.230.
- **Packet and textlint coverage:** the packet carries all 6 openers (×3) and all 18 Yuki passages. Textlint renders vday 2 and 3 × k 0–5 × three forms.

## Test gaps
- **TG-C1. No whole-text pin of the six new texts in three forms.** C4 ("I can hear moths" → "mice") passes. Pin a hash against `p10-drafts-cut.txt`, as v0.11.232 and v0.11.234 did.
- **TG-C2. The forms are told apart only by italics and quotes.** C3 gives the cat the great form's passage (shaking herself so it rains on everything) and passes. Pin one form word per passage.
- **TG-C3. `state` is asserted only on the SV and VF paths.** C1 (SD drops it) and C2 (the Coil 2 memory fold drops it) both pass. The SD case is a real path: camp → Yuki's scene → camp.
- **TG-C4. Each week is tested as a fresh game with faked flags.** F2 (week 3 counted on week 2's key) passes. It changes nothing in a usual game, because week 2 has 6 quiet nights and 6 % 3 = 0. It does show on a v0.11.236 save updated mid-week 2: with 2 nights left, week 3 would start on its third text. Add a one-game walk through the real `village_morning`, and a save whose `s:village_night:2` holds 2 days.
- **TG-C5. main.js is pinned only by a source string.** The browser `split_fold` check does not cover a camp with a stock (where the stock sits, and that it shows once when opened). `tools/mutate.mjs` can't measure the browser test.

## Faults
**Claude's** (`p10-faults.json`): 12 of 13 caught. F2 was missed (see TG-C4); it changes nothing on the usual path.

**Mine** (`p10-faults-review-c.json`):

| Fault | What it breaks | Result |
|---|---|---|
| C1 | SD drops the stock | missed |
| C2 | the memory fold drops the stock | missed |
| C3 | the cat gets the great form's passage | missed |
| C4 | "moths" → "mice" | missed |
| C5 | SV compares paragraph counts (control) | caught |
| C6 | the last paragraph taken as the stock (control) | caught |
| C7 | "tonight" added to a new text | caught |

Caught: 3 of 7, and those 3 were all controls.
