/**
 * Scene art, drawn in code, in ink wash: grey stone pillars and floating rocks in mist, sumi-e pines, ink spirals, one red accent.
 * Every scene key returns one SVG (viewBox 400×250). Seeded, so a scene always looks the same.
 */
const W = 400;
const H = 250;
const C = {
    ink: '#1b2421', ink2: '#24312c', moss: '#33433b', ash: '#8d8a80', paper: '#d9d4c7',
    bone: '#f2efe6', crimson: '#9e2b35', ember: '#d9673a', jade: '#6fa58f', dusk: '#4a3a4a', night: '#151c26', sky: '#2b2f3c',
};

function rng(seed) {
    let x = seed >>> 0 || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 10000) / 10000; };
}
const f = (n) => Math.round(n * 10) / 10;

/* ---- ink-wash helpers ---- */
const PAPER = [236, 232, 223];
const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const lum = (h) => { const [r, g, b] = hex2rgb(h); return (0.3 * r + 0.59 * g + 0.11 * b) / 255; };
/** Any colour → ink of the same weight, on warm paper. Reds stay red (the one accent); Yuki's eyes stay gold. */
function inkOf(h, grey = false) {
    const k = h.toLowerCase();
    if (k === '#e2c13a') return k;
    if (k === '#f1c26a') return '#f4eee2';
    const [r, g, b] = hex2rgb(k);
    if (!grey && r > g + 55 && r > b + 45) { const L = lum(k); return rgb2hex(110 + L * 110, 30 + L * 40, 34 + L * 40); }
    const L = Math.pow(lum(k), 0.85);
    const v = 26 + L * 222;
    return rgb2hex(v + 2, v, v - 4);
}
/** Lighten toward paper (0 = ink as is, 1 = paper). */
function wash(h, t, grey = false) { const [r, g, b] = hex2rgb(inkOf(h, grey)); return rgb2hex(r + (PAPER[0] - r) * t, g + (PAPER[1] - g) * t, b + (PAPER[2] - b) * t); }

