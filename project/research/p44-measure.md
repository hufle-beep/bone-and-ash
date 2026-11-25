# P44 measure: `roadmap-retune.md`'s older notes (2026-11-25, on v0.11.275, 1edabd3)

All on the long calendar, seed 0, `--off 0`, 100 games a model unless said. Scratch copies only; nothing here is in the game. The options: `claude/p44-options.md` (picked P44-A, 16:37).

## 1. The models as built (v0.11.275)

| Model | Act 1 mean Coil | Whole game on Coil 1 | Coil 1 dead (prologue) | Realm at Act 1's end | Taps a game | Last nights: Mei Lin |
|---|---|---|---|---|---|---|
| Careful | 4.94 | 0% | 0% | 1.00 | 1,060 | 2 |
| the Sociable | 4.97 | 0% | 0% | 1.00 | 1,234 | 5 |
| the Completionist | 1.81 | 21% | 12% | 2.00 | 995 | 1 |
| the Cultivator | 1.68 | 32% | 1% | 4.07 | 1,222 | 1 |
| the Sitter | 3.45 | 0% | 100% | 4.85 | 1,928 | 19 |
| the Farmer (10 bites by choice) | 1.81 | 20% | 25% | 2.00 | 975 | 3 |
| the Rusher | 7.75 (12% clear) | 0% | 100% | 0.00 | 385 | 0 |

Careful's rot ape 48.5% (206 fights), the Sociable's 47.8%.

## 2. The probe build (counters only; `--workers 1`)

- **Fights lost, Careful (100 games):** collectors 294 (0 HP; the tribute), the rot ape 108: **87 at the 30-round cap, 21 at 0 HP, 0 by the air stalemate**; the stalemate's warning 23 times.
- **Fights lost, the Completionist:** collectors 69, boar 6, jackals 5, the mire 3 (all at 0 HP); its 12 Coil-1 deaths are fights, none starving.
- **The return camps' clock jumps** (`act1_return.js` `toHour`, the clock set directly): to 19:00 102 times, 37,720 min (Careful; 6.2 h a pass), 54,589 min (the Completionist; 8.9 h); to 08:00 102 times, 12,240 min (2 h a pass) for both; to 06:00 never.
- **The hall from Day 19:** no bot pass is in `heart_hub` from Day 19 (they leave on the night jump). Built from each first `heart_hub` visit with the clock at Day 19 09:00, then every open meridian card or "Meditate: gather Qi" until none is open, then camp and the next morning: Careful 12 of 12 nothing open (0 h); the Completionist 8 of 8 nothing (0.1 h a pass, eating); the Cultivator 12 of 12 nothing after 6 meridian sessions in all (1.1 h a pass, 12 channels); 0 extra days stayed in any.

## 3. TH: the clock passes at the return camps (scratch: `toHour` advances, resting)

| Model | Act 1 mean Coil | Coil 1 | Hungry line (a game) |
|---|---|---|---|
| Careful | 4.94 → 4.94 | 0 → 0% | 0.4 → 6.1 (Fed 20–29: 21 → 592 in 100 games) |
| the Sociable | 4.97 → 4.97 | 0 → 0% | 0.4 → 6.0 |
| the Completionist | 1.81 → 1.81 | 21 → 21% | 0 → 0 |
| the Cultivator | 1.68 → 1.68 | 32 → 32% | 0 → 0 (endings ±1) |

The new hungry screens: `a1_end` 100, `rt_elder` 92, `rt_parley` 91, `rt_accord` 91, `rt_trio` 79 (Careful): the return's story screens with no Eat card. Closed as accepted (P44-A).

## 4. DF: the death farm (scratch: the Farmer's bites ended as a beast's kill, so each adds the bonus)

| Then plays as | Deaths at the first dawn | Bonus | Whole game on its first real Coil | Taps a game |
|---|---|---|---|---|
| Careful | 4 | ×2.00 | 100% (T2 wants 0%) | 510 |
| Careful | 10 | ×3.50 | 100% | 510 |
| the Completionist | 4 | ×2.00 | 98% (T1 wants 20–30%) | 842 |

The cost is not in these runs (the bites are free here). An estimate: about 50 taps a death (the Rusher: 385 taps a game over 7.6 Coils, dying in most of its first six). Kept open in `roadmap-retune.md`; its shapes measured anew in their own push.
