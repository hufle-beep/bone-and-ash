/**
 * Figures and close-ups, redrawn from scratch after the CLAMP references (xxxHolic): very tall slender figures
 * (about nine heads), sharp narrow faces, heavy-lidded eyes, hair as long black ribbons with white strand lines,
 * robes and coats that flow and trail, cloud and moon motifs, smoke and butterflies.
 * Palette: black, white, greys, red. Unit space for a figure: feet at 0, crown at about -100.
 */
const f = (n) => Math.round(n * 100) / 100;
export const K = '#111010';
export const W = '#fbfaf7';
export const G1 = '#8c8781';
export const G2 = '#c8c3bb';
export const G3 = '#55514d';
export const RED = '#a02c2c';
export const DARKRED = '#7a1d24';
export const GOLD = '#e2bd45';
export const KEEP2 = [K, W, G1, G2, G3, RED, DARKRED, GOLD, '#b48a1c', '#f0e9dc'];

function rng(seed) {
    let x = seed >>> 0 || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 100000) / 100000; };
}
const st = (w, c = K) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/** A cloud curl motif: spiral plus a long tail. */
export function curl(x, y, r, color = G2, w = 0.6, dir = 1) {
    const X = (n) => f(x + dir * n);
    return `<path d="M${X(r)} ${f(y)} A${f(r)} ${f(r)} 0 1 ${dir > 0 ? 0 : 1} ${X(0)} ${f(y + r)} A${f(r * 0.55)} ${f(r * 0.55)} 0 1 ${dir > 0 ? 0 : 1} ${X(r * 0.28)} ${f(y + r * 0.2)} M${X(r)} ${f(y)} C${X(r * 2)} ${f(y + r * 0.7)} ${X(r * 3)} ${f(y - r * 0.3)} ${X(r * 4.2)} ${f(y + r * 0.2)}" ${st(w, color)} fill="none"/>`;
}
export function crescent(cx, cy, r, color = RED) {
    return `<path d="M${f(cx)} ${f(cy - r)} A${f(r)} ${f(r)} 0 1 0 ${f(cx)} ${f(cy + r)} A${f(r * 0.76)} ${f(r)} 0 1 1 ${f(cx)} ${f(cy - r)} Z" fill="${color}" stroke="none"/>`;
}
/** Smoke ribbon: grey band with a white core and fine edges, curling at the end. */
export function smoke(pts, w = 6) {
    const [a, b, c, d] = pts;
    const P = (o) => `M${f(a[0])} ${f(a[1] + o)} C${f(b[0])} ${f(b[1] + o)} ${f(c[0])} ${f(c[1] + o)} ${f(d[0])} ${f(d[1] + o)}`;
    return `<path d="${P(0)}" ${st(w, G1)} fill="none"/><path d="${P(-w * 0.15)}" ${st(w * 0.3, W)} fill="none"/><path d="${P(-w / 2)} ${P(w / 2)}" ${st(0.5)} fill="none"/><path d="M${f(d[0])} ${f(d[1])} c5 -1 8 -8 3 -11 c-4 -2 -8 2 -5 5" ${st(0.7)} fill="none"/>`;
}
/** A black butterfly silhouette. */
export function butterfly(x, y, s = 1, rot = 0) {
    const k = (n) => f(n * s);
    const wing = (d) => `<path d="M0 -1 C${k(d * 3)} ${k(-10)} ${k(d * 12)} ${k(-19)} ${k(d * 20)} ${k(-17)} C${k(d * 22)} ${k(-12)} ${k(d * 19)} ${k(-8)} ${k(d * 17)} ${k(-5)} C${k(d * 18)} ${k(-2)} ${k(d * 14)} 0 0 0 Z M0 1 C${k(d * 8)} ${k(1)} ${k(d * 13)} ${k(4)} ${k(d * 12)} ${k(9)} C${k(d * 11)} ${k(12)} ${k(d * 8)} ${k(12)} ${k(d * 7)} ${k(18)} C${k(d * 5)} ${k(13)} ${k(d * 2)} ${k(9)} 0 1 Z" fill="${K}"/><circle cx="${k(d * 15)}" cy="${k(-13)}" r="${k(1.1)}" fill="${W}"/><circle cx="${k(d * 10)}" cy="${k(5)}" r="${k(0.8)}" fill="${W}"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${wing(-1)}${wing(1)}<path d="M0 -4 L0 7" ${st(k(1.3))}/></g>`;
}

/* ================================================================== figures ================================================ */

/** Long hair falling as ribbons from (x0..x1 at y0) down to around yEnd, swaying by `sway`. */
function hairRibbons(r, x0, x1, y0, yEnd, sway, n, spread = 1.4) {
    let fill = '';
    let lines = '';
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const sx = x0 + (x1 - x0) * t;
        const mid = (x0 + x1) / 2;
        const ex = mid + (sx - mid) * spread + sway + (r() - 0.5) * 3;
        const ey = yEnd - r() * (yEnd - y0) * 0.22;
        const bw = ((x1 - x0) / n) * (0.9 + r() * 0.5);
        const c1x = sx + sway * 0.05;
        const c2x = ex - sway * 0.35;
        const cy1 = y0 + (ey - y0) * 0.4;
        const cy2 = y0 + (ey - y0) * 0.75;
        fill += `M${f(sx - bw / 2)} ${f(y0)} C${f(c1x - bw / 2)} ${f(cy1)} ${f(c2x - bw * 0.4)} ${f(cy2)} ${f(ex)} ${f(ey)} C${f(c2x + bw * 0.4)} ${f(cy2)} ${f(c1x + bw / 2)} ${f(cy1)} ${f(sx + bw / 2)} ${f(y0)} Z `;
        if (i % 2 === 0) lines += `M${f(sx)} ${f(y0 + 3)} C${f(c1x)} ${f(cy1)} ${f(c2x)} ${f(cy2)} ${f(ex)} ${f(ey - 4)} `;
    }
    return `<path d="${fill}" fill="${K}" stroke="none"/><path d="${lines}" stroke="${W}" stroke-width="0.35" fill="none" opacity="0.85"/>`;
}

/** Small face at figure scale. kind: 'f' (woman, red lips), 'm' (man), 'old'. eyesShut for meditation. */
function smallFace(cy, kind = 'f', { glasses = false, shut = false, iris = DARKRED } = {}) {
    const ey = cy + 0.4;
    let s = '';
    if (shut) {
        s += `<path d="M-3.2 ${f(ey)} Q-2 ${f(ey + 0.7)} -0.8 ${f(ey)} M0.8 ${f(ey)} Q2 ${f(ey + 0.7)} 3.2 ${f(ey)}" ${st(0.45)} fill="none"/>`;
    } else {
        s += `<path d="M-3.4 ${f(ey - 0.2)} Q-2.1 ${f(ey - 1.2)} -0.7 ${f(ey - 0.3)} L-0.8 ${f(ey + 0.15)} Q-2.1 ${f(ey - 0.6)} -3.3 ${f(ey + 0.3)} Z M3.4 ${f(ey - 0.2)} Q2.1 ${f(ey - 1.2)} 0.7 ${f(ey - 0.3)} L0.8 ${f(ey + 0.15)} Q2.1 ${f(ey - 0.6)} 3.3 ${f(ey + 0.3)} Z" fill="${K}"/>`;
        s += `<circle cx="-1.9" cy="${f(ey + 0.25)}" r="0.42" fill="${iris}"/><circle cx="1.9" cy="${f(ey + 0.25)}" r="0.42" fill="${iris}"/>`;
    }
    s += `<path d="M-3.3 ${f(ey - 1.9)} Q-2 ${f(ey - 2.5)} -0.8 ${f(ey - 2)} M0.8 ${f(ey - 2)} Q2 ${f(ey - 2.5)} 3.3 ${f(ey - 1.9)}" ${st(kind === 'm' || kind === 'old' ? 0.4 : 0.25)} fill="none"/>`;
    s += `<path d="M0.3 ${f(ey + 1.6)} L0.6 ${f(ey + 2.6)}" ${st(0.25)}/>`;
    s += kind === 'f' ? `<path d="M-0.8 ${f(ey + 4.4)} Q0 ${f(ey + 4.9)} 0.9 ${f(ey + 4.3)}" ${st(0.55, RED)} fill="none"/>` : `<path d="M-0.7 ${f(ey + 4.4)} L0.8 ${f(ey + 4.3)}" ${st(0.3)}/>`;
    if (glasses) s += `<path d="M-3.9 ${f(ey - 1.1)} h3.1 v2.1 h-3.1 Z M0.8 ${f(ey - 1.1)} h3.1 v2.1 h-3.1 Z M-0.8 ${f(ey - 0.4)} h1.6" ${st(0.25)} fill="none"/>`;
    return s;
}
/** Narrow face with a sharp chin. Crown at top, chin at top + h. */
function headShape(top, h = 12, w = 4.1) {
    const cy = top + h * 0.48;
    return `M${-w} ${f(cy)} C${-w} ${f(top + 1)} ${f(-w * 0.5)} ${f(top)} 0 ${f(top)} C${f(w * 0.5)} ${f(top)} ${w} ${f(top + 1)} ${w} ${f(cy)} C${f(w * 0.95)} ${f(top + h * 0.72)} ${f(w * 0.5)} ${f(top + h * 0.9)} 0 ${f(top + h)} C${f(-w * 0.5)} ${f(top + h * 0.9)} ${f(-w * 0.95)} ${f(top + h * 0.72)} ${-w} ${f(cy)} Z`;
}
/** A long-fingered hand hanging down from (x, y). */
function hand(x, y, d = 1, s = 1) {
    const k = (n) => f(n * s);
    return `<path d="M${f(x - k(1.3))} ${y} C${f(x - k(1.6))} ${f(y + k(2.4))} ${f(x - k(1.2))} ${f(y + k(4.6))} ${f(x - k(0.6 * d))} ${f(y + k(6.4))} L${f(x + k(0.1))} ${f(y + k(6.6))} C${f(x + k(0.8))} ${f(y + k(4.8))} ${f(x + k(1.4))} ${f(y + k(2.4))} ${f(x + k(1.3))} ${y} Z" fill="${W}" ${st(0.35)}/><path d="M${f(x - k(0.2))} ${f(y + k(3))} L${f(x - k(0.4 * d))} ${f(y + k(6))}" ${st(0.2)}/>`;
}

/**
 * A full figure. kind: 'mei' | 'woman' | 'mother' | 'james' | 'sect' | 'lu' | 'man' | 'thug' | 'elder'.
 * opts: face (−1 faces left), sway (hair/robe drift), sword, spear, sit (James only), shut (eyes closed).
 */
