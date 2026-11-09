/** Bone and Ash — UI. Renders the story, combat, sheet, hammerspace, journal and saves. */
import { actionOpen, actionLabel, FORM_LINES, lineState, rankLabel, hasForm } from './core/forms.js';
import { coilMult, coilMultNext, wakeDay, fmtMult, clockParts } from './core/game.js';
import {
    newGame, ensureBars, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, skillCheck, xpToNext, clockLabel, clockLabelG, realmName, yukiForm,
    startCombat, combatStep, combatFlee, COMBAT_ACTIONS, noDiceDc, serialize, deserialize, peekSave, SaveError, BONESINGER_TIERS, itemCap, jamesDr, hpRegenPct, actionCost, actionDmg, guardBonus, FIELD_ROUNDS, fieldDamage, qiShield,
} from './core/game.js';
import { sceneView, choose, goTo, gives } from './core/story.js';
import { showPicked, isTaskHub, isQueueScreen, isTaskChoice, taskCards, taskLabel, taskMinutes, taskOutcome, dryOutcome, outcomeOf, runTask, FAM, yukiLane, setYuki, nextStep } from './core/tasks.js';
import { SCENES, ITEMS } from './story/prologue.js';
import { TASK_HUBS } from './story/task_hubs.js';
import { landParts } from './core/replies.js'; // v0.11.68 (A1 + B2 + C1)
import { againView, skipPlan, skipRun } from './story/again.js'; // v0.11.35 (P1-a)
import { coilActive, endCoil, targetsText, tabWhy } from './core/coil.js';
import { medCards, runMed, isSitChoice, medActivity, useLine, LATE_TAG, canMeditate } from './core/meditate.js';
import { FAQ_KEY, FAQ_TAB, faqState, faqText, faqCheck, faqList, faqHasNew, faqSeen, faqMatch } from './core/faq.js'; // v0.11.83 (P1 + T1 + R1)
import { meridianRow } from './story/meridians.js';
import { realmShockHpBonus } from './core/formulas.js';
import * as ART from './art/art.js';
const sceneArt = (key) => { ART.setArtState?.({ yukiForm: yukiForm(g) }); return ART.sceneArt(key); };

const AUTO = 'boneash.auto';
const SLOT = (n) => `boneash.slot${n}`;
const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

let g = null;
let tab = 'story';
let menu = 'main'; // v0.11.10: the main menu ('main' | 'saves' | 'settings'), shown on every open; null = in the game
let hadSave = false; // an autosave existed when the game opened (else the menu says Begin)
let lastResult = null; // { lines, fail }: since v0.11.68 only warnings (a card that ends the Coil, an error)
// v0.11.68 (owner picks A1 + B2 + C1): the reply to the last choice or card shows under the scene text; its gains and the
// friendship / affection it moved go to Results (js/core/replies.js sorts the lines)
let lastReply = [];
let combatLog = null;
const view = document.getElementById('view');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const paras = (t) => String(t).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => (p === '*' ? '<p class="end-mark" aria-hidden="true">⁂</p>' : `<p>${md(p).replace(/\n/g, '<br>')}</p>`)).join('');
const pct = (a, b) => `${Math.max(0, Math.min(100, (a / b) * 100)).toFixed(1)}%`;
const n1 = (x) => (Math.round(x * 10) / 10).toString();
const val = (v) => (typeof v === 'function' ? v(g) : v);
const sceneTitle = (id) => val(SCENES[id]?.title) || id;
const dieHtml = (line) => md(line).replace(/🎲(\d)/g, '<span class="die" aria-label="rolled $1">$1</span>');

/* ---------------- save safety (v0.8.6) ---------------- */

// Rolling backups by play time, plus one taken before risky moves. Storage keys never change once released.
const BAK = { '5m': 5 * 60e3, '30m': 30 * 60e3, '2h': 120 * 60e3 };
const BAK_KEY = (k) => `boneash.bak.${k}`;
const BAK_META = 'boneash.bak.meta';
const BROKEN = 'boneash.broken';
const RISKY_SCENES = { tribute: 'the tribute', rt_elder: 'Shen Qiu', coil_end: 'the Coil' };
let recovery = null; // { raw, err } while the autosave can't be loaded
let lastTick = Date.now();
let storageWarned = false;
let prevScene = null;
let lastPress = 0;

/* ---------------- tasks (v0.9.0, preview) ---------------- */
// v0.11.34 (D1): Incremental Mode only; Story Mode's code stays in place unused (deleted later, D2) and 'boneash.tasks' is no longer read
// no dice anywhere (v0.9.3); Incremental Mode only since v0.11.34, Story Mode's code out in v0.11.41, the dice code in v0.11.45
// v0.11.64 (owner 02:04): no timer, no game speeds, no queue: every card resolves at once and moves the clock. The old
// per-phone keys 'boneash.speed' and 'boneash.testspeeds' are no longer read (never renamed or reused).
const PAUSE_DEATH_KEY = 'boneash.pausedeath'; // per phone: '0' = off; on by default (v0.10.0: pause before the forecast death; v0.11.64, B1: ask before a card that ends the Coil)
let askFatal = store.get(PAUSE_DEATH_KEY) !== '0';
let fatalArmed = { id: null, at: 0 }; // v0.11.64 (B1): the card tapped once that would end the Coil
// v0.11.10: checks are hidden on every card and in every result line (owner 2026-11-06: immersion); the James tab still shows the skills
const SHOW_CHECKS_KEY = 'boneash.showchecks'; // per phone: '1' = show them (Settings → Show checks)
let showChecks = store.get(SHOW_CHECKS_KEY) === '1';
const TEXT_SIZE_KEY = 'boneash.textsize'; // per phone: 90–130 (%)
const TEXT_SIZES = [90, 100, 110, 120, 130];
let textSize = (() => { const v = Number(store.get(TEXT_SIZE_KEY)); return TEXT_SIZES.includes(v) ? v : 100; })();
const applyTextSize = () => { document.documentElement.style.fontSize = textSize === 100 ? '' : `${textSize}%`; };
applyTextSize();
const CHK_NUM = '-?\\d+(?:\\.\\d+)?';
const CHK = `(?:GU|Convergence Use|Fight|Qi Use) ${CHK_NUM} (?:\\/ DC ${CHK_NUM}|\\+ 🎲\\d(?: = ${CHK_NUM})? vs (?:DC )?${CHK_NUM}|\\+ d6 vs DC ${CHK_NUM})`;
const RX_DEFEND = new RegExp(`: you defend \\(${CHK}\\)`);
const RX_ACTION = new RegExp(`^(.+?): ${CHK} — `);
const RX_LINE = new RegExp(`^${CHK} (?:—|→) (.+)$`);
const RX_TAG = new RegExp(`${CHK}(?: (?:→|—) (?:passes|partly|fails|double|full|partial|fail))?`, 'g'); // v0.11.17: the task cards' bands too
/** A result or log line without its check (v0.11.10). '' = drop the line. */
function hideCheck(l) {
    if (showChecks || typeof l !== 'string') return l;
    let t = l.replace(RX_DEFEND, '').replace(RX_ACTION, '$1 — ');
    const m = RX_LINE.exec(t);
    if (m) return /double haul/.test(m[1]) ? 'A double haul.' : /^partly/.test(m[1]) ? 'Only partly.' : '';
    return t.replace(RX_TAG, '').trim();
}
const shownLines = (lines) => (showChecks ? lines : lines.map(hideCheck).filter((l) => l));
/** A card's tag without its check: what's left is time, Qi and effects. */
const hideTag = (t) => (showChecks || !t ? t : String(t).replace(RX_TAG, '').replace(/^\s*·\s*|\s*·\s*$/g, '').replace(/(\s*·\s*){2,}/g, ' · ').trim());
let lastWritten = null; // v0.11.8: the autosave text this tab last wrote or loaded (a closing tab never overwrites a newer save from another tab)
let panel = 'cards'; // the phone's switch under the story: 'cards' | 'results' (wide screens show both)
let taskResults = []; // newest first: { title, sum, lines, fail } — the last 8 tasks (all of it is in the Journal too)
let unseen = 0;
const RESULTS_MAX = 8;
/** One line for a finished task: what happened, what it gave, what levelled up, what it cost. */
function summarize(lines) {
    const bits = [];
    const band = lines.map((l) => / — (a double haul|done|partly|failed)$/.exec(l)?.[1]).find(Boolean);
    if (band) bits.push(band);
    const items = [];
    for (const l of lines) {
        const keep = /(?:you keep|in total): (.+)\.$/.exec(l);
        if (keep) { items.length = 0; items.push(...keep[1].split(', ')); continue; }
        if (/^Yuki (comes|leaves)/.test(l)) continue; // her haul has its own bit below
        for (const m of l.matchAll(/(?:^|[ .])(\+\d+ [A-Z][^.,]*?)(?=[.,]|$)/g)) if (!/XP|Qi Use|Fight/.test(m[1])) items.push(m[1]);
    }
    bits.push(...[...new Set(items)].slice(0, 3));
    for (const l of lines) { const up = /^(.+?) \+\d+(?: XP)? → (T\d+ L\d+)$/.exec(l); if (up) bits.push(`${up[1].replace(' (bond)', '')} → ${up[2]}`); }
    let hp = 0;
    for (const l of lines) for (const m of l.matchAll(/−(\d+(?:\.\d+)?) HP/g)) hp += Number(m[1]);
    if (hp) bits.push(`−${Math.round(hp * 10) / 10} HP`);
    if (lines.some((l) => /^Yuki (comes|leaves)/.test(l))) { const y = lines.find((l) => /^Yuki (comes|leaves)/.test(l)); const got = /\+(\d+) /.exec(y); bits.push(got ? `Yuki +${got[1]}` : 'Yuki: nothing'); }
    if (lines.some((l) => /You fold up where you stand/.test(l))) bits.push('collapsed'); // both collapses (a task's and the story's)
    for (const l of lines) { const r = /^([^:]+): (friendship [+−][\d.]+)?(?:, )?(affection [+−][\d.]+)?$/.exec(l); if (r && (r[2] || r[3])) bits.push(`${r[1]} ${[r[2], r[3]].filter(Boolean).join(', ')}`); } // v0.11.68 (C1)
    return bits.join(' · ');
}
let resultSeq = 0;
const openResults = new Set(); // v0.11.11: Results entries the player opened stay open when the screen redraws
// v0.11.67 (owner pick D2): a screen's card groups fold. Story never folds; the hub's own group (Camp chores, Around
// Ashfall…) and Meditate start open; the work groups (a hub's menus: Forage, Hunt, Practice, Explore, Go deep…) start
// folded, their heading showing how many cards they hold. What the player opens or folds is kept on this phone, per group name.
const NONEXT_KEY = 'boneash.nonext'; // v0.11.72 (N1): '1' = the next-step line hidden for good on this phone
const GROUPS_KEY = 'boneash.groups';
const groupOpen = (() => { try { const o = JSON.parse(store.get(GROUPS_KEY) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch { return {}; } })();
const isGroupOpen = (name, dflt) => (typeof groupOpen[name] === 'boolean' ? groupOpen[name] : dflt);
function setGroupOpen(name, open, dflt) {
    if (isGroupOpen(name, dflt) === open) return; // the toggle a redraw's own `open` fires changes nothing
    groupOpen[name] = open;
    store.set(GROUPS_KEY, JSON.stringify(groupOpen));
}
/** The menus' labels on this hub: the groups that start folded. */
const workGroups = (hubId) => { const cfg = TASK_HUBS[hubId]; return new Set(cfg ? [...Object.values(cfg.menus || {}), ...Object.values(cfg.doorMenus || {})].map((m) => m.label) : []); };
const groupHtml = (name, cards, dflt) => `<details class="grp" data-grp="${esc(name)}" data-dflt="${dflt ? 1 : 0}"${isGroupOpen(name, dflt) ? ' open' : ''}><summary><h2>${esc(name)} <span class="count">· ${cards.length}</span></h2></summary><div class="cards">${cards.join('')}</div></details>`;
function addResult(title, lines, fail, { sumLines = lines, quiet = false } = {}) {
    const sum = summarize(sumLines); // v0.11.68 (the Opus review): the summary reads all the action's lines (Yuki's haul, a collapse)
    taskResults.unshift({ id: ++resultSeq, title, sum, lines, fail });
    if (!quiet) announce(`${title}${sum ? `: ${sum}` : ''}`);
    taskResults.length = Math.min(taskResults.length, RESULTS_MAX);
    if (panel !== 'results') unseen += 1;
}
const relSnap = () => ({ rel: JSON.parse(JSON.stringify(g?.rel || {})), coil: `${g?.coil?.n}|${g?.coil?.act}` });
/** v0.11.68: one action's lines: the reply under the scene text, the gains and relationship changes as a Results entry
 * (`always`: an entry even with no gains, as a task card always had). */
function land(title, lines, fail, snap0, { always = false } = {}) {
    const p = landParts(lines, snap0.rel, g.rel, { coilChanged: snap0.coil !== `${g.coil?.n}|${g.coil?.act}` });
    lastReply = p.reply;
    lastResult = null;
    const sum = summarize(p.sumLines);
    const entry = p.gains.length || always || /collapsed/.test(sum);
    if (entry) addResult(title, p.gains, fail, { sumLines: p.sumLines, quiet: true });
    // one announcement: the reply, then what landed in Results (render() then skips the scene title, so the reply is heard)
    const say = `${p.reply.join(' ')}${entry ? ` ${title}${sum ? `: ${sum}` : ''}` : ''}`.trim();
    if (say) { announce(say); announcedScene = g.scene; }
}
const durLabel = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} m` : ''}` : `${m} m`);
const onTaskHub = () => g && !recovery && isTaskHub(g);
const onQueueScreen = () => g && !recovery && isQueueScreen(g, SCENES); // v0.11.14: task screens and the resting places

