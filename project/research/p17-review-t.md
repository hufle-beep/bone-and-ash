# P17-A cold review T (texts), v0.11.247

Opus, cold. Read: the briefs, both checklists, the canon card, the diff, the packets (roof, talks, walk, far hunt, far won, slopes), the TX list, and excerpts from `ashfall.js`, `act1_blackroot.js` and `stomp_act1.js`. Renders in `/tmp/rv-t` (scratch). Planted faults: `tools/mutate.mjs`, 5 faults, `--jobs 1`, against `story.test.mjs --quick`.

## High

**H1. BW2: the hawks' new away texts say nobody is there when Mei Lin is** (`AW.stomp_hawks_more`, all four `any`). `awayNow` is `'ya'` (Ya away, Mei Lin there) on every Ashen Hills day from `bday` 4 until Ya's door, so this is the usual away state. The old degree-3 text has a `ya` version, "a thin white lattice of bone opens over the three of you", which puts Mei Lin at the fight. Rendered in the `ya` state (seed 47020, cat), the closing lines of 3 of the 4 new texts say nobody else is there:
- d2 #2: "there being nobody about to object"
- d3 #2: "Nobody is here to impress, so you are merely efficient."
- d3 #3: "Tidy work, and no one to say so."

d2 #3 ("hunting with nobody to tell you how") still works with Mei Lin there. **Failure:** a player on day 4 at the Ashen Hills, Ya off sulking, wins against the hawks. Mei Lin is standing there, and the text says nobody is. **Fix:** give these texts `ya` and `both` versions, as the old degree 3 has. The `ya` ending can nod to Mei Lin or simply not count heads.

## Medium

**M1. TL4, Mei Lin's beat 12 treats the arm's music as news.** "Your arm is making music," Mei Lin says... "she has simply come within range." She has already heard it on the roof: ROOF_NEW[1] "Mei Lin has stopped pretending she cannot hear it", and the later nights' old text "Leave it," she says. Beats 11–14 come late on the road (about days 12–15 of the Blackroot's 15), after every roof evening. **Failure:** the first conversation about the music happens twice.

**M2. TL4, Mei Lin's beat 13 retells two things she has already told.** "Mei Lin tells you... that she was tested at seven." The week-2 walk (story day 5, text 5) already has "When I was seven they tested me anyway... I howled." Then "My father had a root": the week-2 supper (the mother's account, which every week-2 supper player reads) and the week-3 roof text #2 (his hollow in the thatch) have both told this. Her line "Everyone was very sorry for him" also clashes with the supper's timeline: the collectors took him up the road when she was six, a year before her test. Roof week 3 #2's "the Sect missed it" reads as fair irony after that supper, so it is not a finding.

**M3. TL4: Mei Lin laughs in all four cold closes.** The endings: "laughs as far as the next bend" / "laughs at the look on your face" / "She laughs, properly" / "laughs at herself for it". These are four talk days in a row (beats 11–14). This is the cycle-formula fault (v0.11.233 T M1). Ya's cold closes are varied.

**M4. TL4: the lifespan reveal and its "you're young" punchline, twice in two beats.** Ya's beat 13: "Centuries... eight or nine of them" and, warm, "Then you are a cub". Mei Lin's beat 14: "forty is hardly out of the house" / "behind a boy". Both women travel together, and the two beats can fall on the same or the next day. Ya's version also reuses the committees joke from Mei Lin's walk 6 ("You give her the committee"). **Suggestion:** move one of the two to another subject.

