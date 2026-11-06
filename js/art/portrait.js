/**
 * Close-ups in a dark, flowing shōjo-gothic manhua style: heavy black masses, vertical screentone,
 * hair falling in long ribbons, drifting smoke, butterflies and moons, half-lidded eyes, red knots and lips,
 * hatched shadows. Space: the scene viewBox (400×250). Each portrait draws its own background.
 */
const f = (n) => Math.round(n * 10) / 10;
const K = '#111010';
const W = '#fbfaf7';
const RED = '#a02c2c';
const DARKRED = '#7a1d24';
const SMOKE = '#a7a29a';
const G2 = '#c8c3bb';
const ln = (w = 1.2) => `stroke="${K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
function rng(seed) {
    let x = seed >>> 0 || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 100000) / 100000; };
}

/** Vertical screentone lines over the whole plate. */
export function hatch(step = 3.1, w = 0.55, opacity = 0.75) {
    let d = '';
    for (let x = 0.8; x < 400; x += step) d += `M${f(x)} 0 V250`;
    return `<rect width="400" height="250" fill="${W}"/><path d="${d}" stroke="${K}" stroke-width="${w}" opacity="${opacity}"/>`;
}

/** Shared pattern/gradient defs: diagonal shadow hatching and a dark vignette. */
export function shadeDefs(id) {
    return `<defs><pattern id="${id}dh" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="2.6" height="2.6" fill="none"/><path d="M0 0 V2.6" stroke="${K}" stroke-width="0.7"/></pattern>`
        + `<radialGradient id="${id}vg" cx="0.5" cy="0.45" r="0.72"><stop offset="0.55" stop-color="${K}" stop-opacity="0"/><stop offset="1" stop-color="${K}" stop-opacity="0.85"/></radialGradient></defs>`;
}
export const vignette = (id) => `<rect width="400" height="250" fill="url(#${id}vg)"/>`;

/** A curling cloud (xiangyun): a chain of spirals with a trailing tail, white with a black outline. */
export function cloud(x, y, s = 1, flip = 1) {
    const k = (n) => f(n * s);
    const curl = (cx, cy, r) => `M${k(cx + r)} ${k(cy)} A${k(r)} ${k(r)} 0 1 0 ${k(cx)} ${k(cy + r)} A${k(r * 0.6)} ${k(r * 0.6)} 0 1 0 ${k(cx + r * 0.2)} ${k(cy + r * 0.2)}`;
    const body = `M${k(-30)} ${k(6)} C${k(-30)} ${k(-8)} ${k(-14)} ${k(-12)} ${k(-6)} ${k(-6)} C${k(-2)} ${k(-18)} ${k(18)} ${k(-18)} ${k(20)} ${k(-4)} C${k(30)} ${k(-8)} ${k(40)} ${k(0)} ${k(36)} ${k(8)} C${k(20)} ${k(10)} ${k(-10)} ${k(10)} ${k(-30)} ${k(6)} Z`;
    return `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="${body}" fill="${W}" ${ln(1.1)}/>`
        + `<path d="${curl(-16, -2, 6)} ${curl(6, -8, 7)} ${curl(26, 0, 5)}" fill="none" ${ln(0.9)}/>`
        + `<path d="M${k(36)} ${k(8)} C${k(52)} ${k(10)} ${k(60)} ${k(4)} ${k(74)} ${k(8)} C${k(84)} ${k(11)} ${k(90)} ${k(6)} ${k(96)} ${k(2)}" fill="none" ${ln(0.9)}/>`
        + `<path d="M${k(-30)} ${k(6)} C${k(-46)} ${k(8)} ${k(-56)} ${k(2)} ${k(-64)} ${k(-4)}" fill="none" ${ln(0.8)}/></g>`;
}

/** Drifting smoke: a soft white ribbon edged by fine parallel lines, curling at its end. */
export function smoke(pts, w = 7) {
    const [p0, p1, p2, p3] = pts;
    const d = (o) => `M${f(p0[0])} ${f(p0[1] + o)} C${f(p1[0])} ${f(p1[1] + o)} ${f(p2[0])} ${f(p2[1] + o)} ${f(p3[0])} ${f(p3[1] + o)}`;
    const curl = `M${f(p3[0])} ${f(p3[1])} c6 -2 10 -10 4 -14 c-5 -3 -10 2 -6 6`;
    return `<path d="${d(0)}" stroke="${SMOKE}" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d(-w / 6)}" stroke="${W}" stroke-width="${f(w / 4)}" fill="none" stroke-linecap="round"/>`
        + `<path d="${d(-w / 2)} ${d(w / 2)}" stroke="${K}" stroke-width="0.6" fill="none" opacity="0.8"/>`
        + `<path d="${d(-w / 6)} ${d(w / 6)}" stroke="${K}" stroke-width="0.3" fill="none" opacity="0.45"/>`
        + `<path d="${curl}" stroke="${K}" stroke-width="0.7" fill="none"/>`;
}

