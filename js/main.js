/** Bone and Ash — UI. Renders the story, combat, sheet, hammerspace, journal and saves. */
import { actionOpen, actionLabel, FORM_LINES, lineState, rankLabel, hasForm } from './core/forms.js';
import { coilMult } from './core/game.js';
import {
    newGame, ensureBars, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, skillCheck, xpToNext, clockLabel, clockLabelG, clockLabelSec, realmName, yukiForm,
    startCombat, combatStep, combatFlee, COMBAT_ACTIONS, setNoDice, noDiceDc, serialize, deserialize, peekSave, SaveError, BONESINGER_TIERS, itemCap, jamesDr, hpRegenPct, actionCost, actionDmg, guardBonus, FIELD_ROUNDS, fieldDamage,
} from './core/game.js';
import { sceneView, choose, goTo, gives } from './core/story.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskLabel, maxSpeed, effectiveSpeed, queueRunNow, queueAdd, queueMove, queueClear, isInstantTask, instantChoice, waitChoice, taskMinutes, runTask, outlook, taskQueue, MS_PER_GAME_HOUR, QUEUE_MAX, FAM, yukiLane, setYuki } from './core/tasks.js';
import { SCENES, ITEMS } from './story/prologue.js';
import { coilActive, endCoil, coilPrefill } from './core/coil.js';
import { medCards, runMed, SIT_MINUTES, isSitChoice } from './core/meditate.js';
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
let lastResult = null; // { lines, fail }
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
const TASKS_KEY = 'boneash.tasks'; // per phone: '0' = Classic; anything else (never chosen, '1') = Tasks (on by default since v0.9.8)
let taskMode = store.get(TASKS_KEY) !== '0';
setNoDice(taskMode); // no dice anywhere in task mode (v0.9.3)
const SPEED_KEY = 'boneash.speed'; // per phone: 0 = paused, 1, 2, 5, 10
const SPEEDS = [[0, 'Pause'], [1, '×1'], [2, '×2'], [5, '×5'], [10, '×10']]; // gated per save by maxSpeed (v0.9.8); the stored choice is kept and held down to the gate
const TEST_SPEEDS_KEY = 'boneash.testspeeds'; // per phone: '1' = every speed open (hidden: tap "Game mode" 5 times)
let testSpeeds = store.get(TEST_SPEEDS_KEY) === '1';
const runSpeed = () => effectiveSpeed(g, speed, testSpeeds);
let modeTaps = 0, modeTapAt = 0;
const PAUSE_DEATH_KEY = 'boneash.pausedeath'; // per phone: '0' = off; on by default (v0.10.0)
let pauseDeath = store.get(PAUSE_DEATH_KEY) !== '0';
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
const RX_TAG = new RegExp(`${CHK}(?: (?:→|—) (?:passes|partly|fails))?`, 'g');
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
let lastFc = null; // the last forecast the screen drew (for the pause before a forecast death)
let deathWarned = ''; // which forecast death has paused the game already
// v0.10.2: the game always opens paused and pauses on every new scene; the stored speed is what ▶ Resume (and a tapped card) runs at
let resumeSpeed = (() => { const v = Number(store.get(SPEED_KEY)); return SPEEDS.some(([n]) => n === v) && v > 0 ? v : 1; })();
let speed = 0;
let oneShot = false; // a card tapped while paused runs at resumeSpeed, then the game pauses again
let pauseScene = null; // the scene the pause rule last saw
function pauseNow(cause = 'paused') { if (speed) resumeSpeed = speed; speed = 0; oneShot = false; plog(cause); }
// v0.11.9: the last 10 pause and speed changes with their cause, for "Copy status as text" (memory only, never saved).
// plog('not logged') in tick() and render() catches any change that came from somewhere else (the automatic unpause hunt).
const pauseLog = [];
let plLast = 'paused';
function plog(cause) {
    const st = speed ? `×${speed}${oneShot ? ' (one card)' : ''}` : 'paused';
    if (st === plLast) return;
    pauseLog.push({ t: Date.now(), from: plLast, to: st, cause, scene: g?.scene || '?' });
    if (pauseLog.length > 10) pauseLog.shift();
    plLast = st;
}
/** v0.10.2: pause on every new scene (task mode). */
function scenePause() { if (!taskMode || !g || recovery) return; if (g.scene !== pauseScene) { if (pauseScene !== null) pauseNow('new scene'); pauseScene = g.scene; } }
/** A tapped card's bar has finished: back to paused if it was a one-off. */
function endOneShot(cause = 'the tapped card finished') { if (oneShot) { oneShot = false; speed = 0; plog(cause); } }
/** Tap while paused: run this one card now, then pause again. */
function tapRun() { if (!speed) { speed = resumeSpeed || 1; oneShot = true; lastTickAt = Date.now(); plog('card tapped while paused'); } }
let lastTickAt = Date.now();
let running = null; // { id, label, done, ms, m0, mins } — done = ms of bar filled (at ×1) — the head of the queue while its bar fills (v0.11.5: its share is saved as g.runPart, so a reopen continues it)
let lastRunSave = 0; // v0.11.5: autosave every 15 s while a bar runs
let lastWritten = null; // v0.11.8: the autosave text this tab last wrote or loaded (a closing tab never overwrites a newer save from another tab)
let ticker = null;
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
    if (lines.some((l) => /queue is gone/.test(l))) bits.push('collapsed');
    return bits.join(' · ');
}
let resultSeq = 0;
const openResults = new Set(); // v0.11.11: Results entries the player opened stay open when the screen redraws
function addResult(title, lines, fail) {
    taskResults.unshift({ id: ++resultSeq, title, sum: summarize(lines), lines, fail });
    announce(`${title}${summarize(lines) ? `: ${summarize(lines)}` : ''}`);
    taskResults.length = Math.min(taskResults.length, RESULTS_MAX);
    if (panel !== 'results') unseen += 1;
}
const durLabel = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} m` : ''}` : `${m} m`);
const onTaskHub = () => taskMode && g && !recovery && isTaskHub(g);

