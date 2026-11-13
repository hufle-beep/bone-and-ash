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
- **His people:** a living-tech civilization. Everything is grown from Qi-attuned wood: Hearth Trees, ship seeds, tools. They do Universal service and live 800–900 years. At 40, James has not served yet.
- **The omnitool:** organic, under the skin of his forearm. Its **hammerspace** is "the pocket of folded space your people grow into every citizen at birth". He arrives with it empty: "the most expensive empty closet in two universes".
- **The pillars:** the **Ouroboros Axiom** ("the pillar every one of your people carries, the loop that runs the body like a closed garden"; it composts this world's poisoned Qi, so he needs no herbs and gets no tribulations) and **Parallel Cognition** (9 threads; the lore: this world dulled them, "a thread holds only what your hands already know", "each bite of the tail wakes another"; the threads are instincts, never a voice).
- **Bonesinger:** a rare gift, braided into his cultivation so tightly that the two became one **Convergence** (Qi + Bonesinger). "Your people would call it *the white song*." It is "the only reason you survived your teenage years". The bone comes "from nowhere, from the folded place where Bonesinger and Qi meet", instantly (`prologue.js` 170, 181). He uses it at range (darts, needles) and as a wraithbone blade.
- **Body:** at the start the crossing has ashed his channels shut (task mode, v0.9.6). He opens the 12 primaries and 66 collaterals in play. Every skill starts at T1 L1.
- **His look in the pictures:** the casts `james` and `james_shaggy` in `tools/art/recipes.json`, from the owner's photos (02:16): early forties, glasses. **The texts call him tall** (Ya: "You're tall"; "a tall soft scholar"; "a tall empty jar in a ridiculous white coat").
- **Why locals misread him:** they can't feel his cultivation at all. To them he looks mortal (`longforest.js` 147, 291).
- **Flight (owner 2026-11-08 20:33 and 20:39, pick F1; in the game since v0.11.109 (walks and crossings) and v0.11.112 (fights, in Act 1 only (v0.11.112, AG1): darts and the Qi blast from the air, foes that don't fly can't reach him that round; never in the prologue); the story lines in roadmap group e):** James's people gain flight with their first breakthrough, so they fly from **Foundation**. James is a natural. They ride the local Qi flows the way a swimmer rides river or ocean currents: as natural as walking. **No limit except realm and GU:** his speed rises as he climbs the realms; his manoeuvrability rises with GU. As with everything else, he is completely unbothered by others' bafflement at his using it like second nature. Since the realm resets each Coil, flight comes back with each Coil's first breakthrough.

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

- **The poison:** the world's Qi is poisoned. "Something died here, long before us — a lot of somethings" (Wren Aldous, `act1_heart.js` `ship_log`). It makes the locals "hard, and short-lived, and hungry". Sects climb on herbs, pills, beast cores and each other, and Heaven sends tribulation lightning at each breakthrough.
- **The Old Tree:** a Hearth Tree grown around the crashed seed-ship **Patient Root**, out of the **Ninth Grove**, about a thousand years ago. Head Gardener **Wren Aldous** led forty souls, all gardeners; nobody aboard had ever held a weapon. While the Tree lived it sang and filtered the world's Qi. Its roots reached under the forest and the mountains, and the Blackroot wasn't black. The locals called it the Old Tree and sang to it.
- **Its murder:** about four hundred years ago, a calm man in red sat under the Tree for a season and learnt its song. He came back with three hundred disciples. The Tree screamed for nine days, and the last gardeners died in front of it. He took its heart with his own hands and founded the **Crimson Lotus Sect**. The poison came back up. The locals were told the Old Tree died of age. The founder's seal is on the tribute post, "on everything" (`ship_log3`, `act1_heart.js` 84).
- **The seed-sliver:** the ship still holds a living one. It can grow again (the grove, Act 1).
- **James's place in it:** "You're not the outlier … The world is the outlier."
- **Flight on this world (owner 20:33, 20:39):** this world's people can fly too, the same way (riding the Qi flows), but only from **Golden Core**, and slower and clumsier. So no one James meets in the prologue or Act 1 flies: the highest of them, Shen Qiu, is Core Formation (`ENEMY_REALM`, `power.js`).
- **The Coil:** each act loops to a deadline: the prologue to the tribute on Day 7, Act 1 to Shen Qiu on Day 21. James never dies. The Ouroboros Axiom is universal among his people, but on this world the poisoned Qi turns it into a loop.

## The realms (the realm sheet)

*New in v0.11.164 (owner pick N1, 2026-11-13 14:01; roadmap group e, RS, `research.md` #123). How this world sees each realm, for Fable's texts. The owner's bands (2026-11-08 01:15): Mortal Vessel normal, Foundation relatively common, Golden Core rare, Nascent Soul almost unprecedented, the Immortal realms with no documented person. N1 placed the four between them: Core Formation and True Core uncommon, Origin Core and Soul Embryo very rare. Realms 8–10 sit above Nascent Soul, so they follow its band: none documented. The names are the game's (`formulas.js` `REALM_STEP_NAMES`). The owner can change any line.*

**What the sheet is about:** the locals and their own climb. James and Yuki climb on their own rules: no tribulation, and the sky's visits to them are their own (one text per realm, `prologue.js` `BT_REALMS`, realms 3–14; no sky at 10 and 11). Locals can't sense either of them, so they place James by what they see, never by a realm they feel (realm flavour by evidence, #122). Flight is the strongest evidence: locals fly only from Golden Core.

| # | Realm | Who holds it here | How many | The lifespan locals believe | How such a person is addressed | What locals assume they can do | The sky at that breakthrough (locals) |
|---|---|---|---|---|---|---|---|
| 0 | Mortal Vessel | everyone: Ashfall, the hunters, Mei Lin, her mother, Old Wen | nearly all | sixty if Heaven is kind; Old Wen at 90 is a wonder | by name, family name or trade | work, hunt, pay the tribute, die of a fever | none |
| 1 | Foundation | sect disciples: Gao Feng, Lu Han, Fang Wei, the sect's watchers | hundreds in a sect like the Crimson Lotus | about a hundred and twenty | "Disciple", "young master" | outrun a horse, break a hunter with one hand, feel the Qi in anyone below them | a dark cloud over one roof and a few strokes of lightning; the household and the neighbours see it |
| 2 | Core Formation | outer elders: Shen Qiu, the highest of anyone in the prologue and Act 1 | uncommon: a few dozen in a great sect, a few in a region | about two hundred | "Elder", "Senior" | hold a village's fate in one hand; no number of disciples can stand against one | a storm over the valley, seen from the next village |
| 3 | True Core | inner elders | uncommon: perhaps a dozen in a great sect | about two hundred and fifty | "Elder", "Senior" | the same, surer: hold a valley | the same storm, longer and lower |
| 4 | Golden Core | sect masters; the first rung that flies, slowly and with ceremony | rare: a handful in a region | about four hundred | "Senior", "Esteemed Senior", with a bow to the ground | fly, go a season without food, level a village | the storm Heaven keeps for people who matter, seen a day's walk away; sects send someone to watch |
| 5 | Origin Core | the patriarchs of the great sects, behind closed doors | very rare: a handful on the world, known by name and seldom by sight | about five hundred | "Patriarch" | end a small sect | a storm seen across a province; sects date things by it |
| 6 | Soul Embryo | the same few, after centuries in seclusion | very rare: fewer than the fingers on one hand | about seven hundred, say the scrolls | "Patriarch", "Ancestor" | the same, and see a province from a mountain | the same, and longer; told for a generation |
| 7 | Nascent Soul | almost unprecedented: one or two names in all the records, half of them disputed | almost none | a thousand years, in the stories | "Venerable Ancestor", in the stories | whatever the story needs | the whole sky, in the stories ("the year the sky burned") |
| 8 | Spirit Transformation | nobody documented | none | the stories don't say | the stories don't say | the stories don't say | none seen |
| 9 | Immortal Ascension | nobody documented; the name promises leaving the world | none | forever, they say | "Immortal", in prayers only | leave the world | none seen |
| 10 | Mahayana | nobody documented | none | forever, they say | "Immortal", in prayers only | the stories don't say | none seen |
| 11–14 | Earth, True, Golden, Heavenly Immortal | nobody documented: the Immortal realms | none | forever, they say | "Immortal", in prayers only | anything | none seen |

**Notes for the texts:**
- **The lifespans are short for the realm:** the poisoned Qi takes its share from everyone who cultivates in it, which is why the locals are "hard, and short-lived, and hungry" (the Old Tree, above). James's people live 800–900 years with no realm talk at all.
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
