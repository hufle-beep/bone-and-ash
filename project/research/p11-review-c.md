# P11-A cold review C (code, tools, tests), v0.11.238

Reviewer C, Opus, cold. Read: the diff, both briefs, both checklists, line ranges of `act1_blackroot.js`, `ashfall.js`, `lines.js`, `calendar.js`, `coil.js`, `game.js`, `packet.mjs`, `textlint.mjs`. Scratch copy `/tmp/rv-c` (sw.js VERSION set to 0.11.237, made a git tree). The working copy was not edited; the only new files are this report and `p11-faults-review-c.json`.

## Verdict
No H and no M. The camp lists match the nights the long calendar really camps in each region, and the week-1 six is gated the right way. The open points are small: tool flags and stale comments.

## What was measured
- **The camps, walked with real choices** (my own walker: `bl_start` to `heart_view`, the taps a player makes, real fights, the hub clock moved on to 16:00). Three seeds (4242, 777, 31337), long calendar: Root Road texts 1–5 on cal 65–69 (`bl_day` 1 n 0–2, day 2 n 0–1). Drowned Wood texts 1–4 on cal 70–73: text 1 is the arrival (`bl_day` 2 n 2, the Root Road's story night), text 4 is day 3 n 2 with `drowned_done`. Ashen Hills texts 1–5 on cal 74–78. The list never wraps, and every index lands on the night the brief names. Old calendar: RR 1, DW 2, AH 1 (texts 1, 1–2, 1), the same as before.
- **Wrap paths:** every way out of the split (`wyrm_won`, `wyrm_lost`, the bridge, flight) goes to `dw_enter`, so one arrival camp. The hollow gate stops a camp on the wood's last day before the hollow. Some hot-spring branches sleep without `bl_camp`: then text 4 just doesn't show that night, and no list runs past its end. The `yuki_path` returns to `bl_camp` fall on the same text day, so they get the same text.
- **Coil change:** a rewind wipes the day record (`coilStamp`) but goes back to Act 1's dawn, before the Blackroot, so the region counts start again from 0 and stay in step. The only snapshot taken mid-Blackroot is a pre-0.9.6 save "as loaded", and the flip gives that save `calBl` 1 (one camp a day), so it never reaches indexes 3–4.
- **A save from v0.11.237 mid-region / mid-week:** the record holds more days than before, so the next night reads the new index (the RR camp at cal 69 with four days noted shows text 5, skipping text 4). The week-1 quiet key at 3–6 reads `QUIET_W1` from that point, and the 7th night wraps to text 1. Nothing breaks and nothing repeats. A save resting on that screen redraws the new text once on load. Harmless.
- **`longCal` gate:** the arson night is checked first (dayKey null). Weeks 2–3 still go to `seqText` with their own keys: planted C7 (week 2 falls to the six) is caught. The old calendar only exists in test games since the flip (FP1). On it, real play reaches index 0 and 1 only.
- **Readers of the texts:** `again.js`, `music.js`, `songs.js`, `remember*.js`, `week.js` (`FOLD_SCENES`) and the models test hold no count of three for these scenes. The tests that pinned three (CB3, EVk, TG2, TG5/VK) are updated.
- **TG (lint):** in a scratch copy of `textlint.mjs` I printed the camp paragraph of every new sample. RR k3, k4 and AH k3, k4 show the new texts; DW k1–k3 show texts 2, 3, 4. With the TG block removed, the lint reports 7 snapshot changes (variant words 118,730 → 117,677). `onDay` fakes every key (a Proxy), so it is on the right key, if bluntly. The scene texts render on the sample itself, not on `dryClone`, so the proxy is kept.
- **PKs (packet):** the flags and day index are the game's real ones for every new state (DW k0 = day 2 n 2; k1 = day 3 n 0; k2 = day 3 n 1; k3 = day 3 n 2 + `drowned_done`; RR/AH fourth and fifth = day 2 / day 5 with n 0 and 1). The minutes are not (L2).
- **PKf:** `village_night` packet with `--games 0`: whole 24,676 B; `--week 1` 12,977 B; `--week 2` 12,183 B; `--week 3` 12,186 B. The "as seen in play" texts are not filtered, but they come from old-calendar bot games and number 4 at most (with `--games 4`: 2 texts, none from week 2 or 3).

## Findings
**L1 (PKf CLI): `--week` is silently ignored in three cases:** with `--check`, with `--tags`, and as the last argument (`opt` returns undefined). Failure scenario: Claude runs `packet.mjs --check drafts.txt --week 1` to check time words against week 1 and gets the whole-game check with no warning. `--week 9 --check x` isn't refused either.

**L2 (PKs): the new states' clock** is `70*DAY + 20:00` (calendar day 71 = story day 13) for all of them. The real nights are cal 68–69 for the RR fourth and fifth, cal 70 for the DW first, and cal 77–78 for the AH fourth and fifth, at 19:00 (`bl_camp` sets the hour to 19). Nothing on `bl_camp` or its screen after reads the calendar day today, so the packet output is right. A later line keyed on `storyDay` or the hour would read wrong in these states. Fix: `calMinutes(g, 10 + bl_day, 19)`.

**L3 (stale comments):** `act1_blackroot.js` still has the v0.11.236 line "the fourth and fifth nights start the list again" just above the new lists. `tests/story.test.mjs` CB3 still says "texts 1, 2, 3, then 1 and 2 again" above `camps`. The packet's comments say `village_night` is "19.3 KB whole" and "18.8 KB whole"; measured 24.1 KiB (`--games 0`).

**L4 (old behaviour, not a regression):** a long-calendar save with `calBl` 1 (flipped or loaded inside or past the Blackroot) plays the 5-day road. Its wood's story night still shows text 2 ("Another raft ... better chosen"), and the new wood's-edge text never reaches it. Noted for the owner only.

## Test gaps
- **TG-C1:** the CB5 / CB3 tests set `bl_day` and the clock by hand. No test walks the Blackroot with real taps and checks which text shows on each night. A change to the region flow that keeps each list working alone would pass them. My planted C5 (camp in the wood before the hollow) and C6 (a sixth Root Road camp) are caught, but by the older gate tests, not by P11-A's. Suggest one walk per calendar (the policy above, about 60 lines) that asserts RR 1–5, DW 1–4 (4 = `drowned_done`) and AH 1–5.
- **TG-C2 (PKf):** the tests call `packet()` for `village_night` only, and the CLI only with `--week 4`. Three planted faults are missed (C1–C3, below). Suggest: `packet(['bl_camp'], { week: 1 })` still draws the Drowned Wood's fourth-camp state; the CLI `village_night --week 1 --games 0` exits 0 and has no week 2 state; the CLI with no `--week` still has week 3.
- **TG-C3:** the TG source test pins the loop header by regex. The body is guarded only by the lint-baseline test (C4 caught, 2 fails), which is fine. A test reading the samples' rendered camp paragraphs would be direct, but this is optional.

## Planted faults (`tools/mutate.mjs`)
- **Claude's** (`p11-faults.json`): story F1–F7, F11–F13 with `story.test.mjs --games 2 --workers 1`, **10/10 caught**. Tools F8–F10 with `tools.test.mjs`, **3/3 caught**.
- **Mine** (`p11-faults-review-c.json`): **4 of 7 caught.**

| Fault | What it breaks | Result |
|---|---|---|
| C1 | PKf filter drops every state without a `week` (a Blackroot scene with `--week` draws no states) | **missed** |
| C2 | the `--week` value taken for a scene id (dropped from `vals`) | **missed** |
| C3 | every packet without `--week` cut to week 1 | **missed** |
| C4 | the later-camp lint samples lose their day index | caught (2 fail) |
| C5 | camp in the wood on its last day without the hollow | caught (3 fail) |
| C6 | a sixth Root Road camp on its story day | caught (21 fail) |
| C7 | week 2 falls to the week-1 six | caught (a TypeError in the test, not an assertion) |

Note for the mutate runs: in a copy without `.git`, `tools.test.mjs` fails 2 before any fault (leftovers and consistency both call `git ls-files`). Each copy has to be a git tree, as `--root` users must know. Measured in `/tmp/rv-c` after `git init`: 499 passed, 0 failed.

## Checklist additions proposed (code part)
- **A tool flag added to one mode (v0.11.238 C L1, TG-C2):** test it with every other mode it can meet (`--check`, `--tags`, the flag as the last argument) and with its absence, not only its refusal; a filter's "keep the others" side gets a test on a scene outside the filter.
