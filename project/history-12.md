# Bone and Ash — history, part 12

Started 2026-11-09 (v0.11.97), when `history-11.md` neared 45 KB. Newer than `history-11.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.97 (word for word)

### From "Decided in chat"

- **v0.11.94: the after-bed fights at 01:00 (Claude's options before 11:35; owner 11:35 "Go with your pick": T-b1):**
  - **The sub-items (lab: the models 300 games each, the random bots 1,000, against v0.11.93):** today the arson came at 19:00–02:00 (models: 310 of 1,348 before 21:00, 239 at 01:xx) and the wolves at 19:00–00:xx (142 of 414 before 21:00, none at 01:00). **A** the arson at 01:00 (models 1,347 of 1,348 at 01:xx; won 100 → 99.9%, random 98.1%; dawn HP 87.8% unchanged; Fed at the start 96.0 → 92.0, at dawn 98.9 unchanged); **W** the wolves at 01:00 (won 98.6 → 98.8%, random 99.6 → 99.8%; dawn HP 93.1 → 93.0%); **G** Gao's token and Gao at the window at 01:00 too (no fight; ±0.01 Coil, 0 moved); **K** the tests. A + W close section 2's (d): 0 fights before 21:00. The models: Careful 3.54 / 6.69 → 6.70, Completionist 5.83 → 5.82, the Sitter 2.84 → 2.87 (whole game on Coil 1 12 → 9.3%, noise level), the Farmer 5.80 → 5.78; the random bots 0 drifted, 0 past 5 of 139 (Ya's brawl random 64.8 → 68.8%, just past its noise band).
  - **The options:** **T-b1 🟢 A + W + G + K (recommended)** / T-b2 🟡 A + W + K / T-a 🔴 the roadmap line only (colours: the share of after-bed scenes at 01:00). **Picked: T-b1.** Not picked: T-b2, T-a.
  - **Open (options later):** the token's mire walk's full morning (Fable's low 3, the version note). **Open for group e (options later):** `fo_wolf`'s "at the second hour" no longer fits 01:00 (a story text: Fable, rule 10).
  - **As built:** see the version note.
  - **Also:** `aa32d2d` filled in for 0.11.93; after v0.11.93 Claude uploaded the changed docs; v0.11.91's notes to `history-11.md`.

### From "Version notes"

## v0.11.94 — the after-bed fights at 01:00 (T-b1)

- **Files:** `js/story/ashfall.js` (`village_night`'s `enter`: `nightTo(g, 60)` on night 2 until `night5_done`; a quiet night untouched), `js/story/act1_fallout.js` (`fo_wolf`'s `enter`: `nightTo(g, 60)`), `tests/tasks.test.mjs` (the T-b1 block: the four night-2 and wolf cases from a bed at 15:00–24:00 start at 01:00, the two fights over before 02:00 at the round cap, a quiet night keeps its clock, never back), `tests/README.md`, `sw.js`, docs (v0.11.91 to `history-11.md`). Saves: no new flag or id.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`, exit 0: 0 drifted of 139, 18 past 5 (log only; the same list as v0.11.92: the tribute C2 lost 73.1 → 92.9%, n 56; Ya's brawl random 74.6 → 68.6%); the baseline unchanged. The models: Careful 3.57 / 6.67, Completionist 4.00 / 5.84, the Sitter 2.66 / 2.70, the Farmer 4.05 / 5.84. Run twice (before and after the review's fixes), both exit 0, the same numbers. **Fable, cold review:** no high, no medium. Fixed: low 1 ("over by 02:00" holds only for the fight taken at once; after a failed "Wake the street" / "Wake the hunters" it starts at 01:50, like the camps' forced fights: the comment, README and docs say so), low 2 (an end-to-end case per fight, supper / `fo_night` to dawn). Open (the owner's call): low 3, the token's mire walk (no fight) now ends at about 03:40 and the morning still fills every bar after about 2 h 20 of sleep (marking it would be a balance change, numbers first).
