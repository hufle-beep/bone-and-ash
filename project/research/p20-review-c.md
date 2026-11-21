# P20-A cold review C (code): v0.11.250

Opus, cold. Read: the diff, the two briefs, both checklists, the P20-A test block, scene excerpts (grep). Scratch copies `/tmp/rv-c` (faults), `/tmp/rv-c2` (probes, `weekEveQuiet` instrumented; Careful, 10 games, long, ~15 s). No `check.sh`.

## High

**H1 (EC): the echo almost never shows in a real game, and its once-a-save record is spent anyway.** `closing()` stamps `g.coil.ec[id].m` in the scene's `enter`; `echoLine` shows the text only while `g.minutes === m`. `choose()` runs `go()` (so `enter`), then adds `defaultMinutes` for a choice with no `time` (story.js ~389). Measured with real `choose` from each way in (Coil 3, `seen` = 1, both calendars):
- `gao_talked`, `gao_fled`, `gao_dead`, `gao_spared` → `mei_lin`: stamp +0, clock +10. **No echo**, record set.
- `gao_lost` → `mei_lin` ("Keep running…", `time: 20`): the echo shows. That is the only way in that works.
- `ya_arrives` → `ya_meets` (the only way in): stamp +0, clock +10. **No echo**, record set.

So Ya's echo never shows, and Mei Lin's shows only after the lost Gao fight. The test passes because it calls its own `enter()` helper, never `choose`. Possible fixes: stamp after the choice's time (a post-`choose` hook), or show it on the first render after the mark instead of matching the minute. Either way, test it through `goTo` + `choose`.

**H2 (WE): on each week's story night the plan takes the quiet way into the week's event.** `weekEveQuiet` judges an evening only by its labels, and a story night's evening screen has the usual labels. So the plan makes the evening's choice on the nights the player most needs to, and the screen before the event (`fo_night`, the supper) only appears in the day's lines. Measured with the instrumented `weekEveQuiet` (Careful, 10 games, long), quiet takes whose walk ends at a story screen or story night:
- Forest `night` → `night_event`: 76, story-weeks 1–2. The watch is chosen for the player.
- Forest `night` → `night_attack`: 38, week 3. The plan stops at the fight screen, with the watch already set.
- Ashfall `supper` → arson `village_night`: 38. The roof and the dishes are skipped on the arson night.
- Ashfall hub → `evening` (the tribute's eve, vday 3): 76. "Walk with Mei Lin at sunset" is skipped on the eve.
- `fo_supper` → `ya_arrives`: 12. Ya's arrival morning is walked to.

That is about 24 a game, against 49 evening stops left. Before WE, the plan stopped at each of these evenings. The pick's own line is "any other way (an event, a fight…) stops the plan as before". The bare `storyNight(g)` is no gate: at the Fallout it is true on every evening (60 + 60 quiet takes, sd 8 and 10, all `sn = true`). One possible fix: dry-run the quiet way and its walk on a copy, and take it only when the walk gets back to the hub with no stop. Another: give each `QUIET_WAY` entry the usual target, which the resolved `to` must match.

## Medium

**M1 (TB, pre-existing from P19-A, same cause as H1): Ya's `fo_night` tier beats never show.** Both `fo_supper` choices ("Go up to the loft early.", "Help clear the table.") have no `time`. Probe: Ya at a = 50; the `tb_ya45` flag is set at `fo_night`'s enter (+0), the clock goes to +20, and the beat is not shown. The flag stays set, so the tier is spent. RN reworded `ya45:night` and `ya72:night` in this push: texts that never reach the screen. `bl_camp` from "Make camp on the trunks." (act1_blackroot.js:1047, no `time`) has the same shape (not probed). The RL carriers are reached by choices with a `time` (fine).

## Low

**L1 (WE): the week key comes from the calendar day after midnight.** `sd = storyDay(g)` changes at 00:00; `d = workDay(g)` changes at 04:00. Probe: `heart_camp` at 00:30 after story-week 16's last day gives sd 17 and waking day 85. `p.we` becomes {sd 17, d 85}, so the plan stops there. Week 17's real first evening (20:00) then gets the quiet way (5), not the player's stop. This only matters for a plan that spans two story-weeks (Fallout, Heart). It was not reached in the 10 bot games. Key it the way the day records count (checklist: `textStoryDay`), or by the waking day's story day.

**L2 (WE): a plan replaced mid-week gives a second free evening.** `p.we` lives on the plan, and `planEnsure` builds a new plan whenever `planHere` is null (for example after a plan made on another week hub). Harmless (one extra stop). No fix needed unless the owner wants exactly one stop.

No finding on these:
- DP: the wrap order puts yuki_path's beat at the end and DP's line after `DP_AFTER`. `wrapDo` keeps `do` and the choice indices.
- FR: every `final_night` value was read ('yuki', 'yuki_mei', 'yuki_ya', 'all', 'trio', 'mei', 'ya', 'none').
- EC's carry: `rewind` spreads `c`, `startActCoil` copies it, and `seenFill` gives an old save `seen` = 0.
- The models gate counter: `maxNeg` merges by max in `mergeInto`; `n` and `met` are summed.
- The `also` regexes: they match their labels. Ya's manners and "Scout the tribute road" stop the plan as events.

## Test gaps
- **TG-C1 (H1):** EC is tested only through the test's own `enter()`. Walk each way into `mei_lin` and `ya_meets` with `goTo` + `choose` and assert the text. Do the same for the TB and RL carriers (M1).
- **TG-C2 (H2, F6):** no test walks a story-week's last evening. The WE walk sets `palisade` and `wolf` and avoids the arson. Walk a full week that includes the story night and assert where the plan stops. F6 (the walk takes a screen's first choice) was missed for this reason.
- **TG-C3 (F4):** q6 calls `weekEveQuiet` once on the old calendar, and a first call always returns null. Call it twice, or on a second evening.
- **TG-C4 (FC2–FC4):** nothing reads what the walk says. Assert that the supper's text and each walked night text appear in the day's lines, and that `t.nf` is noted so the next same night folds.
- **TG-C5 (FC9):** `go()` runs `noteSeen` before `enter`, so a first meeting already has `seen` = this Coil. The test's `enter()` skips that. Covered by TG-C1.
- **TG-C6 (FC10):** DP 'hand' is never tested with Ya not liked.
- **TG-C7 (FC6):** the panel's evening line is checked on Ashfall only. Add a hub outside `EVE_HUBS` (the Long Forest's `lf_hub`).

## Faults (`tools/mutate.mjs`, `node tests/story.test.mjs --games 2 --workers 1`, jobs 1)
- **Claude's F1–F19:** 17 caught, 2 missed. F4 (the old calendar too) was missed: TG-C3. F6 (the walk takes the first choice) was missed: TG-C2.
- **Mine, `p20-faults-review-c.json` FC1–FC10:** 4 caught (FC1, FC5, FC7, FC8), 6 missed:
  - FC2: the walk's fold not noted.
  - FC3: the walked night text not said.
  - FC4: the supper's text not said.
  - FC6: the evening line on every hub.
  - FC9: `seen <=`.
  - FC10: 'hand' without `likesYa`.
- **All:** 21 of 29 caught.
