# Cold review: v0.11.173, part 6 (the Heart), P6A / CA1 / OL1

Reviewed: uncommitted diff against HEAD (`js/story/act1_heart.js`, `js/story/stomp_act1.js`, `tests/story.test.mjs`, `js/core/news.js`, `project/lore.md`). Read-only; scratch work in `/tmp/p6-review-scratch`, `/tmp/p6-review-old`, `/tmp/p6-rev-tools`.

**Counts: High 0, Medium 4, Low 11, suggested tests 10.**

## What was checked, and how

- **Code against the stated list (parser level).** Both files, old and new, with every string literal blanked and every `${…}` kept (`/tmp/p6-rev-tools/skel.mjs`), then again with identifier-like strings kept (`skel2.mjs`: ids, flags, item ids, keys). The only differences are the stated ones: `ht_start` +1 `byForm(g, S, S, S)`; `heart_camp` −`const n = day(g)` and −`${n}`; `heart_night` quiet nights 1–3 each +1 `${g.flags.ship_found ? S : S}` (night 1 became a template literal); three empty human branches `''` → text (`ring_forced`, `ring_lost`, `guardian_half`); stomp `husks.posture` +`${yu(g)}`; `guardian.win[2]` `()` → `(g)` +`${g.flags.guardian_weak ? S : S}`. Nothing else.
- **Scene structure (module level).** Old and new `HEART` loaded side by side (`labels.mjs`): 38 scenes, same keys and order, same `id` / `title` / `art` / `place` / `dayKey`, same choice count, order, `to`, `time`, `qi`, `check`, `show`, `fail`, `fly`. Only label change: `ht_start#0` "Cross the clearing." → "Walk to the doorway.". Encounter ids, tiers, enemy names and stats unchanged (intros reworded). Mechanical parts of result lines all present.
- **Runtime.** 164,373 renders (`render.mjs`): 38 scenes × 17 flag sets × Days 16/17/18/19/21 × 3 forms × day index 0–4 × 3 hours (× 3 night rolls), every `do` / `failDo` / `enter` (with and without food), the three stomp entries in every degree. No throw, no `undefined` / `NaN` / `${`. Only trailing spaces before a blank line (as before the push). Stomp wins through `sceneView` with `g.lastWin` set: all six render, `guardian.win[2]` branches on `guardian_weak`, the scenes' choices follow (`js/core/story.js:111` already passed `g`; that file is unchanged).
- **Tests.** 18 faults planted one at a time in the scratch copy, `node tests/story.test.mjs --quick` each: 10 caught, 8 not (M4).

---

## Medium