function startNext() {
    scenePause();
    if (running || !onTaskHub()) return;
    if (g.combat) return;
    if (coilPrefill(g)) autosave(); // "same days again": this hub and day get last Coil's cards
    const q = taskQueue(g);
    const skipped = [];
    while (q.length && !taskOpen(g, SCENES, q[0])) skipped.push(taskLabel(g, SCENES, q.shift()));
    for (const l of skipped) addResult(l, ['Skipped: not possible when its turn came.'], true);
    if (skipped.length) autosave();
    if (!q.length) return;
    const id = q[0];
    if (isInstantTask(g, SCENES, id)) { if (runSpeed()) { lastFc = outlook(g, SCENES); checkDeathPause(g.minutes); } if (runSpeed()) finishTask(id, taskLabel(g, SCENES, id)); return; } // rest and sleep: no bar (v0.10.0); paused: waits
    const mins = taskMinutes(g, SCENES, id);
    const yl = yukiLane(g);
    running = { id, yuki: yl && yl.on ? { progress: yl.progress, len: yl.len } : null, label: taskLabel(g, SCENES, id), done: 0, ms: Math.max(400, (mins / 60) * MS_PER_GAME_HOUR), m0: g.minutes, mins };
    const rp = g.runPart; // v0.11.5: the same card at the same game minute continues where the saved bar stood
    if (rp && rp.id === id && rp.at === g.minutes && rp.frac > 0 && rp.frac < 1) running.done = rp.frac * running.ms;
    lastTickAt = Date.now();
    if (!ticker) ticker = setInterval(tick, 100);
}
function stopRunning() { running = null; }
/** v0.11.11: a ticking bar (an <i class="tick">): scaleX, written only when it moves by 0.1%; its track carries the progressbar value. */
function setBar(el, frac) {
    if (!el) return;
    const v = Math.max(0, Math.min(1, frac || 0)).toFixed(3);
    if (el.dataset.v === v) return;
    el.dataset.v = v; el.style.transform = `scaleX(${v})`;
    const pc = String(Math.round(v * 100));
    const track = el.parentElement;
    if (track && track.getAttribute('aria-valuenow') !== pc) track.setAttribute('aria-valuenow', pc);
}
const tickBar = (id, frac, label) => { const v = Math.max(0, Math.min(1, frac || 0)).toFixed(3); return `<div class="stroke" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v * 100)}"><i id="${id}" class="tick" data-v="${v}" style="transform:scaleX(${v})"></i></div>`; };
const pbar = (a, b, label) => `<div class="stroke" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(Math.max(0, Math.min(100, (a / b) * 100)))}"><i style="width:${pct(a, b)}"></i></div>`;
function tick() {
    plog('not logged');
    const now = Date.now();
    const dt = Math.min(1000, now - lastTickAt); // a sleeping phone doesn't fast-forward more than a second
    lastTickAt = now;
    if (!running) return;
    if (running.kind) { if (!taskMode || g.combat || g.scene !== running.scene) { running = null; endOneShot(); return; } } // a story or meditate bar
    else if (!onTaskHub()) { running = null; return; }
    running.done += dt * runSpeed();
    if (!running.kind && runSpeed() && now - lastRunSave >= 15e3) autosave(); // v0.11.5
    const f = Math.min(1, running.done / running.ms);
    // v0.11.11: the ticking bars slide (transform, no layout) and are written only when their value changes
    setBar(document.getElementById('nowbar'), f);
    if (running.yuki) setBar(document.getElementById('yukibar'), ((running.yuki.progress + f * running.mins) % running.yuki.len) / running.yuki.len);
    const clk = document.querySelector('.status .clk');
    if (clk && tab === 'story') { const t = clockLabelSec(g, running.m0 + f * running.mins); if (clk.textContent !== t) clk.textContent = t; } // seconds run while a bar does (v0.9.9)
    if (!running.kind) { checkDeathPause(running.m0 + f * running.mins); if (!speed) return; }
    if (f < 1) return;
    if (running.kind === 'story') { const { idx } = running; running = null; playChoice(idx); return; }
    if (running.kind === 'med') {
        const { id, label } = running; running = null;
        endOneShot();
        try { const r = runMed(g, SCENES, id); lastResult = { lines: r.lines, fail: false }; addResult(label, r.lines, false); autosave(); startNext(); render(); } catch (err) { showError(err); render(); }
        return;
    }
    const { id, label } = running;
    running = null;
    finishTask(id, label);
}
/** A task's bar has filled (or it takes no bar): do it, then start the next one. */
function finishTask(id, label) {
    try {
        if (taskQueue(g)[0] === id) taskQueue(g).shift();
        endOneShot();
        const r = runTask(g, SCENES, id);
        lastResult = r.stopped ? { lines: r.lines, fail: r.fail } : null; // a door or collapse shows its lines in the scene it opens
        if (!r.stopped) addResult(label, r.lines, r.fail);
        autosave();
        startNext();
        render();
    } catch (err) { taskQueue(g).length = 0; showError(err); render(); }
}
/** Pause before the forecast death (v0.10.0): once per forecast death, an hour of game time before it. */
function checkDeathPause(nowMin) {
    if (!pauseDeath || !speed || !lastFc?.death) return;
    const key = `${g.coil?.act || 0}:${g.coil?.n || 1}:${lastFc.death.at}`;
    if (deathWarned === key || lastFc.death.at - nowMin > 60) return;
    deathWarned = key; pauseNow('forecast death ahead');
    lastResult = { lines: [`Paused: the forecast says James ${lastFc.death.cause === 'hunger' ? 'starves' : 'collapses'} at ${clockLabelG(g, lastFc.death.at)} on this queue. Fix the queue, or press Resume to carry on.`], fail: true };
    render();
}

/* ---------------- task mode: every screen as cards (v0.9.5) ---------------- */

