# P19-A cold review C (code), v0.11.249

Scratch copies `/tmp/rv-c` (faults) and `/tmp/rv-c2` (gainCounts instrumented to log, measurement only). Probes in `/tmp/rv-c-scripts/probe*.mjs`. No high findings.

## Medium

**M1. TB: a 0-minute trip back to a carrier uses up a second due tier without showing it.** `closing()` runs `mark` on every `enter`. "Yuki: change form." (on `supper`, `bl_camp` and `heart_camp`) goes to `yuki_form` and back through `go()` at the same minute, so the enter runs again. If a second tier is due, its flag gets the same minute. `tierBeat` then finds the first tier in TIERS order, so the screen keeps the old beat and the new one is never shown that Coil. Probe 7: supper, Mei Lin a 80, so mei30 shows. After the form screen and back, `tb_mei30 = tb_mei72 = 42900`, and the next supper shows nothing. This path is likely on the lover path: switching Yuki to human at camp opens "Walk out past the firelight". Fix: in `mark`, set nothing if any of this carrier's tier flags already equals `g.minutes`.

**M2. RL: crossing into Act 1 drops `coil.mrl` and `coil.rlc`.** `startActCoil` builds a new coil with `makeCoil` and copies only `n`, `known`, `best`, `free` and `start.fam`. Probe 1: `{mrl: 1, rlc: {evening2: 2}}` becomes `undefined / undefined`. What goes wrong:
- (a) Every crossing wipes `rlc.evening2`. On each later whole-game pass, evening2 shows its first remembered line again and never reaches the second or third.
- (b) The crossing Coil has no record until an Act 1 rewind sets it again from that Coil's peak. If Mei Lin's Act 1 peak stays under 30 (she reached the bar in an earlier prologue Coil but not this one), talk_mei never carries the line.

Fix: copy `mrl` and `rlc` in `startActCoil`, as `best` is copied.

**M3. GT1's key is the scene, so one-off story gains that share a scene with other gains are dropped.** Measured over 15 games per model, long calendar, every Coil, raw gains before catch-up. The figures are gains lost per game (Careful / Completionist / Sociable / Cultivator):

| Gains lost per game | Careful | Completionist | Sociable | Cultivator |
|---|---|---|---|---|
| Another choice of the same scene, on another day of the story day: Mei Lin's affection | 33.6 | 29.5 | 41.1 | 18.3 |
| The same, Ya's affection | 1.8 | 17.1 | 19.7 | 22.7 |
| The same choice again (what the pick meant to stop): Mei Lin's affection | 285 | 144 | 318 | 147 |
| The same, Ya's affection | 46 | 63 | 69 | 68 |

Examples (the first of the two choices counted, the second was dropped):
- `herb_slopes`: "Learn properly…" first, then "Answer her question. Honestly." (+3/+5) dropped.
- `rr_scout`: the once-only question "You followed me for weeks?" (+2/+4) and "Learn it properly" (+3/+2) drop each other.
- `talk_mei` Listen / Flirt, and `talk_ya` the same.
- `heart_spring`: "Wash" first, then "Get in" (Ya +3/+5) dropped.
- `supper`: the roof (+3/+4) and the dishes drop each other.

The result text still reads as a warm moment while the number does not move. This follows the pick to the letter ("a scene's gain"), but it is wider than the stated intent ("the nightly walk and the suppers"). Owner call: key by `scene|choice` (or `scene|choice|who`), or keep it as is.

## Low

**L1. Two beats on one evening.** Re-entry after time has passed counts as a new visit. `yk_sister_talk` "Go and sit with them. As instructed." returns to `bl_camp` 20 minutes later. Probe 4: mei30:camp shows on arrival, then ya45:camp at 17:20 the same evening. The brief's "one a visit" is per `enter`, not per evening.

**L2. Midnight.** `choose` runs a choice's `do` after its time has passed (`advance` comes before `do`), and GT1's calendar day starts at midnight. If a scene is entered before midnight and its choice ends after midnight, the choice's gain is lost. Probe 3: supper at 23:50 +4 counts; the choice at 00:10 (+3/+4) is dropped. Bots: Random 2 of 1,115 drops, the other models 0. Fix: use the waking day (05:00), as `workDay` and `textStoryDay` do.

