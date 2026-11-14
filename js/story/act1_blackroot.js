/**
 * ACT 1, PART 2 — "Into the Blackroot" (Days 11–15).
 * James, Yuki, Mei Lin and Ya walk the Root Road (Days 11–12, root-wyrm on Day 12), cross the Drowned Wood (Day 13),
 * and climb the Ashen Hills (Days 14–15, rot-ape on Day 15) to camp under the dead Hearth Tree. Day hubs per region,
 * shared camp / fireside / night scenes, a seeded night event, and the Mei Lin – Ya – James romance arc.
 * Entry 'bl_start' (Day 11). Exit 'ht_start' (Day 16, 06:00). Region in g.flags.bl_region, expedition day in g.flags.bl_day (1–5).
 */
import { addItem, hasItem, eat, advance, clockParts, d6, awardYukiFightXp, jamesHpMax, condense, dayHour, nightTo, nightRest, canFly } from '../core/game.js';
import { hasForm } from '../core/forms.js';
import { choiceOpen, gives } from '../core/story.js'; // v0.11.161 (PO2): `optionLeft`; RV (GV, Fable's H1): the wrapper carries the card's items
import { daily, markDaily, eatBest, pantry, foodCount, hour, byForm, byDay, dayIndex, dayReply } from './common.js';
import { noteDay, DAY_REPLIES, coilReply } from '../core/lines.js'; // v0.11.166 (RW1): coilReply, the flirts by Coil
import { encounter, rel, likesMei, likesYa, trio, trioStep, bumpRel, sleepUntil } from './act1_common.js';

/* v0.11.136 (owner pick NC1, NT1's push 2): replies by day (js/core/lines.js dayReply): the first text is the old reply, the rest Fable's, one for each later day of a Coil. */
const DR_STAKES = dayReply("bl_camp:2", [
    "White points in a ring, all tilted outward. Ya approves of anything sharp at one end.",
    "White points again, all the way round. Ya tests one with her thumb and nods, as if she had ordered them herself.",
    "The ring comes up quicker tonight. Mei Lin counts the stakes under her breath, arrives at an even number, and seems reassured by it.",
    "Another ring, leaning out at the dark. Yuki inspects it from the inside, which is the correct side, and goes back to the fire.",
]);
// RV2 (L4, Fable's review): day 2's grin reworded ("with every tooth she owns" is ya_fight_start's)
// v0.11.166 (owner picks RW1, FT1; Fable's): a set of five a Coil (coilReply): the first set the old replies, then two new sets, then round again
const DR_YA_FLIRT = coilReply("talk_ya:0", [[
    "She sizes you up like a bone-elk at the end of a hungry winter.",
    "Every tooth on show, she walks one slow circle round you, as she does round a kill she hasn't yet decided how to carry home.",
    "She says you are getting better at this. Then she acts out how you were before, at length, and it is not a flattering part.",
    "She leans in, sniffs once just under your ear, and reports to the forest at large that the scholar can be taught.",
    "She hears you out to the end, which is new, and then explains that where she comes from all of that is said with one shove. She demonstrates. You get up again.", // v0.11.152 (owner pick RP1, RM2; Fable's): the 5th talk
], [
    "She stops dead and watches your mouth, in case more falls out. \"Small words,\" she says. \"But you threw them at me.\" She appears to count it as your first kill.",
    "Her laugh is loud enough to end the hunting for a mile. She tells you that was a good one, and that you may try again tomorrow, since you have plainly used up everything you had.",
    "She takes your chin in her hand and turns your face left, then right, checking for fever. No fever. \"Then you meant it,\" she says, satisfied, and lets go a little later than she needs to.",
    "For three steps she is offended, because she thinks you were mocking her. Then she works it out, comes back twice as pleased, and makes you carry her spear a while as a mark of favour.",
    "She says nothing, and from Ya that is a great deal. She pulls a tooth off her necklace, looks at it, looks at you, and threads it back on. \"Not yet,\" she tells the tooth. \"Close.\"",
], [
    "Ya squints at you. \"Is that the thing villages do? With the talking first?\" You say it is. She says it's slow, and that you should carry on, because she wants to see how it ends.",
    "Two fingers in your ribs, hard, to find out what the words are made of. You hold still. \"Hm,\" says Ya. \"More in there than I thought.\" From her, you happen to know, that's poetry.",
    "She answers by lifting you clear of the ground, briefly, to check your weight, and setting you down. \"Heavy enough,\" she says. You ask what for. She looks at you with real pity.",
    "She flirts back at once and louder: a boast about what she can carry, how far, and uphill. Up ahead Mei Lin's step falters. Ya notices, raises her voice, and adds a river.",
    "She frowns, because nobody ever taught her what to do when one lands. So she digs out the best strip of dried meat she has, the one she was saving, and watches you eat every bit.",
]]);
// v0.11.172 (owner pick P5A, KO): a set of five a Coil (coilReply), like the flirts: the first set the old replies, then two new sets
const DR_YA_OFF = coilReply("talk_ya:3", [[
    "Her teeth come out, and she walks on ahead. She will get over it. Probably.",
    "She spits to one side, with accuracy, and lengthens her stride until all you can see of her is her back. It is an expressive back.",
    "She says a word she did not learn from Mei Lin, and goes on ahead to be offended where you can watch.",
    "She stares at you until one of you blinks. It's you. Then she stalks off in front, and the spear takes it out on the scenery.",
    "She laughs at you, which is worse than the teeth, and tells Mei Lin at the top of her voice that the scholar is giving orders again. Then she goes on in front anyway, just slowly enough to be followed.", // v0.11.152 (RP1, RM2; Fable's)
], [
    "Ya stops talking. Entirely. She moves ten paces off to one side and walks there with her chin up, being silent at you as loudly as she can manage.",
    "The silence again, and today it has props: she climbs onto the nearest high thing, turns her back, and whets the spear slowly, one stroke for every word you said.",
    "She digs the best thing out of her pouch and presents it to Mei Lin, with ceremony, where you can see. Mei Lin holds it like somebody else's quarrel.",
    "She limps. Nothing is wrong with her foot; a moment ago it was the other foot. She limps until she is sure you have seen, and then outruns you uphill.",
    "By now even Ya is bored with sulking. She manages forty steps of wounded silence, sighs like a bellows, and comes back to walk next to you, as a favour, not speaking. Mostly.",
], [
    "\"Knock it off,\" she says back, in your voice, with your face on. The likeness is fair; Mei Lin has to look somewhere else. Ya is not smiling, and the joke goes cold in your mouth before you can enjoy it.",
    "She wants to know what it means: knock what, off what? You explain. \"Stupid words,\" she says. \"In mine you just bite. Then everybody knows.\" She shows you the teeth, for clarity.",
    "\"You write everything down,\" she says. \"Write this. The scholar asked for quiet, and got it.\" She then says nothing for most of a quarter of an hour, and it visibly costs her.",
    "She steps in near enough to count your eyelashes. \"When you want me to stop, say it with your hands. Words are for the herb girl.\" She is gone before you have either ready.",
    "Today she only looks at you, tired of it. \"Five times you tell me what I'm not to do,\" she says. \"Not once what I should. Think about that, scholar. I'll be in front.\"",
]]);
// v0.11.172 (owner pick P5A, CW): the party on his cooking, a line by day after "Cook and eat" (the owner 2026-11-13 23:15)
const DR_COOK = dayReply("bl_camp:0", [ // RV1 (M1, Fable's review): four camps (Days 11–14), so four lines
    "You fill the other bowls first, from habit. Ya empties hers and watches yours like a snare. Mei Lin calls it \"quite adequate\", in her temple voice, and scrapes the pot.",
    "Ya sits right by the pot tonight, to save walking. Mei Lin asks what you did with the herbs, one professional to another, and forgets to look unimpressed by the answer.",
    (g) => `One piece is left. Ya looks at it. Yuki looks at Ya. ${byForm(g, '*Mine,* says the bond.', '*Mine,* says the bond, from some way up.', '"Mine," says Yuki, pleasantly.')} You cut it in half, and neither of them forgives you.`,
    "Nobody speaks until the pot is empty. Then Ya says you are to cook at her funeral. Mei Lin says funerals don't work like that, and hands her bowl back to you all the same.",
]);
// v0.11.172 (owner pick P5A, SW): the Practice drills' successes, a line by day (they answered nothing)
const DR_BL_DART = dayReply("bl_train:1", [
    "Twenty paces, then thirty, then forty. Somewhere past thirty the mark stops being there to hit. Ya says it had that coming.",
    "You begin where you left off. The darts no longer sag at the end of their flight; you have stopped asking them to hurry.",
    "Farther again. Ya goes and stands by the mark to make it interesting. You make it less interesting than she hoped, and she is impressed, slightly.",
    "Mei Lin picks the mark today, a small one, to be awkward. Three darts land in it, touching. She says she meant another.",
    "From so far back that Ya has to walk out and report. She comes back slower than she went, which is the report.",
]);
const DR_BL_NEEDLE = dayReply("bl_train:2", [
    "One needle at a time, grown slowly, each as fine as the one before. By the end even the omnitool can't tell them apart.",
    "Finer than the last lot. You hold one up against the light and lose sight of it. Mei Lin asks, professionally, whether it would take a thread.",
    "Slow enough to hear each one arrive. Ya watches for a hundred breaths, announces that nothing is happening, and stays to watch more of it.",
    "Eyes shut today, by feel, each needle set down next to the last. You look afterwards: a row straighter than you could have drawn.",
    "Slow, exact and at last boring, which is what a drill is for. Mei Lin says you looked almost peaceful, and sounds suspicious.",
]);
const DR_LIGHTS = dayReply("bl_night_event:1", [
    "You follow until the roots knit shut across the way. The lights pass through a gap no person could use, and the song goes through with them.",
    "You go after them as far as the roots let you. They slip through a gap you couldn't get an arm into, one by one, without hurrying, and the song thins out behind them like a door being closed gently.",
    "You follow as far as there is anywhere to stand. The last light waits at the crack a moment longer than the others, or you'd like to think so, and then goes in after the song.",
]);
// v0.11.166 (owner picks RW1, FT1; Fable's): a set of five a Coil (coilReply): the first set the old replies, then two new sets, then round again
const DR_MEI_FLIRT = coilReply("talk_mei:1", [[
    "\"Impossible,\" she says. The smile gets out before the word is finished.",
    "In Ashfall, she tells you, that remark carries a fine, payable to the elder. She does not offer to be the one who reports it.",
    "A look behind her to begin with, from habit. Then the laugh anyway, out loud, and the face of a woman pleased with a theft.",
    // v0.11.152 (owner pick RP1, RM1; Fable's): the 4th and 5th talks (up to 5 Blackroot days)
    "She informs you, in her temple voice, that she is ignoring you. Her ears have gone pink, and she walks a little closer for the rest of the mile.",
    "She answers you in kind this time, and worse, and then stares into her basket as if the basket had said it. You are fairly sure she has been practising.",
], [
    "One eyebrow goes up. She asks whether that line works where you come from. You admit the data is thin. She says she can tell, and hides her mouth behind a sprig of something bitter.",
    "\"Shameless,\" she says, in the tone her mother keeps for hail damage, and holds it almost to the end of the word. Then she walks on ahead so you can't see her face. Her shoulders are laughing.",
    "She puts a leaf in your hand and tells you it's for swelling of the head. It's for nothing; you know the plant. You keep it anyway, and she sees you keep it.",
    "Today she laughs without looking behind her first. A few steps on she notices, and goes quiet, working out what that cost her. Nothing, apparently. She seems to find the price suspicious.",
    "She stops, sets the basket down, and tugs your coat straight at the shoulders, where it was already straight. \"There,\" she says. \"Now you may say it again.\" You say it again. She listens to all of it.",
], [
    "She tells you, gravely, that a respectable woman would walk away. She goes on walking beside you at exactly the same pace. You point this out. \"I'm considering it,\" she says. \"Respectably.\"",
    "The wind took it, she claims, and makes you say it twice. There is no wind. The second time she takes it in word by word, like a buyer, and says she has heard worse from better men.",
    "A seed pod goes past your ear, a yard wide. You tell her the aim needs work. She says that one was a warning, picks up a second, and doesn't miss.",
    "In her most proper voice she gives you what three Ashfall matrons would say to that, one matron at a time. The third sounds a good deal like agreement. Yuki's ears turn to catch it.",
    "She hands you the basket. You hold the basket. With both hands free she resets her hairpin, slowly, tassel and all, and asks you to go on. You gather the view is being improved on purpose.",
]]);
const DR_SNARE = dayReply("rr_hunt:1", [
    "Ya mourns the elk until dark, aloud, in instalments.",
    "Ya carries the catch by the ears and tells it, personally, that it is not an elk.", // RV2 (L3, Fable's review): one hare on a thin haul
]);
const DR_BETWEEN = dayReply("bl_fireside:2", [
    "What happens is that Ya eats off your plate and Mei Lin goes to sleep against your shoulder. You score it a draw.",
    "What happens is that Mei Lin corrects the way Ya holds her bowl, Ya corrects the way Mei Lin sits, and you are elbowed from both sides at once. Nobody moves away.",
    "What happens is that the dripping gets no quieter, Ya puts her cold feet under your leg without asking, and Mei Lin, after a long and formal silence, does the same from the other side. You are furniture. It's a living.", // v0.11.152 (RP1, RM3; Fable's): the 3rd night it's offered (the Drowned Wood's second)
]);
const DR_SPAR_YA = dayReply("bl_train:0", [
    "Two throws to her, one to you. She could not be happier.",
    "You land one clean sweep. She lands on her feet anyway, and then on you. She calls it your best day yet.",
    "She has started explaining each throw while you're in the air. It helps less than she thinks. You get her down once, mid-sentence.",
    "Honours roughly even, by her count, which gives extra for biting. You don't dispute the count.",
    "Today you see the hip throw coming and are somewhere else. She is so pleased that she tries it again, and that time it works.",
]);
const DR_SPAR_YA_F = dayReply("bl_train:0:f", [
    "Four throws, all hers. She enjoys each one.",
    "Down, and down again, and after that you lose count. Ya keeps it for you, out loud. She's delighted.",
]);
const DR_TRUFFLE = dayReply("ah_forage:0", [
    "Earth, smoke. Magnificent. Your career peaks here.",
    "Still magnificent. You make notes for a paper nobody on this world will referee.",
]);
const DR_CINDER = dayReply("ah_forage:1", [
    "She holds one out on her palm for you to eat, and her hand seems not to know it.",
    "She wipes juice off your chin with her thumb, mid-sentence, and carries on with the sentence.",
]);
// v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the grub's, the fire-beetle's and the darts' second day (ST6); the gains stay outside the lists
const DR_GRUB = dayReply('rr_forage:2', ['It pops. Nutty cream, and under the cream, regret.', `It pops again. Nutty cream, and less regret than last time, which worries you.`]);
const DR_GRUB_AFTER = dayReply('rr_forage:2:after', ['Ya cheers.', `Ya is already finding you another.`]);
const DR_BEETLE = dayReply('ah_forage:2', ['Spicy. Not figuratively: chemically spicy.', `Still spicy. You were braced for it this time, and it made no difference.`]);
const DR_BEETLE_AFTER = dayReply('ah_forage:2:after', ['Ya looks at you as if that was a proposal.', `Ya holds up two fingers, for the second proposal, and shows them to Mei Lin.`]);
/** The darts: two outcomes, one day record (r:ah_hunt:1), so the second day's text follows the day, not the outcome. */
const DARTS_PART = [`The darts go out flat through the ash haze and most of them hit ash. One hare stops being fast. Ya fetches it without being asked and holds it up by the ears, considering it. "Thin," she says. "Like you." Above you the hawks wheel off, unimpressed, trailing sparks.`, `The darts go out low under the haze, and the haze keeps most of them. One hare stays where it was. Ya walks out for it, taking her time, and brings it back by the hind legs, swinging. "One," she says. "I counted for you." Above you the hawks slide off down the wind, unconvinced, shedding sparks.`];
const DARTS_FULL = [`The darts go out flat through the ash haze and the hares stop being fast. Ya fetches them without being asked and comes back holding them up by the ears. "Small," she says. "But you hit what you aimed at. Rare, for you." Above you the hawks wheel off, disappointed, trailing sparks.`, `The darts go out low under the haze and every one arrives. The hares stop where they are. Ya walks out for them and comes back with one in each fist, turning them over for a fault. "Clean," she says, annoyed. "Now I have nothing to say." Above you the hawks slide off down the wind, put out, shedding sparks.`];
DAY_REPLIES['ah_hunt:1:part'] = DARTS_PART; DAY_REPLIES['ah_hunt:1:full'] = DARTS_FULL; // the text lint reads them
/** v0.11.156 (owner pick DM1, RV1 G1; Fable's review H1): the Blackroot's forage repeats the same day, but a forage card's
 * relationship gain counts once a day per card (as before DM1); the grub and the fire-beetle stay once a day each. */
/** v0.11.161 (owner pick PO2, FG + HO; the owner 2026-11-13 11:25: "Blackroot forage and hunts should be limited to once a day PER
 *  OPTION, not overall"): each Blackroot forage card and each hunt option once a waking day, a try counted whatever its outcome, as the
 *  Wilds' cards (`daily` + `markDaily` in `do` and `failDo`); a fight option's `do` runs before the fight (story.js, the one-move
 *  finish too). The hub's Hunt card stays open while either of its two options is left today. */
/** v0.11.161 RV1 (SD, Fable's M2; texts Fable's, owner pick SD1): a hunt's opening on a same-day return after its fight was taken
 *  (won, lost or fled), so the scene no longer shows the beast that is gone; the small game and "Not now." follow. */
