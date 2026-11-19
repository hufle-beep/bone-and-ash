# Cold review: v0.11.230 (P3-2 = FT + SF, D1, AS1, DB1)

Opus, cold. Read: both checklists, the brief, the diff, the packet, the Fable briefs (excerpts). Experiments in scratch copies (`/tmp/p3rev/`). Measured with the models test on the long calendar (`--cal 7`, 10 games per model) in a scratch copy with a trace added (far hunt kind and text, wins, `away()` branch, Spar with Ya).

**Verdict:** 1 high, 2 medium, 6 low; 8 test gaps. Planted faults: Claude's 9, 7 caught (F3 and F8 missed); mine 6, 0 caught.

## High

**H1. The far hunt's new later-day texts bring back a beast James killed** (`ashfall.js` `far_hunt`, wolves 3rd, bull 2nd and 3rd).
`far_kind` is rolled each day. The texts are keyed on the days that kind showed (`far_hunt:<kind>`), not on wins. Fable's brief said "the 3rd text is a later day: the quarry is familiar now", and the texts took that literally:
- wolves 3rd: "the same grey pair under the same oaks, and by now they know your smell";
- bull 3rd: "The thornback bull has the path again, … which among thornbacks may be recognition";
- bull 2nd: "A thornback bull again" became "**The** thornback bull is standing square in the path".

On the earlier days James usually fought and won, so the pair or the bull is dead. `far_won` and the stomp texts carry it home ("One needle, and the eye stops tracking").
Measured on the long calendar, 10 games each (Careful and Sociable never fight here):

| Text | Completionist | Cultivator | After a win over that kind this Coil |
|---|---|---|---|
| wolves 3rd | 8 times in 6 games | 5 times in 3 games | 13 / 13 |
| bull 3rd | 4 times in 4 games | 4 times in 4 games | 8 / 8 |
| bull 2nd | 9 times | 9 times | 14 / 18 |

This is the same kind of fault as rewrite part 9 T1 (also graded high). Failure scenario: Day 5, wolves, Fight, won, the hunters bow to the kill. Day 9 and Day 14, wolves again. Day 14 says these are "the same grey pair".
Fix direction: text only. Make the 3rd texts about a new pair or bull with familiar manners (the habits are familiar, the animal is new), and put the 2nd bull back to "A".

## Medium

**M1. Both away: the cooking eats alone, then the next screen sits both women at the fire** (`act1_blackroot.js` `DR_COOK`, `bl_camp`, `bl_fireside`).
`bl_camp` always enters at 19:00 (`toHour(g, 19)`), so the cooking runs in the evening. `bothOff` holds there until the spring scene is seen. The door hides at 19:00, but the absence stays (the comment at line 217).
The Ashen Hills fireside still draws both women. Rendered (trio 2, bl_day 4, cat):
1. Cook and eat: "…You scrape the pot yourself, which is the cook's right, and tonight it goes undisputed."
2. The same screen offers "Sit by the fire with the others."
3. The fireside: "Ya has put herself between you and Mei Lin with an arm hooked round each neck…"

Before this push the cooking and the fireside agreed. Measured: the cooking's both-away line ran 5 times in 40 games (all four models).
The brief's own question ("the cooking at the camp in the evening while both 'are away'") lands here. Either the evening counts as "back at camp" (drop the cook's `both` versions), or the fireside needs the same rule (out of scope).

**M2. The drills drop Ya while the same Practice screen spars with her** (`bl_train`, the hub).
`away()` changes the dart and needle replies only. "Spar with Ya." (`bt_ya`, no away gate) sits on the same work menu, and so does its reply "Two throws to her, one to you. She could not be happier."
Measured: 32 spars on both-away days and 13 on Ya-away days, in 40 games. That is about 1.1 a game, against 44 drill lines changed.
The same holds for other lines on that screen and its hub:
- "Talk to Ya." (`hubChoices`, no away gate);
- "Rest an hour." ("Ya's word for it is a nap");
- the truffle failure ("The beetle goes to Ya");
- "Cinderberries with Mei Lin." on a both-away day.

With Ya away, the cooking (no `ya` version) still names her, while that day's drills don't.
Second scenario, from the door model (`yaAway` = `bday ≥ 4 && !ya_off_done`): the trio takes "Find Mei Lin and Ya" (the spring scene, Ya kissing Mei Lin). After that the hub still shows "Ya's gone. So is her spear." (rendered), so `yaOff` holds and the next dart line is "Mei Lin says it had that coming", without Ya.
Before, the menu agreed with itself, so the push makes the contradiction sharper. Options for the owner: gate the spar and the talk on the same `away` rule, or keep the drill lines as they were.

## Low