export function figure(kind, x, y, s = 1, opts = {}) {
    const { face = 1, sway = -6, sword = false, spear = false, sit = false, shut = false } = opts;
    if (sit) {
        // seated: the standing figure from the waist up, lowered onto crossed legs and a spread coat
        const cid = `sit${Math.round(x)}${Math.round(y)}${kind.length}`;
        const upper = figure(kind, 0, 0, 1, { ...opts, sit: false, face: 1 }).replace(/^<g transform="[^"]*">/, '').replace(/<\/g>$/, '');
        const coat = kind === 'mei' ? '#111010' : W;
        const legs = `<path d="M-24 -1 C-22 -9 -13 -14 0 -13 C13 -14 22 -9 24 -1 Q0 2.4 -24 -1 Z" fill="${coat}" ${st(0.7)}/><path d="M-16 -5 C-7 -10 7 -10 16 -5" ${st(0.6)} fill="none"/><ellipse cx="0" cy="0.6" rx="26" ry="1.6" fill="${K}" opacity="0.4"/>`;
        return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})">${legs}<clipPath id="${cid}"><rect x="-40" y="-140" width="80" height="88"/></clipPath><g transform="translate(0 40)"><g clip-path="url(#${cid})">${upper}</g></g></g>`;
    }
    if (kind === 'ya') return yaFigure(x, y, s, opts);
    const r = rng(kind.length * 97 + Math.round(x * 3) + Math.round(y));
    let back = '';
    let body = '';
    let front = '';
    const female = kind === 'mei' || kind === 'woman' || kind === 'mother';
    const robed = female || kind === 'sect' || kind === 'lu' || kind === 'elder' || kind === 'shen';
    const H = female ? 100 : kind === 'shen' ? 110 : 104; // height in units
    const top = -H;
    const headH = 11.5;
    const chin = top + headH;
    const sh = female ? 8 : 10; // half shoulder width

    // ---------------- hair behind ----------------
    if (kind === 'mei') {
        back += `<path d="M-6 ${top + 4} C-11 ${top + 18} -12 ${top + 40} -15 -30 C-16 -18 -14 -8 -10 -4 L9 -10 C12 -30 10 ${top + 40} 6 ${top + 4} Z" fill="${K}"/>`;
        back += hairRibbons(r, -9, 8, top + 20, -2, sway, 12, 1.6);
    } else if (kind === 'lu' || kind === 'shen') {
        back += `<path d="M-5 ${top + 4} C-9 ${top + 20} -10 ${top + 36} -11 -46 L9 -48 C9 ${top + 36} 8 ${top + 20} 5 ${top + 4} Z" fill="${K}"/>` + hairRibbons(r, -8, 8, top + 22, -40, sway, 9, 1.4);
    } else if (kind === 'sect') {
        back += `<path d="M0 ${top - 3} C-3 ${top + 12} -5 ${top + 30} -6 ${top + 46}" ${st(2.6)} fill="none"/>` + `<path d="M0 ${top - 3} C-2 ${top + 12} -4 ${top + 30} -5 ${top + 46}" ${st(0.3, W)} fill="none"/>`;
    } else if (kind === 'woman' || kind === 'mother') {
        back += `<ellipse cx="0" cy="${top + 1}" rx="3.8" ry="3" fill="${K}"/>`;
    }
    if (sword) back += `<path d="M-9 ${top + 6} L9 ${top + 50}" ${st(1.4)}/><path d="M-9 ${top + 6} L-7.6 ${top + 10}" ${st(1.8, RED)}/><path d="M-8.4 ${top + 12} L-5.4 ${top + 10.6}" ${st(2)}/>`;

    // ---------------- body ----------------
    if (robed) {
        const fill = kind === 'mei' || kind === 'shen' ? K : kind === 'sect' ? RED : kind === 'lu' ? DARKRED : kind === 'elder' ? G1 : G3;
        const trail = female ? -24 : kind === 'elder' ? -14 : -18;
        const robe = `M${-sh} ${top + 17} C${-sh - 1} ${top + 30} ${-sh + 2} ${top + 40} ${-sh + 2.5} ${top + 46} C${-sh} -40 ${-sh - 4} -16 ${-sh - 7} -1 C${trail + 6} -0.4 ${trail + 2} 0.6 ${trail} 1.6 C${trail + 10} 2.4 4 1.6 ${sh + 5} 0 C${sh + 3} -18 ${sh} -40 ${sh - 2} ${top + 46} C${sh - 1.5} ${top + 40} ${sh + 1} ${top + 30} ${sh} ${top + 17} Q0 ${top + 14.5} ${-sh} ${top + 17} Z`;
        body += `<path d="${robe}" fill="${fill}" ${st(0.7)}/>`;
        // folds
        body += `<path d="M-2 ${top + 50} C-3.4 -36 -6 -18 -9 -1 M2.4 ${top + 50} C3.4 -34 5 -16 7 0 M0 ${top + 50} L-0.6 0.6" ${st(0.4, fill === K ? G3 : K)} fill="none"/>`;
        // motifs
        if (kind === 'mei') body += curl(-7, -26, 2.4, G2, 0.6) + curl(1, -14, 3, G2, 0.6, -1) + curl(-11, -6, 2, G2, 0.5) + curl(4, -38, 1.8, G2, 0.5) + crescent(5.6, -10, 4.2);
        if (kind === 'sect' || kind === 'lu') body += `<path d="M${-sh - 6} -2 C-6 -4 4 -4 ${sh + 4} -1.2" ${st(1.4, K)} fill="none"/>` + curl(-6, -12, 2, K, 0.5);
        if (kind === 'elder') body += curl(-5, -20, 2, W, 0.4) + curl(3, -10, 2.2, W, 0.4, -1);
        if (kind === 'shen') body += `<path d="M${-sh - 7} -1 C-8 -4 4 -4 ${sh + 5} 0" ${st(2, RED)} fill="none"/><path d="M${-sh - 6.6} -4 C-8 -7 4 -7 ${sh + 4.6} -3" ${st(0.6, RED)} fill="none"/>` + curl(-7, -24, 3, RED, 0.8) + curl(2, -12, 3.4, RED, 0.8, -1) + curl(-3, -40, 2.4, RED, 0.7) + `<path d="M-1 ${top + 46} L-1.4 -2 M1.4 ${top + 46} L1.8 -2" ${st(0.8, RED)}/>`;
        // crossed collar: white inner band, red under-collar for Mei
        body += `<path d="M-2.8 ${top + 15.6} L2.6 ${top + 33} L4.4 ${top + 31.6} L-0.6 ${top + 15.2} Z" fill="${W}" ${st(0.4)}/><path d="M2.8 ${top + 15.6} L0.4 ${top + 22} L1.6 ${top + 23.4} L4.4 ${top + 16.2} Z" fill="${W}" ${st(0.4)}/>`;
        if (kind === 'mei') body += `<path d="M-3.6 ${top + 16.2} L2 ${top + 33.6}" ${st(0.8, RED)}/>`;
        // sash
        const sash = kind === 'mei' || kind === 'shen' ? RED : kind === 'sect' || kind === 'lu' ? K : kind === 'elder' ? G3 : K;
        body += `<path d="M${-sh + 2} ${top + 36} Q0 ${top + 35} ${sh - 2} ${top + 36} L${sh - 2.2} ${top + 42} Q0 ${top + 41} ${-sh + 2.2} ${top + 42} Z" fill="${sash}" ${st(0.45)}/>`;
        if (kind === 'mei') body += `<path d="M0 ${top + 36.6} L2.2 ${top + 39} L0 ${top + 41.4} L-2.2 ${top + 39} Z" fill="${W}" ${st(0.3)}/>` + [-1, 0, 1].map((i) => `<path d="M${i} ${top + 42} C${i * 1.4} ${top + 52} ${i * 2 - 1} ${top + 60} ${i * 2.4 - 2} ${top + 70}" ${st(0.6, RED)} fill="none"/>`).join('');
        if (kind === 'sect' || kind === 'lu') body += `<path d="M1.6 ${top + 42} C2 ${top + 52} 1.4 ${top + 58} 2.2 ${top + 66} M3 ${top + 42} C3.6 ${top + 50} 4 ${top + 56} 4.6 ${top + 62}" ${st(0.7)} fill="none"/>`;
        // wide hanging sleeves, hands
        for (const d of [-1, 1]) {
            const X = (n) => f(d * n);
            const sb = kind === 'shen' ? 86 : 64; // Shen's sleeves sweep almost to the ground
            const sl = `M${X(sh - 0.6)} ${top + 16.6} C${X(sh + 4)} ${top + 20} ${X(sh + 6)} ${top + 30} ${X(sh + 7)} ${top + 44} L${X(sh + 8.5 + (kind === 'shen' ? 3 : 0))} ${top + sb} Q${X(sh + 4)} ${top + sb + 3.5} ${X(sh)} ${top + sb} L${X(sh - 0.6)} ${top + 46} C${X(sh - 1.6)} ${top + 36} ${X(sh - 2)} ${top + 28} ${X(sh - 3)} ${top + 22} Z`;
            body += `<path d="${sl}" fill="${fill}" ${st(0.6)}/>`;
            body += `<path d="M${X(sh + 8.5 + (kind === 'shen' ? 3 : 0))} ${top + sb} Q${X(sh + 4)} ${top + sb + 3.5} ${X(sh)} ${top + sb}" ${st(kind === 'shen' ? 1.4 : 0.7, kind === 'mei' || kind === 'shen' ? RED : W)} fill="none"/>`;
            if (kind === 'shen') body += curl(d * (sh + 4) - 1.5, top + 66, 2, RED, 0.6, d);
            if (kind === 'mei') body += curl(d * (sh + 3) - 1.5, top + 50, 1.5, G2, 0.5, d);
            if (kind !== 'shen') body += hand(d * (sh + 3.4), top + 64.6, d, 1);
        }
        if (kind === 'shen') body += `<g transform="translate(${sh + 4} ${top + 40}) rotate(-30)"><path d="M0 0 L-9 -12 A15 15 0 0 1 9 -12 Z" fill="${RED}" ${st(0.5)}/><path d="M0 0 L-6 -12 M0 0 L-3 -13 M0 0 L0 -13.4 M0 0 L3 -13 M0 0 L6 -12" ${st(0.3)}/></g>`;
        if (kind === 'elder') body += `<path d="M${sh + 4} ${top + 62} L${sh + 9} 0" ${st(1.2, G3)}/>`;
    } else if (kind === 'james') {
        if (!sit) {
            // trousers, shoes
            body += `<path d="M-4.6 -50 L-4 -1 L-1.2 -1 L-0.5 -50 Z M4.6 -50 L4.4 -1 L1.4 -1 L0.5 -50 Z" fill="${K}" ${st(0.4)}/>`;
            body += `<path d="M-4.6 0 Q-5 -1.6 -2.4 -1.6 L-0.8 -1.3 L-0.8 0 Z M5 0 Q5.2 -1.6 2.6 -1.6 L1 -1.3 L1 0 Z" fill="${K}"/>`;
            // black inner jacket with a high collar
            body += `<path d="M${-sh + 2.4} ${top + 17} L-5.6 -50 L5.6 -50 L${sh - 2.4} ${top + 17} Q0 ${top + 15} ${-sh + 2.4} ${top + 17} Z" fill="${K}" ${st(0.4)}/>`;
            // the long white coat, open, flaring and trailing behind with the wind
            const coat = (d) => { const X = (n) => f(d * n); return `M${X(sh)} ${top + 17.4} C${X(sh + 1)} ${top + 40} ${X(sh + 2)} ${top + 62} ${X(sh + 4.5)} -20 C${X(sh + 6)} -18 ${X(sh + 8)} -17 ${X(sh + 10)} -18.4 C${X(sh + 6)} -18 ${X(3.6)} -18 ${X(2.6)} -19 L${X(1.6)} ${top + 48} L${X(3)} ${top + 18} Z`; };
            body += `<path d="${coat(-1)}" fill="${W}" ${st(0.6)}/><path d="${coat(1)}" fill="${W}" ${st(0.6)}/>`;
            body += `<path d="M-3 ${top + 18} L-5.6 ${top + 28} L-2.6 ${top + 30} M3 ${top + 18} L5.6 ${top + 28} L2.6 ${top + 30} M-${sh - 1} ${top + 50} C-${sh} -36 -${sh + 1} -28 -${sh + 3} -21 M${sh - 1} ${top + 48} C${sh} -36 ${sh + 1.4} -28 ${sh + 3.4} -21" ${st(0.4)} fill="none"/>`;
            body += `<path d="M-1.8 ${top + 15.8} L-1.8 ${top + 18.4} L1.8 ${top + 18.4} L1.8 ${top + 15.8}" fill="${K}" ${st(0.3)}/>`;
            // arms: left hanging, right hand in the coat pocket
            body += `<path d="M${-sh} ${top + 17.6} C${-sh - 2.4} ${top + 30} ${-sh - 2.8} ${top + 44} ${-sh - 2.6} ${top + 56} L${-sh + 0.2} ${top + 56} C${-sh + 0.2} ${top + 44} ${-sh + 0.6} ${top + 32} ${-sh + 1.4} ${top + 24} Z" fill="${W}" ${st(0.5)}/>` + hand(-sh - 1.2, top + 56, -1, 1.05);
            body += `<path d="M${sh} ${top + 17.6} C${sh + 2.4} ${top + 28} ${sh + 2.6} ${top + 38} ${sh + 1.4} ${top + 50} L${sh - 1.4} ${top + 50} C${sh - 0.6} ${top + 40} ${sh - 0.2} ${top + 30} ${sh - 1.4} ${top + 24} Z" fill="${W}" ${st(0.5)}/><path d="M${sh - 2.6} ${top + 49} L${sh + 2.4} ${top + 49}" ${st(0.5)}/>`;
        } else {
            // seated, legs crossed, coat spread around him
            body += `<path d="M-22 -1 C-20 -8 -12 -12 0 -11 C12 -12 20 -8 22 -1 Q0 2 -22 -1 Z" fill="${W}" ${st(0.6)}/><path d="M-14 -4 C-6 -8 6 -8 14 -4" ${st(0.5)} fill="none"/>`;
            body += `<path d="M${-sh + 2.4} ${top + 17 + 46} L-5.6 -10 L5.6 -10 L${sh - 2.4} ${top + 63} Q0 ${top + 61} ${-sh + 2.4} ${top + 63} Z" fill="${K}" ${st(0.4)}/>`;
            body += `<path d="M${-sh} ${top + 63} C${-sh - 4} -24 ${-sh - 2} -14 -5 -10 L-2 -12 C-5 -18 ${-sh + 1} -26 ${-sh + 2} ${top + 66} Z M${sh} ${top + 63} C${sh + 4} -24 ${sh + 2} -14 5 -10 L2 -12 C5 -18 ${sh - 1} -26 ${sh - 2} ${top + 66} Z" fill="${W}" ${st(0.5)}/>`;
            body += `<ellipse cx="0" cy="-11" rx="3" ry="1.6" fill="${W}" ${st(0.35)}/>`;
        }
    } else {
        // villagers, hunters, thugs: short jacket, sash, wrapped trousers
        const jacket = kind === 'thug' ? G3 : G1;
        body += `<path d="M-5 -46 L-4.6 -1 L-1.2 -1 L-0.6 -46 Z M5 -46 L4.8 -1 L1.4 -1 L0.6 -46 Z" fill="${kind === 'thug' ? K : G3}" ${st(0.4)}/>`;
        body += `<path d="M-4.8 -14 L-1.2 -13 M-4.8 -10 L-1.2 -9 M-4.8 -6 L-1.2 -5 M1.4 -13 L4.8 -14 M1.4 -9 L4.8 -10 M1.4 -5 L4.8 -6" ${st(0.3, W)}/>`;
        body += `<path d="M-5 0 Q-5.4 -1.6 -2.6 -1.6 L-1 -1.3 L-1 0 Z M5.4 0 Q5.6 -1.6 2.8 -1.6 L1.2 -1.3 L1.2 0 Z" fill="${K}"/>`;
        const top2 = top + 17;
        body += `<path d="M${-sh} ${top2} C${-sh - 1} ${top2 + 16} ${-sh} ${top2 + 30} ${-sh - 1.6} ${top2 + 44} Q0 ${top2 + 46} ${sh + 1.6} ${top2 + 44} C${sh} ${top2 + 30} ${sh + 1} ${top2 + 16} ${sh} ${top2} Q0 ${top2 - 2.4} ${-sh} ${top2} Z" fill="${jacket}" ${st(0.6)}/>`;
        body += `<path d="M-3 ${top2 - 1.4} L4.4 ${top2 + 20} M3 ${top2 - 1.4} L0.6 ${top2 + 6}" ${st(0.5)}/><path d="M${-sh} ${top2 + 24} Q0 ${top2 + 25} ${sh} ${top2 + 24} L${sh} ${top2 + 27} Q0 ${top2 + 28} ${-sh} ${top2 + 27} Z" fill="${K}"/>`;
        for (const d of [-1, 1]) {
            const X = (n) => f(d * n);
            body += `<path d="M${X(sh)} ${top2} C${X(sh + 2.2)} ${top2 + 14} ${X(sh + 2.6)} ${top2 + 26} ${X(sh + 2.4)} ${top2 + 38} L${X(sh - 0.2)} ${top2 + 38} C${X(sh - 0.2)} ${top2 + 26} ${X(sh - 0.6)} ${top2 + 14} ${X(sh - 1.6)} ${top2 + 6} Z" fill="${jacket}" ${st(0.5)}/>` + hand(d * (sh + 1.1), top2 + 38, d, 1);
        }
        if (spear) body += `<path d="M${sh + 2} ${top2 + 44} L${sh + 6} ${top - 10}" ${st(0.9, G3)}/><path d="M${sh + 6} ${top - 10} l-1.6 -7 l3.4 1.2 Z" fill="${W}" ${st(0.4)}/>`;
    }

    // ---------------- neck, head, face ----------------
    front += `<path d="M-1.4 ${chin - 0.6} L-1.6 ${top + 16.6} L1.6 ${top + 16.6} L1.4 ${chin - 0.6} Z" fill="${W}" ${st(0.4)}/>`;
    front += `<path d="${headShape(top, headH, female ? 3.9 : 4.2)}" fill="${W}" ${st(0.5)}/>`;
    const fk = female ? 'f' : kind === 'elder' ? 'old' : 'm';
    front += smallFace(top + 5.6, fk, { glasses: kind === 'james', shut: shut || kind === 'elder', iris: kind === 'james' ? K : DARKRED });

    // ---------------- hair in front ----------------
    if (kind === 'mei') {
        front += `<path d="M-4.3 ${top + 5.4} C-4.8 ${top - 1} -2.4 ${top - 3} 0 ${top - 3} C2.4 ${top - 3} 4.8 ${top - 1} 4.3 ${top + 5.4} L4.3 ${top + 4} L-4.3 ${top + 4} Z" fill="${K}"/>`;
        front += `<path d="M-4.4 ${top + 3} L-4.3 ${top + 22} L-2.8 ${top + 22} L-2.9 ${top + 4.2} Z M4.4 ${top + 3} L4.3 ${top + 22} L2.8 ${top + 22} L2.9 ${top + 4.2} Z" fill="${K}"/>`;
        front += `<path d="M-2.6 ${top - 1.6} Q0 ${top - 2.8} 2.6 ${top - 1.6}" ${st(0.5, W)} fill="none" stroke-dasharray="1 0.6"/>`;
        // long front locks over the shoulders and down the robe
        front += [[-3.6, -3, 0.9], [-3, -6, 0.6], [3.6, 3, 0.9], [3, 1, 0.6]].map(([x0, sw, w]) => `<path d="M${x0} ${top + 20} C${f(x0 + sw * 0.3)} ${top + 34} ${f(x0 + sw * 1.4)} ${top + 50} ${f(x0 + sw * 2.4)} ${top + 66}" ${st(w)} fill="none"/>`).join('');
        // red knot with tassels, white plum blossoms
        front += `<path d="M-5.6 ${top - 0.6} L-4 ${top + 1} L-5.6 ${top + 2.6} L-7.2 ${top + 1} Z" fill="${RED}"/><circle cx="-7.4" cy="${top - 0.4}" r="1" fill="none" ${st(0.5, RED)}/><circle cx="-4" cy="${top - 1.4}" r="1" fill="none" ${st(0.5, RED)}/>`;
        front += [0, 1, 2].map((i) => `<path d="M${-5.8 + i * 0.5} ${top + 2.6} L${-6.4 + i * 0.8} ${top + 14}" ${st(0.35, RED)}/>`).join('');
        front += [[-2.4, top - 2.6], [1.2, top - 3.4]].map(([px, py]) => `<g transform="translate(${px} ${py})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f(Math.cos((a - 90) * Math.PI / 180) * 0.9)}" cy="${f(Math.sin((a - 90) * Math.PI / 180) * 0.9)}" r="0.7" fill="${W}" ${st(0.15)}/>`).join('')}<circle r="0.35" fill="${RED}"/></g>`).join('');
    } else if (kind === 'james') {
        front += `<path d="M-4.6 ${top + 6} C-5.6 ${top} -3 ${top - 3.6} 0.4 ${top - 3.4} C3.6 ${top - 3.4} 5.6 ${top - 0.4} 4.6 ${top + 6} L4 ${top + 3.4} L3 ${top + 5.4} L2 ${top + 2.6} L0.8 ${top + 5} L-0.6 ${top + 2.4} L-1.8 ${top + 5.2} L-2.8 ${top + 2.8} L-3.8 ${top + 5} Z" fill="${K}"/>`;
        front += `<path d="M-4.4 ${top + 1} l-2.6 1.8 M4.6 ${top + 0.6} l2.4 1.4 M-1.4 ${top - 3.2} l-1.2 -2.2 M1.8 ${top - 3.2} l1.8 -1.8 M-4.4 ${top + 5} l-0.6 3.6 M4.4 ${top + 5} l0.6 3.4" ${st(0.8)}/>`;
        front += `<path d="M-2 ${top - 2} Q0.4 ${top - 3} 2.6 ${top - 2}" ${st(0.35, W)} fill="none"/>`;
    } else if (kind === 'sect' || kind === 'lu' || kind === 'shen') {
        front += `<path d="M-4.4 ${top + 5} C-5 ${top - 0.6} -2.4 ${top - 3} 0 ${top - 3} C2.4 ${top - 3} 5 ${top - 0.6} 4.4 ${top + 5} C3.6 ${top + 1.4} 2 ${top - 0.2} 0 ${top - 0.4} C-2 ${top - 0.2} -3.6 ${top + 1.4} -4.4 ${top + 5} Z" fill="${K}"/>`;
        front += `<path d="M-4.4 ${top + 4} C-4.8 ${top + 10} -4.6 ${top + 16} -5.2 ${top + 22} M4.4 ${top + 4} C4.8 ${top + 10} 4.6 ${top + 16} 5.2 ${top + 22}" ${st(1)} fill="none"/>`;
        if (kind === 'sect') front += `<path d="M-1.6 ${top - 6.4} L1.6 ${top - 6.4} L2 ${top - 2.4} L-2 ${top - 2.4} Z" fill="${RED}" ${st(0.35)}/><path d="M-3.4 ${top - 4.4} L3.4 ${top - 4.4}" ${st(0.5)}/>`;
        else if (kind === 'shen') front += `<path d="M-3.4 ${top - 2.4} L-2.6 ${top - 13} L0 ${top - 9} L2.6 ${top - 13} L3.4 ${top - 2.4} Z" fill="${K}" ${st(0.4)}/><path d="M-6 ${top - 6} L6 ${top - 6}" ${st(0.6, RED)}/><circle cx="0" cy="${top - 6}" r="1.1" fill="${RED}"/><path d="M-6 ${top - 6} L-7 ${top + 6} M6 ${top - 6} L7 ${top + 6}" ${st(0.3, RED)}/>`;
        else front += `<path d="M-3 ${top - 2.6} L0 ${top - 7} L3 ${top - 2.6}" fill="${K}" ${st(0.4)}/><circle cx="0" cy="${top - 5}" r="0.8" fill="${RED}"/>`;
    } else if (kind === 'woman' || kind === 'mother') {
        front += `<path d="M-4.2 ${top + 5} C-4.8 ${top - 0.6} -2.4 ${top - 2.8} 0 ${top - 2.8} C2.4 ${top - 2.8} 4.8 ${top - 0.6} 4.2 ${top + 5} C3.4 ${top + 1.6} 2 ${top} 0 ${top - 0.2} C-2 ${top} -3.4 ${top + 1.6} -4.2 ${top + 5} Z" fill="${kind === 'mother' ? G3 : K}"/><path d="M-3.6 ${top - 1} L3.8 ${top + 0.6}" ${st(0.4)}/>`;
    } else if (kind === 'elder') {
        front += `<path d="M-2.4 ${top + 9.4} C-2.6 ${top + 18} -1 ${top + 24} 0 ${top + 28} C1 ${top + 24} 2.6 ${top + 18} 2.4 ${top + 9.4} Q0 ${top + 10.6} -2.4 ${top + 9.4} Z" fill="${W}" ${st(0.35)}/><path d="M-1 ${top + 12} L-0.4 ${top + 24} M1 ${top + 12} L0.4 ${top + 23}" ${st(0.2)}/>`;
        front += `<path d="M-3.4 ${top + 3.8} L-0.8 ${top + 3.4} M3.4 ${top + 3.8} L0.8 ${top + 3.4}" ${st(0.8, G2)}/><ellipse cx="0" cy="${top - 1.4}" rx="1.4" ry="1.2" fill="${W}" ${st(0.3)}/>`;
    } else {
        front += `<path d="M-4.2 ${top + 4.6} C-4.8 ${top - 0.6} -2.4 ${top - 2.6} 0 ${top - 2.6} C2.4 ${top - 2.6} 4.8 ${top - 0.6} 4.2 ${top + 4.6} C3.4 ${top + 1.2} 2 ${top - 0.2} 0 ${top - 0.4} C-2 ${top - 0.2} -3.4 ${top + 1.2} -4.2 ${top + 4.6} Z" fill="${K}"/>`;
        if (kind === 'man') front += `<path d="M-4.4 ${top + 1.6} Q0 ${top + 0.4} 4.4 ${top + 1.6}" ${st(0.9, G2)} fill="none"/>`;
    }
    const shadow = `<ellipse cx="${f(sway * -0.3)}" cy="0.4" rx="${robed ? 18 : 9}" ry="1.4" fill="${K}" opacity="0.4"/>`;
    const lift = sit ? ` translate(0 ${-(-top - 63) * 0 })` : '';
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})${lift}">${sit ? '' : shadow}${back}${body}${front}</g>`;
}

