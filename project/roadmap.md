# Roadmap: Bone and Ash

Last updated: 2026-11-05 (v0.8.5, docs only). Update in every push.

## Order of work (owner, 2026-11-05)
The hybrid with Selene (design in `design.md`). Safety comes before the rewrite, because the hybrid changes the save format. Each step is one or more pushes, each with its own options, pick and go. Estimates are working sessions, not calendar days.

1. **Rules and docs** — **DONE in v0.8.5:** `CLAUDE.md`, `working-agreement.md`, the handover moved to `project/`, roadmap, changelog, restore points, design.
2. **Save safety** (about 1½ days): A (checksum, format number and migrations instead of rejection, recovery screen, rolling backups 5 min / 30 min / 2 h / before risky moves, broken-number guard), G (one check script, old-saves test: every file in `saves/` must load — the owner exports a few saves first), F (error bar with copy, double-tap guard), H (newest 5 commits tagged automatically, rollback guide).
3. **The hybrid core on the prologue** (about 4 days): task cards with progress bars, the queue, familiarity, Fed as energy and HP as hazard, Yuki's lane, the Outlook line, the Coil and its screen, save migration, K (Intuitive Aptitude), L (breakthrough from 95%). Bots tune the tribute for Coils 1–3 (about 30% → 80%).
4. **Progression layer** (about 2 days): Insights, Coil marks, drills, Parallel Cognition threads (option 3); Map, Mastery and Archive tabs; FAQ that unlocks with progress.
5. **Act 1 converted** (about 3 days): seven arcs, the grove job, retune Shen Qiu and the region bosses.
6. **Android and comfort** (about 1½ days): the Android app like Selene's (app ID `io.github.hufle.boneandash`, key in the repo, `android-latest` release with a fixed link, newest 5 builds kept, update check, export through Android), B (export reminder, export-all, share to GitHub), C (settings: text size, close ✕, pause-when, auto-eat, resets), D (build label, What's new, new-version notice), E (fonts embedded).
7. **Engine extras and lore** (about 2 days): J (Yuki's form ladder by realm), Qi bond flow, injury and Strain, Ouroboros daily knockout beat, dampening on every Qi cost, quests with XP lumps, status block and check labels, the relationship ledger; Yuki's canon look (ears, tail, qipao; the dress as an outfit); Yuki born with James (fix `yuki_path.js`); the Long Forest as a New Game preset.

## Next up
- **Step 2, save safety:** Claude proposes the exact changes and options; owner picks and says go. Before G the owner exports one or two saves (or several from different points in the game) for the old-saves test.

## Waiting on the owner
- Saves to put in `saves/` for the old-saves test (step 2).

## Later (from the old handover, not scheduled)
- **Act 2** (open).
- **Art:** less cutesy manhua; close-ups for James and the Sect; manhua treatment for the remaining plain interiors (elder, healer, dinner); more paintings (Wang Hui *Landscape*, Cleveland 1915.105; Wang Shimin *Mountain Village*, Cleveland 1997.104 — the owner downloads and attaches them, the cloud session can't fetch images). A more serious tone later.
- **Sound** (optional; Selene's ZzFX effects and generated music).
- Universal-service gifts (organic armour, qi sidearm, hilt blade) as finds in the ship (Act 2 idea).

## Decided
- 2026-11-05: the hybrid design and its picks (see the handover's "Decided in chat" and `design.md`). Skip engine rules M (XP pool × GU tier) and N (non-GU checks averaged). The deliberate game forks stay.
