# Bone and Ash: the Fable rewrite, part 3 (Ashfall): the brief

You are rewriting the OLDER story text of a hand-written branching text RPG, part by part; this is part 3: the prologue's
**Ashfall Hamlet, Days 4–6** (suppers at Mei Lin's, the roof, the night shaped by what James did to Gao Feng, the arson, the
mornings, the day hub and its cards: herb slopes, the clinic at the well, the bone workshop, the hunters' drill, Old Wen's
lessons, the hunts past the oak hollow, scouting the tribute road, the sunset walk). Parts 1 (the prologue and shared scenes)
and 2 (the Blackroot Wilds) were yours and are in the game. Claude keeps the code, tests and docs.

## Where
- The original, read-only: /home/claude/bone-and-ash (do not edit anything there).
- Your working copy, edit here: /tmp/rw-p3 (a scratch git worktree). Edit only `js/story/ashfall.js` and lines 14–24 of
  `js/story/task_hubs.js` (YUKI_ASHFALL). Nothing else.
- The list of older lines: project/research/ (then /tmp/rw-p3-info/)older.lines (line number in /tmp/rw-p3/js/story/ashfall.js, then the start of the
  string). A multi-line template literal is listed by its first line; the whole literal is older.

## Read first
- /home/claude/bone-and-ash/project/lore.md (canon; it wins). Note especially: the realm sheet (Mortal Vessel = everyone in
  Ashfall; "sixty if Heaven is kind; Old Wen at 90 is a wonder"); **locals can't sense James or Yuki, they place them by what
  they see**; Yuki's forms (below).
- /home/claude/bone-and-ash/CLAUDE.md rule 7 (tone) and /home/claude/bone-and-ash/js/story/act1_common.js lines 1–25 (cast).
- The whole of /tmp/rw-p3/js/story/ashfall.js, and around it in /home/claude/bone-and-ash/js/story/prologue.js the scenes just
  before and after Ashfall (`mei_lin`, `lore`, `village`, `elder`, `heal`, `village_hunt`, `evening`, `evening2`, `tribute`),
  and /home/claude/bone-and-ash/js/story/house_texts.js (Old Wen's and the mother's daily scenes, yours), so Ashfall matches
  what you wrote elsewhere.

## Task 1: the older text (OT)
Rewrite the prose of the listed strings (last written before v0.11.69, i.e. not by you). Strings not listed are yours since then
and stay, except where Task 3 asks. Rewrite only the text inside string and template literals. This includes scene texts, the
result lines inside `do:` / `failDo:` / `enter:` functions, the fights' `intro:` lines, the first (old) entry of each `dayReply`
list near the top, and YUKI_ASHFALL's `got` and `none` in task_hubs.js (see Task 3 for the haul).

## Task 2: the success lines by day (SR)
Near the top of ashfall.js are five new lists, `DR_CLINIC_J`, `DR_CLINIC`, `DR_HOOKS`, `DR_DRILL`, `DR_SPAR`. These cards can be
run more than once a day and on both days (Day 5 and Day 6); every success used to say the same line. Entry 1 is the old line
(rewrite it as part of OT); entry 2, a placeholder "SR TODO …", is shown on the second day the card succeeds in a Coil (Day 6).
Write each entry 2 as a short line (one or two sentences, about 10–25 words), a success, different from entry 1, with some
progress or a callback to the first day. Their failure lines (DR_CLINIC_F, DR_HOOKS_F, DR_DRILL_F, DR_DRILL_SPAR_F, JADE_FAIL)
are yours already; don't echo them.
- `DR_CLINIC_J` the line at the well, treated with jade bracket (Village standing up)
- `DR_CLINIC` the same line, treated with clean water, a bone lancet and a doctorate
- `DR_HOOKS` needles and fishhooks for half the village, sung out of bone
- `DR_DRILL` teaching eight hunters to fight together: bone shields, spears behind, nobody alone
- `DR_SPAR` sparring with the best of them while Yuki shows them what speed looks like (its entries are by Yuki's form, Task 3;
  "SR TODO spar 2 cat/tiger/human" are the Day 6 lines for each form)

