# Cold review v0.11.190 (N1: L9, L8b, SW)

Read the diff, the checklist, Fable's brief, drafts and check, songs.md, and code excerpts. Rendered the real Meditate paths to both forms (rr_hub P, ah_hub M) and the screens after in `/tmp/n1r/s`. The code is sound (btWho matches P1's old test; gate, load-time anchor check, `p` on redraw and SW's single +1 all hold); the findings are about how the text reads.

## H
None.

## M

**M1: The pronoun after the insert points at the wrong woman** (`js/story/prologue.js:1126`, with `AWAKE_AT` at :1118). Each paragraph ends on Mei Lin: TP `"…different cat," Mei Lin says.`, TM `"…I have questions."`, HP `"…for days."`, HM `she decides … "Badly," you say.` The anchor that follows starts with **"Then she"**. Rendered HM: *"Mei Lin has her mouth open … 'Badly,' you say. // Then she looks at you and opens her mouth, and for the first time in your life you hear your root-kin's voice."* The nearest "she" is Mei Lin, and she has just been described with her mouth open. In the tiger scene, "eleven pounds" sorts it out, but only after the reader has stumbled.
*Fix:* when the paragraph goes in, also swap the anchor's first words: `base.replace(\`\n\n${AT}\`, \`\n\n${W}\n\n${AT.replace(/^Then she/, 'Then Yuki')}\`)`. The texts' "Yuki unnamed" rule doesn't apply to the anchor. Pin the swapped words in the N1 block.

**M2: The screen after the human scene assumes James and Yuki are alone, and repeats HP's beat** (`js/story/longforest.js:752`, `:758`; HP at `prologue.js:1113`). Both choices lead to `yuki_human_after`, where Yuki shows the great form, "which leaves **the two of you** rather less room", and says *"People say stupid things in front of cats … So I will choose who hears me answer back."* HP has just ended on Mei Lin's *"And I have talked in front of her for days."* So the same joke lands on two screens in a row, and the screen after it drops the two women the push has just put there. The gap existed before (BT_LATE has placed the women there since v0.11.189), but L9 now names them on the screen directly before.
*Fix (smallest first):* (a) change HP's last line so it doesn't pre-empt Yuki's line. One option is to keep "It's all real," and end on the counting. Re-pin C1 if so. (b) Read `awakeWho` in `yuki_human_after` and draw "the three of you" or "the rest of you" when it's set, plus a one-clause nod to the women. Story text, so Fable (rule 10): open, options later.

**M3: HM repeats the closing joke of the breakthrough screen just before it** (`prologue.js:1114` against `BT_LATE.M.D`). BT_LATE.M.D (realm 6–7, Ya away) ends: *"…Ya walked the other way." "She has a good sense of direction," you say.* HM, one tap later, ends: *"I'm not telling Ya … She can find out as I did." "Badly," you say.* That's a remark about absent Ya capped by James's deadpan, twice. Fable's brief banned this: "don't repeat its move … or its closing joke shape".
*Fix:* end HM on Mei Lin, e.g. drop `"Badly," you say.` and keep "She finds none." plus one line of her own, or cut the Ya clause and keep the seam hunt. Pin the cut.

## L

