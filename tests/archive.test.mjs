// Run: node tests/archive.test.mjs — v0.11.287 (owner pick P55-A: CM-5 + IN-13 + AR-t + SV): the Archive (js/core/archive.js).
// A the Coil marks (CM-5): Fed's drain with the marks (awake, a card's extra untouched, asleep half), set by the arcs' scenes from the
// game's start (not only after a won Act 1), the Blackroot's regions, not by a rewind's own first scene, kept by every rewind; the Fed
// bar's lines. B the Insights (IN-13): 13, each with its words, the Coil remembers the three new ones, the view shows found ones (kept
// or this Coil's). C the endings (`stats.ends`) and the old save's fill (SV, game.js archiveFill). D foes met: every fight named.
// E the tab's wiring (read as text: index.html, main.js, sw.js, the CSS, the key). F the FAQ and What's new.
// Mutation: tools/mutate.mjs on archive.js and game.js's marks.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENES } from '../js/story/prologue.js';
import * as G from '../js/core/game.js';
import * as A from '../js/core/archive.js';
import { ARCS, ARC_AT } from '../js/core/threads.js';
import { rewind, endCoil, REMEMBER, KNOW_TEXT, KEEP_FLAGS } from '../js/core/coil.js';
import { goTo, enterHook, choose, sceneView } from '../js/core/story.js';
import { tabWhy } from '../js/core/coil.js';
import * as T from '../js/core/tasks.js';
import { NO_DICE_TUNE } from '../js/story/nodice_tune.js';
import { FIGHTS as LF_FIGHTS } from '../js/story/longforest.js';
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
    assert(['bl_tracker', 'grove', 'roots'].every((f) => g.coil.known.includes(f)) && !g.coil.known.includes('told_hearth'), 'B: the Coil remembers what was found');
    rewind(g);
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
    assert(T.marks(0, 9, 0) === 'Coil marks: 0 of 9' && T.marks(3, 9, 15) === 'Coil marks: 3 of 9 · Fed drains 15% slower' && T.insights(4, 13) === 'Insights: 4 of 13', 'E: the headings');
}

// F: the FAQ and What's new
{
    const fed = faqText('HP, Convergence and Fed', game());
    assert(/Every <b>Coil mark<\/b>.*5% slower, up to 45% with all 9/.test(fed), 'F: the FAQ: the marks\' drain');
    assert(/the Archive \(Insights, Coil marks, foes met, endings seen\)/.test(faqText('What carries over', game())), 'F: the FAQ: what carries over');
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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
