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
import { daily, markDaily } from './common.js';
import { likesMei, likesYa, trio } from './act1_common.js';

export const ykPath = (g) => g.flags.yk_path || null;
export const ykLover = (g) => ykPath(g) === 'lover';
export const ykSister = (g) => ykPath(g) === 'sister';
/** v0.11.122 (owner pick LG1, YG; the owner's bug report 2026-11-08 23:22): her path is kept across Coils, her realm is not, so a scene
 *  that has her human needs her human form this Coil (Nascent Soul, `yukiForms`) as well as the path. */
export const ykHuman = (g) => yukiForms(g).includes('human');
/** v0.11.122 (LG1, YV; texts by Fable, A1–A5): her lines when the path is chosen but she is a cat or the great root-kin this Coil. */
const SIS_TALK_BOND = [
    `Yuki corners you by the water. For a cat this means sitting down in the middle of the path and looking at you until you stop pretending there's a way round. She only does it for things she considers important. Today, that's your love life.

*Mei Lin,* says the bond, *brought chopsticks into the Blackroot. For you. She doesn't say it's for you. She's been eating with them very slowly next to you for three days.* Her tail hits the ground, once. *And Ya bit off a wolf's tooth and gave it to you. Do you know what that means where she's from?*

"I'm choosing not to ask."

*It means you're an idiot. Universally. Go and sit next to one of them. Either. Both. I don't care. Your face is depressing me.*`,
    `*Grade,* says the bond. Yuki is sitting on a root with her ears very upright. *Your conversation with Mei Lin at the fire. I'd give it a four. Out of ten. You made a joke about spore prints. She laughed, which is the only reason it's not a two.*

"I thought it went well."

*It went well because she likes you. Not because of the spore prints. Never again the spore prints.* She considers, tail tip moving. *Ya you're doing better with. Ya likes being insulted. You're good at that. Keep insulting Ya.*`,
    `Yuki doesn't say anything this time, not even through the bond. She just sits down against you at the edge of the camp and leans, with everything she has, until you lean back.

*You're happier,* says the bond eventually. *Than at home. Than in the lab. Since them.* A small, dry pause. *Don't ruin it. I'm watching.*`,
];
const SIS_TALK_BOND_GREAT = `Yuki corners you by the water. In her great shape this takes no effort at all: she lies down across the path, and the path is over. She only does it for things she considers important. Today, that's your love life.

*Mei Lin,* says the bond, *brought chopsticks into the Blackroot. For you. She doesn't say it's for you. She's been eating with them very slowly next to you for three days.* A paw the size of a plate comes down on your boot and stays there. *And Ya bit off a wolf's tooth and gave it to you. Do you know what that means where she's from?*

"I'm choosing not to ask."

*It means you're an idiot. Universally. Go and sit next to one of them. Either. Both. I don't care. Your face is depressing me.*`; // RL1 (NT): Fable's ALT B
/** Mei Lin will share a bed with more than James: Ya wore her down (trio ≥ 3) or Yuki did (yk_mei ≥ 2). */
export const meiOpen = (g) => trio(g) >= 3 || (g.flags.yk_mei || 0) >= 2;
const back = (g) => g.flags.yk_back || g.flags.yuki_return || 'stream';

