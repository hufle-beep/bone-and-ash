# Restore points

**Nothing is ever deleted from the git history**, so every past version can always be recovered. Update this list in every push: add the new point on top. From v0.8.6 the **Restore points** workflow (`.github/workflows/restore-points.yml`) tags the newest 5 commits of `main` on every push as `restore/<date>-<commit>` and removes older restore tags (only the label; the commits stay in history). On GitHub: the repo → **Tags** (or the branch menu → Tags), filter `restore/`.

## Known-good versions (newest first)
| Version | Commit | What it is |
|---|---|---|
| 0.10.0 | (this push) | Queue planning and the forecast. Same save state as 0.9.6 (`starveCarry` is new but optional). |
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
