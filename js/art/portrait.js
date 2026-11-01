/**
 * Close-ups in an elegant shōjo-gothic manhua style: stark black and white, vertical screentone,
 * long cascading hair drawn as strands, narrow half-lidded eyes, ornate jewellery, curling cloud motifs.
 * Space: the scene viewBox (400×250). One accent: cinnabar red. Each portrait draws its own background.
 */
const f = (n) => Math.round(n * 10) / 10;
const K = '#111010';
const W = '#fbfaf7';
const RED = '#a02c2c';
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

/** A lotus in line: two rows of pointed petals. */
export function lotus(x, y, s = 1) {
    const k = (n) => f(n * s);
    const petal = (a, len, w) => `<path d="M0 0 C${k(-w)} ${k(-len * 0.4)} ${k(-w * 0.5)} ${k(-len * 0.9)} 0 ${k(-len)} C${k(w * 0.5)} ${k(-len * 0.9)} ${k(w)} ${k(-len * 0.4)} 0 0 Z" transform="rotate(${a})" fill="${W}" ${ln(0.9)}/><path d="M0 ${k(-len * 0.15)} L0 ${k(-len * 0.8)}" transform="rotate(${a})" ${ln(0.4)}/>`;
    return `<g transform="translate(${x} ${y})">${[-70, 70, -48, 48].map((a) => petal(a, 26, 9)).join('')}${[-22, 22, 0].map((a) => petal(a, 32, 10)).join('')}</g>`;
}

/** Long hair as a black mass with white strand partings, plus loose strands drifting free. */
function hairFall(r, x0, y0, x1, y1, width, sway, n) {
    let mass = '';
    let parts = '';
    let loose = '';
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const sx = x0 - width * 0.5 + t * width;
        const ex = x1 - width * 0.9 + t * width * 1.8 + (r() - 0.5) * 10;
        const cxp = (sx + ex) / 2 + sway * (0.5 + r());
        const w = 1.6 + r() * 2.4;
        mass += `M${f(sx - w)} ${y0} Q${f(cxp - w)} ${f((y0 + y1) / 2)} ${f(ex)} ${f(y1 + r() * 14)} Q${f(cxp + w)} ${f((y0 + y1) / 2)} ${f(sx + w)} ${y0} Z`;
        if (i % 2) parts += `M${f(sx)} ${f(y0 + 6)} Q${f(cxp)} ${f((y0 + y1) / 2)} ${f(ex + (r() - 0.5) * 4)} ${f(y1)}`;
    }
    for (let i = 0; i < Math.round(n / 3); i++) {
        const sx = x0 + (r() - 0.5) * width;
        const ex = x1 + (r() - 0.5) * width * 2.4 + sway * 1.5;
        loose += `M${f(sx)} ${f(y0 + 20 + r() * 30)} C${f(sx + sway * 1.4)} ${f(y0 + 60)} ${f(ex - sway)} ${f(y1 - 40)} ${f(ex)} ${f(y1 + 10)}`;
    }
    return `<path d="${mass}" fill="${K}"/><path d="${parts}" stroke="${W}" stroke-width="0.45" fill="none" opacity="0.8"/><path d="${loose}" stroke="${K}" stroke-width="0.6" fill="none"/>`;
}

