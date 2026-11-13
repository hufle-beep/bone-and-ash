# Notes, task A: prologue.js, `arrival` to `gao_spared` (plus the listed lines 49–104)

All edits are exact string replacements inside string/template literals in /tmp/claude-0/rw-p1/js/story/prologue.js. Nothing from `mei_lin` (line 510) on was touched. No ids, flags, labels, titles, places, `${...}` expressions, conditions or numbers changed. The one code addition is rider 5's two `byNight(g, [...])` calls in `camp`. General: the older lines' em-dash asides became commas, colons or brackets, to match the newer lines' punctuation.

## Per scene

- **jackals intro (49):** tighter image ("come loose from the dark", "coals nobody remembered to put out"); both variants kept parallel.
- **gaoFight intro (62):** active verbs; same beats (sleeve, red Qi, lackey, hatchet).
- **collectorsFight intro (82):** militia variant re-paced so the kneeling lands last; plain variant now "No mortal has ever given him a reason to" (rider 6: he reads James as a mortal, and the realm gap is absolute).
- **cookMeal (91):** "Roast hare: +35 satiety" kept; the bracket joke reworded.
- **Item notes (98–104):** all seven reworded, same joke each; item names untouched.
- **arrival:** rider 2 placed (glasses; the ouroboros on the left forearm, over the omnitool). Lore-quoted phrases kept ("just check one reading", "decided to have opinions", "the most expensive empty closet in two universes"). Line 126 not listed, untouched.
- **yuki_check:** both branches reworded with the same facts (12/66, same day, same grove, the ash, "sessions, plural"); "mirrored … like a reflection" de-duplicated in rhythm; all nested `${}` kept.
- **scan_ok / scan_bad:** tightened; "No anyone" → "Nobody"; line 163 (not listed) untouched.
- **clearing:** tic "for a moment" removed. **Continuity fix:** the `bone_ok` variant said the needle "is still in your fingers", but `first_bone` flicks it into a tree and `first_bone_fail` has it crumble; now "Your palm is still warm where the bone came through", true on both paths.
- **first_bone:** rider 2's second and last placement (the tree-and-raven tattoo on the right forearm, seen as the needle comes out). Lore-quoted "from nowhere, from the folded place where Bonesinger and Qi meet" kept.
- **first_bone_fail:** tightened; "the way it always has" → "as it always has".
- **meditate1:** first paragraph left as it was (three short sentences, already right, and it is the fold paragraph); the other two re-paced.
- **stream:** reworded; the amber/sun variants keep their meaning; the drink-fail result keeps "−2 HP" and drops "files a complaint" (used in wilds.js and meridians.js).
- **forage:** intro re-paced, the "planet with a grudge" callback kept; the berry results keep "+6 Crimson needleberries", "+8 satiety", "−3 HP". Lines 251, 253 not listed, untouched.
- **hunt / hunt_miss / hunt_got:** reworded; "formal complaint" replaced (same reuse); "In my defence … made of glass" kept word for word.
- **camp (rider 5):** "The fire crackles." and the stakes line are now `byNight` triples (night 1 / 2 / 3). Night 3's stakes line mentions tracks along the outside of the ring that stop there (fits the cast note that the circling tracks are Ya's, and the `night` scene's circling walker). Fire-fail and raw-hare results reworded around their numbers.
- **night_attack:** reworded. **Continuity fix:** "Two shapes" → "Shapes", since the encounter has three jackals when forestScale ≥ 2 (its intro says "Three shapes").
- **jackals_won (rider 4):** "two grey bodies" → "the grey bodies" (same reason); "your threads suggest" → "supply" (threads are instincts, not a voice); the last paragraph now ends on a short, thin remainder of the night, so the scene no longer leans toward a full night's rest.
- **jackals_lost:** enter result and the hesitate paragraph reworded; "HP partly back, Qi full" kept.
- **dawn:** reworded; `${foodCount…}` kept.
- **herb_girl:** rider 1 placed (white jacket, red sash, long dark skirt, red ribbon in black hair). Rider 6: "a few rungs past your own" → "one clear rung above a mortal" (Foundation without James knowing the word yet, and no longer wrong if James has broken through in the long forest). Gao Feng's speeches kept grave, slightly more formal. Lines 395, 401 not listed, untouched.
- **gao_hand:** tightened; line 416 untouched.
- **gao_talked:** rider 6: he announces himself as "*Gao Feng of the Foundation, Outer Disciple of the Crimson Lotus Sect*". "Put it on my tab" kept.
- **gao_won:** reworded; the result line drops the tic "a long time".
- **gao_lost:** one line (470) touched; 472/474 left word for word (the exchange is already exact).
- **gao_dead:** tics removed ("a very long time", "a long moment"); rider 6 and 3: "The Foundation feels every vessel beneath it. I would feel you." All beats, the pouch, the token and Mei Lin's "the dead keep quiet / the shamed never do" kept.
- **gao_spared:** tic "a long moment" removed; same four beats.

