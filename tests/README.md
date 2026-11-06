# The test and check suite

Everything here lives in git and grows with the game. **Rule (owner 2026-11-06, v0.11.20): every push adds or updates the tests for what it changes; a new kind of check starts log-only and is made strict once its numbers are known.** The hard rules (`CLAUDE.md`) say when to run what: the full check after every build, before the docs, and its exit code is read first.

## Running it

```
bash tools/check.sh          # the full check, before every push (about 70 s on 2 cores)
bash tools/check.sh quick    # 200 bot games each, no browser or sanity check (about 17 s), while building
node tools/check.mjs --jobs 1   # the same, one step at a time (to compare, or on a busy machine)
```

`tools/check.sh` calls `tools/check.mjs`, which runs the steps in parallel on a job pool (the cores + 1; the two browser parts mostly wait). The two bot tests never run at the same time (each one already uses every core through `tests/lib/shard.mjs`); the sanity check waits for both. The first failure stops everything and prints the last 20 lines of its output; the exit code is 1. Every step prints its time.

**Timings:** each full check writes `tools/timings.json` (the time of every step and the total), committed with the push. A step more than 25% slower than the stored time (and over 3 s) gets a "(slower: …)" note; it never fails the check. Before v0.11.20 the full check took about 175 s one step after another.

## The steps

| Step | File | What it checks | Alone |
|---|---|---|---|
| syntax | `tools/check.mjs` | every `.js` / `.mjs` file in git parses (`node --check`) | — |
| consistency | `tools/consistency.mjs` | the offline file list in `sw.js` matches the game files; the version is the same in `sw.js` and the docs | `node tools/consistency.mjs` |
| engine numbers | `tests/rules.test.mjs` | Rules Engine C numbers the game uses (HP, Qi, XP, costs) | `node tests/rules.test.mjs` |
| engine's own tests | `tests/engine.test.mjs` | the engine's 126 formula tests on our copy of `formulas.js` | `node tests/engine.test.mjs` |
| old saves | `tests/saves.test.mjs` | every file in `saves/` loads, round-trips and plays 200 steps; checksum, too-new, broken and cut-off saves | `node tests/saves.test.mjs` |
| data integrity | `tests/data.test.mjs` | every id the game refers to exists (hubs, menus, items, forms, `data-*` markers) | `node tests/data.test.mjs` |
| content lint | `tools/lint.mjs` | log only: choices on default time, check labels, old names, duplicate labels | `node tools/lint.mjs --list` |
| Act 1 parts | `tests/part.test.mjs` | one Act 1 part alone: links, reachability, 1,000 walks, every "lost" scene | `node tests/part.test.mjs heart` |
| tasks | `tests/tasks.test.mjs` | Incremental Mode: hundreds of rule checks (cards, queue, forecast = reality, Coil, speed by use, sleep, Push, Yuki, Act 1 task screens…) and 2,000 bot games each way; writes stats for the sanity check | `node tests/tasks.test.mjs --games 200` |
| story | `tests/story.test.mjs` | every link valid, every scene reachable, 2,000 random playthroughs, per-fight win rates | `node tests/story.test.mjs --games 200` |
| browser part 1 | `tools/browser.py --part 1` | real taps in headless Chromium at 390×844: Incremental Mode, a running bar kept over a reload, Story Mode, two tabs | `python3 tools/browser.py --part 1` |
| browser part 2 | `tools/browser.py --part 2` | Saves (export all / restore all, backups), the main menu and settings, tooltips and scroll, Meditate on the resting places | `python3 tools/browser.py --part 2` |
| sanity | `tools/sanity.mjs` | the mechanics invariants and the drift (±5 points, n ≥ 100) of every death, tribute and fight number against `tools/baseline.json` | `node tools/sanity.mjs` (runs both bot tests itself) |

`python3 tools/browser.py` with no part runs both parts in one browser, in order.

## Tools that are not steps

- `tools/bots.mjs`: balance numbers only (the tasks test's bots, a summary per Coil): `node tools/bots.mjs --games 1000 [--seed N] [--sensible]`.
- `tools/snap.mjs`: fresh test saves from the current version, by hand, for each new save format.
- `node tools/sanity.mjs --update`: a new baseline, **only** after the owner has seen the drifted numbers of an intended change and said ok.
- `tests/lib/shard.mjs`: splits the bot games across worker processes with a seed per game, so any number of workers gives the same numbers.

## Speed notes

- v0.11.20: the dry runs behind the forecast and card times (`taskMinutes`, `outlook`) copy the game without its journal log and share the Coil snapshot (`dryClone` in `js/core/tasks.js`): about 6× faster per copy, the tasks test 102 s → 60 s. A test compares it with the old full copy on 200 queues.
- Next places to look when the check grows: the tasks test's 2,000 games each way (the profile: `node --cpu-prof tests/tasks.test.mjs --games 200 --workers 1`), the browser parts' fixed waits.

## Adding a test

1. Put a rule check in the test file of its area (most game rules: `tests/tasks.test.mjs`, near the version block it belongs to, with the version in its label).
2. A new step: add it to `jobs` in `tools/check.mjs` and to the table above.
3. A new balance number: it lands in the sanity check's drift list through the bot stats; update the baseline only with the owner's ok.
