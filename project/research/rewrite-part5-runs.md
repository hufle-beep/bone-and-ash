# Part 5, run 1: the start, the Root Road and the Drowned Wood

Read /tmp/rw-p5-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p5-r1** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). Another run (run 2) is rewriting the rest of the same file at the same time in
its own copy; **edit only lines 272–771 of /tmp/rw-p5-r1/js/story/act1_blackroot.js** (`bl_start` … `mei_curious`): the start,
the Root Road (`rr_*`, `ya_mocks`, `ya_fight_start`, `ya_spar_*`, `wyrm_won`, `wyrm_lost`), the Drowned Wood (`dw_*`), the hot
spring (`hot_spring`, `spring_ya`) and `mei_curious`. Everything above line 272 and from `ah_enter` (line 772) on is run 2's: read
it, don't edit it (the shared constants up there, `SPRING_*`, `MEI_RAFT_YA`, the encounter intros, the night texts, stay as they
are in this run).

Your older-lines list: /tmp/rw-p5-info/older-run1.lines (88 strings, about 4,600 words). Notes: /tmp/rw-p5-info/notes-run1.md.

## Tasks
1. **OT:** rewrite the prose of every listed string (the shared brief's rules).
2. **YF:** every `byForm(...)` in your lines, all three forms. Two texts in your lines fit only the cat and have no switch:
   line 385 (`ya_spar_lose`: the bond's "very clearly the sound of a cat laughing") and line 721 (`spring_ya`: "Nobody here but
   trees and the cat."). Make them fit all three forms without new code (or note that a switch is needed).
3. **CL, the calendar and Ya's tracks:**
   - Line 292, `bl_start`: Ya's "Three days in, maybe four" contradicts the expedition (five days) and her own "Five days in, maybe
     six" the day before in `fo_price`. Make it five (an echo of `fo_price` is fine; not a copy).
   - Line 461, `rr_scout`: Ya's "Three days ago. Your camp, by the stream. I smelled you every night." The stream camp was the
     prologue's Days 1–3; this is Day 11 or 12, so it was about ten days ago (before the village, his first nights in this world).
     Fix the time; keep the facts: she smelled him every night, he smells of lightning and soap, she followed him for two days to
     work out what he was (the Wilds' Day 3 morning, part 2: "For two nights something has circled the camp at a distance … Large.
     More than one set. In no hurry." Those were the ash-fangs **and** Ya; you may let her say so in a few words, in your line only).
     The label after it, '"You followed me for two days?"', stays.
   - The label at line 342 ('Defuse it. "We have a four-day walk, one cat and no doctor…"') is wrong too; Claude fixes it, leave it.
4. **CW:** at most 3 throwaway lines in your scenes (the shared brief). Good homes: the first camp talk in `bl_start`, Ya's hunting
   lessons (`rr_scout`, `rr_hunt`), the Drowned Wood's raft (`dw_after`), the hot spring.
5. **Continuity:** the shared brief's list, in your lines.
# Part 5, run 2: the reply lists, the Ashen Hills, Practice, the talks, the camp and the nights

Read /tmp/rw-p5-info/brief-common.md first (the shared rules). Your working copy: **/tmp/rw-p5-r2** (a scratch git worktree; the
original /home/claude/bone-and-ash is read-only). Another run (run 1) is rewriting lines 272–771 of the same file at the same time
in its own copy; **edit only lines 1–271 and from line 772 (`ah_enter`) to the end of /tmp/rw-p5-r2/js/story/act1_blackroot.js**:
the reply lists at the top, the shared constants (`DR_SORREL`, `MEI_RAFT_YA`, `BL_WATCHES`, `BL_WATCH_*`, `BL_DW_*`,
`SPRING_*`, `CAMP_BOTH_MEI`, `patchUp`, the encounter and night-fight intros, `STAKE_LINES`, `hubText`), then the Ashen Hills
(`ah_*`, `ya_offended`, `ya_found`, `trio_kiss`, `ape_*`), Practice (`bl_train`), the talks (`talk_mei`, `talk_ya`), the camp
(`bl_camp`, `bl_fireside`, `ya_romance`, `mei_bond`, `mei_raft`, `friends_watch`), the nights (`bl_night`, `bl_night_event`,
`bl_night_won`, `bl_night_lost`), `bl_morning`, `heart_view`, `bl_end`. Lines 272–771 are run 1's: read them, don't edit them.

Your older-lines list: /tmp/rw-p5-info/older-run2.lines (168 strings, about 6,500 words). Notes: /tmp/rw-p5-info/notes-run2.md.

## Tasks
1. **OT:** rewrite the prose of every listed string (the shared brief's rules). Note the first entry of each reply list
   (`DR_STAKES`, `DR_LIGHTS`, `DR_SNARE`, `DR_BETWEEN`, `DR_SPAR_YA`, `DR_SPAR_YA_F`, `DR_TRUFFLE`, `DR_CINDER`, `DR_GRUB`,
   `DR_BEETLE`, `DARTS_*`, `DR_SORREL`, `BL_DW_*`…) is the old reply; the later entries are yours (since v0.11.136 and later) and
   build on the first: keep the later ones unless your new first entry makes one wrong.
2. **FL, the flirts' set 1:** `DR_YA_FLIRT`'s first set (entries 1–4 old, the 5th yours) and `DR_MEI_FLIRT`'s first set (entries
   1–3 old, 4–5 yours): rewrite the old ones. Sets 2 and 3 (yours since v0.11.166) stay; set 1 must stay distinct from them. A set
   is one Coil's five days of replies, shown one a day (the first Coil in the act shows set 1, the next set 2, then set 3, round).
3. **KO, Ya's "Knock it off":** `DR_YA_OFF` is now a list by Coil like the flirts. Set 1: entry 1 is old (rewrite it), entries
   2–5 are yours (keep). Write **sets 2 and 3** (the ten "KO TODO" lines): James says '"Ya. Knock it off."' (from `talk_ya`, when
   she is needling Mei Lin or him; read `talk_ya` for when), Ya is offended (−2 to her friendship and romance): one or two
   sentences, about 15–35 words each, all ten different from each other and from set 1, a day's progress within a set (day 2 can
   remember day 1), each set its own colour (one set sulky and showy, one where she turns it back on him, say). Ya stays Ya:
   offended, never cowed, never cruel.
4. **CW, the cooking replies:** `DR_COOK` ("bl_camp:0") answers "Cook and eat." at camp after the satiety line (the code adds it);
   five lines, one for each day he cooks in a Coil (the k-th time, not the region: the place changes under it), 15–35 words each:
   the party's appreciation of his cooking, said or shown (Ya: frank, greedy, competitive about the last piece; Mei Lin: a herb-
   woman's professional respect slipping into delight, and her upbringing telling her not to show it; Yuki deadpan). He cooks with
   what the forest gives. An entry may be a function `(g) => ...` using `byForm(g, cat, tiger, human)` for Yuki's part (already
   imported). Also at most **3 throwaway CW lines** in your scenes (the shared brief): `bl_fireside`, `bl_morning`'s breakfast,
   the nights, `talk_mei` / `talk_ya` are good homes.
5. **SW, the silent drills:** in `bl_train` the darts ('Darts at a knot in the bark, from farther and farther.', Convergence Use,
   costs Qi) and the needles ('Needle drills, slow and exact.') answered nothing on success. Write `DR_BL_DART` and `DR_BL_NEEDLE`
   (the "SW TODO" lines): five each, one for each day he does that drill in a Coil (the k-th time; the place changes under it, so no
   region-only detail), 10–25 words each, different from each other, with some progress or a callback to the day before; Ya or Mei
   Lin may watch. Don't echo the Wilds' drills (`DR_BLADE`, `DR_NEEDLE`, `DR_FEET` in /home/claude/bone-and-ash/js/story/wilds.js).
   Failures stay silent (leave `failDo` as it is).
6. **YF:** every `byForm(...)` in your lines, all three forms. One text in your lines fits only the cat and has no switch: line
   1296 (`bl_night_event`: the wolves "have seen the cat."). Make it fit all three forms without new code (or note it).
7. **Continuity:** the shared brief's list, in your lines.
# Part 5, run 3: the Blackroot's stomp texts (ST)

Read /tmp/rw-p5-info/brief-common.md first (the shared rules; "Your notes file and your check" applies with the paths below).
Your working copy: **/tmp/rw-p5** (a scratch git worktree; the original /home/claude/bone-and-ash is read-only). Runs 1 and 2 have
already rewritten the Blackroot's scenes there (js/story/act1_blackroot.js, yours now): **read them first**; don't edit that file.
**Edit only lines 92–301 of /tmp/rw-p5/js/story/stomp_act1.js** (the entries `bone_elk` … `night_hawks`). Notes:
/tmp/rw-p5-info/notes-run3.md. Your older-lines list: /tmp/rw-p5-info/older-stomp.lines (81 strings, about 3,200 words: all of it).

## What the stomp texts are
/home/claude/bone-and-ash/js/story/power.js lines 1–30: when James outclasses a fight, degree 2 ("outclassed") or 3
("roflstomp"), the fight's intro is replaced by `posture(g, degree)` (its last part varies by degree through
`pick(d, deg1, deg2, deg3)`), the win scene's text by `win[2]` or `win[3]`, and degree 3 offers "End it in one move.", whose result
line is `one(g)`. Each `win` text **must keep every story fact of the scene it replaces** (the same choices follow, and the haul in
the scene's `enter` is given either way). Nobody here can sense James's or Yuki's cultivation; Ya and Mei Lin see what he does.
A stomp text is not a copy of the scene: it tells the same outcome with James far above the fight, dry.

The entries replace, in act1_blackroot.js (read each pair first):
- `bone_elk` → `elkFight`'s intro and `rr_elk_won` (the elk hunt with Ya; the shed antler-tine into the hammerspace)
- `root_wyrm` → `wyrmFight`'s intro and `wyrm_won` (Day 12, the split in the great root)
- `mire_serpent` → `serpentFight`'s intro and `dw_serpent_won`
- `drowned` → `drownedFight`'s intro and `dw_drowned_won` (the Hollow; what the drowned are, and Mei Lin's fear)
- `cinder_hawks` → `hawksFight`'s intro and `ah_hawks_won`
- `rot_ape` → `apeFight`'s intro and `ape_won` (Day 15; the ape that killed Ya's mother at the pass when she was twelve: keep
  whatever weight the scene gives it)
