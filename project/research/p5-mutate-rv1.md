| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/act1_fallout.js | fo_mei's three story days share one count | caught | 193708 passed, 12 failed |
| F2 | js/story/act1_fallout.js | label [0] one text off | caught | 193715 passed, 5 failed |
| F3 | js/story/act1_fallout.js | day 8's label [1] read by day 9's count | caught | 193718 passed, 2 failed |
| F4 | js/story/act1_fallout.js | Ya's day-10 label by day 9's count | caught | 193718 passed, 2 failed |
| F5 | js/story/ashfall.js | the roof's line past the third night | caught | 193718 passed, 2 failed |
| F6 | js/story/ashfall.js | village days 5 and 6 counted apart | caught | 193719 passed, 1 failed |
| F7 | js/story/act1_blackroot.js | the Ashen Hills' Ya and Mei Lin lines swapped | caught | 193718 passed, 2 failed |
| F8 | js/story/act1_blackroot.js | Root Road's fire read by the Ashen Hills' count | caught | 193717 passed, 3 failed |
| F10 | js/story/act1_fallout.js | Ya's scene on day 8 (a walker) has no list | caught | TypeError: FO_YA_NEW[dd] is not iterable |
| F11 | js/story/act1_blackroot.js | the Ashen Hills' new texts out of order | caught | 193717 passed, 3 failed |
| F12 | js/core/week.js | PS-a: the story day dropped from the signature (hash drops digits) | caught | 193713 passed, 7 failed |
| F13 | js/story/music.js | MR reverted: a second music line under the roof's third text | caught | 193718 passed, 2 failed |
| F14 | js/story/ashfall.js | the walk's cooking line changed | caught | 193718 passed, 2 failed |
| F9b | js/story/ashfall.js | the supper's cooking line changed (F9 ported) | caught | 193718 passed, 2 failed |
| T1 | js/story/act1_fallout.js | a time word (yesterday) in Ya's day-10 text, which can show on the first day she is in reach of it | caught | 193718 passed, 2 failed |
| T2 | js/story/act1_fallout.js | Claude's cut on fo_mei 9:3 reverted (who could know: the road is still empty) | caught | 193719 passed, 1 failed |
| T3 | js/story/ashfall.js | canon: the roof names Lu Han, met only at the tribute | caught | 193719 passed, 1 failed |
| T5 | js/story/act1_blackroot.js | a time word against the evening fire | caught | 193718 passed, 2 failed |
| T4b | js/story/ashfall.js | the mother praises outright (T4 ported) | caught | 193718 passed, 2 failed |
| T6b | js/story/act1_blackroot.js | the cat speaks aloud (T6 ported) | caught | 193719 passed, 1 failed |
| C1 | js/story/act1_fallout.js | day 8's quilt/pot labels leak onto days 9 and 10 after a real week of day 8 (fo_mei:8 count 7 → index 1) | missed |  |
| C2 | js/story/act1_blackroot.js | the fireside's day key no longer noted under the key byDay reads: Root Road and Ashen Hills (and the Drowned Wood) stuck on the first text in a real game | caught | 193719 passed, 1 failed |
| C3 | js/story/act1_fallout.js | an unclosed quote in fo_mei day 9's third text (a text the text lint never renders) | caught | 193719 passed, 1 failed |
| C4 | js/story/act1_blackroot.js | an unpaired quote in the Ashen Hills' third text, Mei Lin's branch | caught | 193719 passed, 1 failed |
| C5 | js/story/ashfall.js | the old calendar's second roof night shares the first week's count: 'Second night on the roof' replaced by the plum-wine text, its stay line by the first week's | caught | 193719 passed, 1 failed |
| C6 | js/story/act1_fallout.js | an unpaired quote in fo_mei day 9's third text, mid-paragraph | caught | 193719 passed, 1 failed |

25 caught, 1 missed, 0 not applied (of 26).

After the run: C1 missed, a test added (TG-C3: day 8's second label after two days of day 8, then day 9); C1 alone again: 1 caught, 0 missed. All 26: caught.
