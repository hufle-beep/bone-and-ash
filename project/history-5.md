# Bone and Ash — history, part 5

Started 2026-11-07 (v0.11.33), when `history-4.md` reached about 45 KB. Newer than `history-4.md`, `history-3.md`, `history-2.md` and `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Version notes (moved from the handover in v0.11.33)

### v0.11.30 — docs only, the priority points

- **project/handover.md:** the PRIORITY section (P1 repeated Coils not word for word, P2 picked choices recoloured, P3 a lost tribute opens ×2); **roadmap.md**, **changelog.md**, **restore-points.md**; **sw.js:** VERSION. Owner 13:18 "H-a go". Checks (rule 2, C-a, docs only): the consistency check and the quick check.

### v0.11.27 — the bot models (tests and tools only)

- **tests/models.test.mjs** (new): the four models, their play loop (Incremental Mode, the smart fight, the rewinds), the numbers per model (deaths per Coil with the cause, tribute, prologue and Act 1 cleared per Coil, the whole game on Coil 1, Act 1 endings, fights), `--games`, `--model`, `--json`; checks: every game finishes, the Rusher queues only meals, the Careful bot never goes under Fed 30 with food on a story screen, the Completionist plans every open card of the wilds, the same seed plays the same game. **tools/check.mjs:** the step "bot models" (1,000 games each and 300 with Yuki off, 50 in quick; heavy; log only). **tools/bots.mjs:** `--model`. **tests/tools.test.mjs:** the heavy jobs are tasks, story and the models. **tests/README.md**, **tools/timings.json**. **sw.js:** VERSION. No game file changed.
- **The full check (after the fixes):** exit code 0, 0 drift (208 numbers compared), the leftover step strict with 0 findings, 113.8 s (87.7 s before: the models step about 30 s). Cold reviews (Opus): the first found the measurement errors (decisions block), all fixed; the re-review found two leftovers, both fixed: Random on a screen with no exit now always queues random cards, and goes with Shen Qiu on purpose in 1 game in 10, like the tasks test's bot; the Completionist self-check ignores cards closed for the time of day. Full check after them: exit code 0, 0 drift, 117.6 s.
