/**
 * Days 2–3 in the Blackroot Wilds: a free loop of foraging, hunting, exploring and training, with a random
 * night (a fight or a quiet one) after nights 1 and 2. The jackals come on night 3, or the night James leaves.
 */
import { addItem, hasItem, eat, bumpRel, condense, sleepUntil, advance, clockParts, d6, awardYukiFightXp, awardXp, jamesHpMax, jamesQiMax, nightTo, nightRest } from '../core/game.js';
import { condensationSatGain } from '../core/formulas.js';
import { sitGain } from '../core/game.js';
import { set, day, hour, daily, markDaily, forestScale, grow, eatBest, pantry, foodCount } from './common.js';

const P = 'Blackroot Wilds';
const did = (key) => (g) => { markDaily(g, key); return []; };
/** v0.11.71 (owner pick X1; owner 2026-11-07 21:31): from Coil 2 Explore is not once a day: another trip while it is before 16:00. */
export const replayExplore = (g) => ((g.coil && g.coil.n) || 1) >= 2;
const loot = (lines) => () => lines;

/* ---------- where the night goes ---------- */
export const nightNext = (g) => (g.flags.leave_forest || (g.flags.forest_day || 1) >= 3 ? 'night_attack' : 'night_event');

/* ---------- night encounters (grow with the forest days) ---------- */
const nightFight = (kind) => (g) => {
    const s = forestScale(g);
    const base = {
        crows: { intro: 'Three rot-crows drop out of the dark in a stink of old meat, straight for your food — and your eyes.', enemies: [1, 2, 3].map((i) => ({ name: `Rot-crow ${i}`, hp: 3, dc: 3, atk: 4, dmg: 2, prefersSmall: true })) },
        rats: { intro: 'Two mire-rats the size of dogs come up out of the stream, dripping, teeth first.', enemies: [{ name: 'Mire-rat', hp: 5, dc: 3, atk: 4, dmg: 3, prefersSmall: true }, { name: 'Mire-rat (scarred)', hp: 5, dc: 3, atk: 4, dmg: 3, prefersSmall: true }] },
        lizard: { intro: 'The thornback lifts the ridge of spines along its back with a sound like a drawn sword.', enemies: [{ name: 'Thornback lizard', hp: 9, dc: 4, atk: 5, dmg: 4, dr: 1 }] },
    }[kind];
    return { id: kind, night: true, intro: base.intro, band: 'standard', enemies: base.enemies.map((e) => grow(e, s)), win: 'night_won', lose: 'night_lost', flee: kind === 'crows' ? null : 'night_fled' };
};

const NIGHT_EVENTS = ['lights', 'rain', 'crows', 'rats', 'lizard', 'gift'];
const ev = (k) => (g) => g.flags.night_ev === k;


