# Push 19: raw numbers (2026-11-21, on the v0.11.248 working copy, not yet pushed)

Scratch `/tmp/p19w` (working copy) and `/tmp/p19o` (`git archive HEAD` = v0.11.247), hook rebuilt (`/tmp/p19t/patch.mjs`, `patch2.mjs`): a row a screen (Coil, day, story day, scene, fold kind, Mei Lin's / Ya's affection, `trio`, the flags) and every `bumpRel` of either. `--games 10 --off 0 --workers 1 --texts`, long (`--cal 7`, 29 passed) and old (18 passed), one run at a time; a rerun reproduced exactly. **On v0.11.247 the hook gives p18's VF, SD and stops exactly**; memory within 0.6, SV higher (it counts every screen of a stay): compare hook against hook. Trials, scratch only: `/tmp/p19f`, `p19g` (NS2), `p19t1`, `p19t2` (gains). A game, Careful / Sociable / Completionist / Cultivator, long unless "old".

## 1. v0.11.248's effect
- **VF 0 / 0 / 2.1 / 2.5 → 0.1 / 0 / 0.1 / 0.1** (forecast −2.1 / −2.5: met). RH, VM, WT, FW5, FH6 0 everywhere; the hawks 0.6 → 0 (Compl.), but 0.1 new for the Cultivator (`ah_hawks_won` day 78); new 0.1 `bl_night_won` day 74 (Careful, Compl.).
- **All folded 212.2 / 210.9 / 48.3 / 27.1 → 255.1 / 253.8 / 36.3 / 27.8**; memory 202.5 / 202.5 / 24.3 / 0 → 244.7 / 244.7 / 12.9 / 0; SV 8.1 / 7.0 / 13.4 / 14.5 → 7.7 / 7.1 / 13.9 / 13.6; SD 1.6 / 1.4 / 8.5 / 10.1 → 2.6 / 2.0 / 9.4 / 14.1. Repeated in full 0 everywhere.
- **Paths:** 0 of 40 the same, all from day 24 (v0.11.247 walked `village_night → ashfall`; now `village_morning`, week 1's new texts); then the dice differ: Coils 4.1 / 4.1 / 2.2 / 2.0 → 4.3 / 4.3 / 2.1 / 2.0; last nights quiet 3 / 4 / 3 / 2, Mei Lin 1 / 0 / 0 / 0, Ya 1 / 2 / 2 / 2, trio 5 / 4 / 5 / 6.
- **Taps 921 / 1004 / 998 / 1175 → 983 / 1062 / 984 / 1186**; evening stops 231 / 231 / 108 / 83 → 243 / 243 / 103 / 84; night screens walked 136 → 115 (C / S).
- **Old calendar:** paths 40 of 40 the same; every figure equal but Compl. memory +0.1.

## 1b. NS2: the village mornings on later Coils (found here)
- `village_morning` a game: Coil 1 full 4.0 → 9.0 (C / S / Compl.; Cult. 5.6 + VF 0.9 → 11.5): the new texts, intended. **Later Coils: memory-folded 8.4 / 8.4 / 0.8 / 0 → 31.4 / 31.4 / 1.3 / 0**: every morning of every later Coil stops (one Careful game: 14 a Coil, days 23–29 and 36–42).
- Why: NS1's walk-past reads `shownEarlierDay` (`L.vd`); `L.vd` is noted only in `laterDayAgain`, which `againView` never reaches when the memory branch returns first. So on a later Coil no morning is ever noted.
- **Trial NS2a** (the memory branch notes the day too): later-Coil mornings 31.4 → 19.8 (−11.6), all folded 232.3 / 232.2 / 36.2 / 27.8, taps 951 / 1034 / 984 / 1186. **Trial NS2b** (the plan also walks past a morning read on an earlier Coil): memory 0, full 3.1 (texts not read before), all folded 223.2 / 223.9 / 34.7 / 27.8, taps 954 / 1039 / 981 / 1186. Both 29 passed.

## 2. Group f (1): the gates and TS5
- **Gates** (`act1_common.js`): kisses Mei Lin 30 (prologue `evening2`, sets `romance`, which counts as liked from then on) / Ya 45; liked 72 (or the night's flag, or `trio` ≥ 1); `REL_MAX` 150 (`game.js`); catch-up ×3 to the best ever.
- **Long, Coil 1 (no catch-up):** Mei Lin day 22 6 / 6 / 3 / 10, day 29 28 / 28 / 26 / 37, day 36 70 / 70 / 79 / 88, day 42 119 / 119 / 127 / 127. Reached on day: 30 → 30 / 30 / 30 / 29; 72 → 37 / 37 / 36 / 35; 150 → 58 (Compl. 9, Cult. 10 games). Ya met day 51; 45 → 59, 72 → 66, 150 → 74 (Compl. / Cult.). Careful and Sociable lose Coil 1's tribute in 8 of 10.
- **Long, last Coil:** Mei Lin 30 day 7 / 7 / 27 / 29, 72 day 29 / 29 / 35 / 35, 150 day 40 / 37 / 55 / 58; Ya 45 day 67 / 62 / 59 / 59, 72 day 72 / 67 / 66 / 66, 150 5 / 10 / 10 / 10 games. Every bot passes every gate (40 of 40); both liked at `rt_evening` 40 of 40.
- **Old:** Coil 1 never reaches 30 (Mei Lin 10–13 at its end); last Coil Mei Lin 72 in 4 / 10 / 9 / 10 games (day 11–12), Ya 72 3 / 10 / 9 / 10; both liked at the last night 1 / 10 / 9 / 10.
- **TS5 (long, Coil 1):** Mei Lin's village weeks 1 / 2 / 3 +19.6 / +44.0 / +55.3 (Careful; weeks 2–3 7.1 a day): `mei_walk` +5 every evening from week 2 (+31 a week, 6.2–6.3×); a roof night +7 (`supper` +4, `supper_roof` +3; 2.2–2.4 a week, the Cultivator 4–5: +16–22). Ya's (Compl. / Cult.): `fo_supper` +11–13 (5–6×), `bl_train` +11–12, `fo_ya_time`, `talk_ya` +9–12 a week.
- **Gain rules, as trials (real runs, catch-up in; long, last Coil):**

| | Mei 30 day | Mei 72 day | Mei at day 42 | Ya 72 day | Ya 150 (games) | both liked, last night |
|---|---|---|---|---|---|---|
| now | 7 / 7 / 27 / 29 | 29 / 29 / 35 / 35 | 145 / 145 / 129 / 127 | 72 / 67 / 66 / 66 | 5 / 10 / 10 / 10 | 40 of 40 |
| GT1: a scene's gain once a story-week | 26 / 26 / 35 / 37 | 36 (9) / 40 / 65 / 68 | 95 / 95 / 50 / 45 | 94 (6) / 75 / 73 / 73 | 0 / 0 / 1 / 2 | 35 of 40 |
| GT2: 20 a story-week, each | 11 / 11 / 30 / 31 | 36 / 32 / 51 / 54 | 129 / 129 / 63 / 59 | 73 / 72 / 71 / 71 | 0 / 0 / 5 / 7 | 40 of 40 |

  Last nights GT1 quiet 3 / 3 / 5 / 3, Mei Lin 5 / 0 / 0 / 1, Ya 0 / 2 / 1 / 1, trio 2 / 5 / 4 / 5; GT2 quiet 2 / 4 / 5 / 4, Mei Lin 0, Ya 1 / 2 / 1 / 2, trio 7 / 4 / 4 / 4. The prologue kiss (`evening2`, day 42) stays open in both. Old calendar: neither moves a gate day (one day a story day). On paper (Coil 1): 30 a week moves Mei 72 one day.
- Save: either rule needs one additive record (the week's gains by person, or by scene), reset with the Coil; no IDs change.

## 3. Group f (2): the 7 entries with no affection test, read
- **Gated in practice (4):** `mei_bond` (both entries: `likesMei` / `onlyMei`; the static count missed the helper); `rt_trio_night` ×2 (behind `trioReady`: both liked, `trio` ≥ 3); `yk_night_solo` (`ykLover`: Yuki ≥ 72 at her question, or carried); `fo_last_night` (a fixed eve; its branches by `romance` / both / Ya ≥ 45; when both liked it has no "sleep alone": 0 of 40 visits long, 2 of 53 old).
- **Open, no gate (3):** `hot_spring` (1.0 a game, all bots) and `heart_spring` ×2 (0 / 0 / 1.5 / 1.4): group bathing comedy, no romance beat; the hot spring's romance follow-ups (`spring_ya`, `mei_curious`) branch on both / Ya only. One ungated line: `mei_curious`'s not-both "Both is an option."

## 4. Group f (3): carriers and reach (long, a game, all Coils | last)
- **Tier beats:** the first carrier after a tier (last Coil, of 10): Mei 30 → `supper` 9 / 9 / 7 / 5; Mei 72 → `supper` / `supper_roof`; Ya 45 → `bl_camp` (Careful 10), `fo_mei` / `fo_night` (others); Ya 72 → `bl_camp` 7–10. A version: 4 beats (Mei 30, 72; Ya 45, 72), ~120 words each with form clauses, ~500 words, 1 Fable run; a once-a-Coil flag each.
- **Bedtime offer:** `rt_evening` (1.0, both liked 40 of 40) offers trio / Mei / Ya / quiet (+ Yuki's); the hot spring both 10 of 10 (three / just Ya; its first screen has "turn your back" and "leave"); `fo_last_night` both 0 of 40. Gap: its both-case "sleep alone", 1 label + ~40 words.
- **Decision point / alone outcome:** `rt_evening` and `rt_quiet_night` (~230 words) exist, 1.0 and 0.2–0.4 a game.
- **Remembered line:** games with Mei ≥ 30 or a flag on an earlier Coil, long 8 / 8 / 1 / 0 (2.3 later Coils a game C / S), old 8 / 10 / 6 / 4; carriers `evening2` 2.5 / 2.5 / 0.7 / 0.5, `talk_mei` 1.0 / 15.0 / 12.4 / 12.8. ~6 lines, ~180 words; a carried record (additive).
- **Echo scenes:** Coil ≥ 3 reached long 8 / 8 / 0 / 0, old 10 / 10 / 10 / 10 games. Which scene, threshold: a design.

## 5. Group f (4): the romance nights after a burn (LC1)
- Burned: 0 of 80 again. `fo_mei_night` ("mint and dry hay, both of them newer than the beams"), `rt_mei_night`, `rt_trio_night`, `yk_night_mei` / `_all` ("mint and hay") all come after the Fallout's re-hang (`fo_night`: "the first bundles hung since the tribute"): **no contradiction with LC1.** Soft spot: Fallout day 8 without a palisade opens "There is no palisade yet", so day 9's "The mint in the rafters has been joined…" is the first herb line; it implies the re-hang.

## 6. Group f (5): the old calendar's quiet-night index 1–2
- **No route.** Old: `village_night` on 2 days a Coil at most (vday 1 quiet = index 0; vday 2 always the arson night, whose every end sets `night5_done` and turns vday 3; vday 3's evening is `evening` → the tribute); 0 of 40 games. Not dead text: on the long calendar they are week 1's nights 2–3, before any burn.
