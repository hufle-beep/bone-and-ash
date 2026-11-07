# Bone and Ash — history, part 5

Started 2026-11-07 (v0.11.33), when `history-4.md` reached about 45 KB. Newer than `history-4.md`, `history-3.md`, `history-2.md` and `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Decisions and version notes (moved from the handover in v0.11.34)

- **v0.11.28: the leaner check (owner 12:14 "Can we thin the output and also the suite while trying to keep the efficiency? I allow you to search the internet"; 12:30 "check the github for output trimmers e.g. caveman"; 12:33 "we should revise the hard rules … once I pick the options, there is no need to write everything out again for a doublechek"; 12:34 "go with your recommendation" = O1 + S1 + S2 + R-a (H, cutting this file's line 3, left out: optional); 12:38 "go"; built in v0.11.28):**
  - **Measured first (v0.11.27's full check):** 85 lines, 8.8 KB of output (the models block about 5.5 KB); the time is the heavy chain tasks 70.8 + story 18.2 + models 29.8 = 118.8 s; browser part 1 (51 s) runs beside it.
  - **O1:** compact output (`tools/lib/report.mjs`), the whole output in `boneash-check.log` in the temp folder, `--verbose` as before. (O2 verdict only, O3 trim only: not picked.)
  - **S1:** the models step Careful, Completionist, Rusher, 500 games each; Yuki off (300) for Careful and Completionist (`--off-models`); Random on demand; 1,000 games each by hand for the rebalance. **S2:** the tools test's story comparison 100 → 51 games. **Not picked:** S3 (tasks / story 2,000 → 1,000: decide at the rebalance, which rebaselines anyway), S4 (split browser part 1: not on the slowest path); the watched runs stay at 300 (fewer would make the strict leftover check fail on rare flags).
  - **Output trimmers (12:30):** Caveman (JuliusBrussee/caveman) compresses Claude's prose only, not tool output; its `/caveman-compress` would rewrite the docs into caveman-speak (not readable for the owner). RTK (rtk-ai/rtk) filters command output through a Bash hook; its test filters are for known runners, the generic one keeps failures only (it would drop the model numbers), and it is an install per session outside the repo. Neither used.
  - **For the rebalance (search 12:24):** fixed seeds per game are common random numbers; one extra die roll desyncs the rest of a game, so streams per purpose (fights, food …) would let fewer games show a change: a bigger tools push, offered with the rebalance numbers if useful.
  - **R-a (rule 1):** the pick is the go; Claude stops and asks only if building turns up something the option didn't cover; a pick covers one push. `CLAUDE.md` and `project/working-agreement.md`; the owner pastes the new ruleset into the project instructions.
  - **Open (owner 12:42, mid-build):** "full check of the game is unnecessary if it doesn't change at all … only check the changes and how they interact, if there is a danger of breaking something, then warn": a change to rule 2; options at the report of v0.11.28 (this push still ran the full check, before the message).
- **v0.11.27: the bot models (owner 11:22 the rebalance request, pick B-a 11:25; 11:55 "procceed"; the list; 11:56 "go"; 11:59 "the models can run parallel to save time right? don't forget that I have a cloud ultra subscription. Use it."; built in v0.11.27):**
  - **Parallel:** the games are split across worker processes like the other bots; the workspace has 2 cores and 7 GB whatever the plan (checked 11:59). Owner 12:12: "cut the runs back to 500 or 1000 each" → 1,000 games per model plus 300 per model with Yuki's lane off (about 30 s; the runs are local computation, the tokens go on reading output and review agents).
  - **The Opus cold review (first build) found the measurement wrong:** card memory not cleared on a rewind; a hidden fallback ran uncounted cards on screens with no story exit; Yuki's lane always on and undocumented; losses to people (Shen Qiu taking James) not counted; the step not log-only; Random not the tasks test's bot; give-ups counted as finished; the Completionist self-check ran no cards. **Owner 12:12 "Your recommendation" (fix all, Y3):** all fixed (the file rewritten), Yuki's lane on for Careful / Completionist / Rusher plus a "yukiOff" line each; Random follows the tasks test's bot; only a stuck game or a broken replay fails, the rest are NOTE lines. Re-review on Opus: see the version note.
  - **The models, as built:** see the header of `tests/models.test.mjs` (Careful changed while building from "food, training, a sit, 4–6 cards a day", which died on every Coil, to every work card a day).
  - **The numbers (1,000 games each; yukiOff 300; the targets in brackets):**

    | Model | Prologue C1 dead | Act 1 C1 dead / taken | Mean Coil: prologue / Act 1 cleared | Whole game on Coil 1 |
    |---|---|---|---|---|
    | Random | 86.2% | 68% / 15.5% | 3.27 / 3.55 | 1.7% |
    | Careful | 17.9% [60–80] | 0.1% / 0% | 1.19 / 1.19 [2–3 / 3–5] | **82%** |
    | Careful, Yuki off | 47.7% | 100% (n 8) / 0% | 2.02 / 2.06 | 0% |
    | Completionist | 48.4% [40–60] | 0% / 34.5% | 1.64 / 1.83 [about 2 / 3] | **33.8%** [under 5] |
    | Completionist, Yuki off | 62.3% | 96.2% (n 53) / 1.9% | 2.28 / 2.46 | 0.3% |
    | Rusher | 100% to C5 | — | 7.08 (25% clear by C8) | 0% |

    Key fights won: Careful jackals 100%, lizard 0% (most of its prologue deaths), collectors 100%; with Yuki off collectors 7.2%, tribute C1 won 5%. Completionist lizard 41%, crows 44%, rats 39%, the Elder 56% (so 34.5% of its first Act 1 Coils end with Shen Qiu taking James). Rusher jackals 10%, crows and rats 0%. Random jackals 75%, boar 61%. NOTE line: Careful goes under Fed 30 on story screens with food in the hammerspace (it eats only on task screens).
  - **What they say:** a player who keeps Yuki hunting and does the day's work clears the whole game on Coil 1 four times in five (as the owner did); **Yuki's lane is a huge lever** (Careful's Coil 1 tribute 100% → 5% without it); Act 1's beasts kill almost nobody who trains, its danger is losing to people (the Elder).

### v0.11.31 — P3-b, the speed gates

- **js/core/tasks.js:** `maxSpeed`: ×2 also on `ending === 'lost'` and on `spd_pro`. **js/core/coil.js:** `KEEP_FLAGS` + `spd_pro`, `spd_a1`; `rewind` sets `spd_pro` when the Coil had a tribute outcome. **tests/tasks.test.mjs:** the gate block (a lost tribute ×2; ×2 kept across two rewinds; a rewind before the tribute ×1; ×5 kept across both rewinds from `a1_end`, the rest reset as before). **tests/README.md**. **sw.js:** VERSION.
- **The full check:** exit code 0, 0 drift (208 numbers compared), the leftover step 0 findings, 92.5 s. **Cold review (Fable, rule 9):** nothing wrong; every rewind path goes through `rewind`; `ending` stays unkept (`coilActive`, `inAct1` untouched); each of the five pieces reverted on a scratch copy fails its own test. Notes: not retroactive for saves that rewound before v0.11.31 (by design, no migration); `kept.spd_pro` is seen by the leftover check through the KEEP_FLAGS string and the test's rewind, not as a static `g.flags` write (cosmetic).

## Version notes (moved from the handover in v0.11.33)

### v0.11.30 — docs only, the priority points

- **project/handover.md:** the PRIORITY section (P1 repeated Coils not word for word, P2 picked choices recoloured, P3 a lost tribute opens ×2); **roadmap.md**, **changelog.md**, **restore-points.md**; **sw.js:** VERSION. Owner 13:18 "H-a go". Checks (rule 2, C-a, docs only): the consistency check and the quick check.

### v0.11.27 — the bot models (tests and tools only)

- **tests/models.test.mjs** (new): the four models, their play loop (Incremental Mode, the smart fight, the rewinds), the numbers per model (deaths per Coil with the cause, tribute, prologue and Act 1 cleared per Coil, the whole game on Coil 1, Act 1 endings, fights), `--games`, `--model`, `--json`; checks: every game finishes, the Rusher queues only meals, the Careful bot never goes under Fed 30 with food on a story screen, the Completionist plans every open card of the wilds, the same seed plays the same game. **tools/check.mjs:** the step "bot models" (1,000 games each and 300 with Yuki off, 50 in quick; heavy; log only). **tools/bots.mjs:** `--model`. **tests/tools.test.mjs:** the heavy jobs are tasks, story and the models. **tests/README.md**, **tools/timings.json**. **sw.js:** VERSION. No game file changed.
- **The full check (after the fixes):** exit code 0, 0 drift (208 numbers compared), the leftover step strict with 0 findings, 113.8 s (87.7 s before: the models step about 30 s). Cold reviews (Opus): the first found the measurement errors (decisions block), all fixed; the re-review found two leftovers, both fixed: Random on a screen with no exit now always queues random cards, and goes with Shen Qiu on purpose in 1 game in 10, like the tasks test's bot; the Completionist self-check ignores cards closed for the time of day. Full check after them: exit code 0, 0 drift, 117.6 s.
