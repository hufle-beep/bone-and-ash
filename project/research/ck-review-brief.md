# Cold review brief: v0.11.218 (owner pick CK1 = RF3 + G1 + TX3): cooking with the village women every 3rd day

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief, the packet; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check is running already); `node tests/story.test.mjs --quick` in a scratch copy is fine.

## What was picked (the owner's words and picks)

The owner 2026-11-18 00:57: "cooking with the village women should be a regular occasion. what would cover that?" Picked 01:01 ("Pc1 and CK1 ok"): **CK1 = RF3 + G1 + TX3**, long calendar only; the old calendar stays once a Coil, unchanged.
- **RF3:** the cook card (`pot_cook` in the prologue's village hub `ashfall`, `fo_pot_cook` in the Fallout's `fo_ashfall`; `js/story/kitchen.js`) every 3rd day of a stay, as the visits (S3, `js/story/common.js` `spacedFree`); 7 a stay, 14 a Coil; the plan's cook row repeats (0 / 1, as Yuki's; `js/core/week.js` `DOOR_KEY`).
- **G1:** the gains (Village +3; Mother +2 in the Fallout's) on the first cook a Coil only; the repeats give the meal (+25 satiety, the pot closed for the day) and their scene.
- **TX3:** Fable's texts: 3 repeat scenes per act (label, scene, choice, result line), never the same twice in a row; the first-time scene stays. The owner said "go" on the drafts at 07:56 (rule 10).
- Unchanged and in force: the gate (Village ≥ 90), 09:00–14:59, the pot unused today; CG (v0.11.217, `potCookDue`): the day's routine leaves the pot for the cook until 15:00 on a day the cook can still show.

## How it is built

`cookFree` (long calendar: `spacedFree(g, key, dayKey(g))` with keys `cook` / `a1_cook` added to `SPACED`; old calendar: the Coil flag) feeds `potCookOpen` and `potCookDue`. The scene's `enter` (long calendar only) stores the variant shown in `<flag>_v` (-1 the first cook a Coil) and marks `cook@<day>`; the choice gives the gains only when `_v` is -1, and (long calendar only) draws the next repeat with `pickLine` (`js/core/lines.js`) into `<flag>_next`, so the hub card's label (`cookLabel`, `kitchen_install.js`) and its scene agree. An old long-calendar save that cooked this Coil (the flag, no `_next`): repeat 0, no gain. The texts: `js/story/kitchen_texts.js` `POT_AGAIN`.

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/story/kitchen.js`, `kitchen_texts.js`, `kitchen_install.js`, `js/story/common.js`, `js/core/week.js`, `js/core/news.js`, `sw.js`, `tests/story.test.mjs` (the CK1 block at the end; VQ1's and PT1's edits), `tests/tools.test.mjs`, `tests/README.md`, the docs. Fable's brief, drafts (as built, with Claude's two cuts and one label change noted at the top) and notes: `project/research/ck-brief.md`, `ck-drafts.md`, `ck-notes.md`. The first-time scenes as packet: `node tools/packet.mjs pot_cook fo_pot_cook`. My planted faults: `project/research/ck-faults.json` (10).

## What to look at especially

- The texts against canon, tone (James deadpan, locals overly serious), the time window (09:00–14:59, any day of the stay, any Coil, any order of the repeats), the first-time scenes' facts, and each other (repeated beats, the "as one …" similes).
- Whether the label shown on the hub always matches the scene played (a plan run, a read-stop probe on a copy (`week.js` `readProbe`), a save and load between, a Coil reset, the act change).
- The plan with a repeating cook row: the read stop (each repeat unread once), the forecast, CG's wait on cook days only, the day off's meal.
- Saves: old long-calendar saves (the flag set, no `_next`); the old calendar byte-identical (no new flag, no `g.lines` change).

## Report

Write `project/research/ck-review.md` (findings by severity H / M / L with file:line and a concrete failure scenario, and test gaps), and `project/research/ck-faults-review.json` (your planted faults, `tools/mutate.mjs` format, one exact `find` each), run `node tools/mutate.mjs project/research/ck-faults-review.json --jobs 1 --out /tmp/ck-mut-review.md` in the working copy (it plants in its own scratch copies) and include its table. Reply with a short summary (under 300 words).
