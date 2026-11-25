# P42-A cold review (Opus): EH, EB, HL, LK, TL-a, TL-r

What I read: the checklist (both parts), the full diff, the packet (`p42-packet.md`), excerpts round each change. Rendered in a scratch copy (scripts in `scratch/rev/`): the three Heart screens before and after "Eat something." (fold, music/song line), the bite's Results with the next screen at kept realms 2 and 7, the 20 TL-a choices' old defaults and places, and the 14 REVIEWED rows walked to their sleep.

Verified OK:
- EH: `to` is each screen's own id. SV folds the redraw to its first paragraph. The choice is appended, so `walks.js`' `['heart_gate', 2, "Go in."]` and every index key hold. Familiarity is keyed by scene:index. None of the three is a task hub, menu, `late`/`active` or guardian screen. The P6A hash pins every code fault in act1_heart.js.
- LK: no new saved field (`xpOut` is a call argument only). No lines without a lift (`liftKept` returns before pushing, and the bite checks `g.coil.kept`). The XP is the same, through the same `awardXp` calls. Lines come in first-seen order: CU, GU, Yuki.
- skillWatch restart: no false positive at a natural act crossing (`startActCoil` builds a fresh coil with no `kept`). Whole-game rewinds compare with `newGame`. The `yukiAbove` reset can't flag, because the lift's lines are always present (but see TG5).
- TL-r: all 7 sleeps reach `sleepUntil`. evening:2 → tribute_dawn_sleep:0 (`sleepUntil(g,5)`). fo_last_night:2/6 → fo_depart:0 (`sleepUntil(g,6)`). bl_fireside:4 → mei_bond, whose only choice at night (`mb_day` false) goes to `sleepTo`. heart_camp:5 and heart_read:0 → heart_night → heart_morning `wake()`. rt_evening:7 → rt_quiet_night:0 (`sleepUntil(g,6)`). The 7 misreads read true.

## High
None.

## Medium
**M1, fo_spy:1's result says an hour (js/story/act1_fallout.js:538).** TL-a gives this talk 10 min. Its result says "…he corrects you on the perspective. **It takes an hour, with diagrams.** He goes home with his ledger, and you go home…", and the choice moves from the ridge above Ashfall to the hamlet. Before the push it was 30 min (already short); now the text claims six times the clock. The in-game news (news.js:105) also lists it among the "short answers".
Fix: take fo_spy:1 out of TL-a and add it to `REVIEWED` with the reason "the result says an hour; a talk plus the walk home". Either leave it on the default 30 (no balance change, +20 min against the build) or give it `time: 60` (+50 min against the build; the owner's pick). Re-pin the TL-a list at 19 and the lint at 0 off, 15 reviewed.

## Low
**L1, answers on one screen now take different times; some walks vanish.** The lint sorts by words, so only some siblings moved:
- ya_share 10 / 20 / 10 (`To Mei Lin: "…"` has no talk word).
- rt_trio 10 / 20 / 10.
- heart_core:0 "Take the seed-sliver" 30 against :1 "Ask Mei Lin to take it" 10, for the same act.
- ya_found:0 30 against :1 10.
- rt_evening:6 10 against the other nights' 20.

ya_found:1 (burnt gully → the Ashen Hills camp) and trio_kiss:0/1 (the spring → camp) lost their walk back: before, 20–30 min covered the walk; now 10 covers the talk alone.
Fix: give each screen's alternative answers one time (the screen's talk time for all), and keep the choices that change place on the move default. A balance change, so open, options later.

