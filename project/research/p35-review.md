# P35-A (CT-C) cold review — Opus

Scope read: `git diff` (faq.js, game.js, news.js, tests/lib/smartfight.mjs, tests/tasks.test.mjs), `project/review-checklist.md` + `review-checklist-code.md`, excerpts of `js/core/game.js` (startCombat, traits, the round, the preview), `js/main.js` (fight cards, hold texts, target), `js/core/forms.js:70`, `js/story/prologue.js` (collectorsFight), `js/story/stomp_prologue.js` (collectors), `js/story/power.js` (prepare), `js/story/tribute_texts.js` (TT.read), canon card.

Ran: `node tests/tasks.test.mjs --games 2` on the working tree: **9828 passed, 0 failed**. `node tools/packet.mjs --check` on the 4 new texts: **0 notes** (tic 0, pair 0, run 0). A scratch fight (`/home/claude/p35work/rv/sim.mjs`: real tribute, seed 267, blade 20, guard/guard/Say something…) and a serialize/deserialize mid-fight. Planted faults: `tools/mutate.mjs … --cmd "node tests/tasks.test.mjs --games 2" --jobs 2`: **2 caught, 4 missed** of 6 (`/home/claude/p35work/rv/mutate.md`).

## What checks out
- **The gate:** `read = heavy && stanceRead(g, enc.id)`, decided once at `startCombat`; `stanceRead` needs an entry in `STANCE_READ_OF` (collectors only) and `g.stats.weapons.blade >= 20`. Gao heavy with 999 rounds: no posture. The second (Gao Feng or the disciple, dmg 4; `grow`/`longStep` never touch dmg) is never heavy, so only Lu Han is read. `bluff_fail`'s fight is the same `collectorsFight` (id collectors): read there too, as the FAQ's "at the tribute" says.
- **The preview chain** (game.js:1464–1466): heavy+postures → `bigRead`; else heavy → `bigPerson`/`big`; else postures → `SAY_TEXT.tells`. Before this push heavy and postures never met, so for every other foe the `else if` is the old behaviour; the lunge and mood lines stay separate `if`s (unchanged).
- **Say something on the read round:** UI always passes target 0 (main.js:1138 → `living[0]`), so with Lu Han alive `[target, ...living]` picks him; `flustered = 2` skips his attack this round (no big blow, no `bigLands`) and next. Sim: round 3 Lu Han silent, round 4 "still looking for the place", round 5 attacks normally.
- **Guard** still avoids the read big blow (`big && guard`, unchanged; but see TG1).
- **traitLines/traitLine:** before this push no heavy foe postured, so preferring a non-heavy posturer changes nothing in other fights; `traitLine`'s 4th argument has no other caller.
- **Bot:** `e.heavy && !e.postures` holds back only for an unread heavy; on the read round it says something (target Lu Han); spear/needle answers are overridden only by the measured rule.
- **UI:** Lu Han's tags read "hits hard · postures"; on the read round the Guard card shows "avoids the big blow" and the Say card "the speech is now" (both true). `actionOpen('remark')` unchanged (the second already opened it).
- **Saves:** no format change. A v0.11.266 save mid-tribute keeps Lu Han `heavy` without `postures` and plays as before; a new mid-fight save round-trips `postures: true` (checked).
- **Stomp / threat word:** the stomp ("End it in one move") and `plainFight` (blade only, on a copy) don't read `postures`; unaffected.
- **Texts:** no tic, no reused run; tone fits (Lu Han's "address", "lecture on standing"; James's "which you now recognise as a preamble"); "draws the red along the steel" matches the stomp's "Qi burning red down the blade"; every `{foe}` once; every warning offers both answers ("…, or guard.") as the mechanics allow.

## Findings

**High:** none.

