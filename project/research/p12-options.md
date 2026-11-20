# Push 12: the rest of e (options)

Measured on the v0.11.238 working copy: Careful / Sociable / Completionist / Cultivator, 10 games each, long calendar (old where marked). Raw numbers in `p12-measure.md`. Bundle rule BN: 2–3 items a push, at most 2 Fable runs.

## Done in v0.11.238, its effect
- **CB5:** `bl_camp` folded 11.9 / 11.1 / 20.8 / 19.5 → **6.9 / 6.1 / 15.8 / 14.5** (−5.0 each, as forecast); VF there now 0. What folds is redraws (SV) and same-day returns (SD), with the stock shown.
- **EVn-1:** `village_night` 47.5 / 47.5 / 14.0 / 7.0 → **44.5 / 44.5 / 11.0 / 4.6** (forecast −3.0 / −3.0 / −3.0 / −1.9; measured −3.0 / −3.0 / −3.0 / −2.4: Yuki's form changes in week 1, so the seventh night reads fresh half the time).
- All folded screens −8.0 / −8.0 / −8.0 / −7.4. The plan's stops moved 0 (read 43 / 43 / 34 / 34). Paths: the same in 80 of 80 games.

## The sub-items
- **FS6, the Fallout supper six a story day** (`fo_supper`: day 8 has 7 suppers, day 9 has 13, three texts each; VF **14.0 each**, the biggest fold left). Scope: 3 texts a story day (6), about 850–1,000 words with day 9's Ya-away lines, 2 Fable runs. **Rule:** this is supper at Mei Lin's table. If it counts as "the supper" (the social six), no rule change; if not, it goes past three for a non-social scene. Your call when you pick. Balance 0, save 0. After: **−6.0 each** (day 8's 7th and day 9's 7th–13th still fold). FS9 (day 9 only, 1 run): −3.0 each.
- **SPw3, the village supper's week 3 its own six** (`supper:5` covers weeks 2 and 3: 13 nights, 6 texts; days 34–40 fold 7.0 / 7.0 / 7.0 / about 6.5). Scope: 6 texts, about 800 words, 2 runs. **Rule:** six a week, the way the quiet nights got their own weeks in v0.11.237. Read another way, that is twelve for one story day. Save 0. After: **−6.0 / −6.0 / −6.0 / about −5.5.**
- **EVn-23, the quiet nights' weeks 2 and 3 six each.** Unchanged: **−6.0 / −6.0 / −6.0 / −4.1**; 6 texts by form, about 720–900 words, 2 runs. **A rule change:** six for a non-social scene.
- **BH, the Blackroot's hunts:** `dw_hunt` has one text (folds 1.0 / 1.9 / 2.0 / 2.0) and `rr_hunt` two (0 / 0 / 2.0 / 2.0). Scope: two more for the wood and a third for the root road, about 300 words, 1 run. **No rule change** (three, non-social; these are the lead-ins, not the fights). After: **−1.0 / −1.9 / −3.0 / −3.0.**
- **RC, the draft check's runs** (`packet.mjs --check` missed CR1–CR3). Why: it skips runs inside the draft's own scene (CR1), and it draws only six fresh old-calendar states of scene texts (CR2 a long-calendar morning; CR3 Yuki's fire text and a stomp win). Fix: report runs within a scene (except against the text being replaced), and take the corpus from the text lint's renders. Tools only, 0 screens, tests for each miss.
- **TL2 / TL4, the talks' beats 11–12 / 11–14:** unchanged, −0 / −4.0 / −2.5 / −3.1 (1 run) or −0 / −8.0 / −2.5 / −3.1 (2 runs). Past the social six (a rule change). In no option: fewer screens than the four below for the same runs.
- **NF, the forest night** (`night`, 21 nights, nine texts since V3a; VF 10.0 / 10.0 / 10.0 / 10.2). 3 more: −3.0 each (1 run); 6 more: −6.0 each (2 runs). Past nine, non-social (a rule change). In no option: the prologue, not the evening or the Blackroot.
- **LF, the burned loft:** 0 of 80 games (both calendars). In words, the texts after a burn that still treat the loft as standing: week 3's mornings, the roof's three lines, the quiet nights' ladder and place line, and the Fallout's night, supper, `fo_mei_night` and `fo_ya_night`; the Return's two loft nights; Yuki's path (lead-ins, epilogue); one music line. `p12-measure.md` §5 has the list. 0 screens a game.
- **Re-checked, unmoved:** FC, LG, BYb-t (paths the same), SNr 2–3 0, ST2 degree 3 0, ME 0.

## The options
Colours by how many screens a game each changes, the four players added together. The figures are folded screens from the measured visits, by day and beat.

- 🟢 **P12-A: FS6 + RC (recommended).** 2 Fable runs. No rule change if the Fallout supper is "the supper"; otherwise one (past three, non-social). **6.0 / 6.0 / 6.0 / 6.0 a game (24.0).**
- 🟡 **P12-B: SPw3 + RC.** 2 runs. Six a week for a social scene (twelve for one story day if read that way). **6.0 / 6.0 / 6.0 / about 5.5 (about 23.5).**
- 🟠 **P12-C: EVn-23 + RC.** 2 runs. **One rule change** (six, non-social). **6.0 / 6.0 / 6.0 / 4.1 (22.1).**
- 🔴 **P12-D: BH + RC.** 1 run. **No rule change.** **1.0 / 1.9 / 3.0 / 3.0 (8.9).**

**Why P12-A:** it changes the most screens a game, the same for every player (all four reach both Fallout story days, Careful included), and it is the same supper table the owner's social six already covers. If you rule it non-social and want no rule change, P12-D is the fallback.

## Open, options later
- The burned loft's texts (LF): where James sleeps after a burn (a canon call first), then the list above.
- `ah_hunt`'s third text (Ya-away versions) and the Blackroot's win texts (fights, allowed to repeat).
- The seventh nights past six: the quiet night's week-1 night 7 (1.0 / 1.0 / 1.0 / 0.5) and the supper's day 27 (1.4 / 1.4 / 1.0 / 0.5).
- The old calendar's quiet-night index 1–2 ("the herb loft"): no route found.
