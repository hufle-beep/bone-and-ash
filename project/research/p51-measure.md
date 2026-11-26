# P51 — G1's read (2026-11-26, about 19:45; v0.11.282, 305af51)

Reads and one model run only, nothing changed. The options built on it: `claude/p51-options.md` (the project doc).

## MT, the menus' own texts (roadmap-2.md section 4 (a))
Every `TASK_HUBS` menu outside `tests/lib/deadmenus.mjs`'s emptied ten, its text rendered on `newGame(1)` (words):
fo_council 111 (Days 8–10 each its own), rr_scout 133, fo_palisade 106, fo_clinic 106, drill 75, rt_hunters 69, clinic 67, fo_drill 50,
workshop 44, wild_explore 27 (a door menu), wild_forage 19 (with the pantry line). About 807 words at one state; the council's three days
and the palisade's stages are separate texts. Built in v0.11.283: the key is the text's first sentence (the pantry, the militia's progress
and the jade bracket change later sentences only).

## CP, the "(cap)" lines (d)
`game.js` `awardXp`: once a skill is at T10 L10, every award prints "… at T10 L10 (cap)" for it, GU and Yuki's Qi Use (2–3 a result).
The owner's v0.11.164 save: about 150 results on Days 18–21 gained nothing (`history-20.md`), so about 300–450 such lines.

## SV, the cut-off saves (e)
`main.js` `shareToGitHub`: a link up to 7,500 characters, else copy and paste. Two shared saves arrived cut at exactly 20,001 bytes.
Packed sizes now: the Coil 8 save (`saves/2026-11-13-1356-incremental-a1_again.json`, 114,939) 35,253 (URL-encoded 37,507); the long
calendar's Day 64 save 16,297. Where the cut happens can't be seen from the workspace (GitHub's page or the phone's clipboard).
Round trip in v0.11.283: the Coil 8 save in two parts (18,000 + 17,253), joined by `tools/joinsave.mjs`, unpacks to the same bytes.

## SU, sit until supper (b)
`EVENING_HOUR` (oneoff.js): wilds 15, the Return's Ashfall 15, six hubs 16 (the week's work ends there). "Cultivate until the limit"
stops with `shut` when the screen's own Cultivate closes. **Corrected while building:** that is not the week's evening hour: on the owner's
saves the sits from 08:00–15:00 end at 19:00 in Ashfall (`late`: hour ≥ 19) and 18:00 in the Heart; the Long Forest's at 20:00. The
text names the sits' end time.

## EA, an Eat button on story screens (c)
`node tests/models.test.mjs --model careful --games 100 --off 0`: under Fed 30 with food and nothing to eat on screen 38 times (0.4 a
game; Fed 20s / 10s / 0–9: 21 / 17 / 0); bl_end 33, dw_enter 5. In v0.11.163: 921 per 300 games (3.1 a game). Closed as accepted.

## UC, the update check (g); SDK (h)
`update.js`: one call to GitHub's API an app start (60 an hour allowed per address); no failed check reported since build 3
(2026-11-12). `android/app/build.gradle`: compileSdk and targetSdk 34, minSdk 26. A side-loaded APK has no store deadline; 35 forces
edge-to-edge on Android 15 (the page under the bars; insets needed; only the phone can test). Both closed as accepted.

## WB, Welcome back (i)
`design.md`'s third notice (the build label and What's new done in v0.11.150). The clock stops while the game is closed; a return draws the
screen but not the last result. `g.log` keeps the last 200 entries, 12 lines each.

## L4, L7
L4: the forecast's redraw 41 → 71 ms with Yuki's row on (v0.11.210's review, the workspace); no slowness reported since: closed.
L7: `#tip` is `position: fixed` at the bottom left (`left: 0.5rem`; from 1100 px `width: min(28rem, …)`), under the story column, and
outside the 112 rem app on a wider window.
