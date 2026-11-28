# P57-A cold review (Opus): DL + FT + MM-k + LH

Read: both checklists, the whole diff, calendar.js, threads.js ARCS, coil.js rewind, game.js makeCoil/coilSnap/startActCoil/archiveFill/dryClone, and the scenes around each transition (excerpts only). Experiments ran in a scratch copy (/tmp/rv/ba). `archive.test` gave 201/0 and `faq.test` 63/0 on the working copy.

## High

**H1. Memories keep the wrong words for most Insights (archive.js `noteMemory`, main.js:196).** When the tap changes the screen (`moved`), the memory keeps the new screen's text and drops the reply. Most Insight choices put the find in the `do` reply and then move on with `to:` to another scene:
- the bracket fungus: forage → stream
- Ya's tracks: rr_scout → rr_hub
- Hearth lore: rr_roots → rr_hub
- Saw the lights: night_event → morning
- Realms lore: wen_lesson → ashfall
- The singing grove: rt_plant_sing → rt_ashfall

Measured (seed 1, forage choice 0): the kept memory is titled "Blackwater" and its words are "The stream runs dark over black stones…" (178 chars). The reply that holds the find ("Spore print on a bone sheet…") is lost. The hub texts (rr_hub 291 chars, ashfall 133) say nothing about the find either. This is High because the key is then in `had`, so the memory is never written again, and a later fix can't repair saves already played.
*Fix:* when the screen moved, keep the reply and then the new screen's text (what the screen actually shows: the text, with the reply under it), or keep the reply alone when there is one. Test it on the real forage → stream choice.

## Medium

**M1. The prologue's line is wrong on the short road and on a long road that leaves the forest early (archive.js `deadlineLine`, prologue branch).** "Today" depends on `storyDay ≥ 7`, but the prologue never moves the clock forward to the tribute. Act 1's start allows for this (prologue.js:952 `Math.max(d, calStart(g, 8) - 1)`).
- **Short road** (no `long`, no `vday`): in the village the elder says "Tomorrow, the collectors come" and `tributeLeft` is 1, but the bar reads "Tribute ahead · 0 of 12 primaries". At the tribute itself it still reads "Tribute ahead" (storyDay 1–2).
- **Long road, early exit** ("Enough of the forest. Follow the stream out — today.", wilds.js:245, open while forest_day < 3): measured with the village reached on day 9 and the three weeks over. At the `tribute` scene (clock day 31, storyDay 5), the bar reads "Tribute tomorrow" during the tribute.

