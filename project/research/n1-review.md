# N1 cold review (v0.11.188: TR, L7, LL, EN)

Read: checklist, canon card, brief, diff, packet; excerpts of prologue.js, act1_fallout.js, act1_blackroot.js, act1_heart.js, act1_return.js, music.js, songs.js, lines.js, coil.js, tasks.js, meditate.js, task_hubs.js, the new test block. One small node render (/tmp/n1r/s/r1.mjs). No test suite run, mutate.mjs not run.

## Findings

**M1. TR: the party block shows while Ya (or both women) are away.** prologue.js:967; act1_blackroot.js:781-782.
`ah_hub` shows the door card "Ya's gone. So is her spear." (bday ≥ 4, `!ya_off_done`) and "Find Mei Lin and Ya. They went for water an hour ago." (`trio_kiss`) as door cards next to the Meditate card. The party flags never drop, so a Foundation breakthrough taken there shows "Ya prods the scorched moss with her spear…" / "Mei Lin has not moved", and then the player is back on the hub with "Ya's gone. So is her spear." still showing.
Fix: `party` also needs the women to be there: false while either door is open (`ah_hub && bday>=4 && !ya_off_done`, or `both && trio>=2 && !trio_kiss_seen`). With the water door open, the trees line is right. With only Ya gone, Mei Lin is there, so that case needs a Mei-only block (new text: Fable, owner pick) or gets left out.

**M2. EN contradicts the bluff ending.** act1_fallout.js:240 (and :147).
In the bluff ending James told the collectors he was "a wandering senior of a hidden sect" (prologue.js:723), and the Sect's own envoy asks "the name of his mountain" (LETTER.bluff). Without `sky_witness`, Old Wen now says the Sect's report reads "A man with no sect and no master who sings bone…". The Sect believes he has a sect, so this is the opposite of what it was told.
Fix: a bluff variant ("A senior whose mountain nobody can name, who sings…"; new text, owner pick), or the neutral clause only for fought/lost/paid.

**M3. L7 misses the Act 1 that starts on Day 9.** act1_fallout.js:256-259; prologue.js:814.
"Act 1" sets `Math.max(d, 7) * 1440 + 6h`. If the tribute runs past midnight, the act starts on Day 9 06:00 (the packet shows fo_elder_named on day 8–9). The hymn plays and `hymnToday` is true, but `d2 = textDay − 8 = 1`, so the first morning shows "Morning. The hammers started before the light did, and nobody has asked them to stop.", and the hymn is ignored again. Confirmed by render: day 8 gives HYMN_MORNING; day 9 gives the d2=1 line with `hymnToday` true.
Fix: check `h < 11 && hymnToday(g)` before the `d2` branches. It can only be true on the act's first story day anyway.

**M4. The Return still says the Sect heard of the sky.** act1_return.js:378 (rt_wen), :650 (rt_elder).
- rt_wen: "He will have heard of the tribulation that refused to fall".
- rt_elder, Shen Qiu: "And the sky came for you, and went away ashamed."

Both lines are unconditional. In the ~88% of games with no `sky_witness` and no `a1_sky_seen`, the Sect has no such report. After this push the lost letter (LL) and Old Wen's news (EN) don't claim one either, so these two lines now contradict them, and the news line ("no longer say it did") overstates the fix. Mei Lin and Ya seeing it (TR) does not reach the Sect.
Fix: gate both lines on `sky_witness || a1_sky_seen`, with alternates. That is new text, so it needs Fable and an owner pick. Pre-existing, but this push makes the contradiction show.

**L1. LL against the next screen.** act1_fallout.js:166 vs fo_leave_offer.
LL: "Old Wen … keeps hold of it, there being nowhere in the room fit to put it down." Choice [1] then opens with "Old Wen sets the lacquered tube down on the table and squares it to the edge". Fix: cut the "there being nowhere…" clause.

**L2. LL: an ambiguous "he".** act1_fallout.js:164.
"…does not agree with what the disciple's eyes had seen, and that he cannot account for it": the nearest reading is the stranger, which flips the meaning. Fix: "and that the disciple cannot account for it".