const pbar = (a, b, label) => `<div class="stroke" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(Math.max(0, Math.min(100, (a / b) * 100)))}"><i style="width:${pct(a, b)}"></i></div>`;
/** v0.11.64 (A1): where a card ends: "→ 14:20", with the day when it isn't today; nothing in the Long Forest (it has no clock). */
const endAt = (m) => { if (g.flags?.lf_active) return ''; const same = clockParts(m).day === clockParts(g.minutes).day; return `→ ${same ? clockLabelG(g, m).replace(/^Day \d+, /, '') : clockLabelG(g, m)}`; };
/** v0.11.64 (B1): a card whose dry run ends the Coil asks for a second tap (Settings can turn this off). True = go ahead. */
function fatalOk(id, out) {
    if (!askFatal || !out?.death) return true;
    if (fatalArmed.id === id && Date.now() - fatalArmed.at < 6000) { fatalArmed = { id: null, at: 0 }; return true; }
    fatalArmed = { id, at: Date.now() };
    lastResult = { lines: [`James ${out.death === 'hunger' ? 'starves' : 'collapses'} on this (${clockLabelG(g, out.deathAt ?? out.end)}): the Coil would end there. Tap it again to do it anyway.`], fail: true };
    render();
    return false;
}
/** v0.11.64 (the Fable review): a card's dry run never stops the screen from drawing; a card it can't play shows no end. */
const safeOutcome = (f) => { try { return f(); } catch { return null; } };
/** v0.11.64: a task card, at once. */
function doTask(id) {
    const out = safeOutcome(() => taskOutcome(g, SCENES, id));
    if (!fatalOk(id, out)) return;
    const label = taskLabel(g, SCENES, id);
    const rel0 = relSnap();
    const r = runTask(g, SCENES, id);
    land(label, r.lines, r.fail, rel0, { always: !r.stopped }); // v0.11.68: a door or collapse shows its reply in the scene it opens
    autosave(); render();
    if (r.stopped) window.scrollTo({ top: 0, behavior: smoothScroll() });
}

/* ---------------- task mode: every screen as cards (v0.9.5) ---------------- */

/** Game minutes a story choice will take (a dry run on a copy; no dice, so it is exact). 0 = it happens at once (a fight starts, a screen opens). */
function storyMinutes(idx) { return storyOutcome(idx)?.minutes || 0; }
/** v0.11.64 (A1, B1 for story choices, the Fable review): a story choice played on a copy: its time, where it ends, whether it ends the Coil. */
function storyOutcome(idx) {
    if (idx >= 1000) return null;
    try { const c = JSON.parse(JSON.stringify(g)); const m0 = c.minutes; choose(c, SCENES, idx); return outcomeOf(c, m0); } catch { return null; }
}
/** Take a story choice (at once; the clock moves by its time). */
function playChoice(idx) {
    try {
        const ch = SCENES[g.scene]?.choices?.[idx];
        const label = ch ? String(val(ch.text)) : 'End it in one move.';
        if (!fatalOk(`${g.scene}#${idx}`, storyOutcome(idx))) return; // v0.11.64 (B1)
        if (ch && /^Stay lost/.test(label)) backupBefore('the Long Forest');
        const rel0 = relSnap();
        const r = choose(g, SCENES, idx);
        land(label, r.lines, r.roll ? !r.roll.success : false, rel0); // v0.11.68
        if (r.combat) { startCombat(g, r.combat(g)); combatLog = null; }
        autosave(); render(); window.scrollTo({ top: 0, behavior: smoothScroll() });
    } catch (err) { lastResult = { lines: [String(err.message || err)], fail: true }; lastReply = []; render(); showError(err); }
}
const pickedMark = (c) => showPicked(g, SCENES, c.index, c.label); // v0.11.32 (P2-a), tasks.js
const PICKED_SR = '<span class="sr-only"> (picked before)</span>';
const storyCardHtml = (c) => {
    const out = c.disabled ? null : storyOutcome(c.index); // v0.11.64 (A1, B1)
    const mins = out ? out.minutes : 0;
    const tag = c.disabled ? c.reason : hideTag(c.tag);
    const pk = pickedMark(c);
    const dies = out?.death ? ` <b class="dies">${out.death === 'hunger' ? 'Starves here' : 'Collapses here'}</b>` : '';
    return `<button class="card story${/fight/.test(c.tag) ? ' fightish' : ''}${out?.death ? ' fatal' : ''}${pk ? ' picked' : ''}" data-story="${c.index}" ${c.disabled ? 'disabled aria-disabled="true"' : ''}>${md(c.label)}${dies}${pk ? PICKED_SR : ''}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}<span class="len">${mins ? `${durLabel(mins)} ${endAt(out.end)}` : 'at once'}</span></button>`;
};
const medCardHtml = (m) => {
    const out = m.open ? safeOutcome(() => (m.task ? taskOutcome(g, SCENES, m.task) : medOutcome(m.id))) : null; // v0.11.64 (A1, B1)
    const mins = out ? out.minutes : m.minutes;
    const dies = out?.death ? ` <b class="dies">${out.death === 'hunger' ? 'Starves here' : 'Collapses here'}</b>` : '';
    return `<button class="card med${out?.death ? ' fatal' : ''}" ${m.task ? `data-run="${esc(m.task)}"` : `data-med="${esc(m.id)}"`} ${m.open ? '' : 'disabled aria-disabled="true"'}>${md(m.label)}${dies}${hideTag(m.tag) ? `<span class="tag">${esc(hideTag(m.tag))}</span>` : ''}<span class="len">${mins ? `${durLabel(mins)} ${endAt(out ? out.end : g.minutes + mins)}` : 'at once'}</span></button>`;
};
/** v0.11.64: a Meditate card that runs off the task list (runMed), played on a copy; a screen change (the breakthrough's warning, the tribulation scene) is not timed here. */
function medOutcome(id) {
    if (id === 'med:bt') return null;
    try { return dryOutcome(g, (c) => runMed(c, SCENES, id)); } catch { return null; }
}

function resultsPaneHtml() {
    return taskResults.length ? taskResults.map((r) => `<details class="res${r.fail ? ' fail' : ''}" data-rid="${r.id}"${openResults.has(r.id) ? ' open' : ''}><summary><b>${md(r.title)}</b> <span>${esc(r.sum)}</span></summary><div>${shownLines(r.lines).map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div></details>`).join('') : '<p class="note">Nothing yet. What James does lands here, newest on top; tap one for the details. The Journal keeps all of it.</p>';
}

