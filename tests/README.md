# The test and check suite

Everything here lives in git and grows with the game. **Rule (owner 2026-11-06, v0.11.20): every push adds or updates the tests for what it changes; a new kind of check starts log-only and is made strict once its numbers are known.** The hard rules (`CLAUDE.md`) say when to run what: the full check after every build, before the docs, and its exit code is read first.

## Running it

```
bash tools/check.sh          # the full check, before every push (about 113 s on 2 cores since v0.11.27–28)
node tools/check.mjs --verbose  # v0.11.28: every step's last line and the full reports, as before
bash tools/check.sh quick    # 200 bot games each, no browser or sanity check, the leftover scan static only (about 17 s), while building
node tools/check.mjs --jobs 1   # the same, one step at a time (to compare, or on a busy machine)
node tools/check.mjs --list     # the job list as JSON, nothing run (v0.11.21)
```

`tools/check.sh` calls `tools/check.mjs`, which runs the steps in parallel on a job pool (the cores + 1; the two browser parts mostly wait). The two bot tests never run at the same time (each one already uses every core through `tests/lib/shard.mjs`); the sanity check waits for both. The first failure stops everything and prints the last 20 lines of its output; the exit code is 1. Every step prints its time. Since v0.11.21 the job list is checked before anything runs (unique keys, every `after` a job of this mode), a queue that can't move stops the run, and a failure or Ctrl-C kills each job's whole process tree (bot workers, Chromium, the test server); the pool lives in `tools/lib/jobs.mjs`.

