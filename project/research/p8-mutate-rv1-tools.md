| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F11 | tools/packet.mjs | the packet's cook mark never set | caught | 493 passed, 1 failed |
| F12 | tools/textlint.mjs | the lint reads only the old three | caught | 491 passed, 3 failed |
| F13 | tools/packet.mjs | the packet draws one state only | caught | 491 passed, 3 failed |
| RT1 | tools/textlint.mjs | the lint's village samples ignore the day index (only the first text of each cycle read) | caught | 492 passed, 2 failed |
| RT2 | tools/packet.mjs | the Root Road's cooked state not cooked (its name merged with the not-cooked text) | caught | 493 passed, 1 failed |
| RT3 | tools/packet.mjs | the both-away state's flags dropped | caught | 493 passed, 1 failed |
| RT4 | tools/packet.mjs | no merge by text: one block per state (the packet bloats) | caught | 492 passed, 2 failed |

7 caught, 0 missed, 0 not applied (of 7).