/** A black butterfly in silhouette, with a few pale spots. */
export function butterfly(x, y, s = 1, rot = 0) {
    const k = (n) => f(n * s);
    const wing = (d) => `<path d="M0 -1 C${k(d * 3)} ${k(-10)} ${k(d * 12)} ${k(-19)} ${k(d * 20)} ${k(-17)} C${k(d * 22)} ${k(-12)} ${k(d * 19)} ${k(-8)} ${k(d * 17)} ${k(-5)} C${k(d * 18)} ${k(-2)} ${k(d * 14)} ${k(0)} 0 0 Z" fill="${K}"/>`
        + `<path d="M0 1 C${k(d * 8)} ${k(1)} ${k(d * 13)} ${k(4)} ${k(d * 12)} ${k(9)} C${k(d * 11)} ${k(12)} ${k(d * 8)} ${k(12)} ${k(d * 7)} ${k(18)} C${k(d * 5)} ${k(13)} ${k(d * 2)} ${k(9)} 0 1 Z" fill="${K}"/>`
        + `<circle cx="${k(d * 15)}" cy="${k(-13)}" r="${k(1.2)}" fill="${W}"/><circle cx="${k(d * 11)}" cy="${k(-8)}" r="${k(0.8)}" fill="${W}"/><circle cx="${k(d * 9)}" cy="${k(6)}" r="${k(0.7)}" fill="${W}"/>`
        + `<path d="M${k(d * 3)} ${k(-4)} Q${k(d * 10)} ${k(-12)} ${k(d * 17)} ${k(-15)}" stroke="${W}" stroke-width="${k(0.35)}" fill="none" opacity="0.6"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${wing(-1)}${wing(1)}<path d="M0 -4 L0 7" stroke="${K}" stroke-width="${k(1.4)}" stroke-linecap="round"/><path d="M0 -4 q-2 -5 -5 -7 M0 -4 q2 -5 5 -7" ${ln(0.5)} fill="none"/></g>`;
}

/** A column of moon phases. */
export function moons(x, y, gap = 26, r = 7, n = 5) {
    let s = '';
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const cy = y + i * gap;
        s += `<circle cx="${x}" cy="${cy}" r="${r}" fill="${W}" ${ln(0.9)}/>`;
        const off = (1 - 2 * t) * r * 1.6;
        if (Math.abs(off) < r * 1.9) s += `<clipPath id="mn${x}${i}"><circle cx="${x}" cy="${cy}" r="${r}"/></clipPath><circle cx="${f(x + off)}" cy="${cy}" r="${r}" fill="${K}" clip-path="url(#mn${x}${i})"/>`;
    }
    return s;
}