/** Game minutes a story choice will take (a dry run on a copy; no dice, so it is exact). 0 = it happens at once (a fight starts, a screen opens). */
function storyMinutes(idx) {
    if (idx >= 1000) return 0;
    try { const c = JSON.parse(JSON.stringify(g)); const m0 = c.minutes; choose(c, SCENES, idx); return Math.max(0, c.minutes - m0); } catch { return 0; }
}
const barMs = (mins) => Math.max(400, (mins / 60) * MS_PER_GAME_HOUR);
function startBar(kind, key, label, mins) {
    running = { kind, [kind === 'story' ? 'idx' : 'id']: key, scene: g.scene, label, done: 0, ms: barMs(mins), m0: g.minutes, mins };
    lastTickAt = Date.now();
    if (!ticker) ticker = setInterval(tick, 100);
}
/** Take a story choice (a card's bar has filled, or it takes no time). */
function playChoice(idx) {
    try {
        const ch = SCENES[g.scene]?.choices?.[idx];
        const label = ch ? String(val(ch.text)) : 'End it in one move.';
        if (ch && /^Stay lost/.test(label)) backupBefore('the Long Forest');
        const r = choose(g, SCENES, idx);
        endOneShot();
        lastResult = { lines: r.lines, fail: r.roll ? !r.roll.success : false };
        if (taskMode && r.lines.length) addResult(label, r.lines, lastResult.fail);
        if (r.combat) { startCombat(g, r.combat(g)); combatLog = null; }
        autosave(); startNext(); render(); window.scrollTo({ top: 0, behavior: smoothScroll() });
    } catch (err) { lastResult = { lines: [String(err.message || err)], fail: true }; render(); showError(err); }
}
const storyCardHtml = (c) => {
    const busy = running && running.kind === 'story' && running.idx === c.index;
    const mins = c.disabled ? 0 : storyMinutes(c.index);
    const tag = c.disabled ? c.reason : hideTag(c.tag);
    const ch0 = c.index < 1000 ? SCENES[g.scene]?.choices?.[c.index] : null;
    const inst = !!ch0 && (instantChoice(ch0) || waitChoice(SCENES, ch0, mins, g.scene));
    return `<button class="card story${/fight/.test(c.tag) ? ' fightish' : ''}${busy ? ' busy' : ''}" data-story="${c.index}" ${c.disabled ? 'disabled aria-disabled="true"' : ''}>${md(c.label)}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}<span class="len">${mins && !inst ? durLabel(mins) : mins ? `at once (${durLabel(mins)} pass)` : 'at once'}</span></button>`;
};
const medCardHtml = (m) => { const card = `<button class="card med" ${m.task ? `data-run="${esc(m.task)}"` : `data-med="${esc(m.id)}"`} ${m.open ? '' : 'disabled aria-disabled="true"'}>${md(m.label)}${hideTag(m.tag) ? `<span class="tag">${esc(hideTag(m.tag))}</span>` : ''}<span class="len">${m.minutes ? durLabel(m.minutes) : 'at once'}</span></button>`; return m.task && m.open ? `<div class="cardwrap">${card}<button class="qadd" data-qadd="${esc(m.task)}" aria-label="Add to the end of the queue">+</button></div>` : card; };

function nowRowHtml() {
    const now = running
        ? `<div class="now"><b>${speed ? 'James:' : 'Paused:'}</b> ${md(running.label)}${tickBar('nowbar', running.done / running.ms, 'James\'s card')}</div>`
        : `<div class="now idle">${speed ? 'Idle. Tap a card to do it now, or + to add it to the queue; the clock runs while James does something.' : 'Paused. Tap a card to do just that one, or + to queue; ▶ Resume runs the queue.'}</div>`;
    const on = speed && !oneShot;
    return `<div class="nowrow">${now}<button class="btn pause${on ? '' : ' primary'}" data-pause="1">${on ? '⏸ Pause' : '▶ Resume'}</button></div>`;
}
function resultsPaneHtml() {
    return taskResults.length ? taskResults.map((r) => `<details class="res${r.fail ? ' fail' : ''}" data-rid="${r.id}"${openResults.has(r.id) ? ' open' : ''}><summary><b>${md(r.title)}</b> <span>${esc(r.sum)}</span></summary><div>${shownLines(r.lines).map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div></details>`).join('') : '<p class="note">Nothing yet. What James does lands here, newest on top; tap one for the details. The Journal keeps all of it.</p>';
}