export const WILDS = {
    night_event: {
        id: 'night_event', title: (g) => ({ lights: 'Lights', rain: 'Iron Rain', crows: 'Rot-crows', rats: 'Mire-rats', lizard: 'Thornback', gift: 'A Gift' }[g.flags.night_ev] || 'Night'), place: `${P} — the dry rise`,
        art: (g) => ({ lights: 'lights', rain: 'rain', crows: 'crows', rats: 'rats', lizard: 'lizard', gift: 'gift' }[g.flags.night_ev] || 'forest_night'),
        enter: (g) => {
            g.flags.long = true;
            let pick = NIGHT_EVENTS[d6(g) - 1];
            if (pick === g.flags.last_ev) pick = NIGHT_EVENTS[d6(g) - 1];
            g.flags.night_ev = pick;
            g.flags.last_ev = pick;
            nightTo(g, 60); // v0.11.40 (N1): never back; v0.11.91: after the bed (from 21:00), at 01:00
            return [];
        },
        text: (g) => ({
            lights: `You wake for no reason at all, which in your experience is the worst reason.

Between the black trunks, low to the ground, pale lights are moving. Not fireflies — too big, too slow, too *deliberate*. They drift in a loose line, all going the same way: toward the heart of the forest, where the dead tree stands.

Yuki is awake on your chest, ears flat, not hissing. Watching. Through the bond comes something that isn't a word. Closer to *grief*.`,
            rain: `It rains in the night: warm rain that tastes of iron and leaves a grey film on everything. The fire hisses and sulks.

Yuki makes it clear, through the bond and through her claws, that she holds you personally responsible for the weather.`,
            crows: `A sound like wet cloth tearing wakes you: wings. Three rot-crows, each the size of a cat, have landed on the fallen trunk above your head. Their feathers are moulting in clumps, their eyes are milky, and they smell exactly like you'd expect a bird named *rot-crow* to smell.

They are staring at your food. Then, thoughtfully, at your eyes.`,
            rats: `Something splashes in the stream, then again. Then the reeds part, and two mire-rats the size of dogs climb onto the bank, slick and black, tails like whips.

They've smelled the cat. They seem to think she's dinner. Yuki seems to think that's the funniest thing she's heard all week.`,
            lizard: `The ground under you is warm. That's the first thing. The second is the scrape of claws on rock, slow and heavy, and the third is the eye — gold, slit, the size of your palm — looking at you from the edge of the firelight.

A thornback lizard, long as a canoe, a ridge of hollow spines down its back. Your camp, it turns out, is on top of its nest.`,
            gift: `You wake to a weight on your chest and a smell of fresh blood.

Yuki is sitting on you, very upright, very pleased. On your sternum, laid out with ceremony, is a mire fowl — a fat, ugly, long-necked bird nearly as big as she is. She must have dragged it a hundred metres.

Through the bond: *you hunt like a tree. I am fixing it.*`,
        }[g.flags.night_ev]),
        choices: [
            { text: 'Watch where the lights go. Let the threads map it.', show: ev('lights'), check: { skill: 'GU', dc: 3 }, do: (g) => { g.flags.saw_lights = true; return ['Mapped: the lights flow toward the dead tree, like blood toward a heart that stopped.']; }, to: 'morning' },
            { text: 'Pull the blanket over your head. Not your business. Not tonight.', show: ev('lights'), to: 'morning' },
            { text: 'Sing a bone lean-to over the camp.', show: ev('rain'), qi: 2, check: { skill: 'Convergence Use', dc: 2 }, do: (g) => { return ['A ribbed white roof. Dry, smug, asleep.']; }, failDo: (g) => { g.james.hp -= 2; return ['It collapses in the night. Wet, cold, −2 HP.']; }, to: 'morning' },
            { text: 'Story Mode only (removed in v0.11.41).', show: () => false, to: 'morning' }, // v0.11.41 (D2-a): Story Mode's sit; the place kept (choice indices)
            { text: 'Get wet. Sleep anyway.', show: ev('rain'), to: 'morning' },
            { text: 'Fight them off.', show: ev('crows'), combat: nightFight('crows'), to: 'night_won' },
            { text: 'Throw them the scraps and keep your eyes.', show: ev('crows'), do: (g) => { const id = ['crimson_berry', 'river_cress', 'jade_bracket', 'crab_meat', 'hare_raw', 'fowl_raw'].find((k) => g.inventory[k] > 0); if (id) addItem(g, id, -1); return [id ? 'The crows take some of your food and leave.' : 'You have nothing to throw. The crows leave anyway, disgusted.']; }, to: 'morning' },
            { text: 'Fight. Rats are just bad mice.', show: ev('rats'), combat: nightFight('rats'), to: 'night_won' },
            { text: 'Up the fallen trunk with Yuki and wait them out.', show: ev('rats'), check: { skill: 'GU', dc: 3 }, failDo: (g) => { g.james.hp -= 3; return ['One gets your ankle on the way up: −3 HP.']; }, to: 'morning' },
            { text: 'Fight it. You\'re hungry, and it\'s made of meat.', show: ev('lizard'), combat: nightFight('lizard'), to: 'night_won' },
            { text: 'Back away slowly and give it its nest.', show: ev('lizard'), check: { skill: 'GU', dc: 4 }, time: 20, fail: 'night_lizard_forced', to: 'morning' },
            { text: 'Pluck it, dress it, and tell her she\'s the best hunter in two worlds.', show: ev('gift'), do: (g) => { addItem(g, 'fowl_raw', 1); bumpRel(g, 'Yuki', 3, 0); return ['+1 Mire fowl (dressed). Yuki accepts the praise as simple fact.', ...awardYukiFightXp(g, 'standard')]; }, to: 'morning' },
        ],
    },
    night_lizard_forced: {
        id: 'night_lizard_forced', title: 'Thornback', art: 'lizard', place: `${P} — the dry rise`,
        text: `You step on a dry branch. The lizard takes this personally.`,
        choices: [{ text: 'Fine. Fight.', combat: nightFight('lizard'), to: 'night_won' }],
    },
    night_won: {
        id: 'night_won', title: 'Quiet Again', art: (g) => ({ crows: 'crows', rats: 'rats', lizard: 'lizard' }[g.flags.night_ev] || 'forest_night'), place: `${P} — the dry rise`,
        enter: (g) => {
            g.flags.night_wins = (g.flags.night_wins || 0) + 1;
            if (g.flags.night_ev === 'crows') { addItem(g, 'crow_feather', 3); return ['+3 Rot-crow feathers. Nobody wants these.']; }
            if (g.flags.night_ev === 'rats') { addItem(g, 'hare_raw', 1); return ['A mire-rat, dressed, is technically meat: +1 (counts as hare; do not tell Yuki).']; }
            if (g.flags.night_ev === 'lizard') { addItem(g, 'lizard_egg', 3); addItem(g, 'lizard_spine', 4); addItem(g, 'beast_core', 1); return ['+3 Thornback eggs, +4 spines, +1 Murky beast core.']; }
            return [];
        },
        text: (g) => `${{
            crows: 'Feathers everywhere. The last crow flaps off into the dark, minus a wing\'s worth of pride.',
            rats: 'The rats go back into the stream, one of them much less alive than when it came out.',
            lizard: 'The thornback lies still across its nest, spines flat at last. Under it: eggs, leathery and warm, each the size of your fist.',
        }[g.flags.night_ev] || 'It\'s over.'}

Yuki washes a paw with tremendous dignity. You sit for a while with your heart going like a drum and notice, with clinical interest, that your hands only shake *afterwards* now.`,
        choices: [{ text: 'Sleep.', to: 'morning' }],
    },
    night_lost: {
        id: 'night_lost', title: 'Bitten', art: 'forest_night', place: `${P} — the dry rise`,
        enter: (g) => { const id = ['hare_raw', 'fowl_raw', 'crab_meat', 'lizard_egg', 'jade_bracket'].find((k) => g.inventory[k] > 0); if (id) addItem(g, id, -1); return id ? ['You lose some food in the scramble.'] : []; },
        text: `You lose. It isn't dramatic: you just end up on your back with a bleeding arm while whatever it was takes what it came for and leaves. Yuki sits on your chest until your heartbeat slows, which is either comfort or her checking whether you're still edible.`,
        choices: [{ text: 'Sleep, badly.', do: (g) => { sleepUntil(g, 6); g.james.hp = Math.ceil(g.james.hp * 0.7); return ['A bad night. HP partly back, Qi full.']; }, to: 'morning' }],
    },
    night_fled: {
        id: 'night_fled', title: 'Somewhere Else', art: 'forest_night', place: `${P} — further downstream`,
        text: `You grab what you can and move camp in the dark, two hundred metres downstream, swearing in a whisper the whole way.`,
        choices: [{ text: 'Sleep.', to: 'morning' }],
    },

    morning: {
        id: 'morning', title: (g) => `Day ${day(g)}`, art: 'forest_dawn', place: P,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 20) lines.push(nightRest(g)); // v0.11.92 (O1): half back after a night fight
            g.flags.forest_day = (g.flags.forest_day || 1) + 1;
            const out = eatBest(g);
            lines.push(out.length ? 'Breakfast. ' + out[0] : 'No breakfast. Your stomach files a formal complaint.');
            return lines;
        },
        text: (g) => `${g.flags.forest_day === 2
            ? `Morning, the second one. The red sun drags itself over the black trees, and you lie there for a minute taking inventory: one cat, one omnitool, one body that hurts in new and educational places. Still alive.

