# v0.11.239 cold review C (code): FS6 + RC + TG

Opus, cold. Read: the diff, both briefs, both checklists, `lines.js` seqText/dayIndex, `fo_morning`, `packet.mjs` STATES, the packet. Probes and mutation runs in `/tmp/rv-c` (no `.git` at first; git-initialised for the tools baseline). Story faults: `node tests/story.test.mjs --games 2 --workers 1`; tools faults: `node tests/tools.test.mjs`; both `--jobs 1`.

## H
**H1: `tests/tools.test.mjs` fails on the build (1 failure).** The P8-A TG pin (line ~1237) still asserts the old lint loop `for (const day of [51, 58]) for (const k of [0, 1, 2])`, and TG replaced that loop with `[44, 51, 58] × [0..5]`. Measured in the scratch copy: 509 passed, 3 failed (2 only because the copy had no `.git`: the leftovers scan and `consistency.mjs` both pass after `git init`; 1 is this pin). Your own `/tmp/p12/check1.log` line 29 shows the same failure. What goes wrong: `check.sh` stops on it, and if the pin is deleted to fix it, nothing pins the day 9–10 samples any more. Fix: pin the new loop in its place. I patched the pin that way in my scratch copy only, to get a passing baseline for the tools faults; C6 and part of F12 were measured with that patch.

## M
**M1: the replaced-text rule hides a new draft that copies half or more of a text in its own scene.** `replaced` treats any render of the draft's own scene that holds at least half of the draft's runs as the text the draft replaces, so none of those runs are noted. It can't tell a rewrite from a near-copy, and every draft in this push fills a new slot (indices 4–6), so none of them replaces anything. Measured with `checkDrafts`, default corpus:
- A new away line `fo_supper:9:7:away` "Supper. Nobody says much. The mother bars the door early." (9 of 10 words from the old away line): **0 notes**.
- `fo_supper:8:7` that keeps 90% of FS8[0]'s first paragraph and adds a new tail: **0 notes**.
- The same draft keeping 60% or 40%: 85 and 65 notes, every shared run reported.

