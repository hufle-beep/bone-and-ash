/** Bone and Ash — UI. Renders the story, combat, sheet, hammerspace, journal and saves. */
import {
    newGame, ensureBars, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, skillCheck, xpToNext, clockLabel, clockLabelG, realmName, yukiForm,
    startCombat, combatStep, combatFlee, COMBAT_ACTIONS, serialize, deserialize, peekSave, SaveError, BONESINGER_TIERS, itemCap, jamesDr, hpRegenPct, actionCost, actionDmg,
} from './core/game.js';
import { sceneView, choose, goTo } from './core/story.js';
import { SCENES, ITEMS } from './story/prologue.js';
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
const RISKY_SCENES = { tribute: 'the tribute', rt_elder: 'Shen Qiu' };
let recovery = null; // { raw, err } while the autosave can't be loaded
let lastTick = Date.now();
let storageWarned = false;
let prevScene = null;
let lastPress = 0;

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
<div class="clock">${clockLabelG(g)}</div></div>`;
}

function resultHtml() {
    if (!lastResult || !lastResult.lines.length) return '';
    return `<div class="result${lastResult.fail ? ' fail' : ''}" role="status">${lastResult.lines.map((l) => `<div>${dieHtml(l)}</div>`).join('')}</div>`;
}

function renderStory() {
    if (g.combat) return renderCombat();
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
        const val = n1(skillCheck(a.skill === 'GU' ? g.james.gu : g.james.skills[a.skill]));
        return `<li><button class="choice fightish" data-act="${id}" ${off ? 'disabled' : ''}>${esc(a.label)}<span class="tag">${a.guard ? 'GU defence +2 this round' : `${a.skill} ${val} + d6 · ${d[0]}–${d[1]} dmg`}${cost ? ` · ${cost} Qi` : ''}${a.stagger ? ' · staggers' : ''}${off ? ' · not enough Qi' : ''}</span></button></li>`;
    }).join('');
    const foes = c.enemies.map((e) => `<div class="foe${e.hp <= 0 ? ' down' : ''}"><span>${esc(e.name)}${e.staggered ? ' (reeling)' : ''}</span><div class="stroke"><i style="width:${pct(Math.max(0, e.hp), e.hpMax)}"></i></div></div>`).join('');
    const yuki = `<div class="foe"><span>Yuki</span><div class="stroke" style="background:rgba(242,239,230,0.08)"><i style="width:${pct(g.yuki.hp, yukiHpMax(g))};background:var(--bone)"></i></div></div>`;
    view.innerHTML = `<section>
<div class="plate">${sceneArt(val(SCENES[g.scene].art))}</div>
<header class="head"><div class="place">${esc(sceneTitle(g.scene))}</div><h1 class="title">Round ${c.round}</h1></header>
${statusHtml()}
<div class="foes">${foes}${yuki}</div>
<div class="round">${(combatLog || c.log).map((l) => dieHtml(l)).join('<br>')}</div>
<ul class="choices">${acts}${c.flee ? '<li><button class="choice" data-flee="1">Run<span class="tag">GU + d6 vs their best attack</span></button></li>' : ''}</ul>
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
        if (b.dataset.choice != null) {
            const ch = SCENES[g.scene]?.choices?.[Number(b.dataset.choice)];
            if (ch && /^Stay lost/.test(String(val(ch.text)))) backupBefore('the Long Forest');
            const r = choose(g, SCENES, Number(b.dataset.choice));
            lastResult = { lines: r.lines, fail: r.roll ? !r.roll.success : false };
            if (r.combat) { startCombat(g, r.combat(g)); combatLog = null; }
            autosave(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
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
            g = freshGame();
            lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.tabGo) {
            setTab(b.dataset.tabGo);
        } else if (b.dataset.save) {
            writeKey(SLOT(b.dataset.save), serialize(g)); renderSaves(); note('Saved.');
        } else if (b.dataset.load) {
            let next;
            try { next = checkScene(deserialize(store.get(SLOT(b.dataset.load)))); } catch (err) { note(`Slot ${b.dataset.load} can't be loaded: ${err.message}`); return; }
            backupBefore(`loading slot ${b.dataset.load}`);
            g = next; lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.export) {
            download(serialize(g), `bone-and-ash-${clockLabel(g.minutes).replace(/[^\w]+/g, '-')}.json`);
        }
    } catch (err) {
        lastResult = { lines: [String(err.message || err)], fail: true }; render();
        if (!(err instanceof SaveError)) showError(err);
    }
});
view.addEventListener('change', async (ev) => {
    const inp = ev.target.closest('input[data-import]');
    if (!inp || !inp.files?.[0]) return;
    let next;
    try { next = checkScene(deserialize(await inp.files[0].text())); } catch (err) { note(`That file can't be loaded: ${err.message}`); return; }
    backupBefore('loading a save file');
    g = next; autosave(); lastResult = null; setTab('story');
});
document.getElementById('tabs').addEventListener('click', (ev) => { const b = ev.target.closest('button[data-tab]'); if (b) setTab(b.dataset.tab); });

let newArmed = 0;
function confirmNew() {
    if (Date.now() - newArmed < 4000) return true;
    newArmed = Date.now();
    note('Tap New game again to start over. Your autosave will be replaced (slots are kept).');
    return false;
}
function note(t) { const n = document.getElementById('saveNote'); if (n) n.textContent = t; }

load();
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline install is optional */ });
}
