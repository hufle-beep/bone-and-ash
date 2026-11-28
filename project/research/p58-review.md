# P58-A cold review (v0.11.289 → v0.11.290, uncommitted diff)

Read: the brief, both checklists, `git diff`, and the code around it (main.js autosave/load/writeKey/backupBefore/restoreAll/recovery/close save/notebar; tasks.js cardOf/taskCards/learn; task_hubs.js; the CSS). Ran: `node tests/archive.test.mjs` (246 passed, 0 failed), masteryView on every save in `saves/`, a real `learn()` per drill and hunt, the thread picker measured in Chromium at 360/375/390 px, and planted faults through `tools/mutate.mjs` (scratch copy `/tmp/p58rev/repo`). Nothing in the working copy was touched.

**No High findings.** The save guard holds on the paths I walked: two copies on empty storage (the second goes stale on its first save), a reopened save (`lastWritten = raw` before `checkScene`, so a migrated save still matches), storage full or blocked (`lastWritten` keeps the last real write, so the next try is allowed), the close save, the Android `SAVE_JS` (it only fires `pagehide`, so it goes through `closeSave`), the update bar's Reload (`closeSave` writes nothing when stale), and the recovery screen in a single copy. Only `autosave` writes `boneash.auto`. Nothing this copy does by itself can make it stale.

## Medium

**M1. The Mastery list shows cards that aren't James's and cards he never worked.** `tasks.js masteryView` lists every `sc:i` with fam > 0 that `cardOf` calls work/door. It skips the filters `taskCards` uses (`cfg.notJames`), and transfer or drill familiarity is enough to get a card listed.
- Failing case 1: the owner's own save `saves/2026-11-13-1356-incremental-a1_again.json` (the one `p58_ui` uses) lists `wild_hunt:3` "Let Yuki hunt on her own and just watch" as **Mastered (25.4)** under the Blackroot. That card moved to Yuki's lane (`wilds.notJames`), and `learn()` keeps feeding it 30% of every Wilds hunt and the drill share. `v0.11.7-act1-coil1.json` has it too (0.7).
- Failing case 2: a fresh game with one Militia drill at prologue Ashfall (`learn(g, SCENES, 'ashfall', cardOf(..., 'drill:0'), 'drill:0', 1)`) lists "Treat them with the jade bracket" (0.2, `show: hasItem(g,'jade_bracket')`), "Spearheads for the hunters" (form-gated) and the Workshop cards, none of which James ever ran. The lede, the FAQ line and What's new all say "every card James has **worked**".
- Fix: skip `cfg.notJames(c)` for the hub (and, to be safe, the same `hasWork` / door-Back filters `taskCards` uses). Then either change the words to "every card James knows" (transfer familiarity is real familiarity, and the card face shows it too), or list only cards with a run of their own. The second option needs a record, so it is a save field and the owner's call. Whether a show-gated card such as the jade bracket may appear before its gate opens is a canon/spoiler call for the owner.

**M2. In a stale copy, a deliberate replace half-runs.** The guard sits only in `autosave`. Load a slot, Restore (backup), Load save file, Restore all saves, New game and the recovery screen's buttons all run first and replace `g`; then the autosave refuses.
- Failing case: copy B is stale (A saved since), and the player taps Saves → Restore all saves in B. `restoreAll` writes the three slots, the rolling backups and BAK_META, and `backupBefore` writes the shared "before" backup with B's old game. Then `autosave` refuses, so `boneash.auto` stays A's. Storage is now half the file and half A. After the Reload the bar asks for, the player opens A's game, not the restored one. Load slot / Load save file / New game are the same minus the slot writes: the load looks done, but it vanishes on reload. COPY_TEXT ("this copy's last steps are not saved") doesn't tell the player that the load itself didn't take. The brief says a stale copy writes nothing, but `backupBefore` and `restoreAll`'s writes bypass the guard.
- Fix: run the same check (`mayAutosave(store.get(AUTO), lastWritten, staleCopy)`) at the top of each replace action. If it fails, set stale, show COPY_TEXT and do nothing (no backupBefore, no slot writes). Or decide that an explicit replace takes over (write, clear stale). That is the owner's call, but pick one so storage is never left half-restored.

## Low

