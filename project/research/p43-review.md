# P43-A cold review (Opus): L1-s, L1-w, L1-h, L2, L3, L4, L5

What I read: both checklist parts, the whole diff (`p43.diff`), the packet (`p43-review-packet.md`), and excerpts around each change (story.js `choose`/`defaultMinutes`, again.js `skipStep`/`skipRun`/`skipPlan`, music.js `musicLine`, main.js `land`/`proseHtml`, common.js `eatBest`/`FOOD`, the fo_spy scenes, yk_night_all, faq.js on GU). I worked in a scratch copy (`/tmp/rv`, scripts in `/tmp/rvs/`). I ran: every changed screen's choices with their own and default times; fo_spy:1 on 400 seeds (fresh game) and with GU raised; the three Heart Eats with all 8 foods; the skip from bl_end, ht_start, heart_gate (with and without its two flags), heart_gate_marks and heart_hall at Fed 60, 5 and 0.5; and the song draws of heart_hall through againView and musicLine (arrive, eat, a meta screen and back). `node tests/story.test.mjs --games 5`: 1,343,619 passed, 0 failed.

Verified OK:
- L1 times on the tap path: ya_share 10/10/10, rt_trio 10/10 (:2 to rt_quiet_night on the talk default 10), heart_core 30/30 (:0 by the act default), ya_found 30/30 (:0 by the act default), trio_kiss 20/20, rt_evening:6 20. yk_night_all opens at the table ("standing up from the table") and moves to the loft, so its 20 matches rt_evening:0 → rt_trio → rt_trio_night (10 + 10). No changed result text names a time except fo_spy:1's.
- L2: every food reads right both ways. Hare, fowl, crab, venison and jade bracket are raw at the roots and the doorway (18/15/12/20/10) and cooked in the hall (35/30/20/40/15). Smoked meat 30, dried bracket 15 and honeycomb 25 are the same both ways and never print ", cooked". Raw, smoked meat (30) now beats a raw hare (18), as `eatBest` should pick.
- L3: `noteVisit` clears `L.cur` on every new screen, so the first draw after a skip run, a move or a day's plan still shows the song. On a meta screen's return (newVisit false) the song comes back (rendered: arrive `song.durin`, after the meal `null`, yuki_form, then back `song.durin`). A day change on the screen fails `sv.d === d`, and `songDue` (once a save) decides as before. `sv.p` is only read on the shown branch, so the second-sentence logic is untouched.
- L4: `c.index < 1000` is right but redundant. `sceneView`'s indices are `s.choices` positions, and `s.choices[1000+]` is undefined anyway (ONE_MOVE is 1000 in story.js:12). The skip can't take the Eat (it is filtered out), and `skipRun`'s self-return stop is unchanged. `skipPlan`'s dry run still blanks the skip on a collapse. From bl_end it now walks 2 steps (50 min) to heart_gate. heart_gate stops it unless gate_listened and sect_marks are both set (then 2 steps to heart_hub). heart_hall alone is 1 step, so no skip button shows there.
- L5: no tic, `--check`-style runs only from the old sentence ("a library nobody thought to burn"). The Act 1 kept dawn has no "skills went the usual way" line, so it doesn't contradict the lift lines either.

## High
None.

