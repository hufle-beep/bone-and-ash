# Cold review: CM push 2 (v0.11.182)

Read: the brief, the checklist, the canon card, `diff.txt`, the packets, `lore.md` "James: cooking…" and "Selene" (plus Ya's line under "Places and people"), and excerpts of the screens the lines show under. Rendered in a scratch copy (`/tmp/cm2/scratch/repo`). `/tmp/cm2/scratch/musicsim.mjs` is packet.mjs's random task-mode bot, 200–300 games of 6,000 steps, with `againView` then `musicLine` drawn on every screen the way main.js draws them. Results: **0 days with two lines** (the game's own lines and the reading counted). 60 of 65 lines show. Five never show (M3). Lines appear only on `camp`, `night`, `village_night`, `evening`, `supper_roof`, `fo_supper`, `fo_last_night`, `bl_camp`, `heart_camp` (3 draws), `heart_night` and `rt_evening`. I found no H findings.

## M (medium)

**M1. Reactions from people who have just left the screen.** `music_texts.js:32,33` (ashfall.09/.10, the mother) under `evening`, and `:93,95` (return.02 the mother, return.04 Ya) under `rt_evening`. Both screens end with the mother going to bed. `evening` ends with "Then she goes to bed… that leaves Mei Lin, a clay lamp…". `rt_evening` ends in all 3 forms with "the mother goes to bed with pointed loudness… Ya goes out to sleep in the grove… It is a quiet house." The music line is drawn *under* that text, so the mother "listens to the end", "looks round her table, at everyone eating at it", and Ya beats time "until the mother looks at her" after the text has sent them out (checklist: screen order). **Fix:** for these two screens, `PEOPLE` should hold only who is still there at the end of the text (`ashfall:house` → mei; `return:house` → none, or Mei Lin only). Or reword the four lines into the past tense ("at supper, the mother…").

**M2. "The singing behind the door" after it has stopped.** `music_texts.js:61,80` (journey.05, journey.28, place `tree`). Once the guardian is calmed, `heart_camp` reads "The singing has stopped. In four hundred years the tree has not been this quiet." The sim drew both lines under `heart_night` with `guardian=calmed` (3 draws in 300 games). **Fix:** add a gate, either a field (`when: 'singing'`) checked in `lineOpen` as `!g.flags.guardian || g.flags.guardian === 'lost'`, or move the two lines to a stretch/place key `tree_singing` chosen in `musicLine` by the flag.

**M3. Dead and near-dead lines.**
- `yk_camp` (walk) only ever follows `bl_camp`, which always takes the day's line first. So journey.10 and journey.19 (`:65,73`) never show.
- `rt_quiet_night` (stove) only follows `rt_evening`, which always has an open `any` line. So return.03 (`:94`, the only use of `{ref:amalee}`) never shows.
- `evening`, the only Ashfall `house` screen, carries its own music line whenever `flags.long` is set. In my 300 games that was every visit. So the five Ashfall reactions show only on the `ignored` apology path: ashfall.06/07/09 rarely, ashfall.08 and .10 never.
- `evening2`, `bl_fireside`, `bl_night`, `rt_fire_talk`, `rt_quiet_night` and `yk_camp` never draw a line, and `rt_camp` always uses its own. Their `MUSIC_SCREENS` entries are dead weight, as are `PEOPLE`'s `ashfall:lamp` and `ashfall:walk`.
- `yk_camp` is also a romance night (the fade-out between the roots), which goes against music.js's own header ("never… a romance night").

**Fix:** drop `yk_camp`; move the two walk lines to `camp`/`any` or cut them. Move return.03 to `rt_evening` or cut it. Give the Ashfall reactions a reachable screen, such as `supper` (see `supper`'s W1 note: that means the roof's own line on its second night needs the day check to count it) or `village_night` when reached by "Help her mother with the dishes". Otherwise accept them as rare and say so in the docs.

**M4. Yuki's bond speech in human form.** `music_texts.js:12` (wilds.03): "the bond reports her verdict". Human Yuki speaks aloud (canon card). She can be human in the prologue: the sim drew `ashfall.archive.0` with Yuki human, and `night`/`camp` carry human branches. The brief says these were removed, and this one was missed. **Fix:** "Yuki listens to all of it and delivers her verdict: …" works in all three forms.

## L (low)

**L1. The music line vanishes after a meta screen.** `music.js:81–82` checks `L.cur.mu === id`, and `noteVisit` clears `cur` on every scene change. Changing Yuki's form, a breakthrough on a `BREAK_HUBS` camp (`bl_camp`, `heart_camp`), or a door card such as "Sit with Yuki" returns to the same screen without its line. `againView` treats these as the same visit (META_BACK) for "Read it all again". **Fix:** store the scene on `L.mu` (`id`) and show the line when `m.id === id && !a.newVisit` (pass `newVisit` from `againView`).

**L2. Five reused five-word runs** against result and reply texts. The text lint renders only scenes and pools, so it doesn't catch these:
- journey.06 "which you choose to take as" (prologue.js:255, "…as peer review": the same joke shape)
- wilds.03 "listens to all of it" (act1_blackroot.js:103)
- wilds.05 "somewhere past the middle the" (longforest.js:54)
- ashfall.02 "and you would rather not" (stomp_act1.js:197)
- journey.28 "for the length of one" (meridians.js:139)

**L3. General-edition sentences that misread once the slot is filled:**
- journey.24 "…mostly genealogy and grief in the hollow of a dead tree" (needs a comma)
- return.07 "…planning around an empire's fall at no page in particular"
- ashfall.12 "…dragged off adventuring off your forearm"
- journey.02 "…a conscience about the sea to the end"
- Repeated words: wilds.06 "Thin guitars… jangling guitar music", journey.22 "bright… far too bright", return.06 "a small shark: small, bright"
- ashfall.07's "which explains nothing" loses its joke when the answer is a description

**Fix:** move the slot to the end of its clause, or use shorter general phrases.

**L4. Facts.** `perfect_strangers` general "about people who remain strangers" claims a subject (the song is usually read as being about past lives or reincarnation). Better: "a stately old rock song with strangers in its title" (the general edition can't name it), or "a stately, slow old rock song". `hololive_en` named "Hololive English" vs `odyssey` "hololive English's": the brand is lower case. The other names and claims check out: Paysage d'Hiver, Saor, Alcest, WITTR, Gojira/*L'Enfant Sauvage*, Nitzer Ebb, Ashbury Heights, *The Expanse*'s four on a salvaged warship, the Silmarillion's two Trees, *Foundation*, the Entmoot and the march, *Odyssey*. No lyrics or quotations.

**L5. The edition changes the save a little.** `heart_read`'s text is filled at view time, so `noteRead`/`sd` record the edition's text. A player who switches edition gets the reading in full (not folded) the next Coil. This is harmless, but "a save plays the same in either edition" isn't strictly true. Note it, or have `noteRead` record `READ.text` before it is filled.

**L6. Two near-twin labels on `heart_camp`:** "Climb up to Ya's ledge." and "Read to Ya on her ledge.". On heap nights (`hcPool` heap) the text has Ya "in the middle" of the heap, not on a ledge. The old choice already had that problem; the reading inherits it.

**L7. `sw.js` VERSION is still `bone-ash-0.11.181`** (news.js notes 0.11.182). This is fine if the docs step bumps it as reference.md says. Reminder only.

## TG (test gaps)

- **TG1 Reachability:** the CM2 block checks counts, places and steps statically. Nothing checks that each line shows in a real game, so M3's 5 dead lines pass. Add a bot pass (packet.mjs `seenAt` style, with `musicLine` drawn) that asserts every key shows at least once in N games, or lists the allowed rare ones.
- **TG2 Boundaries:** 15:00 (F2), the reading at 16:00 (F13) and friendship 80 (F3) are untested. The test samples 14 and 20, and 15 and 20.
- **TG3 Archive ratio:** the 70–130 of 400 window passes one day in five (F8). Use something like 85–115, or check the exact count for a fixed seed.
- **TG4 main.js:** no test draws the line on a folded screen (F10), restores the edition on load (F11), or exercises the Settings toggle. The browser test has no `p.music` and no References check.
- **TG5 Text checks:** the canon tic list never runs on the music or reading texts in tests (F15). The text lint's pool "tics" are repeated n-grams and gave 0 with "For a moment" planted. Form faults in the plain-string lines go unseen (F16). The general-edition name check only knows names from the table (F17: "Kraftwerk" passes); add a capitalised-word check inside general phrases (allowing a sentence start).
- **TG6 Lint pools:** `reading_named` shares 3 runs with its own scene (`heart_read`, general), so it reports reuse that is always there and can't show real reuse. Compare it against all scenes except `heart_read`. L2's runs show that pools also need checking against result and reply texts.
- **TG7 Reactions vs presence:** nothing checks that a reaction's person is still on screen at the end of the text (M1), or a `tree` line against the guardian state (M2).

## Planted faults (`tools/mutate.mjs`, the story test --quick; full table in `/tmp/cm2/rv/mutate.md`)

The test caught 8 of 17 and missed 9.

| Fault | What it breaks | Result |
|---|---|---|
| F1 | a second evening screen picks again (one-a-day rule) | caught |
| F2 | `hour <= 15`: no line 15:00–15:59 | **missed** |
| F3 | steps overlap at 80 | **missed** |
| F4 | `spec: 0` (this Coil's lines no longer come first) | caught |
| F5 | `DEFER = {}` | caught |
| F6 | `DAY_USED` empty | caught |
| F7 | own lines tested against the id, not the text | caught |
| F8 | archive one day in five | **missed** |
| F9 | the line shown again on later visits | caught |
| F10 | no line on a folded screen (main.js) | **missed** |
| F11 | the edition not restored on load (main.js) | **missed** |
| F12 | "the ship" after the log (shipState order) | caught |
| F13 | reading from 17:00, not 16:00 | **missed** |
| F14 | `fillRefs` defaults to general | caught |
| F15 | "For a moment" in a music line | **missed** |
| F16 | "Yuki, on your shoulder," (form fault) | **missed** |
| F17 | a proper name in a general phrase | **missed** |