/** A narrow, half-lidded eye with a long sweeping lash line. dir +1: inner corner toward +x. */
function eye(id, cx, cy, dir) {
    const X = (dx) => f(cx + dir * dx);
    const open = `M${X(-12)} ${f(cy - 1.4)} C${X(-6)} ${f(cy - 4.6)} ${X(5)} ${f(cy - 4.8)} ${X(10)} ${f(cy - 1)} C${X(5)} ${f(cy + 3.4)} ${X(-5)} ${f(cy + 3.4)} ${X(-12)} ${f(cy - 1.4)} Z`;
    const cid = `${id}${dir > 0 ? 'L' : 'R'}`;
    let s = `<clipPath id="${cid}"><path d="${open}"/></clipPath><path d="${open}" fill="${W}"/>`;
    s += `<g clip-path="url(#${cid})"><ellipse cx="${X(-0.5)}" cy="${f(cy + 0.4)}" rx="4.4" ry="5" fill="${K}"/><circle cx="${X(-2)}" cy="${f(cy - 1.2)}" r="1.1" fill="${W}"/></g>`;
    // heavy lid line sweeping well past the outer corner, with a hooked tail
    s += `<path d="M${X(10.6)} ${f(cy - 1.4)} C${X(5)} ${f(cy - 6.6)} ${X(-6)} ${f(cy - 6.4)} ${X(-13)} ${f(cy - 2.4)} L${X(-18)} ${f(cy - 3.6)} L${X(-13)} ${f(cy - 0.4)} C${X(-6)} ${f(cy - 4.6)} ${X(5)} ${f(cy - 4.6)} ${X(10)} ${f(cy - 0.6)} Z" fill="${K}"/>`;
    s += `<path d="M${X(-17.6)} ${f(cy - 3.4)} q${dir * -2} 1.6 ${dir * -3.6} 3.6" ${ln(0.6)} fill="none"/>`;
    s += `<path d="M${X(-11)} ${f(cy + 0.2)} C${X(-5)} ${f(cy + 3.8)} ${X(4)} ${f(cy + 3.6)} ${X(8)} ${f(cy + 1)}" ${ln(0.45)} fill="none"/>`;
    s += `<path d="M${X(-11)} ${f(cy - 7.4)} C${X(-4)} ${f(cy - 9.6)} ${X(5)} ${f(cy - 9.4)} ${X(9)} ${f(cy - 6.6)}" ${ln(0.45)} fill="none"/>`;
    return s;
}

