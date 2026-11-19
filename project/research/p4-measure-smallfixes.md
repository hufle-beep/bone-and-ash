# Small text fixes: measurements (2026-11-19, v0.11.230)

Grep and line ranges, `git blame` on a deepened scratch copy (/tmp/p4b), and a log in `breakthrough` / `far_won` `enter`: 6 bots × 10 games on each calendar. No recommendation.

## 1. BY: `breakthrough` naming Ya or Mei Lin
- **29 texts name them, 1,627 words** (`prologue.js` 946–1065): `BT_PARTY` night/day/tree (3, 77–86 w each), `BT_MEI` night/day (2, Ya named as away), `BT_LATE` P/M/T × 7 steps (21, 46–55 w), `BT_ASK_WOMEN` P/M/T (3). The gate: `mei_party && ya_party` (`btWho`, `btParty`).
- **The prologue can't show any of the 29.** The two flags are set only in Act 1 (`fo_mei_insists`, `fo_depart`, the Blackroot, `rt_*`), are not in `KEEP_FLAGS` (`coil.js` 29), and the Long Forest never sets them. The FW read's worry doesn't hold for these 29; the bots show 0 in the prologue. Ashfall's witness blocks name neither woman.
- **Hole a, Ya named as away when she is back:** `yaAway` = `bl_day >= 4 && !ya_off_done`. In a game where he likes both women, `ya_offended` never runs, so after `trio_kiss` the Ashen Hills breakthrough picks M (`BT_MEI`, `BT_LATE.M`, `BT_ASK_WOMEN.M`: 10 texts, "Ya walked off"). Bots: 0 of 120 games. Same root as "who is at the Ashen Hills camp".
- **Hole b, Foundation's `recognise` names Mei Lin (1 paragraph, about 45 w, quotes the `lore` scene's line):** `knows = lore1 || lore_realms || rel['Mei Lin']`. The quote comes only from the `lore` scene, which needs `lore1`. So it also shows after Old Wen's lesson alone, or after meeting her without asking. Bots: old calendar 5 of 104 Foundation screens (4 of 60 games); long 15 of 91 (10 of 60; prologue `ashfall` 11). Fix scope: the gate (1 line) or 1 new paragraph for "Wen told you" (about 45 w).

## 2. FI: fight intros never shown
- `power.js` `prepare` (76–77): every fight with a `STOMP` posture opens on the posture at every degree, and all 41 STOMP ids have a posture. Only `plainFight` (never shown) reads `enc.intro` otherwise.
- **Dead, still with text: 27 fights, 29 texts, about 620 words, 25 source lines.** `prologue.js` 53, 66, 86, 661 (jackals 2, gao, collectors 2, boar); `wilds.js` 87–89, 328 (crows, rats, lizard, mire); `ashfall.js` 93, 98 (wolves, thornback, arson); `act1_fallout.js` 98, 104, 111; `act1_blackroot.js` 244–255 (6 + 4 night); `act1_heart.js` 118, 123, 128. Shown per game: 0.
- **Already emptied: 14.** `rt_wolves`, `rt_serpent`, `rt_brawl`, `elder` (v0.11.174, part 7) and the Long Forest's 10 (v0.11.175, P8A IN; `story.test` 1536 pins them empty).
- The Elder's tail is live: `act1_return.js` 104 adds " Behind you, Ashfall does not kneel."; `keepTail` carries it after the posture, and `story.test` 1236 pins it. (The roadmap says "still standing".)
- Tests: the stake tests (`data.test` 473, `story.test` 1350) pass with ''; nothing pins the dead words.

## 3. ST2: the far wins' stomp texts in threes
- `stomp_prologue.js` `wolves` and `thornback`: `win[2]` and `win[3]` each have 2 texts by `byDay(…, 'far_won')` (89–143 w, 2 paragraphs each). `far_won` (`ashfall.js` 411) has 3 texts (39 / 76 / 73 w, degree 1). On the 3rd far-win day of a Coil the stomp text goes back to its 1st.
- **Shown (bots):** old calendar: at most 2 far-win days a Coil, so 0. Long calendar: a stomp text on the 3rd+ day: Cultivator 18 in 10 games (thornback 9, wolves 9, all degree 2), Completionist 1, Random 0, the others 0 (no far wins at degree 2+). Degree 3 far wins: 0.
- **To write:** 4 third texts (wolves 2, thornback 2, degree × kind), 8 paragraphs, about 480 w. Each `win[3]` text has one `stompForm` clause (cat / great / human), so the two degree-3 texts need 2 extra form clauses each. Degree 2 alone (the only one measured): 2 texts, about 250 w, no form clauses.

