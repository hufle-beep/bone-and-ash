# P50 measure: FC-w2, the read of the later Ashfall texts (2026-11-26, on v0.11.281, c895b07)

Scratch copy only (`/tmp/fc`: a recorder in `tests/models.test.mjs`'s view loop, from the `first_flight` screen on: every screen's text, keyed by the flight's place (`ffPlace`), the act, same or later Coil, the scene). 100 games a model, seed 0, `--off 0 --workers 2 --texts`, the long calendar; 7 min 18 s. Order: Careful / the Sociable / the Completionist / the Cultivator / Random / the Rusher. Nothing here is in the game. The options: `claude/p50-options.md` (the claude.ai project).

## Where the first flight happens (games)
village 100 / 100 / 100 / 0 / 68 / 0; alone 0 / 0 / 4 / 100 / 19 / 0 (the Cultivator at the stream; the Rusher never reaches Foundation). Every village flight follows a village breakthrough, so `sky_witness` (or Act 1's `a1_sky_seen`) is always set: 8 lines already read it.

## The read's window
The prologue's Coil of the flight and Act 1 (scenes, distinct texts): Careful 160 / 20,379, the Sociable 161 / 22,651, the Completionist 205 / 28,632, Random 211 / 14,679 (prologue scenes 38 / 38 / 63 / 58). Swept for realm, mortal, stranger, walking and flight words (`cue.mjs`); Act 1 reached with the sky remembered: the Completionist 100, Random 55.

## Lines, games of 100 shown after a village flight
| line | Careful | Sociable | Completionist | Cultivator | Random | Rusher |
|---|---|---|---|---|---|---|
| FF the flight scene (village) | 100 | 100 | 100 | 0 | 68 | 0 |
| CS `collectors_sent` "the mortal who put a man of Foundation…" | 0 | 0 | 46 | 0 | 12 | 0 |
| ER `elder` Wen names the rung Foundation (`FW.elderRung`) | 0 | 0 | 2 | 0 | 0 | 0 |
| HA `heal_again` "land out of sight" | 0 | 0 | 1 | 0 | 0 | 0 |
| LH `tribute` the runner's report (`FW.luHanSky`) | 100 | 100 | 100 | 0 | 68 | 0 |
| A1 `fo_elder_named` Wen's tea | 0 | 0 | 100 | 0 | 55 | 0 |
| A1 `rt_arrive` the street | 0 | 0 | 100 | 0 | 55 | 0 |
| A1 `rt_wen` "He will have heard of…" | 0 | 0 | 99 | 0 | 54 | 0 |
| A1 `rt_elder` Shen Qiu | 0 | 0 | 100 | 0 | 55 | 0 |
| WL `wen_lesson` the realms | 0 | 0 | 21 | 0 | 7 | 0 |
| the village's Yuki form lines (`AWAKE_A1_ASHFALL`) | 0 | 0 | 100 | 0 | 50 | 0 |

Clashes FC-w2 makes unless rewritten: CS, ER, HA (the village calling him mortal or Foundation, or him hiding). Silent (true, the sky only): LH, A1, WL. Read and kept: the tribute's whisper of Lu Han's "Foundation", Lu Han's and Shen Qiu's senses finding "a mortal", Mei Lin's "a mortal … snapped a Crimson Lotus disciple" (the Sect's view), "the stranger", the Blackroot's carried flights (none treats flight as news), the Yuki form lines.

## Built (P50-A, D1)
`sky_flew` (`first_flight`'s enter, `ffPlace === 'village'`; a world flag); FF in `FF.open.village` / `FF.close.village`; the others in `flight_texts.js` `FW2`. Fable's runs P and A (`p50-brief-p.md`, `p50-brief-a.md`, `p50-common.md`; drafts `p50-drafts-p.txt`, `p50-drafts-a.txt`); D1 as built `p50-drafts-d1.txt` (Claude's cuts: "without you", "with any sense for Qi" (the breakthrough screen before), "the whole length", the tea's opening from the alternate; ER the alternate; after the pick, "A hand's width" → "A strip" (the lint's favourite phrases, 4 scenes)). `packet.mjs --check`: tic 0; runs only with the lines replaced or the words the briefs kept.