/** A Chinese knot with long red tassels. */
function knot(x, y, s = 1, len = 60) {
    const k = (n) => f(n * s);
    let t = '';
    for (let i = 0; i < 7; i++) t += `<path d="M${k(-3 + i)} ${k(10)} C${k(-3 + i + (i - 3) * 0.4)} ${k(10 + len * 0.5)} ${k(-4 + i * 1.2)} ${k(10 + len * 0.8)} ${k(-4 + i * 1.4)} ${k(10 + len)}" stroke="${i % 2 ? RED : DARKRED}" stroke-width="${k(1.1)}" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} ${y})">${t}<path d="M0 ${k(-8)} L${k(8)} 0 L0 ${k(8)} L${k(-8)} 0 Z" fill="${RED}" ${ln(0.7)}/><path d="M${k(-4)} ${k(-4)} L${k(4)} ${k(4)} M${k(4)} ${k(-4)} L${k(-4)} ${k(4)}" stroke="${W}" stroke-width="${k(0.5)}"/>${[[-10, -2], [10, -2], [0, -12]].map(([dx, dy]) => `<circle cx="${k(dx)}" cy="${k(dy)}" r="${k(3.4)}" fill="none" stroke="${RED}" stroke-width="${k(1.6)}"/>`).join('')}<rect x="${k(-4)}" y="${k(8)}" width="${k(8)}" height="${k(3)}" fill="${K}"/></g>`;
}

