# Cold review brief: v0.11.197 (owner picks C1, D1): walks with company are flown only when the party is carried

You have not seen this build. Review it from `project/review-checklist.md` (read it first), cheaply: the diff, this brief, the packet; grep and line ranges only, never whole story files.

## What was picked (the owner's words and picks)

The owner, 2026-11-16 12:28, word for word: "a story/mechanics suggestion. should the f/a be high enough, Mei wouldn't mind being carried by James, and Ya would find riding a Great Cat firm Yuki or being carried by a human form Yuki cool. So the travel times wouldn't increase back to lengths taken on foot, if the realms and relationship meters are high enough."

C1 (picked 13:11): on a marked walk (`js/story/walks.js`) with `mei_party` or `ya_party` set, at Foundation+ (`canFly`):
- carried (flown at walk ÷ (1 + realm), as before) when Yuki's great form is open (`yukiForms(g)` has 'tiger', realm 2+) and Mei Lin's and Ya's friendship and affection are each ≥ 30 (`CARRY_F`, `CARRY_A`); the line from `CARRY_LINES.great`, or `.human` while Yuki is in her human form;
- otherwise everyone walks, full walking time, with a line from `FOOT_LINES.yuki` (no great form; checked first), `.mei`, `.ya`;
- `hot_spring` [2] "Leave them to it" is marked `alone` (he leaves them; flown as his own, FLOWN_LINES);
- `lore` [0] stays unmarked (v0.11.195);
- the FAQ's Flight entry gains "With company:"; What's new gains 0.11.197. No save field; the turn is `g.stats.flown` for all three pools.
D1 (13:19): Fable's 14 lines as drafted, line 1 of `great` with Fable's alternative ("Ya rides Yuki and whoops at every turn.").
Measured before the pick (a scratch copy of the models test): carried Careful / Completionist / Sociable 0%, Random 30%, Cultivator 82%, Sitter 79%; +296 / +361 / +301 / +243 / +58 / +120 min a game; Coils and clears unchanged.

## Files

`git -C /home/claude/bone-and-ash diff` (the working copy; uncommitted): `js/core/game.js` (`CARRY_F`, `CARRY_A`, `partyCarry`), `js/core/story.js` (`CARRY_LINES`, `FOOT_LINES`, `partyLine`, `choose`'s `carry` and `walkTime`), `js/story/walks.js` (the `alone` mark), `js/core/faq.js`, `js/core/news.js`, `tests/story.test.mjs` (the C1 (197) block), `tests/faq.test.mjs`.
Fable's brief: `/tmp/c1/brief.md`; drafts and notes: `/tmp/c1/drafts.md`; a packet of three of the walks: `/tmp/c1/packet.md`. More packets: `node tools/packet.mjs <scene:index> --games 0`.
The 17 walks with company measured: `log_comfort` [0], `ape_won` [0], `heart_gate` [2], `rt_dawn` [0], `heart_core_after` [0], `ht_leave` [0], `rt_road` [2], `rt_wolves_won` [0], `rt_start` [0], `dw_drowned_won` [0], `bl_morning` [0]–[3], `wyrm_won` [0], `roots_won` [0], `hot_spring` [2], `guardian_approach` [2], `ship_wreck` [1], `rt_brawl_won` [0].

Known and out of scope (open, options later; don't report): the arrival scenes' own texts that describe walking after a carried flight (e.g. `rt_road`'s "Ya's Way", `rt_ambush`'s "you walk into her back").

## What to check (besides the checklist)

- The rule's logic in `choose` (both places a walk's time is spent: `c.time`, and the default move minutes after `go`), task mode, checks, `alone`, mortal James, a party flag set by the destination's `enter`.
- Each line against every state it can show in (forms, who is present, indoors in the Old Tree's Heart, the Ashen Hills when Ya is away (`ah_hub`), the Return), the bond vs speaking aloud, time words, tone, canon.
- The FAQ and the What's new line against the code.
- Test gaps: write planted faults as `/tmp/c1/faults-review.json` (the format in `tools/mutate.mjs`'s header; `find` exactly once) and run `node tools/mutate.mjs /tmp/c1/faults-review.json --jobs 2 --out /tmp/c1/mutate-review.md` (default command: the story test). Plant 8–15, including at least 3 inside the lines' words and the second time spot in `choose`.

## Output

`/tmp/c1/review.md`, under 10 KB: findings H / M / L, each with file:line, what is wrong, a fix in one line (a word fix in your own words is fine; say so), then TG (test gaps) with the mutate result. Don't edit any repository file. Reply with the path and the counts only.
