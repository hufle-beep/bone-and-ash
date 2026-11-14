# Bone and Ash — lore (one source for story texts)

*New in v0.11.73 (group h, owner picks H1 + K1, 2026-11-08 17:54). Rule 10: Fable drafts story texts from the scenes, the tone rules **and this file**. K1: Bone and Ash's own canon, as the game and the owner's spec have it, wins. The SillyTavern canon that differs is listed at the end as **not adopted**; nothing from there goes into a text without the owner's pick. When a text and this file disagree, the game's text is checked first; then this file is fixed in the same push.*

**Where it comes from:** the owner's spec (`project/handover.md`, "Gábor's spec" and "Decided in chat (2026-11-05)"), the Act 1 bible at the top of `js/story/act1_common.js`, `project/design.md` ("Lore"), `project/reference.md` (characters, cast), and the scenes named below.

## Tone and limits (hard rule 7)

- **James and Yuki:** deadpan and sarcastic; serious when it matters. The humour comes from James reacting to grave people.
- **The locals:** overly serious, most of them: formal, grave about honour, face, hierarchy, Heaven and the Sect. They don't joke.
- **Mei Lin** is looser than the norm (teases, laughs), and it gets her in trouble. **Ya** is the other exception (below).
- Dark xianxia, tongue in cheek.
- **Claude's own limits (not the owner's):** romance is frank and sensual up to the door, then fades to black. No explicit sex. No nude images. Adults only. No song lyrics quoted from real songs (the cooking and music notes, group e).

## James Green