/** Any screen in task mode: picture and story on top; everything you can do below, as cards. */
/** v0.11.35 (P1-a): a scene read in an earlier Coil folds to its first paragraph under a memory line; "Read it all again" opens it. */
let readAllScene = null;
function proseHtml(v) {
    const a = againView(g, v);
    if (!a.fold) return `<div class="prose">${paras(v.text)}</div>`;
    const all = readAllScene === `${g.scene}#${g.coil?.n || 1}`; // per scene and Coil (Fable review)
    return `<div class="prose again"><p class="memory">${md(a.memory)}</p>${paras(a.first)}${all ? paras(a.rest) : '<button class="readall" data-readall="1" aria-expanded="false"><span aria-hidden="true">▸ </span>Read it all again</button>'}</div>`;
}
function renderCardScreen() {
    const v = sceneView(g, SCENES);
    const hub = onTaskHub();
    const qs = onQueueScreen(); // v0.11.14: the task screens and the resting places
    const med = medCards(g, SCENES);
    const medIds = new Set(med.filter((m) => m.task).map((m) => m.task));
    const sitHere = (c) => c.index < 1000 && isSitChoice(SCENES[g.scene].choices[c.index], g.scene); // condensation lives on the Meditate card
    const story = (hub ? v.choices.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)) : v.choices).filter((c) => !sitHere(c));
    let hubHtml = '';
    let hubTop = '';
    if (qs) {
        const cards = taskCards(g, SCENES).filter((c) => !medIds.has(c.id) && (c.status === 'open' || c.status === 'late')); // v0.11.37 (D-a): 'late' = would end past the day's end (00:00 since v0.11.91), shown locked // v0.11.17 (owner pick 1a): "done for today" cards are hidden
        const groups = [];
        for (const c of cards) { let gr = groups.find((x) => x.name === c.group); if (!gr) groups.push(gr = { name: c.group, cards: [] }); gr.cards.push(c); }
        const cardHtml = (c) => {
            const out = c.status === 'open' ? safeOutcome(() => taskOutcome(g, SCENES, c.id)) : null; // v0.11.64 (A1, B1): one dry run: its time, where it ends, whether it ends the Coil
            const mins = out ? out.minutes : c.minutes;
            const fam = c.kind === 'work' ? ` · ${FAM[c.tier].name}${c.next != null ? ` ${c.fam}/${c.next}` : ''}` : '';
            const ctag = hideTag(c.tag);
            const tag = c.status === 'late' ? LATE_TAG : c.status !== 'open' ? 'done for today — back tomorrow' : c.kind === 'door' ? `opens the scene${ctag ? ` · ${ctag}` : ''}` : (ctag || (showChecks ? 'no check' : ''));
            const dies = out?.death ? ` <b class="dies">${out.death === 'hunger' ? 'Starves here' : 'Collapses here'}</b>` : '';
            const when = c.kind === 'door' || !mins || !out ? '' : ` ${endAt(out.end)}`;
            return `<button class="card${c.kind === 'door' ? ' door' : ''}${out?.death ? ' fatal' : ''}${c.check && showChecks ? ` b-${c.check.band}` : ''}" data-run="${esc(c.id)}" ${c.status !== 'open' ? 'disabled' : ''}>${md(c.label)}${dies}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}${c.status === 'open' ? `<span class="len">${mins ? durLabel(mins) : 'at once'}${when}${fam}</span>` : ''}</button>`;
        };
        const yl = yukiLane(g);
        // v0.11.64 (D1): her job counts James's game time (06:00–19:00); the screen says how much is left, no bar
        const yLeft = yl ? Math.max(1, yl.len - yl.progress) : 0;
        const yHtml = yl ? `<div class="yuki-lane"><div><b>Yuki:</b> ${esc(yl.label)} <span class="note">${showChecks ? `Fight ${yl.check} / DC ${yl.dc} · ` : ''}${yl.on ? `next haul after ${durLabel(yLeft)} of your time (06:00–19:00)` : `${durLabel(yl.len)} a haul`} · ${FAM[yl.tier].name}</span></div><button class="btn${yl.on ? ' primary' : ''}" data-yuki="1">${yl.on ? 'On' : 'Off'}</button></div>` : '';
        const ns = store.get(NONEXT_KEY) === '1' ? '' : nextStep(g, SCENES); // v0.11.72 (N1): Selene's next-step line, ✕ hides it for good
        hubTop = `${ns ? `<div class="nstep"><b>Next step</b> <span>${esc(ns)}</span><button class="nstep-x" data-nonext="1" aria-label="Hide the next-step line">✕</button></div>` : ''}${yHtml}`;
        const work = workGroups(g.scene);
        hubHtml = groups.map((gr) => groupHtml(gr.name, gr.cards.map(cardHtml), !work.has(gr.name))).join(''); // v0.11.67 (D2)
    }
    const sk = v.end || hub ? { steps: 0 } : skipPlan(g, SCENES); // v0.11.35 (P1-a): a stretch read before, 2 steps or more
    const skipHtml = sk.steps >= 2 ? `<button class="card story skip" data-skip="1">Skip to the next choice.<span class="tag">${sk.steps} scenes you know</span><span class="len">${esc(durLabel(sk.minutes))} · at once</span></button>` : '';
    const storyHtml = v.end
        ? `<h2>Story</h2><div class="cards">${story.map(storyCardHtml).join('')}<button class="card story" data-new="1">Start a new game</button><button class="card story" data-tab-go="sheet">See how James ended up</button></div>` // v0.11.26: an end's own choices first (Go round again…)
        : story.length ? `<h2>Story</h2><div class="cards">${skipHtml}${story.map(storyCardHtml).join('')}</div>` : '';
    const medOpen = med.filter((m) => m.open || m.late || m.show); // v0.11.46 (Q1): a sit short of Qi shows, locked, with the reason // v0.11.37 (D-a): a card that would end past the day's end (00:00 since v0.11.91) shows, locked, with that tag // v0.11.17 (pick 1a): only what can run now (collaterals until they open, locked sits and meridians, Break through until ready)
    const medHtml = medOpen.length ? groupHtml('Meditate', medOpen.map(medCardHtml), true) : ''; // v0.11.67 (D2): starts open, folds
    view.innerHTML = `<section class="fade-in">
${statusHtml()}
<div class="plate">${sceneArt(v.art)}</div>
<header class="head"><div class="place">${esc(v.place || g.location)}</div><h1 class="title">${esc(v.title)}</h1></header>
${proseHtml(v)}
${replyHtml()}
<div class="below">
${resultHtml()}
${hubTop}
<div class="panel-switch" role="tablist"><button role="tab" data-panel="cards" aria-selected="${panel === 'cards'}">Cards</button><button role="tab" data-panel="results" aria-selected="${panel === 'results'}">Results${unseen ? ` <span class="badge">${unseen}</span>` : ''}</button></div>
<div class="split">
<div class="pane tasks${panel === 'cards' ? ' on' : ''}">${storyHtml}${hubHtml}${medHtml}</div>
<div class="pane results${panel === 'results' ? ' on' : ''}"><h2>Results</h2>${resultsPaneHtml()}</div>
</div>
</div>
</section>`;
}

/** A fight in task mode: the picture and the round on top; the actions as cards below. */
function renderCombatCards() {
    const c = g.combat;
    const acts = Object.entries(COMBAT_ACTIONS).filter(([id]) => actionOpen(g, id) && !(id === 'spikes' && c.fieldUsed)).map(([id, a0]) => {
        const a = { ...a0, label: actionLabel(g, id, a0.label) }; // v0.10.4: only the forms James can sing, named for his best one
        const cost = (a.keeps === 'blade' && c.bladeFormed) || (a.keeps === 'spear' && c.spearFormed) || (a.field && c.fieldUsed) ? 0 : actionCost(g, a);
        const d = actionDmg(g, a);
        const off = cost > g.james.qi;
        if (off) return ''; // v0.11.17 (pick 1a): a move he can't afford is hidden (Guard costs nothing)
        const v = n1(skillCheck(a.skill === 'GU' ? g.james.gu : g.james.skills[a.skill]) + (c.adapt?.[id] || 0));
        const tgt = c.enemies.find((e) => e.hp > 0);
        const plain = tgt && showChecks ? `${a.skill} ${v} / DC ${noDiceDc(tgt.dc + a.dcMod)} · ${Math.round((d[0] + d[1]) / 2)} dmg` : '';
        return `<button class="card fightish" data-act="${id}" ${off ? 'disabled' : ''}>${esc(a.label)}<span class="tag">${a.guard ? `${showChecks ? 'GU ' : ''}defence +${guardBonus(g)} this round${hasForm(g, 'buckler') && !c.style ? ' · covers Yuki' : ''}` : a.qshield ? `soaks ${qiShield(g)} this round` : a.field ? `${FIELD_ROUNDS} rounds · ${fieldDamage(g)} to each attacker · once a fight` : plain}${a.reach ? ' · a full hit holds it off' : ''}${a.pierce ? ' · ignores armour' : ''}${cost ? ` · ${cost} Qi` : ''}${a.stagger ? ' · staggers' : ''}${off ? ' · not enough Qi' : ''}</span></button>`;
    }).join('');
    const flee = c.flee ? `<button class="card" data-flee="1">Run${showChecks ? `<span class="tag">GU ${n1(skillCheck(g.james.gu))} / DC ${noDiceDc(Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk)))}</span>` : ''}</button>` : '';
    const foes = c.enemies.map((e) => `<div class="foe${e.hp <= 0 ? ' down' : ''}"><span>${esc(e.name)}${e.staggered ? (c.style === 'unarmed' ? ' (down)' : ' (reeling)') : ''}</span><div class="stroke"><i style="width:${pct(Math.max(0, e.hp), e.hpMax)}"></i></div></div>`).join('');
    const yuki = `<div class="foe"><span>Yuki${c.yukiOut ? ' (watching)' : ''}</span><div class="stroke" style="background:rgba(242,239,230,0.08)"><i style="width:${pct(g.yuki.hp, yukiHpMax(g))};background:var(--bone)"></i></div></div>`;
    view.innerHTML = `<section>
${statusHtml()}
<div class="plate">${sceneArt(val(SCENES[g.scene].art))}</div>
<header class="head"><div class="place">${esc(sceneTitle(g.scene))}</div><h1 class="title">Round ${c.round}</h1></header>
<div class="prose round">${shownLines(combatLog || c.log).map((l) => dieHtml(l)).join('<br>') || 'The fight begins.'}</div>
<div class="below">
<div class="foes">${foes}${yuki}</div>
<h2>Fight</h2><div class="cards">${acts}${flee}</div>
</div>
</section>`;
}

