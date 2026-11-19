# Cold review brief: v0.11.230 (owner picks P3-2 = FT + SF, D1, AS1, DB1): the far hunt's and the quiet nights' texts in threes, the drills by who is at camp

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief, the context packet; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run); `node tests/story.test.mjs --games 2 --workers 1` in a scratch copy is fine (about 30 s).

## What was picked (2026-11-19 17:31–17:48)

The rule for repeated texts (`project/roadmap-e.md`): story texts repeat little because a scene read before folds (`js/story/again.js`); since v0.11.229 a one-paragraph text of two sentences or more folds to its first sentence. Left: `far_hunt`'s two thornback bull texts (one sentence each) showed in full again, 0 / 0 / 0.6 / 0.5 a game (Careful / Sociable / Completionist / Cultivator; long calendar, 10 games each). On the long calendar (the game's default) the prologue's stay at Ashfall runs about 40 days, so these scenes come back many times.

- **FT** (texts by Fable, Claude's cuts): `js/story/ashfall.js` `far_hunt` a 3rd text for each quarry (wolves, bull, deer; `byDay` on `far_hunt:<kind>`), the bull's two rewritten as two sentences; `far_won` a 3rd, its 1st rewritten without "a piece at a time… each load" (James's hammerspace has no bottom); `village_night`'s quiet night: one text by form → three by form, `byDay` on a new day key `village_night:quiet` (the scene's `dayKey`, `null` on an arson night).
- **SF-a**: `js/story/stomp_prologue.js` the far wins' degree-2 texts (wolves 1st, thornback 1st and 2nd; `byDay` on `far_won`, two each): their second paragraphs without "in loads".
- **SF-b + AS1** (Fable's, Claude's cuts; Y5, a name swap, Claude's): `js/story/act1_blackroot.js` `away(text, both, ya)`: the Practice drills' replies (`bl_train:1`, `:2`, `:1:f`, `:2:f`, `dayReply`) and the camp's cooking (`bl_camp:0`) have a version with neither woman while both are at the spring (`bothOff`), and the lines naming Ya one without her while she is away (`yaOff`); both read at the Ashen Hills camp only (`region(g) === 'ah'`, as the hub's door cards and `prologue.js` `btWho`'s witness block). Measured before: drill lines naming Ya while she was away 1.2 / 0 / 0 / 0 a game; naming either while both were away 3.0 / 0 / 0.8 / 0.8; the cooking 0.3 / 0 / 0 / 0.
- **SF-c**: `js/story/yuki_time.js` two woman-form lines' "sits down beside you" replaced.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): the four story files, `js/core/news.js`, `sw.js`, `tests/story.test.mjs` (the P3-2 block at the end; the E2-2 block's bull assert; the P5A and D1 blocks read function lines; TS6's render pin re-pinned 5117a3ec → 8de296d0: the other 38,598 renders hash the same on both codes), `tests/tasks.test.mjs` (the keyed scenes list), `tests/tools.test.mjs` and the docs (pins), `tools/text-baseline.json`. The context packet: `/tmp/p3/review-packet.txt` (far_hunt, far_won, village_night, bl_train, bl_camp). The drafts and briefs Fable had: `project/research/p3-brief.md`, `p3-brief2.md`, `p3-drafts.txt`, `p3-drafts2.txt` (Claude's cuts are in the code). My planted faults: `project/research/p3-faults.json` (9).

## What to look at especially

- Canon and continuity of the new texts against where they show: the far hunt past the oak hollow (Blackroot Wilds), the hunters' bow at Ashfall or the oak hollow; the quiet night in Mei Lin's herb loft (Yuki's three forms; time words against 21:00–00:00); the stomp texts' second paragraphs against `far_won`'s three (the same day index; a repeated bow beat on one screen or consecutive ones).
- The `village_night:quiet` key: an arson night (`arsonNight`) in between; the old calendar (each story day one night); `dayKey` read after `enter` (`story.js` `noteDay`), `nightTo` moving the clock.
- `away()`: precedence, `bothOff` / `yaOff` against the door cards (`ah_hub`'s "Ya's gone. So is her spear." / "Find Mei Lin and Ya. They went for water an hour ago."), times when the door is hidden (`late`), the cooking at the camp in the evening while both "are away", the text lint and `packet.mjs` reading function entries in `DAY_REPLIES`, `splitReply` of the results.
- Test gaps (the P3-2 block) and my faults: `node tools/mutate.mjs project/research/p3-faults.json --cmd "node tests/story.test.mjs --games 2 --workers 1"`. Add your own faults in `project/research/p3-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/p3-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
