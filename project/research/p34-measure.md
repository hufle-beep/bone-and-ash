# P34 — section 2: group d's (b), the smart rule's dart order and the smart bots: the numbers (2026-11-24, on v0.11.265, scratch copies only)

Scratch copies `/tmp/p34w`, `/tmp/p34s` (`git archive HEAD`); toggles by environment variable in `js/core/game.js`,
`js/story/act1_blackroot.js`, `tests/lib/smartfight.mjs`, extra tactics in `tools/lib/fightlab.mjs`. Nothing copied back.
The fight lab: `tools/fightlab.mjs --games 300` (4,819 states, 64 one-move finishes). The models: `tests/models.test.mjs --games 40 --off 0`
(long calendar, 8 models × 40 = 320 games a run). Sanity: `node tools/sanity.mjs` against `tools/baseline.json`.

## DO, the dart order (group d (c): "jackals smart 32.6% where darts win 96%")
- An artefact of the table: darts count only the states where James can sing them. Jackals: darts open in 153 of 1,553 states (9.9%).
- On the same states (darts open): jackals smart 97.4% / darts 96.7% (153); boar 74.7 / 63.7 (190); Gao 91.4 / 82.9 (35); mire 100 / 100 (15);
  collectors 73.2 / 30.5 (190). The smart rule already beats darts alone wherever both play.
- D1 darts before the blade (spear first): pooled smart 69.4 → 67.7% (collectors 73.2 → 42.1, boar 44.2 → 38.8). D2 the same, not against a
  plated first foe below bone tier 3: 69.4 → 69.4 (0 fights change). D3 darts only while the blade waits: 69.4 → 69.4.

## S, the smart bots and the Qi blast (roadmap-retune.md, v0.11.102 line)
- S1 the blast in place of the fragile knife at an armoured first foe (spear not open): pooled 69.4 → 69.1% (collectors 73.2 → 62.1,
  boar 44.2 → 46.8, Gao 79.2 → 77.4). S2 at any first foe: 69.2% (mire 73.5 → 67.6). The v0.11.102 gain (+1.1) is gone.

## WR, bots that react to the air stalemate's warning (roadmap-retune.md, v0.11.118 line)
- Models: 160 warnings, 152 fights lost by the stall: every one the rot ape at Foundation (Careful and the Sociable).
- W1 (fight on the ground, no darts, from the warning to the fight's end): 0 stall losses; the ape won Careful 30.8 → 30.3% (130 → 132),
  the Sociable 31.7 → 31.5%; Act 1 Careful 4.35 → 4.40 Coils, the Sociable 4.25 → 4.28; every other model the same.
  The lab and the tasks-test bots: 0 fights change. Sanity: 0 drifted, 0 past 5.
- W2 (on the ground only while stalled, back up after a hit): warnings 160 → 722; the ape 34.2 / 33.9%; Act 1 4.03 / 4.05 (easier).

## (b) DA2's three (v0.11.113, not picked)
- **RC** the rats call one more (a fresh rat once, when the first falls): lab rats 14 states in 300 games: smart 85.7 → 78.6%, blade
  78.6 → 64.3, random 85.7 → 78.6. Models: 134 rats fights in 320 games; only the Rusher loses more (85.3 → 73.5%, 34 fights).
- **TP** the big blow's tell from the prologue on (`isHeavy` without `inAct1`): the lab pooled smart 69.4 → 63.8%, blade 68.5 → 63.6,
  random 65.9 → 60.4; collectors smart 73.2 → 45.2%, Gao 79.2 → 76.8, boar 44.2 → 47.2, jackals 31.6 → 30.6.
  Models (Coils to clear prologue / Act 1; the whole game on Coil 1): Careful 2.10 / 4.35 → 3.88 / 4.95 (tribute Coil 2 won 90 → 0%);
  the Sociable the same; Completionist 1.75 / 1.75, 25% → 2.08 / 2.08, 0%; Cultivator 1.73 / 1.73, 27.5% → 2.00 / 2.00, 0%;
  Farmer 1.85 / 1.85, 15% → 2.10 / 2.10, 0%; Sitter 4.10 / 4.15 → 4.00 / 4.00; Rusher prologue cleared 17.5 → 7.5%; collectors won:
  Careful 47.6 → 25.8%, Completionist 59.7 → 50.0%.
  Sanity: 2 drifted (tribute C4 lost 64.1 → 86.5%, +22.4; the tasks test's collectors smart 70.8 → 44.8%, −26), 8 past 5 (the tribute's
  Coils 3–6). Tests: 3 pins change (`tasks.test.mjs` DA1 TL "not in the prologue", PA2 PT + SP "nobody is heavy there", PA2 PT the
  posture line): a heavy person doesn't posture, so Say something no longer opens on the prologue's hard hitters.
- **TA** the tell on the rot ape (`NO_TELL` empty): Careful and the Sociable 0 change (they fight it from the air; the air keeps the blow
  off); the Rusher's ape 77.8 → 55.6% (9 fights); lab (Core Formation+) 100% as before, the blade's HP left 88 → 85.
- **HA** the ape's moods: easier: Careful's ape 30.8 → 33.9%, Act 1 4.35 → 4.05; the Sociable 4.25 → 4.05; lab random 100 → 95.1%.
