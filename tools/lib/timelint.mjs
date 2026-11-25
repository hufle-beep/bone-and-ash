// v0.11.273 (owner pick P41-A, TL; roadmap-retune.md's tools line, research.md row 38): the times lint, log only. The game's
// choices with no time of their own take the default (js/core/story.js defaultMinutes: an action 30, a move 20, a talk 10).
// This sorts those choices by what their text does and sets each against Rules Engine C's times per activity, so a later
// balance push can see which defaults are far from the engine's. Nothing here changes a time: applying them is a balance
// change of its own (open, options later).

/** Rules Engine C's ACTIVITY_MINUTES (hufle-beep/Shared-ST st/rules-engine-c/lib/calendar.js, 37e7643, 2026-11-24), the kinds used here. */
export const ENGINE_MINUTES = Object.freeze({ talk: 10, conversation: 30, training: 60, study: 75, meal: 45, local: 10, wilderness: 75, journal: 20, rest: 20, meeting: 60, sleep: 480 });
export const ENGINE_SOURCE = 'hufle-beep/Shared-ST st/rules-engine-c/lib/calendar.js ACTIVITY_MINUTES (37e7643)';

/** What a choice's text does, by its words (first match wins); null when nothing matches. */
export const KINDS = [
    ['sleep', /\b(sleep|go to bed|turn in|bed down|lie down for the night)\b/i],
    ['meal', /\b(eat|meal|breakfast|supper|dinner|lunch|cook)\w*/i],
    ['training', /\b(train|spar|practi[cs]e|drill|kata)\w*/i],
    ['study', /\b(study|studies|read|learn)\w*/i],
    ['journal', /\b(write|journal|note it down)\w*/i],
    ['meeting', /\b(council|elders?|audience|petition)\b/i],
    ['rest', /\b(rest|wait|sit down|sit with|breathe)\b/i],
    ['talk', /^["“']|\b(ask|tell|say|talk|thank|answer|agree|reply|explain|promise|greet)\w*/i],
];
export const kindOf = (text) => (KINDS.find(([, re]) => re.test(text || '')) || [null])[0];

/** The engine's minutes for a choice: by its kind, else a move's travel (local 10 – wilderness 75: a range, not one number). */
export function engineFor(kind, cls) {
    if (kind) return { min: ENGINE_MINUTES[kind], max: ENGINE_MINUTES[kind], by: kind };
    if (cls === 'move') return { min: ENGINE_MINUTES.local, max: ENGINE_MINUTES.wilderness, by: 'travel' };
    return null;
}

/** v0.11.274 (owner pick P42-A, TL-r): the choices read off the engine's time and kept as they are, each with its reason (14; fo_spy:1, here from the P42-A review's M1 to v0.11.275, has its own time); a key
 *  is `scene:index` and the text's start, so a choice that moves or changes is linted again. (TL-a gave 19 talks their
 *  engine's 10 min; P41's count of 30 off was 34: 20 talks, 7 sleeps, 3 studies, 2 meetings, a meal, a training.) */
const SLEPT = 'the night is slept on a later screen (sleepUntil), so 480 min here would count it twice';
export const REVIEWED = Object.freeze({
    'evening:2': ['Thank her for dinner and sleep', SLEPT],
    'fo_last_night:2': ['Sleep.', SLEPT],
    'fo_last_night:6': ['Tonight, sleep.', SLEPT],
    'bl_fireside:4': ['Stay up with Mei Lin', SLEPT],
    'heart_camp:5': ['Sleep.', SLEPT],
    'rt_evening:7': ['Sleep by the stove with Yuki.', SLEPT],
    'heart_read:0': ['Climb down and sleep.', SLEPT],
    'hunt:2': ['Leave it.', 'a misread: walking away, not study'],
    'fo_spy:2': ['Leave him.', 'a misread: walking away, not study'],
    'rt_parley:0': ['Make your offer:', 'a misread: a parley\'s offer, not study'],
    'fo_envoy:2': ['Ask him, quietly,', 'a misread: a question at the envoy\'s visit, not a meeting of its own'],
    'rt_yk_talk:1': ['"The best spot is still yours.', 'a misread: a line to Yuki, not a meeting'],
    'ya_mocks:0': ['Side with Mei Lin.', 'a misread: a line at the meal, not the meal'],
    'rt_elder:3': ['Go with him.', 'a misread: going with the Elder, not training'],
    // v0.11.275 (owner pick P43-A, L1-h): fo_spy:1 (kept here at 30 since the P42-A review's M1) has its own time now, 80 (its hour and the walk home)
});
/** TL-r: the reviewed reason for a row, or null (the key and the text's start must both match). */
export const reviewedOf = (at, text) => { const r = REVIEWED[at]; return r && String(text || '').startsWith(r[0]) ? r[1] : null; };

/** A choice's text for the lint: a string as it is, a function drawn on an empty game (its plainest form), else ''. v0.11.274 (P42-A,
 *  TL-r): here, so the command and the tools test read the same texts (was tools/timelint.mjs's own). */
export const textOfChoice = (c) => (typeof c.text === 'string' ? c.text : typeof c.text === 'function' ? (() => { try { return String(c.text({ flags: {}, james: {}, yuki: {}, tasks: {}, stats: {} }) || ''); } catch { return ''; } })() : '');

/** Code that moves the clock itself (a night, a sleep, an advance): the choice's `do` or its target's `enter`. Not linted. */
export const CLOCKED = /\b(sleepUntil|nightRest|nightTo|advance)\(/;

/**
 * Every choice of `scenes` on the default time, with its class (act / move / talk), its kind and the engine's minutes.
 * `defaultMinutes(scenes, fromId, c, toId, moved)` and `textOf(c)` come from the caller (the game's own, or a test's).
 * Choices with a computed target (a function) can't be timed without a game: counted in `computed`, not linted.
 */
export function lintTimes(scenes, defaultMinutes, textOf) {
    const rows = [];
    const count = { choices: 0, own: 0, fights: 0, none: 0, computed: 0, clocked: 0, defaults: 0 };
    const CLS = { 30: 'act', 20: 'move', 10: 'talk' };
    for (const [id, s] of Object.entries(scenes)) {
        for (const [i, c] of (Array.isArray(s.choices) ? s.choices : []).entries()) {
            count.choices++;
            if (c.time != null) { count.own++; continue; }
            if (c.combat) { count.fights++; continue; }
            const to = typeof c.to === 'string' ? c.to : null;
            if (!to) { count.computed++; continue; }
            const moved = !!scenes[to]?.place && typeof scenes[to].place === 'string' && typeof s.place === 'string' && scenes[to].place !== s.place;
            const m = defaultMinutes(scenes, id, c, to, moved);
            if (!m) { count.none++; continue; }
            if (CLOCKED.test(String(c.do || '')) || CLOCKED.test(String(scenes[to]?.enter || ''))) { count.clocked++; continue; }
            count.defaults++;
            const text = textOf(c), kind = kindOf(text), cls = CLS[m] || String(m), eng = engineFor(kind, cls);
            const off = !eng ? null : m < eng.min ? eng.min - m : m > eng.max ? m - eng.max : 0;
            const at = `${id}:${i}`, reviewed = off ? reviewedOf(at, text) : null; // TL-r: kept as it is, with its reason
            rows.push({ at, text, minutes: m, cls, kind, engine: eng, off: reviewed ? 0 : off, reviewed });
        }
    }
    return { rows, count };
}

/** The log lines: the counts, the defaults by class, and by kind how many sit off the engine's time (and by how much in all). */
export function timeLintLines({ rows, count }, { list = false } = {}) {
    const out = [];
    out.push(`times lint (log only; the engine: ${ENGINE_SOURCE}): ${count.choices} choices: ${count.own} with their own time, ${count.fights} fights, ${count.none} timeless or ends, ${count.computed} with a computed target and ${count.clocked} whose code moves the clock itself (neither linted), ${count.defaults} on the default time`);
    const by = (k) => rows.filter((r) => r.cls === k).length;
    out.push(`  the defaults by class: act 30 min ${by('act')}, move 20 min ${by('move')}, talk 10 min ${by('talk')}`);
    const kinds = {};
    for (const r of rows) { const k = r.engine?.by || 'unsorted'; const e = kinds[k] || (kinds[k] = { n: 0, off: 0, minutes: 0, rev: 0 }); e.n++; if (r.off) { e.off++; e.minutes += r.off; } if (r.reviewed) e.rev++; }
    for (const [k, e] of Object.entries(kinds).sort((a, b) => b[1].n - a[1].n)) {
        const eng = k === 'travel' ? `${ENGINE_MINUTES.local}–${ENGINE_MINUTES.wilderness}` : k === 'unsorted' ? '—' : ENGINE_MINUTES[k];
        out.push(`  ${k} (engine ${eng} min): ${e.n} choices, ${e.off} off the engine's time${e.off ? ` (${e.minutes} min in all)` : ''}${e.rev ? `, ${e.rev} reviewed and kept` : ''}`);
    }
    if (list) for (const r of rows.filter((x) => x.off)) out.push(`    ${r.at} ${r.cls} ${r.minutes} → ${r.engine.by} ${r.engine.min === r.engine.max ? r.engine.min : `${r.engine.min}–${r.engine.max}`}: ${r.text.slice(0, 70)}`);
    return out;
}
