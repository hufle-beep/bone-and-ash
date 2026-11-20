| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F1 | js/story/act1_blackroot.js | the Root Road's fifth camp dropped (the list back to four) | caught | 193900 passed, 6 failed |
| F2 | js/story/act1_blackroot.js | the Ashen Hills' fourth and fifth in the wrong order | caught | 193901 passed, 5 failed |
| F3 | js/story/act1_blackroot.js | RF reverted: the wood's fourth camp off the raft | caught | 193902 passed, 4 failed |
| F4 | js/story/ashfall.js | the old calendar gets the six | caught | 193905 passed, 1 failed |
| F5 | js/story/ashfall.js | week 1 starts with the new three | caught | 193894 passed, 12 failed |
| F6 | js/story/ashfall.js | GW reverted | caught | 193905 passed, 1 failed |
| F7 | js/story/ashfall.js | the woman's passage in bond-speech | caught | 193904 passed, 2 failed |
| F11 | js/story/ashfall.js | week 1's fifth text changed (opener still close) | caught | 193900 passed, 6 failed |
| F12 | js/story/act1_blackroot.js | Yuki in a camp text (the brief leaves her out) (ported after RV2) | caught | 193905 passed, 1 failed |
| F13 | js/core/news.js | What's new without 0.11.238 | caught | 193905 passed, 1 failed |
| RT1 | js/story/ashfall.js | a form word in the shared first sentence (the fold names a form; the same in every form, so the equality test passes) | caught | 193905 passed, 1 failed |
| RT2 | js/story/ashfall.js | the cat's passage given the great form's place | caught | 193905 passed, 1 failed |
| RT3 | js/story/act1_blackroot.js | a time word the 19:00 camp can't hold (the camp test's ban list has no midnight/dusk/night words) | caught | 193901 passed, 5 failed |
| RT4 | js/story/ashfall.js | a day count in week 1's text (the brief's ban; no test reads the quiet texts for day counts) (ported after RV2) | caught | 193905 passed, 1 failed |
| RT5 | js/story/ashfall.js | Ya in Ashfall's first week (he has not met her; canon) | caught | 193905 passed, 1 failed |
| RT6 | js/story/act1_blackroot.js | the wood's fourth camp contradicts the hollow (dw_after stitches Ya's arm that evening) (ported after RV2) | missed |  |
| C5 | js/story/act1_blackroot.js | the wood: camp on its last day without the hollow (the wood-edge text on a night before the hollow; the hollow skippable) | caught | 191895 passed, 3 failed |
| C6 | js/story/act1_blackroot.js | the Root Road: a sixth camp on its story day (the list wraps to text 1 on the wyrm night) | caught | 189761 passed, 21 failed |
| C7 | js/story/ashfall.js | week 2 falls to the week-1 six (by the quiet key, mid-cycle) | caught | TypeError: Cannot read properties of undefined (reading 'length') |

18 caught, 1 missed, 0 not applied (of 19).
| RT6 (rerun after the TG-T6 pin took the exact text) | js/story/act1_blackroot.js | as above | caught | |