function sky(top, bottom, id = 'sk') {
    const night = lum(top) < 0.16;
    const t = night ? 0.55 : 0.88;
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wash(top, t, true)}"/><stop offset="0.7" stop-color="${wash(bottom, Math.min(0.95, t + 0.06), true)}"/><stop offset="1" stop-color="${wash(bottom, t, true)}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>` + cloudWash(night);
}
function cloudWash(night) {
    const c = night ? '#9a968c' : '#ffffff';
    return `<g filter="url(#bl)" opacity="${night ? 0.25 : 0.55}"><ellipse cx="90" cy="60" rx="120" ry="22" fill="${c}"/><ellipse cx="320" cy="40" rx="110" ry="16" fill="${c}"/><ellipse cx="230" cy="110" rx="160" ry="18" fill="${c}"/></g>`;
}
function sun(x, y, r, color = C.crimson, glow = 0.35) {
    return `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${color}" opacity="${glow * 0.25}" filter="url(#bl)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.92"/>`;
}
function moon(x, y, r) {
    return `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="#f4efe4" opacity="0.18" filter="url(#bl)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f4efe4" opacity="0.95"/>`;
}
/** A stone pillar: grey wash body, dark ink on the shadow side, vertical strata. */
function pillar(x, base, w, h, tone, seed) {
    const r = rng(seed);
    const top = base - h;
    const lean = (r() - 0.5) * w * 0.4;
    const d = `M${f(x - w / 2)} ${base} C${f(x - w * 0.62)} ${f(base - h * 0.5)} ${f(x - w * 0.55 + lean)} ${f(top + w * 0.3)} ${f(x - w * 0.2 + lean)} ${f(top)} Q${f(x + lean)} ${f(top - w * 0.12)} ${f(x + w * 0.25 + lean)} ${f(top + 2)} C${f(x + w * 0.6 + lean)} ${f(top + w * 0.4)} ${f(x + w * 0.58)} ${f(base - h * 0.45)} ${f(x + w / 2)} ${base} Z`;
    let strata = '';
    for (let i = 0; i < 4 + w / 8; i++) {
        const sx = x - w * 0.35 + r() * w * 0.7 + lean * 0.5;
        const sy = top + h * (0.1 + r() * 0.35);
        strata += `<path d="M${f(sx)} ${f(sy)} q${f((r() - 0.5) * 4)} ${f(h * 0.18)} ${f((r() - 0.5) * 6)} ${f(h * (0.2 + r() * 0.35))}" stroke="${wash(tone, 0.05)}" stroke-width="${f(0.6 + r() * 1.2)}" opacity="0.55" fill="none" stroke-linecap="round"/>`;
    }
    return `<g><path d="${d}" fill="${wash(tone, 0.55)}"/><path d="M${f(x - w / 2)} ${base} C${f(x - w * 0.62)} ${f(base - h * 0.5)} ${f(x - w * 0.55 + lean)} ${f(top + w * 0.3)} ${f(x - w * 0.2 + lean)} ${f(top)} L${f(x - w * 0.05 + lean)} ${f(top + 4)} C${f(x - w * 0.35 + lean)} ${f(top + h * 0.3)} ${f(x - w * 0.3)} ${f(base - h * 0.3)} ${f(x - w * 0.15)} ${base} Z" fill="${wash(tone, 0.25)}" opacity="0.7"/>${strata}<path d="${d}" fill="none" stroke="${wash(tone, 0)}" stroke-width="1.3" opacity="0.8"/></g>`;
}
/** A floating rock (wide top, tapering underside), sometimes with a little pine. */
function floatRock(x, y, s, tone, seed, withPine) {
    const r = rng(seed);
    const k = (n) => f(n * s);
    const tip = 22 + r() * 16;
    const d = `M${k(-26)} ${k(-2)} Q${k(-27)} ${k(-11)} ${k(-14)} ${k(-13)} L${k(-2)} ${k(-15)} Q${k(14)} ${k(-15)} ${k(24)} ${k(-9)} Q${k(29)} ${k(-3)} ${k(23)} ${k(6)} Q${k(16)} ${k(14)} ${k(10)} ${k(tip * 0.7)} Q${k(5)} ${k(tip)} ${k(1)} ${k(tip)} Q${k(-6)} ${k(tip * 0.8)} ${k(-10)} ${k(14)} Q${k(-22)} ${k(8)} ${k(-26)} ${k(-2)} Z`;
    let strata = '';
    for (let i = 0; i < 5; i++) { const sx = -16 + i * 7 + r() * 3; strata += `<path d="M${k(sx)} ${k(-6 + r() * 4)} q${k(1)} ${k(8)} ${k(2 + r() * 2)} ${k(12 + r() * 10)}" stroke="${wash(tone, 0)}" stroke-width="${f(0.5 + r())}" opacity="0.5" fill="none" stroke-linecap="round"/>`; }
    return `<g transform="translate(${f(x)} ${f(y)})"><path d="${d}" fill="${wash(tone, 0.5)}"/><path d="M${k(-26)} ${k(-2)} Q${k(-22)} ${k(8)} ${k(-10)} ${k(14)} Q${k(-6)} ${k(tip * 0.8)} ${k(1)} ${k(tip)} Q${k(-4)} ${k(16)} ${k(-14)} ${k(4)} Z" fill="${wash(tone, 0.15)}" opacity="0.75"/><path d="M${k(-24)} ${k(-6)} Q${k(0)} ${k(-2)} ${k(25)} ${k(-6)}" stroke="${wash(tone, 0.2)}" stroke-width="0.8" fill="none" opacity="0.6"/>${strata}<path d="${d}" fill="none" stroke="${wash(tone, 0)}" stroke-width="1" opacity="0.8"/>${withPine ? pine(-6 * s, -13 * s, 22 * s, C.ink) : ''}</g>`;
}
/** Distant range: karst pillars in mist, with stones hanging in the air where the Qi pools. */
function mountains(seed, base, amp, color, opacity = 1) {
    const r = rng(seed);
    let s = '';
    for (let x = -10; x <= W + 10; x += 26 + r() * 34) {
        const w = 18 + r() * 26;
        s += pillar(x, base + 30, w, amp * (0.8 + r() * 1.2) + 30, color, seed * 31 + Math.round(x));
    }
    for (let i = 0; i < 3; i++) s += floatRock(40 + i * 120 + r() * 80, 28 + r() * Math.max(10, base - 100), 0.55 + r() * 0.55, color, seed * 7 + i, r() < 0.5);
    return `<g opacity="${opacity}">${s}</g><rect y="${base}" width="${W}" height="40" fill="#f4f1ea" opacity="0.6" filter="url(#bl)"/>`;
}
/** A sumi-e pine: crooked trunk, a few branches ending in clustered pads of needles. */
function pine(x, y, h, color) {
    const r = rng(Math.round(x * 13 + h * 7) + 1);
    const ink = inkOf(color);
    const lean = (r() - 0.5) * h * 0.45;
    const tw = h / 22 + 0.7;
    const mx = x - lean * 0.5 + (r() - 0.5) * h * 0.15;
    let out = `<path d="M${f(x - tw)} ${f(y)} Q${f(mx)} ${f(y - h * 0.55)} ${f(x + lean)} ${f(y - h)} Q${f(mx + tw * 1.4)} ${f(y - h * 0.55)} ${f(x + tw)} ${f(y)} Z" fill="${ink}"/>`;
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
        const t = 0.45 + r() * 0.5;
        const bx = x + lean * t * t;
        const by = y - h * t;
        const dir = i % 2 ? 1 : -1;
        const len = h * (0.18 + r() * 0.22) * (1.1 - t * 0.5);
        const ex = bx + dir * len;
        const ey = by - len * (0.1 + r() * 0.3);
        out += `<path d="M${f(bx)} ${f(by)} Q${f(bx + dir * len * 0.5)} ${f(by + len * 0.15)} ${f(ex)} ${f(ey)}" stroke="${ink}" stroke-width="${f(tw * 0.55)}" fill="none" stroke-linecap="round"/>`;
        out += pad(ex, ey, len * 0.9, ink, r);
    }
    return `<g>${out}${pad(x + lean, y - h, h * 0.2, ink, r)}</g>`;
}
function pad(x, y, w, ink, r) {
    let s = '';
    const k = 3 + Math.floor(r() * 3);
    for (let i = 0; i < k; i++) {
        const ox = (r() - 0.5) * w * 1.1;
        const oy = (r() - 0.5) * w * 0.25 - i * w * 0.04;
        const rw = w * (0.35 + r() * 0.3);
        s += `<ellipse cx="${f(x + ox)}" cy="${f(y + oy)}" rx="${f(rw)}" ry="${f(rw * (0.22 + r() * 0.12))}" fill="${ink}" opacity="${f(0.55 + r() * 0.35)}"/>`;
    }
    return s;
}
function deadTree(x, y, h, color, sw = 3) {
    const c = inkOf(color);
    return `<g stroke="${c}" stroke-width="${sw}" fill="none" stroke-linecap="round"><path d="M${x} ${y} Q${x - 3} ${y - h * 0.5} ${x + 2} ${y - h}"/><path d="M${x} ${y - h * 0.55} Q${x - h * 0.12} ${y - h * 0.62} ${x - h * 0.25} ${y - h * 0.8}"/><path d="M${x + 1} ${y - h * 0.7} Q${x + h * 0.12} ${y - h * 0.78} ${x + h * 0.22} ${y - h * 0.95}"/><path d="M${x} ${y - h * 0.35} L${x + h * 0.18} ${y - h * 0.5}" stroke-width="${sw * 0.6}"/></g>`;
}
function treeline(seed, baseY, count, minH, maxH, color0) {
    const r = rng(seed);
    const far = Math.max(0, Math.min(0.75, (228 - baseY) / 70));
    const color = wash(color0, far);
    count = Math.max(3, Math.round(count * 0.6));
    let s = '';
    for (let i = 0; i < count; i++) {
        const x = (i + r() * 0.8) * (W / count);
        const h = minH + r() * (maxH - minH);
        s += r() < 0.18 ? deadTree(x, baseY, h, color, 2 + h / 40) : pine(x, baseY + 2, h, color);
    }
    const id = `tl${seed}`;
    return `<g opacity="${f(1 - far * 0.35)}">` + s + `</g><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wash(color, 0.45)}" stop-opacity="0.1"/><stop offset="0.3" stop-color="${wash(color, 0.5)}"/><stop offset="1" stop-color="${wash(color, 0.35)}"/></linearGradient></defs><path d="M0 ${baseY - 4} Q${W * 0.3} ${baseY + 4} ${W * 0.6} ${baseY - 2} T${W} ${baseY} L${W} ${H} L0 ${H} Z" fill="url(#${id})"/>`;
}
function mist(y, opacity = 0.25) {
    return `<g filter="url(#bl)"><ellipse cx="200" cy="${y + 6}" rx="260" ry="12" fill="#f6f3ec" opacity="${Math.min(0.9, opacity * 3)}"/></g>`;
}
function ground(y, color) {
    const c = wash(color, 0.3);
    return `<path d="M0 ${y} Q${W * 0.3} ${y - 8} ${W * 0.55} ${y + 2} T${W} ${y - 4} L${W} ${H} L0 ${H} Z" fill="${c}"/><path d="M30 ${y + 22} q40 6 80 -2 M210 ${y + 30} q30 8 70 2 q20 -2 40 6 M120 ${y + 44} q50 4 90 -4" stroke="${wash(color, 0)}" stroke-width="1" opacity="0.45" fill="none"/>`;
}
/** Ink spirals: Qi made visible. */
function swirl(x, y, r, n = 3) {
    let s = '';
    for (let i = 0; i < n; i++) {
        const rr = r * (1 - i * 0.22);
        s += `<path d="M${f(x + rr)} ${y} A${f(rr)} ${f(rr * 0.92)} 0 1 0 ${f(x + rr * 0.2)} ${f(y - rr * 0.98)}" stroke="#2a2826" stroke-width="${f(1.4 - i * 0.3)}" fill="none" opacity="${0.75 - i * 0.15}" stroke-linecap="round"/>`;
    }
    return s;
}
/**
 * A standing figure in fine ink line, drawn in unit space (feet at 0, crown at about -60) and scaled.
 * style: 'james' (long coat, trousers, short hair), 'mei' (layered ruqun, sash, patterned skirt, bun and pin),
 * 'sect' (long robe, topknot crown, sword), 'plain' (villager's robe).
 */
