# Bone and Ash — history, part 7

Started 2026-11-07 (v0.11.45), when `history-6.md` reached about 45 KB. Newer than `history-6.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.47 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.44: E step 1, P2 (owner 18:54 "Next: E, step 1, convert the Act 1 part test to Incremental Mode so the dice core can go. Options first"; options P1 / P2 / P3; 18:58 "P2, go"):**
  - **Found before the options:** with dice off and nothing else changed, 6 scenes were unreached (`fo_spy_fled`, `fo_wolf_forced`, `rt_serpent_forced`: checks a GU T1 L7 James never fails; `rt_serpent_lost`; `guardian_won`: the guardian 0%; `ya_romance`: luck, once in 1,000 runs with dice); the walks no longer fall into prologue scenes. The bots' strength at each part's entry (300 games each of Random, Careful, Completionist, v0.11.43; GU / Convergence as tier.level, p10 / p50 / p90): fallout GU 1.8 / 1.9 / 2.4, Conv 1.5 / 1.6 / 1.8, realm 0 / 0 / 1, Yuki fight 4 / 8 / 9; Blackroot GU 1.10 / 2.3 / 2.7, Conv 1.6 / 1.7 / 1.9, realm 0 / 0 / 1, Yuki 2 / 7 / 10; heart GU 2.10 / 3.3 / 3.9, Conv 1.10 / 2.2 / 2.7, realm 1, Yuki 4 / 8 / 10; return GU 3.2 / 3.5 / 3.10, Conv 2.1 / 2.5 / 2.9, realm 1 / 1 / 2, Yuki 3 / 8 / 10. The old fixed James (GU T1 L7, Conv T1 L5, Yuki 3) is far weaker from the Blackroot on.
  - **P2 (picked):** `tests/part.test.mjs` plays Incremental Mode; `BANDS` (the numbers above) give each run low / middle / high strength (3 / 5 / 2 in 10), full HP and Qi (the old fixture kept `newGame`'s bars, 21 of 44 HP once stronger). Test-only runs: 3 in 40 fail their checks on purpose (they take an open check half the time, by a hash of run and step, since `rnd`'s picks run in step with `run % 40`; the check's skill is set to T1 L1 for that one pick, then put back: 2 fail GU checks, 1 Convergence ones too); 1 in 10 arrives hurt (1–20% HP, as before); 1 in 40 hurt with the old fixed James; in the return part 1 in 40 a T1 L1 James who also fails GU checks (the only James who loses the ford serpent: GU T1 L7 at 1% HP still wins it in 2 rounds); not in the heart (a James who can neither win a fight nor pass a check loops on the roots forever); 1 in 40 after the fallout with Ya's affection at 86 (`ya_romance`). The fights' win rates count the bot-like runs only. P1 (fixed James plus 3 groups) and P3 (drop the walks) not picked.
  - **The first numbers (bot-like runs, 1,000 walks a part):** the fallout 100% (palisade wolf, Ya's brawl, the sect watcher); the Blackroot 97–100% (the root wyrm 97%, the bone elk, the drowned, the night serpent, the night drowned 98%); the heart: the root husks 100%, the husks 100%, the guardian 84%; the return: the wolves, the elder, the brawl 100%; the ford serpent is met only through a failed check. A hurt James (1–20% HP) at bot-like strength won every return-part fight (the elder 52 of 52 at 5–8 HP). For E's retune.
  - **Checks (tests and docs only, rule 2):** the four part tests (0 failed each, about 1–2 s) and `bash tools/check.sh quick`. How it touches the rest: only the part test changed; it now needs `setNoDice(true)`, so step 2 can take the dice code out.
- **The art (18:54):** not home yet; ask again after this push.

### Version note

#### v0.11.44 — E step 1: the Act 1 part test in Incremental Mode

- **tests/part.test.mjs:** no dice; `BANDS`; the test-only runs; full bars; the win rates of the bot-like runs. **tests/README.md:** its row and the v0.11.44 line. **project/roadmap.md** (E step 1 done; the two checks after E), **changelog.md, restore-points.md, history-6.md** (v0.11.41's decisions and note moved). **sw.js:** VERSION (no game change).
- **Checks:** the four part tests and `bash tools/check.sh quick` (results in the decisions block).

## Moved from the handover in v0.11.46 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.43: H2, the handover trimmed (owner 18:45 "trim the handover reasonably to keep everything important. there might be times when I cannot upload despite working"; options H1 / H2 / H3; 18:49 "Go with your recommendation, also give me the new rules to paste" = H2):**
  - **Why:** the handover was 72 KB; Claude's project tool reads a file in one go only up to about 25k tokens (about 60 KB), so it could not upload it. Where the size was: the version chain 12.7 KB, decisions older than the last three versions about 15 KB (they should already have moved), the files table, the checks and the rules as implemented about 14 KB.
  - **H2 (picked):** the version line names the current version only; the PRIORITY section, the decisions of v0.11.29–v0.11.40 and their notes, the rebalance plan, the tabled art block, the "Next after…" notes, the 2026-11-06 decisions and the v0.11.40 version note moved word for word to the new `history-6.md` (part 5 is at 40 KB); the files table, "Run every check", the workspace gotchas, "Rules as implemented" and the v0.4.0 balance notes moved word for word to `reference.md` (the dice-era lines marked there); an Open items list keeps everything still open from the moved blocks. The working rules: the handover under about 35 KB, the current version only on the version line (`CLAUDE.md` rule 5, `working-agreement.md`). H1 (keep the files table, about 45 KB) and H3 (only the version line, about 59 KB) not picked.
  - **The project's Instructions field:** the owner pastes `CLAUDE.md` (given in chat at 18:5x) into it; Claude's tools can't edit that field.
  - **Uploaded by Claude after v0.11.42 (owner 18:42):** roadmap, changelog, restore points, working agreement (with "50 samples", committed here), design, `history-5.md` (new in the project), `claude/CLAUDE.md`; the project's copies had stood at v0.11.27. The handover and `reference.md` were sent as files (the handover too big then).

### Version note

#### v0.11.43 — H2, the handover trimmed

- **project/handover.md:** trimmed (the decisions block). **project/history-6.md** (new): the moved blocks, word for word. **project/reference.md:** the files table, the checks, the gotchas, the rules as implemented. **CLAUDE.md** rule 5, **project/working-agreement.md:** the handover rule; "50 samples". **project/roadmap.md, changelog.md, restore-points.md.** **sw.js:** VERSION (no game change).
- **Checks (docs only, rule 2):** `tools/consistency.mjs` (versions, offline files) and `bash tools/check.sh quick`. Nothing outside the docs reads them except the consistency check (the **Version:** line, kept).

## Moved from the handover in v0.11.45 (word for word)

### From "Decided in chat (2026-11-07)"

- **v0.11.42: B1 and rule 8 (owner 18:42 "not home yet, go with B1. you can upload the docs yourself this time. In fact ask every time if you should upload them or I should. make it a hard rule"):**
  - **B1:** `tools/sanity.mjs` `MIN_N` 100 → 50: 152 numbers compared (was 143), 0 drifted; one more log-only move: tribute C6 paid 35.8 → 29.3% (n 95 → 99). `design.md`: Intuitive Aptitude as built (+0.5 a setback, up to +2; the engine's rule K is a first try −2) and the dampening on technique Qi costs only.
  - **Rule 8 (hard rule, owner 18:42):** after every push Claude asks whether it uploads the changed docs to the claude.ai project itself (its project tool, about 35k tokens a push) or sends them as files for the owner (M1). `CLAUDE.md`, `working-agreement.md`. The project's Instructions field needs the new text: the owner pastes `CLAUDE.md` into it (Claude's tools can't edit that field). For this push the owner chose: Claude uploads (v0.11.41's and this push's docs).
  - **Checks (tools and docs only, rule 2):** `tools/sanity.mjs` on the full 1,000-game stats of v0.11.41 (byte-identical to today's game): 0 drifted; `bash tools/check.sh quick`: passed. How it touches the rest: only the drift step reads `MIN_N`; numbers between n 50 and 100 can now fail the check at ±20 (none is near).
- **The art (18:42):** not home yet; ask again after this push.

### Version note

#### v0.11.42 — B1: drift from n 50, design.md, rule 8

- **tools/sanity.mjs:** `MIN_N` 50. **project/design.md:** Intuitive Aptitude and the dampening as built. **CLAUDE.md, project/working-agreement.md:** rule 8 (ask who uploads). **tests/README.md:** n ≥ 50. **sw.js:** VERSION (no game change).
- **Checks:** the sanity check on the full stats: 152 compared, 0 drifted, 12 log-only moves; `check.sh quick` passed (32.8 s).
