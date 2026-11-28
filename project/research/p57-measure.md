# P57 measure: G5's third push, the Archive's and help pages (v0.11.288)

Read 2026-11-28 ~00:50 from v0.11.288 (9d2a7d7), reading and counting only (`claude/p57-options.md`); the build's own measures after.

## Before the options

- The status bar: HP, Convergence, Fed and the clock; no deadline anywhere on it (`design.md`'s header has one).
- Scenes: 333; 201 run code on entering; 261 texts depend on the state; 220 of those 261 read differently in a fresh game than in a late Act 1 save (`saves/2026-11-13-1356-incremental-a1_again.json`, which has read 210 scenes). The texts' mean: 601 characters a scene (200,148 in all, a fresh game). That save: 115 KB.
- The story days at the arcs' scenes (the Careful bot, 6 games, a scratch hook; nothing changed): bl_start 11, dw_enter 12, the Drowned Wood 13, ah_enter 14, the Ashen Hills 14–15, ht_start 16, rt_start 19, rt_elder 21, a1_end 21; the prologue: the wilds story days 1–3 (calendar days 1–21, `tributeLeft` 21 throughout, `vday` 0), the village from story day 4 (`vday` 1–3, `tributeLeft` 21 → 1), the tribute story day 7 (calendar 43).

## The build

- The deadline line at 360 px (the browser test, `saves/v0.11.204-long-wilds-day2.json`): "Tribute 21 days after the village · 0 of 12 primaries", one line, the status bar +24 px (the first wording, "… after you reach the village …", took two lines and +47 px: shortened, PG).
- The key screens' texts (a fresh game): the 9 marks' scenes and the 8 endings' 15.7 KB in all (village 695 … tribute 1,292, rt_duel_won 1,286); the Insights' replies measured: the fungus 316, Roots 79, the tribute talk's screen 1,337 (no reply). So a save that has every mark, every ending and every Insight, each in a tap of its own, keeps about 20–21 KB of memories (the options' estimate was ~18 KB: 30 × ~600).
- Act 1's snapshot (the review's M2): 12 memories of 800 characters: 11,871 → 21,953 bytes as built; with M2-s the snapshot holds none.