/** A plum blossom: five round petals, red heart. */
function plum(x, y, s = 1) {
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => { const r = (a - 90) * Math.PI / 180; return `<circle cx="${k(Math.cos(r) * 3.4)}" cy="${k(Math.sin(r) * 3.4)}" r="${k(2.8)}" fill="${W}" ${ln(0.6)}/>`; }).join('')}<circle r="${k(1.6)}" fill="${RED}"/></g>`;
}

/** Hair falling in long ribbons: black bands with white partings, swaying to one side. */
function ribbons(r, x0, y0, width, len, sway, n, flare = 1.6) {
    let s = '';
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const sx = x0 - width / 2 + t * width;
        const ex = sx * 1 + (sx - x0) * (flare - 1) + sway + (r() - 0.5) * 6;
        const bw = width / n * (0.75 + r() * 0.4);
        const ey = y0 + len * (0.85 + r() * 0.3);
        const c1 = [sx + sway * 0.1, y0 + len * 0.35];
        const c2 = [ex - sway * 0.25, y0 + len * 0.7];
        s += `<path d="M${f(sx - bw / 2)} ${y0} C${f(c1[0] - bw / 2)} ${f(c1[1])} ${f(c2[0] - bw / 2)} ${f(c2[1])} ${f(ex - bw * 0.3)} ${f(ey)} L${f(ex + bw * 0.3)} ${f(ey - 2)} C${f(c2[0] + bw / 2)} ${f(c2[1])} ${f(c1[0] + bw / 2)} ${f(c1[1])} ${f(sx + bw / 2)} ${y0} Z" fill="${K}"/>`;
    }
    // white partings and stray strands
    let d = '';
    for (let i = 0; i < n * 0.7; i++) {
        const sx = x0 - width / 2 + r() * width;
        const ex = sx + (sx - x0) * (flare - 1) + sway + (r() - 0.5) * 8;
        d += `M${f(sx)} ${f(y0 + 10 + r() * 20)} C${f(sx + sway * 0.1)} ${f(y0 + len * 0.4)} ${f(ex - sway * 0.2)} ${f(y0 + len * 0.7)} ${f(ex)} ${f(y0 + len * (0.7 + r() * 0.25))}`;
    }
    let stray = '';
    for (let i = 0; i < 5; i++) {
        const sx = x0 + (r() - 0.5) * width;
        const ex = sx + sway * 1.6 + (r() - 0.5) * 30;
        stray += `M${f(sx)} ${f(y0 + 30 + r() * 30)} C${f(sx + sway)} ${f(y0 + len * 0.4)} ${f(ex)} ${f(y0 + len * 0.6)} ${f(ex + sway * 0.4)} ${f(y0 + len * 1.05)}`;
    }
    return s + `<path d="${d}" stroke="${W}" stroke-width="0.7" fill="none" opacity="0.9"/><path d="${stray}" stroke="${K}" stroke-width="0.7" fill="none"/>`;
}

/** A heavy-lidded eye: thick lash line low over a dark red iris, long flick. dir +1: inner corner toward +x. */
function eye(id, cx, cy, dir) {
    const X = (dx) => f(cx + dir * dx);
    const open = `M${X(-12)} ${f(cy - 0.6)} C${X(-6)} ${f(cy - 3)} ${X(5)} ${f(cy - 3.2)} ${X(10)} ${f(cy - 0.4)} C${X(5)} ${f(cy + 3.6)} ${X(-5)} ${f(cy + 3.8)} ${X(-12)} ${f(cy - 0.6)} Z`;
    const cid = `${id}${dir > 0 ? 'L' : 'R'}`;
    let s = `<clipPath id="${cid}"><path d="${open}"/></clipPath><path d="${open}" fill="${W}"/>`;
    s += `<g clip-path="url(#${cid})"><circle cx="${X(-1)}" cy="${f(cy + 1)}" r="5" fill="${DARKRED}"/><path d="M${X(-7)} ${f(cy - 4)} L${X(5)} ${f(cy - 4)} L${X(5)} ${f(cy + 0.6)} Q${X(-1)} ${f(cy - 1.6)} ${X(-7)} ${f(cy + 0.6)} Z" fill="${K}"/><circle cx="${X(-1)}" cy="${f(cy + 1)}" r="2" fill="${K}"/><circle cx="${X(-2.6)}" cy="${f(cy + 0.2)}" r="0.8" fill="${W}"/></g>`;
    s += `<path d="M${X(10.4)} ${f(cy - 0.8)} C${X(5)} ${f(cy - 5.4)} ${X(-6)} ${f(cy - 5)} ${X(-13)} ${f(cy - 1.4)} L${X(-19)} ${f(cy - 2)} L${X(-13)} ${f(cy + 0.8)} C${X(-6)} ${f(cy - 2.8)} ${X(5)} ${f(cy - 3)} ${X(10)} ${f(cy)} Z" fill="${K}"/>`;
    s += `<path d="M${X(-18.4)} ${f(cy - 1.8)} q${dir * -2} 1.6 ${dir * -3.4} 4" ${ln(0.6)} fill="none"/>`;
    s += `<path d="M${X(-11)} ${f(cy + 1.4)} C${X(-5)} ${f(cy + 4.4)} ${X(4)} ${f(cy + 4)} ${X(8)} ${f(cy + 1.6)}" ${ln(0.45)} fill="none"/>`;
    s += `<path d="M${X(-11)} ${f(cy - 6.4)} C${X(-4)} ${f(cy - 8.6)} ${X(5)} ${f(cy - 8.4)} ${X(9)} ${f(cy - 5.8)}" ${ln(0.5)} fill="none"/>`;
    return s;
}

export function meiPortrait(id = 'pm') {
    const r = rng(311);
    const cx = 200;
    let s = shadeDefs(id) + hatch(2.6, 0.6, 0.85);
    // ---- the night around her: smoke, butterflies, moons ----
    s += smoke([[-10, 70], [60, 30], [100, 110], [150, 60]], 8) + smoke([[410, 150], [350, 110], [320, 200], [262, 168]], 7) + smoke([[20, 210], [70, 180], [110, 240], [150, 214]], 6);
    s += moons(372, 26, 30, 7, 5);
    s += butterfly(70, 140, 1.1, -18) + butterfly(318, 60, 0.9, 20) + butterfly(110, 36, 0.7, 8) + butterfly(298, 214, 0.8, -10);
    s += `<g transform="translate(200 300) scale(1.16) translate(-200 -290) rotate(-5 ${cx} 120)">`;
    // ---- back hair: ribbons flowing to the left ----
    s += `<path d="M${cx - 34} 92 C${cx - 38} 62 ${cx - 22} 44 ${cx} 44 C${cx + 22} 44 ${cx + 38} 62 ${cx + 34} 92 C${cx + 40} 150 ${cx + 46} 210 ${cx + 52} 262 L${cx - 80} 262 C${cx - 60} 210 ${cx - 44} 150 ${cx - 34} 92 Z" fill="${K}"/>`;
    s += ribbons(r, cx - 24, 110, 40, 150, -46, 12, 1.9) + ribbons(r, cx + 26, 110, 36, 150, -10, 10, 1.6);
    // ---- robe: black with white peonies, a white inner collar, a flowing sleeve ----
    s += `<path d="M${cx - 92} 262 C${cx - 80} 222 ${cx - 46} 196 ${cx - 10} 186 L${cx + 10} 186 C${cx + 46} 196 ${cx + 84} 222 ${cx + 98} 262 Z" fill="${K}"/>`;
    const sw = (x, y, r) => `<path d="M${f(x + r)} ${f(y)} A${f(r)} ${f(r)} 0 1 0 ${f(x)} ${f(y + r)} A${f(r * 0.55)} ${f(r * 0.55)} 0 1 0 ${f(x + r * 0.25)} ${f(y + r * 0.2)} M${f(x + r)} ${f(y)} C${f(x + r * 2)} ${f(y + r * 0.6)} ${f(x + r * 2.6)} ${f(y - r * 0.2)} ${f(x + r * 3.6)} ${f(y + r * 0.3)} C${f(x + r * 4.6)} ${f(y + r * 0.8)} ${f(x + r * 5.4)} ${f(y)} ${f(x + r * 6)} ${f(y - r * 0.4)}" stroke="${G2}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    s += sw(cx - 80, 236, 7) + sw(cx - 50, 216, 5) + sw(cx + 34, 226, 6) + sw(cx - 34, 250, 5) + sw(cx + 56, 248, 4.4);
    s += `<path d="M${cx + 70} 206 A18 18 0 1 0 ${cx + 70} 242 A14 18 0 1 1 ${cx + 70} 206 Z" fill="${RED}"/>`;
    s += `<path d="M${cx + 40} 202 C${cx + 70} 214 ${cx + 92} 236 ${cx + 100} 262" stroke="${W}" stroke-width="0.8" fill="none"/><path d="M${cx - 40} 204 C${cx - 66} 214 ${cx - 84} 236 ${cx - 90} 262" stroke="${W}" stroke-width="0.8" fill="none"/>`;
    s += `<path d="M${cx - 12} 185 L${cx + 10} 262 L${cx + 22} 262 L${cx - 2} 185 Z" fill="${W}" ${ln(1)}/><path d="M${cx + 12} 185 L${cx + 1} 210 L${cx + 6} 214 L${cx + 20} 187 Z" fill="${W}" ${ln(1)}/>`;
    s += `<path d="M${cx - 12} 185 L${cx + 10} 262 L${cx + 14} 262 L${cx - 8} 185 Z" fill="url(#${id}dh)"/>`;
    // ---- neck, with a hatched shadow under the jaw ----
    s += `<path d="M${cx - 9} 138 L${cx - 10} 187 L${cx + 10} 187 L${cx + 9} 138 Z" fill="${W}"/><path d="M${cx - 9} 146 C${cx - 3} 156 ${cx + 4} 156 ${cx + 10} 146 L${cx + 10} 166 C${cx + 4} 170 ${cx - 4} 170 ${cx - 9} 164 Z" fill="url(#${id}dh)"/><path d="M${cx - 9} 146 L${cx - 10} 186 M${cx + 9} 146 L${cx + 10} 186" ${ln(0.9)} fill="none"/>`;
    // ---- face ----
    const face = `M${cx - 29} 88 C${cx - 30} 110 ${cx - 24} 126 ${cx - 13} 139 C${cx - 7} 146 ${cx - 3} 149 ${cx} 149 C${cx + 3} 149 ${cx + 7} 146 ${cx + 13} 139 C${cx + 24} 126 ${cx + 30} 110 ${cx + 29} 88 Z`;
    s += `<path d="${face}" fill="${W}"/><clipPath id="${id}fc"><path d="${face}"/></clipPath><g clip-path="url(#${id}fc)"><path d="M${cx + 18} 88 C${cx + 26} 108 ${cx + 22} 128 ${cx + 8} 150 L${cx + 40} 150 L${cx + 40} 88 Z" fill="url(#${id}dh)" opacity="0.8"/><path d="M${cx - 34} 98 Q${cx} 106 ${cx + 34} 98 L${cx + 34} 90 L${cx - 34} 90 Z" fill="url(#${id}dh)" opacity="0.7"/></g><path d="${face}" fill="none" ${ln(1.1)}/>`;
    s += [[cx - 14, 1], [cx + 14, -1]].map(([ex, d]) => `<g transform="translate(${ex} 108) scale(1.2) translate(${-ex} -108)">${eye(id, ex, 108, d)}</g>`).join('');
    s += `<path d="M${cx + 0.6} 121 L${cx + 1.8} 124.4" ${ln(0.6)} fill="none"/>`;
    // dark lips, a faint knowing curve
    s += `<path d="M${cx - 6} 133 Q${cx - 3} 131.6 ${cx} 132.6 Q${cx + 3} 131.6 ${cx + 6.4} 132.4 Q${cx + 3} 134 ${cx} 134 Q${cx - 3} 134 ${cx - 6} 133 Z" fill="${DARKRED}"/><path d="M${cx - 4} 134.4 Q${cx} 138 ${cx + 4.4} 134.4 Z" fill="${RED}"/><path d="M${cx - 6} 133 Q${cx} 134.6 ${cx + 6.4} 132.4" ${ln(0.7)} fill="none"/><path d="M${cx + 6.4} 132.4 l1.6 -0.8" ${ln(0.5)}/>`;
    // ---- heavy bangs to the lashes, long side locks swaying ----
    s += `<path d="M${cx - 31} 100 C${cx - 33} 64 ${cx - 18} 46 ${cx} 46 C${cx + 18} 46 ${cx + 33} 64 ${cx + 31} 100 L${cx + 24} 98 L${cx + 18} 100.6 L${cx + 10} 98 L${cx + 4} 100 L${cx - 4} 98 L${cx - 10} 100.4 L${cx - 18} 98 L${cx - 24} 100.4 Z" fill="${K}"/>`;
    s += `<path d="${Array.from({ length: 13 }, (_, i) => { const x = cx - 24 + i * 4; return `M${f(x * 0.4 + cx * 0.6)} 52 Q${f(x)} 72 ${f(x + (r() - 0.5) * 2)} 96`; }).join('')}" stroke="${W}" stroke-width="0.5" fill="none" opacity="0.9"/>`;
    s += `<path d="M${cx - 22} 58 Q${cx} 52 ${cx + 22} 58" stroke="${W}" stroke-width="2.2" stroke-dasharray="5 3" fill="none" opacity="0.8"/>`;
    s += `<path d="M${cx - 30} 78 C${cx - 36} 110 ${cx - 34} 136 ${cx - 30} 156 L${cx - 20} 154 C${cx - 22} 130 ${cx - 22} 108 ${cx - 22} 92 Z" fill="${K}"/><path d="M${cx + 30} 78 C${cx + 36} 110 ${cx + 34} 136 ${cx + 30} 156 L${cx + 20} 154 C${cx + 22} 130 ${cx + 22} 108 ${cx + 22} 92 Z" fill="${K}"/>`;
    s += ribbons(r, cx - 26, 152, 12, 110, -34, 5, 2) + ribbons(r, cx + 26, 152, 12, 110, 6, 5, 1.6);
    // ---- ornaments: a red knot with long tassels, plum blossoms, a step-shake pin with bead strings ----
    s += knot(cx - 38, 74, 1, 74) + plum(cx - 28, 56, 1.1) + plum(cx - 38, 62, 0.8) + plum(cx - 20, 50, 0.7);
    s += `<path d="M${cx + 14} 56 L${cx + 58} 30" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><path d="M${cx + 14} 56 L${cx + 58} 30" stroke="${W}" stroke-width="0.6" stroke-linecap="round"/>` + plum(cx + 48, 36, 1.2);
    for (let i = 0; i < 5; i++) {
        const x = cx + 42 + i * 3.4;
        const len = 20 + i * 7;
        s += `<path d="M${x} 40 L${x + 1} ${40 + len}" ${ln(0.4)}/>` + [0.33, 0.66, 1].map((t) => `<circle cx="${f(x + t)}" cy="${f(40 + len * t)}" r="${t === 1 ? 1.7 : 1}" fill="${t === 1 ? RED : W}" ${ln(0.4)}/>`).join('');
    }
    s += `</g>`;
    return s + vignette(id);
}

