# P21-E cold review T (texts), v0.11.251

Read: the diff, the packet, `tribute_texts.js`, the stomp collectors block, `act1_fallout.js` and `act1_return.js` (by grep). Rendered in `/tmp/rv-t`, on the long calendar, in every form: the fight's opening by degree (Gao in, Gao broken), the one-move finish, a failed bluff and a failed pin after a degree-2 win. `textlint`: nothing in these texts. Tics: none.

## High
**H1 Act 1 still treats the bluff and the pin as endings with no fight.** MT puts both after a fight Lu Han has lost, but Act 1 still keys on `ending === 'fought'`. Five places get it wrong:
- `luHanHere` / `luHere` (`act1_return.js:39`, `stomp_act1.js:15`): bluff or pin → Lu Han stands "at his right hand" on Day 21, "keeps a hand on his sword", and joins the elder fight (`elderFight`, hp 10).
- `fo_lu_han` (paid): "He turns his palms up and looks into them" the next morning.
- `rt_parley`: "He knows you bled his disciples" shows for `fought` only.
- Old Wen (`:401`): "the disciples you sent home bleeding" shows for `fought` only.
- `OPENING.paid`: "Lu Han comes back alone…" with no trace of the beating.

*Failure:* a Cultivator wins at degree 3: Lu Han's sword is snapped, "one arm that will mend in a season and one that will want a year". He then pays the pin. Next morning Lu Han turns up both palms. On Day 21 he fights at full strength. `lu_won` already holds the degree, so a fix can key on it. That fix changes the Act 1 elder fight's foes, which is balance, so it needs the owner's call.

## Medium
**M1 The one-move finish draws the net after Yuki is freed.** The one-move lines (posture, net, read, one) are the reply, and the reply is drawn under the scene text (`main.js` `replyHtml` comes after the prose). The scene text is `win[3]`, which ends with `netFree`. Rendered as the woman: first "…Yuki steps out of it, straightens her collar and says, 'Finished? Good.'", then below it "Lu Han empties his sleeve at Yuki… 'You're on your own, then.'" The posture and `one` already came after `win[3]` before this push; the net turns that order into a contradiction a player will notice.

**M2 The one-move finish gives Yuki fight XP under the net.** `instantWin` checks `yukiSitsOut` only and never `enc.net`. Rendered: "Yuki Fight +72 → T1 L2" in Results, on the same screen as her "Carry on without me." NT says she gets none. The test at 9264 checks that the net is shown, not the XP.

**M3 A failed bluff or pin is drawn after the scene it leads to.** `failBluff` and `failPin` are replies under `collectors_sent`. Rendered at degree 2: "He goes… You have handed people hope.", then "The crown rises crooked… He is going regardless." The failed pin's "he will leave without it" is likewise drawn after he has already gone. The same thing happens when the text is folded. Fix: make each a `collectors_sent` opening by flag, or change the wording so the line comes after the speech.

**M4 The great form's net arrives "before he has drawn" right after he draws.** The posture's first paragraph, on every tribute fight: "He draws his sword as a priest unwraps a relic". Next paragraph, great form: "Before he has drawn, Lu Han shakes out his sleeve". The cat's "before his sword does" has the same problem in milder form. The woman's "before the sword is clear" fits (the draw is slow).

**M5 `win[2]` with Gao broken or turned.** The fight screen has just shown "Crimson Lotus outer disciple" being beaten. Then `TT.win2Disciples` has "His three disciples… conclude that their duty lies anywhere else" and "the other three are well down the road". So one of the disciples you fought never fought. History-16 RB counts: cat visits with Gao broken 57, turned 10. Related: the old RB2 CL guard (no "his disciples" in `collectors_lost` with Gao broken or turned, or with the militia) went out with the old row. The new text has "His disciples are thorough", and nothing records why that guard was dropped.

**M6 The Coil screen offers a way out it doesn't have.** `TT.coil` ends "You can arrive. Or you close your teeth on it…", but "Accept it. Get up." is hidden, so Bite is the only label. This is the screen of every lost tribute (31 of 40 games in the packet's bot run).

**M7 The FAQ still teaches the old rule.** The Coil entry: "when a deadline goes against him (accept the written outcome, or rewind)". The Fights entry: "A lost fight against people has its own story; losing to a beast … ends the Coil." A lost tribute now ends the Coil and can't be accepted. The Fights entry's "Yuki attacks on her own" has no line about the net. The two changed sentences themselves render right: +1.5 a meeting, up to +4.5, +2 on top; every 35 rounds.

## Low
- **L1 Village friendship:** a failed bluff or pin goes to `collectors_sent` (+25); a successful bluff gives +20, the pin +12. Failing pays more than succeeding. Balance, so the owner's call.
- **L2 Degree 3 posture:** `win[3]` and `one` leave him "on the ground" / "on his back". Then `bluff_win` has him kneeling ("kneels alone in the dust"), and `tribute_paid` says "still on his knees".
- **L3 Title:** `collectors_lost` is still titled "Kneel", but nobody kneels in the new text.
- **L4 Word family:** in the cat's lost path, "carr*" comes 10 times across three screens (posture 4, net "Carry on", lost 3, Coil 2). The "I said you would be carried" callback works; the rest blunts it.
- **L5 Old saves:**
  - A save standing on `bluff_fail` fights, wins, and is offered the bluff again, though Lu Han already called it (`tribute_fail` knows this; hide that label).
  - A save standing on `bluff_win` or `tribute_paid` from the old no-fight route reads about a fight that never happened.
  - "Get up." (no Coil) goes to the ridge after the carry-off text.
- **L6 Beats:** `bluff_win` replaced "Gao Feng looks back once" with "one figure in crimson", which drops Gao's grudge beat. The failed bluff's "A trick of bone" sits oddly beside `bluff_win`'s own logic ("no mortal can"): a local beaten by a "mortal" has no other explanation left.
- **L7 The disciple's name:** "Crimson Lotus outer disciple" is not in `ENEMY_REALM`, so he is realm 0 where Gao is realm 1 (from Nascent Soul James takes half his damage). That is not quite "Gao's numbers".
- **L8 FAQ wording:** "against Lu Han at the tribute the rounds count every 35" is really all of the move's kept rounds, divided by 35 while in that fight. As worded it reads as if only rounds fought against Lu Han count.

Checked and fine:
- Canon: no sensing (the read is by eye, "His sense still finds nothing"); no deaths; Old Wen's one good eye; Mei Lin and her mother.
- The forms in the lost text: the cat in the bond, the woman aloud.
- Lu Han grave, Yuki deadpan.
- The pin "slipped inside his robe" covers the broken arms at degree 3.
- `SENT` matches the old speeches word for word.
- Folds: every first paragraph stands alone.

## Test gaps
- TG-T1: the one-move finish: no Yuki fight XP when `enc.net`; the net line never drawn under the scene's `netFree`.
- TG-T2: a failed bluff or pin: the reply against `collectors_sent`'s last paragraph (no leaving drawn after "He goes").
- TG-T3: Act 1 with `ending` bluff or paid and `lu_won` 3: `luHanHere`, `fo_lu_han`, `rt_parley`, Old Wen.
- TG-T4: `win[2]` and `win[3]` with Gao out: no "three disciples" who skipped the fight while the disciple was a foe.
- TG-T5: the net paragraph against the posture's draw, in each form.
- TG-T6: `coil_end` for the tribute: the text names no option the screen lacks; the FAQ's Coil sentence against the hidden Accept.
- TG-T7: the RB2 CL guard either restored for `collectors_lost` or its removal recorded.