**L3. TR day block against the bolt.** prologue.js:935.
"to shield her eyes from a flash that never arrived" comes one paragraph after "One bolt comes down… fizzles out". Fix: "from the strike that never came".

**L4. TR: moss in the ashen hills.** prologue.js:932, :937.
Both camp blocks say "scorched moss". `ah_hub` is black ridges and ash ("Forage in the ash"). The bolt line's "moss" was already there before this push; now the block says it a second time. Fix: a ground word per hub (ash for `ah_hub`), as BT_TREE_GROUND does.

**L5. TR tree block: ", as evidence" is a James habit spreading.** prologue.js:940.
"She holds it up, as evidence." The phrase is already used 4× (longforest.js:211, 675, 691; house_texts.js:23), always as James's joke. Fix: "She holds it up." or another beat.

**L6. EN rhythm.** act1_fallout.js:240.
"A man with no sect and no master who sings bone" can be read as "no master who sings". Fix: "A man of no sect and no master, who sings bone…".

**L7. TR at rt_camp, 19:00–19:59.**
rt_camp is entered at 19:00 (`toHour`), and the camp text has the three of them sitting round the fire. The day block shows until 20:00 and opens "Mei Lin is standing where she stood when the clouds came, a hand still raised…". Minor. Fix: count `rt_camp` as night, or start the block with her getting up.

**L8. LETTER.lost now has one gate, and its date is wrong.** act1_fallout.js:176.
`sky_witness` is set by any village breakthrough on Days 4–7, but the letter says "on the day of the tribute". Pre-existing; this push now makes it the only gate. Fix: "in the days of the tribute".

Checked and fine:
- Party flags are reset each Coil (not in KEEP_FLAGS) and set only from fo_mei_insists onward. No hub lies between there and bl_start.
- `rt_ashfall` and `fo_ashfall` take the Act 1 witness block first.
- `heart_camp` is inside the tree but is not a Meditate screen.
- `hymnToday`: the song plays once a save (ON-S), the record is per Coil, a later visit or a breakthrough redraw stays true on the same day, and an old save has no `sg`.
- Tone: Mei Lin loose, Ya teasing, James's lines deadpan, Old Hu grave.
- LL keeps "cannot sense him" for later.

## Planted faults (/tmp/n1r/faults.json, 19; not run)

Expected to be caught: F1, F2, F3, F10, F11, F13, F15, F18.
Expected to be missed: F4, F5, F6, F7, F8, F9, F12, F14, F16, F17, F19.

## Test gaps

- **TG1:** TR is never tested on `ah_hub` with the "Ya's gone" or water door open (M1).
- **TG2:** L7 is walked only from Day 8 (`7*D`). Add a Day-9 act start (M3).
- **TG3:** EN is checked per ending by regex only; nothing checks that the clause fits the bluff ending (M2).
- **TG4:** Tone is not pinned. Missed faults:
  - F4, F9: Mei Lin kneels or reveres him; her laugh is lost.
  - F6: Ya made grave, "scholar" lost.
  - F14: HYMN's "gravely".
  - F17: Old Hu's line.

  Pin a word each: "laughs", "scholar", "gravely", "Elder to carry".
- **TG5:** Time words are checked only in the tree block, and its regex misses stars, moon and dark (F5). The night and day blocks have no check at all (F7, F8).
- **TG6:** The LL reveal ban `/cannot sense/` misses "could not sense" (F16). Widen it to `/sense him|feel him|cannot feel|root in him|empty chair/`.
- **TG7:** LL's "twenty-first day" is not pinned (F19).
- **TG8:** `hymnToday`'s song key is not tested (F12): fake an `sg` of another song on the same day.
- **TG9:** The bots never call `musicLine`, so the hymn line has no coverage in the bot run (the packet has no HYMN render). Its only test is the unit walk. Either note this or have one walk call `musicLine` as main.js does.
- **TG10:** The rt_wen and rt_elder sky lines are not tested by `sky_witness` (M4).