You could look for a way out. Or you could admit the truth: you know nothing about this world, and this forest is the gentlest teacher you're going to get. Learn it. Feed yourself. Get stronger. *Then* walk out.`
            : `Day three in the Blackroot. You wake before the light now, which is either adaptation or trauma, and you're not ready to have that conversation with yourself.

You know this patch of forest. The stream's moods, the reeds where the hares sleep, the smell of the mire on a west wind. Something has been circling your camp at a distance for two nights — you've found tracks. Big ones. Several. Patient.

${g.flags.saw_lights ? 'And the lights. You keep thinking about the lights.' : 'Tonight, you suspect, it stops being patient.'}`}`,
        choices: [{ text: 'Get up.', to: 'wilds' }],
    },

    wilds: {
        id: 'wilds', title: 'The Blackroot', art: 'stream', place: `${P} — the stream`,
        text: (g) => {
            const h = hour(g);
            const when = h < 11 ? 'Morning light comes through the canopy in red bars.' : h < 15 ? 'The day is hot and still and loud with insects.' : h < 18 ? 'The light is going amber.' : 'Dusk. The forest is getting ready to be something else.';
            return `${when} ${g.james.satiety < 30 ? 'You are hungry enough that it\'s getting into your hands.' : ''}

${pantry(g)}