function person(x, y, s = 1, { coat = C.paper, skin = '#c9a98a', hair = '#c9b27a', robe = false, sword = false, style } = {}) {
    const st = style || (robe ? 'sect' : 'plain');
    const L = '#2a2826';
    const w = (n) => f(n / Math.sqrt(Math.max(1, s * 1.2)) * 100) / 100;
    const fillC = st === 'sect' ? coat : wash(coat, st === 'james' ? 0.15 : 0.45);
    const inner = st === 'sect' ? '#e8e2d6' : wash(coat, 0.75);
    const hairC = inkOf(hair);
    const line = `stroke="${L}" stroke-width="${w(0.6)}" stroke-linejoin="round" stroke-linecap="round"`;
    const fold = `stroke="${L}" stroke-width="${w(0.4)}" fill="none" opacity="0.55" stroke-linecap="round"`;
    let body = '';
    if (st === 'james' || st === 'man') {
        body += `<path d="M-4.4 -13 L-4.2 -1 L-1.2 -1 L-0.6 -13 Z M4.4 -13 L4.2 -1 L1.2 -1 L0.6 -13 Z" fill="${wash('#4a4640', 0.2)}" ${line}/>`
            + `<path d="M-4.6 -0.2 Q-5 -1.4 -2.8 -1.4 L-0.9 -1.2 L-0.9 0 Z M4.6 -0.2 Q5 -1.4 2.8 -1.4 L0.9 -1.2 L0.9 0 Z" fill="${L}"/>`
            + `<path d="M-8 -41 C-9 -34 -9.6 -24 -10.2 -12 Q-5 -11 0 -11.6 Q5 -11 10.2 -12 C9.6 -24 9 -34 8 -41 Q0 -43.6 -8 -41 Z" fill="${fillC}" ${line}/>`
            + (st === 'james'
                ? `<path d="M-2.6 -42.2 L-0.2 -32 L-3.2 -38 Z M2.6 -42.2 L0.2 -32 L3.2 -38 Z" fill="${wash(coat, 0.05)}" ${line}/><path d="M0 -32 L0.4 -11.8" ${fold}/><path d="M-6 -22 L-3 -22 M3.2 -22 L6.2 -22" ${fold}/><path d="M-1.8 -42 L0 -38 L1.8 -42" fill="#f6f2ea" stroke="${L}" stroke-width="${w(0.35)}"/>`
                : `<path d="M-3.4 -42.6 L3.8 -30 M3.4 -42.6 L0.6 -38" stroke="${L}" stroke-width="${w(0.5)}" fill="none"/><path d="M-9.4 -28 L9.4 -28 L9.3 -25.6 L-9.3 -25.6 Z" fill="${L}"/><path d="M-5 -24 Q-6 -17 -7 -12.5 M5 -24 Q6 -17 7 -12.5" ${fold}/>`)
            + `<path d="M-7.8 -40.5 C-10.6 -34 -11.2 -27 -10.8 -20.5 L-8.4 -20.3 C-8.6 -26 -8 -31 -6.6 -35" fill="${fillC}" ${line}/><path d="M7.8 -40.5 C10.6 -34 11.2 -27 10.8 -20.5 L8.4 -20.3 C8.6 -26 8 -31 6.6 -35" fill="${fillC}" ${line}/>`
            + `<ellipse cx="-9.6" cy="-19.2" rx="1.3" ry="1.6" fill="${inkOf(skin)}" ${line}/><ellipse cx="9.6" cy="-19.2" rx="1.3" ry="1.6" fill="${inkOf(skin)}" ${line}/>`;
    } else {
        const skirtW = st === 'mei' ? 11.5 : 10.5;
        body += `<path d="M-5.6 -29 C-7 -20 -9.6 -9 -${skirtW} -0.2 Q0 1.4 ${skirtW} -0.2 C9.6 -9 7 -20 5.6 -29 Z" fill="${fillC}" ${line}/>`
            + `<path d="M-3 -28 Q-5 -14 -6.5 0 M0 -28 L0 0.6 M3 -28 Q5 -14 6.5 0 M-4.6 -28 Q-8 -12 -9.5 -0.4 M4.6 -28 Q8 -12 9.5 -0.4" ${fold}/>`;
        if (st === 'mei') { for (const [px, py] of [[-6, -6], [-2.5, -11], [3, -5], [6.5, -12], [-4.5, -18], [2, -17], [0, -3]]) body += `<g fill="none" stroke="${L}" stroke-width="0.3" opacity="0.6"><circle cx="${px}" cy="${py}" r="0.9"/><circle cx="${px}" cy="${py}" r="0.25" fill="${L}"/></g>`; }
        body += `<path d="M-7.6 -41 Q0 -43.4 7.6 -41 L6.2 -28.6 L-6.2 -28.6 Z" fill="${inner}" ${line}/>`
            + `<path d="M-3.4 -42.6 L3.6 -31.5 M3.4 -42.6 L0.6 -38" stroke="${L}" stroke-width="${w(0.5)}" fill="none"/>`
            + `<path d="M-6.3 -31.6 L6.3 -31.6 L6 -28.4 L-6 -28.4 Z" fill="${st === 'sect' ? '#2a2826' : wash(coat, 0)}" ${line}/>`
            + `<path d="M0.8 -28.4 Q1.4 -20 0.4 -12 M2 -28.4 Q3 -21 2.6 -15" stroke="${st === 'sect' ? '#2a2826' : wash(coat, 0)}" stroke-width="0.7" fill="none" stroke-linecap="round"/>`
            + `<path d="M-7.6 -41 C-11 -36 -13 -28 -14.2 -17.5 Q-12 -15.6 -8.4 -16.8 C-7.8 -24 -7.2 -30 -5.6 -34.5 Z" fill="${fillC}" ${line}/><path d="M7.6 -41 C11 -36 13 -28 14.2 -17.5 Q12 -15.6 8.4 -16.8 C7.8 -24 7.2 -30 5.6 -34.5 Z" fill="${fillC}" ${line}/>`
            + `<path d="M-11 -34 Q-12 -26 -12.4 -19 M11 -34 Q12 -26 12.4 -19" ${fold}/>`
            + `<ellipse cx="-10" cy="-17.4" rx="1.1" ry="1.4" fill="${inkOf(skin)}" ${line}/><ellipse cx="10" cy="-17.4" rx="1.1" ry="1.4" fill="${inkOf(skin)}" ${line}/>`;
    }
    const sk = inkOf(skin);
    const head = `<path d="M-1.6 -45 L-1.6 -41.6 Q0 -40.6 1.6 -41.6 L1.6 -45 Z" fill="${sk}" ${line}/>`
        + `<path d="M-4.4 -51.5 C-4.4 -55.6 -2.4 -57.2 0 -57.2 C2.4 -57.2 4.4 -55.6 4.4 -51.5 C4.4 -47.6 2.4 -44.4 0 -44.2 C-2.4 -44.4 -4.4 -47.6 -4.4 -51.5 Z" fill="${sk}" ${line}/>`;
    const lip = st === 'mei' ? '#a8443f' : '#6a5a55';
    const face = `<path d="M-2.95 -51 Q-1.8 -52.2 -0.65 -51.1 M0.65 -51.1 Q1.8 -52.2 2.95 -51" stroke="${L}" stroke-width="${w(0.5)}" fill="none" stroke-linecap="round"/>`
        + `<path d="M-2.7 -50.85 Q-1.8 -50.3 -0.9 -50.95 M0.9 -50.95 Q1.8 -50.3 2.7 -50.85" stroke="${L}" stroke-width="${w(0.22)}" fill="none" opacity="0.5"/>`
        + `<circle cx="-1.78" cy="-51.05" r="0.48" fill="${L}"/><circle cx="1.78" cy="-51.05" r="0.48" fill="${L}"/><circle cx="-1.62" cy="-51.2" r="0.13" fill="#f6f2ea"/><circle cx="1.94" cy="-51.2" r="0.13" fill="#f6f2ea"/>`
        + (st === 'mei' ? `<path d="M-2.95 -51 L-3.4 -51.5 M2.95 -51 L3.4 -51.5" stroke="${L}" stroke-width="${w(0.25)}"/>` : '')
        + `<path d="M-3.1 -52.9 Q-2 -53.6 -0.7 -53.1 M0.7 -53.1 Q2 -53.6 3.1 -52.9" stroke="${L}" stroke-width="${w(st === 'mei' ? 0.3 : 0.45)}" fill="none" stroke-linecap="round"/>`
        + `<path d="M0.15 -50.6 Q0.5 -49.4 0.25 -48.8 M-0.5 -48.7 Q0 -48.4 0.5 -48.7" stroke="${L}" stroke-width="${w(0.22)}" fill="none" opacity="0.7"/>`
        + `<path d="M-1.1 -47.15 Q-0.5 -47.45 0 -47.2 Q0.5 -47.45 1.1 -47.15" stroke="${lip}" stroke-width="${w(0.35)}" fill="none" stroke-linecap="round"/><path d="M-0.7 -46.95 Q0 -46.4 0.7 -46.95" stroke="${lip}" stroke-width="${w(st === 'mei' ? 0.45 : 0.2)}" fill="none" opacity="${st === 'mei' ? 0.9 : 0.5}"/>`
        + (st === 'mei' ? '' : `<path d="M-4.35 -51.6 Q-5.1 -50.6 -4.3 -49.2 M4.35 -51.6 Q5.1 -50.6 4.3 -49.2" fill="${sk}" stroke="${L}" stroke-width="${w(0.4)}"/>`)
        + `<path d="M-3.2 -48.6 Q-1.6 -44.8 0 -44.4" stroke="${L}" stroke-width="${w(0.2)}" fill="none" opacity="0.3"/>`;
    let hairS = '';
    if (st === 'james') {
        hairS = `<path d="M-4.7 -50.5 C-5.4 -56 -2.6 -58.6 0.4 -58.4 C3.6 -58.4 5.4 -56 4.7 -50.6 C4.2 -53 3.4 -54.2 2.2 -54.6 C1.4 -53.4 -0.4 -53.2 -1.4 -54 C-2 -53 -3.4 -52.6 -4.7 -50.5 Z" fill="${hairC}" ${line}/><path d="M-2.6 -57.6 Q-1 -56 -0.6 -54.4 M1.2 -58 Q2.6 -56.4 2.6 -55" ${fold}/>`;
    } else if (st === 'mei') {
        hairS = `<ellipse cx="0" cy="-60" rx="3" ry="2.3" fill="${hairC}" ${line}/><path d="M-5 -60.6 L5.4 -59.2" stroke="${L}" stroke-width="0.5" stroke-linecap="round"/><circle cx="5.6" cy="-59.2" r="0.8" fill="#a02c2c"/>`
            + `<path d="M0 -57.6 C-3.2 -57.8 -5 -55.6 -5 -51.6 C-5 -47 -5.6 -43.6 -6.4 -40.4 L-4.6 -41.4 C-4.4 -45 -4.2 -48.6 -4 -51.4 C-3.4 -54.2 -1.6 -55.6 0 -55.8 C1.6 -55.6 3.4 -54.2 4 -51.4 C4.2 -48.6 4.4 -45 4.6 -41.4 L6.4 -40.4 C5.6 -43.6 5 -47 5 -51.6 C5 -55.6 3.2 -57.8 0 -57.6 Z" fill="${hairC}" ${line}/>`
            + `<path d="M-0.4 -57.4 Q-3 -55.6 -4.4 -50 Q-4.8 -46 -5.6 -41.6 M0.4 -57.4 Q3 -55.6 4.4 -50 Q4.8 -46 5.6 -41.6 M-1.6 -57 Q-3.6 -54 -4.6 -47 M1.6 -57 Q3.6 -54 4.6 -47" stroke="#8a857c" stroke-width="${w(0.2)}" fill="none" opacity="0.7"/><path d="M-0.2 -57.6 L0 -55.8" stroke="${sk}" stroke-width="${w(0.4)}"/>`;
    } else if (st === 'sect' || st === 'man') {
        hairS = `<path d="M-4.6 -51 C-5 -55.8 -2.6 -57.8 0 -57.8 C2.6 -57.8 5 -55.8 4.6 -51 C4 -54 2.4 -55.6 0 -55.8 C-2.4 -55.6 -4 -54 -4.6 -51 Z" fill="${hairC}" ${line}/><rect x="-1.6" y="-61.4" width="3.2" height="3.6" rx="0.6" fill="${hairC}" ${line}/><path d="M-2.4 -60 L2.4 -60" stroke="#a02c2c" stroke-width="0.9"/><path d="M-4 -61 L4 -60" stroke="${L}" stroke-width="0.4"/>`;
    } else {
        hairS = `<path d="M-4.6 -51 C-5 -55.8 -2.6 -57.8 0 -57.8 C2.6 -57.8 5 -55.8 4.6 -51 C4 -54 2.4 -55.6 0 -55.8 C-2.4 -55.6 -4 -54 -4.6 -51 Z" fill="${hairC}" ${line}/><ellipse cx="0" cy="-59" rx="2" ry="1.6" fill="${hairC}" ${line}/>`;
    }
    const swordS = sword ? `<path d="M-9 -52 L9 -16" stroke="${L}" stroke-width="1.1" stroke-linecap="round"/><path d="M-6.8 -47.4 L-4.8 -48.6" stroke="${L}" stroke-width="1.6"/>` : '';
    return `<g transform="translate(${x} ${y}) scale(${f(s * 1.2)})">${swordS}${body}${head}${face}${hairS}</g>`;
}
/** Yuki: a small white cat, sitting, drawn in fine ink. */
function cat(x, y, s = 1, color = C.bone) {
    const L = '#2a2826';
    const w = (n) => f(n / Math.sqrt(Math.max(1, s)) * 100) / 100;
    const c = inkOf(color);
    const sh = wash('#8d8a80', 0.45);
    const line = `stroke="${L}" stroke-width="${w(0.6)}" stroke-linejoin="round" stroke-linecap="round"`;
    return `<g transform="translate(${x} ${y}) scale(${f(s * 0.95)})">`
        + `<path d="M-10 -1.6 C-15.5 -0.6 -16.4 2.6 -12 2.8 C-6 3.2 1 2.6 7 1.2" stroke="${L}" stroke-width="${f(2.1 + 1.1 / Math.sqrt(Math.max(1, s)))}" fill="none" stroke-linecap="round"/><path d="M-10 -1.6 C-15.5 -0.6 -16.4 2.6 -12 2.8 C-6 3.2 1 2.6 7 1.2" stroke="${c}" stroke-width="2.1" fill="none" stroke-linecap="round"/>`
        + `<path d="M-1.4 -17.2 C-8.6 -15.6 -12.4 -8.4 -11.4 -3 C-11 -0.4 -8.4 0.4 -4.4 0 L5.6 0 C7.2 -0.2 7.6 -1.4 6.8 -2.2 L6.2 -10.4 C6.6 -13.6 5.2 -16.2 3 -17.4 Z" fill="${c}" ${line}/>`
        + `<path d="M-9.6 -2.4 C-8.4 -7.6 -3.6 -9.4 -1 -5" stroke="${L}" stroke-width="${w(0.35)}" fill="none" opacity="0.6"/><ellipse cx="-6" cy="-3" rx="4.6" ry="2.4" fill="${sh}" opacity="0.35"/><path d="M5.6 -13.6 l0.9 0.8 l-0.6 0.4 l0.9 0.9 M5.2 -11 l0.8 0.6" stroke="${L}" stroke-width="${w(0.3)}" fill="none" opacity="0.6"/>`
        + `<path d="M3.4 -0.6 L3.8 -9.6 M1.4 0 Q2.6 -0.8 3.8 0" stroke="${L}" stroke-width="${w(0.45)}" fill="none"/>`
        + `<path d="M-0.2 -21.6 L0.3 -28.8 L4 -25.6 Z M6.2 -25.8 L9.6 -28.8 L9.6 -21.4 Z" fill="${c}" ${line}/><path d="M1 -26.6 L1.4 -23.6 M8.6 -26.8 L8.4 -23.6" stroke="#b9a7a2" stroke-width="${w(0.9)}" stroke-linecap="round"/>`
        + `<path d="M-0.6 -21 C-0.8 -24.6 1.8 -26.6 4.7 -26.4 C7.8 -26.4 10.2 -24.4 10 -21 C9.8 -17.8 7.6 -16.2 4.7 -16.2 C1.6 -16.2 -0.4 -17.8 -0.6 -21 Z" fill="${c}" ${line}/>`
        + `<path d="M1.8 -21.8 Q2.9 -23 4 -21.8 Q2.9 -20.9 1.8 -21.8 Z M5.6 -21.8 Q6.7 -23 7.8 -21.8 Q6.7 -20.9 5.6 -21.8 Z" fill="#e2c13a" stroke="${L}" stroke-width="${w(0.35)}"/><path d="M2.9 -22.6 L2.9 -21.1 M6.7 -22.6 L6.7 -21.1" stroke="${L}" stroke-width="${w(0.5)}"/>`
        + `<path d="M4.3 -19.6 L5.3 -19.6 L4.8 -19 Z" fill="#b9a7a2"/><path d="M4.8 -19 L4.8 -18.4 M4.8 -18.4 Q4.2 -17.8 3.6 -18.2 M4.8 -18.4 Q5.4 -17.8 6 -18.2" stroke="${L}" stroke-width="${w(0.3)}" fill="none"/>`
        + `<path d="M3.4 -18.8 L-2.6 -19.6 M3.4 -18.4 L-2.4 -17.6 M6.2 -18.8 L12.2 -19.8 M6.2 -18.4 L12 -17.4" stroke="${L}" stroke-width="${w(0.18)}" opacity="0.6"/>`
        + (s > 2 ? `<path d="M6 -6 l0.6 -1.2 M6.2 -8 l0.5 -1 M-10.6 -6 l-0.8 -0.6 M-9.8 -9 l-0.8 -0.4 M-4 -15.6 l-0.4 -0.9 M-7 -13.6 l-0.6 -0.8" stroke="${L}" stroke-width="${w(0.25)}" opacity="0.5"/>` : '')
        + `</g>`;
}
function beast(x, y, s0 = 1, color = C.ash, eye = C.ember) {
    const s = Math.abs(s0);
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})${s0 < 0 ? ' scale(-1 1)' : ''}"><path d="M${k(-22)} ${k(-12)} Q${k(-10)} ${k(-24)} ${k(10)} ${k(-20)} L${k(22)} ${k(-26)} L${k(30)} ${k(-20)} L${k(26)} ${k(-14)} L${k(16)} ${k(-12)} L${k(14)} 0 L${k(10)} 0 L${k(8)} ${k(-8)} L${k(-12)} ${k(-8)} L${k(-14)} 0 L${k(-18)} 0 L${k(-18)} ${k(-8)} Q${k(-30)} ${k(-10)} ${k(-34)} ${k(-20)} Q${k(-26)} ${k(-14)} ${k(-22)} ${k(-12)} Z" fill="${color}"/><circle cx="${k(24)}" cy="${k(-21)}" r="${k(1.5)}" fill="${eye}"/></g>`;
}
function boarShape(x, y, s = 1) {
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})"><path d="M${k(-40)} ${k(-10)} Q${k(-38)} ${k(-42)} ${k(0)} ${k(-44)} Q${k(30)} ${k(-44)} ${k(42)} ${k(-26)} L${k(52)} ${k(-20)} L${k(44)} ${k(-10)} L${k(30)} ${k(-8)} L${k(28)} 0 L${k(18)} 0 L${k(16)} ${k(-8)} L${k(-20)} ${k(-8)} L${k(-22)} 0 L${k(-32)} 0 Z" fill="#5a574c"/><path d="M${k(-30)} ${k(-36)} L${k(-20)} ${k(-48)} L${k(-10)} ${k(-40)} L${k(0)} ${k(-50)} L${k(10)} ${k(-42)} L${k(20)} ${k(-48)} L${k(28)} ${k(-38)}" stroke="${C.ash}" stroke-width="${k(2)}" fill="none"/><path d="M${k(46)} ${k(-14)} Q${k(56)} ${k(-24)} ${k(52)} ${k(-34)}" stroke="${C.bone}" stroke-width="${k(3)}" fill="none" stroke-linecap="round"/><circle cx="${k(38)}" cy="${k(-28)}" r="${k(2)}" fill="${C.ember}"/></g>`;
}
function hut(x, y, w, color, roof = C.ink2, lit = false) {
    const h = w * 0.55;
    return `<g><rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${color}"/><path d="M${x - w * 0.7} ${y - h} Q${x} ${y - h - w * 0.55} ${x + w * 0.7} ${y - h} Q${x} ${y - h - w * 0.25} ${x - w * 0.7} ${y - h} Z" fill="${roof}"/>${lit ? `<rect x="${x - w * 0.12}" y="${y - h * 0.65}" width="${w * 0.24}" height="${h * 0.3}" fill="${C.ember}" opacity="0.85"/>` : ''}</g>`;
}
function fire(x, y, s = 1) {
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})"><circle r="${k(55)}" fill="#fffaf0" opacity="0.5" filter="url(#bl)"/><path d="M${k(-10)} 0 Q${k(-12)} ${k(-14)} 0 ${k(-30)} Q${k(4)} ${k(-16)} ${k(10)} ${k(-20)} Q${k(14)} ${k(-8)} ${k(10)} 0 Z" fill="${C.ember}"/><path d="M${k(-4)} 0 Q${k(-4)} ${k(-10)} ${k(2)} ${k(-18)} Q${k(6)} ${k(-8)} ${k(5)} 0 Z" fill="#f1c26a"/><path d="M${k(-16)} ${k(3)} L${k(16)} ${k(-1)} M${k(-14)} ${k(-1)} L${k(14)} ${k(4)}" stroke="${C.ink}" stroke-width="${k(3)}"/></g>`;
}
function shards(seed, cx, cy, n, spread, color = C.bone) {
    const r = rng(seed);
    let s = '';
    for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = spread * (0.3 + r() * 0.7);
        const x = cx + Math.cos(a) * d;
        const y = cy + Math.sin(a) * d * 0.5;
        const len = 6 + r() * 10;
        s += `<path d="M${f(x)} ${f(y)} L${f(x + Math.cos(a) * len)} ${f(y + Math.sin(a) * len * 0.5)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
    return s;
}
function lotus(x, y, s = 1, color = C.crimson) {
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})" fill="${color}"><path d="M0 0 Q${k(-6)} ${k(-12)} 0 ${k(-20)} Q${k(6)} ${k(-12)} 0 0 Z"/><path d="M0 0 Q${k(-16)} ${k(-6)} ${k(-14)} ${k(-16)} Q${k(-4)} ${k(-12)} 0 0 Z"/><path d="M0 0 Q${k(16)} ${k(-6)} ${k(14)} ${k(-16)} Q${k(4)} ${k(-12)} 0 0 Z"/></g>`;
}
const FILTERS = '<defs><filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter><filter id="bl" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="7"/></filter><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.15  0 0 0 0 0.13  0 0 0 0.14 0"/></filter><radialGradient id="vg" cx="0.5" cy="0.48" r="0.72"><stop offset="0.62" stop-color="#ece8df" stop-opacity="0"/><stop offset="1" stop-color="#ece8df" stop-opacity="0.85"/></radialGradient></defs>';
const grain = '<rect width="400" height="250" filter="url(#gr)"/>';
const vignette = '<rect width="400" height="250" fill="url(#vg)"/>';

