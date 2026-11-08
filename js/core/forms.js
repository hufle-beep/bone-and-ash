/**
 * Bonesinger forms (v0.10.4, owner 2026-11-06): what James can sing, by Convergence Use rank (rank = 10·(T−1) + L;
 * T1 L1 = 1 … T10 L10 = 100). Four lines that grow side by side. What he cannot form yet is hidden in fights and story
 * choices. (Until v0.11.45 a switch kept every form open in the dice rules of Story Mode; both are gone.)
 */

export const R = (tier, level) => 10 * (tier - 1) + level;
export const FORM_LINES = {
    ranged: { label: 'Ranged', forms: [
        { id: 'needle', at: R(1, 1), name: 'needle' },
        { id: 'dart', at: R(1, 5), name: 'dart' },
        { id: 'lance', at: R(3, 1), name: 'thrown lance' },
        { id: 'volley', at: R(4, 1), name: 'volley (several pieces)' },
        { id: 'storm', at: R(5, 1), name: 'storm (many pieces)' },
    ] },
    melee: { label: 'Melee', forms: [
        { id: 'fragile_knife', at: R(1, 1), name: 'fragile knife (breaks every swing)' },
        { id: 'knife', at: R(1, 8), name: 'knife' },
        { id: 'dagger', at: R(2, 1), name: 'dagger' },
        { id: 'sword', at: R(2, 5), name: 'sword' },
    ] },
    structures: { label: 'Defensive structures', forms: [
        { id: 'spikes', at: R(1, 3), name: 'spikes (a pit, a few stakes)' },
        { id: 'hedge', at: R(1, 8), name: 'stake ring, spike hedge' },
        { id: 'stones', at: R(2, 5), name: 'stepping-stones' },
        { id: 'slab', at: R(3, 1), name: 'man-high slab' },
        { id: 'walls', at: R(4, 1), name: 'walls, bridges, shelters' },
        { id: 'forts', at: R(5, 1), name: 'fortifications' },
    ] },
    reach: { label: 'Reach', forms: [ // v0.11.4
        { id: 'spear', at: R(1, 8), name: 'bone spear (holds an enemy off)' },
    ] },
    defence: { label: 'Personal defence', forms: [
        { id: 'bracer', at: R(1, 5), name: 'bracer' },
        { id: 'buckler', at: R(2, 1), name: 'buckler' },
        { id: 'shield', at: R(2, 5), name: 'shield' },
        { id: 'plates', at: R(3, 1), name: 'armour plates' },
        { id: 'armour', at: R(5, 1), name: 'full wraithbone armour' },
    ] },
};
const AT = Object.fromEntries(Object.values(FORM_LINES).flatMap((l) => l.forms.map((f) => [f.id, f.at])));

export const cuRank = (g) => { const s = g.james.skills['Convergence Use']; return R(s.tier || 1, s.level || 1); };
/** Can James sing form `id` now? */
export const hasForm = (g, id) => cuRank(g) >= (AT[id] ?? 0);
/** The best form of a line he has (null if none yet), and the next one (also for the James tab). */
export function lineState(g, line) {
    const r = cuRank(g);
    const fs = FORM_LINES[line].forms;
    const now = [...fs].reverse().find((f) => r >= f.at) || null;
    const next = fs.find((f) => r < f.at) || null;
    return { now, next };
}
const tl = (n) => `T${Math.floor((n - 1) / 10) + 1} L${((n - 1) % 10) + 1}`;
export const rankLabel = tl;

/* ---- fights: which actions show, and what they are called ---- */
const best = (g, line) => lineState(g, line).now?.id;
/** v0.11.4: the spear and the spike field (the name is from when they existed only in Incremental Mode, not Story Mode). */
export const INC_ONLY_ACTIONS = new Set(['spear', 'spikes', 'strike', 'throw', 'cover']); // v0.11.82: and the unarmed brawl's three
/** v0.11.82 (owner pick B1): a fight's style. 'unarmed' (Bao's brawl): only the three unarmed actions; 'spar' (Ya's brawl):
 *  only the sung weapon (blade, spear) and guard; no style: every bone action as before. */
export const UNARMED_ACTIONS = new Set(['strike', 'throw', 'cover']);
export const SPAR_ACTIONS = new Set(['blade', 'spear', 'guard']);
export const fightStyle = (g) => g?.combat?.style || null;
export function actionOpen(g, id) {
    const st = fightStyle(g);
    if (st === 'unarmed') return UNARMED_ACTIONS.has(id);
    if (UNARMED_ACTIONS.has(id)) return false;
    if (st === 'spar' && !SPAR_ACTIONS.has(id)) return false;
    if (INC_ONLY_ACTIONS.has(id)) return hasForm(g, id);
    if (id === 'dart') return hasForm(g, 'dart');
    return true;
}
/** Below T1 L8 the knife breaks after every swing (owner's pick a: "if he dies, he dies"). */
export const fragileKnife = (g) => cuRank(g) < AT.knife;
export function actionLabel(g, id, base) {
    if (id === 'dart') return { storm: 'Bone storm', volley: 'Bone volley', lance: 'Thrown bone lance' }[best(g, 'ranged')] || 'Bone darts';
    if (id === 'blade') return { sword: 'Bone sword', dagger: 'Bone dagger', knife: 'Bone knife' }[best(g, 'melee')] || 'Fragile bone knife';
    if (id === 'guard' && fightStyle(g)) return base; // v0.11.82: no armour in a spar
    if (id === 'guard') return { armour: 'Armour up, give ground', plates: 'Plates up, give ground', shield: 'Shield up, give ground', buckler: 'Buckler up, give ground', bracer: 'Bracer up, give ground' }[best(g, 'defence')] || base;
    return base;
}

/* ---- story choices that need a form (hidden until James has it) ---- */
export const STORY_FORMS = [
    [/^A bone dart, thrown from cover/, 'dart'],
    [/^Glassback hare\. A dart from cover/, 'dart'],
    [/a dart on the rise/, 'dart'],
    [/^Darts at /, 'dart'],
    [/^A dart, from a hundred paces/, 'dart'],
    [/ring of bone stakes/, 'spikes'],
    [/bed of bone spikes/, 'spikes'],
    [/^Bone wall between you and them/, 'hedge'],
    [/^Spearheads for the hunters/, 'knife'],
    [/bridge of bone from stone to stone/, 'stones'],
    [/wall of bone/, 'slab'],
];
