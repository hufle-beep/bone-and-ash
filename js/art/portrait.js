/**
 * Close-up portraits, drawn as realistically as code allows: tonal shading from blurred shapes,
 * layered eyes, hundreds of hair strands, fur that follows the body. Space: the scene viewBox (400×250).
 * Light falls from the upper left. Deterministic (seeded), so a portrait always looks the same.
 */
const f = (n) => Math.round(n * 10) / 10;
function rng(seed) {
    let x = seed >>> 0 || 1;
    return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x % 100000) / 100000; };
}
const INK = '#23211e';
const defs = (id) => `<defs>
<filter id="${id}b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="${id}b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="${id}b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="${id}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.8"/></filter>
<filter id="${id}tex"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.13 0 0 0 0 0.12 0 0 0 0 0.11 0 0 0 0.10 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<radialGradient id="${id}skin" cx="0.4" cy="0.38" r="0.7"><stop offset="0" stop-color="#ece5dc"/><stop offset="0.55" stop-color="#ddd3c8"/><stop offset="1" stop-color="#bfb3a7"/></radialGradient>
<linearGradient id="${id}side" x1="0" y1="0" x2="1" y2="0.15"><stop offset="0.45" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity="0.22"/></linearGradient>
<radialGradient id="${id}iris" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#1c1714"/><stop offset="0.38" stop-color="#2b211b"/><stop offset="0.6" stop-color="#4a3a2e"/><stop offset="0.86" stop-color="#3a2d24"/><stop offset="1" stop-color="#17120f"/></radialGradient>
<linearGradient id="${id}lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e3f3b"/><stop offset="0.5" stop-color="#a5504a"/><stop offset="1" stop-color="#b8665e"/></linearGradient>
<radialGradient id="${id}catiris" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#f2d86a"/><stop offset="0.45" stop-color="#e3be3c"/><stop offset="0.8" stop-color="#c49a26"/><stop offset="1" stop-color="#7d5f14"/></radialGradient>
<radialGradient id="${id}fur" cx="0.42" cy="0.36" r="0.75"><stop offset="0" stop-color="#f7f4ee"/><stop offset="0.6" stop-color="#ece8e0"/><stop offset="1" stop-color="#cfc9be"/></radialGradient>
<linearGradient id="${id}nose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfa7a2"/><stop offset="1" stop-color="#a77d78"/></linearGradient>
<linearGradient id="${id}ear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bf9b96"/><stop offset="1" stop-color="#e6d2cd"/></linearGradient>
</defs>`;

/** Strokes bucketed into a few <path>s, so hundreds of hairs stay cheap to render. */
function strokes(list, color, width, opacity) {
    if (!list.length) return '';
    return `<path d="${list.join('')}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" opacity="${opacity}"/>`;
}
const blur = (id, n) => `filter="url(#${id}b${n})"`;

/* ------------------------------------------------------------------ Mei Lin ---- */

