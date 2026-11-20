| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F8 | tools/packet.mjs |  | caught | 516 passed, 4 failed |
| F9 | tools/packet.mjs |  | caught | 517 passed, 3 failed |
| F10 | tools/packet.mjs |  | caught | 513 passed, 7 failed |
| F11 | tools/textlint.mjs |  | caught | 519 passed, 1 failed |
| F12 | tools/textlint.mjs |  | caught | 516 passed, 4 failed |
| F13 | tools/packet.mjs |  | caught | 517 passed, 3 failed |
| C4 | tools/packet.mjs | self pass reads only the first draft holding the run (a run first in an exclusive draft hides a later sharing one) | caught | 519 passed, 1 failed |
| C5 | tools/packet.mjs | a draft that replaces one own-scene text is no longer checked against the scene's other texts | caught | 519 passed, 1 failed |
| C6 | tools/textlint.mjs | the lint drops story day 10 (fo_mei:10, fo_ya_time:10 and their labels, sampled before this push) | caught | 517 passed, 3 failed |
| C7 | tools/packet.mjs | replaced threshold a third instead of half | caught | 519 passed, 1 failed |
| C8 | tools/textlint.mjs | result lines lose their scene in the corpus (an own-scene result run noted as another scene's) | caught | 519 passed, 1 failed |
| RV1-5 | tools/packet.mjs | C M2 undone: the packet draws no story day 8 state | caught | 519 passed, 1 failed |
| RV1-6 | tools/packet.mjs | C M1 undone: a copy silent again | caught | 517 passed, 3 failed |
| RV1-7 | tools/packet.mjs | C L4 undone | caught | 519 passed, 1 failed |
| RV1-8 | tools/textlint.mjs | C L3 undone | caught | 519 passed, 1 failed |

15 caught, 0 missed, 0 not applied (of 15).
