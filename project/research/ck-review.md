# Cold review: v0.11.218 (CK1 = RF3 + G1 + TX3), the cook with the women every 3rd day

Opus, cold. Read: the brief, both checklists, `git diff HEAD` (js, tests), the drafts, notes and Fable's brief, grep and line ranges only. Probes on scratch copies (`/tmp/ckr` = the working copy's js, `/tmp/ckr_old` = HEAD's): `/tmp/ckp/p1–p6.mjs` (the cut-off run's), `/tmp/ckp2/p7.mjs` (mine). `packet.mjs --check` on `ck-drafts.md`. Planted faults: `ck-faults-review.json` (13), table below.

## What holds (measured)

- **Label = scene:** a plan run with the read stop on, a save and load before every step, both acts, ~7 cooks a stay: every read stop's label matched the scene text played (p2: 7 of 7 prologue, 7 of 7 Fallout); a save mid-scene keeps the text and the gain (p3); a repeat after a load agrees.
- **Read stop:** the first cook and each of the 3 repeats stop once each, then the plan cooks them without stopping (p2).
- **Coil reset:** after `rewind` no cook flag and no `cook_*` line pool are left (p3).
- **Old calendar:** no `_v`, `_next`, `cook@` flag, no `g.lines` change (the test and R5 both catch a breach).
- **Splitter:** all six results split as bare gains (`reply: ""`).
- **Tics:** `packet.mjs --check`: 0 tics in the six as built; the pairs it lists are common words.

## High

**H1. CG now holds the pot every day a repeat is due and not taken: with the plan's default cook row (0), the routine's pot meals drop to 2 a week.** `js/story/kitchen.js:84` (`potCookDue` → `cookFree`), read by `js/core/tasks.js:821` (`potCardOpen`). Before CK1 the hold ended at the Coil's first cook; now `cookFree` is true again on the 3rd day after every cook and stays true every day until the next cook is taken. `DOOR_START` puts only `yk_time` at 1 (`week.js:43`), so a player who cooked once by hand and runs the plan gets breakfast and midday from the hammerspace for the rest of the stay. Measured (p7: the first cook by hand, then a week's plan with only sits and rests, Fed 50 each morning; `routine pot meals / hammerspace meals` per week):

| | HEAD | CK1, cook row 0 (default) | CK1, cook row 1 |
|---|---|---|---|
| Ashfall (7 days) | 7 / 13 | **2 / 18** | 5 + 2 cooks / 13 |
| Fallout (6 days) | 6 / 11 | **2 / 15** | 4 + 2 cooks / 11 |

So +5 and +4 hammerspace meals a week (≈ +15 a 21-day stay) for the default row; nothing for row 1. p5: on 18 of the 20 stay days after a first cook the pot is held at 08:00 when no repeat is taken (HEAD: 0 of 20). The handover's v0.11.218 notes don't mention it, and rule 7 wants food numbers shown before a balance change. Failure scenario: the owner's Fallout week with the cook row left at 0 eats his smoked meat from Day 3 of the stay while the pot stands open every afternoon (at 15:00 the pot needs Fed < 80, so the supper usually goes to the hammerspace too). Possible fixes for the owner to choose between (not laid out here): hold only when the plan's cook row is 1 or no plan runs; hold only before the Coil's first cook (the old CG); or keep it as is and note the cost.

## Medium

**M1. "Never the same twice running" breaks on an old long-calendar save, which is the owner's own save path.** `kitchen.js:90` (`nextAgain` → 0) and `:116` (`pickLine`). An old save that cooked (`fo_pot_cook`, no `_next`) shows repeat 0 without going through `pickLine`, so the pool has no `last` and no play for 0, and the next draw is 0 again a third of the time: 10 of 40 seeds (Ashfall), 11 of 40 (Fallout) showed repeat 0 twice running (p1). `saves/v0.11.214-long-fallout-day64.json` is in that state (p6: `fo_pot_cook=true`, variant 0). The test checks only that save's first repeat. Fix: when `shown >= 0` and the pool has no record, count it before the draw (set `L.last[pool]` and its play to `shown`), or draw with the shown one left out.

