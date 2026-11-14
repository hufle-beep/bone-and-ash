# Label pass (v0.11.179, owner pick LB1): the full read (FR), word for word

A fresh Opus helper read `lean.txt` (874 rendered labels, each with the last 220 characters of its scene's text; 106 KB) against `canon-card.md` and the checklist (brief: `label-pass-read-brief.md`). Its report as returned (the 16 items known from 14:16 were skipped):

F · rt_evening · "Climb to the loft with Mei Lin. The cat is already up there." / "…Yuki is already up there." · In all three forms the text above puts Yuki by the stove ("Yuki takes the stove." / "the floor in front of the stove. All of it." / "the bench by the stove"), not in the loft.
F · rr_scout · "\"You followed me for two days?\"" · The text has just said it ("Two days I followed you"), and the result repeats "Ten days back… your first camp, by the stream… the wolves weren't the only ones" almost word for word. "Two" also clashes with ya_meets "Three nights I sat outside your little fire. Three.", with its label "three days" and with ya_talk "three nights running".
F · ya_offended · "Track her. Nose first, like she taught you." · This label always shows, but the lesson ("Ya teaches tracking… nose first") only happens in rr_scout, which is an optional hub visit (bl_tracker only adds a bonus). A player who skipped "Scout ahead with Ya" was never taught.
F · rt_road · "Let the other two get ahead, and wait for Yuki to drop back." (human) · The human text above says "Yuki walks at your elbow and supervises", so she is not ahead and has nothing to drop back from.
T · stream, camp, village, wilds, ashfall, fo_ashfall, rr_hub, dw_hub, ah_hub, heart_hub, rt_camp, rt_ashfall, lf_hub · "Sit down beside Yuki." · This is the canon tic "sits down beside", and it appears on 13 hubs.
T · drill / fo_drill / rt_hunters · "…shields of bone, spears behind, nobody alone." / "Drill the line: spears behind bone shields, nobody alone." / "Drill them hard: shields of bone, spears behind, nobody alone." · The same phrase is used three times across the three Ashfall drills. The same goes for drill "let Yuki show them what speed looks like" against fo_drill "so they see what fast looks like".
T · hollow / rr_roots / rt_grove · "Sit among the roots and cultivate. Let the song in." / "Let the song in. Cultivate with it." / "Sit among them and cultivate. Let the song in." · The same label is used three times.
T · rt_ya_talk / rt_mei_talk / rt_yk_talk · "Kiss her, there on the path, since she's standing right there." / "Kiss her, there on the path, before she finds something else to hold." / "Stop walking. Kiss her before the path straightens." · These three branches all come off rt_road, and each repeats "kiss her… path".
T · talk_ya / bl_fireside · "When she grabs your wrist and drags you off the path, go." / "When Ya takes your hand and tugs you toward the dark, go." · Neighbouring Blackroot scenes use the same "When Ya…, go." build.
T · wild_train / lf_train · "Needle drills: one point, one knuckle-width, a hundred times." / "…a thousand times." · The second is a near-copy of the first, and "a thousand" belongs to the tic family.
P · rt_evening · "Climb to the herb loft with Mei Lin." + "Climb to the loft with Mei Lin. The cat is already up there."; "Follow Ya out to the grove." + "Follow Ya to the grove. Yuki follows you." · Both pairs can be drawn on one screen (yuki_path sets the first of each pair to show on likesMei / likesYa alone) and read almost the same. Direction: make each pair distinct.
P · lf_hub · "Withdraw into seclusion. (A season passes.)" + "Withdraw for a season: Mortal Vessel → Foundation." · Both can be on one screen (the daily lf_secl option and the realm-climb option), and both promise "a season".
P · fo_wolf_lost · "Bandage it. Sleep." · The nearest "it" above is the goat ("carrying the goat… Its owner bows"). The bite is two paragraphs up. Direction: name the arm.
P · ya_found · "\"Bring it back to camp and give one to Mei Lin, too. She's been looking for you.\"" · It reads as handing back her single tooth ("It's the best thing I own"), but the result has James "hang it round your neck"; the "it… one" wording is muddled.
P · scan_ok · "Find out what \"help\" looks like around here. Later. First: the clearing ahead." · Three beats where one would do, and it reads as overlong next to the plain labels around it.

Read: 827 labels (874 `> ` lines in lean.txt, of which 47 are "Story Mode only" placeholders). Finds: F 4, T 6, P 5.

Outside the label scope, seen while checking: act1_return.js gives Yuki "one yellow eye" in cat form (lines 293 and 810) but "one gold eye" in great form, and canon says gold. lf_trial_won renders "The it won't be the last thing…" when the beast name falls back to "it" (longforest.js line 601). rt_yk_talk has "Gold eyes, level", which is the canon tic "gold eyes level".

## Claude's notes (v0.11.179)
- The "yellow eye" is no fault: `lore.md` "Who she is": the spec gives her yellow eyes, the pictures gold (a known, accepted difference). Not offered.
- `rr_scout` is a work menu (`task_hubs.js`): its text is never drawn in task mode, so the "repeats the text" part of F2 is moot in play; the count clash was on the card's label (H1).
- "Gold eyes, level" stood in four texts (Yuki's first and second asking, the fire night, `rt_yk_talk`); X1 + D1 + F1 cover all four.