## Rider 2: what is not placed
Hair (short pale blond) and beard are not in my scenes: two placements was the cap, and both went to things James would look at himself (glasses and left forearm in `arrival`, right forearm in `first_bone`). A natural later place: Mei Lin's first close look at him in `mei_lin` (task B).

## Label suggestions (labels NOT changed)
- `jackals_won`: "Sleep. Properly, this time." → "Sleep, what's left of it." Reason: rider 4, the choice gives back only half of what was lost (`nightRest`), so "properly" promises too much.
- `camp`: "Night falls. Settle in." is fine; no change.
- `stream`: "Keep walking downstream until dark." is fine with the night rules (it leads to camp, not through the night).
- `gao_dead`: "Go with her. Behind you, Gao Feng is still swearing — slowly, and in great detail — what his Sect will do to you." → "Go with her. Behind you Gao Feng is still swearing, slowly and in detail, what his Sect will do to you." Reason: reads cleaner; only a punctuation change.

## Titles and places
Listed lines 123, 191, 204, 214, 228, 344, 354, 442, 451, 464, 480 are title lines. Left as they are (tests or saves may show or match them, and they are good). No suggestions.

## Continuity problems found and NOT fixed
- **Lines 113–114, `yukiMerElder` / `yukiMerLu` (rider 3):** the Elder and Lu Han sense Yuki's meridians and Qi ("has twelve meridians open", "holds Qi with its meridians shut"). That contradicts rider 3 (locals can't sense Yuki either). Outside my line list and used in task B's scenes; left alone so two writers don't edit the same lines.
- **Line 358, `jackals_lost`:** "they take the hare and leave" even when James carried no hare (the enter only deletes `hare_raw` if present). Kept as a stated beat.
- **Line 332, `night_attack`:** "You have never seen one" is untrue from Coil 2 on (James and Yuki remember every Coil). Kept; would need a Coil variant (code).
- **Line 346, `jackals_won`:** "She isn't one. Neither are you" (first fight ever), same Coil caveat.
- **Line 145, `yuki_check`:** "Mortal Vessel, the pair of you" is a fixed statement; true at every Coil's start as the realm resets, fine unless the scene can be reached later.
- **Line 393, `herb_girl`:** "The tribute is due tomorrow" on Day 2, while lore.md has the tribute on Day 7. Not checked against the game's calendar; flagged only.
- **Line 496, `gao_dead`:** the text has a pouch of "rough grey pills"; the result gives "+1 Murky beast core (from Gao Feng's pouch)". Mechanical line, kept.
- **Line 401, `herb_girl`** (not listed): the text lint flags the tic "slide off" ×3 there (it did before this pass too).
- **Line 436, `gao_fight_start`** (not listed): contains "the first time", a listed tic.
- **Line 447, `gao_fled`** (not listed): "for a long time", a listed tic.

## Checks run
- `node --check js/story/prologue.js`: ok.
- `bash tools/check.sh quick` in the worktree (with task B's edits in the same file at that moment): 322 passed, 2 failed, both the text-lint snapshot test in the tools suite (E1 "the snapshot current", and LR): `tools/text-baseline.json` is stale because the text changed, which is expected for a rewrite and is Claude's to refresh. Text lint itself: 0 broken, 3 unrendered (the same three as on the original: night_event, far_hunt, bl_night_event), reused passages 68 → 67, favourite phrases 39 → 38. One note to look at: "pool replies sceneShared 7 → 8" (a reply line now shares a 5-word run with a scene; could be from either task).
- A 5-word-run check of my new lines against all of js/: four hits found and reworded; none left in lines 1–509.
