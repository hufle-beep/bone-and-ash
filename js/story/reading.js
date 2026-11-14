/**
 * v0.11.182 (owner picks RS1, D1; group e's CM, push 2; the owner 2026-11-14 21:16, word for word in `lore.md` "Selene"):
 * "Read to Ya". At the camp in the hollow inside the Old Tree (`heart_camp`, from 16:00, Days 16–18), once a Coil, while Ya is in
 * the party, James climbs to her ledge and reads her the Ents from his archive; it turns to the Seedlings his people's ships
 * grow. Texts by Fable (rule 10) in reading_texts.js; real names through the editions' slots (core/edition.js, the table in
 * music_texts.js). The ship's sentence by what the party has found (not found / found / the log heard: "Selene"); one closing
 * sentence when she is his lover. 30 minutes, no check, no gain (RS1: her friendship there is 116–123 of 150 at the median).
 * The reading is the day's music or archive line (music.js): the camp shows no line while the choice is open, and none follows.
 * `hc_read` is a world flag (it resets with the Coil).
 */
import { hour } from './common.js';
import { fillRefs } from '../core/edition.js';
import { MUSIC_REFS } from './music_texts.js';
import { READ } from './reading_texts.js';

export { READ };
export const READ_FROM = 16, READ_MIN = 30;
/** The choice shows: Ya in the party, not read this Coil, from 16:00. */
export const readOpen = (g) => !!g.flags.ya_party && !g.flags.hc_read && hour(g) >= READ_FROM;
/** The ship's sentence by what the party knows. */
export const shipState = (g) => (g.flags.log_heard ? 'named' : g.flags.ship_found ? 'found' : 'notfound');
export const readText = (g) => fillRefs(READ.text.replace('{SHIP}', READ.ship[shipState(g)]).replace('{LOVER}', g.flags.ya_romance ? READ.lover : '').trim(), MUSIC_REFS);

export const SCENES_READ = {
    heart_read: {
        id: 'heart_read', title: 'The Ledge', art: 'night_watch', place: 'Inside the Old Tree — Ya\'s ledge',
        text: readText,
        choices: [{ text: READ.sleep, to: 'heart_night' }],
    },
};

/** The choice on the Heart's camp, appended last (no choice position changes). */
export function installReading(SCENES) {
    Object.assign(SCENES, SCENES_READ);
    const s = SCENES.heart_camp;
    if (!s) return;
    s.choices.push({ text: READ.label, show: readOpen, time: READ_MIN, do: (g) => { g.flags.hc_read = true; return []; }, to: 'heart_read' });
}
