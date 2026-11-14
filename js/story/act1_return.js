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
import { pickLine } from '../core/lines.js';
import { encounter, rel, likesMei, likesYa, trio, trioStep, bumpRel, sleepUntil, hour, KISS_YA, KISS_MEI } from './act1_common.js';

const P = 'Ashfall Hamlet';
const BR = 'Blackroot Wilds';
const seeded = (g) => !!g.flags.seed || hasItem(g, 'seed_sliver');
const both = (g) => likesMei(g) && likesYa(g);
const trioReady = (g) => both(g) && trio(g) >= 3;
const luHanHere = (g) => g.flags.ending !== 'fought';
// v0.11.37: after midnight (24+) the hour has passed. v0.11.47 (N1, the Fable review of v0.11.46): an evening hour is not jumped to
// before 06:00 (04:00–05:59, or a night pushed through: it is still the night; it used to skip 14–18 h); the mornings (6, 8) as before
/** v0.11.152 (owner 21:11, pick E1, BK): Day 21 went from the last night straight to Shen Qiu at 08:00 with no breakfast and no
 *  eat card (bot saves at his arrival: Fed 10–51, the middle 16–35). Breakfast at Mei Lin's, +20 satiety, at once, as the Fallout's
 *  mornings; once a Coil (a world flag). */
/** v0.11.156 (owner pick DM1, OM; texts T2–T5, Fable's, TX1): the last day's drill, again for practice once the militia is ready:
 * the check's XP and the cards' familiarity only (no second preparation, no Village or Ya change). */
export const DRILL_AGAIN = {
    label: 'Drill the hunters again. Practice only.',
    hard: ['Cleaner than the first time. Nothing changes but the blisters, and they bow to thank you for those.', 'The bone shields lock, part and lock again without a rattle. Eight hunters thank you, eldest first, for corrections you never gave.', 'Spears behind, shields in front, nobody alone, three times running. The oldest hunter allows himself one nod, then looks ashamed of the extravagance.', 'Clean from first call to last. You call the turn and the whole line swings like a door on a good hinge. Nothing gained but sweat, formally acknowledged.'],
    hardFail: ["Ragged this time. They had it earlier and they'll have it tomorrow; right now they are tired, and too dignified to say so.", 'The line turns left; two hunters turn right, with conviction. Nobody laughs. They have known it before, and will again once their arms stop shaking.', "Someone's shield comes up late, someone's spear early, and the line closes like a gate with a stone in it. Tired men. No harm done.", 'A stumble on the turn, a dropped shield, an apology so formal it outlasts the drill. Call it a rest day with spears.'],
    ya: ["Ya runs them round the threshing floor until they stop looking like villagers. 'Better,' she says. 'Still handsome but afraid.'", "Ya has them stalk a goat across the threshing floor in silence. The goat is not fooled. 'Closer than a villager should get,' Ya allows.", "Ya walks the line and sniffs each hunter in turn. 'Less fear,' she reports. 'More onion.' They receive it as a commendation.", "She makes them hunt her instead. Eight hunters spend an hour not finding one woman on a roof. 'You looked up once,' Ya calls. 'Progress.'"],
};
/** v0.11.174 (owner pick P7A, DR; SF1, the owner's save of v0.11.164: Ya's line four times on Day 20): each practice outcome is a set of
 *  four (the old line first, three of Fable's), drawn by the line picker (`lines.js` pickLine: every line once before any comes back,
 *  never the same twice running; the counts in the save's `lines` record, new each Coil; no new save field). */
export const drillAgain = (g, kind) => { const list = DRILL_AGAIN[kind]; const i = pickLine(g, `drill_${kind}`, list); return list[i < 0 ? 0 : i]; };

export const DAY21_BREAKFAST = 'Breakfast at Mei Lin\'s. Gruel, pickles, and nobody mentioning the road: +20 satiety.';
export function dayTwentyOneBreakfast(g) {
    if (g.flags.a1_breakfast) return [];
    g.flags.a1_breakfast = true;
    eat(g, 20);
    return [DAY21_BREAKFAST];
}
const toHour = (g, h) => { const p = clockParts(g.minutes); const dh = dayHour(g); if (dh < h && (h < 12 || dh >= 6)) g.minutes = (p.day - 1) * 1440 + h * 60; };
/** Preparations that blunt the Elder (count). */
const preps = (g) => (g.flags.a1_palisade ? 1 : 0) + (g.flags.a1_militia ? 1 : 0) + (g.flags.grove_attuned ? 1 : 0) + (g.flags.council_unity ? 1 : 0);