**Output (v0.11.28, owner pick O1):** compact by default: one `ok  key  time` line per passing step; under it only the lines a step flags (NOTE, DRIFT, the noise-scaled drift's log-only flags), the last line of sanity (how many numbers it compared) and of the lint (its log-only count), one digest line per bot model (prologue Coil 1 deaths, the mean Coil that clears the prologue / Act 1, the whole game on Coil 1, games that gave up; the whole report if a model block is missing), and the leftover report only when it finds something (stale keep-list entries always show). Ctrl-C writes the log too. The whole output of every step goes to the log file (`boneash-check.log` in the temp folder; the last line says where). A failure prints its last 20 lines as before. The helpers: `tools/lib/report.mjs`; an unreadable models report prints in full rather than hide the numbers. About 8.8 KB → 1.3 KB per full check.

**Timings:** each full check writes `tools/timings.json` (the time of every step and the total), committed with the push. A step more than 25% slower than the stored time (and over 3 s) gets a "(slower: …)" note; it never fails the check. Before v0.11.20 the full check took about 175 s one step after another.

## The steps

| Step | File | What it checks | Alone |
|---|---|---|---|
| syntax | `tools/check.mjs` | every `.js` / `.mjs` file in git parses (`node --check`) | — |
| consistency | `tools/consistency.mjs` | the offline file list in `sw.js` matches the game files; the version is the same in `sw.js` and the docs | `node tools/consistency.mjs` |
| engine numbers | `tests/rules.test.mjs` | Rules Engine C numbers the game uses (HP, Qi, XP, costs) | `node tests/rules.test.mjs` |
| engine's own tests | `tests/engine.test.mjs` | the engine's 126 formula tests on our copy of `formulas.js` | `node tests/engine.test.mjs` |
| old saves | `tests/saves.test.mjs` | every file in `saves/` loads, round-trips and plays 200 steps; checksum, too-new, broken and cut-off saves | `node tests/saves.test.mjs` |
| data integrity | `tests/data.test.mjs` | every id the game refers to exists (hubs, menus, items, forms, `data-*` markers); v0.11.24: every picture in `PICTURES` exists, is offline in `sw.js`, at most 150 KB (8 MB together), on a key some scene shows; `yuki_close` follows Yuki's form; keys without a picture keep code art; v0.11.25: every item `gives()` names is a real item, "Let Yuki hunt" hides only when hares and venison are both full; the Blackroot camp stakes cut the first night attacker exactly (max(1, HP − 3), − 4 with bone-meal, after the scaling and the ally floor; all 4 kinds; the others untouched; each kind its own intro line) and clear in the morning, checked from the 03:07 camp save | `node tests/data.test.mjs` |
| picture palette | `tools/art/palette_check.py` | v0.11.24, strict: every `art/pic` picture is black, white, greys and red (at most 0.2% other colour); gold only in Yuki's pictures | `python3 -I tools/art/palette_check.py --list` |
| content lint | `tools/lint.mjs` | strict since v0.11.21: old mode names, the same label twice in a scene (when neither choice is conditional); log only: choices on the default time | `node tools/lint.mjs --list` |
| test tools | `tests/tools.test.mjs` | v0.11.21: `shard.mjs`'s merge rules and seeds, 1 worker = 2 workers (story 51 games since v0.11.28, tasks 51 games); v0.11.28: the compact output's helpers (`tools/lib/report.mjs`) and the models step's `--off-models` on a tiny real models run; the runner's job list and `validateJobs`, the noise band | `node tests/tools.test.mjs` |
| Act 1 parts | `tests/part.test.mjs` | one Act 1 part alone: links, reachability, 1,000 walks, every "lost" scene | `node tests/part.test.mjs heart` |
| tasks | `tests/tasks.test.mjs` | Incremental Mode: hundreds of rule checks (cards, queue, forecast = reality, Coil, speed by use, sleep, Push, Yuki, Act 1 task screens…) and 2,000 bot games each way; the forecast = reality check on 1 game in 8 (v0.11.21), with a check that every played card was forecast; writes stats for the sanity check | `node tests/tasks.test.mjs --games 200` |
| story | `tests/story.test.mjs` | every link valid, every scene reachable, 2,000 random playthroughs, per-fight win rates; focused walks that must reach their target (v0.11.21, one of them to `yk_night_all`) | `node tests/story.test.mjs --games 200` |
| browser part 1 | `tools/browser.py --part 1` | real taps in headless Chromium at 390×844: Incremental Mode, a running bar kept over a reload, Story Mode, two tabs | `python3 tools/browser.py --part 1` |
| browser part 2 | `tools/browser.py --part 2` | Saves (export all / restore all, backups), the main menu and settings, tooltips and scroll, Meditate on the resting places; v0.11.24: the arrival plate shows James's picture and it loads (800 px) | `python3 tools/browser.py --part 2` |
| watched runs | `tests/tasks.test.mjs --bots-only --track`, `tests/story.test.mjs --track` | v0.11.22, full check only: 300 bot games each way and 300 story games plus the focused walks, with `tests/lib/seen.mjs` watching which flags and items are really read and written (a Proxy; it slows every game in its process, so the big runs don't watch) | `node tests/story.test.mjs --track --games 300 --stats-out x.json` |
| leftovers | `tools/leftovers.mjs`, `tools/leftovers-keep.json` | v0.11.22; **strict since v0.11.23** (`--strict`: a finding not on the keep-list fails, story choices stay log only): files nothing loads or names; game functions and constants named nowhere else, or only by tests (`formulas.js` skipped); CSS classes and ids; flags set but never read, read but never set; items never given or not defined; `boneash.*` keys written but never read; `data-*` markers never read; story choices the bots never saw (as a choice or a task card). The keep-list holds what stays on purpose, each with a reason; the full check prints the whole report. Also fails on a broken keep-list | `node tools/leftovers.mjs [--strict] [--seen a.json …] [--all] [--json]` |
| sanity | `tools/sanity.mjs` | the mechanics invariants and the drift (±5 points, n ≥ 100) of every death, tribute and fight number against `tools/baseline.json`; a log-only noise-scaled line (v0.11.21, below) | `node tools/sanity.mjs` (runs both bot tests itself) |

`python3 tools/browser.py` with no part runs both parts in one browser, in order.

Quick runs (`quick`, 200 games) can't promise full coverage, so since v0.11.21 they print the coverage counts ("reached X of Y", "cards played … forecast-checked") instead of checking them; the full run checks them.

## The drift rule and its noise (v0.11.21)

Measured on 10 replays of the bot games under other seeds (2,000 games each): the spread of each number matches the textbook noise of a rate (measured ÷ formula: median 0.94). **Today's ±5 rule flags 4.0% of numbers on chance alone**, so a change that reshuffles the bots' games is expected to show about 8 drift flags that mean nothing; at the same time it misses 3–4-point shifts on numbers with n ≈ 2,000, and it skips the 16 numbers under n 100. The noise-scaled band (`tools/lib/noise.mjs`: 3 × the number's own noise, at least 2 points, every n) flags 0.23% by chance (about 0.5 per change). It is **log only**: the sanity check prints what it would flag next to the ±5 result. Unchanged code moves by exactly 0 (fixed seeds), so with either rule a flag on a change that should not touch balance is real.

## The leftover check (v0.11.22)

Static first: a small tokenizer (`strip`) takes comments and string text out of the game code, then each kind is matched by name. Flags are read as `g.flags.x`, `g.flags?.x`, an alias (`const f = g.flags`), `once('x')`, `daily('x')`, `flags['x']`, a table looped into `g.flags[k]`; written as assignments, `set(…)`, `markDaily`, `Object.assign(g.flags, …)`, `delete`. Without the bots' data, a flag name that also appears as a plain string is not reported (it may be a key the code builds). Then the bots: the stats files carry `seen` (flags and items read and written, choices shown), and a static finding the bots cleared is dropped. Known gaps (fine for log only): a `const a = 1, b = 2` line finds only `a`; a rewind inside a step reads plain flags until the next step; the test's own read of `g.flags.ending` counts as a read. Strict since v0.11.23 (the owner picked what went and what stays); a new entry on the keep-list only with the owner's ok. Choices stay log only: which ones the bots see shifts with balance.

## Tools that are not steps

- v0.11.26: the tasks test checks the Coil's two wake points from Act 1 (and "Go round again…" at its end, for several outcomes), one count per save and the one-time update of older saves, with the owner's 11:02 save; the story test walks `a1_again`; browser part 2 taps the owner's save through it.
- v0.11.27, **bot models** (`tests/models.test.mjs`, log only): Random, Careful, Completionist and Rusher play Incremental Mode. Since v0.11.28 (owner pick S1) the full check plays Careful, Completionist and Rusher, 500 games each, plus 300 with Yuki's lane off for Careful and Completionist (`--off-models`; 50 games in quick); Random (the tasks test's own bot, already in the drift baseline) only on demand (`--model random`); 1,000 games each by hand when measuring the rebalance; each prints deaths per Coil, Act 1 losses to people (taken), the tribute, the Coils it takes to clear the prologue and Act 1, the whole game on Coil 1, and the key fights. Run one alone: `node tests/models.test.mjs --model careful --games 500`, or `node tools/bots.mjs --model all`. Log only: only a stuck game or a broken same-seed replay fails; what a model did against its own rules is a NOTE line.
- `tools/bots.mjs`: balance numbers only (the tasks test's bots, a summary per Coil): `node tools/bots.mjs --games 1000 [--seed N] [--sensible]`.
- `tools/snap.mjs`: fresh test saves from the current version, by hand, for each new save format.
- `node tools/sanity.mjs --update`: a new baseline, **only** after the owner has seen the drifted numbers of an intended change and said ok.
- `tests/lib/shard.mjs`: splits the bot games across worker processes with a seed per game, so any number of workers gives the same numbers.

## Speed notes

- v0.11.20: the dry runs behind the forecast and card times (`taskMinutes`, `outlook`) copy the game without its journal log and share the Coil snapshot (`dryClone` in `js/core/tasks.js`): about 6× faster per copy, the tasks test 102 s → 60 s. A test compares it with the old full copy on 200 queues.
- v0.11.21: the forecast = reality check runs on 1 game in 8 (it was half of the tasks test's time; the dry runs don't touch the games, so the numbers are byte-identical); per-step checks in the bot loops build their label only on a failure (story test about 14% faster). The full check about 80 s → 70 s (68–73 s in 3 runs; 57–64 s without the new tools step, which costs about 8–10 s). The browser test now waits out the game's 400 ms double-tap guard (`tap()` in `tools/browser.py`): before, about half its taps were silently ignored, so part 1 really plays its 65 taps now (about 46 s) and part 2 takes about 8 s instead of 21. The tools step's 1 = 2 workers comparison plays the tasks games with `--bots-only` (no rule checks; the same stats file).
- v0.11.22: the full check about 61 s (3 runs: 64, 61, 61). The watched runs (15 s and 7 s) start when the tasks test ends and share the cores with the story test (7 → 11 s there); watching inside the big tests would cost about +10 s on the tasks test (+5 s even on 1 game in 8: a Proxy anywhere slows the whole process).
- v0.11.28: the models step 29.8 → 16.4 s (500 games, no Random, Yuki off for two models); the full check 117.6 → 112.9 s (the tasks test 5 s slower in that run: run-to-run noise on 2 cores). Browser part 1 stays one step: it is not on the slowest path (tasks → story → models, about 113 s).
- Next places to look: browser part 1 (about 46 s, the longest step now: it could be split in two), the tools step's share, the tasks test's 2,000 games each way.
- Older note: next places to look when the check grows: the tasks test's 2,000 games each way (the profile: `node --cpu-prof tests/tasks.test.mjs --games 200 --workers 1`), the browser parts' fixed waits.

## Adding a test

1. Put a rule check in the test file of its area (most game rules: `tests/tasks.test.mjs`, near the version block it belongs to, with the version in its label).
2. A new step: add it to `jobs` in `tools/check.mjs` and to the table above.
3. A new balance number: it lands in the sanity check's drift list through the bot stats; update the baseline only with the owner's ok.
