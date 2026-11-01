/**
 * Scene art: public-domain ink paintings (art/bg) behind code-drawn figures, or fully drawn in code, in ink wash: grey stone pillars and floating rocks in mist, sumi-e pines, ink spirals, one red accent.
 * Every scene key returns one SVG (viewBox 400×250). Seeded, so a scene always looks the same.
 */
import { clampPerson, clampCat, KEEP } from './figures-clamp.js';
import { meiPortrait, yukiPortrait, hatch, cloud, smoke, butterfly, shadeDefs, vignette as darkEdges } from './portrait.js';

/** 'clamp': stark black-and-white line art over screentone (the current look). 'ink': the v0.2.0 ink-wash look. */
const STYLE = 'clamp';

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
    if (STYLE === 'clamp') {
        const r = rng(Math.round(lum(top) * 997 + lum(bottom) * 131));
        let c = '';
        for (let i = 0; i < 2; i++) c += cloud(60 + i * 200 + r() * 60, 24 + r() * 40, 0.55 + r() * 0.3, r() < 0.5 ? 1 : -1);
        const y0 = 50 + r() * 50;
        c += smoke([[-10, y0], [90, y0 - 40], [170, y0 + 40], [250, y0 - 6]], 6);
        c += butterfly(40 + r() * 320, 30 + r() * 70, 0.6 + r() * 0.3, (r() - 0.5) * 40);
        return hatch(night ? 2 : 2.6, night ? 0.85 : 0.6, night ? 0.95 : 0.8) + c;
    }
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
 * A standing figure in fine ink line with soft wash shading, at real proportions (about 7½ heads tall).
 * Unit space: feet at 0, crown at -62; light falls from the left.
 * style: 'james' (lab coat, trousers, short hair), 'mei' (high-waisted ruqun, pibo shawl, bun and pin),
 * 'sect' (long cross-collared robe, sash, crown, sword), 'man' (tunic, belt, trousers, wrapped shins),
 * 'plain' (a villager's robe).
 */
function person(x, y, s = 1, { coat = C.paper, skin = '#c9a98a', hair = '#c9b27a', robe = false, sword = false, style } = {}) {
    const st = style || (robe ? 'sect' : 'plain');
    if (STYLE === 'clamp') return clampPerson(x, y, s, { style: st, sword, coat });
    const male = st !== 'mei' && st !== 'plain';
    const L = '#1b1917';
    const w = (n) => f(n / Math.sqrt(Math.max(1, s * 1.2)) * 100) / 100;
    const line = `stroke="${L}" stroke-width="${w(0.55)}" stroke-linejoin="round" stroke-linecap="round"`;
    const thin = `stroke="${L}" stroke-width="${w(0.26)}" fill="none" stroke-linecap="round"`;
    const fold = `stroke="${L}" stroke-width="${w(0.24)}" fill="none" opacity="0.5" stroke-linecap="round"`;
    /** A garment piece: wash fill, a shadow wash from the right, then the ink outline. */
    const piece = (d, fill) => `<path d="${d}" fill="${fill}"/><path d="${d}" fill="none" ${line}/>`;
    const sk = '#f7f2ea';
    const hairC = inkOf(hair);
    const robeC = st === 'sect' ? coat : wash(coat, st === 'james' ? 0.12 : 0.45);
    const innerC = st === 'sect' ? '#ebe5da' : wash(coat, 0.78);
    const sh = male ? 7.6 : 6.5; // half shoulder width
    let back = '';
    let body = '';

    // ---- legs, skirts and coats ----
    if (st === 'james' || st === 'man') {
        const trous = st === 'james' ? wash('#4a4640', 0.25) : wash('#5a5048', 0.35);
        body += piece('M-3.9 -31 C-4.1 -22 -3.9 -10 -3.7 -1.2 L-1.2 -1.2 C-1 -10 -0.7 -22 -0.4 -30 Z', trous)
            + piece('M3.9 -31 C4.2 -22 4.3 -10 4.4 -1.2 L1.9 -1.2 C1.6 -10 1 -22 0.4 -30 Z', trous)
            + `<path d="M-2.4 -16 Q-2.6 -12 -2.5 -8 M2.9 -16 Q3 -12 3.1 -8" ${fold}/>`;
        if (st === 'man') body += `<path d="M-3.9 -9 L-1.2 -8.4 M-3.8 -7 L-1.2 -6.4 M-3.8 -5 L-1.2 -4.4 M1.9 -8.4 L4.4 -9 M1.9 -6.4 L4.4 -7 M1.9 -4.4 L4.4 -5" ${fold}/>`;
        body += `<path d="M-4.2 -0.1 Q-4.6 -1.5 -2.4 -1.5 L-0.9 -1.3 L-0.8 0 Z M4.9 -0.1 Q5.2 -1.5 3.2 -1.5 L1.6 -1.3 L1.6 0 Z" fill="${L}"/>`;
        if (st === 'james') {
            // the lab coat, open, to just below the knee
            const coatD = `M-${sh} -50.4 C-8.4 -44 -8.2 -36 -8.6 -28 C-8.9 -24 -9.4 -19.6 -9.8 -15.8 Q-6 -15 -0.6 -15.6 L-0.2 -41 L0.2 -41 L0.6 -15.6 Q6 -15 9.8 -15.8 C9.4 -19.6 8.9 -24 8.6 -28 C8.2 -36 8.4 -44 ${sh} -50.4 Q4 -51.6 1.8 -51.8 L0 -46 L-1.8 -51.8 Q-4 -51.6 -${sh} -50.4 Z`;
            body += `<path d="M-1.9 -51.6 L1.9 -51.6 L1.3 -42 L-1.3 -42 Z" fill="#f4f0e8" ${line}/><path d="M-1.9 -51.6 L0 -49 L1.9 -51.6" fill="none" ${thin}/><path d="M0 -49 L0 -41" ${fold}/>`
                + piece(coatD, robeC, 0.9)
                + `<path d="M-1.8 -51.8 L-3.4 -46.8 L-1.2 -45 L-0.4 -40.8 M1.8 -51.8 L3.4 -46.8 L1.2 -45 L0.4 -40.8" fill="none" ${thin}/>`
                + `<path d="M-7.6 -27 L-4.4 -27 L-4.5 -23.6 L-7.7 -23.6 Z M4.6 -27 L7.8 -27 L7.9 -23.6 L4.7 -23.6 Z M4.4 -45.6 L6.4 -45.6" fill="none" ${fold}/>`
                + `<path d="M-6 -40 Q-6.6 -30 -7.6 -17 M6.2 -38 Q6.8 -30 8 -17 M-2 -36 Q-2.6 -26 -3.4 -16 M2.4 -34 Q3 -26 3.6 -16" ${fold}/>`;
        } else {
            const tun = `M-${sh} -50.4 C-8 -45 -7.4 -40 -7 -37.6 C-7.6 -32 -8.4 -26 -8.8 -21 Q0 -19.6 8.8 -21 C8.4 -26 7.6 -32 7 -37.6 C7.4 -40 8 -45 ${sh} -50.4 Q0 -52.4 -${sh} -50.4 Z`;
            body += piece(tun, robeC) + `<path d="M-2.6 -51.6 L3.6 -38.4 M2.6 -51.6 L0.6 -47.4" fill="none" ${thin}/><path d="M-7.2 -38.6 Q0 -37.2 7.2 -38.6 L7.1 -36.6 Q0 -35.2 -7.1 -36.6 Z" fill="${L}"/><path d="M-4.4 -35 Q-5.6 -28 -6.6 -21 M3.6 -35 Q4.6 -28 5.8 -21 M0.4 -35 L0.6 -20" ${fold}/>`;
        }
    } else {
        // a full skirt to the floor: high-waisted (Mei) or at the waist (robes)
        const top = st === 'mei' ? -45.4 : -38.4;
        const hem = st === 'mei' ? 11.2 : 9.6;
        const skirt = `M-${st === 'mei' ? 5.2 : 6.4} ${top} C-6.6 -30 -9 -14 -${hem} -0.4 Q-${hem * 0.5} 0.8 0 0.2 Q${hem * 0.5} 1 ${hem} -0.2 C9.4 -14 7 -30 ${st === 'mei' ? 5.2 : 6.4} ${top} Z`;
        body += `<path d="M-2.6 0 Q-3 -1 -1.2 -1 L-0.4 0 Z M1.6 0.2 Q1.8 -0.9 3.2 -0.8 L3.6 0.2 Z" fill="${L}"/>`
            + piece(skirt, robeC)
            + `<path d="M-2.4 ${top + 1} Q-3.8 -18 -5 -0.2 M0.2 ${top + 1} Q0.4 -18 0.4 0.4 M2.8 ${top + 1} Q4 -18 5.4 0 M-4.4 ${top + 1} Q-6.8 -16 -8.6 -0.4 M4.6 ${top + 1} Q6.8 -16 8.8 -0.3" ${fold}/>`;
        if (st === 'mei') {
            for (const [px, py] of [[-6.4, -6], [-2.8, -12], [2.6, -5], [6.2, -13], [-4.6, -21], [1.8, -20], [-0.8, -3], [4.6, -28], [-2.6, -32]]) {
                body += `<g fill="none" stroke="${L}" stroke-width="${w(0.16)}" opacity="0.55">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f(px + Math.cos(a * Math.PI / 180) * 0.5)}" cy="${f(py + Math.sin(a * Math.PI / 180) * 0.5)}" r="0.32"/>`).join('')}</g>`;
            }
            body += `<path d="M-${hem} -0.4 Q-${hem * 0.5} 0.8 0 0.2 Q${hem * 0.5} 1 ${hem} -0.2" fill="none" stroke="${L}" stroke-width="${w(0.5)}" stroke-dasharray="${w(0.6)} ${w(0.5)}" opacity="0.45"/>`;
        }
    }

    // ---- upper body (robes) ----
    if (st === 'mei' || st === 'sect' || st === 'plain') {
        const waist = st === 'mei' ? -45.4 : -38.4;
        const bodice = `M-${sh} -50.4 Q0 -52.2 ${sh} -50.4 L${st === 'mei' ? 5.4 : 6.6} ${waist} L-${st === 'mei' ? 5.4 : 6.6} ${waist} Z`;
        body += piece(bodice, innerC, 0.7)
            + `<path d="M-2.4 -51.6 C-1 -49 1.4 -46.6 ${st === 'mei' ? 3 : 4} ${waist} M2.4 -51.6 L0.4 -48.6" fill="none" stroke="${L}" stroke-width="${w(0.36)}"/>`
            + `<path d="M-2.4 -51.6 C-1 -49 1.4 -46.6 ${st === 'mei' ? 3 : 4} ${waist}" fill="none" stroke="${st === 'sect' ? '#2a2826' : wash(coat, 0.1)}" stroke-width="${w(0.9)}" opacity="0.5" transform="translate(-0.5 0)"/>`;
        const sashC = st === 'sect' ? L : st === 'mei' ? '#a02c2c' : wash(coat, 0.05);
        const sy = waist;
        body += `<path d="M-${st === 'mei' ? 5.5 : 6.8} ${sy - 1.4} Q0 ${sy - 2} ${st === 'mei' ? 5.5 : 6.8} ${sy - 1.4} L${st === 'mei' ? 5.3 : 6.7} ${sy + 0.8} Q0 ${sy + 0.2} -${st === 'mei' ? 5.3 : 6.7} ${sy + 0.8} Z" fill="${sashC}" ${line}/>`
            + `<path d="M0.6 ${sy + 0.6} C1.4 ${sy + 8} 0.2 ${sy + 16} 1 ${sy + 24} M1.6 ${sy + 0.6} C2.8 ${sy + 7} 2.4 ${sy + 13} 3 ${sy + 19}" stroke="${sashC}" stroke-width="${w(0.6)}" fill="none" stroke-linecap="round" opacity="0.9"/>`;
    }

    // ---- arms: hanging, slightly bent; wide sleeves for robes ----
    const hand = (hx, hy, dir) => `<path d="M${f(hx - 0.7)} ${f(hy)} C${f(hx - 0.9)} ${f(hy + 1.2)} ${f(hx - 0.4)} ${f(hy + 2.4)} ${f(hx + 0.2 * dir)} ${f(hy + 2.6)} C${f(hx + 0.8)} ${f(hy + 2.4)} ${f(hx + 0.9)} ${f(hy + 1.2)} ${f(hx + 0.7)} ${f(hy)} Z" fill="${sk}" ${line}/><path d="M${f(hx - 0.2)} ${f(hy + 1.2)} L${f(hx - 0.2)} ${f(hy + 2.2)}" ${fold}/>`;
    if (st === 'james' || st === 'man') {
        const slv = (dir) => `M${dir * (sh - 0.4)} -50 C${dir * (sh + 1.4)} -46 ${dir * (sh + 1.6)} -41 ${dir * (sh + 1.4)} -37 C${dir * (sh + 1.4)} -33 ${dir * (sh + 1.8)} -30 ${dir * (sh + 2)} -27.6 L${dir * (sh - 0.4)} -27.4 C${dir * (sh - 0.6)} -30 ${dir * (sh - 0.9)} -33 ${dir * (sh - 1)} -37 C${dir * (sh - 1.2)} -41 ${dir * (sh - 1.6)} -44 ${dir * (sh - 2)} -46 Z`;
        body += piece(slv(-1), robeC) + piece(slv(1), robeC) + `<path d="M-${sh + 1.2} -38 q0.8 0.4 1.6 0 M${sh + 0.2} -38 q0.8 0.4 1.6 0" ${fold}/>`
            + hand(-(sh + 0.8), -27.6, -1) + hand(sh + 0.8, -27.6, 1);
    } else {
        const slv = (dir) => `M${dir * (sh - 0.6)} -50.2 C${dir * (sh + 1.6)} -46 ${dir * (sh + 2.6)} -40 ${dir * (sh + 3.6)} -33 C${dir * (sh + 4.4)} -28 ${dir * (sh + 4.6)} -25 ${dir * (sh + 4)} -22.6 C${dir * (sh + 2.6)} -21.6 ${dir * (sh + 0.8)} -22.4 ${dir * (sh - 0.2)} -24.4 C${dir * (sh - 0.4)} -30 ${dir * (sh - 1.2)} -36 ${dir * (sh - 1.8)} -42 Z`;
        body += piece(slv(-1), robeC) + piece(slv(1), robeC)
            + `<path d="M-${sh + 1.6} -40 Q-${sh + 2.8} -32 -${sh + 2.6} -24 M-${sh + 0.4} -38 Q-${sh + 1.2} -31 -${sh + 0.6} -24.4 M${sh + 1.6} -40 Q${sh + 2.8} -32 ${sh + 2.6} -24 M${sh + 0.4} -38 Q${sh + 1.2} -31 ${sh + 0.6} -24.4" ${fold}/>`
            + hand(-(sh + 0.6), -25, -1) + hand(sh + 0.6, -25, 1);
        if (st === 'mei') {
            // pibo: a long silk shawl over the arms, falling to the knees
            const pc = wash('#c9c2b4', 0.2);
            back += `<path d="M-6 -50 C-12 -46 -13.4 -34 -13 -24 C-12.8 -18 -13.6 -12 -14.4 -6 L-13 -6 C-12.4 -12 -11.6 -18 -11.6 -24 C-11.8 -34 -10.6 -44 -5 -49 Z M6 -50 C12 -46 13.4 -34 13 -24 C12.8 -18 13.6 -12 14.4 -6 L13 -6 C12.4 -12 11.6 -18 11.6 -24 C11.8 -34 10.6 -44 5 -49 Z" fill="${pc}" opacity="0.75" ${line}/>`;
        }
    }

    // ---- neck, head, face ----
    const nw = male ? 1.45 : 1.1;
    let head = `<path d="M-${nw} -54.6 L-${nw} -51.2 Q0 -50.2 ${nw} -51.2 L${nw} -54.6 Z" fill="${sk}" ${line}/><path d="M-${nw} -53.8 Q0 -52.6 ${nw} -53.8 L${nw} -54.6 L-${nw} -54.6 Z" fill="${L}" opacity="0.18"/>`;
    const jaw = male ? 'C3.3 -56.2 2.8 -54.7 1.8 -53.9 C1.2 -53.4 0.6 -53.3 0 -53.3 C-0.6 -53.3 -1.2 -53.4 -1.8 -53.9 C-2.8 -54.7 -3.3 -56.2 -3.3 -58.4'
        : 'C3.1 -56.4 2.4 -54.9 1.5 -54 C1 -53.6 0.5 -53.4 0 -53.4 C-0.5 -53.4 -1 -53.6 -1.5 -54 C-2.4 -54.9 -3.1 -56.4 -3.1 -58.4';
    const hw = male ? 3.3 : 3.1;
    const headD = `M-${hw} -58.4 C-${hw} -61 -1.8 -62.3 0 -62.3 C1.8 -62.3 ${hw} -61 ${hw} -58.4 ${jaw} Z`;
    if (st !== 'mei') head += `<path d="M-${hw - 0.05} -58.6 Q-${hw + 0.7} -58 -${hw - 0.1} -56.4 M${hw - 0.05} -58.6 Q${hw + 0.7} -58 ${hw - 0.1} -56.4" fill="${sk}" ${line}/>`;
    head += `<path d="${headD}" fill="${sk}"/><path d="${headD}" fill="none" ${line}/>`;
    const lip = st === 'mei' ? '#a8443f' : '#7a6660';
    const face = [-1, 1].map((d) => `<path d="M${f(d * 2.2)} -58.3 Q${f(d * 1.35)} -59.1 ${f(d * 0.55)} -58.4" stroke="${L}" stroke-width="${w(0.45)}" fill="none" stroke-linecap="round"/>`
        + `<ellipse cx="${f(d * 1.35)}" cy="-57.75" rx="0.5" ry="0.68" fill="${L}"/><circle cx="${f(d * 1.35 - 0.18)}" cy="-58" r="0.16" fill="#fff"/>`
        + `<path d="M${f(d * 2.3)} -59.9 Q${f(d * 1.4)} -60.4 ${f(d * 0.6)} -60" stroke="${L}" stroke-width="${w(0.25)}" fill="none" stroke-linecap="round"/>`).join('')
        + `<path d="M0.15 -56.5 L0.4 -55.9 L0.05 -55.8" stroke="${L}" stroke-width="${w(0.18)}" fill="none"/>`
        + `<path d="M-0.55 -54.6 Q0 -54.35 0.55 -54.6" stroke="${st === 'mei' ? '#a02c2c' : L}" stroke-width="${w(0.25)}" fill="none" stroke-linecap="round"/>`
        + `<path d="M-2.8 -53.9 Q0 -51.8 2.8 -53.9 L2.2 -52.6 Q0 -51.6 -2.2 -52.6 Z" fill="#d9d3c8" opacity="0.9"/>`;

    // ---- hair ----
    let hairS = '';
    let hairBack = '';
    const strand = `stroke="#8a857c" stroke-width="${w(0.14)}" fill="none" opacity="0.7"`;
    if (st === 'james') {
        hairS = `<path d="M-3.45 -57.8 C-3.9 -61.4 -1.8 -63.4 0.4 -63.2 C2.8 -63.2 4.1 -61.2 3.45 -57.6 C3.2 -59.4 2.6 -60.4 1.6 -60.7 C0.8 -60 -0.6 -59.8 -1.4 -60.4 C-2 -59.6 -2.8 -59 -3.45 -57.8 Z" fill="${hairC}" ${line}/>`
            + `<path d="M-2.2 -62.6 Q-1.2 -61.4 -1 -60.4 M0.6 -63 Q1.6 -61.8 1.6 -60.8 M2.6 -62.4 Q3.2 -61 3.2 -59.6 M-3 -61.4 Q-3 -60 -3.3 -58.6" ${strand}/>`
            + `<path d="M-2.2 -55.6 Q0 -54.2 2.2 -55.6" stroke="${L}" stroke-width="${w(0.5)}" opacity="0.06" fill="none"/>`;
    } else if (st === 'mei') {
        hairBack = `<path d="M-3.4 -58 C-4 -54 -4.4 -50 -5 -46.6 L-1.2 -48 L1.2 -48 L5 -46.6 C4.4 -50 4 -54 3.4 -58 Z" fill="${hairC}" ${line}/>`;
        hairS = `<path d="M0 -62.5 C-2.6 -62.6 -3.8 -60.8 -3.6 -58.2 C-3.4 -56.8 -3.6 -55.6 -4 -54.4 C-3.4 -55.4 -3 -56.6 -2.9 -58 C-2.6 -60 -1.4 -61.2 0 -61.3 C1.4 -61.2 2.6 -60 2.9 -58 C3 -56.6 3.4 -55.4 4 -54.4 C3.6 -55.6 3.4 -56.8 3.6 -58.2 C3.8 -60.8 2.6 -62.6 0 -62.5 Z" fill="${hairC}" ${line}/>`
            + `<path d="M-0.2 -62.4 Q-2.2 -61.4 -3.1 -58.4 M0.2 -62.4 Q2.2 -61.4 3.1 -58.4 M-1.2 -62.2 Q-2.6 -60.4 -3.2 -56.4 M1.2 -62.2 Q2.6 -60.4 3.2 -56.4" ${strand}/>`
            + `<ellipse cx="0.3" cy="-64.4" rx="2.3" ry="1.7" fill="${hairC}" ${line}/><path d="M-1.6 -64.6 Q0.3 -66 2.2 -64.4 M-1.4 -64 Q0.3 -65 2 -63.8" ${strand}/>`
            + `<path d="M-3.4 -65.3 L4.2 -63.6" stroke="${L}" stroke-width="${w(0.36)}" stroke-linecap="round"/><circle cx="4.4" cy="-63.6" r="0.55" fill="#a02c2c"/><path d="M4.4 -63.1 L4.6 -61.6 M4.6 -63.1 L5 -61.8" stroke="#a02c2c" stroke-width="${w(0.14)}"/>`
            + `<g fill="#f4f0e8" stroke="${L}" stroke-width="${w(0.12)}">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f(-2.2 + Math.cos(a * Math.PI / 180) * 0.45)}" cy="${f(-63.6 + Math.sin(a * Math.PI / 180) * 0.45)}" r="0.32"/>`).join('')}</g>`;
    } else {
        hairS = `<path d="M-3.4 -58 C-3.8 -61.4 -1.8 -62.9 0 -62.9 C1.8 -62.9 3.8 -61.4 3.4 -58 C3 -60 1.8 -61.2 0 -61.3 C-1.8 -61.2 -3 -60 -3.4 -58 Z" fill="${hairC}" ${line}/><path d="M-1.4 -62.6 Q-2.6 -61.2 -3 -59.2 M1.4 -62.6 Q2.6 -61.2 3 -59.2" ${strand}/>`
            + `<ellipse cx="0" cy="-63.9" rx="1.4" ry="1.2" fill="${hairC}" ${line}/>`
            + (st === 'sect' ? `<path d="M-1.1 -66.2 L1.1 -66.2 L1.4 -63.4 L-1.4 -63.4 Z" fill="#a02c2c" ${line}/><path d="M-2.6 -64.8 L2.6 -64.8" stroke="${L}" stroke-width="${w(0.3)}"/>` : '');
        if (male && st !== 'james') hairS += `<path d="M-1.2 -54.2 Q0 -53.4 1.2 -54.2" stroke="${L}" stroke-width="${w(0.2)}" fill="none" opacity="0.35"/>`;
    }
    const swordS = sword ? `<path d="M-6.6 -63 L6.4 -26" stroke="${L}" stroke-width="${w(0.8)}" stroke-linecap="round"/><path d="M-6.6 -63 L-5.2 -59" stroke="#a02c2c" stroke-width="${w(1)}"/><path d="M-6.4 -57.6 L-4.2 -58.6" stroke="${L}" stroke-width="${w(1.2)}" stroke-linecap="round"/>` : '';
    // a soft contact shadow under the feet
    const ground = `<ellipse cx="0.6" cy="0.2" rx="${male ? 6 : 10}" ry="0.9" fill="${L}" opacity="0.14"/>`;
    return `<g transform="translate(${x} ${y}) scale(${f(s * 1.15)})">${ground}${swordS}${back}${hairBack}${body}${head}${face}${hairS}</g>`;
}
/** Yuki: a small white cat, sitting, at real cat proportions, in fine ink with soft shading. */
function cat(x, y, s = 1, color = C.bone) {
    if (STYLE === 'clamp') return clampCat(x, y, s);
    const L = '#1b1917';
    const w = (n) => f(n / Math.sqrt(Math.max(1, s)) * 100) / 100;
    const c = inkOf(color);
    const line = `stroke="${L}" stroke-width="${w(0.55)}" stroke-linejoin="round" stroke-linecap="round"`;
    const fur = `stroke="${L}" stroke-width="${w(0.18)}" fill="none" opacity="0.45" stroke-linecap="round"`;
    const tail = 'M-10.6 -1.6 C-14.8 -0.4 -14.6 2.4 -10.2 2.5 C-4.4 2.7 2.6 2.2 7.6 0.9';
    const bodyD = 'M1.2 -19.6 C-3.4 -18.8 -8.8 -14.6 -11.2 -8.6 C-12.8 -4.4 -11.8 -0.6 -7.8 0 L6.6 0 C7.4 0 7.6 -0.9 7 -1.4 C6.6 -5 6.4 -9 6.7 -12.4 C7 -15.4 6.6 -18.2 5.2 -19.8 Z';
    const headD = 'M-0.1 -22.9 C-0.1 -25.2 1.6 -26.6 3.7 -26.6 C5.8 -26.6 7.5 -25.2 7.5 -22.9 C7.5 -21.6 7 -20.6 6.3 -20 C5.5 -19.3 4.6 -19.1 3.7 -19.1 C2.7 -19.1 1.8 -19.4 1.1 -20 C0.3 -20.7 -0.1 -21.6 -0.1 -22.9 Z';
    return `<g transform="translate(${x} ${y}) scale(${f(s * 1.05)})">`
        + `<ellipse cx="-2" cy="0.6" rx="11" ry="1.1" fill="${L}" opacity="0.12"/>`
        + `<path d="${tail}" stroke="${L}" stroke-width="${f(2.5 + 0.9 / Math.sqrt(Math.max(1, s)))}" fill="none" stroke-linecap="round"/><path d="${tail}" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M-6 2.4 C-2 2.4 2 2.1 5 1.4" stroke="${L}" stroke-width="1.2" opacity="0.08" fill="none"/>`
        + `<path d="${bodyD}" fill="${c}"/><path d="${bodyD}" fill="none" ${line}/>`
        + `<path d="M-10.4 -2.2 C-9.2 -8 -4 -9.8 -1.6 -4.6 C-1 -3 -1 -1.4 -1.4 0" ${fur}/><ellipse cx="-6.4" cy="-3.6" rx="4.2" ry="2.6" fill="${L}" opacity="0.06"/>`
        + `<path d="M3.2 -11.4 C3.1 -7 3.2 -3 3.4 -0.4 M5 -0.1 C4.8 -0.6 5.4 -1 6.4 -0.9" fill="none" ${line}/><path d="M2.2 -0.1 C2.2 -0.8 3 -1.1 4.2 -0.9 C4.6 -0.6 4.6 -0.2 4.4 0" fill="${c}" ${line}/>`
        + `<path d="M5.6 -18.6 l0.5 0.7 l-0.5 0.4 l0.6 0.8 l-0.4 0.4 M6.2 -15.2 l0.5 0.6 M-8.6 -12.6 l-0.6 -0.5 M-10.6 -8.4 l-0.6 -0.3 M-4 -17.2 l-0.3 -0.7" ${fur}/>`
        + `<path d="M0.4 -24.4 L0.7 -28.4 L2.8 -26.3 Z M4.6 -26.4 L6.8 -28.5 L7.1 -24.4 Z" fill="${c}" ${line}/><path d="M1.1 -27.2 L1.3 -25.4 M6.4 -27.4 L6.3 -25.4" stroke="#c2a7a2" stroke-width="0.7" stroke-linecap="round"/><path d="M0.9 -27.6 l0.6 0.8 M6.8 -27.8 l-0.5 0.9" ${fur}/>`
        + `<path d="${headD}" fill="${c}"/><path d="${headD}" fill="none" ${line}/>`
        + `<path d="M1.65 -23.25 Q2.35 -24 3.05 -23.25 Q2.35 -22.75 1.65 -23.25 Z M4.35 -23.25 Q5.05 -24 5.75 -23.25 Q5.05 -22.75 4.35 -23.25 Z" fill="#e2c13a" stroke="${L}" stroke-width="${w(0.24)}"/><path d="M2.35 -23.85 L2.35 -22.8 M5.05 -23.85 L5.05 -22.8" stroke="${L}" stroke-width="${w(0.36)}" stroke-linecap="round"/><circle cx="2.15" cy="-23.45" r="0.1" fill="#fff"/><circle cx="4.85" cy="-23.45" r="0.1" fill="#fff"/>`
        + `<path d="M3.3 -21.7 L4.1 -21.7 L3.7 -21.2 Z" fill="#c2a7a2"/><path d="M3.7 -21.2 L3.7 -20.8 M3.7 -20.8 Q3.2 -20.3 2.7 -20.6 M3.7 -20.8 Q4.2 -20.3 4.7 -20.6" stroke="${L}" stroke-width="${w(0.2)}" fill="none"/>`
        + `<path d="M2.6 -21.2 L-2.6 -22 M2.6 -20.9 L-2.4 -20.2 M2.7 -20.6 L-1.8 -19 M4.8 -21.2 L10 -22.2 M4.8 -20.9 L9.8 -20.4 M4.7 -20.6 L9 -19.2" stroke="${L}" stroke-width="${w(0.12)}" opacity="0.55"/>`
        + `<path d="M1.4 -20.2 Q3.7 -18.6 6 -20.2" stroke="${L}" stroke-width="0.8" opacity="0.07" fill="none"/>`
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
const FILTERS = '<defs><filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter><filter id="bl" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="7"/></filter><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.15  0 0 0 0 0.13  0 0 0 0.14 0"/></filter><linearGradient id="sh" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0.35" stop-color="#23211e" stop-opacity="0"/><stop offset="1" stop-color="#23211e" stop-opacity="0.3"/></linearGradient><radialGradient id="vg" cx="0.5" cy="0.48" r="0.72"><stop offset="0.62" stop-color="#ece8df" stop-opacity="0"/><stop offset="1" stop-color="#ece8df" stop-opacity="0.85"/></radialGradient></defs>';
const grain = '<rect width="400" height="250" filter="url(#gr)"/>';
const vignette = '<rect width="400" height="250" fill="url(#vg)"/>';

const JAMES = { coat: C.bone, hair: '#c9b27a', style: 'james' };
const MEI = { coat: '#8a7a6a', hair: '#1f1d1b', skin: '#c99f7f', style: 'mei' };
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
    mei_lin: () => sky('#56483e', '#c48e66') + floatRock(70, 60, 1.2, C.ash, 81, true) + floatRock(340, 40, 0.8, C.ash, 82, false) + person(200, 440, 5.2, MEI) + `<g fill="${C.jade}" opacity="0.85"><path d="M330 250 Q335 205 345 190 Q342 215 348 250 Z"/><path d="M348 250 Q355 215 370 205 Q360 228 362 250 Z"/></g>`,
    ridge: () => sky('#2b2436', '#b0624a') + sun(70, 120, 16, C.ember, 0.3) + mountains(53, 160, 70, '#3c3048', 0.8) + `<g transform="translate(270 168)"><path d="M-18 0 L-10 -120 L-26 -150 M-10 -120 L10 -160 L4 -190 M10 -160 L30 -175 M-6 -60 L-40 -90 M2 -80 L36 -110" stroke="#2a2230" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-30 0 L-14 -40 L14 -40 L30 0 Z" fill="#2a2230"/><circle cx="0" cy="-90" r="70" fill="${C.jade}" opacity="0.08"/></g>` + treeline(57, 190, 18, 25, 55, C.ink2) + ground(225, C.ink) + person(110, 238, 0.8, JAMES) + cat(128, 226, 0.6),
    village: () => sky('#4a4248', '#9a8270') + mountains(61, 130, 40, C.dusk, 0.6) + treeline(63, 165, 16, 30, 70, C.moss) + ground(195, '#5a5650') + hut(80, 205, 60, '#6d6a62', C.ink2, true) + hut(170, 200, 50, '#77736a', C.ink2) + hut(330, 208, 66, '#6d6a62', C.ink2, true) + `<path d="M250 205 L250 120" stroke="#3a2a22" stroke-width="5"/><path d="M250 125 L285 128 L282 165 L250 160 Z M250 168 L280 170 L278 200 L250 196 Z" fill="${C.crimson}"/>` + lotus(266, 152, 0.5, '#e8c8b8') + person(210, 236, 0.75, JAMES) + cat(226, 238, 0.55),
    elder: () => sky('#2a2420', '#4d3d30') + `<rect x="0" y="170" width="400" height="80" fill="#3a2e24"/><circle cx="200" cy="120" r="110" fill="${C.ember}" opacity="0.07"/>` + `<g transform="translate(260 225)"><path d="M-40 0 Q-36 -50 0 -56 Q36 -50 40 0 Z" fill="#5a5048"/><circle cx="0" cy="-70" r="16" fill="#b8916f"/><path d="M-14 -62 Q0 -40 14 -62 Q8 -50 0 -48 Q-8 -50 -14 -62 Z" fill="${C.paper}"/></g>` + `<rect x="150" y="200" width="70" height="8" fill="#2a2018"/><path d="M175 200 Q175 188 183 188 L188 188 Q195 188 195 200 Z" fill="${C.jade}" opacity="0.8"/><path d="M182 184 Q180 176 186 170" stroke="${C.paper}" stroke-opacity="0.4" fill="none"/>` + person(110, 236, 0.9, JAMES),
    healer: () => sky('#2a2622', '#4a3e34') + `<rect y="190" width="400" height="60" fill="#3a3028"/>` + `<g transform="translate(220 205)"><rect x="-70" y="0" width="140" height="18" fill="#5a4a3a"/><ellipse cx="-10" cy="-4" rx="50" ry="10" fill="#c9a98a"/><circle cx="-56" cy="-8" r="10" fill="#c9a98a"/></g>` + person(140, 232, 0.9, JAMES) + `<path d="M180 190 L196 200" stroke="${C.bone}" stroke-width="2"/>` + `<g fill="#c8d6b9"><path d="M260 185 Q272 176 284 185 Z"/></g>` + `<circle cx="220" cy="190" r="70" fill="${C.jade}" opacity="0.07"/>`,
    boar: () => sky('#3a3a33', '#6a6450') + treeline(67, 180, 10, 60, 130, C.moss) + ground(200, C.ink2) + boarShape(250, 230, 1.5) + person(100, 232, 0.85, JAMES) + shards(71, 180, 200, 10, 40),
    dinner: () => sky('#2a1f1c', '#3a2a22') + `<rect y="180" width="400" height="70" fill="#2e221c"/><circle cx="200" cy="160" r="120" fill="${C.ember}" opacity="0.09"/>` + `<rect x="120" y="195" width="160" height="10" fill="#5a4030"/><path d="M196 195 L196 182 Q200 170 204 182 L204 195 Z" fill="#c9a98a"/><circle cx="200" cy="172" r="6" fill="#f1c26a"/><circle cx="200" cy="172" r="40" fill="#f1c26a" opacity="0.12"/>` + person(140, 238, 0.9, JAMES) + person(262, 238, 0.85, MEI) + cat(340, 214, 0.7),
    romance: () => sky('#24171a', '#3a2226') + `<circle cx="200" cy="130" r="150" fill="${C.ember}" opacity="0.08"/><path d="M0 0 Q60 120 30 250 L0 250 Z M400 0 Q340 120 370 250 L400 250 Z" fill="#6a6460" opacity="0.6"/>` + person(178, 262, 2.4, JAMES) + person(222, 262, 2.25, MEI) + `<g fill="#c9b27a" opacity="0.5">${Array.from({ length: 12 }, (_, i) => `<path d="M${110 + i * 16} 240 L${116 + i * 16} 226"/>`).join('')}</g>`,
    collectors: () => sky('#4a3036', '#b06a4e') + sun(200, 70, 20) + ground(195, '#4d4842') + `<path d="M330 205 L330 110" stroke="#3a2a22" stroke-width="5"/><path d="M330 114 L365 117 L362 160 L330 154 Z" fill="${C.crimson}"/>` + person(130, 230, 1.15, { ...SECT, coat: '#6e1c25', sword: true }) + person(180, 226, 0.95, SECT) + person(84, 228, 0.95, SECT) + person(52, 230, 0.9, SECT) + person(270, 236, 1, JAMES) + cat(292, 214, 0.6),
    collectors_down: () => sky('#3a2a30', '#8a5a4a') + ground(195, '#4d4842') + shards(73, 200, 210, 40, 190) + `<g fill="${C.crimson}" opacity="0.7">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${120 + i * 33}" cy="${218 + (i % 2) * 6}" r="2.5"/>`).join('')}</g>` + `<g transform="translate(150 236)">${person(0, 0, 0.75, { ...SECT, coat: '#6e1c25' })}</g>` + person(240, 236, 1, JAMES) + `<path d="M228 190 L180 205" stroke="${C.bone}" stroke-width="3" stroke-linecap="round"/>`,
    hairpin: () => sky('#1f2420', '#33403a') + `<circle cx="200" cy="125" r="90" fill="${C.bone}" opacity="0.06"/><g transform="translate(200 125) rotate(-28)"><path d="M-110 0 L100 0" stroke="${C.bone}" stroke-width="6" stroke-linecap="round"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-80 + i * 20} 0 Q${-70 + i * 20} -16 ${-60 + i * 20} 0 Q${-70 + i * 20} 16 ${-80 + i * 20} 0 Z" fill="${C.bone}" opacity="${0.6 + (i % 3) * 0.12}"/>`).join('')}<circle cx="100" cy="0" r="9" fill="${C.bone}"/></g>`,
};

