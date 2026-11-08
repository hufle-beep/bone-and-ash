/**
 * v0.11.68 (owner picks A1 + B2 + C1): a choice's or a card's lines, split in two.
 * - The reply (what is said or happens in answer) shows under the scene text, story choices and task cards alike.
 * - The gains (checks, XP, items, Fed, HP, Qi, Saturation, meridians, the clock) and the relationship changes go to Results.
 * B2: sorted by shape, sentence by sentence (one line can hold both: "Raw hare: +12 satiety. You will not be telling anyone
 * about this."). A sentence with a stat in it is a gain; every other sentence is reply. The few lines the shapes get wrong
 * are listed below by hand (GAIN_LINES, REPLY_LINES). tests/tasks.test.mjs sorts every line of a walk of random games and fails
 * on a sentence it can't place (a gain sentence with speech in it, a reply sentence with a stat in it).
 */

/** Whole lines that are gains whatever they say (system lines). */
export const GAIN_LINES = [
    /^Realm: /, // the breakthrough's summary: its second sentence lists what rose
    /^Coil \d+\. /, // the Coil screen's summary line
    /^(Prologue|Act 1) cleared in \d+ Coils?: /, // v0.11.72 (T1; the review's L3, R1): a new best is a Results line
    /^ {2}\S/, // a fight's indented damage lines
    /attacks: you defend \(/, // a fight's defence lines
    /^(Breakfast\. |Supper\. )?You eat: /, // eating: what and how much
    /^HP [\d.]+ → [\d.]+, Convergence /, // the breakthrough's bars ("… Both full.")
    /^Barley and bean stew, ladled by a woman who addresses you as "honoured guest"/, // a meal line with speech in it (ashfall)
    // the Opus review (R1): system lines the shapes put in the reply
    /^Two Qi and \d+ minutes into the ash around/, // a vessel sitting
    /^\S.* lunges at Yuki — /, // a fight's last round: the attack on Yuki
    /^The hammerspace is full/, // v0.11.69 (the Opus review, low 7): the bone stakes line moved to GAIN_BITS (it follows "+1 Giant's bone-meal.")
];
/** Whole lines that are reply whatever their shape (none yet: the shapes place every line the bots see). */
export const REPLY_LINES = [];

/** A sentence with one of these in it is a gain. */
const GAIN_BITS = [
    /(^|[\s(:,])[+−-]\d/, // +3 hares, −2 HP, +1 on this next time
    /\bXP\b/, /→ T\d+ L\d+/, /\bT\d+ L\d+ \(cap\)/, // skills
    / \/ DC -?[\d.]+/, // a check (shown only with Show checks)
    /\bsatiety\b/i, /\bSaturation\b/, /\bQi Max\b/, /\bQi regen\b/, /\bHP\b/, /\bQi full\b/, // the bars
    /\(\d+\/\d+\)/, /\([\d.]+ h of [\d.]+ h\.?\)/, /^Palisade: \d+\/\d+/, // meridians and work counts
    /^Meditated an hour/, /^Slept\b/, /^A few hours of sleep/, /^An hour of rest/, // the clock and rest
    /^Hammerspace: /, /^A thin haul/, /^Double haul/, /^Not enough Qi/,
    /— (success|failure|failed|partly|done|a double haul)\b/, // check results in words
    /×\d/, // Exhaustion: work takes ×1.5
    /^Yuki: (cat|great root-kin|human) form\b/, // her form's note
    /^\+ ?[A-Z']/, // an item without a count: "+Ya's wolf tooth.", "+ The watcher's ledger: …"
    /^The calendar starts again/, /^You stay until the Day \d+ dawn/, /few hours of sleep/, // the clock
    /\btakes \d+/, // fight damage
    /^Your bone stakes will be harder/, // v0.11.69: a gain sentence inside the bone-meal line
];

/** Sentences of a line, keeping each sentence's own punctuation and quotes. */
export function sentences(line) {
    const s = String(line);
    const out = [];
    let start = 0;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if ((ch === '.' || ch === '!' || ch === '?') && (s[i + 1] === ' ' || i === s.length - 1)) {
            // keep a closing quote, bracket or asterisk with its sentence
            let j = i + 1;
            out.push(s.slice(start, j).trim());
            start = j;
        } else if ((ch === '"' || ch === ')' || ch === '*') && /[.!?]/.test(s[i - 1] || '') && (s[i + 1] === ' ' || i === s.length - 1)) {
            out.push(s.slice(start, i + 1).trim());
            start = i + 1;
        }
    }
    if (start < s.length && s.slice(start).trim()) out.push(s.slice(start).trim());
    // a sentence split inside quotes would break the speech apart: glue pieces back while a quote is open
    const glued = [];
    for (const p of out) {
        const prev = glued[glued.length - 1];
        if (prev !== undefined && ((prev.match(/"/g) || []).length % 2 === 1)) glued[glued.length - 1] = `${prev} ${p}`;
        else glued.push(p);
    }
    return glued.filter(Boolean);
}

export const isGainSentence = (t) => GAIN_BITS.some((r) => r.test(t));

/** One line → { reply, gain } (either may be ''). */
export function splitLine(line) {
    const s = String(line);
    if (REPLY_LINES.some((r) => r.test(s))) return { reply: s, gain: '' };
    if (GAIN_LINES.some((r) => r.test(s))) return { reply: '', gain: s };
    const reply = [];
    const gain = [];
    for (const t of sentences(s)) (isGainSentence(t) && !/"/.test(t) ? gain : reply).push(t);
    return { reply: reply.join(' '), gain: gain.join(' ') };
}

/**
 * v0.11.69 (P1): a partial haul lists only what it keeps, so it drops the choice's item lines ("+2 Glassback hare …"); their
 * reply sentences stay ("Teamwork. Disgusting, bloody teamwork."). Used by js/core/story.js and js/core/tasks.js.
 */
export const keepReplies = (out) => (out || []).flatMap((l) => (/^\+\d/.test(l) ? [splitLine(l).reply].filter(Boolean) : [l]));

/** Lines → { reply: string[], gains: string[] }, each in its order. */
export function splitReply(lines) {
    const reply = [];
    const gains = [];
    for (const l of lines || []) {
        const r = splitLine(l);
        if (r.reply) reply.push(r.reply);
        if (r.gain) gains.push(r.gain);
    }
    return { reply, gains };
}

/**
 * One action's lines for the screen (js/main.js `land`): the reply under the scene text, the gains for Results, and the lines
 * its one-line summary reads (all of them, so Yuki's haul and a collapse still show there). No relationship lines when the
 * Coil itself changed (a rewind resets them: that is no loss the player caused; the Opus review, R1).
 */
export function landParts(lines, rel0, rel1, { coilChanged = false } = {}) {
    const sp = splitReply(lines);
    const rels = coilChanged ? [] : relLines(rel0, rel1);
    return { reply: sp.reply, gains: [...sp.gains, ...rels], sumLines: [...(lines || []).map(String), ...rels] };
}

/** C1: friendship and affection moved by one action, as Results lines ("Mei Lin: friendship +4, affection +2"). */
export function relLines(before, after) {
    const out = [];
    const keys = [...new Set([...Object.keys(before || {}), ...Object.keys(after || {})])];
    const sg = (d) => `${d > 0 ? '+' : '−'}${Math.round(Math.abs(d) * 10) / 10}`;
    for (const k of keys) {
        const f = (after?.[k]?.f || 0) - (before?.[k]?.f || 0);
        const a = (after?.[k]?.a || 0) - (before?.[k]?.a || 0);
        const parts = [];
        if (Math.abs(f) >= 0.05) parts.push(`friendship ${sg(f)}`);
        if (Math.abs(a) >= 0.05) parts.push(`affection ${sg(a)}`);
        if (parts.length) out.push(`${k}: ${parts.join(', ')}`);
    }
    return out;
}