const freshGame = () => ensureBars(newGame(Math.floor(Math.random() * 2 ** 31), { closed: true })); // meridians closed at the start (v0.9.6)
const bakMeta = () => { try { return JSON.parse(store.get(BAK_META)) || { play: 0, at: {}, when: {} }; } catch { return { play: 0, at: {}, when: {} }; } };
function writeKey(k, s) { if (!store.set(k, s) && !storageWarned) { storageWarned = true; showError('Could not save: the storage for this site is full or blocked. Download your save: ☰ Menu → Saves.'); } }

/** Throws a SaveError if the state points at a scene this version doesn't have. */
function checkScene(s) { if (!SCENES[s.scene]) throw new SaveError('notSave', `The save points at a scene this version doesn't have (${s.scene}).`); return s; }

function rolling(s) {
    const m = bakMeta();
    const now = Date.now();
    m.play += Math.min(now - lastTick, 120e3); // idle time counts at most 2 minutes per step
    lastTick = now;
    for (const [k, ms] of Object.entries(BAK)) {
        if (m.play - (m.at[k] || 0) >= ms) { writeKey(BAK_KEY(k), s); m.at[k] = m.play; m.when[k] = now; }
    }
    store.set(BAK_META, JSON.stringify(m));
}
function backupBefore(label) {
    if (!g) return;
    try { writeKey(BAK_KEY('before'), serialize(g)); } catch { return; }
    const m = bakMeta(); m.when.before = Date.now(); m.label = label; store.set(BAK_META, JSON.stringify(m));
}

function autosave() {
    if (!g) return;
    delete g.runPart; // v0.11.64: no bars any more (game.js queueDrop empties an old save's)
    let s;
    try { s = serialize(g); } catch (err) { showError(err.message); return; } // never write a broken state
    writeKey(AUTO, s);
    lastWritten = s;
    rolling(s);
    expRemind();
    if (g.scene !== prevScene && RISKY_SCENES[g.scene]) backupBefore(RISKY_SCENES[g.scene]);
    prevScene = g.scene;
}

function load() {
    const raw = store.get(AUTO);
    lastWritten = raw;
    hadSave = !!raw;
    if (!raw) { g = freshGame(); prevScene = g.scene; return; }
    try { g = checkScene(deserialize(raw)); prevScene = g.scene; } catch (err) { g = null; recovery = { raw, err }; }
}

function download(text, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = name;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[^\d]/g, '');

function backupList() {
    const m = bakMeta();
    const names = { '5m': 'Last 5 minutes', '30m': 'Last 30 minutes', '2h': 'Last 2 hours', before: `Before ${m.label || 'a risky move'}` };
    return Object.keys(names).map((k) => ({ k, name: names[k], raw: store.get(BAK_KEY(k)), when: m.when?.[k] })).filter((b) => b.raw);
}
const descOf = (raw) => { const p = peekSave(raw); return p ? `${sceneTitle(p.scene)} — ${clockLabel(p.minutes)}${p.coil ? ` · ${p.act === 1 ? 'Act 1, ' : ''}Coil ${p.coil}` : ''}` : 'Unreadable'; }; // v0.11.13: the Coil too (Incremental Mode, as on Continue)

/* ---------------- saves push (v0.11.9): share, export all, reminder, status ---------------- */

// A packed save is 'BAZ1:' + base64(gzip(the save text)); loading accepts it or plain JSON.
async function packText(text) {
    try {
        const cs = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
        const buf = new Uint8Array(await new Response(cs).arrayBuffer());
        let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        return 'BAZ1:' + btoa(bin);
    } catch { return null; }
}
async function unpackText(text) {
    const t = String(text || '').trim();
    if (!t.startsWith('BAZ1:')) return t;
    try {
        const bin = atob(t.slice(5)); const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        return await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    } catch { throw new SaveError('unreadable', 'The packed save is not readable (damaged or cut off).'); }
}
function copyText(text, done, fail) {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done, fail)); else fallbackCopy(text, done, fail);
}

// Share to GitHub without a token (Selene's shareToGitHub): GitHub's own new-file page with the save filled in.
const GH_REPO = 'hufle-beep/bone-and-ash', GH_DIR = 'saves', GH_URL_MAX = 7500;
function ghFileName(ext) {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    const when = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
    return `${when}-incremental-${String(g.scene).replace(/[^\w-]+/g, '-')}.${ext}`;
}
function openOut(url) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
async function shareToGitHub() {
    autosave();
    const json = serialize(g);
    const packed = await packText(json);
    const body = packed || json;
    const base = `https://github.com/${GH_REPO}/new/main?filename=${encodeURIComponent(`${GH_DIR}/${ghFileName(packed ? 'txt' : 'json')}`)}`;
    const full = `${base}&value=${encodeURIComponent(body)}`;
    expMark();
    if (full.length <= GH_URL_MAX) { openOut(full); note('GitHub opens with the save filled in. Sign in, then tap "Commit changes".'); return; }
    const go = (ok) => { openOut(base); note(ok ? `Save copied (${Math.round(body.length / 1024)} KB): too long for a link. On GitHub, paste it into the empty file, then tap "Commit changes".` : 'The save could not be copied. Use "Download save file" instead.'); };
    copyText(body, () => go(true), () => go(false));
}

// Export all / restore all: the autosave, the 3 slots and the backups in one file. Storage keys stay the same.
const BAK_NAMES = ['5m', '30m', '2h', 'before'];
function allSaves() {
    const slots = {}, backups = {};
    for (const n of [1, 2, 3]) { const r = store.get(SLOT(n)); if (r) slots[n] = r; }
    for (const k of BAK_NAMES) { const r = store.get(BAK_KEY(k)); if (r) backups[k] = r; }
    const m = bakMeta();
    return { boneashAllSaves: 1, saved: Date.now(), auto: store.get(AUTO), slots, backups, when: m.when || {}, label: m.label || '' };
}
function exportAll() { autosave(); expMark(); download(JSON.stringify(allSaves()), `bone-and-ash-all-saves-${stamp()}.json`); }
let pendingAll = null; // an all-saves file waiting for its confirm tap
function readAll(text) {
    let o; try { o = JSON.parse(text); } catch { return null; }
    if (!o || o.boneashAllSaves !== 1 || typeof o.auto !== 'string') return null;
    checkScene(deserialize(o.auto)); // throws: nothing is written
    const ok = (r) => { try { checkScene(deserialize(r)); return true; } catch { return false; } };
    const slots = {}, backups = {}; let skipped = 0;
    for (const n of [1, 2, 3]) { const r = o.slots?.[n]; if (typeof r === 'string') { if (ok(r)) slots[n] = r; else skipped += 1; } }
    for (const k of BAK_NAMES.filter((x) => x !== 'before')) { const r = o.backups?.[k]; if (typeof r === 'string') { if (ok(r)) backups[k] = r; else skipped += 1; } }
    return { auto: o.auto, slots, backups, when: o.when || {}, saved: o.saved, skipped };
}
function restoreAll(p) {
    backupBefore('restoring all saves'); // this game goes to "before"; the file's own "before" backup is not restored
    for (const n of [1, 2, 3]) { if (p.slots[n]) writeKey(SLOT(n), p.slots[n]); else store.del(SLOT(n)); }
    const m = bakMeta();
    for (const k of BAK_NAMES.filter((x) => x !== 'before')) { if (p.backups[k]) { writeKey(BAK_KEY(k), p.backups[k]); m.when[k] = p.when[k]; } else { store.del(BAK_KEY(k)); delete m.when[k]; } }
    store.set(BAK_META, JSON.stringify(m));
    g = checkScene(deserialize(p.auto)); lastResult = null; lastReply = []; combatLog = null; autosave();
}