**M2. One beat in five of six repeats: a local's grave ruling as the punchline, and "ruling" twice in the Fallout's.** `kitchen_texts.js:76` "has decided is medicine, and serves accordingly"; `:82, :84` "as one receiving a border post", "She informs you", "by order"; `:100, :102` "She declares the next one burnt", "by ruling of the woman at the fire"; `:108, :110` "as a magistrate sets down a ruling", "as Mei Lin's mother has verified"; `:118` "a boy's count … is checked at both ends". The pot's own line already has "has not yet ruled" (`ashfall.js:265`). Counting is a second shared beat: P3 "counts the egg … counts the bowls", F3 "counts the stack … tells him the number" / "count … checked", on top of the first scene's "The eldest counts under her breath". The repeats come round every 3rd day, so the player sees this shape about 6 times a stay (checklist: a voice habit spreading, v0.11.181 M4; repeated beats). The two "as one / as a" similes are the only ones of their kind in the six, so they're fine.

## Low

- **L1.** `kitchen_texts.js:92` P3's result brings in "the stranger's mushroom fried on top" that the scene never mentions. It's a callback to the first cook (always seen), but it's the result's only new fact: it either needs a word in the text or should go.
- **L2.** `:82–84` P2: "The girl does not turn a single one" (the punchline: she obeys James) and then the result's "one cooked hard, by order, for the eldest". They can both be true, but together they read as a contradiction.
- **L3.** `:113` F3's label "Feed the builders with the women." is the first cook's "Help the women feed the builders." reworded. Fable's brief asked for labels that read "clearly a regular shift, not the first meeting".
- **L4.** James's expertise (checklist M2/M3): `:90` a "stiff batter" of ground millet and one egg pinched into boiling broth has no gluten and would mostly fall apart, so "come up as dumplings" is optimistic; `:98` "a cut bulb of wild garlic" (ramsons are leaves with a thin bulb; the other five texts use the leaves). `:100` "The binding cord": the palisade texts have no cord (Fable flagged it; still in).
- **L5.** `kitchen.js:107–110` a hand-edited or out-of-range `_v` (e.g. 5) shows the first-time text (cookTexts' fallback) but gives no gain (`shown` is not -1). Harmless, but untested (R12).

## Test gaps

- **TG1. The repeats are outside the text tools:** `tools/textlint.mjs:124` `kitchenLines` has `POT_COOK`'s results but not `POT_AGAIN`, and the label and text renders (`renders`, SAMPLES) only ever draw the first-time variant, so tics and reused runs in the six go unchecked (R1 missed). Add `POT_AGAIN`'s four fields to the `kitchen` pool.
- **TG2. Claude's cuts not pinned** (checklist v0.11.185 TG1): "says nothing" (P1) and "lets it be known" (P2) can come back (R2 missed).
- **TG3. The time regex** (`story.test.mjs` CK1) lacks the meal words and "night": supper, breakfast, lunch, dinner, night, sun. It also has no ban on counts of days or visits ("every third day", "again" more than once), which the brief bans (R3, R8, R9).
- **TG4. Results are not run through `splitLine`** (checklist v0.11.181): speech and a two-sentence result pass (R4, R10).
- **TG5. Old-save sequence:** only the first repeat is checked; M1's second draw is not.
- **TG6. CG's cost:** no test of the pot meals over a week with the cook row at 0 after a first cook (H1); the block checks `potCookDue` only on the cook's own days and the two days after.
- **TG7. No canon pin** on the repeats (sensing, Mei Lin's mother in at most two of the Fallout's three; R11).
- **TG8.** A bad `_v` (R12).

## Planted faults (`project/research/ck-faults-review.json`, `node tools/mutate.mjs … --jobs 1`)

Before RV1: 4 of 13 caught (R5, R6, R7, R13); R1–R4, R8–R12 missed (the test gaps above). After RV1: `ck-mutate.md`.
