/**
 * ACT 1, Part 4 — Return (Days 19–21). The road home from the dead Hearth Tree, the seed-sliver planted at Ashfall,
 * the night the romance resolves (a throuple, one lover, or none), and Outer Elder Shen Qiu at the gate on Day 21.
 * Entry 'rt_start' (Day 19 ~06:00). Ends at 'a1_end'.
 */
import { addItem, hasItem, eat, condense, advance, clockParts, jamesQiMax, dayHour, yukiForm } from '../core/game.js';
import { condensationSatGain } from '../core/formulas.js';
import { coilMult, sitGain } from '../core/game.js';
import { set, daily, markDaily, eatBest, byForm } from './common.js';
import { loveLine } from './yuki_path.js';
import { encounter, rel, likesMei, likesYa, trio, trioStep, bumpRel, sleepUntil, hour, KISS_YA, KISS_MEI } from './act1_common.js';

const P = 'Ashfall Hamlet';
const BR = 'Blackroot Wilds';
const seeded = (g) => !!g.flags.seed || hasItem(g, 'seed_sliver');
const both = (g) => likesMei(g) && likesYa(g);
const trioReady = (g) => both(g) && trio(g) >= 3;
const luHanHere = (g) => g.flags.ending !== 'fought';
// v0.11.37: after midnight (24+) the hour has passed. v0.11.47 (N1, the Fable review of v0.11.46): an evening hour is not jumped to
// before 06:00 (04:00–05:59, or a night pushed through: it is still the night; it used to skip 14–18 h); the mornings (6, 8) as before
const toHour = (g, h) => { const p = clockParts(g.minutes); const dh = dayHour(g); if (dh < h && (h < 12 || dh >= 6)) g.minutes = (p.day - 1) * 1440 + h * 60; };
/** Preparations that blunt the Elder (count). */
const preps = (g) => (g.flags.a1_palisade ? 1 : 0) + (g.flags.a1_militia ? 1 : 0) + (g.flags.grove_attuned ? 1 : 0) + (g.flags.council_unity ? 1 : 0);

