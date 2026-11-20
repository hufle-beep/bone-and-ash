# P7-A cold review, reviewer T (texts), v0.11.234

Rendered in a scratch copy (`/tmp/rv-t`): the roof's later nights 1–7 on the long calendar (vday 2 → 3), the first week 1–4; the firesides RR 2–3 and AH 2–3, cooked and not, cat / tiger / human (realm 0 / 2 / 7), AH by both / ya / mei / none. Bots: Careful and Sociable, 12 games each, `--cal 7`, with a logging hook on "Cook and eat." and the meal firesides. Faults: `p7-faults-review-t.json`, 7 planted, `--cmd "node tests/story.test.mjs --games 2 --workers 1"`: **0 caught, 7 missed**.

No H.

## M
**M1. The three new lines after "Stay until the cold drives you in." put James to sleep before the next screen does.** They end "You sleep in the herb loft like a man with water to carry." / "…in the herb loft, wish the third shelf goodnight, and sleep beside it." / "You go up to the herb loft smelling of chestnut smoke, and sleep." The next screen is `village_night`, and on every quiet night its text opens "The herb loft smells of mint…" / "Below the herb loft somebody banks the stove…" / "The herb loft is dark…". Yuki then settles on him, and the screen offers "Sleep.". So "herb loft" comes twice in two sentences, and he falls asleep before he settles. The old three lines stop at the loft ("You climb to the loft…"). All three new lines also open on the thatch going cold ("when the thatch goes cold" / "By the time the thatch is cold" / "once the thatch is cold"). With the first week's third line that makes 4 of the 9 roof lines, and the button above them already says "the cold". Cause: the RM brief told Fable to end each line "going up to the herb loft to sleep" (the v0.11.233 T M1 kind: a beat the brief prescribes ends every text). Only the arson night (vday 2's story night) wakes him, so it is unaffected. Suggested (checked with `--check`: 0 tics, 0 runs, 0 time words):
- 2:4:r "The dyer's lamp outlasts you both, and his sums are no nearer. On the ladder… as a kindness to the defeated. You go to bed like a man with water to carry."
- 2:5:r "By the time you give up the roof she has run out of sprigs and you have failed four, every one of them a plain leaf. She goes down naming them at you like a debt. Up in the loft you wish the third shelf goodnight."
- 2:6:r "…and you break it together on the way down. At the bottom she folds the blanket with great correctness, as evidence. You take the smell of chestnuts up to bed with you."

**M2. Claude's cut "shaking" → "laughing" makes text 4 echo text 2, two nights apart.** Text 2 has "Mei Lin laughs into her sleeve, where the lane will not hear it." Text 4 has "She says it into her sleeve, laughing.", also about the lane. The sleeve comes up in 4 of the 6 later texts (2, 4, 5 "the sprigs across from her sleeve", 6 "a roasted chestnut out of her sleeve"). It is in none of the first week's three or the old later text. The RM brief prescribed "she laughs into her sleeve". Suggested: 2:4 "…since I could climb." She keeps her voice grave and loses the fight with her mouth. "It was never a bet…"; 2:5 "She passes the sprigs across one at a time." Both checked.

## L
**L1. One beat across the cycle.** Her mother is in all 6 later nights, in the text or the line after. In the texts: 2 "Don't tell my mother", 3 "You measured my mother", 4 "my mother's water", 5 "My mother will have it out by morning", 6 her rules. In the lines after: 1 and 3 "her mother's room". Texts 3–6 are also four nights in a row of Mei Lin teaching or testing him: the bow lesson; "It was a lesson"; the exam by smell; the rules recited. Line 5 ends "reciting their names", and text 6 opens "Mei Lin recites them" the next night. Texts 4, 5 and 6 all open "Mei Lin…". The cheapest fix is to cut the mother from 4 or 5 ("The loser carries the water in the morning"; "That comes out by morning"). The arson text calls the herb loft Mei Lin's, so in 5 the stock is hers to clear anyway.

