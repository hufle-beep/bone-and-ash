*Group i, round 2 wave 1, cluster E, dating sims and relationship-and-time systems: kept word for word as the helper wrote it (v0.11.75, owner pick W1, 2026-11-08 19:54). Opus helper agent, read-only; the main claims checked by Claude against our code. Paths under /home/claude are the cloud workspace. The merged record and where each candidate went: `project/research.md`, group i round 2.*

# Group i round 2, cluster E: dating sims and relationship-and-time systems

*Read 2026-11-08, read-only research for Bone and Ash v0.11.74. Every game here is closed source (**ideas only**, described in our own words); the four open-source pieces are marked with their licences, rechecked at each repo's own licence file. Nothing was run. The "Bone and Ash today" column was checked in `/home/claude/bone-and-ash` (files named). Round 1's #43–#94 aren't proposed again; "strengthens #NN" marks where a game here adds weight or a better shape.*

**What Bone and Ash has today (checked):** `bumpRel(g, who, f, a)` in `js/core/game.js` moves friendship and affection apart (−150…150), with the catch-up (×3 while under the best-ever value, `g.coil.best`, since v0.11.16; Yuki never caught up). `coil.js` `HEAD_START = 0.25` gives back 25% of the last Coil's peak, and Yuki is kept whole. The gates are in `js/story/act1_common.js`: `likesMei` (the `romance` flag, or Mei Lin a ≥ 60), `likesYa` (`ya_romance`, or Ya a ≥ 85), `trio`, `trioStep`. Talk cards are `talk_mei` / `talk_ya` in `act1_blackroot.js`: daily (`markDaily`), 40 minutes, three texts by `mei_talks`, after which the last one repeats. `mei_bond` shows only when Mei Lin a ≥ Ya a + 8, so the game decides which romance comes first, not the player. `fo_last_night` (`act1_fallout.js`) offers trio / "Stay." / "Hold her" / "Sleep." by flags. **No code in `js/core` reads a relationship except to move it or carry it over**, so relationships open scenes and do nothing else. The sheet shows raw numbers (`main.js` `renderSheet`: "friendship N · affection N"), and each action shows a results line (`replies.js` `relLines`). `ya_tooth` already exists as a gift item (two scenes).

## 1. Per game