- **L1: The qipao is high-collared, but the women look at the throat and collarbone** (HP `:1113` "the pulse in the throat"; HM `:1114` "wrist to collarbone"). The scene describes "a long black high-collared qipao" two sentences above. *Fix:* HP: "fingers, the turn of an ear, the tail"; HM: "from wrist to ears to tail".
- **L2: "I set bones" is a new fact** (TM `:1110`). The canon card has Mei Lin as a herb-gatherer. The brief's "healer" is backed by the sickbed lines in Music Box, but bone-setting isn't in lore. *Fix:* "I have splinted hunters" (she has treated Ashfall's people), or add bone-setting to `lore.md` / the canon card in this push.
- **L3: Two image families spread across the four texts.** Mei Lin as healer: TM "being a healer", HM "a healer's eyes", HP's pulse-taking. Counting: TP "counting claws", HP "Mei Lin is counting", and BT_LATE.M.B "counts it off on her fingers". *Fix:* change one word in HP ("Mei Lin is checking: …").
- **L4: HM repeats the word "mouth" in back-to-back paragraphs.** "Mei Lin has her **mouth** open" is followed by the anchor "opens her **mouth**". M1's fix eases this; also change HM's opening ("Mei Lin starts to speak and, for once, has nothing").
- **L5: The Dúrin opening restates its own next sentences** (`songs.js:54`). "none of it was meant for **a place like this**. You have a song **for this** … without **a room that deserved it**." That's three statements of one idea in three sentences. Music Box (the usual earlier song) also played in the same tree, among its roots. *Fix:* use Fable's own alt, *"Nobody here would say the day was short of songs, but the others were for other things."*, or "The day has had its music already. This one you were saving."
- **L6: The Music Box opening can be read as the Tree's song** (`songs.js:51`). heart_view's text has just said the roots are singing and "your Convergence is singing back", and the passage says "the other song carries on underneath". "The earlier music has worn off everyone" then seems to contradict it. *Fix:* "Whatever you played earlier has worn off everyone by now, …" names the omnitool's song.
- **L7: The Boof Pack opening claims Mei Lin saw the first song** (`songs.js:52`): "sees your hand … a second time today". At Genesis she "doesn't turn round", and she said "Don't turn it down", so "braces, which is fair" doesn't follow from that earlier song. *Fix:* "Mei Lin hears the omnitool wake a second time today and folds her hands, ready for anything."
- **L8: The Old Tree uses the P text** (TP). Ya "walks a slow half-circle" around a tiger-sized Yuki on "a level place on the lip" of a crack (BT_TREE_FRAME). It works if the lip is wide; check it against the canon or have the tree draw TM's shape.
- **L9 (code): The record `p` is trusted unchecked** (`music.js:97`): any string that isn't the current song counts as "the day's earlier song". A broken or older record with a junk `song` from the same day would add the opening sentence. *Fix:* `… && SONG_TEXTS[sv.song] ? sv.song : null` (import it), and add a test case with a junk value on mumei, not only on `reflect`, which has no opening.
- **L10 (code): The insert passes a plain string to `String.replace`** (`prologue.js:1126`). A `$&` or `$'` in a future AWAKE text would expand. *Fix:* pass a function as the replacement, `() => …`.

## TG (test gaps)

- **TG1: Neither new pool is in textlint's POOLS** (`tools/textlint.mjs:123`). `SONG_SECOND` and `AWAKE_WOMEN` aren't listed, and textlint's SAMPLES never set `bt_return`, `yuki_return` and the party flags, so the wrapped scenes never draw their paragraphs. Tics and reused runs in the new texts go unchecked after this push. *Fix:* add `awake: Object.values(AWAKE_WOMEN).flatMap(Object.values)` and `song_second: Object.values(SONG_SECOND)`.
- **TG2: The human anchor isn't pinned** (F6 missed). The test builds the expected text from `P.AWAKE_AT` itself, so moving the paragraph after Yuki's first words still passes. Only the tiger's real-path test hard-codes its anchor. *Fix:* add a real path through `ns_warn` to `yuki_human_awaken` that asserts `…\n\n${HP}\n\nThen she looks at you and opens her mouth` (or "Then Yuki" after M1), and assert that the paragraph comes before the first `"You," says Yuki`.
- **TG3: The base texts aren't hashed.** `alone` is only compared with itself plus the insert. A fault in the wrapped base text, or a revert of the wrapper, would pass. *Fix:* hash `alone` for both scenes against v0.11.189 (checklist v0.11.185 TG2).
- **TG4: Fable's words aren't pinned beyond Claude's cuts.** F5 (`"Badly," Ya says`: Ya speaks while she's away) and F9 (the healer's beat given to Ya) were missed. The "Ya does not appear" regex for HM only checks `Ya's` and `Ya walks|comes`. *Fix:* for HM, assert that no `Ya` is followed by a verb (`/\bYa (?!can|will)\w+s\b/` or a list: says, asks, laughs, comes, walks), and pin a few words per text (TP "different cat", HP "It sat on my foot", HM "hunting for the seam", TM "being a healer").
- **TG5: The SONG_SECOND texts aren't checked for time words, people or counts** (F14 "The morning…", F15 "Old Wen sees…", F17 "three times in a day" all missed). The brief allows only "today" and "a day". *Fix:* `!/\b(morning|evening|night|dawn|dusk|sun|tonight)\b/i`; for boof_pack, `/^Mei Lin/`; for waters_call, `/twice/`; or pin each sentence whole, since they're short.
- **TG6: Only one real case pairs the songs (Dúrin then mumei), and its hours are set by hand** (heart_hall 14:00, ship_wreck 16:00). No case has three songs in one day (`p` = the second), and none checks the pairs the brief measured (Music Box → Dúrin, Boof Pack → Water's Call). *Fix:* one `goTo` walk per measured pair, keyed on its own scenes.

## Planted faults (`tools/mutate.mjs`, `node tests/story.test.mjs --quick`, root `/tmp/n1r/s`)

**12 caught, 6 missed, 0 not applied (of 18).** The full table is in `/tmp/n1r/mutate.md`.

Caught: F1 btWho stops excluding Act 1's Ashfall · F2 awakeWho drops its gate · F3 M/P swapped · F4 both away gives P · F7 tiger anchor moved before the bond line · F8 TP "this morning" · F10 opening sentence on the first song · F11 `p` not kept · F12 yesterday's song counts · F13 redraw without the opening sentence · F16 SW +2 with both flags · F18 paragraph run into the anchor.

**Missed:** F5 HM "Badly," Ya says (TG4) · F6 human anchor moved after Yuki's first words (TG2) · F9 HP's counting given to Ya (TG4) · F14 Dúrin "The morning has had…" (TG5) · F15 Boof Pack "Old Wen sees…" (TG5) · F17 Water's Call "three times in a day" (TG5).

Browser test not measured (no `art/` in copies). Repo untouched.

**New fault kind for the checklist:** a paragraph spliced in front of an anchor that opens on a pronoun ("Then she…") changes who it refers to (M1).