**L2. "The widow" next to a widowed mother.** Mei Lin's mother is a widow, and at the arson (vday 2, before text 4 can show) she says "You came by night to burn a widow's house". Text 4 bets on "the widow's lamp" with no other tag. "The widow by the well" is only in week text 2 (`ROOF_NEW[1][0]`), which a player who climbed once in the first week never saw. "My mother's water" in the next line separates them, but only after the reader has wondered. Suggested fold sentence: "Mei Lin bets you that the lamp of the widow by the well will go out before the dyer's." (checked). The dyer (tax spy, a wife who asks about the cooking) and the new miller fit the game.

**L3. "since the pickles were counted"** (AH 3, `mei`, no cook). There are no pickles anywhere in the Blackroot, and nobody counts anything on screen. AH 2's no-cook text set up Mei Lin's rice cakes. Suggested: "since the rice cakes went round" (checked).

**L4. `cookedToday` counts the tap, not a cooked meal.** "Cook and eat." marks `bl_cook` even when `eatBest` eats something that has no cooked form (smoked meat, dried bracket, honeycomb, cress, berries) or nothing at all after spoiling. DR_COOK is held back then (RV1 L4: `/, cooked\./`), but the fireside's cooked branch still says "your stew", "you cooked it" and "the pot". Measured: 1 of 181 taps ("You eat: smoked meat."), so it is rare. Fix: set a cooked mark only when the line has ", cooked", and read that.

**L5. Days with no food at all.** These are no-cook days too: the card hides at `foodCount` 0. The no-cook lines give the women their own food (Mei Lin's rice cakes and pan, the meat on Ya's stick, Ya's kill), and that holds next to the camp's "The hammerspace holds no food." Three nearby lines strain on such a day. RR 3's "You gathered twice what supper needed" comes two screens after "zero snacks". RR 1's "you gave the best piece away" and DR_BETWEEN 1's "Ya eats off your plate" are older and unchanged. None of the three says he cooked. No other camp, eat or DR_COOK line on a no-cook evening says so (grep).

**L6. The fold, nights 7–12.** A second round shows the text's first paragraph only. Then line 4's "his sums", line 5's "the third shelf" and line 6's "The chestnuts" point at the hidden part, as the old lines' "the jar" does. Acceptable. M1's 2:4:r keeps "his sums".

## Checked, no finding
- **Time words:** "in the morning" (4) and "by morning" (5) hold on every later night, the night before the tribute included ("Tomorrow." on the banners; the water still needs carrying). No "tonight" is left. The old calendar is unchanged (always the old text).
- **The fold:** each new first sentence stands alone.
- **Canon:** no glasses or coat (RM2 swapped those out), no Yuki, so there are no forms to check. Romance stays at the old texts' level (a shared blanket; "she gave no figure").
- **Tone:** James is deadpan ("It's doing very well.", "Several."); Mei Lin is looser.
- **The firesides' no-cook versions** read on in every form and every warmth part. "Can you do red?" now lands on the fire he laid, and "Eat your supper, Ya." still fits.

## Test gaps
- **TG-T1:** the new roof texts 4–6, their lines and the no-cook firesides have no whole-text pin. P5-B's pin loop takes 3 nights and cooked days only. Missed: T3 (a word in text 5), T4 (RR 3 has him serving again), T5 (the widow becomes "my mother"), T6 (AH 2 no-cook "watch the pot"; the OLD regex only knows "facing the pot").
- **TG-T2:** Claude's cuts are not pinned. Missed: T1 ("shaking" back) and T2 (2:4:r back to "climb to … and sleep"). The new texts' "names no day" regex has no `tonight`, so T7 was missed.
- **TG-T3:** no test reads a line drawn above `village_night` against its text: no "sleep" before the screen that sleeps, no "herb loft" twice in a row (M1).
- **TG-T4:** nothing tests `cookedToday` against a meal with no ", cooked" (L4).

Checklist line proposed (Continuity): *A result line drawn above the next scene's text (v0.11.234 T M1): it must stop where that text starts (no sleep before the screen that settles him) and must not repeat its opening noun; a brief's "it ends with…" goes into every line.*