/** Yuki at scene size: a slender white cat sitting, tall ears, long tail, gold almond eyes, red cord and knot. */
export function yuki(x, y, s = 1, face = 1) {
    let c = `<ellipse cx="2" cy="0.4" rx="11" ry="1.1" fill="${K}" opacity="0.4"/>`;
    c += `<path d="M6 -0.6 C15 -0.6 17 -10 12 -16 C10 -19 11 -23 14 -24" ${st(3.2)} fill="none"/><path d="M6 -0.6 C15 -0.6 17 -10 12 -16 C10 -19 11 -23 14 -24" ${st(2, W)} fill="none"/>`;
    c += `<path d="M-6.4 0 C-8.6 -7 -8 -15 -4.2 -20.6 L-3.6 -25 L4 -25 L4.6 -20.6 C8 -15 8.4 -7 6.4 0 Z" fill="${W}" ${st(0.6)}/>`;
    c += `<path d="M-2 -13 L-2.2 0 M2 -13 L2.2 0 M-3.6 -19 q1.6 2 3.6 1.4 q2 0.6 3.6 -1.4" ${st(0.4)} fill="none"/>`;
    c += `<path d="M-4.6 -30.6 L-5.4 -39 L-1.2 -33 Z M4.6 -30.6 L5.4 -39 L1.2 -33 Z" fill="${W}" ${st(0.5)}/><path d="M-4.1 -32 L-4.6 -37 L-2.2 -33.4 Z M4.1 -32 L4.6 -37 L2.2 -33.4 Z" fill="${G2}"/>`;
    c += `<path d="M-5 -28.6 C-5 -32.4 -2.6 -33.8 0 -33.8 C2.6 -33.8 5 -32.4 5 -28.6 C5 -26 3.4 -23.8 0 -23.2 C-3.4 -23.8 -5 -26 -5 -28.6 Z" fill="${W}" ${st(0.55)}/>`;
    c += `<path d="M-3.8 -28.6 Q-2.4 -30 -0.9 -28.9 Q-2.4 -27.9 -3.8 -28.6 Z M3.8 -28.6 Q2.4 -30 0.9 -28.9 Q2.4 -27.9 3.8 -28.6 Z" fill="${GOLD}" ${st(0.3)}/><path d="M-2.3 -29.5 L-2.3 -28.2 M2.3 -29.5 L2.3 -28.2" ${st(0.45)}/>`;
    c += `<path d="M-4 -29.4 L-0.7 -29.2 M4 -29.4 L0.7 -29.2" ${st(0.5)}/>`;
    c += `<path d="M-0.5 -26.6 L0.5 -26.6 L0 -26 Z" fill="${K}"/><path d="M-1 -25.2 Q0 -24.6 1 -25.2" ${st(0.3)} fill="none"/>`;
    c += `<path d="M-1.4 -26 L-8 -27.2 M-1.4 -25.6 L-7.6 -24.6 M1.4 -26 L8 -27.2 M1.4 -25.6 L7.6 -24.6" ${st(0.15)}/>`;
    c += `<path d="M-4 -23.4 Q0 -21.2 4 -23.4" ${st(0.9, RED)} fill="none"/><path d="M0 -22.6 L1 -21.4 L0 -20.2 L-1 -21.4 Z" fill="${RED}"/><path d="M-0.3 -20.2 L-0.6 -16.8 M0.3 -20.2 L0.6 -17" ${st(0.3, RED)}/>`;
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})">${c}</g>`;
}

/* ================================================================== close-ups ============================================== */

/** Mei Lin, three-quarter view, looking past the viewer. Drawn over the scene's painted backdrop. */
export function meiCloseUp(id = 'mc') {
    const r = rng(4711);
    const cx = 206;
    let s = '';
    s += smoke([[-10, 196], [60, 150], [110, 230], [160, 190]], 7) + smoke([[410, 70], [350, 30], [330, 120], [286, 96]], 6);
    s += butterfly(70, 70, 1.1, -16) + butterfly(342, 170, 1, 18) + butterfly(110, 30, 0.6, 8);
    // back hair: a great black fall, drifting left in ribbons
    s += `<path d="M${cx - 44} 70 C${cx - 50} 30 ${cx - 22} 8 ${cx + 6} 8 C${cx + 36} 8 ${cx + 54} 30 ${cx + 50} 74 C${cx + 56} 130 ${cx + 60} 190 ${cx + 66} 262 L${cx - 120} 262 C${cx - 90} 200 ${cx - 60} 140 ${cx - 44} 70 Z" fill="${K}"/>`;
    s += hairRibbons(r, cx - 40, cx + 10, 120, 262, -70, 14, 1.8);
    s += hairRibbons(r, cx + 20, cx + 50, 120, 262, -10, 7, 1.3);
    // robe: black, high crossed collar, grey clouds and a red crescent
    s += `<path d="M${cx - 100} 262 C${cx - 86} 212 ${cx - 50} 182 ${cx - 14} 172 L${cx + 22} 172 C${cx + 56} 184 ${cx + 88} 214 ${cx + 100} 262 Z" fill="${K}" ${st(1)}/>`;
    s += curl(cx - 70, 232, 8, G2, 1.4) + curl(cx + 30, 222, 7, G2, 1.4, -1) + curl(cx - 30, 250, 6, G2, 1.2) + crescent(cx + 66, 232, 18);
    s += `<path d="M${cx - 18} 171 L${cx + 14} 262 L${cx + 30} 262 L${cx - 4} 170 Z" fill="${W}" ${st(1)}/><path d="M${cx + 24} 172 L${cx + 6} 212 L${cx + 14} 218 L${cx + 36} 175 Z" fill="${W}" ${st(1)}/>`;
    s += `<path d="M${cx - 22} 172 L${cx + 8} 262" ${st(2.6, RED)}/>`;
    // neck
    s += `<path d="M${cx - 12} 128 C${cx - 12} 148 ${cx - 14} 162 ${cx - 20} 172 L${cx + 24} 172 C${cx + 16} 160 ${cx + 13} 146 ${cx + 13} 126 Z" fill="${W}" ${st(1)}/>`;
    s += `<path d="M${cx - 12} 136 C${cx - 4} 146 ${cx + 6} 146 ${cx + 13} 134 L${cx + 13} 150 C${cx + 6} 156 ${cx - 4} 156 ${cx - 12} 150 Z" fill="${G2}"/>`;
    // face, three-quarter: the far cheek narrower, a sharp chin set left of centre
    const face = `M${cx - 30} 72 C${cx - 31} 98 ${cx - 26} 116 ${cx - 14} 132 C${cx - 9} 138 ${cx - 6} 141 ${cx - 3} 141.5 C${cx + 4} 140 ${cx + 14} 132 ${cx + 24} 118 C${cx + 33} 104 ${cx + 36} 88 ${cx + 35} 70 Z`;
    s += `<path d="${face}" fill="${W}"/>`;
    s += `<clipPath id="${id}f"><path d="${face}"/></clipPath><g clip-path="url(#${id}f)"><path d="M${cx + 22} 70 C${cx + 30} 92 ${cx + 26} 116 ${cx + 8} 142 L${cx + 40} 142 L${cx + 40} 70 Z" fill="${G2}"/></g>`;
    s += `<path d="${face}" fill="none" ${st(1.2)}/>`;
    // eyes: heavy half-lids, long sweep, dark red irises, one clean highlight
    const eye = (ex, ey, w, h, far) => {
        const o = `M${ex - w} ${ey} C${ex - w * 0.5} ${ey - h * 0.5} ${ex + w * 0.4} ${ey - h * 0.6} ${ex + w} ${ey - h * 0.15} C${ex + w * 0.6} ${ey + h * 0.55} ${ex - w * 0.4} ${ey + h * 0.6} ${ex - w} ${ey} Z`;
        const cid = `${id}e${far ? 1 : 2}`;
        return `<clipPath id="${cid}"><path d="${o}"/></clipPath><path d="${o}" fill="${W}"/><g clip-path="url(#${cid})"><circle cx="${ex - w * 0.1}" cy="${ey + h * 0.15}" r="${h * 0.75}" fill="${DARKRED}"/><path d="M${ex - w} ${ey - h} L${ex + w} ${ey - h} L${ex + w} ${ey - h * 0.05} Q${ex} ${ey - h * 0.45} ${ex - w} ${ey + h * 0.05} Z" fill="${K}"/><circle cx="${ex - w * 0.1}" cy="${ey + h * 0.2}" r="${h * 0.32}" fill="${K}"/><circle cx="${ex - w * 0.32}" cy="${ey - h * 0.02}" r="${h * 0.16}" fill="${W}"/></g>`
            + `<path d="M${ex + w * 1.05} ${ey - h * 0.1} C${ex + w * 0.4} ${ey - h * 0.85} ${ex - w * 0.5} ${ey - h * 0.75} ${ex - w * 1.15} ${ey - h * 0.05} L${ex - w * 1.6} ${ey - h * 0.35} L${ex - w * 1.1} ${ey + h * 0.25} C${ex - w * 0.5} ${ey - h * 0.45} ${ex + w * 0.4} ${ey - h * 0.55} ${ex + w} ${ey + h * 0.05} Z" fill="${K}"/>`
            + `<path d="M${ex - w * 0.8} ${ey + h * 0.35} C${ex - w * 0.3} ${ey + h * 0.7} ${ex + w * 0.4} ${ey + h * 0.6} ${ex + w * 0.75} ${ey + h * 0.25}" ${st(0.6)} fill="none"/>`
            + `<path d="M${ex - w * 0.9} ${ey - h * 1.05} C${ex - w * 0.3} ${ey - h * 1.35} ${ex + w * 0.5} ${ey - h * 1.3} ${ex + w} ${ey - h * 0.85}" ${st(0.6)} fill="none"/>`;
    };
    s += eye(cx - 17, 97, 7.2, 6, true) + eye(cx + 15, 97, 9.2, 7, false);
    // brows: thin, long, high
    s += `<path d="M${cx - 27} 82 C${cx - 20} 79 ${cx - 13} 79 ${cx - 8} 81 M${cx + 4} 80.6 C${cx + 12} 77.6 ${cx + 22} 77.6 ${cx + 29} 80.4" ${st(0.9)} fill="none"/>`;
    // nose: a single line down the shadow side, a hint of a nostril
    s += `<path d="M${cx - 4} 100 C${cx - 5} 108 ${cx - 7} 113 ${cx - 6} 118 L${cx - 2} 118.6" ${st(0.8)} fill="none"/>`;
    // mouth: dark red, the corner lifted
    s += `<path d="M${cx - 12} 127 Q${cx - 7} 125 ${cx - 3} 126.4 Q${cx + 1} 125 ${cx + 5} 125.6 Q${cx} 128.6 ${cx - 4} 128.6 Q${cx - 8} 128.6 ${cx - 12} 127 Z" fill="${DARKRED}"/><path d="M${cx - 9} 128.8 Q${cx - 4} 132.4 ${cx + 2} 128.6 Z" fill="${RED}"/><path d="M${cx - 12} 127 Q${cx - 4} 129 ${cx + 5} 125.6 l2 -1.2" ${st(0.7)} fill="none"/>`;
    // blunt bangs to the brows, cut with strand lines; side locks to the collarbone
    s += `<path d="M${cx - 34} 84 C${cx - 38} 40 ${cx - 16} 18 ${cx + 6} 18 C${cx + 30} 18 ${cx + 44} 40 ${cx + 40} 84 L${cx + 40} 77 L${cx - 34} 78 Z" fill="${K}"/>`;
    s += `<path d="${Array.from({ length: 16 }, (_, i) => { const x = cx - 30 + i * 4.4; return `M${f(cx + (x - cx) * 0.3)} 24 Q${f(x)} 50 ${f(x + (r() - 0.5) * 2)} 76`; }).join(' ')}" ${st(0.5, W)} fill="none" opacity="0.9"/>`;
    s += `<path d="M${cx - 22} 32 Q${cx + 4} 22 ${cx + 30} 32" ${st(2.4, W)} fill="none" stroke-dasharray="5 3" opacity="0.85"/>`;
    s += `<path d="M${cx - 34} 74 C${cx - 38} 110 ${cx - 36} 150 ${cx - 32} 176 L${cx - 22} 174 C${cx - 24} 146 ${cx - 26} 110 ${cx - 26} 84 Z M${cx + 38} 72 C${cx + 44} 110 ${cx + 44} 150 ${cx + 40} 178 L${cx + 30} 176 C${cx + 34} 146 ${cx + 34} 110 ${cx + 30} 84 Z" fill="${K}"/>`;
    s += hairRibbons(r, cx - 34, cx - 22, 170, 262, -40, 6, 2) + hairRibbons(r, cx + 30, cx + 42, 170, 262, 14, 6, 1.6);
    // ornaments: a red knot with long tassels, plum blossoms, a step-shake pin with bead strings
    const kx = cx - 44;
    const ky = 46;
    s += `<g transform="translate(${kx} ${ky})">${[[-9, -2], [9, -2], [0, -11]].map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="3.4" fill="none" ${st(1.6, RED)}/>`).join('')}<path d="M0 -7 L7 0 L0 7 L-7 0 Z" fill="${RED}" ${st(0.6)}/><rect x="-3" y="7" width="6" height="3" fill="${K}"/></g>`;
    s += Array.from({ length: 7 }, (_, i) => `<path d="M${kx - 3 + i} ${ky + 10} C${kx - 3 + i * 1.2} ${ky + 40} ${kx - 4 + i * 1.3} ${ky + 64} ${kx - 6 + i * 1.6} ${ky + 92}" ${st(1, i % 2 ? RED : DARKRED)} fill="none"/>`).join('');
    const plum = (px, py, sc) => `<g transform="translate(${px} ${py}) scale(${sc})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f(Math.cos((a - 90) * Math.PI / 180) * 3.4)}" cy="${f(Math.sin((a - 90) * Math.PI / 180) * 3.4)}" r="2.8" fill="${W}" ${st(0.5)}/>`).join('')}<circle r="1.4" fill="${RED}"/></g>`;
    s += plum(cx - 30, 30, 1.1) + plum(cx - 20, 22, 0.8) + plum(cx - 36, 40, 0.7);
    s += `<path d="M${cx + 18} 24 L${cx + 66} 4" ${st(2.6)}/><path d="M${cx + 18} 24 L${cx + 66} 4" ${st(0.6, W)}/>` + plum(cx + 56, 8, 1.2);
    for (let i = 0; i < 5; i++) {
        const x = cx + 50 + i * 3.6;
        const len = 18 + i * 7;
        s += `<path d="M${x} 12 L${x + 1} ${12 + len}" ${st(0.5)}/>` + [0.4, 0.75, 1].map((t) => `<circle cx="${f(x + t)}" cy="${f(12 + len * t)}" r="${t === 1 ? 1.8 : 1}" fill="${t === 1 ? RED : W}" ${st(0.4)}/>`).join('');
    }
    return s;
}

/** Yuki, close: sitting tall, the head turned a little, long gold eyes half-lidded. */
export function yukiCloseUp(id = 'yc') {
    const cx = 200;
    let s = '';
    s += smoke([[-10, 210], [60, 170], [100, 240], [150, 210]], 7) + smoke([[410, 50], [350, 20], [330, 100], [282, 80]], 6);
    s += butterfly(80, 80, 1, -14) + butterfly(330, 160, 0.9, 16);
    // tail sweeping round the front
    s += `<path d="M${cx + 60} 250 C${cx + 110} 240 ${cx + 120} 196 ${cx + 96} 170 C${cx + 86} 160 ${cx + 92} 146 ${cx + 106} 142" ${st(16)} fill="none"/><path d="M${cx + 60} 250 C${cx + 110} 240 ${cx + 120} 196 ${cx + 96} 170 C${cx + 86} 160 ${cx + 92} 146 ${cx + 106} 142" ${st(13, W)} fill="none"/>`;
    // body: slender, chest high, a long elegant neck
    const body = `M${cx - 70} 262 C${cx - 70} 214 ${cx - 52} 172 ${cx - 30} 150 L${cx - 24} 118 L${cx + 26} 118 L${cx + 32} 150 C${cx + 56} 172 ${cx + 72} 214 ${cx + 72} 262 Z`;
    s += `<path d="${body}" fill="${W}" ${st(1.4)}/>`;
    s += `<clipPath id="${id}b"><path d="${body}"/></clipPath><g clip-path="url(#${id}b)"><path d="M${cx + 30} 140 C${cx + 50} 170 ${cx + 60} 210 ${cx + 54} 262 L${cx + 90} 262 L${cx + 90} 140 Z" fill="${G2}"/></g>`;
    s += `<path d="M${cx - 18} 160 l4 8 l3 -6 l4 9 l3 -6 l4 8 l3 -5 l4 7" ${st(0.9)} fill="none"/><path d="M${cx - 14} 200 L${cx - 16} 262 M${cx + 16} 200 L${cx + 18} 262" ${st(1)} fill="none"/>`;
    // red cord, knot and tassels
    s += `<path d="M${cx - 28} 128 Q${cx} 144 ${cx + 30} 128" ${st(2.4, RED)} fill="none"/><path d="M${cx} 138 L${cx + 6} 144 L${cx} 150 L${cx - 6} 144 Z" fill="${RED}" ${st(0.6)}/>` + [0, 1, 2, 3].map((i) => `<path d="M${cx - 2 + i * 1.4} 150 L${cx - 3 + i * 2} 176" ${st(0.8, i % 2 ? RED : DARKRED)}/>`).join('');
    // ears: tall, inner grey
    for (const d of [-1, 1]) {
        const X = (n) => f(cx + d * n);
        s += `<path d="M${X(40)} 70 C${X(46)} 46 ${X(48)} 22 ${X(44)} 2 C${X(32)} 14 ${X(20)} 30 ${X(12)} 46 Z" fill="${W}" ${st(1.4)}/><path d="M${X(36)} 62 C${X(40)} 44 ${X(41)} 26 ${X(39)} 12 C${X(30)} 22 ${X(22)} 34 ${X(18)} 46 Z" fill="${G2}"/>`;
    }
    // head: narrow, a fine muzzle
    const head = `M${cx - 46} 82 C${cx - 46} 56 ${cx - 26} 40 ${cx} 40 C${cx + 26} 40 ${cx + 46} 56 ${cx + 46} 82 C${cx + 46} 100 ${cx + 40} 110 ${cx + 30} 118 C${cx + 20} 126 ${cx + 10} 130 ${cx} 130 C${cx - 10} 130 ${cx - 20} 126 ${cx - 30} 118 C${cx - 40} 110 ${cx - 46} 100 ${cx - 46} 82 Z`;
    s += `<path d="${head}" fill="${W}"/><clipPath id="${id}h"><path d="${head}"/></clipPath><g clip-path="url(#${id}h)"><path d="M${cx + 30} 40 C${cx + 44} 70 ${cx + 40} 110 ${cx + 20} 132 L${cx + 50} 132 L${cx + 50} 40 Z" fill="${G2}"/></g><path d="${head}" fill="none" ${st(1.5)}/>`;
    s += `<path d="M${cx - 44} 96 l-8 4 l7 1 M${cx + 44} 96 l8 4 l-7 1 M${cx - 4} 48 L${cx - 3} 62 M${cx + 4} 48 L${cx + 3} 62" ${st(0.8)} fill="none"/>`;
    // eyes: long gold almonds, upper lids low, slits, one highlight each
    for (const d of [-1, 1]) {
        const ex = cx + d * 21;
        const ey = 84;
        const o = `M${ex - d * 13} ${ey + 4} C${ex - d * 8} ${ey - 4} ${ex + d * 6} ${ey - 7} ${ex + d * 14} ${ey - 5} C${ex + d * 10} ${ey + 5} ${ex} ${ey + 9} ${ex - d * 13} ${ey + 4} Z`;
        s += `<clipPath id="${id}e${d}"><path d="${o}"/></clipPath><path d="${o}" fill="${GOLD}"/><g clip-path="url(#${id}e${d})"><path d="M${ex - 16} ${ey - 9} L${ex + 16} ${ey - 9} L${ex + 16} ${ey - 1} Q${ex} ${ey - 4} ${ex - 16} ${ey + 1} Z" fill="#b48a1c"/><ellipse cx="${ex}" cy="${ey + 1.6}" rx="1.8" ry="6.4" fill="${K}"/><circle cx="${ex - d * 4}" cy="${ey}" r="1.3" fill="${W}"/></g>`;
        s += `<path d="M${ex - d * 13.6} ${ey + 4.4} C${ex - d * 8} ${ey - 5.6} ${ex + d * 6} ${ey - 8.6} ${ex + d * 15} ${ey - 5.6} L${ex + d * 21} ${ey - 8} L${ex + d * 14.4} ${ey - 3} C${ex + d * 6} ${ey - 6} ${ex - d * 8} ${ey - 3} ${ex - d * 12.6} ${ey + 4.4} Z" fill="${K}"/>`;
        s += `<path d="M${ex - d * 12} ${ey + 5} C${ex - d * 2} ${ey + 9.4} ${ex + d * 8} ${ey + 5} ${ex + d * 12} ${ey}" ${st(0.6)} fill="none"/><path d="M${ex - d * 13} ${ey + 5} l${-d * 2} 6" ${st(0.9)} fill="none"/>`;
    }
    // nose, mouth, whiskers
    s += `<path d="M${cx - 4} 108 L${cx + 4} 108 L${cx} 112 Z" fill="${K}"/><path d="M${cx} 112 L${cx} 115 M${cx - 7} 117 C${cx - 5} 119.4 ${cx - 1.4} 119 ${cx} 115 C${cx + 1.4} 119 ${cx + 5} 119.4 ${cx + 7} 117" ${st(0.9)} fill="none"/>`;
    for (const d of [-1, 1]) s += `<path d="M${cx + d * 12} 112 C${cx + d * 50} 100 ${cx + d * 90} 98 ${cx + d * 126} 104 M${cx + d * 12} 116 C${cx + d * 52} 114 ${cx + d * 92} 118 ${cx + d * 128} 128 M${cx + d * 11} 120 C${cx + d * 44} 126 ${cx + d * 78} 138 ${cx + d * 106} 152" ${st(0.55)} fill="none"/>`;
    return s;
}

