# P17-A cold review C (code, tools, tests), v0.11.247

Read: the diff, both briefs, both checklists, excerpts of `ashfall.js`, `act1_blackroot.js`, `stomp_act1.js`, `oneoff.js`, `again.js`, `calendar.js`, `story.js`, `tasks.js`, `remember.js`, `packet.mjs`, `textlint.mjs` and the P17-A tests. Experiments were run in `/tmp/rv-c` (scratch), with HEAD from `git archive` in `/tmp/rvc-head`. Baseline `node tests/story.test.mjs --games 2 --workers 1` in scratch: 192138 passed, 0 failed.

## Findings

**M1: SR3's week-3 seventh roof text is dead (`ROOF_W3[6]` "Neither of you says much on the roof…" and `ROOF_STAY[3][6]`).** Week 3 has six suppers. A walk of `weekMorning` with `nextEvening` from week 3's first morning gives `cal_night` 0–5 → `supper`, then 6 → `evening` (the tribute's eve, with no supper and no roof). `seqText('supper_roof:3')` can therefore reach indices 0–5 only. The measure says the same (`p17-measure.md`: the week-3 seventh evening "shown 0", unreachable), yet the pick shipped seven for week 3 and the test reads `w3[6]` at day 36+6 without the routing. Failure: one text and its stay line that the owner paid for are never seen. A Coil can't reach them, and an old save can't either, because `:3` is new. Fix (owner's call, options later): drop the seventh, or fold it into the six.

**M2: BW2: the hawks' away texts for days 2 and 3 say nobody is there while Mei Lin is.** `AW.stomp_hawks_more` uses `any`, so it serves both away states. Rendered in the `ya` state (Ya away, Mei Lin present, `awayNow` = 'ya'), each of the four texts (i = 1 and 2, degrees 2 and 3) ends with: "there being nobody about to object", "hunting with nobody to tell you how", "Nobody is here to impress", "Tidy work, and no one to say so." The old crushing win splits `ya` ("the three of you": with Mei Lin there the lattice covers three, RV1 T M1 / C L1) from `both`. Fix: make these `both` and give them `ya` versions (or closing lines that don't count heads). The P17-A test only checks that no woman is named.

**M3 (tool): `packet.mjs` STATES now draw week 3's day 7 for every Ashfall scene.** `(v === 3 ? [0..6] : …)` restores the state that v0.11.243 RV1 (C L3) had removed because the tribute evening is not a supper night. The comment says "the roof's seventh", but the change has `on: inArea(ASHFALL)`, so `supper`, `village_night`, `supper_roof` and the rest are drawn at an unreal index-6 evening. This is how M1's dead text reached Fable and the reviews as reachable. Fix: keep k = 6 for week 3 only for scenes that really show that day (`mei_walk`, the day scenes), or drop it.

**L1: TL4's sample state is unreachable.** The test, the packet STATE and half the lint samples put beats 11–14 on the Root Road, day 2. `talkBeat` = max(talks, day index), and the talks are once a day, so beat 11 needs 11 or more Blackroot days. On the long calendar (3 days each story day) that is `bl_day` 4–5, the Ashen Hills, where Ya can be away (`yaAway`, bday ≥ 4). `TL_YA[0]` is in fact set on black glass in the ash. The old calendar never gets past beat 5 (flags are not kept across Coils). The packet's header misplaces the texts. Sample them at `ah` day 4/5, with Ya away for `talk_mei`.

**L2: HW's third slopes visit repeats.** `DR_SLOPES` has 2 replies (`dayReply`), so the third visit day wraps to the first ("concedes, with reluctance, that you have hands"). Week 3's slopes text is a single text, so two week-3 visits read it twice (VF folds the second). Before this push there were at most two visits. Cosmetic until the texts get a pass.

**L3: a misplaced comment in `stomp_act1.js`.** The `awayHawks` import lost its comment, and "v0.11.231 (P4-2, AT): the hawks' wins while a woman is away" now trails the `byForm` import line.

Checked and fine:
- **SR3:**
  - The old calendar: `roofWeek` 2 for every `vday` ≥ 2, as `ROOF_NEW[2]`.
  - An old save from week 2 into 3: week 3 starts at `ROOF_W3[0]`. The `:2` record is left alone, and the 6→7 cycle change only shifts index 6.
  - The stay line on the same day, a second visit (not possible from `supper`) and a skipped day: `dayIndex('s:supper_roof:3')` matches what `seqText` showed, and an undrawn text reads the same next index.
  - `vday` changes only in `village_morning`.