const JAMES = { coat: C.bone, hair: '#c9b27a', style: 'james' };
const MEI = { coat: '#8a7a6a', hair: C.ink, skin: '#c99f7f', style: 'mei' };
const SECT = { coat: C.crimson, hair: C.ink, skin: '#c9a184', robe: true, style: 'sect' };

const SCENES = {
    forest_dawn: () => sky('#3b2c38', '#9c5a4a') + sun(300, 95, 18) + mountains(3, 140, 60, C.dusk, 0.8) + mist(128, 0.18) + treeline(7, 175, 14, 60, 120, C.moss) + mist(170, 0.12) + treeline(11, 215, 10, 70, 150, C.ink) + cat(170, 232, 1.1) + person(200, 236, 1, JAMES),
    yuki_close: () => sky('#2a3330', '#46544c') + `<circle cx="200" cy="140" r="110" fill="${C.jade}" opacity="0.10"/>` + cat(205, 205, 5.2) + shards(4, 200, 140, 10, 150, C.ash) + swirl(70, 70, 34) + swirl(335, 180, 26),
    omnitool: () => sky('#1e2a2a', '#2f3d38') + treeline(5, 230, 9, 80, 170, C.ink) + `<g transform="translate(200 128)"><rect x="-120" y="-70" width="240" height="140" rx="14" fill="${C.jade}" opacity="0.10" stroke="${C.jade}" stroke-opacity="0.6"/><path d="M-100 30 Q-60 -40 -20 10 T60 -10 T100 -40" stroke="${C.jade}" stroke-width="2.5" fill="none"/><circle cx="-60" cy="-35" r="3" fill="${C.ember}"/><circle cx="-10" cy="-30" r="3" fill="${C.ember}"/><circle cx="40" cy="-45" r="3" fill="${C.ember}"/><circle cx="85" cy="20" r="3" fill="${C.ember}"/><path d="M-100 52 L100 52" stroke="${C.jade}" stroke-opacity="0.5"/></g>`,
    clearing: () => sky('#4a3f48', '#9d7b66') + sun(80, 70, 12, C.crimson, 0.25) + floatRock(250, 60, 1.1, C.ash, 5, true) + floatRock(340, 100, 0.6, C.ash, 6, false) + treeline(13, 190, 16, 50, 110, C.moss) + ground(195, '#5d6056') + `<g fill="${C.ash}"><ellipse cx="120" cy="215" rx="22" ry="9"/><ellipse cx="300" cy="225" rx="30" ry="11"/><ellipse cx="250" cy="206" rx="12" ry="6"/></g>` + person(205, 228, 0.9, JAMES) + cat(225, 230, 0.8),
    bone_needle: () => sky('#26302c', '#3a4741') + `<g transform="translate(200 150)"><path d="M-90 60 Q-40 10 0 0 Q30 -6 60 -20" stroke="#c9a98a" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M10 -14 L150 -78" stroke="${C.bone}" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="-78" r="18" fill="${C.bone}" opacity="0.15"/></g>` + shards(9, 300, 80, 10, 40),
    meditation: () => sky('#1f2a33', '#3c4950') + `<circle cx="200" cy="140" r="90" fill="${C.jade}" opacity="0.12"/><circle cx="200" cy="140" r="60" fill="${C.jade}" opacity="0.12"/>` + mountains(21, 200, 40, C.ink2) + `<g transform="translate(200 205)"><path d="M-40 0 Q-30 -20 0 -18 Q30 -20 40 0 Z" fill="${C.bone}"/><path d="M-14 -18 L-16 -52 Q0 -60 16 -52 L14 -18 Z" fill="${C.bone}"/><circle cy="-62" r="8" fill="#c9a98a"/></g>` + shards(31, 200, 120, 24, 120, C.ink) + swirl(110, 90, 40) + swirl(300, 70, 28) + swirl(200, 150, 70, 2),
    stream: () => sky('#3c3a46', '#8a6f63') + mountains(17, 120, 40, C.dusk, 0.7) + treeline(19, 160, 14, 50, 100, C.moss) + `<path d="M150 160 Q120 190 190 205 T150 250 L250 250 Q210 220 260 200 T230 160 Z" fill="#2d3c44"/><path d="M175 175 Q160 190 200 200" stroke="${C.paper}" stroke-opacity="0.4" fill="none"/>` + treeline(23, 230, 6, 60, 130, C.ink) + cat(300, 238, 0.9),
    forage: () => sky('#384236', '#6f7a5e') + treeline(27, 200, 10, 80, 140, C.moss) + ground(205, C.ink2) + `<path d="M60 215 L200 205" stroke="#5a4a3a" stroke-width="14" stroke-linecap="round"/>` + `<g fill="#c8d6b9"><path d="M90 207 Q105 196 120 207 Z"/><path d="M128 205 Q146 192 162 205 Z"/><path d="M168 204 Q180 196 192 204 Z"/></g>` + `<g fill="${C.crimson}">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${290 + (i % 4) * 9}" cy="${190 + Math.floor(i / 4) * 10}" r="4"/>`).join('')}</g><path d="M280 220 L300 180 L320 220 M300 200 L330 180" stroke="${C.moss}" stroke-width="3" fill="none"/>` + person(240, 232, 0.8, JAMES),
    hunt: () => sky('#433e3a', '#7d6b55') + treeline(29, 175, 12, 40, 90, C.moss) + `<g stroke="#6b7a55" stroke-width="2">${Array.from({ length: 40 }, (_, i) => `<path d="M${i * 10} 250 L${i * 10 + 4} ${200 - (i % 5) * 6}"/>`).join('')}</g>` + `<g transform="translate(250 212)"><ellipse rx="16" ry="9" fill="${C.ash}"/><path d="M-12 -6 L-6 -14 L0 -7 L6 -15 L12 -6" fill="${C.jade}" opacity="0.8"/><path d="M14 -4 L18 -18 M18 -4 L23 -16" stroke="${C.ash}" stroke-width="3"/></g>` + cat(120, 236, 1.2) + `<path d="M60 120 L230 205" stroke="${C.bone}" stroke-width="2" stroke-dasharray="4 6"/>`,
    camp: () => sky('#24203a', '#6a3f4c') + mountains(33, 150, 50, '#2e2a3d') + treeline(35, 190, 12, 60, 120, C.ink2) + ground(210, C.ink) + fire(200, 222, 1) + person(160, 228, 0.85, JAMES) + cat(240, 230, 0.8) + `<g stroke="${C.bone}" stroke-width="2.5" stroke-linecap="round">${[60, 100, 300, 340].map((x) => `<path d="M${x} 236 L${x + (x < 200 ? -8 : 8)} 214"/>`).join('')}</g>`,
    forest_night: () => sky(C.night, '#1f2a35') + moon(320, 60, 14) + treeline(37, 190, 14, 70, 140, '#1a232a') + treeline(41, 230, 9, 80, 170, '#10161b') + fire(200, 236, 0.6),
    jackals: () => sky(C.night, '#251e2a') + treeline(43, 200, 12, 70, 140, '#141b20') + ground(215, '#10161b') + beast(90, 228, 1.4) + beast(320, 232, -1.4) + fire(200, 232, 0.55) + person(200, 234, 0.85, JAMES) + cat(226, 236, 0.7),
    jackals_dead: () => sky('#1b2128', '#3b2d33') + ground(205, '#141b20') + `<g transform="translate(140 222) rotate(160)">${beast(0, 0, 1.3, '#5b5a55', '#333')}</g>` + `<g transform="translate(280 228) rotate(190)">${beast(0, 0, 1.2, '#5b5a55', '#333')}</g>` + shards(47, 200, 214, 16, 110) + cat(210, 236, 0.9),
    herb_girl: () => sky('#4c4040', '#a77a5c') + sun(330, 60, 14) + mountains(51, 140, 40, C.dusk, 0.6) + ground(200, '#4f5a46') + `<path d="M40 200 Q80 150 130 200 Z" fill="#6a6a60"/>` + person(90, 228, 0.9, MEI) + person(220, 230, 1, SECT) + person(270, 232, 1.15, { coat: '#4a3a32', hair: C.ink, skin: '#b88d6c', style: 'man' }) + `<g fill="${C.jade}" opacity="0.8">${[0, 1, 2, 3].map((i) => `<path d="M${120 + i * 8} 232 Q${123 + i * 8} 222 ${126 + i * 8} 232 Z"/>`).join('')}</g>`,
    gao_down: () => sky('#4c4040', '#a77a5c') + ground(195, '#4f5a46') + `<g transform="translate(230 222) rotate(-90)">${person(0, 0, 0.9, SECT)}</g>` + `<path d="M232 200 L240 240" stroke="${C.bone}" stroke-width="3"/>` + person(140, 228, 1, JAMES) + cat(166, 230, 0.8) + person(80, 228, 0.9, MEI),
    mei_lin: () => sky('#56483e', '#c48e66') + floatRock(70, 60, 1.2, C.ash, 81, true) + floatRock(340, 40, 0.8, C.ash, 82, false) + person(200, 395, 5.2, MEI) + `<g fill="${C.jade}" opacity="0.85"><path d="M330 250 Q335 205 345 190 Q342 215 348 250 Z"/><path d="M348 250 Q355 215 370 205 Q360 228 362 250 Z"/></g>`,
    ridge: () => sky('#2b2436', '#b0624a') + sun(70, 120, 16, C.ember, 0.3) + mountains(53, 160, 70, '#3c3048', 0.8) + `<g transform="translate(270 168)"><path d="M-18 0 L-10 -120 L-26 -150 M-10 -120 L10 -160 L4 -190 M10 -160 L30 -175 M-6 -60 L-40 -90 M2 -80 L36 -110" stroke="#2a2230" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-30 0 L-14 -40 L14 -40 L30 0 Z" fill="#2a2230"/><circle cx="0" cy="-90" r="70" fill="${C.jade}" opacity="0.08"/></g>` + treeline(57, 190, 18, 25, 55, C.ink2) + ground(225, C.ink) + person(110, 238, 0.8, JAMES) + cat(128, 226, 0.6),
    village: () => sky('#4a4248', '#9a8270') + mountains(61, 130, 40, C.dusk, 0.6) + treeline(63, 165, 16, 30, 70, C.moss) + ground(195, '#5a5650') + hut(80, 205, 60, '#6d6a62', C.ink2, true) + hut(170, 200, 50, '#77736a', C.ink2) + hut(330, 208, 66, '#6d6a62', C.ink2, true) + `<path d="M250 205 L250 120" stroke="#3a2a22" stroke-width="5"/><path d="M250 125 L285 128 L282 165 L250 160 Z M250 168 L280 170 L278 200 L250 196 Z" fill="${C.crimson}"/>` + lotus(266, 152, 0.5, '#e8c8b8') + person(210, 236, 0.75, JAMES) + cat(226, 238, 0.55),
    elder: () => sky('#2a2420', '#4d3d30') + `<rect x="0" y="170" width="400" height="80" fill="#3a2e24"/><circle cx="200" cy="120" r="110" fill="${C.ember}" opacity="0.07"/>` + `<g transform="translate(260 225)"><path d="M-40 0 Q-36 -50 0 -56 Q36 -50 40 0 Z" fill="#5a5048"/><circle cx="0" cy="-70" r="16" fill="#b8916f"/><path d="M-14 -62 Q0 -40 14 -62 Q8 -50 0 -48 Q-8 -50 -14 -62 Z" fill="${C.paper}"/></g>` + `<rect x="150" y="200" width="70" height="8" fill="#2a2018"/><path d="M175 200 Q175 188 183 188 L188 188 Q195 188 195 200 Z" fill="${C.jade}" opacity="0.8"/><path d="M182 184 Q180 176 186 170" stroke="${C.paper}" stroke-opacity="0.4" fill="none"/>` + person(110, 236, 0.9, JAMES),
    healer: () => sky('#2a2622', '#4a3e34') + `<rect y="190" width="400" height="60" fill="#3a3028"/>` + `<g transform="translate(220 205)"><rect x="-70" y="0" width="140" height="18" fill="#5a4a3a"/><ellipse cx="-10" cy="-4" rx="50" ry="10" fill="#c9a98a"/><circle cx="-56" cy="-8" r="10" fill="#c9a98a"/></g>` + person(140, 232, 0.9, JAMES) + `<path d="M180 190 L196 200" stroke="${C.bone}" stroke-width="2"/>` + `<g fill="#c8d6b9"><path d="M260 185 Q272 176 284 185 Z"/></g>` + `<circle cx="220" cy="190" r="70" fill="${C.jade}" opacity="0.07"/>`,
    boar: () => sky('#3a3a33', '#6a6450') + treeline(67, 180, 10, 60, 130, C.moss) + ground(200, C.ink2) + boarShape(250, 230, 1.5) + person(100, 232, 0.85, JAMES) + shards(71, 180, 200, 10, 40),
    dinner: () => sky('#2a1f1c', '#3a2a22') + `<rect y="180" width="400" height="70" fill="#2e221c"/><circle cx="200" cy="160" r="120" fill="${C.ember}" opacity="0.09"/>` + `<rect x="120" y="195" width="160" height="10" fill="#5a4030"/><path d="M196 195 L196 182 Q200 170 204 182 L204 195 Z" fill="#c9a98a"/><circle cx="200" cy="172" r="6" fill="#f1c26a"/><circle cx="200" cy="172" r="40" fill="#f1c26a" opacity="0.12"/>` + person(140, 238, 0.9, JAMES) + person(262, 238, 0.85, MEI) + cat(340, 214, 0.7),
    romance: () => sky('#24171a', '#3a2226') + `<circle cx="200" cy="130" r="150" fill="${C.ember}" opacity="0.08"/><path d="M0 0 Q60 120 30 250 L0 250 Z M400 0 Q340 120 370 250 L400 250 Z" fill="#6a6460" opacity="0.6"/>` + person(184, 238, 1.45, JAMES) + person(214, 238, 1.38, MEI) + `<g fill="#c9b27a" opacity="0.5">${Array.from({ length: 12 }, (_, i) => `<path d="M${110 + i * 16} 240 L${116 + i * 16} 226"/>`).join('')}</g>`,
    collectors: () => sky('#4a3036', '#b06a4e') + sun(200, 70, 20) + ground(195, '#4d4842') + `<path d="M330 205 L330 110" stroke="#3a2a22" stroke-width="5"/><path d="M330 114 L365 117 L362 160 L330 154 Z" fill="${C.crimson}"/>` + person(130, 230, 1.15, { ...SECT, coat: '#6e1c25', sword: true }) + person(180, 226, 0.95, SECT) + person(84, 228, 0.95, SECT) + person(52, 230, 0.9, SECT) + person(270, 236, 1, JAMES) + cat(292, 214, 0.6),
    collectors_down: () => sky('#3a2a30', '#8a5a4a') + ground(195, '#4d4842') + shards(73, 200, 210, 40, 190) + `<g fill="${C.crimson}" opacity="0.7">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${120 + i * 33}" cy="${218 + (i % 2) * 6}" r="2.5"/>`).join('')}</g>` + `<g transform="translate(150 236)">${person(0, 0, 0.75, { ...SECT, coat: '#6e1c25' })}</g>` + person(240, 236, 1, JAMES) + `<path d="M228 190 L180 205" stroke="${C.bone}" stroke-width="3" stroke-linecap="round"/>`,
    hairpin: () => sky('#1f2420', '#33403a') + `<circle cx="200" cy="125" r="90" fill="${C.bone}" opacity="0.06"/><g transform="translate(200 125) rotate(-28)"><path d="M-110 0 L100 0" stroke="${C.bone}" stroke-width="6" stroke-linecap="round"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-80 + i * 20} 0 Q${-70 + i * 20} -16 ${-60 + i * 20} 0 Q${-70 + i * 20} 16 ${-80 + i * 20} 0 Z" fill="${C.bone}" opacity="${0.6 + (i % 3) * 0.12}"/>`).join('')}<circle cx="100" cy="0" r="9" fill="${C.bone}"/></g>`,
};

/** SVG markup for a scene's art key (unknown keys get a quiet forest). */
export function sceneArt(key) {
    const raw = (SCENES[key] || SCENES.forest_dawn)();
    const body = raw
        .replace(/fill="(#d9673a|#f1c26a)" opacity="0\.(0\d|1\d)"/g, 'fill="#fffaf0" opacity="0.45" filter="url(#bl)"')
        .replace(/#[0-9a-fA-F]{6}\b/g, (h) => inkOf(h));
    const id = String(key || 'x').replace(/\W/g, '');
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${id.replace(/_/g, ' ')}" preserveAspectRatio="xMidYMid slice">${FILTERS}<rect width="${W}" height="${H}" fill="#ece8df"/><g filter="url(#ink)">${body}</g>${vignette}${grain}</svg>`
        .replace(/id="(sk|vg|gr|ink|bl|tl\d+)"/g, `id="$1-${id}"`).replace(/url\(#(sk|vg|gr|ink|bl|tl\d+)\)/g, `url(#$1-${id})`);
}
export const ART_KEYS = Object.keys(SCENES);
