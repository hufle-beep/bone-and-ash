# Push 16, helper B: the text reads (BB bundle 1, the Blackroot and the forest)

Read on v0.11.245 (game = v0.11.243). No model tests (CPU); `node tools/textlint.mjs --list` run. Shallow clone (one commit): "new since v0.11.229" judged by reading.

## 1. The night's rules: a full night promised after a night fight or flight
Mechanics: `nightRest` → `shortNight` (`game.js` 652–669), half the missing HP and Qi when `night_fight` is set (at the fight's start, 1106/1116; `'run'` for the jackals' escape; Blackroot flights too, `act1_blackroot.js` 579).
Searched ("sleep properly", "full night", "rested", "sleep till/until", "whole night", "slept well", "sound sleep", "refreshed", "proper sleep"…): **0 promises.** Every text after a night fight fits a short night: `jackals_won` (`prologue.js` 417 "the thin kind", label 418), `jackals_fled` 436, `night_won` (`wilds.js` 183 "What sleep is left will not be enough", 184), `night_fled` 195, `bl_night_won` (`act1_blackroot.js` 1724–1735, 4 texts, "Sleep, what's left of it."), `bl_night_lost` 1740; the mornings (`dawn`, `morning`, `bl_morning`, `BL_QUIET`) promise nothing. Bundle 2, fine too: `fo_wolf_won`/`_lost` (`act1_fallout.js` 638/646), `arson_won`/`_lost` (`ashfall.js` 576/583).
- **Wrong under the rule (result lines, code):** `jackals_lost` (`prologue.js` 428) and `night_lost` (`wilds.js` 190) use `sleepUntil` + HP ×0.6/×0.7: "HP partly back, **Qi full**". Known, in the retune (`roadmap.md` 55); no task-mode game reaches them (a lost beast fight ends the Coil, `history-5.md` 79). Not this bundle.
- **Log only:** degree-3 night stomps never get James up (`stomp_act1.js` 249–256 "Your eyes stay shut", 293 "You roll over", the serpent's tea) yet cost half a night; `rut` (1699) "Sleep is thin for everyone" on a full night.
- **NR re-read:** "toward dawn" 5 lines (13 variants), "small hours" 6, "all night" 3, "until dawn" 4, "past midnight" 1 (`fo_wolf`, 3 forms), "02:00" comments only. All in night scenes, none against the rules. Claude: close the tail as read.

## 2. The forest's small text fixes
The four LG items are all **Ashen Hills** (Blackroot), though the handover lists LG under bundle 2:
- **Cairn while both away** (`ah_scout` 1197–1212, 186 words; Mei Lin reads it; only Ya-away has a line, `AW.cairn_end` 209). Claude: hide the card while `bothAway` (hub 1136, 0 words); or Fable: a both-away version (~80 words). Met 0.
- **Climb without Ya's door** (`ah_ridge_end` 1275–1285, Ya speaks; `yaAway` 422 holds until `ya_off_done` 1217; the climb 1139 doesn't check). Claude: `&& !yaAway(g)`. Old calendar 0.1 a game.
- **Fire-beetle Ya +3 while away** (1148, `bumpRel(g,'Ya',3,3)` always; reply already away-aware, 362). Claude: `if (!yaOut(g))`; a relationship change (Ya +3/+3 per beetle day while away, 0.1 a game): numbers first.
- **`BT_MEI.night`** (`prologue.js` 1016–1018, 71 words): dead. `btParty` picks it at night only, `yaAway` is day only (`ahDay` 06:00–18:59, 421). Claude: remove or leave.
- **ME, the 19:00 edge** (review C L3, `p4-review-c.md` 27–32): Ashen Hills; a menu opened at 18:45–18:59 lands at 19:00+ and offers her cards (`late` 412). 0 on both calendars; fits "back by evening". Claude: close as accepted.
- **`breakthrough` leftovers:** "naming Ya" done (v0.11.231; `roadmap-e.md` line 10 is stale). The lint's `breakthrough` "core formation" ×3: realm-2 generic line (1144) + `BT_LATE.P.A` (1028, twice), a realm-2 breakthrough with the party; one ~5-word swap. EW-4 `sky_witness`: village, bundle 2.
- **Text lint:** 11 tics, **0 in `wilds`, 0 in `blackroot`**; forest scenes in the prologue file: `herb_girl` "slide off" ×3 (the fence-post joke, log only), `breakthrough` above. Rest bundle 2 / Yuki's path. **RD:** `night_event` and `bl_night_event` render on no sample state: a tools gap for this bundle's night events.

