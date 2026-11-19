# Cold review: v0.11.229 (E2-2 = FR + NR + HS), one-paragraph texts fold

Reviewer: Opus, cold. Read: the brief, both checklists, `git diff HEAD`, `again.js` (fold, read record, SD / VF / skip), `main.js` `proseHtml`, the tasks test's fold blocks, `tools/browser.py` part 2. Experiments in `/tmp/e2rev` only (a scratch copy of the working tree with an append-only dump in its models test; a second copy on HEAD's code).

## What was measured

- **Baseline:** `node tests/story.test.mjs --games 2 --workers 1` on the new code: 191,820 passed, 0 failed; `tests/tasks.test.mjs --games 2 --workers 1`: 4,466 passed, 0 failed.
- **Models test `--cal 7 --texts --games 10 --off 0 --sitter-games 3 --farmer-games 3`**, every split fold dumped (1,173 screens; 38 distinct first/rest pairs) and every one-paragraph text seen in play (84 distinct, 81 with 2+ sentences). Full repeats: HEAD 56 / 112 / 91 / 125 / 26 / 28 / 45 / 112 (Random / Careful / Completionist / Rusher / Sitter / Farmer / Cultivator / Sociable) → FR 5 / 0 / 6 / 0 / 2 / 1 / 5 / 0 (left: the bull's `far_hunt`, and `heart_camp` 2 for Random). Split folds by scene: `mei_walk` 610, `village_night` 230, `fo_morning` 78, `far_hunt` 71, `far_won` 60, `ah_hunt` 27, `rr_hunt` 25, `tribute_dawn_sleep` 20, `bl_morning` 14, `dw_hunt` 12, `tribute_dawn_talk` 10, `scout` 7, `mire_won` 4, `boar_won` 3, `ape_lured` 1, `heart_morning` 1.
- **Note, not FR's:** the same small run fails `rusher (--cal 7): the plan's weeks end and it stops for a breakthrough` on HEAD's code too, with identical numbers: a small-run artefact or older, not this push.

## Findings

### M1: `fo_morning` now hides the count to the Elder from the second Fallout morning of every Coil
`fo_morning`'s long-calendar text is one paragraph: "Day forty-nine. Fifty-four days to the Elder. The wind has come round…". VF's key sets numbers and number words aside, so every Fallout morning after the first in a Coil now folds to **"Day forty-nine."** (which only repeats the screen's title, "Day 49"), and the count to the Elder goes behind "Read it all again". Measured: 78 `fo_morning` split folds in the run, 76 of them SD/VF (same Coil). Scratch walk: Day 48 in full, Days 49 and 50 folded to "Day forty-nine." / "Day fifty.". Before FR this text never folded, so the count showed every morning. The text is the only place that gives the count (the title gives only the day). Of the 81 one-paragraph texts seen in play, this is the only one whose folded rest holds a number that changes from day to day. Failure scenario: a player on Day 70 sees "Day seventy." and has to open the fold every morning to see how close the Elder is.

### L1: the sentence split can break inside a quotation or an italic span (latent)
`sentencesOf` splits at any `. ! ? …` + space + capital/quote/star, so `"Go now. Run," she says.` → first `"Go now.` (an open quote), `*Run. Now,* says the bond.` → `*Run.` (md needs a pair, so a literal `*` shows), `"Go!" Yuki says.` → `"Go!"` (the speaker goes to the rest). `)` is not a closer (`(Nobody laughs.) Then` doesn't split) and `‘` is not an opener. **Measured: no game text hits this today.** 0 of 81 multi-sentence one-paragraph texts seen in play, and 0 of 106 more from static renders (every non-`noFold` scene, 4 days × 2 hours × 3 forms), have a first sentence with an odd number of `"` or `*`, a quote-only first sentence, or one ending in `?`. All 8 scene texts that open with a quote or italics (`ya_fight_start`, `fo_mei_night`, `rt_ya_talk`, `rt_trio`, `yk_night_all`, `ship_log2`, `ship_log3`, `yuki_human_after`) have 4 to 10 paragraphs. No abbreviations: the only `X. Capital` hits are "No." as a word. The danger is a future one-paragraph text or a rewrite (roadmap 1e).

### L2: What's new claims more than the build does
"…and the far hunt past the oak hollow no longer come back in full": the bull's two one-sentence `far_hunt` texts still do (the brief's 0.6 / 0.5 a game; this run's 1 to 6 per model).

### L3: dead branch and stale names
- `const rest = ps.slice(1).join(split ? ' ' : '\n\n')`: when `split` is true, `ps` is always `[first, restSentences]`, so `ps.slice(1)` has exactly one element and the separator is never used. That makes **F2 an equivalent mutant**: no input can tell it apart, so missing it is not a test gap. The `' '` branch is dead code.
- `tests/tasks.test.mjs` 3576 "a one-paragraph scene does not fold" and 3729 "LP2 (SV): never on one paragraph" still pass, but only because their strings are one sentence long. The names now state a rule that no longer holds.
- The `againView` doc comment still says "`first` and `rest` are text (paragraphs joined by a blank line)". For a split fold, `rest` is a run of sentences.

### Checked, no fault found
- **Callers of `againView`:** `main.js` `proseHtml` only (the test files, the models test). Nothing else reads `first`/`rest`.
- **Tests that join `first` and `rest` with a blank line:** `tasks.test.mjs` 3570 (`night_won`) and 3725 (`bone_field`) render to 2+ paragraphs, so they are unaffected.
- **`browser.py` part 2:** its "`n1 > n0` paragraphs" check uses `night_won` from the v0.11.7 save, which renders to 2 paragraphs ("It's over." + …), so it is unaffected. It would fail on a split fold (memory + first = 2 `<p>`; opened = memory + whole = 2 `<p>`). See TG2.
- **Read record:** `g.read`, `noteRead` (main.js 323), `readBefore`, `skipStep`, `readProbe` / `unreadLines` all stay by paragraph. The opened state (`readAllScene`, per scene and Coil, shut on `newVisit`) is unchanged and holds across redraws.
- **Pantry (`STATE_PARA`):** only `bl_camp` among the folding scenes shows the food stock. It is always story + stock (2 paragraphs), so it folds by paragraph as before. `wild_forage`'s inline pantry is `noFold`.
- **Outcome-like one-paragraph scenes that fold now:** `bl_night_won`, `boar_won`, `boar_lost`, `mire_won`, `far_won`, `hunt_got`, `night_lizard_forced`, `ape_lured`, `fo_wolf_forced`, `heal_again`. Every fold needs the identical text (`readBefore`, the SD hash) or the same text with only its numbers changed (VF). Grouping the texts seen in play by VF key, only `fo_morning` (M1) hides changed content. No text misleads; the lopsided-win `variant` guard still applies.
- **Memory lines over one sentence:** the 38 distinct pairs read cleanly. None restates its first sentence or gives away its rest. Short firsts ("Done.", "Supper.", "A quiet night.", "Day fifty-two.") stand alone. The scene-specific lines (`morning` on day 2, `talk_mei`, `talk_ya`) all render to 2+ paragraphs, so they are untouched.
- **FAQ and `NOTES` wording:** fine, apart from L2.

## Test gaps

- **TG1:** SD's split is untested. The block's comment says "SD the same day", but it walks VF, SV and the earlier Coil only. Fault R1 (SD's `split` → `false`, so an opened same-day split fold shows as two paragraphs) is **missed**.
- **TG2:** `main.js` is pinned by a source substring, not by behaviour. Any equivalent rewrite fails the test, and behavioural faults outside the substring pass. R6 (an open "Read it all again" kept across visits for split folds) is **missed**. No browser case opens a split fold to check for one `<p>`, the whole paragraph and no repeated rest. `mutate.mjs` can't measure the browser test.
- **TG3:** the sentence cases don't pin the latent behaviour of L1: a quote that spans two sentences, a quote-only first sentence with a capitalised tag after it, `(…)`, and curly quotes. R5 (drop `“` from the openers) is **missed**, but harmless today because no text uses curly quotes.
- **TG4:** no test reads a real text whose rest carries a changing number (M1's `fo_morning` on two Fallout mornings). The "real scenes" check covers only the four named scenes.
- **TG5:** R3 (`foldParts` on `storyParas`, dropping the stock from the parts) is **missed**. Its effect is small: `bl_camp` folds to its first sentence instead of its first paragraph. Still, no test pins how `bl_camp` folds after FR.

## Planted faults

- **The builder's 9** (`e2-mutate.md`): 8 caught. F2 is missed, and it is an **equivalent mutant** (L3), not a gap.
- **Mine, 6** (`e2-faults-review.json`, `--cmd "node tests/story.test.mjs --games 2 --workers 1 && node tests/tasks.test.mjs --games 2 --workers 1"`, report `e2-mutate-review.md`): **2 caught** (R2, R4); **4 missed**: R1 (TG1), R3 (TG5), R5 (TG3, harmless), R6 (TG2).
