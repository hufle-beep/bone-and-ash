/**
 * Close-ups in a clean manhua line style: confident black lines, flat cel tones, big readable eyes,
 * glossy-hair highlights, very little shading. Space: the scene viewBox (400×250). Light from upper left.
 */
const f = (n) => Math.round(n * 10) / 10;
const LINE = '#1b1917';
const SKIN = '#f7f2ea';
const TONE = '#d9d3c8'; // the one shadow tone
const HAIR = '#1f1d1b';
const RED = '#a02c2c';
const ln = (w = 1.4) => `stroke="${LINE}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/** A pointed lock of hair: from a root (width w) to a sharp tip, bowed sideways by `bend`. */
function lock(rx, ry, tx, ty, w, bend = 0) {
    const mx = (rx + tx) / 2 + bend;
    const my = (ry + ty) / 2;
    return `M${f(rx - w)} ${f(ry)} Q${f(mx - w * 0.6)} ${f(my)} ${f(tx)} ${f(ty)} Q${f(mx + w * 0.6)} ${f(my)} ${f(rx + w)} ${f(ry)} Z`;
}

/** Glossy hair highlight: a broken white band along an arc. */
function gloss(cx, cy, rx, ry, a0, a1, w = 2.2) {
    let s = '';
    const n = 7;
    for (let i = 0; i < n; i++) {
        const t0 = a0 + ((a1 - a0) * i) / n;
        const t1 = t0 + ((a1 - a0) / n) * 0.62;
        const p = (t) => [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry];
        const [x0, y0] = p(t0);
        const [x1, y1] = p(t1);
        s += `<path d="M${f(x0)} ${f(y0)} A${rx} ${ry} 0 0 1 ${f(x1)} ${f(y1)}" stroke="#fff" stroke-width="${f(w * (0.6 + 0.4 * Math.sin((i / (n - 1)) * Math.PI)))}" stroke-linecap="round" fill="none" opacity="0.85"/>`;
    }
    return s;
}

/** A manhua eye: heavy upper lash line with a flick, big iris with a dark top band and two highlights. */
function eye(id, cx, cy, dir) {
    // dir = +1: inner corner toward +x (the viewer's-left eye); -1 mirrors.
    const X = (dx) => f(cx + dir * dx);
    const open = `M${X(-11)} ${f(cy - 1.5)} C${X(-6)} ${f(cy - 7.5)} ${X(5)} ${f(cy - 8.5)} ${X(11)} ${f(cy - 5)} C${X(9.5)} ${f(cy + 2)} ${X(5)} ${f(cy + 7)} ${X(-1)} ${f(cy + 7.4)} C${X(-7)} ${f(cy + 7.4)} ${X(-10)} ${f(cy + 3)} ${X(-11)} ${f(cy - 1.5)} Z`;
    const cid = `${id}e${dir > 0 ? 'l' : 'r'}`;
    let s = `<clipPath id="${cid}"><path d="${open}"/></clipPath><path d="${open}" fill="#fff"/>`;
    s += `<g clip-path="url(#${cid})"><ellipse cx="${X(0)}" cy="${f(cy + 0.6)}" rx="6.6" ry="7.8" fill="#4a4541"/>`;
    s += `<path d="M${X(-7)} ${f(cy - 3)} Q${X(0)} ${f(cy - 9)} ${X(7)} ${f(cy - 3)} L${X(7)} ${f(cy - 8)} L${X(-7)} ${f(cy - 8)} Z" fill="${LINE}"/>`;
    s += `<ellipse cx="${X(0)}" cy="${f(cy + 0.6)}" rx="6.6" ry="7.8" fill="none" stroke="${LINE}" stroke-width="1"/>`;
    s += `<ellipse cx="${X(0)}" cy="${f(cy + 1)}" rx="2.7" ry="3.6" fill="${LINE}"/>`;
    s += `<path d="M${X(-4.5)} ${f(cy + 5)} Q${X(0)} ${f(cy + 7.4)} ${X(4.5)} ${f(cy + 5)}" stroke="#8b847c" stroke-width="1" fill="none"/>`;
    s += `<ellipse cx="${X(-2.6)}" cy="${f(cy - 2.4)}" rx="2.4" ry="2.1" fill="#fff"/><circle cx="${X(2.8)}" cy="${f(cy + 3.6)}" r="1" fill="#fff"/></g>`;
    // upper lash line: a filled crescent, thick in the middle, with an outer flick
    s += `<path d="M${X(-11.6)} ${f(cy - 1)} C${X(-6)} ${f(cy - 9.6)} ${X(5)} ${f(cy - 10.4)} ${X(11.4)} ${f(cy - 5.4)} C${X(5)} ${f(cy - 7.6)} ${X(-5)} ${f(cy - 7)} ${X(-10.6)} ${f(cy + 0.2)} Z" fill="${LINE}"/>`;
    s += `<path d="M${X(-10.6)} ${f(cy - 2.6)} L${X(-15.4)} ${f(cy - 5.4)} L${X(-11.4)} ${f(cy + 0.4)} Z" fill="${LINE}"/>`;
    s += `<path d="M${X(-13)} ${f(cy - 4.2)} L${X(-15.8)} ${f(cy - 2.6)}" ${ln(0.8)}/>`;
    // lower lid (partial) and crease
    s += `<path d="M${X(-8)} ${f(cy + 5)} C${X(-4)} ${f(cy + 8)} ${X(2)} ${f(cy + 8)} ${X(6)} ${f(cy + 4.6)}" ${ln(0.7)} fill="none"/>`;
    s += `<path d="M${X(-10)} ${f(cy - 8.6)} C${X(-5)} ${f(cy - 13.4)} ${X(5)} ${f(cy - 13.6)} ${X(11)} ${f(cy - 9.4)}" ${ln(0.7)} fill="none"/>`;
    return s;
}

export function meiPortrait(id = 'pm') {
    const cx = 200;
    let s = '';
    // ---- back hair (behind everything) ----
    s += `<path d="M${cx - 48} 100 C${cx - 50} 76 ${cx - 28} 64 ${cx} 64 C${cx + 28} 64 ${cx + 50} 76 ${cx + 48} 100 C${cx + 56} 150 ${cx + 60} 205 ${cx + 66} 262 L${cx - 66} 262 C${cx - 60} 205 ${cx - 56} 150 ${cx - 50} 100 Z" fill="${HAIR}" ${ln(1.4)}/>`;
    // ---- robe: crossed collar, white inner layer, one flat shadow tone ----
    s += `<path d="M${cx - 84} 262 C${cx - 78} 230 ${cx - 52} 206 ${cx - 16} 196 L${cx + 16} 196 C${cx + 52} 206 ${cx + 78} 230 ${cx + 84} 262 Z" fill="#ece7de" ${ln(1.5)}/>`;
    s += `<path d="M${cx + 38} 206 C${cx + 58} 216 ${cx + 74} 236 ${cx + 80} 262 L${cx + 56} 262 C${cx + 52} 240 ${cx + 46} 222 ${cx + 34} 210 Z" fill="${TONE}"/>`;
    s += `<path d="M${cx - 17} 195 L${cx + 12} 262 L${cx + 27} 262 L${cx - 5} 194 Z" fill="#fff" ${ln(1.2)}/>`;
    s += `<path d="M${cx + 17} 195 L${cx + 2} 224 L${cx + 9} 229 L${cx + 26} 197 Z" fill="#fff" ${ln(1.2)}/>`;
    s += `<path d="M${cx - 50} 222 C${cx - 46} 236 ${cx - 46} 250 ${cx - 48} 262 M${cx + 50} 224 C${cx + 54} 238 ${cx + 56} 250 ${cx + 56} 262 M${cx - 30} 236 L${cx - 26} 258" ${ln(0.8)} fill="none"/>`;
    for (const [fx, fy, sc] of [[cx - 58, 236, 1], [cx + 64, 240, 0.85]]) {
        s += `<g transform="translate(${fx} ${fy}) scale(${sc})" fill="#fff" ${ln(0.7)}>${[0, 72, 144, 216, 288].map((a) => { const r = (a - 90) * Math.PI / 180; return `<ellipse cx="${f(Math.cos(r) * 4.4)}" cy="${f(Math.sin(r) * 4.4)}" rx="3.6" ry="2.4" transform="rotate(${a - 90} ${f(Math.cos(r) * 4.4)} ${f(Math.sin(r) * 4.4)})"/>`; }).join('')}<circle r="1.6" fill="${RED}" stroke="none"/><path d="M5 5 Q10 10 16 10" fill="none"/></g>`;
    }
    // ---- neck, with the cel shadow under the chin ----
    s += `<path d="M${cx - 12} 160 L${cx - 13} 197 L${cx + 13} 197 L${cx + 12} 160 Z" fill="${SKIN}"/>`;
    s += `<path d="M${cx - 13} 164 C${cx - 6} 176 ${cx + 6} 176 ${cx + 13} 164 L${cx + 13} 184 C${cx + 6} 188 ${cx - 6} 188 ${cx - 13} 182 Z" fill="${TONE}"/>`;
    s += `<path d="M${cx - 12} 164 L${cx - 13} 196 M${cx + 12} 164 L${cx + 13} 196" ${ln(1.2)} fill="none"/>`;
    // ---- face ----
    s += `<path d="M${cx - 38} 100 C${cx - 39} 128 ${cx - 30} 150 ${cx - 15} 163 C${cx - 8} 169 ${cx - 4} 172 ${cx} 172 C${cx + 4} 172 ${cx + 8} 169 ${cx + 15} 163 C${cx + 30} 150 ${cx + 39} 128 ${cx + 38} 100 Z" fill="${SKIN}" ${ln(1.6)}/>`;
    // ---- eyes, brows, nose, mouth, blush lines ----
    s += `<g transform="translate(${cx - 17} 124) scale(1.12) translate(${-(cx - 17)} -124)">${eye(id, cx - 17, 124, 1)}</g><g transform="translate(${cx + 17} 124) scale(1.12) translate(${-(cx + 17)} -124)">${eye(id, cx + 17, 124, -1)}</g>`;
    s += `<path d="M${cx - 29} 106.5 C${cx - 23} 103 ${cx - 14} 102.6 ${cx - 7} 105" ${ln(1.1)} fill="none"/><path d="M${cx + 29} 106.5 C${cx + 23} 103 ${cx + 14} 102.6 ${cx + 7} 105" ${ln(1.1)} fill="none"/>`;
    s += `<path d="M${cx + 1} 141 L${cx + 3} 145 L${cx} 146" ${ln(0.9)} fill="none"/>`;
    s += `<path d="M${cx - 6} 155 C${cx - 3} 156.4 ${cx + 3} 156.4 ${cx + 6} 155" ${ln(1.1)} fill="none"/><path d="M${cx - 2} 159.4 L${cx + 2} 159.4" stroke="${RED}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>`;
    s += [-1, 1].map((d) => [0, 1, 2].map((i) => `<path d="M${f(cx + d * (24 - i * 4))} ${f(139 + i * 0.3)} l${f(d * -2.4)} 3.4" stroke="${RED}" stroke-width="0.8" stroke-linecap="round" opacity="0.55"/>`).join('')).join('');
    // ---- side locks in front of the shoulders ----
    s += `<path d="${lock(cx - 38, 92, cx - 48, 238, 9, -10)}" fill="${HAIR}" ${ln(1.2)}/><path d="${lock(cx - 32, 100, cx - 40, 188, 5, -6)}" fill="${HAIR}" ${ln(1)}/>`;
    s += `<path d="${lock(cx + 38, 92, cx + 48, 238, 9, 10)}" fill="${HAIR}" ${ln(1.2)}/><path d="${lock(cx + 32, 100, cx + 40, 188, 5, 6)}" fill="${HAIR}" ${ln(1)}/>`;
    // ---- crown and bangs: pointed locks ----
    s += `<path d="M${cx - 42} 98 C${cx - 44} 76 ${cx - 24} 65 ${cx} 65 C${cx + 24} 65 ${cx + 44} 76 ${cx + 42} 98 Q${cx} 90 ${cx - 42} 98 Z" fill="${HAIR}"/>`;
    const tips = [[-38, 112], [-29, 108], [-20, 104], [-11, 107], [-2, 103], [7, 106], [16, 103], [25, 108], [34, 106], [40, 114]];
    for (const [tx, ty] of tips) s += `<path d="${lock(cx + tx * 0.35, 70, cx + tx, ty, 7.4, tx * 0.12)}" fill="${HAIR}" ${ln(1)}/>`;
    s += gloss(cx, 100, 30, 20, Math.PI * 1.12, Math.PI * 1.88);
    // ---- the bun: hairpin, a dangling ornament with a red tassel, a small flower ----
    s += `<ellipse cx="${cx + 2}" cy="50" rx="20" ry="15" fill="${HAIR}" ${ln(1.4)}/>` + gloss(cx + 2, 52, 12, 9, Math.PI * 1.1, Math.PI * 1.7, 1.6);
    s += `<path d="M${cx - 30} 42 L${cx + 40} 60" stroke="${LINE}" stroke-width="2.4" stroke-linecap="round"/><path d="M${cx - 30} 42 L${cx + 40} 60" stroke="#fff" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/><circle cx="${cx + 42}" cy="60.6" r="3.2" fill="${RED}" ${ln(0.8)}/>`;
    s += `<path d="M${cx - 18} 58 Q${cx - 30} 64 ${cx - 34} 72" ${ln(0.8)} fill="none"/><path d="M${cx - 37} 75 L${cx - 34} 71 L${cx - 31} 75 L${cx - 34} 79 Z" fill="#fff" ${ln(0.8)}/>`;
    s += [0, 1, 2, 3].map((i) => `<path d="M${cx - 35.2 + i * 0.8} 79 L${cx - 36.4 + i * 1.6} 93" stroke="${RED}" stroke-width="0.9" stroke-linecap="round"/>`).join('');
    s += `<g transform="translate(${cx + 16} 38)" fill="#fff" ${ln(0.7)}>${[0, 72, 144, 216, 288].map((a) => { const r = (a - 90) * Math.PI / 180; return `<circle cx="${f(Math.cos(r) * 3.4)}" cy="${f(Math.sin(r) * 3.4)}" r="2.4"/>`; }).join('')}<circle r="1.4" fill="${RED}" stroke="none"/></g>`;
    return s;
}

