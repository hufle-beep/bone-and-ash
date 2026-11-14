/**
 * Yuki's path (v0.8.4). The first time Yuki takes human form (the one-button Long Forest, or Nascent Soul in a normal
 * run), she asks: family or more. g.flags.yk_path = 'sister' | 'lover'.
 *   Sister: very sassy, very protective, pushes James toward Mei Lin and Ya (affection), grades his flirting.
 *   Lover: hers, and open to sharing with other women. With Ya she wears down Mei Lin's resistance (g.flags.yk_mei).
 * Romance with Yuki only ever happens in her human form: an adult woman, at James's side since they were born on the same
 * day in the same grove (owner 2026-11-05; v0.11.40) — forty years. Frank up to the door, then fade to black (Claude's limit).
 *
 * The last night of Act 1 (rt_evening) offers every arrangement the hearts allow:
 *   alone: Mei Lin · Ya · Yuki      pairs: Mei Lin + Ya (rt_trio) · Yuki + Mei Lin · Yuki + Ya      all four.
 * g.flags.final_night records it; loveLine() writes the Act 1 epilogue line for each.
 */
import { bumpRel, sleepUntil, yukiForms, yukiForm } from '../core/game.js';
import { daily, markDaily, byForm } from './common.js';
import { likesMei, likesYa, trio, rel, KISS_YA, logTrio, ykShape, LIKES_BAR } from './act1_common.js'; // v0.11.137 (TR1, YR): LIKES_BAR

export const ykPath = (g) => g.flags.yk_path || null;
export const ykLover = (g) => ykPath(g) === 'lover';
export const ykSister = (g) => ykPath(g) === 'sister';
/** v0.11.122 (owner pick LG1, YG; the owner's bug report 2026-11-08 23:22): her path is kept across Coils, her realm is not, so a scene
 *  that has her human needs her human form this Coil (Nascent Soul, `yukiForms`) as well as the path. */
export const ykHuman = (g) => yukiForms(g).includes('human');
/** v0.11.122 (LG1, YV; texts by Fable, A1–A5): her lines when the path is chosen but she is a cat or the great root-kin this Coil. */
const SIS_TALK_BOND = [
    `Yuki corners you by the water. For a cat this means sitting down in the middle of the path and looking at you until you stop pretending there's a way round. She only does it for things she considers important. Today, that's your love life.

*Mei Lin,* says the bond, *brought chopsticks into the Blackroot. For you. She doesn't say it's for you. She's been eating with them very slowly next to you since the road began.* Her tail hits the ground, once. *And Ya bit off a wolf's tooth and gave it to you. Do you know what that means where she's from?*

"I'm choosing not to ask."

*It means you're an idiot. Universally. Go and sit next to one of them. Either. Both. I don't care. Your face is depressing me.*`,
    `*Grade,* says the bond. Yuki is sitting on a root with her ears very upright. *Your conversation with Mei Lin at the fire. I'd give it a four. Out of ten. You made a joke about spore prints. She laughed, which is the only reason it's not a two.*

"I thought it went well."

*It went well because she likes you. Not because of the spore prints. Never again the spore prints.* She considers, tail tip moving. *Ya you're doing better with. Ya likes being insulted. You're good at that. Keep insulting Ya.*`,
    `Yuki doesn't say anything this time, not even through the bond. She just sits down against you at the edge of the camp and leans, with everything she has, until you lean back.

*You're happier,* says the bond eventually. *Than at home. Than in the lab. Since them.* A small, dry pause. *Don't ruin it. I'm watching.*`,
    // v0.11.152 (owner pick RP1, RM5; Fable's): the 4th night (up to four Blackroot nights), by her shape
    (g) => `*Progress report,* says the bond. Yuki has sat down across from you and is drawing in the dirt with ${byForm(g, 'one claw, very neatly', 'one claw, the length of your finger, with surprising neatness', 'one claw, very neatly')}: a row of scratches for Mei Lin, a row for Ya. *I've stopped grading. You were dragging down the average of the whole expedition.*

"And now?"

*Now I count.* The claw rests on one row. *Mei Lin laughed four times today where people could hear her. Before you, I'm told, the figure was none.* The other row. *Ya sat still through an entire meal. Nobody has a previous figure for that.* She looks at the scratches a moment longer than the joke needs, then ${byForm(g, 'rubs them out with a paw and sits on the place', 'wipes them out with one sweep of a paw, along with some moss and most of your bootlace', 'rubs them out with a paw and sits on the place')}. *I don't know what you're doing. Don't tell me, you'll only explain it. Go and do more of it.*`,
];
const SIS_TALK_BOND_GREAT = `Yuki corners you by the water. In her great shape this takes no effort at all: she lies down across the path, and the path is over. She only does it for things she considers important. Today, that's your love life.

*Mei Lin,* says the bond, *brought chopsticks into the Blackroot. For you. She doesn't say it's for you. She's been eating with them very slowly next to you since the road began.* A paw the size of a plate comes down on your boot and stays there. *And Ya bit off a wolf's tooth and gave it to you. Do you know what that means where she's from?*

"I'm choosing not to ask."

*It means you're an idiot. Universally. Go and sit next to one of them. Either. Both. I don't care. Your face is depressing me.*`; // RL1 (NT): Fable's ALT B
/** Mei Lin will share a bed with more than James: Ya wore her down (trio ≥ 3) or Yuki did (yk_mei ≥ 2). */
export const meiOpen = (g) => trio(g) >= 3 || (g.flags.yk_mei || 0) >= 2;
const back = (g) => g.flags.yk_back || g.flags.yuki_return || 'stream';
/** v0.11.137 (owner pick TR1, YR; texts by Fable): her question's "more" needs affection 72 (LIKES_BAR, the bar Mei Lin and Ya need);
 *  below it "Not yet" leaves the path open (`yk_wait`, kept across Coils) and her daily scene in human form reopens it at the bar. */
export const YK_QUESTION = {
    notYet: "\"Not yet. Ask me again when I can answer you properly.\"",
    notYetResult: "Yuki's ears tip forward, then settle. \"Not yet,\" she says, trying the words for weight. \"I waited forty years for you to finish a thesis. I can wait for a sentence.\" She shrugs, one shoulder, unhurt. \"Take your time. I'll remember where we stopped. It isn't as if either of us is allowed to forget.\"",
    answer: "Answer the question Yuki asked you.",
    again: "Yuki sits down facing you, close, and folds her hands in her lap, which she does only when she has decided something.\n\n\"You said not yet,\" she says. \"I've been patient. I'd like that acknowledged, because it isn't in my nature and I did it very well.\"\n\n\"You did it very well.\"\n\n\"Thank you.\" Her ears are forward. Her tail, which never learned to lie, is not still. \"I felt the bond change before you did. I generally do. So I'm asking a second time, aloud, the same as the first, because I want to hear the answer with ears.\"\n\nGold eyes, level.\n\n\"What am I to you, James? Family, the sister who takes your blanket and frightens your women? Or more?\" The corner of her mouth moves. \"Either is still fine. I'm still not going anywhere. But I'd like to stop holding the page.\"",
};
/** v0.11.137 (owner pick QA2; texts by Fable, "texts are ok" 10:00): her question and its answers away from the Long Forest's last fire:
 *  the first question when she first turns human elsewhere (a breakthrough), and the reopened one (`yk_choice_again`), lead to
 *  `yk_sister_here` / `yk_lover_here`; inside the Long Forest (`lf_active`) the fire scenes stay. Her shape doesn't change after either. */
