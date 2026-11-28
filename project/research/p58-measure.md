# P58 measure: G5's fourth push, the threads' leftovers and the second open copy (v0.11.289 → v0.11.290)

## Before the options (2026-11-28 ~03:40, v0.11.289, scratch copy in /tmp)

The kept pass (`node tests/models.test.mjs --model careful,completionist --games 10 --kept --workers 1 --off 0`, the long calendar), with Yuki's and the lanes' ticks counted against 06:00–19:00 (`tasks.js` `yukiTick`, `threads.js` `threadTick`, both judge the hour at the tick's end):

| | ticks | minutes inside 06:00–19:00 | ticks counting time before 06:00 | ticks dropping time before 19:00 (minutes dropped) |
|---|---|---|---|---|
| Yuki | 94,140 | 10,617,928 | 0 | 2,941 (520,060, 4.9%) |
| the lanes (× lanes on the hub) | 17,601 | 1,625,341 | 0 | 603 (144,356, 8.9%) |

L6-t on the same games (the lanes count only their minutes inside the window, a run at the tick's end): thread runs a game 43.9 → 43.9 (Careful), 36.8 → 36.6 (Completionist); realm at Act 1's end 2.00 / 3.00 both. A lane keeps at most one run's worth (`l.p = min(len, …)`), so the dropped minutes don't change a run. Deaths in the kept pass: 0% (n 20).

- **TR:** each lane gains its own time and runs its own card; lanes share nothing but the hammerspace (Smoke the catch uses what Forage brings): 0 of 9 lanes compete for time.
- **DM:** 22 of 22 ids a thread may hold are food cards (P54: the Wilds' Forage 4 and Hunt 3, the Long Forest's Forage 3 and Hunt 2, the Blackroot camps' Forage 2 each, Smoke the catch on four hubs); 1 of the 9 domains has cards.
- **MT:** P54: 61–67 cards a game hold familiarity (Careful at the end 9 / 14 / 24 / 17 New / Practised / Skilled / Mastered). The P55 stop: seven labelled tabs at 360 px were 71 px tall and 10 px off the edge.
- **SC:** `main.js` `autosave` wrote `boneash.auto` on every tap with no check; only `closeSave` (v0.11.8) compared the stored save with `lastWritten`. A late save is ~115 KB (P57).
- **L7:** `.thread-pick` and `.thread-lane` had 0 CSS rules; the picker drew `button.card`s inline (up to 8 on the Wilds plus Off).

## In the build

- The Mastery list on the 14 saves in `saves/`: 204 rows as first built, 3 of them Yuki's own card (`wild_hunt:3`, the Wilds' `notJames`; Mastered 25.4 in `2026-11-13-1356-incremental-a1_again.json`); after RV-A (M1-f): 201 rows, 0 of hers; 19 rows under 1 (known only by a share). The late save `a1_again`: 104 → 103 cards in 9 places, 45 work cards and 58 doors (27 doors with a count still to Skilled).
- A new game after one Militia drill at the prologue's Ashfall: 7 rows, 6 never run (the Clinic's and Workshop's at 0.2, the drill's other card 0.3): kept (M1-f: "every card James knows").
- The threads' picker at 360 px (the browser test, the Wilds on the long road): the task cards' pane is 291 px, one column; the picker after L1 (9 rem) two columns, no card wider than its column. Before L1 the reviewer measured the picker one column, 0.8 px short of two.
- No balance change; no save field.
