# Label pass, FR: the full read (brief for a fresh Opus reader)

You read every choice label of the game "Bone and Ash" (a text game, prologue + Act 1) against the text above it. You have not seen any build; you only read. Do not edit anything, do not run the game.

## Read
1. `/tmp/lp/lean.txt` (106 KB; read it all, in line ranges). Each block: `scene_id: …<the last 220 characters of the scene's text>` then its labels, one per `> ` line (dynamic labels appear once per variant drawn on sample states, so a label may show 2–3 versions).
2. `/home/claude/bone-and-ash/project/canon-card.md` (tone, canon, the tic list).
3. `/home/claude/bone-and-ash/project/review-checklist.md`, sections "Canon", "Continuity" (especially "Labels against texts") and "Text quality".
Where a label is unclear from 220 characters, you may grep the story files in `/home/claude/bone-and-ash/js/story/` for the scene id or the label and read **only a few lines around it** (never whole files).

## Look for, in order
- **F (fault):** a label that contradicts the text above it, the canon card, the form Yuki can be in (cat / great root-kin / human), the day or the place; a label that promises what the scene can't deliver; wrong pronouns; a label that names someone not there.
- **T (tic):** the canon card's tic list, or the same 2–3 words repeated across labels of one scene or neighbouring scenes.
- **P (polish):** tone off (James and Yuki deadpan; locals overly serious; Mei Lin looser), clumsy or overlong labels, two labels on one screen that read alike.

## Already known, skip these 16 (do not report)
`lf_hub` "Wash in the river. You have been in a forest for a long time." and "(Advances the story: you will meet Mei Lin.)"; `lf_wanderers` "Let them make their speech…" / "Talk your way past them…" (them for Fang Wei); `ah_hunt` "Take the hawks before they take Yuki."; `night_won` / `night_fled` "Sleep."; `mei_lin` "everyone here tastes like a funeral"; `wild_train` "a very unwilling sparring partner"; `rt_elder` "for the first time in three hundred years"; `gao_dead` dashes; `evening` "Flirt back."; `boar_won` / `boar_lost` "Evening."; the two "Bite the tail. (The Coil: …)"; `rt_ya_village` "the way Ashfall likes it"; `yuki_form` "Human. Someone to talk to."; `yuki_human_after` "Promise.".

## Report (your whole answer; at most about 8 KB)
One line per find, most severe first:
`F|T|P · scene_id · "the label as shown" · what is wrong (one sentence, naming the words in the text above that it clashes with)`
Then one line: how many labels you read and how many finds per class. Do not write replacement wordings (a writer does that); a direction in three words is fine. Report only what you are confident about; "fits" needs no line.