export const YK_HERE = {
    first: "She is in the tall shape when she comes to stand in front of you, and she looks at you, and the look goes on past the point where a cat would have got bored and washed something.\n\n\"While I have a mouth,\" Yuki says, \"there's a thing I want to use it for.\"\n\n\"Should I be worried?\"\n\n\"As a rule.\" She sits down facing you and folds her legs under her, tail laid neatly over her feet, exactly as she has sat in front of you ten thousand times, a good deal lower down. \"We were born the same morning, in the same grove. You were the size of a loaf and I'd have fitted in your fist, and the bond took before either of us had our eyes open. I've slept on you for forty years. I know your face when you lie, and when you're frightened, and when you're telling a room of people a lecture is going well.\" Gold eyes, level. \"I'm not a kitten any more, James. I haven't been since before you could shave. And now there's this.\" She holds up a hand and turns it over, front and back. \"So I'm asking. Once, and aloud, because through the bond it has always been easy for both of us to leave it unsaid.\"\n\nShe takes a breath. It is the first time you have seen her need one.\n\n\"What am I to you? Family, the annoying sister who steals your blanket and tells your girlfriends embarrassing stories? Or more?\" Her head tips, small and dry. \"Either is fine. I mean it. I go nowhere in either case. And if it's more,\" and the corner of her mouth lifts, \"I don't need to be the only one. I'm a cat. I share a sunbeam with whoever's in it, provided I get the best spot.\"",
    more: "\"More.\" Hold out your hand to her.",
    sister: "Yuki holds your eye for one long second. Then she nods, once, as a cat closes a subject, and her shoulders come down by the width of a finger.\n\n\"Good,\" she says. \"Sister. The blanket is mine.\"\n\n\"The blanket was always yours.\"\n\n\"It was held. Now it's owned.\" She gets up, comes round to your side, sits down against you shoulder to shoulder, and knocks her head on yours, the old greeting, delivered from a new height. \"Terms. First: I shall be dreadful about every woman you look at, and you'll thank me. Second: whoever hurts you, I eat. I'm not being colourful. Third.\" A finger goes up; she looks at it with approval, having not had one before. \"You are forty, alone, and beyond help. The next pretty woman who meets the lab coat and stays, you will speak to her. In sentences. I'll be watching, and I'll mark you.\"\n\n\"That last one isn't a term. It's a warning.\"\n\n\"I'm your sister,\" says Yuki, deeply content. \"I can issue either, and I don't have to say which it was.\"",
    sisterLabel: "Get on with the day, supervised.",
    sisterResult: "Yuki: your sister. She stays as she is, and takes the better half of wherever you sit next.",
    lover: "Her hand is warm. You can't think why that should surprise you. Forty years she has slept on your chest, and not once did it occur to you that she'd have hands.\n\n\"Oh,\" says Yuki, very quietly. Nothing dry comes after it, which has not happened before in your hearing or the bond's.\n\nShe closes the distance slowly, leaving you every chance to turn it into a joke. You don't. She stops when her hair falls across your wrist. Her ears go flat, then forward. Her tail winds once round your ankle and stays, a question that has already heard the answer.\n\n\"I'm going to kiss you,\" she says. \"I've considered the approach. There is a file.\"\n\n\"Naturally there's a file.\"\n\nThe file is thorough. She kisses as she does everything, without hurry, sure of her ground and on her own terms, and somewhere in it she makes a low sound you have felt through the bond all your life and never heard with your ears.\n\nShe draws back about an inch, no further. Her eyes are very gold.\n\n\"That was page one,\" Yuki says. \"The rest wants a door, and nobody on the other side of it. Later.\" She has not let go of your hand. \"I've waited forty years. I can manage a few hours more. Barely.\"",
    loverLabel: "Keep hold of her hand. Later, then.",
    loverResult: "Yuki: your lover. She stays as she is and says nothing to anyone, because nobody needs to know yet and she likes being underestimated.",
};
export const ykAtFire = (g) => !!g.flags.lf_active;
/** The question's text at the Long Forest's last fire (as before, word for word). */
const YK_FIRE_TEXT = `The last night before you walk out of the Long Forest, Yuki sits across the fire from you in her human shape, knees drawn up, white hair pooled on the moss, and watches you for a long time without saying anything. That's normal. The bit where she does it with a face is new.

"I've been thinking," she says.

"Should I be worried?"

"Always." She pokes the fire with a stick, which she does not need to do and does because she has hands now and enjoys them. "We were born the same morning, in the same grove. You were the size of a loaf of bread and I was the size of your fist, and the bond took before either of us could see. I've slept on you for forty years. I know what you look like when you lie, and when you're scared, and when you're pretending a lecture is going well." Gold eyes, level. "I'm not a kitten any more, James. I haven't been for a very long time. And now I have *this*." She lifts one hand, turns it in the firelight. "So I'm asking. Once. Out loud, because the bond makes it too easy to not say things."

She takes a breath.

"What am I to you? Family — the annoying sister who steals your blanket and tells your girlfriends embarrassing stories? Or more?" A small, dry tilt of her head. "Either is fine. I mean that. I'm not going anywhere either way. And if it's more —" the corner of her mouth goes up — "I don't need to be the only one. I'm a cat. I share a sunbeam with whoever's in it, as long as I get the best spot."`;
export const ykLoverOpen = (g) => rel(g, 'Yuki').a >= LIKES_BAR;
/** v0.11.137 (RT1, M2 + L1): her question is open while she IS human now, has no path, and said "Not yet" (or an old save saw her human
 *  with no answer); at 72 her daily scene asks it again (`yk_choice_again`), below it James can still say "Family." from that scene. */
export const ykAskOpen = (g) => yukiForm(g) === 'human' && ykHuman(g) && !ykPath(g) && !!(g.flags.yk_wait || g.flags.yuki_human_seen);
export const ykAskAgain = (g) => ykAskOpen(g) && ykLoverOpen(g);
export const ykFamilyNow = (g) => ykAskOpen(g) && !ykLoverOpen(g);
/** v0.11.137 (RT1, M3): the shape she had before the question, back after "Not yet" and the answers away from the fire. */
export const ykFormBack = (g) => { if (g.flags.yk_form_before) { g.yuki.form = g.flags.yk_form_before; delete g.flags.yk_form_before; } };

/** v0.11.123 (owner picks EQ1, SC; EB1, YH; texts by Fable, D3 MAIN): the lead-ins of her Fallout night, by the state the loft was in
 *  when James chose her (`fo_pick`, set by the choice, cleared at `fo_depart`): the quiet loft, Ya at the window, the three on the roof.
 *  Hidden when Mei Lin is already his lover in the hay (YH: the rule Ya's "Stay." follows), so Fable's lead-in (ii) is not used. */