export const HUNT_AGAIN = {
    rr: `Ya has gone back to the torn ground and is studying it with the gravity of a magistrate. "She's still on about the elk," Mei Lin says, not quietly. "The elk is done with us for today. The elk has moved on." Ya doesn't turn round. "Hares," she says, as though the word tasted of very little. "There are hares."`,
    dw: `The pool has gone flat again. Nothing long moves under it; the serpent's part of the day is over, however it's being counted. Ya gives the surface one last hard look and turns her back on it, which in her is a formal declaration. Overhead the marsh fowl have resettled, having learnt nothing from any of it.`,
    ah: `The haze over the ridge has nothing in it now. However the business with the hawks came out, they are not up there, and Ya has stopped looking up, which she does not do lightly. "An empty sky is a door left open," she says. "Small things come out." Down in the gullies, small things are doing exactly that.`,
};
export const onceADay = (key, c) => Object.defineProperty({ ...c, show: c.show ? Object.assign((g) => daily(key)(g) && c.show(g), { dailyKey: key }) : daily(key), // RV1 (L1): the day key kept, so a card shows as tomorrow
    do: (g, r) => { markDaily(g, key); return c.do ? (c.do(g, r) || []) : []; },
    ...(c.failDo ? { failDo: (g, r) => { markDaily(g, key); return c.failDo(g, r) || []; } } : {}) }, 'gives', { enumerable: true, get: () => gives(c) }); // RV (GV, Fable's H1): the items read from the card's own `do`, when asked (story.js's `gives`)
/** v0.11.161 (PO2, FG + HO): the Hunt card and the Forage entry are open while their scene would offer an option today (each once a
 *  day; the darts' option also needs the darts' form, so a James who can't throw them has only the fight, as before), so neither
 *  ever opens onto a scene with nothing to take (story.js's `choiceOpen`: shown, enough Qi, room for the haul). Read when shown, after prologue.js's form gate. */
const optionLeft = (g, id) => BLACKROOT[id].choices.some((c) => (c.do || c.combat || c.check) && choiceOpen(g, c)); // shown, not locked (Qi), not all full (story.js); RV1 (LV): "Not now." doesn't count
const relToday = (g, key) => { if (!daily(`rel_${key}`)(g)) return false; markDaily(g, `rel_${key}`); return true; };

export const dartsReply = (g, full) => { noteDay(g, 'r:ah_hunt:1'); return byDay(g, full ? DARTS_FULL : DARTS_PART, 'r:ah_hunt:1'); };
const DR_SORREL = dayReply("rr_forage:1", [
    "Her hand resets your knife-grip. Her eyes stay put.",
    "She looks at your knife-grip, once, and goes back to her own row. You take it as a certificate.",
]);

const P = 'Blackroot Wilds';
const PLACE = { rr: `${P} — the Root Road`, dw: `${P} — the Drowned Wood`, ah: `${P} — the Ashen Hills` };
const region = (g) => g.flags.bl_region || 'rr';
const bday = (g) => g.flags.bl_day || 1;
const hubFor = (g) => ({ rr: 'rr_hub', dw: 'dw_hub', ah: 'ah_hub' }[region(g)]);
const late = (g) => hour(g) >= 19;
/** v0.11.123 (EQ1, SC; Fable's D1 lead-in): Ya's word when Mei Lin takes James to the far end of the raft and Ya likes him too. */
const MEI_RAFT_YA = `Ya watches the two of you get up. Her nose wrinkles, and then she grins to the back teeth. "Go. Tonight I guard." She drags her bedroll round so her back is to the far end of the raft, with the air of a wolf doing someone a favour, and lays the spear across her knees. "I'm not listening," she tells the black water, loudly. "I have very bad ears. Everybody says." She is not put out. Her foot taps the trunk, twice. She is possibly a little put out.`;
const both = (g) => likesMei(g) && likesYa(g);
/** bl_night's second paragraph (NT1: the Drowned Wood's second night has its own, by day). */
const BL_WATCHES = 'Watches to set. Ya claims she never sleeps, which is false; Mei Lin claims she won\'t sleep out here in any case, which is true. Your Parallel Cognition puts up a watch-thread, as it always does.';
/** v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): the Drowned Wood's first night and the Ashen Hills' night have their own watch paragraph (BL_WATCHES was on
 *  three of the four nights); the Drowned Wood's second night its own opener, and its second camp its own paragraph (ST3). */
const BL_WATCH_DW1 = `Watches to set, and nowhere dry to set them from. Ya wants the end of the raft nearest the water, so that whatever comes meets her first; Mei Lin wants the middle, and has counted the trunks. Your watch-thread, at least, does not mind the damp.`;
const BL_WATCH_AH = `The last watches of the road. Ya says nobody can sleep under a thing like that, and yawns; Mei Lin means to sit up and keep an eye on it, in case it moves. Your watch-thread comes forward already facing north.`;
const BL_DW_OPEN = ['All night, from somewhere very high up, water drips.', `Still dripping. By now you know which drop comes next.`];
const BL_DW_CAMP = ['Camp is a raft of fallen trunks with black water under it. The fire hisses; everything else drips. Now and then, a long way out, something comes up through the surface and sinks back.', `Another raft of fallen trunks, better chosen; you are learning. The fire hisses. Mei Lin has hung the wet things up to drip with everything else. Whatever keeps surfacing out there has come no nearer. You checked.`];
const onlyYa = (g) => likesYa(g) && !likesMei(g);
/* v0.11.122 (owner pick LG1, BC; texts by Fable, B0–B3): when both like him, the hot spring and the Ashen Hollow camp offer Ya alone too. */
const SPRING_BOTH_WAIT = 'Nobody says anything for a long time. Mei Lin has come to the very edge of the bank, arms folded, glaring at the stars as if they started it. She hasn\'t left. She hasn\'t come in. She is, you realise, waiting to see what you do.';
const SPRING_BOTH_SPLASH = '"Turn around, both of you," says Mei Lin, in a voice you have never heard her use: small, furious, and something else. There is a splash, and then she is in the water too, on Ya\'s other side, arms folded over her chest.';
const SPRING_JUST_YA = ['"I am going to see to the fire," Mei Lin tells the steam, with great dignity. "It will take me a long time. I will be loud coming back." She goes, her back very straight. Three steps into the trees you hear her laugh, once, and stop herself.', 'Ya puts her hand flat on your chest, under the water. "Just me, then," she says. "For now." Her mouth finds yours. The steam does the rest.'];
const CAMP_BOTH_MEI = 'Mei Lin watches you go with her chin on her knees and calls after you, quite clearly, "Bring him back in one piece, I only brought so much thread," and then puts a hand over her mouth as if the words had got out on their own.'; // RL1 (L3): Fable's ALT A, after the fireside
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
const patchUp = (g) => { g.james.hp = Math.max(g.james.hp, Math.round(jamesHpMax(g) * 0.4)); return ['Mei Lin bandages whatever will take a bandage. Ya pronounces you soft, and shoulders your pack.']; };

