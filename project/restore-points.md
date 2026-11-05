# Restore points

**Nothing is ever deleted from the git history**, so every past version can always be recovered. Update this list in every push: add the new point on top. Automatic tags of the newest 5 commits come with roadmap step 2 (H); until then this table is the list.

## Known-good versions (newest first)
| Version | Commit | What it is |
|---|---|---|
| 0.8.5 | (this push) | Docs only; the game is the same as 0.8.4 |
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
