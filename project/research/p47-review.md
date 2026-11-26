# P47-B cold review (v0.11.279; Opus, cold)

Read: `git diff` (game, tests, baseline), the brief, both checklists, `p47-measure.md`, `p47-drafts-d1.txt`, Fable's drafts and notes (`/tmp/p47/drafts-*.txt`), excerpts of the scenes around each change. Ran in a scratch copy (`/tmp/rv47`): renders of fo_supper over Days 51–58 and at 23:00 / 00:30 / 04:50 / 05:10 after Day 57; `tools/textlint.mjs --list` and `--corpus`; **one** `node tests/story.test.mjs --games 2 --workers 1` with C4, C5, C6 planted together: **1294421 passed, 0 failed** (2 m 39 s), so all three are missed. Not run: the full check, the models, the task test, `mutate.mjs` (each fault would be its own 2.5-minute run).

## What checks out
- **Q1, YM-3 is in step everywhere.** Label, reply and "As before" all read `dayIndex(g, 's:fo_supper:9')` at one clock. Labels drawn before the text on a fresh evening read `a.length`, which is the index the text's `seqText` then notes (checked label-first on three evenings: equal). `choose` runs `do` before any time (fo_supper's choices have no `time`), so the reply reads the same index. `dd(g) === 9` and the text's day-9 branch agree (both from 05:00; only `atStoryDay` pins differ, and a story choice doesn't run under one): 00:30 and 04:50 after Day 57 still show day 9's pair, 05:10 shows the day-10 labels. Forecasts and dry runs work on clones (`tasks.js` fullClone, `week.js`), so nothing notes the key on a wrong day. Old saves already have `s:fo_supper:9` (since v0.11.224), so a save from mid-week keeps its place. The plan replays by index (`evc`), and F29's whole-week run plus the new regex test cover the six labels. Gains unchanged (tested).
- **Q2, `lastReply`.** No record or a new Coil (`coilStamp`) reads entry 0, the old reply; from the second day on it stays on entry 1. NC1 leaves the list out on purpose. The text lint sees it (`replies`).
- **L3.** `postureCount` uses the same rule as `postureNow`. Every foe postures on the same round, so any people fight with two or more speakers draws the line. "Still swing" is correct: a speaker attacks as usual unless it is flustered (game.js:1427).
- **Texts.** Tested against the evening texts under them: pair 1 fits evenings 2 and 5 (the fight offer, the tooth over the pickles), and pair 2 fits evening 6. The honeycomb, fungus and slopes reply fit canon and tone, and none of the YM replies splits into a gain (`splitLine`).

## Findings
**High:** none.

**M1: the next screen after the new label still says "path".** The label `act1_blackroot.js:1666` is now "drags you aside" (PN-f e), but the screen it leads to, `ya_romance` (`yr_day`), still opens "She hauls you off the path…" (`:1768`). In the Drowned Wood the player taps the reworded label and the next screen brings the path back. Fable's notes flagged it ("not in my keys"); it is in neither the push nor the report.

**M2: PN-f c/e leaves place words in talks that show in the Drowned Wood.** Brief C: "in the Drowned Wood there is no path, no dry ground and no rocks". Still in the code:
- Ya, beat 10: "everything on the path" (`:1646`), and its "both" line, "she tells the road ahead" (`:1656`)
- Mei Lin, beat 6: "keeps her eyes on the ground as she walks" (`:1555`)
- Ya: "jabs the butt of the spear at the ground" (`:1616`)
- Mei Lin, beat 9: "bows to a rock … and then kicks it" (`:1561`). `p47-measure.md` calls the kicked rock "already gone", but it is still there in the same beat this push edits.

These are the measured L4 "the path" / "a rock" counts (Sociable 2.04 a Coil). The test only checks a list of old phrases (TG1).

**L1: the new sulk repeats an old joke.** Ya's new sulk (`:310`, "It is an eloquent back") repeats set 1's "It is an expressive back" (`:302`). Its own set already has "turns her back" two entries earlier (`:308`). The limp's twin is swapped for a back's twin.

**L2: "I checked." twice.** The punchline now ends both the slopes' new reply (`ashfall.js:512`, James) and Mei Lin's quiet walk (`act1_blackroot.js:1567`, the sentence this push rewrote). Both are Mei Lin romance beats.

**L3: Ya's blush line flips direction.** `YA_KISSED.red` (`:298`) has the red "start" at the collarbone, with Ya hunting where it "ends". The spring (`:1435`) has Mei Lin scarlet *down to* the collarbones, and Ya's pre-spring line in the same beat (`:1646`, "red from the neck up… where it starts") uses "start" for the hidden end. A player who reads both versions gets "start" for opposite ends.

**L4: a basket is left in beat 7.** The brief says beat 7 has "no coat, no basket", but its cold branch still ends "laughs … into the basket" (`:1559`). Fable noted it; it was left as briefed.

**L5: L3 has only half the card.** The tag under Say something stays singular, "the speech is now" (`game.js:1283`, `main.js:406`), when two speak; only the tip says "more than one".

**L6: the remark keeps its own copy of the speaker rule.** The remark itself (`game.js:1357`) has its own copy of the posture rule instead of the new `posturing`, so the hint and the effect can drift apart. Planted C6: the hint counts a silenced foe, and every test passes.

**L7: "As before" can name words the player never picked.** On evening 2 the plan writes `As before: "Not at the table." (You'd know.)` after the player picked "Ya. Manners." on evening 1. It is the same index, so this is by design (YM-f), but "As before" sits over new words. Accept it, or have the plan's line name the first evening's label.

## Test gaps
- **TG1:** add a rule over the rendered `talk_mei` / `talk_ya` beats (0–20; warm, cold, both; before and after the spring; each region): no `\b(path|ground|road|trail|uphill|rock)\b`, with any exceptions listed. C4 ("tells the trail") passes today. The rule would also find M2.
- **TG2:** pin Claude's cuts: "(You'd know.)", "lowers her chin", "At home, she says", "the dried meat she is chewing". The YM-3 test compares the labels with `YM_PAIRS` itself, which pins nothing (checklist v0.11.243 TG-C1); pin one word per pair. C5 passes.
- **TG3:** the text lint never sees the YM replies (all six, the old pair too) or `YA_KISSED`. `--corpus` finds 0 hits for "Ya slaps", "decides it is funnier", "obeys that one only", "knife for thread" and "I do not bet on". Add them to `POOLS` (checklist v0.11.181 TG4).
- **TG4:** L3's test builds foes with no `flustered`, so the flustered exclusion is unpinned (C6). Add one real fight with two speakers (collectors or lf_bandits) that reaches `holdNowMany`.
- **TG5:** the slopes' reply is tested through `c.do`, not `choose`. The real path advances 150 minutes before `do`, so walk it once with `choose`.
- **TG6:** test `ya_romance`'s opening under `yr_day` for the label's wording (M1).

## Planted faults (`p47-faults-review.json`)
| Fault | Expected | Why |
|---|---|---|
| C1 ymPair one pair late | caught | YM-3 labels |
| C2 reply pinned to the old pair | caught | YM-3 replies |
| C3 the old blush line after the spring | caught | PN-f b |
| C4 "tells the trail" | **missed** (measured) | TG1 |
| C5 cut reverted | **missed** (measured) | TG2 |
| C6 hint counts a flustered foe | **missed** (measured) | TG4 |
| C7 "a white spore print" | caught | by the TG-C1 hash only; not measured |
