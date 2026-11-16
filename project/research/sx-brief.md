# Brief: the road home after a carried flight, and more on-foot lines (v0.11.198, owner pick S1)

You are drafting text for the text RPG *Bone and Ash*. Read `/home/claude/bone-and-ash/project/canon-card.md` first (tone, canon, the tic list to avoid), then `/home/claude/bone-and-ash/project/lore.md` lines 61–75 ("## Yuki") and line 11. Then `/tmp/sx/packet.md`: the four screens of Act 1's road home (`ht_leave`, `rt_start`, `rt_road`, `rt_ambush`) with every version of their text, their labels and the result lines seen in play.

## The rule (already built; your words only)

From Foundation (realm 1) James and Yuki fly; a marked walk takes walking time ÷ (1 + realm). In Act 1, Mei Lin (herb-gatherer, 26, looser than the norm, Ashfall propriety behind her) and Ya (feral huntress, 27, tall, rangy, barefoot, proud, calls James "scholar") travel with him; neither can fly. Since v0.11.197, on a walk with them along:
- **Carried**: when both women's friendship and affection are 30+ and Yuki has her great form (Core Formation+), James carries Mei Lin in his arms and Ya rides great-form Yuki (a white root-kin the size of a tiger; she takes the form for the trip), or, when Yuki is in her human form at the time (realm 7+: a head shorter than James, white hair, cat ears and tail, black qipao; speaks aloud), Yuki carries Ya. The result line already says so (e.g. "You carry Mei Lin. Ya rides Yuki and whoops at every turn. 15 min in the air against 30 on foot.").
- **On foot**: otherwise the whole party walks the full time, with a line saying why.

## Part A: the road home after a carried flight (SX)

When the party arrives carried, three screens still describe walking. The game will show your carried version instead of the current one only when the walk that led there was carried (a flag set by that walk); the walked versions stay as they are.

1. **`rt_start` ¶1** (after the carried flight out of the Heart, `ht_leave` [0] "Home. To Ashfall."): today "You climb out between the roots of the dead tree into a grey morning, squinting like something newly hatched." Write a carried ¶1: they came up out of the Heart by air and set down among the dead tree's roots, grey morning, same blinking-newly-hatched feel. One or two sentences. ¶2 onward stay (Ya "ten paces ahead already" on the ground, her "Two ways home" speech): your ¶1 must lead into them, so the party is standing on the ground at the end of it.
2. **`rt_road` ¶1–¶3** (after the carried `rt_start` [0] "Ya's way. One day. Ashfall is waiting."): today ¶1 "Ya's way is no path…" (on foot), ¶2 Mei Lin following on foot (two versions: Ya waits for her or not; when carried Ya's friendship is 30+, so only the "waits" mood fits), ¶3 a Yuki line by form ("rides on your shoulder" / "pads at your side" / "walks at your elbow" … "and supervises"). Write a carried ¶1 + ¶2 + ¶3 in which Ya's way is taken **in hops**: flown from landing to landing, Ya navigating from Yuki's back (or from human Yuki's arms) and making them come down wherever her way, by her lights, has to be walked. This must leave room for the screen's labels, which stay: "Walk with Ya at the front." and "Drop back and walk with Mei Lin." (each a 60-minute walked stretch with a talk, and they come back to this screen after) and "Push on toward the birch ridge." (the next carried hop). Keep "Ya's way is no path" or its spirit if you can; keep the landlord/house-in-arrears joke or replace it with one as good. ¶3: two versions, `great` (Yuki in her great form, Ya's mount) and `human` (Yuki in human form, who carried Ya). The ¶1–¶2 must read right whichever ¶3 follows.
3. **`rt_ambush` ¶1 and the first sentence of ¶2's speech** (after the carried `rt_road` [2]): today "Ya stops dead and you walk into her back. She lets it pass without a word, and that tells you how bad it is." and Ya's "Three. They've paced us since the tree." Write a carried ¶1 (they come down on the birch ridge, Ya slides off and stops dead, James's equivalent of walking into her back, her letting it pass) and a carried replacement for "They've paced us since the tree." (the wolves have run below them, tracking them, since the tree). The rest of rt_ambush stays word for word: ""Ash-wolves," she breathes. "Three. [YOUR SENTENCE]" She tests the air and her face turns ugly. "They smell you, and whatever you brought out of that tree. Everything in this forest that eats Qi will want it."" The `rt_ambush` text is the same for both of Yuki's carrying forms, so don't name a form there.

## Part B: five more on-foot lines for the `yuki` pool (L3)

The `yuki` pool is shown when Yuki has no great form yet (she is a small white cat on James's shoulder, speaks only through the bond in italics, and can't carry Ya), so Ya walks, so everyone walks. It carries 97% of the on-foot company walks: about 10 a game, 3 a Coil, so its three lines repeat 3–4 times a game. The current three (don't reuse their jokes or phrasings):

```
Yuki weighs what a cat weighs and carries what a cat carries, which isn't Ya. So everyone walks: {walk} min. Alone you'd have flown it in {min}.
{walk} min on foot, the four of you together. *I could carry her spear,* Yuki offers from your shoulder. The flight you didn't take was {min}.
Ya walks, so the party walks, and you with it. {walk} min by foot; {min} by air, if anyone had a cat of the right size.
```

Write 5 new lines. Each contains `{walk}` (the time it took, walked) and `{min}` (what the flight would have been alone) exactly once, and makes that reading unmistakable, varied in wording. These are shown after ANY walk with company in Act 1 (the Blackroot, the Drowned Wood, the Ashen Hills, indoor moves inside the Old Tree's Heart and a wrecked ship inside it, the road home), many times a game, every Coil: no place, terrain, weather, light or time of day; no "again", "first", "last", "this time", "still"; nothing that can happen only once. Friendship level, no romance. James and Yuki deadpan; Mei Lin looser; Ya blunt, proud, delighted by speed. At most about 30 words a line. Avoid the canon card's tic list and "instead of".

## Output

Write to `/tmp/sx/drafts.md`, in this exact form so a script can read it (one entry per line, no line breaks inside an entry; mark paragraph breaks inside an entry with ` ¶ `):

```
rt_start | <carried ¶1>
rt_road | <carried ¶1> ¶ <carried ¶2>
rt_road | great: <carried ¶3, great>
rt_road | human: <carried ¶3, human>
rt_ambush | <carried ¶1>
rt_ambush | <replacement for "They've paced us since the tree.">
yuki | <line 1>
… (5 yuki lines)
```

Then "## Notes": at most 5 short notes (anything that fights the canon or the screens around it, or a line you'd flag). Notes are suggestions only. Keep the file under 5 KB.

Do not edit any repository file. Do not run tests.