- **TL4:** beat 15 → the cycle's 9 and 17 → the quiet walk, as pinned. All talk choices leave the screen, so warm/cold can't change mid-screen. `remember.js` has no line for beats 11–14 (the general pool, fine).
- **BW2:**
  - `go()` notes `ah_hawks_won` / `rr_elk_won` before `sceneView` reads the stomp text, and `dayIndex` of an unnoted day returns the next one, so the order doesn't matter.
  - Function and string `old` entries are both handled.
  - `registerStomp` runs after the wrap.
  - Mei Lin's lines in the elk texts are safe, because `mei_party` is set on every way into the Blackroot.
- **HW:** the card is hidden while the stage is spent (`choiceOpen`, no "tomorrow" status), reopens in week 3, and the old calendar stays at 2. The rest of the change is as the brief describes.
- **SDm:**
  - The cap keeps exactly 8 keys.
  - The Coil resets with `lines`.
  - An older save gets `{}`.
  - `fresh` is decided once, and redraws are recorded.
  - The day check is redundant, because every key carries `textDay` (see F11).
- **TS6 re-pin, measured:** HEAD against the working tree over the test's 39,102 renders differs in exactly `wen_lesson`, `yk_night_ya`, `yk_night_fo` and `rt_yk_talk`, 126 each, and the only differences are the swap words.
- **The P6A stomp pin:** the diff of `stomp_act1.js` is only the imports, `registerStomp({` → `const STOMP_A1 = {`, and the `WIN_MORE` block, so the re-pin covers the intended code only.

## Test gaps
- **TG-C1 (R1 missed):** TL4 gives both women the same affection, so a warm close keyed on the wrong woman passes. Test Mei Lin warm with Ya cold, and the reverse.
- **TG-C2 (R3, R4, F11 missed):**
  - SDm tests only A, B, A with every draw fresh. Add A, B, …, H (8 keys), then A folds and I drops A.
  - Add a non-fresh redraw (B) that is recorded.
  - Assert `sda[id][0] === textDay(g)` after a new day.
  - F11 is near-equivalent: yesterday's keys can never match, so its only effect is stale keys taking room under the cap.
- **TG-C3 (R6 missed):** HW's Wen check runs with `oo:wen_lesson` unset, so it is true whatever the cap. Set it to 2 in week 3 on the long calendar and assert the card is closed.
- **TG-C4 (R5 caught by the P6A skeleton pin only):** nothing in the BW2 tests ties a text to its degree. Pin degree 2's and degree 3's openers for days 2 and 3. Any later push that re-pins `stomp_act1.js` would let a swap through.
- **TG-C5:** SR3's test renders week 3's seventh roof without the routing. Walk a real week 3 (`weekMorning`, `nextEvening`, `supper` → roof) and count the roof evenings (it would have caught M1).
- **TG-C6:** BW2's away test covers the `ya` state for names only. Add a head-count check (`nobody|no one|alone`) in the `ya` state (M2). The `both` state is covered by P4-2's walk, which caught R2.
- **TG-C7:** no tools test pins the v0.11.243 exclusion of week 3's day 7 from the packet's STATES (M3).
- **TG-C8:** TL4's test, packet and lint states are at the Root Road. Add the Ashen Hills, day 4/5, with Ya away (L1).

## Planted faults (`tools/mutate.mjs`, story test `--games 2 --workers 1`)
- **Claude's F1–F12:** 11 caught. F11 (yesterday's texts fold) was missed, as a near-equivalent: see TG-C2.
- **Mine (`p17-faults-review-c.json`):** 2 caught, 4 missed.

| Fault | What it breaks | Result |
|---|---|---|
| R1 | TL4: Mei Lin's beat 12 warm close keyed on Ya's affection | missed |
| R2 | BW2: with both women away, days 2–3 use the texts with Ya in them | caught (P4-2 AT walk, 3 fails) |
| R3 | SDm: the cap is 2 keys, not 8 | missed |
| R4 | SDm: a redraw is not recorded | missed |
| R5 | BW2: degree 2 and 3 day texts swapped | caught by the P6A file pin only |
| R6 | HW: Wen's lessons also get a third visit | missed |
