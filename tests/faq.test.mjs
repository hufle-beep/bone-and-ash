// Run: node tests/faq.test.mjs — v0.11.83 (owner picks P1 + T1 + R1): the FAQ (js/core/faq.js), modelled on Selene's.
// The gates on real saves, the unfolding (fresh phone, new entries, seen), the storage text, search, the per-tab entries,
// and the answers' numbers against the game's own values (so a balance change can't leave the FAQ stale).
import { readFileSync } from 'node:fs';
import { FAQ, FAQ_TEST, FAQ_TAB, FAQ_KEY, faqState, faqText, faqCheck, faqList, faqHasNew, faqSeen, faqMatch } from '../js/core/faq.js';
import { newGame, ensureBars, deserialize, SATIETY_PER_HOUR, HUNGRY_AT, STARVE_HP_PER_HOUR, COIL_GROWTH, coilMult, fmtMult, breakAt, realmName, ITEM_CAP, USE_CAP, REL_MAX, bumpRel, inAct1 } from '../js/core/game.js';
import { FAM, FED_EXTRA_PER_HOUR, YUKI_CAP, YUKI_HOURS } from '../js/core/tasks.js';
import { PRIMARIES, COL_GROUPS } from '../js/story/meridians.js';
import { CONDENSE_SIT_COST, FAIL_XP_FRACTION } from '../js/core/formulas.js';
import { TARGETS, HEAD_START } from '../js/core/coil.js';
import '../js/story/prologue.js'; // the scenes and the Coil hooks, as in the game

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log('  PASS ', l); } else { fail++; console.error('  FAIL ', l); } };
const load = (f) => deserialize(readFileSync(new URL(`../saves/${f}`, import.meta.url), 'utf8'), { force: true });
const text = (q, g = {}) => { const e = FAQ.find(([x]) => x === q); return typeof e[1] === 'function' ? e[1](g) : e[1]; };
const plain = (s) => s.replace(/<[^>]+>/g, '');

