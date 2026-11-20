# P6-A cold review C (code and tests), v0.11.233 build (uncommitted diff)

Reviewer C (Opus, hasn't seen the build). Read: both briefs, both checklists, `git diff HEAD`, line ranges of `act1_blackroot.js`, `remember.js`, `again.js`, `week.js`, `oneoff.js`, `tasks.js`, `textlint.mjs`, `packet.mjs`, `prologue.js`. Scratch copy `/tmp/rv-c` (worktree of HEAD + the five changed files). Renders by script in the scratch copy. Faults through `tools/mutate.mjs` only (`--cmd "node tests/story.test.mjs --games 2 --workers 1" --jobs 1`).

## Logic checked and found right
- **The index:** gate `n >= 5 && (n - 5) % 6`, list `[(n - 5) % 6 - 1]` over 5 entries: beats 6, 7 the old A, B; 8, 9, 10 the new texts; 5, 11, 17… the quiet walk. Rendered beats 4, 5, 8, 10, 11, 47, 100, 1001 on both talks: no throw, the right text each time. A save with `mei_talks` far past 10 is fine.
- **remember.js:** `talkBeat` unchanged; `L.talk_mei[8..10]` is undefined, so `sceneMemory` gives null and the pool is used (rendered: "pool" at 5, 8, 10, 11, 47, 100).
- **again.js:** the fold and VF key on the text itself (`paraKey` / `lineKey`), not on the beat. A six-step cycle only moves the VF fold from beat 8 to beat 11. `VD_MAX` 600 gains at most 6 keys.
- **The plan:** `talk_mei` and `talk_ya` (the Blackroot talks) are not in `PLAN_DOORS`. `planSet('door:talk_mei')` is refused (week.js:251), and the read probe only runs plan steps, so the talks never cause a read stop. `doorSig` and `doorPick` serve only plan doors. `oneoff.js` `REPEAT_DOORS` keeps both talks out of `oneOffLeft`. **Measured by the code path: 0 more plan stops with six texts.** (The `fo_mei` and `fo_ya_time` "two talks" in `DAILY_DOORS` belong to the Fallout and are not changed.)
- **Task mode:** a door card opens the scene, and `tasks.js` has no per-beat logic.
- **The away version:** `AW.talk_mei.s4` is `{ ya }` only. Under `'both'`, `awayText` would fall back to the base text ("Ya, who has been listening…"), but `meiOut = bothAway` hides the door, and awayNow never names Mei Lin alone. Ya's talk is hidden whenever anyone is away, so her herb-girl lines never run with Mei Lin gone. The text lint reads s4 through `DAY_REPLIES['away:talk_mei']` (+1 line, +107 words, as the baseline says).
- **byNight:** it already called a function entry (prologue.js:123, from before this push). No other reader of the camp's list (grep for "holds views on damp wood": only the scene and the test).
- **village_night:** all three form strings carry the line, and the P6-A block checks each form plus nights 1, 2 and 4.

## Findings

**M1 — the camp's night-2 line asks you to cook when there is nothing to cook, including right after cooking.** The line's only gates are the night and `g.flags.fire`, which is never cleared, so it shows on every night-2 camp screen. Rendered in the scratch copy, cat form:
- No food: "You have no food. Yuki has noticed… / The fire crackles like something with tenure… *Forty years of your dumplings… Cook whatever it is. I shall complain, and then I shall eat it all.*"
- With 1 hare, after "Cook and eat." (`to: 'camp'`): the result is "Roast hare… the liver goes to Yuki… *Mine first*". The screen redraws as "You have no food" with the same "Cook whatever it is". The redraw is not folded (SD), because the food line changed the text.

The great form's "Cook accordingly." has the same problem after eating; the human form's "I'll try to be a crowd" is milder.

Options later (gate on `foodCount(g) > 0` and not yet cooked tonight, or rewrite the line to fit no food); no pick offered here.

**M2 — the text lint never renders the new talk texts or the camp line.** `textlint.mjs` SAMPLES set no `mei_talks` / `ya_talks` and no day record for `talk_mei`, so `talkBeat` is 0 on every sample. Beats 1–10 are never linted (tics, reused five-word runs, baseline words). Evidence: `text-baseline.json` "blackroot" is unchanged (6,644 / 8,827) after about 700 new words. Only ashfall (+96) and the away reply (+107) moved. No sample sets `fire` with `forest_day` 2, so prologue is unchanged too. The gap existed before for A and B; this push grows the unlinted settled texts from 2 to 5 for each woman. The cuts Claude made for reused runs are now protected by nothing (see TG-C3).

**L1 — `packet.mjs` can't produce these texts.** Its samples are day 0 and day 2, so `node tools/packet.mjs talk_mei` gives only beat 0 and the quiet walk (beat 2). `node tools/packet.mjs camp` shows no night-2 fire line (0 matches; `village_night` gives 3). The cold reviews of rule 10 had to work from the diff. A future rewrite of these lines can't be handed to Fable as a packet.

**L2 — old saves change text in place.** A save resting on the talk screen at beat 8, 9 or 10 redraws with the new text where it showed the quiet walk, A or B. The read record and VF are keyed on the text, so nothing folds wrongly, and the new text simply reads as unread. Harmless; noted for the changelog.

**L3 — stale comment.** `act1_blackroot.js` talk_mei's end comment still begins "the settled walk a sequence of three past the five beats" before the v0.11.233 note. It reads as history, but `remember.js`'s header ("beats 2 and 5+") is the only place that says what the cycle is now.

## Test gaps
- **TG-C1 (M2):** add `mei_talks` / `ya_talks` samples (beats 5–10, both affection states, Ya away on the Ashen Hills day 4) and a night-2 `fire` sample to textlint, or put the settled talks into POOLS. Then re-save the text baseline with the owner's go.
- **TG-C2:** the branches of beats 9 and 10 are not checked. The P6-A block tests branches only at beat 8, and the cycle loop checks only `startsWith` and sentence counts. Missed: F5 (Mei Lin's 4th on `likesYa`), C1 (Mei Lin's 6th on `likesYa`), C4 (Ya's 6th on `likesMei`), C2 (Ya's 5th herb-girl line on `likesYa` alone), C3 (Ya's 6th herb-girl line never shows). Fix: run the m3 / y3 asserts for n = 8, 9, 10, each with one word from each branch.
- **TG-C3:** Claude's cuts are not pinned (checklist v0.11.185 TG1). "Informs you", "reached a verdict" and the village_night cut are pinned. "As she watches a trail", "smothers it in her sleeve", "She leaves the finger there" and "the uses she has" are not. Missed: C5 ("like a snare" back), C6 (a shared run back).
- **TG-C4 (M1):** no test of the camp line against food or after "Cook and eat."
- **TG-C5:** the away test checks the Ashen Hills on day 4 only. Nothing checks that the s4 text stays away from the Root Road and the Drowned Wood on day 4+, or from the Ashen Hills before day 4. The code is right today (`yaAway`), so this is low.

## Faults
Claude's (`p6-faults.json`): **7 of 8 caught.** F1 to F4 and F6 to F8 were caught (1–4 asserts each); **F5 was missed** (TG-C2).

Mine (`p6-faults-review-c.json`, planted through `tools/mutate.mjs`): **4 of 10 caught.**

| Fault | What it plants | Result |
|---|---|---|
| C1 | Mei Lin's beat 10 warm branch on `likesYa` | missed |
| C2 | Ya's beat 9 herb-girl line without Mei Lin | missed |
| C3 | Ya's beat 10 herb-girl line never shows | missed |
| C4 | Ya's beat 10 warm branch on `likesMei` | missed |
| C5 | Cut "like a snare" reverted | missed |
| C6 | Cut "smothers it in her sleeve" reverted | missed |
| C7 | s4 under `both` | caught (2 asserts) |
| C8 | an own memory line at beat 8 | caught (2) |
| C9 | the great form's camp line dropped | caught (1) |
| C10 | Ya's cycle ends after one round | caught (1) |

Each run took about 84 s per fault.

Do the TG7 assert and the P6-A block catch the brief's four kinds?
- **Index off by one:** yes (F3).
- **A gate left at three:** yes (F1, F2).
- **The wrong away key:** yes (F4, C7).
- **A branch on the wrong woman:** only at beat 8. Beats 9 and 10 are missed (F5, C1, C4).

Not run: `tools/check.sh` (as the brief says), the models test, the browser test.