/** Any screen in task mode: picture and story on top; everything you can do below, as cards. */
function renderCardScreen() {
    const v = sceneView(g, SCENES);
    const hub = onTaskHub();
    const med = medCards(g, SCENES);
    const medIds = new Set(med.filter((m) => m.task).map((m) => m.task));
    const sitHere = (c) => c.index < 1000 && isSitChoice(SCENES[g.scene].choices[c.index], g.scene); // condensation lives on the Meditate card
    const story = (hub ? v.choices.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index)) : v.choices).filter((c) => !sitHere(c));
    let hubHtml = '';
    let hubTop = '';
    if (hub) {
        const cards = taskCards(g, SCENES).filter((c) => !medIds.has(c.id));
        const q = taskQueue(g);
        const ol = outlook(g, SCENES);
        const counts = {};
        for (const id of q) counts[id] = (counts[id] || 0) + 1;
        const groups = [];
        for (const c of cards) { let gr = groups.find((x) => x.name === c.group); if (!gr) groups.push(gr = { name: c.group, cards: [] }); gr.cards.push(c); }
        const cardHtml = (c) => {
            const mins = c.status === 'open' ? taskMinutes(g, SCENES, c.id) : c.minutes;
            const fam = c.kind === 'work' ? ` · ${FAM[c.tier].name}${c.next != null ? ` ${c.fam}/${c.next}` : ''}` : '';
            const ctag = hideTag(c.tag);
            const tag = c.status !== 'open' ? 'done for today — back tomorrow' : c.kind === 'door' ? `opens the scene${ctag ? ` · ${ctag}` : ''}` : (ctag || (showChecks ? 'no check' : ''));
            const inst = isInstantTask(g, SCENES, c.id);
            return `<div class="cardwrap"><button class="card${c.kind === 'door' ? ' door' : ''}${c.check && showChecks ? ` b-${c.check.band}` : ''}" data-run="${esc(c.id)}" ${c.status !== 'open' ? 'disabled' : ''}>${counts[c.id] ? `<span class="n">×${counts[c.id]}</span>` : ''}${md(c.label)}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}${c.status === 'open' ? `<span class="len">${inst ? `at once (${durLabel(mins)} pass)` : durLabel(mins)}${fam}</span>` : ''}</button>${c.status === 'open' ? `<button class="qadd" data-qadd="${esc(c.id)}" aria-label="Add to the end of the queue">+</button>` : ''}</div>`;
        };
        const yl = yukiLane(g);
        const yHtml = yl ? `<div class="yuki-lane"><div><b>Yuki:</b> ${esc(yl.label)} <span class="note">${showChecks ? `Fight ${yl.check} / DC ${yl.dc} · ` : ''}${durLabel(yl.len)} · ${FAM[yl.tier].name}</span>${yl.on ? tickBar('yukibar', yl.progress / yl.len, 'Yuki\'s job') : ''}</div><button class="btn${yl.on ? ' primary' : ''}" data-yuki="1">${yl.on ? 'On' : 'Off'}</button></div>` : '';
        lastFc = ol;
        const rowWhen = (r) => r.skip ? 'not possible then' : r.wait ? 'after the story' : r.dead ? 'never reached' : `→ ${clockLabelG(g, r.end).replace(/^Day \d+, /, '')} · Fed ${Math.round(r.fed)} · HP ${r.death ? 0 : Math.max(0, Math.round(r.hp))}`;
        const rows = ol.rows.map((r, k) => `<li class="${r.skip ? 'skip' : ''}${r.dead || r.death ? ' dead' : ''}${k === 0 && running && !running.kind ? ' running' : ''}"${k === 0 && running && !running.kind ? ' aria-current="step"' : ''}><span>${md(taskLabel(g, SCENES, r.id))}${r.death ? ` <b class="dies">${r.death === 'hunger' ? 'Starves here' : 'Collapses here'}</b>` : ''}</span><time>${rowWhen(r)}</time><span class="qbtns"><button class="x" data-qup="${k}" aria-label="Move up" ${k ? '' : 'disabled'}>↑</button><button class="x" data-qdown="${k}" aria-label="Move down" ${k < ol.rows.length - 1 ? '' : 'disabled'}>↓</button><button class="x" data-unq="${k}" aria-label="Remove">✕</button></span></li>`).join('');
        const span = ol.end - ol.start;
        const out = ol.death
            ? `<p class="outlook warn">Forecast: James ${ol.death.cause === 'hunger' ? 'starves' : 'collapses'} at ${esc(clockLabelG(g, ol.death.at))} on this queue (${ol.death.cause === 'hunger' ? 'hunger' : 'injuries'}). The Coil would end there.</p>`
            : ol.fedOut != null
                ? `<p class="outlook warn">Fed runs out ${esc(clockLabelG(g, ol.fedOut))} on this queue. Queue some food.</p>`
                : q.length ? `<p class="outlook">The queue takes ${durLabel(span)}. Fed holds: about ${Math.round(ol.fedEnd)} when it ends (${esc(clockLabelG(g, ol.end))}).</p>` : '<p class="outlook">Nothing queued. The clock waits for you.</p>';
        hubTop = `${yHtml}${out}`;
        hubHtml = `${q.length ? `<h2>Queue (${q.length} / ${QUEUE_MAX})</h2><ol class="queue">${rows}</ol><div class="btns"><button class="btn" data-qclear="1">Clear queue</button></div>` : ''}${groups.map((gr) => `<h2>${esc(gr.name)}</h2><div class="cards">${gr.cards.map(cardHtml).join('')}</div>`).join('')}`;
    }
    const storyHtml = v.end
        ? '<h2>Story</h2><div class="cards"><button class="card story" data-new="1">Start a new game</button><button class="card story" data-tab-go="sheet">See how James ended up</button></div>'
        : story.length ? `<h2>Story</h2><div class="cards">${story.map(storyCardHtml).join('')}</div>` : '';
    const medHtml = med.length ? `<h2>Meditate</h2><div class="cards">${med.map(medCardHtml).join('')}</div>` : '';
    view.innerHTML = `<section class="fade-in">
<div class="plate">${sceneArt(v.art)}</div>
<header class="head"><div class="place">${esc(v.place || g.location)}</div><h1 class="title">${esc(v.title)}</h1></header>
<div class="prose">${paras(v.text)}</div>
<div class="below">
${statusHtml()}${resultHtml()}
${nowRowHtml()}${hubTop}
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
        const v = n1(skillCheck(a.skill === 'GU' ? g.james.gu : g.james.skills[a.skill]) + (c.adapt?.[id] || 0));
        const tgt = c.enemies.find((e) => e.hp > 0);
        const plain = tgt && showChecks ? `${a.skill} ${v} / DC ${noDiceDc(tgt.dc + a.dcMod)} · ${Math.round((d[0] + d[1]) / 2)} dmg` : '';
        return `<button class="card fightish" data-act="${id}" ${off ? 'disabled' : ''}>${esc(a.label)}<span class="tag">${a.guard ? `${showChecks ? 'GU ' : ''}defence +${guardBonus(g)} this round${hasForm(g, 'buckler') && taskMode ? ' · covers Yuki' : ''}` : a.field ? `${FIELD_ROUNDS} rounds · ${fieldDamage(g)} to each attacker · once a fight` : plain}${a.reach ? ' · a full hit holds it off' : ''}${cost ? ` · ${cost} Qi` : ''}${a.stagger ? ' · staggers' : ''}${off ? ' · not enough Qi' : ''}</span></button>`;
    }).join('');
    const flee = c.flee ? `<button class="card" data-flee="1">Run${showChecks ? `<span class="tag">GU ${n1(skillCheck(g.james.gu))} / DC ${noDiceDc(Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk)))}</span>` : ''}</button>` : '';
    const foes = c.enemies.map((e) => `<div class="foe${e.hp <= 0 ? ' down' : ''}"><span>${esc(e.name)}${e.staggered ? ' (reeling)' : ''}</span><div class="stroke"><i style="width:${pct(Math.max(0, e.hp), e.hpMax)}"></i></div></div>`).join('');
    const yuki = `<div class="foe"><span>Yuki</span><div class="stroke" style="background:rgba(242,239,230,0.08)"><i style="width:${pct(g.yuki.hp, yukiHpMax(g))};background:var(--bone)"></i></div></div>`;
    view.innerHTML = `<section>
