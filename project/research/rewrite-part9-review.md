# Part 9: Fable's cold reviews (T and C), word for word

# Part 9 (the leftovers): review T (text, canon, continuity), Fable

Read: every changed string in `git diff ceac582..p9-work -- js/story` (old against new), the four sheets and notes, lore.md, the
scenes around each change (prologue.js, wilds.js, ashfall.js, act1_blackroot.js, longforest.js, stomp_act1.js night postures,
act1_return.js for the road). Rendered the stomp texts in all three forms from a scratch copy (/tmp/T-copy; nothing run or edited in
/home/claude/bone-and-ash). Checked the tics list on all added lines (none) and five-word runs against the rest of `js` (only pairs
inside one fight's win 2 / win 3, as before, and the game's own "eleven pounds of white cat").

**Verdict:** 1 high, 5 medium, 13 low. No canon break on sensing, flight, forms or killing humans. The high one is new in this push.

## High

**T1. The far hunt's second-day twins assume the same beast as the first day** (`stomp_prologue.js` 181–207).
`far_hunt` rolls `far_kind` fresh each day (ashfall.js 345: wolves / bull / deer by d6), and the twins are picked by the key
`'far_won'`, which counts far-hunt wins of either kind. So after a first-day bull, a second-day wolves win at degree 2 reads
"A second pair, with the first pair's narrow grey manners. They open as the others did…" (rendered and confirmed), and after
first-day wolves the bull reads "Another bull, as big as the last and no better informed." Half of all second wins are a different
kind from the first. It also clashes with `far_hunt`'s own intro, which is keyed by kind (`far_hunt:wolves`): the intro can say "The
hunters warned you about the ash-wolves" (first wolves) and the win "A second pair". The same on the fourth win (the list wraps).
Fix (text only, keeps the key and the index review C checks):
- wolves 2, second text: "A pair of ash-wolves, with the narrow grey manners of the kind. They open as wolves do, one wide to each
  hand, and you let them finish the manoeuvre…"
- wolves 3, second text: "The first wolf comes in low, for the knee." (drop "this time").
- thornback 2, second text: "A bull, big as a hay cart and no better informed than it looks."
- thornback 3, second text: fine as it is ("Today the hunters do not wait in the lane" only assumes an earlier win of any kind).
The alternative (key the twins by kind) breaks the match with `far_won`'s own two texts, so the wording fix is the better one.

## Medium

**T2. The night fights' fire** (`stomp_prologue.js`, run B's four fights). The fire is optional (`g.flags.fire`, prologue.js
294–316), and this push made the lizard's night event fire-neutral for that reason (wilds.js 132) and run A did the same for the
jackals. Run B's texts still assume a lit fire: crows win 2 "before the fire finishes its crackle" (new), crows one "Feathers come
down into the fire; the smell is their revenge" (new wording), rats posture degree 2 "feed the fire a stick" (new), lizard posture
"through the firelight" (kept). Without a fire, the lizard's event now says "what little light the night has" and its posture, one
tap later, has firelight. Fix: crows win 2 "before the first feather lands"; crows one "Feathers come down over the camp; the smell
is their revenge"; rats degree 2 "You stay sitting, and pick up a stick you will not need"; lizard posture "through what light there
is". (The rain event's "The fire spits and sulks", not in this push, has the same fault: open.)

**T3. Wen and Lu Han count events they had no time to see** (`prologue.js` 113–114, the middle branches). The sensing fault is
fixed, and the 12 and 0 branches read well. The middle one turns `n` (1–11 open meridians) into a tally: Wen says "7 times the steam
of my kettle has leaned toward it" "before you have finished sitting down"; Lu Han says the road's dust "has risen toward [her] 7
times since I stopped walking", seconds after he stops. It reads as a gag from two men who do not joke (run C flagged it too). Fix,
keeping `n`, `yukiSpot`, `byForm` and the pill-smell: a measure, not a count. Wen: "The steam of my kettle leans toward it, against
the draught, ${n === 1 ? 'by a finger' : `by ${n} fingers`}, ${byForm…}, and there is no pill-smell on it." Lu Han: "And yet the dust
of the road lies combed toward ${b}, ${n === 1 ? 'a hand' : `${n} hands`} against the wind, and there is no pill-smell about it."
The code comment above them ("What locals sense of Yuki's meridians") is now wrong.

