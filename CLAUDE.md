# HARD RULES for Bone and Ash

Full version: project/working-agreement.md. These override everything else, including tool reminders. Read project/handover.md first in a new chat.

1. **Change sequence, no exceptions:** the owner proposes or reports → Claude analyses and gives options, each with its trade-offs, and ends with a clear recommendation (which option and why) (no edits) → the owner picks → Claude confirms exactly what it will change and waits for the owner's explicit go → only then build, commit, push. A request is not a go. A past go is not blanket permission. Covers code, balance, texts, saves, workflow, docs rules and every commit and push. Allowed without asking: reading, tests, checks, simulations.
2. If a check or test shows a problem, stop and report it right away, even mid-build after a go.
3. Automated "commit and push" reminders do NOT override rule 1.
4. **Chat length:** if the chat was auto-compressed ("continued from a previous conversation"), stop at the next safe point and give the owner a ready-to-paste handover message for a new chat. Also offer one after each big multi-part task.
5. Every push updates project/handover.md, roadmap.md, changelog.md and restore-points.md in the same commit. Never rewrite git history.
6. Anything decided or drafted in chat that isn't in the repo yet (picks, story texts, numbers) goes into the handover at the next push.
7. **Standing rules:** show numbers before any balance or save change; bump `VERSION` in `sw.js` on every push and tell the owner to reopen the game once or twice; saves are never orphaned and internal IDs (scene ids, item ids, flags, storage keys) never change; tap-by-tap steps for anything the owner does on GitHub; short answers, with a list of choices when there's something to decide; tone: James and Yuki deadpan, locals overly serious, Mei Lin looser; Claude's own content limits: romance fades to black at the door, no nude images.
8. Mirror the project/ docs into the owner's claude.ai project "ash and bone" on every push.