function eye(id, cx, cy, dir, r) {
    // dir: -1 = her right eye (viewer's left), +1 = other. Almond, outer corner a touch higher.
    const ix = cx + dir * 10.5;
    const ox = cx - dir * 11;
    const up = `M${f(ix)} ${f(cy + 1)} C${f(cx + dir * 6)} ${f(cy - 6.6)} ${f(cx - dir * 5)} ${f(cy - 7.4)} ${f(ox)} ${f(cy - 2.2)}`;
    const lo = `C${f(cx - dir * 6)} ${f(cy + 3.6)} ${f(cx + dir * 5)} ${f(cy + 4.4)} ${f(ix)} ${f(cy + 1)} Z`;
    const shape = `${up} ${lo}`;
    const cid = `${id}e${dir < 0 ? 'l' : 'r'}`;
    let s = `<clipPath id="${cid}"><path d="${shape}"/></clipPath>`;
    // socket shadow and crease
    s += `<ellipse cx="${f(cx)}" cy="${f(cy - 3)}" rx="16" ry="8" fill="${INK}" opacity="0.13" ${blur(id, 4)}/>`;
    s += `<path d="M${f(ix - dir * 1.5)} ${f(cy - 4.6)} C${f(cx + dir * 4)} ${f(cy - 9.4)} ${f(cx - dir * 6)} ${f(cy - 9.6)} ${f(ox + dir * 1)} ${f(cy - 5)}" stroke="${INK}" stroke-width="0.7" fill="none" opacity="0.35"/>`;
    // sclera, iris, pupil, lid shadow, highlights
    s += `<path d="${shape}" fill="#f1ede6"/>`;
    s += `<g clip-path="url(#${cid})"><circle cx="${f(cx + dir * 0.4)}" cy="${f(cy - 1)}" r="6.4" fill="url(#${id}iris)"/>`;
    for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2 + r() * 0.2;
        s += `<path d="M${f(cx + dir * 0.4 + Math.cos(a) * 2.7)} ${f(cy - 1 + Math.sin(a) * 2.7)} L${f(cx + dir * 0.4 + Math.cos(a) * 6)} ${f(cy - 1 + Math.sin(a) * 6)}" stroke="#6b5646" stroke-width="0.35" opacity="${f(0.25 + r() * 0.35)}"/>`;
    }
    s += `<circle cx="${f(cx + dir * 0.4)}" cy="${f(cy - 1)}" r="2.6" fill="#0d0b0a"/>`;
    s += `<path d="${up} L${f(ox)} ${f(cy - 0.6)} C${f(cx - dir * 4)} ${f(cy - 4.6)} ${f(cx + dir * 5)} ${f(cy - 4)} ${f(ix)} ${f(cy + 2)} Z" fill="${INK}" opacity="0.28" ${blur(id, 1)}/>`;
    s += `<circle cx="${f(cx - dir * 1.6)}" cy="${f(cy - 3.2)}" r="1.3" fill="#fff" opacity="0.95"/><circle cx="${f(cx + dir * 2.6)}" cy="${f(cy + 1.4)}" r="0.55" fill="#fff" opacity="0.7"/></g>`;
    // lids: a strong upper line thickening outward, a soft lower line
    s += `<path d="${up}" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${f(cx - dir * 3)} ${f(cy - 5.2)} C${f(cx - dir * 7)} ${f(cy - 4.6)} ${f(ox)} ${f(cy - 2.2)} ${f(ox - dir * 2.2)} ${f(cy - 3.4)}" stroke="${INK}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${f(ox + dir * 0.5)} ${f(cy - 1.6)} C${f(cx - dir * 6)} ${f(cy + 3.6)} ${f(cx + dir * 5)} ${f(cy + 4.4)} ${f(ix)} ${f(cy + 1)}" stroke="#5a4e46" stroke-width="0.5" fill="none" opacity="0.6"/>`;
    // lashes: upper, sweeping outward
    const lash = [];
    for (let i = 0; i < 16; i++) {
        const t = 0.25 + (i / 15) * 0.75;
        const px = ix + (ox - ix) * t;
        const py = cy + 1 - Math.sin(Math.PI * t) * 6.4 - t * 2.2;
        const len = 1.6 + t * 2.6 + r() * 0.8;
        const ang = -Math.PI / 2 - dir * (0.25 + t * 0.9);
        lash.push(`M${f(px)} ${f(py)} q${f(Math.cos(ang) * len * 0.5)} ${f(Math.sin(ang) * len * 0.6)} ${f(Math.cos(ang) * len)} ${f(Math.sin(ang) * len * 0.8)}`);
    }
    s += strokes(lash, INK, 0.45, 0.85);
    const low = [];
    for (let i = 0; i < 6; i++) {
        const t = 0.45 + i * 0.09;
        const px = ix + (ox - ix) * t;
        const py = cy + 1 + Math.sin(Math.PI * t) * 3.4;
        low.push(`M${f(px)} ${f(py)} l${f(-dir * 0.5)} ${f(1.3)}`);
    }
    s += strokes(low, INK, 0.3, 0.5);
    return s;
}

function brow(cx, cy, dir, r) {
    const out = [];
    for (let i = 0; i < 60; i++) {
        const t = i / 59; // 0 = inner end (by the nose), 1 = outer end
        const x = cx + dir * 10 - dir * t * 25;
        const y = cy - Math.sin(Math.PI * Math.min(1, t * 1.25)) * 2.8 + t * 0.6;
        const thick = 1.6 * (1 - t * 0.7);
        const len = 2.4 + (1 - t) * 1.2;
        const a = Math.atan2(t < 0.3 ? -0.3 : 0.12, -dir) + (r() - 0.5) * 0.3;
        out.push(`M${f(x)} ${f(y + (r() - 0.5) * thick)} l${f(Math.cos(a) * len)} ${f(Math.sin(a) * len)}`);
    }
    return strokes(out, '#2e2925', 0.42, 0.5);
}

/** Hair as many strands: each one a curve from the parting, around the face, to its tip. */
function hairStrands(r, n, from, around, to, spread, color, width, opacity) {
    const out = [];
    for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const j = () => (r() - 0.5) * spread;
        const p0 = [from[0](t) + j() * 0.3, from[1](t) + j() * 0.3];
        const p1 = [around[0](t) + j(), around[1](t) + j()];
        const p2 = [to[0](t) + j() * 1.6, to[1](t) + j()];
        out.push(`M${f(p0[0])} ${f(p0[1])} Q${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])}`);
    }
    return strokes(out, color, width, opacity);
}

