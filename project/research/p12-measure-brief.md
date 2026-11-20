# Helper (PW1's PL): measure push 12, the rest of e, and write its options

You measure only; you change nothing in `/home/claude/bone-and-ash` (a scratch copy for any hooks: `cp -r /home/claude/bone-and-ash /tmp/p12w` without `.git`, never copy hooks back). The machine has 2 cores and the full check is running: keep runs small (the models test as below, once if you can). Read excerpts only (grep, line ranges), never whole story files. Read first: `project/research/p11-options.md` and `p11-measure.md` (the last push's options and how they were measured; copy their method, hooks and layout), `project/roadmap-e.md` (grep the open items), `CLAUDE.md` rule 1 (the options' layout).

## State
v0.11.238 (in the working copy, not yet pushed) built P11-A + D1 + RV2: CB5 (`bl_camp`: `BL_RR_CAMP` and `BL_AH_CAMP` five texts, `BL_DW_CAMP` four, one for every night the long calendar camps in each region), EVn-1 (`village_night`'s quiet night: the long calendar's first village week six texts by the quiet key, `QUIET_OLD` then `QUIET_W1`; the seventh night the first again; weeks 2 and 3 their own three; the old calendar the old three), TG (the text lint samples every region's later camps), PKs and PKf (`tools/packet.mjs`: the camps' states on their real nights; `--week 1|2|3`). The owner's pick took the camp and the first week's quiet nights past three, a non-social scene; the rule of three otherwise stands for non-social scenes (six for the social exception: the roof's later nights, the journey talks, the supper, the sunset walk). Bundle rule BN: 2–3 items a push, at most 2 Fable runs at once.

## Measure these, each a sub-item with its own numbers
- **The effect of v0.11.238:** `bl_camp` folded a game (p11: VF 5.0 each, forecast CB5 −5.0 / −5.0 / −5.0 / −5.0) and `village_night` folded (p11: 46.1 / 46.1 / 13.8 / 7.0; forecast EVn-1 −3.0 / −3.0 / −3.0 / −1.9), by index and why; the plan's stops a game (p11: read 43 / 43 / 34 / 34).
- **EVn-23** (weeks 2 and 3 a cycle of six each; a rule change): re-measure.
- **TL2 / TL4** (the talks' beats 11–12 or 11–14; past six for a social scene): re-measure.
- **What else folds most now** across the evening and the Blackroot (the top scenes by folded screens a game, with VF / SV / SD / memory), so the options cover the biggest folds left.
- **LF, the burned loft:** re-check that `loft_burned` stays at 0 games; list which texts would need a line after a burn (grep), in words only.
- **RC, the draft check's run test** (`tools/packet.mjs` `checkDrafts`): v0.11.238's build found three 5-word runs it missed (a run shared within one scene, `bl_camp`; runs in texts its samples don't draw: `wilds` "was white when it got here", `yuki_path` / `stomp_prologue` "the size of your fist"). Say why it missed each (read the code) and what a fix would be (tools only).
- **FC, LG, SNr, ST2 degree 3, BYb-t, ME:** re-check as p11 did.
Method: `node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` in the scratch copy with hooks as p11-measure.md describes (the old calendar without `--cal 7` where p11 used it).

## Write
- `project/research/p12-measure.md`: the raw numbers and how (as p11-measure.md).
- `project/research/p12-options.md`: the full layout (every sub-item first with its numbers, scope in words and Fable runs, balance and save changes, any rule change named; then 3–4 options naming their sub-items, colour-marked 🟢🟡🟠🔴 by how many screens a game each changes, saying what was measured; the recommended one marked "(recommended)" with one line why; an "Open, options later" list). Under about 6 KB.
Reply with a 5-line summary.
