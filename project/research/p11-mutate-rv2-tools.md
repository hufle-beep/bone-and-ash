| Fault | File | What it breaks | Result | Detail |
|---|---|---|---|---|
| F8 | tools/packet.mjs | PKf's filter does nothing | caught | 500 passed, 2 failed |
| F9 | tools/packet.mjs | PKs: the Drowned Wood's third camp state dropped | caught | 500 passed, 2 failed |
| F10 | tools/textlint.mjs | TG: the lint reads the wood's second camp only | caught | 499 passed, 3 failed |
| C1 | tools/packet.mjs | PKf: --week drops every state without a week (a Blackroot or Fallout scene packed with --week draws no states) | caught | 501 passed, 1 failed |
| C2 | tools/packet.mjs | PKf CLI: the --week value is taken for a scene id | missed |  |
| C3 | tools/packet.mjs | PKf CLI: every packet without --week cut to week 1 (ported after RV2) | missed |  |
| C4 | tools/textlint.mjs | TG: the later-camp samples lose their day index (the lint reads text 1 only) | caught | 500 passed, 2 failed |

5 caught, 2 missed, 0 not applied (of 7).
| C2, C3 (rerun after the CLI test took the scene-id and no-week cases) | tools/packet.mjs | as above | caught | |
