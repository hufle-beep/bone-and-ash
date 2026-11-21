# Bone and Ash, v0.11.243 drafts, run S2 (owner pick P15-B: SN7, the seventh nights; this run: the village supper and the quiet night)

You draft story texts for a hand-written text RPG. Read ONLY: this brief, `/tmp/p15/common.md` (tone and rules: they bind you), `/tmp/p15/supper-texts.txt` (the village supper's texts as they stand, as template code: `SUPPER_NEW[4]` / `[5]` and the `supper` scene's `seqText` lists `supper:4` (the old three, then `SUPPER_NEW[4]`) and `supper:5` (the old three, then `SUPPER_NEW[5]`); `SW3` is week 3's six, given so you don't reuse it), `/tmp/p15/supper-packet-slim.txt` (the supper's choices and the screens after), `/tmp/p15/quiet-texts.txt` (the quiet night's texts: `QUIET_OLD` and `QUIET_W1` are week 1's six; `QUIET_WEEK[2]` / `[3]` the later weeks', given so you don't reuse them; `quietY(shared, cat, great, human)` a shared text with Yuki's passage in `{yuki}`), `/tmp/p15/vn1-packet.txt` (the quiet night in week 1: what leads in, the "Sleep." choice and the morning after) and `/home/claude/bone-and-ash/project/canon-card.md` (canon, the tic list). Do not read other repo files.

## The setting
Ashfall before the tribute: once a year the Crimson Lotus Sect's collectors come up the road for grass, millet and any child with a spirit root. James lodges in the herb loft of Mei Lin's mother's house and eats supper there every evening (millet, greens, a little smoked fish). On the long calendar the village has three weeks before the tribute; each week has seven evenings, and each list has six texts, so its seventh evening shows text 1 again, folded. You write **three seventh texts**. Each stands alone.

## 1. `supper:4:7`, week 1's seventh supper
The house is still taking his measure; the mother is correct with him, not yet warm; Mei Lin is amused by him. After the text the player picks: the roof with Mei Lin; the dishes with her mother; the loft early. So it ends at or just after the meal, everyone still at table or clearing; it must not send him to bed or onto the roof.
## 2. `supper:5:7`, week 2's seventh supper
The house has half taken him in: the mother asks him one question a meal, once let him cook; Mei Lin teases him at table and gets told off. The tribute is closer and nobody says so at table. Same ending rule. (A fire or a visit from the Sect may follow that night on some paths: no hint of it.)

Each supper: 110–125 words, short paragraphs (` ¶ `). A new small moment at the table: something the mother asks, rules on, admits or teaches; something Mei Lin teases or is told off for; a neighbour's matter; a household custom got wrong or right. **Not cooking** (he does not cook). The first paragraph must not open with "Supper", "Tonight", "Another", "The mother", "Mei Lin's mother", "The house", "Between", "In the tribute's", "Halfway", "The lamp", "Does", "Before" or "You". Yuki: leave her out, or ONE sentence marked `{yuki}` (not in the first paragraph) given in three forms.

## 3. `village_night:quiet:7`, week 1's seventh quiet night
The text shows when he goes up to sleep (after supper and the roof, the dishes or going up early); the one choice is "Sleep." and the next screen is the morning. Him in the loft, settling, the house and the village around him at night; it ends with him asleep or about to be. Week 1's lane: still the stranger the herb girl brought home; learning the house (which board talks, the household's order of going to bed, night sounds he can't name yet); his own world's nights against this one. **Not** week 2's lane (the house half taking him in) or week 3's (a village listening to the road). It shows on the same evening as `supper:4:7`: don't repeat that supper's moment.
Shape (as `QUIET_W1`): ONE paragraph: the shared part 45–65 words with ONE Yuki passage (one or two sentences, 20–40 words each form) marked `{yuki}`; its first sentence must not open with the same first two words as any quiet text in the file, nor with "Tonight", "Someone", "Rain" or "You". No Ya, no sect men, torches, fire in the lane, or anyone at the window. Mei Lin does not come up to the loft; nobody new enters the house.

## Don't reuse (besides everything in the files)
The supper: upright chopsticks, the cooper's wife and the sieve, the glasses, the hen and the egg, the millet in the wrong tone ("sorrow"), the persimmons, the toasted millet, "could not boil water", the garlic, the liver, seconds, the largest piece of fish, the sacks for the post and the steelyard, the dyer's wife and the onion, a fox, a magistrate, dusting the shrine shelf, the stove, the north window, barred doors, the ladle; the empty box and the letter (a passing mention at most). The roof's and the dishes' evenings: what Ashfall has decided he is, his forearm's music, the plum wine, the tribute's numbers, the wrong stars, the singing trees, a bet on lamps, her mother's three rules, the village's debts to the Sect, which families the road has cost a child. The quiet night: Yuki on his chest, taking the blanket, cold feet, the banked stove, the talk going out, "Stop thinking", "It's loud", mint and ginseng, the house breathing, the lab coat on a peg, the board that announces you, the broom, the call between a hinge and a question, the husband's tablet, the fungus, the snoring neighbour, the rain, the door bar, the cup, the lamp, the dog, the cough.

## Output
Write `/tmp/p15/drafts-s2.txt`:
```
supper:4:7 | first paragraph ¶ more paragraphs, {yuki} if used
supper:4:7:y:cat | (only if {yuki} is used) cat
supper:4:7:y:great | great root-kin
supper:4:7:y:human | woman
supper:5:7 | …
village_night:quiet:7 | shared part with {yuki} in it
village_night:quiet:7:y:cat | the Yuki passage, cat
village_night:quiet:7:y:great | great root-kin
village_night:quiet:7:y:human | woman
```
then `# notes` as in common.md.
