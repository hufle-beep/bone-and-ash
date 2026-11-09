# Bone and Ash — history, part 13

Started 2026-11-09 (v0.11.107), when `history-12.md` neared 45 KB. Newer than `history-12.md` … `history.md`. Each push moves what is older than the last three versions here from the handover, newest first.

## Moved from the handover in v0.11.108 (word for word)

### From "Decided in chat"

- **v0.11.105: the changelog split (the handover message of 21:10; Claude's options for group d's new weapon kinds (NK1–NK4, not picked yet) and for the changelog (CS1–CS3) at 21:10; owner 21:19 "CS1"):**
  - **The changelog's sub-items:** **SP** the split: the rows for 0.0–0.11.69 (105 rows, about 43.9 KB) move word for word to `changelog-2.md`; `changelog.md` keeps 0.11.70–0.11.104 (35 rows, about 16.3 KB) and a pointer line; checked by putting the parts back together against the original; **TP** the trimming pass: every row is the only player-facing line of its version, nothing to cut without losing words (0 bytes); **H** the handover's doc list names `changelog-2.md`; **Q** the checks (docs only: the tools test and `bash tools/check.sh quick`).
  - **The options:** **CS1 🟢 SP + TP + H + Q, its own docs push now (recommended)** / CS2 🟡 the same inside item 1's push / CS3 🔴 nothing (the next row tips it past 60,000; every mirror falls back to a file) (colours: every doc readable in one go, game and docs pushes kept apart). **Picked: CS1.** Not picked: CS2, CS3.
  - **Group d's new weapon kinds, analysed, not picked yet:** the sub-items, numbers and options NK1–NK4 moved word for word to the roadmap's group d line ("bone weapons by Convergence") in v0.11.106, so the handover stays under 35 KB.
  - **As built:** see the version note.
  - **Also:** `7eb4d01` filled in for 0.11.104 (the restore-points row names SH1 too); after v0.11.104 Claude uploaded 5 docs (handover, roadmap, changelog, restore points, history-12); v0.11.102's notes to `history-12.md`.

### From "Version notes"

## v0.11.105 — the changelog split (CS1)