// the list itself
const qs = FAQ.map(([q]) => q);
assert(FAQ.length === 20 && new Set(qs).size === qs.length, `20 entries, no question twice (${FAQ.length})`);
assert(FAQ.every(([, , gate]) => gate in FAQ_TEST), 'every entry has a known gate');
assert(Object.keys(FAQ_TEST).every((k) => FAQ.some(([, , gate]) => gate === k)), 'every gate opens at least one entry');
assert(Object.values(FAQ_TAB).every((q) => FAQ.find(([x]) => x === q)?.[2] === 'start'), 'every tab\'s entry exists and is there from a new game (the James tab\'s button finds its entry on Day 1)');
assert(FAQ_KEY === 'boneash.faq.v1', 'the phone key is boneash.faq.v1 (never renamed)');
const fresh = ensureBars(newGame(7, { closed: true }));
assert(FAQ.every(([q, a]) => !/undefined|NaN|\[object/.test(typeof a === 'function' ? a(fresh) : a) && !/undefined|NaN/.test(typeof a === 'function' ? a({}) : a)), 'no answer shows undefined or NaN (a game, and none)');
assert(FAQ.every(([, a]) => !/\bd6\b|🎲|a 6 always/.test(typeof a === 'function' ? a(fresh) : a)), 'no answer talks of dice');

// the numbers come from the game
const fed = plain(text('HP, Convergence and Fed'));
assert(fed.includes(`drops ${SATIETY_PER_HOUR} an hour (${SATIETY_PER_HOUR + FED_EXTRA_PER_HOUR} while working`) && fed.includes(`Below ${HUNGRY_AT}`) && fed.includes(`${STARVE_HP_PER_HOUR} HP an hour`), 'Fed: the rates, the hunger line and starving from game.js / tasks.js');
const fam = plain(text('Work cards and familiarity'));
assert([1, 2, 3].every((t) => fam.includes(`${FAM[t].name} at ${FAM[t].at}`) && fam.includes(`×${FAM[t].speed}`)) && fam.includes(`×${USE_CAP}`), 'familiarity: the three steps, their counts and speeds from FAM');
const g2 = load('v0.11.7-long-forest-coil2.json');
const coil = plain(text('The Coil', g2));
assert(coil.includes(`1 + ${COIL_GROWTH} × earlier Coils`) && coil.includes(`×${fmtMult(coilMult(g2))} this Coil`) && g2.coil.n === 2 && coilMult(g2) === 1 + COIL_GROWTH, 'the Coil: the bonus from COIL_GROWTH, this Coil\'s from the save (Coil 2)');
assert(coil.includes('A Coil ended by choice (Bite the tail, or going round again at the end of Act 1) still counts as a Coil, but adds nothing to the faster learning.') && coil.includes('which starts the act he is in over') && coil.includes(`1 + ${COIL_GROWTH} × earlier Coils not ended by choice)`) && plain(text('Skills and checks', g2)).includes('Every earlier Coil not ended by choice'), 'v0.11.86 (#53, C1 + G1 + W1): the FAQ says a Coil ended by choice adds no bonus');
assert(plain(text('Skills and checks', g2)).includes(`×${fmtMult(coilMult(g2))}`) && plain(text('Skills and checks')).includes(`fail pays ${Math.round(FAIL_XP_FRACTION * 100)}%`), 'skills: the Coil bonus and the fail share');
assert(/costs sleep: at dawn only half/.test(plain(text('Days, sleep and the night'))) && /after a fight in the night, only half/.test(plain(text('HP, Convergence and Fed'))), 'the night: a fight in the night costs sleep, half back at dawn (v0.11.92, O1)');
assert(plain(text('Days, sleep and the night')).includes('ends at midnight (00:00') && !/push|exhaust/i.test(plain(text('Days, sleep and the night'))) && !FAQ.some(([q, a]) => /push through|exhausted/i.test(typeof a === 'function' ? a(fresh) : a)), 'the night: midnight, no Push through the night or Exhaustion anywhere in the FAQ (v0.11.91)');
assert(plain(text('Meditation, Saturation and realms')).includes(`${CONDENSE_SIT_COST} Qi`) && plain(text('Meditation, Saturation and realms')).includes(`${breakAt()}%`) && plain(text('Meditation, Saturation and realms')).includes(realmName(1)), 'meditation: the sit\'s Qi, the breakthrough point, the realm names');
assert(plain(text('What is the goal?')).includes(`Coil ${TARGETS[0]}`) && plain(text('What is the goal?')).includes(`Coil ${TARGETS[1]}`), 'the goal: the targets from coil.js');
assert(plain(text('What carries over')).includes(`${Math.round(HEAD_START * 100)}%`) && plain(text('The hammerspace')).includes(`${ITEM_CAP}`) && plain(text('Yuki\'s job')).includes(`×${YUKI_CAP}`), 'carry-over head start, the hammerspace cap and Yuki\'s cap from the game');
assert(plain(text('Yuki\'s job')).includes(`${String(YUKI_HOURS[0]).padStart(2, '0')}:00 and ${YUKI_HOURS[1]}:00`), 'Yuki\'s hours from tasks.js');
assert(plain(text('Meridians')).includes(`${PRIMARIES.length} primaries and their ${COL_GROUPS.reduce((n, c) => n + c.size, 0)} collaterals`) && PRIMARIES.length === 12, 'the meridian counts from meridians.js (12 and 66)');
{ const gr = ensureBars(newGame(7, { closed: true })); bumpRel(gr, 'Mei Lin', 999, -999); assert(gr.rel['Mei Lin'].f === REL_MAX && gr.rel['Mei Lin'].a === -REL_MAX && plain(text('People, friendship and affection')).includes(`−${REL_MAX} to ${REL_MAX}`), 'the relationship range: the game clamps at the number the FAQ names'); }
assert(inAct1({ flags: { ending: 'won' }, scene: 'fo_start', minutes: 7 * 1440 + 6 * 60 }) && plain(text('Act 1')).includes('Day 8'), 'Act 1 starts on Day 8 (inAct1), as the FAQ says');
// numbers that live only in the UI's code (main.js imports the DOM, so it is read as text)
{ const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const sizes = /TEXT_SIZES = \[([\d, ]+)\]/.exec(main)[1].split(',').map(Number);
  assert(plain(text('Saving and settings')).includes(`text size (${sizes[0]}–${sizes[sizes.length - 1]}%)`), 'text sizes from main.js');
  assert(/BAK = \{ '5m': 5 \* 60e3, '30m': 30 \* 60e3, '2h': 120 \* 60e3 \}/.test(main) && plain(text('Saving and settings')).includes('after 5 minutes, 30 minutes and 2 hours of play'), 'the backups\' times from main.js');
  assert(/HOLD_MS = 500\b/.test(main) && plain(text('How do I play?')).includes('Hold a card for half a second'), 'hold for half a second (HOLD_MS)');
  assert((main.match(/\$\{slot\(\d\)\}/g) || []).length === 3 && plain(text('Saving and settings')).includes('three slots'), 'three save slots'); }
// every bold label is a word the game uses (a button, a card, a tab), so the FAQ can't name a control that doesn't exist
{ const src = ['js/main.js', 'js/core/game.js', 'js/core/tasks.js', 'js/core/forms.js', 'js/core/meditate.js', 'js/core/coil.js', 'js/story/coil_scenes.js', 'js/story/prologue.js', 'js/story/longforest.js', 'js/story/again.js', 'js/core/replies.js', 'js/story/meridians.js', 'index.html'].map((f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')).join('\n').toLowerCase();
  const OWN = new Set(['kept:', 'back to the act\'s start:', 'work', 'story', 'convergence', 'cycle', 'fed', 'hp', 'familiarity', 'check', 'spar', 'brawl', 'great root-kin', 'friendship', 'affection', 'bonesinger', 'saturation', 'coil', 'james green', 'act 1', 'hold a card']);
  const missing = [];
  for (const [q, a] of FAQ) for (const m of (typeof a === 'function' ? a(fresh) : a).matchAll(/<b>(.+?)<\/b>/g)) { const t = m[1].toLowerCase().replace(/\s+/g, ' '); if (!OWN.has(t) && !src.includes(t)) missing.push(`${q}: ${m[1]}`); }
  assert(!missing.length, `every bold label is the game's own words (${missing.join('; ') || 'all found'})`); }

// the gates on real games
const on = (g, ctx) => Object.keys(FAQ_TEST).filter((k) => FAQ_TEST[k](g, ctx));
assert(on(fresh).join() === 'start', `a new game: only the start entries (${on(fresh)})`);
assert(on(fresh, { meditate: true }).join() === 'start,sit', 'the Meditate group on screen opens meditation');
const g1 = load('v0.8.5-day1-stream.json');
const g4 = load('v0.8.5-day4-mei-lin.json');
const a1 = load('v0.11.7-act1-coil2.json');
const lf0 = load('v0.8.5-long-forest-start.json');
assert(on(g2).includes('rewind') && on(g2).includes('coil') && on(g2).includes('work') && on(g2).includes('forest'), `the Long Forest on Coil 2: rewind, coil, work, forest (${on(g2)})`);
assert(on(a1).includes('act1') && !on(g1).includes('act1') && !on(g4).includes('act1'), `Act 1 only once in it (Act 1: ${on(a1)})`);
assert(!on(g1).includes('rewind') && !on(g1).includes('coil'), `Day 1, Coil 1: no Coil entries (${on(g1)})`);
assert(on(lf0).includes('forest') && !on(g1).includes('forest'), 'the Long Forest entry once reached');
const gf = ensureBars(newGame(7, { closed: true })); gf.combat = { enemies: [] };
assert(on(gf).includes('fight'), 'a fight on screen opens Fights');
const gp = ensureBars(newGame(7, { closed: true })); gp.rel = { Yuki: { f: 5, a: 0 }, Village: { f: 1, a: 0 } };
assert(!on(gp).includes('people'), 'Yuki and the Village alone are not people met');
gp.rel['Mei Lin'] = { f: 2, a: 0 }; gp.inventory = { hare_raw: 1 };
assert(on(gp).includes('people'), 'a person met opens People');
const gy = ensureBars(newGame(7, { closed: true })); gy.yuki.realm = 2;
assert(on(gy).includes('form'), 'Yuki at Core Formation (a second form) opens her forms');

// the unfolding (Selene's rules)
let st = faqState(null);
assert(st.fresh && st.u.start === 1, 'no state on the phone: a fresh one');
assert(faqState('{bad json').fresh && faqState('{"x":1}').fresh, 'junk on the phone: a fresh one');
faqCheck(st, g2);
assert(!faqHasNew(st) && faqList(st, g2).every((e) => !e.isNew) && faqList(st, g2).length > 7, 'first run on a phone: everything this save reached opens, none of it new');
st = faqState(faqText({ u: { start: 1 }, seen: {} }));
assert(!st.fresh, 'a kept state is not fresh');
faqCheck(st, fresh);
assert(!faqHasNew(st) && faqList(st, fresh).length === 9, 'the start entries (9) are never new');
const changed = faqCheck(st, g2);
const list = faqList(st, g2);
assert(changed && faqHasNew(st) && list.filter((e) => e.isNew).length === list.length - 9, `a later save on a phone that has the FAQ: its new entries are new (${list.filter((e) => e.isNew).map((e) => e.q)})`);
const first = list.find((e) => e.isNew).q;
assert(faqSeen(st, first) && !faqSeen(st, first) && !faqList(st, g2).find((e) => e.q === first).isNew, 'opening an entry marks it seen, once');
const back = faqState(faqText(st));
assert(!back.fresh && back.seen[first] === 1 && JSON.stringify(back.u) === JSON.stringify(st.u), 'the phone\'s text round-trips (unlocks and seen)');
assert(!faqCheck(back, g2), 'nothing new on the same save: no save to the phone');
faqCheck(back, g1);
assert(faqList(back, g1).length === faqList(back, g2).length, 'a new game keeps what the phone unlocked');
const order = faqList(back, g2).map((e) => e.q);
assert(order.join('|') === qs.filter((q) => order.includes(q)).join('|'), 'entries keep the FAQ\'s order');

// search
assert(faqMatch('Days, sleep and the night', text('Days, sleep and the night'), ['sleep', 'night']) && !faqMatch('Days, sleep and the night', text('Days, sleep and the night'), ['sleep', 'zebra']), 'search: every word must be in the question or answer');
assert(!faqMatch('X', '<b>bold</b>', ['b>']) && faqMatch('X', '<b>bold</b>', ['bold']), 'search reads the text, not the tags');

// v0.11.103 (BF1, Opus's review low 2): the browser test puts each name into a CSS selector `details[data-faq="…"]`
{ const bad = FAQ.map(([q]) => q).filter((q) => /["\\]/.test(q)); assert(bad.length === 0, `no FAQ question holds a double quote or a backslash (the browser test's selectors) (${JSON.stringify(bad)})`); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
