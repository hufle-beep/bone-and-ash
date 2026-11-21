# P16-A cold review T (texts), v0.11.246

Reviewer T on Opus. I had not seen the build. I read the diff, the brief and the packets. Renders came from a scratch copy (`/tmp/rv-t`) using the P16-A block's `mk`/`tx`/`noteDay` approach, in three forms, with and without Ya, with and without the fire, at 10:00 and at 22:00. No planted faults were run: this part has no fault file of its own, and F1–F12 belong to the code reviewer. Counts: **H 0 · M 3 · L 11**.

## Medium

**M1: the hawks' third win says the hawks came for Yuki, in the great form too (BW).** K4 (v0.11.179) says the great root-kin is no prey: the label for that form is "Take the hawks.", and Ya says "looking somewhere else". The text with Ya, `hawks_won[2]`, has "the final one drops burning into the ash an arm's length short of Yuki, the closest any of them got" and then Ya: "They came for you. I only stabbed." The away version, `AW.hawks_won[2]`, opens "The hawks come for Yuki in ones and twos". Neither sentence goes through `byForm`. Failure: great form, story day 14, third win. The hunt screen just before says "Beside you, Yuki yawns up at them… The hawks climb a little. *Cowards*" (with Ya), or "*It is you they are measuring*" (Ya away). The next screen then has them going for her. Fix: put both sentences through `byForm`, so the great form's hawks went for James, or for whoever stood next to her.

**M2: the Ashen Hills' fifth night tells the ash fall twice and gives Mei Lin two different coverings (BF against `BL_AH_CAMP[4]`).** On the long calendar, the camp's night 5 and the fireside's text 5 land on the same night (both rendered for night 5, cooked, all four closeness states). The camp says "the ash … comes down on the camp, fine as flour. Mei Lin has tied a cloth over her nose and mouth and offered one to Ya, who wears hers round her wrist." The fireside opens "Ash comes down soft as snow…" and "Mei Lin has knotted a scarf over her hair; Ya has not". The `none` branch then has "Mei Lin has a second scarf and offers it to the circle… Ya takes it, sniffs it, and ties it to her spear", so the offer is made twice and Ya's first cloth is forgotten. Separately, fireside text 4 also has "fine as flour", one night before camp 5 uses it. Fix: write fireside 5's open as a continuation ("The ash is still coming down…"), make the scarf Mei Lin's cloth moved up, and have Ya do something with the cloth already on her wrist.

