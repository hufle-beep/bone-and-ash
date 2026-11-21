# P19-A cold review, part T (texts), v0.11.249

Reviewer T (Opus, cold): the diff, the packet, carrier code by line range; renders in `/tmp/rv-t/tools/rvt.mjs` (P19-A's `mk` / `enter` / `tx`). No suite or mutation run.

## High

**H1. Tier beats ignore a romance that has already happened.** `tierDue` looks only at affection and the `tb_*` flag. It never checks `romance`, `ya_romance`, `fo_pick`, `trio` or `throuple`. So a "first move" beat can land after the couple has already slept together.
- *Mei Lin:* she is at 20–29 on the tribute eve. "Flirt" gives +10 (prologue.js:775), and a story night has no supper carrier (`nextEvening`). "Kiss her" sets `romance`, and the Fallout nights show the lovers' text. Then the first Blackroot camp shows `mei30:camp`: the coy waterskin "custom" that "waits to see what a man of learning does with it". Rendered: `romance: true`, a=45, `bl_camp` → `mei30:camp`.
- *Ya:* she crosses 45 on day 10. On the old calendar day 10 has no `fo_night`. "Stay." → `fo_ya_night`, and the next camp shows `ya45:camp`: "I want you. I am telling you so that you are not surprised." Also after the hot spring's "Let the steam close…" (act1_blackroot.js:1241) before that day's camp. Rendered: `ya_romance: true`, a=60 → `ya45:camp`.
- Not measured by bots. It is reachable by construction, and the first path is the classic romance path.
- Fix options for the owner: (a) skip the lower tier (set its flag silently) once that person's romance flag is set; (b) a lovers variant for `mei30` / `ya45`.

**H2. `ya72:tree` contradicts the Old Tree's camp in every real game.** The beat ends "Mei Lin, from her watch, promises to inform any callers." But `hcPool` (act1_heart.js:61) is `heap` when `trio >= 3`, otherwise `ya` whenever `ya_party` is set. `ya_party` is set on every way into the Blackroot (act1_blackroot.js:765, act1_fallout.js:854/941). So with Ya at 72 or above, the screen reads:
- *Ya's watch pool:* "Ya takes the first watch without being asked, perched on a gallery ledge…". Then the beat has Ya stride out, come back "to sit close against you", and Mei Lin on watch. The label under it is still "Climb up to Ya's ledge."
- *Heap pool:* "The three of you sleep in a heap by the fire… Ya sleeps in the middle". There is no watch at all.

Both were rendered. The packet only showed Mei Lin's watch pool, the one state a real game never reaches with this beat. The P19-A test (`mk(49016, {})`, no `ya_party`) renders that same unreachable state.

## Medium

**M1. RL `evening2[0]` reverses the game's own manners, on the very evening it shows.** The line says the old Mei Lin's pouring his cup "before her own" was "a lapse of manners", and that this one pours "hers, then yours, correctly". The game says the opposite:
- `talk_mei` (act1_blackroot.js:1563): "a guest is served first and least, that is only manners".
- The same eve's `evening` text (prologue.js:762): "Her mother serves you first now, which in Ashfall carries about the weight of a signed adoption certificate".
- The roof (ashfall.js ~267): "She pours yours fuller than hers and denies it": this Coil's Mei Lin already does what the line says only the lost one did.

The line is also a present-tense pour, right under "Her thumb moves slowly over your knuckles" and her "I don't want to spend tonight afraid of tomorrow", in both the honest and the flirt text. It breaks the screen's held moment just before "Kiss her." Suggest a redraft with a gesture that doesn't hang on manners or a pour.

**M2. Ya's Fallout-night beats under the lovers' text.** With `romance` set, `fo_night` already fades: "Mei Lin climbs the ladder… she means to use every night of it" (day 9: "unpins her hair"). `ya45:night` then has James at the window, reading Ya's chest-sign and raising a hand to her. `ya72:night` adds "The loft feels smaller, and better guarded." This narrates on past the door the lovers' paragraph just closed, with James signalling the other woman from his lover's bed. The silhouette line already there is passive, so it is fine. Rendered: `romance: true`, `ya_met`, Ya at 50. Suggest: hold Ya's night beats on a lovers' night (`when: !g.flags.romance`), or give them a variant.

**M3. Camp beats against a camp paragraph that puts Ya elsewhere.** The camp beats have Ya at the fire: "Ya snorts", "watches from the other side of the fire", "puts [her hide] down hard against your bedroll", the thumb-char line. Several region texts on the same screen place her away from it:
- Drowned Wood, fourth camp, *the wood's story night*: "Ya wades out into [the mist], spear down… stands listening toward the hollow". This also puts a flirt beat on the story night's tense setup (checklist: a day-indexed text against the story's day).
- Ashen Hills, third camp: "Ya walking the edge barefoot, listening".
- Root Road, fourth camp: "Ya washes her feet in the pool".

Suggest: a beat-free story night (`blLastDay`), or a closing first clause that brings her back ("Ya comes back to the fire and…").

## Low

- **L1. Supper week 3 (the tribute's week, long calendar).** The week's rules are set: "This week, nothing in this house is looked at" (day 6), the lamp trimmed to a bead and "not conspicuous" (day 4). `mei72` has Mei Lin start a foreign tune over "louder", with the mother approving. On day 4 the mother also "looks at her daughter, and then at you" in the dark. Separately, the mother now rules on the forearm music twice in one Coil: `mei72`'s "See that you learn how it ends", then the eve's "It keeps time like a loom." Rare under GT1 (72 by day 21 needs a strong head start).
- **L2. AL's result vs the screen above it.** The text above ends "she laughs… She makes no attempt to stop." Then AL's result has "Mei Lin laughs and looks… let off." That is the same beat on consecutive lines (checklist v0.11.239). The label sits well among its siblings ("Tonight, Ya." / "Tonight, Mei Lin." / "Tonight, sleep."). Its place, "go in" and "still up there", fit the both-liked text (they are on the thatch).
- **L3. Two voice habits across the nine beats.**
  - The "as X would / does" simile is in 4 of 9: `mei30` "as one presses a seal"; `ya72:camp` and `ya72:night` both "as she would"; `ya45:night` "as a hunter does".
  - The paperwork / legal family is in 5 of 9: seal, notice, "in writing", "without any paperwork", "inform any callers".
  - Fine alone; together Ya's beats read like a clerk's narration.
- **L4. Canon wording in RL.** `evening2[1]` "on a Coil she never lived" and `evening2[2]` "an evening this one never had". Canon: she lived it and forgot it (`talk_mei[2]`'s "has no part in now" is right). Suggest "a Coil she has forgotten" or similar.
- **L5. RL `talk_mei[2]` and the kiss tier.** "what she said into your sleeve when she believed you were asleep" needs her to have slept close to him on some earlier Coil. `mrl` records only that she reached 30, and the third line shows from the third carrier show on whatever happened. It holds at a shared Blackroot fire, which a third show guarantees, so it stays low. The others hold at "kiss tier, nothing happened":
  - `talk_mei[0]` (the coat pocket) and `talk_mei[1]` (the snoring): a second show means an earlier Act 1 Coil with camps.
  - All three `evening2` lines (cup, name, table leg).

**Checked and fine:**
- The order of beats as a story: 30 → 72 at the supper and at the camp; `ya45:night` → `ya72:night`; `ya45:camp` → `ya72:camp` / tree.
- Mei Lin at the supper (prologue only) and at the camp in one Coil: the supper's 30 then the camp's 72 agree. The reverse can't happen, because `supper` comes only before the tribute.
- Ya can't read or write (`ya45:camp`). Her scar is "under one eye". LC1: no herbs or loft in Mei Lin's supper beats.
- Romance limits: nothing past the door.
- Tone: Ya plain, the mother grave, James deadpan.
- No time words clash with 19:00 at the camp or the night at `fo_night`.
- Both women always at `bl_camp` (19:00 is not `ahDay`); no double memory line (the RL paragraph is unread, no fold).

## Test gaps

- **TG-T1 (H1):** render each tier beat with its person's romance flag set (`romance`, `ya_romance`, `fo_pick: 'ya'`, `trio`), and pin whatever the owner picks (skip or variant).
- **TG-T2 (H2):** the `heart_camp` beat test uses no `ya_party`, which no real game has. Render `ya72:tree` with `ya_party` (Ya's watch pool) and with `trio: 3` (heap), and assert no "Mei Lin, from her watch" against "Ya takes / has the first watch" or the heap.
- **TG-T3 (M3):** render every camp beat against every region text by day index (`bl_camp:rr|dw|ah`), the story night included. Assert none comes after a paragraph that puts Ya away from the fire.
- **TG-T4 (M2):** render `fo_night` days 8 and 9 with `romance` and `ya_met`, Ya at 45 and at 72.
- **TG-T5 (M1):** a story-test pin or a lint word pair for serving order ("before her own" / "correctly" against "served first") (or a `lore.md` canon note).