${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt. Resting would be smart. You have a doctorate; you can do smart.' : ''}`;
        },
        choices: [
            { text: 'Forage.', show: (g) => hour(g) < 19, time: 15, to: 'wild_forage' },
            { text: 'Hunt.', show: (g) => hour(g) < 19, time: 15, to: 'wild_hunt' },
            { text: 'Explore deeper into the forest (takes the afternoon).', show: (g) => hour(g) < 16 && (replayExplore(g) || daily('explore')(g)) && !(g.flags.v_bone && g.flags.v_mire && g.flags.v_hollow), time: 30, to: 'wild_explore' },
            { text: 'Train: darts, blade, footwork, and a very unwilling sparring partner.', show: (g) => hour(g) < 19, time: 10, to: 'wild_train' },
            { text: 'Cultivate: one sit, 10 Qi toward Saturation.', show: (g) => hour(g) < 20, req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: 'wilds' },
            { text: 'Rest in the shade for an hour.', show: (g) => hour(g) < 20, do: (g) => advance(g, 60, { resting: true }).concat(['An hour of rest. Breath back, a little HP and Qi.']), to: 'wilds' },
            { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85, time: 15, do: (g) => eatBest(g), to: 'wilds' },
            { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['It tastes like a cellar. The cuts close while you chew.']; }, to: 'wilds' },
            { text: 'Make camp for the night.', show: (g) => hour(g) >= 15, time: 20, to: 'camp' },
            { text: 'Enough of the forest. Follow the stream out — today.', show: (g) => !g.flags.leave_forest && (g.flags.forest_day || 1) < 3 && hour(g) < 15, time: 240, do: set('leave_forest'), to: 'stream_out' },
        ],
    },
    stream_out: {
        id: 'stream_out', title: 'Downstream', art: 'stream', place: `${P} — far downstream`,
        text: `You follow the water. The forest thins, the stones get bigger, the stream gets louder. By late afternoon you can see the ridge ahead, and beyond it — maybe — smoke.

Not tonight, though. You're too tired to walk into strangers in the dark. You find another dry rise, another fallen trunk. Behind you, far back along the stream, something howls. Then something answers it. Then a third.

They've followed you.`,
        choices: [{ text: 'Make camp. Quickly.', to: 'camp' }],
    },

    /* ---------- foraging ---------- */
    wild_forage: {
        id: 'wild_forage', title: 'Foraging', art: 'forage', place: `${P} — the banks`,
        text: (g) => `You know three good spots by now. ${pantry(g)}`,
        choices: [
            { text: 'The mushroom ring under the black oaks.', show: daily('ring'), check: { skill: 'GU', dc: 3, bonus: () => 2 }, time: 50, do: (g) => { markDaily(g, 'ring'); addItem(g, 'jade_bracket', 3); return ['+3 Jade bracket fungus.']; }, failDo: (g) => { markDaily(g, 'ring'); addItem(g, 'jade_bracket', 1); g.james.hp -= 2; return ['One good cap, and one that wasn\'t: +1 Jade bracket, −2 HP.']; }, to: 'wild_forage' },
            { text: 'River cress in the shallows.', show: daily('cress'), check: { skill: 'GU', dc: 2 }, time: 40, do: (g) => { markDaily(g, 'cress'); addItem(g, 'river_cress', 4); return ['+4 River cress.']; }, failDo: (g) => { markDaily(g, 'cress'); addItem(g, 'river_cress', 2); return ['Leeches. +2 River cress anyway.']; }, to: 'wild_forage' },
            { text: 'The honey tree Yuki found. A needle through the comb\'s stalk, from below.', show: daily('honey'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 45, do: (g) => { markDaily(g, 'honey'); addItem(g, 'honeycomb', 2); return ['+2 Wild honeycomb. The bees are still arguing about it.']; }, failDo: (g) => { markDaily(g, 'honey'); addItem(g, 'honeycomb', 1); g.james.hp -= 3; return ['Stung. A lot. +1 Wild honeycomb, −3 HP.']; }, to: 'wild_forage' },
            { text: 'Needleberries, if the bushes have any left.', show: daily('berries'), check: { skill: 'GU', dc: 2 }, xp: false, time: 20, do: (g) => { markDaily(g, 'berries'); addItem(g, 'crimson_berry', 5); return ['+5 Crimson needleberries.']; }, failDo: (g) => { markDaily(g, 'berries'); return ['Birds got there first.']; }, to: 'wild_forage' },
            { text: 'Back to the stream.', to: 'wilds' },
        ],
    },

    /* ---------- hunting ---------- */
    wild_hunt: {
        id: 'wild_hunt', title: 'The Hunt', art: 'hunt', place: `${P} — the reeds`,
        text: `Yuki is already low in the grass, tail tip ticking like a metronome. *Choose,* says the bond. *Quickly. I am starving. I have been starving since birth.*`,
        choices: [
            { text: 'Glassback hare. A dart from cover.', show: daily('hare'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 50, do: (g) => { markDaily(g, 'hare'); addItem(g, 'hare_raw', 2); return ['+2 Glassback hare.']; }, failDo: (g) => { markDaily(g, 'hare'); return ['Rainbows, then nothing. Gone.']; }, to: 'wild_hunt' },
            { text: 'Mire fowl. They fly badly but they fly — a dart on the rise.', show: daily('fowl'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4, bonus: (g) => (g.yuki.fight.level >= 2 ? 1 : 0) }, time: 60, do: (g) => { markDaily(g, 'fowl'); addItem(g, 'fowl_raw', 1); return ['+1 Mire fowl.']; }, failDo: (g) => { markDaily(g, 'fowl'); return ['It flaps off honking what sounds like insults.']; }, to: 'wild_hunt' },
            { text: 'Stone-shell crab in the shallows. A needle into the joint of the shell.', show: daily('crab'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 40, do: (g) => { markDaily(g, 'crab'); addItem(g, 'crab_meat', 2); return ['+2 Stone-shell crab meat.']; }, failDo: (g) => { markDaily(g, 'crab'); g.james.hp -= 2; return ['It pinches back. −2 HP.']; }, to: 'wild_hunt' },
            { text: 'Let Yuki hunt on her own and just watch.', show: daily('yukihunt'), time: 60, do: (g) => { markDaily(g, 'yukihunt'); const got = d6(g) >= 4; if (got) addItem(g, 'hare_raw', 1); return [got ? 'She comes back with a hare and a look of mild contempt. +1 Glassback hare.' : 'She comes back with nothing, and pretends she wasn\'t trying.', ...awardYukiFightXp(g, 'standard')]; }, to: 'wild_hunt' },
            { text: 'Back to the stream.', to: 'wilds' },
        ],
    },

    /* ---------- training ---------- */
    wild_train: {
        id: 'wild_train', title: 'Practice', art: 'clearing', place: `${P} — the clearing`,
        text: `A clearing, a few marked trunks, a cat with opinions. Your threads run the numbers and inform you, politely, that you are not good at this yet.`,
        choices: [
            { text: 'Darts at marks on the trunks, from further and further away.', show: daily('t_darts'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 3 }, time: 60, do: did('t_darts'), failDo: did('t_darts'), to: 'wild_train' },
            { text: 'Blade forms: grow it, move, dissolve it, again.', show: daily('t_blade'), qi: 3, check: { skill: 'GU', dc: 3 }, time: 60, do: did('t_blade'), failDo: did('t_blade'), to: 'wild_train' },
            { text: 'Footwork: let Yuki pounce at you from cover and try not to be there.', show: daily('t_feet'), check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { markDaily(g, 't_feet'); return awardYukiFightXp(g, 'standard'); }, failDo: (g) => { markDaily(g, 't_feet'); g.james.hp -= 1; return ['Scratched. −1 HP.', ...awardYukiFightXp(g, 'standard')]; }, to: 'wild_train' },
            { text: 'Needle drills: one point, one knuckle-width, a hundred times.', show: daily('t_needle'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 60, do: did('t_needle'), failDo: did('t_needle'), to: 'wild_train' },
            { text: 'Enough. Back to the stream.', to: 'wilds' },
        ],
    },

    /* ---------- exploring ---------- */
    wild_explore: {
        id: 'wild_explore', title: 'Deeper', art: 'clearing', place: P,
        enter: (g) => { markDaily(g, 'explore'); return []; },
        text: `Your threads have been building a map. There are three places on it that are marked, in your own handwriting, *what is that*.`,
        choices: [
            { text: 'The Bone Field — the white you saw from the rise.', show: (g) => !g.flags.v_bone, time: 90, do: set('v_bone'), to: 'bone_field' },
            { text: 'The Mire — where the fowl come from and the smell goes to.', show: (g) => !g.flags.v_mire, time: 90, do: set('v_mire'), to: 'mire' },
            { text: 'The Hollow — the place your Convergence keeps leaning toward.', show: (g) => !g.flags.v_hollow, time: 120, do: set('v_hollow'), to: 'hollow' },
            { text: 'Never mind. Back to the stream.', to: 'wilds' },
        ],
    },
    bone_field: {
        id: 'bone_field', title: 'The Bone Field', art: 'bone_field', place: `${P} — the Bone Field`,
        text: `A valley of bones. Not a battlefield: a graveyard of *things*. Ribs like the frames of houses. A skull you could stand inside, half sunk in moss. Spines that run for fifty metres, vertebrae big as cartwheels.

Your Convergence lights up like a struck bell. Bone is bone; you can feel it all, a whole valley of it, old and dry and *listening*. These were beasts, and their cores were taken. Every skull has a hole drilled through the brow, neat as a coin. Someone harvested this place. Long ago.

Yuki walks along a rib, tail high, as if she owns it. Maybe, in some sense, she does.`,
        choices: [
            { text: 'Put your hand on the great skull and sing to it.', show: (g) => !g.flags.bone_sung, qi: 3, check: { skill: 'Convergence Use', dc: 4, band: 'challenging' }, do: (g) => { g.flags.bone_sung = true; return ['The skull hums back. For a moment you know its shape from the inside: how it grew, how it broke. Your darts will remember.']; }, failDo: (g) => [...set('bone_sung')(g), `The skull stays a skull. Your song goes into it and spreads out thin, a drop in a dry sea, and nothing hums back: there's too much of it, too old, and it has been listening to silence for too long to answer a stranger. You take your hand away. Yuki, up on her rib, has the decency not to look at you.`], to: 'bone_field' },
            { text: 'Grind a pouch of old bone into meal. Your stakes could use it.', show: (g) => !hasItem(g, 'bone_meal'), check: { skill: 'GU', dc: 2 }, time: 40, do: (g) => { addItem(g, 'bone_meal', 1); g.flags.stakes_hard = true; return ['+1 Giant\'s bone-meal. Your bone stakes will be harder from now on.']; }, to: 'bone_field' },
            { text: 'Walk back before the light goes.', time: 60, to: 'wilds' },
        ],
    },
    mire: {
        id: 'mire', title: 'The Mire', art: 'mire', place: `${P} — the Mire`,
        text: `Black water between grey hummocks, a smell like a cellar full of old eggs, and a silence that feels *held*. Fowl lift off in sullen ones and twos. The mud has opinions about your boots.

Here and there on the drowned stumps grow pale, gilled fungi that glow faintly, like something remembered. Your omnitool flags them at once: strange proteins, wound-healing, *very* interesting. Your whole career sits up and begs.

Something moves under the water. Several somethings.`,
        choices: [
            { text: 'Harvest the ghost-gills. Carefully. Properly.', show: (g) => !g.flags.gills, check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 45, do: (g) => { g.flags.gills = true; addItem(g, 'ghost_gill', 3); return [`You cut them at the base with a bone blade, leave the stalks to fruit again, and wrap each cap in moss the way you'd wrap a specimen worth your whole grant. Behind you the black water heaves once and settles. Yuki, on a hummock, does not take her eyes off it until you're done.`, '+3 Ghost-gill (chew one: +8 HP).']; }, failDo: (g) => { g.flags.gills = true; addItem(g, 'ghost_gill', 1); g.james.hp -= 2; return ['Leeches, a slip, one good cap. +1 Ghost-gill, −2 HP.']; }, to: 'mire' },
            { text: 'Wait for the somethings to come up. Then deal with them.', show: (g) => !g.flags.mire_fight, combat: (g) => ({ id: 'mire', intro: 'The mire-rats come out of the black water in a rush.', band: 'standard', enemies: [{ name: 'Mire-rat', hp: 5, dc: 3, atk: 5, dmg: 3, prefersSmall: true }, { name: 'Mire-rat', hp: 5, dc: 3, atk: 5, dmg: 3, prefersSmall: true }, { name: 'Mire-rat (bloated)', hp: 7, dc: 3, atk: 5, dmg: 4 }].map((e) => grow(e, forestScale(g))), win: 'mire_won', lose: 'mire_lost', flee: 'wilds' }), to: 'mire_won' },
            { text: 'Wade back out while you still have both boots.', time: 60, to: 'wilds' },
        ],
    },
    mire_won: {
        id: 'mire_won', title: 'The Mire', art: 'mire', place: `${P} — the Mire`,
        enter: (g) => { g.flags.mire_fight = true; addItem(g, 'beast_core', 1); return ['+1 Murky beast core (a rat had one — small, sour).']; },
        text: `Two rats fewer in the world. The silence of the mire settles back, unimpressed.`,
        choices: [{ text: 'Back to the hummocks.', to: 'mire' }],
    },
    mire_lost: {
        id: 'mire_lost', title: 'The Mire', art: 'mire', place: `${P} — the Mire`,
        enter: (g) => { g.flags.mire_fight = true; return []; },
        text: `You retreat with a bitten calf, a boot full of black water and the strong impression that the mire won that round on points.`,
        choices: [{ text: 'Limp back to the stream.', time: 60, to: 'wilds' }],
    },
    hollow: {
        id: 'hollow', title: 'The Hollow', art: 'hollow', place: `${P} — the Hollow`,
        text: (g) => `The ground drops into a bowl, and the bowl is full of roots. Not tree roots — or not *only*. They are as thick as a man, grey-white, smooth as old bone, and they run out of the earth on one side and into the earth on the other, all pointing the same way: toward the heart of the forest. Toward the dead tree.

You put your hand on one, and your Convergence *sings*.

It's faint. It's sad. It is, unmistakably, the same note your people's Hearth Trees sing, the note you grew up inside like a song your mother hummed. Here, under a poisoned sky, on a world that has never heard of you.

${g.flags.saw_lights ? 'The lights you saw at night came this way. You can see the faint trails where they passed — the moss is greener there.' : 'Yuki sits down very quietly, which she never does.'}`,
        choices: [
            { text: 'Sit among the roots and cultivate. Let the song in.', show: (g) => !g.flags.hollow_sit, check: { skill: 'Convergence Use', dc: 3 }, time: 60, do: (g) => { g.flags.hollow_sit = true; const gain = sitGain(g, 2); g.james.saturation = Math.min(100, Math.round((g.james.saturation + gain) * 10) / 10); return [`The roots carry your Qi round and back, clean as a held breath. Saturation +${Math.round(gain * 10) / 10}% (${g.james.saturation}%), no Qi spent.`]; }, failDo: (g) => [...set('hollow_sit')(g), `You sit. You open the loop. The song comes in and your Qi reaches for it like a hand for a hand, and misses: the note is too old, too slow, pitched for something far bigger than you. When you finally stand up you have nothing but pins and needles and the sense that the roots were patient with you, the way you'd be patient with a child.`], to: 'hollow' },
            { text: 'Follow one root as far as you dare.', show: (g) => !g.flags.roots, check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { g.flags.roots = true; return ['Two kilometres in, the root is warm. Something at the end of it is not entirely dead.']; }, failDo: (g) => { g.flags.roots = true; return ['The forest closes in. You turn back with the uneasy sense that it let you.']; }, to: 'hollow' },
            { text: 'Go back. You\'ll come back here. You know you will.', time: 60, to: 'wilds' },
        ],
    },
};
