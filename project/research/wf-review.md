# Cold review: v0.11.221 (WB = SK + CN), the wilds' work cards every 3rd day from Skilled

Opus, cold. Read: the brief, both checklists, `git diff HEAD`, excerpts of common.js, wilds.js, tasks.js, week.js, main.js, coil.js, lines.js, prologue.js. Measured in scratch copies (`/tmp/wfr` = this build, `/tmp/wfo` = HEAD's five changed files), with the test's own week harness (`runWeek` + `eveningPick`/`storyTap`/`afterStory`, READ_STOP off).

## Verified (no finding)
- **Card ids:** `${menu}:${i}` is tasks.js's id (taskCards `forEach((c, i)` over `scenes[menu].choices`). Nothing pushes, unshifts or splices into `wild_forage/hunt/train`. The prologue's form wrapper (prologue.js ~1283) replaces `show` but copies `dailyKey`. The registration runs at wilds.js load, on the same choice objects. The 12 keys appear nowhere else in `js/` (grep, every quoting).
- **Other keys:** `famReady` is true for a key not in `FAM_KEY`. Doors, the cook, the Heart's talks, `unspaced`, `spacedNext`, `doorCards` and the forecast's JSON clone are unchanged (F6 caught, 34 failures).
- **Story Mode** has been gone since v0.11.41. `g.tasks.fam` exists in `newGame` and in `st()`, and `?.` covers an old save.
- **Coils:** familiarity is kept (coil.js 153), and the `key@N` flags rewind with the snapshot. A later Coil's wilds cards are spaced from the first stay day, as SK intends.

## H1: a Skilled or Mastered wilds week now stops hungry when Yuki's lane is off
The brief's numbers (New 7, Practised 14, Skilled 19, Mastered 21) were measured with 30 hares added and Fed 80. On the owner's own save `saves/v0.11.204-long-wilds-day2.json` (Fed 42, no food, Yuki's lane off), I set the wilds cards to Skilled or Mastered (as in Coil 2+, where familiarity is kept) and planned every card at 9:

| fam | HEAD | this build |
|---|---|---|
| ≥8 (Skilled) | 25 runs, runs to the week's end, Fed 86, food 45 | **8 runs, stops `hungry` on calendar Day 5 06:16, Fed 2, food 0** |
| ≥18 (Mastered) | 36 runs, Fed 93, food 50 | **8 runs, stops `hungry` on Day 5, Fed 22, food 0** |

Trace (Skilled): on Day 2 the four forage cards run. Day 3 runs berries, crab and blade; Day 4 runs feet and needle and drops Fed 30 → 5. The forage cards are closed on Days 3–4 and nothing else brings food. The stop comes on the morning the ring and cress open again. It is not a soft lock: the open cards are not "Starves here", so a tap goes on. With Yuki's lane on, the week runs (16 runs, Fed 90, against HEAD's 25 runs, Fed 93).
**Scenario:** a Coil-2 player without the lane plans the wilds week as before. On Day 5 the plan halts at Fed 2 where it used to run to the end with 45 food. SK was picked to spare "a slow player's food" (the New 7 → 6 hunger stop); this is the same stop for the fast player, and the numbers given to the owner hid it.

## M1: "yesterday" in two reply texts now falls on a 3-day gap
`dayReply` picks by the distinct calendar days the reply has shown (`textDay` is the calendar day), so the second text shows on every second visit. Two of those second texts say "yesterday":
- `DR_RING[1]` (wilds.js 61): "The ring has closed the gaps you cut **yesterday**."
- `DR_BLADE[1]` (wilds.js 68): "a finger longer than **yesterday**".

Measured (long calendar, ring Skilled): the ring is taken on Day 2 and is closed on Days 3–4. Day 5 prints "+3 Jade bracket fungus. The ring has closed the gaps you cut yesterday." On HEAD the card came back daily, so the word was true. Every Coil from the second has only spaced visits, so this shows every second visit there. The texts are Fable's: a fix is a draft per rule 10 (open, options later).

## M2: the plan panel can't tell the player what a spaced card can do this week
- The CN note is always the bare "every 3rd day". A repeating door's row adds ", opens Day N" when it is closed (`doorNote` with `next`). CN was specified "as a repeating door's row does".
- The forecast rows: from the save's Day 2, a spaced card fits 2 runs a week (Days 2 and 5). With every wilds card at 3, HEAD reads "· done Day 4 09:35" and similar, while this build reads "**· not this week**" on all eight rows. Setting 7 (the old "every day") gives "not this week" everywhere. Doors say "N visits this week"; cards have no such count.
- The "Cards" total still counts every set run: at 9 each it reads "Cards 201 h 36 m; 51 h 58 m left", although at most 2–3 of each can run.

**Scenario:** the player sees every row "not this week", reads it as too much work, and cuts counts that were never the limit, or can't find what count fits.

## L1: "Let Yuki hunt" does gain familiarity (the brief says it never does)
`learn()` gives TRANSFER 0.25 × gain to every `hasWork` choice in the same menu, and DRILL_SHARE 0.2 from Practice. `wild_hunt:3` (`time: 60`, `do`) is one of them: it reached **8.7** in one planned week from fam 7. Its key `yukihunt` is spaced from then on. That only matters where the `wild_hunt` menu is drawn as a story screen, such as a save resting in it (deadMenuHub); in task mode it is `notJames` and has no row. It is harmless, but the registration covers a card the player never has. The test's SK loop uses `wild_hunt:3` as one of "the cards open at the start".

## L2: a card can cross into Skilled through another card's run, and close behind it
Transfer and the Practice drill raise every card in the wilds. In the fam-7 week every card was Skilled within the first day, and that week matched the Skilled one (19 runs). "Practised 14 unchanged" holds only at low familiarity (2).

A card taken yesterday as Practised (7.9) that crosses today through a Practice run (+0.2) reads as closed today and tomorrow, although it was open this morning. This follows from SK ("its own card's familiarity", read now). Info for the owner. The run that makes a card Skilled counts as its last take (closed two days), consistent with SK.

## L3: housekeeping
- `sw.js` VERSION is still `bone-ash-0.11.220`, while news.js has the 0.11.221 line. It needs bumping before the push.
- A spaced, closed card leaves the hub screen (status `tomorrow` is filtered out, main.js ~339). Nothing on the hub says it is back in two days; only the plan row says "every 3rd day". The "Done for today. Back tomorrow." texts are not drawn for it, so nothing false shows.

## Test gaps
- **TG1 (H1):** the WB week adds 30 hares and Fed 80, which hides the hunger stop. Add a week from `saves/v0.11.204-long-wilds-day2.json` at Skilled with Yuki's lane off, and pin its stop and Fed, against HEAD's run to the week's end (25 runs, Fed 86).
- **TG2 (M1):** nothing reads the reply texts of a spaced card against the gap since its last visit. Add a time-word check over `DAY_REPLIES` for the 12 spaced keys (`packet.mjs --check` covers time words against when a line shows).
- **TG3 (M2):** no test of the forecast row or the "Cards" total for a spaced card, and none of the closed card's ", opens Day N".
- **TG4 (RF8 missed):** the stay rule is not pinned for the wilds keys. Spacing them on journey days too passes. It is likely harmless (the wilds hub is a stay-1 hub), but nothing would notice.
- **TG5 (L2):** familiarity is only ever set by hand. No test walks a card crossing into Skilled through a real run (its own, transfer or the drill), or a Coil-2 rewind with familiarity kept and the cards spaced from the first wilds day.

## Faults
- Claude's `wf-faults.json`: **9 of 9 caught** (F7 and F8 by one assertion each).
- Mine, `project/research/wf-faults-review.json` (through `tools/mutate.mjs`, against `node tests/story.test.mjs --quick`): **7 of 8 caught**.
  - Caught: RF1 `>` for `>=`; RF2 familiarity read under the key; RF3 the whole menu spaced by one card; RF4 the dart cards left daily; RF5 KEY_OF swapped (note never drawn); RF6 every 2nd day; RF7 Mastered daily again.
  - **Missed:** RF8, the wilds keys spaced on journey days (TG4).
