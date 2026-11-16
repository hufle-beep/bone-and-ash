# FW read: the prologue with a flying James (v0.11.194, owner picks R2, G1)

**What:** which prologue texts read wrong once James can fly (Foundation, realm 1, `FLY_FROM_REALM`). A read only: nothing in the game changed. The fixes get their own options in the next push.

**How:**
1. **The re-measure** (a scratch copy of `tests/models.test.mjs` logging every prologue scene visited while `canFly(g)`; 200 games × Random, Careful, Completionist, Sociable, Cultivator, the Sitter 100; `--off 0`; 70 s; deleted after): the same as v0.11.190 (`ne-measure.md`): Random 48 of 200 games, the Cultivator 163 of 200, the Sitter 100 of 100 (Careful, Completionist, Sociable 0); 61 scenes. The table is in `fw-brief.md`.
2. **The packets:** `node tools/packet.mjs` on the 61 scenes: 238.5 KB (the estimate in the options was 40–60 KB; the owner picked G1 after the stop-and-ask: the full packets, two readers side by side). Split by scene: part 1 23 scenes (128 KB), part 2 38 scenes (116 KB). Without the repeats they would have been 189 KB (G2, not picked).
3. **The read:** two Opus helpers, cold, side by side, each with `fw-brief.md`, `canon-card.md` and its half (about 119k and 117k tokens, 85 s and 94 s). Their reports follow word for word.
4. **Claude's check of the sure items** (code read, excerpts): see "Checked" at the end.

**Totals (distinct, after the check below):** B (breaks) 4 (heal [2], heal_again ¶1, morning's second morning, lore [0]), O (odd) 12, R (realm-blind, all canon-consistent: locals can't sense him) 11; 36 scenes fine.

# FW read, part 1

Each scene is listed once. Where a scene has items of two classes, it sits under the more serious class and the other item is tagged in brackets.

## B (breaks)
- heal [2] — "It's two hours there and back." — a fixed walking time, shown days 3–5 (seen up to hour 16), when Foundation is already possible (breakthrough from day 2). At ÷(1+realm) the clock would give about 1 h at Foundation, so the label disagrees with the time the game charges, and a flyer would not call it a two-hour errand at all. — sure (that it can show at Foundation+: likely; the label carries no realm guard)
- heal [2] → next screen (heal_again opening) — "You come back mud to the knees" — mud to the knees assumes he waded back on foot. The same choice, flown, gives no mud. — likely

