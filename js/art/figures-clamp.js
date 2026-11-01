/**
 * Full-body figures in the CLAMP-like style: about nine heads tall, slender, sharp-chinned, with long
 * rope hair, wide hanging sleeves, and robes patterned with cloud swirls and crescents.
 * Palette: black, white, two greys, red. Unit space: feet at 0, crown at about -83.
 */
const f = (n) => Math.round(n * 100) / 100;
export const K = '#111010';
export const W = '#fbfaf7';
export const RED = '#a02c2c';
export const DARKRED = '#7a1d24';
export const G1 = '#8c8781'; // mid grey: plain robes, trousers
export const G2 = '#c8c3bb'; // light grey: patterns on black
export const G3 = '#55514d'; // dark grey: tunics
export const SMOKE = '#a7a29a';
export const GOLD = '#e2bd45';
/** Colours the CLAMP flattening pass must leave alone. */
export const KEEP = [G1, G2, G3, SMOKE, DARKRED, GOLD, '#e2c13a', '#e7c34a', '#a37a14'];

/** A small cloud swirl: a spiral with a tail. */
export function swirl(x, y, r, color = G2, w = 0.5) {
    return `<path d="M${f(x + r)} ${f(y)} A${f(r)} ${f(r)} 0 1 0 ${f(x)} ${f(y + r)} A${f(r * 0.55)} ${f(r * 0.55)} 0 1 0 ${f(x + r * 0.25)} ${f(y + r * 0.2)} M${f(x + r)} ${f(y)} C${f(x + r * 2)} ${f(y + r * 0.6)} ${f(x + r * 2.6)} ${f(y - r * 0.2)} ${f(x + r * 3.4)} ${f(y + r * 0.3)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
}
/** A crescent moon. */
export function crescent(cx, cy, r, color = RED) {
    return `<path d="M${f(cx)} ${f(cy - r)} A${f(r)} ${f(r)} 0 1 0 ${f(cx)} ${f(cy + r)} A${f(r * 0.78)} ${f(r)} 0 1 1 ${f(cx)} ${f(cy - r)} Z" fill="${color}" stroke="none"/>`;
}

export function clampPerson(x, y, s = 1, { style = 'plain', sword = false, coat = '' } = {}) {
    const k = s * 0.95;
    const w = (n) => f(n / Math.sqrt(Math.max(1, k)));
    const line = (n = 0.5) => `stroke="${K}" stroke-width="${w(n)}" stroke-linejoin="round" stroke-linecap="round"`;
    const robed = style === 'mei' || style === 'sect' || style === 'plain';
    const robeFill = style === 'mei' ? K : style === 'sect' ? (coat.toLowerCase() === '#6e1c25' ? DARKRED : RED) : G1;
    let back = '';
    let body = '';
    let front = '';

    // ---- hair behind the body ----
    if (style === 'mei') {
        back += `<path d="M-3.6 -79 C-5 -70 -6.6 -56 -8 -40 L8 -40 C6.6 -56 5 -70 3.6 -79 Z" fill="${K}" stroke="none"/>`;
        for (let i = 0; i < 11; i++) {
            const x0 = -5 + i;
            const ex = x0 * 3.2 - 9 + (i % 3) * 1.6;
            const ey = -4 - (i % 4) * 6;
            back += `<path d="M${x0} -74 C${f(x0 - 1)} -56 ${f(ex + 3)} -36 ${f(ex)} ${ey}" stroke="${K}" stroke-width="${w(i % 2 ? 1.1 : 1.6)}" fill="none" stroke-linecap="round"/>`;
        }
        back += `<path d="M-2 -70 C-3 -54 -6 -40 -9 -22 M2.4 -70 C3 -56 2 -42 1 -26" stroke="${W}" stroke-width="${w(0.3)}" fill="none"/>`;
    }
    if (style === 'sect') back += `<path d="M0.6 -82 C-1 -74 -2.6 -64 -3.4 -50 C-3.6 -46 -2.4 -44 -2.6 -40" stroke="${K}" stroke-width="${w(2.2)}" fill="none" stroke-linecap="round"/>`;
    if (sword) back += `<path d="M-8.4 -86 L7.6 -52" stroke="${K}" stroke-width="${w(1.1)}" stroke-linecap="round"/><path d="M-8.4 -86 L-6.6 -82" stroke="${RED}" stroke-width="${w(1.4)}"/><path d="M-6.8 -80 L-4.4 -81.4" stroke="${K}" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;

    // ---- legs (coat and tunic styles) ----
    if (style === 'james' || style === 'man') {
        const leg = style === 'james' ? K : G1;
        body += `<path d="M-3.4 -46 L-3 -1.2 L-0.9 -1.2 L-0.4 -46 Z M3.4 -46 L3.2 -1.2 L1.1 -1.2 L0.4 -46 Z" fill="${leg}" ${line(0.45)}/>`;
        body += `<path d="M-3.6 0 Q-3.8 -1.4 -1.8 -1.4 L-0.6 -1.2 L-0.6 0 Z M3.8 0 Q4 -1.4 2 -1.4 L0.8 -1.2 L0.8 0 Z" fill="${K}" stroke="none"/>`;
        if (style === 'man') body += `<path d="M-3.2 -12 L-0.8 -11 M-3.2 -9 L-0.8 -8 M-3.2 -6 L-0.8 -5 M1 -11 L3.4 -12 M1 -8 L3.4 -9 M1 -5 L3.4 -6" stroke="${K}" stroke-width="${w(0.35)}"/>`;
    }

    // ---- the robe / coat ----
    if (robed) {
        const robe = `M-6.4 -67 C-6.4 -60 -5.6 -55 -5.4 -51 C-7 -37 -10 -17 -13 -1.2 C-15 -0.4 -18 0.2 -20.6 -0.6 C-13 1.6 4 1.6 12.4 0 C9.4 -17 6.8 -37 5.4 -51 C5.6 -55 6.4 -60 6.4 -67 Q0 -69 -6.4 -67 Z`;
        body += `<path d="${robe}" fill="${robeFill}" ${line(0.55)}/>`;
        body += `<path d="M-2.4 -50 C-4 -34 -6.6 -16 -9 -1 M2 -50 C3 -34 4.6 -16 6.6 -0.4 M-0.2 -50 L-0.6 0.4" stroke="${robeFill === K ? G3 : K}" stroke-width="${w(0.35)}" fill="none" opacity="0.6"/>`;
        if (style === 'mei') {
            body += swirl(-6, -30, 1.8) + swirl(2.4, -20, 2.2) + swirl(-9, -9, 1.6) + swirl(3.6, -40, 1.5) + swirl(-3, -42, 1.3) + crescent(4.6, -9, 3.6);
        }
        if (style === 'plain') body += swirl(-5, -24, 1.6, W, 0.35) + swirl(3, -12, 1.8, W, 0.35);
        // crossed collar, white inner layer, red under-collar for Mei
        body += `<path d="M-2.8 -68.4 L0.9 -55.4 L2.8 -68.4 L1.4 -68.6 L0.4 -59 L-1.4 -68.6 Z" fill="${W}" ${line(0.4)}/>`;
        if (style === 'mei') body += `<path d="M-3.4 -68.2 L0.6 -54.6" stroke="${RED}" stroke-width="${w(0.7)}"/>`;
        // sash / obi
        const sash = style === 'mei' ? RED : style === 'sect' ? K : G3;
        body += `<path d="M-5.7 -56 Q0 -57 5.7 -56 L5.4 -49.6 Q0 -50.4 -5.4 -49.6 Z" fill="${sash}" ${line(0.45)}/>`;
        if (style === 'mei') {
            body += `<path d="M0 -55.6 L1.8 -52.8 L0 -50 L-1.8 -52.8 Z" fill="${W}" ${line(0.35)}/>`;
            body += `<path d="M-1 -50 C-1.4 -44 -0.6 -38 -1.4 -30 M0 -50 C0 -44 0.6 -38 0.2 -28 M1 -50 C1.6 -44 1.6 -38 1.8 -32" stroke="${RED}" stroke-width="${w(0.55)}" fill="none" stroke-linecap="round"/>`;
        }
        if (style === 'sect') body += `<path d="M1 -50 C1.6 -42 1 -36 1.6 -30 M2.2 -50 C3 -44 3 -38 3.6 -34" stroke="${K}" stroke-width="${w(0.6)}" fill="none"/>`;
        // wide hanging sleeves with long-fingered hands
        for (const d of [-1, 1]) {
            const X = (n) => f(d * n);
            const sl = `M${X(6.2)} -66.4 C${X(10)} -63 ${X(13)} -58 ${X(14.4)} -52 L${X(16)} -30 Q${X(12.6)} -27.4 ${X(9.4)} -30 L${X(8.6)} -44 C${X(8)} -50 ${X(7)} -56 ${X(6)} -60 Z`;
            body += `<path d="${sl}" fill="${robeFill}" ${line(0.5)}/>`;
            body += `<path d="M${X(16)} -30 Q${X(12.6)} -27.4 ${X(9.4)} -30" stroke="${style === 'sect' ? K : W}" stroke-width="${w(0.6)}" fill="none"/>`;
            if (style === 'mei') body += swirl(d * 12 - 1.5, -40, 1.4);
            body += `<path d="M${X(10.6)} -30.6 C${X(10.8)} -27.6 ${X(10.4)} -24.6 ${X(9.8)} -22.8 C${X(9.4)} -24.6 ${X(9)} -27.4 ${X(9)} -30.4 Z" fill="${W}" ${line(0.35)}/>`;
        }
    } else if (style === 'james') {
        // black high-collared suit under a long open white coat
        body += `<path d="M-5.6 -67 L-5 -44 L5 -44 L5.6 -67 Q0 -69 -5.6 -67 Z" fill="${K}" ${line(0.45)}/>`;
        body += `<path d="M-6.8 -67.6 C-7.4 -56 -7.6 -40 -8.8 -15 L-2.2 -14.6 L-1.4 -48 L-2.6 -66.4 Z" fill="${W}" ${line(0.5)}/><path d="M6.8 -67.6 C7.4 -56 7.6 -40 8.8 -15 L2.2 -14.6 L1.4 -48 L2.6 -66.4 Z" fill="${W}" ${line(0.5)}/>`;
        body += `<path d="M-2.6 -66.4 L-4.4 -60 L-1.8 -58 M2.6 -66.4 L4.4 -60 L1.8 -58 M-5.6 -40 C-6 -30 -6.6 -22 -7.4 -16 M5.6 -38 C6 -30 6.6 -22 7.4 -16" stroke="${K}" stroke-width="${w(0.35)}" fill="none"/>`;
        for (const d of [-1, 1]) {
            const X = (n) => f(d * n);
            body += `<path d="M${X(6.6)} -67 C${X(8.6)} -60 ${X(9)} -50 ${X(9.2)} -38 L${X(7)} -38 C${X(6.8)} -48 ${X(6.4)} -56 ${X(5.6)} -62 Z" fill="${W}" ${line(0.45)}/>`;
            body += `<path d="M${X(9)} -38 C${X(9.2)} -35 ${X(8.8)} -32 ${X(8.2)} -30.6 C${X(7.6)} -32 ${X(7.2)} -35 ${X(7.2)} -38 Z" fill="${W}" ${line(0.35)}/>`;
        }
        body += `<path d="M-1.6 -68.8 L-1.6 -67 L1.6 -67 L1.6 -68.8" fill="${K}" ${line(0.35)}/>`;
    } else {
        // tunic, belt
        body += `<path d="M-7 -67 C-7.6 -58 -7.2 -48 -8 -40 Q0 -38.6 8 -40 C7.2 -48 7.6 -58 7 -67 Q0 -69 -7 -67 Z" fill="${G3}" ${line(0.5)}/>`;
        body += `<path d="M-2.6 -68.4 L2.8 -55 M2.6 -68.4 L0.4 -64" stroke="${K}" stroke-width="${w(0.45)}"/><path d="M-7.4 -51 Q0 -50 7.4 -51 L7.3 -48.8 Q0 -47.8 -7.3 -48.8 Z" fill="${K}" stroke="none"/>`;
        for (const d of [-1, 1]) {
            const X = (n) => f(d * n);
            body += `<path d="M${X(7)} -67 C${X(9)} -60 ${X(9.6)} -50 ${X(9.8)} -40 L${X(7.4)} -40 C${X(7.2)} -50 ${X(6.8)} -56 ${X(6)} -62 Z" fill="${G3}" ${line(0.45)}/><path d="M${X(9.6)} -40 C${X(9.8)} -37 ${X(9.4)} -34.4 ${X(8.8)} -33 C${X(8.2)} -34.4 ${X(7.8)} -37 ${X(7.6)} -40 Z" fill="${W}" ${line(0.35)}/>`;
        }
    }

    // ---- neck, a long narrow face with a sharp chin ----
    front += `<path d="M-1.1 -71.6 L-1.2 -67.4 L1.2 -67.4 L1.1 -71.6 Z" fill="${W}" ${line(0.4)}/>`;
    front += `<path d="M-3 -76.8 C-3.2 -79.8 -1.8 -81.4 0 -81.4 C1.8 -81.4 3.2 -79.8 3 -76.8 C2.9 -74.6 1.7 -72.6 0 -71.2 C-1.7 -72.6 -2.9 -74.6 -3 -76.8 Z" fill="${W}" ${line(0.45)}/>`;
    // narrow slanted eyes (a thick lash stroke each), a hint of nose, a mouth
    front += `<path d="M-2.5 -76.9 Q-1.6 -77.4 -0.6 -76.7 M0.6 -76.7 Q1.6 -77.4 2.5 -76.9" stroke="${K}" stroke-width="${w(0.6)}" fill="none" stroke-linecap="round"/>`;
    if (style === 'mei') front += `<circle cx="-1.5" cy="-76.6" r="0.32" fill="${DARKRED}" stroke="none"/><circle cx="1.5" cy="-76.6" r="0.32" fill="${DARKRED}" stroke="none"/><path d="M-0.6 -73.4 Q0 -73.1 0.6 -73.4" stroke="${RED}" stroke-width="${w(0.5)}" fill="none" stroke-linecap="round"/>`;
    else front += `<path d="M-0.5 -73.4 L0.5 -73.4" stroke="${K}" stroke-width="${w(0.3)}"/>`;
    front += `<path d="M0.2 -75.4 L0.4 -74.6" stroke="${K}" stroke-width="${w(0.25)}"/>`;

    // ---- hair in front ----
    if (style === 'mei') {
        front += `<path d="M-3.5 -76.4 C-3.8 -81 -1.9 -83 0 -83 C1.9 -83 3.8 -81 3.5 -76.4 L3.5 -77.8 L-3.5 -77.8 Z" fill="${K}" stroke="none"/>`;
        front += `<path d="M-3.5 -78 L-3.4 -66 L-2.4 -66 L-2.5 -77.6 Z M3.5 -78 L3.4 -66 L2.4 -66 L2.5 -77.6 Z" fill="${K}" stroke="none"/>`;
        // long locks falling over the shoulders and down the robe, swaying left
        front += [[-3, -1.6, -26, 1.3], [-2.4, -3.4, -34, 0.9], [3, 0.2, -30, 1.3], [2.4, 1.8, -40, 0.9]].map(([x0, sway, ey, sw]) => `<path d="M${x0} -70 C${f(x0 + sway * 0.4)} -60 ${f(x0 + sway * 2)} -50 ${f(x0 + sway * 3.6)} ${ey}" stroke="${K}" stroke-width="${w(sw)}" fill="none" stroke-linecap="round"/>`).join('');
        front += `<path d="M-3.2 -70 C-3.6 -60 -5 -48 -7.6 -26" stroke="${W}" stroke-width="${w(0.2)}" fill="none"/>`;
        front += `<path d="M-2.4 -81.6 Q0 -82.6 2.4 -81.6" stroke="${W}" stroke-width="${w(0.35)}" fill="none" stroke-dasharray="${w(0.8)} ${w(0.5)}"/>`;
        // a red knot with tassels on the left, a pin with beads on the right
        front += `<path d="M-4.6 -81.2 L-3.6 -80 L-4.6 -78.8 L-5.6 -80 Z" fill="${RED}" stroke="none"/><path d="M-4.8 -78.8 L-5.2 -70 M-4.4 -78.8 L-4.4 -69 M-4 -78.8 L-3.8 -71" stroke="${RED}" stroke-width="${w(0.35)}"/>`;
        front += `<path d="M1.6 -82.6 L6.4 -85.6" stroke="${K}" stroke-width="${w(0.5)}"/><circle cx="6.2" cy="-82" r="0.5" fill="${RED}" stroke="none"/><path d="M6 -85.2 L6.2 -82.5" stroke="${K}" stroke-width="${w(0.2)}"/>`;
    } else if (style === 'james') {
        front += `<path d="M-3.4 -76.2 C-4.4 -80.4 -2.6 -83.4 0.4 -83.2 C3.2 -83.2 4.6 -80.6 3.6 -76.2 L3 -78.2 L2.2 -76.8 L1.4 -78.8 L0.4 -77.2 L-0.8 -78.8 L-1.8 -77 L-2.6 -78.6 Z" fill="${K}" stroke="none"/>`;
        front += `<path d="M-3.4 -79.4 l-1.8 1.6 M3.6 -79.8 l1.8 1.2 M-1 -83 l-1 -1.6 M1.6 -83 l1.4 -1.2" stroke="${K}" stroke-width="${w(0.6)}" stroke-linecap="round"/>`;
        front += `<path d="M-2.9 -77.6 h2.1 v1.5 h-2.1 Z M0.8 -77.6 h2.1 v1.5 h-2.1 Z M-0.8 -77 h1.6" stroke="${K}" stroke-width="${w(0.25)}" fill="none"/>`;
    } else if (style === 'sect') {
        front += `<path d="M-3.3 -77 C-3.8 -81 -1.9 -83 0 -83 C1.9 -83 3.8 -81 3.3 -77 C2.6 -79.2 1.6 -80.2 0 -80.4 C-1.6 -80.2 -2.6 -79.2 -3.3 -77 Z" fill="${K}" stroke="none"/>`;
        front += `<path d="M-1.2 -86.4 L1.2 -86.4 L1.5 -83 L-1.5 -83 Z" fill="${RED}" ${line(0.35)}/><path d="M-2.8 -84.6 L2.8 -84.6" stroke="${K}" stroke-width="${w(0.4)}"/>`;
        front += `<path d="M-3.2 -77 L-3 -72.6 M3.2 -77 L3 -72.6" stroke="${K}" stroke-width="${w(0.7)}"/>`;
    } else {
        front += `<path d="M-3.3 -77 C-3.8 -81 -1.9 -83 0 -83 C1.9 -83 3.8 -81 3.3 -77 C2.6 -79.4 1.6 -80.4 0 -80.6 C-1.6 -80.4 -2.6 -79.4 -3.3 -77 Z" fill="${K}" stroke="none"/>`;
        if (style === 'plain') front += `<ellipse cx="0" cy="-84" rx="1.6" ry="1.3" fill="${K}" stroke="none"/>`;
    }
    const shadow = `<ellipse cx="1" cy="0.2" rx="${robed ? 12 : 7}" ry="1" fill="${K}" opacity="0.35" stroke="none"/>`;
    return `<g transform="translate(${x} ${y}) scale(${f(k)})">${shadow}${back}${body}${front}</g>`;
}

