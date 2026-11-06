/**
 * Days 5–6 in Ashfall Hamlet (the long route): suppers at Mei Lin's, a free day loop around the village,
 * a night visit shaped by what James did to Gao Feng, and bonuses that pay off when the Sect comes on Day 7.
 */
import { addItem, hasItem, eat, bumpRel, condense, sleepUntil, advance, d6, awardYukiFightXp, jamesHpMax } from '../core/game.js';
import { set, day, hour, daily, markDaily, forestScale, villageScale, grow, eatBest, pantry, foodCount } from './common.js';

const P = 'Ashfall Hamlet';
const vday = (g) => g.flags.vday || 1;
const meiRel = (g) => g.rel['Mei Lin'] || { f: 0, a: 0 };
/** Where "back to the village" leads, and where the evening goes. */
export const hubOf = (g) => (g.flags.long && vday(g) >= 2 ? 'ashfall' : 'village');
export const nextEvening = (g) => (g.flags.long && vday(g) < 3 ? 'supper' : 'evening');
const late = (g) => hour(g) >= 19;

/* ---------- day fights past the oak hollow (grow with all the days) ---------- */
const farHunt = (g) => {
    const s = forestScale(g) + villageScale(g);
    const wolves = g.flags.far_kind === 'wolves';
    const enemies = wolves
        ? [{ name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf (old scar)', hp: 7, dc: 4, atk: 5, dmg: 4 }]
        : [{ name: 'Thornback bull', hp: 11, dc: 4, atk: 5, dmg: 5, dr: 1 }];
    return { id: wolves ? 'wolves' : 'thornback', intro: wolves ? 'Two ash-wolves step out of the oaks together, the way a pair of knives comes out of a sleeve.' : 'The thornback bull rises out of the bracken, spines up, hissing like a kettle the size of a cart.', band: 'challenging', enemies: enemies.map((e) => grow(e, s)), win: 'far_won', lose: 'far_lost', flee: 'ashfall' };
};
const arson = (g) => {
    const s = forestScale(g) + villageScale(g);
    return { id: 'arson', intro: 'Pock-Face lifts his torch and grins. The two with him spread out, the way men do when they\'ve done this before.', band: 'challenging', enemies: [{ name: 'Lackey Pock-Face', hp: 7, dc: 3, atk: 4, dmg: 3 }, { name: 'Hired thug', hp: 5, dc: 3, atk: 4, dmg: 3 }, { name: 'Hired thug', hp: 5, dc: 3, atk: 4, dmg: 3 }].map((e) => grow(e, s)), win: 'arson_won', lose: 'arson_lost' };
};

export const ASHFALL = {
    /* ---------- suppers (Days 4 and 5) ---------- */
    supper: {
        id: 'supper', title: 'Supper', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => {
            const p = hour(g);
            if (p < 19) advance(g, (19 - p) * 60);
            if (daily('supper')(g)) { markDaily(g, 'supper'); eat(g, 30); return ['Millet, greens, a little smoked fish: +30 satiety.']; }
            return [];
        },
        text: (g) => (vday(g) === 1
            ? `${g.flags.ignored
                ? 'You find her house by asking. You apologise on her doorstep, properly, no sarcasm. She looks at you for a long moment, then lets you in, which you did not deserve, and puts a bowl in front of you, which you deserved even less.'
                : 'Mei Lin\'s house is two rooms and a herb loft, and her mother is a tiny fierce woman who looks at you once and starts adding more millet to the pot.'}

"Three days," the mother says, to nobody, ladling. "Three days and they come up that road. Every year." She puts the biggest piece of fish in your bowl and looks at Yuki, then at you. "You will sleep in the loft. It is not proper. It is necessary." She regards Yuki for a long moment and inclines her head to her, very slightly. "The spirit-beast will sleep where it chooses. One does not command such creatures."

Yuki, on the warm stove, closes her eyes in total agreement.`
            : `Second supper at Mei Lin's. Her mother has stopped watching you like a fox in the henhouse and started watching you like a fox she might be able to use.

Tonight she talks. About Mei Lin's father, who had a spirit root and went up the road with the collectors when Mei Lin was six. About the letter that came back four years later: *Tribulation. Honoured.* About the box with nothing in it that they buried.

Mei Lin clears the bowls very loudly through all of this. When her mother is done, she says, without turning round, "He'd have liked you. He was an idiot too."

"*Mei Lin.*" Her mother says it once, like a door shutting. "You do not speak of your father so." Mei Lin doesn't apologise. She doesn't stop smiling, either, and she doesn't look at her mother for the rest of the meal.`),
        choices: [
            { text: 'Climb out onto the roof with Mei Lin and watch the stars come out.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 4); return []; }, time: 60, to: 'supper_roof' },
            { text: 'Help her mother with the dishes, and listen.', do: (g) => { bumpRel(g, 'Village', 3, 0); bumpRel(g, 'Mei Lin', 2, 0); return ['Her mother tells you, in a low and formal voice, which families owe the Sect what, which houses have lost children to the road, and which neighbours would sell you for a sack of millet. She does not smile once. It is the most useful hour you\'ve spent on this world.']; }, time: 60, to: 'village_night' },
            { text: 'Go up to the loft early. Tomorrow will want everything you have.', to: 'village_night' },
        ],
    },
    supper_roof: {
        id: 'supper_roof', title: 'The Roof', art: 'roof', place: `${P} — on Mei Lin's roof`,
        text: (g) => (vday(g) === 1
            ? `The thatch is still warm from the day. The stars come out one at a time, then all at once, wrong constellations every one of them.

"Which one's yours?" Mei Lin asks.

You look for a long time. "None. Mine's too far to see." You point anyway, at a random patch of dark. "There. Probably. Give or take a galaxy."

She considers the patch of dark with great seriousness. "It looks cold."

"It was warm. We grew our houses out of trees. They sang when you sang to them." You stop. "Sorry. That sounds insane."

"It sounds," she says, "like the first thing anyone's told me in years that I wanted to be true."`
            : `Second night on the roof. She brings the plum wine this time and doesn't ask if you want any.

She tells you what the tribute actually costs, in numbers: so many baskets of grass, so many sacks of millet, so many children tested for roots. She tells you which families hid their children last year and which ones were caught. She's very calm about it. Her hands are not.

Then she's quiet for a long time, and then she leans her shoulder against yours, and neither of you says anything about that.`),
        choices: [{ text: 'Stay until the cold drives you in.', do: (g) => { bumpRel(g, 'Mei Lin', 2, 3); return []; }, to: 'village_night' }],
    },

    /* ---------- the night: quiet, or Gao Feng's doing (night 5) ---------- */
    village_night: {
        id: 'village_night', title: 'Night in Ashfall', art: (g) => (vday(g) === 2 && !g.flags.night5_done ? ((g.flags.gao_dead || g.flags.gao_broken) ? 'token' : g.flags.gao_spared ? 'gao_window' : 'arson') : 'village_night'), place: `${P} — the herb loft`,
        text: (g) => {
            if (vday(g) !== 2 || g.flags.night5_done) return 'The herb loft smells of mint and drying ginseng. Below, the house breathes. Yuki takes the exact centre of your chest and the exact centre of your sleep, and you let her.';
            if (g.flags.gao_dead || g.flags.gao_broken) return `Mei Lin shakes you awake in the dark. She has something in her fist, wrapped in cloth: Gao Feng's jade token, the one she took from his sleeve while he lay in the herbs with his arm on backwards.

It's warm. It's *pulsing*, faint and slow, like something with a heartbeat.

"Sect tokens talk to each other," she whispers. "Gao reached home today. They'll have heard what he says happened — a mortal, no root, no Qi, broke a disciple of the Crimson Lotus like a twig." She doesn't smile. "Nobody will believe him. That's worse. They'll want to see for themselves. And this thing will show them exactly where to look."`;
            if (g.flags.gao_spared) return `A pebble hits the shutter. Then another.

Below in the lane, in the moonlight, alone, stands Gao Feng. His hand is bandaged. His crimson robe is grey with road dust. He looks younger than he did on the herb slope, and much more frightened.

"I have not come to fight," he says, very quietly, and bows — a real bow, the full depth, to a man in a lab coat at a window. "You spared my life. That is a debt. I do not know why you did it, and a debt I do not understand is a debt I cannot repay. It gives me no rest."`;
            return `Yuki wakes you with her claws and a single, urgent thought: *fire.*

Down in the lane, torchlight. Three men creeping toward the side of the house where Mei Lin's herb loft — where you are sleeping — sits on its dry wooden posts. The one in front has a pock-marked face you remember from the herb slope.

Gao Feng's lackey has come to settle Gao Feng's grudge. With a torch. At night. Classic.`;
        },
        choices: [
            { text: 'Sleep.', show: (g) => vday(g) !== 2 || !!g.flags.night5_done, to: 'village_morning' },
            // Gao broken (or dead, old saves): the token
            { text: 'Crush the token in a fist of bone. Silence it.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!(g.flags.gao_dead || g.flags.gao_broken), qi: 4, check: { skill: 'Convergence Use', dc: 4 }, do: (g) => { g.flags.night5_done = true; g.flags.token_silenced = true; return ['The jade cracks with a sound like a bell underwater. The pulse stops. Lu Han won\'t be able to follow it here.']; }, failDo: (g) => { g.flags.night5_done = true; addItem(g, 'sect_token', 1); return ['The bone slides off it. It keeps pulsing. You put it in the hammerspace and hope folded space muffles it.']; }, to: 'village_morning' },
            { text: 'Carry it far into the forest and bury it in the mire.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!(g.flags.gao_dead || g.flags.gao_broken), time: 120, check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.night5_done = true; g.flags.token_silenced = true; return ['Let Lu Han look for his cousin in a swamp.']; }, failDo: (g) => { g.flags.night5_done = true; g.james.hp -= 3; return ['You bury it, but something in the mire bites you for the trouble: −3 HP.']; }, to: 'village_morning' },
            // Gao spared: the visit
            { text: '"Because I\'m not from here. Where I\'m from, we don\'t kill people for being stupid. Go home, Gao."', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!g.flags.gao_spared, check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.night5_done = true; g.flags.gao_turned = true; return ['He stares at you for a long time. Then he tells you everything: Lu Han is bringing four men, not two. He wants you alive. He thinks you\'re a hidden sect\'s heir. "Let him keep thinking it," Gao says, and is gone.']; }, failDo: (g) => { g.flags.night5_done = true; g.flags.gao_warned = true; return ['He doesn\'t believe you, but he warns you anyway: Lu Han wants you alive. Then he\'s gone.']; }, to: 'village_morning' },
            { text: 'A bone needle into the post an inch from his ear. "Ask me again and I\'ll explain it slower."', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!g.flags.gao_spared, qi: 3, do: (g) => { g.flags.night5_done = true; g.flags.gao_warned = true; return ['He goes white and tells you, very fast, that Lu Han wants you alive. Then he runs.']; }, to: 'village_morning' },
            // Gao alive and humiliated: arson
            { text: 'Drop out of the loft into the middle of them.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !(g.flags.gao_dead || g.flags.gao_broken) && !g.flags.gao_spared, combat: arson, to: 'arson_won' },
            { text: 'Wake the street. Let forty houses deal with three men.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !(g.flags.gao_dead || g.flags.gao_broken) && !g.flags.gao_spared, check: { skill: 'GU', dc: 4, bonus: (g) => ((g.rel.Village?.f || 0) >= 20 ? 2 : 0) }, do: (g) => { g.flags.night5_done = true; bumpRel(g, 'Village', 6, 0); return ['Shutters bang open all down the lane. Pock-Face and his friends find themselves facing pitchforks, and leave with fewer teeth.']; }, fail: 'arson_start', to: 'village_morning' },
        ],
    },
    arson_start: {
        id: 'arson_start', title: 'Torches', art: 'arson', place: `${P} — the lane`,
        text: `The street doesn't wake fast enough. Pock-Face sees you at the window and laughs.`,
        choices: [{ text: 'Then it\'s just you.', combat: arson, to: 'arson_won' }],
    },
    arson_won: {
        id: 'arson_won', title: 'Ash on the Lane', art: 'arson', place: `${P} — the lane`,
        enter: (g) => { g.flags.night5_done = true; g.flags.arson_beaten = true; bumpRel(g, 'Village', 10, 0); bumpRel(g, 'Mei Lin', 4, 3); return []; },
        text: `By the time the shutters open, it's over: two thugs running, Pock-Face face-down in the lane with a bone needle pinning his sleeve to the dirt, and his torch hissing out in the gutter.

Half the street comes out in nightclothes. Nobody says anything. Then Mei Lin's mother walks up in her nightclothes, looks down at Pock-Face, and says, in the voice of a magistrate passing sentence: "You came by night to burn a widow's house. Your ancestors will hear of it from me." She goes back to bed. Pock-Face, you notice, is crying.

That's the moment Ashfall decides you're theirs.`,
        choices: [{ text: 'Back to the loft.', to: 'village_morning' }],
    },
    arson_lost: {
        id: 'arson_lost', title: 'Smoke', art: 'arson', place: `${P} — the lane`,
        enter: (g) => { g.flags.night5_done = true; g.flags.loft_burned = true; return []; },
        text: `They get past you. The loft goes up like paper — a year of Mei Lin's herbs, dried and bundled, gone in a roar of sweet smoke. The street puts it out before it takes the house. Barely.

Mei Lin stands in the lane with soot on her face, looking at the wreck, and says nothing at all. That's worse than anything she could say.`,
        choices: [{ text: 'Sleep in the kitchen. If you can.', do: (g) => { bumpRel(g, 'Mei Lin', 0, -3); return []; }, to: 'village_morning' }],
    },

    /* ---------- mornings ---------- */
    village_morning: {
        id: 'village_morning', title: (g) => `Day ${day(g)}`, art: 'village', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) { sleepUntil(g, 6); lines.push('Slept until 06:00. HP and Qi full.'); }
            g.flags.vday = vday(g) + 1;
            eat(g, 20);
            lines.push('Breakfast at Mei Lin\'s: rice gruel and pickles, +20 satiety.');
            return lines;
        },
        text: (g) => (vday(g) === 2
            ? `Ashfall in the morning: smoke from forty chimneys, a rooster that is clearly being paid to do this, children staring at you from behind every wall.

Two days until the collectors. The village is pretending to be normal very loudly. You've got two days to make sure that when the Crimson Lotus walks up that road, the thing waiting at the top of it is a lot stronger than a confused mycologist with a cat.`
            : `The last day. Tomorrow at sunrise, the collectors.

Everyone in Ashfall is up early, and everyone has found a reason to walk past Mei Lin's house and see if you're still there. You are. ${g.flags.loft_burned ? 'The burned loft is still smoking a little.' : 'Yuki is sunning herself on the doorstep like a small white guard dog.'}`),
        choices: [{ text: 'Out into the village.', to: 'ashfall' }],
    },

    /* ---------- the day hub ---------- */
    ashfall: {
        id: 'ashfall', title: 'Ashfall', art: 'village', place: P,
        text: (g) => {
            const h = hour(g);
            const when = h < 11 ? 'Morning. The village is up and working.' : h < 15 ? 'Midday heat. The chickens have given up.' : h < 18 ? 'Late afternoon, long shadows, the smell of cooking fires.' : 'Dusk. Lamps coming on behind the shutters.';
            return `${when} ${vday(g) === 3 ? 'The tribute post\'s red banners hang dead still. Tomorrow.' : 'Two days to the tribute.'}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''}`;
        },
        choices: [
            { text: 'Visit Old Wen.', show: (g) => !g.flags.elder && !late(g), time: 30, do: set('elder'), to: 'elder' },
            { text: 'Go to the coughing house. A child is sick.', show: (g) => !g.flags.healed_try && !late(g), time: 30, to: 'heal' },
            { text: 'Hunt the ironhide boar past the oak hollow.', show: (g) => !g.flags.village_hunt && hour(g) < 15, time: 90, to: 'village_hunt' },
            { text: 'Gather herbs with Mei Lin on the slopes.', show: (g) => daily('slopes')(g) && hour(g) < 15, time: 30, to: 'herb_slopes' },
            { text: 'Run a clinic: the sick and the hurt line up at the well.', show: (g) => daily('clinic')(g) && !!g.flags.healed_try && !late(g), time: 20, to: 'clinic' },
            { text: 'Bone workshop: make things the village needs.', show: (g) => daily('workshop')(g) && !late(g), time: 10, to: 'workshop' },
            { text: 'Drill the village hunters. They\'ll be standing next to you tomorrow.', show: (g) => daily('drill')(g) && !late(g), time: 10, to: 'drill' },
            { text: 'Sit with Old Wen and listen.', show: (g) => !!g.flags.elder && daily('wen')(g) && !late(g), time: 20, to: 'wen_lesson' },
            { text: 'Hunt beyond the oak hollow.', show: (g) => daily('far')(g) && hour(g) < 16, time: 60, to: 'far_hunt' },
            { text: 'Scout the tribute road.', show: (g) => vday(g) === 3 && !g.flags.scouted_try && hour(g) < 17, time: 30, to: 'scout' },
            { text: 'Walk with Mei Lin at sunset.', show: (g) => daily('walk')(g) && hour(g) >= 15 && hour(g) < 20, time: 30, to: 'mei_walk' },
            { text: 'Eat at the communal pot.', show: (g) => daily('pot')(g) && g.james.satiety < 80 && !late(g), time: 30, do: (g) => { markDaily(g, 'pot'); eat(g, 25); return ['Barley and bean stew, ladled by a woman who addresses you as "honoured guest" in a tone that makes clear she has not yet decided whether you are one: +25 satiety.']; }, to: 'ashfall' },
            { text: 'Eat something from the hammerspace.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'ashfall' },
            { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['+8 HP. It still tastes like a cellar.']; }, to: 'ashfall' },
            { text: 'Cultivate behind the shrine: one sit, 10 Qi.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`] : []; }, to: 'ashfall' },
            { text: 'Rest an hour in the shade by the well.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'ashfall' },
            { text: 'Evening. Go home to Mei Lin\'s.', show: (g) => hour(g) >= 16, time: 20, to: nextEvening },
        ],
    },

    herb_slopes: {
        id: 'herb_slopes', title: 'The Herb Slopes', art: 'herb_slope', place: `${P} — the herb slopes`,
        enter: (g) => { markDaily(g, 'slopes'); return []; },
        text: (g) => (vday(g) === 2
            ? `Mei Lin works the slope like a general works a map: this patch, then that one, never the same root twice in a season. She shows you Ninefold grass, how to cut it so it grows back, how to tell the good stands from the ones that have *gone wrong* — leaves too red, too eager, Qi curdled like old milk.

"You don't need any of this," she says, not looking at you. "Why are you here?"

${g.flags.mei_bruised ? 'Her split lip has scabbed over. She catches you looking at it and stares back until you look away.' : ''}`
            : `Last day on the slopes before the tribute. She cuts twice as much as she needs and doesn't explain why. You don't ask. You both know: if tomorrow goes badly, there won't be a next season for her to cut it in.

She talks about her father again, a little. About how he used to bring her up here and name every plant wrong on purpose, so she'd correct him.`),
        choices: [
            { text: 'Learn properly. Ask questions, take samples, run the omnitool on everything.', check: { skill: 'GU', dc: 3 }, time: 150, do: (g) => { addItem(g, 'spirit_grass', 2); bumpRel(g, 'Mei Lin', 4, 2); return ['+2 Ninefold spirit grass (trade goods). Mei Lin grudgingly admits you have hands.']; }, failDo: (g) => { addItem(g, 'spirit_grass', 1); bumpRel(g, 'Mei Lin', 2, 1); return ['You cut one stand wrong. She sighs at you like a teacher. +1 Ninefold spirit grass.']; }, to: 'ashfall' },
            { text: 'Answer her question. Honestly.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 5); return ['"Because you\'re here," you say, and then, appalled at yourself: "And the grass is fascinating." She laughs so hard she has to sit down. On the next terrace an old herb-woman straightens up and stares at her until she stops. It takes a while.']; }, time: 150, to: 'ashfall' },
        ],
    },

    clinic: {
        id: 'clinic', title: 'The Well', art: 'healer', place: `${P} — by the well`,
        enter: (g) => { markDaily(g, 'clinic'); return []; },
        text: (g) => `Word got round about the boy. Now there's a line at the well: an old man with a hand gone purple, a girl with a burn, a hunter with a wound that smells wrong, a mother holding a baby who won't stop crying.

${g.inventory.jade_bracket ? 'You have jade bracket in the hammerspace. Fifteen years of mycology, and it comes down to this: a stone well and a queue.' : 'You have no fungus left. You have hands, a bone lancet, boiling water and a doctorate. It will have to do.'}`,
        choices: [
            { text: 'Treat them with the jade bracket.', show: (g) => hasItem(g, 'jade_bracket'), check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 150, do: (g) => { addItem(g, 'jade_bracket', -1); bumpRel(g, 'Village', 8, 0); g.flags.clinics = (g.flags.clinics || 0) + 1; return ['Everyone goes home better than they came. Ashfall keeps score.']; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); bumpRel(g, 'Village', 3, 0); return ['Most of them. Not the hunter. You\'ll check on him tonight.']; }, to: 'ashfall' },
            { text: 'Treat them with what you have.', check: { skill: 'GU', dc: 5 }, time: 150, do: (g) => { bumpRel(g, 'Village', 6, 0); g.flags.clinics = (g.flags.clinics || 0) + 1; return ['Clean water and a sharp knife, applied with a lot of confidence. It works.']; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return ['You do what you can. It isn\'t enough for everyone.']; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    workshop: {
        id: 'workshop', title: 'Bone Workshop', art: 'workshop', place: `${P} — the smithy, borrowed`,
        enter: (g) => { markDaily(g, 'workshop'); return []; },
        text: `The smith lends you his bench and stands well back. You sing bone into shapes that Ashfall has needed for years and can't afford in iron. Children gather at a safe distance, then at an unsafe one.`,
        choices: [
            { text: 'Needles and fishhooks for half the village.', qi: 3, check: { skill: 'Convergence Use', dc: 3 }, time: 120, do: (g) => { bumpRel(g, 'Village', 5, 0); return ['Every house gets a set. The seamstress bows to you three times, very low, and cannot be persuaded to stop.']; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return ['Some come out brittle. Still, fishhooks.']; }, to: 'ashfall' },
            { text: 'Spearheads for the hunters. They\'ll need them tomorrow.', show: (g) => !g.flags.spears, qi: 5, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 120, do: (g) => { g.flags.spears = true; bumpRel(g, 'Village', 4, 0); return ['Six white spearheads, hard as antler, sharp as an insult.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['They crack on the first test. Tomorrow, maybe.']; }, to: 'ashfall' },
            { text: 'A bone plough-share for the barley field.', show: (g) => !g.flags.plough, qi: 6, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 150, do: (g) => { g.flags.plough = true; bumpRel(g, 'Village', 10, 0); return ['It cuts the black earth like butter. Old Wen comes out to watch and doesn\'t say anything for a long time.']; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return ['It snaps on a root. The farmers bow and say nothing at all, which is much worse.']; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    drill: {
        id: 'drill', title: 'The Hunters', art: 'drill', place: `${P} — the threshing floor`,
        enter: (g) => { markDaily(g, 'drill'); return []; },
        text: (g) => `Eight hunters, two of them older than Old Wen and one of them twelve. They have bows, boar spears and the expression of men who have knelt to the Crimson Lotus every year of their lives.

${g.flags.militia ? 'Second day. They\'re faster now. They\'re standing differently. That might be the most dangerous thing you\'ve done here.' : 'You are not a soldier. You are, however, a man who has just spent days learning to stay alive against things with more teeth than you. You can teach that.'}`,
        choices: [
            { text: 'Teach them to fight together: shields of bone, spears behind, nobody alone.', check: { skill: 'GU', dc: 3, band: 'challenging' }, time: 150, do: (g) => { g.flags.militia = (g.flags.militia || 0) + 1; bumpRel(g, 'Village', 4, 0); return ['By the end they move like one animal. A clumsy animal. But one.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return ['Two of them hit each other. Still: progress.']; }, to: 'ashfall' },
            { text: 'Spar with the best of them, and let Yuki show them what speed looks like.', check: { skill: 'GU', dc: 4 }, time: 120, do: (g) => { bumpRel(g, 'Village', 3, 0); return ['You win, mostly. Yuki wins completely.', ...awardYukiFightXp(g, 'standard')]; }, failDo: (g) => { g.james.hp -= 2; return ['The twelve-year-old puts you on your back, then helps you up and apologises with great formality for the disrespect. −2 HP. That is somehow worse.', ...awardYukiFightXp(g, 'standard')]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    wen_lesson: {
        id: 'wen_lesson', title: 'Old Wen', art: 'elder', place: `${P} — the elder's house`,
        enter: (g) => { markDaily(g, 'wen'); return []; },
        text: (g) => (!g.flags.lore_realms
            ? `Old Wen pours tea and talks about cultivation the way an old farmer talks about weather: without hope, without fear, with a great deal of precise detail.

Mortal Vessel. Foundation. Core Formation. The realms go up like a ladder into cloud. Every rung costs more. The Sect buys rungs with villages like this one: grass, grain, children. "A ladder," he says, "is only a ladder if somebody holds the bottom."`
            : `Today he talks about the forest. About the Old Tree at its heart — "before the Sect, before my grandfather's grandfather" — and how the hunters' tales say it once sang, and the singing made the forest kind.

"Then one day it stopped. And the forest stopped being kind." He looks at you with his good eye. "Your cat's been staring toward it since you came. So have you."`),
        choices: [
            { text: 'Listen. Ask. Take notes in a mind with nine threads.', check: { skill: 'GU', dc: 2 }, time: 120, do: (g) => { if (!g.flags.lore_realms) g.flags.lore_realms = true; else g.flags.lore_tree = true; bumpRel(g, 'Old Wen', 4, 0); return []; }, failDo: (g) => { if (!g.flags.lore_realms) g.flags.lore_realms = true; else g.flags.lore_tree = true; return ['You drift. He notices, and forgives it.']; }, to: 'ashfall' },
        ],
    },

    far_hunt: {
        id: 'far_hunt', title: 'Past the Oak Hollow', art: (g) => (g.flags.far_kind === 'wolves' ? 'wolves' : g.flags.far_kind === 'bull' ? 'lizard' : 'herb_slope'), place: 'Blackroot Wilds — past the oak hollow',
        enter: (g) => { markDaily(g, 'far'); const r = d6(g); g.flags.far_kind = r <= 2 ? 'wolves' : r <= 4 ? 'bull' : 'deer'; return []; },
        text: (g) => ({
            wolves: 'The hunters warned you about the ash-wolves. You thought they were exaggerating. They were not exaggerating.',
            bull: 'A thornback, but a big one — a bull, twice the size of the one at your camp, spines like a hedge of spears.',
            deer: 'Ash-deer: grey, delicate, and fast. The hunters say nobody has taken one with an arrow in ten years.',
        }[g.flags.far_kind]),
        choices: [
            { text: 'Fight.', show: (g) => g.flags.far_kind !== 'deer', combat: farHunt, to: 'far_won' },
            { text: 'Back off. Not today.', show: (g) => g.flags.far_kind !== 'deer', time: 60, to: 'ashfall' },
            { text: 'Let them go. Not today.', show: (g) => g.flags.far_kind === 'deer', time: 60, to: 'ashfall' },
            { text: 'A dart, from a hundred paces, through the gap in the birches.', show: (g) => g.flags.far_kind === 'deer', qi: 2, check: { skill: 'Convergence Use', dc: 5 }, time: 120, do: (g) => { addItem(g, 'venison', 3); bumpRel(g, 'Village', 5, 0); return ['+3 Ash-deer venison, and the hunters have a new story to tell.']; }, failDo: () => ['Gone, like smoke.'], to: 'ashfall' },
        ],
    },
    far_won: {
        id: 'far_won', title: 'Meat and Cores', art: (g) => (g.flags.far_kind === 'wolves' ? 'wolves' : 'lizard'), place: 'Blackroot Wilds — past the oak hollow',
        enter: (g) => { addItem(g, 'beast_core', 1); addItem(g, g.flags.far_kind === 'wolves' ? 'venison' : 'lizard_egg', 2); bumpRel(g, 'Village', 5, 0); return [`+1 Murky beast core, +2 ${g.flags.far_kind === 'wolves' ? 'wolf meat (as venison)' : 'thornback eggs'}.`]; },
        text: `You drag it back to Ashfall in pieces. The hunters receive each load in silence and bow to it, the way you bow to a fallen enemy. Then, gravely, to you.`,
        choices: [{ text: 'Back to the village.', time: 60, to: 'ashfall' }],
    },
    far_lost: {
        id: 'far_lost', title: 'Not Today', art: 'herb_slope', place: 'Blackroot Wilds — past the oak hollow',
        text: `You get away, which is the most important part of losing. You get back to Ashfall bleeding, and Mei Lin patches you up while telling you, at length, how stupid you are.`,
        choices: [{ text: 'Accept the lecture.', time: 60, do: (g) => { bumpRel(g, 'Mei Lin', 2, 2); return []; }, to: 'ashfall' }],
    },

    scout: {
        id: 'scout', title: 'The Tribute Road', art: 'ridge', place: 'The road to the Crimson Lotus',
        enter: set('scouted_try'),
        text: `The road climbs out of Ashfall in long switchbacks toward the mountains. Halfway up, a waystation: a roofed bench, a shrine with a red lotus carved into it, and — your threads notice — fresh marks in the dust where someone has been standing and watching the village.`,
        choices: [
            { text: 'Read the ground. Who\'s been here, how many, how long?', check: { skill: 'GU', dc: 4 }, time: 150, do: (g) => { g.flags.scouted = true; return ['Two watchers, three days running, outer-sect boots. Tomorrow they\'ll know exactly what you are — or think they do. Good. You can use that.']; }, failDo: () => ['The marks blur into each other. Somebody watched. That\'s all you know.'], to: 'ashfall' },
        ],
    },

    mei_walk: {
        id: 'mei_walk', title: 'Sunset', art: 'roof', place: `${P} — the edge of the barley`,
        enter: (g) => { markDaily(g, 'walk'); return []; },
        text: (g) => (vday(g) === 2
            ? `You walk the field edge as the sun goes down red. She walks close enough that your sleeves brush and pretends she doesn't notice. Yuki walks between you at intervals, like a chaperone with a grudge.

"When it goes bad tomorrow," she says, "and it will — take the cat and go. Don't be a hero for a village that isn't yours."

"Bit late for that."`
            : `The last sunset before the tribute. She doesn't talk at all this time. She just takes your hand halfway along the field edge and doesn't let go until the lamps come on.`),
        choices: [{ text: 'Walk her home.', do: (g) => { bumpRel(g, 'Mei Lin', 3, meiRel(g).a >= 8 ? 5 : 4); return []; }, time: 60, to: 'ashfall' }],
    },
};
