/**
 * ACT 1, PART 2 — "Into the Blackroot" (Days 11–15).
 * James, Yuki, Mei Lin and Ya walk the Root Road (Days 11–12, root-wyrm on Day 12), cross the Drowned Wood (Day 13),
 * and climb the Ashen Hills (Days 14–15, rot-ape on Day 15) to camp under the dead Hearth Tree. Day hubs per region,
 * shared camp / fireside / night scenes, a seeded night event, and the Mei Lin – Ya – James romance arc.
 * Entry 'bl_start' (Day 11). Exit 'ht_start' (Day 16, 06:00). Region in g.flags.bl_region, expedition day in g.flags.bl_day (1–5).
 */
import { addItem, hasItem, eat, advance, clockParts, d6, awardYukiFightXp, jamesHpMax, condense, dayHour, nightTo, nightRest } from '../core/game.js';
import { hasForm } from '../core/forms.js';
import { daily, markDaily, eatBest, pantry, foodCount, hour } from './common.js';
import { encounter, rel, likesMei, likesYa, trio, trioStep, bumpRel, sleepUntil } from './act1_common.js';

const P = 'Blackroot Wilds';
const PLACE = { rr: `${P} — the Root Road`, dw: `${P} — the Drowned Wood`, ah: `${P} — the Ashen Hills` };
const region = (g) => g.flags.bl_region || 'rr';
const bday = (g) => g.flags.bl_day || 1;
const hubFor = (g) => ({ rr: 'rr_hub', dw: 'dw_hub', ah: 'ah_hub' }[region(g)]);
const late = (g) => hour(g) >= 19;
const both = (g) => likesMei(g) && likesYa(g);
const onlyYa = (g) => likesYa(g) && !likesMei(g);
const onlyMei = (g) => likesMei(g) && !likesYa(g);
/** Move the clock forward to hour h today (time passes: hunger, regen). */
function toHour(g, h) {
    const p = clockParts(g.minutes);
    const dh = dayHour(g);
    // v0.11.37: after midnight (24+) the hour has passed. v0.11.46: before 06:00 (04:00–05:59, or a night pushed through) it is
    // still the night: no jump forward to the evening (it used to skip 14–18 h)
    if (dh < h && dh >= 6) advance(g, (h - p.hh) * 60 - p.mm);
}
/** After a lost fight: the others drag you clear; you come round with some HP. */
const patchUp = (g) => { g.james.hp = Math.max(g.james.hp, Math.round(jamesHpMax(g) * 0.4)); return ['Mei Lin binds what she can. Ya calls you soft, and carries your pack.']; };

