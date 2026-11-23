# P30-A — the cold review's brief (v0.11.262; owner pick P30-A, 2026-11-23)

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, branch `wip/p30-build` (do not commit, push or
edit any file outside `project/research/`). Read `CLAUDE.md` (the hard rules) and `project/review-checklist-code.md` first; read
excerpts only (grep, line ranges), never whole story or test files. Do not run the full check, the models or the task test (Claude
runs them); single unit tests are fine (`node tests/saves.test.mjs`, about 5 s); the story test takes about 3 minutes
(`node tests/story.test.mjs --games 2`), run it at most once. The numbers behind the pick: `project/research/p30-measure.md`.

## What was picked

p13-measure §10 on the long calendar, no balance or save change (the owner: "P30-a go"). Three clocks: `storyDay`
(`js/core/calendar.js`) turns at midnight, the texts' day (`js/core/lines.js` `textDay`) at 05:00, the waking day (`js/core/tasks.js`
`workDay`) at 04:00. 00:00–04:59 after a story day's last calendar day, the Fallout (story days 8–10, calendar Days 44–64) read the
next story day. In play no screen reached it (40 bot games, 0 Fallout screens in the gap; 0 of 39 saves); forced, 434 screens.

- **D1:** `js/story/act1_fallout.js` `dd` and `onStoryDay` read `foDay(g)` = `pinnedStoryDay() ?? textStoryDay(g)` (was
  `storyDay(g)`). `pinnedStoryDay` is the day `atStoryDay` pins while a week's card's result is read (the day its work began;
  `game.js` ~961 → `tasks.js` ~382). A first try without the pin changed the bots' games; with it, 40 of 40 games are the same.
- **D2:** `farewellNow` = `dd(g) >= 10 && calEnd(g, textStoryDay(g)) === textDay(g)` (was `lastOfWeek(g)`, from midnight). At
  00:11 after Day 10's last day (Day 64) the evening was the plain supper and Ashfall ran into the Blackroot's first days (story
  day 11, Days 65–67); now the farewell. 04:30 is unchanged (the Evening card opens at 16:00).
- `lastOfWeek` (`calendar.js`) removed: nothing read it after D2 (the leftovers check flagged it); `storyDay` and `lastOfWeek`
  left the Fallout's import.
- **D4:** the P30-A block at the end of `tests/story.test.mjs`; `tests/README.md`'s row.

## The diff

`git diff main..wip/p30-build -- js tests` (the measure file is the numbers). Game: `js/story/act1_fallout.js`, `js/core/calendar.js`.

## What to return (one file, `project/research/p30-review.md`, under about 8 KB)

1. Findings, each **High / Medium / Low**, with file:line and a concrete failure. High = a player-facing fault, or a test that now
   passes when the game is wrong. Look especially at:
   - every reader of `dd`, `onStoryDay`'s replies and `farewellNow` (the week planner's stop in `js/core/week.js`, the Fallout's
     hub, morning, supper, night, council, Mei Lin and Ya scenes; the flags written by `dd`, e.g. `council${dd}`): can any of them
     now read a different day at a time the player can reach (any hour, not only the gap), with or without the pin? Between 04:00
     and 04:59 the waking day has turned but the text day has not: anything daily (`daily(...)`, `markDaily`) read against `dd`?
   - `textStoryDay` itself ignores the pin and is read directly elsewhere (`act1_fallout.js` ~382 and ~582); `kitchen.js` and
     `house_time.js` compute the same day by hand. Are those consistent with `foDay` where a pinned result reads them?
   - `farewellNow` against the old `lastOfWeek` at every hour of Days 58–67 (and on a save loaded mid-week); can the farewell now
     come a day early or never (e.g. a Day 64 evening before 05:00 of Day 64, a Blackroot span other than 3, `g.calBl` 1)?
   - the removal of `lastOfWeek`: any caller left (main.js, tools, the planner, the docs' pins)?
   - do the new tests test their labels (would each fail with the old code)?
2. Test gaps (TG1 …).
3. Planted faults in `project/research/p30-faults-review.json`, the format `tools/mutate.mjs` reads:
   `[{ "id": "C1", "file": "js/...", "find": "exact text, once in the file", "replace": "...", "note": "what it breaks" }]`,
   4–8 faults in the changed game code (not in the tests), each with "Expected to be caught by …" or "Expected to survive (…)" in
   the note. Do not run them. Claude's own are in `project/research/p30-faults.json`; don't repeat them.
