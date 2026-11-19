# Cold review brief: v0.11.228 (owner pick RE1 = SC + CC + DR + NW): the read stop's cap

You have not seen this build. Review it from `project/review-checklist.md` and `project/review-checklist-code.md` (read both first), cheaply: the diff, this brief; grep and line ranges only, never whole story files. Do not edit the working copy; use a scratch copy (`cp -r` or `git worktree`) for experiments. Do not run `bash tools/check.sh` (the full check has run); `node tests/story.test.mjs --games 2 --workers 1` in a scratch copy is fine (about 30 s).

## What was picked (2026-11-19 12:11, "RE1 go")

The game runs on the long calendar: every stay's story day is a week, with Plan the week (`js/core/week.js`). Since v0.11.214 (RD1) the plan stops before a card or door whose text or result holds a line never shown on screen in this game (`readProbe`, `again.js` `unreadLines`; the record `g.read`, kept across every rewind since v0.11.133). The owner's notes (2026-11-18): 07:56 "schedulable items should have a sequence of three texts max … because if there were no repeats, the scheduler would stop on every single card"; 08:03 "the read cards … should carry over between coils".

Measured before the pick (a scratch copy, the four long-calendar bots, 20 games each, every read stop logged): read stops a game 70 / 70 / 59 / 91 (Careful / Sociable / Completionist / Cultivator); the meridian sessions 28 / 28 / 26 / 58 of them (60 texts, one per meridian and step); stops in Coil 2 and later 12.8 / 12.5 / 6.5 / 4.1, all lines never shown before.

- **SC:** the plan stops for one item's unread lines at most `READ_CAP.n` (3) times in a game. An item (`readItem`): a card, its carried week's work the same item (`week:carry:` stripped); a door; the day's meditation as one item (the plan keys `med:sit`, `med:mer`, `med:qi`). A stop is known by its first unread line (`lineKey`, numbers aside), so running the week again without tapping is the same stop (`readCapOk`), never a new one (`noteReadStop`). Past the cap the item's new lines show in the week's report without a stop (not noted as read). The record `g.readStops` { item: [lineKey…] } is new and optional; an old save reads none. Measured after the build: 71 / 71 / 59 / 91 → 43 / 42 / 35 / 34 read stops a game; taps 886 / 967 / 1,044 / 1,278 → 829 / 910 / 995 / 1,163.
- **CC:** `g.readStops` kept across every rewind with `g.read` (`coil.js` rewind), never taken from the snapshot (`game.js` `coilSnap` deletes it). A test pins that a line tapped in Coil 1 doesn't stop Coil 2.
- **DR** (docs, not in this diff yet): the roadmap's "no repeated texts" lines get the new rule.
- **NW:** a What's new line (`js/core/news.js`) and a sentence in the FAQ's "What carries over" (`js/core/faq.js`).

## Files

`git -C /home/claude/bone-and-ash diff HEAD` (uncommitted): `js/core/week.js` (READ_CAP, readItem, readCapOk, noteReadStop; the stop in `runWeek`), `js/core/coil.js`, `js/core/game.js`, `js/core/faq.js`, `js/core/news.js`, `tests/story.test.mjs` (the RE1 block at the end; `READ_CAP.n = Infinity` at the top for the blocks before; RD1's `strip` without `readStops`), `tests/README.md`. My planted faults: `project/research/re1-faults.json` (12).

## What to look at especially

- The forecast (`planForecast`, a dry run of `runWeek` on a clone): does it count stops the real run then refuses, or the reverse? Does the forecast's outlook and the real run agree at the cap?
- The stop's identity by first unread line: a probe whose first unread line changes between runs without a tap (the day's routine, a different card first after the order changed, a carried job's stretch); a stop the player never taps (taps something else, leaves the hub): is a slot spent on it?
- `readItem`'s keys: every plan key group (`card`, `door`, `pres`, `rest`, `sit`, `mer`, `qi`); doors that repeat; a card id with `:` in it; the carried work's ids (`tasks.js` `carryTaskId`).
- Past the cap: the report's lines unread forever; anything else that reads `unreadLines` (the browser test's `rd1_ui`, `week_read`; the forecast's notes; `main.js` stop text).
- Rewinds: the act's, the whole game's (`a1_again`, `to: 'game'`), KA1's `liftKept`; old saves loaded with stops in the snapshot (none can be, but check `migrate`).
- Test gaps (the RE1 block) and whether my faults are caught: `node tools/mutate.mjs project/research/re1-faults.json --cmd "node tests/story.test.mjs --games 2 --workers 1"`. Add your own faults in `project/research/re1-faults-review.json` through `tools/mutate.mjs`, never by hand.

## Report

Write your findings to `project/research/re1-review.md` (H/M/L with a failure scenario each, numbers where you measured, the test gaps as TG1…, the faults caught), under about 10 KB. Return a short summary.
