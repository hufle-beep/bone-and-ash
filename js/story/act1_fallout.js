/**
 * ACT 1, PART 1 — "Fallout" (Days 8–10). The Crimson Lotus answers the tribute; Outer Elder Shen Qiu is named for
 * Day 21. Ashfall prepares. On Day 9 Ya walks out of the Blackroot. On Day 10 the expedition to the Old Tree is
 * planned, and at dawn on Day 11 it leaves (→ 'bl_start').
 */
import { addItem, eat, condense, advance, sleepUntil, jamesHpMax, hasItem, awardYukiFightXp, yukiForm, nightRest } from '../core/game.js';
import { daily, markDaily, hour, day, eatBest, pantry, foodCount } from './common.js';
import { encounter, rel, likesMei, likesYa, trioStep, bumpRel } from './act1_common.js';

const P = 'Ashfall Hamlet';
const late = (g) => hour(g) >= 19;
const ending = (g) => g.flags.ending || 'bluff';
const meiLovers = (g) => !!g.flags.romance;
const yaHere = (g) => !!g.flags.ya_met;
/** Day 8, 9 or 10. */
const dd = (g) => Math.max(8, Math.min(10, day(g)));
const toEvening = (g) => (dd(g) >= 10 ? 'fo_farewell' : 'fo_supper');