/* ================================================================== props =================================================== */

/** An interior: shoji lattice with butterfly shadows, a dark floor, an optional lamp. */
export function shoji(lamp = true, dark = 0) {
    let s = `<rect width="400" height="250" fill="${W}"/>`;
    let d = '';
    for (let x = 0; x <= 400; x += 40) d += `M${x} 0 V180 `;
    for (let y = 0; y <= 180; y += 30) d += `M0 ${y} H400 `;
    s += `<path d="${d}" ${st(2.4, G3)}/>`;
    s += [[60, 50, 1.6, -20], [150, 110, 1.2, 15], [260, 40, 1.8, 10], [330, 120, 1.3, -14], [110, 150, 0.9, 6]].map(([x, y, sc, rot]) => `<g opacity="0.55">${butterfly(x, y, sc, rot).replace(new RegExp(K, 'g'), G1)}</g>`).join('');
    s += `<rect y="180" width="400" height="70" fill="${K}"/><path d="M0 180 H400" ${st(3, G3)}/>`;
    if (lamp) s += `<circle cx="200" cy="150" r="70" fill="${W}" opacity="0.5"/><rect x="194" y="150" width="12" height="24" fill="${W}" ${st(0.8)}/><circle cx="200" cy="146" r="4" fill="${W}" ${st(0.6)}/>`;
    if (dark) s += `<rect width="400" height="250" fill="${K}" opacity="${dark}"/>`;
    return s;
}

/* ================================================================== Ya, the feral huntress ================================== */

/** Ya at scene size: a mane of unbound black hair, fur wrap, leather, bone necklace, scarred bare arms, barefoot, spear. */
function yaFigure(x, y, s = 1, opts = {}) {
    const { face = 1, sway = 8, spear = true } = opts;
    const r = rng(271 + Math.round(x));
    const top = -100;
    let back = '';
    let body = '';
    let front = '';
    // the mane: wide, wild, falling past the hips, loose strands flying
    back += `<path d="M-6 ${top + 2} C-16 ${top + 10} -18 ${top + 30} -16 ${top + 50} C-15 ${top + 60} -12 ${top + 64} -8 ${top + 66} L9 ${top + 64} C14 ${top + 58} 18 ${top + 36} 14 ${top + 14} C12 ${top + 6} 9 ${top + 1} 6 ${top + 1} Z" fill="${K}"/>`;
    back += hairRibbons(r, -13, 12, top + 26, top + 74, sway, 12, 1.5);
    let flyD = '';
    for (let i = 0; i < 9; i++) { const sx = -12 + i * 3; flyD += `M${sx} ${top + 8 + (i % 3) * 6} q${f(-6 + i * 1.6)} ${-4 + (i % 2) * 2} ${f(-10 + i * 2.6)} ${-2 + (i % 3) * 3} `; }
    back += `<path d="${flyD}" ${st(0.8)} fill="none"/>`;
    if (spear) back += `<path d="M13 4 L19 ${top - 18}" ${st(1.3, G3)}/><path d="M19 ${top - 18} l-2 -9 l4.4 1.4 Z" fill="${W}" ${st(0.5)}/><path d="M18.4 ${top - 14} l-2.4 3 M18.6 ${top - 13} l2.6 2.6" ${st(0.5, RED)}/>`;
    // legs: bare below the knee, wrapped ankles, barefoot
    body += `<path d="M-4.4 -40 L-4.6 -2 L-1.4 -1.4 L-0.6 -40 Z M4.4 -40 L5 -2 L1.8 -1.4 L0.6 -40 Z" fill="${W}" ${st(0.45)}/>`;
    body += `<path d="M-4.6 -8 L-1.2 -7 M-4.6 -6 L-1.2 -5 M1.8 -7 L5 -8 M1.8 -5 L5 -6" ${st(0.4)}/><path d="M-5.4 0 Q-5 -1.6 -1.2 -1.4 L-0.6 0 Z M5.8 0 Q5.4 -1.6 1.8 -1.4 L1.2 0 Z" fill="${W}" ${st(0.4)}/>`;
    // leather wrap skirt with a ragged hem, a belt of cord and teeth
    body += `<path d="M-7 -58 C-8 -50 -9 -44 -8.6 -36 L-6 -38.6 L-4 -35 L-1.6 -38 L0.6 -34.6 L3 -38 L5 -35.4 L7.4 -38 L9 -36 C9 -44 8 -50 7 -58 Z" fill="${G3}" ${st(0.5)}/><path d="M-3 -56 L-4 -40 M2.6 -56 L3.4 -40" ${st(0.3, K)}/>`;
    body += `<path d="M-7.4 -58 Q0 -56.6 7.4 -58" ${st(1.1, RED)} fill="none"/>` + [-5, -2, 1, 4].map((dx) => `<path d="M${dx} -57.4 l0.6 3.4 l0.6 -3.4" fill="${W}" ${st(0.25)}/>`).join('');
    // torso: bound chest wrap of fur, bare midriff
    body += `<path d="M-6.4 -80 C-7.6 -74 -7 -66 -6 -58 L6 -58 C7 -66 7.6 -74 6.4 -80 Q0 -82 -6.4 -80 Z" fill="${W}" ${st(0.5)}/>`;
    body += `<path d="M-7.6 -82 C-8.4 -77 -7.6 -72 -6.6 -69 Q0 -67 6.6 -69 C7.6 -72 8.4 -77 7.6 -82 Q0 -85 -7.6 -82 Z" fill="${G1}" ${st(0.5)}/>`;
    let fur = '';
    for (let i = 0; i < 12; i++) fur += `M${f(-7 + i * 1.3)} -69.6 l${f((r() - 0.5) * 1.2)} ${f(1.4 + r())} `;
    body += `<path d="${fur}" ${st(0.35)}/><path d="M-6 -82 C-4 -79 -2 -77 0 -76 M6 -82 C4 -79 2 -77 0 -76" ${st(0.35)} fill="none"/>`;
    body += `<path d="M-1 -64 L1 -62" ${st(0.3)}/>`;
    // bare arms with scars; left hangs, right grips the spear
    body += `<path d="M-7.4 -81 C-10 -72 -10.6 -64 -10.4 -54 L-8 -54 C-8 -63 -7.6 -71 -6 -77 Z" fill="${W}" ${st(0.45)}/><path d="M-9.6 -70 l1.4 -1.2 M-9.8 -66 l1.6 -1 M-9.8 -62 l1.4 -1.4" ${st(0.3, RED)}/>` + hand(-9.2, -54, -1, 1);
    body += `<path d="M7.4 -81 C10 -74 12 -68 13.6 -62 L15.6 -63.6 C14 -70 11.6 -76 8.6 -82 Z" fill="${W}" ${st(0.45)}/><path d="M11.4 -73 l1.4 -1 M12.4 -69.6 l1.4 -1" ${st(0.3, RED)}/><ellipse cx="15" cy="-62" rx="1.6" ry="1.2" fill="${W}" ${st(0.4)}/>`;
    // neck, head, a grin; bone necklace
    front += `<path d="M-1.4 -88.8 L-1.6 -82.6 L1.6 -82.6 L1.4 -88.8 Z" fill="${W}" ${st(0.4)}/>`;
    front += `<path d="${headShape(top, 11.5, 4)}" fill="${W}" ${st(0.5)}/>`;
    front += `<path d="M-3.4 ${top + 6.2} L-0.8 ${top + 5.2} L-0.9 ${top + 5.9} Z M3.4 ${top + 6.2} L0.8 ${top + 5.2} L0.9 ${top + 5.9} Z" fill="${K}"/><circle cx="-2" cy="${top + 5.9}" r="0.4" fill="${GOLD}"/><circle cx="2" cy="${top + 5.9}" r="0.4" fill="${GOLD}"/>`;
    front += `<path d="M-3.4 ${top + 3.6} L-0.8 ${top + 4.2} M0.8 ${top + 4.2} L3.4 ${top + 3.6}" ${st(0.5)}/>`;
    front += `<path d="M-1.8 ${top + 9.4} Q0 ${top + 11} 1.9 ${top + 9.2} Z" fill="${W}" ${st(0.45)}/><path d="M-1.4 ${top + 9.6} L1.6 ${top + 9.6}" ${st(0.15)}/>`;
    front += `<path d="M2.6 ${top + 4.4} L3.6 ${top + 8}" ${st(0.35, RED)}/>`;
    front += `<path d="M-3.4 -85 Q0 -81.6 3.4 -85" ${st(0.35)} fill="none"/>` + [-2.4, -1.2, 0, 1.2, 2.4].map((dx, i) => `<path d="M${dx} ${-83.6 + Math.abs(dx) * -0.3} l${dx * 0.1} ${i === 2 ? 3 : 2}" ${st(0.7, W)}/>`).join('');
    // the wild fringe, uneven, falling into her eyes
    front += `<path d="M-4.6 ${top + 7} C-6 ${top - 1} -2.6 ${top - 4} 0.6 ${top - 3.6} C4 ${top - 3.6} 6.2 ${top} 4.6 ${top + 7} L3.6 ${top + 3} L2.8 ${top + 6.4} L1.6 ${top + 2.4} L0.4 ${top + 5} L-0.8 ${top + 2} L-2 ${top + 5.6} L-3.2 ${top + 2.6} Z" fill="${K}"/>`;
    front += `<path d="M-4.6 ${top + 2} C-6 ${top + 10} -6 ${top + 18} -7 ${top + 26} M4.6 ${top + 2} C6 ${top + 10} 6.4 ${top + 20} 8 ${top + 28}" ${st(1.4)} fill="none"/>`;
    front += `<path d="M-5.6 ${top + 1} C-6.6 ${top + 8} -6.4 ${top + 16} -7.4 ${top + 24}" ${st(0.6, RED)} fill="none"/>`;
    const shadow = `<ellipse cx="1" cy="0.4" rx="10" ry="1.4" fill="${K}" opacity="0.4"/>`;
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})">${shadow}${back}${body}${front}</g>`;
}

/** Ya, close: three-quarter the other way from Mei Lin, a wide grin with teeth, gold eyes, a scar, a mane of hair. */
export function yaCloseUp(id = 'yac') {
    const r = rng(9001);
    const cx = 196;
    let s = '';
    s += smoke([[410, 200], [340, 160], [300, 230], [250, 200]], 6) + butterfly(330, 60, 1.1, 14) + butterfly(70, 160, 0.9, -18);
    // the mane: enormous, flying out to both sides
    s += `<path d="M${cx - 60} 90 C${cx - 70} 30 ${cx - 30} 0 ${cx + 6} 2 C${cx + 46} 4 ${cx + 76} 30 ${cx + 70} 96 C${cx + 80} 150 ${cx + 100} 200 ${cx + 130} 262 L${cx - 140} 262 C${cx - 100} 200 ${cx - 76} 140 ${cx - 60} 90 Z" fill="${K}"/>`;
    s += hairRibbons(r, cx - 56, cx - 10, 110, 262, -60, 12, 2.1) + hairRibbons(r, cx + 14, cx + 66, 110, 262, 60, 12, 2.1);
    let fly = '';
    for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + 0.8 * (i / 17)); const x0 = cx + Math.cos(a) * 58; const y0 = 70 + Math.sin(a) * 60; fly += `M${f(x0)} ${f(y0)} q${f(Math.cos(a) * 18 + (r() - 0.5) * 10)} ${f(Math.sin(a) * 10)} ${f(Math.cos(a) * 30 + (r() - 0.5) * 16)} ${f(Math.sin(a) * 18 + 8)} `; }
    s += `<path d="${fly}" ${st(1.4)} fill="none"/><path d="M${cx - 66} 60 C${cx - 74} 110 ${cx - 70} 170 ${cx - 90} 230" ${st(4, RED)} fill="none"/>`;
    // shoulders: fur wrap, bare shoulder with a scar
    s += `<path d="M${cx - 96} 262 C${cx - 84} 210 ${cx - 50} 184 ${cx - 16} 176 L${cx + 22} 176 C${cx + 60} 186 ${cx + 92} 212 ${cx + 104} 262 Z" fill="${W}" ${st(1.2)}/>`;
    s += `<path d="M${cx - 100} 262 C${cx - 70} 214 ${cx - 30} 200 ${cx + 10} 214 C${cx + 40} 224 ${cx + 70} 230 ${cx + 106} 262 Z" fill="${G1}" ${st(1.2)}/>`;
    let fur = '';
    for (let i = 0; i < 30; i++) { const x = cx - 80 + i * 6; const y0 = 214 + Math.sin(i / 3) * 6 + (x > cx ? (x - cx) * 0.14 : (cx - x) * 0.05); fur += `M${f(x)} ${f(y0)} l${f((r() - 0.5) * 3)} ${f(6 + r() * 6)} `; }
    s += `<path d="${fur}" ${st(0.8)}/><path d="M${cx + 58} 196 l10 6 M${cx + 62} 192 l8 7" ${st(1.2, RED)}/>`;
    // necklace of teeth and small bones
    s += `<path d="M${cx - 30} 182 Q${cx + 4} 214 ${cx + 38} 182" ${st(1)} fill="none"/>` + Array.from({ length: 9 }, (_, i) => { const t = i / 8; const x = cx - 26 + t * 60; const y0 = 186 + Math.sin(t * Math.PI) * 22; return `<path d="M${f(x - 2)} ${f(y0)} L${f(x)} ${f(y0 + (i === 4 ? 14 : 8))} L${f(x + 2)} ${f(y0)} Z" fill="${i === 4 ? RED : W}" ${st(0.6)}/>`; }).join('');
    // neck
    s += `<path d="M${cx - 14} 130 C${cx - 14} 150 ${cx - 16} 166 ${cx - 22} 178 L${cx + 26} 178 C${cx + 18} 164 ${cx + 15} 148 ${cx + 15} 128 Z" fill="${W}" ${st(1)}/>`;
    // face, three-quarter to the right
    const face = `M${cx + 32} 72 C${cx + 33} 98 ${cx + 28} 116 ${cx + 16} 132 C${cx + 11} 138 ${cx + 8} 141 ${cx + 5} 141.5 C${cx - 2} 140 ${cx - 12} 132 ${cx - 22} 118 C${cx - 31} 104 ${cx - 34} 88 ${cx - 33} 70 Z`;
    s += `<path d="${face}" fill="${W}"/><clipPath id="${id}f"><path d="${face}"/></clipPath><g clip-path="url(#${id}f)"><path d="M${cx - 20} 70 C${cx - 28} 92 ${cx - 24} 116 ${cx - 6} 142 L${cx - 40} 142 L${cx - 40} 70 Z" fill="${G2}"/></g><path d="${face}" fill="none" ${st(1.2)}/>`;
    // fierce eyes: gold, narrowed, strong lower lid
    const eye = (ex, ey, w, h, k) => {
        const o = `M${ex - w} ${ey - h * 0.1} C${ex - w * 0.4} ${ey - h * 0.6} ${ex + w * 0.5} ${ey - h * 0.5} ${ex + w} ${ey + h * 0.05} C${ex + w * 0.5} ${ey + h * 0.5} ${ex - w * 0.4} ${ey + h * 0.5} ${ex - w} ${ey - h * 0.1} Z`;
        return `<clipPath id="${id}e${k}"><path d="${o}"/></clipPath><path d="${o}" fill="${W}"/><g clip-path="url(#${id}e${k})"><circle cx="${ex + w * 0.12}" cy="${ey + h * 0.05}" r="${h * 0.62}" fill="${GOLD}"/><circle cx="${ex + w * 0.12}" cy="${ey + h * 0.05}" r="${h * 0.26}" fill="${K}"/><path d="M${ex - w} ${ey - h} L${ex + w} ${ey - h} L${ex + w} ${ey - h * 0.05} Q${ex} ${ey - h * 0.4} ${ex - w} ${ey} Z" fill="${K}"/><circle cx="${ex - w * 0.08}" cy="${ey - h * 0.08}" r="${h * 0.14}" fill="${W}"/></g>`
            + `<path d="M${ex - w * 1.1} ${ey - h * 0.2} C${ex - w * 0.4} ${ey - h * 0.8} ${ex + w * 0.5} ${ey - h * 0.75} ${ex + w * 1.15} ${ey - h * 0.05} L${ex + w * 1.6} ${ey - h * 0.5} L${ex + w * 1.1} ${ey + h * 0.2} C${ex + w * 0.5} ${ey - h * 0.4} ${ex - w * 0.4} ${ey - h * 0.45} ${ex - w} ${ey} Z" fill="${K}"/>`
            + `<path d="M${ex - w * 0.9} ${ey + h * 0.15} C${ex - w * 0.3} ${ey + h * 0.6} ${ex + w * 0.5} ${ey + h * 0.55} ${ex + w} ${ey + h * 0.15}" ${st(1)} fill="none"/>`;
    };
    s += eye(cx - 13, 98, 9.4, 7, 1) + eye(cx + 19, 98, 7.2, 6, 2);
    // brows: low, angled, fierce
    s += `<path d="M${cx - 26} 86 L${cx - 4} 90 M${cx + 8} 89.6 L${cx + 28} 86.4" ${st(2)} fill="none"/>`;
    // a scar through the left brow and cheek
    s += `<path d="M${cx - 22} 80 L${cx - 14} 112" ${st(1.4, RED)}/>`;
    // nose
    s += `<path d="M${cx + 6} 100 C${cx + 7} 108 ${cx + 9} 113 ${cx + 8} 118 L${cx + 4} 118.6" ${st(0.8)} fill="none"/>`;
    // the grin: wide, teeth, one canine
    s += `<path d="M${cx - 12} 124 Q${cx + 2} 136 ${cx + 18} 123 Q${cx + 4} 128 ${cx - 12} 124 Z" fill="${K}"/><path d="M${cx - 10} 124.6 Q${cx + 2} 129.6 ${cx + 16} 123.8 L${cx + 15} 126 Q${cx + 2} 131 ${cx - 9} 126.6 Z" fill="${W}"/><path d="M${cx + 10} 126 l1.4 3.6 l1.2 -3.8" fill="${W}" ${st(0.5)}/><path d="M${cx - 12} 124 Q${cx + 2} 136 ${cx + 18} 123 l2 -2" ${st(0.9)} fill="none"/>`;
    // the fringe: ragged, into her eyes
    s += `<path d="M${cx - 38} 92 C${cx - 44} 40 ${cx - 16} 16 ${cx + 8} 16 C${cx + 34} 16 ${cx + 46} 40 ${cx + 40} 92 L${cx + 34} 80 L${cx + 28} 94 L${cx + 20} 78 L${cx + 12} 90 L${cx + 4} 76 L${cx - 4} 88 L${cx - 12} 76 L${cx - 20} 90 L${cx - 28} 78 L${cx - 32} 92 Z" fill="${K}"/>`;
    s += `<path d="${Array.from({ length: 12 }, (_, i) => { const x = cx - 30 + i * 6; return `M${f(cx + (x - cx) * 0.3)} 24 Q${f(x)} 48 ${f(x + (r() - 0.5) * 4)} 74`; }).join(' ')}" ${st(0.6, W)} fill="none" opacity="0.85"/>`;
    s += `<path d="M${cx - 38} 70 C${cx - 46} 110 ${cx - 46} 150 ${cx - 54} 190 M${cx + 40} 70 C${cx + 48} 110 ${cx + 50} 150 ${cx + 60} 196" ${st(6)} fill="none"/>`;
    // a red feather and a bone tied into the hair
    s += `<path d="M${cx + 44} 30 C${cx + 60} 18 ${cx + 74} 18 ${cx + 84} 6 C${cx + 76} 22 ${cx + 62} 30 ${cx + 46} 36 Z" fill="${RED}" ${st(0.8)}/><path d="M${cx + 46} 34 L${cx + 82} 8" ${st(0.6)}/>`;
    s += `<path d="M${cx - 50} 40 L${cx - 30} 22" ${st(4, W)}/><path d="M${cx - 50} 40 L${cx - 30} 22" ${st(0.6)} fill="none" stroke-dasharray="0.1 22"/><circle cx="${cx - 51}" cy="41" r="3" fill="${W}" ${st(0.8)}/><circle cx="${cx - 29}" cy="21" r="3" fill="${W}" ${st(0.8)}/>`;
    return s;
}