// The export reminder (Selene's round 5): after an hour of play and a day since the last export or reminder.
const EXP_KEY = 'boneash.exp', EXP_PLAY = 3600e3, EXP_WAIT = 86400e3;
const expState = () => { try { const o = JSON.parse(store.get(EXP_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch { return {}; } };
const expWrite = (o) => store.set(EXP_KEY, JSON.stringify(o));
function expMark() { const o = expState(); o.t = Date.now(); o.pl = bakMeta().play; expWrite(o); }
function expRemind() {
    const o = expState(); if (o.off) return;
    const pl = bakMeta().play, now = Date.now();
    if (o.t == null || o.t > now) { o.t = now; o.pl = pl; expWrite(o); return; } // first time, or the clock went back
    if (o.pl == null || o.pl > pl) { o.pl = pl; expWrite(o); return; }
    if (now - o.t < EXP_WAIT || pl - o.pl < EXP_PLAY) return;
    expMark(); showNotice('No save downloaded for over a day. Browser storage can be cleared; a downloaded file is the copy that survives.');
}

// "Copy status as text" for bug reports.
async function gameVersion() {
    try { const k = (await caches.keys()).find((x) => /^bone-ash-/.test(x)); if (k) return k.replace('bone-ash-', ''); } catch { /* no cache */ }
    try { const t = await (await fetch('sw.js', { cache: 'no-store' })).text(); const m = /VERSION = 'bone-ash-([^']+)'/.exec(t); if (m) return m[1]; } catch { /* offline */ }
    return '?';
}
async function statusText() {
    const j = g.james;
    const lines = [
        `Bone and Ash ${await gameVersion()} · ${new Date().toISOString()}`,
        `Mode: Incremental (every action at once) · tab ${tab}`,
        `Scene: ${g.scene} (${sceneTitle(g.scene)}) · ${clockLabel(g.minutes)}${g.coil ? ` · ${g.coil.act === 1 ? 'Act 1' : 'Prologue'}, Coil ${g.coil.n}` : ''}${g.combat ? ' · in a fight' : ''}`,
        `James: ${realmName(j.realm)}, Saturation ${n1(j.saturation)}% · HP ${n1(j.hp)} / ${jamesHpMax(g)} · Convergence ${n1(j.qi)} / ${n1(jamesQiMax(g))} · Fed ${Math.round(j.satiety)} · days slept ${wakeDay(g)}`,
        'Journal (newest first):',
        ...g.log.slice(-5).reverse().map((e) => `  ${clockLabel(e.at)} ${sceneTitle(e.scene)}${e.lines.length ? `: ${e.lines.join(' / ')}` : ''}`.replace(/🎲(\d)/g, 'd6=$1')),
        `Browser: ${navigator.userAgent}`,
    ];
    return lines.join('\n');
}

function renderRecovery() {
    const bak = backupList();
    view.innerHTML = `<section class="page recovery"><h1>The save didn't load</h1>
<p class="lede">${esc(recovery.err.message || String(recovery.err))} Nothing has been overwritten. Choose what to do.</p>
<div class="btns"><button class="btn primary" data-rec="anyway">Load it anyway</button><button class="btn" data-rec="export">Download the damaged save</button></div>
${bak.length ? `<h2>Backups</h2>${bak.map((b) => `<div class="row"><span>${esc(b.name)}</span><span class="note">${esc(descOf(b.raw))}${b.when ? ` · saved ${esc(new Date(b.when).toLocaleString())}` : ''}</span><div class="btns sub"><button class="btn" data-rec-bak="${b.k}">Restore</button></div></div>`).join('')}` : '<p class="note">No backups yet.</p>'}
<h2>Start over</h2>
<p class="note">The damaged save is kept on the phone (and can still be downloaded) either way.</p>
<div class="btns"><button class="btn" data-rec="fresh">Start a new game</button></div>
<p class="note" id="saveNote"></p></section>`;
}
function leaveRecovery(next) {
    store.set(BROKEN, recovery.raw);
    g = next; recovery = null; prevScene = g.scene; lastResult = null; lastReply = []; combatLog = null; autosave(); setTab('story');
}
function onRecovery(b) {
    if (b.dataset.rec === 'export') return download(recovery.raw, `bone-and-ash-damaged-${stamp()}.json`);
    if (b.dataset.rec === 'fresh') return leaveRecovery(freshGame());
    try {
        if (b.dataset.rec === 'anyway') return leaveRecovery(checkScene(deserialize(recovery.raw, { force: true })));
        if (b.dataset.recBak) return leaveRecovery(checkScene(deserialize(store.get(BAK_KEY(b.dataset.recBak)))));
    } catch (err) { note(`That didn't work either: ${err.message}`); }
}

/* ---------------- error bar (v0.8.6) ---------------- */

const errbar = document.createElement('div');
errbar.id = 'errbar'; errbar.setAttribute('role', 'alert'); errbar.hidden = true;
errbar.innerHTML = '<span class="msg"></span><button class="btn" data-err="copy">Copy</button><button class="btn" data-err="close" aria-label="Close">✕</button>';
document.body.appendChild(errbar);
function showError(err) {
    const msg = typeof err === 'string' ? err : `${err?.message || err}${err?.stack ? `\n${String(err.stack).split('\n').slice(1, 3).join('\n')}` : ''}`;
    errbar.querySelector('.msg').textContent = msg;
    errbar.dataset.full = `Bone and Ash error · scene ${g?.scene || recovery?.err?.kind || '?'} · ${new Date().toISOString()}\n${msg}`;
    errbar.hidden = false;
}
errbar.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-err]');
    if (!b) return;
    if (b.dataset.err === 'close') { errbar.hidden = true; return; }
    const text = errbar.dataset.full || '';
    const done = () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy'; }, 1500); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done)); else fallbackCopy(text, done);
});
function fallbackCopy(text, done, fail) {
    const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* the message stays on screen */ }
    t.remove();
    if (ok) done(); else fail?.();
}

/* ---------------- notice bar (v0.11.9): the export reminder ---------------- */

const notebar = document.createElement('div');
notebar.id = 'notebar'; notebar.setAttribute('role', 'status'); notebar.hidden = true;
notebar.innerHTML = '<span class="msg"></span><button class="btn" data-note="export">Download now</button><button class="btn" data-note="close" aria-label="Close">✕</button>';
document.body.appendChild(notebar);
function showNotice(msg) { notebar.querySelector('.msg').textContent = msg; notebar.hidden = false; }
notebar.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-note]');
    if (!b) return;
    notebar.hidden = true;
    if (b.dataset.note === 'export' && g) { expMark(); download(serialize(g), `bone-and-ash-${clockLabel(g.minutes).replace(/[^\w]+/g, '-')}.json`); }
});
window.addEventListener('error', (ev) => showError(ev.error || ev.message));
window.addEventListener('unhandledrejection', (ev) => showError(ev.reason));

/* ---------------- story ---------------- */

function statusHtml() {
    return `<div class="status">
<div class="bar hp"><b>${n1(g.james.hp)} / ${jamesHpMax(g)}</b>HP${pbar(g.james.hp, jamesHpMax(g), 'HP')}</div>
<div class="bar qi"><b>${n1(g.james.qi)} / ${n1(jamesQiMax(g))}</b>Convergence${pbar(g.james.qi, jamesQiMax(g), 'Convergence')}</div>
<div class="bar food"><b>${Math.round(g.james.satiety)}</b>Fed${pbar(g.james.satiety, 100, 'Fed')}</div>
<div class="clock"><span class="clk">${clockLabelG(g)}</span></div></div>`;
}

/** v0.11.68 (A1): the reply to the last choice or card, under the scene text. */
function replyHtml() {
    return lastReply.length ? `<div class="prose reply">${lastReply.map((l) => paras(l)).join('')}</div>` : ''; // paras: a multi-paragraph reply keeps its paragraphs
}
function resultHtml() {
    if (!lastResult || !shownLines(lastResult.lines).length) return '';
    return `<div class="result${lastResult.fail ? ' fail' : ''}">${shownLines(lastResult.lines).map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div>`;
}

function renderStory() {
    return g.combat ? renderCombatCards() : renderCardScreen();
}

/* ---------------- sheet / bag / journal / saves ---------------- */