**M5. SR3: all seven week-3 lines after the roof end in an intact herb loft.** Examples: "You carry it into the herb loft", "The herb loft receives a man qualified in one wind", "In the herb loft your fingers go on being held". Week 3 comes after the arson night (`arsonNight`: week 2's story night). With `loft_burned` set, every one of these walks James into a loft that burned. This is the open item LF (the bots reached it in 0 of 80 games). The push adds 7 more lines to it, all in the one week where the burn has already happened.

## Low

- **L1. MW7, a pronoun after an insert** (v0.11.190 M1). In all three forms the Yuki paragraph ends on her speech with "she says". The next paragraph opens `"That gander bit me when I was four," she says.` The reader takes that "she" as Yuki until "Mother" in the next sentence. Fix: "Mei Lin says".
- **L2. BW2, the hawks' degree 2 #3, cat form.** "The screaming stops in order... the birds finish the journey as luggage", so all three are dead. Then Yuki "bats the nearest one dead". The same bird dies twice.
- **L3. TX: runs moved, not removed.** `wen_lesson`: "Today's lesson is the wood." is followed in the same paragraph by "made the forest kind" and "the forest was kind no more", and the next day's text has "He comes back to the forest". That is two names for one place, and the stated reason (the wilds) is not used either. The ladder swap leaves "rung" three times in two sentences ("rung by rung", "each costs", "buys its rungs"). In `herb_girl`, "the way they'd slide off" still appears twice in the sentence.
- **L4. BW2 elk, win 3 against hunt 3.** The hunt and win day counts move together, so win 3 follows hunt 3. Hunt 3 sets the plan: "I drop on its back... Herb girl throws her stinking powder". Both win-3 texts drop the plan. In degree 2, Mei Lin "cannot stop laughing long enough to come out"; in degree 3 the elk circles James on the road while Ya and he are above it in the hollow.
- **L5. FW #4.** It brings the kill out "at the hunters' door" after #3 had made a custom of the swept place past the oak hollow ("in the order custom has settled on"). Its label "Back to the village." comes after a text already set in Ashfall; the first text has the same problem.
- **L6. TL_YA[3]:** "Your cat" has no form branch. The same cycle's beat names her by form ("One cat on two legs").
- **L7. Repeats created by the new texts.** Roof week 1 #5 (the white coat as mourning) turns an old road beat, "whether everybody... wears a white coat into a forest", into a second asking. Roof week 3 #3 is an earnest weather lesson ("East. Rain by morning.") on the evening after supper week 3 #2 made "the weather" the code word for the Sect.
- **L8. New facts.** "Ash-grass" appears nowhere else in the game or in `lore.md`. "A language nobody speaks any more" (James = supplanter, from Hebrew) is false on our Earth; it may be fine for his.

Passed: no glasses business; Ya does no reading; nobody flies; times fit (roof at night, talks by day, far hunt with no time words, walk at sundown); the warm and cold branches match affection; every fold's first paragraph stands on its own; the great form is never prey in the hawks' texts; human Yuki is never on a shoulder; the elk texts have Mei Lin present (on the Root Road `mei_party` is always set); no canon tics in the drafts (my grep). PC's amatoxin line ("Nothing for half a day... chiefly to the liver") is correct.

## Planted faults (`scratch/faults-t.json`, story `--quick`)
TF1 human Yuki "on your shoulder" in an away hawks text: **missed**. TF2 glasses in roof week 3 #1: **missed**. TF3 "for the rest of the evening" in a by-day talk: **missed**. TF4 "for a long moment" in roof week 3 #7: **missed** (the text lint only logs). TF5 (control) Mei Lin named in an away text: caught. 1 of 5 caught.

## Test gaps
- **TG-T1** (H1): the BW2 away check tests only that no woman is named. Add: in the `ya` state, no away text matches /\bnobody\b|\bno one\b/ (or pin `ya` and `both` versions).
- **TG-T2** (TF1): the BW2 form check covers the tiger only. Add: the human branch never matches /shoulder|collar/, and the cat branch is never "at your side".
- **TG-T3** (TF2): the glasses ban is pinned only by the two dropped drafts' strings. Add: no new P17 text matches /glasses|spectacles/.
- **TG-T4** (TF3): talks by day. Add: TL texts never match /evening|tonight|night|dusk|lamp/.
- **TG-T5** (M3): count cold closes that end on /laugh/ (at most 2 of 4).
- **TG-T6** (M1, M2, M4): a fact told once. Pin that TL_MEI never matches /tested|my father/i or /making music/, given walk 5, the supper and roof week 3 #2; and that Ya's and Mei Lin's beats don't both carry /centuries|forty/.
- **TG-T7** (M5): roof week 3 rendered with `loft_burned`: the line after never names an intact loft (part of LF).