**M3: every new fireside is the same joke family, "Ya meets a civilised thing" (BF).** The four new texts are: writing (Ya can't read; RR 4), glasses (RR 5), a mirror (AH 4) and a coin (AH 5). Firesides 2 and 3 on the Root Road were leaves and chopsticks, so RR 2–5 is four nights in a row of it. AH 2–5 is "I have eaten blue", the tree's light, the mirror and the coin. The brief prescribed "Ya against civilisation" as the scene's beat. This is the checklist's "a brief's beat for one character lands in every text". Failure: a long-calendar player on the Root Road reads four consecutive evenings built on the same set-up. Fix: keep two of the four (writing and the coin are the strongest) and redraft the other two on Mei Lin's propriety slipping or on James.

## Low

- **L1 (FC, village):** this one is close to M. The screen before ends with Ashfall's attention on him: "everyone … reaching for you now", Old Wen looking at you, or in Act 1 "A hunter bows to you… You nod back". The next screen opens "nobody watches you walk". Then he goes up "as far as seems reasonable, then somewhat further" while "Ashfall is busy staring at the emptied sky". The sky they are watching is where he now is. FC-o holds because the text says so, but the scene's own logic works against it. Fix: keep him low ("no higher than the wall") or have a smoke or haze screen him.
- **L2 (FC, village):** "before anyone comes for water" also shows at night; the witness text has a night sky variant, so this hour can happen.
- **L3 (FC, party at night):** `BT_PARTY.night` says "A few steps off, Mei Lin has not moved." The next screen's close says "Mei Lin has not moved." again.
- **L4 (FC):** the label "Back to earth" has no full stop, unlike "Get up." and "Back to the ridge.". All four closes have already landed him ("drift down to them", "You settle onto the earth"), so the label repeats what the text did.
- **L5 (BYb-t):** "The lightning overhead is keeping to one spot" comes one sentence after "Lightning walks about inside them, looking."
- **L6 (NF6, night 20):** "the sky keeps to it after the dark has come: the purple of a bruise going yellow at the rim" reads as afterglow in a forest with no dusk. "You call them stars because nobody is here to object" and "in case they are not stars" hedge a word that nights 1–3 and the breakthrough's sky line use plainly ("drink the stars").
- **L7 (NF6, repeated beats across the 21):** night 19's "You hold a doctorate in precisely this", with a watch-thread drafting a description "sight unseen", repeats night 13's "You are a mycologist", with a thread working on a twelfth way "with no samples and no bench". Night 17, water as the one thing moving with a thread taking a bearing on the stream, repeats night 12, "Quiet has a sound here, and it is the water", with a thread listening to the stream.
- **L8 (AH, `AW.hunt15[1]`, great form):** "Yuki, at your side, would not fit in six of those feet." Only the cat branch mentions the hawk's foot ("one foot"), so in the great branch "those feet" points at nothing.
- **L9 (AH, second stay):** "They know the cat by now… They like her", "*They used to keep their distance*" and "taking their usual places" assume the same three hawks as day 14. Every win text kills all three ("the final one"). This follows an older pattern ("The cinder hawks are back", "Three again"), and Ya's "Kill all and nobody remembers" half covers it, but v0.11.230 H1 applies: familiar habits are fine, familiar animals are not.
- **L10 (BF, RR 5):** "Everything is closer and worse" fits plus lenses, but "a soft brown blur" at fire distance makes James short-sighted, and minus lenses make things smaller. In the human branch Yuki says "She has them on upside down. I won't.", so she says "I won't" after already telling him. "I won't fix it" would read better.
- **L11 (AH, `AW.hunt[2]`):** "The other choice keeps to the gullies" talks about the menu, not the place; every other hunt text closes on the hares themselves.

## Checked, no finding
The rest checked clean:
- The six forest nights in 3 forms × fire on/off: each has three paragraphs, the dark arriving with no dusk word, nobody met, and each fold paragraph stands alone.
- The four `first_flight` places, rendered at 10:00 and 22:00 with the breakthrough screen above them: Yuki is the cat, nobody local flies, and the Golden Core lines match lore.md (flight, line 84).
- The kept dawns: the prologue's and Act 1's both name the flight, and Act 1 no longer has "lost the road".
- Old Wen's branch agrees with his lesson ("each rung costs more than the last").
- CF names the rung once.
- BH and the elk and serpent texts: Ya is crude, Mei Lin is dry, James is deadpan, and each hunt text keeps the fowl or hares that its other choice needs.
- The tic list: no hits in the added lines.
- The `byForm` lines in the firesides fit each form, and the human form speaks aloud.

Outside this push's scope: `coil_dawn`'s unchanged Yuki line ("on your sternum", "on the windowsill") sits next to the kept-realm paragraph and may meet a great form. Not checked further.

## Test gaps
- **TG-T1:** BW's form test checks only the human form's quote and that no woman is named. Nothing stops the great form's third win saying the hawks came for her (M1). Pin it: great form, `hawks_won[2]` and `AW.hawks_won[2]` must not match `/came for you|come for Yuki|short of Yuki/`.
- **TG-T2:** nothing renders camp *n* and fireside *n* on the same night for repeated props (M2). Add a long-calendar walk of the Ashen Hills' nights 4–5 that reads `bl_camp` and then `bl_fireside`, and flag a second ash-fall opening or a second cloth offer.
- **TG-T3:** FC renders `first_flight` on its own, only at 10:00 (L2, L3). Add 22:00 renders for the village and the party, read with the breakthrough screen above, and a ban on repeated sentences across the two screens.
- **TG-T4:** the `first_flight` choice label isn't covered by the label-punctuation checks, if those exist (L4).
- **TG-T5:** no lint flags a demonstrative ("those", "that one") inside a `byForm` branch whose antecedent appears only in another branch (L8). This could be a cheap `packet.mjs --check` rule.
