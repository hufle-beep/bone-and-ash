# P49-A — the cold review's brief (v0.11.281; owner pick P49-A, 2026-11-26 13:14: "P49-a go"; the drafts D1, 13:20: "D1")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`).
Do not commit, push or edit any file outside `project/research/`. Read `CLAUDE.md` (the hard rules), `project/review-checklist.md` (texts)
and `project/review-checklist-code.md` first; read excerpts only (grep, line ranges), never whole story or test files. Do not run the full
check, the models or the task test (Claude runs them); single unit tests are fine; `node tests/story.test.mjs --games 2 --workers 1`
takes about 2.5 minutes, run it at most once. The machine has 2 cores. For experiments make your own scratch copy (`cp -r` to /tmp/rv49).

## What was picked (story texts; no logic, balance or save change)
The numbers: `project/research/p49-measure.md`.
- **HS-b2** (`js/story/ashfall.js` `slopesW2a`, `slopesW2b`, `SLOPES_W2.bruised`, `SLOPES_W2.bruisedA`): `herb_slopes` in the village's
  week 2 (`vday === 2`, `seqText 'herb_slopes:2'`), only with `g.flags.mei_bruised` (James ignored her on the prologue's first day and
  Gao Feng split her lip): the lip line moved from after her question (the screen ended on it, above "Answer her question. Honestly.") to
  between the first paragraph and the question, in Fable's new words (run A, Claude's one cut "carries on cutting"; the drafts:
  `/tmp/p49/drafts-a.txt`). Text 1 the scab, text 2 the healed pale line (text 2 always after text 1). Not bruised: the text as before,
  byte for byte.
- **TU:** `js/core/news.js`, the 0.11.281 What's new line (Claude's words): the game is tuned through Act 1, the rest with Act 2; the slopes.
- **Closed as accepted (docs, not in this diff):** SF (0 of 600 games), the talks' seven place words in the Drowned Wood (0 of 600; beats
  11–14, which come in the Ashen Hills), HS (c) (0 of 600).
- **Tests:** the P49-A block at the end of `tests/story.test.mjs`; two older pins re-pinned to the new words and order (search
  `HS-b2: re-pinned`). `tools/text-baseline.json` re-saved (16 words).
- **Packet** (the changed lines): `project/research/p49-review-packet.txt`.

## Questions worth your time
1. The two lines against canon, tone and their neighbours (`review-checklist.md`): does each read right between the paragraph before and
   her question after (text 1's question is said "without looking at you"; text 2 follows "plainly enjoying herself")? The knife in
   text 1: does the first paragraph put one in her hand?
2. Folding: the texts are now three paragraphs when bruised; any fold, read record or "Read it all again" effect (`js/story/again.js`)
   that the order change could upset (a save from 0.11.280 mid-week)?
3. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p49-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p49-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) that the tests should catch, against
`node tests/story.test.mjs --games 2 --workers 1`. Say for each whether you expect it caught. Keep the report under about 6 KB.