### M1. `sect_cut` states where the heart lay before James can know it
`js/story/act1_heart.js:310`. "The heart never lay up here; it lay far below, deep under the roots. … what they tore loose down there could be hauled up the hollow trunk and out."
- **Failure:** Day 16, `sect_marks` set, nothing else done (the hub's climb needs only `sect_marks`) → James states as fact the position of a heart-chamber he reaches only later, past the roots, the ship and the bone door. Same class as the ship before `ship_found`.
- Second, smaller: `ship_log3` (l. 472) still has the man in red reach "into the hole" and take the heart "with his own two hands" and walk away; the new text has it "hauled up the hollow trunk" through a house-sized chimney although the door at the foot takes a cart.
- **Fix (text only; keeps the pick's fact and the test's `chimney`):** make it what he reads off the wood: "The heart never lay up here. The scorching runs on down the inside of the trunk, past the hall floor and out of sight, and whatever they cut loose, they cut loose down there. The split at the foot was their door and this was their chimney: opened from above, so that what they took could be brought up the hollow trunk and out."

### M2. The TY fix missed the Heart hub's Yuki lines: the dust is still "a thousand years" there
`js/story/yuki_time.js:132` (`heart_hub:1`, cat: "the only pawprints in a thousand years of dust"), `:152–154` (`heart_hub:5`, all three forms: "The dust was a thousand years deep when you came").
- **Failure:** Day 16+, time with Yuki at the hall → "a thousand years of dust", against `heart_hall` (l. 184) "Four centuries of dust" on the same floor, and against the brief's rule (a thousand only for the cup and the ship). The test at `tests/story.test.mjs:955` counts only `act1_heart.js`.
- **Fix:** "the only pawprints in four centuries of dust"; "The dust was four centuries deep when you came" (×3). The file is not in this push: add it, or carry it as an open item.

### M3. The guardian's stomp posture says "It does not know you" after it has recognised him
`js/story/stomp_act1.js:345`.
- **Failure:** `guardian_weak` true (after `guardian_half`: "you feel it *recognise* the shape of the words, the shape of you … Part of it is still listening"), or `guardian_lost_day` set (`guardian_approach`: "It remembers you."), degree 2 or 3 → the next screen opens "It does not know you. It knows *intruder*". The sentence is old, but this push gave `win[2]` a `guardian_weak` branch for the same state, and `posture` already receives `g`.
- **Fix (text only, fits every state):** "Whatever it knew of you a breath ago is gone under again. It knows *intruder*, and it has known little else since the tree died." Or a `guardian_weak` branch (code: needs a pick).

### M4. The P6A block does not catch 8 of 18 planted faults
`tests/story.test.mjs:918–1004`. Each planted alone, `--quick`, 0 failed:
| Fault planted | Result |
|---|---|
| `guardian_won` gain `ship_shard` 2 → 3 | not caught |
| `heart_core` two choices swapped (choice indices, `wasPicked`) | not caught |
| hub's climb `time: 60` → 30 | not caught |
| guardian song check `dc: 7` → 5 | not caught |
| `wake`: "Slept until 06:00. HP and Qi full." reworded | not caught |
| `ship_log`: "Forty souls" → "Fifty souls" | not caught |
| `heart_hub` `where`: "lies the ship" before `ship_found` | not caught |
| `guardian_won`: `guardian_weak` condition inverted (scene, not stomp) | not caught |
| stomp `husks.win[2]`: the cup "four hundred years old" | not caught |
Caught: ship in quiet night 2; `ht_start` forms swapped; `ht_leave` cat/tiger swapped; the woman's line on the tiger in `guardian_half` (by XB2's pin, not by the render check); stomp "two pieces" → three; `${day(g)}` back in `heart_camp`; ship in `root_husks` posture; `log_heard` dropped (1,149 fails); `heart_morning` trio branch inverted; a label change on `heart_gate#2` (by `walks.js`' guard, which does not cover most Heart labels).
- This push is clean on all of these (see the parser comparison), so nothing is wrong today; the block's claim "keeps its facts" is thin: `FACTS` is `/Tamsin/`, `/hull/`, `/two/`. The full check was not rerun per fault; the bots may notice the dc or the gain as drift, not as a failure.
- **Fix:** TG1–TG6 below.

---

## Low

### L1. `ht_start` against the two screens before it
`js/story/act1_heart.js:143–147`.
- "Last night something in there sang back": in `heart_view` the tree sang and *his Convergence* sang back.
- "Stand up, tip your head back": `bl_end`, one tap earlier, has all four armed at the doorway and James saying "Let's see who's in."
- "gets nothing at all. That is the worst part": `bl_end` has just shown the doorway "wider than it was last night", pushed from inside by something "waiting to open".
- **Wording:** "…None of that was preparation. Tip your head back, and the trunk goes on past the angle your neck will agree to: …" and "Last night something in there sang, faint as breathing, and your Convergence sang back. This morning it sings again and gets nothing: only the doorway, a little wider than it was. That is the worst part. You are used to Hearth Trees that answer." (keep "gets nothing" → the test at l. 936 pins "sang back" and "gets nothing at all"; adjust.)

### L2. "the scorched pit" is shown before `heart_core` reveals it
`js/story/act1_heart.js:700` (`guardian_calmed`), `js/story/stomp_act1.js:368` (`guardian.win[3]`).
- **Failure:** calm the guardian → "the blank head turns from you to the scorched pit in the chamber floor" (definite, never introduced); next screen `heart_core` presents the hollow as a first sight ("Only the hollow it was cut from is left: black, scorched").
- **Wording:** "…and the blank head turns from you toward the dark behind it, where the floor of the chamber falls away, and the voice is going…"; stomp: "The blank head turns once toward the dark behind it, and back to you." (test l. 983 pins "the scorched pit in the chamber floor" and `/pit/`.)

### L3. Two CW lines of the same joke on one screen, and one of them repeats
`js/story/act1_heart.js:136` (`wake`) and `:622` (`heart_morning`, day 1).
- **Failure:** no food, first morning, `trio < 3` → result line "No breakfast. Ya, who has watched you feed everyone else first since the root road, feeds you…" above scene text "…since the cook, she says, eats last." The `wake` line returns every foodless morning of the stay and every Coil; a throwaway becomes a refrain.
- **Wording for `wake`:** "No breakfast. Ya feeds you: something out of her belt-pouch. You decline. She takes it personally. You eat it." (CW then 2 lines; test l. 963 pins the third.)

### L4. Two year counts James cannot have yet
`js/story/act1_heart.js:245` "six hundred years of elbows"; `:265` "as old as the tree itself, a thousand years".
- **Failure:** Day 16, first hub choice (rings), before the log or the grain → he gives the length of the tree's inhabited life and its age to the century. The cup "as old as the tree itself" also differs from the brief's "came with the ship" (older than the tree).
- **Wording:** "worn glossy by centuries of elbows"; "plain wood, and old: older, by the look of the grain, than the wall it stands in". (tests l. 953–955 pin both.) The old text had the same fault with "a thousand"; acceptable if the owner prefers the numbers.

### L5. `heart_camp`: "The singing has stopped" after the bypass
`js/story/act1_heart.js:556`.
- **Failure:** `guardian === 'lost'` (the crawl; `guardian_bypass` leaves it "singing its one broken note to no one") → camp says "The singing has stopped. In four hundred years the tree has not been this quiet." Old condition, rewritten line.
- **Fix:** needs one condition (code, a pick): for `'lost'`, "Behind the bone door the one cracked line goes round and round, to nobody. You know now what it is asking, and you went round it."

### L6. Yuki "looks at X, then at you" twice running
`js/story/act1_heart.js:259` (`ring_forced`, human) then `js/story/stomp_act1.js:303` (`husks.posture`).
- **Failure:** human form, the seal fails, degree ≥ 2 → "Yuki looks at the hole, then at you." / next screen "Yuki, in her human form, arms folded, looks at them, then at you."
- **Wording (posture):** "${yu(g)} has seen all of them she needs to."

### L7. `ht_leave` ends on the ridge; `rt_start` starts back in the roots
`js/story/act1_heart.js:799` ("from the first black ridge") → `js/story/act1_return.js:91` ("You come out of the roots of the dead tree … blinking").
- Better than "the edge of the trees", still one step backwards. **Wording:** "But you look back at it from the last of the roots, …". Also still open from the notes: `ht_leave` "In your hand, or near your heart" / `mei_carried_seed` against `rt_start`'s "In your hammerspace" (part 7).

### L8. `guardian.win[2]`: "You do not break it" / "broken clean away"
`js/story/stomp_act1.js:349` and `:361`, with the result line "+2 Hull-shards, out of the guardian's broken frame."
- **Wording:** "Two pieces of its frame have come away whole. You take them."

### L9. The great root-kin and the crawl
`js/story/act1_heart.js:738` ("just wide enough to take a body") then `:759` (`heart_core`: "Yuki walks to the edge of the hollow").
- **Failure:** tiger form, bypass → she is in the chamber with no way in. In the notes; not resolved. **Wording (no code):** end `guardian_bypass` with "How Yuki got in ahead of you, you do not ask." (fits all three forms.)

### L10. Outside this part, for the next briefs
- `js/story/act1_return.js:143`: Mei Lin, "The tree sang for a thousand years" (it sang six hundred).
- `js/story/yuki_time.js:137–139` (`heart_hub:2`): "found no rot. Four hundred years dead, and not one fruiting body", against `roots_dark` ("The rot did more than eat the tree. It moved in.") and the new intros ("the rot has had four centuries of dark").

### L11. Before the commit
- `sw.js:2` is still `bone-ash-0.11.172`; `news.js` already carries the 0.11.173 note. `handover.md`, `roadmap.md`, `changelog.md`, `restore-points.md` are not in the diff yet (rules 5 and 7).
- `notes-run1.md` gives `ring_won`'s cup as "made when the ship was new"; the build has "as old as the tree itself" (run 2's fix applied): the handover should record the built wording.
- `project/lore.md:72` cites "`act1_heart.js` 84" for the seal; the line is now `heart_gate_marks` (l. 173).