## 3. FC, the first flight (Coil-1 discovery scene)
- **Hook:** `breakthrough`'s "Get up." router (`prologue.js` 1160–1167), first, before the tiger and `ykAskNow`; then `bt_return` (or `yk_choice`).
- **Condition, no new flag:** `realm === 1 && g.seen.breakthrough === (g.coil?.n || 1)` (`g.seen` = the Coil first read, `story.js` 136–140, kept across rewinds `coil.js` 193; migrated saves 0, `game.js` 1633; p7: misses 0 of 56). Or a `KEEP_FLAGS` flag + `migrate` fill.
- **Where:** bots, long, 40/40 prologue Coil 1: Ashfall (Careful, Sociable 16–18:00; Completionist 20–21:00), the wilds (Cultivator 08:00, alone). Old: later prologue Coils or Act 1 Coils 2–4 (with the party), possibly the Long Forest.
- **Yuki:** the cat only (her realm is his; great form from 2, `game.js` 1099; no kept realm before a first Foundation).
- **Canon call:** locals fly only from Golden Core, so a witness reads him as at least that (`lore.md` 84, 146). Village: out of sight (Yuki only) or Ashfall sees it (and later village texts don't assume it). Party: Mei Lin and Ya see it (Act 1's carried flights already assume it).
- **Size:** ~200-word scene + 2–3 openers (alone / village / party) ~60 each: ~300 words, 1 Fable run; Claude the hook, condition, test.

## 4. KA (b): flight on a kept realm's later passes
- `BT_CLOSER` (`flight_texts.js` 40) only on a Foundation breakthrough; a lifted Coil (`keptRealm`/`liftKept`, `coil.js` 101–122, 209) has none.
- **Screen `coil_dawn`** (`coil_scenes.js` 95–115). Prologue branch (111) has a kept paragraph: + one flight sentence (~20 words). **Act 1 branch (101–107) has no kept paragraph** and says "Your body has lost the road" after a lift: a kept version (~50 words) with the flight line. Plain alternative: `keptLine` (`coil.js` 129) + "and flight with it" (Claude, ~5 words).
- **Condition:** `g.coil.kept` (≥1 when set, `canFly` holds). "On all four feet" fits cat and great; a kept ≥7 human form would need `byForm` (unmeasured, KA (a)).
- Fable (story sentences) + Claude (conditions, tests); no canon call.

## 5. BYb-t: a "Wen told you" paragraph
- `btText` (`prologue.js` 1086–1135): `recognise` = `lore1` (Mei Lin's quote, ~45 words) or "no word at all" (~70); then the witness (Act 1 Ashfall / the village with Wen's line / the party / nobody); then `BT_CLOSER`.
- **Gap:** `lore_realms && !lore1` gets "no word at all". Wen's lesson (`ashfall.js` 703–706) gives the rungs and "each rung costs more than the last", not the lightning: the paragraph can say he gave the ladder, not the price. ~45 words Fable; Claude a third branch + test. Met long 0/0/2/0, old 1/2/0/0 (p7). No canon call if it quotes only the lesson.

## 6. ST2 degree 3 (`far_won`)
- `stomp_prologue.js` `wolves.win[3]` (~186–191), `thornback.win[3]` (~207–212), two texts each by `byDay`; a third degree-3 day shows text 1 again, folded (`lines.js` 104–106).
- **Why 0:** degree 3 needs a gap of 4 (`power.js` 47–50); far foes grow with the forest and village days (`common.js` 68–81), so prologue gaps stay 1–3; old calendar ≤2 far-win days a Coil; long reaches degree 2 only (Cultivator 1.9). Only a high kept realm could reach it (no bot, KA (a)).
- **Worth it:** low: 2 texts, ~230 words + 4 form clauses, Fable, shown 0, fallback a fold.

## 7. The hare's CW line
- `cookMeal` (`prologue.js` 92–97), the camp's "Cook and eat." (302): "*Mine first,* the bond observes, as it does at every fire." (3 forms). Old 1.3/1.3/1.4/0.7 a game, long 0.
- **Why:** on the long calendar the forest is a stay (`STAY_DAYS` `calendar.js` 20; `wilds` in `WEEK_HUBS` `tasks.js` 730): the routine meal (`dayMeal` 856–878) eats under Fed 85 via `eatBest` (`common.js` 101, "You eat: glassback hare, cooked", no CW); nights 1–6 a week go straight to `morning` (`wilds.js` 79–84) with an `eatBest` breakfast; hares spoil in 3 days (`game.js` 873); bots meet the camp only on forest night 1. The Day-1 camp's 0 isn't settled by reading; a bot trace would settle it.
- **Needs:** Claude only (the line on the routine meal's first hare a Coil) or nothing (CW parts 1–3 at its cap of 8: the owner's call).