/* ---------------- encounters ---------------- */
const elkFight = (g) => encounter(g, { id: 'bone_elk', tier: 'small', intro: 'Down goes the bone-elk\'s head, a hedge of white blades with it, and it comes straight for you.', enemies: [{ name: 'Bone-elk', hp: 14, dc: 5.5, atk: 7, dmg: 5, dr: 1 }], win: 'rr_elk_won', lose: 'rr_elk_lost', flee: 'rr_hub' });
const wyrmFight = (g) => encounter(g, { id: 'root_wyrm', tier: 'region', intro: 'Out of the split in the great root the wyrm unwinds: bark for scales, no eyes, long as Ashfall\'s one street.', enemies: [{ name: 'Root-wyrm', hp: g.flags.wyrm_bridge_fail ? 20 : 24, dc: 6, atk: 7, dmg: 5, dr: 1 }], win: 'wyrm_won', lose: 'wyrm_lost' });
const serpentFight = (g) => encounter(g, { id: 'mire_serpent', tier: 'small', intro: 'The black water swells and breaks. Up through it comes the mire serpent, its mouth opening like a log under the wedge.', enemies: [{ name: 'Mire serpent', hp: 12, dc: 5, atk: 6, dmg: 4 }], win: 'dw_serpent_won', lose: 'dw_serpent_lost', flee: 'dw_hub' });
const drownedFight = (g) => encounter(g, { id: 'drowned', tier: 'small', intro: 'Three of them rise out of the water, and not one makes a splash. They were people once.', enemies: [{ name: 'Drowned man', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Drowned woman', hp: 7, dc: 5, atk: 6, dmg: 4 }, { name: 'Drowned child', hp: 5, dc: 5, atk: 5, dmg: 3 }], win: 'dw_drowned_won', lose: 'dw_drowned_lost' });
const hawksFight = (g) => encounter(g, { id: 'cinder_hawks', tier: 'small', intro: 'Out of the haze fall three cinder hawks, sparks streaming off their wings, shrieking like kettles left on.', enemies: [1, 2, 3].map((i) => ({ name: `Cinder hawk ${i}`, hp: 5, dc: 5.5, atk: 6, dmg: 3, prefersSmall: true, flies: true })), win: 'ah_hawks_won', lose: 'ah_hawks_lost', flee: 'ah_hub' });
const apeFight = (g) => encounter(g, { id: 'rot_ape', tier: 'region', intro: 'The rot-ape drops onto all fours and comes, and the ground jumps. The fur is moss. What looks out of it is not.', enemies: [{ name: 'Rot-ape', hp: g.flags.ape_lured ? 19 : 26, dc: 6, atk: 7, dmg: 6, dr: 1 }], win: 'ape_won', lose: 'ape_lost' });
const nightFight = (kind) => (g) => {
    const t = {
        wolves: { intro: 'Two ash-wolves, working round the rim of the firelight, in no hurry.', enemies: [{ name: 'Ash-wolf', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Ash-wolf', hp: 8, dc: 5, atk: 6, dmg: 4 }] },
        drowned: { intro: 'Two of the drowned have stopped at the edge of the camp, streaming, patient as guests nobody greeted.', enemies: [{ name: 'Drowned', hp: 8, dc: 5, atk: 6, dmg: 4 }, { name: 'Drowned', hp: 7, dc: 5, atk: 6, dmg: 4 }] },
        serpent: { intro: 'The serpent hauls its length on toward the fire, after the warmth.', enemies: [{ name: 'Mire serpent', hp: 11, dc: 5, atk: 6, dmg: 4 }] },
        hawks: { intro: 'A pair of cinder hawks, stooping on the fire like creditors.', enemies: [{ name: 'Cinder hawk', hp: 5, dc: 5.5, atk: 6, dmg: 3, prefersSmall: true, flies: true }, { name: 'Cinder hawk', hp: 5, dc: 5.5, atk: 6, dmg: 3, prefersSmall: true, flies: true }] },
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
    wolves: 'One has tried the stakes coming in, and bleeds for it.',
    drowned: 'One walked straight through the stakes and did not slow. It leaks now, at least.',
    serpent: 'It crossed the stakes to get this far, and the stakes kept a share.',
    hawks: 'One cuts it too fine over the stakes and climbs away short of some feathers.',
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
        { text: 'Rest an hour.', show: (g) => !late(g), do: (g) => advance(g, 60, { resting: true }).concat(['One hour, horizontal. Ya\'s word for it is a nap. Yours is data collection.']), to: id },
        { text: 'Eat something.', show: (g) => foodCount(g) > 0 && g.james.satiety < 85 && (id !== 'rr_hub' || !!g.flags.ya_mocked), time: 15, do: (g) => eatBest(g, { fire: false }), to: id }, // v0.11.47: on the Root Road, "Eat with the others." (Manners) comes first
        { text: 'Chew a ghost-gill (+8 HP).', show: (g) => hasItem(g, 'ghost_gill') && g.james.hp < jamesHpMax(g), do: (g) => { addItem(g, 'ghost_gill', -1); g.james.hp = Math.min(jamesHpMax(g), g.james.hp + 8); return ['+8 HP. The cellar taste has not improved.']; }, to: id },
    ];
}
const hubText = (g, lead) => {
    const h = hour(g);
    const when = h < 11 ? 'Morning.' : h < 15 ? 'Midday.' : h < 19 ? 'Afternoon, the light going amber.' : 'Dusk.';
    return `${when} ${lead}

${pantry(g)} ${g.james.satiety < 30 ? 'You are hungry enough that Ya has begun holding beetles out to you.' : ''} ${g.james.hp < jamesHpMax(g) * 0.5 ? 'You are hurt. Mei Lin\'s eyes keep going to your bandages, and she keeps not mentioning them. A remark would be kinder.' : ''}`;
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
        text: (g) => `Ashfall sees you off at dawn as it does everything else: formally, in silence, and with more people than the job needs. At the last stake Old Wen bows to exactly the depth he would give a sect elder, and holds it. Mei Lin's mother puts a bundle of millet cakes into your hands and says, "Bring her back," and from her it is not a wish. It is a clause.

Then the trees shut behind you and there are four of you. A biologist, ${byForm(g, 'a cat', 'a very large cat', 'a cat on two legs')}, a herb-woman with a basket and a knife, and Ya: barefoot, spear across her shoulders, walking backwards ahead of you so that she can watch your faces.

"Five days in," Ya says. "Six, if I end up carrying one of you. Something will try to eat us on the way. I'll say which, when I smell it." She grins at Mei Lin. "You bowed to the old man like your spine was on fire. Does it hurt, being that polite? Is there a cure?"

"There is," says Mei Lin. "It's called being raised by people."

Before noon you come to the first of the roots: grey-white, smooth as bone, broad as a road, coming up out of the earth and running on into the dark, toward the heart of the forest. Your Convergence, singing since the barley, goes up a key at the sight of it.`,
        choices: [{ text: 'Step up onto the Root Road.', time: 240, to: 'rr_hub' }],
    },

    /* =================================== the Root Road =================================== */
    rr_hub: {
        id: 'rr_hub', title: 'The Root Road', art: 'root_road', place: PLACE.rr,
        text: (g) => hubText(g, bday(g) === 1
            ? 'The root runs ahead of you, broad enough for a cart, rising and dipping across the forest floor like the backbone of a sleeper. Lesser roots come in from either hand and join it. Every one of them is going the same way.'
            : 'Day two on the Root Road. The roots run thicker here, and warmer underfoot. Ya says the road ends today, at the split, and that the split has a tenant. She mentions it as other people mention rain.'),
        choices: [
            // v0.11.47 (owner 20:01): the Manners beat sits behind eating on the Root Road (was "Stop for the midday meal.", the same place in the list):
            // until it has played this card replaces "Eat something." here; Ya's millet cakes, so no food needed; then the ordinary card is back;
            // v0.11.48 (owner pick M1): at any Fed, as the old midday meal (the Fed < 85 gate hid it all morning after a full supper)
            { text: 'Eat with the others.', show: (g) => !g.flags.ya_mocked && !late(g), time: 30, to: 'ya_mocks' },
            { text: 'Ya has been staring at you for an hour. Ask her what her problem is.', show: (g) => !!g.flags.ya_mocked && !g.flags.ya_sparred && !late(g), time: 10, to: 'ya_fight_start' },
            { text: 'Forage along the roots.', show: (g) => optionLeft(g, 'rr_forage') && !late(g), time: 15, to: 'rr_forage' },
            { text: 'Hunt.', show: (g) => optionLeft(g, 'rr_hunt') && !late(g), time: 15, to: 'rr_hunt' },
            { text: 'Scout ahead with Ya.', show: (g) => !late(g), time: 20, to: 'rr_scout' },
            { text: 'Put your hand flat on the root and listen.', show: (g) => !g.flags.rr_listened && !late(g), time: 30, to: 'rr_roots' },
            ...hubChoices('rr_hub'),
            { text: 'Make camp on the root.', show: (g) => bday(g) === 1 && hour(g) >= 16, time: 20, to: 'bl_camp' },
            { text: 'Push on to the end of the road. To the split.', show: (g) => bday(g) >= 2, time: 60, to: 'rr_end' },
        ],
    },
    ya_mocks: {
        id: 'ya_mocks', title: 'Manners', art: 'root_road', place: PLACE.rr,
        enter: (g) => { g.flags.ya_mocked = true; eat(g, 15); return ['Millet cakes, eaten on a root as wide as a road: +15 satiety.']; },
        text: (g) => `Mei Lin sits, tucks her legs under her and dips her head a finger's breadth before the first bite: the small thanks every Ashfall child is taught to give Heaven for food. Ya watches with her mouth open and half a millet cake in it.

Then she gives an imitation. It is cruel, it is exact, and most of it is done with the eyelashes.

"Thank you, Heaven," Ya simpers, "for this cake her mother baked and the scholar carried and Heaven didn't do *shit* for—"

"Some of us," says Mei Lin, perfectly level, "were raised by people, and not by whatever hauled you out of a burrow."

Ya goes still. It is not the stillness of someone hurt. It is the stillness of an animal choosing where to bite. "Say *animal*," she says softly. "Go on. They all get there."

"*Animal.*"

Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, sends a single thought through the bond: *finally, some entertainment.*

And now the pair of them turn to you.`,
        choices: [
            { text: 'Side with Mei Lin. "She thanks Heaven. You eat bugs. Nobody\'s perfect."', do: (g) => { bumpRel(g, 'Mei Lin', 4, 2); bumpRel(g, 'Ya', -4, 0); g.flags.ya_grudge = true; return ['Mei Lin\'s mouth twitches. Ya stalks off to eat by herself, as loudly as a millet cake allows.']; }, to: 'rr_hub' },
            { text: 'Side with Ya. "It was a pretty good impression."', do: (g) => { bumpRel(g, 'Ya', 4, 3); bumpRel(g, 'Mei Lin', -3, 0); return ['Ya crows. Mei Lin looks at you like a woman making an entry in a ledger, to be opened later.']; }, to: 'rr_hub' },
            { text: 'Defuse it. "We have a five-day walk and no doctor. Pick a fight with the forest."', check: { skill: 'GU', dc: 4 }, do: (g) => { bumpRel(g, 'Mei Lin', 2, 0); bumpRel(g, 'Ya', 2, 0); return ['Now they are both glaring at you instead. You count it as progress.']; }, failDo: (g) => { bumpRel(g, 'Ya', -2, 0); return ['Ya concludes that you are cowards, the pair of you. She explains why, point by point.']; }, to: 'rr_hub' },
        ],
    },
    ya_fight_start: {
        id: 'ya_fight_start', title: 'A Look', art: 'ya_fight', place: PLACE.rr,
        enter: (g) => { g.flags.ya_sparred = true; return []; },
        text: (g) => `"You looked at me," Ya says. She has stopped in the middle of the root and driven her spear upright into the bark. "When she said *animal*. You looked at me like the Sect looks at a beast. Like you were *writing it down*."

"I'm a biologist. Everything gets written down. Mei Lin's hairpin got written down."

"Don't be clever. I hate clever." The spear goes to Mei Lin, who catches it because her hands decide before she does. Ya sets herself in front of you with no weapon and no shoes, showing every tooth she has. "You want to study the animal? Come and study it."

Mei Lin considers the spear nobody consulted her about. "Please don't hurt each other," she says. "I've only got so much thread."

${byForm(g, 'Yuki climbs down off your shoulder and sits at a safe distance', 'Yuki walks off a little way and lies down at a safe distance', 'Yuki steps back and sits on a root at a safe distance')}, like somebody holding a ticket for the front row.`,
        choices: [
            { text: 'Fight her. No bone, no Qi. Fair.', check: { skill: 'GU', dc: 6, band: 'challenging' }, time: 20, to: 'ya_spar_win', fail: 'ya_spar_lose' },
            { text: 'Apologise. Properly. Without a single joke.', do: (g) => { bumpRel(g, 'Ya', 2, 0); g.flags.ya_respected = true; return []; }, check: { skill: 'GU', dc: 5 }, to: 'ya_spar_win', fail: 'ya_spar_lose' },
        ],
    },
    ya_spar_win: {
        id: 'ya_spar_win', title: 'Pinned', art: 'ya_fight', place: PLACE.rr,
        enter: (g) => { bumpRel(g, 'Ya', 6, 6); bumpRel(g, 'Mei Lin', 0, 1); return []; },
        text: (g) => `${g.flags.ya_respected
        ? 'You apologise, and you leave the jokes out. You tell her she is the best hunter you have ever seen, and that this is how you look at anything that is better at its work than you are at yours. She studies you, narrow-eyed, hunting for the trap in it. Then she kicks your feet out from under you anyway, for form\'s sake, and lets you pull her down with you.'
        : 'It is short, ugly and educational. She is faster. You are heavier, and you have nine threads reading her footwork at once. The third time she goes for your knees they are somewhere else, and she finishes face-down on the root with your knee in her back.'}

She's laughing. Flat on the bark, out of breath and *delighted*.

"Oh, you're *good*," she says. "And a liar. You said scholar. Get off. No, stay. No, get off, the herb girl's looking."

Mei Lin is looking. Mei Lin gives Ya her spear back with the exact face of a woman who has just learnt a thing about herself and does not care for it.`,
        choices: [{ text: 'Help her up.', to: 'rr_hub' }],
    },
    ya_spar_lose: {
        id: 'ya_spar_lose', title: 'Sat On', art: 'ya_fight', place: PLACE.rr,
        enter: (g) => { bumpRel(g, 'Ya', 4, 4); g.james.hp = Math.max(1, g.james.hp - 2); return ['−2 HP, and a share of your dignity.']; },
        text: `It lasts about four seconds. Then you are flat on the root with Ya seated on your chest, and she has both your wrists pinned over your head in one hand, at no visible cost to herself.

"Scholar," she says, very pleased and very close. "You looked at me. Now I look at you." She looks. She is thorough about it. Then she licks your cheek, once, jaw to temple, like a dog, and bounces off you.

"Salty," she reports to Mei Lin. "You should try."

Mei Lin goes the colour of a ripe needleberry and walks on ahead without a word. What Yuki sends you through the bond is not a word, exactly. It is, beyond any doubt, a laugh.`,
        choices: [{ text: 'Get up. Wipe your face. Say nothing.', to: 'rr_hub' }],
    },
    rr_forage: {
        id: 'rr_forage', title: 'Root-Foraging', art: 'root_road', place: PLACE.rr,
        text: `Three experts, three opinions. Mei Lin takes the herbs in the shadow of the roots. You take the fungus: bracket shelves the colour of old ivory, one to every crack in the bark. Ya takes whatever lives under a loose flap of root-bark, and comes back chewing.

"Grubs," she says, and holds out a fat white one. "Good fat. Better than your mushrooms."

"To you, everything is better than my mushrooms."

"Not *everything*." She winks. It is a very aggressive wink.`,
        choices: [
            onceADay('rr_bracket', { text: 'The ivory brackets. Spore print, omnitool, the full liturgy.', check: { skill: 'GU', dc: 4, bonus: () => 2 }, time: 50, do: (g) => { addItem(g, 'jade_bracket', 3); return ['+3 Jade bracket fungus (the root variety, almost sweet).']; }, failDo: (g) => { addItem(g, 'jade_bracket', 1); return ['One sound shelf, and two that go to crumbs in your hand. +1 Jade bracket.']; }, to: 'rr_hub' }),
            onceADay('rr_sorrel', { text: 'Help Mei Lin with the root-sorrel.', check: { skill: 'GU', dc: 3 }, time: 50, do: (g) => { addItem(g, 'river_cress', 4); (relToday(g, 'rr_sorrel') && bumpRel(g, 'Mei Lin', 2, 1)); return [`+4 root-sorrel (counts as river cress). ${DR_SORREL(g)}`]; }, failDo: (g) => { addItem(g, 'river_cress', 2); return ['You cut it too high on the stem. Mei Lin sighs exactly like her mother. +2 root-sorrel.']; }, to: 'rr_hub' }),
            { text: 'Eat the grub.', show: daily('rr_grub'), do: (g) => { markDaily(g, 'rr_grub'); eat(g, 10); bumpRel(g, 'Ya', 3, 2); return [`${DR_GRUB(g)} +10 satiety. ${DR_GRUB_AFTER(g)}`]; }, to: 'rr_hub' },
        ],
    },
    rr_hunt: {
        id: 'rr_hunt', title: 'Bone-Elk', art: 'bone_elk', place: PLACE.rr,
        text: (g) => (!daily('rr_elk')(g) ? HUNT_AGAIN.rr : byDay(g, [`Ya has the scent before anyone has the sight. Her head comes up, her nostrils widen, and she aims her chin at it.

A bone-elk, cropping the moss between two roots: grey hide, and antlers that are not antler at all but raw bone, white and branching, spiralling out of its skull and back along its neck like a mane of knives. Your Convergence goes quiet and attentive, as a musician does when another instrument starts to tune.

"Big meat," Ya whispers, eyes shining. "Big *mean* meat. You go left, I go right, the herb girl stays behind the root and screams if anything else comes."

"I have a name," Mei Lin whispers back.

"Scream it, then."`, `Ya stops with one foot in the air. She doesn't point this time. She just looks at you, and then along the root, and waits to see whether you can find it yourself.

It takes you a while. A bone-elk, head up in the moss between two roots: bigger than the last one, or closer. The bone runs back along its neck in white spirals, and one tine is broken short. Your Convergence notices the break before you do, and winces.

"Old one," Ya breathes. "Clever. It's heard us already. It's deciding." Her grin is all teeth. "Same as before. You left, me right."

"And I stay behind the root," Mei Lin whispers, "and scream."

"See? She learns."`], 'rr_hunt')),
        choices: [
            onceADay('rr_elk', { text: 'Take the bone-elk.', combat: elkFight, to: 'rr_elk_won' }),
            onceADay('rr_snare', { text: 'Leave the elk. Snare root-hares instead.', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 60, do: (g) => { addItem(g, 'hare_raw', 2); return [`+2 root-hares (as hare). ${DR_SNARE(g)}`]; }, failDo: () => ['Empty snares. Ya will be bringing it up until dark.'], to: 'rr_hub' }),
            { text: 'Not now.', to: 'rr_hub' }, // v0.11.161 RV1 (LV, Fable's M1): a way back, so a second visit is never a forced fight
        ],
    },
    rr_elk_won: {
        id: 'rr_elk_won', title: 'Big Mean Meat', art: 'bone_elk', place: PLACE.rr,
        enter: (g) => { addItem(g, 'venison', 3); addItem(g, 'elk_antler', 1); bumpRel(g, 'Ya', 3, 2); return ['+3 elk meat (as venison), +1 Bone-elk antler.']; },
        text: (g) => byDay(g, [`The elk comes down in a clatter of bone. Ya is on it before it has finished moving, knife out, and opens the throat so neatly that back home it would win her a surgical residency.

She looks up at you, bloody to the elbows, with the happiest face you have met on this world.

"You," she says, "can come hunting with me *any time*."

You pick up a shed antler-tine. It is warm in your hand, and your Convergence turns it over like a jeweller with a stone: the grain, the density, how badly it *wants* to be shaped. You could make a remarkable thing out of this. Into the hammerspace it goes.`, `This one goes down harder, and takes a strip of bark off the root with it. Ya lets it finish. Then she kneels, lays her palm flat on the grey hide for one breath, which she did not do for the first, and gets out her knife.

"Once is luck," she says, working. "Twice is a hunter." She looks you over, blood to the wrists, as if pricing you. "A bad hunter. Loud feet. But a hunter."

You take an antler-tine again: a short one, snapped off clean in the fight. Your Convergence weighs it against the memory of the other and finds them different, the way two voices are different. This one is denser. It would hold an edge. It goes into the hammerspace, and Ya watches the air close over it and shakes her head.`], 'rr_elk_won'),
        choices: [{ text: 'Back to the road.', time: 40, to: 'rr_hub' }],
    },
    rr_elk_lost: {
        id: 'rr_elk_lost', title: 'Antlers', art: 'bone_elk', place: PLACE.rr,
        enter: (g) => patchUp(g),
        text: (g) => `The elk wins, and makes a thorough job of it: one antler through your coat and very nearly through you. Then it leaves at a dignified trot, its point made.

Ya is furious. Not with you; with the elk, which she curses in a language you suspect has one speaker. Mei Lin just stitches, quietly.${byForm(g, '', " The elk put Yuki through a thornbrake first, which is how it got to you. She comes out of it backwards, bristling, and sits down beside Mei Lin to wait her turn.", " The elk threw Yuki into a thornbrake first, which is how it reached you. She walks out with her hair full of thorns and her face full of nothing, and holds a scratched arm out to Mei Lin without being asked.")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Back to the road, limping.', time: 40, to: 'rr_hub' }],
    },
    rr_scout: {
        id: 'rr_scout', title: 'Nose First', art: 'root_road', place: PLACE.rr,
        enter: (g) => { markDaily(g, 'rr_scout'); return []; }, // v0.11.156 (RV1, CD): a mark for "Call it a day" only, no longer a gate
        text: (g) => `Ya teaches tracking as she learned it herself: nose first.

"Eyes lie," she says, crouched on the root with her face almost in the moss. "Ears lie. Nose doesn't. Wolf went by here before dawn. Pissed on that, see? Young male. Showing off." Another sniff. "And *that's* you."

"Me?"

"Ten days back, before the village: your camp, by the stream. The wolves weren't the only ones circling it. I smelled you every night." She grins without looking up. "You smell like lightning and soap. Nobody here smells like soap. Two days I followed you, to work out what you were."

${g.flags.saw_lights ? 'Further on, where the roots braid together, she has one more thing to show you: a trail in the moss, greener than the moss on either side of it, running inward. "The lights walk here," she says. "Every night. Toward the old tree. I followed them once, when I was small. I didn\'t go in."' : 'Further on, where the roots braid together, the moss runs greener along a line that points at the heart of the forest. "Something walks here at night," Ya says. "Not an animal. I don\'t follow it."'}`,
        choices: [
            { text: 'Learn it properly. Nose in the moss and everything.', check: { skill: 'GU', dc: 4 }, time: 90, do: (g) => { g.flags.bl_tracker = true; bumpRel(g, 'Ya', 3, 2); return ['"Eyes lie. Ears lie. Nose doesn\'t," says Ya, and holds your face down in the moss until you agree. You can smell wolf now. You will never again be able to stop smelling wolf. Ya is extremely proud of you.']; /* RV1 (M2): the menu's text is never drawn, so the lesson's first words go here */ }, failDo: (g) => { bumpRel(g, 'Ya', 1, 0); return ['You smell moss. Chiefly moss. Ya pats you on the head.']; }, to: 'rr_hub' },
            { text: '"You followed me for two days?"', do: (g) => { bumpRel(g, 'Ya', 2, 4); return ['"Ten days back. Your first camp, by the stream. The wolves weren\'t the only ones going round it." She shrugs. "You fed the cat first, so: not Sect. You were interesting. Most things aren\'t."']; /* RV1 (M2): the calendar fix and the CW line where they are read */ }, time: 30, to: 'rr_hub' },
        ],
    },
    rr_roots: {
        id: 'rr_roots', title: 'The Root Sings', art: 'heart_roots', place: PLACE.rr,
        enter: (g) => { g.flags.rr_listened = true; return []; },
        text: (g) => `You kneel and lay your palm flat on the root, and your Convergence answers before you have asked it anything.

It is the song. The one from the Hollow, but louder here, and nearer: the slow harmonic of a Hearth Tree, the note your whole civilisation is tuned to. Except that it is wrong. The middle has been cut out of it. There is a first bar and a last bar, and between them a silence where the heart should be.

Under your hand the root is warm. Under Ya's feet, a few metres off, it is not.

"It likes you," Ya says, uneasy, and you have not seen her uneasy before. "The forest doesn't like anyone."

Mei Lin is watching you and not the root. "Your face," she says. "You look like a man standing at a grave."

${g.flags.roots ? 'You think of the root you followed out of the Hollow, and of what lay at the end of it, which was not entirely dead. You are walking toward it now.' : ''}`,
        choices: [
            { text: 'Let the song in. Cultivate with it.', check: { skill: 'Convergence Use', dc: 4 }, noFam: true /* v0.11.141 (RW1, NF): cultivation or rest by its own rule */, time: 60, do: (g) => { g.james.saturation = Math.min(100, Math.round((g.james.saturation + 12) * 10) / 10); return [`The root takes your Qi round its own long circuit and returns it, slow as a held breath. Saturation +12% (${g.james.saturation}%), no Qi spent.`]; }, failDo: () => ['The song runs off you like rain off bark. Not yet, apparently.'], to: 'rr_hub' },
            { text: '"It\'s one of ours," you tell them. "Was."', do: (g) => { bumpRel(g, 'Mei Lin', 3, 2); bumpRel(g, 'Ya', 2, 0); g.flags.told_hearth = true; return ['You tell them what a Hearth Tree is. Nobody laughs, not even Ya.']; }, time: 30, to: 'rr_hub' },
        ],
    },
    rr_end: {
        id: 'rr_end', title: 'The Split', art: 'root_wyrm', place: `${P} — the end of the Root Road`,
        text: `The Root Road ends where the great root splits round a chasm, and both halves dive into darkness and water. The air that comes up smells of rot and wet stone. Far below, somewhere in all that, is the Drowned Wood.

Ya stops. Ya, who has stopped for nothing in two days.

"It lives in the split," she says. "I watched it eat a bone-elk whole. Antlers first."

In the gap between the halves of the root, something moves: long, bark-scaled, sliding. The root shivers under your feet.

"There's a way across," says Ya, "if you can make one. Or there's a way through." She hefts the spear, bright-eyed and a little mad. "I vote through."

"I vote across," says Mei Lin. "I vote *very much* across."`,
        choices: [
            { text: 'Through it. Fight the root-wyrm.', combat: wyrmFight, to: 'wyrm_won' },
            { text: 'Across it: sing a bone bridge over the split, fast and quiet.', qi: 8, check: { skill: 'Convergence Use', dc: 6, band: 'challenging' }, fly: "No bridge. You fly the split low and quiet, ferrying whoever can't. The wyrm tastes the air where a bridge ought to be and finds nothing to bite." /* v0.11.109 (owner pick FL1, C): flown from Foundation, Fable's line */, flyFree: true /* FQ1: no Qi when flown */, do: (g) => { g.flags.wyrm_bridged = true; return ['A white span grows out from your hands across the chasm, ribbed and singing. You run. Behind you the wyrm comes up, too late, and the bridge melts away into its open mouth.']; }, failDo: (g) => { g.flags.wyrm_bridge_fail = true; return ['The bridge is half grown when the wyrm hits it. The bone shatters. Your concentration goes with it.']; }, to: 'dw_enter', fail: 'rr_bridge_fail' },
        ],
    },
    rr_bridge_fail: {
        id: 'rr_bridge_fail', title: 'Through, Then', art: 'root_wyrm', place: `${P} — the split`,
        text: (g) => `The wyrm rears up out of the split with half your bridge in its mouth, bark-scales grinding, and swings its eyeless head toward the warm thing that made it. That is you.

"Through, then!" Ya yells, wholly delighted, and charges.${byForm(g, '', " Yuki goes with her, low and silent, which is how you learn the two of them have been waiting for the bridge to fail.", " Yuki is half a step behind her, tail lashing. \"You tried,\" she tells you over her shoulder, with no regret in it at all.")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Fight.', combat: wyrmFight, to: 'wyrm_won' }],
    },
    wyrm_won: {
        id: 'wyrm_won', title: 'The Wyrm', art: 'root_wyrm', place: `${P} — the split`,
        enter: (g) => { addItem(g, 'wyrm_scale', 4); addItem(g, 'beast_core', 1); bumpRel(g, 'Ya', 4, 3); bumpRel(g, 'Mei Lin', 3, 2); return ['+4 Root-wyrm scales, +1 Murky beast core.']; },
        text: `It dies slowly and it dies ugly, and when it has finished the four of you are sitting on the lip of the split with your backs to the root, breathing like bellows.

Ya is grinning through a mask of sap. Mei Lin has a cut along one cheekbone and has not noticed it yet. Yuki is putting herself to rights, unhurried: her way of declaring a victory.

"I've wanted to kill that," Ya says dreamily, "since I was *nine*."

"Why didn't you?"

"I was nine." Her head goes back against the root. "After that I was alone. You don't fight a thing like that alone. You fight it with—" She stops. She looks at the three of you as if you had only now come into view. Then she gets up, abruptly, and goes to cut scales off the carcass, and the sentence stays where she left it.

Mei Lin watches her go. Her face softens; she catches it softening, and puts a stop to it.`,
        choices: [{ text: 'Climb down into the Drowned Wood.', time: 90, to: 'dw_enter' }],
    },
    wyrm_lost: { // v0.11.131 (XB2, FY; Fable's MAINs): James's fall by flight; the great root-kin comes down the air
        id: 'wyrm_lost', title: 'Over the Edge', art: 'root_wyrm', place: `${P} — the split`,
        enter: (g) => patchUp(g),
        text: (g) => `${canFly(g) ? "You lose the fight and win the crossing, which is the worst way there is to win anything: the wyrm's tail takes you out of the air like a shuttlecock, and flying needs the breath it has just knocked out of you. You fall. Ya jumps after you, and Mei Lin, swearing a streak you intend to carry to your grave, jumps after *her*.\n\nYou hit the water forty metres down, one after another, in the Drowned Wood. The wyrm does not come after you. Wyrms, it turns out, neither swim nor fly." : "You lose the fight and win the crossing, which is the worst way there is to win anything: the wyrm's tail takes you off the root and you fall, and Ya jumps after you, and Mei Lin, swearing a streak you intend to carry to your grave, jumps after *her*.\n\nYou hit the water forty metres down, one after another, in the Drowned Wood. The wyrm does not come after you. Wyrms, it turns out, don't swim."}${byForm(g, '', " Yuki lets go of the wyrm's neck when she is ready and comes down the forty metres at a walk, on nothing. She stops a hand's width above the water. Cats, it turns out, don't have to swim. This one looks at the three of you who did.", " Yuki lets go of the wyrm when it suits her and comes down the forty metres of air like a woman on a staircase. She stops a hand above the water and looks the three of you over. \"I didn't jump,\" she says. \"I'd like that noted.\"")}

"*Never*," says Mei Lin, with one knee on a drowned trunk and the other still in the swamp, "do that again."

"You jumped," says Ya, and could not be happier about it.

"I know I jumped. Shut up."`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Drag yourself onto the drowned trunks.', time: 60, to: 'dw_enter' }],
    },

    /* =================================== the Drowned Wood =================================== */
    dw_enter: {
        id: 'dw_enter', title: 'The Drowned Wood', art: 'drowned_wood', place: PLACE.dw,
        enter: (g) => { g.flags.bl_region = 'dw'; toHour(g, 18); return []; },
        text: `Below the split, the forest is under water.

It is not a lake. It is a forest, still on its feet, drowned to the waist in water that is black and perfectly still. The trunks go down into it and their reflections come up to meet them, so that every tree is two trees and one of the two is upside down. Mist lies on the surface in sheets. Nothing sings and nothing calls. The one sound is a dripping, from very high up.

"Old flood," Ya says, quietly, and the quiet is how you know it is bad. "Before my mother's mother. The forest went wrong and the water came, and the people who lived down here didn't leave." She glances at the water. "They're still here."

Mei Lin makes the sign against the dead, the one she claims not to believe in.

You find a raft of fallen trunks jammed between two trees, high enough and dry enough. It will have to do for tonight.`,
        choices: [{ text: 'Make camp on the trunks.', to: 'bl_camp' }],
    },
    dw_hub: {
        id: 'dw_hub', title: 'The Drowned Wood', art: 'drowned_wood', place: PLACE.dw,
        text: (g) => hubText(g, g.flags.drowned_done
            ? 'The last of the Drowned Wood. The water runs shallower here, and warmer: Ya says there is a spring close by, where the hill-fire comes up underneath it.'
            : 'You go from trunk to trunk, and wade where the trunks give out. Somewhere ahead lies a hollow where the water is deep and the trees lean in together like mourners. Ya says there is no way but across it. She says so with no joke attached.'),
        choices: [
            { text: 'Forage on the drowned trunks.', show: (g) => optionLeft(g, 'dw_forage') && !late(g), time: 15, to: 'dw_forage' },
            { text: 'Hunt.', show: (g) => optionLeft(g, 'dw_hunt') && !late(g), time: 15, to: 'dw_hunt' },
            { text: 'Look at the carvings on the drowned shrine.', show: (g) => !g.flags.dw_carving && !late(g), time: 30, to: 'dw_scout' },
            ...hubChoices('dw_hub'),
            { text: 'Cross the mourning hollow.', show: (g) => !g.flags.drowned_done, time: 40, to: 'dw_hollow' },
            { text: 'The hot spring Ya found.', show: (g) => !!g.flags.drowned_done && !g.flags.spring_done, time: 30, to: 'hot_spring' },
            { text: 'Make camp at the wood\'s edge.', show: (g) => !!g.flags.drowned_done && hour(g) >= 16, time: 20, to: 'bl_camp' },
        ],
    },
    dw_forage: {
        id: 'dw_forage', title: 'Wet Harvest', art: 'drowned_wood', place: PLACE.dw,
        text: `The drowned trees are crowded with things growing: gill-fungi in pale tiers, water-chestnut in the shallows, and frogs, which Ya takes as a gift from whichever god she doesn't believe in.

Mei Lin wades out to the chestnuts with her skirts knotted at the hip and her jaw set against the cold. Ya watches her legs with frank and appreciative interest, and makes no pretence of doing anything else.

"Stop that," says Mei Lin, without turning round.

"Stop what?"

"*That.*"`,
        choices: [
            onceADay('dw_gill', { text: 'The pale gill-fungi on the drowned trunks.', check: { skill: 'GU', dc: 5, bonus: () => 2 }, time: 50, do: (g) => { addItem(g, 'ghost_gill', 2); return ['+2 Ghost-gill. The omnitool is beside itself. So are you, within professional limits.']; }, failDo: (g) => { g.james.hp -= 2; return ['Leeches. This round goes to the fungi. −2 HP.']; }, to: 'dw_hub' }),
            onceADay('dw_chestnut', { text: 'Wade out and help with the chestnuts.', check: { skill: 'GU', dc: 3 }, time: 50, do: (g) => { addItem(g, 'river_cress', 4); (relToday(g, 'dw_chestnut') && bumpRel(g, 'Mei Lin', 2, 2)); return ['+4 water-chestnuts (as river cress). Mei Lin\'s lips have gone blue, and she is laughing at something Yuki did.']; }, failDo: (g) => { addItem(g, 'river_cress', 1); return ['Your foot finds a root that is not there. +1 chestnut, and one biologist wet to the collar.']; }, to: 'dw_hub' }),
            onceADay('dw_frog', { text: 'Go frogging with Ya.', check: { skill: 'GU', xpTo: 'Convergence Use', dc: 4 }, time: 50, do: (g) => { eat(g, 18); (relToday(g, 'dw_frog') && bumpRel(g, 'Ya', 3, 3)); return ['Needles through frogs, frogs on a stick, frogs eaten off the stick. +18 satiety. For one good throw Ya kisses you on the ear, as though that were a thing people did.']; }, failDo: (g) => { (relToday(g, 'dw_frog') && bumpRel(g, 'Ya', 1, 0)); return ['The frogs are quicker than you. Ya is quicker than the frogs. She shares, in the end.']; }, to: 'dw_hub' }),
        ],
    },
    dw_hunt: {
        id: 'dw_hunt', title: 'Something Under the Water', art: 'mire_serpent', place: PLACE.dw,
        text: (g) => (!daily('dw_serpent')(g) ? HUNT_AGAIN.dw : `The drowned branches are full of roosting marsh fowl, dozens of them, fat and loud and without a thought among them. Under them something else is moving: one long wake, drawn across water that has no current to draw it.

"Serpent," says Ya. "Good meat. Bad temper. Like me." Her grin turns on Mei Lin. "Like you."

"My temper is *excellent*."

"This morning you said you'd geld me."

"There was a frog in my bedroll. You put it there."

"A *present*."`),
        choices: [
            onceADay('dw_serpent', { text: 'Go for the serpent.', combat: serpentFight, to: 'dw_serpent_won' }),
            onceADay('dw_fowl', { text: 'Darts at the roosting fowl.', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 50, do: (g) => { addItem(g, 'fowl_raw', 2); return ['+2 Marsh fowl.']; }, failDo: () => ['A storm of honking and feathers, and not one bird in it for you.'], to: 'dw_hub' }),
            { text: 'Not now.', to: 'dw_hub' }, // v0.11.161 RV1 (LV, Fable's M1): a way back, so a second visit is never a forced fight
        ],
    },
    dw_serpent_won: {
        id: 'dw_serpent_won', title: 'Serpent Steaks', art: 'mire_serpent', place: PLACE.dw,
        enter: (g) => { eat(g, 25); addItem(g, 'fowl_raw', 1); return ['Serpent, roasted over a fire of drowned branches: +25 satiety. +1 more to carry (as fowl).']; },
        text: `It beats the water to foam before it dies. Ya rides it through its last few seconds like a horse, whooping, and comes up soaked, glorious and very taken with herself.

Mei Lin, dripping, says, "You're insane," and then, lower, for no ears but possibly yours: "That was beautiful."

You decide you didn't hear it. So does she.`,
        choices: [{ text: 'Back to the trunks.', time: 30, to: 'dw_hub' }],
    },
    dw_serpent_lost: { // v0.11.131 (XB2, FY; Fable's MAIN): taken out of the air when he flies
        id: 'dw_serpent_lost', title: 'The Water Wins', art: 'mire_serpent', place: PLACE.dw,
        enter: (g) => patchUp(g),
        text: (g) => `${canFly(g) ? 'The serpent takes you out of the air by one ankle, at a height you would have said was out of its reach, and drags you under.' : 'The serpent drags you under.'} For a long, cold, silent while the Drowned Wood shows you exactly why the people down here never left.

Then four hands have you by the coat, two of them rough and fast, two of them careful, and you are coughing black water onto a trunk while two women shout at you, one into each ear.${byForm(g, '', "\n\nYuki surfaces a moment later with a length of serpent in her mouth that is no longer attached to anything, climbs out, and shakes a tiger's worth of swamp over all three of you. *It let go,* says the bond. *Eventually. You're welcome.*", "\n\nYuki comes up last, some way off, with her hair plastered flat and a length of serpent in one fist that is attached to nothing any more. She wades out and wrings her tail over all three of you. \"It let go,\" she says. \"Eventually. You're welcome.\"")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Breathe. Then go back.', time: 30, to: 'dw_hub' }],
    },
    dw_scout: {
        id: 'dw_scout', title: 'The Drowned Shrine', art: 'drowned_wood', place: PLACE.dw,
        enter: (g) => { g.flags.dw_carving = true; return []; },
        text: (g) => `Half sunk in the water stands a shrine: four stone posts and a stone roof, older than anything Ashfall has to show. Somebody cut a carving deep into the lintel, and the moss has filled every line of it.

It is a tree. A huge one, with roots that run out to the edges of the stone. Inside it, at the thick of the trunk, sits a shape: long and smooth and coming to a point at one end, as a seed does, or a boat, or a thing that is both.

You stop breathing.

That shape is as familiar as your own hand. It was on the banners and the coins you grew up with, and on the flank of every seed-ship in the registry. You were six when you stood under one, on a school trip, with your fingers in your mother's.

"Old people's god," says Ya. "From before the Sect. It sang, they say."

Mei Lin's eyes are on you, not the stone. "You know what it is."

${g.flags.saw_lights || g.flags.lore_tree ? 'You think of the lights, flowing toward the tree. Of Old Wen\'s story: *it sang, and the singing made the forest kind.*' : ''}

"Yes," you say. "Where I come from, we grow them."`,
        choices: [
            { text: 'Copy the carving into the omnitool, every line.', check: { skill: 'GU', dc: 3 }, time: 30, do: (g) => { g.flags.ship_glyph = true; return ['Saved. The omnitool runs it against the registry and comes back with: *partial match. Ship class: Deep Grove. Lost.*']; }, to: 'dw_hub' },
            { text: 'Tell them everything. The ship. Home. All of it.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 3); bumpRel(g, 'Ya', 4, 2); g.flags.told_ship = true; return ['Ya hears you out without one interruption, which you suspect is a record. Mei Lin takes your hand and holds it, hard, and says nothing whatever.']; }, time: 40, to: 'dw_hub' },
        ],
    },
    dw_hollow: {
        id: 'dw_hollow', title: 'The Mourning Hollow', art: 'drowned_dead', place: `${P} — the mourning hollow`,
        text: `The trees lean in over the hollow like mourners over a grave, and the water under them is very deep, very black and very still.

Halfway across, chest-deep, Mei Lin stops.

"Something touched my leg," she says, in a perfectly calm voice.

The water round her stirs. A hand comes up out of it, grey and bloated, the nails grown long, and closes on her sleeve. Then another. Then a face, rising slowly with its eyes open: a woman's face, very young, wearing the patience of a thing that has waited years for company.

They come up on every side of you. The drowned. Corrupted Qi has kept them, as vinegar keeps a pickle. They make no sound at all.

Mei Lin goes under.

Ya is already moving.`,
        choices: [
            { text: 'Fight them off her.', combat: drownedFight, to: 'dw_drowned_won' },
        ],
    },
    dw_drowned_won: {
        id: 'dw_drowned_won', title: 'Out of the Water', art: 'drowned_dead', place: `${P} — the mourning hollow`,
        enter: (g) => { g.flags.drowned_done = true; bumpRel(g, 'Ya', 3, 2); bumpRel(g, 'Mei Lin', 3, 2); return []; },
        text: `When the last of them sinks, and they do sink, slowly, as if relieved, it is Ya who comes up with Mei Lin.

She went under after her without stopping to think, and now she is dragging her onto the nearest trunk by the collar and pounding her back until half the hollow comes out. One of the drowned got its nails into Ya's forearm and opened it from elbow to wrist. She hasn't noticed.

Mei Lin lies on the trunk, gasping, staring up at Ya. Ya stares down at her. Neither of them says anything clever. Neither of them says anything.

Then Mei Lin says, hoarse, "You came in after me."

"Obviously," says Ya, offended. "You're *mine*. I mean, you're ours. You're the herb girl. Who'd stitch me?" At last she looks at her arm. "Oh. That's bad."`,
        choices: [{ text: 'Get them both to dry ground.', time: 40, to: 'dw_after' }],
    },
    dw_drowned_lost: {
        id: 'dw_drowned_lost', title: 'Held Under', art: 'drowned_dead', place: `${P} — the mourning hollow`,
        enter: (g) => { g.flags.drowned_done = true; return patchUp(g); },
        text: `They hold you under. For a while there is only the cold, and the dark, and hands, a great many hands, and a strange and terrible peace.

Then Yuki is screaming down the bond like a fire alarm, and a bone-knife is cutting the hands away. It is one of yours. It is in Ya's fist, borrowed days ago without a word to you, and you come up into the air with Mei Lin's fingers knotted in your hair.

Ya got her out first. Then the two of them came back for you. The order of that is going to keep you busy for years.`,
        choices: [{ text: 'Crawl to dry ground.', time: 40, to: 'dw_after' }],
    },
    dw_after: {
        id: 'dw_after', title: 'Stitches', art: 'drowned_camp', place: PLACE.dw,
        enter: (g) => { bumpRel(g, 'Mei Lin', 0, 2); bumpRel(g, 'Ya', 0, 2); return []; },
        text: `Mei Lin stitches Ya's arm on a dry hummock, with a bone needle you grow for her and thread drawn from her own sleeve.

Ya does not flinch. Ya talks instead, from the first stitch to the last: about the drowned, about the bear she fought at fourteen, about how cold Mei Lin's hands are, about how *nice* Mei Lin's hands are, for cold ones.

"Hold still," says Mei Lin.

"I am holding still. You're the one shaking."

"I am *not*—" Mei Lin stops. Ties off. Bites the thread through, very close to Ya's skin. Afterwards her fingers stay where they are on Ya's arm, and her eyes stay down, and Ya, for once in her life, has the sense to keep quiet.

You go and look at a tree. It is a very interesting tree. Yuki comes and looks at it with you.

*They will be insufferable now,* she observes, on the bond, where it will not carry. *And you will cook twice as much for them. I know you.*`,
        choices: [
            { text: 'Give them a minute. Then go back.', time: 30, to: 'dw_hub' },
        ],
    },
    hot_spring: {
        id: 'hot_spring', title: 'The Spring', art: 'hot_spring', place: `${P} — the hot spring`,
        enter: (g) => { g.flags.spring_done = true; toHour(g, 18); return []; },
        text: `The Drowned Wood ends where the hills start, and there hot water comes up under the cold: a pool ringed with black rock, steaming into the dusk, with a smell of iron and wet stone.

Ya is out of her clothes and into the water before an objection can be formed, and whoops at the heat. Mei Lin remains on the bank, arms folded, scandalised to the roots of her hair and plainly going nowhere.

"In Ashfall," she tells the steam, "men and women bathe on *separate days*."

"This isn't Ashfall," says Ya, on her back, afloat. "It's us and the trees, and trees keep their mouths shut. Get in. I won't bite." She thinks about it. "Much. Anywhere it shows."

Mei Lin looks at you. You look at the steam. Yuki regards the lot of you with the worn patience of the only grown-up within a day's walk.`,
        choices: [
            { text: 'Turn your back and keep watch. Somebody has to be a gentleman, and it might as well be the one from space.', do: (g) => { bumpRel(g, 'Mei Lin', 4, 2); bumpRel(g, 'Ya', 0, 1); return []; }, time: 60, to: 'mei_curious' },
            { text: 'Get in. Your bruises have bruises.', do: (g) => { bumpRel(g, 'Ya', 2, 5); bumpRel(g, 'Mei Lin', 0, 3); advance(g, 60, { resting: true }); return ['The heat finds every bruise you own. You sit in it up to the shoulders and study the stars, with great care, and nothing but the stars.']; }, to: 'spring_ya' },
            { text: 'Leave them to it. Go back to the trunks.', time: 20, to: 'dw_hub' },
        ],
    },
    spring_ya: {
        id: 'spring_ya', title: 'Steam', art: 'hot_spring', place: `${P} — the hot spring`,
        text: (g) => `Ya comes over to you through the steam, unhurried, and stops when her shoulder is resting on yours. She doesn't speak. From Ya that is strange enough to turn your head.

The grin is gone. All that is left is the looking.

"Where you're from, I don't know how people do this," she says. "Here you take what you want, or something else gets there before you. I want you." Her chin goes toward the bank. "Her too. I'm not stupid. You want her, I've got eyes." She shrugs, wet shoulders in the dark. "So where's the problem? Only villages have that problem."

Mei Lin, up on the bank, is not moving a muscle. There is no chance whatever that she missed it.

${both(g) ? SPRING_BOTH_WAIT : onlyYa(g) ? 'Mei Lin gets up and goes, without a word. Ya watches her out of sight. Then she turns back to you and sets her palm against your chest, below the waterline. "Just you, then," she says. "For now." She kisses you, and the steam sees to the rest.' : 'Mei Lin gets up and goes, without a word. Ya watches her out of sight, shrugs, sinks under the water, surfaces somewhere else, and talks about frogs until bedtime as if nothing had been said.'}`,
        choices: [
            { text: 'Stay as long as the heat lasts.', show: both, do: (g) => { trioStep(g, 2); bumpRel(g, 'Mei Lin', 2, 4); bumpRel(g, 'Ya', 2, 4); return [SPRING_BOTH_SPLASH]; }, to: 'mei_curious' },
            { text: 'Let the steam close over everything.', show: onlyYa, do: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 4, 8); return ['Much later, on the warm rocks, Ya goes to sleep against you, one arm pinning you down so that you will still be there in the morning.']; }, to: 'dw_hub' },
            { text: 'Get out. Get dry. Get back to camp.', show: (g) => !both(g) && !onlyYa(g), to: 'dw_hub' },
            { text: 'Tonight, just Ya. Let the steam close over everything.', show: both, do: (g) => { g.flags.ya_romance = true; trioStep(g, 2); bumpRel(g, 'Ya', 4, 8); return SPRING_JUST_YA; }, to: 'dw_hub' }, // RL1 (L2): the trio step as the shared night // v0.11.122 (LG1, BC; Fable's B1, B2); last, so saved choice positions (g.picked) keep their lines
        ],
    },
    mei_curious: {
        id: 'mei_curious', title: 'Curious', art: 'drowned_camp', place: PLACE.dw,
        enter: (g) => trioStep(g, 2),
        text: (g) => (both(g)
            ? `Later, with Ya away looking at her snares, Mei Lin dries her hair at the fire. When it is done she comes over, settles close against you, and starts without any run-up:

"You get this one time. After that I never said it, and if you laugh, you get a needle." She breathes in. "She makes me *furious*. No shame. No manners. She ate a frog in front of me and its legs were still going. And her mouth won't leave my head." Her hands have closed into fists on her knees. "Nor will yours. In Ashfall that's a whore or a madwoman, I never learnt which, and I'm *curious*, and I *hate* being curious, and I blame you for it, both of you."

Yuki, ${byForm(g, 'from your lap', 'a white hill at your back', 'across the fire and apparently asleep')}, sends one very clear thought: *finally.*

"That wasn't a question," Mei Lin says. "It was a report. So that you know." She gets up as if the ground had turned hot. "Don't say anything."

You say nothing. All week you have done nothing smarter.`
            : `Later, by the fire, Mei Lin dries her hair and does not mention the spring. Your arm is playing low: a woman singing in no language spoken here. "You put her on when one of us is cold," Mei Lin says. "I've counted."

"In Ashfall they'd have burned Ya for a demon," she says presently, watching Ya prowl the rim of the firelight. "She'd have laughed all through it." Envy in her voice, perhaps, or homesickness for a life with fewer rules in it. "I can't tell whether I want to be her or strangle her."

"Both is an option."

"In Ashfall, nothing is an option." She looks into the fire. "That's the trouble with Ashfall."`),
        choices: [{ text: 'Back to the others.', to: 'dw_hub' }],
    },

    /* =================================== the Ashen Hills =================================== */
    ah_enter: {
        id: 'ah_enter', title: 'The Ashen Hills', art: 'ashen_hills', place: PLACE.ah,
        enter: (g) => { g.flags.bl_region = 'ah'; return []; },
        text: `Up out of the water, into the hills, and there the forest ends.

It doesn't thin out. It ends, on a line you could mark with string, and past the line the hills are black: burnt ridges, ash to the depth of a hand, stumps standing in rows like bad teeth. Whatever burned here burned hot enough to run the stone; it lies in the gullies still, in glassy tongues. Nothing has grown since. The wind tastes of old smoke, and the sky above the ridges has the colour of a bruise on its third day.

Over all of it, and far nearer than it was, the dead tree takes up half the horizon. From here you can make out the bark, grey as weathered bone, the stubs of great limbs that broke off centuries back, and high in its flank a huge black wound where something was cut out of it.

Ya refuses to look at it. Mei Lin can't look anywhere else.

"Two days," says Ya. "Then we're under it." She spits into the ash. "And then I go home, and the three of you can die in there on your own."

She doesn't mean a word. All of you can hear that she doesn't, and it helps nobody.`,
        choices: [{ text: 'Climb.', time: 120, to: 'ah_hub' }],
    },
    ah_hub: {
        id: 'ah_hub', title: 'The Ashen Hills', art: 'ashen_hills', place: PLACE.ah,
        text: (g) => hubText(g, bday(g) <= 4
            ? 'Black ridges, a grey sky, the dead tree over both. High up, cinder hawks circle, each trailing a thin thread of smoke.'
            : 'One ridge left before the tree. A rot-ape holds the pass at the top, Ya says. She says it calmly, and nothing she has said all week has worried you more.'),
        choices: [
            { text: 'Ya\'s gone. So is her spear.', show: (g) => bday(g) >= 4 && !g.flags.ya_off_done && !late(g), time: 10, to: 'ya_offended' },
            { text: 'Find Mei Lin and Ya. They went for water an hour ago.', show: (g) => both(g) && trio(g) >= 2 && !g.flags.trio_kiss_seen && !late(g), time: 30, to: 'trio_kiss' },
            { text: 'Forage in the ash.', show: (g) => optionLeft(g, 'ah_forage') && !late(g), time: 15, to: 'ah_forage' },
            { text: 'Hunt.', show: (g) => optionLeft(g, 'ah_hunt') && !late(g), time: 15, to: 'ah_hunt' },
            { text: 'Climb to the cairn on the high ridge.', show: (g) => !g.flags.ah_cairn && !late(g), time: 40, to: 'ah_scout' },
            ...hubChoices('ah_hub'),
            { text: 'Make camp in the lee of a ridge.', show: (g) => bday(g) <= 4 && hour(g) >= 16, time: 20, to: 'bl_camp' },
            { text: 'Climb to the pass. The rot-ape.', show: (g) => bday(g) >= 5, time: 60, to: 'ah_ridge_end' },
        ],
    },
    ah_forage: {
        id: 'ah_forage', title: 'Ash and Embers', art: 'ashen_hills', place: PLACE.ah,
        text: `The ash feeds whoever knows where to dig. Mei Lin's share is the cinderberry bushes, down in the gullies where the stone ran to glass. Yours is the truffles: black and wrinkled, fruiting under the surface where the old fire left the soil rich. Ya's is the fire-beetles. She eats them live, with a crunch, and holds Mei Lin's eye all the way through each one.

"Disgusting," says Mei Lin.

"You're still looking."

"I'm looking so I don't miss it when you *die*."`,
        choices: [
            onceADay('ah_truffle', { text: 'Dig for the ash-truffles.', check: { skill: 'GU', dc: 5, bonus: () => 2 }, time: 60, do: (g) => { addItem(g, 'jade_bracket', 2); eat(g, 10); return [`+2 ash-truffles (as jade bracket), and one eaten on the spot: +10 satiety. ${DR_TRUFFLE(g)}`]; }, failDo: () => ['Ash, more ash, and one beetle. The beetle goes to Ya.'], to: 'ah_hub' }),
            onceADay('ah_cinder', { text: 'Cinderberries with Mei Lin.', check: { skill: 'GU', dc: 3 }, time: 40, do: (g) => { addItem(g, 'crimson_berry', 6); (relToday(g, 'ah_cinder') && bumpRel(g, 'Mei Lin', 2, 2)); return [`+6 cinderberries (as needleberries). ${DR_CINDER(g)}`]; }, failDo: (g) => { addItem(g, 'crimson_berry', 2); return ['Thorns. +2 cinderberries.']; }, to: 'ah_hub' }),
            { text: 'Eat a fire-beetle. For science.', show: daily('ah_beetle'), do: (g) => { markDaily(g, 'ah_beetle'); eat(g, 6); bumpRel(g, 'Ya', 3, 3); return [`${DR_BEETLE(g)} +6 satiety. ${DR_BEETLE_AFTER(g)}`]; }, to: 'ah_hub' },
        ],
    },
    ah_hunt: {
        id: 'ah_hunt', title: 'Hawks', art: 'cinder_hawks', place: PLACE.ah,
        text: (g) => (!daily('ah_hawks')(g) ? HUNT_AGAIN.ah : byDay(g, [(g) => `Since you crossed the line into the ash, the cinder hawks have kept you in sight. They are bigger than eagles and ash-grey, and every wingbeat knocks a few faint sparks loose, as though the birds were built of coals that never went all the way out.

"Threes," says Ya. "Always threes." ${byForm(g, '"It\'s the cat they want."', '"They won\'t go for the cat. Not that cat."', '"They\'ll go for the small one."')}

Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, lays her ears back and passes you a thought with nothing in it but teeth.

The gullies hold hill-hares as well: small, quick, the colour of the ash. They are less exciting, and much less likely to set you alight.`, (g) => `The cinder hawks are back over the ridge, turning in the ash haze, shedding sparks at the top of every wingbeat. They found you faster today. You suspect they have been talking.

"Three again," Ya says, shading her eyes. ${byForm(g, '"Same as before. They want the cat."', '"They keep looking at the cat and then looking somewhere else. Smart birds."', '"They want the small one. They always want the small one."')}

Yuki, ${byForm(g, 'on your shoulder', 'at your side', 'at your elbow')}, does not flatten her ears this time. She watches them with the stillness of someone doing sums. ${byForm(g, '*Three,* says the bond.', '*Three,* says the bond.', '"Three," she says.')} It is not a count. It is an order.

The hill-hares are still in the gullies: still small, still ash-coloured, and still entirely free of fire.`], 'ah_hunt')),
        choices: [
            onceADay('ah_hawks', { text: 'Take the hawks before they take Yuki.', combat: hawksFight, to: 'ah_hawks_won' }),
            onceADay('ah_hares', { text: 'Darts at the hill-hares instead.', qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 50, do: (g, r) => { addItem(g, 'hare_raw', 2); return [dartsReply(g, !(r && r.ratio < 1)), '+2 hill-hares.']; }, failDo: () => ['Ash-coloured hares against ash-coloured hills. Every dart finds ash.'], to: 'ah_hub' }),
            { text: 'Not now.', to: 'ah_hub' }, // v0.11.161 RV1 (LV, Fable's M1): a way back, so a second visit is never a forced fight
        ],
    },
    ah_hawks_won: {
        id: 'ah_hawks_won', title: 'Feathers and Sparks', art: 'cinder_hawks', place: PLACE.ah,
        enter: (g) => { addItem(g, 'fowl_raw', 2); return ['+2 cinder hawk (as fowl). The meat keeps a heat of its own.', ...awardYukiFightXp(g, 'standard')]; },
        text: (g) => byDay(g, [(g) => `The last hawk comes down in a spray of sparks, and Yuki — ${byForm(g, 'who rode out the whole fight on your shoulder, claws sunk in, spitting — jumps down onto it, and sits there', 'who has been at your flank through the whole thing, claws out, snarling — puts one paw on it, and sits there', 'who has been at your back through the whole thing, claws out, spitting — puts her foot on it, and stands there')}, glaring up at the sky in case another one feels like trying.

"Little queen," Ya tells her, with enormous respect. Yuki lets the title stand.`, (g) => `The last hawk hits the ash and rolls, trailing smoke, and Yuki — ${byForm(g, 'who has spent the fight on your shoulder with her claws through your coat — is down and on it before it stops, and plants herself there', 'who has spent the fight a pace ahead of you, taking sparks on her fur without seeming to notice — drops a paw on it, and settles there', 'who has spent the fight at your back, ash to the elbows — sets her heel on it, and stays there')}, looking up, counting an empty sky.

"Little queen," Ya says again, and this time she bows: badly, from the waist, with her eyes on the hawk. Yuki considers the bow, and allows it.`], 'ah_hawks_won'),
        choices: [{ text: 'Back to the ridge.', time: 30, to: 'ah_hub' }],
    },
    ah_hawks_lost: {
        id: 'ah_hawks_lost', title: 'Burned', art: 'cinder_hawks', place: PLACE.ah,
        enter: (g) => patchUp(g),
        text: (g) => `The fight goes to the hawks, and so does part of your coat. The rest of the coat is smouldering, with you in it, face down in the ash, while Mei Lin beats out the sparks with her basket.

"Your coat," says Ya, looking through the holes one by one, "is getting very holy."

"Thank you."

"It was ugly before."

"*Thank* you."${byForm(g, '', "\n\nYuki sits upwind with a hawk's tail feathers in her teeth and a scorched stripe down one flank. *Mine is also holy,* says the bond. *Nobody is reviewing mine.*", "\n\nYuki stands upwind with a hawk's tail feathers in one fist and a scorched sleeve. \"Mine is also holy,\" she says. \"Nobody is reviewing mine.\"")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Back to the ridge.', time: 30, to: 'ah_hub' }],
    },
    ah_scout: {
        id: 'ah_scout', title: 'The Founder\'s Cairn', art: 'ashen_hills', place: `${P} — the high ridge`,
        enter: (g) => { g.flags.ah_cairn = true; return []; },
        text: `A cairn stands on the highest ridge: black glassed stone, taller than a man, with a lotus cut deep into its face. Red pigment still clings in the cuts, after all these centuries.

Mei Lin stops where she is. "That's the Sect's mark," she says. "The *old* one. The Founder's. Every temple gate in the mountains has it." There are characters beneath, and she reads them slowly, following each cut with a finger. "*Here the Founder stood, and opened the Heart, and took the Fruit of Heaven, and the mountains were given to the worthy.*"

Your eyes go from the cairn to the dead tree and the black hole cut in its flank, and from there to the burnt hills on every side, glassed by a heat that ran stone like wax.

"Opened the Heart," you say.

"It's a parable," says Mei Lin. She doesn't sound certain.

"It's a crime scene," you say. Ya spits on the cairn and offers no comment, and nobody objects.`,
        choices: [
            { text: 'Scan the cairn. Every cut, every grain of pigment.', check: { skill: 'GU', dc: 4 }, time: 40, do: (g) => { g.flags.founder_cairn = true; return ['Blood, the omnitool says of the pigment, with something else stirred in. The glass is older than the carving: they cut their victory into the scar.']; }, failDo: (g) => { g.flags.founder_cairn = true; return ['Ash in the omnitool, and no reading. The words you have anyway. You don\'t expect to lose them.']; }, to: 'ah_hub' },
        ],
    },
    ya_offended: {
        id: 'ya_offended', title: 'Gone', art: 'ashen_hills', place: PLACE.ah,
        enter: (g) => { g.flags.ya_off_done = true; return []; },
        text: `Nothing started it. Mei Lin said Ya smelled like a wet dog. Ya said Mei Lin smelled like a temple, which in Ya's mouth is the worse of the two. You laughed, at the pair of them and the whole absurd exchange, and all Ya heard was you laughing at *her*.

Under the ash on her face she went white. She used a word you had never heard; Mei Lin had, to judge by the gasp. Then she picked up her spear and walked off the ridge into the haze without one look back.

An hour has gone by since. The cinder hawks are circling lower.

"Let her sulk," says Mei Lin. Her eyes are on the haze as well.`,
        choices: [
            { text: 'Track her. Nose first, like she taught you.', check: { skill: 'GU', dc: 5, bonus: (g) => (g.flags.bl_tracker ? 2 : 0) }, time: 60, to: 'ya_found', fail: 'ya_found' },
            { text: 'Wait. She\'ll come back when she\'s ready.', time: 120, do: (g) => { bumpRel(g, 'Ya', -3, 0); g.flags.ya_waited = true; return []; }, to: 'ya_found' },
        ],
    },
    ya_found: {
        id: 'ya_found', title: 'Teeth', art: 'ya_close', place: `${P} — a burnt gully`,
        text: (g) => `${g.flags.ya_waited
        ? 'She comes back when she is ready, as far as the next rise: chin up, a hare over one shoulder, in plain sight of the camp and not in it. She sits there to gut it, with her back half turned to you.'
        : 'She is in a burnt gully when you find her, perched on a lump of glassed rock, gutting a hill-hare with more force than a hare requires.'}

"Everyone laughs," she says, without raising her head. "Every village. The wild girl. The dog girl. They throw bones out by the edge of the trees, to see if I'll come and get them." The knife goes in hard. "I thought you were not like them. You're as strange as me. Stranger. And you laughed."

"I laughed because you were ridiculous. The two of you. Together. Like—"

"Like *what*."

"Like two people who are much too fond of each other to say so, having an argument about smells."

The knife stops. At last she looks at you, eyes narrowed.

"Hm," she says. A silence follows, and then her fist comes out with something in it: a wolf's tooth, long and yellow, on a cord. "I bit that off a wolf when I was eleven. It's the best thing I own." She shoves it against your chest. "Don't laugh at me again."`,
        choices: [
            { text: 'Take the tooth. Put it on. "I won\'t."', do: (g) => { addItem(g, 'ya_tooth', 1); bumpRel(g, 'Ya', 6, 6); return [`The cord is greasy and the tooth is warm from her fist. You put it on. She watches you do it with the stillness of something deciding whether to bolt, and then goes back to the hare as if nothing has happened, except that she's sitting a hand's width closer than she was.`, '+1 Ya\'s wolf tooth.']; }, to: 'ah_hub' },
            { text: '"Bring it back to camp and give one to Mei Lin, too. She\'s been looking for you."', do: (g) => { addItem(g, 'ya_tooth', 1); bumpRel(g, 'Ya', 4, 3); bumpRel(g, 'Mei Lin', 2, 2); trioStep(g, 2); return ['+1 Ya\'s wolf tooth. Ya sets off to find a second wolf.']; }, to: 'ah_hub' },
        ],
    },
    trio_kiss: {
        id: 'trio_kiss', title: 'The Spring Below the Ridge', art: 'trio', place: `${P} — a spring under the ridge`,
        enter: (g) => { g.flags.trio_kiss_seen = true; trioStep(g, 3); bumpRel(g, 'Mei Lin', 2, 4); bumpRel(g, 'Ya', 2, 4); return []; },
        text: `They are at the little spring under the ridge. You stop at the head of the gully, because they are kissing.

It is not a gentle kiss. Ya has backed Mei Lin up against the black rock, both hands in her hair. Mei Lin has Ya's jacket in two fists and looks undecided between hauling her closer and pitching her off the hill, and she is, beyond any doubt, hauling.

Then Mei Lin sees you past Ya's shoulder. She goes scarlet down to the collarbones and shoves Ya off her, hard.

Ya is not bothered. She licks her lip and turns round. "Oh, good," she says. "Scholar. Tell her it's fine. She won't believe me."

"It is *not* fine," Mei Lin tells the rock. "It is *not*. I'm not — I haven't — I didn't say *yes* to anything."

"You kissed me *back*."

"I *know* I kissed you back!" She rounds on you, eyes wild and wet and entirely furious. "Don't you dare look at me like that. Don't you *dare* look pleased."

You are putting real effort into not looking pleased. Yuki, next to you, is putting in none.`,
        choices: [
            { text: '"Nobody has to say yes to anything. Not today. Not ever, if you don\'t want."', do: (g) => { bumpRel(g, 'Mei Lin', 4, 4); return ['The breath Mei Lin lets go seems to have been in her since Ashfall. Ya rolls her eyes, and hooks an arm round each of your necks regardless.']; }, to: 'ah_hub' },
            { text: '"For the record: I have no objections. Scientifically speaking."', do: (g) => { bumpRel(g, 'Ya', 3, 5); bumpRel(g, 'Mei Lin', 1, 3); return ['Ya laughs herself backwards into the spring. Mei Lin throws a rock at you, and it goes wide. On purpose, you suspect.']; }, to: 'ah_hub' },
        ],
    },
    ah_ridge_end: {
        id: 'ah_ridge_end', title: 'The Pass', art: 'rot_ape', place: `${P} — the last pass`,
        text: `The pass is a notch cut in the last black ridge. Through it, near enough now to be the whole of the sky, stands the dead tree.

The rot-ape sits in the notch. It is as big as a hut. Its fur is moss, alive, with other things growing in it: fungus, small ferns, a bird's nest. Its eyes are a milky, poisoned green. Bones lie all round it: elk, wolf, hawk, and one heap still dressed in the rags of crimson robes.

"It's been here all my life," says Ya. "Longer, maybe. Nothing gets to the tree." She swallows. "My mother tried. When I was small."

Mei Lin takes Ya's hand. She simply takes it, and Ya lets her.

"I have meat," Ya says, very low. "Smoked. It's greedy. If I draw it off to the side, you can hit it from above while it eats."`,
        choices: [
            { text: 'Ya\'s plan. Lure it with the meat; hit it from above.', check: { skill: 'GU', dc: 6, bonus: (g) => (g.flags.bl_tracker ? 1 : 0) }, time: 30, do: (g) => { g.flags.ape_lured = true; return ['It goes for the bait. A white spike has one of its eyes before it learns you exist.']; }, failDo: () => ['Your smell is on the meat. It comes for the source.'], to: 'ape_lured' },
            { text: 'Straight at it. All of you, together.', combat: apeFight, to: 'ape_won' },
        ],
    },
    ape_lured: {
        id: 'ape_lured', title: 'The Pass', art: 'rot_ape', place: `${P} — the last pass`,
        text: (g) => (g.flags.ape_lured
            ? 'One-eyed and roaring, the ape heaves round to face you. All that remains is to finish what the spike began.'
            : 'The ape lets the meat fall. Its milky eyes settle on you, and then it is coming, and the ground shakes under it.'),
        choices: [{ text: 'Fight.', combat: apeFight, to: 'ape_won' }],
    },
    ape_won: {
        id: 'ape_won', title: 'The Pass Is Open', art: 'rot_ape', place: `${P} — the last pass`,
        enter: (g) => { addItem(g, 'beast_core', 2); bumpRel(g, 'Ya', 5, 4); bumpRel(g, 'Mei Lin', 4, 3); return ['+2 Murky beast cores (one of them fist-sized).']; },
        text: `It comes down across the pass like a landslide. The moss on its back is still growing after the heart under it has stopped.

Ya goes over to it slowly and lays her hand on its face. After that she works through the bones in the notch, one at a time, until she has what she came for: a rusted spear-head, bound in leather that age has turned black. She stands with it in her hands, and nobody hurries her.

Mei Lin walks over and stands at her shoulder and says nothing. Ya leans into her, very slightly, as a tree gives to a steady wind.

You leave them to it. Yuki keeps you company, her eyes on the dead tree.

*It knows we're here,* she says, for you alone.`,
        choices: [{ text: 'Through the pass. Down to the tree.', time: 90, to: 'heart_view' }],
    },
    ape_lost: {
        id: 'ape_lost', title: 'Through, Somehow', art: 'rot_ape', place: `${P} — the last pass`,
        enter: (g) => patchUp(g),
        text: (g) => `The ape breaks you. There is no contest in it: one blow, and you are in the ash and the world has gone white.

Ya is what saves you. She goes up its back like a squirrel up a trunk and drives her mother's old spear-head, snatched out of the bone pile, into the base of its skull. That doesn't kill it. But it goes: over the ridge and away downhill, crashing and howling, and that is the last you see of it.

You come round to Mei Lin's hands on your face. Ya sits next to you with a rusted spear-head in her fist, crying, and making no sound at all.${byForm(g, '', "\n\nYuki lies along your other side with one foreleg held off the ground. The ape threw her before it hit you, and she came back on three legs, in time to see it go. She is purring, low, the purr that isn't for pleasure.", "\n\nYuki sits against your other side with one arm held close. The ape threw her before it hit you, and she was back on her feet in time to see it go. She says nothing. Her tail lies across your knees and does not move.")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line
        choices: [{ text: 'Get up. The tree is waiting.', time: 90, to: 'heart_view' }],
    },

    /* =================================== shared: train, talk =================================== */
    bl_train: {
        id: 'bl_train', title: 'Practice', art: 'ya_fight', place: (g) => PLACE[region(g)],
        text: (g) => `${region(g) === 'dw' ? 'One dry trunk, with length enough to move on.' : region(g) === 'ah' ? 'A level floor of ash between two ridges.' : 'The root\'s broad back.'} Ya studies your training like a critic: a woman who never took a lesson in her life, and never lost a fight she wanted. Mei Lin studies Ya studying you, and would deny it.`,
        choices: [
            { text: 'Spar with Ya.', show: daily('bt_ya'), check: { skill: 'GU', dc: 5 }, time: 60, do: (g) => { markDaily(g, 'bt_ya'); bumpRel(g, 'Ya', 2, 2); return [DR_SPAR_YA(g)]; }, failDo: (g) => { markDaily(g, 'bt_ya'); g.james.hp -= 2; bumpRel(g, 'Ya', 1, 1); return [`${DR_SPAR_YA_F(g)} −2 HP.`]; }, to: 'bl_train' },
            { text: 'Darts at a mark, from farther and farther.', show: daily('bt_dart'), qi: 2, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 5 }, time: 60, do: (g) => { markDaily(g, 'bt_dart'); return [DR_BL_DART(g)]; }, failDo: (g) => { markDaily(g, 'bt_dart'); return []; }, to: 'bl_train' },
            { text: 'Needle drills, slow and exact.', show: daily('bt_needle'), qi: 4, check: { skill: 'GU', xpTo: 'Convergence Use', dc: 6 }, time: 60, do: (g) => { markDaily(g, 'bt_needle'); return [DR_BL_NEEDLE(g)]; }, failDo: (g) => { markDaily(g, 'bt_needle'); return []; }, to: 'bl_train' },
            { text: 'Footwork with Yuki.', show: daily('bt_yuki'), check: { skill: 'GU', dc: 5 }, time: 60, do: (g) => { markDaily(g, 'bt_yuki'); return awardYukiFightXp(g, 'standard'); }, failDo: (g) => { markDaily(g, 'bt_yuki'); return awardYukiFightXp(g, 'standard'); }, to: 'bl_train' },
            { text: 'Enough.', to: hubFor },
        ],
    },
    talk_mei: {
        id: 'talk_mei', title: 'Mei Lin', art: 'mei_lin', place: (g) => PLACE[region(g)],
        enter: (g) => { markDaily(g, 'tmei'); return []; },
        text: (g) => {
            const n = Math.max(g.flags.mei_talks || 0, dayIndex(g, 'talk_mei')); // v0.11.135 (NT1): the beat follows the day too; RN2 (M2): beats 0, 1, the old settled text at 2, the two new beats at 3 and 4, the settled text again from 5, so a talk left by the romance choice doesn't show the same beat the next day
            if (n === 0) return `Mei Lin keeps pace with you, basket on her hip, eyes going everywhere: herbs, tracks, Ya's back.

"My mother thinks I'll come home married or not at all," she says. "In Ashfall a woman comes back from the forest in one of two shapes. Married, or dead, or *ruined*." A thin smile. "Three, then."

"And what do you think?"

"I think my mother has never been past the herb slope." A glance at you. "I think no woman of Ashfall ever walked into the Blackroot on purpose before me. Old Wen bowed to me. Did you see? *Bowed.*" Her mouth twitches. "They'll be telling it for ten years. I'll be a cautionary tale."`;
            if (n === 1) return `"Ya says I talk like a temple," says Mei Lin, apropos of nothing.

"A little."

"I know I do." It plainly makes her furious. "I was the girl who laughed at the wrong moment. Who said the wrong thing to the Sect's man. So I learned to say everything correctly, and it did no good, and I laughed at Gao Feng *regardless*, and see what came of that." Her knife takes the top off a stem. "Ya never says one thing correctly. Nobody has stopped her. She just — lives. Like a wolf. Like *weather*."

"You sound jealous."

"I am not jealous." Another stem. "I'm *curious*. That's different. It's a scholar's word. You say it all day."`;
            if (n === 3) return `"Where you come from," Mei Lin says, not looking up from the stem she is stripping, "what does a woman do, at twenty-six, with no husband?"

"Whatever she likes. Most of mine are still at school at twenty-six. Several of them outrank me."

She takes that in with her knife gone still. "And nobody asks whose daughter she is."

"They ask what she's working on."

"Hm." The knife starts again, faster. "I would be terrible at it. I'd spend the first ten years asking leave of people who weren't in the room." A sideways look, and the corner of her mouth goes. "Is there a form to fill in? You look like a people with forms."

"There are several forms."

"Good," says Mei Lin. "I'm very good at forms. I'm from Ashfall."`;
            if (n === 4) return `"I shouted this morning," Mei Lin says. "At the trees. You were asleep. Ya wasn't."

"What did you shout?"

"Nothing. A noise." She steps over a fallen branch with her basket held high. "I have never in my life made a noise that wasn't for something. Calling someone in to eat. Calling for help. Ya said do it again, lower, from the belly, so I did, and a bird fell off its branch." She is trying very hard not to look pleased. "In Ashfall there would have been a meeting. My mother would have gone round the neighbours to apologise. Here it just went out, and didn't come back, and nobody wrote it down."

"I'm writing it down."

"You would." She walks on a few steps. "When we go home I'm supposed to put it all away again. The noise. Walking where I like." Her chin comes up. "I've decided I'm not going to. I haven't decided how."`;
            return `For a while you walk and neither of you talks. That has become easy. She points out a herb that grows only where a beast has died; you point out a fungus that grows only where one is about to. She calls you morbid. You bring up pots and kettles. She adds that you hum when you cook, and that it gives you away; you say the humming is for the fire.

${likesMei(g) ? 'Somewhere along the way there is a fallen trunk to climb, and she takes your hand for it, and once over she keeps it. The matter goes unmentioned by both parties.' : 'She laughs, a real one, and then glances behind her in case somebody from Ashfall was near enough to hear.'}`;
        },
        choices: [
            { text: 'Listen. Ask questions. Let her talk.', do: (g) => { g.flags.mei_talks = (g.flags.mei_talks || 0) + 1; bumpRel(g, 'Mei Lin', 3, 2); return []; }, time: 40, to: hubFor },
            { text: 'Flirt. Lightly. Dangerously.', do: (g) => { g.flags.mei_talks = (g.flags.mei_talks || 0) + 1; bumpRel(g, 'Mei Lin', 1, 5); return [DR_MEI_FLIRT(g)]; }, time: 40, to: hubFor },
            { text: 'Stop walking. Stay with her a while, just the two of you.', show: (g) => likesMei(g) && !g.flags.mei_bond && rel(g, 'Mei Lin').a >= rel(g, 'Ya').a + 8, time: 30, do: (g) => { g.flags.mb_day = true; return []; }, to: 'mei_bond' },
        ],
    },
    talk_ya: {
        id: 'talk_ya', title: 'Ya', art: 'ya_close', place: (g) => PLACE[region(g)],
        enter: (g) => { markDaily(g, 'tya'); return []; },
        text: (g) => {
            const n = Math.max(g.flags.ya_talks || 0, dayIndex(g, 'talk_ya')); // v0.11.135 (NT1, RN2 M2): as talk_mei
            if (n === 0) return `Ya falls in next to you, spear swinging, and spends a while looking you over from boots to hair, with nothing held back.

"You're old," she says.

"Forty."

"That's old." She thinks about it. "Good teeth, though. Good hands. A strong back, for a scholar." She leans over and sniffs you, openly. "And no stink of the Sect on you. When we kill the thing in the tree, you should lie down with me. Or with her, if she can stop bowing at things for that long. Or both. I'm not fussy."

No sarcastic reply presents itself. That has not happened to you since your doctoral defence.

"Think about it," says Ya, and lopes off ahead.`;
            if (n === 1) return `"My mother found me," says Ya. She has sat down on the lip of a drop, legs swinging over thirty metres of nothing. "Not my born mother. The hunter. She found me in a wolf den when I was small, small: too small to remember anything before it. She said the wolves were feeding me. She said I bit her." Ya grins. "I still bite."

"I've noticed."

"She taught me words. Some. The spear. Snares. Then the ape got her, at the pass, when I was twelve. After that there was only me." A shrug. "Fifteen years. I don't go to villages. They throw stones. Once they threw a priest." Her legs swing. "He bounced."`;
            if (n === 3) return `"Words," Ya says, walking backwards in front of you so she can watch your mouth. "The herb girl has one for everything. Today she called me *improper*. What is it?"

"Not done the right way. Against the rules."

"Whose rules?"

"Nobody knows. That's how you can tell they're rules."

Ya thinks about this with her whole face. "So. Everything I do."

"Most of it."

"*Improper.*" She tries it twice more, pleased, like a new knife. "I'll keep that one." She turns to walk the right way round, and for a few steps she isn't loud at all. "Fifteen years I talked to the spear. It's a good spear. It never said one word back." She knocks her shoulder into your arm, hard. "You say too many. But you say them back."`;
            if (n === 4) return `Ya drops back to walk beside you, which she does when she wants something and hasn't worked out how to take it yet.

"I wake up in the night now," she says, accusing. "And I count. One scholar. One herb girl. ${byForm(g, 'One cat.', 'One cat, big.', 'One cat on two legs.')} Before, I counted one. Me. Easy." She jabs the butt of the spear at the ground as she walks. "Now if the count comes out wrong I have to get up and go and look."

"That's called worrying."

"It's stupid."

"It is. Everybody does it."

"All the time? In the villages?"

"Constantly."

Ya walks on for a bit, scowling at the idea. "No wonder they throw things," she says.`;
            return `Ya is in a good mood, and Ya's good moods are loud.

${likesYa(g) ? 'She walks near enough to knock her hip against yours every few steps, deliberately, and grins each time as if the joke were new. You catch her hand to make her stop. She turns it over, threads her fingers through yours and walks on, like someone whose plan has worked.' : 'She tells you a long tale about a bear, which may be true, and finishes it with a punch on your arm, which certainly is.'}

${likesMei(g) && likesYa(g) ? '"She looked at me today," she says, low. "The herb girl. When I was washing. A real look." A slow, wolfish smile. "She\'s coming round."' : ''}`;
        },
        choices: [
            { text: 'Flirt back. She started it.', do: (g) => { g.flags.ya_talks = (g.flags.ya_talks || 0) + 1; bumpRel(g, 'Ya', 2, 6); return [DR_YA_FLIRT(g)]; }, time: 40, to: hubFor },
            { text: 'Ask about her life. Listen.', do: (g) => { g.flags.ya_talks = (g.flags.ya_talks || 0) + 1; bumpRel(g, 'Ya', 4, 2); return []; }, time: 40, to: hubFor },
            { text: 'When she grabs your wrist and drags you off the path, go.', show: (g) => likesYa(g) && !g.flags.ya_romance && rel(g, 'Ya').a >= rel(g, 'Mei Lin').a + 8, do: (g) => { g.flags.yr_day = true; return []; }, time: 60, to: 'ya_romance' },
            { text: '"Ya. Knock it off."', do: (g) => { g.flags.ya_talks = (g.flags.ya_talks || 0) + 1; bumpRel(g, 'Ya', -2, -2); return [DR_YA_OFF(g)]; }, time: 10, to: hubFor },
        ],
    },

    /* =================================== camp and night =================================== */
    bl_camp: {
        dayKey: (g) => `bl_camp:${region(g)}`, // v0.11.154 (owner pick PS1, RP1 push 2; Fable's, "ok for texts" 23:05): by region, for the Drowned Wood's second camp (ST3)
        id: 'bl_camp', title: 'Camp', art: (g) => ({ rr: 'root_camp', dw: 'drowned_camp', ah: 'ashen_camp' }[region(g)]), place: (g) => PLACE[region(g)],
        enter: (g) => { toHour(g, 19); return []; },
        text: (g) => `${{
            rr: 'You camp on the root\'s broad back, with the fire set in a hollow of the bark and the forest standing round you, dark and very large. Through the bedroll, the root is warm.',
            dw: byDay(g, BL_DW_CAMP, 'bl_camp:dw'),
            ah: 'You camp under a black ridge, where the wind can\'t reach. Fire behaves oddly here: it burns low and blue, as though the ash recalled its old trade. A third of the stars are missing, in the shape of the dead tree.',
        }[region(g)]}

${pantry(g)}`,
        choices: [
            { text: 'Cook and eat.', show: (g) => foodCount(g) > 0 && daily('bl_cook')(g), time: 30, do: (g) => { markDaily(g, 'bl_cook'); const out = eatBest(g, { fire: true }); return /, cooked\./.test(out[0] || '') ? [...out, DR_COOK(g)] : out; } /* RV1 (L4): the party's word only after a cooked meal */, to: 'bl_camp' },
            { text: 'Sing a ring of bone stakes around the camp.', show: daily('bl_stakes'), qi: 3, check: { skill: 'Convergence Use', dc: 4 }, time: 15, do: (g) => { markDaily(g, 'bl_stakes'); g.flags.bl_stakes_night = true; return [DR_STAKES(g)]; }, failDo: (g) => { markDaily(g, 'bl_stakes'); g.flags.bl_stakes_night = false; return ['The stakes come up soft. Ya knocks one flat with her foot.']; }, to: 'bl_camp' },
            { text: 'Sit by the fire with the others.', show: daily('bl_fire'), time: 20, to: 'bl_fireside' },
            { text: 'Sleep.', to: 'bl_night' },
        ],
    },
    // v0.11.129 (CB1, BF; CS1, BF2; Fable's MAINs): the loose ring and the dw night's settling count four with the human
    bl_fireside: {
        dayKey: (g) => `bl_fireside:${region(g)}`, // v0.11.135 (NT1): by region (only the Drowned Wood has two nights)
        id: 'bl_fireside', title: 'Fireside', art: 'trio_fire', place: (g) => PLACE[region(g)],
        enter: (g) => { markDaily(g, 'bl_fire'); return []; },
        text: (g) => {
            const r = region(g);
            if (r === 'rr') return `Ya rips at a strip of meat with her teeth. Mei Lin eats with chopsticks, which she packed for the Blackroot deliberately, and with enormous dignity. Yuki eats everything. Ya mentions, chewing, that you gave the best piece away, which among wolves is how you tell who feeds the litter.

"A story, scholar," says Ya. "A true one. Your home, with the singing trees."

You tell one. The Hearth Trees, and the cities grown out of them, and the children who learn to sing to the wood before anyone teaches them to read. Ya listens hugging her shins, with her eyes as round as a child's. Mei Lin listens with hers shut.

Afterwards the fire has the talking to itself for a while. Then Ya says, "I'd like that. A tree that sang back." Mei Lin says, "So would I," and the two of them stare at each other over the flames, startled to have agreed on anything.`;
            if (r === 'dw') return byDay(g, [(g) => `The drowned are the one subject nobody will touch. Ya therefore covers every other subject there is, at volume, until Mei Lin laughs in spite of herself: a real laugh, of the sort Ashfall schooled out of her. Her hand flies to her mouth as though she had sworn in a temple.

"Do that again," says Ya.

"No."

"Please. Again. It sounded like a bird."

"*No*."

${likesMei(g) && likesYa(g) ? `Later, when you all settle, the ${byForm(g, 'three', 'three', 'four')} of you lie nearer together than the cold requires. For warmth, Ya says, and nobody disputes it.` : 'Later the fire burns down to red, the trees go on dripping, and sleep comes to nobody for long.'}`, (g) => `The second night in the Drowned Wood is quieter than the first, because Ya has run out of everything else to talk about. She lasts a good while in silence, for Ya. Then she leans over and flicks a beetle into Mei Lin's bowl.

Mei Lin picks it out with her chopsticks, gravely, and sets it on the trunk between them like an exhibit.

"That was food."

"That was an insult."

"It can be both," Ya says, and Mei Lin's mouth goes tight at the corners with the effort of not laughing, and Ya watches her not do it with the patience of something sitting by a burrow.

${likesMei(g) && likesYa(g) ? `Later, lying down, the ${byForm(g, 'three', 'three', 'four')} of you leave less room between the bedrolls than last night, and nobody remarks on the arithmetic.` : `Later the fire sinks, and the dripping goes on, and you all lie awake listening to each other not sleeping.`}`], 'bl_fireside:dw');
            return `A blue fire, and the dead tree over it. Not tonight, but soon now, you walk inside.

${both(g) ? 'Ya has put herself between you and Mei Lin with an arm hooked round each neck, and nobody shifts her. Mei Lin\'s head rests on Ya\'s shoulder. You doubt she knows she laid it there.' : onlyYa(g) ? 'Ya sits jammed against your side with a hand on your knee and no shame whatever. Across the fire Mei Lin makes a point of not seeing. She may not mind. She may mind very much.' : onlyMei(g) ? 'Mei Lin has sat near enough for her shoulder to rest on yours. From across the fire Ya beams at you both like a matchmaker collecting on a bet.' : `${byForm(g, 'The three', 'The three', 'The four')} of you sit in a loose ring, as people do who have come through things together and have no name yet for what it has made of them.`}

"Whatever is in there," says Mei Lin, "we go in together."

"Obviously," says Ya. "Who else would I go anywhere with?"`;
        },
        choices: [
            { text: 'Sit beside Mei Lin.', show: (g) => region(g) !== 'ah', do: (g) => { bumpRel(g, 'Mei Lin', 2, 3); return []; }, to: 'bl_night' },
            { text: 'Sit beside Ya.', show: (g) => region(g) !== 'ah', do: (g) => { bumpRel(g, 'Ya', 2, 3); return []; }, to: 'bl_night' },
            { text: 'Sit between them, and see what happens.', show: (g) => region(g) !== 'ah' && both(g), do: (g) => { bumpRel(g, 'Mei Lin', 1, 2); bumpRel(g, 'Ya', 1, 2); return [DR_BETWEEN(g)]; }, to: 'bl_night' },
            { text: 'When Ya takes your hand and tugs you toward the dark, go.', show: (g) => region(g) === 'ah' && (onlyYa(g) || both(g)) && !g.flags.ya_romance, to: 'ya_romance' }, // v0.11.122 (LG1, BC): also when both like him
            { text: 'Stay up with Mei Lin after the others sleep.', show: (g) => region(g) === 'ah' && onlyMei(g) && !g.flags.mei_bond, to: 'mei_bond' },
            { text: 'Take the first watch together, all of you.', show: (g) => region(g) === 'ah' && !both(g) && !g.flags.bl_friends, to: 'friends_watch' },
            { text: 'Sleep.', to: 'bl_night' },
            { text: 'When the fire burns low, follow Mei Lin to the far end of the raft.', show: (g) => region(g) === 'dw' && likesMei(g) && !g.flags.mei_raft, to: 'mei_raft' }, // v0.11.123 (EQ1, SC; Fable's D1): Mei Lin's Blackroot night, once a Coil; last, so saved choice positions keep their lines
        ],
    },
    ya_romance: {
        id: 'ya_romance', title: 'Wild', art: 'night_watch',
        enter: (g) => { g.flags.ya_romance = true; bumpRel(g, 'Ya', 5, 10); return []; },
        place: (g) => PLACE[region(g)],
        text: (g) => `${!g.flags.yr_day && both(g) ? `${CAMP_BOTH_MEI}\n\n` : ''}${g.flags.yr_day ? 'She hauls you off the path and round the nearest thing big enough to hide two people, and turns to face you, and waits for nothing.' : 'She walks you out beyond the firelight to a hollow in the ash that the wind has missed, and turns to face you, and waits for nothing.'}

Ya kisses as she hunts: no warning, teeth first, and a laugh into your mouth once you have caught up. Her hands are rough, quick and certain. Your coat comes off your shoulders in a single pull, as she would skin a hare, and what she finds underneath earns a pleased growl. "Scholar," she says into your throat, delighted. "You *lied*. You're not soft at all."

Her jacket follows, in time, after negotiations involving several buckles and one knife. The cold air raises gooseflesh on you both. She pulls you down onto the bedroll she has somehow brought along, and away to the north the dead tree goes on waiting, as it has for centuries, and is not consulted.

"No villages here," she breathes. "No rules. Just this."

*

Much later Ya is dozing with her face in your neck and one bare leg slung across you, snoring a little, like a wolf-pup. From somewhere close by, Yuki passes one aggrieved thought down the bond: *I am going to need to be compensated for this.*`,
        choices: [
            { text: 'Sleep, eventually.', show: (g) => !g.flags.yr_day, to: 'bl_night' },
            { text: 'Find your clothes. Catch up with the others.', show: (g) => !!g.flags.yr_day, do: (g) => { g.flags.yr_day = false; return ['Mei Lin gives your hair a single look, learns everything from it, and walks on in silence.']; }, to: hubFor },
        ],
    },
    mei_bond: {
        id: 'mei_bond', title: 'Embers', art: 'night_watch', place: PLACE.ah,
        enter: (g) => { g.flags.mei_bond = true; bumpRel(g, 'Mei Lin', 5, 8); return []; },
        text: (g) => `${g.flags.mb_day ? 'You let Ya and Yuki draw ahead. Mei Lin stops with you where the way bends out of their sight, and for a time neither of you says a word.' : 'Once Ya is asleep, curled by the fire like a dog with the spear in her arms, Mei Lin sits up with you over the embers.'}

"I keep thinking," she says, "that when we go back I shall have to be the old me again. Bow when it's time. Laugh when it's time. Never say one true thing." Her knife turns over and over in her fingers. "I don't think I can. I don't think I want to."

"Then don't."

"Easy for you. You're from the sky." All the same she leans against you, and presently her face tilts up, and you kiss her: slowly, carefully, ${!g.flags.romance ? 'a first kiss, with nothing clever ready for afterwards,' : g.flags.mei_first === 'raft' ? 'the way she did at the far end of the raft, only with no swamp to shock this time,' : 'with none of the herb loft\'s hurry,'} as though the two of you had all the time there is, and not a few days and a dead tree.

"Whatever is in there," she says, an inch from your mouth, "I'm not letting you go in first."

"Noted."

"I mean it. I'll knock you down. I've watched Ya do it. It looks easy."`,
        choices: [
            { text: 'Sleep with her head on your chest.', show: (g) => !g.flags.mb_day, to: 'bl_night' },
            { text: 'Catch up with the others, eventually.', show: (g) => !!g.flags.mb_day, do: (g) => { g.flags.mb_day = false; return []; }, to: hubFor },
        ],
    },
    mei_raft: { // v0.11.123 (owner picks EQ1, SC; EB1; text by Fable, D1 MAIN): Mei Lin's own Blackroot night, the counterpart of Ya's spring
        id: 'mei_raft', title: 'The Far End', art: 'night_watch', place: PLACE.dw,
        enter: (g) => { g.flags.mei_raft = true; if (!g.flags.romance) g.flags.mei_first = 'raft'; g.flags.romance = true; bumpRel(g, 'Mei Lin', 5, 10); return []; }, // ER1 (TX, R1): mei_first when the raft is her first night
        text: (g) => `${likesYa(g) ? `${MEI_RAFT_YA}\n\n` : ''}The far end of the raft is one great trunk fallen across the rest, its root-plate standing up out of the water like a wall. Behind it there is room for a bedroll and nothing to see you but the dark. Mei Lin has, you notice, already put a bedroll there. She notices you noticing.

"I gather herbs," she says. "I plan ahead. Don't look pleased."

"This is my ordinary face."

"It's a pleased face." She hangs her jacket on a broken branch, squarely, the way she'd hang it on a peg at home, and then stands looking at it. "In Ashfall there are four walls and a mother. Here there's a stump and a swamp, and I am *still* listening for the stairs."

Far out, something breaks the surface and goes under. She jumps, and says a word you didn't know she had, and then the laugh gets out: the real one, the bird one, much too loud for a drowned wood. Both hands go over her mouth. Then, slowly, she takes them down again.

"No," she says. "Let it hear."

She kisses you frankly and without hurry, a woman who has made up her mind and intends to enjoy having done it, and her cold fingers find their way under the ridiculous coat and stay there. The raft shifts. The trunks drip. She pulls the blanket up over the branch and across the gap, and that is a door.

What happens behind it is nobody's business. Least of all the swamp's.

*

Much later she lies along you with her hair loose over your arm, listening to the dark. "If you tell anyone I planned this," she says, "I'll deny it, and I'll be believed. I have a very respectable face."

"You do."

"Stop agreeing with me. It's unsettling." She is asleep before you are. From the fire, through the bond: *The raft moves when you do. All of it. I want that on the record.*`,
        choices: [{ text: 'Sleep. Let the swamp do the dripping.', to: 'bl_night' }],
    },
    friends_watch: {
        id: 'friends_watch', title: 'Watch', art: 'night_watch', place: PLACE.ah,
        enter: (g) => { g.flags.bl_friends = true; bumpRel(g, 'Mei Lin', 4, 0); bumpRel(g, 'Ya', 4, 0); return []; },
        text: (g) => `Sleep is beyond all of you, so nobody attempts it. You sit up on the ridge instead, ${byForm(g, "the three of you and the cat,", "the three of you and one very large cat,", "all four of you,")} and keep the watch in a body, which is useless as tactics and exactly right.

Ya teaches Mei Lin a filthy song in a language no one else alive speaks. Mei Lin teaches Ya the correct bow to an elder, and then the correct bow to an enemy, which is the same bow with the eyes kept up. Ya has never heard anything funnier, and spends an hour practising it on a rock. Yuki remarks, to nobody, that you kept the last of the meat warm for whoever came off watch, as you always do; you say it was in the way.

You tell them about the stars, and which of them yours might lie near. Ya says hers is the one that looks like a wolf. Mei Lin says Ashfall has no star of its own, and then, after a while, quietly: "Maybe it should."`,
        choices: [{ text: 'Sleep, at last.', to: 'bl_night' }],
    },
    bl_night: {
        dayKey: (g) => `bl_night:${region(g)}`, // v0.11.135 (NT1): by region
        id: 'bl_night', title: 'Night', art: 'night_watch', place: (g) => PLACE[region(g)],
        text: (g) => `${region(g) === 'dw' ? byDay(g, BL_DW_OPEN, 'bl_night:dw') : region(g) === 'ah' ? 'Wind over the ridges, and above you the dead tree, breathing. You would swear to the breathing.' : 'Under you the root is warm. A long way off, wolves.'}

${region(g) === 'dw' ? byDay(g, [BL_WATCH_DW1, `Watches again. Ya says she will take all of them, and yawns in the middle of saying it; Mei Lin says she would sooner be awake than dream in this place, and means it. Your Parallel Cognition puts its watch-thread forward, as it does every night, like a clerk with a form.`], 'bl_night:dw') : region(g) === 'ah' ? BL_WATCH_AH : BL_WATCHES}`,
        choices: [
            { text: 'Ya takes first watch. You take second.', do: (g) => { g.flags.bl_watch = 'ya'; return []; }, to: 'bl_night_event' },
            { text: 'Mei Lin and Ya together; you and a watch-thread after.', do: (g) => { g.flags.bl_watch = 'both'; bumpRel(g, 'Mei Lin', 0, 1); bumpRel(g, 'Ya', 0, 1); return []; }, to: 'bl_night_event' },
            { text: 'Leave the thread on watch and let everyone sleep.', do: (g) => { g.flags.bl_watch = 'thread'; return []; }, to: 'bl_night_event' },
        ],
    },
    bl_night_event: {
        dayKey: (g) => `bl_night_event:${g.flags.bl_ev}`, // v0.11.135 (NT1, EV1): the days this Coil each event showed (byDay)
        id: 'bl_night_event', title: (g) => ({ wolves: 'Wolves', drowned: 'The Drowned', serpent: 'Serpent', hawks: 'Sparks in the Dark', lights: 'Lights', song: 'Ya Sings', rut: 'The Rut', warm: 'Cold', rain: 'Rain on Water', mei: 'Awake', stars: 'Stars' }[g.flags.bl_ev] || 'Night'),
        art: (g) => ({ wolves: 'wolves', drowned: 'drowned_dead', serpent: 'mire_serpent', hawks: 'cinder_hawks' }[g.flags.bl_ev] || 'night_watch'),
        place: (g) => PLACE[region(g)],
        enter: (g) => {
            const pool = NIGHTS[region(g)];
            let pick = pool[d6(g) - 1];
            if (pick === g.flags.bl_last_ev) pick = pool[d6(g) - 1];
            g.flags.bl_ev = pick;
            g.flags.bl_last_ev = pick;
            return nightTo(g, 60); // v0.11.40 (N1): never back; v0.11.91: after the bed (from 21:00; it was 19:00 here), at 01:00; v0.11.151 (WD1, LN): the slept line
        },
        text: (g) => ({
            wolves: `${g.flags.bl_watch === 'thread' ? 'Your watch-thread hauls you up out of sleep.' : 'Ya\'s hand over your mouth, and her breath in your ear: "Wolves."'} A pair of ash-wolves, grey against grey, where the firelight gives out. They have seen Yuki. Yuki has seen them.`,
            drowned: byDay(g, [`Mei Lin wakes you and says nothing. She only points. Out where the trunks end, waist-deep in the black water, stand two of the drowned, perfectly still, their faces to the fire. Watching. Waiting.`, `Ya wakes you this time, with two fingers on your wrist and no joke ready, which tells you what it is before you look. The drowned are back. Two of them, waist-deep in the black water at the edge of the trunks, standing as they stood before, facing the fire. The firelight does not get into their eyes. Mei Lin is already on her feet, knife out, her other hand pressed over her own mouth.`], `bl_night_event:drowned`),
            serpent: byDay(g, [`Something heavy is hauling itself up onto the trunks. The firelight finds a long wet body and a head like a split log, sliding in toward the warmth.`, `A slow scrape along the underside of the trunks, from one end of the camp to the other, as of something taking a measurement. Then the weight comes up over the edge: the wet length of it, the head like a split log, swinging from side to side. Whether it is the one from before you cannot tell. It holds the same opinion about your fire.`], `bl_night_event:serpent`),
            hawks: `Sparks drop through the dark, and after the sparks, screaming. Cinder hawks hunt at night as well, you learn, and they have taken the fire for a challenge.`,
            lights: byDay(g, [`${g.flags.saw_lights ? 'The lights again: the ones you watched from the stream on your earliest nights in this world.' : 'Lights, low to the ground.'} Pale, slow and deliberate, they flow past the camp toward the dead tree like a procession. Ya is awake and utterly still, with Mei Lin's wrist in her hand. Neither speaks. This close you can hear them: the thinnest of sounds, almost below hearing. They are singing. They are singing the middle of the song, the part the roots have lost.`, `${g.flags.saw_lights ? 'The lights come again. You have stopped counting the nights you have seen them, which is not like you.' : 'The lights come again.'} Fewer tonight, or strung out further, each keeping its distance from the next like mourners who have been told where to stand. This time Mei Lin is awake before anyone. She has her hands folded and her head down, and it takes you a moment to see that she is paying her respects, properly, the way Ashfall does when a procession passes. Ya copies her, badly, with one eye open. The song is still there, at the edge of hearing: the same missing middle, going by toward the dead tree. Your Convergence leans after it.`, `${g.flags.saw_lights ? 'The lights. You could keep time by them now, and one of your threads has started to.' : 'The lights.'} They pass closer than before, so close that the nearest lays a pale wash over Ya's face. She doesn't blink. Mei Lin has hold of Ya's sleeve tonight, and neither of them seems to know which one is holding on. You listen harder than you did. One line of song, over and over, going by like a hand along a wall in the dark, feeling for the door. All of it flows toward the dead tree.`], `bl_night_event:lights`),
            song: `Ya is singing on watch, and it wakes you. There are no words in it: one long, low, wavering call into the dark, half human and half wolf. Far off, something answers. Then something else does. Then the forest goes quiet again, like a thing that has been reassured.

Mei Lin is awake as well, lying very still to listen. When it ends she says, very softly, "That was beautiful." Ya, on watch, lets on nothing, and grins at the dark.`,
            rut: `Somewhere off the road two bone-elk spend the whole night fighting over something. Bone cracks on bone, over and over, like a woodcutter with a grudge against trees. Sleep is thin for everyone. Ya supplies a running account of who is ahead.`,
            warm: byDay(g, [`The cold arrives in earnest tonight. Ya asks nobody and warns nobody: she crawls into your bedroll, winds herself round you like a vine and is asleep again at once. Her feet are ice.

${likesMei(g) ? 'On the other side of the fire, Mei Lin opens one eye, takes it in, and shuts the eye again. Some time later, very quietly, she drags her bedroll across and lies down on the side Ya has left free, her back to you, rigid as a plank. "I\'m *cold*," she informs nobody.' : 'Yuki, displaced, takes over the warm place Ya left by the fire and glares at you from it as if you had arranged this.'}`, `Cold again, the kind that comes up through the bedroll. You hear Ya get up, walk round the fire and stand over you. This time she announces it. "I'm coming in," she says, as if reporting a change in the weather, and does, all elbows, and puts her frozen feet on your shins with a sigh of real contentment. She is asleep before you have finished objecting.

${likesMei(g) ? `Mei Lin does not pretend to be asleep tonight. She gets up, brings her bedroll over with great formality, and lies down at your other side with exactly a hand's width of cold air between you. "It is only sensible," she tells the dark. The hand's width does not last till morning.` : `Yuki, put out of her place a second time, sits down on the far side of the fire and looks at the pair of you until you can feel it through your eyelids.`}`], `bl_night_event:warm`),
            rain: byDay(g, [`Rain on the black water, all night: tiny rings by the million, and the mist rising and settling over them. Under the noise you sometimes think there are voices. You rule, as a scientist, that it is the rain.`, `Rain again on the black water, fine and steady, and the mist comes down to meet it until there is no telling where one leaves off. The fire shrinks to a red eye. Somewhere under the hiss there is a sound like people talking in the next room: low, unhurried, about nothing urgent. You listen for a while, as a scientist. Then you pull your coat up over your ears, also as a scientist.`], `bl_night_event:rain`),
            mei: byDay(g, [`The small hours, and you are awake. Mei Lin is on watch, knees pulled up, eyes on the dark, crying without a sound.

"It's nothing," she says, once she finds you awake. "It's this place. It's the drowned. They were people like Ashfall's. Like my *mother*." She scrubs at her face, angry with it. "Go back to sleep."`, `Mei Lin is awake again in the small hours, sitting up with her knees under her chin. She isn't crying tonight. She is counting something on her fingers, lips moving, and when she sees you watching she stops, caught.

"The names," she says. "Everybody in Ashfall. Forty houses. I say them over, so that if I see a face out there in the dark I'll know it isn't one of ours." She folds the hand shut. "It isn't sensible. Don't tell me it isn't sensible. Go back to sleep, James."`], `bl_night_event:mei`),
            stars: `For one hour the haze lifts, and the stars come out over the Ashen Hills, bright enough to throw shadows. Ya wakes everybody up to look. Not one of you complains.`,
        }[g.flags.bl_ev]),
        choices: [
            { text: 'Fight.', show: (g) => FIGHTS.includes(g.flags.bl_ev), combat: (g) => nightFight(g.flags.bl_ev)(g), to: 'bl_night_won' },
            { text: 'Follow the lights a little way.', show: nev('lights'), check: { skill: 'GU', dc: 4 }, time: 60, do: (g) => { g.flags.bl_followed_lights = true; return [DR_LIGHTS(g)]; }, failDo: () => ['They draw away from you and are gone. Ya fetches you back before the dark takes an interest.'], to: 'bl_morning' },
            { text: 'Watch them pass. Don\'t move.', show: nev('lights'), to: 'bl_morning' },
            { text: 'Sit up with her until she falls asleep.', show: nev('mei'), do: (g) => { bumpRel(g, 'Mei Lin', 3, 3); return []; }, to: 'bl_morning' },
            { text: 'Go back to sleep.', show: (g) => !FIGHTS.includes(g.flags.bl_ev) && g.flags.bl_ev !== 'lights' && g.flags.bl_ev !== 'mei', do: (g) => { if (g.flags.bl_ev === 'warm') bumpRel(g, 'Ya', 1, 3); if (g.flags.bl_ev === 'song') bumpRel(g, 'Ya', 1, 2); return []; }, to: 'bl_morning' },
        ],
    },
    bl_night_won: {
        id: 'bl_night_won', title: 'Quiet Again', art: 'night_watch', place: (g) => PLACE[region(g)],
        enter: (g) => { if (g.flags.bl_ev === 'wolves') addItem(g, 'venison', 2); if (g.flags.bl_ev === 'hawks') addItem(g, 'fowl_raw', 1); return g.flags.bl_ev === 'wolves' ? ['+2 wolf meat (as venison).'] : g.flags.bl_ev === 'hawks' ? ['+1 cinder hawk (as fowl).'] : []; },
        text: (g) => byDay(g, [(g) => `${g.flags.bl_ev === 'drowned' ? 'When you have finished with them the drowned go back under the black water, slowly, with what looks like gratitude. Until morning Mei Lin sits hugging her knees, and Ya sits with her and makes no joke of any kind.' : 'It is quick, and it is messy. Ya cleans her spear and calls it good practice. Mei Lin cleans your cuts and has nothing to say about practice.'}`,
            (g) => (g.flags.bl_ev === 'drowned'
                ? `They go down quietly, in the end. The black water closes over them without a ripple, and you stand there still braced for the next one, feeling like a man who has shouted at a funeral. Mei Lin says a few words over the water: formal ones, the kind Ashfall keeps for its own. Ya waits until she has finished before she spits in it.`
                : `It's over before the fire has properly caught again. Ya goes to look at what is left of the other side and comes back satisfied. Mei Lin goes over you with a wet cloth and a face like a magistrate, and sees to your cuts as if you had got them on purpose.`),
            (g) => (g.flags.bl_ev === 'drowned'
                ? `When it's done the drowned sink where they stood, and the rings spread out and are gone. Nobody lies down again. Ya sharpens her spear, which does not need it. Mei Lin feeds the fire one stick at a time and watches the water over the top of it, and when Ya shifts over to sit closer, she lets her.`
                : `Short, loud and untidy. Ya walks the edge of the camp afterwards, prodding the dark with the butt of her spear to be sure it has finished, and pronounces the night improved. Mei Lin looks at the state of your coat and says that a scholar ought to own a second one.`),
            (g) => (g.flags.bl_ev === 'drowned'
                ? `They go under again, one after another, with no more fuss than people leaving a room. Ya wipes her spear on the bark and says, to nobody, that they fight as if they were sorry about it. Mei Lin tells her to be quiet. Then, a while later, in a small voice, that she's right.`
                : `Done. You stand there breathing, and your threads go on tracking the fight for a moment after there is no fight left to track. Ya is asleep again already, or says she is. Mei Lin takes your hand, turns it over, finds the cut you hadn't noticed and deals with it without a word, which from her is a lecture.`),
        ], 'bl_night_won'),
        choices: [{ text: 'Sleep, what\'s left of it.', to: 'bl_morning' }],
    },
    bl_night_lost: {
        id: 'bl_night_lost', title: 'Bad Night', art: 'night_watch', place: (g) => PLACE[region(g)],
        enter: (g) => patchUp(g),
        text: (g) => `It goes badly. What drives it off in the end is Ya's spear, Mei Lin's knife and a quantity of shouting, and the remainder of your night goes on being stitched and told off, in two voices.${byForm(g, '', " Yuki, who had hold of it until it had hold of her ear, lies across your feet with the ear at half-mast. *Three voices,* says the bond. *I am also telling you off. I am just doing it quietly.*", " Yuki, who had hold of it until it had hold of her sleeve, sits on your feet. \"Three voices,\" she says. \"I am also telling you off. I am doing it quietly.\"")}`, // v0.11.130 (YB1, LL; Fable's MAIN): the great root-kin's line; RB2 (NK): Fable's redraft after the review
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
            lines.push(out.length ? `Breakfast. ${out[0]}` : 'No breakfast. Ya holds out a grub on the flat of her knife. You decline. For now.');
            return lines;
        },
        text: (g) => ({
            2: 'Morning on the Root Road. Ya is up already, crouched on the root with her nose to the wind. "Wyrm country today," she says. "Eat. If it swallows you, be heavy. Takes it longer."',
            3: 'A grey morning on grey water, with mist so thick that the other end of your own raft has gone. Mei Lin is braiding her hair with her jaw set: frightened, and declining to be.',
            4: 'At first light you leave the Drowned Wood, wading up out of the last of the water toward the hills. Behind you the mist settles over the trunks like a lid going on.',
            5: 'The last morning before the tree. It has the whole sky now; even the sunrise has to go round it. Nobody has much to say. Ya sits whetting her spear until the sound is part of the morning.',
        }[bday(g)] || 'Another morning, grey and cold. The dead tree waits. It has had centuries of practice.'),
        choices: [
            { text: 'Get moving.', show: (g) => bday(g) === 2, to: 'rr_hub' },
            { text: 'Get moving.', show: (g) => bday(g) === 3, to: 'dw_hub' },
            { text: 'Climb out of the water into the hills.', show: (g) => bday(g) === 4, to: 'ah_enter' },
            { text: 'Get moving.', show: (g) => bday(g) >= 5, to: 'ah_hub' },
        ],
    },

    /* =================================== the last night =================================== */
    // v0.11.129 (CB1, HV; Fable's MAIN): the human makes four; CS1 (TM, HG; Fable's MAINs): her "Tomorrow" aloud, the great root-kin round the bedroll
    heart_view: {
        id: 'heart_view', title: 'Under the Tree', art: 'heart_gate', place: `${P} — the roots of the dead tree`,
        enter: (g) => { toHour(g, 19); g.flags.bl_region = 'ah'; return []; },
        text: (g) => `You camp in the roots of the dead tree.

No other word will do. They stand up out of the ground here like city walls, grey-white and smooth and forty metres high, and between them run corridors, chambers, hollows large enough to put Ashfall in. Above, the bark of the trunk is a cliff that climbs into cloud. Higher yet is the black wound in its side.

At the foot of the trunk, half buried in grey wood, there is a gap. Almost a doorway. Out of it, faint as breathing, comes the part of the song the roots have been missing.

Your Convergence is singing back. You can't stop it, and you are not certain you would.

${both(g) && trio(g) >= 3 ? 'Mei Lin and Ya lie down one on each side of you, with no discussion. In the dark Mei Lin, who has still not said yes to anything, reaches across your chest until she finds Ya\'s hand, and keeps it.' : g.flags.ya_romance ? `Ya lies down against you as though she always had. Mei Lin lies down ${byForm(g, 'on Yuki\'s other side', 'against Yuki\'s great white flank', 'on Yuki\'s other side')}, close by, and wishes you both goodnight, and means it.` : g.flags.mei_bond || g.flags.romance ? 'Mei Lin lies down against you with her head on your shoulder. Ya stretches out across the foot of the bedroll like a guard dog, spear in her arms, and grins at you both through the dark.' : byForm(g, 'The three of you lie down close together, for warmth and for courage. Yuki takes the exact centre.', 'The three of you lie down close together, for warmth and for courage. Yuki lies down round all of you, and counts that as the exact centre.', 'The four of you lie down close together, for warmth and for courage. Yuki takes the exact centre.')}

"Tomorrow," Ya says, to the dark.

"Tomorrow," says Mei Lin.

${byForm(g, '*Tomorrow,*', '*Tomorrow,*', '"Tomorrow,"')} says Yuki, and there is no sarcasm in it anywhere.`,
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
        text: (g) => `Morning comes into the roots grey and quiet.

The doorway in the trunk is wider than it was last night. Not by much. But the moss round it has been pushed back, as if something inside had leaned against it in the dark: as a person leans on a door they are waiting to open.

Ya has her spear. Mei Lin has her knife, her basket, and her chin up. ${byForm(g, 'Yuki is on your shoulder, claws in.', 'Yuki is at your side, claws out.', 'Yuki is at your shoulder, claws out.')}

You have a fresh doctorate, a lab coat that is mostly holes, and a gift this world has never seen. And somewhere ahead of you, long dead, is a piece of home.

"Well," you say. "Let's see who's in."`,
        choices: [{ text: 'Into the Heart.', do: (g) => { if (clockParts(g.minutes).day < 16) g.minutes = 15 * 1440 + 6 * 60; return []; }, to: 'ht_start' }],
    },
};
