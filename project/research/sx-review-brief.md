# Cold review brief: v0.11.198 (owner picks S1, D1, T1): the road home after a carried flight, and more on-foot lines

You have not seen this build. Review it from `/home/claude/bone-and-ash/project/review-checklist.md` (read it first), cheaply: the diff, this brief, the packet; grep and line ranges only, never whole story files.

## What was picked

Background (v0.11.197, C1): on a marked walk (`js/story/walks.js`) with Mei Lin and Ya along at Foundation+, the party is carried (flown) when both women's friendship and affection are ≥ 30 and Yuki's great form is open (`game.js` `partyCarry`; the line from `CARRY_LINES.great` / `.human`), else everyone walks with a `FOOT_LINES` line (`yuki` / `mei` / `ya`).

S1 (picked 14:48), two leftovers of C1:
- **SX**: three screens of Act 1's road home described walking after a carried flight. Now `choose` (story.js, where `carry` is computed) sets `g.flags.party_flew` to `carry.carried` on every walk with the women along (not on an alone walk, a mortal walk, or a card). `act1_return.js` reads it (`flew`) and shows Fable's carried versions (`SX`): `rt_start` ¶1 (after `ht_leave` [0]); `rt_road` ¶1–¶3 (after `rt_start` [0]: Ya's way flown in hops, walked where she insists, so the labels "Walk with Ya at the front." / "Drop back and walk with Mei Lin." stay; ¶3 by `partyCarry(g)?.ya`, `great` or `human`); `rt_ambush` ¶1 and Ya's "They've paced us since the tree." (after `rt_road` [2]). Unset (old saves) reads walked. Not kept across Coils.
- **L3**: five more lines in `FOOT_LINES.yuki` (3 → 8), Fable's words; the quiet walks still take `[0]`.
D1 (14:52): Fable's drafts with Claude's three fixes: ST (the ¶3 jokes were "She steers with…", echoing `CARRY_LINES.great[2]` "*She steers by the ears,*" shown just before; now "She calls me 'pony'"), RA (`rt_ambush` keeps its original "She lets it pass without a word, and that tells you how bad it is."), RU ("You fly up out of" / "You land on the birch ridge." instead of openers used on other screens).
T1 (14:56): the yuki line "Ya asks how long you'd have taken flying it alone. {min} min, you tell her. …" is the one on-foot line with `{min}` first; the RV1 TG2 test names it as the exception.
Measured before (a scratch copy of the models test, 1,100 games): after a carried flight `rt_start` 386, `rt_road` 364, `rt_ambush` 390 shows (Random 1.3, Cultivator 3.0, Sitter 2.8 a game); the yuki pool 8,882 shows (Careful 9.7, Completionist 12.9, Sociable 10.2, Random 9.5 a game).

## Files

`git -C /home/claude/bone-and-ash diff` (uncommitted): `js/core/story.js` (the five lines; the flag in `choose`), `js/story/act1_return.js` (`flew`, `SX`, the three texts; `partyCarry` imported), `js/core/news.js` (0.11.198), `sw.js`, `tests/story.test.mjs` (the SX (198) block; the C1 count and TG2 exception; P7A's code pin), `tools/text-baseline.json`, and four docs' version stamps (ignore the docs).
Fable's brief `/tmp/sx/brief.md`, drafts and notes `/tmp/sx/drafts.md`, packet `/tmp/sx/packet.md` (the four road screens, before the change). More packets: `node tools/packet.mjs <scene[:index]> --games 0` (it shows the new texts).
Claude's 12 planted faults, all caught: `/tmp/sx/mutate.md`.

Known and out of scope (open, options later; don't report): `mire_lost`'s "Limp back to the stream." label; `elder`'s `ignored` "walked down out of the Blackroot"; the other carried arrivals Claude read as fitting (`rt_ford`, `ah_enter`, `heart_view`, `heart_hall`, `ship_wreck`, `dw_enter`, `rt_arrive`, `heart_hub`) unless you find a clear contradiction.

## What to check (besides the checklist)

- The flag: every path into the three screens (`rt_start` [1] "Ask Ya…" reaches `rt_road` without a walk; returning from `rt_ya_talk` / `rt_mei_talk` / the Yuki walk; a reload mid-road; a Coil reset; task mode), a stale value from an earlier walk in the same Coil, the Ashfall leg after the road.
- The texts against every state they show in: Yuki's form at the time vs the ¶3 chosen by `partyCarry`; who is carried; ¶2 onward of `rt_start` and the rest of `rt_ambush` reading on from the new openings; the talk screens after the hop text; time words; tone (James and Yuki deadpan, Yuki only through the bond in italics except in human form, locals serious, Mei Lin looser, Ya blunt); the canon card's tics.
- The five yuki lines against every walk they follow (indoors in the Old Tree's Heart, the Drowned Wood, the Ashen Hills, the road), who is present, `{min}` / `{walk}` read right.
- What's new against the code.
- Test gaps: write planted faults as `/tmp/sx/faults-review.json` (format in `tools/mutate.mjs`'s header; `find` exactly once) and run `node tools/mutate.mjs /tmp/sx/faults-review.json --jobs 2 --out /tmp/sx/mutate-review.md`. Plant 8–12, at least 3 inside the new words and at least 2 on the flag's paths.

## Output

`/tmp/sx/review.md`, under 10 KB: findings H / M / L, each with file:line, what is wrong, a fix in one line (a word fix in your own words is fine; say so), then TG (test gaps) with the mutate result. Don't edit any repository file. Reply with the path and the counts only.
