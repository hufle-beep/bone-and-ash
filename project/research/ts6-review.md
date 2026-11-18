# TS6 cold review (v0.11.224, TX2 = DC + DN + V3a + VF, with XA): Opus

Read: the diff, the brief, both checklists, packets for `rt_mother` / `fo_night`. Measured in scratch copies (HEAD exported beside the working copy): every scene's text and labels rendered old vs new on the old calendar (21 flag sets × Days 1–21 × 3 forms); the models test patched to log near-repeats (numbers in words or digits normalised), unfilled slots, `tributeLeft` against the real tribute day and the size of `lines.vd` (`--cal 7 --texts`, Careful / Sociable / Completionist / Cultivator, 4 games each); a week of each sequenced scene simulated with `againView`.

## High

**H1. The fold's hidden part shows a literal `\n\n` (both calendars).** `again.js:162` (SD, changed from the old line) and `:163` (VF) join `rest` with `'\\n\\n'`, a backslash and an n. `main.js` `paras` splits on real blank lines only, so "Read it all again" on any same-day or later-day fold shows the hidden paragraphs as one paragraph with the backslashes visible. Reproduced: on the old calendar, re-enter `supper` on the same evening. HEAD's `rest` reads `…nothing in it.⏎⏎Mei Lin clears…`; the build's reads `…nothing in it.\n\nMei Lin clears…`. SD folds are common (the RP1 note in the code: 1,267–3,785 screens per 200 games). Fix: `'\n\n'` on both lines. TG1.

