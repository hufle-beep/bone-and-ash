# Cold review — v0.11.189 (P1, D1, DG1): PL, L5a, L5b

Read: checklist, canon card, briefs, diff, packet; excerpts of prologue.js 860–1082, kitchen.js, house_texts.js 42–54, act1_fallout.js 72–84 / 449–460, act1_blackroot.js 188–189, act1_return.js 95–275, coil.js 1–140, meditate.js 17–29, tasks.js 430–445, longforest.js 710–760. Rendered with scripts in /tmp/plr/s/ (r1–r4): every realm 2–14 at rr_hub and heart_hub, by day and night; the mother's card at f 22 / 25 / 26 with kitchen_seen 2 / 3 on Act 1 Day 9; fo_supper on Day 8 after a first stage-2 visit; word counts, tics and shared four-word runs across the 21 + 2 texts.

Gate logic is sound. `late` shows only with both party flags, never in VILLAGE_SCENES or BT_ASHFALL_A1, and not when both women are away. The place order is tree, then Ya away, then party. The step table matches the brief. The breakthrough return hubs are MED_SCREENS ∪ TASK_HUBS, so only rr/dw/ah/heart_hub and rt_camp carry the party flags. The Long Forest and the prologue hubs can't: the Coil and rewind reset world flags, and the Act 1 snapshot is taken at Day 8 dawn, before fo_mei_insists. No time or ground word was found in the 21 texts, and no tic.

## H
None found.

## M

**M1 — the women name his realm without being told (C and F, 6 texts).** prologue.js:964, 973, 982 (PC, MC, TC) and 968, 977, 986 (PF, MF, TF).
- In C, the women place him at sect-master level ("Sect masters stand about where you are sitting"; "A sect master stands about where you are"; "Sect masters do this on a peak"). Nobody has said a realm name.
- In F, Mei Lin says "Immortal" before he does.
- PB has "since neither of them can feel it", and part 2's brief says "a name is said by him or asked for". The other 15 texts follow that rule (A, B, D, G ask or are told).
- The canon card says no local can sense his realm. Rendered at realm 4 and realm 12 (rr_hub, 23:00), the women state his level with no lead-in on the screen.
- Fix: add a short ask or tell at the start of each, in the house pattern: PC `"Which one?" "Golden Core," you say.`; F `"What is it now?" You tell her.` Keep 20–55 words. Note that at realm 5 a C text that says "Golden Core" would be wrong, so ask with no name there or let him say it. Re-run `--check`.

**M2 — saves at friendship 25–29 that have already seen the take-over go back to the shared hearth.** kitchen.js `kitchenOnce` / `kitchenLabel` (stage from friendship only).
- Measured on Act 1 Day 9 at fo_ashfall:
  - Mother at f 25 with kitchen_seen 3: label "Share the kitchen with Mei Lin's mother.", and a KT_DAY[2] line (shoulder to shoulder, her pot and your pan).
  - The same at f 26.
- So a player who was handed the hearth before this update loses it for one or two visits. The same happens on the return's day: KT_RETURN[2] after KT_UP[3].
- Meanwhile fo_supper reads kitchen_seen 3 and says "the pot is no longer her doing". On one evening, the supper and the day's card disagree.
- Fix: `const s = Math.max(kitchenStage(g), Number(g.flags.kitchen_seen) || 0)` for the day, return and label paths. The UP path still compares the friendship stage against what was seen. Or state in the handover that saves in that window step back once (rule 7: saves never orphaned).

## L

**L1 — Mei Lin "laughs" in 14 of the 21 texts** (all of A, B, C apart from TB; plus MD, MG, ME, PE, TE, TF). The brief asked for "laughs, then means it", but a player sees 3–5 of these in one game. Over a Coil it reads as a tic. Fix: vary 3–4 of them (for example PA, MA, TA: a non-laugh reaction).

**L2 — the same idea in the same step across places.**
- PA and MA share a six-word run: "The Sect's elders are Core Formation. They".
- PC and MC share "about where you are".

Only one shows per breakthrough, but across Coils a player can meet both. Fix: reword MA's first sentence.

**L3 — PF at realm 12** (prologue.js:968): "Mei Lin has watched all of it with her arms folded." Realm 12 is the one time the bolt hits him "squarely between the shoulders". The brief's F described "finds nothing", which fits 13–14 only. Fix: "with her arms folded tight", or a beat for the strike that also reads at 13–14 ("whatever it did, it did to the sky").

