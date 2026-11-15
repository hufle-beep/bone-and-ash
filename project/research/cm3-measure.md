# CM push 3 (v0.11.183): the measurements behind SG2, DU-A and RV1

## The scene reach (a scratch copy of the models test, 200 games × random, Careful, Completionist, Sociable; deleted after)

Each song's scene: the share of games that reach it, then the Coils per game that pass through it (the repeats a once-a-Coil rule would give), as given with the options.

| Song | Scene | Reach | Coils / game |
|---|---|---|---|
| Reflect | `night` (the Wilds) | 100% | 3.1–4.9 |
| The Song of Hammerdeep | `fo_elder_named` | 97–100% | 1.2–2.7 |
| Genesis | `fo_depart` | 97–100% | 1.2–2.6 |
| Boof Pack | `bl_camp` (Ya, Mei Lin, Yuki in 100%) | 97–100% | 1.2–2.6 |
| The Water's Call | `dw_enter` | 95–100% | 1.2–2.1 |
| Lyfjaberg | `ah_enter` | 95–100% | 1.0–1.9 |
| Trøllabundin | `ape_lured` | 90–100% | 1.0–1.8 |
| Music Box of Fate | `heart_view` (Ya and Mei Lin in 100%) | 86–100% | 1.0–1.1 |
| The Song of Dúrin | `heart_hall` | 86–100% | 1.0–1.1 |
| mumei | `ship_wreck` | 86–100% | 1.0–1.1 |
| Non-Fiction | `rt_camp` | 84–100% | 1.0–1.1 |
| Breathe | `rt_arrive` | 84–100% | 1.0–1.1 |
| Dwarven Forge | `rt_elder` | 84–100% | 1.0–1.1 |

The low ends are the random bot (Act 1 cleared in 167 of 200). Left out: the palisade and the workshop (card scenes, 0% as scenes) and Yuki's human scenes (0%).

## DU (the stop after D1; 160 random games, the story test's walk, scratch copies of `js/`)

Music-line days per game by stretch, and lines of the 65 never shown:

| | Wilds | Ashfall | Fallout | Journey | Return | Never shown |
|---|---|---|---|---|---|---|
| No songs (v0.11.182) | 7.97 | 2.83 | 6.74 | 7.86 | 1.00 | 0 |
| DU-B (a song takes its whole day) | 7.64 | 2.83 | 5.74 | 4.28 | 0.00 | 11 (return.* 7, journey 4) |
| DU-A (only an evening song from 15:00 does) | 7.64 | 2.83 | 6.74 | 6.86 | 1.00 | 0 |

Picked: DU-A (the owner 00:30).

## The review's walk (Opus, 160 games, `newVisit` as main.js passes it)

All 13 songs show (Trøllabundin in 155); none twice. A line before Reflect on the first Wilds night in 107 of 160 (M1; fixed by deferring `camp` while Reflect is due); Dúrin and mumei the same day in 149 of 160, Trøllabundin and Music Box of Fate in 82 (L8, a note only).
