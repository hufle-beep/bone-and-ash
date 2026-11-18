# ===== run F1: brief =====
# TS6 brief, run F1 (v0.11.224, owner pick TX2: DC + DN): the lines that count the old days (Fable, one run)

Read `/tmp/ts6/f1/canon-card.md`, `/tmp/ts6/f1/pk-dc.md` and `/tmp/ts6/f1/pk-dn.md` (context packets of every scene below), `/tmp/ts6/f1/renders.md` (the texts that show only on a given story day, rendered) and `/tmp/ts6/f1/sources.md` (pool lines the packets don't render). Read nothing else; do not open the game's files. Write drafts to `/tmp/ts6/f1/drafts.md` (format at the end); notes, if any, to `/tmp/ts6/f1/notes.md` (suggestions only, under 8 KB). Reply with one line when done.

**Tone (hard):** James and Yuki deadpan; locals overly serious (formal, grave; they don't joke); Mei Lin looser (teases, laughs); Ya jokes, flirts, picks fights. Second person for James. Plain English. Avoid the canon card's tics. Keep each line about its old length (±25%) and every story fact in it except the count. Keep *italic* and paragraph breaks as they are.

## The background: the long calendar

The game is getting a longer calendar (a test switch today; every new game later). On it, each story day the party spends **in one place** is a **week**: the forest (story days 1–3: Days 1–21), the village before the tribute (story days 4–6: Days 22–42; the tribute on Day 43), Ashfall's Fallout after it (story days 8–10: Days 44–64), the Heart Tree (16–18). Each story day of the **Blackroot journey** (story days 11–15) is **three days** at one camp (Days 65–79). The road home and the deadlines keep one day; the Elder comes on **Day 103** (Day 21 on the old calendar). The story's beats still happen once a story day (on its first day or its last night); the days between are quiet, and a scene that shows "on story day 2" now shows on each of that week's days.

So many lines now count wrong: "The tribute is two days off" shows 8–14 days before it; "Thirteen days" (to the Elder) is really 53–59; Ya's "Five days in" is fifteen. Both calendars stay in the game until a later push, so every line must still read right on the old one.

## The three forms of fix (each item below says which)

- **SLOT:** the code fills the count. Rewrite the line around the slot so it reads right for **every value in the range given** (old calendar value first). Slots: `{days}` / `{Days}` = the days left, spelled out ("one day", "two days", "fourteen days", "fifty-nine days"; `{Days}` capitalised); `{Day}` = today as "Day nine" / "Day fifty-one"; `{elderDay}` = "the twenty-first day" / "the hundred and third day". If a bare count of 50+ days sounds wrong in someone's mouth, say so in the notes and reword (a grave villager counting every day aloud is in character). When the count is 1 the code shows the old "tomorrow" wording instead where the item says so; you don't write that case.
- **NOT-EVE:** the old line stays for the eve (the last day before the deadline). Write a version for **the earlier days of the same week** (the range given), with no "tomorrow" and no exact count unless you use `{days}`.
- **LONG:** the old line stays for the old calendar. Write the long calendar's version, true on **every long-calendar day it shows** (given). Prefer wording that doesn't name a count at all ("weeks", "since the forest", "all the way from the stream") unless the item gives a slot.

## The items (ids for your drafts)

**DC: counts to the deadlines**
- **DC1** `ashfall` (hub text, story day 5): the sentence "The tribute is two days off." SLOT `{days}`: 2 old; 8–14 long.
- **DC2** `ashfall` (story day 6): "The red banners on the tribute post hang dead still. Tomorrow." NOT-EVE: 2–7 days before.
- **DC3** `supper` (story day 4, renders.md): the mother's "Three days," … "Three days, and they come up that road. Every year of my life." SLOT `{Days}`: 3 old; 15–21 long. (All three forms in pk-dc.md: one draft each where they differ, ids DC3-cat / DC3-great / DC3-human, or one if the sentence is shared.)
- **DC4** `herb_girl`: "The tribute falls due in three days," (old: "in three days" on the long route, "tomorrow" on the short). SLOT: "in {days}" for 2–21; 1 = the old "tomorrow".
- **DC5** `village`: "The tribute falls due in three days, at dawn. The whole village is counting them, and not aloud." SLOT 2–21 (1 = old tomorrow line).
- **DC6** `elder`: "In three days, the collectors come." SLOT 2–21 (1 = old "Tomorrow").
- **DC7** `village_morning` (story day 5, renders.md): "Two days until the collectors. … You have those two days to make sure…" SLOT `{Days}` / `{days}`: 2 old; 8–14 long.
- **DC8** `village_morning`, **new, long only**: the village's first-week mornings (story day 4; days 15–20 before the tribute) today wrongly show story day 6's "The last day." text. Write a morning text for them (about 60–90 words, like the story day 5 one; it may use `{days}`; all three forms if Yuki is mentioned: byForm cat / great / human).
- **DC9** `village_morning` (story day 6): "The last day. Tomorrow at sunrise, the collectors." and its first paragraph as a whole. NOT-EVE: 2–7 days before (the rest of the text after the first paragraph stays).
- **DC10** `herb_slopes` (story day 6, renders.md): "It is the last day on the slopes before the tribute. … should tomorrow go wrong …". NOT-EVE 2–7.
- **DC11** sources.md, house_texts: Old Wen `ashfall:2` ("this eve eighty times") and the mother's `ashfall:2` and `ashfall:2-burned` ("because tomorrow the Sect walks past it"). NOT-EVE 2–7 each (three drafts: DC11-wen, DC11-mother, DC11-burned).
- **DC12** "Thirteen days" (to the Elder), SLOT `{Days}` / `{days}`, 13 old; long ranges: LETTER fought ("Thirteen days," says Old Wen) and lost ("Thirteen days, where we had a year") 59; `fo_letter` label `"Then we use the thirteen days."` 59 (a label: keep it short); `fo_elder_named` "In thirteen days Outer Elder Shen Qiu…" and "Thirteen days. You can spend them…" 59; `fo_mei` "Thirteen days," she says to the roots: 53–59; house mother `fo_ashfall:1` "Thirteen days," she says: 53–59. Ids DC12-a … DC12-f in that order.
- **DC13** `fo_letter` and `fo_envoy`: "on the twenty-first day". SLOT `{elderDay}` (both drafts, DC13-letter / DC13-envoy).
- **DC14** `fo_council` (story day 10, renders.md): "eleven days stand on the tally". SLOT `{days}`: 11 old; 39–45 long.
- **DC15** `fo_morning` (story day 9): "Day nine. Twelve days to the Elder." and `fo_depart`: "Day eleven. Ten days to the Elder." SLOT `{Day}. {Days} to the Elder.` (check they read; DC15-morning / DC15-depart).
- **DC16** `ht_start`: "Day sixteen." SLOT `{Day}`.
- **DC17** `fo_ya_time` (story day 10): "Tomorrow we start for the tree," NOT-EVE: 2–7 days before the start.
- **DC18** `fo_mei` (story day 10, renders.md): "The last day. She is packing the basket for the second time…": NOT-EVE 2–7 (the first paragraph).

**DN: the story's own counts (LONG unless said)**
- **DN1** `ya_meets` (Day 51 long): "Three nights I sat outside your little fire. Three." Ya watched the camp in the forest: three weeks on the long calendar. And its label `"You followed me for three days and didn't say hello?"` (DN1-text / DN1-label).
- **DN2** `ya_talk` (Day 51): "three nights running". **DN3** `ya_challenge` (Day 51): "Four days I've been walking." **DN4** `ya_share` (Day 51): "two nights" (see its packet).
- **DN5** `rr_scout` (Days 65–67): "Ten days back, before the village: your camp, by the stream." (long: about nine weeks back) and "Three nights it took me"; its label `"You followed me for three nights?"`; its result "Ten days back. Your first camp, by the stream." (DN5-a, -b, -label, -result).
- **DN6** `fo_price` (Day 58): "Five days in, maybe six." and "a fight every three days" (the journey is fifteen days, maybe eighteen). **DN7** `bl_start` (Day 65): "Five days in," Ya says. "Six, if I end up carrying one of you."
- **DN8** `ah_enter` (Day 74): "Two days," says Ya. "Then we're under it." (six days). **DN9** `rr_end` (Day 70): "Ya, who has stopped for nothing in two days." (six days).
- **DN10** `rr_hub` (pk-dn.md): the lead "Day two on the Root Road. … Ya says the road ends today" shows on each of the road's second story day's **three** days (the road ends on the third). One text for all three.
- **DN11** `ya_mocks` label: `Defuse it. "We have a five-day walk and no doctor. Pick a fight with the forest."` (fifteen days). Keep the "Defuse it." frame.
- **DN12** `bl_morning` (sources.md): each story day's morning line now shows on that story day's **first** morning only; the two quiet mornings after it (same camp, no event) need their own line. Write one quiet-morning line for each: the Root Road day 1 (today it falls back to "Another morning, grey and cold. The dead tree waits.", wrong before the tree is in sight), the Root Road day 2, the Drowned Wood (day 3), the hills of the Ash Hollow (day 4) and the last camp before the tree (day 5): about the length of the old lines (15–40 words; DN12-1 … DN12-5). And one label for the quiet mornings' choice, which today reads "Get moving." but leads back to the same camp (DN12-label, about 2–5 words).
- **DN13** `bl_camp` / `bl_fireside` in the Drowned Wood (sources.md): on the long calendar the wood is up to four nights. `BL_DW_CAMP` has two camp texts and wraps: write a **third** (DN13-camp). The wood's fireside has two texts by night (the second says "than last night"): write a **third and fourth** that fit any later wood night (DN13-fire3, DN13-fire4; same shape: the talk, then the `likesMei && likesYa` / else closing paragraph as two versions each; byForm 'three'/'three'/'four' as the old).
- **DN14** `rt_evening` "Nine days in the Blackroot," the old woman says, and `rt_mother` "scratched from nine days in the deep forest": SLOT `{since}` = the days since leaving Ashfall: 9 old; 37 long (DN14-evening / DN14-mother).
- **DN15** `heart_camp` (sources.md, HC_MEI_WATCH's fourth): "by a custom now three nights old" (the Heart is three weeks long: the line shows on a night 4–21).
- **DN16** `supper_roof` (story days 5–6, Days 29–41): "Second night on the roof." opener (see its packet / renders.md).
- **DN17** `supper` (story day 5, renders.md) "Second supper at Mei Lin's." (long: the eighth or later) and `evening` (story day 6's last night) "Third supper at Mei Lin's." (long: the twenty-first): the openers only.
- **DN18** `morning` in the forest (renders.md): story day 2's "The second morning. … one lab coat that was white yesterday …" (shows Days 8–14 long) and story day 3's "Day three in the forest. … For two nights something has circled the camp." (Days 15–21 long): the sentences that count (DN18-2, DN18-3).
- **DN19** the jackals' intro (sources.md): "the same three that have walked rings round your camp for two nights" (two weeks long).
- **DN20** `DR_RING[1]` "…the gaps you cut yesterday." and `DR_BLADE[1]` "…a finger longer than yesterday…" (sources.md): these show after a gap of three days now: **one version each for both calendars** (no "yesterday").
- **DN21** `lf_enter` (sources.md / pk-dn.md): "a scream on the fourth morning, a village, a Sect, a tribute on the seventh day." Long: the scream after three weeks, the tribute on the forty-third day.

## Format of `/tmp/ts6/f1/drafts.md`

One block per item, in the order above:

```
### DC1
<the new sentence(s) only, with the slots as written: {days}, {Days}, {Day}, {elderDay}, {since}>
```

For a sentence inside a longer text, give the replaced sentence(s) only, starting and ending where the old ones did. For byForm splits, `### DC3-cat`, `### DC3-great`, `### DC3-human`. For a new whole text (DC8, DN13), the whole text.

# ===== run F2: brief =====
# TS6 brief, run F2 (v0.11.224, owner pick TX2: V3a, part 1): the village's and Ashfall's evenings (Fable, one run)

Read `/tmp/ts6/f2/canon-card.md`, `/tmp/ts6/f2/packets.md` (context packets of `mei_walk`, `supper`, `fo_supper`: every label, its result, the screen after) and `/tmp/ts6/f2/sources.md` (the code around each text: the `${...}` branches you keep). Read nothing else; do not open the game's files. Write drafts to `/tmp/ts6/f2/drafts.md` (format at the end); notes, if any, to `/tmp/ts6/f2/notes.md` (suggestions only, under 6 KB). Reply with one line when done.

**Tone (hard):** James and Yuki deadpan; locals overly serious (formal, grave; they don't joke); Mei Lin looser (teases, laughs, then checks who heard); Ya jokes, flirts, picks fights. Second person for James. Plain English. Avoid the canon card's tics. No romance assumed (some players court Mei Lin or Ya, some don't; the scenes' own `likes…` branches are where it shows).

## The background

The game is getting a longer calendar: each story day the party spends in one place is now a **week**. The village before the tribute is story days 4–6 (three weeks; the tribute at dawn after story day 6's week); Ashfall's Fallout after it is story days 8–10. A scene that shows once a story day on the old calendar now shows on each evening of that week, and today it shows **the same text every evening**. The owner (2026-11-17): "the repeating story choices for the hubs should have more text variety, even if the bonuses are the same. aim for less repetition." His rule for repeated items: **a sequence of three texts at most**. So each text below keeps its place as the **first** evening of its week (the story beat), and you write **two more**: the 2nd and 3rd evenings of that week (after the third, the game shows the first paragraph of a text already read, folded). The labels, gains and choices stay the same on every evening.

**What the new texts are:** later evenings of the same week, after the beat already happened on the first. They do not retell or re-stage the beat (the father's story is told once; the mother's count of days once); they can lean on it ("since the night she told you about…"), carry the week's mood, and move small things along: the food, the house, the village's nerves, Yuki, Mei Lin. Each about the length of the old text (±25%), the same paragraph shape (a first paragraph that stands alone: the game folds re-reads to it), and every `${...}` branch the old text has, in the same order (byForm's three forms cat / great / human; `g.flags.ignored`; `yaHere(g)`; `g.flags.loft_burned` where present). No counts of days (or use `{days}`, which the code fills with the days left to the tribute, spelled out: "nine days"). No "tomorrow" unless it is true on every evening of that week.

## The items (ids for your drafts)

- **V-walk5A, V-walk5B** `mei_walk`, story day 5 (`vday === 2` branch): the 2nd and 3rd sunsets of that week. The old one is her warning ("When it goes bad at the post… take the cat and go").
- **V-walk6A, V-walk6B** `mei_walk`, story day 6 (the `: \`The last sunset before the tribute…\`` branch): this week has seven sunsets; the old text stays for **the eve** (the true last sunset). Write two for **the earlier sunsets of that week** (2–7 days before the tribute): nothing in them may say "last".
- **V-sup4A, V-sup4B** `supper`, story day 4 (`vday === 1`; both `g.flags.ignored` branches as the old has them): the mother's "Three days" supper is the first; these are the 2nd and 3rd suppers of that first week.
- **V-sup5A, V-sup5B** `supper`, story days 5 and 6 (the "Second supper at Mei Lin's" branch: the father's story). It is the first supper of story day 5's week and shows again on story day 6's weeknights; these two are later suppers in that stretch (they must fit any evening 8–20 days in, before the eve). Their openers must not say "Second" or "Third".
- **V-fo8A, V-fo8B** `fo_supper`, story day 8 (`dd(g) === 8`: "Nobody talks at supper…", the night after the letter): the 2nd and 3rd suppers of the Fallout's first week (the village is building, the Elder's count hangs over it).
- **V-fo9A, V-fo9B** `fo_supper`, story day 9 (the other branch, with `yaHere(g)`: Ya at supper or not): the 2nd and 3rd suppers of that week; keep the `yaHere(g)` split (two versions inside each text, as the old one).

## Format of `/tmp/ts6/f2/drafts.md`

```
### V-walk5A
<the whole text, with ${...} branches written as in the source: byForm(g, 'cat …', 'great …', 'human …') and ${g.flags.x ? '…' : '…'}>
```

One block per id, in the order above.

# ===== run F3: brief =====
# TS6 brief, run F3 (v0.11.224, owner pick TX2: V3a, part 2): the forest's nights and the Blackroot's settled talks (Fable, one run)

Read `/tmp/ts6/f3/canon-card.md`, `/tmp/ts6/f3/packets.md` (context packets of `night`, `talk_mei`, `talk_ya`: every label, its result, the screen after) and `/tmp/ts6/f3/sources.md` (the code around each text: the `${...}` branches you keep). Read nothing else; do not open the game's files. Write drafts to `/tmp/ts6/f3/drafts.md` (format at the end); notes, if any, to `/tmp/ts6/f3/notes.md` (suggestions only, under 6 KB). Reply with one line when done.

**Tone (hard):** James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, then checks who heard); Ya jokes, flirts, picks fights. Second person for James. Plain English. Avoid the canon card's tics. No romance assumed beyond the scenes' own `likes…` branches.

## The background

The game is getting a longer calendar: each story day the party spends in one place is a **week** (the forest: story days 1–3, Days 1–21), and each story day of the Blackroot journey is **three days** at one camp (Days 65–79). A scene that came once a day now comes on many more days, and today it shows the same few texts again and again. The owner (2026-11-17): "…should have more text variety, even if the bonuses are the same. aim for less repetition." His rule for repeated items: **a sequence of three texts at most** per text. After the sequence the game folds a re-read to its first paragraph.

## The items (ids for your drafts)

- **V-night1A, V-night1B, V-night2A, V-night2B, V-night3A, V-night3B** `night` (the forest's evening before sleep; a `byDay` list of three texts, one per night in order, sources.md): write two more for each, **in the same list**, so the forest has nine night texts before any comes back. They show on later forest nights (from about Day 4 to Day 21; never the first three nights), so: no "first night", no counts. Keep each old text's shape: the `${g.flags.fire ? … : …}` fire split, the `byForm(g, cat, great, human)` Yuki split, and a line about the watch-thread (the old texts' third paragraph; it may be shorter, but James's Parallel Cognition keeps a thread on watch every night). 1A/1B follow the first's mood (the strangeness of this world's night), 2A/2B the second's (habit, the camp becoming his), 3A/3B the third's (quiet nights). About the old length (±25%).
- **V-mei-A, V-mei-B** `talk_mei`'s settled text (the one after the five talks: "For a while you walk and neither of you talks…", sources.md): on the long calendar she is talked to on many more days of the Blackroot (up to 15); write two more settled walks, same shape and branches (`likesMei(g)` etc. as the old), each about the old length. Nothing new happens in the plot: small talk, herbs, the road, Ya ahead, Mei Lin's dry humour.
- **V-ya-A, V-ya-B** `talk_ya`'s settled text ("Ya is in a good mood, and Ya's good moods are loud.", sources.md): the same, two more, same branches (`likesYa(g)`, `likesMei(g) && likesYa(g)`), about the old length.

The labels under each text stay the same on every day (packets.md shows them and their results): each new text must still lead naturally into every label.

## Format of `/tmp/ts6/f3/drafts.md`

```
### V-night1A
<the whole text, with ${...} branches written as in the source: byForm(g, 'cat …', 'great …', 'human …') and ${g.flags.fire ? '…' : '…'}>
```

One block per id, in the order above.

# ===== run FX: brief =====
# TS6 run FX (v0.11.224): small fixes to drafts, and four more lines (Fable, one short run)

Read `/tmp/ts6/fx/canon-card.md` only. Write to `/tmp/ts6/fx/drafts.md` (format at the end). Reply with one line when done.

**Tone (hard):** James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs); Ya jokes, flirts, picks fights. Second person for James. Avoid the canon card's tics.

## Part 1: break a run (13 sentences)

Each sentence below (from your drafts) shares a five-word run (quoted) with an existing scene of the game. Rewrite **only that sentence** so the run is gone; same meaning, same length, same voice. Give the whole new sentence.

- **R1** (village morning): "A saucer of fish scraps sits by the door, and nobody admits to putting it there." run: "a saucer of fish scraps"
- **R2** (village morning, story day 6): "The last week. At the end of it, at sunrise, the collectors." run: "at the end of it"
- **R3** (the Drowned Wood fireside): "Later, when the fire is low, the ${byForm(g, 'three', 'three', 'four')} of you settle in a heap that nobody arranged, and Mei Lin, in the middle of it, complains only about Ya's feet." run: "in the middle of it" (keep the `${byForm(...)}` as it is)
- **R4** (Mei Lin's walk): "Yuki rides your shoulder facing backwards, so that somebody is watching the road." run: "Yuki rides your shoulder facing"
- **R5** (Mei Lin's walk): "She talks about the harvest the whole length of the field, quickly, all of it in the future tense, and somewhere along the path her fingers have closed on your sleeve." run: "the whole length of the"
- **R6** (supper): "You tell her. It takes a while, and you hear yourself getting interested." run: "it takes a while and"
- **R7** (supper): "She holds out her bowl to be filled again." run: "she holds out her bowl"
- **R8** (supper): "Mei Lin opens her mouth, finds nothing in it, and looks at you as though this were your doing." run: "looks at you as though"
- **R9** (forest night): "The trees are blacker than the sky behind them, which ought not to be possible and is." runs: "them which ought not to", "which ought not to be"
- **R10** (forest night): "The omnitool plays a quiet piece from home, turned low enough that the forest has to lean in for it." run: "to lean in for it"
- **R11** (Mei Lin's walk in the Blackroot): "Mei Lin walks with her eyes on the ground and one hand in the basket, sorting by touch." run: "mei lin walks with her"
- **R12** (same): "She holds up a root and asks what your people would call it." run: "your people would call it"

## Part 2: four more lines that count wrong on the long calendar

Background: on the long calendar each story day in one place is a week; the Blackroot's story days are three days each at one camp; the whole loop (the prologue) is 43 days.

- **X2** The forest's morning on story day 3 (it now shows on each morning of Days 15–21; the jackals, "the hurry", come only on the week's seventh night). The text before it: "…For nights now something has circled the camp at a distance, and it has left tracks. Large. More than one set. In no hurry." The line to replace: "Tonight, you suspect, the hurry arrives." One sentence, true on every morning of that week, no "tonight".
- **X3** The Blackroot's morning at the last camp before the tree (it now shows on the first of that camp's three mornings): "The last morning before the tree. It has the whole sky now; even the sunrise has to go round it. Nobody has much to say. Ya sits whetting her spear until the sound is part of the morning." Rewrite only the first sentence so it holds on the first of three mornings there (no "last").
- **X4** The Long Forest's entry (a later loop; James knows the prologue's road comes round again): "Your people live eight or nine hundred years, and this week has already shown that it comes round again." The loop is 43 days on the long calendar: rewrite the sentence, no "week".
- **X6** The result of "Walk her home." after Mei Lin's sunset walk in the week before the tribute; it now shows on every evening of that week, not only the eve: "She does not let go at the door, either. She stands there with your hand in hers and the lamplight on her face and says, "Tomorrow, whatever happens, I'm glad you came out of that forest." Then she goes in, quickly, before you can answer, and you stand in the lane for a while, learning how to breathe again." Write a version for the earlier evenings of that week (2–7 days before the tribute): no "tomorrow"; the walk before it may have ended with her holding your sleeve or your arm rather than your hand, so "your hand in hers" should be a hand she takes at the door. The old one stays for the eve.

## Format

```
### R1
<the new sentence>
```

One block per id (R1 … R12, X2, X3, X4, X6).

# ===== run FY: brief =====
# TS6 run FY (v0.11.224): three small lint fixes (Fable, one short run)

Read `/tmp/ts6/fy/canon-card.md` and `/tmp/ts6/fy/texts.md` (four of your drafts, in the game's template form: keep every `${...}` and branch as it is). Write to `/tmp/ts6/fy/drafts.md`. Reply with one line when done.

The game's text lint flags three things in them:
1. **V-sup4A, V-sup4B** (supper at Mei Lin's): "the mother" comes 3+ times in one text (a tic). In each form branch of each text, keep at most two "the mother"; vary the rest ("she", "Mei Lin's mother", "her mother" where Mei Lin is the subject, or restructure). Nothing else changes.
2. **V-fo8A**, the human-form branch: "takes the hand without asking" ("takes the hand" is now in four scenes). Reword that clause only.
3. **V-night2A**: "you have hung the lab coat on the branch that has become the lab coat's branch" ("the lab coat" is now in four scenes). Reword that clause so it doesn't say "the lab coat" (the joke can stay: the coat has its own branch now).

Format: the whole fixed text of each, as `### V-sup4A` etc. (four blocks), in the same template form.


# ===== run FZ: brief =====
# TS6 run FZ (v0.11.224, the review's RV1): eleven short texts (Fable, one run)

Read `/tmp/ts6/fz/canon-card.md` and `/tmp/ts6/fz/texts.md` only. Write to `/tmp/ts6/fz/drafts.md` (format at the end). Reply with one line when done.

**Tone (hard):** James and Yuki deadpan; locals overly serious; Mei Lin looser (teases, laughs, then checks who heard); Ya jokes, flirts, picks fights. Second person for James. Avoid the canon card's tics. On the long calendar each story day in one place is a week; each Blackroot story day three days at one camp.

- **MP1** a third text for Mei Lin's earlier sunsets of the last week (one paragraph, like A and B; no "last", no "tomorrow", no counts; she holds your sleeve or arm, as A and B end).
- **MP2-1 … MP2-5** a second quiet-morning line for each Blackroot camp (shown on the camp's third morning; A and the old line are the story morning and the second): about the old lines' length (15–40 words), true on any quiet morning there, not repeating the first quiet line's joke.
- **MF1** Ya's fight opener, the long calendar's version of the first two sentences' speech ("Three nights at your fire and I never smelled a thing on you…"): she watched for weeks, not three nights. Give the whole quoted speech up to "*Nothing*."
- **MF2** the scout's result for the earlier days of the last week (2–7 days before the tribute): no "tomorrow"; keep "Two watchers, three days running, in outer-sect boots." and the last two sentences; replace only the middle sentence.
- **MF3** the return supper's long line: the reviewer reads "spends … comes home" as odd ("spent" fits better). Give the whole sentence with `{since}`.
- **L4a, L4b** the Long Forest's two lines (DN21 and X4) must also be true when the prologue's forest was left early (then the scream came sooner and the tribute before Day 43): reword each without a day count.

## Format

```
### MP1
<text>
```

One block per id: MP1, MP2-1 … MP2-5, MF1, MF2, MF3, L4a, L4b.
