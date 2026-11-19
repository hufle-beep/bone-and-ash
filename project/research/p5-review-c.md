# P5-B cold review C (code and tests), v0.11.232

Reviewer C (Opus). I hadn't seen the build. I read the diff, `lines.js`, `again.js`, `week.js` (doors, door memo, fold), `music.js`, `textlint.mjs` and `packet.mjs`. I measured in the scratch copies `/tmp/rv-c` (this build) and `/tmp/rv-c-old` (HEAD), with an instrumented copy of the models test (Sociable, 4 games on the long calendar, 4 on the old one). I did not edit the working copy, apart from the two files the brief asks for.

## Checked, no finding
- **Keys:** `fo_mei:<dd>` (`dd` clamped 8–10) and `fo_ya_time:9|10`. Ya is met on day 9 at the earliest (`ya_met` is set only in `ya_meets`), so "any day but 9 counts as 10" never mixes day 8 into the sequence in play. `roofKey` is read on the evening's `vday`. `bl_fireside:<region>` is noted by `dayKey` in `story.js go()` before the text, so `byDay` reads today's index.
- **Labels and results by the same index:** in a real walk the text is drawn first (`seqText` notes the day), then the labels (`foSeq`, read only). The roof's `ri` is read in `do` on the same text day, and the stay choice takes no time. Bot walk on the long calendar: every visit showed the label set of its own index (for example day 8: herb loft / doorstep / yard with Scream / Stupid / Magnificently).
- **Text day:** every `fo_mei` and `fo_ya_time` visit in the runs was at 06:00–12:00, and the roof was at 19:00–20:00 (long calendar). `!late` would allow the hub at 00:00–04:59, but no route reaches it.
- **Coil:** the day record is reset by the `c` stamp, so in Coil 2 the sequence restarts on the old text, and VF folds it where it was read earlier.
- **Old calendar:** in 4 games, each key was shown once (`fo_mei` 8/9/10, `fo_ya_time` 9/10, roof vday 1/2, rr, dw, ah), always with the old text and labels.
- **Module order:** `both`, `onlyYa` and `onlyMei` (lines 415–455) are only read inside the `ahFire` closure. `vday` (line 73) is defined before `roofKey` (line 105).
- **Saves:** the only new data is the `s:` keys in the Coil's day record. No sanitiser touches `lines.d`, and no IDs or flags changed.
- **Splitter:** all six roof result lines pass `splitLine` as a reply, with an empty gain.

## Findings

**M1. The week plan now stops for Fallout talks it used to answer itself.** `doorPick` replays the last answer only when the screen's options have the same label signature (`doorSig`: the labels, numbers aside). The new labels change with the text's index, so the signature changes from one visit to the next, and the 'door' stop has no `READ_CAP`.
- Measured with the plan's door rows `fo_mei` and `fo_ya_time` set, story days 8–10, long calendar, 2 seeds, 12 door visits each: the plan stopped at **5 of 12 visits before, 10 of 12 now**. Answered "As before:" went from 7 to 2.
- By scene and story day: `fo_mei` 1→2 (day 8), 1→3 (day 9), 1→2 (day 10); `fo_ya_time` day 10 1→2. Ya's day 9 is unchanged because her labels stay the same.
- This is the owner's rule as written ("a new option … should stop again"), but the brief doesn't mention it, and it works against RE1's aim (3 read stops per item).
- Failure scenario: a player who plans a week of the Fallout's daily talks is stopped at almost every talk.
- Options later.

**M2. A second music line can appear under the roof text where James's arm is already playing.** `ROOF_NEW[1][1]` opens with "Your forearm is playing strings, very low". `music.js`'s `OWN_MUSIC` regex doesn't match it: it matches "forearm has been playing" and "arm is playing low", not "is playing strings, very low". So `musicLine` still draws the evening's line under that screen.
- Measured: on that text (first week, third night, 20:00), a music line is drawn in **200 of 200 seeds**.
- Examples: "J-pop, low, from your forearm: bright, quick, relentlessly glad…", and the omnitool's heavy-metal line. Both sit directly under Mei Lin listening to a strings recording.
- The old later-night text matched the regex and so had no second line.
- This is the checklist item "lines drawn under a screen": a code fix (the regex), not a text fix.

