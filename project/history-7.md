# Bone and Ash — history, part 7

Started 2026-11-07 (v0.11.45), when `history-6.md` reached about 45 KB. Newer than `history-6.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

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