/** Yuki at scene size: a sleek white sitting cat with tall ears, gold eyes and a red cord. */
export function clampCat(x, y, s = 1) {
    const k = s * 0.95;
    const w = (n) => f(n / Math.sqrt(Math.max(1, k)));
    const line = (n = 0.5) => `stroke="${K}" stroke-width="${w(n)}" stroke-linejoin="round" stroke-linecap="round"`;
    let c = `<ellipse cx="0" cy="0.3" rx="9" ry="0.9" fill="${K}" opacity="0.35" stroke="none"/>`;
    c += `<path d="M5 -0.8 C12 -0.6 13 -8 9.4 -12.6" stroke="${K}" stroke-width="${w(2.6)}" fill="none" stroke-linecap="round"/><path d="M5 -0.8 C12 -0.6 13 -8 9.4 -12.6" stroke="${W}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    c += `<path d="M-5.6 0 C-7.8 -6 -7.4 -13 -3.8 -17.4 L-3.4 -21 L3.8 -21 L4.2 -17.4 C7.4 -13 7.8 -6 5.6 0 Z" fill="${W}" ${line(0.5)}/>`;
    c += `<path d="M-1.6 -11 L-1.8 0 M1.6 -11 L1.8 0" ${line(0.35)} fill="none"/>`;
    c += `<path d="M-4.4 -26 L-4.8 -33 L-1.2 -28 Z M4.4 -26 L4.8 -33 L1.2 -28 Z" fill="${W}" ${line(0.45)}/><path d="M-3.9 -27.4 L-4.2 -31.4 L-2.2 -28.6 Z M3.9 -27.4 L4.2 -31.4 L2.2 -28.6 Z" fill="${K}" stroke="none"/>`;
    c += `<path d="M-4.6 -24.4 C-4.6 -27.4 -2.4 -28.6 0 -28.6 C2.4 -28.6 4.6 -27.4 4.6 -24.4 C4.6 -22 2.6 -20.2 0 -20 C-2.6 -20.2 -4.6 -22 -4.6 -24.4 Z" fill="${W}" ${line(0.5)}/>`;
    c += `<path d="M-3.4 -24.6 Q-2.2 -25.6 -0.9 -24.8 Q-2.2 -24 -3.4 -24.6 Z M3.4 -24.6 Q2.2 -25.6 0.9 -24.8 Q2.2 -24 3.4 -24.6 Z" fill="${GOLD}" ${line(0.25)}/><path d="M-2.1 -25.3 L-2.1 -24.2 M2.1 -25.3 L2.1 -24.2" stroke="${K}" stroke-width="${w(0.35)}"/>`;
    c += `<path d="M-0.5 -23 L0.5 -23 L0 -22.4 Z" fill="${K}" stroke="none"/><path d="M-1 -21.6 Q0 -21 1 -21.6" ${line(0.25)} fill="none"/>`;
    c += `<path d="M-1.4 -22.6 L-7 -23.6 M-1.4 -22.2 L-6.6 -21.4 M1.4 -22.6 L7 -23.6 M1.4 -22.2 L6.6 -21.4" stroke="${K}" stroke-width="${w(0.15)}"/>`;
    c += `<path d="M-3.6 -20.2 Q0 -18.4 3.6 -20.2" stroke="${RED}" stroke-width="${w(0.8)}" fill="none"/><path d="M0 -19.6 L0.8 -18.6 L0 -17.6 L-0.8 -18.6 Z" fill="${RED}" stroke="none"/>`;
    return `<g transform="translate(${x} ${y}) scale(${f(k)})">${c}</g>`;
}