/**
 * Scenes painted over public-domain ink paintings (cropped and toned to the paper; see art/bg/CREDITS.md).
 * img: the background; dark: a dusk/night wash over it; fg: what's drawn on top.
 */
const GROUND = '<defs><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece8df" stop-opacity="0"/><stop offset="0.55" stop-color="#ece8df" stop-opacity="0.7"/><stop offset="1" stop-color="#e3ded3" stop-opacity="0.92"/></linearGradient></defs><rect y="165" width="400" height="85" fill="url(#gw)"/>';
const MEDITATOR = `<g transform="translate(200 205)"><path d="M-40 0 Q-30 -20 0 -18 Q30 -20 40 0 Z" fill="${C.bone}" stroke="#2a2826" stroke-width="0.8"/><path d="M-14 -18 L-16 -52 Q0 -60 16 -52 L14 -18 Z" fill="${C.bone}" stroke="#2a2826" stroke-width="0.8"/><circle cy="-62" r="8" fill="#c9a98a" stroke="#2a2826" stroke-width="0.7"/></g>`;
const BANNER = (x, top) => `<path d="M${x} ${top + 90} L${x} ${top}" stroke="#3a2a22" stroke-width="4"/><path d="M${x} ${top + 4} L${x + 35} ${top + 7} L${x + 32} ${top + 44} L${x} ${top + 39} Z" fill="${C.crimson}"/>`;
const PAINTED = {
    forest_dawn: { img: 'forest', fg: () => sun(330, 46, 13) + GROUND + cat(170, 232, 1.1) + person(200, 236, 1, JAMES) },
    clearing: { img: 'peaks', fg: () => sun(80, 52, 11, C.crimson, 0.25) + GROUND + person(205, 232, 0.9, JAMES) + cat(225, 234, 0.8) },
    stream: { img: 'cliffs', fg: () => GROUND + person(150, 238, 0.8, JAMES) + cat(300, 238, 0.9) },
    meditation: { img: 'peaks', fg: () => GROUND + MEDITATOR + swirl(110, 90, 40) + swirl(300, 70, 28) + swirl(200, 150, 70, 2) },
    herb_girl: { img: 'forest', fg: () => sun(345, 40, 12) + GROUND + person(90, 232, 0.9, MEI) + person(220, 234, 1, SECT) + person(270, 236, 1.15, { coat: '#4a3a32', hair: C.ink, skin: '#b88d6c', style: 'man' }) },
    camp: { img: 'pine', dark: 0.32, fg: () => GROUND + fire(200, 224, 1) + person(160, 232, 0.85, JAMES) + cat(240, 232, 0.8) + `<g stroke="${C.bone}" stroke-width="2.5" stroke-linecap="round">${[60, 100, 300, 340].map((x) => `<path d="M${x} 238 L${x + (x < 200 ? -8 : 8)} 216"/>`).join('')}</g>` },
    forest_night: { img: 'pine', dark: 0.55, fg: () => moon(330, 40, 12) + fire(200, 236, 0.6) },
    jackals: { img: 'pine', dark: 0.55, fg: () => GROUND + beast(90, 232, 1.4) + beast(320, 236, -1.4) + fire(200, 234, 0.55) + person(200, 238, 0.85, JAMES) + cat(226, 240, 0.7) },
    boar: { img: 'forest', fg: () => GROUND + boarShape(250, 234, 1.5) + person(100, 236, 0.85, JAMES) + shards(71, 180, 204, 10, 40) },
    village: { img: 'village', fg: () => GROUND + BANNER(300, 120) + person(210, 238, 0.85, JAMES) + cat(228, 240, 0.6) },
    ridge: { img: 'mountain', dark: 0.12, fg: () => sun(70, 60, 14, C.ember, 0.3) + GROUND + person(110, 240, 0.8, JAMES) + cat(128, 228, 0.6) },
    collectors: { img: 'village', fg: () => sun(150, 40, 16) + GROUND + BANNER(330, 110) + person(130, 232, 1.15, { ...SECT, coat: '#6e1c25', sword: true }) + person(180, 228, 0.95, SECT) + person(84, 230, 0.95, SECT) + person(52, 232, 0.9, SECT) + person(270, 238, 1, JAMES) + cat(292, 238, 0.6) },
};
/** Close-ups drawn as realistic portraits (no ink wobble, true colours), over a faint painted backdrop. */
const PORTRAITS = { mei_lin: { img: 'peaks', draw: meiPortrait }, yuki_close: { img: 'peaks', draw: yukiPortrait } };
export const BG_IMAGES = ['forest', 'peaks', 'cliffs', 'pine', 'village', 'mountain'];
const bgImage = (img, opacity = 1) => `<image href="art/bg/${img}.jpg" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}"/>`;