/* ================================================================== creatures ================================================ */
// Elegant and graphic: black masses with white line detail, a touch of red in the eyes. Unit space: feet at 0, facing right.
const C = (x, y, s, face, body) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})">${body}</g>`;
const eyeR = (x, y, r = 1.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${RED}"/><circle cx="${f(x + r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.35)}" fill="${W}"/>`;
const furLines = (pts, w = 0.5) => `<path d="${pts.map(([x, y, dx, dy]) => `M${x} ${y} l${dx} ${dy}`).join(' ')}" ${st(w, W)} fill="none"/>`;
const shadowC = (rx) => `<ellipse cx="0" cy="0.6" rx="${rx}" ry="1.2" fill="${K}" opacity="0.4"/>`;

export function jackal(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(22)
        + `<path d="M-14 -11 L-12 -4 L-13.4 0 L-11 0 L-9.6 -5 L-8 -9 Z M8 -9 L10 -4 L9.4 0 L11.6 0 L12.4 -5 L12 -9 Z" fill="${G3}"/>`
        + `<path d="M-16 -12 C-10 -17 4 -17 11 -14 L14 -18 C16 -22 20 -24 24 -22 L31 -18.6 L29.6 -16.6 L24.4 -15.6 C20.6 -14 18 -11.6 16 -9.6 L14.4 -5.6 L15.6 0 L13 0 L11 -5.8 L8 -8.4 C2 -8 -6 -8 -10 -8.4 L-11.6 -4 L-10.6 0 L-13.2 0 L-15.2 -5 C-17 -8 -18 -10 -16 -12 Z" fill="${K}"/>`
        + `<path d="M17.6 -21 L18.4 -30 L22.2 -22.4 Z" fill="${K}"/><path d="M18.8 -22 L19 -27 L21 -22.6 Z" fill="${G3}"/>`
        + `<path d="M-16 -12 C-24 -15 -31 -9 -34 -1 C-30 -4 -26 -6 -22 -7 C-26 -3 -27 0 -27 2 C-22 -4 -18 -8 -15.4 -9.6 Z" fill="${K}"/>`
        + furLines([[-10, -15.6, 1.4, -2.6], [-6, -16.2, 1.2, -3], [-2, -16.4, 1.2, -3.2], [2, -16.2, 1, -2.8], [6, -15.4, 1, -2.4], [-30, -6, 2, -2], [-26, -8, 2, -1.6], [-4, -11, 3, 0.4], [2, -11.4, 3, 0.4]])
        + `<path d="M25 -16 l1 1.6 l1 -1.6 l1 1.6 l1 -1.8" ${st(0.4, W)} fill="none"/>` + eyeR(23.4, -20.4, 1.1));
}
export function wolf(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(26)
        + `<path d="M-17 -14 L-15 -5 L-16 0 L-13 0 L-11.6 -6 L-10 -11 Z M9 -11 L11 -5 L10.4 0 L13 0 L13.8 -6 L13 -11 Z" fill="${G3}"/>`
        + `<path d="M-20 -14 C-12 -21 4 -22 12 -19 C14 -25 20 -28 25 -27 L34 -22 L32.4 -19.4 L26 -18.4 C22 -16 19 -12.6 17 -10 L15.6 -5.6 L17 0 L14 0 L12 -6 L9 -9.6 C2 -9 -6 -9 -12 -9.6 L-13.6 -4.6 L-12.6 0 L-15.4 0 L-17.6 -5 C-20 -8.6 -21.6 -11.6 -20 -14 Z" fill="${K}"/>`
        + `<path d="M12 -19 C10 -14 11 -10 13.4 -8 C15 -12 16 -16 15 -20 Z" fill="${G3}"/>`
        + `<path d="M19 -26 L19.6 -34 L23.6 -26.6 Z" fill="${K}"/>`
        + `<path d="M-20 -14 C-30 -17 -36 -10 -39 -2 C-34 -6 -30 -8 -26 -9 C-28 -5 -30 -2 -30 1 C-24 -5 -20 -10 -18 -11.6 Z" fill="${K}"/>`
        + furLines([[-14, -18.6, 1.4, -2.8], [-10, -19.6, 1.4, -3], [-6, -20, 1.2, -3.2], [-2, -20, 1, -3], [2, -19.6, 1, -2.6], [12, -20, -1.4, 4], [13.4, -17, -1.4, 4], [-34, -6, 2, -2], [-30, -8, 2, -1.6]])
        + `<path d="M27 -18.4 l1 1.6 l1 -1.6 l1 1.6 l1 -1.8" ${st(0.4, W)} fill="none"/>` + eyeR(25.2, -24, 1.3));
}
export function boar(x, y, s = 1, face = 1) {
    let br = '';
    for (let i = 0; i < 14; i++) { const t = i / 13; const bx = -22 + t * 46; const by = -30 - Math.sin(t * Math.PI) * 6; br += `M${f(bx)} ${f(by + 3)} l${f(1 - t * 2)} -6 `; }
    return C(x, y, s, face, shadowC(30)
        + `<path d="M-20 -8 L-21 0 L-17 0 L-15.6 -7 Z M14 -8 L15 0 L19 0 L19.4 -8 Z" fill="${G3}"/>`
        + `<path d="M-26 -8 C-30 -24 -18 -34 0 -35 C16 -36 26 -28 30 -20 L38 -16 L39 -10.6 L32 -8.6 L27 -7.6 L26 0 L21 0 L19.6 -6.6 L-13 -6.6 L-14 0 L-19 0 L-21 -4.6 C-24 -5 -26 -6 -26 -8 Z" fill="${K}"/>`
        + `<path d="${br}" ${st(1.4)} fill="none"/><path d="${br}" ${st(0.4, W)} fill="none"/>`
        + furLines([[-18, -22, 4, 6], [-10, -26, 4, 7], [-2, -28, 4, 8], [6, -28, 4, 8], [14, -25, 3, 7], [24, -20, -1, 5]], 0.6)
        + `<path d="M33 -11 C38 -15 38 -21 33.6 -24" ${st(2.2, W)} fill="none"/><path d="M33 -11 C38 -15 38 -21 33.6 -24" ${st(0.5)} fill="none"/>`
        + `<path d="M26 -24 L28 -30 L30.6 -24 Z" fill="${K}"/>` + eyeR(29, -20, 1.4));
}
export function rat(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(14)
        + `<path d="M-10 -4 C-20 -2 -28 -6 -34 -2" ${st(1.2, G1)} fill="none"/>`
        + `<path d="M-11 -4 C-12 -10 -4 -13 4 -12 C8 -12 11 -10 13 -8 L17 -6.6 L13 -5 L10 -3 L10.6 0 L8.6 0 L7.6 -2.6 L-4 -2.6 L-5.4 0 L-7.6 0 L-8 -2.6 C-10 -2.4 -11 -3 -11 -4 Z" fill="${K}"/>`
        + `<circle cx="7.6" cy="-12" r="2.2" fill="${K}"/><circle cx="7.6" cy="-12" r="1" fill="${G3}"/>`
        + furLines([[-8, -9, 1, -1.6], [-4, -10.6, 1, -1.8], [0, -11.4, 1, -1.8], [4, -11.4, 1, -1.4]], 0.4) + `<path d="M15 -6.4 l5 -1 M15 -6 l5 1" ${st(0.25, W)}/>` + eyeR(11.4, -8.6, 0.8));
}
export function crow(x, y, s = 1, face = 1) {
    let tips = '';
    for (let i = 0; i < 5; i++) tips += `M${-14 - i * 3} ${-8 - i * 2.4} l${-4 - i * 0.4} ${-4 + i * 0.6} `;
    return C(x, y, s, face,
        `<path d="M-2 0 C-8 -6 -14 -10 -18 -12 L-24 -16 L-21 -12.6 L-28 -16.4 L-24 -12 L-31 -14.4 L-26 -10.6 L-32 -11 L-25 -7.6 C-18 -6 -10 -2 -4 2 Z" fill="${K}"/>`
        + `<path d="M-2 0 C-6 -6 -8 -14 -6 -22 L-2 -28 L-2.6 -22 L2 -27 L0.4 -21 L5 -24 L2 -18 L6 -18 L1.6 -12 C1 -6 0 -2 -2 0 Z" fill="${K}"/>`
        + `<path d="M-6 2 C-2 -2 4 -3 9 -1 L13 -1.4 L16 0.2 L12.6 1 C8 3 2 4 -4 4 L-10 7 L-8 3 Z" fill="${K}"/>`
        + `<path d="M-12 -7 C-16 -9 -20 -10 -24 -11 M-4 -10 C-3 -16 -3 -20 -2 -24" ${st(0.4, W)} fill="none"/>` + eyeR(10, -0.6, 0.8));
}
export function lizard(x, y, s = 1, face = 1) {
    let spines = '';
    for (let i = 0; i < 10; i++) { const sx = -28 + i * 6.4; const h = 10 - Math.abs(i - 4.5) * 1.4; spines += `<path d="M${f(sx)} ${f(-11 + Math.abs(i - 4.5) * 0.5)} L${f(sx + 2.4)} ${f(-11 - h)} L${f(sx + 4.6)} ${f(-11 + Math.abs(i - 4.5) * 0.5)} Z" fill="${K}"/><path d="M${f(sx + 2.4)} ${f(-11 - h + 2)} L${f(sx + 2.4)} ${f(-12)}" ${st(0.3, W)}/>`; }
    return C(x, y, s, face, shadowC(40) + spines
        + `<path d="M-60 -4 C-48 -8 -38 -12 -26 -12 C-6 -14 14 -13 28 -9 L40 -8 L45 -4.4 L32 -2.4 L27 -1.2 L28 2 L24 2 L22 -2 C14 -3 -8 -3 -14 -3 L-16 1.6 L-20 1.6 L-20 -3 C-34 -3 -48 -1 -60 -4 Z" fill="${K}"/>`
        + `<path d="M-50 -5 C-38 -7 -24 -8 -12 -7.6 M0 -8 C12 -8 22 -7 30 -5.6" ${st(0.4, W)} fill="none"/><path d="M33 -4.6 l2 1.4 l2 -1.4 l2 1.4" ${st(0.35, W)} fill="none"/>`
        + `<circle cx="36" cy="-7" r="1.4" fill="${GOLD}"/><path d="M36 -8.2 L36 -5.8" ${st(0.5)}/>`);
}
export function hare(x, y, s = 1, face = 1) {
    let plates = '';
    for (let i = 0; i < 5; i++) plates += `<path d="M${-8 + i * 3.6} ${-9 - Math.sin((i / 4) * Math.PI) * 2} L${-6 + i * 3.6} ${-15 - Math.sin((i / 4) * Math.PI) * 3} L${-4 + i * 3.6} ${-9 - Math.sin((i / 4) * Math.PI) * 2} Z" fill="${G2}" ${st(0.4)}/>`;
    return C(x, y, s, face, shadowC(12)
        + `<path d="M-10 -2 C-12 -8 -8 -12 0 -12 C6 -12 9 -10 10 -7 L14 -8 C16 -8 17 -6 16 -5 L12 -3.6 L11 0 L8.6 0 L8 -2 L-6 -2 L-7.6 0 L-10 0 Z" fill="${W}" ${st(0.7)}/>`
        + plates + `<path d="M10 -10 L9 -20 L12 -11 M12 -10 L13 -19 L14 -10" fill="${W}" ${st(0.6)}/><circle cx="12.6" cy="-7.4" r="0.8" fill="${K}"/>`);
}
export function fowl(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(12)
        + `<path d="M-12 -6 C-12 -12 -4 -14 4 -12 C8 -14 10 -20 10 -26 C10 -30 13 -31 15 -29 L19 -28 L15 -27 C14 -22 13 -16 11 -10 C10 -5 6 -2 0 -2 L-6 -2 C-9 -2 -11 -3 -12 -6 Z" fill="${G3}" ${st(0.6)}/>`
        + `<path d="M-10 -7 C-6 -9 0 -9 4 -8 M-8 -5 C-4 -6 0 -6 3 -5" ${st(0.4, W)} fill="none"/><path d="M-1 -2 L-2 0 M3 -2 L4 0" ${st(0.6)}/><circle cx="14" cy="-28.6" r="0.7" fill="${RED}"/>`);
}