export function yukiPortrait(id = 'py') {
    const cx = 200;
    let s = '';
    // ---- chest, with a fur tuft and the shadow the head throws ----
    s += `<path d="M${cx - 96} 262 C${cx - 92} 210 ${cx - 70} 166 ${cx - 40} 156 L${cx + 40} 156 C${cx + 70} 166 ${cx + 92} 210 ${cx + 96} 262 Z" fill="#fff" ${ln(1.8)}/>`;
    s += `<path d="M${cx - 44} 176 C${cx - 22} 194 ${cx + 22} 194 ${cx + 44} 176 L${cx + 40} 172 L${cx - 40} 172 Z" fill="${TONE}"/>`;
    s += `<path d="M${cx - 12} 206 l4 7 l4 -5 l4 8 l4 -5 l4 7 l4 -4" ${ln(1)} fill="none"/>`;
    s += `<path d="M${cx + 60} 214 C${cx + 70} 230 ${cx + 76} 246 ${cx + 78} 262 L${cx + 92} 262 C${cx + 88} 236 ${cx + 76} 214 ${cx + 60} 200 Z" fill="${TONE}"/>`;
    // ---- ears ----
    for (const d of [-1, 1]) {
        const X = (dx) => f(cx + d * dx);
        s += `<path d="M${X(66)} 98 L${X(70)} 30 C${X(56)} 38 ${X(36)} 52 ${X(22)} 66 Z" fill="#fff" ${ln(1.8)}/>`;
        s += `<path d="M${X(58)} 90 L${X(62)} 44 C${X(52)} 52 ${X(40)} 60 ${X(32)} 70 Z" fill="#e9cdc8"/>`;
        s += `<path d="M${X(58)} 86 l${d * -4} -10 M${X(54)} 84 l${d * -2} -14 M${X(50)} 82 l0 -12" ${ln(0.8)} fill="none"/>`;
    }
    // ---- head, with cheek fluff ----
    s += `<path d="M${cx - 72} 120 C${cx - 74} 86 ${cx - 44} 62 ${cx} 62 C${cx + 44} 62 ${cx + 74} 86 ${cx + 72} 120 L${cx + 82} 130 L${cx + 71} 134 L${cx + 78} 147 L${cx + 63} 148 C${cx + 48} 170 ${cx + 26} 180 ${cx} 180 C${cx - 26} 180 ${cx - 48} 170 ${cx - 63} 148 L${cx - 78} 147 L${cx - 71} 134 L${cx - 82} 130 Z" fill="#fff" ${ln(1.9)}/>`;
    s += `<path d="M${cx + 44} 150 C${cx + 34} 166 ${cx + 18} 174 ${cx} 176 C${cx + 22} 176 ${cx + 46} 166 ${cx + 60} 148 Z" fill="${TONE}"/>`;
    s += `<path d="M${cx - 8} 74 L${cx - 5} 86 M${cx} 70 L${cx} 84 M${cx + 8} 74 L${cx + 5} 86" ${ln(0.9)} fill="none" opacity="0.6"/>`;
    // ---- eyes: big, gold, slit pupils, two highlights ----
    for (const d of [-1, 1]) {
        const ex = cx + d * 31;
        const ey = 118;
        const shape = `M${f(ex - d * 15)} ${ey + 3} C${f(ex - d * 13)} ${ey - 10} ${f(ex + d * 10)} ${ey - 15} ${f(ex + d * 16)} ${ey - 6} C${f(ex + d * 17)} ${ey + 6} ${f(ex + d * 8)} ${ey + 14} ${f(ex)} ${ey + 14} C${f(ex - d * 9)} ${ey + 14} ${f(ex - d * 15)} ${ey + 9} ${f(ex - d * 15)} ${ey + 3} Z`;
        s += `<path d="${shape}" fill="#e7c34a"/>`;
        s += `<clipPath id="${id}k${d}"><path d="${shape}"/></clipPath><g clip-path="url(#${id}k${d})"><path d="M${ex - 20} ${ey - 16} L${ex + 20} ${ey - 16} L${ex + 20} ${ey - 2} Q${ex} ${ey - 9} ${ex - 20} ${ey - 2} Z" fill="#c6971f"/></g>`;
        s += `<ellipse cx="${ex}" cy="${ey + 1}" rx="3.4" ry="11" fill="${LINE}"/>`;
        s += `<circle cx="${f(ex - 6)}" cy="${ey - 4}" r="3.6" fill="#fff"/><circle cx="${f(ex + 6)}" cy="${ey + 7}" r="1.5" fill="#fff"/>`;
        s += `<path d="${shape}" fill="none" ${ln(1.5)}/>`;
        s += `<path d="M${f(ex - d * 15.6)} ${ey + 2} C${f(ex - d * 13)} ${ey - 11.4} ${f(ex + d * 10)} ${ey - 16.6} ${f(ex + d * 16.6)} ${ey - 6.4}" ${ln(3)} fill="none"/>`;
        s += `<path d="M${f(ex - d * 15.6)} ${ey + 3} l${-d * 4} 3" ${ln(1.4)} fill="none"/>`;
    }
    // ---- nose, mouth, whiskers ----
    s += `<path d="M${cx - 7} 140 L${cx + 7} 140 L${cx} 147 Z" fill="#dba8a2" ${ln(1.2)}/>`;
    s += `<path d="M${cx} 147 L${cx} 151 M${cx - 13} 151 C${cx - 9} 158 ${cx - 2} 157 ${cx} 151 C${cx + 2} 157 ${cx + 9} 158 ${cx + 13} 151" ${ln(1.4)} fill="none"/>`;
    for (const d of [-1, 1]) {
        s += `<path d="M${cx + d * 22} 148 Q${cx + d * 56} 136 ${cx + d * 104} 132 M${cx + d * 22} 153 Q${cx + d * 58} 150 ${cx + d * 106} 152 M${cx + d * 20} 158 Q${cx + d * 52} 164 ${cx + d * 96} 174" ${ln(0.9)} fill="none"/>`;
        s += `<circle cx="${cx + d * 16}" cy="151" r="0.9" fill="${LINE}"/><circle cx="${cx + d * 20}" cy="155" r="0.9" fill="${LINE}"/><circle cx="${cx + d * 14}" cy="156" r="0.9" fill="${LINE}"/>`;
    }
    return s;
}
