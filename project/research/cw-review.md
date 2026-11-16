# Cold review: v0.11.197 (C1 + D1), walks with company

Read: the diff, the brief, the checklist, packets (`/tmp/c1/packet.md`, `/tmp/c1/rv-packet.md` for the other 13 walks), and grep/line ranges. Scratch only: `/tmp/c1/rv/sim.mjs` (every marked walk with the party at realm 1 / 2 / Mei Lin 10), `/tmp/c1/rv/split.mjs` (all 14 lines through `splitLine`).

**H: none.**

## M

**M1. `rt_brawl_won` [0] runs in Ashfall with Mei Lin absent** (js/story/walks.js:64; js/story/act1_return.js:523). The party flags are never cleared once set (fo_mei_insists, fo_depart, bl_start, rt_start), so they are still set on the village days after the Return. "Back to the preparations." (wine shop → `rt_ashfall`, 30 min) takes the party rule. Mei Lin isn't in `rt_ya_village` / `rt_brawl_*` (Ya, Bao, the cousins), but the line carries her ("You carry Mei Lin…", "Mei Lin rides in your arms…") or has her turn him down ("You offer to carry Mei Lin…", "I have two feet…"). At Foundation the 30 min is now walked "the four of you together" (sim: 30 min, yuki line); before C1 it was a 15-min solo flight. Careful, Completionist and Sociable get this every time. The FAQ's "while Mei Lin and Ya travel with him" doesn't fit it either. Fix: mark the row `'alone'` (he flies back, Ya stays at the wine shop), or have `partyCarry` skip walks inside Ashfall.

**M2. The pools ignore the scene they follow: `dw_drowned_won` [0] and `ape_won` [0]** (walks.js:40, 43; act1_blackroot.js:671, 963). At `dw_drowned_won`, Mei Lin has just been dragged out half-drowned and Ya's forearm is "opened from elbow to wrist", under a label that has James getting them both out. The pools then give "Ya rides Yuki and whoops at every turn", "'Faster,' says Ya", "'Stop kicking'". On foot it is "'I'm not luggage, scholar.' … brisk and offended", or Mei Lin "thanks you, with her whole spine, and walks". At `ape_won`, Ya has just knelt over the rusted spear-head while "nobody hurries her", and the next line is her whooping. Fix: give `dw_drowned_won` its own carried and on-foot line (a rescue would plausibly carry them whatever the meters, which is the owner's call), and pick a quiet line for `ape_won` (great[1], human[0], yuki[0] and mei[0] read calm). (`log_comfort` [0], the morning after the grief night, is milder; it's the same issue.)

## L

**L1. Walks against crossings on adjacent screens** (faq.js:40; act1_return.js:176, 214–225). At Foundation, `rt_wolves_won` [0] "Down to the river." is walked ("a cat carries what a cat carries" / "declines to be cargo"). The next screen, `rt_ford`, flies the ford and "ferry[s] the rest over… one trip each", and `rt_ambush` goes "with your company in tow", with no meter or realm gate. The FAQ states both rules next to each other ("whoever is with him can't fly, so he ferries them" / "flown only if they can come too"). Fix (my words): add to With company "a crossing is danger: there he ferries them anyway".

