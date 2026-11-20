# Cold review C (code), v0.11.236 (P9-A: CB3 + QW + YW, D1)

Reviewer C (Opus), cold. Read: the brief, both checklists, `git diff HEAD`, `/tmp/p9/review-packet.txt`, line ranges of `act1_blackroot.js`, `lines.js`, `story.js`, `again.js`, `remember.js`, `textlint.mjs`, `packet.mjs`. Probes in `/tmp/rv-c/s/` (renders only). Faults through `tools/mutate.mjs`, `--cmd "node tests/story.test.mjs --games 2 --workers 1" --jobs 1`. Note: Claude's stash came while my first fault run was going. I stopped that run and ran it again from the restored tree (BL_RR_CAMP present). The results below come from that second run.

## Verdict
No H. One M (the review packet) and four L. The logic holds on every point the brief names. The new tests catch every structural fault, but they don't pin Claude's four cuts: 4 of my faults were missed for that reason, and 1 more on the Ya-away branch.

## What I checked (holds)
- **byDay on `bl_camp:<region>`:** `go()` notes the scene's `dayKey` (story.js:130) before the text is drawn. `dayIndex` is read-only, so a redraw the same evening keeps the same index, and so does a return from the fireside or Yuki's walk (all on one text day, which runs from 05:00). Probe on the long calendar: RR and AH give texts 1,2,3,1,2. A save past three nights reads index 3 → text 1 and folds under VF. The pantry stays out of the VF key (`STATE_PARA`). The fold hiding the food line is the known open item.
- **Old calendar:** RR and AH camp once, so they always show text 1, as before. A forced 5 nights gives the sequence, which the test accepts.
- **Untouched by the change:** `DR_COOK` / `DR_STAKES` (their own `r:bl_camp:0/2` keys), music and songs (keyed by scene id), `yuki_path.js`'s splice (the choices are unchanged), `again.js`, `tasks.test.mjs` RF1, `data.test.mjs`'s camp save.
- **Talks:** `if (n >= 5)` sits below `if (n >= 5 && (n - 5) % 6)`, so it fires only when n ≡ 5 (mod 6). Beat 2 still shows the old walk. `talkBeat` is unchanged. `remember.js` `L.talk_*[5]` is undefined, so it falls to the pool, as before for beat 5.
- **Ya's empty both-line:** it leaves a trailing `\n\n`, which `main.js` `paras` and `again.js` `parasOf` both drop. This is the same as the old walk.
- **`AW.talk_mei`:** untouched. Mei Lin's new walk contains no "Ya" in either branch.
- **YW:** no "your world" left in Mei Lin's speech. The other four hits are narration or James (prologue, walks, heart). Both test files are updated.
- **textlint:** its samples render all six new texts. Probe: RR and AH at k 1–2 give texts 2–3 (the fireside samples), and the n=5 samples at a 0/80 give both walks, cold and warm, with the both-line. `dryClone` isn't involved, since these are scene texts, not results.

## Findings
**M1: the review packet draws 3 of the 6 new texts.** `/tmp/p9/review-packet.txt` has RR 2, RR 3 and AH 2. It has no AH 3 ("The cinder hawks…") and neither quiet walk: `grep -c "millet\|Ya is quiet\|cinder hawks"` gives 0. The cause is in `packet.mjs` `STATES`: its Blackroot states sit at `k: 1` and none sets `mei_talks` / `ya_talks` ≥ 5. Its `SAMPLES` reach beat 4 at most. The brief noted the day-index-1 limit but not what it costs. Failure: a reviewer working from the packet, as rule 10 intends, never reads the millet cake, the stone or the hawks. Reviewer T's brief tells them to render the texts themselves, which limits the damage this time. Fix (open, options later): `STATES` for talk beat 5 (cold, warm, both warm, Ya away) and for the camp at k 2.

**L1: stale comments.** `act1_blackroot.js:1336` still says "the settled text again from 5". The `remember.js` header says "the settled text (beats 2 and 5+)". The S1 test message still says "five texts by beat". Doc only.

**L2 (for reviewer T to check; not code):** the new cold branches end on beat 2's cold beats. Mei Lin laughs and checks over her shoulder for witnesses; beat 2 has her laugh and then glance behind in case somebody from Ashfall heard. Ya punches his arm; beat 2 has "a punch on your arm". The two texts are three talks apart in one cycle. This is checklist v0.11.235's "laughs, checks who heard".

**L3:** textlint (log only) shows sharedChunks 753 → 757. One of the new chunks I found is the YW phrase "where you come from, Mei Lin says", which already occurs in one other place. `packet --check` on `p9-drafts-cut.txt` reports run 0, pair 26, time 3. Harmless.

**L4:** the old-calendar assertion in the P9-A block accepts either "always text 1" or the sequence, so it doesn't fix which one is right. It still fails on a wrong constant text, so it isn't empty.

## Test gaps
- **TG-C1: Claude's four D1 cuts are unpinned.** Undoing any one passes (R1–R4 missed). The checklist (v0.11.185 TG1) asks for a word per cut: "The routine has settled", "She sounds delighted.", "millet cake", "has the kindling".
- **TG-C2: the Ya-away check is warm only.** The state uses `trio: 1`, which makes `likesMei` true. `awayNow` = 'ya' is correct (probed), but the cold branch is never read with Ya away. R5 put "Ya" into the cold branch and was missed. Add a state with Ya away and Mei Lin cold.
- **TG-C3:** `packet.mjs` STATES (M1). No test covers this.
- **TG-C4 (minor):** the moved old camp texts are pinned only by their openers in the P9-A block. An older test still caught R8, so no measured gap.

## Faults
- **Claude's (`p9-faults.json`):** 10/10 caught (F1–F10).
- **Mine (`project/research/p9-faults-review-c.json`):** 7/12 caught.
  - Caught: R6 (dayKey noted ≠ key read), R7 (Ya's beats 11 and 17 back to the old walk), R8 (moved AH text changed), R9 (both-line ungated), R10 (Mei Lin's beats 6–10 shadowed), R11 (second YW undone), R12 (Yuki in RR text 2).
  - Missed: R1–R4 (TG-C1) and R5 (TG-C2).