function skillRow(name, nd, sub = '') {
    return `<div class="row"><span>${esc(name)}</span><span>T${nd.tier} L${nd.level} · check ${n1(skillCheck(nd))}</span><div class="stroke"><i style="width:${pct(nd.xp, xpToNext(nd))}"></i></div><span class="sub">${nd.xp} / ${xpToNext(nd)} XP${sub ? ` — ${esc(sub)}` : ''}</span></div>`;
}
function renderSheet() {
    const j = g.james;
    const cu = j.skills['Convergence Use'];
    const rel = Object.entries(g.rel).filter(([k]) => k !== 'Village').map(([k, r]) => `<div class="row"><span>${esc(k)}</span><span>friendship ${r.f} · affection ${r.a}</span></div>`).join('');
    view.innerHTML = `<section class="page">
<h1>James Green</h1>
<p class="lede">Forty, a doctorate three days old (mycology and computational biology). From a civilisation that grows its cities, tools and ships from qi-attuned wood. Now: here.</p>
<div class="row"><span>HP</span><span>${n1(j.hp)} / ${jamesHpMax(g)} · DR ${jamesDr(g)}</span><span class="sub">HP regen ${hpRegenPct(j.realm)}% per Cycle${j.realm >= 9 ? ` · heals ${realmShockHpBonus(j.realm)} HP every round in a fight` : ''}${j.realm >= 7 ? ' · blows from lower realms lose force' : ''}${j.realm >= 11 ? '; two realms below can\'t hurt you at all' : ''}.</span></div>
<div class="row"><span>Convergence (Qi + Bonesinger)</span><span>${n1(j.qi)} / ${n1(jamesQiMax(g))}</span></div>
<div class="row"><span>Realm</span><span>${esc(realmName(j.realm))} · Saturation ${n1(j.saturation)}%</span><span class="sub">${meridianRow(g)}. No herbs, no pills, no tribulation: the Ouroboros Axiom composts this world's poisoned Qi.</span></div>
<h2>Skills</h2>
${skillRow('GU', j.gu, 'General Use: anything he has no skill for, and his defence')}
${skillRow('Convergence Use', cu, 'the song: what he can sing, how hard it hits, the Qi blast and shield')}
<p class="note">${esc(BONESINGER_TIERS[Math.min(cu.tier, BONESINGER_TIERS.length - 1)] || '')}</p>
${Object.entries(FORM_LINES).map(([k, l]) => { const s = lineState(g, k); return `<div class="row"><span>${esc(l.label)}</span><span>${s.now ? esc(s.now.name) : '—'}${s.next ? ` <span class="note">(next: ${esc(s.next.name)} at ${rankLabel(s.next.at)})</span>` : ''}</span></div>`; }).join('')}
${g.coil ? `<h2>The Coil</h2><p class="note">${g.coil.act === 1 ? 'Act 1, ' : ''}Coil ${g.coil.n}. ${coilActive(g) ? `Bite the tail to start ${g.coil.act === 1 ? 'Act 1' : 'the prologue'} over at ${g.coil.act === 1 ? 'its start' : 'the first dawn'}: James keeps his familiarity and what he knows; his realm, skills and meridians, the hammerspace and the world start over. This Coil he learns ×${fmtMult(coilMult(g))} as fast. ${tabWhy(g) === 'choice' ? `A Coil ended by choice still counts as a Coil, but adds nothing to the faster learning: the next learns ×${fmtMult(coilMultNext(g, true))} too. A collapse, a lost fight or a lost deadline adds to it (×${fmtMult(coilMultNext(g, false))}).` : `The deadline went against him, so this bite adds to the faster learning: the next learns ×${fmtMult(coilMultNext(g, false))}.`}` : 'The Coil turns during the prologue (until the tribute is settled) and during Act 1 (until Shen Qiu is settled, and again at its end).'}</p><p class="note"><b>Targets:</b> ${esc(targetsText(g))}</p>${coilActive(g) ? '<div class="btns"><button class="btn" data-bite="1">Bite the tail</button></div><p class="note" id="saveNote"></p>' : ''}` : ''}
<h2>Pillars</h2>
<div class="row"><span>Ouroboros Axiom</span><span>DR 1</span><span class="sub">The body as a closed garden: what comes in is filtered and returned clean.</span></div>
<div class="row"><span>Parallel Cognition Engine</span><span>9 threads</span><span class="sub">One of them is always on watch, if he asks.</span></div>
<h2>Yuki</h2>
<p class="note">His root-kin: a small white cat, born the same day, meridians mirroring his. Mortal Vessel.</p>
<div class="row"><span>HP · Qi</span><span>${n1(g.yuki.hp)} / ${yukiHpMax(g)} · ${n1(g.yuki.qi)} / ${n1(yukiQiMax(g))}</span></div>
${skillRow('Fight', g.yuki.fight)}${skillRow('Qi Use', g.yuki.qiUse, 'shares every award through the bond')}
${rel ? `<h2>People</h2>${rel}` : ''}
<h2>The rules</h2>
<p class="note">How checks, XP, regeneration and hunger work, and more as James gets further: the FAQ.</p><div class="btns"><button class="btn" data-tab-go="faq">Open the FAQ</button></div>
</section>`;
}
function renderBag() {
    const items = Object.entries(g.inventory).filter(([, n]) => n > 0);
    view.innerHTML = `<section class="page"><h1>Hammerspace</h1>
<p class="lede">Folded space grown into his omnitool at birth. Infinite, in theory. In practice it refuses a hundredth of anything (a thousandth, for cores and spirit grass), which James has filed as a design flaw. ${items.length ? 'Slightly less embarrassing than it was.' : 'Currently: a lab coat\'s worth of nothing.'}</p>
${items.map(([id, n]) => `<div class="row"><span>${esc(ITEMS[id]?.name || id)}</span><span>× ${n}${n >= itemCap(id) ? ' · full' : ''}</span><span class="sub">${esc(ITEMS[id]?.note || '')}</span></div>`).join('') || '<p class="note">Go and find something. Preferably edible.</p>'}
</section>`;
}
function renderJournal() {
    const entries = g.log.slice().reverse().slice(0, 60).map((e) => `<div class="entry"><time>${clockLabel(e.at)}</time>${esc(sceneTitle(e.scene))}${shownLines(e.lines).length ? `<div class="note">${shownLines(e.lines).map((l) => dieHtml(l)).join('<br>')}</div>` : ''}</div>`).join('');
    view.innerHTML = `<section class="page"><h1>Journal</h1><p class="lede">${showChecks ? `${g.stats.checks} checks made, ${g.stats.wins} passed · ` : ''}${g.stats.kills} things that wanted to eat you, didn't · ${g.stats.meals} meals.</p>${entries || '<p class="note">Nothing yet. Give it a minute.</p>'}</section>`;
}
function renderSaves() {
    const bak = backupList();
    const slot = (n) => {
        const raw = store.get(SLOT(n));
        const desc = raw ? descOf(raw) : 'Empty';
        return `<div class="row"><span>Slot ${n}</span><span class="note">${esc(desc)}</span><div class="btns sub"><button class="btn" data-save="${n}">Save here</button>${raw ? `<button class="btn" data-load="${n}">Load</button>` : ''}</div></div>`;
    };
    view.innerHTML = `<section class="page menu-page"><div class="btns"><button class="btn" data-menu="main">← Menu</button></div><h1>Saves</h1>
<p class="lede">The game saves itself after every choice. Slots are for keeping a moment you might want back.</p>
${slot(1)}${slot(2)}${slot(3)}
<h2>Backups</h2>
<p class="note">Kept by themselves after 5 minutes, 30 minutes and 2 hours of play, and before a risky move. Restoring one keeps this game as the "before" backup.</p>
${bak.length ? bak.map((b) => `<div class="row"><span>${esc(b.name)}</span><span class="note">${esc(descOf(b.raw))}${b.when ? ` · saved ${esc(new Date(b.when).toLocaleString())}` : ''}</span><div class="btns sub"><button class="btn" data-bak="${b.k}">Restore</button></div></div>`).join('') : '<p class="note">No backups yet.</p>'}
<h2>Move a save to another device</h2>
<div class="btns"><button class="btn" data-export="1">Download save file</button><label class="btn">Load save file<input type="file" accept="application/json,.json,text/plain,.txt" data-import="1" hidden></label></div>
<div class="btns"><button class="btn" data-share="1">Share to GitHub</button><button class="btn" data-status="1">Copy status as text</button></div>
<p class="note">Share to GitHub opens GitHub's page for a new file in the game's saves folder with this save filled in; sign in and tap "Commit changes". Copy status is for bug reports.</p>
<h2>All saves</h2>
<div class="btns"><button class="btn" data-exportall="1">Export all saves</button><label class="btn">Restore all saves<input type="file" accept="application/json,.json" data-import="1" hidden></label></div>
${pendingAll ? `<p class="note">This file holds a game at ${esc(descOf(pendingAll.auto))}, ${Object.keys(pendingAll.slots).length} slot${Object.keys(pendingAll.slots).length === 1 ? '' : 's'} and ${Object.keys(pendingAll.backups).length} backup${Object.keys(pendingAll.backups).length === 1 ? '' : 's'}${pendingAll.saved ? `, exported ${esc(new Date(pendingAll.saved).toLocaleString())}` : ''}${pendingAll.skipped ? ` (${pendingAll.skipped} unreadable, left out)` : ''}. Restoring replaces your autosave, slots and backups; this game is kept as the "before" backup.</p><div class="btns"><button class="btn primary" data-restoreall="1">Restore all</button><button class="btn" data-restoreall="">Cancel</button></div>` : ''}
<div class="btns"><button class="btn" data-menu="main">Back</button></div>
<p class="note" id="saveNote"></p></section>`;
}

function renderSettings() {
    view.innerHTML = `<section class="page menu-page"><div class="btns"><button class="btn" data-menu="main">← Menu</button></div><h1>Settings</h1>
<p class="lede">Kept on this phone only, for every save.</p>
<h2>The clock</h2>
<p class="note">Everything happens at once: each card moves the clock by its time.</p>
<div class="btns"><button class="btn${askFatal ? ' primary' : ''}" data-pausedeath="1">Ask before a card that ends the Coil: ${askFatal ? 'on' : 'off'}</button></div>
<h2>Text size</h2>
<div class="btns">${TEXT_SIZES.map((n) => `<button class="btn${n === textSize ? ' primary' : ''}" data-textsize="${n}">${n}%</button>`).join('')}</div>
<h2>Checks</h2>
<p class="note">Cards and results don't show skill values, DCs or odds; the James tab shows the skills. Turn this on to see the numbers (for testing).</p>
<div class="btns"><button class="btn${showChecks ? ' primary' : ''}" data-showchecks="1">Show checks: ${showChecks ? 'on' : 'off'}</button></div>
<h2>Saving</h2>
<div class="btns"><button class="btn${expState().off ? '' : ' primary'}" data-expremind="1">Remind me to download: ${expState().off ? 'off' : 'on'}</button></div>
<div class="btns"><button class="btn" data-menu="main">Back</button></div>
<p class="note" id="saveNote"></p></section>`;
}

/** The main menu (v0.11.10, Selene's): on plain paper, the game hidden until Continue. */
function renderMenu() {
    if (menu === 'saves') return renderSaves();
    if (menu === 'settings') return renderSettings();
    const cont = recovery
        ? '<button class="btn primary big" data-menu="recovery">The save can\'t be opened: see the options</button>'
        : `<button class="btn primary big" data-menu="continue">${hadSave ? 'Continue' : 'Begin'}<small>${esc(sceneTitle(g.scene))} — ${esc(clockLabel(g.minutes))}${g.coil && hadSave ? ` · ${g.coil.act === 1 ? 'Act 1, ' : ''}Coil ${g.coil.n}` : ''}</small></button>`;
    view.innerHTML = `<section class="page menu-page main-menu">
<div class="mseal" aria-hidden="true">骨</div>
<h1 class="mtitle">Bone and Ash</h1>
<p class="note mver">Version <span id="menuVer">…</span> · Incremental Mode</p>
<div class="mbtns">${cont}${hadSave && !recovery ? '<button class="btn big" data-new="1">New game</button>' : ''}<button class="btn big" data-menu="saves">Saves</button><button class="btn big" data-menu="settings">Settings</button></div>
<p class="note" id="saveNote"></p></section>`;
    gameVersion().then((v) => { const el = document.getElementById('menuVer'); if (el) el.textContent = v; });
}
function openMenu(page = 'main') {
    if (!menu && g && !recovery) autosave();
    menu = page; pendingAll = page === 'saves' ? pendingAll : null;
    render(); window.scrollTo({ top: 0 });
}

/* ---------------- v0.11.11: announcer, hold-for-tooltip ---------------- */

