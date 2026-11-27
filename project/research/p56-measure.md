# P56 measure: G5's second push, Insights' power (v0.11.287)

Measured 2026-11-27 ~18:44–19:45 from v0.11.287 (4fd6b32) on a scratch copy (`/tmp/s`); nothing in the game changed. The long calendar, the first pass, `--off 0`. Careful and the Sociable 100 games, the Completionist and the Cultivator 200.

## Scratch switches (scratch copy only)

- `INS_P`: each Insight held gives P% to its kind; kinds add up (`game.js` `insOf`).
- `INS_KINDS`: which kinds are on: `f` fight (the damage a foe's blow does to James, after DR, × (1 − P × fight Insights held); `game.js` the foes' attack in the fight round), `s` Saturation a sit (`sitGain`), `d` Fed's drain (`fedPerHour`, with the marks, the total capped at −50%), `x` skill XP (`awardXp`'s pool).
- `INS_NEXT`: an Insight counts only from the next Coil (`coil.known`, what James remembers at a Coil's start); without it, at once (its flag this Coil too).
- The kinds: fight: the tribute (`lore1`), Bone song, Ya's tracks, The founder's crime; Saturation: Realms lore, Tree lore, Saw the lights, The singing grove; Fed: The bracket fungus, Ghost-gill, Roots; XP: Hearth lore, The seed-ship.

## At once (`INS_NEXT` off), all four kinds

| P | Careful T3 | Sociable T3 | Completionist T1 | Cultivator T1 | Careful prologue mean Coil |
|---|---|---|---|---|---|
| 0 (now) | 4.98 | 4.99 | 23% | 34% | 3.94 |
| 5 | 4.95 | 4.95 | 39% | 43.5% | 3.76 |
| 10 | 4.84 | 4.86 | 44% | 47.5% | 3.45 |
| 15 | 4.75 | 4.78 | 45.5% | 52.5% | 3.29 |

T1's band is 20–30%: every level at once puts both models out (the tribute on Coil 1: the Completionist 25.6% → 46.8% won at 10).

## One kind at a time, at once, P = 10

| kind | Careful T3 | Completionist T1 |
|---|---|---|
| fight | 4.88 | 38% |
| Fed | 4.98 | 26.5% |
| Saturation | 4.97 | 23% |
| XP | 4.97 | 23% |

The fight kind moves everything; Saturation and XP move nothing measurable at these levels; Fed a little (within about 1 standard error on T1).

## From the next Coil (`INS_NEXT` on), all four kinds

| P | Careful T3 | Sociable T3 | Completionist T1 | Cultivator T1 | Careful prologue mean Coil | Careful tribute won C2 / C3 |
|---|---|---|---|---|---|---|
| 0 (now) | 4.98 | 4.99 | 23% | 34% | 3.94 | 0% / 6% |
| 5 | 4.96 | — | (23%, as built: Coil 1 holds none) | — | 3.85 | 4% / 7.3% |
| 10 | 4.91 | 4.88 | 23% | 34% | 3.60 | 7% / 28% |
| 15 | 4.88 | 4.82 | 23% | 34% | 3.50 | 14% / 25.6% |

T1 does not move by construction (Coil 1 remembers nothing). T3's band 4.38 ± 0.75: every level in, moving toward 4.38. Careful wins the tribute earlier, but Act 1 still ends on Coil 5 for most (Act 1's own deaths on Coils 3–4: 98% → 91% / 88% of Coil 4 dead at 10 / 15).

## Sizes held

- Fight: 4 Insights; Careful holds the tribute from Coil 2 (96.8% of games) and Ya's tracks and The founder's crime only after an Act 1 Coil; the Completionist holds all 4 from Coil 2 in about 90% of games. At 15% all 4 are −60% of a blow's damage; at 10%, −40%; at 5%, −20%.
- Fed: 3; with the 9 marks (−45%) the total stops at −50% (`design.md`'s cap).
- Saturation 4 (+20 / +40 / +60% a sit), XP 2 (+10 / +20 / +30%).

## Not measured (open, options later)

The 4 Insights without a scene (Root memory, Wyrm lore, Drowned rites, Cinder lore: `lore.md` has no section for three; scenes and Fable's texts), crafting, the fight ideas (stances, clean or barbed), feats, memories, and the rest of G5's list.