**L2. The FAQ and What's new don't use the constants** (faq.js:40; news.js:50). The FAQ prints `${CARRY_F}` for both meters (`CARRY_A` isn't imported), and the news line hard-codes "30". If either bar changes, both texts go wrong without a test failing (R12–R14 missed). Fix: "friendship ${CARRY_F} and affection ${CARRY_A}" (or one constant), plus a test.

**L3. Three lines carry most of the load.** Yuki is checked first, so below realm 2 every company walk draws from `FOOT_LINES.yuki` (3 lines). That covers every company walk for Careful, Completionist and Sociable (carried 0%; realm at Act 1's end 1.00 in check-build.log): up to 16 walks a Coil, so each line about 5 times a Coil, and again on every Coil. The `mei` and `ya` refusals only show from realm 2 (Cultivator, Sitter). Fix: more yuki lines, or a per-Coil turn.

**L4. "Ya denies nothing"** (story.js:214). Yuki's "*She steers by the ears*" goes through the bond, which Ya can't hear, so "denies nothing" reads as if she was accused aloud. The deadpan may carry it. Optional word fix (mine): "Ya, who can't hear it, denies nothing."

**L5. A repeated beat** (story.js:235). `ya`[1] ends "Yuki says nothing, pointedly.", the same four words that open a memory line at again.js:77 ("Yuki says nothing, pointedly. The bond carries…"). That's under the 5-word run limit, so the check passes. Word fix (mine): "Yuki's silence has a point to it."

**L6. A dead fallback** (story.js:240; game.js:478). `CARRY_LINES[carry.ya || 'great']` gives Ya-on-Yuki lines when only Mei Lin is along, and `partyCarry` handles Mei-only and Ya-only. Every place that sets the flags sets both (act1_fallout.js:716, 803, 813; act1_blackroot.js:288; act1_return.js:100), so this can't happen today. Fix: a comment or assert that the flags go together.

## Checked, fine
- Both time spots: `c.time` and the default move minutes after `go` share `walkTime`. `carry` is read before `go`, and the destinations' `enter`s don't change it (`rt_start` sets flags already set since `bl_start`).
- `walkOnly` keeps out task mode, checks, Qi, `do`, fights and hauls.
- Mortal James: no line, full time.
- `alone`: `hot_spring` [2] is flown, with FLOWN_LINES.
- `lore` stays unmarked.
- `fl === t0` at FLY_MIN gives no line and no turn.
- Ashen Hills, Ya away: no marked walk leaves `ah_hub`, and the day-5 `bl_morning` text has Ya present.
- Heart indoors: the lines say "air" or "flown", never sky.
- Forms: the yuki pool only shows below realm 2 (cat on the shoulder). Great-form speech is in italics (bond), human-form speech is aloud. Canon is kept: "scholar", "a head shorter", "tail".
- No time words.
- `splitLine` puts the whole line in the reply with an empty gain, as FLOWN_LINES do.
- The lost-fight walks (`dw_drowned_lost`, `rt_wolves_lost`…) are cut off in Act 1 by the Coil's lose hook (coil_scenes.js:117).
- Long Forest walks: the party flags are never set in the prologue.
- What's new matches the code apart from L2.

## TG (test gaps)
Mutate: `/tmp/c1/faults-review.json`, 14 faults, default command (story test): **1 caught (R11, a control), 13 missed** (`/tmp/c1/mutate-review.md`). Extra runs: R12–R14 against `faq.test` + `news.test`, 0/3 caught; R1–R2 against `tasks.test`, 0/2 caught.

- **TG1. The second time spot is untested** (R1, R2 missed by the story and tasks tests). Five of the 17 company walks use it: `ht_leave` [0] and `bl_morning` [0]–[3]. Add `ht_leave` [0] to the C1 walk loop, carried and on foot.
- **TG2. The lines' words** (R4–R10 missed: who James carries, "a head taller", the cat "at your knee", "three of you", bond speech to Ya, the great form "says aloud", {min}/{walk} swapped inside one line). PINS pin one phrase per line, and the walk asserts build their expected text from the same constant. Pin the form-bound words ("You carry Mei Lin", "from your shoulder", "the four of you", "aloud", `*She steers`, "a head shorter"), and assert {walk} before {min} in FOOT_LINES and {min} before {walk} in CARRY_LINES.
- **TG3.** R3 (raw `g.yuki.form` instead of `yukiForm`) was missed. Assert that `party(2, { form: 'human' })` is `great`.
- **TG4.** The FAQ and What's new numbers (R12–R14) are unpinned: assert CARRY_F, CARRY_A and `realmName(2)` in the With company text, and the bar in the 0.11.197 note.
- **TG5.** CARRY_LINES and FOOT_LINES (like FLOWN_LINES) aren't in textlint's POOLS (tools/textlint.mjs:140), so every check runs without the tic and reused-run checks on them (this is how L5 slipped through).
- **TG6.** No test for a company walk in Ashfall after the Return (M1), or a real path with `goTo` (the block fakes the flags on a fresh state).