const smoothScroll = () => (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
const announcer = document.createElement('div');
announcer.id = 'announce'; announcer.className = 'sr-only'; announcer.setAttribute('aria-live', 'polite');
document.body.appendChild(announcer);
let announcedScene = null;
function announce(text) { if (!text) return; announcer.textContent = ''; setTimeout(() => { announcer.textContent = String(text).replace(/\*/g, ''); }, 30); }

const tipEl = document.createElement('div');
tipEl.id = 'tip'; tipEl.setAttribute('role', 'dialog'); tipEl.setAttribute('aria-label', 'Card details'); tipEl.hidden = true;
document.body.appendChild(tipEl);
const plain = (t) => String(t || '').replace(/\*\*?/g, '');
const itemNames = (c) => [...new Set(gives(c).map((id) => ITEMS[id]?.name || id))];
/** What a held card tells: what it can give, time, Qi, familiarity, why it's shut. No checks unless Show checks is on. */
function tipFor(b) {
    const lines = [];
    const lb = b.cloneNode(true); lb.querySelectorAll('.tag, .len, .n, .dies').forEach((e) => e.remove()); // v0.11.64: not "Starves here" in the title
    const label = plain(lb.textContent).trim();
    let ch = null, card = null, mins = 0;
    if (b.dataset.run && onQueueScreen()) {
        card = taskCards(g, SCENES).find((c) => c.id === b.dataset.run);
        const m = /^(.+):(\d+)$/.exec(b.dataset.run);
        if (m) ch = SCENES[m[1]]?.choices?.[Number(m[2])] || null;
        mins = card && card.status === 'open' ? taskMinutes(g, SCENES, card.id) : card?.minutes || 0;
    } else if (b.dataset.story != null) {
        const i = Number(b.dataset.story);
        ch = i < 1000 ? SCENES[g.scene]?.choices?.[i] || null : null;
        mins = b.disabled ? 0 : storyMinutes(i);
    } else if (b.dataset.act) {
        const a = COMBAT_ACTIONS[b.dataset.act];
        if (a) {
            const cost = actionCost(g, a);
            if (cost) lines.push(`Costs ${cost} Qi${a.keeps ? ' to form, then free this fight' : ''}.`);
            if (a.guard) lines.push(`Braces: defence +${guardBonus(g)} this round${hasForm(g, 'buckler') && !g.combat?.style ? ', and the shield covers Yuki' : ''}.`);
            if (a.field) lines.push(`A field of bone spikes for ${FIELD_ROUNDS} rounds: ${fieldDamage(g)} back to each attacker. Once a fight.`);
            if (a.stagger) lines.push('Staggers what it hits.');
            if (a.reach) lines.push('A clean hit holds the enemy off for the round.');
            if (a.pierce) lines.push('Raw Qi: it ignores the enemy\'s armour.'); // v0.11.95 (review)
            if (a.qshield) lines.push(`Soaks ${qiShield(g)} damage this round; does not cover Yuki.`);
            if (showChecks) { const d = actionDmg(g, a); if (d[1] > 0) lines.push(`${a.skill} · ${n1(d[0])}–${n1(d[1])} damage.`); }
        }
    } else if (b.dataset.flee) lines.push('Tries to get away. Not every fight lets you.');
    else if (b.dataset.med) { const mc = medCards(g, SCENES).find((m) => m.id === b.dataset.med); if (mc?.open) mins = mc.minutes || 0; }
    if (/^mer:|^med:mer:/.test(b.dataset.run || b.dataset.med || '')) lines.push(`The map: ${meridianRow(g)}.`, 'Up to 2 hours and 2 Qi a sitting; the channel opens when its hours are done.'); // v0.11.13 (E1): the meridian screen's map, here now
    if (ch) {
        const items = itemNames(ch);
        if (items.length) lines.push(`Can bring back: ${items.join(', ')}.`);
        if (ch.qi) lines.push(`Costs ${ch.qi} Qi.`);
        if (ch.combat) lines.push('Leads to a fight.');
    }
    if (mins) lines.push(`Takes ${durLabel(mins)}, at once.`); // v0.11.64: every card at once
    { const id0 = b.dataset.run || b.dataset.med || ''; const k = medActivity(id0) || (/^(.+):(\d+)$/.test(id0) && isSitChoice(SCENES[id0.split(':')[0]]?.choices?.[Number(id0.split(':')[1])], id0.split(':')[0]) ? 'sit' : null); if (k) lines.push(useLine(g, k)); } // v0.11.15: speed by use
    if (card && card.kind === 'work') lines.push(`Familiarity: ${FAM[card.tier].name}${card.next != null ? `, ${card.fam} of ${card.next} to ${FAM[card.tier + 1].name}` : ' (the top)'}. Familiar work goes faster.`);
    if (card && card.status === 'late') lines.push('It would end past midnight, when the day is over. Sleep.');
    else if (card && card.status !== 'open') lines.push('Done for today. Back tomorrow.');
    if (b.disabled && !card) { const tag = b.querySelector('.tag')?.textContent; lines.push(tag ? `Not now: ${tag}.` : 'Not now.'); }
    if (showChecks && card?.tag) lines.push(`Check: ${card.tag}`);
    if (!lines.length) lines.push('Nothing more to tell. Tap it to find out.');
    return `<div class="tiphead"><b>${esc(label)}</b><button class="btn" data-tip="close" aria-label="Close">✕</button></div>${lines.map((l) => `<p>${esc(l)}</p>`).join('')}`;
}
let holdTimer = null, holdStart = null, swallowUntil = 0, swallowBtn = null;
const HOLD_MS = 500;
function cancelHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }
view.addEventListener('pointerdown', (ev) => {
    const b = ev.target.closest('button.card, button.choice');
    if (!b || menu || !g) return;
    cancelHold();
    holdStart = { x: ev.clientX, y: ev.clientY };
    holdTimer = setTimeout(() => {
        holdTimer = null;
        try { tipEl.innerHTML = tipFor(b); tipEl.hidden = false; swallowUntil = Date.now() + 1500; swallowBtn = b; } catch (err) { showError(err); }
    }, HOLD_MS);
});
view.addEventListener('pointermove', (ev) => { if (holdStart && Math.hypot(ev.clientX - holdStart.x, ev.clientY - holdStart.y) > 10) cancelHold(); });
['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => view.addEventListener(t, cancelHold));
view.addEventListener('contextmenu', (ev) => { if (ev.target.closest('button.card, button.choice')) ev.preventDefault(); });
// the tap that ends a hold must not run the card
document.addEventListener('click', (ev) => { if (Date.now() < swallowUntil && swallowBtn && ev.target.closest('button') === swallowBtn) { swallowUntil = 0; swallowBtn = null; ev.stopPropagation(); ev.preventDefault(); } }, true);
tipEl.addEventListener('click', (ev) => { if (ev.target.closest('[data-tip]')) tipEl.hidden = true; });
view.addEventListener('toggle', (ev) => {
    const d = ev.target;
    if (d.dataset?.rid) { const id = Number(d.dataset.rid); if (d.open) openResults.add(id); else openResults.delete(id); }
    if (d.dataset?.grp != null && d.isConnected) setGroupOpen(d.dataset.grp, d.open, d.dataset.dflt === '1'); // v0.11.67 (D2)
    if (d.dataset?.faq && d.isConnected) { if (d.open) { faqOpen.add(d.dataset.faq); if (faqSeen(faqLoad(), d.dataset.faq)) { faqSave(); faqUpdate(); } d.querySelector('.fnew')?.remove(); } else faqOpen.delete(d.dataset.faq); } // v0.11.83
}, true);

/* ---------------- v0.11.83: the FAQ (owner picks P1 + T1 + R1; Selene's, js/core/faq.js) ---------------- */

let faqSt = null, faqQ = '', faqFrom = null, faqKey = '';
const faqOpen = new Set(); // the entries open on the page (kept when the tab is left and come back to, until a reload)
const faqLoad = () => faqSt || (faqSt = faqState(store.get(FAQ_KEY)));
const faqSave = () => store.set(FAQ_KEY, faqText(faqSt));
/** Unlock what this game has reached (every redraw), and show the tab's dot while an entry is new. */
function faqUpdate() {
    const st = faqLoad();
    if (g && faqCheck(st, g, { meditate: canMeditate(g, SCENES) })) faqSave();
    const b = document.querySelector('#tabs button[data-tab="faq"]');
    if (b) { const on = tab !== 'faq' && faqHasNew(st); b.classList.toggle('new', on); b.setAttribute('aria-label', on ? 'FAQ, new questions' : 'FAQ'); }
}
function renderFaq() {
    const st = faqLoad();
    const list = faqList(st, g);
    const k = `${JSON.stringify(st.u)}|${g?.coil?.n}`;
    if (faqKey === k && view.querySelector('#faq-list')) return; // nothing new: keep the page as it is (open entries, the search box's focus)
    faqKey = k;
    const firstNew = list.findIndex((e) => e.isNew);
    view.innerHTML = `<section class="page faq-page"><h1>FAQ</h1>
<p class="lede">How Bone and Ash works. Tap a question to open it. New questions appear as James gets further.</p>
<label class="faqs"><span class="note">Search</span><input type="search" id="faq-q" placeholder="Search the FAQ" autocomplete="off" value="${esc(faqQ)}"></label>
<p class="note" id="faq-none" hidden>No question matches. Try another word.</p>
<div class="faq" id="faq-list">${list.map((e, i) => `<details data-faq="${esc(e.q)}"${i === firstNew || faqOpen.has(e.q) ? ' open' : ''}><summary>${esc(e.q)}${e.isNew ? ' <span class="fnew">new</span>' : ''}</summary><p>${e.a}</p></details>`).join('')}</div>
</section>`;
    if (firstNew >= 0) { faqOpen.add(list[firstNew].q); if (faqSeen(st, list[firstNew].q)) faqSave(); } // seen now (its tag goes with the toggle event a details drawn open fires, as in Selene's)
    if (faqQ) faqFilter(false);
}
/** Search: only the questions whose question or answer holds every word typed; they open while searching. */
function faqFilter(open) {
    const words = faqQ.toLowerCase().split(/\s+/).filter(Boolean);
    let n = 0;
    view.querySelectorAll('details[data-faq]').forEach((d) => {
        const ok = faqMatch(d.dataset.faq, d.querySelector('p')?.textContent || '', words);
        d.hidden = !ok; if (ok) n += 1;
        if (ok && open && words.length) d.open = true;
    });
    const none = document.getElementById('faq-none'); if (none) none.hidden = n > 0;
}
view.addEventListener('input', (ev) => { if (ev.target.id === 'faq-q') { faqQ = ev.target.value; faqFilter(true); } });
/** Opened from another tab: that tab's entry opens and scrolls into view. */
function faqFocus() {
    const q = FAQ_TAB[faqFrom]; faqFrom = null;
    if (!q || faqQ) return;
    const d = [...view.querySelectorAll('details[data-faq]')].find((x) => x.dataset.faq === q);
    if (!d) return;
    d.open = true; faqOpen.add(q);
    d.scrollIntoView({ block: 'start' });
}

/* ---------------- wiring ---------------- */

function render() {
    document.querySelectorAll('#tabs button').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    document.body.classList.toggle('menu-on', !!menu);
    if (menu) return renderMenu();
    if (recovery) return renderRecovery();
    faqUpdate(); // v0.11.83: unlock what the game has reached; the tab's dot
    ({ story: renderStory, sheet: renderSheet, bag: renderBag, journal: renderJournal, faq: renderFaq })[tab]();
    if (tab === 'story' && g && g.scene !== announcedScene) { announcedScene = g.scene; announce(g.combat ? `A fight: ${sceneTitle(g.scene)}` : val(SCENES[g.scene]?.title) || ''); }
}
/** v0.11.11: each tab keeps its scroll; the Story tab starts at the top again on a new scene. */
const scrollPos = {};
function setTab(t) {
    tipEl.hidden = true;
    if (t === 'menu') { if (!menu) scrollPos[tab] = { y: window.scrollY, scene: g?.scene }; openMenu('main'); return; }
    if (!menu) scrollPos[tab] = { y: window.scrollY, scene: g?.scene };
    faqFrom = t === 'faq' && tab !== 'faq' && !menu ? tab : null; // v0.11.83: the FAQ opens the entry for the tab you came from
    menu = null; tab = t; render();
    const p = scrollPos[t];
    window.scrollTo({ top: p && (t !== 'story' || p.scene === g?.scene) ? p.y : 0 });
    if (t === 'faq') faqFocus(); // after the scroll is restored
}

view.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (recovery && !menu) { onRecovery(b); return; }
    if (b.dataset.act || b.dataset.flee || b.dataset.run || b.dataset.med) { // v0.11.64: cards act at once, so they get the double-tap guard too
        const now = Date.now();
        if (now - lastPress < 400) return; // double-tap guard: a fast second tap must not take the next scene's choice
        lastPress = now;
    }
    try {
        if (b.dataset.run) { doTask(b.dataset.run); return; } // v0.11.64: at once (was: run now, ahead of the queue)
        if (b.dataset.menu) {
            const m = b.dataset.menu;
            if (m === 'continue' || m === 'recovery') { hadSave = true; menu = null; setTab('story'); return; }
            openMenu(m); return;
        }
        if (b.dataset.textsize) { textSize = Number(b.dataset.textsize); store.set(TEXT_SIZE_KEY, String(textSize)); applyTextSize(); render(); return; }
        if (b.dataset.showchecks) { showChecks = !showChecks; store.set(SHOW_CHECKS_KEY, showChecks ? '1' : '0'); render(); return; }
        if (b.dataset.bak) {
            let next;
            try { next = checkScene(deserialize(store.get(BAK_KEY(b.dataset.bak)))); } catch (err) { note(`That backup can't be loaded: ${err.message}`); return; }
            backupBefore('restoring a backup');
            g = next; lastResult = null; lastReply = []; combatLog = null; autosave(); setTab('story');
            return;
        }
        if (b.dataset.share) { shareToGitHub().catch((err) => note(`Sharing didn't work: ${err.message || err}`)); return; }
        if (b.dataset.status) {
            statusText().then((text) => copyText(text, () => note('Status copied. Paste it into the chat.'), () => note('The status could not be copied.')), (err) => note(`No status: ${err.message || err}`));
            return;
        }
        if (b.dataset.exportall) { exportAll(); note('All saves downloaded.'); return; }
        if (b.dataset.restoreall != null) {
            const p = pendingAll; pendingAll = null;
            if (!b.dataset.restoreall || !p) { render(); return; }
            try { restoreAll(p); } catch (err) { render(); note(`Nothing was changed: ${err.message}`); return; }
            setTab('story');
            return;
        }
        if (b.dataset.expremind) { const o = expState(); o.off = !o.off; if (!o.off) { o.t = Date.now(); o.pl = bakMeta().play; } expWrite(o); render(); return; }
        if (b.dataset.pausedeath) { askFatal = !askFatal; store.set(PAUSE_DEATH_KEY, askFatal ? '1' : '0'); render(); return; }
        if (b.dataset.readall) { readAllScene = `${g.scene}#${g.coil?.n || 1}`; render(); return; } // v0.11.35 (P1-a)
        if (b.dataset.skip) { // v0.11.35 (P1-a): the stretch read before, at once; each choice as a tap would take it
            const now = Date.now();
            if (now - lastPress < 400) return;
            lastPress = now;
            try {
                const rel0 = relSnap();
                const r = skipRun(g, SCENES);
                land('Skip to the next choice', r.lines, false, rel0); // v0.11.68
                autosave(); render(); window.scrollTo({ top: 0, behavior: smoothScroll() });
            } catch (err) { lastResult = { lines: [String(err.message || err)], fail: true }; lastReply = []; render(); showError(err); }
            return;
        }
        if (b.dataset.story != null) {
            const now = Date.now();
            if (now - lastPress < 400) return;
            lastPress = now;
            playChoice(Number(b.dataset.story)); return; // v0.11.37 (C-a): every story choice at once, the clock moved
        }
        if (b.dataset.med) {
            const id = b.dataset.med; // v0.11.64: at once (was: a bar, then the work)
            const mc = medCards(g, SCENES).find((m) => m.id === id);
            if (!fatalOk(id, mc?.open ? medOutcome(id) : null)) return;
            const rel0 = relSnap();
            const r = runMed(g, SCENES, id);
            const label = mc ? plain(mc.label).replace(/:.*$/, '').replace(/ \(.*$/, '').replace(/\.$/, '') : 'Meditate';
            land(label, r.lines, false, rel0); // v0.11.68
            if (r.moved) window.scrollTo({ top: 0, behavior: smoothScroll() });
            autosave(); render();
            return;
        }
        if (b.dataset.bite) {
            if (Date.now() - biteArmed > 4000) { biteArmed = Date.now(); note(`Tap Bite the tail again to end this Coil. Everything in the hammerspace is lost; what James learned is not. ${tabWhy(g) === 'choice' ? ' By choice, it adds nothing to the faster learning.' : ''}`); return; }
            biteArmed = 0;
            endCoil(g, tabWhy(g), g.scene); // v0.11.86 (Fable review): at a lost tribute or Shen Qiu, that loss's bite
            lastResult = null; lastReply = []; goTo(g, SCENES, 'coil_end'); autosave(); setTab('story');
            return;
        }
        if (b.dataset.panel) { panel = b.dataset.panel; if (panel === 'results') unseen = 0; render(); return; }
        if (b.dataset.nonext) { store.set(NONEXT_KEY, '1'); render(); return; } // v0.11.72 (N1)
        if (b.dataset.yuki) { const yl = yukiLane(g); setYuki(g, !yl.on); autosave(); render(); return; }
        if (b.dataset.act) {
            const rel0 = relSnap(); const fightTitle = sceneTitle(g.scene);
            const out = combatStep(g, b.dataset.act);
            combatLog = out.lines;
            if (out.done) { const lines = out.lines.slice(); lines.push(...goTo(g, SCENES, out.next)); land(fightTitle, lines, out.done === 'lose', rel0); combatLog = null; } // v0.11.68
            autosave(); render();
        } else if (b.dataset.flee) {
            const rel0 = relSnap(); const fightTitle = sceneTitle(g.scene);
            const out = combatFlee(g);
            combatLog = out.lines;
            if (out.done) { const lines = out.lines.slice(); lines.push(...goTo(g, SCENES, out.next)); land(fightTitle, lines, out.done === 'lose', rel0); combatLog = null; } // v0.11.68
            autosave(); render();
        } else if (b.dataset.new) {
            if ((menu || tab !== 'story') && !confirmNew()) return;
            backupBefore('a new game');
            g = freshGame();
            lastResult = null; lastReply = []; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.tabGo) {
            setTab(b.dataset.tabGo);
        } else if (b.dataset.save) {
            writeKey(SLOT(b.dataset.save), serialize(g)); render(); note('Saved.');
        } else if (b.dataset.load) {
            let next;
            try { next = checkScene(deserialize(store.get(SLOT(b.dataset.load)))); } catch (err) { note(`Slot ${b.dataset.load} can't be loaded: ${err.message}`); return; }
            backupBefore(`loading slot ${b.dataset.load}`);
            g = next; lastResult = null; lastReply = []; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.export) {
            download(serialize(g), `bone-and-ash-${clockLabel(g.minutes).replace(/[^\w]+/g, '-')}.json`); expMark();
        }
    } catch (err) {
        lastResult = { lines: [String(err.message || err)], fail: true }; lastReply = []; render();
        if (!(err instanceof SaveError)) showError(err);
    }
});
view.addEventListener('change', async (ev) => {
    const inp = ev.target.closest('input[data-import]');
    if (!inp || !inp.files?.[0]) return;
    let next;
    try {
        const text = await unpackText(await inp.files[0].text());
        inp.value = '';
        const all = readAll(text); // v0.11.9: an all-saves file asks first
        if (all) { pendingAll = all; render(); return; }
        next = checkScene(deserialize(text));
    } catch (err) { inp.value = ''; note(`That file can't be loaded: ${err.message}`); return; }
    backupBefore('loading a save file');
    g = next; autosave(); lastResult = null; lastReply = []; setTab('story');
});
document.getElementById('tabs').addEventListener('click', (ev) => { const b = ev.target.closest('button[data-tab]'); if (b) setTab(b.dataset.tab); });

let newArmed = 0;
let biteArmed = 0;
function confirmNew() {
    if (Date.now() - newArmed < 4000) return true;
    newArmed = Date.now();
    note('Tap New game again to start over. Your autosave will be replaced (slots are kept).');
    return false;
}
function note(t) { const n = document.getElementById('saveNote'); if (n) n.textContent = t; }

load();
// v0.11.5: save when the app is hidden or closed (Android may kill a backgrounded page)
// v0.11.8: only if the stored save is still the one this tab last wrote or loaded (another tab may have saved since)
const closeSave = () => { if (store.get(AUTO) === lastWritten) autosave(); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') closeSave(); });
window.addEventListener('pagehide', closeSave);
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline install is optional */ });
}
