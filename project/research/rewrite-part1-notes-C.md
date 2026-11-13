# Notes, Task C (rewrite part 1): yuki_path.js, coil_scenes.js, meridians.js, again.js

Edited only the four files under /tmp/claude-0/rw-p1/js/story/. Every changed line is on its `.lines` list (checked with `git diff -U0`
against the lists: nothing changed off-list). Every `${...}` expression is kept (the only one whose inside changed is the prose of the
`step === 2 ? '…' : '…'` pair on meridians 97). No ids, flags, labels, titles, byForm counts, conditions or numbers touched.

## Checks run (on an isolated copy of the original repo + my four files, because prologue.js in the shared worktree is mid-edit by Tasks A/B)
- `bash tools/check.sh quick`: everything passes except one assertion in the tools step:
  - `tests/tools.test.mjs` 780 pins `memory 24 lines`; the pool is now 48 (the MX task). **Claude: update to 48.**
  - `tools/text-baseline.json` must be re-saved (`node tools/textlint.mjs --save`) or "E1: the snapshot current" fails; with it saved, E1 and the "template leftover" test pass.
- `node tests/story.test.mjs` 4,606,651 passed, 0 failed; `node tests/tasks.test.mjs` 665,854 passed, 0 failed.
- Text lint (log only), with my files alone: prologue+shared reused passages 13 → 6, tics 6 → 5; return reused 6 → 3; all shared chunks 336 → 306;
  memory pool 48 lines / 688 words, twice 0, shared with a scene 0, tics 0.
- My own scan: no new five-word run shared with any other js/story or js/core file; none of the brief's tics in any new line.

## Phrases the tests pin (kept word for word; a rewrite of these needs the test changed in the same push)
| Where | Pinned text | Test |
|---|---|---|
| coil_scenes 115 | `You fold up where you stand` | tasks.test 313 |
| coil_scenes 99 | `seen this sky ${times}` ("seen this sky before") | tasks.test 1603 |
| yuki_path 155 | `Forty years of her sleeping` | tasks.test 3945 |
| yuki_path 456 | `*She's pretty,* says the bond, appallingly loud inside your skull.` | story.test 1750 |
| yuki_path 457 | `*She's pretty,* says the bond, appraising, unbothered. *I approve` | story.test 1751 |
| yuki_path 462 | `Through the bond, sleepy and amused from the stove downstairs` | story.test 1768, 1891 |
| meridians 206 | `like doors painted on a wall`, `open them at Golden Core. Not before`, `N of the Extraordinary vessels are still sealed` | tasks.test 4100, 4101, 4107 |
| meridians 207, 208, 210 | `wait for Golden Core`, `between Golden Core and Soul Embryo`, `within reach` | tasks.test 4107 |
| meridians 97 | `Two fine` after the pair; `A fine, bright thread` after the single | tasks.test 4139, 4144 |
| meridians 200, 83 | `Too hungry to sit` | tasks.test 432, 3295 |
| meridians 233 | the two inner sentences of `ns_warn` ("… are still closed", "They open between Golden Core and Soul Embryo") | tasks.test 3959, 3961, 4111 |
| meridians 88 | `Two Qi and N minutes into the ash around` (replies.js GAIN_LINES) | replies.js 24 |

**Left as they were for that reason (listed lines not rewritten):** yuki_path 456, 457, 462 (fully pinned at the start; 456 and 457 also
have word-for-word twins on 452 and 454, newer lines, so a rewrite would split the cat's line from the human's). My proposed texts,
if the tests are opened:
- 456: `*Pretty,* says the bond, at a volume that rattles your skull. *And bossy. You like bossy. Do not argue, I have met your thesis supervisor. Speak to her. SPEAK to her.*`
- 457: `*Pretty,* says the bond, in the tone of a buyer at a market, quite untroubled. *Approved. Her, that is. Not whatever your face is doing.*`
- 462: I would keep it; "Much later." is already the best line in it.

Also untouched on the lists because they are not prose or must stay exact: titles (yuki_path 139, 154, 177; coil 53, 86, 128; meridians 193, 230),
choice labels (yuki_path 227, 261, 300, 346, 489; coil 78, 142, 146, 152, 158; meridians 187, 221–223, 226, 237, 238, 254, 255), the names
and sizes (meridians 38–45, 129, 131), code-only lines (meridians 52, 77, 90, 93, 101; coil 88), mechanical lines (meridians 83, 88, 189, 204, 262;
"Slept until 06:00. HP and Qi full." on yuki_path 300).

