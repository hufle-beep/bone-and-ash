// Run: node tests/archive.test.mjs — v0.11.287 (owner pick P55-A: CM-5 + IN-13 + AR-t + SV): the Archive (js/core/archive.js).
// A the Coil marks (CM-5): Fed's drain with the marks (awake, a card's extra untouched, asleep half), set by the arcs' scenes from the
// game's start (not only after a won Act 1), the Blackroot's regions, not by a rewind's own first scene, kept by every rewind; the Fed
// bar's lines. B the Insights (IN-13): 13, each with its words, the Coil remembers the three new ones, the view shows found ones (kept
// or this Coil's). C the endings (`stats.ends`) and the old save's fill (SV, game.js archiveFill). D foes met: every fight named.
// E the tab's wiring (read as text: index.html, main.js, sw.js, the CSS, the key). F the FAQ and What's new.
// H (v0.11.288, owner pick P56-A: MP + WH-n + LV-15 + UI-p + SV): Insights' power: the mapping, from the next Coil (the rewind, not
// endCoil; "Not yet" keeps none), each kind's hook (a foe's blow, a sit, Fed with the marks' cap, skill XP), the Archive, the Fed bar,
// the Coil screen, the FAQ and What's new.
// P (v0.11.289, owner pick P57-A: DL + FT + MM-k + LH): the deadline line (prologue and Act 1, its progress, where it shows none),
// feats (12, no power; the Coil each came on, an old save's fill 0, kept by the rewind, noted on a scene entered), limits (7, the
// FAQ's "Limits you have hit" with the game's numbers), memories (the keys, one memory a tap, the words as shown, none for an old
// save, kept by the rewind), the Archive's two sections and main.js's wiring (read as text).
// Mutation: tools/mutate.mjs on archive.js and game.js's marks.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES } from '../js/story/prologue.js';
import * as G from '../js/core/game.js';
import * as A from '../js/core/archive.js';
import * as CAL from '../js/core/calendar.js'; // v0.11.289 (P57-A, DL)
import { ARCS, ARC_AT } from '../js/core/threads.js';
import { rewind, endCoil, REMEMBER, KNOW_TEXT, KEEP_FLAGS, coilReport, remember } from '../js/core/coil.js';
import { goTo, enterHook, choose, sceneView } from '../js/core/story.js';
import { landParts } from '../js/core/replies.js'; // v0.11.289 (P57 review, TG3)
import { tabWhy } from '../js/core/coil.js';
import * as T from '../js/core/tasks.js';
import { NO_DICE_TUNE } from '../js/story/nodice_tune.js';
import { FIGHTS as LF_FIGHTS } from '../js/story/longforest.js';
import { rootGain, ROOT_SAT } from '../js/story/act1_blackroot.js'; // v0.11.288 (P56 review, M1-u)
import { FAQ } from '../js/core/faq.js';
const faqText = (q, g) => FAQ.find(([x]) => x === q)[1](g);
import { NOTES } from '../js/core/news.js';
import { FED_EXTRA_PER_HOUR } from '../js/core/tasks.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };
const near = (a, b) => Math.abs(a - b) < 1e-9;
const game = (seed = 5) => G.newGame(seed, { closed: true });

// A: the Coil marks
{
    assert(G.MARK_DRAIN === 0.05 && G.MARK_COUNT === 9 && ARCS.length === 9, 'A: −5% a mark, 9 marks, 9 arcs');
    const g = game();
    assert(g.stats.marks === 0 && Array.isArray(g.stats.ends) && g.stats.ends.length === 0, 'A: a new game: no marks, no endings');
    assert(G.marksHeld(g) === 0 && near(G.fedPerHour(g), 3), 'A: no marks: Fed 3 an hour');
    g.stats.marks = 0b101; assert(G.marksHeld(g) === 2 && near(G.fedPerHour(g), 2.7), 'A: 2 marks: 2.7 an hour');
    g.stats.marks = 511; assert(G.marksHeld(g) === 9 && near(G.fedPerHour(g), 1.65), 'A: all 9: 1.65 an hour (−45%)');
    g.stats.marks = 4095; assert(G.marksHeld(g) === 9, 'A: bits past the 9th are not marks');
    g.stats.marks = 'junk'; assert(G.marksHeld(g) === 0 && near(G.fedPerHour(g), 3), 'A: junk reads as no marks');
    // awake: advance
    const a = game(); a.stats.marks = 511; a.james.satiety = 80; G.advance(a, 60);
    const b = game(); b.james.satiety = 80; G.advance(b, 60);
    assert(near(80 - a.james.satiety, 1.65) && near(80 - b.james.satiety, 3), `A: an hour awake: −1.65 with 9 marks, −3 without (${(80 - a.james.satiety).toFixed(3)}, ${(80 - b.james.satiety).toFixed(3)})`);
    // starving: the minutes past empty counted at the marked rate
    const s = game(); s.stats.marks = 511; s.james.satiety = 1.65 / 2; s.james.hp = 50; G.advance(s, 60);
    assert(s.james.satiety === 0 && near(s.starveCarry, 30), `A: Fed for half an hour at the marked rate: 30 starving minutes (${s.starveCarry.toFixed(3)})`);
    // asleep: sleepUntil and nightTo, half the marked rate
    const n = game(); n.stats.marks = 511; n.minutes = 22 * 60; n.james.satiety = 80; G.sleepUntil(n, 6);
    const m = game(); m.minutes = 22 * 60; m.james.satiety = 80; G.sleepUntil(m, 6);
    assert(near(80 - n.james.satiety, 1.65 * 8 / 2) && near(80 - m.james.satiety, 3 * 8 / 2), 'A: a night asleep: half the marked rate');
    const t = game(); t.stats.marks = 511; t.minutes = 22 * 60; t.james.satiety = 80; G.nightTo(t, 60);
    assert(near(80 - t.james.satiety, 1.65 * 3 / 2), `A: asleep to 01:00: half the marked rate (${(80 - t.james.satiety).toFixed(3)})`);
    // the bar's lines
    const f = game(); f.stats.marks = 0b111; f.james.satiety = 51;
    const L = G.barLines(f, 'fed');
    assert(L[0] === `Fed falls 2.55 an hour awake (${2.55 + FED_EXTRA_PER_HOUR} working), half that asleep.` && L[1] === 'Coil marks: 3 of 9, 15% slower.' && L[2] === 'About 20 h awake resting, 14 h working.', `A: the Fed bar's lines with 3 marks (${L.join(' | ')})`);
    assert(G.barLines(game(), 'fed').length === 2 && !G.barLines(game(), 'fed').some((x) => /Coil marks/.test(x)), 'A: no marks: no marks line');
    // set by the arcs' scenes, from the game's start (no won Act 1 needed)
    assert(enterHook.archive === A.archiveAt, 'A: the hook is wired');
    const w = game(); w.stats.clears = 0;
    goTo(w, SCENES, 'village');
    assert(w.stats.marks === 1 && (w.tasks.threads?.arcs || 0) === 0, 'A: the Wilds finished: a mark before any won Act 1 (the threads count nothing yet)');
    goTo(w, SCENES, 'ht_start');
    assert(w.stats.marks === (1 | 16 | 32 | 64), 'A: the Heart reached: the Root Road, the Drowned Wood and the Ashen Hills');
    goTo(w, SCENES, 'village'); assert(G.marksHeld(w) === 4, 'A: an arc finished again adds nothing');
    const r = game(); r.flags.bl_region = 'ah'; goTo(r, SCENES, 'wilds');
    assert(r.stats.marks === (16 | 32), 'A: a Blackroot region reached marks the arcs before it (REGION_DONE)');
    const k = game(); k.coil.skipEnter = true; goTo(k, SCENES, 'fo_start');
    assert(k.stats.marks === 0, 'A: not on a rewind\'s own first scene');
    assert(Object.values(ARC_AT).flat().every((i) => i >= 0 && i < 9) && new Set(Object.values(ARC_AT).flat()).size === 9, 'A: every arc has its scene');
    // kept by every rewind
    const c = game(); goTo(c, SCENES, 'village'); goTo(c, SCENES, 'tribute'); c.coil.why = 'death'; rewind(c);
    assert(c.stats.marks === 3, 'A: a rewind keeps the marks');
    // a played Coil: the marks slow its Fed in the game itself
    const p = game(); goTo(p, SCENES, 'village'); p.james.satiety = 50; G.advance(p, 120);
    assert(near(50 - p.james.satiety, 2 * 2.85), 'A: one mark: two hours awake −5.7');
}

