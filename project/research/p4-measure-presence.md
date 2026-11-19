# Who is at the Ashen Hills camp: measured (scratch copy /tmp/p4a, working copy untouched)

Ya-away = `yaAway || bothAway`, Mei-away = `bothAway`. All lines are `js/story/act1_blackroot.js`. "Shown" = what the 4 bots saw while the woman was away (40 games, --cal 7).

## 1. What names Ya or Mei Lin at the camp (26 rows)
| line | what | names | can show while away | shown |
|---|---|---|---|---|
| 287 / 1017-74 | "Talk to Mei Lin." card, talk_mei (beats 0, 1, 4, 1064 name Ya) | M (Y) | yes (both) | offered at 300/300 decisions, picked 0 |
| 288 / 1075-147 | "Talk to Ya." card, talk_ya | Y | yes | offered 408/408, picked 0 |
| 291 | Rest reply "Ya's word for it is a nap" | Y | yes | offered 408, 0 |
| 301 | hub: hungry (Ya) / hurt (Mei Lin) | Y, M | yes | 0 |
| 812 | hub lead from bday 5 ("Ya says") | Y | only if the door is never taken | 0 |
| 814 | door "Ya's gone." | Y | **still shows after trio_kiss** | 0 (bots take 814 first) |
| 828 | truffle failure ("goes to Ya", Mei Lin) | Y, M | yes | 0 |
| 829 + 151 | "Cinderberries with Mei Lin." + DR_CINDER (2, "she") | M | yes (both) | **32** |
| 830 + 159 | beetle, DR_BEETLE_AFTER (2 Ya, 1 Mei) | Y, M | yes | 3 |
| 175, 834-47 | HUNT_AGAIN.ah, ah_hunt openings (2) | Y | yes | 0 |
| 161-162 | darts at hares, DARTS_PART/FULL (4) | Y | yes | 0 |
| 857-77, 241 | hawks won (2), lost + patchUp | Y, M | yes | 0 |
| 879-93 | cairn (ah_scout) | Y, M | yes | 0 |
| 1010 + 136, 143 | **"Spar with Ya."** + replies (7) | Y | yes | **45** (32 both, 13 Ya) |
| 1011 + 76, 91 | darts at a mark (Ya 4 of 8, Mei 2 of 8) | Y, M | yes | 45 picks; 21 named Ya, 14 named Mei Lin while she was away |
| 1012 + 83, 96 | needle drills (Ya 1, Mei 4 of 8) | Y, M | yes | 45 picks; 9 named Mei Lin while away |
| 1160 + 69 | camp "Cook and eat." DR_COOK (4/4 Ya, 3 Mei) | Y, M | yes (19:00) | 5 |
| 1161 + 21 | stakes DR_STAKES (Ya 2, Mei 1) | Y, M | last night (4.2) only | 0 |
| 1162 / 1221 | "Sit by the fire with the others." / ah fireside text | Y, M | yes | 7 |
| 1233 / 1240 | "Ya's hand finds yours" / ya_romance | Y | yes (both) | 7 |
| 1234 / 1260 | "Stay up with Mei Lin" / mei_bond | M | Ya-away only (onlyMei) | 0 |
| 1235 / 1309 | "first watch together, all of you" | Y, M | Ya-away only (!both) | 0 |
| 222, 1326-27 | bl_night watch text + 2 cards | Y, M | 4.2 night only | 0 |
| 1348-94 | night events stars/lights/warm/mei, won/lost (6) | Y, M | 4.2 night only | 0 |
| 202, 1405, 1413 | mornings: BL_QUIET 4b, 5a; no-breakfast; day-5 | Y, M | yes | 0 (9 morning visits, no-name line) |
| 1052 prologue.js | btWho witness block | reads both | ah_hub only, any hour | n/a |
Counts: 10 cards + 2 doors; 39 reply lines (pools); about 22 scene texts plus the talk beats.