**M1 — the first read round's screen: an echo above, a payoff on the wrong man below** (game.js:1464–1466 and the `act.remark` line 1351; texts `TELL_TEXT.bigRead[1]`, `SAY_TEXT.tells[1]`, `SAY_TEXT.landed[1]`). The first read warning of every read fight is index 1 (next = 3), and the second postures on the same round, so round 2's preview always prints (sim, seed 267):
> Lu Han **draws** the red along the steel **and a breath** to go with it. **Next round**, the big one arrives with remarks. Interrupt, or guard.
> Gao Feng lifts a chin and **draws the breath** of someone with ancestors to mention. **Next round** they get mentioned.

and Say something on round 3 (which always goes to Lu Han) prints `landed[1]`:
> "Sorry, how many generations was that? I lost count at the third." Lu Han goes back to count…

`landed[1]` was written as the payoff of `tells[1]` ("ancestors to mention"), which is Gao Feng's line; it now lands on Lu Han, whose own warning promised "remarks", while Gao, whose ancestors were announced, simply attacks. Met in every read fight where the second is still standing at round 2 and the player says something (the bot does every time). Checklist: repeated beats on one screen; a text against the screen above it. Indices 2 (next 6: "preamble"/"magistrate"/"Noted") and 0 (next 9) read fine. A text call (rule 10: Fable's lines), so options for the owner, not a fix here.

**L1 — the FAQ hard-codes the gate** (faq.js:39, "about 20 rounds"). The rest of the Fights entry builds its numbers from constants (`FOE_MEMORY_OF.collectors.step`, `WEAPON_EVERY_OF.collectors`); `${STANCE_READ_OF.collectors}` would keep it true. (The test pins both "20"s, so a change would fail loudly rather than drift silently.)

**L2 — "one you have practised with your own blade… you can read it now"** (`FOE_TRAITS.heavy.read`). On Coil 1 the 20 rounds come from the jackals, the boar and spars, and James meets Lu Han for the first time: the line claims he has practised Lu Han's own stance (the stomp calls it "a sword-form older than he is", a Sect form), a small new fact, and "now" reads as a second look. WEAPON_EVERY_OF's own wording ("his sword-form reads like the blade you practised") is the safer claim. On the Cultivator path (`reads > 0`) the intro's `TT.read` ("His eyes are better trained: they go to where your weight rests…") sits just above it: two "reading" beats in a row, possibly a deliberate mirror; worth one render.

**L3 — the shared posture round silences only Lu Han, and the player can't choose** (game.js:1350; main.js:1138 passes target 0). On every read round both foes posture; Say something takes Lu Han's big blow away but Gao/the disciple attacks with James unguarded (sim: GU 0.5 against 2.5 guarding). This is the existing rule (one speaker per Say something), and measured into the 20% / 20%, but the hold text "A speech is coming this round: say something and it never finishes" reads singular. Info only; no change suggested beyond the owner knowing it.

**L4 — `traitLines`' fallback for a lone read foe** (game.js:1227): if the only posturer is the read heavy foe, the postures line falls back to him and he gets both the read line and "came with things to say about face". Unreachable today (the tribute always has two foes; `STANCE_READ_OF` has only collectors). Noted in case `STANCE_READ_OF` grows.

