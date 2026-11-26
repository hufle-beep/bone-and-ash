# P49-A — cold review (Opus, 2026-11-26; the diff on `main`, uncommitted)

Read: the brief, both checklists, `git diff`, the packet, `herb_slopes` (ashfall.js 501–517, 768–780), `seqText`/`byDay`/`dayIndex` (lines.js),
`again.js` (noteRead, readBefore, againView, laterDayAgain, sameDayAgain), `ONCE_STAGES`/`stageMax`, the `daily` spacing, the prologue's
`mei_bruised` gate. Ran once, in a scratch copy: `node tests/story.test.mjs --games 2 --workers 1` → **1,294,435 passed, 0 failed** (2 min 13 s).
Probed the six faults below with the P49-A block's own assertions in the scratch copy (not through `mutate.mjs`; Claude runs that).

## What checks out
- **Unbruised, byte for byte:** `slopesW2a` without the flag still ends `…here?"\n\n` (the old `${''}` gave the same); `slopesW2b` returns
  `SLOPES_W2.t` as before. `t` holds exactly one `\n\n`, so `.replace('\n\n', …)` lands the line between its two paragraphs.
- **Order:** text 1 = ¶1, scab, question; text 2 = ¶1, pale line, question. `seqText` keys by the Coil's day record (`s:herb_slopes:2`), so text 1
  is always the first in a Coil and text 2 comes at least 3 days later (`daily` spacing, every 3rd day) — scab → healed line fits. No
  form branch in either text, so all three forms read alike.
- **Neighbours:** text 1's lip line ends with her eyes (and his) on the grass, so "without looking at you" follows cleanly; the "she" of the
  question still means Mei Lin. Text 2: "plainly enjoying herself" → "The grin tugs at it" reads as the same moment. Tone fits Mei Lin (looser).
  No other lip reference anywhere in week 2 or after (grep "lip", "scab", `mei_bruised`): no clash.
- **Folding / saves (Q2):** fold keys are content hashes, never paragraph indices. A 0.11.280 save mid-week: `lines.vd`/`sd` keys of the old
  bruised text never match the new, so no false fold; `g.read` lacks the two new lines, so the plan stops once more at the slopes and a later
  Coil shows text 1 whole (no memory fold) — both correct for a changed text. The fold itself (first paragraph, rest under "Read it all
  again") is unchanged: ¶1 is the same paragraph as before.
- **Tests (Q3):** P49-A pins both lines' first and last words (Claude's cut "carries on cutting" included), the order, the unbruised paragraph
  count, the old lines' absence, and a real `goTo` screen ending on the question above "Answer her question. Honestly."; both re-pins are right.
  textlint already samples the slopes with the lip split (textlint.mjs:152).

## Findings
**High:** none. **Medium:** none.

- **L1 — "the knife" is assumed (Q1).** ashfall.js:517 `bruisedA` "points the knife at the grass … carries on cutting": text 1's ¶1 (502) shows
  "how to cut it" but puts no knife in her hand; only the week-1/3 text has "the knife still working", and week 1 has no slopes card
  (`vday(g) >= 2`), so a player's first slopes visit is this one. Reads fine by inference; "a knife"/"her knife" would remove the gap. Fable's
  own note flagged it (p49-drafts-a.txt:6).
- **L2 — the grin three times on one screen pair.** Text 2 bruised has "The grin tugs at it … nothing whatever to the grin", and when "Answer
  her question. Honestly." is picked a second time this Coil, `HS_HONEST`'s second reply (ashfall.js:514) adds "and grins anyway". "anyway"
  now answers the wince, which helps, but it is a third grin within two screens (checklist: a text against the labels under it).
- **L3 — "nothing whatever"** is now in 7 places (Ya ×2, Mei Lin, Yuki, here…); not on the tic list, but a habit spreading.
- **L4 — a dark scab late in week 2.** The lip split on the village's arrival day (prologue.js:736); text 1 can first show as late as week 2's
  last day (~13 days on). Same as the old "scabbed over" — not new, noted only.
- **L5 — a test leftover.** story.test.mjs:9952 `noteDay(g, 'herb_slopes:2')` notes a key nothing reads (`seqText` notes `s:herb_slopes:2`
  itself); harmless, misleading.

## Test gaps
- **TG1 — TU pins only the tuning words.** Dropping the slopes sentence from 0.11.281's What's new passes (C6, probed: missed). Add
  `/herb slopes/` and `/before her question/` to the TU assert.
- **TG2 — PW-x has no positive control.** It asserts the seven words are absent in beats 0–10; if `goTo`/the beat flags ever stop moving
  the text (all beats render beat 0), it passes vacuously. Assert one word present at beat 11 or 13 with the same harness.
- **TG3 — "byte for byte" unbruised is pinned by shape, not text.** A word change in `SLOPES_W2.t` or `slopesW2a` ("corrects your grip
  twice") passes every test. Pin an fnv hash of the two unbruised renders (checklist: "Exactly as before").
- **TG4 (small):** no test walks the prologue's `ignored` path into week 2's slopes; every slopes test sets `mei_bruised` by hand.

## Planted faults (`p49-faults-review.json`), expected against the story test
| id | fault | expected |
|---|---|---|
| C1 | scab line back after the question (text 1 reverted) | caught (P49-A text 1; probed) |
| C2 | pale line last again (text 2 reverted) | caught (P49-A text 2, RV1 re-pin; probed) |
| C3 | text 1 shows the healed line | caught (P49-A text 1, HS round; probed) |
| C4 | Claude's cut undone ("goes back to cutting") | caught (P49-A `/carries on cutting\.$/`; probed) |
| C5 | lip line on the unbruised text 2 | caught (P49-A not bruised; probed) |
| C6 | What's new loses the slopes sentence | **missed** (TG1; probed) |
