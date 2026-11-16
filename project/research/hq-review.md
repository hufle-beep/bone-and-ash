# Cold review — v0.11.193 (N1: HA, HQ, GV; Fable's, Claude's C1 + C2, G1)

Read: the diff, the brief, the packet, the canon card, Fable's drafts and brief; excerpts of `prologue.js` 980–1175, `yuki_path.js` (routing, YK_HERE), `longforest.js` (lf_hub, awaken scenes), `ashfall.js` (supper), `meditate.js` / `tasks.js` (bt_return), `coil.js` KEEP_FLAGS. Rendered HQ P and M in a scratch copy (`/tmp/hqr/s`). Planted 18 faults (`/tmp/hqr/faults.json`, report `/tmp/hqr/mutate.md`).

## H

**H1 — C2 puts James's people's word in Old Wen's mouth; its reason was wrong.** `js/story/prologue.js:1125` (AWAKE_VILLAGE): "housing a root-kin of rank". The brief says C2 replaced Fable's "spirit beast" as "a term the game never uses". It is used, by a local, in the same village: the mother at supper, `js/story/ashfall.js:111/113`: "The spirit-beast will sleep where it chooses. One does not command such creatures." (also `prologue.js:791`, "spirit-beast net"). "Root-kin" is James's people's word (lore.md 63, 106); grep shows no local in the game says it. Old Wen, in James's first week, can't know it (canon: locals mostly think she's a cat). The owner picked D1 with C2 on the wrong fact.
*Fix:* "Ashfall did not know it was housing a spirit-beast of rank" (hyphenated as the mother says it; "of rank" covers what she already sensed). Flip the test pin at `tests/story.test.mjs` (GV block: `/a root-kin of rank/` and `!/spirit beast/` become `/a spirit-beast of rank/` and `!/root-kin/`). Add to the checklist: *a cut's stated reason gets a grep too.* This needs the owner's word (D1 named C2).

## M

**M1 — HQ: the insert sits before "She is in the tall shape", so "She" becomes the woman who just left** (the v0.11.190 M1 fault class). `prologue.js:1164–1169` puts `ASK_WOMEN` in front of `YK_HERE.first`, whose first word is "She". Rendered (`/tmp/hqr/r.mjs`):
- M: `… She is already walking. "I'll go and count my herbs. Slowly. Shout if he falls over."` ¶ `She is in the tall shape when she comes to stand in front of you…`. Two "She is" sentences in a row, two women. The second reads as Mei Lin.
- P: `…They go, Ya looking back twice.` ¶ `She is in the tall shape…`. Ya is the last named woman.
*Fix:* as with AWAKE_AT: when `w`, ``${ASK}\n\n${t.replace(/^She is in the tall shape/, 'Yuki is in the tall shape')}``. Check that the anchor is found once at load, as N1 does. Pin it in the HQ test.

**M2 — HQ repeats the look beat three times across two screens.** HA-P ends "Her gaze goes over Mei Lin and Ya" / HA-M "Her eyes move to Mei Lin". The next screen opens with HQ-P "Yuki looks at Mei Lin and Ya … and waits" / HQ-M "Yuki looks at Mei Lin, and goes on looking … 'I know that look.'" Right below that comes YK_HERE.first ¶1: "she looks at you, and the look goes on past the point where a cat would have got bored". In M the same "looks, and the look goes on" beat comes twice in a row on one screen, and it makes the first paragraph's joke before that paragraph does.
*Fix (Fable, small):* give HQ a gesture that isn't a look. For example, M: "Yuki says nothing to Mei Lin, pointedly. Mei Lin lifts both hands. 'I know that silence. My mother has it.' …"; P: "Yuki waits, in Mei Lin and Ya's direction, with great patience." Run `packet.mjs --check` again.

## L

**L1 — GV: "The fish she was given were small."** `prologue.js:1125`. The prologue never shows Ashfall feeding her. The 'village' task screen is the arrival day (Day 4, before any supper), so a breakthrough there to realm 2 (Cultivator 48/200 reach GV) can come before she has eaten anything in Ashfall. It sets up Act 1's dried-fish offerings (`yuki_time.js:99–101`) nicely, so this is a small point. *Fix (optional):* "Whatever she was given was not enough. This will be corrected." That loses the "fish" ear-turn, so keep the line as it is unless the owner minds.

**L2 — 'supper' in the GV branch is unreachable.** `VILLAGE_SCENES` includes 'supper', but `supper` is neither in `MED_SCREENS` (`meditate.js:28`) nor a task hub (`task_hubs.js`), so `bt_return` is never 'supper' in play. The GV test renders it with faked flags. Harmless. The brief's "supper indoors" worry (Mei Lin and her mother in the room, Yuki "in the street") can't happen. *Fix:* none needed. Optionally drop 'supper' from the GV test loop, or note in a comment that it can't be reached.

**L3 — GV after a first great form at a realm with its own closer.** "bows again … lower than he bowed to you" leans on BT_VILLAGE_CLOSER ("people bow … To you"). That closer is skipped at realms 10, 11, 12, 14 (`BT_OWN_CLOSER`). It only matters for a save with `yuki_tiger_seen` unset at a high realm (an old save; normal play always opens the great form at realm 2). *Fix:* gate GV on `!BT_OWN_CLOSER.includes(g.james.realm)`, or accept it as is.

## Checked, no finding
- **Stale `yuki_return`:** the awaken scenes are entered only from the breakthrough's "Get up." (sets `yuki_return = bt_return`, always equal) or from lf_hub (sets 'lf_hub'). "Yuki: change form." leads to `yuki_form`, never to an awaken scene. `mei_party`/`ya_party`/`bt_return`/`yuki_return` are not in KEEP_FLAGS (they reset each Coil), and the party exists only in Act 1, so lf_hub + party can't coincide. A rewind restores the whole flag set. No route found where `awakeWho`/`awakeVillage` is true and nobody saw the change.
- **HQ only on the first question:** `YK_HERE.first` shows only when not at the fire and `ykLaterQ` is null (no `yk_last`; q has sister/lover/wait). The breakthrough and `yuki_time.js:413` routes need `ykAskNow`, so they always have `yk_last`. `yk_choice_again` is a separate scene. `yuki_human_after` happens once per game (`yuki_human_seen` is kept).
- **HA's two choices:** "Promise. No occasion." still answers both texts word for word. "Ask her to stay like this" still fits. HQ has no shape, time or ground words. 'T' (the Old Tree) reads P: "They go" fits the crack.
- **Answers after the women left:** sister, lover and "Not yet" name no one present. The lover's "nobody needs to know yet" fits better now.
- **Tone:** Yuki is deadpan ("Don't be flattered."), Mei Lin looser ("Who would believe me?", "Shout if he falls over"), Ya pushy ("I'm not."), Wen grave ("This will be corrected."). No tics from the canon card found.
- **Save safety (rule 7):** no id, flag or storage key changed. New exports only; the yk_choice text wrapper sets nothing.

## Planted faults (`/tmp/hqr/mutate.md`): 15 caught, 3 missed (of 18)
Caught: F1 stale awakeVillage, F2 GV in Act 1's Ashfall, F3 GV on the human form, F4 T reads M, F5 HQ on a later question, F6 HQ after the question, F7 HQ-P word, F8 C1 reverted, F9 C2 reverted, F10 GV "moonlit" (caught by the opening pin, not the time-word ban), F13 G1 bow reverted, F14 "everyone" lost, F15 "Promise" → "Swear", F17 ASK_WOMEN out of textlint's pool, F18 Ya named in HQ-M.
Missed: **F11** HA-P "Mei Lin nods, carefully" → "laughs, loudly" (an unpinned beat); **F12** HQ-M "from your shoulder" (a shape word not in the ban list); **F16** HQ-P "It is dark" (a time word not in the ban list).

## TG
- **TG1 (M1):** no test checks the first word after the HQ insert. Assert that the rendered P and M yk_choice text contains `\n\nYuki is in the tall shape` and has no `\n\nShe is in the tall shape`.
- **TG2 (F12, F16):** the bans on time and shape words are short regex lists (`night|dawn|sun|morning…`, `cat|tall|small|human`). "dark", "moonlit", "shoulder", "lap", "paw", "tail" all pass. Widen the lists (dark, moon, stars, evening, noon, shoulder, lap, paw, tail, ears, hands), or run `packet.mjs --check`'s time-word check in the test.
- **TG3 (F11):** HA-P and HA-M's middle beats aren't pinned (the K1 assert compares against the constants, so it passes any change to them). Pin a word or two of each, e.g. `/Mei Lin nods, carefully/`.
- **TG4:** HA and HQ are tested only through `goTo` with faked flags. GV has a real walk; add one for HA/HQ: a real realm-7 breakthrough at rr_hub with the party (`runMed` 'med:bt' → "Get up." → `yuki_human_awaken` → `yuki_human_after` → yk_choice), asserting HA-P and HQ-P.
- **TG5:** HQ isn't walked for 'T' (heart_hub) or for M through the second choice ("Ask her to stay…"). Add both to the HQ loop.
- **TG6 (H1):** when the fix lands, the GV pin moves to "spirit-beast". Pin "root-kin" as absent from every local's quoted speech in AWAKE_VILLAGE.
- Checklist additions proposed: *"A cut's reason is grepped (v0.11.193 H1)"* and *"An insert before a scene's own first sentence: check that sentence's pronoun too, not only the anchor's (v0.11.193 M1)."*
