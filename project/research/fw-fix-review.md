# Cold review: v0.11.195 (F1, D1), the flight lines

Read: the brief, the checklist, `git diff`, the packet, the canon card and the drafts. Rendered in a scratch copy (/tmp/fwr/s, js only): `elder` and `tribute` with `sky_witness` in all three forms, with `long`, `ignored`, `gao_beaten`, `gao_broken` and `healed`, and with Yuki's primaries 0, 5 and 12; the realm 1 breakthrough at village 10:00, supper 22:00, fo_ashfall, heart_hub and rr_hub (party).
Planted faults: `faults.json` (22) through `tools/mutate.mjs --jobs 2` (story quick): **21 caught, 0 missed, 1 not applied** (F22's find says "stands", but the file has "stand"; with the find fixed, F22b is caught). My own 4 (faults2.json) were **all missed**: see TG1.

No H findings.

## M

**M1. WD-3 is never drawn (`wilds.js:231`, `flight_texts.js` `FW.explore`).** `wilds` is a task hub. [3] is the entry to the door menu `wild_explore`, which task mode draws as "Explore" (`task_hubs.js:52`; packet C3: "NOT drawn"). Story Mode is gone (v0.11.41), so the new label never shows on screen. The F1 test and X1 still pin it, and the news line counts it among "the forest labels". This is a fix placed in a text that is never drawn.
Fix: drop the swap (put the old string back, delete `FW.explore`, the FW count 17 → 16, the WD-3 assert), or keep it with a comment saying it isn't drawn and a test that asserts it isn't. Dropping it is cheaper.

**M2. EW-2 doubles "ninety" in real play (`flight_texts.js:12` + `prologue.js:116`).** The test and the packet render `yukiMerElder` with primaries 0 only ("has watched my kettle…"). In play, with primaries 1–11 or 12+, the paragraph reads: "…and **at ninety** I do not know which of them to bury. And the beast on your shoulder: I have **watched** it since you came through my door. … **I am ninety**, and I have seen steam do that only around the heirs of great sects." That puts "ninety" in the paragraph three times (with "the little sense ninety years have left me"), plus ¶1's "is ninety". "Watched" appears twice (Heaven, then the beast).
Fix: "My sense and my eye cannot both be honest, and I do not know which of them to bury." Optionally, "stood in my own street and saw Heaven come for…".

**M3. LH is left hanging by ¶4 (`prologue.js:719`).** Lu Han announces that a tribulation came for a man and didn't burn him. One line later his sense finds nothing, and he says "No cultivation at all. A mortal." Nothing connects the two, so he reads as if he forgot his own report. Wen gets the "my sense against my eye" beat, Lu Han gets none. Two paragraphs in a row also open on `…," he says`.
Fix: add a short tail after "A mortal." that shows only with the sky flag, for example `"Villages exaggerate."` (Fable drafts it, owner picks). Under the sky flag, open ¶4 with `"Interesting." His Qi-sense…`. All three `yukiMerLu` variants, `healed` and `gao_broken` otherwise read fine with LH (rendered).

**M4. The BT closer repeats on the village screen (`flight_texts.js:43`; `prologue.js:1030`, `:884`).** Wen's witness block, two paragraphs up, says "A tribulation that **withdraws** its own verdict". The closer then says "The ground, for its part, has **withdrawn** its claim": the same verb and the same legal image on one screen. The realm 1 screen already has "verdict" (the `knows` text), "in any court" and Wen's "verdict". The shape "The earth, for its part, …" is already realm 11's joke ("does not appear to have been told"). Act 1's Ashfall block has "no charge to bring", the same legal family.
Fix: another verb and shape, for example "The ground, it seems, has let go of you." It needs a pick, since D1 chose this alt.

## L

**L1. RA-3 moves the slope and squeezes the timeline (`flight_texts.js` `ridgeSlope`).** The old text puts the herb slope between the ridge and the village ("The way down crosses…"). The new one has him cross it "coming in". At realm 2 the flight takes 6 min (the flown line), so he passes over the attack minutes after the scream and finds it already over. ¶2's "Under the ridge sits a village… People." also reads as a discovery right after "the lie of the land already in your head".
Fix: see the slope from the ridge, in the present tense: "Below, on the herb slope, a basket lies spilled. A boulder has blood on it. Whoever was there has gone." That keeps the old geography and needs no timeline.

**L2. Scout flies in daylight without the care heal_again takes.** It flies out of Ashfall over the road the Sect's watchers have used "three days running" (the scout's success line), while `heal_again` takes care to "land out of sight". The next dawn Lu Han still calls him a mortal. Optional fix: "…from high enough to pass for a bird".

**L3. Some flown lines are almost never seen.** MW appeared in 0 of 1,100 games, flown `heal_again` in 1, and `night_attack` [1] / `jackals_fled` were "not seen in the bot run" (they need the hedge form). This is harmless; see TG4.

