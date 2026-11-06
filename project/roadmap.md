# Roadmap: Bone and Ash

Last updated: 2026-11-06 (v0.9.8, Tasks by default and the speed gate). Update in every push.

## Order of work (owner, 2026-11-05)
The hybrid with Selene (design in `design.md`). Safety comes before the rewrite, because the hybrid changes the save format. Each step is one or more pushes, each with its own options, pick and go. Estimates are working sessions, not calendar days.

1. **Rules and docs** — **DONE in v0.8.5:** `CLAUDE.md`, `working-agreement.md`, the handover moved to `project/`, roadmap, changelog, restore points, design.
2. **Save safety** — **DONE in v0.8.6:** A (checksum, format number and migrations instead of rejection, recovery screen, rolling backups 5 min / 30 min / 2 h / before risky moves, broken-number guard), G (one check script, old-saves test: every file in `saves/` must load — the owner exports a few saves first), F (error bar with copy, double-tap guard), H (newest 5 commits tagged automatically, rollback guide). Six test saves made from v0.8.5; the part test walks every "lost" scene.
3. **The hybrid core on the prologue**, in three pushes behind the "Tasks (preview)" switch (owner 2026-11-06): **3a the task loop — DONE in v0.9.0** (cards, queue, clock, Outlook, Fed/HP, collapse stand-in, migration); **3b getting better — DONE in v0.9.2** (no dice on task cards, harder, familiarity, Intuitive Aptitude as setbacks + transfer, Yuki's lane, drills, door cards, the Cards | Results layout); **3c the Coil**, in three pushes (owner 2026-11-06): **3c-1 the Coil — DONE in v0.9.4** (reset B, Coil screen, Bite the tail, accept-or-rewind at the tribute, same days again, "You remember this", L from 95%, pause button; prologue only), **3c-2 balance** (HP as a real threat, tribute tuning), **3c-3 — DONE in v0.9.8** (Tasks on by default, speed gate, hidden test speeds) (no dice anywhere in task mode is DONE in v0.9.3; HP as a real threat, including the serpent (`rt_serpent`, decided by arrival HP); the switch turns on by default; the speed gate: ×2 after the first won tribute, ×5 after Act 1, ×10 removed). Speed drop-down itself: DONE in v0.9.1. Full list (about 4 days): task cards with progress bars, the queue, familiarity, Fed as energy and HP as hazard, Yuki's lane, the Outlook line, the Coil and its screen, save migration, K (Intuitive Aptitude), L (breakthrough from 95%). Bots tune the tribute for Coils 1–3 (about 30% → 80%). Also the serpent on the way home (`rt_serpent`): today it is lost only when James arrives at ~1% HP; make it a real first-Coil threat (owner 2026-11-05, numbers first).
4. **Progression layer** (about 2 days): **bone-work crafting** (owner 2026-11-06: gear in three slots, medicines, recipes kept as Insights, cores as currency; recipe list and numbers to the owner first); Insights, Coil marks, drills, Parallel Cognition threads (option 3); Map, Mastery and Archive tabs; FAQ that unlocks with progress.
5. **Act 1 converted** (about 3 days): seven arcs, the grove job, retune Shen Qiu and the region bosses.
6. **Android and comfort** (about 1½ days): the Android app like Selene's (app ID `io.github.hufle.boneandash`, key in the repo, `android-latest` release with a fixed link, newest 5 builds kept, update check, export through Android), B (export reminder, export-all, share to GitHub), C (settings: text size, close ✕, pause-when, auto-eat, resets), D (build label, What's new, new-version notice), E (fonts embedded).
7. **Engine extras and lore** (about 2 days): J (Yuki's form ladder by realm), Qi bond flow, injury and Strain, Ouroboros daily knockout beat, dampening on every Qi cost, quests with XP lumps, status block and check labels, the relationship ledger; Yuki's canon look (ears, tail, qipao; the dress as an outfit); Yuki born with James (fix `yuki_path.js`); the Long Forest as a New Game preset.

## Next up
- **The owner's four pushes (2026-11-06 07:50):** 1 cards everywhere — **DONE in v0.9.5**; 2 meridians closed at the start and Act 1's Coil — **DONE in v0.9.6**; 3 severe difficulty — **DONE in v0.9.7** (bots: dead before Mei Lin 81 / 30 / 13%, tribute won or paid 36 / 58 / 77%, Act 1 deaths 81 / 65 / 48%); 4 3c-3 — **DONE in v0.9.8** (Tasks on by default, ×2 after a won tribute, ×5 after Act 1, ×10 only with the hidden test speeds). **Next: the serpent push** (it is a beast, so since v0.9.7 losing it ends the Coil; numbers to the owner first), then step 4. Act 1's death rates get their own retune in step 5.
- The owner tries v0.9.8 on the phone (Tasks is now the default; a **new game** gets closed meridians; Saves → tap "Game mode" 5 times for test speeds) and reports what feels wrong.
- Optional small follow-up to step 2: a "Backups" list in the Saves tab (today backups are restorable only from the recovery screen).

## Waiting on the owner
- One or two real saves exported from the phone (Saves tab → Download save file) for `saves/`.

## Later (from the old handover, not scheduled)
- **Act 2** (open).
- **Art:** less cutesy manhua; close-ups for James and the Sect; manhua treatment for the remaining plain interiors (elder, healer, dinner); more paintings (Wang Hui *Landscape*, Cleveland 1915.105; Wang Shimin *Mountain Village*, Cleveland 1997.104 — the owner downloads and attaches them, the cloud session can't fetch images). A more serious tone later.
- **Sound** (optional; Selene's ZzFX effects and generated music).
- Universal-service gifts (organic armour, qi sidearm, hilt blade) as finds in the ship (Act 2 idea).

## Decided
- 2026-11-05: the hybrid design and its picks (see the handover's "Decided in chat" and `design.md`). Skip engine rules M (XP pool × GU tier) and N (non-GU checks averaged). The deliberate game forks stay.