- `night_wolves`, `night_drowned`, `night_serpent`, `night_hawks` → `nightFight`'s intros (and `STAKE_LINES`) and `bl_night_won`
  (by the night's kind; the nights: after a night fight he wakes with only half of what he lost back, so no "a full night's sleep").

## Tasks
1. **ST:** rewrite the prose of every string in your lines, consistent with the new scenes (facts and spirit). Keep `pick(d, …)`'s
   three branches and their order (degree 1, 2, 3), every `${...}` and every function's signature.
2. **YF:** `yu(g)` and `yuShort(g)` (top of the file) name Yuki by form inside a sentence; don't change them (other fights use
   them); `yuShort`'s "all four hundred pounds of her" is a phrase to avoid in new text. In your lines, texts that fit one form only:
   `cinder_hawks`'s degree-3 win already switches on `yukiForm(g) === 'cat'` (keep the switch, rewrite both texts);
   `night_serpent`'s degree-3 win has Ya say "Your cat," (wrong for the great root-kin's size and wrong for a woman): make it fit
   all three without new code (or, if it can't be done, a `yukiForm(g)` switch like `cinder_hawks`'s, inside the template: that much
   code is allowed, and say so in your notes). Check every other mention of Yuki in your lines for all three forms.
3. **Continuity:** the shared brief's list.
4. **CW:** none in this run.

Check: `cd /tmp/rw-p5 && node -e "import('./js/story/stomp_act1.js').then(()=>console.log('loads'))"` prints "loads". Don't commit.
Reply with a 5-line summary.
