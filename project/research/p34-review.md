# Cold review: v0.11.266 (P34-A: TP + W1)

Reviewer: Opus helper, had not seen the build. I read /tmp/p34.diff and excerpts of game.js, smartfight.mjs, faq.js, news.js, power.js, prologue.js, ashfall.js, longforest.js, main.js and the smart-bot callers. The repo was not edited. Scratch sims are in /tmp/p34sim (outside the repo).

**Counts: High 0 / Medium 2 / Low 3.**

## Checked and found correct
- **TP gate.** No other `inAct1` gate assumes tells are Act 1 only. The only other one is `airFights`, which is unrelated. The Guard card's tag and its hold line (`bigBlowNow`, main.js:406/886) don't depend on the act. Lu Han's net (`netted`) doesn't interact with `heavy`.
- **Spars and brawls.** `!enc.style` still keeps them out. That covers Ya, rt_brawl and the arson spars.
- **Lunge.** No prologue foe with `prefersSmall` has dmg ≥ 5 (jackals 4, rats 3, crows 2), so the heavy-plus-lunge double tell can't happen there.
- **Flee and one-move finishes.** Neither reads `heavy`. A failed run doesn't advance `c.round`, which was already true before this push, so a shown blow stays due. That's harmless.
- **No dmg scaling.** `grow`, `longStep`, `lfScale` and `prepare` never touch dmg, so who is heavy follows the base dmg. In the prologue that is:
  - Lu Han (5)
  - the Ironhide boar (5)
  - the Thornback bull (ashfall.js:94, 5)
  - the five Long Forest trials: Ossuary Wyrm 6, Bog-Mother 6, Thunder-horn Ram 7, Heartless 7, Fang Wei 5
  - Gao, the disciple, the jackals and the wolves are not heavy (4).
- **What's new ("Lu Han … and the Ironhide boar among them") and FAQ: both true.** The tribute keeps Say something, because Gao and the disciple still posture.
- **The bot and posture rounds.** Posture rounds and big-blow rounds always coincide (both `round % 3`). So the smart rule, which doesn't say something while a heavy foe stands, gives up nothing at the tribute. My sim (720 tribute states, a bot that says something whenever no blow is due) gave 50.0% against 50.0%.
- **W1 across clones.** `g.combat` is created fresh in `startCombat` (game.js:1172) and never replaced mid-fight. No caller of `smartAction` clones `g` mid-fight: fightlab, models, story, part, snap and packet all clone before `startCombat` or not at all. The latch survives `combatFlee` resetting `stall` to 0.
- **W1 rule order.** Ground → a due blow gets spear/needle/guard → hungry: guard → no air darts → needle → field and shield → flail → spear → blade → no last-resort dart → guard. The grounded state needs a Foundation air round with darts open (T1 L8+), so the fragile-knife guard-loop case isn't reachable.
- **Round cap.** Rot ape at Foundation, realm 1, T1–T3 L8/L10, 360 fights: 120 won, 240 lost on HP, 0 at the round cap, 0 stalemates. A grounded bot doesn't drift into the cap.
- **Saves.** No new save field. `heavy` and `postures` are written into `g.combat` at fight start, as before. A mid-fight save from v0.11.265 keeps its old flags, which is harmless.

## Medium

**M1. The Long Forest is newly in TP's scope, and that wasn't measured, pinned or announced.** game.js:1232 (`isHeavy`), longforest.js:67–75.
- The Long Forest is pre-prologue and was never Act 1, so its five "major" trials had no tells before. Now they do, and `lf_rogue` (Fang Wei, dmg 5, a lone person) no longer postures, so **Say something never opens in that fight**.
- p34-measure.md has no Long Forest numbers: the lab and the models don't play it. No test covers it (R2 missed). What's new names only the prologue.
- My sim: smart bot, realms 0/1/3, T1–T5 L3, 480 fights per trial. Win rates didn't change. HP lost on a win, old → new:

  | Trial | Old | New |
  |---|---|---|
  | Ossuary Wyrm | 12.1% | 8.5% |
  | Bog-Mother | 3.6% | 1.8% |
  | Thunder-horn Ram | 5.5% | 2.7% |
  | Heartless | 5.5% | 2.7% |
  | Fang Wei | 4.5% | 5.6% |

  The beasts get easier for a bot that guards on the shown round. Fang Wei gets harder because Say something is gone.
- Failure scenario: a player in the Long Forest meets Fang Wei, has no Say something, and gets a stance tell nobody announced.
- Fix: tell the owner it's in scope, since this is a canon/scope call outside the measured numbers. If it's kept, add a pin that `lf_rogue` is heavy and has no remark, and one line in What's new ("and in the Long Forest's trials"). If it isn't kept, gate on `!g.flags.longforest`, which is a separate pick.

**M2. The W1 latch's "per fight" scope is tested only on a fresh game.** tasks.test.mjs:713 (`g2 = mk(...)`).
- The "a new fight starts in the air" assertion builds a new `g`. A latch keyed on `g` instead of `g.combat` passes every test (R1 missed).
- With such a latch, every later fight in a story or model game, after the first warning, would be fought with no darts. In the models that means the rot ape and every Foundation+ air fight, so the bots' numbers would shift silently.
- Fix: after the ape fight, call `startCombat` again on the **same** `g` and assert `!onGround(g)` and that the bot darts. Optionally do the same after a `combatFlee` failure.

## Low

**L1. No test pins the real prologue fights as heavy.** tasks.test.mjs TL/PT use synthetic `brute`/`man` foes. Adding 'collectors' and 'boar' to `NO_TELL` passes the tasks test (R3 missed), even though What's new names both fights. The full check's sanity drift would probably flag it, since the collectors' smart win rate goes back to about 70.8 from 44.8. Fix: build the real collectors encounter (via `SCENES` and `prepare`) and the boar's, then assert Lu Han and the boar are heavy and Gao and the jackals are not.

**L2. A stale comment.** game.js:1054 (the NO_POSTURE doc) still says "Act 1: its stance is its big blow; in the prologue nobody is heavy." Fix: change it to "a heavy foe's stance is its big blow (from the prologue on since v0.11.266)".

**L3. The What's new line isn't pinned (R4 missed).** The FAQ change is pinned (F10). Fix: a one-line assert that the 0.11.266 note says "from the prologue on". Text only, so optional.

## Test gaps in brief
- M2's same-`g` second fight.
- L1's real encounters.
- M1's Long Forest pin.
- The story test was not run (about 20 minutes): nothing above needed it.

## Planted faults
Run: `node tools/mutate.mjs /tmp/p34sim/faults.json --cmd "node tests/tasks.test.mjs --games 20" --jobs 2`.

| Fault | File | What it breaks | Result |
|---|---|---|---|
| R1 | tests/lib/smartfight.mjs | the latch keyed on `g`, so later fights stay grounded | **missed** (M2) |
| R2 | js/core/game.js | the Long Forest left out of TP | **missed** (M1) |
| R3 | js/core/game.js | `NO_TELL` += collectors, boar | **missed** (L1) |
| R4 | js/core/news.js | What's new says "from Act 1 on" | **missed** (L3) |
| R5 | tests/lib/smartfight.mjs | Say something while a heavy foe stands | caught (1 fail) |
| R6 | js/core/game.js | prologue people not heavy, beasts are | caught (3 fails) |

2 caught, 4 missed, 0 not applied (of 6).