export function meiPortrait(id = 'pm') {
    const r = rng(2611);
    const cx = 200;
    const cy = 112;
    let s = defs(id);
    // ---- hair mass behind the head and shoulders ----
    const back = `M${cx - 58} 262 C${cx - 68} 180 ${cx - 64} 120 ${cx - 52} 84 C${cx - 40} 46 ${cx - 18} 36 ${cx} 36 C${cx + 18} 36 ${cx + 40} 46 ${cx + 52} 84 C${cx + 64} 120 ${cx + 68} 180 ${cx + 58} 262 Z`;
    s += `<path d="${back}" fill="#2a2724"/>`;
    s += hairStrands(r, 90, [(t) => cx - 6 + t * 12, () => 40], [(t) => cx - 70 + t * 140, (t) => 120 + Math.abs(t - 0.5) * 20], [(t) => cx - 60 + t * 120, () => 262], 10, '#4a4540', 0.5, 0.6);
    // ---- robe: outer layer with a woven pattern, white inner collar crossing right over left ----
    const robe = `M${cx - 120} 252 C${cx - 112} 222 ${cx - 86} 206 ${cx - 46} 198 L${cx + 46} 198 C${cx + 86} 206 ${cx + 112} 222 ${cx + 120} 252 Z`;
    s += `<path d="${robe}" fill="#b9b2a6"/><path d="${robe}" fill="url(#${id}side)"/><clipPath id="${id}rc"><path d="${robe}"/></clipPath><g clip-path="url(#${id}rc)">`;
    const pat = [];
    for (let i = 0; i < 70; i++) {
        const x = cx - 110 + r() * 220;
        const y = 206 + r() * 46;
        const d = Math.abs(x - cx);
        if (y < 196 + d * 0.12) continue;
        pat.push(`M${f(x + 1.6)} ${f(y)} a1.6 1.6 0 1 0 0.01 0 M${f(x + 0.5)} ${f(y)} a0.5 0.5 0 1 0 0.01 0`);
    }
    s += strokes(pat, INK, 0.4, 0.3);
    for (const [fx, fy, sc] of [[cx - 88, 232, 1], [cx + 84, 230, 0.9], [cx - 64, 214, 0.6]]) {
        s += `<g transform="translate(${fx} ${fy}) scale(${sc})" stroke="${INK}" stroke-width="0.5" opacity="0.6">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${f(Math.cos(a * Math.PI / 180) * 5)}" cy="${f(Math.sin(a * Math.PI / 180) * 5)}" rx="4.6" ry="3" transform="rotate(${a} ${f(Math.cos(a * Math.PI / 180) * 5)} ${f(Math.sin(a * Math.PI / 180) * 5)})" fill="#d8d2c7"/>`).join('')}<circle r="1.8" fill="#a02c2c" stroke="none"/><path d="M6 6 C12 12 16 14 22 14 M-6 6 C-10 14 -16 18 -22 18" fill="none"/><ellipse cx="16" cy="11" rx="4" ry="1.6" transform="rotate(30 16 11)" fill="#c9c2b6"/></g>`;
    }
    s += `</g>`;
    s += `<path d="M${cx - 92} 252 C${cx - 86} 236 ${cx - 78} 220 ${cx - 66} 212 M${cx + 92} 252 C${cx + 88} 236 ${cx + 80} 222 ${cx + 70} 213" stroke="${INK}" stroke-width="0.8" fill="none" opacity="0.35"/>`;
    s += `<path d="M${cx - 30} 196 C${cx - 18} 214 ${cx + 6} 236 ${cx + 26} 252 L${cx + 40} 252 C${cx + 18} 232 ${cx - 2} 212 ${cx - 16} 196 Z" fill="#efebe3" stroke="${INK}" stroke-width="0.8"/>`;
    s += `<path d="M${cx + 30} 196 C${cx + 22} 206 ${cx + 12} 216 ${cx + 4} 222 L${cx + 10} 226 C${cx + 20} 216 ${cx + 30} 206 ${cx + 42} 198 Z" fill="#efebe3" stroke="${INK}" stroke-width="0.8"/>`;
    s += `<path d="M${cx - 46} 198 C${cx - 30} 204 ${cx - 14} 222 ${cx + 6} 244" stroke="${INK}" stroke-width="5" fill="none" opacity="0.08" ${blur(id, 2)}/>`;
    // ---- neck with the shadow the jaw throws on it ----
    s += `<path d="M${cx - 15} 150 C${cx - 14} 170 ${cx - 16} 186 ${cx - 28} 198 L${cx + 28} 198 C${cx + 16} 186 ${cx + 14} 170 ${cx + 15} 150 Z" fill="url(#${id}skin)"/>`;
    s += `<path d="M${cx - 18} 158 C${cx - 8} 176 ${cx + 8} 176 ${cx + 18} 158 L${cx + 18} 150 L${cx - 18} 150 Z" fill="${INK}" opacity="0.28" ${blur(id, 4)}/>`;
    s += `<path d="M${cx + 8} 160 C${cx + 10} 176 ${cx + 14} 188 ${cx + 24} 198" stroke="${INK}" stroke-width="5" opacity="0.08" fill="none" ${blur(id, 2)}/>`;
    // ---- face ----
    const face = `M${cx - 45} 102 C${cx - 45} 70 ${cx - 25} 54 ${cx} 54 C${cx + 25} 54 ${cx + 45} 70 ${cx + 45} 102 C${cx + 46} 124 ${cx + 41} 140 ${cx + 31} 151 C${cx + 21} 161 ${cx + 11} 166 ${cx} 166 C${cx - 11} 166 ${cx - 21} 161 ${cx - 31} 151 C${cx - 41} 140 ${cx - 46} 124 ${cx - 45} 102 Z`;
    s += `<path d="${face}" fill="url(#${id}skin)"/>`;
    s += `<clipPath id="${id}fc"><path d="${face}"/></clipPath><g clip-path="url(#${id}fc)">`;
    s += `<path d="${face}" fill="url(#${id}side)"/>`;
    s += `<ellipse cx="${cx + 40}" cy="125" rx="12" ry="34" fill="${INK}" opacity="0.16" ${blur(id, 8)}/>`;
    s += `<ellipse cx="${cx - 36}" cy="128" rx="8" ry="22" fill="${INK}" opacity="0.08" ${blur(id, 8)}/>`;
    s += `<ellipse cx="${cx}" cy="66" rx="40" ry="10" fill="${INK}" opacity="0.14" ${blur(id, 4)}/>`;
    s += `<ellipse cx="${cx - 8}" cy="80" rx="16" ry="9" fill="#fff" opacity="0.35" ${blur(id, 8)}/>`;
    s += `<ellipse cx="${cx - 24}" cy="128" rx="11" ry="6" fill="#fff" opacity="0.3" ${blur(id, 4)}/>`;
    s += `<ellipse cx="${cx - 24}" cy="134" rx="10" ry="6" fill="#b4625a" opacity="0.12" ${blur(id, 4)}/><ellipse cx="${cx + 24}" cy="134" rx="10" ry="6" fill="#b4625a" opacity="0.1" ${blur(id, 4)}/>`;
    s += `<path d="M${cx + 30} 150 C${cx + 20} 164 ${cx + 8} 170 ${cx} 170" stroke="${INK}" stroke-width="6" fill="none" opacity="0.1" ${blur(id, 2)}/>`;
    s += `</g>`;
    s += `<path d="M${cx + 45} 102 C${cx + 46} 124 ${cx + 41} 140 ${cx + 31} 151 C${cx + 21} 161 ${cx + 11} 166 ${cx} 166 C${cx - 11} 166 ${cx - 21} 161 ${cx - 31} 151" stroke="#6d6158" stroke-width="0.7" fill="none" opacity="0.6"/>`;
    // ---- nose: shaped by light and shadow, no outline ----
    s += `<path d="M${cx + 3} 106 C${cx + 4} 118 ${cx + 6} 128 ${cx + 6} 136" stroke="${INK}" stroke-width="4" opacity="0.1" fill="none" ${blur(id, 2)}/>`;
    s += `<path d="M${cx - 2} 108 C${cx - 2} 118 ${cx - 1} 128 ${cx} 134" stroke="#fff" stroke-width="2.4" opacity="0.4" fill="none" ${blur(id, 1)}/>`;
    s += `<ellipse cx="${cx + 1}" cy="140" rx="9" ry="3.6" fill="${INK}" opacity="0.16" ${blur(id, 2)}/>`;
    s += `<path d="M${cx - 8.6} 137 C${cx - 10} 141 ${cx - 6.4} 143.4 ${cx - 3.2} 142.6 M${cx + 8.6} 137 C${cx + 10} 141 ${cx + 6.4} 143.4 ${cx + 3.2} 142.6" stroke="#5e5149" stroke-width="0.7" fill="none" opacity="0.7"/>`;
    s += `<ellipse cx="${cx - 4.4}" cy="141.6" rx="2.2" ry="1.1" fill="#3b302a" opacity="0.7" ${blur(id, 1)}/><ellipse cx="${cx + 4.4}" cy="141.6" rx="2.2" ry="1.1" fill="#3b302a" opacity="0.7" ${blur(id, 1)}/>`;
    s += `<ellipse cx="${cx - 0.6}" cy="136" rx="2.4" ry="1.4" fill="#fff" opacity="0.5" ${blur(id, 1)}/>`;
    // ---- mouth ----
    s += `<path d="M${cx} 145 L${cx} 150" stroke="${INK}" stroke-width="2.6" opacity="0.07" ${blur(id, 1)}/>`;
    s += `<path d="M${cx - 13} 153.5 C${cx - 8} 150 ${cx - 3} 149.4 ${cx} 151.2 C${cx + 3} 149.4 ${cx + 8} 150 ${cx + 13} 153.5 C${cx + 7} 154.8 ${cx + 3} 155.2 ${cx} 155 C${cx - 3} 155.2 ${cx - 7} 154.8 ${cx - 13} 153.5 Z" fill="url(#${id}lip)"/>`;
    s += `<path d="M${cx - 12} 154 C${cx - 7} 161.6 ${cx + 7} 161.6 ${cx + 12} 154 C${cx + 7} 156 ${cx - 7} 156 ${cx - 12} 154 Z" fill="url(#${id}lip)" opacity="0.92"/>`;
    s += `<path d="M${cx - 13} 153.5 C${cx - 7} 155.4 ${cx + 7} 155.4 ${cx + 13} 153.5" stroke="#4a2523" stroke-width="0.8" fill="none"/>`;
    s += `<ellipse cx="${cx - 2}" cy="157.6" rx="4.6" ry="1.2" fill="#fff" opacity="0.35" ${blur(id, 1)}/>`;
    s += `<ellipse cx="${cx}" cy="164" rx="8" ry="2.4" fill="${INK}" opacity="0.1" ${blur(id, 2)}/>`;
    // ---- eyes and brows ----
    s += eye(id, cx - 20.5, 112, 1, r) + eye(id, cx + 20.5, 112, -1, r);
    s += brow(cx - 20.5, 99.5, 1, r) + brow(cx + 20.5, 99.5, -1, r);
    // ---- front hair: parted in the middle, falling over the temples and past the cheeks ----
    const sideL = `M${cx - 1} 46 C${cx - 22} 48 ${cx - 40} 60 ${cx - 46} 84 C${cx - 50} 108 ${cx - 50} 140 ${cx - 56} 172 C${cx - 58} 190 ${cx - 62} 230 ${cx - 64} 262 L${cx - 50} 262 C${cx - 48} 206 ${cx - 46} 180 ${cx - 44} 150 C${cx - 44} 126 ${cx - 42} 100 ${cx - 36} 80 C${cx - 28} 62 ${cx - 14} 54 ${cx - 1} 52 Z`;
    const sideR = sideL.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (m, a, _b, c) => `${f(2 * cx - Number(a))} ${c}`).replace(/M(\d)/, 'M$1');
    const mirror = (d) => d.replace(/([MLC ])\s*(-?[\d.]+) (-?[\d.]+)/g, (m, cmd, a, b) => `${cmd}${f(2 * cx - Number(a))} ${b}`);
    void sideR;
    s += `<path d="${sideL}" fill="#262321"/><path d="${mirror(sideL)}" fill="#262321"/>`;
    s += hairStrands(r, 70, [(t) => cx - 1 - t * 2, (t) => 46 + t * 4], [(t) => cx - 30 - t * 14, (t) => 58 + t * 10], [(t) => cx - 44 - t * 20, (t) => 130 + t * 132], 6, '#5a544d', 0.45, 0.7);
    s += hairStrands(r, 70, [(t) => cx + 1 + t * 2, (t) => 46 + t * 4], [(t) => cx + 30 + t * 14, (t) => 58 + t * 10], [(t) => cx + 44 + t * 20, (t) => 130 + t * 132], 6, '#4a4540', 0.45, 0.7);
    s += hairStrands(r, 26, [(t) => cx - 2 - t * 3, (t) => 47 + t * 3], [(t) => cx - 32 - t * 6, (t) => 60 + t * 6], [(t) => cx - 46 - t * 8, (t) => 110 + t * 60], 4, '#9c968c', 0.5, 0.55);
    s += hairStrands(r, 10, [(t) => cx + 2, (t) => 47 + t * 2], [(t) => cx + 30, () => 62], [(t) => cx + 44 + t * 6, (t) => 104 + t * 30], 4, '#7a746b', 0.4, 0.45);
    const fringe = `M${cx - 44} 92 C${cx - 44} 64 ${cx - 26} 46 ${cx} 46 C${cx + 26} 46 ${cx + 44} 64 ${cx + 44} 92 C${cx + 36} 94 ${cx + 30} 90 ${cx + 24} 95 C${cx + 16} 92 ${cx + 10} 96 ${cx + 2} 94 C${cx - 6} 97 ${cx - 12} 93 ${cx - 20} 96 C${cx - 28} 92 ${cx - 34} 96 ${cx - 44} 92 Z`;
    s += `<path d="${fringe}" fill="#2a2724"/>`;
    s += hairStrands(r, 90, [(t) => cx - 4 + t * 8, () => 46], [(t) => cx - 40 + t * 80, (t) => 62 + Math.abs(t - 0.5) * 10], [(t) => cx - 44 + t * 88, (t) => 92 + Math.sin(t * 37) * 2.4], 5, '#5e5850', 0.42, 0.7);
    s += hairStrands(r, 24, [(t) => cx - 4 + t * 4, () => 46], [(t) => cx - 34 + t * 30, () => 62], [(t) => cx - 40 + t * 34, (t) => 90 + Math.sin(t * 23) * 2], 4, '#a29c92', 0.45, 0.6);
    s += `<path d="M${cx - 42} 96 C${cx - 20} 102 ${cx + 20} 102 ${cx + 42} 96" stroke="${INK}" stroke-width="6" opacity="0.1" fill="none" ${blur(id, 2)}/>`;
    // a few loose wisps across the cheek
    s += strokes([`M${cx - 30} 64 C${cx - 38} 86 ${cx - 40} 110 ${cx - 36} 132`, `M${cx + 28} 62 C${cx + 36} 84 ${cx + 40} 104 ${cx + 42} 120`], '#2a2724', 0.5, 0.7);
    // ---- the bun, hairpin, tassel and a small flower ----
    s += `<ellipse cx="${cx + 2}" cy="26" rx="28" ry="18" fill="#2a2724"/>`;
    const bun = [];
    for (let i = 0; i < 46; i++) {
        const a0 = r() * Math.PI * 2;
        const rr = 6 + r() * 20;
        const a1 = a0 + 0.8 + r() * 1.2;
        bun.push(`M${f(cx + 2 + Math.cos(a0) * rr)} ${f(26 + Math.sin(a0) * rr * 0.62)} A${f(rr)} ${f(rr * 0.62)} 0 0 1 ${f(cx + 2 + Math.cos(a1) * rr)} ${f(26 + Math.sin(a1) * rr * 0.62)}`);
    }
    s += strokes(bun, '#6a645c', 0.45, 0.6);
    s += `<path d="M${cx - 40} 20 L${cx + 46} 36" stroke="#3a3530" stroke-width="2.4" stroke-linecap="round"/><path d="M${cx - 40} 20 L${cx + 46} 36" stroke="#8a847b" stroke-width="0.7" stroke-linecap="round" opacity="0.7"/>`;
    s += `<circle cx="${cx + 48}" cy="36.4" r="3.4" fill="#a02c2c"/><circle cx="${cx + 47}" cy="35.4" r="1" fill="#fff" opacity="0.6"/>`;
    s += strokes([0, 1, 2, 3, 4].map((i) => `M${cx + 48} 39.6 C${cx + 48 + i * 0.6} 48 ${cx + 47 + i * 0.9} 56 ${cx + 47.6 + i * 1.1} 64`), '#a02c2c', 0.6, 0.8);
    for (const dir of [-1, 1]) {
        const ox = cx + dir * 30;
        s += `<path d="M${cx + dir * 14} 22 C${cx + dir * 22} 18 ${ox} 22 ${ox + dir * 4} 30" stroke="#5a544c" stroke-width="1.4" fill="none"/>`;
        s += `<circle cx="${ox + dir * 4}" cy="31" r="2.4" fill="#d8d0bf" stroke="${INK}" stroke-width="0.5"/>`;
        s += strokes([`M${ox + dir * 4} 33.4 L${ox + dir * 4} 44`, `M${ox + dir * 4} 48 L${ox + dir * 4} 54`], '#5a544c', 0.6, 0.9);
        s += `<path d="M${ox + dir * 4 - 2.6} 46 L${ox + dir * 4} 43 L${ox + dir * 4 + 2.6} 46 L${ox + dir * 4} 49 Z" fill="#d8d0bf" stroke="${INK}" stroke-width="0.5"/>`;
        s += strokes([0, 1, 2, 3, 4, 5].map((i) => `M${ox + dir * 4 - 1.5 + i * 0.6} 54 L${f(ox + dir * 4 - 2 + i * 0.8)} 70`), '#a02c2c', 0.5, 0.85);
    }
    s += `<g transform="translate(${cx - 22} 16)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${f(Math.cos(a * Math.PI / 180) * 3.6)}" cy="${f(Math.sin(a * Math.PI / 180) * 3.6)}" rx="3" ry="2.2" transform="rotate(${a} ${f(Math.cos(a * Math.PI / 180) * 3.6)} ${f(Math.sin(a * Math.PI / 180) * 3.6)})" fill="#f4f0e8" stroke="${INK}" stroke-width="0.4"/>`).join('')}<circle r="1.4" fill="#a02c2c"/></g>`;
    // ---- a fine paper texture over the skin and cloth ----
    s += `<rect width="400" height="250" filter="url(#${id}tex)" opacity="0.5"/>`;
    return s;
}

