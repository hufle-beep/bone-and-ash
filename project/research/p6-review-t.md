# P6 cold review T (texts), v0.11.233 (P6-A: TK + CWx), Opus

How: the diff, the briefs, the packet; renders in a scratch worktree (`/tmp/rv-t`, the five changed files copied in): talks at beats 5–10 and 11/14 × Mei Lin / Ya affection 0/80 each × rr/dw/ah, Ya away (ah, `bl_day` 4, 10:00); `village_night` third quiet night × 3 forms; `camp` night 2 with fire, with and without food, × 3 forms, and a real "Cook and eat" tap with the redraw after it; a `DR_MEI_FLIRT` result on a real `choose` (act-Coil 2, 4th flirt day). Planted faults: `p6-faults-review-t.json`, run with `node tools/mutate.mjs … --jobs 2 --cmd "node tests/story.test.mjs --games 2 --workers 1"` (11 min 25 s). Suggested lines: `node tools/packet.mjs --check`: 6 drafts, tic 0, run 0, time 0, 6 pairs (every pair is in words kept from Fable's lines).

## M1: Mei Lin's plain branches repeat one beat in 5 of the 6 texts, and one pairs with a flirt result into a contradiction
- **The six plain branches:** the quiet walk ("glances behind her in case somebody from Ashfall"), A ("looks about to see whether the forest means to tell her mother"), the glasses ("looks over her shoulder for whoever taught her not to"), the bow ("checks the way behind for anybody who might carry it home"), the limp ("looks all round her … for whichever aunt"). That is 5 of 6, where the old cycle had 2 of 3. All 6 contain a laugh. The new texts make the beat more common, which works against the push's own aim.
- **Cause:** `p6-brief-tk.md` asked Fable for "the plain branch … a laugh, a tease, a look round for Ashfall's disapproval".
- **Failure scenario:** a player with Mei Lin below 72 reads the beat on beats 5, 6, 8, 9 and 10 (five times in six talks), and again from 11 on. The Sociable bot talks to her 12–15 times.
- **One-screen contradiction (rendered):** the bow's plain branch, then Flirt in act-Coil 2 on the 4th flirt day, gives "…checks the way behind for anybody who might carry it home." → "Today she laughs without looking behind her first." `DR_MEI_FLIRT` set 1 #3 ("A look behind her to begin with, from habit") doubles the beat the same way.
- **Warm branches:** 4 of 6 end on a touch nobody mentions: "Neither of you remarks on it" / "Nobody seems to have told her sleeve" / "The matter goes unmentioned by both parties" / "You do not report it".
- **Suggested plain branches (checked):**
  - 3: "…Then she sees you blinking without them, and laughs, and does not apologise for it."
  - 4: "You bow to her at the money depth. She returns it at the depth for an elder, exactly, and spoils it by laughing into her sleeve."
  - 5: "You offer to carry her. She laughs so suddenly that she has to stop walking, and does the next stretch on her own two offended feet, limp forgotten."

## M2: the camp's night-2 line asks for a meal straight after the meal
- **Rendered:** `forest_day` 2, fire lit, 1 hare, tap "Cook and eat". The screen shows the result "Roast hare … *Mine first,* the bond observes … *Correct.*", then the hub text: "You have no food. Yuki has noticed, and is letting you know that she has noticed. … *Forty years of your dumplings … Cook whatever it is. I shall complain, and then I shall eat it all.*" The great root-kin's line ends "Cook accordingly." and the woman's says "Nobody out here to feed but me." Yuki makes three food remarks on one screen, just after she has eaten.
- **Why it repeats:** `camp` is a task hub, and task hubs never fold (`again.js` `noFold`). The line comes back in full every time the player returns to the hub that night (stakes, Yuki's time, a form change).
- **Reach:** "Cook and eat" is taken in 171 of 200 games (packet).
- **With no food all night,** the cat's "Cook whatever it is" follows "You have no food" directly.
- **Fix, two ways:**
  - Gate the quip on `foodCount(g) > 0`, so it shows before the meal only.
  - Or reword it to be meal-neutral: cat "*…I shall complain about whatever you find, and then I shall eat it all.*" (checked). The great and human lines would still need the gate.

## L1: the two women's talks on one day share an image
- **Same beat:** when the player talks to both every day, `talkBeat` gives both talks the same beat.
- **Beat 10:** Mei Lin (warm) "takes your arm … leans" and Ya (warm) "takes your forearm in both hands … keeps hold of the arm for the next hundred paces". Mei Lin also has "twenty more paces".
- **Beats 7 and 8:** Mei Lin's B is about the coat ("not to let it go grey"), and Ya's coat verdict comes the next day.
- **Across pools:** `DR_YA_OFF` set 2 #4 "She limps. Nothing is wrong with her foot" is the same joke as Mei Lin's limp text, and both run in act-Coil 2.

## L2: Ya's herb-girl lines read as if the spring scene hasn't happened
- **The lines:** "Do not tell her" and "She goes red from the neck up … I want to see where it starts" read as before the spring kiss (`trio_kiss`, trio 3: "She goes scarlet down to the collarbones").
- **When it shows:** beats 8–10 fall on later Blackroot days, often after that kiss.
- **Why low:** the old "She's coming round" has the same pattern, and Mei Lin "has still not said yes", so nothing is contradicted. Note only.

## L3: the Ya-away bow says the haze has nobody in it
- **The line:** "She glances at the haze, where there is at present nobody to set a worse example". The haze is where Ya went (`AW.talk_mei.open`; s2b "it may be Ya").
- **Suggestion (checked):** "She glances at the haze, which has taken the only person likely to set a worse example, and looks very nearly as if she misses her."
- **Checked clean:** Ya is named nowhere in Mei Lin's texts 5–10 while she is away.

## L4: places
- **The Drowned Wood** is "trunk to trunk, and wade where the trunks give out". The new texts use "the path" four times, "a rock" (Ya, who is barefoot by canon, kicks it), "Where the ground turns rough" and "paces".
- **Why low:** there is precedent (old B: "Where the path narrows").
- **No time words anywhere, 06:00–18:59.**

## L5: Claude's cuts
- **"verdict":** "has ruled" became "reached a verdict", which swaps one legal word for another (the v0.11.181 M4 family). "verdict" is in the game 11 times, 3 of them Yuki's. Suggestion: "Ya has an opinion of your coat, …" (checked).
- **"informs you":** 5 in the game, one of them Mei Lin's flirt result "She informs you, in her temple voice".
- **The other five cuts read fine.**
- **"tells her daughter":** Mei Lin is in the house on every route to the loft (the roof, the dishes, early to bed).

## Checked, no finding
- **The fold:** a talk has 2–3 paragraphs, so it folds to its first paragraph, not to its first sentence. The brief to Fable said "first sentence"; the result is harmless. Every first sentence stands alone anyway. The loft line is one paragraph and folds to "…nothing further to say tonight."
- **Labels:** every Ya text opens something (a verdict, a bet, a hunger), so "She started it" fits. Mei Lin's results fit both branches.
- **Canon:**
  - the glasses and the white coat;
  - "Of mushrooms": supper 2 covers it ("what a man does who studies mushrooms");
  - the bow depths match Old Wen's and the messenger's bows;
  - "I watched her hands" fits Ya's night counting (beat 4);
  - Mei Lin mending the coat is a new fact, not in `lore.md`. It is plausible, and Mei Lin's B prepares it.
- **No romance past a touch.**
- **CWx:**
  - The loft line joins its sentence ("…nothing further to say tonight. The house below does:").
  - The mother is grave.
  - "will be handed the ladle" reads right whether or not he has cooked yet (supper 3: "The mother has let you cook").
  - Three forms, bond in italics for the cat and the great root-kin, the woman aloud.
  - Throwaway length.

## Test gaps (planted: 0 of 10 caught)
- **TG-T1:** Claude's cuts are not pinned. T1–T4 put the four unpinned cuts back ("claps a hand over her mouth", "like a snare", "what she would do with", "The finger stays") and all were missed. textlint is log only, so `check.sh` misses them too.
- **TG-T2:** the away check is by name only. T5 ("the huntress bows to a rock" in the away version) was missed.
- **TG-T3:** the place list is narrow. T6 ("looks at the ridge") was missed.
- **TG-T4:** only the camp line's opening words are pinned. T7 (the great root-kin's bond line in quotes) was missed.
- **TG-T5:** the branch tests run at beat 8 only (Claude's F5: 9). T8 (Ya's herb-girl line at beat 10 on `likesYa` only) and T9 (Mei Lin's limp branch on Ya's affection) were missed.
- **TG-T6:** the camp line is not tested against the food state or the redraw after the meal. T10 ("Cook the hare." with no hare) was missed.
- **New checklist line (suggested):** *A cycle's branch formula (P6 T M1):* count the endings of every plain and warm branch across the whole cycle and the result pools drawn under it. A brief that prescribes a branch's beat makes every text end on it.
