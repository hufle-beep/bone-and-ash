# P33 — section 2's RA1 line, MF and group d's line on the long calendar: the numbers (2026-11-24, on v0.11.264, scratch copies only)

Scratch copy `/tmp/p33w` (`git archive HEAD`); probes in its `tests/models.test.mjs` (every door card, the lost and fled scenes and the
screen after them, the friendships and the palisade at Act 1's end) and `js/core/story.js` (every story check: scene, choice, value,
DC, result, the choice's picks). Nothing copied back. A clean copy `/tmp/p33c` for Careful with and without `--texts` (the same numbers).

## Bot models (`tests/models.test.mjs --games 40 --off 0`, long calendar: 320 games, 8 models × 40)
- Lost night scenes: 0 `night_lost`, 0 `jackals_lost`, 0 `bl_night_lost`. A lost beast fight in a Coil ends the Coil
  (`coil_scenes.js` `combatHooks.lose`: not a people fight and the Coil active), so the three scenes are reached only off a Coil (the
  prologue's ending taken, Act 1 won), where no night fight happens. Seen instead: `jackals_fled` 284 (HP 100% in and out),
  `collectors_lost` 249, `gao_fled` 92, `boar_lost` 64, `gao_lost` 52.
- Story checks: 18,049 story-choice checks (15,500 full, 446 partial, 2,103 failed; 1,993 more in task cards, not counted). Fails by the
  choice's earlier picks: first pick 1,142, second 402 (1,544 of 2,103: out of any familiarity rule's reach), Practised (2–7 earlier)
  351, Skilled (8–17) 136, Mastered (18+) 72. Most fails: `bone_field` 786 (Random, the Sitter), `hollow` 350, `rr_end` 274 (Careful
  138, the Sociable 134), `hunt` 188, `hunt_miss` 154, `collectors_won` 126.
  DC eased by the earlier picks' tier (2 / 8 / 18): −0.5 / −1 / −1.5 → 152 pass (144 fails, 8 partials; 0.48 a game; `rr_end` 104,
  `hollow` 18; Careful 54, the Sociable 50); −0.25 / −0.5 / −1 → 0; −1 / −1 / −2 (the cards' own steps) → 326 (1.0 a game; hunts 129).
  A failed `rr_end` bridge leads into the root-wyrm fight (won 100% in the fight lab, 58 states).
- Friendships at Act 1's end (p50 / p90; Random and the Rusher only games that end): the mother Careful 78 / 90, Completionist 90 / 98,
  Cultivator 84 / 89, Sitter 80 / 95, Sociable 76 / 87, Random 107 / 150, Rusher 43 / 65; 287 of 287 ends at 30 or more (the
  kitchen's take-over, `kitchen.js` KG 30), lowest 35. Old Wen: Careful 39 / 45, Completionist 83 / 88, Sociable 40 / 45. Yuki:
  Careful 5, the Sociable 5 (their own rule), the rest 50–146.
- Door cards a game: Careful 0.9 (eat with the others), the Sociable 141.2 (the talks), the Completionist 367.4.
- The palisade (`g.flags.palisade`) at Act 1's end: 0 in 17, 1 in 13, 2 in 257, 3 in 0 (0 of 15,352 logged screens past 2).
- Gather Qi a game (the bots' own cards): Completionist 14.9 h, Farmer 15.3, Cultivator 26.8, Careful 31.1, Sociable 32.4, Sitter 71.9.
- Careful (40 games): Act 1 Coils 2 and 3 dead 100%, Coil 4 35%, Act 1 on Coil 4.35; the rot ape won 30.8% (130 fights, every Act 1
  death); realm 1.00 at Act 1's end: P25-A's ape below Core Formation (v0.11.255, about 4.5 Coils). `baseline-long.json` (2026-11-22)
  predates it (rot ape 100%, n 200); log only.

## Direct probes
- TG-LR: every story choice whose fight loses into one of the three scenes (`night_attack`, `night_attack_forced`, `night_event` × 3,
  `night_lizard_forced`, `bl_night_event`'s Fight with `bl_ev`), in both acts, lost at 1 HP to an unbeatable foe: `coil_end`, why
  `beast`; off a Coil (`ending` paid, `a1_outcome` accord): the fight's own lost scene.
- TG-PC: on the Fallout's hub both palisade cards show; after the song (palisade 1) only the teaching; after it (2) neither, on the next
  day, Day 59 or Day 70. The scene itself has no cap (a direct `goTo` passes 3), unreachable in task mode.

## The fight lab (`tools/fightlab.mjs --games 200 --min 20`: 200 tasks-test games, 3,229 states, 42 one-move finishes not counted)
- Smart: jackals 32.6% (1,029; darts 96.0%, spear 100%, blade 33.2%), boar 44.7% (266; darts 67.7%), collectors 71.2% (132; blade /
  guard / spear 65.8% on the same 76 states), mire 72.6% (277; darts 100%), Gao 78.6% (70), rot ape 100% (67; needle 58.2%, blast
  68.7%), elder 100% (22; needle 72.7%); every other fight 100%. Too few: crows 9, lizard 5, rats 12, night wolves 18, root husks 18.
- Flags: 16 of 23 won at least 99% under every tactic; one tactic ≥ 99% while another < 90%: 2 of 18 (elder, rot ape: the needle);
  guard + blade never better than the blade alone 18 of 18; the blade best or within a point 18 of 18; the quickest alone: darts 8.

Options and the pick: `claude/p33-options.md` (P33-A, the owner 2026-11-24 02:58).