/* new creatures for Act 1 */
export function boneElk(x, y, s = 1, face = 1) {
    const ant = (d) => `<path d="M${d * 2} -38 C${d * 4} -48 ${d * 10} -54 ${d * 18} -62 M${d * 6} -46 C${d * 10} -48 ${d * 14} -46 ${d * 18} -48 M${d * 10} -52 C${d * 8} -58 ${d * 9} -62 ${d * 10} -66 M${d * 14} -56 C${d * 20} -56 ${d * 24} -54 ${d * 26} -50" ${st(3)} fill="none"/><path d="M${d * 2} -38 C${d * 4} -48 ${d * 10} -54 ${d * 18} -62 M${d * 6} -46 C${d * 10} -48 ${d * 14} -46 ${d * 18} -48 M${d * 10} -52 C${d * 8} -58 ${d * 9} -62 ${d * 10} -66 M${d * 14} -56 C${d * 20} -56 ${d * 24} -54 ${d * 26} -50" ${st(1.8, W)} fill="none"/>`;
    let ribs = '';
    for (let i = 0; i < 6; i++) ribs += `M${-14 + i * 4.6} -30 C${-15 + i * 4.6} -26 ${-14 + i * 4.6} -22 ${-12 + i * 4.6} -19 `;
    return C(x, y, s, face, shadowC(26)
        + `<path d="M-14 -20 L-15 0 L-12.6 0 L-11 -18 Z M12 -20 L13 0 L15.4 0 L15.6 -20 Z" fill="${G3}"/>`
        + `<path d="M-20 -24 C-20 -32 -10 -34 4 -33 C10 -33 13 -36 16 -42 L20 -40 L28 -36 L27 -32.6 L20 -32 C17 -28 18 -22 16 -18 L17 0 L14.6 0 L12.6 -16 L-12 -16 L-14 0 L-16.4 0 L-17 -18 C-19 -19 -20 -21 -20 -24 Z" fill="${K}"/>`
        + `<path d="${ribs}" ${st(0.8, W)} fill="none"/><path d="M-18 -26 C-10 -29 0 -30 8 -30" ${st(0.6, W)} fill="none"/>`
        + `<path d="M17 -40 C19 -36 22 -35 26 -35" ${st(0.6, W)} fill="none"/>` + ant(1) + ant(-0.6) + eyeR(20.6, -37.4, 1.1));
}
export function rootWyrm(x, y, s = 1, face = 1) {
    let seg = '';
    for (let i = 0; i < 9; i++) { const t = i / 8; const sx = -60 + t * 70; const sy = -Math.sin(t * Math.PI) * 46; seg += `<path d="M${f(sx - 5)} ${f(sy - 7)} Q${f(sx)} ${f(sy - 11)} ${f(sx + 5)} ${f(sy - 7)}" ${st(0.6, W)} fill="none"/>`; }
    return C(x, y, s, face,
        `<path d="M-70 4 C-66 -30 -50 -62 -20 -60 C4 -58 10 -30 14 -18 C16 -10 22 -12 26 -18 L34 -28 L44 -26 L40 -18 L46 -16 L36 -10 C28 -2 16 2 8 -6 C4 -12 2 -30 -14 -36 C-34 -42 -46 -20 -52 4 Z" fill="${G3}" ${st(1)}/>`
        + seg + `<path d="M-66 2 C-64 -4 -60 -8 -58 -2 M-52 4 C-50 -2 -46 -2 -44 4" ${st(1.4)} fill="none"/>`
        + `<path d="M34 -28 C30 -36 26 -40 20 -40 M40 -26 C42 -34 46 -38 52 -38 M38 -27 C38 -36 36 -44 32 -48" ${st(1.2)} fill="none"/>`
        + `<path d="M36 -16 l2 3 l2 -3 l2 3" ${st(0.5, W)} fill="none"/>` + eyeR(36, -22, 1.6) + eyeR(31, -21, 1.1));
}
export function drowned(x, y, s = 1, face = 1, n = 0) {
    const hair = `<path d="M-4 -46 C-7 -40 -7 -30 -9 -18 M-2 -46 C-3 -38 -4 -28 -5 -16 M2 -46 C3 -38 3 -30 2 -20 M4 -46 C7 -40 8 -30 9 -22" ${st(0.9)} fill="none"/>`;
    return C(x, y, s, face,
        `<path d="M-6 0 C-7 -14 -7 -28 -6 -38 C-7 -42 -6 -46 -4 -48 C-2 -51 2 -51 4 -48 C6 -46 7 -42 6 -38 C7 -28 7 -14 6 0 Z" fill="${G1}" ${st(0.7)}/>`
        + `<path d="M-6 -38 C-12 -30 -14 -18 -16 -6 L-14 -6 C-12 -16 -10 -26 -5 -32 M6 -38 C12 -32 16 -24 18 -14 L16 -14 C14 -22 10 -28 5 -32" fill="${G1}" ${st(0.6)}/>`
        + `<path d="M-16 -6 l-1.4 4 M-15 -6 l0 4.4 M-14 -6 l1 4" ${st(0.4)}/>` + hair
        + `<ellipse cx="-1.6" cy="-43" rx="1" ry="1.4" fill="${W}"/><ellipse cx="1.6" cy="-43" rx="1" ry="1.4" fill="${W}"/><path d="M-1 -39.6 Q0 -38.6 1 -39.6" ${st(0.5)} fill="none"/>`
        + `<rect x="-12" y="-4" width="24" height="5" fill="${G3}" opacity="0.8"/>`);
}
export function serpent(x, y, s = 1, face = 1) {
    return C(x, y, s, face,
        `<path d="M-50 2 C-40 -10 -30 -10 -24 -2 C-18 6 -10 4 -6 -10 C-2 -26 0 -46 10 -56 C18 -62 28 -60 32 -54 L40 -52 L34 -46 C28 -48 22 -48 18 -42 C12 -32 12 -10 4 4 C-4 16 -16 14 -26 6 C-32 0 -40 0 -46 6 Z" fill="${K}"/>`
        + `<path d="M8 -52 C4 -44 2 -30 0 -16 M14 -50 L20 -60 L22 -50 M-28 0 L-34 -8 L-36 2" ${st(0.6, W)} fill="none"/><path d="M33 -52 l1.6 2 l1.6 -2" ${st(0.4, W)} fill="none"/>` + eyeR(28, -55, 1.3)
        + `<path d="M-60 4 Q-30 0 0 4 T60 4" ${st(1, W)} fill="none"/>`);
}
export function rotApe(x, y, s = 1, face = 1) {
    let fur = '';
    for (let i = 0; i < 16; i++) fur += `M${-14 + i * 1.8} ${-44 + Math.abs(i - 8) * 1.4} l${1 - (i % 3)} 5 `;
    return C(x, y, s, face, shadowC(22)
        + `<path d="M-16 -8 C-20 -24 -18 -40 -10 -48 C-4 -54 6 -54 12 -48 C18 -42 20 -30 18 -16 L22 -4 L24 0 L18 0 L14 -10 L6 -12 L4 0 L-2 0 L-2 -10 C-8 -10 -12 -8 -16 -8 Z" fill="${K}"/>`
        + `<path d="M-14 -40 C-24 -32 -28 -16 -28 2 L-24 2 C-24 -12 -20 -24 -12 -32 Z M14 -42 C24 -36 30 -22 30 -2 L34 2 L28 2 C26 -14 22 -26 14 -34 Z" fill="${K}"/>`
        + `<path d="M0 -50 C-4 -54 -4 -60 0 -62 C6 -64 10 -60 10 -54 C10 -50 6 -48 2 -48 Z" fill="${K}"/>`
        + `<path d="${fur}" ${st(0.5, W)} fill="none"/><path d="M2 -55 l6 0" ${st(0.4, W)}/>` + eyeR(3, -57, 1.1) + eyeR(7.6, -57, 1.1)
        + `<path d="M4 -52 l1 1.4 l1 -1.4 l1 1.4" ${st(0.4, W)} fill="none"/>`);
}
export function cinderHawk(x, y, s = 1, face = 1) {
    return C(x, y, s, face,
        `<path d="M0 0 C-6 -8 -16 -12 -30 -14 L-24 -10 L-34 -10 L-26 -6 L-36 -4 L-26 -2 C-16 0 -8 2 -2 4 Z" fill="${K}"/>`
        + `<path d="M0 0 C4 -8 6 -18 2 -30 L8 -24 L8 -34 L12 -24 L14 -32 L14 -20 C12 -10 8 -4 4 2 Z" fill="${K}"/>`
        + `<path d="M-4 2 C2 -2 8 -2 12 0 L16 -1 L14 2 C10 4 4 6 -2 6 L-10 10 L-8 5 Z" fill="${K}"/>`
        + `<path d="M-30 -14 L-36 -10 M-34 -10 L-38 -5 M-36 -4 L-39 0 M8 -34 L10 -38 M14 -32 L17 -35" ${st(1.4, RED)}/>`
        + `<circle cx="-40" cy="-2" r="0.8" fill="${RED}"/><circle cx="18" cy="-38" r="0.7" fill="${RED}"/><circle cx="-36" cy="-16" r="0.6" fill="${RED}"/>` + eyeR(12.6, -0.6, 0.7));
}
/** The guardian: a tall construct of grown wood and bone, branch-crowned, hollow-eyed. */
export function guardian(x, y, s = 1, face = 1) {
    let grain = '';
    for (let i = 0; i < 11; i++) grain += `M${-12 + i * 2.4} -16 C${-14 + i * 2.6} -50 ${-10 + i * 2.2} -84 ${-8 + i * 1.6} -112 `;
    let crown = '';
    for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.08 + 0.84 * (i / 8)); const len = 26 + (i % 3) * 10; crown += `M${f(Math.cos(a) * 6)} ${f(-136 + Math.sin(a) * 6)} L${f(Math.cos(a) * len)} ${f(-136 + Math.sin(a) * len)} l${f(Math.cos(a - 0.7) * 8)} ${f(Math.sin(a - 0.7) * 8)} `; }
    const arm = (d) => `M${d * 14} -96 C${d * 26} -84 ${d * 32} -60 ${d * 34} -30 C${d * 35} -20 ${d * 36} -12 ${d * 38} -6 M${d * 38} -6 l${d * 6} 6 M${d * 38} -6 l${d * 1} 8 M${d * 38} -6 l${d * -4} 7 M${d * 34} -40 l${d * 8} -6`;
    return C(x, y, s, face, `<ellipse cx="0" cy="0.8" rx="40" ry="2.4" fill="${K}" opacity="0.45"/>`
        + `<path d="${arm(-1)} ${arm(1)}" ${st(7, G1)} fill="none"/><path d="${arm(-1)} ${arm(1)}" ${st(0.8)} fill="none"/>`
        + `<path d="M-16 0 C-14 -12 -18 -24 -14 -36 C-22 -56 -26 -86 -18 -104 C-14 -112 -6 -116 0 -116 C6 -116 14 -112 18 -104 C26 -86 22 -56 14 -36 C18 -24 14 -12 16 0 L5 0 L3 -24 L-3 -24 L-5 0 Z" fill="${G1}" ${st(1.4)}/>`
        + `<path d="${grain}" ${st(0.6, G3)} fill="none"/>`
        + `<path d="M-12 -96 C-6 -92 6 -92 12 -96 M-14 -88 C-6 -84 6 -84 14 -88 M-14 -80 C-6 -76 6 -76 14 -80 M-13 -72 C-6 -68 6 -68 13 -72" ${st(2.4, W)} fill="none"/><path d="M0 -98 L0 -66" ${st(2.6, W)}/>`
        + `<path d="M-11 -114 C-14 -128 -8 -140 0 -140 C8 -140 14 -128 11 -114 C9 -108 4 -106 0 -106 C-4 -106 -9 -108 -11 -114 Z" fill="${W}" ${st(1.2)}/>`
        + `<path d="${crown}" ${st(2.6, G3)} fill="none"/><path d="${crown}" ${st(0.5)} fill="none"/>`
        + `<path d="M-8 -126 C-9 -121 -6 -118 -3 -119 C-2 -123 -4 -127 -8 -126 Z M8 -126 C9 -121 6 -118 3 -119 C2 -123 4 -127 8 -126 Z" fill="${K}"/><circle cx="-5" cy="-122" r="0.9" fill="${RED}"/><circle cx="5" cy="-122" r="0.9" fill="${RED}"/>`
        + `<path d="M-1.4 -116 L1.4 -116 L0 -113 Z" fill="${K}"/><path d="M-6 -110 L-4 -108 L-2 -110 L0 -108 L2 -110 L4 -108 L6 -110" ${st(0.7)} fill="none"/>`);
}

/* ================================================================== props =================================================== */

/** An interior: shoji lattice with butterfly shadows, a dark floor, an optional lamp. */
export function shoji(lamp = true, dark = 0) {
    let s = `<rect width="400" height="250" fill="${W}"/>`;
    let d = '';
    for (let x = 0; x <= 400; x += 40) d += `M${x} 0 V180 `;
    for (let y = 0; y <= 180; y += 30) d += `M0 ${y} H400 `;
    s += `<path d="${d}" ${st(2.4, G3)}/>`;
    s += [[60, 50, 1.6, -20], [150, 110, 1.2, 15], [260, 40, 1.8, 10], [330, 120, 1.3, -14], [110, 150, 0.9, 6]].map(([x, y, sc, rot]) => `<g opacity="0.55">${butterfly(x, y, sc, rot).replace(new RegExp(K, 'g'), G1)}</g>`).join('');
    s += `<rect y="180" width="400" height="70" fill="${K}"/><path d="M0 180 H400" ${st(3, G3)}/>`;
    if (lamp) s += `<circle cx="200" cy="150" r="70" fill="${W}" opacity="0.5"/><rect x="194" y="150" width="12" height="24" fill="${W}" ${st(0.8)}/><circle cx="200" cy="146" r="4" fill="${W}" ${st(0.6)}/>`;
    if (dark) s += `<rect width="400" height="250" fill="${K}" opacity="${dark}"/>`;
    return s;
}

/* ================================================================== Ya, the feral huntress ================================== */

/** Ya at scene size: a mane of unbound black hair, fur wrap, leather, bone necklace, scarred bare arms, barefoot, spear. */
function yaFigure(x, y, s = 1, opts = {}) {
    const { face = 1, sway = 8, spear = true } = opts;
    const r = rng(271 + Math.round(x));
    const top = -100;
    let back = '';
    let body = '';
    let front = '';
    // the mane: wide, wild, falling past the hips, loose strands flying
    back += `<path d="M-6 ${top + 2} C-16 ${top + 10} -18 ${top + 30} -16 ${top + 50} C-15 ${top + 60} -12 ${top + 64} -8 ${top + 66} L9 ${top + 64} C14 ${top + 58} 18 ${top + 36} 14 ${top + 14} C12 ${top + 6} 9 ${top + 1} 6 ${top + 1} Z" fill="${K}"/>`;
    back += hairRibbons(r, -13, 12, top + 26, top + 74, sway, 12, 1.5);
    let flyD = '';
    for (let i = 0; i < 9; i++) { const sx = -12 + i * 3; flyD += `M${sx} ${top + 8 + (i % 3) * 6} q${f(-6 + i * 1.6)} ${-4 + (i % 2) * 2} ${f(-10 + i * 2.6)} ${-2 + (i % 3) * 3} `; }
    back += `<path d="${flyD}" ${st(0.8)} fill="none"/>`;
    if (spear) back += `<path d="M13 4 L19 ${top - 18}" ${st(1.3, G3)}/><path d="M19 ${top - 18} l-2 -9 l4.4 1.4 Z" fill="${W}" ${st(0.5)}/><path d="M18.4 ${top - 14} l-2.4 3 M18.6 ${top - 13} l2.6 2.6" ${st(0.5, RED)}/>`;
    // legs: bare below the knee, wrapped ankles, barefoot
    body += `<path d="M-4.4 -40 L-4.6 -2 L-1.4 -1.4 L-0.6 -40 Z M4.4 -40 L5 -2 L1.8 -1.4 L0.6 -40 Z" fill="${W}" ${st(0.45)}/>`;
    body += `<path d="M-4.6 -8 L-1.2 -7 M-4.6 -6 L-1.2 -5 M1.8 -7 L5 -8 M1.8 -5 L5 -6" ${st(0.4)}/><path d="M-5.4 0 Q-5 -1.6 -1.2 -1.4 L-0.6 0 Z M5.8 0 Q5.4 -1.6 1.8 -1.4 L1.2 0 Z" fill="${W}" ${st(0.4)}/>`;
    // leather wrap skirt with a ragged hem, a belt of cord and teeth
    body += `<path d="M-7 -58 C-8 -50 -9 -44 -8.6 -36 L-6 -38.6 L-4 -35 L-1.6 -38 L0.6 -34.6 L3 -38 L5 -35.4 L7.4 -38 L9 -36 C9 -44 8 -50 7 -58 Z" fill="${G3}" ${st(0.5)}/><path d="M-3 -56 L-4 -40 M2.6 -56 L3.4 -40" ${st(0.3, K)}/>`;
    body += `<path d="M-7.4 -58 Q0 -56.6 7.4 -58" ${st(1.1, RED)} fill="none"/>` + [-5, -2, 1, 4].map((dx) => `<path d="M${dx} -57.4 l0.6 3.4 l0.6 -3.4" fill="${W}" ${st(0.25)}/>`).join('');
    // torso: bound chest wrap of fur, bare midriff
    body += `<path d="M-6.4 -80 C-7.6 -74 -7 -66 -6 -58 L6 -58 C7 -66 7.6 -74 6.4 -80 Q0 -82 -6.4 -80 Z" fill="${W}" ${st(0.5)}/>`;
    body += `<path d="M-7.6 -82 C-8.4 -77 -7.6 -72 -6.6 -69 Q0 -67 6.6 -69 C7.6 -72 8.4 -77 7.6 -82 Q0 -85 -7.6 -82 Z" fill="${G1}" ${st(0.5)}/>`;
    let fur = '';
    for (let i = 0; i < 12; i++) fur += `M${f(-7 + i * 1.3)} -69.6 l${f((r() - 0.5) * 1.2)} ${f(1.4 + r())} `;
    body += `<path d="${fur}" ${st(0.35)}/><path d="M-6 -82 C-4 -79 -2 -77 0 -76 M6 -82 C4 -79 2 -77 0 -76" ${st(0.35)} fill="none"/>`;
    body += `<path d="M-1 -64 L1 -62" ${st(0.3)}/>`;
    // bare arms with scars; left hangs, right grips the spear
    body += `<path d="M-7.4 -81 C-10 -72 -10.6 -64 -10.4 -54 L-8 -54 C-8 -63 -7.6 -71 -6 -77 Z" fill="${W}" ${st(0.45)}/><path d="M-9.6 -70 l1.4 -1.2 M-9.8 -66 l1.6 -1 M-9.8 -62 l1.4 -1.4" ${st(0.3, RED)}/>` + hand(-9.2, -54, -1, 1);
    body += `<path d="M7.4 -81 C10 -74 12 -68 13.6 -62 L15.6 -63.6 C14 -70 11.6 -76 8.6 -82 Z" fill="${W}" ${st(0.45)}/><path d="M11.4 -73 l1.4 -1 M12.4 -69.6 l1.4 -1" ${st(0.3, RED)}/><ellipse cx="15" cy="-62" rx="1.6" ry="1.2" fill="${W}" ${st(0.4)}/>`;
    // neck, head, a grin; bone necklace
    front += `<path d="M-1.4 -88.8 L-1.6 -82.6 L1.6 -82.6 L1.4 -88.8 Z" fill="${W}" ${st(0.4)}/>`;
    front += `<path d="${headShape(top, 11.5, 4)}" fill="${W}" ${st(0.5)}/>`;
    front += `<path d="M-3.4 ${top + 6.2} L-0.8 ${top + 5.2} L-0.9 ${top + 5.9} Z M3.4 ${top + 6.2} L0.8 ${top + 5.2} L0.9 ${top + 5.9} Z" fill="${K}"/><circle cx="-2" cy="${top + 5.9}" r="0.4" fill="${GOLD}"/><circle cx="2" cy="${top + 5.9}" r="0.4" fill="${GOLD}"/>`;
    front += `<path d="M-3.4 ${top + 3.6} L-0.8 ${top + 4.2} M0.8 ${top + 4.2} L3.4 ${top + 3.6}" ${st(0.5)}/>`;
    front += `<path d="M-1.8 ${top + 9.4} Q0 ${top + 11} 1.9 ${top + 9.2} Z" fill="${W}" ${st(0.45)}/><path d="M-1.4 ${top + 9.6} L1.6 ${top + 9.6}" ${st(0.15)}/>`;
    front += `<path d="M2.6 ${top + 4.4} L3.6 ${top + 8}" ${st(0.35, RED)}/>`;
    front += `<path d="M-3.4 -85 Q0 -81.6 3.4 -85" ${st(0.35)} fill="none"/>` + [-2.4, -1.2, 0, 1.2, 2.4].map((dx, i) => `<path d="M${dx} ${-83.6 + Math.abs(dx) * -0.3} l${dx * 0.1} ${i === 2 ? 3 : 2}" ${st(0.7, W)}/>`).join('');
    // the wild fringe, uneven, falling into her eyes
    front += `<path d="M-4.6 ${top + 7} C-6 ${top - 1} -2.6 ${top - 4} 0.6 ${top - 3.6} C4 ${top - 3.6} 6.2 ${top} 4.6 ${top + 7} L3.6 ${top + 3} L2.8 ${top + 6.4} L1.6 ${top + 2.4} L0.4 ${top + 5} L-0.8 ${top + 2} L-2 ${top + 5.6} L-3.2 ${top + 2.6} Z" fill="${K}"/>`;
    front += `<path d="M-4.6 ${top + 2} C-6 ${top + 10} -6 ${top + 18} -7 ${top + 26} M4.6 ${top + 2} C6 ${top + 10} 6.4 ${top + 20} 8 ${top + 28}" ${st(1.4)} fill="none"/>`;
    front += `<path d="M-5.6 ${top + 1} C-6.6 ${top + 8} -6.4 ${top + 16} -7.4 ${top + 24}" ${st(0.6, RED)} fill="none"/>`;
    const shadow = `<ellipse cx="1" cy="0.4" rx="10" ry="1.4" fill="${K}" opacity="0.4"/>`;
    return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})">${shadow}${back}${body}${front}</g>`;
}

