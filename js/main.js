/** Bone and Ash — UI. Renders the story, combat, sheet, hammerspace, journal and saves. */
import {
    newGame, ensureBars, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, skillCheck, xpToNext, clockLabel, clockLabelG, realmName, yukiForm,
    startCombat, combatStep, combatFlee, COMBAT_ACTIONS, setNoDice, noDiceDc, serialize, deserialize, peekSave, SaveError, BONESINGER_TIERS, itemCap, jamesDr, hpRegenPct, actionCost, actionDmg,
} from './core/game.js';
import { sceneView, choose, goTo } from './core/story.js';
import { isTaskHub, isTaskChoice, taskCards, taskOpen, taskLabel, taskMinutes, runTask, outlook, taskQueue, MS_PER_GAME_HOUR, QUEUE_MAX, FAM, yukiLane, setYuki } from './core/tasks.js';
import { SCENES, ITEMS } from './story/prologue.js';
import { coilActive, endCoil, coilPrefill } from './core/coil.js';
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
const TASKS_KEY = 'boneash.tasks'; // per phone: '1' = "Tasks (preview)" on
let taskMode = store.get(TASKS_KEY) === '1';
setNoDice(taskMode); // no dice anywhere in task mode (v0.9.3)
const SPEED_KEY = 'boneash.speed'; // per phone: 0 = paused, 1, 2, 5, 10
const SPEEDS = [[0, 'Pause'], [1, '×1'], [2, '×2'], [5, '×5'], [10, '×10']]; // all open while testing; the gate comes with the Coil (3c)
let speed = (() => { const v = Number(store.get(SPEED_KEY)); return SPEEDS.some(([n]) => n === v) && store.get(SPEED_KEY) !== null ? v : 1; })();
let resumeSpeed = speed || 1; // what ▶ goes back to
let lastTickAt = Date.now();
let running = null; // { id, label, done, ms, m0, mins } — done = ms of bar filled (at ×1) — the head of the queue while its bar fills (not saved: a reload restarts it)
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
function addResult(title, lines, fail) {
    taskResults.unshift({ title, sum: summarize(lines), lines, fail });
    taskResults.length = Math.min(taskResults.length, RESULTS_MAX);
    if (panel !== 'results') unseen += 1;
}
const durLabel = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} m` : ''}` : `${m} m`);
const onTaskHub = () => taskMode && g && !recovery && isTaskHub(g);

function startNext() {
    if (running || !onTaskHub()) return;
    if (coilPrefill(g)) autosave(); // "same days again": this hub and day get last Coil's cards
    const q = taskQueue(g);
    const skipped = [];
    while (q.length && !taskOpen(g, SCENES, q[0])) skipped.push(taskLabel(g, SCENES, q.shift()));
    for (const l of skipped) addResult(l, ['Skipped: not possible when its turn came.'], true);
    if (skipped.length) autosave();
    if (!q.length) return;
    const id = q[0];
    const mins = taskMinutes(g, SCENES, id);
    const yl = yukiLane(g);
    running = { id, yuki: yl && yl.on ? { progress: yl.progress, len: yl.len } : null, label: taskLabel(g, SCENES, id), done: 0, ms: Math.max(400, (mins / 60) * MS_PER_GAME_HOUR), m0: g.minutes, mins };
    lastTickAt = Date.now();
    if (!ticker) ticker = setInterval(tick, 100);
}
function stopRunning() { running = null; }
function tick() {
    const now = Date.now();
    const dt = Math.min(1000, now - lastTickAt); // a sleeping phone doesn't fast-forward more than a second
    lastTickAt = now;
    if (!running) return;
    if (!onTaskHub()) { running = null; return; }
    running.done += dt * speed;
    const f = Math.min(1, running.done / running.ms);
    const bar = document.getElementById('nowbar');
    if (bar) bar.style.width = `${(f * 100).toFixed(1)}%`;
    const yb = document.getElementById('yukibar');
    if (yb && running.yuki) yb.style.width = `${Math.min(100, ((running.yuki.progress + f * running.mins) % running.yuki.len) / running.yuki.len * 100).toFixed(1)}%`;
    const clk = document.querySelector('.status .clk');
    if (clk && tab === 'story') clk.textContent = clockLabelG(g, running.m0 + Math.floor(f * running.mins));
    if (f < 1) return;
    const { id, label } = running;
    running = null;
    try {
        if (taskQueue(g)[0] === id) taskQueue(g).shift();
        const r = runTask(g, SCENES, id);
        lastResult = r.stopped ? { lines: r.lines, fail: r.fail } : null; // a door or collapse shows its lines in the scene it opens
        if (!r.stopped) addResult(label, r.lines, r.fail);
        autosave();
        startNext();
        render();
    } catch (err) { taskQueue(g).length = 0; showError(err); render(); }
}