**H2. The old calendar's eve supper lost a space.** `prologue.js` `evening`: `(longCal(g) ? '…' : 'Third supper at Mei Lin\'s.') + 'Her mother serves…'` renders "Third supper at Mei Lin's.Her mother serves you first now". It shows on every long-road game's eve on the old calendar, and on the long calendar as "…Mei Lin's.Her". This was the only text difference in the old-vs-new render sweep apart from the intended ones (below). TG2.

**H3. The long calendar's first village week (Days 23–28) shows story day 6's walk and slopes.** From `village_morning`, "Out into the village." leads to `ashfall`, so `mei_walk` and `herb_slopes` are open on vday 1. Both take the vday-3 branch (`vday(g) === 2 ? … : …`, `ashfall.js:317`, `:429`):
- `mei_walk`: the day after meeting her, it shows `mei_walk:6` ("all of it in the future tense, … her fingers have closed on your sleeve"; "names each family … as its light goes"). The result is the new X6 line "At the door she takes your hand … 'Whatever happens when they come, I'm glad you came out of that forest.'" (Mei Lin +3, +4/5). The shy vday-2 walk ("sleeves brush, and gives no sign of having noticed") comes a week later.
- `herb_slopes`: "It is the last week on the slopes before the tribute", 15–20 days before it.
- 9 bot games (Careful / Sociable / Completionist × 3): `mei_walk` on vday 1 146 times, `herb_slopes` on vday 1 10 times.
- The wrong order was already there before this build ("The last sunset before the tribute" on vday 1), but this push rewrote exactly these lines and gave vday 1 its own mornings (DC8).
- The sequence key `mei_walk:6` is shared by vday 1 and vday 3, so the last week continues the first week's count. TG3.

## Medium

**M1. VF doesn't fold texts whose count or pantry line changes.** The VF key hashes the whole text (`again.js` `laterDayAgain`), so a text whose only change is its count or the food stock comes back in full every day. Near-repeats (numbers normalised) shown in full, on top of the build's exact-text figure (6.8 / 6.4 / 3.8 / 2.6% Careful / Sociable / Completionist / Cultivator, before 25.1 / 28.5 / 26.5 / 27.0): 6.6 / 6.3 / 6.9 / 6.0% of screens. By scene:
- `bl_camp` 284: the pantry paragraph; `readBefore` strips `STATE_PARA`, VF doesn't.
- `village_morning` 259: DC8's vday-1 morning and vday 2's, 6–7 times a week in full.
- `supper` 53, `fo_mei` 36, `fo_morning` 24, `fo_night` 11.
- `supper:4`'s first text shows in full on nights 4 and 7 of the first week (simulated Days 25 and 28, no fold). That replays the first-night beat ("You will sleep in the loft. It is not proper. It is necessary."; on the ignored path, the doorstep apology).

Fix options: key VF like `lineKey` (numbers set aside) with `STATE_PARA` left out; or put the count only on a sequence's first day.

**M2. One-paragraph texts never fold.** `againView` returns early on `ps.length < 2`. Remaining exact repeats in full (16 games):
- `mei_walk` 276: `mei_walk:6` is two one-paragraph texts (not three), shown A, B, A, B, A, B over six evenings, and on vday 1 as well (H3).
- `bl_morning` 120: one `BL_QUIET` line per story day, one paragraph, shown on both quiet mornings.
- `village_night` 44: the same before this build.

The owner's "three texts max" holds, but not "less repetition" for these.

**M3. Counts still wrong on the long calendar** (rendered on the long calendar):
- `fo_night` on story day 9 (lovers): '"Twelve," she says' (46–52 days to the Elder).
- `stomp_act1.js:67`, Ya's fight posture: "Three nights at your fire" (the stomp twin of DN1).
- Four screen titles: `dawn` "Day Four" (Day 22), `fo_start` "Day Eight" (44), `fo_elder_named` "Thirteen Days" (above a text that says fifty-nine), `rt_dawn` "Day Twenty" (102).
- `scout`'s result "By tomorrow they will know" on vday 3's earlier days.

TG4.

## Low

- **L1.** `rt_evening`'s old-calendar words changed: "Nine days in the Blackroot," … "and my daughter comes home fatter" became "My daughter spends nine days in the Blackroot," … "and comes home fatter". DN was to keep the old line beside a long version. "spends … comes home" also reads oddly; "spent" fits better.
- **L2.** Lu Han: "On the {elderOrd} he comes here" gives "On the hundred and third he comes here", a day-of-month form with no month at 103. Fable's note proposed "On {elderDay}". The Sect's letters date by James's own day count, which shows plainly at 103 (who counts it?).
- **L3.** `fo_morning`'s other branch still reads "Day 51. 52 days to the Elder." in digits, next to the new spelled-out story-day-9 line.
- **L4.** The Long Forest: "a tribute on the forty-third day" and "the last forty-three days have already shown that they come round" are false for a Coil 1 that left the forest early or ended before the tribute.
- **L5.** `tools/browser.py` (`week_read` takes the `left` stop) changed but is not in the brief's file list; mutate copies can't run the browser test.
- **L6.** Mid-week load of a save from before this version: no `s:` or `vd` record, so the week's first text comes again in full after the old version showed it (the checklist's "a sequence entered from an old save").

## Checked and fine

- **Old calendar:** every scene renders exactly as at HEAD on realistic days and flags, apart from the intended changes (DR_RING / DR_BLADE replies; `fo_night` on story day 10 is unreachable, per its packet) and H2 / L1. Folds are identical: Completionist, 6 games, 497 of 2,300 screens folded with both trees.
- **Counts:** `tributeLeft` equals the real tribute day minus the text day on every village screen of 16 long games (0 mismatches). It reads 1 on Day 43 itself, where no text uses it. No `{slot}` reached a screen. `lines.vd` peaked at 209 entries (cap 600). The short road gives "tomorrow"; a save from before the village gives 21 or 3.
- **Blackroot mornings:** one way on for every reachable `bl_day` × `bl_n` × region, and `walks.js` marks 0 / 1 / 3 kept.
- **The forest's nights:** the nine `night` texts fall correctly against the week's seventh nights.

## Test gaps

- **TG1.** No test reads a fold's `rest` (H1). R1 (the same slip planted in SV) was missed.
- **TG2.** No render hash of the old calendar against v0.11.223 (checklist: "exactly as before" against the old code). The pin list lacks `evening` and `rt_evening`. R5 missed.
- **TG3.** No walk of the long calendar's first village week through the hub's doors (H3).
- **TG4.** The "no old count" regex scans scene texts at nine states only: no titles, stomp postures, choice results, or the story-day-9 night (M3).
- **TG5.** VF is tested on synthetic two-paragraph texts only: no real scene with a count or pantry line, and no one-paragraph sequence (M1, M2). R7 (the fold kept after the text changes mid-visit) missed.
- **TG6.** Choice results and the house cards' eve split are untested: R2 (eve texts two days early) and R6 (X6 undone) missed; your F14 too.
- **TG7.** Long-calendar branches outside the first V3a / DN checks are untested: R4 (settled-talk sequence), R9 (`BL_QUIET` on the second morning) and R10 (`calBl` 1 save says "Half a moon") missed; your F10 too.
- **TG8.** `tools/textlint.mjs` samples are old-calendar only, so the `longCal` / `blSpan` branches are never linted. `BROKEN` has no check for a missing space after a full stop (H2) or a literal `\n` / unfilled `{slot}` (H1).

## Faults

- **Yours** (`ts6-faults.json`): 10 of 15 caught.
  - F11 was caught by a TypeError, not an assertion.
  - Missed: F3, F5, F6, F10, F14.
  - F3 can't show (no slot text appears on story day 7). F6 is equivalent (`noFold` returns earlier in `againView`).
  - F10 and F14 are real gaps (TG6, TG7).
- **Mine** (`ts6-faults-review.json`, 10, through `tools/mutate.mjs --jobs 2`): 2 caught (R3, R8), 8 missed (R1, R2, R4, R5, R6, R7, R9, R10).
