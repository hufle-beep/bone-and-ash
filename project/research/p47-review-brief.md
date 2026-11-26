# P47-B — the cold review's brief (v0.11.279; owner pick P47-B, 2026-11-26 08:10: "P-47b go"; the drafts D1, 08:19: "D1 go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`).
Do not commit, push or edit any file outside `project/research/`. Read `CLAUDE.md` (the hard rules), `project/review-checklist.md` (texts)
and `project/review-checklist-code.md` first; read excerpts only (grep, line ranges), never whole story or test files. Do not run the full
check, the models or the task test (Claude runs them); single unit tests are fine; `node tests/story.test.mjs --games 2 --workers 1`
takes about 2.5 minutes, run it at most once. The machine has 2 cores. For experiments make your own scratch copy (`cp -r` to /tmp/rv47).

## What was picked (story texts and one small rule of display; no balance or save change)
Texts by Fable (runs A–C, `project/research/p47-brief-*.md`, `p47-drafts-*.txt`), with Claude's five cuts (`p47-drafts-d1.txt`). The
numbers: `project/research/p47-measure.md`, `p46-measure.md`.
- **YM-3** (`js/story/act1_fallout.js` `YM_PAIRS`, `ymPair`; `fo_supper`'s choices 0 and 1 on story day 9 with Ya): three pairs of
  labels and replies taken in turn by the supper text's own day index (`dayIndex(g, 's:fo_supper:9') % 3`, the key `seqText` notes);
  the old pair first. The gains unchanged. `js/core/week.js` `AGAIN_EVE` knows every label (YM-f: the plan answers from the week's
  second evening as on its first, "As before: …").
- **PN-f j:** `FS7.d9.t`'s second paragraph (the honeycomb, story day 9's seventh supper).
- **PN-f k:** `js/core/lines.js` `lastReply` (new: as `dayReply`, but stays on the last entry); `js/story/ashfall.js` `HS_HONEST`,
  the reply of `herb_slopes` choice [1]: the old reply the first day picked this Coil, the new one every later day.
- **PN-f f:** `ashfall.js` `QUIET_WEEK[2]`'s second text: the fungus's description.
- **L3:** `js/core/game.js` `postureCount`, `SAY_TEXT.holdNowMany`; `js/main.js` draws it under Say something when two or more foes
  posture this round (one speaker: `holdNow` as before).
- **PN-f a, b, c, e:** `js/story/act1_blackroot.js` the journey talks (`talk_mei`, `talk_ya`, `DR_YA_OFF`): Mei Lin's beat 7 (no coat,
  no basket), Ya's limp sulk replaced, Ya's beats 8 and 9 "both" lines after the spring (`YA_KISSED`, `g.flags.trio_kiss_seen`), the
  words "path" / "ground" in the talks that show in the Drowned Wood too, the quiet walk's basket and cover move, Ya's label [2].
- **Closed as accepted (docs, not in this diff):** PN-x (v0.11.234 L5, v0.11.237 L7, v0.11.243 L3, L4: 0 or near 0 in 600 games); FC-w.
- **What's new:** `js/core/news.js`, the 0.11.279 line. **Tests:** the P47-B block at the end of `tests/story.test.mjs`; NC1 leaves the
  new list out (`P47K`); the P10-A TG-C1 hash re-pinned (the fungus). `tools/text-baseline.json` re-saved.
- **Packet** (the changed lines, `tools/packet.mjs`): `/tmp/p47/review-packet.txt`.

## Questions worth your time
1. YM-3: is the pair the same between the label drawn, the choice taken, the "As before" repeat (week.js `weekEveAgain`, the plan) and
   a save loaded mid-week? Any path where `fo_supper` on story day 9 is drawn without `seqText` noting the day (dayIndex then reads the
   next index)? The old calendar is gone; the long calendar only.
2. `lastReply`: the day record (`r:herb_slopes:honest`) and a new Coil; a save from before (no record) reads the old reply first.
3. The texts against canon, tone and the fold (`review-checklist.md`), each where it shows (the Drowned Wood for the talks).

## What to send back
Write `project/research/p47-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure;
test gaps as TG1…; and `project/research/p47-faults-review.json`: 4–8 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) that the tests should catch, against
`node tests/story.test.mjs --games 2 --workers 1`. Say for each whether you expect it caught. Keep the report under about 8 KB.