function renderTaskHub() {
    const v = sceneView(g, SCENES);
    const cards = taskCards(g, SCENES);
    const q = taskQueue(g);
    const ol = outlook(g, SCENES);
    const counts = {};
    for (const id of q) counts[id] = (counts[id] || 0) + 1;
    const groups = [];
    for (const c of cards) { let gr = groups.find((x) => x.name === c.group); if (!gr) groups.push(gr = { name: c.group, cards: [] }); gr.cards.push(c); }
    const cardHtml = (c) => {
        const mins = c.status === 'open' ? taskMinutes(g, SCENES, c.id) : c.minutes;
        const fam = c.kind === 'work' ? ` · ${FAM[c.tier].name}${c.next != null ? ` ${c.fam}/${c.next}` : ''}` : '';
        const tag = c.status !== 'open' ? 'done for today — back tomorrow' : c.kind === 'door' ? `opens the scene${c.tag ? ` · ${c.tag}` : ''}` : (c.tag || 'no check');
        return `<button class="card${c.kind === 'door' ? ' door' : ''}${c.check ? ` b-${c.check.band}` : ''}" data-task="${esc(c.id)}" ${c.status !== 'open' ? 'disabled' : ''}>${counts[c.id] ? `<span class="n">×${counts[c.id]}</span>` : ''}${md(c.label)}<span class="tag">${esc(tag)}</span>${c.status === 'open' ? `<span class="len">${durLabel(mins)}${fam}</span>` : ''}</button>`;
    };
    const yl = yukiLane(g);
    const yHtml = yl ? `<div class="yuki-lane"><div><b>Yuki:</b> ${esc(yl.label)} <span class="note">Fight ${yl.check} / DC ${yl.dc} · ${durLabel(yl.len)} · ${FAM[yl.tier].name}</span>${yl.on ? `<div class="stroke"><i id="yukibar" style="width:${Math.min(100, (yl.progress / yl.len) * 100).toFixed(1)}%"></i></div>` : ''}</div><button class="btn${yl.on ? ' primary' : ''}" data-yuki="1">${yl.on ? 'On' : 'Off'}</button></div>` : '';
    const rows = ol.rows.map((r, k) => `<li class="${r.skip ? 'skip' : ''}"><span>${md(taskLabel(g, SCENES, r.id))}</span><time>${r.skip ? 'not possible then' : r.wait ? 'after the story' : `→ ${clockLabelG(g, r.end).replace(/^Day \d+, /, '')}`}</time><button class="x" data-unq="${k}" aria-label="Remove">✕</button></li>`).join('');
    const out = ol.fedOut != null
        ? `<p class="outlook warn">Fed runs out ${esc(clockLabelG(g, ol.fedOut))} on this queue. Queue some food.</p>`
        : q.length ? `<p class="outlook">Fed holds: about ${Math.round(ol.fedEnd)} when the queue ends (${esc(clockLabelG(g, ol.end))}).</p>` : '<p class="outlook">Nothing queued. The clock waits for you.</p>';
    const now = running
        ? `<div class="now"><b>${speed ? 'James:' : 'Paused:'}</b> ${md(running.label)}<div class="stroke"><i id="nowbar" style="width:${(Math.min(1, running.done / running.ms) * 100).toFixed(1)}%"></i></div></div>`
        : `<div class="now idle">${speed ? 'Idle. Tap a card to queue it; the clock runs while a task does.' : 'Paused. Tap cards to queue them; nothing runs until you resume.'}</div>`;
    const nowRow = `<div class="nowrow">${now}<button class="btn pause${speed ? '' : ' primary'}" data-pause="1">${speed ? '⏸ Pause' : '▶ Resume'}</button></div>`;
    const stops = v.choices.filter((c) => c.index >= 1000 || !isTaskChoice(SCENES, g.scene, c.index))
        .map((c) => `<li><button class="choice${/fight/.test(c.tag) ? ' fightish' : ''}" data-choice="${c.index}" ${c.disabled ? 'disabled aria-disabled="true"' : ''}>${md(c.label)}${c.tag || c.reason ? `<span class="tag">${esc(c.disabled ? c.reason : c.tag)}</span>` : ''}</button></li>`).join('');
    view.innerHTML = `<section>
<div class="plate">${sceneArt(v.art)}</div>
<header class="head"><div class="place">${esc(v.place || g.location)}</div><h1 class="title">${esc(v.title)}</h1></header>
${statusHtml()}${resultHtml()}
<div class="prose">${paras(v.text)}</div>
${stops ? `<ul class="choices">${stops}</ul>` : ''}
${nowRow}${yHtml}${out}
<div class="panel-switch" role="tablist"><button role="tab" data-panel="cards" aria-selected="${panel === 'cards'}">Cards</button><button role="tab" data-panel="results" aria-selected="${panel === 'results'}">Results${unseen ? ` <span class="badge">${unseen}</span>` : ''}</button></div>
<div class="split">
<div class="pane tasks${panel === 'cards' ? ' on' : ''}">
${q.length ? `<h2>Queue (${q.length} / ${QUEUE_MAX})</h2><ol class="queue">${rows}</ol>` : ''}
${groups.map((gr) => `<h2>${esc(gr.name)}</h2><div class="cards">${gr.cards.map(cardHtml).join('')}</div>`).join('')}
</div>
<div class="pane results${panel === 'results' ? ' on' : ''}">
<h2>Results</h2>
${taskResults.length ? taskResults.map((r) => `<details class="res${r.fail ? ' fail' : ''}"><summary><b>${md(r.title)}</b> <span>${esc(r.sum)}</span></summary><div>${r.lines.map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div></details>`).join('') : '<p class="note">Nothing yet. Finished tasks land here, newest on top; tap one for the details. The Journal keeps all of them.</p>'}
</div>
</div>
</section>`;
}

const freshGame = () => ensureBars(newGame(Math.floor(Math.random() * 2 ** 31)));
const bakMeta = () => { try { return JSON.parse(store.get(BAK_META)) || { play: 0, at: {}, when: {} }; } catch { return { play: 0, at: {}, when: {} }; } };
function writeKey(k, s) { if (!store.set(k, s) && !storageWarned) { storageWarned = true; showError('Could not save: the storage for this site is full or blocked. Download your save from the Saves tab.'); } }

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
    let s;
    try { s = serialize(g); } catch (err) { showError(err.message); return; } // never write a broken state
    writeKey(AUTO, s);
    rolling(s);
    if (g.scene !== prevScene && RISKY_SCENES[g.scene]) backupBefore(RISKY_SCENES[g.scene]);
    prevScene = g.scene;
}