const YK_FO_LEAD = {
    yk: (g) => byForm(g, `Yuki gets up from beside you, goes to the loft window, and looks back at you, once. Forty years have taught you that look. It means *now*, and it means *don't make me ask*. You follow her out onto the thatch.`, `Yuki gets up from beside you, goes to the loft window, considers it, and looks back at you, once. Forty years have taught you that look. It means *now*, and it means *don't make me ask*. She goes through a shoulder at a time, and the frame survives, narrowly. You follow her out onto the thatch.`, `Yuki gets up from beside you, goes to the loft window, and looks back at you, once. Forty years have taught you that look. It means *now*, and it means *don't make me ask*. You follow her out onto the thatch.`), // v0.11.128 (RV2, FO; Fable's MAIN): the great root-kin and the window
    yk_ya: (g) => `"Not tonight," you say. ${byForm(g, '"Tonight is the cat\'s."', '"Tonight is the cat\'s."', '"Tonight is Yuki\'s."')} Ya looks at Yuki, and Yuki looks at Ya, and something is settled between them that you are not consulted on. ${byForm(g, '"The not-cat,"', '"The not-cat,"', '"The not-woman,"')} Ya says, and grins with every tooth. "Fine. She was first. I can count to one." She goes out by the window, then puts her head back in upside down. "A little offended," she adds, for accuracy, and is gone. ${byForm(g, 'Yuki goes out after her, the other way, up.', 'Yuki goes out after her, a shoulder at a time, and the frame survives, narrowly; then the other way, up.', 'Yuki goes out after her, the other way, up.')} You follow.`, // v0.11.129 (CB1, YA; Fable's MAIN): the great root-kin and the window
    yk_roof: () => `You say nothing, which Ya hears perfectly. She looks at Yuki, who is looking at nothing, very hard, and laughs under her breath. "Come, herb girl. I'll show you how to sleep on a god." "I shall sleep in a bed," says Mei Lin, "like a person," and she goes in at the window with her dignity intact, touching your shoulder once on the way, as she'd touch a doorpost for luck. Ya takes the shrine roof in one jump, and the thatch is yours.`,
};
const SCENES_YK = {
    yk_choice: {
        id: 'yk_choice', title: (g) => (ykAtFire(g) ? 'The Last Fire' : 'The Question'), art: 'yuki_human', place: (g) => (ykAtFire(g) ? 'The Long Forest' : g.location), // v0.11.137 (QA2): away from the fire, its own text
        enter: (g) => { g.flags.yk_form_before = yukiForm(g); g.yuki.form = 'human'; return []; }, // v0.11.137 (RT1, M3): her shape before, for after
        text: (g) => (ykAtFire(g) ? YK_FIRE_TEXT : YK_HERE.first),
        choices: [
            { text: '"Family. You\'re my sister, Yuki. You always have been."', do: (g) => { g.flags.yk_path = 'sister'; delete g.flags.yk_wait; return []; }, to: (g) => (ykAtFire(g) ? 'yk_sister' : 'yk_sister_here') }, // v0.11.137 (QA2): away from the fire, its own scene
            { text: (g) => (ykAtFire(g) ? '"More." Reach across the fire for her hand.' : YK_HERE.more), show: ykLoverOpen, do: (g) => { g.flags.yk_path = 'lover'; delete g.flags.yk_wait; return []; }, to: (g) => (ykAtFire(g) ? 'yk_lover' : 'yk_lover_here') }, // v0.11.137 (TR1, YR): at affection 72; (QA2) away from the fire, its own label and scene
            { text: YK_QUESTION.notYet, show: (g) => !ykLoverOpen(g), do: (g) => { g.flags.yk_wait = true; ykFormBack(g); return [YK_QUESTION.notYetResult]; }, to: back }, // v0.11.137 (TR1, YR): last, so the two answers keep their places
        ],
    },
    yk_choice_again: { // v0.11.137 (TR1, YR; Fable's text): her question reopened by her daily scene (yuki_time.js), anywhere, at the bar
        id: 'yk_choice_again', title: 'The Question', art: 'yuki_human', place: (g) => g.location,
        enter: (g) => { g.flags.yk_back = g.flags.yk_time_hub || g.flags.yk_back; g.flags.yk_form_before = yukiForm(g); return []; },
        text: YK_QUESTION.again,
        choices: [
            { text: '"Family. You\'re my sister, Yuki. You always have been."', do: (g) => { g.flags.yk_path = 'sister'; delete g.flags.yk_wait; return []; }, to: 'yk_sister_here' }, // v0.11.137 (QA2)
            { text: YK_HERE.more, show: ykLoverOpen, do: (g) => { g.flags.yk_path = 'lover'; delete g.flags.yk_wait; return []; }, to: 'yk_lover_here' },
        ],
    },
    yk_sister_here: { // v0.11.137 (QA2; Fable's text): "Family" away from the Long Forest's fire; her shape stays
        id: 'yk_sister_here', title: 'Family', art: 'yuki_human', place: (g) => g.location,
        text: YK_HERE.sister,
        choices: [{ text: YK_HERE.sisterLabel, do: (g) => { bumpRel(g, 'Yuki', 0, 0); ykFormBack(g); return [YK_HERE.sisterResult]; }, to: back }],
    },
    yk_lover_here: { // v0.11.137 (QA2; Fable's text): "More." away from the Long Forest's fire; her shape stays
        id: 'yk_lover_here', title: 'More', art: 'yuki_human', place: (g) => g.location,
        text: YK_HERE.lover,
        choices: [{ text: YK_HERE.loverLabel, do: (g) => { bumpRel(g, 'Yuki', 0, 0); g.flags.yk_kissed = true; ykFormBack(g); return [YK_HERE.loverResult]; }, to: back }],
    },
    yk_sister: {
        id: 'yk_sister', title: 'Family', art: 'yuki_human', place: 'The Long Forest',
        text: `Yuki studies you across the fire for one breath. Then she nods, once only, a cat marking a matter settled, and her shoulders drop an inch she had not admitted to holding.

"Good," she says. "Sister. I'm keeping the blanket."

"The blanket has never once been in dispute."

"Now it is on the record." She rises, walks round the fire and drops down at your side, shoulder against shoulder, and butts her head into yours exactly as she did as a cat, which, you suppose, she still is. "Rules. One: I may be horrible about every woman you so much as glance at. Two: any of them hurts you, I eat her. Three," and up goes a finger, "you are forty, you are lonely, and you are a lost cause. The next woman with a pretty face and the nerve to stand near that lab coat, you are going to *talk* to her. I will be supervising."

"That's not a rule, that's a threat."

"A sister," says Yuki, with vast contentment, "is entitled to both."`,
        choices: [{ text: 'Sleep. Tomorrow, the smoke.', do: (g) => { bumpRel(g, 'Yuki', 0, 0); delete g.flags.yk_form_before; g.yuki.form = 'cat'; return ['Yuki: your sister. Back in her small form, on your chest, purring like a smug engine.']; }, to: back }],
    },
    yk_lover: {
        id: 'yk_lover', title: 'More', art: 'yuki_human', place: 'The Long Forest',
        text: `Her hand is warm, and it startles you, which is absurd. Forty years of her sleeping on your chest, a warm weight and nothing more, and it never crossed your mind that the warmth would come with fingers.

"Oh," says Yuki, hardly louder than the fire. No dry remark arrives behind it. You wait, and none does.

She comes round the fire on her knees, slowly, and at every inch you could still make a joke of it. You let each chance go by. She stops where her hair spills over your arm. Her ears flatten, then come forward, and her tail takes one turn about your ankle, asking.

"I am going to kiss you," she says. "The method has had some thought. I made notes."

"Of course you made notes."

The notes are excellent. She kisses exactly as she hunts, sleeps and argues: in her own time, with no doubt of the result. You draw her into your lap, and she makes a low sound the bond has carried to you a thousand times and your ears have never had. Her dress was the bond's idea. A few minutes on, the bond has a better one, and there is no dress.

The fire burns low. Nobody gets up to feed it.

*

By first light she is asleep on your chest, the most familiar weight you own, except that tonight it has a face tucked into your neck, an arm flung across you, and a very small snore. The bond, mostly asleep: *I said I would get the best spot.*`,
        choices: [{ text: 'Let her sleep. Tomorrow, the smoke.', do: (g) => { bumpRel(g, 'Yuki', 0, 0); delete g.flags.yk_form_before; g.flags.yk_kissed = true; g.yuki.form = 'cat'; return ['Yuki: your lover. She stays human until the treeline, holding your hand, and then flows back into a cat on your shoulder. "Nobody needs to know yet," she says, before she does. "I like being underestimated."']; }, to: back }], // v0.11.127 (LP1, LF): back in her small shape, as the text says (the sister's pick does the same)
    },

    /* ---------- Act 1 camps ---------- */
    yk_camp: {
        id: 'yk_camp', title: 'Past the Firelight', art: 'yuki_human', place: (g) => g.location,
        enter: (g) => { markDaily(g, 'yk_camp'); g.flags.yk_nights = (g.flags.yk_nights || 0) + 1; bumpRel(g, 'Yuki', 2, 4); if (likesMei(g)) g.flags.yk_mei = (g.flags.yk_mei || 0) + 1; return []; },
        text: (g) => {
            const n = g.flags.yk_nights || 1;
            const first = n === 1 // v0.11.127 (LP1, CP; LQ2, TS + CN; Fable's MAINs): the nights and the morning after by her form
                ? `${byForm(g, 'You walk out past the firelight, and a white cat pads after you, and somewhere between one root and the next she stops being a cat.', 'You walk out past the firelight, and a white cat pads after you, and somewhere between one root and the next she stops being a cat.', 'You walk out past the firelight, and a little later, in no hurry at all, so does Yuki.')} ${byForm(g, 'Yuki', 'Yuki', 'She')} falls into step beside you, barefoot on the bark, and takes your hand as though she's done it all her life.

"The others are going to notice," you say.

"Ya knew the day we met. One sniff, and she grinned like a wolf who has found another wolf." Yuki tips her head back toward the fire. "Mei Lin has not. Mei Lin has a very instructive morning ahead of her."

She draws you down into the dark between two great roots, and the Blackroot goes a long way off and stays there until late.`
                : n === 2
                    ? `The second time, Yuki doesn't bother with the walk. ${byForm(g, 'She simply turns human in your bedroll', 'She simply turns human in your bedroll', 'She simply gets into your bedroll')}, which is efficient and also cold, because her feet are freezing, and she puts both of them on you with great deliberation.

"Penance," she says. "For the lab coat. The whole garment. Every year you wore it."

After that she has no more to say, and takes her time not saying it.`
                    : n === 3 ? `It has become a thing: the fire burns low, ${byForm(g, 'the cat goes out into the dark', 'the cat goes out into the dark', 'Yuki gets up and walks out into the dark without a word of excuse')}, and a little later so do you. Ya has started whistling when you get up. Mei Lin has started pretending to be asleep, badly.

Yuki is laughing against your shoulder about it, low and dry, when she stops laughing.`
                    // v0.11.152 (owner pick RP1, RM4; Fable's): the 4th night (up to four Blackroot nights)
                    : `The fourth night, nobody at the fire so much as looks up. ${byForm(g, 'The cat stretches, one leg at a time, and strolls out into the dark', 'The cat stretches, one leg at a time, and strolls out into the dark', 'Yuki stands, says "Well," to nobody, and strolls out into the dark')}, and Ya passes you your coat without being asked, like an innkeeper handing a regular his hat.

Yuki is waiting between the roots${byForm(g, ', on two feet', ', on two feet', '')}, combing out her hair with her fingers.

"We've become a routine," she says. "I've been one for forty years. You'd think I'd object more."

"Do you?"

She gives it honest thought, ears turning. "No," she says, and takes hold of your collar with both hands. "Ask me again in another forty."

After that the Blackroot keeps its own counsel, and so do you.`;
            const mei = likesMei(g)
                ? ((g.flags.yk_mei || 0) === 1
                    ? `\n\n*

${byForm(g, 'In the morning Mei Lin looks at you, and at the white cat on your shoulder, and at the long white hair on your collar, and goes red to the ears, and says nothing at all with tremendous force. Later, at the stream, you see Yuki — human, and very deliberately so — sitting beside her on a rock, talking quietly. Mei Lin\'s back is very straight. She does not leave.', 'In the morning Mei Lin looks at you, and at the great white cat stretched out along the far side of the fire, and at the long white hair on your collar, which is a good deal longer than anything on the cat, and goes red to the ears, and says nothing at all with tremendous force. Later, at the stream, you see Yuki — human, and very deliberately so — sitting beside her on a rock, talking quietly. Mei Lin\'s back is very straight. She does not leave.', 'In the morning Mei Lin looks at you, and at Yuki, who is eating breakfast with perfect composure, and at the long white hair on your collar, and goes red to the ears, and says nothing at all with tremendous force. Later, at the stream, you see Yuki — who has plainly chosen her moment — sitting beside her on a rock, talking quietly. Mei Lin\'s back is very straight. She does not leave.')}`
                    : (g.flags.yk_mei || 0) === 3 ? `\n\n*

In the morning Mei Lin pours the tea, and hands the first bowl to ${byForm(g, 'Yuki, who has turned human to receive it,', 'Yuki, who has turned human to receive it,', 'Yuki')} before she hands one to you, which in Ashfall is a statement about rank. Yuki takes it in both hands, gravely, as it was given. Neither of them looks at you. They are both very obviously not looking at you. Ya leans over and tells you, in what she believes to be a whisper, that you have been outvoted, and that nobody even asked her to vote.` // v0.11.152 (RP1, RM4; Fable's): the mornings after the 3rd and 4th nights
                    : (g.flags.yk_mei || 0) >= 4 ? `\n\n*

In the morning Mei Lin is braiding Yuki's hair, all of it, which is a morning's work, with the ivory pin held in her teeth. Yuki${byForm(g, ', human for the purpose,', ', human for the purpose,', '')} sits for it with her eyes half shut and her tail very still. "She asked," Mei Lin says round the pin, before you can say anything at all. Then, because she is Mei Lin: "She asked nicely. One of you can." Ya wants to know who is going to braid hers. Nobody volunteers. She looks at you.`
                    : `\n\n*

In the morning Mei Lin and Yuki walk ahead of you on the path, side by side and deep in conference. Once Mei Lin laughs, the forbidden laugh, the one Ashfall trained out of her; she claps a hand over her mouth and looks round to see who heard. Yuki glances back at you over her shoulder, a cat with the whole bird in her mouth. Ya, at your side, says, "Your cat is better at this than I am," and sounds delighted to lose.`)
                : '';
            return first + mei;
        },
        choices: [{ text: 'Back to the fire before it goes out.', time: 60, to: 'bl_camp' }],
    },
    yk_sister_talk: {
        id: 'yk_sister_talk', title: 'Interrogation', art: (g) => (ykHuman(g) ? 'yuki_human' : yukiForm(g) === 'tiger' ? 'yuki_tiger' : 'yuki_close'), place: (g) => g.location,
        enter: (g) => { markDaily(g, 'yk_sis'); g.flags.yk_sis_talks = (g.flags.yk_sis_talks || 0) + 1; if (g.rel['Mei Lin']) bumpRel(g, 'Mei Lin', 2, 6); if (g.rel.Ya) bumpRel(g, 'Ya', 2, 8); return []; },
        text: (g) => {
            const n = g.flags.yk_sis_talks || 1;
            const lines = [
                `${byForm(g, 'Yuki corners you by the water, in her human form, which she only uses for things she considers important.', 'Yuki corners you by the water, in her human form, which she only uses for things she considers important.', 'Yuki corners you by the water, which she does by standing exactly where you meant to go. She only does it for things she considers important.')} Today, that's your love life.

"Mei Lin," she says, "carried chopsticks into the Blackroot. On your account. She will not say so. She has been eating with them beside you, very slowly, since the road began, waiting to be noticed." She folds her arms. "And Ya, who bit a tooth out of a wolf, *gave you the tooth*. Have you any idea what that means among her people?"

"I have chosen not to ask."

"It means you are an idiot," says Yuki. "In every culture. Now go and sit beside one of them. Either one. Both. It is all the same to me, but that face of yours is lowering my spirits."`,
                `"Your grade," says Yuki, seated on a root with her ears at full height. "The conversation with Mei Lin at the fire: four. Out of ten. You told a joke about spore prints. She *laughed*, and that alone lifts it from a two."

"I thought it went rather well."

"It went well because she likes you. The spore prints contributed nothing. The spore prints are retired." She thinks it over. "With Ya you are doing better. Ya enjoys being insulted, and there you have a real gift. Go on insulting Ya."`,
                `This time Yuki has nothing to say. She comes and sits by you at the edge of the camp, human, shoulder pressed to shoulder, and leans until you give in and lean back.

"You are happier," she says at last. "Than at home. Than in the lab. Since those two." A short pause, dry as the rest of her. "Do not spoil it. I am watching."`,
                // v0.11.152 (owner pick RP1, RM5; Fable's): the 4th night
                `"Progress report," says Yuki. She has sat down across from you, human, with a twig, and is drawing in the dirt: a column for Mei Lin, a column for Ya. There are marks in both. "I've stopped grading. You were dragging down the average of the whole expedition."

"And now?"

"Now I count." The twig taps one column. "Mei Lin laughed four times today where people could hear her. Before you, I'm told, the figure was none." Tap. "Ya sat still through an entire meal. Nobody has a previous figure for that." She looks at the marks a moment longer than the joke needs, then rubs them out with her foot. "I don't know what you're doing. Don't tell me, you'll only explain it. Go and do more of it."`,
            ];
            if (!ykHuman(g) && n <= 1 && yukiForm(g) === 'tiger') return SIS_TALK_BOND_GREAT; // RL1 (NT): Fable's ALT B for the great root-kin
            const t = (ykHuman(g) ? lines : SIS_TALK_BOND)[Math.min(n, 4) - 1]; // v0.11.122 (LG1, YV); v0.11.152 (RP1, RM5): a 4th night
            return typeof t === 'function' ? t(g) : t;
        },
        choices: [{ text: 'Go and sit with them. As instructed.', time: 30, to: 'bl_camp' }],
    },

    /* ---------- the last night of Act 1 ---------- */
    yk_night_solo: {
        id: 'yk_night_solo', title: 'Just Her', art: 'yuki_human', place: 'Ashfall — the grove',
        enter: (g) => { g.flags.final_night = 'yuki'; bumpRel(g, 'Yuki', 0, 10); return []; },
        text: (g) => `${byForm(g, 'You go out to the grove, and the white cat goes with you, and inside the ring of white trunks the cat is a woman, and the woman is Yuki.', 'You go out to the grove, and the great white cat goes with you, down the middle of the lane, there being no other part of the lane left, and inside the ring of white trunks there is suddenly a good deal more room, and a woman in it, and the woman is Yuki.', 'You go out to the grove, and Yuki goes with you, on two feet, down the middle of the lane, and inside the ring of white trunks she stops minding who is watching, because nobody is.')}

"Tomorrow a very old man comes to try to take you," she says, lying back in the moss, her hair everywhere, the grove's song humming in the trunks all round you. "He will look at me and not see what I am. I once bit a wolf in half on your account. He gets worse."

"I know."

"Good." She pulls you down beside her. "Then he gets no more of your evening."

The grove sings. He gets none of it.

*

${byForm(g, 'Toward dawn she is on your chest in her small shape, purring, as if nothing ever happened, and then — just for a second, as the light comes up — she isn\'t, and she kisses you once, and says, "Go and win," and is a cat again before you can answer.', 'Toward dawn she is round you in her great shape, her head on your chest, which is all of her that fits, purring, as if nothing ever happened, and then — just for a second, as the light comes up — she isn\'t, and she kisses you once, and says, "Go and win," and is a tiger\'s length of cat again before you can answer.', 'Toward dawn she is asleep on your chest, as she has been for forty years, except for the arm thrown over you and the hair in your mouth, and then — just for a second, as the light comes up — she isn\'t asleep, and she kisses you once, and says, "Go and win," and is asleep again before you can answer.')}`, // v0.11.127 (LP1, CP; Fable's MAINs): openly human, no change of shape; v0.11.128 (OF2, SD): the great root-kin's dawn ends great
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    yk_night_mei: {
        id: 'yk_night_mei', title: (g) => byForm(g, 'The Herb Loft, and the Cat', 'The Herb Loft, and the Cat', 'The Herb Loft, and Yuki'), // v0.11.128 (RV2, MT; Fable's MAIN)
        art: 'roof', place: 'Ashfall — the herb loft',
        enter: (g) => { g.flags.final_night = 'yuki_mei'; g.flags.romance = true; bumpRel(g, 'Mei Lin', 5, 12); bumpRel(g, 'Yuki', 0, 8); return []; },
        text: (g) => `${byForm(g, 'Mei Lin climbs the ladder to the loft ahead of you, and a white cat climbs it ahead of her, and at the top there is no cat.', 'Mei Lin climbs the ladder to the loft ahead of you, past two rungs that a very large cat cracked on the way up, and at the top there is no cat.', 'Mei Lin climbs the ladder to the loft ahead of you, and the lamp at the top is already lit, and it was not Mei Lin who lit it.')}

Mei Lin stops on the last rung. Yuki is sitting in the hay${byForm(g, ' in her human shape', ' in her human shape', '')}, ears forward, perfectly composed, as if she has been waiting for an appointment.

"She and I have been talking," Yuki tells you. "For days. You were not asked to attend."

"In Ashfall," Mei Lin says, low and quick, "a woman who—"

${byForm(g, '"In Ashfall," says Yuki, "they think I\'m a cat."', '"In Ashfall," says Yuki, "they think I\'m a cat."', '"In Ashfall," says Yuki, "they have all looked at my ears, gravely, and agreed not to see them."')} She holds out a hand. "I'm not asking you to be shameless. I'm asking you to be honest. You've been honest with me all week. Be honest with him."

Mei Lin considers the offered hand for three slow breaths. Then the laugh comes, the one that has got her into trouble all her life. She checks the ladder for listeners, takes the hand, and climbs the last rung.

Two women, you learn, can be of one mind about you on every point, at length, in detail and aloud. Parallel Cognition lodges nine separate objections and is overruled on all nine. The lamp goes out. It stays out.`,
        choices: [{ text: 'A few hours. Then the Elder.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    yk_night_ya: {
        id: 'yk_night_ya', title: 'Two Predators', art: 'grove_sprout', place: 'Ashfall — the grove',
        enter: (g) => { g.flags.final_night = 'yuki_ya'; g.flags.ya_romance = true; bumpRel(g, 'Ya', 5, 12); bumpRel(g, 'Yuki', 0, 8); return []; },
        text: (g) => `Ya is waiting in the grove. So, it turns out, is Yuki: ${byForm(g, 'human, ', 'human, ', '')}sitting cross-legged in the moss opposite the huntress, the two of them regarding each other with the calm, total attention of two large predators who have decided not to fight over the kill.

${byForm(g, '"Your cat," Ya says, without looking round, "is a woman."', '"Your cat," Ya says, without looking round, "is a woman."', '"Your woman," Ya says, without looking round, "is a cat."')}

"I know."

"I knew on the first day. She smelled wrong. The good wrong." Ya shows her teeth, most of them. "She tells me the best spot is hers."

"The best spot has always been hers."

"We'll see," says Ya, and Yuki's ears go flat with delight, and nothing said in the grove after that would survive being written down. Ya bites. Yuki, it emerges, bites back. For long stretches you are chiefly furniture, and no furniture was ever happier in its work.

*

${byForm(g, 'Toward dawn you wake in the moss with Ya sprawled across your legs, snoring, and a white cat curled in the small of her back, purring, and the grove singing over all three of you.', 'Toward dawn you wake in the moss with Ya sprawled across your legs, snoring, and a great white cat curled round the pair of you, purring, and the grove singing over all three of you.', 'Toward dawn you wake in the moss with Ya sprawled across your legs, snoring, and Yuki curled into the small of her back, white hair over both of them, and the grove singing over all three of you.')}`, // v0.11.128 (OF2, YA; Fable's MAINs): the dawn by her form
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    // v0.11.129 (CB1, NA; Fable's MAIN): the great root-kin changes in plain view by the stove
    // v0.11.129 (CS1, NM, ND, YC; Fable's MAINs): the small cat changes in plain view too; both cats' dawns show the change back; Mei Lin's look at the great root-kin
    yk_night_all: {
        id: 'yk_night_all', title: 'Four', art: 'trio', place: 'Ashfall — the herb loft',
        enter: (g) => { g.flags.final_night = 'all'; g.flags.throuple = true; g.flags.romance = true; g.flags.ya_romance = true; bumpRel(g, 'Mei Lin', 6, 15); bumpRel(g, 'Ya', 6, 15); bumpRel(g, 'Yuki', 0, 10); return []; },
        text: (g) => `"Right," says Ya, standing up from the table. "I'm tired of this."

${byForm(g, 'The white cat on the bench beside you stands up too, and goes on standing up, and by the end of it there is a white-haired woman with cat\'s ears where the cat was sitting, in front of everybody. "So am I," says Yuki, which makes Mei Lin\'s mother — on her way to bed — stop dead on the stairs, look at the white-haired woman with cat\'s ears at her table for a long, grave moment, and then continue up the stairs without a word, which in Ashfall is roughly a blessing.', 'The great white cat on the floor by the stove gets up too, and goes on getting up, and by the end of it there is a white-haired woman with cat\'s ears standing on the hearthstones, in front of everybody. "So am I," says Yuki, which makes Mei Lin\'s mother — on her way to bed — stop dead on the stairs, look from the woman to the stretch of floor where a hearthrug\'s worth of cat lay at supper for a long, grave moment, and then continue up the stairs without a word, which in Ashfall is roughly a blessing.', '"So am I," says Yuki, and stands up too, from the bench by the stove, which makes Mei Lin\'s mother — on her way to bed — stop dead on the stairs, look at the white-haired woman she set a fifth bowl for this evening, and then at her daughter, for a long, grave moment, and then continue up the stairs without a word, leaving them the lamp, which in Ashfall is roughly a blessing.')}

Ya points at Mei Lin. "You want him." The finger moves to you. "You want her." To Yuki. "That one wants everybody. Cats do." A shrug. "And everybody wants me, because I am wonderful."

"You and I have talked for a week," Yuki says to Mei Lin, more quietly. "Every night. You know what I am about to say."

Mei Lin looks at the three of you — the scholar, the huntress, ${byForm(g, 'the cat', 'the woman who was a cat at supper', 'the woman with the ears')} — and her face goes through pride, and fury, and fear, and then something else entirely.

"Build something else," she says. "Those were your words to me." She gets to her feet. "Very well. The loft. And if my mother hears a single sound—"

"Liar," say Ya and Yuki, in one breath, then look at each other, and grin.

Upstairs the air is mint and hay. Everyone holds opinions, and no one is shy with them. Somewhere in the middle of it Parallel Cognition surrenders outright, and all nine threads, which have never in your life agreed on a subject, settle on one.

*

${byForm(g, 'Toward dawn: Mei Lin\'s head on your chest; Ya across both of you like a fallen tree; and Yuki, a white cat again since some time in the night, on top of the whole pile, as high as she can get, purring like an engine. *Best spot,* says the bond.', 'Toward dawn: Mei Lin\'s head on your chest; Ya across both of you like a fallen tree; and a great white cat round the whole pile, since at some point in the night she went back to being one and can no longer get on top of it, purring like a larger engine. *Best spot,* says the bond.', 'Toward dawn: Mei Lin\'s head on your chest; Ya across both of you like a fallen tree; and Yuki on top of the whole pile, as high as she can get, her tail across somebody\'s face. "Best spot," she says, without opening her eyes.')}`, // v0.11.128 (OF2, YA; Fable's MAINs): the "So am I" line and the dawn by her form
        choices: [{ text: 'A few more hours. Then the Elder.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    /* ---------- v0.11.123 (owner picks EQ1, SC; EB1): her night at the Fallout and her walk on the way home (Fable's D3, D4 MAINs; ER1 (TX): R2–R4, the log, the north, any form) ---------- */
    // v0.11.129 (CB1, RF; Fable's MAIN): the roof's first two sentences read after all three leads
    yk_night_fo: {
        id: 'yk_night_fo', title: 'The Wrong Stars', art: 'yuki_human', place: 'Ashfall Hamlet — the roof',
        enter: (g) => { bumpRel(g, 'Yuki', 0, 8); return []; },
        text: (g) => `${(YK_FO_LEAD[g.flags.fo_pick] || YK_FO_LEAD.yk)(g)}

The night is cold, and the stars are the wrong stars, as they have been every night since the lab. When you look for her she is up on the ridge, facing north, and ${byForm(g, 'whatever she went up as, it is a woman sitting there now', 'whatever she went up as, it is a woman sitting there now', 'she has had time to arrange herself as if she had never been anywhere else')}, knees drawn up, white hair lifting in the wind, tail wrapped round her bare feet.

"Don't say anything clever," says Yuki. "I came out here to be sincere and I'd like to get it over with."

"Go on."

"Something up north is pulling. Not at you. At me, by the scruff. It has been at it since sundown, and it makes me miss a place I've never set a paw in, which is ridiculous, and I resent it." Gold eyes, sideways. "You're the only home I've had that came with me. So tomorrow you don't walk in front. You walk next to me. That's all. That was the sincere part."

"It was very good."

${byForm(g, '"I know. I rehearsed it on the stove."', '"I know. I rehearsed it in front of the stove. I no longer fit on it."', '"I know. I rehearsed it on the bench by the stove."')}

She leans in, and it is the oldest weight in your life, her head against your jaw; only this time there is a mouth with it, unhurried and sure of its welcome. Her hand goes inside the ridiculous coat as if she had always kept her things there. Below you sleeps a village that ${byForm(g, 'put down a saucer of fish scraps for her at supper', 'set the stew pot down for her at supper, with great ceremony and from a distance', 'set a bowl for her at supper and then, after grave consideration, a saucer of fish scraps beside it')}. She laughs about it, without a sound, against your throat.

"Quietly," you say.

"I have been quiet for forty years," says Yuki. "One more night won't kill me."

The thatch keeps secrets. So does the north wind. The rest is nobody's business.

*

${byForm(g, 'You wake in grey light with a small white cat in the hollow of your neck, purring as if she had never been anything else. Down in the lane the first doors are opening. *Up,* says the bond. *They\'re going to bow at you. Try to look like a man who slept.*', 'You wake in grey light with a great white cat laid along the ridge beside you and her head on your chest, purring as if she had never been anything else. The thatch has held, which neither of you expected. Down in the lane the first doors are opening. *Up,* says the bond. *They\'re going to bow at you. Try to look like a man who slept.*', 'You wake in grey light with Yuki asleep against your neck, one arm across you and her tail over your eyes, as if she had never slept any other way. Down in the lane the first doors are opening. "Up," she says, without moving. "They\'re going to bow at you. Try to look like a man who slept."')}`, // v0.11.127 (LQ2, HL; Fable's MAIN): the human's dawn; v0.11.128 (OF2, FD): the great root-kin's dawn and the supper by her form
        choices: [{ text: 'Dawn.', to: 'fo_depart' }],
    },
    rt_yk_talk: {
        id: 'rt_yk_talk', title: 'Arithmetic', art: 'yuki_human', place: 'Blackroot Wilds — the deer paths',
        text: (g) => `You let the others draw ahead until the path bends and takes them. Through the bond, you feel her decide something. ${byForm(g, 'When you look round, Yuki is walking beside you on two bare feet, hands clasped behind her back, tail keeping her steady on the roots, as if she\'d been doing it all morning and you had only now noticed.', 'When you look round, Yuki is walking beside you on two bare feet, hands clasped behind her back, tail keeping her steady on the roots, as if she\'d been doing it all morning and you had only now noticed.', 'When you look round, Yuki has dropped back to walk beside you on two bare feet, hands clasped behind her back, tail keeping her steady on the roots, as if she had merely happened to be there and you had only now noticed.')}

"Forty gardeners," she says. ${byForm(g, '"I was in your lap for the log.', '"I had my head in your lap for the log.', '"I was on the arm of your chair for the log.')} It poured into me as well. Nobody came for them."

"No."

"Nobody is coming for us either. I've done the arithmetic. It's the same arithmetic." She steps over a root without looking at it. "I thought I'd mind. I've been waiting to mind since the Heart. Instead I keep thinking that I was born beside you and I'm walking beside you, and the part in between was mostly you talking to mushrooms."

"That was forty years of research."

"That was forty years of me sitting on the research so you'd go to bed." Her ears turn toward the front of the line, and back. "An old man is coming to take you. His Sect has had four hundred years of a heart it cut out of somebody. I've had forty of one nobody had to cut. I like my odds." Gold eyes, level, very dry. "That was me being frightened, by the way. In case it was hard to tell."

"It was a little hard to tell."

"Good."

Somewhere ahead, Ya laughs at nothing. She has a very good nose.`, // v0.11.127 (LQ2, HL; Fable's MAIN): the human's opening
        choices: [
            { text: 'Stop walking. Kiss her before the path straightens.', do: (g) => { bumpRel(g, 'Yuki', 0, 6); return [byForm(g, 'She kisses you as if she has all forty years to hand and is in no hurry to spend them. Then there\'s a cat on your shoulder, washing a paw, innocent of everything.', 'She kisses you as if she has all forty years to hand and is in no hurry to spend them. Then there is a great white cat filling the path beside you, washing a paw, innocent of everything.', 'She kisses you as if she has all forty years to hand and is in no hurry to spend them. Then she walks on, hands clasped behind her back, innocent of everything.')]; }, to: 'rt_road' }, // v0.11.127 (LP1, CP; LQ2, TS: Fable's MAINs)
            { text: '"The best spot is still yours. Elder or no Elder."', do: (g) => { bumpRel(g, 'Yuki', 0, 3); return [byForm(g, '"Obviously," she says, and holds your hand for exactly eleven steps. On the twelfth there\'s a cat on your shoulder again, purring where only you can hear it.', '"Obviously," she says, and holds your hand for exactly eleven steps. On the twelfth your hand is on a great white shoulder instead, and she is purring where only you can hear it.', '"Obviously," she says, and holds your hand for exactly eleven steps. On the twelfth the path straightens, and she lets go, and purrs through the bond, where only you can hear it.')]; }, to: 'rt_road' }, // v0.11.127 (LP1, CP; LQ2, TS: Fable's MAINs)
        ],
    },
};

/** Act 1 epilogue line for every arrangement. */
export function loveLine(g) {
    const f = g.flags.final_night;
    // v0.11.126 (NR1, LV; Fable's): the hosts by her current form ('yuki_mei' and 'yuki_ya' keep theirs; the human lover keeps the throuple's cat, her choice)
    const lover = ykLover(g) && ykHuman(g); // v0.11.122 (LG1, YG): the lover lines have her human
    const sis = ykSister(g) ? ' Yuki, your sister, has appointed herself head of the household and grades everybody\'s cooking ' + byForm(g, "through the bond, which leaves you to read out the marks.", "by how much of the pot comes back.", "out loud.") : ''; // v0.11.126 (NQ1, RV): aloud only as a human, Fable's
    if (f === 'all') return byForm(g, "At night the four of you sleep in the herb loft, a tangle of limbs and hair, and the smallest of you is a white cat on top of the pile. Mei Lin's mother sets five places at the table now — four and a saucer, out of habit, though the saucer is mostly ceremonial.", "At night the four of you sleep in the herb loft, a tangle of limbs and hair, and the largest of you is a white cat and most of the bedding. Mei Lin's mother sets five places at the table now — four and the stew pot; the saucer still goes out, out of habit, though the saucer is mostly ceremonial.", "At night the four of you sleep in the herb loft, a tangle of limbs and hair and one white tail, which ends up on top of the pile whatever anyone does. Mei Lin's mother sets five places at the table now, and a saucer, out of habit, though the saucer is mostly ceremonial.") + ' Ya still goes out to the grove some nights. More and more often, everyone goes with her.';
    if (f === 'yuki_mei') return 'Mei Lin and Yuki have become a conspiracy. You are the subject of it. Most nights the herb loft holds three of you, and Mei Lin\'s mother has stopped asking ' + byForm(g, 'why the cat needs a pillow.', 'why the cat needs a pillow.', 'where the lady with the ears sleeps.'); // v0.11.129 (CB1, LV; Fable's MAIN): the human's own
    if (f === 'yuki_ya') return 'Ya sleeps in the grove most nights, and most nights you and Yuki sleep there too, the huntress and ' + byForm(g, 'the cat', 'the cat', 'the woman she still calls the cat') + ' arguing about the best spot until they both win. The village has given up pretending not to notice.';
    if (f === 'yuki') return byForm(g, 'Most nights you sleep in the grove, and most nights the cat who curls up on your chest is, for a little while after the lamps go out, not a cat at all. The village thinks you\'re a lonely man with a cat. Yuki likes being underestimated.', "Most nights you sleep in the grove, and most nights the cat who lays her head on your chest, which is all of her that fits, is, for a little while after the lamps go out, not a cat at all. The village thinks you're a lonely man with a very large cat. Yuki likes being underestimated.", 'Most nights you sleep in the grove, and most nights Yuki sleeps there too, and walks back in at dawn beside you with moss in her hair. The village has agreed, gravely and without a meeting, that the ears are not to be mentioned. Yuki likes being underestimated.'); // v0.11.126 (NS1, YN): the great root-kin's own; v0.11.127 (LP1, CP; LQ2, TN: Fable's ALT A): the human's own
    if (g.flags.throuple) return byForm(g, 'At night the three of you sleep in the herb loft, a tangle of limbs and hair and one aggrieved cat.', "At night the three of you sleep in the herb loft, a tangle of limbs and hair, in whatever room one aggrieved cat has left you.", lover ? 'At night the three of you sleep in the herb loft, a tangle of limbs and hair and one aggrieved cat.' : "At night the three of you sleep in the herb loft, a tangle of limbs and hair, and one aggrieved white-haired woman on the bench by the stove below.") + (lover ? ' Some nights the cat isn\'t a cat, and nobody minds.' : sis) + ' Mei Lin\'s mother has stopped saying anything about it, which in Ashfall is roughly the same as a blessing.';
    if (g.flags.ya_romance && !g.flags.romance) return 'Ya sleeps in the grove most nights, and most nights you sleep there too. The village has given up pretending not to notice.' + (lover ? ' Neither has Yuki, who has started sleeping there too.' : sis);
    if (g.flags.romance) return byForm(g, "Mei Lin's mother sets four places at the table now: three and a saucer.", "Mei Lin's mother sets four places at the table now: three and the stew pot.", "Mei Lin's mother sets four places at the table now, with a saucer by the fourth, out of habit.") + ' She has stopped asking when you\'ll leave.' + (lover ? ' Yuki has started having very quiet conversations with Mei Lin by the well.' : sis);
    return lover ? 'You sleep by the stove with Yuki, in whatever shape she feels like. It\'s enough. It is, honestly, a great deal more than enough.' : ykSister(g) ? `${byForm(g, 'You sleep by the stove with Yuki on your chest.', 'You sleep by the stove with Yuki\'s head on your chest, which is all of her that fits.', 'You sleep by the stove back to back with Yuki, her tail across your shins.')} She says you\'re hopeless. She says it fondly. It\'s enough, for now.` : 'You sleep by the stove with Yuki. It\'s enough. For now, it\'s enough.';
}

/** Append a beat (a paragraph) to an existing scene's text. */
function beat(SCENES, id, fn) {
    const s = SCENES[id];
    if (!s) return;
    const orig = s.text;
    s.text = (g) => { const t = typeof orig === 'function' ? orig(g) : orig; const b = fn(g); return b ? `${t}\n\n${b}` : t; };
}

export function installYukiPath(SCENES) {
    Object.assign(SCENES, SCENES_YK);

    // the first time she is human in a normal run: the question comes after she shows you her shapes
    for (const c of SCENES.yuki_human_after?.choices || []) {
        const to = c.to;
        c.to = (g) => { if (!ykPath(g)) { g.flags.yk_back = typeof to === 'function' ? to(g) : to; return 'yk_choice'; } return typeof to === 'function' ? to(g) : to; };
    }

    beat(SCENES, 'lf_exit', (g) => (ykSister(g) && !ykHuman(g) // v0.11.122 (LG1, YV; Fable's A5)
        ? 'Yuki walks the first mile ahead of you with her tail straight up, and waits at the treeline for you to catch up. *If the first woman we meet is pretty,* says the bond, *I am telling her about the lab coat. All of it.* You point out that she can\'t talk. *I\'ll find a way.*'
        : !ykHuman(g) ? '' // v0.11.122 (LG1, YG): the lover's walk-out has her human
        : ykSister(g)
        ? byForm(g, 'Yuki walks the first mile beside you in her human shape, then turns into a cat on your shoulder at the treeline. *If the first woman we meet is pretty,* says the bond, *I am telling her about the lab coat. All of it.*',
            'Yuki walks the first mile beside you in her great shape, her shoulder at your hip, and takes most of the path. At the treeline she stops and looks the world over. *If the first woman we meet is pretty,* says the bond, *I am telling her about the lab coat. All of it.*',
            'Yuki walks the first mile beside you on two bare feet, and at the treeline does not turn into anything. "If the first woman we meet is pretty," she says, "I am telling her about the lab coat. All of it."') // v0.11.129 (CB1, LX; Fable's MAINs): she ends in her current form
        : ykLover(g) ? byForm(g, 'Yuki holds your hand to the treeline. Then she\'s a cat on your shoulder again, tail curled round your neck, purring like she owns you. Which, you reflect, is fair.',
            'Yuki walks you to the treeline with your hand on her great white shoulder, which is as near as she comes to holding it. Then she leans on you, once, with all of her weight, purring like she owns you. Which, you reflect, is fair.',
            'Yuki holds your hand to the treeline. Then she goes on holding it, out into the open, tail curled round your wrist, as if she owns you. Which, you reflect, is fair.') : ''));
    // v0.11.129 (CS1, ML; Fable's MAINs): as the human she is standing there: Mei Lin asks about the ears, and the bond's aside is private
    const ML_EARS = 'Mei Lin\'s eyes go to the ears, then to the tail, then back to the ears. A woman of Ashfall would not ask. "Are those real?" asks Mei Lin. Yuki turns one of them toward her and says nothing aloud.\n\n';
    beat(SCENES, 'mei_lin', (g) => (yukiForm(g) === 'human' && ykSister(g)
        ? ML_EARS + '*She\'s pretty,* says the bond instead, for you alone, appallingly loud inside your skull, from a woman standing at your elbow with a perfectly straight face. *Bossy. You like bossy. Don\'t deny it, I\'ve met your thesis supervisor. Talk to her. TALK to her.*'
        : yukiForm(g) === 'human' && ykLover(g)
        ? ML_EARS + '*She\'s pretty,* says the bond instead, for you alone, appraising, unbothered, while its owner stands at your elbow and looks at the hills. *I approve. Of her. Not of your face right now.*'
        : ykSister(g)
        ? `*Pretty,* the bond announces, at a volume your skull was never built to hold. *And she gives orders. You have a weakness for orders; I sat through your whole thesis, supervisor included. Say something to her. Out LOUD.*`
        : ykLover(g) ? `*Pretty,* the bond remarks, in the tone of a buyer who has already checked the teeth. *I approve. Of her. Your expression I am sending back to the maker.*` : ''));
    beat(SCENES, 'romance', (g) => (ykSister(g)
        ? byForm(g, `The bond, already distant and still receding: *I am going up on the roof. The roof is my address from tonight. Forward nothing.*`,
            `The bond, already distant and still receding: *I am going up on the roof.* Thatch groans, at length. A silence follows, in which engineering is reconsidered. *The goat shed. My address is the goat shed. Forward nothing.*`,
            'Through the bond, from somewhere very far away and getting farther: *I am moving to the roof. I am living on the roof now. Do not look for me.*') // v0.11.130 (YB1, SR; Fable's MAIN): the great root-kin and the thatch
        : ykLover(g) ? 'Through the bond, sleepy and amused from the stove downstairs: *Told you. I share. Tell her about me later.* A pause. *Much later.*' : ''));
    // v0.11.125 (owner picks FM1, XS1: RB; Fable's MAINs): the ridge, standing: her place by her current form (was "on your chest" in every form)
    beat(SCENES, 'epilogue', (g) => (ykSister(g) ? `${byForm(g, 'Yuki, on your shoulder, opens one gold eye.', 'Yuki, at your side, gives you one sidelong gold eye.', 'Yuki, at your elbow, gives you one sidelong gold eye.')} *Not bad,* says the bond. *For a mycologist.*` // RW1 (SL): awake, standing
        : ykLover(g) && ykHuman(g) ? byForm(g, 'Yuki, on your shoulder, purrs. Just for a moment, in the dusk, it is a hand on the back of your neck instead of a paw.',
            'Yuki, against your hip, purrs; you feel it in your teeth. Just for a moment, in the dusk, the paw on your foot is a hand in yours.',
            'Yuki, at your elbow, does not purr. Just for a moment, in the dusk, her hand is in yours, and it stays a hand.') : ''));
    beat(SCENES, 'ya_meets', (g) => (ykPath(g)
        ? `${byForm(g, 'Ya sniffs the air near your shoulder, frowns, sniffs again, and looks straight at the white cat. "That," she says, "isn\'t a cat." Yuki looks back at her with enormous calm.', // v0.11.125 (RW1, BC; Fable's MAINs)
            'Ya sniffs the air near your hip, frowns, sniffs again, and looks straight at the great white cat. "That," she says, "isn\'t a cat." Yuki looks back at her with enormous calm.',
            'Ya sniffs the air near your elbow, frowns, sniffs again, and looks straight at the white-haired woman. "That," she says, "isn\'t a woman." Yuki looks back at her with enormous calm.')} ${ykLover(g) ? 'Through the bond: *I like her. She can stay. She can maybe even share the spot.*' : 'Through the bond: *I like her. She\'s rude. Marry her.*'}`
        : ''));
    beat(SCENES, 'log_comfort', (g) => (!ykPath(g) || logTrio(g) ? '' // v0.11.124 (NF1, LC1): the trio branch places her itself
        : ykShape(g) === 'tiger' // v0.11.124 (NF1, BT; Fable's MAIN): the great root-kin
        ? `And Yuki: her forehead pushed hard against your temple, the way she has done since before either of you could see, except that now it moves you a hand's width sideways, and a purr going through you that you feel in your ribs. The bond is quiet. ${ykLover(g) ? 'She doesn\'t need to say anything.' : 'Sisters don\'t need to say anything.'}`
        : ykShape(g) !== 'human' // v0.11.122 (LG1, YV; Fable's A4); v0.11.125 (FM1, PM): by her current form, as the picture
        ? `And Yuki: her forehead pushed hard against your temple, the way she has done since before either of you could see, and a purr going through you that you feel in your teeth. The bond is quiet. ${ykLover(g) ? 'She doesn\'t need to say anything.' : 'Sisters don\'t need to say anything.'}`
        : `And Yuki: not on your shoulder but beside you, human, her forehead against your temple, her arm round your back. She doesn't say anything. ${ykLover(g) ? 'She doesn\'t need to.' : 'Sisters don\'t need to.'}`));
    beat(SCENES, 'rt_camp', (g) => (!ykHuman(g) ? '' // v0.11.122 (LG1, YG): both lines need her human form open; v0.11.128 (RV2, M4; Fable's MAINs): the sister's gesture by her form (only the human has hands)
        : ykLover(g)
        ? byForm(g, 'Later, when the others are asleep, the warmest lap is yours, and the cat in it isn\'t a cat, and nobody mentions it in the morning.',
            'Later, when the others are asleep, the great white wall at your back gets a good deal smaller and a good deal warmer, and has arms, and is a wall again by morning, and nobody mentions it.',
            'Later, when the others are asleep, Yuki moves her bedroll the last arm\'s length without a sound, and the best spot is taken, and nobody mentions it in the morning.') // v0.11.127 (LP1, CP + RC; Fable's MAINs)
        : ykSister(g) ? byForm(g, 'Yuki, in the firelight, catches your eye from the lap in question and looks, slowly, at the two women, and then at you. *There is a gesture for this,* says the bond. *It needs hands. Imagine it.* Then she goes to sleep looking very pleased with herself.', 'Yuki, in the firelight, opens one gold eye at you, and the tip of her tail, which is as thick as your wrist, points at the two women, and then at you. *There is a gesture for this,* says the bond. *It needs hands. Imagine it.* Then she goes to sleep looking very pleased with herself.', 'Yuki, in the firelight, catches your eye and makes a small, filthy gesture at the two women, and then at you, and then goes to sleep looking very pleased with herself.') : ''));

    // camp choices in the Blackroot
    SCENES.bl_camp.choices.splice(SCENES.bl_camp.choices.length - 1, 0,
        { text: (g) => byForm(g, 'Walk out past the firelight. The cat follows.', 'Walk out past the firelight. The cat follows.', 'Walk out past the firelight. Yuki follows.'), show: (g) => ykLover(g) && ykHuman(g) && daily('yk_camp')(g), to: 'yk_camp' }, // v0.11.122 (LG1, YG); v0.11.127 (LP1, CP): the label by her form (the great root-kin keeps "the cat")
        { text: 'Let Yuki interrogate you about your love life.', show: (g) => ykSister(g) && daily('yk_sis')(g), time: 20, to: 'yk_sister_talk' });

    // the last night: every arrangement the hearts allow
    const ev = SCENES.rt_evening;
    const trioReady = (g) => likesMei(g) && likesYa(g) && trio(g) >= 3;
    for (const c of ev.choices) {
        if (c.to === 'rt_mei_night') c.show = likesMei;
        if (c.to === 'rt_ya_night') c.show = likesYa;
    }
    ev.choices.splice(ev.choices.length - 1, 0,
        // v0.11.122 (LG1, YG): every one of these has her human, so her human form this Coil as well as the path
        { text: 'Go out to the grove with Yuki. Just Yuki.', show: (g) => ykLover(g) && ykHuman(g), to: 'yk_night_solo' },
        { text: (g) => byForm(g, 'Climb to the loft with Mei Lin. The cat is already up there.', 'Climb to the loft with Mei Lin. The cat is already up there.', 'Climb to the loft with Mei Lin. Yuki is already up there.'), show: (g) => ykLover(g) && ykHuman(g) && likesMei(g) && meiOpen(g), to: 'yk_night_mei' }, // v0.11.127 (LQ2, HL): the label by her form (the great root-kin keeps "the cat"); v0.11.128 (OF2, MO): the scene's opening too
        { text: 'Follow Ya to the grove. Yuki follows you.', show: (g) => ykLover(g) && ykHuman(g) && likesYa(g), to: 'yk_night_ya' },
        { text: 'All of you. Let Ya and Yuki say it.', show: (g) => ykLover(g) && ykHuman(g) && likesMei(g) && likesYa(g) && (trioReady(g) || meiOpen(g)), to: 'yk_night_all' });
    for (const [id, f] of [['rt_trio_night', 'trio'], ['rt_mei_night', 'mei'], ['rt_ya_night', 'ya'], ['rt_quiet_night', 'none']]) {
        const s = SCENES[id];
        const e = s.enter;
        s.enter = (g) => { g.flags.final_night = f; return e ? e(g) : []; };
    }
    beat(SCENES, 'rt_evening', (g) => (ykLover(g) && !ykHuman(g) ? '' // v0.11.122 (LG1, YG): it invites the nights with her, which need her human
        : ykLover(g)
        ? `${byForm(g, 'Yuki is on the stove in her small shape', 'Yuki lies before the stove in her great shape', 'Yuki sits on the bench by the stove')}, watching you all with half-closed gold eyes. ${likesMei(g) || likesYa(g) ? 'Through the bond: *Your call. Any of it. All of it. I told you: I share a sunbeam.*' : 'Through the bond: *The grove is singing. Come and listen.*'}`
        : ykSister(g) ? `Yuki, ${byForm(g, 'on the stove', 'in front of the stove', 'on the bench by the stove')}, cracks one eye. *If you sleep alone tonight,* says the bond, *I am disowning you.*` : ''));
    beat(SCENES, 'rt_quiet_night', (g) => (ykSister(g) ? `Yuki, ${byForm(g, 'on your chest', 'head still on your chest', 'at your back')}, mutters: *Disowned.* She doesn\'t move.` : '')); // v0.11.125 (XS1, XL)

    // v0.11.123 (owner picks EQ1, SC; EB1, YH; Fable's D3, D4): last in their lists, so saved choice positions keep their lines
    const foBoth = (g) => likesMei(g) && likesYa(g);
    SCENES.fo_last_night.choices.push({
        text: (g) => (foBoth(g) ? 'Tonight, Yuki. Wait until the roof is yours.' : byForm(g, 'Follow the cat out onto the roof.', 'Follow the cat out onto the roof.', 'Follow Yuki out onto the roof.')), // v0.11.128 (OF2, FL; Fable's MAIN): the human's label
        show: (g) => ykLover(g) && ykHuman(g) && (foBoth(g) || !g.flags.romance), // YH: hidden when Mei Lin is his lover in the hay, as Ya's "Stay."
        do: (g) => {
            const ya = !foBoth(g) && rel(g, 'Ya').a >= KISS_YA;
            g.flags.fo_pick = foBoth(g) ? 'yk_roof' : ya ? 'yk_ya' : 'yk';
            if (ya) bumpRel(g, 'Ya', -1, 0); // turning Ya down, as "Sleep."
            return [];
        },
        to: 'yk_night_fo',
    });
    SCENES.rt_road.choices.push({ text: (g) => byForm(g, 'Let the other two get ahead, and walk a stretch with the cat.', 'Let the other two get ahead, and walk a stretch with the cat.', 'Let the other two get ahead, and wait for Yuki to drop back.'), show: (g) => ykLover(g) && ykHuman(g) && daily('rt_yk_walk')(g), time: 60, do: (g) => { markDaily(g, 'rt_yk_walk'); return []; }, to: 'rt_yk_talk' }); // v0.11.127 (LP1, CP): the label by her form
}

