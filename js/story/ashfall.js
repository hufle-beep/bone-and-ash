/**
 * Days 5–6 in Ashfall Hamlet (the long route): suppers at Mei Lin's, a free day loop around the village,
 * a night visit shaped by what James did to Gao Feng, and bonuses that pay off when the Sect comes on Day 7.
 */
import { addItem, hasItem, eat, bumpRel, condense, sleepUntil, advance, d6, awardYukiFightXp, jamesHpMax, nightRest, nightTo } from '../core/game.js';
import { set, day, hour, daily, markDaily, forestScale, villageScale, grow, eatBest, pantry, foodCount, byForm, byDay, dayReply } from './common.js';

/* v0.11.136 (owner pick NC1, NT1's push 2): replies by day (js/core/lines.js dayReply): the first text is the old reply, the rest Fable's, one for each later day of a Coil. */
const DR_DISHES = dayReply("supper:2", [
    "Her mother washes the bowls, and over the water she gives you the village, low-voiced and in correct form: what each family owes the Sect, which houses the road has cost a child, which neighbours would hand you over for a measure of millet. Not one smile in all of it. No hour on this world has taught you more.",
    "Tonight it is the Sect's own people, delivered over the washing water in the same low voice: which collector can be shamed in front of his juniors, which one counts the sacks twice, which one takes more than is written. She dries a bowl as she finishes each name. When the last bowl is put away she inclines her head to you, slightly, as one does to a man who has been handed something to carry.",
]);
const DR_WEN_FOREST = dayReply("wen_lesson:forest", [
    (g) => byForm(g, "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, on your knee, has not once looked away from the forest.", "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, her chin on your knee, has not once looked away from the forest.", "You ask what the singing sounded like, in the hunters' tales. He weighs the question with great seriousness. \"Like a thing you have heard before,\" he says at last, \"and cannot name.\" You do not tell him that this is exactly right. Yuki, beside you, has not once looked away from the forest."),
    (g) => byForm(g, "You ask when it stopped: what season, what year. He gives you the season, and is ashamed that he cannot give the year. \"It was told to me as a man tells of a death in the house,\" he says. \"Quietly. Once.\" You put that in a thread of its own. Yuki, on your knee, has turned her ears toward the forest and left them there.", "You ask when it stopped: what season, what year. He gives you the season, and is ashamed that he cannot give the year. \"It was told to me as a man tells of a death in the house,\" he says. \"Quietly. Once.\" You put that in a thread of its own. Yuki, her chin on your knee, has turned her ears toward the forest and left them there.", "You ask when it stopped: what season, what year. He gives you the season, and is ashamed that he cannot give the year. \"It was told to me as a man tells of a death in the house,\" he says. \"Quietly. Once.\" You put that in a thread of its own. Yuki, beside you, has turned her ears toward the forest and left them there."),
]);
const DR_SLOPES = dayReply("herb_slopes:0", [
    "Mei Lin concedes, with reluctance, that you have hands.",
    "Mei Lin checks your cuts stand by stand, finds no fault, and reports it as if it were bad news.",
]);
const DR_CLINIC_F = dayReply("clinic:1:f", [
    "You do what two hands can. The line was longer than that.",
    "Boiled water and a steady hand go as far as they go. Today that is most of the line, and not all of it.",
]);
const DR_HOOKS_F = dayReply("workshop:0:f", [
    "A few come out brittle. Fishhooks, all the same.",
    "A few snap in the testing. The rest will hold a fish, if the fish is reasonable.",
]);
const DR_PLOUGH_F = dayReply("workshop:2:f", [
    "It breaks on a root. The farmers bow to the two halves and say nothing. You would have preferred words.",
    "This one lasts a whole furrow before it cracks along the grain. The farmers carry the pieces back to you on a cloth, with both hands, like something that died in office.",
]);
const DR_DRILL_F = dayReply("drill:0:f", [
    "Two of them hit each other. The apologies are faultless.",
    "The shields turn left. The spears turn right. Both halves do it together, at least.",
]);
const DR_DRILL_SPAR_F = dayReply("drill:1:f", [
    "The twelve-year-old tips you onto your back, hauls you up again, and begs pardon in full form for the disrespect. Of the two, the pardon hurts more.",
    "One of the old ones hooks your ankle with a boar spear and sets you down like a sack of barley. He then asks, gravely, whether the honoured guest fell on purpose, to teach them something. You say yes.",
]);

/* v0.11.169 (owner pick P3A, SR; Fable's texts, rule 10): the five cards that can run more than once (no `daily` since v0.11.157)
 * answered every success with the same line; now a line by day like their failures (the first text the old reply, rewritten). */
/** v0.11.170 (owner pick RV1, P3D; Fable's review of part 4, M1): a success closes its card for the rest of the Coil (oneoff.js
 * ONCE_MENUS), so a count of days only ever reached the first text; the five lists go by the village day instead (Day 6, vday 3 →
 * the second text). Registered as before (DAY_REPLIES). No save field. */
