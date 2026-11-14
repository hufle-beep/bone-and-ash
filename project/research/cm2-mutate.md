| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/music.js | one-a-day rule: a second evening screen picks again | caught | 4670772 passed, 5 failed |
| F2 | js/story/music.js | off by one: no line from 15:00 to 15:59 | missed |  |
| F3 | js/story/music.js | steps overlap at 80 (mid and high both open) | missed |  |
| F4 | js/story/music.js | this Coil's new lines no longer come first | caught | 4670776 passed, 1 failed |
| F5 | js/story/music.js | the camp shows a line and the reading follows: two a day | caught | 4670776 passed, 1 failed |
| F6 | js/story/music.js | the reading no longer uses up the day | caught | 4670776 passed, 1 failed |
| F7 | js/story/music.js | the game's own music lines no longer count | caught | 4670775 passed, 2 failed |
| F8 | js/story/music.js | archive one day in five, not four | missed |  |
| F9 | js/story/music.js | the line shows again on a later visit and on other screens that day | caught | 4670774 passed, 3 failed |
| F10 | js/main.js | no line under a folded screen | missed |  |
| F11 | js/main.js | the phone's edition is not restored on load | missed |  |
| F12 | js/story/reading.js | 'the ship' after the log (Selene rule) | caught | 4670775 passed, 2 failed |
| F13 | js/story/reading.js | off by one: no reading from 16:00 to 16:59 | missed |  |
| F14 | js/core/edition.js | the named edition never reaches the screen | caught | 4670775 passed, 2 failed |
| F15 | js/story/music_texts.js | a listed tic in a music line | missed |  |
| F16 | js/story/music_texts.js | a form fault (the great form and the woman on his shoulder) | missed |  |
| F17 | js/story/music_texts.js | a proper name in the general edition (not from the table) | missed |  |

8 caught, 9 missed, 0 not applied (of 17).

## After RV1's tests (Claude's run; F9's find moved to the new code; F10, F11 against the browser test)

| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/music.js | one-a-day rule: a second evening screen picks again | caught | 4671073 passed, 7 failed |
| F2 | js/story/music.js | off by one: no line from 15:00 to 15:59 | caught | 4671079 passed, 1 failed |
| F3 | js/story/music.js | steps overlap at 80 (mid and high both open) | caught | 4671078 passed, 2 failed |
| F4 | js/story/music.js | this Coil's new lines no longer come first | missed |  |
| F5 | js/story/music.js | the camp shows a line and the reading follows: two a day | caught | 4671079 passed, 1 failed |
| F6 | js/story/music.js | the reading no longer uses up the day | caught | 4671079 passed, 1 failed |
| F7 | js/story/music.js | the game's own music lines no longer count | caught | 4671078 passed, 2 failed |
| F8 | js/story/music.js | archive one day in five, not four | caught | 4671079 passed, 1 failed |
| F9 | js/story/music.js | the line shows again on a later visit and on other screens that day | caught | 4671076 passed, 4 failed |
| F12 | js/story/reading.js | 'the ship' after the log (Selene rule) | caught | 4671078 passed, 2 failed |
| F13 | js/story/reading.js | off by one: no reading from 16:00 to 16:59 | caught | 4665651 passed, 1 failed |
| F14 | js/core/edition.js | the named edition never reaches the screen | caught | 4671078 passed, 2 failed |
| F15 | js/story/music_texts.js | a listed tic in a music line | caught | 4671079 passed, 1 failed |
| F16 | js/story/music_texts.js | a form fault (the great form and the woman on his shoulder) | caught | 4671079 passed, 1 failed |
| F17 | js/story/music_texts.js | a proper name in the general edition (not from the table) | caught | 4671078 passed, 2 failed |

14 caught, 1 missed, 0 not applied (of 15).

F4 again after its test was made exact: caught. F10, F11: the browser test can't run in mutate's copies (they leave out art/; a no-op control fails too), so not measured.
