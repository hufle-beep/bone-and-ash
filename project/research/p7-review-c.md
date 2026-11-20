# Cold review C (code), v0.11.234 (P7-A: RN + ML + TL)

Opus, cold. Read: the diff, both briefs, both checklists, the packet; grep and line ranges only. Probes in `/tmp/rvc-probe` and a scratch copy `/tmp/rv-c` (one measuring hook in its `act1_blackroot.js`; nothing copied back). Runs: Claude's faults and mine through `tools/mutate.mjs` (`node tests/story.test.mjs --games 2 --workers 1`, jobs 1), one models run (4 models × 10 games, `--cal 7`, 29 passed).

**No high or medium findings.** The roof's index, the cooked test and the away rule do what the brief says on every path I walked. The gaps are in the tests: 6 of 16 planted faults passed.

## What was checked and holds
- **RN index:** `% (vday === 1 ? 3 : 6)` matches the list lengths (1 + `ROOF_NEW[1]` 2 = 3; 1 + `ROOF_NEW[2]` 5 = 6), and `ROOF_STAY[k][ri - 1]` has 2 / 5 entries. The text (`seqText` → `byDay`, `% list.length`) and the line after read the same record (`s:supper_roof:<k>`), so they can't disagree. **Old save past 3:** a record of n days now reads n % 6 instead of n % 3 (measured: n = 3, 4, 5 → texts 4, 5, 6 with their own lines; 6 → the old text; 7 → text 2). The text and its line still agree, and a text can't come twice in a row across the update: (n−1) % 3 ≠ n % 6 for every n. A save resting on the roof on update day redraws from the old text to text 4. That is harmless. **Old calendar:** vday 2's roof is `supper_roof:2` index 0 every time (vday 3 goes to `evening`), and the P7-A test pins it.
- **ML:** `bl_cook` is not spaced (not in `SPACED`; `spaceByFam` registers only the wilds' menus; Blackroot days 11–15 are not `STAY_DAYS`). `daily`/`markDaily` both use `dayKey` = `wakeDay`. Probed: cook at 19:00, fireside at 20:00 and at 00:30 → cooked text, index 1 both times. `bl_camp` is not a task hub, so "Cook and eat." is always a story tap. A fireside reached without the cook card (no food) correctly reads no-cook. `FS_AH_T` has no reader other than `ahFire`. `byDay` calls functions. VF keys on the rendered text, so a cooked and a no-cook render of one index are separate entries: a no-cook day after a cooked one shows in full, which is correct. The models test keys on the rendered text too.
- **TL:** absence exists only at the Ashen Hills (`ahDay`). The only menu cards with a `dailyKey` and an absence gate are the spar (`bl_train`, three hubs) and the cinderberries (probe over every `TASK_HUBS` menu). The talks, house-time, Fallout and Heart cards are hub-level choices, which are only ever pushed as `'open'`, so none can say "back tomorrow". Plan: `ah_hub` is not in `WEEK_HUBS` and the Blackroot is not `STAY_DAYS`, so `planCards` is empty there and the read stop is not involved. `taskOpen` is false for both a hidden card and a 'tomorrow' card, so the queue (`runTask` skip) is unchanged. Probed the done-menu path: with both women away and the truffle and beetle used, the cinderberries are hidden; with them there and all three used, all three show tomorrow.

## Low
- **L1. `cookedToday` keys on the card, not the meal.** "Cook and eat." with only honeycomb, smoked meat, cress or berries eats them raw. The camp then withholds the party's cooking line (RV1 L4: "only after a cooked meal"), yet the fireside reads "lends your stew", "you the pot", "since the stew", "You ladle out", "since you cooked it". Honeycomb (25) outranks crab, egg and bracket cooked. If `spoilFresh` empties the pantry, `eatBest` returns [] and `bl_cook` is still marked. Scenario: a long-calendar player with honeycomb and brackets eats the honeycomb at camp, and the next fireside praises his stew. **Measured (40 games, long calendar): 1 of 232 fireside-days had the card taken with an uncooked meal (smoked meat), and that was on text 1, which has no meal line, so 0 meal texts.** Rare. Mark the key only in the cooked branch if it ever matters. (TG-C5)
- **L2. The lint and the packet now read only the no-cook RR texts 2–3.** textlint's later-day samples never mark `bl_cook`. Probe on its `onDay` states: no-cook RR2 rendered 6×, RR3 3×, cooked 0. So the cooked versions, which most players see, left the lint. The `+20 variant words` in `text-baseline.json` is that swap. The packet's "later days" for `bl_fireside` likewise shows only the no-cook RR3 ("You gathered twice…") and doesn't say a cooked version exists. The cooked texts are hash-pinned (TG-T1, now on cooked days), so a change to them is caught, but tics in them are not counted. Fits the open item "TG (the lint's samples)": a sample with `bl_cook` marked on a later day closes it.
- **L3. The roof's modulus duplicates the list lengths.** `3 : 6` is written by hand next to `ROOF_NEW`/`ROOF_STAY`. A seventh later-night text would leave the line after on a cycle of six. `ROOF_STAY[k].length + 1` would follow the list. The test hard-codes `N = 6` too.
- *Note, not a finding:* between 04:00 and 05:00 `wakeDay` has turned over but `textDay` has not, so a fireside then would read no-cook under the evening's index. It can't be reached in practice: the night lock offers no cards after 00:00, and the camp's choices end in Sleep.