## 4. SN: the stomp texts in no rewrite part (stale)
- `git blame` against v0.11.166 (the commit before part 1): every entry has been rewritten. `stomp_prologue.js` (11): part 3 (wolves, thornback, arson) and part 9 runs A and B (the other 8, the far hunt's second texts). `stomp_act1.js` (20): parts 4–7 (v0.11.170–174). `longforest.js` (10): part 8.
- **Older text left: `ya_brawl`'s `win[2]`, `win[3]`, `one`.** These are Fable's from v0.11.82, kept under CA1 (part 4 notes: "untouched"). 10 source lines, about 425 w; part 4 notes one tic ("the way a ruler holds down a page"). Plus 6 punch lines kept on purpose (Gao 46, `guardian` 360, `rt_serpent` 422/431, `rt_brawl` 459, `elder` 497; about 60 w).
- The roadmap's "in no part yet" (v0.11.170) is out of date.

## 5. CW in parts 1–3
- **Now: 4 lines** (part 9 run C, v0.11.177, cap 6, then revised by run E): `prologue.js` 95 roast hare (Yuki: "Mine first … at every fire", 3 forms), 668 `boar_won` (a grandmother), 682 `evening` third supper (the mother on the music), `ashfall.js` 189 `supper_roof` (Mei Lin on the music).
- **Parts 4–9: about 24.** Part 4 6; part 5 6 plus `DR_COOK` (4 by day, `act1_blackroot.js` 68); part 6 3; part 7 3; part 8 2 (the Tans, Fang Wei; run D's Tans lines replaced them). That is 3–6 a part, against 4 for parts 1–3 together.
- **Where more could go** (a local or the party present; not fights or Lu Han): about 24 scenes, 4 with CW. Best fits (feeding, music): `supper`, `evening`'s other branches, `evening2`, `mei_walk`, `village_night`, `tribute_dawn_talk` / `_sleep`, `heal` / `heal_again`, `far_won` (the hunters), `drill`, `workshop`, `wen_lesson`, `herb_slopes`, `camp` (Yuki). Rough size: 5–14 more lines (to parts 4–9's density), 15–30 w each.

## 6. FC: the first flight in Coil 1
- Today: `flight_texts.js` 40 `BT_CLOSER` ends "The ground, it seems, has let go of you." on every Foundation, every Coil. The realm resets each Coil.
- **Where the save's first Foundation falls (bots, 10 games each).** Long calendar, prologue Coil 1: Careful, Completionist, Cultivator, Sociable 10 / 10 (`ashfall` 36, Cultivator `wilds` 12); Random 2 / 10; Sitter 1 / 10 (9 in Act 1 Coil 1–2). Old calendar: prologue Coil 1 only for the Sitter, 4 / 10 (`wilds`). The others first reach it in later prologue Coils (Random, Cultivator 2–8) or in Act 1 (Careful, Completionist, Sociable 10 / 10, Act 1 Coils 2–4).
- So "Coil 1" really means "the save's first Foundation". A kept flag is needed (new, added to `KEEP_FLAGS`: a save addition, no id changed).
- **Hooks:** (a) `breakthrough`'s "Get up." router (`prologue.js` 1131), like `yuki_tiger_awaken`: a new scene when realm 1 and the flag is unset, then back to `bt_return` (wilds, stream, camp, village, ashfall, Act 1 hubs). (b) The next marked walk (`walks.js` `markWalks`, `FLY_LABELS`): its first flown label goes to the scene first. (a) covers every place; (b) may come hours later.
- **Size:** a scene like `yuki_tiger_awaken` is 222 w. One discovery scene, about 150–250 w, plus a variant for a village witness (Ashfall saw it) or the party in Act 1. With Yuki's 3 forms where she acts, about 3 clauses.