**L4. EW-4 can name the wrong rung.** `sky_witness` is set by a village breakthrough at any realm (`prologue.js:1080`). With Foundation in the wilds and Core Formation in the village, Wen still says "Foundation… until Heaven declined to stop you". That works as his own inference, since he can't feel rungs. Note only.

**L5. LH echoes and repeats.** "Nobody needs to." also closes a beat in `act1_heart.js:41`. It is the screen's third "line" (¶1 "down the line", ¶2 "in line", LH "Down the line"). Optional: "All along the post, heads go lower."

**L6. A moved comment in `wilds.js:7-8`.** The old import comment ("v0.11.118 (YK1 review, SB); v0.11.131 … canFly") now trails the new FW import line. Move it back.

**L7. Same family, outside this push (open, options later).**
- Act 1 marked walks with Mei Lin and Ya along are still flown: `wyrm_won` "Get them both to dry ground", `dw_drowned_won`, `rt_start` "Ya's way…", `ht_leave`. This is LW's logic, applied to the prologue only.
- `mire_lost`'s label "Limp back to the stream." sits under its own flown text "You leave straight up…".
- The `ignored` elder line "you walked down out of the Blackroot" now follows a flown descent (the FW read's O, "unsure").

## The brief's questions

- **A flown line where he did not fly: none found.**
  - `ridge_alone` is reached only by `dawn` [2] (`prologue.js:387`). That choice is a pure walk on a story screen to another place, so it is always flown at realm 1+ (the packet shows the flown result lines).
  - `heal_again` is reached only by `heal` [2], at the same realm. Nothing between them can break through: it isn't a hub, and the Meditate card isn't there.
  - `heal` [2], `wilds` [10] / `stream_out` and `scout` are not walks. Their texts say flown and keep their time (120 / 240 / 30). The new texts account for it ("cutting and carrying", "low and slowly"), and scout's time is a door card's.
  - `dawn` [0] (time 5) stays on one place, and its new label is neutral.
- **`sky_witness` when Wen or Lu Han could not have seen or heard: none found.**
  - It is set only for `village`, `ashfall` and `supper` (`prologue.js:837`), all in the street, where the witness block puts Wen in his doorway and "someone… is already running up the road to the Crimson Lotus".
  - A `supper` breakthrough on the last night gives the runner the night before Lu Han arrives.
  - There is no hub between dawn and `tribute`, so no breakthrough can happen on the tribute morning.
  - The flag isn't in `KEEP_FLAGS`, and a prologue rewind restores the arrival snapshot.
  - Old saves: the flag means what it meant before.
  - A visit to Wen after the breakthrough shows the new text, as it should.
- **Elder ¶3 "There does seem to be a consensus."** It still answers "cut you open" and reads well (apart from M2).
- **BT in Act 1 and with the witness blocks.** It reads well after BT_A1_WITNESS, the party lines and `heart_hub`, where he sits on the Tree's lip. The problem is M4.
- **Task mode.** `wilds` [10] is a story stop under the cards and is drawn. [3] is M1. Every other new label is a story choice and is drawn.
- **Tics and tone.** No card tic in any new line. James stays deadpan, and Wen and Lu Han stay grave.
- **Facts against the old lines.** The waystation, bench, shrine, red lotus, fresh marks, two shelves of pale green fungus and the mother's moon are all kept. "Mud to the knees" is gone, which is fine. The ridge's sights are kept, apart from L1.

## TG

**TG1. Fable's words are pinned only at their starts and ends.** These planted faults all pass `story.test --quick`:
- G9: EW-2's "Heaven left with nothing" changed to "burn him to the bone".
- G10: the scout's red lotus changed to white.
- G11: RA-3's "A boulder had blood on it." dropped.
- G12: LH's "Nobody points." changed to "Old Wen points."

The test compares each screen with `FW` itself, so a change inside a line passes. Fix: pin a fact word or two in each line, or hash `FW` + `BT_CLOSER` against v0.11.195.

**TG2. EW and LH are tested with primaries at their default only.** Add renders at primaries 5 and 12 (where M2 shows) and an assert against the doubled "ninety". Also assert LH with `healed` and `gao_broken`.

**TG3. Textlint never reads `BT_CLOSER`.** The samples are realms 0, 2 and 7, its only screen is realm 1, and it isn't in a pool. So reused runs and the "for its part" echo (M4) go unread. Add it, with `FW.morningOut`, to `sky_fw` or `bt_place`.

**TG4. MW, `heal_again` and NA are tested only through `goTo` with a faked realm.** Add one real path: realm 1 `heal` → `choose` [2] → `heal_again` shows `FW.healAgain` and costs 120 min. Assert that WD-3 is not drawn (`taskCards`), or remove it (M1).

**TG5. `faults.json` F22 had a typo in its find and wasn't applied.** Check that a fault applies before it counts, or have the mutate report treat "not applied" as a failure the review must fix.
