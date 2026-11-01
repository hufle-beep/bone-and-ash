# Bone and Ash

A text RPG for your phone. James Green — forty, a doctorate three days old — and Yuki, his white root-kin cat, are thrown by a lab accident into the Blackroot Wilds of a dark xianxia world where cultivators climb on herbs, pills and each other, and Heaven answers every breakthrough with lightning. James needs none of that. That's his problem.

Same rules as the SillyTavern game (Rules Engine C): Qi, Convergence (Qi + Bonesinger), GU, realms and meridians, XP with the GU split and k 0.5 — with one addition: every check is **value + d6 vs DC** (a 6 always succeeds, a 1 needs DC + 2). Everything starts at T1 L1, Mortal Vessel, 12 primaries and 66 collaterals open.

## Play

- **On the phone (Termux):** `cd ~/James-rpg-test && git pull && python -m http.server 8080`, then open `http://localhost:8080` in Chrome. Menu → *Add to Home screen* installs it; after the first load it works offline.
- **On the PC:** run `python -m http.server 8080` in this folder and open `http://localhost:8080`.
- The game saves itself after every choice (in the browser). The Saves tab has 3 slots and a save file you can move between devices.

## Files

- `js/core/formulas.js` — copied unchanged from Rules Engine C.
- `js/core/game.js` — state, d6 checks, XP, Qi, regen, hunger, combat, saves.
- `js/core/story.js` — the scene runner.
- `js/story/prologue.js` — the prologue (52 scenes).
- `js/art/art.js` — the illustrations, drawn in code.
- `tests/` — `node tests/rules.test.mjs` (engine numbers) and `node tests/story.test.mjs` (every scene reachable, 2,000 random playthroughs).

When you change files, bump `VERSION` in `sw.js` so installed copies pick up the update.