**L1. The re-pin comment gives the wrong reason.** I measured all six PR2 and VQ1 Fallout runs on HEAD and on this build. With only `lines.d` left out, the ids, stops, lines and whole save are identical. The only fo_mei screen in those runs is its first, old text. So the pins moved only because of the new day-record key `s:fo_mei:8`, not because of "fo_mei's and fo_ya_time's later-day texts and labels". "Texts only" is true in substance (no step, stop, line or save field changed), but the comment's reason should be corrected. These pins cover none of the new texts.

**L2. Old saves partway through a week.**
- `fo_mei`, `fo_ya_time` and the roof have no `s:` record in an old save, so the first visit after loading shows the old text again (VF folds it), then the new ones.
- `bl_fireside:rr` and `bl_fireside:ah` were already noted before this push. A save past day 1 of a region skips ahead in the sequence. A save resting on the fireside screen redraws with a different text after loading (for example, 2 rr nights already noted: the chopsticks text replaces the old text).
- Neither breaks anything; noted for the owner.

## Test gaps
- **TG-C1. The text checks miss most of the new texts.** `tools/textlint.mjs` renders 16 of the 36 new pieces. Its samples sit on story day 8, `vday` 1 and region rr. It never reads:
  - `FO_MEI_NEW` days 9 and 10 (4 texts) and `FO_YA_NEW` day 9 (2 texts);
  - the day 9 and 10 labels (4);
  - `ROOF_NEW[2]` (2 texts);
  - all four `ROOF_STAY` lines;
  - every `FS_AH` text;
  - both CW lines.

  `packet.mjs` (samples k = 0 and 2) shows only the third text of each slot, and only for day 8, `vday` 1 and rr. So this review's packet had about half the new texts. An unpaired quote planted in those texts passes (C3, C4, C6). Fix: add sample states for days 9 and 10, `vday` 2 and region ah, plus a k = 1 sample, or add the lists to `POOLS`.
- **TG-C2.** The firesides' tests fake `noteDay('bl_fireside:<region>')`, and nothing walks a real camp to the fireside with `goTo`. Changing `dayKey` passes (C2), which freezes rr, ah and the older dw sequence on their first text in play.
- **TG-C3.** The label tests build a fresh game for each story day. After a real week of day 8, the labels of days 9 and 10 are never read, so a fault that shows day 8's pot and quilt labels on days 9 and 10 passes (C1). A Completionist who visits all 7 days hits it: 7 % 3 = 1.
- **TG-C4.** The old calendar is tested only for `fo_mei` day 8. The roof's second night (vday 2 after vday 1) and the firesides are not pinned there, so a key that merges them on the old calendar passes (C5).
- **TG-C5.** Nothing measures the plan's door stops or "As before:" answers against the new labels (M1).
- **TG-C6.** Nothing checks the new roof and fireside texts against `OWN_MUSIC` and `MUSIC_SCREENS` (M2).
- **TG-C7.** The P5 tests call `text()` and `do()` directly; none goes through `sceneView` and then `choose`/`storyTap`.

## Planted faults (`tools/mutate.mjs`, `node tests/story.test.mjs --games 2 --workers 1`, jobs 1)
- **Claude's (`p5-faults.json`): 11 of 11 caught** (F1–F11).
- **Mine (`p5-faults-review-c.json`): 0 of 6 caught.**

| Fault | What it breaks | Result |
|---|---|---|
| C1 | `FO_MEI_L1` without `dd === 8`: day 8 labels show on days 9 and 10 | missed |
| C2 | `bl_fireside` `dayKey` renamed: the fireside never advances in play | missed |
| C3 | unclosed quote, `fo_mei` day 9 third text | missed |
| C4 | stray quote, Ashen Hills third text, Mei Lin's branch | missed |
| C5 | old calendar: the roof's vday 2 shares vday 1's count | missed |
| C6 | unpaired quote mid-paragraph, `fo_mei` day 9 third text | missed |

Scratch copies left in place: `/tmp/rv-c` and `/tmp/rv-c-old` (git worktrees of the repo).