## coil_scenes.js, per scene
- `WHY.collapse` (12–14): tighter; the cup image kept (WHY.clear, not on my list, answers it: "not a hand catching a cup"); the loop "was not consulted, and disagrees".
- `WHY.tribute` (15–17): the silence now has "rank and posture" (locals grave); "its own kind of verdict" made concrete. Last sentence kept.
- `WHY.beast` (18–22): three beats for the opening; "it has you down as meat"; the eight-hundred-year fact kept. Cup image kept, varied from collapse.
- `WHY.shen` (23–25): "a guest in every word they use" (rt_taken's *Guest*); no longer repeats tribute's "silence so formal" or its closing sentence.
  **"down the mountain" taken out** (see continuity 1).
- `WHY.choice` (29–31): same two beats, drier.
- `coil_end` line 70: "Expect to hear it quoted."
- `coil_dawn` unwound (91): the pulled tooth kept, made exact ("as a tongue finds a pulled tooth").
- `coil_dawn` Act 1 (92–98): forty chimneys kept; the rooster "announcing a day it believes to be new"; Mei Lin "and winning".
  **Yuki's look changed** from "Try not to get taken this time" to "My remarks on the last one will keep until breakfast" (continuity 2).
- `coil_dawn` prologue (99–105): arrival's black bark / grey moss / bruise and "I did not touch anything" kept as echoes; "By now it is a greeting."
- death hook (115): result line, form-neutral as before, no stat words (the splitter keeps it a reply).
- `a1_again` (129–133): tic "the way endings do" removed; Yuki's "*Again?*" replaced (it sat one word from a memory line: "*Again?* says the bond").
- arrival skip (161): "You take the opening as read"; no longer shares "You skip the parts you know by heart" with prologue.js 1034.

## meridians.js, per block
- `PRIMARIES` (23–34): each line rewritten, path facts and names kept; tic "for the first time" out of the Lung line; the Axiom no longer "files"
  (three things filed notes in this file); the Liver line ends "Nobody has to tell you."
- result lines 97, 104: the threads; the test-pinned openings kept.
- `EXTRA8` (115–122): tic "for a moment" out of Yang Linking; "server rack" replaced by "behind the lab bench" (his people grow their tech; a rack read as our world).
- `JUNCTIONS` (136–145): rewritten; Sea-of-Qi carries a touch of rider 6 ("the dantian, which this whole world reveres").
- the screen (197–212): the two openings; "broken circuit" for "open circuit" (on a screen about opening channels "open" read the wrong way);
  209 / 211 no longer end on the same two sentences; **212 form-safe**: "Yuki settles against you" for "curls against your hip" (she can be the great root-kin or a woman here).
- `ns_warn` (231–235): rider 6: "Nascent Soul, a realm this world keeps in its stories" (the sheet: almost unprecedented). Yuki's line loses "I'm a cat" (also in a memory line), keeps the curtains.
- `col_warn` (246–252): its opening and Parallel Cognition's gesture now differ from `ns_warn`'s (they shared two openings). The numbers sentence untouched.

## yuki_path.js, per scene
- `yk_sister` (140–150): tics "the way a cat" and "exactly the way she did" out; wording moved away from `YK_HERE.sister` (the newer twin), which had been
  rewritten from this one; the three rules, forty / lonely / lab coat / "I will be supervising" kept. Lines 142 and 148 (not listed) still fit ("blanket", "rule … threat").
- `yk_lover` (155–171): same beats (warm hand, "Oh", round the fire on her knees, the notes, the dress, the fire, dawn, "best spot"); moved away from `YK_HERE.lover`;
  "like a question" → "asking". Fades where it did.
- `yk_camp` (184–194, 223): night 1 and 2 lines; tic "for a long time" out ("takes her time not saying it"); the morning (223): Mei Lin laughs, claps a hand
  over her mouth **and looks round to see who heard** (her voice rule); "heads together" → "deep in conference", which also reads for the small cat.
- `yk_sister_talk` (237–249): the human versions of talks 1–3; facts kept (chopsticks, three days, the wolf's tooth, four out of ten, spore prints, a two, insulting Ya).
  They no longer match `SIS_TALK_BOND` word for word; same content.
- `yk_night_solo` (270–276): **rider 3**: "He will look at me and see nothing worth a second glance" (Shen Qiu can't sense her; true in all three forms). The wolf kept.
- `yk_night_mei` (291–299): tic "for a long moment" out; Mei Lin "checks the ladder for listeners" after the laugh; Parallel Cognition's nine complaints "overruled on all nine".
- `yk_night_ya` (311–315): Ya blunter ("The good wrong."); "mostly furniture" kept.
- `yk_night_all` (331–341): tic "for the first time in your life" out; **333 fixed**: "I have spoken to her for a week," said *to* Mei Lin, now "You and I have talked for a week" (continuity 3).

Riders: 2 placed once, in a memory line (the forearm serpent); 3 in `yk_night_solo`; 4 nothing in my lines promises a night (the "Slept until 06:00. HP and Qi full."
lines are the last night of Act 1, no fight); 6 in `ns_warn` and the Sea-of-Qi junction. Locals sense nothing in any of my lines (Ya smells Yuki, which is a nose, not a realm).

## again.js (MX)
24 lines appended to `MEMORY_LINES`; the first 24 untouched. All 20 words or fewer. 6 involve Yuki (all through the bond, her tail or her silence: any form),
2 Parallel Cognition. One carries rider 2 (the ouroboros on the left forearm). None uses the tic "the first time" (one of the old 24 does).

## Label suggestions (not changed)
- coil_scenes 80 `Accept it. Get up.` / 81 `Accept it. Walk.` → fine. 146 `Bite the tail. (The Coil: wake at the start of Act 1 or of the whole game, keep what you learned.)` →
  `Bite the tail. (Wake at the start of Act 1 or of the whole game; you keep what you learned.)`: "The Coil:" inside the bracket repeats the screen's title.
- yuki_path 151 `Sleep. Tomorrow, the smoke.` and 172 `Let her sleep. Tomorrow, the smoke.` → fine.
- yuki_path 300 `A few hours. Then the Elder.` / 346 `A few more hours. Then the Elder.` → `Sleep. Then the Elder.`: the result says "Slept until 06:00. HP and Qi full.", so "a few hours" undersells a full rest (rider 4's family).
- meridians 226 `Open your eyes.` → fine.

## Continuity problems found, not fixed (or fixed only in my lines)
1. **Which way is the Sect?** `WHY.shen` said "the road down the mountain" (as rt_taken: "You go down the road"), `WHY.clear` (coil 26, not listed) says "Shen Qiu is somewhere down the mountain",
   but `a1_again` 131 (inside a `${}` string I may not touch) says "the road up the mountain". I made `WHY.shen` neutral ("take the road"). 131's string needs a pick.
2. **coil_dawn, Act 1 (98):** "Try not to get taken this time" showed after every Act 1 rewind, also after a won act, a collapse or a beast. Now neutral. If the owner wants
   the old line back, it needs a condition on the Coil's reason (code).
3. **yk_night_all 333:** "I have spoken to her for a week," said to Mei Lin about Mei Lin. Fixed in the prose.
4. **yk_night_all 339:** "Liar," say Ya and Yuki, answering "if my mother hears one sound—". It reads as if a line is missing (Mei Lin claims nothing they could call a lie). Kept; a pick for later.
5. **Bladder meridian (29):** "It takes the full two hours": a sitting is at most two hours, but this channel takes about 3.1 h (`priHours(6)`). Number kept as told; the wording is still loose.
6. **Parallel Cognition speaks** in `ns_warn` and `col_warn` (italics, "*Footnote,* it adds", line 250 not listed); lore.md says the threads are "instincts, never a voice". Kept as it was.
7. **yk_camp 223** (Mei Lin count 2) has no byForm: Ya says "Your cat" and Yuki walks "side by side" with Mei Lin in every form. Reads well enough for all three now; a byForm would be code.
8. **all nine threads** (yk_night_all 341, the Brow junction): the lore has the threads waking one per bite of the tail; "nine" is said regardless of how many are awake. Kept.
9. yuki_path 452 / 454 (newer, human form) repeat 456 / 457 word for word; any later rewrite should do the four together, with story.test 1750–1751.
