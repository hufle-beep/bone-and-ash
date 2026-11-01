/** Bone and Ash — UI. Renders the story, combat, sheet, hammerspace, journal and saves. */
import {
    newGame, ensureBars, jamesHpMax, jamesQiMax, yukiHpMax, yukiQiMax, skillCheck, xpToNext, clockLabel, realmName,
    startCombat, combatStep, combatFlee, COMBAT_ACTIONS, serialize, deserialize, BONESINGER_TIERS,
} from './core/game.js';
import { sceneView, choose, goTo } from './core/story.js';
import { SCENES, ITEMS } from './story/prologue.js';
import { sceneArt } from './art/art.js';

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
const dieHtml = (line) => md(line).replace(/🎲(\d)/g, '<span class="die" aria-label="rolled $1">$1</span>');

function autosave() { if (g) store.set(AUTO, serialize(g)); }

function load() {
    const raw = store.get(AUTO);
    if (raw) { try { g = deserialize(raw); return; } catch { /* fall through */ } }
    g = ensureBars(newGame(Math.floor(Math.random() * 2 ** 31)));
}

/* ---------------- story ---------------- */

function statusHtml() {
    return `<div class="status">
<div class="bar hp"><b>${n1(g.james.hp)} / ${jamesHpMax(g)}</b>HP<div class="stroke"><i style="width:${pct(g.james.hp, jamesHpMax(g))}"></i></div></div>
<div class="bar qi"><b>${n1(g.james.qi)} / ${n1(jamesQiMax(g))}</b>Convergence<div class="stroke"><i style="width:${pct(g.james.qi, jamesQiMax(g))}"></i></div></div>
<div class="bar food"><b>${Math.round(g.james.satiety)}</b>Fed<div class="stroke"><i style="width:${pct(g.james.satiety, 100)}"></i></div></div>
<div class="clock">${clockLabel(g.minutes)}</div></div>`;
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
        const cost = a.keeps === 'blade' && c.bladeFormed ? 0 : a.qi;
        const off = cost > g.james.qi;
        const val = n1(skillCheck(a.skill === 'GU' ? g.james.gu : g.james.skills[a.skill]));
        return `<li><button class="choice fightish" data-act="${id}" ${off ? 'disabled' : ''}>${esc(a.label)}<span class="tag">${a.guard ? 'GU defence +2 this round' : `${a.skill} ${val} + d6 · ${a.dmg[0]}–${a.dmg[1]} dmg`}${cost ? ` · ${cost} Qi` : ''}${a.stagger ? ' · staggers' : ''}${off ? ' · not enough Qi' : ''}</span></button></li>`;
    }).join('');
    const foes = c.enemies.map((e) => `<div class="foe${e.hp <= 0 ? ' down' : ''}"><span>${esc(e.name)}${e.staggered ? ' (reeling)' : ''}</span><div class="stroke"><i style="width:${pct(Math.max(0, e.hp), e.hpMax)}"></i></div></div>`).join('');
    const yuki = `<div class="foe"><span>Yuki</span><div class="stroke" style="background:rgba(242,239,230,0.08)"><i style="width:${pct(g.yuki.hp, yukiHpMax(g))};background:var(--bone)"></i></div></div>`;
    view.innerHTML = `<section>
<div class="plate">${sceneArt(SCENES[g.scene].art)}</div>
<header class="head"><div class="place">${esc(SCENES[g.scene].title)}</div><h1 class="title">Round ${c.round}</h1></header>
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
<div class="row"><span>HP</span><span>${n1(j.hp)} / ${jamesHpMax(g)} · DR ${j.dr}</span></div>
<div class="row"><span>Convergence (Qi + Bonesinger)</span><span>${n1(j.qi)} / ${n1(jamesQiMax(g))}</span></div>
<div class="row"><span>Realm</span><span>${esc(realmName(j.realm))} · Saturation ${n1(j.saturation)}%</span><span class="sub">Primaries ${j.primaries}/12 · collaterals ${j.collaterals}/66. No herbs, no pills, no tribulation: the Ouroboros Axiom composts this world's poisoned Qi.</span></div>
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
<p class="lede">Folded space grown into his omnitool at birth. Infinite. ${items.length ? 'Slightly less embarrassing than it was.' : 'Currently: a lab coat\'s worth of nothing.'}</p>
${items.map(([id, n]) => `<div class="row"><span>${esc(ITEMS[id]?.name || id)}</span><span>× ${n}</span><span class="sub">${esc(ITEMS[id]?.note || '')}</span></div>`).join('') || '<p class="note">Go and find something. Preferably edible.</p>'}
</section>`;
}
function renderJournal() {
    const entries = g.log.slice().reverse().slice(0, 60).map((e) => `<div class="entry"><time>${clockLabel(e.at)}</time>${esc(SCENES[e.scene]?.title || e.scene)}${e.lines.length ? `<div class="note">${e.lines.map((l) => dieHtml(l)).join('<br>')}</div>` : ''}</div>`).join('');
    view.innerHTML = `<section class="page"><h1>Journal</h1><p class="lede">${g.stats.checks} checks rolled, ${g.stats.wins} passed · ${g.stats.kills} things that wanted to eat you, didn't · ${g.stats.meals} meals.</p>${entries || '<p class="note">Nothing yet. Give it a minute.</p>'}</section>`;
}
function renderSaves() {
    const slot = (n) => {
        const raw = store.get(SLOT(n));
        let desc = 'Empty';
        if (raw) { try { const s = JSON.parse(raw); desc = `${SCENES[s.scene]?.title || s.scene} — ${clockLabel(s.minutes)}`; } catch { desc = 'Unreadable'; } }
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
    ({ story: renderStory, sheet: renderSheet, bag: renderBag, journal: renderJournal, saves: renderSaves })[tab]();
}
function setTab(t) { tab = t; render(); window.scrollTo({ top: 0 }); }

view.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    try {
        if (b.dataset.choice != null) {
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
            g = ensureBars(newGame(Math.floor(Math.random() * 2 ** 31)));
            lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.tabGo) {
            setTab(b.dataset.tabGo);
        } else if (b.dataset.save) {
            store.set(SLOT(b.dataset.save), serialize(g)); renderSaves(); note('Saved.');
        } else if (b.dataset.load) {
            g = deserialize(store.get(SLOT(b.dataset.load))); lastResult = null; combatLog = null; autosave(); setTab('story');
        } else if (b.dataset.export) {
            const blob = new Blob([serialize(g)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `bone-and-ash-${clockLabel(g.minutes).replace(/[^\w]+/g, '-')}.json`;
            a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        }
    } catch (err) {
        lastResult = { lines: [String(err.message || err)], fail: true }; render();
    }
});
view.addEventListener('change', async (ev) => {
    const inp = ev.target.closest('input[data-import]');
    if (!inp || !inp.files?.[0]) return;
    try { g = deserialize(await inp.files[0].text()); autosave(); lastResult = null; setTab('story'); }
    catch (err) { note(`That file isn't a Bone and Ash save (${err.message}).`); }
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