## Task 3: every text for every Yuki form (YF) — the owner's own ask
The owner plays this part with Yuki in all three forms (he reaches Nascent Soul before the tribute every Coil now, so on Days 4–6
Yuki can be the cat, the great root-kin or the woman). `byForm(g, cat, greatRootKin, human)` picks the text by her form:
- **cat**: a small white cat with yellow eyes; speaks only through the bond (*italic*).
- **great root-kin** ("tiger" in the code): white, the size of a Bengal tiger, from Core Formation; bond speech only.
- **human**: from Nascent Soul; a woman: very long straight white hair, pointed white cat ears, a long white tail, narrow gold slit eyes, a long black high-collared qipao with red piping (lore.md "Her human look");
  speaks aloud, deadpan; still bonded to James. Locals see a strange, beautiful woman with ears and a tail who arrived with the
  stranger; they are grave and formal about it (a spirit-beast that has taken a woman's shape is a thing the old stories know).
  Don't settle whether she is James's sister or lover here (the path is chosen later); neutral.
Do this:
1. Fill every "YF TODO <spot> tiger" and "YF TODO <spot> human" placeholder (supper, loft, arson_wake, walk, walk_warn, walk_home,
   spar). The cat text in each is the old text: rewrite it too (it's in the older list). Each form's text should do the same job in
   the scene (same beat, same length ±25%), written for that body: a tiger doesn't sleep on a stove or a chest; a woman at supper
   is a guest at the table the mother has to place somewhere; the walk's chaperone with a grudge works differently for each.
2. Review every existing `byForm(...)` in ashfall.js (village_morning, arson_start, arson_lost, far_lost, wen_lesson, DR_WEN_FOREST)
   for all three forms: where a branch is empty ('') and Yuki would plainly be there and matter (e.g. the human form in the arson
   or after a lost hunt), you may write it; where the cat and the great root-kin share a text that fits only one ("Your cat" for a
   tiger is fine from Old Wen, whose eye is bad and manners good, but decide), adjust. Keep the number of entries and the order.
3. Any other text in ashfall.js that names or implies Yuki in one form only and has no byForm: make the wording fit all three
   forms (no new code), and list it in your notes.
4. **The haul (task_hubs.js, YUKI_ASHFALL)**: these lines get no Yuki form in the code today (`got(n)`, `none`, `full` and the
   `alts` are plain). In the code, rewrite them so they fit ALL three forms as they stand (form-neutral: "Yuki leaves a hare on Mei
   Lin's step" is fine for all three; "Mei Lin's mother bows to the cat" is not). Keep `${n}`, the counts and the item named. **In
   your notes**, also draft a version of each by form (cat / great root-kin / human; the venison lines tiger and human only), in
   case the owner picks a code switch for it: label them YH.

## Hard constraints (the game must keep working; saves must keep loading)
- Never change: scene ids, keys, flag names, item ids, function calls and their arguments' code, `${...}` expressions (keep each
  one, in a sensible place), the number of entries in byForm(...)/byDay(...)/dayReply(...) lists and which branch is which,
  conditions, checks, times, gains, the order of choices, enemy `name:` values.
- **Do not change choice labels** (the `text:` of an entry in a `choices: [...]` array): tests and bots match them. Two labels are
  wrong on Day 5 (the tribute is on Day 7, two days off): "Drill the village hunters. They'll be standing next to you tomorrow." and
  "Spearheads for the hunters. They'll need them tomorrow." Claude will change their endings: in your notes, give one ending for
  each (keep "Drill the village hunters." and "Spearheads for the hunters." as the start; short). Other label ideas: notes only.
- Result lines with numbers or items keep their mechanical part exactly ("+30 satiety.", "+2 Ninefold spirit grass (trade goods).",
  "−3 HP", "+3 Ash-deer venison", "+1 Murky beast core", "+8 HP."); rewrite only the prose around them. Keep the prefixes
  "Breakfast at Mei Lin's: " and "An hour of rest" and "Condensed:" (the game's summaries match them). Keep the place names in
  `place:` and the titles as they are.
- Keep each text about the same length (±25%) and every story beat and fact: who knows what, what matters later (Gao Feng's token
  pulsing to the Sect, Lu Han wanting James alive and thinking him a hidden sect's heir, Lu Han bringing four men, the two watchers
  in outer-sect boots, the spearheads and the plough, Mei Lin's father who went up the road with the collectors: *Tribulation.
  Honoured.* and the empty box, the Old Tree that sang and made the forest kind, the burned loft, Pock-Face, the mother's
  sentence on him), names, numbers, the order of events. You improve the writing, you don't change the story.
- Keep Markdown as used (*italic* for bond speech, thoughts and emphasis). The game folds a re-read scene to its first paragraph, so
  a scene's first paragraph should stand alone.
- No song lyrics; adults only; romance stays at the level it is (a shoulder, a hand, a held wrist).

## Continuity to fix (in the listed lines)
1. The calendar: Ashfall's Day 1 there is Day 4 (supper), Day 2 is Day 5 ("Two days until the collectors"), Day 3 is Day 6 (the
   last day; the collectors at sunrise on Day 7). The Day-5 sunset walk says "When it goes bad tomorrow": wrong (two days). Check
   every "tomorrow", "three days", "two days" in the texts against this.
2. The drill: "Eight hunters, two of them older than Old Wen" — Old Wen is ninety, a wonder in a village where sixty is Heaven
   being kind. Fix.
3. The night's rules: beds from 21:00; the night's beat (the arson, Gao's token, Gao at the window) comes after bed, at 01:00;
   after a night fight James and Yuki wake with only half of what they lost back (`nightRest`). No text should promise a full night
   after the arson night.
4. James's look (thin rectangular glasses, short pale blond hair and beard, the ouroboros on his left forearm, the tree and raven on
   his right, a white lab coat): Gao already bows to "a man in a lab coat at a window"; no more than that here.
5. Anything else that contradicts part 1, part 2, house_texts.js or lore.md: fix in the listed lines, or note it.

## Voice
James and Yuki deadpan and sarcastic; the villagers overly serious, formal, grave about honour, face, the Sect and their
ancestors, and they don't joke; Mei Lin looser (teases, laughs, and gets told off for it); her mother tiny, fierce and magisterial;
Old Wen grave, precise, one good eye. The humour is dry and comes from James reacting to grave people. Avoid the tics "something
like", "for a moment", "in a way that", "the way a", "a long moment", "a long time", "the first time", "a thousand years",
"four hundred pounds of cat", "a bone needle" (in prose; the label stays); avoid reusing any distinctive five-word run from
elsewhere in the game (check with grep in /home/claude/bone-and-ash/js); vary sentence openings.

## Your notes file
Write project/research/ (then /tmp/rw-p3-info/)notes.md: per scene, one line on what you changed and why; the YF spots (what each form does); the YH haul
drafts by form; the two label endings and any other label suggestions (old → new, with a reason); any continuity problem you
found but didn't fix (with the line). Then reply with a 5-line summary.