/** Ya, close: three-quarter the other way from Mei Lin, a wide grin with teeth, gold eyes, a scar, a mane of hair. */
export function yaCloseUp(id = 'yac') {
    const r = rng(9001);
    const cx = 196;
    let s = '';
    s += smoke([[410, 200], [340, 160], [300, 230], [250, 200]], 6) + butterfly(330, 60, 1.1, 14) + butterfly(70, 160, 0.9, -18);
    // the mane: enormous, flying out to both sides
    s += `<path d="M${cx - 60} 90 C${cx - 70} 30 ${cx - 30} 0 ${cx + 6} 2 C${cx + 46} 4 ${cx + 76} 30 ${cx + 70} 96 C${cx + 80} 150 ${cx + 100} 200 ${cx + 130} 262 L${cx - 140} 262 C${cx - 100} 200 ${cx - 76} 140 ${cx - 60} 90 Z" fill="${K}"/>`;
    s += hairRibbons(r, cx - 56, cx - 10, 110, 262, -60, 12, 2.1) + hairRibbons(r, cx + 14, cx + 66, 110, 262, 60, 12, 2.1);
    let fly = '';
    for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + 0.8 * (i / 17)); const x0 = cx + Math.cos(a) * 58; const y0 = 70 + Math.sin(a) * 60; fly += `M${f(x0)} ${f(y0)} q${f(Math.cos(a) * 18 + (r() - 0.5) * 10)} ${f(Math.sin(a) * 10)} ${f(Math.cos(a) * 30 + (r() - 0.5) * 16)} ${f(Math.sin(a) * 18 + 8)} `; }
    s += `<path d="${fly}" ${st(1.4)} fill="none"/><path d="M${cx - 66} 60 C${cx - 74} 110 ${cx - 70} 170 ${cx - 90} 230" ${st(4, RED)} fill="none"/>`;
    // shoulders: fur wrap, bare shoulder with a scar
    s += `<path d="M${cx - 96} 262 C${cx - 84} 210 ${cx - 50} 184 ${cx - 16} 176 L${cx + 22} 176 C${cx + 60} 186 ${cx + 92} 212 ${cx + 104} 262 Z" fill="${W}" ${st(1.2)}/>`;
    s += `<path d="M${cx - 100} 262 C${cx - 70} 214 ${cx - 30} 200 ${cx + 10} 214 C${cx + 40} 224 ${cx + 70} 230 ${cx + 106} 262 Z" fill="${G1}" ${st(1.2)}/>`;
    let fur = '';
    for (let i = 0; i < 30; i++) { const x = cx - 80 + i * 6; const y0 = 214 + Math.sin(i / 3) * 6 + (x > cx ? (x - cx) * 0.14 : (cx - x) * 0.05); fur += `M${f(x)} ${f(y0)} l${f((r() - 0.5) * 3)} ${f(6 + r() * 6)} `; }
    s += `<path d="${fur}" ${st(0.8)}/><path d="M${cx + 58} 196 l10 6 M${cx + 62} 192 l8 7" ${st(1.2, RED)}/>`;
    // necklace of teeth and small bones
    s += `<path d="M${cx - 30} 182 Q${cx + 4} 214 ${cx + 38} 182" ${st(1)} fill="none"/>` + Array.from({ length: 9 }, (_, i) => { const t = i / 8; const x = cx - 26 + t * 60; const y0 = 186 + Math.sin(t * Math.PI) * 22; return `<path d="M${f(x - 2)} ${f(y0)} L${f(x)} ${f(y0 + (i === 4 ? 14 : 8))} L${f(x + 2)} ${f(y0)} Z" fill="${i === 4 ? RED : W}" ${st(0.6)}/>`; }).join('');
    // neck
    s += `<path d="M${cx - 14} 130 C${cx - 14} 150 ${cx - 16} 166 ${cx - 22} 178 L${cx + 26} 178 C${cx + 18} 164 ${cx + 15} 148 ${cx + 15} 128 Z" fill="${W}" ${st(1)}/>`;
    // face, three-quarter to the right
    const face = `M${cx + 32} 72 C${cx + 33} 98 ${cx + 28} 116 ${cx + 16} 132 C${cx + 11} 138 ${cx + 8} 141 ${cx + 5} 141.5 C${cx - 2} 140 ${cx - 12} 132 ${cx - 22} 118 C${cx - 31} 104 ${cx - 34} 88 ${cx - 33} 70 Z`;
    s += `<path d="${face}" fill="${W}"/><clipPath id="${id}f"><path d="${face}"/></clipPath><g clip-path="url(#${id}f)"><path d="M${cx - 20} 70 C${cx - 28} 92 ${cx - 24} 116 ${cx - 6} 142 L${cx - 40} 142 L${cx - 40} 70 Z" fill="${G2}"/></g><path d="${face}" fill="none" ${st(1.2)}/>`;
    // fierce eyes: gold, narrowed, strong lower lid
    const eye = (ex, ey, w, h, k) => {
        const o = `M${ex - w} ${ey - h * 0.1} C${ex - w * 0.4} ${ey - h * 0.6} ${ex + w * 0.5} ${ey - h * 0.5} ${ex + w} ${ey + h * 0.05} C${ex + w * 0.5} ${ey + h * 0.5} ${ex - w * 0.4} ${ey + h * 0.5} ${ex - w} ${ey - h * 0.1} Z`;
        return `<clipPath id="${id}e${k}"><path d="${o}"/></clipPath><path d="${o}" fill="${W}"/><g clip-path="url(#${id}e${k})"><circle cx="${ex + w * 0.12}" cy="${ey + h * 0.05}" r="${h * 0.62}" fill="${GOLD}"/><circle cx="${ex + w * 0.12}" cy="${ey + h * 0.05}" r="${h * 0.26}" fill="${K}"/><path d="M${ex - w} ${ey - h} L${ex + w} ${ey - h} L${ex + w} ${ey - h * 0.05} Q${ex} ${ey - h * 0.4} ${ex - w} ${ey} Z" fill="${K}"/><circle cx="${ex - w * 0.08}" cy="${ey - h * 0.08}" r="${h * 0.14}" fill="${W}"/></g>`
            + `<path d="M${ex - w * 1.1} ${ey - h * 0.2} C${ex - w * 0.4} ${ey - h * 0.8} ${ex + w * 0.5} ${ey - h * 0.75} ${ex + w * 1.15} ${ey - h * 0.05} L${ex + w * 1.6} ${ey - h * 0.5} L${ex + w * 1.1} ${ey + h * 0.2} C${ex + w * 0.5} ${ey - h * 0.4} ${ex - w * 0.4} ${ey - h * 0.45} ${ex - w} ${ey} Z" fill="${K}"/>`
            + `<path d="M${ex - w * 0.9} ${ey + h * 0.15} C${ex - w * 0.3} ${ey + h * 0.6} ${ex + w * 0.5} ${ey + h * 0.55} ${ex + w} ${ey + h * 0.15}" ${st(1)} fill="none"/>`;
    };
    s += eye(cx - 13, 98, 9.4, 7, 1) + eye(cx + 19, 98, 7.2, 6, 2);
    // brows: low, angled, fierce
    s += `<path d="M${cx - 26} 86 L${cx - 4} 90 M${cx + 8} 89.6 L${cx + 28} 86.4" ${st(2)} fill="none"/>`;
    // a scar through the left brow and cheek
    s += `<path d="M${cx - 22} 80 L${cx - 14} 112" ${st(1.4, RED)}/>`;
    // nose
    s += `<path d="M${cx + 6} 100 C${cx + 7} 108 ${cx + 9} 113 ${cx + 8} 118 L${cx + 4} 118.6" ${st(0.8)} fill="none"/>`;
    // the grin: wide, teeth, one canine
    s += `<path d="M${cx - 12} 124 Q${cx + 2} 136 ${cx + 18} 123 Q${cx + 4} 128 ${cx - 12} 124 Z" fill="${K}"/><path d="M${cx - 10} 124.6 Q${cx + 2} 129.6 ${cx + 16} 123.8 L${cx + 15} 126 Q${cx + 2} 131 ${cx - 9} 126.6 Z" fill="${W}"/><path d="M${cx + 10} 126 l1.4 3.6 l1.2 -3.8" fill="${W}" ${st(0.5)}/><path d="M${cx - 12} 124 Q${cx + 2} 136 ${cx + 18} 123 l2 -2" ${st(0.9)} fill="none"/>`;
    // the fringe: ragged, into her eyes
    s += `<path d="M${cx - 38} 92 C${cx - 44} 40 ${cx - 16} 16 ${cx + 8} 16 C${cx + 34} 16 ${cx + 46} 40 ${cx + 40} 92 L${cx + 34} 80 L${cx + 28} 94 L${cx + 20} 78 L${cx + 12} 90 L${cx + 4} 76 L${cx - 4} 88 L${cx - 12} 76 L${cx - 20} 90 L${cx - 28} 78 L${cx - 32} 92 Z" fill="${K}"/>`;
    s += `<path d="${Array.from({ length: 12 }, (_, i) => { const x = cx - 30 + i * 6; return `M${f(cx + (x - cx) * 0.3)} 24 Q${f(x)} 48 ${f(x + (r() - 0.5) * 4)} 74`; }).join(' ')}" ${st(0.6, W)} fill="none" opacity="0.85"/>`;
    s += `<path d="M${cx - 38} 70 C${cx - 46} 110 ${cx - 46} 150 ${cx - 54} 190 M${cx + 40} 70 C${cx + 48} 110 ${cx + 50} 150 ${cx + 60} 196" ${st(6)} fill="none"/>`;
    // a red feather and a bone tied into the hair
    s += `<path d="M${cx + 44} 30 C${cx + 60} 18 ${cx + 74} 18 ${cx + 84} 6 C${cx + 76} 22 ${cx + 62} 30 ${cx + 46} 36 Z" fill="${RED}" ${st(0.8)}/><path d="M${cx + 46} 34 L${cx + 82} 8" ${st(0.6)}/>`;
    s += `<path d="M${cx - 50} 40 L${cx - 30} 22" ${st(4, W)}/><path d="M${cx - 50} 40 L${cx - 30} 22" ${st(0.6)} fill="none" stroke-dasharray="0.1 22"/><circle cx="${cx - 51}" cy="41" r="3" fill="${W}" ${st(0.8)}/><circle cx="${cx - 29}" cy="21" r="3" fill="${W}" ${st(0.8)}/>`;
    return s;
}

/* ================================================================== creatures ================================================ */
// Elegant and graphic: black masses with white line detail, a touch of red in the eyes. Unit space: feet at 0, facing right.
const C = (x, y, s, face, body) => `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * face)} ${f(s)})">${body}</g>`;
const eyeR = (x, y, r = 1.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${RED}"/><circle cx="${f(x + r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.35)}" fill="${W}"/>`;
const furLines = (pts, w = 0.5) => `<path d="${pts.map(([x, y, dx, dy]) => `M${x} ${y} l${dx} ${dy}`).join(' ')}" ${st(w, W)} fill="none"/>`;
const shadowC = (rx) => `<ellipse cx="0" cy="0.6" rx="${rx}" ry="1.2" fill="${K}" opacity="0.4"/>`;

export function jackal(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(22)
        + `<path d="M-14 -11 L-12 -4 L-13.4 0 L-11 0 L-9.6 -5 L-8 -9 Z M8 -9 L10 -4 L9.4 0 L11.6 0 L12.4 -5 L12 -9 Z" fill="${G3}"/>`
        + `<path d="M-16 -12 C-10 -17 4 -17 11 -14 L14 -18 C16 -22 20 -24 24 -22 L31 -18.6 L29.6 -16.6 L24.4 -15.6 C20.6 -14 18 -11.6 16 -9.6 L14.4 -5.6 L15.6 0 L13 0 L11 -5.8 L8 -8.4 C2 -8 -6 -8 -10 -8.4 L-11.6 -4 L-10.6 0 L-13.2 0 L-15.2 -5 C-17 -8 -18 -10 -16 -12 Z" fill="${K}"/>`
        + `<path d="M17.6 -21 L18.4 -30 L22.2 -22.4 Z" fill="${K}"/><path d="M18.8 -22 L19 -27 L21 -22.6 Z" fill="${G3}"/>`
        + `<path d="M-16 -12 C-24 -15 -31 -9 -34 -1 C-30 -4 -26 -6 -22 -7 C-26 -3 -27 0 -27 2 C-22 -4 -18 -8 -15.4 -9.6 Z" fill="${K}"/>`
        + furLines([[-10, -15.6, 1.4, -2.6], [-6, -16.2, 1.2, -3], [-2, -16.4, 1.2, -3.2], [2, -16.2, 1, -2.8], [6, -15.4, 1, -2.4], [-30, -6, 2, -2], [-26, -8, 2, -1.6], [-4, -11, 3, 0.4], [2, -11.4, 3, 0.4]])
        + `<path d="M25 -16 l1 1.6 l1 -1.6 l1 1.6 l1 -1.8" ${st(0.4, W)} fill="none"/>` + eyeR(23.4, -20.4, 1.1));
}
export function wolf(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(26)
        + `<path d="M-17 -14 L-15 -5 L-16 0 L-13 0 L-11.6 -6 L-10 -11 Z M9 -11 L11 -5 L10.4 0 L13 0 L13.8 -6 L13 -11 Z" fill="${G3}"/>`
        + `<path d="M-20 -14 C-12 -21 4 -22 12 -19 C14 -25 20 -28 25 -27 L34 -22 L32.4 -19.4 L26 -18.4 C22 -16 19 -12.6 17 -10 L15.6 -5.6 L17 0 L14 0 L12 -6 L9 -9.6 C2 -9 -6 -9 -12 -9.6 L-13.6 -4.6 L-12.6 0 L-15.4 0 L-17.6 -5 C-20 -8.6 -21.6 -11.6 -20 -14 Z" fill="${K}"/>`
        + `<path d="M12 -19 C10 -14 11 -10 13.4 -8 C15 -12 16 -16 15 -20 Z" fill="${G3}"/>`
        + `<path d="M19 -26 L19.6 -34 L23.6 -26.6 Z" fill="${K}"/>`
        + `<path d="M-20 -14 C-30 -17 -36 -10 -39 -2 C-34 -6 -30 -8 -26 -9 C-28 -5 -30 -2 -30 1 C-24 -5 -20 -10 -18 -11.6 Z" fill="${K}"/>`
        + furLines([[-14, -18.6, 1.4, -2.8], [-10, -19.6, 1.4, -3], [-6, -20, 1.2, -3.2], [-2, -20, 1, -3], [2, -19.6, 1, -2.6], [12, -20, -1.4, 4], [13.4, -17, -1.4, 4], [-34, -6, 2, -2], [-30, -8, 2, -1.6]])
        + `<path d="M27 -18.4 l1 1.6 l1 -1.6 l1 1.6 l1 -1.8" ${st(0.4, W)} fill="none"/>` + eyeR(25.2, -24, 1.3));
}
export function boar(x, y, s = 1, face = 1) {
    let br = '';
    for (let i = 0; i < 14; i++) { const t = i / 13; const bx = -22 + t * 46; const by = -30 - Math.sin(t * Math.PI) * 6; br += `M${f(bx)} ${f(by + 3)} l${f(1 - t * 2)} -6 `; }
    return C(x, y, s, face, shadowC(30)
        + `<path d="M-20 -8 L-21 0 L-17 0 L-15.6 -7 Z M14 -8 L15 0 L19 0 L19.4 -8 Z" fill="${G3}"/>`
        + `<path d="M-26 -8 C-30 -24 -18 -34 0 -35 C16 -36 26 -28 30 -20 L38 -16 L39 -10.6 L32 -8.6 L27 -7.6 L26 0 L21 0 L19.6 -6.6 L-13 -6.6 L-14 0 L-19 0 L-21 -4.6 C-24 -5 -26 -6 -26 -8 Z" fill="${K}"/>`
        + `<path d="${br}" ${st(1.4)} fill="none"/><path d="${br}" ${st(0.4, W)} fill="none"/>`
        + furLines([[-18, -22, 4, 6], [-10, -26, 4, 7], [-2, -28, 4, 8], [6, -28, 4, 8], [14, -25, 3, 7], [24, -20, -1, 5]], 0.6)
        + `<path d="M33 -11 C38 -15 38 -21 33.6 -24" ${st(2.2, W)} fill="none"/><path d="M33 -11 C38 -15 38 -21 33.6 -24" ${st(0.5)} fill="none"/>`
        + `<path d="M26 -24 L28 -30 L30.6 -24 Z" fill="${K}"/>` + eyeR(29, -20, 1.4));
}
export function rat(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(14)
        + `<path d="M-10 -4 C-20 -2 -28 -6 -34 -2" ${st(1.2, G1)} fill="none"/>`
        + `<path d="M-11 -4 C-12 -10 -4 -13 4 -12 C8 -12 11 -10 13 -8 L17 -6.6 L13 -5 L10 -3 L10.6 0 L8.6 0 L7.6 -2.6 L-4 -2.6 L-5.4 0 L-7.6 0 L-8 -2.6 C-10 -2.4 -11 -3 -11 -4 Z" fill="${K}"/>`
        + `<circle cx="7.6" cy="-12" r="2.2" fill="${K}"/><circle cx="7.6" cy="-12" r="1" fill="${G3}"/>`
        + furLines([[-8, -9, 1, -1.6], [-4, -10.6, 1, -1.8], [0, -11.4, 1, -1.8], [4, -11.4, 1, -1.4]], 0.4) + `<path d="M15 -6.4 l5 -1 M15 -6 l5 1" ${st(0.25, W)}/>` + eyeR(11.4, -8.6, 0.8));
}
export function crow(x, y, s = 1, face = 1) {
    let tips = '';
    for (let i = 0; i < 5; i++) tips += `M${-14 - i * 3} ${-8 - i * 2.4} l${-4 - i * 0.4} ${-4 + i * 0.6} `;
    return C(x, y, s, face,
        `<path d="M-2 0 C-8 -6 -14 -10 -18 -12 L-24 -16 L-21 -12.6 L-28 -16.4 L-24 -12 L-31 -14.4 L-26 -10.6 L-32 -11 L-25 -7.6 C-18 -6 -10 -2 -4 2 Z" fill="${K}"/>`
        + `<path d="M-2 0 C-6 -6 -8 -14 -6 -22 L-2 -28 L-2.6 -22 L2 -27 L0.4 -21 L5 -24 L2 -18 L6 -18 L1.6 -12 C1 -6 0 -2 -2 0 Z" fill="${K}"/>`
        + `<path d="M-6 2 C-2 -2 4 -3 9 -1 L13 -1.4 L16 0.2 L12.6 1 C8 3 2 4 -4 4 L-10 7 L-8 3 Z" fill="${K}"/>`
        + `<path d="M-12 -7 C-16 -9 -20 -10 -24 -11 M-4 -10 C-3 -16 -3 -20 -2 -24" ${st(0.4, W)} fill="none"/>` + eyeR(10, -0.6, 0.8));
}
export function lizard(x, y, s = 1, face = 1) {
    let spines = '';
    for (let i = 0; i < 10; i++) { const sx = -28 + i * 6.4; const h = 10 - Math.abs(i - 4.5) * 1.4; spines += `<path d="M${f(sx)} ${f(-11 + Math.abs(i - 4.5) * 0.5)} L${f(sx + 2.4)} ${f(-11 - h)} L${f(sx + 4.6)} ${f(-11 + Math.abs(i - 4.5) * 0.5)} Z" fill="${K}"/><path d="M${f(sx + 2.4)} ${f(-11 - h + 2)} L${f(sx + 2.4)} ${f(-12)}" ${st(0.3, W)}/>`; }
    return C(x, y, s, face, shadowC(40) + spines
        + `<path d="M-60 -4 C-48 -8 -38 -12 -26 -12 C-6 -14 14 -13 28 -9 L40 -8 L45 -4.4 L32 -2.4 L27 -1.2 L28 2 L24 2 L22 -2 C14 -3 -8 -3 -14 -3 L-16 1.6 L-20 1.6 L-20 -3 C-34 -3 -48 -1 -60 -4 Z" fill="${K}"/>`
        + `<path d="M-50 -5 C-38 -7 -24 -8 -12 -7.6 M0 -8 C12 -8 22 -7 30 -5.6" ${st(0.4, W)} fill="none"/><path d="M33 -4.6 l2 1.4 l2 -1.4 l2 1.4" ${st(0.35, W)} fill="none"/>`
        + `<circle cx="36" cy="-7" r="1.4" fill="${GOLD}"/><path d="M36 -8.2 L36 -5.8" ${st(0.5)}/>`);
}
export function hare(x, y, s = 1, face = 1) {
    let plates = '';
    for (let i = 0; i < 5; i++) plates += `<path d="M${-8 + i * 3.6} ${-9 - Math.sin((i / 4) * Math.PI) * 2} L${-6 + i * 3.6} ${-15 - Math.sin((i / 4) * Math.PI) * 3} L${-4 + i * 3.6} ${-9 - Math.sin((i / 4) * Math.PI) * 2} Z" fill="${G2}" ${st(0.4)}/>`;
    return C(x, y, s, face, shadowC(12)
        + `<path d="M-10 -2 C-12 -8 -8 -12 0 -12 C6 -12 9 -10 10 -7 L14 -8 C16 -8 17 -6 16 -5 L12 -3.6 L11 0 L8.6 0 L8 -2 L-6 -2 L-7.6 0 L-10 0 Z" fill="${W}" ${st(0.7)}/>`
        + plates + `<path d="M10 -10 L9 -20 L12 -11 M12 -10 L13 -19 L14 -10" fill="${W}" ${st(0.6)}/><circle cx="12.6" cy="-7.4" r="0.8" fill="${K}"/>`);
}
export function fowl(x, y, s = 1, face = 1) {
    return C(x, y, s, face, shadowC(12)
        + `<path d="M-12 -6 C-12 -12 -4 -14 4 -12 C8 -14 10 -20 10 -26 C10 -30 13 -31 15 -29 L19 -28 L15 -27 C14 -22 13 -16 11 -10 C10 -5 6 -2 0 -2 L-6 -2 C-9 -2 -11 -3 -12 -6 Z" fill="${G3}" ${st(0.6)}/>`
        + `<path d="M-10 -7 C-6 -9 0 -9 4 -8 M-8 -5 C-4 -6 0 -6 3 -5" ${st(0.4, W)} fill="none"/><path d="M-1 -2 L-2 0 M3 -2 L4 0" ${st(0.6)}/><circle cx="14" cy="-28.6" r="0.7" fill="${RED}"/>`);
}

