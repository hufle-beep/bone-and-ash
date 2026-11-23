# P30 — p13 §10 on the long calendar: the numbers (2026-11-23, on v0.11.261, scratch copies only)

Scratch copies `/tmp/p30w` (`git archive HEAD`, v0.11.261) and `/tmp/p30f` (the same with the trial fix); nothing copied back but
the picked change. Hooks in the scratch `tests/models.test.mjs` only, after `sceneView` in the bots' loop.
Run: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7` (40 games).

## The gap
`storyDay` turns at midnight (`calDayOf`), the texts' day at 05:00 (`lines.js` `textDay`), the waking day at 04:00 (`tasks.js`
`workDay`). They differ only 00:00–04:59 after a story day's last calendar day.

## 1. In play (bots)
- 1,193 screens (about 30 a game) where the midnight story day differs from the text day: all night screens of the wilds, the
  village, the Blackroot and the road (`bl_night_event` 420, `bl_night_won` 198, `night_event` 186, `night_attack` 93,
  `village_night` 89, `jackals_fled` 69, `night_won` 41, `arson_won` 28, `rt_camp` 27, …), hours 00 and 01 only.
- Each read again with the story day pinned to the text day (`atStoryDay`, on a `structuredClone`): **0 of 1,193** a different
  text, **0** different choices (those scenes key on their counters).
- The Fallout and the Heart: **0** screens in the gap. The Fallout's cards close at 19:00 (`late`); after that only "Eat
  something" and "Evening".
- A search of tap paths from 15 Fallout last evenings (15:00–16:00, every choice but the evening's, up to 4,000 states each):
  none crosses midnight.
- Saves: 39 read as they load; **1** in the gap (`2026-11-12-2046-incremental-bl_night.txt`, 01:25, story day 12 / text 11):
  the same text and choices either way.

## 2. Forced (minutes set past midnight on a week's last evening; no tap path found)
Per visit of a Fallout scene at 17:00+ on a week's last day, the clock moved to the next day's 00:11 and 04:30:

| story day, scene | 00:11 | 04:30 |
|---|---|---|
| 8 `fo_supper` | 105 of 105 another text (day 9's) | 105 |
| 9 `fo_supper` | 105 of 105 other choices (day 10's: no "Ya. Manners.") | 105 |
| 9 `fo_night` | 2 of 2 text | 2 |
| 9 `fo_mei` | 1 of 1 text and choices | 1 |
| 9 `fo_ashfall` | 0 | 2 choices (the spy card) |
| 10 `fo_ashfall` | 6 choices ("Sit with Yuki": `common.js` `spacedNow`, story day 11 not a stay) | 0 |
| total | 219 | 215 |

Day 10's last night at 00:11: the evening is the supper, not the farewell; Ashfall's hub runs on into the Blackroot's first
calendar days (story day 11), 2 of 2 walks. At 04:30 the Evening card is shut (it opens at 16:00).

## 3. The trial fix
- First try: `dd` and `onStoryDay` by `textStoryDay` alone. The Sociable's games changed (6,821 → 6,841 cards, talk doors
  134.6 → 135.9): a week's card's result reads under `atStoryDay` (the day its work started; `game.js:961` →
  `tasks.js:382` → `fo_council`'s text and its `council${dd}` flag, 77 + 44 + … reads a run), and `textStoryDay` ignores the pin.
- Second try (the picked one): `pinnedStoryDay() ?? textStoryDay(g)`; `farewellNow` by the text day
  (`calEnd(g, textStoryDay(g)) === textDay(g)`). The 40 games' output: **0 lines differ**. Forced: 434 → **6** (the 6 hub
  screens of `spacedNow`). Day 10's 00:11 walk: Evening → `fo_farewell` → `fo_last_night` → `fo_depart` → `bl_start` on story
  day 11. 04:30: as before.

## Open, options later
The one clock (the story day from 05:00 everywhere), `common.js` `spacedNow` in the gap, the Heart's two reads (`late`,
`act1_heart.js:795`; 0 bot screens on its weeks' last evenings).