// B: the Insights (IN-13)
{
    assert(A.INSIGHTS.length === 13 && new Set(A.INSIGHTS.map((x) => x.f)).size === 13 && A.INSIGHTS.every((x) => x.name), 'B: 13 Insights, each once, each named');
    assert(A.INSIGHTS.every((x) => typeof (REMEMBER[x.f] || KNOW_TEXT[x.f]) === 'string'), 'B: each has its words on the Coil screen');
    assert(Object.keys(REMEMBER).concat(Object.keys(KNOW_TEXT)).every((f) => A.INSIGHTS.some((x) => x.f === f)), 'B: everything the Coil remembers is an Insight');
    assert(['bl_tracker', 'told_hearth', 'grove'].every((f) => f in REMEMBER && !KEEP_FLAGS.includes(f)), 'B: the three new ones are remembered, not kept as flags');
    const g = game(); g.flags.bl_tracker = true; g.flags.grove = 'gentle'; g.flags.roots = true; endCoil(g, 'choice');
    const rep = coilReport(g); // v0.11.288 (P56-A, WH-n): endCoil no longer adds them; the Coil screen shows them, the rewind keeps them
    assert(Array.isArray(rep.known) && rep.known.length === 3, `B (P56 review, TG5): the Coil screen lists the three finds (${rep.known?.length})`);
    assert([REMEMBER.bl_tracker, REMEMBER.grove, REMEMBER.roots].every((x) => rep.known.includes(x)) && !rep.known.includes(REMEMBER.told_hearth) && rep.fresh === 3 && g.coil.known.length === 0, 'B: the Coil screen remembers what was found; the rewind keeps it');
    rewind(g);
    assert(['bl_tracker', 'grove', 'roots'].every((f) => g.coil.known.includes(f)), 'B (P56 review, TG5): the rewind keeps all three');
    assert(!g.flags.bl_tracker && g.coil.known.includes('bl_tracker'), 'B: after the rewind: the flag gone, the Insight kept');
    g.flags.lore_realms = true;
    const v = A.archiveView(g);
    assert(v.insightsOf === 13 && v.insights.length === 4 && v.insights.map((x) => x.name).join() === 'Roots,Realms lore,Ya\'s tracks,The singing grove', `B: the view: kept and this Coil's, in the story's order (${v.insights.map((x) => x.name).join()})`);
    assert(v.insights[2].line === REMEMBER.bl_tracker, 'B: each with its words');
    assert(A.archiveView(game()).insights.length === 0, 'B: a new game: none');
}

// C: the endings and the old save's fill (SV)
{
    assert(A.ENDINGS.length === 8 && new Set(A.ENDINGS.map((x) => x.k)).size === 8, 'C: 8 endings');
    const g = game(); g.flags.ending = 'bluff'; goTo(g, SCENES, 'epilogue');
    assert(g.stats.ends.join() === 't:bluff', 'C: the tribute\'s ending noted at the next scene');
    g.flags.a1_outcome = 'accord'; goTo(g, SCENES, 'a1_end'); goTo(g, SCENES, 'a1_end');
    assert(g.stats.ends.join() === 't:bluff,a:accord', 'C: Act 1\'s, once');
    g.coil.why = 'clear'; rewind(g);
    assert(g.stats.ends.join() === 't:bluff,a:accord', 'C: kept by a rewind');
    const v = A.archiveView(g);
    assert(v.endings.join() === 'The tribute: the bluff,Act 1: the accord' && v.endingsOf === 8 && !v.wonOld, 'C: the view');
    const n = game(); n.flags.ending = 'lost';
    assert(A.archiveView(n).endings.join() === 'The tribute: lost', 'C: the view shows one the flags show before it is noted');
    // the fill
    const fill = (fn) => { const o = game(); delete o.stats.marks; delete o.stats.ends; fn(o); return G.archiveFill(o); };
    const p0 = fill(() => {});
    assert(p0.stats.marks === 0 && p0.stats.ends.length === 0, 'C: an old prologue save: no marks, no endings');
    const p1 = fill((o) => { o.coil.act = 1; o.flags.ending = 'fought'; });
    assert(p1.stats.marks === 7 && p1.stats.ends.join() === 't:fought', 'C: an old Act 1 save: the prologue\'s 3 marks, its tribute');
    const p2 = fill((o) => { o.coil.act = 1; o.stats.clears = 2; o.flags.ending = 'paid'; });
    assert(p2.stats.marks === 511 && p2.stats.ends.join() === 't:paid,a:won', 'C: a won clear: all 9, "a won Act 1"');
    assert(A.archiveView(p2).wonOld && A.archiveView(p2).endings.length === 1, 'C: shown apart, not counted');
    const p3 = fill((o) => { o.coil.act = 1; o.stats.clears = 1; o.flags.a1_outcome = 'victory'; });
    assert(p3.stats.ends.join() === 'a:victory', 'C: a won clear with its outcome on the save: that one, no "a won Act 1"');
    const p4 = fill((o) => { o.tasks.threads = { lanes: [], arcs: 0b110000000, hand: [] }; });
    assert(p4.stats.marks === 0b110000000, 'C: the threads\' arcs count');
    // TG3 (the review; the owner 2026-11-27 17:29: old saves are irrelevant, the fill as picked, M1-p): a prologue save past the
    // village and the tribute gets no marks; an Act 1 save whose scenes seen show the later arcs gets the prologue's 3 only
    const q1 = fill((o) => { o.seen = { village: 1, tribute: 1 }; o.scene = 'ashfall'; });
    const q2 = fill((o) => { o.coil.act = 1; o.seen = { bl_start: 1, ht_start: 1, rt_start: 1 }; });
    assert(q1.stats.marks === 0 && q2.stats.marks === 7, 'C (TG3): the fill as picked: by where the save stands, not by the scenes seen');
    const keep = game(); keep.stats.marks = 2; keep.stats.ends = ['t:lost']; keep.coil.act = 1; keep.stats.clears = 1; G.archiveFill(keep);
    assert(keep.stats.marks === 2 && keep.stats.ends.join() === 't:lost', 'C: the fill fills a missing field only');
    const s = game(); delete s.stats.marks; delete s.stats.ends; s.coil.act = 1;
    const back = G.deserialize(G.serialize ? G.serialize(s) : JSON.stringify(s));
    assert(back.stats.marks === 7 && Array.isArray(back.stats.ends), 'C: a load runs the fill');
}

// D: foes met
{
    const ids = [...Object.keys(NO_DICE_TUNE), ...Object.keys(LF_FIGHTS)];
    assert(ids.length === 41 && ids.every((id) => !!A.FOE_NAMES[id]), `D: every fight named (${ids.filter((id) => !A.FOE_NAMES[id]).join() || 41})`);
    assert(Object.keys(A.FOE_NAMES).every((id) => ids.includes(id)), 'D: no name for a fight that isn\'t there');
    assert(A.foeName('some_new') === 'some new', 'D: an unnamed id reads spaced');
    const g = game(); G.meetFoe(g, 'boar'); G.meetFoe(g, 'boar'); G.meetFoe(g, 'jackals'); g.stats.foes.wolves = 0;
    const v = A.archiveView(g);
    assert(v.foes.map((f) => `${f.name} ${f.n}`).join() === 'Ashfang jackals 1,Ironhide boar 2', `D: met ones, by name, with the count (${v.foes.map((f) => `${f.name} ${f.n}`).join()})`);
}