/* ---------------- encounters ---------------- */
const elkFight = (g) => encounter(g, { id: 'bone_elk', tier: 'small', intro: 'The bone-elk lowers a rack of antlers like a thicket of white knives and comes straight at you.', enemies: [{ name: 'Bone-elk', hp: 14, dc: 5.5, atk: 7, dmg: 5, dr: 1 }], win: 'rr_elk_won', lose: 'rr_elk_lost', flee: 'rr_hub' });
const wyrmFight = (g) => encounter(g, { id: 'root_wyrm', tier: 'region', intro: 'The root-wyrm uncoils from the split in the great root, bark-scaled, eyeless, long as a village street.', enemies: [{ name: 'Root-wyrm', hp: g.flags.wyrm_bridge_fail ? 20 : 24, dc: 6, atk: 7, dmg: 5, dr: 1 }], win: 'wyrm_won', lose: 'wyrm_lost' });
const serpentFight = (g) => encounter(g, { id: 'mire_serpent', tier: 'small', intro: 'The black water humps, and the mire serpent rises out of it with a mouth like a split log.', enemies: [{ name: 'Mire serpent', hp: 12, dc: 5, atk: 6, dmg: 4 }], win: 'dw_serpent_won', lose: 'dw_serpent_lost', flee: 'dw_hub' });
const drownedFight = (g) => encounter(g, { id: 'drowned', tier: 'small', intro: 'They come up out of the water without a splash. Three of them. They used to be people.', enemies: [{ name: 'Drowned man', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Drowned woman', hp: 7, dc: 5, atk: 6, dmg: 4 }, { name: 'Drowned child', hp: 5, dc: 5, atk: 5, dmg: 3 }], win: 'dw_drowned_won', lose: 'dw_drowned_lost' });
const hawksFight = (g) => encounter(g, { id: 'cinder_hawks', tier: 'small', intro: 'Three cinder hawks drop out of the haze, wings trailing sparks, screaming like kettles.', enemies: [1, 2, 3].map((i) => ({ name: `Cinder hawk ${i}`, hp: 5, dc: 5.5, atk: 6, dmg: 3, prefersSmall: true })), win: 'ah_hawks_won', lose: 'ah_hawks_lost', flee: 'ah_hub' });
const apeFight = (g) => encounter(g, { id: 'rot_ape', tier: 'region', intro: 'The rot-ape drops off the ridge onto all fours, and the ground jumps. Its fur is moss. Its eyes are not.', enemies: [{ name: 'Rot-ape', hp: g.flags.ape_lured ? 19 : 26, dc: 6, atk: 7, dmg: 6, dr: 1 }], win: 'ape_won', lose: 'ape_lost' });
const nightFight = (kind) => (g) => {
    const t = {
        wolves: { intro: 'Ash-wolves, two of them, circling the firelight the patient way.', enemies: [{ name: 'Ash-wolf', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Ash-wolf', hp: 8, dc: 5, atk: 6, dmg: 4 }] },
        drowned: { intro: 'Two of the drowned stand at the edge of the camp, dripping, waiting to be noticed.', enemies: [{ name: 'Drowned', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Drowned', hp: 7, dc: 5, atk: 6, dmg: 4 }] },
        serpent: { intro: 'The serpent comes up the bank toward the warmth of the fire.', enemies: [{ name: 'Mire serpent', hp: 11, dc: 5, atk: 6, dmg: 4 }] },
        hawks: { intro: 'Cinder hawks, two, diving at the fire as if it owes them money.', enemies: [{ name: 'Cinder hawk', hp: 5, dc: 5.5, atk: 6, dmg: 3, prefersSmall: true }, { name: 'Cinder hawk', hp: 5, dc: 5.5, atk: 6, dmg: 3, prefersSmall: true }] },
    }[kind];
    /* v0.11.25 (owner picks b1, X2, T1): the camp stakes (bl_camp, one night) cut the first attacker by 3 HP (4 with bone-meal),
       after the scaling and the ally floor, so the cut is real on every kind; at least 1 HP left. */
    const stake = g.flags.bl_stakes_night ? (g.flags.stakes_hard ? 4 : 3) : 0;
    const intro = stake ? `${t.intro} ${STAKE_LINES[kind]}` : t.intro;
    const r = encounter(g, { id: `night_${kind}`, tier: 'small', intro, enemies: t.enemies, win: 'bl_night_won', lose: 'bl_night_lost', flee: kind === 'drowned' ? null : 'bl_morning' });
    if (stake) r.enemies[0] = { ...r.enemies[0], hp: Math.max(1, r.enemies[0].hp - stake) };
    r.night = true; // v0.11.92 (O1): a night fight costs sleep (a flight too: the mark is set when it starts, and the flight goes straight to bl_morning)
    return r;
};
const STAKE_LINES = {
    wolves: 'One of them comes in off the stakes already bleeding.',
    drowned: 'One of them walks onto the stakes and keeps walking. It is leaking now, which is something.',
    serpent: 'It comes over the stakes and leaves a fair amount of itself on them.',
    hawks: 'One of them dives too low over the stakes and comes up with fewer feathers.',
};

/* ---------------- night events per region ---------------- */
const NIGHTS = {
    rr: ['song', 'wolves', 'lights', 'rut', 'warm', 'wolves'],
    dw: ['drowned', 'rain', 'lights', 'serpent', 'mei', 'drowned'],
    ah: ['hawks', 'stars', 'lights', 'warm', 'hawks', 'mei'],
};
const nev = (k) => (g) => g.flags.bl_ev === k;
const FIGHTS = ['wolves', 'drowned', 'serpent', 'hawks'];

/* ---------------- shared hub choices ---------------- */
/** v0.11.47 (owner 19:39, T1): any of bl_train's once-a-day drills left today (darts only once James can sing them). */
const trainLeft = (g) => daily('bt_ya')(g) || daily('bt_yuki')(g) || daily('bt_needle')(g) || (daily('bt_dart')(g) && hasForm(g, 'dart'));
function hubChoices(id) {
    return [
        { text: 'Talk to Mei Lin.', show: (g) => daily('tmei')(g) && !late(g), time: 10, to: 'talk_mei' },
        { text: 'Talk to Ya.', show: (g) => daily('tya')(g) && !late(g), time: 10, to: 'talk_ya' },
        { text: 'Train.', show: (g) => !late(g) && trainLeft(g), time: 10, to: 'bl_train' }, // v0.11.47 (owner 19:39, T1): gone once the day's drills are used up
        { text: 'Cultivate: one sit, 10 Qi toward Saturation.', show: (g) => !late(g), req: (g) => (g.james.qi >= 10 ? true : 'needs 10 Qi'), do: (g) => { const r = condense(g); return r.ok ? [`Condensed: Saturation ${r.saturation}%.`, ...r.xp] : []; }, to: id },
        { text: 'Rest an hour.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['An hour off your feet. Ya calls it a nap. You call it data collection.']), to: id },
        { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85 && (id !== 'rr_hub' || !!g.flags.ya_mocked), time: 15, do: (g) => eatBest(g, { fire: false }), to: id }, // v0.11.47: on the Root Road, "Eat with the others." (Manners) comes first
        { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['+8 HP. Still tastes like a cellar.']; }, to: id },
    ];
}
const hubText = (g, lead) => {
    const h = hour(g);
    const when = h < 11 ? 'Morning.' : h < 15 ? 'Midday.' : h < 19 ? 'Afternoon, going amber.' : 'Dusk.';
    return `${when} ${lead}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry enough that Ya has started offering you beetles.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt. Mei Lin keeps looking at your bandages and not saying anything, which is worse.' : ''}`;
};

export const BREAK_HUBS = ['rr_hub', 'dw_hub', 'ah_hub', 'bl_camp', 'heart_view'];

export const BLACKROOT = {
    /* =================================== the start =================================== */
    bl_start: {
        id: 'bl_start', title: 'Into the Blackroot', art: 'root_road', place: PLACE.rr,
        enter: (g) => {
            const p = clockParts(g.minutes);
            if (p.day < 11) g.minutes = 10 * 1440 + 6 * 60;
            g.flags.bl_region = 'rr';
            g.flags.bl_day = 1;
            g.flags.mei_party = true;
            g.flags.ya_party = true;
            return [];
        },
        text: `Ashfall sees you off at dawn the way Ashfall does everything: formally, in silence, with too many people. Old Wen bows exactly as deep as he would to a sect elder. Mei Lin's mother presses a bundle of millet cakes into your hands and says, "Bring her back," in a voice that makes it a contract.

Then the trees close behind you, and it's just the four of you. A biologist, a cat, a herb-woman with a basket and a knife, and Ya — barefoot, spear on her shoulder, walking backwards in front of you so she can watch your faces.

"Three days in, maybe four," Ya says. "If nothing eats us. Something will try. I'll let you know which." She grins at Mei Lin. "You bowed to the old man like your spine was on fire. Does it hurt, being that polite? Is there a cure?"

"There is," Mei Lin says. "It's called being raised by people."

By noon you reach the first of the roots: grey-white, smooth as bone, wide as a road, running out of the earth and on into the dark toward the heart of the forest. Your Convergence hums the moment you see it.`,
        choices: [{ text: 'Step up onto the Root Road.', time: 240, to: 'rr_hub' }],
    },

    /* =================================== the Root Road =================================== */
    rr_hub: {
        id: 'rr_hub', title: 'The Root Road', art: 'root_road', place: PLACE.rr,
        text: (g) => hubText(g, bday(g) === 1
            ? 'The root runs on ahead, wide enough for a cart, rising and falling over the forest floor like the spine of something asleep. Other roots join it from left and right. All of them go the same way.'
            : 'Day two on the Root Road. The roots are thicker here, and warmer. Ya says the road ends today, at the split — and that something lives in the split. She says it the way other people mention the weather.'),
        choices: [
            // v0.11.47 (owner 20:01): the Manners beat sits behind eating on the Root Road (was "Stop for the midday meal.", the same place in the list):
            // until it has played this card replaces "Eat something." here; Ya's millet cakes, so no food needed; then the ordinary card is back;
            // v0.11.48 (owner pick M1): at any Fed, as the old midday meal (the Fed < 85 gate hid it all morning after a full supper)
            { text: 'Eat with the others.', show: (g) => !g.flags.ya_mocked && !late(g), time: 30, to: 'ya_mocks' },
            { text: 'Ya has been staring at you for an hour. Ask her what her problem is.', show: (g) => !!g.flags.ya_mocked && !g.flags.ya_sparred && !late(g), time: 10, to: 'ya_fight_start' },
            { text: 'Forage along the roots.', show: (g) => daily('rr_forage')(g) && !late(g), time: 15, to: 'rr_forage' },
            { text: 'Hunt.', show: (g) => daily('rr_hunt')(g) && !late(g), time: 15, to: 'rr_hunt' },
            { text: 'Scout ahead with Ya.', show: (g) => daily('rr_scout')(g) && !late(g), time: 20, to: 'rr_scout' },
            { text: 'Put your hand flat on the root and listen.', show: (g) => !g.flags.rr_listened && !late(g), time: 30, to: 'rr_roots' },
            ...hubChoices('rr_hub'),
            { text: 'Make camp on the root.', show: (g) => bday(g) === 1 && hour(g) >= 16, time: 20, to: 'bl_camp' },
            { text: 'Push on to the end of the road. To the split.', show: (g) => bday(g) >= 2, time: 60, to: 'rr_end' },
        ],
    },
    ya_mocks: {
        id: 'ya_mocks', title: 'Manners', art: 'root_road', place: PLACE.rr,
        enter: (g) => { g.flags.ya_mocked = true; eat(g, 15); return ['Millet cakes on a root the size of a road: +15 satiety.']; },
        text: `Mei Lin sits, folds her legs under her, bows her head a fraction before she eats — the small thanks every child in Ashfall gives Heaven for food. Ya watches this with her mouth open, a millet cake halfway in.

Then she does an imitation. It is cruel, and it is accurate, and it involves a great deal of eyelash.

"Thank you, Heaven," Ya simpers, "for this cake I carried myself and baked myself and Heaven didn't do *shit* for—"

"Some of us," Mei Lin says, perfectly level, "were raised by people, and not by whatever dragged you out of a burrow."

Ya goes still. Not the stillness of someone hurt. The stillness of something deciding where to bite. "Say *animal*," she says softly. "Go on. Everyone does eventually."

"*Animal.*"

Yuki, on your shoulder, sends a single thought through the bond: *finally, some entertainment.*

They are both looking at you now.`,
        choices: [
            { text: 'Side with Mei Lin. "She thanks Heaven. You eat bugs. Nobody\'s perfect."', do: (g) => { bumpRel(g, 'Mei Lin', 4, 2); bumpRel(g, 'Ya', -4, 0); g.flags.ya_grudge = true; return ['Mei Lin\'s mouth twitches. Ya stalks off and eats alone, loudly.']; }, to: 'rr_hub' },
            { text: 'Side with Ya. "It was a pretty good impression."', do: (g) => { bumpRel(g, 'Ya', 4, 3); bumpRel(g, 'Mei Lin', -3, 0); return ['Ya crows. Mei Lin looks at you as if filing a report for later.']; }, to: 'rr_hub' },
            { text: 'Defuse it. "We have a four-day walk, one cat and no doctor. Pick a fight with the forest."', check: { skill: 'GU', dc: 4 }, do: (g) => { bumpRel(g, 'Mei Lin', 2, 0); bumpRel(g, 'Ya', 2, 0); return ['They both glare at you instead. That\'s progress, of a kind.']; }, failDo: (g) => { bumpRel(g, 'Ya', -2, 0); return ['Ya decides you are both cowards. She says so, in detail.']; }, to: 'rr_hub' },
        ],
    },
    ya_fight_start: {
        id: 'ya_fight_start', title: 'A Look', art: 'ya_fight', place: PLACE.rr,
        enter: (g) => { g.flags.ya_sparred = true; return []; },
        text: `"You looked at me," Ya says. She has stopped in the middle of the root and planted her spear. "When I took the elk's eye out this morning. You looked at me like the Sect looks at a beast. Like you were *writing it down*."

"I'm a biologist. I write everything down. I wrote down Mei Lin's hairpin."

"Don't be clever. I hate clever." She tosses the spear to Mei Lin, who catches it out of sheer reflex, and squares up to you bare-handed, bare-footed, grinning with every tooth she owns. "You want to study the animal? Come and study it."

Mei Lin, holding a spear she didn't ask for, says, "Please don't hurt each other. I've only got so much thread."

Yuki climbs down off your shoulder and sits at a safe distance, like someone who has bought a ticket.`,
        choices: [
            { text: 'Fight her. No bone, no Qi. Fair.', check: { skill: 'GU', dc: 6, band: 'challenging' }, time: 20, to: 'ya_spar_win', fail: 'ya_spar_lose' },
            { text: 'Apologise. Properly. Without a single joke.', do: (g) => { bumpRel(g, 'Ya', 2, 0); g.flags.ya_respected = true; return []; }, check: { skill: 'GU', dc: 5 }, to: 'ya_spar_win', fail: 'ya_spar_lose' },
        ],
    },
    ya_spar_win: {
        id: 'ya_spar_win', title: 'Pinned', art: 'ya_fight', place: PLACE.rr,
        enter: (g) => { bumpRel(g, 'Ya', 6, 6); bumpRel(g, 'Mei Lin', 0, 1); return []; },
        text: (g) => `${g.flags.ya_respected
        ? 'You apologise. No jokes. You tell her she\'s the best hunter you\'ve ever seen, and that you look at her the way you look at things that are better than you at something. She stares at you for a long moment, deeply suspicious. Then she kicks your feet out from under you anyway, for form, and lets you pull her down with you.'
        : 'It\'s short, ugly and educational. She\'s faster. You\'re heavier, and you have nine threads all running her footwork at once. When she goes for your knees the third time, you\'re not there, and she ends up face-down on the root with your knee in her back.'}

She's laughing. Flat on the bark, breathless, *delighted*.

"Oh, you're *good*," she says. "You're a liar, you said you were a scholar. Get off. No, stay. No — get off, the herb girl's looking."

Mei Lin is looking. Mei Lin hands Ya her spear back with the precise expression of a woman who has just discovered something about herself and does not care for it.`,
        choices: [{ text: 'Help her up.', to: 'rr_hub' }],
    },
    ya_spar_lose: {
        id: 'ya_spar_lose', title: 'Sat On', art: 'ya_fight', place: PLACE.rr,
        enter: (g) => { bumpRel(g, 'Ya', 4, 4); g.james.hp = Math.max(1, g.james.hp - 2); return ['−2 HP, and some dignity.']; },
        text: `It lasts about four seconds. You're on your back on the root, Ya is sitting on your chest, and she has your wrists pinned above your head with one hand like it's nothing.

"Scholar," she says, very pleased, very close. "You looked at me. Now I'm looking at you." She looks. Thoroughly. Then she licks your cheek, once, from jaw to temple, like a dog, and bounces off you.

"Salty," she announces to Mei Lin. "You should try."

Mei Lin turns the colour of the cinderberries and walks on ahead without a word. Yuki sends you a thought through the bond that is not a word, exactly, but is very clearly the sound of a cat laughing.`,
        choices: [{ text: 'Get up. Wipe your face. Say nothing.', to: 'rr_hub' }],
    },
    rr_forage: {
        id: 'rr_forage', title: 'Root-Foraging', art: 'root_road', place: PLACE.rr,
        enter: (g) => { markDaily(g, 'rr_forage'); return []; },
        text: `Three experts, three opinions. Mei Lin goes for the herbs in the root-shadows. You go for the fungus — bracket shelves the colour of old ivory on every crack in the bark. Ya goes for something under a loose flap of root-bark and comes back chewing.

"Grubs," she says, offering you a fat white one. "Good fat. Better than your mushrooms."

"Everything is better than my mushrooms to you."

"Not *everything*." She winks. It is a very aggressive wink.`,
        choices: [
            { text: 'The ivory brackets. Spore print, omnitool, the full liturgy.', check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 50, do: (g) => { addItem(g, 'jade_bracket', 3); return ['+3 Jade bracket fungus (the root variety, almost sweet).']; }, failDo: (g) => { addItem(g, 'jade_bracket', 1); return ['One good shelf, two that crumble. +1 Jade bracket.']; }, to: 'rr_hub' },
            { text: 'Help Mei Lin with the root-sorrel.', check: { skill: 'GU', dc: 3 }, time: 50, do: (g) => { addItem(g, 'river_cress', 4); bumpRel(g, 'Mei Lin', 2, 1); return ['+4 root-sorrel (counts as river cress). She corrects your knife-grip without looking up.']; }, failDo: (g) => { addItem(g, 'river_cress', 2); return ['You cut it wrong. She sighs. +2 root-sorrel.']; }, to: 'rr_hub' },
            { text: 'Eat the grub.', do: (g) => { eat(g, 10); bumpRel(g, 'Ya', 3, 2); return ['It pops. It tastes like nutty cream and regret. +10 satiety. Ya cheers.']; }, to: 'rr_hub' },
        ],
    },
    rr_hunt: {
        id: 'rr_hunt', title: 'Bone-Elk', art: 'bone_elk', place: PLACE.rr,
        enter: (g) => { markDaily(g, 'rr_hunt'); return []; },
        text: `Ya smells it before anyone sees it. She lifts her face, nostrils flaring, and points with her chin.

A bone-elk, grazing on the moss between two roots: grey hide, and antlers that are not antler but raw bone, white, branching, growing in spirals out of its skull and down along its neck like a mane of knives. Your Convergence goes very quiet and attentive, the way a musician goes quiet hearing another instrument tune up.

"Big meat," Ya whispers, and her eyes are shining. "Big *mean* meat. You go left, I go right, the herb girl stays behind the root and screams if anything else comes."

"I have a name," Mei Lin whispers back.

"Scream it, then."`,
        choices: [
            { text: 'Take the bone-elk.', combat: elkFight, to: 'rr_elk_won' },
            { text: 'Leave the elk. Snare root-hares instead.', qi: 2, check: { skill: 'Convergence Use', dc: 4 }, time: 60, do: (g) => { addItem(g, 'hare_raw', 2); return ['+2 root-hares (as hare). Ya sulks about the elk all afternoon.']; }, failDo: () => ['Nothing. Ya does not let you forget it.'], to: 'rr_hub' },
        ],
    },
    rr_elk_won: {
        id: 'rr_elk_won', title: 'Big Mean Meat', art: 'bone_elk', place: PLACE.rr,
        enter: (g) => { addItem(g, 'venison', 3); addItem(g, 'elk_antler', 1); bumpRel(g, 'Ya', 3, 2); return ['+3 elk meat (as venison), +1 Bone-elk antler.']; },
        text: `The elk goes down in a clatter of bone. Ya is on it before it stops moving, knife out, opening the throat with a neatness that would get her a surgical residency where you come from.

She looks up at you with blood to the elbows and the happiest face you've seen on this world.

"You," she says, "can come hunting with me *any time*."

You pick up a shed antler-tine. It's warm in your hand, and your Convergence turns it over like a jeweller with a stone: the grain, the density, the way it *wants* to be shaped. You think you could make something remarkable out of this. You put it in the hammerspace.`,
        choices: [{ text: 'Back to the road.', time: 40, to: 'rr_hub' }],
    },
    rr_elk_lost: {
        id: 'rr_elk_lost', title: 'Antlers', art: 'bone_elk', place: PLACE.rr,
        enter: (g) => patchUp(g),
        text: `The elk wins. It does so emphatically, with an antler through your coat and very nearly through you, and then it leaves at a dignified trot, having made its point.

Ya is furious — not at you, at the elk, which she curses in a language you don't think anyone else speaks. Mei Lin is just quietly stitching.`,
        choices: [{ text: 'Back to the road, limping.', time: 40, to: 'rr_hub' }],
    },
    rr_scout: {
        id: 'rr_scout', title: 'Nose First', art: 'root_road', place: PLACE.rr,
        enter: (g) => { markDaily(g, 'rr_scout'); return []; },
        text: (g) => `Ya teaches you to track the way she learned: nose first.

"Eyes lie," she says, crouched on the root with her face nearly in the moss. "Ears lie. Nose doesn't. Wolf passed here before dawn. Pissed on that, see? Young male. Showing off." She sniffs again. "And *that's* you."

"Me?"

"Three days ago. Your camp, by the stream. I smelled you every night." She grins without looking up. "You smell like lightning and soap. Nobody here smells like soap. I followed you for two days to work out what you were."

${g.flags.saw_lights ? 'Further along, where the roots braid, she shows you something else: a trail in the moss, greener than the moss around it, running inward. "The lights walk here," she says. "Every night. Toward the old tree. I followed them once when I was small. I didn\'t go in."' : 'Further along, where the roots braid, the moss runs greener in a line toward the heart of the forest. "Something walks here at night," Ya says. "Not an animal. I don\'t follow it."'}`,
        choices: [
            { text: 'Learn it properly. Nose in the moss and everything.', check: { skill: 'GU', dc: 4 }, time: 90, do: (g) => { g.flags.bl_tracker = true; bumpRel(g, 'Ya', 3, 2); return ['You can smell wolf now. You will never not be able to smell wolf now. Ya is very proud of you.']; }, failDo: (g) => { bumpRel(g, 'Ya', 1, 0); return ['You smell moss. Mostly moss. Ya pats your head.']; }, to: 'rr_hub' },
            { text: '"You followed me for two days?"', do: (g) => { bumpRel(g, 'Ya', 2, 4); return ['"You were interesting," she says, as if that explains anything. "Most things aren\'t."']; }, time: 30, to: 'rr_hub' },
        ],
    },
    rr_roots: {
        id: 'rr_roots', title: 'The Root Sings', art: 'heart_roots', place: PLACE.rr,
        enter: (g) => { g.flags.rr_listened = true; return []; },
        text: (g) => `You kneel and put your palm flat on the root, and your Convergence answers before you've asked it anything.

It's the song. The same one as in the Hollow, only louder here, closer: the slow harmonic of a Hearth Tree, the note your whole civilisation is tuned to. Except that it's wrong. It's a song with the middle cut out of it — the first bar, the last bar, and in between a silence where the heart should be.

The root is warm under your hand. Under Ya's feet, a few metres away, it isn't.

"It likes you," Ya says, a little uneasy for the first time since you met her. "The forest doesn't like anyone."

Mei Lin is watching you, not the root. "Your face," she says. "You look like someone at a grave."

${g.flags.roots ? 'You think of the root you followed out of the Hollow, and the thing at the end of it that wasn\'t entirely dead. You\'re walking toward it now.' : ''}`,
        choices: [
            { text: 'Let the song in. Cultivate with it.', check: { skill: 'Convergence Use', dc: 4 }, time: 60, do: (g) => { g.james.saturation = Math.min(100, Math.round((g.james.saturation + 12) * 10) / 10); return [`The root carries your Qi round like a held breath. Saturation +12% (${g.james.saturation}%), no Qi spent.`]; }, failDo: () => ['The song slides off you. Not yet, it seems to say.'], to: 'rr_hub' },
            { text: '"It\'s one of ours," you tell them. "Was."', do: (g) => { bumpRel(g, 'Mei Lin', 3, 2); bumpRel(g, 'Ya', 2, 0); g.flags.told_hearth = true; return ['You tell them about Hearth Trees. Neither of them laughs.']; }, time: 30, to: 'rr_hub' },
        ],
    },
    rr_end: {
        id: 'rr_end', title: 'The Split', art: 'root_wyrm', place: `${P} — the end of the Root Road`,
        text: `The Root Road ends where the great root splits in two around a chasm, and the two halves plunge down into darkness and water. The air coming up smells of rot and wet stone. Somewhere far below, the Drowned Wood.

Ya stops. Ya, who has not stopped for anything in two days.

"It lives in the split," she says. "I've seen it eat a bone-elk whole. Antlers first."

Something moves in the gap between the halves of the root — something long, bark-scaled, sliding. The root under your feet vibrates.

"There's a way across," Ya says, "if you can make one. Or there's a way through." She hefts her spear and her eyes are bright and slightly mad. "I vote through."

"I vote across," Mei Lin says. "I vote *very much* across."`,
        choices: [
            { text: 'Through it. Fight the root-wyrm.', combat: wyrmFight, to: 'wyrm_won' },
            { text: 'Across it: sing a bone bridge over the split, fast and quiet.', qi: 8, check: { skill: 'Convergence Use', dc: 6, band: 'challenging' }, do: (g) => { g.flags.wyrm_bridged = true; return ['A white span grows out of your hands across the chasm, ribbed and singing. You run. Behind you the wyrm rises, too late, and the bridge dissolves into its open mouth.']; }, failDo: (g) => { g.flags.wyrm_bridge_fail = true; return ['The bridge is half-grown when the wyrm hits it. The bone shatters. So does your concentration.']; }, to: 'dw_enter', fail: 'rr_bridge_fail' },
        ],
    },
    rr_bridge_fail: {
        id: 'rr_bridge_fail', title: 'Through, Then', art: 'root_wyrm', place: `${P} — the split`,
        text: `The wyrm rears out of the split with half your bridge in its mouth, bark-scales grinding, and turns its eyeless head toward the warm thing that made it. You.

"Through, then!" Ya yells, absolutely delighted, and charges.`,
        choices: [{ text: 'Fight.', combat: wyrmFight, to: 'wyrm_won' }],
    },
    wyrm_won: {
        id: 'wyrm_won', title: 'The Wyrm', art: 'root_wyrm', place: `${P} — the split`,
        enter: (g) => { addItem(g, 'wyrm_scale', 4); addItem(g, 'beast_core', 1); bumpRel(g, 'Ya', 4, 3); bumpRel(g, 'Mei Lin', 3, 2); return ['+4 Root-wyrm scales, +1 Murky beast core.']; },
        text: `It takes a long time to die, and it's ugly when it does, and when it's over the four of you are sitting on the lip of the split with your backs against the root, breathing like bellows.

Ya is grinning through a mask of sap. Mei Lin has a cut along her cheekbone that she hasn't noticed. Yuki is grooming, which in Yuki is a statement of victory.

"I've wanted to kill that," Ya says dreamily, "since I was *nine*."

"Why didn't you?"

"I was nine." She leans her head back against the root. "Then I was alone. You don't fight things like that alone. You fight them with—" She stops. Looks at the three of you as if seeing you for the first time. Then she gets up abruptly and goes to cut scales off the corpse, and doesn't finish the sentence.

Mei Lin watches her go. Something in her face softens, and then she notices it softening and stops it.`,
        choices: [{ text: 'Climb down into the Drowned Wood.', time: 90, to: 'dw_enter' }],
    },
    wyrm_lost: {
        id: 'wyrm_lost', title: 'Over the Edge', art: 'root_wyrm', place: `${P} — the split`,
        enter: (g) => patchUp(g),
        text: `You lose the fight and win the crossing, which is the worst kind of win: the wyrm's tail takes you off the root and you fall, and Ya jumps after you, and Mei Lin — swearing a blue streak you will remember for the rest of your life — jumps after *her*.

You all hit the water forty metres down in the Drowned Wood. The wyrm doesn't follow. Wyrms, it turns out, don't swim.

"*Never*," Mei Lin says, crawling out onto a drowned trunk, "do that again."

"You jumped," Ya points out, delighted.

"I know I jumped. Shut up."`,
        choices: [{ text: 'Drag yourself onto the drowned trunks.', time: 60, to: 'dw_enter' }],
    },

    /* =================================== the Drowned Wood =================================== */
    dw_enter: {
        id: 'dw_enter', title: 'The Drowned Wood', art: 'drowned_wood', place: PLACE.dw,
        enter: (g) => { g.flags.bl_region = 'dw'; toHour(g, 18); return []; },
        text: `Below the split the forest is underwater.

Not a lake: a forest, still standing, drowned to the waist in black, perfectly still water. The trunks go down into it and their reflections come up out of it, so that every tree is two trees, one of them upside down. Mist lies on the surface in sheets. Nothing sings. Nothing calls. The only sound is water dripping from very high up.

"Old flood," Ya says, quietly, which is how you know it's bad. "Before my mother's mother. The forest went wrong and the water came, and the people who lived down here didn't leave." She glances at the water. "They're still here."

Mei Lin makes the sign against the dead, the one she pretends she doesn't believe in.

You find a raft of fallen trunks wedged between two trees, high and dry enough. It will have to do for tonight.`,
        choices: [{ text: 'Make camp on the trunks.', to: 'bl_camp' }],
    },
    dw_hub: {
        id: 'dw_hub', title: 'The Drowned Wood', art: 'drowned_wood', place: PLACE.dw,
        text: (g) => hubText(g, g.flags.drowned_done
            ? 'The far edge of the Drowned Wood. The water is shallower here, and warmer — Ya says there\'s a spring nearby, where the hill-fire comes up under the water.'
            : 'You move from trunk to trunk, wading where you have to. Somewhere ahead is a hollow where the water is deep and the trees lean together like mourners. Ya says you have to cross it. She says it without any jokes at all.'),
        choices: [
            { text: 'Forage on the drowned trunks.', show: (g) => daily('dw_forage')(g) && !late(g), time: 15, to: 'dw_forage' },
            { text: 'Hunt.', show: (g) => daily('dw_hunt')(g) && !late(g), time: 15, to: 'dw_hunt' },
            { text: 'Look at the carvings on the drowned shrine.', show: (g) => !g.flags.dw_carving && !late(g), time: 30, to: 'dw_scout' },
            ...hubChoices('dw_hub'),
            { text: 'Cross the mourning hollow.', show: (g) => !g.flags.drowned_done, time: 40, to: 'dw_hollow' },
            { text: 'The hot spring Ya found.', show: (g) => !!g.flags.drowned_done && !g.flags.spring_done, time: 30, to: 'hot_spring' },
            { text: 'Make camp at the wood\'s edge.', show: (g) => !!g.flags.drowned_done && hour(g) >= 16, time: 20, to: 'bl_camp' },
        ],
    },
    dw_forage: {
        id: 'dw_forage', title: 'Wet Harvest', art: 'drowned_wood', place: PLACE.dw,
        enter: (g) => { markDaily(g, 'dw_forage'); return []; },
        text: `The drowned trees are thick with growth: gill-fungi in pale tiers, water-chestnut in the shallows, and frogs, which Ya regards as a gift from whatever god she doesn't believe in.

Mei Lin wades out to the chestnuts with her skirts knotted at her hip and her jaw set against the cold. Ya watches her legs with frank, appreciative interest and does not pretend otherwise.

"Stop that," Mei Lin says, without turning round.

"Stop what?"

"*That.*"`,
        choices: [
            { text: 'The pale gill-fungi on the drowned trunks.', check: { skill: 'GU', dc: 5, bonus: () => 2 }, time: 50, do: (g) => { addItem(g, 'ghost_gill', 2); return ['+2 Ghost-gill. Your omnitool is ecstatic. You are mildly ecstatic.']; }, failDo: (g) => { g.james.hp -= 2; return ['Leeches. The fungi win this round. −2 HP.']; }, to: 'dw_hub' },
            { text: 'Wade out and help with the chestnuts.', check: { skill: 'GU', dc: 3 }, time: 50, do: (g) => { addItem(g, 'river_cress', 4); bumpRel(g, 'Mei Lin', 2, 2); return ['+4 water-chestnuts (as river cress). Mei Lin\'s lips are blue and she\'s laughing about something Yuki did.']; }, failDo: (g) => { addItem(g, 'river_cress', 1); return ['You slip. +1 chestnut, one soaked biologist.']; }, to: 'dw_hub' },
            { text: 'Go frogging with Ya.', check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 50, do: (g) => { eat(g, 18); bumpRel(g, 'Ya', 3, 3); return ['Needles through frogs, frogs on a stick, frogs in your mouth. +18 satiety. Ya kisses you on the ear for a good throw, as if that\'s normal.']; }, failDo: (g) => { bumpRel(g, 'Ya', 1, 0); return ['The frogs are faster than you. Ya is faster than the frogs. She shares. Eventually.']; }, to: 'dw_hub' },
        ],
    },
    dw_hunt: {
        id: 'dw_hunt', title: 'Something Under the Water', art: 'mire_serpent', place: PLACE.dw,
        enter: (g) => { markDaily(g, 'dw_hunt'); return []; },
        text: `Marsh fowl roost in the drowned branches by the dozen, fat and stupid and loud. And something else is in the water: a long wake, moving against no current at all.

"Serpent," Ya says. "Good meat. Bad temper. Like me." She grins at Mei Lin. "Like you."

"I have an *excellent* temper."

"You threatened to geld me this morning."

"You put a frog in my bedroll."

"It was a *present*."`,
        choices: [
            { text: 'Go for the serpent.', combat: serpentFight, to: 'dw_serpent_won' },
            { text: 'Darts at the roosting fowl.', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 50, do: (g) => { addItem(g, 'fowl_raw', 2); return ['+2 Marsh fowl.']; }, failDo: () => ['A storm of honking feathers and nothing else.'], to: 'dw_hub' },
        ],
    },
    dw_serpent_won: {
        id: 'dw_serpent_won', title: 'Serpent Steaks', art: 'mire_serpent', place: PLACE.dw,
        enter: (g) => { eat(g, 25); addItem(g, 'fowl_raw', 1); return ['Serpent, roasted on a drowned branch: +25 satiety. +1 more to carry (as fowl).']; },
        text: `It thrashes the water to foam before it dies. Ya rides it the last few seconds like a horse, whooping, and comes up out of the water soaked and glorious and incredibly pleased with herself.

Mei Lin, dripping, says, "You're insane," and then, quieter, so that only you hear it: "That was beautiful."

You decide you didn't hear it. She decides you didn't either.`,
        choices: [{ text: 'Back to the trunks.', time: 30, to: 'dw_hub' }],
    },
    dw_serpent_lost: {
        id: 'dw_serpent_lost', title: 'The Water Wins', art: 'mire_serpent', place: PLACE.dw,
        enter: (g) => patchUp(g),
        text: `The serpent drags you under. For a long, cold, silent moment the Drowned Wood shows you exactly why the people down here never left.

Then four hands haul you out by the coat — one pair rough and fast, one pair careful — and you're coughing black water onto a trunk while two women shout at you in stereo.`,
        choices: [{ text: 'Breathe. Then go back.', time: 30, to: 'dw_hub' }],
    },
    dw_scout: {
        id: 'dw_scout', title: 'The Drowned Shrine', art: 'drowned_wood', place: PLACE.dw,
        enter: (g) => { g.flags.dw_carving = true; return []; },
        text: (g) => `A shrine, half under water: a stone roof on four stone posts, older than anything in Ashfall. On the lintel, cut deep and filled with moss, is a carving.

A tree. A great tree, with roots that spread to the edges of the stone. And at the heart of the tree, where the trunk thickens, a shape — long, smooth, pointed at one end like a seed, or a boat, or both.

Your breath stops.

You know that shape. You grew up with it on banners, on coins, on the side of every seed-ship in the registry. You stood under one when you were six on a school trip, holding your mother's hand.

"Old people's god," Ya says. "From before the Sect. They say it sang."

Mei Lin is looking at you. "You know what it is."

${g.flags.saw_lights || g.flags.lore_tree ? 'You think of the lights flowing toward the tree. Of Old Wen\'s story. *It sang, and the singing made the forest kind.*' : ''}

"Yes," you say. "I think I came here in one."`,
        choices: [
            { text: 'Copy the carving into the omnitool, every line.', check: { skill: 'GU', dc: 3 }, time: 30, do: (g) => { g.flags.ship_glyph = true; return ['Saved. The omnitool tries to match it against the registry and returns: *partial match. Ship class: Deep Grove. Lost.*']; }, to: 'dw_hub' },
            { text: 'Tell them everything. The ship. Home. All of it.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 3); bumpRel(g, 'Ya', 4, 2); g.flags.told_ship = true; return ['Ya listens without interrupting, which you suspect has never happened before. Mei Lin takes your hand and holds it, hard, and doesn\'t say anything at all.']; }, time: 40, to: 'dw_hub' },
        ],
    },
    dw_hollow: {
        id: 'dw_hollow', title: 'The Mourning Hollow', art: 'drowned_dead', place: `${P} — the mourning hollow`,
        text: `The trees lean together over the hollow like mourners at a grave, and the water under them is very deep and very black and very still.

Halfway across, wading chest-deep, Mei Lin stops.

"Something touched my leg," she says, in a perfectly calm voice.

The water around her moves. A hand comes up out of it — grey, bloated, the fingernails long — and takes hold of her sleeve. Then another. Then a face, rising slowly, eyes open, a woman's face, very young, with the patient expression of something that has been waiting a long time for company.

They come up all around you. The drowned. Corrupted Qi has kept them, the way vinegar keeps a pickle. They do not make a sound.

Mei Lin goes under.

Ya is already moving.`,
        choices: [
            { text: 'Fight them off her.', combat: drownedFight, to: 'dw_drowned_won' },
        ],
    },
    dw_drowned_won: {
        id: 'dw_drowned_won', title: 'Out of the Water', art: 'drowned_dead', place: `${P} — the mourning hollow`,
        enter: (g) => { g.flags.drowned_done = true; bumpRel(g, 'Ya', 3, 2); bumpRel(g, 'Mei Lin', 3, 2); return []; },
        text: `When the last of them sinks — and they do sink, slowly, as if relieved — Ya is the one who comes up with Mei Lin.

She went under after her without a second's thought, and she's hauling her onto the nearest trunk by the collar, pounding her back until she coughs up half the hollow. There's a long gash down Ya's forearm where one of the drowned got its nails in. She hasn't noticed.

Mei Lin lies on the trunk, gasping, staring up at Ya. Ya is staring down at her. Neither of them says anything clever. Neither of them says anything at all.

Then Mei Lin says, hoarsely, "You came in after me."

"Obviously," Ya says, offended. "You're *mine*. I mean — you're ours. You're the herb girl. Who'd stitch me?" She looks at her arm, finally. "Oh. That's bad."`,
        choices: [{ text: 'Get them both to dry ground.', time: 40, to: 'dw_after' }],
    },
    dw_drowned_lost: {
        id: 'dw_drowned_lost', title: 'Held Under', art: 'drowned_dead', place: `${P} — the mourning hollow`,
        enter: (g) => { g.flags.drowned_done = true; return patchUp(g); },
        text: `They hold you under. For a while there is only cold and dark and hands, so many hands, and a strange, terrible peace.

Then Yuki is screaming through the bond like a fire alarm, and someone's bone-knife is cutting the hands away — not yours, Ya's, borrowed from your own hammerspace without asking — and you come up into the air with Mei Lin's fist knotted in your hair.

Ya got her out first. Then both of them came back for you. You'll be thinking about the order of that for a long time.`,
        choices: [{ text: 'Crawl to dry ground.', time: 40, to: 'dw_after' }],
    },
    dw_after: {
        id: 'dw_after', title: 'Stitches', art: 'drowned_camp', place: PLACE.dw,
        enter: (g) => { bumpRel(g, 'Mei Lin', 0, 2); bumpRel(g, 'Ya', 0, 2); return []; },
        text: `Mei Lin stitches Ya's arm on a dry hummock with a bone needle you grow for her, and thread from her own sleeve.

Ya does not flinch. Ya talks the entire time instead: about the drowned, about the time she fought a bear when she was fourteen, about how Mei Lin's hands are cold, about how Mei Lin's hands are very *nice* for being cold.

"Hold still," Mei Lin says.

"I am holding still. You're the one shaking."

"I am *not*—" Mei Lin stops. Ties off. Bites the thread, very close to Ya's skin. She doesn't let go of Ya's arm afterwards, and she doesn't look up, and Ya, for once in her life, has the sense to stay quiet.

You go and look at a tree for a while. It's a very interesting tree. Yuki sits beside you and looks at it too.

*They will be insufferable now,* she observes.`,
        choices: [
            { text: 'Give them a minute. Then go back.', time: 30, to: 'dw_hub' },
        ],
    },
    hot_spring: {
        id: 'hot_spring', title: 'The Spring', art: 'hot_spring', place: `${P} — the hot spring`,
        enter: (g) => { g.flags.spring_done = true; toHour(g, 18); return []; },
        text: `At the edge of the Drowned Wood, where the hills begin, hot water comes up under the cold: a pool among black rocks, steaming in the dusk, smelling of iron and stone.

Ya strips without the slightest hesitation and is in the water before anyone can object, whooping at the heat. Mei Lin stands on the bank with her arms crossed, absolutely scandalised, and absolutely not leaving.

"In Ashfall," she informs the steam, "men and women bathe on *separate days*."

"We're not in Ashfall," Ya says, floating on her back. "Nobody here but trees and the cat. Come in. I won't bite." A pause. "Much. Where you'd notice."

Mei Lin looks at you. You look at the steam. Yuki looks at all of you with the weary patience of the only adult present.`,
        choices: [
            { text: 'Turn your back and keep watch. Somebody has to be a gentleman, and it might as well be the one from space.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 2); bumpRel(g, 'Ya', 0, 1); return []; }, time: 60, to: 'mei_curious' },
            { text: 'Get in. Your bruises have bruises.', do: (g) => { bumpRel(g, 'Ya', 2, 5); bumpRel(g, 'Mei Lin', 0, 3); advance(g, 60, { resting: true }); return ['The heat goes into every bruise you own. You sit up to your shoulders in it and look at the stars, very carefully, and nowhere else.']; }, to: 'spring_ya' },
            { text: 'Leave them to it. Go back to the trunks.', time: 20, to: 'dw_hub' },
        ],
    },
    spring_ya: {
        id: 'spring_ya', title: 'Steam', art: 'hot_spring', place: `${P} — the hot spring`,
        text: (g) => `Ya drifts over to you through the steam until her shoulder is against yours. She doesn't say anything, which is so unlike her that you look round.

She's looking at you with no grin at all. Just looking.

"I don't know how you do it, where you're from," she says. "Here, if you want something, you take it, or something else takes it first. I want you." She tilts her head toward the bank. "I want her too. I'm not stupid. I can see you want her." A shrug, wet shoulders in the dark. "Why is that a problem? It's only a problem in villages."

On the bank, Mei Lin has gone very still, and has very definitely heard.

${both(g) ? 'Nobody says anything for a long time. Then Mei Lin, in a voice you have never heard her use — small, furious, and something else — says: "Turn around, both of you." And there is a splash, and then she is in the water too, on Ya\'s other side, arms folded over her chest, glaring at the stars as if they started it.' : onlyYa(g) ? 'Mei Lin gets up and walks away without a word. Ya watches her go, then turns back to you and puts her hand flat on your chest, under the water. "Just you, then," she says. "For now." Her mouth finds yours. The steam does the rest.' : 'Mei Lin gets up and walks away without a word. Ya watches her go, and shrugs, and sinks under the water, and comes up somewhere else, and talks about frogs for the rest of the evening as if nothing happened.'}`,
        choices: [
            { text: 'Stay as long as the heat lasts.', show: both, do: (g) => { trioStep(g, 2); bumpRel(g, 'Mei Lin', 2, 4); bumpRel(g, 'Ya', 2, 4); return []; }, to: 'mei_curious' },
            { text: 'Let the steam close over everything.', show: onlyYa, do: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 4, 8); return ['Much later, Ya falls asleep against you on the warm rocks, one arm across your chest like a claim.']; }, to: 'dw_hub' },
            { text: 'Get out. Get dry. Get back to camp.', show: (g) => !both(g) && !onlyYa(g), to: 'dw_hub' },
        ],
    },
    mei_curious: {
        id: 'mei_curious', title: 'Curious', art: 'drowned_camp', place: PLACE.dw,
        enter: (g) => trioStep(g, 2),
        text: (g) => (both(g)
            ? `Later, drying her hair by the fire while Ya is off checking snares, Mei Lin sits down next to you, close, and says without preamble:

"I am going to say this once and then never again, and if you laugh I'll put a needle in you." She takes a breath. "She makes me *furious*. She has no shame and no manners and she ate a frog in front of me with its legs still kicking. And I can't stop thinking about her mouth." Her hands are clenched in her lap. "And I can't stop thinking about yours. And in Ashfall that makes me a whore or a madwoman, and I don't know which, and I'm *curious*, and I *hate* being curious, and it's all your fault, both of you."

Yuki, from your lap, sends one very clear thought: *finally.*

"I'm not asking you anything," Mei Lin says. "I'm telling you. So you know." She stands, abruptly. "Don't say anything."

You don't. It's the smartest thing you've done all week.`
            : `Later, by the fire, Mei Lin dries her hair and doesn't talk about the spring.

"She'd have been burned as a demon in Ashfall," she says eventually, watching Ya prowl the edge of the firelight. "She'd have laughed while it happened." There's something in her voice — envy, maybe, or longing for a life with fewer rules. "I don't know whether I want to be her or strangle her."

"Both is an option."

"In Ashfall, nothing is an option." She looks into the fire. "That's the problem with Ashfall."`),
        choices: [{ text: 'Back to the others.', to: 'dw_hub' }],
    },

    /* =================================== the Ashen Hills =================================== */
    ah_enter: {
        id: 'ah_enter', title: 'The Ashen Hills', art: 'ashen_hills', place: PLACE.ah,
        enter: (g) => { g.flags.bl_region = 'ah'; return []; },
        text: `Out of the water and up, into the hills, and the forest stops.

Not thins: stops, as if a line had been drawn. Beyond the line the hills are black. Burnt ridges, ash a hand deep, the stumps of trees standing like broken teeth. A long time ago something burned here hot enough to melt stone; you find glassy runs of it in the gullies. Nothing grew back. The wind smells of old smoke, and the sky over the ridges is the colour of a bruise.

And above it all, much closer now, filling half the horizon: the dead tree. You can see the bark now, grey as old bone, and the great limbs, broken off a thousand years ago, and the vast black wound in its side where something was cut out.

Ya won't look at it. Mei Lin can't stop.

"Two days," Ya says. "Then we're under it." She spits in the ash. "Then I'm going home, and you can all go and die in there without me."

She doesn't mean it. Everyone can tell she doesn't mean it. It makes it worse, somehow.`,
        choices: [{ text: 'Climb.', time: 120, to: 'ah_hub' }],
    },
    ah_hub: {
        id: 'ah_hub', title: 'The Ashen Hills', art: 'ashen_hills', place: PLACE.ah,
        text: (g) => hubText(g, bday(g) <= 4
            ? 'Black ridges, grey sky, the dead tree looming. Cinder hawks circle high up, trailing faint lines of smoke.'
            : 'The last ridge before the tree. Ya says a rot-ape holds the pass at the top. She says it calmly, which is the most worrying thing she\'s said all week.'),
        choices: [
            { text: 'Ya\'s gone. So is her spear.', show: (g) => bday(g) >= 4 && !g.flags.ya_off_done && !late(g), time: 10, to: 'ya_offended' },
            { text: 'Find Mei Lin and Ya. They went for water an hour ago.', show: (g) => both(g) && trio(g) >= 2 && !g.flags.trio_kiss_seen && !late(g), time: 30, to: 'trio_kiss' },
            { text: 'Forage in the ash.', show: (g) => daily('ah_forage')(g) && !late(g), time: 15, to: 'ah_forage' },
            { text: 'Hunt.', show: (g) => daily('ah_hunt')(g) && !late(g), time: 15, to: 'ah_hunt' },
            { text: 'Climb to the cairn on the high ridge.', show: (g) => !g.flags.ah_cairn && !late(g), time: 40, to: 'ah_scout' },
            ...hubChoices('ah_hub'),
            { text: 'Make camp in the lee of a ridge.', show: (g) => bday(g) <= 4 && hour(g) >= 16, time: 20, to: 'bl_camp' },
            { text: 'Climb to the pass. The rot-ape.', show: (g) => bday(g) >= 5, time: 60, to: 'ah_ridge_end' },
        ],
    },
    ah_forage: {
        id: 'ah_forage', title: 'Ash and Embers', art: 'ashen_hills', place: PLACE.ah,
        enter: (g) => { markDaily(g, 'ah_forage'); return []; },
        text: `There's food in the ash, if you know where to look. Mei Lin knows the cinderberry bushes that grow in the gullies where the stone glassed. You know the truffles — black, wrinkled, fruiting underground where the old fire left the soil rich. Ya knows the fire-beetles, which she eats alive, crunching, while maintaining eye contact with Mei Lin.

"Disgusting," Mei Lin says.

"You keep watching."

"I'm watching to make sure you *die*."`,
        choices: [
            { text: 'Dig for the ash-truffles.', check: { skill: 'GU', dc: 5, bonus: () => 2 }, time: 60, do: (g) => { addItem(g, 'jade_bracket', 2); eat(g, 10); return ['+2 ash-truffles (as jade bracket), and one eaten on the spot: +10 satiety. Earthy. Magnificent. Your career peaks.']; }, failDo: () => ['Ash, ash, ash, and a beetle. Ya eats the beetle.'], to: 'ah_hub' },
            { text: 'Cinderberries with Mei Lin.', check: { skill: 'GU', dc: 3 }, time: 40, do: (g) => { addItem(g, 'crimson_berry', 6); bumpRel(g, 'Mei Lin', 2, 2); return ['+6 cinderberries (as needleberries). She feeds you one off her palm without seeming to notice she did it.']; }, failDo: (g) => { addItem(g, 'crimson_berry', 2); return ['Thorns. +2 cinderberries.']; }, to: 'ah_hub' },
            { text: 'Eat a fire-beetle. For science.', do: (g) => { eat(g, 6); bumpRel(g, 'Ya', 3, 3); return ['It is spicy. Genuinely, chemically spicy. +6 satiety. Ya looks at you like you just proposed.']; }, to: 'ah_hub' },
        ],
    },
    ah_hunt: {
        id: 'ah_hunt', title: 'Hawks', art: 'cinder_hawks', place: PLACE.ah,
        enter: (g) => { markDaily(g, 'ah_hunt'); return []; },
        text: `The cinder hawks have been watching you since you crossed the line. They're bigger than eagles, ash-grey, and where their wings beat the air you can see faint sparks, as if they're made of coals that never quite went out.

"They hunt in threes," Ya says. "They'll go for the cat."

Yuki, on your shoulder, flattens her ears and sends you a thought that consists entirely of teeth.

There are hill-hares in the gullies too: small, fast, ash-coloured. Less exciting. Less likely to set you on fire.`,
        choices: [
            { text: 'Take the hawks before they take Yuki.', combat: hawksFight, to: 'ah_hawks_won' },
            { text: 'Darts at the hill-hares instead.', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 50, do: (g, r) => { addItem(g, 'hare_raw', 2); return [r && r.ratio < 1 ? `The darts go out flat through the ash haze and most of them hit ash. One hare stops being fast. Ya fetches it without being asked and holds it up by the ears, considering it. "Thin," she says. "Like you." Above you the hawks wheel off, unimpressed, trailing sparks.` : `The darts go out flat through the ash haze and the hares stop being fast. Ya fetches them without being asked and comes back holding them up by the ears. "Small," she says. "But you hit what you aimed at. Rare, for you." Above you the hawks wheel off, disappointed, trailing sparks.`, '+2 hill-hares.']; }, failDo: () => ['Ash-coloured hares on ash-coloured hills. You hit a lot of ash.'], to: 'ah_hub' },
        ],
    },
    ah_hawks_won: {
        id: 'ah_hawks_won', title: 'Feathers and Sparks', art: 'cinder_hawks', place: PLACE.ah,
        enter: (g) => { addItem(g, 'fowl_raw', 2); return ['+2 cinder hawk (as fowl). The meat is warm all on its own.', ...awardYukiFightXp(g, 'standard')]; },
        text: `The last hawk goes down in a shower of sparks, and Yuki — who has been riding your shoulder through the whole thing, claws in, spitting — leaps off and lands on it, and sits there, and stares at the sky as if daring another one to try.

"Little queen," Ya says to her, with enormous respect. Yuki accepts the title.`,
        choices: [{ text: 'Back to the ridge.', time: 30, to: 'ah_hub' }],
    },
    ah_hawks_lost: {
        id: 'ah_hawks_lost', title: 'Burned', art: 'cinder_hawks', place: PLACE.ah,
        enter: (g) => patchUp(g),
        text: `The hawks take the fight and some of your coat, which is now smouldering, and leave you face-down in the ash with Mei Lin beating out the sparks with her basket.

"Your coat," Ya says, inspecting the holes, "is getting very holy."

"Thank you."

"It was already ugly."

"*Thank* you."`,
        choices: [{ text: 'Back to the ridge.', time: 30, to: 'ah_hub' }],
    },
    ah_scout: {
        id: 'ah_scout', title: 'The Founder\'s Cairn', art: 'ashen_hills', place: `${P} — the high ridge`,
        enter: (g) => { g.flags.ah_cairn = true; return []; },
        text: `On the highest ridge stands a cairn of black glassed stone, taller than a man, and on it, carved deep, a lotus. Red pigment still clings in the cuts, a thousand years later.

Mei Lin stops dead. "That's the Sect's mark," she says. "The *old* mark. The Founder's. It's on the gate of every temple in the mountains." She reads the characters under it, slowly, her finger following the cuts. "*Here the Founder stood, and opened the Heart, and took the Fruit of Heaven, and the mountains were given to the worthy.*"

You look from the cairn to the dead tree, and the black wound in its side. Then to the burnt hills all around you, glassed by a fire hot enough to melt stone.

"Opened the Heart," you say.

"It's a parable," Mei Lin says, but she doesn't sound sure.

"It's a crime scene," you say. Ya spits on the cairn, without comment, and nobody stops her.`,
        choices: [
            { text: 'Scan the cairn. Every cut, every grain of pigment.', check: { skill: 'GU', dc: 4 }, time: 40, do: (g) => { g.flags.founder_cairn = true; return ['The pigment is blood, mixed with something. The glassed stone is older than the carving. They carved their victory into the scar.']; }, failDo: (g) => { g.flags.founder_cairn = true; return ['The omnitool chokes on the ash. You remember the words, though. You\'ll remember them for a long time.']; }, to: 'ah_hub' },
        ],
    },
    ya_offended: {
        id: 'ya_offended', title: 'Gone', art: 'ashen_hills', place: PLACE.ah,
        enter: (g) => { g.flags.ya_off_done = true; return []; },
        text: `It started over nothing. Mei Lin said Ya smelled like a wet dog. Ya said Mei Lin smelled like a temple, which in Ya's mouth is worse. You laughed — at both of them, at the absurdity of it — and Ya heard only that you laughed at *her*.

She went white under the ash on her face. She said a word you didn't know and Mei Lin did, judging by the gasp. Then she took her spear and walked off the ridge into the haze, and didn't look back.

That was an hour ago. The cinder hawks are circling lower.

"Let her sulk," Mei Lin says, but she's looking at the haze too.`,
        choices: [
            { text: 'Track her. Nose first, like she taught you.', check: { skill: 'GU', dc: 5, bonus: (g) => (g.flags.bl_tracker ? 2 : 0) }, time: 60, to: 'ya_found', fail: 'ya_found' },
            { text: 'Wait. She\'ll come back when she\'s ready.', time: 120, do: (g) => { bumpRel(g, 'Ya', -3, 0); g.flags.ya_waited = true; return []; }, to: 'ya_found' },
        ],
    },
    ya_found: {
        id: 'ya_found', title: 'Teeth', art: 'ya_close', place: `${P} — a burnt gully`,
        text: (g) => `${g.flags.ya_waited
        ? 'She comes back at dusk with a hare over her shoulder and her chin up, and sits down at the far edge of the camp, and won\'t look at you.'
        : 'You find her in a burnt gully, sitting on a glassed rock, gutting a hill-hare with unnecessary violence.'}

"Everyone laughs," she says, not looking up. "In every village. The wild girl. The dog girl. They throw bones at the edge of the woods to see if I'll come for them." Her knife goes in hard. "I thought you were different. You're as strange as I am. Stranger. But you laughed."

"I laughed because you were both ridiculous. Both of you. Together. Like—"

"Like *what*."

"Like two people who like each other far too much to admit it, arguing about smells."

She stops gutting the hare. Looks at you, finally, eyes narrowed.

"Hm," she says. And then, after a long pause, holding something out: a wolf's tooth, long and yellow, threaded on a cord. "I bit that off a wolf when I was eleven. It's the best thing I own." She shoves it at your chest. "Don't laugh at me again."`,
        choices: [
            { text: 'Take the tooth. Put it on. "I won\'t."', do: (g) => { addItem(g, 'ya_tooth', 1); bumpRel(g, 'Ya', 6, 6); return [`The cord is greasy and the tooth is warm from her fist. You put it on. She watches you do it with the stillness of something deciding whether to bolt, and then goes back to the hare as if nothing has happened, except that she's sitting a hand's width closer than she was.`, '+1 Ya\'s wolf tooth.']; }, to: 'ah_hub' },
            { text: '"Bring it back to camp and give one to Mei Lin, too. She\'s been looking for you."', do: (g) => { addItem(g, 'ya_tooth', 1); bumpRel(g, 'Ya', 4, 3); bumpRel(g, 'Mei Lin', 2, 2); trioStep(g, 2); return ['+1 Ya\'s wolf tooth. Ya goes looking for a second wolf.']; }, to: 'ah_hub' },
        ],
    },
    trio_kiss: {
        id: 'trio_kiss', title: 'The Spring Below the Ridge', art: 'trio', place: `${P} — a spring under the ridge`,
        enter: (g) => { g.flags.trio_kiss_seen = true; trioStep(g, 3); bumpRel(g, 'Mei Lin', 2, 4); bumpRel(g, 'Ya', 2, 4); return []; },
        text: `You find them at the little spring under the ridge, and stop at the top of the gully, because they're kissing.

Not gently. Ya has Mei Lin backed against the black rock with her hands in her hair, and Mei Lin has two fistfuls of Ya's jacket as if she can't decide whether to pull her closer or throw her off the hill, and is very clearly doing the first one.

Then Mei Lin sees you over Ya's shoulder. Goes scarlet to the collarbones. Shoves Ya away, hard.

Ya, unbothered, licks her lip and turns round. "Oh, good," she says. "Scholar. Tell her it's fine. She won't believe me."

"It is *not* fine," Mei Lin says, to the rock. "It is *not*. I'm not — I haven't — I didn't say *yes* to anything."

"You kissed me *back*."

"I *know* I kissed you back!" She looks at you, and her eyes are wild and wet and absolutely furious. "Don't you dare look at me like that. Don't you *dare* look pleased."

You are trying very hard not to look pleased. Yuki, beside you, is not trying at all.`,
        choices: [
            { text: '"Nobody has to say yes to anything. Not today. Not ever, if you don\'t want."', do: (g) => { bumpRel(g, 'Mei Lin', 4, 4); return ['Mei Lin lets out a breath she seems to have been holding since Ashfall. Ya rolls her eyes and slings an arm round both of you anyway.']; }, to: 'ah_hub' },
            { text: '"For the record: I have no objections. Scientifically speaking."', do: (g) => { bumpRel(g, 'Ya', 3, 5); bumpRel(g, 'Mei Lin', 1, 3); return ['Ya laughs so hard she falls into the spring. Mei Lin throws a rock at you. She misses. You suspect on purpose.']; }, to: 'ah_hub' },
        ],
    },
    ah_ridge_end: {
        id: 'ah_ridge_end', title: 'The Pass', art: 'rot_ape', place: `${P} — the last pass`,
        text: `The pass is a notch in the last black ridge, and beyond it — so close now that it fills the whole sky — the dead tree.

In the notch sits the rot-ape. It is the size of a hut, and its fur is a living moss, and things grow in it: fungus, little ferns, a bird's nest. Its eyes are a milky, poisoned green. Around it the ground is littered with bones — elk, wolf, hawk. Something wearing the rags of crimson robes.

"It's been here as long as I've been alive," Ya says. "Maybe longer. Nothing gets to the tree." She swallows. "My mother tried. When I was small."

Mei Lin takes Ya's hand. Just takes it. Ya lets her.

"I have meat," Ya says, very quietly. "Smoked. It's greedy. If I lure it to the side, you could hit it from above, while it eats."`,
        choices: [
            { text: 'Ya\'s plan. Lure it with the meat; hit it from above.', check: { skill: 'GU', dc: 6, bonus: (g) => (g.flags.bl_tracker ? 1 : 0) }, time: 30, do: (g) => { g.flags.ape_lured = true; return ['It takes the bait. Your darts take its eye before it knows you\'re there.']; }, failDo: () => ['It smells you on the meat. It comes for you instead.'], to: 'ape_lured' },
            { text: 'Straight at it. All of you, together.', combat: apeFight, to: 'ape_won' },
        ],
    },
    ape_lured: {
        id: 'ape_lured', title: 'The Pass', art: 'rot_ape', place: `${P} — the last pass`,
        text: (g) => (g.flags.ape_lured
            ? 'The ape roars, one-eyed, and swings round toward you, and there\'s nothing left to do but finish it.'
            : 'The ape drops the meat and turns its milky eyes on you, and the ground shakes as it comes.'),
        choices: [{ text: 'Fight.', combat: apeFight, to: 'ape_won' }],
    },
    ape_won: {
        id: 'ape_won', title: 'The Pass Is Open', art: 'rot_ape', place: `${P} — the last pass`,
        enter: (g) => { addItem(g, 'beast_core', 2); bumpRel(g, 'Ya', 5, 4); bumpRel(g, 'Mei Lin', 4, 3); return ['+2 Murky beast cores (one of them the size of a fist).']; },
        text: `It falls across the pass like a landslide, and the moss on its back goes on growing even after its heart stops.

Ya walks over to it, slowly. Puts her hand on its face. Then she goes through the bones in the notch, one by one, until she finds what she's looking for: a spear-head, rusted, wrapped in leather gone black with age. She stands there holding it for a long time.

Mei Lin goes and stands next to her. Doesn't say anything. Ya leans into her, just slightly, the way a tree leans into wind.

You give them the time. Yuki sits beside you and watches the dead tree.

*It knows we're here,* she says.`,
        choices: [{ text: 'Through the pass. Down to the tree.', time: 90, to: 'heart_view' }],
    },
    ape_lost: {
        id: 'ape_lost', title: 'Through, Somehow', art: 'rot_ape', place: `${P} — the last pass`,
        enter: (g) => patchUp(g),
        text: `The ape breaks you. It's not even a contest: it hits you once and you're in the ash, and everything goes white.

What saves you is Ya, who goes up its back like a squirrel up a tree and puts her mother's old spear-head — snatched from the bone pile — into the base of its skull. It doesn't die. But it goes, crashing off down the far side of the ridge, howling, and doesn't come back.

You wake with Mei Lin's hands on your face and Ya sitting beside you, holding a rusted spear-head, crying without any sound at all.`,
        choices: [{ text: 'Get up. The tree is waiting.', time: 90, to: 'heart_view' }],
    },

    /* =================================== shared: train, talk =================================== */
    bl_train: {
        id: 'bl_train', title: 'Practice', art: 'ya_fight', place: (g) => PLACE[region(g)],
        text: (g) => `${region(g) === 'dw' ? 'A dry trunk, long enough to move on.' : region(g) === 'ah' ? 'A flat of ash between two ridges.' : 'The broad back of the root.'} Ya watches you train with the critical eye of someone who has never had a lesson in her life and has never lost a fight she wanted to win. Mei Lin watches Ya watching you, and pretends she isn't.`,
        choices: [
            { text: 'Spar with Ya.', show: daily('bt_ya'), check: { skill: 'GU', dc: 5 }, time: 60, do: (g) => { markDaily(g, 'bt_ya'); bumpRel(g, 'Ya', 2, 2); return ['She throws you twice. You throw her once. She\'s thrilled.']; }, failDo: (g) => { markDaily(g, 'bt_ya'); g.james.hp -= 2; bumpRel(g, 'Ya', 1, 1); return ['She throws you four times. −2 HP. She\'s thrilled.']; }, to: 'bl_train' },
            { text: 'Darts at a knot in the bark, from farther and farther.', show: daily('bt_dart'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 60, do: (g) => { markDaily(g, 'bt_dart'); return []; }, failDo: (g) => { markDaily(g, 'bt_dart'); return []; }, to: 'bl_train' },
            { text: 'Needle drills, slow and exact.', show: daily('bt_needle'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 6 }, time: 60, do: (g) => { markDaily(g, 'bt_needle'); return []; }, failDo: (g) => { markDaily(g, 'bt_needle'); return []; }, to: 'bl_train' },
            { text: 'Footwork with Yuki.', show: daily('bt_yuki'), check: { skill: 'GU', dc: 5 }, time: 60, do: (g) => { markDaily(g, 'bt_yuki'); return awardYukiFightXp(g, 'standard'); }, failDo: (g) => { markDaily(g, 'bt_yuki'); return awardYukiFightXp(g, 'standard'); }, to: 'bl_train' },
            { text: 'Enough.', to: hubFor },
        ],
    },
    talk_mei: {
        id: 'talk_mei', title: 'Mei Lin', art: 'mei_lin', place: (g) => PLACE[region(g)],
        enter: (g) => { markDaily(g, 'tmei'); return []; },
        text: (g) => {
            const n = g.flags.mei_talks || 0;
            if (n === 0) return `Mei Lin walks beside you with her basket on her hip and her eyes on everything: herbs, tracks, Ya's back.

"My mother thinks I'll come back married or not at all," she says. "Those are the only two shapes a woman can come back from the forest in, in Ashfall. Married or dead or *ruined*." A thin smile. "Three, then."

"What do you think?"

"I think my mother has never been further than the herb slope." She glances at you. "I think I'm the first woman from Ashfall to walk into the Blackroot on purpose. Old Wen bowed to me. Did you see? *Bowed.*" Her mouth twitches. "They'll talk about it for ten years. I'll be a cautionary tale."`;
            if (n === 1) return `"Ya says I talk like a temple," Mei Lin says, out of nowhere.

"You do, a bit."

"I know I do." She sounds furious about it. "I was the girl who laughed at the wrong time. Who said the wrong thing to the Sect man. So I learned to say everything right, and it never helped, and I *still* laughed at Gao Feng, and look where that got me." She hacks at a fern with her herb-knife. "Ya doesn't say anything right, ever. Nobody's stopped her. She just — lives. Like a wolf. Like *weather*."

"You sound jealous."

"I'm not jealous." Hack. "I'm *curious*. It's different. It's a scholar's word. You use it all the time."`;
            return `You walk together a while without talking. It's easy, now. She shows you a herb that grows only where a beast has died; you show her a fungus that grows only where a beast is about to. She calls you morbid. You call her a pot calling a kettle.

${likesMei(g) ? 'At one point, climbing over a fallen trunk, she takes your hand and doesn\'t let go of it on the other side. Neither of you mentions it.' : 'She laughs, properly, and then looks round, as if afraid someone from Ashfall might have heard.'}`;
        },
        choices: [
            { text: 'Listen. Ask questions. Let her talk.', do: (g) => { g.flags.mei_talks = (g.flags.mei_talks || 0) + 1; bumpRel(g, 'Mei Lin', 3, 2); return []; }, time: 40, to: hubFor },
            { text: 'Flirt. Lightly. Dangerously.', do: (g) => { g.flags.mei_talks = (g.flags.mei_talks || 0) + 1; bumpRel(g, 'Mei Lin', 1, 5); return ['She tells you you\'re impossible. She\'s smiling while she says it.']; }, time: 40, to: hubFor },
            { text: 'Stop walking. Stay with her a while, just the two of you.', show: (g) => likesMei(g) && !g.flags.mei_bond && rel(g, 'Mei Lin').a >= rel(g, 'Ya').a + 8, time: 30, do: (g) => { g.flags.mb_day = true; return []; }, to: 'mei_bond' },
        ],
    },
    talk_ya: {
        id: 'talk_ya', title: 'Ya', art: 'ya_close', place: (g) => PLACE[region(g)],
        enter: (g) => { markDaily(g, 'tya'); return []; },
        text: (g) => {
            const n = g.flags.ya_talks || 0;
            if (n === 0) return `Ya walks next to you, swinging her spear, and looks you up and down for a while with total candour.

"You're old," she says.

"Forty."

"That's old." She considers. "Good teeth, though. Good hands. Strong back for a scholar." She sniffs you, openly. "And you don't stink of the Sect. When we kill the thing in the tree, you should lie down with me. Or with her, if she'll stop bowing at things long enough. Or both. I'm not fussy."

You are momentarily lost for a sarcastic reply, which has not happened to you since your doctoral defence.

"Think about it," Ya says, and bounds off up the root.`;
            if (n === 1) return `"My mother found me," Ya says, sitting on the edge of the road with her legs dangling over thirty metres of nothing. "Not my real mother. The hunter. She found me in a wolf den when I was little, little — so little I don't remember anything before. She said the wolves were feeding me. She said I bit her." Ya grins. "I still bite."

"I've noticed."

"She taught me words. Some. Spear. Snares. Then the ape got her, at the pass, when I was twelve. After that it was just me." She shrugs. "Fifteen years. I don't go to villages. They throw stones. One time they threw a priest." She swings her legs. "He bounced."`;
            return `Ya is in a good mood, which with Ya means loud.

${likesYa(g) ? 'She walks so close that her hip knocks yours every few steps, on purpose, grinning each time like it\'s the best joke in the world. When you catch her hand to stop her, she twists it round and laces her fingers into yours and keeps walking as if that was the plan all along.' : 'She tells you a long story about a bear, which may be true, and ends it by punching your arm, which definitely is.'}

${likesMei(g) && likesYa(g) ? '"She looked at me today," she says, low. "The herb girl. When I was washing. Properly looked." A slow, wolfish smile. "She\'s coming round."' : ''}`;
        },
        choices: [
            { text: 'Flirt back. She started it.', do: (g) => { g.flags.ya_talks = (g.flags.ya_talks || 0) + 1; bumpRel(g, 'Ya', 2, 6); return ['She looks at you like you\'re a bone-elk and she\'s hungry.']; }, time: 40, to: hubFor },
            { text: 'Ask about her life. Listen.', do: (g) => { g.flags.ya_talks = (g.flags.ya_talks || 0) + 1; bumpRel(g, 'Ya', 4, 2); return []; }, time: 40, to: hubFor },
            { text: 'When she grabs your wrist and drags you off the path, go.', show: (g) => likesYa(g) && !g.flags.ya_romance && rel(g, 'Ya').a >= rel(g, 'Mei Lin').a + 8, do: (g) => { g.flags.yr_day = true; return []; }, time: 60, to: 'ya_romance' },
            { text: '"Ya. Knock it off."', do: (g) => { g.flags.ya_talks = (g.flags.ya_talks || 0) + 1; bumpRel(g, 'Ya', -2, -2); return ['She bares her teeth at you and walks on ahead. She\'ll get over it. Probably.']; }, time: 10, to: hubFor },
        ],
    },

    /* =================================== camp and night =================================== */
    bl_camp: {
        id: 'bl_camp', title: 'Camp', art: (g) => ({ rr: 'root_camp', dw: 'drowned_camp', ah: 'ashen_camp' }[region(g)]), place: (g) => PLACE[region(g)],
        enter: (g) => { toHour(g, 19); return []; },
        text: (g) => `${{
            rr: 'Camp on the broad back of the root, a fire in a hollow of bark, the forest dark and enormous all around you. The root is warm under your bedroll.',
            dw: 'Camp on a raft of fallen trunks above black water. The fire hisses. Things drip. Every so often, far off, something breaks the surface and goes under again.',
            ah: 'Camp in the lee of a black ridge, out of the wind. The fire burns strangely here: low and blue, as if the ash remembers being fire. The dead tree blots out a third of the stars.',
        }[region(g)]}

${pantry(g)}`,
        choices: [
            { text: 'Cook and eat.', show: (g) => foodCount(g) > 0 && daily('bl_cook')(g), time: 30, do: (g) => { markDaily(g, 'bl_cook'); return eatBest(g, { fire: true }); }, to: 'bl_camp' },
            { text: 'Sing a ring of bone stakes around the camp.', show: daily('bl_stakes'), qi: 3, check: { skill: 'Convergence Use', dc: 4 }, time: 15, do: (g) => { markDaily(g, 'bl_stakes'); g.flags.bl_stakes_night = true; return ['A ring of white points, leaning outward. Ya approves of anything with points.']; }, failDo: (g) => { markDaily(g, 'bl_stakes'); g.flags.bl_stakes_night = false; return ['They come out soft. Ya kicks one over.']; }, to: 'bl_camp' },
            { text: 'Sit by the fire with the others.', show: daily('bl_fire'), time: 20, to: 'bl_fireside' },
            { text: 'Sleep.', to: 'bl_night' },
        ],
    },
    bl_fireside: {
        id: 'bl_fireside', title: 'Fireside', art: 'trio_fire', place: (g) => PLACE[region(g)],
        enter: (g) => { markDaily(g, 'bl_fire'); return []; },
        text: (g) => {
            const r = region(g);
            if (r === 'rr') return `Ya tears at a strip of meat. Mei Lin eats with her chopsticks — she brought chopsticks, into the Blackroot — with tremendous dignity. Yuki eats everything.

"Tell a story, scholar," Ya says. "A true one. About your home with the singing trees."

So you do. You tell them about the Hearth Trees, and the cities grown out of them, and how a child learns to sing to the wood before she learns to read. Ya listens with her chin on her knees, wide-eyed as a child. Mei Lin listens with her eyes closed.

When you finish, nobody says anything for a while. Then Ya says, "I'd like that. A tree that sang back." And Mei Lin says, "So would I," and they look at each other across the fire, startled to agree about anything.`;
            if (r === 'dw') return `Nobody wants to talk about the drowned. So Ya talks about everything else, loudly, until Mei Lin laughs despite herself — a real laugh, the kind Ashfall trained out of her — and claps her hand over her mouth as if she'd sworn in a temple.

"Do that again," Ya says.

"No."

"Please. Do it again. It sounded like a bird."

"*No*."

${likesMei(g) && likesYa(g) ? 'Later, settling down, the three of you end up closer than strictly necessary — for warmth, Ya says, and nobody argues with her.' : 'Later the fire burns low, and the water goes on dripping, and none of you sleeps much.'}`;
            return `The blue fire. The dead tree. Tomorrow, or the day after, you'll walk into it.

${both(g) ? 'Ya sits between you and Mei Lin, an arm round each of your necks, and nobody moves her. Mei Lin\'s head is on Ya\'s shoulder. You don\'t think she knows she\'s put it there.' : onlyYa(g) ? 'Ya sits pressed against your side, unashamed, her hand on your knee. Mei Lin sits across the fire and pretends not to see. Maybe she doesn\'t mind. Maybe she minds a great deal.' : onlyMei(g) ? 'Mei Lin sits close enough that her shoulder is against yours. Ya grins at you both across the fire, approving, like a matchmaker who has won a bet.' : 'The three of you sit in a loose ring, the way people sit when they\'ve been through things together and don\'t yet have a word for what that makes them.'}

"Whatever's in there," Mei Lin says, "we go in together."

"Obviously," Ya says. "Who else would I go anywhere with?"`;
        },
        choices: [
            { text: 'Sit beside Mei Lin.', show: (g) => region(g) !== 'ah', do: (g) => { bumpRel(g, 'Mei Lin', 2, 3); return []; }, to: 'bl_night' },
            { text: 'Sit beside Ya.', show: (g) => region(g) !== 'ah', do: (g) => { bumpRel(g, 'Ya', 2, 3); return []; }, to: 'bl_night' },
            { text: 'Sit between them, and see what happens.', show: (g) => region(g) !== 'ah' && both(g), do: (g) => { bumpRel(g, 'Mei Lin', 1, 2); bumpRel(g, 'Ya', 1, 2); return ['What happens is that Ya steals your food and Mei Lin falls asleep on your shoulder. You call it a draw.']; }, to: 'bl_night' },
            { text: 'When Ya takes your hand and tugs you toward the dark, go.', show: (g) => region(g) === 'ah' && onlyYa(g) && !g.flags.ya_romance, to: 'ya_romance' },
            { text: 'Stay up with Mei Lin after the others sleep.', show: (g) => region(g) === 'ah' && onlyMei(g) && !g.flags.mei_bond, to: 'mei_bond' },
            { text: 'Take the first watch together, all of you.', show: (g) => region(g) === 'ah' && !both(g) && !g.flags.bl_friends, to: 'friends_watch' },
            { text: 'Sleep.', to: 'bl_night' },
        ],
    },
    ya_romance: {
        id: 'ya_romance', title: 'Wild', art: 'night_watch',
        enter: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 5, 10); return []; },
        place: (g) => PLACE[region(g)],
        text: (g) => `${g.flags.yr_day ? 'She drags you off the path into a hollow between two great roots, out of sight, and turns round, and doesn\'t wait for anything.' : 'She leads you out past the firelight to a hollow in the ash where the wind doesn\'t reach, and turns round, and doesn\'t wait for anything.'}

Ya kisses like she fights: all at once, teeth first, laughing into your mouth when you catch up. Her hands are rough and quick and sure, and she gets your coat off your shoulders in one movement like she's skinning a hare, and makes a pleased, growling sound when she finds what's under it. "Scholar," she says against your throat, delighted. "You *lied*. You're not soft at all."

You get her jacket off too, eventually, after a negotiation involving several buckles and one knife, and the cold hill air raises gooseflesh on both of you, and she pulls you down onto the moss and the bedroll she somehow brought, and the dead tree, far off over her shoulder, watches with its thousand-year-old patience.

"No villages here," she breathes. "No rules. Just this."

*

Much later, she's dozing with her face in your neck and one bare leg thrown over you, snoring faintly, like a wolf-pup. Somewhere nearby, Yuki sends one aggrieved thought through the bond: *I am going to need to be compensated for this.*`,
        choices: [
            { text: 'Sleep, eventually.', show: (g) => !g.flags.yr_day, to: 'bl_night' },
            { text: 'Find your clothes. Catch up with the others.', show: (g) => !!g.flags.yr_day, do: (g) => { g.flags.yr_day = false; return ['Mei Lin takes one look at the moss in your hair and walks on without a word.']; }, to: hubFor },
        ],
    },
    mei_bond: {
        id: 'mei_bond', title: 'Embers', art: 'night_watch', place: PLACE.ah,
        enter: (g) => { g.flags.mei_bond = true; bumpRel(g, 'Mei Lin', 5, 8); return []; },
        text: (g) => `${g.flags.mb_day ? 'You let Ya and Yuki go on ahead, and Mei Lin stops with you in the shade of a great root, and for a while neither of you says anything.' : 'After Ya\'s asleep — curled up like a dog by the fire, spear in her arms — Mei Lin stays up with you, watching the embers.'}

"I keep thinking," she says, "that when we go back, I'll have to be the old me again. Bow at the right times. Laugh at the right times. Never say anything true." She turns the wolf-tooth Ya gave her — or the herb-knife, or nothing at all — in her fingers. "I don't think I can. I don't think I want to."

"Then don't."

"Easy for you. You're from the sky." But she leans against you, and after a while she turns her face up, and you kiss her: slowly, carefully, the opposite of the first time in the herb loft, as if you've both got all the time in the world instead of two days and a dead tree.

"Whatever's in there," she says against your mouth, "I'm not letting you go in first."

"Noted."

"I mean it. I'll knock you down. I've seen Ya do it. It looks easy."`,
        choices: [
            { text: 'Sleep with her head on your chest.', show: (g) => !g.flags.mb_day, to: 'bl_night' },
            { text: 'Catch up with the others, eventually.', show: (g) => !!g.flags.mb_day, do: (g) => { g.flags.mb_day = false; return []; }, to: hubFor },
        ],
    },
    friends_watch: {
        id: 'friends_watch', title: 'Watch', art: 'night_watch', place: PLACE.ah,
        enter: (g) => { g.flags.bl_friends = true; bumpRel(g, 'Mei Lin', 4, 0); bumpRel(g, 'Ya', 4, 0); return []; },
        text: `None of you can sleep, so none of you tries. You sit up together on the ridge, the three of you and the cat, and keep the watch as a group, which is tactically useless and exactly right.

Ya teaches Mei Lin a dirty song in a language nobody else speaks. Mei Lin teaches Ya the proper way to bow to an elder, then the proper way to bow to an enemy, which is the same bow with the eyes up. Ya thinks this is the funniest thing she has ever heard and practises it on a rock for an hour.

You tell them about the stars. Which ones you think yours might be near. Ya says hers is the one that looks like a wolf. Mei Lin says Ashfall doesn't have its own star, and then, after a while, quietly: "Maybe it should."`,
        choices: [{ text: 'Sleep, at last.', to: 'bl_night' }],
    },
    bl_night: {
        id: 'bl_night', title: 'Night', art: 'night_watch', place: (g) => PLACE[region(g)],
        text: (g) => `${region(g) === 'dw' ? 'Water dripping, all night, from very high up.' : region(g) === 'ah' ? 'The wind over the ridges, and the dead tree breathing above you — you\'d swear it was breathing.' : 'The root is warm under you. Far off, wolves.'}

Watches to set. Ya says she doesn't need sleep, which is a lie; Mei Lin says she can't sleep out here anyway, which is true. Your Parallel Cognition offers its usual watch-thread.`,
        choices: [
            { text: 'Ya takes first watch. You take second.', do: (g) => { g.flags.bl_watch = 'ya'; return []; }, to: 'bl_night_event' },
            { text: 'Mei Lin and Ya together; you and a thread after.', do: (g) => { g.flags.bl_watch = 'both'; bumpRel(g, 'Mei Lin', 0, 1); bumpRel(g, 'Ya', 0, 1); return []; }, to: 'bl_night_event' },
            { text: 'Leave the thread on watch and let everyone sleep.', do: (g) => { g.flags.bl_watch = 'thread'; return []; }, to: 'bl_night_event' },
        ],
    },
    bl_night_event: {
        id: 'bl_night_event', title: (g) => ({ wolves: 'Wolves', drowned: 'The Drowned', serpent: 'Serpent', hawks: 'Sparks in the Dark', lights: 'Lights', song: 'Ya Sings', rut: 'The Rut', warm: 'Cold', rain: 'Rain on Water', mei: 'Awake', stars: 'Stars' }[g.flags.bl_ev] || 'Night'),
        art: (g) => ({ wolves: 'wolves', drowned: 'drowned_dead', serpent: 'mire_serpent', hawks: 'cinder_hawks' }[g.flags.bl_ev] || 'night_watch'),
        place: (g) => PLACE[region(g)],
        enter: (g) => {
            const pool = NIGHTS[region(g)];
            let pick = pool[d6(g) - 1];
            if (pick === g.flags.bl_last_ev) pick = pool[d6(g) - 1];
            g.flags.bl_ev = pick;
            g.flags.bl_last_ev = pick;
            nightTo(g, 60); // v0.11.40 (N1): never back; v0.11.91: after the bed (from 21:00; it was 19:00 here), at 01:00
            return [];
        },
        text: (g) => ({
            wolves: `${g.flags.bl_watch === 'thread' ? 'The watch-thread yanks you awake.' : 'Ya\'s hand on your mouth, her breath in your ear: "Wolves."'} Two ash-wolves, grey on grey, at the edge of the firelight. They have seen the cat.`,
            drowned: `Mei Lin wakes you without a word. She just points. At the edge of the trunks, up to their waists in the black water, two of the drowned are standing, quite still, facing the fire. Watching. Waiting.`,
            serpent: `Something heavy drags itself up onto the trunks. The fire shows a long wet body, a head like a split log, sliding toward the warmth.`,
            hawks: `Sparks in the dark, falling — then screaming. Cinder hawks hunt by night too, it turns out, and they've decided the fire is a challenge.`,
            lights: `${g.flags.saw_lights ? 'The lights again. The same ones you saw from the stream on your first nights in this world.' : 'Lights, low among the trunks.'} Pale, slow, deliberate, flowing past the camp toward the dead tree like a procession. Ya is awake, very still, holding Mei Lin's wrist. Neither of them speaks. Up close, you can hear them: the faintest sound, almost under hearing. They are singing. They are singing the middle of the song the roots are missing.`,
            song: `You wake to Ya singing on watch. No words — just a long, low, wavering call, half human and half wolf, to the dark. Something far away answers it. Then something else. Then the forest is quiet again, as if it had been reassured.

Mei Lin is awake too, lying very still, listening. When it's over she says, very quietly, "That was beautiful," and Ya, on watch, pretends not to hear, and grins at the dark.`,
            rut: `All night, somewhere off the road, two bone-elk fight over something. The crack of bone on bone, again and again, like a woodcutter who hates trees. Nobody sleeps much. Ya keeps up a running commentary on who's winning.`,
            warm: `It's cold. Truly cold, for the first time. Ya, without asking, without any warning at all, crawls into your bedroll, wraps herself around you like a vine, and goes instantly back to sleep. Her feet are ice.

${likesMei(g) ? 'Across the fire, Mei Lin opens one eye, sees, and closes it again. After a while, very quietly, she drags her own bedroll over and lies down on your other side, back to you, stiff as a board. "I\'m *cold*," she informs nobody.' : 'Yuki, displaced, settles on Ya\'s hip and glares at you as if this is your fault.'}`,
            rain: `Rain on the black water: millions of tiny rings, all night, and the mist lifting and settling. Under the sound you think you hear voices sometimes. You decide, as a scientist, that it's the rain.`,
            mei: `You wake in the small hours. Mei Lin is sitting up on watch with her knees drawn up, staring at the dark, and she's crying, quite silently.

"It's nothing," she says, when she sees you're awake. "It's this place. It's the drowned. They looked like people from Ashfall. Like my *mother*." She wipes her face, angry. "Go back to sleep."`,
            stars: `The haze clears, for one hour, and the stars over the Ashen Hills come out so bright they cast shadows. Ya wakes everyone up to see. Nobody minds.`,
        }[g.flags.bl_ev]),
        choices: [
            { text: 'Fight.', show: (g) => FIGHTS.includes(g.flags.bl_ev), combat: (g) => nightFight(g.flags.bl_ev)(g), to: 'bl_night_won' },
            { text: 'Follow the lights a little way.', show: nev('lights'), check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { g.flags.bl_followed_lights = true; return ['You follow until the roots close. The lights go on into the tree, through a crack too small for a person, and the song goes with them.']; }, failDo: () => ['You lose them among the trunks. Ya pulls you back before the dark gets interested.'], to: 'bl_morning' },
            { text: 'Watch them pass. Don\'t move.', show: nev('lights'), to: 'bl_morning' },
            { text: 'Sit up with her until she falls asleep.', show: nev('mei'), do: (g) => { bumpRel(g, 'Mei Lin', 3, 3); return []; }, to: 'bl_morning' },
            { text: 'Go back to sleep.', show: (g) => !FIGHTS.includes(g.flags.bl_ev) && g.flags.bl_ev !== 'lights' && g.flags.bl_ev !== 'mei', do: (g) => { if (g.flags.bl_ev === 'warm') bumpRel(g, 'Ya', 1, 3); if (g.flags.bl_ev === 'song') bumpRel(g, 'Ya', 1, 2); return []; }, to: 'bl_morning' },
        ],
    },
    bl_night_won: {
        id: 'bl_night_won', title: 'Quiet Again', art: 'night_watch', place: (g) => PLACE[region(g)],
        enter: (g) => { if (g.flags.bl_ev === 'wolves') addItem(g, 'venison', 2); if (g.flags.bl_ev === 'hawks') addItem(g, 'fowl_raw', 1); return g.flags.bl_ev === 'wolves' ? ['+2 wolf meat (as venison).'] : g.flags.bl_ev === 'hawks' ? ['+1 cinder hawk (as fowl).'] : []; },
        text: (g) => `${g.flags.bl_ev === 'drowned' ? 'The drowned go back under the black water when you\'ve finished with them, slowly, almost gratefully. Mei Lin sits with her arms round her knees for the rest of the night, and Ya sits with her, and doesn\'t make a single joke.' : 'It\'s over quickly, and messily. Ya cleans her spear and says it was good practice. Mei Lin cleans your cuts and says nothing about practice at all.'}`,
        choices: [{ text: 'Sleep, what\'s left of it.', to: 'bl_morning' }],
    },
    bl_night_lost: {
        id: 'bl_night_lost', title: 'Bad Night', art: 'night_watch', place: (g) => PLACE[region(g)],
        enter: (g) => patchUp(g),
        text: `It goes badly. In the end it's Ya's spear and Mei Lin's knife and a great deal of shouting that drive it off, and you spend the rest of the night being stitched and told off in two voices.`,
        choices: [{ text: 'Sleep, badly.', to: 'bl_morning' }],
    },
    bl_morning: {
        id: 'bl_morning', title: (g) => `Day ${clockParts(g.minutes).day}`, art: (g) => ({ rr: 'root_road', dw: 'drowned_wood', ah: 'ashen_hills' }[region(g)]), place: (g) => PLACE[region(g)],
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) lines.push(nightRest(g)); // v0.11.92 (O1): half back after a night fight
            g.flags.bl_day = bday(g) + 1;
            g.flags.bl_stakes_night = false; // v0.11.25: the stakes last one night
            const out = eatBest(g, { fire: true });
            lines.push(out.length ? `Breakfast. ${out[0]}` : 'No breakfast. Ya offers you a beetle. You decline. For now.');
            return lines;
        },
        text: (g) => ({
            2: 'Morning on the Root Road. Ya is already up, crouched on the root, sniffing the wind. "Wyrm country today," she says. "Eat something. You\'ll want to be heavy if it swallows you. Takes longer."',
            3: 'Grey morning over grey water. The mist is so thick you can\'t see the far side of your own raft. Mei Lin is braiding her hair with her jaw set, the way she does when she\'s frightened and refuses to be.',
            4: 'You leave the Drowned Wood at first light, wading out of the last of the water into the hills. Behind you, the mist closes over the trunks like a lid.',
            5: 'The last morning before the tree. The dead tree fills the sky now; even the sunrise has to come round it. Nobody says much over breakfast. Ya sharpens her spear for a long time.',
        }[bday(g)] || 'Morning again, grey and cold. The dead tree waits, the way it has waited for a thousand years.'),
        choices: [
            { text: 'Get moving.', show: (g) => bday(g) === 2, to: 'rr_hub' },
            { text: 'Get moving.', show: (g) => bday(g) === 3, to: 'dw_hub' },
            { text: 'Climb out of the water into the hills.', show: (g) => bday(g) === 4, to: 'ah_enter' },
            { text: 'Get moving.', show: (g) => bday(g) >= 5, to: 'ah_hub' },
        ],
    },

    /* =================================== the last night =================================== */
    heart_view: {
        id: 'heart_view', title: 'Under the Tree', art: 'heart_gate', place: `${P} — the roots of the dead tree`,
        enter: (g) => { toHour(g, 19); g.flags.bl_region = 'ah'; return []; },
        text: (g) => `You camp in the roots of the dead tree.

There's no other word for it: the roots here rise out of the ground like the walls of a city, grey-white and smooth, forty metres high, and between them are corridors, chambers, hollows big enough to hold Ashfall. The bark of the trunk above is a cliff that goes up into cloud. Far above, the black wound in its side.

At the base of the trunk, half buried in roots, is a gap. A doorway, almost. And from it, faint as breath, the song your roots have been missing.

Your Convergence is singing back. You can't stop it. You're not sure you want to.

${both(g) && trio(g) >= 3 ? 'Mei Lin and Ya lie down on either side of you without discussing it, and Mei Lin, who has not said yes to anything, reaches across your chest in the dark and finds Ya\'s hand, and holds it.' : g.flags.ya_romance ? 'Ya lies down against you as if she\'s always done it. Mei Lin lies down on Yuki\'s other side, close, and says goodnight to both of you, and means it.' : g.flags.mei_bond || g.flags.romance ? 'Mei Lin lies down against you, her head on your shoulder. Ya lies across the bottom of the bedroll like a guard dog, spear in her arms, and grins at you both in the dark.' : 'The three of you lie down close, for warmth, for courage. Yuki takes the exact centre.'}

"Tomorrow," Ya says, to the dark.

"Tomorrow," Mei Lin says.

*Tomorrow,* says Yuki, and for once she doesn't sound sarcastic at all.`,
        choices: [{ text: 'Sleep in the roots of the tree.', to: 'bl_end' }],
    },
    bl_end: {
        id: 'bl_end', title: 'The Door', art: 'heart_gate', place: `${P} — the roots of the dead tree`,
        enter: (g) => {
            const lines = [];
            if (hour(g) < 6 || hour(g) >= 19) { sleepUntil(g, 6); lines.push('Slept until 06:00. HP and Qi full.'); }
            if (clockParts(g.minutes).day < 16) g.minutes = 15 * 1440 + 6 * 60;
            return lines;
        },
        text: `Morning comes grey and quiet in the roots.

You wake to find the doorway in the trunk is wider than it was last night. Not much. But the moss around it has been pushed back, as if something inside had leaned against it in the dark, the way someone leans on a door they're waiting to open.

Ya has her spear. Mei Lin has her knife and her basket and her chin up. Yuki is on your shoulder, claws in.

You have a fresh doctorate, a lab coat with a great many holes in it, and a gift this world has never seen. And somewhere in front of you, a thousand years dead, is a piece of home.

"Well," you say. "Let's see who's in."`,
        choices: [{ text: 'Into the Heart.', do: (g) => { if (clockParts(g.minutes).day < 16) g.minutes = 15 * 1440 + 6 * 60; return []; }, to: 'ht_start' }],
    },
};
