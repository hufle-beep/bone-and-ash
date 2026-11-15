# Planted faults, v0.11.184 (the review's 16; after RV1, F11 and F12's finds moved to the new text)

## Before RV1 (the review's run)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/again.js | pool always wins: own lines never shown | caught | 4671342 passed, 17 failed |
| F2 | js/story/again.js | a pool line is drawn (picker advanced) even when the scene has its own: the pool not untouched | missed |  |
| F3 | js/story/again.js | own line on a same-visit (SV) fold, which must have none | missed |  |
| F4 | js/story/again.js | the pool lost for every other scene | caught | 4671346 passed, 13 failed |
| F5 | js/story/remember.js | the beat ignores the day index (text and line both) | caught | 4671326 passed, 33 failed |
| F6 | js/story/remember.js | Ya's line follows Mei Lin's day record: line and text on different beats | missed |  |
| F7 | js/story/remember.js | the settled text gets beat 1's line | caught | 4671353 passed, 6 failed |
| F8 | js/story/remember.js | morning line on days other than 2 | caught | 4671358 passed, 1 failed |
| F9 | js/story/remember_texts.js | Ya's beat 3 and 4 lines swapped: each line above the wrong talk | missed |  |
| F10 | js/story/remember_texts.js | KP claims Ashfall and the cage (C1's false-in-14-83% fact) without the words the regex knows | missed |  |
| F11 | js/story/remember_texts.js | KP names a Coil count | missed |  |
| F12 | js/story/remember_texts.js | canon-card tic in a memory line | missed |  |
| F13 | js/story/remember_texts.js | canon-card tic in the KP paragraph | missed |  |
| F14 | js/story/remember_texts.js | time word that is wrong at most hours (talks run 6-19) | missed |  |
| F15 | js/story/wilds.js | KP only after the lights night | caught | 4671357 passed, 2 failed |
| F16 | js/story/act1_blackroot.js | Ya's TEXT follows Mei Lin's day record (line by Ya's): line above the wrong beat | missed |  |

6 caught, 10 missed, 0 not applied (of 16).

## After RV1: `node tests/story.test.mjs --quick`
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/again.js | pool always wins: own lines never shown | caught | 4671355 passed, 19 failed |
| F2 | js/story/again.js | a pool line is drawn (picker advanced) even when the scene has its own: the pool not untouched | caught | 4671358 passed, 16 failed |
| F3 | js/story/again.js | own line on a same-visit (SV) fold, which must have none | missed |  |
| F4 | js/story/again.js | the pool lost for every other scene | caught | 4671361 passed, 13 failed |
| F5 | js/story/remember.js | the beat ignores the day index (text and line both) | caught | 4671340 passed, 34 failed |
| F6 | js/story/remember.js | Ya's line follows Mei Lin's day record: line and text on different beats | caught | 4671366 passed, 8 failed |
| F7 | js/story/remember.js | the settled text gets beat 1's line | caught | 4671368 passed, 6 failed |
| F8 | js/story/remember.js | morning line on days other than 2 | caught | 4671373 passed, 1 failed |
| F9 | js/story/remember_texts.js | Ya's beat 3 and 4 lines swapped: each line above the wrong talk | caught | 4671372 passed, 2 failed |
| F10 | js/story/remember_texts.js | KP claims Ashfall and the cage (C1's false-in-14-83% fact) without the words the regex knows | caught | 4671373 passed, 1 failed |
| F11 | js/story/remember_texts.js | KP names a Coil count | not applied | find not in the file |
| F12 | js/story/remember_texts.js | canon-card tic in a memory line | not applied | find not in the file |
| F13 | js/story/remember_texts.js | canon-card tic in the KP paragraph | missed |  |
| F14 | js/story/remember_texts.js | time word that is wrong at most hours (talks run 6-19) | missed |  |
| F15 | js/story/wilds.js | KP only after the lights night | caught | 4671372 passed, 2 failed |
| F16 | js/story/act1_blackroot.js | Ya's TEXT follows Mei Lin's day record (line by Ya's): line above the wrong beat | caught | 4671372 passed, 2 failed |

11 caught, 3 missed, 2 not applied (of 16).

F11 with its new find:
1 caught, 0 missed, 0 not applied (of 1).

## After RV1: the text faults against textlint's snapshot (log only in the check)
| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F9 | js/story/remember_texts.js | Ya's beat 3 and 4 lines swapped: each line above the wrong talk | missed |  |
| F10 | js/story/remember_texts.js | KP claims Ashfall and the cage (C1's false-in-14-83% fact) without the words the regex knows | caught |  |
| F11 | js/story/remember_texts.js | KP names a Coil count | caught |  |
| F12 | js/story/remember_texts.js | canon-card tic in a memory line | caught |  |
| F13 | js/story/remember_texts.js | canon-card tic in the KP paragraph | caught |  |
| F14 | js/story/remember_texts.js | time word that is wrong at most hours (talks run 6-19) | caught |  |

5 caught, 1 missed, 0 not applied (of 6).
