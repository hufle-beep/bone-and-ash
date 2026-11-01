/**
 * Stylized scene art, drawn in code: flat ink layers, mist bands, a red sun, bone-white accents.
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

function sky(top, bottom, id = 'sk') {
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
}
function sun(x, y, r, color = C.crimson, glow = 0.35) {
    return `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="${color}" opacity="${glow * 0.4}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
}
function moon(x, y, r) {
    return `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="${C.paper}" opacity="0.06"/><circle cx="${x}" cy="${y}" r="${r}" fill="${C.paper}" opacity="0.85"/><circle cx="${x + r * 0.45}" cy="${y - r * 0.2}" r="${r * 0.9}" fill="${C.night}" opacity="0.9"/>`;
}
function mountains(seed, base, amp, color, opacity = 1) {
    const r = rng(seed);
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W; x += 20 + r() * 25) {
        const peak = base - amp * (0.3 + r() * 0.7);
        d += ` L${f(x)} ${f(peak)} L${f(x + 10 + r() * 10)} ${f(base - amp * r() * 0.3)}`;
    }
    d += ` L${W} ${base} L${W} ${H} Z`;
    return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}
function pine(x, y, h, color) {
    const w = h * 0.32;
    return `<path d="M${f(x)} ${f(y - h)} L${f(x - w * 0.5)} ${f(y - h * 0.55)} L${f(x - w * 0.25)} ${f(y - h * 0.55)} L${f(x - w)} ${f(y - h * 0.1)} L${f(x - w * 0.15)} ${f(y - h * 0.1)} L${f(x - w * 0.15)} ${f(y)} L${f(x + w * 0.15)} ${f(y)} L${f(x + w * 0.15)} ${f(y - h * 0.1)} L${f(x + w)} ${f(y - h * 0.1)} L${f(x + w * 0.25)} ${f(y - h * 0.55)} L${f(x + w * 0.5)} ${f(y - h * 0.55)} Z" fill="${color}"/>`;
}
function deadTree(x, y, h, color, sw = 3) {
    return `<g stroke="${color}" stroke-width="${sw}" fill="none" stroke-linecap="round"><path d="M${x} ${y} L${x} ${y - h}"/><path d="M${x} ${y - h * 0.55} L${x - h * 0.25} ${y - h * 0.8}"/><path d="M${x} ${y - h * 0.7} L${x + h * 0.22} ${y - h * 0.95}"/><path d="M${x} ${y - h * 0.35} L${x + h * 0.18} ${y - h * 0.5}"/></g>`;
}
function treeline(seed, baseY, count, minH, maxH, color) {
    const r = rng(seed);
    let s = '';
    for (let i = 0; i < count; i++) {
        const x = (i + r() * 0.8) * (W / count);
        const h = minH + r() * (maxH - minH);
        s += r() < 0.18 ? deadTree(x, baseY, h, color, 2 + h / 40) : pine(x, baseY + 2, h, color);
    }
    return s + `<rect y="${baseY}" width="${W}" height="${H - baseY}" fill="${color}"/>`;
}
function mist(y, opacity = 0.25, color = C.paper) {
    return `<rect x="-20" y="${y}" width="${W + 40}" height="14" rx="7" fill="${color}" opacity="${opacity}"/><rect x="60" y="${y + 10}" width="${W - 40}" height="8" rx="4" fill="${color}" opacity="${opacity * 0.6}"/>`;
}
function ground(y, color) {
    return `<path d="M0 ${y} Q${W * 0.3} ${y - 8} ${W * 0.55} ${y + 2} T${W} ${y - 4} L${W} ${H} L0 ${H} Z" fill="${color}"/>`;
}
/** A standing person in a long coat (James) or robe. */
function person(x, y, s = 1, { coat = C.paper, skin = '#c9a98a', hair = '#c9b27a', robe = false, sword = false } = {}) {
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})">
<path d="M${k(-9)} 0 L${k(-12)} ${k(-38)} Q0 ${k(-46)} ${k(12)} ${k(-38)} L${k(9)} 0 Z" fill="${coat}"/>
${robe ? `<path d="M${k(-12)} ${k(-38)} L${k(-16)} ${k(-20)} L${k(-7)} ${k(-30)} Z M${k(12)} ${k(-38)} L${k(16)} ${k(-20)} L${k(7)} ${k(-30)} Z" fill="${coat}"/>` : `<path d="M${k(-2)} ${k(-40)} L0 ${k(-4)} L${k(2)} ${k(-40)} Z" fill="${C.ink}" opacity="0.35"/>`}
<circle cx="0" cy="${k(-46)}" r="${k(6.5)}" fill="${skin}"/>
<path d="M${k(-6.5)} ${k(-47)} Q0 ${k(-56)} ${k(6.5)} ${k(-47)} Q${k(4)} ${k(-51)} 0 ${k(-50)} Q${k(-4)} ${k(-51)} ${k(-6.5)} ${k(-47)} Z" fill="${hair}"/>
${sword ? `<path d="M${k(-8)} ${k(-50)} L${k(10)} ${k(-14)}" stroke="${C.ash}" stroke-width="${k(1.6)}"/>` : ''}
</g>`;
}
function cat(x, y, s = 1, color = C.bone) {
    const k = (n) => f(n * s);
    return `<g transform="translate(${x} ${y})" fill="${color}"><ellipse cx="0" cy="${k(-6)}" rx="${k(10)}" ry="${k(6)}"/><circle cx="${k(9)}" cy="${k(-13)}" r="${k(5)}"/><path d="M${k(5.5)} ${k(-16)} L${k(6.5)} ${k(-22)} L${k(9)} ${k(-17)} Z M${k(9.5)} ${k(-17)} L${k(12.5)} ${k(-22)} L${k(13)} ${k(-15)} Z"/><path d="M${k(-9)} ${k(-6)} Q${k(-20)} ${k(-8)} ${k(-17)} ${k(-20)}" stroke="${color}" stroke-width="${k(2.6)}" fill="none" stroke-linecap="round"/><circle cx="${k(11)}" cy="${k(-13.5)}" r="${k(0.9)}" fill="#e2c13a"/></g>`;
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
    return `<g transform="translate(${x} ${y})"><circle r="${k(60)}" fill="${C.ember}" opacity="0.10"/><circle r="${k(28)}" fill="${C.ember}" opacity="0.16"/><path d="M${k(-10)} 0 Q${k(-12)} ${k(-14)} 0 ${k(-30)} Q${k(4)} ${k(-16)} ${k(10)} ${k(-20)} Q${k(14)} ${k(-8)} ${k(10)} 0 Z" fill="${C.ember}"/><path d="M${k(-4)} 0 Q${k(-4)} ${k(-10)} ${k(2)} ${k(-18)} Q${k(6)} ${k(-8)} ${k(5)} 0 Z" fill="#f1c26a"/><path d="M${k(-16)} ${k(3)} L${k(16)} ${k(-1)} M${k(-14)} ${k(-1)} L${k(14)} ${k(4)}" stroke="${C.ink}" stroke-width="${k(3)}"/></g>`;
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
const grain = '<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0"/></filter><rect width="400" height="250" filter="url(#gr)"/>';
const vignette = '<defs><radialGradient id="vg" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient></defs><rect width="400" height="250" fill="url(#vg)"/>';

const JAMES = { coat: C.bone, hair: '#c9b27a' };
const MEI = { coat: '#6b4f3a', hair: C.ink, skin: '#c99f7f' };
const SECT = { coat: C.crimson, hair: C.ink, skin: '#c9a184', robe: true };

const SCENES = {
    forest_dawn: () => sky('#3b2c38', '#9c5a4a') + sun(300, 95, 18) + mountains(3, 140, 60, C.dusk, 0.8) + mist(128, 0.18) + treeline(7, 175, 14, 60, 120, C.moss) + mist(170, 0.12) + treeline(11, 215, 10, 70, 150, C.ink) + cat(170, 232, 1.1) + person(200, 236, 1, JAMES),
    yuki_close: () => sky('#2a3330', '#46544c') + `<circle cx="200" cy="140" r="110" fill="${C.jade}" opacity="0.10"/>` + cat(205, 205, 5.2) + shards(4, 200, 140, 18, 150, C.paper),
    omnitool: () => sky('#1e2a2a', '#2f3d38') + treeline(5, 230, 9, 80, 170, C.ink) + `<g transform="translate(200 128)"><rect x="-120" y="-70" width="240" height="140" rx="14" fill="${C.jade}" opacity="0.10" stroke="${C.jade}" stroke-opacity="0.6"/><path d="M-100 30 Q-60 -40 -20 10 T60 -10 T100 -40" stroke="${C.jade}" stroke-width="2.5" fill="none"/><circle cx="-60" cy="-35" r="3" fill="${C.ember}"/><circle cx="-10" cy="-30" r="3" fill="${C.ember}"/><circle cx="40" cy="-45" r="3" fill="${C.ember}"/><circle cx="85" cy="20" r="3" fill="${C.ember}"/><path d="M-100 52 L100 52" stroke="${C.jade}" stroke-opacity="0.5"/></g>`,
    clearing: () => sky('#4a3f48', '#9d7b66') + sun(80, 70, 12, C.crimson, 0.25) + treeline(13, 190, 16, 50, 110, C.moss) + ground(195, '#5d6056') + `<g fill="${C.ash}"><ellipse cx="120" cy="215" rx="22" ry="9"/><ellipse cx="300" cy="225" rx="30" ry="11"/><ellipse cx="250" cy="206" rx="12" ry="6"/></g>` + person(205, 228, 0.9, JAMES) + cat(225, 230, 0.8),
    bone_needle: () => sky('#26302c', '#3a4741') + `<g transform="translate(200 150)"><path d="M-90 60 Q-40 10 0 0 Q30 -6 60 -20" stroke="#c9a98a" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M10 -14 L150 -78" stroke="${C.bone}" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="-78" r="18" fill="${C.bone}" opacity="0.15"/></g>` + shards(9, 300, 80, 10, 40),
    meditation: () => sky('#1f2a33', '#3c4950') + `<circle cx="200" cy="140" r="90" fill="${C.jade}" opacity="0.12"/><circle cx="200" cy="140" r="60" fill="${C.jade}" opacity="0.12"/>` + mountains(21, 200, 40, C.ink2) + `<g transform="translate(200 205)"><path d="M-40 0 Q-30 -20 0 -18 Q30 -20 40 0 Z" fill="${C.bone}"/><path d="M-14 -18 L-16 -52 Q0 -60 16 -52 L14 -18 Z" fill="${C.bone}"/><circle cy="-62" r="8" fill="#c9a98a"/></g>` + shards(31, 200, 120, 24, 120, C.ember),
    stream: () => sky('#3c3a46', '#8a6f63') + mountains(17, 120, 40, C.dusk, 0.7) + treeline(19, 160, 14, 50, 100, C.moss) + `<path d="M150 160 Q120 190 190 205 T150 250 L250 250 Q210 220 260 200 T230 160 Z" fill="#2d3c44"/><path d="M175 175 Q160 190 200 200" stroke="${C.paper}" stroke-opacity="0.4" fill="none"/>` + treeline(23, 230, 6, 60, 130, C.ink) + cat(300, 238, 0.9),
    forage: () => sky('#384236', '#6f7a5e') + treeline(27, 200, 10, 80, 140, C.moss) + ground(205, C.ink2) + `<path d="M60 215 L200 205" stroke="#5a4a3a" stroke-width="14" stroke-linecap="round"/>` + `<g fill="#c8d6b9"><path d="M90 207 Q105 196 120 207 Z"/><path d="M128 205 Q146 192 162 205 Z"/><path d="M168 204 Q180 196 192 204 Z"/></g>` + `<g fill="${C.crimson}">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${290 + (i % 4) * 9}" cy="${190 + Math.floor(i / 4) * 10}" r="4"/>`).join('')}</g><path d="M280 220 L300 180 L320 220 M300 200 L330 180" stroke="${C.moss}" stroke-width="3" fill="none"/>` + person(240, 232, 0.8, JAMES),
    hunt: () => sky('#433e3a', '#7d6b55') + treeline(29, 175, 12, 40, 90, C.moss) + `<g stroke="#6b7a55" stroke-width="2">${Array.from({ length: 40 }, (_, i) => `<path d="M${i * 10} 250 L${i * 10 + 4} ${200 - (i % 5) * 6}"/>`).join('')}</g>` + `<g transform="translate(250 212)"><ellipse rx="16" ry="9" fill="${C.ash}"/><path d="M-12 -6 L-6 -14 L0 -7 L6 -15 L12 -6" fill="${C.jade}" opacity="0.8"/><path d="M14 -4 L18 -18 M18 -4 L23 -16" stroke="${C.ash}" stroke-width="3"/></g>` + cat(120, 236, 1.2) + `<path d="M60 120 L230 205" stroke="${C.bone}" stroke-width="2" stroke-dasharray="4 6"/>`,
    camp: () => sky('#24203a', '#6a3f4c') + mountains(33, 150, 50, '#2e2a3d') + treeline(35, 190, 12, 60, 120, C.ink2) + ground(210, C.ink) + fire(200, 222, 1) + person(160, 228, 0.85, JAMES) + cat(240, 230, 0.8) + `<g stroke="${C.bone}" stroke-width="2.5" stroke-linecap="round">${[60, 100, 300, 340].map((x) => `<path d="M${x} 236 L${x + (x < 200 ? -8 : 8)} 214"/>`).join('')}</g>`,
    forest_night: () => sky(C.night, '#1f2a35') + moon(320, 60, 14) + treeline(37, 190, 14, 70, 140, '#1a232a') + treeline(41, 230, 9, 80, 170, '#10161b') + fire(200, 236, 0.6),
    jackals: () => sky(C.night, '#251e2a') + treeline(43, 200, 12, 70, 140, '#141b20') + ground(215, '#10161b') + beast(90, 228, 1.4) + beast(320, 232, -1.4) + fire(200, 232, 0.55) + person(200, 234, 0.85, JAMES) + cat(226, 236, 0.7),
    jackals_dead: () => sky('#1b2128', '#3b2d33') + ground(205, '#141b20') + `<g transform="translate(140 222) rotate(160)">${beast(0, 0, 1.3, '#5b5a55', '#333')}</g>` + `<g transform="translate(280 228) rotate(190)">${beast(0, 0, 1.2, '#5b5a55', '#333')}</g>` + shards(47, 200, 214, 16, 110) + cat(210, 236, 0.9),
    herb_girl: () => sky('#4c4040', '#a77a5c') + sun(330, 60, 14) + mountains(51, 140, 40, C.dusk, 0.6) + ground(200, '#4f5a46') + `<path d="M40 200 Q80 150 130 200 Z" fill="#6a6a60"/>` + person(90, 228, 0.9, MEI) + person(220, 230, 1, SECT) + person(270, 232, 1.15, { coat: '#4a3a32', hair: C.ink, skin: '#b88d6c' }) + lotus(220, 180, 0.6) + `<g fill="${C.jade}" opacity="0.8">${[0, 1, 2, 3].map((i) => `<path d="M${120 + i * 8} 232 Q${123 + i * 8} 222 ${126 + i * 8} 232 Z"/>`).join('')}</g>`,
    gao_down: () => sky('#4c4040', '#a77a5c') + ground(195, '#4f5a46') + `<g transform="translate(230 222) rotate(-90)">${person(0, 0, 0.9, SECT)}</g>` + `<path d="M232 200 L240 240" stroke="${C.bone}" stroke-width="3"/>` + person(140, 228, 1, JAMES) + cat(166, 230, 0.8) + person(80, 228, 0.9, MEI),
    mei_lin: () => sky('#56483e', '#c48e66') + `<circle cx="200" cy="120" r="95" fill="${C.ember}" opacity="0.12"/>` + `<g transform="translate(200 250)"><path d="M-80 0 Q-70 -70 0 -80 Q70 -70 80 0 Z" fill="#6b4f3a"/><path d="M-30 -80 Q0 -60 30 -80 L22 -98 L-22 -98 Z" fill="#e6dccb"/><ellipse cx="0" cy="-130" rx="30" ry="38" fill="#c99f7f"/><path d="M-34 -128 Q-36 -178 0 -176 Q36 -178 34 -128 Q30 -150 0 -156 Q-28 -150 -34 -128 Z" fill="${C.ink}"/><path d="M-34 -130 Q-44 -80 -30 -70 L-26 -120 Z M34 -130 Q44 -80 30 -70 L26 -120 Z" fill="${C.ink}"/><path d="M-14 -136 Q-9 -139 -4 -136 M4 -136 Q9 -139 14 -136" stroke="${C.ink}" stroke-width="2.2" fill="none"/><path d="M-6 -112 Q0 -109 6 -112" stroke="#8a4a40" stroke-width="2" fill="none"/></g>` + `<g fill="${C.jade}" opacity="0.85"><path d="M300 250 Q305 205 315 190 Q312 215 318 250 Z"/><path d="M318 250 Q325 215 340 205 Q330 228 332 250 Z"/></g>`,
    ridge: () => sky('#2b2436', '#b0624a') + sun(70, 120, 16, C.ember, 0.3) + mountains(53, 160, 70, '#3c3048', 0.8) + `<g transform="translate(270 168)"><path d="M-18 0 L-10 -120 L-26 -150 M-10 -120 L10 -160 L4 -190 M10 -160 L30 -175 M-6 -60 L-40 -90 M2 -80 L36 -110" stroke="#2a2230" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-30 0 L-14 -40 L14 -40 L30 0 Z" fill="#2a2230"/><circle cx="0" cy="-90" r="70" fill="${C.jade}" opacity="0.08"/></g>` + treeline(57, 190, 18, 25, 55, C.ink2) + ground(225, C.ink) + person(110, 238, 0.8, JAMES) + cat(128, 226, 0.6),
    village: () => sky('#4a4248', '#9a8270') + mountains(61, 130, 40, C.dusk, 0.6) + treeline(63, 165, 16, 30, 70, C.moss) + ground(195, '#5a5650') + hut(80, 205, 60, '#6d6a62', C.ink2, true) + hut(170, 200, 50, '#77736a', C.ink2) + hut(330, 208, 66, '#6d6a62', C.ink2, true) + `<path d="M250 205 L250 120" stroke="#3a2a22" stroke-width="5"/><path d="M250 125 L285 128 L282 165 L250 160 Z M250 168 L280 170 L278 200 L250 196 Z" fill="${C.crimson}"/>` + lotus(266, 152, 0.5, '#e8c8b8') + person(210, 236, 0.75, JAMES) + cat(226, 238, 0.55),
    elder: () => sky('#2a2420', '#4d3d30') + `<rect x="0" y="170" width="400" height="80" fill="#3a2e24"/><circle cx="200" cy="120" r="110" fill="${C.ember}" opacity="0.07"/>` + `<g transform="translate(260 225)"><path d="M-40 0 Q-36 -50 0 -56 Q36 -50 40 0 Z" fill="#5a5048"/><circle cx="0" cy="-70" r="16" fill="#b8916f"/><path d="M-14 -62 Q0 -40 14 -62 Q8 -50 0 -48 Q-8 -50 -14 -62 Z" fill="${C.paper}"/></g>` + `<rect x="150" y="200" width="70" height="8" fill="#2a2018"/><path d="M175 200 Q175 188 183 188 L188 188 Q195 188 195 200 Z" fill="${C.jade}" opacity="0.8"/><path d="M182 184 Q180 176 186 170" stroke="${C.paper}" stroke-opacity="0.4" fill="none"/>` + person(110, 236, 0.9, JAMES),
    healer: () => sky('#2a2622', '#4a3e34') + `<rect y="190" width="400" height="60" fill="#3a3028"/>` + `<g transform="translate(220 205)"><rect x="-70" y="0" width="140" height="18" fill="#5a4a3a"/><ellipse cx="-10" cy="-4" rx="50" ry="10" fill="#c9a98a"/><circle cx="-56" cy="-8" r="10" fill="#c9a98a"/></g>` + person(140, 232, 0.9, JAMES) + `<path d="M180 190 L196 200" stroke="${C.bone}" stroke-width="2"/>` + `<g fill="#c8d6b9"><path d="M260 185 Q272 176 284 185 Z"/></g>` + `<circle cx="220" cy="190" r="70" fill="${C.jade}" opacity="0.07"/>`,
    boar: () => sky('#3a3a33', '#6a6450') + treeline(67, 180, 10, 60, 130, C.moss) + ground(200, C.ink2) + boarShape(250, 230, 1.5) + person(100, 232, 0.85, JAMES) + shards(71, 180, 200, 10, 40),
    dinner: () => sky('#2a1f1c', '#3a2a22') + `<rect y="180" width="400" height="70" fill="#2e221c"/><circle cx="200" cy="160" r="120" fill="${C.ember}" opacity="0.09"/>` + `<rect x="120" y="195" width="160" height="10" fill="#5a4030"/><path d="M196 195 L196 182 Q200 170 204 182 L204 195 Z" fill="#c9a98a"/><circle cx="200" cy="172" r="6" fill="#f1c26a"/><circle cx="200" cy="172" r="40" fill="#f1c26a" opacity="0.12"/>` + person(140, 238, 0.9, JAMES) + person(262, 238, 0.85, MEI) + cat(340, 214, 0.7),
    romance: () => sky('#24171a', '#3a2226') + `<circle cx="200" cy="130" r="150" fill="${C.ember}" opacity="0.08"/><path d="M0 0 Q60 120 30 250 L0 250 Z M400 0 Q340 120 370 250 L400 250 Z" fill="#5a2a30" opacity="0.8"/><path d="M40 0 Q90 130 70 250 L30 250 Q60 120 0 0 Z" fill="#7a3a40" opacity="0.5"/>` + `<g transform="translate(200 230)"><path d="M-30 0 L-36 -56 Q-22 -66 -6 -58 L-4 0 Z" fill="${C.bone}" opacity="0.9"/><path d="M30 0 L34 -54 Q20 -64 6 -58 L4 0 Z" fill="#6b4f3a"/><circle cx="-14" cy="-72" r="11" fill="#c9a98a"/><circle cx="12" cy="-70" r="10.5" fill="#c99f7f"/><path d="M2 -78 Q14 -90 26 -76 Q24 -60 22 -48 L18 -74 Z" fill="${C.ink}"/></g>` + `<g fill="#c9b27a" opacity="0.5">${Array.from({ length: 12 }, (_, i) => `<path d="M${110 + i * 16} 240 L${116 + i * 16} 226"/>`).join('')}</g>`,
    collectors: () => sky('#4a3036', '#b06a4e') + sun(200, 70, 20) + ground(195, '#4d4842') + `<path d="M330 205 L330 110" stroke="#3a2a22" stroke-width="5"/><path d="M330 114 L365 117 L362 160 L330 154 Z" fill="${C.crimson}"/>` + person(130, 230, 1.15, { ...SECT, coat: '#6e1c25', sword: true }) + person(180, 226, 0.95, SECT) + person(84, 228, 0.95, SECT) + person(52, 230, 0.9, SECT) + person(270, 236, 1, JAMES) + cat(292, 214, 0.6) + lotus(130, 186, 0.7, '#e8c8b8'),
    collectors_down: () => sky('#3a2a30', '#8a5a4a') + ground(195, '#4d4842') + shards(73, 200, 210, 40, 190) + `<g fill="${C.crimson}" opacity="0.7">${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${120 + i * 33}" cy="${218 + (i % 2) * 6}" r="2.5"/>`).join('')}</g>` + `<g transform="translate(150 236)">${person(0, 0, 0.75, { ...SECT, coat: '#6e1c25' })}</g>` + person(240, 236, 1, JAMES) + `<path d="M228 190 L180 205" stroke="${C.bone}" stroke-width="3" stroke-linecap="round"/>`,
    hairpin: () => sky('#1f2420', '#33403a') + `<circle cx="200" cy="125" r="90" fill="${C.bone}" opacity="0.06"/><g transform="translate(200 125) rotate(-28)"><path d="M-110 0 L100 0" stroke="${C.bone}" stroke-width="6" stroke-linecap="round"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-80 + i * 20} 0 Q${-70 + i * 20} -16 ${-60 + i * 20} 0 Q${-70 + i * 20} 16 ${-80 + i * 20} 0 Z" fill="${C.bone}" opacity="${0.6 + (i % 3) * 0.12}"/>`).join('')}<circle cx="100" cy="0" r="9" fill="${C.bone}"/></g>`,
};

/** SVG markup for a scene's art key (unknown keys get a quiet forest). */
export function sceneArt(key) {
    const body = (SCENES[key] || SCENES.forest_dawn)();
    const id = String(key || 'x').replace(/\W/g, '');
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${id.replace(/_/g, ' ')}" preserveAspectRatio="xMidYMid slice">${body}${vignette}${grain}</svg>`
        .replace(/id="(sk|vg|gr)"/g, `id="$1-${id}"`).replace(/url\(#(sk|vg|gr)\)/g, `url(#$1-${id})`);
}
export const ART_KEYS = Object.keys(SCENES);