/* ---------- encounters ---------- */
const roadWolves = (g) => encounter(g, {
    id: 'rt_wolves', tier: 'small',
    intro: 'Four ash-wolves come out of the birches in a line, the way water comes through a broken dam.',
    enemies: [{ name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf (grey muzzle)', hp: 8, dc: 4, atk: 5, dmg: 4 }],
    win: 'rt_wolves_won', lose: 'rt_wolves_lost', flee: 'rt_ford',
});
const fordSerpent = (g) => encounter(g, {
    id: 'rt_serpent', tier: 'small',
    intro: 'The black water folds upward into a neck as thick as a man, and the neck has a face, and the face has opinions about you.',
    enemies: [{ name: 'Mire serpent', hp: 12, dc: 4, atk: 5, dmg: 5, dr: 1 }],
    win: 'rt_serpent_won', lose: 'rt_serpent_lost', flee: 'rt_camp',
});
const brawl = (g) => encounter(g, {
    id: 'rt_brawl', tier: 'small',
    intro: 'Hunter Bao rolls his shoulders. His cousins rise from the bench behind him. Ya, delighted, cracks her knuckles one at a time.',
    enemies: [{ name: 'Hunter Bao', hp: 7, dc: 3, atk: 4, dmg: 2 }, { name: 'Bao\'s cousin', hp: 5, dc: 3, atk: 4, dmg: 2 }],
    win: 'rt_brawl_won', lose: 'rt_brawl_lost',
    // v0.11.82 (owner picks B1 + Y1; texts Fable's): unarmed, on GU; Yuki only in her human form
    style: 'unarmed',
    opening: `You leave the song where it is, lift your hands, and remind yourself that Bao is a neighbour, not a wolf.`,
    tail: yukiForm(g) === 'human' ? `Yuki leaves the bench, shakes out her sleeves, and takes the place on your left. Bao looks at her — slight, white-haired, a head shorter than you, ears flat against all that hair — and says, with enormous gravity, "The outlander's lady may stand with him. No one will strike her hard." "No," Yuki agrees. "No one will." Ya, delighted: "Three against three. Better."` : `Yuki watches from the wine-shop bench — curled on it, or lying along the length of it, depending on the day — with the air of a referee who has already decided nobody here is worth scoring. Through the bond: *they said fists. I don't have any. Carry on.*`,
});
const elderFight = (g) => {
    const enc = encounter(g, {
        id: 'elder', tier: 'climax',
        intro: 'Outer Elder Shen Qiu draws no sword. He lifts one hand, palm out, and the air between you goes red and heavy as wet silk.',
        enemies: [
            { name: 'Outer Elder Shen Qiu', hp: 28, dc: 6, atk: 7, dmg: 5, dr: 1 },
            ...(luHanHere(g) && !g.flags.a1_militia ? [{ name: 'Lu Han', hp: 10, dc: 5, atk: 6, dmg: 4, dr: 1 }] : []),
        ],
        win: 'rt_duel_won', lose: 'rt_duel_lost',
    });
    // the palisade, the drilled hunters, the grove and a village of one mind each wear him down
    const p = preps(g);
    if (p) enc.enemies[0] = { ...enc.enemies[0], hp: Math.max(10, enc.enemies[0].hp - 4 * p), atk: enc.enemies[0].atk - (g.flags.grove_attuned ? 1 : 0) };
    if (p) enc.intro += ' Behind you, Ashfall does not kneel.';
    return enc;
};

export const BREAK_HUBS = ['rt_camp', 'rt_ashfall'];

export const RETURN = {
    /* ======================================================== DAY 19 — the road home ===================================== */
    rt_start: {
        id: 'rt_start', title: 'Out of the Heart', art: 'return_road', place: `${BR} — under the dead tree`,
        enter: (g) => { toHour(g, 6); g.flags.mei_party = true; g.flags.ya_party = true; return []; },
        text: (g) => `You come out of the roots of the dead tree into grey morning light, blinking like something born.

${seeded(g) ? 'In your hammerspace, folded into nowhere, the seed-sliver hums. You can feel it the way you feel your own pulse: a small green insistence. *Plant me. Plant me somewhere I can sing.*' : 'You carry no seed out of that place, only what you saw. It sits in your chest like a swallowed stone.'}

Mei Lin is pale and quiet, which for her is a kind of shouting. Ya is already ten paces ahead, sniffing the wind like a dog, spear across her shoulders.

"Two ways home," Ya says without turning. "Long way: safe, boring, four days. My way: one day, wolves, a river with a thing in it. My way is better." She looks back at you and grins with far too many teeth. "Also I'll be bored on the long way, and when I'm bored I bite."

"She means that literally," Mei Lin says.

"I know," you say. "I've been bitten."`,
        choices: [
            { text: 'Ya\'s way. One day. Ashfall is waiting.', time: 30, to: 'rt_road' },
            { text: 'Ask Ya what exactly "a thing" in the river means.', time: 10, do: (g) => { bumpRel(g, 'Ya', 1, 0); return ['"Big. Hungry. Has a face." She shrugs. "Most things do."']; }, to: 'rt_road' },
        ],
    },
    rt_road: {
        id: 'rt_road', title: 'Ya\'s Way', art: 'return_road', place: `${BR} — the deer paths`,
        text: (g) => `Ya's way is not a path. It is a theory of a path, held together by deer, stubbornness and the fact that she has walked it since she was six. She moves through the Blackroot like it owes her money.

Behind her, Mei Lin picks her way with the grim, formal dignity of a woman who has been told her whole life that forests are for herbs, not for running through. ${rel(g, 'Ya').f >= 20 ? 'Twice Ya waits for her. Twice Mei Lin pretends not to notice. Twice Ya notices her pretending, and laughs.' : 'Ya does not wait for her. Mei Lin does not ask her to.'}

${byForm(g, 'Yuki rides on your shoulder and supervises.', 'Yuki pads at your side and supervises.', 'Yuki walks at your elbow and supervises.')}`,
        choices: [
            { text: 'Walk with Ya at the front.', show: daily('rt_ya_walk'), time: 60, do: (g) => { markDaily(g, 'rt_ya_walk'); return []; }, to: 'rt_ya_talk' },
            { text: 'Drop back and walk with Mei Lin.', show: daily('rt_mei_walk'), time: 60, do: (g) => { markDaily(g, 'rt_mei_walk'); return []; }, to: 'rt_mei_talk' },
            { text: 'Push on toward the birch ridge.', time: 120, to: 'rt_ambush' },
        ],
    },
    rt_ya_talk: {
        id: 'rt_ya_talk', title: 'Ya', art: 'ya_close', place: `${BR} — the deer paths`,
        text: (g) => `"You're thinking," Ya says. "I can hear it. Like a beetle in a box."

"I'm thinking about the ship."

"Boring. Think about me." She swings round to walk backwards in front of you, perfectly steady on roots she isn't looking at. "Your people. Made of trees. Do they all look like you? Tall, sad, mouth full of clever?"

"Not all of them. Some are short."

She laughs, a bark that sends birds up. Then, abruptly, she's in your space, close enough that you can smell smoke and pine resin on her. "When we get to your little village," she says, "the grey people will look at me like I'm dirt. ${likesYa(g) ? 'You won\'t. I like that. I like it a lot.' : 'You look at me like I\'m a puzzle. Better than dirt. Still annoying.'}"

${both(g) ? '"And *she*," Ya adds, jerking her chin back at Mei Lin, "looks at me like I\'m a fire she wants to stand next to and is too proud to. I\'m working on it."' : ''}`,
        choices: [
            { text: '"You\'re not dirt. You\'re a menace. It\'s different."', do: (g) => { bumpRel(g, 'Ya', 4, 3); return ['She shoves you, hard, which you are learning is affection.']; }, to: 'rt_road' },
            { text: 'Kiss her, there on the path, since she\'s standing right there.', show: (g) => rel(g, 'Ya').a >= KISS_YA || !!g.flags.ya_romance, do: (g) => { bumpRel(g, 'Ya', 3, 8); return ['She kisses back like she\'s trying to win. She probably is.']; }, to: 'rt_road' }, // v0.11.123 (EB1, KN): a kiss no longer sets her romance flag (the bar of 72 decides)
            { text: '"Leave Mei Lin alone."', show: both, do: (g) => { bumpRel(g, 'Ya', -2, 0); return ['"No," Ya says cheerfully. "She doesn\'t want me to either. She just doesn\'t know it yet."']; }, to: 'rt_road' },
        ],
    },
    rt_mei_talk: {
        id: 'rt_mei_talk', title: 'Mei Lin', art: 'mei_lin', place: `${BR} — the deer paths`,
        text: (g) => `Mei Lin walks with her herb-knife in her hand, not because anything is near, but because she needs something to hold.

"A thousand years," she says at last. "The tree sang for a thousand years, and then the Sect's founder cut out its heart, and the world went bitter. And every child who went up that road, every tribulation, every death — it all comes from that." Her mouth twists. "My father died for a theft that happened before my grandmother's grandmother was born."

You don't have anything sarcastic for that. You walk beside her.

${both(g) ? `After a while she says, very low: "Ya kissed me. Last night. By the water." She doesn't look at you. "In Ashfall a woman who did that would be married off to a goatherd in the next valley before the week was out. I should be angry." A pause. "I'm not angry. Explain that, mycologist."` : rel(g, 'Mei Lin').a >= 15 ? '"When we get home," she says, "my mother is going to ask me what you are to me. I don\'t know what I\'ll tell her." She looks at you sideways. "Help me decide."' : '"Thank you," she says at last, formally, as if it costs her something. "For taking me in there. For not leaving me outside."'}`,
        choices: [
            { text: '"Some things grow wherever they\'re planted. Even when the soil says no."', do: (g) => { bumpRel(g, 'Mei Lin', 3, 4); trioStep(g, 2); return []; }, to: 'rt_road' },
            { text: 'Take her hand and say nothing. She doesn\'t need a lecture.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 5); return []; }, to: 'rt_road' },
            { text: '"Your father didn\'t die for a theft. He died for a lie. We can fix the lie."', do: (g) => { bumpRel(g, 'Mei Lin', 6, 2); g.flags.mei_vow = true; return ['She is quiet for a long time. Then she nods, once, like someone signing a contract.']; }, to: 'rt_road' },
            { text: 'Kiss her, there on the path, before she finds something else to hold.', show: (g) => rel(g, 'Mei Lin').a >= KISS_MEI || !!g.flags.romance, do: (g) => { const lover = !!g.flags.romance; bumpRel(g, 'Mei Lin', 3, 8); return [lover ? 'She kisses back with the knife held carefully out to one side, like a woman who was brought up properly. "Later," she says, and this time she says when.' : 'She kisses back with the knife held carefully out to one side, like a woman who was brought up properly. "We will discuss that," she says, and does not say when.']; }, to: 'rt_road' }, // v0.11.123 (EQ1, SC; Fable's D2; EB1, KN: sets no flag); last, so saved choice positions keep their lines
        ],
    },
    rt_ambush: {
        id: 'rt_ambush', title: 'The Birch Ridge', art: 'wolves', place: `${BR} — the birch ridge`,
        text: `Ya stops so suddenly you walk into her back. She doesn't complain, which is how you know it's bad.

"Ash-wolves," she breathes. "Three. Maybe four. They've been pacing us since the tree." She sniffs, and her face goes ugly. "They smell the seed. Or you. Everything in this forest that eats Qi is going to want what you're carrying."

Grey shapes between the white trunks. Coal-red eyes.

Mei Lin draws her knife and stands next to you without being asked. Ya laughs under her breath, low and happy, like someone hearing music.`,
        choices: [
            { text: 'Fight. Back to back.', combat: roadWolves, to: 'rt_wolves_won' },
            { text: 'A wall of bone between you and them, then down to the river.', qi: 6, check: { skill: 'Convergence Use', dc: 5 }, fly: "The wall goes up. Then so do you, with your company in tow. The wolves watch dinner leave by air and look personally wronged." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 30, to: 'rt_ford', fail: 'rt_ambush_forced' },
        ],
    },
    rt_ambush_forced: {
        id: 'rt_ambush_forced', title: 'The Birch Ridge', art: 'wolves', place: `${BR} — the birch ridge`,
        text: `The wall comes up knee-high and full of gaps. The lead wolf steps through one with the air of an inspector finding fault. Ya spits on the ground in front of it, which you suspect is not a tactic.`,
        choices: [{ text: 'Fine. Fight.', combat: roadWolves, to: 'rt_wolves_won' }],
    },
    rt_wolves_won: {
        id: 'rt_wolves_won', title: 'White Bark, Red Snow', art: 'wolves', place: `${BR} — the birch ridge`,
        enter: (g) => { addItem(g, 'smoked_meat', 2); bumpRel(g, 'Ya', 3, 2); return ['+2 Smoked meat (Ya skins one wolf in four minutes and smokes it over nothing you can see).']; },
        text: (g) => `When it's done, Ya is standing on the biggest wolf with her spear through its throat, howling at the sky like a lunatic, and Mei Lin is wiping her knife on the grass with an expression of grave, scandalised satisfaction.

"You," Mei Lin says to Ya, "are an animal."

"Yes," Ya agrees, delighted. "You fight like one too. It was very attractive." She jumps down. "Both of you. Very attractive. I'm going to think about it all day."

${both(g) ? 'Mei Lin goes red to the ears and walks off very fast. Ya watches her go with the patience of a hunter at a waterhole.' : 'Mei Lin walks off very fast. You decide not to think about anything at all.'}`,
        choices: [{ text: 'Down to the river.', time: 90, to: 'rt_ford' }],
    },
    rt_wolves_lost: {
        id: 'rt_wolves_lost', title: 'Bitten', art: 'wolves', place: `${BR} — the birch ridge`,
        enter: (g) => { g.james.hp = Math.max(3, Math.floor(g.james.hp)); return []; },
        text: `You go down under two of them. Then Ya is there, all teeth and spear and noise, and Mei Lin is behind her with the knife, and Yuki is something white and furious in the middle of it, and the wolves decide — wisely — that there are easier meals in the Blackroot.

Ya hauls you up by your coat. "You fight like a scholar," she says, disgusted. Then, gently, with her thumb, she wipes blood off your cheek. "Don't do that again. I haven't finished with you."`,
        choices: [{ text: 'Limp down to the river.', time: 120, to: 'rt_ford' }],
    },
    rt_ford: {
        id: 'rt_ford', title: 'The Black Ford', art: 'drowned_wood', place: `${BR} — the black ford`,
        text: `The river is wide, slow and the colour of strong tea. Drowned trees stand in it up to their elbows. The ford is a line of stones you can only see if Ya points to them, and she points with her chin, which is unhelpful.

"The thing lives in the middle," she says. "It's asleep in the day. Mostly. Walk soft. Don't think loud."

"How do you think quietly?"

"You don't. You're the loudest thinker I've ever met."`,
        choices: [
            { text: 'Cross carefully, stone by stone.', check: { skill: 'GU', dc: 5 }, fly: "You cross carefully, a hand's width above every stone, and ferry the rest over the same way. The river sleeps on. Ya says you still think loud." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 40, do: (g) => [`You go stone to stone with Ya's chin for a map and your mind as quiet as you can make it, which Ya says, afterwards, is not very. Something long shifts under the brown water as Mei Lin passes over it, and doesn't wake. On the far bank ${byForm(g, "Yuki shakes a wet paw at the river,", "Yuki shakes a wet paw at the river,", "Yuki wrings out the hem of her dress at the river,")} formally, and walks on.`] /* v0.11.126 (NQ1): by her form, Fable's */, to: 'rt_camp', fail: 'rt_ford_wake' },
            { text: 'Sing a bridge of bone from stone to stone.', qi: 8, check: { skill: 'Convergence Use', dc: 5 }, fly: "You sing no bridge. You fly the ford and carry the others over, one trip each. The stones stay stones. The thing in the middle stays asleep." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, flyFree: true /* FQ1: no Qi when flown */, time: 40, do: (g) => { bumpRel(g, 'Mei Lin', 2, 0); return ['A white bridge, ribbed like a spine. Mei Lin crosses it like a woman walking into a temple.']; }, to: 'rt_camp', fail: 'rt_ford_wake' },
        ],
    },
    rt_ford_wake: {
        id: 'rt_ford_wake', title: 'The Thing in the River', art: 'mire_serpent', place: `${BR} — the black ford`,
        text: `A stone moves under your foot. It is not a stone. It is an eye.

The river stands up.`,
        choices: [
            { text: 'Fight it in the shallows.', combat: fordSerpent, to: 'rt_serpent_won' },
            { text: 'Run for the far bank.', check: { skill: 'GU', dc: 5 }, fly: "You leave the river upwards, hauling whoever is nearest. The serpent strikes where a running man would be. You are not there, and not running." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 20, to: 'rt_camp', fail: 'rt_serpent_forced' },
        ],
    },
    rt_serpent_forced: {
        id: 'rt_serpent_forced', title: 'The Thing in the River', art: 'mire_serpent', place: `${BR} — the black ford`,
        text: `You do not make the far bank. The far bank is very far. The serpent is very close.`,
        choices: [{ text: 'Then fight.', combat: fordSerpent, to: 'rt_serpent_won' }],
    },
    rt_serpent_won: {
        id: 'rt_serpent_won', title: 'Still Water', art: 'drowned_wood', place: `${BR} — the black ford`,
        enter: (g) => { addItem(g, 'beast_core', 1); bumpRel(g, 'Ya', 4, 2); return ['+1 Murky beast core.']; },
        text: `The serpent sinks back into the brown water with your blade still in its eye, and the river goes flat and quiet as if nothing has ever happened in it, ever.

Ya wades out to her waist, fishes around for a while, and comes back with a beast core the size of a plum, which she drops into your hand like a cat leaving a mouse on a doorstep.

"For you," she says. "Eat it."

"I don't eat cores."

"I know. I like watching your face when I say it."`,
        choices: [{ text: 'Make camp on the far bank.', time: 60, to: 'rt_camp' }],
    },
    rt_serpent_lost: {
        id: 'rt_serpent_lost', title: 'Swept', art: 'drowned_wood', place: `${BR} — downstream`,
        enter: (g) => { g.james.hp = Math.max(3, Math.floor(g.james.hp)); return []; },
        text: (g) => `The serpent throws you a long way downstream. You come up coughing in the reeds with ${byForm(g, "Yuki standing on your chest,", "Yuki standing over you,", "Yuki kneeling on your chest,")} soaked and incandescent with rage.

By the time Mei Lin and Ya find you, the serpent has gone back to sleep, and Ya is laughing so hard she has to sit in the mud. Mei Lin is not laughing. Mei Lin is checking your ribs with grave, furious hands and muttering things her mother would slap her for.`,
        choices: [{ text: 'Make camp. Dry out.', time: 90, to: 'rt_camp' }],
    },
    // v0.11.129 (owner pick CB1; Fable's MAINs): the human makes four at the camp (CA) and in the talk's label (TL)
    rt_camp: {
        id: 'rt_camp', title: 'The Last Camp', art: 'trio_fire', place: `${BR} — the far bank`,
        enter: (g) => { toHour(g, 19); if (daily('rt_supper')(g)) { markDaily(g, 'rt_supper'); const out = eatBest(g, { fire: true }); if (!out.length) { eat(g, 20); return ['Ya\'s smoked meat, shared round the fire: +20 satiety.']; } return out; } return []; },
        text: (g) => `Last night in the Blackroot. Tomorrow, Ashfall.

The fire is small, because Ya says big fires are for people who want to be eaten. ${byForm(g, 'The three of you sit round it with Yuki in the warmest lap available', 'The three of you sit round it with Yuki laid behind you all like a white wall, her head in the warmest lap available', 'The four of you sit round it, Yuki leaning on the warmest shoulder available')}, which tonight is ${both(g) ? 'Mei Lin\'s, and Ya keeps finding reasons to lean across her to poke the fire' : likesYa(g) ? 'Ya\'s, to everyone\'s surprise, especially Ya\'s' : 'Mei Lin\'s'}.

Somewhere out in the dark, the dead tree stands against the stars. You can feel it at your back, the way you'd feel someone watching you leave.`,
        choices: [
            { text: (g) => byForm(g, 'Talk, the three of you, until the fire burns down.', 'Talk, the three of you, until the fire burns down.', 'Talk, the four of you, until the fire burns down.'), show: (g) => !g.flags.rt_fire_talk, time: 90, do: set('rt_fire_talk'), to: 'rt_fire_talk' },
            { text: 'Take the first watch with Ya.', show: (g) => !g.flags.rt_watch, time: 120, do: set('rt_watch'), to: 'rt_watch' },
            { text: 'Cultivate by the fire: one sit, 10 Qi.', req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'rt_camp' },
            { text: 'Sleep.', to: 'rt_dawn' },
        ],
    },
    // v0.11.129 (CB1, FT; Fable's MAINs): a beat for the human in each text; CS1 (FW): "according to Ya and Mei Lin" and her word in the joke's result
    rt_fire_talk: {
        id: 'rt_fire_talk', title: 'Around the Fire', art: 'trio_fire', place: `${BR} — the far bank`,
        text: (g) => (both(g)
            ? `It starts as a game. Ya's idea: everyone tells the worst thing they've ever done. Ya's is a long story about a bear and a bet, and at the end of it the bear is dead and Ya is wearing it. Yours involves a grant committee and is, according to ${byForm(g, 'both women', 'both women', 'Ya and Mei Lin')}, not bad at all, merely sad.${byForm(g, '', '', ' Yuki, in her turn, says she has never done anything wrong in her life, and looks at each of you until the subject closes.')}

Mei Lin's is that she laughed at Gao Feng. In front of the whole herb slope. "That's it," she says, glaring. "That's the worst thing. In Ashfall it nearly got me sold."

Ya stares at her. Then she reaches over, takes Mei Lin's face in both hands, and kisses her, slowly, right there by the fire, with you sitting three feet away.

When she lets go, Mei Lin doesn't slap her. She looks at Ya. Then — a long, unreadable look — at you.

"Well," says Ya, licking her lip, satisfied. "Now *that's* the worst thing you've done. Congratulations."`
            : `Ya tells the story of how she was raised: by an old hunter who found her in a burned village at four, taught her to track and kill, and died when she was twelve. After that, the forest raised her. "It's a better mother than most," she says, and Mei Lin, to her credit, doesn't argue.

Mei Lin tells of her father. You tell of the lab, and the blast, and the people you'll never know about.${byForm(g, '', '', ' Yuki says only that she slept through the blast, which is true, and that she has not forgiven the chamber, which is also true.')}

When the fire is down to embers, nobody is talking any more, and it's comfortable.`),
        choices: [
            { text: (g) => (both(g) ? '"Is this a good time to mention I\'m right here?"' : 'Bank the fire.'), do: (g) => { if (both(g)) { trioStep(g, 3); bumpRel(g, 'Ya', 2, 4); bumpRel(g, 'Mei Lin', 2, 4); return ['Ya laughs. Mei Lin, after a moment, does too. It sounds like something breaking open.' + byForm(g, '', '', ' Yuki does not laugh. She was right here too.')]; } bumpRel(g, 'Ya', 3, 1); bumpRel(g, 'Mei Lin', 3, 1); return [`You bank the fire the way Ya taught you, so it keeps without showing. Nobody moves to sleep. Ya lies flat with her hands behind her head and says, to the stars, "That was a good one." Mei Lin, to everyone's surprise and especially her own, agrees.`]; }, to: 'rt_camp' },
        ],
    },
    rt_watch: {
        id: 'rt_watch', title: 'Night Watch', art: 'night_watch', place: `${BR} — the far bank`,
        text: (g) => `Ya doesn't watch the dark the way you do. You look. She *listens*, with her whole body, head cocked, like an animal. Twice she names a sound before you've heard it.

"Your village," she says at last. "Ashfall. Tomorrow. They'll want me to sleep in a house." She says *house* the way you'd say *coffin*. "With a roof. And rules. And old women telling me to cover my arms."

"Probably."

"I'll bite someone."

"Probably."

She's quiet for a moment. Then: "${likesYa(g) ? 'If you were in the house, I could stand it. Maybe.' : 'You\'re a strange one. I haven\'t decided if I like you.'}" She bumps her shoulder into yours, hard enough to hurt. It's the gentlest thing she's ever done.`,
        choices: [
            { text: 'Bump her back.', do: (g) => { bumpRel(g, 'Ya', 3, 4); return [`You bump her back, not as hard, because you'd like to keep the shoulder. She grunts. Then she leans in and stays leaning, a warm weight against your arm, and goes on listening to the dark as if nothing has changed. Twice more she names a sound before you hear it, quieter each time.`]; }, time: 60, to: 'rt_camp' },
            { text: '"You don\'t have to sleep in a house. Sleep where you like. I\'ll explain to the old women."', do: (g) => { bumpRel(g, 'Ya', 6, 2); g.flags.ya_free = true; return ['She looks at you like you\'ve given her something with teeth in it.']; }, time: 60, to: 'rt_camp' },
        ],
    },
    rt_dawn: {
        id: 'rt_dawn', title: 'Day Twenty', art: 'return_road', place: `${BR} — the last ridge`,
        enter: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; },
        text: `You walk the last stretch in silence. The forest thins. The ridge rises. And then, below you, in the grey morning: forty roofs of grey stone, the chimney smoke, the tribute post with its banners hanging limp.

Ashfall.

Ya stops at the treeline as if there were a wall there. For a moment she looks younger than you've ever seen her. Then Mei Lin, without a word, takes her hand, and Ya stares at their joined hands like someone has handed her a live snake, and lets herself be walked down the hill.`,
        choices: [{ text: 'Go home.', time: 90, to: 'rt_arrive' }],
    },

    /* ======================================================== DAY 20 — Ashfall =========================================== */
    // v0.11.129 (CS1, RA; Fable's MAIN): the street registers the human
    rt_arrive: {
        id: 'rt_arrive', title: 'The Return', art: 'ashfall_dawn', place: P,
        text: (g) => `Ashfall receives you the way Ashfall receives everything: in silence, in a line, with its hands folded.

They have heard. Of course they have heard — hunters talk, and a party that walks into the Blackroot's heart and walks out again is a thing that has not happened in living memory. Old Wen stands at the front with his pipe cold in his hand. Behind him, the street. Nobody smiles. Somebody's grandmother touches her forehead to the dust as you pass, then gets up and does it again.

${byForm(g, 'Their eyes go to Ya and stay there.', "Their eyes go to Yuki first: four hundred pounds of white cat, pacing at your heel like a dog that has never heard of dogs. Ashfall has seen the outlander's beast before. It has not got smaller. They look, gravely, once, as at a matter that belongs to the outlander and is therefore not to be remarked on. Then they go to Ya and stay there.", 'Their eyes go to Yuki first — the white hair, the ears, the tail — and move on, gravely, as from a matter that belongs to the outlander and is therefore not to be looked at twice. Then they go to Ya and stay there.')} Bare arms, wolf-tooth necklace, spear, a scar through one eyebrow and a grin that is frankly a provocation.

"She is with us," Mei Lin says, loud and clear, to the whole street. That is not a thing a woman of Ashfall says. The street notes it.

${g.flags.sky_witness ? 'And they look at you the way they looked at you after the sky came and went away again: as if you are weather.' : 'And they look at you, the stranger who went into the forest and came back, as if they\'re no longer sure what you are.'}`, // v0.11.130 (YB1, RA; Fable's MAIN): the street sees the great root-kin
        choices: [
            { text: 'Go to Old Wen first. Formally.', time: 30, to: 'rt_wen' },
            { text: 'Mei Lin\'s mother is in the doorway. Face her.', time: 30, to: 'rt_mother' },
        ],
    },
    rt_wen: {
        id: 'rt_wen', title: 'Old Wen', art: 'council', place: `${P} — the elder's house`,
        text: (g) => `Old Wen hears the whole story without interrupting: the roots, the hall, the ship of grown wood, the founder who cut out the heart of the world's filter and called it cultivation.

When you finish he sits very still for a long time.

"Then everything we have knelt to," he says at last, "is built on a grave." He does not raise his voice. "Our children went up that road to feed a thief."

He sets down his cup with great care.

"The hunters saw riders on the switchbacks at dusk. Sect colours. An Outer Elder travels with that many men." He looks at you with his good eye. "Shen Qiu. He will be at our gate tomorrow. He will have heard of the tribulation that refused to fall${g.flags.ending === 'fought' ? ', and of the disciples you sent home bleeding' : ''}. He will want to see what you are with his own eyes."

"And then?"

"And then he will decide whether Ashfall continues to exist." Old Wen bows his head, formally, to you — the first time he has. "Whatever you carried out of that tree. If it is going to be planted, plant it today."`,
        choices: [{ text: 'Go and plant it.', time: 20, to: 'rt_plant' }],
    },
    // v0.11.129 (CB1, MO; Fable's MAIN): the mother sees the human and counts four
    rt_mother: {
        id: 'rt_mother', title: 'The Mother', art: 'dinner', place: `${P} — Mei Lin's house`,
        text: (g) => `Mei Lin's mother looks at her daughter, filthy and scratched from four days in the deep forest. She looks at you.${byForm(g, '', '', ' She looks at Yuki, ears and all, and lets that wait.')} She looks at Ya for a very long time.

"You took my daughter into the Blackroot," she says to you, perfectly level.

"She took me, technically."

"Be silent." She turns to Mei Lin. "The street says you held this wild woman's hand down the hill in front of the whole village."

"I did," says Mei Lin.

"The street says she kissed you at the river." Ya opens her mouth; Mei Lin's mother silences her with a single look that could stop a charging boar. "I have heard what the street says about you since you were fourteen, daughter. You laugh at the wrong men. You walk with the wrong strangers. You will be the death of this house's name."

The silence stretches.

"Your father," she says at last, "was exactly the same." She steps aside from the door. "Wash. All ${byForm(g, 'three', 'three', 'four')} of you. You smell like the forest died on you."`,
        choices: [{ text: 'Wash. Then the seed.', time: 60, do: (g) => { bumpRel(g, 'Mei Lin', 3, 0); bumpRel(g, 'Village', 2, 0); return []; }, to: 'rt_plant' }],
    },
    rt_plant: {
        id: 'rt_plant', title: 'The Seed', art: 'seed_planting', place: P,
        text: (g) => `${seeded(g)
            ? 'You take the seed-sliver out of the hammerspace. In daylight it is smaller than you remember: a splinter of pale heartwood no longer than your finger, warm, faintly pulsing. Half the village has followed you, at a distance, in total silence.'
            : 'You have no seed. You have a hull-shard from the ship, a thousand years old and still faintly warm, and a theory. Half the village has followed you, at a distance, in total silence, to watch you test it.'}

Where to put it?

Mei Lin says *by the well*, where everyone will see it every day. Old Wen, leaning on his stick, says nothing, but his eye goes to the old shrine at the end of the street, the one whose god has had its face chiselled off. Ya says *in the forest, obviously, where it belongs*, and is ignored.`,
        choices: [
            { text: 'By the well, where the whole village draws water.', do: (g) => { g.flags.grove_site = 'well'; return []; }, to: 'rt_plant_sing' },
            { text: 'In front of the faceless shrine. Give the god a new face.', do: (g) => { g.flags.grove_site = 'shrine'; bumpRel(g, 'Village', 3, 0); return []; }, to: 'rt_plant_sing' },
            { text: 'At the edge of the village, facing the forest. Ya isn\'t wrong.', do: (g) => { g.flags.grove_site = 'edge'; bumpRel(g, 'Ya', 4, 1); return []; }, to: 'rt_plant_sing' },
        ],
    },
    rt_plant_sing: {
        id: 'rt_plant_sing', title: 'The First Song', art: 'seed_planting', place: P,
        text: `You kneel, dig with your hands, set it in the black earth, and cover it. Then you put your palm flat on the ground and do the thing your people do, the thing you haven't done since the lab: you *sing* to it. Not with your voice. With the Convergence, with the same deep note that the Hearth Trees of home hum back when you are a child walking under them.

For a long moment nothing happens.

Then the ground under your hand answers.`,
        choices: [
            { text: 'Give it everything you have.', qi: 10, check: { skill: 'Convergence Use', dc: 5, band: 'challenging' }, time: 60, do: (g) => { g.flags.grove = 'strong'; addItem(g, 'seed_sliver', -1); return ['The note goes down into the earth like a root. It does not come back. It stays.']; }, failDo: (g) => { g.flags.grove = 'weak'; addItem(g, 'seed_sliver', -1); return ['The note wavers, but it takes. Something down there is listening.']; }, to: 'rt_ashfall' },
            { text: 'Sing gently. Let it find its own way.', time: 90, do: (g) => { g.flags.grove = 'gentle'; addItem(g, 'seed_sliver', -1); return []; }, to: 'rt_ashfall' },
        ],
    },
    rt_ashfall: {
        id: 'rt_ashfall', title: 'Ashfall, the Last Day', art: 'ashfall_dawn', place: P,
        text: (g) => {
            const h = hour(g);
            return `${h < 12 ? 'Morning.' : h < 17 ? 'Afternoon.' : 'Evening is coming.'} Tomorrow, Shen Qiu.

The village is working the way people work when they are afraid and have decided not to show it: carefully, formally, without talking. ${g.flags.grove ? `Where you planted the seed, there is a ring of children standing at a respectful distance, watching a patch of bare earth as if it might bite.` : ''}

${g.flags.a1_palisade ? 'The bone palisade stands white along the north lane.' : ''} ${g.flags.a1_militia ? 'The hunters are drilling on the threshing floor.' : ''} ${g.flags.ya_brawled ? 'Hunter Bao is pointedly not looking at Ya. Ya is pointedly looking at Hunter Bao.' : ''}`;
        },
        choices: [
            { text: 'Raise a palisade of bone along the north lane.', show: (g) => !g.flags.a1_palisade && hour(g) < 19, qi: 8, check: { skill: 'Convergence Use', dc: 5, band: 'challenging' }, time: 150, do: set('a1_palisade'), failDo: () => ['It comes out patchy. You\'ll try again before dark.'], to: 'rt_ashfall' },
            { text: 'Drill the hunters one last time.', show: (g) => !g.flags.a1_militia && hour(g) < 19, time: 30, to: 'rt_hunters' },
            { text: 'Sit with the elders in council.', show: (g) => !g.flags.council_done && hour(g) < 19, time: 30, to: 'rt_council' },
            { text: 'Go and look at the place you planted the seed.', show: (g) => !!g.flags.grove && !g.flags.grove_visit && hour(g) < 20, time: 30, to: 'rt_grove' },
            { text: 'Find out where Ya has got to. You have a bad feeling.', show: (g) => !g.flags.ya_village && hour(g) < 19, time: 20, to: 'rt_ya_village' },
            { text: 'Cultivate behind the shrine: one sit, 10 Qi.', show: (g) => hour(g) < 20, req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'rt_ashfall' },
            { text: 'Rest an hour.', show: (g) => hour(g) < 19, do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'rt_ashfall' },
            { text: 'Evening. Supper at Mei Lin\'s.', show: (g) => hour(g) >= 15, time: 20, to: 'rt_evening' },
        ],
    },
    rt_hunters: {
        id: 'rt_hunters', title: 'The Hunters', art: 'drill', place: `${P} — the threshing floor`,
        text: (g) => `The hunters line up for you without being told. Eight of them, ${g.flags.spears ? 'white bone spearheads on their shafts,' : 'old boar spears in their fists,'} faces set like stone. They have never in their lives stood against the Crimson Lotus. They have decided to try.

Ya watches from the fence, chewing a grass stem, offering commentary. "That one holds his spear like a broom. That one's afraid. That one's handsome but afraid. That one—"

"Ya."

"I'm *helping*."`,
        choices: [
            { text: 'Drill them hard: shields of bone, spears behind, nobody alone.', check: { skill: 'GU', dc: 5, band: 'challenging' }, time: 150, do: (g) => { g.flags.a1_militia = true; bumpRel(g, 'Village', 4, 0); return ['By sunset they move as one. Whether that will matter against an Elder, nobody says aloud.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['It doesn\'t come together. They\'ll stand anyway. That\'s the worst part.']; }, to: 'rt_ashfall' },
            { text: 'Let Ya teach them how she hunts. What could go wrong.', time: 150, do: (g) => { g.flags.a1_militia = true; bumpRel(g, 'Ya', 4, 2); bumpRel(g, 'Village', -2, 0); return ['Two black eyes, one dislocated finger, and a squad of hunters who now move like something hungry. The village elders are deeply offended. It works.']; }, to: 'rt_ashfall' },
        ],
    },
    rt_council: {
        id: 'rt_council', title: 'Council', art: 'council', place: `${P} — the elder's house`,
        enter: set('council_done'),
        text: `The elders of Ashfall sit in a ring on the floor of Old Wen's house: six old men and two old women, in their best grey robes, faces like carved wood. They speak in turn. Nobody interrupts. It takes a very long time.

The miller says Ashfall should give the Elder whatever he wants, including you. The midwife says that if they give you up, the Sect will know Ashfall can be bargained with forever. The oldest hunter says nothing at all, only looks at the floor.

Then they all look at you.`,
        choices: [
            { text: 'Speak plainly: the truth about the tree, the founder, the poisoned Qi. Let them decide with open eyes.', check: { skill: 'GU', dc: 5 }, time: 90, do: (g) => { g.flags.council_unity = true; bumpRel(g, 'Village', 6, 0); return ['When you finish, nobody speaks. Then, one by one, they bow. Not to you. To the truth. Ashfall will stand together tomorrow.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['They listen. They thank you formally. You can see the miller doing sums behind his eyes.']; }, to: 'rt_ashfall' },
            { text: 'Offer to go with the Elder willingly, if it spares the village.', time: 60, do: (g) => { g.flags.offered_self = true; bumpRel(g, 'Village', 8, 0); bumpRel(g, 'Mei Lin', -2, 0); return ['The elders bow very low. Mei Lin, when she hears, does not speak to you for an hour.']; }, to: 'rt_ashfall' },
        ],
    },
    rt_grove: {
        id: 'rt_grove', title: 'The Grove', art: 'grove_sprout', place: P,
        enter: set('grove_visit'),
        text: (g) => `It has already come up.

Not a sapling: a ring of them, seven white stems as tall as your knee, leaves unfolding pale green and translucent, veined like the inside of a wrist. ${g.flags.grove === 'strong' ? 'They are humming.' : 'If you hold your breath, you can hear them humming.'} The air around them is *clean* — you can taste it, sweet and empty, the first air on this world that has not tasted of something dead.

The children have crept closer. One small girl has her hand out flat, not touching, feeling the warmth. Her grandmother hisses at her to come away. The girl doesn't move.

${byForm(g, "Yuki walks into the middle of the ring, lies down, and purrs so loudly that the leaves tremble.", "Yuki walks into the middle of the ring, lies down, and purrs so loudly that the leaves tremble.", "Yuki walks into the middle of the ring, sits down in her black dress, and purrs so loudly that the leaves tremble.")}`,
        choices: [
            { text: 'Sit among them and cultivate. Let the song in.', check: { skill: 'Convergence Use', dc: 4 }, time: 60, do: (g) => { g.flags.grove_attuned = true; const gain = sitGain(g, 2); g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10); return [`The grove carries your Qi round and back, clean as a held breath. Saturation +${Math.round(gain * 10) / 10}% (${g.james.saturation}%), no Qi spent.`]; }, failDo: () => ['You try. You\'re too afraid of tomorrow to listen.'], to: 'rt_ashfall' },
            { text: 'Kneel by the girl and show her how to feel the song.', do: (g) => { bumpRel(g, 'Village', 5, 0); return ['Her grandmother watches, stiff as a post. Then, slowly, she kneels too.']; }, time: 30, to: 'rt_ashfall' },
        ],
    },
    rt_ya_village: {
        id: 'rt_ya_village', title: 'Ya in Ashfall', art: 'ya_fight', place: `${P} — outside the wine shop`,
        enter: set('ya_village'),
        text: `You find Ya outside the wine shop, nose to nose with Hunter Bao, who is the size of a door and the colour of a beetroot.

As far as you can reconstruct it: Bao told her to cover her arms in front of decent women. Ya told him what she would do with his arms. Bao called her a beast in human skin. Ya said thank you. Then she said something about his mother that you will not repeat, and now his two cousins are standing up from the bench with the slow, grave deliberation of men about to defend a family's honour.

"James!" Ya calls, without taking her eyes off Bao. "Good. Watch this."`,
        choices: [
            { text: 'Step between them. Talk everyone down, formally, the way Ashfall likes it.', check: { skill: 'GU', dc: 5 }, time: 30, do: (g) => { bumpRel(g, 'Village', 3, 0); bumpRel(g, 'Ya', -3, 0); return ['You bow to Bao, apologise on behalf of "my guest, who is from very far away", and hustle Ya off before she can finish her sentence. She sulks for an hour. It is a magnificent sulk.']; }, fail: 'rt_brawl_start', to: 'rt_ashfall' },
            { text: 'Stand beside her. If they want a fight, it\'s two against three.', do: (g) => { bumpRel(g, 'Ya', 5, 4); return []; }, to: 'rt_brawl_start' },
        ],
    },
    rt_brawl_start: {
        id: 'rt_brawl_start', title: 'Honour', art: 'ya_fight', place: `${P} — outside the wine shop`,
        text: (g) => `Bao takes off his jacket and folds it, neatly, and hands it to his cousin. In Ashfall, apparently, even a brawl has a ritual. Ya does not take anything off. Ya has already hit him.${byForm(g, '', " Yuki looks at the wine-shop bench, and at the cousins sitting on it. She can wait. They are about to get up.", '')}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fists only. Nobody dies the day before the Elder.', combat: brawl, to: 'rt_brawl_won' }],
    },
    rt_brawl_won: {
        id: 'rt_brawl_won', title: 'Settled', art: 'ya_fight', place: `${P} — outside the wine shop`,
        enter: (g) => { g.flags.ya_brawled = 'won'; bumpRel(g, 'Ya', 3, 3); return []; },
        text: `Bao sits in the dust with a split lip and great dignity. After a while he gets up, puts his jacket back on, and bows to Ya — a proper, formal hunter's bow, the one they give to a boar that died well.

Ya has no idea what to do with this. She stares at him. Then she bows back, badly, like someone who has only seen it done.

"Tomorrow," Bao says gravely, "stand on my left. I am slow on the left."

"Everyone's slow on the left," Ya says. But she's grinning.`,
        choices: [{ text: 'Back to the preparations.', time: 30, to: 'rt_ashfall' }],
    },
    rt_brawl_lost: {
        id: 'rt_brawl_lost', title: 'Settled, Badly', art: 'ya_fight', place: `${P} — outside the wine shop`,
        enter: (g) => { g.flags.ya_brawled = 'lost'; g.james.hp = Math.max(3, g.james.hp); return []; },
        text: (g) => `You end up in the horse trough. Ya ends up on the wine-shop roof, which she insists was deliberate. Bao and his cousins walk off with the stiff satisfaction of men whose honour has been restored by the correct procedure.

Mei Lin, arriving, takes in the scene: you in the trough, Ya on the roof, half the street watching with their hands folded.

"I leave you alone," she says, "for *one hour*."${byForm(g, '', "\n\nFrom the wine-shop bench, most of which she is, Yuki yawns to the back teeth. *Fists only,* says the bond. *Your rule. I kept it for you.*", '')}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Climb out with what dignity you have left.', time: 30, to: 'rt_ashfall' }],
    },

    /* ======================================================== night of Day 20 ============================================ */
    rt_evening: {
        id: 'rt_evening', title: 'The Last Supper Before', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { toHour(g, 19); if (daily('rt_evening')(g)) { markDaily(g, 'rt_evening'); eat(g, 30); return ['Millet, greens, and everything the house has been saving: +30 satiety.']; } return []; },
        text: (g) => `Mei Lin's mother serves four bowls ${byForm(g, 'and a saucer for the cat', 'and, after a long look at Yuki, the stew pot', 'and a fifth for Yuki, with the saucer beside it out of habit')}. She serves Ya last, and Ya, who has been watching the old woman all evening like a wolf watches a fire, says "thank you" in a small voice that nobody at the table has heard her use before.

Nobody mentions tomorrow. Everybody thinks about it.

Afterwards the mother goes to bed with pointed loudness. The lamp burns. ${byForm(g, 'Yuki takes the stove.', 'Yuki takes the floor in front of the stove. All of it.', 'Yuki takes the bench by the stove.')}

${trioReady(g)
            ? 'Ya and Mei Lin sit on either side of you. Neither of them is looking at the other. Both of them are very aware of the other. The air in the room is so thick you could sing bone out of it.'
            : both(g)
                ? 'Mei Lin is on one side of the table. Ya is on the other. Both of them are looking at you. Neither is looking at the other. It is, you reflect, a lot.'
                : likesYa(g) ? 'Ya is watching you across the lamp with an expression that is not at all subtle. Mei Lin looks at Ya, looks at you, and goes up to the loft with a grave, private smile.'
                    : likesMei(g) ? 'Ya stretches, yawns hugely, and announces she is going to sleep in a tree. She winks at you on the way out. Mei Lin turns the lamp down.'
                        : `Ya goes out to sleep in the grove ${byForm(g, 'with the cat-shaped hole in the leaves', 'with the tiger-sized hole in the leaves', 'with the cat-shaped hole in the leaves')}. Mei Lin says goodnight with grave courtesy. It is a quiet house.`}`,
        choices: [
            { text: 'Let Ya say what she has been trying to say for days.', show: trioReady, to: 'rt_trio' },
            { text: 'Climb to the herb loft with Mei Lin.', show: (g) => likesMei(g) && !trioReady(g), to: 'rt_mei_night' },
            { text: 'Follow Ya out to the grove.', show: (g) => likesYa(g) && !trioReady(g), to: 'rt_ya_night' },
            { text: 'Sleep by the stove with Yuki. Tomorrow needs you whole.', to: 'rt_quiet_night' },
        ],
    },
    rt_trio: {
        id: 'rt_trio', title: 'Three', art: 'trio', place: `${P} — Mei Lin's house`,
        text: `"Right," Ya says. "I'm tired of this."

She stands up, walks round the table, and sits down on the floor between your knees and Mei Lin's, cross-legged, like a council elder about to give a ruling.

"Tomorrow a very old man comes to kill us, maybe. So I'm going to say it, and you're going to be honest, both of you, for once in your stiff little lives." She points at Mei Lin. "You want him." She points at you. "You want her. And you both want me, because I'm wonderful." She shrugs. "In the forest nobody counts. Wolves don't count. Why are you counting?"

Mei Lin's face goes through several things. Pride. Fury. Fear — real fear, the fear of a woman who has heard *what the street says* her whole life. "In Ashfall," she says, very low, "a woman who did this—"

"Ashfall is kneeling to a thief," Ya says. "You said so. You said everything is built on a grave." She reaches up and takes Mei Lin's hand. "So build something else."

Mei Lin looks at you. You realise she is waiting for you to make a joke, to give her an exit.

For once in your life, you don't make one.`,
        choices: [
            { text: '"I want both of you. I have for days. I\'m forty and I\'ve stopped pretending."', do: (g) => { g.flags.throuple = true; trioStep(g, 4); bumpRel(g, 'Mei Lin', 6, 15); bumpRel(g, 'Ya', 6, 15); g.flags.romance = true; g.flags.ya_romance = true; return []; }, to: 'rt_trio_night' },
            { text: 'Take Mei Lin\'s other hand, so she\'s holding both of you. Let her decide.', do: (g) => { g.flags.throuple = true; trioStep(g, 4); bumpRel(g, 'Mei Lin', 8, 15); bumpRel(g, 'Ya', 4, 15); g.flags.romance = true; g.flags.ya_romance = true; return []; }, to: 'rt_trio_night' },
            { text: '"Not tonight. Ask me again when we\'re alive the day after tomorrow."', do: (g) => { bumpRel(g, 'Ya', -2, 0); bumpRel(g, 'Mei Lin', 3, 0); return ['Ya groans theatrically and flops onto her back on the floor. Mei Lin, very quietly, lets out a breath. Neither of them lets go of your hands.']; }, to: 'rt_quiet_night' },
        ],
    },
    rt_trio_night: {
        id: 'rt_trio_night', title: 'Build Something Else', art: 'trio', place: `${P} — the herb loft`,
        text: `For a long moment Mei Lin says nothing at all. Then she laughs — the laugh that got her into trouble her whole life, sharp and too loud and entirely hers — and she pulls Ya up off the floor by the hand, and kisses her, and then turns and kisses you, hard, like she's settling an argument.

"If my mother hears one sound," she says, "I will kill you both."

"Liar," says Ya, already on the ladder to the loft.

Up there it smells of dried mint and sun-warm hay. Ya, it turns out, has opinions about everything, including who goes where, and no shame at all about voicing them; Mei Lin, it turns out, has been listening to those opinions for days and has a few of her own. Somewhere in the middle of it your Parallel Cognition gives up trying to keep track and simply goes quiet, which has never happened before in your life.

The rest of the night belongs to the three of you.

*

Toward dawn you wake with Mei Lin's head on your chest and Ya sprawled across both of you like a fallen tree, one hand fisted in Mei Lin's hair, snoring. Downstairs, through the bond, Yuki sends a single exhausted thought: *I am moving to the grove. Permanently.*`,
        choices: [{ text: 'A few more hours. Then the Elder.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    rt_ya_night: {
        id: 'rt_ya_night', title: 'The Grove at Night', art: 'grove_sprout', place: `${P} — the grove`,
        text: (g) => `Ya is lying in the middle of the little grove on her back, arms behind her head, looking at the stars through the white stems.

"Took you long enough," she says. "Lie down."

You lie down. The grove hums. The air is clean.

"Tomorrow the old man comes," she says. "Maybe he kills you. Maybe he kills me. So I'm not waiting." She rolls over onto you, all at once, the way she does everything, and grins down with her hair falling round both your faces. "You can say no. You won't."

You don't.

She is exactly as unrestrained as you'd expect, and twice as funny, and at one point she bites you and then laughs so hard at your face she has to stop. Later — much later — she lies with her ear on your chest, listening to your heart the way she listens to the forest, and says, very quietly, "${g.flags.throuple ? '' : 'You\'re mine now. I don\'t share.'}${both(g) ? ' Well. I share with *her*. Maybe. Ask me tomorrow.' : ''}"`,
        choices: [{ text: 'Sleep in the grove. The song keeps you warm.', do: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 5, 12); sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    rt_mei_night: {
        id: 'rt_mei_night', title: 'The Loft', art: 'roof', place: `${P} — the herb loft`,
        text: (g) => `${g.flags.romance && g.flags.mei_first === 'raft' ? 'The herb loft. Mint and hay and the lamp turned low. Four walls this time, and a floor that stays where it\'s put. She climbs the ladder ahead of you as if she\'d planned that too.' : g.flags.romance ? 'The herb loft again. Mint and hay and the lamp turned low. It feels like a hundred years since the first time.' : 'The herb loft. Mint and hay and the lamp turned low. She climbs the ladder ahead of you and does not look back to see if you\'re following.'}

"Tomorrow the Elder comes," Mei Lin says, unbuttoning her jacket with steady fingers. "My mother says I'm shameless. The street says I'm shameless. Tonight I'm going to be exactly as shameless as they say."

She is. Frank, unhurried, laughing against your mouth at the worst possible moments, and then not laughing at all. Your threads go quiet one by one until there's only one left, and it's thinking about her.

*

Much later she lies with her head on your shoulder and traces the line of your collarbone with one finger. "If he takes you," she says, "I'm coming after you. Don't argue."

"Wouldn't dream of it."

"Good."`,
        choices: [{ text: 'Sleep. A few hours of this.', do: (g) => { g.flags.romance = true; bumpRel(g, 'Mei Lin', 5, 10); sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    rt_quiet_night: {
        id: 'rt_quiet_night', title: 'By the Stove', art: 'village_night', place: `${P} — Mei Lin's house`,
        text: (g) => `${byForm(g, 'You sleep by the stove with Yuki on your chest.', 'You sleep by the stove with Yuki\'s head on your chest.', 'You sleep by the stove, back to back with Yuki.')} Through the shutters you can hear the grove — faint, a sound under sound, like a song you half remember from childhood.

You don't sleep much. You lie there running tomorrow through all nine threads, and every one of them comes back with the same answer: *you don't know*. ${both(g) ? 'Once, in the dark, you hear Ya and Mei Lin talking in low voices in the loft above, and then a laugh, quickly smothered. You decide that is a problem for the day after tomorrow.' : ''}

${byForm(g, 'Toward dawn Yuki puts her nose against your chin. *Stop thinking,* says the bond. *I am trying to sleep on you.*', 'Toward dawn Yuki\'s nose bumps your chin. *Stop thinking,* says the bond. *I am trying to sleep on you.*', 'Toward dawn Yuki\'s elbow finds your ribs. *Stop thinking,* says the bond. *I am trying to sleep.*')}`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },

    /* ======================================================== DAY 21 — Shen Qiu =========================================== */
    rt_elder: {
        id: 'rt_elder', title: 'Outer Elder Shen Qiu', art: 'elder_arrives', place: `${P} — the tribute post`,
        enter: (g) => { toHour(g, 8); return []; },
        text: (g) => `He comes up the road at the hour of the snake, on foot, with twelve disciples behind him in crimson ${luHanHere(g) ? 'and Lu Han at his right hand, face like a frozen pond' : 'and, conspicuously, no Lu Han'}.${g.flags.gao_broken ? ' At the very back, carried in an open litter, sword arm still bound to his chest, rides Gao Feng. He has come to watch. His lips move the whole time, the same few words over and over, and you are fairly sure they are your name.' : ''}

Outer Elder Shen Qiu is old in the way mountains are old. His hair is white and bound up under a red jade crown. His robe is the deep red of dried blood, embroidered with a single lotus. He walks slowly, and the air walks with him: heavy, sweet, rotten, the poisoned Qi of this world drawn so thick around him that the grass at the roadside greys as he passes.

He stops at the tribute post. He looks at Ashfall — ${g.flags.a1_palisade ? 'at the white palisade, ' : ''}${g.flags.a1_militia ? 'at the hunters standing in their line with their spears grounded, ' : ''}at the people who have not knelt. Then he turns his face, slowly, toward the grove, and for the first time something moves in it.

"So," he says. His voice is soft and courteous and absolutely without warmth. "It is true. Someone has planted a song in my mountains." His eyes come to you. "And the sky came for you, and went away ashamed. I have lived three hundred years, and I did not think I would see that." He inclines his head, exactly one degree.

Then he does what they all do: he reaches for you with his Qi-sense. An Outer Elder's sense — you feel it like weather, like pressure before a storm, sweeping over you, through you, into every corner.

And it finds nothing. No root. No sea. No core. A mortal in a strange coat.

For the first time, Shen Qiu's face changes. It is not anger. It is something much older and much colder: the expression of a man who has spent three hundred years knowing exactly what everything in front of him is, and has just met the exception. "I cannot feel you," he says, very softly. "Do you understand? Not hidden. Not sealed. *Absent.* As if Heaven had forgotten to write you down." His sleeves settle. "Tell me what you are, young man, and I will decide what to do with it."

Behind you, Mei Lin's hand closes on her knife. Ya's lips draw back from her teeth. Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, goes very still.`,
        choices: [
            { text: 'Fight him. Here, in front of the grove.', combat: elderFight, to: 'rt_duel_won' },
            { text: 'Parley. Formally. Give him the face he needs and none of what he wants.', time: 30, to: 'rt_parley' },
            { text: 'Show him the truth: take him to the grove and let him feel clean Qi for the first time in three hundred years.', req: (g) => (g.james.qi >= 12 ? true : 'needs 12 Qi'), time: 30, to: 'rt_truth' },
            { text: 'Go with him. Spare Ashfall.', show: (g) => !!g.flags.offered_self, to: 'rt_taken' },
        ],
    },
    rt_parley: {
        id: 'rt_parley', title: 'Parley', art: 'elder_parley', place: `${P} — the tribute post`,
        text: (g) => `You bow — properly, the way Old Wen taught you, the exact depth owed by a guest to a great elder of a great sect. Shen Qiu notes it, and notes that it is one degree too shallow. You meant it to be.

Then you talk. About the Ouroboros Axiom, carefully. About the ship, more carefully. About the grove, and what clean Qi would mean to a sect whose disciples die in tribulation one in thirty — not as a threat, but as a merchant shows a jewel.

${g.flags.ending === 'bluff' ? 'He remembers the bluff at the tribute post; Lu Han\'s report was very complete. It costs you.' : ''}${g.flags.ending === 'fought' ? 'He remembers that you bled his disciples. He does not mention it. That is worse.' : ''}${g.flags.council_unity ? ' Behind you, the elders of Ashfall stand in a line, all eight, saying nothing, which says everything.' : ''}`,
        choices: [
            {
                text: 'Make your offer: the grove stays, Ashfall stays, and the Sect may send one disciple a season to learn what clean cultivation is.',
                check: { skill: 'GU', dc: 9, band: 'major', bonus: (g) => (g.flags.grove ? 1 : 0) + (g.flags.grove === 'strong' ? 1 : 0) + (g.flags.a1_palisade ? 1 : 0) + (g.flags.a1_militia ? 1 : 0) + (g.flags.council_unity ? 1 : 0) + (g.flags.sky_witness ? 1 : 0) + (hasItem(g, 'hearth_log') ? 1 : 0) + (g.flags.ending === 'paid' || g.flags.ending === 'bluff' ? 1 : 0) - (g.flags.ending === 'fought' ? 1 : 0) },
                to: 'rt_accord', fail: 'rt_parley_fail',
            },
        ],
    },
    rt_parley_fail: {
        id: 'rt_parley_fail', title: 'Refused', art: 'elder_parley', place: `${P} — the tribute post`,
        text: (g) => `Shen Qiu listens to all of it with perfect courtesy. Then he says, gently, as if explaining to a child: "The Crimson Lotus does not negotiate with its property."

The disciples spread out along the road.${byForm(g, '', " The two on Yuki's side stop a spear's length further off than the others. She watches them do it without getting up.", '')}

"Kneel," says Shen Qiu, "and come with me, and I will leave the grove standing out of respect for its beauty. Refuse, and I will burn it, and the village with it, and take you anyway." He folds his hands in his sleeves. "Those are the choices. They are generous."`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [
            { text: 'Refuse. Fight.', combat: elderFight, to: 'rt_duel_won' },
            { text: 'Kneel. Go with him. Ashfall lives.', to: 'rt_taken' },
        ],
    },
    rt_truth: {
        id: 'rt_truth', title: 'The Truth', art: 'grove_sprout', place: `${P} — the grove`,
        text: (g) => `You don't argue. You walk to the grove, and after a long moment — curiosity, or contempt, or something older than both — Shen Qiu follows you, alone.

The white stems are taller this morning, waist-high. The song is audible now if you stand still. ${g.flags.grove === 'strong' ? 'It is strong. The air in the ring is so clean it almost hurts.' : 'It is faint, but it is there.'}

"Step inside," you say. "Breathe."

He looks at you for a long time. Then, slowly, he steps into the ring.

You see it hit him. Three hundred years of poison — every herb, every pill, every core, every rival he ate — and for the first time since he was a boy, the air in his lungs has nothing in it at all. Something goes across his ancient face that you would not have believed it could hold.

${hasItem(g, 'hearth_log') ? 'You hold out the hearth-log. "Your founder did this," you say. "It was a filter. He killed it for its heart. Hold this, and watch him do it."' : '"This is what the world tasted like," you say, "before your founder cut its heart out."'}`,
        choices: [
            {
                text: 'Open the Convergence and sing the grove\'s note through him. All of it.',
                qi: 12, check: { skill: 'Convergence Use', dc: 8, band: 'major', bonus: (g) => (g.flags.grove === 'strong' ? 2 : g.flags.grove ? 1 : 0) + (g.flags.grove_attuned ? 1 : 0) + (hasItem(g, 'hearth_log') ? 1 : 0) + (g.james.realm >= 1 ? 1 : 0) },
                to: 'rt_truth_won', fail: 'rt_parley_fail',
            },
        ],
    },
    rt_truth_won: {
        id: 'rt_truth_won', title: 'Three Hundred Years', art: 'grove_sprout', place: `${P} — the grove`,
        enter: (g) => { g.flags.a1_outcome = 'revelation'; bumpRel(g, 'Village', 15, 0); return []; },
        text: `The note goes through him like light through paper.

Shen Qiu stands in the ring for a long time after it fades, eyes closed. When he opens them, they're wet. He doesn't seem to notice.

"I was nine," he says, very quietly, "when they gave me my first pill. My mother wept with pride." He looks at the white stems. "I had forgotten what air tasted like before."

He walks back out to his disciples. He does not look at you again. At the tribute post he stops and speaks without turning, in the formal voice of a sect elder giving judgment.

"Ashfall is under the protection of the Outer Court until the spring. No tribute. No collectors. Anyone who touches this grove will answer to me." A pause. "The Sect Master will not agree. When he learns of this, he will come himself." Another pause, longer. "Grow it faster, Bone-Maker."

He goes down the road. Lu Han, if he is there, looks back once, white to the lips.`,
        choices: [{ text: 'Breathe out.', to: 'a1_end' }],
    },
    rt_accord: {
        id: 'rt_accord', title: 'Accord', art: 'elder_parley', place: `${P} — the tribute post`,
        enter: (g) => { g.flags.a1_outcome = 'accord'; bumpRel(g, 'Village', 10, 0); return []; },
        text: (g) => `Shen Qiu is silent for so long that one of the disciples shifts his feet, and the Elder's glance stills him like a slap.

"One disciple a season," he says at last. "Of my choosing. Ashfall's tribute is suspended until the spring, when the Outer Court will review the matter." He tilts his head, one degree. "You will instruct my disciple in whatever this is. Honestly. If I learn that you have lied to him, I will return, and I will not be courteous."

"Understood."

"I doubt it." He turns to go, then pauses. "You bowed one degree too shallow. Deliberately." Something that is almost an expression crosses his face. "Next time, bow correctly. You will need friends in the Outer Court, Bone-Maker, before the Sect Master hears your name."

${luHanHere(g) ? 'He leaves Lu Han behind. "Your first student," he says. Lu Han\'s face does not move at all, which is how you know he would rather be dead.' : 'He leaves a disciple behind: a boy of perhaps seventeen, grave and terrified, who bows to you so deeply his forehead nearly touches his knees.'}`,
        choices: [{ text: 'Breathe out.', to: 'a1_end' }],
    },
    rt_duel_won: {
        id: 'rt_duel_won', title: 'The Elder Bleeds', art: 'elder_duel', place: `${P} — the tribute post`,
        enter: (g) => { g.flags.a1_outcome = 'victory'; bumpRel(g, 'Village', 20, 0); g.stats.kills += 1; return []; },
        text: (g) => `It ends with Shen Qiu on one knee in the road, a white wraithbone blade at his throat, his red jade crown in the dust and blood on his beard.

Nobody in Ashfall breathes. Nobody on the road breathes. Three hundred years, and an Outer Elder of the Crimson Lotus is kneeling to a mycologist in a lab coat.

"Kill me," Shen Qiu says calmly, "and the Sect Master comes with every disciple he has, and burns this valley to the bedrock."

"And if I don't?"

He considers you. "Then I go home in disgrace, and the Sect Master comes anyway, a little later, a little angrier, and I am a laughing-stock for the rest of my life." His mouth moves, very slightly. "I think you will let me live. You have that face."

You let him live. You don't let him leave whole: three needles, very precise, through the meridian knots of his right arm while he watches, and one more through the tendon of the hand that holds the fan. He will cultivate again. Not this season. "I do not kill people," you tell him. "I find it lets them think about things." ${likesYa(g) ? 'Ya swears at you for an hour about it.' : ''} His disciples carry him down the road. He does not look back. ${luHanHere(g) ? 'Lu Han does — once, at you, with an expression you can\'t read.' : ''}

Ashfall has just declared war on the Crimson Lotus. Everyone in the street knows it. Nobody says it. Old Wen lights his pipe with steady hands.`,
        choices: [{ text: 'Breathe out.', to: 'a1_end' }],
    },
    rt_duel_lost: {
        id: 'rt_duel_lost', title: 'Down', art: 'elder_duel', place: `${P} — the tribute post`,
        enter: (g) => { g.james.hp = 1; return []; },
        text: (g) => `You are on your back in the road and you don't remember falling. Shen Qiu stands over you, not even breathing hard, sleeves still folded.

"Interesting," he says. "Very interesting. Untrained, undisciplined, and still you made me use both hands." He looks down at you with something close to approval. "The Sect Master will want you alive."${byForm(g, '', "\n\nOne hand was for you. The other, you gather, was for Yuki, who lies ten paces up the road, a long white shape getting its legs under it one at a time.", '')}

Behind him, Ashfall has not moved. ${g.flags.a1_militia ? 'The hunters\' spears are levelled.' : 'People are holding hoes and kitchen knives.'} Mei Lin is standing with her knife out and her face white. Ya is being held back by ${g.flags.ya_brawled === 'won' ? 'Hunter Bao, of all people' : 'three hunters'}, snarling.

"Call them off," Shen Qiu says, "and I will not burn the grove. Or don't, and watch."`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Call them off. Go with him.', to: 'rt_taken' }],
    },
    rt_taken: {
        id: 'rt_taken', title: 'Taken', art: 'elder_arrives', place: `${P} — the tribute post`,
        enter: (g) => { g.flags.a1_outcome = 'taken'; bumpRel(g, 'Village', 25, 0); return []; },
        text: (g) => `You walk out to him. Behind you, the street makes a sound you will remember for the rest of your life: not a cry, not a word, just forty houses breathing in at once.

Shen Qiu inclines his head, exactly as deeply as courtesy demands. "The grove stands," he says. "Ashfall's tribute is suspended for as long as you remain a guest of the Sect." *Guest.* ${byForm(g, '"You may bring the cat. The Sect Master will want to see the cat."', '"You may bring the beast. The Sect Master will want to see the beast."', '"You may bring the root-kin. The Sect Master will want to see the root-kin."')}

Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, gives him a look of total contempt.

${g.flags.throuple ? 'Mei Lin and Ya come to the edge of the road together, hands locked so hard their knuckles are white. "We\'re coming after you," Mei Lin says, formally, in front of the whole Sect. "Both of us." Ya says nothing. Ya just looks at Shen Qiu, and smiles, and the nearest disciple takes a step back.'
        : likesMei(g) || likesYa(g) ? `${likesMei(g) ? 'Mei Lin' : 'Ya'} comes to the edge of the road. "I'm coming after you," ${likesMei(g) ? 'she' : 'she'} says, not caring who hears. "Don't argue."` : 'Mei Lin bows to you, very formally, the bow owed to a man going to his death. Ya spits on the Sect\'s road and walks into the forest without looking back. You suspect you\'ll see her again.'}

You go down the road between the crimson robes. Behind you, faint, under the sound of the wind, the grove is singing.`,
        choices: [{ text: 'Walk.', to: 'a1_end' }],
    },

    /* ======================================================== the end ===================================================== */
    a1_end: {
        id: 'a1_end', title: 'End of Act 1', art: 'a1_end', place: (g) => (g.flags.a1_outcome === 'taken' ? 'The road to the Crimson Lotus' : P),
        enter: (g) => { g.flags.spd_a1 = true; return []; }, // ×5 speed from here (3c-3)
        text: (g) => {
            const o = g.flags.a1_outcome;
            const love = loveLine(g);
            const head = o === 'taken'
                ? `The Sect's road climbs into the mountains for three days. On the second night, from a high switchback, you look back and see, far below in the black sea of the Blackroot, a single point of pale light where Ashfall is. The grove is growing.

${g.flags.throuple || g.flags.romance || g.flags.ya_romance ? 'Somewhere down there, people you love are packing for a journey. You are absolutely certain of it. It is the only thing you are certain of.' : 'You find you are not afraid. You are curious. A sect that has eaten a world\'s heart for a thousand years is, after all, a very interesting organism.'}`
                : `${o === 'victory' ? 'The Sect does not come back that week, or the next. Ashfall works, and waits, and sharpens bone.' : o === 'revelation' ? 'The Sect does not come back. Once, at dusk, a single disciple in red is seen standing on the switchbacks, looking down at the grove for a long time. Then he goes away.' : 'The disciple of the Outer Court sits in the grove every morning with his eyes shut, trying to breathe, and weeps without knowing why.'}

The grove grows. Waist-high, then shoulder-high, seven white trunks in a ring, and the song gets stronger every night. The children of Ashfall sit inside it after dark and don't know why they feel the way they do. The old people won't go near it. Then, one by one, they do.

${love}`;
            return `${head}

Some nights you lie awake and listen, and under the grove's song you think you can hear another one, very far away, very faint: deep in the Blackroot, where the dead tree stands, something answering.

Yuki, ${byForm(g, 'on your chest', 'her head on your chest', 'beside you')}, opens one gold eye. *Not dead,* says the bond. *Sleeping. Like you should be.*

— **End of Act 1.** —`;
        },
        end: true,
        choices: [],
    },
};
