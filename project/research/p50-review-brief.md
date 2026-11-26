# P50-A — the cold review's brief (v0.11.282; owner pick P50-A, 2026-11-26 15:44: "P50-a go"; the drafts D1, 16:47: "D1 go")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`).
Do not commit, push or edit any file outside `project/research/`. Read `CLAUDE.md` (the hard rules), `project/review-checklist.md` (texts)
and `project/review-checklist-code.md` first; read excerpts only (grep, line ranges), never whole story or test files. Do not run the full
check, the models or the task test (Claude runs them); single unit tests are fine; `node tests/story.test.mjs --games 2 --workers 1`
takes about 2.5 minutes, run it at most once. The machine has 2 cores. For experiments make your own scratch copy (`cp -r` to /tmp/rv50).

## What was picked (story texts and one new world flag; no balance change)
The read and the numbers: `project/research/p50-measure.md`. **A canon call by the owner (FC-w2 in place of FC-o):** in Ashfall the whole
street now watches James's first flight (before, he slipped out behind the grain store and nobody saw). Locals fly only from Golden Core
(`project/lore.md`, the canon card), so the village reads him as at least that, though nobody can sense him.
- **FL** `sky_flew`: set by `first_flight`'s `enter` when `ffPlace(g) === 'village'` (`js/story/prologue.js`; the prologue's village
  scenes and Act 1's Ashfall, `BT_ASHFALL_A1`). A world flag: reset with each Coil, carried into Act 1 as `sky_witness` is; not in
  `KEEP_FLAGS`. An old save reads it unset (the old texts).
- **FF** `FF.open.village`, `FF.close.village` (prologue.js): rewritten; the alone / party / Mei Lin versions untouched.
- **FW2** (`js/story/flight_texts.js`), each shown only with `sky_flew`, in place of: CS `SENT[1]`'s "the mortal who put a man of
  Foundation…" sentence (`sentText`, `SENT_MORTAL`, a load guard); ER `FW.elderRung` (`elder`); HA `FW.healAgain` (`heal_again`); LH
  `FW.luHanSky` (`tribute`); WL `wen_lesson`'s first-visit realms paragraph (`ashfall.js`); A1 `fo_elder_named`'s tea (`act1_fallout.js`),
  `rt_arrive`'s last sentence, `rt_wen`'s "He will have heard of …", `rt_elder`'s Shen Qiu (`act1_return.js`).
- Fable's runs P and A, D1 with Claude's cuts: `project/research/p50-drafts-d1.txt` (briefs `p50-brief-p.md`, `p50-brief-a.md`,
  `p50-common.md`). Without the flag every changed screen is word for word as 0.11.281 (pinned by hash).
- What's new (`js/core/news.js` 0.11.282); `tools/textlint.mjs` pool `sky_flew`; `tools/text-baseline.json` re-saved.
- **Tests:** the P50-A block at the end of `tests/story.test.mjs`; re-pinned: P7A's `act1_return.js` code hash, P16-A's two FC-o pins
  (search `P50-A, FF): re-pinned`).
- **Packet** (the changed screens, built on this code): `project/research/p50-review-packet.txt` (the `sky_flew` versions show only where
  the bots set it; read FW2 for the rest).

## Questions worth your time
1. The texts against canon, tone and their neighbours (`review-checklist.md`): each joins the words before and after (the tea's words run
   into "bone out of the air"; `rt_wen` with and without ", and of the disciples you sent home bleeding"; Shen Qiu before his sense finds
   "a mortal"; Lu Han before "Interesting." … "Villages exaggerate."). Fable invented two details: a Sect Master flies "with drums and a
   full court", and Shen Qiu has seen "my master" fly. The flight follows the breakthrough's village witness block (prologue.js `btText`)
   or Act 1's `BT_A1_WITNESS`: does the new FF read after both?
2. The flag: any path where it is set but the village did not see (a first flight whose `bt_return` is a village scene reached oddly), or
   the village saw and it is unset; a rewind, a whole-game bite, the kept realm (`liftKept`), the Long Forest; any text that now
   contradicts a village that watched him fly and is not in the read (`p50-measure.md`'s kept list).
3. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p50-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p50-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) that the tests should catch, against
`node tests/story.test.mjs --games 2 --workers 1`. Say for each whether you expect it caught. Keep the report under about 6 KB.