/* new creatures for Act 1 */
export function boneElk(x, y, s = 1, face = 1) {
    const ant = (d) => `<path d="M${d * 2} -38 C${d * 4} -48 ${d * 10} -54 ${d * 18} -62 M${d * 6} -46 C${d * 10} -48 ${d * 14} -46 ${d * 18} -48 M${d * 10} -52 C${d * 8} -58 ${d * 9} -62 ${d * 10} -66 M${d * 14} -56 C${d * 20} -56 ${d * 24} -54 ${d * 26} -50" ${st(3)} fill="none"/><path d="M${d * 2} -38 C${d * 4} -48 ${d * 10} -54 ${d * 18} -62 M${d * 6} -46 C${d * 10} -48 ${d * 14} -46 ${d * 18} -48 M${d * 10} -52 C${d * 8} -58 ${d * 9} -62 ${d * 10} -66 M${d * 14} -56 C${d * 20} -56 ${d * 24} -54 ${d * 26} -50" ${st(1.8, W)} fill="none"/>`;
    let ribs = '';
    for (let i = 0; i < 6; i++) ribs += `M${-14 + i * 4.6} -30 C${-15 + i * 4.6} -26 ${-14 + i * 4.6} -22 ${-12 + i * 4.6} -19 `;
    return C(x, y, s, face, shadowC(26)
        + `<path d="M-14 -20 L-15 0 L-12.6 0 L-11 -18 Z M12 -20 L13 0 L15.4 0 L15.6 -20 Z" fill="${G3}"/>`
        + `<path d="M-20 -24 C-20 -32 -10 -34 4 -33 C10 -33 13 -36 16 -42 L20 -40 L28 -36 L27 -32.6 L20 -32 C17 -28 18 -22 16 -18 L17 0 L14.6 0 L12.6 -16 L-12 -16 L-14 0 L-16.4 0 L-17 -18 C-19 -19 -20 -21 -20 -24 Z" fill="${K}"/>`
        + `<path d="${ribs}" ${st(0.8, W)} fill="none"/><path d="M-18 -26 C-10 -29 0 -30 8 -30" ${st(0.6, W)} fill="none"/>`
        + `<path d="M17 -40 C19 -36 22 -35 26 -35" ${st(0.6, W)} fill="none"/>` + ant(1) + ant(-0.6) + eyeR(20.6, -37.4, 1.1));
}
export function rootWyrm(x, y, s = 1, face = 1) {
    let seg = '';
    for (let i = 0; i < 9; i++) { const t = i / 8; const sx = -60 + t * 70; const sy = -Math.sin(t * Math.PI) * 46; seg += `<path d="M${f(sx - 5)} ${f(sy - 7)} Q${f(sx)} ${f(sy - 11)} ${f(sx + 5)} ${f(sy - 7)}" ${st(0.6, W)} fill="none"/>`; }
    return C(x, y, s, face,
        `<path d="M-70 4 C-66 -30 -50 -62 -20 -60 C4 -58 10 -30 14 -18 C16 -10 22 -12 26 -18 L34 -28 L44 -26 L40 -18 L46 -16 L36 -10 C28 -2 16 2 8 -6 C4 -12 2 -30 -14 -36 C-34 -42 -46 -20 -52 4 Z" fill="${G3}" ${st(1)}/>`
        + seg + `<path d="M-66 2 C-64 -4 -60 -8 -58 -2 M-52 4 C-50 -2 -46 -2 -44 4" ${st(1.4)} fill="none"/>`
        + `<path d="M34 -28 C30 -36 26 -40 20 -40 M40 -26 C42 -34 46 -38 52 -38 M38 -27 C38 -36 36 -44 32 -48" ${st(1.2)} fill="none"/>`
        + `<path d="M36 -16 l2 3 l2 -3 l2 3" ${st(0.5, W)} fill="none"/>` + eyeR(36, -22, 1.6) + eyeR(31, -21, 1.1));
}
export function drowned(x, y, s = 1, face = 1, n = 0) {
    const hair = `<path d="M-4 -46 C-7 -40 -7 -30 -9 -18 M-2 -46 C-3 -38 -4 -28 -5 -16 M2 -46 C3 -38 3 -30 2 -20 M4 -46 C7 -40 8 -30 9 -22" ${st(0.9)} fill="none"/>`;
    return C(x, y, s, face,
        `<path d="M-6 0 C-7 -14 -7 -28 -6 -38 C-7 -42 -6 -46 -4 -48 C-2 -51 2 -51 4 -48 C6 -46 7 -42 6 -38 C7 -28 7 -14 6 0 Z" fill="${G1}" ${st(0.7)}/>`
        + `<path d="M-6 -38 C-12 -30 -14 -18 -16 -6 L-14 -6 C-12 -16 -10 -26 -5 -32 M6 -38 C12 -32 16 -24 18 -14 L16 -14 C14 -22 10 -28 5 -32" fill="${G1}" ${st(0.6)}/>`
        + `<path d="M-16 -6 l-1.4 4 M-15 -6 l0 4.4 M-14 -6 l1 4" ${st(0.4)}/>` + hair
        + `<ellipse cx="-1.6" cy="-43" rx="1" ry="1.4" fill="${W}"/><ellipse cx="1.6" cy="-43" rx="1" ry="1.4" fill="${W}"/><path d="M-1 -39.6 Q0 -38.6 1 -39.6" ${st(0.5)} fill="none"/>`
        + `<rect x="-12" y="-4" width="24" height="5" fill="${G3}" opacity="0.8"/>`);
}
export function serpent(x, y, s = 1, face = 1) {
    return C(x, y, s, face,
        `<path d="M-50 2 C-40 -10 -30 -10 -24 -2 C-18 6 -10 4 -6 -10 C-2 -26 0 -46 10 -56 C18 -62 28 -60 32 -54 L40 -52 L34 -46 C28 -48 22 -48 18 -42 C12 -32 12 -10 4 4 C-4 16 -16 14 -26 6 C-32 0 -40 0 -46 6 Z" fill="${K}"/>`
        + `<path d="M8 -52 C4 -44 2 -30 0 -16 M14 -50 L20 -60 L22 -50 M-28 0 L-34 -8 L-36 2" ${st(0.6, W)} fill="none"/><path d="M33 -52 l1.6 2 l1.6 -2" ${st(0.4, W)} fill="none"/>` + eyeR(28, -55, 1.3)
        + `<path d="M-60 4 Q-30 0 0 4 T60 4" ${st(1, W)} fill="none"/>`);
}
export function rotApe(x, y, s = 1, face = 1) {
    let fur = '';
    for (let i = 0; i < 16; i++) fur += `M${-14 + i * 1.8} ${-44 + Math.abs(i - 8) * 1.4} l${1 - (i % 3)} 5 `;
    return C(x, y, s, face, shadowC(22)
        + `<path d="M-16 -8 C-20 -24 -18 -40 -10 -48 C-4 -54 6 -54 12 -48 C18 -42 20 -30 18 -16 L22 -4 L24 0 L18 0 L14 -10 L6 -12 L4 0 L-2 0 L-2 -10 C-8 -10 -12 -8 -16 -8 Z" fill="${K}"/>`
        + `<path d="M-14 -40 C-24 -32 -28 -16 -28 2 L-24 2 C-24 -12 -20 -24 -12 -32 Z M14 -42 C24 -36 30 -22 30 -2 L34 2 L28 2 C26 -14 22 -26 14 -34 Z" fill="${K}"/>`
        + `<path d="M0 -50 C-4 -54 -4 -60 0 -62 C6 -64 10 -60 10 -54 C10 -50 6 -48 2 -48 Z" fill="${K}"/>`
        + `<path d="${fur}" ${st(0.5, W)} fill="none"/><path d="M2 -55 l6 0" ${st(0.4, W)}/>` + eyeR(3, -57, 1.1) + eyeR(7.6, -57, 1.1)
        + `<path d="M4 -52 l1 1.4 l1 -1.4 l1 1.4" ${st(0.4, W)} fill="none"/>`);
}
export function cinderHawk(x, y, s = 1, face = 1) {
    return C(x, y, s, face,
        `<path d="M0 0 C-6 -8 -16 -12 -30 -14 L-24 -10 L-34 -10 L-26 -6 L-36 -4 L-26 -2 C-16 0 -8 2 -2 4 Z" fill="${K}"/>`
        + `<path d="M0 0 C4 -8 6 -18 2 -30 L8 -24 L8 -34 L12 -24 L14 -32 L14 -20 C12 -10 8 -4 4 2 Z" fill="${K}"/>`
        + `<path d="M-4 2 C2 -2 8 -2 12 0 L16 -1 L14 2 C10 4 4 6 -2 6 L-10 10 L-8 5 Z" fill="${K}"/>`
        + `<path d="M-30 -14 L-36 -10 M-34 -10 L-38 -5 M-36 -4 L-39 0 M8 -34 L10 -38 M14 -32 L17 -35" ${st(1.4, RED)}/>`
        + `<circle cx="-40" cy="-2" r="0.8" fill="${RED}"/><circle cx="18" cy="-38" r="0.7" fill="${RED}"/><circle cx="-36" cy="-16" r="0.6" fill="${RED}"/>` + eyeR(12.6, -0.6, 0.7));
}
/** The guardian: a tall construct of grown wood and bone, branch-crowned, hollow-eyed. */
export function guardian(x, y, s = 1, face = 1) {
    let grain = '';
    for (let i = 0; i < 9; i++) grain += `M${-8 + i * 2} -20 C${-9 + i * 2} -50 ${-7 + i * 2.2} -80 ${-6 + i * 1.6} -110 `;
    let crown = '';
    for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + 0.7 * (i / 6)); crown += `M0 -150 L${f(Math.cos(a) * 30)} ${f(-150 + Math.sin(a) * 34)} l${f(Math.cos(a - 0.6) * 8)} ${f(Math.sin(a - 0.6) * 8)} `; }
    return C(x, y, s, face, `<ellipse cx="0" cy="0.8" rx="34" ry="2.4" fill="${K}" opacity="0.4"/>`
        + `<path d="M-14 0 C-12 -10 -14 -20 -10 -30 L-14 -60 C-22 -80 -20 -110 -12 -126 C-8 -134 8 -134 12 -126 C20 -110 22 -80 14 -60 L10 -30 C14 -20 12 -10 14 0 L4 0 L2 -26 L-2 -26 L-4 0 Z" fill="${G2}" ${st(1.2)}/>`
        + `<path d="${grain}" ${st(0.5, G3)} fill="none"/>`
        + `<path d="M-14 -60 C-30 -70 -40 -86 -46 -104 M-46 -104 l-6 -6 M-46 -104 l2 -9 M-46 -104 l-9 1 M14 -62 C30 -60 42 -48 50 -32 M50 -32 l7 -4 M50 -32 l2 8 M50 -32 l8 3" ${st(5, G2)} fill="none"/><path d="M-14 -60 C-30 -70 -40 -86 -46 -104 M14 -62 C30 -60 42 -48 50 -32" ${st(0.8)} fill="none"/>`
        + `<path d="M-10 -100 C-6 -96 6 -96 10 -100 L8 -86 C4 -82 -4 -82 -8 -86 Z M-12 -76 L12 -76 M-12 -70 L12 -70 M-11 -64 L11 -64" fill="${W}" ${st(0.8)}/>`
        + `<path d="M-12 -128 C-14 -142 -8 -152 0 -152 C8 -152 14 -142 12 -128 C8 -122 -8 -122 -12 -128 Z" fill="${W}" ${st(1)}/>`
        + `<path d="${crown}" ${st(2.2, G3)} fill="none"/>`
        + `<ellipse cx="-5" cy="-138" rx="3.4" ry="4.6" fill="${K}"/><ellipse cx="5" cy="-138" rx="3.4" ry="4.6" fill="${K}"/><circle cx="-5" cy="-137" r="0.9" fill="${RED}"/><circle cx="5" cy="-137" r="0.9" fill="${RED}"/>`
        + `<path d="M-4 -128 L-2 -126 L0 -128 L2 -126 L4 -128" ${st(0.6)} fill="none"/>`);
}

/* ================================================================== props ==================================================== */
/** The dead Hearth Tree: an enormous grey trunk, bark fissures, a dark opening at its foot. */
export function deadTrunk(cx = 200, w = 170, door = true) {
    let fis = '';
    for (let i = 0; i < 12; i++) { const x = cx - w / 2 + 10 + i * ((w - 20) / 11); fis += `M${f(x)} 0 C${f(x - 6)} 80 ${f(x + 6)} 160 ${f(x - 4)} 250 `; }
    let s = `<path d="M${cx - w / 2} 0 C${cx - w / 2 - 10} 120 ${cx - w / 2 - 20} 200 ${cx - w / 2 - 70} 250 L${cx + w / 2 + 70} 250 C${cx + w / 2 + 20} 200 ${cx + w / 2 + 10} 120 ${cx + w / 2} 0 Z" fill="${G1}" ${st(1.4)}/><path d="${fis}" ${st(1.2, G3)} fill="none"/>`;
    s += `<path d="M${cx - w / 2 - 40} 250 C${cx - w / 2 - 70} 236 ${cx - w / 2 - 110} 240 ${cx - w / 2 - 140} 250 M${cx + w / 2 + 40} 250 C${cx + w / 2 + 70} 234 ${cx + w / 2 + 120} 240 ${cx + w / 2 + 160} 250" ${st(10, G1)} fill="none"/>`;
    if (door) s += `<path d="M${cx - 26} 250 C${cx - 30} 200 ${cx - 16} 168 ${cx} 160 C${cx + 16} 168 ${cx + 30} 200 ${cx + 26} 250 Z" fill="${K}" ${st(1.2)}/>`;
    return s;
}
/** Inside: the hollow of the tree, ribs of wood rising into dark, shafts of pale light. */
export function hollowInside(light = true) {
    let s = `<rect width="400" height="250" fill="${K}"/>`;
    if (light) s += [[120, 30], [220, 60], [300, 20]].map(([x, w]) => `<path d="M${x} 0 L${x + w} 0 L${x + w * 2.4} 250 L${x - w * 0.6} 250 Z" fill="${W}" opacity="0.12"/>`).join('');
    for (let i = 0; i < 7; i++) { const x = 20 + i * 60; s += `<path d="M${x} 250 C${x - 10} 160 ${x + 20} 80 ${x + 4} 0" ${st(14, G3)} fill="none"/><path d="M${x} 250 C${x - 10} 160 ${x + 20} 80 ${x + 4} 0" ${st(1, G1)} fill="none"/>`; }
    s += `<rect y="210" width="400" height="40" fill="${G3}"/><path d="M0 210 H400" ${st(1.4)}/>`;
    return s;
}
/** The seed-ship: a hull of grown wood, curving ribs, living-tech seams with faint white light. */
export function shipHull(cx = 200, bright = 0.5) {
    let s = `<rect width="400" height="250" fill="${K}"/>`;
    s += `<path d="M-20 250 C40 120 140 60 260 70 C340 76 400 120 430 170 L430 250 Z" fill="${G3}" ${st(1.6)}/>`;
    for (let i = 0; i < 8; i++) { const x = 30 + i * 48; s += `<path d="M${x} 250 C${x + 10} 180 ${x + 30} 120 ${x + 60} ${90 + Math.abs(i - 4) * 6}" ${st(6, G1)} fill="none"/><path d="M${x} 250 C${x + 10} 180 ${x + 30} 120 ${x + 60} ${90 + Math.abs(i - 4) * 6}" ${st(0.8, W)} fill="none" opacity="${bright}"/>`; }
    s += `<path d="M20 200 C120 150 260 140 400 160" ${st(2, W)} fill="none" opacity="${bright}"/><path d="M40 222 C140 180 260 172 400 188" ${st(1, W)} fill="none" opacity="${bright}"/>`;
    s += `<circle cx="${cx + 60}" cy="120" r="${30 + bright * 30}" fill="${W}" opacity="${0.18 * bright + 0.05}"/>`;
    return s;
}
/** The seed-sliver: living heartwood, white with a red seam, glowing. */
export function seedSliver(cx = 200, cy = 125, s = 1) {
    return `<g transform="translate(${cx} ${cy}) scale(${s}) rotate(-24)"><circle r="80" fill="${W}" opacity="0.18"/><circle r="46" fill="${W}" opacity="0.22"/><path d="M-70 0 C-40 -14 40 -14 74 0 C40 12 -40 12 -70 0 Z" fill="${W}" ${st(1.4)}/><path d="M-60 0 C-20 -4 30 -4 66 0" ${st(1.6, RED)} fill="none"/><path d="M-40 -6 C-20 -9 10 -9 30 -7 M-36 6 C-10 8 20 8 40 6" ${st(0.6, G1)} fill="none"/></g>`;
}
/** A white sapling with a faint glow: the first grown thing in Ashfall. */
export function sapling(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="-40" r="40" fill="${W}" opacity="0.3"/><path d="M0 0 C-2 -20 2 -40 0 -64 M0 -30 C-10 -36 -16 -44 -18 -52 M0 -44 C8 -50 14 -58 16 -66 M0 -56 C-6 -62 -8 -70 -8 -76" ${st(2.4, W)} fill="none"/><path d="M0 0 C-2 -20 2 -40 0 -64" ${st(0.6)} fill="none"/>${[[-18, -52], [16, -66], [-8, -76], [0, -64], [10, -40], [-12, -34]].map(([lx, ly]) => `<ellipse cx="${lx}" cy="${ly}" rx="4.4" ry="2.4" fill="${W}" ${st(0.5)} transform="rotate(${lx > 0 ? -30 : 30} ${lx} ${ly})"/>`).join('')}<path d="M-12 0 Q0 -4 12 0" ${st(1.4, G3)} fill="none"/></g>`;
}