**L2, cooked food with no fire outside the Tree (act1_heart.js:146).** `heartEat` passes `fire: true` on ht_start (dawn at the roots) and heart_gate (the doorway). Neither text, nor the night before (heart_view, bl_end), has a fire. A raw hare comes out "glassback hare, cooked. +35" after 15 min. The hall is the base (heart_hub's PIN place, where heart_hub already eats `fire: true`), so it fits there.
Fix: use `eatBest(g)` (raw) on the two outside screens, or accept it as the base's convention. That's a satiety change, so it's the owner's pick.

**L3, the hall's song is drawn again after a meal (heart_hall, music.js:96).** I rendered it: after "Eat something." the redraw keeps the visit's song, so the folded "Inside, the tree is hollow…" sits under "You eat: glassback hare, cooked." and is followed by the whole durin passage again ("Mei Lin bows her head, as at a burial done properly at last…"). Before the push, heart_hall's one choice left the screen, so the song showed once.
Fix: accept (it is the music rule "the same on every redraw of a visit"), or have musicLine drop a song on a redraw that follows an action (`prev.id === id`). Open, options later.

**L4, the skip now stops at ht_start and heart_hall (again.js:279).** `skipStep` needs exactly one open choice. With Fed < 85 and food (nearly every arrival), "Skip to the next choice" on a later Coil now stops at ht_start (from bl_end) and at heart_hall: one extra tap each. A flow change the pick didn't name.
Fix: accept and note it, or let `skipStep` ignore an open choice that returns to its own screen. Open.

**L5, the XP lines sit right above "The skills went the usual way" (coil_scenes.js:112).** The whole-game Results end with "Convergence Use +140 XP → T1 L3 / GU … / Yuki (bond) Qi Use …", and coil_dawn's kept text then says "The skills went the usual way, with everything you carried". It reads close to a contradiction. news.js also says "Convergence Use and GU", while the lines include Yuki's Qi Use and also show on act rewinds.
Fix: news wording "Convergence Use, GU and Yuki's Qi Use"; a clause in the dawn text if wanted (story text → Fable, open).

**L6, a null can reach the Results (coil.js:122).** In `sumXpLines` a name with `xp === 0` and no cap line maps to `r.cap` = `null`. That needs a "+0 XP" line, which today's pools can't produce (the smallest share is 6), but nothing guards it.
Fix: `.filter(Boolean)` on the result, or emit the cap line only when `r.cap` is set.

## Test gaps
- **TG1 (C1, C2), the partial cap and the last rank:** in story.test's LK block add
  `JSON.stringify(CO.sumXpLines(['CU +6 XP → T1 L2', 'CU +6 XP → T1 L3', 'CU at T10 L10 (cap)'])) === JSON.stringify(['CU +12 XP → T1 L3'])`.
  At present the case has one rank per skill and a cap with no XP, and the bite test compares with `liftKept`'s own output, so it agrees with itself.
- **TG2 (C3), the act rewind:** `won(seed, 1, 1)` with `keptTop = 3` and the act snapshot's `james.realm = 0`, then take a1_again's "start of Act 1" bite. Assert that the three lines follow `/^Kept from 2 won clears/` and that `n(lines[0]) > 0`.
- **TG3 (C4), all 20 on the tap path:** for each TLA key, `goTo` the scene in a fresh game with the flags its `show` needs (likesMei/likesYa, `lf_human`), choose it (on a check, force the roll or accept both branches), and assert `g.minutes - m0 === 10`. At present only ya_lost is tapped.
- **TG4 (C5), two bites in a row:** bite twice (two fresh games in one process). Assert the second bite's lines after the kept line equal `liftKept` on a copy made just before that bite, with exactly 3 lines.
- **TG5, the restart watch is blind behind the lift lines:** `silentSkill` passes once any XP line is seen. Also compare by skill: the skills whose print changed must be a subset of the skills named in the XP lines (CU, GU, Yuki's Qi Use), so a silent Fight change at a restart (the `yukiAbove` reset) is still counted.
- **TG6 (M1):** assert that no TL-a choice's result text matches `/\b(an hour|hours)\b/` while its time is under 60.

## Planted faults (`faults-c.json`, `node tools/mutate.mjs … --jobs 1`, the default story test, 26 min)

| Fault | File | What it breaks | Result |
|---|---|---|---|
| C1 | coil.js | a skill that gains XP and then meets its cap mid-lift shows only the cap line | missed (TG1; unreachable at today's XP) |
| C2 | coil.js | the summed line names the first rank reached, not the last | missed (TG1) |
| C3 | coil.js | an act rewind lifts silently again; only the whole game shows the lines | missed (TG2) |
| C4 | act1_fallout.js | one of the 20 still takes 30 min on the tap path (a direct clock write in ya_share:2) | missed (TG3) |
| C5 | coil_scenes.js | the lines pile up across bites (a module-level array) | missed (TG4) |

Score: 0 of 5 caught. EH faults in act1_heart.js were left out on purpose: the P6A code hash catches any of them. Claude's F1–F8 were not re-run.
