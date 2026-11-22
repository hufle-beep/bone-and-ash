/**
 * v0.11.251 (owner pick P21-E, TX): the tribute's texts, Fable's (rule 10; runs T and W, `project/research/p21-drafts-*.txt`).
 * The lost tribute takes James to the Sect (the Coil ends there); Lu Han's net holds Yuki for the whole fight; he reads a realm
 * above Foundation by eye (lore: no local can sense James); a disciple takes Gao Feng's place; after a won fight, three ways:
 * send him home (the old win texts' speech, moved word for word to `collectors_sent`), the bluff, the pin. Claude's cuts (PG):
 * "she says through the bond" → "the bond reports", "close into a crown" → "stand in a crown", "the patience of" → "the calm of".
 * v0.11.251 (owner pick RV-A; Fable's run R, `p21-drafts-r.txt`): the net after the draw (all three forms), Gao out, the Coil screen's
 * last line, the title, the degree-3 sentences, Act 1's two paid texts; Claude's cut: letterPaid keeps the old sentence after {OnElder}.
 */
import { byForm } from './common.js';
export const TT = {
    disciple: "Crimson Lotus outer disciple",
    net: {
        cat: "Lu Han's sword stays level. It is his free hand that moves: a net of grey spirit-cord leaves his sleeve, plucks Yuki off your shoulder and pins her to the dust, weighted at every knot. *Rude,* the bond reports. *Manage without me.*",
        great: "The drawn sword does not move. Lu Han shakes out his other sleeve, and a spirit-beast net lands across Yuki's back and drags her down by its own weight. *Made for bigger game than me,* she remarks, in your head. *Insulting, and effective.*",
        woman: "With the sword held clear in one hand, Lu Han empties his other sleeve at Yuki: a spirit-beast net, which settles on her from hair to hem and draws shut. \"I see,\" she says, sitting down in it. \"You're on your own, then.\"",
    },
    netFree: {
        cat: "With its owner down the net's knots go slack, and Yuki walks out and sits washing, as though the dust were her idea.",
        great: "The net loses its weight when Lu Han loses his footing, and Yuki stands up through it and shakes off the cord.",
        woman: "The net falls open as Lu Han falls, and Yuki steps out of it, straightens her collar and says, \"Finished? Good.\"",
    },
    read: "His sense still finds nothing in you. His eyes are better trained: they go to where your weight rests, to how little of you moves when you turn, and he stops measuring his strength for a mortal. The courtesy stays; the gentleness goes.",
    /** `collectors_lost`, with {yuki} for her passage by form */
    lost: "The ground comes up and keeps you. Lu Han stands over you with his sword already lowered, and his still face holds an honest regret, the regret of a carpenter over good timber split wrong.\n\n\"I said you would be carried,\" he says. \"It gives me no pleasure to be correct. Bind him with care. He is the Sect Master's now, and so is every bruise on him.\"\n\nHis disciples are thorough. Cord at your wrists, cord at your ankles, a carrying pole through both, and you go up between two crimson backs like a boar that argued. You reach for bone and nothing in you answers.\n\n{yuki}\n\nAshfall watches from beside its baskets. Old Wen lowers his one good eye. Mei Lin does not lower hers, and her mother's hand is shut on her sleeve.\n\nLu Han bows to the elder, to the correct depth. Then the pole lifts, and the road to the Sect starts passing under your back, grey and uphill, with Ashfall shrinking beyond your feet.",
    lostYuki: {
        cat: "They bring Yuki as she lies, the net gathered shut round her into a bundle that one disciple carries at arm's length. *I am keeping a list,* she tells you. *He is on it in several places.*",
        great: "Two of them haul Yuki after you in the net, which cuts a furrow in the road behind her. *I could walk,* comes down the bond, *if anyone here were worth asking.*",
        woman: "Yuki is marched behind the pole with the net still drawn tight over her head and arms, a disciple holding its cord at a respectful distance. \"Mind the hair,\" she says to him, and he does.",
    },
    /** the Coil screen's opening after a lost tribute (coil_scenes.js WHY.tribute) */
    coil: "A sect's road is well kept. You have leisure to notice it from the pole, along with the grave care the men carrying you take over every rut, since their master is owed you undamaged. Somewhere ahead is a table, and a knife, and an old man's interest.\n\nYou do not mean to meet any of the three. You close your teeth on it, and nobody was ever carried anywhere.",
    /** STOMP collectors win[2]: the disciples' sentence, Yuki under the net */
    win2Disciples: "His three disciples stand with blades half drawn, consult one another without a word, and conclude that their duty lies anywhere else.",
    /** RV-A (W2): Gao Feng out of the fight, so the disciple in his place fought and lost (win[2]'s sentence and its road clause, win[3]'s clause) */
    win2Out: "The disciple who stepped in beside him already sits in the dust holding his wrist, and the two still on their feet look at him, then at the road, and choose the road.",
    win2RoadOut: "and his disciples are far along the road, two of them running and one doing his best",
    win3Out: "while the disciple you had already put down gets up for the sole purpose of leaving, and the other two drop their weapons and go with him",
    /** RV-A (SM): collectors_lost's title; after win[3] (Lu Han on the ground, both arms hurt) the bluff's and the pin's sentences */
    titleLost: "Carried",
    bluffOpen3: "Lu Han sits alone in the dust with his sword in two pieces beside him, his disciples gone, and you do not send him anywhere.",
    bluffBow3: "He bows where he sits, over two arms that will not help him: not deep, exactly deep enough.",
    paidOpen3: "Lu Han has not got up from the dust when you begin to sing,",
    /** RV-A (HL): Act 1's opening and Lu Han's visit after the pin, when he was beaten first (lu_won) */
    openingPaid: "Lu Han comes back alone.\n\nNo collectors, no banners, no gong. Only the inner disciple in his deep-red robe, coming down the road at first light at the pace of a man on his way to visit a grave. He holds himself upright, as a man does while bending is still a decision. Doors close ahead of him, very softly, one after another.\n\nHe stops at Mei Lin's house, where you are sitting on the step with a bowl of gruel and Yuki. He studies you until the gruel has gone cold. Then, unasked, he sits down on the step beside you, which in this world is roughly equivalent to undressing in the street.\n\n\"The hairpin,\" he says. \"I have not slept since you made it.\"",
    letterPaid: "\"It is not bone,\" Lu Han says, low. \"Not any bone I know. You beat me; that I can account for. This I cannot. With it in my hand my Qi goes *quiet*. Clean, like a window someone has wiped.\" He turns his palms up and looks into them. \"They fed me grass from the age of six. Pills from twelve. I had never been clean, not for one breath of my life, until I held your hairpin.\"\n\nThere is no threat anywhere in him. That is the frightening part.\n\n\"I surrendered it to the Outer Hall,\" he says. \"I was bound to. Outer Elder Shen Qiu lifted it from my hands himself. {OnElder} he comes here, to ask where such a thing comes from.\" He lets a breath go by. \"He will not ask as I am asking.\"\n\nHe rises, bows lower than any stranger is owed, and goes back up the road by himself.",
    labels: {
        send: "Step back. Send him home.",
        bluff: "Bluff: let him believe he lost to a hidden sect's senior. Let the bone show.",
        pin: "Pay anyway: sing a flawless wraithbone hairpin, and leave the Sect no debt to come back for.",
    },
    sentTitle: "Neighbour",
    bluffWin: "Lu Han kneels alone in the dust, his disciples gone, and you do not send him anywhere. You step back and let white bone lift out of the earth about the tribute post and stand in a crown, slow, silent, more beautiful than it needs to be. You let the Qi in it reach him: clean, utterly clean, without a grain of the death in everything he has ever eaten. Of its maker his senses still report nothing, and a Foundation disciple knows the one polite reason why they wouldn't.\n\nThe still face mends as he does the sum. No mortal put him on his knees, because no mortal can. It follows that none did.\n\nHe bows from where he kneels: not deep, exactly deep enough. \"This one failed to recognise a senior, and has been corrected,\" he says. \"The Crimson Lotus asks no tribute of Ashfall this season. My master will wish to… extend an invitation.\"\n\n\"I'll check my calendar.\"\n\nHe rises and goes without hurry, as a man leaves a lesson. Far down the road one figure in crimson has stopped to wait for him, and looks back once. The look does not mean *goodbye*.",
    paid: "Lu Han is still on his knees when you begin to sing, and it takes everything the fight left you: a hairpin the length of your hand, white as moonlight, its leaves turned so fine that the sun comes through them. You have never made anything better. You hold it out to the man you have just beaten as if settling a bill.\n\nHe looks at the pin, then at the baskets, then at you, and understands what he is being handed. A disciple thrown out of a village carries home a grievance. A disciple carrying this has only a report to make.\n\n\"Ashfall's tribute is paid,\" he says, and has to start over to get his voice level. \"In full. For three years.\" You slip the pin inside his robe, over his heart, and he lets you. \"Whoever you are, Bone-Maker, the Sect will hear of this. This one will see that it hears it from me.\"\n\nThe baskets stay where they stand. Nobody in crimson is in any state to touch one.",
    failBluff: "The crown rises crooked, and Lu Han watches it with the calm of a man already beaten. \"A trick of bone,\" he says. \"It has cost me enough. It will not also have my respect.\" He is going regardless.",
    failPin: "The song catches on a spent breath, and the pin arrives in two halves, neither of them flawless. Lu Han regards them politely. Ashfall pays nothing, then. Beaten is beaten, though, and he will leave without it.",
};
/** v0.11.251 (MT): the net comes off Yuki on the won screen. */
export const netFree = (g) => byForm(g, TT.netFree.cat, TT.netFree.great, TT.netFree.woman);
/** v0.11.251 (RV-A, XO): the won screen with the net-off line, unless the fight was ended in one move (no net was thrown: `lu_one`). */
export const withNetFree = (g, t) => (g.flags.lu_one ? t : `${t}\n\n${netFree(g)}`);
/** v0.11.251 (RV-A, SM): bluff_win and tribute_paid after the most lopsided win (lu_won 3: Lu Han on the ground, not on his knees). */
export const bluffWinText = (g) => (g.flags.lu_won === 3 ? TT.bluffWin.replace('Lu Han kneels alone in the dust, his disciples gone, and you do not send him anywhere.', TT.bluffOpen3).replace('He bows from where he kneels: not deep, exactly deep enough.', TT.bluffBow3) : TT.bluffWin);
export const paidText = (g) => (g.flags.lu_won === 3 ? TT.paid.replace('Lu Han is still on his knees when you begin to sing,', TT.paidOpen3) : TT.paid);
