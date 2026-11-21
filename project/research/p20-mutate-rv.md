| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/core/week.js | WE: the week's first evening taken the quiet way too | caught | 192356 passed, 2 failed |
| F2 | js/core/week.js | WE: the free evening's later screens (the supper after the hub) taken the quiet way | caught | 192357 passed, 1 failed |
| F3 | js/core/week.js | WE: an event's evening (another way on) taken the quiet way | caught | 192357 passed, 1 failed |
| F4 | js/core/week.js | WE: the old calendar too | caught | 192357 passed, 1 failed |
| F5 | js/core/week.js | WE: the switch ignored | caught | 192344 passed, 14 failed |
| F6 | js/core/week.js | WE: the quiet walk takes a screen's first choice (a real choice walked past) | missed |  |
| F7 | js/core/week.js | WE: the panel's line wrong | caught | 192357 passed, 1 failed |
| F8 | js/core/week.js | WE: the supper's quiet way the dishes (WE-d) | caught | 192351 passed, 7 failed |
| F9 | js/story/romance.js | DP: the roof before Ya's hand | caught | 192357 passed, 1 failed |
| F10 | js/story/romance.js | DP: the embers while she no longer likes him | caught | 192357 passed, 1 failed |
| F11 | js/story/romance.js | DP: the roof never noted | caught | 192357 passed, 1 failed |
| F12 | js/story/romance.js | DP: keeping watch noted as getting in | caught | 192357 passed, 1 failed |
| F13 | js/story/romance.js | DP: the line at the end of the evening, under who goes where | caught | 192357 passed, 1 failed |
| F14 | js/story/romance.js | EC: an echo at a meeting never met before | caught | 192356 passed, 2 failed |
| F15 | js/story/romance.js | EC: on every later Coil, not once a save | caught | 192357 passed, 1 failed |
| F16 | js/story/romance.js | EC: from Coil 2 | caught | 192357 passed, 1 failed |
| F17 | js/core/game.js | EC: the record lost crossing into Act 1 | caught | 192357 passed, 1 failed |
| F18 | js/story/act1_return.js | FR: Yuki and Ya's night reads Mei Lin | caught | 192356 passed, 2 failed |
| F19 | js/story/act1_return.js | FR: Yuki's night: no one down there | caught | 192355 passed, 3 failed |
| F20 | js/story/romance.js | RV-A VS: a tier beat by the minute again (a choice's time hides it) | caught | 192357 passed, 1 failed |
| F21 | js/story/romance.js | RV-A VS: the echo by the minute again | caught | 192356 passed, 2 failed |
| F22 | js/story/romance.js | RV-A VS: the remembered line by the minute again | caught | 192357 passed, 1 failed |
| F23 | js/core/week.js | RV-A DS: a screen showing a beat walked past | caught | 192357 passed, 1 failed |
| F24 | js/core/week.js | RV-A DS: a beat on the walk not seen | caught | 192357 passed, 1 failed |
| F25 | js/core/week.js | RV-A DS: a story screen on the walk taken as safe | caught | 192357 passed, 1 failed |
| F26 | js/core/week.js | RV-A L1: the week keyed by the calendar day | caught | 192357 passed, 1 failed |
| F27 | js/story/act1_return.js | RV-A FY: Yuki's road line with Ya liked | caught | 192356 passed, 2 failed |
| F28 | js/core/week.js | YM-A: an earlier week's answer repeated | caught | 192357 passed, 1 failed |
| F29 | js/core/week.js | YM-A: the repeated answer walked into a story screen or a beat | missed |  |
| F30 | js/core/week.js | YM-A: the week of the evening's choice not noted | caught | 192357 passed, 1 failed |
| FC1 | js/core/week.js | WE: the story-week key dropped: a plan that runs into the next story-week gives it no free evening | caught | 192357 passed, 1 failed |
| FC2 | js/core/week.js | WE: a night screen the quiet walk said is not noted for the fold (re-anchored: noteWalked) | missed |  |
| FC3 | js/core/week.js | WE: the quiet walk no longer says a walked night screen's text | caught | 192357 passed, 1 failed |
| FC4 | js/core/week.js | WE: the evening screen's own text (the supper's) not said when the plan takes its quiet way | caught | 192357 passed, 1 failed |
| FC5 | js/core/week.js | WE: the quiet walk stops after one screen | caught | 192354 passed, 4 failed |
| FC6 | js/core/week.js | WE: the panel's evening line off the week hubs (re-anchored after RV-A dropped EVE_HUBS, which equalled WEEK_HUBS) | caught | 192357 passed, 1 failed |
| FC7 | js/story/act1_return.js | FR: Yuki and Mei Lin's night reads 'not looking for anyone' down there | caught | 192356 passed, 2 failed |
| FC8 | js/story/act1_return.js | FR: Yuki's own night gives Ya's line on the road | caught | 192357 passed, 1 failed |
| FC9 | js/story/romance.js | EC: an echo at a first meeting read for the first time this Coil (noteSeen runs before enter) | caught | 192357 passed, 1 failed |
| FC10 | js/story/romance.js | DP: Ya's foot under the table while she no longer likes him | missed |  |

36 caught, 4 missed, 0 not applied (of 40).

## Addendum (after F6's and F29's tests)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F6 | js/core/week.js | WE: the quiet walk takes a screen's first choice (a real choice walked past) | caught | 192359 passed, 1 failed |
| F29 | js/core/week.js | YM-A: the repeated answer walked into a story screen or a beat | caught | 192359 passed, 1 failed |

2 caught, 0 missed, 0 not applied (of 2).

In all: 38 of 40 caught. FC2 equivalent (the fold notes a refused screen itself before the walk says it); FC10 equivalent (likesYa includes ya_romance).