function load() {
    const raw = store.get(AUTO);
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
function fallbackCopy(text, done) {
    const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch { /* the message stays on screen */ }
    t.remove();
}
window.addEventListener('error', (ev) => showError(ev.error || ev.message));
window.addEventListener('unhandledrejection', (ev) => showError(ev.reason));

/* ---------------- story ---------------- */

function statusHtml() {
    return `<div class="status">
<div class="bar hp"><b>${n1(g.james.hp)} / ${jamesHpMax(g)}</b>HP<div class="stroke"><i style="width:${pct(g.james.hp, jamesHpMax(g))}"></i></div></div>
<div class="bar qi"><b>${n1(g.james.qi)} / ${n1(jamesQiMax(g))}</b>Convergence<div class="stroke"><i style="width:${pct(g.james.qi, jamesQiMax(g))}"></i></div></div>
<div class="bar food"><b>${Math.round(g.james.satiety)}</b>Fed<div class="stroke"><i style="width:${pct(g.james.satiety, 100)}"></i></div></div>
<div class="clock"><span class="clk">${clockLabelG(g)}</span>${onTaskHub() ? `<select class="speed" data-speed="1" aria-label="Speed">${SPEEDS.map(([n, l]) => `<option value="${n}"${n === speed ? ' selected' : ''}>${l}</option>`).join('')}</select>` : ''}</div></div>`;
}

function resultHtml() {
    if (!lastResult || !lastResult.lines.length) return '';
    return `<div class="result${lastResult.fail ? ' fail' : ''}" role="status">${lastResult.lines.map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div>`;
}

function renderStory() {
    if (g.combat) return renderCombat();
    if (onTaskHub()) { startNext(); return renderTaskHub(); }
    const v = sceneView(g, SCENES);
    const choices = v.choices.map((c) => `<li><button class="choice${/fight/.test(c.tag) ? ' fightish' : ''}" data-choice="${c.index}" ${c.disabled ? `disabled aria-disabled="true"` : ''}>${md(c.label)}${c.tag || c.reason ? `<span class="tag">${esc(c.disabled ? c.reason : c.tag)}</span>` : ''}</button></li>`).join('');
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
    const acts = Object.entries(COMBAT_ACTIONS).map(([id, a]) => {
        const cost = a.keeps === 'blade' && c.bladeFormed ? 0 : actionCost(g, a);
        const d = actionDmg(g, a);
        const off = cost > g.james.qi;
        const val = n1(skillCheck(a.skill === 'GU' ? g.james.gu : g.james.skills[a.skill]) + (taskMode ? (c.adapt?.[id] || 0) : 0));
        const tgt = c.enemies.find((e) => e.hp > 0);
        const plain = taskMode && tgt ? `${a.skill} ${val} / DC ${noDiceDc(tgt.dc + a.dcMod)} · ${Math.round((d[0] + d[1]) / 2)} dmg` : `${a.skill} ${val} + d6 · ${d[0]}–${d[1]} dmg`;
        return `<li><button class="choice fightish" data-act="${id}" ${off ? 'disabled' : ''}>${esc(a.label)}<span class="tag">${a.guard ? 'GU defence +2 this round' : plain}${cost ? ` · ${cost} Qi` : ''}${a.stagger ? ' · staggers' : ''}${off ? ' · not enough Qi' : ''}</span></button></li>`;
    }).join('');
    const foes = c.enemies.map((e) => `<div class="foe${e.hp <= 0 ? ' down' : ''}"><span>${esc(e.name)}${e.staggered ? ' (reeling)' : ''}</span><div class="stroke"><i style="width:${pct(Math.max(0, e.hp), e.hpMax)}"></i></div></div>`).join('');
    const yuki = `<div class="foe"><span>Yuki</span><div class="stroke" style="background:rgba(242,239,230,0.08)"><i style="width:${pct(g.yuki.hp, yukiHpMax(g))};background:var(--bone)"></i></div></div>`;
    view.innerHTML = `<section>
<div class="plate">${sceneArt(val(SCENES[g.scene].art))}</div>
<header class="head"><div class="place">${esc(sceneTitle(g.scene))}</div><h1 class="title">Round ${c.round}</h1></header>
${statusHtml()}
<div class="foes">${foes}${yuki}</div>
<div class="round">${(combatLog || c.log).map((l) => dieHtml(l)).join('<br>')}</div>
<ul class="choices">${acts}${c.flee ? `<li><button class="choice" data-flee="1">Run<span class="tag">${taskMode ? `GU ${n1(skillCheck(g.james.gu))} / DC ${noDiceDc(Math.max(...c.enemies.filter((e) => e.hp > 0).map((e) => e.atk)))}` : 'GU + d6 vs their best attack'}</span></button></li>` : ''}</ul>
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
<div class="row"><span>Realm</span><span>${esc(realmName(j.realm))} · Saturation ${n1(j.saturation)}%</span><span class="sub">Primaries ${j.primaries}/12 · collaterals ${j.collaterals}/66 · ${meridianRow(g)}. No herbs, no pills, no tribulation: the Ouroboros Axiom composts this world's poisoned Qi.</span></div>
<h2>Skills</h2>
${skillRow('GU', j.gu, 'General Use: anything he has no skill for, and his defence')}
${skillRow('Convergence Use', cu, 'darts, needles, the wraithbone blade')}
<p class="note">${esc(BONESINGER_TIERS[Math.min(cu.tier, BONESINGER_TIERS.length - 1)] || '')}</p>
${taskMode && g.coil ? `<h2>The Coil</h2><p class="note">Coil ${g.coil.n}. ${coilActive(g) ? 'Bite the tail to wake at the first dawn: James keeps his realm, skills, familiarity and what he knows; the hammerspace and the world start over.' : 'The Coil only turns during the prologue for now.'}</p>${coilActive(g) ? '<div class="btns"><button class="btn" data-bite="1">Bite the tail</button></div><p class="note" id="saveNote"></p>' : ''}` : ''}
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
    const entries = g.log.slice().reverse().slice(0, 60).map((e) => `<div class="entry"><time>${clockLabel(e.at)}</time>${esc(sceneTitle(e.scene))}${e.lines.length ? `<div class="note">${e.lines.map((l) => dieHtml(l)).join('<br>')}</div>` : ''}</div>`).join('');
    view.innerHTML = `<section class="page"><h1>Journal</h1><p class="lede">${g.stats.checks} checks rolled, ${g.stats.wins} passed · ${g.stats.kills} things that wanted to eat you, didn't · ${g.stats.meals} meals.</p>${entries || '<p class="note">Nothing yet. Give it a minute.</p>'}</section>`;
}
function renderSaves() {
    const slot = (n) => {
        const raw = store.get(SLOT(n));
        const desc = raw ? descOf(raw) : 'Empty';
        return `<div class="row"><span>Slot ${n}</span><span class="note">${esc(desc)}</span><div class="btns sub"><button class="btn" data-save="${n}">Save here</button>${raw ? `<button class="btn" data-load="${n}">Load</button>` : ''}</div></div>`;
    };
    view.innerHTML = `<section class="page"><h1>Saves</h1>
<p class="lede">The game saves itself after every choice. Slots are for keeping a moment you might want back.</p>
${slot(1)}${slot(2)}${slot(3)}
<h2>Move a save to another device</h2>
<div class="btns"><button class="btn" data-export="1">Download save file</button><label class="btn">Load save file<input type="file" accept="application/json,.json" data-import="1" hidden></label></div>
<h2>Tasks (preview)</h2>
<p class="note">${taskMode ? 'On: the prologue days (1–6) run as timed task cards with a queue, without dice: check ÷ DC decides how well a task goes, and familiarity makes it faster and easier. 1 game hour takes 3 seconds at ×1.' : 'Off: the game plays as before. Turn it on to try the prologue days as timed task cards.'} Only this phone remembers it.</p>
<div class="btns"><button class="btn${taskMode ? ' primary' : ''}" data-tasks="1">${taskMode ? 'Tasks: on — turn off' : 'Tasks: off — turn on'}</button></div>
<h2>Start over</h2>
<div class="btns"><button class="btn primary" data-new="1">New game</button></div>
<p class="note" id="saveNote"></p></section>`;
}

/* ---------------- wiring ---------------- */

function render() {
    document.querySelectorAll('#tabs button').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
    if (recovery) return renderRecovery();
    ({ story: renderStory, sheet: renderSheet, bag: renderBag, journal: renderJournal, saves: renderSaves })[tab]();
}
function setTab(t) { tab = t; render(); window.scrollTo({ top: 0 }); }

view.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (recovery) { onRecovery(b); return; }
    if (b.dataset.choice != null || b.dataset.act || b.dataset.flee) {
        const now = Date.now();
        if (now - lastPress < 400) return; // double-tap guard: a fast second tap must not take the next scene's choice
        lastPress = now;
    }
    try {
        if (b.dataset.task) {
            const q = taskQueue(g);
            if (q.length >= QUEUE_MAX) { lastResult = { lines: [`The queue is full (${QUEUE_MAX}).`], fail: true }; render(); return; }
            q.push(b.dataset.task); autosave(); startNext(); render();
            return;
        }
        if (b.dataset.unq != null) {
            const k = Number(b.dataset.unq);
            if (k === 0 && running) stopRunning();
            taskQueue(g).splice(k, 1); autosave(); startNext(); render();
            return;
        }
        if (b.dataset.pause) {
            if (speed) { resumeSpeed = speed; speed = 0; } else speed = resumeSpeed || 1;
            store.set(SPEED_KEY, String(speed)); lastTickAt = Date.now(); render(); return;
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
        if (b.dataset.tasks) {
            taskMode = !taskMode; store.set(TASKS_KEY, taskMode ? '1' : '0'); setNoDice(taskMode);
            if (!taskMode) stopRunning(); else startNext();
            renderSaves(); return;
        }
        if (b.dataset.choice != null) stopRunning(); // a story stop: the bar's work is not done, so nothing of it happens
        if (b.dataset.choice != null) {
            const ch = SCENES[g.scene]?.choices?.[Number(b.dataset.choice)];
            if (ch && /^Stay lost/.test(String(val(ch.text)))) backupBefore('the Long Forest');
            const r = choose(g, SCENES, Number(b.dataset.choice));
            lastResult = { lines: r.lines, fail: r.roll ? !r.roll.success : false };
            if (r.combat) { startCombat(g, r.combat(g)); combatLog = null; }
            autosave(); startNext(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
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
            if (tab !== 'story' && !confirmNew()) return;
            backupBefore('a new game');
            g = freshGame(); stopRunning();
            lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.tabGo) {
            setTab(b.dataset.tabGo);
        } else if (b.dataset.save) {
            writeKey(SLOT(b.dataset.save), serialize(g)); renderSaves(); note('Saved.');
        } else if (b.dataset.load) {
            let next;
            try { next = checkScene(deserialize(store.get(SLOT(b.dataset.load)))); } catch (err) { note(`Slot ${b.dataset.load} can't be loaded: ${err.message}`); return; }
            backupBefore(`loading slot ${b.dataset.load}`);
            g = next; stopRunning(); lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.export) {
            download(serialize(g), `bone-and-ash-${clockLabel(g.minutes).replace(/[^\w]+/g, '-')}.json`);
        }
    } catch (err) {
        lastResult = { lines: [String(err.message || err)], fail: true }; render();
        if (!(err instanceof SaveError)) showError(err);
    }
});
view.addEventListener('change', async (ev) => {
    const sel = ev.target.closest('select[data-speed]');
    if (sel) { speed = Number(sel.value); if (speed) resumeSpeed = speed; store.set(SPEED_KEY, String(speed)); lastTickAt = Date.now(); render(); return; }
    const inp = ev.target.closest('input[data-import]');
    if (!inp || !inp.files?.[0]) return;
    let next;
    try { next = checkScene(deserialize(await inp.files[0].text())); } catch (err) { note(`That file can't be loaded: ${err.message}`); return; }
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
startNext();
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline install is optional */ });
}
