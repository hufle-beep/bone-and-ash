| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/music.js | DU-A dropped: a line after an evening song | caught | 4671227 passed, 4 failed |
| F2 | js/story/music.js | DU-A always: a morning song takes the evening's line | caught | 4671227 passed, 4 failed |
| F3 | js/story/music.js | ON-S: the song again on every new visit that day | caught | 4671230 passed, 1 failed |
| F4 | js/story/music.js | back from a meta screen (Yuki's form) loses the passage | caught | 4671230 passed, 1 failed |
| F5 | js/story/music.js | ON-S: never marked heard | caught | 4671223 passed, 8 failed |
| F6 | js/core/coil.js | ON-S: songs reset with the Coil | caught | 4671228 passed, 3 failed |
| F7 | js/story/songs.js | hand-edited key counted | caught | 4671230 passed, 1 failed |
| F8 | js/story/songs.js | the great cat speaks aloud | caught | 4671230 passed, 1 failed |
| F9 | js/story/music.js | morning and day songs never play | caught | 4671227 passed, 4 failed |
| F10 | js/story/music.js | a song on a screen with its own music (rt_camp) never plays | caught | 4671230 passed, 1 failed |
| F11 | js/story/songs.js | a song moved to a branch screen | missed |  |
| F12 | js/story/music.js | DU-A boundary at 15:00 | caught | 4671230 passed, 1 failed |
| F13 | js/story/songs_texts.js | fact: plasma weekly | caught | 4671230 passed, 1 failed |
| F14 | js/story/songs_texts.js | owner's fixed reaction: Mei Lin horrified | caught | 4671230 passed, 1 failed |
| F15 | js/story/songs_texts.js | music while hunting | not applied | find not in the file |
| F16 | js/story/songs_texts.js | general edition names her | caught | 4671228 passed, 3 failed |
| F17 | js/story/songs_texts.js | FC misspelling back | caught | 4671230 passed, 1 failed |
| F18 | js/story/songs_texts.js | a canon-card tic | caught | 4671228 passed, 3 failed |

16 caught, 1 missed, 1 not applied (of 18).

After RV1's F11 test and F15's find updated to the fixed text:

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F11 | js/story/songs.js | a song moved to a branch screen | caught | 4671231 passed, 1 failed |
| F15 | js/story/songs_texts.js | music while hunting | caught | 4671231 passed, 1 failed |

2 caught, 0 missed, 0 not applied (of 2).