**T4. Wen's new line on the `ignored` path contradicts the village text** (`prologue.js` 591 against 576). Wen: "the whole street
watched you walk down out of the Blackroot alive". The village scene on that path: "Nobody looks at you, the stranger who came down
off the ridge at exactly the wrong hour." Fix: "Yet you walked down out of the Blackroot alive, with no spear in your hand, and a
whole street took care not to look at you. One of these things is untrue, and I am too old to doubt what a whole street will not
look at."

**T5. FM is only half closed: Gao Feng at the tribute** (`stomp_prologue.js` collectors; `prologue.js` 70–79, 710). The texts now
say "his three disciples" everywhere, as asked. But `collectorsFight` fields Lu Han **and Gao Feng** (unless broken or turned), the
three disciples are never enemies, and no stomp win mentions Gao, who has just been beaten in that fight. The tribute text itself
reads either as Lu Han + three with Gao a fifth, or Gao as one of the four (and a litter needs bearers). Old behaviour, noted by run
A; not made worse. Open, options later (one clause per win, e.g. "Gao Feng is carried", needs a switch on the existing flags).

**T6. The cooking line repeats and ignores the human form** (`prologue.js` 91, CW 1). "*You always cut mine first,* the bond adds.
*I had noticed.*" sits in `cookMeal`'s result line, so it shows on every hare cooked (two hares, two taps, the same line twice
running), and "I had noticed" only works once. In the human form she speaks aloud (the camp's other texts have a human branch).
Fix: show it once (the first roast of a Coil), or move it to a text read once; and give the woman a spoken version.

## Low

- **T7. The lizard's `one` leaves it alive** (`stomp_prologue.js` lizard): a spike "holds its jaw shut… and stops where it stands",
  yet the gain is a core and four spines. Win 3 follows and kills it, so it is only loose. Fix: "…finds no answer there. The spike
  finds one."
- **T8. The lizard's degree-3 aside on the forced path**: "the ground is warm, and you had only just got comfortable" also shows
  after `night_lizard_forced`, where James is on his feet backing away. Fix: "But the ground is warm, and it was yours first
  tonight."
- **T9. `one` against win 3** (shown one after the other): rats `one` sends the second rat into the stream, win 3 has it lie in the
  reeds as a log; thornback `one` says "a dead bull", then win 3 says "It is playing dead. It is not good at it." The retelling is
  the engine's known pattern (runs A and B noted it); these two are the only places where the pair now disagrees on a fact.
- **T10. Jackals win 3 with the yearling** (three jackals at forest scale 2): "What is left of the pack… it lies down… Yuki hops
  down and sits on it" reads as one animal; fine with two jackals, slightly off with three. Could say "the nearest of it".
- **T11. Collectors win 2**: "Let your Sect Master know that Ashfall has acquired a neighbour. He eats no grass…": "He" reads as the
  Sect Master for half a line. Fix: "The neighbour eats no grass…" (as win 3 has it).
- **T12. `dw_chestnut`'s moved beat lands in the wrong order** (`act1_blackroot.js` 570): the result first has Mei Lin laughing with
  blue lips (the end of the hour), then "She has waded out with her skirts knotted at the hip… 'Stop that.'" (its start), and James
  is in the water with her by the label. Fix: put the moved line first and the gain line second.
- **T13. Lost jokes from the emptied menus** (nothing drawn took them): `wild_hunt` "I was born starving, and nothing since has
  helped" (only "Yuki, born starving, inspects the result" survives, without the punchline); `bl_train` "Mei Lin studies Ya studying
  you, and would deny it" (run D offers a line for the darts' silent failure, which still answers nothing); `lf_trials` "where the
  things that eat the things that eat you live"; `lf_hunt` "has a lot of breakfast in it"; `lf_train` "The trunks are running out of
  places to hit". Each could go into a result line later. Open.
- **T14. The Tans' cooking line** (`longforest.js` 632, CW): a bandit who has known James for one sentence says he "looks to him
  like a man who feeds people". Locals judge by sight, and what they see is a tall soft mortal in a ruined coat; the old line had a
  cause (the fire's smell). Suggest a seen cause that needs no fire: "asks whether the uncle cooks, since his sleeves are rolled like
  a cook's". The second meeting's "still cooking" then follows.
- **T15. Two later-visit texts on a remembered first visit** (`longforest.js`): the ridge's "There is glass where you remember plain
  rock" is false on a rewound world visited no later than before (fix: "The glass lies where the lightning left it."); the Bone
  Field's "one or two that haven't been told about you" implies the rest have, and on a new Coil none has (fix: "none of which has
  been told about you"). The other later texts (mire, storm, roots, notes, bathe) fit both cases.
- **T16. The Tans' first text**: "You have not heard of them, you tell him; you have been in a forest." "him" follows a sentence
  about the narrow one, though the scarred one asked. Fix: "you tell the scarred one".
- **T17. Both music lines are the same note** (CW 3 and 4): Mei Lin "slow and sad", her mother "It grieves quietly", on consecutive
  days. Generic as required, and each is good alone; one could be another colour (e.g. the mother: "It keeps time like a loom. A
  house can bear that."). The roof scene's branch is a third longer than before (run C flagged it).
- **T18. The great root-kin's paw** is the joke in five tiger branches of one file (jackals win 3, rats win 3, lizard win 3, wolves
  win 3 day 2, thornback win 3 day 2: "lays one paw… and keeps the paw there" twice nearly word for word). Vary one or two.
- **T19. For review C, a pointer:** `lf_trials` is reached by a plain hub choice (`to: 'lf_trials'`, `time: 30`, longforest.js 272),
  not only by a work card. If any mode draws it, the player gets an empty screen with four zone choices.

## Checked and found right
- **Sensing:** no local reads James or Yuki any more; Lu Han's "a treasure you did not earn" matches the tribute scene's word; Gao's
  and Lu Han's "I feel nothing in you" kept. **Humans:** Gao, the lackey, Lu Han and the three all leave alive in every text.
- **Forms:** every new `stompForm` / `byForm` branch fits its body; the woman speaks aloud in all of them; no verb follows `yk(g)`
  anywhere now (all remaining uses end a clause).
- **Gains:** jackals (core), rats (one dead, +1 meat, in `night_won`, win 2, win 3, one), lizard (three eggs, dead in win 2 and 3),
  mire (one core, three rats), wolves and bull (dead, core named, two eggs), Ya's tooth (taken and worn; matches Yuki's "gave you
  the tooth"), the hares (count-free).
- **Mei Lin's "Kill him"** in Gao's stomp wins now matches `gao_won` and `gao_dead`.
- **The road:** `WHY.clear` "up the mountain", `a1_again`, `rt_taken` and the switchbacks agree.
- **The stake lines** read after each night posture and intro (the drowned no longer walk into a camp the posture says they stay
  out of). **The Fallout's third failures** stand alone and after two earlier ones, and stay grave.
- **The Heartless's win** is grave in all three forms; it shows on the plain win only (the stomp wins replace it at degree 2 / 3),
  and agrees with them. **`t3Fail`** fits a near miss and a clean loss in any form.
- **Wilds:** the drills' failures, Explore's map, the rats' line; "since the road began" holds on any Blackroot day.
- **CW:** four lines in parts 1–3 plus the Tans' two; music generic, no names, titles or lyrics; none is a speech.

# Part 9 (the leftovers): review C (code, tests), Fable

Read: the whole code diff `ceac582..p9-work` (js and tests), and the same diff with every string taken out (old `/tmp/old176/js` against
new), so only code is left. Ran: the baseline `node tests/story.test.mjs` in `/tmp/p9-rev` (4,616,452 passed, 0 failed, 31 s); 32 planted
faults there, one at a time, each file restored after (the copy is byte-equal to the repo again, bar `tools/timings.json`, which
differed before I started); probes from `/tmp/p9-probe` (rewind, save round trip, rendering, card routes, minutes old against new);
the full `bash tools/check.sh` in a throwaway `git clone` of `p9-work` (`/tmp/p9-c-clone`; the scratch copy has no git, so the leftover
scan and the consistency check can't run in it): **all checks passed, 476 s, sanity 146 numbers, 0 drifted, 0 moved past 5, browser
parts 1–4 ok**. Nothing was edited or run in `/home/claude/bone-and-ash`.

**Verdict:** 0 high, 1 medium, 6 low; 10 test gaps (4 of them leave a behaviour of this push with no test at all). The code does what
P9A says. The stripped diff shows no id, flag rename, check, gain, label or choice-order change; the only code changes are the ones
the brief names, plus one side effect on time (C1).

## Medium

**C1. `mei_bond`'s place by region changes a time (10 minutes), which the brief says does not change**
(`act1_blackroot.js` 1191, `place: (g) => PLACE[region(g)]`). A choice with no `time` of its own costs 20 minutes when it moves place
and 10 when it doesn't (`story.js` `defaultMinutes`). The day branch (`mb_day`) ends with "Catch up with the others, eventually."
(no `time`, to the region's hub). Measured, old code against new, same state:

| leaving `mei_bond` (day branch) | v0.11.176 | p9-work |
|---|---|---|
| Root Road | 20 min | 10 min |
| Drowned Wood | 20 min | 10 min |
| Ashen Hills | 10 min | 10 min |

Old: the scene was placed in the Ashen Hills wherever it ran, so leaving it in the other two regions counted as a walk. New is the
right number (nobody walked anywhere), and the header no longer names the wrong region. It is at most 10 minutes once a Coil, on the
Mei-Lin-only path; sanity shows no drift. `ya_found` is not affected (both its choices give an item, so they cost 30 either way;
measured 30 / 30 on both branches). Fix: keep the code; give the owner the table with the report (rule 7: numbers for a time
change), and pin it (TG10).

## Low

- **C2. A save resting in an emptied menu draws an empty screen.** In live play no route draws one: every card of the ten menus ends
  back at its hub or, for `lf_trials`, in its zone (probe: Wilds, the three Blackroot hubs, the Long Forest, with Qi full and at 0;
  no hub choice to a dead menu is left outside the cards). That answers T19: `lf_trials` is a `doorMenus` entry, each place a door
  card, and the hub's "Go deep" is never a story choice. What remains is a save whose `scene` is the menu itself (a Story Mode save
  from before v0.11.41; none of the 36 fixtures is one). It loads and draws without error (title, no prose, the choices; `sceneView`,
  `againView`, `paras('')` checked). Fix: on load, a save sitting in a hub's menu goes to that hub without running `enter`.
- **C3. The emptied list is half the dead texts, and one rewritten text is dead.** Eleven more menus keep a text no card ever draws:
  `wild_forage`, `wild_explore`, `clinic`, `workshop`, `drill`, `fo_palisade`, `fo_council`, `fo_drill`, `fo_clinic`, `rr_scout`,
  `rt_hunters`. `wild_explore` is a `doorMenus` entry exactly like `lf_trials` (its three cards end in `bone_field`, `mire`, `hollow`),
  so P2's new map line ("Every blank left on it…") is never shown. Fix: none needed for this push; say so in the handover, so a later
  part doesn't polish these.
- **C4. The stake line is new on screen at every degree, not only 2 and 3.** All four night fights have a posture, and a posture
  replaces the intro at every degree (`power.js` `prepare`), so the old in-intro line was never drawn at all. The code comment and the
  What's-new note say "even when you far outclass". Harmless; the note could say "now shown".
- **C5. A partial result now prints a failure line.** The Wilds drills give no items, so a "partly" band runs `failDo`: the card says
  "partly" and then "the marks were never in danger". The Long Forest's drills already did this. For review T: the six lines should
  read right after "partly" too (the darts' first, "the marks were never in danger", is a clean miss).
- **C6. `lf_known` also records the two people.** `visit` writes `lf_bandits` / `lf_rogue` into the kept flag, and `FORGETS` then
  ignores them. Harmless (two numbers in the save). Fix: skip the write when `FORGETS.has(k)`.
- **C7. Leftovers in the tests.** `tests/data.test.mjs` 463: `LINE` is no longer read. `tests/part.test.mjs`: `DEAD_MENUS` imported,
  not used. `tests/story.test.mjs` 1363: `const s = serialize(L(9504, 2)); void s;` checks nothing. The repo's working tree has an
  uncommitted `tools/timings.json`.

Not done yet, as expected at this point (checks before docs): `sw.js` is still 0.11.176 while `news.js` has the 0.11.177 note; no
`tests/README.md` row for P9A.

## Checked and found right
- **`nightFight`'s tail:** `encounter` passes `tail` through; `prepare` appends it after the posture or the intro; the HP cut (3, 4
  with bone-meal, at least 1 left) is untouched; no stakes, no tail.
- **`visit` / `knownBefore` / `FORGETS` / `later`:** the Coil number only rises (`rewind`: `n = c.n + 1`, also for the whole game and
  across the act), so "first visit's Coil < this Coil" is sound. `visit` never mutates the old object. A hand-edited `lf_known`
  (true, a string) reads as empty. `FORGETS`' keys are the keys `lf_wanderers` really uses.
- **Saves and the rewind (probe on the fixture `v0.11.7-long-forest-coil2.json`):** it loads; visits write
  `{"falls":2,"bone":2,"lf_bandits":2}`; a save round trip keeps it; after `rewind` the Coil is 3, `lf_known` is the same, all six
  `lf_seen_*` flags are gone; the falls then read the later text on the first visit and the Tans their first-meeting text; a second
  rewind leaves `lf_known` as it was. A save from before the push reads as before in its own Coil. `tests/saves.test.mjs`: 36 files,
  196 passed.
- **`byDay` in the four far-hunt wins:** key `'far_won'`; `go()` notes the day before the text is drawn, and the win is only drawn
  with `g.scene === 'far_won'`, so its index is always `far_won`'s own (also after a degree-1 win on the first day). (T1's fault is
  in the words, not the key.)
- **Day replies:** the three new keys `wild_train:0:f`, `:1:f`, `:3:f` match their choices' indexes; `didSay` marks the day and notes
  the reply day; `did` had no other caller.
- **`t3Fail`:** drawn by the line picker (pool `lf_t3Fail`); "−3 HP." is its own line now, so a partial drops only that line and a
  failure still doubles the loss, as before.
- **The Heartless branch:** matches the enemy's name as `FIGHTS` has it; the plain win only.
- **Places as functions:** `asText` reads `place` everywhere it is read (`go`, `sceneView`, `movesPlace`).
- **Readers of a menu's text:** the render path, the fold (`noFold` is true for menus), the lint, the text lint (0 changed against
  the snapshot), the bots, the leftover scan (0 leftovers): none trips on `''`.

## Planted faults (32; `node tests/story.test.mjs`, the full 1,000 games, unless another test is named)

| # | Fault | Result |
|---|---|---|
| P1 | no tail on the night fight | caught (story P5 ×2, data ×4) |
| P2 | the wolves' line for every kind | caught (data only) |
| P3 | the line back in the intro | caught (story, data) |
| P4 | the wolves' and hawks' lines swapped | **missed** (story, data) |
| P5 | `FORGETS` empty | caught |
| P6 | `FORGETS` without the Tans | caught |
| P7 | `knownBefore` with `<=` | caught (24 asserts) |
| P8 | `lf_known` overwritten each Coil | caught |
| P9 | `later` without `seenOf >= 1` | missed (no text reads `later` before its `visit`; near-equivalent) |
| P10 | `lf_known` out of `KEEP_FLAGS` | caught |
| P11 | `lf_known` changed in place | missed (equivalent today) |
| P12 | a win's `byDay` key `'far_hunt'` | caught |
| P13 | a win's `byDay` without a key | missed (equivalent: the scene is `far_won`) |
| P14 | the Heartless branch never taken | **missed** |
| P15 | the spar's failure without its pool | caught (P9A, TG10 hash) |
| P16 | the spar's failure −2 HP | caught (TG10 hash) |
| P17 | the spar's failure from `t2Fail` | caught |
| P18 | a failed darts drill no longer marks the day | **missed** (story; tasks at 200 and at 1,000 games; data) |
| P19 | the needles' failure from the darts' list | caught |
| P20 | the blade's failure list under the success key | caught (3 asserts) |
| P21 | `ya_found`'s two places swapped | **missed** (story, part blackroot) |
| P22 | the sky's count at realm 0 back to "0 times" | **missed** |
| P23 | `mei_bond` placed in the Ashen Hills always | caught |
| P24 | Wen's needle line on the `ignored` path | caught |
| P25 | a verb straight after `yk(g)` | caught |
| P26 | Wen's "Once" branch dead ("1 times") | **missed** |
| P27 | a live menu's text emptied (`wild_forage`) | caught (the walks) |
| P28 | a Fallout third text gone | caught (FF, NC1 count) |
| P29 | a dead menu's text back | caught |
| P32 | `rewind` drops object flags (so `lf_known`) | **missed** (story, tasks 200, saves) |
| P33 | the blade's failure silent again | caught |
| P34 | "down the mountain" back in `WHY.clear` | **missed** |

21 caught; 8 missed that matter (P4, P14, P18, P21, P22, P26, P32, P34); 3 missed that are equivalent or nearly so (P9, P11, P13).

## Test gaps

- **TG1 (P18, the one that matters most).** Nothing checks that a failed Wilds drill uses up the day, and this push rewired all three
  `failDo`s. Unmarked, the card can be replayed for XP until it succeeds. Add: for choices 0, 1, 3 of `wild_train`, after `failDo(g)`
  the choice's `show(g)` is false. Better: a strings-out code hash for `wilds.js` and `act1_blackroot.js`, as TG10 has for the Long
  Forest (that hash caught P15 and P16).
- **TG2 (P32).** The rewind is untested for `lf_known`; `KEEP_FLAGS.includes` pins the list, not the behaviour, and line 1363 is a
  no-op. Add: Coil 2, visit `lf_falls` and `lf_wanderers`, `endCoil` + `rewind`; then `lf_known` deep-equal, no `lf_seen_*` key,
  Coil 3, the falls' first visit reads the later text; and `deserialize(serialize(g)).flags.lf_known` deep-equal.
- **TG3 (P14).** The Heartless test passes on the generic win too: it only looks for the word "Heartless", and the generic
  text names the fight ("The Heartless won't be the last thing out here…"). Add: the text starts "It is done. Among the white roots", differs from `lf_root_lurkers`' win, at
  `lf_trials_won` 1 and 3, in three forms.
- **TG4 (P21).** `ya_found`: assert the waited branch is `PLACE.ah`'s text and the other holds "burnt gully", not only that they differ.
- **TG5 (P22).** The notebook: realm 0 holds "has not yet tried to strike me" and no "0 time"; realm 1 "1 time "; realm 2 "2 times".
- **TG6 (P34).** The road's assert is vacuous: its first half is true since the new text says "up into the mountains", so "down the
  mountain" can come back unseen. Assert on the rendered texts: `WHY.clear` and `a1_again` (taken) each hold "up" and neither "down
  the mountain".
- **TG7 (P26).** FM1's loop is `[12, 5, 0]`; add 1: Wen says "Once the steam", Lu Han "once since", and neither "1 times".
- **TG8 (P4).** `data.test.mjs` checks "stake" and that the four tails differ. Give each kind its word again through the idle `LINE`
  (wolves "bleeds", drowned "leaking", serpent "share", hawks "feathers").
- **TG9.** `t3Fail` is not in P8A's three-before-any-comes-back loop (`[2, 't3', null]`); and TG13 still accepts "−3 HP." or "partly"
  in place of a drill line for the spar, which no longer happens. Put `'t3Fail'` in the loop and drop both exceptions.
- **TG10 (C1, C2).** Pin the minutes of leaving `mei_bond`'s day branch in the three regions; and in the task bots, after every
  `runTask`, assert the scene is not in `DEAD_MENUS`.
