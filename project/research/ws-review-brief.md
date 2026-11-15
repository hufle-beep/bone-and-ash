# Cold review brief — v0.11.190 (owner pick N1, D1)

You review a push you have not seen built. Repo: /home/claude/bone-and-ash (do **not** edit it; copy to a scratch dir such as /tmp/n1r/s/ for any render or test). Read `project/review-checklist.md` first and follow it. Read cheaply: excerpts by grep and line ranges, never whole story files.

## What the push does (from `git diff` in the repo; uncommitted working copy)
- **L9:** after a breakthrough that Mei Lin and Ya saw away from a village, Yuki's first great form (`yuki_tiger_awaken`, realm 2) and first human form (`yuki_human_awaken`, realm 7) get a paragraph of theirs (`AWAKE_WOMEN` in `js/story/prologue.js`): P both women (the Old Tree's case too: they came up the crack after the breakthrough's line), M Mei Lin alone while Ya is away (the Ashen Hills). Inserted before "Then she is eleven pounds again" (tiger) and "Then she looks at you and opens her mouth" (human). The test `btWho` is the breakthrough's own test, moved out of `btText`; `awakeWho` also requires `yuki_return === bt_return` (so not from the Long Forest's hub). Texts by Fable; Claude's cuts: C1 HP "have talked" (was "have been talking", a run shared with `yk_night_mei`), C2 TM's last two sentences ("I fed her fish heads. I would like that remembered.": no scene shows anyone feeding Yuki).
- **L8b:** on a day when one song already played, the next song's passage opens with a sentence of its own (`SONG_SECOND` in `js/story/songs.js`, five songs: mumei, Music Box of Fate, Boof Pack, The Water's Call, Dúrin; `songShown`); `js/story/music.js` keeps the day's earlier song as `p` in the per-Coil `sg` record so a redraw keeps the sentence (SK1; older saves have no `p`).
- **SW:** the parley's GU check (`rt_parley`, DC 9) +1 reads `a1_sky_seen` as well as `sky_witness` (as the texts already do). Measured: the check passes in 482 of 482 parleys, so 0 outcomes change.
- Tests: `tests/story.test.mjs`'s N1 block (search "owner pick N1, D1"); the BR1 pins updated for SW. `js/core/news.js` a What's new line.

## Measured before the build (200 bot games each, the Sitter 100)
- Yuki's great form in Act 1 with the women: Random 62 both + 32 Mei Lin alone (12 more with both away: none), Cultivator 153 + 1; the human form: the Sitter 43 + 59; prologue great forms (no party): Cultivator 48, Sitter 102, Random 3.
- Two songs a day: Dúrin + mumei (Random 158, Careful 200, Completionist 192, Sociable 200), Trøllabundin + Music Box (74, 168, 184, 119, Cultivator 186), Genesis + Boof Pack (Completionist 83, Sociable 21), the Sitter Boof Pack + Water's Call 32, Music Box + Dúrin 42.

## Files for you
- `/tmp/n1/brief.md` (Fable's brief, with the tone rules and constraints), `/tmp/n1/drafts.md` (Fable's drafts and alternatives), `/tmp/n1/notes.md`, `/tmp/n1/canon-card.md`, `/tmp/n1/now.md` (the breakthrough lines just before the form scenes), `/tmp/n1/songs.md` (the five passages).
- `/tmp/n1r/packet.md`: the packets of the changed scenes (`node tools/packet.mjs`).

## Report
Write `/tmp/n1r/review.md` (under 10 KB): H / M / L findings with file:line and a concrete fix each, then TG (test gaps). Plant faults with `tools/mutate.mjs` (write `/tmp/n1r/faults.json`, run `node tools/mutate.mjs /tmp/n1r/faults.json --jobs 2` from the repo; it works on copies) — about 12–18 faults against the new code and texts; list caught / missed in the report. Reply with one line when done.
