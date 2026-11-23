# OC2 — the planted faults (v0.11.260; tools/mutate.mjs, the command: rules, faq, saves, the task test --games 5, the story test --games 5)

Claude's F1–F8 (`oc2-faults.json`, run before the review's fixes) and the reviewer's C1–C10 (`oc2-faults-review.json`, run after them).

## Claude's

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/game.js | migrate reads an unmoved v0.8.5 save's act through the long calendar: a save in Act 1 rewinds to the prologue | caught | saves: 39 files · 1543 passed, 2 failed |
| F2 | js/core/calendar.js | the old calendar's every night a story night comes back | caught | saves: 39 files · 1544 passed, 3 failed |
| F3 | js/core/calendar.js | the Blackroot's camps gone: the 5-day road for every game | caught | 62 passed, 1 failed |
| F4 | js/core/game.js | GT1 off: a gain to Mei Lin or Ya counts every day of a story-week | caught | 16873 passed, 4 failed |
| F5 | js/story/kitchen.js | the old calendar's once-a-Coil cook comes back | caught | Error: Choice not available |
| F6 | js/story/wilds.js | a forest night no longer makes the long road | caught | 1320172 passed, 1 failed |
| F7 | js/story/ashfall.js | the herb slopes open in the first village week (the old calendar's hub) | caught | 9087 passed, 1 failed |
| F8 | js/core/tasks.js | no week's card anywhere: the old calendar's one-go cards come back | caught | 9236 passed, 6 failed |

8 caught, 0 missed, 0 not applied (of 8).

## The reviewer's

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| C1 | js/core/game.js | oldAct1 off by one minute: a v0.8.5 save resting exactly on the old Act 1 dawn (Day 8 06:00, saves/v0.8.5-act1-start.json) reads as the prologue, so its Coil re | caught | saves: 39 files · 1545 passed, 1 failed |
| C2 | js/core/game.js | the hair gone with the longPace branch: 150 x 0.6 x 0.7 (62.999...) pays 62, not 63 (RV1 L1 of v0.11.207) | caught | 1327813 passed, 3 failed |
| C3 | js/core/calendar.js | the old calendar's {OnElder} form comes back on the long calendar: Lu Han says "On the hundred and third" without "day" | caught | 1328343 passed, 2 failed |
| C4 | js/core/calendar.js | tributeLeft one day short in the village: every {days} count and the next-step hint's tribute day off by one, the last day reads as the tribute's eve a day earl | caught | 1328335 passed, 10 failed |
| C5 | js/core/tasks.js | Yuki's food comes home from the third haul of the Coil, not the first (L3 of v0.11.209) | caught |   FAIL  v0.11.253 (RG-A): screens drawn without changing the save (558) |
| C6 | js/story/act1_fallout.js | the lost wolf bites three Fallout mornings, not two (WM; the old calendar's days 9 and 10) | caught | 1328344 passed, 1 failed |
| C7 | js/story/kitchen.js | the old calendar's cook text every time: the pot's first-time scene on every later cook, no repeat texts (TX3) | caught | 1328317 passed, 28 failed |
| C8 | js/story/prologue.js | the won bluff's Village friendship back to the old calendar's +20 (FV: +25) | caught | 1328344 passed, 1 failed |
| C9 | js/core/week.js | noteEvening's stay gate gone with the longCal check: an evening choice on a journey day (the Blackroot's camps) is remembered and repeated by the plan (RV1 L4 o | caught | 1328344 passed, 1 failed |
| C10 | js/story/ashfall.js | the roof's week 3 reads week 2's texts (the old calendar's two weeks), its own sequence never shows (SR3) | caught | 1328341 passed, 4 failed |

10 caught, 0 missed, 0 not applied (of 10).