*Fix:* treat the tribute's own scenes (and the dawn scenes before them, until `ending` is set) as "today". Count the short road's village with `tributeLeft` (keyed on having reached Ashfall this Coil, e.g. the scene's place or hub), not with `vday`.

**M2. Act 1's snapshot keeps a second, never-read copy of the memories (game.js `coilSnap`, used by `startActCoil`).** `coilSnap` copies `stats` whole, so `coil.snap.stats.mem` holds every prologue memory for the rest of the game; the rewind reads `g.stats`. Measured: 12 memories of 800 chars took the save from 11,871 to 21,953 bytes at `startActCoil`, and an Act 1 rewind keeps it there. The ~18–20 KB budget is then spent about 1.5×, and again in every slot and backup.
*Fix:* `delete s.stats.mem` (also `feats` and `limits`) in `coilSnap`, as `hist` already is. Optionally, `dryClone` and `probeClone` could share `stats.mem` instead of JSON-copying up to 20 KB on every dry run.

**M3. "N of 6 arcs" counts arcs the player hasn't finished (archive.js `act1Arcs`).** Story days ≥ 16 and ≥ 19 count the Ashen Hills and the Heart as done. But in the Heart, `late = storyDay ≥ 19` (act1_heart.js:86) and its hub stays open (the guardian, the heart-chamber), so the player can still be inside on Days 19–20 before `ht_leave`. The bar then says "5 of 6", while the game's own mark for the Heart only comes at `rt_start`. Leaving bl_morning after bday 5 ("Get moving" → ah_hub) looks like the same case on Day 16+, but it wasn't measured. On Shen Qiu's day the bar reads "6 of 6" before the duel, while the Return's mark comes at `a1_end`.
*Fix:* count from where James is, not only the day: the part the current scene belongs to (the Blackroot / Heart / Return scene sets, plus `bl_region`), with the day only as a fallback for shared side scenes. Or keep the day rule and say "Day-based" in the design note.

## Low

- **L1** archive.js LIMITS `sat`: the line hard-codes "from 95%" next to numbers that are read from the game. Use `breakAt()`.
- **L2** archive.js `deadlineLine` doc says '' for "a fight", but the code doesn't check `g.combat`, so fights show the line (main.js renderCombatCards draws statusHtml). Fix the comment or the code.
- **L3** The two acts count days differently after midnight. In the prologue at 00:30 on the tribute's calendar day (vday 3, cal_night 6), the bar reads "Tribute tomorrow" while the clock label shows the tribute's day. Act 1's `elderLeft` counts from midnight ("today"). Pick one clock for both.
- **L4** Leaving the Long Forest fills the hammerspace to the caps (prologue.js:1412 `lfStock`), which notes the `item` and `stock` limits. The player never hit them by play. Possibly intended; say so in the FAQ wording or skip limits noted on the exit tap.
- **L5** An old save's first `noteRecords` marks every feat true at that moment as 0 ("before the record"), including one earned in that same first tap. Running `noteRecords` once in `archiveFill` at load would close this.
- **L6** css `.memory-row summary { display: flex }` removes the disclosure triangle (`::marker` needs `list-item`), so nothing shows the row can open except the note. Add a ▸/▾ cue or keep list-item with an inner flex span.
- **L7** A corrupt `stats.mem` entry (null, `k` not an array, a non-string key) makes `archiveView` throw on `m.c` / `.map` / `key.slice`, and the Archive tab with it. Filter entries with `isRec(m) && Array.isArray(m.k)`, and take string keys only.
- **L8** main.js `land()` calls `sceneView` on every tap, even with no new key: double work, plus early writes of `g.lines` / `g.wake`. Measured: the writes are the same as render's. Build the text only when `memKeys` has a fresh key.
- **L9** faq.js imports: the v0.11.203 `calStart` comment now trails the new `limitsHit` import line.
- **L10** "Skip to the next choice" walks several screens in one `land`, so a mark brought mid-skip keeps the last screen's text. Rare (it needs scenes already read).

## Test gaps

- **TG1** DL on real paths, not set clocks. Short road: mei_lin "roof and food" → village → elder; assert "Tribute tomorrow", then "Tribute today" at `tribute`. Early-exit long road (stream_out on forest_day 1, three village weeks): assert "Tribute today" at `tribute`. The P test sets `minutes = calMinutes(7)`, which a real early game never reaches.
- **TG2** act1Arcs inside the Heart on Day 19 (a heart hub scene, no `ht_leave`) and at ah_hub on Day 16; also Day 18 (planted R1, `d >= 19` → `d >= 18`, passed).
- **TG3** A memory from a choice that moves the screen: forage choice 0 → stream with `fungus`. Assert the kept words contain "Spore print". The current tests only check `moved` with a made-up reply.
- **TG4** Save size: after `startActCoil`, `coil.snap.stats.mem` is absent. With 30 memories at the longest real texts (the 2,404-char rt_selene plus replies), the save's growth stays under 20 KB. The current average-length estimate (603 chars) leaves out replies and the snapshot.
- **TG5** archiveView/Archive: a feat at 0 shows "before the record", and a memory keeps its own Coil. Planted R3 (`|| 0` → `|| 1`) and R4 (`c: 1`) passed. A render of `renderArchive`'s feat column and summary title is needed: planted R6/R7 in main.js passed, and they need the browser test or a DOM-less render check.
- **TG6** archiveView with a corrupt `mem` (null entry, string `k`) doesn't throw.
- **TG7** The limits FAQ line uses `breakAt()` (pin it via the function, not "95").
- **TG8** The deadline at 00:30 in both acts (checklist v0.11.226), asserting one clock.

## Planted faults (tools/mutate.mjs, `archive.test && faq.test`, faults in /tmp/rv/mut/faults.json)

| Fault | What it breaks | Result |
|---|---|---|
| R1 | Heart counted from Day 18 | **missed** (TG2) |
| R2 | Fallout not counted by region | missed (equivalent: a region implies Day ≥ 11; harmless) |
| R3 | feat before the record shown as Coil 1 | **missed** (TG5) |
| R4 | every memory shown as Coil 1 | **missed** (TG5) |
| R5 | limits entry open from a new game | caught |
| R6 | Archive draws every feat on Coil 1 (main.js) | **missed** (TG5) |
| R7 | memory title dropped (main.js) | **missed** (TG5) |
| R8 | primaries dropped on the long road | caught |
| R9 | village count one short | caught |
| R10 | only the reply's first part kept | caught |

4 caught, 6 missed (1 equivalent). Scripts: /tmp/rv/*.mjs (mem1, short, early, snap).
