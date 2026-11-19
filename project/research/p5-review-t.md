# Cold review T (texts), v0.11.232 (P5-B + D1, CW)

Read: the diff, the packet, the checklists; renders in a scratch worktree (`/tmp/rv-t`), real paths by `goTo`/`choose`: the Root Road and Ashen Hills camps 6 nights each (Cook and eat, then the fire; `both` and `ya`), the village evenings (day 4 ×3, day 5 ×4: walk → supper → roof → its line after → loft), the Fallout texts and labels by day, Root Road's fire in cat r0 / tiger r2 / human r7. Six planted faults, 0 caught (TG-T1).

## Medium
- **M1 One meal told twice, back to back (Root Road).** All-cook path, night 2: the camp's reply `DR_COOK[1]` "Ya sits right by the pot tonight… Mei Lin asks what you did with the herbs" → the fire's `FS_RR` text 2 "Ya will not touch it until she has watched you eat… 'wood sorrel and mountain pepper,' says Mei Lin, who picked both" → "tries a mouthful as one tries the ice on a river" (a first taste). Night 1's reply already had "Ya empties hers". Measured: text 2 shows on Root Road nights 2 and 5, each straight after a cook reply where Ya has already eaten eagerly. Fix: open, options later (text 2 as a nightly habit, or the reply left out on fire nights).
- **M2 The funeral-cook joke twice.** AH text 2's close "If I die in there… the scholar cooks at the burning" is `DR_COOK[3]` ("Ya says you are to cook at her funeral. Mei Lin says funerals don't work like that"). Measured: the 4th cook (Root Road night 4) shows it, so every all-cook player reads it before the Ashen Hills. Suggestion S4.
- **M3 AH text 3, `both`, contradicts itself.** "Mei Lin is nodding where she sits… Ya has stopped talking so as not to wake her", then Ya asks "Scholar. What does a tree that size eat?" and "Mei Lin answers for you." Claude's cut (Fable's "fallen asleep sitting up" → "nodding") softened this but did not fix it. Suggestion S3.
- **M4 CW supper: an insert before a pronoun (checklist v0.11.190 M1).** The insert ends "He will come at dusk." (the dyer's boy). The next paragraph, '"He knows which ones glow, too," says Mei Lin. "He told me."', now reads as the boy. "He will come at dusk" is said at supper (the scene moves the clock to 19:00, after the sunset walk). After Claude's cut ("would cook again" → "whether it is true the foreigner cooks") it no longer says what he comes for. Suggestion S1.
- **M5 CW walk: assumes he has cooked for the house since he came.** Rendered on village day 5: evening 2's walk has "Say ginger. You have put it in everything since you came, and the house has never smelt so much like somebody lived in it." Evening 3's supper (old text 3) has "The mother has let you cook… which Mei Lin says has never happened to anyone." Only supper:4's text 2 (cutting greens under her eye) comes earlier, and only for a player who ate two suppers on day 4. On the every-evening path, evening 2 also stacks four cooking beats: walk ginger → the dyer's boy → roof 2:2 "Cook. Far too much…" → its line after (the soup, a shopping list). Those are the owner's "throwaway" remarks, all on one evening. Suggestion S2.
- **M6 The roof's arm-music beat now comes before its old text.** Roof 1:3 (day 4, the 3rd and 6th roof) has "Your forearm is playing strings, very low… 'Sad… Is all of your music sad?'". Day 5's first roof (the old text) then retells it: "Your forearm has been playing something slow and sad, very low, all evening. 'Leave it'". Measured: rendered on adjacent evenings (day 4 evening 3 → day 5 evening 1) for a player who took the roof 3 or 6 times in day 4's week; otherwise a few evenings apart. Suggestion S5 keeps the old text's sad music new.

## Low
- **L1 Head counts in the human form.** Mei 10:2 has "So I am packing for three", and AH 2 `none` has "Each of you has found a thing to tend: Mei Lin…, Ya…, you…". With Yuki human (realm 7, a later Coil) the party is four, and the game counts "the four of you" by form.
- **L2 Image habits.** Count words: 12 in 9 of the 18 new texts. Ya counts in four of them (fo_ya 10:3, RR 3, AH 3 `mei`, AH 3 `none`) right after her own "I never count anything". "Ladder"/"rungs" appear in 3 of the 4 new lines after the roof, and in both old ones.
- **L3 `loft_burned`.** After `arson_lost` (day 5's last night) the later nights' lines after the roof still send James "up into the loft… on the ginseng" (2:3) and "reach the loft" (2:2). The old line and `village_night` have the same gap already; the new lines add two more.
- **L4 Ya 9:2.** "He's about eighty" in a village where "sixty is Heaven being kind" (Old Wen). The chaff is in the text and again in the result after ("puts you in the chaff"). "Throw her." answers "Put me off it" only loosely.
- **L5 Ya 10:3** "high in the dead pine" + "Climb up and sit with her" → "She leans her shoulder into yours": it works, but on a branch.
- **L6 Cooking with no meal.** AH 2 "your stew", AH 3 "since the stew", RR 2 "Tonight's pot" and RR 3 "you cooked it" show even when Cook and eat was not taken (it needs food). The old Root Road text has the same assumption.
- **L7 Who knows.** Roof 1:2 quotes Old Wen on day 4, where meeting him is optional; it reads as village talk. Roof 2:3's "mute cousin" plan is never picked up at the tribute (Lu Han's gaze "stops at you"); it reads as Mei Lin's joke.

## Checked, fine
- Place lines: fo_mei day 9 on the herb slopes, days 8 and 10 at the doorstep, yard or step. Claude's cuts fixed the well and the eaves.
- Ya's day 9: "Out into the village" is hidden until `ya_met`, so every visit comes after her arrival. The plan is forced on day 10's first morning, so the expedition is known in 10:2 and 10:3. The cut "sect robes" → "an Elder" (9:3) is right.
- All 10 new labels fit their texts.
- The bond is in italics for the cat and the great root-kin (three forms rendered).
- The Ashen Hills choices by state: `both` has [3] and Sleep; `ya` has [3], [5] and Sleep.
- Old calendar: one Root Road and one Ashen Hills camp (by their gates), so `byDay` shows only the old text there.
- The mother does not praise outright.

## Test gaps
- **TG-T1 Text pins check the first words only.** 6 planted faults (`p5-faults-review-t.json`, `story.test --quick`, 10 min 46 s, jobs 1), 0 caught:
  - T1: "yesterday" put into Ya 10:2.
  - T2: Claude's 9:3 cut reverted.
  - T3: Lu Han in place of Old Wen on the roof.
  - T4: the mother praising outright.
  - T5: "all morning" at the fire.
  - T6: the cat speaking aloud after the pinned words.

  The fix: a hash of each new text by form, and the cuts pinned (v0.11.185 TG1).
- **TG-T2 The time-word guard is narrow.** It covers only fo_* texts 2–3 and only "tomorrow / last day / today". It misses "yesterday / this morning / tonight / all morning", the roof, the fire and the CW texts.
- **TG-T3 No walk of the real order.** Nothing walks Cook and eat before the fire (M1, M2), or walk → supper → roof with the replies read (M4–M6).
- **TG-T4 The CW lines have no pin beyond their first words.** The owner's fixed words (the mother never praises, a throwaway) are not pinned.
- **TG-T5 Human-form head counts are not tested (L1).**

## Suggestions (`packet.mjs --check`: 7 drafts, 0 tics, 0 runs, 12 pair notes, all names)
- S1 supper:5 text 2: take the insert out after "a trade." and put this after Mei Lin's paragraph: Her mother lets the millet have the silence for a while. "The dyer's boy came to the gate asking whether it is true the foreigner cooks," she says then. "I said this house does not discuss its kitchen."
- S2 mei_walk:5 text 2: "Say ginger. You look at my mother's ginger jar the way other men look at a horse they cannot afford."
- S3 AH 3 `both`: Mei Lin sits propped between you and Ya like a scroll between bookends, her eyes half shut. Ya has dropped her voice for her, and looks astonished at herself.
- S4 AH 2 close: "After the tree," says Ya, "the scholar cooks for a whole day." ¶ "We have not brought a whole day of food," says Mei Lin. ¶ "Then he cooks slowly."
- S5 roof 1:3: "very low" → "very quietly"; "Sad," … "Is all of your music sad?" → "Cheerful," she says at the end, with suspicion. "Is all of your music cheerful?" (the rest as it is).