## Checked, nothing found

- **Forms.** No cat body on the woman, no spoken line on the cat or great root-kin, no tiger on a shoulder or in a lap in any rewritten or new line (`ht_start`, the three new human branches, `roots_fall`, `roots_lost`, `LOG_JUDGE`, `DR_SP_SIT`, `heart_gate_marks`, `heart_core`, the stomp's Yuki lines). `yu(g)` cannot return `undefined` (`yukiForm` falls back to `'cat'`).
- **Too-early facts.** Sweep of the 21 pre-ship scenes and the `husks` / `root_husks` stomps without `ship_found`: no ship, Wren, forty, Ninth Grove or bone door (only L4's years; `roots_won`'s "*hull*" is the scene's own beat).
- **Canon.** Wren Aldous, forty, Ninth Grove, the drive, three centuries, the man in red, three hundred disciples, nine days, six hundred / four hundred years: all kept. No "outlier", no verdict on whose world is normal. `lore.md`'s two edits match the built text.
- **Tone and limits.** Comfort scenes and the spring at the old level (same acts, same fade); no lyrics, artist or title; three CW lines, none in the log, the guardian or the heart-chamber. None of the brief's tics in rewritten lines.
- **Stomp wins.** Each keeps its scene's facts (cup, *Tamsin*, Ya's shoulder; Ya on the husk, hull; green alight, the note stopping, Ya's line, two warm pieces) and leads into the same choices.

---

## Suggested tests

- **TG1. Structure pin for a rewrite push.** Hash of each rewritten file with string contents blanked and `${…}` kept (as `/tmp/p6-rev-tools/skel2.mjs`), stored per file; a push that means to change code updates the hash. Catches the gain, choice order, time and dc faults of M4 and any label, flag or id change.
- **TG2. Mechanical parts.** Exact substrings in the Heart's result lines: "Slept until 06:00. HP and Qi full.", "+1 Hull-shard", "+2 Hull-shards", "+1 Seed-sliver." (×2), "+1 Hearth-log (memory seed).", "−2 HP.", "−4 HP.", "+6 HP.", "+4 HP.", "about 40% of your HP and 10 Qi", "HP and Qi full." in both `ht_leave` lines, "Breakfast. ", "Supper. ".
- **TG3. The log's facts.** `ship_log`: Wren Aldous, "Forty souls", Ninth Grove, Patient Root; `ship_log2`: "three centuries in"; `ship_log3`: "Four hundred years ago", "three hundred disciples", "nine days", "six hundred years"; `log_comfort` (Ya): "Six hundred years".
- **TG4. Nothing named early.** Every pre-ship scene (the 21 above), every form, day index 0–4, flags without `ship_found`, plus `heart_hub`'s text, the camp replies and the `husks` / `root_husks` stomp texts: no `/\bship\b|Patient Root|Wren|[Ff]orty|Ninth Grove/`. And with `ship_found` but not `log_heard`: no Wren, forty, Ninth Grove.
- **TG5. `guardian_won` by state, through `sceneView`.** `g.lastWin = { id: 'guardian', next: 'guardian_won', degree }` for degrees 1, 2, 3 × `guardian_weak` on/off: "whole lullaby" exactly when weak at degrees 1 and 2, never at 3; the choice "Go to the heart." follows. Proves `story.js` passes `g` and covers the scene's own branch.
- **TG6. Stomp facts, properly.** `husks` wins: `/a thousand years old/`, `/Tamsin/`, Ya's shoulder; `root_husks` wins: Ya's "*That* I liked" (degree 2), `/Hull/`; `guardian` wins: "the green in its chest", "It didn't want to stop", "doesn't have to", "two pieces", warm.
- **TG7. Forms, at the source.** For every `byForm(...)` in the two files (parsed): the cat and great root-kin branches contain no straight-quoted speech; the human branch no `*bond*` italics, paw, purr or "in your lap"; the great root-kin branch no "on your shoulder", "in your lap", "on your chest", "on your knee". The render check's speech pattern (`"…," says Yuki`) matches none of this push's lines, which all read `"…," she says`.
- **TG8. Later days in the render sweep.** The sweep (l. 988) never calls `onDay`, so `byDay` / `byDayLast` lists show only their first entry: add day index 0–4 (the spring's and the guardian's days 2–3, mornings 2–4, the three night pools).
- **TG9. The years outside the scene file.** No "thousand years" in `yuki_time.js`'s `heart_hub:*` lines (after M2).
- **TG10. The seam.** `ht_start`'s text has no `/Stand up/` and names who sang (after L1); `sect_cut`'s first paragraph, rendered with only `sect_marks`, has no `/lay far below/` (after M1).