- **L1. "loads" left in a stomp text.** `stomp_prologue.js` wolves degree 2, 2nd text: "You do not carry them far. … the loads leave your shoulders eldest man first". SF-a's list skipped it, and the test's regex (`in loads|each load|every load|a piece at a time`) misses "the loads". "You do not carry them far" also carries from the kill with no hammerspace. What's New says "the hunters no longer take the kill 'in loads'".
- **L2. Ashen Hills scenery in the Ya-away lines.** These lines show at the Ashen Hills only. "Mei Lin gathers the misses out of **the grass**" (`bl_train:1:f` [0]) and "props herself against **the mark's tree**" (`bl_train:1` [2]). The region is ash and black ridges ("Forage in the ash", "Ash, more ash"), and its one tree is the dead Hearth Tree.
- **L3. A save left on the night screen shows the first quiet night twice running.** A save resting on `village_night` from v0.11.229 has no `village_night:quiet` day. `dayIndex` returns `a.length` = 0, so it shows the 1st text. The next quiet night notes its day as index 0, so the 1st text shows again (folded the second time). Harmless (checklist v0.11.218 M1's kind).
- **L4. One image family spreads (paperwork and rulings)** across the 23 new renders:
  - "read the report and disagree with it" (wolves 3rd)
  - "agreed in writing" (deer 3rd)
  - "the objection is fully drafted" (quiet night 2, woman)
  - "to close the matter" (quiet night 3, great), which echoes "consider the matter" in quiet night 1, great: the same form, and 3 → 1 run back to back
  - "raises no objection" and "goes undisputed" (cook, both away)
  - "a first instalment" (cook, both away)

  That is seven, three in Yuki's or James's own lines.
- **L5. Solitude noted three times in the cooking lines** ("more bowls … put them back", "goes undisputed", "wash the one bowl"). Brief 2 allowed at most two over the 14 lines, and the drills add "keep it to yourself".
- **L6. Small continuity notes.**
  - `far_won` 2nd has the hunters meeting James at the oak hollow ("promoted"). The 3rd has him carrying the kill to "the first houses", so the custom goes backwards.
  - The bull's 2nd and 3rd texts have it standing in the path. The fight's intro and posture on the next screen have it "heave up out of the bracken". (Old for the 2nd, new for the 3rd.)
  - The woman's both-away dart line ("so far back that the hit has to be fetched as news … 'Centre,' she calls, without bothering to raise her voice") can't be heard at that range. Possibly meant as a joke.

Checked and fine:
- `village_night:quiet` is `null` on an arson night (`noteDay` ignores a falsy key). `arsonNight` doesn't read the clock, so `nightTo` in `enter` doesn't flip it before `dayKey` runs.
- The old calendar shows the 1st and 2nd quiet texts (days 3–4).
- `textDay` keeps 00:00–04:59 on the evening.
- Precedence both > Ya. `away` with no `ya` version keeps the line, which names Mei Lin only (fine with Ya away), except the cooking (M2).
- The stomp text replaces `far_won`'s text (`story.js` 109–113), so the two bows never share a screen.
- All 180 renders of the five reply lists (three states × three forms) pass `splitLine` whole (0 split off).
- Fold first sentences stand alone.
- Forms: no bond line spoken aloud, and no "shoulder" for the great form.
- Quiet-night time words fit 19:00–01:00.

## Test gaps

- **TG1 (F3 missed):** nothing walks an arson night between quiet nights. Add a long-calendar walk across vday 2's story night that pins `dayKey(g) === null` there and the quiet index before and after.
- **TG2 (F8, R2 missed):** the forms are only checked as different. Pin a word or two per form and text: the cat's chest or shoulder, the great form's floor or paw, the woman's ladder or "behind you". Pin italics for the cat and great forms and quotes for the woman, in the quiet nights, the cook [2] and the dart [4].
- **TG3 (R3 missed):** `ok3` checks three distinct texts and the wrap, not the order. "By now" can come second. Pin each index's opening words for `far_won` and the three `far_hunt` kinds.
- **TG4 (R1 missed):** the SF-a grep has four fixed phrases. Use `/\bloads?\b|load by load|a piece at a time/` over the renders of the far wins (stomp degrees 2 and 3, both kinds, both days). It finds L1 today.
- **TG5 (R4, R5, R6 missed):** `away()` is tested on fixed flags only (the Root Road against the Ashen Hills, day 5, no `trio_kiss_seen`, no `ya_off_done`). Read the hub's own door labels (`ah_hub` `show` with `late` off) on the same `g` and assert the drill line agrees. Cover the Drowned Wood, day 4, after the spring scene and after `ya_offended`.
- **TG6:** the text lint never reaches `bothOff`. Its samples set no `bl_region: 'ah'` with `trio ≥ 2`. Dumping the `replies` pool showed 0 of 8 both-away lines probed (bowls, nine needles, Centre, humming, letter, knuckle, hire this cook, instalment) and 2 of 2 Ya-away lines. About 14 strings (~23 renders) of Fable's text go unlinted for tics, 5-word runs and dupes. Add an Ashen Hills sample with both away.
- **TG7 (leftover):** in the P3-2 block, `forms = ['cat','tiger','human'].map((f) => …)` ignores `f`, and the only assert on it is `forms[0].length === 4`. It is dead (`byF` does the work).
- **TG8 (for H1):** no test reads a later far-hunt text after a win. A `goTo` walk could win wolves on day 1 and assert that the wolves' 2nd and 3rd texts don't claim the same animals.

## Planted faults (`tools/mutate.mjs`, `--cmd "node tests/story.test.mjs --games 2 --workers 1"`)

- Claude's (`p3-faults.json`, report `p3-mutate.md`): **7 / 9 caught.** Missed:
  - F3 (an arson night counted as quiet; the visible effect is a skipped text, TG1);
  - F8 (the great form given the cat's line, TG2).
- Mine (`p3-faults-review.json`, report `p3-mutate-review.md`): **0 / 6 caught.**
  - R1: "load by load" in a stomp text (TG4)
  - R2: the woman's quiet-night line in the cat's branch (TG2)
  - R3: `far_won` 2nd and 3rd swapped (TG3)
  - R4: both away read in the Drowned Wood (TG5)
  - R5: Ya away only from day 5 (TG5)
  - R6: both still away after the spring scene (TG5)

Measured with the brief's quick command. TS6's old-calendar hash runs in it too and did not catch R2 or R3.

## For the checklist (Claude adds in the push)

- *Text:* a later-day text of a quarry rolled each day ("the same pair", "recognition"), keyed on the days it showed, not on wins: the beast was likely killed on an earlier day (H1).
- *Code:* a presence rule applied to some lines of a screen: grep every card, label and reply on the same menu and hub for the name (M2), and the screen after (M1).