<div class="plate">${sceneArt(val(SCENES[g.scene].art))}</div>
<header class="head"><div class="place">${esc(sceneTitle(g.scene))}</div><h1 class="title">Round ${c.round}</h1></header>
<div class="prose round">${shownLines(combatLog || c.log).map((l) => dieHtml(l)).join('<br>') || 'The fight begins.'}</div>
<div class="below">
${statusHtml()}
<div class="foes">${foes}${yuki}</div>
<h2>Fight</h2><div class="cards">${acts}${flee}</div>
</div>
</section>`;
}

const freshGame = () => ensureBars(newGame(Math.floor(Math.random() * 2 ** 31), { closed: taskMode })); // task mode: meridians closed at the start (v0.9.6)
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
    // v0.11.5: the running card's share of its bar (queue cards only; story and meditate bars are short and start over)
    if (running && !running.kind && running.ms > 0) g.runPart = { id: running.id, at: running.m0, frac: Math.round(Math.min(1, running.done / running.ms) * 1e4) / 1e4 };
    else delete g.runPart;
    let s;
    try { s = serialize(g); } catch (err) { showError(err.message); return; } // never write a broken state
    writeKey(AUTO, s);
    lastWritten = s;
    rolling(s);
    expRemind();
    lastRunSave = Date.now();
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
const descOf = (raw) => { const p = peekSave(raw); return p ? `${sceneTitle(p.scene)} — ${clockLabel(p.minutes)}` : 'Unreadable'; };

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
    return `${when}-${taskMode ? 'incremental' : 'story'}-${String(g.scene).replace(/[^\w-]+/g, '-')}.${ext}`;
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
    g = checkScene(deserialize(p.auto)); stopRunning(); lastResult = null; combatLog = null; autosave();
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
    const j = g.james, t = (ms) => new Date(ms).toLocaleTimeString();
    const q = taskMode ? taskQueue(g).map((id) => taskLabel(g, SCENES, id)) : [];
    const lines = [
        `Bone and Ash ${await gameVersion()} · ${new Date().toISOString()}`,
        `Mode: ${taskMode ? 'Incremental' : 'Story'} · speed ${speed ? `×${runSpeed()}${oneShot ? ' (one card)' : ''}` : 'paused'} (resume ×${resumeSpeed}) · tab ${tab}`,
        `Scene: ${g.scene} (${sceneTitle(g.scene)}) · ${clockLabel(g.minutes)}${g.coil ? ` · ${g.coil.act === 1 ? 'Act 1' : 'Prologue'}, Coil ${g.coil.n}` : ''}${g.combat ? ' · in a fight' : ''}`,
        `James: ${realmName(j.realm)}, Saturation ${n1(j.saturation)}% · HP ${n1(j.hp)} / ${jamesHpMax(g)} · Convergence ${n1(j.qi)} / ${n1(jamesQiMax(g))} · Fed ${Math.round(j.satiety)}`,
        `Running: ${running ? `${running.label} (${Math.round(Math.min(1, running.done / running.ms) * 100)}%${running.kind ? `, ${running.kind}` : ''})` : 'nothing'}`,
        `Queue (${q.length}): ${q.join(' · ') || 'empty'}`,
        'Pause log (newest last):',
        ...(pauseLog.length ? pauseLog.map((e) => `  ${t(e.t)} ${e.from} → ${e.to} · ${e.cause} · ${e.scene}`) : ['  no changes yet']),
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
    g = next; recovery = null; prevScene = g.scene; lastResult = null; combatLog = null; autosave(); setTab('story');
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
<div class="clock"><span class="clk">${clockLabelSec(g)}</span>${taskMode ? `<select class="speed" data-speed="1" aria-label="Speed">${SPEEDS.filter(([n]) => n <= maxSpeed(g, testSpeeds)).map(([n, l]) => `<option value="${n}"${n === runSpeed() ? ' selected' : ''}>${l}</option>`).join('')}</select>` : ''}</div></div>`;
}

function resultHtml() {
    if (!lastResult || !shownLines(lastResult.lines).length) return '';
    return `<div class="result${lastResult.fail ? ' fail' : ''}">${shownLines(lastResult.lines).map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div>`;
}

function renderStory() {
    if (taskMode) return g.combat ? renderCombatCards() : (startNext(), renderCardScreen());
    if (g.combat) return renderCombat();
    const v = sceneView(g, SCENES);
    const choices = v.choices.map((c) => `<li><button class="choice${/fight/.test(c.tag) ? ' fightish' : ''}" data-choice="${c.index}" ${c.disabled ? `disabled aria-disabled="true"` : ''}>${md(c.label)}${(c.disabled ? c.reason : hideTag(c.tag)) ? `<span class="tag">${esc(c.disabled ? c.reason : hideTag(c.tag))}</span>` : ''}</button></li>`).join('');
    view.innerHTML = `<section class="fade-in">
<div class="plate">${sceneArt(v.art)}</div>
<header class="head"><div class="place">${esc(v.place || g.location)}</div><h1 class="title">${esc(v.title)}</h1></header>
${statusHtml()}${resultHtml()}
<div class="prose">${paras(v.text)}</div>
${v.end ? `<ul class="choices"><li><button class="choice" data-new="1">Start a new game</button></li><li><button class="choice" data-tab-go="sheet">See how James ended up</button></li></ul>` : `<ul class="choices">${choices}</ul>`}
</section>`;
}