export function meiPortrait(id = 'pm') {
    const r = rng(77);
    const cx = 200;
    let s = hatch();
    s += cloud(70, 70, 1.1, 1) + cloud(330, 46, 0.9, -1) + cloud(58, 190, 0.8, 1) + lotus(352, 246, 1.2) + lotus(40, 252, 0.9);
    s += `<g transform="translate(200 284) scale(1.2) translate(-200 -262)">`;
    // ---- back hair: a long fall spreading past the shoulders ----
    s += `<path d="M${cx - 36} 90 C${cx - 40} 60 ${cx - 22} 42 ${cx} 42 C${cx + 22} 42 ${cx + 40} 60 ${cx + 36} 90 C${cx + 40} 150 ${cx + 54} 210 ${cx + 66} 262 L${cx - 66} 262 C${cx - 54} 210 ${cx - 40} 150 ${cx - 36} 90 Z" fill="${K}"/>`;
    s += hairFall(r, cx - 32, 112, cx - 72, 252, 14, -16, 22) + hairFall(r, cx + 32, 112, cx + 72, 252, 14, 16, 22);
    // ---- robe: black outer layer with a white lotus pattern, white inner collar, a bead necklace ----
    s += `<path d="M${cx - 96} 262 C${cx - 84} 222 ${cx - 46} 196 ${cx - 10} 186 L${cx + 10} 186 C${cx + 46} 196 ${cx + 84} 222 ${cx + 96} 262 Z" fill="${K}"/>`;
    for (const [lx, ly, sc] of [[cx - 62, 240, 0.5], [cx + 60, 236, 0.55], [cx - 30, 258, 0.4]]) s += lotus(lx, ly, sc);
    s += `<path d="M${cx - 76} 236 C${cx - 70} 226 ${cx - 60} 218 ${cx - 48} 212 M${cx + 76} 236 C${cx + 70} 226 ${cx + 60} 218 ${cx + 48} 212" stroke="${W}" stroke-width="0.7" fill="none"/>`;
    s += `<path d="M${cx - 12} 185 L${cx + 10} 262 L${cx + 22} 262 L${cx - 2} 185 Z" fill="${W}" ${ln(1)}/><path d="M${cx + 12} 185 L${cx + 1} 210 L${cx + 6} 214 L${cx + 20} 187 Z" fill="${W}" ${ln(1)}/>`;
    s += `<path d="M${cx - 9} 186 L${cx + 13} 262 M${cx + 10} 187 L${cx + 3} 205" stroke="${K}" stroke-width="0.5"/>`;
    // ---- a long slender neck ----
    s += `<path d="M${cx - 9} 140 L${cx - 10} 187 L${cx + 10} 187 L${cx + 9} 140 Z" fill="${W}"/><path d="M${cx - 9} 146 L${cx - 10} 186 M${cx + 9} 146 L${cx + 10} 186" ${ln(0.9)} fill="none"/>`;
    s += `<path d="M${cx - 9} 150 C${cx - 4} 156 ${cx + 4} 156 ${cx + 9} 150" ${ln(0.5)} fill="none"/>`;
    const beads = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; beads.push([cx - 14 + t * 28, 188 + Math.sin(t * Math.PI) * 14]); }
    s += `<path d="M${beads.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')}" ${ln(0.5)} fill="none"/>` + beads.map(([x, y], i) => `<circle cx="${f(x)}" cy="${f(y)}" r="${i === 6 ? 3 : 1.6}" fill="${i === 6 ? RED : W}" ${ln(0.6)}/>`).join('');
    // ---- face: long, narrow, pointed chin ----
    s += `<path d="M${cx - 29} 88 C${cx - 30} 110 ${cx - 24} 126 ${cx - 13} 139 C${cx - 7} 146 ${cx - 3} 149 ${cx} 149 C${cx + 3} 149 ${cx + 7} 146 ${cx + 13} 139 C${cx + 24} 126 ${cx + 30} 110 ${cx + 29} 88 Z" fill="${W}" ${ln(1.1)}/>`;
    s += [[cx - 14, 1], [cx + 14, -1]].map(([ex, d]) => `<g transform="translate(${ex} 106) scale(1.18) translate(${-ex} -106)">${eye(id, ex, 106, d)}</g>`).join('');
    s += `<path d="M${cx + 0.6} 120 L${cx + 1.8} 123.4" ${ln(0.6)} fill="none"/>`;
    s += `<path d="M${cx - 6} 133.2 Q${cx} 135 ${cx + 6.4} 132" ${ln(0.8)} fill="none"/><path d="M${cx - 2.4} 136.4 Q${cx} 137.4 ${cx + 2.4} 136.2" stroke="${K}" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
    s += `<path d="M${cx - 3.6} 99 L${cx} 95.4 L${cx + 3.6} 99 L${cx} 102.6 Z" fill="${RED}"/>`; // huadian, the forehead flower
    // ---- hime cut: blunt bangs above the eyes, blunt side locks, front locks over the robe ----
    s += `<path d="M${cx - 31} 96 C${cx - 33} 64 ${cx - 18} 46 ${cx} 46 C${cx + 18} 46 ${cx + 33} 64 ${cx + 31} 96 L${cx + 24} 94 L${cx + 18} 96.6 L${cx + 10} 94 L${cx + 4} 96 L${cx - 4} 94 L${cx - 10} 96.4 L${cx - 18} 94 L${cx - 24} 96.4 Z" fill="${K}"/>`;
    s += `<path d="${Array.from({ length: 14 }, (_, i) => { const x = cx - 26 + i * 4; return `M${f(x * 0.4 + cx * 0.6)} 52 Q${f(x)} 70 ${f(x + (r() - 0.5) * 2)} 92`; }).join('')}" stroke="${W}" stroke-width="0.45" fill="none" opacity="0.85"/>`;
    for (const d of [-1, 1]) {
        s += `<path d="M${cx + d * 30} 80 C${cx + d * 34} 104 ${cx + d * 34} 130 ${cx + d * 32} 156 L${cx + d * 20} 154 C${cx + d * 22} 128 ${cx + d * 24} 108 ${cx + d * 24} 92 Z" fill="${K}"/>`;
        s += `<path d="M${cx + d * 27} 96 Q${cx + d * 29} 124 ${cx + d * 26} 152 M${cx + d * 30} 98 Q${cx + d * 32} 126 ${cx + d * 30} 154" stroke="${W}" stroke-width="0.45" fill="none"/>`;
        s += hairFall(r, cx + d * 28, 156, cx + d * 44, 262, 10, d * 10, 9);
    }
    // ---- ornaments: a step-shake hairpin with bead strings, long earrings below the side locks ----
    s += `<path d="M${cx + 14} 52 L${cx + 54} 30" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/><path d="M${cx + 14} 52 L${cx + 54} 30" stroke="${W}" stroke-width="0.6" stroke-linecap="round"/>`;
    s += `<g transform="translate(${cx + 46} 34)">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="${f(Math.cos(a * Math.PI / 180) * 4)}" cy="${f(Math.sin(a * Math.PI / 180) * 4)}" rx="3.4" ry="1.8" transform="rotate(${a} ${f(Math.cos(a * Math.PI / 180) * 4)} ${f(Math.sin(a * Math.PI / 180) * 4)})" fill="${W}" ${ln(0.6)}/>`).join('')}<circle r="1.8" fill="${RED}" ${ln(0.5)}/></g>`;
    for (let i = 0; i < 4; i++) {
        const x = cx + 40 + i * 3.6;
        const len = 18 + i * 6;
        s += `<path d="M${x} 38 L${x + 1} ${38 + len}" ${ln(0.4)}/>` + [0.35, 0.7, 1].map((t) => `<circle cx="${f(x + t)}" cy="${f(38 + len * t)}" r="${t === 1 ? 1.6 : 1}" fill="${t === 1 ? RED : W}" ${ln(0.4)}/>`).join('');
    }
    for (const d of [-1, 1]) {
        const ex = cx + d * 26;
        s += `<path d="M${ex} 150 L${ex} 170" ${ln(0.5)}/><circle cx="${ex}" cy="158" r="1.4" fill="${W}" ${ln(0.5)}/><path d="M${ex - 2.6} 172 L${ex} 168 L${ex + 2.6} 172 L${ex} 178 Z" fill="${W}" ${ln(0.6)}/><path d="M${ex} 178 L${ex} 188" stroke="${RED}" stroke-width="1" stroke-linecap="round"/>`;
    }
    return s + '</g>';
}

