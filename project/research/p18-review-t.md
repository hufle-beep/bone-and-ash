# P18-A cold review, T (texts), v0.11.248

Rendered in a scratch copy (`/tmp/rv-t`, scripts `/tmp/rvt-s/*.mjs`): VM weeks 1 and 3 by form, burned and not; week 3's mornings and nights in order (`n.mjs`) and week 1's roof → night → morning in order (`w1.mjs`); the roof's week-3 texts and stay lines, burned and not; hawks 1–5 by form, Ya there and away; rr_hunt 1–4; Wen's day texts with both pools' closers; far_won 1–6. No test suite or mutation runs (2 cores, the code review runs beside this one).

**Clean:** no tics in the added lines; the great form is never the hawks' mark; human Yuki is never on a shoulder; the great root-kin's size fits every loft, passage and table line; time words fit (week 1's "weeks off" shows at 20–14 days left, week 3's "this week"); every new first paragraph stands alone when folded, and so does every one-paragraph text's first sentence; "all your life" is true (same birthday); the away versions name no woman and still read right with Mei Lin there or with both women away (`any`); ROOF_BURNED and the burned week-3 mornings name no herbs.

## High
None.

## Medium
**M1 LC1 holds only in the changed lines (canon call).** After a burn, every week-3 quiet night still has the header "Ashfall Hamlet — the herb loft" (`village_night.place`, rendered on all six nights in `n.mjs b`). On the eve, `romance` tows you "toward the ladder to the herb loft" under the same header. Failure: the player reads "scorched loft" in the stay line, then "the herb loft" on the next screen's header. The owner's call LC1 says nothing names herbs in the loft. Fix (open, options later): a burned `place` for `village_night` and `romance`, plus `romance`'s line.

**M2 Week 1: the same joke on the roof and the next morning.** In order, roof 2 (`ROOF_NEW[1][0]`: "Mei Lin lists what Ashfall has decided you are": deserter, struck-off physician, fox spirit; its stay line: "the dyer has you down as a tax spy") is followed by morning 2 (`VM_W1[0]`): "Ashfall has not settled what a tall stranger … is for … *a physician, a ghost or a tax*". That is a repeat and a contradiction ("decided" against "not settled") on back-to-back screens, measured with the roof taken every night. All three week-1 mornings also carry the same beat: the old text has "deciding what you are", `VM_W1[0]` has "not settled", and `VM_W1[1]` has "weigh a stranger properly, on both pans".

**M3 Week 3: banners on night 5 and on morning 6.** In order, night 5 ("the banners hang from the tribute post as straight as plumb lines. The lane lies awake over them …"; Yuki smelt them) is followed by morning 6 (left = 2), which is `VM_W3[0]` again and so folded to its first paragraph: "The red banners hang on the tribute post, and Ashfall has agreed not to look at them." The two screens open the same way, and one has the lane watching while the next says it has agreed not to look.

**M4 The burned week-3 mornings disagree with one another.** After a burn the order is: 1 "What is left of the loft is still smoking a little" (old text), 2 the loft "ticks as its charred beams warm", 3 soot on the table, 4 its charred shutters opened. Then 5 (left = 3) brings the old text back: "still smoking a little". By then James has slept up there four nights (ROOF_BURNED) and has opened its shutters. "What is left of" also does not fit a loft he can sleep in. Before this push the old text showed every day, so the smoke line read as a steady state; the sequence makes it go backwards. The eve's house text "the loft posts still smoke a little" adds to it.

**M5 "Breakfast" twice on one screen.** `village_morning`'s enter line "Breakfast at Mei Lin's: rice gruel and pickles, +20 satiety." sits above `VM_W3[1]`, which opens "Breakfast is a quiet meal in Mei Lin's house this week." (`s.mjs`; this is the v0.11.234 T M1 kind of fault). Smaller cases on the same screen: `VM_W1[1]` has "Nobody mentions it over the gruel" under "rice gruel", and `VM_W1[0]` opens "You wake in the loft" under a breakfast already eaten.

**M6 The hawks' Yuki passages follow one formula.** In texts 3–5, all three forms, both versions (18 renders), every `{yuki}` passage opens on the hawks wanting or avoiding Yuki: "They came for / had stooped at / the reason for every one of those dives"; "swung wide / circled wide … as ships do a reef / flew round at a respectful distance"; and the same in the away versions. All six away passages of texts 4 and 5 open "Yuki, whom/at whom …,". Texts 4 and 5 of the away versions then tell the same joke on consecutive days: Yuki allots the carcasses ("You pick up what you have been allotted" / "You do as you are told"). The source is the brief (`p18-brief-b.md` item 2 sets the prey rule for every passage).

## Low
- **L1** `supper:5` "The widow says it once": in week 1's roof texts "the widow" is a neighbour ("the widow by the well", "the widow's window goes dark"), and the narration never calls the mother that. A reader can take her for the neighbour for a beat. In `SW3[5]`, "When Mei Lin's mother rises for the pot, Mei Lin ties …" names Mei Lin twice in one clause.
- **L2** Wen LOW 5th ("looks at the door … and outside"): drawn from the pool, it can land under `ashfall:2` / `2-early`, where his table already stands in the doorway. MID 5th ("lets the tea go cold") under `fo_ashfall:3`'s brim-full cup and its debt reads oddly. The rest fit.
- **L3** The great form's size joke on mornings 2 and 3 in a row: "has the floor, all of it" / "her half of the loft, which is most of it".
- **L4** `VM_W3[2]`: "the shutters of Mei Lin's house" and then, burned, "These shutters are the scorched loft's": which building is it? In the great form, "filling the window beside you" leaves no window for James.
- **L5** `rr_hunt` 4th: "Your Convergence <reacts>" ends paragraph 2 in all four texts (the brief's beat). "Ya breathes" is also in the 2nd. "I go under the root and come up at its belly" when the elk stands on the Root Road, on top of a giant root.
- **L6** `far_won` 5th: "they have given up watching your hands" repeats the 4th's "a fact the hunters have stopped remarking on". "Set the kill down whole in front of Ashfall's hunters" restates the 1st ("comes out whole at the hunters' feet"), which comes straight after it on the 6th visit.

## Test gaps
- **TG-T1** LC1 across whole screens: after a burn, render every reachable week-3 screen, headers included (`sceneView().place`: `village_night`, `evening2` → `romance`), and check it for /herb/.
- **TG-T2** Evening against morning, in order: week 1's roof n (text and stay line) against morning n; week 3's night n against morning n+1. Flag a shared opener or joke family ("what Ashfall thinks you are", banners).
- **TG-T3** The burned week-3 order: no "still smoking" after a morning where the loft has cooled or been slept in.
- **TG-T4** An enter line against the text's opening noun (`village_morning`'s "Breakfast").
- **TG-T5** The hawks with both women away (the P18-A block renders only Ya away).
- **TG-T6** (by reading, not run) F6 (the music line's same-visit redraw path) is not reached by the P18-A block, which calls `lineWords` directly, so it is probably missed. Planted faults were left to the code review.