## 2. When the absences start and end
- `yaAway` (215): from `bl_day` 4 (calendar Day 74, `calBl` blSpan 3: ah = Days 74-79, story days 4.0-5.2) until `ya_offended` is entered (`ya_off_done`, 899). No time limit; also true at the Drowned Wood's last morning (bday 4, region dw).
- `bothAway` (216): from `trio >= 2` (mei_curious 771 in the Drowned Wood, or ya_found's 2nd answer 932) until `trio_kiss` (936). **No region check**: true in the Drowned Wood after the spring.
- Story: both doors say "an hour ago". ya_offended: an hour gone; Track (60 min) / Wait (120 min) -> ya_found: Ya back the same day, "a hand's width closer" (2nd answer: "sets off to find a second wolf"). trio_kiss: both at the spring under the ridge, and back to the hub with you. Neither text keeps anyone out overnight; the evening is never mentioned.
- ya_offended runs with Mei Lin present ("Let her sulk") while bothAway holds: **31 of 48** ya_offended scenes.

## 3. Per game (10 games each, --cal 7)
| bot | Ya-away days (ends) | both-away days / evenings | shown while away |
|---|---|---|---|
| careful | 1 (4.0, door 14:00) | 1.4 / 0.7 (trio_kiss 4.1 11:00) | spar 2.1, darts 2.1, needle 2.1, cinder 1.8, cook 0.5, fireside 0.7, ya_romance 0.7 |
| sociable | 1 (4.0, 08:00) | 0.8 / 0 (10-11:00) | 0 (doors first) |
| completionist | 1 (4.0, 14:00) | 0.7 / 0 (16-18:00) | spar 1.2, darts 1.2, needle 1.2, cinder 0.7, beetle 0.1 |
| cultivator | 1 (4.0, 13-15:00) | 0.7 / 0 (15-17:00) | spar 1.2, darts 1.2, needle 1.2, cinder 0.7, beetle 0.2 |
No bot left a door untaken past 4.1; no bot took trio_kiss before ya_offended.

## 4. Sub-items, measured
- **R-gate** (hide "Spar with Ya." and "Talk to Ya." while Ya-away; "Talk to Mei Lin." and "Cinderberries with Mei Lin." while Mei-away; region `ah` only; `trainLeft` too). Gross (the away spars now): XP 139 / 51 / 66 a game (careful / completionist / cultivator, sociable 0), Ya +4.6/+4.2, +2.4/+1.8, +2.4/+1.6 (f/a). Simulated: away picks 45 -> 0; spars a game unchanged (7.2), moved after the door; XP, GU/CU level and Mei Lin unchanged (Mei Lin 150/150 capped at entry); Ya at the Blackroot's end +0.3/+0.4 careful, 0 elsewhere. Doors taken 1-2 h sooner (careful's both-away evening goes). Balance change about 0.
- **R-end a** (Ya's door waits for the spring: `yaAway && !bothAway`). Simulated: ya_offended while both away 31 -> 0; all on the same day after trio_kiss; Ya at the end within +/-3. Then "Ya's gone." follows the kiss: an order for the texts.
- **R-end b** (trio_kiss sets `ya_off_done`). Removes ya_offended/ya_found in the 29 of 40 games with both away: Ya +6/+6 and the wolf tooth (ya_tooth) lost there. A story cut.
- **R-even** (`!late(g)` in both predicates: the evening counts as back; the door is offered again the next morning). Balance 0; 7 evening shows (cook 5, fireside 7, ya_romance 7) become correct; btWho at ah_hub after 19:00 reads 'P'.
- **R-region** (region `ah` in both predicates): needed by any gate; changes btWho nowhere (ah_hub only).
- **R-text** (an away version, for Fable): with R-gate + R-even, 23 Ya lines + 6 Mei Lin lines (day only); without R-even about +23 (camp, fireside, night, mornings); without R-gate +9 (spar 7, cinder 2) and both talk scenes.