| Game / source | What it is; what was read | Licence | Latest dated update found |
|---|---|---|---|
| **Tokimeki Memorial** (Konami, 1994; series to 4 and *Emotional*, 2025) | The stat calendar dating sim: weekly commands (study, exercise, preen, hang out, club), girls introduced by stats, a confession at graduation. Read: the LP Archive's planning update (bomb rules, who appears when, the stat thresholds), the Japanese *Tokimeki Dictionary* atwiki pages on 傷心度 (heartbreak) and 爆弾 (bombs), and a Japanese review of the bomb system (t4nat0s). | closed: ideas only | *Emotional* (Switch) 2025 (Japanese guide pages) |
| **Persona 3 / 4 / 5** (Atlus) | Social links and confidants inside a school calendar with day and evening slots and dungeon deadlines. Read: megatenwiki *Confidant* (points, ×1.5 bonuses, story-driven ranks, P3's reversals and their removal in Portable, P4's note icons, the rank perks of party members), Digital Trends' P5 romance guide (romance at ranks 9–10, the map shows when a bond is close to a rank-up), samurai-gamers' P5 endings (a missed deadline ends the game). | closed: ideas only | P3 Reload 2024 (guides) |
| **Princess Maker 2** (Gainax, 1993; *Regeneration* 2024) | Raising a daughter over 96 months, three ten-day slots a month: classes, jobs, adventure, rest; stress above Constitution makes her ill. Read: the CRPG Addict's entry. | closed: ideas only | *Regeneration* 2024 |
| **Long Live the Queen** (Hanako Games, 2012) | 40 weeks to the coronation: two classes a week, a weekend mood that changes how well she learns, fixed events checked against skills, frequent deaths, replays to learn the schedule. Read: Emily Short's review. | closed: ideas only | n/a |
| **Stardew Valley** (ConcernedApe) | Hearts as points (250 a heart), daily talk, two gifts a week, decay, heart events. Read: the official wiki's *Friendship* page. | closed: ideas only | n/a (wiki) |
| **Fire Emblem: Three Houses** (Intelligent Systems, 2019) | A monthly calendar with free days (explore with a limited number of actions, seminar, battle, rest); support ranks raised by meals with up to two guests, tea, gifts, lost items. Read: samurai-gamers' free-day and support pages, RPG Site's New Game Plus and Renown guide. | closed: ideas only | n/a |
| **Hades** (Supergiant, 2020) | A roguelike whose house characters remember every death; a pool of unique lines with requirements, plus filler; nectar and ambrosia; locked hearts behind a favour; keepsakes from first gifts. Read: Game Developer on its narrative rewards, GameSpot's Kasavin quote ("a simple system at heart", conditions checked), the Nexus mod *47* description (names `MinRunsSinceAnyTextLines`, `Priority` on story lines), a Steam thread on the unique and filler pools, Fextralife's *Nectar* page (5–6 nectar → a favour → the remaining hearts), RPG Site and Game Informer on romances, the GDC Vault page for Kasavin and Korb's 2021 talk (title only), Sascha Becker's *game-mechanics* notes. | closed: ideas only | Hades II 1.0 2025 (news) |
| **Monster Prom** (Beautiful Glitch, 2018) | A dating sim for 1–4 players over a fixed 3 or 6 weeks; each slot picks a place, events check six stats, love points are hidden, an ask at prom. Read: the monsterprom.wiki.gg stat page, *Into the Spine* review. | closed: ideas only | n/a |
| **Dragon Age: Origins / II / Inquisition** (BioWare) | Approval −100…100 with tier names; in DA:O it stops at 74 until the personal quest. DA II has a friendship/rivalry bar with rewards at both ends, locked once full. Inquisition hides the bar and shows notifications. Read: GamerGuides' DA:O *Approval*, The Learned Fangirl's DA:O to DA:I essay. | closed: ideas only | n/a |
| **Mass Effect** (BioWare, 2007) | Two love interests confront Shepard together and force a choice. Search results only (several guides); not fetched. | closed: ideas only | n/a |
| **Baldur's Gate 3** (Larian, 2023) | Camp scenes on a long rest, played by priority with requirements (approval, story flags), some cancelled by resting or by the story moving on. At the Tiefling party several romances can be on offer, but only one is picked "when you go to sleep". Read: bg3.wiki *Camp Events* and *Tiefling Refugee Celebration*. | closed: ideas only | n/a |
| **Dream Daddy** (Game Grumps, 2017) | Three dates per dad, a grade at the end of each date, cues during dates. Read: RPG Site's review. | closed: ideas only | n/a |
| **Hatoful Boyfriend** (Hato Moa / Mediatonic) | A short school year replayed for 14 endings; the first term repeats with a skip button that stops at new text. Read: Twinfinite's review. The hidden route's unlock wasn't confirmed (see Unverified). | closed: ideas only | n/a |
| **Rune Factory 4** (Neverland) | Love points from daily talk, gifts, festivals and outings; a confession from LP 7, once a day. Read: GuideStrats' confession guide. | closed: ideas only | n/a |
| **Chinese Parents** (中国式家长, Moyuan, 2018) | Raising a child to the gaokao in action-point turns; a one-sided crush up to 100, where about 80 gives a match after the exam and a talent for the next generation. Read: a TapTap mechanics post (Chinese) and a Gamersky review of the generations update (Chinese). | closed: ideas only | the generations update (Gamersky) |
| **Otome route locks** | Locked true routes. Read: a Fuwanovel forum thread on locked routes. | n/a | n/a |
| **Ren'Py Dating Sim Engine (DSE)** `renpy/dse` | PyTom's day planner and event dispatcher. Read: `DSE-LICENSE.TXT`, `README.md`, `game/dse-event_dispatcher.rpy` (whole), `game/dse-schedule.rpy` (head). | **MIT** (the licence file has no copyright line; the source names PyTom, Andrea Landaker (qirien) and Edmund Wilfong): code may be adapted with the MIT notice | 2019-10-25 |
| **Yarn Spinner** `YarnSpinnerTool/YarnSpinner` | Dialogue engine with storylets and saliency. Read: `LICENSE.md`, `YarnSpinner/Saliency/*.cs` (the four strategies, `ContentSaliencyOption`), and the docs page *Storylets and saliency: a primer*. | **MIT**, © Yarn Spinner Pty Ltd, Secret Lab Pty Ltd and contributors | 2026-11-08 |
| **ink** `inkle/ink` | Narrative scripting. Read: `LICENSE.txt`, `Documentation/WritingWithInk.md` (sequences, cycles, once-only, shuffles; sticky and fallback choices). | **MIT**, © 2025 inkle Ltd | 2026-05-05 |
| **DS-toolkit** `DRincs-Productions/DS-toolkit` | A Ren'Py character-statistics kit. Read: `LICENSE`, `character_statistics_sentimental.rpy`. Adult stat set: not for us. | MIT, © 2020 Don Renpy | 2024-04-15 |
| **Design writing** | Emily Short's *Beyond Branching* (QBN, salience, waypoints) and *Storylets: You Want Them*; Kreminski & Wardrip-Fruin, *Sketching a Map of the Storylets Design Space* (repeatability, selection by salience, decks); Failbetter's *Echo Bazaar narrative structures 2* and *Don't poke that* (one quality per ordered sequence, few qualities, warn before cruelty); Idrelle Games' (Wayfarer) *Creating relationship and approval systems*; Del Gesso's thesis *Beyond Affection Meters* (repair); inkle's *Love and romance in Heaven's Vault*; GDC Vault pages: Dahlen, *Love/Hate Relationships* (2014); Dollarhyde & Moberly, *Designing Relationships* (2025). | n/a | n/a |