// E: the tab's wiring (read as text)
{
    const html = read('index.html'), main = read('js/main.js'), sw = read('sw.js'), css = read('css/style.css'), app = read('js/core/app.js');
    assert(/<button data-tab="journal">Journal<\/button>\s*<button data-tab="archive">Archive<\/button>/.test(html), 'E: the Archive button after the Journal');
    assert((html.match(/data-tab="/g) || []).length === 7 && /repeat\(7, auto\)/.test(css), 'E: seven tabs, seven columns');
    assert(/archive: renderArchive/.test(main) && /function renderArchive\(\)/.test(main) && /archiveView\(g\)/.test(main), 'E: main.js draws it');
    assert(/'js\/core\/archive\.js'/.test(sw), 'E: the offline cache holds archive.js');
    assert(/key: 'a', show: 'A', does: 'Archive', tab: 'archive'/.test(app), 'E: key A');
    const T = A.ARCHIVE_TEXT;
    assert(T.marks(0, 9, 0) === 'Coil marks: 0 of 9' && T.marks(3, 9, 15) === 'Coil marks: 3 of 9 · −15% Fed\'s drain' && T.insights(4, 13) === 'Insights: 4 of 13', 'E: the headings');
}

// F: the FAQ and What's new
{
    const fed = faqText('HP, Convergence and Fed', game());
    assert(/Every <b>Coil mark<\/b>.*5% slower, up to 45% with all 9/.test(fed), 'F: the FAQ: the marks\' drain');
    assert(/the Archive \(Insights, Coil marks, foes met, endings seen(, feats and memories)?[;)]/.test(faqText('What carries over', game())), 'F: the FAQ: what carries over');
    const note = NOTES.find(([v]) => v === '0.11.287');
    assert(!!note && /Archive/.test(note[1]) && /5% slower, up to 45%/.test(note[1]), 'F: What\'s new');
}

// G: the review's test gaps (P55 review, Opus: TG1, TG2, TG4; PG)
{
    // TG1: the real ending paths: the bite at a lost tribute, the James tab's bite at rt_taken, "Accept it. Walk." to a1_end
    const g = game(); goTo(g, SCENES, 'collectors_lost');
    const bi = sceneView(g, SCENES).choices.find((c) => /^Bite the tail\. \(Wake at the first dawn/.test(c.label));
    if (bi) choose(g, SCENES, bi.index);
    assert(!!bi && g.scene === 'coil_end' && g.stats.ends.includes('t:lost'), `TG1: the bite at a lost tribute keeps 't:lost' (${g.scene}, ${g.stats.ends})`);
    rewind(g); assert(g.stats.ends.includes('t:lost') && !g.flags.ending, 'TG1: kept by the rewind, the flag gone');
    const a = game(); a.coil.act = 1; goTo(a, SCENES, 'rt_taken');
    endCoil(a, tabWhy(a), a.scene); goTo(a, SCENES, 'coil_end');
    assert(a.stats.ends.includes('a:taken'), `TG1: the James tab's bite at rt_taken keeps 'a:taken' (${a.stats.ends})`);
    const w = sceneView(a, SCENES).choices.find((c) => c.label === 'Accept it. Walk.');
    if (w) choose(a, SCENES, w.index);
    assert(!!w && a.scene === 'a1_end' && a.stats.ends.filter((k) => k === 'a:taken').length === 1, `TG1: "Accept it. Walk." to a1_end, the ending once (${a.scene})`);
    // TG2: a card's extra Fed stays 1 an hour with 9 marks (only Fed's own drain is marked)
    for (const marks of [0, 511]) {
        const c = game(); c.scene = 'wilds'; c.minutes = 2 * 1440 + 7 * 60; c.stats.marks = marks; c.james.satiety = 95;
        const card = T.taskCards(c, SCENES).find((x) => x.kind === 'work' && x.status === 'open' && !/^wilds:6$/.test(x.id));
        const s0 = c.james.satiety, m0 = c.minutes; if (card) T.runTask(c, SCENES, card.id);
        const hrs = (c.minutes - m0) / 60, want = (G.fedPerHour(c) + FED_EXTRA_PER_HOUR) * hrs;
        assert(!!card && hrs > 0 && Math.abs((s0 - c.james.satiety) - want) < 1e-6, `TG2: a work card with ${marks ? 9 : 0} marks: Fed −(${Math.round(G.fedPerHour(c) * 100) / 100} + ${FED_EXTRA_PER_HOUR}) an hour (${card?.id}, ${hrs.toFixed(2)} h, −${(s0 - c.james.satiety).toFixed(3)} for −${want.toFixed(3)})`);
    }
    // TG4: the starving boundary inside one span: Fed 0.1, 3 marks (2.55 an hour), 15 minutes
    const b = game(); b.stats.marks = 0b111; b.james.satiety = 0.1; b.starveCarry = 0; G.advance(b, 15);
    assert(b.james.satiety === 0 && near(b.starveCarry, 15 - (0.1 * 60) / 2.55), `TG4: Fed 0.1 lasts ${(0.1 * 60 / 2.55).toFixed(3)} min at 3 marks; the rest starving (${b.starveCarry.toFixed(4)})`);
}

// H: Insights' power (v0.11.288, owner pick P56-A)
{
    assert(G.INSIGHT_STEP === 0.15 && G.FED_CUT_MAX === 0.5, 'H: 15% an Insight; Fed cut at most 50%');
    const kinds = Object.values(G.INSIGHT_KIND), cnt = (k) => kinds.filter((x) => x === k).length;
    assert(Object.keys(G.INSIGHT_KIND).sort().join() === A.INSIGHTS.map((x) => x.f).sort().join(), 'H: every Insight has a kind, and only Insights');
    assert(cnt('blow') === 4 && cnt('sit') === 4 && cnt('fed') === 3 && cnt('xp') === 2 && G.INSIGHT_KINDS.join() === 'blow,sit,fed,xp', 'H: the mapping: 4 blow, 4 sit, 3 Fed, 2 XP');
    assert(['lore1', 'bone_sung', 'bl_tracker', 'log_heard'].every((f) => G.INSIGHT_KIND[f] === 'blow') && ['lore_realms', 'lore_tree', 'saw_lights', 'grove'].every((f) => G.INSIGHT_KIND[f] === 'sit') && ['fungus', 'gills', 'roots'].every((f) => G.INSIGHT_KIND[f] === 'fed') && ['told_hearth', 'ship_found'].every((f) => G.INSIGHT_KIND[f] === 'xp'), 'H: the mapping as picked (MP)');
    const g0 = game();
    assert(G.INSIGHT_KINDS.every((k) => G.insightPart(g0, k) === 0) && near(G.fedPerHour(g0), 3), 'H: a new game: no part, Fed 3 an hour');
    // WH-n: a find counts from the next Coil; endCoil and "Not yet" keep it out
    const w = game(); w.flags.lore1 = true; w.flags.bone_sung = true; w.flags.fungus = true; w.flags.lore_realms = true; w.flags.told_hearth = true;
    assert(G.INSIGHT_KINDS.every((k) => G.insightPart(w, k) === 0), 'H: found this Coil: no power yet');
    goTo(w, SCENES, 'wilds'); endCoil(w, 'choice', 'wilds'); goTo(w, SCENES, 'coil_end');
    assert(G.insightPart(w, 'blow') === 0 && w.coil.known.length === 0, 'H: on the Coil screen: still none');
    const ny = sceneView(w, SCENES).choices.find((c) => c.label === 'Not yet.');
    if (ny) choose(w, SCENES, ny.index);
    assert(!!ny && w.scene === 'wilds' && G.insightPart(w, 'blow') === 0 && G.insightPart(w, 'fed') === 0, `H: "Not yet": back in the same Coil, still none (${w.scene})`);
    rewind(w);
    assert(near(G.insightPart(w, 'blow'), 0.3) && near(G.insightPart(w, 'sit'), 0.15) && near(G.insightPart(w, 'fed'), 0.15) && near(G.insightPart(w, 'xp'), 0.15), 'H: after the rewind: blow 30%, sit 15%, Fed 15%, XP 15%');
    rewind(w); assert(G.insightsHeld(w, 'blow') === 2, 'H: kept by every rewind, counted once');
    // old saves: no known list
    const o = game(); delete o.coil.known; assert(G.insightPart(o, 'blow') === 0, 'H: no known list: no part'); o.flags.roots = true; remember(o); assert(o.coil.known.join() === 'roots', 'H: remember makes the list');
    const nc = game(); nc.coil = null; assert(G.insightPart(nc, 'fed') === 0 && near(G.fedPerHour(nc), 3), 'H: no Coil: no part');
    // blow
    const b = game(); b.coil.known = ['lore1', 'bone_sung'];
    assert(G.insightBlow(b, 10) === 7 && G.insightBlow(b, 0) === 0 && G.insightBlow(b, 3) === 2.1, 'H: two blow Insights: 10 → 7, 3 → 2.1, 0 stays');
    b.coil.known = ['lore1', 'bone_sung', 'bl_tracker', 'log_heard', 'lore1']; assert(G.insightBlow(b, 10) === 4, 'H: all four: −60% (a repeated entry counts once)');
    assert(G.insightBlow(game(), 7) === 7, 'H: none: the blow unchanged');
    const src = read('js/core/game.js');
    assert(/let dmg = insightBlow\(g, hitDamage\(e\.dmg,/.test(src) && /const dmg = insightBlow\(g, hitDamage\(biter\.dmg,/.test(src), 'H: the fight round and a failed run use it');
    // sit
    const s0 = game(), s1 = game(); s1.coil.known = ['lore_realms', 'lore_tree', 'saw_lights', 'grove'];
    const raw = 100 / G.SAT_HOURS(0) / G.satDiv(s0);
    assert(near(G.sitGain(s1), Math.round(raw * 1.6 * 10) / 10) && G.sitGain(s1) > G.sitGain(s0), `H: four sit Insights: a sit gives ×1.6 (${G.sitGain(s0)} → ${G.sitGain(s1)})`);
    // fed: with the marks, capped
    const f = game(); f.coil.known = ['fungus', 'gills', 'roots'];
    assert(near(G.fedPerHour(f), 1.65) && near(G.fedCut(f), 0.45), 'H: three Fed Insights: 1.65 an hour (−45%)');
    f.stats.marks = 511; assert(near(G.fedPerHour(f), 1.5) && near(G.fedCut(f), 0.5), 'H: with all 9 marks: capped at −50% (1.5 an hour)');
    f.stats.marks = 0b1; f.coil.known = ['fungus']; assert(near(G.fedPerHour(f), 3 * 0.8), 'H: 1 mark and 1 Fed Insight: −20%');
    const fa = game(); fa.coil.known = ['fungus', 'gills', 'roots']; fa.stats.marks = 511; fa.james.satiety = 80; G.advance(fa, 60);
    assert(near(80 - fa.james.satiety, 1.5), `H: an hour awake at the cap: −1.5 (${(80 - fa.james.satiety).toFixed(3)})`);
    // xp
    const x0 = game(), x1 = game(); x1.coil.known = ['told_hearth', 'ship_found'];
    const xp = (g) => { const before = JSON.stringify(g.james.gu); G.awardXp(g, 'GU', 'standard'); return { before, after: g.james.gu }; };
    const r0 = xp(x0), r1 = xp(x1);
    const tot = (n) => n.tier * 1e6 + n.level * 1e3 + n.xp;
    assert(tot(r1.after) > tot(r0.after), `H: two XP Insights: more GU XP (${JSON.stringify(r0.after)} vs ${JSON.stringify(r1.after)})`);
    assert(/pool \* \(\(100 \+ insightPct\(g, 'xp'\)\) \/ 100\) \* coilMult\(g\)/.test(src), 'H: awardXp\'s pool takes the XP part');
    // the Archive (UI-p)
    const v = game(); v.coil.known = ['lore1', 'fungus']; v.flags.lore1 = true; v.flags.bone_sung = true;
    const av = A.archiveView(v);
    assert(av.insights.map((x) => `${x.name}:${x.kind}:${x.held}`).join() === 'The bracket fungus:fed:true,Bone song:blow:false,The tribute:blow:true', `H: the view: kind and whether it counts this Coil (${av.insights.map((x) => `${x.name}:${x.kind}:${x.held}`).join()})`);
    assert(av.power.map((p) => `${p.kind}${p.pct}`).join() === 'blow15,fed15' && av.step === 15 && av.fedAll === 15, 'H: the view: what counts this Coil');
    const AT = A.ARCHIVE_TEXT;
    assert(AT.gives('blow', 15) === '−15% a foe\'s blow' && AT.gives('sit', 15) === '+15% Saturation a sit' && AT.gives('fed', 30) === '−30% Fed\'s drain' && AT.gives('xp', 15) === '+15% skill XP (Yuki\'s share too)', 'H: the words for each kind');
    assert(AT.power(av.power, av.fedAll, av.held, av.fedCapped) === 'This Coil: −15% a foe\'s blow, −15% Fed\'s drain.' && AT.power([], 0) === 'None counts yet: each Insight counts from the Coil after the one that found it, and those of a kind add up.', `H: the power line, no marks: no total (the review's L2) (${AT.power(av.power, av.fedAll, av.held, av.fedCapped)})`);
    // the review's TG4: with marks, the total; the cap only when reached
    v.stats.marks = 0b11; const av2 = A.archiveView(v);
    assert(AT.power(av2.power, av2.fedAll, av2.held, av2.fedCapped) === 'This Coil: −15% a foe\'s blow, −15% Fed\'s drain. With the Coil marks, Fed drains 25% slower.' && !av2.fedCapped, `H (TG4): with 2 marks: the total, no cap (${AT.power(av2.power, av2.fedAll, av2.held, av2.fedCapped)})`);
    v.stats.marks = 511; v.coil.known = ['fungus', 'gills']; const av3 = A.archiveView(v);
    assert(av3.fedCapped && av3.fedAll === 50 && AT.power(av3.power, av3.fedAll, av3.held, av3.fedCapped) === 'This Coil: −30% Fed\'s drain. With the Coil marks, Fed drains 50% slower (50% at most).', `H (TG4): past the cap (${AT.power(av3.power, av3.fedAll, av3.held, av3.fedCapped)})`);
    v.stats.marks = 0b1; v.coil.known = ['fungus', 'gills', 'roots']; const av4 = A.archiveView(v);
    assert(av4.fedAll === 50 && !av4.fedCapped && /Fed drains 50% slower\.$/.test(AT.power(av4.power, av4.fedAll, av4.held, av4.fedCapped)), 'H (TG4): exactly at 50%: no cap note');
    assert(G.fedInsightLine(1, 3) === 'Coil marks: 1 of 9 (−5%), Insights: −45%. Fed drains 50% slower.', `H (TG4): the Fed bar exactly at 50% (${G.fedInsightLine(1, 3)})`);
    assert(AT.kind.xp === 'skill XP (Yuki\'s share too)', 'H (the review\'s L1): the XP kind names Yuki\'s share');
    assert(/T\.power\(a\.power, a\.fedAll, a\.held, a\.fedCapped\)\)\}\$\{a\.power\.length \? /.test(read('js/main.js')), 'H (L2): the tab passes the marks and the cap, the rule note only with a part held');
    const main = read('js/main.js');
    assert(/T\.power\(a\.power, a\.fedAll, a\.held, a\.fedCapped\)/.test(main) && /T\.gives\(x\.kind, a\.step\)/.test(main) && /x\.held \? '' : ' dim'/.test(main) && /T\.next/.test(main), 'H: the tab draws the power line, each row\'s gift, this Coil\'s finds dimmed');
    // the Fed bar
    const fb = game(); fb.coil.known = ['fungus', 'gills']; fb.stats.marks = 0b11;
    const fl = G.barLines(fb, 'fed');
    assert(fl.includes('Coil marks: 2 of 9 (−10%), Insights: −30%. Fed drains 40% slower.'), `H: the Fed bar: marks and Insights (${fl.join(' | ')})`);
    fb.coil.known = ['fungus', 'gills', 'roots']; fb.stats.marks = 511;
    assert(G.barLines(fb, 'fed').includes('Coil marks: 9 of 9 (−45%), Insights: −45%. Fed drains 50% slower (50% at most).'), 'H: the Fed bar at the cap');
    fb.coil.known = []; assert(G.barLines(fb, 'fed').includes('Coil marks: 9 of 9, 45% slower.'), 'H: the Fed bar: marks alone, as before');
    // the Coil screen
    const cs = game(); cs.coil.known = ['lore1']; cs.flags.lore1 = true; cs.flags.roots = true; cs.flags.gills = true; endCoil(cs, 'choice', 'wilds'); goTo(cs, SCENES, 'coil_end');
    const ct = sceneView(cs, SCENES).text;
    assert(coilReport(cs).fresh === 2 && /2 of these are new this Coil: their power starts with the next Coil \(the Archive\)\./.test(ct), 'H: the Coil screen: this Coil\'s finds, from the next Coil');
    const c1 = game(); c1.flags.roots = true; endCoil(c1, 'choice', 'wilds'); goTo(c1, SCENES, 'coil_end');
    assert(/One of these is new this Coil: its power starts/.test(sceneView(c1, SCENES).text), 'H: the Coil screen: one find');
    const c0 = game(); c0.coil.known = ['roots']; c0.flags.roots = true; endCoil(c0, 'choice', 'wilds'); goTo(c0, SCENES, 'coil_end');
    assert(!/new this Coil/.test(sceneView(c0, SCENES).text), 'H: the Coil screen: nothing new, no note');
    // FAQ and What's new
    assert(/each Fed Insight \(the bracket fungus, Ghost-gill, Roots\) 15% more, from the Coil after it is found; together at most 50%/.test(faqText('HP, Convergence and Fed', game())), 'H: the FAQ: Fed');
    assert(/each Insight gives one thing from the Coil after it is found: 15% off a foe's blow, 15% more Saturation a sit, 15% off Fed's drain or 15% more skill XP \(Yuki's bond share too\)/.test(faqText('What carries over', game())), 'H: the FAQ: what carries over, with the direction (the review\'s L3)');
    const n288 = NOTES.find(([ver]) => ver === '0.11.288');
    assert(!!n288 && /From the Coil after one is found, each gives 15%/.test(n288[1]) && /50% at most/.test(n288[1]) && /Yuki\\'s share|Yuki's share/.test(n288[1]), 'H: What\'s new');
}

// H2: the P56 review's test gaps (Opus; PG): TG1 real fight rounds, TG2 the act crossing and an old filled list, TG3 exact XP and sits, L4
{
    // TG1: a real fight: the round, a big blow, a failed run; two blow Insights: ×0.7 (3 → 2.1, the big blow 6 → 4.2)
    const fight = (known, act, rounds) => { const g = game(); G.ensureBars(g); g.coil.known = known;
        G.startCombat(g, { id: 'test_p56', intro: 'In.', band: 'standard', enemies: [{ name: 'Brute', hp: 999, dc: 99, atk: 99, dmg: 4, heavy: true }], win: 'stream', lose: 'stream', flee: 'stream' });
        const out = []; for (let r = 0; r < rounds; r++) { const h0 = g.james.hp; const o = act === 'flee' ? G.combatFlee(g) : G.combatStep(g, act); out.push(Math.round((h0 - g.james.hp) * 10) / 10); if (o?.done) break; }
        return { out, hp: g.james.hp };
    };
    const f0 = fight([], 'blade', 4), f2 = fight(['lore1', 'bone_sung'], 'blade', 4);
    assert(f0.out.join() === '3,3,6,3' && f2.out.join() === '2.1,2.1,4.2,2.1', `TG1: blade rounds, the third a big blow: ${f0.out.join()} without, ${f2.out.join()} with two blow Insights`);
    assert(Math.round(f2.hp * 10) === f2.hp * 10, `TG1 (L4): James's HP stays in tenths (${f2.hp})`);
    const r0 = fight([], 'flee', 1), r2 = fight(['lore1', 'bone_sung'], 'flee', 1);
    assert(r0.out.join() === '3' && r2.out.join() === '2.1', `TG1: a failed run's bite: ${r0.out.join()} → ${r2.out.join()}`);
    const fy = fight(['told_hearth', 'ship_found', 'fungus', 'lore_realms'], 'blade', 4);
    assert(fy.out.join() === '3,3,6,3', 'TG1: other kinds leave the blow alone');
    // L4: exact percent arithmetic
    const b = game(); b.coil.known = ['lore1'];
    assert(G.insightBlow(b, 13) === 11.1 && G.insightBlow(b, 7) === 6, `L4: 13 → 11.1 (exact 11.05), 7 → 6 (5.95) (${G.insightBlow(b, 13)}, ${G.insightBlow(b, 7)})`);
    let off = 0; for (let d = 0; d <= 200; d++) if (G.insightBlow(b, d) !== Math.round(d * 85 / 10) / 10) off++;
    assert(off === 0, `L4: every blow 0–200 exact with one Insight (${off} off)`);
    // TG2: the act crossing keeps what is remembered
    const a = game(); a.coil.known = ['lore1', 'roots', 'told_hearth']; G.startActCoil(a, 1);
    assert(a.coil.act === 1 && G.insightsHeld(a, 'blow') === 1 && G.insightsHeld(a, 'fed') === 1 && G.insightsHeld(a, 'xp') === 1, 'TG2: into Act 1 with every Insight remembered');
    a.flags.ship_found = true; rewind(a);
    assert(a.coil.act === 1 && G.insightsHeld(a, 'xp') === 2, 'TG2: an Act 1 rewind adds its find');
    // TG2 / L5: an old save on the Coil screen whose list the old endCoil already filled: it counts for that one Coil, nothing new is claimed
    const o = game(); o.flags.roots = true; o.coil.known = ['roots']; endCoil(o, 'choice', 'wilds');
    assert(G.insightsHeld(o, 'fed') === 1 && coilReport(o).fresh === 0, 'TG2 (L5): an old filled list counts as it is; the Coil screen claims nothing new');
    // TG3: XP exactly ×1.3 with two XP Insights (the pool before the skill's own steps), and Yuki's share from it (L1)
    const pool = (known) => { const g = game(); g.coil.known = known; const before = JSON.parse(JSON.stringify(g)); const lines = G.awardXp(g, 'GU', 'standard'); return { lines, g, before }; };
    const x0 = pool([]), x2 = pool(['told_hearth', 'ship_found']);
    const num = (ls) => ls.map((l) => Number((String(l).match(/\+(\d+) XP/) || [])[1] || 0)).reduce((p, q) => p + q, 0);
    const n0 = num(x0.lines.filter((l) => /^GU /.test(l))), n2 = num(x2.lines.filter((l) => /^GU /.test(l))), y2 = x2.lines.filter((l) => /^Yuki \(bond\)/.test(l)).map((l) => Number((String(l).match(/\+(\d+)/) || [])[1] || 0)).reduce((p, q) => p + q, 0);
    assert(n0 > 0 && n2 >= Math.floor(n0 * 1.3) && n2 <= Math.floor((n0 + 1) * 1.3), `TG3: two XP Insights: James's XP ×1.3 (${n0} → ${n2}; ${x2.lines.join(' | ')})`);
    assert(y2 === Math.floor(n2 / 2), `TG3 (L1): Yuki's bond share is half the raised pool (${y2} of ${n2})`);
    // TG3: sits: two at once (the grove, the hollow), and the long calendar's floor untouched
    const s0 = game(), s1 = game(); s1.coil.known = ['lore_realms'];
    const exact = (sits, pct) => Math.round(((sits * (100 + pct)) / G.SAT_HOURS(0) / G.satDiv(s0)) * 10) / 10;
    assert(G.sitGain(s1, 2) === exact(2, 15) && G.sitGain(s1, 2) > G.sitGain(s0, 2), `TG3: two sits with one sit Insight: ${G.sitGain(s0, 2)} → ${G.sitGain(s1, 2)} (exact ${exact(2, 15)})`);
    const hi = game(); hi.james.realm = 12; const hi1 = game(); hi1.james.realm = 12; hi1.coil.known = ['lore_realms', 'lore_tree', 'saw_lights', 'grove'];
    assert(G.sitGain(hi1) >= G.sitGain(hi) && G.sitGain(hi) >= G.LONG_SIT_MIN, `TG3: high realms keep the floor (${G.sitGain(hi)} → ${G.sitGain(hi1)})`);
}

// H3: M1-u (the owner 2026-11-27 21:01): the root and the seclusion take the sit Insights too
{
    const r0 = game(), r4 = game(); r4.coil.known = ['lore_realms', 'lore_tree', 'saw_lights', 'grove'];
    assert(ROOT_SAT === 12 && rootGain(r0) === Math.round((12 / G.satDiv(r0)) * 10) / 10 && rootGain(r4) === Math.round((12 * 1.6 / G.satDiv(r4)) * 10) / 10 && rootGain(r4) > rootGain(r0), `M1-u: the root ×1.6 with four sit Insights (${rootGain(r0)} → ${rootGain(r4)})`);
    const sec = (known) => { const g = game(); G.ensureBars(g); g.coil.known = known; g.james.saturation = 0; SCENES.lf_seclusion.enter(g); return g.james.saturation; };
    const z0 = sec([]), z1 = sec(['lore_realms']);
    assert(z0 > 0 && Math.abs(z1 - Math.round(z0 * 1.15 * 10) / 10) <= 0.1 && z1 > z0, `M1-u: a season of seclusion ×1.15 with one sit Insight (${z0} → ${z1})`);
    assert(sec(['fungus', 'told_hearth', 'lore1']) === z0, 'M1-u: other kinds leave the seclusion alone');
}

// P: v0.11.289 (owner pick P57-A): the deadline line, feats, memories, limits
{
    // DL
    const g = game(); g.james.primaries = 7;
    assert(A.deadlineLine(g) === 'Tribute ahead · 7 of 12 primaries', `P DL: Day 1, before the first night: no count (${A.deadlineLine(g)})`);
    g.flags.long = true;
    assert(A.deadlineLine(g) === 'Tribute 21 days after the village · 7 of 12 primaries', `P DL: the long road before the village (${A.deadlineLine(g)})`);
    g.flags.vday = 1; g.flags.cal_night = 0;
    assert(CAL.tributeLeft(g) === 21 && A.deadlineLine(g) === 'Tribute in 21 days · 7 of 12 primaries', `P DL: the village's count (${A.deadlineLine(g)})`);
    g.flags.vday = 3; g.flags.cal_night = 6;
    assert(A.deadlineLine(g) === 'Tribute tomorrow · 7 of 12 primaries', `P DL: tomorrow (${A.deadlineLine(g)})`);
    g.james.primaries = 12;
    assert(A.deadlineLine(g) === 'Tribute tomorrow', 'P DL: all 12 primaries open: the deadline alone');
    g.minutes = CAL.calMinutes(g, 7, 10);
    assert(CAL.storyDay(g) === 7 && A.deadlineLine(g) === 'Tribute today', `P DL: the tribute's day (${A.deadlineLine(g)})`);
    g.flags.ending = 'fought';
    assert(A.deadlineLine(g) === '', 'P DL: none after the tribute');
    // the review's M1 (RV-A, M1-f) on real paths (TG1): the short road, then the tribute itself; a long road left early
    const sr = game(); goTo(sr, SCENES, 'mei_lin');
    choose(sr, SCENES, SCENES.mei_lin.choices.findIndex((c) => /roof and food/.test(String(typeof c.text === 'function' ? c.text(sr) : c.text))));
    const srAt = sr.scene, srLine = A.deadlineLine(sr); goTo(sr, SCENES, 'elder');
    assert(srAt === 'village' && /^Tribute tomorrow/.test(srLine) && /^Tribute tomorrow/.test(A.deadlineLine(sr)) && /Tomorrow, the collectors come/.test(sceneView(sr, SCENES).text), `P DL (TG1): the short road: tomorrow, as the elder says (${srLine})`);
    goTo(sr, SCENES, 'tribute');
    assert(/^Tribute today/.test(A.deadlineLine(sr)) && CAL.storyDay(sr) < 7, `P DL (TG1): the short road's tribute: today (${A.deadlineLine(sr)}, story day ${CAL.storyDay(sr)})`);
    const ex = game(); ex.flags.long = true; ex.minutes = 8 * 1440 + 10 * 60; goTo(ex, SCENES, 'village'); ex.flags.vday = 3; ex.flags.cal_night = 6; ex.minutes = 29 * 1440 + 20 * 60;
    goTo(ex, SCENES, 'tribute_dawn_sleep'); const eve = A.deadlineLine(ex); choose(ex, SCENES, 0);
    assert(/^Tribute tomorrow/.test(eve) && ex.scene === 'tribute' && /^Tribute today/.test(A.deadlineLine(ex)) && CAL.storyDay(ex) < 7, `P DL (TG1): a long road left early: tomorrow on the eve, today at the tribute (${eve}; ${A.deadlineLine(ex)})`);
    assert([...A.TRIBUTE_SCENES].every((id) => SCENES[id]), 'P DL: the tribute\'s scenes exist');
    // TG8 (the review's L3): 00:30, one clock for both acts: the story's day turns at 05:00
    const n0 = game(); n0.flags.long = true; n0.flags.vday = 3; n0.flags.cal_night = 6; n0.james.primaries = 12; n0.minutes = CAL.calMinutes(n0, 7, 0, 30);
    const n1 = game(); n1.coil.act = 1; n1.minutes = CAL.calMinutes(n1, 21, 0, 30);
    assert(A.deadlineLine(n0) === 'Tribute tomorrow' && /^Shen Qiu tomorrow/.test(A.deadlineLine(n1)), `P DL (TG8): 00:30 reads tomorrow in both acts (${A.deadlineLine(n0)}; ${A.deadlineLine(n1)})`);
    const lf = game(); lf.flags.lf_active = true;
    assert(A.deadlineLine(lf) === '', 'P DL: none in the Long Forest');
    const a = game(); a.coil.act = 1;
    const at = (d, r) => { a.minutes = CAL.calMinutes(a, d, 10); if (r) a.flags.bl_region = r; else delete a.flags.bl_region; return A.deadlineLine(a); };
    const left9 = CAL.calStart(a, 21) - CAL.calStart(a, 9);
    assert(at(9) === `Shen Qiu in ${left9} days · 0 of 6 arcs` && left9 > 1, `P DL: Act 1, the Fallout (${at(9)})`);
    // the review's M3 (RV-A, M3-s): an arc counts once he has left it, by the scenes of the game's own marks shown this Coil (TG2)
    const walk = (id, d, r) => { goTo(a, SCENES, id); a.minutes = CAL.calMinutes(a, d, 10); if (r) a.flags.bl_region = r; return A.act1Arcs(a); };
    const arcs = [walk('bl_start', 11, 'rr') === 1, walk('dw_enter', 12, 'dw') === 2, walk('ah_enter', 14, 'ah') === 3, (a.minutes = CAL.calMinutes(a, 16, 10), A.act1Arcs(a)) === 3,
        walk('ht_start', 16) === 4, walk('heart_hub', 19) === 4, walk('rt_start', 19) === 5, walk('rt_camp', 20) === 5];
    assert(arcs.every(Boolean), `P DL (TG2): the arcs he has left: the Fallout at bl_start, the Root Road and the Drowned Wood by the region, the Ashen Hills still 3 on Day 16 until ht_start, the Heart still 4 in its hub on Day 19 until rt_start (${arcs})`);
    a.minutes = CAL.calMinutes(a, 21, 10);
    assert(A.deadlineLine(a) === 'Shen Qiu today · 5 of 6 arcs', `P DL: Shen Qiu's day: the Return ends with the duel (${A.deadlineLine(a)})`);
    const other = game(); other.coil.act = 1; other.coil.n = 2; other.lines = { ...a.lines };
    assert(A.act1Arcs(other) === 0, 'P DL: another Coil\'s record counts nothing');
    a.flags.a1_outcome = 'accord';
    assert(A.deadlineLine(a) === '', 'P DL: none after Act 1');
    const main = read('js/main.js'), css = read('css/style.css');
    assert(/<div class="clock">[^\n]*\$\{deadlineHtml\(\)\}<\/div>`;/.test(main) && /function deadlineHtml\(\) \{\n    const d = deadlineLine\(g\);/.test(main), 'P DL: the status bar draws it under the clock');
    assert(/\.deadline \{ grid-column: 1 \/ -1;/.test(css), 'P DL: across the bar');

    // FT
    assert(A.FEATS.length === 12 && new Set(A.FEATS.map((f) => f.k)).size === 12 && A.FEATS.every((f) => f.name && typeof f.ok === 'function'), 'P FT: 12 feats, each once');
    const f = game();
    assert(JSON.stringify(f.stats.feats) === '{}' && JSON.stringify(f.stats.limits) === '{}' && Array.isArray(f.stats.mem) && !f.stats.mem.length, 'P: a new game starts the three empty');
    A.noteRecords(f);
    assert(!Object.keys(f.stats.feats).length && !Object.keys(f.stats.limits).length, 'P FT: a new game has none');
    f.coil.n = 3; f.stats.kills = 100; f.stats.meals = 99; A.noteRecords(f);
    assert(f.stats.feats.kills_100 === 3 && f.stats.feats.meals_100 == null, 'P FT: a hundred kills, noted with its Coil; 99 meals not yet');
    f.stats.meals = 100; f.coil.n = 4; A.noteRecords(f);
    assert(f.stats.feats.meals_100 === 4 && f.stats.feats.kills_100 === 3, 'P FT: a later one with its own Coil, the first unchanged');
    const t = game(); t.flags.ending = 'bluff'; A.noteRecords(t);
    assert(t.stats.feats.tribute_c1 === 1, 'P FT: the tribute won on Coil 1');
    const t2 = game(); t2.coil.n = 2; t2.flags.ending = 'bluff'; A.noteRecords(t2);
    const t3 = game(); t3.flags.ending = 'lost'; A.noteRecords(t3);
    assert(t2.stats.feats.tribute_c1 == null && t3.stats.feats.tribute_c1 == null, 'P FT: not on Coil 2, not a lost tribute');
    const e = game(); e.stats.ends = ['t:fought', 't:bluff']; A.noteRecords(e);
    assert(e.stats.feats.tribute_3 == null, 'P FT: two ways of three: not yet');
    e.stats.ends.push('t:paid'); e.stats.ends.push('a:victory', 'a:accord'); A.noteRecords(e);
    assert(e.stats.feats.tribute_3 === 1 && e.stats.feats.act1_won === 1 && e.stats.feats.act1_3 == null && e.stats.feats.ends_all == null, 'P FT: the tribute all three ways; Act 1 won, not yet all three');
    e.stats.ends.push('a:revelation', 't:lost', 'a:taken'); A.noteRecords(e);
    assert(e.stats.feats.act1_3 === 1 && e.stats.feats.ends_all === 1, 'P FT: Act 1 all three ways; every ending');
    const o = game(); o.stats.ends = ['a:won']; A.noteRecords(o);
    assert(o.stats.feats.act1_won === 1, 'P FT: an old save\'s "Act 1 won" counts');
    const m = game(); m.stats.marks = 255; A.noteRecords(m);
    assert(m.stats.feats.marks_all == null, 'P FT: 8 marks: not yet'); m.stats.marks = 511; A.noteRecords(m);
    assert(m.stats.feats.marks_all === 1 && m.stats.limits.marks === 1, 'P FT + LH: all nine marks (a feat and a limit)');
    const ins = game(); ins.coil.known = A.INSIGHTS.slice(0, 12).map((x) => x.f); A.noteRecords(ins);
    assert(ins.stats.feats.insights_all == null, 'P FT: 12 Insights: not yet'); ins.flags[A.INSIGHTS[12].f] = true; A.noteRecords(ins);
    assert(ins.stats.feats.insights_all === 1, 'P FT: every Insight (remembered, or found this Coil)');
    const fo = game(); fo.stats.foes = Object.fromEntries(Object.keys(A.FOE_NAMES).slice(0, 20).map((k, i) => [k, i ? 1 : 0])); A.noteRecords(fo);
    assert(fo.stats.feats.foes_20 == null, 'P FT: 19 met (one at 0): not yet'); fo.stats.foes[Object.keys(A.FOE_NAMES)[0]] = 2; A.noteRecords(fo);
    assert(fo.stats.feats.foes_20 === 1, 'P FT: twenty kinds of foe');
    const r = game(); r.james.realm = 1; r.flags.longforest = true; A.noteRecords(r);
    assert(r.stats.feats.foundation === 1 && r.stats.feats.long_forest === 1, 'P FT: Foundation, the Long Forest');
    const old = game(); delete old.stats.feats; delete old.stats.limits; old.coil.n = 6; old.stats.kills = 300; old.inventory.hare_raw = 99; A.noteRecords(old);
    assert(old.stats.feats.kills_100 === 0 && old.stats.limits.item === 0, 'P FT + LH: an old save\'s first check: 0, before the record');
    old.stats.meals = 100; A.noteRecords(old);
    assert(old.stats.feats.meals_100 === 6, 'P FT: after the fill, its Coil');
    const ld = game(); delete ld.stats.feats; delete ld.stats.limits; ld.stats.kills = 120; G.migrate(ld);
    assert(ld.stats.feats.kills_100 === 0 && ld.stats.limits && typeof ld.stats.limits === 'object', 'P FT (the review\'s L5): an old save\'s feats filled at load, before its first tap');
    const kept = game(); kept.stats.kills = 100; goTo(kept, SCENES, 'village');
    assert(kept.stats.feats.kills_100 === 1, 'P FT: noted on a scene entered (archiveAt: the bots\' games too)');
    kept.james.realm = 1; A.noteRecords(kept); rewind(kept);
    assert(kept.stats.feats.kills_100 === 1 && kept.stats.feats.foundation === 1 && kept.james.realm === 0, 'P FT: kept by the rewind, the realm gone');
    const vw = A.archiveView(kept);
    assert(vw.featsOf === 12 && vw.feats.length === 12 && vw.feats.filter((x) => x.got).map((x) => x.name).join() === 'Foundation reached,A hundred kills' && vw.feats.find((x) => x.got).c === 1, `P FT: the view, in order (${vw.feats.filter((x) => x.got).map((x) => x.name)})`);
    assert(A.ARCHIVE_TEXT.onCoil(0) === 'before the record' && A.ARCHIVE_TEXT.onCoil(4) === 'Coil 4' && A.ARCHIVE_TEXT.feats(2, 12) === 'Feats: 2 of 12', 'P FT: the words');
    const sl = (x) => { const g2 = game(); g2.stats.feats = { [x]: 1 }; return JSON.stringify(g2); };
    assert(sl('kills_100').length < JSON.stringify(game()).length + 40, 'P FT: a feat costs a few bytes');

    // LH
    assert(A.LIMITS.length === 7 && new Set(A.LIMITS.map((x) => x.k)).size === 7, 'P LH: 7 limits');
    const L = (fn) => { const g2 = game(); fn(g2); A.noteRecords(g2); return Object.keys(g2.stats.limits).sort().join(); };
    assert(L(() => {}) === '', 'P LH: a new game: none');
    assert(L((x) => { x.inventory.hare_raw = 98; x.inventory.beast_core = 998; }) === '', 'P LH: one short of each cap: none');
    assert(L((x) => { x.inventory.hare_raw = 99; }) === 'item' && L((x) => { x.inventory.beast_core = 999; }) === 'stock' && L((x) => { x.inventory.beast_core = 99; }) === '', 'P LH: 99 of an item; 999 cores (99 cores is no limit)');
    assert(L((x) => { x.james.gu = { tier: 10, level: 10, xp: 0 }; }) === 'skill' && L((x) => { x.james.skills['Convergence Use'] = { tier: 10, level: 10, xp: 0 }; }) === 'skill' && L((x) => { x.james.gu = { tier: 10, level: 9, xp: 0 }; }) === '', 'P LH: a skill at T10 L10 (not L9)');
    assert(L((x) => { x.james.saturation = 100; }) === 'sat' && L((x) => { x.james.saturation = 99.9; }) === '', 'P LH: Saturation at 100%');
    assert(L((x) => { x.stats.clears = 9; }) === 'threads' && L((x) => { x.stats.clears = 8; }) === '', 'P LH: 9 threads (8: not yet)');
    assert(L((x) => { x.stats.marks = 127; x.coil.known = ['fungus']; }) === '' && L((x) => { x.stats.marks = 127; x.coil.known = ['fungus', 'gills']; }) === 'fed', 'P LH: Fed\'s cap: 35% + 15% = 50% is no hit, 35% + 30% is');
    assert(L((x) => { x.stats.marks = 511; x.coil.known = ['fungus']; }) === 'fed,marks', 'P LH: 45% + 15%: the marks and the cap');
    const lim = game(); lim.inventory.hare_raw = 99; lim.james.saturation = 100; lim.stats.clears = 9; A.noteRecords(lim);
    const lines = A.limitsHit(lim);
    assert(lines[1].includes(`from ${G.breakAt()}%`), 'P LH (TG7): the breakthrough\'s threshold read from the game');
    assert(lines.length === 3 && /takes 99 of anything/.test(lines[0]) && /stops at 100%/.test(lines[1]) && /9 awake, no more/.test(lines[2]), `P LH: the FAQ's lines, in the list's order, with the game's numbers (${lines.length})`);
    const all = game(); all.stats.limits = Object.fromEntries(A.LIMITS.map((x) => [x.k, 1]));
    const allL = A.limitsHit(all).join(' ');
    assert(/999 of each/.test(allL) && /T10 L10/.test(allL) && /at most 45% slower/.test(allL) && /by 50% at most/.test(allL), 'P LH: the caps\' own numbers');
    const lq = FAQ.find(([q]) => q === 'Limits you have hit');
    assert(lq && lq[2] === 'limits' && /None yet\./.test(lq[1](game())) && lq[1](lim).includes(lines[1]), 'P LH: the FAQ entry (its gate, none yet, the lines)');
    lim.inventory.hare_raw = 3; A.noteRecords(lim);
    assert(lim.stats.limits.item === 1, 'P LH: a limit hit stays on the list after the pile shrinks');

    // MM-k
    const k0 = game();
    assert(A.memKeys(k0).size === 0, 'P MM: a new game: no keys');
    k0.stats.marks = 1; k0.flags.ending = 'fought'; k0.flags.gills = true; k0.coil.known = ['roots'];
    assert([...A.memKeys(k0)].sort().join() === 'e:t:fought,i:gills,i:roots,m:0', `P MM: a mark, an ending, an Insight found or remembered (${[...A.memKeys(k0)]})`);
    const mm = game(); mm.coil.n = 2; const b0 = A.memKeys(mm); mm.flags.gills = true;
    const m1 = A.noteMemory(mm, b0, { title: 'The Hollow', text: 'Scene text.', reply: ['First.', 'Second.'], moved: false });
    assert(m1 && m1.k.join() === 'i:gills' && m1.c === 2 && m1.t === 'The Hollow' && m1.x === 'First.\n\nSecond.' && mm.stats.mem.length === 1, 'P MM: a find on the same screen: the reply');
    assert(A.noteMemory(mm, b0, { title: 'x', text: 'y', reply: ['z'] }) === null && mm.stats.mem.length === 1, 'P MM: kept once');
    const b1 = A.memKeys(mm); mm.stats.marks = 1;
    const m2 = A.noteMemory(mm, b1, { title: 'Ashfall', text: 'The village.', reply: ['The walk.'], moved: true });
    assert(m2.x === 'The village.' && m2.k.join() === 'm:0', 'P MM: a mark on a new screen: its text');
    // the review's H1 (RV-A, H1-k): an Insight found in a reply that moves on keeps the reply; with a mark too, the reply then the screen
    const hb = A.memKeys(mm); mm.flags.fungus = true;
    assert(A.noteMemory(mm, hb, { title: 'Blackwater', text: 'The stream.', reply: ['Spore print.'], moved: true }).x === 'Spore print.', 'P MM (H1-k): an Insight on a new screen: the reply');
    const hb2 = A.memKeys(mm); mm.flags.bl_tracker = true; mm.stats.marks = 1 | 8;
    assert(A.noteMemory(mm, hb2, { title: 'Into the Blackroot', text: 'The road.', reply: ['Tracks.'], moved: true }).x === 'Tracks.\n\nThe road.', 'P MM (H1-k): an Insight and a mark in one tap: the reply, then the screen');
    const b2 = A.memKeys(mm); mm.flags.lore1 = true;
    assert(A.noteMemory(mm, b2, { title: 'T', text: 'Only text.', reply: [], moved: false }).x === 'Only text.', 'P MM: no reply: the scene\'s text');
    const b3 = A.memKeys(mm); mm.flags.a1_outcome = 'victory'; mm.stats.marks = 3 | 8;
    const m4 = A.noteMemory(mm, b3, { title: 'End', text: 'E.', moved: true });
    assert(m4.k.sort().join() === 'e:a:victory,m:1' && mm.stats.mem.length === 6, 'P MM: two keys at once: one memory');
    // TG3: the real forage → stream: the fungus's memory holds the find, not the stream's text
    let fz = null;
    for (let seed = 1; seed < 60 && !fz; seed++) {
        const fg = game(seed); goTo(fg, SCENES, 'forage'); const fb2 = A.memKeys(fg), s0 = fg.scene;
        const r0 = choose(fg, SCENES, 0); if (!fg.flags.fungus) continue;
        const pr = landParts(r0.lines); const fv = sceneView(fg, SCENES);
        fz = { m: A.noteMemory(fg, fb2, { title: fv.title, text: fv.text, reply: pr.reply, moved: fg.scene !== s0 }), scene: fg.scene, text: fv.text };
    }
    assert(fz && fz.scene === 'stream' && /Spore print/.test(fz.m.x) && fz.m.x !== fz.text && fz.m.k.join() === 'i:fungus', `P MM (TG3): the fungus, forage → stream: the find kept (${fz && fz.m.x.slice(0, 40)})`);
    // TG6 (the review's L7): a broken entry can't break the view
    const bk = game(); bk.stats.mem = [null, 5, { k: 'i:gills' }, { k: [7, 'i:gills'], c: 'x', t: null, x: 3 }];
    let bv = null; try { bv = A.archiveView(bk); } catch { bv = null; }
    assert(bv && bv.mems.length === 1 && bv.mems[0].what.join() === 'Insight: Ghost-gill' && bv.mems[0].c === 0 && bv.mems[0].text === '3', 'P MM (TG6): broken entries left out, no throw');
    const bb = A.memKeys(bk); bk.flags.gills = true;
    assert(A.noteMemory(bk, bb, { text: 'x' }) === null, 'P MM: a key in a broken entry still counts as kept');
    assert(A.noteMemory(mm, A.memKeys(mm), { text: 'n' }) === null, 'P MM: nothing new: none');
    const om = game(); delete om.stats.mem; const ob = A.memKeys(om); om.flags.gills = true;
    const om1 = A.noteMemory(om, ob, { text: 'x' });
    assert(om1 && om.stats.mem.length === 1 && om1.k.join() === 'i:gills', 'P MM: an old save starts its list with its next first');
    const op = game(); delete op.stats.mem; op.flags.gills = true; const opb = A.memKeys(op);
    assert(A.noteMemory(op, opb, { text: 'x' }) === null && op.stats.mem === undefined, 'P MM: what an old save reached before is no memory');
    assert(A.memLabel('m:0') === 'Coil mark: the Wilds' && A.memLabel('e:t:fought') === 'The tribute: Lu Han beaten' && A.memLabel('i:gills') === 'Insight: Ghost-gill' && A.memLabel('i:nope') === '' && A.memLabel('m:9') === '', 'P MM: the labels');
    // the real path: a mark brought by entering the village, the words as the screen shows them
    const rp = game(); const rb = A.memKeys(rp); goTo(rp, SCENES, 'village'); const v = sceneView(rp, SCENES);
    const rm = A.noteMemory(rp, rb, { title: v.title, text: v.text, reply: ['The road.'], moved: true });
    assert(rm && rm.k.join() === 'm:0' && rm.x === v.text && v.text.length > 100 && rm.t === v.title, 'P MM: the village: the mark, its words as shown');
    rewind(rp);
    assert(rp.stats.mem.length === 1 && rp.stats.mem[0].x === v.text, 'P MM: kept by the rewind');
    const mv = A.archiveView(rp);
    assert(mv.mems.length === 1 && mv.mems[0].what.join() === 'Coil mark: the Wilds' && mv.mems[0].c === 1 && mv.mems[0].text === v.text, 'P MM: the view');
    const full = game(); const fb = A.memKeys(full); full.stats.marks = 511; full.stats.ends = A.ENDINGS.map((x) => x.k); full.coil.known = A.INSIGHTS.map((x) => x.f);
    assert(A.memKeys(full).size === 30 && A.noteMemory(full, fb, { text: 'x' }).k.length === 30, 'P MM: 30 keys at most (9 marks, 8 endings, 13 Insights)');
    // TG4 (the review's M2, RV-A, M2-s): Act 1's snapshot holds no second copy
    const sn = game(); for (let i = 0; i < 12; i++) sn.stats.mem.push({ k: [`i:x${i}`], c: 1, t: 'T', x: 'x'.repeat(800) }); sn.stats.feats.kills_100 = 1; sn.stats.limits.item = 1;
    const sb = JSON.stringify(sn).length; G.startActCoil(sn, 1);
    assert(!('mem' in sn.coil.snap.stats) && !('feats' in sn.coil.snap.stats) && !('limits' in sn.coil.snap.stats) && sn.stats.mem.length === 12 && JSON.stringify(sn).length < sb + 3000, `P MM (TG4): the snapshot leaves the records out (${sb} → ${JSON.stringify(sn).length})`);
    sn.coil.why = 'choice'; rewind(sn);
    assert(sn.stats.mem.length === 12 && sn.stats.feats.kills_100 === 1 && !('mem' in sn.coil.snap.stats), 'P MM (TG4): an Act 1 rewind keeps the game\'s own');
    const KEY_SCREENS = ['village', 'tribute', 'fo_start', 'bl_start', 'dw_enter', 'ah_enter', 'ht_start', 'rt_start', 'a1_end', 'bluff_win', 'tribute_paid', 'collectors_won', 'collectors_lost', 'rt_truth_won', 'rt_accord', 'rt_duel_won', 'rt_taken'];
    const ks = KEY_SCREENS.reduce((n, id) => { const t0 = SCENES[id].text; return n + String(typeof t0 === 'function' ? t0(game()) : t0).length; }, 0);
    assert(ks < 17000, `P MM (TG4): the 9 marks' and 8 endings' screens, all kept: ${ks} characters (the Insights' replies add about 4–5 KB more)`);
    const avg = Object.keys(SCENES).reduce((n, id) => { try { const t0 = SCENES[id].text; return n + String(typeof t0 === 'function' ? t0(game()) : t0 || '').length; } catch { return n; } }, 0) / Object.keys(SCENES).length;
    assert(avg * 30 < 20000, `P MM: 30 scenes at the average length stay under 20 KB (${Math.round(avg * 30)})`);

    // the wiring (main.js as text)
    assert(/const relSnap = \(\) => \(\{[^\n]*mem: g \? memKeys\(g\) : null, scene: g\?\.scene \}\)/.test(main), 'P MM: every action\'s snapshot holds the keys and the scene');
    assert(/noteRecords\(g\);\n[^\n]*\n\s*if \(snap0\.mem && \[\.\.\.memKeys\(g\)\]\.some\(\(k\) => !snap0\.mem\.has\(k\)\)\) \{ const v = sceneView\(g, SCENES\); noteMemory\(g, snap0\.mem, \{ title: v\.title, text: v\.text, reply: p\.reply, moved: g\.scene !== snap0\.scene \}\); \}\n\s*\} catch[^\n]*\n\s*p\.reply = landReply\(/.test(main), 'P MM + FT: land() notes the records, and the memory (the screen read only for a new key: L8), before the repeat filter');
    assert(/\$\{esc\(T\.feats\(a\.feats\.filter\(\(f\) => f\.got\)\.length, a\.featsOf\)\)\}/.test(main) && /<details class="memory-row"><summary>/.test(main) && /paras\(m\.text\)/.test(main), 'P: the Archive draws the feats and the memories');
    assert(/\.memory-row summary \{ display: list-item;/.test(css), 'P MM (L6): the memory keeps its open marker');
    // TG5: the view and the markup carry a feat's and a memory's own Coil and a memory's title
    const t5 = game(); t5.coil.n = 4; t5.stats.feats = { kills_100: 0, meals_100: 3 }; t5.stats.mem = [{ k: ['m:0'], c: 2, t: 'Ashfall', x: 'Words.' }];
    const v5 = A.archiveView(t5);
    assert(v5.feats.find((x) => x.name === 'A hundred kills').c === 0 && v5.feats.find((x) => x.name === 'A hundred meals').c === 3 && v5.mems[0].c === 2 && v5.mems[0].title === 'Ashfall', 'P (TG5): the view keeps each one\'s Coil and the title');
    assert(/<span>\$\{f\.got \? esc\(T\.onCoil\(f\.c\)\) : ''\}<\/span>/.test(main) && /<span>\$\{esc\(m\.title \|\| m\.what\[0\] \|\| ''\)\}<\/span><span class="sub">\$\{esc\(\[\.\.\.m\.what, T\.onCoil\(m\.c\)\]\.join\(' · '\)\)\}<\/span>/.test(main), 'P (TG5): the markup draws them');
    const n289 = NOTES.find(([ver]) => ver === '0.11.289');
    assert(n289 && /deadline/i.test(n289[1]) && /feats/i.test(n289[1]) && /memor/i.test(n289[1]) && /limits/i.test(n289[1]), 'P: What\'s new');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