const onVillageDay = (key, list) => { dayReply(key, list); return (g) => { const t = list[(g.flags.vday || 1) >= 3 ? 1 : 0]; return typeof t === 'function' ? t(g) : t; }; };
const DR_CLINIC_J = onVillageDay("clinic:0", [
    "Nobody goes home worse, and most go home mended. Ashfall is keeping count.",
    "The jade bracket works its way down the queue. Those who limped to the well walk home slowly, so that the whole street can see.",
]);
const DR_CLINIC = onVillageDay("clinic:1", [
    "Clean water, a sharp lancet, and more confidence than the doctorate strictly covers. It holds.",
    "The water never comes off the boil, and the lancet keeps pace with it. By the last patient the queue is shorter than the row of people watching it.",
]);
const DR_HOOKS = onVillageDay("workshop:0", [
    "A set for every house. The seamstress bows to you three times, very low, and is working up to a fourth.",
    "Fine work: needles for the thin cloth kept for weddings, hooks for the small fish. The seamstress has brought her daughters to bow with her, in order of height.",
]);
const DR_DRILL = onVillageDay("drill:0", [
    "By the end the eight of them move as one animal. Not a graceful animal. But one.",
    "By the last pass the wall closes on the call. When the twelve-year-old stumbles, two shields cover him before he lands. Nobody alone: they have it.",
]);
const DR_SPAR = onVillageDay("drill:1", [
    (g) => byForm(g, "You win most of yours. Yuki wins all of hers.", "You win most of yours. Yuki is conceded hers with a bow, and demonstrates anyway, so that they know what was spared.", "You win most of yours. Yuki wins all of hers in a long dress, and hands each man back his spear."),
    (g) => byForm(g, "Your man lasts longer than he expected to, and says so. The one who drew Yuki reports, with pride, that he saw her. Once.", "Your man lasts long enough to be proud of it. The one who drew Yuki finds he can still move his legs while she looks at him. The others count it a win.", "Your man makes you work for it. Yuki fights hers one-handed and tells him, aloud, that his feet are sound. He bows as if given a title."),
]);
const P = 'Ashfall Hamlet';
const vday = (g) => g.flags.vday || 1;
const meiRel = (g) => g.rel['Mei Lin'] || { f: 0, a: 0 };
/** Where "back to the village" leads, and where the evening goes. */
export const hubOf = (g) => (g.flags.long && vday(g) >= 2 ? 'ashfall' : 'village');
export const nextEvening = (g) => (g.flags.long && vday(g) < 3 ? 'supper' : 'evening');
const late = (g) => hour(g) >= 19;
/** v0.11.157 (owner picks NX1, RV1 FT; Fable's lines): a failed clinic or spearhead card can be tried again the same day, so its reply
 * promises no later time (was "You'll check on him tonight." / "Tomorrow, maybe."). */
export const JADE_FAIL = 'Most of them. Not the hunter. He thanks you gravely anyway, which is worse.';
export const SPEARS_FAIL = 'They crack on the first test. The smith says nothing, with great formality.';

/* ---------- day fights past the oak hollow (grow with all the days) ---------- */
const farHunt = (g) => {
    const s = forestScale(g) + villageScale(g);
    const wolves = g.flags.far_kind === 'wolves';
    const enemies = wolves
        ? [{ name: 'Ash-wolf', hp: 7, dc: 4, atk: 5, dmg: 4 }, { name: 'Ash-wolf (old scar)', hp: 7, dc: 4, atk: 5, dmg: 4 }]
        : [{ name: 'Thornback bull', hp: 11, dc: 4, atk: 5, dmg: 5, dr: 1 }];
    return { id: wolves ? 'wolves' : 'thornback', intro: wolves ? 'Two ash-wolves leave the oaks in step, grey and narrow, like a pair of knives leaving the same sleeve.' : 'The thornback bull heaves up out of the bracken, every spine raised, hissing like a cart-sized kettle.', band: 'challenging', enemies: enemies.map((e) => grow(e, s)), win: 'far_won', lose: 'far_lost', flee: 'ashfall' };
};
const arson = (g) => {
    const s = forestScale(g) + villageScale(g);
    // v0.11.92 (X1): a fight after bed (Mei Lin wakes James) costs sleep
    return { id: 'arson', night: true, intro: 'Pock-Face raises his torch and grins. The two behind him fan out without being told, which says how often they have done this.', band: 'challenging', enemies: [{ name: 'Lackey Pock-Face', hp: 7, dc: 3, atk: 4, dmg: 3 }, { name: 'Hired thug', hp: 5, dc: 3, atk: 4, dmg: 3 }, { name: 'Hired thug', hp: 5, dc: 3, atk: 4, dmg: 3 }].map((e) => grow(e, s)), win: 'arson_won', lose: 'arson_lost' };
};

