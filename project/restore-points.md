# Restore points

**Nothing is ever deleted from the git history**, so every past version can always be recovered. Update this list in every push: add the new point on top. From v0.8.6 the **Restore points** workflow (`.github/workflows/restore-points.yml`) tags the newest 5 commits of `main` on every push as `restore/<date>-<commit>` and removes older restore tags (only the label; the commits stay in history). On GitHub: the repo → **Tags** (or the branch menu → Tags), filter `restore/`.

## Known-good versions (newest first)
| Version | Commit | What it is |
|---|---|---|
| 0.11.28 | (this push) | The leaner check (compact output, a leaner models step, rule 1: the pick is the go). Tests, tools and docs only; the game is the same as 0.11.26; same save state. |
| 0.11.27 | `16f59e2` | The bot models (tests and tools only). The game is the same as 0.11.26; same save state. |
| 0.11.26 | `3b35f70` | The Coil goes round again (two wake points from Act 1, the end of Act 1 included), "same days again" gone, one Coil count per save; the baseline updated (Act 1 easier). Same save state as 0.11.19 plus the optional `coil.one` (an older version ignores it; an older version's Act 1 Coils then count from the save's number). The fields `played` / `replay` are no longer written. |
| 0.11.25 | `9b064d0` | The three leftover-check bugs fixed (the Blackroot stakes work, one night; `gives()` real items only; the dead `lu_disgraced` check out); the baseline updated (the night serpent). Same save state as 0.11.19 (`bl_stakes_night` is an existing flag; an old save with a stale `true` gets the cut once, on its next Blackroot night). |
| 0.11.24 | `dc3bba7` | The first generated pictures (8 art keys, `art/pic/`, recipes in `tools/art/`), the palette check. Art only; the bot stats unchanged (0 drift); same save state as 0.11.19 (art keys are not in saves). |
| 0.11.23 | `67a97f2` | The clean-up (dead code, an unused item, 12 unread flags no longer written), the leftover check strict. The bot stats byte-identical to 0.11.22; same save state as 0.11.19 (saves that hold the dropped flags keep them; nothing reads them; no save holds `palisade_stake`). |
| 0.11.22 | `55ff818` | The leftover check (log only), the bots' flag / item / choice record, `.gitignore`. Tests and tools only; same save state as 0.11.19. |
| 0.11.21 | `bd783e8` | The test suite checked and strengthened (mutation-tested, real browser taps, the noise-scaled drift line). Tests and tools only; same save state as 0.11.19. |
| 0.11.20 | `e071973` | The test suite in parallel; the lean dry run. Same save state as 0.11.19. |
| 0.11.19 | `fce05ab` | Act 1's resting places as task screens. Same save state as 0.11.18 (queued Act 1 rows are ids; an older version skips them there). |
| 0.11.18 | `037d99a` | Sleep resets the once-a-day things, Push through the night, Yuki's curve, the Extraordinary lines timed. Same save state as 0.11.5 plus the optional `wake` and `james.e8Work` / `ecWork` / `jnWork` (an older version ignores them: once-a-day things then come back at midnight again, and Extraordinary work started here is not counted there). |
| 0.11.17 | `42a5abf` | Cards that can't run hidden; the check-outcome leak. Display only; same save state as 0.11.16. |
| 0.11.16 | `852e3ca` | The relationship catch-up, the leftover Cultivate choices. Same save state as 0.11.5 plus the optional `coil.best` (an older version ignores it; relationships then grow ×1). |
| 0.11.15 | `e015408` | B1-b, speed by use. Same save state as 0.11.5 plus the optional `tasks.use` (an older version ignores it; its sits and breakthroughs then run at ×1 with the Coil bonus). |
| 0.11.14 | `39651ba` | Meditate only on the resting places, queueable there. Same save state as 0.11.5 (queued Meditate rows are ids; an older version skips them off the task screens). |
| 0.11.13 | `aa403a3` | E1, the meridian cards; the Coil on save lines. Same save state as 0.11.5 (a queued `mer:pri` / `mer:col` / `mer:e8` / `mer:ec` / `mer:jn` is just an id in the queue; an older version skips it as "not possible"). |
| 0.11.12 | `bef146c` | The queueable sit, the card order. Same save state as 0.11.5 (a queued `sit:next` is just an id in the queue; an older version skips it as "not possible"). |
| 0.11.11 | `a22729e` | Sliding bars, the hold tooltip, accessibility, scroll per tab. Same save state as 0.11.5. |
| 0.11.10 | `dd1bd9d` | Cache fix, hidden checks, the main menu. Same save state as 0.11.5 (new per-phone keys `boneash.showchecks`, `boneash.textsize` are outside the save). |
| 0.11.9 | `4369ec3` | Saves: share, export all, reminder, Backups, Copy status. Same save state as 0.11.5 (the new key `boneash.exp` is outside the save). |
| 0.11.8 | `3c2c33f` | The save-on-close guard. Same save state as 0.11.5. |
| 0.11.7 | `ed8c980` | Tests and tools only; the game is the same as 0.11.5. **Pushed after a failed full check** (the browser test's reload part, flaky); fixed in 0.11.8. |
| 0.11.6 | `6e2cf70` | Docs only; the game is the same as 0.11.5. |
| 0.11.5 | `6de8d8e` | The safety push. Same save state as 0.9.6 plus the optional `runPart` (an older version ignores it). Before it: the branch `fallback/2026-11-06-before-pivot` (= 0.11.4), never deleted. |
| 0.11.4 | `ddc2a44` | Forms 3b. Same save state as 0.9.6 (the new fight fields live only inside a fight). |
| 0.11.3 | `5b15815` | Tools and rules only; the game is the same as 0.11.2. |
| 0.11.2 | `71e47a3` | Timed cultivation. Same save state as 0.9.6 (`merWork` / `colWork` are new but optional). |
| 0.11.1 | `525e8e0` | Tests and tools only; the game is the same as 0.11.0. |
| 0.11.0 | `fd1022e` | The base redesign, push 1 (everything James grew starts over each Coil; the Coil bonus). Same save state as 0.9.6; a save that rewinds under 0.11.0 has its skills reset, which an older version will simply keep. |
| 0.10.4 | `f942fff` | Bonesinger forms, the mode names. Same save state as 0.9.6. |
| 0.10.3 | `a5f1a8b` | Docs only; the game is the same as 0.10.2. |
| 0.10.2 | `6dca6fa` | Pause rules, the camp as a task screen, waits at once. Same save state as 0.9.6. |
| 0.10.1 | `ded9175` | The Long Forest in task mode. Same save state as 0.9.6. |
| 0.10.0 | `549e3f6` | Queue planning and the forecast. Same save state as 0.9.6 (`starveCarry` is new but optional). |
| 0.9.9 | `fc16a92` | Clock with seconds. Same save state as 0.9.6. |
| 0.9.8 | `ee1e3a1` | Tasks by default, the speed gate. Same save state as 0.9.6. |
| 0.9.7 | `5534bec` | Severe difficulty in task mode. Same save state as 0.9.6. |
| 0.9.6 | `494b3a8` | Meridians closed at the start (task mode), Act 1's Coil. Save state 5; 0.9.5 and older report a state-5 save as "newer version" on the recovery screen (nothing is wiped). Download the save before rolling back. |
| 0.9.5 | `f402b63` | Cards everywhere in task mode. Same save state as 0.9.4. |
| 0.9.4 | `1b3e832` | The Coil (3c-1). Save state 4; 0.9.3 and older report a state-4 save as "newer version" on the recovery screen (nothing is wiped). Download the save before rolling back. |
| 0.9.3 | `4dec016` | No dice in task mode, fights retuned. Same save state as 0.9.2. |
| 0.9.2 | `00f4836` | Step 3b on the task cards. Save state 3; 0.9.1 and older report a state-3 save as "newer version" on the recovery screen (nothing is wiped). |
| 0.9.1 | `05349d0` | Speed drop-down. Same save state as 0.9.0. |
| 0.9.0 | `b3d0e27` | Task cards and the queue (preview switch, off by default). Save state 2; 0.8.6 can't read state 2 ("newer version" on the recovery screen, nothing is wiped). Download the save before rolling back. |
| 0.8.6 | `dc2ebee` | Save safety, error bar, checks, restore-point tags. **Saves now use a wrapped format that 0.8.5 and older can't read: they would silently start a new game and overwrite the autosave. Before rolling back past 0.8.6, download the save first.** |
| 0.8.5 | `d689ceb` | Docs only; the game is the same as 0.8.4 |
| 0.8.4 | `209e89a` | **Last version before the hybrid work.** Yuki's path, every romance arrangement. Tests pass (14 engine checks; story test with 2,000 full games). |
| 0.8.3 | `ac92a7d` | Bonesinger T1–T10 in combat |
| 0.8.2 | `4442a05` | The Long Forest as one button |
| 0.8.1 | `0c82c10` | Realm toughness |

## How to roll back (with the owner's go)
Claude does it: check out the old version's files onto `main` as a **new** commit (never a reset or force-push), bump `VERSION` in `sw.js`, push, and tell the owner to reopen the game once or twice.

```
git checkout <commit> -- .
# then bump VERSION in sw.js, update the four docs, commit and push
```

The owner can also look at any old version on GitHub: open the repo → tap the commits count (clock icon) → tap a commit → **Browse files**.

## Saves
Saves live only on the phone (browser storage: `boneash.auto`, `boneash.slot1–3`). Export a save file before trying an older version; older versions may not read saves made by newer ones.