function renderCombat() {
    const c = g.combat;
    const acts = Object.entries(COMBAT_ACTIONS).filter(([id]) => actionOpen(g, id) && !(id === 'spikes' && c.fieldUsed)).map(([id, a0]) => {
        const a = { ...a0, label: actionLabel(g, id, a0.label) }; // v0.10.4: only the forms James can sing, named for his best one
        const cost = (a.keeps === 'blade' && c.bladeFormed) || (a.keeps === 'spear' && c.spearFormed) || (a.field && c.fieldUsed) ? 0 : actionCost(g, a);
        const d = actionDmg(g, a);
        const off = cost > g.james.qi;
        const val = n1(skillCheck(a.skill === 'GU' ? g.james.gu : g.james.skills[a.skill]) + (taskMode ? (c.adapt?.[id] || 0) : 0));
        const tgt = c.enemies.find((e) => e.hp > 0);
        const plain = !showChecks ? '' : taskMode && tgt ? `${a.skill} ${val} / DC ${noDiceDc(tgt.dc + a.dcMod)} · ${Math.round((d[0] + d[1]) / 2)} dmg` : `${a.skill} ${val} + d6 · ${d[0]}–${d[1]} dmg`;
        return `<li><button class="choice fightish" data-act="${id}" ${off ? 'disabled' : ''}>${esc(a.label)}<span class="tag">${a.guard ? `${showChecks ? 'GU ' : ''}defence +${guardBonus(g)} this round${hasForm(g, 'buckler') && taskMode ? ' · covers Yuki' : ''}` : a.field ? `${FIELD_ROUNDS} rounds · ${fieldDamage(g)} to each attacker · once a fight` : plain}${a.reach ? ' · a full hit holds it off' : ''}${cost ? ` · ${cost} Qi` : ''}${a.stagger ? ' · staggers' : ''}${off ? ' · not enough Qi' : ''}</span></button></li>`;
    }).join('');
    const foes = c.enemies.map((e) => `<div class="foe${e.hp <= 0 ? ' down' : ''}"><span>${esc(e.name)}${e.staggered ? ' (reeling)' : ''}</span><div class="stroke"><i style="width:${pct(Math.max(0, e.hp), e.hpMax)}"></i></div></div>`).join('');
    const yuki = `<div class="foe"><span>Yuki</span><div class="stroke" style="background:rgba(242,239,230,0.08)"><i style="width:${pct(g.yuki.hp, yukiHpMax(g))};background:var(--bone)"></i></div></div>`;
    view.innerHTML = `<section>
<div class="plate">${sceneArt(val(SCENES[g.scene].art))}</div>
<header class="head"><div class="place">${esc(sceneTitle(g.scene))}</div><h1 class="title">Round ${c.round}</h1></header>
${statusHtml()}
<div class="foes">${foes}${yuki}</div>
<div class="round">${shownLines(combatLog || c.log).map((l) => dieHtml(l)).join('<br>')}</div>
<ul class="choices">${acts}${c.flee ? `<li><button class="choice" data-flee="1">Run${showChecks ? `<span class="tag">${taskMode ? `GU ${n1(skillCheck(g.james.gu))} / DC ${noDiceDc(Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk)))}` : 'GU + d6 vs their best attack'}</span>` : ''}</button></li>` : ''}</ul>
</section>`;
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
${skillRow('Convergence Use', cu, 'darts, needles, the wraithbone blade')}
<p class="note">${esc(BONESINGER_TIERS[Math.min(cu.tier, BONESINGER_TIERS.length - 1)] || '')}</p>
${taskMode ? Object.entries(FORM_LINES).map(([k, l]) => { const s = lineState(g, k); return `<div class="row"><span>${esc(l.label)}</span><span>${s.now ? esc(s.now.name) : '—'}${s.next ? ` <span class="note">(next: ${esc(s.next.name)} at ${rankLabel(s.next.at)})</span>` : ''}</span></div>`; }).join('') : ''}
${taskMode && g.coil ? `<h2>The Coil</h2><p class="note">${g.coil.act === 1 ? 'Act 1, ' : ''}Coil ${g.coil.n}. ${coilActive(g) ? `Bite the tail to wake at ${g.coil.act === 1 ? 'Day 8\'s dawn' : 'the first dawn'}: James keeps his familiarity and what he knows; his realm, skills and meridians, the hammerspace and the world start over. This Coil he learns ×${coilMult(g).toFixed(1)} as fast; the next, ×${(coilMult(g) + 0.5).toFixed(1)}.` : 'The Coil turns during the prologue (until the tribute is settled) and during Act 1 (until Shen Qiu is settled).'}</p>${coilActive(g) ? '<div class="btns"><button class="btn" data-bite="1">Bite the tail</button></div><p class="note" id="saveNote"></p>' : ''}` : ''}
<h2>Pillars</h2>
<div class="row"><span>Ouroboros Axiom</span><span>DR 1</span><span class="sub">The body as a closed garden: what comes in is filtered and returned clean.</span></div>
<div class="row"><span>Parallel Cognition Engine</span><span>9 threads</span><span class="sub">One of them is always on watch, if he asks.</span></div>
<h2>Yuki</h2>
<p class="note">His root-kin: a small white cat, born the same day, meridians mirroring his. Mortal Vessel.</p>
<div class="row"><span>HP · Qi</span><span>${n1(g.yuki.hp)} / ${yukiHpMax(g)} · ${n1(g.yuki.qi)} / ${n1(yukiQiMax(g))}</span></div>
${skillRow('Fight', g.yuki.fight)}${skillRow('Qi Use', g.yuki.qiUse, 'shares every award through the bond')}
${rel ? `<h2>People</h2>${rel}` : ''}
<h2>Rules in one breath</h2>
<p class="note">A check is the skill's value plus a d6 against the DC; a 6 always succeeds, a 1 needs DC + 2. Success pays XP to the skill and to GU in equal shares (a fail pays a quarter); Yuki gets a share through the bond. Every 30 minutes the body regenerates 5% HP and 11.6% Convergence. Hunger below 30 costs 1 on every check.</p>
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
    view.innerHTML = `<section class="page"><h1>Journal</h1><p class="lede">${showChecks ? `${g.stats.checks} checks rolled, ${g.stats.wins} passed · ` : ''}${g.stats.kills} things that wanted to eat you, didn't · ${g.stats.meals} meals.</p>${entries || '<p class="note">Nothing yet. Give it a minute.</p>'}</section>`;
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
<h2 data-modehead="1">Game mode</h2>
<p class="note">${taskMode ? 'Incremental Mode: every screen is cards on a clock, with no dice, familiarity, Yuki\'s lane and the Coil. 1 game hour takes 3 seconds at ×1; ×2 opens after a won tribute, ×5 after Act 1. New games start with closed meridians.' : 'Story Mode: the older game, with dice and no Coil. Choices happen at once.'}</p>
<div class="btns"><button class="btn${taskMode ? ' primary' : ''}" data-tasks="${taskMode ? '' : '1'}">Incremental Mode</button><button class="btn${taskMode ? '' : ' primary'}" data-tasks="${taskMode ? '1' : ''}">Story Mode (older, with dice, no Coil)</button></div>
${taskMode ? `<div class="btns"><button class="btn${pauseDeath ? ' primary' : ''}" data-pausedeath="1">Pause before the forecast death: ${pauseDeath ? 'on' : 'off'}</button></div>` : ''}
${testSpeeds || modeTaps >= 5 ? `<div class="btns"><button class="btn${testSpeeds ? ' primary' : ''}" data-testspeeds="1">Test speeds: ${testSpeeds ? 'on' : 'off'}</button></div>` : ''}
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
        : `<button class="btn primary big" data-menu="continue">${hadSave ? 'Continue' : 'Begin'}<small>${esc(sceneTitle(g.scene))} — ${esc(clockLabel(g.minutes))}${taskMode && g.coil && hadSave ? ` · ${g.coil.act === 1 ? 'Act 1, ' : ''}Coil ${g.coil.n}` : ''}</small></button>`;
    view.innerHTML = `<section class="page menu-page main-menu">
<div class="mseal" aria-hidden="true">骨</div>
<h1 class="mtitle">Bone and Ash</h1>
<p class="note mver">Version <span id="menuVer">…</span> · ${taskMode ? 'Incremental Mode' : 'Story Mode'}</p>
<div class="mbtns">${cont}${hadSave && !recovery ? '<button class="btn big" data-new="1">New game</button>' : ''}<button class="btn big" data-menu="saves">Saves</button><button class="btn big" data-menu="settings">Settings</button></div>
<p class="note" id="saveNote"></p></section>`;
    gameVersion().then((v) => { const el = document.getElementById('menuVer'); if (el) el.textContent = v; });
}
function openMenu(page = 'main') {
    if (!menu && g && !recovery) { pauseNow('menu'); autosave(); }
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
    const lb = b.cloneNode(true); lb.querySelectorAll('.tag, .len, .n').forEach((e) => e.remove());
    const label = plain(lb.textContent).trim();
    let ch = null, card = null, mins = 0;
    if (b.dataset.run && onTaskHub()) {
        card = taskCards(g, SCENES).find((c) => c.id === b.dataset.run);
        const m = /^(.+):(\d+)$/.exec(b.dataset.run);
        if (m) ch = SCENES[m[1]]?.choices?.[Number(m[2])] || null;
        mins = card && card.status === 'open' ? taskMinutes(g, SCENES, card.id) : card?.minutes || 0;
    } else if (b.dataset.story != null) {
        const i = Number(b.dataset.story);
        ch = i < 1000 ? SCENES[g.scene]?.choices?.[i] || null : null;
        mins = b.disabled ? 0 : storyMinutes(i);
    } else if (b.dataset.choice != null) {
        ch = SCENES[g.scene]?.choices?.[Number(b.dataset.choice)] || null;
    } else if (b.dataset.act) {
        const a = COMBAT_ACTIONS[b.dataset.act];
        if (a) {
            const cost = actionCost(g, a);
            if (cost) lines.push(`Costs ${cost} Qi${a.keeps ? ' to form, then free this fight' : ''}.`);
            if (a.guard) lines.push(`Braces: defence +${guardBonus(g)} this round${hasForm(g, 'buckler') && taskMode ? ', and the shield covers Yuki' : ''}.`);
            if (a.field) lines.push(`A field of bone spikes for ${FIELD_ROUNDS} rounds: ${fieldDamage(g)} back to each attacker. Once a fight.`);
            if (a.stagger) lines.push('Staggers what it hits.');
            if (a.reach) lines.push('A clean hit holds the enemy off for the round.');
            if (showChecks) { const d = actionDmg(g, a); lines.push(`${a.skill} · ${d[0]}–${d[1]} damage.`); }
        }
    } else if (b.dataset.flee) lines.push('Tries to get away. Not every fight lets you.');
    if (ch) {
        const items = itemNames(ch);
        if (items.length) lines.push(`Can bring back: ${items.join(', ')}.`);
        if (ch.qi) lines.push(`Costs ${ch.qi} Qi.`);
        if (ch.combat) lines.push('Leads to a fight.');
    }
    if (mins) lines.push(`Takes ${durLabel(mins)}${b.dataset.run && isInstantTask(g, SCENES, b.dataset.run) ? ', passing at once' : ''}.`);
    if (card && card.kind === 'work') lines.push(`Familiarity: ${FAM[card.tier].name}${card.next != null ? `, ${card.fam} of ${card.next} to ${FAM[card.tier + 1].name}` : ' (the top)'}. Familiar work goes faster.`);
    if (card && card.status !== 'open') lines.push('Done for today. Back tomorrow.');
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
view.addEventListener('toggle', (ev) => { const d = ev.target; if (d.dataset?.rid) { const id = Number(d.dataset.rid); if (d.open) openResults.add(id); else openResults.delete(id); } }, true);

/* ---------------- wiring ---------------- */

function render() {
    plog('not logged');
    scenePause();
    document.querySelectorAll('#tabs button').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    document.body.classList.toggle('menu-on', !!menu);
    if (menu) return renderMenu();
    if (recovery) return renderRecovery();
    ({ story: renderStory, sheet: renderSheet, bag: renderBag, journal: renderJournal })[tab]();
    if (tab === 'story' && g && g.scene !== announcedScene) { announcedScene = g.scene; announce(g.combat ? `A fight: ${sceneTitle(g.scene)}` : val(SCENES[g.scene]?.title) || ''); }
}
/** v0.11.11: each tab keeps its scroll; the Story tab starts at the top again on a new scene. */
const scrollPos = {};
function setTab(t) {
    tipEl.hidden = true;
    if (t === 'menu') { if (!menu) scrollPos[tab] = { y: window.scrollY, scene: g?.scene }; openMenu('main'); return; }
    if (!menu) scrollPos[tab] = { y: window.scrollY, scene: g?.scene };
    menu = null; tab = t; render();
    const p = scrollPos[t];
    window.scrollTo({ top: p && (t !== 'story' || p.scene === g?.scene) ? p.y : 0 });
}

view.addEventListener('click', (ev) => {
    if (ev.target.closest('h2[data-modehead]')) { // hidden: 5 taps within a few seconds show "Test speeds"
        const now = Date.now(); modeTaps = now - modeTapAt < 1500 ? modeTaps + 1 : 1; modeTapAt = now;
        if (modeTaps === 5) render();
        return;
    }
    const b = ev.target.closest('button');
    if (!b) return;
    if (recovery && !menu) { onRecovery(b); return; }
    if (b.dataset.choice != null || b.dataset.act || b.dataset.flee) {
        const now = Date.now();
        if (now - lastPress < 400) return; // double-tap guard: a fast second tap must not take the next scene's choice
        lastPress = now;
    }
    try {
        if (b.dataset.run || b.dataset.qadd) { // tap = run now, ahead of the queue; + = add to the end (paused: both only queue) — v0.10.0
            const id = b.dataset.run || b.dataset.qadd;
            const now = !!b.dataset.run; // v0.10.2: a tap always runs now; paused, it runs this one card and pauses again
            if (now) tapRun();
            if (now && running?.kind) stopRunning(); // a story or meditate bar: nothing of it happens
            if (!(now ? queueRunNow(g, id) : queueAdd(g, id))) { endOneShot('queue full'); lastResult = { lines: [`The queue is full (${QUEUE_MAX}).`], fail: true }; render(); return; }
            if (now && running) stopRunning(); // the card that was running moves to second place and starts over later
            autosave(); startNext(); render();
            return;
        }
        if (b.dataset.qup != null || b.dataset.qdown != null) {
            const k = Number(b.dataset.qup ?? b.dataset.qdown), dir = b.dataset.qup != null ? -1 : 1;
            if ((k === 0 || k + dir === 0) && running && !running.kind) stopRunning(); // the head changes
            queueMove(g, k, dir); autosave(); startNext(); render();
            return;
        }
        if (b.dataset.qclear) { queueClear(g, !!(running && !running.kind)); autosave(); render(); return; }
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
            g = next; stopRunning(); lastResult = null; combatLog = null; autosave(); setTab('story');
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
        if (b.dataset.pausedeath) { pauseDeath = !pauseDeath; store.set(PAUSE_DEATH_KEY, pauseDeath ? '1' : '0'); render(); return; }
        if (b.dataset.unq != null) {
            const k = Number(b.dataset.unq);
            if (k === 0 && running) stopRunning();
            taskQueue(g).splice(k, 1); autosave(); startNext(); render();
            return;
        }
        if (b.dataset.story != null) {
            const now = Date.now();
            if (now - lastPress < 400) return;
            lastPress = now;
            if (running?.kind) return; // one story step at a time
            if (running) stopRunning(); // a story step stops a running task bar: nothing of it happens; the queue waits
            const idx = Number(b.dataset.story);
            const mins = storyMinutes(idx);
            const ch = SCENES[g.scene]?.choices?.[idx];
            if (!mins || instantChoice(ch) || waitChoice(SCENES, ch, mins, g.scene)) { playChoice(idx); return; } // rest, sleep and waiting for a time of day: no bar (v0.10.0, v0.10.2)
            tapRun();
            startBar('story', idx, ch ? String(val(ch.text)) : 'Story', mins); render();
            return;
        }
        if (b.dataset.med) {
            if (running?.kind) return;
            if (running) stopRunning();
            if (b.dataset.med === 'med:sit') { tapRun(); startBar('med', 'med:sit', 'Cultivate: one sit', SIT_MINUTES); render(); return; }
            if (b.dataset.med === 'med:bt') { const bt = medCards(g, SCENES).find((m) => m.id === 'med:bt'); if (bt?.minutes) { tapRun(); startBar('med', 'med:bt', 'Break through', bt.minutes); render(); return; } } // v0.11.2: a timed sit, then the scene
            const r = runMed(g, SCENES, b.dataset.med);
            lastResult = r.lines.length ? { lines: r.lines, fail: false } : null; autosave(); render(); window.scrollTo({ top: 0, behavior: smoothScroll() });
            return;
        }
        if (b.dataset.pause) {
            if (speed && !oneShot) pauseNow('pause button'); else { speed = resumeSpeed || 1; oneShot = false; plog('resume button'); }
            store.set(SPEED_KEY, String(resumeSpeed)); lastTickAt = Date.now(); startNext(); render(); return;
        }
        if (b.dataset.bite) {
            if (Date.now() - biteArmed > 4000) { biteArmed = Date.now(); note('Tap Bite the tail again to end this Coil. Everything in the hammerspace is lost; what James learned is not.'); return; }
            biteArmed = 0; stopRunning();
            endCoil(g, 'choice', g.scene);
            lastResult = null; goTo(g, SCENES, 'coil_end'); autosave(); setTab('story');
            return;
        }
        if (b.dataset.panel) { panel = b.dataset.panel; if (panel === 'results') unseen = 0; render(); return; }
        if (b.dataset.yuki) { const yl = yukiLane(g); setYuki(g, !yl.on); autosave(); render(); return; }
        if (b.dataset.testspeeds) { testSpeeds = !testSpeeds; store.set(TEST_SPEEDS_KEY, testSpeeds ? '1' : '0'); lastTickAt = Date.now(); render(); return; }
        if (b.dataset.tasks != null) {
            if (!b.dataset.tasks) return; // the mode already on
            taskMode = !taskMode; store.set(TASKS_KEY, taskMode ? '1' : '0'); setNoDice(taskMode);
            if (!taskMode) stopRunning(); else startNext();
            render(); return;
        }
        if (b.dataset.choice != null) stopRunning(); // a story stop: the bar's work is not done, so nothing of it happens
        if (b.dataset.choice != null) {
            const ch = SCENES[g.scene]?.choices?.[Number(b.dataset.choice)];
            if (ch && /^Stay lost/.test(String(val(ch.text)))) backupBefore('the Long Forest');
            const r = choose(g, SCENES, Number(b.dataset.choice));
            lastResult = { lines: r.lines, fail: r.roll ? !r.roll.success : false };
            if (r.combat) { startCombat(g, r.combat(g)); combatLog = null; }
            autosave(); startNext(); render(); window.scrollTo({ top: 0, behavior: smoothScroll() });
        } else if (b.dataset.act) {
            const out = combatStep(g, b.dataset.act);
            combatLog = out.lines;
            if (out.done) { const lines = out.lines.slice(); lines.push(...goTo(g, SCENES, out.next)); lastResult = { lines, fail: out.done === 'lose' }; combatLog = null; }
            autosave(); render();
        } else if (b.dataset.flee) {
            const out = combatFlee(g);
            combatLog = out.lines;
            if (out.done) { const lines = out.lines.slice(); lines.push(...goTo(g, SCENES, out.next)); lastResult = { lines, fail: out.done === 'lose' }; combatLog = null; }
            autosave(); render();
        } else if (b.dataset.new) {
            if ((menu || tab !== 'story') && !confirmNew()) return;
            backupBefore('a new game');
            g = freshGame(); stopRunning();
            lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.tabGo) {
            setTab(b.dataset.tabGo);
        } else if (b.dataset.save) {
            writeKey(SLOT(b.dataset.save), serialize(g)); render(); note('Saved.');
        } else if (b.dataset.load) {
            let next;
            try { next = checkScene(deserialize(store.get(SLOT(b.dataset.load)))); } catch (err) { note(`Slot ${b.dataset.load} can't be loaded: ${err.message}`); return; }
            backupBefore(`loading slot ${b.dataset.load}`);
            g = next; stopRunning(); lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.export) {
            download(serialize(g), `bone-and-ash-${clockLabel(g.minutes).replace(/[^\w]+/g, '-')}.json`); expMark();
        }
    } catch (err) {
        lastResult = { lines: [String(err.message || err)], fail: true }; render();
        if (!(err instanceof SaveError)) showError(err);
    }
});
view.addEventListener('change', async (ev) => {
    const sel = ev.target.closest('select[data-speed]');
    if (sel) { const v = Number(sel.value); if (v) { resumeSpeed = v; speed = v; oneShot = false; store.set(SPEED_KEY, String(v)); plog('speed menu'); } else pauseNow('speed menu'); lastTickAt = Date.now(); startNext(); render(); return; }
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
    g = next; stopRunning(); autosave(); lastResult = null; setTab('story');
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
startNext();
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline install is optional */ });
}
