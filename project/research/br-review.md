# Cold review: v0.11.185 breakthroughs in the right place (BR1, D1)

Read: the diff, the packet, the three hub excerpts, Fable's drafts, `canon-card.md`, the `lore.md` sections "The world" and "Places and people", and excerpts of the code around the change: `prologue.js` 836–1000, `meditate.js` 17–115, `tasks.js` 149–280 and 433–446, `task_hubs.js`, `coil.js` `rewind`, `ashfall.js` (the arson), `act1_fallout.js` 130–176, `act1_return.js` 345–365, 432–450 and 645–652, `act1_heart.js` 14–19 and 193–218, `longforest.js` 710–760. I rendered the screens with a small script outside the repo and ran `packet.mjs --check` on the two new texts: 0 tics, 0 reused runs, 0 time words, 8 PAIR notes. I planted 15 faults with `mutate.mjs`.

Checked and fine: the refactor (`btText` matches the old function line for line; the only changes are `a1seen`, the dust/bark ternary and the closer constant); the realm 1, BT_REALMS and generic branches; realms 10 and 11 at Ashfall; the frame before each realm's opening (realm 1 "You sit", realm 2 "Once more", realms 3–14 the realm's name, 10 and 11 read true after "Not in here"); `bt_return` is set on both paths (`runMed`, `runTask`), and every place that can be `bt_return` is a MED_SCREEN or a task hub, so no other reachable roof or village is left; Yuki is always the cat at realm 1 (`yukiForms`, the realm resets with each Coil); `knows` is always true in Act 1 (`rel['Mei Lin']` carries over in `rewind`); day and night against AW1; the four tribute endings (in the bluff ending, Wen's "We will say that, and nothing more" reads as covering for the bluff, which is good); sensing (no local feels anything); C1, C2 and C3 against Fable's drafts.

## Findings

**M1. `js/story/prologue.js:915` (AW1): Pock-Face.** In the game Pock-Face is "Lackey Pock-Face", the arsonist Gao pays on night 5 (`ashfall.js:93`, `arson_won`, `arson_lost`). He shows up only when Gao is alive and was not spared. With `gao_broken` or `gao_spared` the player has never met him, so the name refers to nobody. After `arson_lost` (`loft_burned`), the man who burned Mei Lin's herb loft is standing in his doorway on the same street, head bowed and unpunished. Only after `arson_won` (he cried in the lane) does the joke work. The test's own rule ("no one whose state varies") misses him because the ban list has no Pock-Face. **Fix:** use someone unnamed whose state never changes, e.g. "the smith stands with his head bowed…", and add `Pock` to the ban regex at test line 4016.

**M2. `js/story/act1_return.js:362` (rt_arrive, Day 20) reads `sky_witness` only.** Every AW1 game enters Act 1 at Mortal Vessel, so `sky_witness` is never set. After the village watched Heaven fail to convict him on Days 8–11, the Return still shows the line for a village that never saw it: "the stranger who walked into the forest and walked back out, they regard like a sum that has stopped adding up". The line it should show is "…as they did once the sky had come for you and left again: as weather." The owner deferred the GU check, but this text follows from it. **Fix (needs a pick, it adds a flag):** a text-only flag set at `BT_ASHFALL_A1` (e.g. `a1_sky_seen`), read by line 362 and by no check. The other option is to take this line into the later `sky_witness` pick and name it there.

**L1. `prologue.js:922` (HF): "You climb" for realms 2–14.** James flies from Foundation, and realm 4's own body says "You have been leaving the ground since Foundation". Climbing fits only realm 1. **Fix:** a verb that works for both, e.g. "You go up the widest crack to where it opens on the sky…".

**L2. `prologue.js:974` (AW2) with realms 12 and 14 at Ashfall.** Realm 12 ends "there is a silence, like a man looking at his own fist", and the village closer follows with "Ashfall watches it go in total silence". That is "silence" twice in a row, and nothing "goes" (the bolt hit him). At realm 14 the clouds "hold there", and then they "go". This pairing existed in the prologue, but there it was out of reach. I didn't measure whether Act 1 Ashfall reaches realm 12+ (it resets each Coil). **Fix, if it is reachable:** for 12 and 14, a closer without "go" or "silence", or `own.day` / `own.night` as for 10 and 11.

**L3. `prologue.js:945–946` with HF: "Nobody saw it except the trees".** On the lip this is fair (Fable's note). But Mei Lin and Ya are in the hall right below (`heart_camp`), and the storm sits over the cracks they get their light through. The Blackroot hubs have the same problem: Ya and Mei Lin are at the camp (`rr_hub`, `dw_hub`, `ah_hub`, `rt_camp`), and in the Drowned Wood the bolt lands "in the moss" where the party wades. These existed before and are outside BR1. Open, options later.

**L4. `act1_fallout.js:155` (pre-existing):** in the `lost` ending the letter says the sky gathered tribulation over James on tribute day, even when he enters Act 1 at Mortal Vessel. AW1 doesn't contradict it, and reads as the second time. I note it only because the brief asked about tribute endings. Open.

## Test gaps

- **TG1. Claude's cuts are not pinned** (checklist v0.11.183 TG5). Reverting C1 ("none"), C2 ("like a man signing…") or C3 ("dead crown… among the boughs") passes the story test and all other runnable suites. **Fix:** one assert per cut: `/as far as one, and it missed/`, `/as one signs for a delivery nobody ordered/`, `/on the lip\.$/` with `!/crown|bough/`.
- **TG2. The refactor is not pinned.** Changing the outdoor night closer (F11) or the prologue village's witness (F12) passes: the "unchanged" asserts only look for the frame, the AW1 block, the village closer and "moss", and `/Not in the history of the mountain/` still matches "mountains". **Fix:** hash `btText` for 3–4 fixed states (outdoor day and night, prologue village realm 1, realm 2 generic) against the pre-push values, as the Heart block does (`createHash`).
- **TG3. textlint never renders AW1 or the frame.** Its sample states set no `bt_return` (`tools/textlint.mjs:44`), so tics and reused runs in them are checked only by a manual `packet --check`. **Fix:** add `BT_A1_WITNESS` and `BT_TREE_FRAME` to textlint's POOLS (checklist TG4), or one sample with `bt_return` set to `fo_ashfall` and to `heart_hub`.
- **TG4 (low).** `bt()` (test line 3992) never sets `rel['Mei Lin']`, so every Act 1 render uses the "under a week" `recognise`, which no real Act 1 game shows. The real-path loop (4009) puts `rt_ashfall` and `heart_hub` on Day 10. Set the rel, and use the hubs' own days.
- **TG5 (tool). `tools/mutate.mjs:20`:** `SKIP` matches by basename, so it drops `js/art/` as well as `art/`. In a copy, `tests/data.test.mjs` fails on the missing `js/art/art.js`, and so does `check.sh quick`: a harmless control fault came out "caught". Faults can't be measured with those commands. **Fix:** skip only `path.resolve(f) === path.join(src, 'art')`. Add this to the checklist next to the browser note.

## Planted faults (`faults.json`, default command `story.test.mjs --quick`; report `mutate.md`)

| Fault | What it breaks | Result |
|---|---|---|
| F1 | bolt "in the moss" at Act 1's Ashfall | caught |
| F2 | realms 10/11 at Ashfall get the village closer | caught |
| F3 | realm 2 (generic) at Act 1's Ashfall keeps the camp closer | caught |
| F4 | the frame only for realm 1 | caught |
| F5 | `sky_witness` also set at Act 1's Ashfall | caught |
| F6 | `rt_ashfall` dropped from `BT_ASHFALL_A1` | caught |
| F7 | the two witness blocks swapped | caught |
| F8 | C1 reverted | **missed** |
| F9 | C3 reverted | **missed** |
| F10 | C2 reverted | **missed** |
| F11 | the outdoor night closer changed (refactor) | **missed** |
| F12 | the prologue's witness changed (refactor) | **missed** |
| F13 | Mei Lin's mother in AW1 | caught |
| F14 | the frame leaks to `rr_hub` | caught |
| F15 | a time word in AW1 | caught |

10 caught, 5 missed, 0 not applied (of 15). F8–F12 were also run against saves, faq, the four Act 1 parts and rules (`mutate4.md`), and every one was missed; the harmless control passed. Their runs against `check.sh quick` (`mutate2.md`) don't count, because of TG5.