**L4 — TE** (prologue.js:985): "Ya laughs once, loudly, inside the hollow trunk". The frame line has them on the lip, "where it opens on the sky". Fix: "down into the hollow trunk".

**L5 — TD at realms 6–7** (prologue.js:983): "They end with the man leaving the world." That is realm 9's premise (Immortal Ascension, "where you are meant to leave"). It was written when D covered 6–9. Harmless now, but it pre-empts realm 9's body. Fix: "They end with the man walking up into cloud" or similar, or leave it.

**L6 — MF with Yuki in human form (realm 12+)** (prologue.js:977): "She looks round the camp. 'There's me.'" She ignores the woman with cat ears sitting there. It is a joke and arguable. Fix: "There's me, and her" (no name), or leave it.

**L7 — K2 on the day of the first share:** "half her fire is given over to error **these days**". Rendered on Day 8: the first stage-2 visit that morning, then supper the same evening. "These days" claims a habit she began hours ago. When the stage comes from the prologue, the phrase is right. Fix: "now", or leave it.

**L8 — unattributed second speaker in a single paragraph:** MC's last quote, ME's "It isn't coming.", TE's "It didn't come." All three can read as Mei Lin continuing. The 188 blocks put James's line in its own paragraph. Fix: add "you say" to ME and TE, and "she adds" to MC (which is probably meant as hers).

**L9 — pre-existing, made visible:** when realm 2 (or 7) is first reached in Act 1 with the party, "Get up" leads to yuki_tiger_awaken (or yuki_human_awaken). Those screens are written as if James is alone, right after the women have spoken. Not measured how often the first realm 2 falls in Act 1 (yuki_tiger_seen is kept across Coils, so it is rare after Coil 0). Open, options later.

**L10 — act1_fallout.js:84:** a stray whitespace edit, `const dd =(g) =>`. Revert it.

**L11 — "I have watched you apologise to a mushroom" (PF)** is a new fact. Nothing in the story backs it (grep: no such scene). A throwaway in character; acceptable, or soften to "talk to a mushroom".

## TG

- **TG1 — step content not pinned.** The new block checks shape only, so swapping two steps' texts passes, as do the faults F4 (E says the sky came) and F8 (PG "Three thunders"). Pin a word per step: A "Core Formation", B "True Core", E `/didn't come|isn't coming|stopped coming|Nothing (came|arrives)/` and no `lightning|thunder`, G "thunder", F "Immortal".
- **TG2 — place content not pinned.** Swapping PA and TA, or F5 (TA without the climb) or F17 (a fire on the lip), passes. Assert `/up the crack|climbs up|dead bark/` in every T text and none of those words in P or M.
- **TG3 — the M check uses a fixed verb list.** It misses "Ya snorts" (F7), "Ya hauls", "Ya tries" and "Ya's spear". Instead assert that every `\bYa\b` in an M text sits in a sentence spoken by Mei Lin or in a "the way Ya went" form, or list Ya's allowed M contexts.
- **TG4 — the time and ground regexes are narrow.** "firelit" and "firelight" (F9) and "ashes" (F10: `\bash\b` misses it) pass. Extend them to `fire\w*|ashes|embers|soil|mud`.
- **TG5 — sensing.** No test fails if a woman names his realm unprompted (F6, M1). At least pin PB's "neither of them can feel it", and the ask or tell added by the M1 fix.
- **TG6 — mei_party without ya_party** is never rendered (F18). Add one state with each flag alone and assert no BT_LATE text. Real games always set both, but saves and future scenes may not.
- **TG7 — M2 is untested:** a save with kitchen_seen 3 at Mother f 25–29 (label, day line, return line).
- **TG8 — K3's meaning isn't pinned beyond "no longer her doing"** (F15 passes). Pin "supervised".
- **TG9 — no real walk.** Every render fakes `bt_return` and calls `SCENES.breakthrough.text`. Add one `runTask(g, SCENES, 'med:bt')` at rr_hub with the party (the checklist's "usual path"). Assert the line, and that realm 2 with `yuki_tiger_seen` unset goes on to yuki_tiger_awaken (L9).
- **TG10 — textlint pool membership** has no test (F16: dropping BT_LATE from `bt_place` passes). Assert that the pool holds the 21 texts and SUPPER_POT 2 and 3.

Faults: /tmp/plr/faults.json, 18. Expected to pass the current tests (my reading, not run): F4, F5, F6, F7, F8, F9, F10, F15, F16, F17, F18. Controls: F1, F2, F3, F11, F12, F13, F14.