## 2. Candidates for Bone and Ash, best value first

*Every number is a placeholder shape, not a tuned value; nothing was simulated. Texts by Fable (rule 10); romance always fades to black at the door.*

| # | What (one line) | Game and source | Bone and Ash today (checked) | Value, effort | Where it would go | Licence |
|---|---|---|---|---|---|---|
| E1 | **Relationship beats that move on across Coils (Hades adapted to people who forget).** Each person's talk beats form one ordered list. A "heard ever" set is kept across Coils, like the knowledge flags. In a later Coil a beat already heard plays as its short **second hearing**: she tells it again, James already knows it, and one reply exists only because he knows ("Finish her sentence"). The ladder then goes on to beats that only a later Coil reaches. Spacing: one beat per person per day (the daily mark exists). A story-essential beat goes before filler. Filler after the list: once-only, never repeated within a Coil (#48). The player sees talks that don't restart from zero each Coil, and James's side of each relationship growing. | Hades: unique lines gated by earlier lines and run conditions, a filler pool, `MinRunsSinceAnyTextLines` spacing, `Priority` for story lines (Nexus mod 47, the Steam thread); ink's once-only lists and fallbacks; Hatoful's skip that stops at new text | `talk_mei` has three texts by `mei_talks`, then the last one repeats; the counter resets with the Coil (a flag), so Coil 2 replays texts 1–3; `KNOW_TEXT` has 4 knowledge flags; "You remember this" skips exist (`again.js`) | **high**, M–L (writing); save: `heard` set, additive | group e (whose relationships, the tree, texts in sequence); strengthens #48, #50, #70 | idea only (Hades); ink MIT |
| E2 | **A story beat opens the next tier.** Per person, affection stops at a cap until a named scene has played. For example, Ya can't pass 84 until her price scene (or the wolf tooth); Mei Lin can't pass 59 until `mei_bond` or her mother's lecture (the beats get picked in group e). Romance scenes then come in story order in every Coil, however fast the catch-up refills. The sheet says she is "waiting on something" rather than showing a bare 84. | Hades: hearts locked until 5–6 nectar unlock a favour (Fextralife); DA:O: approval stops at 74 until the personal quest (GamerGuides); Stardew: 8 hearts until the bouquet; Wayfarer: approval capped lower in early chapters | gates are bare numbers (60 / 85); the catch-up (×3 to the best ever) plus daily talks can carry someone past a gate before her scenes in Coil 2 | **high**, S–M; **balance** (romance shares, numbers first); save: none (from flags) | group e (the tree), group f (the gates) | idea only |
| E3 | **The romance choice: one per night, offered, never extracted (group f).** On a night when both `likesMei` and `likesYa` hold, the evening's last choice lists "Mei Lin", "Ya", "the three of you" (only with `trio` ≥ 3), and "Sleep". The pick is for that night only, not a lock for the Coil. The one not picked gets one line the next day and no loss. Every gate scene also has a "stay friends" choice that costs nothing, and her friendship texts go on. | BG3: several romances can be on offer, one is picked when going to sleep, the others comment later (bg3.wiki); Hades: both maxed → a joint invitation, accept or ease off, no penalty (FAQ page, see Unverified); P5: friendship or romance at ranks 9–10; P3 criticised for lacking a platonic option (megatenwiki) | `mei_bond` shows only if Mei Lin a ≥ Ya a + 8 (the game picks, not the player); `fo_last_night` branches by flags (trio / "Stay." / "Hold her" / "Sleep."); no three-way choice | **high**, M; balance (small: who gets the night's gain) | group f (the owner's 20:12 item) | idea only |
| E4 | **A reason to spend the clock on people: friendship-tier perks.** At friendship tiers (say 20 / 40 / 70), each person gives a small fixed perk in their own field. Ya: once a fight she takes the lunge meant for Yuki (`prefersSmall`). Mei Lin: forage yields, later salves. Old Wen: a lecture worth one Insight. The Village: help with the tribute. The sheet shows "Next at friendship 40: …". Perks hang on friendship, not affection, so no romance becomes the optimal route. | Persona confidants: ranks give perks, and party members' ranks add follow-ups, survive a lethal blow once a fight, cure statuses (megatenwiki); FE3H: supports give hit and avoid bonuses nearby; Long Live the Queen's mood changing learning (a lighter variant: a good evening gives the next morning's sit a little more) | relationships open scenes only; nothing in `js/core` reads them for mechanics | **high**, M; **balance** (death rates; numbers first, model bots need it) | group e (the tree) with section 2 | idea only |
| E5 | **What James knows is coming: the act's calendar filled in by past Coils.** On the James tab or the Coil screen: the act's days, the deadline always shown. From Coil 2, every dated event James has lived appears once seen ("Day 9 night: the granary"), and so do people's dates where the story has them. Long Live the Queen's whole replay is learning this schedule by heart; here it becomes a page. | Long Live the Queen (Short's review: winning means learning which challenges come when); P5 and FE3H calendars marking deadlines, birthdays and events; Tokimeki's holidays as the date slots | the status bar's clock; deadlines planned (#73); 4 knowledge flags | **high**, S–M; save: a dated "lived" list (additive) or from `g.seen` | section 4 (game UI, with the deadlines); strengthens #73, #50 | idea only |
| E6 | **Least-seen first, then most specific, ties in written order: the picker's exact rule.** Sort the eligible lines by times seen this Coil, then by how many conditions each has. The sort is stable, so the written order breaks ties and a pool plays in sequence for free. | Yarn Spinner `BestLeastRecentlyViewedSaliencyStrategy.QueryBestContent` (view count, then `ComplexityScore`, stable sort; MIT) | no shared picker (`again.js` hashes into 24 lines) | **high** (as #48's rule), S; save: #48's played list | group e (with #48, #29) | code with MIT notice (idea preferred) |
| E7 | **A dispatcher for beats, from DSE's event conditions.** `once`; `solo` (filler only when no beat waits); `only` (this one alone this slot); `depends` (a prerequisite happened yesterday or earlier, which spaces beats by a day); `choose_one` (one from a group); a priority sort; and a load-time check that every event names a real scene. That's the engine room for E1. | DSE `dse-event_dispatcher.rpy` (`event`, `once`, `solo`, `only`, `happened`, `depends`, `choose_one`, `events_run_period`, the label check at `init 100`; MIT) | scenes use `show`, daily marks, flags; story tests walk scenes | medium-high, S–M | group e (with E1) | code with MIT notice (idea preferred) |
| E8 | **Shared meals: one card, one or two guests.** An evening "Cook for…" card at Ashfall or a camp. It uses one food item (or James's cooking beat) and invites one or two of Mei Lin, Ya, Old Wen or the mother. A liked dish counts more, and Mei Lin with Ya at the same fire moves `trio`. The texts play in sequence. | FE3H meals with up to two guests, the favourite dish (samurai-gamers); Persona's lunch invitations (×1.2) | eating is a card; James's cooking beats planned (group e); no shared meals | medium-high, M; balance (Fed, relationships) | group e (cooking beats, relationship cards) | idea only |
| E9 | **Gifts with tastes, and the first-gift keepsake.** On a talk card, "Give…" offers items James carries, at most one gift per person per day. Each person has tastes: Ya bones, teeth and salt; Mei Lin rare herbs; Old Wen tea. The first real gift to someone in a Coil brings a keepsake for the charm slot. Ya's wolf tooth is already one. | Hades: the first nectar gives a keepsake (Fextralife); Stardew: two gifts a week, loved / liked / neutral / disliked, ×8 on a birthday (wiki); DA:O's liked gifts | one-off gifts inside scenes (`ya_gift`, the salt); `ya_tooth` an item with no effect; the charm slot planned | medium-high, M; balance; save (optional gift counts) | group e, with section 4 (crafting's charm slot) | idea only |
| E10 | **Yuki remembers: her lines never repeat in the whole save.** Yuki is never reset, like Hades' household. Her Coil-screen line and her camp lines come from one ordered pool across all Coils, reacting to the Coil count and the cause. | Hades (characters remember every death; a little new dialogue each run) | the same Yuki line on every Coil screen (round 1, #51) | medium-high, S–M; save (seen ids, optional) | group e; strengthens #51 | idea only |
| E11 | **A gentle "bomb": neglect shown, never a chain.** The numbers never decay. When someone James has been close to hasn't had his time for a few days, her talk card gets a mark and someone else says a line about it (the mother, overly serious). If he goes on ignoring it, one written scene with a small one-time loss follows, mended by a single talk. It never spreads to anyone else. | Tokimeki: the heartbreak meter, warned by rumour or a quickening heartbeat, defused by a date, an explosion hits every girl (atwiki); P3 dropped its neglect reversals in Portable; Stardew: −2 a day, stopping at full hearts | no decay, no neglect texts | medium, S–M; balance (small) | group e (the owner's call) | idea only |
| E12 | **Status in words, numbers beside them.** "Mei Lin: friendship 34 (trusts you) · affection 62 (more than she says)". The words are per person, in their voice, on uneven tiers. The results lines stay as they are. | Wayfarer: status as words by range, uneven tiers, merge tiers whose text would match; DA:O tier names; P4's note icons show a range | raw numbers on the sheet (`renderSheet`), results lines (`relLines`) | medium, S | group e | idea only |
| E13 | **Introductions by skill.** A minor person turns up on a card's ladder when that card reaches a familiarity tier: Old Hu at a work card at Practised. So people join the tracked list when the player shows interest in their field. | Tokimeki: each girl appears when you do her activity with a stat above her threshold (LP Archive) | Old Hu: 2 places in the code that move him | medium, S | group e (whose relationships); strengthens #49 | idea only |
| E14 | **Two good ends to a bar: a rival track.** For Ya, or Old Hu, or the Village: beating Ya in drills earns respect on a track of its own, with its own content and perk, and it locks once full. | DA II friendship and rivalry, both rewarded, locked when full (Learned Fangirl) | friendship can go negative (−150), but nothing reads it | medium-low, M | group e (whose relationships) | idea only |

## 3. Considered and skipped

- **FE3H's New Game Plus buy-back of support levels, up to those reached before:** already ours: the catch-up (×3 up to the best ever, v0.11.16) plus the 25% head start.
- **Locked true routes (Hatoful, otome):** they fight "every branch reachable across Coils" and the owner's affection-only gates. At most, beats only loopers see (#69).
- **Hidden approval with notifications only (Inquisition):** Bone and Ash shows numbers since C1 (v0.11.68). E12 adds words instead of taking the numbers away.
- **Tokimeki's chain explosions and P3's jealousy reversals:** punishment that spreads; the Japanese reviewer liked the chaos, but it fights a loop game's readability. E11 keeps only the warning.
- **Persona's matching-arcana multipliers, Monster Prom's random merchant and multiplayer, PM2's stress illness and death:** no personas, no dice, one player; HP is already the hazard bar.
- **Daily decay (Stardew):** Coils are short (7 and 14 days). Decay would punish going into the Wilds, the game's main activity.
- **BG3's camp scenes cancelled by resting, and missable windows:** these work only once E5 shows what's coming; until then they read as arbitrary.
- **Dream Daddy's date grades:** the results lines already show the gains; a grade adds a second scoring.
- **Chinese Parents' inheritance by generation:** the Coil carry-over covers it. Its critic's point (a new generation plays the same way however the last one ended) fits E1 instead.
- **DS-toolkit:** an adult stat set (lust, corruption). Outside Claude's content limits; nothing taken.
- **Monster Prom's start quiz that picks a first love interest:** the prologue already fixes who you meet. A "focus" pick is at most part of E5's page.

## 4. Avoid list

- Romance as a vending machine for repeated attention (inkle's Heaven's Vault post), and gains that push the player into choices out of character (Wayfarer; Short on Long Live the Queen: optimising beats role-play). Perks hang on friendship, never on affection (E4).
- Forced confrontations as a punishment (Mass Effect's two-at-once): the choice is offered (E3), and declining costs nothing (Hades).
- Penalties that cascade (Tokimeki), neglect decay for exploring (P3, removed in Portable), and deaths or losses nobody could see coming (Long Live the Queen's early game).
- Lines that can't be guaranteed to arrive, so a reaction plays long after its cause (players complain about Hades): story-essential beats get priority, and filler waits.
- Too many relationship variables, or one variable used for two meanings (Failbetter's *Don't poke that*, Wayfarer). Each person gets one counter for their ordered sequence.
- Romance for everyone (the DA II critique): it sprawls. "Whose relationships to track" should cut, not add.
- Hidden checks with no feedback (Long Live the Queen's "displeased" nobles).
- Adult stat sets and their notifications (DS-toolkit): never.

## 5. Unverified

- **Hades:** only `MinRunsSinceAnyTextLines` and `Priority` are confirmed (from the mod 47 page). Other data names I remember (PlayOnce, required-lines lists) weren't checked. The joint scene for Meg and Thanatos comes from one FAQ site (calendar-uk.co.uk) only. The Kasavin and Korb GDC talk was not watched. hades.fandom.com wasn't on the allowlist; BreezeWiki was blocked by Anubis.
- **P5:** that a missed deadline sends you back about a week is one commenter's anecdote, not the guide. Hangout costs and gift details weren't read in full (the page was cut at 100k characters). megamitensei.fandom.com wasn't on the allowlist; megatenwiki was used instead.
- **Tokimeki:** "about 3 months to a bomb, a date every 4 months" comes from the LP Archive (the first game). The atwiki gives no numeric threshold.
- **Not confirmed:** the unlock of Hatoful's hidden route (the reviews didn't say), Monster Prom's rules for the prom ask, the Mass Effect confrontation (search results only), FE3H's renown prices, and any decay in Rune Factory.
- **Blocked or failed:** Wikipedia (allowlist); GitHub web pages for ink (allowlist; read by clone instead); vintageisthenewold and cyberpost (client errors); the itch.io page of a Ren'Py dating-sim kit (client error); Hardcore Gaming 101 (maintenance page).
- **GDC talks:** descriptions only. The Kreminski PDF was read through a fetch summary.

## Sources

*Kinds of site used:* fan wikis (Stardew wiki, megatenwiki, bg3.wiki, Fextralife, monsterprom.wiki.gg, the Japanese atwiki), guide sites (RPG Site, samurai-gamers, GamerGuides, GuideStrats, Digital Trends), the LP Archive, Steam discussions, Nexus Mods, Game Developer, GameSpot, GDC Vault, developers' blogs (Emily Short, Failbetter, inkle on Game Developer, Idrelle Games on Tumblr), an academic thesis repository and a paper PDF, a blog (CRPG Addict), Chinese community sites (TapTap, Gamersky), a Japanese review blog, a VN forum (Fuwanovel), GitHub repos (cloned, never run) and the GitHub topic page.

- https://lparchive.org/Tokimeki-Memorial-Series/Update%2002
- https://w.atwiki.jp/tokimeki_dictionary/pages/188.html
- https://w.atwiki.jp/tokimeki_dictionary/pages/273.html
- https://t4nat0s-blog.com/tokimemo-for-emo-review/
- https://megatenwiki.com/wiki/Confidant
- https://www.digitaltrends.com/gaming/persona-5-romance-confidants-guide-tips/
- https://samurai-gamers.com/persona-5/get-different-endings/
- https://crpgaddict.blogspot.com/2024/05/game-514-princess-maker-2-1993.html
- https://emshort.blog/2015/07/21/long-live-the-queen-hanako-games/
- https://stardewvalleywiki.com/Friendship
- https://samurai-gamers.com/fire-emblem-three-houses/free-day-activities/
- https://samurai-gamers.com/fire-emblem-three-houses/information-on-the-bond-support-system/
- https://www.rpgsite.net/feature/8750-fire-emblem-three-houses-new-game-plus-and-renown-guide
- https://gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death
- https://gamespot.com/articles/hades-writer-explains-script-philosophy-after-player-discovers-incredible-detail/1100-6482650/
- https://gamedeveloper.com/audio/dive-into-the-dialogue-of-i-hades-i-at-gdc-2021
- https://gdcvault.com/play/1026975/Breathing-Life-into-Greek-Myth
- https://www.nexusmods.com/hades/mods/47
- https://steamcommunity.com/app/1145360/discussions/0/2987539784417139179
- https://hades.wiki.fextralife.com/Nectar
- https://www.rpgsite.net/feature/10276-hades-romances-how-to-romance-thanatos-megeara-and-dusa
- https://gameinformer.com/2020/10/19/everything-you-need-to-know-about-every-hades-romance-option
- https://www.calendar-uk.co.uk/frequently-asked-questions/can-you-date-both-megaera-and-thanatos
- https://saschb2b.github.io/game-mechanics/games/hades/death-as-narrative
- https://videlais.com/tag/hades/
- https://monsterprom.wiki.gg/wiki/CHARM
- https://intothespine.com/2018/07/10/into-the-spine-of-monster-prom/
- https://www.gamerguides.com/dragon-age-origins/guide/introduction/character-basics/approval
- https://thelearnedfangirl.com/?p=8236
- https://new.bg3.wiki/wiki/Camp_Events
- https://bg3.wiki/wiki/Tiefling_Refugee_Celebration
- https://www.rpgsite.net/review/5830-dream-daddy-a-dad-dating-simulator-review
- https://twinfinite.net/pc/hatoful-boyfriend-review/
- https://guidestrats.com/rf4-confession-guide/
- https://www.taptap.cn/moment/15229002469870589
- https://wap.gamersky.com/news/Content-1325540.html
- https://forums.fuwanovel.moe/topic/3552-locked-routes
- https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/
- https://emshort.blog/2019/11/29/storylets-you-want-them/
- https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf
- https://www.failbettergames.com/echo-bazaar-narrative-structures-part-two
- https://www.failbettergames.com/dont-poke-that-narrative-engineering-principles-part-1
- https://docs.yarnspinner.dev/write-yarn-scripts/advanced-scripting/storylets-and-saliency-a-primer
- https://idrellegames.tumblr.com/post/665504812779159552/creating-relationship-approval-systems
- https://digitalcommons.lindenwood.edu/theses/1804/
- https://www.gamedeveloper.com/design/love-and-romance-in-heaven-s-vault
- https://gamedeveloper.com/design/video-improving-romance-in-games-with-rivalry-and-respect
- https://gdcvault.com/play/1035527/Designing-Relationships-How-to-Make
- https://github.com/topics/dating-sim
- https://itch.io/tools/code-mit/tag-dating-sim
- Repos (cloned to `/home/claude/gi/`, read only): `renpy/dse`, `YarnSpinnerTool/YarnSpinner`, `inkle/ink`, `DRincs-Productions/DS-toolkit`