## Test gaps
- **TG-C1 (F8, C2 missed): the done-menu path is untested.** The P7-A TL block's "truffle used" case never empties the Forage (the beetle is still open), so `doneToday` is never true. Add two cases: both away with truffle and beetle used → cinderberries hidden; both there with all three used → cinderberries 'tomorrow'.
- **TG-C2 (C1 missed): no fireside after midnight.** A `cookedToday` on the calendar day passes. Take the real "Cook and eat." at 19:30, then read the fireside at 00:30, cooked.
- **TG-C3 (C3, C4, C5 missed): the new texts are pinned by their first words only.** Roof texts 4–6 and lines 4–6 are pinned by first words; the no-cook clauses by one phrase each. TG-T1's pin reads roof days 0–2 and cooked firesides only. Claude's cut "laughing" (reverted to "shaking") passes, and so does a change past the first sentence of `RR2_CLOSE` or roof line 5. Hash a few fixed renders: roof texts and lines 4–6, and the no-cook firesides (RR2 by form, RR3, AH2/AH3 by who is warm).
- **TG-C4:** the ML block and the edited P5-B tests mark `bl_cook` by hand. The real tap path is covered elsewhere (C6, the camp's choice marking another key, was caught: 6 failed), so this is not a gap now. A walk would still keep it if those tests change.
- **TG-C5:** no test for L1 (the card taken, the meal raw).

## Planted faults
| | Fault | Result |
|---|---|---|
| F1 | line after back to % 3 | caught |
| F2 | first week % 6 | caught |
| F3 | cooked test inverted | caught |
| F4 | AH2 open printed as function | caught |
| F5 | AH3 mei keeps the stew | caught |
| F6 | pot versions swapped | caught |
| F7 | TL undone (show path) | caught |
| F8 | TL done-menu path | **missed** |
| F9 | onceADay drops `away` | caught |
| F10 | spar `away` on the wrong woman | caught |
| C1 | `cookedToday` by calendar day | **missed** |
| C2 | done-menu: `c.show?.away` (not called) hides her card with her there | **missed** |
| C3 | Claude's cut "laughing" reverted | **missed** |
| C4 | `RR2_CLOSE` no-cook end changed | **missed** |
| C5 | roof line 5 changed past its first words | **missed** |
| C6 | the camp's cook marks another key | caught |

Claude's: 9 / 10 caught. Mine (`project/research/p7-faults-review-c.json`): 1 / 6 caught. Total 10 / 16.

Checklist addition (code, Tests): **a card or text that reads a "done today" mark: test it through the mark's real setter and on both sides of midnight and the 04:00 turn, and the menu-level "done" path as well as the card's own `show`** (P7 C TG-C1, TG-C2).