So the heavier the copy, the quieter the check, which is the CR1 miss again. A rewrite that keeps under half has the opposite problem: every run it kept is noted as `scene` (noise, but at least visible). Fix options: work out "replaces" from the key (an index the scene already has) or an explicit marker, or keep one line such as `SCENE · … looks like a rewrite of text i (n/m runs)` in place of silence. Planted C5 (a replaced render silences all the scene's other texts) was **missed**.

**M2: the packet's STATES still draw none of the push's new texts.** The Fallout states are `[[9, 51], [10, 58]] × k 0–2`, cat form only, with Ya met. There is no story day 8 state past the forms' k 0/2, and no state for day 9 without Ya. Grepped in `/tmp/p12/review-packet.txt`: 0 of 6 new openers and 0 of 3 away lines. This repeats the v0.11.236 C M1 checklist item ("grep the packet for every new text's opener; states fixed at one day index… draw none of a cycle's later texts"). The brief says so ("render the new ones yourself"), but the next push on `fo_supper` (LF, the loft line) gets a blind packet again. Fix: k 0–5 for both story days, a story day 8 state in three forms, and a day 9 state without Ya, with a tools test like P8-A RV1's "every text of the cycles drawn".

## L
- **L1: the story test's "old calendar" assert runs on the long calendar.** `week(8, {}, 'cat', 1, undefined)`: passing `undefined` triggers the default `cal = C.LONG_CAL`. Measured: `g.cal` is 7, so the assert checks the long calendar's day-8 index 0. Planted C2 (the old calendar shows FS8 first) was caught, but only by an older block.
- **L2: when the lint fails, `lintCorpus` dies without saying why.** With textlint throwing, `--check` reports only "Command failed … status 1" (because of `stdio: 'ignore'`), and `/tmp/lintcorpus-*` is left behind (measured: 1 directory). Fix: pass stderr through, and remove the temp dir in `try/finally`.
- **L3: `--corpus` breaks at the edges** (the v0.11.238 C L1 lesson). `--corpus` as the last argument throws `ERR_INVALID_ARG_TYPE`, exit 1. `--corpus --list` writes a 1.2 MB file named `--list` in the cwd (measured). Neither is tested.
- **L4: `exclusiveDrafts` knows `great` but not the game's own form id `tiger`.** The briefs use `great` (0 keys use `:y:tiger`), so this only matters if a key copies the code's name.
- **Note, not a fault:** on story day 10 the sequence runs 7–13 (measured on Days 58–64: old 2, old 3, FS9 ×3, old 1, old 2). So "Ya comes to supper. Nobody invited her" shows on Day 57 and Day 63, as it did with three. That is the text reviewer's to judge.

## Checked, fine
- **byForm order:** FS8's `y` is [cat, great, human], matching `byForm(g, cat, tiger, human)`. The story test checks each form.
- **Old save mid-week:** a v0.11.238 save with `s:fo_supper:8` at 3, 4, 5 or 6 days gives FS8[0], FS8[1], FS8[2], then old 0. No crash, and the VF keys are untouched. A save sitting on the supper screen at index 3 redraws FS8[0] in place of the folded old 0, which is harmless.
- **Ya met mid-week:** can't happen on the long calendar. `fo_morning` on day 9 without Ya offers only "Look.", so Ya is met on Day 51 and FS9 always comes after the old three.
- **Old calendar:** day 8 shows old 0, day 9 old 0, day 10 old 1 (the shared key), the same as before.
- **`--corpus`:** leaves the normal run and the snapshot alone. It exits before the counts and `--save`, and the baseline change comes only from the new samples. Its cost is 3.4 s under load, once per process (cached). `--check` on the 18 cut drafts takes 5 s; against the pre-build texts it gives 0 run/scene/self notes, and Fable's s8 and s9 drafts give 6 run + 3 self and 3 run.
- **Pairs:** right to keep them on the old corpus. Measured on the cut drafts, counting pairs over the distinct union with the lint corpus doubles the notes (63 → 133), and most of the extra come from per-form and per-day copies of one text.
- **Draft against draft:** one note per later draft per run, in file order, the same as before. A text and its Yuki passage are noted, and passages by form and `:away` lines are not, which is correct for the brief's keys.

## Test gaps
- **TG-C1: story day 10 untested.** Planted C1 (day 10 starts its own sequence) and C3 (day 10 draws the away lines with Ya met) were both **missed**. Add one game walked across Days 51–64, asserting day 10's indices continue 7–13 and FS9 with Ya on Day 60.
- **TG-C2:** an old-calendar assert that really runs on the old calendar (L1): build the game without `cal`.
- **TG-C3:** rewrite the P8-A pin for the new loop, keeping 58 (H1).
- **TG-C4:** M1's case: a new-slot draft copying at least half of a sibling text must be noted, plus C5: a draft that replaces text i and reuses a run of text j in its scene.
- **TG-C5:** the self pass with the exclusive draft first (C4 **missed**): `zq:1:y:cat` then `zq:2` then `zq:1:y:great`, all sharing a run, must note `zq:1:y:great` against `zq:2`.
- **TG-C6:** the corpus's result lines keep their scene id (C8 **missed**). A run shared with the scene's own result line should come out as `scene`, not as `run … also in pool:results`.
- **TG-C7:** the packet draws FS8 and FS9 and the away lines (M2); the `--check` CLI summary has `scene N`; `--corpus` with no file, and the lint failing (L2, L3).

## Faults (tools/mutate.mjs)
| | Command | Caught |
|---|---|---|
| Claude F1–F7 | story test | 7 / 7 |
| Claude F8–F13 | tools test | 6 / 6 (F12 partly by my scratch patch of the H1 pin; it fails 4 asserts) |
| Mine C1–C3 (`p12-faults-review-c.json`) | story test | 1 / 3 (C1, C3 missed) |
| Mine C4–C8 | tools test | 2 / 5 (C4, C5, C8 missed; C6 with the scratch pin) |

Total: Claude's 13 / 13, mine 3 / 8.

## For the checklist (code part, Tests)
- **A test helper's default parameter** (v0.11.239 C L1): passing `undefined` to a parameter with a default gives the default. An "old calendar" call through `week(..., undefined)` ran on the long one, so check the game's own `cal` inside the assert.
- **A source pin on a loop the push rewrites** (v0.11.239 C H1): grep the tests for a regex on any line the push edits, before the full check.
