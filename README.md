# Bone and Ash

A text RPG for your phone. James Green (forty, with a doctorate three days old) and Yuki, his white root-kin cat, are thrown by a lab accident into the Blackroot Wilds. It is a dark xianxia world where cultivators climb on herbs, pills and each other, and Heaven answers every breakthrough with lightning. James needs none of that. That's his problem.

*Made with AI: the game is programmed and written with the help of AI (Claude by Anthropic), and its pictures are made with AI image tools. Credits: `CREDITS.md`.*

## How it plays

- **The story:** a hand-written branching story, the prologue and Act 1, more than 300 scenes. There is no AI narrator.
- **The rules:** the same Qi rules as the owner's SillyTavern game (Rules Engine C): Qi, Convergence (Qi + Bonesinger), GU, realms and meridians. A check compares your value with its DC. There are no dice.
- **Cards:** you play cards for tasks, training, cultivation and story choices. Each card moves the clock by its length. Familiarity makes a card faster the more you do it.
- **The Coil:** each act loops to a deadline: the prologue to the tribute on Day 7, Act 1 to the Outer Elder on Day 21. On a collapse, a lost deadline, or by choice, James wakes at the act's first dawn. He keeps what he has learned; Yuki remembers everything. James never dies.

## Play

- **On the phone:** open **https://hufle-beep.github.io/bone-and-ash/** in Chrome and choose *Add to Home screen*. After the first load it works offline. New versions arrive on their own; reopen the game once or twice.
- **On the PC:** run `python -m http.server 8080` in this folder and open `http://localhost:8080`.
- **Saves:** the game saves itself after every choice, in the browser. **☰ Menu → Saves** has 3 slots, automatic backups and export / import. A save can also be shared to this repository's `saves/` folder.

## Working on it

- `CLAUDE.md` holds the hard rules; the full version is `project/working-agreement.md`.
- `project/handover.md` is read first in a new chat. Then `roadmap.md` (what's next), `reference.md` (the files, how to run the checks, the rules as implemented), `design.md`, `lore.md` (the lore for story texts), `research.md` (what we take from other code and games), `changelog.md` and `restore-points.md`.
- `bash tools/check.sh` runs every check: the tests, the bots, the browser test and the mechanics sanity check. `bash tools/check.sh quick` runs a short version.
- When you change files, bump `VERSION` in `sw.js` so installed copies pick up the update.