**L3. Pinned story day against the calendar day.** A carried result run inside `atStoryDay(8)` but landing in week 9 overwrites the week-9 record with `[8, day]`, so week 9 counts twice. Probe 4 (in probe1): a = 3, where the rule gives 2. Bots: 18 pinned calls (`fo_ashfall|Mei Lin`) in 15 Random games, 0 overwrites seen. Fix: never replace a record whose story day is later than `sd`, or key pinned calls by the calendar story day.

**L4. GT1 caps friendship as well.** Mei Lin's friendship lost per game: 210 / 121 / 249 / 124 (Careful / Completionist / Sociable / Cultivator, raw). The measurements show affection only. Friendship read by the story: `act1_return.js:142` (Ya f ≥ 20) and `prologue.js:906` (Mei Lin f > 10). If this is intended, say so in the changelog. Nothing tests it (R1).

**L5. The value of `mrl` is never read, only `!= null`.** That is why F9 is inert. Either read it (for example, `n > mrl`) or document it as a flag.

## Checked, no finding
- **The old calendar:** `longCal` is checked first, and no record is written (F3 caught).
- **The snapshot:** `coilSnap` deletes `wg`; a rewind replaces `g`; the act's change re-keys `act:n`.
- **dryClone:** deep-copies `wg`, so the forecast doesn't write the real record.
- **Saves:** `serialize`/`deserialize` keep `wg`, `mrl`, `rlc` and the `tb_` flags (probe 6).
- **Other writes:** no direct writes to `rel` besides `bumpRel` and the rewind's head start.
- **Meta screens:** no gain call on a meta screen (every key seen is a story scene, 95 keys).
- **Meditate return** (`med_back` skips enter): the beat goes once minutes move, which is fine.
- **Night fold:** `fo_night` is in FOLD_SCENES; the fold stops on a changed text hash, so a beat isn't folded away (code read, not run).
- **Wrap order:** nothing wraps the six carriers after `installRomance`. `musicLine` (main.js) is still drawn under the text, so on `bl_camp`/`heart_camp` a music line can follow the "closing" beat (a texts question).
- **AL:** last at index 6, saved picks unchanged.
- **Re-pins:** the GT1-off runs equal v0.11.248's pins, so the six Fallout re-pins come from GT1 only.
- **Presence:** the camp is entered at 19:00 (`late`), so `awayNow` is null and no beat names an absent woman (probe 5).

## Test gaps
- **TG-C1:** GT1 is tested only by calling `bumpRel` with hand-set scene and minutes. Nothing walks `choose` (`do` after the time), a hub card, `atStoryDay` or midnight (L2, L3; R6 missed).
- **TG-C2:** mixed-sign gains on a blocked day (F4 missed). Real calls exist: `act1_fallout.js:599` Ya −2/+2 and `:724` −1/+1.
- **TG-C3:** friendship capping (R1 missed).
- **TG-C4:** a tier exactly at its bar of 30 / 45 / 72 (R4 missed; the tests use 29 and 50+).
- **TG-C5:** `mrl` from the Coil's peak when the end value is lower (R3 missed), and kept when a later Coil reaches the bar again (F9 missed).
- **TG-C6:** `startActCoil` keeps `mrl`/`rlc`; evening2 on a second whole-game pass (M2).
- **TG-C7:** a 0-minute round trip, and a same-evening re-entry, at a carrier with two tiers due (M1, L1).
- **TG-C8:** pin which one-off gains count when they share a scene (M3).

## Planted faults (`node tests/story.test.mjs --games 2 --workers 1`, about 30 s each)

Claude's `p19-faults.json`: **10 of 12 caught**.

| Missed | What it breaks |
|---|---|
| F4 | A loss inside a blocked gain is dropped too |
| F9 | The record moves to the latest Coil (inert, see L5) |

Mine, `p19-faults-review-c.json` (through `tools/mutate.mjs`): **2 of 6 caught**.

| Fault | What it breaks | Result |
|---|---|---|
| R1 | Friendship never capped | missed |
| R2 | The mark runs before the carrier's own enter | caught |
| R3 | `mrl` ignores the Coil's peak | missed |
| R4 | A tier exactly at its bar gets no beat | missed |
| R5 | RL in the first Coil, with no `mrl` | caught |
| R6 | A pinned earlier day read against a later week's record | missed |