export function yukiPortrait(id = 'py') {
    const r = rng(23);
    const cx = 200;
    let s = shadeDefs(id) + hatch(2.6, 0.6, 0.85);
    s += smoke([[-10, 196], [60, 160], [110, 230], [150, 196]], 7) + smoke([[410, 60], [340, 30], [320, 110], [268, 84]], 7);
    s += moons(28, 30, 28, 6, 4);
    s += butterfly(330, 170, 1, 16) + butterfly(76, 92, 0.85, -14) + butterfly(356, 34, 0.6, 8);
    // ---- chest, half in hatched shadow ----
    const chest = `M${cx - 90} 262 C${cx - 82} 214 ${cx - 50} 178 ${cx} 172 C${cx + 50} 178 ${cx + 82} 214 ${cx + 90} 262 Z`;
    s += `<path d="${chest}" fill="${W}"/><clipPath id="${id}cc"><path d="${chest}"/></clipPath><g clip-path="url(#${id}cc)"><path d="M${cx + 20} 172 C${cx + 40} 200 ${cx + 50} 230 ${cx + 46} 262 L${cx + 100} 262 L${cx + 100} 172 Z" fill="url(#${id}dh)"/></g><path d="${chest}" fill="none" ${ln(1.4)}/>`;
    s += `<path d="${Array.from({ length: 14 }, (_, i) => { const x = cx - 56 + i * 8 + (r() - 0.5) * 4; return `M${f(x)} ${f(204 + r() * 18)} q${f((x - cx) * 0.05)} 10 ${f((x - cx) * 0.12)} ${f(18 + r() * 10)}`; }).join('')}" ${ln(0.5)} fill="none"/>`;
    s += `<path d="M${cx - 44} 180 C${cx - 26} 196 ${cx + 26} 196 ${cx + 44} 180" stroke="${RED}" stroke-width="2.2" fill="none"/>` + knot(cx, 194, 0.7, 40);
    // ---- tall ears, dark inside ----
    for (const d of [-1, 1]) {
        const X = (dx) => f(cx + d * dx);
        s += `<path d="M${X(56)} 100 C${X(60)} 70 ${X(58)} 42 ${X(52)} 18 C${X(40)} 32 ${X(26)} 50 ${X(16)} 70 Z" fill="${W}" ${ln(1.3)}/>`;
        s += `<path d="M${X(48)} 88 C${X(50)} 66 ${X(50)} 48 ${X(48)} 32 C${X(40)} 44 ${X(30)} 56 ${X(24)} 70 Z" fill="${K}"/>`;
        s += `<path d="M${X(46)} 80 C${X(42)} 70 ${X(40)} 58 ${X(42)} 44 M${X(40)} 82 C${X(36)} 72 ${X(34)} 62 ${X(34)} 52" stroke="${W}" stroke-width="0.6" fill="none"/>`;
    }
    // ---- head, the shadow side hatched ----
    const head = `M${cx - 60} 118 C${cx - 62} 88 ${cx - 36} 66 ${cx} 66 C${cx + 36} 66 ${cx + 62} 88 ${cx + 60} 118 C${cx + 66} 128 ${cx + 72} 134 ${cx + 76} 140 C${cx + 66} 140 ${cx + 60} 142 ${cx + 54} 146 C${cx + 40} 164 ${cx + 22} 174 ${cx} 176 C${cx - 22} 174 ${cx - 40} 164 ${cx - 54} 146 C${cx - 60} 142 ${cx - 66} 140 ${cx - 76} 140 C${cx - 72} 134 ${cx - 66} 128 ${cx - 60} 118 Z`;
    s += `<path d="${head}" fill="${W}"/><clipPath id="${id}hc"><path d="${head}"/></clipPath><g clip-path="url(#${id}hc)"><path d="M${cx + 38} 66 C${cx + 56} 100 ${cx + 54} 140 ${cx + 30} 178 L${cx + 90} 178 L${cx + 90} 66 Z" fill="url(#${id}dh)"/><path d="M${cx - 30} 160 C${cx - 10} 172 ${cx + 10} 172 ${cx + 30} 160 L${cx + 30} 180 L${cx - 30} 180 Z" fill="url(#${id}dh)" opacity="0.7"/></g><path d="${head}" fill="none" ${ln(1.5)}/>`;
    s += `<path d="M${cx - 56} 132 C${cx - 46} 134 ${cx - 40} 138 ${cx - 36} 144 M${cx + 56} 132 C${cx + 46} 134 ${cx + 40} 138 ${cx + 36} 144 M${cx - 6} 78 C${cx - 4} 84 ${cx - 4} 90 ${cx - 5} 96 M${cx + 6} 78 C${cx + 4} 84 ${cx + 4} 90 ${cx + 5} 96" ${ln(0.6)} fill="none"/>`;
    // ---- eyes: long gold almonds, half-lidded, knowing ----
    for (const d of [-1, 1]) {
        const ex = cx + d * 25;
        const ey = 114;
        const shape = `M${f(ex - d * 16)} ${ey + 4} C${f(ex - d * 10)} ${ey - 2} ${f(ex + d * 8)} ${ey - 5} ${f(ex + d * 17)} ${ey - 3} C${f(ex + d * 12)} ${ey + 5} ${f(ex)} ${ey + 9} ${f(ex - d * 16)} ${ey + 4} Z`;
        s += `<path d="${shape}" fill="#e2bd45"/>`;
        s += `<clipPath id="${id}${d}"><path d="${shape}"/></clipPath><g clip-path="url(#${id}${d})"><path d="M${ex - 20} ${ey - 8} L${ex + 20} ${ey - 8} L${ex + 20} ${ey + 1} Q${ex} ${ey - 2} ${ex - 20} ${ey + 2} Z" fill="#a37a14"/><ellipse cx="${ex}" cy="${ey + 2}" rx="2" ry="7" fill="${K}"/><circle cx="${f(ex - d * 4)}" cy="${ey + 1}" r="1.3" fill="${W}"/></g>`;
        s += `<path d="M${f(ex - d * 16.6)} ${ey + 4.4} C${f(ex - d * 10)} ${ey - 3.6} ${f(ex + d * 8)} ${ey - 7} ${f(ex + d * 18)} ${ey - 3.6} L${f(ex + d * 25)} ${ey - 6} L${f(ex + d * 17)} ${ey - 1.4} C${f(ex + d * 8)} ${ey - 4.4} ${f(ex - d * 10)} ${ey - 1} ${f(ex - d * 15.6)} ${ey + 4.4} Z" fill="${K}"/>`;
        s += `<path d="M${f(ex - d * 15)} ${ey + 4.6} C${f(ex - d * 2)} ${ey + 9} ${f(ex + d * 10)} ${ey + 4} ${f(ex + d * 15)} ${ey - 1}" ${ln(0.6)} fill="none"/>`;
        s += `<path d="M${f(ex - d * 16)} ${ey + 5} l${-d * 3} 6" ${ln(0.9)} fill="none"/>`;
    }
    s += `<path d="M${cx - 5} 140 L${cx + 5} 140 L${cx} 145 Z" fill="${K}"/>`;
    s += `<path d="M${cx} 145 L${cx} 149 M${cx - 9} 151 C${cx - 6} 154 ${cx - 2} 153 ${cx} 149 C${cx + 2} 153 ${cx + 6} 154 ${cx + 9} 151" ${ln(0.9)} fill="none"/>`;
    for (const d of [-1, 1]) {
        s += `<path d="M${cx + d * 16} 146 C${cx + d * 50} 132 ${cx + d * 90} 130 ${cx + d * 126} 138 M${cx + d * 16} 150 C${cx + d * 54} 146 ${cx + d * 96} 150 ${cx + d * 130} 160 M${cx + d * 15} 154 C${cx + d * 46} 160 ${cx + d * 80} 172 ${cx + d * 110} 188" ${ln(0.6)} fill="none"/>`;
        s += `<path d="M${cx + d * 18} 92 C${cx + d * 30} 76 ${cx + d * 44} 66 ${cx + d * 62} 58" ${ln(0.5)} fill="none"/>`;
    }
    return s + vignette(id);
}
