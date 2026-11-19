# Cold review C (code), v0.11.231 (P4-2 + D1)

Opus, cold. Read: the brief, both checklists, `git diff HEAD`, readers by grep. Probes in a scratch copy (`/tmp/rv-c`, a tar copy of the working tree). The working copy was not touched apart from this report and `p4-faults-review-c.json`. The full check was not run (the brief's rule); `mutate.mjs` ran `node tests/story.test.mjs --games 2 --workers 1`, which passes before any fault is planted.

## High
None found.

## Medium
**M1. `talk_mei` puts Ya on the path while she is away alone.** AG hides "Talk to Mei Lin." only when both are away (`meiOut = bothAway`). With Ya away alone, the talk opens, and three of its beats have Ya there. Probed at the Ashen Hills, Day 4, 10:00, `awayNow` = `ya`:
- n=0: "eyes going everywhere: herbs, tracks, Ya's back."
- n=6: "Ahead, Ya stops to smell a tree, moves on…"
- n=7: "Up ahead Ya shouts some cheerful remark at a bird."

n=1 and n=4 only report her words, so they are fine. On the long calendar (`BL_SPAN` 3), someone who talks to Mei Lin every day reaches the hills at about n=9. From there, 2 days in 3 give a "Ya ahead" beat. This happens on every hills day before her door is taken. The measure (`p4-measure-presence.md` row 287) looked at this card only in the "both" state. The brief has it neither fixed nor open. Failure: Day 4 on the long calendar, Ya has walked off, the player talks to Mei Lin and reads "Up ahead Ya shouts…". Checklist v0.11.230 M1 says to check the screen after each card; this is that screen.

**M2. The cairn has Ya there while she is away alone.** The open item says "the cairn while both are away". But `ah_scout` ends "Ya spits on the cairn and offers no comment" with no `awayText`. It shows (`!ah_cairn && !late`) in the `ya` state too. The open item is narrower than the fault: either widen it to "while Ya is away", or give that one sentence an away version.

## Low
**L1. The hawks' degree-3 stomp in the `ya` state says "over the two of you".** Mei Lin is there, so the party is three (the base text says "four"). `awayHawks` returns `AW.stomp_hawks[degree]` without `awayText`'s `ya`/`both` split. Probed: the same text in both states.

**L2. `patchUp` contradicts `ape_lost` while away.** `patchUp` now goes through `awayText` at every one of its 7 calls. In the hills by day that includes `ape_lost` on Day 5 if a door was never taken. Probed:
- `both`: "You bandage whatever will take a bandage…", directly above "You come round to Mei Lin's hands on your face. Ya sits next to you…".
- `ya`: Ya's "pronounces you soft" goes, but she is in the text below.

This sits inside the open item on the climb to the pass. Still, the change made the `both` line a contradiction. A cheap fix: pass `AW.patch_up` only from `ah_hawks_lost`.

**L3. The 19:00 edge, entered through a menu.** Probed:
- A "both away" hub at 18:45 → Forage (15 min) → `ah_forage` at 19:00 offers "Cinderberries with Mei Lin.".
- A "Ya away" hub at 18:55 → Train (10 min) → `bl_train` at 19:05 offers "Spar with Ya.". The hub, a minute earlier, hid her.
- Hunt at 18:50 → `ah_hunt` at 19:05 opens on "Threes," says Ya.

The rule is consistent (`late` at the screen), but she is back the moment a menu opens. The checklist's v0.11.217 "measure at the boundaries" applies. Untested.

**L4. "Back tomorrow" for a woman who can be back within the hour.** In task mode, "Spar with Ya." (and "Cinderberries with Mei Lin." while both are away) shows as `tomorrow` (`tasks.js:238`, via the kept `dailyKey`). The door that ends the absence today sits open on the same list. Probed: Ya away at 10:00 → spar `tomorrow`; set `ya_off_done` → `open`. The label is wrong both ways: it can open today, and on the long calendar it can say "tomorrow" again tomorrow.

**L5. 04:00–05:59 counts as day.** In `ahDay`, `late` is false at hours 4–5, so `awayNow` = `ya` at 04:00 (probed: 03:00 null, 04:00 `ya`). `toHour` treats the same hours as night. Reaching it needs a long breakthrough started late at `ah_hub` (`btMinutes` ≥ 240), which then reads "Mei Lin alone saw it". Not walked.

**L6. `packet.mjs` is blind to the away state.** It has no away sample and does not read `DAY_REPLIES`. `node tools/packet.mjs bl_train:1 ah_forage:2 --games 0` shows only the base results, and the hub's labels include "Talk to Ya.". A review or a draft of these lines from a packet never sees the away versions.

Checked and fine:
- **Import cycle:** no cycle. The import graph from `main.js` never leads back to `stomp_act1.js`, and both load orders work. `awayHawks` is read only at run time.
- **`awayReply`:** `f(g)` runs `noteDay` first, so `dayIndex` gives the same index as `byDay`. Every alt is the length of its list. A shorter alt falls back to the base.
- **`awayList`:** follows `byDay`'s keys (`ah_hunt`, `ah_hawks_won`, `r:ah_hunt:1`).
- **`awayMorning`:** all 3 `from` strings occur once in their texts, including both `blSpan` versions of Day 5. On Day 4's first morning the region is still `dw`, so no one is away (AR).
- **`DAY_REPLIES` readers:** the NC1 filter skips `away:`, the lint renders the functions, and the other key loops filter by prefix. `packet.mjs` does not read it (L6).
- **`onceADay` cinder gate:** keeps `dailyKey`, and `byOption`'s doneToday reads the composed `show`.
- **`sparYa.dailyKey`:** `bt_ya`.
- **Breakthrough flow:** `btText`, `btWho` and `awakeWho` read one clock. The breakthrough's `advance` runs before the text, so a sit that ends after 19:00 shows the party (AV).
- **FI:** every reader of `enc.intro` (the `game.js` log, `keepTail`, `plainFight`) goes through `prepare`. The night fights keep their `tail`, and the Elder's `+=` still feeds `keepTail`.
- **BYb-g:** `lore_realms` has no other quote reader.
- **Saves:** no new field, id, flag or key, and no flag or id is gone (the diff's ids and flags match on both sides). An old save at `ah_hub` in the evening behaves as before (the doors were already hidden by `late`). An old save in the Drowned Wood with `trio >= 2` had no reader there.

## Test gaps
- **TG-C1:** the AT walk (`P4-2 (AT)`) builds a new game each "day" and sets `g.lines = undefined`, so it only ever reads day index 0. The `day` helper and the `for (e…)` loop do nothing. No needle away version is read (`needle[0]` and `needle_f[0]` are null). Nor is any day-1+ version of the darts, hunt or hawks_won, and the `both` state has no other walk. Planted C1 and C3 were missed. The P5A walk covers days 3–4 of the drills in the `ya` state only.
- **TG-C2:** the walk reads the beetle as `ah_forage.choices[2].do(g)[1]`. The result is a single string, so that is always `''` and `beetle_after` is never checked. C2 and C8 were missed.
- **TG-C3:** the lint test asserts `away:` keys `>= 18`. There are 20, so dropping one list from the lint passes (C5 missed). Pin the exact key list.
- **TG-C4:** no test crosses 19:00 through a menu (L3), and none tests 04:00–05:59 (L5).
- **TG-C5:** the "no absent woman named" walk leaves out the screens after the cards that stay open (`talk_mei` in the `ya` state, `ah_scout`), and it checks the stomp texts for names only, not party counts (M1, M2, L1).

## Faults
| | caught | missed |
|---|---|---|
| Claude's (`p4-faults.json`, F1–F14) | 14 | 0 |
| Mine (`p4-faults-review-c.json`, C1–C8) | 3 (C4, C6, C7) | 5 (C1, C2, C3, C5, C8) |

Mine:
- C1: a both-away dart line names Ya.
- C2: the beetle's day-2 both line names Ya.
- C3: `darts_full[1]` names Ya.
- C4: `awayList` shifted a day.
- C5: one list dropped from the lint.
- C6: the Elder's tail emptied.
- C7: `yaOut` without the spring.
- C8: the beetle's day-2 `ya` line names Ya.

Command: `node tools/mutate.mjs <file> --cmd "node tests/story.test.mjs --games 2 --workers 1" --jobs 2`. Wall time 32 and 22 minutes on a loaded machine.

New kind for `review-checklist-code.md`: **a walk that rebuilds its game each "day" reads day index 0 every time.** Check that a by-day walk carries `g.lines` (or the same `g`) from one day to the next, and that every result it collects is a real index into the array the code returns.
