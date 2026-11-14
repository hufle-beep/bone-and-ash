# Cold review: v0.11.181, CM push 1 (the mother's kitchen, the communal pot)

Opus, cold. I read the brief, the checklist, the diff, the review packet, the canon card and lore 28–52, plus excerpts: house_time.js 20–90, house_texts.js (mother), replies.js 1–100, tasks.js (door ids), ashfall.js supper / vday, the Fallout supper, and mushroom mentions in prologue.js and wilds.js. `bash tools/check.sh quick` passes (139.6 s). The scope matches the picks: no gain, time or ID changed outside PS; the cards are last on their hubs (ashfall 25 choices, fo_ashfall 21, both end `… mother_time pot_cook`); door ids are by index, so the function label orphans nothing.

## H
None.

## M
**M1. The prologue cook result puts its stat in the reply (B1 missed one line).** `kitchen_texts.js` POT_COOK.ashfall.result contains speech (`"the stranger's mushroom"`). `splitLine` sends a sentence with a quote to the reply, so the whole line, `: +25 satiety.` included, shows under the scene and Results gets nothing. Checked with `splitLine`: `{reply: "Barley, beans and corpse-ears, … over your objection: +25 satiety.", gain: ""}`. The tasks test would fail on it (a reply sentence with a stat), but its walk never reaches the village's 90. B1 named only the two pot lines, so this is outside the pick: stop and ask. Fix: add `/^Barley, beans and corpse-ears, renamed/` to GAIN_LINES, or drop the quotes (`… renamed on the spot by the eldest the stranger's mushroom …` reads badly; the GAIN_LINES entry is cleaner).

**M2. "until today, nowhere to put it" contradicts the game (pot_cook ¶2).** James ran a spore print on the jade bracket fungus on Day 1 (prologue.js 252). He used fungus-against-bacteria work in the clinic (prologue.js 606; ashfall.js 292, "Fifteen years of mycology"). The scene also repeats once a Coil from Coil 4–5 on, and James remembers every Coil, so "until today" is false a second time. Fix: "You have a doctorate in exactly this, and for once someone is watching" (or similar). Cut the time word.

**M3. The mushroom reads as a death cap.** "Pale gills, a ring on the stem" plus "boiled once, the water thrown out" being safe is the Amanita profile. Amanita toxins survive boiling, so a reader who knows fungi sees a mycologist get his own field wrong. A fix that fits his Central European roots: milk caps (Lactarius), boiled and the water thrown out, eaten across Eastern Europe. For example: "Pale gills that bleed a white milk where you nick them, a peppery smell." Keep "boiled once, the water thrown out, then fried".

**M4. A new habit: legal metaphors in 13 of the 31 new texts.** Acquittal, jurisdiction, formal objection (×2 with "over your objection"), charge sheet, finding (×2), ruling, treaty, boundary stone, border by arrangement, on her own authority, offence, hostage, concede, witness, argument. The mother's existing texts already use ledger, evidence, magistrate and seal on a document, so one screen can stack two. Example: rt_ashfall:1's "sets a seal on a document", then KT_RETURN[2]'s "her argument against him". The habit has also spread to the pot women (POT_LINE fo[2] "finding of fact", POT_COOK texts "treaty", "hostage", "concede"). This is the checklist's "new habits replacing old tics". Fix: keep it for the mother at about one in three of her lines, and give the village women other images.

## L
**L1. Two pot lines split into a fragment.** The old lines were one sentence each, so all of it went to Results. POT_LINE.ashfall[1] and fo[0] are two sentences: the reply shows "Bean stew, eaten under the red banners." or "Barley and beans.", and the rest goes to Results. Fix: one sentence each (a colon or a comma), or GAIN_LINES entries like B1's.

**L2. A line with no speaker (KT_UP[1]).** `"You have cooked," she says. "I feed people. It's a habit."` reads as her line. Fix: `"I feed people," you say. "It's a habit."`

**L3. Beats repeated within a stage, often on consecutive days:**
- Stage 1: the thin-cut check appears in KT_UP[1] ("finds it thin"), KT_DAY[1][0] ("They are all there, and thin") and fo_pot_cook's last line ("cuts hers finer than yours"). The Fallout cook and her card can fall on the same day.
- Stage 3: the "already done" joke appears twice: KT_UP[3] ("Less salt… you have not salted it yet") and KT_DAY[3][0] ("It is already lowered… obeyed in advance").
- "You gather" appears in KT_UP[3] and KT_DAY[3][2].
- Ginger is in 6 of the 31 texts, plus fo_ashfall:3's body.

Fix: re-angle KT_DAY[1][0] and KT_DAY[3][0].

**L4. Mother +2 from the prologue cook, where she isn't in the scene.** The prologue text doesn't have her. The card can show on Day 4 before her supper (HT_MET's met flag), so she gains without being met. The news line's "a little more of her trust" follows "the women", which makes "her" unclear. Fix: one clause with her in pot_cook ¶3, or Mother +2 in the Fallout only. Either changes the picked numbers, so it is the owner's call.

**L5. Stage 3 (25) is below the closers' MID (30).** At f 25–29 the "takes over her kitchen" text is followed by a LOW closer: "The stranger has been of use… in a ledger", or a dismissal "by universities". It reads cold right after she hands him the hearth, but in character. Note only, or move the stage 3 gate to 30 (owner's numbers). Related: the Fallout Day 9 supper's "whoever salted her pot … was not seen" sits oddly after an open shared kitchen at stage 2+. Open, options later.

**L6. Before commit.** `sw.js` VERSION is still `bone-ash-0.11.180`, and the docs aren't touched yet (expected at the docs step; flagged so it isn't missed).

## TG (test gaps)
- **TG1, the return day.** It is tested only from a fresh state (kitchen_seen 0). In real play the stage is usually reached in the Fallout first. Planted F16 (KT_RETURN only for a new stage, otherwise the day line) was **missed**. Add a game that reaches stage s on fo_ashfall and then visits rt_ashfall.
- **TG2, the prologue pot slots.** Tested at vday 1 and 3 only, and no test ties the "red banners" line to the eve. F7 (banners from vday 2) and F12 (the two lines swapped) were **missed**. Add vday 2, and pin `/banners/` to index 1.
- **TG3, the cook card after the pot.** The cook card is never checked hidden once the pot was used today. F8 (the `daily` gate dropped) was **missed**. Eat at the pot, then assert `!open`.
- **TG4, the text lint.** The kitchen texts are outside textlint: `text-baseline.json` variantWords is unchanged (+340 words, the two cook scenes only). KT_UP, KT_DAY, KT_RETURN, POT_LINE and the results show only with a flag or in a `do`. F17 (a canon tic, "for a moment") was **missed** by the story test and isn't in any pool. Add a `kitchen` pool to textlint POOLS, and a tic or ban-list assert over `all` in the CM block.
- **TG5, splitLine on new result lines.** Run `splitLine` on every new result line (the POT_LINEs and POT_COOK results with `: +25 satiety.`): the stat must land in the gains (M1, L1). The tasks walk never reaches the village's 90.
- **TG6, the day line pick.** F11 (always the first day line) was missed. Assert that two later visits at one stage can differ (pickLine). Low.
- **TG7, the copied EAT regex.** The CM block's `EATLIKE` is a copy of models.test.mjs `EAT` (without `Cook and eat`), so it can drift. Export EAT from a lib, as SOCIAL is.
- F14 (a stale kitchen flag after Mother drops below 8) was missed, but no Mother loss exists in the game: note only.

## Planted faults: 16, 9 caught, 7 missed
Run with `node tools/mutate.mjs /tmp/cm/faults.json --jobs 2 --out /tmp/cm/mutate.md`, story test --quick.
- Caught: F1 (stage `>` for `>=`), F3 (kitchen stage before the gain), F4 (seen never recorded), F5 (kitchen after the closer), F6 (Fallout pot a day late), F9 (cook till 15:59), F10 (Wen gets the kitchen label), F13 (cook not once a Coil), F15 (one flag for both acts).
- Missed: F7, F8, F11, F12, F14, F16, F17 (see TG1–TG6).

## New kinds of fault for the checklist
- A result line with speech outside GAIN_LINES puts its stat in the reply. A multi-sentence result line splits into a fragment reply. Check every new result with `splitLine`.
- A voice habit (here legal metaphors) spreading from one character to others; count it across the new texts.
- James's expertise (mycology, cooking) checked against real-world fact and against what he has already done in the game ("until today").
- Text gated by a friendship stage that crosses another pool's gate on the same screen (kitchen 25 against closers 30).
- Gate tests run only from fresh state miss the usual path (a stage already seen before the return).
- New text pools must join textlint's POOLS, or tics and reused runs in them go unchecked.