/* ---------------- encounters ---------------- */
const spyFight = (g) => encounter(g, {
    id: 'sect_watcher', tier: 'small',
    intro: 'The watcher drops his rice cake, draws a short sword with the speed of a man who has practised it every morning of his life, and bows before he attacks. Of course he does.',
    enemies: [{ name: 'Sect watcher', hp: 9, dc: 5, atk: 6, dmg: 3, dr: 1 }],
    win: 'fo_spy_won', lose: 'fo_spy_lost', flee: 'fo_ashfall',
});
const wolfFight = (g) => encounter(g, {
    id: 'palisade_wolf', tier: 'small',
    intro: 'Two ash-wolves come over the gap in the stakes, one high and one low, the way wolves do when they have already agreed on who dies first.',
    enemies: [{ name: 'Ash-wolf', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Ash-wolf (lame)', hp: 6, dc: 4, atk: 5, dmg: 3 }],
    win: 'fo_wolf_won', lose: 'fo_wolf_lost', flee: 'fo_morning',
    night: true, // v0.11.92 (X1): a fight after bed costs sleep
});
const yaBrawl = (g) => encounter(g, {
    id: 'ya_brawl', tier: 'small',
    intro: 'Ya grins, spits in the dust, and comes at you low and laughing, the way a dog comes at another dog it has decided to like.',
    enemies: [{ name: 'Ya', hp: 15, dc: 6, atk: 7, dmg: 3 }],
    win: 'ya_won', lose: 'ya_lost',
    // v0.11.82 (owner picks B1 + Y1; texts Fable's): a weapon spar, Yuki only in her human form
    style: 'spar',
    tail: `The terms, agreed in the lane in front of forty houses: no armour, her spear against whatever you can sing, and the first one in the dust stays there.\n\n${yukiForm(g) === 'human' ? `Yuki steps off the fence, shakes out her sleeves, and stands at your left without being asked. Ya looks her up and down the way she looked at you — a head shorter, white-haired, ears flat, a dress you could not fight a goat in — and her grin gets wider. "The cat too? Good. Spear against two nothings." Old Hu considers Yuki for a long, formal moment, then inclines his head the exact depth owed to a second: "The matter stays between the outlander and the wild woman. The lady may stand with him. No one will strike her." "No," Yuki agrees, aloud. "No one will."` : `Yuki takes the fence — on it, or along the whole top of it, depending on the day — and does not so much as twitch an ear. Through the bond: *his face, your fight. I don't do proxies. Try not to bleed on the coat.*`}`,
});

/* ---------------- the Sect's answer, by ending ---------------- */
const OPENING = {
    fought: `The morning after the morning you broke the tribute, Ashfall wakes up as if it had been told it is going to die and is now waiting, politely, to find out when.

Nobody sings at the well. Nobody argues over the bucket. The red lotus banners are gone from the tribute post — somebody took them down in the night, folded them with great care, and laid them at the shrine, because even the defiance in this village is done with proper ceremony.

At the hour of the dragon, a single rider comes down the switchbacks. He wears crimson. He does not dismount. He hands Old Wen a lacquered tube, bows exactly the correct depth for a messenger addressing a headman, and rides away without a word.

Everyone looks at you.`,
    bluff: `You wake to the sound of a gong. Ashfall does not own a gong.

Down at the tribute post stands a young man in pale crimson silk, flanked by two attendants holding a canopy over his head, although it is not raining and has not rained for a week. He has a scroll. He has the expression of a man who has rehearsed every word of what he is about to say in front of a mirror, possibly for days.

The whole village has come out, and the whole village is on its knees in the dust, because that is what one does when the Crimson Lotus brings a gong.

"I'm assuming," you say to Yuki, "that this is about the senior from the hidden sect."

Through the bond: *you should not have lied so well.*`,
    paid: `Lu Han comes back alone.

No collectors, no banners, no gong. Just the inner disciple in his deep-red robe, walking down the road at first light like a man going to visit a grave. Where he passes, doors close very quietly.

He stops in front of Mei Lin's house, where you are sitting on the step with a bowl of gruel and a cat. He looks at you for a long time. Then, without asking, he sits down on the step beside you, which in this world is roughly equivalent to taking off his clothes in the street.

"The hairpin," he says. "I have not slept since you made it."`,
    lost: `You wake with Lu Han's boot-print still on your chest, as a bruise, and forty houses' worth of grim, careful kindness waiting downstairs. Somebody has left eggs on the step. Somebody has mended your coat in the night, badly, with red thread, because red is the only thread they had.

The ultimatum stands: a year, and then the Bone-Maker walks up the road, or the village burns. Ashfall has accepted this the way it accepts winter. Nobody mentions it. Everybody thinks about it.

At the hour of the dragon, a rider in crimson comes down the switchbacks with a lacquered tube, and it becomes clear that the year has just been shortened.`,
};
const LETTER = {
    fought: `Old Wen reads it in the elder's house, in front of the council, in a voice like a man reading his own epitaph.

*The Crimson Lotus records that the village of Ashfall, in the ninth month, raised its hand against the Sect. The Sect records also the name of the stranger who led it. In accordance with the law of the mountain, the Outer Hall will send Outer Elder Shen Qiu to Ashfall on the twenty-first day, to weigh the village and the stranger, and to pass sentence.*

He rolls it up. Nobody speaks. A hunter at the back is quietly weeping, without any change of expression, the way men weep here.

"Thirteen days," says Old Wen. "They give us thirteen days because the law says a village must have time to put its affairs in order before it is weighed." He looks at you. "That is considered a mercy."

"It's very well organised," you say. "I'll give them that."`,
    bluff: `The young man in pale silk unrolls his scroll and reads, in a high, carrying, utterly sincere voice:

*To the honoured Senior who graces the village of Ashfall: the Crimson Lotus, having been informed of its discourtesy, offers its humble apology, and invites the Senior to the Outer Court, to drink tea with the Outer Hall, so that the Sect may learn the name of the Senior's mountain and the depth of the Senior's cultivation.*

He bows. The attendants bow. The canopy bows.

"And if the Senior has other plans?" you ask.

The young man looks genuinely pained. "Then Outer Elder Shen Qiu will come to the Senior, on the twenty-first day. The Elder is very eager to drink tea." He hesitates. "The Elder's tea is… very strong, Senior."`,
    paid: `"The material," Lu Han says quietly, "is not bone. Not any bone I know. When I hold it, my Qi goes *still*. Clean. As if someone had wiped a window." He turns his hands over and looks at them. "I have eaten grass since I was six. Pills since I was twelve. I have never been clean for a single breath in my life, until I held your hairpin."

He is not threatening you. That's what makes it frightening.

"I gave it to the Outer Hall," he says. "As I was bound to. Outer Elder Shen Qiu took it from my hands himself. He will come here on the twenty-first day to ask you where it came from." A pause. "He will not ask the way I am asking."

He stands, bows — deeper than he should to a stranger — and walks back up the road alone.`,
    lost: `Old Wen reads it in the elder's house.

*The Outer Hall has learned that on the day of the tribute, the sky over Ashfall gathered tribulation for a stranger and withdrew without striking. Heaven does not withdraw. The Outer Hall wishes to understand why. Outer Elder Shen Qiu will come to Ashfall on the twenty-first day to collect the Bone-Maker in person, and to observe him, as one observes a portent.*

"Ten days sooner than the year," says the head hunter, Old Hu, in a flat voice. "Because Heaven was afraid of him."

"I don't think Heaven was afraid," you say. "I think Heaven was confused. It's different."

Nobody in the room finds this reassuring. Nobody in the room ever finds anything you say reassuring. You are starting to take it personally.`,
};

export const BREAK_HUBS = ['fo_ashfall'];

export const FALLOUT = {
    fo_start: {
        id: 'fo_start', title: 'Day Eight', art: (g) => (ending(g) === 'bluff' ? 'envoy' : 'ashfall_dawn'), place: P,
        enter: (g) => { if (g.james.hp < 1) g.james.hp = 1; return []; },
        text: (g) => `${OPENING[ending(g)]}

${g.flags.sky_witness ? 'And under all of it, the thing nobody says out loud: they saw the sky come for you, and leave. Children stop playing when you walk past. A grandmother touches your sleeve and then touches her forehead, as if your sleeve were a shrine.' : ''}${g.flags.gao_broken ? ' Somewhere up the mountain, a disciple named Gao Feng is lying in the Sect\'s infirmary with his sword arm in splints and his meridians cracked, telling anyone who will listen that a mortal did it. Nobody believes him. He has started swearing oaths about you in the ancestral hall, which you gather is a big deal.' : g.flags.gao_turned ? ' You think of Gao Feng, limping home with what you told him. You wonder what he told them.' : ''}`,
        choices: [
            { text: 'Hear what they have to say.', to: (g) => ({ fought: 'fo_letter', bluff: 'fo_envoy', paid: 'fo_lu_han', lost: 'fo_letter' }[ending(g)]) },
        ],
    },
    fo_letter: {
        id: 'fo_letter', title: 'The Letter', art: 'council', place: `${P} — the elder's house`,
        text: (g) => LETTER[ending(g) === 'lost' ? 'lost' : 'fought'],
        choices: [
            { text: '"Then we use the thirteen days."', do: (g) => { bumpRel(g, 'Village', 4, 0); bumpRel(g, 'Old Wen', 3, 0); return []; }, to: 'fo_elder_named' },
            { text: '"I could leave. If I\'m gone, there\'s nobody for him to weigh."', to: 'fo_leave_offer' },
        ],
    },
    fo_leave_offer: {
        id: 'fo_leave_offer', title: 'An Offer Refused', art: 'council', place: `${P} — the elder's house`,
        text: (g) => `Silence. Then Old Wen sets the lacquered tube on the table with great precision, exactly parallel to the edge.

"If you leave," he says, "the Elder will weigh the village without you. Ashfall raised its hand. Ashfall will be weighed. That is the law." He looks at you with his one good eye. "You did not make us raise our hand, Bone-Maker. We did that. Do not insult us by taking it away."

${g.flags.romance ? 'Mei Lin, at the back of the room, doesn\'t say anything. She doesn\'t have to. You can feel the look on the side of your face like sunburn.' : 'At the back of the room, Mei Lin snorts — out loud, in council — and three elders turn to stare at her. She stares back. Somebody\'s grandmother makes a small, scandalised sign against bad luck.'}`,
        choices: [{ text: '"Understood. I\'m staying."', do: (g) => { bumpRel(g, 'Village', 6, 0); bumpRel(g, 'Mei Lin', 3, 2); return []; }, to: 'fo_elder_named' }],
    },
    fo_envoy: {
        id: 'fo_envoy', title: 'An Invitation', art: 'envoy', place: `${P} — the tribute post`,
        text: (g) => LETTER.bluff,
        choices: [
            { text: 'Stall, like a senior: "This one is in seclusion. Return when the plum trees flower."', check: { skill: 'GU', dc: 5 }, do: (g) => { g.flags.envoy = 'stalled'; bumpRel(g, 'Village', 3, 0); return ['He bows so deeply that one of the attendants has to steady the canopy.']; }, failDo: (g) => { g.flags.envoy = 'doubted'; return ['He bows, but his eyes linger on your coat a moment too long. The Elder will hear that the senior wears a strange coat.']; }, to: 'fo_elder_named' },
            { text: 'Refuse plainly: "I don\'t drink tea with people who tax children."', do: (g) => { g.flags.envoy = 'refused'; bumpRel(g, 'Village', 5, 0); return ['The young man goes white, then bows anyway. Manners, here, survive anything.']; }, to: 'fo_elder_named' },
            { text: 'Ask him, quietly, what the Elder is like.', check: { skill: 'GU', dc: 4 }, do: (g) => { g.flags.envoy = 'asked'; g.flags.elder_intel = true; return ['"Patient," he whispers. "He has never lost a duel. He has never needed to hurry one."']; }, failDo: (g) => { g.flags.envoy = 'asked'; return ['He only says: "The Elder is very correct, Senior." He looks terrified saying even that.']; }, to: 'fo_elder_named' },
        ],
    },
    fo_lu_han: {
        id: 'fo_lu_han', title: 'Lu Han, Alone', art: 'envoy', place: `${P} — Mei Lin's doorstep`,
        text: (g) => LETTER.paid,
        choices: [
            { text: 'Call after him: "Lu Han. If you want to be clean again, you know where I am."', do: (g) => { g.flags.lu_han_seed = true; return ['He stops. He does not turn round. After a moment he walks on.']; }, to: 'fo_elder_named' },
            { text: 'Let him go. A man like that has to come back on his own.', to: 'fo_elder_named' },
        ],
    },
    fo_elder_named: {
        id: 'fo_elder_named', title: 'Thirteen Days', art: 'ashfall_dawn', place: P,
        text: (g) => `So that's the shape of it. On the twenty-first day, Outer Elder Shen Qiu of the Crimson Lotus will walk down that road, and everything you've done here gets weighed.

You ask around, carefully, about Shen Qiu. People lower their voices. They describe him the way you'd describe the weather in a mountain pass: a fact, not a person. He is old. He is courteous. He is the reason the village beyond the next ridge doesn't exist any more.

${g.flags.elder_intel ? 'He has never lost a duel. He has never needed to hurry one.' : ''}

And one more thing, which Old Wen tells you over tea in a voice so low you have to lean in: the envoys, the watchers, Lu Han — every one of them has reported the same impossible thing. *They cannot sense him.* A man who refuses tribulation, who sings bone out of air, and to every cultivator's sense he is an empty chair. "To us, that is not a mystery," Old Wen says. "It is an insult. The Elder will not come to talk to a mortal. He will come to find out what is hiding inside one."

Meanwhile, every time the wind comes from the north, your Convergence turns its head like a dog hearing its name. North, past the Hollow, past the roots. The dead tree. It hasn't stopped singing at you since the tribute. If anything, it's getting louder.

Thirteen days. You can spend them building walls. Or you can go and find out what's calling.`,
        choices: [{ text: 'Start with the walls. Today, at least.', to: 'fo_ashfall' }],
    },

    /* ---------------- the day hub ---------------- */
    fo_ashfall: {
        id: 'fo_ashfall', title: (g) => `Ashfall — Day ${dd(g)}`, art: 'village', place: P,
        text: (g) => {
            const h = hour(g);
            const when = h < 11 ? 'Morning. Hammers, axes, the steady chant of people working because the alternative is thinking.' : h < 15 ? 'Midday. The palisade line is chalked out in white across the barley.' : h < 19 ? 'Late afternoon. Smoke from forty chimneys, and nobody laughing at the well.' : 'Dusk. Lamps behind every shutter.';
            const days = 21 - dd(g);
            return `${when} ${days} days until the Elder.

${yaHere(g) ? (g.flags.ya_party ? 'Ya is asleep on the shrine roof with one leg dangling, apparently on purpose, to offend the god.' : 'Somewhere in the village, Ya is offending someone. You can tell by the silence.') : ''}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''}`;
        },
        choices: [
            { text: 'Build the bone palisade: stakes along the barley line.', show: (g) => daily('a1_palisade')(g) && !late(g), time: 20, to: 'fo_palisade' },
            { text: 'Sit in council with Old Wen.', show: (g) => daily('a1_council')(g) && !late(g), time: 20, to: 'fo_council' },
            { text: 'Drill the hunters.', show: (g) => daily('a1_drill')(g) && !late(g), time: 10, to: 'fo_drill' },
            { text: 'Run the clinic at the well.', show: (g) => daily('a1_clinic')(g) && !late(g), time: 10, to: 'fo_clinic' },
            { text: 'Find Mei Lin.', show: (g) => daily('a1_mei')(g) && !late(g), time: 20, to: 'fo_mei' },
            { text: 'Pay your respects to Mei Lin\'s mother.', show: (g) => !g.flags.fo_mother && !late(g), time: 20, to: 'fo_mother' },
            { text: 'Find Ya. Follow the sound of offended people.', show: (g) => yaHere(g) && daily('a1_ya')(g) && !late(g), time: 20, to: 'fo_ya_time' },
            { text: 'Someone has been watching the village from the ridge. Go and see.', show: (g) => !g.flags.spy && dd(g) <= 9 && hour(g) < 16, time: 60, to: 'fo_spy' },
            { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'fo_ashfall' },
            { text: 'Eat at the communal pot.', show: (g) => daily('a1_pot')(g) && g.james.satiety < 80 && !late(g), time: 30, do: (g) => { markDaily(g, 'a1_pot'); eat(g, 25); return ['Barley and bean stew, served in silence, with a small bow: +25 satiety.']; }, to: 'fo_ashfall' },
            { text: 'Cultivate behind the shrine: one sit, 10 Qi.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'fo_ashfall' },
            { text: 'Rest an hour.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'fo_ashfall' },
            { text: (g) => (dd(g) >= 10 ? 'Evening. The last one in Ashfall for a while.' : 'Evening. Go home to Mei Lin\'s.'), show: (g) => hour(g) >= 16, time: 20, to: toEvening },
        ],
    },

    fo_palisade: {
        id: 'fo_palisade', title: 'The Palisade', art: 'palisade', place: `${P} — the barley line`,
        enter: (g) => { markDaily(g, 'a1_palisade'); return []; },
        text: (g) => `${(g.flags.palisade || 0) === 0
            ? 'The hunters have marked the line with chalk and string, perfectly straight, as if straightness itself were a defence. Maybe here it is. Every man and woman who can lift a mallet is waiting for you to begin.'
            : (g.flags.palisade || 0) === 1 ? 'Yesterday\'s stakes stand along a third of the line, white and sharp and faintly humming. The children have already started touching them for luck. Nobody has told them to stop.' : 'Two thirds of the line. From the ridge, Ashfall is starting to look like something with teeth.'}

You sing the stakes out of the ground and out of the old bone the hunters bring you — jackal, boar, the long shin of something nobody wants to name. Each one costs Qi and a little of something else, the part of you that is still surprised you can do this.`,
        choices: [
            { text: 'Sing a full stretch of the line.', qi: 6, check: { skill: 'Convergence Use', dc: 4 }, time: 180, do: (g) => { g.flags.palisade = (g.flags.palisade || 0) + 1; bumpRel(g, 'Village', 4, 0); return [`Palisade: ${g.flags.palisade}/3 stretches.`]; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['Half the stakes come out brittle. The hunters replace them with wood, without comment, which is worse than comment.']; }, to: 'fo_ashfall' },
            { text: 'Teach the hunters to set your stakes in pits, angled, the way the jackals taught you.', check: { skill: 'GU', dc: 4 }, time: 150, do: (g) => { g.flags.palisade = (g.flags.palisade || 0) + 1; return [`Palisade: ${g.flags.palisade}/3 stretches. The pits are ugly. The pits will work.`]; }, failDo: () => ['The ground is stone under a foot of soil. You learn this the hard way.'], to: 'fo_ashfall' },
            { text: 'Not now.', to: 'fo_ashfall' },
        ],
    },

    fo_council: {
        id: 'fo_council', title: 'Council', art: 'council', place: `${P} — the elder's house`,
        enter: (g) => { markDaily(g, 'a1_council'); return []; },
        text: (g) => (dd(g) === 8
            ? `The council of Ashfall is seven old people around a table, drinking tea so weak it is barely a rumour of tea, deciding whether forty houses live or die.

They are discussing whether the children should be sent over the pass to the salt villages. They discuss it with complete formality: each speaker stands, bows to Old Wen, states the arguments for and against, sits. Nobody interrupts. Nobody raises their voice. A woman whose three grandchildren are on the list speaks for sending them in a voice so steady it could hold up a roof.

Old Wen turns to you. "The stranger will speak."`
            : `Second council. The tea is weaker. The children's question has been settled; they stay, because the salt villages would sell them to the Sect for less than Ashfall's tribute.

Today they want to know about the Old Tree. Every hunter on the council has the same story from his grandfather: the forest's heart once *sang*, and the singing made the beasts gentle and the herbs clean. Then the Sect came, before the Sect was the Sect, and the singing stopped.

"Your cat," Old Wen says, "faces north when she sleeps. So do you."`),
        choices: [
            { text: (g) => (dd(g) === 8 ? 'Speak for the children: keep them close, keep them hidden, and build.' : '"It\'s calling me. I think it was one of ours — my people\'s. I need to see it."'), check: { skill: 'GU', dc: 4 }, time: 120, do: (g) => { g.flags[`council${dd(g)}`] = true; bumpRel(g, 'Old Wen', 4, 0); bumpRel(g, 'Village', 3, 0); return ['The council bows to you, one after another. It takes a long time. Nobody hurries.']; }, failDo: (g) => { g.flags[`council${dd(g)}`] = true; return ['You say it badly. They hear it anyway, and bow anyway, slightly less deeply.']; }, to: 'fo_ashfall' },
            { text: 'Listen. Say nothing. Learn how these people decide things.', time: 120, do: (g) => { g.flags[`council${dd(g)}`] = true; bumpRel(g, 'Old Wen', 2, 0); return ['Old Wen notices your silence, and approves of it, which is the first time anyone here has approved of anything you did.']; }, to: 'fo_ashfall' },
        ],
    },

    fo_drill: {
        id: 'fo_drill', title: 'The Hunters', art: 'drill', place: `${P} — the threshing floor`,
        enter: (g) => { markDaily(g, 'a1_drill'); return []; },
        text: (g) => `The hunters are waiting in two straight lines when you arrive, spears grounded, faces set. Old Hu, the head hunter, salutes you as if you were a general, which you find more alarming than any wolf.

${(g.flags.militia || 0) >= 2 ? 'They remember everything you taught them before the tribute. They practise it with the terrible seriousness of men who expect to need it.' : 'They have never fought anything that could think. They are about to.'}${yaHere(g) ? '\n\nYa watches from the woodpile, eating a raw turnip and heckling. Old Hu pretends with enormous dignity that she does not exist.' : ''}`,
        choices: [
            { text: 'Drill the line: spears behind bone shields, nobody alone.', check: { skill: 'GU', dc: 4, band: 'challenging' }, time: 150, do: (g) => { g.flags.militia = (g.flags.militia || 0) + 1; bumpRel(g, 'Village', 3, 0); return ['They move like one animal now. A grim, silent animal.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['A spear goes through a shield and nearly through a cousin. Nobody laughs. Nobody here ever laughs.']; }, to: 'fo_ashfall' },
            { text: 'Spar with Yuki in front of them, so they see what fast looks like.', check: { skill: 'GU', dc: 5 }, time: 90, do: (g) => ['The hunters watch in absolute silence. Afterwards Old Hu bows to the cat.', ...awardYukiFightXp(g, 'standard')], failDo: (g) => { g.james.hp -= 2; return ['Yuki wins. Decisively. −2 HP.', ...awardYukiFightXp(g, 'standard')]; }, to: 'fo_ashfall' },
            { text: 'Not today.', to: 'fo_ashfall' },
        ],
    },

    fo_clinic: {
        id: 'fo_clinic', title: 'The Well', art: 'healer', place: `${P} — by the well`,
        enter: (g) => { markDaily(g, 'a1_clinic'); return []; },
        text: (g) => `The line at the well is longer than before the tribute, and different: not fevers now but hands torn on stakes, a split scalp from a falling beam, a boy who tried to sharpen a scythe the way the hunters sharpen spears.

They wait in order of age, oldest first, and refuse to change the order even when the boy is bleeding. When you object, an old woman explains to you, kindly, the way you'd explain to a child, that the order is the order.

${hasItem(g, 'jade_bracket') ? 'You have jade bracket. It will have to stretch.' : 'You have no fungus left. You have clean water, a bone needle and fifteen years of reading about infection.'}`,
        choices: [
            { text: 'Work through the line properly.', check: { skill: 'GU', dc: 4, bonus: (g) => (hasItem(g, 'jade_bracket') ? 2 : 0) }, time: 150, do: (g) => { if (hasItem(g, 'jade_bracket')) addItem(g, 'jade_bracket', -1); g.flags.clinics = (g.flags.clinics || 0) + 1; bumpRel(g, 'Village', 6, 0); return ['Everyone walks home. The boy walks home last, because he is youngest, and he walks home alive.']; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return ['Mostly. You\'ll check the split scalp again tonight.']; }, to: 'fo_ashfall' },
            { text: 'Treat the boy first, and take the old woman\'s disapproval.', time: 120, check: { skill: 'GU', dc: 3 }, do: (g) => { bumpRel(g, 'Village', 1, 0); bumpRel(g, 'Mei Lin', 2, 1); g.flags.clinics = (g.flags.clinics || 0) + 1; return ['The old woman watches you break the order with the expression of someone watching a temple burn. Mei Lin, passing, catches your eye and almost smiles.']; }, failDo: () => ['You get to the boy first. It doesn\'t help as much as you wanted.'], to: 'fo_ashfall' },
            { text: 'Not today.', to: 'fo_ashfall' },
        ],
    },

    fo_mei: {
        id: 'fo_mei', title: 'Mei Lin', art: (g) => (dd(g) === 9 ? 'herb_slope' : 'mei_lin'), place: (g) => (dd(g) === 9 ? `${P} — the herb slopes` : `${P} — Mei Lin's house`),
        enter: (g) => { markDaily(g, 'a1_mei'); return []; },
        text: (g) => {
            if (dd(g) === 8) return `You find her in the herb loft${g.flags.loft_burned ? ' — what\'s left of it, the charred beams scrubbed and oiled as if scrubbing could unburn them —' : ''}, sorting roots with the ferocity of someone who has decided not to think.

"Thirteen days," she says without looking up. "Everyone is being very calm. My mother has been calm since dawn. The headman is calm. Old Hu is so calm I think he might be dead." She slams a bundle down. "I am going to scream, James. In the street. Just to hear someone do it."

"That," you say, "would be extremely bad for your reputation."

"I *have* a reputation. It's 'that Mei Lin.' Everyone says it like that. *That* Mei Lin." ${meiLovers(g) ? 'She finally looks at you, and something in her face goes soft and furious at once. "And now I\'m *that* Mei Lin who took a foreign demon up to her loft. Did you know they\'re praying for my soul? Out loud. At the shrine."' : 'She finally looks at you. "Laughing in public. Speaking in council. Talking to foreign demons. It adds up."'}`;
            if (dd(g) === 9) return `The herb slopes in the late morning. She cuts Ninefold grass with quick, angry strokes and talks the whole time, which for Mei Lin is how thinking sounds.

${yaHere(g) ? '"That woman," she says, "asked me this morning if you were *mine*. In the street. In front of Grandmother Lao." Slash. "And when I said that is not a question decent people ask, she asked if I was *decent*, then, because she\'d heard otherwise." Slash. "And then she *laughed*. Do you know what it\'s like to have someone laugh in this village? It sounded like glass breaking."\n\nShe stops cutting. "I liked it," she says, very quietly, as if confessing to a crime. "That\'s the worst part."' : 'She doesn\'t mention the Elder once, which is how you know it\'s the only thing she\'s thinking about.'}`;
            return `The last day. She's packing a basket that is clearly for a journey, and pretending it isn't.

"I'm coming," she says before you can open your mouth. "Don't. I know every herb between here and the Hollow, and you know nothing, and *she* knows nothing that grows that doesn't bleed. Somebody on this expedition has to know which mushrooms not to eat."

"I'm a mycologist."

"Then you'll be very useful for identifying the ones that killed us."`;
        },
        choices: [
            { text: (g) => (dd(g) === 8 ? '"Scream, then. I\'ll stand next to you so they look at me instead."' : dd(g) === 9 ? 'Tell her she\'s allowed to like it.' : '"I wasn\'t going to stop you. I was going to ask you to come."'), time: 120, do: (g) => { bumpRel(g, 'Mei Lin', 4, 4); return likesMei(g) && likesYa(g) ? trioStep(g, 1) : []; }, to: 'fo_ashfall' },
            { text: (g) => (dd(g) === 8 ? 'Help her sort roots. Say nothing. Let her be angry at the roots.' : 'Help her work. Let her talk.'), time: 120, do: (g) => { bumpRel(g, 'Mei Lin', 5, 1); addItem(g, 'jade_bracket', 1); return ['+1 Jade bracket (she slips it into your hand without comment).']; }, to: 'fo_ashfall' },
        ],
    },

    fo_mother: {
        id: 'fo_mother', title: 'Mei Lin\'s Mother', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { g.flags.fo_mother = true; return []; },
        text: (g) => `Mei Lin's mother receives you sitting very straight on a mat, in her best jacket, as if you had come to negotiate a marriage or a funeral. Possibly both.

"My daughter laughs in the street," she says. "She speaks in council. She ${meiLovers(g) ? 'has taken a stranger to her bed and does not lower her eyes about it' : 'walks beside a stranger and does not lower her eyes about it'}. In Ashfall a girl like that is not a scandal. She is a *warning*. Mothers point at her." A pause. "Her father laughed, too."

She pours tea. She pours yours first, which is either a great honour or an accusation.

"When the Elder comes, they will look for someone to make an example of. They always do. They look for the one who laughs."`,
        choices: [
            { text: '"Then I\'ll make sure they look at me."', do: (g) => { bumpRel(g, 'Mei Lin', 2, 0); bumpRel(g, 'Mother', 6, 0); g.flags.mother_vow = true; return ['She bows to you. Low. Lower than to the envoy.']; }, time: 60, to: 'fo_ashfall' },
            { text: '"She\'s the only person in this village who isn\'t afraid. Don\'t ask me to fix that."', do: (g) => { bumpRel(g, 'Mei Lin', 4, 2); bumpRel(g, 'Mother', 2, 0); return ['She looks at you for a long time. "No," she says finally. "I suppose I won\'t."']; }, time: 60, to: 'fo_ashfall' },
        ],
    },

    /* ---------------- the watcher on the ridge ---------------- */
    fo_spy: {
        id: 'fo_spy', title: 'The Watcher', art: 'envoy', place: 'The ridge above Ashfall',
        text: `Halfway up the switchbacks, behind a boulder, under a pine: a neat little nest. A folded mat, a water gourd, a writing kit, three rice cakes wrapped in a lotus leaf. And a young man in a dust-coloured over-robe with crimson lining, writing in a ledger with his tongue between his teeth.

He's been counting your stakes. He has drawn the palisade, very accurately, with notes. He has drawn *you*, with a note in the margin that your threads translate as *coat: inexplicable*.

He hasn't seen you yet.`,
        choices: [
            { text: 'Take him.', combat: spyFight, to: 'fo_spy_won' },
            { text: 'Talk. "Your ledger\'s very good. Shame about the perspective on the stakes."', check: { skill: 'GU', dc: 5 }, do: (g) => { g.flags.spy = 'talked'; g.flags.elder_intel = true; return ['He stares, then — because he is very young and very correct — corrects you about the perspective. You talk for an hour. He leaves with his ledger, and you leave knowing that the Elder plans to arrive at noon, from the north road, with four disciples.']; }, failDo: () => ['He bolts like a hare. You let him; the ledger falls out of his robe as he goes.'], fail: 'fo_spy_fled', to: 'fo_ashfall' },
            { text: 'Leave him. Let the Sect see exactly how ready you are.', do: (g) => { g.flags.spy = 'left'; return []; }, to: 'fo_ashfall' },
        ],
    },
    fo_spy_won: {
        id: 'fo_spy_won', title: 'The Ledger', art: 'envoy', place: 'The ridge above Ashfall',
        enter: (g) => { g.flags.spy = 'caught'; g.flags.elder_intel = true; bumpRel(g, 'Village', 4, 0); return ['+ The watcher\'s ledger: the Elder\'s road, hour and escort.']; },
        text: `He yields the moment your blade is at his throat, kneels, and formally offers you his sword with both hands, hilt first. He seems to feel this is the only correct thing left to do.

The ledger is meticulous. The Elder comes by the north road. At noon. With four disciples. There's a note about Mei Lin: *the herb-girl who laughs*. There's a note about Ya: just a drawing of a wolf's skull and a question mark.

You let him go, without the sword. He bows before he runs. Of course he does.`,
        choices: [{ text: 'Back down to Ashfall.', time: 60, to: 'fo_ashfall' }],
    },
    fo_spy_lost: {
        id: 'fo_spy_lost', title: 'Correct', art: 'envoy', place: 'The ridge above Ashfall',
        enter: (g) => { g.flags.spy = 'lost'; return []; },
        text: `He puts you on the ground with three precise movements, bows, apologises for the inconvenience, gathers his mat and his ledger and his rice cakes, and leaves at a brisk, correct walk.

You lie in the pine needles for a while, contemplating the Crimson Lotus's training programme. Yuki sits on your chest. *He folded his mat,* the bond observes. *While you were bleeding.*`,
        choices: [{ text: 'Limp home.', time: 90, to: 'fo_ashfall' }],
    },
    fo_spy_fled: {
        id: 'fo_spy_fled', title: 'Gone', art: 'envoy', place: 'The ridge above Ashfall',
        enter: (g) => { g.flags.spy = 'fled'; g.flags.elder_intel = true; return []; },
        text: `The watcher is three switchbacks up the mountain before you've finished your sentence. His ledger lies in the dust. It's very thorough. The Elder comes by the north road, at noon, with four disciples.

Also, in the margin next to your portrait: *does not bow*.`,
        choices: [{ text: 'Back down to Ashfall.', time: 60, to: 'fo_ashfall' }],
    },

    /* ---------------- evenings and nights ---------------- */
    fo_supper: {
        id: 'fo_supper', title: 'Supper', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { if (hour(g) < 19) advance(g, (19 - hour(g)) * 60); if (daily('a1_supper')(g)) { markDaily(g, 'a1_supper'); eat(g, 30); return ['Millet, pickled greens, a sliver of salt pork: +30 satiety.']; } return []; },
        text: (g) => (dd(g) === 8
            ? `Supper is very quiet. Mei Lin's mother says grace to the ancestors at twice its usual length, and adds a line at the end about the stranger, which you choose to take as a blessing.

Mei Lin eats with one hand and with the other draws the palisade line in spilled tea on the table, arguing with it. Yuki eats a piece of salt pork that was definitely not offered to her.`
            : `${yaHere(g) ? `Ya comes to supper. Nobody invited her. She simply arrives at the door, walks in, sits at the table on the *wrong side* — the host's side — and eats with her fingers, fast, hunched, watching the door the whole time like a wolf at a kill.

Mei Lin's mother serves her anyway, because a guest is a guest even if she is an animal, and sits through the whole meal with the face of a woman enduring a tribulation.

Halfway through, Ya burps, looks at Mei Lin, then at you, and says, conversationally: "So which of you two is sleeping in the loft? Or is it both. It should be both."

The mother drops her chopsticks.` : 'Supper. Quiet. The mother watches the north window the whole time.'}`),
        choices: [
            { text: (g) => (yaHere(g) && dd(g) === 9 ? '"Ya. Manners." (You\'re aware of the irony.)' : 'Help clear the table.'), do: (g) => { if (yaHere(g) && dd(g) === 9) { bumpRel(g, 'Ya', -2, 2); bumpRel(g, 'Mother', 3, 0); return ['Ya bristles, decides you\'re joking, decides you\'re not, decides she likes you anyway, and eats your pickles out of spite.']; } bumpRel(g, 'Mother', 2, 0); return []; }, to: 'fo_night' },
            { text: (g) => (yaHere(g) && dd(g) === 9 ? 'Laugh. Out loud. Somebody at this table has to.' : 'Go up to the loft early.'), do: (g) => { if (yaHere(g) && dd(g) === 9) { bumpRel(g, 'Ya', 3, 3); bumpRel(g, 'Mei Lin', 2, 0); g.flags.laughed_with_ya = true; return ['Ya laughs with you. Mei Lin tries not to and fails, and her mother looks at all three of you as if the house were on fire.']; } return []; }, to: 'fo_night' },
        ],
    },
    fo_night: {
        id: 'fo_night', title: 'Night', art: 'village_night', place: `${P} — the herb loft`,
        text: (g) => `${dd(g) === 8 && !g.flags.palisade ? 'There is no palisade yet. You lie awake listening to the barley.' : 'The loft smells of mint and drying ginseng.'}

${meiLovers(g)
        ? 'Mei Lin climbs the ladder after her mother\'s snoring has settled into its rhythm. She doesn\'t say anything. She doesn\'t have to. Thirteen days is a long time, and also no time at all, and she means to use every night of it.'
        : 'Mei Lin\'s lamp is still burning below, late. Once, you hear her laugh — alone, at something — and then stop herself, as if someone might hear.'}${yaHere(g) ? '\n\nAnd on the shrine roof across the lane, a silhouette is sitting cross-legged against the stars, watching your window, not even pretending not to.' : ''}`,
        choices: [
            { text: (g) => (meiLovers(g) ? 'Let the night be just this.' : 'Sleep.'), do: (g) => { if (meiLovers(g)) bumpRel(g, 'Mei Lin', 2, 4); return []; }, to: (g) => (dd(g) === 8 && !g.flags.palisade && !g.flags.wolf ? 'fo_wolf' : 'fo_morning') },
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'fo_morning' }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
        ],
    },
    fo_wolf: {
        id: 'fo_wolf', title: 'In the Barley', art: 'wolves', place: `${P} — the barley line`,
        enter: (g) => { g.flags.wolf = 'came'; return []; },
        text: `Yuki wakes you at the second hour with her claws and one word: *barley*.

Something is moving through the barley toward the houses, low and silent, two shapes, grey on grey. Ash-wolves — drawn, maybe, by the blood from the clinic, or by the smell of a village that has stopped sleeping.

There's no palisade. There's a chalk line and a lot of good intentions.`,
        choices: [
            { text: 'Drop out of the loft and meet them in the field.', combat: wolfFight, to: 'fo_wolf_won' },
            { text: 'Wake the hunters and hold the lane.', check: { skill: 'GU', dc: 5, bonus: (g) => ((g.flags.militia || 0) >= 2 ? 1 : 0) }, do: (g) => { g.flags.wolf = 'driven'; bumpRel(g, 'Village', 3, 0); return ['Torches, spears, silence. The wolves look at the line of grim faces and decide on a different village.']; }, fail: 'fo_wolf_forced', to: 'fo_morning' },
        ],
    },
    fo_wolf_forced: {
        id: 'fo_wolf_forced', title: 'In the Barley', art: 'wolves', place: `${P} — the barley line`,
        text: `The hunters come, but slowly — they stop to put on their headbands, properly, because a man does not go to his death untidy — and the wolves are already in the lane.`,
        choices: [{ text: 'Then it\'s you.', combat: wolfFight, to: 'fo_wolf_won' }],
    },
    fo_wolf_won: {
        id: 'fo_wolf_won', title: 'Grey on Grey', art: 'wolves', place: `${P} — the barley line`,
        enter: (g) => { g.flags.wolf = 'killed'; addItem(g, 'beast_core', 1); bumpRel(g, 'Village', 5, 0); return ['+1 Murky beast core.']; },
        text: `Two grey bodies in the trampled barley. By morning the hunters have skinned them, rendered them, and hung the skulls on the chalk line, facing outward, with the solemn conviction that this will warn the others.

It might. Wolves here aren't stupid. Neither, it turns out, are the hunters.`,
        choices: [{ text: 'Back to bed.', to: 'fo_morning' }],
    },
    fo_wolf_lost: {
        id: 'fo_wolf_lost', title: 'Grey on Grey', art: 'wolves', place: `${P} — the barley line`,
        enter: (g) => { g.flags.wolf = 'lost'; bumpRel(g, 'Village', -2, 0); return []; },
        text: `They get past you and take a goat, and you get a bite through the forearm that will scar. The hunters arrive in time to see the grey shapes vanish into the barley with the goat between them.

The goat's owner bows to you anyway, and thanks you for your effort, which is somehow the worst thing that's happened all week.`,
        choices: [{ text: 'Bandage it. Sleep.', to: 'fo_morning' }],
    },

    fo_morning: {
        id: 'fo_morning', title: (g) => `Day ${dd(g)}`, art: 'ashfall_dawn', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) lines.push(nightRest(g)); // v0.11.92 (X1): half back after the barley wolves
            if (g.flags.wolf === 'lost') g.james.hp = Math.ceil(g.james.hp * 0.85);
            eat(g, 20);
            lines.push('Breakfast at Mei Lin\'s: gruel and pickles, +20 satiety.');
            return lines;
        },
        text: (g) => (dd(g) === 9 && !yaHere(g)
            ? `Day nine. Twelve days to the Elder.

You're on the step with a bowl of gruel when the village goes silent behind you — not the careful silence you've got used to, but a sharp, total one, like a dropped plate in a temple.

Someone is walking out of the Blackroot. Down the north path, through the barley, dragging something heavy behind her on a rope.`
            : `Day ${dd(g)}. ${21 - dd(g)} days to the Elder. The north wind is up, and your Convergence is singing along with it whether you like it or not.`),
        choices: [
            { text: 'Look.', show: (g) => dd(g) === 9 && !yaHere(g), to: 'ya_arrives' },
            { text: 'Old Wen has called for you. Today is the day you decide.', show: (g) => dd(g) >= 10 && !g.flags.fo_plan, to: 'fo_plan' },
            { text: 'Out into the village.', show: (g) => !(dd(g) === 9 && !yaHere(g)) && !(dd(g) >= 10 && !g.flags.fo_plan), to: 'fo_ashfall' },
        ],
    },

    /* ---------------- Ya ---------------- */
    ya_arrives: {
        id: 'ya_arrives', title: 'Out of the Blackroot', art: 'ya_arrives', place: `${P} — the north path`,
        text: `She's tall, rangy, barefoot, wearing what used to be a hunter's jacket and is now mostly patches of other animals. Her hair is black and long and has twigs in it on purpose. There's a necklace of teeth around her throat, and a spear across her shoulders with a white tip that you realise, with professional interest, is bone. Not singing bone. Just bone, sharpened by hand, by someone patient.

On the rope behind her: an ash-wolf the size of a pony. Dead. Very dead.

She stops in the middle of the lane, drops the rope, looks round at forty houses' worth of frozen, horrified villagers, and shouts: "SALT. I want salt. And iron. Who has iron?"

Old Hu steps forward, very straight. "You will lower your voice in the presence of—"

"You," she says, delighted, "smell like a goat that died of shame."

Then she sees you. And Yuki. And her nostrils flare, and her face goes completely, startlingly still.`,
        choices: [{ text: 'Raise a hand. "Morning."', to: 'ya_meets' }],
    },
    ya_meets: {
        id: 'ya_meets', title: 'Nothing Smells Like Nothing', art: 'ya_close', place: `${P} — the north path`,
        enter: (g) => { g.flags.ya_met = true; bumpRel(g, 'Ya', 2, 2); return []; },
        text: (g) => `She walks right up to you, much too close, and *sniffs* you. Neck, hair, the collar of your coat. Yuki, on your shoulder, flattens her ears and allows it, which she has never allowed anyone.

"*You,*" the woman says. "Three nights I sat outside your little fire. Three nights. You smell like nothing. Nothing smells like nothing. Everything here smells like rot — the grass, the beasts, the Sect, *them*" — a thumb at the village — "everything that eats the air. You don't." She grins, all teeth. "I wanted to see if you'd taste like nothing too. Then the dogs came for you and you killed them, and I thought: he's mine. I'll come and get him when I'm hungry."

"I'm not sure I follow the 'mine' part."

"I'm Ya." She looks you up and down with frank, unhurried interest, the way she probably looks at a deer. "You're tall. That's good. And who's *that*?"

She's looking past you, at Mei Lin, who has come out onto the step with a knife in one hand and a bundle of herbs in the other and an expression of pure outrage. ${meiLovers(g) ? 'Ya\'s nose wrinkles. She looks from Mei Lin to you and back. "Oh. *Oh.* You two." She sounds pleased, the way a fox sounds pleased to find two hens.' : 'Ya\'s grin widens. "Oh, I like her. She looks like she bites."'}`,
        choices: [
            { text: '"James. That\'s Mei Lin. The one behind you is Old Hu, and he\'s about to challenge you."', to: 'ya_challenge' },
            { text: '"You followed me for three days and didn\'t say hello?"', do: (g) => { bumpRel(g, 'Ya', 3, 2); return ['"Saying hello is how you get speared," she says, as if explaining fire to a child.']; }, to: 'ya_challenge' },
        ],
    },
    ya_challenge: {
        id: 'ya_challenge', title: 'A Matter of Face', art: 'ya_fight', place: `${P} — the lane`,
        text: `Old Hu is indeed about to challenge her. He has removed his headband, folded it, and handed it to his nephew, which in Ashfall is the equivalent of a declaration of war. His face is grey with formal fury. She insulted him, in the lane, in front of the village, and in this world there are only two ways to answer that, and he is too old for both of them.

Ya sees it and *lights up*. "A fight? Good. I've been walking for four days."

"Old Hu," you say, "is seventy."

"Then *you* fight me." She turns that delighted, feral grin on you. "Come on, Nothing. Show me what you did to the dogs."

Old Hu looks at you with something like hope. If you take the fight, his face is saved. If you don't, he'll have to.`,
        choices: [
            { text: 'Take the fight. "Your spear against my blade. No armour. Nobody dies."', combat: yaBrawl, to: 'ya_won' }, // v0.11.82: Fable's
            { text: 'Talk her down: "You came for salt. Insulting the salt-keeper is a bad trade."', check: { skill: 'GU', dc: 6 }, do: (g) => { g.flags.ya_brawl = 'talked'; bumpRel(g, 'Ya', -1, 1); bumpRel(g, 'Village', 2, 0); return ['She thinks about it. Then she bows to Old Hu — badly, sideways, like a dog imitating a person — and says, "Sorry your face smells like a goat." Old Hu accepts this, with visible agony, as an apology.']; }, failDo: (g) => { bumpRel(g, 'Ya', -3, 0); return ['"Coward," she says, offended to her bones. Then she hits you anyway.']; }, fail: 'ya_forced', to: 'ya_talk' },
        ],
    },
    ya_forced: {
        id: 'ya_forced', title: 'She Hits You Anyway', art: 'ya_fight', place: `${P} — the lane`,
        text: `It's an open-handed slap that nearly takes your head off. The whole village inhales at once.`,
        choices: [{ text: 'Fine. "Your spear against my blade. No armour. Nobody dies."', combat: yaBrawl, to: 'ya_won' }], // v0.11.89 (owner pick T3): the terms said on this path too, the other path's words (Fable's)
    },
    ya_won: {
        id: 'ya_won', title: 'Pinned', art: 'ya_fight', place: `${P} — the lane`,
        enter: (g) => { g.flags.ya_brawl = 'won'; bumpRel(g, 'Ya', 6, 6); bumpRel(g, 'Village', 4, 0); bumpRel(g, 'Old Hu', 6, 0); return []; },
        text: `It ends with Ya on her back in the dust, her spear a long way from her hand, and the flat of a white bone blade laid across her collarbones, holding her to the lane the way a ruler holds down a page. She's bleeding from the lip and laughing so hard she can't breathe.

"*Again,*" she says. "Do that again. Later. Somewhere with fewer goats."

Old Hu replaces his headband with tremendous dignity. His face has been saved, by proxy, and in this world that counts. He bows to you. Then, after a long and visible internal struggle, he bows to Ya, because she fought, and fighting is a thing that can be respected even in an animal.

Mei Lin, on the step, has put the knife down. She is staring at Ya with an expression you can't read at all.`,
        choices: [{ text: 'Let her up.', to: 'ya_talk' }],
    },
    ya_lost: {
        id: 'ya_lost', title: 'Pinned (You)', art: 'ya_fight', place: `${P} — the lane`,
        enter: (g) => { g.flags.ya_brawl = 'lost'; bumpRel(g, 'Ya', 4, 5); bumpRel(g, 'Old Hu', 3, 0); g.james.hp = Math.max(3, g.james.hp); return []; },
        text: (g) => `It ends with you on your back in the dust and Ya sitting on your chest, one knee on each of your arms, grinning down at you upside-down with her hair hanging around both your faces like a curtain.

"You're good," she says. "You're not *good* good. But you're good." She leans down, very close, and sniffs your hair again. "Still nothing."

"Are you going to get off me?"

"Eventually." She doesn't. Behind her, you can see Mei Lin on the step, white-knuckled around her knife, and Old Hu, who has replaced his headband with tremendous dignity, because a fight was had and his face, by proxy, is saved.

${yukiForm(g) === 'human' ? 'Yuki, who was asked to stand on the left and not to rescue anyone, stands on the left and rescues no one.' : 'Yuki sits on the fence and offers no help whatsoever.'}`, // v0.11.82: Fable's human-form line
        choices: [{ text: '"Eventually would be now."', to: 'ya_talk' }],
    },
    ya_talk: {
        id: 'ya_talk', title: 'Salt and Iron', art: 'ya_close', place: `${P} — Mei Lin's step`,
        text: (g) => `She sits on Mei Lin's step without being asked, uninvites herself into Mei Lin's gruel, and explains, between mouthfuls, that she lives in the deep Blackroot, past the Hollow, past where the hunters stop. Always has. Her mother was "a hunter who went in and didn't come out" and her father was "maybe a wolf, I never asked." She comes out twice a year for salt and iron and to start fights.

"And the dead tree?" you ask. "The big one. At the heart."

She stops chewing. For the first time, she looks at you without a grin.

"I sleep in its roots in winter," she says. "It's warm. Nothing else in the forest is warm." A pause. "Sometimes it hums. Only when I'm asleep, though. When I wake up, it stops." Her eyes narrow. "It hummed louder the nights I was near *you*."

Then the grin comes back, wider. "Anyway. Salt. Iron. And you." She points her spoon at Mei Lin. "And maybe you."

Mei Lin makes a sound like a kettle.`,
        choices: [
            { text: 'Make her a set of bone needles and a skinning knife, as a guest-gift.', qi: 4, check: { skill: 'Convergence Use', dc: 4 }, do: (g) => { g.flags.ya_gift = true; bumpRel(g, 'Ya', 6, 4); addItem(g, 'ya_tooth', 1); return ['She examines the knife the way some people examine jewellery, then bites a wolf\'s tooth off her necklace and presses it into your palm. +Ya\'s wolf tooth. You decide not to ask.']; }, failDo: (g) => { bumpRel(g, 'Ya', 2, 1); return ['The knife cracks. She keeps it anyway. "It\'s ugly. I like ugly things."']; }, to: (g) => (meiLovers(g) || likesMei(g) ? 'ya_share' : 'fo_ashfall') },
            { text: 'Get her salt from the communal store, and pay for it yourself.', do: (g) => { bumpRel(g, 'Ya', 3, 2); bumpRel(g, 'Village', 2, 0); return ['Two jars of grey salt. She hugs them like children.']; }, time: 60, to: (g) => (meiLovers(g) || likesMei(g) ? 'ya_share' : 'fo_ashfall') },
        ],
    },
    ya_share: {
        id: 'ya_share', title: 'An Indecent Proposal', art: 'ya_close', place: `${P} — Mei Lin's step`,
        text: (g) => `Ya has been watching the two of you. She watches the way a predator watches: patiently, missing nothing. ${meiLovers(g) ? 'She noticed the way Mei Lin\'s hand found your sleeve on the step. She noticed the hay still in Mei Lin\'s hair from two nights ago.' : 'She noticed the way you two keep not looking at each other.'}

"So," she says, licking gruel off her thumb. "You two are a pair. Good. I don't mind. In the forest, if there's a good kill, everybody eats." She looks at Mei Lin with frank, friendly appreciation. "You're pretty when you're angry. You're angry a lot, so that's lucky."

There is a long, ringing silence.

"I," says Mei Lin, in a very high voice, "am not a *deer carcass*."

"No," Ya agrees. "Deer don't talk back. You'd be better."

"You can't — *nobody* says — " Mei Lin turns on you. "Say something!"

Ya's grin has slipped. She's looking at Mei Lin's face, and you watch her work out, slowly, that she's given offence — and then you watch her *take* offence at the offence, her hackles going up like a dog's. "What? I was being *nice*."`,
        choices: [
            { text: 'To Ya: "In Ashfall, you ask that quietly, in private, after several years."', do: (g) => { bumpRel(g, 'Ya', 1, 3); bumpRel(g, 'Mei Lin', 2, 0); trioStep(g, 1); return ['Ya considers this. "Several *years*? You\'ll all be dead."']; }, to: 'fo_ashfall' },
            { text: 'To Mei Lin: "She meant it as a compliment. I think. In wolf."', do: (g) => { bumpRel(g, 'Mei Lin', 1, 1); bumpRel(g, 'Ya', 2, 2); trioStep(g, 1); return ['Mei Lin stalks inside. Then — after a moment — she comes back out, sits on the far end of the step, and says nothing. But she stays.']; }, to: 'fo_ashfall' },
            { text: '"Ya. No."', do: (g) => { bumpRel(g, 'Ya', -3, -2); bumpRel(g, 'Mei Lin', 4, 2); return ['Ya sulks. Spectacularly. She climbs onto the shrine roof and refuses to come down until supper.']; }, to: 'fo_ashfall' },
        ],
    },
    fo_ya_time: {
        id: 'fo_ya_time', title: 'Ya', art: (g) => (dd(g) === 10 ? 'ya_close' : 'ya_fight'), place: `${P} — wherever Ya is`,
        enter: (g) => { markDaily(g, 'a1_ya'); return []; },
        text: (g) => (dd(g) === 9
            ? `You find her on the threshing floor, where she has challenged three of the younger hunters at once to a wrestling match and is winning, and is also furious, because they keep stopping to bow.

"They *bow*," she says, outraged, pinning one by the neck. "In the middle. Why do they *bow*?"

"It's polite."

"It's *slow*." She lets the boy up. He bows. She bares her teeth at him and he runs. "Come here. You're not slow. Throw me."`
            : `She's on the shrine roof, sharpening her spear with a stone, legs dangling over the god's chiselled-off face.

"Tomorrow I take you to the tree," she says, without looking down. "You and the angry one." A pause. "She doesn't like me."

"She doesn't know what to do with you. Nobody here does."

"I know." She tests the spear-point on her thumb. A bead of blood. "I don't like it when people don't like me. It makes me want to bite them. I'm trying not to bite her." Another pause. "For you."`),
        choices: [
            { text: (g) => (dd(g) === 9 ? 'Throw her.' : '"Thank you. Truly."'), do: (g) => { bumpRel(g, 'Ya', 4, dd(g) === 9 ? 5 : 3); return likesMei(g) && likesYa(g) ? trioStep(g, 1) : []; }, time: 120, to: 'fo_ashfall' },
            { text: (g) => (dd(g) === 9 ? 'Let her throw you. Several times. It seems important to her.' : 'Climb up and sit with her for a while.'), do: (g) => { bumpRel(g, 'Ya', 3, 4); g.james.hp = Math.max(1, g.james.hp - (dd(g) === 9 ? 2 : 0)); return dd(g) === 9 ? ['She throws you into the chaff eleven times. She is very happy. −2 HP.', ...awardYukiFightXp(g, 'standard')] : ['You sit. She leans her shoulder against yours, hard, the way a wolf leans on another wolf.']; }, time: 120, to: 'fo_ashfall' },
        ],
    },

    /* ---------------- Day 10: the plan ---------------- */
    fo_plan: {
        id: 'fo_plan', title: 'The Old Tree', art: 'council', place: `${P} — the elder's house`,
        enter: (g) => { g.flags.fo_plan = true; return []; },
        text: (g) => `Old Wen has unrolled a map on the council table: hide, painted in five colours, so old the colours have faded to five shades of brown. The forest is a dark smear. In the middle of the smear, someone a long time ago drew a tree, and around it a circle, and inside the circle a single character.

"*Hearth,*" Old Wen reads. "Before the Sect, my grandfather's grandfather's people walked to the Old Tree each spring with offerings. It was not a god. It was — warmer than a god. They said the forest was kind while it sang." He touches the circle. "The founder of the Crimson Lotus walked in there with nine disciples. He walked out alone, with a heart of green fire in his hands, and that was the first day of the Sect, and the last day of the singing."

Your Convergence is humming so loudly you're surprised nobody else can hear it.

*Hearth.* Your people's word, nearly. The trees you grew up inside. The ones that carry the ships.

"I have to go there," you say. "Before the Elder comes."

"Yes," says Old Wen, as if you'd said the sun was up. "But nobody from Ashfall has gone past the Hollow in forty years. You'll need someone who has."`,
        choices: [{ text: 'You know someone who has.', to: 'fo_price' }],
    },
    fo_price: {
        id: 'fo_price', title: 'The Price', art: 'ya_close', place: `${P} — the shrine roof`,
        text: (g) => `You find Ya ${g.flags.ya_brawl === 'won' ? 'practising the disarm that took her spear, on a sack of millet, slowly, and losing to it on purpose' : 'asleep on the shrine roof in full sun like a lizard'}. You explain. She listens with her head on one side.

"I'll take you," she says. "Five days in, maybe six. There are things past the Hollow that eat hunters like rice. There's a wet wood where the dead walk. There are hills where the birds are on fire. I know all of it." She grins. "My price."

"Salt? Iron?"

"Salt and iron," she agrees. "And a fight every three days. A real one, no bowing." She holds up a finger. "And when we sleep in the forest, I sleep next to you, not on the other side of the fire like a guest." A second finger. "And *she* comes." She points across the lane at Mei Lin's house. "Because you'll be miserable if she doesn't, and I don't travel with miserable people. They taste of fear."`,
        choices: [
            { text: '"Done. All of it."', do: (g) => { g.flags.ya_price = 'all'; bumpRel(g, 'Ya', 5, 4); return likesMei(g) && likesYa(g) ? trioStep(g, 1) : []; }, to: 'fo_mei_insists' },
            { text: '"Salt, iron and the fights. The sleeping arrangements, we negotiate."', check: { skill: 'GU', dc: 5 }, do: (g) => { g.flags.ya_price = 'haggled'; bumpRel(g, 'Ya', 4, 2); return ['"Negotiate," she repeats, delighted, as if you\'d offered her a new kind of fight.']; }, failDo: (g) => { g.flags.ya_price = 'all'; bumpRel(g, 'Ya', 2, 3); return ['"No," she says, and that is the end of the negotiation.']; }, to: 'fo_mei_insists' },
        ],
    },
    fo_mei_insists: {
        id: 'fo_mei_insists', title: 'Not Optional', art: 'mei_lin', place: `${P} — Mei Lin's house`,
        enter: (g) => { g.flags.mei_party = true; g.flags.ya_party = true; return []; },
        text: (g) => `When you tell Mei Lin, she's already packed.

"Of course I'm coming," she says. "I was always coming. Somebody has to keep you from eating the wrong mushroom and *her*" — a jerk of the head toward the shrine — "from eating *you*."

Her mother is standing in the doorway. She has heard every word. She does not argue. In Ashfall, you are coming to understand, you don't argue with a decision once it has been spoken aloud; you only make it as correct as you can.

She goes inside. She comes back with her late husband's hunting knife, wrapped in red cloth, and holds it out to her daughter with both hands.

Mei Lin takes it with both hands. Neither of them cries. You have the strong impression that both of them will, separately, later, where nobody can see.${likesMei(g) && likesYa(g) ? '\n\nAs you leave, you catch Mei Lin glancing at the shrine roof, where Ya is lying in the sun, and away again, too fast.' : ''}`,
        choices: [{ text: 'One more day of walls. Then the forest.', to: 'fo_ashfall' }],
    },

    fo_farewell: {
        id: 'fo_farewell', title: 'The Last Supper in Ashfall', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => { if (hour(g) < 19) advance(g, (19 - hour(g)) * 60); eat(g, 35); return ['A farewell supper: fish, millet, the last of the plum wine. +35 satiety.']; },
        text: (g) => `Half the village comes to Mei Lin's house, one family at a time, each with a small gift and a short, formal speech. Old Hu brings a coil of rope and bows to the floor. The boy from the clinic brings a pebble he has decided is lucky. Old Wen brings nothing, sits in the corner, drinks his weak tea, and leaves without saying goodbye, which you are told afterward is the highest honour he could give: it means he expects to see you again.

${g.flags.palisade >= 2 ? 'Behind it all, the palisade stands white along the barley, two-thirds done or better. The hunters swear on their ancestors to finish it before you come back.' : 'The palisade is half a line of white stakes and a lot of chalk. The hunters swear on their ancestors to finish it.'}

Ya eats on the roof, alone, with her back to the gathering, because "people saying things in a row" makes her want to bite them. Halfway through, she drops a smoked haunch of something through the smoke-hole onto the table. It lands in the soup. Mei Lin's mother looks at it for a long time. Then she serves it.`,
        choices: [{ text: 'Go up to the loft.', to: 'fo_last_night' }],
    },
    fo_last_night: {
        id: 'fo_last_night', title: 'The Night Before', art: (g) => (likesMei(g) && likesYa(g) ? 'roof' : 'village_night'), place: `${P} — the herb loft`,
        text: (g) => {
            const both = likesMei(g) && likesYa(g);
            if (both) return `You can't sleep. Neither can anyone else, apparently. When you climb out onto the roof, Mei Lin is already there, knees drawn up, watching the north. A moment later the thatch creaks and Ya drops down beside you both from the shrine roof, the way a cat drops from a wall, uninvited and entirely at home.

For a while nobody says anything. Then Ya says, to the stars: "Tomorrow we go where it's warm. All three of us. I like that. I like that it's three." She glances sideways at Mei Lin. "You can sleep next to him on one side and I'll sleep on the other and nobody has to bite anybody."

Mei Lin doesn't answer. But she doesn't leave, either. She sits there between the two of you in the dark with her shoulder very carefully not touching Ya's, and after a long time, very quietly, she laughs — at the absurdity of it, at herself, at everything — and doesn't stop herself.`;
            if (meiLovers(g)) return `Mei Lin comes up the ladder late, with the lamp already out, and lies down beside you in the hay without a word, and for a long time you just breathe together, listening to the north wind.

"I'm afraid," she says at last. "Not of the forest. Of coming back and finding them all — " She doesn't finish.

"Then we'll come back fast."

She turns toward you in the dark. What happens after that is nobody's business, not even Yuki's, who goes and sleeps on the stove in protest.`;
            if (rel(g, 'Ya').a >= 10) return `There's a scrape at the loft window, and Ya climbs in without asking, as she does everything. She sits on the edge of the hay, watching you with eyes that catch the starlight like an animal's.

"Tomorrow I take you home," she says. "My home. The warm place." Then, with no change of tone at all: "Do you want me to stay? I'll stay if you want. I'll go if you don't. I won't be offended." A pause. "I'll be a little offended."`;
            return `The loft is quiet. The north wind moves in the thatch. Yuki curls into the hollow of your neck, and through the bond, very faintly, you can feel what she feels when she faces north: not fear. Something more like homesickness, for a home neither of you has ever seen.`;
        },
        choices: [
            { text: 'Stay there, the three of you, until the sky goes grey.', show: (g) => likesMei(g) && likesYa(g), do: (g) => { bumpRel(g, 'Mei Lin', 3, 3); bumpRel(g, 'Ya', 3, 3); return trioStep(g, 1); }, to: 'fo_depart' },
            { text: '"Stay."', show: (g) => !(likesMei(g) && likesYa(g)) && !meiLovers(g) && rel(g, 'Ya').a >= 10, do: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 6, 10); return []; }, to: 'fo_ya_night' },
            { text: (g) => (meiLovers(g) && !(likesMei(g) && likesYa(g)) ? 'Hold her.' : 'Sleep.'), show: (g) => !(likesMei(g) && likesYa(g)), do: (g) => { if (meiLovers(g)) bumpRel(g, 'Mei Lin', 3, 6); else if (rel(g, 'Ya').a >= 10) bumpRel(g, 'Ya', -1, 0); return []; }, to: 'fo_depart' },
        ],
    },
    fo_ya_night: {
        id: 'fo_ya_night', title: 'Wild', art: 'ya_close', place: `${P} — the herb loft`,
        text: `She doesn't stay politely.

She kisses the way she fights: all at once, laughing, with teeth, and absolutely no idea of where civilised people draw lines. At some point she bites your shoulder, hard, and then licks it like an apology, and says against your neck, "*Still* nothing. How do you taste like *nothing*," as if it were an accusation and a compliment at once.

The hay is everywhere. The loft ladder, at one point, is somewhere it should not be. Below, Mei Lin's mother coughs, once, pointedly, through the floorboards, and Ya laughs so hard she has to put her face in your chest.

What comes after that is nobody's business. Not even Yuki's, who leaves through the window in protest.

*

When you wake, she's gone — back on the shrine roof, sharpening her spear, as if nothing happened. But when you come down the ladder she looks over at you and grins, and it's a different grin. Softer at the edges. Hers.`,
        choices: [{ text: 'Dawn.', to: 'fo_depart' }],
    },
    fo_depart: {
        id: 'fo_depart', title: 'North', art: 'ashfall_dawn', place: `${P} — the north path`,
        enter: (g) => { g.flags.mei_party = true; g.flags.ya_party = true; return []; },
        text: (g) => `Day eleven. Ten days to the Elder.

The village lines the north path in silence: every family, every child, the hunters in their two straight lines. Nobody calls out. Nobody waves. As you pass, they bow, one row after another, like barley in wind.

Mei Lin walks at your left with her father's knife at her hip and her basket on her back, not looking at her mother, because if she looks she won't go. Ya walks at your right, ahead, then behind, then off the path entirely, impatient as a dog on a lead. Yuki rides your shoulder facing north, tail curled round your neck.

At the edge of the barley, where the white stakes end and the black trees begin, your Convergence stops humming and starts, unmistakably, to *sing*.

${likesMei(g) && likesYa(g) ? '"Three of us," Ya says, to nobody, very pleased. Mei Lin doesn\'t answer. But she doesn\'t correct her, either.' : '"Into the warm," says Ya, and steps under the trees.'}`,
        choices: [{ text: 'Into the Blackroot.', do: (g) => { g.minutes = 9 * 1440 + 23 * 60; sleepUntil(g, 6); g.flags.mei_party = true; g.flags.ya_party = true; return []; }, to: 'bl_start' }],
    },
};