## Medium
**M1, fo_spy:1's 80 min is also the failure's (js/story/act1_fallout.js:538).** In `choose`, `c.time` is spent before the check branch (story.js:353–357), so a failed GU check takes 80 too. Its result is "He is off like a hare… You let him go", and fo_spy_fled opens "Your sentence is not finished when the watcher is three switchbacks further up". After that, fo_spy_fled's "Back down to Ashfall." adds 60, so the failure costs 140 min (was 30 + 60 = 90). The door shows until 15:59 plus its 60-minute walk, so you arrive by 16:59 at the latest, and a failure there now ends at 19:19 on a `late` fo_ashfall: every work card is closed (measured, seeds 1–400). The success ends at 18:19. The P43-A test also times only the failure: its fresh game rolls GU 0.5 against DC 3 and failed on all 400 seeds I tried, so `fs === 80` pins the branch the comment says it isn't. Also, the 80 counts the walk home as 20 (Leave him.'s move default), while fo_spy_won and fo_spy_fled walk the same way down in 60.
Fix: give the time to the success only. Either keep fo_spy:1 on no `time` (fail: the act default 30, then fled's 60) and move the hour into the success `do` as an `advance(g, 60)` with its walk, or split the walk (success 60 + 60 = 120 like the other two ways down). Both are balance changes, so they are the owner's pick. Retest both branches (TG1).

**M2, L5's three channels don't match the three lines (js/story/coil_scenes.js:112).** The lift prints Convergence Use, GU and Yuki (bond) Qi Use. The text names "the Convergence, the Qi in you, Yuki's end of the bond". GU is General Use (faq.js:37: "anything he has no skill for, his defence, and every strike with a sung weapon"), not Qi. A reader who matches the words to the lines finds no "Qi in you" line, and the only Qi line is Yuki's, which the next item names. That is the mismatch L5 was meant to close.
Fix: redraft the middle item as General Use's own thing (the knack for everything else, the hands that strike), not Qi. That is story text, so it goes to Fable with the faq.js line as the brief. Then pin it (TG7).

## Low
**L1, the hall has no fire either (js/story/act1_heart.js:148).** heart_hall is the first sight of the hollow ("Four centuries of dust… Your steps make no sound in it"), before "Make this the base. Look around." No text on it, or on the screens before it, lights a fire. A hare comes out "cooked. +35" 15 min after walking in. The base reason holds by place only (heart_hall and heart_hub are both "Inside the Old Tree"). The first fire in the texts is heart_hub's/heart_camp's.
Fix: accept, with "the base by place" written down, or eat raw on heart_hall too (`fire: false` for all three) so cooked starts at heart_hub. That is a satiety change, so the owner's pick.

**L2, the skip now walks a starving James past food (again.js:276).** Measured from bl_end with 2 smoked meat at Fed 0.5: the skip takes 2 steps to heart_gate and ends at Fed 0, HP 21 → 20. Before, the open Eat stopped it at ht_start. `skipPlan` only blanks a collapse, not hunger.
Fix: let `skipPast` hold only while `g.james.satiety >= HUNGRY_AT` (30, the "You are hungry." line), so a hungry James is stopped where he can eat. A flow change, so the owner's pick.

**L3, once a visit, then again after a form change (music.js:98–99).** After a meal or a cook the song is hidden. A form change goes through yuki_form (newVisit false on the way back) and the song is drawn again on the same visit. Rendered on heart_hall through a meta screen: `durin`, `null`, `durin`. It can happen on bl_camp, rt_camp, night and heart_view, which have both a self-returning action and "Yuki: change form.".
Fix: accept (the pick says a form change keeps it), or mark the hide (`L.sg.hid = id`) and honour it on a newVisit-false return within the same day.

**L4, no `VERSION` bump and no news entry in the diff (sw.js:2 still 'bone-ash-0.11.274'; js/core/news.js).** These are probably for the docs step. The 0.11.275 entry should tell the player that the roots and the doorway now eat raw (a hare 35 → 18), that the hall's song shows once a visit, and about the skip past the Eat.

**L5, "The rest waits in your head" (coil_scenes.js:112).** Coming after "the skills went the usual way… less a small refund", "the rest" reads as the rest of the skills, which the same sentence just said went. The old "which leaves your head" pointed at the knowledge.
Fix: fold it in with M2's redraft (Fable), e.g. a subject that is plainly the knowledge, not the skills.

**L6, `c.index < 1000` (again.js:276).** It is redundant and hard-codes ONE_MOVE. It's harmless, but drop it or import the constant if the guard should stay readable.

## Test gaps
- **TG1 (M1, C2), both fo_spy:1 branches:** success: `g.james.gu = { tier: 2, level: 5, xp: 0 }`, `goTo(g, SCENES, 'fo_spy')`, `choose(g, SCENES, 1)` → `r.roll.success && g.scene === 'fo_ashfall' && g.flags.spy === 'talked' && g.minutes - m0 === 80` (or the new value). Failure (fresh game): `!r.roll.success && g.scene === 'fo_spy_fled'`, with its minutes pinned to whatever M1's fix decides. Assert `r.roll.success` in the success case, so a GU change can't move it back to the failure branch unnoticed.
- **TG2 (C4, C6), one time per screen, the default sibling too:** with the block's `tap`: `tap('heart_core', 0) === tap('heart_core', 1)` and `tap('ya_found', 0) === tap('ya_found', 1)` (both 30), and `[0,1,2].map((i) => tap('ya_share', i))` all 10. Today only the explicit `time` of :1 is read.
- **TG3 (C3), L2 in a real game's flags:** in the EH loop set `h.flags.fire = true` (the prologue's bow-drill leaves it set) and assert ht_start and heart_gate still print `/^You eat: glassback hare\. \+18 satiety\.$/` and heart_hall `cooked. +35`.
- **TG4 (C1), L3 leaves the music line alone:** on a MUSIC_SCREENS screen at hour ≥ MUSIC_FROM with no song due (`markHeard` its song, or a screen without one), `const a = M.musicLine(g, v); const b = M.musicLine(g, v, { afterAction: true });` → `a && b && a.key === b.key`.
- **TG5 (C5), L4's heart_gate assertion is vacuous:** at heart_gate in a fresh game three non-Eat choices are open, so `length !== 1 ||…` is always true. Replace it with: no flags → `AG.skipStep(g, SCENES) === -1`; with `gate_listened` and `sect_marks` (Coil 2, read) → `AG.skipStep(g, SCENES) === 2` and `AG.skipPlan(g, SCENES)` → `{ steps: 2, to: 'heart_hub' }`. Add one screen with a self-returning question and one way on, read before, and assert `skipStep === -1` there, so the skip can't spread past `skipPast`.
- **TG6 (L2):** from bl_end at Fed 0.5 with food (Coil 2, all read), pin `skipPlan`'s `to` to the owner's decision (`ht_start` if the hunger stop is picked, `heart_gate` if not).
- **TG7 (M2):** once redrafted, pin one word per channel against the lift's line names (Convergence, General Use or its phrase, Yuki's bond), rather than one exact sentence. A rule survives a reword, and a fault that drops a channel still fails.

## Planted faults (`/home/claude/work/p43-faults-c.json`, not run; each `find` checked unique and each mutated file passes `node --check`)

| Fault | File | What it breaks | Why the tests may miss it |
|---|---|---|---|
| C1 | music.js | the music/archive line (not a song) also vanishes after every action on a camp or hub | the tests call musicLine without `afterAction` for music lines (TG4) |
| C2 | act1_fallout.js | fo_spy:1's success takes 120 min (a direct `advance` in `do`) | the test's fresh game always fails the check (TG1) |
| C3 | act1_heart.js | the roots and the doorway fall back on `g.flags.fire`, which the prologue sets, so they eat cooked again | the test's fresh game has no fire flag (TG3) |
| C4 | act1_heart.js | heart_core:0 at 10 against :1's 30 | only :1's time is read (TG2) |
| C5 | again.js | the skip walks past every self-returning choice, not only `skipPast` | heart_gate's assertion is vacuous, and nothing else probes skipStep in the story test (TG5) |
| C6 | act1_blackroot.js | ya_found:0 at 10 against :1's 30 | only :1 is read (TG2) |