/* ---------- encounters ---------- */
const roadWolves = (g) => encounter(g, {
    id: 'rt_wolves', tier: 'small',
    intro: '', // v0.11.174 (RV1, L10): never shown: the stomp posture (stomp_act1.js) opens this fight at every degree (power.js prepare)
    enemies: [{ name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf (grey muzzle)', hp: 8, dc: 4, atk: 5, dmg: 4 }],
    win: 'rt_wolves_won', lose: 'rt_wolves_lost', flee: 'rt_ford',
});
const fordSerpent = (g) => encounter(g, {
    id: 'rt_serpent', tier: 'small',
    intro: '', // v0.11.174 (RV1, L10): never shown: the stomp posture (stomp_act1.js) opens this fight at every degree (power.js prepare)
    enemies: [{ name: 'Mire serpent', hp: 12, dc: 4, atk: 5, dmg: 5, dr: 1 }],
    win: 'rt_serpent_won', lose: 'rt_serpent_lost', flee: 'rt_camp',
});
const brawl = (g) => encounter(g, {
    id: 'rt_brawl', tier: 'small',
    intro: '', // v0.11.174 (RV1, L10): never shown: the stomp posture (stomp_act1.js) opens this fight at every degree (power.js prepare)
    enemies: [{ name: 'Hunter Bao', hp: 7, dc: 3, atk: 4, dmg: 2 }, { name: 'Bao\'s cousin', hp: 5, dc: 3, atk: 4, dmg: 2 }],
    win: 'rt_brawl_won', lose: 'rt_brawl_lost',
    // v0.11.82 (owner picks B1 + Y1; texts Fable's): unarmed, on GU; Yuki only in her human form
    style: 'unarmed',
    opening: `You leave the song where it is, lift your hands, and remind yourself that Bao is a neighbour, not a wolf.`,
    tail: yukiForm(g) === 'human' ? `Yuki leaves the bench, shakes out her sleeves, and takes the place on your left. Bao looks at her — slight, white-haired, a head shorter than you, ears flat against all that hair — and says, with enormous gravity, "The outlander's lady may stand with him. No one will strike her hard." "No," Yuki agrees. "No one will." Ya, delighted: "Three against two. Better."` : `Yuki watches from the wine-shop bench — curled on it, or lying along the length of it, depending on the day — with the air of a referee who has already decided nobody here is worth scoring. Through the bond: *they said fists. I don't have any. Carry on.*`,
});
const elderFight = (g) => {
    const enc = encounter(g, {
        id: 'elder', tier: 'climax',
        intro: '', // v0.11.174 (RV1, L10): never shown: the stomp posture opens this fight at every degree; preps() adds the line power.js keeps
        enemies: [
            { name: 'Outer Elder Shen Qiu', hp: 28, dc: 6, atk: 7, dmg: 5, dr: 1 },
            ...(luHanHere(g) && !g.flags.a1_militia ? [{ name: 'Lu Han', hp: 10, dc: 5, atk: 6, dmg: 4, dr: 1 }] : []),
        ],
        win: 'rt_duel_won', lose: 'rt_duel_lost',
    });
    // the palisade, the drilled hunters, the grove and a village of one mind each wear him down
    const p = preps(g);
    if (p) enc.enemies[0] = { ...enc.enemies[0], hp: Math.max(10, enc.enemies[0].hp - 4 * p), atk: enc.enemies[0].atk - (g.flags.grove_attuned ? 1 : 0) };
    if (p) enc.intro += ' Behind you, Ashfall does not kneel.'; // power.js keepTail matches these words (v0.11.174: kept)
    return enc;
};

export const BREAK_HUBS = ['rt_camp', 'rt_ashfall'];
/** v0.11.174 (owner 2026-11-14 04:38, pick SL1, SC): the Selene story at the last camp, once a Coil after the log (`log_heard`); 30 min, no
 *  gains. Appended last on `rt_camp` (prologue.js calls this after every other install), so no card's id (`rt_camp:<i>`: familiarity,
 *  the queue) moves. */
export const SELENE_CHOICE = { text: 'Tell them who Selene was named for.', show: (g) => !!g.flags.log_heard && !g.flags.rt_selene, time: 30, do: set('rt_selene'), to: 'rt_selene' };
export function installSelene(scenes) { if (scenes.rt_camp && scenes.rt_selene && !scenes.rt_camp.choices.includes(SELENE_CHOICE)) scenes.rt_camp.choices.push(SELENE_CHOICE); }

export const RETURN = {
    /* ======================================================== DAY 19 — the road home ===================================== */
    rt_start: {
        id: 'rt_start', title: 'Out of the Heart', art: 'return_road', place: `${BR} — under the dead tree`,
        enter: (g) => { toHour(g, 6); g.flags.mei_party = true; g.flags.ya_party = true; return []; },
        text: (g) => `You climb out between the roots of the dead tree into a grey morning, squinting like something newly hatched.

${seeded(g) ? g.flags.mei_carried_seed ? 'Mei Lin walks with one hand flat over her heart, where the seed-sliver rides wrapped in her sleeve. It hums there. Your Convergence hears it through her, a small green insistence under her heartbeat. *Plant me. Put me where I can sing.*' : 'Folded away in your hammerspace, in no place at all, the seed-sliver hums. It sits under your attention like a second pulse, small and green and stubborn. *Plant me. Put me where I can sing.*' : 'You bring no seed out with you, only what you saw down there. It sits behind your breastbone like a stone you swallowed.'}

Mei Lin is pale and silent, which in her is as loud as shouting. Ya is ten paces ahead already, spear across her shoulders, reading the wind with her nose.

"Two ways home," Ya says without turning round. "Long way: safe, boring, five days. My way: one day, wolves, a river with a thing in it. My way is better." She glances back and shows you more teeth than a grin needs. "And the long way bores me. When I'm bored, I bite."

"That is not a figure of speech," Mei Lin says.

"I know," you say. "I have the marks."`,
        choices: [
            { text: 'Ya\'s way. One day. Ashfall is waiting.', time: 30, to: 'rt_road' },
            { text: 'Ask Ya what exactly "a thing" in the river means.', time: 10, do: (g) => { bumpRel(g, 'Ya', 1, 0); return ['"Long. Hungry. Has a face." Ya shrugs. "Most things have one."']; }, to: 'rt_road' },
        ],
    },
    rt_road: {
        id: 'rt_road', title: 'Ya\'s Way', art: 'return_road', place: `${BR} — the deer paths`,
        text: (g) => `Ya's way is no path. It is an opinion about where a path might go, kept alive by deer, spite, and Ya herself, who has walked it since she was six. She goes through the Blackroot like a landlord through a house in arrears.

Mei Lin follows with grim, formal dignity: all her life she has been told that a forest is where herbs come from, not a place a woman runs through. ${rel(g, 'Ya').f >= 20 ? 'Twice Ya stops and waits for her. Twice Mei Lin fails to notice, with care. Ya notices the care, both times, and laughs.' : 'Ya does not wait for her. Mei Lin would sooner eat the moss than ask.'}

${byForm(g, 'Yuki rides on your shoulder and supervises.', 'Yuki pads at your side and supervises.', 'Yuki walks at your elbow and supervises.')}`,
        choices: [
            { text: 'Walk with Ya at the front.', show: daily('rt_ya_walk'), time: 60, do: (g) => { markDaily(g, 'rt_ya_walk'); return []; }, to: 'rt_ya_talk' },
            { text: 'Drop back and walk with Mei Lin.', show: daily('rt_mei_walk'), time: 60, do: (g) => { markDaily(g, 'rt_mei_walk'); return []; }, to: 'rt_mei_talk' },
            { text: 'Push on toward the birch ridge.', time: 120, to: 'rt_ambush' },
        ],
    },
    rt_ya_talk: {
        id: 'rt_ya_talk', title: 'Ya', art: 'ya_close', place: `${BR} — the deer paths`,
        text: (g) => `"You're thinking," Ya says. "I can hear it. A beetle in a box."

"I'm thinking about Selene."

"She's asleep. Sleeping is boring. Think about me." She turns and walks backwards ahead of you, sure-footed over roots she never glances at. "Your people. Made of trees. Do they all look like you? Long, sad, a mouth full of clever?"

"Not all of us. Some are short."

Her laugh is a bark, and birds leave the canopy over it. Then she is right up against you with no warning, all smoke and pine resin. "When we get to your little village," she says, "the grey people will look at me like dirt. ${likesYa(g) ? 'You don\'t. I like that. I like it a lot.' : 'You look at me like a riddle. Better than dirt. Still annoying.'}"

${both(g) ? '"And *she*," Ya adds, with a jerk of her chin back toward Mei Lin, "looks at me like a fire she wants to stand close to and is too proud to. I\'m working on it."' : ''}`,
        choices: [
            { text: '"You\'re not dirt. You\'re a menace. It\'s different."', do: (g) => { bumpRel(g, 'Ya', 4, 3); return ['A hard shove. From Ya, you are learning, that is tenderness.']; }, to: 'rt_road' },
            { text: 'Kiss her, there on the path, since she\'s standing right there.', show: (g) => rel(g, 'Ya').a >= KISS_YA || !!g.flags.ya_romance, do: (g) => { bumpRel(g, 'Ya', 3, 8); return ['She kisses back as if there were a prize for it. Knowing her, there is.']; }, to: 'rt_road' }, // v0.11.123 (EB1, KN): a kiss no longer sets her romance flag (the bar of 72 decides)
            { text: '"Leave Mei Lin alone."', show: both, do: (g) => { bumpRel(g, 'Ya', -2, 0); return ['"No," says Ya, sunny as anything. "She doesn\'t want that either. Nobody has told her yet."']; }, to: 'rt_road' },
        ],
    },
    rt_mei_talk: {
        id: 'rt_mei_talk', title: 'Mei Lin', art: 'mei_lin', place: `${BR} — the deer paths`,
        text: (g) => `Mei Lin walks with her herb-knife out. Nothing is near. She needs a thing in her hand, that's all.

"Six hundred years," she says at last. "It sang for six hundred years. Then the Sect's founder cut the heart out of it, and the world went bitter again. Every child sent up that road, every tribulation, every death: all of it out of that one cut." Her mouth twists. "My father died for a theft committed before my grandmother's grandmother was born."

You have nothing sarcastic for that. You keep pace with her and keep quiet.

${both(g) ? `Some way on she says, very low: "I keep looking at Ya." Her eyes stay on the path. "In Ashfall a woman caught looking at another woman so would be married to a goatherd in the next valley before the week was out. I ought to be ashamed." A pause. "I'm not. Explain that, mycologist."` : rel(g, 'Mei Lin').a >= 15 ? '"When we get home," she says, "my mother will ask what you are to me. I don\'t know what I\'ll tell her." A sideways look. "Help me decide."' : '"Thank you," she says finally, with the formality of someone settling a debt. "For taking me in there. For not leaving me outside."'}`,
        choices: [
            { text: '"Some things grow wherever they\'re planted. Even when the soil says no."', do: (g) => { bumpRel(g, 'Mei Lin', 3, 4); trioStep(g, 2); return []; }, to: 'rt_road' },
            { text: 'Take her hand and say nothing. She doesn\'t need a lecture.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 5); return []; }, to: 'rt_road' },
            { text: '"Your father didn\'t die for a theft. He died for a lie. We can fix the lie."', do: (g) => { bumpRel(g, 'Mei Lin', 6, 2); g.flags.mei_vow = true; return ['She says nothing for a hundred paces. Then one nod, the kind that goes at the foot of a contract.']; }, to: 'rt_road' },
            { text: 'Kiss her, there on the path, before she finds something else to hold.', show: (g) => rel(g, 'Mei Lin').a >= KISS_MEI || !!g.flags.romance, do: (g) => { const lover = !!g.flags.romance; bumpRel(g, 'Mei Lin', 3, 8); return [lover ? 'She kisses back with the knife held carefully out to one side, like a woman who was brought up properly. "Later," she says, and this time she says when.' : 'She kisses back with the knife held carefully out to one side, like a woman who was brought up properly. "We will discuss that," she says, and does not say when.']; }, to: 'rt_road' }, // v0.11.123 (EQ1, SC; Fable's D2; EB1, KN: sets no flag); last, so saved choice positions keep their lines
        ],
    },
    rt_ambush: {
        id: 'rt_ambush', title: 'The Birch Ridge', art: 'wolves', place: `${BR} — the birch ridge`,
        text: `Ya stops dead and you walk into her back. She lets it pass without a word, and that tells you how bad it is.

"Ash-wolves," she breathes. "Three. They've paced us since the tree." She tests the air and her face turns ugly. "They smell you, and whatever you brought out of that tree. Everything in this forest that eats Qi will want it."

Grey shapes slide between the white trunks. Eyes red as coals.

Mei Lin draws her knife and plants herself at your shoulder, unasked. Ya laughs under her breath, low and glad, like a woman catching the opening notes of a tune she loves.`,
        choices: [
            { text: 'Fight. Back to back.', combat: roadWolves, to: 'rt_wolves_won' },
            { text: 'A wall of bone between you and them, then down to the river.', qi: 6, check: { skill: 'Convergence Use', dc: 5 }, fly: "The wall goes up. Then so do you, with your company in tow. The wolves watch dinner leave by air and look personally wronged." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 30, to: 'rt_ford', fail: 'rt_ambush_forced' },
        ],
    },
    rt_ambush_forced: {
        id: 'rt_ambush_forced', title: 'The Birch Ridge', art: 'wolves', place: `${BR} — the birch ridge`,
        text: `Your wall rises to the knee and stops there, gapped like bad teeth. The lead wolf strolls through a gap as an inspector strolls through a failed kitchen. Ya spits on the ground between its paws. You doubt that is tactics.`,
        choices: [{ text: 'Fine. Fight.', combat: roadWolves, to: 'rt_wolves_won' }],
    },
    rt_wolves_won: {
        id: 'rt_wolves_won', title: 'White Bark, Red Snow', art: 'wolves', place: `${BR} — the birch ridge`,
        enter: (g) => { addItem(g, 'smoked_meat', 2); bumpRel(g, 'Ya', 3, 2); return ['+2 Smoked meat (Ya has one wolf out of its skin in four minutes and smokes it over a fire you never manage to find).']; },
        text: (g) => `It is over quickly and loudly. Ya finishes on top of the biggest wolf, spear down through its throat, head back, howling at the sky like a lunatic. Mei Lin cleans her knife on the grass, gravely, scandalised and satisfied in equal parts.

"You," Mei Lin tells her, "are an animal."

"Yes," says Ya, delighted. "You fight like one too. Very attractive." She hops down off the wolf. "Both of you. Very attractive. I'll be thinking about it all day."

${both(g) ? 'Mei Lin goes red to the ears and walks off at speed. Ya watches her go, patient as a hunter at a waterhole.' : 'Mei Lin walks off at speed. You decide to think about nothing whatsoever.'}`,
        choices: [{ text: 'Down to the river.', time: 90, to: 'rt_ford' }],
    },
    rt_wolves_lost: {
        id: 'rt_wolves_lost', title: 'Bitten', art: 'wolves', place: `${BR} — the birch ridge`,
        enter: (g) => { g.james.hp = Math.max(3, Math.floor(g.james.hp)); return []; },
        text: `Two of them take you down together. Then Ya arrives, teeth and spear and noise, with Mei Lin and her knife a step behind and Yuki somewhere in the thick of it, white and furious, and the wolves conclude, sensibly, that the Blackroot holds easier meals.

Ya drags you upright by the coat. "You fight like a scholar," she says, disgusted. Then her thumb, careful, takes the blood off your cheek. "Don't do that again. I'm not finished with you."`,
        choices: [{ text: 'Limp down to the river.', time: 120, to: 'rt_ford' }],
    },
    rt_ford: {
        id: 'rt_ford', title: 'The Black Ford', art: 'drowned_wood', place: `${BR} — the black ford`,
        text: `The river runs wide and slow, the colour of over-steeped tea. Drowned trees stand in it to the elbows. The ford is a row of stones you can find only when Ya points them out, and Ya points with her chin, which helps nobody.

"The thing lives in the middle," she says. "Days, it sleeps. Mostly. Walk soft. Don't think loud."

"How does one think quietly?"

"You don't. You're the loudest thinker I ever met."`,
        choices: [
            { text: 'Cross carefully, stone by stone.', check: { skill: 'GU', dc: 5 }, fly: "You cross carefully, a hand's width above every stone, and ferry the rest over the same way. The river sleeps on. Ya says you still think loud." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 40, do: (g) => [`You go stone to stone with Ya's chin for a map and your mind as quiet as you can make it, which Ya says, afterwards, is not very. Something long shifts under the brown water as Mei Lin passes over it, and doesn't wake. On the far bank ${byForm(g, "Yuki shakes a wet paw at the river,", "Yuki shakes a wet paw at the river,", "Yuki wrings out the hem of her dress at the river,")} formally, and walks on.`] /* v0.11.126 (NQ1): by her form, Fable's */, to: 'rt_camp', fail: 'rt_ford_wake' },
            { text: 'Sing a bridge of bone from stone to stone.', qi: 8, check: { skill: 'Convergence Use', dc: 5 }, fly: "You sing no bridge. You fly the ford and carry the others over, one trip each. The stones stay stones. The thing in the middle stays asleep." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, flyFree: true /* FQ1: no Qi when flown */, time: 40, do: (g) => { bumpRel(g, 'Mei Lin', 2, 0); return ['A white bridge rises stone to stone, ribbed like a backbone. Mei Lin walks over it with temple manners, eyes down, feet careful.']; }, to: 'rt_camp', fail: 'rt_ford_wake' },
        ],
    },
    rt_ford_wake: {
        id: 'rt_ford_wake', title: 'The Thing in the River', art: 'mire_serpent', place: `${BR} — the black ford`,
        text: `The next stone turns under your boot. Stones don't blink. This one does.

The river stands up.`,
        choices: [
            { text: 'Fight it in the shallows.', combat: fordSerpent, to: 'rt_serpent_won' },
            { text: 'Run for the far bank.', check: { skill: 'GU', dc: 5 }, fly: "You leave the river upwards, hauling whoever is nearest. The serpent strikes where a running man would be. You are not there, and not running." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, time: 20, to: 'rt_camp', fail: 'rt_serpent_forced' },
        ],
    },
    rt_serpent_forced: {
        id: 'rt_serpent_forced', title: 'The Thing in the River', art: 'mire_serpent', place: `${BR} — the black ford`,
        text: `You don't reach the other bank. The bank is a long way off. The serpent is not.`,
        choices: [{ text: 'Then fight.', combat: fordSerpent, to: 'rt_serpent_won' }],
    },
    rt_serpent_won: {
        id: 'rt_serpent_won', title: 'Still Water', art: 'drowned_wood', place: `${BR} — the black ford`,
        enter: (g) => { addItem(g, 'beast_core', 1); bumpRel(g, 'Ya', 4, 2); return ['+1 Murky beast core.']; },
        text: `The serpent slides back under the brown water and takes your blade with it, still lodged in its eye. The river smooths over. You would swear nothing had ever happened in it.

Ya wades in to the waist, gropes about on the bottom, and comes back with a beast core the size of a plum. She tips it into your palm like a cat presenting a mouse.

"For you," she says. "Eat it."

"I don't eat cores."

"I know. I like your face when I say it."`,
        choices: [{ text: 'Make camp on the far bank.', time: 60, to: 'rt_camp' }],
    },
    rt_serpent_lost: {
        id: 'rt_serpent_lost', title: 'Swept', art: 'drowned_wood', place: `${BR} — downstream`,
        enter: (g) => { g.james.hp = Math.max(3, Math.floor(g.james.hp)); return []; },
        text: (g) => `The serpent does not eat you. It throws you, and the river sees to the rest. You surface in a reed bed a bend downstream, coughing brown water, with ${byForm(g, "Yuki standing on your chest,", "Yuki standing over you,", "Yuki kneeling on your chest,")} soaked through and radiating fury.

When Ya and Mei Lin track you down, the serpent has gone back to bed, and Ya is laughing too hard to stand: she sits down in the mud to finish. Mei Lin does not laugh. Mei Lin goes over your ribs one at a time with grave, furious fingers, muttering words her mother would slap out of her.`,
        choices: [{ text: 'Make camp. Dry out.', time: 90, to: 'rt_camp' }],
    },
    // v0.11.129 (owner pick CB1; Fable's MAINs): the human makes four at the camp (CA) and in the talk's label (TL)
    rt_camp: {
        id: 'rt_camp', title: 'The Last Camp', art: 'trio_fire', place: `${BR} — the far bank`,
        enter: (g) => { toHour(g, 19); if (daily('rt_supper')(g)) { markDaily(g, 'rt_supper'); const out = eatBest(g, { fire: true }); if (!out.length) { eat(g, 20); return ['Ya\'s smoked meat, after you have been at it with wild garlic and a hot stone; Ya says it was already food, and holds out her hand for more: +20 satiety.']; } return out; } return []; },
        text: (g) => `Last night in the Blackroot. Tomorrow, Ashfall.

The fire is small, because Ya says big fires are for people who want to be eaten. ${byForm(g, 'The three of you sit round it with Yuki in the warmest lap available', 'The three of you sit round it with Yuki laid behind you all like a white wall, her head in the warmest lap available', 'The four of you sit round it, Yuki leaning on the warmest shoulder available')}, which tonight is ${both(g) ? 'Mei Lin\'s, and Ya keeps finding reasons to lean across her to poke the fire' : likesYa(g) ? 'Ya\'s, to everyone\'s surprise, especially Ya\'s' : 'Mei Lin\'s'}.

Your omnitool plays low, a woman singing over slow drums in no language of this world, and Mei Lin, who would deny it in council, has shifted a hand's width nearer.

Somewhere out in the dark, the dead tree stands against the stars. You can feel it at your back, the way you'd feel someone watching you leave.`,
        choices: [
            { text: (g) => byForm(g, 'Talk, the three of you, until the fire burns down.', 'Talk, the three of you, until the fire burns down.', 'Talk, the four of you, until the fire burns down.'), show: (g) => !g.flags.rt_fire_talk, time: 90, do: set('rt_fire_talk'), to: 'rt_fire_talk' },
            { text: 'Take the first watch with Ya.', show: (g) => !g.flags.rt_watch, time: 120, do: set('rt_watch'), to: 'rt_watch' },
            { text: 'Cultivate by the fire: one sit, 10 Qi.', req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'rt_camp' },
            { text: 'Sleep.', to: 'rt_dawn' },
        ],
    },
    // v0.11.129 (CB1, FT; Fable's MAINs): a beat for the human in each text; CS1 (FW): "according to Ya and Mei Lin" and her word in the joke's result
    // v0.11.174 (owner 2026-11-14 04:38, pick SL1, SC; Fable's text): James tells Mei Lin and Ya the story of Selene and Endymion
    rt_selene: {
        id: 'rt_selene', title: 'Selene', art: 'trio_fire', place: `${BR} — the far bank`,
        text: (g) => `The moon is coming up over the trees, and at your backs the dead tree stands black against the stars. Ya asked first, Mei Lin a breath behind her: who was she named for, the one asleep in there? So you tell them.

"A goddess. Older than my people's ships, older than nearly everything we have. Selene was the Moon. Not its keeper: the Moon herself, driving across the sky from dusk to dawn because that was her work."

"A woman with work," says Ya. "Go on."

"Once, on her way across, she looked down and saw a shepherd asleep on a mountainside. Endymion. Young, and very beautiful, which in these stories is always where the trouble starts. She loved him. And she knew what goddesses know about mortals: he would grow old and die, and she would not."

Mei Lin has gone quite still, her hands forgotten in her lap.

"So he was given a sleep with no end and no ageing. Some say she asked for it. Some say he chose it himself, offered any gift he liked. The tellings disagree, and everyone who could settle it is long dead. He sleeps on that mountain still, exactly as he was. And every night she comes down to him."

"Every night," Mei Lin says. "For ever." Both her hands are pressed to her collarbone. "That is the most romantic thing I have ever heard, and my mother would wash my ears out for it. A goddess. She *comes down*. To a shepherd." Her upbringing puts up a short fight and loses. "I should like to be looked at like that. Even asleep."

Ya has been frowning into the fire as she frowns at a trail. "No. Listen to what she does. He never wakes. He gives her nothing back, not a word, and the next night she is back anyway. And the next." She thumps the butt of her spear on the ground, once, hard. "Nobody thanks her. She doesn't stop. I like this one. She can hunt with me."

${byForm(g, 'Yuki has kept one yellow eye on the moon from the first word to the last. *He stays where he is put and never talks,* says the bond. *The goddess had standards.*', 'Yuki has not stirred all through it, a drift of snow with gold eyes on the moon. *A man who stays where he is put,* says the bond. *I have wanted one for years.*', 'Yuki sits straight-backed, tail laid across her lap, gold eyes on the moon. "He stays where he is put and never talks," she says. "The goddess had standards."')}

You look up. A different moon from hers, doing the same work. The deadpan, you notice, has gone off somewhere without you. "My people named one of our first seed-ships for her," you say. "Then we lost her, and nobody ever learned where. She was here. Asleep under a tree, a thousand years, and no one came down to her." The fire ticks. "Until this week."

Ya looks at the black shape behind you, then at the moon. "Late," she tells you. "But you came."`,
        choices: [{ text: 'Back to the fire.', to: 'rt_camp' }], // v0.11.174 (RV1, L2): the fire may be banked already
    },
    rt_fire_talk: {
        id: 'rt_fire_talk', title: 'Around the Fire', art: 'trio_fire', place: `${BR} — the far bank`,
        text: (g) => (both(g)
            ? `Ya invents a game: each of you confesses the worst thing you ever did. Hers is long and has a bear in it, and a bet, and by the end the bear is dead and Ya is wearing it. Yours has a grant committee in it and is, according to ${byForm(g, 'both women', 'both women', 'Ya and Mei Lin')}, no crime at all, only sad.${byForm(g, '', '', ' Yuki, in her turn, says she has never done anything wrong in her life, and looks at each of you until the subject closes.')}

Mei Lin's: she laughed at Gao Feng. With the whole herb slope looking on. "That is all," she says, glaring round the fire. "That is the worst of me. In Ashfall it nearly got me sold."

Ya stares at her. Then she leans across, takes Mei Lin's face between both hands and kisses her, slowly, in full firelight, with you three feet away.

Mei Lin, released, does not slap her. She looks at Ya. Then her eyes come round to you and stay, and you can't read them.

"There," says Ya, and licks her lip, well satisfied. "*That* is the worst thing you've done now. Congratulations."`
            : `Ya tells how she was raised, flat as a list of tracks: a wolf den, herself in it too small to keep any memory from before, the wolves feeding her; the hunter woman who found her, got bitten and kept her anyway, and taught her words, the spear, snares; the ape at the pass, when Ya was twelve. Fifteen years of forest since. "It's a better mother than most," she says, and Mei Lin, hearing all of it new, doesn't argue, to her credit.

Mei Lin tells of her father. You tell of the lab, and the blast, and the people you'll never know about.${byForm(g, '', '', ' Yuki says only that she slept through the blast, which is true, and that she has not forgiven the chamber, which is also true.')}

When the fire is down to embers, nobody is talking any more, and it's comfortable.`),
        choices: [
            { text: (g) => (both(g) ? '"Is this a good time to mention I\'m right here?"' : 'Bank the fire.'), do: (g) => { if (both(g)) { trioStep(g, 3); bumpRel(g, 'Ya', 2, 4); bumpRel(g, 'Mei Lin', 2, 4); return ['Ya laughs. Mei Lin lasts one breath longer, then laughs too, like a lock giving way.' + byForm(g, '', '', ' Yuki does not laugh. She was right here too.')]; } bumpRel(g, 'Ya', 3, 1); bumpRel(g, 'Mei Lin', 3, 1); return [`You bank the fire the way Ya taught you, so it keeps without showing. Nobody moves to sleep. Ya lies flat with her hands behind her head and says, to the stars, "That was a good one." Mei Lin, to everyone's surprise and especially her own, agrees.`]; }, to: 'rt_camp' },
        ],
    },
    rt_watch: {
        id: 'rt_watch', title: 'Night Watch', art: 'night_watch', place: `${BR} — the far bank`,
        text: (g) => `Ya keeps watch differently from you. You look. She *listens*, with all of her, head tilted, an animal at the mouth of its den. Twice she names a sound before it reaches you.

"Your village," she says at last. "Ashfall. Tomorrow. They'll want me to sleep in a house." *House* comes out of her as *coffin* would out of you. "With a roof. And rules. And old women telling me to cover my arms."

"Probably."

"I'll bite someone."

"Probably."

Quiet, for a while. Then: "${likesYa(g) ? 'With you in the house, I could stand it. Maybe.' : 'You\'re a strange one. I haven\'t decided yet whether I like you.'}" Her shoulder knocks into yours, hard enough to hurt. Nothing she has ever done to you was gentler.`,
        choices: [
            { text: 'Bump her back.', do: (g) => { bumpRel(g, 'Ya', 3, 4); return [`You bump her back, not as hard, because you'd like to keep the shoulder. She grunts. Then she leans in and stays leaning, a warm weight against your arm, and goes on listening to the dark as if nothing has changed. Twice more she names a sound before you hear it, quieter each time.`]; }, time: 60, to: 'rt_camp' },
            { text: '"You don\'t have to sleep in a house. Sleep where you like. I\'ll explain to the old women."', do: (g) => { bumpRel(g, 'Ya', 6, 2); g.flags.ya_free = true; return ['She eyes you as if the gift had teeth in it. Those are the gifts she trusts.']; }, time: 60, to: 'rt_camp' },
        ],
    },
    rt_dawn: {
        id: 'rt_dawn', title: 'Day Twenty', art: 'return_road', place: `${BR} — the last ridge`,
        enter: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; },
        text: `The last stretch you walk without talking. The forest thins. The ridge climbs. Then, below, in the grey morning: forty roofs of grey stone, chimney smoke, the tribute post with its banners hanging slack.

Ashfall.

Ya stops at the treeline as though it were a wall. Standing there she looks younger than you have ever seen her. Mei Lin, without a word, takes her hand. Ya stares at the two hands as she would at a live snake someone had passed her, and lets herself be walked down the hill.`,
        choices: [{ text: 'Go home.', time: 90, to: 'rt_arrive' }],
    },

    /* ======================================================== DAY 20 — Ashfall =========================================== */
    // v0.11.129 (CS1, RA; Fable's MAIN): the street registers the human
    rt_arrive: {
        id: 'rt_arrive', title: 'The Return', art: 'ashfall_dawn', place: P,
        text: (g) => `Ashfall receives you as it receives everything: silent, drawn up in a line, hands folded.

They have heard already. Hunters talk, and nobody now alive can name a party that walked into the heart of the Blackroot and came out again. Old Wen stands in front, his pipe cold in his fist. Behind him stands the street. No one smiles. Somebody's grandmother puts her forehead to the dust as you go by, gets up, and does it a second time to be sure.

${byForm(g, 'Their eyes go to Ya and stay there.', "Their eyes go to Yuki first: white, long as a handcart, pacing at your heel like a dog that has never heard of dogs. Ashfall has seen the outlander's beast before. It has not got smaller. They look, gravely, once, as at a matter that belongs to the outlander and is therefore not to be remarked on. Then they go to Ya and stay there.", 'Their eyes go to Yuki first — the white hair, the ears, the tail — and move on, gravely, as from a matter that belongs to the outlander and is therefore not to be looked at twice. Then they go to Ya and stay there.')} Bare arms, a necklace of wolf teeth, a spear, a scar through one eyebrow, and a grin that amounts to a challenge.

"She is with us," Mei Lin tells the whole street, loud and clear. No woman of Ashfall says such a thing. The street makes a note.

${g.flags.sky_witness ? 'And you they regard as they did once the sky had come for you and left again: as weather.' : 'And you, the stranger who walked into the forest and walked back out, they regard like a sum that has stopped adding up.'}`, // v0.11.130 (YB1, RA; Fable's MAIN): the street sees the great root-kin
        choices: [
            { text: 'Go to Old Wen first. Formally.', time: 30, to: 'rt_wen' },
            { text: 'Mei Lin\'s mother is in the doorway. Face her.', time: 30, to: 'rt_mother' },
        ],
    },
    rt_wen: {
        id: 'rt_wen', title: 'Old Wen', art: 'council', place: `${P} — the elder's house`,
        text: (g) => `Old Wen takes the whole account without one interruption: the roots, the hall, Selene asleep in her hull of grown wood, the founder who cut the heart out of the world's filter and named it cultivation.

When you are done he sits unmoving, long enough for the tea to go cold.

"Then everything we have knelt to," he says at last, "is built on a grave." His voice stays level. "Our children went up that road to feed a thief."

He puts his cup down with great care.

"At dusk the hunters saw Sect colours on the switchbacks: a column on foot, a dozen and more. Only an Outer Elder walks with so many." His good eye settles on you. "Shen Qiu. Tomorrow he will be at our gate. He will have heard of the tribulation that refused to fall${g.flags.ending === 'fought' ? ', and of the disciples you sent home bleeding' : ''}. He will want to see with his own eyes what you are."

"And then?"

"And then he will decide whether Ashfall goes on existing." Old Wen bows his head to you, formally. He has never done that before. "Whatever you carried out of that tree: if it is to be planted, plant it today."`,
        choices: [{ text: 'Go and plant it.', time: 20, do: (g) => { bumpRel(g, 'Old Wen', 4, 0); return []; }, to: 'rt_plant' }], // v0.11.139 (owner pick MW1, MB): Wen +4
    },
    // v0.11.129 (CB1, MO; Fable's MAIN): the mother sees the human and counts four
    rt_mother: {
        id: 'rt_mother', title: 'The Mother', art: 'dinner', place: `${P} — Mei Lin's house`,
        text: (g) => `Mei Lin's mother looks her daughter over: filthy, and scratched from nine days in the deep forest. She looks at you.${byForm(g, '', '', ' She looks at Yuki, ears and all, and lets that wait.')} At Ya she looks longest of all.

"You took my daughter into the Blackroot," she tells you, without raising her voice.

"Strictly, she took me."

"Be silent." She turns to Mei Lin. "The street says you came down the hill with this wild woman's hand in yours, before the whole village."

"I did," says Mei Lin.

"The street says the hand is the least of it. It was not there, and has never let that hinder it." Ya opens her mouth, plainly to supply what the street lacks; one look from Mei Lin's mother, of the kind that turns a charging boar, shuts it again. "I have listened to Ashfall on the subject of you since you were fourteen, daughter. You laugh at the wrong men. You walk with the wrong strangers. You will be the death of this house's name."

Nobody breathes.

"Your father," she says finally, "was exactly the same." She moves out of the doorway. "Wash. All ${byForm(g, 'three', 'three', 'four')} of you. You smell as if the forest had died on you."`,
        choices: [{ text: 'Wash. Then the seed.', time: 60, do: (g) => { bumpRel(g, 'Mei Lin', 3, 0); bumpRel(g, 'Village', 2, 0); bumpRel(g, 'Mother', 4, 0); return []; }, to: 'rt_plant' }], // v0.11.139 (owner pick MW1, MB): Mother +4
    },
    rt_plant: {
        id: 'rt_plant', title: 'The Seed', art: 'seed_planting', place: P,
        text: (g) => `${seeded(g)
            ? g.flags.mei_carried_seed ? 'Mei Lin takes the seed-sliver out of her sleeve and lays it in your hand; her fingers leave it last. In daylight it is smaller than you remember: a splinter of pale heartwood no longer than your hand, warm, faintly pulsing. Half the village has followed, at a distance, in total silence.' : 'You draw the seed-sliver out of your hammerspace. In daylight it is smaller than you remember: a splinter of pale heartwood no longer than your hand, warm, faintly pulsing. Half the village has followed you, at a distance, in total silence.'
            : 'No seed. What you have is a shard of Selene\'s hull, a thousand years old and warm yet, and a theory. Half the village has followed you, at a distance, in total silence, to watch you test it.'}

Where does it go?

Mei Lin says *by the well*, where everyone will pass it daily. Old Wen, propped on his stick, says nothing; his eye travels to the old shrine at the end of the street, the one whose god has had its face chiselled away. Ya says *in the forest, obviously, where it belongs*, and nobody answers her.`,
        choices: [
            { text: 'By the well, where the whole village draws water.', do: (g) => { g.flags.grove_site = 'well'; return []; }, to: 'rt_plant_sing' },
            { text: 'In front of the faceless shrine. Give the god a new face.', do: (g) => { g.flags.grove_site = 'shrine'; bumpRel(g, 'Village', 3, 0); return []; }, to: 'rt_plant_sing' },
            { text: 'At the edge of the village, facing the forest. Ya isn\'t wrong.', do: (g) => { g.flags.grove_site = 'edge'; bumpRel(g, 'Ya', 4, 1); return []; }, to: 'rt_plant_sing' },
        ],
    },
    rt_plant_sing: {
        id: 'rt_plant_sing', title: 'The First Song', art: 'seed_planting', place: P,
        text: `You kneel, dig with your bare hands, lay it in the black earth and cover it. Then you set your palm flat on the ground and do what your people do, what you have not done since you left home: you *sing* to it. Not aloud. With the Convergence, on the deep note the Hearth Trees of home hum back to every child who walks beneath them.

Nothing. The street holds its breath with you.

Then the ground under your hand answers.`,
        choices: [
            { text: 'Give it everything you have.', qi: 10, check: { skill: 'Convergence Use', dc: 5, band: 'challenging' }, time: 60, do: (g) => { g.flags.grove = 'strong'; addItem(g, 'seed_sliver', -1); return ['The note sinks into the earth as a root would. No echo returns. It has stayed down there.']; }, failDo: (g) => { g.flags.grove = 'weak'; addItem(g, 'seed_sliver', -1); return ['The note shakes, and holds. Below your hand, something has begun to listen.']; }, to: 'rt_ashfall' },
            { text: 'Sing gently. Let it find its own way.', time: 90, do: (g) => { g.flags.grove = 'gentle'; addItem(g, 'seed_sliver', -1); return []; }, to: 'rt_ashfall' },
        ],
    },
    rt_ashfall: {
        id: 'rt_ashfall', title: 'Ashfall, the Last Day', art: 'ashfall_dawn', place: P,
        text: (g) => {
            const h = hour(g);
            return `${h < 12 ? 'Morning.' : h < 17 ? 'Afternoon.' : 'Evening is coming on.'} Tomorrow, Shen Qiu.

The village works as frightened people work once they have agreed not to show it: carefully, correctly, in silence. ${g.flags.grove ? `Round the patch of earth you sang to stands a ring of children, at a respectful distance, watching bare ground as if it might bite.` : ''}

${g.flags.a1_palisade ? 'The bone palisade runs white along the north lane.' : ''} ${g.flags.a1_militia ? 'On the threshing floor the hunters are drilling.' : ''} ${g.flags.ya_brawled ? 'Hunter Bao is pointedly not looking at Ya. Ya is pointedly looking at Hunter Bao.' : ''}`;
        },
        choices: [
            { text: 'Raise a palisade of bone along the north lane.', show: (g) => !g.flags.a1_palisade && hour(g) < 19, qi: 8, check: { skill: 'Convergence Use', dc: 5, band: 'challenging' }, time: 150, do: set('a1_palisade'), failDo: () => ['It rises patchy, more gap than wall. Try again before dark.'], to: 'rt_ashfall' },
            { text: (g) => (g.flags.a1_militia ? DRILL_AGAIN.label : 'Drill the hunters one last time.'), show: (g) => hour(g) < 19, time: 30, to: 'rt_hunters' }, // v0.11.156 (DM1, OM): open again for practice once the militia is ready
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
        text: (g) => `The hunters fall into line for you unasked. Eight of them, ${g.flags.spears ? 'white bone spearheads on their shafts,' : 'old boar spears in their fists,'} every face set like stone. None of them has ever stood against the Crimson Lotus. They have decided to try.

From the fence Ya chews a grass stem and supplies commentary. "That one holds his spear like a broom. That one's afraid. That one's handsome but afraid. That one—"

"Ya."

"I'm *helping*."`,
        choices: [
            { text: 'Drill them hard: shields of bone, spears behind, nobody alone.', check: { skill: 'GU', dc: 5, band: 'challenging' }, time: 150, do: (g) => { if (g.flags.a1_militia) return [drillAgain(g, 'hard')]; g.flags.a1_militia = true; bumpRel(g, 'Village', 4, 0); return ['By the end they move as one body. Whether one body is enough against an Elder, nobody asks aloud.']; }, failDo: (g) => { if (g.flags.a1_militia) return [drillAgain(g, 'hardFail')]; bumpRel(g, 'Village', 1, 0); return ['It never quite locks. Tomorrow they will stand all the same. That is the worst of it.']; }, to: 'rt_ashfall' },
            { text: 'Let Ya teach them how she hunts. What could go wrong.', time: 150, do: (g) => { if (g.flags.a1_militia) return [drillAgain(g, 'ya')]; g.flags.a1_militia = true; bumpRel(g, 'Ya', 4, 2); bumpRel(g, 'Village', -2, 0); return ['One dislocated finger, two black eyes, and eight hunters who have begun to move like a thing that is hungry. The elders of Ashfall are gravely offended. It works.']; }, to: 'rt_ashfall' },
        ],
    },
    rt_council: {
        id: 'rt_council', title: 'Council', art: 'council', place: `${P} — the elder's house`,
        enter: set('council_done'),
        text: `The elders of Ashfall sit in a ring on Old Wen's floor: six old men and two old women in their best grey robes, with faces cut from the same plank. They speak in turn. No one interrupts anyone. It lasts as long as dignity requires, which is very long.

The miller says Ashfall should hand the Elder whatever he asks for, you included. The midwife says that a village which gives you up has told the Sect it can be bargained with for ever. The oldest hunter says nothing and studies the floor.

Then every one of them looks at you.`,
        choices: [
            { text: 'Speak plainly: the truth about the tree, the founder, the poisoned Qi. Let them decide with open eyes.', check: { skill: 'GU', dc: 5 }, time: 90, do: (g) => { g.flags.council_unity = true; bumpRel(g, 'Village', 6, 0); return ['You finish into silence. Then they bow, one after another, and not to you: to what you told them. Tomorrow Ashfall stands as one village.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['They hear you out and thank you in the correct words. Behind the miller\'s eyes, sums are being done.']; }, to: 'rt_ashfall' },
            { text: 'Offer to go with the Elder willingly, if it spares the village.', time: 60, do: (g) => { g.flags.offered_self = true; bumpRel(g, 'Village', 8, 0); bumpRel(g, 'Mei Lin', -2, 0); return ['The elders bow very low. Mei Lin, once she hears, has not one word for you for an hour.']; }, to: 'rt_ashfall' },
        ],
    },
    rt_grove: {
        id: 'rt_grove', title: 'The Grove', art: 'grove_sprout', place: P,
        enter: set('grove_visit'),
        text: (g) => `It is up already.

Not one sapling but a ring of them: seven white stems, knee-high, their leaves opening pale green and so thin that the daylight passes through, veined like the inside of a wrist. ${g.flags.grove === 'strong' ? 'They hum.' : 'Hold your breath and you can hear them hum.'} The air round them is *clean*. You can taste it, sweet and empty: of all the air you have breathed on this world, the only air with nothing dead in it.

The children have edged nearer. One small girl holds her palm out flat above a leaf, not touching, taking the warmth. Her grandmother hisses at her to come away. The girl does not budge.

${byForm(g, "Yuki walks into the middle of the ring, lies down, and purrs so loudly that the leaves tremble.", "Yuki walks into the middle of the ring, lies down, and purrs so loudly that the leaves tremble.", "Yuki walks into the middle of the ring, sits down with her tail curled in her lap, and purrs so loudly that the leaves tremble.")}`,
        choices: [
            { text: 'Sit among them and cultivate. Let the song in.', check: { skill: 'Convergence Use', dc: 4 }, noFam: true /* v0.11.141 (RW1, NF): cultivation or rest by its own rule */, time: 60, do: (g) => { g.flags.grove_attuned = true; const gain = sitGain(g, 2); g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10); return [`The grove takes your Qi once round its ring and hands it back rinsed. Saturation +${Math.round(gain * 10) / 10}% (${g.james.saturation}%), no Qi spent.`]; }, failDo: () => ['You try. Tomorrow is too loud in you; nothing else gets in.'], to: 'rt_ashfall' },
            { text: 'Kneel by the girl and show her how to feel the song.', do: (g) => { bumpRel(g, 'Village', 5, 0); return ['Her grandmother looks on, rigid as a gatepost. Then, joint by joint, she kneels too.']; }, time: 30, to: 'rt_ashfall' },
        ],
    },
    rt_ya_village: {
        id: 'rt_ya_village', title: 'Ya in Ashfall', art: 'ya_fight', place: `${P} — outside the wine shop`,
        enter: set('ya_village'),
        text: `You find Ya outside the wine shop, nose to nose with Hunter Bao, a man the size of a door and at present the colour of a beetroot.

As best you can reconstruct it: Bao told her to cover her arms before decent women. Ya told him what she would do with his. Bao called her a beast in human skin. Ya thanked him. Then she said a thing about his mother that you decline to repeat, and now two cousins are rising from the bench with the grave, unhurried care of men about to defend a family's honour.

"James!" Ya calls, eyes still on Bao. "Good. Watch this."`,
        choices: [
            { text: 'Step between them. Talk everyone down, formally, the way Ashfall likes it.', check: { skill: 'GU', dc: 5 }, time: 30, do: (g) => { bumpRel(g, 'Village', 3, 0); bumpRel(g, 'Ya', -3, 0); return ['You bow to Bao, regret the conduct of "my guest, who comes from very far away", and steer Ya round the corner before her sentence can end. She sulks for an hour. As sulks go, it is a masterwork.']; }, fail: 'rt_brawl_start', to: 'rt_ashfall' },
            { text: 'Stand beside her. If they want a fight, it\'s two against two.', do: (g) => { bumpRel(g, 'Ya', 5, 4); return []; }, to: 'rt_brawl_start' },
        ],
    },
    rt_brawl_start: {
        id: 'rt_brawl_start', title: 'Honour', art: 'ya_fight', place: `${P} — outside the wine shop`,
        text: (g) => `Bao removes his jacket, folds it with care and gives it to the elder cousin to mind; the younger steps to his elbow. Even a brawl, it seems, has its ritual in Ashfall. Ya removes nothing. Ya has already hit him.${byForm(g, '', " Yuki looks at the wine-shop bench, which both cousins have now left, and steps up onto it. Ritual has its uses.", '')}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Fists only. Nobody dies the day before the Elder.', combat: brawl, to: 'rt_brawl_won' }],
    },
    rt_brawl_won: {
        id: 'rt_brawl_won', title: 'Settled', art: 'ya_fight', place: `${P} — outside the wine shop`,
        enter: (g) => { g.flags.ya_brawled = 'won'; bumpRel(g, 'Ya', 3, 3); return []; },
        text: `Bao sits in the dust with a split lip and his dignity entire; the cousin beside him has kept rather less of his. In his own time Bao stands, takes his jacket back from the cousin who minded it, puts it on, and bows to Ya: the full, formal hunter's bow, the one they give a boar that died well.

Ya has no idea what to do with it. She stares. Then she bows back, badly, like someone who has only ever watched it done.

"Tomorrow," Bao says gravely, "stand on my left. I am slow on the left."

"Everyone's slow on the left," says Ya. She is grinning, though.`,
        choices: [{ text: 'Back to the preparations.', time: 30, to: 'rt_ashfall' }],
    },
    rt_brawl_lost: {
        id: 'rt_brawl_lost', title: 'Settled, Badly', art: 'ya_fight', place: `${P} — outside the wine shop`,
        enter: (g) => { g.flags.ya_brawled = 'lost'; g.james.hp = Math.max(3, g.james.hp); return []; },
        text: (g) => `You finish in the horse trough. Ya finishes on the wine-shop roof: on purpose, she maintains. Bao collects his jacket from the cousin who minded it, and all three depart with the stiff contentment of men whose honour has been mended by the correct procedure.

Mei Lin arrives and takes inventory: you in the trough, Ya on the roof, half the street looking on with folded hands.

"One hour," she says. "I leave you alone for *one hour*."${byForm(g, '', "\n\nFrom the wine-shop bench, most of which she is, Yuki yawns to the back teeth. *Fists only,* says the bond. *Your rule. I kept it for you.*", "\n\nYuki is neither in the trough nor on the roof. She stands where she stood, straightening one sleeve. \"Fists only,\" she says. \"Your rule. I kept it for you. You're welcome.\"")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Climb out with what dignity you have left.', time: 30, to: 'rt_ashfall' }],
    },

    /* ======================================================== night of Day 20 ============================================ */
    rt_evening: {
        id: 'rt_evening', title: 'The Last Supper Before', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { toHour(g, 19); if (daily('rt_evening')(g)) { markDaily(g, 'rt_evening'); eat(g, 30); return ['Millet, greens, and every good thing the house had put by for a better occasion: +30 satiety.']; } return []; },
        text: (g) => `Mei Lin's mother serves four bowls ${byForm(g, 'and a saucer for the cat', 'and, after a long look at Yuki, the stew pot', 'and a fifth for Yuki, with the saucer beside it out of habit')}. She serves Ya last, and Ya, who has been watching the old woman all evening like a wolf watches a fire, says "thank you" in a small voice that nobody at the table has heard her use before. "Nine days in the Blackroot," the old woman informs the pot, "and my daughter comes home fatter than she left."

Nobody mentions tomorrow. Everybody thinks about it.

Afterwards the mother goes to bed with pointed loudness. The lamp burns. ${byForm(g, 'Yuki takes the stove.', 'Yuki takes the floor in front of the stove. All of it.', 'Yuki takes the bench by the stove.')}

${trioReady(g)
            ? 'Ya and Mei Lin sit on either side of you. Neither of them is looking at the other. Both of them are very aware of the other. The air in the room is so thick you could sing bone out of it.'
            : both(g)
                ? 'Mei Lin is on one side of the table. Ya is on the other. Both of them are looking at you. Neither is looking at the other. It is, you reflect, a lot.'
                : likesYa(g) ? 'Ya is watching you across the lamp with an expression that is not at all subtle. Mei Lin looks at Ya, looks at you, and goes up to the loft with a grave, private smile.'
                    : likesMei(g) ? 'Ya stretches, yawns hugely, and announces she is going to sleep in a tree. She winks at you on the way out. Mei Lin turns the lamp down.'
                        : `Ya goes out to sleep in the grove ${byForm(g, 'with the cat-shaped hole in the leaves', 'with the tiger-sized hole in the leaves', 'with the place Yuki flattened in the leaves')}. Mei Lin says goodnight with grave courtesy. It is a quiet house.`}`,
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

She stands, rounds the table and sits on the floor between your knees and Mei Lin's, cross-legged, a council elder about to hand down a ruling.

"Tomorrow a very old man comes to kill us, maybe. So I'll say it, and you two will be honest, for once in your stiff little lives." She points at Mei Lin. "You want him." At you. "You want her. And you both want me, because I'm wonderful." A shrug. "In the forest nobody counts. Wolves don't count. Why are you counting?"

Several things cross Mei Lin's face. Pride. Fury. Fear: real fear, that of a woman who has had *what the street says* in her ears all her life. "In Ashfall," she says, very low, "a woman who did this—"

"Ashfall kneels to a thief," says Ya. "You said so. You said all of it is built on a grave." She reaches up and takes the other woman's hand. "So build something else."

Mei Lin looks at you. She is waiting, you understand, for the joke: the one that would let her out.

For once in your life, you don't make it.`,
        choices: [
            { text: '"I want both of you. I have for days. I\'m forty and I\'ve stopped pretending."', do: (g) => { g.flags.throuple = true; trioStep(g, 4); bumpRel(g, 'Mei Lin', 6, 15); bumpRel(g, 'Ya', 6, 15); g.flags.romance = true; g.flags.ya_romance = true; return []; }, to: 'rt_trio_night' },
            { text: 'Take Mei Lin\'s other hand, so she\'s holding both of you. Let her decide.', do: (g) => { g.flags.throuple = true; trioStep(g, 4); bumpRel(g, 'Mei Lin', 8, 15); bumpRel(g, 'Ya', 4, 15); g.flags.romance = true; g.flags.ya_romance = true; return []; }, to: 'rt_trio_night' },
            { text: '"Not tonight. Ask me again when we\'re alive the day after tomorrow."', do: (g) => { bumpRel(g, 'Ya', -2, 0); bumpRel(g, 'Mei Lin', 3, 0); return ['Ya groans like a dying boar and falls flat on the floorboards, arms out. Mei Lin lets out a breath, very quietly. Neither one lets go of your hands.']; }, to: 'rt_quiet_night' },
        ],
    },
    rt_trio_night: {
        id: 'rt_trio_night', title: 'Build Something Else', art: 'trio', place: `${P} — the herb loft`,
        text: `Mei Lin says nothing at all. The lamp ticks. Then she laughs: the laugh Ashfall has been punishing her for since she was a girl, sharp and too loud and entirely her own. She hauls Ya up off the floor by the hand and kisses her, then turns and kisses you, hard, like someone settling an argument.

"If my mother hears one sound," she says, "I will kill you both."

"Liar," says Ya, already on the ladder to the loft.

Up there it smells of dried mint and sun-warmed hay. Ya, it turns out, has opinions on everything, who goes where included, and no shame whatever about announcing them. Mei Lin, it turns out, has been listening to those opinions for days and has brought a few of her own. Somewhere in the middle your Parallel Cognition stops trying to keep count and simply falls silent, which it has never done in your life.

The rest of the night belongs to the three of you.

*

Toward dawn you wake with Mei Lin's head on your chest and Ya sprawled over you both like a felled tree, one fist closed in Mei Lin's hair, snoring. From downstairs, through the bond, comes one exhausted thought from Yuki: *I am moving to the grove. Permanently.*`,
        choices: [{ text: 'A few more hours. Then the Elder.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    rt_ya_night: {
        id: 'rt_ya_night', title: 'The Grove at Night', art: 'grove_sprout', place: `${P} — the grove`,
        text: (g) => `Ya is flat on her back among the stems of the little grove, hands under her head, white leaves at her elbows and the whole sky of stars over her.

"Took you long enough," she says. "Lie down."

You lie down. The grove hums. The air is clean.

"Tomorrow the old man comes," she says. "Maybe he kills you. Maybe he kills me. So I'm not waiting." She rolls onto you all at once, as she does everything, and grins down through the hair falling round both your faces. "You can say no. You won't."

You don't.

She is every bit as unrestrained as you expected and twice as funny, and at one point she bites you, sees your face, and has to stop for laughing. Later, much later, she lies with her ear on your chest and listens to your heart as she listens to the forest, and says, very quietly, "${g.flags.throuple ? '' : 'You\'re mine now. I don\'t share.'}${both(g) ? ' Well. I share with *her*. Maybe. Ask me tomorrow.' : ''}"`,
        choices: [{ text: 'Sleep in the grove. The song keeps you warm.', do: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 5, 12); sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    rt_mei_night: {
        id: 'rt_mei_night', title: 'The Loft', art: 'roof', place: `${P} — the herb loft`,
        text: (g) => `${g.flags.romance && g.flags.mei_first === 'raft' ? 'The herb loft. Mint and hay and the lamp turned low. Four walls this time, and a floor that stays where it\'s put. She climbs the ladder ahead of you as if she\'d planned that too.' : g.flags.romance ? 'The herb loft again. Mint and hay and the lamp turned low. That other night feels a hundred years gone.' : 'The herb loft. Mint and hay and the lamp turned low. She climbs the ladder ahead of you and does not look back to see if you\'re following.'}

"Tomorrow the Elder comes," Mei Lin says, undoing her jacket with steady fingers. "My mother calls me shameless. So does the street. Tonight I intend to be exactly as shameless as they say."

She is. Frank, unhurried, laughing against your mouth at the worst possible moments, and then not laughing at all. Your threads fall silent one after another until a single one is left, and it is thinking about her.

*

Much later she lies with her head on your shoulder, one finger following the line of your collarbone. "If he takes you," she says, "I'm coming after you. Don't argue."

"I wouldn't dream of it."

"Good."`,
        choices: [{ text: 'Sleep. A few hours of this.', do: (g) => { g.flags.romance = true; bumpRel(g, 'Mei Lin', 5, 10); sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    rt_quiet_night: {
        id: 'rt_quiet_night', title: 'By the Stove', art: 'village_night', place: `${P} — Mei Lin's house`,
        text: (g) => `${byForm(g, 'You bed down by the stove, and Yuki settles on your chest.', 'You bed down by the stove, and Yuki rests her chin on your breastbone.', 'You bed down by the stove, your back against Yuki\'s.')} The grove comes in through the shutters, faint, a sound beneath the other sounds, like a tune from when you were small that you can no longer name.

Sleep mostly stays away. You run tomorrow through all nine threads, and all nine hand back one answer: *you don't know*. ${both(g) ? 'Once, in the dark, Ya and Mei Lin are talking low in the loft overhead; then a laugh, smothered fast. You file it under the day after tomorrow.' : ''}

${byForm(g, 'Toward dawn Yuki puts her nose against your chin. *Stop thinking,* says the bond. *I am trying to sleep on you.*', 'Toward dawn Yuki\'s nose bumps your chin. *Stop thinking,* says the bond. *I am trying to sleep on you.*', 'Toward dawn Yuki\'s elbow finds your ribs. "Stop thinking," she says, without turning over. "I am trying to sleep."')}`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },

    /* ======================================================== DAY 21 — Shen Qiu =========================================== */
    rt_elder: {
        id: 'rt_elder', title: 'Outer Elder Shen Qiu', art: 'elder_arrives', place: `${P} — the tribute post`,
        enter: (g) => { toHour(g, 8); return dayTwentyOneBreakfast(g); }, // v0.11.152 (owner pick E1, BK): Day 21's breakfast, as every other morning
        text: (g) => `He comes up the road at the hour of the dragon, on foot, twelve disciples in crimson at his back ${luHanHere(g) ? 'and Lu Han at his right hand, with a face like a pond iced over' : 'and, conspicuously, no Lu Han'}.${g.flags.gao_broken ? ' Last of all, in an open litter, his sword arm still strapped to his chest, comes Gao Feng. He is here to watch. His lips never stop moving, the same few words round and round, and you are fairly sure they are your name.' : ''}

Outer Elder Shen Qiu is old as mountains are old. His white hair is bound up under a crown of red jade. His robe is the red of blood gone dry, with one lotus embroidered on it; his hands are folded into its sleeves, and from the left one shows the end of a closed fan of red lacquer. He walks slowly, and the air keeps step with him: heavy, sweet, rotten, this world's poisoned Qi gathered round him so thick that the roadside grass turns grey where he has passed.

At the tribute post he stops. He considers Ashfall: ${g.flags.a1_palisade ? 'the white palisade, ' : ''}${g.flags.a1_militia ? 'the hunters in their line with their spears grounded, ' : ''}the people who have not knelt. Then his face turns, slowly, toward the grove, and at last something moves in it.

"So," he says. The voice is soft, courteous, and has no warmth in it anywhere. "It is true. Someone has planted a song in my mountains." His eyes arrive at you. "And the sky came for you, and went away ashamed. I have lived three hundred years, and I did not expect to see that." His head inclines, by exactly one degree.

Then he does what all of them do, and reaches for you with his Qi-sense. This one is an Outer Elder's: it arrives like weather, like the pressure ahead of a storm, and goes over you, through you, into every corner you own.

It comes back empty. There is no root in you for it to find, no sea, no core: a mortal in a strange coat.

Now Shen Qiu's face does change. Not to anger. To something far older and colder: three hundred years of knowing precisely what stands before him, and here stands the exception. "I cannot feel you," he says, very softly. "Do you understand? Not hidden. Not sealed. *Absent.* As if Heaven had forgotten to write you down." His sleeves settle. "Tell me what you are, young man, and I will decide what to do with it."

Behind you Mei Lin's hand closes on her knife. Ya's lips peel back from her teeth. Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, has gone perfectly still.`,
        choices: [
            { text: 'Fight him. Here, in front of the grove.', combat: elderFight, to: 'rt_duel_won' },
            { text: 'Parley. Formally. Give him the face he needs and none of what he wants.', time: 30, to: 'rt_parley' },
            { text: 'Show him the truth: take him to the grove and let him feel clean Qi for the first time in three hundred years.', req: (g) => (g.james.qi >= 12 ? true : 'needs 12 Qi'), time: 30, to: 'rt_truth' },
            { text: 'Go with him. Spare Ashfall.', show: (g) => !!g.flags.offered_self, to: 'rt_taken' },
        ],
    },
    rt_parley: {
        id: 'rt_parley', title: 'Parley', art: 'elder_parley', place: `${P} — the tribute post`,
        text: (g) => `You bow properly, as Old Wen taught you: the exact depth a guest owes a great elder of a great sect. Shen Qiu notes it. He also notes that it is one degree too shallow. You intended that.

Then you talk. About the Ouroboros Axiom, carefully. About Selene, more carefully still. About the grove, and what clean Qi would be worth to a sect that loses one disciple in thirty to tribulation: no threat in it, only a merchant turning a jewel in the light.

${g.flags.ending === 'bluff' ? 'He has not forgotten the bluff at the tribute post; Lu Han\'s report was thorough. It costs you.' : ''}${g.flags.ending === 'fought' ? 'He knows you bled his disciples. He leaves it unmentioned, which is worse.' : ''}${g.flags.council_unity ? ' At your back stand the elders of Ashfall, all eight in a row, and their silence says everything for them.' : ''}`,
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
        text: (g) => `Shen Qiu lets you finish, with flawless courtesy. Then, gently, as one explains a thing to a child: "The Crimson Lotus does not negotiate with its property."

His disciples string themselves out along the road.${byForm(g, '', " The two on Yuki's side stop a spear's length further off than the others. She watches them do it without getting up.", " The two who draw Yuki's side look at the ears, then at each other. \"Further back,\" she advises, and they have obeyed before they wonder why.")}

"Kneel," says Shen Qiu, "and come with me, and the grove may stand: it is beautiful, and I respect that. Refuse, and I burn it, and the village with it, and take you regardless." His hands fold into his sleeves. "Those are your choices. They are generous."`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [
            { text: 'Refuse. Fight.', combat: elderFight, to: 'rt_duel_won' },
            { text: 'Kneel. Go with him. Ashfall lives.', to: 'rt_taken' },
        ],
    },
    rt_truth: {
        id: 'rt_truth', title: 'The Truth', art: 'grove_sprout', place: `${P} — the grove`,
        text: (g) => `You don't argue. You walk to the grove. Shen Qiu lets you get ten paces before he follows, out of curiosity or contempt or a thing older than either, and he follows alone.

The white stems stand taller this morning, waist-high. Stand still and the song can be heard. ${g.flags.grove === 'strong' ? 'It is strong. Inside the ring the air is so clean it almost hurts.' : 'It is faint. It is there.'}

"Step inside," you say. "Breathe."

He studies you without hurry. Then, slowly, he steps into the ring.

You watch it hit him. Poison three hundred years deep, every herb, every pill, every core, every rival he ever ate, and now, as it has not been since he was a boy, the air in his lungs has nothing in it at all. What crosses that ancient face you would not have believed it could hold.

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
        text: `The note passes through him as daylight passes through paper.

After it fades Shen Qiu stays in the ring, eyes shut, long enough for the disciples on the road to start looking at one another. When his eyes open they are wet. He seems not to notice.

"I was nine," he says, very quietly, "when they gave me my first pill. My mother wept with pride." He regards the white stems. "I had forgotten that air had a taste before that."

He walks back out to his disciples and does not look at you again. At the tribute post he halts and speaks without turning, in the formal voice of a sect elder giving judgment.

"Ashfall is under the protection of the Outer Court until the spring. No tribute. No collectors. Whoever touches this grove answers to me." A pause. "The Sect Master will not agree. When he learns of this, he will come himself." A second pause, longer. "Grow it faster, Bone-Maker."

He goes down the road. If Lu Han is among the red robes behind him, he is the one who looks back, once, white to the lips.`,
        choices: [{ text: 'Breathe out.', to: 'a1_end' }],
    },
    rt_accord: {
        id: 'rt_accord', title: 'Accord', art: 'elder_parley', place: `${P} — the tribute post`,
        enter: (g) => { g.flags.a1_outcome = 'accord'; bumpRel(g, 'Village', 10, 0); return []; },
        text: (g) => `Shen Qiu stays silent so long that one disciple shifts his feet. The Elder's glance stills him like a slap.

"One disciple a season," he says at last. "Of my choosing. Ashfall's tribute is suspended until the spring, when the Outer Court will review the matter." His head tilts, one degree. "You will instruct my disciple in whatever this is. Honestly. Should I learn that you have lied to him, I will return, and I will not be courteous."

"Understood."

"I doubt it." He turns to leave, and stops. "You bowed one degree too shallow. Deliberately." A thing that is nearly an expression crosses his face. "Next time, bow correctly. You will need friends in the Outer Court, Bone-Maker, before the Sect Master hears your name."

${luHanHere(g) ? 'He leaves Lu Han behind. "Your first student," he says. Lu Han\'s face does not move at all, and from that you know he would rather be dead.' : 'He leaves a disciple behind: a boy of seventeen or so, grave and terrified, who bows to you so deeply that his forehead all but meets his knees.'}`,
        choices: [{ text: 'Breathe out.', to: 'a1_end' }],
    },
    rt_duel_won: {
        id: 'rt_duel_won', title: 'The Elder Bleeds', art: 'elder_duel', place: `${P} — the tribute post`,
        enter: (g) => { g.flags.a1_outcome = 'victory'; bumpRel(g, 'Village', 20, 0); return []; }, // v0.11.174 (RV1, L10): no kill: he lets Shen Qiu live
        text: (g) => `It ends with Shen Qiu on one knee in the road, a white wraithbone blade at his throat, his red jade crown in the dust and blood in his beard.

Ashfall is not breathing. Neither is the road. Three hundred years old, and an Outer Elder of the Crimson Lotus kneels to a mycologist in a lab coat.

"Kill me," Shen Qiu says calmly, "and the Sect Master comes with every disciple he has and burns this valley down to the bedrock."

"And if I don't?"

He weighs you. "Then I go home in disgrace, and the Sect Master comes anyway, a little later and a little angrier, and I am a laughing-stock for what remains of my life." His mouth moves, very slightly. "I think you will let me live. You have that face."

You let him live. You do not let him go whole: three needles, very exact, through the meridian knots of his right arm while he watches, and a fourth through the tendon of the hand that holds the fan. He will cultivate again. Not this season. "I don't kill people," you tell him. "I find it gives them time to think." ${likesYa(g) ? 'Ya swears at you about it for an hour.' : ''} His disciples carry him down the road. He does not look back. ${luHanHere(g) ? 'Lu Han does: once, at you, with a look you cannot read.' : ''}

Ashfall has just declared war on the Crimson Lotus. The whole street knows it. Nobody says so. Old Wen lights his pipe, and his hands are steady.`,
        choices: [{ text: 'Breathe out.', to: 'a1_end' }],
    },
    rt_duel_lost: {
        id: 'rt_duel_lost', title: 'Down', art: 'elder_duel', place: `${P} — the tribute post`,
        enter: (g) => { g.james.hp = 1; return []; },
        text: (g) => `You are flat on your back in the road, with no memory of the fall. Shen Qiu stands over you, his breathing unhurried, the fan shut again.

"Interesting," he says. "Most interesting. No training, no discipline, and still you cost me both hands." He regards you with what in another man would be approval. "The Sect Master will want you alive."${byForm(g, '', "\n\nOne hand was for you. The other, you gather, was for Yuki, who lies ten paces up the road, a long white shape getting its legs under it one at a time.", "\n\nOne hand was for you. The other, you gather, was for Yuki: she is on one knee ten paces up the road, hair across her face, ears flat. \"Both hands,\" she tells the dust, with precision. \"I counted.\"")}

Behind him Ashfall has not stirred. ${g.flags.a1_militia ? 'The hunters\' spears are levelled.' : 'People stand holding hoes and kitchen knives.'} Mei Lin's knife is out, and her face has no colour left in it. Ya strains, snarling, in the grip of ${g.flags.ya_brawled === 'won' ? 'Hunter Bao, of all people' : 'three hunters'}.

"Call them off," says Shen Qiu, "and I will not burn the grove. Or do not, and watch."`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Call them off. Go with him.', to: 'rt_taken' }],
    },
    rt_taken: {
        id: 'rt_taken', title: 'Taken', art: 'elder_arrives', place: `${P} — the tribute post`,
        enter: (g) => { g.flags.a1_outcome = 'taken'; bumpRel(g, 'Village', 25, 0); return []; },
        text: (g) => `You walk out to him. At your back the street makes a sound you will carry for the rest of your life: no cry, no word, only forty houses drawing breath together.

Shen Qiu inclines his head to the exact depth courtesy requires. "The grove stands," he says. "Ashfall's tribute is suspended for as long as you remain a guest of the Sect." *Guest.* ${byForm(g, '"You may bring the cat. The Sect Master will want to see the cat."', '"You may bring the beast. The Sect Master will want to see the beast."', '"You may bring the root-kin. The Sect Master will want to see the root-kin."')}

Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, gives him a look of perfect contempt.

${g.flags.throuple ? 'Mei Lin and Ya come to the edge of the road together, hands locked until the knuckles show white. "We are coming after you," Mei Lin says, formally, before the whole Sect. "Both of us." Ya says nothing. Ya looks at Shen Qiu and smiles, and the nearest disciple steps back.'
        : likesMei(g) || likesYa(g) ? `${likesMei(g) ? 'Mei Lin' : 'Ya'} comes to the edge of the road. "I'm coming after you," ${likesMei(g) ? 'she' : 'she'} says, and does not care who hears. "Don't argue."` : 'Mei Lin bows to you, very formally: the bow owed to a man who will not be coming back. Ya spits on the Sect\'s road and walks into the forest without a backward glance. You suspect you have not seen the last of her.'}

You go down the road between the crimson robes. Behind you, faint under the wind, the grove is singing.`,
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
                ? `The Sect's road climbs into the mountains for three days. On the second night, from a high switchback, you look back. Far below, in the black sea of the Blackroot, one point of pale light marks where Ashfall is. The grove is growing.

${g.flags.throuple || g.flags.romance || g.flags.ya_romance ? 'Down there, people you love are packing for a journey. You are entirely certain of it. Nothing else is certain at all.' : 'You find that you are not afraid. You are curious. A sect that has been eating a world\'s heart for four centuries is, after all, a very interesting organism.'}`
                : `${o === 'victory' ? 'The Sect does not return that week, nor the week after. Ashfall works, and waits, and puts an edge on bone.' : o === 'revelation' ? 'The Sect does not return. Once, at dusk, a lone figure in red is seen on the switchbacks, looking down at the grove until the light goes. Then the switchbacks are empty.' : 'Every morning the disciple of the Outer Court sits in the grove with his eyes shut, trying to breathe, and weeps, and could not tell you why.'}

The grove grows. Waist-high, then shoulder-high: seven white trunks in a ring, the song stronger with each night. After dark the children of Ashfall sit inside it and cannot say why they feel as they do. The old people keep well away. Then, one at a time, they stop keeping away.

${love}`;
            return `${head}

${o === 'taken' ? 'Up here the grove is out of hearing. You lie awake and listen regardless; and from far below, deep in the Blackroot where the dead tree stands, something very faint answers what you were listening for.' : `There are nights when you lie awake listening, and beneath the grove's song you believe you catch a second one, far off and very thin: out in the deep Blackroot, under the dead tree, something answers.`}

${byForm(g, 'Yuki, on your chest, opens one yellow eye. *Not dead,* says the bond. *Asleep. As you should be.*', 'Yuki, her head on your chest, opens one gold eye. *Not dead,* says the bond. *Asleep. As you should be.*', 'Somewhere near, Yuki opens one gold eye. "Not dead," she says into the dark. "Asleep. As you should be."')}

— **End of Act 1.** —`;
        },
        end: true,
        choices: [],
    },
};