const SCENES_YK = {
    yk_choice: {
        id: 'yk_choice', title: 'The Last Fire', art: 'yuki_human', place: 'The Long Forest',
        enter: (g) => { g.yuki.form = 'human'; return []; },
        text: `The last night before you walk out of the Long Forest, Yuki sits across the fire from you in her human shape, knees drawn up, white hair pooled on the moss, and watches you for a long time without saying anything. That's normal. The bit where she does it with a face is new.

"I've been thinking," she says.

"Should I be worried?"

"Always." She pokes the fire with a stick, which she does not need to do and does because she has hands now and enjoys them. "We were born the same morning, in the same grove. You were the size of a loaf of bread and I was the size of your fist, and the bond took before either of us could see. I've slept on you for forty years. I know what you look like when you lie, and when you're scared, and when you're pretending a lecture is going well." Gold eyes, level. "I'm not a kitten any more, James. I haven't been for a very long time. And now I have *this*." She lifts one hand, turns it in the firelight. "So I'm asking. Once. Out loud, because the bond makes it too easy to not say things."

She takes a breath.

"What am I to you? Family — the annoying sister who steals your blanket and tells your girlfriends embarrassing stories? Or more?" A small, dry tilt of her head. "Either is fine. I mean that. I'm not going anywhere either way. And if it's more —" the corner of her mouth goes up — "I don't need to be the only one. I'm a cat. I share a sunbeam with whoever's in it, as long as I get the best spot."`,
        choices: [
            { text: '"Family. You\'re my sister, Yuki. You always have been."', do: (g) => { g.flags.yk_path = 'sister'; return []; }, to: 'yk_sister' },
            { text: '"More." Reach across the fire for her hand.', do: (g) => { g.flags.yk_path = 'lover'; return []; }, to: 'yk_lover' },
        ],
    },
    yk_sister: {
        id: 'yk_sister', title: 'Family', art: 'yuki_human', place: 'The Long Forest',
        text: `Yuki looks at you for a long second. Then she nods, once, the way a cat settles a matter, and something in her shoulders comes down an inch.

"Good," she says. "Sister. I'm keeping the blanket."

"You were always keeping the blanket."

"Now it's official." She stands, walks round the fire, and drops down beside you, shoulder to shoulder, and bumps her head against yours exactly the way she did when she was a cat, which you suppose she still is. "Rules. One: I get to be horrible about every woman you look at. Two: if any of them hurts you, I eat them. Three —" she holds up a finger — "you are forty, you are lonely, and you are hopeless. The next pretty woman who doesn't run screaming from your lab coat, you are going to *talk* to her. I will be supervising."

"That's not a rule, that's a threat."

"Sisters," says Yuki, with enormous satisfaction, "are allowed both."`,
        choices: [{ text: 'Sleep. Tomorrow, the smoke.', do: (g) => { bumpRel(g, 'Yuki', 0, 0); g.yuki.form = 'cat'; return ['Yuki: your sister. Back in her small form, on your chest, purring like a smug engine.']; }, to: back }],
    },
    yk_lover: {
        id: 'yk_lover', title: 'More', art: 'yuki_human', place: 'The Long Forest',
        text: `Her hand is warm. You don't know why that surprises you. Forty years of her sleeping on your chest and you never thought about her hands.

"Oh," says Yuki, very quietly, and for once she doesn't have anything dry to follow it with.

She comes round the fire on her knees, slowly, giving you every chance to laugh it off. You don't. She stops close enough that her hair falls over your arm, and her ears go flat and then forward, and her tail curls once around your ankle like a question.

"I'm going to kiss you," she says. "I've been thinking about how for a while. I have notes."

"Of course you have notes."

The notes, it turns out, are good. She kisses like she does everything else: unhurried, certain, and entirely on her own terms, and when you pull her into your lap she makes a low sound you've felt through the bond a thousand times and never once heard with your ears. Her dress was the bond's idea. It is the bond's idea, a few minutes later, to stop being a dress.

The fire burns down. Nobody tends it.

*

Toward dawn she is asleep on your chest, which is the most familiar thing in the world, except that she has a face pressed into your neck and an arm thrown over you and is snoring very slightly. Through the bond, half asleep: *I told you I'd get the best spot.*`,
        choices: [{ text: 'Let her sleep. Tomorrow, the smoke.', do: (g) => { bumpRel(g, 'Yuki', 0, 0); g.flags.yk_kissed = true; return ['Yuki: your lover. She stays human until the treeline, holding your hand, and then flows back into a cat on your shoulder. "Nobody needs to know yet," she says, before she does. "I like being underestimated."']; }, to: back }],
    },

    /* ---------- Act 1 camps ---------- */
    yk_camp: {
        id: 'yk_camp', title: 'Past the Firelight', art: 'yuki_human', place: (g) => g.location,
        enter: (g) => { markDaily(g, 'yk_camp'); g.flags.yk_nights = (g.flags.yk_nights || 0) + 1; bumpRel(g, 'Yuki', 2, 4); if (likesMei(g)) g.flags.yk_mei = (g.flags.yk_mei || 0) + 1; return []; },
        text: (g) => {
            const n = g.flags.yk_nights || 1;
            const first = n === 1
                ? `You walk out past the firelight, and a white cat pads after you, and somewhere between one root and the next she stops being a cat. Yuki falls into step beside you, barefoot on the bark, and takes your hand as though she's done it all her life.

"They're going to notice," you say.

"Ya noticed the day she met me. She sniffed me and grinned like a wolf." Yuki tilts her head back at the fire. "Mei Lin hasn't. Mei Lin is going to have an extremely interesting morning."

She pulls you down into the dark between two great roots, and for a while the Blackroot is very far away.`
                : n === 2
                    ? `The second time, Yuki doesn't bother with the walk. She simply turns human in your bedroll, which is efficient and also cold, because her feet are freezing, and she puts both of them on you with great deliberation.

"Penance," she says. "For the lab coat. All of it. Every year of it."

Then she stops talking for a long time.`
                    : `It has become a thing: the fire burns low, the cat goes out into the dark, and a little later so do you. Ya has started whistling when you get up. Mei Lin has started pretending to be asleep, badly.

Yuki is laughing against your shoulder about it, low and dry, when she stops laughing.`;
            const mei = likesMei(g)
                ? ((g.flags.yk_mei || 0) === 1
                    ? `\n\n*

In the morning Mei Lin looks at you, and at the white cat on your shoulder, and at the long white hair on your collar, and goes red to the ears, and says nothing at all with tremendous force. Later, at the stream, you see Yuki — human, and very deliberately so — sitting beside her on a rock, talking quietly. Mei Lin's back is very straight. She does not leave.`
                    : `\n\n*

In the morning Mei Lin and Yuki walk ahead of you on the path, side by side, heads together. At one point Mei Lin laughs — the forbidden laugh, the one Ashfall trained out of her — and claps a hand over her mouth, and Yuki looks back over her shoulder at you with an expression of pure feline triumph. Ya, beside you, says, "Your cat is better at this than I am," and sounds thrilled about it.`)
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
                `Yuki corners you by the water, in her human form, which she only uses for things she considers important. Today, that's your love life.

"Mei Lin," she says, "brought chopsticks into the Blackroot. For you. She doesn't say it's for you. She's been eating with them very slowly next to you for three days." She folds her arms. "And Ya bit off a wolf's tooth and *gave it to you*. Do you know what that means where she's from?"

"I'm choosing not to ask."

"It means you're an idiot," says Yuki. "Universally. Go and sit next to one of them. Either. Both. I don't care. Your face is depressing me."`,
                `"Grade," says Yuki, sitting on a root with her ears very upright. "Your conversation with Mei Lin at the fire. I'd give it a four. Out of ten. You made a joke about spore prints. She *laughed*, which is the only reason it's not a two."

"I thought it went well."

"It went well because she likes you. Not because of the spore prints. Never again the spore prints." She considers. "Ya you're doing better with. Ya likes being insulted. You're good at that. Keep insulting Ya."`,
                `Yuki doesn't say anything this time. She just sits down next to you at the edge of the camp, human, shoulder to shoulder, and leans on you until you lean back.

"You're happier," she says eventually. "Than at home. Than in the lab. Since them." A small, dry pause. "Don't ruin it. I'm watching."`,
            ];
            if (!ykHuman(g) && n <= 1 && yukiForm(g) === 'tiger') return SIS_TALK_BOND_GREAT; // RL1 (NT): Fable's ALT B for the great root-kin
            return (ykHuman(g) ? lines : SIS_TALK_BOND)[Math.min(n, 3) - 1]; // v0.11.122 (LG1, YV)
        },
        choices: [{ text: 'Go and sit with them. As instructed.', time: 30, to: 'bl_camp' }],
    },

    /* ---------- the last night of Act 1 ---------- */
    yk_night_solo: {
        id: 'yk_night_solo', title: 'Just Her', art: 'yuki_human', place: 'Ashfall — the grove',
        enter: (g) => { g.flags.final_night = 'yuki'; bumpRel(g, 'Yuki', 0, 10); return []; },
        text: `You go out to the grove, and the white cat goes with you, and inside the ring of white trunks the cat is a woman, and the woman is Yuki.

"Tomorrow a very old man comes to try to take you," she says, lying back in the moss with her hair everywhere and the grove's song humming in the trunks around you. "I want to point out that I bit a wolf in half for you once. I'll do worse to him."

"I know."

"Good." She pulls you down. "Then stop thinking about him."

The grove sings. You stop thinking about him.

*

Toward dawn she is on your chest in her small shape, purring, as if nothing ever happened, and then — just for a second, as the light comes up — she isn't, and she kisses you once, and says, "Go and win," and is a cat again before you can answer.`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    yk_night_mei: {
        id: 'yk_night_mei', title: 'The Herb Loft, and the Cat', art: 'roof', place: 'Ashfall — the herb loft',
        enter: (g) => { g.flags.final_night = 'yuki_mei'; g.flags.romance = true; bumpRel(g, 'Mei Lin', 5, 12); bumpRel(g, 'Yuki', 0, 8); return []; },
        text: `Mei Lin climbs the ladder to the loft ahead of you, and a white cat climbs it ahead of her, and at the top there is no cat.

Mei Lin stops on the last rung. Yuki is sitting in the hay in her human shape, ears forward, perfectly composed, as if she has been waiting for an appointment.

"I've been talking to her," Yuki says to you. "For days. You weren't invited."

"In Ashfall," Mei Lin says, very low, "a woman who—"

"In Ashfall," says Yuki, "they think I'm a cat." She holds out a hand. "I'm not asking you to be shameless. I'm asking you to be honest. You've been honest with me all week. Be honest with him."

Mei Lin looks at Yuki's hand for a long moment. Then she laughs — the laugh, the one that got her into trouble her whole life — and takes it, and climbs the last rung.

It is, you discover, possible for two women to agree on absolutely everything about you, at length, in detail, and out loud. Your Parallel Cognition files nine separate complaints and then gives up. The lamp goes out. Nobody relights it.`,
        choices: [{ text: 'A few hours. Then the Elder.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    yk_night_ya: {
        id: 'yk_night_ya', title: 'Two Predators', art: 'grove_sprout', place: 'Ashfall — the grove',
        enter: (g) => { g.flags.final_night = 'yuki_ya'; g.flags.ya_romance = true; bumpRel(g, 'Ya', 5, 12); bumpRel(g, 'Yuki', 0, 8); return []; },
        text: `Ya is waiting in the grove. So, it turns out, is Yuki: human, sitting cross-legged in the moss opposite the huntress, the two of them regarding each other with the calm, total attention of two large predators who have decided not to fight over the kill.

"Your cat," Ya says, without looking round, "is a woman."

"I know."

"I knew the first day. She smelled wrong. Good wrong." Ya grins, all teeth. "She says she gets the best spot."

"She always gets the best spot."

"We'll see," says Ya, and Yuki's ears go flat with delight, and that is the last coherent conversation anyone has in the grove for some time. Ya bites. Yuki, it turns out, bites back. You are, at several points, mostly furniture, and you have never been happier about anything.

*

Toward dawn you wake in the moss with Ya sprawled across your legs, snoring, and a white cat curled in the small of her back, purring, and the grove singing over all three of you.`,
        choices: [{ text: 'Dawn.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
    yk_night_all: {
        id: 'yk_night_all', title: 'Four', art: 'trio', place: 'Ashfall — the herb loft',
        enter: (g) => { g.flags.final_night = 'all'; g.flags.throuple = true; g.flags.romance = true; g.flags.ya_romance = true; bumpRel(g, 'Mei Lin', 6, 15); bumpRel(g, 'Ya', 6, 15); bumpRel(g, 'Yuki', 0, 10); return []; },
        text: `"Right," says Ya, standing up from the table. "I'm tired of this."

"So am I," says Yuki, and stands up too, in her human shape, which makes Mei Lin's mother — on her way to bed — stop dead on the stairs, look at the white-haired woman with cat's ears at her table for a long, grave moment, and then continue up the stairs without a word, which in Ashfall is roughly a blessing.

Ya points at Mei Lin. "You want him." She points at you. "You want her." She points at Yuki. "She wants everybody, she's a cat." She shrugs. "And everybody wants me, because I'm wonderful."

"I have spoken to her for a week," Yuki says to Mei Lin, quieter. "Every night. You know what I'm going to say."

Mei Lin looks at the three of you — the scholar, the huntress, the cat — and her face goes through pride, and fury, and fear, and then something else entirely.

"Build something else," she says. "That's what you told me." She stands up. "Fine. The loft. And if my mother hears one sound—"

"Liar," say Ya and Yuki, at the same time, and look at each other, and grin.

Up in the loft it smells of mint and hay. Everyone has opinions. Nobody is shy about them. Somewhere in the middle of it your Parallel Cognition gives up entirely, and for the first time in your life all nine threads are thinking about exactly the same thing.

*

Toward dawn: Mei Lin's head on your chest; Ya across both of you like a fallen tree; and a white cat on top of the whole pile, as high as she can get, purring like an engine. *Best spot,* says the bond.`,
        choices: [{ text: 'A few more hours. Then the Elder.', do: (g) => { sleepUntil(g, 6); return ['Slept until 06:00. HP and Qi full.']; }, to: 'rt_elder' }],
    },
};

/** Act 1 epilogue line for every arrangement. */
export function loveLine(g) {
    const f = g.flags.final_night;
    const lover = ykLover(g) && ykHuman(g); // v0.11.122 (LG1, YG): the lover lines have her human
    const sis = ykSister(g) ? ' Yuki, your sister, has appointed herself head of the household and grades everybody\'s cooking out loud.' : '';
    if (f === 'all') return 'At night the four of you sleep in the herb loft, a tangle of limbs and hair, with a white cat on top of the pile. Mei Lin\'s mother sets five places at the table now — four and a saucer, out of habit, though the saucer is mostly ceremonial. Ya still goes out to the grove some nights. More and more often, everyone goes with her.';
    if (f === 'yuki_mei') return 'Mei Lin and Yuki have become a conspiracy. You are the subject of it. Most nights the herb loft holds three of you, and Mei Lin\'s mother has stopped asking why the cat needs a pillow.';
    if (f === 'yuki_ya') return 'Ya sleeps in the grove most nights, and most nights you and Yuki sleep there too, the huntress and the cat arguing about the best spot until they both win. The village has given up pretending not to notice.';
    if (f === 'yuki') return 'Most nights you sleep in the grove, and most nights the cat who curls up on your chest is, for a little while after the lamps go out, not a cat at all. The village thinks you\'re a lonely man with a cat. Yuki likes being underestimated.';
    if (g.flags.throuple) return 'At night the three of you sleep in the herb loft, a tangle of limbs and hair and one aggrieved cat.' + (lover ? ' Some nights the cat isn\'t a cat, and nobody minds.' : sis) + ' Mei Lin\'s mother has stopped saying anything about it, which in Ashfall is roughly the same as a blessing.';
    if (g.flags.ya_romance && !g.flags.romance) return 'Ya sleeps in the grove most nights, and most nights you sleep there too. The village has given up pretending not to notice.' + (lover ? ' Neither has Yuki, who has started sleeping there too.' : sis);
    if (g.flags.romance) return 'Mei Lin\'s mother sets four places at the table now: three and a saucer. She has stopped asking when you\'ll leave.' + (lover ? ' Yuki has started having very quiet conversations with Mei Lin by the well.' : sis);
    return lover ? 'You sleep by the stove with Yuki, in whatever shape she feels like. It\'s enough. It is, honestly, a great deal more than enough.' : ykSister(g) ? 'You sleep by the stove with Yuki on your chest. She says you\'re hopeless. She says it fondly. It\'s enough, for now.' : 'You sleep by the stove with Yuki. It\'s enough. For now, it\'s enough.';
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
        ? 'Yuki walks the first mile beside you in her human shape, then turns into a cat on your shoulder at the treeline. *If the first woman we meet is pretty,* says the bond, *I am telling her about the lab coat. All of it.*'
        : ykLover(g) ? 'Yuki holds your hand to the treeline. Then she\'s a cat on your shoulder again, tail curled round your neck, purring like she owns you. Which, you reflect, is fair.' : ''));
    beat(SCENES, 'mei_lin', (g) => (ykSister(g)
        ? '*She\'s pretty,* says the bond, appallingly loud inside your skull. *Bossy. You like bossy. Don\'t deny it, I\'ve met your thesis supervisor. Talk to her. TALK to her.*'
        : ykLover(g) ? '*She\'s pretty,* says the bond, appraising, unbothered. *I approve. Of her. Not of your face right now.*' : ''));
    beat(SCENES, 'romance', (g) => (ykSister(g)
        ? 'Through the bond, from somewhere very far away and getting farther: *I am moving to the roof. I am living on the roof now. Do not look for me.*'
        : ykLover(g) ? 'Through the bond, sleepy and amused from the stove downstairs: *Told you. I share. Tell her about me later.* A pause. *Much later.*' : ''));
    beat(SCENES, 'epilogue', (g) => (ykSister(g) ? 'Yuki, on your chest, opens one gold eye. *Not bad,* says the bond. *For a mycologist.*' : ykLover(g) && ykHuman(g) ? 'Yuki, on your chest, purrs. Just for a moment, in the dark, her hand is in yours instead of a paw.' : ''));
    beat(SCENES, 'ya_meets', (g) => (ykPath(g)
        ? `Ya sniffs the air near your shoulder, frowns, sniffs again, and looks straight at the white cat. "That," she says, "isn't a cat." Yuki looks back at her with enormous calm. ${ykLover(g) ? 'Through the bond: *I like her. She can stay. She can maybe even share the spot.*' : 'Through the bond: *I like her. She\'s rude. Marry her.*'}`
        : ''));
    beat(SCENES, 'log_comfort', (g) => (ykPath(g) && !ykHuman(g) // v0.11.122 (LG1, YV; Fable's A4)
        ? `And Yuki: her forehead pushed hard against your temple, the way she has done since before either of you could see, and a purr going through you that you feel in your teeth. The bond is quiet. ${ykLover(g) ? 'She doesn\'t need to say anything.' : 'Sisters don\'t need to say anything.'}`
        : ykPath(g)
        ? `And Yuki: not on your shoulder but beside you, human, her forehead against your temple, her arm round your back. She doesn't say anything. ${ykLover(g) ? 'She doesn\'t need to.' : 'Sisters don\'t need to.'}`
        : ''));
    beat(SCENES, 'rt_camp', (g) => (!ykHuman(g) ? '' // v0.11.122 (LG1, YG): both lines have her human (the sister's needs hands)
        : ykLover(g)
        ? 'Later, when the others are asleep, the warmest lap is yours, and the cat in it isn\'t a cat, and nobody mentions it in the morning.'
        : ykSister(g) ? 'Yuki, in the firelight, catches your eye and makes a small, filthy gesture at the two women, and then at you, and then goes to sleep looking very pleased with herself.' : ''));

    // camp choices in the Blackroot
    SCENES.bl_camp.choices.splice(SCENES.bl_camp.choices.length - 1, 0,
        { text: 'Walk out past the firelight. The cat follows.', show: (g) => ykLover(g) && ykHuman(g) && daily('yk_camp')(g), to: 'yk_camp' }, // v0.11.122 (LG1, YG)
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
        { text: 'Climb to the loft with Mei Lin. The cat is already up there.', show: (g) => ykLover(g) && ykHuman(g) && likesMei(g) && meiOpen(g), to: 'yk_night_mei' },
        { text: 'Follow Ya to the grove. Yuki follows you.', show: (g) => ykLover(g) && ykHuman(g) && likesYa(g), to: 'yk_night_ya' },
        { text: 'All of you. Let Ya and Yuki say it.', show: (g) => ykLover(g) && ykHuman(g) && likesMei(g) && likesYa(g) && (trioReady(g) || meiOpen(g)), to: 'yk_night_all' });
    for (const [id, f] of [['rt_trio_night', 'trio'], ['rt_mei_night', 'mei'], ['rt_ya_night', 'ya'], ['rt_quiet_night', 'none']]) {
        const s = SCENES[id];
        const e = s.enter;
        s.enter = (g) => { g.flags.final_night = f; return e ? e(g) : []; };
    }
    beat(SCENES, 'rt_evening', (g) => (ykLover(g) && !ykHuman(g) ? '' // v0.11.122 (LG1, YG): it invites the nights with her, which need her human
        : ykLover(g)
        ? `Yuki is on the stove in her small shape, watching you all with half-closed gold eyes. ${likesMei(g) || likesYa(g) ? 'Through the bond: *Your call. Any of it. All of it. I told you: I share a sunbeam.*' : 'Through the bond: *The grove is singing. Come and listen.*'}`
        : ykSister(g) ? `Yuki, on the stove, cracks one eye. *If you sleep alone tonight,* says the bond, *I am disowning you.*` : ''));
    beat(SCENES, 'rt_quiet_night', (g) => (ykSister(g) ? 'Yuki, on your chest, mutters: *Disowned.* She doesn\'t move.' : ''));
}

