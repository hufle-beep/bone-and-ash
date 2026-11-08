*Group i round 2, the brief Claude wrote for the round 2 helpers (it points to `group-i-brief.md` too): kept word for word (v0.11.75, owner pick W1). Wave 2 (the cultivation games) reuses it.*

# Brief, group i round 2: dating sims, visual novels, cultivation games (read-only research)

Read `/home/claude/bone-and-ash/project/research/group-i-brief.md` first (round 1's brief): its "Bone and Ash in one page", "What is coming", the safety rules and the output layout all still apply. **Never edit anything under /home/claude/bone-and-ash**; write only your own output file. Round 1's results are in `/home/claude/bone-and-ash/project/research.md` (group i, #43–#94): don't re-propose those; you may say "strengthens #NN" when a game here adds weight or a better shape to one of them.

## What the owner wants from round 2 (owner 2026-11-08 18:52)

"dating sim style games for the time and relationship management aspect, also goals and things like that. and also visual novels too (those overlap often). the whole net, don't just stop at google and github and Reddit please. I would also like you to look into cultivation/xianxia games, both idle/incremental and not."

So: **how other games manage time and relationships together** (calendars, time slots, a limited number of actions per day, who you spend time with, affection that rises and decays, gifts, schedules, routes, goals and deadlines, what is shown to the player), **how visual novels structure branching, routes, loops and repeat visits**, and **what cultivation / xianxia games do** with realms, breakthroughs, sects, lifespans, reincarnation, combat and relationships.

## Bone and Ash's relationships today (check details in the repo)

Numbers per person (Ya, Mei Lin, Village, Yuki, Old Wen, Mei Lin's mother, Old Hu), raised in scenes and some cards; the places in the code that move them: Ya 89, Mei Lin 83, Village 60, Yuki 16, Old Wen 4, Mother 4, Old Hu 2. Friendship and affection apart for some. Romance gates: `likesMei` (the prologue romance or Mei Lin affection ≥ 60), `likesYa` (affection ≥ 85), the shared scene on Day 20 needs both plus `trio` ≥ 3. A rewind keeps 25% of each relationship's last peak (Yuki whole). Talk cards are daily; later talks repeat their text. Group e plans: whose relationships to track and a choice / reply / increase tree; relationship cards; texts in sequence, never repeating within a Coil; reactions to Yuki's forms. Group f: romance scenes only with enough affection, a choice when both are high. Romance always fades to black at the door (a hard content limit): from adult games take only structure, never content.

## Where to look: the whole net

Not only Google, GitHub and Reddit. Use WebSearch (try `mode: "extended"` for niche or non-English finds) and WebFetch across: Steam store pages and their reviews and guides; itch.io pages and devlogs; VNDB (vndb.org) for visual novels; fan wikis (Fandom, wiki.gg, Miraheze, Bulbapedia-style wikis for each game); GDC Vault talk pages and slides; Game Developer (formerly Gamasutra) postmortems and design articles; developers' own blogs (Emily Short's blog on storylets and relationship systems, Failbetter's "quality-based narrative" posts, Inkle's blog, Supergiant interviews on Hades' dialogue); Lemma Soft forums (visual novel makers); the Ren'Py, ink, Yarn Spinner, Twine docs; IFDB and the IF Archive; Choice of Games and Hosted Games pages; TV Tropes for structures; Metacritic or review sites for what players liked or hated; Chinese sources for xianxia games (Bilibili, TapTap, Zhihu, NGA, 3DM, the games' Chinese names), Japanese sources for dating sims and VNs; YouTube video pages only for titles and descriptions. Say in your Sources which kinds of site you used. Some sites will block you: list them under Unverified and move on.

**Open-source engines and code** (licences checked at the repo's own licence file; code only where the licence allows, with its notice; ideas otherwise): e.g. ink (inkle), Yarn Spinner, Tracery, Ren'Py and any open Ren'Py dating-sim frameworks, Twine story formats (Harlowe, SugarCube, Chapbook), open-source dating sims or VNs on GitHub / Codeberg / GitLab, open-source cultivation games (search in Chinese too: 修仙 放置 开源, 修真 游戏 github). Clone what you need with `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --filter=blob:none --no-checkout https://github.com/<owner>/<repo> /home/claude/gi/<owner>_<repo>` (one clone at a time per repo), then `git -C <dir> checkout HEAD -- <paths>`; never run their code.

**Copyright:** describe in your own words; quote at most a few words from any page or game; no song lyrics or poems; no long game text.

## Output

Same layout as round 1's brief: per game (what it is, what was read, licence or "closed", the source pages), candidates best value first in the table with the "Bone and Ash today (checked in our repo)" column, considered and skipped, avoid list, unverified, and a Sources list of every page used. Quality over count. Concrete: what the player would see in Bone and Ash, what would change (balance, save), where it goes (group d / e / f / section 2 / 4 / 5).