- **Files:** `project/changelog.md` (the rows for 0.11.69 and before out, a pointer line in), `project/changelog-2.md` (new: those 105 rows word for word, newest first), `sw.js`, docs (v0.11.102 to `history-12.md`; the handover's doc list). Docs only: the game, saves and the baseline unchanged. The split checked: the two parts' rows put back together are the original's 140 rows, byte for byte.
- **Checks:** docs only (rule 2): `node tests/tools.test.mjs` and `bash tools/check.sh quick` (the doc rules, the consistency check's top changelog row); see the report. Interaction: `tools/consistency.mjs` reads only `changelog.md`'s top row, so the split touches nothing else; every doc now under 60,000 bytes (`changelog.md` about 16.7 KB).

## Moved from the handover in v0.11.107 (word for word)

### From "Decided in chat"

- **v0.11.104: growth by level (section 0's next item, group d's weapons by Convergence; the handover message of 19:27; Claude's list and options WK1–WK4 at 19:28 (not picked); the owner's 19:30 "it's fine if you don't create a new weapon/armor and defence for every single tier, but you can increase durability and damage. You can/should also tune the qi blast and shield according to that."; Claude's options GW1–GW4; owner 20:13 "GW2 go"):**
  - **The list and the reach (19:28):** in the roadmap's group d line (Act 1 at T1 for nearly everyone: Careful 7, Completionist 8, the Sitter 24).
  - **The sub-items (a scratch copy; 300 bot games, 6,618 fight states each played under every variant; the models 300 games):** **DF** a full step a level (T1 L8 ×1.7): smart 74.3 → 80.0%, the rot ape 14.2 → 67.9%; **DH** half a step (×1.39): smart 76.9%, the rot ape 18.7%; both the models' Act 1 Coil Careful 4.07 → 3.70, Completionist → 3.45; **U** guard toward the next form, the plates +0.1 a level: +0.1 at most in Act 1; **K** the knife 1, 1, 2, 2, 3, 3, 4 swings: smart 75.7%, Ya's spar (story test) 40.7 → 88.0%; **Bw** the shield 3 × the multiplier, the blast at the weapons' pace until T7: blast only level with the blade (77.0 / 77.2%); **B0** the blast's own curve smoothed: 2.4–2.7 behind; **T** tests, the FAQ (Fable); **A** the baseline update (GW2: 7 past 20).
  - **The options:** GW1 🟢 DF + U + K + Bw + T + A / **GW2 🟡 DH + U + K + Bw + T + A (recommended)** / GW3 🟠 DH + U + K + B0 + T + A / GW4 🔴 U + K + T + A (colours: what a Convergence level pays in fights on the same states, and whether the blast keeps pace). **Picked: GW2.** Not picked: GW1, GW3, GW4.
  - **The FAQ's Fights lines (rule 10):** Fable's draft shown in chat at 20:15 (five changes: the growth sentence, the knife's swings, "From T1 L8 the knife holds" with guard and plates, the blast's pace, the shield's numbers); the owner's 20:16 "ok".
  - **A stop-and-ask (rule 1; Fable's review, high 1: the shield's tenths printed float noise, "1.7999999999999998"):** **SH1 🟢 S1 + L (recommended)** / SH2 🟡 S2 + L / SH3 🟠 S1 (S1 every soak step to 0.1, smart 78.90% as shown; S2 a whole-number soak, smart 79.07%, the FAQ's 4.5 → 5; L the four lows). **Picked: SH1** (20:49). Not picked: SH2, SH3.
  - **As built:** see the version note.
  - **The deploy of v0.11.103 (rule 6):** both runs for `ff2ceef` failed on GitHub's side (Restore points: "workflow file issue"; Pages: built, deploy never started). Pick **GH1** (19:24): Claude re-ran both; Restore points succeeded (tag `restore/2026-11-09-ff2ceef`), Pages' re-run skipped the deploy. Pick **PD1** (19:27): wait; this push deploys the newest `main`.
  - **Also:** `ff2ceef` filled in for 0.11.103; after v0.11.103 Claude uploaded 5 docs (handover, roadmap, changelog, restore points, history-12); v0.11.101's notes to `history-12.md`.

### From "Version notes"

## v0.11.104 — growth by level (GW2, SH1)

- **Files:** `js/core/game.js` (`boneMult`, `LEVEL_STEP` 0.5, `blastMult`; damage, costs, the shield, the blast, guard, plates and the construct by it; the knife's `c.knifeSw`; SH1's soak to 0.1; the gates stay on the tier), `js/core/forms.js` (`knifeSwings`), `js/main.js` (the knife's card and hold text), `js/core/faq.js` (Fable's lines, the owner's "ok" 20:16, low 1's wording), `tests/tasks.test.mjs` (GW2 and SH1), `tests/README.md`, `tools/baseline.json` (the owner's go), `project/roadmap.md`, `sw.js`, docs (v0.11.101 to `history-12.md`). Saves unchanged, no id changed (an old save's missing `knifeSw` reads 0). Without the change the tasks test fails 5 asserts and stops at `boneMult`; without SH1's rounding 2 asserts and the line scan (rot ape, Gao, jackals, arson) fail.
- **Checks:** a game change (rule 2): the full `bash tools/check.sh`: run 1 stopped at the sanity check only, 7 drifted past 20 of 143 (the seven shown before the pick, each within 5 points, e.g. the story test's Ya spar smart 40.7 → 85.3%, root wyrm smart 50.1 → 86.5%), 41 past 5; the baseline updated (`node tools/sanity.mjs --update`, the owner's go in GW2's A); run 2 exit 0; after SH1 run 3 exit 0, 0 drifted, 0 past 5 of 144. The models (500 games): Careful 3.27 / 3.73, Completionist 3.34 / 3.47, the Sitter 2.65 / 2.65 (whole game on Coil 1 16.6%, was 15.0%: noise), the Farmer 3.28 / 3.44 (before: 3.44 / 4.06, 3.79 / 4.09, 2.66 / 2.66, 3.75 / 4.07). **Fable, cold review:** high 1 (the shield's float noise): SH1, above. No medium. Fixed in SH1: low 1 (the FAQ: guard grows before the first piece too), low 2 (the hold text on a formed knife), low 3 (four stale comments; the knife test at T1 L3), low 4 (the construct by level and the line scan tested). Information: `knifeSwings` (Infinity from T1 L8) is read only behind `fragileKnife`, never stored; a mid-fight save keeps `knifeSw`; no other float noise (100 ranks, realms 0–10); the smart rule prices a formed fragile knife as unformed (kept as measured; roadmap group d); `reference.md`'s Combat section is dice-era text (older).
