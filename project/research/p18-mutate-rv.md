| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/ashfall.js | VM: the old calendar reads week 1's new mornings | caught | 192186 passed, 1 failed |
| F2 | js/story/ashfall.js | VM: the last day loses its old text | caught | 192184 passed, 3 failed |
| F3 | js/story/ashfall.js | VM / LC1: the burned line never shows | caught | 192184 passed, 3 failed |
| F4 | js/story/ashfall.js | LC1: the roof's week-3 lines name the herb loft after a burn | caught | 192186 passed, 1 failed |
| F5 | js/story/music.js | LC1: the loft's music line names the herbs after a burn | caught | 192185 passed, 2 failed |
| F6 | js/story/music.js | LC1: a redraw of the same visit shows the unburned line | caught | 192186 passed, 1 failed |
| F7 | js/story/ashfall.js | VM: week 3's fourth morning lost | caught | 192182 passed, 5 failed |
| F8 | js/story/act1_blackroot.js | HK: the 4th and 5th win name Ya while she is away | caught | 192177 passed, 10 failed |
| F9 | js/story/house_texts.js | WT: Wen's LOW fifth dropped | caught | 192179 passed, 8 failed |
| F10 | tools/textlint.mjs | LC1: the lint no longer reads the burned music line | missed |  |
| C1 | js/story/ashfall.js | VM: week 3 shares week 1's day record, so its sequence starts where week 1 left off (the old first skipped) | caught | 192185 passed, 2 failed |
| C2 | js/story/music.js | LC1: the first draw of the loft line names the herb loft after a burn | caught | 192186 passed, 1 failed |
| C3 | js/story/music_texts.js | LC1: the burned line names a slot that is not in MUSIC_REFS | caught | Error: No reference the_hobit |
| C4 | js/story/ashfall.js | VM: a won arson night (night5_done, no burn) gets the scorched-loft line | caught | 192186 passed, 1 failed |
| C5 | js/story/ashfall.js | VM: the day before the last also drops to the old text (off by one) | caught | TypeError: Cannot read properties of undefined (reading 'd') |
| F11 | js/core/week.js | NS1: the plan stops again on every village morning of weeks 1 and 3 | caught | 192186 passed, 1 failed |
| F12 | js/story/ashfall.js | LX1: the night header names the herb loft after a burn | caught | 192186 passed, 1 failed |
| F13 | js/story/prologue.js | LX1: the eve's loft smells of mint after a burn | caught | 192186 passed, 1 failed |
| F14 | js/story/ashfall.js | T M4: the old week-3 text's smoke on every burned morning | caught | 192186 passed, 1 failed |
| F15 | js/story/again.js | NS1: a text shown today counts as an earlier day's | missed |  |

18 caught, 2 missed, 0 not applied (of 20).

## Addendum (NS-b, the owner's pick after PL's NS2)

F11 re-anchored on NS-b's line, and F16 (NS-b: a later Coil's village mornings stop the plan again) added, both run with `node tests/story.test.mjs --games 2 --workers 1`: 2 caught of 2. In all: 19 of 21 (F10 a tools fault, caught by the tools test's lint snapshot only; F15 equivalent in play).