## O (odd)
- breakthrough (all four "as seen in play" Foundation texts, last ¶) — "You feel heavier, and steadier" — this is the moment flight comes back each Coil, and the text says "heavier" and never mentions the Qi flows or the ground letting go. Nothing in the scene acknowledges it. (Since flight is ordinary to him, one dry line would do.) — likely
- scout ¶1 — "the road goes up toward the mountains, one long switchback after another" — a scouting trip up a switchback road, read only from footprints at the waystation. A flyer scouting would plainly look from above, and nothing remarks on why he doesn't. — likely
- village_night [2] — "Carry it far into the forest and bury it in the mire." — a long night trip at hour 25, alone, with sleep to 06:00 afterwards. A flyer would fly it, and neither the label nor the results ("something in the mire bites you") say how he goes. The wording doesn't rule flight out, so this is at most odd. — unsure
  (R) village_night, Gao's-token text ¶3 — "a mortal with no root and no Qi snapped" — Gao's report treats him as having no cultivation at all. This matches canon (locals can't sense him), but it is the same state. — sure that it can show at Foundation+ (day 5, a Coil ≥ 2)

## R (realm-blind)
- tribute ¶4 (every variant) — "No cultivation at all. A mortal." — this is canon-consistent (locals can't sense him), but it is the clearest realm-blind line in the prologue. It reads oddest after the Ashfall-breakthrough variant of breakthrough ("someone ... is already running up the road to the Crimson Lotus"): Lu Han arrives with no word of a tribulation the whole village watched. Also ¶1 — "*Foundation*, said as other villages say *flood*" — James is Foundation himself by then, and the narration never so much as notes it. — sure (shows at Foundation+ in 405 Coils)
- elder ¶2 and ¶4 (every variant) — "No root. No sea of Qi. That chair might as well be empty." / "Foundation, a rung no one in Ashfall has stood on" — first visit, days 3–6. If he broke through in Ashfall before this visit (possible from day 4), Wen watched Heaven back off from him in the street ("so Foundation is paid for. Never this."), and here he speaks as if nothing had happened. — likely
  (O) elder, variant ¶2 — "you walked down out of the Blackroot alive, with no spear" — this assumes he arrived on foot. If he broke through in the wilds (days 2–3), he may have flown, and a whole street would have noticed that. — unsure (probably a figure of speech)
- epilogue ¶7 (all forms) — "Your assets: a fresh doctorate, a cat, ... and a gift" — the stock-take leaves out that he is now a Foundation cultivator who can fly. It reads more like a missed beat than an error. — unsure

## Fine (scenes read with nothing to report)
ashfall, evening, yk_time, supper, village_morning, village, evening2, mei_walk, herb_slopes, supper_roof, wen_lesson, arson_won, yuki_tiger_awaken, village_hunt, camp, night

## Notes
- breakthrough [0] → next screen stream, and camp's lead-in stream[5]: "Keep walking downstream until dark." is a walk alone, a long way. This would be O once flying, but stream is not among the 61 scenes reached flying, so I didn't list it. Worth a check if stream can come after a breakthrough.
- camp and night (wilds, days 1–4) are reached flying in 144 Coils, and nothing in them assumes walking. Only the stream lead-in above does.
- Not in scope, seen in passing: canon-card tics "a great deal" (wen_lesson ¶1), "a good deal" (village_morning, morning variant ¶2), "for a long time" (breakthrough, "It looks for a long time"). Also breakthrough's wilds and Act 1 variants have Ya in a scene that can show in the prologue.

# FW read, part 2

## B (breaks)
- heal_again ¶1 — "You come back mud to the knees" — a wade-and-walk fetch; the lead-in label (heal[2]) also prices it "two hours there and back", a time flight would cut to about 1/(1+realm). Seen flying in 1 Coil. — sure
- morning, "second morning" play variants — "You could go looking for the way out" / "*Then* walk out." — presents him as lost in the forest and walking as the way out; a flyer rises over the canopy and sees the way (and the ridge, the village, the dead tree). Reached flying 56 Coils (Sitter games). — likely (the packet doesn't say which variant shows at Foundation+; ¶1 "Day three" variant is fine)

## O (odd)
- night_attack [1] — "then run for the water" — escape from jackals on foot, and the next screen (jackals_fled) "The running ends waist-deep in black water"; a flyer fleeing would just go up. Not a fight itself, so the ground rule doesn't cover it. Not seen in the bot run. — likely
- dawn ¶1 / [0] — ¶1 "working out which direction counts as *away*" (one look from above answers that); [0] "Run straight toward it": a scream a few hundred metres off, in a hurry, and running is the only fast option offered ([1] "from above" reads fine). — ¶1 unsure, [0] likely
- wilds [3] / [10] — [3] "(takes the afternoon)" for exploring; [10] "Follow the stream out — today" leads to stream_out "Late in the afternoon": a day's walk out that flight would shorten. The brief says the hub has flight branches; nothing on these two labels or results shows one. — unsure
- lore [0] result — "You ride the current over the trees: 10 min, not 40" (and "You fly. 20 min instead of 40") under the label "Walk on to her village", after ¶1 "She tells you on the way down": Mei Lin is with him and can't fly, so the flight result leaves her behind and contradicts the label. The reverse problem: here walking is right. — sure
- ridge_alone ¶1 / ¶3 — "The ridge shows you the lie of the land" comes right after a dawn[2] result "You fly… The path looks no better from above"; from the air he'd already have seen the forest, the dead tree and the village. ¶3 "The way down crosses the herb slope" assumes walking down, while [0] results fly him down. — likely
- bone_field [2] — "Walk back before the light goes" — alone, a long way, against the clock; a flyer would fly. — likely
- hollow [1] — "Follow one root as far as you dare"; failure "The trees crowd in until you turn back"; following it from above the canopy would change it. — unsure
- night_event [8] — "Up the fallen trunk with Yuki and wait them out"; failure "reaches your ankle first": climbing to get out of reach when he can lift off. Small. — unsure
- boar_lost ¶1 — "The fight ends with you in a tree" (all three forms) — the fight outcome has him climbing a tree to escape, not lifting off; post-fight text, so maybe covered by the ground rule. "limp home" is fine (hurt). — unsure

## R (realm-blind)
All are locals reading him as mortal, which canon allows (locals can't sense his cultivation); listed for completeness, none needs changing unless the owner wants it acknowledged.
- herb_girl ¶7 (all forms, and play variant) — "No root. No Qi. Not a flicker." — Gao's reading, narrated; consistent with canon.
- mei_lin ¶2 — "And you are a mortal." — her senses; consistent.
- gao_fight_start ¶1 (all forms) — "felt nothing at all: a mortal" — consistent.
- gao_won play variant — "You have no cultivation… You have *nothing*." — consistent.
- gao_dead ¶3 — "The Foundation feels every vessel beneath it" — consistent; at Foundation+ James isn't beneath him, which sharpens the irony.
- collectors_won ¶4 "the mortal who put a man of Foundation on his knees"; play variant "You have no cultivation… I would have *felt* it." — villagers' / Lu Han's view; consistent.
- bluff_win ¶1 — "his senses still tell him nothing" — consistent, and says so itself.

## Fine (scenes read with nothing to report)
jackals_won, boar_won, yuki_form, tribute_dawn_sleep, romance, tribute_dawn_talk, collectors_lost, coil_end, mother_time, far_hunt, wen_time, tribute_paid, bluff_fail, far_won, gao_talked, pot_cook, night_won, gao_hand, gao_fled, gao_spared

## Notes
- Outside my packet but visible in a lead-in: mei_lin is led in by gao_lost[0] "Keep running. Then walk. Then breathe." (on-foot escape after a lost fight); worth a look in whichever part has gao_lost.
- morning ¶1 "Day three in the Blackroot": canon card puts the prologue wilds apart from the Blackroot (Act 1). Not a flight issue.
- far_won "You carry it home in loads" / "It comes back… a piece at a time": odd for a man with a bottomless hammerspace (not flight; flagged only as a side note).
- night_won "The last crow leaves on foot… remembers it can fly" reads as a nice wink once James flies; keep.
- Flight results already in place (dawn[2], far_hunt[1]/[2], far_won[0], ridge_alone[0]) read well, all solo trips.

## Checked (Claude, in the code)

- **lore [0] "Walk on to her village."** is a marked walk (`js/story/walks.js`), so at Foundation+ `choose` flies it and the result says he flies, while ¶1 has Mei Lin with him on the way down: confirmed. It reads as a break (B), though part 2 filed it under O; the fix is in the walk mark, not the text.
- **heal [2] "two hours there and back"** has a fixed `time: 120` and is not a walk (it adds the fungus), so the game charges the two hours at any realm, as the rule for work says; part 1's "about 1 h" is wrong. The label and `heal_again`'s "mud to the knees" still read as on foot.
- **Not in the 61 scenes, from the readers' notes:** `stream`'s "Keep walking downstream until dark" (after a breakthrough's "Get up."; not reached flying in the bot run) and `gao_lost`'s "Keep running. Then walk." (a lost fight's escape): to read with the fixes.
- **Side notes, not flight:** three canon-card tics (`wen_lesson` "a great deal", `village_morning` "a good deal", `breakthrough` "for a long time"); `morning`'s "Day three in the Blackroot" (the prologue's wilds are not the Blackroot); `far_won`'s carrying home in loads with a bottomless store; `breakthrough`'s wilds and Act 1 variants naming Ya (part 1's note; unchecked).