/** SVG markup for a scene's art key (unknown keys get a quiet forest). */
export function sceneArt(key) {
    const id = String(key || 'x').replace(/\W/g, '');
    const open = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${id.replace(/_/g, ' ')}" preserveAspectRatio="xMidYMid slice">`;
    if (PORTRAITS[key]) {
        const pt = PORTRAITS[key];
        return `${open}${pt.draw(`p${id}`)}</svg>`;
    }
    if (STYLE === 'clamp') {
        const K = '#111010';
        const Wt = '#fbfaf7';
        const flat = (h) => {
            const k = h.toLowerCase();
            if (KEEP.includes(k)) return k;
            const [r, g, b] = hex2rgb(k);
            if (r > g + 55 && r > b + 45) return '#a02c2c';
            return lum(k) < 0.36 ? K : Wt;
        };
        const raw = (SCENES[key] || SCENES.forest_dawn)();
        const body = raw
            .replace(/<stop [^>]*>/g, (m) => m) // gradients keep their stops (mapped below)
            .replace(/#[0-9a-fA-F]{6}\b/g, (h) => flat(h))
            // every filled shape gets a clean black outline (not soft mist, not the screentone)
            .replace(/<(path|ellipse|circle|rect)\b(?![^>]*\b(stroke|filter)=)(?![^>]*width="400")/g, `<$1 stroke="${K}" stroke-width="0.7" stroke-linejoin="round"`)
            .replace(/opacity="0\.\d+"/g, (m) => (Number(m.slice(9, -1)) < 0.3 ? 'opacity="0"' : m));
        return `${open}${FILTERS}${shadeDefs('cl')}<rect width="${W}" height="${H}" fill="${Wt}"/>${body}${darkEdges('cl')}</svg>`
            .replace(/id="(sk|vg|gr|ink|bl|sh|gw|cldh|clvg|tl\d+)"/g, `id="$1-${id}"`).replace(/url\(#(sk|vg|gr|ink|bl|sh|gw|cldh|clvg|tl\d+)\)/g, `url(#$1-${id})`);
    }
    const painted = PAINTED[key];
    const raw = painted ? painted.fg() : (SCENES[key] || SCENES.forest_dawn)();
    const body = raw
        .replace(/fill="(#d9673a|#f1c26a)" opacity="0\.(0\d|1\d)"/g, 'fill="#fffaf0" opacity="0.45" filter="url(#bl)"')
        .replace(/#[0-9a-fA-F]{6}\b/g, (h) => inkOf(h));
    const base = painted
        ? bgImage(painted.img) + `<rect width="${W}" height="${H}" fill="#ece8df" opacity="${painted.img === 'forest' || painted.img === 'cliffs' ? 0.3 : 0.12}"/>` + (painted.dark ? `<rect width="${W}" height="${H}" fill="#1e1c1a" opacity="${painted.dark}"/>` : '')
        : '';
    return `${open}${FILTERS}<rect width="${W}" height="${H}" fill="#ece8df"/>${base}<g filter="url(#ink)">${body}</g>${vignette}${grain}</svg>`
        .replace(/id="(sk|vg|gr|ink|bl|sh|gw|tl\d+)"/g, `id="$1-${id}"`).replace(/url\(#(sk|vg|gr|ink|bl|sh|gw|tl\d+)\)/g, `url(#$1-${id})`);
}
export const ART_KEYS = Object.keys(SCENES);
