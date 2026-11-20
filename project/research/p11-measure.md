# Push 11: raw numbers (2026-11-20, on the v0.11.237 working copy, not yet pushed)

Scratch copy `/tmp/p11w` (the working copy untouched, no `.git`). Its `tests/models.test.mjs` carries one measuring hook (`tests/lib/p11hook.mjs`, called after `againView`; switched off before the replay check's two games), `js/story/again.js`'s fold returns carry a `why` (mem / SV / SD / VF on a new visit / VFk, VF kept on a redraw), and `tools/textlint.mjs` can dump its renders of four scenes (`P11LINT`). Scratch only, never to copy back. A second scratch copy `/tmp/p11o` is `git archive HEAD` (v0.11.236) with the same hook, for the before figures and a path check.

## How
- `P11OUT=… node tests/models.test.mjs --model careful,sociable,completionist,cultivator --games 10 --off 0 --workers 1 --cal 7 --texts` (40 games, 47 s; 29 passed). Screens 4,816 / 5,220 / 4,901 / 4,632, repeated in full 0: **the same as v0.11.231–236**.
- The old calendar: the same without `--cal 7` (40 games; 18 passed; screens 2,018 / 2,758 / 2,819 / 2,813).
- Both runs again on `/tmp/p11o` (v0.11.236). **Path check:** a hash of every text screen (scene, minute, Coil) per game: **the same in 80 of 80 games** (both calendars). The plan's stops a game are the same too (Careful read 43, evening 218; Completionist read 34; Cultivator read 34).
- Lint: `node tools/textlint.mjs --list` (331 scenes, 1,820 lines), and the renders of `bl_camp`, `village_night`, `talk_mei`, `talk_ya` matched against the source lists.
- Packets: `node tools/packet.mjs <id> --games 0`, bytes; blocks by `[text · …]` header.
- As p6–p10: a screen counts once a visit (a new scene or a new text). "Folded" = `againView` folds it. Figures are a game: Careful / Sociable / Completionist / Cultivator. Long calendar unless marked "old".

## 1. v0.11.237's effect
- **`village_night`, the quiet nights:** folded **52.1 / 52.1 / 19.8 / 13.3 → 46.1 / 46.1 / 13.8 / 7.0 (−6.0 / −6.0 / −6.0 / −6.3; forecast −6.0 / −6.0 / −6.0 / −5.0).** The scene in all (with the arson night's token text, 1.4 / 1.4 / 0.2 / 0 by memory): 53.5 / 53.5 / 20 / 13.3 → 47.5 / 47.5 / 14 / 7.
- **By index (first Coil):** index 7–9 (week 2, s0–s2) and 13–15 (week 3, s0–s2) now read in full: 1.0 each, Cultivator 1.0 / 0.9 / 1.0 and 0.8 / 0.7 / 0.6 freed (= 5.0, the forecast). VF left: index 3–6 (week 1), 10–12 (week 2 s3–s5), 16–18 (week 3 s3–s5): **10 / 10 / 10 / 7.0.**
- **Why Cultivator beat the forecast (−1.3 more):** index 16–18 fold 0.8 / 0.9 / 1.0 → 0.5 / 0.5 / 0.6, index 10–11 0.9 → 0.8: Yuki's form changes mid-week, so a week's s3–s5 text differs by form from its s0–s2 and reads in full.
- **Later Coils:** memory folds 36.1 / 36.1 / 3.8 / 0 (1.9 / 1.9 / 0.2 / 0 a night, index 0–18): unchanged, and no new text changes them.
- **`bl_camp`:** shown 20.9 / 20.1 / 29.8 / 28.5 (unchanged); folded **7.1 / 7.0 / 15.0 / 14.4 → 11.9 / 11.1 / 20.8 / 19.5 (+4.8 / +4.1 / +5.8 / +5.1: HS2's redraws, forecast to fold: exact).** Why: SV 6.9 / 6.1 / 9.7 / 8.7 (every stock-only redraw; the 2.1 / 2.0 / 3.9 / 3.6 that were VF kept now fold by SV first), VF 5.0 each, SD 0 / 0 / 6.1 / 5.8, memory 0.
- **Stock-only redraws in full: 4.8 / 4.1 / 5.8 / 5.1 → 0.** **Folded camp screens carrying their stock (`av.state`): 119 / 111 / 208 / 195 of 119 / 111 / 208 / 195 (all); without 0.** Old: folded 1.7 / 6.1 / 0.3 / 1.2 → 4.5 / 9.0 / 2.5 / 3.4 (+2.8 / +2.9 / +2.2 / +2.2, the old redraws), all with their stock.

## 2. The talks' later beats
- Unchanged: folded `talk_mei` 0 / 4.0 / 1.3 / 1.6, `talk_ya` 0 / 4.0 / 1.2 / 1.5; **both 0 / 8.0 / 2.5 / 3.1**, all VF. Shown 1 / 15 / 12.3 / 12.6 (Mei Lin), 1 / 15 / 12.2 / 12.5 (Ya). Old: Sociable 4.0 by memory, the rest 0.
- By beat (both talks the same): beats 0–10 read in full; **beat 11** folds 0 / 1 / 1 / 1 each talk (the quiet walk, 5 + 6k), **beat 12** 0 / 1 / 0.3 / 0.6 (Mei Lin) and 0 / 1 / 0.2 / 0.5 (Ya), **beats 13–14** 0 / 1 / 0 / 0 each.
- **Each talk's cycle already has six (beats 5–10):** a text for beats 11–14 is a seventh to tenth, past the owner's six for social scenes (a rule change). Within six: no fix.
- Texts: renders 92–158 words (Mei Lin, median 119), 38–148 (Ya, median 101); Mei Lin's carry a Ya-away version. **TL4** (beats 11–14, 4 a talk): 8 texts + 4 away versions, about 1,000–1,200 words, 2 Fable runs: **−0 / −8.0 / −2.5 / −3.1.** **TL2** (beats 11–12): 4 texts + 2 away, about 500–600 words, 1 run: **−0 / −4.0 / −2.5 / −3.1.** Packets `talk_mei` 5.2 KB, `talk_ya` 5.9 KB.

## 3. CB5 and EVn after v0.11.237
- **CB5 (the camps' nights 4–5: RR and AH day index 3–4, the DW's 4th, index 3):** folded RR 3 1.2 / 1.3 / 2.3 / 1.8, RR 4 1.3 / 1.4 / 2.3 / 1.8, AH 3 1.1 / 1.4 / 2.5 / 2.8, AH 4 1.6 / 1.2 / 2.3 / 2.1, DW 3 1.9 / 1.7 / 2.0 / 1.9: **7.1 / 7.0 / 11.4 / 10.4**, of them **VF 5.0 / 5.0 / 5.0 / 5.0**, SV 2.1 / 2.0 / 3.9 / 3.6, SD 0 / 0 / 2.5 / 1.8.
- A text each for those five nights (RR 2, AH 2, DW 1; about 225 words, 1 Fable run): **−5.0 / −5.0 / −5.0 / −5.0** (p10 said −7.1 / −7.0 / −8.9 / −8.6: HS2 now folds the redraws by SV whatever the text, so only the VF part moves). Past three for a non-social scene: a rule change.
- **EVn now (the quiet nights' weeks a cycle of six):** week 1 (index 0–6, 7 nights) six texts: index 3–5 read in full, **−3.0 / −3.0 / −3.0 / −1.9** (index 6 still folds, 1.0 / 1.0 / 1.0 / 1.0); 3 texts by form, about 360–450 words, 1 run. Weeks 2 and 3 (6 nights each) six each: **−6.0 / −6.0 / −6.0 / −4.1**, 6 texts, 2 runs. All three: −9.0 / −9.0 / −9.0 / −6.0, 3 runs (past BN). Six for a non-social scene: a rule change.
- **The scheduler:** v0.11.237's six new night texts moved the plan's stops a game by **0** (read 43 / 43 / 34 / 34, evening 218 / 218 / 109 / 83, before and after): the night is a story stop after the evening, not a read stop.

## 4. The burned loft (LF; T M1 / C L1)
- **`loft_burned` reached in 0 of 80 games** (0 of 80 long Coils with the arson night, 0 of 115 old). The night settled: long Careful and Sociable 22 of 29 Coils woke the street, 6 the token, 1 Gao at the window, never a fight; Completionist 8 fights won of 12, Cultivator 4 of 10. Old: Careful 21 street / 7 token, Sociable 27 / 7, Completionist 16 won of 29, Cultivator 13 won of 24. `arson_start` and `arson_lost` shown **0**.
- **After a burn (grep):** the long calendar's week 3 follows it (the arson is week 2's last night). Quiet nights: `QUIET_WEEK[3]` names no loft or herbs (RV2's BL), but two of its nine renders name the ladder (the great form "the head of the ladder", the cup "at the ladder's foot"); the scene's place line "Ashfall — the herb loft" shows on every night. **Mornings:** week 3's `village_morning` has the burned line, "What is left of the loft is still smoking a little.", **on every morning of week 3** (6–7 mornings, up to a week after the fire). **The roof** (week 3 shares week 2's texts, `supper_roof:2`): `ROOF_NEW[2]` "examines you on the contents of the herb loft … the sprigs" (ashfall.js 276), `ROOF_STAY[2]` "You reach the loft …" and "practise it on the ginseng" (306). Handled already: `house_time` (`-burned`), `fo_mei` day 8.
- **The old calendar:** its quiet night shows on village day 1 only (index 0, 40 of 40 games); day 3's evening goes to `evening` → the tribute's dawn. No old-calendar quiet night followed the arson in these games, and I found no route to the old list's index 1–2 ("Below the herb loft…", "The herb loft is dark…").

## 5. The text lint and the later camps
- `bl_camp`'s renders: **RR 1–3 of 3 read, AH 1–3 of 3 read, DW 1 of 3 read** (the DW's second, "Another raft of fallen trunks…", and third, "The raft holds…", **not read**): the DW sample (day 72) has no day index past 0 (`onDay` is set for RR and AH only). Nights 4–5 reuse texts 1–2.
- `village_night`: 27 renders; each of the six `QUIET_WEEK` texts 3 (by form): all read. Talks 24 / 21 renders (beats 0–10).
- **TG (a fix):** the DW sample on day index 1 and 2. Tools only, 0 screens.

## 6. The packets (PKf, PKs)
- Sizes now: `village_night` **19.3 KB** (27 blocks; p10 8.4: v0.11.237's weeks), `bl_camp` **6.4** (5 blocks), `talk_mei` **5.2**, `talk_ya` **5.9**, `supper` 22.8, `mei_walk` 14.0.
- **PKs:** the `bl_camp` packet still has none of the DW's later texts (0 hits for either). CB5's run needs them.
- **PKf (a day filter):** would cut `village_night`'s 19.3 KB to the week an EVn run works on.

## 7. Re-checked: none moved
- **The path check (80 of 80 games the same screens at the same minutes) holds FC, LG, BYb-t and LF** at p10's figures: FC first Foundation 40 of 40 in prologue Coil 1, `g.seen.breakthrough` misses 0; LG long 0 (old 0.1 / 0 / 0 / 0); BYb-t Wen only 0 / 0 / 2 / 0 screens (old 1 / 2 / 0 / 0); LF 0.
- **SNr (hooked):** `ya_won` degree 1 only, 0 / 0 / 1.0 / 0.9 (both calendars); 2–3 **0**.
- **ST2 degree 3 (hooked):** long degree 1 Completionist 4.5, Cultivator 1.7; degree 2 0.1 / 1.9; degree 3 **0**. Old degree 1 only 0.4 / 0.3.
- **ME:** the bots never open a menu; p7's 0 stands (not re-hooked).