export function yukiPortrait(id = 'py') {
    const r = rng(19);
    const cx = 200;
    let s = hatch();
    s += cloud(62, 60, 1, 1) + cloud(338, 74, 0.9, -1) + cloud(46, 200, 0.7, 1) + cloud(356, 210, 0.75, -1);
    // ---- chest and shoulders, with a few flowing fur lines ----
    s += `<path d="M${cx - 90} 262 C${cx - 82} 214 ${cx - 50} 178 ${cx} 172 C${cx + 50} 178 ${cx + 82} 214 ${cx + 90} 262 Z" fill="${W}" ${ln(1.4)}/>`;
    s += `<path d="${Array.from({ length: 16 }, (_, i) => { const x = cx - 60 + i * 8 + (r() - 0.5) * 4; return `M${f(x)} ${f(200 + r() * 20)} q${f((x - cx) * 0.05)} 10 ${f((x - cx) * 0.12)} ${f(18 + r() * 10)}`; }).join('')}" ${ln(0.5)} fill="none"/>`;
    // a red cord with a white jade bead: the root-kin bond
    s += `<path d="M${cx - 44} 180 C${cx - 26} 196 ${cx + 26} 196 ${cx + 44} 180" stroke="${RED}" stroke-width="2.2" fill="none"/><circle cx="${cx}" cy="196" r="5" fill="${W}" ${ln(0.9)}/><path d="M${cx - 2} 194 a2 2 0 0 1 3 0" ${ln(0.5)} fill="none"/>`;
    // ---- tall ears ----
    for (const d of [-1, 1]) {
        const X = (dx) => f(cx + d * dx);
        s += `<path d="M${X(56)} 100 C${X(60)} 70 ${X(58)} 42 ${X(52)} 18 C${X(40)} 32 ${X(26)} 50 ${X(16)} 70 Z" fill="${W}" ${ln(1.3)}/>`;
        s += `<path d="M${X(48)} 88 C${X(50)} 66 ${X(50)} 48 ${X(48)} 32 C${X(40)} 44 ${X(30)} 56 ${X(24)} 70 Z" fill="${K}" opacity="0.88"/>`;
        s += `<path d="M${X(46)} 80 C${X(42)} 70 ${X(40)} 58 ${X(42)} 44 M${X(40)} 82 C${X(36)} 72 ${X(34)} 62 ${X(34)} 52" stroke="${W}" stroke-width="0.6" fill="none"/>`;
    }
    // ---- a narrower, elegant head with swept cheek fur ----
    s += `<path d="M${cx - 60} 118 C${cx - 62} 88 ${cx - 36} 66 ${cx} 66 C${cx + 36} 66 ${cx + 62} 88 ${cx + 60} 118 C${cx + 66} 128 ${cx + 72} 134 ${cx + 76} 140 C${cx + 66} 140 ${cx + 60} 142 ${cx + 54} 146 C${cx + 40} 164 ${cx + 22} 174 ${cx} 176 C${cx - 22} 174 ${cx - 40} 164 ${cx - 54} 146 C${cx - 60} 142 ${cx - 66} 140 ${cx - 76} 140 C${cx - 72} 134 ${cx - 66} 128 ${cx - 60} 118 Z" fill="${W}" ${ln(1.5)}/>`;
    s += `<path d="M${cx - 56} 132 C${cx - 46} 134 ${cx - 40} 138 ${cx - 36} 144 M${cx + 56} 132 C${cx + 46} 134 ${cx + 40} 138 ${cx + 36} 144 M${cx - 6} 78 C${cx - 4} 84 ${cx - 4} 90 ${cx - 5} 96 M${cx + 6} 78 C${cx + 4} 84 ${cx + 4} 90 ${cx + 5} 96" ${ln(0.6)} fill="none"/>`;
    // ---- eyes: long, slanted almonds, gold, slit pupils ----
    for (const d of [-1, 1]) {
        const ex = cx + d * 25;
        const ey = 114;
        const shape = `M${f(ex - d * 16)} ${ey + 4} C${f(ex - d * 10)} ${ey - 6} ${f(ex + d * 8)} ${ey - 10} ${f(ex + d * 17)} ${ey - 6} C${f(ex + d * 12)} ${ey + 4} ${f(ex)} ${ey + 9} ${f(ex - d * 16)} ${ey + 4} Z`;
        s += `<path d="${shape}" fill="#e2bd45"/>`;
        s += `<clipPath id="${id}${d}"><path d="${shape}"/></clipPath><g clip-path="url(#${id}${d})"><path d="M${ex - 20} ${ey - 12} L${ex + 20} ${ey - 12} L${ex + 20} ${ey - 2} Q${ex} ${ey - 6} ${ex - 20} ${ey - 1} Z" fill="#b48a1c"/><ellipse cx="${ex}" cy="${ey}" rx="2.2" ry="8" fill="${K}"/><circle cx="${f(ex - d * 4)}" cy="${ey - 3}" r="1.6" fill="${W}"/></g>`;
        s += `<path d="M${f(ex - d * 16.6)} ${ey + 4.4} C${f(ex - d * 10)} ${ey - 7.4} ${f(ex + d * 8)} ${ey - 11.6} ${f(ex + d * 18)} ${ey - 6.6} L${f(ex + d * 24)} ${ey - 8.6} L${f(ex + d * 17)} ${ey - 4.4} C${f(ex + d * 8)} ${ey - 9} ${f(ex - d * 10)} ${ey - 5} ${f(ex - d * 15.6)} ${ey + 4.4} Z" fill="${K}"/>`;
        s += `<path d="M${f(ex - d * 15)} ${ey + 4.6} C${f(ex - d * 2)} ${ey + 9} ${f(ex + d * 10)} ${ey + 4} ${f(ex + d * 15)} ${ey - 3}" ${ln(0.6)} fill="none"/>`;
        s += `<path d="M${f(ex - d * 16)} ${ey + 5} l${-d * 3} 6" ${ln(0.9)} fill="none"/>`;
    }
    // ---- nose, mouth, long whiskers ----
    s += `<path d="M${cx - 5} 140 L${cx + 5} 140 L${cx} 145 Z" fill="${K}"/>`;
    s += `<path d="M${cx} 145 L${cx} 149 M${cx - 9} 151 C${cx - 6} 154 ${cx - 2} 153 ${cx} 149 C${cx + 2} 153 ${cx + 6} 154 ${cx + 9} 151" ${ln(0.9)} fill="none"/>`;
    for (const d of [-1, 1]) {
        s += `<path d="M${cx + d * 16} 146 C${cx + d * 50} 132 ${cx + d * 90} 130 ${cx + d * 126} 138 M${cx + d * 16} 150 C${cx + d * 54} 146 ${cx + d * 96} 150 ${cx + d * 130} 160 M${cx + d * 15} 154 C${cx + d * 46} 160 ${cx + d * 80} 172 ${cx + d * 110} 188" ${ln(0.6)} fill="none"/>`;
        s += `<path d="M${cx + d * 18} 92 C${cx + d * 30} 76 ${cx + d * 44} 66 ${cx + d * 62} 58" ${ln(0.5)} fill="none"/>`;
    }
    return s;
}