## Test gaps
- **TG1 (R1 missed):** Guard on the read round is not pinned. The What's new line says "Guard still works"; a fault that lets the read big blow through a guard passes all 9,828 tests (every guard-vs-big-blow test uses a non-posturing heavy foe). Add: `rd` at round 3, `guard` → `bigAvoided` for Lu Han, no `bigLands`.
- **TG2 (R2 missed):** only `bigRead[1]` (next 3) is pinned; fix the index at 1 and nothing fails. Add rounds 5 and 8's previews (indices 2 and 0).
- **TG3 (R6 missed):** the second's own speech warning on the read round is not pinned (the block asserts only that no posture line names Lu Han). Add: `r2.lines` includes `SAY_TEXT.tells[1]` for the second; and on round 3 after Say something, the second still attacks (R3 was caught, but by an older test, not this block).
- **TG4 (R5 missed):** the block's comment says "a heavy Gao with any practice, and Act 1's elder, still show the big blow alone", but only Gao is built; making the elder read too passes. Add the elder (Shen heavy, `act1`, blade 999) to the Gao assert.
- **TG5:** `rd.james.hp <= hp0` ("HP never rises in a round") pins nothing in this fight (no healing at this realm); the real check (no big blow) is the line above. Better: James's HP loss on round 3 equals the second's hit alone (or ≤ one unguarded Gao hit).
- **TG6 (pre-existing):** the fight texts (`TELL_TEXT`, `SAY_TEXT`, `FOE_TRAITS`) aren't in `tools/textlint.mjs`'s POOLS, so `bigRead` and `heavy.read` get no tic / reused-run lint in `check.sh`; today only a one-off `packet.mjs --check` (clean) covers them. Checklist-code TG4 ("new text pools join textlint's POOLS").
- **TG7 (note):** R4 (gate 20 → 21) was caught, but by a TypeError (James dies on the unguarded round 3, `rd.combat` is null) after the first failed assert, not by a clean failure; harmless, but a guard (`rd.combat &&`) would keep the report readable.

## Planted faults (run: `node tools/mutate.mjs review-faults.json --cmd "node tests/tasks.test.mjs --games 2" --jobs 2`)
R1 missed, R2 missed, R3 caught (1 failed), R4 caught (TypeError), R5 missed, R6 missed. The JSON is in `/home/claude/p35work/review-faults.json`:

```json
[
 {"id":"R1","file":"js/core/game.js","find":"if (big && guard) { lines.push(foeFill(TELL_TEXT.bigAvoided, e.name)); continue; }","replace":"if (big && guard && !e.postures) { lines.push(foeFill(TELL_TEXT.bigAvoided, e.name)); continue; }","note":"Guard no longer avoids a read stance's big blow (What's new: 'Guard still works'); the new block never guards on the read round"},
 {"id":"R2","file":"js/core/game.js","find":"TELL_TEXT.bigRead[Math.floor(next / TELL_EVERY) % TELL_TEXT.bigRead.length]","replace":"TELL_TEXT.bigRead[1]","note":"the read warning never cycles (only index 1, round 3, is pinned)"},
 {"id":"R3","file":"js/core/game.js","find":"if (pe) { pe.flustered = SAY_ROUNDS;","replace":"if (pe) { for (const x of living) if (postureDue(c, x)) x.flustered = SAY_ROUNDS; pe.flustered = SAY_ROUNDS;","note":"one Say something silences Lu Han AND his second on the shared posture round (balance: both attacks gone two rounds)"},
 {"id":"R4","file":"js/core/game.js","find":"(g.stats?.weapons?.blade || 0) >= STANCE_READ_OF[id]","replace":"(g.stats?.weapons?.blade || 0) > STANCE_READ_OF[id]","note":"control: the gate off by one (21 rounds)"},
 {"id":"R5","file":"js/core/game.js","find":"export const stanceRead = (g, id) => STANCE_READ_OF[id] != null &&","replace":"export const stanceRead = (g, id) => (STANCE_READ_OF[id] != null || id === 'elder') &&","note":"Act 1's elder (Shen Qiu) reads too with blade practice; the block's comment names the elder but only Gao is tested"},
 {"id":"R6","file":"js/core/game.js","find":"else if (e.postures && next % TELL_EVERY === 0) lines.push(","replace":"else if (e.postures && !c.enemies.some((x) => x.heavy && x.hp > 0) && next % TELL_EVERY === 0) lines.push(","note":"the second's speech warning vanishes while a heavy foe stands (the new block never checks the second's tell on the read round)"}
]
```
Each `find` occurs exactly once in the working tree (checked).

## New kinds of fault for the checklist (suggested)
- **A foe given a second trait that shares a round with another foe's (P35-A M1):** render the shared round's preview and the reply under it with both foes standing; a reply pool indexed like a tell pool (`landed[i]` ↔ `tells[i]`) pays off whichever foe the action hits, not the one whose tell set it up.