- **Age and life:** 40. A fresh doctorate, three days old, in mycology and computational biology. Single. *(This is the owner's spec, and it differs from the SillyTavern canon on purpose.)*
- **How he arrived:** a lab accident. He went into the resonance lab to "just check one reading", with Yuki asleep in the hood of his lab coat, and the spatial seed chamber "decided to have opinions" (`prologue.js` `arrival`). He wears a white lab coat.
- **His people:** a living-tech civilization. Everything is grown from Qi-attuned wood: Hearth Trees, ship seeds, tools. They do Universal service and live 800–900 years (at Mortal Vessel; longer with each realm, by the same multiples as this world's people: the realm sheet). **Why so long (owner 2026-11-13 14:17):** their homeworld's Qi is pure, and that pure Qi was part of their evolution. At 40, James has not served yet.
- **The omnitool:** organic, under the skin of his forearm. Its **hammerspace** is "the pocket of folded space your people grow into every citizen at birth". He arrives with it empty: "the most expensive empty closet in two universes".
- **The pillars:** the **Ouroboros Axiom** ("the pillar every one of your people carries, the loop that runs the body like a closed garden"; it composts this world's poisoned Qi, so he needs no herbs and gets no tribulations) and **Parallel Cognition** (9 threads; the lore: this world dulled them, "a thread holds only what your hands already know", "each bite of the tail wakes another"; the threads are instincts, never a voice).
- **Bonesinger:** a rare gift, braided into his cultivation so tightly that the two became one **Convergence** (Qi + Bonesinger). "Your people would call it *the white song*." It is "the only reason you survived your teenage years". The bone comes "from nowhere, from the folded place where Bonesinger and Qi meet", instantly (`prologue.js` 170, 181). He uses it at range (darts, needles) and as a wraithbone blade.
- **Body:** at the start the crossing has ashed his channels shut (task mode, v0.9.6). He opens the 12 primaries and 66 collaterals in play. Every skill starts at T1 L1.
- **His look in the pictures:** the casts `james` and `james_shaggy` in `tools/art/recipes.json`, from the owner's photos (02:16): early forties, glasses. **The texts call him tall** (Ya: "You're tall"; "a tall soft scholar"; "a tall empty jar in a ridiculous white coat").
- **Why locals misread him:** they can't feel his cultivation at all. To them he looks mortal (`longforest.js` 147, 291).
- **Flight (owner 2026-11-08 20:33 and 20:39, pick F1; in the game since v0.11.109 (walks and crossings) and v0.11.112 (fights, in Act 1 only (v0.11.112, AG1): darts and the Qi blast from the air, foes that don't fly can't reach him that round; never in the prologue); the story lines in roadmap group e):** James's people gain flight with their first breakthrough, so they fly from **Foundation**. James is a natural. They ride the local Qi flows the way a swimmer rides river or ocean currents: as natural as walking. **No limit except realm and GU:** his speed rises as he climbs the realms; his manoeuvrability rises with GU. As with everything else, he is completely unbothered by others' bafflement at his using it like second nature. Since the realm resets each Coil, flight comes back with each Coil's first breakthrough.

## James: cooking, music and his archive (the owner, 2026-11-13; group e's CM)

*New in v0.11.169 (owner picks RV1 and RC). The owner's words below are word for word; the short list after them is for Fable to scan. The first note (2026-11-08 13:17) is in `roadmap.md`, group e ("Story beats, James's cooking and his music"). Claude's limits: no song lyrics quoted (titles, artists and how the music sounds and lands only, the Tolkien verses behind "The Song of Dúrin" included); real people (bands, VTubers) are references James plays, never characters in the scenes. How it is built (the kitchen and the communal pot by trust, the music lines and reactions, the fork below) is CM: open, options later.*

**The owner, 22:17:** "Some things that might have been lost from my requests and suggestions. The fact that James loves to cook and is a very good one, he loves feeding people. So as the affection rises, he should start taking over Mei Ling's mother's kitchen. or at least share it. also as the affection rises with the village, he should start participating in the preparation of the communal meals, leading to him being accepted more and more. I remember mentioning this once, but it seems to have been dropped. He is of mixed descent, Hungarian, British, German and Serbian, his Earth doesn't have nation states anymore, but the cultures did persist. His specialties are Central and eastern European foods, Italian, and Japanese, Chinese and Korean foods due to him being a weeb. (not that much of this would be understood or have a frame of reference in this world, but it adds to his character) His favourites to cook and eat are Pasta with green pesto sauce (he makes the noodles himself if he can) Shakshuka, Dödölle with sour cream and a bit of diced and fried bacon (pork belly) on top, Spenótfőzelék with eggs sunny side up and bare french toast with only the eggs, salt and pepper. Spaghetti Bolognese. Another suggestion I had is that he listens to music on his onmitool constantly, not loud, but uncaring if it bothers the villagers. he doesn't always have earphones in so the others can hear it too. He is a fan of a variety of music and tends to choose situationally. He listens mostly to synthwave, darkwave, post-punk, futurepop and synthpop. Along with Classic rock, classic metal, heavy metal, black metal and death metal. Also some kpop and Jpop, plus music derived from the Vtuber culture. His onmitool has extensive archives of both music, clips and streams."

**The owner, 22:41:** "examples of music he listens to: Black Sabbath - Iron Man and Paranoid, Iron Maiden - Run to the Hills, The Number of the Beast, Deep Purple - Black Night, Child in Time, Perfect Strangers. Gojira's Discography up to and including the L'Enfant Sauvage album. Disturbed's discography up to and Including Ten Thousand Fists. The whole discographies of Lacuna Coil andThe Birthday Massacre. The whole discography of Ashbury Heights, The Cure, Nitzer Ebb, VNV Nation, Depeche Mode. From Black Metal he listens most to Saor, Passage D'Hiver, Alcest and Wolves in the Throne Room (he prefers the atmospheric variety). From Vtuber Music the whole discography of Hololive, with a focus on Hololive EN, his oshis are Gura, Mumei, Mori Calliope and Nerissa Ravencroft. His favourites from Hololive are Odyssey, Genesis, Mumei by Nanashi Mumei and pretty much anything by Nerissa Ravencroft. His non-Hololive favourites and Ironmouse, Nyanners, Bao the Whale, Amalee, Obkatiekat and Neuro-Sama/Evil Neuro. He is also a fan of the vocaloid covers of Rachie, in particular Circles. He also loves folk derived and Nerdcore music. His favourite Nerdcore artist is Miracle of Sound. From folk derived and fantasy music, he should play Trøllabundin by Eivør and The Song of Dúrin, The song of Hammerdeep and Dwarven Forge by Clamavi de Profundis at least once, preferably with the most impact. He is a massive fan of Star Trek, Star Wars, The Expanse, The Remembrance of Earth's past, Babylon 5 and pretty much all classic scifi, particularly Dune, The Foundation and the works of Phillip K. Dick and William Gibson. He is also a gamer and fan of Warhammer 40k, Mass Effect, Dragon Age, Balder's Gate and pretty much all of Bioware's and their predecessor and descendant studio's games. From Fantasy/Urban Fantasy: And The Lord of The Rings, having read all of the books along with the Hobbit and the Silmarillion. He also likes the Witcher, The Wheel of Time, Harry Potter, Worm/Parahumans, RWBY, The SCP Foundation and the works of H.P. Lovecraft. He has all of these books, games movies and TV series on his onmitool."

**The owner, 22:47 (with the pick RV1):** "To the music with the most impact "Music Box of Fate and Breathe by Ironmouse, The Eater's call by Nyanners and Lord Athelstan, Boof Pack by Lord Athelstan (much to the delight of Ya and the horror of Mei Lin and amusement of Yuki) Mumei by Nanashi  Mumei, Genesis by Holoadvent, Non-Fiction by Holomyth and Reflect by Gawr Gura should also be included."

**The owner, 22:51:** "you can pace the cultural references along the Prologue and act 1, no need to cram everything in all at once. When Act 2 is done, you can stretch them out even further."

**The owner, 22:58:** "Consider making a fork of the game, one for me, a personalized one with all the music references, and a sanitized one with only general references. The only difference should be the texts and references, the framework should stay the same." *(Open, options later, with CM: the texts by edition, one framework.)*

**The owner, 23:15 (with the pick NX2, v0.11.170):** "for the act 1 journey, his cooking should also be very appreciated by the party, when we get there in the rewrite, mention it. Also make some throwaway mentions by other characters over all of the game as more of his character is revealed that how despite his nonchalance and seming deadpan his love of cooking and feeding people and his tastes in music and culture reveal him to be a deeply caring and warm person." *(In the rewrite from part 4 on, each part's brief: CW; parts 1–3 have none yet: open, options later.)*

**For Fable (a scan list; the owner's words above win):**
- **Cooking:** a very good cook who loves feeding people; Central and Eastern European, Italian, Japanese, Chinese, Korean. Favourites: green pesto pasta (his own noodles when he can), shakshuka, dödölle with sour cream and fried diced pork belly, spenótfőzelék with sunny-side-up eggs, plain French toast (eggs, salt, pepper), spaghetti bolognese. With trust he shares, then takes over, Mei Lin's mother's kitchen; with the village's, he joins the communal meals and is accepted more and more. Most of it has no frame of reference in this world.
- **Descent:** Hungarian, British, German and Serbian; his Earth has no nation states, the cultures persist.
- **Music:** on the omnitool, constant, not loud, often without earphones, chosen by situation; he doesn't care if it bothers the villagers (and never while hunting, 2026-11-08). Synthwave, darkwave, post-punk, futurepop, synthpop; classic rock and metal, heavy, black (atmospheric: Saor, Passage D'Hiver, Alcest, Wolves in the Throne Room) and death metal; K-pop, J-pop, VTuber music (Hololive, Hololive EN most: Gura, Mumei, Mori Calliope, Nerissa Ravencroft; Ironmouse, Nyanners, Bao the Whale, Amalee, Obkatiekat, Neuro-sama / Evil Neuro); Rachie's vocaloid covers ("Circles"); folk and fantasy; nerdcore (Miracle of Sound).
- **At least once, with the most impact:** "Trøllabundin" (Eivør); "The Song of Dúrin", "The Song of Hammerdeep", "Dwarven Forge" (Clamavi de Profundis); "Music Box of Fate" and "Breathe" (Ironmouse); "The Eater's Call" (Nyanners and Lord Athelstan); "Boof Pack" (Lord Athelstan: Ya delighted, Mei Lin horrified, Yuki amused); "Mumei" (Nanashi Mumei); "Genesis" (Holoadvent); "Non-Fiction" (Holomyth); "Reflect" (Gawr Gura).
- **His archive:** music, clips and streams; and the books, games, films and series above (science fiction, games, fantasy and urban fantasy).
- **Pacing:** spread across the Prologue and Act 1, not all at once; further still once Act 2 exists.
- **Under the deadpan (23:15):** the party loves his cooking on the Act 1 journey (say so when the rewrite gets there); and across the game, throwaway remarks by others (never a speech) show that his cooking, his feeding people and his music and culture make him a deeply caring, warm man, whatever his nonchalance. Music in these remarks stays generic until CM settles the songs and the editions.

## Yuki

- **Who she is:** James's **root-kin**, the bonded animal (canon meaning). A small white cat. The spec gives her yellow eyes; the pictures give her narrow gold slit eyes (a known, accepted difference).
- **Bond:** born the same day as James, in the same grove, and bonded from birth (fixed in v0.11.40). Her path stays open: familial, or something closer once she is human (engine canon: familial until her human form, then play decides).
- **Voice:** deadpan, through the bond. Same realm as James; shares XP through the bond.
- **Forms in the game (`js/core/game.js` `YUKI_FORMS`):**
  - the cat, always;
  - the **great root-kin**, the size of a Bengal tiger, from Core Formation (realm 2);
  - **human**, from Nascent Soul (realm 7).

  *`design.md` J still lists the engine's eight-step ladder (lynx, panther, tiger, dire, spirit, apex); the game has these three. Noted for the forks register (roadmap, group h's findings).*
- **Her human look (cast `yuki_human`):** very long straight white hair, bangs between the eyes, long side locks, pointed white cat ears and a long white tail. Narrow gold slit eyes and a dry look. A long black high-collared qipao with red piping and red knot buttons. No choker. The black dress is an outfit. She is a head shorter than James where she stands beside him.
- **Memory:** she and James remember every Coil through the bond. No one else does.
- **Flight:** Yuki flies too, since her cultivation is the same as James's (from Foundation, the same rules: speed by realm; owner 20:33).

## The world

- **The poison:** the world's Qi is poisoned. "Something died here, long before us — a lot of somethings" (Wren Aldous, `act1_heart.js` `ship_log`). It makes the locals "hard, and short-lived, and hungry". Sects climb on herbs, pills, beast cores and each other, and Heaven sends tribulation lightning at each breakthrough. **What this means (owner 2026-11-13 14:17, pick LO1):** Qi is impure on every world; that is normal. The deaths here made it worse. While the Old Tree lived things got better, and today's state is close to the normal one, so **this world's lifespans are normal**. Wren's "short-lived" is a gardener measuring against home.
- **The Old Tree:** a Hearth Tree grown around the crashed seed-ship **Patient Root**, out of the **Ninth Grove**, about a thousand years ago. Head Gardener **Wren Aldous** led forty souls, all gardeners; nobody aboard had ever held a weapon. While the Tree lived it sang and filtered the world's Qi. Its roots reached under the forest and the mountains, and the Blackroot wasn't black. The locals called it the Old Tree and sang to it.
- **Its murder:** about four hundred years ago, a calm man in red sat under the Tree for a season and learnt its song. He came back with three hundred disciples. The Tree screamed for nine days, and the last gardeners died in front of it. He took its heart with his own hands and founded the **Crimson Lotus Sect**. The poison came back up. The locals were told the Old Tree died of age. The founder's seal is on the tribute post, "on everything" (`ship_log3`, `act1_heart.js` 84).
- **The seed-sliver:** the ship still holds a living one. It can grow again (the grove, Act 1).
- **James's place in it (owner 2026-11-13 14:17, pick LO1):** **James's world is the outlier**, not this one: its pure Qi and its people's long lives are the exception among worlds. *The game still says the opposite in `ship_log3` (`act1_heart.js`: "You're not the outlier. You never were. … The world is the outlier."), to be rewritten in Fable's rewrite (the Heart part). James discovering and confirming it is a plot point for Act 2 (`roadmap-act2.md` since v0.11.171; it was in `roadmap-2.md` section 5): the ship's sensor data, on the trip back to the Hearth Tree (below, "Act 2").*
- **Flight on this world (owner 20:33, 20:39):** this world's people can fly too, the same way (riding the Qi flows), but only from **Golden Core**, and slower and clumsier. So no one James meets in the prologue or Act 1 flies: the highest of them, Shen Qiu, is Core Formation (`ENEMY_REALM`, `power.js`).
- **The Coil:** each act loops to a deadline: the prologue to the tribute on Day 7, Act 1 to Shen Qiu on Day 21. James never dies. The Ouroboros Axiom is universal among his people, but on this world the poisoned Qi turns it into a loop.

## Act 2 (the owner, 2026-11-14 01:02; the plan in `roadmap-act2.md`)

*New in v0.11.171 (owner pick RA1). The owner's words are word for word in `roadmap-act2.md`; the facts for Fable to write from:*

- **When:** about three weeks after Act 1 (Days 22 to about 42), after Act 1 is won (revelation, accord or victory; "taken" is a lost Act 1).
- **The Hearth Tree regenerates, a little:** James's presence there caused a slight regeneration. Its central databank is reachable again and reached out to his omnitool. **The ship will never be truly alive again, nor regenerate enough to fly.**
- **The trip:** James and Yuki fly back to the Hearth Tree, 1–2 days at a high enough realm. There he gets the ship's sensor data and **realises his world is the outlier, and this world and the others the norm** ("James's place in it", above).
- **The garden:** around the growing Hearth Tree seedling (the seed-sliver he planted at Ashfall at the end of Act 1, `rt_plant`), which he cares for as well: mostly food plants and medicinal herbs. He teaches the locals agriculture. **In his culture biology, engineering, agriculture, horticulture and gardening are mostly the same thing**, because of the nature of their technology (grown, living tech); and he has a doctorate in biology (mycology and computational biology).
- **The Sect's answer, at the end of the three weeks:** people sent to negotiate with James and Yuki or to capture them again, by how Act 1 was won: **if James showed Shen Qiu the truth** (the revelation), the Sect is rattled and more receptive to cooperation; **if he beat him** (the duel), it behaves more aggressively. After the accord: not settled yet.

## The realms (the realm sheet)

*New in v0.11.164 (owner pick N1, 2026-11-13 14:01; roadmap group e, RS, `research.md` #123). How this world sees each realm, for Fable's texts. The owner's bands (2026-11-08 01:15): Mortal Vessel normal, Foundation relatively common, Golden Core rare, Nascent Soul almost unprecedented, the Immortal realms with no documented person. N1 placed the four between them: Core Formation and True Core uncommon, Origin Core and Soul Embryo very rare. Realms 8–10 sit above Nascent Soul, so they follow its band: none documented. The names are the game's (`formulas.js` `REALM_STEP_NAMES`). The owner can change any line.*

**What the sheet is about:** the locals and their own climb. James and Yuki climb on their own rules: no tribulation, and the sky's visits to them are their own (one text per realm, `prologue.js` `BT_REALMS`, realms 3–14; no sky at 10 and 11). Locals can't sense either of them, so they place James by what they see, never by a realm they feel (realm flavour by evidence, #122). Flight is the strongest evidence: locals fly only from Golden Core.

| # | Realm | Who holds it here | How many | The lifespan locals believe | How such a person is addressed | What locals assume they can do | The sky at that breakthrough (locals) |
|---|---|---|---|---|---|---|---|
| 0 | Mortal Vessel | everyone: Ashfall, the hunters, Mei Lin, her mother, Old Wen | nearly all | sixty if Heaven is kind; Old Wen at 90 is a wonder | by name, family name or trade | work, hunt, pay the tribute, die of a fever | none |
| 1 | Foundation | sect disciples: Gao Feng, Lu Han, Fang Wei, the sect's watchers | hundreds in a sect like the Crimson Lotus | about a hundred and twenty | "Disciple", "young master" | outrun a horse, break a hunter with one hand, feel the Qi in anyone below them | a dark cloud over one roof and a few strokes of lightning; the household and the neighbours see it |
| 2 | Core Formation | outer elders: Shen Qiu, the highest of anyone in the prologue and Act 1 | uncommon: a few dozen in a great sect, a few in a region | about four hundred (Shen Qiu has lived three hundred) | "Elder", "Senior" | hold a village's fate in one hand; no number of disciples can stand against one | a storm over the valley, seen from the next village |
| 3 | True Core | inner elders | uncommon: perhaps a dozen in a great sect | about five hundred | "Elder", "Senior" | the same, surer: hold a valley | the same storm, longer and lower |
| 4 | Golden Core | sect masters; the first rung that flies, slowly and with ceremony | rare: a handful in a region | about six hundred | "Senior", "Esteemed Senior", with a bow to the ground | fly, go a season without food, level a village | the storm Heaven keeps for people who matter, seen a day's walk away; sects send someone to watch |
| 5 | Origin Core | the patriarchs of the great sects, behind closed doors | very rare: a handful on the world, known by name and seldom by sight | about seven hundred | "Patriarch" | end a small sect | a storm seen across a province; sects date things by it |
| 6 | Soul Embryo | the same few, after centuries in seclusion | very rare: fewer than the fingers on one hand | about nine hundred, say the scrolls | "Patriarch", "Ancestor" | the same, and see a province from a mountain | the same, and longer; told for a generation |
| 7 | Nascent Soul | almost unprecedented: one or two names in all the records, half of them disputed | almost none | a thousand years and more, in the stories | "Venerable Ancestor", in the stories | whatever the story needs | the whole sky, in the stories ("the year the sky burned") |
| 8 | Spirit Transformation | nobody documented | none | the stories don't say | the stories don't say | the stories don't say | none seen |
| 9 | Immortal Ascension | nobody documented; the name promises leaving the world | none | forever, they say | "Immortal", in prayers only | leave the world | none seen |
| 10 | Mahayana | nobody documented | none | forever, they say | "Immortal", in prayers only | the stories don't say | none seen |
| 11–14 | Earth, True, Golden, Heavenly Immortal | nobody documented: the Immortal realms | none | forever, they say | "Immortal", in prayers only | anything | none seen |

**Notes for the texts:**
- **The lifespans are normal** (owner 2026-11-13 14:17, pick LO1): impure Qi is the normal state of worlds, so these are ordinary lifespans for cultivators anywhere. They only look short next to James's people.
- **James's people climb by the same multiples** (owner 2026-11-13 14:21): each rung multiplies a life as it does here, from their own base of 800–900 years at Mortal Vessel. The multiples, read off the column above (the rung's span ÷ a mortal's sixty): Foundation ×2 (1,600–1,800 years for James's people), Core Formation about ×6⅔ (about 5,300–6,000), True Core about ×8⅓ (about 6,700–7,500), Golden Core ×10 (8,000–9,000), Origin Core about ×11⅔ (about 9,300–10,500), Soul Embryo ×15 (12,000–13,500), Nascent Soul about ×16⅔ and more (about 13,300–15,000 and more); above it nobody here knows.
- **A realm gap is absolute among the locals:** no one beats a higher realm, whatever the numbers; the Sect's order rests on it. James and Yuki are the only exceptions, and nobody here knows the rule has any.
- **The tribulation:** Heaven's lightning at each breakthrough is real for the locals, and it kills some of them. The Sect calls a death in it Heaven's verdict, and a survivor's rise Heaven's approval.
- **The ladder is paid for:** Old Wen's lesson (`ashfall.js` `wen_lesson`): every rung costs more, and the Sect buys rungs with villages like Ashfall (grass, grain, children).
- **A local's guess at James:** he looks mortal, so he is addressed as a mortal until he does something that only a high realm explains. Seeing him fly makes him at least Golden Core to them, though they still can't feel it.

## Places and people

- **The wilds** (prologue Days 1–3): a forest of black bark and grey moss under a bruise-coloured sky. The bone field, the mire, the hollow.
- **Ashfall:** the village.
  - Old Wen: the elder, 90, one blind milky eye.
  - Mei Lin: 26, a herb-gatherer with a sharp tongue, looser than the norm. Her hairpin is ivory, with a red tassel.
  - Her mother: 60, stern.
  - The hunters, and Pock-Face.
- **The Crimson Lotus Sect:**
  - Gao Feng: an outer disciple, about twenty, haughty. He can be killed or spared.
  - Lu Han: an inner disciple, about thirty, with a still face and a long sword.
  - Outer Elder Shen Qiu: Act 1's climax, at Ashfall on Day 21.
  - The tribute.
- **The Blackroot** (Act 1): the root road, the drowned wood, the ashen hills, the Heart.
  - **Ya:** 27, a feral huntress raised wild, more unfit for civilised society than James. Tall and rangy, barefoot, a necklace of teeth, a bone-tipped spear, a red scar under one eye. She jokes and flirts aggressively, is easily offended, picks fights, and is open to sharing. She is the second romance option; a throuple can form over the act.
- **The Long Forest** (from Coil 2): Fang Wei, an outer disciple of the Crimson Lotus, "lapsed", and the Tan brothers.
- **Relationships across Coils:** everyone but Yuki forgets. They start the next Coil with a 25% head start from the last Coil's peak. After the second Coil, James can choose to tell Mei Lin.

## Not adopted (SillyTavern canon that differs; the owner's pick before any use)

From `hufle-beep/Shared-ST` (`st/rules-engine-c/lib/presets.js`, `qiBeast.js`, the lorebooks and chats in `st/`), read in group h (2026-11-08):

- **James's height and look:** the presets give him 168 cm, "relatively short", blue eyes, looking about 32–35, no glasses. The game has him tall in the texts, with the owner's own cast in the pictures. *(K1: the game's version stands.)*
- **James's age:** the presets have him at 250 or 500 years, a professor, after Universal service, travelling out of boredom (with Lyra in james4). The game's spec is 40, single, and arrived by accident.
- **Yuki's mind:** james3b has her "still basically a cat" at Mortal Vessel, with an intelligence near a 10-year-old's. The game gives her an adult, deadpan voice.
- **Yuki's ladder:** in `qiBeast.js` the tiger-scale form comes at True Core (realm 3). The game gives her the great form from Core Formation (realm 2).
- **The vessels:** the engine opens the Extraordinary vessels from Foundation. The game opens them from Golden Core, and the lore says so (`meridians.js` 206).
- **The chats disagree with each other** (pick one before any use): the civilization's age ("14k years of recorded history" or "about a thousand years ahead"); its government ("no nation states" or "one world government"); James's ancestry (Hungarian / British / German, or with Serbian too).

**Available if the owner picks it** (from the same sources; nothing here is in the game yet):
- **Bone-singing:** its formal name is "osteomorphic lattice projection", and about one in ten million of his people have it. The material is part bone, part crystal. James took the name "Bonesinger" himself as an edgy teenager.
- **Root-kin:**
  - They are born or hatched with their human ("hatched in my crib") and bonded at once. Most are like siblings; marrying one is uncommon but carries no stigma.
  - Humans interbred with root-kin long ago: James carries diluted feline and serpentine blood but cannot shift.
  - Wild, never-bonded root-kin exist.
- **Hearth Trees:** they carry mycelia and soil bacteria, take trace minerals from the air and give back what they don't use. There are 12 World Trees; the oldest is 120 m. A ship seed and a Hearth seed are the same seed with two uses.
- **Food** (for group e's cooking note): snakes kept instead of chickens, for meat and eggs ("cobra eggs for their sharper taste"); roasted silkworms; snake jerky; a sourdough starter; his own Carolina Reaper; Hungarian dishes; wild garlic. His people's cultivation began in their China on a parallel Earth, so the culture has a Chinese undercurrent, with English as the common language.
- **Pilgrimages:** expected among ascended cultivators; they almost always go to other dimensions (a possible hook for the later acts).
