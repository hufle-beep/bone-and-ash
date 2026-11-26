# P51-A — the cold review's brief (v0.11.283; owner pick P51-A, 2026-11-26 19:30: "P51-A")

You review a change you have not seen being built. Repo: /home/claude/bone-and-ash, `main` with the change uncommitted (`git diff`;
the game and tool part also in `/tmp/m/rv/p51-diff.patch`). Do not commit, push or edit any file outside `project/research/`. Read
`CLAUDE.md` (the hard rules), `project/review-checklist.md` (texts) and `project/review-checklist-code.md` first; read excerpts only (grep,
line ranges), never whole story or test files. Do not run the full check, the models or the task test (Claude runs them); single unit
tests are fine (`node tests/appfiles.test.mjs` takes seconds; `node tests/story.test.mjs --games 2 --workers 1` about 3 minutes, at most
once). The machine has 2 cores and another job is using them. For experiments make your own scratch copy (`cp -r` to /tmp/rv51).

## What was picked (G1, step 6's first bundle; `claude/p51-options.md` in the project, copied below in short)
No balance change. Two new kinds of world flag (no new save field, no ID changed); one new phone-only storage key.
- **MT-d** (`js/core/tasks.js` `menuText`, `menuFirst`, `menuTextKey`, `MT`; wired in `resolveWork` after `goTo(menu)` and in
  `runTask`'s door branch): 11 work menus had a text no card drew (about 807 words: `clinic`, `drill`, `fo_clinic`, `fo_council` (a
  different text each of story days 8–10), `fo_drill`, `fo_palisade` (by stage), `rr_scout`, `rt_hunters`, `wild_explore` (a door
  menu), `wild_forage`, `workshop`). Now the first card from that menu brings the text above its own lines, once a Coil per text: a
  world flag `mt:<menu>#<fnv of the first sentence>` (reset with the Coil; not in `KEEP_FLAGS`). The texts are drawn as written (no
  rewrite in this push). The packet of the 11 menus, built on this code: `/tmp/m/rv/p51-packet.txt` (its "seen in play" results show
  the text in front of the result).
- **CP-1** (`js/core/game.js` `capLine`, `CAP_ONCE`): a skill at T10 L10 says "… at T10 L10 (cap)" once a day per skill (world flag
  `cap:<name>` = the clock day), then nothing; before, 2–3 lines on every result.
- **SU-n** (`tasks.js` `sitStopText`, `SIT_EVENING_TEXT`; `meditate.js`): "Cultivate until the limit" stopped by the hub's own
  Cultivate closing (stop `shut`) now says "until the evening, 19:00" (the sits' end time) on a task hub; elsewhere as before. Note: the
  options said 16:00 (the week's evening hour); building showed the sit's stop is the screen's Cultivate closing (19:00 Ashfall and the
  Fallout, 18:00 the Heart, 20:00 the Long Forest), so the text names the real end time.
- **SV-p** (`js/core/app.js` `saveParts`, `partName`, `PART_TEXT`, `SAVE_PART_MAX` 18,000; `js/main.js` `shareToGitHub`, `sharePart`,
  `ghParts`; `tools/joinsave.mjs` with `partOf`, `joinParts`): a shared save over the link limit and over 18,000 characters goes in
  slices, each its own GitHub new-file page (`…-part1of2.txt`) and its own tap; the button names the next part. Two saves had arrived cut
  at exactly 20,001 bytes; where it is cut is unknown (GitHub's page or the phone's clipboard). No save-format change.
- **WB-y** (`app.js` `WELCOME_KEY` `boneash.welcome`, `welcomePrefs`, `welcomeDue`, `welcomeView`, `awayText`, `WELCOME_TEXT`;
  `main.js` `welcomeCheck`, `welcomeHtml`, the setting, the ✕): after 6 hours away a card above the story's status shows the time,
  the place and the journal's last entry (up to 12 lines); it goes with ✕ or the next tap; Settings switches it.
- **L7-f** (`app.js` `tipBox`, `TIP_WIDE`; `main.js` `placeTip`; `css/style.css` `#tip.beside`): on a window 1100 px or wider the held
  card's tooltip opens beside the card.
- Closed as accepted (no code): EA (Eat on story screens), UC (the update check), SDK (target 34), L4 (the forecast's redraw).
- Tools and docs touched by MT-d: `tools/packet.mjs` (a menu with a text is now "drawn once a Coil"), `review-checklist.md`'s task-mode
  line. What's new `0.11.283`.
- **Tests:** `tests/story.test.mjs` the P51-A block at the end; PR2's and VQ1's plan pins (search `P51-A MT-d`): the old pins with MT off,
  new pins with it on (PR2 measured: with the menus' lines and `mt:` flags left out, the same hashes as MT off); `tests/appfiles.test.mjs`
  (A: SV-p, WB-y, L7-f; B: main.js; new mutants); `tests/tools.test.mjs` (the joinsave block; packet's C3 pins re-pinned).

## Questions worth your time
1. MT-d as the player meets it: each of the 11 texts above a card's result (`review-checklist.md`, task mode first): a text that
   contradicts the card under it, the time of day, the week's plan (`js/core/week.js` runs cards by itself; the plan stops before a line not
   read yet), a repeat with the result's own words, a Yuki form or party that may be absent. Is the first-sentence key right for each
   (a text that changes in its opening sentence with state other than the day or stage would show again)? Any menu the save can rest in
   (`deadMenuHub`, the load guard)?
2. CP-1: any path that loses a needed line (a skill that reaches the cap mid-day, the sit summary `sitSummary`, Yuki's lines), or a
   dry run (`dryClone`, the forecast) that sets the flag on the real game.
3. SV-p / WB-y / L7-f in `main.js`: the parts' state across a re-render, a failed copy, a new save between taps; the Welcome back timing
   (hidden / visible / pagehide; the Android app in the background), a recovery screen, a new game; the tooltip on a phone after a PC
   resize.
4. Do the tests pin what changed, and would they catch it going back?

## What to send back
Write `project/research/p51-review.md`: what checks out; findings as High / Medium / Low with file:line and a concrete failure; test gaps
as TG1…; and `project/research/p51-faults-review.json`: 3–6 planted faults in `tools/mutate.mjs`'s format
(`[{ "id": "C1", "file", "find", "replace", "note" }]`, `find` exactly once in its file) the tests should catch, against
`node tests/story.test.mjs --games 2 --workers 1` (or say `appfiles` for a fault in `app.js` / `main.js`). Say for each whether you
expect it caught. Keep the report under about 6 KB.
