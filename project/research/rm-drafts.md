# Memory lines of their own (v0.11.184, owner picks N1, S1, D1): Fable's drafts as written, and Claude's cuts

One Fable run (packet: rm-brief.md, the canon card, `node tools/packet.mjs morning talk_mei talk_ya` 12 KB, the beats of talk_mei and talk_ya as excerpts; about 77k tokens).

## As written

```
morning:kp | You know where the way out leads now: to a tribute on the seventh day, and from there straight back to this red sun. So the data has improved, slightly. The forest is still the mildest teacher on offer, and having sat its early lessons before makes you a repeat student, not yet a good one. So learn it properly, eat, get stronger, and *then* walk out.
morning:mem | You take the inventory anyway, out of respect for method.
talk_mei:m0 | Her mother's arithmetic is on its way. You arrange your face to hear it fresh.
talk_mei:m1 | A stem is about to lose its top. You already know which of your words she has been borrowing.
talk_mei:m3 | The answer is ready before the question. You wait for it anyway; the question is hers, and it is a good one.
talk_mei:m4 | You were asleep for the noise in every version. It remains the thing you most regret missing.
talk_ya:m0 | You submit to the inspection. Knowing the verdict in advance has still not supplied a reply.
talk_ya:m1 | The ledge, the swinging legs, the wolves. You settle in to hear it as if it were new, because to her it is.
talk_ya:m3 | A definition is about to be required of you. The spear, you note, still has nothing to add.
talk_ya:m4 | Being counted is not a thing you expected to like. The count is coming, and you like it.
```

Fable's notes: kp 65 words in 4 sentences (the close as one sentence; the original's fragments offered back); "the seventh day" so it holds on any morning; m4 "in every version" for the Coil count; talk_ya:m1 the closest to a retelling (a lighter option: drop the first sentence); talk_mei:m1 points at "curious" without printing it.

## Claude's cuts (D1, the owner 12:12 "D1 go")

- **C1** kp's first sentence claimed the tribute: the Coil before a later Day 2 morning reached Ashfall in 17% (Random) / 86% (Careful) / 81% (Completionist) / 72% (Sociable) of games (200 games each; 502 / 511 / 515 / 362 such mornings), so false in 14–83%. New first sentence "You have lived these trees before, and they have not noticed."; "before" → "once"; the close back to the original's fragments.
- **C2** talk_mei:m3 "and it is a good one" (a 5-word run in `guardian_bypass`) → "and a good one".
- **C3** talk_ya:m3 "still … nothing" (a pair in 8 texts) → "still" dropped.
- **C4** talk_ya:m4 "like … like" (a pair in 13 texts) → "expected to enjoy".

`--check` after the cuts: tic 0, run 0, pair 0, time 4 (all hold: "still", "already" in lines shown only on a repeat).

## RV1 (the owner 12:58 "RV1 go"; 13:01 "P1")

- Claude's cuts: M1 "having sat its early lessons once" → without "once"; L3 "So the data has improved" → "The data has improved"; L1 Ya 1's first sentence ("The ledge, the swinging legs, the wolves.") dropped; L5 What's new "most talks".
- Fable's run 2 (brief `/tmp` copy: Mei Lin's beats 0 and 4 only, the canon card; about 59k tokens), as written:
  - `talk_mei:m4 | A bird comes off badly in this, and she comes off well. You have the record open.`
  - `talk_mei:m0 | Her mother counts two shapes for a woman and names three. You are holding out for a fourth.`
  - Notes: m4 points at "I'm writing it down" without quoting it; m0 James taking a side (a fourth shape); "shapes" her word (kept).
- `--check`: m4's "comes … comes" a pair in 6 texts → P1 (owner 13:01): "A bird fares badly in this, and she comes off well." After: tic 0, pair 0, run 0, time 1 ("still" in KP, holds).