/* -------------------------------------------------------------------- Yuki ---- */

/** Short strokes laid along a direction field, inside a region. */
function fur(r, n, inside, dir, len, color, width, opacity, box) {
    const out = [];
    let tries = 0;
    while (out.length < n && tries < n * 8) {
        tries++;
        const x = box[0] + r() * (box[2] - box[0]);
        const y = box[1] + r() * (box[3] - box[1]);
        if (!inside(x, y)) continue;
        const [dx, dy] = dir(x, y);
        const l = len * (0.6 + r() * 0.8);
        const bend = (r() - 0.5) * 0.5;
        out.push(`M${f(x)} ${f(y)} q${f((dx - dy * bend) * l * 0.5)} ${f((dy + dx * bend) * l * 0.5)} ${f(dx * l)} ${f(dy * l)}`);
    }
    return strokes(out, color, width, opacity);
}
const norm = (x, y) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; };

export function yukiPortrait(id = 'py') {
    const r = rng(1205);
    const cx = 200;
    const cy = 116;
    let s = defs(id);
    const inHead = (x, y) => ((x - cx) / 76) ** 2 + ((y - cy) / 64) ** 2 < 1;
    const inChest = (x, y) => y > 158 && Math.abs(x - cx) < 60 + (y - 158) * 0.55;
    // ---- chest and shoulders ----
    const chest = `M${cx - 118} 262 C${cx - 108} 214 ${cx - 84} 180 ${cx - 54} 166 L${cx + 54} 166 C${cx + 84} 180 ${cx + 108} 214 ${cx + 118} 262 Z`;
    s += `<path d="${chest}" fill="url(#${id}fur)"/><path d="${chest}" fill="url(#${id}side)" opacity="0.7"/>`;
    s += fur(r, 520, (x, y) => inChest(x, y) && y < 252, (x, y) => norm((x - cx) * 0.35, 1), 7, '#8f887e', 0.45, 0.35, [cx - 150, 160, cx + 150, 252]);
    s += fur(r, 160, (x, y) => inChest(x, y) && x < cx + 20, (x, y) => norm((x - cx) * 0.3, 1), 8, '#fff', 0.7, 0.6, [cx - 150, 160, cx + 150, 252]);
    // ruff: longer tufts at the throat
    const ruff = [];
    for (let i = 0; i < 70; i++) {
        const x = cx - 60 + r() * 120;
        const y = 168 + r() * 26;
        ruff.push(`M${f(x)} ${f(y)} q${f((x - cx) * 0.04 + (r() - 0.5) * 3)} 6 ${f((x - cx) * 0.08 + (r() - 0.5) * 6)} ${f(10 + r() * 8)}`);
    }
    s += strokes(ruff, '#9a938a', 0.5, 0.45);
    s += `<ellipse cx="${cx}" cy="170" rx="58" ry="12" fill="${INK}" opacity="0.14" ${blur(id, 8)}/>`;
    // ---- ears ----
    const earL = `M${cx - 70} 86 C${cx - 74} 60 ${cx - 70} 36 ${cx - 60} 14 C${cx - 44} 28 ${cx - 30} 44 ${cx - 22} 58 Z`;
    const earR = `M${cx + 70} 86 C${cx + 74} 60 ${cx + 70} 36 ${cx + 60} 14 C${cx + 44} 28 ${cx + 30} 44 ${cx + 22} 58 Z`;
    for (const [d, dir] of [[earL, -1], [earR, 1]]) {
        s += `<path d="${d}" fill="url(#${id}fur)" stroke="#a49d93" stroke-width="0.8"/>`;
        const inner = `M${cx + dir * 64} 80 C${cx + dir * 66} 60 ${cx + dir * 64} 42 ${cx + dir * 58} 26 C${cx + dir * 46} 38 ${cx + dir * 36} 50 ${cx + dir * 30} 62 Z`;
        s += `<path d="${inner}" fill="url(#${id}ear)" opacity="0.85"/>`;
        s += `<path d="${inner}" fill="${INK}" opacity="0.08" ${blur(id, 2)}/>`;
        const hairs = [];
        for (let i = 0; i < 26; i++) {
            const t = r();
            const bx = cx + dir * (58 - t * 22);
            const by = 78 - t * 12;
            hairs.push(`M${f(bx)} ${f(by)} q${f(dir * (2 + r() * 4))} ${f(-8 - r() * 8)} ${f(dir * (1 + r() * 6))} ${f(-16 - r() * 16)}`);
        }
        s += strokes(hairs, '#fbf9f5', 0.5, 0.9);
        s += strokes(hairs.slice(0, 10), '#8f887e', 0.3, 0.4);
    }
    // ---- head ----
    const head = `M${cx - 76} 120 C${cx - 78} 88 ${cx - 56} 56 ${cx} 54 C${cx + 56} 56 ${cx + 78} 88 ${cx + 76} 120 C${cx + 76} 150 ${cx + 56} 172 ${cx + 30} 180 C${cx + 14} 184 ${cx - 14} 184 ${cx - 30} 180 C${cx - 56} 172 ${cx - 76} 150 ${cx - 76} 120 Z`;
    s += `<path d="${head}" fill="url(#${id}fur)"/>`;
    s += `<clipPath id="${id}hc"><path d="${head}"/></clipPath><g clip-path="url(#${id}hc)">`;
    s += `<path d="${head}" fill="url(#${id}side)" opacity="0.8"/>`;
    s += `<ellipse cx="${cx}" cy="186" rx="44" ry="16" fill="${INK}" opacity="0.2" ${blur(id, 8)}/>`;
    s += `<ellipse cx="${cx - 26}" cy="104" rx="20" ry="12" fill="${INK}" opacity="0.07" ${blur(id, 4)}/><ellipse cx="${cx + 26}" cy="104" rx="20" ry="12" fill="${INK}" opacity="0.09" ${blur(id, 4)}/>`;
    s += `<ellipse cx="${cx - 20}" cy="74" rx="26" ry="10" fill="#fff" opacity="0.6" ${blur(id, 8)}/>`;
    // forehead: fur flows up and out; cheeks: out from the nose; muzzle: down and out
    const nose = [cx, 140];
    const dirFace = (x, y) => {
        if (y < 98) return norm((x - cx) * 0.5, -(98 - y) * 0.6 - 4);
        return norm(x - nose[0], (y - nose[1]) * 0.6 + 6);
    };
    s += fur(r, 900, inHead, dirFace, 5.5, '#8f887e', 0.38, 0.32, [cx - 80, 52, cx + 80, 184]);
    s += fur(r, 340, (x, y) => inHead(x, y) && x < cx + 10, dirFace, 6, '#ffffff', 0.6, 0.65, [cx - 80, 52, cx + 80, 184]);
    // the faint darker M on the brow
    s += strokes([`M${cx - 12} 70 L${cx - 6} 92`, `M${cx} 66 L${cx} 90`, `M${cx + 12} 70 L${cx + 6} 92`], '#b2aba1', 1.6, 0.35);
    s += `</g>`;
    // furry silhouette: tufts out past the outline
    const edge = [];
    for (let i = 0; i < 150; i++) {
        const a = (i / 150) * Math.PI * 2;
        const ex = cx + Math.cos(a) * 76;
        const ey = cy + Math.sin(a) * 63;
        if (ey < 70 && Math.abs(ex - cx) > 20 && Math.abs(ex - cx) < 66) continue; // under the ears
        if (Math.sin(a) > 0.3) continue; // the chin blends into the chest
        const [dx, dy] = norm(Math.cos(a) * 1.2, Math.sin(a) + 0.5);
        const l = 3 + r() * 6;
        edge.push(`M${f(ex - dx * 2)} ${f(ey - dy * 2)} q${f(dx * l * 0.5 + (r() - 0.5) * 2)} ${f(dy * l * 0.5)} ${f(dx * l)} ${f(dy * l)}`);
    }
    s += strokes(edge, '#f6f3ed', 1.4, 1) + strokes(edge, '#8f887e', 0.35, 0.55);
    // ---- eyes: almond, tilted, gold with a slit ----
    for (const dir of [-1, 1]) {
        const ex = cx + dir * 30;
        const ey = 112;
        const shape = `M${ex - dir * 18} ${ey + 3} C${ex - dir * 10} ${ey - 12} ${ex + dir * 10} ${ey - 14} ${ex + dir * 18} ${ey - 6} C${ex + dir * 12} ${ey + 8} ${ex - dir * 8} ${ey + 12} ${ex - dir * 18} ${ey + 3} Z`;
        const cid = `${id}ce${dir}`;
        s += `<ellipse cx="${ex}" cy="${ey}" rx="24" ry="17" fill="${INK}" opacity="0.1" ${blur(id, 4)}/>`;
        s += `<clipPath id="${cid}"><path d="${shape}"/></clipPath><path d="${shape}" fill="url(#${id}catiris)"/>`;
        s += `<g clip-path="url(#${cid})">`;
        for (let i = 0; i < 40; i++) {
            const a = (i / 40) * Math.PI * 2;
            s += `<path d="M${f(ex + Math.cos(a) * 4)} ${f(ey - 2 + Math.sin(a) * 4)} L${f(ex + Math.cos(a) * 16)} ${f(ey - 2 + Math.sin(a) * 16)}" stroke="${i % 3 ? '#a4801c' : '#f6e48e'}" stroke-width="0.4" opacity="${f(0.2 + r() * 0.35)}"/>`;
        }
        s += `<ellipse cx="${ex + dir * 0.6}" cy="${ey - 2}" rx="${f(2.6)}" ry="11.5" fill="#0c0a08"/>`;
        s += `<path d="M${ex - dir * 18} ${ey + 3} C${ex - dir * 10} ${ey - 12} ${ex + dir * 10} ${ey - 14} ${ex + dir * 18} ${ey - 6} L${ex + dir * 18} ${ey - 2} C${ex + dir * 8} ${ey - 8} ${ex - dir * 8} ${ey - 6} ${ex - dir * 18} ${ey + 6} Z" fill="${INK}" opacity="0.35" ${blur(id, 1)}/>`;
        s += `<ellipse cx="${ex - 5}" cy="${ey - 6}" rx="3.2" ry="2.2" fill="#fff" opacity="0.95"/><circle cx="${ex + 5}" cy="${ey + 3}" r="0.9" fill="#fff" opacity="0.6"/>`;
        s += `</g><path d="${shape}" stroke="#1d1a17" stroke-width="2" fill="none"/>`;
        s += `<path d="M${ex - dir * 18} ${ey + 3} l${-dir * 5} ${4}" stroke="#4a443e" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>`;
    }
    // ---- nose leather, mouth, muzzle ----
    s += `<ellipse cx="${cx - 18}" cy="152" rx="19" ry="12" fill="#fbf9f5" opacity="0.8" ${blur(id, 2)}/><ellipse cx="${cx + 18}" cy="152" rx="19" ry="12" fill="#f3efe8" opacity="0.8" ${blur(id, 2)}/>`;
    s += `<path d="M${cx - 8} 133 L${cx + 8} 133 C${cx + 9} 137 ${cx + 3} 142.6 ${cx} 143.4 C${cx - 3} 142.6 ${cx - 9} 137 ${cx - 8} 133 Z" fill="url(#${id}nose)" stroke="#7d5c58" stroke-width="0.6"/>`;
    s += `<path d="M${cx - 5.6} 136.6 q2 1.4 3.6 0.6 M${cx + 5.6} 136.6 q-2 1.4 -3.6 0.6" stroke="#5b403d" stroke-width="0.9" fill="none" stroke-linecap="round"/><ellipse cx="${cx - 2}" cy="134.6" rx="2.4" ry="1" fill="#fff" opacity="0.5"/>`;
    s += `<path d="M${cx} 143.4 L${cx} 150 M${cx} 150 C${cx - 4} 155.6 ${cx - 11} 156 ${cx - 14} 151.6 M${cx} 150 C${cx + 4} 155.6 ${cx + 11} 156 ${cx + 14} 151.6" stroke="#5b4f49" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    s += `<ellipse cx="${cx}" cy="162" rx="9" ry="4" fill="${INK}" opacity="0.12" ${blur(id, 2)}/>`;
    const dots = [];
    for (const dir of [-1, 1]) for (let row = 0; row < 4; row++) for (let i = 0; i < 4; i++) dots.push(`M${f(cx + dir * (10 + i * 5.4 + row * 1.6))} ${f(146 + row * 4 + i * 0.6)} h0.01`);
    s += strokes(dots, '#8a8278', 1.1, 0.55);
    // ---- whiskers: long, fine, white with a hairline shadow so they read on white fur ----
    const wh = [];
    for (const dir of [-1, 1]) for (let i = 0; i < 7; i++) {
        const x0 = cx + dir * (14 + (i % 4) * 5.4);
        const y0 = 147 + Math.floor(i / 2) * 3.4;
        const ang = -0.28 + i * 0.1;
        const len = 80 + r() * 50;
        const ex = x0 + dir * Math.cos(ang) * len;
        const ey = y0 + Math.sin(ang) * len;
        wh.push(`M${f(x0)} ${f(y0)} Q${f((x0 + ex) / 2 + dir * 6)} ${f((y0 + ey) / 2 - 8)} ${f(ex)} ${f(ey + 6)}`);
    }
    for (const dir of [-1, 1]) for (let i = 0; i < 4; i++) {
        const x0 = cx + dir * (20 + i * 7);
        wh.push(`M${x0} 92 Q${f(x0 + dir * 10)} ${70 - i * 4} ${f(x0 + dir * (18 + i * 6))} ${62 - i * 6}`);
    }
    s += strokes(wh, '#6c665e', 1.1, 0.25) + strokes(wh, '#ffffff', 0.7, 0.95);
    s += `<rect width="400" height="250" filter="url(#${id}tex)" opacity="0.4"/>`;
    return s;
}