export const ASHFALL = {
    /* ---------- suppers (Days 4 and 5) ---------- */
    supper: {
        id: 'supper', title: 'Supper', art: 'dinner', place: `${P} — Mei Lin's house`,
        enter: (g) => {
            const p = hour(g);
            if (p < 19) advance(g, (19 - p) * 60);
            if (daily('supper')(g)) { markDaily(g, 'supper'); eat(g, 30); return ['Millet, greens and a little smoked fish: +30 satiety.']; }
            return [];
        },
        text: (g) => (vday(g) === 1
            ? `${g.flags.ignored
                ? 'You ask your way to her house. On the doorstep you apologise, in full, without one joke. She studies you until the silence has made its point, then steps aside, which you did not deserve, and sets a bowl before you, which you deserved even less.'
                : 'Mei Lin\'s house has two rooms, a herb loft, and a mother: a tiny, fierce woman who looks you over once and puts more millet in the pot without a word.'}

${byForm(g, `"Three days," the mother says, to the pot, ladling. "Three days, and they come up that road. Every year of my life." She gives you the largest piece of fish and looks at Yuki, then at you. "You will sleep in the loft. It is not proper. It is necessary." Her eyes rest on Yuki a while longer, and she inclines her head to her, by very little. "The spirit-beast will sleep where it chooses. One does not command such creatures."

Yuki, on the warm stove, closes her eyes in complete agreement.`, `"Three days," the mother says, to the pot, ladling. "Three days, and they come up that road. Every year of my life." She gives you the largest piece of fish and looks at Yuki, who is lying along the whole of the far wall, then at you. "You will sleep in the loft. It is not proper. It is necessary." Her eyes rest on Yuki a while longer, and she inclines her head to her, lower than she has to anyone tonight. "The spirit-beast will sleep where it chooses. One does not command such creatures. One moves the bench."

Yuki, with the stove at her back and most of the floor under her, closes her eyes in complete agreement.`, `"Three days," the mother says, to the pot, ladling. "Three days, and they come up that road. Every year of my life." She gives you the largest piece of fish. The next largest goes to Yuki, who has been seated at the head of the table, where the ears and the tail can be kept in view. "You will sleep in the loft," she tells you. "It is not proper. It is necessary." Then she inclines her head to Yuki, deeper than she has for anyone at this table. "The honoured one will sleep where she chooses. One does not assign a mat to such a guest."

"The stove," says Yuki, who has had her eye on it since she sat down. The mother nods, as one authority to another.`)}`
            : `Second supper at Mei Lin's. Her mother no longer watches you as she would a fox in the henhouse. She watches you as she would a fox she might find a use for.

Tonight she talks. Of Mei Lin's father, who had a spirit root, and who went up the road with the collectors when Mei Lin was six. Of the letter that came down four years later, two words long: *Tribulation. Honoured.* Of the box they buried, which had nothing in it.

Mei Lin clears the bowls through all of it, as loudly as bowls can be cleared. When her mother has finished she says, with her back to the room, "He'd have liked you. He was an idiot too."

"*Mei Lin.*" Her mother says it once, and it closes like a door. "You do not speak so of your father." Mei Lin does not apologise. She does not stop smiling either, and she does not look at her mother again until the meal is over.`),
        choices: [
            { text: 'Climb out onto the roof with Mei Lin and watch the stars come out.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 4); return []; }, time: 60, to: 'supper_roof' },
            { text: 'Help her mother with the dishes, and listen.', do: (g) => { bumpRel(g, 'Village', 3, 0); bumpRel(g, 'Mei Lin', 2, 0); bumpRel(g, 'Mother', 2, 0); return [DR_DISHES(g)]; }, time: 60, to: 'village_night' }, // v0.11.139 (owner pick MW1, MB): Mother +2
            { text: 'Go up to the loft early. Tomorrow will want everything you have.', to: 'village_night' },
        ],
    },
    supper_roof: {
        id: 'supper_roof', title: 'The Roof', art: 'roof', place: `${P} — on Mei Lin's roof`,
        text: (g) => (vday(g) === 1
            ? `The thatch still holds the day's warmth. The stars come out singly, then in a crowd, and every constellation among them is wrong.

"Which one's yours?" Mei Lin asks.

You search long enough to be sure. "None of them. Mine's too far to see." You point anyway, at an arbitrary patch of dark. "There. Probably. Give or take a galaxy."

She gives the patch of dark her full and serious attention. "It looks cold."

"It was warm. We grew our houses out of trees. They sang back when you sang to them." You stop. "Sorry. That sounds insane."

"It sounds," she says, "like the only thing anyone has told me in years that I wanted to be true."`
            : `Second night on the roof. This time she brings the plum wine, and does not ask whether you want any.

She tells you what the tribute costs, in numbers: so many baskets of grass, so many sacks of millet, so many children tested for roots. Which families hid their children last year, and which of those were caught. Her voice is perfectly level through all of it. Her hands are not.

After that she says nothing until the jar is nearly empty. Your forearm has been playing something slow and sad, very low, all evening. "Leave it," she says, when you reach to stop it. "It sounds like you do when you think nobody is watching." Then she lets her shoulder rest against yours, and neither of you mentions it.`),
        choices: [{ text: 'Stay until the cold drives you in.', do: (g) => { bumpRel(g, 'Mei Lin', 2, 3); return [vday(g) === 1 ? `You stay until your fingers stop working and she has run out of ways to hide that she is shivering. "Tell me about the trees again," she says on the way down, and you do, as far as the loft ladder. She does not say it sounds insane. She says goodnight as if the word cost her something.` : `Neither of you mentions it on the way down, either. At the foot of the ladder she takes the empty jar out of your hand, keeps hold of your wrist a little longer than the jar requires, and goes to her mother's room without looking back. You climb to the loft with one shoulder still warm.`]; }, to: 'village_night' }],
    },

    /* ---------- the night: quiet, or Gao Feng's doing (night 5) ---------- */
    village_night: {
        id: 'village_night', title: 'Night in Ashfall', art: (g) => (vday(g) === 2 && !g.flags.night5_done ? ((g.flags.gao_broken) ? 'token' : g.flags.gao_spared ? 'gao_window' : 'arson') : 'village_night'), place: `${P} — the herb loft`,
        // v0.11.94 (owner 2026-11-09 11:35, pick T-b1): night 2's beats (the arson, Gao's token, Gao at the window) come after
        // the bed at 01:00, like the camp nights (never back; the fight taken at once is over by 02:00, one after a failed
        // "Wake the street" starts at 01:50, like the camps' forced fights); a quiet night is untouched
        enter: (g) => (vday(g) === 2 && !g.flags.night5_done ? nightTo(g, 60) : []), // v0.11.151 (WD1, LN): the slept line
        text: (g) => {
            if (vday(g) !== 2 || g.flags.night5_done) return byForm(g, 'The herb loft smells of mint and drying ginseng, and under it the house breathes. Yuki settles on the middle of your chest, which is also the middle of your sleep. You let her have both.', 'The herb loft smells of mint and drying ginseng, and under it the house breathes. Yuki takes the loft, and leaves you a strip along the wall and one flank for a pillow. The posts creak, consider the matter, and hold.', 'The herb loft smells of mint and drying ginseng, and under it the house breathes. Yuki gives up the stove once the house is dark, stretches out behind you, and takes most of the blanket without discussion. You let her keep it.');
            if (g.flags.gao_broken) return `It is still dark when Mei Lin's hand on your shoulder wakes you. Her other hand is closed on a twist of cloth, and in the cloth is Gao Feng's jade token: she had it out of his sleeve while he was lying in the herbs with his arm pointing the wrong way.

The jade is warm. It *beats*, slow and faint, as if it kept a pulse of its own.

"Sect tokens talk to one another," she whispers. "Gao reached home today. By now they've heard him out: a mortal with no root and no Qi snapped a Crimson Lotus disciple like kindling." No smile comes with it. "They won't believe a word. That's the worse half. They'll come and look for themselves, and this will tell them exactly where to stand."`;
            if (g.flags.gao_spared) return `A pebble clicks off the shutter and wakes you. A second follows it.

Gao Feng is standing in the lane below, by himself, in the moonlight. One hand is in bandages, and the road has dusted his crimson robe grey. On the herb slope he looked older than this, and nowhere near as afraid.

"I am not here to fight," he says, hardly above a breath, and he bows: the whole bow, to its full depth, to a man in a lab coat at a window. "You left me my life. That is a debt. Why you did it, I cannot tell, and a debt I do not understand is one I cannot repay. I have not slept on it."`;
            return `${byForm(g, 'Yuki wakes you with four claws and one urgent thought: *fire.*', 'Yuki wakes you with one heavy paw, laid on your chest, and one urgent thought: *fire.*', 'Yuki wakes you with a hand on your shoulder and one word, spoken almost without breath: "Fire."')}

Down in the lane, torchlight. Three men are creeping toward the side of the house, where Mei Lin's herb loft, the one you are sleeping in, stands on its dry wooden posts. The man in front has a pocked face you remember from the herb slope.

Gao Feng's lackey has come to settle Gao Feng's grudge. With a torch. By night. A traditionalist.`;
        },
        choices: [
            { text: 'Sleep.', show: (g) => vday(g) !== 2 || !!g.flags.night5_done, to: 'village_morning' },
            // Gao broken (or dead, old saves): the token
            { text: 'Crush the token in a fist of bone. Silence it.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!(g.flags.gao_broken), qi: 4, check: { skill: 'Convergence Use', dc: 4 }, do: (g) => { g.flags.night5_done = true; g.flags.token_silenced = true; return ['The jade cracks with the sound of a bell rung under water. The pulse stops. Lu Han will have nothing to follow here.']; }, failDo: (g) => { g.flags.night5_done = true; addItem(g, 'sect_token', 1); return ['The bone skids off it, and it goes on pulsing. You put it in the hammerspace and hope that folded space can keep a secret.']; }, to: 'village_morning' },
            { text: 'Carry it far into the forest and bury it in the mire.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!(g.flags.gao_broken), time: 120, check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.night5_done = true; g.flags.token_silenced = true; return ['Lu Han is welcome to search a swamp for his cousin.']; }, failDo: (g) => { g.flags.night5_done = true; g.james.hp -= 3; return ['You get it buried, and something in the mire bites you for your trouble: −3 HP.']; }, to: 'village_morning' },
            // Gao spared: the visit
            { text: '"Because I\'m not from here. Where I\'m from, we don\'t kill people for being stupid. Go home, Gao."', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!g.flags.gao_spared, check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.night5_done = true; g.flags.gao_turned = true; return ['He looks up at you until the silence is awkward. Then he tells you all of it: Lu Han is bringing four men, not two. He wants you alive. He takes you for the heir of a hidden sect. "Let him go on thinking so," Gao says, and is gone.']; }, failDo: (g) => { g.flags.night5_done = true; g.flags.gao_warned = true; return ['He does not believe you. He warns you anyway: Lu Han wants you alive. Then the lane is empty.']; }, to: 'village_morning' },
            { text: 'A bone needle into the post an inch from his ear. "Ask me again and I\'ll explain it slower."', show: (g) => vday(g) === 2 && !g.flags.night5_done && !!g.flags.gao_spared, qi: 3, do: (g) => { g.flags.night5_done = true; g.flags.gao_warned = true; return ['The colour leaves his face. Lu Han wants you alive, he says, all in one breath, and then he is running.']; }, to: 'village_morning' },
            // Gao alive and humiliated: arson
            { text: 'Drop out of the loft into the middle of them.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !(g.flags.gao_broken) && !g.flags.gao_spared, combat: arson, to: 'arson_won' },
            { text: 'Wake the street. Let forty houses deal with three men.', show: (g) => vday(g) === 2 && !g.flags.night5_done && !(g.flags.gao_broken) && !g.flags.gao_spared, check: { skill: 'GU', dc: 4, bonus: (g) => ((g.rel.Village?.f || 0) >= 20 ? 2 : 0) }, do: (g) => { g.flags.night5_done = true; bumpRel(g, 'Village', 6, 0); return ['Up and down the lane the shutters crash back. Pock-Face and his two friends turn round into a hedge of pitchforks, and go home lighter by several teeth.']; }, fail: 'arson_start', to: 'village_morning' },
        ],
    },
    arson_start: {
        id: 'arson_start', title: 'Torches', art: 'arson', place: `${P} — the lane`,
        text: (g) => `The street is too slow to wake. Pock-Face finds you at the window, and he laughs.${byForm(g, '', " Behind you the loft boards creak as Yuki gets up, all of her. *He's only counted one of us,* says the bond.", " Behind you Yuki is standing already. \"He has counted one of us,\" she says, without much interest.")}`, /* v0.11.131 (XB2, FL; Fable's MAIN): the great root-kin */
        choices: [{ text: 'Then it\'s the hard way.', combat: arson, to: 'arson_won' }], // v0.11.169 (CA1, LB; Fable's wording): was "Then it's just you." (Yuki is there in two forms)
    },
    arson_won: {
        id: 'arson_won', title: 'Ash on the Lane', art: 'arson', place: `${P} — the lane`,
        enter: (g) => { g.flags.night5_done = true; g.flags.arson_beaten = true; bumpRel(g, 'Village', 10, 0); bumpRel(g, 'Mei Lin', 4, 3); return []; },
        text: `When the shutters open at last there is only the end of it to see: two thugs running, Pock-Face flat in the lane with a sliver of bone nailing his sleeve to the ground, and his torch hissing itself out in the gutter.

Half the lane turns out in its nightclothes, and nobody speaks. Then Mei Lin's mother arrives, in hers, considers Pock-Face at her feet, and says, as a magistrate passes sentence: "You came by night to burn a widow's house. Your ancestors will hear of it from me." She goes back to bed. Pock-Face, you observe, is crying.

That is the moment Ashfall decides you are theirs.`,
        choices: [{ text: 'Back to the loft.', to: 'village_morning' }],
    },
    arson_lost: {
        id: 'arson_lost', title: 'Smoke', art: 'arson', place: `${P} — the lane`,
        enter: (g) => { g.flags.night5_done = true; g.flags.loft_burned = true; return []; },
        text: (g) => `You don't stop them.${byForm(g, '', " Yuki has one of them flat in the lane under both forepaws, and it is the wrong one: the torch was in the other man's hand. She keeps him all the same, and when the street has finished with the fire it finds it still has somebody to be grave at.", " Yuki has one of them pinned in the lane with her knee between his shoulders, and it is the wrong one: the other man had the torch. She keeps him all the same, so that when the street has finished with the fire there is still somebody left for it to be grave at.")} The loft catches like paper. A year of Mei Lin's herbs, dried, sorted and tied, goes up in a single roar of sweet smoke. The street has the fire out before the house takes, and not by much.

Mei Lin stands in the lane, soot across her face, and looks at what is left. She says nothing at all. Any word from her would be easier to carry than that.`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; v0.11.131 (XB2, AP): she keeps him
        choices: [{ text: 'Sleep in the kitchen. If you can.', do: (g) => { bumpRel(g, 'Mei Lin', 0, -3); return []; }, to: 'village_morning' }],
    },

    /* ---------- mornings ---------- */
    village_morning: {
        id: 'village_morning', title: (g) => `Day ${day(g)}`, art: 'village', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) lines.push(nightRest(g)); // v0.11.92 (X1): half back after the arson fight
            g.flags.vday = vday(g) + 1;
            eat(g, 20);
            lines.push('Breakfast at Mei Lin\'s: rice gruel and pickles, +20 satiety.');
            return lines;
        },
        text: (g) => (vday(g) === 2
            ? `Ashfall in the morning: smoke from forty chimneys, a rooster who is plainly being paid for this, and children watching you from behind every wall.

Two days until the collectors. The village is being ordinary as loudly as it can. You have those two days to make sure that when the Crimson Lotus walks up that road, what waits at the top of it is a good deal stronger than one confused mycologist and Yuki. The mycologist is where the work is.`
            : `The last day. Tomorrow at sunrise, the collectors.

All of Ashfall is up early, and all of it has found some errand that leads past Mei Lin's house, to see whether you are still there. You are. ${g.flags.loft_burned ? 'What is left of the loft is still smoking a little.' : byForm(g, 'Yuki is sunning herself on the doorstep like a small white guard dog.', 'Yuki is sunning herself across the doorstep like a large white guard dog.', 'Yuki is sunning herself on the doorstep, eyes shut, like a white guard dog in a high black collar.')}`),
        choices: [{ text: 'Out into the village.', to: 'ashfall' }],
    },

    /* ---------- the day hub ---------- */
    ashfall: {
        id: 'ashfall', title: 'Ashfall', art: 'village', place: P,
        text: (g) => {
            const h = hour(g);
            const when = byDay(g, [0, 1], 'ashfall') // NT1 (Fable's draft): a second set of the times of day
                ? (h < 11 ? `Morning. Smoke going straight up, and the sound of somebody splitting wood as if it had wronged him.` : h < 15 ? `Midday. The well rope is too hot to hold and the dogs have gone under the houses.` : h < 18 ? `Late afternoon. The shadows of the houses have reached the far side of the street, and the cooking smells begin.` : `Dusk. Shutters closing one after another down the street, like a sentence being finished.`)
                : (h < 11 ? 'Morning. Ashfall is up, and already at work.' : h < 15 ? 'Midday, and hot. The chickens have stopped trying.' : h < 18 ? 'Late afternoon: long shadows, and woodsmoke from the cooking fires.' : 'Dusk. Lamps are being lit behind the shutters.');
            return `${when} ${vday(g) === 3 ? 'The red banners on the tribute post hang dead still. Tomorrow.' : 'The tribute is two days off.'}

${[pantry(g), g.james.satiety < 30 ? 'You are hungry.' : '', g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt.' : ''].filter(Boolean).join(' ')}`; // v0.11.169 (RV1, L8): no double space when a clause is empty
        },
        choices: [
            { text: 'Visit Old Wen.', show: (g) => !g.flags.elder && !late(g), time: 30, do: set('elder'), to: 'elder' },
            { text: 'Go to the coughing house. A child is sick.', show: (g) => !g.flags.healed_try && !late(g), time: 30, to: 'heal' },
            { text: 'Hunt the ironhide boar past the oak hollow.', show: (g) => !g.flags.village_hunt && hour(g) < 15, time: 90, to: 'village_hunt' },
            { text: 'Gather herbs with Mei Lin on the slopes.', show: (g) => daily('slopes')(g) && hour(g) < 15, time: 30, to: 'herb_slopes' },
            { text: 'Run a clinic: the sick and the hurt line up at the well.', show: (g) => !!g.flags.healed_try && !late(g), time: 20, to: 'clinic' },
            { text: 'Bone workshop: make things the village needs.', show: (g) => !late(g), time: 10, to: 'workshop' },
            { text: 'Drill the village hunters. They\'ll be standing next to you at the post.', show: (g) => !late(g), time: 10, to: 'drill' }, // v0.11.169 (CA1, LB): this and the spearheads said "tomorrow" on Day 5 too
            { text: 'Sit with Old Wen and listen.', show: (g) => !!g.flags.elder && daily('wen')(g) && !late(g), time: 20, to: 'wen_lesson' },
            { text: 'Hunt beyond the oak hollow.', show: (g) => daily('far')(g) && hour(g) < 16, time: 60, to: 'far_hunt' },
            { text: 'Scout the tribute road.', show: (g) => vday(g) === 3 && !g.flags.scouted_try && hour(g) < 17, time: 30, to: 'scout' },
            { text: 'Walk with Mei Lin at sunset.', show: (g) => daily('walk')(g) && hour(g) >= 15 && hour(g) < 20, time: 30, to: 'mei_walk' },
            { text: 'Eat at the communal pot.', show: (g) => daily('pot')(g) && g.james.satiety < 80 && !late(g), time: 30, do: (g) => { markDaily(g, 'pot'); eat(g, 25); return ['Barley and bean stew, ladled by a woman who addresses you as "honoured guest" in the tone of someone who has not yet ruled on whether you are one: +25 satiety.']; }, to: 'ashfall' },
            { text: 'Eat something from the hammerspace.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g, { fire: true }), to: 'ashfall' },
            { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['+8 HP. The flavour is still cellar.']; }, to: 'ashfall' },
            { text: 'Cultivate behind the shrine: one sit, 10 Qi.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'ashfall' },
            { text: 'Rest an hour in the shade by the well.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest.']), to: 'ashfall' },
            { text: 'Evening. Go home to Mei Lin\'s.', show: (g) => hour(g) >= 16, time: 20, to: nextEvening },
        ],
    },

    herb_slopes: {
        id: 'herb_slopes', title: 'The Herb Slopes', art: 'herb_slope', place: `${P} — the herb slopes`,
        enter: (g) => { markDaily(g, 'slopes'); return []; },
        text: (g) => (vday(g) === 2
            ? `Mei Lin works the slope as a general works a map: this patch, then that one, and never the same root twice in a season. She shows you Ninefold grass: how to cut it so that it grows back, and how to tell a good stand from one that has *gone wrong*, the leaves too red, too eager, the Qi in them curdled like old milk.

"You don't need any of this," she says, without looking at you. "Why are you here?"

${g.flags.mei_bruised ? 'Her split lip has scabbed over. She catches you looking at it, and stares back until you look somewhere else.' : ''}`
            : `It is the last day on the slopes before the tribute. She cuts double what she needs and offers no reason. You ask for none. It needs no saying: should tomorrow go wrong, she will have no next season to cut in. Halfway along the terrace, with her back to you and the knife still working, she asks again what a man who needs none of this is doing up here.

Her father comes up again, briefly. He would walk her up here and get the name of every plant wrong, on purpose, so that she had to put him right.`),
        choices: [
            { text: 'Learn properly. Ask questions, take samples, run the omnitool on everything.', check: { skill: 'GU', dc: 3 }, time: 150, do: (g) => { addItem(g, 'spirit_grass', 2); bumpRel(g, 'Mei Lin', 4, 2); return [`+2 Ninefold spirit grass (trade goods). ${DR_SLOPES(g)}`]; }, failDo: (g) => { addItem(g, 'spirit_grass', 1); bumpRel(g, 'Mei Lin', 2, 1); return ['You cut one stand wrong. She sighs at you as teachers sigh. +1 Ninefold spirit grass.']; }, to: 'ashfall' },
            { text: 'Answer her question. Honestly.', do: (g) => { bumpRel(g, 'Mei Lin', 3, 5); return ['"Because you\'re here," you say. You hear it, are appalled, and add: "The grass is also fascinating." She laughs until her legs give up and she sits down in it. One terrace over, an old herb-woman unbends and fixes her with a stare until the laughing stops. The stare is needed for a while.']; }, time: 150, to: 'ashfall' },
        ],
    },

    clinic: {
        id: 'clinic', title: 'The Well', art: 'healer', place: `${P} — by the well`,
        enter: (g) => { markDaily(g, 'clinic'); return []; }, // v0.11.157 (NX1, PA): a mark for "Call it a day" only, no longer a gate
        text: (g) => `Word of the boy has gone round. Now there is a line at the well: an old man whose hand has gone purple, a girl with a burn, a hunter with a wound that smells wrong, a mother with a baby that will not stop crying.

${g.inventory.jade_bracket ? 'You have jade bracket in the hammerspace. Fifteen years of mycology, and it comes down to a stone well and a queue.' : 'The fungus is gone. You have two hands, a bone lancet, boiling water and a doctorate. They will have to do.'}`,
        choices: [
            { text: 'Treat them with the jade bracket.', show: (g) => hasItem(g, 'jade_bracket'), check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 150, do: (g) => { addItem(g, 'jade_bracket', -1); bumpRel(g, 'Village', 8, 0); g.flags.clinics = (g.flags.clinics || 0) + 1; return [DR_CLINIC_J(g)]; }, failDo: (g) => { addItem(g, 'jade_bracket', -1); bumpRel(g, 'Village', 3, 0); return [JADE_FAIL]; }, to: 'ashfall' },
            { text: 'Treat them with what you have.', check: { skill: 'GU', dc: 5 }, time: 150, do: (g) => { bumpRel(g, 'Village', 6, 0); g.flags.clinics = (g.flags.clinics || 0) + 1; return [DR_CLINIC(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_CLINIC_F(g)]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    workshop: {
        id: 'workshop', title: 'Bone Workshop', art: 'workshop', place: `${P} — the smithy, borrowed`,
        enter: (g) => { markDaily(g, 'workshop'); return []; }, // v0.11.157 (NX1, PA): a mark for "Call it a day" only, no longer a gate
        text: `The smith lends you his bench and takes up a position well back from it. You sing bone into the shapes Ashfall has needed for years and cannot afford in iron. The children gather at a safe distance, and then at an unsafe one.`,
        choices: [
            { text: 'Needles and fishhooks for half the village.', qi: 3, check: { skill: 'Convergence Use', dc: 3 }, time: 120, do: (g) => { bumpRel(g, 'Village', 5, 0); return [DR_HOOKS(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_HOOKS_F(g)]; }, to: 'ashfall' },
            { text: 'Spearheads for the hunters. They\'ll need them when the collectors come.', show: (g) => !g.flags.spears, qi: 5, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 120, do: (g) => { g.flags.spears = true; bumpRel(g, 'Village', 4, 0); return ['Six white spearheads, hard as antler and sharp as an insult.']; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return [SPEARS_FAIL]; }, to: 'ashfall' },
            { text: 'A bone plough-share for the barley field.', show: (g) => !g.flags.plough, qi: 6, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, time: 150, do: (g) => { g.flags.plough = true; bumpRel(g, 'Village', 10, 0); return ['It goes through the black earth like a knife through curd. Old Wen comes out to watch, and says nothing until the furrow is done.']; }, failDo: (g) => { bumpRel(g, 'Village', 2, 0); return [DR_PLOUGH_F(g)]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    drill: {
        id: 'drill', title: 'The Hunters', art: 'drill', place: `${P} — the threshing floor`,
        enter: (g) => { markDaily(g, 'drill'); return []; }, // v0.11.157 (NX1, PA): a mark for "Call it a day" only, no longer a gate
        text: (g) => `Eight hunters: two of them white-bearded and old enough to be bowed to in the street, and one of them twelve. They have bows, boar spears, and the faces of men who have knelt to the Crimson Lotus every year of their lives.

${g.flags.militia ? 'They are faster than they were, and they stand differently. That may be the most dangerous thing you have done here.' : 'You are no soldier. You are, however, a man who has just spent several days learning to stay alive against things with more teeth than he has. That much you can teach.'}`,
        choices: [
            { text: 'Teach them to fight together: shields of bone, spears behind, nobody alone.', check: { skill: 'GU', dc: 3, band: 'challenging' }, time: 150, do: (g) => { g.flags.militia = (g.flags.militia || 0) + 1; bumpRel(g, 'Village', 4, 0); return [DR_DRILL(g)]; }, failDo: (g) => { bumpRel(g, 'Village', 1, 0); return [DR_DRILL_F(g)]; }, to: 'ashfall' },
            { text: 'Spar with the best of them, and let Yuki show them what speed looks like.', check: { skill: 'GU', dc: 4 }, time: 120, do: (g) => { bumpRel(g, 'Village', 3, 0); return [DR_SPAR(g), ...awardYukiFightXp(g, 'standard')]; }, failDo: (g) => { g.james.hp -= 2; return [`${DR_DRILL_SPAR_F(g)} −2 HP.`, ...awardYukiFightXp(g, 'standard')]; }, to: 'ashfall' },
            { text: 'Not today. Back to the village.', to: 'ashfall' },
        ],
    },

    wen_lesson: {
        dayKey: (g) => `wen_lesson:${g.flags.lore_realms ? 'forest' : 'realms'}`, // NT1 (Fable's draft): the forest talk's own days, so its first day is its first text
        id: 'wen_lesson', title: 'Old Wen', art: 'elder', place: `${P} — the elder's house`,
        enter: (g) => { markDaily(g, 'wen'); return []; },
        text: (g) => (!g.flags.lore_realms
            ? `Old Wen pours tea and talks of cultivation as an old farmer talks of weather: without hope, without fear, and in a great deal of exact detail.

Mortal Vessel. Foundation. Core Formation. The realms go up like a ladder into cloud, and each rung costs more than the last. The Sect buys its rungs with villages like this one: grass, grain, children. "A ladder," he says, "is only a ladder while somebody holds the bottom."`
            : byDay(g, [(g) => `The forest is today's lesson. He begins with the Old Tree that stands in the midst of it — "there before the Sect, there before my grandfather's grandfather" — and with what the hunters' tales hold: that it once sang, and the singing made the forest kind.

"Then a day came when it sang no more. And the forest was kind no more." He turns the good eye your way. ${byForm(g, "\"Your cat has been staring toward it since you came.", "\"Your great beast has been staring toward it since you came.", "\"Your companion has been staring toward it since you came.")} So have you."`, (g) => `He comes back to the forest today, as you thought he might. To the Old Tree — "older than the Sect, older than the oldest grave on the hill" — and to what the hunters' grandfathers said of it: that in the years it sang, a child could sleep under any branch in the Blackroot and wake with nothing worse than dew.

"I do not say it is true. I say it was said, and by serious men." He turns his cup a quarter turn, exactly. ${byForm(g, "\"Your cat sits facing it. Every day, the same way, like a needle.", "\"Your great beast lies facing it. Every day, the same way, like a needle.", "\"Your companion sits facing it. Every day, the same way, like a needle.")} You do the same, and do not know that you do it."`], 'wen_lesson:forest')),
        choices: [
            { text: 'Listen. Ask. Take notes in a mind with nine threads.', check: { skill: 'GU', dc: 2 }, time: 120, do: (g) => { const first = !g.flags.lore_realms; if (first) g.flags.lore_realms = true; else g.flags.lore_tree = true; bumpRel(g, 'Old Wen', 4, 0); return [first ? `You take it down rung by rung, in a thread of its own, and ask who holds the bottom of the ladder here. Old Wen's good eye stays on you until the tea has stopped steaming. "Now you have asked the right question," he says. "Nobody in Ashfall has asked it since my father's time."` : DR_WEN_FOREST(g)]; }, failDo: (g) => { if (!g.flags.lore_realms) g.flags.lore_realms = true; else g.flags.lore_tree = true; return ['Your attention drifts. He notices, and forgives it.']; }, to: 'ashfall' },
        ],
    },

    far_hunt: {
        dayKey: (g) => `far_hunt:${g.flags.far_kind}`, // v0.11.135 (NT1, EV1)
        id: 'far_hunt', title: 'Past the Oak Hollow', art: (g) => (g.flags.far_kind === 'wolves' ? 'wolves' : g.flags.far_kind === 'bull' ? 'lizard' : 'herb_slope'), place: 'Blackroot Wilds — past the oak hollow',
        enter: (g) => { markDaily(g, 'far'); const r = d6(g); g.flags.far_kind = r <= 2 ? 'wolves' : r <= 4 ? 'bull' : 'deer'; return []; },
        text: (g) => ({
            wolves: byDay(g, ['The hunters warned you about the ash-wolves, and you took it for exaggeration. It was not exaggeration.', `The ash-wolves again. They have not got fewer since the hunters warned you, and they have not got politer. The hunters, to be fair, never said they would.`], `far_hunt:wolves`),
            bull: byDay(g, ['A thornback, and a large one: a bull, twice the size of the one that came to your camp, wearing its spines like a hedge somebody has sharpened.', `A thornback bull again: big as a hay cart, spines like a rack of spears, standing square in the path with the calm of something that has never once had to move.`], `far_hunt:bull`),
            deer: byDay(g, ['Ash-deer, grey and fast, with bones like reeds. The hunters reckon it ten years since an arrow last brought one down.', `The ash-deer are in the birches again, grey among grey trunks, stepping as if the ground might complain. One lifts its head and looks straight at you from a hundred paces. The hunters say that is as close as anyone gets.`], `far_hunt:deer`),
        }[g.flags.far_kind]),
        choices: [
            { text: 'Fight.', show: (g) => g.flags.far_kind !== 'deer', combat: farHunt, to: 'far_won' },
            { text: 'Back off. Not today.', show: (g) => g.flags.far_kind !== 'deer', time: 60, to: 'ashfall' },
            { text: 'Let them go. Not today.', show: (g) => g.flags.far_kind === 'deer', time: 60, to: 'ashfall' },
            { text: 'A dart, from a hundred paces, through the gap in the birches.', show: (g) => g.flags.far_kind === 'deer', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 120, do: (g) => { addItem(g, 'venison', 3); bumpRel(g, 'Village', 5, 0); return ['+3 Ash-deer venison, and a story the hunters will tell for ten years.']; }, failDo: () => ['Gone, as smoke goes.'], to: 'ashfall' },
        ],
    },
    far_won: {
        id: 'far_won', title: 'Meat and Cores', art: (g) => (g.flags.far_kind === 'wolves' ? 'wolves' : 'lizard'), place: 'Blackroot Wilds — past the oak hollow',
        enter: (g) => { addItem(g, 'beast_core', 1); addItem(g, g.flags.far_kind === 'wolves' ? 'venison' : 'lizard_egg', 2); bumpRel(g, 'Village', 5, 0); return [`+1 Murky beast core, +2 ${g.flags.far_kind === 'wolves' ? 'wolf meat (as venison)' : 'thornback eggs'}.`]; },
        text: (g) => byDay(g, [`It comes back to Ashfall a piece at a time. The hunters take each load from you without a word and bow to it, as one bows to a fallen enemy. Then, with equal gravity, to you.`, `You carry it home in loads. This time the hunters meet you at the oak hollow, unasked, and take the weight from you in order of age. Nobody says well done. The eldest looks at the kill, then at you, and inclines his head by the width of a finger, and you understand that you have been promoted.`], 'far_won'),
        choices: [{ text: 'Back to the village.', time: 60, to: 'ashfall' }],
    },
    far_lost: {
        id: 'far_lost', title: 'Not Today', art: 'herb_slope', place: 'Blackroot Wilds — past the oak hollow',
        text: (g) => `Losing has one part that matters, and you manage it: you get away. You bleed all the road to Ashfall, where Mei Lin patches you and lists, with examples, the ways you are a fool.${byForm(g, '', " Yuki comes in behind you on three good legs and lies down across the doorway. Mei Lin steps over her without breaking off, comes back with the salve, and starts on the cat. The lecture now covers you both.", " Yuki comes in behind you holding one arm with the other, and sits on the doorstep without a word. Mei Lin does not break off. She fetches the salve, turns the arm to the light, and starts on it. The lecture now covers you both.")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Accept the lecture.', time: 60, do: (g) => { bumpRel(g, 'Mei Lin', 2, 2); return [`You let her finish. It takes a while. She sews while she talks, and the angrier she gets, the smaller and neater the stitches become. When she has tied off the last one she presses her thumb on it, hard, and says, "Next time, take me." You do not point out that this is not an argument. It was never meant as one.`]; }, to: 'ashfall' }],
    },

    scout: {
        id: 'scout', title: 'The Tribute Road', art: 'ridge', place: 'The road to the Crimson Lotus',
        enter: set('scouted_try'),
        text: `Out of Ashfall the road goes up toward the mountains, one long switchback after another. A waystation sits at the halfway turn: a bench under a roof, a shrine with a red lotus cut into the stone, and dust that your threads flag. The marks in it are fresh. Somebody has been standing here, watching the village.`,
        choices: [
            { text: 'Read the ground. Who\'s been here, how many, how long?', check: { skill: 'GU', dc: 4 }, time: 150, do: (g) => { g.flags.scouted = true; return ['Two watchers, three days running, in outer-sect boots. By tomorrow they will know exactly what you are, or believe they do. Good. That can be used.']; }, failDo: () => ['The marks run into one another. Somebody watched. The ground says no more.'], to: 'ashfall' },
        ],
    },

    mei_walk: {
        id: 'mei_walk', title: 'Sunset', art: 'roof', place: `${P} — the edge of the barley`,
        enter: (g) => { markDaily(g, 'walk'); return []; },
        text: (g) => (vday(g) === 2
            ? `You walk the edge of the field while the sun goes down red. She walks near enough that your sleeves brush, and gives no sign of having noticed. ${byForm(g, 'Yuki walks between you at intervals, a chaperone with a grudge.', 'Yuki walks between you wherever the path is wide enough and in some places where it is not, a chaperone with a grudge and the means to enforce it.', 'Yuki walks three paces behind with her hands clasped at her back, a chaperone with a grudge and an excellent view.')}

${byForm(g, `"When it goes bad at the post," she says, "and it will, take the cat and go. Don't be a hero for a village that isn't yours."`, `"When it goes bad at the post," she says, "and it will, take that great white beast of yours and go. Don't be a hero for a village that isn't yours."`, `"When it goes bad at the post," she says, "and it will, take her and go." She nods back at Yuki without turning round. "Don't be a hero for a village that isn't yours."`)}

"Bit late for that."`
            : `The last sunset before the tribute. This time she does not talk at all. Halfway along the field edge she takes hold of your hand, and she does not let go of it until the lamps come on.`),
        choices: [{ text: 'Walk her home.', do: (g) => { bumpRel(g, 'Mei Lin', 3, meiRel(g).a >= 8 ? 5 : 4); return [vday(g) === 2 ? `You walk her to her mother's door in the last of the red light. On the step she turns, looks at you as though there were something else she meant to say, and says "Idiot," very quietly, in its place. ${byForm(g, 'Yuki pushes past you both and goes in first, as though the house were hers. By now it may be.', 'Yuki goes in first, shoulders turned to clear the doorposts, as though the house were hers. By now it may be; nobody inside is going to raise the matter.', 'Yuki says "Excuse me" to the space between you, walks through it, and goes in first, as though the house were hers. By now it may be.')}` : `She does not let go at the door, either. She stands there with your hand in hers and the lamplight on her face and says, "Tomorrow, whatever happens, I'm glad you came out of that forest." Then she goes in, quickly, before you can answer, and you stand in the lane for a while, learning how to breathe again.`]; }, time: 60, to: 'ashfall' }],
    },
};