**L1. At 360 px the thread picker is one column while the cards are two (measured).** In Chromium the `.thread-pick` content box is 309.6 px. Two `minmax(9.5rem,1fr)` columns plus the 0.4rem gap need 310.4 px, so it falls 0.8 px short. The task cards at the same width: `157.6px 157.6px`. From 375 px it is two columns. The brief's "in the cards' columns" fails at exactly the target width. Fix: a 9rem minimum, or a left margin of about 1.6rem.

**L2. COPY_TEXT says "Reload", but there's no Reload button and no way to keep this copy's game.** The installed web app runs `"display": "standalone"` (no browser reload button), and `#errbar` has only Copy and ✕. The notebar already has **Reload** and **Download now** (`showNotice(msg, exportBtn, reloadBtn)`). Using them would let the player reload and keep the stale copy's game as a file before it is dropped. Also, "is open in another tab" is often untrue: the other copy may be closed by now. "was opened in another tab or window and saved there" fits both cases.

**L3. Story-beat doors appear as Mastery rows.** Examples: "Find out where Ya has got to. You have a bad feeling" (5/8 to Skilled), "Ya's gone. So is her spear", "Somebody has been watching Ashfall from the ridge". This matches the spec (door cards show famLine), but one-off story beats with a "count to Skilled" read oddly in a skills list. It's for the owner to decide whether doors to once-a-Coil scenes belong there.

**L4. The Mastery folds forget whether they are open on every redraw.** No `toggle` bookkeeping, unlike the FAQ and task groups. The Archive memories behave the same way, so this is cosmetic.

## Test gaps
- **TG1:** a notJames card with familiarity (`wild_hunt:3`) is not listed. Also, one real `learn()` per drill/hunt hub checked against the hub's own card set (`taskCards` filters), not only a hand-made fam map (M1).
- **TG2:** the James tab's numbers. The total counts cards, not places (R4 missed), and each row carries its count to the next step (R5 missed). Make the HTML builder pure (or regex its output) and assert both.
- **TG3:** a label keeps its inner full stops ("Glassback hare. A dart from cover"; R3 missed). Only the last one goes.
- **TG4:** `load()` takes the stored save as this copy's (`lastWritten = raw`). R2 (`lastWritten = null`) passes the node test. In a real game it makes every reopened game go stale on its first tap: the worst regression this feature can have. Pin it by source, or add a one-page browser step: load a save, tap, and the save changes with no error bar.
- **TG5:** `p58_ui`'s docstring says "a reload carries on from that save", but the test never reloads the stale page. Reload `pg` (not close it) and check it opens the other copy's scene, clears the bar, and saves again on a tap.
- **TG6:** the thread picker at 360 px: column count against `.cards` (L1; R10, a `nowrap` overflow, was missed too).
- **TG7:** each replace action in a stale copy writes nothing (M2).
- **TG8:** Claude's F8 never applied: the `find` text occurs three times in tasks.js (`carriesWrite` has the same `.replace(/\.$/, '')` twice). With a unique find (`const row = { id, label: String(asText(c.text, g)).replace(/\.$/, '')`) it is **caught**.

## Planted faults (`--cmd "node tests/archive.test.mjs"`, --jobs 1)
Claude's `/tmp/p58/faults.json`: **11 caught, 0 missed, 1 not applied** (F8, see TG8; re-run with a unique find: caught).

Mine (`/tmp/p58rev/faults-r.json`, `faults-r3.json`):
| Fault | What it breaks | Result |
|---|---|---|
| R1 | empty storage refuses the write | caught |
| R2 | `load()` sets `lastWritten = null` (every reopened game stale) | **missed** (TG4) |
| R3 | every full stop in a Mastery label dropped | **missed** (TG3) |
| R4 | the total counts places, not cards | **missed** (TG2) |
| R5 | rows lose the count to the next step | **missed** (TG2) |
| R6 | `done.add` before `cardOf` | equivalent today (139 = 139 rows with every card at 5): not counted |
| R7 | stale flag not set | caught |
| R8 | function labels read without the game | caught |
| R9 | `writeKey` always returns true | caught |
| R10 | picker cards `nowrap` (overflow at 360 px) | **missed** (browser-only, TG6) |
| R11 | Wilds lists only notJames cards (probe) | caught |

Net: 6 caught, 5 missed, 1 equivalent (of 12 planted).
