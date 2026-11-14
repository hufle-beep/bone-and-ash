# Cold review: v0.11.179, the label pass (Bone and Ash)

You review a push you have not seen built. Read-only on the working copy `/home/claude/bone-and-ash` (never edit it; you may copy it to a scratch dir to render texts). Read cheaply: excerpts and line ranges only, never whole story files.

## Read
1. `/home/claude/bone-and-ash/project/review-checklist.md` (how to review; its sections are your list).
2. `/home/claude/bone-and-ash/project/canon-card.md`.
3. `/tmp/lp/diff-game.txt` (12 KB: every changed string in `js/story/`, with context) and, for the tests, `/tmp/lp/diff-tests.txt` (25 KB).

## What the push meant to do (only choice labels and four short texts; no id, check, gain, time, flag or item changes)
- 16 known label items: K1–K7 (incl. K3 `lf_wanderers` him/them by `g.flags.lf_human`, K4 `ah_hunt` hawks label by Yuki's form), T1–T2 (T2 is a drill reply line), S1–S7.
- 14 label items from a full read of all labels (Fable's wordings, some cut by Claude): `rt_evening`'s two Yuki-night labels (W1 by form, W2), `ya_offended`, `rt_road` (human), Yuki time's human label (`yuki_time.js`), the Fallout and Return drills, the Blackroot and Return cultivation labels, the three path kisses, `bl_fireside`, `lf_train`'s needle drill, `lf_hub`'s seclusion, `fo_wolf_lost`, `ya_found`, `scan_ok`.
- `rr_scout`: the label "You followed me for three nights?" (was "two days"; the Fallout says "Three nights I sat outside your little fire"); the menu's text line "Three nights it took me, working out what you were." (note: `rr_scout` is a work menu, its text is never drawn in task mode; the card shows only the label and the result).
- "Gold eyes, level" (a canon tic) replaced in four Yuki texts (`yuki_path.js`).
- O2: `lf_trial_won` reads "It won't be…" / "It will be back…" when no fight is on record (was "The it").
- Tests: two LB1 blocks at the end of `tests/story.test.mjs`; older tests repointed to the new labels; two label pins (P7A, P8A) re-pinned.

## Check especially
- Each new label against the text above it **as the player sees it in task mode** (cards: a work menu's text is never drawn; door cards open the scene), the result after it, every form it can show in, and the days/flags it shows on (e.g. a drill that repeats daily; "again", "one last time", "first").
- Two labels on one screen that now read alike, or a new label repeating a word from the label or text next to it.
- Canon (the card): who is where, counts, forms; the tic list.
- K3/K4/O2's code: every branch renders; nothing else changed in behaviour.
- Tests: does each change have a test that would fail if it were reverted or broken?

## Planted faults
Write 10–16 faults as `/tmp/lp/faults.json` (format in `tools/mutate.mjs`'s header) aimed at this push (e.g. K3's switch inverted, K4's branches swapped, O2's fallback reverted, a label reverted to its old words, a form branch of W1 swapped) and run `cd /home/claude/bone-and-ash && node tools/mutate.mjs /tmp/lp/faults.json --jobs 2 --out /tmp/lp/mutate.md`. Report the missed ones as test gaps.

## Report (your whole answer, at most about 8 KB)
Findings, most severe first, one line each: `H|M|L · file:line or scene · what is wrong · the fix's direction`. Then `TG · fault id · what the tests miss`. Then one line of counts. No rewrites of text (a direction in a few words is fine).
